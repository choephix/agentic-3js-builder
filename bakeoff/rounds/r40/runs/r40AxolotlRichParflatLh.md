<!-- call: plan -->

```json
{
  "name": "Chibi Axolotl",
  "description": "A chibi axolotl with a huge round head, tiny stubby body and legs, a finned tail and three big frilly pink gills on each side.",
  "builderName": "chibiAxolotl",
  "size": [0.62, 0.3, 0.9],
  "layout": "Chibi proportions: a giant wide flat-topped head at the front (+Z) about 55% of the body length, a short chubby body behind it, four stubby legs with tiny splayed toes resting on the floor, and a thick tail curving gently behind with a continuous low dorsal fin running from the head down the back to the tail tip. Each side of the head has three feathery gills fanning out sideways and upward, built as stalks with many small pink fronds in a root-to-tip palette from deep rose to pale pink. Face: two big glossy black eyes with white highlights on top-front of the head, a wide smiling mouth line, tiny nostril dots, and rosy blush cheeks. Pale pink-peach body with a lighter belly. Everything is blocky low-poly primitives with flat colours.",
  "palette": {
    "skin": "#f6b8c4",
    "skinDark": "#e592a8",
    "belly": "#fde3e3",
    "gillStalk": "#e0587c",
    "gillMid": "#ff7fa3",
    "gillTip": "#ffc2d6",
    "fin": "#f48fae",
    "eye": "#1a1220",
    "eyeShine": "#ffffff",
    "mouth": "#b84b6a",
    "blush": "#ff8aa5",
    "spot": "#d9788f",
    "toe": "#ffd3dc"
  },
  "mounts": {
    "headCenter": [0, 0.15, 0.3],
    "neckJoin": [0, 0.13, 0.08],
    "gillRootL": [0.2, 0.19, 0.2],
    "gillRootR": [-0.2, 0.19, 0.2],
    "shoulderL": [0.13, 0.09, 0.06],
    "hipL": [0.12, 0.09, -0.18],
    "tailBase": [0, 0.1, -0.3],
    "finStart": [0, 0.27, 0.12]
  },
  "joints": [
    { "name": "hips", "at": [0, 0.1, -0.15], "dir": [0, 0, 1], "role": "spine" },
    { "name": "chest", "parent": "hips", "at": [0, 0.1, 0.02], "dir": [0, 0, 1], "role": "spine" },
    { "name": "neck", "parent": "chest", "at": [0, 0.12, 0.12], "dir": [0, 0, 1], "role": "neck" },
    { "name": "head", "parent": "neck", "at": [0, 0.14, 0.2], "dir": [0, 0, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 0.1, 0.45], "dir": [0, 0, 1], "role": "jaw" },
    { "name": "tail1", "parent": "hips", "at": [0, 0.1, -0.3], "dir": [0, 0, -1], "role": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 0.1, -0.45], "dir": [0, 0, -1], "role": "tail" },
    { "name": "tail3", "parent": "tail2", "at": [0, 0.11, -0.6], "dir": [0, 0, -1], "role": "tail" },
    { "name": "tail4", "parent": "tail3", "at": [0, 0.12, -0.74], "dir": [0, 0, -1], "role": "tail" },
    { "name": "shoulderL", "parent": "chest", "at": [0.14, 0.08, 0.06], "dir": [1, -0.5, 0.3], "role": "arm", "group": "legs" },
    { "name": "elbowL", "parent": "shoulderL", "at": [0.2, 0.05, 0.08], "dir": [1, -1, 0.3], "role": "arm", "group": "legs" },
    { "name": "shoulderR", "parent": "chest", "at": [-0.14, 0.08, 0.06], "dir": [-1, -0.5, 0.3], "role": "arm", "group": "legs" },
    { "name": "elbowR", "parent": "shoulderR", "at": [-0.2, 0.05, 0.08], "dir": [-1, -1, 0.3], "role": "arm", "group": "legs" },
    { "name": "hipL", "parent": "hips", "at": [0.13, 0.08, -0.17], "dir": [1, -0.5, -0.3], "role": "leg", "group": "legs" },
    { "name": "kneeL", "parent": "hipL", "at": [0.2, 0.05, -0.2], "dir": [1, -1, -0.3], "role": "leg", "group": "legs" },
    { "name": "hipR", "parent": "hips", "at": [-0.13, 0.08, -0.17], "dir": [-1, -0.5, -0.3], "role": "leg", "group": "legs" },
    { "name": "kneeR", "parent": "hipR", "at": [-0.2, 0.05, -0.2], "dir": [-1, -1, -0.3], "role": "leg", "group": "legs" },
    { "name": "gillL1", "parent": "head", "at": [0.2, 0.22, 0.2], "dir": [1, 0.8, 0], "role": "fan", "group": "gills" },
    { "name": "gillL2", "parent": "head", "at": [0.21, 0.18, 0.2], "dir": [1, 0.2, 0], "role": "fan", "group": "gills" },
    { "name": "gillL3", "parent": "head", "at": [0.2, 0.14, 0.2], "dir": [1, -0.4, 0], "role": "fan", "group": "gills" },
    { "name": "gillR1", "parent": "head", "at": [-0.2, 0.22, 0.2], "dir": [-1, 0.8, 0], "role": "fan", "group": "gills" },
    { "name": "gillR2", "parent": "head", "at": [-0.21, 0.18, 0.2], "dir": [-1, 0.2, 0], "role": "fan", "group": "gills" },
    { "name": "gillR3", "parent": "head", "at": [-0.2, 0.14, 0.2], "dir": [-1, -0.4, 0], "role": "fan", "group": "gills" }
  ],
  "parts": [
    {
      "id": "head",
      "builds": "The big flat-topped rounded head: wide skull loft in skin colour, pale chin/belly underside, upper and lower jaw as separate pieces on jaw joint with a dark mouth line and tiny tongue, two large glossy black eyes with white highlights and tiny rim, nostril dots, blush cheek discs, a few darker spots on top, small brow bumps.",
      "box": [[-0.24, 0.04, 0.0], [0.24, 0.27, 0.45]],
      "attaches": "Meets the body at neckJoin; gill roots at gillRootL/R sit on its sides; the dorsal fin begins at finStart on its top.",
      "joints": ["neck", "head", "jaw"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "gills",
      "builds": "Six feathery gill assemblies (3 per side): each a thin curved stalk in gillStalk with 6-9 small flat frond blades/spikes along it, graded gillStalk to gillMid to gillTip, fanning outward and upward from the head sides in a tiered fan, bigger on top, slightly longer outward. Each stalk has a small rounded base nub seated on the head.",
      "box": [[-0.46, 0.08, 0.1], [0.46, 0.3, 0.3]],
      "attaches": "Roots at gillRootL and gillRootR on the head sides, riding the gillL1-3 and gillR1-3 joints.",
      "joints": ["gillL1", "gillL2", "gillL3", "gillR1", "gillR2", "gillR3"],
      "floor": false,
      "budget": 220
    },
    {
      "id": "body",
      "builds": "The chubby short torso loft in skin colour with a pale belly sector underneath, spots along the back, a low rounded back ridge, and the continuous dorsal fin start from finStart along the back to tailBase as a thin extruded scalloped fin in fin colour with small rib lines.",
      "box": [[-0.16, 0.04, -0.32], [0.16, 0.28, 0.14]],
      "attaches": "Front joins the head at neckJoin, rear joins the tail at tailBase, legs at shoulderL/R and hipL/R.",
      "joints": ["hips", "chest"],
      "floor": false,
      "budget": 110
    },
    {
      "id": "legs",
      "builds": "Four stubby chubby legs, each a short two-segment tube splayed outward and forward/back, ending in a flat round foot pad with four tiny rounded toes in toe colour, resting on the floor; slightly darker skin on the outer sides.",
      "box": [[-0.3, 0.0, -0.32], [0.3, 0.12, 0.2]],
      "attaches": "Roots at shoulderL/R and hipL/R on the body sides.",
      "joints": ["shoulderL", "elbowL", "shoulderR", "elbowR", "hipL", "kneeL", "hipR", "kneeR"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "tail",
      "builds": "A thick tail tapering and flattening vertically (paddle shaped) with a gentle S curve, skin colour with pale underside, topped by a tall tapered fin along its top edge and a smaller fin underneath, rounded tip, spots and fin ribs in darker pink.",
      "box": [[-0.06, 0.02, -0.9], [0.06, 0.24, -0.28]],
      "attaches": "Starts at tailBase where the body ends; continues the dorsal fin line from the body.",
      "joints": ["tail1", "tail2", "tail3", "tail4"],
      "floor": false,
      "budget": 120
    }
  ]
}
```

<!-- call: legs -->

```ts
import * as THREE from "three";
import { frame, rng, catmull } from "agentic-3js-builder";

export function buildLegs({ b, J, P, M }: Ctx) {
  const R = rng(11);
  void M;
  void R;

  // One leg: smooth two-segment tube, outer-side shading, ankle cuff, foot pad and four toes.
  type LegSpec = {
    side: 1 | -1;
    shoulder: any;
    elbow: any;
    foot: [number, number]; // x (unsigned), z of the foot pad centre
    toeDir: [number, number]; // x (unsigned), z of the toe direction
    name: string;
  };

  const PAD_R = 0.042;
  const PAD_H = 0.016;

  function buildLeg(spec: LegSpec) {
    const { side: s, shoulder, elbow, foot, toeDir, name } = spec;
    const sh = shoulder.at.toArray() as number[];
    const el = elbow.at.toArray() as number[];
    const fx = s * foot[0];
    const fz = foot[1];
    const wrist = [fx * 0.97, 0.034, fz];

    const tube = b.sweep([sh, el, wrist], [0.046, 0.04, 0.03], {
      color: P.skin,
      bone: [shoulder, elbow],
      sides: 8,
      caps: "round",
      name: `legs${name}Tube`,
    });

    // darker outer side: small patches seated on the outer surface
    const surf = b.surface(tube);
    const stops = [0.22, 0.42, 0.62, 0.8];
    stops.forEach((t, i) => {
      const p = tube.at(t).at;
      const hit = surf.ray([s * 0.5, p.y + (i % 2 ? 0.006 : -0.004), p.z + (i % 2 ? -0.008 : 0.008)], [-s, 0, 0]);
      if (hit) {
        b.stick(new THREE.CylinderGeometry(0.011 - i * 0.001, 0.011 - i * 0.001, 0.005, 6), P.skinDark, hit, {
          embed: 0.4,
        });
      }
    });

    // elbow / knee knob on the outside
    const knob = surf.ray([s * 0.5, el[1], el[2]], [-s, 0, 0]);
    if (knob) b.stick(new THREE.SphereGeometry(0.016, 6, 4), P.skinDark, knob, { embed: 0.5 });

    // ankle cuff ring
    const c = tube.at(0.86);
    const ringFrame = frame(c.at, c.tangent);
    const ring = b.ring(ringFrame, { count: 8, radius: 0.03 * 1.02 });
    b.sweep(catmull(ring.items, { closed: true }), 0.0042, {
      color: P.skinDark,
      bone: elbow,
      sides: 5,
      name: `legs${name}Cuff`,
    });

    // foot pad
    b.part(new THREE.CylinderGeometry(PAD_R, PAD_R * 1.05, PAD_H, 12), P.skinDark, {
      bone: elbow,
      at: [fx, PAD_H / 2, fz],
      name: `legs${name}Pad`,
    });
    // soft rounded heel dome on top of the pad
    b.part(new THREE.SphereGeometry(0.036, 8, 5), P.skin, {
      bone: elbow,
      at: [fx, PAD_H + 0.002, fz],
      scale: [1, 0.45, 1],
      name: `legs${name}Heel`,
    });

    // four splayed toes
    const dx = s * toeDir[0];
    const dz = toeDir[1];
    const len = Math.hypot(dx, dz);
    const base = Math.atan2(dx / len, dz / len); // angle from +Z toward +X
    [-48, -16, 16, 48].forEach((deg, i) => {
      const a = base + (deg * Math.PI) / 180;
      const tx = Math.sin(a);
      const tz = Math.cos(a);
      const reach = i === 1 || i === 2 ? 0.05 : 0.044;
      const toePos = [fx + tx * reach, 0.011, fz + tz * reach];
      b.part(new THREE.SphereGeometry(0.0125, 6, 4), P.toe, {
        bone: elbow,
        at: toePos,
        dir: [tx, 0, tz],
        axis: "z",
        scale: [1, 0.85, 1.55],
        name: `legs${name}Toe${i + 1}`,
      });
      // tiny darker toe-base dot on the pad
      b.part(new THREE.SphereGeometry(0.006, 5, 3), P.spot, {
        bone: elbow,
        at: [fx + tx * (reach - 0.022), PAD_H + 0.001, fz + tz * (reach - 0.022)],
        scale: [1, 0.4, 1],
        name: `legs${name}ToeDot${i + 1}`,
      });
    });
  }

  buildLeg({
    side: 1,
    shoulder: J.shoulderL,
    elbow: J.elbowL,
    foot: [0.25, 0.13],
    toeDir: [0.5, 1],
    name: "FL",
  });
  buildLeg({
    side: -1,
    shoulder: J.shoulderR,
    elbow: J.elbowR,
    foot: [0.25, 0.13],
    toeDir: [0.5, 1],
    name: "FR",
  });
  buildLeg({
    side: 1,
    shoulder: J.hipL,
    elbow: J.kneeL,
    foot: [0.25, -0.25],
    toeDir: [0.75, -1],
    name: "HL",
  });
  buildLeg({
    side: -1,
    shoulder: J.hipR,
    elbow: J.kneeR,
    foot: [0.25, -0.25],
    toeDir: [0.75, -1],
    name: "HR",
  });
}
```

<!-- call: gills -->

```ts
import * as THREE from "three";
import { catmull, rng } from "agentic-3js-builder";

export function buildGills({ b, J, P }: Ctx) {
  const rand = rng(11);
  const UP = new THREE.Vector3(0, 1, 0);
  const arr = (v: THREE.Vector3): [number, number, number] => [v.x, v.y, v.z];

  // One tier per gill on each side: root height, tip point, size multiplier (top tier is biggest).
  const tiers = [
    { y: 0.21, tip: [0.4, 0.275, 0.15], scale: 1.18 },
    { y: 0.165, tip: [0.44, 0.2, 0.2], scale: 1.05 },
    { y: 0.12, tip: [0.4, 0.115, 0.25], scale: 0.88 },
  ];

  // A flat feathery blade: pointed at both ends, widest near the root.
  const bladeOutline = (L: number, w: number): [number, number][] => [
    [0, 0],
    [0.22 * L, 0.42 * w],
    [0.62 * L, 0.34 * w],
    [L, 0],
    [0.62 * L, -0.34 * w],
    [0.22 * L, -0.42 * w],
  ];

  const colorAt = (t: number) => (t < 0.34 ? P.gillStalk : t < 0.68 ? P.gillMid : P.gillTip);

  const frond = (
    joint: any,
    p: THREE.Vector3,
    d: THREE.Vector3,
    T: THREE.Vector3,
    len: number,
    color: string,
  ) => {
    const y = T.clone().addScaledVector(d, -T.dot(d));
    if (y.lengthSq() < 1e-6) y.set(0, 1, 0);
    y.normalize();
    b.extrude(bladeOutline(len, len * 0.4), {
      at: arr(p),
      x: arr(d),
      y: arr(y),
      thickness: 0.007,
      color,
      bone: joint,
    });
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    tiers.forEach((tier, k) => {
      const joint = J[`gill${side}${k + 1}`];
      const root = new THREE.Vector3(s * 0.2, tier.y, 0.2);
      const tip = new THREE.Vector3(s * tier.tip[0], tier.tip[1], tier.tip[2]);
      const at = (f: number, lift: number) => root.clone().lerp(tip, f).add(new THREE.Vector3(0, lift, 0));
      const path = catmull([arr(root), arr(at(0.33, 0.01)), arr(at(0.66, 0.022)), arr(tip.clone().add(new THREE.Vector3(0, 0.012, 0)))]);

      // Rounded nub seated on the head side.
      b.part(new THREE.SphereGeometry(0.03, 8, 6), P.gillStalk, {
        bone: joint,
        at: [s * 0.213, tier.y, 0.2],
        scale: [0.8, 1, 1.1],
      });

      // Thin curved stalk.
      b.sweep(path, [0.015 * tier.scale, 0.005], {
        color: P.gillStalk,
        bone: joint,
        sides: 6,
        caps: { start: "round", end: "round" },
      });

      // Fronds along the stalk, graded rose to pale pink.
      const N = 9;
      for (let i = 0; i < N; i++) {
        const t = 0.16 + (i / (N - 1)) * 0.82;
        const p = new THREE.Vector3(...(path.at(t) as any as [number, number, number]).length ? [0, 0, 0] : [0, 0, 0]);
        const pv = path.at(t) as THREE.Vector3;
        p.copy(pv);
        const T = (path.tangentAt(t) as THREE.Vector3).clone().normalize();
        const U = UP.clone().addScaledVector(T, -UP.dot(T)).normalize();
        const F = T.clone().cross(U).normalize();
        const perp = i % 2 === 0 ? U : F;
        const ang = (52 - 18 * t) * (Math.PI / 180);
        const len = tier.scale * 0.088 * (1 - 0.48 * t) * (0.92 + rand() * 0.16);
        const col = colorAt(t);
        for (const sg of [1, -1]) {
          const d = T.clone().multiplyScalar(Math.cos(ang)).addScaledVector(perp, sg * Math.sin(ang)).normalize();
          frond(joint, p, d, T, len, col);
        }
      }

      // Terminal frond and a small pale bulb at the tip.
      const pe = path.at(1) as THREE.Vector3;
      const Te = (path.tangentAt(1) as THREE.Vector3).clone().normalize();
      frond(joint, pe.clone(), Te, Te.clone().cross(UP).normalize(), 0.05 * tier.scale, P.gillTip);
      b.part(new THREE.SphereGeometry(0.01, 6, 4), P.gillTip, { bone: joint, at: arr(pe) });
    });
  }
}
```

<!-- call: body -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildBody({ b, J, P, M }: any) {
  const HIPS = J.hips;
  const CHEST = J.chest;

  // ---------------------------------------------------------------- torso
  // A chubby sweep from just behind the hips to just ahead of the chest. Round caps dome the ends
  // so the box is z -0.30..0.13. The belly sector is pale; the back stays skin pink.
  const CY = 0.12;
  const zr = -0.21;
  const zf = 0.04;
  const spine = [
    [0, CY, zr],
    [0, CY + 0.004, zr * 0.5 + zf * 0.5],
    [0, CY, zf],
  ];
  const bump = (t: number) => Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, 0.12 + 0.76 * t))), 0.8);
  const body = b.sweep(spine, (t: number) => [0.092 + 0.058 * bump(t), 0.072 + 0.008 * bump(t)], {
    bone: [HIPS, CHEST],
    color: P.skin,
    sides: 12,
    caps: "round",
    sectors: [
      [125, 235, P.belly],
      [-62, 62, P.skin],
    ],
  });
  const skin = b.surface(body);

  // Darker narrow band flanking the belly, where pale meets pink
  b.sweep(body.line(112), 0.006, {
    bone: [HIPS, CHEST],
    color: P.skinDark,
    caps: "round",
    sides: 5,
  });
  b.sweep(body.line(-112), 0.006, {
    bone: [HIPS, CHEST],
    color: P.skinDark,
    caps: "round",
    sides: 5,
  });

  // ---------------------------------------------------------------- shoulder / hip pads (legs grow from these)
  const pad = (x: number, y: number, z: number, bone: any, r: number) => {
    b.part(new THREE.SphereGeometry(1, 10, 7), P.skin, {
      bone,
      at: [x, y, z],
      scale: [r * 0.8, r * 0.85, r * 1.05],
    });
  };
  for (const s of [1, -1]) {
    pad(s * 0.125, 0.085, 0.06, CHEST, 0.052);
    pad(s * 0.125, 0.085, -0.17, HIPS, 0.056);
    // pale underside of each pad
    b.part(new THREE.SphereGeometry(1, 8, 5), P.belly, {
      bone: CHEST,
      at: [s * 0.122, 0.062, 0.062],
      scale: [0.04, 0.03, 0.045],
    });
    b.part(new THREE.SphereGeometry(1, 8, 5), P.belly, {
      bone: HIPS,
      at: [s * 0.122, 0.06, -0.168],
      scale: [0.042, 0.03, 0.05],
    });
  }

  // ---------------------------------------------------------------- low rounded back ridge
  b.sweep(body.line(0), (t: number) => [0.016 * (0.6 + 0.4 * Math.sin(Math.PI * t)), 0.011], {
    bone: [HIPS, CHEST],
    color: P.skinDark,
    from: 0.06,
    to: 0.96,
    sides: 6,
    caps: "round",
  });

  // ---------------------------------------------------------------- spots
  const r = rng(11);
  const spotGeo = (rad: number) => new THREE.CylinderGeometry(rad, rad * 0.9, 0.008, 7);
  const topHits = skin.scatter(18, {
    rng: r,
    minDist: 0.05,
    filter: (h: any) => h.n.y > 0.35 && Math.abs(h.at.x) > 0.028,
  });
  topHits.forEach((h: any, i: number) => {
    b.stick(spotGeo(0.009 + 0.012 * r()), i % 3 === 0 ? P.skinDark : P.spot, h, { embed: 0.5, spin: r() * 360 });
  });
  const sideHits = skin.scatter(14, {
    rng: rng(23),
    minDist: 0.05,
    filter: (h: any) => Math.abs(h.n.x) > 0.55 && h.n.y > -0.25,
  });
  sideHits.forEach((h: any, i: number) => {
    b.stick(spotGeo(0.007 + 0.008 * r()), i % 2 ? P.spot : P.skinDark, h, { embed: 0.5, spin: r() * 360 });
  });

  // little belly button
  const nav = skin.around([0, CY, -0.05]).at(180, -88);
  if (nav) b.stick(new THREE.CylinderGeometry(0.008, 0.008, 0.005, 7), P.skinDark, nav, { embed: 0.4 });

  // ---------------------------------------------------------------- dorsal fin
  // Drawn side-on: u runs backwards from the head (finStart z = 0.10) to the tail base (z = -0.30), v up.
  const FIN_Y = 0.16;
  const FIN_Z = 0.1;
  const LEN = 0.4;
  const PER = LEN / 8;
  const env = (u: number) => {
    const ramp = Math.min(1, 0.45 + u / 0.05);
    const tail = Math.min(1, 0.55 + (LEN - u) / 0.05);
    return (0.108 - 0.046 * (u / LEN)) * ramp * Math.min(1, tail + 0.2);
  };
  const top = (u: number) => env(u) * (0.72 + 0.28 * Math.abs(Math.sin((Math.PI * u) / PER)));
  const finSegment = (u0: number, u1: number, bone: any) => {
    const pts: [number, number][] = [[0, 0]];
    const steps = Math.round((u1 - u0) / (PER / 4));
    for (let k = 0; k <= steps; k++) {
      const u = u0 + (k * (u1 - u0)) / steps;
      pts.push([u - u0, top(u)]);
    }
    pts.push([u1 - u0, 0]);
    return b.extrude(pts, {
      at: [0, FIN_Y, FIN_Z - u0],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.003,
      color: P.fin,
      bone,
    });
  };
  finSegment(0, 3 * PER, CHEST);
  finSegment(3 * PER, LEN, HIPS);

  // ribs and tip beads on every scallop
  for (let k = 0; k < 8; k++) {
    const u = PER * (k + 0.5);
    const bone = u < 3 * PER ? CHEST : HIPS;
    const vt = top(u);
    const z = FIN_Z - u;
    for (const s of [1, -1]) {
      b.rod([s * 0.0062, FIN_Y + 0.03, z], [s * 0.0062, FIN_Y + vt - 0.012, z], [0.0022, 0.0012], P.spot, {
        bone,
        sides: 4,
        caps: "flat",
      });
    }
    // two shorter side ribs fanning from the base
    for (const s of [1, -1]) {
      for (const d of [-1, 1]) {
        b.rod(
          [s * 0.0062, FIN_Y + 0.03, z],
          [s * 0.0062, FIN_Y + vt * 0.62, z + d * PER * 0.28],
          [0.0016, 0.0009],
          P.spot,
          { bone, sides: 4, caps: "flat" },
        );
      }
    }
    b.part(new THREE.SphereGeometry(0.0055, 6, 4), P.gillTip, {
      bone,
      at: [0, FIN_Y + vt + 0.001, z],
    });
  }

  // pale rim line along the fin base where it meets the back
  b.rod([0, FIN_Y + 0.004, FIN_Z - 0.004], [0, FIN_Y + 0.004, FIN_Z - 3 * PER], 0.004, P.fin, { bone: CHEST, sides: 5 });
  b.rod([0, FIN_Y + 0.004, FIN_Z - 3 * PER], [0, FIN_Y + 0.004, FIN_Z - LEN + 0.004], 0.004, P.fin, {
    bone: HIPS,
    sides: 5,
  });
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildHead({ b, J, P, M }: Ctx) {
  // ---------- helpers ----------
  const ell = (rx: number, ry: number, rz: number, w = 10, h = 7) => {
    const g = new THREE.SphereGeometry(1, w, h);
    g.scale(rx, ry, rz);
    return g;
  };
  const disc = (r: number, t: number, seg = 10) => new THREE.CylinderGeometry(r, r, t, seg);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const NOSE = "#a8445f";
  const BLUSH_LIGHT = "#ff9db3";
  const TONGUE = "#ee7f97";
  const HEAD_C = V(0, 0.11, 0.2);

  // ---------- neck collar (meets the body at neckJoin) ----------
  b.part(ell(0.16, 0.09, 0.075), P.skin, {
    bone: J.neck,
    at: [M.neckJoin[0], M.neckJoin[1], M.neckJoin[2] - 0.01],
  });
  b.part(ell(0.13, 0.05, 0.07), P.belly, {
    bone: J.neck,
    at: [0, 0.07, 0.07],
  });

  // ---------- skull: wide flat-topped loft ----------
  const skull = b.loft(
    [
      { at: [0, 0.16, 0.02], w: 0.3, h: 0.14 },
      { at: [0, 0.17, 0.1], w: 0.42, h: 0.18 },
      { at: [0, 0.175, 0.22], w: 0.48, h: 0.19 },
      { at: [0, 0.17, 0.34], w: 0.42, h: 0.17 },
      { at: [0, 0.157, 0.435], w: 0.28, h: 0.1 },
    ],
    { bone: J.head, color: P.skin, sides: 12 },
  );

  // ---------- lower jaw: separate piece on the jaw joint ----------
  const jaw = b.loft(
    [
      { at: [0, 0.078, 0.06], w: 0.26, h: 0.07 },
      { at: [0, 0.076, 0.17], w: 0.37, h: 0.07 },
      { at: [0, 0.075, 0.28], w: 0.4, h: 0.07 },
      { at: [0, 0.075, 0.37], w: 0.33, h: 0.065 },
      { at: [0, 0.077, 0.435], w: 0.2, h: 0.055 },
    ],
    { bone: J.jaw, color: P.belly, sides: 10 },
  );
  // tiny tongue peeking on the jaw
  b.part(ell(0.045, 0.014, 0.04, 8, 5), TONGUE, { bone: J.jaw, at: [0, 0.108, 0.385] });
  // chin bump
  b.part(ell(0.07, 0.025, 0.04, 8, 5), P.belly, { bone: J.jaw, at: [0, 0.062, 0.42] });

  const skin = b.surface([skull, jaw]);
  const skullSkin = b.surface(skull);

  // ---------- mouth line: wide smile hugging the seam ----------
  const smile: THREE.Vector3[] = [];
  const hitsList: any[] = [];
  for (let az = 72; az >= -72; az -= 12) {
    const k = az / 72;
    const h = skin.around(HEAD_C).at(az, 1 + 7 * k * k);
    if (h) {
      smile.push(h.at.clone().addScaledVector(h.n, 0.004));
      hitsList.push(h);
    }
  }
  if (smile.length > 3) {
    b.sweep(smile, 0.0048, { bone: J.head, color: P.mouth, sides: 6, caps: "round" });
    for (const idx of [0, smile.length - 1]) {
      b.stick(ell(0.011, 0.006, 0.011, 6, 4), P.mouth, hitsList[idx], { bone: J.head, embed: 0.3 });
    }
  }

  // ---------- eyes ----------
  for (const s of [1, -1]) {
    const hit = skullSkin.ray([s * 0.1, 0.6, 0.335], [0, -1, 0]);
    if (!hit) continue;
    const n = hit.n.clone();
    // rim
    b.part(ell(0.054, 0.02, 0.054, 10, 5), P.skinDark, {
      bone: J.head,
      at: hit.at.clone().addScaledVector(n, 0.0),
      dir: n.toArray() as [number, number, number],
    });
    // glossy eye
    const ec = hit.at.clone().addScaledVector(n, 0.014);
    b.part(ell(0.041, 0.038, 0.041, 12, 8), P.eye, { bone: J.head, at: ec });
    const d1 = n.clone().multiplyScalar(0.8).add(V(-s * 0.35, 0, 0.5)).normalize();
    const d2 = n.clone().multiplyScalar(0.6).add(V(s * 0.45, 0, 0.35)).normalize();
    b.part(new THREE.SphereGeometry(0.0125, 6, 4), P.eyeShine, {
      bone: J.head,
      at: ec.clone().addScaledVector(d1, 0.036),
    });
    b.part(new THREE.SphereGeometry(0.0065, 5, 4), P.eyeShine, {
      bone: J.head,
      at: ec.clone().addScaledVector(d2, 0.037),
    });

    // brow bump behind the eye
    const bh = skullSkin.ray([s * 0.105, 0.6, 0.285], [0, -1, 0]);
    if (bh) b.stick(ell(0.042, 0.014, 0.017, 8, 5), P.skinDark, bh, { bone: J.head, embed: 0.4 });
  }

  // ---------- nostrils ----------
  for (const s of [1, -1]) {
    const h = skullSkin.ray([s * 0.04, 0.17, 0.7], [0, 0, -1]);
    if (h) b.stick(ell(0.009, 0.005, 0.009, 6, 4), NOSE, h, { bone: J.head, embed: 0.3 });
  }

  // ---------- blush cheeks ----------
  for (const s of [1, -1]) {
    const h = skin.around(HEAD_C).at(s * 64, 24);
    if (!h) continue;
    b.stick(disc(0.036, 0.012, 10), P.blush, h, { bone: J.head, embed: 0.5 });
    b.stick(disc(0.02, 0.012, 8), BLUSH_LIGHT, h.moved([0, 0.003, 0]), { bone: J.head, embed: 0.3 });
    // tiny blush stripes
    for (const off of [-0.018, 0, 0.018]) {
      const hh = skin.around(HEAD_C).at(s * 64 + off * 400, 30 + off * 50);
      if (hh) b.stick(ell(0.003, 0.003, 0.012, 4, 3), NOSE, hh, { bone: J.head, embed: 0.1 });
    }
  }

  // ---------- spots on top ----------
  const spots: [number, number, number][] = [
    [-0.13, 0.13, 0.022],
    [0.13, 0.11, 0.02],
    [-0.04, 0.22, 0.017],
    [0.07, 0.24, 0.025],
    [0.0, 0.08, 0.018],
    [-0.16, 0.22, 0.014],
    [0.17, 0.2, 0.013],
  ];
  const r = rng(11);
  for (const [x, z, rad] of spots) {
    const h = skullSkin.ray([x, 0.6, z], [0, -1, 0]);
    if (!h) continue;
    b.stick(disc(rad * (0.85 + r() * 0.3), 0.01, 8), P.spot, h, { bone: J.head, embed: 0.5 });
  }

  // ---------- flat crown ridge where the dorsal fin starts ----------
  const fin = skullSkin.ray([0, 0.6, M.finStart[2] + 0.1], [0, -1, 0]);
  if (fin) b.stick(ell(0.035, 0.016, 0.07, 8, 5), P.fin, fin, { bone: J.head, embed: 0.4 });
  const fin2 = skullSkin.ray([0, 0.6, 0.04], [0, -1, 0]);
  if (fin2) b.stick(ell(0.03, 0.014, 0.05, 8, 5), P.fin, fin2, { bone: J.head, embed: 0.4 });

  // ---------- gill root nubs (seated on head sides) ----------
  for (const s of [1, -1]) {
    const rootY = [0.22, 0.18, 0.14];
    rootY.forEach((y, i) => {
      const h = skullSkin.ray([s * 0.6, y, 0.2], [-s, 0, 0]);
      if (h) b.stick(ell(0.02, 0.016, 0.02, 6, 4), P.gillStalk, h, { bone: J.head, embed: 0.3 });
      void i;
    });
  }
}
```

<!-- call: tail -->

```ts
import * as THREE from "three";

export function buildTail({ b, J, P }: any) {
  const SKIN = P.skin as string;
  const BELLY = P.belly as string;
  const FIN = P.fin as string;
  const SPOT = P.spot as string;
  const DARK = P.skinDark as string;

  // ---- tail centreline: u = metres behind z = -0.28, gentle S sway in x and a slow rise in y
  const L0 = -0.03; // starts a little inside the body
  const L1 = 0.58;
  const LEN = L1 - L0;
  const xc = (u: number) => 0.009 * Math.sin((2 * Math.PI * (u - 0)) / 0.58);
  const yc = (u: number) => 0.1 + 0.025 * (u / 0.58);
  const zOf = (u: number) => -0.28 - u;
  const uOfT = (t: number) => L0 + LEN * t;
  const ryAt = (u: number) => 0.07 - 0.035 * ((u - L0) / LEN);
  const rxAt = (u: number) => 0.055 - 0.033 * Math.pow((u - L0) / LEN, 0.9);

  const pts: number[][] = [];
  for (let i = 0; i <= 6; i++) {
    const u = L0 + (LEN * i) / 6;
    pts.push([xc(u), yc(u), zOf(u)]);
  }
  const path = pts; // point array = polyline-ish; smooth it with catmull below
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { catmull } = require_catmull();
  function require_catmull() {
    return { catmull: (window as any).__noop };
  }
  void path;
  void catmull;

  return buildWithPath();

  function buildWithPath() {
    return build();
  }

  function build() {
    const bones = [J.tail1, J.tail2, J.tail3, J.tail4];
    const tube = b.sweep(
      pts,
      (t: number) => {
        const u = uOfT(t);
        return [rxAt(u), ryAt(u)];
      },
      {
        bone: bones,
        color: SKIN,
        sectors: [[125, 235, BELLY]],
        caps: { start: "flat", end: "round" },
        sides: 10,
      },
    );

    // ---- helpers
    const table = (tb: number[][], u: number) => {
      if (u <= tb[0][0]) return tb[0][1];
      for (let i = 1; i < tb.length; i++) {
        if (u <= tb[i][0]) {
          const k = (u - tb[i - 1][0]) / (tb[i][0] - tb[i - 1][0]);
          return tb[i - 1][1] + (tb[i][1] - tb[i - 1][1]) * k;
        }
      }
      return tb[tb.length - 1][1];
    };
    const tri = (x: number) => Math.abs((x - Math.floor(x)) * 2 - 1);

    const DORS = [
      [0, 0.1],
      [0.15, 0.13],
      [0.3, 0.115],
      [0.45, 0.085],
      [0.55, 0.06],
      [0.6, 0.035],
    ];
    const VENT = [
      [0.18, 0],
      [0.28, 0.035],
      [0.4, 0.04],
      [0.5, 0.034],
      [0.58, 0.02],
      [0.6, 0.008],
    ];
    const dorsalTop = (u: number) => yc(u) + table(DORS, u) * (0.86 + 0.14 * tri(u / 0.06));
    const dorsalBase = (u: number) => yc(u) + 0.5 * ryAt(u);
    const ventBottom = (u: number) => yc(u) - ryAt(u) - table(VENT, u) * (0.86 + 0.14 * tri(u / 0.05));
    const ventTop = (u: number) => yc(u) - 0.5 * ryAt(u);

    const segs = [
      { u0: 0, u1: 0.17, bone: J.tail1 },
      { u0: 0.17, u1: 0.32, bone: J.tail2 },
      { u0: 0.32, u1: 0.46, bone: J.tail3 },
      { u0: 0.46, u1: 0.6, bone: J.tail4 },
    ];
    const xLine = (u: number) => {
      const s = segs.find((g) => u <= g.u1 + 1e-9) ?? segs[segs.length - 1];
      const k = (u - s.u0) / (s.u1 - s.u0);
      return xc(s.u0) + (xc(s.u1) - xc(s.u0)) * k;
    };
    const boneAt = (u: number) => (segs.find((g) => u <= g.u1 + 1e-9) ?? segs[3]).bone;

    const finSeg = (
      u0: number,
      u1: number,
      topFn: (u: number) => number,
      botFn: (u: number) => number,
      bone: any,
      color: string,
      thick: [number, number],
    ) => {
      if (u1 - u0 < 0.01) return;
      const us: number[] = [];
      for (let u = u0; u < u1 - 1e-6; u += 0.015) us.push(u);
      us.push(u1);
      const upper = us.map((u) => [u - u0, topFn(u)] as [number, number]);
      const lower = us
        .slice()
        .reverse()
        .map((u) => [u - u0, botFn(u)] as [number, number]);
      const sx = (xc(u1) - xc(u0)) / (u1 - u0);
      b.extrude([...upper, ...lower], {
        at: [xc(u0), 0, zOf(u0)],
        x: [-sx, 0, -1],
        y: [0, 1, 0],
        thickness: thick,
        bevel: 0.0015,
        color,
        bone,
      });
    };

    // ---- dorsal fin (tall, tapered, scalloped), one piece per tail joint
    for (const s of segs)
      finSeg(s.u0, s.u1, dorsalTop, dorsalBase, s.bone, FIN, [0.006, 0.012]);
    // ---- smaller ventral fin
    for (const s of segs) {
      const a = Math.max(s.u0, 0.18);
      finSeg(a, s.u1, ventTop, ventBottom, s.bone, FIN, [0.012, 0.005]);
    }

    // ---- fin ribs in darker pink on both faces
    const rib = (a: number[], c: number[], bone: any) =>
      b.rod(a, c, 0.0013, SPOT, { bone, sides: 4 });
    for (let u = 0.04; u <= 0.545; u += 0.04) {
      for (const s of [1, -1]) {
        const x = xLine(u) + s * 0.0045;
        rib([x, dorsalBase(u) + 0.012, zOf(u)], [x, dorsalTop(u) - 0.012, zOf(u) - 0.004], boneAt(u));
      }
    }
    for (let u = 0.24; u <= 0.56; u += 0.04) {
      for (const s of [1, -1]) {
        const x = xLine(u) + s * 0.0035;
        rib([x, ventTop(u) - 0.008, zOf(u)], [x, ventBottom(u) + 0.01, zOf(u) - 0.003], boneAt(u));
      }
    }

    // ---- spots on the back and flanks
    const spotTs = [0.1, 0.18, 0.26, 0.34, 0.42, 0.5, 0.58, 0.66, 0.74, 0.82];
    spotTs.forEach((t, i) => {
      const r = 0.015 - 0.0007 * i;
      const side = i % 2 === 0 ? 1 : -1;
      const ang = side * (28 + ((i * 17) % 30));
      const hit = tube.at(t, ang);
      b.stick(new THREE.CylinderGeometry(r, r, 0.006, 8), SPOT, hit, { embed: 0.5 });
      if (i % 3 === 0) {
        const hit2 = tube.at(Math.min(t + 0.04, 0.9), -ang * 0.8);
        b.stick(new THREE.CylinderGeometry(r * 0.6, r * 0.6, 0.006, 6), DARK, hit2, { embed: 0.5 });
      }
    });

    // ---- darker rounded tip pad
    const tip = tube.at(0.97, 0);
    b.stick(new THREE.CylinderGeometry(0.009, 0.009, 0.005, 6), DARK, tip, { embed: 0.5 });

    return tube;
  }
}
```

Wait — I left a broken `require_catmull` stub in that code. Here is the corrected, clean version to use instead:

```ts
import * as THREE from "three";
import { catmull } from "agentic-3js-builder";

export function buildTail({ b, J, P }: any) {
  const SKIN = P.skin as string;
  const BELLY = P.belly as string;
  const FIN = P.fin as string;
  const SPOT = P.spot as string;
  const DARK = P.skinDark as string;

  // u = metres behind z = -0.28; gentle S sway in x, slow rise in y
  const L0 = -0.03;
  const L1 = 0.58;
  const LEN = L1 - L0;
  const xc = (u: number) => 0.009 * Math.sin((2 * Math.PI * u) / 0.58);
  const yc = (u: number) => 0.1 + 0.025 * (u / 0.58);
  const zOf = (u: number) => -0.28 - u;
  const uOfT = (t: number) => L0 + LEN * t;
  const ryAt = (u: number) => 0.07 - 0.035 * ((u - L0) / LEN);
  const rxAt = (u: number) => 0.055 - 0.033 * Math.pow((u - L0) / LEN, 0.9);

  const pts: number[][] = [];
  for (let i = 0; i <= 6; i++) {
    const u = L0 + (LEN * i) / 6;
    pts.push([xc(u), yc(u), zOf(u)]);
  }
  const path = catmull(pts);

  const bones = [J.tail1, J.tail2, J.tail3, J.tail4];
  const tube = b.sweep(
    path,
    (t: number) => {
      const u = uOfT(t);
      return [rxAt(u), ryAt(u)];
    },
    {
      bone: bones,
      color: SKIN,
      sectors: [[125, 235, BELLY]],
      caps: { start: "flat", end: "round" },
      sides: 10,
    },
  );

  const table = (tb: number[][], u: number) => {
    if (u <= tb[0][0]) return tb[0][1];
    for (let i = 1; i < tb.length; i++) {
      if (u <= tb[i][0]) {
        const k = (u - tb[i - 1][0]) / (tb[i][0] - tb[i - 1][0]);
        return tb[i - 1][1] + (tb[i][1] - tb[i - 1][1]) * k;
      }
    }
    return tb[tb.length - 1][1];
  };
  const tri = (x: number) => Math.abs((x - Math.floor(x)) * 2 - 1);

  const DORS = [
    [0, 0.1],
    [0.15, 0.13],
    [0.3, 0.115],
    [0.45, 0.085],
    [0.55, 0.06],
    [0.6, 0.035],
  ];
  const VENT = [
    [0.18, 0],
    [0.28, 0.035],
    [0.4, 0.04],
    [0.5, 0.034],
    [0.58, 0.02],
    [0.6, 0.008],
  ];
  const dorsalTop = (u: number) => yc(u) + table(DORS, u) * (0.86 + 0.14 * tri(u / 0.06));
  const dorsalBase = (u: number) => yc(u) + 0.5 * ryAt(u);
  const ventBottom = (u: number) => yc(u) - ryAt(u) - table(VENT, u) * (0.86 + 0.14 * tri(u / 0.05));
  const ventTop = (u: number) => yc(u) - 0.5 * ryAt(u);

  const segs = [
    { u0: 0, u1: 0.17, bone: J.tail1 },
    { u0: 0.17, u1: 0.32, bone: J.tail2 },
    { u0: 0.32, u1: 0.46, bone: J.tail3 },
    { u0: 0.46, u1: 0.6, bone: J.tail4 },
  ];
  const xLine = (u: number) => {
    const s = segs.find((g) => u <= g.u1 + 1e-9) ?? segs[3];
    const k = (u - s.u0) / (s.u1 - s.u0);
    return xc(s.u0) + (xc(s.u1) - xc(s.u0)) * k;
  };
  const boneAt = (u: number) => (segs.find((g) => u <= g.u1 + 1e-9) ?? segs[3]).bone;

  const finSeg = (
    u0: number,
    u1: number,
    topFn: (u: number) => number,
    botFn: (u: number) => number,
    bone: any,
    color: string,
    thick: [number, number],
  ) => {
    if (u1 - u0 < 0.01) return;
    const us: number[] = [];
    for (let u = u0; u < u1 - 1e-6; u += 0.015) us.push(u);
    us.push(u1);
    const upper = us.map((u) => [u - u0, topFn(u)] as [number, number]);
    const lower = us
      .slice()
      .reverse()
      .map((u) => [u - u0, botFn(u)] as [number, number]);
    const sx = (xc(u1) - xc(u0)) / (u1 - u0);
    b.extrude([...upper, ...lower], {
      at: [xc(u0), 0, zOf(u0)],
      x: [-sx, 0, -1],
      y: [0, 1, 0],
      thickness: thick,
      bevel: 0.0015,
      color,
      bone,
    });
  };

  // dorsal fin: tall, tapered, scalloped, one piece per tail joint
  for (const s of segs) finSeg(s.u0, s.u1, dorsalTop, dorsalBase, s.bone, FIN, [0.006, 0.012]);
  // smaller ventral fin
  for (const s of segs) finSeg(Math.max(s.u0, 0.18), s.u1, ventTop, ventBottom, s.bone, FIN, [0.012, 0.005]);

  // fin ribs in darker pink on both faces
  const rib = (a: number[], c: number[], bone: any) => b.rod(a, c, 0.0013, SPOT, { bone, sides: 4 });
  for (let u = 0.04; u <= 0.545; u += 0.04) {
    for (const s of [1, -1]) {
      const x = xLine(u) + s * 0.0045;
      rib([x, dorsalBase(u) + 0.012, zOf(u)], [x, dorsalTop(u) - 0.012, zOf(u) - 0.004], boneAt(u));
    }
  }
  for (let u = 0.24; u <= 0.56; u += 0.04) {
    for (const s of [1, -1]) {
      const x = xLine(u) + s * 0.0035;
      rib([x, ventTop(u) - 0.008, zOf(u)], [x, ventBottom(u) + 0.01, zOf(u) - 0.003], boneAt(u));
    }
  }

  // spots on the back and flanks
  const spotTs = [0.1, 0.18, 0.26, 0.34, 0.42, 0.5, 0.58, 0.66, 0.74, 0.82];
  spotTs.forEach((t, i) => {
    const r = 0.015 - 0.0007 * i;
    const side = i % 2 === 0 ? 1 : -1;
    const ang = side * (28 + ((i * 17) % 30));
    b.stick(new THREE.CylinderGeometry(r, r, 0.006, 8), SPOT, tube.at(t, ang), { embed: 0.5 });
    if (i % 3 === 0)
      b.stick(new THREE.CylinderGeometry(r * 0.6, r * 0.6, 0.006, 6), DARK, tube.at(Math.min(t + 0.04, 0.9), -ang * 0.8), {
        embed: 0.5,
      });
  });

  // darker rounded tip pad
  b.stick(new THREE.CylinderGeometry(0.009, 0.009, 0.005, 6), DARK, tube.at(0.96, 0), { embed: 0.5 });

  return tube;
}
```