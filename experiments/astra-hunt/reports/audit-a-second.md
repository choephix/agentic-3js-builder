# Group a second-look audit

## amigurumiNarwhal — latest v03; current: typecheck clean, report-only same
- Verdict: needs fix
- [P0] Confirmed first-pass finding: the narwhal has an embroidered smile but no separate lower jaw or jaw-role joint — evidence: `snaps/amigurumiNarwhal/B/snaps/v03-head.png` and `v03-flex-a.png`/`v03-flex-b.png` show a continuous muzzle with no opening; `v03-report.json` has 17 parts and 18 joints but no `jaw` group/joint — cause: `samples/amigurumiNarwhal.ts:460-486` builds the face/smile without a jaw-bound lower muzzle — fix: add a `jaw` joint parented to `head`, put the lower muzzle/mouth on it, and keep the upper muzzle on `head`.

## barnOwl — latest v07-lowpoly; current: typecheck clean, report-only same
- Verdict: needs fix
- [P0] Confirmed first-pass finding: both feet hover above the floor — evidence: `snaps/barnOwl/B/snaps/v07-lowpoly-front.png` and `v07-lowpoly-report.json` bounds y = 0.0129..1.0583 m with the lowest toes 13 mm above y = 0 — cause: `samples/barnOwl.ts:271-312` places the leg/toe contact geometry above the floor — fix: lower the toe/foot construction or shift the finished owl down about 13 mm so the lowest toes contact y = 0.

## blacksmithForgeAstra — latest v04; current: typecheck clean, report-only same
- Verdict: needs fix
- [P0] Confirmed first-pass finding: the glowing half-forged blade is suspended/mis-oriented through the rack rather than resting on the bench/anvil — evidence: `snaps/blacksmithForgeAstra/B/snaps/v04-side.png`, `v04-three-quarter.png`, and `v04-top.png` show the pale blade detached from the work surface — cause: `samples/blacksmithForgeAstra.ts:173-178` creates the blade with an upright extrude frame at `[0.38,0.8,0.32]` — fix: orient and place the blade on the bench/anvil, and connect its handle/blade assembly to the intended support.

## Agreed clean
- alebrijeJaguar, amigaSeaTurtle, arcadeTentacleAlien, artDecoFalcon, artDecoRobotButler, artNouveauDragonfly, atariAnglerfish, axolotl, bengalTiger, biomechSwarmQueen, bisonBull, blacksmithForgeGemini, blacksmithForgeKimi, blacksmithForgeOx, blacksmithForgeSonnet, blossomDeer — inspected latest sheets plus head/side/skeleton and both flex views; no additional missed defect found, and current scoped typechecks/report-only runs match the latest snapshots.
