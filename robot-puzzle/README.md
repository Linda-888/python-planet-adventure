# 🤖 PyQuest · 用 Python 指挥机器人闯关

一个单人闯关的编程学习游戏：玩家写**真正的 Python 代码**控制机器人穿过实验室的每一层，
每一关教一个 Python 概念。代码在浏览器里通过 [Pyodide](https://pyodide.org)（WebAssembly 版 Python）运行，不用安装任何东西。

## 怎么玩

1. 启动一个本地服务器（需要联网，首次会下载约 10 MB 的 Python 运行环境）：

   ```bash
   python3 -m http.server 8765
   ```

2. 浏览器打开 <http://localhost:8765>

> 直接双击 `index.html` 通常也能打开；如果页面一直停在"正在启动 Python 运行环境"，就用上面的方式。

进度和每一关写过的代码都会自动存在浏览器的 localStorage 里，刷新不会丢。

## 现有关卡（Python 入门课程）

| 关 | 标题 | 教的概念 | 特殊规则 |
|---|---|---|---|
| 1 | 启动机器人 | 函数调用、参数 | |
| 2 | 拐角 | 顺序执行 | |
| 3 | 楼梯 | for 循环、缩进 | 最多 5 行代码 |
| 4 | 未知的距离 | 变量 | 3 组隐藏测试（distance 不同） |
| 5 | 捡宝石 | if 判断、布尔值 | 3 组隐藏测试（宝石位置不同） |
| 6 | 黑暗走廊 | while 循环 | 3 组隐藏测试（长度不同） |
| 7 | 路线图 | 列表、遍历 | 3 组隐藏测试（route 不同） |
| 8 | 自定义指令 | def 定义函数 | 必须定义至少一个函数 |
| 9 | 螺旋迷宫 | 综合：while + if/else + not | |

## 文件结构

```
index.html     页面骨架（三栏：关卡列表 / 地图+输出 / 任务+知识点+代码+指令表）
style.css      样式（深色主题）
levels.js      ★ 关卡数据 —— 加关卡改这里
py_runtime.js  ★ 机器人世界的 Python 代码 —— 加新指令改这里
game.js        游戏引擎：Pyodide 桥接、画地图、动画、编辑器、存档
```

### 一次运行发生了什么

1. `game.js` 把玩家代码和本关地图（JSON）交给 Pyodide 里的 `run_level()`
2. `py_runtime.js` 里的 `World` 类模拟机器人：每个 `move()` / `turn_left()` 都记在 `log` 里，撞墙、死循环、乱捡宝石会抛出中文错误
3. 返回 `{ok, won, error, log}`，`game.js` 按 `log` 播放动画，再显示结果
4. 有多组地图（隐藏测试）时，每组都跑一遍，演示第一个失败的那组

## 怎么加一关

在 `levels.js` 的 `LEVELS` 数组末尾加一个对象：

```js
{
  id: 10,
  title: "关卡名",
  concept: "教的概念（显示在标签上）",
  story: "剧情 / 背景，一两句话。",
  goal: "任务目标，一句话。",
  teach: `<p>知识点卡片，支持 HTML：<code>行内代码</code></p>
<pre>多行
代码示例</pre>`,
  hint: "点「看提示」才显示的提示。",
  commands: ["move", "turn_left", "turn_right"],   // 本关指令表里列出哪些指令，见 COMMANDS
  starter: "# 玩家一进关卡看到的初始代码\n",
  solution: "move(3)",            // 参考答案，不会显示给玩家；devCheck() 用它来自动验证关卡
  maxLines: 5,                     // 可选：最多几行代码（空行和注释不算）
  requireDef: true,                // 可选：必须用 def 定义函数
  variants: [                      // 一组或多组地图，多组就是"隐藏测试"，全部通过才算过关
    {
      width: 7, height: 3,         // 网格大小
      start: [1, 1], dir: 0,       // 起点坐标和朝向：0=东(右) 1=南(下) 2=西(左) 3=北(上)
      goal: [5, 1],                // 终点（可以不写，比如只要求捡完宝石的关卡）
      walls: wallsExcept(7, 3, row(1, 0, 6)),  // 墙的坐标列表；wallsExcept 把路径以外都变成墙
      gems: [[3, 1]],              // 可选：宝石，必须全部捡起来才算过关
      vars: { distance: 4 },       // 可选：注入到玩家代码里的变量
    },
  ],
}
```

坐标系：左上角是 `(0, 0)`，x 向右、y 向下。
画地图的小工具：`row(y, x0, x1)` 一行、`col(x, y0, y1)` 一列、`wallsExcept(w, h, 开放格子)` 其余全是墙。

加完关卡后，在浏览器控制台输入 `devCheck()`，会用每一关的 `solution` 跑一遍并打印表格，确认地图和答案对得上。

## 怎么加一个新指令

比如想加 `gems_left()`（返回还剩几颗宝石）：

1. `py_runtime.js` 的 `World` 类里加方法：
   ```python
   def gems_left(self):
       return len(self.gems)
   ```
2. 同文件 `run_level()` 里把它注入给玩家：在那个 `for name in (...)` 元组里加 `"gems_left"`
3. `levels.js` 的 `COMMANDS` 里加说明，然后在想用的关卡 `commands` 里列出来

如果指令会改变画面（比如"放下一块砖"），还要在 `World` 方法里 `self.log.append({...})`，
并在 `game.js` 的 `playLog()` 里加对应的动画分支。

## 调试工具

- 左下角「开发模式」：解锁全部关卡
- 浏览器控制台：
  - `devCheck()` —— 用参考答案验证所有关卡
  - `PyQuest.loadLevel(i)` —— 跳到第 i 关（从 0 数）
  - `PyQuest.runPython(code, variant, requireDef)` —— 直接跑一段代码看返回结果
  - `localStorage.removeItem("pyquest.save.v1")` —— 清空存档

## 下一步可以做什么

- **更多概念**：字符串、字典、函数返回值、嵌套循环、递归……每个概念设计一两关
- **评分**：按代码行数或动作数给 1～3 星，鼓励写得更短
- **更多机关**：钥匙和门、传送带、会动的敌人、需要 `print()` 输出密码的终端
- **关卡编辑器**：在页面上点格子画地图，导出成 `levels.js` 格式
- **音效和手感**：移动、捡宝石、过关的音效，机器人的小动画
- **第二门语言**：运行时换成 JS（直接 `new Function`）就能做 JavaScript 关卡，关卡格式可以共用
