#!/usr/bin/env node
// ============================================================
//  课程自动校验：node dev/check_curriculum.js
//  用本机的 python3 跑 runtime.js 里的 Python 运行时，检查每一章：
//    - learn 示例能正常运行、没有报错
//    - predict 的正确选项和真实输出一致
//    - fill / code / fix 的参考答案能通过检查，而初始代码不能直接通过
//  浏览器里也可以在控制台输入 PyPlanet.check() 做同样的事。
// ============================================================
const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawnSync } = require("child_process");

const root = path.join(__dirname, "..");
const load = (f) => fs.readFileSync(path.join(root, f), "utf8");

// 在 Node 里像浏览器加载 <script> 一样依次执行这些脚本，拿到 PY_RUNTIME 和章节数据
const vm = require("vm");
const ctx = vm.createContext({ console });
const run = (f) => vm.runInContext(load(f), ctx, { filename: f });
run("runtime.js");
run("curriculum.js");
for (const f of fs.readdirSync(path.join(root, "chapters")).filter((f) => f.endsWith(".js")).sort()) run("chapters/" + f);
const { PLAN, CHAPTER_CONTENT, PY_RUNTIME } = vm.runInContext("({ PLAN, CHAPTER_CONTENT, PY_RUNTIME })", ctx);
const chapters = PLAN.map((p) => ({ ...p, nodes: CHAPTER_CONTENT[p.id] || null }));

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pyplanet-"));
fs.writeFileSync(path.join(tmp, "runtime.py"), PY_RUNTIME);
fs.writeFileSync(path.join(tmp, "chapters.json"), JSON.stringify(chapters));

const r = spawnSync("python3", ["-I", path.join(__dirname, "check_curriculum.py"), path.join(tmp, "runtime.py"), path.join(tmp, "chapters.json")], { stdio: "inherit" });
process.exit(r.status ?? 1);
