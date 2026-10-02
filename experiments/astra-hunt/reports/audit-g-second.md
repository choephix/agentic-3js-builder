# Audit group g — second pass

## pico8Rooster — latest v03; current: typecheck clean, report-only same
- Verdict: needs fix
- [P1] Both eye cubes are mounted on top of the skull instead of the face, leaving the front/three-quarter head effectively eyeless — evidence: `/home/cx/tmp/public/nilo/agentic-3js-builder/snaps/pico8Rooster/B/snaps/v03-head.png` shows `eyeL` and `eyeR` as two white cubes on the crown; `v03-sheet.jpg` front, three-quarter, and low-hero panels show the same placement; current preview bounds put both eyes at y = 0.720–0.734 and z = 0.304–0.341 while the beak is lower/front — cause: `samples/pico8Rooster.ts:108-115` uses `head.local([s * 0.07, 0.075, 0.132])` and `head.dir([0, 0, 1])`; with a forward-facing head, local z is up, not forward — fix: place the eyes with the forward/up axes swapped (approximately `[s * 0.07, 0.132, 0.075]`) and aim their textured face along the head's forward axis.

## redLionfishAstra — latest v02; current: typecheck clean, report-only differs: intentional 255 mm hover warning
- Verdict: needs fix
- [P1] Brow tentacles read as thick crossed antlers over the eyes rather than feathery supra-orbital filaments — evidence: `/home/cx/tmp/public/nilo/agentic-3js-builder/snaps/redLionfishAstra/B/snaps/v02-sheet.jpg` front/three-quarter and `v02-head.png` show the two beige branches crossing the brow; cause: `samples/redLionfishAstra.ts:204-222` roots each sprout close to the eye and gives it a short inward curve with only two tiny barbs per station — fix: move each root/tip outward from the eye line and add a clear side-barb/fringe set without crossing the face.
- First-pass correction: the quarter-metre floor gap is intentional for all five redLionfish samples, per the brief; do not lower this model. The current `Lowest point is 255 mm above y = 0` warning is therefore expected.

## ps1Mech — latest v03; current: typecheck clean, report-only same
- Verdict: broken (existing first-pass defect confirmed; no additional defect found)
- The first-pass detached-claw/cannon and floating torso/back pieces remain visible in `v03-sheet.jpg` and both flex shots; current report-only still lists `box.armL.2` 609 mm from `armL`, `box.weaponCannon` 403 mm from `armR`, `extrude.back.2` 131 mm from `armL`, `extrude.back` 130 mm from `armR`, and torso gaps of 61–65 mm. No second-pass issue beyond that existing finding.

Agreed clean after opening the latest sheet/head/flex views and running current typecheck/report-only: picturebookReef, pixelCapybara, pixelHarvestVillage, pixelMammoth, porcelainElephant, ps1CaveSpider, ps1Raptor, ramFawn, redFox (latest render is v13-lowpoly, not the first-pass v04 tag), redLionfishGemini, redLionfishKimi, redLionfishOx, redLionfishSonnet, retroActionHero, robotGardener, rubberhoseCat.
