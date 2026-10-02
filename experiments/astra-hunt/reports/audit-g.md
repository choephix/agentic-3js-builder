# Audit group g

## pico8Rooster — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Looked at `v03-sheet.jpg`, `v03-head.png`, and both flex shots: two planted legs with toes, two wings, tail, comb, eyes, and a distinct beak/jaw read from front, three-quarter, side, and bends; bounds are 1.008 × 0.757 × 0.847 m with 62 parts, 3,516 triangles, 32 joints, and no report issues.

## picturebookReef — latest v02; current: typecheck clean, report-only same
- Verdict: clean
- Looked at `v02-sheet.jpg`, `v02-head.png`, and both flex shots: turtle, five fish, and octopus are recognizable; swimmers are intentionally suspended over the reef, the octopus has a readable separate head/jaw area, and the diorama sits on its 1.4 × 1.063 × 1.4 m base. Report: 253 parts, 17,044 triangles, 39 joints, no issues.

## pixelCapybara — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Looked at `v03-sheet.jpg`, `v03-head.png`, and both flex shots: capybara has four visible legs, muzzle/eyes/ears, the yuzu and towel, duckling, tub, water, rocks, and steam; the tub rests at y = 0. Report: 174 parts, 3,368 triangles, 39 joints, no issues.

## pixelHarvestVillage — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Looked at `v03-sheet.jpg`, the close-up panel, and both flex shots: farmhouse, barn, silo, fields, livestock, gate, pond and well remain coherent from all angles; the base rests at y = 0 and animals have visible head/jaw and four-leg silhouettes. Report: 119 parts, 5,208 triangles, 24 joints, no issues.

## pixelMammoth — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Looked at `v03-sheet.jpg`, `v03-head.png`, and both flex shots: four legs remain attached, trunk and both tusks are seated on the head, and the jaw is a separate rigged mesh under the trunk; bounds are −1 mm to 3.736 m in y (within floor allowance). Report: 116 parts, 17,988 triangles, 37 joints, no issues.

## porcelainElephant — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Looked at `v03-sheet.jpg`, `v03-head.png`, and both flex shots: four planted legs, two ears, tusks, raised trunk, headdress and saddle cloth all stay attached; the separate jaw reads beneath the trunk. Bounds are −1 mm to 3.963 m in y, with 80 parts, 9,256 triangles, 39 joints, and no issues.

## ps1CaveSpider — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Looked at `v03-sheet.jpg`, `v03-head.png`, and both flex shots: all eight four-joint legs are present and attached, the green eye block and paired chelicerae/fangs read in the front and top views, and the abdomen skull/cobweb treatment is intentional. Report: 144 parts, 7,342 triangles, 46 joints, no issues.

## ps1Mech — latest v03; current: typecheck clean, report-only same
- Verdict: broken
- [P0] Left claw and right cannon are detached from the arms, with additional back/torso pieces floating — evidence: `v03-sheet.jpg` front/three-quarter/top panels and both flex shots show the hand/cannon assemblies separated from their forearms; current report-only lists `box.armL.2` 609 mm from `armL`, `box.weaponCannon` 403 mm from `armR`, `extrude.back.2` 131 mm from `armL`, `extrude.back` 130 mm from `armR`, and torso gaps of 61–65 mm — cause: `samples/ps1Mech.ts:308-331` passes model-space coordinates into `box()`/`b.part()` together with a bone (`box()` at lines 101-110 forwards `at` directly), so the bone transform offsets already-positioned geometry — fix: place these meshes in bone-local coordinates or translate model-space geometry and call `b.part(..., { bone, at: [0, 0, 0] })`; derive attachment positions from the arm joints instead of duplicating world coordinates.

## ps1Raptor — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Looked at `v03-sheet.jpg`, `v03-head.png`, and both flex shots: two legs with toes, two small arms, feathered body/tail, and a clearly separated toothed lower jaw all hold together; the floor contact is y = 0.001. Report: 45 parts, 2,948 triangles, 55 joints, no issues.

## ramFawn — latest v02-lowpoly; current: typecheck clean, report-only same
- Verdict: clean
- Looked at `v02-lowpoly-sheet.jpg`, `v02-lowpoly-head.png`, and both flex shots: four legs/hooves, ears, eyes, muzzle, separate lower jaw, spiral horns, spots and tail are attached and readable; bounds are −1 mm to 1.529 m in y. Report: 58 parts, 3,312 triangles, 20 joints, no issues.

## redFox — latest v04; current: typecheck clean, report-only differs: parts 160→144, triangles 13,128→5,680, vertices 9,235→4,797, size 0.301 × 0.746 × 1.557→0.273 × 0.746 × 1.574 m
- Verdict: clean
- Looked at `v04-sheet.jpg`, `v04-head.png`, both flex shots, and current `preview/redFox/three-quarter.png`: four legs with black socks, ears, eyes, white muzzle/bib, separate jaw and attached white-tipped tail remain readable from every angle; the current count/bounds change is an SDK-state difference, not a visible defect. Current bounds still touch y = 0 and report no issues.

## redLionfishAstra — latest v02; current: typecheck clean, report-only same
- Verdict: broken
- [P0] The fish floats 255 mm above the floor without an off-ground placement stated in the sample contract — evidence: `v02-sheet.jpg` shows a full shadow gap under the fish, `v02-head.png` is suspended, and current report-only warns `Lowest point is 255 mm above y = 0`; report bounds are y = 0.255…0.577 m — cause: `samples/redLionfishAstra.ts:23-30` starts the body/root at y ≈ 0.33 and the body radius leaves the lowest point at 0.255 m, while `meta.description` at lines 15-16 does not declare swimming/hovering — fix: lower the entire body/root and all dependent geometry by 0.255 m to contact y = 0 (or explicitly adopt an off-ground brief and description if that is the intended placement).
- [P1] Brow tentacles read as large crossed antlers over the face rather than feathery supra-orbital filaments — evidence: `v02-sheet.jpg` front/three-quarter and `v02-head.png` show the two thick beige branches crossing the brow/eye line — cause: `samples/redLionfishAstra.ts:204-222` uses only two very thin barbs per tentacle on a short, inward-curving sprout — fix: move each root/tip outward from the eyes and add a visibly feathery set of short side filaments (or a small membrane/card fringe) without crossing the face.

## redLionfishGemini — latest v02; current: typecheck clean, report-only differs: triangles 15,568→15,324, vertices 36,649→36,159, lowest-point warning 245→252 mm
- Verdict: clean
- Looked at `v02-sheet.jpg`, `v02-head.png`, both flex shots, and current `preview/redLionfishGemini/three-quarter.png`: separated lower jaw, eyes/tentacles, long pectoral rays with membranes, dorsal spines, tail and body stripes remain recognizable and attached; the 0.25 m hover is explicitly described and intentional. Current differences are small SDK tessellation/bounds changes; no detached clusters or new visible fault.

## redLionfishKimi — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Looked at `v03-sheet.jpg`, `v03-head.png`, and both flex shots: the separate jaw is visible under the muzzle, pectoral ray fans and membranes attach at both sides, dorsal spines/tentacles and rounded tail read clearly; the ~0.25 m hover is explicitly documented in the source comment. Report: 81 parts, 6,284 triangles, 34 joints, with only the intentional 246 mm floor warning.

## redLionfishOx — latest v02; current: typecheck clean, report-only same
- Verdict: clean
- Looked at `v02-sheet.jpg`, `v02-head.png`, and both flex shots: rounded fish body, separate lower jaw, brow tentacles, thirteen dorsal spines, spotted pectoral membranes/rays and tail stay attached; the 0.25 m hover is explicitly described. Report: 192 parts, 7,808 triangles, 12 joints, with only the intentional 250 mm floor warning.

## redLionfishSonnet — latest v02; current: typecheck clean, report-only same
- Verdict: clean
- Looked at `v02-sheet.jpg`, `v02-head.png`, and both flex shots: lower jaw, eyes/brow tentacles, dense dorsal comb, free pectoral rays, anal fins and rounded tail remain attached and recognizable; the quarter-metre hover is explicitly described. Report: 186 parts, 10,940 triangles, 116 joints, with only the intentional 250 mm floor warning.

## retroActionHero — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Looked at `v03-sheet.jpg`, `v03-head.png`, and both flex shots: biped has two planted boots, articulated arms/hands, pistol held in the hand bone, separate jaw/smirk, shades, tank, bandolier and cargo silhouette; the y floor contact is 1 mm above. Report: 79 parts, 2,910 triangles, 52 joints, no issues.

## robotGardener — latest v02; current: typecheck clean, report-only same
- Verdict: clean
- Looked at `v02-sheet.jpg`, `v02-head.png`, and both flex shots: screen face, hinged chin, sprout pot, arms/tools, boots and three flower pots are attached/readable; floor props intentionally sit apart at the feet and the body rests at y = 0. Report: 94 parts, 3,324 triangles, 23 joints, no issues.

## rubberhoseCat — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Looked at `v03-sheet.jpg`, `v03-head.png`, and both flex shots: upright two-legged silhouette, gloved hands/fingers, pie-cut eyes, toothy separate jaw, bent hat and patched tail all hold together; bounds touch y = 0. Report: 100 parts, 10,495 triangles, 45 joints, no issues.
