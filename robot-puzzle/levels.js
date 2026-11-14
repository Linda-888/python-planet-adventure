// ============================================================
//  关卡数据
//  想加新关卡？在 LEVELS 数组末尾加一个对象就行，字段说明见 README.md
//  坐标系：x 向右增大，y 向下增大，左上角是 (0, 0)
//  方向 dir：0=东(右) 1=南(下) 2=西(左) 3=北(上)
// ============================================================

// 指令表：每关通过 commands 字段选择显示哪些
const COMMANDS = {
  move:           { sig: "move(n=1)",        desc: "向前走 n 格（不写 n 就是 1 格），撞墙会失败" },
  turn_left:      { sig: "turn_left()",      desc: "向左转 90°" },
  turn_right:     { sig: "turn_right()",     desc: "向右转 90°" },
  front_is_clear: { sig: "front_is_clear()", desc: "前面能走吗？返回 True / False" },
  on_gem:         { sig: "on_gem()",         desc: "脚下有宝石吗？返回 True / False" },
  pick:           { sig: "pick()",           desc: "捡起脚下的宝石（没有宝石会失败）" },
  at_goal:        { sig: "at_goal()",        desc: "到终点了吗？返回 True / False" },
  print:          { sig: "print(...)",       desc: "让机器人说话，内容显示在输出面板，调试很好用" },
};

// ---- 画地图的小工具 ----
// 把 open 之外的所有格子变成墙（用来画走廊 / 楼梯 / 迷宫）
function wallsExcept(width, height, open) {
  const ok = new Set(open.map(([x, y]) => `${x},${y}`));
  const walls = [];
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (!ok.has(`${x},${y}`)) walls.push([x, y]);
  return walls;
}
// 第 y 行，从 x0 到 x1（含）的所有格子
function row(y, x0, x1) { const r = []; for (let x = x0; x <= x1; x++) r.push([x, y]); return r; }
// 第 x 列，从 y0 到 y1（含）的所有格子
function col(x, y0, y1) { const r = []; for (let y = y0; y <= y1; y++) r.push([x, y]); return r; }

// 第 8 关的地图：两段楼梯夹一条走廊
const STAIRS_PATH = [
  [0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2], [3, 3],   // 楼梯 ×3
  [4, 3], [5, 3], [6, 3],                                   // 走廊
  [7, 3], [7, 4], [8, 4], [8, 5], [9, 5], [9, 6],           // 楼梯 ×3
];

// 第 9 关的地图：一个只需要"右转"就能走通的螺旋迷宫
const SPIRAL_PATH = [
  ...row(0, 0, 8), ...col(8, 1, 6), ...row(6, 0, 7), ...col(0, 2, 5),
  ...row(2, 1, 6), ...col(6, 3, 4), ...row(4, 2, 5),
];

const LEVELS = [
  // ---------------------------------------------------------- 1
  {
    id: 1,
    title: "启动机器人",
    concept: "函数调用",
    story: "欢迎来到 Py 实验室！这台机器人只听得懂 Python。实验室的第一层是一条走廊，先让它动起来吧。",
    goal: "让机器人走到 🚩 终点。",
    teach: `
<p>在 Python 里，<b>函数</b>就是一条有名字的指令。调用函数要写名字，再加一对小括号：</p>
<pre>move()      # 向前走 1 格</pre>
<p>括号里可以放<b>参数</b>，告诉函数"做多少"：</p>
<pre>move(3)     # 向前走 3 格</pre>
<p>一行写一条指令，机器人会<b>从上到下</b>逐条执行。<code>#</code> 后面是注释，机器人会忽略。</p>`,
    hint: "终点离机器人 4 格远。可以写 4 次 move()，也可以直接 move(4)。",
    commands: ["move"],
    starter: "# 在下面写代码，让机器人走到旗子那里\nmove()\n",
    solution: "move(4)",
    variants: [
      { width: 7, height: 3, start: [1, 1], dir: 0, goal: [5, 1], walls: wallsExcept(7, 3, row(1, 0, 6)) },
    ],
  },

  // ---------------------------------------------------------- 2
  {
    id: 2,
    title: "拐角",
    concept: "顺序执行",
    story: "第二层的走廊拐了个弯。机器人不会自己转向，你得告诉它什么时候转。",
    goal: "走到拐角处右转，再走到 🚩。",
    teach: `
<p>两个新指令：</p>
<pre>turn_right()    # 向右转 90°，原地不动
turn_left()     # 向左转 90°</pre>
<p>程序是<b>按顺序</b>一行一行执行的：先走，再转，再走。顺序错了，机器人就会走错路。</p>
<p>动手试试：先写 <code>move(4)</code> 运行看看机器人停在哪里，再补上后面的指令。<b>一边运行一边改</b>是写代码最常用的办法。</p>`,
    hint: "先走 4 格到拐角，turn_right()，再走 3 格。",
    commands: ["move", "turn_left", "turn_right"],
    starter: "move(4)\n",
    solution: "move(4)\nturn_right()\nmove(3)",
    variants: [
      { width: 7, height: 6, start: [1, 1], dir: 0, goal: [5, 4], walls: wallsExcept(7, 6, [...row(1, 1, 5), ...col(5, 2, 4)]) },
    ],
  },

  // ---------------------------------------------------------- 3
  {
    id: 3,
    title: "楼梯",
    concept: "for 循环",
    story: "第三层是一段楼梯，每级台阶都一样：走一格、右转、走一格、左转。手动写 20 行也能过，但这关限制你只能写 5 行。",
    goal: "沿着楼梯走到 🚩。本关最多 5 行代码。",
    teach: `
<p>要重复做同一件事，不用复制粘贴，用 <b>for 循环</b>：</p>
<pre>for i in range(3):
    move()
    turn_right()</pre>
<p>意思是"把缩进的这两行重复 3 次"。注意两点：</p>
<ul>
<li><code>for</code> 那一行末尾有<b>冒号 :</b></li>
<li>要重复的代码要<b>缩进 4 个空格</b>——缩进决定了哪些代码属于循环</li>
</ul>
<p><code>range(3)</code> 产生 0、1、2 三个数，所以循环 3 次。<code>i</code> 是循环变量，这关用不到它，但必须写。</p>`,
    hint: "每一级台阶都是：move() → turn_right() → move() → turn_left()。一共 5 级，所以是 range(5)。",
    commands: ["move", "turn_left", "turn_right"],
    starter: "# 这关最多 5 行，用 for 循环重复\n",
    solution: "for i in range(5):\n    move()\n    turn_right()\n    move()\n    turn_left()",
    maxLines: 5,
    variants: [
      {
        width: 7, height: 7, start: [0, 0], dir: 0, goal: [5, 5],
        walls: wallsExcept(7, 7, [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2], [3, 3], [4, 3], [4, 4], [5, 4], [5, 5]]),
      },
    ],
  },

  // ---------------------------------------------------------- 4
  {
    id: 4,
    title: "未知的距离",
    concept: "变量",
    story: "第四层的走廊每次进来长度都不一样！不过传感器已经测好了距离，存在一个叫 distance 的变量里。",
    goal: "走到 🚩。本关有 3 组隐藏测试，走廊长度各不相同。",
    teach: `
<p><b>变量</b>就是一个贴了名字的盒子，里面装着值：</p>
<pre>steps = 5        # 把 5 装进叫 steps 的盒子
move(steps)      # 等于 move(5)
steps = steps + 1    # 盒子里现在是 6</pre>
<p>这一关游戏已经帮你准备好了变量 <code>distance</code>，里面装着到终点的格数。想看看它是几？用 <code>print(distance)</code>。</p>
<p>注意任务里的<b>隐藏测试</b>：你的代码会用 3 个不同的 distance 各跑一次，全部到达终点才算过关——所以写死 <code>move(6)</code> 是行不通的。</p>`,
    hint: "move(distance) 就能走对格数。或者 for i in range(distance): move()。",
    commands: ["move", "turn_left", "turn_right", "print"],
    starter: "print(distance)   # 先看看这个变量里是什么\n",
    solution: "move(distance)",
    variants: [3, 6, 8].map((d) => ({
      width: 10, height: 3, start: [0, 1], dir: 0, goal: [d, 1],
      walls: wallsExcept(10, 3, row(1, 0, 9)), vars: { distance: d },
    })),
  },

  // ---------------------------------------------------------- 5
  {
    id: 5,
    title: "捡宝石",
    concept: "if 判断",
    story: "第五层散落着能源宝石 💎，机器人得全部捡起来。但宝石的位置每次都不一样，在没有宝石的地方 pick() 会卡住机器人。",
    goal: "捡起走廊里所有的 💎，然后走到 🚩。走廊一共 8 步。",
    teach: `
<p><b>if 判断</b>让代码"看情况办事"：</p>
<pre>if on_gem():
    pick()</pre>
<p><code>on_gem()</code> 会返回 <code>True</code>（真）或 <code>False</code>（假），这种值叫<b>布尔值</b>。只有条件为 True 时，缩进里的代码才会执行；否则直接跳过。</p>
<p>if 可以放进循环里，这样每走一步都检查一次：</p>
<pre>for i in range(...):
    move()
    if ...:
        ...</pre>
<p>注意 if 里面的代码要再缩进一层（8 个空格）。</p>`,
    hint: "循环 8 次：先 move()，再 if on_gem(): pick()。",
    commands: ["move", "turn_left", "turn_right", "on_gem", "pick", "print"],
    starter: "for i in range(8):\n    move()\n",
    solution: "for i in range(8):\n    move()\n    if on_gem():\n        pick()",
    variants: [
      [[2, 1], [5, 1]],
      [[1, 1], [4, 1], [7, 1]],
      [[3, 1]],
    ].map((gems) => ({
      width: 9, height: 3, start: [0, 1], dir: 0, goal: [8, 1],
      walls: wallsExcept(9, 3, row(1, 0, 8)), gems,
    })),
  },

  // ---------------------------------------------------------- 6
  {
    id: 6,
    title: "黑暗走廊",
    concept: "while 循环",
    story: "第六层灯坏了，传感器也没数据。你不知道走廊有多长，只知道走到墙就是终点。",
    goal: "一直走到墙前面的 🚩。本关有 3 组隐藏测试，走廊长度不同且没有变量告诉你。",
    teach: `
<p><b>while 循环</b>：只要条件成立，就一直重复。</p>
<pre>while front_is_clear():
    move()</pre>
<p>每次循环开始前都会重新检查条件，一旦前面是墙，循环就结束。</p>
<p>和 for 的区别：<b>for</b> 适合"知道要重复几次"，<b>while</b> 适合"不知道几次，只知道什么时候停"。</p>
<p>⚠️ 如果条件永远为真，程序就会卡住，这叫<b>死循环</b>。游戏会在机器人做了 500 个动作后强制停止。</p>`,
    hint: "条件用 front_is_clear()：前面能走就 move()，走到墙前自然停下。",
    commands: ["move", "turn_left", "turn_right", "front_is_clear", "print"],
    starter: "# 不知道要走几步，试试 while\n",
    solution: "while front_is_clear():\n    move()",
    variants: [4, 7, 11].map((len) => ({
      width: 13, height: 3, start: [0, 1], dir: 0, goal: [len, 1],
      walls: wallsExcept(13, 3, row(1, 0, len)),
    })),
  },

  // ---------------------------------------------------------- 7
  {
    id: 7,
    title: "路线图",
    concept: "列表",
    story: "第七层是开阔的大厅，终点藏在某个位置。控制台给了你一张路线图 route：每个数字表示向前走几格，每走完一段就右转一次。",
    goal: "按照 route 走到 🚩。本关有 3 组隐藏测试，路线各不相同。",
    teach: `
<p><b>列表</b>可以把很多值装在一起：</p>
<pre>route = [3, 1, 2]
print(route[0])      # 3，第一个元素（下标从 0 开始）
print(len(route))    # 3，列表的长度</pre>
<p>用 for 可以依次取出列表里的每个值：</p>
<pre>for d in route:
    print(d)         # 依次打印 3、1、2</pre>
<p>这一关的 <code>route</code> 已经准备好了。先 <code>print(route)</code> 看看它长什么样，再想想循环里每一段要做哪两件事。</p>`,
    hint: "for d in route: 里面写 move(d) 然后 turn_right()。",
    commands: ["move", "turn_left", "turn_right", "print"],
    starter: "print(route)\n",
    solution: "for d in route:\n    move(d)\n    turn_right()",
    variants: [
      { route: [5, 3, 4, 2], goal: [1, 1] },
      { route: [4, 2, 2, 1], goal: [2, 1] },
      { route: [6, 4, 3, 3], goal: [3, 1] },
    ].map(({ route, goal }) => ({
      width: 8, height: 5, start: [0, 0], dir: 0, goal, walls: [], vars: { route },
    })),
  },

  // ---------------------------------------------------------- 8
  {
    id: 8,
    title: "自定义指令",
    concept: "def 定义函数",
    story: "第八层有两段一样的楼梯，中间隔着一条走廊。机器人没有“上台阶”这个指令——不过你可以自己造一个。",
    goal: "走到 🚩。必须用 def 定义至少一个自己的函数。",
    teach: `
<p>用 <b>def</b> 可以把几条指令打包成一个新函数——相当于教机器人一个新词：</p>
<pre>def turn_around():
    turn_left()
    turn_left()

turn_around()      # 调用它，机器人转身 180°</pre>
<p>两点要注意：</p>
<ul>
<li><b>定义</b>函数时代码不会执行，<b>调用</b>时才会</li>
<li>函数要先定义、后调用（定义写在上面）</li>
</ul>
<p>定义好的函数可以反复调用，也可以放进循环里。这一关：把"上一级台阶"写成函数，再用两次循环。</p>`,
    hint: "def step(): 里面是 move()、turn_right()、move()、turn_left()。然后：3 次 step()，move(3)，再 3 次 step()。",
    commands: ["move", "turn_left", "turn_right", "front_is_clear", "print"],
    starter: "def step():\n    # 在这里写\"上一级台阶\"的 4 条指令\n    \n\n# 下面调用 step()\n",
    solution: "def step():\n    move()\n    turn_right()\n    move()\n    turn_left()\n\nfor i in range(3):\n    step()\nmove(3)\nfor i in range(3):\n    step()",
    requireDef: true,
    variants: [
      { width: 11, height: 8, start: [0, 0], dir: 0, goal: [9, 6], walls: wallsExcept(11, 8, STAIRS_PATH) },
    ],
  },

  // ---------------------------------------------------------- 9
  {
    id: 9,
    title: "螺旋迷宫",
    concept: "综合：while + if/else",
    story: "最后一层是一座迷宫。你看得到地图，机器人看不到——但它有 front_is_clear() 和 at_goal() 两个传感器。想一个“走迷宫的规则”，让机器人自己找到出口。",
    goal: "走到迷宫中心的 🚩。",
    teach: `
<p>把学过的东西组合起来。两个新朋友：</p>
<pre>if front_is_clear():
    move()
else:
    turn_left()      # 否则：条件不成立时执行</pre>
<p><code>else</code> 是 if 的"否则"分支。</p>
<pre>while not at_goal():     # "还没到终点"就继续
    ...</pre>
<p><code>not</code> 把 True 变成 False、False 变成 True。</p>
<p>观察一下地图：这个迷宫只需要一条规则——<b>能走就走，不能走就转向</b>。往哪边转？看看第一个拐角。</p>`,
    hint: "while not at_goal(): 里面 if front_is_clear(): move() else: turn_right()。",
    commands: ["move", "turn_left", "turn_right", "front_is_clear", "at_goal", "print"],
    starter: "while not at_goal():\n    \n",
    solution: "while not at_goal():\n    if front_is_clear():\n        move()\n    else:\n        turn_right()",
    variants: [
      { width: 9, height: 7, start: [0, 0], dir: 0, goal: [2, 4], walls: wallsExcept(9, 7, SPIRAL_PATH) },
    ],
  },
];
