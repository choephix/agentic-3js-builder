<!-- call: plan -->

```json
{
  "name": "Elderwood Treant",
  "description": "An ancient Warcraft-style treant: a towering bark-skinned walking tree guardian with a mossy crown, glowing amber eyes, root feet and gnarled branch arms.",
  "builderName": "ancientTreant",
  "size": [3.6, 4.6, 2.4],
  "layout": "Upright, stocky humanoid tree facing +Z, about 4.6 m tall. Wide heavy shoulders, long gnarled arms with 3 twig fingers each, hanging slightly out from the body in a T-pose-like rest. The trunk torso is a tapered faceted loft with vertical bark ridges and a pale heartwood knot at the belly. The face sits on the upper trunk front: deep-set glowing amber eyes under heavy mossy brow ridges, a broken-branch nose, and a split jaw with a lower jaw that can open and a beard of hanging moss and roots. The crown is a big canopy of overlapping leaf-clump spheres and blades in a dark-to-light green gradient, with a few antler-like branches. Two thick legs end in wide root feet with toe roots splaying forward and back, and the feet sink 2% into the floor. Style: chunky, bold Warcraft shapes. Warm brown bark with darker crevices, moss on upward faces, glowing amber and runes in small parts, and mushrooms on shoulders.",
  "palette": {
    "barkDark": "#2e1f14",
    "bark": "#5a3d27",
    "barkLight": "#7d5836",
    "heartwood": "#c9955a",
    "moss": "#4f7a2c",
    "mossDark": "#2f5220",
    "leaf": "#3f8a2e",
    "leafLight": "#8cc63f",
    "leafDeep": "#1f4a1f",
    "amber": "#ffb327",
    "rune": "#7dffb0",
    "mushroom": "#c8442e",
    "mushroomSpot": "#f4e8c8",
    "twig": "#6b4a2c",
    "root": "#46301e"
  },
  "mounts": {
    "hips": [0, 1.9, 0],
    "chest": [0, 2.8, 0],
    "neck": [0, 3.55, 0.12],
    "headCentre": [0, 3.85, 0.3],
    "jawHinge": [0, 3.62, 0.38],
    "shoulderL": [0.85, 3.3, 0],
    "shoulderR": [-0.85, 3.3, 0],
    "handL": [1.65, 1.85, 0.35],
    "handR": [-1.65, 1.85, 0.35],
    "hipL": [0.45, 1.85, 0],
    "hipR": [-0.45, 1.85, 0],
    "footL": [0.55, 0.12, 0.15],
    "footR": [-0.55, 0.12, 0.15],
    "crownBase": [0, 4.15, -0.05]
  },
  "joints": [
    { "name": "hips", "at": [0, 1.9, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "chest", "parent": "hips", "at": [0, 2.8, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "neck", "parent": "chest", "at": [0, 3.55, 0.12], "dir": [0, 1, 0.2], "role": "neck" },
    { "name": "head", "parent": "neck", "at": [0, 3.85, 0.3], "dir": [0, 0, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 3.62, 0.38], "dir": [0, 0, 1], "role": "jaw" },
    { "name": "upperArmL", "parent": "chest", "at": [0.85, 3.3, 0], "dir": [1, -0.4, 0], "role": "arm", "group": "arms" },
    { "name": "foreArmL", "parent": "upperArmL", "at": [1.6, 2.7, 0.1], "dir": [0.5, -0.8, 0.2], "role": "arm", "group": "arms" },
    { "name": "upperArmR", "parent": "chest", "at": [-0.85, 3.3, 0], "dir": [-1, -0.4, 0], "role": "arm", "group": "arms" },
    { "name": "foreArmR", "parent": "upperArmR", "at": [-1.6, 2.7, 0.1], "dir": [-0.5, -0.8, 0.2], "role": "arm", "group": "arms" },
    { "name": "hipL", "parent": "hips", "at": [0.45, 1.85, 0], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "kneeL", "parent": "hipL", "at": [0.5, 1.0, 0.1], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "hipR", "parent": "hips", "at": [-0.45, 1.85, 0], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "kneeR", "parent": "hipR", "at": [-0.5, 1.0, 0.1], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "crown", "parent": "head", "at": [0, 4.15, -0.05], "dir": [0, 1, 0], "role": "hinge", "group": "crown" }
  ],
  "parts": [
    {
      "id": "trunkTorso",
      "builds": "Torso and pelvis: faceted tapered loft of bark with vertical ridge strips in bark/barkDark/barkLight, big shoulder masses, a heartwood belly knot with concentric rings, glowing rune sigils (rune colour) on the chest, moss patches on upward faces of the shoulders, red-capped mushrooms with spots on the shoulders, and a root-braid belt around the hips.",
      "box": [[-1.1, 1.8, -0.8], [1.1, 3.6, 0.8]],
      "attaches": "Hips and legs below at hips mount, neck and head above at neck mount, arms at shoulderL/shoulderR.",
      "joints": ["hips", "chest"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "headFace",
      "builds": "Head, face and neck: a big angular bark skull, heavy mossy brow ridges, deep-set glowing amber eyes with dark sockets, branch-stub nose, upper jaw with crooked wooden teeth, a separate lower jaw on the jaw joint with teeth, a beard of hanging moss and root tendrils, side bark ears and knots, and thick neck roots into the chest.",
      "box": [[-0.7, 3.4, -0.4], [0.7, 4.2, 0.95]],
      "attaches": "Neck at the neck mount, crown at crownBase, jaw hinge at jawHinge.",
      "joints": ["neck", "head", "jaw"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "crownCanopy",
      "builds": "Crown: antler-like branches spreading from the skull, large canopy of overlapping faceted leaf clump spheres and leaf blades in leafDeep/leaf/leafLight, a few glowing amber flower buds, hanging vines, and moss tufts. Wider than the head, up to the top of the model.",
      "box": [[-1.3, 4.0, -1.0], [1.3, 4.6, 1.0]],
      "attaches": "Sits on the head at the crownBase mount.",
      "joints": ["crown"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "arms",
      "builds": "Both gnarled branch arms: thick tapering sweeps with knobby bark joints, moss on top, side twig offshoots with leaves, wrist root-binding, and hands of three long twig fingers plus a thumb, each finger a chain of segments with pointed tips. Arms hang out and slightly forward, fingers spread.",
      "box": [[-1.8, 1.5, -0.4], [1.8, 3.5, 0.8]],
      "attaches": "Shoulders at shoulderL/shoulderR on the torso; hands end at handL/handR.",
      "joints": ["upperArmL", "foreArmL", "upperArmR", "foreArmR"],
      "floor": false,
      "budget": 180
    },
    {
      "id": "legsRoots",
      "builds": "Both thick tree-trunk legs: tapered bark lofts with ridges, knee knots, moss at the knees, mud and dark soil at the ankles, and wide root feet with 5 splayed toe roots each, gripping into the floor, with small mushrooms and grass tufts on the feet.",
      "box": [[-1.1, 0, -0.7], [1.1, 1.9, 0.9]],
      "attaches": "Hips at hipL/hipR on the pelvis, feet at footL/footR on the floor.",
      "joints": ["hipL", "kneeL", "hipR", "kneeR"],
      "floor": true,
      "budget": 180
    }
  ]
}
```

<!-- call: arms -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildArms({ b, J, P, M }: any) {
  const R = rng(11);
  const sides = [
    { s: 1, up: J.upperArmL, fore: J.foreArmL, n: "L" },
    { s: -1, up: J.upperArmR, fore: J.foreArmR, n: "R" },
  ];
  for (const { s, up, fore, n } of sides) {
    const sh: [number, number, number] = [s * 0.85, 3.3, 0];
    const el: [number, number, number] = [s * 1.6, 2.7, 0.1];
    const wr: [number, number, number] = [s * 1.65, 1.95, 0.35];
    // upper arm and forearm
    b.rod(sh, el, [0.2, 0.16], P.bark, { bone: up, sides: 8 });
    b.rod(el, wr, [0.15, 0.1], P.bark, { bone: fore, sides: 8 });
    // shoulder and elbow knots
    b.part(new THREE.IcosahedronGeometry(0.27, 0), P.barkLight, { bone: up, at: sh, flat: true });
    b.part(new THREE.IcosahedronGeometry(0.2, 0), P.barkDark, { bone: fore, at: el, flat: true });
    // moss on top of the upper arm and forearm
    for (let i = 0; i < 4; i++) {
      const t = 0.15 + i * 0.22;
      const p = [sh[0] + (el[0] - sh[0]) * t, sh[1] + (el[1] - sh[1]) * t + 0.17 - i * 0.015, 0.02];
      b.part(new THREE.SphereGeometry(0.09 + R() * 0.04, 6, 4), i % 2 ? P.moss : P.mossDark, { bone: up, at: p });
    }
    for (let i = 0; i < 2; i++) {
      const t = 0.3 + i * 0.35;
      b.part(new THREE.SphereGeometry(0.07, 6, 4), P.moss, {
        bone: fore,
        at: [el[0] + (wr[0] - el[0]) * t, el[1] + (wr[1] - el[1]) * t + 0.12, 0.12],
      });
    }
    // bark ridges
    for (const [a, c, bone, r] of [[sh, el, up, 0.17], [el, wr, fore, 0.11]] as any) {
      b.rod(
        [a[0], a[1] + r, a[2] + 0.04],
        [c[0], c[1] + r * 0.9, c[2] + 0.04],
        0.025,
        P.barkDark,
        { bone, sides: 4 },
      );
    }
    // twig offshoots with leaves
    for (const [t, dz] of [[0.45, -1], [0.7, 1]] as any) {
      const base: [number, number, number] = [sh[0] + (el[0] - sh[0]) * t, sh[1] + (el[1] - sh[1]) * t, 0];
      const tip: [number, number, number] = [base[0] + s * 0.1, base[1] + 0.3, dz * 0.4];
      b.rod(base, tip, [0.035, 0.012], P.twig, { bone: up, sides: 5 });
      for (const k of [0, 1]) {
        b.part(new THREE.IcosahedronGeometry(0.09, 0), k ? P.leafLight : P.leaf, {
          bone: up,
          at: [tip[0] + k * 0.05, tip[1] + 0.04, tip[2] + dz * 0.04],
          flat: true,
        });
      }
    }
    // wrist root binding
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.TorusGeometry(0.11 - i * 0.004, 0.02, 4, 8), P.root, {
        bone: fore,
        at: [wr[0] - s * 0.02 * i, wr[1] + 0.12 - i * 0.06, wr[2]],
        rotation: [90, 0, 0],
      });
    }
    // palm
    b.part(new THREE.IcosahedronGeometry(0.14, 0), P.bark, { bone: fore, at: [wr[0], wr[1] - 0.06, wr[2]], flat: true });
    // fingers: 3 long plus thumb
    const fingers = [
      { dx: -0.1, dz: 0.1, l: 0.5 },
      { dx: 0, dz: 0.02, l: 0.58 },
      { dx: 0.1, dz: -0.06, l: 0.5 },
      { dx: -0.14, dz: 0.18, l: 0.32, thumb: true },
    ];
    for (const f of fingers as any[]) {
      let p: [number, number, number] = [wr[0] + s * f.dx, wr[1] - 0.12, wr[2] + f.dz];
      const segs = f.thumb ? 2 : 3;
      let r = 0.045;
      for (let i = 0; i < segs; i++) {
        const len = f.l / segs;
        const q: [number, number, number] = [
          p[0] + s * f.dx * 0.5 + (f.thumb ? s * 0.04 : 0),
          p[1] - len * 0.95,
          p[2] + (f.thumb ? 0.09 : 0.04 * (i + 1)),
        ];
        const last = i === segs - 1;
        b.rod(p, q, [r, last ? 0.004 : r * 0.78], i % 2 ? P.twig : P.bark, { bone: fore, sides: 5, caps: last ? "point" : "round" });
        if (!last) b.part(new THREE.IcosahedronGeometry(r * 0.95, 0), P.barkDark, { bone: fore, at: q, flat: true });
        p = q;
        r *= 0.78;
      }
    }
  }
}
```

<!-- call: crownCanopy -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCrownCanopy({ b, J, P, M }: any) {
  const bone = J.crown;
  const r = rng(11);
  const base = M.crownBase as number[];
  const greens = [P.leafDeep, P.leaf, P.leafLight, P.moss, P.mossDark];

  // antler-like branches spreading from the skull
  const branch = (pts: number[][], rad: number) => {
    const [a, c] = [pts[0], pts[pts.length - 1]];
    b.sweep(pts, [rad, rad * 0.3], { bone, color: P.bark, sides: 6, caps: "point" });
    // moss on top of each branch
    b.rod([a[0], a[1] + rad * 0.7, a[2]], [pts[1][0], pts[1][1] + rad * 0.6, pts[1][2]], rad * 0.5, P.moss, { bone });
    return c;
  };
  const tips: number[][] = [];
  for (const s of [1, -1]) {
    const y = base[1];
    tips.push(branch([[s * 0.25, y - 0.05, -0.05], [s * 0.55, y + 0.2, -0.1], [s * 0.9, y + 0.35, 0.05], [s * 1.15, y + 0.6, 0.1]], 0.1));
    tips.push(branch([[s * 0.5, y + 0.2, -0.1], [s * 0.7, y + 0.45, -0.3], [s * 0.85, y + 0.75, -0.5]], 0.06));
    tips.push(branch([[s * 0.9, y + 0.35, 0.05], [s * 0.95, y + 0.3, 0.4], [s * 0.85, y + 0.4, 0.75]], 0.05));
    tips.push(branch([[s * 0.2, y, -0.2], [s * 0.4, y + 0.3, -0.5], [s * 0.6, y + 0.35, -0.85]], 0.07));
  }
  tips.push(branch([[0, base[1] - 0.05, -0.1], [0, base[1] + 0.3, -0.15], [0, base[1] + 0.35, -0.3]], 0.1));

  // canopy of leaf clump spheres
  const clumps: [number, number, number, number][] = [
    [0, 4.4, -0.1, 0.5], [0.5, 4.3, 0, 0.42], [-0.5, 4.3, 0, 0.42], [0.95, 4.35, 0.1, 0.38], [-0.95, 4.35, 0.1, 0.38],
    [0.3, 4.35, -0.55, 0.4], [-0.3, 4.35, -0.55, 0.4], [0, 4.3, 0.45, 0.36], [0.6, 4.25, 0.5, 0.3], [-0.6, 4.25, 0.5, 0.3],
    [1.1, 4.3, -0.45, 0.3], [-1.1, 4.3, -0.45, 0.3], [0, 4.5, -0.5, 0.3], [0.85, 4.5, -0.1, 0.28], [-0.85, 4.5, -0.1, 0.28],
  ];
  clumps.forEach(([x, y, z, rad], i) => {
    const col = i % 3 === 0 ? P.leafDeep : i % 3 === 1 ? P.leaf : P.leafLight;
    b.part(new THREE.IcosahedronGeometry(rad, 1), col, { bone, at: [x, y, z], flat: true });
    // lighter cap on top
    b.part(new THREE.IcosahedronGeometry(rad * 0.6, 0), P.leafLight, { bone, at: [x, y + rad * 0.55, z], flat: true });
  });

  // leaf blades poking out
  for (let i = 0; i < 46; i++) {
    const a = r() * Math.PI * 2;
    const rr = 0.3 + r() * 0.85;
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr * 0.8;
    const y = 4.3 + r() * 0.25;
    const dir = [Math.cos(a) * 0.6, 0.6 + r() * 0.4, Math.sin(a) * 0.6];
    b.spike([x, y, z], dir, 0.22 + r() * 0.15, 0.05, { bone, color: greens[Math.floor(r() * 3)] });
  }

  // glowing amber flower buds
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    const x = Math.cos(a) * 0.8, z = Math.sin(a) * 0.65, y = 4.5 + (i % 2) * 0.05;
    b.part(new THREE.CylinderGeometry(0.01, 0.015, 0.1, 5), P.moss, { bone, at: [x, y - 0.05, z] });
    glow(b.part(new THREE.IcosahedronGeometry(0.07, 0), P.amber, { bone, at: [x, y + 0.04, z], flat: true }), 1.5);
  }

  // hanging vines
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const x = Math.cos(a) * 1.0, z = Math.sin(a) * 0.75;
    const len = 0.3 + r() * 0.3;
    b.rod([x, 4.25, z], [x * 1.04, 4.25 - len, z * 1.04], [0.02, 0.008], P.mossDark, { bone });
    b.part(new THREE.IcosahedronGeometry(0.035, 0), P.leafLight, { bone, at: [x * 1.04, 4.25 - len, z * 1.04], flat: true });
  }

  // moss tufts near the skull
  for (let i = 0; i < 8; i++) {
    const a = r() * Math.PI * 2;
    const x = Math.cos(a) * 0.45, z = Math.sin(a) * 0.4;
    b.spike([x, 4.1, z], [0, 1, 0], 0.15, 0.06, { bone, color: i % 2 ? P.moss : P.mossDark });
  }
}
```

<!-- call: legsRoots -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildLegsRoots({ b, J, P }: any) {
  const R = rng(11);
  const MUD = "#2a1a10";
  const GRASS = "#6aa83a";
  for (const s of [1, -1]) {
    const hip = J[s > 0 ? "hipL" : "hipR"];
    const knee = J[s > 0 ? "kneeL" : "kneeR"];
    const x = s * 0.5;
    // thigh and shin
    b.sweep([[s * 0.45, 1.85, 0], [x, 1.45, 0.05], [x, 1.0, 0.1]], [0.4, 0.34], {
      bone: hip, color: P.bark, section: { ngon: 7 }, caps: "round",
    });
    b.sweep([[x, 1.0, 0.1], [x, 0.55, 0.12], [s * 0.55, 0.28, 0.15]], [0.34, 0.3], {
      bone: knee, color: P.bark, section: { ngon: 7 }, caps: "flat",
    });
    // vertical ridges
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const cx = x + Math.cos(a) * 0.36, cz = 0.08 + Math.sin(a) * 0.36;
      b.rod([cx, 1.7, cz], [cx, 1.2, cz], 0.045, P[i % 2 ? "barkDark" : "barkLight"], { bone: hip, sides: 5 });
      b.rod([x + Math.cos(a) * 0.32, 0.85, 0.12 + Math.sin(a) * 0.32], [x + Math.cos(a) * 0.3, 0.4, 0.14 + Math.sin(a) * 0.3], 0.04, P[i % 2 ? "barkLight" : "barkDark"], { bone: knee, sides: 5 });
    }
    // knee knot
    b.part(new THREE.IcosahedronGeometry(0.28, 0), P.barkLight, { bone: knee, at: [x, 1.0, 0.4], flat: true });
    b.part(new THREE.IcosahedronGeometry(0.18, 0), P.root, { bone: knee, at: [x + s * 0.2, 1.05, 0.34], flat: true });
    // moss on knee
    b.part(new THREE.SphereGeometry(0.3, 7, 4), P.moss, { bone: knee, at: [x, 1.2, 0.18], scale: [1.1, 0.4, 1], flat: true });
    b.part(new THREE.SphereGeometry(0.16, 6, 4), P.mossDark, { bone: knee, at: [x - s * 0.15, 1.28, 0.3], scale: [1, 0.5, 1], flat: true });
    // ankle mud
    b.part(new THREE.CylinderGeometry(0.34, 0.4, 0.2, 8), MUD, { bone: knee, at: [s * 0.55, 0.25, 0.15], flat: true });
    // foot base
    b.part(new THREE.CylinderGeometry(0.42, 0.55, 0.2, 8), P.root, { bone: knee, at: [s * 0.55, 0.1, 0.15], flat: true });
    // 5 toe roots
    for (let t = 0; t < 5; t++) {
      const ang = -Math.PI * 0.45 + t * (Math.PI * 0.9 / 4);
      const fx = s * 0.55, fz = 0.15;
      const sp = Math.sin(ang), co = Math.cos(ang);
      const len = t === 2 ? 0.7 : 0.55 + R() * 0.1;
      const back = t === 0 || t === 4;
      const dz = back ? -co * 0.5 : co * len;
      const dx = sp * len;
      b.sweep([[fx, 0.2, fz], [fx + dx * 0.55, 0.1, fz + dz * 0.55], [fx + dx, 0.03, fz + dz]], [0.12, 0.04], {
        bone: knee, color: P.root, section: { ngon: 5 }, caps: "round",
      });
      b.spike([fx + dx * 0.95, 0.05, fz + dz * 0.95], [dx, -0.1, dz], 0.12, 0.04, { bone: knee, color: P.barkDark });
    }
    // mushrooms
    for (const [mx, mz] of [[0.3, 0.45], [0.75, 0.05]]) {
      const px = s * mx, h = 0.1 + R() * 0.05;
      b.part(new THREE.CylinderGeometry(0.02, 0.03, h, 5), P.mushroomSpot, { bone: knee, at: [px, 0.2 + h / 2, mz] });
      b.part(new THREE.SphereGeometry(0.06, 6, 4, 0, 6.3, 0, 1.6), P.mushroom, { bone: knee, at: [px, 0.2 + h, mz], flat: true });
      b.part(new THREE.SphereGeometry(0.012, 4, 3), P.mushroomSpot, { bone: knee, at: [px + 0.02, 0.2 + h + 0.05, mz + 0.02] });
    }
    // grass tufts
    for (let g = 0; g < 4; g++) {
      const gx = s * (0.35 + R() * 0.4), gz = -0.1 + R() * 0.4;
      b.spike([gx, 0.18, gz], [R() * 0.4 - 0.2, 1, R() * 0.4 - 0.2], 0.18, 0.015, { bone: knee, color: GRASS });
    }
  }
}
```

<!-- call: trunkTorso -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildTrunkTorso({ b, J, P, M }: any) {
  const R = rng(11);
  const hips = J.hips, chest = J.chest;
  const bone = (y: number) => (y < 2.8 ? hips : chest);

  // main trunk loft: pelvis -> waist -> chest -> shoulders
  const st = [
    { at: [0, 1.85, 0], w: 1.3, h: 0.95 },
    { at: [0, 2.3, 0], w: 1.45, h: 1.05 },
    { at: [0, 2.8, 0.02], w: 1.55, h: 1.15 },
    { at: [0, 3.25, 0.0], w: 1.95, h: 1.2 },
    { at: [0, 3.55, -0.02], w: 1.4, h: 0.95 },
  ];
  b.loft(st, { bone: [hips, chest], color: P.bark, section: { ngon: 8 }, sides: 8 });

  // bark ridges
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2 + R() * 0.1;
    const y0 = 1.95 + R() * 0.3, y1 = 3.2 + R() * 0.3;
    const rx = 0.64 + 0.05 * R(), rz = 0.46;
    const x = Math.sin(a) * rx * 1.12, z = Math.cos(a) * rz * 1.12;
    const col = i % 3 === 0 ? P.barkDark : i % 3 === 1 ? P.barkLight : P.bark;
    b.rod([x, y0, z], [x * 1.08, y1, z * 1.08], [0.05, 0.03], col, { bone: chest, sides: 5 });
  }

  // shoulder masses
  for (const s of [1, -1]) {
    b.part(new THREE.IcosahedronGeometry(0.5, 1), P.bark, { bone: chest, at: [s * 0.88, 3.3, 0], scale: [1.1, 0.9, 1.0], flat: true });
    b.part(new THREE.IcosahedronGeometry(0.38, 1), P.moss, { bone: chest, at: [s * 0.88, 3.58, -0.02], scale: [1.2, 0.5, 1.1], flat: true });
    b.part(new THREE.IcosahedronGeometry(0.2, 0), P.mossDark, { bone: chest, at: [s * 0.7, 3.62, -0.2], scale: [1, 0.5, 1], flat: true });
    // mushrooms
    const mx = s * 1.0, mz = 0.12;
    b.part(new THREE.CylinderGeometry(0.04, 0.055, 0.2, 6), P.mushroomSpot, { bone: chest, at: [mx, 3.7, mz] });
    b.part(new THREE.SphereGeometry(0.12, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.mushroom, { bone: chest, at: [mx, 3.78, mz], scale: [1, 0.7, 1] });
    for (let k = 0; k < 4; k++) {
      const a = k * 1.6;
      b.part(new THREE.SphereGeometry(0.02, 5, 3), P.mushroomSpot, { bone: chest, at: [mx + Math.cos(a) * 0.065, 3.84, mz + Math.sin(a) * 0.065] });
    }
    b.part(new THREE.CylinderGeometry(0.025, 0.035, 0.12, 6), P.mushroomSpot, { bone: chest, at: [mx - s * 0.2, 3.67, mz - 0.2] });
    b.part(new THREE.SphereGeometry(0.07, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.mushroom, { bone: chest, at: [mx - s * 0.2, 3.72, mz - 0.2] });
  }

  // heartwood belly knot with rings
  const kz = 0.6;
  const rings = [0.34, 0.27, 0.2, 0.13, 0.07];
  rings.forEach((r, i) => {
    b.part(new THREE.CylinderGeometry(r, r, 0.04, 14), i % 2 ? P.bark : P.heartwood, {
      bone: hips, at: [0, 2.35, kz + i * 0.012], dir: [0, 0, 1],
    });
  });
  b.part(new THREE.TorusGeometry(0.38, 0.05, 5, 14), P.barkDark, { bone: hips, at: [0, 2.35, kz], dir: [0, 0, 1], axis: "z" });

  // rune sigils on chest
  const rune = (x: number, y: number, rot: number) => {
    const z = 0.62;
    const mk = (w: number, h: number, dx: number, dy: number, r: number) => {
      const m = b.part(new THREE.BoxGeometry(w, h, 0.03), P.rune, {
        bone: chest, at: [x + dx, y + dy, z], rotation: [0, 0, r],
      });
      if (m.mesh && m.mesh.material) {
        const mat = (m.mesh.material as THREE.MeshStandardMaterial).clone();
        mat.emissive = new THREE.Color(P.rune);
        mat.emissiveIntensity = 1.2;
        m.mesh.material = mat;
      }
    };
    mk(0.05, 0.28, 0, 0, rot);
    mk(0.2, 0.045, 0.0, 0.05, rot + 20);
    mk(0.14, 0.04, 0.0, -0.07, rot - 30);
  };
  rune(-0.35, 3.0, 0);
  rune(0.35, 3.0, 10);
  rune(0, 3.15, 0);
  rune(-0.35, 2.75, 5);
  rune(0.35, 2.75, -5);

  // root-braid belt
  for (let i = 0; i < 2; i++) {
    const pts: number[][] = [];
    for (let k = 0; k <= 24; k++) {
      const a = (k / 24) * Math.PI * 2;
      const w = Math.sin(k * 1.3 + i * Math.PI) * 0.04;
      pts.push([Math.sin(a) * 0.76 * (1 + 0.04 * i), 2.08 + w, Math.cos(a) * 0.54 * (1 + 0.04 * i) ]);
    }
    b.sweep(pts.slice(0, 24).concat([pts[0]]), 0.045, { bone: hips, color: i ? P.root : P.barkLight, sides: 5, caps: "none" });
  }
  b.part(new THREE.IcosahedronGeometry(0.1, 0), P.heartwood, { bone: hips, at: [0, 2.08, 0.58], flat: true });

  // back knots
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.IcosahedronGeometry(0.14 + R() * 0.08, 0), P.barkDark, {
      bone: bone(2.5 + i * 0.3), at: [(R() - 0.5) * 0.9, 2.4 + i * 0.3, -0.55], flat: true,
    });
  }
}
```

<!-- call: headFace -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildHeadFace({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const head = J.head, jaw = J.jaw, neck = J.neck;
  const hc = M.headCentre;
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cone = (r: number, h: number, s = 6) => new THREE.ConeGeometry(r, h, s);
  const put = (g: THREE.BufferGeometry, c: string, bone: any, at: number[], o: any = {}) =>
    b.part(g, c, { bone, at, flat: true, ...o });

  // neck roots
  const nc = M.neck;
  put(new THREE.CylinderGeometry(0.38, 0.5, 0.5, 8), P.bark, neck, [0, nc[1] - 0.1, nc[2]]);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    b.rod([Math.sin(a) * 0.3, nc[1] + 0.15, nc[2] + Math.cos(a) * 0.25], [Math.sin(a) * 0.5, nc[1] - 0.3, nc[2] + Math.cos(a) * 0.4], [0.05, 0.08], { bone: neck, color: i % 2 ? P.root : P.barkLight, sides: 5 });
  }

  // skull
  put(box(1.1, 0.75, 0.95), P.bark, head, [0, hc[1] + 0.05, hc[2] + 0.1]);
  put(box(0.9, 0.3, 0.8), P.barkLight, head, [0, hc[1] + 0.35, hc[2] + 0.05]);
  put(box(1.2, 0.2, 0.7), P.barkDark, head, [0, hc[1] - 0.2, hc[2] + 0.05]);
  // cheek wedges
  for (const s of [1, -1]) {
    put(box(0.3, 0.4, 0.6), P.bark, head, [s * 0.5, hc[1] - 0.1, hc[2] + 0.25], { rotation: [0, 0, s * 12] });
    // ears
    put(cone(0.14, 0.4, 5), P.barkLight, head, [s * 0.66, hc[1] + 0.1, hc[2] + 0.05], { dir: [s, 0.5, -0.2] });
    put(new THREE.IcosahedronGeometry(0.1, 0), P.barkDark, head, [s * 0.58, hc[1] - 0.15, hc[2] + 0.2]);
    // brows
    put(box(0.42, 0.16, 0.3), P.barkDark, head, [s * 0.22, hc[1] + 0.2, hc[2] + 0.6], { rotation: [0, 0, -s * 14] });
    put(box(0.44, 0.07, 0.3), P.moss, head, [s * 0.22, hc[1] + 0.3, hc[2] + 0.6], { rotation: [0, 0, -s * 14] });
    put(box(0.3, 0.05, 0.2), P.leafLight, head, [s * 0.25, hc[1] + 0.34, hc[2] + 0.58]);
    // eyes
    put(new THREE.SphereGeometry(0.12, 7, 5), "#120a05", head, [s * 0.22, hc[1] + 0.02, hc[2] + 0.58]);
    const e = put(new THREE.SphereGeometry(0.08, 7, 5), P.amber, head, [s * 0.22, hc[1] + 0.02, hc[2] + 0.64]);
    e.mesh.material = (e.mesh.material as THREE.MeshStandardMaterial).clone();
    const m = e.mesh.material as THREE.MeshStandardMaterial;
    m.emissive.set(P.amber); m.emissiveIntensity = 1.5;
    put(box(0.025, 0.07, 0.02), "#120a05", head, [s * 0.22, hc[1] + 0.02, hc[2] + 0.715]);
    // knots on skull
    put(new THREE.CylinderGeometry(0.07, 0.09, 0.05, 6), P.heartwood, head, [s * 0.56, hc[1] + 0.3, hc[2] + 0.3], { dir: [s, 0.2, 0.3] });
  }
  // nose stub
  put(box(0.2, 0.2, 0.3), P.barkLight, head, [0, hc[1] - 0.08, hc[2] + 0.72], { rotation: [-15, 0, 0] });
  put(cone(0.08, 0.2, 5), P.bark, head, [0, hc[1] - 0.12, hc[2] + 0.9], { dir: [0, -0.2, 1] });
  put(new THREE.IcosahedronGeometry(0.05, 0), P.moss, head, [0.06, hc[1] + 0.03, hc[2] + 0.78]);

  // upper jaw + teeth
  const jy = M.jawHinge[1], jz = M.jawHinge[2];
  put(box(0.95, 0.14, 0.7), P.barkDark, head, [0, jy + 0.1, jz + 0.35]);
  for (let i = 0; i < 7; i++) {
    const x = -0.36 + i * 0.12;
    put(cone(0.035, 0.1 + R() * 0.07, 4), P.heartwood, head, [x, jy + 0.0, jz + 0.68], { dir: [R() * 0.2 - 0.1, -1, 0] });
  }
  // lower jaw
  put(box(0.85, 0.16, 0.66), P.bark, jaw, [0, jy - 0.05, jz + 0.32]);
  put(box(0.5, 0.14, 0.2), P.barkLight, jaw, [0, jy - 0.1, jz + 0.7]);
  for (let i = 0; i < 6; i++) {
    const x = -0.3 + i * 0.12;
    put(cone(0.035, 0.09 + R() * 0.08, 4), P.heartwood, jaw, [x, jy + 0.08, jz + 0.62], { dir: [R() * 0.2 - 0.1, 1, 0] });
  }
  // beard
  for (let i = 0; i < 12; i++) {
    const x = -0.4 + (i / 11) * 0.8;
    const len = 0.35 + R() * 0.3 - Math.abs(x) * 0.3;
    const z = jz + 0.55 - Math.abs(x) * 0.3;
    b.rod([x, jy - 0.1, z], [x * 1.1 + (R() - 0.5) * 0.08, jy - 0.1 - len, z + 0.04], [0.045, 0.01], { bone: jaw, color: i % 3 ? P.mossDark : P.root, sides: 5 });
  }
  for (let i = 0; i < 5; i++) {
    const x = -0.28 + i * 0.14;
    put(new THREE.IcosahedronGeometry(0.08, 0), P.moss, jaw, [x, jy - 0.1, jz + 0.58]);
  }
  // runes on forehead
  for (let i = -1; i <= 1; i++) {
    const r = put(box(0.04, 0.12, 0.02), P.rune, head, [i * 0.12, hc[1] + 0.4, hc[2] + 0.56 + 0.0], { rotation: [-20, 0, i * 25] });
    const mm = (r.mesh.material = (r.mesh.material as THREE.MeshStandardMaterial).clone()) as THREE.MeshStandardMaterial;
    mm.emissive.set(P.rune); mm.emissiveIntensity = 1.2;
  }
  // crown mount & moss on top
  put(box(0.8, 0.08, 0.7), P.moss, head, [0, hc[1] + 0.52, hc[2] - 0.02]);
  for (let i = 0; i < 4; i++) put(cone(0.08, 0.2, 5), P.barkLight, head, [-0.3 + i * 0.2, hc[1] + 0.58, hc[2] - 0.1], { dir: [R() * 0.4 - 0.2, 1, -0.2] });
}
```

<!-- call: fit-arms -->

The fingers hang below the box floor (y = 1.5) and the x extent overshoots slightly, so I'm shortening the fingers and raising the wrist.

<<<<<<< SEARCH
    const wr: [number, number, number] = [s * 1.65, 1.95, 0.35];
=======
    const wr: [number, number, number] = [s * 1.62, 2.15, 0.35];
>>>>>>> REPLACE

<<<<<<< SEARCH
      { dx: -0.1, dz: 0.1, l: 0.5 },
      { dx: 0, dz: 0.02, l: 0.58 },
      { dx: 0.1, dz: -0.06, l: 0.5 },
      { dx: -0.14, dz: 0.18, l: 0.32, thumb: true },
=======
      { dx: -0.1, dz: 0.1, l: 0.4 },
      { dx: 0, dz: 0.02, l: 0.46 },
      { dx: 0.1, dz: -0.06, l: 0.4 },
      { dx: -0.14, dz: 0.18, l: 0.28, thumb: true },
>>>>>>> REPLACE

<!-- call: fit-legsRoots -->

The thigh sweep starts at y = 1.85 with a round cap of radius 0.4, so it reaches y = 2.25. Starting the thigh lower at y = 1.5 with a smaller top radius keeps the cap under 1.9, and the thigh then ends at the knee as before.

<<<<<<< SEARCH
    b.sweep([[s * 0.45, 1.85, 0], [x, 1.45, 0.05], [x, 1.0, 0.1]], [0.4, 0.34], {
      bone: hip, color: P.bark, section: { ngon: 7 }, caps: "round",
    });
=======
    b.sweep([[s * 0.46, 1.5, 0.02], [x, 1.25, 0.06], [x, 1.0, 0.1]], [0.38, 0.34], {
      bone: hip, color: P.bark, section: { ngon: 7 }, caps: "round",
    });
>>>>>>> REPLACE

<!-- call: fit-trunkTorso -->

The loft's round caps pushed it past the box, and the shoulder masses, moss and mushrooms sat too high and too wide. These edits flatten the loft caps and shrink and lower the shoulder group so everything stays inside the box.

<<<<<<< SEARCH
  b.loft(st, { bone: [hips, chest], color: P.bark, section: { ngon: 8 }, sides: 8 });
=======
  b.loft(st, { bone: [hips, chest], color: P.bark, section: { ngon: 8 }, sides: 8, caps: "flat" });
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.part(new THREE.IcosahedronGeometry(0.5, 1), P.bark, { bone: chest, at: [s * 0.88, 3.3, 0], scale: [1.1, 0.9, 1.0], flat: true });
    b.part(new THREE.IcosahedronGeometry(0.38, 1), P.moss, { bone: chest, at: [s * 0.88, 3.58, -0.02], scale: [1.2, 0.5, 1.1], flat: true });
    b.part(new THREE.IcosahedronGeometry(0.2, 0), P.mossDark, { bone: chest, at: [s * 0.7, 3.62, -0.2], scale: [1, 0.5, 1], flat: true });
    // mushrooms
    const mx = s * 1.0, mz = 0.12;
    b.part(new THREE.CylinderGeometry(0.04, 0.055, 0.2, 6), P.mushroomSpot, { bone: chest, at: [mx, 3.7, mz] });
    b.part(new THREE.SphereGeometry(0.12, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.mushroom, { bone: chest, at: [mx, 3.78, mz], scale: [1, 0.7, 1] });
    for (let k = 0; k < 4; k++) {
      const a = k * 1.6;
      b.part(new THREE.SphereGeometry(0.02, 5, 3), P.mushroomSpot, { bone: chest, at: [mx + Math.cos(a) * 0.065, 3.84, mz + Math.sin(a) * 0.065] });
    }
    b.part(new THREE.CylinderGeometry(0.025, 0.035, 0.12, 6), P.mushroomSpot, { bone: chest, at: [mx - s * 0.2, 3.67, mz - 0.2] });
    b.part(new THREE.SphereGeometry(0.07, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.mushroom, { bone: chest, at: [mx - s * 0.2, 3.72, mz - 0.2] });
=======
    b.part(new THREE.IcosahedronGeometry(0.32, 1), P.bark, { bone: chest, at: [s * 0.75, 3.2, 0], scale: [1.1, 0.9, 1.0], flat: true });
    b.part(new THREE.IcosahedronGeometry(0.26, 1), P.moss, { bone: chest, at: [s * 0.75, 3.4, -0.02], scale: [1.1, 0.5, 1.1], flat: true });
    b.part(new THREE.IcosahedronGeometry(0.13, 0), P.mossDark, { bone: chest, at: [s * 0.6, 3.42, -0.2], scale: [1, 0.5, 1], flat: true });
    // mushrooms
    const mx = s * 0.9, mz = 0.12;
    b.part(new THREE.CylinderGeometry(0.04, 0.055, 0.2, 6), P.mushroomSpot, { bone: chest, at: [mx, 3.45, mz] });
    b.part(new THREE.SphereGeometry(0.12, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.mushroom, { bone: chest, at: [mx, 3.5, mz], scale: [1, 0.7, 1] });
    for (let k = 0; k < 4; k++) {
      const a = k * 1.6;
      b.part(new THREE.SphereGeometry(0.02, 5, 3), P.mushroomSpot, { bone: chest, at: [mx + Math.cos(a) * 0.065, 3.55, mz + Math.sin(a) * 0.065] });
    }
    b.part(new THREE.CylinderGeometry(0.025, 0.035, 0.12, 6), P.mushroomSpot, { bone: chest, at: [mx - s * 0.2, 3.45, mz - 0.2] });
    b.part(new THREE.SphereGeometry(0.07, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.mushroom, { bone: chest, at: [mx - s * 0.2, 3.5, mz - 0.2] });
>>>>>>> REPLACE

<!-- call: fit-crownCanopy -->

Three edits: the canopy clumps are shrunk and lowered, the branch heights are compressed, and the leaf blades and hanging vines are shortened. I haven't re-run the measurement, so these are worked out by hand.

<<<<<<< SEARCH
    const [a, c] = [pts[0], pts[pts.length - 1]];
=======
    pts = pts.map((p) => [p[0], 4.15 + (p[1] - 4.15) * 0.5, p[2]]);
    const [a, c] = [pts[0], pts[pts.length - 1]];
>>>>>>> REPLACE
<<<<<<< SEARCH
  const branch = (pts: number[][], rad: number) => {
=======
  const branch = (pts: number[][], rad: number) => {
>>>>>>> REPLACE
<<<<<<< SEARCH
  clumps.forEach(([x, y, z, rad], i) => {
=======
  clumps.forEach(([x, y0, z, rad0], i) => {
    const rad = rad0 * 0.55;
    const y = 4.22 + (y0 - 4.25) * 0.4;
>>>>>>> REPLACE
<<<<<<< SEARCH
    const y = 4.3 + r() * 0.25;
=======
    const y = 4.25 + r() * 0.1;
>>>>>>> REPLACE
<<<<<<< SEARCH
0.22 + r() * 0.15, 0.05,
=======
0.15 + r() * 0.1, 0.05,
>>>>>>> REPLACE
<<<<<<< SEARCH
    const len = 0.3 + r() * 0.3;
    b.rod([x, 4.25, z], [x * 1.04, 4.25 - len, z * 1.04], [0.02, 0.008], P.mossDark, { bone });
    b.part(new THREE.IcosahedronGeometry(0.035, 0), P.leafLight, { bone, at: [x * 1.04, 4.25 - len, z * 1.04], flat: true });
=======
    const len = 0.1 + r() * 0.18;
    b.rod([x, 4.35, z], [x * 1.04, 4.35 - len, z * 1.04], [0.02, 0.008], P.mossDark, { bone });
    b.part(new THREE.IcosahedronGeometry(0.035, 0), P.leafLight, { bone, at: [x * 1.04, 4.35 - len, z * 1.04], flat: true });
>>>>>>> REPLACE

<!-- call: fit-headFace -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildHeadFace({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const head = J.head, jaw = J.jaw, neck = J.neck;
  const hc = M.headCentre;
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cone = (r: number, h: number, s = 6) => new THREE.ConeGeometry(r, h, s);
  const put = (g: THREE.BufferGeometry, c: string, bone: any, at: number[], o: any = {}) =>
    b.part(g, c, { bone, at, flat: true, ...o });

  // neck roots
  const nc = M.neck;
  put(new THREE.CylinderGeometry(0.38, 0.5, 0.5, 8), P.bark, neck, [0, nc[1] + 0.1, nc[2]]);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    b.rod([Math.sin(a) * 0.3, nc[1] + 0.15, nc[2] + Math.cos(a) * 0.25], [Math.sin(a) * 0.5, nc[1] - 0.1, nc[2] + Math.cos(a) * 0.4], [0.05, 0.08], { bone: neck, color: i % 2 ? P.root : P.barkLight, sides: 5 });
  }

  // skull
  put(box(1.1, 0.75, 0.95), P.bark, head, [0, hc[1] + 0.05, hc[2] + 0.1]);
  put(box(0.9, 0.3, 0.8), P.barkLight, head, [0, hc[1] + 0.35, hc[2] + 0.05]);
  put(box(1.2, 0.2, 0.7), P.barkDark, head, [0, hc[1] - 0.2, hc[2] + 0.05]);
  for (const s of [1, -1]) {
    put(box(0.3, 0.4, 0.6), P.bark, head, [s * 0.5, hc[1] - 0.1, hc[2] + 0.25], { rotation: [0, 0, s * 12] });
    // ears
    put(cone(0.12, 0.25, 5), P.barkLight, head, [s * 0.6, hc[1] + 0.1, hc[2] + 0.05], { dir: [s, 0.5, -0.2] });
    put(new THREE.IcosahedronGeometry(0.1, 0), P.barkDark, head, [s * 0.58, hc[1] - 0.15, hc[2] + 0.2]);
    // brows
    put(box(0.42, 0.16, 0.3), P.barkDark, head, [s * 0.22, hc[1] + 0.2, hc[2] + 0.5], { rotation: [0, 0, -s * 14] });
    put(box(0.44, 0.07, 0.3), P.moss, head, [s * 0.22, hc[1] + 0.3, hc[2] + 0.5], { rotation: [0, 0, -s * 14] });
    put(box(0.3, 0.05, 0.2), P.leafLight, head, [s * 0.25, hc[1] + 0.34, hc[2] + 0.5]);
    // eyes
    put(new THREE.SphereGeometry(0.12, 7, 5), "#120a05", head, [s * 0.22, hc[1] + 0.02, hc[2] + 0.5]);
    const e = put(new THREE.SphereGeometry(0.08, 7, 5), P.amber, head, [s * 0.22, hc[1] + 0.02, hc[2] + 0.54]);
    e.mesh.material = (e.mesh.material as THREE.MeshStandardMaterial).clone();
    const m = e.mesh.material as THREE.MeshStandardMaterial;
    m.emissive.set(P.amber); m.emissiveIntensity = 1.5;
    put(box(0.025, 0.07, 0.02), "#120a05", head, [s * 0.22, hc[1] + 0.02, hc[2] + 0.61]);
    put(new THREE.CylinderGeometry(0.07, 0.09, 0.05, 6), P.heartwood, head, [s * 0.56, hc[1] + 0.3, hc[2] + 0.3], { dir: [s, 0.2, 0.3] });
  }
  // nose stub
  put(box(0.2, 0.2, 0.2), P.barkLight, head, [0, hc[1] - 0.08, hc[2] + 0.55], { rotation: [-15, 0, 0] });
  put(cone(0.08, 0.1, 5), P.bark, head, [0, hc[1] - 0.12, hc[2] + 0.62], { dir: [0, -0.2, 1] });
  put(new THREE.IcosahedronGeometry(0.05, 0), P.moss, head, [0.06, hc[1] + 0.03, hc[2] + 0.6]);

  // upper jaw + teeth
  const jy = M.jawHinge[1], jz = M.jawHinge[2];
  put(box(0.95, 0.14, 0.7), P.barkDark, head, [0, jy + 0.1, jz + 0.2]);
  for (let i = 0; i < 7; i++) {
    const x = -0.36 + i * 0.12;
    put(cone(0.035, 0.1 + R() * 0.07, 4), P.heartwood, head, [x, jy + 0.0, jz + 0.5], { dir: [R() * 0.2 - 0.1, -1, 0] });
  }
  // lower jaw
  put(box(0.85, 0.16, 0.66), P.bark, jaw, [0, jy - 0.05, jz + 0.2]);
  put(box(0.5, 0.14, 0.2), P.barkLight, jaw, [0, jy - 0.1, jz + 0.45]);
  for (let i = 0; i < 6; i++) {
    const x = -0.3 + i * 0.12;
    put(cone(0.035, 0.09 + R() * 0.08, 4), P.heartwood, jaw, [x, jy + 0.08, jz + 0.48], { dir: [R() * 0.2 - 0.1, 1, 0] });
  }
  // beard
  for (let i = 0; i < 12; i++) {
    const x = -0.4 + (i / 11) * 0.8;
    const len = 0.05 + R() * 0.04;
    const z = jz + 0.45 - Math.abs(x) * 0.3;
    b.rod([x, jy - 0.05, z], [x * 1.1 + (R() - 0.5) * 0.08, jy - 0.05 - len, z + 0.04], [0.04, 0.01], { bone: jaw, color: i % 3 ? P.mossDark : P.root, sides: 5 });
  }
  for (let i = 0; i < 5; i++) {
    const x = -0.28 + i * 0.14;
    put(new THREE.IcosahedronGeometry(0.06, 0), P.moss, jaw, [x, jy - 0.08, jz + 0.47]);
  }
  // runes on forehead
  for (let i = -1; i <= 1; i++) {
    const r = put(box(0.04, 0.12, 0.02), P.rune, head, [i * 0.12, hc[1] + 0.4, hc[2] + 0.56 + 0.0], { rotation: [-20, 0, i * 25] });
    const mm = (r.mesh.material = (r.mesh.material as THREE.MeshStandardMaterial).clone()) as THREE.MeshStandardMaterial;
    mm.emissive.set(P.rune); mm.emissiveIntensity = 1.2;
  }
  // moss on top
  put(box(0.8, 0.06, 0.7), P.moss, head, [0, hc[1] + 0.4, hc[2] - 0.02]);
  for (let i = 0; i < 4; i++) put(cone(0.06, 0.12, 5), P.barkLight, head, [-0.3 + i * 0.2, hc[1] + 0.45, hc[2] - 0.1], { dir: [R() * 0.4 - 0.2, 1, -0.2] });
}
```