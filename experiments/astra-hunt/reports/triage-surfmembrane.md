# Surfmembrane triage

### MEMBRANE-1: `membrane` loses per-span bones on `sweep.line()` edges
- Verdict: confirmed
- Severity: P1 — `sweep.line()` is explicitly documented as a membrane edge that lies on the skin, and the current path stores only the start weight, so an un-overridden line edge silently becomes rigid across a posed multi-bone span. It is a narrow but visibly wrong pose failure rather than a P0-wide failure because shipped line-edge membranes provide an explicit chain `bone`.
- Samples hit: none affected; `tentacleSerpent` and `redLionfishKimi` both use `tube.line(...)` as membrane edges on multi-bone chains but pass `bone: front`/`bone: tail`, which makes `membrane.edgeWeights()` resolve the chain per cell. (The other line-edge searches found no unguarded shipped use.)
- Fix: Change `Sweep.line()`/`Path` to retain weights sampled at each line knot/sample, then make `membrane()` interpolate those per-column weights; update the line-edge docs/example if the representation changes. Preserve the explicit `bone` fallback for existing samples.

### SURFACE-1: `loop()` returns one open colour band instead of the full loop on a colour-split sweep
- Verdict: confirmed
- Severity: P1 — the documented `surface.loop` + `sweep.bands` combination drops half of a closed intersection (repro: length 3/open versus plain length 6/closed), silently producing incomplete geometry.
- Samples hit: none; the sample search found colour-banded sweeps and surface loops, but no loop target that is itself a band/colour-split sweep.
- Fix: In `Surface.loop()`, weld crossing nodes by world position across mesh owners while retaining per-triangle ownership for normals/weights, then join chains through coincident cross-mesh nodes before loop selection. No sample change is required.

### MEMBRANE-2: Crossing edge paths emit degenerate triangles
- Verdict: confirmed
- Severity: P1 — ordinary two-point edges forming an X produce 12 zero-area triangles in a promised closed membrane; the grid folds through itself without validation or a clear error.
- Samples hit: none; no shipped membrane uses crossing edge paths.
- Fix: Validate edge intersections and near-zero cell areas in `membrane()` before calling `prism()` and throw a membrane-specific error, or split/retriangulate crossings if that layout is intended. Document the restriction if rejection is chosen.

### MEMBRANE-3: Zero thickness silently creates a fully degenerate prism
- Verdict: confirmed
- Severity: P1 — `thickness: 0` is accepted despite membranes/slabs being documented as closed prisms, yielding finite but fully zero-thickness geometry with no diagnostic; negative thickness is also accepted and should be covered by the same contract decision.
- Samples hit: none; no sample passes zero thickness to `membrane()` or `slab()`.
- Fix: Validate `options.thickness > 0` in both `membrane()` and `slab()` before geometry construction, with helper-specific errors. Update the option docs to state the positive requirement; add no sample workaround.

### SURFACE-2: `drape()` carries only its first hit's bone, so a draped strap detaches after a pose
- Verdict: intended (docs/api.md:305)
- Severity: P2 — the repro is real, but both `src/surface.ts:229-240` and the API explicitly define drape as taking the first hit's weights. That is a documented limitation, not an implementation regression; it is still visually risky for straps crossing joints and deserves a future contract change only if multi-span drapes become the intended behavior.
- Samples hit: `amigurumiNarwhal` (scarf/flat scarf tail), `dreadKnight` (chest swag and harness chains), `lifeguardSculpt` (waistband and lanyard), `orcBerserkerOx` (bandolier), `orcBerserkerSonnet` (bandolier/necklace), and `sprinterSculpt` (waistband/crop-top straps) use draped routes over multi-bone surfaces without a sweep `bone` override. `mochiCatBaker` and `hedgehogPostie` also have multi-span apron/satchel straps, but explicitly pass `bone: spine`/`bone: chestJoint` and therefore avoid this behavior.
- Fix: No bug fix under the current contract. If drapes are changed to carry per-sample weights, update `Surface.drape()`, `Path`/`Sweep` skinning, docs/api.md:305, and the affected strap samples together; otherwise keep the explicit first-hit wording and recommend `bone: Chain` for pose-safe multi-span straps.

### SURFACE-3: `nearest()` crashes on a built mesh containing only degenerate triangles
- Verdict: confirmed
- Severity: P2 — an accepted `Part` made only of zero-area triangles makes `.nearest()` index owner `-1` and throw an unrelated `userData` TypeError, while `.ray()` already returns `null` for the same no-surface target. This is an edge input, not a common sample path.
- Samples hit: none; no shipped sample intentionally builds an all-degenerate surface.
- Fix: Guard `best < 0` in `Surface.nearest()` and throw a clear no-non-degenerate-triangles error (or establish a documented null result), then apply the same empty-data policy to queries that assume triangle area/box data. No sample change is required.
