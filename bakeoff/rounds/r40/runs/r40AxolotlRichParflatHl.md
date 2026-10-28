<!-- call: plan -->

```json
{
  "name": "Chibi Axolotl",
  "description": "A chibi leucistic axolotl: a huge flat smiling head, a stubby pale-pink body, a paddle tail with a frilled fin and six feathery hot-pink gills, standing in a neutral rest pose.",
  "builderName": "chibiAxolotl",
  "size": [0.4, 0.21, 0.54],
  "layout": "UNITS ARE METERS, life-size axolotl (about 0.5 m with gills, tail and head). The model faces +Z, +X is the model's left, and it stands on y=0. The model is a low, wide salamander with a chibi head about 2x as wide as the body. Seen from the front: a very wide, flat, rounded head (width 0.2, height about 0.13) with two big black bead eyes high on the top corners, pink cheek blushes, a wide upturned smile and two tiny nostril dots. Three hot-pink gill stalks sprout from each rear cheek and fan sideways and up, carrying dense frilly filaments, so the gills span about x=±0.19 and are the loudest silhouette feature. The chunky body (width 0.13, height 0.10) lies behind the head and rests its belly on the floor. Four stubby limbs splay sideways with flat paws; each paw has long, rounded finger and toe tips fanned forward (4 digits on the hands, 5 on the feet). A laterally flattened tail tapers back to z=-0.31, with a scalloped fin running from behind the head along the back and round the tail tip, plus a short ventral fin on the tail. SKULL GEOMETRY (shared by head, face and gills): the upper skull is an ellipsoid centred at headCenter [0,0.083,0.14] with radii x 0.10, y 0.057, z 0.09 (top y=0.14, front z=0.23, rear z=0.05). The lower jaw is an ellipsoid centred at [0,0.035,0.15] with radii [0.088,0.026,0.078], hinged at jawHinge. The mouth seam sits at about y=0.056. The head ellipsoid is the only surface the face and gills seat on, so those parts must snap their details with b.surface(b.root).nearest(point) or .around(headCenter).at(az, el). Skull parts are built first, and the build order is head, face, gills, bodyTail, limbs. STYLE: stubby, rounded and cute, with chunky bold shapes, flat colours and low-poly facets (6 to 10 sided tubes, 8x6 spheres). Colour by place: pale rose on top, a cream belly and underjaw, darker rose back patch and freckle spots, then a deep-rose to hot-pink to pale-pink gradient along each gill filament. Fine detail (eyes, shine, blush, freckles, toe tips, fin ribs) is small separate parts in their own colours. Everything is left-right symmetric. Do not add a ground, rocks or water.",
  "palette": {
    "skin": "#f7c3cd",
    "skinBack": "#eaa3b3",
    "belly": "#fff0e8",
    "spot": "#d9788f",
    "gillStalk": "#e8456f",
    "gillDeep": "#c92a58",
    "gillFrill": "#ff7aa0",
    "gillTip": "#ffb3c8",
    "fin": "#ffd3dc",
    "finEdge": "#ff9cb5",
    "eye": "#1b1020",
    "eyeRing": "#3b2a4a",
    "eyeGold": "#ffd36b",
    "shine": "#ffffff",
    "blush": "#ff8fab",
    "mouthLine": "#b0405e",
    "mouthInside": "#7a1f3d",
    "tongue": "#ff7b95",
    "nostril": "#a8506a",
    "pad": "#f08fa6",
    "digitTip": "#ffd9e0"
  },
  "mounts": {
    "headCenter": [0, 0.083, 0.14],
    "jawHinge": [0, 0.055, 0.1],
    "mouthFront": [0, 0.056, 0.222],
    "eyeL": [0.056, 0.123, 0.18],
    "eyeR": [-0.056, 0.123, 0.18],
    "cheekL": [0.089, 0.066, 0.172],
    "cheekR": [-0.089, 0.066, 0.172],
    "nostrilL": [0.022, 0.1, 0.224],
    "nostrilR": [-0.022, 0.1, 0.224],
    "gillBaseL1": [0.048, 0.13, 0.112],
    "gillBaseL2": [0.084, 0.107, 0.109],
    "gillBaseL3": [0.087, 0.059, 0.117],
    "gillBaseR1": [-0.048, 0.13, 0.112],
    "gillBaseR2": [-0.084, 0.107, 0.109],
    "gillBaseR3": [-0.087, 0.059, 0.117],
    "neckJoin": [0, 0.055, 0.06],
    "dorsalStart": [0, 0.098, 0.04],
    "tailRoot": [0, 0.05, -0.1],
    "tailTip": [0, 0.037, -0.31],
    "shoulderL": [0.07, 0.04, 0.035],
    "shoulderR": [-0.07, 0.04, 0.035],
    "hipSocketL": [0.065, 0.04, -0.085],
    "hipSocketR": [-0.065, 0.04, -0.085],
    "handPadL": [0.125, 0, 0.08],
    "handPadR": [-0.125, 0, 0.08],
    "footPadL": [0.125, 0, -0.075],
    "footPadR": [-0.125, 0, -0.075]
  },
  "joints": [
    { "name": "hips", "at": [0, 0.05, -0.07], "dir": [0, 0, 1], "role": "spine" },
    { "name": "spine", "parent": "hips", "at": [0, 0.052, 0.0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "head", "parent": "spine", "at": [0, 0.065, 0.07], "dir": [0, 0.1, 1], "role": "head", "group": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 0.055, 0.1], "dir": [0, 0, 1], "role": "jaw", "group": "head" },
    { "name": "tail1", "parent": "hips", "at": [0, 0.05, -0.1], "dir": [0, 0, -1], "role": "tail", "group": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 0.048, -0.155], "dir": [0, 0, -1], "role": "tail", "group": "tail" },
    { "name": "tail3", "parent": "tail2", "at": [0, 0.044, -0.21], "dir": [0, 0, -1], "role": "tail", "group": "tail" },
    { "name": "tail4", "parent": "tail3", "at": [0, 0.04, -0.26], "dir": [0, 0, -1], "role": "tail", "group": "tail" },
    { "name": "tail5", "parent": "tail4", "at": [0, 0.037, -0.295], "dir": [0, 0, -1], "role": "tail", "group": "tail" },

    { "name": "gillL1", "parent": "head", "at": [0.048, 0.13, 0.112], "dir": [0.507, 0.76, -0.406], "role": "fan", "group": "gills" },
    { "name": "gillL1b", "parent": "gillL1", "at": [0.073, 0.168, 0.092], "dir": [0.45, 0.8, -0.35], "role": "fan", "group": "gills" },
    { "name": "gillL2", "parent": "head", "at": [0.084, 0.107, 0.109], "dir": [0.885, 0.31, -0.4], "role": "fan", "group": "gills" },
    { "name": "gillL2b", "parent": "gillL2", "at": [0.128, 0.123, 0.089], "dir": [0.9, 0.3, -0.35], "role": "fan", "group": "gills" },
    { "name": "gillL3", "parent": "head", "at": [0.087, 0.059, 0.117], "dir": [0.893, -0.089, -0.446], "role": "fan", "group": "gills" },
    { "name": "gillL3b", "parent": "gillL3", "at": [0.123, 0.055, 0.099], "dir": [0.9, -0.1, -0.4], "role": "fan", "group": "gills" },
    { "name": "gillR1", "parent": "head", "at": [-0.048, 0.13, 0.112], "dir": [-0.507, 0.76, -0.406], "role": "fan", "group": "gills" },
    { "name": "gillR1b", "parent": "gillR1", "at": [-0.073, 0.168, 0.092], "dir": [-0.45, 0.8, -0.35], "role": "fan", "group": "gills" },
    { "name": "gillR2", "parent": "head", "at": [-0.084, 0.107, 0.109], "dir": [-0.885, 0.31, -0.4], "role": "fan", "group": "gills" },
    { "name": "gillR2b", "parent": "gillR2", "at": [-0.128, 0.123, 0.089], "dir": [-0.9, 0.3, -0.35], "role": "fan", "group": "gills" },
    { "name": "gillR3", "parent": "head", "at": [-0.087, 0.059, 0.117], "dir": [-0.893, -0.089, -0.446], "role": "fan", "group": "gills" },
    { "name": "gillR3b", "parent": "gillR3", "at": [-0.123, 0.055, 0.099], "dir": [-0.9, -0.1, -0.4], "role": "fan", "group": "gills" },

    { "name": "shoulderL", "parent": "spine", "at": [0.07, 0.04, 0.035], "dir": [0.85, -0.4, 0.35], "role": "arm", "group": "limbs" },
    { "name": "elbowL", "parent": "shoulderL", "at": [0.105, 0.024, 0.05], "dir": [0.5, -0.3, 0.8], "role": "arm", "group": "limbs" },
    { "name": "handL", "parent": "elbowL", "at": [0.125, 0.012, 0.08], "dir": [0.4, -0.2, 0.9], "role": "arm", "group": "limbs" },
    { "name": "shoulderR", "parent": "spine", "at": [-0.07, 0.04, 0.035], "dir": [-0.85, -0.4, 0.35], "role": "arm", "group": "limbs" },
    { "name": "elbowR", "parent": "shoulderR", "at": [-0.105, 0.024, 0.05], "dir": [-0.5, -0.3, 0.8], "role": "arm", "group": "limbs" },
    { "name": "handR", "parent": "elbowR", "at": [-0.125, 0.012, 0.08], "dir": [-0.4, -0.2, 0.9], "role": "arm", "group": "limbs" },

    { "name": "hipL", "parent": "hips", "at": [0.065, 0.04, -0.085], "dir": [0.8, -0.3, -0.4], "role": "leg", "group": "limbs" },
    { "name": "kneeL", "parent": "hipL", "at": [0.105, 0.025, -0.105], "dir": [0.5, -0.3, 0.8], "role": "leg", "group": "limbs" },
    { "name": "footL", "parent": "kneeL", "at": [0.125, 0.012, -0.075], "dir": [0.4, 0, 0.9], "role": "leg", "group": "limbs" },
    { "name": "hipR", "parent": "hips", "at": [-0.065, 0.04, -0.085], "dir": [-0.8, -0.3, -0.4], "role": "leg", "group": "limbs" },
    { "name": "kneeR", "parent": "hipR", "at": [-0.105, 0.025, -0.105], "dir": [-0.5, -0.3, 0.8], "role": "leg", "group": "limbs" },
    { "name": "footR", "parent": "kneeR", "at": [-0.125, 0.012, -0.075], "dir": [-0.4, 0, 0.9], "role": "leg", "group": "limbs" },

    { "name": "fingerL1", "parent": "handL", "at": [0.137, 0.01, 0.086], "dir": [0.6, 0, 0.8], "role": "digit", "group": "limbs" },
    { "name": "fingerL2", "parent": "handL", "at": [0.131, 0.01, 0.092], "dir": [0.25, 0, 0.97], "role": "digit", "group": "limbs" },
    { "name": "fingerL3", "parent": "handL", "at": [0.122, 0.01, 0.093], "dir": [-0.15, 0, 0.99], "role": "digit", "group": "limbs" },
    { "name": "fingerL4", "parent": "handL", "at": [0.113, 0.01, 0.09], "dir": [-0.5, 0, 0.87], "role": "digit", "group": "limbs" },
    { "name": "fingerR1", "parent": "handR", "at": [-0.137, 0.01, 0.086], "dir": [-0.6, 0, 0.8], "role": "digit", "group": "limbs" },
    { "name": "fingerR2", "parent": "handR", "at": [-0.131, 0.01, 0.092], "dir": [-0.25, 0, 0.97], "role": "digit", "group": "limbs" },
    { "name": "fingerR3", "parent": "handR", "at": [-0.122, 0.01, 0.093], "dir": [0.15, 0, 0.99], "role": "digit", "group": "limbs" },
    { "name": "fingerR4", "parent": "handR", "at": [-0.113, 0.01, 0.09], "dir": [0.5, 0, 0.87], "role": "digit", "group": "limbs" },

    { "name": "toeL1", "parent": "footL", "at": [0.14, 0.009, -0.073], "dir": [0.8, 0, 0.6], "role": "digit", "group": "limbs" },
    { "name": "toeL2", "parent": "footL", "at": [0.134, 0.009, -0.068], "dir": [0.45, 0, 0.9], "role": "digit", "group": "limbs" },
    { "name": "toeL3", "parent": "footL", "at": [0.126, 0.009, -0.066], "dir": [0.1, 0, 1], "role": "digit", "group": "limbs" },
    { "name": "toeL4", "parent": "footL", "at": [0.118, 0.009, -0.067], "dir": [-0.25, 0, 0.97], "role": "digit", "group": "limbs" },
    { "name": "toeL5", "parent": "footL", "at": [0.111, 0.009, -0.071], "dir": [-0.6, 0, 0.8], "role": "digit", "group": "limbs" },
    { "name": "toeR1", "parent": "footR", "at": [-0.14, 0.009, -0.073], "dir": [-0.8, 0, 0.6], "role": "digit", "group": "limbs" },
    { "name": "toeR2", "parent": "footR", "at": [-0.134, 0.009, -0.068], "dir": [-0.45, 0, 0.9], "role": "digit", "group": "limbs" },
    { "name": "toeR3", "parent": "footR", "at": [-0.126, 0.009, -0.066], "dir": [-0.1, 0, 1], "role": "digit", "group": "limbs" },
    { "name": "toeR4", "parent": "footR", "at": [-0.118, 0.009, -0.067], "dir": [0.25, 0, 0.97], "role": "digit", "group": "limbs" },
    { "name": "toeR5", "parent": "footR", "at": [-0.111, 0.009, -0.071], "dir": [0.6, 0, 0.8], "role": "digit", "group": "limbs" }
  ],
  "parts": [
    {
      "id": "head",
      "builds": "The chibi skull and jaws, which together read as one very wide, flat, rounded head. (1) Upper skull ellipsoid at headCenter with radii [0.10,0.057,0.09] in skin, shaded by a darker skinBack cap over the crown (a slightly smaller ellipsoid or flat lathe on top, y>0.1) and a few spot-coloured freckle discs seated on the crown (use b.surface/stick). (2) A snout bump: a small flattened ellipsoid at [0,0.07,0.205] so the front is blunt and cute. (3) Lower jaw on joint jaw: ellipsoid centred [0,0.035,0.15] with radii [0.088,0.026,0.078] in belly/cream, with a skin-coloured upper rim, so the mouth seam sits at y≈0.056. Inside the mouth, a small dark mouthInside tray on the upper skull's underside and a tongue (flat tongue-coloured ellipsoid) on the jaw floor. Both jaws overlap enough that the closed mouth has no gap. (4) Two low brow ridges above the eyes (small skin-coloured ellipsoids at eyeL/eyeR raised 0.012) so the eyes sit under a bump. (5) The throat/gular fold: 2 thin cream arcs under the jaw. Faceted low-poly spheres (10x7).",
      "box": [[-0.1, 0.008, 0.05], [0.1, 0.145, 0.232]],
      "attaches": "Rides joints head (skull) and jaw (lower jaw, tongue). The back of the skull overlaps the body front at neckJoin. The gills and face build onto this skull surface at the mounts gillBase* and eyeL/R, cheekL/R and nostrilL/R.",
      "joints": ["head", "jaw"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "face",
      "builds": "Every facial detail, seated on the skull surface (snap with b.surface(b.root).nearest or b.stick; the head part is already built). (1) Two big chibi eyes at eyeL/eyeR, each layered: a dark eyeRing sphere (r 0.019), an eye bead sphere (r 0.016, glossy near-black), a thin eyeGold ring or crescent just under the pupil, and two white shine spots (one large at the upper outer side, one tiny lower inside) with r 0.005 and 0.0025. Eyes bulge slightly out of the skull and face forward-up. (2) A wide upturned smile: a mouthLine sweep (r 0.0012) draped along the mouth seam from the corner at x=-0.085 to x=+0.085, with both ends curling up 0.01, plus tiny dimple ticks at the corners. The line rides jaw/head and does not cover the jaw seam. (3) Blush: flat blush-coloured ellipses (about 0.03x0.02, 0.002 thick) at cheekL/R, aimed outward, plus 3 tiny darker blush ticks on each. (4) Nostrils: two tiny nostril-coloured dots at nostrilL/R. (5) A few tiny spot-coloured freckles across the snout. (6) A thin dark eyeRing arc brow lines above each eye. Everything stays small, layered as outline, main colour and highlight, and nothing hangs in front of the face.",
      "box": [[-0.1, 0.03, 0.1], [0.1, 0.145, 0.235]],
      "attaches": "Seats on the head skull (head part) at eyeL/R, cheekL/R, nostrilL/R and mouthFront. The smile and mouth details are placed along the jawHinge seam and ride joint head for the upper features and joint jaw for the lower lip ticks.",
      "joints": ["head", "jaw"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "gills",
      "builds": "The signature frilly gills: 3 stalks per side (6 total), the richest part of the model. Each stalk starts at gillBase{L,R}{1,2,3} (sunk slightly into the skull) and follows the joints gill{L,R}{n} and gill{L,R}{n}b (about 0.09 to 0.11 m long). Stalk directions are: stalk 1 out, up and back (reaching about y=0.2), stalk 2 out and a little up (reaching x≈±0.175), stalk 3 out and slightly down (low, nearly horizontal). Each stalk is a tapered smooth-skinned sweep (radius 0.007 to 0.003) on its two joints (gillStalk, with a darker gillDeep base collar of 0.01 radius where it meets the head). Along each stalk, 6 to 7 pairs of filaments branch both ways, built as slim leaf-shaped extrudes or flattened tapered spikes (length 0.03 near the base, 0.045 mid-stalk, shrinking to 0.02 at the tip), fanned about 50° to 70° away from the stalk, and curved a little backward. Filament colour runs root to tip: gillDeep or gillStalk, then gillFrill, then a gillTip pale-pink point or tiny bead. The filaments of the upper stalks arch up and those of the lower stalks droop, and the sides are slightly different lengths so the fan reads full and feathery. Each filament rides its stalk joint, so the gills can wave. A small cluster of 3 short filaments finishes each stalk tip. Mirror exactly across x=0. Use faceted 5-6 sided tubes.",
      "box": [[-0.2, 0.04, 0.04], [0.2, 0.21, 0.13]],
      "attaches": "Roots at the mounts gillBaseL1-3 and gillBaseR1-3 on the rear cheeks of the skull ellipsoid (centre headCenter). Joints gill*, gill*b are children of head.",
      "joints": ["gillL1", "gillL1b", "gillL2", "gillL2b", "gillL3", "gillL3b", "gillR1", "gillR1b", "gillR2", "gillR2b", "gillR3", "gillR3b"],
      "floor": false,
      "budget": 240
    },
    {
      "id": "bodyTail",
      "builds": "The torso, tail and fins. (1) A chunky body loft (chain/sweep over hips, spine and the neckJoin point) from z≈0.07 to z=-0.11, about 0.13 wide and 0.10 tall with a rounded oval section. It is centred at y=0.05 so its belly bottom rests on y=0, in skin, with a cream belly sector underneath (sectors or a separate flatter belly sweep) and a darker skinBack stripe sector along the back. (2) The tail is a swept chain on tail1..tail5 starting at tailRoot with the same section as the body end (half-width 0.045, half-height 0.045) and tapering to a flat paddle at tailTip (half-width 0.006, half-height 0.016) with a round or point cap, laterally flattened (taller than wide), cream belly sector underneath. (3) The dorsal fin: a membrane or extruded scalloped ridge from dorsalStart (just behind the head) along the back and the full tail round the tip, 0.025 high on the body rising to 0.035 on the tail, then falling to a rounded tip, in fin colour with a finEdge rim strip (a thin sweep along its outer edge), small rib lines (thin finEdge extrudes or rods) every 0.02, and scalloped bumps along the edge. A shorter ventral fin underneath the last 0.12 m of tail, same style. The fin rides the tail joints. (4) Markings: 10 to 14 spot-coloured freckle discs scattered on the back and tail sides (b.surface scatter, minDist 0.025), size 0.006 to 0.012. (5) Subtle details: a cloaca bump (belly-coloured, 0.01) underneath at z=-0.1 and 4 to 5 faint costal groove arcs (thin skinBack rods wrapped on each flank). All sweeps bend smoothly at the joints.",
      "box": [[-0.075, 0.0, -0.31], [0.075, 0.14, 0.07]],
      "attaches": "The front end overlaps the back of the head skull at neckJoin [0,0.055,0.06]. Limbs attach to its flanks at shoulderL/R and hipSocketL/R. The gills and face do not touch it. Joints are hips, spine and tail1 to tail5.",
      "joints": ["hips", "spine", "tail1", "tail2", "tail3", "tail4", "tail5"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "limbs",
      "builds": "Four stubby, splayed limbs with chunky paws and long rounded digits. Front limbs run shoulder{L,R} to elbow{L,R} to hand{L,R}, and hind limbs hip{L,R} to knee{L,R} to foot{L,R}, using the joint positions exactly. Each limb is a smooth sweep, radius 0.016 at the root tapering to 0.012 at the wrist or ankle, in skin with a pale belly-coloured underside and a small spot freckle or two on each upper arm. Each limb root is hidden by a rounded skin shoulder or hip bulge ellipsoid (r≈0.022) seated on the flank at shoulder{L,R} and hipSocket{L,R}. Paws: a flat, rounded palm pad (flattened ellipsoid, 0.032 wide, 0.008 thick, resting on y≈0.004 to 0.012 so the underside touches the floor around y=0) at handPad{L,R} and footPad{L,R}, with a darker pad-coloured sole patch. Digits: 4 per hand (fingerL1-4, fingerR1-4) and 5 per foot (toeL1-5, toeR1-5), each a 6 to 7 sided tapered capsule or sweep from the digit joint along its dir (length 0.022 to 0.03, radius 0.0048 tapering to 0.003 and ending with a round tip), fanned as per the joint directions, lying flat on the floor (centre y≈0.006) and the outer and inner digits slightly shorter. Each digit ends in a small digitTip-coloured bulb (r≈0.004). Digits ride their digit joints, and arm and leg tubes ride their chain joints. Everything mirrored across x=0.",
      "box": [[-0.15, 0.0, -0.13], [0.15, 0.065, 0.115]],
      "attaches": "Roots at shoulderL/R and hipSocketL/R on the body flanks (bodyTail) and ends at handPad* and footPad* mounts on the floor. The chains parent to spine (arms) and hips (legs).",
      "joints": ["shoulderL", "elbowL", "handL", "shoulderR", "elbowR", "handR", "hipL", "kneeL", "footL", "hipR", "kneeR", "footR", "fingerL1", "fingerL2", "fingerL3", "fingerL4", "fingerR1", "fingerR2", "fingerR3", "fingerR4", "toeL1", "toeL2", "toeL3", "toeL4", "toeL5", "toeR1", "toeR2", "toeR3", "toeR4", "toeR5"],
      "floor": true,
      "budget": 170
    }
  ]
}
```

<!-- call: gills -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildGills({ b, J, P, M }: Ctx) {
  const R = rng(11);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (let n = 1; n <= 3; n++) {
      const j1 = J[`gill${side}${n}`];
      const j2 = J[`gill${side}${n}b`];
      const base = new THREE.Vector3(...(M[`gillBase${side}${n}`] as [number, number, number]));
      const mid = new THREE.Vector3(...j2.at.toArray());
      const dir1 = mid.clone().sub(base).normalize();
      const droop = n === 3 ? -1 : n === 1 ? 1 : 0.3;
      const tip = mid.clone().addScaledVector(dir1, 0.05);
      tip.y += droop * 0.004;
      // stalk: two sweeps, one per joint, tapered
      b.capsule(base.clone().addScaledVector(dir1, -0.008), mid, [0.007, 0.0048], P.gillStalk, { bone: j1, sides: 6 });
      b.capsule(mid, tip, [0.0048, 0.003], P.gillStalk, { bone: j2, sides: 6 });
      // base collar
      b.part(new THREE.SphereGeometry(0.01, 6, 5), P.gillDeep, { bone: j1, at: base.clone().addScaledVector(dir1, 0.002) });
      // side axis perpendicular to the stalk
      const up = new THREE.Vector3(0, 1, 0);
      let side1 = new THREE.Vector3().crossVectors(dir1, up);
      if (side1.length() < 0.1) side1.set(0, 0, 1);
      side1.normalize();
      const upv = new THREE.Vector3().crossVectors(side1, dir1).normalize();
      const total = 7;
      for (let i = 0; i < total; i++) {
        const t = (i + 0.7) / (total + 0.3);
        const along = t < 0.5 ? 0 : 1;
        const jt = along ? j2 : j1;
        const p = base.clone().lerp(tip, t);
        const len = (0.03 + 0.017 * Math.sin(Math.PI * Math.min(t * 1.1, 1))) * (1 - 0.3 * t) * (0.9 + R() * 0.2 + (s > 0 ? 0.05 : 0));
        for (const k of [1, -1]) {
          const ang = (60 - 8 * t) * (Math.PI / 180);
          const d = dir1.clone().multiplyScalar(Math.cos(ang) * 0.6)
            .addScaledVector(side1, k * Math.sin(ang))
            .addScaledVector(upv, 0.25 * (n === 3 ? -1 : 1) * 0.6)
            .add(new THREE.Vector3(0, 0, -0.25)).normalize();
          const col = t < 0.3 ? P.gillDeep : P.gillFrill;
          const e = p.clone().addScaledVector(d, len);
          b.spike(p, e, null, 0.0042, col, { bone: jt, sides: 5 });
          b.part(new THREE.SphereGeometry(0.0034, 5, 4), P.gillTip, { bone: jt, at: e });
        }
      }
      // tip cluster
      for (let c = -1; c <= 1; c++) {
        const d = dir1.clone().addScaledVector(side1, c * 0.5).addScaledVector(upv, 0.15).normalize();
        const e = tip.clone().addScaledVector(d, 0.022);
        b.spike(tip, e, null, 0.0035, P.gillFrill, { bone: j2, sides: 5 });
        b.part(new THREE.SphereGeometry(0.003, 5, 4), P.gillTip, { bone: j2, at: e });
      }
    }
  }
}
```

<!-- call: limbs -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildLimbs({ b, J, P, M }: any) {
  const R = rng(5);
  const ell = (rx: number, ry: number, rz: number, seg = 8) =>
    new THREE.SphereGeometry(1, seg, 6).scale(rx, ry, rz);

  // [name, shoulder joint, mid joint, end joint, digit joint names, side, front?, pad mount]
  const sides = [1, -1];
  for (const s of sides) {
    const S = s > 0 ? "L" : "R";
    const limbsDef = [
      { root: "shoulder", mid: "elbow", end: "hand", digits: ["finger", 4], pad: M["handPad" + S], rootAt: M["shoulder" + S], front: true },
      { root: "hip", mid: "knee", end: "foot", digits: ["toe", 5], pad: M["footPad" + S], rootAt: M["hipSocket" + S], front: false },
    ] as const;
    for (const d of limbsDef) {
      const j0 = J[d.root + S], j1 = J[d.mid + S], j2 = J[d.end + S];
      const p0: number[] = d.rootAt;
      const p1 = [j1.at.x, j1.at.y, j1.at.z];
      const p2 = [j2.at.x, j2.at.y, j2.at.z];
      // upper segment and lower segment
      b.sweep([p0, p1], [0.016, 0.014], { color: P.skin, bone: j0, sides: 7, caps: "round" });
      b.sweep([p1, p2], [0.014, 0.012], { color: P.skin, bone: j1, sides: 7, caps: "round" });
      // pale underside strips
      b.rod([p0[0], p0[1] - 0.011, p0[2]], [p1[0], p1[1] - 0.011, p1[2]], 0.006, { color: P.belly, bone: j0, sides: 6 });
      b.rod([p1[0], p1[1] - 0.009, p1[2]], [p2[0], p2[1] - 0.009, p2[2]], 0.005, { color: P.belly, bone: j1, sides: 6 });
      // joint bulge
      b.part(ell(0.022, 0.02, 0.024), P.skin, { bone: j0, at: [p0[0], p0[1], p0[2]] });
      b.part(ell(0.015, 0.014, 0.015), P.skin, { bone: j1, at: p1 });
      // freckles
      for (let i = 0; i < 2; i++) {
        const t = 0.3 + i * 0.4;
        b.part(ell(0.0045, 0.002, 0.0045, 6), P.spot, {
          bone: j0,
          at: [p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t + 0.014 - i * 0.002, p0[2] + (p1[2] - p0[2]) * t + (R() - 0.5) * 0.006],
        });
      }
      // paw
      const pad = d.pad;
      b.part(ell(0.018, 0.005, 0.019), P.skin, { bone: j2, at: [pad[0], 0.006, pad[2]] });
      b.part(ell(0.011, 0.0025, 0.012, 7), P.pad, { bone: j2, at: [pad[0], 0.0026, pad[2]] });
      // digits
      const n = d.digits[1] as number;
      for (let k = 1; k <= n; k++) {
        const dj = J[d.digits[0] + S + k];
        const a = [dj.at.x, dj.at.y, dj.at.z];
        const dir = [dj.axis.x, 0, dj.axis.z];
        const mid = Math.abs(k - (n + 1) / 2) / (n / 2);
        const len = 0.028 - 0.005 * mid;
        const e = [a[0] + dir[0] * len, 0.006, a[2] + dir[2] * len];
        const a2 = [a[0], 0.006, a[2]];
        b.sweep([a2, e], [0.0048, 0.003], { color: P.skin, bone: dj, sides: 6, caps: "round" });
        b.part(new THREE.SphereGeometry(0.004, 6, 5), P.digitTip, { bone: dj, at: e });
      }
    }
  }
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildHead({ b, J, P, M }: any) {
  const R = rng(11);
  const head = J.head, jaw = J.jaw;
  const C = [0, 0.083, 0.14] as [number, number, number];

  const ell = (c: number[], r: number[], col: string, bone: any, w = 10, h = 7) =>
    b.part(new THREE.SphereGeometry(1, w, h), col, { bone, at: c, scale: r });

  // upper skull
  ell(C, [0.1, 0.057, 0.09], P.skin, head);
  // darker crown cap
  ell([0, 0.096, 0.135], [0.082, 0.047, 0.074], P.skinBack, head);
  // snout bump
  ell([0, 0.07, 0.205], [0.05, 0.03, 0.03], P.skin, head);
  // cheek fullness to widen the head
  for (const s of [1, -1]) ell([s * 0.07, 0.07, 0.13], [0.035, 0.04, 0.06], P.skin, head, 8, 6);

  // freckles on the crown
  const skin = b.surface(b.root);
  const spots: [number, number, number][] = [[-20, 75, 0.008], [15, 70, 0.007], [-45, 60, 0.006], [40, 62, 0.009], [0, 55, 0.006], [-8, 80, 0.005]];
  for (const [az, el, r] of spots) {
    const hit = skin.around(C).at(az, el);
    if (hit) b.stick(new THREE.CylinderGeometry(r, r, 0.003, 7), P.spot, hit, { embed: 0.4, bone: head });
  }

  // brow ridges
  for (const s of [1, -1]) {
    ell([s * 0.056, 0.135, 0.18], [0.02, 0.009, 0.016], P.skin, head, 8, 6);
  }

  // mouth interior tray on the upper skull underside
  ell([0, 0.058, 0.15], [0.078, 0.006, 0.07], P.mouthInside, head, 10, 5);

  // lower jaw
  ell([0, 0.035, 0.15], [0.088, 0.026, 0.078], P.belly, jaw);
  // skin-coloured upper rim of the jaw
  const rim = b.part(new THREE.TorusGeometry(1, 0.06, 5, 16), P.skin, {
    bone: jaw, at: [0, 0.051, 0.15], rotation: [90, 0, 0], scale: [0.082, 0.07, 0.3],
  });
  void rim;
  // jaw floor and tongue
  ell([0, 0.05, 0.155], [0.07, 0.006, 0.06], P.mouthInside, jaw, 10, 5);
  ell([0, 0.054, 0.16], [0.04, 0.005, 0.04], P.tongue, jaw, 8, 5);

  // gular fold arcs under the jaw
  for (const [z, rr] of [[0.14, 0.07], [0.115, 0.062]] as number[][]) {
    const t = new THREE.TorusGeometry(1, 0.035, 4, 14, Math.PI);
    b.part(t, "#f2d6cc", {
      bone: jaw, at: [0, 0.018, z], rotation: [90, 180, 0], scale: [rr, rr * 0.8, 0.04 / 0.035 * 0.8],
    });
  }
  void R;
}
```

<!-- call: face -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildFace({ b, J, P, M }: any) {
  const head = J.head;
  const jaw = J.jaw;
  const skull = b.surface(b.root);
  const ctr: [number, number, number] = [0, 0.083, 0.14];
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  // seat a point on the skull surface, lifted out along the normal
  const seat = (p: number[], lift = 0) => {
    const h = skull.nearest(p);
    return { h, at: h.moved([0, lift, 0]).at };
  };

  // ---- eyes ----
  for (const s of [1, -1]) {
    const e = M[s > 0 ? "eyeL" : "eyeR"];
    const { h } = seat(e, 0);
    const n = h.n.clone();
    const base = h.at.clone().addScaledVector(n, 0.004);
    const ring = b.part(sph(0.019, 10, 7), P.eyeRing, { bone: head, at: base });
    const out = (d: number) => base.clone().addScaledVector(n, d);
    b.part(sph(0.016, 10, 7), P.eye, { bone: head, at: out(0.005) });
    // gold crescent under pupil
    const g = out(0.0155).add(new THREE.Vector3(0, -0.006, 0.002));
    b.part(new THREE.TorusGeometry(0.009, 0.0013, 4, 10, Math.PI), P.eyeGold, {
      bone: head, at: g, dir: n.toArray(), axis: "z", rotation: undefined,
    });
    // shines
    b.part(sph(0.005, 6, 4), P.shine, {
      bone: head, at: out(0.0195).add(new THREE.Vector3(s * 0.006, 0.007, 0.002)),
    });
    b.part(sph(0.0025, 5, 4), P.shine, {
      bone: head, at: out(0.0195).add(new THREE.Vector3(-s * 0.005, -0.006, 0.002)),
    });
    // brow arc
    const bp = [-1, 0, 1].map((k) => {
      const q = [e[0] + k * 0.014 * 1, e[1] + 0.024 - Math.abs(k) * 0.004, e[2] - 0.006 + k * 0.0];
      return seat([e[0] + k * 0.014, q[1], q[2]], 0.002).at;
    });
    b.sweep(bp, 0.0014, { bone: head, color: P.eyeRing, sides: 5 });
  }

  // ---- smile ----
  const pts: THREE.Vector3[] = [];
  const N = 9;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1) * 2 - 1;
    const x = t * 0.085;
    const y = 0.056 - 0.011 * (1 - t * t) + 0.0 + 0.012 * t * t * t * t;
    const z = 0.222 - 0.1 * t * t - 0.0;
    pts.push(seat([x, y + 0.0, z], 0.001).at);
  }
  b.sweep(pts, 0.0012, { bone: head, color: P.mouthLine, sides: 5 });
  for (const s of [1, -1]) {
    const c = pts[s > 0 ? N - 1 : 0];
    b.part(sph(0.0025, 5, 4), P.mouthLine, { bone: head, at: c });
    for (const d of [0.006, 0.012]) {
      b.part(new THREE.BoxGeometry(0.0012, 0.006, 0.0012), P.mouthLine, {
        bone: jaw,
        at: [c.x + s * 0.002, c.y - 0.004 - d * 0.2, c.z - d * 0.2],
        rotation: [0, 0, -s * 25],
      });
    }
  }

  // ---- blush ----
  for (const s of [1, -1]) {
    const c = M[s > 0 ? "cheekL" : "cheekR"];
    const { h } = seat(c, 0);
    const bl = b.stick(new THREE.CylinderGeometry(0.015, 0.015, 0.003, 10), P.blush, h, { embed: 0.3, scale: [1, 1, 0.65], bone: head } as any);
    for (let k = 0; k < 3; k++) {
      const q = seat([c[0], c[1] - 0.004 + 0.004 * 0, c[2] + (k - 1) * 0.008], 0.0025);
      b.stick(new THREE.BoxGeometry(0.0015, 0.0015, 0.007), "#d9607f", q.h, { embed: 0.2, bone: head, spin: 20 } as any);
    }
  }

  // ---- nostrils ----
  for (const s of [1, -1]) {
    const { h } = seat(M[s > 0 ? "nostrilL" : "nostrilR"], 0);
    b.stick(sph(0.0028, 5, 4), P.nostril, h, { embed: 0.3, bone: head } as any);
  }

  // ---- freckles ----
  const r = rng(11);
  for (let i = 0; i < 6; i++) {
    const x = (r() - 0.5) * 0.09;
    const { h } = seat([x, 0.105, 0.2 + r() * 0.02], 0);
    b.stick(new THREE.CylinderGeometry(0.003, 0.003, 0.002, 6), P.spot, h, { embed: 0.3, bone: head } as any);
  }
}
```

<!-- call: bodyTail -->

```ts
import * as THREE from "three";
import { rng, catmull } from "agentic-3js-builder";

export function buildBodyTail({ b, J, P, M }: any) {
  const R = rng(11);
  const hips = J.hips, spine = J.spine;
  const tails = [J.tail1, J.tail2, J.tail3, J.tail4, J.tail5];

  // torso: oval loft from neck to tail root
  const bodyPath = catmull([[0, 0.05, 0.075], [0, 0.05, 0.0], [0, 0.05, -0.05], [0, 0.05, -0.11]]);
  const body = b.sweep(bodyPath, (t: number) => [0.065 - 0.012 * t * t, 0.05], {
    bone: [hips, spine], color: P.skin, caps: "round", sides: 10,
    sectors: [[-60, 60, P.skinBack], [130, 230, P.belly]],
  });

  // tail: flattened, tapering paddle
  const tp = catmull([[0, 0.05, -0.1], [0, 0.048, -0.155], [0, 0.044, -0.21], [0, 0.04, -0.26], [0, 0.037, -0.295], [0, 0.037, -0.31]]);
  const tail = b.sweep(tp, (t: number) => [0.045 - 0.039 * t, 0.045 - 0.029 * t], {
    bone: [hips, ...tails], color: P.skin, caps: "round", sides: 8,
    sectors: [[-55, 55, P.skinBack], [130, 230, P.belly]],
  });

  // dorsal fin along back and tail
  const dorsalPts: number[][] = [];
  const baseTop: number[][] = [[0, 0.098, 0.04], [0, 0.1, 0.0], [0, 0.1, -0.06], [0, 0.097, -0.1]];
  for (const p of baseTop) dorsalPts.push(p);
  const tailTop = (t: number, lift: number) => {
    const p = tp.at(t);
    const ry = 0.045 - 0.029 * t;
    return [0, p.y + ry + lift, p.z];
  };
  const edgeTop: number[][] = [[0, 0.098, 0.04], [0, 0.124, 0.0], [0, 0.125, -0.06], [0, 0.123, -0.1]];
  const baseA: number[][] = [...baseTop];
  const edgeA: number[][] = [...edgeTop];
  for (let i = 1; i <= 8; i++) {
    const t = i / 8 * 0.97;
    const lift = 0.03 * (1 - Math.pow(t, 3) * 0.6) + (i % 2 ? 0.004 : 0);
    baseA.push(tailTop(t, -0.004));
    edgeA.push(tailTop(t, lift));
  }
  b.membrane(baseA, edgeA, { color: P.fin, thickness: 0.003, bone: tails[1], rows: 2 });
  b.sweep(edgeA, 0.0025, { color: P.finEdge, bone: tails[1], sides: 5 });
  // ribs
  for (let i = 0; i < baseA.length; i += 1) {
    if (i < 1) continue;
    b.rod(baseA[i], edgeA[i], 0.0014, { color: P.finEdge, bone: i < 4 ? hips : tails[Math.min(4, i - 3)], sides: 4 });
    b.part(new THREE.SphereGeometry(0.004, 6, 4), P.fin, { at: edgeA[i], bone: i < 4 ? hips : tails[Math.min(4, i - 3)] });
  }

  // ventral fin on last 0.12 m
  const vb: number[][] = [], ve: number[][] = [];
  for (let i = 0; i <= 5; i++) {
    const t = 0.6 + i * 0.07;
    const p = tp.at(t);
    const ry = 0.045 - 0.029 * t;
    const h = 0.018 * Math.sin(Math.PI * (0.1 + 0.8 * i / 5));
    vb.push([0, p.y - ry + 0.004, p.z]);
    ve.push([0, p.y - ry - h, p.z]);
  }
  b.membrane(vb, ve, { color: P.fin, thickness: 0.003, bone: tails[3], rows: 2 });
  b.sweep(ve, 0.002, { color: P.finEdge, bone: tails[3], sides: 5 });

  // freckles
  const sk = b.surface([body, tail]);
  const hits = sk.scatter(13, { rng: R, minDist: 0.025, filter: (h: any) => h.n.y > 0.35 || Math.abs(h.n.x) > 0.6 });
  for (const h of hits) {
    const r = 0.003 + R() * 0.003;
    b.stick(new THREE.CylinderGeometry(r, r, 0.003, 7), P.spot, h, { embed: 0.4 });
  }

  // costal grooves
  for (const s of [1, -1])
    for (let i = 0; i < 5; i++) {
      const z = 0.05 - i * 0.032;
      b.rod([s * 0.06, 0.07, z + 0.006], [s * 0.066, 0.03, z - 0.004], 0.0016, { color: P.skinBack, bone: z > -0.01 ? spine : hips, sides: 4 });
    }

  // cloaca
  b.part(new THREE.SphereGeometry(0.01, 8, 6), P.belly, { at: [0, 0.006, -0.1], bone: hips, scale: [1, 0.6, 1.2] });
}
```