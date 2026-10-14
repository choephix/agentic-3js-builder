# Audit group h

## sailfish — latest v13-lowpoly; current: typecheck clean, report-only same
- Verdict: clean
- Clean — inspected v13-lowpoly-sheet.jpg front/three-quarter/side/head and both flex shots: one coherent fish body, paired pectoral/pelvic fins, dorsal sail, forked tail, eye and separate lower jaw; bounds 0.387 × 0.752 × 1.778 m (y min −0.001 m), 398 parts / 10,432 triangles, 14 joints, no report issues.

## samuraiWarrior — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Clean — inspected v03-sheet.jpg front/three-quarter/side/head and both flex shots: two arms and two legs are attached and articulated, kabuto/menpo read clearly, twin swords and banner stay with the figure, and the mouth/menpo jaw is present; bounds 2.139 × 1.888 × 1.062 m (y min 0), 160 parts / 7,984 triangles, 23 joints, no report issues.

## scarecrow — latest v20-lowpoly; current: typecheck clean, report-only same
- Verdict: clean
- Clean — inspected v20-lowpoly-sheet.jpg front/three-quarter/side/head and both flex shots: post, planted feet, tartan arms, overalls, straw cuffs, hat, sunflower and crow are all visibly seated on their intended supports; jaw/face read in the close-up; bounds 1.865 × 1.937 × 0.802 m (y min −0.005 m), 109 parts / 9,118 triangles, 19 joints, no report issues.

## secretaryBirdAstra — latest v01; current: typecheck clean, report-only same
- Verdict: clean
- Clean — inspected v01-sheet.jpg front/three-quarter/side/head and both flex shots: two long legs reach the floor, paired wings and tail streamers attach to the body, crest/face/beak read correctly, and the lower jaw is visibly separate; bounds 1.09 × 1.302 × 1.796 m (y min 0), 78 parts / 3,776 triangles, 27 joints, no report issues.

## secretaryBirdGemini — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Clean — inspected v03-sheet.jpg front/three-quarter/side/head and both flex shots: exactly two planted legs, paired wings, paired long tail feathers, orange face, hooked beak and separate lower jaw are present; crest quills stay on the head; bounds 0.423 × 1.246 × 1.16 m (y min −0.003 m), 111 parts / 5,940 triangles, 26 joints, no report issues.

## secretaryBirdKimi — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Clean — inspected v03-sheet.jpg front/three-quarter/side/head and both flex shots: two legs with toes, two wings, tail feathers, black thigh plumage, orange face/crest and a distinct lower jaw all read and remain attached; bounds 0.653 × 1.356 × 1.239 m (y min −0.007 m), 88 parts / 8,756 triangles, 39 joints, no report issues.

## secretaryBirdOx — latest v05; current: typecheck clean, report-only same
- Verdict: clean
- Clean — inspected v05-sheet.jpg front/three-quarter/side/head and both flex shots: paired legs/toes, wings, tail feathers and crest are attached; the head close-up shows the orange face, hooked beak and separate lower jaw; bounds 0.806 × 1.283 × 1.044 m (y min 0.001 m), 97 parts / 10,722 triangles, 41 joints, no report issues.

## secretaryBirdSonnet — latest v04; current: typecheck clean, report-only same
- Verdict: clean
- Clean — inspected v04-sheet.jpg front/three-quarter/side/head and both flex shots: two planted legs, paired layered wings, paired tail streamers, black thighs, crest, orange face, hooked beak and separate lower jaw are all readable and attached; bounds 0.654 × 1.325 × 1.468 m (y min −0.001 m), 326 parts / 11,988 triangles, 52 joints, no report issues.

## siegeSnail — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Clean — inspected v03-sheet.jpg front/three-quarter/side/head and both flex shots: snail body, eye stalks/feelers and separate mouth/jaw read clearly, the turret/shell armor and banners sit on the shell, and the rider and cannon remain seated; bounds 1.98 × 3.3 × 3.81 m (y min 0), 132 parts / 6,424 triangles, 29 joints, no report issues. The report's shell-spike loose notes are intentional standoff armor visible in the render, not detached body parts.

## silverbackGorilla — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Clean — inspected v03-sheet.jpg front/three-quarter/side/head and both flex shots: two long arms and two hind legs are attached, the silver back and dorsal spikes follow the torso, and the close-up shows the muzzle and separate jaw; bounds 1.034 × 1.818 × 2.043 m (y min 0), 78 parts / 3,046 triangles, 25 joints, no report issues. The 14 mm head loose notes are small fur/head pieces and do not appear detached in the close-up.

## sleepySloth — latest v02; current: typecheck clean, report-only same
- Verdict: clean
- Clean — inspected v02-sheet.jpg front/three-quarter/side/head and both flex shots: the sloth is intentionally hanging from the branch, all four limbs grip the bar, face and separate jaw read, and the Z/sparkle cards are intentional sleep effects; bounds 0.72 × 0.995 × 1.219 m (y min −0.002 m), 92 parts / 6,588 triangles, 50 joints, no report issues.

## snesRedDragon — latest v03; current: typecheck clean, report-only same
- Verdict: broken
- [P0] All four legs float well below the torso instead of meeting the belly — evidence: v03-front.png and v03-side.png visibly show a large gap at every leg root; report-only measures legTubeFL/FR 333 mm and legTubeHL/HR 211 mm from continuousBody — cause: samples/snesRedDragon.ts:228-252 creates each chain at roots y=1.52 (lines 235-240) while the body underside is higher at the leg z positions — fix: derive leg roots from body surface/underside hits (or raise/extend the leg sweeps) so each leg overlaps the body and remains attached through flex; do not merely hide the gap with a filler sphere.

## snowLeopard — latest v22-lowpoly; current: typecheck clean, report-only same
- Verdict: clean
- Clean — inspected v22-lowpoly-sheet.jpg front/three-quarter/side/head and both flex shots: four legs and paws are attached and planted, long tail follows the body, ears/eyes/whiskers and spotted coat read, and the mouth has a distinct lower jaw; bounds 0.41 × 0.815 × 2.231 m (y min 0), 442 parts / 16,588 triangles, 32 joints, no report issues.

## spaceMarine — latest v03; current: typecheck clean, report-only same
- Verdict: broken
- [P0] Chainsword blade chassis floats off the forearm/hand assembly — evidence: v03-three-quarter.png and v03-side.png show the weapon separated from the wrist-side armature; `npm run preview -- spaceMarine --gap box.armL.14 sweep.armL.2` measures 233.6 mm between blade chassis and forearm — cause: samples/spaceMarine.ts:812-835 places the long blade pieces directly at world positions on `leftWrist` without a connected bridge from the wrist sweep — fix: derive the chainsword handle/blade route from `leftWrist`/hand frame (or add a continuous overlapping motor/handle section) so the blade chassis physically meets the grip and remains on the wrist bone through flex.

## sprinterBlob — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Clean — inspected v03-sheet.jpg front/three-quarter/side/head and both flex shots: two arms/hands with digits and two legs/shoes are attached, the bib/top/briefs follow the torso, ponytail stays on the head, and the head close-up shows the jaw; bounds 1.339 × 1.71 × 0.454 m (y min −0.001 m), 49 parts / 50,432 triangles, 57 joints, no report issues.

## sprinterContour — latest v02; current: typecheck clean, report-only same
- Verdict: clean
- Clean — inspected v02-sheet.jpg front/three-quarter/side/head and both flex shots: paired arms with five-finger hands and paired legs/shoes are attached and planted, clothing follows the body, ponytail stays seated, and the jaw/nose/eyes are readable; bounds 1.367 × 1.699 × 0.412 m (y min 0), 80 parts / 11,514 triangles, 55 joints, no report issues.

## sprinterControl — latest v02; current: typecheck clean, report-only same
- Verdict: clean
- Clean — inspected v02-sheet.jpg front/three-quarter/side/head and both flex shots: two arms/hands and two legs/shoes remain attached through bends, clothing and hair follow their bones, and the close-up shows eyes, nose and separate jaw; bounds 1.31 × 1.729 × 0.471 m (y min 0), 161 parts / 15,596 triangles, 57 joints, no report issues.

## sprinterSculpt — latest v01; current: typecheck clean, report-only same
- Verdict: clean
- Clean — inspected v01-sheet.jpg front/three-quarter/side/head and both flex shots: two arms/hands and two legs/shoes are attached and planted, torso clothing/hair follows the skeleton, and the head close-up shows eyes, nose, mouth and jaw; bounds 1.342 × 1.684 × 0.361 m (y min 0), 72 parts / 37,308 triangles, 57 joints, no report issues.

## stagBeetle — latest v02; current: typecheck clean, report-only same
- Verdict: clean
- Clean — inspected v02-sheet.jpg front/three-quarter/side/head and both flex shots: six legs are visible on the beetle and attached to the thorax, mandibles and antennae are present in the close-up, and the insect stays seated on the log scenery; bounds 0.865 × 0.487 × 1.11 m (y min −0.003 m), 171 parts / 6,888 triangles, 46 joints, no report issues.

## SDK patterns
- None found in this batch; all current report-only runs had zero issues and all scoped typechecks were clean. Both broken samples have sample-local placement defects (dragon legs; chainsword assembly).
