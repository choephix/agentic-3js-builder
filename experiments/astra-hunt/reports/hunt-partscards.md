# Partscards bug hunt

No new reproducible bugs found in the assigned part/cards/region paths. The previously reported `b.part({ bone, no at })` behaviour is still present and matches the clarified contract: geometry is shifted to the bone joint; model-space geometry must use `at: [0, 0, 0]`. The reported `Region.joint()` versus `region.p()` confusion is also resolved in the current docs: literal region coordinates and `region.p()` produce identical model-space positions, while built inputs pass through.

## Covered

- `scratch/hunt-partscards/hunt-partscards-core.ts` (`npx tsx ...`):
  - `b.part` with `bone` and no `at` placed a box origin at `[2, 0, 0]` (the bone joint); the same geometry with `{ bone, at: [0, 0, 0] }` stayed at model origin. `flat: true` produced split per-face normals (`36` normal/position vertices for the box).
  - Default names were `box.head`, `box.head.2`, `sweep.legL`, `sweep.legL.2`; inserting an unrelated `sphere.other` did not renumber them.
  - Region literal joint placement matched `region.p`: both were `[2.4, 1.6, 3.8]` for scale `2`; `region.local` intentionally returned unscaled meter coordinates. Mirrored region quaternions produced mirrored points/directions.
  - Cards: one card generated 4 triangles (`4` vertices, `12` indices); `cross: true` generated 8 triangles (`8` vertices, `24` indices); lean/flow placement, mirror UV reversal, texture tint, and Paint tint were inspected. A Paint card used a white texture material and linear red vertex colour `[1, 0, 0]`.
  - Card texture arrays batch by distinct texture and use deterministic RNG selection; no count/mesh explosion beyond one mesh per distinct texture was observed.
- `scratch/hunt-partscards/hunt-partscards-names.ts` (`npx tsx ...`): adding several meshes in an unrelated group before/between target meshes left the `box.head` and `box.head.2` sequence stable.
- `scratch/hunt-partscards/hunt-partscards-region.ts` (`npx tsx ...`): region points, joints, and parts followed a posed owning bone; region-local positions and mirrored orientation remained numerically consistent after pose.
- `scratch/hunt-partscards/hunt-partscards-region-joint.ts` (`npx tsx ...`): a region attached to `head` created an omitted-parent local joint under `head` and the joint followed the head pose; no inheritance failure reproduced.
- `scratch/hunt-partscards/hunt-partscards-limits.ts` (`npx tsx ...`): 1,001 frames with a texture list produced one batched mesh (the fixed RNG selected one texture) and 4,004 triangles, confirming cards are not one-part-per-card and stay within the documented one-mesh-per-distinct-texture behaviour.
- `scratch/hunt-partscards/hunt-partscards-textures.ts` (`npx tsx ...`): alternating RNG choices from a two-texture list produced two meshes, four triangles each, with the corresponding texture map on each material.
