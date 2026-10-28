#!/usr/bin/env python3
"""Builds the self-contained Nilo brief page (index.html + img/) from N1 and r35 data."""
import json
import re
import statistics as st
from pathlib import Path

from PIL import Image

PUB = Path.home() / "tmp/public/nilo/agentic-3js-builder"
OUT = PUB / "nilo-brief"
IMG = OUT / "img"
IMG.mkdir(parents=True, exist_ok=True)
HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
ROUNDS = HERE.parents[1] / "rounds"


def load_json(path):
    try:
        return json.loads(path.read_text())
    except (OSError, ValueError):
        return None


n1 = json.load(open(PUB / "n1/results.json"))
r35 = json.load(open(PUB / "r35/data.json"))
rows35 = {r["id"]: r for r in r35["rows"]}
N1S = {
    "n1sLow": (REPO / "scratch/n1s/low/results.json", PUB / "n1s-low"),
    "n1sMedium": (REPO / "scratch/n1s/medium/results.json", PUB / "n1s-medium"),
}
SDK_ROUNDS = {
    "sfl": ("r39sfl", "Flat", "low"),
    "sfm": ("r39sfm", "Flat", "medium"),
}
SDK_SOURCE_ROUNDS = {
    "s:low": "r35sl",
    "s:medium": "r35sm",
    "s:high": "r35sh",
    "s:flat": "r35sm",
    "s:two1": "r35sm",
    "s:two": "r35sm",
}


def snapshot(slug):
    for lane in ("A", "B"):
        p = PUB / "snaps" / slug / lane / "snaps"
        if (p / "v01-three-quarter.png").exists():
            return p / "v01-three-quarter.png", p / "v01-sheet.jpg"
    return None, None


def sdk_round_cell(round_id, subject, arm):
    slug = f"{round_id}{subject[0].upper()}{subject[1:]}Rich{arm}"
    run = load_json(ROUNDS / round_id / "runs" / f"{slug}.json")
    if not run:
        return None
    chk = load_json(ROUNDS / round_id / "checks" / f"{slug}.json")
    img, sheet = snapshot(slug)
    report = (chk or {}).get("report") or {}
    state = (
        "failed"
        if run.get("status") != 200 or not run.get("hasCode")
        else "rendering"
        if not chk
        else "ok"
        if chk.get("rendered") and img
        else "crashed"
    )
    fix = None
    fix_round = f"{round_id}fix"
    fix_slug = slug.replace(round_id, fix_round, 1)
    frun = load_json(ROUNDS / fix_round / "runs" / f"{fix_slug}.json")
    if frun:
        fchk = load_json(ROUNDS / fix_round / "checks" / f"{fix_slug}.json")
        fimg, fsheet = snapshot(fix_slug)
        freport = (fchk or {}).get("report") or {}
        fstate = (
            "failed"
            if not frun.get("hasCode")
            else "rendering"
            if not fchk
            else "ok"
            if fchk.get("rendered") and fimg
            else "crashed"
        )
        fix = {
            "state": fstate,
            "img": fimg,
            "sheet": fsheet,
            "wall": round((frun.get("wallMs") or 0) / 1000),
            "tris": freport.get("triangles"),
        }
    if state != "ok" and fix and fix["img"]:
        img, sheet, report = fix["img"], fix["sheet"], {
            **report,
            "triangles": fix["tris"],
        }
    wall = round((run.get("wallMs") or 0) / 1000)
    return {
        "slug": slug,
        "img": img,
        "sheet": sheet,
        "t": wall + (fix["wall"] if state != "ok" and fix and fix["img"] else 0),
        "tris": report.get("triangles"),
        "cost": run.get("costUsd"),
        "repaired": bool(fix and fix.get("img") and state != "ok"),
        **texture_info(round_id, slug),
    }


def sdk_round_cells(round_id, arm):
    return {s["id"]: sdk_round_cell(round_id, s["id"], arm) for s in n1["subjects"]}
def texture_info(round_id, slug):
    path = ROUNDS / round_id / "builds" / f"{slug}.ts"
    text = path.read_text() if path.exists() else ""
    svgs = len(re.findall(r"\bsvg\s*\(", text))
    options = len(re.findall(r"\btexture\s*:", text))
    return {
        "svgCalls": svgs,
        "textureOptions": options,
        "textures": bool(svgs or options),
    }


def fx(c):
    """A crashed SDK build counts with its repaired version."""
    if c and not c.get("img") and c.get("fix"):
        return {**c, "img": c["fix"]["img"], "sheet": c["fix"]["sheet"], "tris": c["fix"]["tris"], "repaired": True}
    return {**(c or {}), "repaired": bool(c and c.get("fix") and c["fix"].get("img") and c.get("state") != "ok")}


def crop(im):
    """SDK renders carry a slug label top-left and a view tag bottom-right; paint both over with the background."""
    from PIL import ImageDraw

    im = im.copy()
    w, h = im.size
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, round(w * 0.72), round(h * 0.045)), fill=im.getpixel((w - 4, 4)))
    d.rectangle((round(w * 0.74), round(h * 0.95), w, h), fill=im.getpixel((4, h - 4)))
    return im


def thumb(src: Path, dst: str, size=440, trim=False):
    out = IMG / dst
    if not out.exists():
        im = Image.open(src).convert("RGB")
        (crop(im) if trim else im).resize((size, size), Image.LANCZOS).save(out, "WEBP", quality=80)
    return f"img/{dst}"


SDK_VIEWS = ["front", "three-quarter", "side", "back", "top", "low"]


def sdk_sheet(view_dir: Path, dst: str):
    """Six SDK views, labels trimmed, tiled 3x2."""
    out = IMG / dst
    if not out.exists():
        canvas = Image.new("RGB", (1200, 800), "white")
        for i, v in enumerate(SDK_VIEWS):
            im = crop(Image.open(view_dir / f"v01-{v}.png").convert("RGB")).resize((400, 400), Image.LANCZOS)
            canvas.paste(im, ((i % 3) * 400, (i // 3) * 400))
        canvas.save(out, "JPEG", quality=82)
    return f"img/{dst}"


def quad(paths, dst: str):
    """Low-poly renders four views; tile them 2x2 as its contact sheet."""
    out = IMG / dst
    if not out.exists():
        canvas = Image.new("RGB", (1200, 1200), "white")
        for i, p in enumerate(paths[:4]):
            canvas.paste(Image.open(p).convert("RGB").resize((600, 600), Image.LANCZOS), ((i % 2) * 600, (i // 2) * 600))
        canvas.save(out, "JPEG", quality=82)
    return f"img/{dst}"


def brief_text(b):
    subj = re.search(r"Subject:\s*(.+)", b)
    style = re.search(r"Style:\s*(.+)", b)
    cat = re.search(r"Category:\s*(.+?)\.?$", b, re.M)
    return {
        "subject": (subj.group(1).rstrip(".") if subj else b.strip()),
        "style": (style.group(1).rstrip(".") if style else ""),
        "category": (cat.group(1).rstrip(".") if cat else ""),
    }
SDK_DATA = {}
for key, (round_id, arm, _) in SDK_ROUNDS.items():
    if not (ROUNDS / round_id / "runs").exists():
        continue
    cells = sdk_round_cells(round_id, arm)
    if len(cells) == len(n1["subjects"]) and all(c and c["img"] for c in cells.values()):
        SDK_DATA[key] = cells
N1S_DATA = {}
for key, (path, render_root) in N1S.items():
    data = load_json(path)
    if not data or len(data.get("subjects", [])) != len(n1["subjects"]):
        continue
    if not all((r.get("final") or {}).get("renderPaths") for r in data["subjects"]):
        continue
    N1S_DATA[key] = (data, render_root)
N1S_ROWS = {key: {r["id"]: r for r in data["subjects"]} for key, (data, _) in N1S_DATA.items()}


def render_sdk_round(c, bid, name):
    return {
        "img": thumb(c["img"], f"{bid}-{name}.webp", trim=True),
        "full": sdk_sheet(c["img"].parent, f"{bid}-{name}.jpg"),
        "t": c["t"],
        "tris": c["tris"],
        "cost": c["cost"],
        "repaired": c["repaired"],
        "textures": c.get("textures", False),
        "svgCalls": c.get("svgCalls", 0),
        "textureOptions": c.get("textureOptions", 0),
    }


def render_n1s(row, render_root, bid, name):
    fin = row.get("final") or {}
    draft_paths = [render_root / p for p in fin.get("draftRenderPaths", [])]
    final_paths = [render_root / p for p in fin.get("renderPaths", [])]
    calls = [
        {"role": c["role"] + (f" {c['round']}" if c.get("round") else ""), "s": round(c["latencyMs"] / 1000, 1)}
        for c in row.get("calls", [])
    ]
    patch_repairs = row.get("patchRepairs") or 0
    run_failures = row.get("runFailures") or 0
    repair_note = (
        f"{patch_repairs} patch repair(s)" if patch_repairs else f"{run_failures} sandbox retry(ies)" if run_failures else ""
    )
    return {
        "img": thumb(final_paths[0], f"{bid}-{name}.webp"),
        "full": quad(final_paths, f"{bid}-{name}.jpg"),
        "draftImg": thumb(draft_paths[0], f"{bid}-{name}-draft.webp") if draft_paths else None,
        "draftFull": quad(draft_paths, f"{bid}-{name}-draft.jpg") if draft_paths else None,
        "draftT": round((row.get("firstValidMs") or 0) / 1000),
        "t": round((row.get("wallMs") or 0) / 1000),
        "tris": fin.get("triangles"),
        "cost": round(row.get("costUsd") or 0, 3),
        "calls": calls,
        "repaired": bool(repair_note),
        "repairNote": repair_note,
        "textures": False,
    }



COLS = [
    ("lpDraft", "Nilo today", "first draft"),
    ("lpFinal", "Nilo today", "final"),
    ("flat", "SDK, one call", "final"),
    ("low", "SDK, low effort (context)", "final"),
    ("two1", "SDK, two-stage", "first draft"),
    ("two", "SDK, two-stage", "final"),
    ("high", "SDK, high effort", "final"),
]
for key, label, effort in [("sfl", "SDK, low effort, flat", "low"), ("sfm", "SDK, medium effort, flat", "medium")]:
    if key in SDK_DATA:
        COLS.append((key, label, "final"))
for key, label in [("n1sLow", "Nilo on Sonnet, low"), ("n1sMedium", "Nilo on Sonnet, medium")]:
    if key in N1S_DATA:
        COLS.append((key, label, "final"))
        COLS.append((key + "Draft", label, "first draft"))


briefs = []
vals = {
    k: {"look": [], "final": [], "tris": [], "cost": [], "calls": [], "textures": []}
    for k in ["lp", "flat", "two", "high", "medium", "low", *SDK_DATA, *N1S_DATA]
}

for s in n1["subjects"]:
    bid = s["id"]
    r = rows35[bid]
    cells = {}
    fin = s["final"]
    lp_dir = PUB / "n1"
    draft_paths = [lp_dir / p for p in fin["draftRenderPaths"]]
    final_paths = [lp_dir / p for p in fin["renderPaths"]]
    lp_calls = [
        {"role": c["role"] + (f" {c['round']}" if c.get("round") else ""), "s": round(c["latencyMs"] / 1000, 1)}
        for c in s["calls"]
    ]
    cells["lpDraft"] = {
        "img": thumb(draft_paths[0], f"{bid}-lp-draft.webp"),
        "full": quad(draft_paths, f"{bid}-lp-draft.jpg"),
        "t": round(s["firstValidMs"] / 1000),
        "note": "" if fin["draftDiffers"] else "Round 1 failed; first valid build is the final one.",
    }
    cells["lpFinal"] = {
        "img": thumb(final_paths[0], f"{bid}-lp-final.webp"),
        "full": quad(final_paths, f"{bid}-lp-final.jpg"),
        "t": round(s["wallMs"] / 1000),
        "tris": fin["triangles"],
        "cost": round(s["costUsd"], 3),
        "calls": lp_calls,
    }
    vals["lp"]["look"].append(s["firstValidMs"] / 1000)
    vals["lp"]["final"].append(s["wallMs"] / 1000)
    vals["lp"]["tris"].append(fin["triangles"])
    vals["lp"]["cost"].append(s["costUsd"])
    vals["lp"]["calls"].append(s["callCount"])

    def sdk(key, name):
        c = fx(r["cells"][key])
        src = PUB / "r35" / c["img"]
        return c, {
            "img": thumb(src, f"{bid}-{name}.webp", trim=True),
            "full": sdk_sheet(src.parent, f"{bid}-{name}.jpg"),
            "t": c["toWorking"],
            "tris": c["tris"],
            "cost": c["cost"],
            "repaired": c["repaired"],
            **texture_info(SDK_SOURCE_ROUNDS[key], c.get("slug")),
        }

    for key, name, bucket in [
        ("s:flat", "flat", "flat"),
        ("s:low", "low", "low"),
        ("s:high", "high", "high"),
    ]:
        c, cell = sdk(key, name)
        cells[name] = cell
        vals[bucket]["final"].append(c["toWorking"])
        vals[bucket]["tris"].append(c["tris"])
        vals[bucket]["cost"].append(c["cost"])
        vals[bucket]["textures"].append(cell.get("textures", False))
    c1, cells["two1"] = sdk("s:two1", "two1")
    c2, cells["two"] = sdk("s:two", "two")
    s2 = r["cells"]["s:two"]["stage2"]
    cells["two1"]["t"] = round(s2["stage1Ms"] / 1000)
    cells["two"]["requests"] = [{"kind": q["kind"], "what": q["what"]} for q in s2["requests"]]
    cells["two"]["calls"] = [
        {"role": "stage 1" if x["id"] == "stage1" else x["id"], "s": round(x["wallMs"] / 1000, 1)} for x in s2["calls"]
    ]
    vals["two"]["look"].append(s2["stage1Ms"] / 1000)
    vals["two"]["final"].append(c2["toWorking"])
    vals["two"]["tris"].append(c2["tris"])
    vals["two"]["cost"].append(c2["cost"])
    vals["two"]["textures"].append(cells["two"].get("textures", False))
    c = fx(r["cells"]["s:medium"])
    vals["medium"]["final"].append(c["toWorking"])
    vals["medium"]["tris"].append(c["tris"])
    vals["medium"]["cost"].append(c["cost"])
    vals["medium"]["textures"].append(texture_info(SDK_SOURCE_ROUNDS["s:medium"], c.get("slug"))["textures"])
    for key, (round_id, arm, _) in SDK_ROUNDS.items():
        if key not in SDK_DATA:
            continue
        c = SDK_DATA[key][bid]
        if not c or not c["img"]:
            continue
        cells[key] = render_sdk_round(c, bid, key)
        vals[key]["final"].append(c["t"])
        vals[key]["tris"].append(c["tris"])
        vals[key]["cost"].append(c["cost"])
        vals[key]["textures"].append(c.get("textures", False))
    for key, (data, render_root) in N1S_DATA.items():
        row = N1S_ROWS[key][bid]
        cells[key] = render_n1s(row, render_root, bid, key)
        cells[key + "Draft"] = {
            "img": cells[key]["draftImg"],
            "full": cells[key]["draftFull"],
            "t": cells[key]["draftT"],
            "note": "First valid build shown while later loop rounds run.",
        }
        vals[key]["look"].append((row.get("firstValidMs") or 0) / 1000)
        vals[key]["final"].append(row.get("wallMs", 0) / 1000)
        vals[key]["tris"].append((row.get("final") or {}).get("triangles"))
        vals[key]["cost"].append(row.get("costUsd"))
        vals[key]["calls"].append(row.get("callCount"))
        vals[key]["textures"].append(False)
    briefs.append({"id": bid, **brief_text(r["brief"]), "cells": cells})


def mr(a, unit="", d=0, money=False):
    a = [x for x in a if x is not None]
    f = (lambda x: f"${x:.2f}") if money else (lambda x: f"{x:,.{d}f}")
    u = "" if money else unit
    return {"med": f(st.median(a)) + u, "range": f"{f(min(a))}–{f(max(a))}{u}", "raw": st.median(a)}


def tk(x):
    return f"{x / 1000:.1f}k"


S = {}
for k, v in vals.items():
    S[k] = {
        "final": mr(v["final"], " s"),
        "tris": {"med": tk(st.median(v["tris"])), "range": f"{tk(min(v['tris']))}–{tk(max(v['tris']))}"},
        "cost": mr(v["cost"], money=True),
    }
    S[k]["textures"] = {
        "count": sum(v["textures"]),
        "total": len(v["textures"]),
        "summary": f"{sum(v['textures'])} of {len(v['textures'])} builds",
    }
    if v["calls"]:
        S[k]["calls"] = mr(v["calls"])
    if v["look"]:
        S[k]["look"] = mr(v["look"], " s")

# per-call medians for the timeline
roles = {}
for s in n1["subjects"]:
    for c in s["calls"]:
        roles.setdefault(c["role"] + str(c.get("round", "")), []).append(c["latencyMs"] / 1000)
lp_seg = {k: round(st.median(v), 1) for k, v in roles.items()}
lanes = {}
for b in briefs:
    ws = sorted([c["s"] for c in b["cells"]["two"]["calls"] if c["role"] != "stage 1"], reverse=True)
    for i, w in enumerate(ws):
        lanes.setdefault(i, []).append(w)
two_lanes = [round(st.median(v), 1) for _, v in sorted(lanes.items())]
def n1s_timeline(key):
    roles = {}
    for row in N1S_DATA[key][0]["subjects"]:
        for call in row.get("calls", []):
            roles.setdefault(call["role"] + str(call.get("round", "")), []).append(call["latencyMs"] / 1000)
    return {k: round(st.median(v), 1) for k, v in roles.items()}



TIMELINE = {
    "lp": lp_seg,
    "lpLook": S["lp"]["look"]["raw"],
    "lpFinal": S["lp"]["final"]["raw"],
    "flat": S["flat"]["final"]["raw"],
    "twoLook": S["two"]["look"]["raw"],
    "twoFinal": S["two"]["final"]["raw"],
    "twoLanes": two_lanes,
    "medium": S["medium"]["final"]["raw"],
    "low": S["low"]["final"]["raw"],
    "high": S["high"]["final"]["raw"],
}
for key in SDK_DATA:
    TIMELINE[key] = {"look": S[key]["final"]["raw"], "final": S[key]["final"]["raw"], "segments": {}}
for key in N1S_DATA:
    TIMELINE[key] = {
        "look": S[key]["look"]["raw"],
        "final": S[key]["final"]["raw"],
        "segments": n1s_timeline(key),
    }

data = {"cols": COLS, "briefs": briefs, "stats": S, "timeline": TIMELINE}
html = (HERE / "template.html").read_text()
for k in ["lp", "flat", "two", "high", "medium", "low", *SDK_DATA, *N1S_DATA]:
    for m in ["final", "look", "tris", "cost", "calls"]:
        if m in S[k]:
            html = html.replace(f"{{{{{k}.{m}}}}}", S[k][m]["med"]).replace(f"{{{{{k}.{m}.range}}}}", S[k][m]["range"])
    html = html.replace(f"{{{{{k}.textures}}}}", S[k]["textures"]["summary"])
html = html.replace("/*DATA*/", "const DATA = " + json.dumps(data, separators=(",", ":")) + ";")
left = re.findall(r"\{\{[^}]+\}\}", html)
assert not left, left
(OUT / "index.html").write_text(html)
print(OUT / "index.html", sum(f.stat().st_size for f in IMG.iterdir()) // 1024, "KB images")
print(
    json.dumps(
        {k: {m: x["med"] + " (" + x["range"] + ")" for m, x in v.items() if "med" in x} for k, v in S.items()},
        indent=1,
    )
)
print(TIMELINE)
