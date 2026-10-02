# Surface bug hunt

### SURFACE-1: `loop()` returns one open colour band instead of the full loop on a colour-split sweep
- Severity: P0 (silent wrong geometry in the documented `surface.loop` + `sweep.bands` combination)
- Repro: `scratch/hunt-surface/hunt-surface-loop-bands.ts` — `npx tsx scratch/hunt-surface/hunt-surface-loop-bands.ts`.
- Expected: A plane x=0 through the capped radius-0.5, length-2 tube should produce the complete closed rectangular intersection around the tube, perimeter about 6 (two length-2 sides plus two cap spans of width 1). The docs promise `surface.loop` over built triangles, and sweep colour pieces share their boundary vertices.
- Actual: The sweep has two meshes for its two bands. For x=0, .01 and .1, `loop()` returns `closed:false`, length `3`, with samples only along one side and half of each cap; the other half is missing. The same capped tube without colour bands returns a closed path of perimeter about 6.
- Cause: `src/surface.ts:272-284` keys crossing nodes by `${mesh}:...`, so physically coincident crossings at a colour-piece boundary can never weld across meshes. `src/surface.ts:351-364` then selects one open chain rather than joining the open chains from both material meshes.
- Fix: Weld loop crossings in world space across target meshes when positions coincide (while retaining per-mesh triangle ownership for normals/weights), and join chains across coincident boundary nodes before selecting a loop.

### SURFACE-2: `drape()` carries only its first hit's bone, so a draped strap detaches after a pose
- Severity: P0 (silent wrong placement on the documented pose-safe surface workflow)
- Repro: `scratch/hunt-surface/hunt-surface-drape-pose.ts` — `npx tsx scratch/hunt-surface/hunt-surface-drape-pose.ts`.
- Expected: A path projected over a multi-bone smooth body, then swept into a strap, should follow the body when a later body joint is posed; the API promises that frames stay valid under `pose()` and presents `surface.drape` as the strap helper.
- Actual: The draped path spans from a hit on bone `a` to an endpoint whose nearest body triangle is on bone `c`, but reports `weights: [['a', 1]]`. The resulting strap has no skin attributes (`meshBones: undefined`, `skinWeights: undefined`) and remains vertex-identical after rotating joint `c` 70°. At its t=.8 point, the posed body nearest point is `[0.535084,1.454773,0.135198]` while the strap remains `[0.620466,1.483328,0.200014]`, a gap of `0.110935 m`.
- Cause: `src/surface.ts:237-240` samples per-hit weights but passes only `hits[0].weights` to `smoothPath`; `Path` therefore gives `sweep()` one uniform owner (`src/sweep.ts:615-642`) and the strap is rigid on the first bone.
- Fix: Preserve per-sample surface weights through a draped path and have `sweep()` interpolate them per ring (or return a surface-attached path/chain representation with equivalent per-sample ownership), rather than collapsing to `hits[0].weights`.

### SURFACE-3: `nearest()` crashes on a built mesh containing only degenerate triangles
- Severity: P2 (edge input accepted as a `Part`, then crashes one query)
- Repro: `scratch/hunt-surface/hunt-surface-edge.ts` — `npx tsx scratch/hunt-surface/hunt-surface-edge.ts`; inspect `degenerate nearest ERROR`.
- Expected: A surface query should either return a defined no-surface result/error when all triangles have zero area; `surface()` itself accepts the `Part` and `ray()` already returns `null` for this case.
- Actual: `s.nearest([0,0,0])` throws `Cannot read properties of undefined (reading 'userData')`, because no non-degenerate triangles survive sync and `nearest()` calls `hit(-1, point)`. `ray()` on the same target returns `null`.
- Cause: `src/surface.ts:178-196` initializes `best=-1` but never checks it before `this.hit(best, point)`; `hit()` at `src/surface.ts:137-145` indexes `meshes[owner[-1]]` and then reads `mesh.userData`.
- Fix: Detect `best < 0` after the nearest search and throw a clear `surface.nearest(): target has no non-degenerate triangles` error (or define a documented null result); add equivalent empty-triangle guards to queries that assume `cumArea`/`box` data.

## Known confirmations (one-line checks)
- `surface(joint)` still throws `surface(): no meshes in targets` for a middle joint of a smooth-skinned chain: the continuous mesh is registered only under its first/heaviest bone (`scratch/hunt-surface/hunt-surface-core.ts`, `npx tsx ...`).
- `Hit` has `.at`, `.n`, `.mesh`, `.bone` but no `.tangent`; accessing `hit.tangent` is `undefined` (the status to-do remains accurate).
- `stick()` seats by each geometry's local Y bounding box: at the same hit, a 0.1 m box's origin was y≈0.5274 while a 0.4 m box's origin was y≈0.6095, so their bottoms were y≈0.48 and y≈0.42 with `embed:0.2` (`hunt-surface-core.ts`).
- `drape()` nearest-projects each sample independently on a tucked/open torus; the resulting path follows different belly/edge portions as the rough path crosses the cavity (`hunt-surface-drape.ts`). This confirms the known tucked-body belly-edge jump risk.

## Covered
- `ray()` on an ordinary sphere returns `null` for a miss and the first intersection for an inward ray; `nearest()` returns the closest triangle hit with a normal and owner bone (`hunt-surface-core.ts`).
- Rays through overlapping spheres choose the nearest front triangle; `nearest()` chooses the nearest mesh; `scatter()` rejects fully buried inner-sphere triangles and returns exposed outer hits (`hunt-surface-overlap.ts`).
- `surface()` over a smooth-skinned sweep refreshes triangle positions and normals after `pose()`; a cached surface query returned different hit coordinates/normals after a 45° joint pose (`hunt-surface-core.ts`).
- `loop()` throws a clear “plane ... misses the surface” error when the cutting plane does not intersect (`hunt-surface-edge.ts`), and selects the nearer of two disjoint cut loops (`hunt-surface-edge.ts`).
- `stick` `flow` orientation and `loop`/`drape` `lift` offsets remained finite in ordinary axis-aligned tests.
