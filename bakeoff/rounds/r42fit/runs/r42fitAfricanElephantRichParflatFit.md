<!-- call: plan -->

```json
{
  "name": "African Bush Elephant",
  "description": "A stylized low-poly adult African bush elephant in a neutral rest pose, with big fan ears, long trunk, curved tusks, pillar legs and a rigged spine, tail and jaw.",
  "builderName": "bushElephant",
  "size": [4.2, 3.4, 7.0],
  "layout": "Bulky barrel body about 3.2 m high at the shoulder, facing +Z. From front to back: trunk hanging from the face and reaching down to about y 0.35 with a slight forward curl, flanked by two long curved ivory tusks. The head is a large rounded box-like skull with a domed forehead, small eyes and a separate lower jaw. Huge flat fan ears hang behind the head, each tapering to a point. The neck is short and thick, the shoulder hump is high, the back dips slightly then rises to a rounded rump, and a thin tail with a tuft hangs at the rear. Four thick pillar legs stand on the floor, with flat round feet carrying 4-5 toenails each. Style: low-poly facets with few segments (6-8 sides), blocky bold shapes. The skin is a flat grey-brown with darker wrinkle bands at the knees, trunk rings and ear veins, lighter dusty grey on the legs and belly, and a dark dust cap on the back. Colour is by place, in separate small parts.",
  "palette": {
    "skin": "#7d7a78",
    "skinDark": "#5f5c5b",
    "skinLight": "#9a958f",
    "dust": "#a68f72",
    "earInner": "#a88b85",
    "earVein": "#6e5551",
    "ivory": "#efe4c8",
    "ivoryShade": "#cdbf9d",
    "nail": "#d8cdb4",
    "eye": "#1b1412",
    "eyeShine": "#ffffff",
    "mouth": "#b46a64",
    "tuft": "#2f2a28"
  },
  "mounts": {
    "headBase": [0, 2.45, 2.3],
    "faceFront": [0, 2.3, 3.55],
    "trunkRoot": [0, 1.95, 3.55],
    "earRootL": [0.7, 2.75, 2.05],
    "earRootR": [-0.7, 2.75, 2.05],
    "tuskRootL": [0.38, 1.95, 3.4],
    "tuskRootR": [-0.38, 1.95, 3.4],
    "hipFL": [0.8, 1.6, 1.7],
    "hipFR": [-0.8, 1.6, 1.7],
    "hipBL": [0.8, 1.7, -1.7],
    "hipBR": [-0.8, 1.7, -1.7],
    "tailRoot": [0, 2.4, -3.05]
  },
  "joints": [
    { "name": "hips", "at": [0, 2.2, -1.6], "dir": [0, 0, 1], "role": "spine" },
    { "name": "spine1", "parent": "hips", "at": [0, 2.3, -0.4], "dir": [0, 0, 1], "role": "spine" },
    { "name": "spine2", "parent": "spine1", "at": [0, 2.5, 0.9], "dir": [0, 0, 1], "role": "spine" },
    { "name": "neck", "parent": "spine2", "at": [0, 2.55, 1.8], "dir": [0, 0, 1], "role": "neck" },
    { "name": "head", "parent": "neck", "at": [0, 2.45, 2.3], "dir": [0, 0, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 1.85, 3.0], "dir": [0, 0, 1], "role": "jaw" },
    { "name": "trunk1", "parent": "head", "at": [0, 1.95, 3.55], "dir": [0, -0.3, 1], "role": "tentacle" },
    { "name": "trunk2", "parent": "trunk1", "at": [0, 1.5, 3.8], "dir": [0, -1, 0.2], "role": "tentacle" },
    { "name": "trunk3", "parent": "trunk2", "at": [0, 0.95, 3.9], "dir": [0, -1, 0.2], "role": "tentacle" },
    { "name": "trunk4", "parent": "trunk3", "at": [0, 0.5, 4.0], "dir": [0, -1, 0.3], "role": "tentacle" },
    { "name": "earL", "parent": "head", "at": [0.7, 2.75, 2.05], "dir": [1, 0, -0.2], "role": "hinge" },
    { "name": "earR", "parent": "head", "at": [-0.7, 2.75, 2.05], "dir": [-1, 0, -0.2], "role": "hinge" },
    { "name": "tail1", "parent": "hips", "at": [0, 2.4, -3.05], "dir": [0, -0.5, -1], "role": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 1.9, -3.3], "dir": [0, -1, -0.2], "role": "tail" },
    { "name": "tail3", "parent": "tail2", "at": [0, 1.3, -3.4], "dir": [0, -1, 0], "role": "tail" },
    { "name": "hipFL", "parent": "spine2", "at": [0.8, 1.6, 1.7], "dir": [0, -1, 0], "role": "leg" },
    { "name": "kneeFL", "parent": "hipFL", "at": [0.8, 0.85, 1.75], "dir": [0, -1, 0], "role": "leg" },
    { "name": "footFL", "parent": "kneeFL", "at": [0.8, 0.15, 1.8], "dir": [0, 0, 1], "role": "leg" },
    { "name": "hipFR", "parent": "spine2", "at": [-0.8, 1.6, 1.7], "dir": [0, -1, 0], "role": "leg" },
    { "name": "kneeFR", "parent": "hipFR", "at": [-0.8, 0.85, 1.75], "dir": [0, -1, 0], "role": "leg" },
    { "name": "footFR", "parent": "kneeFR", "at": [-0.8, 0.15, 1.8], "dir": [0, 0, 1], "role": "leg" },
    { "name": "hipBL", "parent": "hips", "at": [0.8, 1.7, -1.7], "dir": [0, -1, 0], "role": "leg" },
    { "name": "kneeBL", "parent": "hipBL", "at": [0.8, 0.9, -1.6], "dir": [0, -1, 0], "role": "leg" },
    { "name": "footBL", "parent": "kneeBL", "at": [0.8, 0.15, -1.7], "dir": [0, 0, 1], "role": "leg" },
    { "name": "hipBR", "parent": "hips", "at": [-0.8, 1.7, -1.7], "dir": [0, -1, 0], "role": "leg" },
    { "name": "kneeBR", "parent": "hipBR", "at": [-0.8, 0.9, -1.6], "dir": [0, -1, 0], "role": "leg" },
    { "name": "footBR", "parent": "kneeBR", "at": [-0.8, 0.15, -1.7], "dir": [0, 0, 1], "role": "leg" }
  ],
  "parts": [
    {
      "id": "body",
      "builds": "Barrel torso and neck as one smooth loft along hips, spine1, spine2 and neck. It is wide and deep at the ribs, with a shoulder hump, rump and belly hanging lower in a lighter skinLight, plus a dust cap on the back in dust. Add skinDark wrinkle ring bands on the flanks, small shoulder and hip bulges, and a few dust patches. It also carries the hind and fore thigh tops, blending into the leg tops.",
      "box": [[-1.3, 1.3, -3.1], [1.3, 3.2, 2.3]],
      "attaches": "Legs begin at the hip mounts; the head sits at headBase; the tail at tailRoot; ears at earRoot mounts.",
      "joints": ["hips", "spine1", "spine2", "neck"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "legs",
      "builds": "Four thick pillar legs, each a tapered 8-sided sweep from the hip down to the knee and foot, with the knee as a slight bulge. Each has a skinDark wrinkle ring at the knee and ankle, a skinLight lower leg with dust at the feet, and a flat round foot pad (low cylinder). Each foot carries 4-5 small nail wedges in nail colour on its front rim. Rear legs are a little straighter, front legs heavier. Feet rest on y = 0.",
      "box": [[-1.15, 0, -2.1], [1.15, 1.8, 2.2]],
      "attaches": "Tops tuck into the body at the four hip mounts.",
      "joints": ["hipFL", "kneeFL", "footFL", "hipFR", "kneeFR", "footFR", "hipBL", "kneeBL", "footBL", "hipBR", "kneeBR", "footBR"],
      "floor": true,
      "budget": 170
    },
    {
      "id": "head",
      "builds": "Big blocky skull with a domed forehead and a lower face tapering to the trunk root. A separate lower jaw on the jaw joint sits under the trunk, with a mouth interior in mouth colour and a small chin. Eyes on each side as dark spheres with a tiny white highlight and skinDark brow ridges and lids. Cheek wrinkles, temple bulges with skinDark glands, and dust on top of the head. Two long curved ivory tusks sprout from tuskRootL and tuskRootR, thick at the root with a skinDark gum ring, curving down, forward and up to pointed tips in ivory with ivoryShade bands on the lower edges, around 1.6 m long.",
      "box": [[-0.8, 1.5, 2.0], [0.8, 3.4, 4.3]],
      "attaches": "Skull joins the neck at headBase; the trunk starts at trunkRoot; the ears sit at the earRoot mounts.",
      "joints": ["head", "jaw"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "trunk",
      "builds": "Long trunk as one tapered sweep along trunk1 to trunk4. It is thick at the root and narrows toward the tip, with a slight forward curve, and the tip lifts a little forward. Many skinDark wrinkle ring bands are made as thin torus-like rings along its length, a lighter underside via skinLight sectors, and a tip with two small finger-like lips on top and bottom, two nostril dots in eye colour, and a pinkish mouth colour at the lip.",
      "box": [[-0.4, 0.3, 3.3], [0.4, 2.2, 4.4]],
      "attaches": "Root at trunkRoot on the head front; hangs freely to about y 0.35 near z 4.0.",
      "joints": ["trunk1", "trunk2", "trunk3", "trunk4"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "ears",
      "builds": "Two huge fan ears on earL and earR. Each is a thin extruded shape, wide at the top and tapering to a rounded point low at the back, with a thicker rolled skinDark rim along the top edge, an earInner face on the front side, and branching earVein ridges as small thin rods in a fan pattern. The outer side is skin with dust patches. Each ear is about 1.6 m wide and 1.9 m tall and sticks out about 0.3 m from the head, with a thick base at the root.",
      "box": [[-2.1, 1.0, 1.2], [2.1, 3.4, 2.4]],
      "attaches": "Roots at earRootL and earRootR on the head sides.",
      "joints": ["earL", "earR"],
      "floor": false,
      "budget": 100
    },
    {
      "id": "tail",
      "builds": "Thin tail swept along tail1 to tail3 from tailRoot, 8-sided and tapering from 0.09 to 0.03 m radius with skinDark ring marks, ending in a tuft of 8-10 slim tuft-colour cone blades fanned out. Also the rump details: a small skinDark anal fold, a few wrinkle patches, and dust on the hind quarters.",
      "box": [[-0.3, 1.0, -3.7], [0.3, 2.6, -2.9]],
      "attaches": "Root at tailRoot on the rump.",
      "joints": ["tail1", "tail2", "tail3"],
      "floor": false,
      "budget": 60
    }
  ]
}
```

<!-- call: tail -->

```ts
import * as THREE from "three";
import { catmull, rng } from "agentic-3js-builder";

export function buildTail({ b, J, P, M }: Ctx) {
  const r = rng(11);
  const root = M.tailRoot;
  const pts: number[][] = [
    root,
    [0, 2.15, -3.2],
    [0, 1.7, -3.36],
    [0, 1.3, -3.4],
  ];
  const path = catmull(pts);
  const tail = b.sweep(path, [0.09, 0.03], {
    color: P.skin,
    bone: [J.tail1, J.tail2, J.tail3],
    sides: 8,
    caps: "round",
  });

  // ring marks along the tail
  for (let i = 0; i < 6; i++) {
    const t = 0.12 + i * 0.14;
    const p = tail.at(t);
    const rad = 0.09 + (0.03 - 0.09) * t + 0.012;
    b.stick(new THREE.CylinderGeometry(rad, rad, 0.018, 8), P.skinDark, p, { embed: 0.5 });
  }

  // tuft
  const tip = path.at(1);
  const tuftBone = J.tail3;
  b.part(new THREE.SphereGeometry(0.04, 6, 4), P.tuft, { bone: tuftBone, at: [0, tip.y - 0.02, tip.z] });
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const spread = 0.16 + r() * 0.06;
    const len = 0.28 + r() * 0.1;
    const base = [0, tip.y, tip.z];
    const dir = [Math.sin(a) * spread * 2, -1, Math.cos(a) * spread * 2];
    b.spike(base, dir, len, 0.022, { color: P.tuft, bone: tuftBone, sides: 5 });
  }

  // rump details: anal fold, wrinkles, dust (on the body, riding hips)
  b.part(new THREE.BoxGeometry(0.22, 0.34, 0.06), P.skinDark, {
    bone: J.hips,
    at: [0, 2.12, -3.04],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.2, 0.34, 0.06), P.skinDark, {
      bone: J.hips,
      at: [s * 0.2, 2.1, -3.03],
      rotation: [0, 0, s * 12],
    });
    b.part(new THREE.SphereGeometry(0.2, 6, 4), P.skinDark, {
      bone: J.hips,
      at: [s * 0.55, 2.25, -2.95],
      scale: [0.3, 1, 1.2],
    });
    b.part(new THREE.SphereGeometry(0.28, 6, 4), P.dust, {
      bone: J.hips,
      at: [s * 0.5, 2.75, -2.85],
      scale: [1.3, 0.4, 1.1],
    });
    b.part(new THREE.SphereGeometry(0.22, 6, 4), P.dust, {
      bone: J.hips,
      at: [s * 0.2, 2.9, -2.65],
      scale: [1.4, 0.4, 1],
    });
  }
}
```

<!-- call: trunk -->

```ts
import * as THREE from "three";
import { catmull, rng } from "agentic-3js-builder";

export function buildTrunk({ b, J, P, M }: any) {
  const r = rng(11);
  const path = catmull([
    [0, 1.95, 3.55],
    [0, 1.5, 3.8],
    [0, 0.95, 3.9],
    [0, 0.5, 4.0],
    [0, 0.36, 4.12],
  ]);
  const bones = [J.trunk1, J.trunk2, J.trunk3, J.trunk4];
  const rad = (t: number) => 0.27 - 0.17 * t;
  const tube = b.sweep(path, (t: number) => rad(t), {
    bone: bones,
    color: P.skin,
    section: { ngon: 8 },
    caps: "round",
    sectors: [[125, 235, P.skinLight]],
  });

  // wrinkle rings
  const N = 17;
  for (let i = 0; i < N; i++) {
    const t = 0.05 + (0.88 * i) / (N - 1);
    const pt = path.at(t);
    const tg = path.tangentAt(t);
    const rr = rad(t) * 1.04;
    const col = i % 3 === 0 ? P.skinDark : P.skinDark;
    b.part(new THREE.TorusGeometry(rr, 0.011 + 0.004 * (1 - t), 4, 8), col, {
      at: pt,
      dir: tg,
      axis: "z",
      bone: bones[Math.min(3, Math.floor(t * 4))],
    });
  }
  // a few lighter fold ridges between
  for (let i = 0; i < 6; i++) {
    const t = 0.1 + i * 0.14 + r() * 0.03;
    const s = tube.at(t, 90);
    b.stick(new THREE.SphereGeometry(0.035, 5, 4), P.skinLight, s, { embed: 0.5 });
  }

  // tip
  const tipP = path.at(1);
  const tg = path.tangentAt(1);
  const tipEnd: [number, number, number] = [tipP.x, tipP.y, tipP.z];
  // mouth coloured lip pad on the end
  b.part(new THREE.CylinderGeometry(0.075, 0.09, 0.04, 8), P.mouth, {
    at: [0, tipEnd[1] - 0.075, tipEnd[2] + 0.015],
    dir: tg,
    bone: J.trunk4,
  });
  // finger lips: top (front) and bottom (back)
  b.spike([0, tipEnd[1] - 0.04, tipEnd[2] + 0.07], [0.0, -0.35, 0.9], 0.13, 0.04, {
    color: P.skin,
    bone: J.trunk4,
  });
  b.spike([0, tipEnd[1] - 0.05, tipEnd[2] - 0.05], [0, -0.9, -0.1], 0.1, 0.035, {
    color: P.skinDark,
    bone: J.trunk4,
  });
  // nostrils
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.02, 5, 4), P.eye, {
      at: [s * 0.04, tipEnd[1] - 0.1, tipEnd[2] + 0.04],
      bone: J.trunk4,
    });
  }
}
```

<!-- call: body -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildBody({ b, J, P }: any) {
  const R = rng(5);
  const bones = [J.hips, J.spine1, J.spine2, J.neck];

  // Barrel torso + neck as one loft along the spine
  const st = [
    { at: [0, 2.15, -2.95], w: 1.5, h: 1.5 },
    { at: [0, 2.25, -2.3], w: 2.1, h: 1.85 },
    { at: [0, 2.3, -1.2], w: 2.4, h: 1.9 },
    { at: [0, 2.3, 0.0], w: 2.5, h: 1.9 },
    { at: [0, 2.5, 1.0], w: 2.4, h: 2.0 },
    { at: [0, 2.6, 1.8], w: 1.8, h: 1.7 },
    { at: [0, 2.55, 2.25], w: 1.4, h: 1.5 },
  ];
  b.loft(st, { bone: bones, color: P.skin, sides: 8 });

  // Lighter belly
  b.loft(
    st.map((s) => ({ at: [0, s.at[1] - s.h * 0.3, s.at[2]], w: s.w * 0.8, h: s.h * 0.4 })).slice(1, 6),
    { bone: bones, color: P.skinLight, sides: 8 },
  );

  // Dust cap on the back
  b.loft(
    [
      { at: [0, 3.05, -2.2], w: 0.9, h: 0.2 },
      { at: [0, 3.2, -0.6], w: 1.2, h: 0.25 },
      { at: [0, 3.25, 0.9], w: 1.2, h: 0.25 },
      { at: [0, 3.1, 1.8], w: 0.9, h: 0.2 },
    ],
    { bone: bones, color: P.dust, sides: 6 },
  );

  // Shoulder and hip bulges, thigh tops
  for (const s of [1, -1]) {
    const sp = (x: number, y: number, z: number, r: number, bone: any, c: string) =>
      b.part(new THREE.IcosahedronGeometry(r, 1), c, { bone, at: [x, y, z], scale: [0.8, 1.1, 1] });
    sp(s * 1.05, 2.1, 1.7, 0.6, J.spine2, P.skin);
    sp(s * 1.0, 2.2, -1.7, 0.65, J.hips, P.skin);
    sp(s * 0.9, 1.65, 1.7, 0.5, J.spine2, P.skinLight);
    sp(s * 0.9, 1.7, -1.7, 0.52, J.hips, P.skinLight);

    // wrinkle bands on the flanks
    for (let i = 0; i < 6; i++) {
      const z = -2 + i * 0.7;
      b.part(new THREE.BoxGeometry(0.06, 0.9 + R() * 0.3, 0.08), P.skinDark, {
        bone: z > 0.9 ? J.spine2 : z > -0.4 ? J.spine1 : J.hips,
        at: [s * 1.2, 2.2, z],
        rotation: [0, 0, s * 5],
      });
    }
    // dust patches
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.IcosahedronGeometry(0.22 + R() * 0.1, 0), P.dust, {
        bone: J.spine1,
        at: [s * (1.05 + R() * 0.05), 1.7 + R() * 0.5, -1 + i * 1.1],
        scale: [0.35, 1, 1],
      });
    }
  }

  // Neck wrinkle rings
  for (let i = 0; i < 3; i++) {
    b.part(new THREE.TorusGeometry(0.75 - i * 0.05, 0.04, 4, 8), P.skinDark, {
      bone: J.neck,
      at: [0, 2.58, 1.65 + i * 0.2],
      rotation: [0, 90, 0],
    });
  }
}
```

<!-- call: legs -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildLegs({ b, J, P, M }: any) {
  const R = rng(11);
  const legs = [
    { k: "FL", s: 1, front: true },
    { k: "FR", s: -1, front: true },
    { k: "BL", s: 1, front: false },
    { k: "BR", s: -1, front: false },
  ];
  for (const L of legs) {
    const hip = J["hip" + L.k], knee = J["knee" + L.k], foot = J["foot" + L.k];
    const x = L.s * 0.8;
    const z = L.front ? 1.8 : -1.7;
    const rTop = L.front ? 0.5 : 0.46;
    const rMid = L.front ? 0.4 : 0.36;
    const rLow = L.front ? 0.38 : 0.34;
    const hipP = M["hip" + L.k];
    const kneeY = L.front ? 0.85 : 0.9;
    const top: [number, number, number] = [x, hipP[1] + 0.15, hipP[2]];
    const kn: [number, number, number] = [x, kneeY, z];
    const ank: [number, number, number] = [x, 0.2, z];
    // upper leg
    b.sweep([top, kn], [rTop, rMid], { bone: hip, color: P.skin, sides: 8, caps: "flat" });
    // lower leg lighter
    b.sweep([kn, ank], [rMid, rLow], { bone: knee, color: P.skinLight, sides: 8, caps: "flat" });
    // knee bulge
    b.part(new THREE.SphereGeometry(rMid * 1.08, 8, 6), P.skin, { bone: knee, at: kn, scale: [1, 0.8, 1] });
    // wrinkle rings
    const ring = (y: number, r: number, bone: any, h = 0.05) =>
      b.part(new THREE.CylinderGeometry(r, r, h, 8), P.skinDark, { bone, at: [x, y, z] });
    ring(kneeY + 0.12, rMid + 0.03, knee);
    ring(kneeY - 0.1, rMid + 0.025, knee);
    ring(kneeY - 0.3, rMid + 0.01, knee, 0.04);
    ring(0.42, rLow + 0.02, foot);
    ring(0.34, rLow + 0.015, foot, 0.04);
    ring(1.15, rTop - 0.04, hip, 0.05);
    // dust at the feet
    b.part(new THREE.CylinderGeometry(rLow + 0.03, rLow + 0.07, 0.14, 8), P.dust, { bone: foot, at: [x, 0.2, z] });
    // foot pad
    const fr = rLow + 0.12;
    b.part(new THREE.CylinderGeometry(fr, fr + 0.03, 0.14, 8), P.skinDark, { bone: foot, at: [x, 0.07, z] });
    // nails on front rim
    const n = L.front ? 5 : 4;
    for (let i = 0; i < n; i++) {
      const a = (-0.5 + (n === 1 ? 0 : i / (n - 1))) * 1.7 + (R() - 0.5) * 0.05;
      const nx = x + Math.sin(a) * (fr + 0.01);
      const nz = z + Math.cos(a) * (fr + 0.01);
      b.part(new THREE.ConeGeometry(0.06, 0.12, 4), P.nail, {
        bone: foot,
        at: [nx, 0.08, nz],
        dir: [Math.sin(a), 0.1, Math.cos(a)],
        scale: [1, 1, 0.6],
      });
    }
    // muscle bulge at thigh
    b.part(new THREE.SphereGeometry(rTop * 1.05, 8, 6), P.skin, { bone: hip, at: [x + L.s * 0.05, hipP[1] - 0.1, hipP[2]], scale: [1, 1.1, 1.1] });
  }
}
```

<!-- call: ears -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildEars({ b, J, P, M }: Ctx) {
  const R = rng(11);
  for (const s of [1, -1]) {
    const bone = s > 0 ? J.earL : J.earR;
    const root = M[s > 0 ? "earRootL" : "earRootR"];
    const ox = root[0], oy = root[1], oz = root[2];
    // Outline in (u, v): u = backward (-z), v = up. Wide at top, tapering to rounded point low.
    const outline: any[] = [
      [0, 0.15, "sharp"],
      [0.1, 0.35],
      [0.55, 0.45],
      [1.05, 0.35],
      [1.5, 0.1],
      [1.62, -0.35],
      [1.4, -0.95],
      [1.0, -1.45],
      [0.6, -1.78],
      [0.4, -1.9],
      [0.28, -1.6],
      [0.1, -1.0],
      [0, -0.4],
    ];
    const at: [number, number, number] = [ox + s * 0.1, oy, oz];
    const X: [number, number, number] = [0, 0, -1];
    const Y: [number, number, number] = [s * 0.25, 1, 0];
    const mk = (col: string, th: number, shift: number, scale = 1) => {
      const o = outline.map((p) => (p.length === 3 ? [p[0] * scale, p[1] * scale, "sharp"] : [p[0] * scale, p[1] * scale]));
      return b.extrude(o, {
        at: [at[0] + s * shift, at[1], at[2]],
        x: X,
        y: Y,
        thickness: th,
        bevel: 0.01,
        smoothing: 1,
        color: col,
        bone,
      });
    };
    // outer skin, inner face on front side (outward from head is +s x)
    mk(P.skin, 0.07, 0);
    mk(P.earInner, 0.02, s * 0.04, 0.9);
    // thick base
    b.capsule([ox, oy + 0.05, oz], [ox + s * 0.3, oy - 0.05, oz - 0.3], 0.14, P.skinDark, { bone });
    // rolled rim along top
    const rim = [
      [0.05, 0.2],
      [0.5, 0.45],
      [1.05, 0.36],
      [1.5, 0.11],
      [1.62, -0.35],
    ];
    const pts = rim.map(([u, v]) => [at[0] + s * 0.02 + v * s * 0.25 * 0, at[1] + v, at[2] - u] as [number, number, number]);
    b.sweep(pts, [0.06, 0.04], { color: P.skinDark, bone, sides: 6 });
    // veins fanning from base
    const fx = at[0] + s * 0.09;
    const origin: [number, number, number] = [fx, oy + 0.05, oz - 0.1];
    const tips = [
      [0.55, 0.38], [1.0, 0.3], [1.4, 0.05], [1.5, -0.4], [1.25, -0.95], [0.9, -1.4], [0.5, -1.7], [0.3, -1.1],
    ];
    for (const [u, v] of tips) {
      const tip: [number, number, number] = [fx, oy + v, oz - u];
      const m: [number, number, number] = [fx, oy + v * 0.5 + 0.02, oz - u * 0.5 + (R() - 0.5) * 0.06];
      b.sweep([origin, m, tip], [0.025, 0.008], { color: P.earVein, bone, sides: 5 });
      // branch
      const bp: [number, number, number] = [fx, oy + v * 0.75, oz - u * 0.75];
      const bt: [number, number, number] = [fx, oy + v * 0.75 - 0.18, oz - u * 0.75 - 0.2];
      b.rod(bp, bt, [0.012, 0.005], P.earVein, { bone, sides: 5 });
    }
    // dust patches on outer side
    for (let i = 0; i < 5; i++) {
      const u = 0.4 + R() * 0.9, v = -0.2 - R() * 1.0;
      b.part(new THREE.CylinderGeometry(0.1 + R() * 0.07, 0.12, 0.02, 6), P.dust, {
        bone,
        at: [at[0] - s * 0.045 + s * 0.0, oy + v, oz - u],
        dir: [s, 0, 0],
      });
    }
    // tip shade
    b.part(new THREE.ConeGeometry(0.1, 0.25, 6), P.skinDark, {
      bone,
      at: [at[0], oy - 1.78, oz - 0.45],
      dir: [0, -1, -0.15],
    });
  }
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildHead({ b, J, P, M }: any) {
  const head = J.head, jaw = J.jaw;
  const R = rng(5);
  const sph = (rx: number, ry: number, rz: number, color: string, at: number[], bone: any, seg = 8) =>
    b.part(new THREE.SphereGeometry(1, seg, Math.max(4, seg - 2)), color, { bone, at, scale: [rx, ry, rz], flat: true });
  const box = (w: number, h: number, d: number, color: string, at: number[], bone: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, rotation: rot, flat: true });

  // skull
  sph(0.72, 0.8, 0.9, P.skin, [0, 2.7, 2.75], head);
  // domed forehead
  sph(0.6, 0.45, 0.6, P.skin, [0, 3.1, 2.95], head);
  // dust cap
  sph(0.5, 0.2, 0.55, P.dust, [0, 3.38, 2.9], head, 6);
  // lower face taper
  b.frustumBox([0, 2.35, 3.0], [0, 2.1, 3.55], [1.0, 0.9], [0.6, 0.6], { bone: head, color: P.skin });
  // cheeks
  for (const s of [1, -1]) {
    sph(0.22, 0.4, 0.45, P.skinLight, [s * 0.58, 2.3, 3.0], head, 6);
    // temple bulges and glands
    sph(0.18, 0.2, 0.22, P.skin, [s * 0.66, 2.95, 3.1], head, 6);
    sph(0.05, 0.1, 0.1, P.skinDark, [s * 0.8, 2.9, 3.1], head, 5);
    // brow ridge
    box(0.34, 0.09, 0.3, P.skinDark, [s * 0.5, 3.0, 3.45], head, [-15, s * 10, 0]);
    // eye
    sph(0.07, 0.07, 0.07, P.eye, [s * 0.66, 2.85, 3.38], head, 6);
    sph(0.02, 0.02, 0.02, P.eyeShine, [s * 0.7, 2.88, 3.43], head, 4);
    // upper lid
    box(0.2, 0.04, 0.16, P.skinDark, [s * 0.64, 2.94, 3.38], head, [0, s * 20, s * 10]);
    // cheek wrinkles
    for (let i = 0; i < 3; i++)
      box(0.04, 0.03, 0.35 - i * 0.06, P.skinDark, [s * (0.78 - i * 0.02), 2.4 - i * 0.12, 3.0], head, [0, 0, s * 8]);
  }
  // forehead wrinkles
  for (let i = 0; i < 3; i++)
    box(0.7 - i * 0.12, 0.03, 0.05, P.skinDark, [0, 3.2 - i * 0.12, 3.4 + i * 0.0], head, [-30, 0, 0]);
  // dust patches
  for (let i = 0; i < 4; i++)
    sph(0.12, 0.04, 0.12, P.dust, [(R() - 0.5) * 0.9, 3.15 + R() * 0.1, 2.5 + R() * 0.5], head, 5);

  // trunk root collar
  b.part(new THREE.CylinderGeometry(0.34, 0.4, 0.12, 8), P.skinDark, { bone: head, at: [0, 2.0, 3.55], rotation: [-75, 0, 0], flat: true });

  // jaw
  b.frustumBox([0, 1.9, 3.0], [0, 1.85, 3.5], [0.8, 0.22], [0.5, 0.2], { bone: jaw, color: P.skin });
  box(0.6, 0.06, 0.45, P.mouth, [0, 2.02, 3.3], jaw);
  sph(0.22, 0.12, 0.15, P.skinLight, [0, 1.85, 3.55], jaw, 6);
  for (const s of [1, -1]) box(0.08, 0.1, 0.4, P.skinDark, [s * 0.38, 1.98, 3.3], jaw);

  // tusks
  for (const s of [1, -1]) {
    const base = [s * 0.38, 1.95, 3.4];
    const path = [base, [s * 0.5, 1.55, 3.7], [s * 0.6, 1.2, 4.1], [s * 0.6, 1.05, 4.55], [s * 0.55, 1.2, 4.95]];
    b.sweep(path, [0.1, 0.015], {
      bone: head, color: P.ivory, sides: 7, caps: { start: "flat", end: "point" },
      sectors: [[110, 250, P.ivoryShade, 0.3, 1]],
    });
    b.part(new THREE.CylinderGeometry(0.15, 0.17, 0.1, 8), P.skinDark, { bone: head, at: [s * 0.4, 1.9, 3.45], rotation: [-40, 0, s * 12], flat: true });
  }
}
```

<!-- call: fit-head -->

Tusks need to stay within y ≥ 1.5 and z ≤ 4.3. The skull, forehead and dust cap need to come down and move forward.

<<<<<<< SEARCH
  sph(0.72, 0.8, 0.9, P.skin, [0, 2.7, 2.75], head);
=======
  sph(0.72, 0.7, 0.85, P.skin, [0, 2.65, 2.9], head);
>>>>>>> REPLACE
<<<<<<< SEARCH
  sph(0.6, 0.45, 0.6, P.skin, [0, 3.1, 2.95], head);
=======
  sph(0.6, 0.4, 0.6, P.skin, [0, 3.0, 3.0], head);
>>>>>>> REPLACE
<<<<<<< SEARCH
  sph(0.5, 0.2, 0.55, P.dust, [0, 3.38, 2.9], head, 6);
=======
  sph(0.5, 0.16, 0.55, P.dust, [0, 3.22, 3.0], head, 6);
>>>>>>> REPLACE
<<<<<<< SEARCH
    const path = [base, [s * 0.5, 1.55, 3.7], [s * 0.6, 1.2, 4.1], [s * 0.6, 1.05, 4.55], [s * 0.55, 1.2, 4.95]];
    b.sweep(path, [0.1, 0.015], {
=======
    const path = [base, [s * 0.5, 1.78, 3.6], [s * 0.6, 1.66, 3.85], [s * 0.6, 1.64, 4.05], [s * 0.55, 1.72, 4.2]];
    b.sweep(path, [0.08, 0.012], {
>>>>>>> REPLACE

<!-- call: fit-tail -->

The six offending pieces are the rump wrinkle and dust patches, which stuck out past the box. I pulled them in toward the tail root and shrank them, so they now sit inside x ±0.3, y up to 2.6 and z up to -2.9.

<<<<<<< SEARCH
    b.part(new THREE.SphereGeometry(0.2, 6, 4), P.skinDark, {
      bone: J.hips,
      at: [s * 0.55, 2.25, -2.95],
      scale: [0.3, 1, 1.2],
    });
    b.part(new THREE.SphereGeometry(0.28, 6, 4), P.dust, {
      bone: J.hips,
      at: [s * 0.5, 2.75, -2.85],
      scale: [1.3, 0.4, 1.1],
    });
    b.part(new THREE.SphereGeometry(0.22, 6, 4), P.dust, {
      bone: J.hips,
      at: [s * 0.2, 2.9, -2.65],
      scale: [1.4, 0.4, 1],
    });
=======
    b.part(new THREE.SphereGeometry(0.1, 6, 4), P.skinDark, {
      bone: J.hips,
      at: [s * 0.2, 2.0, -3.0],
      scale: [0.4, 1, 0.8],
    });
    b.part(new THREE.SphereGeometry(0.1, 6, 4), P.dust, {
      bone: J.hips,
      at: [s * 0.18, 2.48, -3.0],
      scale: [1.2, 0.4, 0.9],
    });
    b.part(new THREE.SphereGeometry(0.08, 6, 4), P.dust, {
      bone: J.hips,
      at: [s * 0.1, 2.52, -3.05],
      scale: [1.2, 0.4, 0.8],
    });
>>>>>>> REPLACE

<!-- call: fit-legs -->

The legs were too wide and too tall at the hips, and the front feet and nails stuck out past the box. I fixed this by pulling the leg x-position in, narrowing the radii, lowering the hip tops, shrinking the thigh bulge and shortening the front leg z-position.

<<<<<<< SEARCH
    const x = L.s * 0.8;
    const z = L.front ? 1.8 : -1.7;
    const rTop = L.front ? 0.5 : 0.46;
    const rMid = L.front ? 0.4 : 0.36;
    const rLow = L.front ? 0.38 : 0.34;
=======
    const x = L.s * 0.75;
    const z = L.front ? 1.7 : -1.7;
    const rTop = L.front ? 0.38 : 0.36;
    const rMid = L.front ? 0.34 : 0.32;
    const rLow = L.front ? 0.32 : 0.3;
>>>>>>> REPLACE
<<<<<<< SEARCH
    const top: [number, number, number] = [x, hipP[1] + 0.15, hipP[2]];
=======
    const top: [number, number, number] = [x, hipP[1] + 0.05, z];
>>>>>>> REPLACE
<<<<<<< SEARCH
    const fr = rLow + 0.12;
=======
    const fr = rLow + 0.08;
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.part(new THREE.SphereGeometry(rTop * 1.05, 8, 6), P.skin, { bone: hip, at: [x + L.s * 0.05, hipP[1] - 0.1, hipP[2]], scale: [1, 1.1, 1.1] });
=======
    b.part(new THREE.SphereGeometry(rTop * 0.95, 8, 6), P.skin, { bone: hip, at: [x, hipP[1] - 0.1, z], scale: [1, 1, 1] });
>>>>>>> REPLACE

<!-- call: fit-ears -->

The ears were too deep and too tall for the box, so I compressed them (depth ×0.5, height ×0.8) to fit it. Here is the whole function again with that scaling applied to the outline, rim, veins, dust patches and tip shade.

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildEars({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const SU = 0.5, SV = 0.8;
  for (const s of [1, -1]) {
    const bone = s > 0 ? J.earL : J.earR;
    const root = M[s > 0 ? "earRootL" : "earRootR"];
    const ox = root[0], oy = root[1], oz = root[2];
    const outline: any[] = [
      [0, 0.15, "sharp"],
      [0.1, 0.35],
      [0.55, 0.45],
      [1.05, 0.35],
      [1.5, 0.1],
      [1.62, -0.35],
      [1.4, -0.95],
      [1.0, -1.45],
      [0.6, -1.78],
      [0.4, -1.9],
      [0.28, -1.6],
      [0.1, -1.0],
      [0, -0.4],
    ];
    const at: [number, number, number] = [ox + s * 0.1, oy, oz];
    const X: [number, number, number] = [0, 0, -1];
    const Y: [number, number, number] = [s * 0.25, 1, 0];
    const mk = (col: string, th: number, shift: number, scale = 1) => {
      const o = outline.map((p) => (p.length === 3 ? [p[0] * scale * SU, p[1] * scale * SV, "sharp"] : [p[0] * scale * SU, p[1] * scale * SV]));
      return b.extrude(o, {
        at: [at[0] + s * shift, at[1], at[2]],
        x: X,
        y: Y,
        thickness: th,
        bevel: 0.01,
        smoothing: 1,
        color: col,
        bone,
      });
    };
    mk(P.skin, 0.07, 0);
    mk(P.earInner, 0.02, s * 0.04, 0.9);
    b.capsule([ox, oy + 0.05, oz], [ox + s * 0.3, oy - 0.05, oz - 0.3], 0.14, P.skinDark, { bone });
    const rim = [
      [0.05, 0.2],
      [0.5, 0.45],
      [1.05, 0.36],
      [1.5, 0.11],
      [1.62, -0.35],
    ];
    const pts = rim.map(([u, v]) => [at[0] + s * 0.02, at[1] + v * SV, at[2] - u * SU] as [number, number, number]);
    b.sweep(pts, [0.06, 0.04], { color: P.skinDark, bone, sides: 6 });
    const fx = at[0] + s * 0.09;
    const origin: [number, number, number] = [fx, oy + 0.05, oz - 0.05];
    const tips = [
      [0.55, 0.38], [1.0, 0.3], [1.4, 0.05], [1.5, -0.4], [1.25, -0.95], [0.9, -1.4], [0.5, -1.7], [0.3, -1.1],
    ];
    for (const [u0, v0] of tips) {
      const u = u0 * SU, v = v0 * SV;
      const tip: [number, number, number] = [fx, oy + v, oz - u];
      const m: [number, number, number] = [fx, oy + v * 0.5 + 0.02, oz - u * 0.5 + (R() - 0.5) * 0.03];
      b.sweep([origin, m, tip], [0.025, 0.008], { color: P.earVein, bone, sides: 5 });
      const bp: [number, number, number] = [fx, oy + v * 0.75, oz - u * 0.75];
      const bt: [number, number, number] = [fx, oy + v * 0.75 - 0.14, oz - u * 0.75 - 0.1];
      b.rod(bp, bt, [0.012, 0.005], P.earVein, { bone, sides: 5 });
    }
    for (let i = 0; i < 5; i++) {
      const u = (0.4 + R() * 0.9) * SU, v = (-0.2 - R() * 1.0) * SV;
      b.part(new THREE.CylinderGeometry(0.08 + R() * 0.05, 0.1, 0.02, 6), P.dust, {
        bone,
        at: [at[0] - s * 0.045, oy + v, oz - u],
        dir: [s, 0, 0],
      });
    }
    b.part(new THREE.ConeGeometry(0.08, 0.2, 6), P.skinDark, {
      bone,
      at: [at[0], oy - 1.4, oz - 0.25],
      dir: [0, -1, -0.15],
    });
  }
}
```

<!-- call: fit-body -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildBody({ b, J, P }: any) {
  const R = rng(5);
  const bones = [J.hips, J.spine1, J.spine2, J.neck];

  const st = [
    { at: [0, 2.2, -2.85], w: 1.4, h: 1.4 },
    { at: [0, 2.25, -2.3], w: 2.0, h: 1.7 },
    { at: [0, 2.25, -1.2], w: 2.4, h: 1.75 },
    { at: [0, 2.25, 0.0], w: 2.5, h: 1.75 },
    { at: [0, 2.3, 1.0], w: 2.4, h: 1.7 },
    { at: [0, 2.4, 1.7], w: 1.7, h: 1.45 },
    { at: [0, 2.45, 2.05], w: 1.3, h: 1.3 },
  ];
  b.loft(st, { bone: bones, color: P.skin, sides: 8, caps: "flat" });

  b.loft(
    [
      { at: [0, 1.6, -2.2], w: 1.6, h: 0.4 },
      { at: [0, 1.6, -1.2], w: 1.9, h: 0.4 },
      { at: [0, 1.6, 0.0], w: 2.0, h: 0.4 },
      { at: [0, 1.6, 1.0], w: 1.9, h: 0.4 },
    ],
    { bone: bones, color: P.skinLight, sides: 8, caps: "flat" },
  );

  b.loft(
    [
      { at: [0, 3.05, -2.0], w: 0.9, h: 0.2 },
      { at: [0, 3.05, -0.6], w: 1.2, h: 0.2 },
      { at: [0, 3.05, 0.9], w: 1.2, h: 0.2 },
      { at: [0, 3.0, 1.7], w: 0.9, h: 0.2 },
    ],
    { bone: bones, color: P.dust, sides: 6, caps: "flat" },
  );

  for (const s of [1, -1]) {
    const sp = (x: number, y: number, z: number, r: number, bone: any, c: string) =>
      b.part(new THREE.IcosahedronGeometry(r, 1), c, { bone, at: [x, y, z], scale: [0.8, 1.1, 1] });
    sp(s * 0.95, 2.1, 1.7, 0.4, J.spine2, P.skin);
    sp(s * 0.95, 2.2, -1.7, 0.4, J.hips, P.skin);
    sp(s * 0.9, 1.75, 1.7, 0.4, J.spine2, P.skinLight);
    sp(s * 0.9, 1.75, -1.7, 0.4, J.hips, P.skinLight);

    for (let i = 0; i < 6; i++) {
      const z = -2 + i * 0.7;
      b.part(new THREE.BoxGeometry(0.06, 0.9 + R() * 0.3, 0.08), P.skinDark, {
        bone: z > 0.9 ? J.spine2 : z > -0.4 ? J.spine1 : J.hips,
        at: [s * 1.22, 2.2, z],
        rotation: [0, 0, s * 5],
      });
    }
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.IcosahedronGeometry(0.22 + R() * 0.1, 0), P.dust, {
        bone: J.spine1,
        at: [s * (1.05 + R() * 0.05), 1.7 + R() * 0.5, -1 + i * 1.1],
        scale: [0.35, 1, 1],
      });
    }
  }

  for (let i = 0; i < 3; i++) {
    b.part(new THREE.TorusGeometry(0.6 - i * 0.03, 0.04, 4, 8), P.skinDark, {
      bone: J.neck,
      at: [0, 2.45, 1.5 + i * 0.15],
    });
  }
}
```