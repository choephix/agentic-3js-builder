<!-- call: plan -->

```json
{
  "name": "Cathedral Gargoyle",
  "description": "A hunched gothic stone gargoyle crouched on a weathered cathedral ledge, with bat wings folded up, horned head, fanged jaw and curling tail.",
  "builderName": "gargoyle",
  "size": [1.5, 1.35, 1.5],
  "layout": "Crouched on a stone ledge slab (top at y=0.18) facing +Z. Haunches and bent hind legs at the back (z about -0.3), a heavy hunched torso rising forward to broad shoulders (z about 0.1), arms straight down in front with clawed hands gripping the ledge edge (z about 0.45). A thick neck juts forward and up to a large head at z about 0.55 and y about 1.0 with brow ridge, horns, pointed ears, a separate upper and lower jaw with fangs, and glowing amber eyes under the brow. Bat wings with finger bones and stone membranes rise from the shoulders and fold upward and back, tips at y about 1.35. The tail curls from the rump around the left side of the ledge. Everything is chunky, faceted stone in grey tones with moss on upward faces, soot and rain streaks below, and chiselled details such as brow lines, claws, ribs and cracks as small separate parts.",
  "palette": {
    "stone": "#8a8c8a",
    "stoneLight": "#a9aba6",
    "stoneDark": "#5d605f",
    "stoneShadow": "#43474a",
    "ledge": "#77797a",
    "ledgeTop": "#8f918d",
    "moss": "#5f7a3a",
    "mossDark": "#43592a",
    "soot": "#2d2f31",
    "membrane": "#6d7072",
    "membraneRib": "#4f5355",
    "horn": "#c9c3ae",
    "fang": "#e6e0cc",
    "eyeGlow": "#ffb52e",
    "eyeDark": "#2a1a08",
    "crack": "#303335"
  },
  "mounts": {
    "ledgeTop": [0, 0.18, 0],
    "pelvis": [0, 0.5, -0.3],
    "chest": [0, 0.72, 0.1],
    "neckBase": [0, 0.85, 0.28],
    "headCenter": [0, 1.0, 0.55],
    "shoulderL": [0.26, 0.82, 0.1],
    "shoulderR": [-0.26, 0.82, 0.1],
    "wingRootL": [0.18, 0.95, -0.02],
    "wingRootR": [-0.18, 0.95, -0.02],
    "hipL": [0.24, 0.45, -0.35],
    "hipR": [-0.24, 0.45, -0.35],
    "handL": [0.28, 0.2, 0.45],
    "handR": [-0.28, 0.2, 0.45],
    "tailBase": [0, 0.4, -0.55]
  },
  "joints": [
    { "name": "pelvis", "at": [0, 0.5, -0.3], "dir": [0, 0.4, 1], "role": "spine" },
    { "name": "chest", "parent": "pelvis", "at": [0, 0.65, 0.0], "dir": [0, 0.5, 1], "role": "spine" },
    { "name": "neck", "parent": "chest", "at": [0, 0.85, 0.28], "dir": [0, 0.5, 1], "role": "neck" },
    { "name": "head", "parent": "neck", "at": [0, 0.95, 0.45], "dir": [0, 0, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 0.92, 0.5], "dir": [0, 0, 1], "role": "jaw" },
    { "name": "shoulderL", "parent": "chest", "at": [0.26, 0.82, 0.1], "dir": [0, -1, 0.3], "role": "arm", "group": "arms" },
    { "name": "shoulderR", "parent": "chest", "at": [-0.26, 0.82, 0.1], "dir": [0, -1, 0.3], "role": "arm", "group": "arms" },
    { "name": "hipL", "parent": "pelvis", "at": [0.24, 0.45, -0.35], "dir": [0, -1, 0.5], "role": "leg", "group": "legs" },
    { "name": "hipR", "parent": "pelvis", "at": [-0.24, 0.45, -0.35], "dir": [0, -1, 0.5], "role": "leg", "group": "legs" },
    { "name": "wingL", "parent": "chest", "at": [0.18, 0.95, -0.02], "dir": [1, 1, -0.5], "role": "wing", "group": "wings" },
    { "name": "wingR", "parent": "chest", "at": [-0.18, 0.95, -0.02], "dir": [-1, 1, -0.5], "role": "wing", "group": "wings" },
    { "name": "tail1", "parent": "pelvis", "at": [0, 0.4, -0.55], "dir": [0, 0, -1], "role": "tail", "group": "tail" }
  ],
  "parts": [
    {
      "id": "ledge",
      "builds": "The stone ledge slab: a chunky gothic corbel block with chamfered front edge, carved moulding bands, a dentil row of small blocks along the front, cracks, chips, moss on top and soot streaks on the sides, plus a small drip-stone lip. Wider than the gargoyle's footprint. Colours: ledge, ledgeTop, stoneDark, moss, soot, crack.",
      "box": [[-0.75, 0, -0.75], [0.75, 0.18, 0.75]],
      "attaches": "Top surface at mount ledgeTop; the feet, hands and tail rest on it.",
      "joints": [],
      "floor": true,
      "budget": 120
    },
    {
      "id": "torso",
      "builds": "Hunched torso and haunches: chest loft with ribs and spine ridge of chiselled bumps, pelvis, tail with six segments curling around the ledge with a spade tip, plus bent hind legs (thigh, shin, foot) with three-toed clawed feet gripping the ledge. Chisel marks, cracks, moss on the back, soot below. Colours: stone, stoneLight, stoneDark, moss, soot, horn for claws.",
      "box": [[-0.5, 0.18, -0.75], [0.5, 0.95, 0.3]],
      "attaches": "Neck at mount neckBase, arms at shoulderL/R, wings at wingRootL/R, hips at hipL/R, tail from tailBase.",
      "joints": ["pelvis", "chest", "hipL", "hipR", "tail1"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "head",
      "builds": "The large head and neck: thick neck, boxy skull, heavy brow ridge, snout with nostrils, separate upper and lower jaw with rows of fangs and tusks, tongue, two big glowing amber eyes with dark pupils under the brow, two curved horns, large pointed ears with inner detail, cheek ridges, chin beard of stone blocks, cracks and moss on top of the skull. Colours: stone, stoneLight, stoneShadow, horn, fang, eyeGlow, eyeDark, moss.",
      "box": [[-0.35, 0.8, 0.25], [0.35, 1.3, 0.8]],
      "attaches": "Neck joint at neckBase, head joint at headCenter, jaw joint under the skull.",
      "joints": ["neck", "head", "jaw"],
      "floor": false,
      "budget": 230
    },
    {
      "id": "arms",
      "builds": "Both muscular arms: shoulder mass, upper arm, forearm, wrist, big hands with three clawed fingers and a thumb, planted on the ledge at the front edge with claws curling over it. Knuckle and tendon details, armour-like chiselled ridges, cracks, moss on shoulders, soot on hands. Mirrored left and right. Colours: stone, stoneLight, stoneDark, horn, moss, soot.",
      "box": [[-0.45, 0.18, 0.0], [0.45, 0.95, 0.55]],
      "attaches": "Roots at shoulderL/R joints; hands rest on ledgeTop at handL/R.",
      "joints": ["shoulderL", "shoulderR"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "wings",
      "builds": "Two bat wings folded up and back: arm bone, wrist knuckle with claw, four finger bones fanning out, stone membranes between them with scalloped trailing edges, carved rib lines and cracks, chipped tips, moss on upper edges. Tips reach about y=1.35 and x=±0.7. Colours: membrane, membraneRib, stone, horn, moss, soot.",
      "box": [[-0.75, 0.85, -0.55], [0.75, 1.35, 0.05]],
      "attaches": "Roots at wingRootL/R on the chest joint; wing joints at those mounts.",
      "joints": ["wingL", "wingR"],
      "floor": false,
      "budget": 180
    }
  ]
}
```

<!-- call: ledge -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildLedge({ b, P }: any) {
  const r = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });

  // main block, chamfered top front edge
  box(1.5, 0.14, 1.5, P.ledge, 0, 0.07, 0);
  // top slab
  box(1.5, 0.04, 1.4, P.ledgeTop, 0, 0.16, -0.05);
  // chamfer along the front (rotated box)
  b.part(new THREE.BoxGeometry(1.5, 0.05, 0.05), P.ledgeTop, { at: [0, 0.165, 0.71], rotation: [45, 0, 0] });
  // moulding bands
  box(1.54, 0.025, 1.54, P.stoneDark, 0, 0.0125 + 0.0, 0);
  box(1.52, 0.02, 1.52, P.stoneDark, 0, 0.105, 0);
  box(1.52, 0.012, 1.52, P.crack, 0, 0.12, 0);
  // drip-stone lip at front
  box(1.56, 0.03, 0.06, P.ledgeTop, 0, 0.1, 0.77 - 0.0);
  // dentil row
  for (let i = 0; i < 14; i++) {
    const x = -0.65 + i * 0.1;
    box(0.06, 0.035, 0.04, P.ledgeTop, x, 0.075, 0.765);
    box(0.06, 0.035, 0.04, P.ledgeTop, x, 0.075, -0.765);
  }
  for (let i = 0; i < 12; i++) {
    const z = -0.6 + i * 0.11;
    box(0.04, 0.035, 0.06, P.ledgeTop, 0.765, 0.075, z);
    box(0.04, 0.035, 0.06, P.ledgeTop, -0.765, 0.075, z);
  }
  // moss patches on top
  for (let i = 0; i < 16; i++) {
    const x = (r() - 0.5) * 1.3, z = (r() - 0.5) * 1.3;
    const s = 0.05 + r() * 0.1;
    b.part(new THREE.CylinderGeometry(s, s * 1.1, 0.012, 6), i % 3 ? P.moss : P.mossDark, { at: [x, 0.184, z], rotation: [0, r() * 90, 0] });
  }
  // soot streaks on sides
  for (let i = 0; i < 10; i++) {
    const x = (r() - 0.5) * 1.3, h = 0.05 + r() * 0.07;
    box(0.025 + r() * 0.03, h, 0.01, P.soot, x, 0.15 - h / 2, 0.755);
    box(0.025 + r() * 0.03, h, 0.01, P.soot, x, 0.15 - h / 2, -0.755);
    box(0.01, h, 0.03, P.soot, 0.755, 0.15 - h / 2, (r() - 0.5) * 1.3);
    box(0.01, h, 0.03, P.soot, -0.755, 0.15 - h / 2, (r() - 0.5) * 1.3);
  }
  // cracks on top
  for (let i = 0; i < 6; i++) {
    const x = (r() - 0.5) * 1.2, z = (r() - 0.5) * 1.2;
    b.part(new THREE.BoxGeometry(0.01, 0.004, 0.2 + r() * 0.2), P.crack, { at: [x, 0.183, z], rotation: [0, r() * 180, 0] });
  }
  // chips at corners
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.08, 0.05, 0.08), P.stoneDark, { at: [sx * 0.73, 0.17, sz * 0.73], rotation: [20, 45, 20] });
  }
}
```

<!-- call: wings -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildWings({ b, J, P, M }: Ctx) {
  const R = rng(11);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const root = J["wing" + side];
    const sh: [number, number, number] = [s * 0.2, 0.95, -0.02];
    const elbow: [number, number, number] = [s * 0.42, 1.08, -0.2];
    const wrist: [number, number, number] = [s * 0.55, 1.2, -0.12];
    // arm bones
    b.rod(sh, elbow, 0.03, P.stone, { bone: root });
    b.rod(elbow, wrist, 0.026, P.stoneLight, { bone: root });
    b.part(new THREE.IcosahedronGeometry(0.04, 0), P.stoneDark, { at: sh, bone: root });
    b.part(new THREE.IcosahedronGeometry(0.04, 0), P.stoneDark, { at: elbow, bone: root });
    b.part(new THREE.IcosahedronGeometry(0.045, 0), P.stoneLight, { at: wrist, bone: root });
    b.spike(wrist, [0, 1, 0.5], 0.1, 0.018, { color: P.horn, bone: root });
    // finger tips
    const tips: [number, number, number][] = [
      [s * 0.7, 1.35, -0.1],
      [s * 0.66, 1.28, -0.3],
      [s * 0.55, 1.12, -0.46],
      [s * 0.38, 0.95, -0.5],
    ];
    tips.forEach((t, i) => {
      const mid: [number, number, number] = [(wrist[0] + t[0]) / 2, (wrist[1] + t[1]) / 2 + 0.03, (wrist[2] + t[2]) / 2];
      b.rod(wrist, mid, [0.02, 0.015], P.stoneDark, { bone: root });
      b.rod(mid, t, [0.015, 0.006], P.membraneRib, { bone: root });
      b.part(new THREE.SphereGeometry(0.014, 5, 4), P.stoneLight, { at: mid, bone: root });
      if (i === 0) b.spike(t, [s * 0.5, 0.6, 0], 0.05, 0.01, { color: P.horn, bone: root });
    });
    // membranes between fingers
    for (let i = 0; i < 3; i++) {
      const a = tips[i], c = tips[i + 1];
      const am = [(wrist[0] + a[0]) / 2, (wrist[1] + a[1]) / 2, (wrist[2] + a[2]) / 2];
      const cm = [(wrist[0] + c[0]) / 2, (wrist[1] + c[1]) / 2, (wrist[2] + c[2]) / 2];
      const scal: [number, number, number] = [
        (a[0] + c[0]) / 2 - s * 0.03,
        (a[1] + c[1]) / 2 - 0.07,
        (a[2] + c[2]) / 2 - 0.02,
      ];
      b.slab([wrist, a, scal, c], { color: P.membrane, thickness: 0.014, bone: root });
      b.rod(wrist, scal, 0.005, P.membraneRib, { bone: root });
      // moss on upper edge
      b.part(new THREE.IcosahedronGeometry(0.02 + R() * 0.012, 0), P.moss, {
        at: [am[0], am[1] + 0.025, am[2]],
        bone: root,
      });
      void cm;
    }
    // inner membrane to body
    b.slab([sh, elbow, wrist, tips[3], [s * 0.2, 0.8, -0.3]], { color: P.membrane, thickness: 0.014, bone: root });
    b.rod(elbow, tips[3], 0.005, P.membraneRib, { bone: root });
    // cracks and chips
    for (let k = 0; k < 3; k++) {
      const t = tips[k];
      b.rod([t[0] - s * 0.1, t[1] - 0.1 - k * 0.01, t[2] - 0.05], [t[0] - s * 0.14, t[1] - 0.17, t[2] - 0.06], 0.004, P.crack, {
        bone: root,
      });
    }
    b.part(new THREE.TetrahedronGeometry(0.025), P.soot, { at: [s * 0.45, 1.0, -0.38], bone: root });
    b.part(new THREE.IcosahedronGeometry(0.03, 0), P.moss, { at: [s * 0.4, 1.12, -0.2], bone: root });
  }
}
```

<!-- call: arms -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildArms({ b, J, P, M }: any) {
  const R = rng(11);
  const geo = {
    sph: (r: number, w = 7, h = 5) => new THREE.SphereGeometry(r, w, h),
    box: (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z),
    cone: (r: number, h: number, s = 5) => new THREE.ConeGeometry(r, h, s),
  };
  for (const s of [1, -1]) {
    const bone = s > 0 ? J.shoulderL : J.shoulderR;
    const sx = s * 0.27;
    // shoulder mass
    b.part(geo.sph(0.15, 8, 6), P.stone, { bone, at: [sx, 0.82, 0.1], scale: [1.1, 0.9, 1] });
    b.part(geo.sph(0.09, 6, 4), P.moss, { bone, at: [sx, 0.93, 0.08], scale: [1.3, 0.5, 1.1] });
    b.part(geo.sph(0.05, 6, 4), P.mossDark, { bone, at: [sx + s * 0.05, 0.96, 0.14], scale: [1.2, 0.4, 1] });
    // armour ridges
    for (let i = 0; i < 3; i++)
      b.part(geo.box(0.05, 0.03, 0.2), P.stoneLight, { bone, at: [sx + s * 0.1, 0.86 - i * 0.04, 0.1], rotation: [0, 0, s * (20 + i * 8)] });
    // upper arm
    b.rod([sx, 0.8, 0.1], [sx + s * 0.03, 0.55, 0.22], [0.095, 0.08], { bone, color: P.stone, section: { ngon: 6 } });
    // elbow
    b.part(geo.sph(0.085, 6, 5), P.stoneDark, { bone, at: [sx + s * 0.04, 0.54, 0.2] });
    b.part(geo.cone(0.035, 0.09, 4), P.stoneLight, { bone, at: [sx + s * 0.1, 0.54, 0.16], rotation: [0, 0, -s * 90] });
    // forearm
    b.rod([sx + s * 0.03, 0.54, 0.22], [sx + s * 0.01, 0.26, 0.42], [0.08, 0.06], { bone, color: P.stone, section: { ngon: 6 } });
    // tendons
    for (const o of [-0.03, 0.03])
      b.rod([sx + o + s * 0.02, 0.5, 0.3], [sx + o, 0.3, 0.42], 0.012, { bone, color: P.stoneDark });
    b.part(geo.box(0.12, 0.02, 0.04), P.stoneDark, { bone, at: [sx + s * 0.03, 0.42, 0.33], rotation: [-35, 0, 0] });
    b.part(geo.box(0.02, 0.1, 0.02), P.crack, { bone, at: [sx + s * 0.08, 0.66, 0.2], rotation: [0, 0, s * 15] });
    // wrist
    b.part(geo.sph(0.06, 6, 4), P.stoneDark, { bone, at: [sx, 0.24, 0.44] });
    // hand
    b.part(geo.box(0.15, 0.07, 0.12), P.stone, { bone, at: [sx, 0.22, 0.5] });
    b.part(geo.box(0.13, 0.03, 0.09), P.soot, { bone, at: [sx, 0.19, 0.51] });
    // fingers with knuckles and claws
    for (let i = 0; i < 3; i++) {
      const fx = sx + (i - 1) * 0.052;
      b.part(geo.sph(0.03, 5, 4), P.stoneLight, { bone, at: [fx, 0.25, 0.55] });
      b.rod([fx, 0.22, 0.55], [fx, 0.2, 0.64], [0.026, 0.02], { bone, color: P.stone, section: { ngon: 5 } });
      b.rod([fx, 0.2, 0.64], [fx, 0.12, 0.69], [0.02, 0.006], { bone, color: P.stone, section: { ngon: 5 } });
      b.spike([fx, 0.12, 0.69], [0, -0.5, 0.3], 0.07, 0.016, { bone, color: P.horn });
    }
    // thumb
    const tx = sx - s * 0.09;
    b.rod([tx + s * 0.03, 0.22, 0.47], [tx - s * 0.02, 0.2, 0.55], [0.03, 0.022], { bone, color: P.stone, section: { ngon: 5 } });
    b.spike([tx - s * 0.02, 0.2, 0.55], [0, -0.3, 1], 0.07, 0.018, { bone, color: P.horn });
    // soot streaks and chips
    for (let i = 0; i < 3; i++)
      b.part(geo.box(0.012, 0.05 + R() * 0.05, 0.01), P.soot, { bone, at: [sx + (R() - 0.5) * 0.12, 0.3 + R() * 0.1, 0.46 + R() * 0.08] });
  }
}
```

<!-- call: torso -->

```ts
import * as THREE from "three";
import { rng, catmull, limb } from "agentic-3js-builder";

export function buildTorso({ b, J, P, M }: any) {
  const r = rng(11);
  const STONE = P.stone, LIGHT = P.stoneLight, DARK = P.stoneDark, MOSS = P.moss, SOOT = P.soot, HORN = P.horn, CRACK = P.crack;

  // Torso loft from pelvis to chest along the spine
  const spine = catmull([[0, 0.5, -0.4], [0, 0.58, -0.2], [0, 0.7, 0.0], [0, 0.82, 0.15]]);
  const body = b.loft(
    [
      { at: [0, 0.5, -0.4], w: 0.38, h: 0.34 },
      { at: [0, 0.56, -0.25], w: 0.5, h: 0.42 },
      { at: [0, 0.68, -0.05], w: 0.62, h: 0.5 },
      { at: [0, 0.8, 0.14], w: 0.56, h: 0.42 },
    ],
    { bone: [J.pelvis, J.chest], color: STONE, sides: 8 } as any,
  );

  // Pale belly and moss back
  b.part(new THREE.BoxGeometry(0.34, 0.2, 0.4), DARK, { bone: J.pelvis, at: [0, 0.42, -0.1] });
  b.part(new THREE.BoxGeometry(0.4, 0.06, 0.4), MOSS, { bone: J.chest, at: [0, 0.93, -0.08], rotation: [-10, 0, 0] });
  b.part(new THREE.BoxGeometry(0.2, 0.05, 0.2), MOSS, { bone: J.chest, at: [0.15, 0.9, 0.08], rotation: [0, 20, 8] });
  b.part(new THREE.BoxGeometry(0.2, 0.05, 0.2), P.mossDark, { bone: J.pelvis, at: [-0.1, 0.72, -0.35], rotation: [0, 30, 0] });

  // Shoulder masses
  for (const s of [1, -1]) {
    b.part(new THREE.IcosahedronGeometry(0.15, 0), LIGHT, { bone: J.chest, at: [s * 0.27, 0.82, 0.08], flat: true });
    b.part(new THREE.IcosahedronGeometry(0.1, 0), MOSS, { bone: J.chest, at: [s * 0.28, 0.93, 0.08], flat: true });
  }

  // Spine ridge bumps
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const p = spine.at(t);
    const sz = 0.05 - t * 0.012;
    b.part(new THREE.ConeGeometry(sz, 0.1, 5), i % 2 ? LIGHT : STONE, {
      bone: t < 0.5 ? J.pelvis : J.chest,
      at: [0, p.y + 0.22 + t * 0.06, p.z],
      rotation: [-15, 0, 0],
      flat: true,
    });
  }

  // Ribs on each side
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.BoxGeometry(0.03, 0.05, 0.14), DARK, {
        bone: J.chest,
        at: [s * 0.3, 0.64 + i * 0.01, -0.12 + i * 0.1],
        rotation: [0, 0, s * 12],
      });
    }

  // Chisel cracks and soot streaks
  for (let i = 0; i < 6; i++) {
    const x = (r() - 0.5) * 0.5;
    b.part(new THREE.BoxGeometry(0.012, 0.12, 0.012), CRACK, {
      bone: J.chest, at: [x, 0.78, 0.2 - r() * 0.4], rotation: [0, 0, (r() - 0.5) * 60],
    });
    b.part(new THREE.BoxGeometry(0.03, 0.14, 0.01), SOOT, {
      bone: J.pelvis, at: [(r() - 0.5) * 0.6, 0.44, -0.2 + r() * 0.3],
    });
  }

  // Haunches and hind legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipJ = s > 0 ? J.hipL : J.hipR;
    b.part(new THREE.IcosahedronGeometry(0.17, 0), STONE, { bone: J.pelvis, at: [s * 0.26, 0.45, -0.36], flat: true });
    const pts = limb([s * 0.24, 0.45, -0.35], [s * 0.26, 0.24, -0.1], [0.3, 0.3], [[0, 0, 1]]);
    const leg = b.chain("torsoLeg" + side, pts, { parent: hipJ, names: ["torsoThigh" + side, "torsoShin" + side, "torsoAnkle" + side], role: "leg" } as any);
    b.sweep(leg, [0.1, 0.06], { color: STONE });
    b.part(new THREE.IcosahedronGeometry(0.075, 0), LIGHT, { bone: hipJ, at: pts[1], flat: true });
    // foot
    b.part(new THREE.BoxGeometry(0.14, 0.06, 0.2), DARK, { bone: hipJ, at: [s * 0.26, 0.21, -0.04] });
    for (let k = -1; k <= 1; k++) {
      b.part(new THREE.BoxGeometry(0.04, 0.04, 0.12), STONE, { bone: hipJ, at: [s * 0.26 + k * 0.05, 0.21, 0.1] });
      b.part(new THREE.ConeGeometry(0.02, 0.07, 6), HORN, { bone: hipJ, at: [s * 0.26 + k * 0.05, 0.2, 0.18], rotation: [90, 0, 0] });
    }
  }

  // Tail: six segments curling to the left (+X), spade tip
  const tailPts: number[][] = [[0, 0.4, -0.55], [0, 0.34, -0.7], [0.15, 0.28, -0.8], [0.4, 0.26, -0.78], [0.6, 0.25, -0.6], [0.62, 0.25, -0.4], [0.5, 0.25, -0.28]];
  const tail = b.chain("torsoTail", catmull(tailPts), { parent: J.tail1, count: 6, role: "tail" } as any);
  b.sweep(tail, (t: number) => 0.075 * (1 - t) + 0.025, { color: STONE });
  b.along(tail, 6, (at: any) => b.part(new THREE.ConeGeometry(0.03, 0.06, 5), LIGHT, { frame: at, bone: at.bone }));
  const end = tail.at(1);
  b.part(new THREE.OctahedronGeometry(0.07, 0), DARK, { bone: tail.joints[tail.joints.length - 1], at: end.at, scale: [1.3, 0.35, 1], flat: true });
  b.part(new THREE.BoxGeometry(0.12, 0.03, 0.03), MOSS, { bone: J.tail1, at: [0, 0.44, -0.62] });
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildHead({ b, J, P, M }: Ctx) {
  const r = rng(11);
  const head = J.head, jaw = J.jaw, neck = J.neck;
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const sph = (rad: number, s = 8, t = 6) => new THREE.SphereGeometry(rad, s, t);
  const cone = (rad: number, h: number, s = 6) => new THREE.ConeGeometry(rad, h, s);

  // Neck
  b.rod([0, 0.84, 0.26], [0, 0.97, 0.46], [0.17, 0.15], P.stone, { bone: neck, sides: 8 });
  b.part(box(0.3, 0.06, 0.1), P.stoneDark, { bone: neck, at: [0, 0.8, 0.3] });
  b.part(box(0.26, 0.05, 0.08), P.moss, { bone: neck, at: [0, 0.96, 0.33] });
  for (let i = 0; i < 3; i++) b.part(box(0.2 - i * 0.02, 0.04, 0.06), P.stoneLight, { bone: neck, at: [0, 0.9 + i * 0.03, 0.36 + i * 0.03] });

  // Skull
  b.part(box(0.46, 0.34, 0.4), P.stone, { bone: head, at: [0, 1.0, 0.54] });
  b.part(box(0.4, 0.06, 0.34), P.stoneLight, { bone: head, at: [0, 1.19, 0.54] });
  b.part(box(0.3, 0.03, 0.22), P.moss, { bone: head, at: [0, 1.225, 0.52] });
  b.part(box(0.1, 0.025, 0.1), P.moss, { bone: head, at: [0.1, 1.24, 0.46] });
  // Brow ridge
  b.part(box(0.5, 0.07, 0.1), P.stoneDark, { bone: head, at: [0, 1.1, 0.72] });
  for (const s of [1, -1]) {
    b.part(box(0.2, 0.06, 0.1), P.stoneShadow, { bone: head, at: [s * 0.13, 1.12, 0.73], rotation: [0, 0, s * -14] });
    // Cheeks
    b.part(box(0.07, 0.14, 0.26), P.stoneLight, { bone: head, at: [s * 0.25, 0.95, 0.56] });
    b.part(box(0.05, 0.04, 0.2), P.stoneShadow, { bone: head, at: [s * 0.27, 0.99, 0.56] });
    // Eyes
    b.part(sph(0.05, 8, 6), P.eyeDark, { bone: head, at: [s * 0.12, 1.04, 0.725] });
    const e = b.part(sph(0.042, 8, 6), P.eyeGlow, { bone: head, at: [s * 0.12, 1.04, 0.745] });
    b.part(box(0.014, 0.05, 0.01), P.eyeDark, { bone: head, at: [s * 0.12, 1.04, 0.786] });
    // Ears
    b.part(cone(0.07, 0.25, 4), P.stone, { bone: head, at: [s * 0.27, 1.25, 0.44], rotation: [-10, 45, s * -35] });
    b.part(cone(0.04, 0.17, 4), P.stoneShadow, { bone: head, at: [s * 0.265, 1.24, 0.47], rotation: [-10, 45, s * -35] });
    // Horns
    const horn = [[s * 0.15, 1.17, 0.5], [s * 0.26, 1.3, 0.42], [s * 0.3, 1.3, 0.3]];
    b.sweep(horn, [0.05, 0.004], { bone: head, color: P.horn, sides: 6 });
    b.part(new THREE.CylinderGeometry(0.058, 0.065, 0.04, 6), P.stoneDark, { bone: head, at: [s * 0.15, 1.17, 0.5] });
    // Nostrils
    b.part(sph(0.02, 5, 4), P.stoneShadow, { bone: head, at: [s * 0.055, 1.0, 0.89] });
    // Upper fangs
    b.part(cone(0.02, 0.09, 5), P.fang, { bone: head, at: [s * 0.1, 0.84, 0.86], rotation: [180, 0, 0] });
    b.part(cone(0.012, 0.05, 5), P.fang, { bone: head, at: [s * 0.04, 0.86, 0.87], rotation: [180, 0, 0] });
    // Lower tusks
    b.part(cone(0.022, 0.12, 5), P.fang, { bone: jaw, at: [s * 0.12, 0.88, 0.8] });
    for (let i = 0; i < 3; i++) {
      b.part(cone(0.012, 0.045, 4), P.fang, { bone: head, at: [s * (0.07 + i * 0.05), 0.865, 0.835 - i * 0.07], rotation: [180, 0, 0] });
      b.part(cone(0.012, 0.04, 4), P.fang, { bone: jaw, at: [s * (0.06 + i * 0.045), 0.9, 0.78 - i * 0.07] });
    }
  }
  // Snout
  b.part(box(0.3, 0.14, 0.2), P.stone, { bone: head, at: [0, 0.96, 0.82] });
  b.part(box(0.32, 0.05, 0.1), P.stoneLight, { bone: head, at: [0, 1.04, 0.84] });
  b.part(box(0.34, 0.03, 0.2), P.stoneShadow, { bone: head, at: [0, 0.88, 0.8] });
  // Jaw
  b.part(box(0.36, 0.07, 0.34), P.stoneDark, { bone: jaw, at: [0, 0.86, 0.62] });
  b.part(box(0.26, 0.07, 0.14), P.stone, { bone: jaw, at: [0, 0.86, 0.82] });
  b.part(box(0.2, 0.025, 0.2), P.fang === "" ? P.stone : "#9a4a4a", { bone: jaw, at: [0, 0.9, 0.7] });
  // Chin beard
  for (let i = 0; i < 4; i++) {
    const w = 0.12 - i * 0.02;
    b.part(box(w, 0.06, 0.05), i % 2 ? P.stoneLight : P.stone, { bone: jaw, at: [(r() - 0.5) * 0.02, 0.81 - i * 0.05, 0.78 - i * 0.04] });
  }
  // Cracks
  b.part(box(0.01, 0.005, 0.14), P.stoneShadow, { bone: head, at: [-0.08, 1.232, 0.58], rotation: [0, 20, 0] });
  b.part(box(0.01, 0.1, 0.005), P.stoneShadow, { bone: head, at: [0.1, 0.95, 0.742], rotation: [0, 0, 15] });
}
```