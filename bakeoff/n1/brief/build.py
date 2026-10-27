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

n1 = json.load(open(PUB / "n1/results.json"))
r35 = json.load(open(PUB / "r35/data.json"))
rows35 = {r["id"]: r for r in r35["rows"]}


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


COLS = [
    ("lpDraft", "Nilo today", "first draft"),
    ("lpFinal", "Nilo today", "final"),
    ("flat", "SDK, one call", "final"),
    ("two1", "SDK, two-stage", "first draft"),
    ("two", "SDK, two-stage", "final"),
    ("high", "SDK, high effort", "final"),
]

briefs = []
vals = {k: {"look": [], "final": [], "tris": [], "cost": [], "calls": []} for k in ["lp", "flat", "two", "high", "medium", "low"]}

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
        }

    for key, name, bucket in [("s:flat", "flat", "flat"), ("s:high", "high", "high")]:
        c, cell = sdk(key, name)
        cells[name] = cell
        vals[bucket]["final"].append(c["toWorking"])
        vals[bucket]["tris"].append(c["tris"])
        vals[bucket]["cost"].append(c["cost"])
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
    for key, bucket in [("s:medium", "medium"), ("s:low", "low")]:
        c = fx(r["cells"][key])
        vals[bucket]["final"].append(c["toWorking"])
        vals[bucket]["tris"].append(c["tris"])
        vals[bucket]["cost"].append(c["cost"])
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

data = {"cols": COLS, "briefs": briefs, "stats": S, "timeline": TIMELINE}
html = (HERE / "template.html").read_text()
for k in ["lp", "flat", "two", "high", "medium", "low"]:
    for m in ["final", "look", "tris", "cost"]:
        if m in S[k]:
            html = html.replace(f"{{{{{k}.{m}}}}}", S[k][m]["med"]).replace(f"{{{{{k}.{m}.range}}}}", S[k][m]["range"])
html = html.replace("/*DATA*/", "const DATA = " + json.dumps(data, separators=(",", ":")) + ";")
left = re.findall(r"\{\{[^}]+\}\}", html)
assert not left, left
(OUT / "index.html").write_text(html)
print(OUT / "index.html", sum(f.stat().st_size for f in IMG.iterdir()) // 1024, "KB images")
print(json.dumps({k: {m: x["med"] + " (" + x["range"] + ")" for m, x in v.items()} for k, v in S.items()}, indent=1))
print(TIMELINE)
