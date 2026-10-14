# Outline geometry bug hunt

### OUTLINE-1: Lathe profiles that touch the axis emit degenerate triangles
- Severity: P1 (wrong geometry on a documented solid-profile input; half the index triangles have zero area)
- Repro: `scratch/hunt-outline/hunt-outline-findings.ts` — `npx tsx scratch/hunt-outline/hunt-outline-findings.ts`; see `axis solid lathe segments 6` and `axis solid lathe segments 12`.
- Expected: `docs/api.md:384-387` explicitly permits x = 0 as the profile's distance from the axis and shows a solid profile that starts and ends on the axis. Rotating a solid should collapse axis rings without adding zero-area faces.
- Actual: profile `[[0,0],[1,0],[1,1],[0,1]]` at `segments: 6` creates 48 triangles, 24 degenerate (minimum cross-product area 0); `segments: 12` creates 96 triangles, 48 degenerate. An otherwise identical shell shifted off-axis (`x=.2`) creates 48 triangles, 0 degenerate.
- Cause: `src/outline.ts:375-380,387-397` creates a full `segments`-vertex column even when `p[0] === 0`, then emits two triangles for every angular sector. All vertices in an axis column coincide, so each profile edge incident to the axis contributes zero-area triangles.
- Fix: represent an x=0 profile point as one shared vertex (or omit triangles whose radial edge collapses), and connect the neighbouring ring to that single pole with one triangle per sector.

### OUTLINE-2: Self-fitting bevel reaches a collapsing inset on thin outlines
- Severity: P1 (documented bevel silently emits degenerate geometry)
- Repro: `scratch/hunt-outline/hunt-outline-findings.ts` — `npx tsx scratch/hunt-outline/hunt-outline-findings.ts`; see `thin bevel requested 1 on width .01, thickness .01`.
- Expected: `docs/api.md:376-380` promises that bevel shrinks until it fits the outline. A thin but ordinary 10 m × 1 cm outline with 1 cm thickness and a requested 1 m bevel should produce a valid, non-collapsed chamfer (or clamp strictly below the collapse threshold).
- Actual: 60 triangles are generated, 8 have zero/near-zero area; the smallest cross-product magnitude is `1.2052200567606576e-12`. The requested bevel clamps to approximately half the 1 cm width, collapsing the narrow-side inset.
- Cause: `src/outline.ts:216-228` accepts an inset when each shrunken edge still has positive dot product and `area(shrunk) > 0`; `src/outline.ts:230-241` binary-searches up to the exact limit. At the limiting inset, floating-point arithmetic lets an edge of effectively zero length pass, and `src/outline.ts:291-305` still emits its two wall triangles.
- Fix: require a positive geometric clearance (not merely `along > 0`) in `insetFits`, and clamp the returned bevel below the first collapsing edge; skip any residual zero-area wall triangles defensively.

### OUTLINE-3: Beveled knife-edge taper emits collapsed triangles
- Severity: P1 (the docs explicitly allow a zero thickness end)
- Repro: `scratch/hunt-outline/hunt-outline-findings.ts` — `npx tsx scratch/hunt-outline/hunt-outline-findings.ts`; see `zero-to-positive taper, bevel .04`.
- Expected: `docs/api.md:378-380` says either taper endpoint may be 0 for a knife edge and bevel should round the rims inward. The result should contain a valid knife edge, with collapsed boundary faces omitted rather than indexed as triangles.
- Actual: `thickness: [0, .2]`, square 1 m outline and `bevel: .04` produce 60 triangles, including 4 exactly degenerate (minimum area 0). The nonzero taper `[.001,.3]` does not collapse, confirming the issue is at the allowed zero endpoint.
- Cause: `src/outline.ts:286-289` scales every vertex z by `thicknessAt(p[1]) / full`; all vertices at the low-y end therefore share z=0. `src/outline.ts:291-305` still writes side/bevel triangles for that ring, producing zero-area faces.
- Fix: when a taper endpoint is zero, collapse the endpoint to a boundary/pole and omit faces whose two rings coincide, while preserving the knife-edge silhouette.

## Covered

- Reversed clockwise and counter-clockwise square outlines both built successfully with 36 vertices/12 triangles, no degenerate triangles, and matching area-scale (`min cross magnitude 0.2`); `prepare()` winding normalization behaves correctly.
- Bow-tie crossing and a non-adjacent touching vertex both throw the documented self-crossing error; a repeated final point is dropped and builds normally.
- `smoothing: 1..3` and an explicit `"sharp"` corner build without degenerates in the probe; smoothing-cross case remained valid.
- Extrusion in a non-default plane (`x=[1,0,0]`, `y=[0,0,1]`) produced the expected ±Y thickness normals; arbitrary plane basis projection and parallel x/y rejection were exercised.
- Off-axis lathe shell with 6 segments and a 45° spin produced 48 triangles with no degenerates; below 12 segments is flat-shaded as intended. Standard profile corner creasing was exercised.
- Bone inheritance: an extrude at a child reports child bone; explicit `bone: root` remains rigid on root after child posing. The tested handles stayed at the joint pivot as expected.
- Spiky bevel probe (`[[0,0],[4,0],[.02,.01],[4,.02],[0,.03]]`, thickness .1, bevel .2) produced 76 triangles with no degenerate triangles.
