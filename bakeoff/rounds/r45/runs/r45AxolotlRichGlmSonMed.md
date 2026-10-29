<!-- call: plan -->

```json
{
  "name": "Pip the Axolotl",
  "description": "A chibi axolotl with a huge round head, tiny smiling face and three pairs of frilly coral-pink gill frills fanning behind it, a chubby cream-bellied body on stubby legs and a long tail finished with a translucent dorsal fin.",
  "builderName": "axolotlChibi",
  "size": [0.38, 0.30, 0.62],
  "layout": "Front is a giant chibi head: a squashed sphere about a third of the model's length, centred at y 0.16, z 0.15, with two huge round dark eyes with white highlights on its front-sides, a wide smiling mouth line between them, two tiny nostril dots and round blush cheeks. Behind the eyes, from the rear crown and cheeks of the head at the gillSeat mount, three gill stalks per side fan up, out and back like feather plumes, each a tapering coral-pink stalk carrying 4-6 thin frill blades that get paler to the tips; the gill spread sets the model's 0.38 m width. Below and behind, the short chubby torso capsule runs from the neckBase mount at z 0.06 back to the rump mount at z -0.18, cream-bellied below and pale pink above with a few darker freckle spots on its back; its belly clears the floor by 0.02 m, held up by the legs. Four stubby legs (front pair at legFront, hind pair at legHind mounts) drop from the torso: short upper and lower segments, chubby round feet with three tiny toes each, the feet flat on the floor (floor: true). Behind the rump, the tail tapers from z -0.16 to the tip at z -0.33, sweeping down to floor level and curling its last third slightly upward, wearing a translucent pink dorsal fin that stands tallest (about 0.16 m) at the rump and shrinks to the tip, edged in a brighter pink trim line, with a small matching ventral fin. The chibi style reads everywhere: head-to-body ratio about 2:1, every limb a two-segment stub, eyes and gills pushed far larger than realistic, all surfaces flat pale pink with cream undersides and coral-pink accents.",
  "palette": {
    "skin": "#f7c9d6",
    "skinShade": "#e3a8bb",
    "belly": "#fff2e4",
    "gill": "#ff6f9c",
    "gillTip": "#ffb0c8",
    "gillRoot": "#e0517f",
    "ink": "#33202e",
    "eyeWhite": "#ffffff",
    "eyeShine": "#ffe9f2",
    "blush": "#ff8fb0",
    "fin": "#ffc9dd",
    "finEdge": "#ff9dc0",
    "mouth": "#8c3a56",
    "freckle": "#d88aa6"
  },
  "mounts": {
    "neckBase": [0, 0.13, 0.06],
    "gillSeat": [0, 0.17, 0.09],
    "rump": [0, 0.10, -0.18],
    "legFront": [0.075, 0.06, 0.02],
    "legHind": [0.08, 0.06, -0.12]
  },
  "joints": [
    { "name": "body", "at": [0, 0.10, -0.02], "dir": [0, 0, 1], "role": "spine" },
    { "name": "neck", "parent": "body", "at": [0, 0.12, 0.06], "dir": [0, 0.15, 1], "role": "neck" },
    { "name": "head", "parent": "neck", "at": [0, 0.16, 0.15], "dir": [0, 0.25, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 0.10, 0.22], "dir": [0, -0.5, 1], "role": "jaw" },
    { "name": "gillTopL", "parent": "head", "at": [0.075, 0.235, 0.11], "dir": [0.8, 0.85, -0.5], "role": "tentacle" },
    { "name": "gillTopR", "parent": "head", "at": [-0.075, 0.235, 0.11], "dir": [-0.8, 0.85, -0.5], "role": "tentacle" },
    { "name": "gillMidL", "parent": "head", "at": [0.095, 0.175, 0.10], "dir": [1, 0.45, -0.55], "role": "tentacle" },
    { "name": "gillMidR", "parent": "head", "at": [-0.095, 0.175, 0.10], "dir": [-1, 0.45, -0.55], "role": "tentacle" },
    { "name": "gillLowL", "parent": "head", "at": [0.085, 0.115, 0.11], "dir": [0.85, -0.15, -0.55], "role": "tentacle" },
    { "name": "gillLowR", "parent": "head", "at": [-0.085, 0.115, 0.11], "dir": [-0.85, -0.15, -0.55], "role": "tentacle" },
    { "name": "tail1", "parent": "body", "at": [0, 0.10, -0.16], "dir": [0, 0, -1], "role": "tail" },
    { "name": "legFL", "parent": "body", "at": [0.075, 0.06, 0.02], "dir": [0, -1, 0], "role": "leg" },
    { "name": "legFR", "parent": "body", "at": [-0.075, 0.06, 0.02], "dir": [0, -1, 0], "role": "leg" },
    { "name": "legHL", "parent": "body", "at": [0.08, 0.06, -0.12], "dir": [0, -1, 0], "role": "leg" },
    { "name": "legHR", "parent": "body", "at": [-0.08, 0.06, -0.12], "dir": [0, -1, 0], "role": "leg" }
  ],
  "parts": [
    {
      "id": "head",
      "builds": "The chibi hero head: one big squashed sphere (radius about 0.105, wider than tall) centred at y 0.16, z 0.15 on the head joint, in skin pink, plus a small rounded muzzle bump low on the front in belly cream, a chin pad, and a short neck stub reaching back to the neckBase mount in skinShade. The face is built as its own seated parts: two huge round dark eyes (about 0.055 diameter) placed wide and low on the front-sides, each a dark ink disc with an eyeWhite sclera rim below and one large and one small white shine dot; two tiny nostril dots above the muzzle in freckle; a wide smiling mouth as a curved dark mouth line part with small upturned mouth corners in ink; round blush cheek patches below and behind the eyes in blush; and a fine ink seam line where the muzzle meets the head. A thin darker crown cap of skinShade tops the dome between the gill roots. Geometry rides the head and neck joints.",
      "box": [[-0.11, 0.03, 0.02], [0.11, 0.29, 0.28]],
      "attaches": "Muzzle front overhangs nothing; rear cheek surface meets the body part at the neckBase mount and leaves the gillSeat crown zone free for the gills part.",
      "joints": ["neck", "head", "jaw"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "gills",
      "builds": "The signature frilly gills: for each side, three stalks sprouting from the head's rear crown and cheeks at the gillTopL/R, gillMidL/R and gillLowL/R joints, fanning upward, outward and back. Each stalk is a tapering swept tube (radius from 0.016 at the buried root to 0.004 at the tip) curving out and slightly back, wearing a dark gillRoot cuff where it leaves the skin and coral gill along its length. Along each stalk, 4 to 6 frill blades: thin tapered extrude blades (like soft feathers) standing out on both sides of the stalk, alternating lengths, coloured gill at the base blending to gillTip at the edges, with the outermost blade on each stalk the longest so the fan reads as one plume. Each stalk tip ends in a tiny pale gillTip nub. Roots sit 0.01 m sunk into the head so nothing floats. Geometry rides the six gill joints only.",
      "box": [[-0.19, 0.08, -0.02], [0.19, 0.29, 0.16]],
      "attaches": "Stalk roots seat on the head part at the gillSeat mount zone and at the three gill joints; the highest frill tips set the model's 0.29 m top and 0.19 m half-width.",
      "joints": ["head", "gillTopL", "gillTopR", "gillMidL", "gillMidR", "gillLowL", "gillLowR"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "body",
      "builds": "The chubby torso: a smooth capsule from the neckBase mount at z 0.06 back to the rump mount at z -0.18, widest at the chest (0.10 half-width) and tapering gently to the rump, riding the body joint. The upper surface is skin pink, the lower third is a cream belly panel in belly colour that wraps from throat to rump underside, separated by a soft skinShade seam line part running each side. Along the spine, a row of 5 small darker freckle spots in freckle, evenly spaced from shoulder to rump. The rear at the rump mount is closed with a rounded rump cap in skin so the tail part buries into it. A tiny throat crease in skinShade sits under the chin where the head meets the chest. Geometry rides the body and neck joints.",
      "box": [[-0.105, 0.02, -0.18], [0.105, 0.21, 0.10]],
      "attaches": "Front meets the head part at the neckBase mount, rear closes at the rump mount for the tail part, underside leaves hip sockets at the legFront and legHind mounts for the legs part.",
      "joints": ["body", "neck"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "legs",
      "builds": "Four stubby legs solved with limb IK to land the feet flat on the floor: from each hip socket at the legFL, legFR, legHL and legHR joints, a short chubby upper segment (radius 0.032) angling out and down, then an even shorter lower segment (radius 0.026) down to a chubby rounded foot of radius 0.028 resting on y 0. Each foot carries three tiny forward toes, each toe a small capsule with a pale gillTip nail tip, and a small darker freckle toe pad beneath. Front pair reaches slightly forward, hind pair slightly back, all in skin pink with skinShade shading on the lower segments. Geometry rides the four leg joints (the leg part's builder may add knee and foot child joints under each listed leg joint).",
      "box": [[-0.13, 0, -0.16], [0.13, 0.07, 0.06]],
      "attaches": "Upper segments bury into the body part's underside at the legFront and legHind mounts; the six toe tips and foot bottoms rest exactly on y 0.",
      "joints": ["body", "legFL", "legFR", "legHL", "legHR"],
      "floor": true,
      "budget": 130
    },
    {
      "id": "tail",
      "builds": "The tail and fins: a tail chain extended from the tail1 joint (tail1 at the rump mount, tail2 mid-tail at z -0.26, tail3 tip at z -0.33), swept as one tapering tube from radius 0.055 at the rump to 0.006 at the tip in skin pink, dropping to floor level by mid-tail then curling its last third gently upward, with a round gillTip-coloured tail tip nub. Over the tail's top runs a translucent-looking dorsal fin: a thin membrane from the rump (where it stands about 0.16 m above the centreline) shrinking smoothly to the tip, in fin colour with a finEdge trim line swept along its top rim, and 4 short fin ray lines in finEdge seated inside the membrane fanning from the rump. A small matching ventral fin (half the height) runs under the tail's first half in fin. The fin roots sink into the tail tube. Geometry rides the tail1 chain.",
      "box": [[-0.10, 0.0, -0.33], [0.10, 0.27, -0.12]],
      "attaches": "Root buries into the body part's rump cap at the rump mount; the tail underside clears the floor by about 0.01 m except where it sweeps down near mid-tail.",
      "joints": ["body", "tail1"],
      "floor": false,
      "budget": 140
    }
  ]
}
```

<!-- call: legs -->

```ts
import * as THREE from "three";
import { limb } from "agentic-3js-builder";

export function buildLegs({ b, J, P, M }: any) {
  const legs: [string, number, number][] = [
    ["legFL", 1, 0],
    ["legFR", -1, 0],
    ["legHL", 1, 1],
    ["legHR", -1, 1],
  ];
  const FR = 0.028;
  for (const [name, s, hind] of legs) {
    const hipJ = J[name];
    const hx = s * (hind ? 0.08 : 0.075);
    const hz = hind ? -0.12 : 0.02;
    const hy = 0.06;
    const hip: [number, number, number] = [hx, hy, hz];
    const fx = hx + s * 0.035;
    const fz = hz + (hind ? -0.012 : 0.014);
    const foot: [number, number, number] = [fx, FR, fz];
    const pts = limb(hip, foot, [0.04, 0.03], [[s * 0.4, 0, hind ? -1 : 1]]);
    const knee = pts[1];
    const ankle = pts[2];
    b.capsule(hip, knee, 0.032, P.skin, { bone: hipJ });
    b.capsule(knee, ankle, [0.026, 0.024], P.skinShade, { bone: hipJ });
    // knee bead
    b.part(new THREE.SphereGeometry(0.03, 8, 6), P.skin, { bone: hipJ, at: knee });
    // foot: squashed sphere resting on floor
    const fc: [number, number, number] = [fx, FR * 0.9, fz];
    b.part(new THREE.SphereGeometry(FR, 10, 8), P.skin, {
      bone: hipJ,
      at: [fc[0], 0.0252, fc[2]],
      scale: [1.15, 0.9, 1.25],
    });
    // toe pad beneath
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.004, 8), P.freckle, {
      bone: hipJ,
      at: [fx, 0.002, fz + 0.004],
    });
    // three toes
    for (let i = -1; i <= 1; i++) {
      const tx = fx + s * i * 0.017 * -1 + 0;
      const ty = 0.0085;
      const tz0 = fz + 0.018;
      const tz1 = fz + 0.046 - Math.abs(i) * 0.005;
      b.capsule([tx, ty, tz0], [tx, ty, tz1], 0.0085, P.skin, { bone: hipJ });
      b.part(new THREE.SphereGeometry(0.0062, 6, 5), P.gillTip, {
        bone: hipJ,
        at: [tx, ty, tz1 + 0.006],
      });
    }
  }
}
```

<!-- call: gills -->

```ts
import * as THREE from "three";
import { frame, rng, offset, bezier } from "agentic-3js-builder";

export function buildGills({ b, J, P, M }: Ctx) {
  const rand = rng(11);
  const sides = [
    { n: "Top", s: 1, out: [0.8, 0.85, -0.5] },
    { n: "Mid", s: 1, out: [1, 0.45, -0.55] },
    { n: "Low", s: 1, out: [0.85, -0.15, -0.55] },
  ];
  const lens = { Top: 0.105, Mid: 0.12, Low: 0.1 } as Record<string, number>;
  for (const sd of [1, -1]) {
    for (const g of sides) {
      const name = "gill" + g.n + (sd > 0 ? "L" : "R");
      const j = J[name];
      const len = lens[g.n];
      const dir = new THREE.Vector3(sd * g.out[0], g.out[1], g.out[2]).normalize();
      const root = new THREE.Vector3(...(j.at as any)).addScaledVector(dir, -0.01);
      // curve: lifts up slightly and sweeps back
      const mid = root.clone().addScaledVector(dir, len * 0.55).add(new THREE.Vector3(0, 0.012, 0));
      const tip = root.clone().addScaledVector(dir, len).add(new THREE.Vector3(0, 0.025, -0.012));
      const path = bezier(root, mid, tip);
      b.sweep(path, [0.016, 0.004], {
        bone: j,
        color: P.gill,
        caps: { start: "flat", end: "round" },
        sides: 6,
      });
      // root cuff
      b.sphereLike
        ? null
        : b.part(new THREE.CylinderGeometry(0.019, 0.017, 0.012, 8), P.gillRoot, {
            bone: j,
            at: path.at(0.1),
            dir: path.tangentAt(0.1),
          });
      // tip nub
      b.part(new THREE.SphereGeometry(0.006, 6, 4), P.gillTip, { bone: j, at: path.at(1) });
      // frill blades
      const count = 4 + (g.n === "Mid" ? 2 : 1);
      for (let i = 0; i < count; i++) {
        const t = 0.18 + (0.8 * i) / (count - 1 || 1);
        const p = path.at(Math.min(t, 0.97));
        const tan = path.tangentAt(Math.min(t, 0.97));
        const last = i === count - 1;
        const L = (last ? 0.05 : i % 2 ? 0.032 : 0.04) * (1 - t * 0.3) + 0.012;
        const W = L * 0.42;
        const outline: [number, number, "sharp"?][] = [
          [0, -W * 0.5],
          [L * 0.55, -W * 0.8],
          [L, 0, "sharp"],
          [L * 0.55, W * 0.8],
          [0, W * 0.5],
        ] as any;
        // blade plane: contains stalk side; thickness across sideways direction
        const side = new THREE.Vector3(0, 1, 0).cross(tan).normalize();
        const up = new THREE.Vector3().crossVectors(tan, side).normalize();
        for (const k of [1, -1]) {
          const x = side.clone().multiplyScalar(k).add(up.clone().multiplyScalar(0.15)).normalize();
          b.extrude(outline as any, {
            at: p,
            x: [x.x, x.y, x.z],
            y: [tan.x, tan.y, tan.z],
            thickness: 0.003,
            smoothing: 1,
            bone: j,
            color: i % 2 ? P.gill : t > 0.6 ? P.gillTip : P.gill,
          });
          // pale edge tip
          const e = p.clone().addScaledVector(x, L * 0.95);
          b.part(new THREE.SphereGeometry(0.0045, 5, 4), P.gillTip, { bone: j, at: e });
        }
      }
    }
  }
}
```

<!-- call: body -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildBody({ b, J, P, M }: Ctx) {
  const r = rng(11);
  const zF = M.neckBase[2]; // 0.06
  const zR = M.rump[2]; // -0.18
  const cy = 0.115; // axis height

  // Main torso: smooth tube, widest at the chest
  const path = [
    [0, cy, zR - 0.01],
    [0, cy, -0.1],
    [0, cy, -0.02],
    [0, cy + 0.005, zF - 0.01],
  ];
  const radii = (t: number): [number, number] => {
    const w = 0.07 + 0.03 * Math.sin(Math.min(1, t * 1.15) * Math.PI * 0.5);
    return [w, w * 0.88];
  };
  const torso = b.sweep(path, radii, {
    bone: J.body,
    color: P.skin,
    sectors: [[125, 235, P.belly]],
    caps: "round",
    sides: 14,
  });

  // Rump cap closing the rear
  b.part(new THREE.SphereGeometry(0.066, 12, 8), P.skin, {
    bone: J.body,
    at: [0, cy, zR + 0.005],
    scale: [1, 0.88, 1],
  });
  // Cream rump underside
  b.part(new THREE.SphereGeometry(0.05, 10, 6), P.belly, {
    bone: J.body,
    at: [0, cy - 0.032, zR + 0.015],
    scale: [0.9, 0.7, 1],
  });

  // Seam lines each side between skin and belly
  for (const s of [1, -1]) {
    const pts = [-0.15, -0.09, -0.03, 0.02, 0.05].map((z) => {
      const t = (z - (zR - 0.01)) / (zF - 0.01 - (zR - 0.01));
      const w = 0.07 + 0.03 * Math.sin(Math.min(1, t * 1.15) * Math.PI * 0.5);
      const a = (125 * Math.PI) / 180;
      return [s * w * Math.sin(a) * 1.0, cy - w * 0.88 * Math.cos(a) * -1 * 0 - w * 0.88 * 0.57 * 1.0, z] as number[];
    });
    const seamPts = pts.map((p) => [p[0] * 1.01, p[1], p[2]]);
    b.sweep(seamPts, 0.0035, { bone: J.body, color: P.skinShade, caps: "round", sides: 5 });
  }

  // Freckle spots along spine
  const hit = b.surface(torso);
  for (let i = 0; i < 5; i++) {
    const z = 0.04 - i * 0.047;
    const off = (r() - 0.5) * 0.012;
    const h = hit.ray([off, 0.3, z], [0, -1, 0]);
    if (h) {
      b.stick(new THREE.CylinderGeometry(0.0075 + r() * 0.003, 0.0075, 0.004, 7), P.freckle, h, { embed: 0.4 });
    }
  }
  // Tiny extra freckles flanking
  for (const s of [1, -1])
    for (let i = 0; i < 2; i++) {
      const h = hit.ray([s * 0.05, 0.3, -0.01 - i * 0.08], [0, -1, 0]);
      if (h) b.stick(new THREE.CylinderGeometry(0.005, 0.005, 0.003, 6), P.freckle, h, { embed: 0.4 });
    }

  // Shoulder bulges (chubby chest)
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 8, 6), P.skin, {
      bone: J.body,
      at: [s * 0.075, cy - 0.01, 0.02],
      scale: [0.8, 0.9, 1.1],
    });
  }

  // Throat crease where head meets chest (neck joint)
  const crease = [
    [-0.045, 0.085, 0.085],
    [0, 0.077, 0.095],
    [0.045, 0.085, 0.085],
  ];
  b.sweep(crease, 0.004, { bone: J.neck, color: P.skinShade, caps: "round", sides: 5 });
  // Belly chest cream bib at throat
  b.part(new THREE.SphereGeometry(0.05, 10, 6), P.belly, {
    bone: J.neck,
    at: [0, 0.095, 0.055],
    scale: [0.95, 0.5, 0.8],
  });
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildHead({ b, J, P, M }: Ctx) {
  const head = J.head;
  const neck = J.neck;
  const jaw = J.jaw;
  const HC: [number, number, number] = [0, 0.16, 0.15];
  const R = 0.105;
  const sph = (w = 12, h = 9) => new THREE.SphereGeometry(1, w, h);

  // Main skull: squashed sphere
  const skull = b.part(sph(18, 14), P.skin, {
    bone: head,
    at: HC,
    scale: [R * 1.05, R * 0.93, R * 1.0],
    name: "skull",
  });
  const skin = b.surface(skull);

  // Crown cap (darker dome on top, between gill roots)
  b.part(sph(12, 8), P.skinShade, {
    bone: head,
    at: [0, 0.16 + R * 0.93 - 0.012, 0.15 - 0.005],
    scale: [0.05, 0.016, 0.05],
    name: "crown",
  });

  // Neck stub back to neckBase
  b.capsule([0, 0.145, 0.1], [M.neckBase[0], M.neckBase[1], M.neckBase[2] - 0.005], 0.06, P.skinShade, {
    bone: neck,
    name: "neckStub",
  });

  // Muzzle bump
  b.part(sph(12, 9), P.belly, {
    bone: head,
    at: [0, 0.115, 0.238],
    scale: [0.055, 0.035, 0.04],
    name: "muzzle",
  });
  // Chin pad
  b.part(sph(10, 8), P.belly, {
    bone: jaw,
    at: [0, 0.088, 0.215],
    scale: [0.04, 0.018, 0.03],
    name: "chin",
  });
  // Throat crease-ish under chin
  b.part(sph(8, 6), P.skinShade, {
    bone: head,
    at: [0, 0.07, 0.15],
    scale: [0.05, 0.012, 0.04],
    name: "throatShade",
  });

  // Muzzle seam line (ink arc)
  b.sweep(
    [
      [-0.05, 0.135, 0.225],
      [-0.025, 0.14, 0.248],
      [0, 0.141, 0.252],
      [0.025, 0.14, 0.248],
      [0.05, 0.135, 0.225],
    ],
    0.0022,
    { color: P.ink, bone: head, caps: "round", name: "seam" },
  );

  // Mouth: smile curve
  const mouthPts: number[][] = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    const x = (t - 0.5) * 0.12;
    const y = 0.098 + 0.014 * Math.pow((t - 0.5) * 2, 2);
    const z = 0.236 - 0.032 * Math.pow((t - 0.5) * 2, 2) + 0.004;
    mouthPts.push([x, y, z]);
  }
  b.sweep(mouthPts, 0.0028, { color: P.mouth, bone: head, caps: "round", name: "mouth" });
  for (const s of [1, -1]) {
    const e = mouthPts[s > 0 ? 8 : 0];
    b.part(sph(6, 5), P.ink, {
      bone: head,
      at: [e[0] + s * 0.003, e[1] + 0.006, e[2] - 0.002],
      scale: [0.004, 0.0045, 0.004],
      name: "mouthCorner",
    });
  }

  // Nostrils
  for (const s of [1, -1]) {
    b.part(sph(6, 4), P.freckle, {
      bone: head,
      at: [s * 0.018, 0.133, 0.262],
      scale: [0.0065, 0.005, 0.004],
      name: "nostril",
    });
  }

  // Eyes, blush
  for (const s of [1, -1]) {
    const dir = new THREE.Vector3(s * 0.62, 0.12, 0.78).normalize();
    const hit = skin.ray([s * 0.0, 0.16 + 0.005, 0.15], dir.toArray() as [number, number, number]);
    const base = hit ? hit.at.clone() : new THREE.Vector3(s * 0.07, 0.17, 0.215);
    const n = hit ? hit.n.clone() : dir.clone();

    // sclera rim (slightly larger, offset down)
    const sc = base.clone().addScaledVector(n, 0.001).add(new THREE.Vector3(0, -0.004, 0));
    b.part(new THREE.CylinderGeometry(0.0305, 0.0305, 0.006, 16), P.eyeWhite, {
      bone: head,
      at: sc,
      dir: n.toArray() as [number, number, number],
      name: "sclera",
    });
    // ink disc
    const ic = base.clone().addScaledVector(n, 0.0035);
    b.part(new THREE.CylinderGeometry(0.0275, 0.0275, 0.006, 16), P.ink, {
      bone: head,
      at: ic,
      dir: n.toArray() as [number, number, number],
      name: "eye",
    });
    // shines
    const up = new THREE.Vector3(0, 1, 0);
    const side = new THREE.Vector3().crossVectors(up, n).normalize();
    const up2 = new THREE.Vector3().crossVectors(n, side).normalize();
    const big = base.clone().addScaledVector(n, 0.0075).addScaledVector(side, -s * 0.0 + 0.009 * -1).addScaledVector(up2, 0.009);
    b.part(sph(8, 6), P.eyeWhite, {
      bone: head,
      at: big,
      scale: [0.0085, 0.0085, 0.004],
      dir: n.toArray() as [number, number, number],
      axis: "z",
      name: "shineBig",
    });
    const small = base.clone().addScaledVector(n, 0.0075).addScaledVector(side, 0.01).addScaledVector(up2, -0.011);
    b.part(sph(6, 5), P.eyeShine, {
      bone: head,
      at: small,
      scale: [0.0042, 0.0042, 0.003],
      dir: n.toArray() as [number, number, number],
      axis: "z",
      name: "shineSmall",
    });

    // blush cheek: below and behind eye
    const bd = new THREE.Vector3(s * 0.85, -0.3, 0.4).normalize();
    const bh = skin.ray([0, 0.16, 0.15], bd.toArray() as [number, number, number]);
    if (bh) {
      b.stick(new THREE.CylinderGeometry(0.02, 0.02, 0.006, 14), P.blush, bh, { embed: 0.5, name: "blush" });
    }
  }
}
```

<!-- call: tail -->

```ts
import * as THREE from "three";
import { catmull, polyline } from "agentic-3js-builder";

export function buildTail({ b, J, P }: any) {
  const spine = catmull([
    [0, 0.1, -0.15],
    [0, 0.075, -0.2],
    [0, 0.045, -0.255],
    [0, 0.05, -0.3],
    [0, 0.075, -0.322],
  ]);
  const chain = b.chain("tailSeg", spine, {
    parent: J.tail1,
    names: ["tailSeg1", "tailSeg2", "tailSeg3"],
    role: "tail",
  });
  const tube = b.sweep(chain, [0.055, 0.045, 0.03, 0.016, 0.007], {
    color: P.skin,
    sectors: [[125, 235, P.belly, 0, 0.7]],
  });
  const last = chain.joints[chain.joints.length - 1];

  // tip nub
  b.part(new THREE.SphereGeometry(0.01, 8, 6), P.gillTip, { at: tube.at(1).at, bone: last });

  const up = (t: number, h: number, ang = 0, sign = 1): number[] => {
    const p = tube.at(t, ang).at;
    return [p.x, p.y + sign * h, p.z];
  };
  const surf = (t: number, ang = 0): number[] => {
    const p = tube.at(t, ang).at;
    return [p.x, p.y, p.z];
  };

  // dorsal fin
  const N = 14;
  const hTop = (t: number) => 0.105 * Math.pow(1 - t, 1.2) + 0.004;
  const lowA: number[][] = [];
  const topB: number[][] = [];
  for (let i = 0; i <= N; i++) {
    const t = 0.02 + (0.96 * i) / N;
    const s = tube.at(t, 0).at;
    lowA.push([s.x, s.y - 0.004, s.z]);
    topB.push(up(t, hTop(t)));
  }
  b.membrane(lowA, topB, { color: P.fin, thickness: 0.004, rows: 3, bone: chain });
  b.sweep(polyline(topB), 0.003, { color: P.finEdge, bone: chain, caps: "round" });

  // fin rays
  const rays = [0.1, 0.22, 0.34, 0.48];
  rays.forEach((t, i) => {
    const t0 = Math.min(t + 0.07, 0.95);
    const a = surf(t0);
    const top = up(t, hTop(t) * 0.82);
    a[1] += 0.002;
    b.rod(a, top, 0.0022, P.finEdge, { bone: chain, name: `tailRay${i}` });
  });

  // ventral fin
  const M = 8;
  const hv = (t: number) => 0.03 * Math.max(0, 1 - t / 0.55) + 0.002;
  const vA: number[][] = [];
  const vB: number[][] = [];
  for (let i = 0; i <= M; i++) {
    const t = 0.05 + (0.5 * i) / M;
    const s = tube.at(t, 180).at;
    vA.push([s.x, s.y + 0.004, s.z]);
    vB.push(up(t, hv(t), 180, -1));
  }
  b.membrane(vA, vB, { color: P.fin, thickness: 0.004, rows: 2, bone: chain });
  b.sweep(polyline(vB), 0.002, { color: P.finEdge, bone: chain, caps: "round" });
}
```