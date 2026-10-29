#!/usr/bin/env python3
"""r45: parallel flat parts with a GLM 5.3 Flash plan (high) and Sonnet 5.5 or GPT-6.1 Sol parts, vs Sonnet plans.

`python3 bakeoff/r45_page.py` writes ~/tmp/public/nilo/agentic-3js-builder/r45/{index.html,data.json}.
`--watch` rewrites data.json every 30 seconds while bakeoff runs/checks/repairs are active.
No model calls are made here; this only reads run/check records and snapshots.
"""
import json, re, subprocess, sys, time
from pathlib import Path
from statistics import median

ROOT = Path(__file__).resolve().parent.parent
PUB = Path.home() / "tmp/public/nilo/agentic-3js-builder"
OUT = PUB / "r45"
ROUNDS = ROOT / "bakeoff/rounds"
SUBJECTS = [
    "accordion", "alebrije", "alienFlora", "arcadeCabinet", "arcticOutpost", "axolotl", "babaYagaHut", "baku",
    "bauhausBird", "blueprintSpitfire", "brutalistBlock", "calderMobile", "cardboardRobot", "dutchWindmill",
    "dwarfBlacksmith", "gargoyle", "gunblade", "hydra", "spaceGalley", "strandbeest",
]
PITCHES = {s["id"]: s for s in json.loads((ROOT / "bakeoff/pitches-r24.json").read_text())["subjects"]}
FENCE = re.compile(r"```(?:ts|typescript|tsx|js|javascript)?[^\n]*\n([\s\S]*?)```")

# id -> (label, round, slug suffix). Keep these ids stable: browser picks use them.
VARIANTS = {
    "r40-craft3": ("r40 single call · Sonnet high (earlier batch)", "r40", "Craft3"),
    "glm-son-med": ("GLM plan · Sonnet parts medium", "r45", "GlmSonMed"),
    "glm-son-low": ("GLM plan · Sonnet parts low", "r45", "GlmSonLow"),
    "glm-sol-med": ("GLM plan · Sol parts medium", "r45", "GlmSolMed"),
    "glm-sol-low": ("GLM plan · Sol parts low", "r45", "GlmSolLow"),
    "son-son-med": ("Sonnet plan · Sonnet parts medium", "r45", "SonSonMed"),
    "son-son-low": ("Sonnet plan · Sonnet parts low", "r45", "SonSonLow"),
}


def load(path):
    try:
        return json.loads(path.read_text())
    except (OSError, ValueError):
        return None


def shot(slug):
    for lane in "AB":
        p = PUB / "snaps" / slug / lane / "snaps"
        if (p / "v01-three-quarter.png").exists():
            return f"../snaps/{slug}/{lane}/snaps/v01-three-quarter.png", f"../snaps/{slug}/{lane}/snaps/v01-sheet.jpg"
    return None, None


def slug_for(rnd, subject, arm):
    return f"{rnd}{subject[0].upper()}{subject[1:]}Rich{arm}"


def cell(vid, subject):
    _, rnd, arm = VARIANTS[vid]
    slug = slug_for(rnd, subject, arm)
    run = load(ROUNDS / rnd / "runs" / f"{slug}.json")
    if not run:
        return {"state": "queued"}
    chk = load(ROUNDS / rnd / "checks" / f"{slug}.json")
    u = run.get("usage") or {}
    out = u.get("completion_tokens")
    parallel = run.get("parallel") or {}
    wall = run.get("wallMs")
    plan_ms = parallel.get("planMs")
    slow_ms = parallel.get("slowestPartMs")
    think = (u.get("completion_tokens_details") or {}).get("reasoning_tokens")
    exact = think is not None
    text = ""
    md = ROUNDS / rnd / "runs" / f"{slug}.md"
    if md.exists():
        text = md.read_text()
    blocks = sorted(FENCE.findall(text), key=len)
    code = blocks[-1] if blocks else ""
    if think is None and out:
        # Sonnet's run record has no reasoning_tokens. This is the same billed-output
        # estimate used by r35; parallel records include the plan/part calls in out.
        think = max(0, round(out - len(code) / 2.8 - (len(text) - len(code)) / 4.2))
    rep = (chk or {}).get("report") or {}
    img, sheet = shot(slug)
    if run.get("status") != 200 or not run.get("hasCode"):
        state = "failed" if run.get("status") != 200 else "no code"
    elif not chk:
        state = "rendering"
    elif chk.get("rendered") and img:
        state = "ok"
    else:
        state = "crashed"
    fix = None
    for fround in (f"{rnd}tfix", f"{rnd}tfix2"):
        fixslug = slug.replace(rnd, fround, 1)
        frun = load(ROUNDS / fround / "runs" / f"{fixslug}.json")
        if not frun:
            break
        fchk = load(ROUNDS / fround / "checks" / f"{fixslug}.json")
        fimg, fsheet = shot(fixslug)
        fstate = "failed" if not frun.get("hasCode") else "rendering" if not fchk else "ok" if fchk.get("rendered") and fimg else "crashed"
        frep = (fchk or {}).get("report") or {}
        fix = {
            "state": fstate, "img": fimg, "sheet": fsheet,
            "wall": round((frun.get("wallMs") or 0) / 1000) + (fix["wall"] if fix else 0),
            "repairs": 2 if fix else 1, "typeErrors": (fchk or {}).get("typeErrors"),
            "parts": frep.get("parts"), "tris": frep.get("triangles"),
            "renderError": ((fchk or {}).get("renderError") or "")[:300] or None,
        }
        if fstate == "ok":
            break
    usable = state == "ok" or (fix or {}).get("state") == "ok"
    usable1 = state == "ok" or ((fix or {}).get("state") == "ok" and fix["repairs"] == 1)
    build = ROUNDS / rnd / "builds" / f"{slug}.ts"
    return {
        "fix": fix, "usable": usable, "usable1": usable1,
        "toWorking": round(wall / 1000) + (fix["wall"] if state != "ok" and fix else 0) if usable and wall else None,
        "state": state, "slug": slug, "img": img, "sheet": sheet,
        "wall": round(wall / 1000) if wall else None,
        "planMs": plan_ms, "slowestPartMs": slow_ms,
        "kb": round(build.stat().st_size / 1024, 1) if build.exists() else None,
        "out": out, "think": think, "thinkExact": exact,
        "tps": round(out / (run["wallMs"] / 1000)) if out and run.get("wallMs") else None,
        "parts": rep.get("parts"), "tris": rep.get("triangles"), "tex": rep.get("textures"),
        "typeErrors": (chk or {}).get("typeErrors"),
        "renderError": ((chk or {}).get("renderError") or "")[:300] or None,
        "cost": round(run["costUsd"], 3) if run.get("costUsd") is not None else None,
        "parallel": bool(parallel),
        "error": (run.get("error") or "")[:300] or None,
    }


def stats(cells):
    done = [c for c in cells if c["state"] != "queued"]
    ok = [c for c in done if c["state"] == "ok"]

    def med(key, pool=done):
        vals = [c[key] for c in pool if c.get(key) is not None]
        return round(median(vals), 3 if key == "cost" else 1) if vals else None

    return {
        "n": len(done), "ok": len(ok), "crashed": sum(c["state"] == "crashed" for c in done),
        "failed": sum(c["state"] in ("failed", "no code") for c in done),
        "rendering": sum(c["state"] == "rendering" for c in done),
        "typeErr": sum(1 for c in done if (c.get("typeErrors") or 0) > 0),
        "usable": sum(1 for c in done if c.get("usable")),
        "usable1": sum(1 for c in done if c.get("usable1")),
        "repaired": sum(1 for c in done if c["state"] != "ok" and c.get("usable")),
        "toWorking": med("toWorking", [c for c in done if c.get("usable")]),
        "wall": med("wall"), "planMs": med("planMs"), "slowestPartMs": med("slowestPartMs"),
        "think": med("think"), "out": med("out"), "tps": med("tps"), "kb": med("kb"),
        "parts": med("parts", ok), "tris": med("tris", ok), "tex": med("tex", ok), "cost": med("cost"),
        "costSum": round(sum(c["cost"] or 0 for c in done), 2),
    }


def data():
    rows = []
    for subject in SUBJECTS:
        rows.append({"id": subject, "brief": PITCHES[subject]["rich"], "cells": {v: cell(v, subject) for v in VARIANTS}})
    summary = {v: stats([r["cells"][v] for r in rows]) for v in VARIANTS}
    return {
        "updated": time.strftime("%H:%M:%S"), "title": "r45 · fast planner (GLM 5.3 Flash), strong part builders",
        "variants": {v: label for v, (label, _, _) in VARIANTS.items()},
        "rows": rows, "summary": summary,
    }


def write():
    OUT.mkdir(parents=True, exist_ok=True)
    tmp = OUT / "data.json.tmp"
    tmp.write_text(json.dumps(data()))
    tmp.replace(OUT / "data.json")
    (OUT / "index.html").write_text((Path(__file__).with_name("r45_page.html")).read_text())


def busy():
    return subprocess.run(
        ["pgrep", "-f", "scripts/(bakeoff|twostage)\\.ts (run|check|refine)|scratch/(r35|r40|r45)/checkloop"],
        capture_output=True,
    ).stdout


if __name__ == "__main__":
    write()
    while "--watch" in sys.argv and busy():
        time.sleep(30)
        write()
    write()
