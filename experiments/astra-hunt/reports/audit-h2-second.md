# Audit group h2

## spaceMarine — latest v03; current: typecheck clean, report-only same
- Verdict: broken (existing P0 confirmed; additional defect found)
- [P0] Existing first-pass finding confirmed: the chainsword blade chassis floats off the forearm/hand assembly — evidence: `/home/cx/tmp/public/nilo/agentic-3js-builder/snaps/spaceMarine/B/snaps/v03-three-quarter.png` and `v03-side.png`; the first-pass measurement records 233.6 mm between `box.armL.14` and `sweep.armL.2` — cause: `samples/spaceMarine.ts:812-835` places the long blade pieces at fixed positions without a connected bridge from the wrist sweep — fix: derive the chainsword handle/blade route from the `leftWrist`/hand frame (or add a continuous overlapping motor/handle section) so the weapon physically meets the grip and remains on the wrist bone through flex.
- [P1] Additional missed defect: chainsword teeth are visibly detached below the blue chainblade chassis instead of seated on its cutting edge — evidence: `/home/cx/tmp/public/nilo/agentic-3js-builder/snaps/spaceMarine/B/snaps/v03-side.png` and `v03-low.png` show a clear gap under the blade; current `npm run preview -- spaceMarine --gap box.armL.14 cone.armL.2` measures 94.3 mm between the chassis and first tooth — cause: `samples/spaceMarine.ts:826-835` places teeth at `y = ty - 0.085`, while the chassis is centred at `y = 1.2` with 0.15 m height (`812-817`), leaving the first tooth below its lower edge — fix: derive each tooth position from the rotated chassis' lower edge (or move the tooth row up by the measured gap) so teeth overlap the blade and remain on the left-wrist weapon bone.

## Existing first-pass finding confirmed (not a second-look finding)
- `snesRedDragon` remains broken for the already reported P0 floating-leg-root defect; no additional defect was found in this second look.

## Agreed clean
- `sailfish, samuraiWarrior, scarecrow, secretaryBirdAstra, secretaryBirdGemini, secretaryBirdKimi, secretaryBirdOx, secretaryBirdSonnet, siegeSnail, silverbackGorilla, sleepySloth, snowLeopard, sprinterBlob, sprinterContour, sprinterControl, sprinterSculpt, stagBeetle` — inspected each latest sheet, head close-up and flex shots; limbs/features/doors and jaws (where applicable) stay attached, models meet the floor/scene placement, and current scoped typechecks are clean with no report issues.

## SDK patterns
- None found; both defects are sample-local chainsword placement faults, and the existing dragon defect is also sample-local.
