# Membrane bug hunt

### MEMBRANE-1: `membrane` loses per-span bones on `sweep.line()` edges
- Severity: P0 (silent wrong output on documented use)
- Repro: `scratch/hunt-membrane/hunt-membrane-lines.ts` — `npx tsx scratch/hunt-membrane/hunt-membrane-lines.ts`
- Expected: `docs/api.md:243` says `sweep.line()` is a membrane/sweep edge lying on the skin; `docs/api.md:344-346` says smooth membrane vertices blend neighbouring chain bones and path edges follow their own bones. A line over a four-span chain should therefore deform over all four spans.
- Actual: The membrane has 312 vertices but no `skinIndex`/`skinWeight` and `userData.skinBones` is undefined; `b.ctx.owner` reports only `wing1`. Its far vertex is `[0.0099999998, 2.625, -0.200000003]` before and exactly the same after `b.pose("wing2", { axis: [1, 0, 0], deg: 90 })`, so the line membrane is rigid on the first span's bone instead of following later spans.
- Cause: `src/sweep.ts:487-491` calls `smoothPath(..., this.weightAt(0))`, storing only the start weight on the returned Path. `src/path.ts:33-43` has one `weights` value for a whole Path, and `src/membrane.ts:113-121` uses that one value for every path vertex. The documented line edge therefore cannot carry its span-varying weights.
- Fix: Preserve per-sample/per-span weights on `sweep.line()` (and teach Path/membrane to consume them), or have membrane recognize line paths and resolve their originating sweep/chain by parameter instead of using only `path.weights`.

### MEMBRANE-2: Crossing edge paths emit degenerate triangles
- Severity: P1 (wrong geometry on a plausible edge layout)
- Repro: `scratch/hunt-membrane/hunt-membrane-cross.ts` — `npx tsx scratch/hunt-membrane/hunt-membrane-cross.ts`
- Expected: `docs/api.md:339` accepts two paths as membrane edges and promises a closed, double-sided mesh (`docs/api.md:343`); unlike `extrude`, the membrane docs give no self-crossing restriction or validation.
- Actual: Two ordinary 2-point edges forming an X (`[-1,0]→[1,2]` and `[-1,2]→[1,0]`) produce 56 triangles, 12 with exactly zero area (`minArea: 0`). The zero-area row occurs where the edges cross, and the grid folds through itself rather than rejecting or avoiding the invalid cell.
- Cause: `src/membrane.ts:136-161` linearly interpolates the two edges into a rectangular grid and computes normals but never checks edge intersections or zero-area cells; `prism()` at lines 68-93 emits every cell unconditionally.
- Fix: Detect crossings/near-zero cell areas before prism construction and throw a membrane-specific error (or split/retriangulate around intersections if crossing edges are intended).

### MEMBRANE-3: Zero thickness silently creates a fully degenerate prism
- Severity: P1 (documented numeric option yields invalid closed geometry)
- Repro: `scratch/hunt-membrane/hunt-membrane-thickness.ts` — `npx tsx scratch/hunt-membrane/hunt-membrane-thickness.ts`
- Expected: `docs/api.md:343` says membranes return closed, double-sided meshes; `docs/api.md:351` describes slabs as thin closed prisms. `thickness` is documented as a total thickness, with no positive-only contract or warning.
- Actual: `thickness: 0` is accepted for both a slab and membrane. The slab has 24 vertices with `zMin = zMax = 0`; the membrane has 36 vertices with `zMin = zMax = 0`; every face has zero volume/area in the thickness direction. No error or warning identifies the degenerate result.
- Cause: `src/membrane.ts:237-239` and `src/membrane.ts:51-92` simply use `options.thickness / 2` as the offset, with no positivity check.
- Fix: Require `thickness > 0` with a clear helper-specific error, unless zero-thickness surfaces are intentionally supported as a separate non-prism mode.

## Covered

- `scratch/hunt-membrane/hunt-membrane-probe.ts` exercised concave and clockwise slabs, a non-planar slab, same-direction membranes, opposite-direction membranes, crossing membranes, very unequal edge lengths, chain/plain and plain/plain edge combinations. Concave CCW and CW slabs both produced 16 non-zero triangles, with top faces consistently +normal and bottom faces -normal; the non-planar four-point slab produced finite positions and 12 non-zero triangles. A 10 m versus 1 m edge pair produced finite geometry with minimum triangle area `0.02500000037`.
- Opposite-direction edges intentionally fold: with the API's explicit `docs/api.md:349` instruction to run both edges root-to-tip, the repro gave zero-area triangles at the midpoint rather than a hidden direction reversal. This is documented caller responsibility, not counted as a separate finding.
- `scratch/hunt-membrane/hunt-membrane-chain-path.ts` confirmed a chain plus plain path gets span bones (`userData.skinBones: ['arm1','arm2','arm3']`) and a skin-weight attribute. `scratch/hunt-membrane/hunt-membrane-thickness.ts` confirmed positive `thickness: 0.1` gives finite ±0.05 offsets.
- `docs/api.md:339-351` currently contains a complete edge-bone paragraph, including path fallback order and the explicit same-direction warning; no present docs truncation was reproduced.
