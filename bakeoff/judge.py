"""Blind vision judging of rendered builds through `omp auth-gateway stdio`.

    python3 bakeoff/judge.py bakeoff/judging/<panel>-spec.json bakeoff/judging/<panel>-judged.json \
        [--judges openai-codex/gpt-6.1-sol,google-antigravity/gemini-3.8-flash,anthropic/claude-opus-5-5] [--orders 2]

spec.json: {"subjects": [{"id", "brief", "candidates": {"<name>": "<snap dir>/<tag>"}}]}, where `<snap dir>/<tag>`
prefixes the snap's `-three-quarter.png` and `-front.png`. Each candidate shows as one image: three-quarter and front
side by side (cached in composites/ next to the output). Every subject is judged by every judge model in `--orders`
shuffled orders; candidates are labelled A, B, C… per call, so labels carry no meaning. Writes the raw judgments to
<out> and prints mean scores per candidate. A rerun keeps the good judgments in <out> and asks again for the rest.
"""

import argparse, base64, json, os, random, subprocess, sys, threading, statistics as st
from concurrent.futures import ThreadPoolExecutor

ap = argparse.ArgumentParser()
ap.add_argument("spec")
ap.add_argument("out")
ap.add_argument("--judges", default="anthropic/claude-opus-5-5,openai-codex/gpt-6.1-sol")
ap.add_argument("--orders", type=int, default=2)
ap.add_argument("--concurrency", type=int, default=8)
args = ap.parse_args()

spec = json.load(open(args.spec))
CACHE = os.path.join(os.path.dirname(os.path.abspath(args.out)), "composites")
os.makedirs(CACHE, exist_ok=True)

ART = """The brief comes from an art director who wants this:
> By lots of detail I mean mostly a simple base. Each of these is still made out of primitives so they should retain that blocky shape expected of a puppet made out of primitives. The composition, the color and material choice, and the little details on top of those simple shapes should be what give me that wow factor.
The look is stylized and low-poly by design: facets are expected, not a flaw."""

PROMPT = """You are judging {n} 3D models, each built in code from primitives for the same brief. Each image shows one model from a three-quarter view (left) and the front (right).

Brief:
{brief}

{art}

Score every model from 1 to 10 on:
- overall: how impressive and appealing it is as a finished stylized asset for this brief (the "wow"); a 10 would make the art director delighted, a 5 is acceptable but plain, a 2 is broken or unrecognisable
- subject: how well it reads as the subject, with the right anatomy or structure and proportions
- style: how clearly it shows the named style
- detail: the richness of details, textures, colour and setting on top of the simple base
Also list its visible defects (floating or misplaced parts, parts clipping through each other, broken or missing features), briefly.

Use the full scale and compare the models with each other. Reply with only a JSON object:
{{"models": {{"A": {{"overall": 0, "subject": 0, "style": 0, "detail": 0, "defects": ["..."]}}, ...}}, "ranking": ["best label", ..., "worst label"]}}"""


COMPOSITE_LOCK = threading.Lock()


def composite(shots_prefix):
    key = shots_prefix.replace("/", "_").strip("_") + ".jpg"
    out = os.path.join(CACHE, key)
    with COMPOSITE_LOCK:
        if not os.path.exists(out):
            left, right = f"{shots_prefix}-three-quarter.png", f"{shots_prefix}-front.png"
            subprocess.run(["montage", left, right, "-tile", "2x1", "-geometry", "512x512+0+0", "-quality", "85", out + ".tmp.jpg"], check=True)
            os.replace(out + ".tmp.jpg", out)
    return base64.b64encode(open(out, "rb").read()).decode()


class Gateway:
    def __init__(self):
        self.p = subprocess.Popen([os.path.expanduser("~/.local/bin/omp"), "auth-gateway", "stdio"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True, bufsize=1)
        self.lock = threading.Lock()
        self.waiting = {}
        self.next = 1
        threading.Thread(target=self.read, daemon=True).start()

    def read(self):
        for line in self.p.stdout:
            line = line.strip()
            if not line:
                continue
            m = json.loads(line)
            if "id" in m and m["id"] in self.waiting:
                ev, box = self.waiting.pop(m["id"])
                box.append(m)
                ev.set()

    def send(self, body):
        ev, box = threading.Event(), []
        with self.lock:
            i = self.next
            self.next += 1
            self.waiting[i] = (ev, box)
            self.p.stdin.write(json.dumps({"id": i, "path": "/v1/chat/completions", "body": body}) + "\n")
            self.p.stdin.flush()
        ev.wait(900)
        return box[0] if box else {"status": 599, "body": {"error": "timeout"}}


gw = Gateway()
jobs = []
for subject in spec["subjects"]:
    names = list(subject["candidates"])
    for judge in args.judges.split(","):
        for order in range(args.orders):
            rnd = random.Random(f"{subject['id']}/{judge}/{order}")
            shuffled = names[:]
            rnd.shuffle(shuffled)
            jobs.append((subject, judge, order, shuffled))


def run(job):
    subject, judge, order, shuffled = job
    labels = [chr(65 + i) for i in range(len(shuffled))]
    content = [{"type": "text", "text": PROMPT.format(n=len(shuffled), brief=subject["brief"], art=ART)}]
    for label, name in zip(labels, shuffled):
        content.append({"type": "text", "text": f"Model {label}:"})
        content.append({"type": "image_url", "image_url": {"url": "data:image/jpeg;base64," + composite(subject["candidates"][name])}})
    body = {"model": judge, "max_tokens": 6000, "messages": [{"role": "user", "content": content}]}
    for attempt in range(3):
        reply = gw.send(body)
        try:
            text = reply["body"]["choices"][0]["message"]["content"]
            data = json.loads(text[text.index("{"): text.rindex("}") + 1])
            models = {shuffled[labels.index(k)]: v for k, v in data["models"].items()}
            ranking = [shuffled[labels.index(k)] for k in data["ranking"]]
            return {"subject": subject["id"], "judge": judge, "order": order, "models": models, "ranking": ranking}
        except Exception as e:
            err = f"{e}: {json.dumps(reply)[:300]}"
    return {"subject": subject["id"], "judge": judge, "order": order, "error": err}


# An earlier run's good judgments are kept (same subject, judge, order and candidate set); the rest are asked again.
previous = json.load(open(args.out)) if os.path.exists(args.out) else []
kept = {(r["subject"], r["judge"], r["order"]): r for r in previous if "models" in r}
todo = [j for j in jobs if (j[0]["id"], j[1], j[2]) not in kept or set(kept[(j[0]["id"], j[1], j[2])]["models"]) != set(j[3])]
with ThreadPoolExecutor(args.concurrency) as pool:
    fresh = list(pool.map(run, todo))
results = [r for k, r in kept.items() if all((j[0]["id"], j[1], j[2]) != k for j in todo)] + fresh
json.dump(results, open(args.out, "w"), indent=1)

ok = [r for r in results if "models" in r]
print(f"{len(ok)}/{len(results)} judgments", file=sys.stderr)
names = sorted({n for r in ok for n in r["models"]})
print(f"{'candidate':24} {'overall':>8} {'subject':>8} {'style':>8} {'detail':>8} {'mean rank':>10} {'n':>4}")
for name in names:
    rows = [r["models"][name] for r in ok if name in r["models"]]
    ranks = [r["ranking"].index(name) + 1 for r in ok if name in r["ranking"]]
    f = lambda k: st.mean(float(x[k]) for x in rows)
    print(f"{name:24} {f('overall'):8.2f} {f('subject'):8.2f} {f('style'):8.2f} {f('detail'):8.2f} {st.mean(ranks):10.2f} {len(rows):4}")
