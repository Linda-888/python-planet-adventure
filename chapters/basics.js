// 第 1 章：变量与数据类型
defineChapter("basics", [
  // ---------------------------------------------------------------- 1
  {
    id: "print",
    title: "print：让电脑说话",
    summary: "print() 把括号里的内容显示出来；文字要放在引号里。",
    steps: [
      {
        type: "learn",
        text: `<p>Python 程序就是一行行<b>指令</b>，电脑从上到下依次执行。最常用的一条是 <code>print()</code>：把括号里的内容显示出来。</p>
<p>文字要放在<b>引号</b>里（单引号、双引号都行），Python 才知道它是一段文字而不是指令。</p>`,
        code: `print("你好，Python 星球！")\nprint('第二行也可以')`,
        tip: "示例代码可以随便改：换一句话，再点运行试试。",
      },
      {
        type: "fill",
        prompt: "把空填上，让程序输出一行：<b>我来了</b>",
        code: `print(____)`,
        expect: "我来了",
        placeholder: "……",
        hint: "文字要放在引号里：\"我来了\"",
        solution: ['"我来了"'],
      },
      {
        type: "predict",
        prompt: "这段代码会输出什么？",
        code: `print("1 + 1")`,
        options: ["2", "1 + 1", "报错"],
        answer: 1,
        explain: "引号里的内容是文字，Python 不会去计算它，会原样输出。去掉引号写 print(1 + 1) 才会得到 2。",
      },
    ],
  },
  // ---------------------------------------------------------------- 2
  {
    id: "variables",
    title: "变量：给数据起名字",
    summary: "变量是贴了名字的盒子，用 = 把值放进去，以后用名字取出来。",
    steps: [
      {
        type: "learn",
        text: `<p><b>变量</b>就是一个贴了名字的盒子，用 <code>=</code> 把值放进去，以后写名字就能取出来用。</p>
<p>名字自己起，但要有意义：<code>age</code> 比 <code>a</code> 好懂。名字只能包含字母、数字、下划线，不能以数字开头，而且区分大小写（<code>Age</code> 和 <code>age</code> 是两个变量）。</p>`,
        code: `name = "小明"\nage = 12\nprint(name)\nprint(age)\n\nage = age + 1    # 盒子里的值可以换掉\nprint(age)`,
        tip: "把 12 改成你的年龄，再加一行 print(name, age) 看看逗号的效果。",
      },
      {
        type: "code",
        prompt: "创建一个叫 <code>city</code> 的变量，值是文字 <b>北京</b>，然后用 print 把它打印出来。",
        starter: "# 在这里写代码\n",
        expect: "北京",
        check: `assert "city" in globals(), "没有找到叫 city 的变量，检查一下名字拼写"\nassert city == "北京", "city 的值应该是文字 \\"北京\\""`,
        hint: "两行：city = \"北京\"，然后 print(city)。注意 print 里的 city 不要加引号——加了引号就变成打印文字 city 了。",
        solution: 'city = "北京"\nprint(city)',
      },
      {
        type: "predict",
        prompt: "这段代码会输出什么？",
        code: `x = 5\ny = x\nx = 10\nprint(y)`,
        options: ["5", "10", "报错"],
        answer: 0,
        explain: "y = x 是把 x 当时的值 5 复制一份给 y。后来 x 换成了 10，y 盒子里的 5 不受影响。",
      },
    ],
  },
  // ---------------------------------------------------------------- 3
  {
    id: "numbers",
    title: "数字：整数、小数和运算",
    summary: "int 整数、float 小数；+ - * / // % ** 运算；type() 查看类型。",
    steps: [
      {
        type: "learn",
        text: `<p>Python 常用两种数字：<b>整数</b>（int，如 3、-7）和<b>小数</b>（float，如 3.14）。</p>
<p>运算符：<code>+ - *</code> 加减乘；<code>/</code> 除法（结果一定是小数）；<code>//</code> 整除（丢掉小数部分）；<code>%</code> 取余数；<code>**</code> 乘方。</p>
<p><code>type()</code> 可以查看一个值是什么类型。</p>`,
        code: `print(7 + 3, 7 - 3, 7 * 3)\nprint(7 / 2)      # 3.5\nprint(7 // 2)     # 3\nprint(7 % 2)      # 1\nprint(2 ** 10)    # 1024\nprint(type(7), type(3.5))`,
        tip: "试试 10 / 2，结果是 5 还是 5.0？",
      },
      {
        type: "predict",
        prompt: "这段代码会输出什么？",
        code: `print(17 % 5)`,
        options: ["3", "2", "3.4"],
        answer: 1,
        explain: "% 是取余数：17 除以 5，商 3 余 2，所以是 2。想要商用 //，想要 3.4 用 /。",
      },
      {
        type: "code",
        prompt: "一周有 7 天。变量 <code>weeks = 6</code> 已经给出，算出 6 周一共多少天并打印出来（应输出 42）。",
        starter: "weeks = 6\n",
        expect: "42",
        check: `assert "weeks" in globals() and weeks == 6, "不要改 weeks 的值"\nassert "weeks" in _code.replace("weeks = 6", ""), "要用变量 weeks 来计算，不要直接写 42"`,
        hint: "print(weeks * 7)",
        solution: "weeks = 6\nprint(weeks * 7)",
      },
    ],
  },
  // ---------------------------------------------------------------- 4
  {
    id: "strings",
    title: "字符串：处理文字",
    summary: "引号里的是字符串；+ 拼接、len() 长度、s[0] 取字符、f\"{变量}\" 格式化。",
    steps: [
      {
        type: "learn",
        text: `<p>用引号括起来的文字叫<b>字符串</b>（str）。</p>
<ul>
<li><code>+</code> 把两个字符串拼起来</li>
<li><code>len()</code> 得到长度（字符个数）</li>
<li><code>s[0]</code> 取第一个字符——位置从 <b>0</b> 开始数</li>
<li><b>f-string</b>：在引号前加 <code>f</code>，花括号里放变量，是最常用的拼文字方式</li>
</ul>`,
        code: `s = "Python"\nprint(s + "!")\nprint(len(s))\nprint(s[0], s[1])\n\nname = "小明"\nage = 12\nprint(f"{name}今年{age}岁")`,
        tip: "试试 s[5] 和 s[6]，哪个会报错？为什么？",
      },
      {
        type: "predict",
        prompt: "这段代码会输出什么？",
        code: `print("3" + "4")`,
        options: ["7", "34", "报错"],
        answer: 1,
        explain: "\"3\" 和 \"4\" 都是字符串，字符串的 + 是拼接，不是加法，所以得到 \"34\"。",
      },
      {
        type: "code",
        prompt: "用 f-string 输出一行：<b>我叫小红，喜欢Python</b>。变量已经给好了，要用变量，不要把文字写死。",
        starter: `name = "小红"\nhobby = "Python"\n`,
        expect: "我叫小红，喜欢Python",
        mustMatch: `f["']`,
        mustMatchMsg: "要用 f-string：在引号前面加 f，变量放在花括号 {} 里。",
        hint: `print(f"我叫{name}，喜欢{hobby}")`,
        solution: `name = "小红"\nhobby = "Python"\nprint(f"我叫{name}，喜欢{hobby}")`,
      },
    ],
  },
  // ---------------------------------------------------------------- 5
  {
    id: "booleans",
    title: "布尔值：真与假",
    summary: "True / False；比较 == != > <；逻辑 and or not。",
    steps: [
      {
        type: "learn",
        text: `<p><b>布尔值</b>只有两个：<code>True</code>（真）和 <code>False</code>（假），注意首字母大写。</p>
<p>比较运算的结果就是布尔值：<code>==</code> 等于（两个等号！一个等号是赋值）、<code>!=</code> 不等于、<code>&gt; &lt; &gt;= &lt;=</code>。</p>
<p>逻辑运算：<code>and</code> 两边都真才真；<code>or</code> 有一边真就真；<code>not</code> 取反。</p>
<p>布尔值是下一章"条件判断"的基础。</p>`,
        code: `print(3 > 2)\nprint(3 == 3.0)\nprint("a" != "a")\n\nage = 15\nprint(age >= 18)\nprint(age > 10 and age < 20)\nprint(not True)`,
        tip: "把 age 改成 20，哪几行的结果变了？",
      },
      {
        type: "predict",
        prompt: "这段代码会输出什么？",
        code: `print(5 > 3 or 2 > 8)`,
        options: ["True", "False", "报错"],
        answer: 0,
        explain: "or 只要有一边为真结果就是 True。5 > 3 是真，所以整体为 True（2 > 8 是假也没关系）。",
      },
      {
        type: "code",
        prompt: "变量 <code>score = 85</code>。打印一个布尔值：分数是否在 60 到 100 之间（含 60 和 100）。应输出 <b>True</b>。",
        starter: "score = 85\n",
        expect: "True",
        check: `assert "score" in globals() and score == 85, "不要改 score 的值"\nassert ("<" in _code or ">" in _code), "要用比较运算符来判断，不要直接 print(True)"`,
        hint: "print(score >= 60 and score <= 100)。Python 还允许连写：print(60 <= score <= 100)",
        solution: "score = 85\nprint(60 <= score <= 100)",
      },
    ],
  },
  // ---------------------------------------------------------------- 6
  {
    id: "casting",
    title: "类型转换：数字和文字互换",
    summary: "int() str() float() 在类型之间转换；\"3\" + 3 会报错。",
    steps: [
      {
        type: "learn",
        text: `<p>不同类型不能随便混用：<code>"3" + 3</code> 会报错，因为一个是文字、一个是数字。</p>
<p>用这些函数转换：<code>int("3")</code> 文字变整数、<code>float("3.5")</code> 变小数、<code>str(3)</code> 数字变文字。</p>
<p>这在处理用户输入时特别常见——用户输入的内容永远是字符串，要算数就得先转换。</p>`,
        code: `print(int("3") + 3)\nprint(str(3) + "3")\nprint(float("2.5") * 2)\nprint(int(3.99))    # 直接丢掉小数部分，不是四舍五入`,
        tip: "试试 int(\"abc\")，读一读报错信息说了什么。",
      },
      {
        type: "fix",
        prompt: "这段代码想输出 <b>13</b>，但运行会报错。找出原因并改好它。",
        starter: `age = "12"\nprint(age + 1)`,
        expect: "13",
        hint: "age 是字符串 \"12\"，不能直接和数字相加。用 int(age) 把它变成数字再加 1。",
        solution: `age = "12"\nprint(int(age) + 1)`,
      },
      {
        type: "predict",
        prompt: "这段代码会输出什么？",
        code: `print(str(2) * 3)`,
        options: ["6", "222", "报错"],
        answer: 1,
        explain: "str(2) 是字符串 \"2\"。字符串乘以整数是重复：\"2\" * 3 得到 \"222\"。",
      },
    ],
  },
  // ---------------------------------------------------------------- 7 Boss
  {
    id: "basics-boss",
    boss: true,
    title: "终点挑战：购物小票",
    summary: "综合运用变量、类型转换、运算、f-string 和布尔值。",
    steps: [
      {
        type: "code",
        prompt: `<p>把这一章学到的全部用上！变量 <code>item</code>、<code>price</code>（注意它是字符串 "25"）、<code>count</code> 已经给出：</p>
<ol>
<li>算出总价（一个数字）</li>
<li>用 f-string 输出一行：<b>苹果 x 4 = 100 元</b></li>
<li>再输出一行布尔值：总价是否超过 80（应为 True）</li>
</ol>`,
        starter: `item = "苹果"\nprice = "25"\ncount = 4\n`,
        expect: "苹果 x 4 = 100 元\nTrue",
        check: `assert "int(" in _code or "float(" in _code, "price 是字符串，要先用 int() 转换成数字才能算"`,
        mustMatch: `f["']`,
        mustMatchMsg: "第一行输出请用 f-string 来拼。",
        hint: "total = int(price) * count\nprint(f\"{item} x {count} = {total} 元\")\nprint(total > 80)",
        solution: `item = "苹果"\nprice = "25"\ncount = 4\ntotal = int(price) * count\nprint(f"{item} x {count} = {total} 元")\nprint(total > 80)`,
      },
    ],
  },
]);
