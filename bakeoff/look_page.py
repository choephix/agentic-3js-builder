#!/usr/bin/env python3
"""Write the "where to look" answer page for the r40–r44 sheets.

    python3 bakeoff/look_page.py

Reads the sheets already in the public folder and writes `look/index.html` there. Answers stay in the
browser (localStorage); "Copy answers" puts them on the clipboard as plain text for the chat.
"""

import json
import pathlib

from PIL import Image

PUBLIC = pathlib.Path.home() / "tmp/public/nilo/agentic-3js-builder"
TILE_PX = 568  # sheet tile width, see scripts/sheet.ts

R40 = ["single call · high", "parallel · high/high", "parallel · high/low", "parallel · low/high", "parallel · low/low"]
SECTIONS = [
    {
        "id": "r40",
        "dir": "r40/sheets",
        "title": "Plan high, parts low: as good as the single call at high?",
        "why": "Tile 1 is the single call at high (about 8 min). Tile 3 is parallel parts with the plan at high and the parts at low (about 2–3 min). If tile 3 holds up, builds get 3.5× faster.",
        "ask": "high/low (tile 3) vs single call (tile 1)",
        "options": ["Better", "Same", "Worse"],
        "labels": R40,
        "missing": {"baku": "parallel · high/low", "bauhausBird": "parallel · low/high"},
        "compare": "parallel · high/low",
    },
    {
        "id": "r44",
        "dir": "r44/briefs",
        "title": "Example modules in the prompt: any loss in looks?",
        "why": "All at low. Tile 1 has no examples (63 s). Tile 2 adds three finished sample creatures of the same body type (28 s). Tiles 3–4 are variants: plus a near subject, and examples in place of the API doc.",
        "ask": "examples (tile 2) vs none (tile 1)",
        "options": ["Better", "Same", "Worse"],
        "labels": ["no examples", "3 examples", "3 examples + near subject", "examples instead of api.md"],
        "compare": "3 examples",
    },
    {
        "id": "r42",
        "dir": "r42",
        "title": "Base-first: do the parts hang together?",
        "why": "All at low. Left: base-first, a base call then the parts written against its code (35 s). Right: parallel parts with the box check (53 s). Base-first has no box repair, so look for parts floating, sunk or misplaced.",
        "ask": "base-first (left) vs parallel + box check (right)",
        "options": ["Better", "Same", "Worse"],
        "labels": ["base-first", "parallel + box check"],
        "compare": "base-first",
    },
    {
        "id": "r43",
        "dir": "r43",
        "title": "Would you accept the 15 s blockout as a placeholder?",
        "why": "Left: a blockout call at low, 15 s, 3 cents. Right: the full build at medium, about 2 min. It isn't a contest: would you show the left while the right is coming?",
        "ask": "blockout (left) as a placeholder",
        "options": ["Yes", "Meh", "No"],
        "labels": ["blockout", "full · medium"],
    },
]


def rows(sec):
    out = []
    for f in sorted((PUBLIC / sec["dir"]).glob("*.jpg")):
        w, h = Image.open(f).size
        cols = round(w / TILE_PX)
        labels = [l for l in sec["labels"] if l != sec.get("missing", {}).get(f.stem)]
        assert len(labels) == cols, (f, cols, labels)
        out.append({"id": f.stem, "img": f"../{sec['dir']}/{f.name}", "w": w, "h": h, "labels": labels})
    return out


data = [
    {k: v for k, v in s.items() if k not in ("dir", "labels", "missing")} | {"rows": rows(s)}
    for s in SECTIONS
]


PAGE = r"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your call · r40–r44 looks</title>
<style>
:root{--ink:#1d2330;--mute:#5b6475;--line:#d9dde5;--bg:#f4f5f7;--card:#fff;--pick:#1f7a4d;--pickbg:#e3f4ea;--sel:#2350c8;--selbg:#e6edfc}
*{box-sizing:border-box}
body{font:15px/1.5 system-ui,sans-serif;margin:0;background:var(--bg);color:var(--ink);padding-bottom:84px}
header{padding:18px 24px 12px;background:var(--card);border-bottom:1px solid var(--line)}
h1{margin:0 0 6px;font-size:24px}
.how{margin:0;max-width:1000px;color:var(--mute)}
.how b{color:var(--ink)}
nav{margin-top:10px;display:flex;flex-wrap:wrap;gap:6px}
nav a{text-decoration:none;color:var(--ink);border:1px solid var(--line);border-radius:999px;padding:3px 12px;background:var(--bg)}
nav a span{color:var(--mute)}
section{padding:16px 24px}
h2{margin:8px 0 2px;font-size:20px}
.why{margin:0 0 10px;max-width:1000px;color:var(--mute)}
.overall{display:flex;flex-wrap:wrap;align-items:center;gap:8px;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 12px;margin-bottom:14px}
.overall .q{font-weight:600;margin-right:6px}
.overall input{flex:1;min-width:220px}
.row{background:var(--card);border:1px solid var(--line);border-radius:10px;margin:0 0 14px;padding:8px;scroll-margin-top:8px}
.row.cur{outline:3px solid #9fb4ea}
.row.done{border-color:#9bd3b4}
.shot{position:relative;cursor:pointer;user-select:none}
.shot img{display:block;width:100%;height:auto;border-radius:6px}
.hl{position:absolute;top:0;bottom:0;border:4px solid var(--pick);border-radius:6px;pointer-events:none;background:rgba(31,122,77,.07)}
.hl b{position:absolute;top:6px;left:6px;background:var(--pick);color:#fff;font-size:13px;padding:1px 8px;border-radius:999px}
.ctl{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:8px 4px 2px}
.ctl .q{color:var(--mute)}
.ctl .best{color:var(--pick);font-weight:600;min-width:140px}
.ctl input{flex:1;min-width:200px}
button.opt{font:inherit;min-height:32px;padding:3px 14px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--ink);cursor:pointer}
button.opt:hover{border-color:var(--sel)}
button.opt.on{background:var(--selbg);border-color:var(--sel);color:var(--sel);font-weight:600}
button.opt[disabled]{opacity:.4;cursor:default}
input[type=text]{font:inherit;min-height:32px;padding:3px 10px;border:1px solid var(--line);border-radius:8px}
.na{color:var(--mute);font-style:italic}
footer{position:fixed;left:0;right:0;bottom:0;background:var(--ink);color:#fff;padding:10px 24px;display:flex;flex-wrap:wrap;align-items:center;gap:14px;z-index:5}
footer .prog span{margin-right:12px;white-space:nowrap}
footer button{font:inherit;font-weight:600;min-height:40px;padding:4px 18px;border-radius:8px;border:0;cursor:pointer}
#copy{background:#58f287;color:#0b2414}
#clear{background:transparent;color:#c9cfdb;border:1px solid #5b6475}
#copied{color:#58f287}
#dump{position:fixed;inset:10% 10% auto;height:60%;z-index:9;display:none;width:80%;font:13px/1.4 ui-monospace,monospace}
@media (max-width:700px){header,section{padding-left:10px;padding-right:10px}}
</style></head><body>
<header>
<h1>Your call · r40–r44 looks</h1>
<p class="how"><b>Click the tile you like best</b> in any row (click again to clear). <b>Answer the row's question</b> with one button. Skip what you like: one overall answer per section is enough. Keys: <b>j / k</b> next / previous row, <b>1 2 3</b> answer the current row. When you're done, <b>Copy answers</b> (bottom) and paste them in the chat. Your answers stay in this browser.</p>
<nav id="nav"></nav>
</header>
<main id="main"></main>
<footer><div class="prog" id="prog"></div><button id="copy">Copy answers</button><span id="copied"></span><button id="clear">Clear all</button></footer>
<textarea id="dump" readonly></textarea>
<script>
const DATA = __DATA__;
const KEY = "look-answers-v1";
let A = {};
try { A = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (_) { A = {}; }
const save = () => localStorage.setItem(KEY, JSON.stringify(A));
const el = (tag, props = {}, kids = []) => { const e = Object.assign(document.createElement(tag), props); for (const k of kids) e.append(k); return e; };
const rowKey = (s, r) => s.id + "/" + r.id;
const get = (k) => (A[k] ||= {});
let cur = null;

function optButtons(sec, key, disabled) {
  return sec.options.map((o, i) => {
    const b = el("button", { className: "opt", textContent: o, disabled: !!disabled });
    b.dataset.key = key; b.dataset.val = o;
    b.onclick = () => { const a = get(key); a.v = a.v === o ? undefined : o; tidy(key); save(); paint(); };
    return b;
  });
}
function tidy(key) { const a = A[key]; if (a && a.v == null && a.best == null && !a.note) delete A[key]; }

function build() {
  const nav = document.getElementById("nav"), main = document.getElementById("main");
  for (const sec of DATA) {
    nav.append(el("a", { href: "#" + sec.id }, [sec.id + " ", el("span", { textContent: sec.title, className: "" })]));
    const s = el("section", { id: sec.id });
    s.append(el("h2", { textContent: sec.id + " · " + sec.title }), el("p", { className: "why", textContent: sec.why }));
    const ok = sec.id + "/overall";
    const note = el("input", { type: "text", placeholder: "optional note for the whole section", value: (A[ok] || {}).note || "" });
    note.oninput = () => { get(ok).note = note.value.trim(); tidy(ok); save(); paint(); };
    s.append(el("div", { className: "overall" }, [el("span", { className: "q", textContent: "Overall, " + sec.ask + ":" }), ...optButtons(sec, ok), note]));
    for (const r of sec.rows) {
      const key = rowKey(sec, r), cols = r.labels.length;
      const img = el("img", { src: r.img, alt: r.id, loading: "lazy", width: r.w, height: r.h });
      const hl = el("div", { className: "hl" }); hl.style.display = "none";
      const shot = el("div", { className: "shot", title: "click the tile you like best" }, [img, hl]);
      shot.onclick = (e) => {
        const box = img.getBoundingClientRect(), i = Math.min(cols - 1, Math.max(0, Math.floor(((e.clientX - box.left) / box.width) * cols)));
        const a = get(key); a.best = a.best === r.labels[i] ? undefined : r.labels[i]; tidy(key); save(); paint(); setCur(row);
      };
      const absent = sec.compare && !r.labels.includes(sec.compare);
      const rnote = el("input", { type: "text", placeholder: "note", value: (A[key] || {}).note || "" });
      rnote.oninput = () => { get(key).note = rnote.value.trim(); tidy(key); save(); paint(); };
      const ctl = el("div", { className: "ctl" }, [
        el("span", { className: "best" }),
        el("span", { className: "q", textContent: sec.ask + ":" }),
        ...(absent ? [el("span", { className: "na", textContent: sec.compare + " has no build for this brief" })] : optButtons(sec, key)),
        rnote,
      ]);
      const row = el("div", { className: "row" }, [shot, ctl]);
      row.dataset.key = key; row.dataset.cols = cols; row.dataset.labels = JSON.stringify(r.labels);
      row.onfocusin = () => setCur(row);
      s.append(row);
    }
    main.append(s);
  }
}

function paint() {
  document.querySelectorAll("button.opt").forEach((b) => b.classList.toggle("on", (A[b.dataset.key] || {}).v === b.dataset.val));
  document.querySelectorAll(".row").forEach((row) => {
    const a = A[row.dataset.key] || {}, labels = JSON.parse(row.dataset.labels), i = labels.indexOf(a.best), hl = row.querySelector(".hl");
    hl.style.display = i < 0 ? "none" : "block";
    if (i >= 0) { hl.style.left = (i / labels.length) * 100 + "%"; hl.style.width = 100 / labels.length + "%"; hl.innerHTML = "<b>best</b>"; }
    row.querySelector(".best").textContent = i < 0 ? "best: click a tile" : "best: " + a.best;
    row.classList.toggle("done", a.v != null || a.best != null);
  });
  const prog = document.getElementById("prog"); prog.textContent = "";
  for (const sec of DATA) {
    const n = sec.rows.filter((r) => { const a = A[rowKey(sec, r)]; return a && (a.v != null || a.best != null); }).length;
    const o = (A[sec.id + "/overall"] || {}).v;
    prog.append(el("span", { textContent: `${sec.id} ${n}/${sec.rows.length}${o ? " · overall " + o : ""}` }));
  }
}

function text() {
  const lines = ["look answers · " + new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC"];
  for (const sec of DATA) {
    const o = A[sec.id + "/overall"];
    const rs = sec.rows.map((r) => [r, A[rowKey(sec, r)]]).filter(([, a]) => a);
    if (!o && !rs.length) continue;
    lines.push("", `${sec.id} · ${sec.ask}`);
    if (o) lines.push(`  overall: ${o.v || "–"}${o.note ? " · " + o.note : ""}`);
    for (const [r, a] of rs) lines.push(`  ${r.id}: ${a.v || "–"}${a.best ? " · best: " + a.best : ""}${a.note ? " · " + a.note : ""}`);
  }
  return lines.join("\n");
}

function setCur(row) { if (cur) cur.classList.remove("cur"); cur = row; if (cur) cur.classList.add("cur"); }
function nearest() { const rows = [...document.querySelectorAll(".row")]; return rows.find((r) => r.getBoundingClientRect().bottom > 120) || rows[0]; }

document.getElementById("copy").onclick = async () => {
  const t = text(), msg = document.getElementById("copied");
  try { await navigator.clipboard.writeText(t); msg.textContent = "Copied. Paste it in the chat."; }
  catch (_) { const d = document.getElementById("dump"); d.value = t; d.style.display = "block"; d.select(); msg.textContent = "Select-all and copy from the box; Esc closes it."; }
  setTimeout(() => (msg.textContent = ""), 4000);
};
document.getElementById("clear").onclick = () => { if (confirm("Clear every answer on this page?")) { A = {}; save(); document.querySelectorAll("input[type=text]").forEach((i) => (i.value = "")); paint(); } };
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") document.getElementById("dump").style.display = "none";
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.metaKey || e.ctrlKey || e.altKey) return;
  const rows = [...document.querySelectorAll(".row")];
  if (!cur || cur.getBoundingClientRect().bottom < 0 || cur.getBoundingClientRect().top > innerHeight) setCur(nearest());
  if (e.key === "j" || e.key === "k") {
    const i = rows.indexOf(cur) + (e.key === "j" ? 1 : -1), next = rows[Math.max(0, Math.min(rows.length - 1, i))];
    setCur(next); next.scrollIntoView({ block: "start", behavior: "smooth" }); e.preventDefault();
  } else if (["1", "2", "3"].includes(e.key)) {
    const b = cur.querySelectorAll(".ctl button.opt")[+e.key - 1]; if (b && !b.disabled) b.click();
  }
});
build(); paint();
</script>
</body></html>
"""

out = PUBLIC / "look/index.html"
out.parent.mkdir(exist_ok=True)
out.write_text(PAGE.replace("__DATA__", json.dumps(data)))
print(out, sum(len(s["rows"]) for s in data), "rows")
