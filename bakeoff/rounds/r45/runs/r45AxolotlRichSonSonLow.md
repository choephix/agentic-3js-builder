<!-- call: plan -->

```json
{
  "name": "Pinky the Axolotl",
  "description": "A chibi, plush-proportioned leucistic axolotl lying on its belly, with a huge smiling head, glossy bead eyes, stubby four-fingered limbs, a finned tail and six frilly pink gill plumes.",
  "builderName": "chibiAxolotl",
  "size": [0.58, 0.34, 0.74],
  "layout": "Chibi toy proportions in metres, scaled so the whole animal is about 0.74 m long. The axolotl lies on its belly with all four limbs splayed. From the front (+Z) to the back: a big, wide, flat-topped, rounded head (about 0.32 wide, 0.26 tall, 0.31 long, roughly 45% of the body length) with the snout rounding off at z about 0.36. The face is a wide upturned smile, tiny nostril dots, two big glossy black bead eyes high on the front corners of the skull with white highlights, and round pink blush discs on the cheeks. Behind the head sit three feathery gill plumes on each side, fanning out sideways, up and back like a ruffled collar. They are the signature feature and the widest and tallest part of the silhouette: the upper plume rises about 45 degrees, the middle one is nearly horizontal and the lower one droops slightly. Behind the head is a short, plump, rounded torso (radius about 0.09) with a pale belly. Four tiny stubby limbs stick out sideways and flat, the front pair just behind the head under the gills and the hind pair at the rear of the torso. Each ends in a small paddle hand or foot with four rounded little fingers or toes. The tail is short and laterally flattened, tapering to a rounded tip at z about -0.37. A continuous soft frilled dorsal fin crest runs from the back of the head over the torso and widens into a tall ribbon fin around the tail. Everything is soft, rounded and blocky, with a few facets showing. Colour sits in zones. The main skin is warm pink with a lighter cream-pink belly and chin. Small darker pink freckles are scattered over the head, back and tail. The gills fade from salmon stalks through hot pink frills to pale pink tips. Dark ink is used only for eyes and the mouth line. The head, torso, limbs and tail all rest on the floor (lowest points y 0 to 0.005). The gills and the dorsal crest sit above it.",
  "palette": {
    "skin": "#f7b5c6",
    "skinLight": "#fbcdd8",
    "skinShade": "#e99bb2",
    "belly": "#ffe6e9",
    "freckle": "#e68aa5",
    "gold": "#f7dba0",
    "blush": "#ff8aa8",
    "eye": "#1a1220",
    "eyeShine": "#ffffff",
    "eyeRim": "#c9607f",
    "nostril": "#cf6f8b",
    "mouth": "#b83e66",
    "tongue": "#ff7f9f",
    "gillStalk": "#f27a9a",
    "gillFrill": "#ff4f86",
    "gillTip": "#ffa3c0",
    "finMain": "#fbaac0",
    "finEdge": "#ff7aa0",
    "finRay": "#ee86a4",
    "toe": "#fcc9d5",
    "toeTip": "#ffe4ea"
  },
  "mounts": {
    "headCenter": [0, 0.13, 0.2],
    "neckJoin": [0, 0.11, 0.07],
    "jawHinge": [0, 0.075, 0.19],
    "snoutTip": [0, 0.1, 0.36],
    "eyeL": [0.1, 0.2, 0.27],
    "eyeR": [-0.1, 0.2, 0.27],
    "cheekL": [0.13, 0.11, 0.25],
    "cheekR": [-0.13, 0.11, 0.25],
    "gillRootL1": [0.1, 0.2, 0.1],
    "gillRootL2": [0.11, 0.16, 0.1],
    "gillRootL3": [0.1, 0.12, 0.1],
    "gillRootR1": [-0.1, 0.2, 0.1],
    "gillRootR2": [-0.11, 0.16, 0.1],
    "gillRootR3": [-0.1, 0.12, 0.1],
    "shoulderL": [0.085, 0.06, 0.07],
    "shoulderR": [-0.085, 0.06, 0.07],
    "hipL": [0.085, 0.06, -0.1],
    "hipR": [-0.085, 0.06, -0.1],
    "torsoBack": [0, 0.085, -0.12],
    "backTop": [0, 0.175, 0.0],
    "dorsalStart": [0, 0.175, 0.05],
    "tailRoot": [0, 0.085, -0.12],
    "tailTip": [0, 0.065, -0.37]
  },
  "joints": [
    { "name": "hips", "at": [0, 0.09, -0.08], "dir": [0, 0, 1], "role": "spine" },
    { "name": "chest", "parent": "hips", "at": [0, 0.095, 0.06], "dir": [0, 0, 1], "role": "spine" },
    { "name": "head", "parent": "chest", "at": [0, 0.13, 0.18], "dir": [0, 0, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 0.075, 0.19], "dir": [0, 0, 1], "role": "jaw" },
    { "name": "gillL1", "parent": "head", "at": [0.1, 0.2, 0.1], "dir": [0.6, 0.7, -0.35], "role": "fan", "group": "gills" },
    { "name": "gillL2", "parent": "head", "at": [0.11, 0.16, 0.1], "dir": [0.9, 0.25, -0.35], "role": "fan", "group": "gills" },
    { "name": "gillL3", "parent": "head", "at": [0.1, 0.12, 0.1], "dir": [0.85, -0.1, -0.35], "role": "fan", "group": "gills" },
    { "name": "gillR1", "parent": "head", "at": [-0.1, 0.2, 0.1], "dir": [-0.6, 0.7, -0.35], "role": "fan", "group": "gills" },
    { "name": "gillR2", "parent": "head", "at": [-0.11, 0.16, 0.1], "dir": [-0.9, 0.25, -0.35], "role": "fan", "group": "gills" },
    { "name": "gillR3", "parent": "head", "at": [-0.1, 0.12, 0.1], "dir": [-0.85, -0.1, -0.35], "role": "fan", "group": "gills" },
    { "name": "shoulderL", "parent": "chest", "at": [0.085, 0.06, 0.07], "dir": [1, -0.3, 0.3], "role": "arm", "group": "limbs" },
    { "name": "elbowL", "parent": "shoulderL", "at": [0.15, 0.04, 0.09], "dir": [0.8, -0.3, 0.5], "role": "arm", "group": "limbs" },
    { "name": "handL", "parent": "elbowL", "at": [0.2, 0.02, 0.15], "dir": [0.5, 0, 0.8], "role": "arm", "group": "limbs" },
    { "name": "shoulderR", "parent": "chest", "at": [-0.085, 0.06, 0.07], "dir": [-1, -0.3, 0.3], "role": "arm", "group": "limbs" },
    { "name": "elbowR", "parent": "shoulderR", "at": [-0.15, 0.04, 0.09], "dir": [-0.8, -0.3, 0.5], "role": "arm", "group": "limbs" },
    { "name": "handR", "parent": "elbowR", "at": [-0.2, 0.02, 0.15], "dir": [-0.5, 0, 0.8], "role": "arm", "group": "limbs" },
    { "name": "hipL", "parent": "hips", "at": [0.085, 0.06, -0.1], "dir": [1, -0.3, -0.2], "role": "leg", "group": "limbs" },
    { "name": "kneeL", "parent": "hipL", "at": [0.15, 0.04, -0.12], "dir": [0.8, -0.3, -0.5], "role": "leg", "group": "limbs" },
    { "name": "footL", "parent": "kneeL", "at": [0.2, 0.02, -0.18], "dir": [0.5, 0, -0.8], "role": "leg", "group": "limbs" },
    { "name": "hipR", "parent": "hips", "at": [-0.085, 0.06, -0.1], "dir": [-1, -0.3, -0.2], "role": "leg", "group": "limbs" },
    { "name": "kneeR", "parent": "hipR", "at": [-0.15, 0.04, -0.12], "dir": [-0.8, -0.3, -0.5], "role": "leg", "group": "limbs" },
    { "name": "footR", "parent": "kneeR", "at": [-0.2, 0.02, -0.18], "dir": [-0.5, 0, -0.8], "role": "leg", "group": "limbs" },
    { "name": "tail1", "parent": "hips", "at": [0, 0.085, -0.12], "dir": [0, 0, -1], "role": "tail", "group": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 0.08, -0.2], "dir": [0, 0, -1], "role": "tail", "group": "tail" },
    { "name": "tail3", "parent": "tail2", "at": [0, 0.075, -0.28], "dir": [0, 0, -1], "role": "tail", "group": "tail" },
    { "name": "tail4", "parent": "tail3", "at": [0, 0.07, -0.34], "dir": [0, 0, -1], "role": "tail", "group": "tail" }
  ],
  "parts": [
    {
      "id": "head",
      "builds": "The chibi head, with the face settled first. A wide, flat-topped rounded skull (radii about 0.16 wide, 0.12 tall and 0.15 deep, centred on headCenter) in skin, with a lighter skinLight top plate and a skinShade underside band. The mouth is built as a separate upper and lower jaw. The upper jaw is a broad rounded snout block ending at snoutTip, and the lower jaw is a shallower, slightly narrower rounded block on the jaw joint, with a belly-coloured chin. Between them runs a wide upturned smile line in mouth colour, built as a thin sweep that curves up at both corners to about x +/-0.12, with a small tongue wedge (tongue) inside the lower jaw and tiny dark smile-corner dimples. Two big glossy bead eyes at eyeL and eyeR (sphere radius about 0.035, colour eye) sit slightly proud of the skull in low rings of eyeRim lids, each with a large eyeShine highlight sphere at the upper-inner front and a smaller second shine at the lower-outer side. Add small raised brow-ridge bumps above the eyes. Two tiny nostril dots (nostril) sit on top of the snout. Round flat blush discs (blush) sit on the cheeks at cheekL and cheekR, facing outwards and forwards. A handful of small freckle discs (freckle) and a few gold specks (gold) are seated on the top of the head. Do not build gills here, and keep everything in front of the gill roots.",
      "box": [[-0.17, 0.0, 0.05], [0.17, 0.27, 0.37]],
      "attaches": "Skull rides joint head and sits on the chest and torso at neckJoin. The lower jaw rides joint jaw, hinged at jawHinge. Gills root on the back sides of the skull at gillRoot* mounts, and the head part leaves those clear.",
      "joints": ["head", "jaw"],
      "floor": true,
      "budget": 190
    },
    {
      "id": "gills",
      "builds": "Six frilly gill plumes (three per side, mirrored), the signature feature and the richest build in the model. Each plume has a thick tapering curved stalk (sweep, gillStalk, radius about 0.012 tapering to 0.005) that grows from its gillRoot* mount along the joint direction. Lengths: upper (index 1) about 0.17, middle (index 2) about 0.16, lower (index 3) about 0.13. Along each stalk sit 8 to 10 feathery filaments on both the upper and lower sides, built as slim flat leaf-shaped extrudes or thin tapered spikes about 0.03 to 0.05 long. They are longest at the middle of the stalk and shorter towards the root and tip, and they fan out alternately and angle back towards the tip, making a bottle-brush or fern look. Colours go root-to-tip: gillStalk on the stalk, gillFrill on the filament bodies, gillTip on the outer ends, with a tiny gillTip bud sphere at the stalk end. Each plume rides its own gill joint, and the builder may add tip joints named gillL1b, gillL2b and so on (same pattern for R) for the outer half of each stalk, with role fan. Plumes may overlap their neighbours slightly but must not poke into the face. The whole spread should reach x about +/-0.29 and y about 0.34 at the highest tip.",
      "box": [[-0.29, 0.08, 0.02], [0.29, 0.34, 0.14]],
      "attaches": "Stalk bases are embedded about 0.01 inside the skull at gillRootL1/2/3 and gillRootR1/2/3. Each plume rides gillL1..3 and gillR1..3, which are children of joint head.",
      "joints": ["gillL1", "gillL2", "gillL3", "gillR1", "gillR2", "gillR3"],
      "floor": false,
      "budget": 230
    },
    {
      "id": "torso",
      "builds": "The short, plump chibi torso: a rounded loft (radius about 0.09, centre y about 0.09) from just behind the head at z about 0.1 back to torsoBack at z -0.12, in skin. The upper half has a skinLight back sector and the belly has a cream belly underside band (use sweep sectors). Add a flat belly-coloured patch on the floor-facing underside, fine soft gold and freckle spots scattered over the back and flanks (small flattened spheres or discs seated on the surface), and small skinShade shoulder and hip bulges where the limbs attach. Add a subtle row of 4 to 5 tiny gill-slit-like gold dimples is not wanted; instead add a few pale costal groove lines (thin curved sweeps in skinShade) along each flank. The torso hides all limb roots, and the head covers its front end.",
      "box": [[-0.1, 0.0, -0.13], [0.1, 0.18, 0.1]],
      "attaches": "Rides hips and chest. The front end is buried in the back of the head at neckJoin. The rear end meets the tail's first ring at torsoBack/tailRoot with the same radius, so they read as one body. Limbs root at shoulderL/R and hipL/R.",
      "joints": ["hips", "chest"],
      "floor": true,
      "budget": 120
    },
    {
      "id": "limbs",
      "builds": "Four tiny splayed limbs built as tapering sweeps along the joint chains. The front pair runs shoulderL > elbowL > handL, and the hind pair runs hipL > kneeL > footL (R mirrored at -x). Each limb is a stubby skin tube (radius about 0.022 at the root, tapering to about 0.016 at the wrist), with a little round elbow or knee knob. The end of each is a flat rounded paddle palm (toe colour) with exactly four rounded little fingers or toes fanned out, each a short capsule about 0.025 long and 0.008 radius in toe with a toeTip bead on the end. The builder adds digit joints named fingerL1..4 and fingerR1..4 under handL/handR and toeL1..4 and toeR1..4 under footL/footR, with role digit. Front hands point forward and outwards, and hind feet point back and outwards. Palms and toes rest flat on the floor, with the underside at y about 0 to 0.003. Add a couple of freckles on the upper arm and thigh.",
      "box": [[-0.27, 0.0, -0.25], [0.27, 0.1, 0.23]],
      "attaches": "Limb roots are buried slightly into the torso at shoulderL/R and hipL/R. They ride joints shoulder/elbow/hand and hip/knee/foot plus the digit joints. The front limbs sit below and clear of the gill plumes, and the hands stay clear of the head sides.",
      "joints": ["shoulderL", "elbowL", "handL", "shoulderR", "elbowR", "handR", "hipL", "kneeL", "footL", "hipR", "kneeR", "footR"],
      "floor": true,
      "budget": 160
    },
    {
      "id": "tail",
      "builds": "The tail and the fins. The tail is a laterally flattened tapering sweep or loft from the torso at tailRoot (radius about 0.075 round) to a soft rounded tip at tailTip (about 0.012 wide and 0.05 tall), over chain tail1..tail4, in skin with a belly-coloured underside strip and a few freckles and gold specks. Above it is the dorsal fin crest, a continuous soft ribbon (extrude or membrane, finMain) that starts at dorsalStart, at the back of the head and torso, and runs back over the torso, growing in height from about 0.03 to about 0.09 above the spine line at the tail. It wraps around the tail tip and returns as a lower ventral fin along the underside of the tail for the last 0.15 m. The fin has a wavy scalloped finEdge rim, thin radial finRay lines (tiny rods or extruded slivers in finRay) and a few tiny freckle spots on the fin. Keep the fin thin (about 0.006 thick). The lowest points of the tail, belly and ventral fin touch the floor (y 0 to 0.005).",
      "box": [[-0.06, 0.0, -0.37], [0.06, 0.23, 0.06]],
      "attaches": "Tail tube rides tail1..tail4 and starts at tailRoot, matching the torso end radius. The dorsal crest rides the nearest of hips, chest and tail1..tail4 and sits on the torso top at backTop/dorsalStart, which the torso leaves clear.",
      "joints": ["tail1", "tail2", "tail3", "tail4"],
      "floor": true,
      "budget": 140
    }
  ]
}
```

<!-- call: torso -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildTorso({ b, J, P, M }: any) {
  const r = rng(11);
  const R = 0.09;
  const path = [
    [0, 0.09, 0.1],
    [0, 0.092, 0.04],
    [0, 0.09, -0.04],
    [0, 0.088, -0.12],
  ];
  const body = b.sweep(path, (t: number) => [R * (0.9 + 0.2 * Math.sin(Math.PI * Math.min(1, t * 1.1 + 0.1))), R * (0.97 + 0.1 * Math.sin(Math.PI * t))], {
    bone: [J.hips, J.chest],
    color: P.skin,
    caps: "round",
    sectors: [
      [-60, 60, P.skinLight],
      [135, 225, P.belly],
    ],
  });

  // flat belly patch on the floor-facing underside
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.004, 10).scale(1, 1, 1.9), P.belly, {
    bone: J.hips,
    at: [0, 0.003, -0.01],
  });

  // shoulder and hip bulges
  for (const s of [1, -1]) {
    for (const [z, jn] of [[0.07, J.chest], [-0.1, J.hips]] as const) {
      b.part(new THREE.SphereGeometry(0.035, 8, 6), P.skinShade, {
        bone: jn,
        at: [s * 0.075, 0.06, z],
        scale: [0.8, 0.9, 1.1],
      });
    }
  }

  // costal grooves on flanks
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const z = 0.06 - i * 0.045;
      const pts = [
        [s * 0.088, 0.12, z + 0.01],
        [s * 0.094, 0.09, z],
        [s * 0.088, 0.055, z + 0.008],
      ];
      b.sweep(pts, 0.0035, { bone: z > -0.02 ? J.chest : J.hips, color: P.skinShade, caps: "round" });
    }
  }

  // freckles and gold specks on back and flanks
  const surf = b.surface(body);
  const hits = surf.scatter(30, { rng: r, minDist: 0.025, filter: (h: any) => h.n.y > -0.2 });
  hits.forEach((h: any, i: number) => {
    const gold = i % 4 === 0;
    b.stick(new THREE.SphereGeometry(gold ? 0.006 : 0.008, 6, 4).scale(1, 0.45, 1), gold ? P.gold : P.freckle, h, { embed: 0.3 });
  });
}
```

<!-- call: limbs -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildLimbs({ b, J, P, M }: Ctx) {
  const rand = rng(11);
  const R0 = 0.022, R1 = 0.016;
  const FLOOR = 0.018; // limb tube axis height so the underside rests near y=0

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const front of [true, false]) {
      const sh = J[(front ? "shoulder" : "hip") + side];
      const el = J[(front ? "elbow" : "knee") + side];
      const hd = J[(front ? "hand" : "foot") + side];
      const fz = front ? 1 : -1;

      const p0: [number, number, number] = [s * 0.075, 0.05, front ? 0.07 : -0.1];
      const p1: [number, number, number] = [s * 0.15, 0.03, front ? 0.09 : -0.12];
      const p2: [number, number, number] = [s * 0.2, FLOOR, front ? 0.15 : -0.18];

      // upper arm
      b.rod(p0, p1, [R0, 0.019], P.skin, { bone: sh, sides: 8 });
      // forearm
      b.rod(p1, p2, [0.019, R1], P.skin, { bone: el, sides: 8 });
      // joint knobs
      b.part(new THREE.SphereGeometry(0.021, 8, 6), P.skin, { at: p1, bone: el });
      b.part(new THREE.SphereGeometry(0.018, 8, 6), P.skinLight, { at: p2, bone: hd });

      // freckles on upper limb
      for (let i = 0; i < 2; i++) {
        const t = 0.3 + i * 0.35;
        const at: [number, number, number] = [
          p0[0] + (p1[0] - p0[0]) * t,
          p0[1] + (p1[1] - p0[1]) * t + 0.017,
          p0[2] + (p1[2] - p0[2]) * t + (rand() - 0.5) * 0.01,
        ];
        b.part(new THREE.SphereGeometry(0.0045, 5, 4), P.freckle, { at, bone: sh, scale: [1, 0.4, 1] });
      }

      // palm paddle
      const dirOut = new THREE.Vector3(s * 0.5, 0, fz * 0.8).normalize();
      const palmAt: [number, number, number] = [p2[0] + dirOut.x * 0.012, 0.009, p2[2] + dirOut.z * 0.012];
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.014, 10), P.toe, {
        at: palmAt, bone: hd, scale: [1, 1, 0.85],
      });

      // four digits fanned
      const base = Math.atan2(dirOut.x, dirOut.z);
      for (let i = 0; i < 4; i++) {
        const a = base + (i - 1.5) * 0.4;
        const d = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
        const root = new THREE.Vector3(...palmAt).addScaledVector(d, 0.022);
        root.y = 0.008;
        const tip = root.clone().addScaledVector(d, 0.025);
        const num = i + 1;
        const jn = b.joint((front ? "finger" : "toe") + side + num, {
          parent: hd, at: [root.x, root.y, root.z], dir: [d.x, 0, d.z], role: "digit", group: "limbs",
        });
        b.capsule([root.x, root.y, root.z], [tip.x, tip.y, tip.z], 0.008, P.toe, { bone: jn, sides: 6 });
        b.part(new THREE.SphereGeometry(0.0075, 6, 5), P.toeTip, {
          at: [tip.x + d.x * 0.006, tip.y, tip.z + d.z * 0.006], bone: jn,
        });
      }
    }
  }
}
```

<!-- call: gills -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildGills({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const lens = [0.17, 0.16, 0.13];
  const dirs = [
    [0.6, 0.7, -0.35],
    [0.9, 0.25, -0.35],
    [0.85, -0.1, -0.35],
  ];
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      const side = s > 0 ? "L" : "R";
      const jn = `gill${side}${k + 1}`;
      const joint = J[jn];
      const root = M[`gillRoot${side}${k + 1}`];
      const d = new THREE.Vector3(dirs[k][0] * s, dirs[k][1], dirs[k][2]).normalize();
      const len = lens[k];
      const up = new THREE.Vector3(0, 1, 0);
      // side vector perpendicular to stalk, for filaments
      const perp = new THREE.Vector3().crossVectors(d, new THREE.Vector3(0, 0, 1)).normalize();
      if (perp.y < 0) perp.negate();
      const back = new THREE.Vector3(0, 0, -1);
      const p0 = new THREE.Vector3(...root).addScaledVector(d, -0.01);
      const p3 = new THREE.Vector3(...root).addScaledVector(d, len);
      p3.y += 0.02;
      const p1 = p0.clone().lerp(p3, 0.33).addScaledVector(up, 0.012);
      const p2 = p0.clone().lerp(p3, 0.66).addScaledVector(up, 0.025);
      const path = [p0, p1, p2, p3];
      b.sweep(path, [0.012, 0.005], { color: P.gillStalk, bone: joint, caps: "round", sides: 6 });
      const n = 8 + (k === 0 ? 1 : 0);
      for (let i = 0; i < n; i++) {
        const t = 0.12 + (0.84 * i) / (n - 1);
        const base = p0.clone().lerp(p1, 0).add(
          new THREE.Vector3().copy(new THREE.CatmullRomCurve3(path).getPoint(Math.min(t, 1))),
        ).sub(p0);
        const flen = (0.03 + 0.02 * Math.sin(Math.PI * t)) * (0.9 + 0.2 * R());
        for (const f of [1, -1]) {
          const dir = perp.clone().multiplyScalar(f).addScaledVector(d, 0.6).addScaledVector(back, 0.25).normalize();
          const tipP = base.clone().addScaledVector(dir, flen);
          b.spike(base, tipP, null, 0.0065 * (1 - t * 0.3), { color: P.gillFrill, bone: joint, sides: 5 });
          b.part(new THREE.SphereGeometry(0.006, 5, 4), P.gillTip, { at: tipP, bone: joint });
        }
      }
      b.part(new THREE.SphereGeometry(0.01, 6, 5), P.gillTip, { at: p3, bone: joint });
    }
  }
}
```

<!-- call: tail -->

```ts
import * as THREE from "three";
import { catmull, rng } from "agentic-3js-builder";

export function buildTail({ b, J, P, M }: any) {
  const R = rng(11);
  const bones = [J.tail1, J.tail2, J.tail3, J.tail4];
  const bone = (z: number) => (z > -0.2 ? bones[0] : z > -0.28 ? bones[1] : z > -0.34 ? bones[2] : bones[3]);

  // spine centre line z -> y
  const yAt = (z: number) => 0.085 - ((0.12 + z) * -1) * 0 - Math.max(0, -0.12 - z) * 0.08;
  const pts: number[][] = [
    [0, 0.085, -0.1],
    [0, 0.082, -0.2],
    [0, 0.075, -0.29],
    [0, 0.066, -0.36],
  ];
  const path = catmull(pts);
  const radii = (t: number): [number, number] => {
    const w = 0.075 * (1 - t) + 0.012 * t;
    const h = 0.075 * (1 - t) + 0.05 * t * 0.7 + 0.0 * t;
    return [w * (1 - 0.1 * t), Math.max(0.03, h * 0.9)];
  };
  b.sweep(path, radii, {
    bone: bones,
    color: P.skin,
    sectors: [[125, 235, P.belly]],
    sides: 10,
    caps: "round",
  });

  // freckles and gold specks on the tail top
  for (let i = 0; i < 14; i++) {
    const t = 0.05 + R() * 0.8;
    const a = (R() - 0.5) * 100;
    const p = path.at(t);
    const rr = radii(t);
    const ang = (a * Math.PI) / 180;
    const x = Math.sin(ang) * rr[0] * 0.97;
    const y = p.y + Math.cos(ang) * rr[1] * 0.97;
    const gold = i % 4 === 0;
    b.part(new THREE.SphereGeometry(gold ? 0.005 : 0.007, 6, 4), gold ? P.gold : P.freckle, {
      at: [x, y, p.z],
      scale: [1, 0.5, 1],
      bone: bone(p.z),
    });
  }

  // dorsal fin: top edge height grows with distance back
  const zs: number[] = [];
  for (let i = 0; i <= 16; i++) zs.push(0.05 - (i / 16) * 0.43);
  const top = (z: number) => {
    const base = z > -0.12 ? 0.175 : 0.085 + (0.085 > 0 ? 0.0 : 0) + 0.0;
    return base;
  };
  const spineTop = (z: number) => {
    if (z > -0.1) return 0.175 - (0.05 - z) * 0.06;
    const t = Math.min(1, (-0.1 - z) / 0.26);
    return 0.17 - t * 0.04 - 0.0 + (0.085 - 0.085) ;
  };
  const finH = (z: number) => {
    const t = Math.min(1, Math.max(0, (0.05 - z) / 0.41));
    return 0.03 + 0.06 * t;
  };
  // tail body top surface
  const bodyTop = (z: number) => {
    if (z > -0.1) return spineTop(z);
    const t = Math.min(1, (-0.1 - z) / 0.27);
    const r = radii(t)[1];
    return path.at(t * 0.999).y + r * 0.95;
  };
  const outline: [number, number, string?][] = [];
  const fz = (z: number) => z;
  const ups: number[][] = [];
  for (let i = 0; i < zs.length; i++) {
    const z = zs[i];
    const wave = 0.006 * Math.sin(i * 2.4);
    const y = bodyTop(z) - 0.004 + finH(z) + wave;
    ups.push([-(z), y]);
  }
  // outline in (x = -z forward-to-back, y)
  const poly: any[] = [];
  const x0 = -0.05;
  for (const [x, y] of ups) poly.push([x, y]);
  // wrap tip and return as ventral fin
  const tipX = 0.375;
  poly.push([tipX + 0.012, 0.1]);
  poly.push([tipX + 0.005, 0.04]);
  for (let i = 8; i >= 0; i--) {
    const x = 0.22 + (i / 8) * 0.15;
    poly.push([x, 0.0 + 0.012 + 0.012 * Math.sin(i * 2.2)]);
  }
  // body bottom return (hidden inside tail)
  poly.push([0.2, 0.05]);
  poly.push([x0, 0.12]);
  const fin = b.extrude(poly, {
    at: [0, 0, 0],
    x: [0, 0, -1],
    thickness: 0.006,
    color: P.finMain,
    bone: J.tail2,
    smoothing: 0,
  });

  // fin scalloped rim and rays
  for (let i = 1; i < ups.length; i++) {
    const [x, y] = ups[i];
    b.part(new THREE.SphereGeometry(0.008, 6, 4), P.finEdge, {
      at: [0, y + 0.002, -x],
      scale: [0.5, 0.8, 1.4],
      bone: bone(-x),
    });
    if (i % 2 === 0) {
      const base = bodyTop(-x);
      b.rod([0, base + 0.003, -x], [0, y - 0.004, -x - 0.012], 0.0016, P.finRay, { bone: bone(-x) });
    }
  }
  // ventral rays
  for (let i = 0; i < 7; i++) {
    const z = -0.22 - i * 0.022;
    b.rod([0, 0.045, z], [0, 0.014, z - 0.01], 0.0015, P.finRay, { bone: bone(z) });
  }
  // fin freckles
  for (let i = 0; i < 8; i++) {
    const z = -0.05 - R() * 0.3;
    const y = bodyTop(z) + 0.01 + R() * (finH(z) - 0.02);
    b.part(new THREE.SphereGeometry(0.004, 5, 4), P.freckle, { at: [0.0032, y, z], scale: [0.4, 1, 1], bone: bone(z) });
  }
  return fin;
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildHead({ b, J, P, M }: Ctx) {
  const head = J.head;
  const jaw = J.jaw;
  const C = M.headCenter;
  const sph = (r: number, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);

  // skull
  b.part(sph(1, 14, 10), P.skin, { bone: head, at: C, scale: [0.16, 0.12, 0.15] });
  // light top plate
  b.part(sph(1, 12, 8), P.skinLight, { bone: head, at: [C[0], C[1] + 0.035, C[2] + 0.01], scale: [0.14, 0.09, 0.135] });
  // shade underside band
  b.part(sph(1, 12, 6), P.skinShade, { bone: head, at: [C[0], C[1] - 0.075, C[2] + 0.01], scale: [0.14, 0.04, 0.135] });

  // upper jaw / snout
  b.part(sph(1, 12, 8), P.skin, { bone: head, at: [0, 0.105, 0.28], scale: [0.125, 0.06, 0.09] });
  b.part(sph(1, 10, 6), P.skinLight, { bone: head, at: [0, 0.12, 0.28], scale: [0.1, 0.04, 0.08] });

  // lower jaw
  b.part(sph(1, 12, 8), P.skinShade, { bone: jaw, at: [0, 0.062, 0.26], scale: [0.115, 0.04, 0.1] });
  b.part(sph(1, 10, 6), P.belly, { bone: jaw, at: [0, 0.052, 0.27], scale: [0.095, 0.03, 0.085] });
  // tongue
  b.part(sph(1, 8, 5), P.tongue, { bone: jaw, at: [0, 0.075, 0.29], scale: [0.045, 0.012, 0.045] });

  // smile line (upturned at corners)
  const pts: number[][] = [];
  for (let i = 0; i <= 8; i++) {
    const u = (i / 8) * 2 - 1;
    pts.push([u * 0.12, 0.083 + 0.03 * u * u, 0.335 - 0.12 * u * u - 0.0 ]);
  }
  for (let i = 0; i < pts.length - 1; i++) {
    b.rod(pts[i], pts[i + 1], 0.0045, P.mouth, { bone: head });
  }
  for (const s of [1, -1]) {
    b.part(sph(0.007, 6, 4), P.mouth, { bone: head, at: [s * 0.125, 0.113, 0.215] });
    b.part(sph(0.012, 6, 4), P.blush, { bone: head, at: [s * 0.135, 0.108, 0.225], scale: [0.5, 1, 1] });
  }

  // eyes
  for (const s of [1, -1]) {
    const e = [s * 0.1, 0.2, 0.27];
    b.part(sph(0.042, 10, 6), P.eyeRim, { bone: head, at: [e[0], e[1] - 0.005, e[2] - 0.005], scale: [1, 0.85, 1] });
    b.part(sph(0.035, 12, 8), P.eye, { bone: head, at: [e[0] + s * 0.004, e[1] + 0.003, e[2] + 0.007] });
    b.part(sph(0.011, 7, 5), P.eyeShine, { bone: head, at: [e[0] - s * 0.008 + s * 0.004, e[1] + 0.018, e[2] + 0.034] });
    b.part(sph(0.006, 6, 4), P.eyeShine, { bone: head, at: [e[0] + s * 0.016, e[1] - 0.012, e[2] + 0.033] });
    // brow bump
    b.part(sph(1, 8, 5), P.skinLight, { bone: head, at: [s * 0.1, 0.243, 0.275], scale: [0.032, 0.011, 0.025] });
    // nostril
    b.part(sph(0.006, 6, 4), P.nostril, { bone: head, at: [s * 0.03, 0.163, 0.335], scale: [1, 0.6, 1] });
    // blush disc
    const ch = M.cheekL;
    b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.006, 12), P.blush, {
      bone: head,
      at: [s * 0.138, ch[1] + 0.005, ch[2] + 0.005],
      dir: [s * 0.9, 0.1, 0.45],
    });
  }

  // freckles and gold specks on top
  const r = rng(11);
  for (let i = 0; i < 12; i++) {
    const x = (r() - 0.5) * 0.2;
    const z = C[2] - 0.02 + r() * 0.15;
    const ky = Math.sqrt(Math.max(0, 1 - (x / 0.16) ** 2 - ((z - C[2]) / 0.15) ** 2));
    if (ky < 0.35) continue;
    const y = C[1] + 0.12 * ky;
    b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.004, 7), i % 4 === 0 ? P.gold : P.freckle, {
      bone: head,
      at: [x, y - 0.001, z],
      dir: [x / 0.16 ** 2 * 0.3, ky / 0.12, (z - C[2]) / 0.15 ** 2 * 0.3],
    });
  }
}
```