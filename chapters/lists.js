// 第 4 章：列表与元组
defineChapter("lists", [
  // ---------------------------------------------------------------- 1
  {
    id: "list-basics",
    title: "列表：一次装很多",
    summary: "列表用 [ ] 装一串值；lst[0] 第一个、lst[-1] 最后一个、len() 长度。",
    steps: [
      {
        type: "learn",
        text: `<p><b>列表</b>（list）用方括号装一串值，用逗号隔开。什么类型都能装，还能混着装。</p>
<p>用<b>下标</b>取元素：<code>lst[0]</code> 是第一个（从 0 数起），<code>lst[-1]</code> 是最后一个，<code>len(lst)</code> 是元素个数。</p>`,
        code: `fruits = ["苹果", "香蕉", "橙子"]\nprint(fruits)\nprint(fruits[0])       # 第一个\nprint(fruits[-1])      # 最后一个\nprint(len(fruits))\n\nmixed = [1, "二", 3.0, True]\nprint(mixed)`,
        tip: "试试 fruits[3]，看看超出范围会报什么错。",
      },
      {
        type: "predict",
        prompt: "这段代码会输出什么？",
        code: `nums = [10, 20, 30, 40]\nprint(nums[1] + nums[-1])`,
        options: ["50", "60", "30"],
        answer: 1,
        explain: "nums[1] 是第二个元素 20（下标从 0 数），nums[-1] 是最后一个 40，相加得 60。",
      },
      {
        type: "fill",
        prompt: "填一个下标，让程序打印出 <b>绿</b>。",
        code: `colors = ["红", "绿", "蓝"]\nprint(colors[____])`,
        expect: "绿",
        placeholder: "下标",
        hint: "下标从 0 开始数：红是 0，绿是……",
        solution: ["1"],
      },
    ],
  },
  // ---------------------------------------------------------------- 2
  {
    id: "list-modify",
    title: "增删改：列表是可变的",
    summary: "append 加到末尾、insert 插入、remove 按值删、pop 弹出、lst[i] = x 修改、in 判断包含。",
    steps: [
      {
        type: "learn",
        text: `<p>列表创建后可以随意改：</p>
<ul>
<li><code>lst.append(x)</code> 加到末尾（最常用）</li>
<li><code>lst.insert(i, x)</code> 插到位置 i</li>
<li><code>lst[i] = x</code> 修改第 i 个</li>
<li><code>lst.remove(x)</code> 删除第一个等于 x 的元素；<code>lst.pop()</code> 弹出最后一个并返回它</li>
<li><code>x in lst</code> 判断是否包含</li>
</ul>`,
        code: `todo = ["买菜"]\ntodo.append("做饭")          # 加到末尾\ntodo.insert(0, "起床")       # 插到最前面\nprint(todo)\n\ntodo[1] = "买水果"           # 修改\ntodo.remove("做饭")          # 按值删除\nlast = todo.pop()            # 弹出最后一个\nprint(todo, last)\nprint("起床" in todo)`,
        tip: "试试 todo.pop(0)，pop 也可以指定位置。",
      },
      {
        type: "predict",
        prompt: "这段代码会输出什么？",
        code: `a = [1, 2, 3]\na.append(4)\na.pop(0)\nprint(a)`,
        options: ["[1, 2, 3, 4]", "[2, 3, 4]", "[1, 2, 3]"],
        answer: 1,
        explain: "append(4) 后是 [1, 2, 3, 4]；pop(0) 弹出位置 0 的元素 1，剩下 [2, 3, 4]。",
      },
      {
        type: "code",
        prompt: "从空列表 <code>names = []</code> 开始，用 append 依次加入 小明、小红、小刚，然后打印整个列表。",
        starter: "names = []\n",
        expect: "['小明', '小红', '小刚']",
        mustMatch: `append`,
        mustMatchMsg: "要用 append() 一个一个加进去。",
        hint: 'names.append("小明") 这样写三次，再 print(names)。',
        solution: 'names = []\nnames.append("小明")\nnames.append("小红")\nnames.append("小刚")\nprint(names)',
      },
    ],
  },
  // ---------------------------------------------------------------- 3
  {
    id: "slicing",
    title: "切片：取一段",
    summary: "lst[起:止] 含头不含尾；lst[:n]、lst[n:]、lst[::2] 步长、lst[::-1] 倒序。",
    steps: [
      {
        type: "learn",
        text: `<p><b>切片</b>一次取出一段：<code>lst[起:止]</code>，<b>含头不含尾</b>。</p>
<p>起止都可以省略：<code>[:2]</code> 从头到 2；<code>[3:]</code> 从 3 到尾。第三个数是步长：<code>[::2]</code> 隔一个取一个，<code>[::-1]</code> 倒序。</p>
<p>字符串也能切片，规则一样。</p>`,
        code: `nums = [0, 1, 2, 3, 4, 5]\nprint(nums[1:4])     # [1, 2, 3]，含头不含尾\nprint(nums[:2])      # 前两个\nprint(nums[3:])      # 从 3 到结尾\nprint(nums[::2])     # 步长 2\nprint(nums[::-1])    # 倒序\nprint("Python"[0:3])  # 字符串也能切`,
        tip: "试试 nums[-3:]，负数下标也能用在切片里。",
      },
      {
        type: "predict",
        prompt: "这段代码会输出什么？",
        code: `s = [5, 6, 7, 8, 9]\nprint(s[1:-1])`,
        options: ["[6, 7, 8]", "[6, 7, 8, 9]", "[5, 6, 7, 8]"],
        answer: 0,
        explain: "从下标 1（6）开始，到下标 -1（9）之前结束，不包含 9，所以是 [6, 7, 8]。",
      },
      {
        type: "code",
        prompt: "列表 <code>letters</code> 已给出。用切片打印两行：第一行是前三个元素，第二行是整个列表倒序。",
        starter: 'letters = ["a", "b", "c", "d", "e"]\n',
        expect: "['a', 'b', 'c']\n['e', 'd', 'c', 'b', 'a']",
        mustMatch: `\\[[^\\]]*:[^\\]]*\\]`,
        mustMatchMsg: "要用切片 [起:止] 的写法。",
        hint: "print(letters[:3]) 和 print(letters[::-1])",
        solution: 'letters = ["a", "b", "c", "d", "e"]\nprint(letters[:3])\nprint(letters[::-1])',
      },
    ],
  },
  // ---------------------------------------------------------------- 4
  {
    id: "list-loop",
    title: "遍历列表",
    summary: "for x in lst: 逐个处理；sum / max / min / len 是现成的帮手。",
    steps: [
      {
        type: "learn",
        text: `<p>用 for 逐个取出列表里的元素，是处理列表最常见的方式。配合累加器就能做统计。</p>
<p>常用的事 Python 已经写好了：<code>sum()</code> 求和、<code>max()</code> 最大、<code>min()</code> 最小、<code>len()</code> 个数。</p>`,
        code: `scores = [90, 70, 85]\nfor s in scores:\n    print(s)\n\ntotal = 0\nfor s in scores:\n    total += s\nprint(total / len(scores))     # 平均分\n\nprint(sum(scores), max(scores), min(scores))`,
        tip: "试试 round(total / len(scores), 1)，只保留一位小数。",
      },
      {
        type: "predict",
        prompt: "这段代码会输出什么？",
        code: `nums = [3, 8, 2]\nbig = 0\nfor n in nums:\n    if n > big:\n        big = n\nprint(big)`,
        options: ["3", "8", "2"],
        answer: 1,
        explain: "big 从 0 开始，遇到比它大的就更新：3 → 8，2 不比 8 大。这就是 max() 内部做的事。",
      },
      {
        type: "code",
        prompt: "列表 <code>prices</code> 已给出。用循环数一数其中<b>大于 10</b> 的价格有几个，打印这个数量（应输出 3）。",
        starter: "prices = [12, 30, 7, 25]\n",
        expect: "3",
        mustMatch: `for\\s`,
        mustMatchMsg: "要用 for 循环遍历列表。",
        check: `assert "count" in _code or "n " in _code or "num" in _code or "+= 1" in _code, "用一个计数变量，满足条件时加 1"`,
        hint: "count = 0；for p in prices: 如果 p > 10 就 count += 1；最后 print(count)。",
        solution: "prices = [12, 30, 7, 25]\ncount = 0\nfor p in prices:\n    if p > 10:\n        count += 1\nprint(count)",
      },
    ],
  },
  // ---------------------------------------------------------------- 5
  {
    id: "sorting",
    title: "排序与查找",
    summary: "sorted(lst) 返回新列表；lst.sort() 原地排序返回 None；reverse=True 降序；index / count。",
    steps: [
      {
        type: "learn",
        text: `<p>两种排序：</p>
<ul>
<li><code>sorted(lst)</code> <b>返回</b>一个排好序的新列表，原列表不变</li>
<li><code>lst.sort()</code> <b>原地</b>把列表排好，<b>不返回任何东西</b>（返回 None）——新手最常踩的坑</li>
</ul>
<p>加 <code>reverse=True</code> 变成降序。<code>lst.index(x)</code> 找 x 的位置，<code>lst.count(x)</code> 数 x 出现几次。</p>`,
        code: `nums = [3, 1, 2]\nprint(sorted(nums))          # 新列表\nprint(nums)                  # 原列表没变\nnums.sort()                  # 原地排序\nprint(nums)\nnums.sort(reverse=True)\nprint(nums)\n\nwords = ["banana", "apple", "cherry"]\nprint(sorted(words))         # 字符串按字母序\nprint(nums.index(3), nums.count(1))`,
        tip: "试试 print(nums.sort())，看看它返回什么。",
      },
      {
        type: "predict",
        prompt: "这段代码会输出什么？",
        code: `a = [3, 1, 2]\nb = a.sort()\nprint(b)`,
        options: ["[1, 2, 3]", "None", "报错"],
        answer: 1,
        explain: "sort() 是原地排序，a 变成了 [1, 2, 3]，但它本身不返回列表，所以 b 是 None。想要新列表用 sorted(a)。",
      },
      {
        type: "code",
        prompt: "列表 <code>nums</code> 已给出，打印其中<b>第二大</b>的数（应输出 7）。",
        starter: "nums = [4, 9, 1, 7]\n",
        expect: "7",
        mustMatch: `sort`,
        mustMatchMsg: "先排序，第二大的数就好找了。",
        check: `assert "7" not in _code.replace("[4, 9, 1, 7]", ""), "要让程序算出来，不要直接写 7"`,
        hint: "排好序后，倒数第二个就是第二大：nums.sort() 然后 print(nums[-2])。",
        solution: "nums = [4, 9, 1, 7]\nnums.sort()\nprint(nums[-2])",
      },
    ],
  },
  // ---------------------------------------------------------------- 6
  {
    id: "tuples",
    title: "元组：不可变的列表",
    summary: "元组用 ( ) 创建，不能修改；x, y = point 解包；a, b = b, a 交换。",
    steps: [
      {
        type: "learn",
        text: `<p><b>元组</b>（tuple）像列表，但用圆括号，而且<b>创建后不能修改</b>。适合装"不该变"的一组值，比如坐标。</p>
<p><b>解包</b>：<code>x, y = point</code> 一次把元组里的值取到多个变量。<code>a, b = b, a</code> 是交换两个变量的 Python 惯用写法。</p>`,
        code: `point = (3, 4)\nprint(point[0], len(point))\nx, y = point          # 解包\nprint(x, y)\n\na, b = 1, 2\na, b = b, a           # 交换\nprint(a, b)\n# point[0] = 10  ← 元组不能修改，会报错`,
        tip: "把最后一行的 # 去掉再运行，看看报错信息。",
      },
      {
        type: "predict",
        prompt: "这段代码会输出什么？",
        code: `t = (1, 2, 3)\nt[0] = 9\nprint(t)`,
        options: ["(9, 2, 3)", "[9, 2, 3]", "报错"],
        answer: 2,
        explain: "元组不能修改，t[0] = 9 会抛出 TypeError。需要修改就用列表 [1, 2, 3]。",
      },
      {
        type: "code",
        prompt: "用<b>一行</b>元组解包交换 a 和 b 的值，让程序输出 <b>右 左</b>。",
        starter: 'a = "左"\nb = "右"\n# 在这里交换 a 和 b\n\nprint(a, b)',
        expect: "右 左",
        mustMatch: `\\w+\\s*,\\s*\\w+\\s*=\\s*\\w+\\s*,\\s*\\w+`,
        mustMatchMsg: "用元组解包的写法：a, b = b, a",
        hint: "a, b = b, a",
        solution: 'a = "左"\nb = "右"\na, b = b, a\nprint(a, b)',
      },
    ],
  },
  // ---------------------------------------------------------------- 7 Boss
  {
    id: "lists-boss",
    boss: true,
    title: "终点挑战：成绩单",
    summary: "综合运用列表、循环、内置函数和 f-string。",
    steps: [
      {
        type: "code",
        prompt: `<p>列表 <code>scores</code> 已给出，输出三行：</p>
<ol>
<li><b>最高分：95</b></li>
<li><b>平均分：83.8</b></li>
<li><b>90分以上：2</b>（大于等于 90 的人数）</li>
</ol>`,
        starter: "scores = [88, 92, 79, 65, 95]\n",
        expect: "最高分：95\n平均分：83.8\n90分以上：2",
        mustMatch: `for\\s|max\\(|sum\\(`,
        mustMatchMsg: "用循环或 max / sum 来算，不要手算后写死。",
        check: `assert "95" not in _code.replace("[88, 92, 79, 65, 95]", "") and "83.8" not in _code, "要让程序算出来，不要直接写答案"`,
        hint: "print(f\"最高分：{max(scores)}\")\nprint(f\"平均分：{sum(scores) / len(scores)}\")\n然后用循环数 >= 90 的个数。",
        solution: 'scores = [88, 92, 79, 65, 95]\nprint(f"最高分：{max(scores)}")\nprint(f"平均分：{sum(scores) / len(scores)}")\ncount = 0\nfor s in scores:\n    if s >= 90:\n        count += 1\nprint(f"90分以上：{count}")',
      },
    ],
  },
]);
