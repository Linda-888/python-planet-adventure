// ============================================================
//  机器人世界的 Python 运行时
//  这段 Python 代码会在浏览器里的 Pyodide 中执行。
//  玩家写的代码调用 move() / turn_left() 等函数，这里负责：
//    1. 模拟机器人在网格里的移动，记录每一步（log）
//    2. 检查撞墙、死循环、非法参数
//    3. 判断是否过关，并把错误翻译成中文提示
//  用 String.raw 包裹，这样 Python 里的 "\n" 不会被 JS 提前转义。
// ============================================================
const PY_RUNTIME = String.raw`
import sys, json, re

USER_FILE = "<你的代码>"
MAX_ACTIONS = 500      # 机器人最多做多少个动作（防死循环）
MAX_LINES = 20000      # 最多执行多少行代码（防 while True: pass）

# 方向：0=东(右) 1=南(下) 2=西(左) 3=北(上)
DIRS = [(1, 0), (0, 1), (-1, 0), (0, -1)]


class RobotError(Exception):
    """机器人执行指令时出的错（撞墙、乱捡宝石……）"""


class StepLimit(Exception):
    """运行太久，可能是死循环"""


class World:
    def __init__(self, cfg):
        self.w = cfg["width"]
        self.h = cfg["height"]
        self.walls = set(tuple(p) for p in cfg.get("walls", []))
        self.gems = set(tuple(p) for p in cfg.get("gems", []))
        self.goal = tuple(cfg["goal"]) if cfg.get("goal") is not None else None
        self.x, self.y = cfg["start"]
        self.dir = cfg.get("dir", 0)
        self.picked = 0
        self.actions = 0
        self.log = []

    # ---- 内部工具 ----
    def _blocked(self, x, y):
        return x < 0 or y < 0 or x >= self.w or y >= self.h or (x, y) in self.walls

    def _tick(self):
        self.actions += 1
        if self.actions > MAX_ACTIONS:
            raise StepLimit("机器人已经做了 %d 个动作还没停下来，可能是死循环。" % MAX_ACTIONS)

    # ---- 玩家可以调用的指令 ----
    def move(self, n=1):
        if isinstance(n, bool) or not isinstance(n, int):
            raise RobotError("move() 的参数必须是整数，比如 move(3)。你给的是 %r" % (n,))
        if n < 0:
            raise RobotError("move() 不能走负数步。")
        for _ in range(n):
            self._tick()
            dx, dy = DIRS[self.dir]
            nx, ny = self.x + dx, self.y + dy
            if self._blocked(nx, ny):
                self.log.append({"t": "crash", "x": nx, "y": ny})
                raise RobotError("撞墙了！机器人在 (%d, %d)，前面没有路。" % (self.x, self.y))
            self.x, self.y = nx, ny
            self.log.append({"t": "move", "x": nx, "y": ny})

    def turn_left(self):
        self._tick()
        self.dir = (self.dir - 1) % 4
        self.log.append({"t": "turn", "d": self.dir})

    def turn_right(self):
        self._tick()
        self.dir = (self.dir + 1) % 4
        self.log.append({"t": "turn", "d": self.dir})

    def front_is_clear(self):
        dx, dy = DIRS[self.dir]
        return not self._blocked(self.x + dx, self.y + dy)

    def on_gem(self):
        return (self.x, self.y) in self.gems

    def at_goal(self):
        return self.goal is not None and (self.x, self.y) == self.goal

    def pick(self):
        self._tick()
        if (self.x, self.y) not in self.gems:
            raise RobotError("这里没有宝石，不能 pick()。先用 on_gem() 判断一下。")
        self.gems.discard((self.x, self.y))
        self.picked += 1
        self.log.append({"t": "pick", "x": self.x, "y": self.y})

    def say(self, *args, sep=" ", end="\n", **kwargs):
        """替代 print()：把文字显示在输出面板"""
        text = sep.join(str(a) for a in args)
        self.log.append({"t": "say", "text": text})

    # ---- 过关判定 ----
    def won(self):
        if self.gems:
            return False
        if self.goal is not None and (self.x, self.y) != self.goal:
            return False
        return True

    def fail_reason(self):
        if self.gems:
            return "代码跑完了，但还有 %d 颗宝石没捡。" % len(self.gems)
        if self.goal is not None and (self.x, self.y) != self.goal:
            return "代码跑完了，机器人停在 (%d, %d)，没有到达终点 (%d, %d)。" % (
                self.x, self.y, self.goal[0], self.goal[1])
        return None


def _make_tracer(limit):
    """每执行一行代码计数一次，超过上限就打断（对付 while True: pass）"""
    count = [0]

    def tracer(frame, event, arg):
        if event == "line":
            count[0] += 1
            if count[0] > limit:
                raise StepLimit("代码运行了太久还没结束，可能是死循环（比如 while 的条件永远为真）。")
        return tracer

    return tracer


def _user_line(tb):
    """从 traceback 里找出玩家代码的出错行号"""
    line = None
    while tb is not None:
        if tb.tb_frame.f_code.co_filename == USER_FILE:
            line = tb.tb_lineno
        tb = tb.tb_next
    return line


def _friendly_syntax(e):
    msg = e.msg or ""
    if isinstance(e, IndentationError):
        if "unexpected indent" in msg:
            return "缩进错误：这一行多缩进了。只有 for / if / while / def 的下一行才需要缩进。"
        if "expected an indented block" in msg:
            return "缩进错误：冒号后面的下一行需要缩进 4 个空格。"
        if "unindent does not match" in msg:
            return "缩进错误：这一行的缩进和上面对不齐，同一层代码的缩进要一样。"
        return "缩进错误：" + msg
    if "expected ':'" in msg:
        return "语法错误：这一行末尾少了冒号 :"
    if "was never closed" in msg:
        return "语法错误：括号或引号没有配对关闭。"
    if "unterminated string" in msg:
        return "语法错误：字符串的引号没有配对。"
    if "invalid syntax" in msg:
        return "语法错误：Python 看不懂这一行。检查一下拼写、括号、冒号和引号。"
    return "语法错误：" + msg


def _friendly(e):
    msg = str(e)
    if isinstance(e, NameError):
        m = re.search(r"name '([^']+)' is not defined", msg)
        who = m.group(1) if m else "?"
        return "找不到名字 '%s'。是不是拼错了？看看右边的指令表。" % who
    if isinstance(e, TypeError):
        if "not callable" in msg:
            return "你给一个不是函数的东西加了括号去调用：" + msg
        if "argument" in msg:
            return "函数的参数不对：" + msg
        if "unsupported operand" in msg or "can only concatenate" in msg:
            return "类型不匹配，不能这样运算：" + msg
        return "类型错误：" + msg
    if isinstance(e, IndexError):
        return "下标超出范围（列表下标从 0 开始，最大是 len-1）：" + msg
    if isinstance(e, KeyError):
        return "字典里没有这个键：" + msg
    if isinstance(e, ZeroDivisionError):
        return "除数不能为 0。"
    if isinstance(e, ValueError):
        return "值不合适：" + msg
    if isinstance(e, RecursionError):
        return "函数一直在调用自己，停不下来（递归太深）。"
    if isinstance(e, AttributeError):
        return "属性错误：" + msg
    return msg


def run_level(code, cfg_json, require_def=False):
    """运行一段玩家代码，返回 JSON 字符串：{ok, won, error, log, final}"""
    cfg = json.loads(cfg_json)
    world = World(cfg)

    # 玩家代码的命名空间：注入机器人指令和本关变量
    ns = {"__name__": "__main__"}
    for name in ("move", "turn_left", "turn_right", "front_is_clear", "on_gem", "pick", "at_goal"):
        ns[name] = getattr(world, name)
    ns["print"] = world.say

    def _no_input(*a, **k):
        raise RobotError("这个游戏里不能用 input()。")
    ns["input"] = _no_input

    for k, v in cfg.get("vars", {}).items():
        ns[k] = v

    result = {"ok": False, "won": False, "error": None, "log": world.log}

    try:
        compiled = compile(code, USER_FILE, "exec")
    except SyntaxError as e:
        result["error"] = {"line": e.lineno, "type": type(e).__name__, "msg": _friendly_syntax(e)}
        return json.dumps(result, ensure_ascii=False)

    sys.settrace(_make_tracer(MAX_LINES))
    try:
        exec(compiled, ns)
    except (RobotError, StepLimit) as e:
        result["error"] = {"line": _user_line(e.__traceback__), "type": type(e).__name__, "msg": str(e)}
    except BaseException as e:
        result["error"] = {"line": _user_line(e.__traceback__), "type": type(e).__name__, "msg": _friendly(e)}
    finally:
        sys.settrace(None)

    if result["error"] is None and require_def:
        user_funcs = [
            k for k, v in ns.items()
            if callable(v) and getattr(v, "__code__", None) is not None
            and v.__code__.co_filename == USER_FILE
        ]
        if not user_funcs:
            result["error"] = {"line": None, "type": "Rule", "msg": "这一关要求你用 def 定义至少一个自己的函数。"}

    if result["error"] is None:
        result["won"] = world.won()
        if not result["won"]:
            result["error"] = {"line": None, "type": "NotDone", "msg": world.fail_reason()}

    result["ok"] = result["error"] is None
    result["final"] = {"x": world.x, "y": world.y, "dir": world.dir}
    return json.dumps(result, ensure_ascii=False)
`;
