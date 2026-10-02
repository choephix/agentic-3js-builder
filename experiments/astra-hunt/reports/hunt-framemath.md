# Frame/math bug hunt

### FRAMEMATH-1: `Frame.moved()` silently changes orientation for non-cardinal frames
- Severity: P0 (silent wrong output on documented use)
- Repro: `scratch/hunt-framemath/hunt-framemath-moved.ts` — run `npx tsx scratch/hunt-framemath/hunt-framemath-moved.ts`.
- Expected: `docs/api.md:108-115` says `moved(p)` keeps orientation/facing; for every frame, the moved frame's `axis` should equal the source frame's axis. `docs/api.md:117` also guarantees arbitrary `frame(at, dir, up?)` orientations.
- Actual: for `f = frame([0,0,0], [1,1,1])`, source axis is `[0.5773502692, 0.5773502692, 0.5773502692]`, but `f.moved([1,0,0]).axis` is `[0.4082482905, 0.5773502692, 0.7071067812]` (dot 0.9772838842). Cardinal directions happen to hide this because their quarter-turn quaternions square to a symmetry; a weighted `sweep.at(...).moved(...)` also changes its axis from `[0, 0.7071067812, -0.7071067812]` to `[0, 0.7071067812, 0.7071067812]` even before posing (see `hunt-framemath-weighted.ts`).
- Cause: `src/frame.ts:51-54` passes `quat` to `Spot` and then calls `quat.invert()` while deriving the facing argument. The same mutable quaternion is therefore captured as its inverse; this only cancels out for some cardinal orientations.
- Fix: retain the original quaternion for `Spot` and use a cloned inverse only to convert the current model-space facing to local coordinates (e.g. `const facing = this.axis.clone().applyQuaternion(quat.clone().invert())`).

### FRAMEMATH-2: `line()` crashes for coincident endpoints
- Severity: P1 (wrong behaviour on an edge input that the point API does not forbid)
- Repro: `scratch/hunt-framemath/hunt-framemath-linezero.ts` — run `npx tsx scratch/hunt-framemath/hunt-framemath-linezero.ts`.
- Expected: `docs/api.md:33,118` defines `line(a, b)` for two Points and does not exclude equal points; point helpers are expected to accept Point inputs. A zero-length line needs a deterministic fallback orientation (or a documented, explicit validation error).
- Actual: `line([1,2,3], [1,2,3])` throws `Error: aim(): zero-length direction` from `src/math.ts:99`, so a coincident-point line cannot be represented at all.
- Cause: `src/frame.ts:121-125` always calls `aim(b.clone().sub(a))` in `Segment`, and there is no coincident-endpoint branch.
- Fix: choose and document a stable fallback axis for zero length (or add a `line()`-specific validation error if coincident endpoints are intentionally forbidden); do not leak the lower-level `aim()` error for a documented Point conversion.

### FRAMEMATH-3: `offset()` silently treats a zero direction as no movement
- Severity: P1 (silent wrong behaviour on a zero-vector edge input)
- Repro: `scratch/hunt-framemath/hunt-framemath-offsetzero.ts` — run `npx tsx scratch/hunt-framemath/hunt-framemath-offsetzero.ts`.
- Expected: `offset(p, dir, dist)` is documented at `docs/api.md:131` and `src/math.ts:64-67` as moving along the normalized direction. A zero vector has no direction and should be rejected consistently with `aim()`'s zero-length check, rather than silently producing a plausible unchanged point.
- Actual: `offset([1,2,3], [0,0,0], 2)` returns `[1,2,3]` without an error because Three.js `Vector3.normalize()` leaves a zero vector unchanged.
- Cause: `src/math.ts:65-66` calls `.normalize()` and immediately `addScaledVector()` without checking length.
- Fix: validate `toDirection(...).lengthSq()` before normalization and throw a clear `offset(): zero-length direction` error.

## Covered

- `frame()` and `line()` point/direction conversion for ordinary literals and `Vector3`; `toPoint`/`toDirection` copies rather than aliases inputs.
- `local()` model-direction words (`right`, `left`, `up`, `down`, `forward`, `back`) on frames aimed along +X, −X, +Y, −Y, +Z and −Z; word results remain model-space as documented, including mirrored side signs.
- Numeric `local()`/`moved()` frame axes for the six cardinal aim directions; +Z-aimed default-roll frame has local +Z = world +Y (dorsal), and −Z has local +Z = world −Y.
- `aim()` axis alignment and roll for axis `x`, `y`, `z`; explicit `up` parallel and anti-parallel to `dir` falls back deterministically without NaNs, while a true zero direction throws the clear `aim(): zero-length direction` error.
- A smooth-skin weighted `sweep.at()` frame had two equal bone weights and its `.at`/`.axis` tracked a later `pose()`; freshly queried and pre-captured frame positions agreed after the pose.
- `lerp`, `mid`, and ordinary `offset` values; `rng` was deterministic for repeated seeds and 100,000-sample runs had means ~0.499–0.501 with roughly 10,000 values per decile.
