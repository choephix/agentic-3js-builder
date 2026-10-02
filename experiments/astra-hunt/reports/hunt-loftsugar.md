# Loftsugar bug hunt

### LOFTSUGAR-1: `loft` crashes on a one-station body
- Severity: P1 (wrong behaviour on an undocumented edge input)
- Repro: `scratch/hunt-loftsugar/hunt-loftsugar-loft-edges.ts` — run `npx tsx scratch/hunt-loftsugar/hunt-loftsugar-loft-edges.ts`; the `one` case throws `TypeError: Cannot read properties of undefined (reading 'x')`.
- Expected: `b.loft([{ at, w, h }, ...])` is documented as a station-based helper (`docs/api.md:275`) and does not state a two-station minimum; a one-station input should either produce a valid zero-length/point-like result or reject with a named loft validation error, not leak a Three.js `TypeError`.
- Actual: `b.loft([{ at: [0, 0, 0], w: 2, h: 1 }], { color: "#fff" })` throws from `CatmullRomCurve3.getPoint`; the stack is `src/path.ts:302` → `src/path.ts:347` → `src/sugar.ts:78`.
- Cause: `src/sugar.ts:78` always calls `catmull`; `src/path.ts:342-349` only special-cases exactly two points, then samples a one-point `CatmullRomCurve3`, whose second control point is undefined.
- Fix: Validate station count in `loft` and throw `loft(): needs at least 2 stations`, or explicitly implement a one-station degenerate contract.

### LOFTSUGAR-2: Coincident loft stations fail instead of handling a repeated station
- Severity: P1 (wrong behaviour on a plausible station-list edge case)
- Repro: `scratch/hunt-loftsugar/hunt-loftsugar-loft-edges.ts` — run `npx tsx scratch/hunt-loftsugar/hunt-loftsugar-loft-edges.ts`; the `coincident` case throws `Error: polyline() needs at least 2 distinct points (3 when closed)`.
- Expected: The loft contract says it follows station centres and interpolates their full widths/heights (`docs/api.md:275`), without forbidding repeated centres. A repeated centre should be collapsed/validated by `loft` with a clear error, rather than exposing `polyline()`'s unrelated error and dropping the station semantics.
- Actual: Two stations at `[0, 0, 0]` with widths/heights `(2, 1)` and `(1, 0.5)` throw immediately; stack is `src/path.ts:317` → `src/path.ts:342` → `src/sugar.ts:78`.
- Cause: `loft` forwards all station positions to `catmull`; its two-point fast path calls `polyline`, which removes adjacent duplicates and then rejects the resulting one-point path.
- Fix: Detect duplicate consecutive station centres in `loft`, either reject with a named `loft()` message (including the station index) or merge the repeated station dimensions according to an explicit rule.

### LOFTSUGAR-3: A loft that doubles back produces an inside-out ring at the U-turn
- Severity: P0 (silent wrong output / inside-out triangles)
- Repro: `scratch/hunt-loftsugar/hunt-loftsugar-doubleback-winding.ts` — run `npx tsx scratch/hunt-loftsugar/hunt-loftsugar-doubleback-winding.ts`; compare the `straight` and `doubleback` cases.
- Expected: A sweep/loft remains consistently outward-facing around its tube; the axis-aligned test makes the expected radial outward direction unambiguous. A Catmull path through `[0,0,0] → [0,0,2] → [0,0,0]` should not reverse triangle winding at the middle station.
- Actual: The straight three-station loft has `64` triangles and `wrong: 0`; the doubled-back loft has `96` triangles and `wrong: 8`. In `hunt-loftsugar-doubleback-detail.ts`, all eight wrong triangles are around the turn (`z ≈ 1.9167`), with geometric normal dot global radial direction negative (for example `dot: -0.0274`), so this is not merely a zero-area triangle.
- Cause: `src/sugar.ts:78` feeds the reversing station path into `sweep`; `src/path.ts:215-220` parallel-transports frames using `Quaternion.setFromUnitVectors` across the near-180° tangent reversal, and the resulting section ordering is then connected by `src/sweep.ts:787-803` without detecting the reversal.
- Fix: Handle 180°/near-180° tangent reversals with a deterministic transported frame (or split/fillet the U-turn and preserve section winding) before connecting rings.

## Covered

- Two-station lofts produced finite geometry with expected dimensions and round default caps; a two-station width/height pair behaved as an elliptical section (`scratch/hunt-loftsugar/hunt-loftsugar-loft-edges.ts`, `ellipse` case).
- Ordinary three-station lofts interpolated dimensions smoothly and stayed finite (`scratch/hunt-loftsugar/hunt-loftsugar-profile.ts`).
- Doubleback geometry was finite, and the issue is specifically winding at the turn rather than NaNs (`scratch/hunt-loftsugar/hunt-loftsugar-loft-edges.ts`, `scratch/hunt-loftsugar/hunt-loftsugar-doubleback-winding.ts`).
- `rod` has flat ends and `capsule` has round ends; capsule caps extend by the endpoint radius (`scratch/hunt-loftsugar/hunt-loftsugar-sugar-contract.ts`).
- `frustumBox` uses full width/height as documented: `[2,1]` along +Z yielded x extent ±1 and y extent ±0.5 (`scratch/hunt-loftsugar/hunt-loftsugar-sugar-contract.ts`).
- `spike(base, direction, len, r)` and `spike(base, tip, null, r)` both ended at the requested point and produced finite cone geometry (`scratch/hunt-loftsugar/hunt-loftsugar-sugar-contract.ts`, `scratch/hunt-loftsugar/hunt-loftsugar-degenerate.ts`).
- Rods, capsules and lofts built from bone points followed a posed child bone, while literal model-space endpoints stayed in model space (`scratch/hunt-loftsugar/hunt-loftsugar-bones.ts`, `scratch/hunt-loftsugar/hunt-loftsugar-modelspace.ts`).
- A zero-width station did not emit NaNs or zero-area triangles in the tested three-station case; one zero endpoint tapered cleanly (`scratch/hunt-loftsugar/hunt-loftsugar-zero-middle.ts`, `scratch/hunt-loftsugar/hunt-loftsugar-zero-area.ts`).
