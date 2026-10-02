# Path bug hunt

### PATH-1: Slicing a path to one parameter produces a NaN path
- Severity: P2 (degenerate-input robustness)
- Repro: `scratch/hunt-path/hunt-path-probe.ts` — run `npx tsx scratch/hunt-path/hunt-path-probe.ts`; inspect `slice-zero`.
- Expected: `Path.slice(t0, t1)` is documented as a sub-path (`docs/api.md:146`), so an equal-parameter slice should either return a valid degenerate result with a clear contract error or reject explicitly; it must not expose NaNs through normal queries.
- Actual: `base.slice(.5, .5)` returns `length: 0`, `knots: [NaN, NaN]`, `at(.5): [NaN, NaN, NaN]`, `tangentAt(.5): [0, 0, 0]`, and `closestT(...) === 0`.
- Cause: `src/path.ts:150-184` constructs a `new Path([start, end], ...)` even when `start === end`; `Path` only checks sample count at line 44 and computes `knots` by dividing by `length` at lines 51-53. The zero-length path is never rejected.
- Fix: Detect `b - a <= EPS` in `slice` (or enforce positive total length in `Path`) and throw a named error before exposing a zero-length path; alternatively define a non-NaN degenerate-path query contract.

### PATH-2: Valid very-short curves are rejected by absolute duplicate tolerances
- Severity: P2 (very short edge input)
- Repro: `scratch/hunt-path/hunt-path-short.ts` — run `npx tsx scratch/hunt-path/hunt-path-short.ts`.
- Expected: The path docs define paths by points and do not impose a minimum model-space size (`docs/api.md:133-149`); a two-point path of length `1e-9` m and curves at that scale should remain usable, especially since the API accepts arbitrary meter coordinates.
- Actual: `polyline([[0,0,0],[1e-9,0,0]])` throws `polyline() needs at least 2 distinct points`; `bezier`/`catmull`/90-degree `arc` of scale `1e-8` throw `Path needs at least 2 distinct points`. A `1e-8` polyline works, so this is an absolute threshold rather than a geometric degeneracy.
- Cause: `src/path.ts:20,309-317` removes polyline points at an absolute `EPS = 1e-9`; `smoothPath` at lines 255-256 removes samples at the larger absolute `1e-7`, which collapses all sampled points of short bezier/catmull/arc curves before `Path` is built.
- Fix: Use a scale-relative tolerance (or only reject exact duplicate samples), reserving an explicit zero-length check for genuinely degenerate input.

### PATH-3: Two-point closed polylines are rejected despite the documented closure operation
- Severity: P1 (docs/code mismatch on an allowed shape)
- Repro: `scratch/hunt-path/hunt-path-probe.ts` — run `npx tsx scratch/hunt-path/hunt-path-probe.ts`; inspect `polyline-closed-2`.
- Expected: `polyline(points, { closed: true })` is documented to “join the last point back to the first” (`docs/api.md:139,151`), with no minimum of three distinct points. Two distinct points therefore describe a valid closed out-and-back segment (the seam can be a corner like any closed polyline).
- Actual: `polyline([[0,0,0],[1,0,0]], { closed: true })` throws `polyline() needs at least 2 distinct points (3 when closed)`, while the equivalent three-point closed polyline succeeds.
- Cause: `src/path.ts:315-317` appends the first point for closure, then requires `pts.length >= 4`, which means at least three distinct points even though the documented closure rule only requires two.
- Fix: Permit two distinct points for `closed`; retain the duplicated endpoint and construct its two opposite straight segments, or document and validate a three-distinct-point minimum explicitly.

### PATH-4: Curve arc-length queries are only chord-polyline approximations
- Severity: P1 (documented parametrisation and length are measurably wrong)
- Repro: `scratch/hunt-path/hunt-path-accuracy.ts` and `scratch/hunt-path/hunt-path-sharp.ts` — run `npx tsx` on either script.
- Expected: `Path` is explicitly “arc-length parametrised: t in [0,1] is the fraction of its length” (`docs/api.md:135`), and `length` should be the curve length.
- Actual: On quadratic bezier `[(0,0,0),(0,100,0),(1,0,0)]`, comparing to a 2,000,000-step reference gives `maxErr = 0.00217485 m`. On a 360-degree unit `arc`, `length = 6.28190940645` versus exact `2*pi = 6.28318530718` (relative error `-0.0002031`). A high-curvature cubic with controls `(0,0) -> (100,1000) -> (-100,-1000) -> (0,0)` shows `0.0468951 m` position error and `relativeLengthError = -0.00016164` against a 2,000,000-step reference.
- Cause: `src/path.ts:298-305` samples smooth curves at a fixed count, then `src/path.ts:255-290` stores only the sampled chord polyline; `Path.at` (lines 67-72) interpolates those chords and `Path` length (lines 45-47) sums chord distances. Even `arc` at lines 357-366 reports polygonal chord length instead of exact radius-times-angle.
- Fix: Build an adaptive arc-length lookup with an error bound (and evaluate the underlying curve between table entries), or use exact arc length/evaluation for `arc`; make the documented accuracy explicit if approximation is intentional.

### PATH-5: Fractional arc/spiral knots are evenly redistributed instead of landing on documented angle marks
- Severity: P1 (doc/code mismatch that misplaces knot-driven stations)
- Repro: `scratch/hunt-path/hunt-path-knots.ts` — run `npx tsx scratch/hunt-path/hunt-path-knots.ts`.
- Expected: `docs/api.md:142-144` documents one arc knot span per 45 degrees and spiral knots every 90 degrees. For a 100-degree arc, knot angles should be 0, 45, 90, 100 degrees; for a 1.15-turn spiral they should occur at 0, .25, .5, .75, 1.0 turns plus the 1.15-turn endpoint.
- Actual: `arc(..., 100)` reports `knots [0, 0.3333333, 0.6666667, 1]`, i.e. angles 0, 33.333, 66.667, 100. `spiral(..., { turns: 1.15 })` reports knots `[0,.2,.4,.6,.8,1]`, i.e. quarter-turn marks `.23,.46,.69,.92` rather than 0.25, .5, .75, 1.0 turns. Builders key loft widths, chain joints, and other station data to these knot values, so the documented angular positions are silently shifted.
- Cause: `src/path.ts:365-366` passes `spans = ceil(abs(angleDeg)/45)` to `smoothPath({ spans })`, which divides total chord length into equal spans rather than supplying samples at each 45-degree angle. `src/path.ts:408-409` does the same for `ceil(abs(turns)*4)`, redistributing the final fractional turn.
- Fix: Build explicit sample/knot indices at each 45-degree or quarter-turn mark (plus the endpoint), and pass those indices to `smoothPath`; preserve arc-length `knots` by converting each angular mark's sampled cumulative distance.

## Covered

- Open two-point polyline: length `1`, knots `[0,1]`, `at(.5) = [0.5,0,0]`, unit tangent `[1,0,0]`.
- Adjacent duplicate points in `polyline` are removed cleanly; the resulting path has finite queries.
- Collinear default centripetal Catmull-Rom, closed square Catmull/polyline, degenerate straight Bezier, positive/negative arcs, and a mirrored-pitch spiral all produced finite expected geometry in `scratch/hunt-path/hunt-path-real.ts`.
- Negative-direction and fractional-turn paths produced finite positions/tangents.
- `closestT` on a regular quadratic Bezier returned finite values for several query points.
- Station/tuple typing: `scratch/hunt-path/hunt-path-types.ts` passes `npm run typecheck -- scratch/hunt-path/hunt-path-types.ts` with no errors; the previously noted tuple-cast friction was not reproduced in this checkout.
