# Tooling/scenario triage

### TEXDECAL-2: Missed decal rays collapse grid cells into zero-area slivers
- Verdict: confirmed
- Severity: P1 — a normal decal that crosses a finite target boundary emits degenerate triangles and retains UVs, producing visibly broken/stretched geometry; this also occurs in shipped models (see samples hit).
- Samples hit: bisonBull, broomWitchling, hedgehogPostie, koiPondIsland, komodoDragon, leafTanuki, mochiCatBaker, sleepySloth, stagBeetle, treehouseDiorama (the all-sample decal probe found zero-area triangles in their built `decal.*` meshes; the original repro independently measured 0-area triangles)
- Fix: In `src/decal.ts` retain hit/miss state from `skin.ray`; omit or clip cells with misses instead of replacing misses with `skin.nearest()`. Update decal regression coverage/docs if clipping semantics are chosen.

### TEXDECAL-3: Decals are always smooth-shaded across sharp target edges
- Verdict: confirmed
- Severity: P1 — hard-coded smooth normals invent rounded highlights across low-poly edges, contrary to the documented facet convention, though the defect needs a decal crossing a sharp edge.
- Samples hit: none confirmed in shipped source (the shipped BoxGeometry decal calls keep their small decals within a face; the direct edge repro is a standalone target)
- Fix: In `src/decal.ts` add a documented shading policy/option or split decal vertices when adjacent hit normals turn sharply; add a sharp-edge regression.

### TEXDECAL-4: Unmarked coloured Texture inputs are treated as tintable greys
- Verdict: confirmed
- Severity: P1 — the public `PartOptions.texture` accepts `Texture`, so a raw coloured three.js texture silently changes to black under a blue part tint.
- Samples hit: none (sample search found no `DataTexture`, `TextureLoader`, `CanvasTexture`, or raw `new Texture`; shipped textures come from `svg()` and carry metadata)
- Fix: In `src/parts.ts`/atlas handling define and propagate explicit colour metadata for every accepted `Texture` (or constrain/document the option as `svg()` only), forcing marked coloured textures to white tint; add a raw-texture regression and API docs.

### SERPENT-1: Twisted circular sweeps penetrate the floor
- Verdict: confirmed
- Severity: P1 — the documented circular tube support radius is violated only after faceting is rolled by twist, allowing a grounded tube to sink about 8.2 mm at radius 100 mm.
- Samples hit: none (no shipped sample combines `twist` with the default circular section; `tentacleSerpent` and other twisted samples explicitly use `section: "box"` or an `ngon`)
- Fix: In `src/sweep.ts` keep world-up support at the requested circle radius under twist (reorient/compensate the faceting or adjust the grounded centreline); document the selected contact behavior and add a twisted-grounded regression.

### TOOLING-2: Preview distance and bounds are inflated/deflated by later-part z-fight scaling
- Verdict: confirmed
- Severity: P1 — `preview --gap`/`--box` promises model/world measurements but reports the render-only 1.003 growth (98.5 mm instead of 100 mm; 1003 mm instead of 1000 mm). BAKE-3's growth is intentional; this consequence is not a valid measurement.
- Samples hit: all shipped multi-part samples when a selected gap/box includes a later emitted mesh (representative: articulatedDeskLamp, bisonBull, tentacleSerpent, robotGardener); no sample invokes preview flags in source, so the issue is exposed by users measuring those models.
- Fix: In `harness/assemble.ts`/`scripts/preview-page.ts` carry unscaled baked positions for bounds and `measureIndex`, applying z-fight growth only to render/export geometry; keep BAKE-3 documented as the render workaround.

### TOOLING-5: Preview output folders collide for same-named files in different directories
- Verdict: confirmed
- Severity: P1 — documented path inputs silently overwrite another path's `parts.json`, textures, shots, or snap artifacts when basenames match.
- Samples hit: none (the collision repro is two scratch paths; shipped `samples/` basenames are unique)
- Fix: In `scripts/preview.ts` and `scripts/snap.ts` derive a stable collision-resistant identity from the resolved path, or record/reject a different source in an existing output directory; update GUIDE output-path wording.

### TEXDECAL-1: Warm-grey SVGs silently bypass the documented tint
- Verdict: confirmed
- Severity: P1 — `#8a8888` is visually a near-grey drawing but the hard 0.03 channel-spread cutoff classifies it as coloured, creating a discontinuous tint boundary.
- Samples hit: none (no shipped SVG contains the repro near-grey values `#8a8888`/`#908080`; ordinary grey SVGs use clear greys)
- Fix: In `src/texture.ts` replace the raw channel-spread cutoff with a documented/perceptual near-grey tolerance appropriate to raster quantisation, and add warm-grey regression cases to texture tests/docs.

### TOOLING-1: `snap` cannot run documented throwaway paths with required hyphenated names
- Verdict: confirmed
- Severity: P1 — GUIDE explicitly documents `scratch/<slug>/` throwaways and the hunt’s required `hunt-tooling-*` names, but the public wrapper rejects those paths before import; this blocks a documented workflow (though renaming is an easy workaround).
- Samples hit: none (the failure is specific to hyphenated path basenames under `scratch/`; shipped sample slugs are not affected)
- Fix: In `harness/snap.ts` accept the same safe lower-case/hyphen slug form that the public path workflow documents, or derive a safe output slug separately while retaining the source path; align `preview`, `snap`, and GUIDE validation.

### TOOLING-3: The 5 mm floor boundary is silently accepted
- Verdict: confirmed
- Severity: P1 — `docs/STATUS.md` says the check warns from 5 mm, but strict `>` excludes exactly 5 mm, making a documented boundary check inconsistent.
- Samples hit: none (the shipped near-floor examples are not exactly 5 mm; the hunter repro is an exact boundary input)
- Fix: In `harness/assemble.ts` use `box.min.y >= 0.005`; preserve sufficient displayed precision if values just over the boundary need distinction.

### TOOLING-4: `snap` silently ignores a second positional tag
- Verdict: confirmed
- Severity: P1 — an argument typo exits successfully while silently discarding a supplied tag, so a user can believe the wrong version was selected.
- Samples hit: none (this is CLI argument validation; no sample source supplies positional snap tags)
- Fix: In `scripts/snap.ts` validate the filtered positional arguments before destructuring: reject extras (one target plus optional tag, with report-only allowing no tag), matching `preview`’s unexpected-argument behavior.

### QUAD-1: A terminal part stuck to `sweep.at(1)` ignores poses of the chain's explicit foot tip
- Verdict: confirmed
- Severity: P1 — the documented extra `names` entry creates the hand/foot/hoof tip and says it carries attached geometry, but `sweep.at(1)` resolves the last span bone instead; a hoof/claw can stay rigid while the named foot poses.
- Samples hit: none (the shipped endpoint attachments found by source search either use explicit tip bones or chains without this `names`-extra plus `sweep.at(1)` surface/stick pattern; the docs-shaped scratch quadruped reproduces it)
- Fix: In `src/sweep.ts`/chain surface weight resolution include `chain.tip` for the endpoint cap and `sweep.at(1)`, or explicitly route endpoint attachments through the tip frame; preserve the documented tip contract and add a pose regression.

### WINGED-1: Shared-root wing membranes emit degenerate faces
- Verdict: confirmed
- Severity: P1 — ordinary bat/dragon wing construction with two finger chains sharing a wrist emits zero-area indexed faces (including closed-prism walls), creating invalid geometry despite finite positions and valid weights.
- Samples hit: flyingFox, eggshellDragonling, ukiyoeKappa, wyvern (built shipped membrane meshes contain zero-area triangles at shared finger/toe roots)
- Fix: In `src/membrane.ts` detect collapsed grid cells/edges and omit their face and wall triangles, preserving shared-root weights and the non-degenerate remainder; add shared-root membrane regressions.

### TOOLING-6: `sheet --cols` accepts non-numeric values and writes a misleading sheet
- Verdict: confirmed
- Severity: P2 — invalid numeric input is silently replaced by the default column count, but the resulting image is otherwise usable and no model geometry is corrupted.
- Samples hit: oldFisherman (the shipped render used by the repro); no source sample is affected unless a user supplies invalid `--cols`.
- Fix: In `scripts/sheet.ts` parse `--cols` once and reject non-finite, non-integer, or less-than-one values before invoking ImageMagick; retain the usage text.


Styled and mechanical hunts reported no new findings, so they add no verdict blocks.
