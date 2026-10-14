# Audit group c

## curiosityJackalope — latest v03; current: typecheck clean, report-only same (94 parts, 7,598 triangles, 24 joints, bounds 0.34 × 0.851 × 0.444 m; 0 issues)
- Verdict: clean (checked sheet, head close-up, skeleton, and both flex shots: four readable limbs, separate jaw, attached antlers/whiskers, and no visible tears or floor violation)

## cyberpunkNoodleStall — latest v07; current: typecheck clean, report-only same (129 parts, 5,042 triangles, 8 joints, bounds 1.44 × 1.351 × 1.07 m; 0 issues)
- Verdict: clean (checked sheet, all sides, skeleton, and flex shots: stall frame, counter, stools, sign, lanterns, robot arms, and vending machine remain readable and attached; no creature jaw requirement applies)

## delftWindmillDiorama — latest v04-sdk; current: typecheck clean, report-only same (166 parts, 9,972 triangles, 12 joints, bounds 1.217 × 0.872 × 1.214 m; 0 issues)
- Verdict: clean (checked sheet, head close-up, skeleton, and flex shots: four sails, canal/bridge/boat, farmhouse, trees, milkmaid, and both cows read clearly with no visible detachments)

## dieselpunkWarElephant — latest v05-sdk; current: typecheck clean, report-only same (115 parts, 8,192 triangles, 31 joints, bounds 2.577 × 4.46 × 4.595 m; 0 issues)
- Verdict: clean (checked sheet, head close-up, skeleton, and both flex shots: four legs, trunk, paired tusks, separate jaw, turret/cannon, armor plates, and crates stay attached and readable)

## dosBasilisk — latest v03; current: typecheck clean, report-only same (150 parts, 3,908 triangles, 82 joints, bounds 1.542 × 1.841 × 3.161 m; 0 issues)
- Verdict: clean (checked sheet, head close-up, skeleton, and both flex shots: six legs, open upper/lower jaw, tongue, frill, dorsal spines, and venom drops read as intentional dripping effects; no contract fault visible)

## dreadKnight — latest v03; current: typecheck clean, report-only same (229 parts, 13,978 triangles, 80 joints, bounds 2.456 × 2.261 × 1.116 m; 0 issues)
- Verdict: clean (checked sheet, head close-up, skeleton, and both flex shots: horned helm, separate jaw joint, two arms/legs, sword in hand, layered armor, and cape all remain readable; the rigid gold cape yoke is intentionally chest-bound and no visible cape tear appears)


## dromedaryCaravan — latest v02; current: typecheck clean, report-only same (149 parts, 10,608 triangles, 45 joints, bounds 1.385 × 2.649 × 3.411 m; 0 issues)
- Verdict: clean (checked sheet, head close-up, skeleton, and both flex shots: four legs, two humps, separate jaw/muzzle, harness, packs, tail, and ground lead rope are readable; the rope's floor loop is intentional)

## eggshellDragonling — latest v02; current: typecheck clean, report-only same (131 parts, 11,006 triangles, 44 joints, bounds 0.652 × 0.501 × 0.648 m; 0 issues)
- Verdict: clean (checked sheet, head close-up, skeleton, and both flex shots: separate jaw, four limbs, wings, tail, shell halves, and scattered shell fragments all read as intentional; no visible detached required anatomy)

## emperorPenguin — latest v03; current: typecheck clean, report-only same (40 parts, 2,224 triangles, 26 joints, bounds 1.27 × 1.109 × 0.674 m; 0 issues)
- Verdict: needs fix
- [P0] Both webbed feet are visibly detached below the legs — evidence: `v03-front.png` shows each black foot separated by a clear gap from the lower body/leg, and report-only lists `sweep.legL.4` and `sweep.legR.4` 42 mm from `body` — cause: `samples/emperorPenguin.ts:354-394` ends the leg sweep at `footTarget` while the toe chains start at the separately placed `footBasePt` (`:356`, `:397-425`) — fix: make the tarsus/foot chain and toe geometry overlap the body-connected lower leg, then verify both feet touch the leg mesh while retaining ground contact.

## feltPlushSloth — latest v07; current: typecheck clean, report-only same (63 parts, 11,464 triangles, 44 joints, bounds 1.102 × 1.422 × 0.822 m; 0 issues)
- Verdict: clean (checked sheet, head close-up, skeleton, and both flex shots: four grasping limbs attach around the overhead bar, face/jaw read, and the hanging pose is intentional and stable)

## flowerHedgehog — latest v03; current: typecheck clean, report-only same (271 parts, 15,352 triangles, 24 joints, bounds 0.306 × 0.225 × 0.34 m; 0 issues)
- Verdict: clean (checked sheet, head close-up, skeleton, and both flex shots: four legs, visible eyes, separate jaw, quills, and dense flower crown remain readable; 271 parts/15,352 triangles/39 colours stay within budget)

## flyingFox — latest v03; current: typecheck clean, report-only same (91 parts, 6,574 triangles, 36 joints, bounds 1.508 × 0.676 × 0.524 m; 0 issues)
- Verdict: clean (checked sheet, head close-up, skeleton, and both flex shots: bat head/ears, separate jaw, two wings with fingers and membranes, and hind limbs remain attached; no visible tears)

## gameboyFrog — latest v03; current: typecheck clean, report-only same (71 parts, 5,424 triangles, 67 joints, bounds 0.303 × 0.154 × 0.306 m; 0 issues)
- Verdict: clean (checked sheet, head close-up, skeleton, and both flex shots: four limbs, eyes, separate open jaw, tongue, toes, and pixel-pad base read clearly with no visible detachments)

## gbcSlimeKing — latest v03; current: typecheck clean, report-only same (25 parts, 624 triangles, 14 joints, bounds 1.208 × 1.238 × 0.616 m; 0 issues)
- Verdict: needs fix
- [P0] Crown, cape, swallowed sword/treasure, and mouth decals visibly float off the slime — evidence: `v03-head.png` shows a gap under the crown and detached purple cape; report-only measures `crownBand` 22 mm, `royalCape` 75 mm, `swallowedSwordHilt` 62 mm, and `upperMouth` 11 mm from the body — cause: `samples/gbcSlimeKing.ts:126-150` and `:171-199` use hard-coded world positions for the cape, crown, face planes, and treasure rather than seating them on the body/head surface — fix: derive each attachment from `body`/`head` frames or surface hits, move treasure inward into the jelly, and seat crown, cape root, and mouth planes against the intended volume.

## giantAnteater — latest v08-lowpoly; current: typecheck clean, report-only same (65 parts, 3,088 triangles, 32 joints, bounds 0.605 × 1.494 × 2.917 m; 0 issues)
- Verdict: needs fix
- [P0] Eyes and several paw blocks visibly float away from their host meshes — evidence: `v08-lowpoly-head.png` shows both yellow eyes suspended off the wedge head; report-only lists head eye parts 11 mm from the head and front-leg pieces 20 mm from their leg sweeps, while the sheet shows brown paw blocks separated from legs — cause: `samples/giantAnteater.ts:133-170` places paws at `front.at(1).at`/`hind.at(1).at` with separate frustum boxes, and `:214-226` places eye spheres at fixed offsets that do not meet the loft surface — fix: seat eyes and paw blocks from `surface(...).nearest`/`Hit.moved` frames or overlap their offsets with the host sweeps.

## gingerbreadGolem — latest v03; current: typecheck clean, report-only same (96 parts, 5,938 triangles, 17 joints, bounds 1.56 × 2.412 × 0.552 m; 0 issues)
- Verdict: clean (checked sheet, head close-up, skeleton, and both flex shots: humanoid two-arm/two-leg anatomy, separate jaw, icing rails, candy details, and held canes remain attached and readable)

## giraffe — latest v03; current: typecheck clean, report-only same (31 parts, 1,948 triangles, 30 joints, bounds 0.79 × 5.261 × 3.718 m; 0 issues)
- Verdict: clean (checked sheet, head close-up, skeleton, and both flex shots: four legs, long neck, ossicones/ears, mane, tail, tongue, and separate jaw read correctly with feet on the floor)

## goldenPheasant — latest v10-lowpoly; current: typecheck clean, report-only same (116 parts, 12,348 triangles, 27 joints, bounds 0.729 × 0.4 × 1.02 m; 0 issues)
- Verdict: clean (checked sheet, head close-up, skeleton, and both flex shots: two legs, wings, beak/jaw, crest, patterned body, and long signature tail remain attached and readable; 116 parts/12,348 triangles/8 colours stay within budget)

## SDK patterns
- No shared SDK defect was isolated. The actionable faults above are sample-specific hard-coded attachment/weighting issues.
