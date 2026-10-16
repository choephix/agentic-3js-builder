#!/usr/bin/env python3
"""Publish Gap 4's live Sonnet/Argon comparison without model calls or judging.

`python3 bakeoff/gap4_page.py` writes the local PNG page. `--publish DIR`
writes DIR/gap4/index.html and prints the render-source JSON for WebP export.
All 28 briefs retain Gap 2's held-out/development ordering. Missing or partial
live records remain pending; rerun this command as generation/repairs finish.
Model-time captions sum API attempts (including redraws and repairs), excluding
queue/render time where per-attempt timing is available. Medians use renders.
"""

import html
import json
import tempfile
from functools import lru_cache
from pathlib import Path
from statistics import median

from gap2_page import STYLE as GAP2_STYLE, VIEWS, buttons, chain, entries, load
from gap3_page import module_kb, snap_exists
from gap_page import LEGACY, PUBLIC, ROOT, round_for_slug

ROUNDS = ROOT / "bakeoff/rounds"
OUTPUT = PUBLIC / "gap4/index.html"
COLUMNS = [("final", "Sonnet agent · final"),
           ("single", "Sonnet 5.5 · high · single-run"),
           ("craft", "Sonnet 5.5 · high + craft · single-run"),
           ("argon-high", "Gemini 4 Argon · high · single-run"),
           ("argon-low", "Gemini 4 Argon · low · single-run")]
ROUND_IDS = {"single": "r19single", "craft": "r19craft",
             "argon-high": "r23argonhigh", "argon-low": "r23argonlow"}
ISSUES = ["face/eyes", "floating/broken parts", "bland colour", "too little detail", "goofy"]
GRADES = ["as good", "a bit worse", "far worse"]
BEST = [title for _, title in COLUMNS] + ["same"]
STYLE = GAP2_STYLE.replace("var(--cols,14)", f"var(--cols,{len(COLUMNS)})") + """
h4 .column-stats{display:block;font-weight:400;font-size:10px;margin-top:4px;color:var(--muted)}
h4{-webkit-line-clamp:unset}.intro-note{max-width:1100px;color:var(--muted);font-size:12px}
"""


def model_ms(entry):
    attempts = entry.get("attempts")
    if attempts and all(item.get("wallMs") is not None for item in attempts):
        return sum(item["wallMs"] for item in attempts)
    return entry.get("wallMs")


def checked_tile(entry):
    slug = entry["slug"]
    directory = ROUNDS / round_for_slug(slug)
    history = list(chain(entry))
    cost = entry.get("chainCostUsd")
    if cost is None and all(item.get("costUsd") is not None for item in history):
        cost = sum(item["costUsd"] for item in history)
    times = [model_ms(item) for item in history]
    data = {"cost": cost, "seconds": sum(times) / 1000 if all(time is not None for time in times) else None,
            "kb": module_kb(directory / "builds" / f"{slug}.ts"),
            "repairs": sum(item.get("mode") == "repair" for item in history)}
    check = load(directory / "checks" / f"{slug}.json", entry.get("check"))
    if entry.get("hasCode") is False:
        return {**data, "status": "crashed", "error": entry.get("error") or entry.get("finishReason") or "No module returned"}
    if check and check.get("rendered") is False:
        return {**data, "status": "crashed", "error": check.get("renderError") or "Render failed"}
    if check and check.get("rendered") and check.get("lane"):
        prefix = f"../snaps/{slug}/{check['lane']}/snaps/v01"
        if snap_exists(prefix):
            return {**data, "prefix": prefix}
    return {**data, "status": "pending"}


@lru_cache(maxsize=None)
def tile_data(subject, column):
    if column == "final":
        slug = subject + "Sonnet"
        build = load(ROOT / "samples" / f"{slug}.build.json", {})
        prefix = LEGACY[subject]["sonnet-agent"]["prefix"]
        return {"prefix": prefix if snap_exists(prefix) else None,
                "cost": build.get("cost"), "seconds": build.get("wallSeconds"),
                "kb": module_kb(ROOT / "samples" / f"{slug}.ts"), "repairs": 0}
    pending = None
    for suffix in ("fix2", "fix", ""):
        candidates = [item for item in entries(ROUND_IDS[column] + suffix)
                      if item.get("subject") == subject]
        for entry in reversed(candidates):
            data = checked_tile(entry)
            # Keep an existing render while a new repair is being published.
            if data.get("prefix") or data.get("status") == "crashed":
                return data
            if pending is None:
                pending = data
    return pending or {"status": "pending", "seconds": None, "cost": None, "kb": None, "repairs": 0}


def metric_caption(data, final=False):
    timing = f"{data['seconds'] / 60:.1f} min" if data.get("seconds") is not None else "time unavailable"
    money = f"${data['cost']:.2f}" if data.get("cost") is not None else "cost unavailable"
    size = f"{data['kb']:.1f} KB" if data.get("kb") is not None else "code size unavailable"
    caption = f"{timing} {'session time' if final else 'model time'} · {money} · {size}"
    if not final:
        caption += f" · {data['repairs']} repair call{'s' if data['repairs'] != 1 else ''}"
    return caption


def column_caption(subjects, column):
    rendered = [tile_data(subject["id"], column) for subject in subjects
                if tile_data(subject["id"], column).get("prefix")]
    values = {}
    for field in ("seconds", "cost", "kb"):
        known = [data[field] for data in rendered if data.get(field) is not None]
        values[field] = median(known) if known else None
    timing = f"{values['seconds'] / 60:.1f} min" if values["seconds"] is not None else "— min"
    money = f"${values['cost']:.2f}" if values["cost"] is not None else "$—"
    size = f"{values['kb']:.1f} KB" if values["kb"] is not None else "— KB"
    return f"{len(rendered)}/{len(subjects)} rendered · Median · {timing} · {money} · {size}"


def cell(subject, column, title, stats, site):
    data = tile_data(subject, column)
    prefix = data.get("prefix")
    if prefix:
        shot = html.escape(site["root"] + prefix.removeprefix("../snaps/"), quote=True)
        available = [view for view, _ in VIEWS if snap_exists(prefix, f"-{view}.png")]
        if site["images"] is not None:
            sources = [prefix + "-" + view + ".png" for view in available] + [prefix + "-sheet.jpg"]
            site["images"].update(str((PUBLIC / source.removeprefix("../")).resolve()) for source in sources
                                  if (PUBLIC / source.removeprefix("../")).is_file())
        picture = (f'<a class="picture" href="{shot}-sheet{site["sheet"]}" target="_blank" rel="noopener" aria-label="Open {html.escape(subject + ": " + title, quote=True)} contact sheet">'
                   f'<img loading="lazy" alt="{html.escape(subject + ": " + title, quote=True)}" data-prefix="{shot}" data-views="{",".join(available)}" src="{shot}-three-quarter{site["view"]}"></a>')
    else:
        status = data.get("status", "pending")
        errors = str(data.get("error") or "").strip().splitlines()
        detail = f'<span class="error">{html.escape(errors[0])}</span>' if errors else ""
        label = "crashed" if status == "crashed" else "pending"
        picture = f'<div class="picture empty {status}"><strong>{label}</strong>{detail}</div>'
    verdict = ""
    if column != "final":
        verdict = (f'<div class="verdict" data-model="{column}">'
                   f'<div class="grades" role="group" aria-label="{html.escape(title, quote=True)} compared with the agent final">{buttons(GRADES, "data-grade")}</div>'
                   f'<div class="issues" role="group" aria-label="{html.escape(title, quote=True)} issues">{buttons(ISSUES, "data-issue")}</div></div>')
    return (f'<div class="tile {column}" data-column="{column}"><h4>{html.escape(title)}'
            f'<span class="column-stats">{html.escape(stats)}</span></h4>{picture}'
            f'<p class="meta">{html.escape(metric_caption(data, column == "final"))}</p>{verdict}</div>')


SCRIPT = """
const storageKey='agentic-3js-builder-gap4-verdicts-v1';
const rows=[...document.querySelectorAll('.comparison-row')];
const grades=__GRADES__,issues=__ISSUES__,models=__MODELS__,best=__BEST__;
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
  if(best.includes(saved.better))value.better=saved.better;
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
const columnKey='agentic-3js-builder-gap4-columns-v1';
const columnBoxes=[...document.querySelectorAll('[data-toggle-column]')];
const allColumns=columnBoxes.map(box=>box.dataset.toggleColumn);
// Shared ?cols=final,single,argon-high links override the browser's saved choice.
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
 saveColumns();applyColumns();
}));
applyColumns();saveColumns();
"""
for placeholder, value in [("__GRADES__", GRADES), ("__ISSUES__", ISSUES),
                           ("__MODELS__", list(ROUND_IDS)), ("__BEST__", BEST)]:
    SCRIPT = SCRIPT.replace(placeholder, json.dumps(value))


def main(publish=None):
    entries.cache_clear()
    tile_data.cache_clear()
    sections = [(load(ROOT / "bakeoff/pitches-r7.json")["subjects"], "Held-out · 12 briefs", "Not used while tuning the prompts."),
                (load(ROOT / "bakeoff/pitches-r5.json")["subjects"], "Development · 16 briefs", "The briefs used while tuning the prompts.")]
    subjects = [subject for group, _, _ in sections for subject in group]
    output = Path(publish) / "gap4/index.html" if publish else OUTPUT
    site = {"root": "../renders/" if publish else "../snaps/",
            "view": ".webp" if publish else ".png", "sheet": ".webp" if publish else ".jpg",
            "images": set() if publish else None}
    stats = {column: column_caption(subjects, column) for column, _ in COLUMNS}
    out = ['<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
           '<title>The single-run gap · phase 4 · Gemini 4 Argon</title><style>', STYLE, f'</style></head><body data-view-ext="{site["view"]}">',
           '<main><div class="eyebrow">The single-run gap / phase 4</div><h1>Same 28 briefs. Sonnet and Argon. Your verdict.</h1>',
           '<p class="intro-note"><strong>Sonnet agent · final</strong> is the finished model from a Sonnet agent session, outlined in green: the quality target. <strong>Sonnet 5.5 · high</strong> is the high-effort single-run baseline (r19single); <strong>high + craft</strong> adds the craft instructions (r19craft). <strong>Gemini 4 Argon</strong> writes the same briefs at high or low effort (r23argonhigh / r23argonlow). Single-run means one request and one reply, not an agent loop. Separate repairs are allowed only if the code crashed, never to improve its looks.</p>',
           '<details class="intro"><summary>How to compare</summary><p>Captions show model time, total estimated cost, code KB and repair calls. Time and cost include redraws and repairs; model time uses API-attempt timing where recorded, excluding queue and render time. Agent finals show session time. Column medians include rendered subjects only. Missing or unchecked builds say “pending”; completed failures say “crashed”. Regenerate the page as results arrive. Grade each API build against the green final, tag issues, and pick the best build per row. Choices stay in this browser separately from Gap 2 and Gap 3. Click a picture for its contact sheet; use “Copy my verdicts” to share your choices.</p></details></main>',
           '<div class="bar"><div class="bar-inner"><div class="views" role="group" aria-label="Image view"><span class="view-label">View</span>']
    for view, label in VIEWS:
        out.append(f'<button type="button" data-view="{view}" aria-pressed="{str(view == "three-quarter").lower()}">{label}</button>')
    out.append('</div><div class="columns" role="group" aria-label="Columns shown"><span class="view-label">Columns</span>')
    for column, title in COLUMNS:
        out.append(f'<label><input type="checkbox" data-toggle-column="{column}" checked>{html.escape(title)}</label>')
    out.append('</div><div class="save-tools"><span id="verdict-count" aria-live="polite"></span><button type="button" id="copy">Copy my verdicts</button></div><div id="save-status" role="status"></div><div id="export" hidden><p>Clipboard access is blocked here. Copy the selected JSON below (Ctrl/Cmd+C, or press and hold on a phone).</p><textarea id="export-text" readonly aria-label="My verdicts JSON"></textarea></div></div></div><main>')
    for group, heading, note in sections:
        out.append(f'<section><h2>{heading}</h2><p class="section-note">{note}</p>')
        for subject in group:
            subject_id = subject["id"]
            brief = "".join(f'<span>{html.escape(line)}</span>' for line in subject["rich"].splitlines())
            out.append(f'<article class="comparison-row" data-subject="{subject_id}"><div class="row-heading"><h3>{subject_id}</h3><div class="brief">{brief}</div></div><p class="scroll-hint">Swipe the builds left to compare all five →</p><div class="tiles">')
            out.extend(cell(subject_id, column, title, stats[column], site) for column, title in COLUMNS)
            out.append('</div><div class="better" role="group" aria-label="Best build"><span class="better-label">Best build:</span>' + buttons(BEST, "data-better") + '</div></article>')
        out.append('</section>')
    out.extend(['</main><script>', SCRIPT, '</script></body></html>'])
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(mode="w", dir=output.parent, suffix=".html", delete=False) as handle:
        handle.write("\n".join(out))
        temporary = Path(handle.name)
    temporary.chmod(0o644)
    temporary.replace(output)
    print(json.dumps(sorted(site["images"])) if publish else output)


if __name__ == "__main__":
    import sys

    main(sys.argv[sys.argv.index("--publish") + 1] if "--publish" in sys.argv else None)
