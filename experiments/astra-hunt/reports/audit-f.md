# Group f audit

## nesBoar — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- The v03 sheet, head close-up, skeleton X-rays, and both flex shots show a readable four-legged boar with four planted hooves, separate open jaw, attached mane/ears/tail, and no visible gaps or rig tearing; report is 0 issues, 35 parts, 1,010 triangles, 32 joints, bounds 0.597 × 1.091 × 1.624 m.

## nesGoblinShaman — latest v02; current: typecheck clean, report-only same
- Verdict: needs fix
- [P0] The creature is facing the wrong way: the v02 `front.png` shows a featureless back of the head, while `back.png` shows the eyes, nose, and open mouth; this violates the +Z facing contract and makes the front view unreadable — evidence: `/home/cx/tmp/public/nilo/agentic-3js-builder/snaps/nesGoblinShaman/B/snaps/v02-front.png`, `/home/cx/tmp/public/nilo/agentic-3js-builder/snaps/nesGoblinShaman/B/snaps/v02-back.png`, `/home/cx/tmp/public/nilo/agentic-3js-builder/snaps/nesGoblinShaman/B/snaps/v02-head.png` — cause: `samples/nesGoblinShaman.ts:203-219` builds the face/nose with `head.local(... z ...)`; for a forward head, local Y is forward and local Z is up — fix: swap the face feature's forward offsets from local Z to local Y (and recalculate the corresponding jaw/eye/tooth placements) so the face reads in the +Z front view.

## nesYeti — latest v02; current: typecheck clean, report-only same
- Verdict: broken
- [P0] The model has four full legs (frontHipL/R and hindHipL/R) in addition to its arms, making the bipedal yeti read as a quadruped — evidence: v02 sheet `front`, `three-quarter`, `side`, `skeleton`, and both flex shots visibly show two front legs under the shoulders and two hind legs; the report skeleton also lists `frontHipL/R` and `hindHipL/R` — cause: `samples/nesYeti.ts:259-292` loops over both `kind = "front"` and `kind = "hind"` and creates a leg chain for each — fix: remove the front leg pair and retain only the hind leg pair as legs, leaving the shoulder chains as arms.
- [P1] The dark square face/mask block rides high over the head and obscures the facial placement — evidence: `/home/cx/tmp/public/nilo/agentic-3js-builder/snaps/nesYeti/B/snaps/v02-head.png` and v02 sheet head close-up/front — cause: `samples/nesYeti.ts:339-345` places `leatherFace` separately over the high skull station — fix: lower/reseat the face block on the skull and align its eyes/nose/mouth with the head and jaw.

## nileCrocodile — latest v01; current: typecheck clean, report-only differs: current 562 parts/14,058 triangles/1.435 × 0.547 × 4.058 m vs latest 346 parts/18,456 triangles/1.421 × 0.628 × 4.054 m (both 0 issues)
- Verdict: clean
- The v01 sheet, head close-up, skeleton X-rays, and flex shots show a recognizable long crocodile with four legs, continuous tail, clearly separate upper/lower jaws and teeth, and no visible detached limbs; current preview also shows the same coherent crocodile silhouette at `/home/cx/tmp/public/nilo/agentic-3js-builder/preview/nileCrocodile/three-quarter.png`.

## octopusBarista — latest v01; current: typecheck clean, report-only differs: current 155 parts/10,176 triangles vs latest 154 parts/10,174 triangles (same 0.718 × 0.499 × 0.921 m bounds and 0 issues)
- Verdict: clean
- The v01 sheet, head close-up, skeleton X-rays, flex shots, and current preview show eight tentacles attached to the octopus, a readable separate jaw, barista details, and a stable cart with no visible floating required parts — evidence: `/home/cx/tmp/public/nilo/agentic-3js-builder/preview/octopusBarista/three-quarter.png` and v01 sheet.

## oldFisherman — latest v02; current: typecheck clean, report-only same
- Verdict: clean
- The v02 sheet/head close-up and both flex shots show a readable fisherman with separate open jaw, planted boots, rod in hand, lantern in hand, and fish crate on the floor; held props remain attached through the flexes and report is 0 issues, 181 parts, 9,594 triangles, 48 joints.

## orcBerserkerAstra — latest v04; current: typecheck clean, report-only same
- Verdict: clean
- The v04 sheet/head close-up, skeleton X-rays, and flex shots show a readable bipedal orc with two legs, two arms, tusks, separate jaw, and hammer held in the hand without visible detachment; report is 0 issues, 63 parts, 2,532 triangles, 34 joints.

## orcBerserkerGemini — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- The v03 sheet/head close-up, skeleton X-rays, and flex shots show two planted legs, two arms, tusks, separate jaw, and the spear/mace props staying with the hands/shoulder; no visible tearing or floating required part, report is 0 issues, 114 parts, 5,194 triangles, 34 joints.

## orcBerserkerKimi — latest v04; current: typecheck clean, report-only same
- Verdict: clean
- The v04 sheet/head close-up, skeleton X-rays, and flex shots show a readable two-legged orc with tusks, separate jaw, hands/fingers, attached shoulder armor, and held axe; no visible detachment or rig tearing, report is 0 issues, 141 parts, 7,430 triangles, 34 joints.

## orcBerserkerOx — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- The v03 sheet/head close-up, skeleton X-rays, and flex shots show a readable biped with two arms/legs, tusks, separate jaw, attached armor and braids, and the large axe remaining in hand; report is 0 issues, 97 parts, 6,450 triangles, 34 joints.

## orcBerserkerSonnet — latest v04; current: typecheck clean, report-only same
- Verdict: clean
- The v04 sheet/head close-up, skeleton X-rays, and flex shots show two planted legs, two arms, tusks and open separate jaw, attached braids/armor, and a held axe; no visible rig tearing or detached required parts, report is 0 issues, 270 parts, 11,504 triangles, 82 joints.

## oreBeetle — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- The v03 sheet/head close-up, top/side views, skeleton X-rays, and flex shots show six legs, antennae, mandibles/jaw, elytra and the mining lantern/ore details attached; no visible floating limb or floor violation, report is 0 issues, 125 parts, 2,736 triangles, 35 joints.

## origamiDragon — latest v03; current: typecheck clean, report-only differs: current 1,056 triangles and 1.255 × 1.136 × 3.362 m vs latest 1,144 triangles and 1.262 × 1.135 × 3.362 m (same 60 parts, 0 issues)
- Verdict: needs fix
- [P0] Both large horns are visibly detached and floating above the skull — evidence: v03 head shot `/home/cx/tmp/public/nilo/agentic-3js-builder/snaps/origamiDragon/B/snaps/v03-head.png`, v03 sheet head close-up, current preview `/home/cx/tmp/public/nilo/agentic-3js-builder/preview/origamiDragon/three-quarter.png`; report-only also flags hornL/hornR 48–54 mm from the head — cause: `samples/origamiDragon.ts:182-193` sets `hornBase = P(hb, s * 0.07, 0.13, -0.02)`, above/outside the skull surface — fix: derive each horn base from a head surface point or lower/inset the base until the horn physically meets the skull, while keeping the horn on the head bone.

## owlbear — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- The v03 sheet/head close-up, side/top views, skeleton X-rays, and flex shots show a coherent four-legged owlbear with owl facial disc/beak, bear body, claws, tail, and separate jaw; no visible detached parts or flex tearing, report is 0 issues, 85 parts, 7,240 triangles, 26 joints.

## pangolin — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- The v03 sheet/head close-up, top/side views, skeleton X-rays, and flex shots show four legs, continuous overlapping scales and tail, tongue, claws, and an unmistakable separate open jaw; no visible detachment, report is 0 issues, 247 parts, 5,402 triangles, 38 joints.

## paperDragonKite — latest v03; current: typecheck clean, report-only same
- Verdict: clean
- The v03 sheet/head close-up, skeleton X-rays, and flex shots show the intended long kite-dragon with four legs, separate upper/lower jaws and teeth, horns, whiskers, mane, tail streamers, and attached frame/skin details; no visible required-part detachment, report is 0 issues, 274 parts, 13,402 triangles, 60 joints.

## pastelUnicornFoal — latest v02; current: typecheck clean, report-only same
- Verdict: clean
- The v02 sheet/head close-up, skeleton X-rays, and flex shots show a readable four-legged foal with horn, ears, eyes, separate jaw, hooves, rainbow mane/tail and floor contact; no visible tearing or floating parts, report is 0 issues, 84 parts, 4,956 triangles, 27 joints.

## peacock — latest v05-lowpoly; current: typecheck clean, report-only same
- Verdict: clean
- The v05-lowpoly sheet/head close-up, side/top views, skeleton X-rays, and flex shots show two legs, wings, beak/jaw, crest and a large attached feather train with readable eye-spots; no visible detached feathers or rig tearing, report is 0 issues, 106 parts, 5,600 triangles, 28 joints.

## penguinIceCreamCart — latest v02; current: typecheck clean, report-only same
- Verdict: clean
- The v02 sheet/head close-up, skeleton X-rays, and flex shots show the penguin's separate jaw, flippers, feet, held ice-cream cone, and the complete cart/parasol/wheels; the decorative sparkles stay with the held hand and no required part visibly floats, report is 0 issues, 90 parts, 3,710 triangles, 30 joints.

## SDK patterns

- No cross-sample SDK defect was established. The three report-only count/bounds differences (nileCrocodile, octopusBarista, origamiDragon) were checked with current previews; they do not change the visual verdicts except origamiDragon's sample-authored detached horns.
