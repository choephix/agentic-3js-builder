<!-- call: plan -->

```json
{
  "name": "Alert Gray Wolf (Warcraft style)",
  "description": "A chunky, heroic Warcraft-styled gray wolf standing alert: heavy shoulders, big paws, tall ears, a thick mane ruff and a bushy tail, built in rest pose with a separate jaw.",
  "builderName": "warcraftWolf",
  "size": [0.9, 1.25, 2.1],
  "layout": "Wolf faces +Z, standing on four straight, sturdy legs with oversized paws. Head is raised and forward at about y=1.1 near z=0.9, with a long, blocky muzzle at the front, an upper and a lower jaw, tall pointed ears and amber eyes with dark brows. Heavy shoulders and a thick spiky mane ruff sit above the front legs at z=0.35. The body is a barrel torso ending in a hip block at z=-0.45, and the bushy tail trails down and back to z=-1.0. Stylization: exaggerated shoulders, chest, paws and ears, faceted bold shapes, a darker back saddle, a pale belly, cheeks and leg fronts, bronze shoulder studs and a few scars, and a faint blue rune collar for Warcraft flavor. Every detail is a small part in its own colour seated on the surface.",
  "palette": {
    "furMid": "#7d8189",
    "furDark": "#4b4e57",
    "furLight": "#aeb2b8",
    "belly": "#d8d6cc",
    "mane": "#9a9ea6",
    "maneTip": "#e6e8ea",
    "nose": "#16161a",
    "eyeAmber": "#ffb02e",
    "eyeDark": "#1a0f08",
    "tooth": "#f4efe0",
    "tongue": "#b5424a",
    "inner": "#c58f8a",
    "claw": "#2a2623",
    "pad": "#2b2226",
    "bronze": "#b8832f",
    "rune": "#59c9ff",
    "scar": "#c9a39a"
  },
  "mounts": {
    "shoulderL": [0.2, 0.8, 0.4],
    "shoulderR": [-0.2, 0.8, 0.4],
    "hipL": [0.18, 0.78, -0.5],
    "hipR": [-0.18, 0.78, -0.5],
    "neckBase": [0, 0.95, 0.5],
    "headPivot": [0, 1.05, 0.8],
    "jawHinge": [0, 0.98, 0.9],
    "tailBase": [0, 0.85, -0.7],
    "pawFrontL": [0.2, 0, 0.45],
    "pawFrontR": [-0.2, 0, 0.45],
    "pawHindL": [0.18, 0, -0.55],
    "pawHindR": [-0.18, 0, -0.55]
  },
  "joints": [
    { "name": "hips", "at": [0, 0.8, -0.45], "dir": [0, 0, 1], "role": "spine" },
    { "name": "chest", "parent": "hips", "at": [0, 0.85, 0.1], "dir": [0, 0, 1], "role": "spine" },
    { "name": "neck", "parent": "chest", "at": [0, 0.95, 0.5], "dir": [0, 0.4, 1], "role": "neck" },
    { "name": "head", "parent": "neck", "at": [0, 1.05, 0.8], "dir": [0, 0, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 0.98, 0.9], "dir": [0, 0, 1], "role": "jaw" },
    { "name": "tail1", "parent": "hips", "at": [0, 0.85, -0.7], "dir": [0, -0.3, -1], "role": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 0.75, -0.9], "dir": [0, -0.5, -1], "role": "tail" },
    { "name": "shoulderL", "parent": "chest", "at": [0.2, 0.8, 0.4], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "elbowL", "parent": "shoulderL", "at": [0.2, 0.45, 0.4], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "shoulderR", "parent": "chest", "at": [-0.2, 0.8, 0.4], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "elbowR", "parent": "shoulderR", "at": [-0.2, 0.45, 0.4], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "hipL", "parent": "hips", "at": [0.18, 0.78, -0.5], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "hockL", "parent": "hipL", "at": [0.18, 0.4, -0.58], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "hipR", "parent": "hips", "at": [-0.18, 0.78, -0.5], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "hockR", "parent": "hipR", "at": [-0.18, 0.4, -0.58], "dir": [0, -1, 0], "role": "leg", "group": "legs" }
  ],
  "parts": [
    {
      "id": "torso",
      "builds": "Barrel torso lofted from hips to chest with a heavy shoulder hump and hip block. Colours: furMid body, furDark saddle sectors along the back, belly cream underside. Includes the thick mane ruff around the shoulders as overlapping blades from mane to maneTip with a spiky ridge down the spine, bronze shoulder studs and a rune collar in rune colour, plus a couple of scar marks in scar colour on the flank.",
      "box": [[-0.3, 0.55, -0.7], [0.3, 1.15, 0.65]],
      "attaches": "Neck at neckBase, front legs at shoulderL/R, hind legs at hipL/R, tail at tailBase.",
      "joints": ["hips", "chest"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "head",
      "builds": "Wolf head with a skull block, a long tapered upper muzzle and a separate lower jaw riding the jaw joint, a nose, teeth with big canines, a tongue, cheek ruffs in furLight and belly, amber eyes with dark outlines and angry brow wedges, tall pointed ears with inner pink, a dark forehead stripe, whisker dots, and the neck sweep from the neckBase to the head with a neck mane.",
      "box": [[-0.22, 0.85, 0.45], [0.22, 1.25, 1.25]],
      "attaches": "Neck chain starts at neckBase and ends at headPivot; jaw hinges at jawHinge.",
      "joints": ["neck", "head", "jaw"],
      "floor": false,
      "budget": 220
    },
    {
      "id": "frontLegs",
      "builds": "Both front legs built from shoulder to paw with chunky upper arms, a forearm, a big paw, four toes and claws on each, dark pad colour, a pale leg front stripe, and a bronze bracer ring on each leg.",
      "box": [[-0.32, 0, 0.2], [0.32, 0.85, 0.65]],
      "attaches": "Tops meet at shoulderL/R, paws land on pawFrontL/R at y=0.",
      "joints": ["shoulderL", "elbowL", "shoulderR", "elbowR"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "hindLegsTail",
      "builds": "Both hind legs, digitigrade, with a thick thigh, a hock bent back, a long metatarsus and a big paw with claws, pale fur patches on the thighs, plus the bushy tail as a tapered sweep through tail1 and tail2 with a dark saddle on top, a light tip and fur tufts.",
      "box": [[-0.32, 0, -1.05], [0.32, 0.9, -0.3]],
      "attaches": "Hips at hipL/R, paws on pawHindL/R at y=0, tail starts at tailBase.",
      "joints": ["hipL", "hockL", "hipR", "hockR", "tail1", "tail2"],
      "floor": true,
      "budget": 170
    }
  ]
}
```

<!-- call: hindLegsTail -->

```ts
import * as THREE from "three";
import { frame, rng, catmull, limb } from "agentic-3js-builder";

export function buildHindLegsTail({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const FUR = P.furMid, DARK = P.furDark, LIGHT = P.furLight;

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipJ = J["hip" + side];
    const hockJ = J["hock" + side];
    const hip: [number, number, number] = [s * 0.18, 0.78, -0.5];
    const knee: [number, number, number] = [s * 0.19, 0.5, -0.38];
    const hock: [number, number, number] = [s * 0.18, 0.4, -0.58];
    const heel: [number, number, number] = [s * 0.18, 0.1, -0.55];

    // thigh, shin, metatarsus
    b.capsule(hip, knee, [0.15, 0.09], FUR, { bone: hipJ });
    b.capsule(knee, hock, [0.09, 0.065], FUR, { bone: hipJ });
    b.capsule(hock, heel, [0.055, 0.045], DARK, { bone: hockJ });
    // hock joint knob
    b.part(new THREE.SphereGeometry(0.07, 8, 6), DARK, { bone: hockJ, at: [s * 0.18, 0.4, -0.6] });
    // pale thigh patch
    b.part(new THREE.SphereGeometry(0.09, 8, 6), LIGHT, {
      bone: hipJ, at: [s * 0.3, 0.68, -0.46], scale: [0.5, 1.3, 1.1],
    });
    b.part(new THREE.SphereGeometry(0.06, 7, 5), LIGHT, {
      bone: hipJ, at: [s * 0.2, 0.5, -0.3], scale: [0.8, 1.1, 0.8],
    });

    // paw
    b.part(new THREE.BoxGeometry(0.13, 0.07, 0.2), FUR, { bone: hockJ, at: [s * 0.18, 0.04, -0.47] });
    b.part(new THREE.BoxGeometry(0.11, 0.02, 0.16), P.pad, { bone: hockJ, at: [s * 0.18, 0.012, -0.47] });
    // toes and claws
    for (let i = 0; i < 4; i++) {
      const x = s * (0.18 + (i - 1.5) * 0.034);
      b.part(new THREE.SphereGeometry(0.03, 6, 5), FUR, { bone: hockJ, at: [x, 0.035, -0.38], scale: [1, 0.9, 1.3] });
      b.part(new THREE.ConeGeometry(0.014, 0.05, 5), P.claw, {
        bone: hockJ, at: [x, 0.022, -0.34], dir: [0, -0.3, 1],
      });
    }
    // dew claw/spur
    b.part(new THREE.ConeGeometry(0.015, 0.05, 5), P.claw, {
      bone: hockJ, at: [s * 0.18, 0.2, -0.64], dir: [0, 0.3, -1],
    });
    // thigh fur tufts
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.ConeGeometry(0.03, 0.08, 5), LIGHT, {
        bone: hipJ, at: [s * 0.2, 0.62 - i * 0.08, -0.62 + i * 0.02], dir: [0, -0.4, -1],
      });
    }
  }

  // tail
  const tail1 = J.tail1, tail2 = J.tail2;
  const path = catmull([
    [0, 0.85, -0.7], [0, 0.8, -0.82], [0, 0.7, -0.93], [0, 0.55, -1.02],
  ]);
  const radii = [0.075, 0.12, 0.115, 0.05];
  b.sweep(path, radii, { bone: [tail1, tail2], color: FUR, sectors: [[-70, 70, DARK]],
    bands: [[0.8, FUR], [1, P.maneTip]] });
  // tufts
  for (let i = 0; i < 7; i++) {
    const t = 0.1 + i * 0.12;
    const p = path.at(t);
    const side = i % 2 ? 1 : -1;
    b.part(new THREE.ConeGeometry(0.035, 0.12, 5), i > 4 ? P.maneTip : LIGHT, {
      bone: t < 0.5 ? tail1 : tail2,
      at: [side * 0.07, p.y - 0.02, p.z - 0.02],
      dir: [side * 0.5, -0.6, -0.8 + R() * 0.2],
    });
  }
  // dark saddle ridge tufts on top
  for (let i = 0; i < 4; i++) {
    const t = 0.12 + i * 0.17;
    const p = path.at(t);
    b.part(new THREE.ConeGeometry(0.03, 0.1, 5), DARK, {
      bone: t < 0.5 ? tail1 : tail2,
      at: [0, p.y + 0.1, p.z], dir: [0, 0.6, -1],
    });
  }
}
```

<!-- call: frontLegs -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildFrontLegs({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const sides = [
    { s: 1, sh: J.shoulderL, el: J.elbowL },
    { s: -1, sh: J.shoulderR, el: J.elbowR },
  ];
  for (const { s, sh, el } of sides) {
    const x = s * 0.2;
    const tag = s > 0 ? "L" : "R";
    // upper arm (chunky), shoulder to elbow
    b.sweep([[x, 0.82, 0.4], [x, 0.45, 0.4]], [0.105, 0.075], { bone: sh, color: P.furMid, caps: "round" });
    // heavy shoulder cap
    b.part(new THREE.SphereGeometry(0.12, 8, 6), P.furMid, { bone: sh, at: [x + s * 0.02, 0.76, 0.4], scale: [1, 1.1, 1.15] });
    // elbow tuft
    b.part(new THREE.ConeGeometry(0.05, 0.12, 6), P.furLight, { bone: el, at: [x + s * 0.06, 0.45, 0.32], dir: [s * 0.4, -0.3, -1] });
    // forearm
    b.sweep([[x, 0.45, 0.4], [x, 0.1, 0.43]], [0.072, 0.058], { bone: el, color: P.furMid, caps: "round" });
    // pale front stripe
    b.part(new THREE.BoxGeometry(0.03, 0.34, 0.012), P.furLight, { bone: el, at: [x, 0.28, 0.4 + 0.075], rotation: [-6, 0, 0] });
    b.part(new THREE.BoxGeometry(0.036, 0.2, 0.012), P.belly, { bone: sh, at: [x, 0.64, 0.4 + 0.1] });
    // bronze bracer
    b.part(new THREE.CylinderGeometry(0.083, 0.078, 0.07, 8), P.bronze, { bone: el, at: [x, 0.3, 0.41] });
    b.part(new THREE.CylinderGeometry(0.087, 0.087, 0.012, 8), P.claw, { bone: el, at: [x, 0.335, 0.41] });
    b.part(new THREE.CylinderGeometry(0.087, 0.087, 0.012, 8), P.claw, { bone: el, at: [x, 0.265, 0.41] });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), P.maneTip, { bone: el, at: [x, 0.3, 0.41 + 0.085] });
    // big paw
    b.part(new THREE.BoxGeometry(0.15, 0.1, 0.24), P.furDark, { bone: el, at: [x, 0.05, 0.5] });
    b.part(new THREE.SphereGeometry(0.075, 8, 6), P.furMid, { bone: el, at: [x, 0.09, 0.4], scale: [1.05, 0.8, 1.1] });
    // pad underside
    b.part(new THREE.BoxGeometry(0.1, 0.01, 0.12), P.pad, { bone: el, at: [x, 0.004, 0.5] });
    // toes + claws
    for (let i = 0; i < 4; i++) {
      const tx = x + (i - 1.5) * 0.04;
      const tz = 0.62 + (i === 1 || i === 2 ? 0.012 : 0);
      b.part(new THREE.BoxGeometry(0.036, 0.05, 0.05), P.furDark, { bone: el, at: [tx, 0.028, tz] });
      b.part(new THREE.SphereGeometry(0.02, 6, 4), P.furMid, { bone: el, at: [tx, 0.045, tz - 0.01], scale: [1, 0.8, 1.2] });
      b.part(new THREE.ConeGeometry(0.014, 0.05, 5), P.claw, { bone: el, at: [tx, 0.02, tz + 0.04], dir: [0, -0.35, 1] });
      b.part(new THREE.SphereGeometry(0.014, 5, 4), P.pad, { bone: el, at: [tx, 0.008, tz - 0.01], scale: [1, 0.4, 1] });
    }
    // dewclaw
    b.part(new THREE.ConeGeometry(0.012, 0.04, 5), P.claw, { bone: el, at: [x - s * 0.02, 0.15, 0.36], dir: [0, -0.6, -0.8] });
    // fur tufts on back of forearm
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.ConeGeometry(0.025, 0.08, 5), P.furLight, {
        bone: el,
        at: [x + (R() - 0.5) * 0.03, 0.4 - i * 0.07, 0.4 - 0.07],
        dir: [0, -0.7, -0.5],
      });
    }
  }
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildHead({ b, J, P, M }: Ctx) {
  const neckJ = J.neck, headJ = J.head, jawJ = J.jaw;
  const R = rng(5);

  // Neck sweep from neckBase to head pivot, skinned on the neck joint
  const neckPath: [number, number, number][] = [
    [0, 0.95, 0.5], [0, 1.0, 0.62], [0, 1.06, 0.78],
  ];
  b.sweep(neckPath, [0.17, 0.13], { bone: neckJ, color: P.furMid, caps: "flat", sides: 8 });
  // neck mane blades
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const y = 1.1 + t * 0.05, z = 0.52 + t * 0.26;
    b.spike([0, y, z], [0, 0.6, -0.5], 0.14, 0.05, { bone: neckJ, color: i % 2 ? P.mane : P.maneTip });
  }
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++)
      b.spike([s * 0.1, 1.0 + i * 0.03, 0.55 + i * 0.07], [s * 0.5, 0.2, -0.8], 0.13, 0.045, { bone: neckJ, color: P.mane });

  // Skull block
  const hc: [number, number, number] = [0, 1.07, 0.85];
  b.part(new THREE.BoxGeometry(0.3, 0.26, 0.3), P.furMid, { bone: headJ, at: hc });
  b.part(new THREE.BoxGeometry(0.22, 0.04, 0.2), P.furDark, { bone: headJ, at: [0, 1.205, 0.86] }); // forehead stripe
  // Upper muzzle
  b.frustumBox([0, 1.04, 0.98], [0, 1.02, 1.22], [0.19, 0.15], [0.1, 0.09], { bone: headJ, color: P.furLight });
  b.part(new THREE.BoxGeometry(0.1, 0.05, 0.12), P.furMid, { bone: headJ, at: [0, 1.1, 1.1] }); // bridge
  // nose
  b.part(new THREE.BoxGeometry(0.1, 0.06, 0.06), P.nose, { bone: headJ, at: [0, 1.07, 1.245] });
  // upper teeth
  for (const s of [1, -1]) {
    b.spike([s * 0.045, 0.98, 1.2], [0, -1, 0], 0.07, 0.014, { bone: headJ, color: P.tooth });
    for (let i = 0; i < 3; i++)
      b.spike([s * 0.07, 0.97, 1.0 + i * 0.05], [0, -1, 0], 0.03, 0.01, { bone: headJ, color: P.tooth });
  }

  // Lower jaw on jaw joint
  b.frustumBox([0, 0.96, 0.95], [0, 0.95, 1.18], [0.15, 0.05], [0.09, 0.04], { bone: jawJ, color: P.belly });
  b.part(new THREE.BoxGeometry(0.1, 0.02, 0.16), P.tongue, { bone: jawJ, at: [0, 0.985, 1.06] });
  for (const s of [1, -1]) {
    b.spike([s * 0.04, 0.97, 1.16], [0, 1, 0], 0.06, 0.013, { bone: jawJ, color: P.tooth });
    for (let i = 0; i < 2; i++)
      b.spike([s * 0.06, 0.97, 1.02 + i * 0.05], [0, 1, 0], 0.025, 0.009, { bone: jawJ, color: P.tooth });
  }

  // cheek ruffs
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++)
      b.spike([s * 0.15, 1.0 - i * 0.03, 0.92 - i * 0.04], [s * 0.7, -0.2, -0.6], 0.13, 0.05, { bone: headJ, color: i === 2 ? P.belly : P.furLight });
    // eyes
    const ex = s * 0.1;
    b.part(new THREE.BoxGeometry(0.05, 0.04, 0.03), P.eyeDark, { bone: headJ, at: [ex, 1.11, 1.0] });
    b.part(new THREE.BoxGeometry(0.035, 0.026, 0.03), P.eyeAmber, { bone: headJ, at: [ex, 1.11, 1.012] });
    b.part(new THREE.BoxGeometry(0.01, 0.02, 0.03), P.eyeDark, { bone: headJ, at: [ex, 1.11, 1.022] });
    // brow wedge angled inward-down
    b.part(new THREE.BoxGeometry(0.07, 0.016, 0.04), P.furDark, { bone: headJ, at: [ex, 1.14, 1.0], rotation: [0, 0, s * -18] });
    // ears
    b.spike([s * 0.1, 1.18, 0.78], [s * 0.2, 1, -0.1], 0.2, 0.065, { bone: headJ, color: P.furDark, sides: 4 });
    b.spike([s * 0.1, 1.2, 0.795], [s * 0.2, 1, -0.1], 0.13, 0.04, { bone: headJ, color: P.inner, sides: 4 });
    // whisker dots
    for (let i = 0; i < 3; i++)
      b.part(new THREE.SphereGeometry(0.008, 5, 4), P.nose, { bone: headJ, at: [s * (0.06 + i * 0.006), 1.05 - i * 0.01, 1.17 - i * 0.03] });
    // scar
    b.part(new THREE.BoxGeometry(0.004, 0.05, 0.015), P.scar, { bone: headJ, at: [s * 0.152, 1.1, 0.9], rotation: [0, 0, 20] });
  }
}
```

<!-- call: torso -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildTorso({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const hips = J.hips, chest = J.chest;
  const SADDLE = "#4b4e57";

  // Barrel body loft from hip block to shoulder hump
  const body = b.loft(
    [
      { at: [0, 0.82, -0.6], w: 0.44, h: 0.42 },
      { at: [0, 0.82, -0.4], w: 0.5, h: 0.46 },
      { at: [0, 0.82, -0.1], w: 0.46, h: 0.44 },
      { at: [0, 0.86, 0.15], w: 0.5, h: 0.5 },
      { at: [0, 0.9, 0.4], w: 0.56, h: 0.54 },
      { at: [0, 0.92, 0.58], w: 0.46, h: 0.46 },
    ],
    {
      bone: [hips, chest],
      color: P.furMid,
      sectors: [
        [-70, 70, SADDLE],
        [125, 235, P.belly],
      ],
    },
  );

  // Shoulder hump
  b.part(new THREE.IcosahedronGeometry(0.2, 0), P.furMid, {
    bone: chest, at: [0, 1.0, 0.38], scale: [1.3, 0.8, 1.2], flat: true,
  });

  // Mane ruff: overlapping blades around the shoulders
  const maneRing = (z: number, y: number, rx: number, ry: number, n: number, len: number) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      if (Math.sin(a) < -0.45) continue; // skip under the chest
      const p: [number, number, number] = [Math.sin(a) * rx, y + Math.cos(a) * ry, z];
      const d: [number, number, number] = [Math.sin(a) * 0.5, Math.cos(a) * 0.5 + 0.1, -0.7];
      const l = len * (0.8 + R() * 0.4);
      b.spike(p, d, l, 0.045, { bone: chest, color: P.mane });
      const tip: [number, number, number] = [p[0] + d[0] * l * 0.55, p[1] + d[1] * l * 0.55, p[2] + d[2] * l * 0.55];
      b.spike(tip, d, l * 0.5, 0.025, { bone: chest, color: P.maneTip });
    }
  };
  maneRing(0.5, 0.92, 0.27, 0.26, 16, 0.2);
  maneRing(0.38, 0.92, 0.3, 0.28, 16, 0.22);
  maneRing(0.26, 0.92, 0.29, 0.27, 14, 0.2);

  // Spiky ridge down the spine
  for (let i = 0; i < 13; i++) {
    const z = 0.5 - i * 0.087;
    const y = 1.1 - Math.max(0, -z - 0.1) * 0.12 - (z > 0.3 ? 0 : 0.03);
    const l = 0.12 - i * 0.004;
    b.spike([0, y - 0.03, z], [0, 1, -0.5], l, 0.03, { bone: i < 6 ? chest : hips, color: P.furDark });
    b.spike([0, y + l * 0.3, z - 0.02], [0, 1, -0.5], l * 0.5, 0.016, { bone: i < 6 ? chest : hips, color: P.maneTip });
  }

  // Hip block
  for (const s of [1, -1]) {
    b.part(new THREE.IcosahedronGeometry(0.17, 0), P.furMid, {
      bone: hips, at: [s * 0.2, 0.84, -0.48], scale: [0.9, 1.1, 1.2], flat: true,
    });
    // pale belly patch near thigh
    b.part(new THREE.IcosahedronGeometry(0.07, 0), P.furLight, {
      bone: hips, at: [s * 0.3, 0.78, -0.45], scale: [0.5, 1.3, 1.3], flat: true,
    });
  }

  // Bronze shoulder studs (heavy straps with studs)
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.075, 0.085, 0.04, 8), P.bronze, {
      bone: chest, at: [s * 0.3, 0.9, 0.4], dir: [s, 0.1, 0], flat: true,
    });
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.014, 6, 4), P.bronze, {
        bone: chest, at: [s * 0.325, 0.9 + Math.cos(a) * 0.09, 0.4 + Math.sin(a) * 0.09],
      });
    }
    b.part(new THREE.SphereGeometry(0.03, 6, 4), P.maneTip, {
      bone: chest, at: [s * 0.335, 0.9, 0.4],
    });
  }

  // Rune collar: glowing blue ring at neck base with rune ticks
  b.part(new THREE.TorusGeometry(0.2, 0.012, 5, 18), P.rune, {
    bone: chest, at: [0, 0.97, 0.58], dir: [0, 0.25, 1], axis: "z",
  });
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * (0.1 + (i / 8) * 0.8);
    const x = Math.cos(a) * 0.2 * (i % 2 ? 1 : 1);
    b.part(new THREE.BoxGeometry(0.02, 0.05, 0.012), P.rune, {
      bone: chest, at: [x, 0.97 + Math.sin(a) * 0.19 * 0.97, 0.6 + Math.sin(a) * 0.05],
    });
  }

  // Scars on the flank
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      b.part(new THREE.BoxGeometry(0.008, 0.012, 0.13), P.scar, {
        bone: hips, at: [s * 0.255 + s * 0.005, 0.85 - k * 0.04 + (s > 0 ? 0 : 0.0), -0.1 + k * 0.03],
        rotation: [0, 0, s * 25],
      });
      if (s < 0) break;
    }
  }

  // Dark saddle patches along the back
  b.part(new THREE.IcosahedronGeometry(0.17, 0), P.furDark, {
    bone: chest, at: [0, 1.04, 0.0], scale: [1.3, 0.35, 2.4], flat: true,
  });

  // Belly fur tufts
  for (let i = 0; i < 6; i++) {
    b.spike([(R() - 0.5) * 0.2, 0.6, -0.5 + i * 0.17], [0, -1, -0.3], 0.07, 0.025, {
      bone: i > 2 ? chest : hips, color: P.belly,
    });
  }
  void body; void frame; void M;
}
```

<!-- call: fit-torso -->

Two things push pieces out of the box: the spine spikes rise too high, and the loft extends to z = 0.81 (the sweep.hips pieces). The loft's last station is at z = 0.58, so the round end cap and the smoothing add little. The spiky ridge is the main problem, so I'll lower it and shorten the spikes. The loft's z overrun probably comes from the cap, so I'll pull the last station back and make the end smaller.

<<<<<<< SEARCH
      { at: [0, 0.92, 0.58], w: 0.46, h: 0.46 },
=======
      { at: [0, 0.92, 0.5], w: 0.36, h: 0.36 },
>>>>>>> REPLACE

<<<<<<< SEARCH
    const y = 1.1 - Math.max(0, -z - 0.1) * 0.12 - (z > 0.3 ? 0 : 0.03);
    const l = 0.12 - i * 0.004;
=======
    const y = 1.0 - Math.max(0, -z - 0.1) * 0.12 - (z > 0.3 ? 0 : 0.03);
    const l = 0.1 - i * 0.004;
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike([0, y - 0.03, z], [0, 1, -0.5], l, 0.03, { bone: i < 6 ? chest : hips, color: P.furDark });
    b.spike([0, y + l * 0.3, z - 0.02], [0, 1, -0.5], l * 0.5, 0.016, { bone: i < 6 ? chest : hips, color: P.maneTip });
=======
    b.spike([0, y - 0.03, z], [0, 1, -1.5], l, 0.03, { bone: i < 6 ? chest : hips, color: P.furDark });
    b.spike([0, y + l * 0.15, z - 0.04], [0, 1, -1.5], l * 0.5, 0.016, { bone: i < 6 ? chest : hips, color: P.maneTip });
>>>>>>> REPLACE