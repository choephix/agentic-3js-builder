#!/usr/bin/env python3
"""r35: GPT-6.1 Terra vs Sonnet 5.5, same 20 briefs and configurations, side by side.

`python3 bakeoff/r35_page.py` writes ~/tmp/public/nilo/agentic-3js-builder/r35/{index.html,data.json};
`--watch` rewrites data.json every 30 s while runs or checks are going (the page polls it). No model calls.
Facts only: time, tokens, size, parts, crashes, type errors, cost. Looks are Stefan's call: the page's blind mode
hides the model, shuffles the sides per row and records his picks in the browser.
"""
import json, re, subprocess, sys, time
from pathlib import Path
from statistics import median

ROOT = Path(__file__).resolve().parent.parent
PUB = Path.home() / "tmp/public/nilo/agentic-3js-builder"
OUT = PUB / "r35"
ROUNDS = ROOT / "bakeoff/rounds"
MODELS = [("s", "Sonnet 5.5"), ("t", "GPT-6.1 Terra")]
# Every build column: id → (label, round, arm slug suffix). A `two` id is a two-stage final (time = both stages).
VARIANTS = {
    "s:low": ("craft3 low", "r35sl", "Craft3"),
    "s:medium": ("craft3 medium", "r35sm", "Craft3"),
    "s:high": ("craft3 high", "r35sh", "Craft3"),
    "s:flat": ("flat medium", "r35sm", "Flat"),
    "s:two1": ("2-stage medium, stage 1", "r35sm", "Twostage1"),
    "s:two": ("2-stage medium, final", "r35sm", "Twostage"),
    "t:low": ("craft3 low", "r35tl", "Craft3"),
    "t:medium": ("craft3 medium", "r35tm", "Craft3"),
    "t:high": ("craft3 high", "r35th", "Craft3"),
    "t:xhigh": ("craft3 xhigh", "r35tx", "Craft3"),
    "t:decl": ("craft3 + types high", "r35thd", "Craft3decl"),
    "t:flat": ("flat medium", "r35tm", "Flat"),
    "t:flatH": ("flat high", "r35th", "Flat"),
    "t:two1": ("2-stage medium, stage 1", "r35tm", "Twostage1"),
    "t:two": ("2-stage medium, final", "r35tm", "Twostage"),
    "t:two1H": ("2-stage high, stage 1", "r35th", "Twostage1"),
    "t:twoH": ("2-stage high, final", "r35th", "Twostage"),
}
# Side-by-side tabs: id, label, Sonnet column, Terra column. Terra-only setups face Sonnet craft3 high, the look
# Stefan called night and day better than low.
CONFIGS = [
    ("low", "craft3 · low", "s:low", "t:low"),
    ("medium", "craft3 · medium", "s:medium", "t:medium"),
    ("high", "craft3 · high", "s:high", "t:high"),
    ("flat", "flat · medium", "s:flat", "t:flat"),
    ("two1", "2-stage medium · stage 1", "s:two1", "t:two1"),
    ("two", "2-stage medium · final", "s:two", "t:two"),
    ("xhigh", "Terra xhigh vs Sonnet high", "s:high", "t:xhigh"),
    ("decl", "Terra high + types vs Sonnet high", "s:high", "t:decl"),
    ("flatH", "Terra flat high vs Sonnet high", "s:high", "t:flatH"),
    ("two1H", "Terra 2-stage high · stage 1 vs Sonnet high", "s:high", "t:two1H"),
    ("twoH", "Terra 2-stage high · final vs Sonnet high", "s:high", "t:twoH"),
]
SUBJECTS = ["accordion", "alebrije", "alienFlora", "arcadeCabinet", "arcticOutpost", "axolotl", "babaYagaHut", "baku",
            "bauhausBird", "blueprintSpitfire", "brutalistBlock", "calderMobile", "cardboardRobot", "dutchWindmill",
            "dwarfBlacksmith", "gargoyle", "gunblade", "hydra", "spaceGalley", "strandbeest"]
PITCHES = {s["id"]: s for s in json.loads((ROOT / "bakeoff/pitches-r24.json").read_text())["subjects"]}
FENCE = re.compile(r"```(?:ts|typescript|tsx|js|javascript)?[^\n]*\n([\s\S]*?)```")


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


def cell(vid, subject):
    _, rnd, arm = VARIANTS[vid]
    final = vid.split(":")[1].startswith("two") and not vid.split(":")[1].startswith("two1")
    slug = f"{rnd}{subject[0].upper()}{subject[1:]}Rich{arm}"
    run = load(ROUNDS / rnd / "runs" / f"{slug}.json")
    if not run:
        return {"state": "queued"}
    chk = load(ROUNDS / rnd / "checks" / f"{slug}.json")
    u = run.get("usage") or {}
    out = u.get("completion_tokens")
    two = run.get("twostage") or {}
    wall = run.get("wallMs")
    if final and two:
        wall = two.get("elapsedMs", wall)
    think = (u.get("completion_tokens_details") or {}).get("reasoning_tokens")
    exact = think is not None
    text = ""
    md = ROUNDS / rnd / "runs" / f"{slug}.md"
    if md.exists():
        text = md.read_text()
    blocks = sorted(FENCE.findall(text), key=len)
    code = blocks[-1] if blocks else ""
    if think is None and out and not final:  # Sonnet returns a summary only: billed output minus the reply
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
    # Typecheck-gated edit repairs (`refine <round>tfix --repair-only --types`, same model, low effort); Terra builds
    # still failing get a second one at medium (`<round>tfix2`, from the first repair's module).
    fix = None
    for fround in (f"{rnd}tfix", f"{rnd}tfix2"):
        fixslug = slug.replace(rnd, fround, 1)
        frun = load(ROUNDS / fround / "runs" / f"{fixslug}.json")
        if not frun:
            break
        fchk = load(ROUNDS / fround / "checks" / f"{fixslug}.json")
        fimg, fsheet = shot(fixslug)
        fstate = ("failed" if not frun.get("hasCode") else "rendering" if not fchk
                  else "ok" if fchk.get("rendered") and fimg else "crashed")
        frep = (fchk or {}).get("report") or {}
        fix = {"state": fstate, "img": fimg, "sheet": fsheet,
               "wall": round((frun.get("wallMs") or 0) / 1000) + (fix["wall"] if fix else 0),
               "repairs": 2 if fix else 1, "typeErrors": (fchk or {}).get("typeErrors"), "parts": frep.get("parts"),
               "tris": frep.get("triangles"), "renderError": ((fchk or {}).get("renderError") or "")[:300] or None}
        if fstate == "ok":
            break
    # What an app with the repair step shows: the first render if it worked, else the repair's.
    usable = state == "ok" or (fix or {}).get("state") == "ok"
    usable1 = state == "ok" or ((fix or {}).get("state") == "ok" and fix["repairs"] == 1)
    return {
        "fix": fix, "usable": usable, "usable1": usable1,
        "toWorking": (round(wall / 1000) + (fix["wall"] if state != "ok" and fix else 0)) if usable and wall else None,
        "state": state, "slug": slug, "img": img, "sheet": sheet,
        "wall": round(wall / 1000) if wall else None,
        "kb": round((ROUNDS / rnd / "builds" / f"{slug}.ts").stat().st_size / 1024, 1)
        if (ROUNDS / rnd / "builds" / f"{slug}.ts").exists() else None,
        "out": out, "think": think, "thinkExact": exact,
        "tps": round(out / (run["wallMs"] / 1000)) if out and run.get("wallMs") and not final else None,
        "parts": rep.get("parts"), "tris": rep.get("triangles"), "tex": rep.get("textures"),
        "typeErrors": (chk or {}).get("typeErrors"),
        "renderError": ((chk or {}).get("renderError") or "")[:300] or None,
        "cost": round(run["costUsd"], 3) if run.get("costUsd") is not None else None,
        "stage2": {k: two.get(k) for k in ("stage1Ms", "stage2Ms", "critical", "requests", "calls")} if two else None,
        "error": (run.get("error") or "")[:300] or None,
    }


def stats(cells):
    done = [c for c in cells if c["state"] not in ("queued",)]
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
        "wall": med("wall"), "think": med("think"), "out": med("out"), "tps": med("tps"), "kb": med("kb"),
        "parts": med("parts", ok), "tris": med("tris", ok), "tex": med("tex", ok), "cost": med("cost"),
        "costSum": round(sum(c["cost"] or 0 for c in done), 2),
    }


def data():
    rows = []
    for s in SUBJECTS:
        rows.append({"id": s, "brief": PITCHES[s]["rich"], "cells": {v: cell(v, s) for v in VARIANTS}})
    summary = {v: stats([r["cells"][v] for r in rows]) for v in VARIANTS}
    usage = load(ROOT / "scratch/r35/usage.json")
    return {"updated": time.strftime("%H:%M:%S"), "models": MODELS, "configs": CONFIGS,
            "variants": {v: l for v, (l, _, _) in VARIANTS.items()}, "rows": rows, "summary": summary,
            "usage": usage}


def write():
    OUT.mkdir(parents=True, exist_ok=True)
    tmp = OUT / "data.json.tmp"
    tmp.write_text(json.dumps(data()))
    tmp.replace(OUT / "data.json")
    (OUT / "index.html").write_text((Path(__file__).with_name("r35_page.html")).read_text())


def busy():
    return subprocess.run(["pgrep", "-f", "scripts/(bakeoff|twostage).ts (run|check|refine)|scratch/r35/checkloop"],
                          capture_output=True).stdout


if __name__ == "__main__":
    write()
    while "--watch" in sys.argv and busy():
        time.sleep(30)
        write()
    write()
