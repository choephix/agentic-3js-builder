# IK bug hunt

### IK-1: Reachable targets at or below the 1e-9 distance threshold are mirrored away from the target
- Severity: P1 (wrong behaviour on edge input)
- Repro: `scratch/hunt-ik/hunt-ik-tiny.ts` — run `npx tsx scratch/hunt-ik/hunt-ik-tiny.ts`.
- Expected: `limb` ends on a reachable target (docs/api.md:517 and docs/conventions.md:174); for root `[0,0,0]`, target `[0,d,0]`, and lengths `[1,1]`, every positive `d < 2` is reachable and the endpoint should equal the target.
- Actual: `d=2e-9` ends at `[0,2.000000287945422e-9,0]` (error `2.88e-16`), but `d=1e-9` ends at `[0,-1.0000002052050509e-9,0]` (error `2.000000205205051e-9`); `d=5e-10` ends at `[0,-5.000001638348654e-10,0]` (error `1.000000163834865e-9`). The result flips to the fallback `-Y` direction exactly at the threshold. Segment lengths remain 1 and 1.
- Cause: `src/ik.ts:99-100` uses `new Vector3(0, -1, 0)` whenever `d <= 1e-9`, even when `d` is nonzero. The fallback direction should only apply to a truly coincident target.
- Fix: retain the computed normalized target direction for every nonzero `d` (use `d > 0`, reserving the fallback only for `d === 0`).

### IK-2: Empty, negative, and non-finite segment lengths silently produce invalid limbs
- Severity: P1 (silent wrong output / NaNs)
- Repro: `scratch/hunt-ik/hunt-ik-scenarios.ts` and `scratch/hunt-ik/hunt-ik-edge.ts` — run `npx tsx scratch/hunt-ik/hunt-ik-scenarios.ts` and `npx tsx scratch/hunt-ik/hunt-ik-edge.ts`.
- Expected: docs/api.md:517 promises segments with exactly the supplied `lengths`; an empty segment list or non-finite length cannot define such a chain and should be rejected. Negative lengths are not physical segment lengths and should not silently reverse a segment.
- Actual: `lengths=[]` returns two points, with the second `[NaN,NaN,NaN]`; `[NaN,1]` and `[Infinity,1]` likewise return NaN vectors. `[-1]` with target `[0,1,0]` returns `[0,0,0] → [0,1,0]`, i.e. a geometric segment of length `1` instead of the supplied `-1`. A one-segment call with `{ sole: [0,0,1] }` recurses through an empty upper chain and returns NaN points as well.
- Cause: `src/ik.ts:76-80` never validates the length array, and `src/ik.ts:118-120` multiplies a direction by each raw length (including `undefined` for the empty-array case).
- Fix: require at least one finite, strictly positive segment length before solving; throw a named `limb()` error for invalid entries.

### IK-3: Finite very-large lengths overflow the solver and collapse to zero-length geometry
- Severity: P1 (wrong output on a documented numeric edge)
- Repro: `scratch/hunt-ik/hunt-ik-huge.ts` — run `npx tsx scratch/hunt-ik/hunt-ik-huge.ts`.
- Expected: finite `lengths` and finite target points should produce finite points with each segment at its requested length, subject to the same reach rules. `lengths=[1e308,1e308]`, target `[0,1e308,0]` is within reach.
- Actual: that case returns `[[0,0,0],[0,0,0],[0,0,0]]`; both measured segment lengths are `0`, despite requested lengths `1e308`. `[Number.MAX_VALUE/2, Number.MAX_VALUE/2]` similarly collapses to zero. A smaller `[1e150,1e150]` case works, showing the failure begins when intermediate `hypot`/sum operations overflow.
- Cause: `src/ik.ts:30-32` evaluates reach with raw `Math.hypot(...end(...))` and sums raw lengths; `src/ik.ts:118-120` then performs ordinary vector scaling. Intermediate values overflow to `Infinity`, causing the fold/rotation result to degenerate.
- Fix: either scale the solve into a safe numeric range and rescale the resulting points, or explicitly reject magnitudes that cannot be represented safely instead of returning a collapsed chain.

### IK-4: `sole` accepts one extra bend hint and silently discards it
- Severity: P2 (documented count mismatch that can hide authoring errors)
- Repro: `scratch/hunt-ik/hunt-ik-scenarios.ts` — run `npx tsx scratch/hunt-ik/hunt-ik-scenarios.ts`; compare `"sole-example"` (one hint) and `"sole-expected-doc"` (two hints) for three lengths, then `"too-many-sole"` (two hints for three lengths).
- Expected: docs/api.md:523 says `sole` needs one direction fewer because `sole` sets the joint above the last segment. For `n=3`, that is one hint; a caller supplying two has supplied a count inconsistent with the documented contract and should get a diagnostic (or the docs should explicitly state extras are ignored).
- Actual: both one and two hints are accepted; with two, the extra hint is silently ignored. `"sole-example"` and `"sole-expected-doc"` both return `[0,0,0] → [0,0,1] → [0,0,0] → [0,0,1]`; `"too-many-sole"` also succeeds with a discarded hint.
- Cause: `src/ik.ts:81-85` checks only `hints.length < needed`, and `src/ik.ts:89-95` recursively passes `hints.slice(0, n - 2)`, dropping extras.
- Fix: enforce `hints.length === needed` (and update the API sample at docs/api.md:544-552 if it intentionally wants the extra hint), or document that surplus hints are ignored.

## Covered

- N-segment solving: 2-, 3-, and 4-segment reachable cases preserve the requested segment lengths and end error is 0 (or below `1e-15` from floating-point rounding); 3+/4+ segment folds also take the documented final-segment-parallel path when its hint permits.
- Out-of-reach targets beyond summed lengths (2, 3, and 4 segments) deterministically straighten toward the target and stop short by the excess reach, matching docs/conventions.md:174 and docs/api.md:524.
- Exactly full reach ends exactly at the target for 2, 3, and 4 segments.
- Equal-length limbs targeting the root close exactly; unequal/too-long limbs that cannot geometrically close return a finite minimum-gap fold (for example `[2,1]` leaves a gap of 1), rather than NaN. This is the solver's documented “when it can reach” boundary (docs/conventions.md:174), but the public docs do not spell out the too-close case.
- A target coincident with the root closes for `[1,1]`; coincident targets with opposite parallel bend hints are deterministic fallback-plane cases.
- Bend hints parallel to root→target use the deterministic fallback plane and do not throw; opposite parallel hints produce the same fallback result.
- Mirrored left/right roots and targets produce mirrored joint coordinates when bend hints are mirrored too.
- The result is a fresh `Vector3[]` (`constructor.name === "Vector3"` for every point); repeated identical calls produced bit-identical points over 100 repetitions.
- `sole` fixes the final segment direction and the documented reduced hint count works on a valid 2-segment case; too-few hints throw the expected `limb()` error.

