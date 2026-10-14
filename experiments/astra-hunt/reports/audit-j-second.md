# Audit group j — second look

## warthogGemini — latest v03; current: typecheck clean, report-only same
- Verdict: needs fix
- [P0] Front-leg chains contain zero-length shoulder-to-knee joints — evidence: `v03-skeleton.png` shows the shoulder/knee nodes coincident, and the current skeleton report places `shoulder_L` and `frontKnee_L` both at `[0.16,0.65,0.26]` (same for the right side) — cause: `samples/warthogGemini.ts:354-364` creates a `shoulderJoint` at `shoulderPt` and then starts `b.chain` with `limb(shoulderPt, ...)`, whose first named joint is therefore at the same point — fix: make the shoulder joint the chain root (remove the duplicate parent joint), or name/start the chain at the next non-coincident knee point so each front-limb joint has a real segment. (The first-pass `arm`-versus-`leg` role finding remains applicable.)

## articulatedDeskLamp — latest none (no prior snapshot); current: typecheck clean, report-only current-only
- Verdict: needs fix
- [P0] Power switch is visibly detached from the weighted base — evidence: current preview three-quarter shot shows the black switch body hovering behind the base; `npm run preview -- articulatedDeskLamp --gap powerSwitch weightedBase` measures a 16.7 mm gap (`powerSwitch` closest point `[0,0.185,-0.167]`, `weightedBase` `[0,0.170,-0.160]`) — cause: `samples/articulatedDeskLamp.ts:282-287` places the switch at y=0.22 while the base surface ends near y=0.17 at that rear location — fix: move the switch down and/or into the base until it overlaps the rear base surface (retain the cable entry).
- Current counts: 43 parts, 7,000 triangles, 6 joints, 6 colours, 0.429 × 1.273 × 0.995 m; no report issues.

## moonJellyfish — latest v01; current: typecheck clean, report-only same
- Verdict: clean
- Clean: v01 front, three-quarter, side, top, and both flex shots were inspected; the bell, segmented rim, four horseshoe gonads, central oral opening, four frilled oral arms, and marginal tentacle bundles are attached and readable. The 612 mm floor clearance is intentional and matches the sample description (“drifting above the floor”), rather than a sinking/hovering accident. Counts: 68 parts, 5,100 triangles, 119 joints, 0.321 × 0.364 × 0.322 m; the expected floor-clearance warning is the only report issue.

## redKangaroo — latest v02; current: typecheck clean, report-only same
- Verdict: clean
- Clean: v02 front, three-quarter, side, head close-up, and both flex shots were inspected; the bipedal hind legs and large feet are planted, the long resting tail is attached, the separate upper/lower jaw reads in the head close-up, forearms/digits are attached, and the joey and pouch read clearly. Counts: 44 parts, 2,598 triangles, 31 joints, 0.580 × 1.845 × 2.034 m; no report issues.

## hummingbirdAtFlower — latest v02; current: typecheck clean, report-only same
- Verdict: clean
- Clean: v02 front, three-quarter, side, head close-up, top, and both flex shots were inspected; the beak enters the low trumpet bloom, the separate upper/lower bills read in the close-up, both wings have continuous membranes and primaries, the feet/tail stay attached, and the stem, leaves, pot, and three blooms form a coherent attached scene. Counts: 78 parts, 3,296 triangles, 24 joints, 0.338 × 0.465 × 0.235 m; no report issues.

## rainyBusStopDiorama — latest none (no prior snapshot); current: typecheck clean, report-only current-only
- Verdict: clean
- Clean: current preview front and three-quarter shots were inspected; the shelter roof, four posts, glass panels, bench, lit advertisement, timetable, bin, puddles, lamp post, and ground plinth are attached/readable. The measured loose clusters are the deliberately free-falling rain rods, not detached shelter parts. Counts: 101 parts, 2,020 triangles, 1 joint, 18 colours, 1.205 × 1.535 × 1.2 m; no report issues.

Agreed clean: vikingLongship, wanderingMerchant, warthogKimi, warthogSonnet, wyvern, moonJellyfish, redKangaroo, hummingbirdAtFlower, rainyBusStopDiorama.
