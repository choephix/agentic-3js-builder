<!-- call: plan -->

```json
{
  "name": "Capybara with Bird",
  "description": "A whimsical, chunky capybara standing calmly with a tiny round songbird perched on its head.",
  "builderName": "capybaraWithBird",
  "size": [0.7, 0.85, 1.35],
  "layout": "A barrel-bodied capybara faces +Z, about 1.2 m long, standing on four short stubby legs with the belly nearly at the ground. The head is a big blocky rounded box with a boxy blunt snout at the front (z about 0.6), small round ears and sleepy eyes high on the head. The body is a warm brown loft with a paler tan belly. A tiny round yellow-and-blue bird sits on top of the head between the ears. Every part uses flat colours, with chunky simple shapes, and small detail parts (toes, whiskers, nostrils, eye highlights, feather tufts, fur tufts) in their own colours.",
  "palette": {
    "furDark": "#7a4a28",
    "furMid": "#9a6234",
    "furLight": "#b87f48",
    "belly": "#d9ac76",
    "snout": "#5b3820",
    "nose": "#2a1a12",
    "eyeDark": "#1a1210",
    "eyeShine": "#ffffff",
    "toe": "#3d271a",
    "earInner": "#d48a7a",
    "birdBody": "#ffd23f",
    "birdWing": "#3fa7e0",
    "birdBelly": "#fff1b0",
    "beak": "#ff8a2a",
    "birdEye": "#101010",
    "blush": "#ff9a9a"
  },
  "mounts": {
    "headTop": [0, 0.77, 0.5],
    "neckBase": [0, 0.5, 0.35],
    "shoulderL": [0.2, 0.3, 0.3],
    "hipL": [0.2, 0.3, -0.35],
    "tailBase": [0, 0.4, -0.6],
    "snoutTip": [0, 0.5, 0.68]
  },
  "joints": [
    { "name": "body", "at": [0, 0.4, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "chest", "parent": "body", "at": [0, 0.42, 0.3], "dir": [0, 0, 1], "role": "spine" },
    { "name": "neck", "parent": "chest", "at": [0, 0.5, 0.4], "dir": [0, 0.3, 1], "role": "neck" },
    { "name": "head", "parent": "neck", "at": [0, 0.56, 0.5], "dir": [0, 0, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 0.44, 0.52], "dir": [0, 0, 1], "role": "jaw" },
    { "name": "tail", "parent": "body", "at": [0, 0.4, -0.6], "dir": [0, 0, -1], "role": "tail" },
    { "name": "legFL", "parent": "chest", "at": [0.2, 0.3, 0.32], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "legFR", "parent": "chest", "at": [-0.2, 0.3, 0.32], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "legHL", "parent": "body", "at": [0.2, 0.3, -0.35], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "legHR", "parent": "body", "at": [-0.2, 0.3, -0.35], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "birdBody", "parent": "head", "at": [0, 0.77, 0.5], "dir": [0, 1, 0], "role": "spine", "group": "bird" },
    { "name": "wingL", "parent": "birdBody", "at": [0.06, 0.83, 0.5], "dir": [1, 0, 0], "role": "wing", "group": "bird" },
    { "name": "wingR", "parent": "birdBody", "at": [-0.06, 0.83, 0.5], "dir": [-1, 0, 0], "role": "wing", "group": "bird" }
  ],
  "parts": [
    {
      "id": "torso",
      "builds": "The barrel body: a loft or sweep from chest to rump in furMid with a furDark back sector and a belly-coloured underside, a rounded rump, a small stubby tail nub in furDark, and a few furLight fur tufts and darker back patches as small parts. Includes a thick short neck blending into the chest.",
      "box": [[-0.3, 0.2, -0.7], [0.3, 0.72, 0.45]],
      "attaches": "Neck meets head at mount neckBase. Legs attach at the shoulder and hip mounts, with the leg tops buried inside the body.",
      "joints": ["body", "chest", "neck", "tail"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "head",
      "builds": "The big blocky head in furMid, with a long boxy snout in snout brown, a wide dark nose pad and two nostrils, a separate lower jaw on the jaw joint in furLight, and sleepy half-lidded eyes high on the head (eyeDark with eyeShine highlights, furDark lids). Also small round ears with earInner insets, blush cheek patches, whisker rods and a furLight forehead tuft. The top is a flattish crown at the headTop mount.",
      "box": [[-0.27, 0.35, 0.3], [0.27, 0.78, 0.7]],
      "attaches": "Sits on neckBase, with its crown at headTop where the bird stands. The snout ends at snoutTip.",
      "joints": ["head", "jaw"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "legs",
      "builds": "Four short, chunky legs of two stacked capsules or tapered boxes each, in furDark with furMid upper parts. Each foot has three or four toe nubs in toe colour and the feet are flat and wide. The front legs are slightly splayed outward and all four feet sit flat on the floor. The legs reach up into the torso.",
      "box": [[-0.3, 0, -0.5], [0.3, 0.35, 0.45]],
      "attaches": "Tops at the shoulderL and hipL mounts (mirrored to the right side) and inside the torso.",
      "joints": ["legFL", "legFR", "legHL", "legHR"],
      "floor": true,
      "budget": 170
    },
    {
      "id": "bird",
      "builds": "A tiny round whimsical songbird standing on the capybara's head: a spherical birdBody in yellow with a birdBelly front, two birdWing wings as extruded or slab shapes that can flap, a fan tail of three feathers, a small orange beak made of two cones (upper and lower), big black eyes with shine dots, a three-feather head tuft in birdWing blue, blush cheeks, and two thin beak-coloured legs with tiny toes planted on the crown.",
      "box": [[-0.1, 0.74, 0.4], [0.1, 0.88, 0.62]],
      "attaches": "The feet stand on the headTop mount, facing +Z like the capybara.",
      "joints": ["birdBody", "wingL", "wingR"],
      "floor": false,
      "budget": 120
    }
  ]
}
```

<!-- call: legs -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildLegs({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const legs: [string, number, number, number][] = [
    ["legFL", 1, 0.32, 1],
    ["legFR", -1, 0.32, 1],
    ["legHL", 1, -0.35, 0],
    ["legHR", -1, -0.35, 0],
  ];
  for (const [name, s, z, front] of legs) {
    const bone = J[name];
    const x = s * (front ? 0.21 : 0.2);
    const splay = front ? s * 0.03 : 0;
    // upper leg: wide tapered box buried in torso
    const upperTop: [number, number, number] = [x, 0.34, z];
    const knee: [number, number, number] = [x + splay, 0.15, z + (front ? 0.01 : -0.01)];
    b.frustumBox(upperTop, knee, [0.17, 0.2], [0.14, 0.14], { bone, color: P.furMid });
    // fur tuft on thigh
    b.part(new THREE.ConeGeometry(0.035, 0.07, 5), P.furLight, {
      bone,
      at: [x + s * 0.07, 0.24, z + 0.02],
      dir: [s * 0.5, -1, 0],
    });
    // lower leg
    const ankle: [number, number, number] = [x + splay * 2, 0.045, z + 0.01];
    b.rod(knee, ankle, [0.065, 0.07], P.furDark, { bone, sides: 8 });
    // knee cap
    b.part(new THREE.SphereGeometry(0.07, 8, 6), P.furDark, { bone, at: knee, scale: [1, 0.9, 1] });
    // flat wide foot
    const fx = x + splay * 2;
    const fz = z + 0.04;
    b.part(new THREE.BoxGeometry(0.15, 0.05, 0.16), P.furDark, { bone, at: [fx, 0.025, fz] });
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 8), P.furDark, { bone, at: [fx, 0.025, fz + 0.08], scale: [1, 1, 0.8] });
    // toes
    const n = front ? 4 : 3;
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0 : i / (n - 1) - 0.5;
      const tx = fx + t * 0.12;
      const tz = fz + 0.14 - Math.abs(t) * 0.05 + (R() - 0.5) * 0.005;
      b.part(new THREE.SphereGeometry(0.03, 6, 5), P.toe, {
        bone,
        at: [tx, 0.025, tz],
        scale: [1, 0.85, 1.25],
      });
      b.part(new THREE.ConeGeometry(0.012, 0.025, 5), P.nose, {
        bone,
        at: [tx, 0.02, tz + 0.04],
        dir: [0, 0, 1],
      });
    }
    // ankle fur band
    b.part(new THREE.CylinderGeometry(0.075, 0.08, 0.025, 8), P.furMid, { bone, at: [fx, 0.075, z + 0.015] });
  }
}
```

<!-- call: torso -->

```ts
import * as THREE from "three";
import { rng, catmull } from "agentic-3js-builder";

export function buildTorso({ b, J, P, M }: any) {
  const R = rng(11);

  // Body loft: rump (-0.62) to chest (0.38), centre height ~0.46.
  const stations = [
    { at: [0, 0.44, -0.58], w: 0.34, h: 0.34 },
    { at: [0, 0.46, -0.4], w: 0.54, h: 0.48 },
    { at: [0, 0.47, -0.1], w: 0.58, h: 0.5 },
    { at: [0, 0.47, 0.2], w: 0.56, h: 0.5 },
    { at: [0, 0.48, 0.4], w: 0.46, h: 0.44 },
  ];
  b.loft(stations, { bone: J.body, color: P.furMid });

  // Belly underside
  b.loft(
    [
      { at: [0, 0.3, -0.35], w: 0.4, h: 0.1 },
      { at: [0, 0.29, -0.05], w: 0.44, h: 0.1 },
      { at: [0, 0.3, 0.25], w: 0.4, h: 0.1 },
    ],
    { bone: J.body, color: P.belly },
  );

  // Dark back strip
  b.loft(
    [
      { at: [0, 0.69, -0.45], w: 0.3, h: 0.07 },
      { at: [0, 0.71, -0.1], w: 0.36, h: 0.07 },
      { at: [0, 0.71, 0.25], w: 0.34, h: 0.07 },
      { at: [0, 0.68, 0.42], w: 0.26, h: 0.07 },
    ],
    { bone: J.body, color: P.furDark },
  );

  // Rounded rump
  b.part(new THREE.SphereGeometry(0.27, 10, 8), P.furMid, {
    bone: J.body,
    at: [0, 0.45, -0.52],
    scale: [1, 0.95, 0.9],
  });

  // Thick neck
  b.part(new THREE.SphereGeometry(0.25, 10, 8), P.furMid, {
    bone: J.neck,
    at: [0, 0.53, 0.4],
    scale: [1, 0.95, 1.05],
  });

  // Tail nub
  b.part(new THREE.SphereGeometry(0.06, 8, 6), P.furDark, {
    bone: J.tail,
    at: [0, 0.42, -0.74],
    scale: [1, 0.9, 1.1],
  });

  // Fur tufts on the sides and back
  for (let i = 0; i < 22; i++) {
    const s = R() < 0.5 ? 1 : -1;
    const z = -0.5 + R() * 0.9;
    const y = 0.42 + R() * 0.25;
    const x = s * (0.27 + R() * 0.03);
    b.part(new THREE.ConeGeometry(0.025, 0.07, 5), P.furLight, {
      bone: z > 0.3 ? J.chest : J.body,
      at: [x, y, z],
      dir: [s, 0.2, -0.6],
    });
  }

  // Darker back patches
  for (let i = 0; i < 6; i++) {
    const z = -0.5 + i * 0.17;
    b.part(new THREE.SphereGeometry(0.06, 6, 4), P.furDark, {
      bone: J.body,
      at: [(R() - 0.5) * 0.3, 0.71, z],
      scale: [1.2, 0.35, 1],
    });
  }
}
```

<!-- call: bird -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildBird({ b, J, P, M }: Ctx) {
  const bb = J.birdBody;
  const cx = 0, base = M.headTop[1], cz = M.headTop[2];
  const BC = [cx, base + 0.065, cz] as [number, number, number];
  const sph = (r: number, w = 10, h = 8) => new THREE.SphereGeometry(r, w, h);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], opts: any = {}) =>
    b.part(g, c, { bone: bb, at, ...opts });

  // body
  put(sph(1, 12, 9), P.birdBody, BC, { scale: [0.062, 0.06, 0.066] });
  // belly
  put(sph(1, 10, 8), P.birdBelly, [cx, BC[1] - 0.012, BC[2] + 0.02], { scale: [0.048, 0.046, 0.045] });
  // head bump
  put(sph(1, 10, 8), P.birdBody, [cx, BC[1] + 0.045, BC[2] + 0.03], { scale: [0.045, 0.042, 0.045] });

  // beak
  const bk = [cx, BC[1] + 0.04, BC[2] + 0.07];
  put(new THREE.ConeGeometry(0.014, 0.034, 6), P.beak, [bk[0], bk[1] + 0.004, bk[2] + 0.015], { dir: [0, 0.05, 1] });
  put(new THREE.ConeGeometry(0.01, 0.024, 6), P.beak, [bk[0], bk[1] - 0.009, bk[2] + 0.011], { dir: [0, -0.1, 1] });

  for (const s of [1, -1]) {
    const ex = s * 0.026, ey = BC[1] + 0.052, ez = BC[2] + 0.062;
    put(sph(0.011, 8, 6), P.birdEye, [ex, ey, ez]);
    put(sph(0.004, 5, 4), P.eyeShine, [ex + s * 0.003, ey + 0.005, ez + 0.008]);
    put(sph(0.011, 6, 4), P.blush, [s * 0.04, BC[1] + 0.03, BC[2] + 0.05], { scale: [0.6, 0.6, 0.4] });

    // wings
    const w = s > 0 ? J.wingL : J.wingR;
    const out: [number, number, number] = [s, 0, 0];
    b.extrude(
      [[0, 0.02], [0.03, 0.025], [0.05, 0.0], [0.045, -0.03], [0.02, -0.04], [0, -0.02]],
      { at: [s * 0.058, BC[1] + 0.005, BC[2] - 0.005], x: [0, 0, -1], y: [s * 0.25, 1, 0], thickness: 0.008, color: P.birdWing, bone: w },
    );
    // wing tip highlight
    put(sph(0.008, 6, 4), P.birdBelly, [s * 0.064, BC[1] - 0.012, BC[2] - 0.045], { bone: w, scale: [0.5, 0.8, 1.2] });

    // legs
    const lx = s * 0.02;
    b.rod([lx, base + 0.012, BC[2] + 0.005], [lx, base + 0.006 + 0.02, BC[2] + 0.005], 0.003, P.beak, { bone: bb });
    for (const a of [-0.012, 0, 0.012])
      put(new THREE.CylinderGeometry(0.0022, 0.0022, 0.018, 4), P.beak, [lx + a * 0.6, base + 0.003, BC[2] + 0.014], { dir: [a, 0, 1] });
  }

  // tail fan
  for (const k of [-1, 0, 1])
    put(new THREE.ConeGeometry(0.009, 0.05, 5), k === 0 ? P.birdWing : P.birdBody,
      [k * 0.015, BC[1] + 0.005, BC[2] - 0.08], { dir: [k * 0.4, 0.35, -1] });

  // head tuft
  const tc = [cx, BC[1] + 0.085, BC[2] + 0.025];
  for (const k of [-1, 0, 1])
    put(new THREE.ConeGeometry(0.007, 0.036, 5), P.birdWing,
      [tc[0] + k * 0.01, tc[1] + (k === 0 ? 0.008 : 0), tc[2] - Math.abs(k) * 0.005], { dir: [k * 0.5, 1, -0.3] });
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildHead({ b, J, P, M }: Ctx) {
  const head = J.head;
  const jaw = J.jaw;
  const r = rng(11);

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const sph = (rad: number, ws = 10, hs = 8) => new THREE.SphereGeometry(rad, ws, hs);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], bone: any = head, extra: any = {}) =>
    b.part(g, c, { bone, at, ...extra });

  // Skull: blocky rounded box built from stacked pieces
  put(box(0.5, 0.4, 0.34), P.furMid, [0, 0.56, 0.46]);
  put(box(0.46, 0.06, 0.3), P.furMid, [0, 0.77, 0.46]);
  put(sph(0.2, 10, 8), P.furMid, [0.17, 0.62, 0.44], head, { scale: [1, 1.1, 1.1] });
  put(sph(0.2, 10, 8), P.furMid, [-0.17, 0.62, 0.44], head, { scale: [1, 1.1, 1.1] });
  // Crown top flat darker patch
  put(box(0.34, 0.012, 0.24), P.furDark, [0, 0.782, 0.44]);

  // Snout: long boxy
  put(box(0.34, 0.24, 0.26), P.snout, [0, 0.52, 0.58]);
  put(box(0.3, 0.05, 0.22), P.furMid, [0, 0.655, 0.57]);
  put(box(0.36, 0.2, 0.06), P.snout, [0, 0.52, 0.7]);
  // Nose pad
  put(box(0.3, 0.13, 0.04), P.nose, [0, 0.56, 0.715]);
  put(sph(0.07, 8, 6), P.nose, [0.1, 0.56, 0.712], head, { scale: [1, 1.1, 0.5] });
  put(sph(0.07, 8, 6), P.nose, [-0.1, 0.56, 0.712], head, { scale: [1, 1.1, 0.5] });
  for (const s of [1, -1]) {
    put(sph(0.022, 6, 4), P.eyeDark, [s * 0.07, 0.565, 0.735], head, { scale: [1, 1.4, 0.6] });
    put(sph(0.01, 5, 4), P.eyeShine, [s * 0.075, 0.572, 0.742], head);
  }
  // Mouth line
  put(box(0.3, 0.008, 0.01), P.eyeDark, [0, 0.455, 0.7]);

  // Lower jaw on jaw joint
  put(box(0.3, 0.07, 0.24), P.furLight, [0, 0.42, 0.58], jaw);
  put(box(0.26, 0.06, 0.05), P.belly, [0, 0.415, 0.7], jaw);
  put(box(0.2, 0.05, 0.1), P.belly, [0, 0.39, 0.5], jaw);

  for (const s of [1, -1]) {
    // Sleepy eyes high on head
    put(sph(0.038, 8, 6), P.eyeDark, [s * 0.2, 0.69, 0.585], head, { scale: [0.7, 1, 0.8] });
    put(sph(0.011, 5, 4), P.eyeShine, [s * 0.2 + 0.008, 0.7, 0.612], head);
    // half lid
    put(box(0.085, 0.03, 0.05), P.furDark, [s * 0.2, 0.708, 0.58], head);
    put(box(0.09, 0.008, 0.05), P.eyeDark, [s * 0.2, 0.692, 0.592], head);
    // ears
    put(sph(0.055, 8, 6), P.furDark, [s * 0.2, 0.78, 0.37], head, { scale: [0.7, 1, 1] });
    put(sph(0.035, 6, 5), P.earInner, [s * 0.2 + s * 0.015, 0.782, 0.385], head, { scale: [0.5, 0.9, 0.9] });
    // blush cheeks
    put(sph(0.04, 7, 5), P.blush, [s * 0.255, 0.58, 0.55], head, { scale: [0.3, 0.8, 1] });
    // nose side fur
    put(box(0.02, 0.1, 0.18), P.furDark, [s * 0.178, 0.52, 0.57]);
    // whiskers
    for (let i = 0; i < 3; i++) {
      const y = 0.5 + i * 0.03;
      b.rod([s * 0.16, y, 0.7], [s * 0.3, y + (i - 1) * 0.025, 0.74], 0.003, P.nose, { bone: head });
    }
    // eyebrow fur
    put(box(0.08, 0.012, 0.03), P.furDark, [s * 0.2, 0.735, 0.58]);
  }

  // Forehead tuft: blades
  for (let i = -2; i <= 2; i++) {
    const x = i * 0.025;
    b.spike([x, 0.775, 0.5 - Math.abs(i) * 0.01], [i * 0.25, 1, 0.3], 0.06 - Math.abs(i) * 0.008 + r() * 0.01, 0.014, {
      color: P.furLight,
      bone: head,
    });
  }
  // Back-of-head neck blend
  put(box(0.44, 0.34, 0.08), P.furMid, [0, 0.54, 0.32]);
  // Fur tufts on cheeks
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++)
      b.spike([s * 0.25, 0.5 - i * 0.03, 0.46 + i * 0.03], [s, -0.3, -0.2], 0.05, 0.013, {
        color: P.furLight,
        bone: head,
      });
}
```

<!-- call: fit-torso -->

The loft body reaches too far forward and back, and the neck sphere extends past the +z face of the box. I'm pulling the loft ends in and shrinking the neck sphere.

<<<<<<< SEARCH
    { at: [0, 0.44, -0.58], w: 0.34, h: 0.34 },
    { at: [0, 0.46, -0.4], w: 0.54, h: 0.48 },
=======
    { at: [0, 0.44, -0.5], w: 0.3, h: 0.3 },
    { at: [0, 0.46, -0.38], w: 0.54, h: 0.48 },
>>>>>>> REPLACE
<<<<<<< SEARCH
    { at: [0, 0.48, 0.4], w: 0.46, h: 0.44 },
  ];
=======
    { at: [0, 0.48, 0.3], w: 0.44, h: 0.42 },
  ];
>>>>>>> REPLACE
<<<<<<< SEARCH
  b.part(new THREE.SphereGeometry(0.25, 10, 8), P.furMid, {
    bone: J.neck,
    at: [0, 0.53, 0.4],
    scale: [1, 0.95, 1.05],
  });
=======
  b.part(new THREE.SphereGeometry(0.2, 10, 8), P.furMid, {
    bone: J.neck,
    at: [0, 0.5, 0.27],
    scale: [1, 0.95, 0.9],
  });
>>>>>>> REPLACE
<<<<<<< SEARCH
    at: [0, 0.45, -0.52],
    scale: [1, 0.95, 0.9],
=======
    at: [0, 0.45, -0.44],
    scale: [1, 0.95, 0.9],
>>>>>>> REPLACE
<<<<<<< SEARCH
    at: [0, 0.42, -0.74],
=======
    at: [0, 0.42, -0.64],
>>>>>>> REPLACE