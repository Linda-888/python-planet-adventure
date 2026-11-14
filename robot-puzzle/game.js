// ============================================================
//  游戏引擎：Pyodide 桥接、地图渲染、动画、编辑器、存档
// ============================================================
(() => {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const key = (x, y) => `${x},${y}`;
  const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/";

  // ---------- 存档（localStorage） ----------
  const STORE_KEY = "pyquest.save.v1";
  const DEFAULT_SAVE = { completed: [], codes: {}, level: 0, dev: false };
  let save = { ...DEFAULT_SAVE };
  try { save = { ...DEFAULT_SAVE, ...JSON.parse(localStorage.getItem(STORE_KEY) || "{}") }; } catch (_) { /* 忽略 */ }
  const persist = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(save)); } catch (_) { /* 忽略 */ } };

  // ---------- DOM ----------
  const el = {
    loading: $("#loading"), loadingStatus: $("#loading-status"),
    levelList: $("#level-list"), devUnlock: $("#dev-unlock"),
    title: $("#level-title"), concept: $("#level-concept"), story: $("#level-story"),
    goal: $("#level-goal"), rules: $("#level-rules"),
    hintBtn: $("#btn-hint"), hint: $("#level-hint"), teach: $("#level-teach"), commands: $("#commands"),
    code: $("#code"), gutter: $("#gutter"), console: $("#console"),
    run: $("#btn-run"), reset: $("#btn-reset"), clear: $("#btn-clear"), restore: $("#btn-restore"), speed: $("#speed"),
    progressText: $("#progress-text"), progressFill: $("#progress-fill"),
    win: $("#win"), winTitle: $("#win-title"), winText: $("#win-text"), next: $("#btn-next"), stay: $("#btn-stay"),
    canvas: $("#board"),
  };

  // ---------- 状态 ----------
  let pyodide = null;
  let cur = 0;          // 当前关卡下标
  let runId = 0;        // 每次运行 +1，用来中断正在播放的动画
  let running = false;
  let world = null;     // 画面上的机器人状态

  // ============================================================
  //  Pyodide
  // ============================================================
  async function initPython() {
    try {
      el.loadingStatus.textContent = "下载 Pyodide…";
      pyodide = await loadPyodide({ indexURL: PYODIDE_URL });
      el.loadingStatus.textContent = "加载机器人运行时…";
      pyodide.runPython(PY_RUNTIME);
      el.loading.classList.add("hidden");
      logLine("Python 已就绪。写好代码后点「运行」或按 ⌘/Ctrl + Enter。", "muted");
    } catch (err) {
      el.loadingStatus.textContent = "加载失败：" + err.message + "（需要联网才能下载 Python 运行环境，请刷新重试）";
      el.loadingStatus.style.color = "#f87171";
    }
  }

  // 用某一组地图配置运行玩家代码，返回 {ok, won, error, log, final}
  function runPython(code, variant, requireDef) {
    pyodide.globals.set("_code", code);
    pyodide.globals.set("_cfg", JSON.stringify(variant));
    pyodide.globals.set("_req", !!requireDef);
    return JSON.parse(pyodide.runPython("run_level(_code, _cfg, _req)"));
  }

  // ============================================================
  //  渲染
  // ============================================================
  const ctx = el.canvas.getContext("2d");
  const CW = 560, CH = 420;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  el.canvas.width = CW * DPR;
  el.canvas.height = CH * DPR;
  ctx.scale(DPR, DPR);

  function makeWorld(cfg) {
    return {
      cfg,
      x: cfg.start[0], y: cfg.start[1],
      dir: cfg.dir || 0, angle: (cfg.dir || 0) * 90,
      gems: new Set((cfg.gems || []).map(([x, y]) => key(x, y))),
      walls: new Set((cfg.walls || []).map(([x, y]) => key(x, y))),
      crash: null, sparkle: null, shake: 0,
    };
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawEmoji(emoji, cx, cy, size) {
    ctx.font = `${size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, cx, cy + size * 0.06);
  }

  function drawRobot(cx, cy, cell, angle) {
    const s = cell * 0.7;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((angle * Math.PI) / 180);
    // 履带
    ctx.fillStyle = "#1e293b";
    roundRect(-s * 0.45, -s * 0.55, s * 0.9, s * 0.16, 3); ctx.fill();
    roundRect(-s * 0.45, s * 0.39, s * 0.9, s * 0.16, 3); ctx.fill();
    // 身体
    roundRect(-s / 2, -s * 0.4, s, s * 0.8, s * 0.2);
    ctx.fillStyle = "#38bdf8"; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = "#0284c7"; ctx.stroke();
    // 面罩（朝向 +x，也就是前方）
    roundRect(s * 0.08, -s * 0.28, s * 0.34, s * 0.56, s * 0.08);
    ctx.fillStyle = "#0b1220"; ctx.fill();
    // 眼睛
    ctx.fillStyle = "#a5f3fc";
    ctx.beginPath(); ctx.arc(s * 0.27, -s * 0.12, s * 0.06, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s * 0.27, s * 0.12, s * 0.06, 0, Math.PI * 2); ctx.fill();
    // 尾部天线
    ctx.strokeStyle = "#0284c7"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-s * 0.5, 0); ctx.lineTo(-s * 0.62, 0); ctx.stroke();
    ctx.fillStyle = "#f472b6";
    ctx.beginPath(); ctx.arc(-s * 0.66, 0, s * 0.07, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function draw() {
    if (!world) return;
    const { cfg } = world;
    const cell = Math.floor(Math.min((CW - 24) / cfg.width, (CH - 24) / cfg.height));
    const ox = Math.floor((CW - cell * cfg.width) / 2);
    const oy = Math.floor((CH - cell * cfg.height) / 2);

    ctx.clearRect(0, 0, CW, CH);
    ctx.fillStyle = "#0b0f19";
    ctx.fillRect(0, 0, CW, CH);

    // 地板与墙
    for (let y = 0; y < cfg.height; y++) {
      for (let x = 0; x < cfg.width; x++) {
        const px = ox + x * cell, py = oy + y * cell;
        if (world.walls.has(key(x, y))) {
          ctx.fillStyle = "#1a2234"; ctx.fillRect(px, py, cell, cell);
          ctx.fillStyle = "#2b3650"; ctx.fillRect(px + 2, py + 2, cell - 4, cell - 4);
          ctx.fillStyle = "#344160"; ctx.fillRect(px + 4, py + 4, cell - 8, Math.max(2, (cell - 8) * 0.35));
        } else {
          ctx.fillStyle = "#131b2c"; ctx.fillRect(px, py, cell, cell);
          ctx.strokeStyle = "#1e2a40"; ctx.lineWidth = 1;
          ctx.strokeRect(px + 0.5, py + 0.5, cell - 1, cell - 1);
          ctx.fillStyle = "#1e2a40";
          ctx.fillRect(px + cell / 2 - 1, py + cell / 2 - 1, 2, 2);
        }
      }
    }

    // 终点
    if (cfg.goal) {
      const [gx, gy] = cfg.goal;
      const px = ox + gx * cell, py = oy + gy * cell;
      ctx.fillStyle = "rgba(34,197,94,.16)"; ctx.fillRect(px + 1, py + 1, cell - 2, cell - 2);
      ctx.strokeStyle = "rgba(34,197,94,.55)"; ctx.lineWidth = 2; ctx.strokeRect(px + 2, py + 2, cell - 4, cell - 4);
      drawEmoji("🚩", px + cell / 2, py + cell / 2, cell * 0.6);
    }

    // 宝石
    for (const k of world.gems) {
      const [gx, gy] = k.split(",").map(Number);
      drawEmoji("💎", ox + (gx + 0.5) * cell, oy + (gy + 0.5) * cell, cell * 0.55);
    }

    // 撞墙标记
    if (world.crash) {
      const px = ox + world.crash.x * cell, py = oy + world.crash.y * cell;
      ctx.fillStyle = "rgba(248,113,113,.35)"; ctx.fillRect(px, py, cell, cell);
      drawEmoji("💥", px + cell / 2, py + cell / 2, cell * 0.7);
    }

    // 捡宝石的光圈
    if (world.sparkle) {
      const { x, y, t } = world.sparkle;
      ctx.strokeStyle = `rgba(253,224,71,${t})`; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(ox + (x + 0.5) * cell, oy + (y + 0.5) * cell, cell * (0.25 + (1 - t) * 0.45), 0, Math.PI * 2);
      ctx.stroke();
    }

    // 机器人
    const jx = world.shake ? Math.sin(world.shake * 40) * 3 : 0;
    drawRobot(ox + (world.x + 0.5) * cell + jx, oy + (world.y + 0.5) * cell, cell, world.angle);
  }

  function resetWorld(cfg) {
    world = makeWorld(cfg);
    draw();
  }

  // ============================================================
  //  动画播放
  // ============================================================
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  function tween(ms, fn) {
    return new Promise((resolve) => {
      const t0 = performance.now();
      const frame = (t) => {
        const p = Math.min(1, (t - t0) / ms);
        fn(p);
        if (p < 1) requestAnimationFrame(frame); else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  async function playLog(log, token) {
    const speed = +el.speed.value;
    for (const e of log) {
      if (token !== runId) return false;
      if (e.t === "move") {
        const x0 = world.x, y0 = world.y;
        await tween(speed, (p) => { world.x = x0 + (e.x - x0) * p; world.y = y0 + (e.y - y0) * p; draw(); });
        world.x = e.x; world.y = e.y; draw();
      } else if (e.t === "turn") {
        const a0 = world.angle;
        const a1 = e.d * 90;
        const d = ((((a1 - a0) % 360) + 540) % 360) - 180; // 最短旋转方向
        await tween(speed * 0.7, (p) => { world.angle = a0 + d * p; draw(); });
        world.angle = a1; world.dir = e.d; draw();
      } else if (e.t === "pick") {
        world.gems.delete(key(e.x, e.y));
        world.sparkle = { x: e.x, y: e.y, t: 1 };
        await tween(speed * 0.8, (p) => { world.sparkle.t = 1 - p; draw(); });
        world.sparkle = null; draw();
        logLine("💎 捡到一颗宝石！", "ok");
      } else if (e.t === "say") {
        logLine("💬 " + e.text, "say");
        await sleep(Math.min(speed, 160));
      } else if (e.t === "crash") {
        world.crash = { x: e.x, y: e.y };
        await tween(speed * 1.2, (p) => { world.shake = 1 - p; draw(); });
        world.shake = 0; draw();
      }
    }
    return token === runId;
  }

  // ============================================================
  //  输出面板
  // ============================================================
  function logLine(text, cls = "") {
    const div = document.createElement("div");
    div.className = "line " + cls;
    div.textContent = text;
    el.console.appendChild(div);
    el.console.scrollTop = el.console.scrollHeight;
  }
  function clearConsole() { el.console.innerHTML = ""; }

  // ============================================================
  //  运行
  // ============================================================
  function countCodeLines(code) {
    return code.split("\n").filter((l) => l.trim() && !l.trim().startsWith("#")).length;
  }
  function describeVars(v) {
    const entries = Object.entries(v.vars || {});
    return entries.length ? "（" + entries.map(([k, val]) => `${k} = ${JSON.stringify(val)}`).join("，") + "）" : "";
  }

  async function runCode() {
    if (running || !pyodide) return;
    const lv = LEVELS[cur];
    const code = el.code.value;
    save.codes[lv.id] = code; persist();
    clearConsole(); clearErrorMark();

    if (!code.trim()) { logLine("代码是空的，先写点什么吧！", "warn"); return; }
    const n = countCodeLines(code);
    if (lv.maxLines && n > lv.maxLines) {
      logLine(`🚫 这一关最多只能写 ${lv.maxLines} 行代码（空行和注释不算），你写了 ${n} 行。试试用循环来精简。`, "err");
      return;
    }

    running = true; setButtons();
    const token = ++runId;

    // 对每一组地图/变量都跑一遍
    const results = lv.variants.map((v) => runPython(code, v, lv.requireDef));
    const failIdx = results.findIndex((r) => !r.ok);
    const showIdx = failIdx === -1 ? 0 : failIdx;
    const variant = lv.variants[showIdx];
    const r = results[showIdx];

    resetWorld(variant);
    if (lv.variants.length > 1) {
      logLine(`🧪 隐藏测试共 ${lv.variants.length} 组，正在演示第 ${showIdx + 1} 组${describeVars(variant)}`, "muted");
    }
    logLine("▶ 运行…", "muted");

    const finished = await playLog(r.log, token);
    if (!finished) return; // 被重置打断了

    const passed = results.filter((x) => x.ok).length;
    if (r.ok) {
      if (lv.variants.length > 1) logLine(`🧪 隐藏测试 ${passed}/${lv.variants.length} 全部通过`, "ok");
      logLine("✅ 任务完成！", "ok");
      running = false; setButtons();
      onWin(lv);
    } else {
      const e = r.error;
      const where = e.line ? `第 ${e.line} 行：` : "";
      const type = e.type === "NotDone" || e.type === "Rule" || e.type === "RobotError" || e.type === "StepLimit" ? "" : e.type + " · ";
      logLine(`❌ ${where}${type}${e.msg}`, "err");
      if (e.line) markErrorLine(e.line);
      if (lv.variants.length > 1) {
        logLine(`🧪 隐藏测试通过 ${passed}/${lv.variants.length}，失败的是第 ${showIdx + 1} 组${describeVars(variant)}`, "warn");
      }
      running = false; setButtons();
    }
  }

  function resetRobot() {
    runId++; // 打断动画
    running = false; setButtons();
    resetWorld(LEVELS[cur].variants[0]);
    clearErrorMark();
    logLine("↺ 机器人已回到起点。", "muted");
  }

  function setButtons() {
    el.run.disabled = running;
    el.run.textContent = running ? "⏳ 运行中…" : "";
    if (!running) el.run.innerHTML = "▶ 运行<kbd>⌘/Ctrl + Enter</kbd>";
  }

  // ============================================================
  //  过关
  // ============================================================
  function onWin(lv) {
    if (!save.completed.includes(lv.id)) save.completed.push(lv.id);
    persist();
    renderLevelList(); updateProgress();
    const isLast = cur === LEVELS.length - 1;
    el.winTitle.textContent = isLast ? "🏆 全部通关！" : `第 ${lv.id} 关通关！`;
    el.winText.textContent = isLast
      ? `你学会了：${lv.concept}。九层实验室全部走完，你已经掌握了 Python 最核心的几块积木。想继续？在 levels.js 里加你自己的关卡吧！`
      : `你学会了：${lv.concept}。下一关：${LEVELS[cur + 1].title}（${LEVELS[cur + 1].concept}）`;
    el.next.classList.toggle("hidden", isLast);
    el.win.classList.remove("hidden");
  }

  // ============================================================
  //  关卡切换
  // ============================================================
  const isUnlocked = (i) => save.dev || i === 0 || save.completed.includes(LEVELS[i - 1].id);

  function renderLevelList() {
    el.levelList.innerHTML = LEVELS.map((lv, i) => {
      const done = save.completed.includes(lv.id);
      const unlocked = isUnlocked(i);
      const cls = [i === cur ? "active" : "", done ? "done" : "", unlocked ? "" : "locked"].join(" ");
      const num = done ? "✓" : unlocked ? lv.id : "🔒";
      return `<li class="${cls}" data-i="${i}" title="${unlocked ? "" : "先通过上一关"}">
        <span class="num">${num}</span><span class="t">${lv.title}</span><span class="c">${lv.concept}</span></li>`;
    }).join("");
  }

  function updateProgress() {
    const n = save.completed.length;
    el.progressText.textContent = `已通关 ${n} / ${LEVELS.length}`;
    el.progressFill.style.width = `${(n / LEVELS.length) * 100}%`;
  }

  function loadLevel(i) {
    runId++; running = false; setButtons();
    cur = i; save.level = i; persist();
    const lv = LEVELS[i];

    el.title.textContent = `第 ${lv.id} 关 · ${lv.title}`;
    el.concept.textContent = lv.concept;
    el.story.textContent = lv.story;
    el.goal.textContent = lv.goal;

    const rules = [];
    if (lv.maxLines) rules.push(`📏 本关最多 ${lv.maxLines} 行代码（空行和注释不算）`);
    if (lv.variants.length > 1) rules.push(`🧪 本关有 ${lv.variants.length} 组隐藏测试，全部通过才算过关`);
    if (lv.requireDef) rules.push("🧩 必须用 def 定义至少一个自己的函数");
    el.rules.textContent = rules.join("\n");
    el.rules.classList.toggle("hidden", rules.length === 0);

    el.hint.textContent = lv.hint;
    el.hint.classList.add("hidden");
    el.hintBtn.textContent = "💡 看提示";
    el.teach.innerHTML = lv.teach;
    el.commands.innerHTML = lv.commands.map((c) => `<li><code>${COMMANDS[c].sig}</code><span>${COMMANDS[c].desc}</span></li>`).join("");

    el.code.value = save.codes[lv.id] ?? lv.starter;
    updateGutter(); clearErrorMark();

    resetWorld(lv.variants[0]);
    clearConsole();
    logLine(`已进入第 ${lv.id} 关：${lv.title}`, "muted");
    renderLevelList(); updateProgress();
    el.win.classList.add("hidden");
  }

  // ============================================================
  //  编辑器：行号、Tab、自动缩进
  // ============================================================
  function updateGutter() {
    const n = el.code.value.split("\n").length;
    el.gutter.innerHTML = Array.from({ length: n }, (_, i) => `<div class="ln" data-ln="${i + 1}">${i + 1}</div>`).join("");
    el.gutter.scrollTop = el.code.scrollTop;
  }
  function markErrorLine(line) {
    const ln = el.gutter.querySelector(`[data-ln="${line}"]`);
    if (ln) ln.classList.add("err");
  }
  function clearErrorMark() {
    el.gutter.querySelectorAll(".ln.err").forEach((x) => x.classList.remove("err"));
  }
  function insertText(text) {
    // execCommand 能保留撤销历史；不支持时退回 setRangeText
    if (!document.execCommand || !document.execCommand("insertText", false, text)) {
      el.code.setRangeText(text, el.code.selectionStart, el.code.selectionEnd, "end");
    }
    updateGutter();
  }
  // 删除当前选中的文字，光标停在删除处（Backspace 退一级缩进用）
  function deleteSelection() {
    const s = el.code.selectionStart;
    if (!document.execCommand || !document.execCommand("delete")) {
      el.code.setRangeText("", s, el.code.selectionEnd, "start");
    }
    el.code.setSelectionRange(s, s);
    updateGutter();
  }

  el.code.addEventListener("keydown", (ev) => {
    if ((ev.metaKey || ev.ctrlKey) && ev.key === "Enter") { ev.preventDefault(); runCode(); return; }
    const { selectionStart: start, selectionEnd: end, value } = el.code;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const lineBefore = value.slice(lineStart, start);

    if (ev.key === "Tab") {
      ev.preventDefault();
      insertText("    ");
    } else if (ev.key === "Enter") {
      ev.preventDefault();
      const indent = (lineBefore.match(/^ */) || [""])[0];
      const extra = /:\s*(#.*)?$/.test(lineBefore) ? "    " : "";
      insertText("\n" + indent + extra);
    } else if (ev.key === "Backspace" && start === end && /^ +$/.test(lineBefore) && lineBefore.length % 4 === 0) {
      ev.preventDefault();
      el.code.setSelectionRange(start - 4, start);
      deleteSelection();
    }
  });
  let saveTimer = null;
  el.code.addEventListener("input", () => {
    updateGutter(); clearErrorMark();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { save.codes[LEVELS[cur].id] = el.code.value; persist(); }, 400);
  });
  el.code.addEventListener("scroll", () => { el.gutter.scrollTop = el.code.scrollTop; });

  // ============================================================
  //  事件绑定
  // ============================================================
  el.run.addEventListener("click", runCode);
  el.reset.addEventListener("click", resetRobot);
  el.clear.addEventListener("click", clearConsole);
  el.restore.addEventListener("click", () => {
    if (confirm("恢复成这一关的初始代码？你现在写的会被覆盖。")) {
      el.code.value = LEVELS[cur].starter; updateGutter();
      save.codes[LEVELS[cur].id] = el.code.value; persist();
    }
  });
  el.hintBtn.addEventListener("click", () => {
    const hidden = el.hint.classList.toggle("hidden");
    el.hintBtn.textContent = hidden ? "💡 看提示" : "🙈 收起提示";
  });
  el.levelList.addEventListener("click", (ev) => {
    const li = ev.target.closest("li[data-i]");
    if (!li) return;
    const i = +li.dataset.i;
    if (!isUnlocked(i)) { logLine("🔒 这关还没解锁，先通过上一关（或在左下角打开开发模式）。", "warn"); return; }
    loadLevel(i);
  });
  el.devUnlock.checked = !!save.dev;
  el.devUnlock.addEventListener("change", () => { save.dev = el.devUnlock.checked; persist(); renderLevelList(); });
  el.next.addEventListener("click", () => loadLevel(Math.min(cur + 1, LEVELS.length - 1)));
  el.stay.addEventListener("click", () => el.win.classList.add("hidden"));
  el.win.addEventListener("click", (ev) => { if (ev.target === el.win) el.win.classList.add("hidden"); });

  // ============================================================
  //  开发者工具：在浏览器控制台输入 devCheck() 可以验证所有关卡的参考答案
  // ============================================================
  window.devCheck = function devCheck() {
    if (!pyodide) { console.warn("Python 还没加载完"); return; }
    const rows = LEVELS.map((lv) => {
      const rs = lv.variants.map((v) => runPython(lv.solution, v, lv.requireDef));
      return {
        关卡: lv.id, 标题: lv.title,
        通过: rs.every((r) => r.ok) ? "✓" : "✗",
        详情: rs.map((r) => (r.ok ? "ok" : r.error && r.error.msg)).join(" | "),
      };
    });
    console.table(rows);
    return rows;
  };
  window.PyQuest = { LEVELS, COMMANDS, runPython: (...a) => runPython(...a), loadLevel, get save() { return save; } };

  // ============================================================
  //  启动
  // ============================================================
  loadLevel(Math.min(save.level || 0, LEVELS.length - 1));
  initPython();
})();
