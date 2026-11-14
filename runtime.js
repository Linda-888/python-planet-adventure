// ============================================================
//  Python 运行时（在浏览器里的 Pyodide 中执行）
//  run_code(code, check, stdin_json)
//    code       玩家代码
//    check      可选的检查代码（用 assert；能读到玩家的变量、_stdout 输出、_code 源码）
//    stdin_json 预先准备好的输入（JSON 数组），玩家代码里的 input() 会依次取用
//  返回 JSON：{ok, stdout, error:{line,type,msg}, check_msg, inputs_used}
// ============================================================
const PY_RUNTIME = String.raw`
import sys, io, json, re

USER_FILE = "<你的代码>"
MAX_LINES = 200000   # 最多执行多少行，防止死循环卡死页面


class StepLimit(Exception):
    pass


def _make_tracer(limit):
    count = [0]

    def tracer(frame, event, arg):
        if event == "line":
            count[0] += 1
            if count[0] > limit:
                raise StepLimit("代码运行了太久还没结束，可能是死循环：检查 while 的条件会不会变成 False。")
        return tracer

    return tracer


def _user_line(tb):
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
            return "缩进错误：这一行多缩进了，前面不该有空格。"
        if "expected an indented block" in msg:
            return "缩进错误：冒号后面的下一行需要缩进 4 个空格。"
        if "unindent does not match" in msg:
            return "缩进错误：这一行的缩进和上面对不齐。"
        return "缩进错误：" + msg
    if "expected ':'" in msg:
        return "语法错误：这一行末尾少了冒号 :"
    if "was never closed" in msg:
        return "语法错误：括号或引号没有配对关闭。"
    if "unterminated string" in msg:
        return "语法错误：字符串的引号没有配对。"
    if "invalid character" in msg:
        return "语法错误：出现了 Python 不认识的字符（是不是用了中文标点？引号、括号、冒号要用英文的）。"
    if "cannot assign" in msg or "Maybe you meant '=='" in msg:
        return "语法错误：判断是否相等要用两个等号 ==，一个等号 = 是赋值。"
    if "invalid syntax" in msg:
        return "语法错误：Python 看不懂这一行。检查一下拼写、括号、冒号和引号（要用英文标点）。"
    return "语法错误：" + msg


def _friendly(e):
    msg = str(e)
    if isinstance(e, NameError):
        m = re.search(r"name '([^']+)' is not defined", msg)
        who = m.group(1) if m else "?"
        if who in ("true", "false"):
            return "找不到名字 '%s'。布尔值要首字母大写：True / False。" % who
        return "找不到名字 '%s'。是不是拼错了，或者文字忘了加引号，或者还没给这个变量赋值？" % who
    if isinstance(e, TypeError):
        if "not supported between instances of 'str' and 'int'" in msg or "not supported between instances of 'int' and 'str'" in msg:
            return "类型错误：字符串不能和数字比较大小。input() 得到的是字符串，先用 int() 转换成数字。"
        if "can only concatenate str" in msg or "must be str, not" in msg:
            return "类型错误：字符串只能和字符串相加。想拼接数字要先 str(数字)，想做加法要先 int(文字)。"
        if "'tuple' object does not support item assignment" in msg:
            return "类型错误：元组创建后不能修改。需要修改就用列表 [ ]。"
        if "'str' object does not support item assignment" in msg:
            return "类型错误：字符串不能修改其中的某个字符，可以用切片或拼接造一个新字符串。"
        if "object is not iterable" in msg:
            return "类型错误：这个值不能用 for 遍历：" + msg
        if "'NoneType' object" in msg:
            return "类型错误：这个值是 None（空）。是不是用了 sort()、append() 这类不返回值的方法的结果？"
        if "unsupported operand" in msg:
            return "类型错误：这两种类型不能这样运算：" + msg
        if "not callable" in msg:
            return "你给一个不是函数的东西加了括号去调用：" + msg
        if "argument" in msg:
            return "函数的参数不对：" + msg
        if "not subscriptable" in msg:
            return "类型错误：这个值不能用 [ ] 取元素：" + msg
        return "类型错误：" + msg
    if isinstance(e, ValueError):
        if "invalid literal for int()" in msg:
            return "值错误：这段文字没法变成整数：" + msg.split(":", 1)[-1].strip()
        if "not in list" in msg:
            return "值错误：列表里没有这个元素：" + msg
        if "not enough values to unpack" in msg or "too many values to unpack" in msg:
            return "值错误：解包时左右两边的数量不一样：" + msg
        return "值不合适：" + msg
    if isinstance(e, IndexError):
        return "下标超出范围（位置从 0 数起，最大是 长度-1）：" + msg
    if isinstance(e, KeyError):
        return "字典里没有这个键：" + msg
    if isinstance(e, ZeroDivisionError):
        return "除数不能为 0。"
    if isinstance(e, RecursionError):
        return "函数一直在调用自己，停不下来（递归太深）。"
    if isinstance(e, AttributeError):
        return "属性错误（这个类型没有这个方法，检查拼写）：" + msg
    return "%s: %s" % (type(e).__name__, msg)


def run_code(code, check="", stdin_json="[]"):
    lines = [str(x) for x in json.loads(stdin_json or "[]")]
    used = []

    def _input(prompt=""):
        sys.stdout.write(str(prompt))
        if not lines:
            raise RuntimeError("程序又调用了一次 input()，但这个练习准备的输入已经用完了。")
        v = lines.pop(0)
        used.append(v)
        sys.stdout.write(v + "\n")   # 像在终端里一样，把输入的内容回显出来
        return v

    ns = {"__name__": "__main__", "input": _input}
    out = io.StringIO()
    result = {"ok": False, "stdout": "", "error": None, "check_msg": None, "inputs_used": used}

    try:
        compiled = compile(code, USER_FILE, "exec")
    except SyntaxError as e:
        result["error"] = {"line": e.lineno, "type": type(e).__name__, "msg": _friendly_syntax(e)}
        return json.dumps(result, ensure_ascii=False)

    old_stdout = sys.stdout
    sys.stdout = out
    sys.settrace(_make_tracer(MAX_LINES))
    try:
        exec(compiled, ns)
        result["ok"] = True
    except StepLimit as e:
        result["error"] = {"line": _user_line(e.__traceback__), "type": "StepLimit", "msg": str(e)}
    except BaseException as e:
        result["error"] = {"line": _user_line(e.__traceback__), "type": type(e).__name__, "msg": _friendly(e)}
    finally:
        sys.settrace(None)
        sys.stdout = old_stdout

    result["stdout"] = out.getvalue()

    # 检查代码：可以用 assert 检查变量、_stdout（输出）和 _code（源代码）
    if result["ok"] and check:
        ns["_stdout"] = result["stdout"]
        ns["_code"] = code
        try:
            exec(check, ns)
        except AssertionError as e:
            result["ok"] = False
            result["check_msg"] = str(e) or "检查没有通过。"
        except BaseException as e:
            result["ok"] = False
            result["check_msg"] = "检查时出错：" + _friendly(e)

    return json.dumps(result, ensure_ascii=False)
`;
