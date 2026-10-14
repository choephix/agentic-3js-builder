# Audit group d

## griffin — latest v09-lowpoly; current: typecheck clean, report-only same
- Verdict: clean
- Clean: front, three-quarter, side, head close-up, skeleton and both flex shots show two eagle forelegs, two lion hindlegs, connected layered wings/tail, and a visibly separated lower beak; 736 parts, 35,002 triangles, 59 joints, bounds min y -0.005 m.

## hammerheadShark — latest v07-lowpoly; current: typecheck clean, report-only same
- Verdict: needs fix
- [P0] Posterior dorsal fin is detached from the shark body — evidence: report-only loose-part measurement `slab.tail.2` is 48 mm from the body (side shot shows the small second dorsal fin at the tail junction); cause: `samples/hammerheadShark.ts:539-556` places `dorsal2FinPolygon` on `tail1` but its base does not meet the tail surface — fix: move/reshape the polygon base onto the tail1 body (or bridge the gap) while retaining its tail1 bone.

## hamsterRover — latest v02; current: typecheck clean, report-only same
- Verdict: clean
- Clean: front, three-quarter, side, head close-up, skeleton and flex shots show a readable hamster inside the bubble helmet, six wheels, two solar wings and both arms/legs; the 84 mm helmet/chassis loose note is the intended transparent helmet assembly, not a visible detached mesh; 165 parts, 9,836 triangles, y floor contact at 0.

## hedgehogPostie — latest v02; current: typecheck clean, report-only same
- Verdict: clean
- Clean: front, three-quarter, side, head close-up, skeleton and flex shots show a bipedal hedgehog with two arms, two planted hindlegs, separate open jaw, satchel, held letter and separate postbox; reported loose decals are ground mail/scene cards, and the one stiff torso part does not visibly tear; 77 parts, 7,082 triangles.

## highlandCow — latest v13-lowpoly; current: typecheck clean, report-only same
- Verdict: clean
- Clean: front, three-quarter, side, head close-up, skeleton and flex shots show four hooved legs connected to the shaggy body, embedded horns/ear tag, muzzle with heather, and a separate lower jaw; bounds min y 0 and 89 parts / 17,358 triangles.

## honeyBee — latest v02; current: typecheck clean, report-only same
- Verdict: clean
- Clean: front, three-quarter, side, head close-up, skeleton and flex shots show six legs, four spread wings, antennae, honey dipper in the front hands, jar/hive scene, and a visible separate smiling lower jaw; 63 parts, 4,114 triangles, bounds min y 0.

## hydra — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Clean: front, three-quarter, side, head close-up, skeleton and both flex shots show three distinct open-jawed frilled heads on separate neck chains, four legs with feet, continuous scale-covered body and tail; 205 parts, 6,442 triangles, bounds min y 0. The six loose head sweep notes are frill/face accents that read attached in the close-up.

## indianPeafowl — latest v09-lowpoly; current: typecheck clean, report-only same
- Verdict: clean
- Clean: front, three-quarter, side, head close-up, skeleton and flex shots show the displaying semicircular eye-feather fan, blue peacock head/crest/beak, two wings and two legs; 560 parts, 37,134 triangles, 33 joints, bounds min y 0.

## inkwashCrane — latest v07; current: typecheck clean, report-only same
- Verdict: clean
- Clean: front, three-quarter, side, head close-up, skeleton and flex shots show the explicitly intended one-legged standing crane, separated upper/lower beak, red crown, wings, reeds, rock and shallow-water base; 74 parts, 5,024 triangles, bounds min y -0.009 m within floor allowance.

## islandTortoise — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Clean: front, three-quarter, side, head close-up, skeleton and flex shots show four connected legs, head/neck, separate lower jaw, tail and the island payload seated on the shell; 292 parts, 10,862 triangles, bounds min y 0.

## jadeSerpent — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Clean: front, three-quarter, side, head close-up, skeleton and flex shots show the continuous coiled body, open fanged two-part jaw, forked tongue, feathered ruff, turquoise inlay and articulated rattle; 162 parts, 12,528 triangles, 54 joints, bounds min y 0.

## jetpackPenguinMerc — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Clean: front, three-quarter, side, head close-up, skeleton and flex shots show two feet with toes, two flippers, separate lower beak/jaw, jetpack, harness and the oversized rifle riding its weapon mount; 112 parts, 6,732 triangles, 28 joints, bounds min y 0.

## jrpgCockatrice — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- Clean: front, three-quarter, side, head close-up, skeleton and flex shots show rooster head/comb/wattles, visibly split beak, two wings, two clawed legs, serpent tail and plume fan; 89 parts, 6,248 triangles, 85 joints, bounds min y -0.002 m.

## juniperBonsai — latest v08-lowpoly; current: typecheck clean, report-only same
- Verdict: minor
- [P2] Training wire is unnecessarily fine for the low-poly budget — evidence: report-only fine-mesh list identifies `trainingWire` at 684 triangles with 4 mm mean edge; cause: `samples/juniperBonsai.ts` branchLowL2 training-wire geometry — fix: reduce its radial/path segments or replace the wire detail with a simpler primitive/paint while preserving the visible branch rig.

## koiCarp — latest v13-lowpoly; current: typecheck clean, report-only same
- Verdict: clean
- Clean: front, three-quarter, side, head close-up, skeleton and flex shots show a coherent 70 cm fish with dorsal/pectoral/pelvic/anal fins, scale cards, two barbels per side and a visibly separate open lower jaw; 91 parts, 7,448 triangles, bounds size 0.254 × 0.252 × 0.711 m.

## koiPondIsland — latest v02; current: typecheck clean, report-only same
- Verdict: clean
- Clean: front, three-quarter, side, top, head close-up, skeleton and flex shots show the round pond, three koi (including the leaping fish), bridge, lantern, tea house, cherry trees and surrounding island; the two loose island-card notes are scene foliage/details and do not visibly detach; 237 parts, 12,478 triangles, bounds min y 0.

## komodoDragon — latest v02; current: typecheck clean, report-only same
- Verdict: clean
- Clean: front, three-quarter, side, head close-up, skeleton and flex shots show four splayed clawed legs, long grounded tail, scale decals, loose neck folds, forked tongue and visibly separate open lower jaw; 207 parts, 14,592 triangles, bounds min y -0.003 m.

## lantern — latest v01; current: typecheck clean, report-only same
- Verdict: clean
- Clean: front, three-quarter, side, back, top and low hero shots show a connected four-sided lantern with frame, glowing panels, roof and hanging ring; 10 parts, 444 triangles, bounds min y 0.

## lanternGhost — latest v02; current: typecheck clean, report-only same
- Verdict: clean
- Clean: front, three-quarter, side, head close-up, skeleton and both flex shots show the intended hovering ghost, wavy tail, open mouth, nightcap, held lantern and trailing sparkles; the report's one warning (lowest point 150 mm above floor) matches `samples/lanternGhost.ts:25` (`HOVER = 0.15`) and is intentional; 68 parts, 2,210 triangles.

## SDK patterns

- No cross-sample SDK defect was established. Current report-only counts and issue status matched each latest snapshot for all 19 samples.
