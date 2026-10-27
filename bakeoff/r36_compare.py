"""r36: per-request timing, r35 (parallel) vs r36 (serial) craft3 on the same five briefs.
usage: python3 bakeoff/r36_compare.py s|t   (s = Sonnet 5.5, t = GPT-6.1 Terra); serial runs come from bakeoff/r36_serial.sh"""
import glob, json, statistics as st, sys
from datetime import datetime

SUBJ = ["axolotl", "gunblade", "calderMobile", "alebrije", "gargoyle"]


def runs(pattern):
    out = []
    for f in glob.glob(pattern):
        d = json.load(open(f))
        if d.get("status") != 200 or not d.get("usage"):
            continue
        t0 = datetime.fromisoformat(d["started"].replace("Z", "+00:00")).timestamp()
        u = d["usage"]
        out.append(dict(subj=d["subject"], effort=d["effort"], t0=t0, t1=t0 + d["wallMs"] / 1000,
                        s=d["wallMs"] / 1000, out=u["completion_tokens"],
                        cached=(u.get("prompt_tokens_details") or {}).get("cached_tokens", 0) / u["prompt_tokens"],
                        rnd=f.split("/")[2]))
    return out


P = sys.argv[1] if len(sys.argv) > 1 else "s"  # s = Sonnet, t = Terra
# every request of that model in r35 (single-call arms; two-stage parents count as one in flight)
allpar = runs(f"bakeoff/rounds/r35{P}*/runs/*.json")
par = [r for r in runs(f"bakeoff/rounds/r35{P}[lm]/runs/*Craft3.json") if r["subj"] in SUBJ]
ser = runs(f"bakeoff/rounds/r36{P}*/runs/*.json")
for r in par:
    mid = (r["t0"] + r["t1"]) / 2
    r["inflight"] = sum(1 for o in allpar if o["t0"] <= mid <= o["t1"])

print(f"{'subject':13} {'effort':6} | {'parallel s  tok  tok/s  in-flight':34} | serial draws: s / tok / tok/s")
for e in ["low", "medium"]:
    for s in SUBJ:
        p = [r for r in par if r["subj"] == s and r["effort"] == e]
        q = sorted([r for r in ser if r["subj"] == s and r["effort"] == e], key=lambda r: r["t0"])
        ps = " ".join(f"{r['s']:5.0f} {r['out']:6} {r['out']/r['s']:5.0f} {r['inflight']:4}" for r in p)
        qs = "  ".join(f"{r['s']:.0f}/{r['out']}/{r['out']/r['s']:.0f}{'' if r['cached'] > 0.9 else ' (cold)'}" for r in q)
        print(f"{s:13} {e:6} | {ps:34} | {qs}")
for e in ["low", "medium"]:
    p = [r["out"] / r["s"] for r in par if r["effort"] == e]
    q = [r["out"] / r["s"] for r in ser if r["effort"] == e]
    if p and q:
        print(f"{e}: median tok/s parallel {st.median(p):.0f} (n{len(p)}), serial {st.median(q):.0f} (n{len(q)})")


def fit(rs):  # wall = fixed + tokens / rate, least squares
    n = len(rs); x = [r["out"] for r in rs]; y = [r["s"] for r in rs]
    mx, my = sum(x) / n, sum(y) / n
    k = sum((a - mx) * (b - my) for a, b in zip(x, y)) / sum((a - mx) ** 2 for a in x)
    return my - k * mx, 1 / k


allcraft = runs(f"bakeoff/rounds/r35{P}[lm]/runs/*Craft3.json")
for name, rs in [("parallel r35 craft3 low+medium", allcraft), ("serial r36", ser)]:
    c, rate = fit(rs)
    print(f"{name} (n{len(rs)}): fixed {c:.1f} s + {rate:.0f} tok/s")
