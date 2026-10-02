# Audit B

## bobaSlime — latest v02; current: typecheck clean, report-only same
- Verdict: clean — front/three-quarter/side/head and both flex shots show a grounded slime with two arms, visible separate mouth/jaw, attached straw and pearls; no visible tears or misplaced parts.

## brassDiver — latest v02; current: typecheck clean, report-only same
- Verdict: clean — front/three-quarter/side/head and both flex shots show the humanoid diver's four limbs, helmet details, lantern and hose attached to their intended bones; feet contact the floor and no tears are visible.

## broomWitchling — latest v02; current: typecheck clean, report-only same
- Verdict: clean — front/three-quarter/side/head and both flex shots show the witch, cat companion, broom and cape with readable placement; the open mouth/jaw is present and no detached rig parts are visible.

## brutalistWalkerFortress — latest v03; current: typecheck clean, report-only same
- Verdict: clean — front/three-quarter/side/top and both flex shots show four legs with slab feet on the floor, a coherent stacked fortress, and the radar/water-tank assembly supported above the roof; no visible tears or floating structural parts.

## bunnyBakeryIsland — latest v03; current: typecheck clean, report-only same
- Verdict: clean — front/three-quarter/side/top and both flex shots show the island scenery, bakery, waterfall, three bunnies and cat with grounded contacts; animal heads/jaws, limbs and tails remain readable and attached.

## cactusGunslinger — latest v03; current: typecheck clean, report-only same
- Verdict: clean — front/three-quarter/side/head and both flex shots show two arms each carrying a gun, two grounded legs, face/mouth details and intact holsters; guns follow the hands without visible tearing.

## centaurArcher — latest v03; current: typecheck clean, report-only same
- Verdict: broken
- [P0] All four black hooves are detached below the horse legs — evidence: `snaps/centaurArcher/B/snaps/v03-front.png`, `v03-three-quarter.png`, and both flex shots visibly show four square hooves floating on the floor; report-only measures `hooffrontL`/`hooffrontR` at 150–151 mm from their leg tubes and hind hooves at 148 mm — cause: `samples/centaurArcher.ts:185-190` places the hoof at y = 0.043 while the leg sweep ends at the ankle — fix: place each hoof on the ankle endpoint/bone and bridge the leg sweep to it, preserving floor contact without a gap.

## chestMimic — latest v03; current: typecheck clean, report-only same
- Verdict: clean — front/three-quarter/side/head and both flex shots show a distinct upper lid and lower jaw with teeth, tongue, six legs and grounded feet; loose gold pieces are intentional treasure inside/around the chest and no structural separation is visible.

## chibiKnight — latest v02; current: typecheck clean, report-only same
- Verdict: clean — front/three-quarter/side/head and both flex shots show two arms with sword/shield, two feet, helmet plume and a separate moving jaw; weapons remain held and no mesh tears are visible.

## chibiMechPilot — latest v05-sdk; current: typecheck clean, report-only same
- Verdict: clean — front/three-quarter/side/head and both flex shots show the pilot's face/jaw, visor-up helmet, two arms/gauntlets, two legs/boots and backpack; the visor hinge is intentionally above the brow and remains aligned through posing.

## clayWalrus — latest v03; current: typecheck clean, report-only same
- Verdict: clean — front/three-quarter/side/head and both flex shots show a grounded walrus with two flippers, two hind flippers, tusks, whiskers and separate jaw; facial parts and toes stay attached while bending.

## claymationBadgerChef — latest v07-sdk; current: typecheck clean, report-only same
- Verdict: clean — front/three-quarter/side/head and both flex shots show the badger's muzzle/jaw, chef hat, apron, two arms with pots and two grounded legs; no detached or stretched parts are visible.

## clockworkAutomaton — latest v03; current: typecheck clean, report-only same
- Verdict: minor
- [P2] Excessively fine mechanical detail consumes 31,692 triangles across 155 fine meshes — evidence: `v03-report.json` fine-mesh list and `v03-head.png`; overall 45,922 triangles is below the soft 60k budget, but tiny gears/bolts dominate the fine list — cause: high segment/detail settings in `samples/clockworkAutomaton.ts` mechanical parts — fix: lower tessellation on the listed tiny gears, bolts and rings while retaining silhouette-critical face and limb pieces.

## clockworkCarousel — latest v03; current: typecheck clean, report-only same
- Verdict: minor
- [P2] Excessively fine mechanical/detail meshes consume 30,288 triangles across 168 fine meshes — evidence: `v03-report.json` fine-mesh list and `v03-sheet.jpg`; overall 45,996 triangles is below the soft 60k budget, but many tiny gear, canopy and base parts are below the recommended edge scale — cause: high tessellation/detail settings in `samples/clockworkCarousel.ts` — fix: thin the listed tiny gears, canopy ornaments and base geometry, keeping the carousel silhouette and readable decorations.

## clockworkCrocodile — latest v03; current: typecheck clean, report-only same
- Verdict: minor
- [P2] Excessive fine mechanical detail produces 19,896 triangles across 201 fine meshes — evidence: `v03-report.json` fine-mesh list and `v03-head.png`; overall 33,092 triangles is below the soft 60k budget, but numerous tiny clock/gear/scute pieces are below the reported edge threshold — cause: high tessellation/detail settings in `samples/clockworkCrocodile.ts` — fix: reduce segments on the listed small gears, clock hands, rivets and scutes while preserving the jaw and crocodile silhouette.

## clockworkOwl — latest v03; current: typecheck clean, report-only same
- Verdict: clean — front/three-quarter/side/head and both flex shots show a readable owl face/beak, two wings, feet on the perch and intact clockwork attachments; the few loose secondary wing pieces are layered feather details and no visible tear occurs.

## clockworkStag — latest v03; current: typecheck clean, report-only same
- Verdict: minor
- [P2] Excessive fine mechanical detail consumes 31,076 triangles across 156 fine meshes — evidence: `v03-report.json` fine-mesh list and `v03-head.png`; overall 44,826 triangles is below the soft 60k budget, but tiny gears, collars and leg hardware are repeatedly below the reported edge threshold — cause: high tessellation/detail settings in `samples/clockworkStag.ts` — fix: reduce segments on the listed small gears, collars, drums and decorative plates while retaining the antler/head silhouette and leg joints.

## cloudSheep — latest v02; current: typecheck clean, report-only same
- Verdict: clean — front/three-quarter/side/head and both flex shots show four legs, cloud fleece, ears, face and separate mouth/jaw; the floating stars/raindrops are intentional decorative cards and no fleece or limb tearing is visible.

## codexJaguarWarrior — latest v04; current: typecheck clean, report-only same
- Verdict: needs fix
- [P1] The open-jaw jaguar helmet has no readable lower jaw: only the upper muzzle/teeth are visible while the dark warrior face hangs as a separate block beneath it — evidence: `v04-head.png` and `v04-three-quarter.png` show a large open gap under the golden muzzle with no matching lower-jaw plate — cause: `samples/codexJaguarWarrior.ts:243-257` builds the jaw parts at y = 1.435–1.465 behind/under the face sphere at lines 227-232, so they are occluded — fix: move/extend the jaw geometry forward beneath the muzzle, keep it on `jaw`, and leave the warrior face behind it so the upper/lower helmet jaws read as one hinged mouth.

## SDK patterns

- No cross-sample SDK defect was established from these renders; the only hard contract failure found was sample-local centaur hoof placement.
