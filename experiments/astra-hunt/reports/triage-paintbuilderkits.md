# Paint / builder / kits triage

### PAINT-1: `spots()` misreads a documented RGB tuple as a colour list and bakes spots black
- Verdict: confirmed
- Severity: P0 (the documented `[r,g,b]` form silently becomes scalar/NaN-like data and produces black texels rather than the requested colour)
- Samples hit: none (searched all `samples/*.ts`; `spots` and `scales` use strings, Paints, or lists of strings, but no RGB tuple as the `spot` or `base` argument). The direct repro still fails: `spots("#ffffff", [1,0,0], ...)` returned 956 scalar and 1,438 non-finite results out of 10,000; the bake had 176,638 black and 0 red texels. `scales([1,0,0], ...)` returned 10,000 non-finite results.
- Fix: change `pick()` in `src/paint.ts` to recognize a numeric three-tuple before treating an array as a colour list, preserving list selection for nested arrays. Keep the `docs/api.md:439` RGB contract; no sample changes are needed.

### KITS-1: `coil(a, b, ...)` does not run from `a` to `b`
- Verdict: confirmed
- Severity: P1 (the documented clockwork helper visibly misses both requested attachments by one radius; it is a wrong geometric result even though no shipped sample currently calls this kit helper)
- Samples hit: none for `kits/clockwork.ts`'s four-argument `coil(a,b,radius,turns)` form. `clockworkAutomaton.ts` and `clockworkStag.ts` contain separate local, longer-argument helpers named `coil`; `paperDragonKite.ts` has an unrelated 2-D SVG coil, so none exercise the kit API. The direct repro measured `at(0)=[-0.1,0,0]` and `at(1)=[-0.1,1,~0]` for `a=[0,0,0]`, `b=[0,1,0]`, radius `0.1`.
- Fix: update `coil()` in `kits/clockwork.ts` to add endpoint lead-in/lead-out segments or taper the helix radius to zero at both ends while retaining the requested turns. Update `kits/clockwork.md` only if the chosen endpoint/turn definition changes; no samples currently need migration.

### KITS-2: zero `metal.size` bakes NaN colours instead of rejecting the invalid scale
- Verdict: confirmed
- Severity: P2 (a zero-size edge input is accepted and contaminates the paint with `[NaN, NaN, NaN]`, although no normal sample uses it)
- Samples hit: none (searched `samples/*.ts`; every `metal(..., { size })` call uses a positive size or the default)
- Fix: validate `size` as finite and positive in `metal()` in `kits/clockwork.ts` before passing it to `noise()`, with a named error. Clarify the positive-size requirement in `kits/clockwork.md`; no sample changes are needed.

### BUILDER-2: Public builder types/classes are not re-exported from `src/builder`
- Verdict: intended (the SDK uses owning modules for these types; `docs/api.md:369` explicitly promises only `OutlinePoint` from `src/builder`, and shipped samples import `Joint`/`Chain`/`Sweep`/`PartOptions`/`Fill` from `skeleton`/`sweep`/`parts`/`context`)
- Severity: P2 (no observed shipped-sample failure; the missing convenience re-exports are not part of the documented builder entry-point contract)
- Samples hit: none (the export repro fails for `Joint`, `Sweep`, `Chain`, `PartOptions`, and `Fill`, while the documented `OutlinePoint` re-export succeeds; samples use the owning-module imports)
- Fix: no source fix required. If a single-module type surface is desired, add explicit re-exports in `src/builder.ts` and document that convention, but do not duplicate declarations or rewrite samples unless that API decision is made.

### BUILDER-1: `detail: Infinity` is accepted and fails later as an invalid array length
- Verdict: confirmed
- Severity: P2 (non-finite detail is an edge input, but it is accepted at construction and fails later with an unrelated `RangeError` during tessellation)
- Samples hit: none (no sample passes `Infinity`, `Number.MAX_VALUE`, `1e300`, or another non-finite positive detail)
- Fix: require `Number.isFinite(detail) && detail > 0` in `Ctx` construction and `detailOf()` in `src/context.ts`, before any segment/array arithmetic; the shared `detailOf()` path covers per-shape detail options, with no docs or sample changes needed.

### BUILDER-3: Malformed literals through builder wrappers lose the called helper/argument in errors
- Verdict: confirmed
- Severity: P2 (the malformed-input diagnostics violate the named-error contract, but only invalid literals are affected)
- Samples hit: none (no shipped sample intentionally passes malformed two-number points or frames)
- Fix: thread a public call/argument label through `toPoint()`/`toFrame()` and path conversion, or validate at each `Builder` wrapper before delegation, so `part`, `rod`, `sweep`, `chain`, `sprout`, `ring`, and `stick` retain their helper names. Keep the `docs/api.md:104`/`docs/STATUS.md` named-error contract; no sample changes are needed.
