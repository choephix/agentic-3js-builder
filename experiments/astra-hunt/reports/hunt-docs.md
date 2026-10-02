# Documentation bug hunt

### DOCS-1: Closed polyline sweep semantics contradict across docs
- Severity: P1 (wrong behaviour on edge input, or a doc/code mismatch that misleads)
- Repro: `scratch/hunt-docs/hunt-docs-closed-caps.ts` — `npx tsx scratch/hunt-docs/hunt-docs-closed-caps.ts`; `npm run typecheck -- scratch/hunt-docs/hunt-docs-closed-caps.ts`; `npm run preview -- scratch/hunt-docs/hunt-docs-closed-caps.ts --box sweep.root`
- Expected: `docs/api.md:151` says “Sweeps of closed paths get no caps and no seam”; `docs/conventions.md:72` says a closed polyline corner seam gets round caps that overlap. The API statement makes a closed square/polyline sweep appear capless.
- Actual: The square closed polyline reports `meshCount:1`, `vertexCount:82`, and preview bounds `[-0.600,-0.100,-0.600]..[0.597,0.100,0.589]` for path bounds ±0.5 with radius 0.1: the corner seam receives overlapping round-cap geometry. Source also selects `seamCap = "round"` when the seam corner exceeds 20°.
- Cause: `src/sweep.ts:606-610,681-684` distinguishes smooth and corner seams; `seamSmooth` is false for the square and sets both closed-end caps to `"round"`. `docs/api.md:151` overgeneralizes the smooth-loop rule and conflicts with the more precise conventions sentence.
- Fix: Change the API sentence to say smooth closed seams are welded/capless, while corner seams (e.g. closed polylines) receive overlapping round caps, matching `conventions.md`.

### DOCS-2: API examples hard-code the author’s absolute checkout
- Severity: P1 (wrong behaviour on edge input, or a doc/code mismatch that misleads)
- Repro: `scratch/hunt-docs/hunt-docs-absolute-imports.ts` — `npx tsx scratch/hunt-docs/hunt-docs-absolute-imports.ts`; it prints eight absolute imports in `docs/api.md` (lines 86–92 and 369). The module contract in `GUIDE.md:11` says samples import the SDK by relative paths such as `../src/builder`.
- Expected: A model author copying the API module/type example into `samples/<slug>.ts` or another checkout should be able to typecheck it, as GUIDE requires relative SDK imports.
- Actual: The examples resolve only in `/home/cx/noodlespace/agentic-3js-builder`; moving/copying the sample or using another checkout leaves imports pointing at this machine’s source tree. The audit script found `/home/cx/noodlespace/agentic-3js-builder/src/...` in all seven module imports plus the `OutlinePoint` type import.
- Cause: `docs/api.md:86-92,369` embeds an absolute filesystem path, while `GUIDE.md:11` documents relative imports.
- Fix: Use sample-relative imports (`../src/...`) in code blocks, and state that snippets are relative to a `samples/<slug>.ts` file; use the same relative form for `OutlinePoint`.

### DOCS-3: GUIDE misstates the triangle limit as a hard 60k cap
- Severity: P1 (wrong behaviour on edge input, or a doc/code mismatch that misleads)
- Repro: `scratch/hunt-docs/hunt-docs-triangle-budget.ts` — `npm run typecheck -- scratch/hunt-docs/hunt-docs-triangle-budget.ts`; `npm run preview -- scratch/hunt-docs/hunt-docs-triangle-budget.ts`.
- Expected: `GUIDE.md:21` lists “60k triangles” under the model’s limits, implying a build above 60k is over the limit. `docs/api.md:80` distinguishes a 60k soft budget from a 120k hard limit.
- Actual: The valid sample builds and previews at 65,024 triangles. Preview reports only `WARNING 65024 triangles is above the 60000 soft budget`; it is below the actual 120,000 hard limit and is not rejected.
- Cause: `GUIDE.md:21` omits the documented hard limit and the “soft budget” qualifier. The actual thresholds are `harness/assemble.ts:85` (`triangles: 120_000`, `trianglesSoft: 60_000`) and `:397-402` (warning only above soft, error only above hard).
- Fix: Say “120k triangles hard limit, 60k soft budget” in GUIDE, matching `docs/api.md` and the harness.

### DOCS-4: GUIDE’s documented report-only path workflow fails for required hyphenated scratch files
- Severity: P1 (wrong behaviour on edge input, or a doc/code mismatch that misleads)
- Repro: `scratch/hunt-docs/hunt-docs-triangle-budget.ts` — `npm run snap -- scratch/hunt-docs/hunt-docs-triangle-budget.ts --report-only`.
- Expected: `GUIDE.md:51` says throwaway scripts go in `scratch/<slug>/` and both `preview` and `snap` accept a file path; `GUIDE.md:48` says report-only needs no tag. The brief’s required scratch naming convention is `hunt-docs-*.ts`.
- Actual: The command exits 2 with `Missing or invalid <slug>. Usage: snap.ts <slug> <A|B|C> <tag> [--report-only]`. The wrapper derives slug `hunt-docs-triangle-budget`, then passes it to the harness; `harness/snap.ts:38` rejects the hyphenated slug with `/^[A-Za-z0-9]+$/`. Preview accepts the same path.
- Cause: `scripts/snap.ts:34-36` preserves a path basename as the slug, but `harness/snap.ts:38` permits only alphanumerics, contradicting the wrapper’s documented path support and scratch naming.
- Fix: Permit the same safe slug characters used by file paths (at least `-`, e.g. `/^[A-Za-z0-9_-]+$/`) in the harness, or normalize the path basename before invoking it.

### DOCS-5: The mid-body rooting example contains invalid TypeScript ellipsis
- Severity: P2 (minor, cosmetic, perf)
- Repro: `scratch/hunt-docs/hunt-docs-chain-snippet.ts` — `npm run typecheck -- scratch/hunt-docs/hunt-docs-chain-snippet.ts` reports `TS1109: Expression expected` twice on the `...` tokens.
- Expected: The fenced TypeScript example under `docs/api.md:180-187` should be copyable/typecheckable, per the audit requirement. `catmull` accepts a point array, so omitted points should be represented by valid spread arrays or shown as comments outside the expression.
- Actual: `const body = catmull([tailTip, ..., rootPoint, ..., headEnd]);` cannot parse; bare `...` is not legal inside an array literal.
- Cause: `docs/api.md:181` uses prose ellipses as expression elements.
- Fix: Define intermediate arrays and use `catmull([...tailPoints, rootPoint, ...headPoints])`, or replace the line with a valid abbreviated example.

### DOCS-6: API promises a nonexistent `kit.rng(seed)` helper
- Severity: P1 (wrong behaviour on edge input, or a doc/code mismatch that misleads)
- Repro: `scratch/hunt-docs/hunt-docs-kit-rng.ts` — `npm run typecheck -- scratch/hunt-docs/hunt-docs-kit-rng.ts` fails with `TS2339: Property 'rng' does not exist on type 'typeof .../kits/pixel'`. `grep` finds no `rng` export in `kits/*.ts`.
- Expected: `docs/api.md:79` says deterministic randomness can use “`rng(seed)` here, or `kit.rng(seed)`”; a kit author should be able to use the documented alternative.
- Actual: None of the shipped kits (`pixel`, `toon`, `clockwork`, `glow`) exports `rng`; importing a kit namespace and calling `kit.rng(7)` does not typecheck. The working helper is `rng` from `src/math`.
- Cause: `docs/api.md:79` names an API absent from every kit module.
- Fix: Remove `kit.rng(seed)` unless a kit-level export is intentionally added; document `rng` from `src/math` as the sole SDK helper.

## Covered

- Compared the documented public helper signatures and option/default claims in `docs/api.md` and `docs/conventions.md` with `src/builder.ts`, `src/sweep.ts`, `src/skeleton.ts`, `src/surface.ts`, `src/parts.ts`, `src/distribute.ts`, `src/cards.ts`, `src/decal.ts`, `src/membrane.ts`, `src/outline.ts`, `src/sugar.ts`, `src/region.ts`, `src/math.ts`, `src/path.ts`, `src/paint.ts`, and `src/texture.ts`; the ordinary signatures/options checked there matched apart from the findings above.
- `hunt-docs-closed-caps.ts` typechecks and previews successfully; its ordinary square closed-polyline output exercised the cap/seam contradiction with measured bounds.
- `hunt-docs-triangle-budget.ts` typechecks and previews successfully; 65,024 triangles exercised the soft-vs-hard budget distinction.
- `hunt-docs-absolute-imports.ts` enumerated all eight `/home/cx/noodlespace/agentic-3js-builder/...` imports in `docs/api.md`.
- `awk 'length($0)>1000 { ... }' docs/api.md docs/conventions.md GUIDE.md` printed no lines, so there are currently no documentation lines over 1,000 characters for read-tool truncation.
- Checked the docs’ coordinate/roll, path parameterization, tube radius/cap, card, paint coordinate, texture, region, IK, rig-key, and material/default statements against implementation and did not add a finding where the claims matched.
- Known status item confirmed in source/doc review but not counted as a new finding: `Chain.tip` remains nullable in the TypeScript type even when an extra `names` entry guarantees a tip (the existing friction noted in `docs/STATUS.md`).
