# Sweepskin bug hunt

### SWEEPSKIN-1: Splitting a sweep at a sharp path corner disables smooth corner rounding
- Severity: P1 (documented range split silently changes the shape)
- Repro: `scratch/hunt-sweepskin/hunt-sweepskin-ranges.ts` — `npx tsx scratch/hunt-sweepskin/hunt-sweepskin-ranges.ts`
- Expected: `docs/api.md:217-225` says smooth sweeps round path corners, and `docs/api.md:219` says sweeping `[0,a]` and `[a,1]` with the same options gives two halves of one tube.
- Actual: For `[[0,0,0],[0,1,0],[1,1,0]]`, radius `.2`, split at `a=.5`, the full sweep's vertices near the corner have x range `[-0.1434, 0.1996]`, y range `[0.7978,1.1772]`; the split halves instead have cap vertices with x range `[-0.2,0.2]`, first y `[1,1.2]`, second y `[0.8,1.2]`. The full sweep has a rounded fillet while the split version has two perpendicular round caps and a visibly different corner silhouette.
- Cause: `src/sweep.ts:644-662` only creates fillets from `path.corners(from,to)`, which excludes a corner exactly at either range boundary; `src/sweep.ts:682-684` then emits ordinary round end caps for each half.
- Fix: Preserve the full-source corner fillet when a `from`/`to` boundary lands on a corner (or share a boundary fillet/corner ring between adjacent range sweeps instead of treating it as two capped ends).

### SWEEPSKIN-2: `sweep.at()` drifts from the actual curved-tube mesh between rings
- Severity: P1 (documented surface handle can place attached geometry off the skin)
- Repro: `scratch/hunt-sweepskin/hunt-sweepskin-at-accuracy.ts` — `npx tsx scratch/hunt-sweepskin/hunt-sweepskin-at-accuracy.ts`
- Expected: `docs/api.md:240` promises `sweep.at()` is a frame on the built surface.
- Actual: On a normal millimetre-scale `.04 m` radius Catmull tube, closest-point distances from `sweep.at(t, deg)` to the generated triangles averaged `0.00819 m` and peaked at `0.01808 m` (samples included 9.9–18.1 mm misses between rings). This is larger than the documented surface-handle expectation and reproduces the STATUS friction (`docs/STATUS.md:262`).
- Cause: `src/sweep.ts:465-480` evaluates a bind-space section at the requested continuous `t`, while mesh rings are adaptively selected later at `src/sweep.ts:922-975`; interpolation across the selected rings does not match the swept mesh's skinned/chorded surface.
- Fix: Evaluate `at()` from the same selected ring/interpolation representation used to emit the mesh, including the exact posed ring section and polygon interpolation.

### SWEEPSKIN-3: Round start cap of a flexed leg protrudes beyond the flank
- Severity: P1 (silhouette/body intersection error under pose)
- Repro: `scratch/hunt-sweepskin/hunt-sweepskin-legcap.ts` — `npx tsx scratch/hunt-sweepskin/hunt-sweepskin-legcap.ts` (change `caps:'none'` to the default round cap for the comparison).
- Expected: A leg tube rooted at the flank should stay seated in the body when posed; the round start cap should be buried/hidden by the continuing body volume (the sprout contract in `docs/api.md:281-286` describes this seating behavior).
- Actual: With body radius `.5`, leg radius `.16`, and a `-35°` flex, the body max x is `0.5`. With `caps:'none'`, leg max x is `0.5511`; with the default round start cap it is `0.6428`, an extra `0.0918 m` outward bump from the cap. The cap visibly breaks the flank silhouette rather than staying buried.
- Cause: `src/sweep.ts:805-840` builds a normal round start cap at the sweep endpoint; unlike `sprout`'s bury handling (`src/sugar.ts`), a leg sweep has no root-cap burial/clipping against the parent volume, so the cap's radius follows the flexed bone outside the flank.
- Fix: For a sweep whose start is seated on another volume, provide root-cap burial (or constrain the start dome inside the continuing/body tube) before skinning; `sprout` already has the needed semantic input.

### SWEEPSKIN-4: Colour/band pieces remain separate skinned meshes at a shared edge
- Severity: P2 (hairline raster cracks at colour boundaries)
- Repro: `scratch/hunt-sweepskin/hunt-sweepskin-cracks.ts` — `npx tsx scratch/hunt-sweepskin/hunt-sweepskin-cracks.ts`
- Expected: `docs/api.md:228` promises colour pieces share boundary vertices and weights with no gap.
- Actual: A two-span smooth sweep split by `bands:[[.5,"#f00"]]` produces two meshes, with seam counts `4,4`; after posing, the two meshes register different local bone orderings (`["arm1","arm2"]` vs `["arm2","arm1"]`). Their closest seam vertices differ by only `2.27e-8 m` numerically, but they are independently rasterized under separate meshes/materials, so the shared edge can expose a hairline background crack (the trigger recorded at `docs/STATUS.md:267`).
- Cause: `src/sweep.ts:887-915` flushes a new `MeshBuffer` whenever colour changes; `src/context.ts:374-381` then chooses each piece's heaviest owner and calls `skinMesh` independently, so matching bind vertices undergo separate floating-point skin/deformation paths.
- Fix: Emit one mesh per sweep with material groups (or use shared vertex colours/material indirection) so colour boundaries retain one deformed vertex buffer.

## Covered

- `scratch/hunt-sweepskin/hunt-sweepskin-weights.ts`: smooth chain weights were checked at `t=0,.3,.4,.5,.6,.7,1`; every sum was exactly `1`, with only adjacent chain bones in the blend (`.4` = `.972/.028`, `.5` = `.5/.5`, `.6` = `.972/.028`). `skin:"rigid"` produced two separate meshes with no skin-weight attributes.
- `scratch/hunt-sweepskin/hunt-sweepskin-bonelist.ts`: forward, reverse, and arbitrary-order chain lists all used only the listed bones and had per-vertex sums `1`.
- Plain point-path and ordinary range infrastructure exercised while building the repros did not throw for normal axis-aligned inputs.
