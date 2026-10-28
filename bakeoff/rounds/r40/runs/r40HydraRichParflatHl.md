<!-- call: plan -->

```json
{
  "name": "Hydra of the Broken Axes",
  "description": "A scarred, battle-worn five-headed Norse hydra in a gritty God of War style: slate-green scales, bone horns, rusted iron bands and embedded broken weapons, with ember-orange eyes and frost-blue runes glowing against the muted pelt.",
  "builderName": "hydraGodOfWar",
  "size": [7.2, 5.8, 8.9],
  "layout": "A huge four-legged reptilian brute standing on a bare floor. It faces +Z. The body is a heavy barrel with a high shoulder hump, from z -2.0 to 2.3 and about y 1.2 to 3.3. Four thick pillar legs stand at x = ±1.1..1.55: short stocky forelegs at the front and digitigrade hindlegs behind. A long low tail runs back to z = -5.1, tapering to a bone spade tip. Five necks rise from the shoulder hump (z ~1.5, y ~2.8) in a fan, each an S-curve ending in a head that looks forward (+Z). From the centre outward the head heights are: centre (x 0, head y ~5.0, tallest, alpha, biggest, scale 1.25), inner pair (x ±2.0, head y ~4.5, scale 1.0), outer pair (x ±2.95, head y ~3.55, lowest, angled outward, scale 0.85). Rest pose: necks spread apart and extended, every jaw built as a separate upper and lower jaw so it can open, tails and legs extended and neutral. Style (God of War): heavy, brutal, weathered, grounded. Chunky blocky silhouettes and faceted low-poly forms. Desaturated cold slate-green hide with paler weathered ash-bone belly and throat plates. Every part is scarred: long pale scar-tissue gashes, cauterised burn patches, broken horn tips wrapped in iron bands, chipped teeth. Worn rusty iron and bronze bands, chains and rivets show past battles. Broken weapons (axe heads, spear tips, a chain-link wrap) are embedded in hide. Warm ember-orange glow on eyes, wounds and scars, and cold frost-blue glow on carved Nordic runes. Colour is only by place: darker scales on the back, lighter belly and underside, ash/mud at the feet, rust at the iron. Parts reach the same joints through shared mounts so seams hide inside overlapping volumes. Necks start buried inside the torso.",
  "palette": {
    "scaleDark": "#27332f",
    "scaleMid": "#3a4f48",
    "scaleLight": "#58776a",
    "belly": "#a39b80",
    "bellyDark": "#7b7359",
    "bone": "#dcd2b6",
    "boneDark": "#968b6f",
    "hornDark": "#3b3029",
    "claw": "#cfc4a8",
    "ember": "#ff6a1a",
    "emberHot": "#ffc247",
    "frost": "#9fe0f2",
    "iron": "#4b4e57",
    "ironDark": "#25272d",
    "rust": "#7a4328",
    "bronze": "#a8793a",
    "leather": "#4a3224",
    "blood": "#7a1a14",
    "scar": "#c9b8a0",
    "mouth": "#6a1f26",
    "tongue": "#a63a3a",
    "pupil": "#120a08",
    "ash": "#5a5648"
  },
  "mounts": {
    "pelvis": [0, 2.1, -1.0],
    "chestCentre": [0, 2.4, 1.3],
    "neckBaseC": [0, 2.9, 1.5],
    "neckBaseIL": [0.9, 2.8, 1.5],
    "neckBaseIR": [-0.9, 2.8, 1.5],
    "neckBaseOL": [1.3, 2.7, 1.4],
    "neckBaseOR": [-1.3, 2.7, 1.4],
    "headSocketC": [0, 5.0, 2.6],
    "headSocketIL": [2.0, 4.5, 2.6],
    "headSocketIR": [-2.0, 4.5, 2.6],
    "headSocketOL": [2.95, 3.55, 2.55],
    "headSocketOR": [-2.95, 3.55, 2.55],
    "shoulderL": [1.15, 2.0, 1.4],
    "shoulderR": [-1.15, 2.0, 1.4],
    "hipL": [1.15, 2.0, -1.3],
    "hipR": [-1.15, 2.0, -1.3],
    "tailRoot": [0, 2.1, -1.7],
    "tailTip": [0, 1.05, -5.0],
    "backTop": [0, 3.3, 0.2],
    "bellyBottom": [0, 1.2, 0]
  },
  "joints": [
    { "name": "pelvis", "at": [0, 2.1, -1.0], "dir": [0, 0, 1], "role": "spine", "group": "torso" },
    { "name": "spine1", "parent": "pelvis", "at": [0, 2.2, 0.1], "dir": [0, 0.1, 1], "role": "spine", "group": "torso" },
    { "name": "chest", "parent": "spine1", "at": [0, 2.4, 1.3], "dir": [0, 0.1, 1], "role": "spine", "group": "torso" },

    { "name": "tail1", "parent": "pelvis", "at": [0, 2.1, -1.7], "dir": [0, -0.2, -1], "role": "tail", "group": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 1.95, -2.5], "dir": [0, -0.3, -1], "role": "tail", "group": "tail" },
    { "name": "tail3", "parent": "tail2", "at": [0, 1.7, -3.2], "dir": [0, -0.35, -1], "role": "tail", "group": "tail" },
    { "name": "tail4", "parent": "tail3", "at": [0, 1.45, -3.9], "dir": [0, -0.35, -1], "role": "tail", "group": "tail" },
    { "name": "tail5", "parent": "tail4", "at": [0, 1.2, -4.5], "dir": [0, -0.3, -1], "role": "tail", "group": "tail" },
    { "name": "tail6", "parent": "tail5", "at": [0, 1.05, -5.0], "dir": [0, -0.1, -1], "role": "tail", "group": "tail" },

    { "name": "shoulderFL", "parent": "chest", "at": [1.15, 2.0, 1.4], "dir": [0.2, -1, -0.1], "role": "leg", "group": "legs" },
    { "name": "elbowFL", "parent": "shoulderFL", "at": [1.5, 1.0, 1.1], "dir": [-0.1, -0.6, 0.4], "role": "leg", "group": "legs" },
    { "name": "wristFL", "parent": "elbowFL", "at": [1.4, 0.4, 1.5], "dir": [0, -0.5, 0.4], "role": "leg", "group": "legs" },
    { "name": "pawFL", "parent": "wristFL", "at": [1.4, 0.15, 1.75], "dir": [0, 0, 1], "role": "leg", "group": "legs" },
    { "name": "shoulderFR", "parent": "chest", "at": [-1.15, 2.0, 1.4], "dir": [-0.2, -1, -0.1], "role": "leg", "group": "legs" },
    { "name": "elbowFR", "parent": "shoulderFR", "at": [-1.5, 1.0, 1.1], "dir": [0.1, -0.6, 0.4], "role": "leg", "group": "legs" },
    { "name": "wristFR", "parent": "elbowFR", "at": [-1.4, 0.4, 1.5], "dir": [0, -0.5, 0.4], "role": "leg", "group": "legs" },
    { "name": "pawFR", "parent": "wristFR", "at": [-1.4, 0.15, 1.75], "dir": [0, 0, 1], "role": "leg", "group": "legs" },

    { "name": "hipHL", "parent": "pelvis", "at": [1.15, 2.0, -1.3], "dir": [0.3, -0.6, 0.7], "role": "leg", "group": "legs" },
    { "name": "kneeHL", "parent": "hipHL", "at": [1.55, 1.3, -0.65], "dir": [-0.1, -0.45, -1.1], "role": "leg", "group": "legs" },
    { "name": "hockHL", "parent": "kneeHL", "at": [1.45, 0.85, -1.75], "dir": [0, -0.7, 0.35], "role": "leg", "group": "legs" },
    { "name": "pawHL", "parent": "hockHL", "at": [1.4, 0.15, -1.3], "dir": [0, 0, 1], "role": "leg", "group": "legs" },
    { "name": "hipHR", "parent": "pelvis", "at": [-1.15, 2.0, -1.3], "dir": [-0.3, -0.6, 0.7], "role": "leg", "group": "legs" },
    { "name": "kneeHR", "parent": "hipHR", "at": [-1.55, 1.3, -0.65], "dir": [0.1, -0.45, -1.1], "role": "leg", "group": "legs" },
    { "name": "hockHR", "parent": "kneeHR", "at": [-1.45, 0.85, -1.75], "dir": [0, -0.7, 0.35], "role": "leg", "group": "legs" },
    { "name": "pawHR", "parent": "hockHR", "at": [-1.4, 0.15, -1.3], "dir": [0, 0, 1], "role": "leg", "group": "legs" },

    { "name": "neckC1", "parent": "chest", "at": [0, 2.9, 1.5], "dir": [0, 0.8, 0.4], "role": "neck", "group": "headC" },
    { "name": "neckC2", "parent": "neckC1", "at": [0, 3.6, 1.8], "dir": [0, 0.7, 0.2], "role": "neck", "group": "headC" },
    { "name": "neckC3", "parent": "neckC2", "at": [0, 4.3, 1.95], "dir": [0, 0.5, 0.25], "role": "neck", "group": "headC" },
    { "name": "neckC4", "parent": "neckC3", "at": [0, 4.8, 2.2], "dir": [0, 0.2, 0.4], "role": "neck", "group": "headC" },
    { "name": "headC", "parent": "neckC4", "at": [0, 5.0, 2.6], "dir": [0, -0.12, 1], "role": "head", "group": "headC" },
    { "name": "jawC", "parent": "headC", "at": [0, 4.85, 2.85], "dir": [0, -0.05, 1], "role": "jaw", "group": "headC" },

    { "name": "neckIL1", "parent": "chest", "at": [0.9, 2.8, 1.5], "dir": [0.3, 0.7, 0.3], "role": "neck", "group": "headsInner" },
    { "name": "neckIL2", "parent": "neckIL1", "at": [1.3, 3.4, 1.8], "dir": [0.3, 0.6, 0.2], "role": "neck", "group": "headsInner" },
    { "name": "neckIL3", "parent": "neckIL2", "at": [1.65, 3.95, 2.0], "dir": [0.25, 0.5, 0.25], "role": "neck", "group": "headsInner" },
    { "name": "neckIL4", "parent": "neckIL3", "at": [1.9, 4.35, 2.25], "dir": [0.1, 0.2, 0.4], "role": "neck", "group": "headsInner" },
    { "name": "headIL", "parent": "neckIL4", "at": [2.0, 4.5, 2.6], "dir": [0.12, -0.12, 1], "role": "head", "group": "headsInner" },
    { "name": "jawIL", "parent": "headIL", "at": [2.02, 4.38, 2.8], "dir": [0.1, -0.05, 1], "role": "jaw", "group": "headsInner" },
    { "name": "neckIR1", "parent": "chest", "at": [-0.9, 2.8, 1.5], "dir": [-0.3, 0.7, 0.3], "role": "neck", "group": "headsInner" },
    { "name": "neckIR2", "parent": "neckIR1", "at": [-1.3, 3.4, 1.8], "dir": [-0.3, 0.6, 0.2], "role": "neck", "group": "headsInner" },
    { "name": "neckIR3", "parent": "neckIR2", "at": [-1.65, 3.95, 2.0], "dir": [-0.25, 0.5, 0.25], "role": "neck", "group": "headsInner" },
    { "name": "neckIR4", "parent": "neckIR3", "at": [-1.9, 4.35, 2.25], "dir": [-0.1, 0.2, 0.4], "role": "neck", "group": "headsInner" },
    { "name": "headIR", "parent": "neckIR4", "at": [-2.0, 4.5, 2.6], "dir": [-0.12, -0.12, 1], "role": "head", "group": "headsInner" },
    { "name": "jawIR", "parent": "headIR", "at": [-2.02, 4.38, 2.8], "dir": [-0.1, -0.05, 1], "role": "jaw", "group": "headsInner" },

    { "name": "neckOL1", "parent": "chest", "at": [1.3, 2.7, 1.4], "dir": [0.7, 0.3, 0.2], "role": "neck", "group": "headsOuter" },
    { "name": "neckOL2", "parent": "neckOL1", "at": [2.0, 3.0, 1.6], "dir": [0.6, 0.3, 0.3], "role": "neck", "group": "headsOuter" },
    { "name": "neckOL3", "parent": "neckOL2", "at": [2.55, 3.3, 1.9], "dir": [0.3, 0.2, 0.3], "role": "neck", "group": "headsOuter" },
    { "name": "neckOL4", "parent": "neckOL3", "at": [2.85, 3.5, 2.2], "dir": [0.1, 0.1, 0.35], "role": "neck", "group": "headsOuter" },
    { "name": "headOL", "parent": "neckOL4", "at": [2.95, 3.55, 2.55], "dir": [0.3, -0.15, 1], "role": "head", "group": "headsOuter" },
    { "name": "jawOL", "parent": "headOL", "at": [3.0, 3.45, 2.72], "dir": [0.3, -0.1, 1], "role": "jaw", "group": "headsOuter" },
    { "name": "neckOR1", "parent": "chest", "at": [-1.3, 2.7, 1.4], "dir": [-0.7, 0.3, 0.2], "role": "neck", "group": "headsOuter" },
    { "name": "neckOR2", "parent": "neckOR1", "at": [-2.0, 3.0, 1.6], "dir": [-0.6, 0.3, 0.3], "role": "neck", "group": "headsOuter" },
    { "name": "neckOR3", "parent": "neckOR2", "at": [-2.55, 3.3, 1.9], "dir": [-0.3, 0.2, 0.3], "role": "neck", "group": "headsOuter" },
    { "name": "neckOR4", "parent": "neckOR3", "at": [-2.85, 3.5, 2.2], "dir": [-0.1, 0.1, 0.35], "role": "neck", "group": "headsOuter" },
    { "name": "headOR", "parent": "neckOR4", "at": [-2.95, 3.55, 2.55], "dir": [-0.3, -0.15, 1], "role": "head", "group": "headsOuter" },
    { "name": "jawOR", "parent": "headOR", "at": [-3.0, 3.45, 2.72], "dir": [-0.3, -0.1, 1], "role": "jaw", "group": "headsOuter" }
  ],
  "parts": [
    {
      "id": "torso",
      "builds": "The barrel body: one loft over pelvis/spine1/chest (stations around z -1.9 r0.7, z -1 r1.0, z 0 r1.15, z 1.2 r1.2 hump, z 2.1 r0.9; centre y ~2.2, half-height ~1.0, half-width ~1.1), scaleDark on the back and scaleMid on the flanks via sectors, with a pale belly (belly / bellyDark) from the underside up the flanks. A big shoulder hump with five collar mounds (scaleMid, each ringed with small bone spikes) where each neck enters, at neckBaseC/IL/IR/OL/OR, so the necks emerge from inside the body. A dorsal ridge of broad overlapping bone plates and spikes (bone with boneDark bases) running from the hump to the rump, big at the shoulders and small at the hips. Rib bands and belly plates (bellyDark rows). Battle damage: three long pale scar gashes (scar) across the flanks, with a few ember-glowing seams, and two cauterised burn patches (ash and blood). Embedded broken weapons: an axe head (iron with a rust edge and a broken leather-wrapped shaft stump) stuck in the left flank, and a snapped spear tip in the right shoulder. A rusty chain (ironDark/rust torus links) loosely wrapped diagonally around the barrel with an iron buckle plate. Carved Nordic rune brand on each flank, 5 runes as small parts glowing frost, in a ring of ironDark. Stubby hip and shoulder muscle masses overlap the leg tops (the legs part owns the legs themselves). Glow kit on runes, wounds and scar seams.",
      "box": [[-1.3, 1.2, -2.0], [1.3, 3.4, 2.3]],
      "attaches": "Necks start inside the collar mounds at neckBase* mounts (the head parts own the necks). Legs hang from shoulderL/R and hipL/R. The tail starts at tailRoot, which the torso rump covers with a rounded cap.",
      "joints": ["pelvis", "spine1", "chest"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "legs",
      "builds": "All four legs, owning their thigh and shoulder masses and feet. Forelegs are short, thick, pillar-like with a heavy shoulder blob (scaleMid) and a bone elbow spike each, sweeping smoothly from shoulderF* to elbowF*, wristF* and pawF* (radii 0.42 at the shoulder down to 0.22 at the wrist). Hindlegs are digitigrade: big thigh from hipH* to a forward knee, long shin back to a hock with a bone hock spur, then a lower leg forward to pawH*. Paws are chunky splayed three-toed feet, 3 toes each in scaleDark with ash dirt on the lower parts, and thick curved bone claws (claw colour, three per paw, forward). Every paw rests flat on y=0 (the feet sink at most 2%). Armoured wear: an iron cuff with a rust band and 4 rivets on one wrist, a bronze band on the left hock, and a frayed leather strap with a chain length on a foreleg. A pale scar gash on a thigh, a patch of belly-pale hide on the inner legs, and ash/mud coloured lower leg bands. Rune frost glow at each shoulder (one small rune each).",
      "box": [[-2.0, 0, -2.4], [2.0, 2.6, 2.3]],
      "attaches": "Hangs from the torso at shoulderL/R and hipL/R mounts. The leg joints are children of chest and pelvis.",
      "joints": ["shoulderFL", "elbowFL", "wristFL", "pawFL", "shoulderFR", "elbowFR", "wristFR", "pawFR", "hipHL", "kneeHL", "hockHL", "pawHL", "hipHR", "kneeHR", "hockHR", "pawHR"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "tail",
      "builds": "A long heavy tail on tail1..tail6 from tailRoot (0,2.1,-1.7) to tailTip (0,1.05,-5.0): one smooth sweep with radius from ~0.6 down to 0.07, scaleDark back with a pale belly strip. A row of bone dorsal spikes growing smaller toward the tip, with boneDark bases. A bone spade/blade tip made as an extrude, with a notch and a chipped edge. Wounds: a ring of ironDark with rust ring bands near the middle, a thick chain wound twice around it, a broken harpoon head embedded near the tail root (iron head, leather rope tail), and a long scar with ember glow. Frost rune ring (3 small runes, glowing) around the tail root where the pelvis meets it. Ash-coloured dirt on the underside.",
      "box": [[-0.7, 0.8, -5.2], [0.7, 2.6, -1.6]],
      "attaches": "Starts at tailRoot, overlapping the torso rump, and uses the tail1..tail6 joints.",
      "joints": ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6"],
      "floor": false,
      "budget": 100
    },
    {
      "id": "headC",
      "builds": "The alpha centre head and neck, the hero piece (head scale H = 1.25: the skull is ~1.3 m long and 0.9 m wide). The neck is one smooth sweep over neckC1..neckC4 to headC: radius 0.5 at the base down to 0.33 at the head, scaleDark back, with a pale belly/throat strip made of banded throat plates. A row of bone dorsal spikes up the back of the neck and a ruffle frill of bone blades behind the skull. The skull is a faceted wedge with brow ridges over big ember eyes (glowing emberHot ring, pupil slit in pupil, an inset dark socket), a long blunt snout with nostril pits, with an upper jaw on headC carrying two rows of teeth (bone, big fangs at the front, chipped), and a separate lower jaw on jawC (scaleMid) with lower teeth and a mouth interior (mouth and tongue). A crown of 6 massive swept-back horns (hornDark with bone tips and boneDark rings), the two biggest curving outward. One horn is broken and capped with an iron band and rust rivets. A big scar gash over the left eye (scar tissue, ember glow seam). Iron muzzle ring with a short chain. Frost rune carved on the forehead (glowing). Cheek plates with spikes.",
      "box": [[-0.8, 2.7, 1.2], [0.8, 5.8, 4.0]],
      "attaches": "The neck root is buried in the chest collar at neckBaseC; the head joint is at headSocketC, with the jaw at jawC. The torso is the neighbour at the base.",
      "joints": ["neckC1", "neckC2", "neckC3", "neckC4", "headC", "jawC"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "headsInner",
      "builds": "The two inner heads and necks (left L = +X, right R = -X), mirrored in design, head scale H = 1.0 (skull ~1.05 m long) with slightly different features: neck sweeps over neckIL1..IL4 / neckIR1..IR4 to headIL / headIR with radius 0.42 down to 0.28, scaleDark back and a pale throat strip, bone dorsal neck spikes, and a bone frill. Each head matches the centre head's design language at smaller scale: a faceted skull, brow ridges, glowing ember eyes (emberHot ring, pupil slit), nostrils, an upper jaw on the head joint with two rows of teeth, and a separate lower jaw on jawIL/jawIR (with mouth and tongue). Differences: the left head has a pair of long straight horns and an iron-banded snout; the right head has a ram-like pair of curled horns (spiral) and a scarred cheek with a stitched leather patch. Each has a small frost rune on the brow, and one pale scar across the snout.",
      "box": [[-2.6, 2.6, 1.2], [2.6, 5.0, 3.8]],
      "attaches": "Neck roots are buried in the torso collars at neckBaseIL and neckBaseIR. The head joints are at headSocketIL/IR with jaws at jawIL/jawIR. The necks cross the space between the centre head (x 0) and the outer heads (x ±3) without touching them.",
      "joints": ["neckIL1", "neckIL2", "neckIL3", "neckIL4", "headIL", "jawIL", "neckIR1", "neckIR2", "neckIR3", "neckIR4", "headIR", "jawIR"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "headsOuter",
      "builds": "The two outer heads and necks (L = +X, R = -X), the lowest heads, head scale H = 0.85 (skull ~0.9 m long), angled outward, with thinner necks (radius 0.38 down to 0.24) sweeping over neckOL1..OL4 / neckOR1..OR4 to headOL / headOR. Same design language: scaleDark back, pale throat strip, bone dorsal neck spikes, faceted skull, brow ridges, ember eyes, nostrils, upper jaw on the head joint with teeth and a separate lower jaw on jawOL/jawOR with mouth and tongue. These are the most battle-worn: the left head is blind in one eye (a pale scarred, closed eye with a long scar across it and no glow) and has a snapped horn stump wrapped in leather and rust-iron, and a spear tip buried in its jaw; the right head has a cauterised half-severed neck wound (ash, blood and ember glowing seam, a bone ring plate stitched to the neck), one short horn and a broken tooth line. Both have small frost runes on the cheek.",
      "box": [[-3.6, 2.4, 1.1], [3.6, 4.2, 3.5]],
      "attaches": "Neck roots are buried in the torso collars at neckBaseOL and neckBaseOR. The head joints are at headSocketOL/OR with jaws at jawOL/jawOR. The necks run outward and slightly forward under the inner necks.",
      "joints": ["neckOL1", "neckOL2", "neckOL3", "neckOL4", "headOL", "jawOL", "neckOR1", "neckOR2", "neckOR3", "neckOR4", "headOR", "jawOR"],
      "floor": false,
      "budget": 160
    }
  ]
}
```

<!-- call: tail -->

```ts
import * as THREE from "three";
import { catmull, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTail({ b, J, P, M }: Ctx) {
  const r = rng(11);
  const pts: number[][] = [
    [0, 2.1, -1.7], [0, 1.95, -2.5], [0, 1.7, -3.2], [0, 1.45, -3.9], [0, 1.2, -4.5], [0, 1.05, -4.95],
  ];
  const path = catmull(pts);
  const joints = [J.tail1, J.tail2, J.tail3, J.tail4, J.tail5, J.tail6];
  const rad = (t: number) => 0.6 * (1 - t) + 0.08 * t;
  const tube = b.sweep(path, [0.6, 0.07], {
    bone: joints,
    color: P.scaleDark,
    sectors: [[130, 230, P.belly]],
    sides: 8,
    caps: "round",
  });
  const boneAt = (t: number) => joints[Math.min(5, Math.floor(t * 6))];

  // dorsal spikes with dark bases
  const N = 9;
  for (let i = 0; i < N; i++) {
    const t = 0.06 + (i / (N - 1)) * 0.82;
    const p = tube.at(t, 0);
    const s = 1 - t * 0.75;
    b.stick(new THREE.CylinderGeometry(0.15 * s, 0.19 * s, 0.07, 6), P.boneDark, p, { embed: 0.3 });
    b.stick(new THREE.ConeGeometry(0.12 * s, 0.5 * s, 5), P.bone, p, { embed: -0.1 });
  }

  // ash dirt on underside
  for (let i = 0; i < 6; i++) {
    const t = 0.15 + i * 0.14;
    b.stick(new THREE.BoxGeometry(0.3 * (1 - t * 0.6), 0.03, 0.22), P.ash, tube.at(t, 180), { embed: 0.3 });
  }

  // iron ring with rust bands near middle
  const ringT = 0.45;
  const rp = tube.at(ringT, 0);
  const rr = rad(ringT) + 0.03;
  const ringAt = (t: number) => path.at(t);
  const addRing = (t: number, R: number, tube2: number, col: string) => {
    const c = ringAt(t);
    const tg = path.tangentAt(t);
    const m = b.part(new THREE.TorusGeometry(R, tube2, 5, 12), col, { at: c, dir: tg, axis: "z", bone: boneAt(t) });
    return m;
  };
  addRing(ringT, rad(ringT) + 0.04, 0.045, P.ironDark);
  addRing(ringT - 0.05, rad(ringT - 0.05) + 0.03, 0.03, P.rust);
  addRing(ringT + 0.05, rad(ringT + 0.05) + 0.03, 0.03, P.rust);
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2;
    const c = ringAt(ringT);
    b.part(new THREE.SphereGeometry(0.035, 5, 4), P.bronze, {
      at: [c.x + Math.sin(a) * (rr + 0.04), c.y + Math.cos(a) * (rr + 0.04), c.z],
      bone: boneAt(ringT),
    });
  }

  // chain wound twice
  const chainPts: number[][] = [];
  for (let i = 0; i <= 28; i++) {
    const u = i / 28;
    const t = 0.52 + u * 0.14;
    const c = ringAt(t);
    const a = u * Math.PI * 4;
    const R = rad(t) + 0.06;
    chainPts.push([c.x + Math.sin(a) * R, c.y + Math.cos(a) * R, c.z]);
  }
  chainPts.forEach((p, i) => {
    if (i % 2 === 0) {
      const g = new THREE.TorusGeometry(0.06, 0.018, 4, 8);
      b.part(g, i % 4 === 0 ? P.iron : P.rust, {
        at: p,
        rotation: [i % 4 === 0 ? 90 : 0, (i * 37) % 180, 0],
        bone: boneAt(0.6),
      });
    }
  });

  // harpoon near root
  const hp = tube.at(0.12, 70);
  b.stick(new THREE.ConeGeometry(0.1, 0.4, 4), P.iron, hp, { embed: 0.3 });
  b.stick(new THREE.BoxGeometry(0.16, 0.03, 0.03), P.rust, hp.moved([0, 0.12, 0]), { embed: 0 });
  b.stick(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 5), P.leather, hp.moved([0, 0.45, 0]), { embed: 0 });

  // scar with ember glow
  for (let i = 0; i < 6; i++) {
    const t = 0.3 + i * 0.07;
    const p = tube.at(t, -60 + i * 6);
    b.stick(new THREE.BoxGeometry(0.05, 0.02, 0.1), P.scar, p, { embed: 0.4 });
    glow(b.stick(new THREE.BoxGeometry(0.02, 0.015, 0.08), P.ember, p.moved([0, 0.005, 0]), { embed: 0.2 }), 1.5);
  }

  // frost runes ring at root
  for (let k = 0; k < 3; k++) {
    const p = tube.at(0.05, -50 + k * 50);
    const rune = b.stick(new THREE.BoxGeometry(0.1, 0.02, 0.16), P.ironDark, p, { embed: 0.3 });
    glow(b.stick(new THREE.BoxGeometry(0.03, 0.02, 0.12), P.frost, p.moved([0, 0.012, 0]), { embed: 0.2 }), 1.5);
    glow(b.stick(new THREE.BoxGeometry(0.08, 0.02, 0.03), P.frost, p.moved([0, 0.012, 0.02]), { embed: 0.2 }), 1.5);
  }

  // spade tip
  const tipAt = [0, 1.02, -4.95];
  const spade = b.extrude(
    [
      [0, -0.12], [0.3, -0.35], [0.4, -0.75], [0.12, -1.15], [0.02, -1.0], [-0.04, -1.2],
      [-0.12, -1.15], [-0.4, -0.75], [-0.3, -0.35],
    ],
    { at: tipAt, x: [1, 0, 0], y: [0, 0.05, -1], thickness: 0.07, bevel: 0.01, color: P.bone, bone: J.tail6 },
  );
  b.extrude(
    [[0, -0.2], [0.12, -0.4], [0.15, -0.75], [0, -0.95], [-0.15, -0.75], [-0.12, -0.4]],
    { at: [0, 1.02, -4.98], x: [1, 0, 0], y: [0, 0.05, -1], thickness: 0.1, color: P.boneDark, bone: J.tail6 },
  );
}
```

<!-- call: headsOuter -->

```ts
import * as THREE from "three";
import { frame, rng, catmull, offset } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildHeadsOuter({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  for (const s of [1, -1]) {
    const N = s > 0 ? "L" : "R";
    const neck = [1, 2, 3, 4].map((i) => J[`neckO${N}${i}`]);
    const head = J[`headO${N}`];
    const jaw = J[`jawO${N}`];
    const H = 0.85;

    // neck
    const pts = [neck[0].at, neck[1].at, neck[2].at, neck[3].at, head.at].map((p) => [p.x, p.y, p.z] as [number, number, number]);
    const path = catmull(pts);
    const tube = b.sweep(path, [0.38, 0.24], { bone: neck, color: P.scaleDark });
    // throat strip
    b.sweep(path.slice(0.1, 1), [0.3, 0.17], { bone: neck, color: P.belly, shift: [0, 0] as any, sectors: undefined as any } as any);
    // dorsal spikes
    b.along(tube, 6, (at) => {
      b.spike(at, at, 0.2 - 0.02 * at.t * 5, 0.05, { color: P.bone });
    });

    // skull
    const sk = b.part(box(0.6 * H, 0.45 * H, 0.75 * H), P.scaleMid, { bone: head, at: head.local([0, 0.0, 0.0]) });
    b.part(box(0.4 * H, 0.3 * H, 0.55 * H), P.scaleMid, { bone: head, at: head.local([0, 0.0, 0.5 * H]) });
    // brows
    for (const e of [1, -1]) {
      const ex = e * 0.24 * H;
      b.part(box(0.22 * H, 0.1 * H, 0.35 * H), P.scaleDark, { bone: head, at: head.local([ex, 0.26 * H, 0.1 * H]) });
      const blind = s > 0 && e > 0;
      const eye = b.part(sph(0.075 * H), blind ? P.scar : P.emberHot, {
        bone: head, at: head.local([ex * 1.05, 0.15 * H, 0.22 * H]),
      });
      if (!blind) {
        glow(eye, 1.5);
        b.part(box(0.015, 0.08 * H, 0.02), P.pupil, { bone: head, at: head.local([ex * 1.2, 0.15 * H, 0.29 * H]) });
      } else {
        b.part(box(0.02, 0.02, 0.3 * H), P.scar, { bone: head, at: head.local([ex * 1.25, 0.15 * H, 0.24 * H]), rotation: [0, 0, 40] });
      }
      // nostril
      b.part(sph(0.03 * H, 5, 4), P.pupil, { bone: head, at: head.local([e * 0.1 * H, 0.14 * H, 0.78 * H]) });
    }
    // upper teeth
    for (let i = 0; i < 6; i++) {
      const z = 0.3 * H + i * 0.1 * H;
      for (const e of [1, -1]) {
        if (s < 0 && e > 0 && i === 3) continue; // broken tooth line
        b.spike(head.local([e * 0.2 * H, -0.17 * H, z]), [0, -1, 0], 0.1 * H, 0.025, { bone: head, color: P.bone });
      }
    }
    // jaw
    b.part(box(0.5 * H, 0.14 * H, 0.9 * H), P.scaleMid, { bone: jaw, at: jaw.local([0, -0.02, 0.35 * H]) });
    b.part(box(0.4 * H, 0.04, 0.7 * H), P.mouth, { bone: jaw, at: jaw.local([0, 0.06 * H, 0.35 * H]) });
    b.part(box(0.2 * H, 0.04, 0.5 * H), P.tongue, { bone: jaw, at: jaw.local([0, 0.09 * H, 0.35 * H]) });
    for (let i = 0; i < 5; i++)
      for (const e of [1, -1])
        b.spike(jaw.local([e * 0.2 * H, 0.08 * H, 0.1 + i * 0.1 * H]), [0, 1, 0], 0.08 * H, 0.02, { bone: jaw, color: P.bone });

    // horns
    const hornSpecs = s > 0 ? [[1, 0.5]] : [[1, 0.3]];
    for (const e of [1, -1]) {
      if (s < 0 && e > 0) continue;
      const broken = s > 0 && e > 0;
      const base = head.local([e * 0.22 * H, 0.28 * H, -0.2 * H]);
      const len = broken ? 0.25 : 0.55 * H;
      const h = b.spike(base, [e * 0.4, 0.6, -0.8], len, 0.09, { bone: head, color: P.hornDark });
      if (broken) {
        b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 8), P.rust, { bone: head, at: offset(base, [e * 0.4, 0.6, -0.8], 0.15), dir: [e * 0.4, 0.6, -0.8] });
        b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 8), P.leather, { bone: head, at: offset(base, [e * 0.4, 0.6, -0.8], 0.05), dir: [e * 0.4, 0.6, -0.8] });
      }
    }
    void hornSpecs;
    // cheek rune
    glow(b.part(box(0.02, 0.1, 0.06), P.frost, { bone: head, at: head.local([-0.31 * H, -0.02, 0.1 * H]) }), 1.5);
    glow(b.part(box(0.02, 0.1, 0.06), P.frost, { bone: head, at: head.local([0.31 * H, -0.02, 0.1 * H]) }), 1.5);

    if (s > 0) {
      // spear tip in jaw
      b.spike(jaw.local([0.25 * H, -0.1, 0.4]), [1, -0.3, 0.2], 0.5, 0.04, { bone: jaw, color: P.iron });
      b.rod(jaw.local([0.5 * H, -0.2, 0.45]), jaw.local([0.8, -0.3, 0.5]), 0.02, P.leather, { bone: jaw });
    } else {
      // neck wound
      const w = neck[1];
      b.part(sph(0.2, 7, 5), P.ash, { bone: w, at: w.local([-0.2, 0.2, 0.2]) });
      glow(b.part(box(0.04, 0.3, 0.06), P.ember, { bone: w, at: w.local([-0.3, 0.2, 0.25]) }), 1.5);
      b.part(new THREE.TorusGeometry(0.3, 0.04, 5, 10), P.bone, { bone: neck[2], at: neck[2].local([0, 0.1, 0]), dir: neck[2].dir([0, 1, 0]), axis: "z" });
    }
    void R; void frame; void M;
  }
}
```

<!-- call: torso -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTorso({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const body = b.loft(
    [
      { at: [0, 2.1, -1.9], w: 1.4, h: 1.5 },
      { at: [0, 2.1, -1], w: 2.0, h: 1.9 },
      { at: [0, 2.2, 0], w: 2.3, h: 2.1 },
      { at: [0, 2.4, 1.2], w: 2.4, h: 2.2 },
      { at: [0, 2.4, 2.1], w: 1.8, h: 1.8 },
    ],
    {
      bone: [J.pelvis, J.spine1, J.chest],
      color: P.scaleMid,
      sectors: [
        [-60, 60, P.scaleDark],
        [120, 240, P.belly],
        [100, 120, P.bellyDark],
        [240, 260, P.bellyDark],
      ],
    },
  );
  // rump cap and hip/shoulder masses
  b.part(new THREE.SphereGeometry(0.75, 10, 8), P.scaleMid, { bone: J.pelvis, at: [0, 2.1, -1.8] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.6, 8, 6), P.scaleMid, { bone: J.pelvis, at: [s * 1.1, 2.1, -1.3] });
    b.part(new THREE.SphereGeometry(0.65, 8, 6), P.scaleMid, { bone: J.chest, at: [s * 1.1, 2.1, 1.4] });
  }
  // collar mounds with spike rings
  for (const k of ["C", "IL", "IR", "OL", "OR"]) {
    const m = M["neckBase" + k];
    const mound = b.part(new THREE.SphereGeometry(0.5, 8, 6), P.scaleMid, { bone: J.chest, at: [m[0], m[1] - 0.05, m[2]] });
    b.ring(frame([m[0], m[1] + 0.3, m[2]], [0, 1, 0]), { count: 6, radius: 0.45 }, (it) =>
      b.spike(it, it, 0.16, 0.04, { color: P.bone, bone: J.chest }),
    );
  }
  // dorsal ridge
  for (let i = 0; i < 9; i++) {
    const z = 1.9 - i * 0.42;
    const sc = 0.5 + 0.5 * (z + 1.8) / 3.7;
    const y = 3.2 + 0.05 * (z > 0 ? 1 : 0) - (z < -1 ? 0.2 : 0);
    const bone = z > 0.9 ? J.chest : z > -0.4 ? J.spine1 : J.pelvis;
    b.part(new THREE.BoxGeometry(0.35 * sc, 0.1, 0.4), P.boneDark, { bone, at: [0, y, z] });
    b.part(new THREE.ConeGeometry(0.15 * sc, 0.5 * sc + 0.1, 5), P.bone, { bone, at: [0, y + 0.22 * sc + 0.1, z] });
  }
  // rib bands and belly plates
  for (let i = 0; i < 6; i++) {
    const z = -1 + i * 0.55;
    for (const s of [1, -1])
      b.part(new THREE.BoxGeometry(0.1, 0.9, 0.12), P.bellyDark, { bone: J.spine1, at: [s * 1.14, 2.0, z], rotation: [0, 0, s * 12] });
    b.part(new THREE.BoxGeometry(0.9, 0.08, 0.3), P.bellyDark, { bone: J.spine1, at: [0, 1.17, z] });
  }
  // scars with ember seams, burns
  for (const [s, z, y] of [[1, 0.6, 2.5], [-1, -0.4, 2.7], [1, -1.0, 2.2]] as number[][]) {
    const x = s * 1.18;
    b.part(new THREE.BoxGeometry(0.05, 0.12, 1.0), P.scar, { bone: J.spine1, at: [x, y, z], rotation: [0, 0, s * -10] });
    glow(b.part(new THREE.BoxGeometry(0.06, 0.04, 0.7), P.ember, { bone: J.spine1, at: [x + s * 0.01, y, z] }), 1.5);
  }
  b.part(new THREE.CylinderGeometry(0.35, 0.35, 0.06, 8), P.ash, { bone: J.spine1, at: [-1.15, 2.4, 0.5], rotation: [0, 0, 90] });
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.08, 6), P.blood, { bone: J.spine1, at: [-1.16, 2.4, 0.5], rotation: [0, 0, 90] });
  b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 8), P.ash, { bone: J.spine1, at: [1.0, 1.7, -0.3], rotation: [0, 0, 90] });
  // axe in left flank
  b.part(new THREE.BoxGeometry(0.5, 0.45, 0.1), P.iron, { bone: J.spine1, at: [1.45, 2.5, 0.2], rotation: [0, 90, 0] });
  b.part(new THREE.BoxGeometry(0.1, 0.5, 0.06), P.rust, { bone: J.spine1, at: [1.45, 2.5, 0.48] });
  b.rod([1.2, 2.5, 0.2], [1.8, 2.7, 0.2], 0.04, P.leather, { bone: J.spine1 });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 6), P.leather, { bone: J.spine1, at: [1.8, 2.7, 0.2], rotation: [0, 0, 80] });
  // spear tip right shoulder
  b.spike([-1.15, 2.9, 1.5], [-1.9, 3.5, 1.7], null, 0.08, { color: P.iron, bone: J.chest });
  b.rod([-1.9, 3.5, 1.7], [-2.1, 3.7, 1.75], 0.045, P.boneDark, { bone: J.chest });
  // chain wrap
  const links = 22;
  for (let i = 0; i < links; i++) {
    const t = i / links * Math.PI * 2;
    const z = 0.4 + Math.sin(t) * 0.0 + (i / links - 0.5) * 1.2;
    const x = Math.sin(t) * 1.2;
    const y = 2.3 + Math.cos(t) * 1.1 + (i / links - 0.5) * 0.4;
    b.part(new THREE.TorusGeometry(0.07, 0.022, 4, 6), i % 3 ? P.ironDark : P.rust, {
      bone: J.spine1, at: [x * 1.05, y, z], rotation: [i % 2 ? 90 : 0, (t * 180) / Math.PI, 0],
    });
  }
  b.part(new THREE.BoxGeometry(0.3, 0.25, 0.1), P.iron, { bone: J.spine1, at: [0, 3.36, 0.4] });
  b.part(new THREE.BoxGeometry(0.14, 0.1, 0.12), P.bronze, { bone: J.spine1, at: [0, 3.36, 0.42] });
  // rune brands
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.04, 10), P.ironDark, { bone: J.spine1, at: [s * 1.17, 2.0, -0.2], rotation: [0, 0, 90] });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const r = i % 2 ? 0.1 : 0.14;
      glow(
        b.part(new THREE.BoxGeometry(0.03, 0.14 + R() * 0.06, 0.04), P.frost, {
          bone: J.spine1,
          at: [s * 1.2, 2.0 + Math.cos(a) * 0.25, -0.2 + Math.sin(a) * 0.25],
          rotation: [(i * 37) % 60, 0, 0],
        }),
        1.6,
      );
    }
  }
}
```

<!-- call: headsInner -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildHeadsInner({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const H = 1.0;
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const neck = [1, 2, 3, 4].map((i) => J[`neckI${k}${i}`]);
    const head = J[`headI${k}`];
    const jaw = J[`jawI${k}`];
    const pts: number[][] = [
      [s * 0.9, 2.8, 1.5],
      [s * 1.3, 3.4, 1.8],
      [s * 1.65, 3.95, 2.0],
      [s * 1.9, 4.35, 2.25],
      [s * 2.0, 4.5, 2.6],
    ];
    const tube = b.sweep(pts, [0.42, 0.3], {
      bone: neck,
      color: P.scaleDark,
      sectors: [[125, 235, P.belly]],
      sides: 8,
    });
    // dorsal spikes
    b.along(tube, 5, (at) => {
      b.spike(at, at, 0.2 - at.t * 0.08, 0.05, { color: P.bone });
    });
    // neck bands
    for (const t of [0.3, 0.6]) {
      const p = tube.at(t, 180);
      b.stick(new THREE.BoxGeometry(0.3, 0.05, 0.12), P.bellyDark, p, { embed: 0.5 });
    }
    // skull
    const hp = (x: number, y: number, z: number) => head.local([s * 0, 0, 0]).clone().add(new THREE.Vector3(s * 2.0 + x * s, 4.5 + y, 2.6 + z));
    const skull = (x: number, y: number, z: number, w: number, h: number, d: number, c: string, bone = head) =>
      b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: hp(x, y, z) });
    skull(0, 0, 0.1, 0.62 * H, 0.5 * H, 0.7 * H, P.scaleMid);
    skull(0, -0.04, 0.55, 0.42 * H, 0.3 * H, 0.45 * H, P.scaleMid);
    skull(0, 0.2, 0.0, 0.6, 0.08, 0.45, P.scaleDark);
    skull(0, -0.15, 0.4, 0.4, 0.06, 0.5, P.bellyDark);
    // lower jaw
    const jp = (x: number, y: number, z: number) => new THREE.Vector3(s * 2.02 + x * s, 4.38 + y, 2.8 + z);
    b.part(new THREE.BoxGeometry(0.4, 0.14, 0.75), P.scaleMid, { bone: jaw, at: jp(0, -0.06, 0.3) });
    b.part(new THREE.BoxGeometry(0.3, 0.04, 0.55), P.mouth, { bone: jaw, at: jp(0, 0.03, 0.3) });
    b.part(new THREE.BoxGeometry(0.2, 0.05, 0.3), P.tongue, { bone: jaw, at: jp(0, 0.05, 0.3) });
    // teeth
    for (let i = 0; i < 5; i++) {
      for (const x of [-1, 1]) {
        const z = 0.55 + i * 0.07;
        b.spike(hp(x * 0.2, -0.17, z - 0.05), [0, -1, 0], i === 0 ? 0.14 : 0.09, 0.025, { color: P.bone, bone: head });
        b.spike(jp(x * 0.17, 0.03, 0.05 + i * 0.13), [0, 1, 0], i === 0 ? 0.12 : 0.08, 0.022, { color: P.bone, bone: jaw });
      }
    }
    // nostrils
    for (const x of [-1, 1]) b.part(new THREE.BoxGeometry(0.06, 0.05, 0.04), P.pupil, { bone: head, at: hp(x * 0.1, 0.06, 0.8) });
    // eyes
    for (const x of [-1, 1]) {
      const blind = false;
      glow(b.part(new THREE.SphereGeometry(0.09, 6, 4), P.emberHot, { bone: head, at: hp(x * 0.32, 0.1, 0.25) }), 1.5);
      b.part(new THREE.BoxGeometry(0.03, 0.11, 0.03), P.pupil, { bone: head, at: hp(x * 0.38, 0.1, 0.3) });
      b.part(new THREE.BoxGeometry(0.2, 0.06, 0.2), P.scaleDark, { bone: head, at: hp(x * 0.32, 0.2, 0.22) });
      void blind;
    }
    // frill
    for (let i = -2; i <= 2; i++) {
      b.spike(hp(i * 0.12, 0.1, -0.25), [i * 0.25 * s, 0.6, -0.8], 0.4 - Math.abs(i) * 0.05, 0.06, { color: P.bone, bone: head });
    }
    // brow rune
    glow(b.part(new THREE.BoxGeometry(0.03, 0.14, 0.03), P.frost, { bone: head, at: hp(0, 0.26, 0.4) }), 1.5);
    glow(b.part(new THREE.BoxGeometry(0.1, 0.03, 0.03), P.frost, { bone: head, at: hp(0, 0.27, 0.4) }), 1.5);
    // snout scar
    b.part(new THREE.BoxGeometry(0.3, 0.03, 0.04), P.scar, { bone: head, at: hp(0, 0.12, 0.62), rotation: [0, 0, 20] });
    glow(b.part(new THREE.BoxGeometry(0.2, 0.01, 0.02), P.ember, { bone: head, at: hp(0, 0.14, 0.64), rotation: [0, 0, 20] }), 1.2);
    if (s > 0) {
      // straight horns
      for (const x of [-1, 1]) {
        b.spike(hp(x * 0.22, 0.22, -0.05), [x * 0.35, 0.5, -0.8], 0.85, 0.08, { color: P.hornDark, bone: head });
        b.spike(hp(x * 0.22 + x * 0.25, 0.22 + 0.35, -0.05 - 0.55), [x * 0.35, 0.5, -0.8], 0.3, 0.03, { color: P.bone, bone: head });
      }
      // iron snout bands
      for (const z of [0.5, 0.7]) b.part(new THREE.BoxGeometry(0.46, 0.34, 0.06), P.iron, { bone: head, at: hp(0, -0.04, z) });
      b.part(new THREE.BoxGeometry(0.1, 0.1, 0.07), P.rust, { bone: head, at: hp(0, -0.04, 0.71) });
    } else {
      // curled ram horns
      for (const x of [-1, 1]) {
        const base = hp(x * 0.28, 0.12, -0.05);
        const c = new THREE.CatmullRomCurve3([
          base,
          base.clone().add(new THREE.Vector3(x * 0.3, 0.05, -0.2)),
          base.clone().add(new THREE.Vector3(x * 0.45, -0.2, -0.05)),
          base.clone().add(new THREE.Vector3(x * 0.3, -0.35, 0.2)),
          base.clone().add(new THREE.Vector3(x * 0.1, -0.2, 0.2)),
        ]);
        b.sweep(c.getPoints(10).map((p) => [p.x, p.y, p.z]), [0.09, 0.03], { bone: head, color: P.hornDark, sides: 6 });
      }
      // scarred cheek + leather patch
      b.part(new THREE.BoxGeometry(0.03, 0.2, 0.22), P.leather, { bone: head, at: hp(-0.33 * 1, -0.02, 0.05) });
      b.part(new THREE.BoxGeometry(0.03, 0.2, 0.22), P.leather, { bone: head, at: hp(0.33, -0.02, 0.05) });
      for (let i = 0; i < 4; i++)
        for (const x of [-1, 1]) b.part(new THREE.BoxGeometry(0.04, 0.015, 0.03), P.scar, { bone: head, at: hp(x * 0.35, -0.08 + i * 0.05, 0.05) });
    }
    // cheek spikes
    for (const x of [-1, 1]) b.spike(hp(x * 0.31, -0.1, 0.0), [x, -0.2, -0.4], 0.2, 0.05, { color: P.bone, bone: head });
  }
}
```

<!-- call: headC -->

```ts
import * as THREE from "three";
import { catmull, offset, frame } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildHeadC({ b, J, P, M }: any) {
  const H = 1.25;
  const head = J.headC, jaw = J.jawC;
  const hp = new THREE.Vector3(...(M.headSocketC as number[]));
  const L = (x: number, y: number, z: number): [number, number, number] => [hp.x + x * H, hp.y + y * H, hp.z + z * H];

  // neck
  const neckPath = catmull([[0, 2.9, 1.5], [0, 3.6, 1.8], [0, 4.3, 1.95], [0, 4.8, 2.2], [0, 5.0, 2.55]]);
  const neck = b.sweep(neckPath, [0.5, 0.33], {
    bone: [J.neckC1, J.neckC2, J.neckC3, J.neckC4, head],
    color: P.scaleDark,
    sectors: [[125, 235, P.belly]],
  });
  b.along(neck, 7, (at: any) => {
    b.spike(at, at, 0.28, 0.07, { color: P.bone });
    b.stick(new THREE.CylinderGeometry(0.09, 0.11, 0.04, 6), P.boneDark, at, { embed: 0.3 });
  });
  for (let i = 0; i < 6; i++) {
    const p = neck.at(0.1 + i * 0.15, 180, 0.01);
    b.stick(new THREE.BoxGeometry(0.34, 0.03, 0.1), P.bellyDark, p, { embed: 0.3 });
  }

  // skull
  const part = (g: THREE.BufferGeometry, c: string, at: [number, number, number], opt: any = {}) =>
    b.part(g, c, { bone: head, at, ...opt });
  part(new THREE.BoxGeometry(0.9, 0.7, 0.9), P.scaleDark, L(0, 0, 0.05), { scale: [H, H, H] });
  part(new THREE.BoxGeometry(0.6, 0.38, 0.8), P.scaleMid, L(0, -0.12, 0.7), { scale: [H, H, H] });
  part(new THREE.BoxGeometry(0.62, 0.1, 0.75), P.scaleDark, L(0, 0.1, 0.72), { scale: [H, H, H] });
  // nostrils
  for (const s of [1, -1]) {
    part(new THREE.BoxGeometry(0.08, 0.06, 0.06), P.pupil, L(s * 0.15, 0.1, 1.1));
    // eyes
    const e = L(s * 0.4, 0.17, 0.5);
    part(new THREE.BoxGeometry(0.22, 0.2, 0.12), P.pupil, e);
    glow(part(new THREE.SphereGeometry(0.1, 8, 6), P.emberHot, [e[0] + s * 0.02, e[1], e[2] + 0.05]), 1.5);
    part(new THREE.BoxGeometry(0.03, 0.15, 0.03), P.pupil, [e[0] + s * 0.02, e[1], e[2] + 0.15]);
    part(new THREE.BoxGeometry(0.28, 0.07, 0.26), P.boneDark, [e[0], e[1] + 0.15, e[2]], { rotation: [0, 0, -s * 12] });
    // cheek plates
    part(new THREE.BoxGeometry(0.06, 0.32, 0.4), P.bone, L(s * 0.48, -0.15, 0.2));
    b.spike(frame(L(s * 0.5, -0.2, 0.05), [s, -0.2, -0.5]), [s, -0.2, -0.5], 0.25, 0.05, { color: P.bone, bone: head });
    // horns
    const big = s;
    const hs = L(s * 0.25, 0.35, -0.15);
    const hp2 = catmull([hs, L(s * 0.55, 0.55, -0.35), L(s * 0.85, 0.5, -0.8), L(s * 0.95, 0.2, -1.1)]);
    b.sweep(hp2, [0.11 * H, 0.03], { bone: head, color: P.hornDark, caps: { end: "point" } });
    b.sweep(hp2.slice(0.8, 1), [0.04, 0.0], { bone: head, color: P.bone, caps: { end: "point" } });
    b.sweep(hp2.slice(0.45, 0.5), 0.1, { bone: head, color: P.boneDark });
  }
  // inner horns
  for (const s of [1, -1]) {
    const mid = L(s * 0.1, 0.38, -0.2);
    const tip = L(s * 0.15, 0.95, -0.9);
    b.sweep(catmull([mid, L(s * 0.15, 0.75, -0.4), tip]), [0.09 * H, 0.03], { bone: head, color: P.hornDark, caps: { end: "point" } });
    const pos = s > 0 ? [s * 0.3, 0.85, -0.55] : null;
    if (pos) {
      b.sweep(catmull([L(s * 0.3, 0.7, -0.35), L(s * 0.3, 0.9, -0.5)]), 0.075, { bone: head, color: P.iron });
      for (let i = 0; i < 4; i++) part(new THREE.SphereGeometry(0.02, 5, 4), P.rust, L(s * 0.3 + 0.08 * Math.cos(i * 1.57), 0.8, -0.43 + 0.08 * Math.sin(i * 1.57)));
    }
  }
  const mid = L(0, 0.4, -0.3);
  b.sweep(catmull([mid, L(0, 0.8, -0.6), L(0, 0.9, -1.1)]), [0.1 * H, 0.03], { bone: head, color: P.hornDark, caps: { end: "point" } });
  // frill
  for (let i = 0; i < 7; i++) {
    const a = -1.2 + i * 0.4;
    b.spike(L(Math.sin(a) * 0.4, 0.1 + Math.cos(a) * 0.2, -0.4), [Math.sin(a) * 0.6, 0.3, -1], 0.5, 0.06, { color: P.bone, bone: head });
  }
  // scar over left eye
  part(new THREE.BoxGeometry(0.03, 0.4, 0.05), P.scar, L(0.4, 0.3, 0.75), { rotation: [0, 0, 25] });
  glow(part(new THREE.BoxGeometry(0.012, 0.36, 0.055), P.ember, L(0.4, 0.3, 0.76), { rotation: [0, 0, 25] }), 1.2);
  // forehead rune
  glow(part(new THREE.BoxGeometry(0.04, 0.2, 0.03), P.frost, L(0, 0.37, 0.4)), 1.5);
  glow(part(new THREE.BoxGeometry(0.16, 0.035, 0.03), P.frost, L(0, 0.37, 0.4)), 1.5);
  // muzzle ring + chain
  part(new THREE.TorusGeometry(0.34, 0.035, 6, 12), P.iron, L(0, -0.1, 0.8), { scale: [H, H, H] });
  for (let i = 0; i < 4; i++) part(new THREE.TorusGeometry(0.04, 0.012, 5, 8), P.ironDark, L(0.0, -0.4 - i * 0.07, 0.85), { rotation: [i % 2 ? 90 : 0, 0, 0] });

  // upper teeth
  for (let i = 0; i < 6; i++) {
    for (const s of [1, -1]) {
      const z = 0.45 + i * 0.12;
      const big = i === 5;
      part(new THREE.ConeGeometry(big ? 0.05 : 0.035, big ? 0.28 : 0.15, 5), P.bone, L(s * 0.27, -0.38, z), { rotation: [180, 0, 0] });
    }
  }
  // lower jaw
  const jp = new THREE.Vector3(...(M.headSocketC as number[]));
  const J2 = (x: number, y: number, z: number): [number, number, number] => [jp.x + x * H, 4.85 + y * H, 2.85 + z * H];
  b.part(new THREE.BoxGeometry(0.55, 0.16, 0.9), P.scaleMid, { bone: jaw, at: J2(0, -0.1, 0.45), scale: [H, H, H] });
  b.part(new THREE.BoxGeometry(0.45, 0.06, 0.7), P.mouth, { bone: jaw, at: J2(0, 0.0, 0.4), scale: [H, H, H] });
  b.part(new THREE.BoxGeometry(0.22, 0.05, 0.5), P.tongue, { bone: jaw, at: J2(0, 0.05, 0.4), scale: [H, H, H] });
  for (let i = 0; i < 5; i++) for (const s of [1, -1])
    b.part(new THREE.ConeGeometry(0.03, 0.12, 5), i === 2 && s > 0 ? P.boneDark : P.bone, { bone: jaw, at: J2(s * 0.24, 0.1, 0.15 + i * 0.15) });
  b.part(new THREE.BoxGeometry(0.4, 0.1, 0.3), P.scar, { bone: jaw, at: J2(0, -0.2, 0.7), scale: [H, H, H] });
}
```

<!-- call: legs -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildLegs({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);

  // leg point sets (left side; mirrored by sign)
  const mir = (p: number[], s: number) => [p[0] * s, p[1], p[2]];

  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  const band = (bone: any, a: number[], d: number[], r: number, h: number, color: string) =>
    b.part(new THREE.CylinderGeometry(r, r, h, 10), color, { bone, at: a, dir: d });

  const claws = (bone: any, c: number[], s: number) => {
    for (let i = -1; i <= 1; i++) {
      const base = [c[0] + i * 0.2 * s + i * 0.03 * s, 0.12, c[2] + 0.22];
      // toe
      b.part(new THREE.BoxGeometry(0.2, 0.16, 0.34), P.scaleDark, { bone, at: [base[0], 0.08, base[2]], rotation: [0, i * 12 * s, 0] });
      // dirt on toe
      b.part(new THREE.BoxGeometry(0.21, 0.05, 0.35), P.ash, { bone, at: [base[0], 0.025, base[2]], rotation: [0, i * 12 * s, 0] });
      // claw
      b.spike([base[0] + i * 0.05 * s, 0.1, base[2] + 0.15], [i * 0.15 * s, -0.25, 1], 0.3, 0.07, { bone, color: P.claw });
    }
  };

  const foot = (bone: any, c: number[], s: number) => {
    b.part(new THREE.BoxGeometry(0.6, 0.2, 0.5), P.scaleDark, { bone, at: [c[0], 0.1, c[2]] });
    b.part(new THREE.BoxGeometry(0.62, 0.06, 0.52), P.ash, { bone, at: [c[0], 0.03, c[2]] });
    claws(bone, c, s);
  };

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // ---------- foreleg ----------
    const sh = mir([1.15, 2, 1.4], s);
    const el = mir([1.5, 1, 1.1], s);
    const wr = mir([1.4, 0.4, 1.5], s);
    const pw = mir([1.4, 0.15, 1.75], s);
    const sj = J["shoulderF" + L], ej = J["elbowF" + L], wj = J["wristF" + L], pj = J["pawF" + L];

    b.part(sph(0.62, 10, 8), P.scaleMid, { bone: sj, at: [sh[0], 1.95, sh[2]], scale: [1, 1.1, 1.1] });
    b.sweep([sh, el], [0.42, 0.34], { bone: sj, color: P.scaleMid, sides: 8 });
    b.sweep([el, wr], [0.34, 0.24], { bone: ej, color: P.scaleDark, sides: 8 });
    b.sweep([wr, [pw[0], 0.12, pw[2] - 0.1]], [0.24, 0.22], { bone: wj, color: P.scaleDark, sides: 8 });
    b.part(sph(0.3), P.scaleMid, { bone: ej, at: el });
    b.spike([el[0] + 0.2 * s, el[1], el[2] - 0.15], [s, 0.2, -0.6], 0.5, 0.12, { bone: ej, color: P.bone });
    // ash lower leg band
    band(wj, [wr[0], 0.3, wr[2] + 0.05], [0, 1, 0], 0.27, 0.22, P.ash);
    // inner belly-pale patch
    b.part(new THREE.BoxGeometry(0.05, 0.5, 0.3), P.belly, { bone: ej, at: [el[0] - 0.3 * s, 0.9, el[2] + 0.05] });
    // frost rune at shoulder
    glow(b.part(new THREE.BoxGeometry(0.03, 0.2, 0.08), P.frost, { bone: sj, at: [sh[0] + 0.6 * s, 2.05, sh[2]] }), 1.5);
    glow(b.part(new THREE.BoxGeometry(0.03, 0.08, 0.2), P.frost, { bone: sj, at: [sh[0] + 0.61 * s, 2.0, sh[2] + 0.04] }), 1.5);
    foot(pj, [pw[0], 0, pw[2] + 0.05], s);
    b.part(sph(0.26), P.scaleDark, { bone: pj, at: [pw[0], 0.22, pw[2] - 0.15] });

    // ---------- hindleg ----------
    const hp = mir([1.15, 2, -1.3], s);
    const kn = mir([1.55, 1.3, -0.65], s);
    const hk = mir([1.45, 0.85, -1.75], s);
    const hpw = mir([1.4, 0.15, -1.3], s);
    const hj = J["hipH" + L], kj = J["kneeH" + L], kj2 = J["hockH" + L], hpj = J["pawH" + L];

    b.part(sph(0.75, 10, 8), P.scaleMid, { bone: hj, at: [hp[0] + 0.1 * s, 1.95, hp[2] + 0.1], scale: [0.9, 1.1, 1.2] });
    b.sweep([hp, kn], [0.55, 0.4], { bone: hj, color: P.scaleMid, sides: 8 });
    b.part(sph(0.4), P.scaleMid, { bone: kj, at: kn });
    b.sweep([kn, hk], [0.4, 0.26], { bone: kj, color: P.scaleDark, sides: 8 });
    b.part(sph(0.28), P.scaleDark, { bone: kj2, at: hk });
    b.sweep([hk, [hpw[0], 0.2, hpw[2] - 0.1]], [0.26, 0.2], { bone: kj2, color: P.scaleDark, sides: 8 });
    b.spike([hk[0], hk[1] + 0.05, hk[2] - 0.2], [0, 0.3, -1], 0.5, 0.11, { bone: kj2, color: P.bone });
    band(kj2, [hpw[0], 0.35, hpw[2] - 0.15], [0, 1, 0.1], 0.23, 0.2, P.ash);
    // belly-pale inner patch
    b.part(new THREE.BoxGeometry(0.05, 0.6, 0.35), P.belly, { bone: hj, at: [hp[0] - 0.5 * s, 1.55, hp[2] + 0.2] });
    foot(hpj, [hpw[0], 0, hpw[2] + 0.05], s);
    if (s > 0) {
      // bronze band on left hock
      band(kj2, [hk[0] + 0.02, hk[1] - 0.2, hk[2] + 0.08], [0.05, 1, -0.2], 0.3, 0.2, P.bronze);
      band(kj2, [hk[0] + 0.02, hk[1] - 0.2, hk[2] + 0.08], [0.05, 1, -0.2], 0.31, 0.04, P.rust);
      // scar gash on thigh
      glow(b.part(new THREE.BoxGeometry(0.03, 0.08, 0.7), P.ember, { bone: hj, at: [hp[0] + 0.62, 1.8, hp[2] + 0.2], rotation: [0, 0, 20] }), 1.2);
      b.part(new THREE.BoxGeometry(0.04, 0.14, 0.8), P.scar, { bone: hj, at: [hp[0] + 0.6, 1.8, hp[2] + 0.2], rotation: [0, 0, 20] });
    }
    // hind shoulder-side rune dots omitted; rune on hip
  }

  // iron cuff with rust band and 4 rivets on right fore wrist
  {
    const wr = [-1.4, 0.55, 1.45];
    band(J.wristFR, wr, [0.05, 1, 0.2], 0.3, 0.25, P.iron);
    band(J.wristFR, [wr[0], wr[1] - 0.15, wr[2]], [0.05, 1, 0.2], 0.31, 0.06, P.rust);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      b.part(sph(0.04, 6, 4), P.bronze, { bone: J.wristFR, at: [wr[0] + Math.cos(a) * 0.3, wr[1] + 0.05, wr[2] + Math.sin(a) * 0.3] });
    }
  }

  // frayed leather strap + chain on left foreleg
  {
    const e = [1.48, 0.85, 1.15];
    band(J.elbowFL, e, [0.1, 1, 0.3], 0.36, 0.14, P.leather);
    for (let i = 0; i < 3; i++)
      b.part(new THREE.BoxGeometry(0.05, 0.2 + R() * 0.1, 0.03), P.leather, { bone: J.elbowFL, at: [e[0] + 0.1 + i * 0.1, 0.65, e[2] + 0.35] });
    for (let i = 0; i < 6; i++) {
      b.part(new THREE.TorusGeometry(0.06, 0.018, 5, 8), i % 2 ? P.ironDark : P.rust, {
        bone: J.elbowFL, at: [e[0] + 0.38, 0.85 - i * 0.07, e[2] + 0.1], rotation: [i % 2 ? 90 : 0, 90, 0],
      });
    }
  }
}
```