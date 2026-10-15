#!/usr/bin/env python3
"""Publish the replay experiment and its measured table; no model calls or judging."""
import csv
import html
import json
import tempfile
from pathlib import Path

from gap2_page import (PUBLIC, ROOT, ROUNDS, STYLE, VIEWS, checked_tile, entries,
                       load, module_caption, record, tile_data)

OUTPUT = PUBLIC / 'replay/index.html'
INPUT = ROOT / 'bakeoff/replay-inputs'
SUBJECTS = ['africanElephant', 'capybara', 'koala', 'redPanda', 'treasureHoard', 'soulScythe']
COLUMNS = [('final', 'Agent · final'), ('draft', 'Agent · first draft'),
           ('c1', 'C · draw 1 (existing)'), ('c2', 'C · draw 2'), ('c3', 'C · draw 3'),
           ('r1', 'R · draw 1'), ('r2', 'R · draw 2'), ('s1', 'S · draw 1'), ('s2', 'S · draw 2')]
ROUND_BY_COLUMN = {'c2': 'r16ca', 'c3': 'r16cb', 'r1': 'r16replaya', 'r2': 'r16replayb',
                   's1': 'r16shapeda', 's2': 'r16shapedb'}
SCRIPT = """
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-view]').forEach(other=>other.setAttribute('aria-pressed',other===button));
 document.querySelectorAll('img[data-prefix]').forEach(image=>{
  const view=image.dataset.views.split(',').includes(button.dataset.view)?button.dataset.view:'three-quarter';
  image.src=image.dataset.prefix+'-'+view+'.png';
 });
}));
"""


def latest_entry(subject, base):
    for suffix in ('fix2', 'fix', ''):
        entry = next((item for item in entries(base + suffix) if item.get('subject') == subject), None)
        if entry:
            return entry
    return None


def raw_entry(entry):
    while entry and entry.get('from'):
        entry = record(entry['from'])
    return entry or {}


def tile(subject, column):
    base = 'r12' if subject in ('africanElephant', 'soulScythe', 'treasureHoard', 'capybara') else 'r13'
    if column in ('final', 'draft'):
        return tile_data(subject, column, base)
    entry = latest_entry(subject, base if column == 'c1' else ROUND_BY_COLUMN[column])
    if entry:
        data = {**checked_tile(entry, api=True), 'entry': entry}
        if column in ('r1', 'r2', 's1', 's2'):
            from gap2_page import chain
            history = list(chain(entry))
            cost = sum(item.get('costUsd') or 0 for item in history)
            repairs = sum(item.get('mode') == 'repair' for item in history)
            extra = raw_entry(entry).get('extraCalls', 0)
            data['meta'] = f'${cost:.2f} · {extra} extra read-only calls · {repairs} repair turns'
        if entry.get('hasCode') is False:
            data['status'] = 'no draft'
        return data
    stopped = load(INPUT / 'stopped.json', {})
    return {'status': 'not run' if stopped else 'pending',
            'meta': 'Stopped by the usage guard' if stopped else 'No completed run record'}


def cell(subject, column, title):
    data = tile(subject, column)
    prefix = data.get('prefix')
    if prefix and not (OUTPUT.parent / (prefix + '-three-quarter.png')).exists():
        prefix = None
    if prefix:
        shot = html.escape(prefix, quote=True)
        available = ','.join(v for v, _ in VIEWS if (OUTPUT.parent / (prefix + '-' + v + '.png')).exists())
        picture = (f'<a class="picture" href="{shot}-sheet.jpg" target="_blank" rel="noopener">'
                   f'<img loading="lazy" alt="{subject}: {title}" data-prefix="{shot}" data-views="{available}" src="{shot}-three-quarter.png"></a>')
    else:
        status = data.get('status', 'pending')
        error = str(data.get('error') or '').splitlines()
        detail = f'<span class="error">{html.escape(error[0])}</span>' if error else ''
        picture = f'<div class="picture empty {status}"><strong>{status}</strong>{detail}</div>'
    meta = data['meta'] + ' · ' + (module_caption(data['source']) if data.get('source') else 'module size unavailable')
    if column == 'draft':
        meta += ' · image may include crash repair; table measures exact first write'
    return f'<div class="tile {column}"><h4>{title}</h4>{picture}<p class="meta">{html.escape(meta)}</p></div>'


def metric(subject, column, title):
    data = tile(subject, column)
    source = data.get('source')
    entry = data.get('entry', {})
    first = raw_entry(entry)
    if column == 'draft':
        source = INPUT / (subject + '-agent-first.ts')
    content = source.read_bytes() if source and source.exists() else None
    check = None
    if entry:
        from gap_page import round_for_slug
        check = load(ROUNDS / round_for_slug(entry['slug']) / 'checks' / (entry['slug'] + '.json'), entry.get('check'))
    elif data.get('prefix'):
        check = load(OUTPUT.parent / (data['prefix'] + '-report.json'))
    report = (check or {}).get('report') or check or {}
    usage = first.get('usage') or {}
    output = usage.get('completion_tokens', usage.get('output'))
    details = usage.get('completion_tokens_details') or {}
    thinking = details.get('reasoning_tokens')
    text_tokens = (output - thinking) if thinking is not None and output is not None else None
    cost = entry.get('chainCostUsd', entry.get('costUsd'))
    status = data.get('status', 'pending')
    repairs = 0
    if entry:
        from gap2_page import chain
        repairs = sum(item.get('mode') == 'repair' for item in chain(entry))
        status = (f"request failed ({entry.get('status')})" if entry.get('status') != 200 else
                  'no sample write (8-call cap)' if not entry.get('hasCode') else
                  ('repaired' if repairs else 'rendered') if (check or {}).get('rendered') else
                  'crashed after 2 repairs' if repairs == 2 else 'crashed' if check else 'unchecked')
    elif report.get('parts') is not None:
        status = 'rendered (archived)'
    if column in ('final', 'draft'):
        build = load(ROOT / 'samples' / (subject + 'Sonnet.build.json'), {})
        if column == 'final':
            cost = build.get('cost')
            output = (build.get('tokens') or {}).get('output')
        else:
            session = Path.home() / build['builder']['session']
            for line in session.read_text().splitlines():
                rec = json.loads(line)
                m = rec.get('message', {})
                if m.get('role') == 'assistant' and any(c.get('type') == 'toolCall' and c.get('name') == 'write' and str(c.get('arguments', {}).get('path', '')).endswith(subject + 'Sonnet.ts') for c in m.get('content', [])):
                    usage = m.get('usage', {})
                    output = usage.get('output')
                    cost = (usage.get('cost') or {}).get('total')
                    break
    return {'subject': subject, 'variant': title, 'column': column, 'slug': entry.get('slug'),
            'moduleKB': round(len(content) / 1024, 2) if content is not None else None,
            'lines': len(content.splitlines()) if content is not None else None,
            'parts': report.get('parts'), 'textures': report.get('textures'),
            'outputTokens': output, 'thinkingTokens': thinking, 'textTokens': text_tokens,
            'costUsd': cost, 'crashedRepaired': status, 'repairs': repairs,
            'thinkingPassed': first.get('thinkingPassed'),
            'extraCalls': first.get('extraCalls', 0) if entry else None,
            'finalWriteOutputTokens': (first.get('finalWriteUsage') or {}).get('output_tokens') if first.get('hasCode') else None,
            'initialModuleKB': None, 'initialLines': None}


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    manifest = load(INPUT / 'manifest.json', {})
    stopped = load(INPUT / 'stopped.json')
    rows = [metric(s, c, t) for s in SUBJECTS for c, t in COLUMNS]
    from gap_page import round_for_slug
    for row in rows:
        if row['slug']:
            initial = raw_entry(record(row['slug']))
            path = ROUNDS / round_for_slug(initial['slug']) / 'builds' / (initial['slug'] + '.ts')
            if path.exists():
                code = path.read_bytes()
                row['initialModuleKB'] = round(len(code) / 1024, 2)
                row['initialLines'] = len(code.splitlines())
    runs = [p for d in ROUNDS.glob('r16*') for p in (d / 'runs').glob('*.json')]
    records = [load(p, {}) for p in runs]
    total = sum(r.get('costUsd') or 0 for r in records)
    initial_calls = sum(not r.get('from') and r.get('status') == 200 for r in records)
    failed_calls = sum(not r.get('from') and r.get('status') != 200 for r in records)
    repair_calls = sum(bool(r.get('from')) for r in records)
    continuation_calls = sum(r.get('extraCalls', 0) for r in records if not r.get('from'))
    evidence = {'initialCalls': initial_calls, 'plannedCalls': 36, 'failedCalls': failed_calls, 'repairCalls': repair_calls,
                'continuationCalls': continuation_calls, 'totalSpendUsd': total, 'stopped': stopped, 'manifest': manifest, 'rows': rows}
    (OUTPUT.parent / 'results.json').write_text(json.dumps(evidence, indent=2) + '\n')
    (INPUT / 'results.json').write_text(json.dumps(evidence, indent=2) + '\n')
    with (OUTPUT.parent / 'table.csv').open('w') as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    out = ['<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
           '<title>Before the first write · Sonnet replay</title><style>', STYLE,
           'main,.bar-inner{max-width:2100px}.tiles{display:grid;grid-template-columns:repeat(9,minmax(205px,1fr));overflow-x:auto;padding:4px 4px 14px}.tile{min-width:205px}.table-wrap{overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border-bottom:1px solid #d4dcd3;padding:8px;text-align:right;white-space:nowrap}th:first-child,td:first-child{text-align:left}.notice{border-left:4px solid #b18a3c;padding:10px 16px;background:#f8f0dc}.brief{max-width:1400px}.stats{font-size:16px}.tile h4{white-space:nowrap}',
           '</style></head><body><main><div class="eyebrow">The one-shot gap / conversation replay</div>',
           '<h1>What comes before the first write?</h1>',
           '<p class="intro"><strong>C</strong>: craft3 one-shot. <strong>R</strong>: archived agent conversation immediately before its first sample write. <strong>S</strong>: craft3 plus a fixed synthetic doc-reading conversation with current file contents. Same Sonnet 5.5, high effort, 120,000 max output tokens. Two fresh draws per variant; the existing C draw is also shown. When R/S request more reading, execute read-only tools against SDK commit 88fc1f0 and continue for at most eight extra API calls. Writes and renders are refused until the sample write is returned. No critiques; at most two crash repairs, using the app-style craft3 system.</p>',
           f'<p class="notice">{html.escape(manifest.get("caveat", "Inputs not yet prepared"))}</p>',
           f'<p class="stats"><strong>{initial_calls}/36 started draws completed</strong> · {continuation_calls} continuation calls · {failed_calls} failed request records · {repair_calls} repair calls · <strong>${total:.3f}</strong> new spend</p>',
           '<p class="intro">Captions and the main table describe the module actually rendered, including crash repairs. The exact archived first draft is measured in its table row; its image reuses the existing first-draft comparison and may include crash repair. Initial module sizes are retained in the downloadable JSON/CSV. Output-token splits are shown only when reported; “—” means unavailable, not zero. Anthropic output tokens combine thinking and tool arguments. Agent-final cost/tokens cover its entire session; draft cost/tokens cover its first-write generation only. Costs of C/R/S include any repairs.</p>',
           '<p class="intro"><strong>Repair exception:</strong> R draw 1 capybara used the archived agent-style system for its two repair attempts before the craft3 override was introduced. Both replies contained tool markup, not edits; it remains crashed at the two-repair cap. R draw 2 capybara was repaired with craft3. S draw 1 koala did not emit a sample write within eight extra calls and has no module to render.</p>',
           '<p><a href="results.json">Full results JSON</a> · <a href="table.csv">Download table CSV</a></p>']
    if stopped:
        out.append('<p class="notice">Stopped before ' + html.escape(stopped['label']) + ': Anthropic 5 Hour usage ' + html.escape(str(stopped['values'])) + '% (above 50%). Unmade calls are marked not run.</p>')
    out.append('</main><div class="bar"><div class="bar-inner"><div class="views" role="group" aria-label="Image view"><span class="view-label">View</span>')
    for view, label in VIEWS:
        out.append(f'<button type="button" data-view="{view}" aria-pressed="{str(view == "three-quarter").lower()}">{label}</button>')
    out.append('</div></div></div><main>')
    pitches = {p['id']: p['rich'] for p in load(INPUT / 'pitches.json', {'subjects': []})['subjects']}
    for subject in SUBJECTS:
        brief = ''.join(f'<span>{html.escape(line)}</span>' for line in pitches.get(subject, '').splitlines())
        out.append(f'<article class="comparison-row" data-subject="{subject}"><div class="row-heading"><h3>{subject}</h3><div class="brief">{brief}</div></div><p class="section-note">Scroll horizontally to compare all nine builds →</p><div class="tiles">')
        out.extend(cell(subject, column, title) for column, title in COLUMNS)
        out.append('</div><div class="table-wrap"><table><thead><tr><th>Variant</th><th>Module KB</th><th>Lines</th><th>Parts</th><th>Textures</th><th>Output tokens</th><th>Thinking</th><th>Text</th><th>Extra calls</th><th>Cost</th><th>Status</th></tr></thead><tbody>')
        for row in [r for r in rows if r['subject'] == subject]:
            values = [row['variant'], row['moduleKB'], row['lines'], row['parts'], row['textures'], row['outputTokens'], row['thinkingTokens'], row['textTokens'], row['extraCalls'], f"${row['costUsd']:.3f}" if row['costUsd'] is not None else None, row['crashedRepaired']]
            out.append('<tr>' + ''.join('<td>' + html.escape(str(v) if v is not None else '—') + '</td>' for v in values) + '</tr>')
        out.append('</tbody></table></div></article>')
    out.extend(['</main><script>', SCRIPT, '</script></body></html>'])
    with tempfile.NamedTemporaryFile(mode='w', dir=OUTPUT.parent, suffix='.html', delete=False) as handle:
        handle.write('\n'.join(out))
        temporary = Path(handle.name)
    temporary.chmod(0o644)
    temporary.replace(OUTPUT)
    print(f'{OUTPUT}: {initial_calls}/36 calls, {repair_calls} repairs, ${total:.3f}')


if __name__ == '__main__':
    main()
