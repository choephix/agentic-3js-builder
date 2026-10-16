#!/usr/bin/env python3
"""Median and range per pipeline over the 28 gap2 briefs: time, code size, cost, tokens, geometry, crashes.

Usage: python3 bakeoff/compare_table.py [column ...]   (default: every column in COLUMNS)
Each API column resolves, per subject, the last rendered build across <round>patch, fix2, fix and the base round,
then walks its `from` chain so time and cost include the repairs that led to it.
"""
import glob
import json
import os
import sys
from statistics import median

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROUNDS = os.path.join(ROOT, "bakeoff/rounds")
SNAPS = os.path.expanduser("~/tmp/public/nilo/agentic-3js-builder/snaps")

COLUMNS = {
    "agent": ("Sonnet agent final (target)", None),
    "sonnet-high": ("Sonnet high", "r19single"),
    "sonnet-med": ("Sonnet medium", "r20medsingle"),
    "sonnet-low": ("Sonnet low", "r20lowsingle"),
    "sonnet-low-ref": ("Sonnet low + ref image", "r21reflow"),
    "sonnet-med-ref": ("Sonnet medium + ref image", "r21refmedium"),
    "sonnet-nothink": ("Sonnet D: no thinking, no skeleton†", "r22nothink"),
    "argon-high": ("Argon high", "r23argonhigh"),
    "argon-low": ("Argon low", "r23argonlow"),
}


def load(path, default=None):
    try:
        with open(path) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def subjects():
    out = []
    for name in ("pitches-r7.json", "pitches-r5.json"):
        out += [s["id"] for s in load(os.path.join(ROOT, "bakeoff", name))["subjects"]]
    return out



def count(value):
    """Report fields are numbers in some SDK versions and lists/maps in others."""
    return len(value) if isinstance(value, (list, dict)) else value

RECORDS = {}


def records(round_id):
    if round_id not in RECORDS:
        RECORDS[round_id] = {}
        for path in glob.glob(os.path.join(ROUNDS, round_id, "runs", "*.json")):
            rec = load(path)
            if rec and "slug" in rec:
                RECORDS[round_id][rec["slug"]] = rec
    return RECORDS[round_id]


def record(slug):
    for round_id in sorted(os.listdir(ROUNDS), key=len, reverse=True):
        if slug.startswith(round_id) and slug in records(round_id):
            return round_id, records(round_id)[slug]
    return None, None


def call_ms(rec):
    """Model time of the successful request(s): retry waits after rate limits are excluded."""
    attempts = rec.get("attempts") or []
    ok = [a.get("wallMs") for a in attempts if a.get("status") == 200 and a.get("wallMs") is not None]
    if ok:
        return sum(ok)
    return rec.get("wallMs") or 0


def output_tokens(rec):
    usage = rec.get("usage") or {}
    if isinstance(usage, dict):
        return usage.get("output_tokens") or usage.get("outputTokens")
    return None


def api_row(base, subject):
    for suffix in ("patch", "fix2", "fix", ""):
        round_id = base + suffix
        for slug, rec in records(round_id).items():
            if rec.get("subject") != subject:
                continue
            check = load(os.path.join(ROUNDS, round_id, "checks", slug + ".json"), {})
            if not check.get("rendered"):
                continue
            chain, cur = [], rec
            seen = set()
            while cur and cur["slug"] not in seen:
                seen.add(cur["slug"])
                chain.append(cur)
                cur = record(cur["from"])[1] if cur.get("from") else None
            first = chain[-1]
            report = check.get("report") or {}
            build = os.path.join(ROUNDS, round_id, "builds", slug + ".ts")
            return {
                "min": sum(call_ms(r) for r in chain) / 60000,
                "kb": os.path.getsize(build) / 1024,
                "cost": sum(r.get("costUsd") or 0 for r in chain),
                "out_k": (output_tokens(first) or 0) / 1000 or None,
                "tris_k": report.get("triangles", 0) / 1000,
                "parts": count(report.get("parts")),
                "textures": count(report.get("textures")),
                "joints": count(report.get("joints")),
                "crashed_first": len(chain) > 1,
                "repairs": sum(r.get("mode") == "repair" for r in chain),
                "patched": any(r.get("mode") == "patch" for r in chain),
            }
    return None


def agent_row(subject):
    slug = subject + "Sonnet"
    build = load(os.path.join(ROOT, "samples", slug + ".build.json"), {})
    reports = sorted(glob.glob(os.path.join(SNAPS, slug, "B", "snaps", "v*-report.json")))
    report = load(reports[-1], {}) if reports else {}
    cost = build.get("cost")
    return {
        "min": (build.get("wallSeconds") or 0) / 60 or None,
        "kb": os.path.getsize(os.path.join(ROOT, "samples", slug + ".ts")) / 1024,
        "cost": cost.get("total") if isinstance(cost, dict) else cost,
        "out_k": None,
        "tris_k": (report.get("triangles") or 0) / 1000 or None,
        "parts": count(report.get("parts")),
        "textures": count(report.get("textures")),
        "joints": count(report.get("joints")),
        "crashed_first": None,
        "repairs": None,
        "patched": False,
    }


def fmt(values, digits=1, money=False):
    values = [v for v in values if v is not None]
    if not values:
        return "—"
    f = (lambda v: f"${v:.2f}") if money else (lambda v: f"{v:.{digits}f}")
    return f"{f(median(values))} ({f(min(values))}–{f(max(values))})"


def main(keys):
    subs = subjects()
    print(f"| | Built | Time, min | Code, KB | Cost | Output tokens, k | Triangles, k | Parts | Textures | Joints | Crashed first | Fixed by |")
    print("|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|")
    for key in keys:
        title, base = COLUMNS[key]
        rows = [agent_row(s) if base is None else api_row(base, s) for s in subs]
        attempted = [s for s in subs if base is None or any(r.get("subject") == s for r in records(base).values())]
        got = [r for r in rows if r]
        col = lambda k: [r[k] for r in got]
        crashed = [r for r in got if r["crashed_first"]]
        fixed = (f"{sum(r['repairs'] for r in got)} repair calls, {sum(r['patched'] for r in got)} hand-patched"
                 if base else "—")
        print(f"| {title} | {len(got)}/{len(attempted)} | {fmt(col('min'))} | {fmt(col('kb'), 0)} | {fmt(col('cost'), money=True)} "
              f"| {fmt(col('out_k'), 0)} | {fmt(col('tris_k'))} | {fmt(col('parts'), 0)} | {fmt(col('textures'), 0)} "
              f"| {fmt(col('joints'), 0)} | {f'{len(crashed)}/{len(got)}' if base else '—'} | {fixed} |")


if __name__ == "__main__":
    main(sys.argv[1:] or list(COLUMNS))
