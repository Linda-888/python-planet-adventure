// ============================================================
//  课程大纲：整个 Python 的知识地图
//  每一章的具体内容在 chapters/ 目录下，一章一个文件，用 defineChapter(id, nodes) 注册。
//  还没写内容的章节会在地图上显示为"开发中"。
//
//  一章 = 若干"知识水晶"(nodes)，探险者走到水晶前就触发一次互动学习。
//  一颗水晶 = 一串 steps：
//    learn   讲解 + 可以改着玩的示例代码（必须运行一次才能继续）
//    fill    填空：把 ____ 填上，运行后检查
//    code    写代码：按要求写，检查输出 / 变量 / 用到的语法
//    fix     改 bug：给一段有错的代码，改到正确
//    predict 猜输出：选择题，选完真的运行一遍验证
//
//  练习题可用的检查字段：
//    expect         期望的完整输出（忽略每行末尾和整体首尾空白）
//    expectContains 输出里必须包含的片段列表
//    check          一段 Python 检查代码，用 assert；可以读玩家的变量、_stdout（输出）、_code（源码）
//    mustMatch      正则（字符串），源码必须匹配，否则提示 mustMatchMsg
//    stdin          自动喂给 input() 的输入列表
//    cases          多组测试 [{stdin, expect, expectContains, check}, ...]，全部通过才算对
//    solution       参考答案（连错 3 次后玩家可以查看；也用于 dev/check_curriculum.js 自动校验）
// ============================================================

const PLAN = [
  { id: "basics", title: "变量与数据类型", desc: "从第一行代码开始：print、变量、数字、字符串、布尔值、类型转换。", topics: ["print", "变量", "数字运算", "字符串", "f-string", "布尔值", "类型转换"] },
  { id: "conditions", title: "条件判断", desc: "让程序学会选择：input 读入、if / elif / else、组合条件、真值判断。", topics: ["input", "if", "elif / else", "and / or / not", "真值"] },
  { id: "loops", title: "循环", desc: "重复做事：for 与 range、累加器、while、break / continue、嵌套循环。", topics: ["for", "range", "累加", "while", "break / continue", "嵌套"] },
  { id: "lists", title: "列表与元组", desc: "一次装很多数据：索引、增删改、切片、遍历、排序，以及不可变的元组。", topics: ["列表", "索引切片", "append / pop", "排序", "元组解包"] },
  { id: "dicts", title: "字典与集合", desc: "用键找值：字典的增删改查、遍历；集合的去重与交并差。", topics: ["字典", "键值对", "遍历", "集合"] },
  { id: "strings2", title: "字符串进阶", desc: "常用方法 split / join / strip / replace、格式化、转义字符。", topics: ["字符串方法", "格式化", "转义"] },
  { id: "functions", title: "函数", desc: "把代码打包复用：def、参数与默认值、返回值、作用域、lambda。", topics: ["def", "参数", "return", "作用域", "lambda"] },
  { id: "modules", title: "模块与标准库", desc: "站在巨人肩膀上：import、math、random、datetime、自己写模块。", topics: ["import", "math", "random", "datetime"] },
  { id: "errors", title: "异常处理", desc: "优雅地面对错误：try / except / finally、常见异常、raise。", topics: ["try / except", "finally", "raise", "自定义异常"] },
  { id: "files", title: "文件读写", desc: "把数据存下来：open、读写文本、with 语句、处理 CSV / JSON。", topics: ["open", "with", "读写", "JSON"] },
  { id: "oop", title: "类与对象", desc: "面向对象入门：class、__init__、属性与方法、self。", topics: ["class", "__init__", "方法", "self"] },
  { id: "oop2", title: "继承与魔术方法", desc: "继承、重写、super()、__str__ 等魔术方法、多态。", topics: ["继承", "super()", "__str__", "多态"] },
  { id: "comprehensions", title: "推导式与生成器", desc: "更 Pythonic 的写法：列表 / 字典推导式、生成器、yield。", topics: ["列表推导式", "字典推导式", "生成器", "yield"] },
  { id: "functional", title: "高阶函数与装饰器", desc: "函数也是值：map / filter / sorted(key=)、闭包、装饰器。", topics: ["map / filter", "闭包", "装饰器"] },
  { id: "builtins", title: "内置工具箱", desc: "zip、enumerate、any / all、解包等日常高频小技巧。", topics: ["zip", "enumerate", "解包", "any / all"] },
  { id: "project", title: "综合项目", desc: "用学到的一切做一个小项目：记账本、文字游戏、数据统计……", topics: ["综合运用"] },
];

const CHAPTER_CONTENT = {};
function defineChapter(id, nodes) {
  if (!PLAN.some((p) => p.id === id)) console.warn("defineChapter: 大纲里没有这一章", id);
  CHAPTER_CONTENT[id] = nodes;
}
