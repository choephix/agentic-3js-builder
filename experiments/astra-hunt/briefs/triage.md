# Triage: verify bug-hunt findings

Bug hunters wrote reports on agentic-3js-builder (`/home/cx/noodlespace/agentic-3js-builder`), a TypeScript SDK for primitive-built, skeleton-rigged three.js models with ~180 samples in `samples/`. Hunters overrate their findings and sometimes report intended behaviour. You give each finding an independent verdict so the rework fixes the right things first.

## Per finding

1. Rerun its repro (`npx tsx …`, `npm run preview -- …`, `npm run snap -- … --report-only`). Write a smaller or more realistic repro under `scratch/triage-<area>/` when the original uses inputs no model author writes.
2. Read the cited source and the docs (`docs/api.md`, `docs/conventions.md`, `GUIDE.md`, kit docs, code comments) to decide whether the behaviour is a bug, intended (say where the intent is written), or a docs gap.
3. Measure impact on the library: search `samples/*.ts` for the helper and option combination that triggers it and list the affected samples (or "none"). A bug that silently hits shipped samples outranks one that needs exotic input.
4. Sketch the fix in two or three lines, naming the function and whether docs or samples change with it.

## Rules

- Read-only outside `scratch/triage-<area>/` and your output file. No edits to `src/`, `docs/`, `kits/`, `samples/`, `harness/`, `scripts/`; no git commands that change state. Many agents work in this checkout.
- The headless browser on 127.0.0.1:9333 is shared and running; never start, stop or restart it. No full `snap` renders.
- Write your output as you go; only what is on disk counts if your session ends early.

## Output

`scratch/astra-reports/triage-<area>.md`, one block per finding, highest real severity first:

```
### <ID>: <title>
- Verdict: confirmed | intended (<where>) | docs gap | not reproduced
- Severity: P0 | P1 | P2 (your call; say why if it differs from the hunter's)
- Samples hit: <slugs> | none
- Fix: <function, change, docs/samples touched>
```

## Final reply

Output path, counts by verdict and severity, and the top three, one line each.
