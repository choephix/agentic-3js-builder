# Audit B second pass

## brutalistWalkerFortress — latest v03; current: typecheck clean, report-only same
- Verdict: broken
- [P0] The rooftop radar dish/mast is detached from the fortress roof — evidence: `snaps/brutalistWalkerFortress/B/snaps/v03-front.png` and `v03-top.png` show the dark mast/dish floating above the roof; current preview measures `sphere.radar` ↔ `body` at 406.5 mm and `sweep.radar` ↔ `body` at 85.2 mm — cause: `samples/brutalistWalkerFortress.ts:227-233` starts the radar post at y = 5.74 while the roof/body ends around y = 5.68, leaving the radar cluster separated — fix: extend the radar post down to the roof and bridge the remaining mast/dish geometry to the body while keeping it on `radar`.

## centaurArcher — latest v03; current: typecheck clean, report-only same
- Verdict: broken
- [P0] The recurved bow is not held coherently by either hand and tears from the intended grip in the rig — evidence: `snaps/centaurArcher/B/snaps/v03-front.png` and `v03-three-quarter.png` show the bow crossing the torso with its central grip away from both hands; `v03-flex-b.png` leaves the bow across the chest while the hands move; current preview measures `recurveBow` ↔ `armL` at 52.5 mm — cause: `samples/centaurArcher.ts:333-341` builds the bow from fixed world-space points without a dedicated bow joint, so the builder assigns bow pieces across `wristL`/`wristR` instead of one held item — fix: add a dedicated `bow` joint parented to the gripping wrist, put every bow/string/grip piece on it, and place the grip at that hand (or pose the hand to the grip).

## chibiMechPilot — latest v05-sdk; current: typecheck clean, report-only same
- Verdict: broken
- [P0] The raised visor is visibly floating above the helmet rather than hinged to the brow — evidence: `snaps/chibiMechPilot/B/snaps/v05-sdk-head.png` shows a clear gap between the visor and helmet shell; current preview measures the `visorHinge` group ↔ `head` at 19.0 mm and the report lists `extrude.visorHinge` as a loose part — cause: `samples/chibiMechPilot.ts:49,206-214` places the hinge/visor at y = 0.865–0.900 while the head shell surface ends below it — fix: move the hinge and visor down/forward until the hinge contacts the helmet shell and the visor reads as a single hinged assembly, preserving its `visorHinge` bone.

## brassDiver — latest v02; current: typecheck clean, report-only same
- Verdict: broken
- [P0] The diver has no separate jaw joint or jaw geometry — evidence: current report skeleton has `head` and `portHinge` but no `jaw`; `snaps/brassDiver/B/snaps/v02-head.png` shows a fixed illustrated face behind the front port, with no independently hinged lower jaw — cause: `samples/brassDiver.ts:212-232` creates only hips/spine/neck/head for the creature, while `:362-393` puts the entire face on the static `portGlass` texture — fix: add a named `jaw` joint under `head` and make the lower face/jaw a separate part that can open, rather than baking the whole face into the port texture.

## codexJaguarWarrior — latest v04; current: typecheck clean, report-only same
- Verdict: no additional defect found; agree with the first-pass lower-jaw finding in `audit-b.md` (the existing open-jaw gap remains visible in `v04-head.png`).

Agreed-clean (latest sheet, head close-up, flex shots, and current report-only checked): bobaSlime, broomWitchling, bunnyBakeryIsland, cactusGunslinger, chestMimic, chibiKnight, clayWalrus, claymationBadgerChef, clockworkAutomaton, clockworkCarousel, clockworkCrocodile, clockworkOwl, clockworkStag, cloudSheep.
