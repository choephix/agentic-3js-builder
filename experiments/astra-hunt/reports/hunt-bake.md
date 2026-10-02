# Bake bug hunt

### BAKE-1: Custom skin weights are copied without normalisation
- Severity: P0 (silent wrong output on accepted skinned meshes)
- Repro: `scratch/hunt-bake/hunt-bake-weights.ts` — `npx tsx scratch/hunt-bake/hunt-bake-weights.ts`
- Expected: `docs/api.md:77` requires per-vertex `skinWeight` attributes with at most four bones, and `src/context.ts:31-35` defines weights as “summing to 1”; the bind-pose vertex must remain unchanged.
- Actual: The repro supplies two influences `[1.25, 0.75]` (sum 2). `assemble()` reports no weight error and emits every vertex with sum `2`; `createSkinnedMesh().getVertexPosition(0)` changes `[0.1,0.1,0.1]` to `[0.2,0.2,0.2]` even in bind pose. Invalid zero/NaN sums are likewise not rejected.
- Cause: `harness/assemble.ts:435-450` copies four source slots verbatim into the merged geometry and neither checks the source attributes nor divides by their positive sum.
- Fix: Validate finite, non-negative source indices/weights and keep the four largest positive influences, then normalise their sum to 1 (or emit an assembly error and refuse export when the sum is zero).

### BAKE-2: Atlas overflow loops forever when too many tiny unique textures are supplied
- Severity: P2 (unbounded hang on an atlas edge case; the API documents no texture-count limit)
- Repro: `scratch/hunt-bake/hunt-bake-atlas-overflow.ts` — `timeout 8s npx tsx scratch/hunt-bake/hunt-bake-atlas-overflow.ts` exits `124` without returning or throwing. It creates 60,000 unique 1×1 `DataTexture`s; the script prints no completion line.
- Expected: `docs/conventions.md:185-189` promises one atlas with bounded packing/overflow behaviour; an input that cannot fit should fail promptly with a useful error (or use a documented hard limit).
- Actual: `buildAtlas([], sources)` does not terminate after 8 seconds. Every source shrinks to the minimum 1×1 tile, while 60,000 padded 18×18 tiles plus the colour block cannot fit in a 4096² atlas; the retry loop keeps trying the unchanged 1×1 set forever.
- Cause: `harness/atlas.ts:206-215` increments `halvings` indefinitely and retries whenever `placed` is null, even after `shrink()` has reached 1×1 and no further progress is possible.
- Fix: detect a repeated/minimum tile set (or cap halvings/texture count) and throw a packing-overflow error naming the required count/size instead of retrying forever.

### BAKE-3: Export baking scales model-space geometry around the origin
- Severity: P0 (silent misplaced output on documented merged/model-space parts)
- Repro: `scratch/hunt-bake/hunt-bake-model-space-sdk.ts` (documented `b.part` case) or `scratch/hunt-bake/hunt-bake-model-space.ts` (plain Object3D case) — run with `npx tsx <file>`.
- Expected: `docs/conventions.md:31-38` explicitly says already-model-space/merged vertices with `at: [0,0,0]` stay exactly where put; `docs/conventions.md:42-50` recommends this for many pieces. A plain three.js Object3D should likewise export its world-space vertices unchanged.
- Actual: The SDK repro's second source box occupies min/max `[9.9,0.9,-0.1]` / `[10.1,1.1,0.1]`, but assembled vertices for that part are min/max `[9.9297,0.9027,-0.1003]` / `[10.1303,1.1033,0.1003]`; its centre moves from x=10.0,y=1.0 to x=10.03,y=1.003. No issue is reported. The plain Object3D repro shows the same effect.
- Cause: `harness/assemble.ts:339-340` passes a per-part `grow` of up to `1.003` into `bakePart`; `bakePart` at `:178-179` scales all vertices around their local origin before applying `matrixWorld`. This intended z-fighting nudge also changes legitimate model-space coordinates.
- Fix: do not alter exported vertex positions; solve z-fighting with material/render ordering, or apply only an explicitly documented surface offset and keep model-space merges exact.


## Covered
- Plain-object preview: `npm run preview -- samples/witchCottageDiorama.ts` completed with 164 parts, 5,710 triangles, and bounds min y=0.000 / max y=2.130.

- Normal SDK smooth-chain skinning: `scratch/hunt-bake/hunt-bake-bind.ts` (`npx tsx ...`) produced 1–4-joint sweep assembly with 160 triangles, all weight sums exactly 1, and maximum bind-pose vertex error `2.48e-16`.
- Plain no-joint object assembly: `npm run snap -- samples/witchCottageDiorama.ts --report-only` completed with 0 errors/0 warnings, 164 parts, 5,710 triangles, and 256 px atlas; this exercises the static/plain-object path.
- Emissive grouping: `scratch/hunt-bake/hunt-bake-glow.ts` assembled the emissive sample with 10 distinct glow strengths, 11 materials, and ordered geometry groups without issues.
- Existing static GLBs: parsed `witchCottageDiorama.glb` and `glow-mesh.glb`; accessor triangle counts matched their reports exactly (5,710 and 38), and static GLB bounds matched report bounds to float/rounding precision.
