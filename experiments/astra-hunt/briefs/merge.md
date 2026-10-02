# Merge: one work list from many reports

Dozens of agents bug-hunted, triaged and audited agentic-3js-builder (`/home/cx/noodlespace/agentic-3js-builder`), a TypeScript SDK for primitive-built, skeleton-rigged three.js models with a sample library. Their reports are in `scratch/astra-reports/`. You turn them into one document the rework can work from top to bottom. The reader is Stefan (the owner, English is his second language, reads it hours later without context) and the agents he hands items to.

## Sources

- `hunt-*.md`: raw findings, one file per SDK area or scenario. `triage-*.md`: an independent verdict per finding (confirmed / intended / docs gap / not reproduced), adjusted severity, samples hit, fix. The triage verdict wins over the hunter's claim; a finding without triage keeps the hunter's severity, marked "untriaged".
- `audit-<g>.md` and `audit-<g>-second.md` (g = a…j; `audit-h2-second.md` belongs to h): per-sample defects. Second passes add to and correct first passes; take the corrected view.

## Rules

- Write only your output file. Everything else is read-only; no git commands that change state. Other agents may still be writing reports when you start: reread the source folder before you finish and fold in anything new.
- Repro scripts will be moved: cite `scratch/hunt-<area>/<file>` as `experiments/astra-hunt/repros/hunt-<area>/<file>` and `scratch/triage-<area>/<file>` as `experiments/astra-hunt/repros/triage-<area>/<file>`.
- Merge duplicates (the same root cause reported by several hunters) into one item listing all their ids.
- Drop "not reproduced" items to a short list at the end. Keep "intended" items only where docs need to say so, as docs items.
- Plain, concrete wording: what is wrong, how it shows, where in the code, what to change. No filler.
