// ============================================================
//  Python 星球探险 —— 游戏逻辑
//  地图（选章节）→ 场景（走路、碰到水晶）→ 互动学习卡 → 图鉴
// ============================================================
(() => {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s ?? "").replace(/\r/g, "").split("\n").map((l) => l.trimEnd()).join("\n").trim();
  const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/";

  // 大纲 + 已写好的章节内容 → 完整章节列表（没内容的章节 nodes 为 null，地图上显示"开发中"）
  const CHAPTERS = PLAN.map((p) => ({ ...p, nodes: CHAPTER_CONTENT[p.id] || null }));

  // ---------- 存档 ----------
  const STORE_KEY = "pyplanet.save.v1";
  let save = { chapters: {}, codex: [] };
  try { save = { ...save, ...JSON.parse(localStorage.getItem(STORE_KEY) || "{}") }; } catch (_) { /* 忽略 */ }
  const persist = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(save)); } catch (_) { /* 忽略 */ } };
  const chapterState = (id) => (save.chapters[id] ||= { cleared: 0, done: false });

  // ---------- DOM ----------
  const el = {
    loading: $("#loading"), loadingStatus: $("#loading-status"),
    viewMap: $("#view-map"), viewScene: $("#view-scene"), chapterGrid: $("#chapter-grid"),
    chapterName: $("#chapter-name"), dots: $("#node-dots"), codexCount: $("#codex-count"),
    scene: $("#scene"), stars: $("#stars"), hills: $("#hills"), road: $("#road"), nodes: $("#nodes"),
    hero: $("#hero"), bubble: $("#bubble"), walk: $("#btn-walk"), status: $("#scene-status"),
    enc: $("#encounter"), encIcon: $("#enc-icon"), encTitle: $("#enc-title"), encSteps: $("#enc-steps"), encBody: $("#enc-body"),
    codex: $("#codex"), codexBody: $("#codex-body"),
  };

  // ---------- Pyodide ----------
  let pyodide = null;
  async function initPython() {
    try {
      el.loadingStatus.textContent = "下载 Pyodide…";
      pyodide = await loadPyodide({ indexURL: PYODIDE_URL });
      el.loadingStatus.textContent = "加载运行时…";
      pyodide.runPython(PY_RUNTIME);
      el.loading.classList.add("hidden");
    } catch (err) {
      el.loadingStatus.textContent = "加载失败：" + err.message + "（需要联网下载 Python 运行环境，请刷新重试）";
      el.loadingStatus.style.color = "#fb7185";
    }
  }
  function runCode(code, check = "", stdin = []) {
    pyodide.globals.set("_code_", code);
    pyodide.globals.set("_check_", check || "");
    pyodide.globals.set("_stdin_", JSON.stringify(stdin || []));
    return JSON.parse(pyodide.runPython("run_code(_code_, _check_, _stdin_)"));
  }

  // ============================================================
  //  地图
  // ============================================================
  function showMap() {
    el.viewScene.classList.add("hidden");
    el.viewMap.classList.remove("hidden");
    el.chapterName.textContent = "";
    el.dots.innerHTML = "";
    renderMap();
  }
  function renderMap() {
    el.chapterGrid.innerHTML = CHAPTERS.map((c, i) => {
      const st = chapterState(c.id);
      const avail = Array.isArray(c.nodes) && c.nodes.length > 0;
      let state = "🔒 开发中";
      if (avail) state = st.done ? "✅ 已完成 · 再逛逛" : st.cleared ? `继续 ${st.cleared}/${c.nodes.length} →` : "开始探险 →";
      return `<div class="chapter ${avail ? "" : "locked"} ${st.done ? "done" : ""}" data-id="${c.id}">
        <div class="ch-num">${i + 1}</div>
        <div class="ch-main"><b>${esc(c.title)}</b><div class="ch-desc">${esc(c.desc)}</div>
          <div class="ch-topics">${c.topics.map((t) => `<span>${esc(t)}</span>`).join("")}</div></div>
        <div class="ch-state">${state}</div></div>`;
    }).join("");
  }
  el.chapterGrid.addEventListener("click", (ev) => {
    const card = ev.target.closest(".chapter[data-id]");
    if (!card || card.classList.contains("locked")) return;
    enterChapter(CHAPTERS.find((c) => c.id === card.dataset.id));
  });

  // ============================================================
  //  场景：走路、碰到水晶
  // ============================================================
  let ch = null;       // 当前章节
  let wx = 0;          // 探险者在世界里的 x 坐标
  let walking = false;
  const NODE_START = 360, NODE_GAP = 380;
  const nodeX = (i) => NODE_START + i * NODE_GAP;

  function enterChapter(chapter) {
    ch = chapter;
    el.viewMap.classList.add("hidden");
    el.viewScene.classList.remove("hidden");
    el.chapterName.textContent = `第 ${CHAPTERS.indexOf(ch) + 1} 章 · ${ch.title}`;
    const st = chapterState(ch.id);
    el.nodes.innerHTML = ch.nodes.map((n, i) =>
      `<div class="node" data-i="${i}" style="left:${nodeX(i)}px"><div class="crystal"></div><div class="label">${esc(n.title)}</div></div>`).join("");
    wx = st.cleared === 0 ? 0 : nodeX(st.cleared - 1);
    updateNodes(); applyWorld(); updateDots(); updateStatus();
    if (st.cleared === 0) bubble("按 → 或点「前进」出发！碰到水晶就能学到新知识。", 4500);
    else if (st.done) bubble("这一章已经走完啦，可以回地图，或者再看看图鉴。", 3500);
    else bubble("欢迎回来！继续往前走吧。", 2500);
  }

  function updateNodes() {
    const st = chapterState(ch.id);
    el.nodes.querySelectorAll(".node").forEach((n, i) => {
      n.classList.toggle("cleared", i < st.cleared);
      n.classList.toggle("current", i === st.cleared);
      n.querySelector(".crystal").textContent = i < st.cleared ? "✨" : (ch.nodes[i].boss ? "👑" : "🔮");
    });
  }
  function applyWorld() {
    const hx = Math.round(el.scene.clientWidth * 0.3);
    const off = hx - wx;
    el.nodes.style.transform = `translateX(${off}px)`;
    el.road.style.backgroundPositionX = `${off}px, 0`;
    el.hills.style.backgroundPositionX = `${off * 0.4}px`;
    el.stars.style.backgroundPositionX = `${off * 0.15}px`;
    el.hero.style.left = `${hx}px`;
  }
  function updateDots() {
    const st = chapterState(ch.id);
    el.dots.innerHTML = ch.nodes.map((_, i) => `<span class="dot ${i < st.cleared ? "done" : i === st.cleared ? "cur" : ""}"></span>`).join("");
  }
  function updateStatus() {
    const st = chapterState(ch.id);
    if (st.cleared >= ch.nodes.length) {
      el.status.textContent = "🎉 本章全部水晶已收集！";
      el.walk.textContent = "回到地图 🗺";
    } else {
      const n = ch.nodes[st.cleared];
      el.status.textContent = `前方：${n.boss ? "👑 " : "🔮 "}${n.title}（${st.cleared + 1} / ${ch.nodes.length}）`;
      el.walk.innerHTML = "前进 →<kbd>→</kbd>";
    }
  }
  let bubbleTimer = null;
  function bubble(text, ms = 2000) {
    el.bubble.textContent = text; el.bubble.classList.remove("hidden");
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => el.bubble.classList.add("hidden"), ms);
  }
  function tween(ms, fn) {
    return new Promise((resolve) => {
      const t0 = performance.now();
      const frame = (t) => { const p = Math.min(1, (t - t0) / ms); fn(p); p < 1 ? requestAnimationFrame(frame) : resolve(); };
      requestAnimationFrame(frame);
    });
  }
  const easeInOut = (p) => (p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p);

  async function walk() {
    if (walking || !ch || !pyodide) return;
    const st = chapterState(ch.id);
    if (st.cleared >= ch.nodes.length) { showMap(); return; }
    walking = true; el.walk.disabled = true;
    el.bubble.classList.add("hidden");
    el.hero.classList.add("walking");
    const from = wx, to = nodeX(st.cleared);
    const dur = Math.min(2200, 500 + Math.abs(to - from) * 3);
    await tween(dur, (p) => { wx = from + (to - from) * easeInOut(p); applyWorld(); });
    el.hero.classList.remove("walking");
    bubble(ch.nodes[st.cleared].boss ? "终点挑战！" : "发现知识水晶！", 1200);
    await sleep(650);
    walking = false; el.walk.disabled = false;
    openEncounter(st.cleared);
  }
  el.walk.addEventListener("click", walk);
  document.addEventListener("keydown", (ev) => {
    if (ev.key !== "ArrowRight") return;
    if (el.viewScene.classList.contains("hidden") || !el.enc.classList.contains("hidden") || !el.codex.classList.contains("hidden")) return;
    ev.preventDefault(); walk();
  });
  window.addEventListener("resize", () => { if (ch) applyWorld(); });

  // ============================================================
  //  互动学习卡
  // ============================================================
  const STEP_ICON = { learn: "📘", fill: "✏️", code: "💻", fix: "🔧", predict: "🤔" };
  const STEP_NAME = { learn: "讲解", fill: "填空", code: "动手写", fix: "改 bug", predict: "猜输出" };
  let enc = null;

  function openEncounter(i) {
    const node = ch.nodes[i];
    enc = { i, node, step: 0 };
    el.encIcon.textContent = node.boss ? "👑" : "🔮";
    el.encTitle.textContent = node.title;
    el.enc.classList.remove("hidden");   // 先显示再渲染，编辑器才能量出正确的高度
    renderStep();
  }
  function renderStep() {
    const { node, step } = enc;
    const s = node.steps[step];
    el.encSteps.innerHTML = node.steps.map((x, k) =>
      `<span class="s ${k < step ? "done" : k === step ? "cur" : ""}" title="${STEP_NAME[x.type]}">${STEP_ICON[x.type]}</span>`).join("");
    el.encBody.innerHTML = "";
    const root = RENDER[s.type](s, step === node.steps.length - 1);
    el.encBody.appendChild(root);
    root.querySelectorAll("textarea").forEach((t) => t.dispatchEvent(new Event("refresh")));
    el.enc.querySelector(".card").scrollTop = 0;
  }
  function nextStep() {
    if (enc.step < enc.node.steps.length - 1) { enc.step++; renderStep(); } else completeNode();
  }
  function completeNode() {
    const st = chapterState(ch.id);
    if (st.cleared === enc.i) st.cleared = enc.i + 1;
    if (!save.codex.includes(enc.node.id)) save.codex.push(enc.node.id);
    if (st.cleared >= ch.nodes.length) st.done = true;
    persist();
    el.enc.classList.add("hidden");
    updateNodes(); updateDots(); updateStatus(); updateCodexCount();
    el.hero.classList.add("cheer");
    setTimeout(() => el.hero.classList.remove("cheer"), 800);
    bubble(`✨ 获得知识水晶：${enc.node.title}`, 2200);
    if (st.done) setTimeout(showChapterDone, 1200);
  }

  // ---- 小部件 ----
  function h(tag, cls, html) { const d = document.createElement(tag); if (cls) d.className = cls; if (html != null) d.innerHTML = html; return d; }
  function btn(label, cls = "") { const b = document.createElement("button"); b.className = cls; b.innerHTML = label; return b; }
  const showNl = (s) => esc(s).replace(/\n/g, '<span class="nl">⏎</span>');

  // 带行号、Tab/回车缩进的编辑器
  function makeEditor(initial, onRun) {
    const wrap = h("div", "editor");
    const gutter = h("div", "gutter");
    const ta = document.createElement("textarea");
    ta.spellcheck = false; ta.autocapitalize = "off"; ta.value = initial;
    wrap.append(gutter, ta);
    const refresh = () => {
      const n = ta.value.split("\n").length;
      gutter.innerHTML = Array.from({ length: n }, (_, i) => `<div class="ln" data-ln="${i + 1}">${i + 1}</div>`).join("");
      ta.style.height = "auto";
      ta.style.height = Math.max(64, ta.scrollHeight + 2) + "px";
      gutter.scrollTop = ta.scrollTop;
    };
    const insert = (text) => {
      if (!document.execCommand || !document.execCommand("insertText", false, text)) ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, "end");
      refresh();
    };
    const del = () => {
      const s = ta.selectionStart;
      if (!document.execCommand || !document.execCommand("delete")) ta.setRangeText("", s, ta.selectionEnd, "start");
      ta.setSelectionRange(s, s); refresh();
    };
    ta.addEventListener("keydown", (ev) => {
      if ((ev.metaKey || ev.ctrlKey) && ev.key === "Enter") { ev.preventDefault(); onRun && onRun(); return; }
      const { selectionStart: start, selectionEnd: end, value } = ta;
      const lineBefore = value.slice(value.lastIndexOf("\n", start - 1) + 1, start);
      if (ev.key === "Tab") { ev.preventDefault(); insert("    "); }
      else if (ev.key === "Enter") {
        ev.preventDefault();
        const indent = (lineBefore.match(/^ */) || [""])[0];
        insert("\n" + indent + (/:\s*(#.*)?$/.test(lineBefore) ? "    " : ""));
      } else if (ev.key === "Backspace" && start === end && /^ +$/.test(lineBefore) && lineBefore.length % 4 === 0) {
        ev.preventDefault(); ta.setSelectionRange(start - 4, start); del();
      }
    });
    ta.addEventListener("input", () => { refresh(); gutter.querySelectorAll(".err").forEach((x) => x.classList.remove("err")); });
    ta.addEventListener("scroll", () => { gutter.scrollTop = ta.scrollTop; });
    ta.addEventListener("refresh", refresh);
    return {
      el: wrap, ta,
      get value() { return ta.value; },
      set value(v) { ta.value = v; refresh(); },
      markError(line) { const ln = gutter.querySelector(`[data-ln="${line}"]`); if (ln) ln.classList.add("err"); },
    };
  }

  // 运行并判定一个练习：支持多组测试 cases（每组可有 stdin / expect / expectContains / check）
  function evaluate(s, code) {
    const cases = s.cases || [{ stdin: s.stdin, expect: s.expect, expectContains: s.expectContains }];
    const runs = [];
    let failed = null, reason = null;
    for (const c of cases) {
      const res = runCode(code, c.check ?? s.check, c.stdin);
      const run = { c, res };
      runs.push(run);
      const out = res.stdout || "";
      if (res.error) { failed = run; reason = { kind: "err" }; break; }
      if (res.check_msg) { failed = run; reason = { kind: "warn", msg: res.check_msg }; break; }
      if (s.mustMatch && !new RegExp(s.mustMatch).test(code)) { failed = run; reason = { kind: "warn", msg: s.mustMatchMsg || "写法不符合要求" }; break; }
      if (c.expect != null && norm(out) !== norm(c.expect)) { failed = run; reason = { kind: "expect", expect: c.expect }; break; }
      if (c.expectContains) {
        const miss = c.expectContains.find((t) => !out.includes(t));
        if (miss) { failed = run; reason = { kind: "warn", msg: `输出里应该有「${miss}」` }; break; }
      }
    }
    const graded = cases.some((c) => c.expect != null || c.expectContains || c.check) || !!s.check || !!s.mustMatch;
    return { runs, shown: failed || runs[0], failed, reason, passed: !failed, graded, total: cases.length, idx: runs.length - 1 };
  }

  // 把运行结果画到输出框里，返回是否通过
  function renderResult(box, ev, editor) {
    box.classList.remove("hidden");
    const { res, c } = ev.shown;
    const out = res.stdout || "";
    let html = "";
    if (ev.total > 1) {
      html += `<div class="out-label">${ev.passed ? `✅ ${ev.total} 组测试全部通过 · 下面是第 1 组` : `第 ${ev.idx + 1} / ${ev.total} 组测试没通过`}${c.stdin && c.stdin.length ? ` · 输入：${esc(c.stdin.join("，"))}` : ""}</div>`;
    } else if (c.stdin && c.stdin.length) {
      html += `<div class="out-label">⌨️ 自动输入：${esc(c.stdin.join("，"))}</div>`;
    }
    html += `<div class="out-label">输出</div><pre>${esc(out) || '<span class="muted">（没有任何输出——记得用 print）</span>'}</pre>`;
    if (ev.reason) {
      if (ev.reason.kind === "err") {
        html += `<div class="msg err">❌ ${res.error.line ? `第 ${res.error.line} 行：` : ""}${esc(res.error.msg)}</div>`;
        if (editor && res.error.line) editor.markError(res.error.line);
      } else if (ev.reason.kind === "expect") {
        html += `<div class="msg warn">🤔 输出和要求的不一样。应该输出：</div><pre class="expect">${esc(ev.reason.expect)}</pre>`;
      } else {
        html += `<div class="msg warn">🤔 ${esc(ev.reason.msg)}</div>`;
      }
    } else if (ev.graded) {
      html += `<div class="msg ok">✅ 正确！</div>`;
    }
    box.innerHTML = html;
    return ev.passed;
  }

  // 底部：提示 / 参考答案 / 下一步
  function footer(s, isLast, nextEnabled) {
    const foot = h("div", "enc-foot");
    const next = btn(isLast ? "✨ 收下知识水晶" : "下一步 →", "primary");
    next.disabled = !nextEnabled;
    next.onclick = nextStep;
    if (s.hint) {
      const hintBtn = btn("💡 提示", "link");
      const hint = h("div", "hint hidden", esc(s.hint));
      hintBtn.onclick = () => { hint.classList.toggle("hidden"); hintBtn.textContent = hint.classList.contains("hidden") ? "💡 提示" : "🙈 收起提示"; };
      foot.append(hintBtn, hint);
    }
    const spacer = h("span", "spacer");
    foot.append(spacer, next);
    foot.enable = () => { next.disabled = false; };
    // 连错几次后出现"看参考答案"
    foot.offerAnswer = (text, apply) => {
      if (foot.querySelector(".answer-btn")) return;
      const b = btn("👀 看参考答案", "link answer-btn");
      const box = h("div", "hint answer hidden", `<pre>${esc(text)}</pre>`);
      const use = btn("把答案填进去，自己运行一遍");
      use.onclick = () => { apply(); box.classList.add("hidden"); };
      box.append(use);
      b.onclick = () => box.classList.toggle("hidden");
      foot.insertBefore(b, spacer);
      foot.append(box);
    };
    return foot;
  }
  const header = (s) => h("div", "step-type", `<span class="badge">${STEP_ICON[s.type]} ${STEP_NAME[s.type]}</span>`);

  const RENDER = {
    // 讲解：读 + 改示例 + 必须运行一次
    learn(s, isLast) {
      const root = h("div", "step");
      root.append(header(s), h("div", "text", s.text));
      let ran = false;
      const out = h("div", "output hidden");
      const foot = footer(s, isLast, false);
      const run = btn("▶ 运行示例", "primary");
      const editor = makeEditor(s.code, () => run.click());
      run.onclick = () => {
        renderResult(out, evaluate({ stdin: s.stdin }, editor.value), editor);
        if (!ran) { ran = true; foot.enable(); run.textContent = "▶ 再运行"; }
      };
      const bar = h("div", "toolbar"); bar.append(run, h("span", "spacer"), h("span", "muted", "示例可以随便改，运行一次就能继续"));
      root.append(editor.el, bar, out);
      if (s.tip) root.append(h("p", "tip", esc(s.tip)));
      root.append(foot);
      return root;
    },
    // 填空
    fill(s, isLast) {
      const root = h("div", "step");
      root.append(header(s), h("div", "prompt", s.prompt));
      const pre = h("pre", "code fillcode");
      const inputs = [];
      s.code.split("____").forEach((part, k, arr) => {
        pre.append(document.createTextNode(part));
        if (k < arr.length - 1) {
          const inp = document.createElement("input");
          inp.className = "blank"; inp.placeholder = s.placeholder || "……"; inp.spellcheck = false; inp.autocapitalize = "off";
          inputs.push(inp); pre.append(inp);
        }
      });
      const assemble = () => { let k = 0; return s.code.replace(/____/g, () => inputs[k++].value); };
      const out = h("div", "output hidden");
      const foot = footer(s, isLast, false);
      const run = btn("▶ 运行并检查", "primary");
      let fails = 0;
      run.onclick = () => {
        const code = assemble();
        if (renderResult(out, evaluate(s, code))) foot.enable();
        else if (++fails >= 3 && s.solution) {
          let k = 0;
          foot.offerAnswer(s.code.replace(/____/g, () => s.solution[k++]), () => inputs.forEach((inp, j) => (inp.value = s.solution[j] ?? "")));
        }
      };
      inputs.forEach((inp) => inp.addEventListener("keydown", (ev) => { if (ev.key === "Enter") run.click(); }));
      const bar = h("div", "toolbar"); bar.append(run);
      root.append(pre, bar, out, foot);
      setTimeout(() => inputs[0] && inputs[0].focus(), 50);
      return root;
    },
    // 写代码 / 改 bug
    code(s, isLast) {
      const root = h("div", "step");
      root.append(header(s), h("div", "prompt", s.prompt));
      const out = h("div", "output hidden");
      const foot = footer(s, isLast, false);
      const run = btn("▶ 运行并检查", "primary");
      const editor = makeEditor(s.starter || "", () => run.click());
      let fails = 0;
      run.onclick = () => {
        const code = editor.value;
        if (renderResult(out, evaluate(s, code), editor)) foot.enable();
        else if (++fails >= 3 && s.solution) foot.offerAnswer(s.solution, () => { editor.value = s.solution; });
      };
      const bar = h("div", "toolbar"); bar.append(run, h("span", "spacer"), h("span", "muted", "⌘/Ctrl + Enter 也能运行"));
      root.append(editor.el, bar, out, foot);
      setTimeout(() => { editor.ta.focus(); editor.ta.setSelectionRange(editor.ta.value.length, editor.ta.value.length); }, 50);
      return root;
    },
    fix(s, isLast) { return RENDER.code(s, isLast); },
    // 猜输出：选完真的运行一遍验证
    predict(s, isLast) {
      const root = h("div", "step");
      root.append(header(s), h("div", "prompt", s.prompt), h("pre", "code", esc(s.code)));
      const opts = h("div", "options");
      const fb = h("div", "feedback");
      const out = h("div", "output hidden");
      const foot = footer(s, isLast, false);
      let solved = false;
      s.options.forEach((o, k) => {
        const b = btn(showNl(o));
        b.onclick = () => {
          if (solved) return;
          if (k === s.answer) {
            solved = true; b.classList.add("right");
            fb.className = "feedback good"; fb.textContent = "✅ 答对了！真的运行一遍验证一下：";
            renderResult(out, evaluate({ stdin: s.stdin }, s.code));
            root.insertBefore(h("div", "explain", esc(s.explain)), foot);
            opts.querySelectorAll("button").forEach((x) => (x.disabled = x !== b));
            foot.enable();
          } else {
            b.classList.remove("wrong"); void b.offsetWidth; b.classList.add("wrong");
            fb.className = "feedback bad"; fb.textContent = "❌ 不对哦，再想想。";
          }
        };
        opts.append(b);
      });
      root.append(opts, fb, out, foot);
      return root;
    },
  };

  // 章节完成
  function showChapterDone() {
    el.encIcon.textContent = "🎉";
    el.encTitle.textContent = `第 ${CHAPTERS.indexOf(ch) + 1} 章完成：${ch.title}`;
    el.encSteps.innerHTML = "";
    const root = h("div", "step");
    root.append(h("p", "", "你收集了这些知识水晶，它们都已放进图鉴，随时可以回来复习："));
    root.append(h("div", "done-list", ch.nodes.map((n) => `<div>✨ <b>${esc(n.title)}</b><div class="muted">${esc(n.summary)}</div></div>`).join("")));
    const nxt = CHAPTERS[CHAPTERS.indexOf(ch) + 1];
    if (nxt) root.append(h("p", "muted", nxt.nodes ? `下一章：「${esc(nxt.title)}」已经解锁，回地图就能进入。` : `下一章「${esc(nxt.title)}」正在开发中。`));
    const foot = h("div", "enc-foot");
    const stay = btn("再逛逛"); stay.onclick = () => el.enc.classList.add("hidden");
    const map = btn("回到地图 🗺", "primary"); map.onclick = () => { el.enc.classList.add("hidden"); showMap(); };
    foot.append(stay, h("span", "spacer"), map);
    root.append(foot);
    el.encBody.innerHTML = ""; el.encBody.appendChild(root);
    el.enc.classList.remove("hidden");
  }

  // ============================================================
  //  图鉴
  // ============================================================
  function updateCodexCount() { el.codexCount.textContent = save.codex.length; }
  function openCodex() {
    const items = [];
    for (const c of CHAPTERS) for (const n of c.nodes || []) if (save.codex.includes(n.id)) items.push({ c, n });
    el.codexBody.innerHTML = items.length
      ? items.map(({ c, n }) => {
          const ex = n.steps.find((s) => s.type === "learn");
          return `<div class="codex-item"><b>✨ ${esc(n.title)}</b> <span class="muted">· ${esc(c.title)}</span><p>${esc(n.summary)}</p>${ex ? `<pre>${esc(ex.code)}</pre>` : ""}</div>`;
        }).join("")
      : `<div class="codex-empty">还没有收集到知识水晶。去场景里往前走吧！</div>`;
    el.codex.classList.remove("hidden");
  }
  $("#btn-codex").addEventListener("click", openCodex);
  $("#btn-codex-close").addEventListener("click", () => el.codex.classList.add("hidden"));
  el.codex.addEventListener("click", (ev) => { if (ev.target === el.codex) el.codex.classList.add("hidden"); });
  $("#btn-map").addEventListener("click", () => { if (el.enc.classList.contains("hidden")) showMap(); });

  // 开发用：浏览器控制台里可以直接用
  window.PyPlanet = {
    CHAPTERS, runCode: (...a) => runCode(...a), evaluate, enterChapter, showMap,
    get save() { return save; },
    reset() { localStorage.removeItem(STORE_KEY); location.reload(); },
    // 用参考答案把所有练习跑一遍（和 node dev/check_curriculum.js 做的事一样，只是在浏览器里）
    check() {
      const rows = [];
      for (const c of CHAPTERS) for (const n of c.nodes || []) n.steps.forEach((s, i) => {
        let ok, note = "";
        if (s.type === "learn") { const r = runCode(s.code, "", s.stdin); ok = !r.error; note = r.error ? r.error.msg : ""; }
        else if (s.type === "predict") { const r = runCode(s.code, "", s.stdin); const actual = r.error ? "报错" : norm(r.stdout); ok = actual === s.options[s.answer]; note = actual; }
        else {
          let sol = s.solution;
          if (s.type === "fill") { let k = 0; sol = s.code.replace(/____/g, () => s.solution[k++]); }
          const ev = evaluate(s, sol); ok = ev.passed; note = ev.reason ? (ev.reason.msg || ev.reason.kind) : "";
        }
        rows.push({ 章: c.id, 水晶: n.id, 步: i, 类型: s.type, 通过: ok ? "✓" : "✗", 备注: note });
      });
      console.table(rows);
      return rows;
    },
  };

  // ============================================================
  //  启动
  // ============================================================
  updateCodexCount();
  showMap();
  initPython();
})();
