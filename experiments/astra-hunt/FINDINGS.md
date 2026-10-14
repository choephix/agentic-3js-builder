# SDK findings, 2026-10-02

The hunt produced 3 P0, 37 P1, and 23 P2/intended-or-docs findings in the SDK/tooling reports (triage severity wins). The most consequential real bugs are wrong transforms/attachments, skinning ownership, invalid geometry, and sample-local placement; many shipped sample failures are simple hard-coded seating mistakes. The strongest areas were ordinary sweep/path construction, skeleton posing, surface ray/nearest on valid meshes, paint determinism, kits, cards/regions, and the styled/mechanical helper combinations. The sample audit was otherwise predominantly clean: the remaining sample defects below are isolated placement/anatomy problems rather than a shared SDK fault.

## Fix first

### Preserve model-space coordinates and measurement geometry

- **Ids:** BAKE-3, TOOLING-2
- **Severity:** P1
- **Verdict:** confirmed; one root cause affects export and preview measurements.
- **Symptom:** a documented model-space box centred at `(10,1,0)` is exported centred at `(10.03,1.003,0)` (up to 0.3% growth). The same render workaround changes a true 100.0 mm gap to 98.5 mm and a 1000 mm box to 1003 × 1003 × 1003 mm.
- **Samples hit:** every export with more than one visible mesh, including arcadeTentacleAlien, brassDiver, brutalistWalkerFortress, bunnyBakeryIsland, clockworkCarousel, codexJaguarWarrior, flowerHedgehog, orcBerserkerOx, pixelCapybara, retroActionHero, sushiCat, teapotDragon, tinToyCrab and many others; the preview consequence affects every later emitted part selected by a gap/box measurement.
- **Cause:** `harness/assemble.ts:86,339-340` applies per-part `grow = 1 + index * .003`; `harness/assemble.ts:178-179` scales vertices before `matrixWorld`, and preview indexes those inflated meshes.
- **Fix:** keep unscaled baked geometry for export and measurement; apply z-fight handling only to a render copy/material ordering, or use an explicit documented surface offset that does not move model-space vertices.
- **Repro:** `experiments/astra-hunt/repros/triage-bakepath/hunt-bake-model-space-sdk.ts`; `experiments/astra-hunt/repros/hunt-tooling/gaptest.ts`.

### Keep arbitrary frames unchanged when moved

- **Ids:** FRAMEMATH-1
- **Severity:** P0
- **Verdict:** confirmed; shipped callers use the documented orientation-preserving operation.
- **Symptom:** `frame([0,0,0],[1,1,1]).moved([1,0,0]).axis` becomes `[0.408248,0.577350,0.707107]` instead of `[0.577350,0.577350,0.577350]` (dot `0.977284`). A weighted sweep frame also flips its axis from `[0,0.707107,-0.707107]` to `[0,0.707107,0.707107]`.
- **Samples hit:** wrong oriented geometry in blossomDeer, feltPlushSloth, hedgehogPostie, inkwashCrane, islandTortoise, lifeguardSculpt, mossStoneGolem, orcBerserkerSonnet, pangolin, pixelMammoth, porcelainElephant, robotGardener, scarecrow, secretaryBirdSonnet, sprinterSculpt, warthogKimi and warthogSonnet; many other samples discard the returned orientation and are not visibly affected.
- **Cause:** `src/frame.ts:51-54` gives a mutable quaternion to `Spot`, then inverts that same quaternion while deriving facing.
- **Fix:** pass the original quaternion to `Spot`; use `quat.clone().invert()` only for local facing conversion. Add diagonal and weighted-frame regressions.
- **Repro:** `experiments/astra-hunt/repros/hunt-framemath/hunt-framemath-moved.ts`.

### Accept documented RGB tuples in paint selectors

- **Ids:** PAINT-1
- **Severity:** P0
- **Verdict:** confirmed; documented input silently bakes wrong colour.
- **Symptom:** `spots("#ffffff", [1,0,0], ...)` produced 176,638 black texels, 64,808 white, and **0 red** in a 512×476 sheet; direct samples returned scalar values for 956/10,000 points and non-finite tuples for 1,438. `scales([1,0,0], ...)` returned 10,000 non-finite values.
- **Samples hit:** none currently use an RGB tuple as `spots`/`scales` input; the public documented form is broken.
- **Cause:** `src/paint.ts:246-249` treats every array as a colour list, so the numeric `Rgb` tuple is picked element-by-element and reaches `bakeSheet` as invalid data.
- **Fix:** recognise a numeric three-tuple before treating an array as a list; preserve nested-list selection and the documented RGB contract.
- **Repro:** `experiments/astra-hunt/repros/hunt-paint/hunt-paint-spots-rgb-bake.ts`; `.../hunt-paint-scales-rgb.ts`.

### Do not emit invalid axis/knife-edge outline faces

- **Ids:** OUTLINE-1, OUTLINE-2, OUTLINE-3
- **Severity:** P1
- **Verdict:** confirmed; the documented forms build but contain degenerate topology.
- **Symptom:** an axis-closing lathe has 24/48 degenerate triangles at 6/12 segments (and 72/24 zero normals in triage probes); a 10 m × 0.01 m outline with 1 cm thickness and requested 1 m bevel has 8/60 near-zero faces, minimum cross magnitude `1.2052200567606576e-12`; a `[0,.2]` taper with bevel `.04` has 4/60 zero-area faces and 12 zero normals.
- **Samples hit:** axis lathe waste occurs in alebrijeJaguar, axolotl, artDecoFalcon, blacksmithForgeKimi/Ox/Sonnet, blossomDeer, bunnyBakeryIsland, cactusGunslinger, chibiKnight, all clockwork samples, curiosityJackalope, dieselpunkWarElephant, dosBasilisk, dromedaryCaravan, gbcSlimeKing, goldenPheasant, griffin, hamsterRover, hedgehogPostie, honeyBee, indianPeafowl, inkwashCrane, jadeSerpent, koiPondIsland, leafTanuki, littleLich, mantaRay, marginaliaSnailKnight, mochiCatBaker, neonScorpion, octopusBarista, orcBerserkerOx/Sonnet, paperDragonKite, penguinIceCreamCart, picturebookReef, pixelCapybara/Mammoth, porcelainElephant and others. No shipped sample hits the two bevel edge cases.
- **Cause:** `src/outline.ts:375-397` emits a full coincident ring at `x=0`; `src/outline.ts:216-241` accepts the exact collapsing bevel limit; `src/outline.ts:286-305` still indexes faces when a taper ring has zero thickness.
- **Fix:** represent axis/zero-thickness endpoints as one pole, connect neighbouring rings with non-degenerate triangles, require positive clearance in `insetFits`, clamp bevel below collapse, and omit residual zero-area faces.
- **Repro:** `experiments/astra-hunt/repros/hunt-outline/hunt-outline-findings.ts`.

### Make contour zero reaches valid or reject them

- **Ids:** EXPERIMENTAL-1
- **Severity:** P1
- **Verdict:** confirmed in shipped output.
- **Symptom:** a contour with `front:0, back:.05, side:.05, sides:12` and flat caps emits 50 vertices/48 triangles, including 8 zero normals and 10 zero-area triangles. Each shipped hair mesh has 6 zero-normal vertices.
- **Samples hit:** lifeguardContour and sprinterContour hair.
- **Cause:** `src/experimental/contour.ts:181-211` clamps reaches to zero but emits all ring vertices; `src/sweep.ts:753-785` connects duplicate points and computes zero normals.
- **Fix:** either reject zero reaches with a named error and update the hair profiles, or collapse the endpoint ring, omit degenerate cap faces, and assign the intended endpoint normal.
- **Repro:** `experiments/astra-hunt/repros/hunt-experimental/hunt-experimental-contour-zero.ts`.

### Prevent loop loss across band meshes

- **Ids:** SURFACE-1
- **Severity:** P1
- **Verdict:** confirmed; documented `surface.loop` on a banded sweep is incomplete.
- **Symptom:** slicing a capped radius-.5, length-2 tube at `x=0` gives `closed:false`, length `3`, with one side and half-cap crossings; the unbanded tube gives a closed perimeter about `6`.
- **Samples hit:** no shipped sample combines a colour-split sweep target with `surface.loop`.
- **Cause:** `src/surface.ts:272-284` keys crossings by mesh identity, so coincident band-boundary crossings never weld; `:351-364` selects one open chain.
- **Fix:** weld crossing nodes in world space across target meshes, retain per-triangle ownership for normals/weights, and join coincident chains before loop selection.
- **Repro:** `experiments/astra-hunt/repros/hunt-surfmembrane/hunt-surface-loop-bands.ts`.

### Keep decals valid at boundaries and on faceted targets

- **Ids:** TEXDECAL-1, TEXDECAL-2, TEXDECAL-3, TEXDECAL-4
- **Severity:** P1
- **Verdict:** confirmed; four ordinary texture/decal inputs silently produce wrong colour or geometry.
- **Symptom:** warm grey `#8a8888` is classified tintable while `#908080` is classified coloured, flipping the channel-spread boundary near `.03`; a decal with 15 vertices has repeated x columns `[...,.25,.25]`, 16 triangles and minimum area `0`; a decal across a box edge gets shared normal `[.893886,0,.448294]` instead of either face normal; a raw red `DataTexture` under blue tint bakes atlas RGBA `[0,0,0,255]` instead of red.
- **Samples hit:** no current shipped sample exercises these exact edge inputs; they affect ordinary documented SVG, decal-edge, and `Texture` usage.
- **Cause:** `src/texture.ts:94-114` uses an undocumented RGB-spread threshold; `src/decal.ts:94-103` substitutes nearest points for ray misses and triangulates them; `src/decal.ts:123-130` hard-codes smooth shared normals; `src/parts.ts:88` relies only on optional `userData.coloured` set by `svg()`, while `harness/atlas.ts:78-83` always multiplies tint.
- **Fix:** use a documented perceptual near-grey rule; preserve hit/miss and clip/drop missed cells; add decal flat/target shading policy; require or infer colour metadata for all accepted textures and force coloured textures to white material tint.
- **Repro:** `experiments/astra-hunt/repros/hunt-texdecal/hunt-texdecal-tint.ts`, `.../hunt-texdecal-decal.ts`, `.../hunt-texdecal-shading.ts`, `.../hunt-texdecal-rawtexture.ts`.

### Repair twisted and double-back sweep winding

- **Ids:** SERPENT-1, LOFTSUGAR-3
- **Severity:** P1
- **Verdict:** confirmed; both are wrong surface geometry on otherwise valid paths.
- **Symptom:** a radius-.1 horizontal spiral centred at y=.1 with twist 90 has `sweep.at(.25,180).y=-.008239` and mesh `minY=-.008239` instead of 0; the untwisted control reaches `-1.49e-9`. A three-station double-back loft has 8/96 triangles with negative radial dot products (example `-.0274`) versus 0/64 in the straight control.
- **Samples hit:** no shipped sample uses a reversing loft; the twisted grounded-tube combination is a normal documented use but no audited sample was tied to it.
- **Cause:** `src/sweep.ts:247-260,352-353` rotates a finite polygon whose support becomes `r/cos(pi/8)=.108239`; `src/path.ts:215-220` parallel-transports across a near-180° tangent reversal and `src/sweep.ts:787-803` connects reversed rings.
- **Fix:** correct support against world-up for grounded twisted tubes, and use a deterministic reversal frame or split/fillet U-turns before joining rings.
- **Repro:** `experiments/astra-hunt/repros/hunt-serpent/hunt-serpent-twist.ts`; `experiments/astra-hunt/repros/hunt-loftsugar/hunt-loftsugar-doubleback-winding.ts`.

### Make `sweep.at()` agree with its mesh

- **Ids:** SWEEPCORE-1, SWEEPSKIN-2
- **Severity:** P1
- **Verdict:** confirmed; duplicate reports merge to one surface-query defect.
- **Symptom:** curved tubes return `sweep.at()` points 7.28, 16.72, 4.67, 3.48, 8.17 and 3.95 mm from the generated surface; the independent skin repro averaged 8.19 mm and peaked at 18.08 mm, beyond the documented 3–5 mm limit.
- **Samples hit:** any sample attaching surface items to strongly curved sweeps can be visibly affected; the status repro is the current known case, with no additional named sample failure isolated.
- **Cause:** `src/sweep.ts:465-480` evaluates the analytic frame while adaptive mesh rings are selected later at `:922-975`; the analytic chord/path does not equal the emitted skinned surface.
- **Fix:** evaluate `at()` from the selected ring/interpolation representation (including posed polygon sections), or insert rings to meet an explicit error bound.
- **Repro:** `experiments/astra-hunt/repros/hunt-sweepcore/hunt-sweepcore-at-offset.ts`; `.../hunt-sweepskin/hunt-sweepskin-at-accuracy.ts`.

### Preserve smooth corners through sweep ranges

- **Ids:** SWEEPSKIN-1
- **Severity:** P1
- **Verdict:** confirmed.
- **Symptom:** splitting a bent sweep at its corner changes the full-sweep corner range `x=-.1434.. .1996, y=.7978..1.1772` into two perpendicular round caps (`x=-.2...2`, y ranges `1..1.2` and `.8..1.2`).
- **Samples hit:** no named shipped sample was isolated for this exact range-boundary input.
- **Cause:** `src/sweep.ts:644-684` excludes corners exactly at range boundaries and emits ordinary caps.
- **Fix:** share/preserve boundary fillets between ranges rather than emitting two end caps.
- **Repro:** `experiments/astra-hunt/repros/hunt-sweepskin/hunt-sweepskin-ranges.ts`.

### Keep membrane topology closed and positive-thickness

- **Ids:** MEMBRANE-2, MEMBRANE-3, WINGED-1
- **Severity:** P1
- **Verdict:** confirmed.
- **Symptom:** crossing X-shaped edges produce 56 triangles, 12 exactly zero-area at the crossing. `thickness:0` is accepted by both slab and membrane, producing 24/36 vertices with `zMin=zMax=0` and a fully degenerate prism. Two finger membranes sharing a wrist root produce 420 vertices/140 triangles with 12 zero-area triangles (four remain after a 70° pose).
- **Samples hit:** no shipped sample uses crossing edges or zero thickness; the shared-root wing case is the standalone bat repro.
- **Cause:** `src/membrane.ts:136-161` and `:68-93` build every grid cell/wall without crossing, shared-root, or area checks; `:237-239` and `:51-92` use half-thickness without a positivity check.
- **Fix:** reject crossings/near-zero cells or retriangulate intentionally; collapse shared-root poles and omit zero-area walls/faces; require `thickness > 0` in both membrane and slab with docs.
- **Repro:** `experiments/astra-hunt/repros/hunt-membrane/hunt-membrane-cross.ts`; `.../hunt-membrane-thickness.ts`; `experiments/astra-hunt/repros/hunt-winged/hunt-winged-membrane-root.ts`.

### Fix cap/band shading and sector/corner tessellation

- **Ids:** SWEEPCORE-2, SWEEPCORE-3, SWEEPSKIN-4
- **Severity:** P2
- **Verdict:** confirmed.
- **Symptom:** a narrow sector on a bent radius-.08 tube has saw-toothed boundaries with 76 vertices/120 triangles and no edge wall; a box sweep at a sharp corner emits diagonal dome vertices such as `[-.141421,.141421,-.141421]`; colour-band pieces have separate seam counts `4,4` and can expose a `2.27e-8 m` hairline crack after posing.
- **Samples hit:** sector paint occurs in axolotl, bengalTiger, blossomDeer, dromedaryCaravan, flyingFox, giantAnteater, hammerheadShark, hydra, komodoDragon and redFox; box-corner paths occur in atariAnglerfish, articulatedDeskLamp and mimicHermitCrab; band seams affect redFox, artNouveauDragonfly, biomechSwarmQueen, axolotl, bengalTiger, bisonBull, bobaSlime, blossomDeer, chibiKnight and clockworkStag.
- **Cause:** `src/sweep.ts:753-803` connects independent boundary runs with chord fractions; `:810-839,982-993` applies round domes to box corners; `:887-915` flushes a mesh per colour and `src/context.ts:374-381` skins each independently.
- **Fix:** edge-following sector tessellation, planar/mitered box corner transitions, and one skinned mesh with material groups or shared deformed seam vertices.
- **Repro:** `experiments/astra-hunt/repros/hunt-sweepcore/hunt-sweepcore-known.ts`; `.../hunt-sweepcore/hunt-sweepcore-boxverts.ts`; `.../hunt-sweepskin/hunt-sweepskin-cracks.ts`.

### Carry span weights through line membranes and surface drapes

- **Ids:** MEMBRANE-1
- **Severity:** P1
- **Verdict:** confirmed; the line case is a bug. (The separate drape-first-hit behavior is documented; see Docs fixes.)
- **Symptom:** a 312-vertex `sweep.line()` membrane has no skin attributes and only owner `wing1`; its far vertex is bit-identical after posing `wing2` by 90°. A line over a four-span chain therefore stays on the first span.
- **Samples hit:** no affected sample because tentacleSerpent and redLionfishKimi pass explicit `bone` overrides.
- **Cause:** `src/sweep.ts:487-491` stores only `weightAt(0)` in a `Path`; `src/path.ts:33-43` has one path weight and `src/membrane.ts:113-121` reuses it for every vertex.
- **Fix:** retain per-sample line weights and interpolate them in membrane columns, while retaining explicit `bone` fallback.
- **Repro:** `experiments/astra-hunt/repros/hunt-membrane/hunt-membrane-lines.ts`.

### Fix paint/geometry and rigging in audited shipped samples

- **Ids:** AUDIT-AMIGURUMINARWHAL, AUDIT-BARNOWL, AUDIT-BLACKSMITHFORGEASTRA, AUDIT-BRUTALISTRADAR, AUDIT-CENTAURHOOVES, AUDIT-CENTAURBOW, AUDIT-CHIBIVISOR, AUDIT-BRASSDIVERJAW, AUDIT-CODEXJAW, AUDIT-EMPERORFEET, AUDIT-GBCSLIME, AUDIT-GIANTANTEATER, AUDIT-HAMMERHEADFIN, AUDIT-LIZARDFEET, AUDIT-LIZARDJAW, AUDIT-MIMICJAW, AUDIT-NESGOBLINFACING, AUDIT-NESYETILEGS, AUDIT-ORIGAMIHORNS, AUDIT-PS1MECH, AUDIT-REDLIONFISHFLOOR, AUDIT-SNESLEGS, AUDIT-SPACEMARINEBLADE, AUDIT-VOXELTAIL, AUDIT-WITCHROOF, AUDIT-VOXELNECK, AUDIT-WARTHOGWARTS, AUDIT-DESKLAMPSWITCH
- **Severity:** P0
- **Verdict:** confirmed sample-local failures; fix samples rather than adding SDK workarounds.
- **Symptom:** amigurumiNarwhal has no lower jaw/jaw joint; barnOwl toes hover 13 mm; blacksmithForgeAstra’s blade is suspended with a 42.4 mm loose root; brutalistWalkerFortress radar is 406.5 mm/85.2 mm from body; centaurArcher hooves are 148–151 mm away and bow is 52.5 mm from arm; chibiMechPilot visor floats 19.0 mm; brassDiver has no jaw; codexJaguarWarrior lower jaw is unreadable; emperorPenguin feet are 42 mm away; gbcSlimeKing crown/cape/sword/mouth gaps are 22/75/62/11 mm; giantAnteater eyes/paws are 11/20 mm away; hammerhead dorsal fin is 48 mm away; lizardfolkHunter shoulders are 23.1 mm away and its jaw is hidden; mimicHermitCrab has no jaw; nesGoblinShaman faces backward; nesYeti has four legs instead of a biped’s two; origamiDragon horns are 48–54 mm away; ps1Mech has 609/403/131/130 mm arm/weapon gaps and 61–65 mm torso gaps; redLionfishAstra floats 255 mm and its brow filaments cross the face; snesRedDragon leg roots are 211–333 mm away; spaceMarine blade is 233.6 mm away; voxelWolf tail tip is 12 mm away and neck is rigid on the parent; witchCottageDiorama roof gap reaches 270 mm; warthogAstra warts are 10–14 mm away; articulatedDeskLamp switch is 16.7 mm away.
- **Samples hit:** the sample names in the symptom list above.
- **Cause:** sample-local fixed world positions, incorrect bone-local/model-space mixing, missing jaw construction, or missing bridges; exact causes are in the corresponding audit reports (for example `samples/centaurArcher.ts:185-190,333-341`, `samples/ps1Mech.ts:308-331`, `samples/spaceMarine.ts:812-835`, `samples/witchCottageDiorama.ts:157-164`).
- **Fix:** derive attachments from host surface/frame hits, overlap or bridge adjacent meshes, put model-space geometry at `at:[0,0,0]` when using a bone, add readable jaw chains, correct facing/roles, and bind neck/weapon parts to the moving child joint.
- **Repro:** current sample snapshots and report-only/preview commands cited in `scratch/astra-reports/audit-*.md` and `audit-*-second.md`.

## Then

### Keep explicit chain tips useful for terminal attachments

- **Ids:** QUAD-1
- **Severity:** P1
- **Verdict:** confirmed; the explicit tip is omitted from sweep weights.
- **Symptom:** after a 35° `hindLPaw` pose, the paw axis changes but terminal claw and tube centres are bit-identical; preview reports claw `hindLAnkle 100%` and tube `hindLAnkle 40%, hindLKnee 32%, hindLHip 28%`, never `hindLPaw`.
- **Samples hit:** quadruped repro only; the docs-shaped fox/dog model otherwise had 13 parts/1,096 triangles and overlapping legs.
- **Cause:** `src/sweep.ts:618-642` weights from `chain.spanJoints`; `src/skeleton.ts:197-203` keeps the explicit tip outside `spanJoints`.
- **Fix:** expose the tip in terminal sweep weights/caps, or document that tip-only poses require attaching from `chain.tip` directly.
- **Repro:** `experiments/astra-hunt/repros/hunt-quadruped/hunt-quadruped-pose.ts`.

### Correct fractional path knots and closed two-point paths

- **Ids:** PATH-3, PATH-5
- **Severity:** P1
- **Verdict:** confirmed.
- **Symptom:** a two-point closed polyline throws “3 when closed”; a 100° arc reports knots at `0,.333,.667,1` instead of 0/45/90/100°, and a 1.15-turn spiral reports `.0,.2,.4,.6,.8,1` instead of quarter-turn marks.
- **Samples hit:** no shipped sample uses two-point closed paths or default knot stations on fractional arc/spiral inputs.
- **Cause:** `src/path.ts:315-317` requires three distinct closed points; `:365-366,408-409` passes span counts to `smoothPath`, which redistributes samples by chord length.
- **Fix:** permit two distinct closed points (or explicitly change the contract), and build explicit 45°/90° sample indices then convert their cumulative distance to arc-length knots.
- **Repro:** `experiments/astra-hunt/repros/hunt-path/hunt-path-probe.ts`; `.../hunt-path/hunt-path-knots.ts`.

### Reject invalid limb inputs and preserve tiny reachable targets

- **Ids:** IK-1, IK-2
- **Severity:** P1
- **Verdict:** confirmed.
- **Symptom:** with lengths `[1,1]`, target distance `2e-9` ends within `2.88e-16`, but distance `1e-9` ends at `-1.000000205e-9` (error `2.000000205e-9`). Empty lengths and NaN/Infinity entries produce NaN points; `[-1]` silently creates a positive-length segment.
- **Samples hit:** none.
- **Cause:** `src/ik.ts:99-100` switches to `-Y` for every `d<=1e-9`; `:76-80,118-120` never validates non-empty finite positive lengths.
- **Fix:** use the normalized target direction for every `d>0`, reserve fallback for `d===0`, and reject empty/non-finite/non-positive lengths with a named `limb()` error.
- **Repro:** `experiments/astra-hunt/repros/hunt-ik/hunt-ik-tiny.ts`; `.../hunt-ik-scenarios.ts`; `.../hunt-ik-edge.ts`.

### Fix the remaining sample-specific P1/P2 visual defects

- **Ids:** AUDIT-JUNIPERWIRE, AUDIT-MARGINALIAMOUTH, AUDIT-NESYETIMASK, AUDIT-REDLIONFISHBROWS, AUDIT-SPACE-MARINE-TEETH, AUDIT-UKIYOEKAPPASTUDS, AUDIT-VGATABARD, AUDIT-WARTHOGEARS, AUDIT-WARTHOGGEMINIROLES, AUDIT-WARTHOGGEMINIZEROJOINTS, AUDIT-TOONFENNECWHISKERS
- **Severity:** P1 (the wire is P2; all others P1)
- **Verdict:** confirmed sample-local polish/rig defects.
- **Symptom:** juniperBonsai training wire uses 684 triangles at 4 mm mean edge; marginaliaSnailKnight’s jaw/muzzle is unreadable; nesYeti’s face mask rides high; redLionfishAstra brow tentacles look like crossed antlers; spaceMarine teeth sit 94.3 mm below the blade; ukiyoeKappa studs gap 4.5–12.1 mm; vgaSkeletonWarrior tabard strap gaps 13 mm; warthogOx ears are oversized discs; warthogGemini front limbs are typed as arms and shoulder/knee joints coincide; toonFennec whiskers gap 3–7 mm.
- **Samples hit:** named in the symptom list.
- **Cause:** sample-local detail density, fixed offsets, wrong role assignment, or duplicate shoulder/chain roots; see the relevant `samples/*.ts` lines in audit-d and audit-i/j reports.
- **Fix:** simplify wire tessellation, enlarge/reseat face parts, derive studs/whiskers from surface hits, move teeth to the blade edge, seat the tabard, redesign ears, set quadruped roles to `leg`, and remove duplicate zero-length shoulder joints.
- **Repro:** latest sample snapshots and report-only gaps in `scratch/astra-reports/audit-d.md`, `audit-i.md`, `audit-i-second.md`, `audit-j.md`, `audit-j-second.md`, and `audit-h2-second.md`.

### Validate builder, frame, sweep, loft, and distribution edge arguments

- **Ids:** FRAMEMATH-2, LOFTSUGAR-1, LOFTSUGAR-2, DISTRIBUTE-2, SWEEPCORE-4, BUILDER-1, BUILDER-3
- **Severity:** P1 for the coincident-line case; P2 for the rest
- **Verdict:** confirmed invalid-input/diagnostic defects.
- **Symptom:** coincident `line()` endpoints leak `aim(): zero-length direction`; one-station loft leaks a CatmullRom `TypeError`; repeated stations leak a polyline distinct-point error; fractional counts truncate (`ring 2.5` creates two items at t=0,.4); empty radius profile leaks `Cannot read properties of null`; `detail:Infinity` later throws invalid array length; malformed builder literals report generic `toPoint`, `polyline`, `p.clone`, or operator errors instead of the called helper.
- **Samples hit:** none; all are edge authoring inputs.
- **Cause:** `src/frame.ts:121-125`, `src/sugar.ts:78`, `src/path.ts:317-349`, `src/distribute.ts:75-187`, `src/sweep.ts:222-225`, `src/context.ts:159-166`, and wrapper conversion paths do not validate at public boundaries.
- **Fix:** choose documented zero-length line behavior, validate station/count/radius/detail domains, and thread helper/argument labels through converters.
- **Repro:** `experiments/astra-hunt/repros/hunt-framemath/hunt-framemath-linezero.ts`; `.../hunt-loftsugar/hunt-loftsugar-loft-edges.ts`; `.../hunt-distribute/hunt-distribute-basics.ts`; `.../hunt-sweepcore/hunt-sweepcore-radius-edge.ts`; `.../hunt-builder/hunt-builder-detail.ts`; `.../hunt-builder/hunt-builder-errors.ts`.

### Validate snap/sheet CLI boundaries and output identity

- **Ids:** TOOLING-1, DOCS-4, TOOLING-3, TOOLING-4, TOOLING-5, TOOLING-6
- **Severity:** P1 for slug, floor, tag and collision cases; P2 for sheet columns
- **Verdict:** confirmed tooling contract defects.
- **Symptom:** `snap` rejects documented hyphenated scratch paths; exact `min y=.005 m` produces no floor warning; a second positional tag is silently ignored; same-basename preview/snap paths overwrite one another; `sheet --cols nope` exits successfully and writes a misleading default-column sheet.
- **Samples hit:** no shipped sample is corrupted by the path/tag cases; oldFisherman is the repro for invalid `--cols`.
- **Cause:** `harness/snap.ts:38` rejects hyphens; `harness/assemble.ts:489-495` uses strict `>`; `scripts/snap.ts:29` drops extra args; `scripts/preview.ts:65,180` and `scripts/snap.ts:34-44` key only by basename; `scripts/sheet.ts:33-34,64` does not validate finite integer-positive columns.
- **Fix:** align slug validation with path workflow, use `>=.005`, reject extra positional args, derive a collision-resistant slug or reject source mismatch, and validate `--cols` before ImageMagick.
- **Repro:** `experiments/astra-hunt/repros/hunt-tooling/hunt-tooling-floor.ts`; `.../hunt-tooling/floorboundary.ts`; `.../hunt-tooling/a/collision.ts` and `b/collision.ts`; `npm run sheet -- oldFisherman --cols nope`.

### Keep zero direction, zero slice, short paths, and huge IK numeric-safe

- **Ids:** FRAMEMATH-3, PATH-1, PATH-2, IK-3
- **Severity:** P2
- **Verdict:** confirmed.
- **Symptom:** `offset(p,[0,0,0],2)` silently returns p; `slice(.5,.5)` exposes `[NaN,NaN]` knots and NaN position; 1e-9 m paths are rejected while 1e-8 m paths work; IK lengths `1e308` collapse to three coincident points.
- **Samples hit:** none.
- **Cause:** `src/math.ts:65-66` normalises zero without checking; `src/path.ts:150-184,255-256,309-317` divides zero-length slices and uses absolute tolerances; `src/ik.ts:30-32,118-120` overflows raw sums/hypot.
- **Fix:** reject zero directions/slices clearly, use scale-relative or exact duplicate rules, and solve large IK inputs in a scaled range or reject unsafe magnitudes.
- **Repro:** `experiments/astra-hunt/repros/hunt-framemath/hunt-framemath-offsetzero.ts`; `.../hunt-path/hunt-path-probe.ts`; `.../hunt-path/hunt-path-short.ts`; `.../hunt-ik/hunt-ik-huge.ts`.

### Keep `SproutResult.chain` and `Chain.tip` statically useful

- **Ids:** DISTRIBUTE-3, SKELETON-3
- **Severity:** P1
- **Verdict:** confirmed type-level contract friction.
- **Symptom:** `sprout({count:2}).chain.at(0)` fails TypeScript with `TS18047` even though runtime returns `tail1,tail2`; `Chain.tip` remains nullable when `names` has spans+1 entries and runtime always creates the tip.
- **Samples hit:** positive-count sprout callers in many shipped samples; the nullable tip case is a repro/authoring friction, not a discovered render failure.
- **Cause:** `src/sugar.ts:118-138` exposes one `Chain|null` return shape; `src/skeleton.ts:200,304-313` does not narrow `tip` from statically known names.
- **Fix:** add overloads/conditional result types for count 0 versus positive/omitted counts and for statically spans+1 names; retain nullable types for dynamic inputs.
- **Repro:** `experiments/astra-hunt/repros/hunt-distribute/hunt-distribute-nullability.ts`; `scratch/hunt-skeleton/hunt-skeleton-roots.ts`.

### Correct the clockwork coil endpoint and raw texture/atlas edge cases

- **Ids:** KITS-1, KITS-2, BAKE-1, BAKE-2
- **Severity:** P1 for coil and custom-weight inputs; P2 for metal size and atlas overflow
- **Verdict:** confirmed.
- **Symptom:** `coil([0,0,0],[0,1,0],.1,3)` starts/ends at `[-.1,0,0]`/`[-.1,1,0]`, missing both attachments by one radius; custom weights `[1.25,.75]` sum to 2 and move a bind vertex `[.1,.1,.1]` to `[.2,.2,.2]`; `metal(size:0)` returns `[NaN,NaN,NaN]`; 60,000 unique 1×1 textures make atlas packing hang past 8 seconds.
- **Samples hit:** no shipped sample uses these exact kit/custom-weight/atlas inputs.
- **Cause:** `kits/clockwork.ts:649-654` offsets the helix; `harness/assemble.ts:435-450` copies weights without validation/normalisation; `kits/clockwork.ts:79-84` divides noise by unchecked size; `harness/atlas.ts:206-215` retries forever after tiles stop shrinking.
- **Fix:** lead coil endpoints to a/b or taper radius; validate/normalise or reject custom influences; require positive finite metal size; detect minimum-tile no-progress and throw atlas overflow.
- **Repro:** `experiments/astra-hunt/repros/hunt-kits/hunt-kits-clockwork.ts`; `.../hunt-kits/hunt-kits-kits-edge.ts`; `.../hunt-bake/hunt-bake-weights.ts`; `.../hunt-bake/hunt-bake-atlas-overflow.ts`.

## Polish

### Document intended surface, path, role, and material behaviour

- **Ids:** SURFACE-2, SKELETON-2, BUILDER-2, PATH-4, SWEEPSKIN-3
- **Severity:** P2/docs gap or intended behavior
- **Verdict:** intended/documentation gap, not an untracked SDK regression.
- **Symptom:** `drape()` deliberately carries only the first hit's weights, so a multi-bone strap can remain rigid (the repro gap after posing is `0.110935 m`); `Role` intentionally has no pelvis/foot; builder types intentionally come from owning modules; curve lengths/queries use sampled chord polylines (full-circle relative error `-0.0002031`, sharp cubic position error `.0468951 m`); a generic sweep's round root cap reaches x=.6428 versus .5511 with `caps:none`, because seated-root burial belongs to `sprout`.
- **Samples hit:** drape limitation is visible-risky in amigurumiNarwhal, dreadKnight, lifeguardSculpt, orcBerserkerOx/Sonnet and sprinterSculpt; direct generic cap usage is present in alebrijeJaguar, artDecoFalcon, barnOwl, biomechSwarmQueen, blossomDeer, brassDiver, chibiKnight, chibiMechPilot, centaurArcher, clockworkOwl, dreadKnight and flowerHedgehog.
- **Cause:** `src/surface.ts:229-240`; role and owning-module contracts in `docs/api.md`; sampled implementation in `src/path.ts:255-305`; generic cap construction in `src/sweep.ts:805-840`.
- **Fix:** state first-hit/explicit-bone and `sprout` burial requirements; explain pelvis/foot encoding; state owning-module imports; document sampled chord accuracy.
- **Repro:** `experiments/astra-hunt/repros/hunt-surface/hunt-surface-drape-pose.ts`; `.../hunt-path/hunt-path-accuracy.ts`; `.../hunt-sweepskin/hunt-sweepskin-legcap.ts`.

### Reject surplus `sole` hints and preserve zero-thickness/degenerate query diagnostics

- **Ids:** IK-4, SURFACE-3
- **Severity:** P2
- **Verdict:** confirmed edge diagnostics.
- **Symptom:** `sole` accepts and silently discards an extra hint; `surface.nearest()` on an all-degenerate mesh throws `Cannot read properties of undefined (reading 'userData')` while `ray()` returns null.
- **Samples hit:** none.
- **Cause:** `src/ik.ts:81-95` checks only too-few hints; `src/surface.ts:178-196` calls `hit(-1, point)` without a no-triangle guard.
- **Fix:** require exactly the documented hint count and choose/document a consistent null or named no-surface error.
- **Repro:** `experiments/astra-hunt/repros/hunt-ik/hunt-ik-scenarios.ts`; `.../hunt-surface/hunt-surface-edge.ts`.

### Remove duplicate geometry in the low-poly mechanical samples

- **Ids:** AUDIT-CLOCKWORKAUTOMATON, AUDIT-CLOCKWORKCAROUSEL, AUDIT-CLOCKWORKCROCODILE, AUDIT-CLOCKWORKSTAG
- **Severity:** P2
- **Verdict:** confirmed budget polish.
- **Symptom:** fine meshes consume 31,692/30,288/19,896/31,076 triangles respectively (overall totals 45,922/45,996/33,092/44,826), dominated by tiny gears, bolts, scutes, collars and ornaments.
- **Samples hit:** clockworkAutomaton, clockworkCarousel, clockworkCrocodile, clockworkStag.
- **Cause:** high segment/detail settings in each sample's tiny mechanical parts.
- **Fix:** lower tessellation on the listed details while retaining silhouette-critical faces, jaws, limbs and readable decorations.
- **Repro:** latest `samples/clockwork*.ts` snapshots and `v03-report.json` files in the audit-B evidence.

## Docs fixes

- `docs/api.md:79`: remove nonexistent `kit.rng(seed)` and document `rng` from `../src/math` only (DOCS-6).
- `docs/api.md:86-92,369`: replace absolute checkout imports with `../src/...`, and state snippets are relative to `samples/<slug>.ts` (DOCS-2).
- `GUIDE.md:21`: state “120k triangles hard limit, 60k soft budget” (DOCS-3).
- `GUIDE.md:35-51`, `scripts/snap.ts:34-36`, `harness/snap.ts:38`: accept/sanitize hyphenated scratch slugs consistently and reject extra positional tags.
- `docs/api.md:151`: distinguish smooth welded capless closed seams from corner-seam closed polylines with overlapping round caps (DOCS-1).
- `docs/api.md:180-187`: replace bare expression ellipses with valid spread-array/intermediate-array TypeScript (DOCS-5).
- `docs/api.md:135`: state that curve paths use sampled chord polylines and their accuracy/detail guarantee.
- `docs/api.md:139,151`: either document the three-distinct-point closed-polyline minimum or change the contract to permit the two-point case.
- `docs/api.md:142-144`: describe fractional arc/spiral knot marks as actual angular stations and document the corrected behavior.
- `docs/api.md:219`: require a non-empty finite radius profile for `sweep`.
- `docs/api.md:228-232`: state the chosen sector-boundary and colour-band seam tessellation/shading policy.
- `docs/api.md:240` and `docs/STATUS.md:262`: state the actual `sweep.at()` surface error or update implementation to meet the 3–5 mm expectation.
- `docs/api.md:275`: state loft needs at least two distinct stations and define repeated-centre handling.
- `docs/api.md:282-284`: provide conditional `sprout` chain typing and explicitly describe count 0.
- `docs/api.md:305`: retain the documented first-hit drape limitation and recommend an explicit chain/bone for pose-safe multi-span straps.
- `docs/api.md:343-351`: require positive membrane/slab thickness and state crossing-edge rejection.
- `docs/api.md:439,459`: define numeric RGB tuples versus colour lists and metadata for raw coloured textures.
- `docs/api.md:459,498,612` and `docs/conventions.md:153`: state near-grey classification, decal missed-ray clipping, and facet/flat-shading policy.
- `docs/api.md:517,523,544-552`: require positive finite limb lengths, define tiny/coincident target behavior, and reject or explicitly document surplus `sole` hints.
- `docs/api.md:569-570`: replace unqualified “counter-clockwise” with the right-hand/viewing rule and +Z/+Y examples (DISTRIBUTE-1).
- `docs/api.md:75,163-176`: state one-root rejection, tip typing, and that terminal sweep attachments use the explicit tip frame when a tip-only pose is required (SKELETON-1).
- `docs/api.md:108-131`: document moved-frame orientation preservation, coincident-line behavior, and zero-direction offset rejection.
- `docs/api.md:376-387`: define pole handling for axis-closing lathes, self-fitting bevel clearance, and zero-thickness knife edges.
- `kits/clockwork.md:231-237`: define whether `coil` includes attachment lead-ins and require positive finite `metal.size`.
- `docs/conventions.md:185-189`: state atlas overflow behavior and a prompt failure/limit.
- `docs/api.md:77` and custom-mesh export docs: state that custom skin weights are validated/normalised or rejected.
- `docs/api.md:163-165`: explain why pelvis/foot are represented by spine roots and leg/arm tips.
- `docs/api.md:369`: state that `src/builder` intentionally re-exports only `OutlinePoint`; other public types come from owning modules.

## Known issues re-confirmed

- The documented sweep surface-query limitation remains measurable at 16.72–18.08 mm, above the stated 3–5 mm target.
- `surface(joint)` still misses a smooth chain mesh registered only under its heaviest/first span joint; querying the joint throws “no meshes in targets”.
- `Hit` still has no tangent field (`hit.tangent === undefined`).
- `Chain.tip` is still nullable despite a names array that guarantees a runtime tip.
- The snap report still has the double-baking limitation; no source fix was attempted.
- Round-cap paint coordinates still collapse along the cap: all 26,080 cap samples had `s[0]` exactly 0 or 1.
- Surface drape still risks nearest-projecting across a tucked/open torus belly edge; the repro follows different portions of the body through the cavity.
- The 5 mm floor-boundary check still omits equality (`min y=.005` produces no warning).

## Not reproduced

- No new defect in the armed biped combination: sword grip gap `2.62e-16 m`, decal vertices finite, strap remained within 18.63 mm of the posed torso.
- No new styled-kit, mechanical-helper, winged, serpent-chain, blob, ordinary contour, ordinary skeleton, IK reachable-case, cards/regions, atlas deduplication, paint determinism, or surface ray/nearest defect in covered normal inputs.
- Identical SVG and pixel textures still deduplicate to one atlas tile; no atlas growth defect was reproduced in ordinary use.
- Ordinary texture options, decal directions and slanted-plane lift remained correct; the failures are the listed warm-grey/raw-texture/edge cases.
- No SDK-wide pattern was found in the sample audits; clean samples included the corrected synthwaveHoverbike hover, all audit-E second-look samples, and the current samples whose count drift was only tessellation.
