// 第 3 章：循环
defineChapter("loops", [
  // ---------------------------------------------------------------- 1
  {
    id: "for-range",
    title: "for 与 range：重复 n 次",
    summary: "for i in range(n): 重复 n 次，i 从 0 数到 n-1；range(起, 止, 步长)。",
    steps: [
      {
        type: "learn",
        text: `<p>要重复做一件事，不用复制粘贴，用 <b>for 循环</b>：</p>
<pre>for i in range(5):
    要重复的代码</pre>
<p><code>range(5)</code> 产生 0、1、2、3、4（从 0 开始，<b>不包含</b> 5），循环变量 <code>i</code> 每轮换一个值。</p>
<p><code>range(1, 6)</code> 是 1 到 5；<code>range(0, 10, 3)</code> 第三个参数是步长。</p>`,
        code: `for i in range(5):\n    print(i)          # 0 1 2 3 4\nprint("---")\nfor i in range(1, 6):\n    print(i)          # 1 2 3 4 5\nprint("---")\nfor i in range(0, 10, 3):\n    print(i)          # 0 3 6 9`,
        tip: "试试 range(10, 0, -1)，能倒着数吗？",
      },
      {
        type: "predict",
        prompt: "这段代码会输出什么？",
        code: `for i in range(2, 9, 3):\n    print(i)`,
        options: ["2\n5\n8", "2\n5", "3\n6\n9"],
        answer: 0,
        explain: "从 2 开始，每次加 3：2、5、8。下一个是 11，超过了 9（不含），停止。",
      },
      {
        type: "code",
        prompt: "用 for 循环打印 1 到 5 每个数的平方，每行一个（1、4、9、16、25）。",
        starter: "",
        expect: "1\n4\n9\n16\n25",
        mustMatch: `for\\s`,
        mustMatchMsg: "要用 for 循环，不要手写 5 行 print。",
        hint: "for i in range(1, 6):\n    print(i ** 2)",
        solution: "for i in range(1, 6):\n    print(i ** 2)",
      },
    ],
  },
  // ---------------------------------------------------------------- 2
  {
    id: "accumulate",
    title: "累加：循环里的变量",
    summary: "循环外初始化 total = 0，循环里 total += i；这是最常用的循环套路。",
    steps: [
      {
        type: "learn",
        text: `<p>循环最常见的用法：用一个变量<b>累积</b>结果。套路是三步：循环前初始化，循环里更新，循环后使用。</p>
<p><code>total += i</code> 是 <code>total = total + i</code> 的简写。同理有 <code>-=</code>、<code>*=</code>。</p>
<p>循环体里也可以放 if，只在满足条件时累加。</p>`,
        code: `total = 0\nfor i in range(1, 11):\n    total += i\nprint(total)          # 1+2+...+10 = 55\n\ncount = 0\nfor i in range(1, 21):\n    if i % 3 == 0:\n        count += 1\nprint(count)          # 1~20 里 3 的倍数有几个`,
        tip: "把 total = 0 这行删掉再运行，看看报什么错——这就是为什么要先初始化。",
      },
      {
        type: "predict",
        prompt: "这段代码会输出什么？",
        code: `s = 0\nfor i in range(3):\n    s += 2\nprint(s)`,
        options: ["2", "6", "8"],
        answer: 1,
        explain: "循环 3 次（i = 0, 1, 2），每次 s 加 2，一共加了 6。注意 i 的值没有被用到，只是用来数次数。",
      },
      {
        type: "code",
        prompt: "算出 1 到 100 之间所有<b>偶数</b>的和并打印（答案是 2550，但要让程序算出来）。",
        starter: "total = 0\n",
        expect: "2550",
        mustMatch: `for\\s|while\\s`,
        mustMatchMsg: "要用循环来累加。",
        check: `assert "2550" not in _code, "要让程序算出来，不要直接写 2550"`,
        hint: "两种思路：range(2, 101, 2) 直接走偶数；或者 range(1, 101) 配合 if i % 2 == 0。",
        solution: "total = 0\nfor i in range(2, 101, 2):\n    total += i\nprint(total)",
      },
    ],
  },
  // ---------------------------------------------------------------- 3
  {
    id: "for-str",
    title: "遍历字符串",
    summary: "for ch in \"文字\": 逐个字符遍历；for 能遍历任何序列。",
    steps: [
      {
        type: "learn",
        text: `<p>for 不只能配 range。它可以遍历任何"一串东西"（序列）：字符串会逐个字符取出，下一章的列表会逐个元素取出。</p>
<p>配合 if 和计数器，就能做统计。</p>`,
        code: `for ch in "Python":\n    print(ch)\n\nword = "banana"\ncount = 0\nfor ch in word:\n    if ch == "a":\n        count += 1\nprint(count)       # banana 里有几个 a`,
        tip: "试试把 word 换成你的英文名，统计里面有几个 a。",
      },
      {
        type: "fill",
        prompt: "填一个关键字，统计 education 里有几个元音字母（应输出 5）。",
        code: `vowels = "aeiou"\nn = 0\nfor ch in "education":\n    if ch ____ vowels:\n        n += 1\nprint(n)`,
        expect: "5",
        placeholder: "关键字",
        hint: "判断一个字符是否在某个字符串里面，用的关键字和 for 里的那个一样。",
        solution: ["in"],
      },
      {
        type: "code",
        prompt: "用 for 循环把字符串 <code>s = \"hello\"</code> 反过来打印（应输出 olleh）。这关练循环，先别用切片。",
        starter: `s = "hello"\nresult = ""\n`,
        expect: "olleh",
        mustMatch: `for\\s`,
        mustMatchMsg: "要用 for 循环。",
        check: `assert "[::-1]" not in _code and "reversed" not in _code, "这关练循环：试试每次把 ch 加到 result 的前面"`,
        hint: "每取出一个字符，就把它放到 result 的最前面：result = ch + result",
        solution: `s = "hello"\nresult = ""\nfor ch in s:\n    result = ch + result\nprint(result)`,
      },
    ],
  },
  // ---------------------------------------------------------------- 4
  {
    id: "while",
    title: "while：不知道要循环几次",
    summary: "while 条件: 条件为真就一直重复；循环体里必须让条件有机会变假。",
    steps: [
      {
        type: "learn",
        text: `<p><b>while</b>：只要条件为真，就一直重复。每一轮开始前重新检查条件。</p>
<p>for 适合"知道要重复几次"，while 适合"不知道几次，只知道什么时候停"。</p>
<p>⚠️ 循环体里<b>必须让条件有机会变成假</b>，否则就是死循环。这个游戏会强制停止并提示你。</p>`,
        code: `n = 5\nwhile n > 0:\n    print(n)\n    n -= 1\nprint("发射！")\n\n# 找第一个平方大于 50 的整数\nx = 1\nwhile x * x <= 50:\n    x += 1\nprint(x)`,
        tip: "把 n -= 1 删掉运行一次，体验一下死循环是怎么被拦下来的。",
      },
      {
        type: "predict",
        prompt: "这段代码会输出什么？",
        code: `n = 1\nwhile n < 100:\n    n = n * 2\nprint(n)`,
        options: ["64", "100", "128"],
        answer: 2,
        explain: "n 依次是 1、2、4、8、16、32、64——64 还小于 100，再翻倍得到 128，这时条件不成立，循环结束，输出 128。",
      },
      {
        type: "fix",
        prompt: "这段代码想倒数 3、2、1，但它是个死循环。改好它。",
        starter: `count = 3\nwhile count > 0:\n    print(count)`,
        expect: "3\n2\n1",
        hint: "循环体里 count 从来没变过，条件 count > 0 永远成立。每轮让它减 1。",
        solution: `count = 3\nwhile count > 0:\n    print(count)\n    count -= 1`,
      },
    ],
  },
  // ---------------------------------------------------------------- 5
  {
    id: "break-continue",
    title: "break 与 continue",
    summary: "break 立刻结束整个循环；continue 跳过本轮剩下的代码，进入下一轮。",
    steps: [
      {
        type: "learn",
        text: `<p>两个控制循环的关键字：</p>
<ul>
<li><code>break</code>：立刻<b>结束整个循环</b></li>
<li><code>continue</code>：跳过<b>这一轮</b>剩下的代码，直接进入下一轮</li>
</ul>
<p><code>while True:</code> 配合 <code>break</code> 是常见写法："一直循环，直到满足条件就跳出"。</p>`,
        code: `for i in range(10):\n    if i == 4:\n        break          # 到 4 就结束整个循环\n    print(i)\nprint("---")\nfor i in range(6):\n    if i % 2 == 0:\n        continue       # 偶数跳过，不打印\n    print(i)`,
        tip: "把 break 换成 continue，输出有什么不同？",
      },
      {
        type: "predict",
        prompt: "这段代码会输出什么？",
        code: `for i in range(1, 6):\n    if i == 3:\n        continue\n    print(i)`,
        options: ["1\n2", "1\n2\n4\n5", "1\n2\n3\n4\n5"],
        answer: 1,
        explain: "i 等于 3 时 continue 跳过了 print，但循环没有结束，4 和 5 照常打印。如果是 break，就只会有 1 和 2。",
      },
      {
        type: "code",
        prompt: "从 1 开始累加 1 + 2 + 3 + …，当和<b>超过 100</b> 时停下，打印此时加到了几（答案是 14）。用 <code>while True</code> 加 <code>break</code> 来写。",
        starter: "total = 0\nn = 0\nwhile True:\n",
        expect: "14",
        mustMatch: `break`,
        mustMatchMsg: "用 break 来跳出 while True 循环。",
        check: `assert "14" not in _code, "要让程序算出来，不要直接写 14"`,
        hint: "每轮：n 加 1，total 加 n；如果 total > 100 就 break。循环结束后 print(n)。",
        solution: "total = 0\nn = 0\nwhile True:\n    n += 1\n    total += n\n    if total > 100:\n        break\nprint(n)",
      },
    ],
  },
  // ---------------------------------------------------------------- 6
  {
    id: "nested-loops",
    title: "嵌套循环",
    summary: "循环里再放循环：外层每转一圈，内层转完整一轮。",
    steps: [
      {
        type: "learn",
        text: `<p>循环里可以再放循环。<b>外层每转一圈，内层要完整地转一轮</b>。</p>
<p>顺便认识 <code>print()</code> 的两个用法：<code>print(x, end="  ")</code> 打印后不换行而是接两个空格；<code>print()</code> 什么都不打印，只换行。</p>`,
        code: `for i in range(1, 4):\n    for j in range(1, 4):\n        print(f"{i}x{j}={i*j}", end="  ")\n    print()      # 内层转完一轮，换行`,
        tip: "把两个 range(1, 4) 都改成 range(1, 10)，就是完整的九九乘法表。",
      },
      {
        type: "predict",
        prompt: "这段代码会输出什么？",
        code: `for i in range(2):\n    for j in range(3):\n        print(i, j)`,
        options: ["0 0\n0 1\n0 2\n1 0\n1 1\n1 2", "0 0\n1 1", "0 1 2\n0 1 2"],
        answer: 0,
        explain: "外层 i 取 0 和 1；i 每取一个值，内层 j 都要完整地走 0、1、2。所以一共 2 × 3 = 6 行。",
      },
      {
        type: "code",
        prompt: "用循环打印一个 4 行的星星直角三角形：第 1 行 1 颗星，第 2 行 2 颗……",
        starter: "",
        expect: "*\n**\n***\n****",
        mustMatch: `for\\s|while\\s`,
        mustMatchMsg: "要用循环来打印。",
        hint: "外层 for i in range(1, 5)。每行可以用内层循环一颗一颗打印（end=\"\"），也可以直接 print(\"*\" * i)。",
        solution: 'for i in range(1, 5):\n    print("*" * i)',
      },
    ],
  },
  // ---------------------------------------------------------------- 7 Boss
  {
    id: "loops-boss",
    boss: true,
    title: "终点挑战：找出所有质数",
    summary: "综合运用嵌套循环、if、break 和标志变量。",
    steps: [
      {
        type: "code",
        prompt: `<p><b>质数</b>是只能被 1 和自己整除的数（2、3、5、7、11……）。<code>n = 30</code> 已给出，打印 2 到 n 之间所有的质数，每行一个。</p>
<p>思路：对每个数 num，用一个内层循环检查 2 到 num-1 之间有没有能整除它的数；有就不是质数。</p>`,
        starter: "n = 30\n",
        expect: "2\n3\n5\n7\n11\n13\n17\n19\n23\n29",
        mustMatch: `for\\s|while\\s`,
        mustMatchMsg: "要用循环来找。",
        hint: "for num in range(2, n + 1):\n    is_prime = True\n    for d in range(2, num):\n        if num % d == 0:\n            is_prime = False\n            break\n    if is_prime:\n        print(num)",
        solution: "n = 30\nfor num in range(2, n + 1):\n    is_prime = True\n    for d in range(2, num):\n        if num % d == 0:\n            is_prime = False\n            break\n    if is_prime:\n        print(num)",
      },
    ],
  },
]);
