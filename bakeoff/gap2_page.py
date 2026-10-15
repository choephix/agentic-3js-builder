#!/usr/bin/env python3
"""Publish the human-verdict comparison, including agent-framed multi-call and single-run arms; no model calls."""

import html
import json
import tempfile
from functools import lru_cache
from pathlib import Path

from gap_page import LEGACY, PUBLIC, ROOT, round_for_slug

ROUNDS = ROOT / "bakeoff/rounds"
OUTPUT = PUBLIC / "gap2/index.html"
# The local page reads the harness renders beside it (`../snaps/…png`). The published page (`--publish DIR`, run by the
# showcase build) reads the WebP copies the build ships under `/renders/`, and main() prints the sources it used.
SITE = {"root": "../snaps/", "view": ".png", "sheet": ".jpg", "images": None}
VIEWS = [("three-quarter", "three-quarter"), ("front", "front"), ("side", "side"),
         ("back", "back"), ("low", "low"), ("head", "head close-up")]
COLUMNS = [("final", "Sonnet agent · final"), ("draft", "Sonnet agent · first draft"),
           ("sonnet", "Sonnet · single-run"), ("astra", "Astra · single-run"), ("haiku", "Haiku · single-run"),
           ("app", "Sonnet · agent framing (app, multi-call · ~17 calls)"),
           ("single", "Sonnet · agent framing, single-run"),
           ("craft", "Sonnet · agent framing + craft, single-run"),
           ("single-med", "Sonnet · agent framing, single-run · medium"),
           ("craft-med", "Sonnet · agent framing + craft, single-run · medium"),
           ("single-low", "Sonnet · agent framing, single-run · low"),
           ("craft-low", "Sonnet · agent framing + craft, single-run · low"),
           ("ref-low", "Sonnet · agent framing + reference image, single-run · low"),
           ("ref-med", "Sonnet · agent framing + reference image, single-run · medium")]
API_MODELS = ["sonnet", "astra", "haiku", "app", "single", "craft",
              "single-med", "craft-med", "single-low", "craft-low", "ref-low", "ref-med"]
ISSUES = ["face/eyes", "floating/broken parts", "bland colour", "too little detail", "goofy"]
GRADES = ["as good", "a bit worse", "far worse"]


def load(path, default=None):
    # A generator can run while a round is publishing its JSON. Incomplete live
    # records stay pending; the next regeneration picks up the completed write.
    try:
        return json.loads(path.read_text())
    except (FileNotFoundError, json.JSONDecodeError):
        return default


@lru_cache(maxsize=None)
def entries(round_id):
    found = {entry["slug"]: entry for entry in load(ROUNDS / round_id / "results.json", [])}
    for path in (ROUNDS / round_id / "runs").glob("*.json"):
        entry = load(path)
        if entry:
            found[entry["slug"]] = {**found.get(entry["slug"], {}), **entry}
    return list(found.values())


def record(slug):
    return next((entry for entry in entries(round_for_slug(slug)) if entry["slug"] == slug), {})


def chain(entry):
    seen = set()
    while entry and entry["slug"] not in seen:
        seen.add(entry["slug"])
        yield entry
        entry = record(entry["from"]) if entry.get("from") else None


def module_caption(path):
    try:
        source = path.read_bytes()
    except FileNotFoundError:
        return "module size unavailable"
    return f"{len(source) / 1024:.1f} KB · {len(source.splitlines()):,} lines"


def duration(seconds):
    return f"{seconds / 60:.1f} min" if seconds >= 60 else f"{seconds:.0f} s"


def pipeline_caption(entry, api=False):
    history = list(chain(entry))
    costs_known = bool(history) and all(item.get("costUsd") is not None for item in history)
    times_known = bool(history) and all(item.get("wallMs") is not None for item in history)
    cost = entry.get("chainCostUsd")
    if cost is None:
        cost = sum(item.get("costUsd") or 0 for item in history)
    repairs = sum(item.get("mode") == "repair" for item in history)
    seconds = sum(item.get("wallMs") or 0 for item in history) / 1000
    money = f"${cost:.2f}" if costs_known else (f"${cost:.2f} repairs; draft cost unavailable" if repairs else "cost unavailable")
    timing = f"{duration(seconds)} {'app' if entry.get('arm') == 'app' else 'model'} time" if times_known else (f"{duration(seconds)} repairs; draft time unavailable" if repairs else "model time unavailable")
    turns = f" · {repairs} repair turn{'s' if repairs != 1 else ''}" if api or repairs else ""
    if entry.get("arm") == "app" and history:
        initial = history[-1]
        turns += f" · {initial.get('modelCalls', 0) + repairs} model calls · {initial.get('stopReason', 'unknown stop')}"
    if history and history[-1].get("generationCalls") is not None:
        initial = history[-1]
        redraws = initial.get("redrawCalls", 0)
        turns = f" · {initial['generationCalls']} generation request · {redraws} redraw request{'s' if redraws != 1 else ''} · {repairs} repair call{'s' if repairs != 1 else ''}"
    return f"{money} · {timing}{turns}"


def checked_tile(entry, api=False):
    slug = entry["slug"]
    round_dir = ROUNDS / round_for_slug(slug)
    data = {"meta": pipeline_caption(entry, api), "source": round_dir / "builds" / f"{slug}.ts"}
    check = load(round_dir / "checks" / f"{slug}.json", entry.get("check"))
    if entry.get("hasCode") is False:
        return {**data, "status": "crashed", "error": entry.get("error") or entry.get("finishReason") or "No module returned"}
    if not check or check.get("rendered") is None:
        return {**data, "status": "pending"}
    if not check["rendered"]:
        return {**data, "status": "crashed", "error": check.get("renderError") or "Render failed"}
    return {**data, "prefix": f"../snaps/{slug}/{check['lane']}/snaps/v01"}


def tile_data(subject, column, base):
    if column == "final":
        slug = subject + "Sonnet"
        build = load(ROOT / "samples" / f"{slug}.build.json", {})
        cost = build.get("cost")
        seconds = build.get("wallSeconds")
        money = f"${cost:.2f}" if cost is not None else "cost unavailable"
        timing = f"{duration(seconds)} session time" if seconds is not None else "session time unavailable"
        return {"prefix": LEGACY[subject]["sonnet-agent"]["prefix"],
                "meta": f"{money} · {timing}", "source": ROOT / "samples" / f"{slug}.ts"}
    if column == "draft":
        # Keep the exact phase-1 per-subject mapping, including its crash repairs.
        prefix = LEGACY[subject]["agent-draft"]["prefix"]
        slug = prefix.split("/")[2]
        entry = record(slug)
        if entry:
            data = checked_tile(entry)
            if data.get("prefix"):
                data["prefix"] = prefix
            return data
        return {"prefix": prefix, "meta": "cost unavailable · model time unavailable",
                "source": ROUNDS / round_for_slug(slug) / "builds" / f"{slug}.ts"}
    effort_rounds = {"single-med": "r20medsingle", "craft-med": "r20medcraft",
                     "single-low": "r20lowsingle", "craft-low": "r20lowcraft", "ref-low": "r21reflow",
                     "ref-med": "r21refmedium"}
    round_bases = (("r18appb", "r18app") if column == "app"
                   else ("r19" + column,) if column in ("single", "craft")
                   else (effort_rounds[column],) if column in effort_rounds
                   else (base + ("" if column == "sonnet" else column),))
    arm = "single" if column in ("ref-low", "ref-med") else column.split("-")[0] if column in effort_rounds else column if column in ("app", "single", "craft") else "craft3"
    for round_base in round_bases:
        for suffix in ("fix2", "fix", ""):
            entry = next((item for item in entries(round_base + suffix)
                          if item.get("subject") == subject and item.get("arm") == arm), None)
            if entry:
                data = checked_tile(entry, api=True)
                if column == "app":
                    data["meta"] += " · " + round_for_slug(entry["slug"])
                return data
    return {"status": "pending", "meta": "cost unavailable · model time unavailable · 0 repair turns"}


def buttons(values, attribute):
    return "".join(f'<button type="button" {attribute}="{html.escape(value, quote=True)}" aria-pressed="false">{html.escape(value)}</button>' for value in values)


def cell(subject, column, title, base):
    data = tile_data(subject, column, base)
    prefix = data.get("prefix")
    if prefix and not (OUTPUT.parent / (prefix + "-three-quarter.png")).exists():
        prefix = None
    if prefix:
        shot = html.escape(SITE["root"] + prefix.removeprefix("../snaps/"), quote=True)
        available = [view for view, _ in VIEWS if (OUTPUT.parent / (prefix + "-" + view + ".png")).exists()]
        if SITE["images"] is not None:
            sources = [prefix + "-" + view + ".png" for view in available] + [prefix + "-sheet.jpg"]
            SITE["images"].update(str((OUTPUT.parent / source).resolve()) for source in sources
                                  if (OUTPUT.parent / source).exists())
        picture = (f'<a class="picture" href="{shot}-sheet{SITE["sheet"]}" target="_blank" rel="noopener" aria-label="Open {html.escape(subject + ": " + title, quote=True)} contact sheet">'
                   f'<img loading="lazy" alt="{html.escape(subject + ": " + title, quote=True)}" data-prefix="{shot}" data-views="{",".join(available)}" src="{shot}-three-quarter{SITE["view"]}"></a>')
    else:
        status = data.get("status", "pending")
        error = str(data.get("error") or "").strip().splitlines()
        detail = f'<span class="error">{html.escape(error[0])}</span>' if error else ""
        picture = f'<div class="picture empty {status}"><strong>{status}</strong>{detail}</div>'
    meta = data["meta"] + " · " + (module_caption(data["source"]) if data.get("source") else "module size unavailable")
    reference = ""
    if column in ("ref-low", "ref-med"):
        ref_round = "r21reflow" if column == "ref-low" else "r21refmedium"
        ref = load(ROUNDS / ref_round / "round.json", {}).get("references", {}).get(subject)
        if ref:
            url = html.escape("http://axalon:8080/nilo/agentic-3js-builder/refs/" + ref["file"], quote=True)
            reference = (f'<a class="reference" href="{url}" target="_blank" rel="noopener">'
                         f'<img loading="lazy" src="{url}" alt="{html.escape(subject, quote=True)} reference sheet">'
                         f'Reference · {html.escape(ref["variant"])}</a>')
    verdict = ""
    if column in API_MODELS:
        verdict = (f'<div class="verdict" data-model="{column}">'
                   f'<div class="grades" role="group" aria-label="{title} compared with the agent final" title="Compared with the agent final">{buttons(GRADES, "data-grade")}</div>'
                   f'<div class="issues" role="group" aria-label="{title} issues" title="Issues (optional)">{buttons(ISSUES, "data-issue")}</div></div>')
    return f'<div class="tile {column}" data-column="{column}"><h4 title="{html.escape(title, quote=True)}">{title}</h4>{picture}<p class="meta">{html.escape(meta)}{reference}</p>{verdict}</div>'


STYLE = """
:root{color-scheme:light dark;--bg:#f6f5f2;--bg2:#fbfbf9;--fg:#23282a;--muted:#6b7370;--faint:#99a19d;--line:#dfe1dc;--btn:#fff;--btn-fg:#3b4440;--btn-hover:#eef1ec;--accent:#2a7a53;--accent-fg:#fff;--final:#39a06e;--tile:#e7e8e4;--bad:#8e3b31;--bad-bg:#f1e7e4}
@media(prefers-color-scheme:dark){:root{--bg:#191b1a;--bg2:#202322;--fg:#e4e6e2;--muted:#9aa29d;--faint:#6d7571;--line:#2f3432;--btn:#262a29;--btn-fg:#cfd5d0;--btn-hover:#303634;--accent:#49a878;--accent-fg:#0f1a14;--final:#4cbd84;--tile:#2a2e2c;--bad:#e09a8f;--bad-bg:#3a2724}}
*{box-sizing:border-box}html{background:var(--bg)}body{margin:0;background:var(--bg);color:var(--fg);font:13px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
main,.bar-inner{max-width:1680px;margin:auto;padding:10px 18px}.eyebrow{text-transform:uppercase;letter-spacing:1.4px;font-size:10px;color:var(--muted);font-weight:700}h1{font-size:20px;line-height:1.2;margin:2px 0 6px;letter-spacing:-.4px}
details.intro{max-width:1000px;color:var(--muted);font-size:12px;margin:0 0 6px}details.intro summary{cursor:pointer;color:var(--fg);font-weight:600;font-size:12px;list-style:none;display:inline-flex;align-items:center;gap:6px}details.intro summary::-webkit-details-marker{display:none}details.intro summary::before{content:"";width:0;height:0;border:4px solid transparent;border-left:6px solid var(--muted);transition:transform .12s}details.intro[open] summary::before{transform:rotate(90deg)}details.intro p{margin:6px 0}strong{color:var(--fg);font-weight:600}
button{font:inherit;cursor:pointer;border:1px solid var(--line);background:var(--btn);color:var(--btn-fg);border-radius:5px;padding:0 9px;height:26px;line-height:1;white-space:nowrap}button:hover{border-color:var(--accent);background:var(--btn-hover)}button:focus-visible,a:focus-visible,textarea:focus-visible,summary:focus-visible{outline:2px solid var(--accent);outline-offset:2px}button[aria-pressed=true]{background:var(--accent);color:var(--accent-fg);border-color:var(--accent)}
.bar{position:sticky;top:0;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(10px);z-index:5;border-bottom:1px solid var(--line)}.bar-inner{padding:6px 18px;display:flex;flex-wrap:wrap;gap:6px 16px;align-items:center}.views{display:flex;flex-wrap:wrap;gap:3px;align-items:center}.view-label{font-size:11px;font-weight:700;color:var(--muted);margin-right:4px;text-transform:uppercase;letter-spacing:.6px}.views button{font-size:12px}
.columns{display:flex;flex-wrap:wrap;align-items:center;gap:2px 10px;flex:1 1 auto}.columns label{display:inline-flex;align-items:center;gap:5px;font-size:12px;cursor:pointer;height:24px;color:var(--btn-fg)}.columns input{width:14px;height:14px;margin:0;accent-color:var(--accent)}.tile.off{display:none}
.save-tools{margin-left:auto;display:flex;align-items:center;gap:10px;flex-wrap:wrap}#verdict-count{font-size:11px;color:var(--muted)}#copy{font-weight:600;border-color:var(--accent);color:var(--accent)}#save-status{width:100%;font-size:11px;color:var(--bad)}#save-status:empty{display:none}#export{width:100%;padding:8px;border:1px solid var(--line);border-radius:6px;background:var(--bg2)}#export p{margin:0 0 6px}textarea{width:100%;min-height:140px;font:11px/1.5 ui-monospace,monospace;padding:8px;border:1px solid var(--line);border-radius:4px;background:var(--bg);color:var(--fg)}
h2{font-size:15px;letter-spacing:-.2px;margin:18px 0 0}.section-note{color:var(--muted);font-size:12px;margin:1px 0 6px}
.comparison-row{border-top:1px solid var(--line);padding:10px 0 12px}.row-heading{margin-bottom:6px;display:flex;gap:4px 14px;align-items:baseline;flex-wrap:wrap}h3{font-size:14px;margin:0;font-weight:650}.brief{font-size:11.5px;color:var(--muted);display:flex;gap:2px 12px;flex-wrap:wrap}
.tiles{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}.tile{min-width:0;display:grid;grid-row:span 4;grid-template-rows:subgrid;row-gap:5px;align-content:start}
h4{margin:0;font-size:11px;line-height:1.25;font-weight:600;color:var(--muted);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;align-self:end}.final h4{color:var(--final)}
.picture{display:block;width:100%;aspect-ratio:1;background:var(--tile);border-radius:6px;overflow:hidden}.picture img{display:block;width:100%;height:100%;object-fit:contain}a.picture:hover{box-shadow:0 0 0 2px var(--accent)}.final .picture{box-shadow:0 0 0 2px var(--final)}.final .picture:hover{box-shadow:0 0 0 2px var(--final),0 0 0 4px color-mix(in srgb,var(--final) 35%,transparent)}
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px;text-align:center;color:var(--faint);gap:6px}.empty strong{font-weight:500;color:inherit;font-size:14px}.empty.crashed{color:var(--bad);background:var(--bad-bg)}.error{font-size:10.5px;overflow-wrap:anywhere;max-width:100%;line-height:1.3}
.meta{font-size:10.5px;line-height:1.35;color:var(--muted);margin:0;overflow-wrap:anywhere}
.reference{display:flex;align-items:center;gap:6px;margin-top:5px;color:var(--muted);text-decoration:none}.reference img{width:48px;height:48px;object-fit:contain;border-radius:4px;background:var(--tile)}.reference:hover{color:var(--accent)}
.verdict{display:flex;flex-direction:column;gap:4px;container-type:inline-size}.grades{display:grid;grid-template-columns:repeat(3,1fr)}.grades button{font-size:10.5px;padding:0 2px;height:24px;border-radius:0;overflow:hidden;text-overflow:ellipsis;margin-left:-1px}.grades button:first-child{border-radius:5px 0 0 5px;margin-left:0}.grades button:last-child{border-radius:0 5px 5px 0}.grades button[aria-pressed=true]{position:relative;z-index:1}
@container (max-width:190px){.grades{grid-template-columns:1fr}.grades button{margin:-1px 0 0;height:22px}.grades button:first-child{border-radius:5px 5px 0 0;margin-top:0}.grades button:last-child{border-radius:0 0 5px 5px}}
.issues{display:flex;flex-wrap:wrap;gap:3px}.issues button{font-size:10px;height:20px;padding:0 7px;border-radius:10px;color:var(--muted)}.issues button[aria-pressed=true]{color:var(--accent-fg)}
.better{display:flex;gap:4px;align-items:center;justify-content:flex-end;flex-wrap:wrap;margin:8px 0 0;font-size:11px}.better-label{font-weight:600;color:var(--muted);margin-right:4px}.better button{font-size:11px;height:24px}
.scroll-hint{display:none}[hidden]{display:none!important}
@media(max-width:1100px){.tiles{gap:6px}.grades button{font-size:10px}.issues button{padding:0 5px}}
@media(max-width:700px){main,.bar-inner{padding-left:10px;padding-right:10px}h1{font-size:18px}.bar-inner{gap:5px 10px}.views button{font-size:11px;padding:0 7px}.view-label{display:none}.columns{flex-wrap:nowrap;overflow-x:auto;width:100%;gap:0 12px;padding-bottom:2px}.columns label{font-size:11px;height:22px;white-space:nowrap;flex:0 0 auto}.save-tools{width:100%;justify-content:space-between;gap:5px}.tiles{display:flex;overflow-x:auto;scroll-snap-type:x proximity;gap:8px;padding:2px 2px 8px;margin:0 -2px}.tile{flex:0 0 240px;scroll-snap-align:start;display:flex;flex-direction:column;gap:5px}h4{align-self:stretch}.row-heading{gap:3px 10px}.scroll-hint{display:block;color:var(--faint);font-size:10.5px;margin:0 0 4px}.better{justify-content:flex-start}h2{font-size:14px}.grades button{height:28px}.issues button{height:24px}}
""".replace("repeat(5,", f"repeat(var(--cols,{len(COLUMNS)}),")

SCRIPT = """
const storageKey='agentic-3js-builder-gap2-verdicts-v1';
const rows=[...document.querySelectorAll('.comparison-row')];
const grades=['as good','a bit worse','far worse'];
const issues=['face/eyes','floating/broken parts','bland colour','too little detail','goofy'];
const models=['sonnet','astra','haiku','app','single','craft','single-med','craft-med','single-low','craft-low','ref-low','ref-med'];
const empty=()=>({...Object.fromEntries(models.map(model=>[model,{grade:null,issues:[]}])),better:null});
let stored={},verdicts={};
const notice=document.getElementById('save-status');
try{stored=JSON.parse(localStorage.getItem(storageKey)||'{}')||{};}catch(error){notice.textContent='Saved verdicts could not be read. New choices will still be available to copy.';}
for(const row of rows){
 const saved=stored[row.dataset.subject],value=empty();
 if(saved&&typeof saved==='object'){
  for(const model of models){
   if(grades.includes(saved[model]?.grade))value[model].grade=saved[model].grade;
   if(Array.isArray(saved[model]?.issues))value[model].issues=issues.filter(issue=>saved[model].issues.includes(issue));
  }
  if(['Sonnet','Astra','Haiku','App','Single','Craft','Single medium','Craft medium','Single low','Craft low','Ref low','same'].includes(saved.better))value.better=saved.better;
 }
 verdicts[row.dataset.subject]=value;
}
const hasVerdict=value=>value.better||models.some(model=>value[model].grade||value[model].issues.length);
const exportObject=()=>Object.fromEntries(Object.entries(verdicts).filter(([,value])=>hasVerdict(value)));
const render=()=>{
 for(const row of rows){
  const value=verdicts[row.dataset.subject];
  row.querySelectorAll('.verdict').forEach(group=>{
   const choice=value[group.dataset.model];
   group.querySelectorAll('[data-grade]').forEach(button=>button.setAttribute('aria-pressed',choice.grade===button.dataset.grade));
   group.querySelectorAll('[data-issue]').forEach(button=>button.setAttribute('aria-pressed',choice.issues.includes(button.dataset.issue)));
  });
  row.querySelectorAll('[data-better]').forEach(button=>button.setAttribute('aria-pressed',value.better===button.dataset.better));
 }
 document.getElementById('verdict-count').textContent=`${Object.keys(exportObject()).length} / ${rows.length} rows with verdicts`;
};
const save=()=>{
 try{localStorage.setItem(storageKey,JSON.stringify(exportObject()));notice.textContent='';}
 catch(error){notice.textContent='Browser storage is blocked: choices work here, but copy them before leaving.';}
 document.getElementById('export').hidden=true;
 render();
};
for(const row of rows){
 row.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  const value=verdicts[row.dataset.subject],group=button.closest('.verdict');
  if(button.dataset.grade){value[group.dataset.model].grade=button.dataset.grade;}
  else if(button.dataset.issue){const chosen=value[group.dataset.model].issues,issue=button.dataset.issue;value[group.dataset.model].issues=chosen.includes(issue)?chosen.filter(item=>item!==issue):[...chosen,issue];}
  else if(button.dataset.better){value.better=button.dataset.better;}
  else return;
  save();
 });
}
render();
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-view]').forEach(other=>other.setAttribute('aria-pressed',other===button));
 document.querySelectorAll('img[data-prefix]').forEach(image=>{
  const view=image.dataset.views.split(',').includes(button.dataset.view)?button.dataset.view:'three-quarter';
  image.src=image.dataset.prefix+'-'+view+document.body.dataset.viewExt;
 });
}));
document.getElementById('copy').addEventListener('click',async()=>{
 const text=JSON.stringify(exportObject(),null,2),button=document.getElementById('copy');
 try{
  if(!navigator.clipboard?.writeText)throw new Error('Clipboard API unavailable');
  await navigator.clipboard.writeText(text);button.textContent='Copied verdicts';document.getElementById('export').hidden=true;
 }catch(error){
  document.getElementById('export').hidden=false;
  const textarea=document.getElementById('export-text');textarea.value=text;textarea.focus();textarea.select();button.textContent='Copy my verdicts';
 }
});
const columnKey='agentic-3js-builder-gap2-columns-v1';
const columnBoxes=[...document.querySelectorAll('[data-toggle-column]')];
const allColumns=columnBoxes.map(box=>box.dataset.toggleColumn);
// ?cols=final,app,single lists the visible columns; a shared link wins over this browser's saved choice.
const urlColumns=new URLSearchParams(location.search).get('cols');
let hiddenColumns=[];
if(urlColumns!==null){const shown=urlColumns.split(',');hiddenColumns=allColumns.filter(column=>!shown.includes(column));}
else{try{hiddenColumns=JSON.parse(localStorage.getItem(columnKey)||'[]')||[];}catch(error){}}
const saveColumns=()=>{
 try{localStorage.setItem(columnKey,JSON.stringify(hiddenColumns));}catch(error){}
 const url=new URL(location.href);
 if(hiddenColumns.length)url.searchParams.set('cols',allColumns.filter(column=>!hiddenColumns.includes(column)).join(','));
 else url.searchParams.delete('cols');
 history.replaceState(null,'',url.toString().replace(/%2C/g,','));
};
const applyColumns=()=>{
 for(const box of columnBoxes){
  box.checked=!hiddenColumns.includes(box.dataset.toggleColumn);
  document.querySelectorAll(`.tile[data-column="${box.dataset.toggleColumn}"]`).forEach(tile=>tile.classList.toggle('off',!box.checked));
 }
 document.documentElement.style.setProperty('--cols',Math.max(1,columnBoxes.filter(box=>box.checked).length));
};
columnBoxes.forEach(box=>box.addEventListener('change',()=>{
 hiddenColumns=columnBoxes.filter(other=>!other.checked).map(other=>other.dataset.toggleColumn);
 saveColumns();
 applyColumns();
}));
applyColumns();
saveColumns();
"""


def main(publish=None):
    """Write the local page; with `publish` (a build directory) write `<publish>/gap2/index.html` for the showcase
    build instead, reading its renders from /renders/, and print the JSON list of source images it needs."""
    output = OUTPUT
    if publish:
        output = Path(publish) / "gap2/index.html"
        SITE.update(root="/renders/", view=".webp", sheet=".webp", images=set())
    output.parent.mkdir(parents=True, exist_ok=True)
    out = ['<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
           '<title>Agent vs single-run and multi-call · phase 2</title><style>', STYLE, f'</style></head><body data-view-ext="{SITE["view"]}">',
           '<main><div class="eyebrow">The single-run gap / phase 2</div><h1>Same briefs. Thirteen builds. Your verdict.</h1>',
           '<details class="intro"><summary>What the columns are</summary><p><strong>Sonnet agent · final</strong> is the finished sample from the agentic session (green outline). <strong>Sonnet agent · first draft</strong> is that session’s first file write, with crash repairs where needed. <strong>Sonnet · single-run</strong>, <strong>Astra · single-run</strong> and <strong>Haiku · single-run</strong> each use one API request and one reply, with no tools. <strong>Sonnet · agent framing (app, multi-call · ~17 calls)</strong> uses an agent system/brief template and synthetic current-doc reads, with a write/edit/typecheck loop. <strong>Sonnet · agent framing, single-run</strong> uses that same frozen prefix plus prefilled orientation and SDK lookups, and extracts the complete write from one reply without returning tool results. <strong>Sonnet · agent framing + craft, single-run</strong> adds craft guidance as another pre-read file. These original two columns use high effort; the four following columns repeat their frozen inputs at medium and low effort, with no other request changes. Untick columns to hide them; the choice is remembered.</p>',
           '<p><strong>Sonnet · agent framing + reference image, single-run · low</strong> keeps the frozen plain single-run framing and brief, adds a prefilled reference-image read, and asks the model to match that design while retaining the brief’s staging. Its caption thumbnail links to the exact neutral/styled sheet the model received.</p>',
           '<p>There are <strong>no visual feedback turns</strong>: up to two separate repair calls only send back the crash error and do not change a single-run build’s label. Replies without a file write are failed single runs; at most one fresh redraw is allowed. Captions distinguish generation, redraw and repair requests and include their entire cost/time; agent finals show session time. First-draft generation cost/time were not recorded. Under each API build, the three buttons grade it against the agent final; the chips tag issues (optional). Click a picture for its contact sheet. Refresh to see newly completed builds.</p></details></main>',
           '<div class="bar"><div class="bar-inner"><div class="views" role="group" aria-label="Image view"><span class="view-label">View</span>']
    for view, label in VIEWS:
        out.append(f'<button type="button" data-view="{view}" aria-pressed="{str(view == "three-quarter").lower()}">{label}</button>')
    out.append('</div><div class="columns" role="group" aria-label="Columns shown"><span class="view-label">Columns</span>')
    for column, title in COLUMNS:
        out.append(f'<label><input type="checkbox" data-toggle-column="{column}" checked>{html.escape(title)}</label>')
    out.append('</div><div class="save-tools"><span id="verdict-count" aria-live="polite"></span><button type="button" id="copy">Copy my verdicts</button></div><div id="save-status" role="status"></div><div id="export" hidden><p>Clipboard access is blocked here. Copy the selected JSON below (Ctrl/Cmd+C, or press and hold on a phone).</p><textarea id="export-text" readonly aria-label="My verdicts JSON"></textarea></div></div></div><main>')
    for pitches, base, heading, note in [
        ("pitches-r7.json", "r12", "Held-out · 12 briefs", "Not used while tuning the prompts."),
        ("pitches-r5.json", "r13", "Development · 16 briefs", "The briefs used while tuning the prompts."),
    ]:
        out.append(f'<section><h2>{heading}</h2><p class="section-note">{note}</p>')
        for subject in load(ROOT / "bakeoff" / pitches)["subjects"]:
            subject_id = subject["id"]
            brief = "".join(f'<span>{html.escape(line)}</span>' for line in subject["rich"].splitlines())
            out.append(f'<article class="comparison-row" data-subject="{subject_id}"><div class="row-heading"><h3>{subject_id}</h3><div class="brief">{brief}</div></div><p class="scroll-hint">Swipe the builds left to compare all thirteen →</p><div class="tiles">')
            out.extend(cell(subject_id, column, title, base) for column, title in COLUMNS)
            out.append('</div><div class="better" role="group" aria-label="Better API build"><span class="better-label">Better API build:</span>' + buttons(["Sonnet", "Astra", "Haiku", "App", "Single", "Craft", "Single medium", "Craft medium", "Single low", "Craft low", "Ref low", "same"], "data-better") + '</div></article>')
        out.append('</section>')
    out.extend(['</main><script>', SCRIPT, '</script></body></html>'])
    with tempfile.NamedTemporaryFile(mode="w", dir=output.parent, suffix=".html", delete=False) as handle:
        handle.write("\n".join(out))
        temporary = Path(handle.name)
    temporary.chmod(0o644)
    temporary.replace(output)
    print(json.dumps(sorted(SITE["images"])) if publish else output)


if __name__ == "__main__":
    import sys

    main(sys.argv[sys.argv.index("--publish") + 1] if "--publish" in sys.argv else None)
