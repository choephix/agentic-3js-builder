# Audit group i

## stainedGlassMoth — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Clean — evidence: `snaps/stainedGlassMoth/B/snaps/v03-sheet.jpg` and `v03-head.png`; six legs, four separated wings, paired antennae and a readable proboscis are attached and move coherently in `v03-flex-a.png`/`v03-flex-b.png`; report bounds y = 0.001 m and 95 parts / 12,684 triangles / 37 joints are within contract.

## steamLocomotive — latest v02; current: typecheck clean, report-only same
- Verdict: clean
- Clean — evidence: `snaps/steamLocomotive/B/snaps/v02-sheet.jpg`; the engine has the expected 2-6-0 wheel arrangement, track, rods, tender and smoke plume, with no detached rolling stock or floating structural parts; report bounds min y = 0 and 170 parts / 12,690 triangles are within budget.

## stegosaurus — latest v10-lowpoly; current: typecheck clean, report-only same
- Verdict: clean
- Clean — evidence: `snaps/stegosaurus/B/snaps/v10-lowpoly-sheet.jpg` and `v10-lowpoly-head.png`; four planted legs, separate open lower jaw, beaked head, two rows of dorsal plates and four tail spikes are readable, and both flex shots retain the body/leg/plate attachment; report issues are empty and counts are 436 parts / 19,064 triangles / 32 joints.

## strawberryBunny — latest v02; current: typecheck clean, report-only same
- Verdict: clean
- Clean — evidence: `snaps/strawberryBunny/B/snaps/v02-sheet.jpg` and `v02-head.png`; four limbs, long paired ears, separate toothed jaw, held berry basket and fluffy tail are all present and attached; feet reach the floor (bounds min y = 0) and the 75-part / 4,668-triangle build is within budget.

## sushiCat — latest v02; current: typecheck clean, report-only same
- Verdict: clean
- Clean — evidence: `snaps/sushiCat/B/snaps/v02-sheet.jpg` and `v02-side.png`; the curled cat reads with paired forepaws, rear limbs/tail, ears, face and separate jaw while remaining seated on the rice block and board; min y = -0.004 m is within the 2%-of-height floor allowance, and report issues are empty.

## synthwaveHoverbike — latest v08-sdk; current: typecheck clean, report-only same
- Verdict: needs fix
- [P0] Hoverbike floats 300 mm above the floor — evidence: current report-only warning and `snaps/synthwaveHoverbike/B/snaps/v08-sdk-sheet.jpg` side/low views; measured bounds min y = 0.300 m while the guide requires ground contact — cause: `samples/synthwaveHoverbike.ts:25` chassis origin and pad geometry at lines 152-172 leave the lowest white-hot pad core at y = 0.30 — fix: lower the complete pad/strut assembly by 0.30 m (including the connecting strut, pad body, glow ring and core) so the lowest pad touches y = 0 without moving the fairing.

## teapotDragon — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Clean — evidence: `snaps/teapotDragon/B/snaps/v03-sheet.jpg` and `v03-head.png`; four clawed feet, separate open lower jaw with teeth/tongue, two wings, curled handle tail and lid crest are readable; feet touch y = 0, and both flex shots preserve the appendages.

## tentacleSerpent — latest v02-lowpoly; current: typecheck clean, report-only same
- Verdict: clean
- Clean — evidence: `snaps/tentacleSerpent/B/snaps/v02-lowpoly-sheet.jpg` and `v02-lowpoly-head.png`; the long serpent body, six head tentacles, tusk, frill and separate lower jaw are all present with coherent attachment in both flex shots; min y = -0.005 m is within the 2%-of-height allowance and counts are 78 parts / 4,288 triangles / 49 joints.

## tinToyCrab — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Clean — evidence: `snaps/tinToyCrab/B/snaps/v03-sheet.jpg`; eight strip legs, two openable pincer upper/lower jaws, eyestalks, wind-up key and paired claws are all visible and attached across front, side, top and flex views; min y = 0 and 106 parts / 5,310 triangles are within budget.

## tinToyDragon — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Clean — evidence: `snaps/tinToyDragon/B/snaps/v03-sheet.jpg` and `v03-head.png`; four feet/wheels, hinged wings, concertina neck/tail, separate open jaw with tongue/flint, and the independent wind-up key all remain attached in front, side and flex views; min y = 0 and the 148-part / 6,774-triangle build is within budget.

## toonFennec — latest v03; current: typecheck clean, report-only same
- Verdict: needs fix
- [P1] Several ink whisker strokes visibly float off the cheek/muzzle — evidence: `snaps/toonFennec/B/snaps/v03-head.png` shows the lower cheek whiskers ending with visible gaps, corroborated by report-only loose parts `sweep.head.9/.10/.13/.14` at 3–7 mm — cause: `samples/toonFennec.ts:287-295` starts the whisker sweeps from fixed points instead of a surface hit on the muzzle — fix: anchor each whisker start to a muzzle/skull surface hit (or move the fixed start points inward by the measured 3–7 mm) while keeping the whisker tips unchanged.

## toonRedPanda — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Clean — evidence: `snaps/toonRedPanda/B/snaps/v03-sheet.jpg` and `v03-head.png`; four legs with toes, separate open jaw, large paired eyes/goggles, backpack/bedroll and banded tail are attached and readable from every angle and both flex shots; bounds min y = -0.001 m is within floor allowance and report issues are empty.

## treehouseDiorama — latest v02; current: typecheck clean, report-only same
- Verdict: clean
- Clean — evidence: `snaps/treehouseDiorama/B/snaps/v02-sheet.jpg`; the oak, elevated house, roof, ladder, rope bucket/pulley, tyre swing, bike, sign and flowered mound are all present and attached/grounded in front, side, top and both flex views; bounds min y = 0 and 368 parts / 21,099 triangles / 59 colours stay within limits.

## triceratops — latest v07-lowpoly; current: typecheck clean, report-only same
- Verdict: clean
- Clean — evidence: `snaps/triceratops/B/snaps/v07-lowpoly-sheet.jpg` and `v07-lowpoly-head.png`; four pillar legs, separate open lower jaw, beak, two brow horns, display frill and tail are correctly placed and remain coherent in both flex shots; min y = -0.001 m is within allowance and report issues are empty.

## tyrannosaurus — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Clean — evidence: `snaps/tyrannosaurus/B/snaps/v03-sheet.jpg` and `v03-head.png`; the two tiny two-fingered arms, two planted hind legs, long counterbalancing tail, deep separate jaw and teeth all read correctly from front/side/head/flex views; bounds min y = 0 and counts are 80 parts / 3,744 triangles / 44 joints.

## ukiyoeKappa — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Clean — evidence: `snaps/ukiyoeKappa/B/snaps/v03-sheet.jpg` and `v03-head.png`; four webbed clawed limbs, beaked face with separate lower jaw, shell/plastron, water dish/hair and held cucumber are visible and attached; feet reach y = 0 and report issues are empty.

## ukiyoeOctopus — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Clean — evidence: `snaps/ukiyoeOctopus/B/snaps/v03-sheet.jpg` and `v03-head.png`; all eight curling arms, mantle, paired slit-pupil eyes and hinged lids are counted and attached across front/top/side and both flex shots; min y = -0.001 m is within allowance and 22 parts / 9,626 triangles / 73 joints are within limits.

## veiledChameleon — latest v10-lowpoly; current: typecheck clean, report-only same
- Verdict: clean
- Clean — evidence: `snaps/veiledChameleon/B/snaps/v10-lowpoly-sheet.jpg` and `v10-lowpoly-head.png`; four gripping feet, separate open jaw, paired turret eyes, tall casque, dorsal crest, banded body and curled prehensile tail are all attached and survive both flex shots; min y = 0 and report issues are empty.

## vgaSkeletonWarrior — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Clean — evidence: `snaps/vgaSkeletonWarrior/B/snaps/v03-sheet.jpg` and `v03-head.png`; two arms holding the sword/shield, two legs, exposed ribcage, separate jaw/teeth, helmet, sockets and tabard are all present; the front/head/flex views show no visibly detached structural part, bounds min y = 0, and counts are 98 parts / 3,882 triangles / 21 joints.
