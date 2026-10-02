# Group a sample audit

## alebrijeJaguar — latest v03; current: typecheck clean, report-only same
- Verdict: clean — `v03-sheet.jpg`, `v03-head.png`, `v03-side.png`, and both flex shots show four planted legs, two extended wings, a curled tail, and a visibly separate open upper/lower jaw; report has 0 issues, 204 parts, 16,322 triangles, bounds y = -0.0001..1.032 m.

## amigaSeaTurtle — latest v03; current: typecheck clean, report-only same
- Verdict: clean — front/three-quarter/side/head and flex shots show four flippers attached to the shell, tail, eyes, and a separate open jaw; report has 0 issues, 21 parts, 1,324 triangles, bounds y = -0.0001..0.296 m.

## amigurumiNarwhal — latest v03; current: typecheck clean, report-only same
- Verdict: needs fix
- [P0] Missing separate lower jaw and jaw joint: the head close-up shows only a stitched smile over a continuous muzzle, and the flex shots have no openable mouth; the report has no `jaw` group/joint (17 parts, 18 joints) — cause: `samples/amigurumiNarwhal.ts:460-486` builds eyes and `smile` only, with no jaw joint or jaw-bound mesh — fix: add a `jaw` joint parented to `head` and build the lower muzzle/mouth on that bone, leaving the upper muzzle on `head`.

## arcadeTentacleAlien — latest v03; current: typecheck clean, report-only same
- Verdict: clean — front/three-quarter/side/head and both flex shots show eight distinct tentacles with articulated chains, two eyes, antennae, and a separately opening jaw; report has 0 issues, 64 parts, 1,694 triangles, bounds y = -0.0003..1.500 m.

## artDecoFalcon — latest v03; current: typecheck clean, report-only same
- Verdict: clean — front/three-quarter/side/head and both flex shots show two wings with feather chains, two legs with toes, tail fan, beak, and separate mandible; the reported 9–16 mm rosette proximity clusters are not visibly floating in the wing-root shots; report has 0 issues, 317 parts, 13,332 triangles.

## artDecoRobotButler — latest v05-sdk; current: typecheck clean, report-only same
- Verdict: clean — front/three-quarter/side/head and both flex shots show two arms, two legs with shoes, tray held on the wrist, and a separate jaw; the small crown ball is connected by its spike in the head shot; report has 0 issues, 78 parts, 7,246 triangles, bounds y = 0.0009..1.846 m.

## artNouveauDragonfly — latest v04; current: typecheck clean, report-only same
- Verdict: clean — the explicit hover is intentional (`samples/artNouveauDragonfly.ts:10-11`); front/three-quarter/side/head and both flex shots show six legs, four attached wings, antennae, upper head mouthpart and lower `labium` on its own jaw-role joint; the 402 mm floor clearance is therefore expected; report has 1 expected hover warning, 143 parts, 9,792 triangles.

## atariAnglerfish — latest v03; current: typecheck clean, report-only same
- Verdict: clean — front/three-quarter/side/head and both flex shots show the lure on its stalk, two pectoral/pelvic fin pairs, dorsal/anal fins, a separate hinged jaw with teeth, and tail; the three stiff-body notes do not produce visible tearing in flex shots; report has 0 issues, 113 parts, 1,742 triangles.

## axolotl — latest v10-lowpoly; current: typecheck clean, report-only same
- Verdict: clean — front/three-quarter/side/head and both flex shots show four legs with digits, six bilateral feathery gill fans, a continuous tail, and a separate jaw; the 45 fine-mesh notes are intentional gill/detail primitives and the rendered model remains 11,570 triangles; report has 0 issues.

## barnOwl — latest v07-lowpoly; current: typecheck clean, report-only same
- Verdict: needs fix
- [P0] Feet hover above the floor: report warning measures the lowest point at +13 mm (`v07-lowpoly-report.json`, bounds y = 0.0129..1.0583 m), visible as a slight gap below the toes in `v07-lowpoly-front.png`; cause: `samples/barnOwl.ts:271-312` places the leg contact/toe geometry above y = 0 — fix: lower the leg contact/toe construction or shift the finished owl down about 13 mm so the lowest toe touches y = 0.

## bengalTiger — latest v03; current: typecheck clean, report-only same
- Verdict: clean — front/three-quarter/side/head and both flex shots show four legs with paws, long segmented tail, ears, whiskered muzzle, and a separate lower jaw; report has 0 issues, 153 parts, 6,774 triangles, bounds y = -0.0033..1.442 m.

## biomechSwarmQueen — latest v03; current: typecheck clean, report-only same
- Verdict: clean — front/three-quarter/side/head and both flex shots show six legs (three per side), paired antennae, mandibles, abdomen plates, and separate jaw/inner-jaw geometry; report has 0 issues, 148 parts, 9,020 triangles, bounds y = -0.0133..2.315 m.

## bisonBull — latest v02; current: typecheck clean, report-only same
- Verdict: clean — front/three-quarter/side/head and both flex shots show four legs/hooves, horns, beard and tufted tail, with a separate jaw; the rigid spine2 note does not visibly tear the shaggy torso in flex shots; report has 0 issues, 83 parts, 9,802 triangles, bounds y = -0.0251..1.767 m.

## blacksmithForgeAstra — latest v04; current: typecheck clean, report-only same
- Verdict: needs fix
- [P0] Glowing half-forged sword blade is visibly floating/mis-oriented through the rack instead of resting on the workbench: the broad beige blade is detached in `v04-side.png`, `v04-three-quarter.png`, and the top/flex shots; cause: `samples/blacksmithForgeAstra.ts:173-178` creates the blade with an upright `x: [0,0,1], y: [0,1,0]` extrude frame at `[0.38,0.8,0.32]` while the bench is horizontal — fix: orient and place the blade on the bench/anvil surface, with its handle connected and its blade no longer suspended through the rack.

## blacksmithForgeGemini — latest v02; current: typecheck clean, report-only same
- Verdict: clean — front/three-quarter/side/top and both flex shots show a coherent tabletop forge, hearth/chimney, anvil, barrels, racks, bellows hinge, lantern, and sign pivot with no visibly detached props; report has 0 issues, 58 parts, 4,516 triangles.

## blacksmithForgeKimi — latest v04; current: typecheck clean, report-only same
- Verdict: clean — front/three-quarter/side/top and both flex shots show the complete forge scene, grounded chimney/barrels/anvil, hanging tools, lantern, bellows lid, and swinging sign with no visible floating props; report has 0 issues, 106 parts, 3,326 triangles.

## blacksmithForgeOx — latest v03; current: typecheck clean, report-only same
- Verdict: clean — front/three-quarter/side/top and both flex shots show the complete grounded forge island, chimney, anvil, barrels, lantern, hanging tools, bellows lid, and sign swing; no detached props are visible; report has 0 issues, 169 parts, 4,852 triangles.

## blacksmithForgeSonnet — latest v03; current: typecheck clean, report-only same
- Verdict: clean — front/three-quarter/side/top and both flex shots show a complete grounded forge with hearth/fire, anvil, barrels, workbench, rack, horseshoes, logs, grindstone, lantern, and sign; no visible detached props; report has 0 issues, 363 parts, 10,108 triangles.

## blossomDeer — latest v03; current: typecheck clean, report-only same
- Verdict: clean — front/three-quarter/side/head and both flex shots show four legs/hooves, ears, separate jaw, symmetric antler chains, nest/bird on the back, and the blossom canopy/moss seated on the antlers/body; report has 0 issues, 343 parts, 27,264 triangles, 41 colours (within the 64-colour limit).
