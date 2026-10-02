# Audit group e

## leafTanuki — latest v02; current: typecheck clean, report-only same
- Verdict: clean — sheet/front/side/head show the four paws, separate jaw and muzzle, leaf hat and tail all seated; flex-a/flex-b keep the limbs, charm and tail attached.

## leafySeadragon — latest v03; current: typecheck clean, report-only same
- Verdict: clean — sheet/front/side/head show a readable snout with a separate lower jaw, long neck/tail, and leaf fins; both flex shots preserve the planted body and appendages.

## lifeguardBlob — latest v05; current: typecheck clean, report-only same
- Verdict: clean — sheet/side/head show two arms, two legs, hands/feet and distinct lips/jaw; flex-a/flex-b bend the limbs without seams or floating gear.

## lifeguardContour — latest v03; current: typecheck clean, report-only same
- Verdict: clean — sheet/side/head show the expected biped anatomy, separate lips/jaw, glasses and lifeguard clothing; flex-a/flex-b retain hand/foot placement.

## lifeguardControl — latest v03; current: typecheck clean, report-only same
- Verdict: clean — sheet/side/head show two arms, two legs, hands, feet and separate lips/jaw with the glasses, whistle and clothing attached; flex-a/flex-b show no tearing.

## lifeguardSculpt — latest v01; current: typecheck clean, report-only same
- Verdict: clean — sheet/side/head show biped limb count, separate lips/jaw, goggles and sculpted torso; flex-a/flex-b keep fingers, toes and gear on their bones.

## lighthouseCove — latest v03; current: typecheck clean, report-only same
- Verdict: clean — sheet/front/side/top show the island, lighthouse, buildings, jetty, water, buoy and intentionally airborne gulls; flex-a/flex-b leave the static scene coherent.

## littleLich — latest v03; current: typecheck clean, report-only same
- Verdict: clean — sheet/head show the skull's eye sockets, teeth, separate jaw, crown and bat companion; flex-a/flex-b keep the robe, wings, candles and held props attached.

## lizardfolkHunter — latest v03; current: typecheck clean, report-only same
- Verdict: needs fix
- [P0] Both arm chains are detached from the torso at their shoulder roots (23.1 mm gap) — evidence: `npm run preview -- lizardfolkHunter --gap sweep.armR torso` and `--gap sweep.armL torso` each report 23.1 mm; latest `v03-report.json` also lists `sweep.armR`/`sweep.armL` as loose 23 mm clusters; cause: `samples/lizardfolkHunter.ts:259-272` hard-codes shoulder roots at `[±0.26, 1.46, 0.06]` while the torso loft ends at the narrower shoulder station in `samples/lizardfolkHunter.ts:392-403`; fix: derive each shoulder root from the torso surface (or move/extend the arm sweep) so the shoulder mesh overlaps the torso with no visible seam.
- [P0] The lizard's mouth/lower jaw is not readable in the front, three-quarter or head close-up shots — evidence: `v03-front.png` and `v03-head.png` show a continuous pointed green face with no mouth opening or visible lower jaw/teeth, despite the jaw joint; cause: `samples/lizardfolkHunter.ts:94-100` places the jaw and `:474-486` builds the lower jaw, but the result is hidden/fused under the head loft from `:460-471`; fix: reposition or enlarge the lower jaw and mouth interior so a separate upper/lower jaw and teeth read in the rest pose.

## mantaRay — latest v11-lowpoly; current: typecheck clean, report-only same
- Verdict: clean — sheet/front/top/side/head/low show the broad paired wings, cephalic fins, eye, underside mouth and long tail; flex-a/flex-b keep the wing and tail chains connected.

## marginaliaSnailKnight — latest v02; current: typecheck clean, report-only same
- Verdict: needs fix
- [P1] The rabbit knight's face has no readable mouth/muzzle in the front or head close-up — evidence: `v02-front.png` and `v02-head.png` show a smooth brown head with an eye but no visible mouth, while only the tiny jaw/chin and teeth geometry is present; cause: `samples/marginaliaSnailKnight.ts:87-115` uses a 26 mm jaw sphere and 9 mm teeth at `jaw.local(...)`; fix: enlarge and move the muzzle/jaw pieces toward the face and add a dark mouth line that reads at the sample's scale.

## mimicHermitCrab — latest v03; current: typecheck clean, report-only same
- Verdict: needs fix
- [P0] The creature has no separate jaw/mouth chain and no readable crab mouth — evidence: `v03-report.json` has no `jaw` joint/chain, and `v03-sheet.jpg`/`v03-head.png` show eyestalks and pincers but no mouth; cause: `samples/mimicHermitCrab.ts:319-319` creates only the body root, while the head at `:482-490` has no jaw child; fix: add a named jaw child with `role: "jaw"` and upper/lower mouthparts on the head, positioned to read between the claws.

## mochiCatBaker — latest v02; current: typecheck clean, report-only same
- Verdict: clean — sheet/front/side/head show the cat's ears, eyes, whiskers, nose, muzzle and separate jaw, with tray and whisk held; flex-a/flex-b keep the props on the hand bones.

## moose — latest v03; current: typecheck clean, report-only same
- Verdict: clean — sheet/front/side/head show four legs, antlers, eyes, muzzle and lower jaw; flex-a/flex-b preserve antler and leg attachment.

## mossStoneGolem — latest v02; current: typecheck clean, report-only same
- Verdict: clean — sheet/front/side/head show two arms, two legs, rocky face with glowing eyes/teeth and separate jaw; flex-a/flex-b keep the rigid stone plates, moss and fingers visually seated.

## mushroomGolemBoss — latest v03; current: typecheck clean, report-only same
- Verdict: clean — sheet/front/side/head show two arms, two legs, eyes/teeth and separate jaw beneath the cap, with cap houses and ladder seated; flex-a/flex-b retain the body and cap attachments.

## mushroomVillage — latest v02; current: typecheck clean, report-only same
- Verdict: clean — sheet/front/side/head show the three houses, fences, paths, props and both frogs with readable eyes and mouths; flex-a/flex-b leave the static village and frog rigs coherent.

## neonScorpion — latest v03; current: typecheck clean, report-only same
- Verdict: clean — sheet/front/side/head show eight legs, paired pincers/mandibles, eyes, segmented tail and stinger; flex-a/flex-b keep the neon plates and appendages seated.

## SDK patterns
- None observed in this batch.
