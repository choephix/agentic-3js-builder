# Sweepcore bug hunt

### SWEEPCORE-1: `sweep.at()` can be visibly off the generated mesh between adaptive rings
- Severity: P1 (wrong geometry query; documented `sweep.at` is a frame on the built surface)
- Repro: `scratch/hunt-sweepcore/hunt-sweepcore-at-offset.ts` — run `npx tsx scratch/hunt-sweepcore/hunt-sweepcore-at-offset.ts`
- Expected: `docs/api.md:240` says `sweep.at(t)` is a frame on the built surface; `docs/STATUS.md:262` calls out a 3–5 mm known limit.
- Actual: On a normal 1.5 m, sharply curved polyline tube of radius 0.05 m, querying `sw.at(t, 35)` and projecting it back with `b.surface(sw).nearest()` measured distances of 7.28 mm, 16.72 mm, 4.67 mm, 3.48 mm, 8.17 mm and 3.95 mm at t = 0.13, 0.27, 0.41, 0.55, 0.69, 0.83. The 16.72 mm miss is over 3× the documented limit and can make a fin/along item visibly float away from its tube.
- Cause: `src/sweep.ts:922-964` greedily drops candidate rings until turn/radius/chord-sag limits pass; `Sweep.atU` at `src/sweep.ts:470-480` evaluates the ideal analytic frame instead of interpolating the selected mesh rings. The mesh chord and analytic path diverge on this curvature.
- Fix: Evaluate `at()` against the same selected ring surface (or force ring insertion/error bounds for surface queries), rather than returning an analytic point that is not on the tessellated mesh.

### SWEEPCORE-2: Narrow sector boundaries are tessellated as saw-toothed strips on bent tubes
- Severity: P1 (visible wrong paint edge; also listed as a known geometry issue)
- Repro: `scratch/hunt-sweepcore/hunt-sweepcore-known.ts` — run `npx tsx scratch/hunt-sweepcore/hunt-sweepcore-known.ts`
- Expected: `docs/api.md:229-232` promises sector strips whose neighbouring edges share exactly, and a colour sector should read as a clean longitudinal boundary.
- Actual: A normal radius-0.08 tube with a 90-degree bend and a narrow `[-12,12]` degree sector creates two separate meshes with 76 vertices / 120 triangles. The sector edge has no wall and is represented only by independently triangulated ring-to-ring chords, producing the reported saw-toothed boundary rather than a smooth edge.
- Cause: `src/sweep.ts:753-785` inserts only per-ring boundary vertices at each sector angle; `src/sweep.ts:788-803` connects different ring runs with greedy cumulative-distance fractions. On a bent tube these chords do not follow the intended sector edge curve.
- Fix: Add edge-following tessellation (or a dedicated edge strip) at sector boundaries, with spacing/curvature limits matching the tube centreline.

### SWEEPCORE-3: Round caps on box sections at sharp corners leave diagonal wedges
- Severity: P1 (visible wrong geometry; also listed as a known geometry issue)
- Repro: `scratch/hunt-sweepcore/hunt-sweepcore-boxverts.ts` — run `npx tsx scratch/hunt-sweepcore/hunt-sweepcore-boxverts.ts`
- Expected: `docs/api.md:224-227` says sharp rigid corners should be rounded without exposing cap artefacts; a box section should retain its square cross-section at the bend.
- Actual: A normal `section: "box"`, radius 0.2, rigid sweep over `[[0,0,0],[0,0,1],[1,0,1]]` inserts diagonal cap vertices around the internal corner, e.g. `[-0.141421, 0.141421, -0.141421]` and `[0.141421, -0.141421, -0.141421]`, in addition to the square-corner vertices at ±0.2. These are round-dome wedge faces at the sharp box turn, visible as triangular wedges.
- Cause: `src/sweep.ts:810-839` applies the round `sin/cos` dome to every section, while `src/sweep.ts:982-993` uses a round cap at rigid corner cuts (`capFor` at `src/sweep.ts:854-863`); the dome is not clipped/constructed against the adjacent box planes.
- Fix: For box corner caps, clip the cap dome to the two continuing box half-spaces or use a planar miter/transition that preserves the box faces.

### SWEEPCORE-4: Empty radius profiles throw an opaque internal TypeError
- Severity: P2 (type-level/documentation edge; `Radius` accepts `number[]`)
- Repro: `scratch/hunt-sweepcore/hunt-sweepcore-radius-edge.ts` — run `npx tsx scratch/hunt-sweepcore/hunt-sweepcore-radius-edge.ts`; the `empty` case reports `TypeError: Cannot read properties of null (reading 'x')`.
- Expected: `src/sweep.ts:48` accepts readonly number arrays and `docs/api.md:219` describes `number[]` radius profiles; invalid profile shape should be rejected at the sweep call with a useful argument error.
- Actual: `b.sweep([[0,0,0],[0,0,1]], [], { color: "#fff" })` reaches geometry construction and throws `TypeError: Cannot read properties of null (reading 'x')`, which does not identify the bad radius profile or the sweep call.
- Cause: `src/sweep.ts:222-225` builds `xs=[]` and calls `interpolate`; no non-empty/finite profile validation occurs before mesh construction.
- Fix: Validate radius arrays as non-empty finite profiles and throw a `sweep(): radius...` error before building geometry.

## Covered

- Number, two-key taper, multi-key taper and function/ellipse radius forms produced finite geometry with no degenerate indexed triangles (`hunt-sweepcore-probe.ts`).
- `caps: "round"`, `"flat"`, `"point"`, and `"none"` produced finite meshes; extension bounds matched requested 0.2/0.3 m extensions (`hunt-sweepcore-probe.ts`, `hunt-sweepcore-options.ts`).
- Circle, box, and ngon sections had correct outward winding on straight forward, vertical, and sideways tubes; sector winding for wrapping, non-wrapping, and adjacent sectors had zero inverted triangles (`hunt-sweepcore-direct.ts`, `hunt-sweepcore-sectorwind.ts`).
- Smooth closed loops had manifold indexed topology (every edge used twice); closed path seam and ranged closed sweep built without non-finite vertices (`hunt-sweepcore-closed.ts`).
- Dorsal clock continuity stayed aligned through a planar coil and U-turn; twist/shift and detail changes produced finite geometry (`hunt-sweepcore-clock.ts`, `hunt-sweepcore-options.ts`).
