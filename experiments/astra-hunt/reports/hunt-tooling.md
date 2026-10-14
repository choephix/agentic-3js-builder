# Tooling bug hunt

### TOOLING-1: `snap` cannot run the documented throwaway paths with required hyphenated names
- Severity: P0 (crash/usage failure on documented use)
- Repro: `scratch/hunt-tooling/hunt-tooling-floor.ts` — run `npm run snap -- scratch/hunt-tooling/hunt-tooling-floor.ts --report-only`.
- Expected: GUIDE.md Build loop (lines 35–51) says `snap` accepts a path under `scratch/`; the hunter brief additionally requires throwaway filenames prefixed `hunt-tooling-`.
- Actual: exits 2 before importing the sample: `Missing or invalid <slug>. Usage: snap.ts <slug> <A|B|C> <tag> [--report-only]`.
- Cause: `scripts/snap.ts:34-36` derives `slug = basename(target, ".ts")` and passes it to `harness/snap.ts`; `harness/snap.ts:38` only accepts `/^[A-Za-z0-9]+$/`, rejecting the hyphens that the documented scratch naming convention requires.
- Fix: allow the same lower-case/hyphen slug form in the harness (or sanitize only the output slug while retaining the source path), and keep the accepted form consistent with `preview` and GUIDE.md.

### TOOLING-2: Preview distance and bounds are inflated/deflated by later-part z-fight scaling
- Severity: P1 (wrong measurement on ordinary documented use)
- Repro: `scratch/hunt-tooling/gaptest.ts` — run `npm run preview -- scratch/hunt-tooling/gaptest.ts --gap left right --box right`. The sample has two 1 m boxes, with `right` translated to x=1.1 m, so the true gap is 100 mm and right's true box is 1000 × 1000 × 1000 mm.
- Expected: GUIDE.md line 45 promises surface distance and combined world bounds of the selected parts; expected gap 100.0 mm and right box [0.6,0,-0.5]..[1.6,1,0.5], size 1000 mm.
- Actual: preview prints `Gap ...: 98.5 mm`, closest x points 0.500 and 0.599; `Box of right ... min [0.599,-0.002,-0.502] max [1.602,1.002,0.502]; size 1003.0 × 1003.0 × 1003.0 mm`. The first part remains exact, while part #1 is scaled by 1.003.
- Cause: `harness/assemble.ts:86,339-340` deliberately scales each later mesh by `1 + index * 0.003` for z-fighting before `preview-page.ts` builds its measurement index and per-part bounds; measurements therefore describe the render workaround rather than model geometry.
- Fix: preserve unscaled baked positions for measurement/bounds (or carry a separate measurement geometry/index) and apply z-fight inflation only to the rendered/exported copy.

### TOOLING-3: The 5 mm floor boundary is silently accepted although the documented check says it flags from 5 mm
- Severity: P1 (boundary mismatch in a documented check)
- Repro: `scratch/hunt-tooling/floorboundary.ts` — run `npm run snap -- scratch/hunt-tooling/floorboundary.ts --report-only`. It is a 1 m box with its minimum y exactly 0.005 m.
- Expected: docs/STATUS.md To-do line 237 says the snap report warns from 5 mm off the floor; a boundary value of exactly 5 mm should be reported.
- Actual: report says `Issues: 0 error(s), 0 warning(s)` for bounds min `[... ,0.005,...]`; a value just above 5 mm enters the warning branch.
- Cause: `harness/assemble.ts:489-495` uses strict `box.min.y > 0.005`, excluding equality (the emitted rounded warning would also misleadingly show 5 mm for values just over threshold).
- Fix: use `>= 0.005` for the documented threshold and retain enough precision in the message to distinguish the boundary if needed.

### TOOLING-4: `snap` silently ignores a second positional tag
- Severity: P1 (argument typo silently selects the wrong snapshot tag)
- Repro: `scratch/hunt-tooling/floorboundary.ts` — run `npm run snap -- scratch/hunt-tooling/floorboundary.ts v01 v02 --report-only`.
- Expected: the usage accepts one optional tag; an extra positional argument should be rejected like `preview` rejects unexpected arguments, rather than pretending the command selected both tags.
- Actual: exits 0, runs report-only for `v01`, and prints the normal report; `v02` is silently discarded.
- Cause: `scripts/snap.ts:29` destructures only `[target, given]` from all non-flag arguments and never checks the remaining values.
- Fix: validate that the filtered positional list has exactly one item (report-only) or one/two items (render), then issue the usage error on extras.

### TOOLING-5: Preview output folders collide for same-named files in different directories
- Severity: P1 (a documented path input overwrites another model's measurements/textures)
- Repro: `scratch/hunt-tooling/a/collision.ts` and `scratch/hunt-tooling/b/collision.ts` — run each with `npm run preview -- scratch/hunt-tooling/<a-or-b>/collision.ts`. Both commands print `Output: /home/cx/tmp/public/nilo/agentic-3js-builder/preview/collision`; after the second run `preview/collision/parts.json` contains the second sample's 2 m bounds, replacing the first sample's 1 m bounds. The same basename is also used by `scripts/snap.ts` (`slug = basename(target, ".ts")`) for `snaps/collision/<lane>`.
- Expected: GUIDE.md lines 44 and 51 promise scratch paths can be previewed/snapshotted; two distinct path inputs should not overwrite one another without an explicit collision error.
- Actual: basename alone is the output key; the second run silently replaces `parts.json`, textures and (for snap) tag files from the first.
- Cause: `scripts/preview.ts:65,180` and `scripts/snap.ts:34-36,44` derive output identity only from `basename(target, ".ts")`.
- Fix: derive a stable collision-resistant slug from the resolved path (or refuse an existing different source recorded in the output folder) while preserving readable sample slugs.

### TOOLING-6: `sheet --cols` accepts non-numeric values and still writes a misleading sheet
- Severity: P2 (invalid documented numeric argument is silently coerced)
- Repro: run `npm run sheet -- oldFisherman --cols nope`.
- Expected: `--cols N` in `scripts/sheet.ts:3` should reject a non-positive/non-numeric column count with the usage text.
- Actual: exits 0, prints `1 shots → .../sheets/oldFisherman-three-quarter.jpg`, and ImageMagick creates a 568×600 JPEG despite the invalid `nope` value (`Number("nope")` is `NaN`, and `cols > 0` falls back to the default).
- Cause: `scripts/sheet.ts:33-34,64` never validates `Number(flag("cols"))` for finiteness/integer/positive value.
- Fix: parse once and fail on non-finite, non-integer, or `<1` values before invoking `montage`.

## Covered

- `npm run typecheck -- scratch/hunt-tooling/stiffcheck.ts` (an external file importing `../../src/builder`) succeeded and printed `No type errors ...`; the path-based typecheck mode does not require the file to live under `samples/`.
- `npm run snap -- scratch/hunt-tooling/floorboundary.ts --report-only` succeeded without a tag through the public wrapper, matching GUIDE.md line 48. The lower-level `harness/snap.ts` intentionally requires `<slug> <A|B|C> <tag>` and its usage text is accurate for that internal entrypoint.
- Preview selector parsing and self-gap behaved correctly (`#0` self-gap reports `overlapping`). For `gaptest.ts`, the first part's bounds and hand-computed centre were exact; only later parts exposed TOOLING-2's z-fight inflation.
- `loosecheck.ts` correctly reported the detached 100 mm cube as a 50 mm gap from the main body and did not turn it into an issue; the report's loose list is informational as GUIDE.md says.
- `insideout.ts` correctly warned for an inverted closed box, while an ordinary box did not warn. `fine.ts`'s moderately tessellated 320-triangle 1 m box did not warn; `fine47.ts`'s 47-triangle detail was below the report's explicit 48-triangle cutoff; `finefeature.ts` demonstrated the documented whole-model diagonal criterion (80-triangle eye listed under 1/150 diagonal).
- The report's floor allowance correctly permits a model at y=0 and deeper sinks within 2% of model height; the exact 5 mm boundary omission is TOOLING-3.
