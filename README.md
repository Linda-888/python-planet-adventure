# 🪐 Python 星球探险

一个**通过闯关学 Python** 的单人游戏：探险者沿着路往前走，碰到的每一颗"知识水晶"都是一个 Python 知识点。
每颗水晶都是互动式的——先看讲解、动手改示例跑一跑，再做填空 / 写代码 / 改 bug / 猜输出，水晶就归你了。
走完全部章节，就学完了整个 Python。

玩家写的是**真正的 Python**：代码在浏览器里通过 [Pyodide](https://pyodide.org) 运行，不用安装任何东西；报错会翻译成中文提示。

## 🎮 在线玩

**<https://linda-888.github.io/python-planet-adventure/>** —— 打开就能玩，不用下载（首次加载需要几秒钟下载 Python 运行环境）。

## 本地运行

```bash
python3 -m http.server 8765
```

然后浏览器打开 <http://localhost:8765>（需要联网，首次会下载约 10 MB 的 Python 运行环境）。

- 地图上选一章 → 按 **→** 或点「前进」走路 → 碰到水晶开始学 → 收集完全部水晶章节完成
- 右上角「知识图鉴」能复习已经收集的知识点
- 练习连错 3 次会出现「看参考答案」
- 进度自动存在浏览器 localStorage 里；控制台输入 `PyPlanet.reset()` 清档

## 进度：知识地图

| # | 章节 | 状态 | 水晶 |
|---|---|---|---|
| 1 | 变量与数据类型 | ✅ | print · 变量 · 数字 · 字符串 · 布尔值 · 类型转换 · 购物小票 |
| 2 | 条件判断 | ✅ | input · if · else · elif · 组合条件 · 真值 · 猜数字裁判 |
| 3 | 循环 | ✅ | for/range · 累加 · 遍历字符串 · while · break/continue · 嵌套 · 找质数 |
| 4 | 列表与元组 | ✅ | 列表 · 增删改 · 切片 · 遍历 · 排序 · 元组 · 成绩单 |
| 5 | 字典与集合 | 开发中 | |
| 6 | 字符串进阶 | 开发中 | |
| 7 | 函数 | 开发中 | |
| 8 | 模块与标准库 | 开发中 | |
| 9 | 异常处理 | 开发中 | |
| 10 | 文件读写 | 开发中 | |
| 11 | 类与对象 | 开发中 | |
| 12 | 继承与魔术方法 | 开发中 | |
| 13 | 推导式与生成器 | 开发中 | |
| 14 | 高阶函数与装饰器 | 开发中 | |
| 15 | 内置工具箱 | 开发中 | |
| 16 | 综合项目 | 开发中 | |

大纲在 `curriculum.js` 的 `PLAN` 里，想调整章节顺序、名字、描述改那里。

## 文件结构

```
index.html        页面骨架
style.css         样式
runtime.js        ★ 浏览器里的 Python 运行时：跑代码、捕获输出、自动喂 input()、翻译报错、执行检查
curriculum.js     ★ 课程大纲（全部章节）+ defineChapter()
chapters/*.js     ★ 每一章的内容，一章一个文件 —— 加内容改这里
app.js            游戏逻辑：地图、场景走路、互动学习卡、图鉴、存档
dev/              课程自动校验脚本
robot-puzzle/     最早的另一个原型（用 Python 指挥机器人走迷宫），留作参考
```

## 怎么写一章

在 `chapters/` 下新建文件，用 `defineChapter(大纲里的 id, 水晶列表)` 注册，再把 `<script>` 加到 `index.html`。

一颗水晶：

```js
{
  id: "for-range",                 // 唯一 id，图鉴和存档用
  title: "for 与 range：重复 n 次",  // 显示在路边的名字
  summary: "一句话总结，图鉴里显示",
  boss: false,                      // true 表示终点挑战（显示 👑）
  steps: [ ... ],                   // 依次经历的步骤
}
```

五种步骤：

```js
// 讲解：文字 + 可改可跑的示例（必须运行一次才能继续）
{ type: "learn", text: "<p>支持 HTML</p>", code: "print(1)", tip: "鼓励玩家改着玩的提示", stdin: ["可选：喂给 input 的输入"] }

// 填空：____ 处会变成输入框
{ type: "fill", prompt: "题目", code: "print(____)", expect: "我来了", solution: ['"我来了"'], hint: "…" }

// 写代码 / 改 bug（fix 和 code 一样，只是图标不同）
{ type: "code", prompt: "题目", starter: "初始代码", expect: "期望输出", solution: "参考答案", hint: "…" }

// 猜输出：选项写成真实输出的样子，多行用 \n；"报错" 表示会抛异常
{ type: "predict", prompt: "这段代码会输出什么？", code: "print(7 // 2)", options: ["3", "3.5", "报错"], answer: 0, explain: "为什么" }
```

练习题的判定方式（可以组合，全部满足才算对）：

| 字段 | 作用 |
|---|---|
| `expect` | 完整输出必须一致（忽略行尾和首尾空白） |
| `expectContains` | 输出里必须包含这些片段，适合有 input 回显的题 |
| `check` | 一段 Python，用 `assert 条件, "没过时的提示"`；能读到玩家的变量、`_stdout`（输出）、`_code`（源码） |
| `mustMatch` | 正则，源码必须匹配（比如强制用 `for`），不满足时显示 `mustMatchMsg` |
| `stdin` | 自动喂给 `input()` 的输入列表 |
| `cases` | 多组测试 `[{stdin, expect, expectContains, check}]`，适合"输入不同结果不同"的题 |
| `solution` | 参考答案（连错 3 次可看；校验脚本也用它） |

## 校验课程

写完内容跑一下，它会用参考答案过一遍所有练习，并确认初始代码不能直接通过：

```bash
node dev/check_curriculum.js
```

浏览器控制台里 `PyPlanet.check()` 做同样的事。其他调试用法：`PyPlanet.enterChapter(PyPlanet.CHAPTERS[2])` 直接进某章。

## 后续可以做的

- 剩下的 12 章内容（按大纲一章一章补）
- 每章结尾的"复习小测"，从本章水晶里随机抽几题
- 星级 / 经验值：一次通过给 3 星，用了提示 2 星，看了答案 1 星
- 更多步骤类型：排序代码块、连线、补全缩进
- 文件读写一章需要用 Pyodide 的虚拟文件系统
