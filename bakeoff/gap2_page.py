#!/usr/bin/env python3
"""Publish the four-column, human-verdict comparison; never build or call models."""

import html
import json
import tempfile
from functools import lru_cache
from pathlib import Path

from gap_page import LEGACY, PUBLIC, ROOT, round_for_slug

ROUNDS = ROOT / "bakeoff/rounds"
OUTPUT = PUBLIC / "gap2/index.html"
VIEWS = [("three-quarter", "three-quarter"), ("front", "front"), ("side", "side"),
         ("back", "back"), ("low", "low"), ("head", "head close-up")]
COLUMNS = [("final", "Sonnet agent · final"), ("draft", "Sonnet agent · first draft"),
           ("sonnet", "Sonnet · one-shot"), ("astra", "Astra · one-shot")]
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
    timing = f"{duration(seconds)} model time" if times_known else (f"{duration(seconds)} repairs; draft time unavailable" if repairs else "model time unavailable")
    turns = f" · {repairs} repair turn{'s' if repairs != 1 else ''}" if api or repairs else ""
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
    round_base = base + ("astra" if column == "astra" else "")
    for suffix in ("fix2", "fix", ""):
        entry = next((item for item in entries(round_base + suffix)
                      if item.get("subject") == subject and item.get("arm") == "craft3"), None)
        if entry:
            return checked_tile(entry, api=True)
    return {"status": "pending", "meta": "cost unavailable · model time unavailable · 0 repair turns"}


def buttons(values, attribute):
    return "".join(f'<button type="button" {attribute}="{html.escape(value, quote=True)}" aria-pressed="false">{html.escape(value)}</button>' for value in values)


def cell(subject, column, title, base):
    data = tile_data(subject, column, base)
    prefix = data.get("prefix")
    if prefix and not (OUTPUT.parent / (prefix + "-three-quarter.png")).exists():
        prefix = None
    if prefix:
        shot = html.escape(prefix, quote=True)
        available = ",".join(view for view, _ in VIEWS if (OUTPUT.parent / (prefix + "-" + view + ".png")).exists())
        picture = (f'<a class="picture" href="{shot}-sheet.jpg" target="_blank" rel="noopener" aria-label="Open {html.escape(subject + ": " + title, quote=True)} contact sheet">'
                   f'<img loading="lazy" alt="{html.escape(subject + ": " + title, quote=True)}" data-prefix="{shot}" data-views="{available}" src="{shot}-three-quarter.png"></a>')
    else:
        status = data.get("status", "pending")
        error = str(data.get("error") or "").strip().splitlines()
        detail = f'<span class="error">{html.escape(error[0])}</span>' if error else ""
        picture = f'<div class="picture empty {status}"><strong>{status}</strong>{detail}</div>'
    meta = data["meta"] + " · " + (module_caption(data["source"]) if data.get("source") else "module size unavailable")
    verdict = ""
    if column in ("sonnet", "astra"):
        verdict = (f'<div class="verdict" data-model="{column}"><div class="control-label">Compared with the agent final</div>'
                   f'<div class="grades" role="group" aria-label="{title} grade">{buttons(GRADES, "data-grade")}</div>'
                   f'<div class="control-label issue-label">Issues <span>(optional)</span></div>'
                   f'<div class="issues" role="group" aria-label="{title} issues">{buttons(ISSUES, "data-issue")}</div></div>')
    return f'<div class="tile {column}" data-column="{column}"><h4>{title}</h4>{picture}<p class="meta">{html.escape(meta)}</p>{verdict}</div>'


STYLE = """
:root{color-scheme:light}*{box-sizing:border-box}body{margin:0;background:#f5f6f3;color:#202b29;font:14px/1.5 system-ui,sans-serif}main,.bar-inner{max-width:1600px;margin:auto;padding:20px 24px}h1{font-size:28px;line-height:1.2;margin:6px 0 14px;letter-spacing:-.6px}.intro{max-width:1000px;color:#56615c;margin:10px 0}strong{color:#253b31}.eyebrow{text-transform:uppercase;letter-spacing:1.8px;font-size:11px;color:#60776c;font-weight:700}button{font:inherit;cursor:pointer;border:1px solid #c9d1cb;background:#fff;color:#34483e;border-radius:7px;padding:8px 12px;min-height:42px;line-height:1.2}button:hover{border-color:#688e79;background:#edf4ef}button:focus-visible,a:focus-visible,textarea:focus-visible{outline:3px solid #267a54;outline-offset:3px}button[aria-pressed=true]{background:#245d42;color:white;border-color:#245d42}.bar{position:sticky;top:0;background:#f5f6f3f5;backdrop-filter:blur(12px);z-index:5;border-bottom:1px solid #d7ded6}.bar-inner{padding-top:10px;padding-bottom:10px;display:flex;flex-wrap:wrap;gap:10px 20px;align-items:center}.views{display:flex;flex-wrap:wrap;gap:5px;align-items:center}.view-label{font-size:12px;font-weight:700;margin-right:3px}.save-tools{margin-left:auto;display:flex;align-items:center;gap:12px;flex-wrap:wrap}#verdict-count{font-size:12px;color:#526258}#copy{font-weight:650;background:#e5eee8;border-color:#b2c7b9}#save-status{width:100%;font-size:12px;color:#8c382f}#save-status:empty{display:none}#export{width:100%;padding:10px;border:1px solid #b6c9ba;border-radius:8px;background:#fff}#export p{margin:0 0 6px}textarea{width:100%;min-height:160px;font:12px/1.5 ui-monospace,monospace;padding:10px;border:1px solid #9aae9c;border-radius:4px}h2{font-size:22px;letter-spacing:-.3px;margin:36px 0 0}.section-note{color:#637067;margin:5px 0 20px}.comparison-row{border-top:1px solid #d4dcd3;padding:22px 0 28px}.row-heading{margin-bottom:14px;display:flex;gap:10px 20px;align-items:baseline;flex-wrap:wrap}h3{font-size:17px;margin:0}.brief{font-size:12px;color:#5a685e;display:flex;gap:4px 18px;flex-wrap:wrap}.tiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.tile{min-width:0}h4{margin:0 0 9px;font-size:13px;font-weight:650;color:#415749}.picture{display:block;width:100%;aspect-ratio:1;background:#e2e5e5;border-radius:9px;overflow:hidden}.picture img{display:block;width:100%;height:100%;object-fit:contain}.final .picture{outline:3px solid #339064;outline-offset:0}.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:18px;text-align:center;color:#84908c;gap:10px}.empty strong{font-weight:500;color:inherit;font-size:20px}.empty.crashed{color:#916059;background:#ece5e3}.error{font-size:12px;overflow-wrap:anywhere;max-width:100%}.meta{font-size:11px;color:#647267;min-height:34px;margin:9px 0 13px;overflow-wrap:anywhere}.control-label{font-size:11px;font-weight:650;color:#526456;margin:0 0 7px}.grades,.issues{display:flex;flex-wrap:wrap;gap:5px}.grades button{font-size:12px;padding:8px 10px}.issues button{font-size:11px;min-height:36px;padding:7px 10px;border-radius:20px}.issue-label{margin-top:12px}.issue-label span{font-weight:400;color:#78857c}.better{display:flex;gap:8px;align-items:center;justify-content:flex-end;flex-wrap:wrap;margin:18px 0 0;font-size:12px}.better-label{font-weight:650;margin-right:2px}.better button{min-height:38px;font-size:12px}.scroll-hint{display:none}[hidden]{display:none!important}
@media(max-width:950px){.tiles{gap:12px}.grades button{padding:8px}.save-tools{margin-left:0}}
@media(max-width:700px){main,.bar-inner{padding-left:14px;padding-right:14px}h1{font-size:25px}.bar-inner{gap:9px}.views{gap:4px}.views button{font-size:11px;padding:8px;min-height:38px}.view-label{display:none}.save-tools{width:100%;justify-content:space-between;gap:5px}.save-tools button{font-size:12px;min-height:38px}.tiles{display:flex;overflow-x:auto;scroll-snap-type:x proximity;gap:14px;padding:4px 4px 14px;margin:0 -4px}.tile{flex:0 0 285px;scroll-snap-align:start}.row-heading{gap:5px}.brief{gap:3px}.scroll-hint{display:block;color:#738477;font-size:11px;margin:0 0 10px}.better{justify-content:flex-start}.comparison-row{padding-top:18px}h2{font-size:20px}.intro{font-size:13px}.meta{min-height:34px}.issues button{min-height:40px}}
"""

SCRIPT = """
const storageKey='agentic-3js-builder-gap2-verdicts-v1';
const rows=[...document.querySelectorAll('.comparison-row')];
const grades=['as good','a bit worse','far worse'];
const issues=['face/eyes','floating/broken parts','bland colour','too little detail','goofy'];
const empty=()=>({sonnet:{grade:null,issues:[]},astra:{grade:null,issues:[]},better:null});
let stored={},verdicts={};
const notice=document.getElementById('save-status');
try{stored=JSON.parse(localStorage.getItem(storageKey)||'{}')||{};}catch(error){notice.textContent='Saved verdicts could not be read. New choices will still be available to copy.';}
for(const row of rows){
 const saved=stored[row.dataset.subject],value=empty();
 if(saved&&typeof saved==='object'){
  for(const model of ['sonnet','astra']){
   if(grades.includes(saved[model]?.grade))value[model].grade=saved[model].grade;
   if(Array.isArray(saved[model]?.issues))value[model].issues=issues.filter(issue=>saved[model].issues.includes(issue));
  }
  if(['Sonnet','Astra','same'].includes(saved.better))value.better=saved.better;
 }
 verdicts[row.dataset.subject]=value;
}
const hasVerdict=value=>value.sonnet.grade||value.astra.grade||value.better||value.sonnet.issues.length||value.astra.issues.length;
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
  image.src=image.dataset.prefix+'-'+view+'.png';
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
"""


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    out = ['<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
           '<title>Agent vs one-shot · phase 2</title><style>', STYLE, '</style></head><body>',
           '<main><div class="eyebrow">The one-shot gap / phase 2</div><h1>Same briefs. Four builds. Your verdict.</h1>',
           '<p class="intro"><strong>Sonnet agent · final</strong> is the finished sample from the agentic session (green outline). <strong>Sonnet agent · first draft</strong> is that session’s first file write, with crash repairs where needed. <strong>Sonnet · one-shot</strong> and <strong>Astra · one-shot</strong> each start with one API call, as an app would.</p>',
           '<p class="intro">The one-shots use a new prompt that drops the staged base and spends the code on the subject. There are <strong>no feedback turns</strong>: up to two repairs only send back the crash error. Captions include those repairs’ cost and model time; agent finals show session time. First-draft generation cost/time were not recorded. Click a picture for its contact sheet. Refresh to see newly completed builds.</p></main>',
           '<div class="bar"><div class="bar-inner"><div class="views" role="group" aria-label="Image view"><span class="view-label">View</span>']
    for view, label in VIEWS:
        out.append(f'<button type="button" data-view="{view}" aria-pressed="{str(view == "three-quarter").lower()}">{label}</button>')
    out.append('</div><div class="save-tools"><span id="verdict-count" aria-live="polite"></span><button type="button" id="copy">Copy my verdicts</button></div><div id="save-status" role="status"></div><div id="export" hidden><p>Clipboard access is blocked here. Copy the selected JSON below (Ctrl/Cmd+C, or press and hold on a phone).</p><textarea id="export-text" readonly aria-label="My verdicts JSON"></textarea></div></div></div><main>')
    for pitches, base, heading, note in [
        ("pitches-r7.json", "r12", "Held-out · 12 briefs", "Not used while tuning the prompts."),
        ("pitches-r5.json", "r13", "Development · 16 briefs", "The briefs used while tuning the prompts."),
    ]:
        out.append(f'<section><h2>{heading}</h2><p class="section-note">{note}</p>')
        for subject in load(ROOT / "bakeoff" / pitches)["subjects"]:
            subject_id = subject["id"]
            brief = "".join(f'<span>{html.escape(line)}</span>' for line in subject["rich"].splitlines())
            out.append(f'<article class="comparison-row" data-subject="{subject_id}"><div class="row-heading"><h3>{subject_id}</h3><div class="brief">{brief}</div></div><p class="scroll-hint">Swipe the builds left to compare all four →</p><div class="tiles">')
            out.extend(cell(subject_id, column, title, base) for column, title in COLUMNS)
            out.append('</div><div class="better" role="group" aria-label="Better one-shot"><span class="better-label">Better one-shot:</span>' + buttons(["Sonnet", "Astra", "same"], "data-better") + '</div></article>')
        out.append('</section>')
    out.extend(['</main><script>', SCRIPT, '</script></body></html>'])
    with tempfile.NamedTemporaryFile(mode="w", dir=OUTPUT.parent, suffix=".html", delete=False) as handle:
        handle.write("\n".join(out))
        temporary = Path(handle.name)
    temporary.chmod(0o644)
    temporary.replace(OUTPUT)
    print(OUTPUT)


if __name__ == "__main__":
    main()
