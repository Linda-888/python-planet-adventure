"""由 dev/check_curriculum.js 调用：用参考答案把所有章节的练习跑一遍。"""
import json
import re
import sys
import importlib.util

spec = importlib.util.spec_from_file_location("rt", sys.argv[1])
rt = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rt)
chapters = json.load(open(sys.argv[2], encoding="utf-8"))


def norm(s):
    return "\n".join(l.rstrip() for l in (s or "").replace("\r", "").split("\n")).strip()


def run(code, check="", stdin=None):
    return json.loads(rt.run_code(code, check or "", json.dumps(stdin or [])))


def judge(step, code):
    """和浏览器里 app.js 的 evaluate() 同样的判定规则"""
    cases = step.get("cases") or [{"stdin": step.get("stdin"), "expect": step.get("expect"), "expectContains": step.get("expectContains")}]
    for c in cases:
        r = run(code, c.get("check", step.get("check")), c.get("stdin"))
        out = r["stdout"] or ""
        if r["error"]:
            return False, "ERROR " + str(r["error"]["msg"])
        if r["check_msg"]:
            return False, "CHECK " + r["check_msg"]
        if step.get("mustMatch") and not re.search(step["mustMatch"], code):
            return False, "MUSTMATCH " + step.get("mustMatchMsg", "")
        if c.get("expect") is not None and norm(out) != norm(c["expect"]):
            return False, "OUTPUT %r != %r" % (out, c["expect"])
        for t in c.get("expectContains") or []:
            if t not in out:
                return False, "MISSING %r in %r" % (t, out)
    return True, ""


problems = 0
total = 0
for ch in chapters:
    if not ch.get("nodes"):
        continue
    print("== 第 %s 章 %s" % (ch["id"], ch["title"]))
    for node in ch["nodes"]:
        for i, s in enumerate(node["steps"]):
            total += 1
            t = s["type"]
            tag = "%s[%d] %s" % (node["id"], i, t)
            if t == "learn":
                r = run(s["code"], "", s.get("stdin"))
                if r["error"]:
                    problems += 1
                    print("  FAIL", tag, "示例报错:", r["error"])
                else:
                    print("  ok  ", tag)
            elif t == "predict":
                r = run(s["code"], "", s.get("stdin"))
                actual = "报错" if r["error"] else norm(r["stdout"])
                want = s["options"][s["answer"]]
                if actual != want:
                    problems += 1
                    print("  FAIL", tag, "真实输出 %r，但标的答案是 %r" % (actual, want))
                else:
                    print("  ok  ", tag)
            else:
                if "solution" not in s:
                    problems += 1
                    print("  FAIL", tag, "没有 solution")
                    continue
                if t == "fill":
                    sol = s["code"]
                    for v in s["solution"]:
                        sol = sol.replace("____", v, 1)
                    starter = s["code"].replace("____", "")
                else:
                    sol = s["solution"]
                    starter = s.get("starter", "")
                ok, msg = judge(s, sol)
                if not ok:
                    problems += 1
                    print("  FAIL", tag, "参考答案没通过:", msg)
                else:
                    print("  ok  ", tag)
                ok2, _ = judge(s, starter)
                if ok2:
                    problems += 1
                    print("  WARN", tag, "初始代码不用改就能通过，这题没有意义")

print()
print("共 %d 个步骤，%s" % (total, "全部通过 ✅" if problems == 0 else "%d 个问题 ❌" % problems))
sys.exit(1 if problems else 0)
