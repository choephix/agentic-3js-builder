# Kits bug hunt

### KITS-1: `coil(a, b, ...)` does not run from `a` to `b`
- Severity: P1 (documented helper produces visibly offset spring endpoints)
- Repro: `scratch/hunt-kits/hunt-kits-clockwork.ts` — run `npx tsx scratch/hunt-kits/hunt-kits-clockwork.ts`; the final `coil([0,0,0],[0,1,0],0.1,3)` line prints `at(0) = [-0.1, 0, 0]` and `at(1) = [-0.1, 1, ~0]`.
- Expected: `kits/clockwork.md` lines 231–237 describe `coil(a, b, radius, turns)` as “a coil spring's centreline from a to b”; the documented sweep example expects the spring to connect the two supplied attachment points.
- Actual: Both endpoints are displaced by one full radius from the supplied points (10 cm in this repro), so a spring between two joints floats beside both attachments instead of meeting them.
- Cause: `kits/clockwork.ts:649-654` calls `spiral(p, p + side * radius, axis, ...)`; `spiral` necessarily starts at `from`, so the path starts at the radial offset and never reaches `a`/`b`.
- Fix: Build endpoint lead-in/lead-out segments (or make the helix radius taper to zero at both ends) so `at(0)` is `a` and `at(1)` is `b`, while retaining the requested turns between them.

### KITS-2: zero `metal.size` bakes NaN colours instead of rejecting the invalid scale
- Severity: P2 (edge option produces invalid paint output)
- Repro: `scratch/hunt-kits/hunt-kits-kits-edge.ts` — run `npx tsx scratch/hunt-kits/hunt-kits-kits-edge.ts`; its `metal("brass", { size: 0 }).at(...)` line prints `[NaN, NaN, NaN]`.
- Expected: `kits/clockwork.md` documents `size` as the broad colour-drift size in meters; a zero spatial scale cannot define the noise field and should either mean a constant field or be rejected with a clear positive-size error.
- Actual: `src/paint.ts` receives NaNs from the zero-size noise division, and the invalid triplet is accepted until atlas baking.
- Cause: `kits/clockwork.ts:79` accepts `options.size` without checking it is finite and positive; `metal` immediately passes it to `noise` at lines 83–84.
- Fix: Validate `size > 0` (and finite) in `metal`, or explicitly treat zero as a documented constant-field mode.

## Covered
- `pixelArt`/`pixelTexture` grids, transparent stamps, Bayer thresholds and `Cell.pick`; standalone `pick` matched nearest-step and dither semantics.
- `tileBox` on smaller, equal and larger faces: UV crops stayed within the source tile and enlarged whole-tile fallback preserved square texels; random offsets and `[x,y]` step alignment exercised.
- `skinFaces`/`skinBox`: all six BoxGeometry faces mapped to their named sheet rectangles with outside-view orientation; `skinLayout` packed multiple boxes and the documented sheet example ran.
- Toon `shadowOf` reproduced both documented examples exactly (`#ffb036 → #f06414`, `#27dccb → #289eb2`); `cel`, `furEdge`, `inkLines`, `zigzag`, and `animeEye` exercised with documented options.
- Clockwork `gearSize`, solid `gearGeometry`, `gearTexture`, `metal`, `panelled`, `gaugeTexture`, and `gearTrain` exercised. Typical gear pairs (8–60 teeth; multiple angles and compound `on`/`shift` layers) landed at exact pitch-circle distances and produced expected opposite/compound ratios; `spin()` ran.
- Glow on plain `Mesh`, builder `Part`, arrays, rigged part, textured part, and card/sweep-style targets: emissive copies had the requested strength, shared source materials stayed unchanged/shared correctly, and documented painted-surface rejection occurred.
- The combined docs-shaped cross-kit repro typechecked cleanly with `npm run typecheck -- scratch/hunt-kits/hunt-kits-docs.ts` and ran under `npx tsx`.
