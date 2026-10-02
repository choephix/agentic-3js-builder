# Bug hunt: one area of the SDK

You hunt bugs in one area of agentic-3js-builder (`/home/cx/noodlespace/agentic-3js-builder`), a TypeScript SDK that lets language models write primitive-built, skeleton-rigged three.js models. The SDK is being reworked into a usable product; your findings feed that rework. The deliverable is a list of real, reproduced bugs with minimal repros and likely causes, written to your report file as you find them.

## Read first

- `docs/api.md` and `docs/conventions.md`: the contract the SDK promises to model authors. A behaviour that contradicts them is a bug, in the code or in the docs.
- The source files of your area (named in your task) and whatever they call.
- `docs/STATUS.md`, section "To-do" and the "Friction" paragraphs: known issues. Give a known issue at most a one-line confirmation (still present? exact trigger?); spend your time on new findings.

## What counts

- Wrong geometry or rig produced silently: misplaced or flipped parts, wrong normals or winding, NaNs, degenerate triangles, wrong bone weights or bone assignment, joints in the wrong place, broken rig answer key.
- Crashes or throws on inputs the docs allow; inputs the docs forbid that are accepted silently and produce garbage.
- Edge cases: zero, negative, tiny, huge values; coincident or collinear points; vertical/horizontal/axis-aligned directions (gimbal and roll ambiguities); closed vs open paths; a single point or segment; reversed direction; mirrored left/right builds; `detail` extremes.
- Docs vs code mismatches: a documented option, default, field name, type or example that the code doesn't match.
- Type-level traps: types that reject documented usage, or nullable types where a value is guaranteed.
- Performance cliffs: an input size that makes a build take seconds or blow up the triangle count.

Rank by what a builder plausibly writes in a real sample: ordinary sizes (millimetres to tens of metres), axis-aligned and mirrored setups, typical counts, documented options in combination. Absurd inputs (1e308, 1e-9, NaN) are at most one P2 line.

Style, naming taste and "it could be nicer" are out of scope unless they cause wrong results.

## How to work

- Write throwaway repro scripts only under `scratch/hunt-<area>/` (gitignored), file names prefixed `hunt-<area>-` because `preview` names its output folder after the file name.
- Pure geometry and math runs in Node: `npx tsx scratch/hunt-<area>/hunt-<area>-x.ts`, inspecting `BufferGeometry` attributes, bone weights, positions and the returned objects directly. Numbers are better evidence than pictures.
- A sample-shaped file (default-exports a no-arg function returning a `THREE.Object3D`; see GUIDE.md "Your sample") can go through the real pipeline: `npm run typecheck -- scratch/hunt-<area>/<file>.ts`, `npm run preview -- scratch/hunt-<area>/<file>.ts [--shot] [--gap A B] [--bones A] [--box A]`, `npm run snap -- scratch/hunt-<area>/<file>.ts --report-only`. Use `preview --shot` when only a picture shows the fault; full `snap` renders are off limits (one shared GPU).
- The headless browser on 127.0.0.1:9333 is shared and already running; never start, stop or restart it.
- Every file outside `scratch/hunt-<area>/` and your report file is read-only: no edits to `src/`, `docs/`, `kits/`, `samples/`, `harness/`, `scripts/`, no git commands that change state, no commits. Other agents work in this checkout at the same time.
- Each finding must be reproduced by a script you ran. State what you observed, with numbers.

## Report

Your report file is `scratch/astra-reports/hunt-<area>.md`. Create it at the start with a heading and append each finding as soon as it is confirmed, so nothing is lost if your session ends early. Each finding:

```
### <AREA>-<n>: <one-line title>
- Severity: P0 (silent wrong output or crash on documented use) | P1 (wrong behaviour on edge input, or a doc/code mismatch that misleads) | P2 (minor, cosmetic, perf)
- Repro: scratch/hunt-<area>/<file>.ts — how to run it
- Expected: … (cite docs/api.md or conventions.md where it applies)
- Actual: … (numbers)
- Cause: src/<file>.ts:<line> — your reading of why
- Fix: the change you'd make, in a sentence or two
```

End the file with a `## Covered` section listing what you tested that behaved correctly, so the rework knows what is solid.

## Final reply

The report path, the finding count by severity, and the three findings that matter most, one line each.
