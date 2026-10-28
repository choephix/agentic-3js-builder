<!-- call: plan -->

```json
{
  "name": "Pixel Monster Truck",
  "description": "A chunky pixel-art monster truck with huge knobbly tyres, a lifted red pickup body, roll cage, light bar and exhaust stacks.",
  "builderName": "pixelMonsterTruck",
  "size": [3.2, 3.3, 5.4],
  "layout": "Pixel-art blocky style: everything is boxes with square-texel look (tileBox/cellPaint with a shared texel of 0.1 m). Four enormous tyres (radius 0.85, width 0.7) sit at the corners with their bottoms on y=0, rims in grey with gold hubs and bolts. A tall chassis frame of dark steel sits on two axles at y=0.85, with leaf-spring shocks and driveshafts. Above it, a red pickup body: hood and grille at the front (+Z), a cab with big windows in the middle, and an open bed at the back with a roll bar and a light bar on the cab roof. Flame decals on the body sides in orange and yellow. Exhaust stacks rise behind the cab. Tyres are chunky tread blocks in near-black with lighter tread-block highlights.",
  "palette": {
    "body": "#d81e1e",
    "bodyDark": "#8f1010",
    "flameOrange": "#ff8a1c",
    "flameYellow": "#ffd93a",
    "glass": "#6fd0ff",
    "glassDark": "#2a6c96",
    "tyre": "#1b1b1f",
    "tyreTread": "#38383f",
    "rim": "#b9bec8",
    "hub": "#e7b814",
    "chassis": "#3a3d46",
    "steel": "#7b808c",
    "shock": "#ffcf2a",
    "spring": "#c7ccd6",
    "grille": "#15151a",
    "headlight": "#fff6b0",
    "tail": "#ff3030",
    "chrome": "#e8ecf2",
    "exhaust": "#5a5e69",
    "lightBar": "#ffffff",
    "bumper": "#2a2c33"
  },
  "mounts": {
    "axleFront": [0, 0.85, 1.7],
    "axleRear": [0, 0.85, -1.6],
    "chassisTop": [0, 1.55, 0],
    "cabFloor": [0, 1.55, -0.1],
    "hoodFront": [0, 2.05, 2.4],
    "bedFloor": [0, 1.75, -1.9],
    "cabRoof": [0, 3.0, -0.2]
  },
  "joints": [
    { "name": "body", "at": [0, 1.55, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "wheelFR", "parent": "body", "at": [-1.3, 0.85, 1.7], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFL", "parent": "body", "at": [1.3, 0.85, 1.7], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.3, 0.85, -1.6], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.3, 0.85, -1.6], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" }
  ],
  "parts": [
    {
      "id": "tyres",
      "builds": "Four huge pixel tyres (octagonal-cylinder or boxy chunks, radius 0.85, width 0.7) with tread blocks around the circumference in tyreTread, grey rims, gold hubs with 6 bolts each, and a dark sidewall ring. Each rides its wheel joint.",
      "box": [[-1.65, 0, -2.45], [1.65, 1.7, 2.55]],
      "attaches": "Centres on the axleFront and axleRear lines at x=±1.3; joints wheelFR, wheelFL, wheelRR, wheelRL.",
      "joints": ["wheelFR", "wheelFL", "wheelRR", "wheelRL"],
      "floor": true,
      "budget": 220
    },
    {
      "id": "chassis",
      "builds": "Dark steel ladder frame with two rails, cross members, front and rear axles with diff housings, yellow shocks with coil springs, leaf springs, driveshafts, steel front bumper with winch, rear bumper, skid plate, and tail lights on the rear bumper.",
      "box": [[-1.1, 0.5, -2.7], [1.1, 1.55, 2.8]],
      "attaches": "Top face at chassisTop supports the bodywork; axles pass through axleFront and axleRear to the tyre hubs.",
      "joints": ["body"],
      "floor": false,
      "budget": 180
    },
    {
      "id": "cab",
      "builds": "Red cab block with sloped windscreen, side windows in glass with darker frames, doors with handles and seams, side mirrors, roof with a white light bar of 6 lamps and a roll-cage-style visor, flame decals in orange and yellow stepped pixel flames on the doors, door number badge.",
      "box": [[-1.05, 1.55, -1.1], [1.05, 3.3, 1.0]],
      "attaches": "Sits on cabFloor; the hood meets its front face at z=1.0, the bed meets its rear face at z=-1.1; roof carries the lightBar at cabRoof.",
      "joints": ["body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "hood",
      "builds": "Front end: sloped red hood with a raised air scoop, fenders over the front tyres with wide arches, black grille with chrome bars, square headlights in headlight colour with dark rims, bull-bar, front lip, hood flame decals, hood stripe in bodyDark.",
      "box": [[-1.1, 1.55, 1.0], [1.1, 2.5, 2.7]],
      "attaches": "Back face at z=1.0 meets the cab; sits on chassisTop; front to hoodFront.",
      "joints": ["body"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "bed",
      "builds": "Open pickup bed behind the cab: floor, side walls with arched wheel wells for the rear tyres, tailgate with seam and handle, inner walls in bodyDark, roll bar hoops in steel with two tall exhaust stacks (exhaust colour with dark tips), spare tyre-free cargo, rear flame decal and tail lights.",
      "box": [[-1.1, 1.55, -2.7], [1.1, 3.0, -1.1]],
      "attaches": "Front face at z=-1.1 meets the cab; floor at bedFloor sits on the chassis.",
      "joints": ["body"],
      "floor": false,
      "budget": 150
    }
  ]
}
```

<!-- call: tyres -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildTyres({ b, J, P, M }: Ctx) {
  const R = 0.85, W = 0.7;
  const r = rng(11);
  const wheels: [string, number, number][] = [
    ["wheelFR", -1.3, M.axleFront[2]],
    ["wheelFL", 1.3, M.axleFront[2]],
    ["wheelRR", -1.3, M.axleRear[2]],
    ["wheelRL", 1.3, M.axleRear[2]],
  ];
  const cyl = (rt: number, rb: number, h: number, seg: number) => new THREE.CylinderGeometry(rt, rb, h, seg);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  for (const [name, x, z] of wheels) {
    const bone = J[name];
    const s = x > 0 ? 1 : -1;
    const c: [number, number, number] = [x, M.axleFront[1], z];
    const ax: [number, number, number] = [1, 0, 0];
    // main tyre body (octagonal, flat-faceted), rotated so a flat sits on the floor
    b.part(cyl(R * 0.93, R * 0.93, W, 16), P.tyre, { bone, at: c, dir: ax, rotation: undefined as any });
    // sidewall rings
    for (const k of [1, -1]) {
      b.part(cyl(R * 0.8, R * 0.8, 0.06, 16), P.chassis, { bone, at: [x + s * k * (W / 2 + 0.01), c[1], z], dir: ax });
      b.part(cyl(R * 0.6, R * 0.6, 0.05, 12), P.tyre, { bone, at: [x + s * k * (W / 2 + 0.04), c[1], z], dir: ax });
    }
    // tread blocks around circumference
    const n = 16;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.PI / n;
      const rr = R * 0.93 + 0.02;
      const py = c[1] + Math.cos(a) * rr * 0.995;
      const pz = z + Math.sin(a) * rr * 0.995;
      for (const k of [-1, 1]) {
        const col = (i + (k > 0 ? 1 : 0)) % 2 ? P.tyreTread : P.tyre;
        const blk = b.part(box(0.3, 0.16, 0.3), col, { bone, at: [x + k * 0.19, py, pz] });
        blk.mesh.rotation.x = -a + Math.PI / 2 * 0;
        blk.mesh.rotation.x = a - Math.PI / 2 + Math.PI / 2;
      }
      // centre lug
      const lug = b.part(box(0.12, 0.14, 0.34), P.tyreTread, { bone, at: [x, py, pz] });
      lug.mesh.rotation.x = a;
    }
    // rim
    const out = x + s * (W / 2 + 0.07);
    b.part(cyl(0.45, 0.45, 0.1, 12), P.rim, { bone, at: [out, c[1], z], dir: ax });
    b.part(cyl(0.5, 0.5, 0.04, 12), P.steel, { bone, at: [x + s * (W / 2 + 0.03), c[1], z], dir: ax });
    // hub
    b.part(cyl(0.2, 0.2, 0.16, 10), P.hub, { bone, at: [out + s * 0.06, c[1], z], dir: ax });
    b.part(cyl(0.07, 0.07, 0.06, 6), P.chassis, { bone, at: [out + s * 0.15, c[1], z], dir: ax });
    // 6 bolts
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(cyl(0.035, 0.035, 0.05, 6), P.chrome, {
        bone,
        at: [out + s * 0.07, c[1] + Math.cos(a) * 0.32, z + Math.sin(a) * 0.32],
        dir: ax,
      });
    }
    // rim spokes
    for (let i = 0; i < 3; i++) {
      const sp = b.part(box(0.04, 0.84, 0.07), P.steel, { bone, at: [out + s * 0.055, c[1], z] });
      sp.mesh.rotation.x = (i / 3) * Math.PI;
    }
    r();
  }
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildCab({ b, J, P, M }: Ctx) {
  const T = 0.1;
  const bone = J.body;
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z] });

  // Cab shell: lower body, pillars, roof
  box(2.0, 0.9, 2.0, P.body, 0, 1.55 + 0.45, -0.1);
  box(2.0, 0.1, 1.5, P.bodyDark, 0, 1.6, -0.35);
  // upper greenhouse
  box(1.9, 0.7, 1.3, P.body, 0, 2.85, -0.45);
  // roof slab
  box(2.1, 0.1, 1.5, P.body, 0, 3.0 + 0.0, -0.4);
  // sloped windscreen: stepped
  for (let i = 0; i < 4; i++) {
    box(1.7, 0.2, 0.1, P.glass, 0, 2.1 + i * 0.2, 0.9 - i * 0.1 - 0.0);
    box(1.9, 0.2, 0.08, P.glassDark, 0, 2.1 + i * 0.2, 0.84 - i * 0.1 - 0.05);
  }
  box(1.9, 0.6, 0.1, P.bodyDark, 0, 2.2, 0.98);
  // rear window
  box(1.5, 0.45, 0.06, P.glass, 0, 2.7, -1.12);
  box(1.6, 0.55, 0.04, P.glassDark, 0, 2.7, -1.1);

  const r = rng(3);
  for (const s of [1, -1]) {
    const x = s * 1.03;
    // side windows with frames
    box(0.06, 0.5, 1.15, P.glassDark, x, 2.65, -0.35);
    box(0.08, 0.4, 0.5, P.glass, x + s * 0.01, 2.65, -0.05);
    box(0.08, 0.4, 0.5, P.glass, x + s * 0.01, 2.65, -0.65);
    // door seams
    box(0.04, 0.8, 0.04, P.grille, x + s * 0.02, 2.0, 0.45);
    box(0.04, 0.8, 0.04, P.grille, x + s * 0.02, 2.0, -0.45);
    box(0.04, 0.04, 0.9, P.grille, x + s * 0.02, 2.42, 0);
    // handle
    box(0.06, 0.06, 0.22, P.chrome, x + s * 0.04, 2.3, 0.3);
    // flames: stepped pixels
    const fl = [[0, 0, 5], [1, 0, 4], [2, 0, 3], [3, 0, 2], [4, 0, 1]];
    for (const [i, , h] of fl) {
      box(0.04, T * h * 0.6, T, P.flameOrange, x + s * 0.03, 1.72 + h * 0.03, -0.4 + i * T * 1.2 + 0.0);
      box(0.045, T * h * 0.3, T, P.flameYellow, x + s * 0.035, 1.7 + h * 0.015, -0.4 + i * T * 1.2);
    }
    box(0.04, 0.1, 0.1, P.flameOrange, x + s * 0.03, 1.85, 0.5 + r() * 0.02);
    // door number badge
    box(0.04, 0.26, 0.26, P.lightBar, x + s * 0.03, 2.05, -0.1);
    box(0.045, 0.2, 0.06, P.grille, x + s * 0.04, 2.05, -0.1);
    box(0.045, 0.06, 0.14, P.grille, x + s * 0.04, 2.1, -0.1);
    // mirrors
    box(0.3, 0.04, 0.04, P.chassis, s * 1.15, 2.4, 0.75);
    box(0.08, 0.26, 0.2, P.bumper, s * 1.3, 2.4, 0.75);
    box(0.02, 0.2, 0.15, P.chrome, s * 1.3, 2.4, 0.86);
    // roll cage visor pillars
    box(0.08, 0.35, 0.08, P.steel, s * 0.95, 3.2, 0.2);
    box(0.08, 0.08, 0.08, P.steel, s * 0.95, 3.0, -1.0);
  }

  // roof visor bar
  box(2.0, 0.08, 0.1, P.steel, 0, 3.12, 0.3);
  box(2.0, 0.06, 0.4, P.bodyDark, 0, 3.07, 0.5);

  // light bar with 6 lamps
  box(1.8, 0.15, 0.2, P.bumper, 0, 3.28, 0.2);
  for (let i = 0; i < 6; i++) {
    const x = -0.75 + i * 0.3;
    box(0.2, 0.1, 0.06, P.lightBar, x, 3.28, 0.32);
    box(0.12, 0.04, 0.02, P.headlight, x, 3.28, 0.35);
  }
  box(0.1, 0.1, 0.1, P.steel, -0.8, 3.1, 0.2);
  box(0.1, 0.1, 0.1, P.steel, 0.8, 3.1, 0.2);
}
```

<!-- call: bed -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildBed({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const T = 0.1; // texel
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at: [x, y, z] });

  const zc = -1.9; // bed centre z
  const L = 1.6; // bed length (-2.7..-1.1)
  const floorY = M.bedFloor[1];

  // floor
  box(2.1, 0.12, L, P.bodyDark, 0, floorY - 0.06 + 0.06, zc);
  box(2.0, 0.1, L - 0.1, P.chassis, 0, floorY - 0.14, zc);
  // ribs on floor
  for (let i = 0; i < 6; i++) box(1.8, 0.03, 0.06, P.bumper, 0, floorY + 0.07, -1.3 - i * 0.24);

  for (const s of [1, -1]) {
    // outer side walls
    const x = s * 1.0;
    // wall segments leaving wheel arch gap between z=-2.3 and -1.5, arch top at y 2.45
    box(0.12, 0.8, 0.35, P.body, x, 2.15, -1.275);
    box(0.12, 0.8, 0.3, P.body, x, 2.15, -2.55);
    // wheel arch: stepped pixel arch
    box(0.12, 0.2, 0.8, P.body, x, 2.7, -1.9);
    box(0.12, 0.15, 1.0, P.body, x, 2.82, -1.9);
    box(0.12, 0.2, 0.6, P.body, x, 2.52, -1.9);
    // top rail
    box(0.16, 0.08, 1.6, P.bodyDark, x, 2.96, zc);
    // arch trim
    box(0.14, 0.06, 0.9, P.bumper, x, 2.43, -1.9);
    // inner walls
    box(0.05, 0.8, 1.5, P.bodyDark, s * 0.92, 2.25, zc);
    // wheel-well inner humps
    box(0.2, 0.3, 0.8, P.bodyDark, s * 0.82, floorY + 0.22, -1.9);
    // flame decal on side (stepped pixels)
    const fl = [
      [-1.35, 2.2, 0.3, 0.2, P.flameOrange],
      [-1.55, 2.3, 0.3, 0.2, P.flameOrange],
      [-2.0, 2.45, 0.3, 0.1, P.flameOrange],
      [-1.35, 2.2, 0.2, 0.1, P.flameYellow],
      [-1.55, 2.3, 0.2, 0.1, P.flameYellow],
      [-2.5, 2.2, 0.2, 0.2, P.flameOrange],
      [-2.5, 2.2, 0.1, 0.1, P.flameYellow],
    ] as const;
    for (const [z, y, w, h, c] of fl) box(0.02, h, w, c, s * 1.07, y, z);
    // roll bar hoops
    box(0.08, 1.0, 0.08, P.steel, s * 0.85, 2.45, -1.3);
    box(0.08, 0.08, 0.1, P.chrome, s * 0.85, 2.97, -1.3);
    // exhaust stacks
    box(0.14, 1.4, 0.14, P.exhaust, s * 0.62, 2.5, -1.25);
    box(0.17, 0.14, 0.17, P.bumper, s * 0.62, 3.2, -1.25);
    box(0.19, 0.06, 0.19, P.steel, s * 0.62, 2.0, -1.25);
    box(0.19, 0.06, 0.19, P.steel, s * 0.62, 2.7, -1.25);
    // tail lights
    box(0.3, 0.2, 0.06, P.tail, s * 0.78, 2.35, -2.73);
    box(0.34, 0.24, 0.03, P.bumper, s * 0.78, 2.35, -2.71);
    box(0.1, 0.06, 0.07, P.headlight, s * 0.78, 2.28, -2.75);
  }

  // roll bar cross
  box(1.76, 0.08, 0.08, P.steel, 0, 2.97, -1.3);
  box(1.7, 0.06, 0.06, P.steel, 0, 2.55, -1.3);
  box(0.06, 0.45, 0.06, P.steel, 0, 2.75, -1.3);
  // front bed wall against cab
  box(2.0, 0.9, 0.1, P.bodyDark, 0, 2.2, -1.15);

  // tailgate
  box(2.0, 0.85, 0.1, P.body, 0, 2.18, -2.65);
  box(1.9, 0.05, 0.02, P.bodyDark, 0, 2.18, -2.71);
  box(0.05, 0.75, 0.02, P.bodyDark, 0, 2.18, -2.71);
  box(0.4, 0.08, 0.06, P.chrome, 0, 2.5, -2.72);
  box(0.4, 0.04, 0.03, P.steel, 0, 2.5, -2.75);
  box(2.1, 0.08, 0.14, P.bodyDark, 0, 2.62, -2.65);
  // rear flame decal on gate
  const g = [
    [-0.6, 0.0, 0.3, 0.3, P.flameOrange],
    [-0.3, 0.0, 0.3, 0.45, P.flameOrange],
    [0.0, 0.0, 0.3, 0.25, P.flameOrange],
    [0.3, 0.0, 0.3, 0.4, P.flameOrange],
    [-0.3, 0.0, 0.2, 0.25, P.flameYellow],
    [0.3, 0.0, 0.2, 0.2, P.flameYellow],
  ] as const;
  for (const [x, , w, h, c] of g) box(w, h, 0.02, c, x, 1.95 + h / 2, -2.72);
  // rear bumper edge
  box(2.1, 0.12, 0.12, P.bumper, 0, 1.78, -2.7);
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildChassis({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const r = rng(5);
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at: [x, y, z] });
  const cyl = (rad: number, len: number, color: string, at: number[], dir: number[], seg = 8) =>
    b.part(new THREE.CylinderGeometry(rad, rad, len, seg), color, { bone, at, dir });

  // ladder frame rails
  for (const s of [1, -1]) {
    box(0.2, 0.28, 5.3, P.chassis, s * 0.5, 1.4, 0.05);
    box(0.06, 0.2, 5.0, P.steel, s * 0.6, 1.4, 0.05);
    // leaf springs
    for (const z of [1.7, -1.6]) {
      for (let i = 0; i < 4; i++) box(0.14, 0.04, 0.9 - i * 0.14, P.steel, s * 0.7, 0.98 + i * 0.04, z);
      // shocks and coils
      cyl(0.05, 0.55, P.shock, [s * 0.85, 1.1, z + 0.25], [s * 0.15, 1, 0]);
      cyl(0.09, 0.3, P.spring, [s * 0.85, 1.05, z + 0.25], [s * 0.15, 1, 0], 6);
      for (let i = 0; i < 4; i++)
        b.part(new THREE.TorusGeometry(0.09, 0.015, 4, 8), P.spring, {
          bone, at: [s * 0.87, 0.95 + i * 0.1, z + 0.25], dir: [0, 1, 0], axis: "z",
        });
      box(0.12, 0.1, 0.12, P.shock, s * 0.8, 1.38, z + 0.25);
    }
  }
  // cross members
  for (let i = 0; i < 6; i++) box(1.1, 0.16, 0.14, P.chassis, 0, 1.38, -2.3 + i * 0.95);
  // top deck plate (supports body)
  box(1.0, 0.06, 4.6, P.chassis, 0, 1.52, 0);

  // axles, diffs, hubs shafts
  for (const z of [1.7, -1.6]) {
    cyl(0.07, 2.6, P.steel, [0, 0.85, z], [1, 0, 0]);
    const d = new THREE.SphereGeometry(0.28, 8, 6);
    b.part(d, P.chassis, { bone, at: [0, 0.85, z], scale: [1, 0.9, 1] });
    box(0.3, 0.2, 0.1, P.steel, 0, 0.85, z + (z > 0 ? 0.26 : -0.26));
    box(0.46, 0.06, 0.1, P.shock, 0, 1.0, z + (z > 0 ? 0.0 : 0.0) + 0.0);
    for (const s of [1, -1]) cyl(0.12, 0.2, P.steel, [s * 1.05, 0.85, z], [1, 0, 0]);
  }
  // driveshafts
  cyl(0.06, 3.0, P.steel, [0, 0.95, 0.05], [0, 0, 1]);
  for (const z of [-1.1, 0.3]) box(0.12, 0.12, 0.12, P.exhaust, 0, 0.95, z);
  cyl(0.1, 0.3, P.exhaust, [0, 1.05, 0.05], [0, 0, 1]);

  // front bumper with winch
  box(2.0, 0.3, 0.25, P.bumper, 0, 0.8, 2.7);
  box(2.0, 0.08, 0.28, P.steel, 0, 0.97, 2.7);
  for (const s of [1, -1]) {
    box(0.2, 0.4, 0.2, P.bumper, s * 0.95, 0.95, 2.6);
    box(0.08, 0.5, 0.08, P.steel, s * 0.5, 1.05, 2.72);
  }
  box(0.5, 0.2, 0.22, P.steel, 0, 0.82, 2.84);
  cyl(0.09, 0.4, P.chassis, [0, 0.82, 2.84], [1, 0, 0]);
  for (let i = 0; i < 3; i++) box(0.46, 0.015, 0.02, P.shock, 0, 0.82 + (i - 1) * 0.0, 2.95);
  cyl(0.03, 0.2, P.spring, [0, 0.82, 2.93], [1, 0, 0], 6);
  box(0.14, 0.1, 0.1, P.shock, 0, 0.7, 2.84);
  // skid plate
  box(0.9, 0.08, 1.2, P.steel, 0, 0.55, 1.2);
  for (let i = 0; i < 4; i++) box(0.06, 0.02, 0.06, P.shock, (i % 2 ? 1 : -1) * 0.35, 0.6, 0.8 + (i >> 1) * 0.8);

  // rear bumper and tail lights
  box(2.0, 0.3, 0.25, P.bumper, 0, 0.9, -2.65);
  box(2.0, 0.06, 0.28, P.steel, 0, 1.07, -2.65);
  box(0.7, 0.1, 0.1, P.steel, 0, 0.7, -2.55);
  for (const s of [1, -1]) {
    box(0.3, 0.2, 0.06, P.chassis, s * 0.8, 0.95, -2.8);
    box(0.24, 0.14, 0.04, P.tail, s * 0.8, 0.95, -2.84);
    box(0.08, 0.04, 0.02, P.headlight, s * 0.85, 0.99, -2.87);
    box(0.1, 0.45, 0.1, P.bumper, s * 0.95, 1.1, -2.55);
  }
  // bolts on rails
  for (let i = 0; i < 12; i++) {
    const z = -2.4 + i * 0.43;
    for (const s of [1, -1]) box(0.04, 0.04, 0.04, P.chrome, s * 0.62, 1.48 + r() * 0.0, z);
  }
}
```

<!-- call: hood -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildHood({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const T = 0.1;
  // box helper: center x,y,z ; size w,h,d
  const bx = (c: string, x: number, y: number, z: number, w: number, h: number, d: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z] });

  const RED = P.body, DARK = P.bodyDark;

  // Hood: stepped slope (pixel stairs) from cab (z=1) to front (z=2.4)
  const steps = 7;
  for (let i = 0; i < steps; i++) {
    const z0 = 1.0 + i * 0.2;
    const top = 2.3 - i * 0.03;
    const h = top - 1.75;
    bx(RED, 0, 1.75 + h / 2, z0 + 0.1, 1.6, h, 0.2);
  }
  // lower front block / nose
  bx(RED, 0, 1.85, 2.3, 1.7, 0.6, 0.2);

  // Hood stripe in bodyDark on top (follows steps)
  for (let i = 0; i < steps; i++) {
    const z0 = 1.0 + i * 0.2;
    const top = 2.3 - i * 0.03;
    bx(DARK, 0, top + 0.006, z0 + 0.1, 0.3, 0.014, 0.2);
  }
  // Air scoop
  bx(DARK, 0, 2.38, 1.55, 0.7, 0.14, 0.5);
  bx(DARK, 0, 2.46, 1.5, 0.6, 0.1, 0.4);
  bx(P.grille, 0, 2.4, 1.82, 0.5, 0.12, 0.04);
  bx(P.chrome, 0, 2.47, 1.3, 0.62, 0.03, 0.04);

  // Hood flame decals: stepped pixel flames on top, both sides of stripe
  for (const s of [1, -1]) {
    for (let k = 0; k < 5; k++) {
      const z = 1.2 + k * 0.22;
      const top = 2.3 - ((z - 1.1) / 0.2) * 0.03;
      const len = 0.3 + (k % 2) * 0.1;
      bx(P.flameOrange, s * (0.4 + len / 2), top + 0.012, z, len, 0.012, 0.1);
      bx(P.flameYellow, s * (0.4 + len / 3), top + 0.02, z, len * 0.5, 0.012, 0.1);
    }
  }

  // Fenders with wide arches over front tyres (x ±1.3, z 1.7)
  for (const s of [1, -1]) {
    const x = s * 0.97;
    // arch: blocks forming staircase arch above tyre
    bx(RED, x, 2.2, 1.7, 0.3, 0.1, 1.5);
    bx(RED, x, 2.05, 1.0 + 0.1, 0.3, 0.4, 0.2);
    bx(RED, x, 2.05, 2.4, 0.3, 0.4, 0.2);
    bx(RED, x, 1.95, 1.2, 0.3, 0.2, 0.2);
    bx(RED, x, 1.95, 2.2, 0.3, 0.2, 0.2);
    bx(DARK, x, 2.27, 1.7, 0.3, 0.04, 1.5);
    // flare lip
    bx(DARK, s * 1.08, 1.9, 1.7, 0.04, 0.06, 1.3);
    // side flame
    bx(P.flameOrange, s * 1.1, 2.0, 1.2, 0.02, 0.1, 0.3);
    bx(P.flameYellow, s * 1.11, 2.02, 1.2, 0.02, 0.05, 0.2);
  }

  // Grille on front face z~2.41
  bx(P.grille, 0, 1.85, 2.43, 1.1, 0.5, 0.06);
  for (let i = 0; i < 4; i++) bx(P.chrome, 0, 1.68 + i * 0.12, 2.47, 1.0, 0.04, 0.04);
  bx(P.chrome, 0, 1.85, 2.47, 0.04, 0.5, 0.04);
  bx(P.chrome, 0, 1.62, 2.45, 1.16, 0.04, 0.06);
  bx(P.chrome, 0, 2.1, 2.45, 1.16, 0.04, 0.06);

  // Headlights
  for (const s of [1, -1]) {
    bx(P.grille, s * 0.78, 1.9, 2.43, 0.3, 0.3, 0.06);
    bx(P.headlight, s * 0.78, 1.9, 2.47, 0.22, 0.22, 0.04);
    bx(P.chrome, s * 0.78, 1.9, 2.5, 0.08, 0.08, 0.02);
  }

  // Bull-bar
  for (const s of [1, -1]) {
    bx(P.chrome, s * 0.55, 1.75, 2.62, 0.07, 0.75, 0.07);
    bx(P.chrome, s * 0.55, 1.65, 2.52, 0.07, 0.07, 0.2);
  }
  bx(P.chrome, 0, 2.1, 2.62, 1.17, 0.07, 0.07);
  bx(P.chrome, 0, 1.75, 2.62, 1.17, 0.07, 0.07);
  bx(P.chrome, 0, 1.6, 2.62, 1.17, 0.07, 0.07);
  bx(P.chrome, 0, 1.9, 2.62, 0.07, 0.4, 0.07);

  // Front lip
  bx(P.bumper, 0, 1.58, 2.5, 1.9, 0.1, 0.4);
  bx(DARK, 0, 1.64, 2.35, 1.8, 0.08, 0.1);
}
```

<!-- call: fit-hood -->

The two bull-bar uprights (`box.body.244` and `box.body.246`) reach down to y = 1.37, so I shortened them and lifted their centres. They now span y 1.58 to 2.13, inside the box.

<<<<<<< SEARCH
    bx(P.chrome, s * 0.55, 1.75, 2.62, 0.07, 0.75, 0.07);
=======
    bx(P.chrome, s * 0.55, 1.855, 2.62, 0.07, 0.55, 0.07);
>>>>>>> REPLACE

<!-- call: fit-cab -->

The mirror pieces stick out past the ±x faces, so I'm pulling the mirror arm and head inward to sit within x = ±1.05.

<<<<<<< SEARCH
    box(0.3, 0.04, 0.04, P.chassis, s * 1.15, 2.4, 0.75);
    box(0.08, 0.26, 0.2, P.bumper, s * 1.3, 2.4, 0.75);
    box(0.02, 0.2, 0.15, P.chrome, s * 1.3, 2.4, 0.86);
=======
    box(0.1, 0.04, 0.04, P.chassis, s * 0.98, 2.4, 0.75);
    box(0.08, 0.26, 0.2, P.bumper, s * 1.01, 2.4, 0.75);
    box(0.02, 0.2, 0.15, P.chrome, s * 1.01, 2.4, 0.86);
>>>>>>> REPLACE

<!-- call: fit-bed -->

The two exhaust stacks stuck out of the top of the box, so I shortened them and lowered their tips to keep everything under y = 3.

<<<<<<< SEARCH
    box(0.14, 1.4, 0.14, P.exhaust, s * 0.62, 2.5, -1.25);
    box(0.17, 0.14, 0.17, P.bumper, s * 0.62, 3.2, -1.25);
=======
    box(0.14, 1.1, 0.14, P.exhaust, s * 0.62, 2.4, -1.25);
    box(0.17, 0.14, 0.17, P.bumper, s * 0.62, 2.93, -1.25);
>>>>>>> REPLACE

<<<<<<< SEARCH
    box(0.19, 0.06, 0.19, P.steel, s * 0.62, 2.7, -1.25);
=======
    box(0.19, 0.06, 0.19, P.steel, s * 0.62, 2.65, -1.25);
>>>>>>> REPLACE

<!-- call: fit-chassis -->

Each block below pulls the flagged pieces back inside the box.

<<<<<<< SEARCH
    cyl(0.07, 2.6, P.steel, [0, 0.85, z], [1, 0, 0]);
=======
    cyl(0.07, 2.2, P.steel, [0, 0.85, z], [1, 0, 0]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    for (const s of [1, -1]) cyl(0.12, 0.2, P.steel, [s * 1.05, 0.85, z], [1, 0, 0]);
=======
    for (const s of [1, -1]) cyl(0.12, 0.1, P.steel, [s * 1.0, 0.85, z], [1, 0, 0]);
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(2.0, 0.3, 0.25, P.bumper, 0, 0.8, 2.7);
  box(2.0, 0.08, 0.28, P.steel, 0, 0.97, 2.7);
=======
  box(2.0, 0.3, 0.25, P.bumper, 0, 0.8, 2.65);
  box(2.0, 0.08, 0.28, P.steel, 0, 0.97, 2.65);
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(0.5, 0.2, 0.22, P.steel, 0, 0.82, 2.84);
  cyl(0.09, 0.4, P.chassis, [0, 0.82, 2.84], [1, 0, 0]);
  for (let i = 0; i < 3; i++) box(0.46, 0.015, 0.02, P.shock, 0, 0.82 + (i - 1) * 0.0, 2.95);
  cyl(0.03, 0.2, P.spring, [0, 0.82, 2.93], [1, 0, 0], 6);
  box(0.14, 0.1, 0.1, P.shock, 0, 0.7, 2.84);
=======
  box(0.5, 0.2, 0.22, P.steel, 0, 0.82, 2.72);
  cyl(0.09, 0.4, P.chassis, [0, 0.82, 2.72], [1, 0, 0]);
  for (let i = 0; i < 3; i++) box(0.46, 0.015, 0.02, P.shock, 0, 0.82, 2.79);
  cyl(0.03, 0.2, P.spring, [0, 0.82, 2.77], [1, 0, 0], 6);
  box(0.14, 0.1, 0.1, P.shock, 0, 0.7, 2.72);
>>>>>>> REPLACE

<<<<<<< SEARCH
    box(0.3, 0.2, 0.06, P.chassis, s * 0.8, 0.95, -2.8);
    box(0.24, 0.14, 0.04, P.tail, s * 0.8, 0.95, -2.84);
    box(0.08, 0.04, 0.02, P.headlight, s * 0.85, 0.99, -2.87);
=======
    box(0.3, 0.2, 0.06, P.chassis, s * 0.8, 0.95, -2.67);
    box(0.24, 0.14, 0.04, P.tail, s * 0.8, 0.95, -2.7);
    box(0.08, 0.04, 0.02, P.headlight, s * 0.85, 0.99, -2.7);
>>>>>>> REPLACE

<!-- call: fit-tyres -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildTyres({ b, J, P, M }: Ctx) {
  const R = 0.85, W = 0.7;
  const r = rng(11);
  const wheels: [string, number, number][] = [
    ["wheelFR", -1.3, M.axleFront[2]],
    ["wheelFL", 1.3, M.axleFront[2]],
    ["wheelRR", -1.3, M.axleRear[2]],
    ["wheelRL", 1.3, M.axleRear[2]],
  ];
  const cyl = (rt: number, rb: number, h: number, seg: number) => new THREE.CylinderGeometry(rt, rb, h, seg);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  for (const [name, x, z] of wheels) {
    const bone = J[name];
    const s = x > 0 ? 1 : -1;
    const cy = M.axleFront[1];
    const ax: [number, number, number] = [1, 0, 0];
    b.part(cyl(R * 0.9, R * 0.9, W, 16), P.tyre, { bone, at: [x, cy, z], dir: ax });
    for (const k of [1, -1]) {
      b.part(cyl(R * 0.8, R * 0.8, 0.04, 16), P.chassis, { bone, at: [x + s * k * 0.33, cy, z], dir: ax });
    }
    const n = 16;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.PI / n;
      const rr = 0.77;
      const py = cy + Math.cos(a) * rr;
      const pz = z + Math.sin(a) * rr;
      const deg = (a * 180) / Math.PI;
      for (const k of [-1, 1]) {
        const col = (i + (k > 0 ? 1 : 0)) % 2 ? P.tyreTread : P.tyre;
        b.part(box(0.3, 0.16, 0.2), col, { bone, at: [x + k * 0.19, py, pz], rotation: [deg, 0, 0] });
      }
      b.part(box(0.12, 0.16, 0.22), P.tyreTread, { bone, at: [x, py, pz], rotation: [deg, 0, 0] });
    }
    const out = x + s * 0.32;
    b.part(cyl(0.45, 0.45, 0.06, 12), P.rim, { bone, at: [out, cy, z], dir: ax });
    b.part(cyl(0.2, 0.2, 0.06, 10), P.hub, { bone, at: [out + s * 0.01, cy, z], dir: ax });
    b.part(cyl(0.07, 0.07, 0.04, 6), P.chassis, { bone, at: [out + s * 0.025, cy, z], dir: ax });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(cyl(0.035, 0.035, 0.04, 6), P.chrome, {
        bone,
        at: [out + s * 0.015, cy + Math.cos(a) * 0.32, z + Math.sin(a) * 0.32],
        dir: ax,
      });
    }
    for (let i = 0; i < 3; i++) {
      b.part(box(0.02, 0.84, 0.07), P.steel, { bone, at: [out + s * 0.025, cy, z], rotation: [i * 60, 0, 0] });
    }
    r();
  }
}
```