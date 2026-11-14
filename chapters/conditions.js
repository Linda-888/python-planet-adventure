// 第 2 章：条件判断
defineChapter("conditions", [
  // ---------------------------------------------------------------- 1
  {
    id: "input",
    title: "input：和用户对话",
    summary: "input() 暂停等待用户输入，返回的永远是字符串；要算数先 int()。",
    steps: [
      {
        type: "learn",
        text: `<p><code>input()</code> 让程序停下来等用户敲一行字，括号里的文字是提示语。用户按回车后，输入的内容作为<b>字符串</b>返回。</p>
<p>注意：<b>不管用户输入什么，拿到的都是字符串</b>。输入 12 得到的是 "12"，要算数得先 <code>int()</code>。</p>
<p>在这个游戏里，练习会<b>自动替你输入</b>，输入的内容会显示在输出里（就像在终端里敲的一样）。</p>`,
        code: `name = input("你叫什么名字？")\nprint("你好，" + name + "！")\n\nage = input("你几岁？")\nprint(type(age))     # 永远是 str\nprint(int(age) + 1)  # 转成数字再算`,
        stdin: ["小明", "12"],
        tip: "把 int(age) + 1 改成 age + 1 再运行，看看会报什么错。",
      },
      {
        type: "fill",
        prompt: "把空填上，让程序读入年龄后输出明年的年龄（自动输入 17，应输出 18）。",
        code: `age = ____(input("你几岁？"))\nprint(age + 1)`,
        stdin: ["17"],
        expectContains: ["18"],
        check: `assert "18.0" not in _stdout, "要的是整数 18，不是 18.0——用把文字变成整数的那个函数"`,
        placeholder: "函数名",
        hint: "input() 给的是字符串，要用哪个函数把它变成整数？",
        solution: ["int"],
      },
      {
        type: "code",
        prompt: "用 <code>input()</code> 问用户最喜欢的颜色，然后输出一行：<b>我也喜欢蓝色！</b>（自动输入的是 蓝色）",
        starter: "",
        stdin: ["蓝色"],
        expectContains: ["我也喜欢蓝色！"],
        mustMatch: `input\\(`,
        mustMatchMsg: "要用 input() 来读入颜色，不要直接写死。",
        hint: `color = input("你最喜欢什么颜色？")\nprint(f"我也喜欢{color}！")`,
        solution: `color = input("你最喜欢什么颜色？")\nprint(f"我也喜欢{color}！")`,
      },
    ],
  },
  // ---------------------------------------------------------------- 2
  {
    id: "if",
    title: "if：如果……就……",
    summary: "if 条件: 后面缩进的代码只在条件为 True 时执行。",
    steps: [
      {
        type: "learn",
        text: `<p><b>if</b> 让程序"看情况办事"：</p>
<pre>if 条件:
    条件成立时做的事</pre>
<p>三个要点：条件后面有<b>冒号</b>；下面的代码要<b>缩进 4 个空格</b>；缩进的那几行是一个整体，叫"代码块"。没缩进的代码不属于 if，总会执行。</p>`,
        code: `age = 20\nif age >= 18:\n    print("成年了")\n    print("可以考驾照")\nprint("程序结束")   # 没缩进，不属于 if，总会执行`,
        tip: "把 age 改成 15 再运行，哪几行还会输出？",
      },
      {
        type: "predict",
        prompt: "这段代码会输出什么？",
        code: `x = 3\nif x > 5:\n    print("大")\nprint("完")`,
        options: ["大\n完", "完", "报错"],
        answer: 1,
        explain: "3 > 5 不成立，缩进里的 print(\"大\") 被跳过。print(\"完\") 没有缩进，不属于 if，所以照常执行。",
      },
      {
        type: "code",
        prompt: "变量 <code>temp = 38.5</code> 是体温。如果 temp 大于 37.5，输出 <b>发烧了，多休息</b>。",
        starter: "temp = 38.5\n",
        expect: "发烧了，多休息",
        mustMatch: `if\\s`,
        mustMatchMsg: "要用 if 来判断。",
        check: `assert "temp" in _code.replace("temp = 38.5", ""), "要用变量 temp 来判断"`,
        hint: "if temp > 37.5:\n    print(\"发烧了，多休息\")",
        solution: `temp = 38.5\nif temp > 37.5:\n    print("发烧了，多休息")`,
      },
    ],
  },
  // ---------------------------------------------------------------- 3
  {
    id: "else",
    title: "else：否则",
    summary: "if / else 两个分支只会走一个；else 后面不写条件。",
    steps: [
      {
        type: "learn",
        text: `<p><b>else</b> 是 if 的"否则"：条件不成立时执行。else 后面不写条件，直接冒号。</p>
<p>两个分支<b>只会走一个</b>。</p>
<p>常见错误：用 input() 读入的是字符串，拿它和数字比较会报错——先 int()。</p>`,
        code: `age = int(input("你几岁？"))\nif age >= 18:\n    print("成年了")\nelse:\n    print("未成年")\nprint("欢迎光临")`,
        stdin: ["15"],
        tip: "去掉 int( ) 再运行，读一读报错信息——以后一定会遇到它。",
      },
      {
        type: "predict",
        prompt: "这段代码会输出什么？",
        code: `score = 59\nif score >= 60:\n    print("及格")\nelse:\n    print("不及格")\nprint("再接再厉")`,
        options: ["不及格", "不及格\n再接再厉", "及格\n再接再厉"],
        answer: 1,
        explain: "59 >= 60 不成立，走 else 分支输出 不及格。最后一行没缩进，不属于 if/else，总会执行。",
      },
      {
        type: "code",
        prompt: "用 <code>input()</code> 读入分数，大于等于 60 输出 <b>及格</b>，否则输出 <b>不及格</b>。程序会用两个不同的输入各测一次。",
        starter: `score = int(input("分数？"))\n`,
        cases: [
          { stdin: ["85"], check: `assert "及格" in _stdout and "不及格" not in _stdout, "输入 85 时应该输出 及格"` },
          { stdin: ["40"], check: `assert "不及格" in _stdout, "输入 40 时应该输出 不及格"` },
        ],
        mustMatch: `else`,
        mustMatchMsg: "要用 if / else 两个分支。",
        hint: "if score >= 60:\n    print(\"及格\")\nelse:\n    print(\"不及格\")",
        solution: `score = int(input("分数？"))\nif score >= 60:\n    print("及格")\nelse:\n    print("不及格")`,
      },
    ],
  },
  // ---------------------------------------------------------------- 4
  {
    id: "elif",
    title: "elif：多个条件",
    summary: "if / elif / elif / else 从上到下检查，第一个成立的分支执行，其余跳过。",
    steps: [
      {
        type: "learn",
        text: `<p>有多种情况时用 <b>elif</b>（else if 的缩写），可以写很多个。</p>
<p>Python 从上往下检查，<b>第一个成立的分支执行后，剩下的全部跳过</b>。所以条件的<b>顺序很重要</b>。</p>`,
        code: `score = 85\nif score >= 90:\n    print("优秀")\nelif score >= 80:\n    print("良好")\nelif score >= 60:\n    print("及格")\nelse:\n    print("不及格")`,
        tip: "把 score 改成 95、70、30 各试一次。",
      },
      {
        type: "predict",
        prompt: "这段代码会输出什么？",
        code: `x = 95\nif x >= 60:\n    print("及格")\nelif x >= 90:\n    print("优秀")`,
        options: ["及格", "优秀", "及格\n优秀"],
        answer: 0,
        explain: "95 >= 60 先成立，输出 及格 后整个 if 就结束了，后面的 elif 不会再检查。想先判断优秀，就要把 >= 90 写在前面。",
      },
      {
        type: "code",
        prompt: "读入温度（整数）：小于 10 输出 <b>冷</b>，10 到 25（含）输出 <b>舒适</b>，大于 25 输出 <b>热</b>。会用三个输入各测一次。",
        starter: `t = int(input("温度？"))\n`,
        cases: [
          { stdin: ["5"], check: `assert "冷" in _stdout and "舒适" not in _stdout and "热" not in _stdout, "输入 5 应该只输出 冷"` },
          { stdin: ["18"], check: `assert "舒适" in _stdout and "冷" not in _stdout and "热" not in _stdout, "输入 18 应该只输出 舒适"` },
          { stdin: ["30"], check: `assert "热" in _stdout and "冷" not in _stdout and "舒适" not in _stdout, "输入 30 应该只输出 热"` },
        ],
        mustMatch: `elif`,
        mustMatchMsg: "三种情况，用 if / elif / else。",
        hint: "if t < 10:\n    print(\"冷\")\nelif t <= 25:\n    print(\"舒适\")\nelse:\n    print(\"热\")",
        solution: `t = int(input("温度？"))\nif t < 10:\n    print("冷")\nelif t <= 25:\n    print("舒适")\nelse:\n    print("热")`,
      },
    ],
  },
  // ---------------------------------------------------------------- 5
  {
    id: "compound",
    title: "组合条件与嵌套",
    summary: "用 and / or / not 组合条件；if 里还能再放 if（嵌套）。",
    steps: [
      {
        type: "learn",
        text: `<p>条件可以用 <code>and</code>、<code>or</code>、<code>not</code> 组合。</p>
<p>if 的代码块里还可以再放 if，叫<b>嵌套</b>，缩进再加一层。能用 and 写清楚的，就尽量少嵌套——层数越多越难读。</p>`,
        code: `user = "admin"\npwd = "1234"\nif user == "admin" and pwd == "1234":\n    print("登录成功")\nelse:\n    print("用户名或密码错误")\n\nn = 7\nif n > 5:\n    if n % 2 == 0:\n        print("大偶数")\n    else:\n        print("大奇数")\nelse:\n    print("小数字")`,
        tip: "把 pwd 改成 \"0000\"，再把 n 改成 8，看看结果。",
      },
      {
        type: "predict",
        prompt: "这段代码会输出什么？",
        code: `a = 4\nif a > 2 and a < 4:\n    print("A")\nelif a == 4 or a == 5:\n    print("B")\nelse:\n    print("C")`,
        options: ["A", "B", "C"],
        answer: 1,
        explain: "a > 2 成立但 a < 4 不成立，and 要两边都真，所以第一个条件为假。第二个条件 a == 4 为真，or 有一边真就行，输出 B。",
      },
      {
        type: "code",
        prompt: `<p>读入年份，判断是不是闰年：<b>能被 4 整除但不能被 100 整除</b>，或者<b>能被 400 整除</b>，就是闰年。闰年输出 <b>闰年</b>，否则输出 <b>平年</b>。</p><p>会测 2024、1900、2000 三个年份。</p>`,
        starter: `year = int(input("年份？"))\n`,
        cases: [
          { stdin: ["2024"], check: `assert "闰年" in _stdout and "平年" not in _stdout, "2024 是闰年"` },
          { stdin: ["1900"], check: `assert "平年" in _stdout and "闰年" not in _stdout, "1900 能被 100 整除但不能被 400 整除，是平年"` },
          { stdin: ["2000"], check: `assert "闰年" in _stdout and "平年" not in _stdout, "2000 能被 400 整除，是闰年"` },
        ],
        mustMatch: `and|or`,
        mustMatchMsg: "试试用 and / or 把条件组合起来。",
        hint: "条件：(year % 4 == 0 and year % 100 != 0) or year % 400 == 0",
        solution: `year = int(input("年份？"))\nif (year % 4 == 0 and year % 100 != 0) or year % 400 == 0:\n    print("闰年")\nelse:\n    print("平年")`,
      },
    ],
  },
  // ---------------------------------------------------------------- 6
  {
    id: "truthy",
    title: "真值：什么算真，什么算假",
    summary: "0、空字符串、空列表、None 当作假，其余当作真；if name: 是常见写法。",
    steps: [
      {
        type: "learn",
        text: `<p>if 后面不一定非得是 True / False。Python 会把任何值当作真或假来看：</p>
<ul>
<li><b>算假</b>：<code>0</code>、<code>0.0</code>、空字符串 <code>""</code>、空列表 <code>[]</code>、<code>None</code></li>
<li><b>算真</b>：其余一切（非零数字、非空字符串……）</li>
</ul>
<p><code>bool(x)</code> 能看出 x 算真还是假。<code>if name:</code> 是"如果 name 不为空"的简写，非常常见。</p>`,
        code: `print(bool(0), bool(5))\nprint(bool(""), bool("hi"))\nprint(bool([]), bool([1, 2]))\n\nname = ""\nif name:\n    print("你好，" + name)\nelse:\n    print("名字是空的")`,
        tip: "给 name 填个名字再运行。",
      },
      {
        type: "predict",
        prompt: "这段代码会输出什么？",
        code: `items = []\nif not items:\n    print("空的")\nelse:\n    print("有东西")`,
        options: ["空的", "有东西", "报错"],
        answer: 0,
        explain: "空列表 [] 算假，not 把它变成真，所以进入第一个分支，输出 空的。",
      },
      {
        type: "fill",
        prompt: "填一个关键字，让程序在密码为空时输出提示。",
        code: `password = ""\nif ____ password:\n    print("密码不能为空")`,
        expect: "密码不能为空",
        placeholder: "关键字",
        hint: "空字符串算假，要让条件成立，需要把假变成真。",
        solution: ["not"],
      },
    ],
  },
  // ---------------------------------------------------------------- 7 Boss
  {
    id: "conditions-boss",
    boss: true,
    title: "终点挑战：猜数字裁判",
    summary: "综合运用 input、int、if / elif / else。",
    steps: [
      {
        type: "code",
        prompt: `<p>写一个猜数字的裁判程序。<code>secret = 42</code> 已给出：</p>
<ol>
<li>用 input() 读入用户猜的数（记得转成整数）</li>
<li>比 secret 大输出 <b>大了</b>，比 secret 小输出 <b>小了</b>，相等输出 <b>猜对了！</b></li>
</ol>
<p>会用 50、10、42 三个输入各测一次。</p>`,
        starter: `secret = 42\n`,
        cases: [
          { stdin: ["50"], check: `assert "大了" in _stdout and "小了" not in _stdout and "猜对" not in _stdout, "输入 50 应该输出 大了"` },
          { stdin: ["10"], check: `assert "小了" in _stdout and "大了" not in _stdout and "猜对" not in _stdout, "输入 10 应该输出 小了"` },
          { stdin: ["42"], check: `assert "猜对了！" in _stdout and "大了" not in _stdout and "小了" not in _stdout, "输入 42 应该输出 猜对了！"` },
        ],
        mustMatch: `elif|else`,
        mustMatchMsg: "三种情况，用 if / elif / else 来分。",
        hint: "guess = int(input(\"猜一个数：\"))\nif guess > secret:\n    print(\"大了\")\nelif guess < secret:\n    print(\"小了\")\nelse:\n    print(\"猜对了！\")",
        solution: `secret = 42\nguess = int(input("猜一个数："))\nif guess > secret:\n    print("大了")\nelif guess < secret:\n    print("小了")\nelse:\n    print("猜对了！")`,
      },
    ],
  },
]);
