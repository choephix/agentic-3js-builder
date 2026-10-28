<!-- call: plan -->

```json
{
  "name": "Nostromo Galley",
  "description": "A cramped, grimy 1979 industrial-spaceship galley kitchen: a steel counter run with hob, sink and cabinets, a wall of pipes and lockers, and a bolted central mess table with stools, lit by sodium-yellow panel lights and green CRT readouts.",
  "builderName": "nostromoGalley",
  "size": [3.6, 2.4, 3.2],
  "layout": "Static prop group, no rig. A rectangular room corner with the viewer at +Z. Back wall at z=-1.5 carries the pipe and locker wall. A steel counter run with hob, sink and cabinets lines the left wall (+X) from z=-1.4 to 1.2. A round-edged bolted mess table with four stools stands in the centre-front. A ceiling and floor rig supplies grated deck, ribbed ceiling beams and light panels. Style: Alien 1979 used-future; off-white and grey-beige panels, dirty steel, black rubber, sodium yellow and orange warning trim, tiny green and amber CRT readouts, dense greebles of pipes, bolts, knobs, stencilled labels, grime streaks. Every piece is a blocky primitive with bolts, seams and trim as separate small parts.",
  "palette": {
    "panelBeige": "#b8b09a",
    "panelGrey": "#7d8085",
    "darkSteel": "#3a3d42",
    "steel": "#a7abb0",
    "black": "#141517",
    "rubber": "#26272a",
    "grime": "#4a4535",
    "warnYellow": "#e2a418",
    "warnOrange": "#c8561a",
    "crtGreen": "#4dff7a",
    "amberLight": "#ffb43c",
    "lightPanel": "#fff0c4",
    "pipeCopper": "#9a5b34",
    "pipeGrey": "#6b6f74",
    "redLabel": "#a52a22",
    "stainless": "#cfd3d6",
    "floorGrate": "#2b2d30",
    "seatVinyl": "#6e3b2c"
  },
  "mounts": {
    "floorTop": [0, 0.08, 0],
    "counterTop": [1.2, 0.95, -0.1],
    "backWallFace": [0, 1.2, -1.45],
    "leftWallFace": [1.75, 1.2, 0],
    "tableTop": [-0.2, 0.82, 0.6],
    "ceilingUnder": [0, 2.25, 0]
  },
  "joints": [],
  "parts": [
    {
      "id": "shell",
      "builds": "Room shell: grated floor deck with plate seams and bolt rows, back and left wall panels in beige with seam lines and bolt heads, yellow-black warning stripe kick strips, ribbed ceiling with beams, four sodium light panels with dark frames, vent grille, door frame on the right with hazard trim and a green-lit label plate, grime streak patches.",
      "box": [[-1.8, 0, -1.5], [1.8, 2.4, 1.6]],
      "attaches": "Floor at floorTop, walls at backWallFace and leftWallFace, ceiling at ceilingUnder; other parts stand on the floor and touch the walls.",
      "joints": [],
      "floor": true,
      "budget": 200
    },
    {
      "id": "counterRun",
      "builds": "Left-wall counter: base cabinets with panel doors, recessed handles, kick plinth, stainless worktop with raised lip, a two-ring hob with knobs and a pot rack, deep sink with tap and drain, a small microwave-like oven with CRT readout, spice racks and clamped storage canisters, stencilled labels and bolts.",
      "box": [[0.9, 0, -1.4], [1.75, 1.6, 1.2]],
      "attaches": "Rests on floorTop against leftWallFace; worktop at counterTop.",
      "joints": [],
      "floor": true,
      "budget": 200
    },
    {
      "id": "pipeWall",
      "builds": "Back wall greeble: banks of locker doors with latches and number stencils, a tall fridge-freezer with handle and amber status light, overhead horizontal and vertical pipe runs in copper and grey with flanges, valve wheels, gauge dials, a wall control panel with green CRT screens, toggle switches, red warning labels, cable bundles.",
      "box": [[-1.75, 0, -1.5], [0.9, 2.3, -1.05]],
      "attaches": "Mounted flush at backWallFace, base on floorTop, pipes reach the ceilingUnder.",
      "joints": [],
      "floor": true,
      "budget": 220
    },
    {
      "id": "messTable",
      "builds": "Central mess table and seating: rounded rectangular steel-edged table with beige top, bolted pedestal and floor flange, a tray set (trays, mugs, cutlery blocks, a food pouch pile, a salt shaker), four swivel stools with vinyl seats, rubber rim and chrome posts, a hanging overhead lamp with yellow shade.",
      "box": [[-1.5, 0, -0.2], [0.8, 1.9, 1.5]],
      "attaches": "Stands on floorTop, tabletop at tableTop, lamp hangs toward ceilingUnder.",
      "joints": [],
      "floor": true,
      "budget": 240
    }
  ]
}
```

<!-- call: messTable -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildMessTable({ b, P }: Ctx) {
  const DEG = Math.PI / 180;
  type V3 = [number, number, number];

  // own colours (6)
  const C = {
    coffee: "#2a1a10",
    olive: "#7d8a3c",
    cream: "#d8c58f",
    seatWorn: "#8a5a40",
    seatDark: "#4a2418",
    white: "#e8e4d8",
  };

  // ---------- helpers ----------
  const put = (geo: THREE.BufferGeometry, color: string, at: V3, rotation?: V3) =>
    b.part(geo, color, rotation ? { at, rotation, flat: true } : { at, flat: true });
  const box = (w: number, h: number, d: number, color: string, at: V3, rot?: V3) =>
    put(new THREE.BoxGeometry(w, h, d), color, at, rot);
  const cyl = (rt: number, rb: number, h: number, color: string, at: V3, seg = 10, rot?: V3) =>
    put(new THREE.CylinderGeometry(rt, rb, h, seg), color, at, rot);
  const ball = (r: number, color: string, at: V3, ws = 8, hs = 6) =>
    put(new THREE.SphereGeometry(r, ws, hs), color, at);
  const torus = (R: number, t: number, color: string, at: V3, rot?: V3, seg = 14) =>
    put(new THREE.TorusGeometry(R, t, 5, seg), color, at, rot);
  // local (lx,lz) of an object at (cx,cz) turned by ang degrees about Y -> world x,z
  const w2 = (cx: number, cz: number, lx: number, lz: number, ang: number): [number, number] => {
    const a = ang * DEG;
    return [cx + lx * Math.cos(a) + lz * Math.sin(a), cz - lx * Math.sin(a) + lz * Math.cos(a)];
  };
  const rrect = (w: number, d: number, r: number, n = 4): [number, number][] => {
    const pts: [number, number][] = [];
    const corners = [
      [1, 1],
      [-1, 1],
      [-1, -1],
      [1, -1],
    ];
    corners.forEach(([sx, sz], i) => {
      const cx = sx * (w / 2 - r);
      const cz = sz * (d / 2 - r);
      for (let k = 0; k <= n; k++) {
        const a = (i * 90 + (k * 90) / n) * DEG;
        pts.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]);
      }
    });
    return pts;
  };

  // ---------- table ----------
  const TX = -0.2;
  const TZ = 0.6;
  const TOP = 0.822;

  // dark under plate, steel rim, beige top
  b.extrude(rrect(1.2, 0.7, 0.1), {
    at: [TX, 0.745, TZ], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.05, color: P.darkSteel,
  });
  b.extrude(rrect(1.3, 0.8, 0.14), {
    at: [TX, 0.795, TZ], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.05, bevel: 0.006, color: P.steel,
  });
  b.extrude(rrect(1.26, 0.76, 0.12), {
    at: [TX, 0.811, TZ], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.022, color: P.panelBeige,
  });

  // inset seam lines
  for (const z of [0.26, 0.94]) box(1.12, 0.002, 0.004, P.darkSteel, [TX, 0.8225, z]);
  for (const x of [TX - 0.56, TX + 0.56]) box(0.004, 0.002, 0.68, P.darkSteel, [x, 0.8225, TZ]);
  // seam bolts
  const topBolts: [number, number][] = [
    [-0.5, 0.26], [0.1, 0.26], [-0.5, 0.94], [0.1, 0.94],
    [-0.76, 0.26], [0.36, 0.26], [-0.76, 0.94], [0.36, 0.94],
    [-0.76, 0.6], [0.36, 0.6],
  ];
  for (const [x, z] of topBolts) cyl(0.012, 0.012, 0.008, P.stainless, [x, 0.826, z], 6);
  // grime stains
  cyl(0.055, 0.055, 0.002, P.grime, [-0.62, 0.8225, 0.56], 7);
  cyl(0.04, 0.04, 0.002, P.grime, [0.22, 0.8225, 0.7], 6);
  box(0.16, 0.002, 0.02, P.grime, [-0.2, 0.8225, 0.97], [0, 12, 0]);

  // end label plates on the rim with stencil bars
  box(0.006, 0.03, 0.2, P.warnYellow, [TX + 0.653, 0.795, TZ]);
  for (const [dz, w] of [[-0.06, 0.03], [-0.005, 0.016], [0.05, 0.045]] as [number, number][])
    box(0.002, 0.018, w, P.black, [TX + 0.656, 0.795, TZ + dz]);
  box(0.006, 0.03, 0.2, P.redLabel, [TX - 0.653, 0.795, TZ]);
  for (const [dz, w] of [[-0.05, 0.04], [0.0, 0.016], [0.05, 0.03]] as [number, number][])
    box(0.002, 0.018, w, C.white, [TX - 0.656, 0.795, TZ + dz]);

  // under-table beams and mount plate
  for (const z of [0.4, 0.8]) box(1.1, 0.04, 0.04, P.darkSteel, [TX, 0.7, z]);
  box(0.4, 0.03, 0.3, P.steel, [TX, 0.695, TZ]);

  // ---------- pedestal ----------
  cyl(0.25, 0.25, 0.12, P.darkSteel, [TX, 0.06, TZ], 12);
  cyl(0.1, 0.2, 0.14, P.panelGrey, [TX, 0.19, TZ], 10);
  cyl(0.065, 0.065, 0.42, P.stainless, [TX, 0.47, TZ], 10);
  for (let k = 0; k < 4; k++) {
    const a = (45 + 90 * k) * DEG;
    cyl(0.014, 0.014, 0.008, P.steel, [TX + Math.sin(a) * 0.19, 0.122, TZ + Math.cos(a) * 0.19], 6);
  }
  for (let k = 0; k < 8; k++) {
    const a = k * 45 * DEG;
    box(0.12, 0.006, 0.04, k % 2 ? P.black : P.warnYellow,
      [TX + Math.sin(a) * 0.222, 0.123, TZ + Math.cos(a) * 0.222], [0, k * 45, 0]);
  }
  cyl(0.085, 0.085, 0.03, P.darkSteel, [TX, 0.3, TZ], 10);
  cyl(0.085, 0.085, 0.03, P.darkSteel, [TX, 0.65, TZ], 10);
  cyl(0.069, 0.069, 0.03, P.warnYellow, [TX, 0.42, TZ], 10);
  cyl(0.0695, 0.0695, 0.008, P.black, [TX, 0.397, TZ], 10);
  // copper conduit with clamps
  cyl(0.011, 0.011, 0.46, P.pipeCopper, [TX, 0.43, TZ - 0.08], 6);
  for (const y of [0.36, 0.55]) cyl(0.019, 0.019, 0.014, P.pipeGrey, [TX, y, TZ - 0.08], 6);
  // amber status LED on a plate
  box(0.04, 0.05, 0.008, P.darkSteel, [TX, 0.52, TZ + 0.067]);
  glow(ball(0.011, P.amberLight, [TX, 0.52, TZ + 0.074]), 1.5);

  // ---------- trays ----------
  const tray = (cx: number, cz: number, ang: number, food: [string, string, string]) => {
    const rot: V3 = [0, ang, 0];
    const L = (lx: number, y: number, lz: number): V3 => {
      const [x, z] = w2(cx, cz, lx, lz, ang);
      return [x, y, z];
    };
    box(0.32, 0.012, 0.22, P.panelGrey, L(0, 0.828, 0), rot);
    for (const s of [1, -1]) {
      box(0.32, 0.02, 0.012, P.darkSteel, L(0, 0.832, s * 0.104), rot);
      box(0.012, 0.02, 0.2, P.darkSteel, L(s * 0.154, 0.832, 0), rot);
    }
    box(0.008, 0.014, 0.2, P.darkSteel, L(0.02, 0.835, 0), rot);
    box(0.13, 0.014, 0.008, P.darkSteel, L(0.085, 0.835, 0), rot);
    cyl(0.045, 0.055, 0.02, food[0], L(-0.075, 0.844, 0), 8);
    box(0.06, 0.02, 0.05, food[1], L(0.088, 0.844, -0.05), [0, ang + 10, 0]);
    box(0.025, 0.022, 0.025, food[2], L(0.07, 0.845, 0.055), [0, ang + 20, 0]);
    box(0.025, 0.022, 0.025, food[2], L(0.108, 0.845, 0.062), [0, ang - 15, 0]);
  };
  tray(-0.55, 0.4, 2, [C.olive, C.cream, P.warnOrange]);
  tray(0.15, 0.4, -3, [C.cream, C.olive, P.redLabel]);
  tray(-0.55, 0.8, -2, [P.warnOrange, C.cream, C.olive]);
  tray(0.15, 0.8, 4, [C.olive, P.warnYellow, P.warnOrange]);

  // ---------- mugs ----------
  const mug = (x: number, z: number, ang: number) => {
    cyl(0.033, 0.03, 0.07, P.stainless, [x, 0.857, z], 10);
    cyl(0.029, 0.029, 0.003, C.coffee, [x, 0.8885, z], 10);
    const [hx, hz] = w2(x, z, 0.04, 0, ang);
    torus(0.02, 0.006, P.stainless, [hx, 0.857, hz], [0, ang, 0], 8);
  };
  mug(-0.3, 0.43, 0);
  mug(-0.08, 0.45, 180);
  mug(-0.3, 0.78, 30);
  mug(-0.08, 0.77, 200);

  // ---------- salt & pepper ----------
  const shaker = (x: number, z: number, body: string, band?: string) => {
    cyl(0.018, 0.018, 0.05, body, [x, 0.847, z], 8);
    cyl(0.012, 0.018, 0.016, P.black, [x, 0.88, z], 8);
    if (band) cyl(0.0185, 0.0185, 0.012, band, [x, 0.845, z], 8);
  };
  shaker(-0.25, 0.62, P.stainless, P.redLabel);
  shaker(-0.18, 0.59, P.darkSteel);

  // ---------- cutlery block ----------
  box(0.12, 0.05, 0.06, P.darkSteel, [-0.52, 0.847, 0.6]);
  for (const lx of [-0.04, -0.013, 0.013, 0.04]) box(0.01, 0.03, 0.005, P.stainless, [-0.52 + lx, 0.887, 0.6]);
  box(0.05, 0.02, 0.003, P.redLabel, [-0.52, 0.845, 0.6315]);

  // ---------- food pouch pile ----------
  const pouch = (cx: number, y: number, cz: number, ang: number, color: string, tilt = 0) => {
    box(0.07, 0.014, 0.1, color, [cx, y, cz], [tilt, ang, 0]);
    const [x, z] = w2(cx, cz, 0, 0.052, ang);
    box(0.07, 0.016, 0.008, P.darkSteel, [x, y, z], [tilt, ang, 0]);
  };
  pouch(0.11, 0.829, 0.6, 8, P.stainless);
  pouch(0.19, 0.829, 0.6, -12, P.warnYellow);
  pouch(0.15, 0.843, 0.595, 25, C.white);
  pouch(0.15, 0.857, 0.605, -5, P.panelGrey, 5);
  pouch(0.16, 0.871, 0.6, 40, P.stainless, -4);

  // ---------- control strip ----------
  box(0.2, 0.012, 0.07, P.darkSteel, [-0.2, 0.828, 0.31]);
  box(0.06, 0.006, 0.044, P.black, [-0.27, 0.834, 0.31]);
  for (const dz of [-0.01, 0, 0.01]) glow(box(0.036, 0.0015, 0.004, P.crtGreen, [-0.272, 0.8375, 0.31 + dz]));
  glow(ball(0.006, P.amberLight, [-0.19, 0.836, 0.295], 6, 4), 1.5);
  glow(ball(0.006, P.crtGreen, [-0.17, 0.836, 0.295], 6, 4), 1.5);
  cyl(0.012, 0.012, 0.014, P.black, [-0.14, 0.841, 0.325], 8);
  cyl(0.012, 0.012, 0.014, P.stainless, [-0.11, 0.841, 0.325], 8);
  cyl(0.007, 0.007, 0.006, P.steel, [-0.15, 0.837, 0.295], 6);
  box(0.004, 0.016, 0.004, P.redLabel, [-0.15, 0.846, 0.295], [20, 0, 0]);

  // ---------- stools ----------
  const stool = (sx: number, sz: number) => {
    cyl(0.16, 0.17, 0.115, P.darkSteel, [sx, 0.0575, sz], 10);
    for (let k = 0; k < 4; k++) {
      const a = (45 + 90 * k) * DEG;
      cyl(0.012, 0.012, 0.008, P.steel, [sx + Math.sin(a) * 0.135, 0.119, sz + Math.cos(a) * 0.135], 6);
    }
    cyl(0.04, 0.09, 0.08, P.darkSteel, [sx, 0.155, sz], 10);
    cyl(0.03, 0.03, 0.205, P.stainless, [sx, 0.2975, sz], 10);
    torus(0.14, 0.012, P.stainless, [sx, 0.24, sz], [90, 0, 0]);
    for (let k = 0; k < 3; k++) {
      const a = k * 120 * DEG;
      box(0.012, 0.01, 0.11, P.stainless, [sx + Math.sin(a) * 0.085, 0.24, sz + Math.cos(a) * 0.085], [0, k * 120, 0]);
    }
    cyl(0.045, 0.045, 0.04, P.darkSteel, [sx, 0.42, sz], 8);
    cyl(0.2, 0.2, 0.05, P.rubber, [sx, 0.485, sz], 14);
    cyl(0.17, 0.19, 0.05, P.seatVinyl, [sx, 0.535, sz], 14);
    cyl(0.13, 0.17, 0.015, P.seatVinyl, [sx, 0.5675, sz], 14);
    torus(0.172, 0.005, C.seatDark, [sx, 0.559, sz], [90, 0, 0], 16);
    cyl(0.012, 0.012, 0.01, C.seatWorn, [sx, 0.578, sz], 6);
  };
  stool(-0.55, 0.03);
  stool(0.15, 0.03);
  stool(-0.55, 1.17);
  stool(0.15, 1.17);

  // ---------- hanging lamp ----------
  const LY = 1.52;
  cyl(0.008, 0.008, 0.48, P.black, [TX, 2.0, TZ], 6);
  cyl(0.014, 0.014, 0.03, P.steel, [TX, 1.9, TZ], 6);
  box(0.03, 0.045, 0.006, P.warnYellow, [TX, 1.96, TZ + 0.012]);
  box(0.02, 0.008, 0.002, P.black, [TX, 1.96, TZ + 0.016]);
  cyl(0.08, 0.08, 0.02, P.darkSteel, [TX, 2.24, TZ], 8);
  cyl(0.02, 0.03, 0.06, P.black, [TX, 2.2, TZ], 8);
  cyl(0.05, 0.05, 0.04, P.darkSteel, [TX, 1.74, TZ], 8);
  b.lathe(
    [[0.045, 0.17], [0.045, 0.2], [0.07, 0.2], [0.255, 0.03], [0.255, 0], [0.24, 0]],
    { at: [TX, LY, TZ], segments: 12, color: P.warnYellow },
  );
  torus(0.25, 0.01, P.warnOrange, [TX, LY + 0.012, TZ], [90, 0, 0], 16);
  torus(0.212, 0.008, P.black, [TX, LY + 0.0713, TZ], [90, 0, 0], 16);
  for (let k = 0; k < 6; k++) {
    const a = k * 60 * DEG;
    ball(0.008, P.stainless, [TX + Math.sin(a) * 0.164, LY + 0.1127, TZ + Math.cos(a) * 0.164], 5, 4);
  }
  cyl(0.02, 0.02, 0.05, P.black, [TX, LY + 0.14, TZ], 8);
  glow(ball(0.042, P.amberLight, [TX, LY + 0.085, TZ], 8, 6), 1.5);
  glow(cyl(0.19, 0.19, 0.006, P.lightPanel, [TX, LY + 0.03, TZ], 12), 1);
}
```

<!-- call: counterRun -->

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { catmull, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCounterRun({ b, P }: Ctx) {
  const R = rng(1979);
  // A few own flat colours (5) on top of the shared palette.
  const C = { door: "#c4bca6", blue: "#3d6a8c", jar: "#8a8f6a", white: "#e8e2d0", rust: "#7a4a2a" };

  // ---------- batching: every small piece is placed in model space, then merged per colour ----------
  const groups = new Map<string, THREE.BufferGeometry[]>();
  const V = new THREE.Vector3();
  const S = new THREE.Vector3(1, 1, 1);
  const Q = new THREE.Quaternion();
  const E = new THREE.Euler();
  const M4 = new THREE.Matrix4();
  const put = (geo: THREE.BufferGeometry, color: string, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) => {
    Q.setFromEuler(E.set(rx, ry, rz));
    geo.applyMatrix4(M4.compose(V.set(x, y, z), Q, S));
    const list = groups.get(color);
    if (list) list.push(geo);
    else groups.set(color, [geo]);
  };
  const box = (color: string, x: number, y: number, z: number, sx: number, sy: number, sz: number, rx = 0, ry = 0, rz = 0) =>
    put(new THREE.BoxGeometry(sx, sy, sz), color, x, y, z, rx, ry, rz);
  // cylinder: r = bottom radius (rTop defaults to r); axis x points to +x with the top
  const cyl = (color: string, x: number, y: number, z: number, r: number, h: number, axis: "x" | "y" | "z" = "y", seg = 8, rTop = r) => {
    const g = new THREE.CylinderGeometry(rTop, r, h, seg);
    if (axis === "x") put(g, color, x, y, z, 0, 0, -Math.PI / 2);
    else if (axis === "z") put(g, color, x, y, z, Math.PI / 2, 0, 0);
    else put(g, color, x, y, z, 0, Math.PI / seg, 0);
  };
  const torus = (color: string, x: number, y: number, z: number, r: number, tube: number, flat = true) =>
    put(new THREE.TorusGeometry(r, tube, 5, 14), color, x, y, z, flat ? Math.PI / 2 : 0, 0, 0);

  // stencil bars on a plane facing -x (the room) or +z (the end)
  const barsX = (color: string, x: number, y: number, zc: number, n: number, span: number, hgt: number) => {
    for (let i = 0; i < n; i++) {
      const w = (span / n) * (0.4 + R() * 0.4);
      box(color, x, y, zc - span / 2 + ((i + 0.5) * span) / n, 0.003, hgt, w);
    }
  };
  const barsZ = (color: string, z: number, y: number, xc: number, n: number, span: number, hgt: number) => {
    for (let i = 0; i < n; i++) {
      const w = (span / n) * (0.4 + R() * 0.4);
      box(color, xc - span / 2 + ((i + 0.5) * span) / n, y, z, w, hgt, 0.003);
    }
  };
  const plate = (color: string, x: number, y: number, z: number, w: number, h: number, bars: number, barCol = C.white) => {
    box(color, x, y, z, 0.004, h, w);
    barsX(barCol, x - 0.003, y, z, bars, w * 0.8, h * 0.28);
    box(barCol, x - 0.003, y - h * 0.3, z, 0.003, 0.006, w * 0.7);
  };

  // ---------- dimensions ----------
  const WALL = 1.75;

  // ---------- plinth with hazard kick strip ----------
  box(P.black, 1.41, 0.05, -0.1, 0.68, 0.1, 2.6);
  for (let z = -1.37; z < 1.18; z += 0.07) box(P.warnYellow, 1.0675, 0.05, z, 0.005, 0.088, 0.024, 0.7, 0, 0);
  for (let i = 0; i < 9; i++) {
    const z = -1.35 + R() * 2.5;
    box(P.grime, 1.0655, 0.014, z, 0.004, 0.026, 0.05 + R() * 0.15);
  }
  for (const z of [-1.2, 0.2, 1.0]) box(C.rust, 1.0655, 0.03, z, 0.004, 0.03, 0.04);

  // ---------- carcass ----------
  box(P.darkSteel, 1.385, 0.49, -1.1, 0.73, 0.78, 0.6); // section 1
  box(P.darkSteel, 1.385, 0.49, -0.475, 0.73, 0.78, 0.65); // section 2 (hob / oven)
  box(P.darkSteel, 1.385, 0.49, 0.91, 0.73, 0.78, 0.52); // section 4 drawers
  // section 3 (sink) is a hollow shell so the basin has room
  box(P.darkSteel, 1.385, 0.115, 0.25, 0.73, 0.03, 0.8);
  box(P.darkSteel, 1.74, 0.49, 0.25, 0.02, 0.78, 0.8);
  box(P.darkSteel, 1.385, 0.49, -0.1425, 0.73, 0.78, 0.015);
  box(P.darkSteel, 1.385, 0.49, 0.6425, 0.73, 0.78, 0.015);
  box(P.black, 1.025, 0.49, 0.25, 0.01, 0.78, 0.8);
  box(P.darkSteel, 1.085, 0.86, 0.25, 0.13, 0.04, 0.8);

  // end plate (viewer side, +z) with hazard panel
  box(P.panelGrey, 1.375, 0.49, 1.185, 0.75, 0.78, 0.03);
  box(C.door, 1.375, 0.5, 1.198, 0.6, 0.6, 0.004);
  for (const sx of [-1, 1])
    for (const sy of [-1, 1]) cyl(P.stainless, 1.375 + sx * 0.29, 0.5 + sy * 0.29, 1.1995, 0.009, 0.007, "z", 6);
  box(P.warnYellow, 1.375, 0.2, 1.1985, 0.5, 0.06, 0.004);
  for (let x = 1.15; x < 1.6; x += 0.05) box(P.black, x, 0.2, 1.2, 0.02, 0.06, 0.003, 0, 0, 0.6);
  box(P.redLabel, 1.375, 0.62, 1.1985, 0.3, 0.1, 0.004);
  barsZ(C.white, 1.2, 0.63, 1.375, 7, 0.24, 0.03);
  box(C.white, 1.375, 0.585, 1.2, 0.2, 0.006, 0.003);
  box(P.grime, 1.2, 0.35, 1.2, 0.03, 0.2, 0.003);
  box(P.grime, 1.55, 0.42, 1.2, 0.02, 0.14, 0.003);

  // ---------- doors and drawers (front faces at x = 1.0) ----------
  const door = (
    z0: number, z1: number, y0: number, y1: number,
    o: { col?: string; emb?: string; kind?: "vert" | "horiz" | "none"; side?: number } = {},
  ) => {
    const g = 0.006;
    const zc = (z0 + z1) / 2;
    const yc = (y0 + y1) / 2;
    const w = z1 - z0 - 2 * g;
    const h = y1 - y0 - 2 * g;
    box(o.col ?? P.panelBeige, 1.01, yc, zc, 0.02, h, w);
    if (w > 0.2 && h > 0.14) box(o.emb ?? C.door, 0.998, yc, zc, 0.004, h - 0.09, w - 0.09);
    if (h > 0.15)
      for (const sz of [-1, 1])
        for (const sy of [-1, 1]) cyl(P.stainless, 0.997, yc + sy * (h / 2 - 0.02), zc + sz * (w / 2 - 0.02), 0.008, 0.007, "x", 6);
    const kind = o.kind ?? "vert";
    if (kind === "vert") {
      const hz = zc + (o.side ?? 1) * (w / 2 - 0.05);
      const hy = y1 - 0.2;
      box(P.black, 0.9975, hy, hz, 0.004, 0.17, 0.034);
      cyl(P.steel, 0.99, hy, hz, 0.006, 0.13, "y", 6);
      for (const s of [-1, 1]) box(P.darkSteel, 0.994, hy + s * 0.06, hz, 0.008, 0.01, 0.01);
    } else if (kind === "horiz") {
      box(P.black, 0.9975, yc, zc, 0.004, 0.034, 0.17);
      cyl(P.steel, 0.99, yc, zc, 0.006, 0.13, "z", 6);
      for (const s of [-1, 1]) box(P.darkSteel, 0.994, yc, zc + s * 0.055, 0.008, 0.01, 0.01);
    }
    // grime: streaks hanging from the top, a dirty foot
    for (let i = 0; i < 2; i++) {
      const hh = 0.08 + R() * 0.18;
      box(P.grime, 0.9955, y1 - 0.1 - hh / 2 - R() * 0.1, zc + (R() - 0.5) * (w - 0.06), 0.002, hh, 0.008 + R() * 0.02);
    }
    if (y0 < 0.15) box(P.grime, 0.9955, y0 + 0.03, zc, 0.002, 0.04, w * (0.6 + R() * 0.35));
  };

  door(-1.4, -1.1, 0.1, 0.88, { side: 1 });
  door(-1.1, -0.8, 0.1, 0.88, { side: -1 });
  plate(P.redLabel, 0.9945, 0.55, -1.25, 0.12, 0.06, 4);
  door(-0.8, -0.15, 0.1, 0.77, { col: P.panelGrey, emb: P.pipeGrey, kind: "none" });
  door(-0.15, 0.25, 0.1, 0.88, { side: 1 });
  door(0.25, 0.65, 0.1, 0.88, { side: -1 });
  plate(C.blue, 0.9945, 0.5, 0.45, 0.1, 0.06, 4);
  door(0.65, 1.17, 0.1, 0.34, { kind: "horiz" });
  door(0.65, 1.17, 0.34, 0.58, { kind: "horiz" });
  door(0.65, 1.17, 0.58, 0.88, { kind: "horiz" });
  plate(P.stainless, 0.9945, 0.78, 0.91, 0.12, 0.035, 5, P.black);
  box(P.warnYellow, 0.9945, 0.27, 1.12, 0.004, 0.02, 0.04);

  // ---------- oven door + control fascia (section 2) ----------
  box(P.black, 1.01, 0.82, -0.475, 0.02, 0.1, 0.64);
  box(P.steel, 0.9955, 0.46, -0.475, 0.004, 0.34, 0.51);
  box(P.black, 0.9925, 0.46, -0.475, 0.005, 0.32, 0.49);
  box(P.darkSteel, 0.9915, 0.57, -0.475, 0.003, 0.012, 0.42);
  cyl(P.black, 0.955, 0.7, -0.475, 0.012, 0.5, "z", 6);
  for (const s of [-1, 1]) cyl(P.darkSteel, 0.978, 0.7, -0.475 + s * 0.25, 0.008, 0.04, "x", 6);
  for (let i = 0; i < 3; i++) box(P.black, 0.9955, 0.2 + i * 0.02, -0.475, 0.003, 0.008, 0.4);
  box(P.warnYellow, 0.9945, 0.15, -0.475, 0.004, 0.04, 0.3);
  barsX(P.black, 0.992, 0.15, -0.475, 8, 0.26, 0.022);
  for (let i = 0; i < 4; i++) {
    const z = -0.7 + i * 0.13;
    cyl(P.darkSteel, 0.997, 0.82, z, 0.032, 0.01, "x", 8);
    cyl(P.stainless, 0.98, 0.82, z, 0.022, 0.03, "x", 8);
    box(P.warnYellow, 0.9645, 0.835, z, 0.004, 0.014, 0.004);
    barsX(C.white, 0.9985, 0.866, z, 3, 0.04, 0.007);
  }
  box(P.black, 0.9975, 0.83, -0.215, 0.004, 0.052, 0.075);
  box(P.crtGreen, 0.9955, 0.83, -0.215, 0.003, 0.04, 0.062);
  barsX(P.black, 0.994, 0.84, -0.215, 5, 0.05, 0.007);
  barsX(P.black, 0.994, 0.82, -0.215, 3, 0.04, 0.007);
  cyl(P.amberLight, 0.997, 0.788, -0.215, 0.007, 0.008, "x", 6);

  // ---------- worktop ----------
  box(P.stainless, 1.375, 0.915, -0.6875, 0.75, 0.07, 1.425);
  box(P.stainless, 1.375, 0.915, 0.8875, 0.75, 0.07, 0.625);
  box(P.stainless, 1.075, 0.915, 0.3, 0.15, 0.07, 0.55);
  box(P.stainless, 1.7, 0.915, 0.3, 0.1, 0.07, 0.55);
  box(P.steel, 1.006, 0.9625, -0.1, 0.012, 0.025, 2.6); // raised front lip
  box(P.steel, 1.375, 0.9625, -1.394, 0.75, 0.025, 0.012);
  box(P.steel, 1.375, 0.9625, 1.194, 0.75, 0.025, 0.012);
  box(P.steel, 1.74, 1.0, -0.1, 0.02, 0.1, 2.6); // back lip
  box(P.warnOrange, 0.998, 0.905, -0.1, 0.004, 0.012, 2.6); // orange trim stripe
  for (const z of [-0.8, 0.65]) box(P.darkSteel, 1.375, 0.9515, z, 0.75, 0.003, 0.004);
  box(P.grime, 1.08, 0.951, -0.95, 0.1, 0.001, 0.05);
  box(P.grime, 1.2, 0.951, 0.82, 0.08, 0.001, 0.12);
  box(P.grime, 1.1, 0.951, 1.12, 0.12, 0.001, 0.05);
  box(P.grime, 1.5, 0.951, -1.15, 0.05, 0.001, 0.2);

  // ---------- hob ----------
  box(P.steel, 1.4, 0.956, -0.45, 0.52, 0.012, 0.62);
  box(P.black, 1.4, 0.966, -0.45, 0.5, 0.008, 0.6);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) cyl(P.stainless, 1.4 + sx * 0.24, 0.9635, -0.45 + sz * 0.29, 0.007, 0.004, "y", 6);
  const burner = (cz: number, ro: number) => {
    cyl(P.darkSteel, 1.4, 0.972, cz, ro, 0.004, "y", 10);
    torus(P.steel, 1.4, 0.977, cz, ro * 0.72, 0.008);
    torus(P.warnOrange, 1.4, 0.979, cz, ro * 0.42, 0.007);
    cyl(P.black, 1.4, 0.98, cz, ro * 0.2, 0.012, "y", 8);
    box(P.darkSteel, 1.4, 1.0, cz, ro * 2.5, 0.012, 0.012);
    box(P.darkSteel, 1.4, 1.0, cz, 0.012, 0.012, ro * 2.5);
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]])
      cyl(P.darkSteel, 1.4 + dx * ro * 1.2, 0.985, cz + dz * ro * 1.2, 0.007, 0.03, "y", 6);
  };
  burner(-0.6, 0.1);
  burner(-0.3, 0.08);

  // ---------- backsplash behind hob and sink ----------
  box(P.stainless, 1.742, 1.2, -0.46, 0.016, 0.5, 0.72);
  box(P.darkSteel, 1.74, 1.455, -0.46, 0.02, 0.012, 0.72);
  box(P.stainless, 1.742, 1.15, 0.3, 0.016, 0.4, 0.6);
  box(P.darkSteel, 1.74, 1.355, 0.3, 0.02, 0.012, 0.6);
  for (const z of [-0.8, -0.12, 0.02, 0.58])
    for (const y of [1.0, 1.42]) cyl(P.steel, 1.732, y, z, 0.007, 0.006, "x", 6);
  for (const z of [-0.62, -0.38, -0.2]) box(P.grime, 1.7335, 1.15, z, 0.002, 0.1 + R() * 0.12, 0.012 + R() * 0.02);
  box(P.grime, 1.7335, 1.1, 0.1, 0.002, 0.15, 0.02);
  box(P.grime, 1.7335, 1.15, 0.45, 0.002, 0.12, 0.015);

  // ---------- sink ----------
  box(P.steel, 1.4, 0.66, 0.3, 0.5, 0.02, 0.55);
  box(P.stainless, 1.1575, 0.8, 0.3, 0.015, 0.3, 0.55);
  box(P.stainless, 1.6425, 0.8, 0.3, 0.015, 0.3, 0.55);
  box(P.stainless, 1.4, 0.8, 0.0325, 0.47, 0.3, 0.015);
  box(P.stainless, 1.4, 0.8, 0.5675, 0.47, 0.3, 0.015);
  box(P.steel, 1.155, 0.953, 0.3, 0.03, 0.006, 0.59);
  box(P.steel, 1.645, 0.953, 0.3, 0.03, 0.006, 0.59);
  box(P.steel, 1.4, 0.953, 0.02, 0.47, 0.006, 0.02);
  box(P.steel, 1.4, 0.953, 0.58, 0.47, 0.006, 0.02);
  cyl(P.darkSteel, 1.4, 0.672, 0.3, 0.038, 0.008, "y", 8);
  cyl(P.black, 1.4, 0.677, 0.3, 0.007, 0.004, "y", 5);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    cyl(P.black, 1.4 + Math.cos(a) * 0.022, 0.677, 0.3 + Math.sin(a) * 0.022, 0.006, 0.004, "y", 4);
  }
  box(P.black, 1.632, 0.86, 0.3, 0.004, 0.015, 0.04);
  box(P.grime, 1.3, 0.671, 0.42, 0.18, 0.002, 0.08);
  box(P.grime, 1.5, 0.671, 0.16, 0.1, 0.002, 0.1);
  box(P.grime, 1.2, 0.75, 0.0405, 0.012, 0.15, 0.002);
  // tap: base, gooseneck, spout tip, red/blue levers
  cyl(P.stainless, 1.7, 0.975, 0.3, 0.03, 0.05, "y", 8);
  b.sweep(
    catmull([
      [1.7, 0.99, 0.3],
      [1.7, 1.12, 0.3],
      [1.69, 1.22, 0.3],
      [1.62, 1.27, 0.3],
      [1.55, 1.24, 0.3],
      [1.52, 1.16, 0.3],
    ]),
    0.014,
    { color: P.stainless },
  );
  cyl(P.darkSteel, 1.52, 1.14, 0.3, 0.017, 0.035, "y", 8);
  for (const [z, col] of [[0.2, P.redLabel], [0.4, C.blue]] as const) {
    cyl(P.stainless, 1.72, 0.99, z, 0.011, 0.05, "y", 6);
    box(col, 1.71, 1.02, z, 0.05, 0.014, 0.014);
  }

  // ---------- microwave-like oven with CRT ----------
  box(P.panelBeige, 1.535, 1.11, 0.935, 0.41, 0.29, 0.43);
  for (const x of [1.36, 1.71])
    for (const z of [0.745, 1.125]) box(P.darkSteel, x, 0.957, z, 0.03, 0.014, 0.03);
  box(P.panelGrey, 1.325, 1.11, 0.8725, 0.01, 0.26, 0.275);
  box(P.steel, 1.3195, 1.1, 0.87, 0.003, 0.215, 0.255);
  box(P.black, 1.318, 1.1, 0.87, 0.004, 0.2, 0.24);
  box(P.darkSteel, 1.3165, 1.17, 0.87, 0.002, 0.015, 0.2);
  cyl(P.steel, 1.3, 1.11, 0.998, 0.008, 0.15, "y", 6);
  for (const y of [1.05, 1.17]) box(P.darkSteel, 1.31, y, 0.998, 0.02, 0.01, 0.01);
  box(P.darkSteel, 1.3275, 1.11, 1.085, 0.005, 0.26, 0.11);
  box(P.black, 1.3235, 1.195, 1.085, 0.004, 0.05, 0.095);
  box(P.crtGreen, 1.321, 1.195, 1.085, 0.003, 0.04, 0.08);
  barsX(P.black, 1.3185, 1.205, 1.085, 6, 0.07, 0.007);
  barsX(P.black, 1.3185, 1.185, 1.085, 4, 0.06, 0.007);
  for (const z of [1.05, 1.085, 1.12])
    for (const y of [1.13, 1.1]) box(P.steel, 1.323, y, z, 0.006, 0.022, 0.022);
  box(P.redLabel, 1.323, 1.065, 1.05, 0.006, 0.02, 0.022);
  cyl(P.black, 1.318, 1.025, 1.085, 0.022, 0.02, "x", 8);
  box(P.warnYellow, 1.3075, 1.04, 1.085, 0.004, 0.02, 0.004);
  for (let i = 0; i < 6; i++) box(P.black, 1.55, 1.2555, 0.78 + i * 0.06, 0.2, 0.002, 0.008);
  box(P.warnYellow, 1.3285, 0.985, 1.085, 0.003, 0.012, 0.1);
  box(P.grime, 1.3285, 1.08, 0.74, 0.002, 0.14, 0.012);

  // upper wall cabinet above the oven
  box(P.panelBeige, 1.65, 1.49, 0.945, 0.2, 0.22, 0.45);
  box(C.door, 1.548, 1.49, 0.945, 0.004, 0.18, 0.41);
  box(P.warnYellow, 1.5485, 1.585, 0.945, 0.004, 0.012, 0.45);
  box(P.black, 1.546, 1.46, 0.835, 0.004, 0.11, 0.032);
  cyl(P.steel, 1.538, 1.46, 0.835, 0.006, 0.09, "y", 6);
  for (const sz of [-1, 1])
    for (const sy of [-1, 1]) cyl(P.stainless, 1.546, 1.49 + sy * 0.085, 0.945 + sz * 0.195, 0.007, 0.006, "x", 6);
  plate(P.redLabel, 1.5455, 1.52, 1.05, 0.1, 0.05, 4);

  // ---------- storage canisters, clamped to the wall ----------
  for (let i = 0; i < 3; i++) {
    const z = -1.3 + i * 0.16;
    cyl(P.stainless, 1.65, 1.05, z, 0.065, 0.2, "y", 8);
    cyl(P.darkSteel, 1.65, 1.165, z, 0.07, 0.03, "y", 8);
    cyl(P.black, 1.65, 1.195, z, 0.016, 0.02, "y", 6);
    cyl(P.warnYellow, 1.65, 0.965, z, 0.067, 0.022, "y", 8);
    for (const y of [1.0, 1.1]) {
      cyl(P.darkSteel, 1.65, y, z, 0.069, 0.016, "y", 8);
      box(P.darkSteel, 1.7245, y, z, 0.02, 0.014, 0.03);
    }
    box(P.steel, 1.737, 1.1, z, 0.006, 0.03, 0.05);
    box(P.redLabel, 1.5885, 1.06, z, 0.004, 0.07, 0.06);
    barsX(C.white, 1.5855, 1.065, z, 4, 0.045, 0.02);
    box(C.white, 1.5855, 1.03, z, 0.003, 0.005, 0.04);
  }

  // ---------- spice racks ----------
  const jarLids = [P.warnYellow, P.warnOrange, P.redLabel, P.stainless, C.white];
  const shelf = (y: number, zc: number, len: number) => {
    box(P.steel, 1.685, y, zc, 0.13, 0.012, len);
    box(P.darkSteel, 1.622, y + 0.016, zc, 0.006, 0.03, len);
    for (const s of [-1, 1]) {
      box(P.darkSteel, 1.7, y - 0.04, zc + s * (len / 2 - 0.02), 0.12, 0.01, 0.01, 0, 0, -0.6);
      box(P.darkSteel, 1.744, y - 0.02, zc + s * (len / 2 - 0.02), 0.012, 0.06, 0.02);
    }
  };
  shelf(1.27, -1.12, 0.52);
  shelf(1.47, -1.12, 0.52);
  for (let i = 0; i < 8; i++) {
    const z = -1.35 + i * 0.06;
    cyl(C.jar, 1.69, 1.31, z, 0.028, 0.07, "y", 6);
    cyl(C.white, 1.69, 1.31, z, 0.0295, 0.022, "y", 6);
    cyl(jarLids[i % 5], 1.69, 1.352, z, 0.03, 0.016, "y", 6);
  }
  for (let i = 0; i < 6; i++) {
    const z = -1.34 + i * 0.075;
    const hgt = 0.05 + R() * 0.04;
    box(i % 2 ? P.pipeGrey : P.stainless, 1.69, 1.476 + hgt / 2, z, 0.075, hgt, 0.055);
    box(i % 3 === 0 ? P.warnYellow : P.redLabel, 1.6515, 1.476 + hgt / 2, z, 0.003, hgt * 0.5, 0.04);
  }
  box(P.grime, 1.62, 1.2, -1.12, 0.002, 0.04, 0.5);

  // ---------- extractor hood and pot rack above the hob ----------
  box(P.darkSteel, 1.6, 1.55, -0.45, 0.3, 0.1, 0.7);
  for (let i = 0; i < 4; i++) box(P.black, 1.4475, 1.52 + i * 0.02, -0.45, 0.004, 0.008, 0.5);
  box(P.warnYellow, 1.4485, 1.508, -0.45, 0.003, 0.012, 0.7);
  box(P.amberLight, 1.6, 1.4975, -0.62, 0.15, 0.004, 0.12);
  box(P.amberLight, 1.6, 1.4975, -0.28, 0.15, 0.004, 0.12);
  cyl(P.steel, 1.58, 1.42, -0.45, 0.01, 0.7, "z", 6);
  for (const z of [-0.785, -0.115]) box(P.darkSteel, 1.665, 1.42, z, 0.17, 0.02, 0.012);
  const hook = (z: number) => torus(P.steel, 1.58, 1.425, z, 0.016, 0.003, false);
  const pan = (z: number, r: number, deep: number) => {
    hook(z);
    box(P.black, 1.58, 1.34, z, 0.014, 0.14, 0.014);
    cyl(P.darkSteel, 1.58, 1.27 - r, z, r, deep, "x", 10);
    cyl(P.black, 1.5695, 1.27 - r, z, r * 0.88, 0.004, "x", 10);
    cyl(P.steel, 1.59, 1.27 - r, z, r * 1.02, 0.006, "x", 10);
  };
  pan(-0.7, 0.085, 0.02);
  pan(-0.5, 0.065, 0.07);
  pan(-0.32, 0.085, 0.02);
  hook(-0.17);
  box(P.black, 1.58, 1.32, -0.17, 0.012, 0.2, 0.012);
  cyl(P.stainless, 1.58, 1.19, -0.17, 0.03, 0.035, "x", 8);

  // ---------- wall plates above the sink ----------
  plate(P.redLabel, 1.7445, 1.45, 0.3, 0.24, 0.1, 6);
  plate(P.warnYellow, 1.7445, 1.45, 0.1, 0.12, 0.1, 4, P.black);
  box(P.black, 1.744, 1.5, 0.5, 0.008, 0.12, 0.12);
  box(P.black, 1.7395, 1.5, 0.5, 0.004, 0.1, 0.1);
  box(P.crtGreen, 1.7375, 1.51, 0.5, 0.003, 0.07, 0.08);
  barsX(P.black, 1.7358, 1.53, 0.5, 5, 0.07, 0.01);
  barsX(P.black, 1.7358, 1.5, 0.5, 4, 0.06, 0.01);
  cyl(P.amberLight, 1.7375, 1.455, 0.5, 0.008, 0.006, "x", 6);

  // ---------- flush ----------
  for (const [color, geos] of groups) {
    const merged = mergeGeometries(geos, false);
    if (!merged) continue;
    const part = b.part(merged, color, { at: [0, 0, 0], flat: true });
    if (color === P.crtGreen) glow(part, 1.3);
    else if (color === P.amberLight) glow(part, 1.1);
  }
}
```

<!-- call: shell -->

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildShell({ b, P, M }: Ctx) {
  const r = rng(1979);

  // Extra colours (kept under the 6-colour allowance)
  const BEIGE_LT = "#c6bfa8";
  const OFFWHITE = "#d9d3c0";
  const STREAK = "#2f2b20";

  const FT = M.floorTop[1]; // 0.08
  const CEIL = M.ceilingUnder[1]; // 2.25
  const BACK = M.backWallFace[2]; // -1.45
  const LEFT = M.leftWallFace[0]; // 1.75
  const RIGHT = -LEFT;

  // ------------------------------------------------------------------------------------------
  // Geometry collectors: everything is merged per colour (and per glow strength) at the end.
  const buckets = new Map<string, THREE.BufferGeometry[]>();
  const glows = new Map<string, { color: string; s: number; list: THREE.BufferGeometry[] }>();
  const prep = (g: THREE.BufferGeometry) => {
    const n = g.index ? g.toNonIndexed() : g;
    n.clearGroups();
    return n;
  };
  const push = (color: string, g: THREE.BufferGeometry) => {
    let l = buckets.get(color);
    if (!l) buckets.set(color, (l = []));
    l.push(prep(g));
  };
  const gl = (color: string, s: number, g: THREE.BufferGeometry) => {
    const key = `${color}|${s}`;
    let e = glows.get(key);
    if (!e) glows.set(key, (e = { color, s, list: [] }));
    e.list.push(prep(g));
  };
  const tf = (g: THREE.BufferGeometry, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) => {
    if (rx) g.rotateX(rx);
    if (ry) g.rotateY(ry);
    if (rz) g.rotateZ(rz);
    g.translate(x, y, z);
    return g;
  };
  const boxG = (w: number, h: number, d: number, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) =>
    tf(new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz);
  const cylG = (rt: number, rb: number, h: number, seg: number, x: number, y: number, z: number, axis = "y") => {
    const g = new THREE.CylinderGeometry(rt, rb, h, seg);
    if (axis === "x") g.rotateZ(Math.PI / 2);
    else if (axis === "z") g.rotateX(Math.PI / 2);
    g.translate(x, y, z);
    return g;
  };
  const box = (c: string, w: number, h: number, d: number, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) =>
    push(c, boxG(w, h, d, x, y, z, rx, ry, rz));
  const cyl = (c: string, rt: number, rb: number, h: number, seg: number, x: number, y: number, z: number, axis = "y") =>
    push(c, cylG(rt, rb, h, seg, x, y, z, axis));

  // ------------------------------------------------------------------------------------------
  // Wall-face helpers. u runs along the wall (x on the back wall, z on the side walls),
  // v is height, lift is distance off the panel face into the room.
  type Face = "back" | "left" | "right";
  const FC = {
    back: { c: BACK, into: 1 },
    left: { c: LEFT, into: -1 },
    right: { c: RIGHT, into: 1 },
  };
  const wgeo = (face: Face, a: number, h: number, t: number, u: number, v: number, lift: number) => {
    const { c, into } = FC[face];
    const off = c + into * (lift + t / 2);
    return face === "back" ? boxG(a, h, t, u, v, off) : boxG(t, h, a, off, v, u);
  };
  const ons = (face: Face, color: string, a: number, h: number, t: number, u: number, v: number, lift = 0) =>
    push(color, wgeo(face, a, h, t, u, v, lift));
  const onsG = (face: Face, color: string, s: number, a: number, h: number, t: number, u: number, v: number, lift = 0) =>
    gl(color, s, wgeo(face, a, h, t, u, v, lift));
  const bolt = (face: Face, color: string, u: number, v: number, lift = 0, rad = 0.014, h = 0.012) => {
    const { c, into } = FC[face];
    const off = c + into * (lift + h / 2);
    if (face === "back") cyl(color, rad, rad, h, 6, u, v, off, "z");
    else cyl(color, rad, rad, h, 6, off, v, u, "x");
  };
  const streak = (face: Face, u: number, vTop: number, len: number, w: number, color: string) =>
    ons(face, color, w, len, 0.002, u, vTop - len / 2, 0.001);

  // Stencilled label plate: background plate with rows of text-like bars.
  const label = (face: Face, u: number, v: number, w: number, h: number, bg: string, fg: string, lift = 0) => {
    ons(face, bg, w, h, 0.006, u, v, lift);
    const rows = h > 0.1 ? 3 : 2;
    for (let i = 0; i < rows; i++) {
      const bw = w * (0.4 + r() * 0.4);
      const vv = v + h * 0.28 * (rows === 3 ? 1 - i : 0.5 - i);
      ons(face, fg, bw, h * 0.13, 0.003, u - w / 2 + bw / 2 + w * 0.08, vv, lift + 0.006);
    }
  };

  // Hazard stripes: black base plate with yellow slanted parallelograms.
  const hazardGeos = (len: number, h: number, s: number, depth: number) => {
    const out: THREE.BufferGeometry[] = [];
    const w = s * 0.7;
    const skew = h * 0.7;
    const period = s * 1.4;
    for (let x = 0; x + w + skew <= len + 1e-6; x += period) {
      const sh = new THREE.Shape();
      sh.moveTo(x, 0);
      sh.lineTo(x + w, 0);
      sh.lineTo(x + w + skew, h);
      sh.lineTo(x + skew, h);
      sh.closePath();
      out.push(new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false }));
    }
    return out;
  };
  const hazardM = (
    len: number,
    h: number,
    s: number,
    bx: [number, number, number],
    by: [number, number, number],
    origin: [number, number, number],
    depth = 0.006,
  ) => {
    const X = new THREE.Vector3(...bx);
    const Y = new THREE.Vector3(...by);
    const Z = new THREE.Vector3().crossVectors(X, Y);
    const m = new THREE.Matrix4().makeBasis(X, Y, Z).setPosition(origin[0], origin[1], origin[2]);
    for (const g of hazardGeos(len, h, s, depth)) {
      g.applyMatrix4(m);
      push(P.warnYellow, g);
    }
  };
  const hz = (face: Face, uA: number, uB: number, v0: number, v1: number, lift = 0, s = v1 - v0) => {
    const { c, into } = FC[face];
    const len = uB - uA;
    const h = v1 - v0;
    ons(face, P.black, len, h, 0.01, (uA + uB) / 2, (v0 + v1) / 2, lift);
    const o = c + into * (lift + 0.01);
    if (face === "back") hazardM(len, h, s, [1, 0, 0], [0, 1, 0], [uA, v0, o]);
    else if (face === "left") hazardM(len, h, s, [0, 0, 1], [0, 1, 0], [o, v0, uA]);
    else hazardM(len, h, s, [0, 0, -1], [0, 1, 0], [o, v0, uB]);
  };

  // ------------------------------------------------------------------------------------------
  // FLOOR DECK: dark base, grated tiles with raised plate borders, bolt rows, hazard lips.
  box(P.black, 3.6, FT - 0.02, 3.1, 0, (FT - 0.02) / 2, 0.05);
  const xs = [-1.8, -0.9, 0, 0.9, 1.8];
  const zs = [-1.5, -0.725, 0.05, 0.825, 1.6];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const x0 = xs[i], x1 = xs[i + 1], z0 = zs[j], z1 = zs[j + 1];
      const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      const bt = 0.035;
      const yb = FT - 0.01;
      box(P.panelGrey, w, 0.02, bt, cx, yb, z0 + bt / 2);
      box(P.panelGrey, w, 0.02, bt, cx, yb, z1 - bt / 2);
      box(P.panelGrey, bt, 0.02, d - 2 * bt, x0 + bt / 2, yb, cz);
      box(P.panelGrey, bt, 0.02, d - 2 * bt, x1 - bt / 2, yb, cz);
      if ((i + j) % 2) {
        const n = Math.floor((w - 2 * bt) / 0.075);
        for (let k = 0; k < n; k++) box(P.darkSteel, 0.03, 0.02, d - 2 * bt, x0 + bt + 0.0375 + k * 0.075, yb, cz);
      } else {
        const n = Math.floor((d - 2 * bt) / 0.075);
        for (let k = 0; k < n; k++) box(P.darkSteel, w - 2 * bt, 0.02, 0.03, cx, yb, z0 + bt + 0.0375 + k * 0.075);
      }
    }
  }
  for (let k = 1; k < 4; k++) {
    for (let x = -1.6; x <= 1.61; x += 0.4) cyl(P.steel, 0.016, 0.016, 0.012, 6, x, FT + 0.004, zs[k]);
    for (let z = -1.3; z <= 1.45; z += 0.45) cyl(P.steel, 0.016, 0.016, 0.012, 6, xs[k], FT + 0.004, z);
  }
  // Front-edge hazard lip
  box(P.black, 3.6, 0.01, 0.1, 0, FT + 0.005, 1.55);
  hazardM(3.6, 0.1, 0.1, [1, 0, 0], [0, 0, -1], [-1.8, FT + 0.01, 1.6]);
  // Door threshold plate with hazard stripes
  box(P.black, 0.25, 0.01, 0.9, -1.555, FT + 0.005, -0.4);
  hazardM(0.9, 0.25, 0.1, [0, 0, 1], [1, 0, 0], [-1.68, FT + 0.01, -0.85]);
  // Rubber mat in front of the counter
  box(P.rubber, 0.4, 0.012, 1.6, 0.68, FT + 0.006, -0.5);
  for (let k = 0; k < 14; k++) box(P.black, 0.36, 0.004, 0.025, 0.68, FT + 0.013, -1.25 + k * 0.115);
  // Oil / grime stains on the deck
  for (const [sx, sz, sr] of [
    [-1.1, -0.5, 0.26],
    [0.4, 1.0, 0.2],
    [-0.3, -1.1, 0.22],
    [1.1, 1.2, 0.16],
  ] as [number, number, number][]) {
    const g = new THREE.CylinderGeometry(sr, sr, 0.002, 9);
    g.scale(1.4, 1, 0.8);
    g.translate(sx, FT + 0.001, sz);
    push(P.grime, g);
  }

  // ------------------------------------------------------------------------------------------
  // WALLS: dark base, tiled beige panels, bolts at seam crossings, kick strips, grime.
  const wall = (face: Face, u0: number, u1: number, cols: number, bu0: number, bu1: number) => {
    const a = (u1 - u0) / cols;
    ons(face, P.darkSteel, bu1 - bu0, 2.4, 0.038, (bu0 + bu1) / 2, 1.2, -0.05);
    const rows: [number, number][] = [
      [0.2, 1.0],
      [1.0, 1.8],
      [1.8, 2.22],
    ];
    rows.forEach(([v0, v1], ri) => {
      for (let k = 0; k < cols; k++) {
        const roll = r();
        const col =
          roll < 0.1
            ? P.panelGrey
            : ri === 0
              ? roll < 0.55
                ? P.panelBeige
                : BEIGE_LT
              : roll < 0.4
                ? OFFWHITE
                : roll < 0.75
                  ? BEIGE_LT
                  : P.panelBeige;
        ons(face, col, a - 0.012, v1 - v0 - 0.012, 0.012, u0 + (k + 0.5) * a, (v0 + v1) / 2, -0.012);
      }
    });
    for (let k = 1; k < cols; k++) {
      for (const v of [0.27, 1.0, 1.8, 2.15]) {
        const u = u0 + k * a;
        bolt(face, P.steel, u, v);
        if (r() < 0.4) streak(face, u, v - 0.012, 0.08 + r() * 0.2, 0.014 + r() * 0.01, r() < 0.5 ? P.grime : STREAK);
      }
    }
    // Large grime stains rising from the floor
    for (let i = 0; i < 5; i++) {
      const w = 0.2 + r() * 0.4;
      const h = 0.15 + r() * 0.35;
      const u = bu0 + 0.2 + r() * (bu1 - bu0 - 0.4);
      ons(face, r() < 0.5 ? P.grime : STREAK, w, h, 0.002, u, 0.2 + h / 2, 0.0015);
    }
    // Kick strip
    hz(face, bu0 + 0.05, bu1 - 0.05, FT, 0.18);
    // Crown trim
    ons(face, P.darkSteel, bu1 - bu0, 0.08, 0.04, (bu0 + bu1) / 2, 2.26, 0);
  };
  wall("back", -1.75, 1.75, 7, -1.8, 1.8);
  wall("left", -1.45, 1.6, 5, -1.5, 1.6);
  wall("right", -1.45, 1.6, 5, -1.5, 1.6);

  // Corner and end posts
  box(P.steel, 0.03, 2.14, 0.03, LEFT - 0.015, 1.15, BACK + 0.015);
  box(P.steel, 0.06, 2.14, 0.06, RIGHT + 0.03, 1.15, BACK + 0.03);
  box(P.panelGrey, 0.06, 2.14, 0.04, LEFT - 0.03, 1.15, 1.58);
  box(P.panelGrey, 0.06, 2.14, 0.04, RIGHT + 0.03, 1.15, 1.58);
  for (const y of [0.4, 1.0, 1.6, 2.1]) {
    cyl(P.steel, 0.012, 0.012, 0.012, 6, LEFT - 0.03, y, 1.605, "z");
    cyl(P.steel, 0.012, 0.012, 0.012, 6, RIGHT + 0.03, y, 1.605, "z");
  }

  // Yellow trim band (left wall full, right wall around the door)
  const band = (face: Face, uc: number, a: number) => {
    ons(face, P.warnYellow, a, 0.05, 0.006, uc, 2.0, 0.0);
    ons(face, P.black, a, 0.008, 0.008, uc, 1.968, 0.0);
    ons(face, P.black, a, 0.008, 0.008, uc, 2.032, 0.0);
  };
  band("left", 0.075, 3.0);
  band("right", -1.2, 0.5);
  band("right", 0.875, 1.45);

  // Conduits near the ceiling on both side walls
  cyl(P.pipeGrey, 0.025, 0.025, 3.05, 8, RIGHT + 0.03, 2.17, 0.075, "z");
  cyl(P.pipeGrey, 0.025, 0.025, 3.05, 8, LEFT - 0.03, 2.17, 0.075, "z");
  cyl(P.pipeCopper, 0.02, 0.02, 3.0, 8, LEFT - 0.025, 2.115, 0.075, "z");
  cyl(P.black, 0.012, 0.012, 3.0, 6, LEFT - 0.05, 2.1, 0.075, "z");
  for (let z = -1.3; z <= 1.5; z += 0.45) {
    cyl(P.darkSteel, 0.033, 0.033, 0.025, 8, RIGHT + 0.03, 2.17, z, "z");
    box(P.darkSteel, 0.03, 0.03, 0.02, RIGHT + 0.015, 2.17, z);
    cyl(P.darkSteel, 0.033, 0.033, 0.025, 8, LEFT - 0.03, 2.17, z, "z");
    box(P.darkSteel, 0.03, 0.03, 0.02, LEFT - 0.015, 2.17, z);
    cyl(P.darkSteel, 0.028, 0.028, 0.02, 8, LEFT - 0.025, 2.115, z, "z");
  }

  // ------------------------------------------------------------------------------------------
  // CEILING: slab, ribs, beams, sodium light panels, detector.
  box(P.panelGrey, 3.6, 0.1, 3.1, 0, 2.35, 0.05);
  for (let x = -1.7; x <= 1.71; x += 0.2) box(P.darkSteel, 0.03, 0.02, 3.0, x, CEIL + 0.04, 0.05);
  for (const bz of [-0.95, 0.55]) {
    box(P.darkSteel, 3.5, 0.05, 0.14, 0, CEIL + 0.025, bz);
    box(P.panelGrey, 3.5, 0.008, 0.2, 0, CEIL + 0.004, bz);
    for (let x = -1.6; x <= 1.61; x += 0.3) cyl(P.steel, 0.012, 0.012, 0.01, 6, x, CEIL - 0.008, bz);
  }
  box(P.darkSteel, 0.12, 0.05, 3.0, 0, CEIL + 0.025, 0.05);
  for (let z = -1.3; z <= 1.5; z += 0.3) cyl(P.steel, 0.012, 0.012, 0.01, 6, 0, CEIL - 0.008, z);

  for (const lx of [-0.9, 0.9]) {
    for (const lz of [-0.2, 1.1]) {
      const W = 0.8, D = 0.44;
      box(P.darkSteel, W, 0.05, 0.04, lx, CEIL + 0.025, lz - D / 2 + 0.02);
      box(P.darkSteel, W, 0.05, 0.04, lx, CEIL + 0.025, lz + D / 2 - 0.02);
      box(P.darkSteel, 0.04, 0.05, D - 0.08, lx - W / 2 + 0.02, CEIL + 0.025, lz);
      box(P.darkSteel, 0.04, 0.05, D - 0.08, lx + W / 2 - 0.02, CEIL + 0.025, lz);
      gl(P.lightPanel, 1.3, boxG(W - 0.08, 0.02, D - 0.08, lx, CEIL + 0.03, lz));
      box(P.darkSteel, 0.02, 0.025, D - 0.08, lx, CEIL + 0.0225, lz);
      for (const sgn of [-1, 1]) {
        gl(P.amberLight, 1.2, boxG(W - 0.1, 0.004, 0.022, lx, CEIL + 0.017, lz + sgn * (D / 2 - 0.065)));
        for (const sx of [-1, 1]) cyl(P.steel, 0.012, 0.012, 0.01, 6, lx + sx * (W / 2 - 0.02), CEIL - 0.004, lz + sgn * (D / 2 - 0.02));
      }
    }
  }
  // Smoke detector under the beam crossing
  cyl(OFFWHITE, 0.07, 0.07, 0.03, 10, 0, CEIL - 0.015, 0.55);
  cyl(P.darkSteel, 0.03, 0.03, 0.006, 8, 0, CEIL - 0.033, 0.55);
  gl(P.redLabel, 1.5, cylG(0.008, 0.008, 0.006, 6, 0.045, CEIL - 0.032, 0.55));

  // ------------------------------------------------------------------------------------------
  // VENT GRILLE on the back wall above the counter
  {
    const vu = 1.3, vv = 1.95;
    ons("back", P.darkSteel, 0.5, 0.04, 0.03, vu, vv + 0.13);
    ons("back", P.darkSteel, 0.5, 0.04, 0.03, vu, vv - 0.13);
    ons("back", P.darkSteel, 0.04, 0.22, 0.03, vu - 0.23, vv);
    ons("back", P.darkSteel, 0.04, 0.22, 0.03, vu + 0.23, vv);
    ons("back", P.black, 0.42, 0.22, 0.006, vu, vv);
    for (let i = 0; i < 6; i++) box(P.steel, 0.42, 0.02, 0.012, vu, vv - 0.09 + i * 0.036, BACK + 0.014, 0.6);
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) bolt("back", P.steel, vu + sx * 0.23, vv + sy * 0.13, 0.03, 0.01, 0.01);
    // dirty streaks under the vent
    streak("back", vu - 0.12, vv - 0.14, 0.4, 0.03, STREAK);
    streak("back", vu + 0.1, vv - 0.14, 0.3, 0.02, P.grime);
  }
  label("back", 1.66, 1.72, 0.14, 0.07, P.redLabel, OFFWHITE);
  label("back", 1.0, 2.12, 0.16, 0.07, P.warnYellow, P.black);
  label("back", 1.45, 2.14, 0.2, 0.06, P.warnOrange, P.black);

  // ------------------------------------------------------------------------------------------
  // DOOR on the right wall (z -0.85..0.05) with hazard trim, leaf, windows, label plate.
  {
    const zc = -0.4;
    // frame
    ons("right", P.darkSteel, 0.1, 1.92, 0.07, -0.9, 1.04);
    ons("right", P.darkSteel, 0.1, 1.92, 0.07, 0.1, 1.04);
    ons("right", P.darkSteel, 1.1, 0.14, 0.07, zc, 2.07);
    // hazard jambs
    for (const jz of [-0.95, 0.05]) {
      ons("right", P.black, 0.1, 1.92, 0.01, jz + 0.05, 1.04, 0.07);
      hazardM(1.92, 0.1, 0.1, [0, 1, 0], [0, 0, 1], [RIGHT + 0.08, FT, jz]);
    }
    // header: hazard strip on top, label plate below
    ons("right", P.black, 1.1, 0.04, 0.01, zc, 2.12, 0.07);
    hazardM(1.1, 0.04, 0.04, [0, 0, -1], [0, 1, 0], [RIGHT + 0.08, 2.1, 0.15]);
    ons("right", P.black, 0.76, 0.08, 0.008, zc, 2.06, 0.07);
    onsG("right", P.crtGreen, 1.3, 0.7, 0.05, 0.004, zc, 2.06, 0.078);
    for (let i = 0; i < 7; i++) {
      const bw = 0.04 + r() * 0.05;
      ons("right", P.black, bw, 0.026, 0.002, zc - 0.3 + i * 0.1, 2.06, 0.082);
    }
    // leaf (recessed so its face sits 1 cm proud of the wall)
    ons("right", P.panelGrey, 0.9, 1.92, 0.03, zc, 1.04, -0.02);
    ons("right", P.black, 0.012, 1.92, 0.004, zc, 1.04, 0.01);
    for (const v of [0.45, 0.95, 1.4]) ons("right", P.darkSteel, 0.86, 0.04, 0.012, zc, v, 0.01);
    for (const uz of [-0.62, -0.18]) {
      cyl(P.steel, 0.085, 0.085, 0.014, 8, RIGHT + 0.017, 1.65, uz, "x");
      cyl(P.black, 0.065, 0.065, 0.018, 8, RIGHT + 0.019, 1.65, uz, "x");
      gl(P.crtGreen, 0.6, cylG(0.02, 0.02, 0.004, 6, RIGHT + 0.029, 1.65, uz, "x"));
    }
    for (const uz of [-0.47, -0.33]) {
      ons("right", P.steel, 0.02, 0.36, 0.025, uz, 1.0, 0.012);
      ons("right", P.darkSteel, 0.03, 0.03, 0.014, uz, 0.84, 0.012);
      ons("right", P.darkSteel, 0.03, 0.03, 0.014, uz, 1.16, 0.012);
    }
    onsG("right", P.amberLight, 1.4, 0.05, 0.025, 0.006, zc - 0.2, 1.86, 0.012);
    onsG("right", P.crtGreen, 1.4, 0.05, 0.025, 0.006, zc + 0.2, 1.86, 0.012);
    for (const v of [0.2, 0.7, 1.2, 1.7]) {
      bolt("right", P.steel, zc - 0.42, v, 0.01, 0.012, 0.01);
      bolt("right", P.steel, zc + 0.42, v, 0.01, 0.012, 0.01);
    }
  }

  // Control panel beside the door
  {
    const cu = 0.3, cv = 1.25;
    ons("right", P.darkSteel, 0.2, 0.28, 0.04, cu, cv);
    ons("right", P.black, 0.15, 0.11, 0.006, cu, cv + 0.06, 0.04);
    onsG("right", P.crtGreen, 1.3, 0.12, 0.08, 0.004, cu, cv + 0.06, 0.046);
    for (let i = 0; i < 3; i++) ons("right", P.black, 0.05 + r() * 0.05, 0.008, 0.002, cu - 0.015, cv + 0.085 - i * 0.025, 0.05);
    const cols = [P.amberLight, P.redLabel, P.crtGreen];
    cols.forEach((c, i) => {
      const z = cu - 0.055 + i * 0.055;
      if (c === P.redLabel) cyl(c, 0.015, 0.015, 0.012, 8, RIGHT + 0.046, cv - 0.07, z, "x");
      else gl(c, 1.4, cylG(0.015, 0.015, 0.012, 8, RIGHT + 0.046, cv - 0.07, z, "x"));
    });
    for (let i = 0; i < 3; i++) {
      ons("right", P.steel, 0.012, 0.03, 0.02, cu - 0.05 + i * 0.05, cv - 0.02, 0.04);
    }
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) bolt("right", P.steel, cu + sx * 0.09, cv + sy * 0.12, 0.04, 0.01, 0.008);
  }

  // Notice board
  {
    const nu = 0.7, nv = 1.4;
    ons("right", P.darkSteel, 0.46, 0.36, 0.02, nu, nv);
    ons("right", BEIGE_LT, 0.42, 0.32, 0.006, nu, nv, 0.02);
    const sheets: [number, number, number, number][] = [
      [0.58, 1.45, 0.12, 0.16],
      [0.72, 1.38, 0.14, 0.12],
      [0.85, 1.46, 0.1, 0.14],
    ];
    for (const [su, sv, sw, sh] of sheets) {
      ons("right", OFFWHITE, sw, sh, 0.003, su, sv, 0.026);
      for (let i = 0; i < 3; i++) ons("right", P.black, sw * 0.7, 0.008, 0.002, su, sv + sh * 0.25 - i * sh * 0.25, 0.029);
      ons("right", P.redLabel, 0.012, 0.012, 0.006, su, sv + sh / 2 - 0.012, 0.029);
    }
  }
  label("right", 1.2, 1.3, 0.22, 0.09, P.redLabel, OFFWHITE);
  label("right", -1.25, 1.5, 0.18, 0.08, P.warnYellow, P.black);

  // Speaker grille
  {
    const su = 1.2, sv = 1.8;
    cyl(P.darkSteel, 0.11, 0.11, 0.03, 12, RIGHT + 0.015, sv, su, "x");
    cyl(P.black, 0.092, 0.092, 0.006, 12, RIGHT + 0.033, sv, su, "x");
    for (const rr of [0.07, 0.05, 0.03]) push(P.steel, tf(new THREE.TorusGeometry(rr, 0.004, 4, 12), RIGHT + 0.037, sv, su, 0, Math.PI / 2, 0));
    cyl(P.steel, 0.012, 0.012, 0.008, 6, RIGHT + 0.037, sv, su, "x");
  }
  // Amber warning beacon
  cyl(P.darkSteel, 0.045, 0.045, 0.02, 8, RIGHT + 0.01, 1.75, 0.3, "x");
  gl(P.amberLight, 1.6, cylG(0.033, 0.033, 0.05, 8, RIGHT + 0.045, 1.75, 0.3, "x"));
  cyl(P.darkSteel, 0.036, 0.036, 0.01, 8, RIGHT + 0.075, 1.75, 0.3, "x");
  for (const a of [-1, 1]) box(P.steel, 0.05, 0.006, 0.006, RIGHT + 0.045, 1.75 + a * 0.02, 0.3, 0, 0, 0);

  // ------------------------------------------------------------------------------------------
  // FIRE CABINET on the left wall, beyond the counter run
  {
    const fu = 1.4;
    ons("left", P.redLabel, 0.32, 0.52, 0.06, fu, 1.35);
    ons("left", P.black, 0.24, 0.34, 0.006, fu, 1.32, 0.06);
    ons("left", OFFWHITE, 0.1, 0.03, 0.004, fu, 1.32, 0.066);
    ons("left", OFFWHITE, 0.03, 0.1, 0.004, fu, 1.32, 0.066);
    ons("left", P.warnYellow, 0.26, 0.05, 0.006, fu, 1.57, 0.06);
    ons("left", P.black, 0.2, 0.012, 0.002, fu, 1.57, 0.066);
    ons("left", P.steel, 0.02, 0.07, 0.02, fu + 0.1, 1.32, 0.066);
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) bolt("left", P.steel, fu + sx * 0.14, 1.35 + sy * 0.23, 0.06, 0.01, 0.008);
    label("left", fu, 1.78, 0.2, 0.08, P.redLabel, OFFWHITE);
  }

  // Grime near the ceiling joints (soot above lights)
  for (const lx of [-0.9, 0.9]) {
    for (const lz of [-0.2, 1.1]) box(P.grime, 0.9, 0.002, 0.5, lx, CEIL + 0.0005, lz);
  }

  // ------------------------------------------------------------------------------------------
  // Flush merged geometry into the builder.
  for (const [color, list] of buckets) {
    const g = mergeGeometries(list, false);
    if (g) b.part(g, color, { at: [0, 0, 0], flat: true, name: `shell_${color.slice(1)}` });
  }
  for (const e of glows.values()) {
    const g = mergeGeometries(e.list, false);
    if (g) glow(b.part(g, e.color, { at: [0, 0, 0], flat: true, name: `shellglow_${e.color.slice(1)}` }), e.s);
  }
}
```

<!-- call: pipeWall -->

```ts
import * as THREE from "three";
import { catmull, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildPipeWall({ b, P, M }: Ctx) {
  const R = rng(1979);
  const PI = Math.PI;
  const Z0 = M.backWallFace[2]; // wall face, -1.45

  // own colours (5)
  const STENCIL = "#e8e2cf";
  const CRTDARK = "#0f1f16";
  const REDLED = "#ff4a30";
  const INSET = "#cdc6ae";
  const DOORGREY = "#8d8f8c";

  // ---------------------------------------------------------------- collector
  type Grp = { color: string; strength: number; geos: THREE.BufferGeometry[] };
  const groups = new Map<string, Grp>();
  let tris = 1100; // reserve for the cable sweeps
  const BUDGET = 14700;
  const _e = new THREE.Euler();
  const _q = new THREE.Quaternion();
  const _p = new THREE.Vector3();
  const _s = new THREE.Vector3(1, 1, 1);
  const _m = new THREE.Matrix4();

  function put(
    color: string,
    geo: THREE.BufferGeometry,
    x: number,
    y: number,
    z: number,
    rot: [number, number, number] = [0, 0, 0],
    g = 0,
  ) {
    const n = (geo.index ? geo.index.count : geo.attributes.position.count) / 3;
    if (tris + n > BUDGET) {
      geo.dispose();
      return;
    }
    tris += n;
    _e.set(rot[0], rot[1], rot[2]);
    _q.setFromEuler(_e);
    _m.compose(_p.set(x, y, z), _q, _s);
    geo.applyMatrix4(_m);
    const key = `${color}|${g}`;
    let grp = groups.get(key);
    if (!grp) groups.set(key, (grp = { color, strength: g, geos: [] }));
    grp.geos.push(geo);
  }

  const box = (c: string, w: number, h: number, d: number, x: number, y: number, z: number, rz = 0, g = 0, rx = 0) =>
    put(c, new THREE.BoxGeometry(w, h, d), x, y, z, [rx, 0, rz], g);
  const plane = (c: string, w: number, h: number, x: number, y: number, z: number, rz = 0, g = 0) =>
    put(c, new THREE.PlaneGeometry(w, h), x, y, z, [0, 0, rz], g);
  const circle = (c: string, r: number, x: number, y: number, z: number, seg = 12, g = 0) =>
    put(c, new THREE.CircleGeometry(r, seg), x, y, z, [0, 0, 0], g);
  const cyl = (
    c: string,
    r: number,
    len: number,
    axis: "x" | "y" | "z",
    x: number,
    y: number,
    z: number,
    seg = 8,
    g = 0,
    r2 = r,
  ) =>
    put(
      c,
      new THREE.CylinderGeometry(r2, r, len, seg),
      x,
      y,
      z,
      axis === "x" ? [0, 0, PI / 2] : axis === "z" ? [PI / 2, 0, 0] : [0, 0, 0],
      g,
    );
  const sph = (c: string, r: number, x: number, y: number, z: number, g = 0) =>
    put(c, new THREE.SphereGeometry(r, 7, 5), x, y, z, [0, 0, 0], g);
  const torus = (c: string, Rr: number, t: number, x: number, y: number, z: number) =>
    put(c, new THREE.TorusGeometry(Rr, t, 5, 12), x, y, z);

  // ---------------------------------------------------------------- stencil text
  const MASK = ["1111110", "0110000", "1101101", "1111001", "0110011", "1011011", "1011111", "1110000", "1111111", "1111011"];
  function digit(c: string, d: number, x: number, y: number, z: number, h: number, g = 0) {
    const w = h * 0.5;
    const t = h * 0.17;
    const hh = h / 2;
    const segs = [
      [0, hh - t / 2, w, t],
      [w / 2 - t / 2, hh / 2, t, hh],
      [w / 2 - t / 2, -hh / 2, t, hh],
      [0, -hh + t / 2, w, t],
      [-w / 2 + t / 2, -hh / 2, t, hh],
      [-w / 2 + t / 2, hh / 2, t, hh],
      [0, 0, w, t],
    ];
    segs.forEach((s, i) => {
      if (MASK[d][i] === "1") plane(c, s[2], s[3], x + s[0], y + s[1], z, 0, g);
    });
  }
  function number(str: string, x: number, y: number, z: number, h: number, c = STENCIL, g = 0) {
    const adv = h * 0.72;
    const x0 = x - ((str.length - 1) * adv) / 2;
    for (let i = 0; i < str.length; i++) digit(c, Number(str[i]), x0 + i * adv, y, z, h, g);
  }
  function dashes(c: string, x: number, y: number, z: number, n: number, unit: number, h: number, g = 0) {
    const ws: number[] = [];
    for (let i = 0; i < n; i++) ws.push(unit * (1 + Math.floor(R() * 3)));
    const gap = unit * 0.7;
    const total = ws.reduce((a, v) => a + v, 0) + gap * (n - 1);
    let cx = x - total / 2;
    for (const w of ws) {
      plane(c, w, h, cx + w / 2, y, z, 0, g);
      cx += w + gap;
    }
  }
  function hazard(cx: number, cy: number, w: number, h: number, z: number) {
    plane(P.black, w, h, cx, cy, z);
    const bw = h * 0.5;
    const L = (h - bw * 0.7071) / 0.7071;
    for (let x = cx - w / 2 + h / 2; x <= cx + w / 2 - h / 2 + 1e-6; x += h)
      plane(P.warnYellow, bw, L, x, cy, z + 0.002, PI / 4);
  }
  const redLabel = (x: number, y: number, z: number, w: number, h: number, n: number) => {
    plane(P.redLabel, w, h, x, y, z);
    dashes(STENCIL, x, y, z + 0.002, n, h * 0.22, h * 0.28);
  };
  const streak = (x: number, yTop: number, z: number, w: number, len: number) =>
    plane(P.grime, w, len, x, yTop - len / 2, z);
  const bolt = (x: number, y: number, z: number, c: string = P.steel, s = 0.013) =>
    box(c, s, s, s * 0.7, x, y, z + s * 0.2, R() * 1.2);

  // ---------------------------------------------------------------- instruments
  function gauge(x: number, y: number, z: number, r: number, ang: number, face: string = P.lightPanel) {
    cyl(P.darkSteel, r + 0.012, 0.03, "z", x, y, z + 0.015, 12);
    cyl(P.steel, r + 0.008, 0.008, "z", x, y, z + 0.027, 12);
    circle(face, r * 0.92, x, y, z + 0.0325);
    for (let k = 0; k < 7; k++) {
      const a = ((-130 + (k * 260) / 6) * PI) / 180;
      plane(k >= 5 ? P.redLabel : P.black, 0.004, r * 0.2, x + Math.sin(a) * r * 0.74, y + Math.cos(a) * r * 0.74, z + 0.0335, -a);
    }
    const L = r * 0.7;
    plane(P.black, 0.005, L, x + (Math.sin(ang) * L) / 2, y + (Math.cos(ang) * L) / 2, z + 0.034, -ang);
    circle(P.black, r * 0.12, x, y, z + 0.0345, 6);
  }
  function wheel(x: number, y: number, z: number, Rr: number, c: string, stem: number) {
    cyl(P.steel, 0.01, stem, "z", x, y, z - stem / 2, 6);
    cyl(P.darkSteel, 0.03, 0.045, "z", x, y, z - stem + 0.01, 8);
    torus(c, Rr, 0.009, x, y, z);
    for (let k = 0; k < 3; k++) box(c, Rr * 2, 0.012, 0.012, x, y, z, (k * PI) / 3);
    cyl(P.darkSteel, 0.018, 0.03, "z", x, y, z + 0.004, 8);
  }
  function led(c: string, x: number, y: number, z: number, g = 1.5) {
    cyl(P.darkSteel, 0.011, 0.006, "z", x, y, z + 0.003, 8);
    cyl(c, 0.0075, 0.006, "z", x, y, z + 0.007, 8, g);
  }
  function knob(x: number, y: number, z: number, r: number, ang: number) {
    cyl(P.rubber, r, 0.02, "z", x, y, z + 0.01, 10);
    cyl(P.darkSteel, r * 0.75, 0.006, "z", x, y, z + 0.0225, 10);
    plane(STENCIL, 0.005, r * 0.7, x + (Math.sin(ang) * r * 0.35), y + Math.cos(ang) * r * 0.35, z + 0.0258, -ang);
    for (let k = 0; k < 5; k++) {
      const a = ((-120 + k * 60) * PI) / 180;
      plane(STENCIL, 0.004, 0.009, x + Math.sin(a) * (r + 0.014), y + Math.cos(a) * (r + 0.014), z + 0.0015, -a);
    }
  }
  function toggle(x: number, y: number, z: number, dir: number, tip: string) {
    box(P.steel, 0.03, 0.045, 0.006, x, y, z + 0.003);
    cyl(P.darkSteel, 0.009, 0.01, "z", x, y, z + 0.008, 6);
    box(P.steel, 0.008, 0.008, 0.03, x, y + dir * 0.009, z + 0.02, 0, 0, -dir * 0.45);
    box(tip, 0.013, 0.013, 0.013, x, y + dir * 0.017, z + 0.032);
  }
  function crt(x: number, y: number, z: number, w: number, h: number, mode: number) {
    box(P.black, w, h, 0.03, x, y, z + 0.015);
    box(P.steel, w + 0.008, 0.006, 0.006, x, y + h / 2 + 0.002, z + 0.027);
    const sw = w - 0.03;
    const sh = h - 0.03;
    plane(CRTDARK, sw, sh, x, y, z + 0.031);
    const zz = z + 0.0325;
    const G = P.crtGreen;
    plane(G, sw * 0.9, 0.003, x, y + sh / 2 - 0.006, zz, 0, 1.3);
    plane(G, sw * 0.9, 0.003, x, y - sh / 2 + 0.006, zz, 0, 1.3);
    if (mode === 0) {
      for (let k = 0; k < 6; k++) {
        const lw = (0.35 + R() * 0.55) * sw;
        plane(G, lw, 0.007, x - sw / 2 + lw / 2 + 0.012, y + sh / 2 - 0.025 - k * 0.02, zz, 0, 1.3);
      }
    } else if (mode === 1) {
      const ph = R() * 3;
      for (let k = 0; k < 15; k++) {
        const v = Math.sin(k * 0.75 + ph) * 0.5 + (R() - 0.5) * 0.25;
        plane(G, 0.007, 0.01, x - sw / 2 + 0.012 + k * ((sw - 0.024) / 14), y + v * sh * 0.45, zz, 0, 1.3);
      }
      plane(G, 0.003, sh * 0.8, x - sw / 2 + 0.008, y, zz, 0, 1.3);
    } else {
      for (let k = 0; k < 7; k++) {
        const bh = (0.2 + R() * 0.6) * (sh - 0.03);
        plane(G, 0.016, bh, x - sw / 2 + 0.02 + k * ((sw - 0.04) / 6), y - sh / 2 + 0.01 + bh / 2, zz, 0, 1.3);
      }
    }
  }

  // ---------------------------------------------------------------- pipes
  function flangeX(fx: number, y: number, z: number, r: number) {
    cyl(P.darkSteel, r + 0.018, 0.022, "x", fx, y, z, 10);
    for (const a of [-0.9, -0.3, 0.3, 0.9])
      box(P.steel, 0.012, 0.014, 0.014, fx + 0.012, y + Math.sin(a) * (r + 0.012), z + Math.cos(a) * (r + 0.012));
  }
  function flangeY(x: number, y: number, z: number, r: number) {
    cyl(P.darkSteel, r + 0.018, 0.022, "y", x, y, z, 10);
    for (const a of [-0.9, -0.3, 0.3, 0.9])
      box(P.steel, 0.014, 0.012, 0.014, x + Math.sin(a) * (r + 0.012), y + 0.012, z + Math.cos(a) * (r + 0.012));
  }
  function bracketX(x: number, y: number, z: number, r: number) {
    cyl(P.darkSteel, r + 0.007, 0.026, "x", x, y, z, 10);
    box(P.darkSteel, 0.05, 0.06, 0.008, x, y, Z0 + 0.004);
    const d = z - r - Z0;
    if (d > 0.004) box(P.darkSteel, 0.03, 0.024, d, x, y, Z0 + d / 2);
  }
  function bracketY(x: number, y: number, z: number, r: number) {
    cyl(P.darkSteel, r + 0.007, 0.026, "y", x, y, z, 10);
    box(P.darkSteel, 0.06, 0.05, 0.008, x, y, Z0 + 0.004);
    const d = z - r - Z0;
    if (d > 0.004) box(P.darkSteel, 0.024, 0.03, d, x, y, Z0 + d / 2);
  }
  function hpipe(c: string, r: number, y: number, z: number, x0: number, x1: number, flanges: number[], brackets: number[]) {
    cyl(c, r, x1 - x0, "x", (x0 + x1) / 2, y, z, 10);
    flanges.forEach((fx) => flangeX(fx, y, z, r));
    brackets.forEach((bx) => bracketX(bx, y, z, r));
  }
  function vpipe(c: string, r: number, x: number, z: number, y0: number, y1: number, flanges: number[], brackets: number[]) {
    cyl(c, r, y1 - y0, "y", x, (y0 + y1) / 2, z, 10);
    flanges.forEach((fy) => flangeY(x, fy, z, r));
    brackets.forEach((by) => bracketY(x, by, z, r));
  }

  // ======================================================== LOCKER BANKS
  const LX0 = -1.74;
  const LW = 0.98;
  const NB = 4;
  const DW = LW / NB;
  const doorCenters: { cx: number; cy: number; zd: number; dw: number; dh: number }[] = [];

  function bank(y0: number, h: number, depth: number, doorH: number, nums: string[], row: number) {
    const zf = Z0 + depth;
    box(P.darkSteel, LW, h, depth, LX0 + LW / 2, y0 + h / 2, Z0 + depth / 2);
    for (let i = 0; i < NB; i++) {
      const cx = LX0 + DW * (i + 0.5);
      const cy = y0 + h / 2;
      const dw = DW - 0.012;
      const col = (i + row) % 2 ? P.panelBeige : DOORGREY;
      box(col, dw, doorH, 0.024, cx, cy, zf + 0.012);
      const zd = zf + 0.024;
      doorCenters.push({ cx, cy, zd, dw, dh: doorH });
      plane(INSET, dw - 0.05, doorH - 0.1, cx, cy, zd + 0.002);
      // inset outline
      const iw = dw - 0.05;
      const ih = doorH - 0.1;
      plane(P.darkSteel, iw, 0.004, cx, cy + ih / 2, zd + 0.0035);
      plane(P.darkSteel, iw, 0.004, cx, cy - ih / 2, zd + 0.0035);
      plane(P.darkSteel, 0.004, ih, cx - iw / 2, cy, zd + 0.0035);
      plane(P.darkSteel, 0.004, ih, cx + iw / 2, cy, zd + 0.0035);
      for (const sx of [-1, 1])
        for (const sy of [-1, 1]) bolt(cx + sx * (dw / 2 - 0.013), cy + sy * (doorH / 2 - 0.013), zd);
      const side = i % 2 === 0 ? 1 : -1;
      const lx = cx + side * (dw / 2 - 0.045);
      box(P.steel, 0.032, 0.1, 0.01, lx, cy - 0.04, zd + 0.005);
      box(P.rubber, 0.016, 0.07, 0.018, lx, cy - 0.04, zd + 0.017);
      box(P.redLabel, 0.02, 0.014, 0.012, lx, cy + 0.03, zd + 0.016);
      box(P.darkSteel, 0.082, 0.042, 0.005, cx, cy + doorH / 2 - 0.065, zd + 0.0025);
      number(nums[i], cx, cy + doorH / 2 - 0.065, zd + 0.0058, 0.026);
      for (const sy of [-1, 1]) cyl(P.steel, 0.008, 0.05, "y", cx - side * (dw / 2 - 0.004), cy + sy * (doorH / 2 - 0.1), zd - 0.004, 6);
      if (row === 0 && i % 2 === 1)
        for (let k = 0; k < 4; k++) plane(P.black, 0.12, 0.011, cx, cy - doorH / 2 + 0.07 + k * 0.022, zd + 0.0045);
      if (row === 1 && i === 2) redLabel(cx, cy - 0.17, zd + 0.003, 0.11, 0.045, 4);
      if (row === 1 && i === 0) hazard(cx, cy - 0.17, 0.12, 0.035, zd + 0.003);
    }
    box(P.steel, LW + 0.02, 0.022, depth + 0.02, LX0 + LW / 2, y0 + h + 0.011, Z0 + (depth + 0.02) / 2);
  }
  // plinth + hazard
  box(P.darkSteel, LW, 0.09, 0.31, LX0 + LW / 2, 0.045, Z0 + 0.155);
  hazard(LX0 + LW / 2, 0.045, LW - 0.06, 0.055, Z0 + 0.312);
  bank(0.09, 0.87, 0.3, 0.77, ["11", "12", "13", "14"], 0);
  bank(1.06, 0.7, 0.24, 0.6, ["21", "22", "23", "24"], 1);
  // cable tray between banks
  cyl(P.black, 0.01, LW, "x", LX0 + LW / 2, 1.015, Z0 + 0.03, 6);
  cyl(P.rubber, 0.01, LW, "x", LX0 + LW / 2, 1.04, Z0 + 0.03, 6);
  for (const x of [-1.62, -1.3, -0.98, -0.82]) box(P.darkSteel, 0.03, 0.05, 0.03, x, 1.028, Z0 + 0.03);
  box(P.warnOrange, 0.03, 0.012, 0.012, -1.46, 1.027, Z0 + 0.05);

  // ======================================================== LOWER EQUIPMENT UNIT
  const UX = -0.22;
  const UW = 0.8;
  box(P.darkSteel, UW, 0.09, 0.31, UX, 0.045, Z0 + 0.155);
  hazard(UX, 0.045, UW - 0.06, 0.055, Z0 + 0.312);
  box(P.panelGrey, UW, 0.71, 0.3, UX, 0.09 + 0.355, Z0 + 0.15);
  box(P.steel, UW + 0.02, 0.03, 0.34, UX, 0.815, Z0 + 0.17);
  const zp = Z0 + 0.3; // front plane
  // left vent panel
  box(P.panelBeige, 0.34, 0.56, 0.012, -0.43, 0.45, zp + 0.006);
  const lzp = zp + 0.012;
  for (let k = 0; k < 9; k++) {
    plane(P.black, 0.26, 0.016, -0.43, 0.23 + k * 0.04, lzp + 0.001);
    box(P.steel, 0.27, 0.01, 0.012, -0.43, 0.243 + k * 0.04, lzp + 0.005, 0, 0, -0.5);
  }
  redLabel(-0.43, 0.62, lzp + 0.002, 0.2, 0.04, 6);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) bolt(-0.43 + sx * 0.15, 0.45 + sy * 0.26, lzp);
  // divider
  box(P.darkSteel, 0.06, 0.58, 0.016, -0.22, 0.45, zp + 0.008);
  for (const y of [0.25, 0.45, 0.65]) bolt(-0.22, y, zp + 0.016);
  // right instrument panel
  box(P.panelBeige, 0.34, 0.56, 0.012, -0.01, 0.45, zp + 0.006);
  gauge(-0.085, 0.58, lzp, 0.05, -0.6);
  gauge(0.075, 0.58, lzp, 0.05, 0.9, P.amberLight);
  [-0.09, -0.01, 0.07].forEach((x, i) => {
    knob(x, 0.45, lzp, 0.025, -0.8 + i * 0.9);
    dashes(P.black, x, 0.402, lzp + 0.002, 2, 0.008, 0.005);
  });
  [P.crtGreen, P.amberLight, REDLED, P.crtGreen].forEach((c, i) => led(c, -0.105 + i * 0.06, 0.345, lzp, i === 3 ? 0 : 1.5));
  // pull handle
  box(P.darkSteel, 0.3, 0.05, 0.006, -0.01, 0.19, lzp + 0.003);
  for (const sx of [-1, 1]) box(P.steel, 0.016, 0.016, 0.02, -0.01 + sx * 0.11, 0.19, lzp + 0.014);
  cyl(P.steel, 0.009, 0.26, "x", -0.01, 0.19, lzp + 0.026, 6);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) bolt(-0.01 + sx * 0.15, 0.45 + sy * 0.26, lzp);

  // ======================================================== CONTROL PANEL
  const PY = 1.365;
  box(P.darkSteel, UW, 0.79, 0.07, UX, PY, Z0 + 0.035);
  box(P.panelGrey, 0.76, 0.75, 0.012, UX, PY, Z0 + 0.07 + 0.006);
  const zf = Z0 + 0.082;
  box(P.darkSteel, UW + 0.02, 0.04, 0.14, UX, 1.78, Z0 + 0.07);
  hazard(UX, 1.78, 0.76, 0.03, Z0 + 0.141);
  box(P.steel, UW + 0.02, 0.02, 0.1, UX, 0.96, Z0 + 0.05);
  [-0.47, -0.22, 0.03].forEach((x, i) => crt(x, 1.6, zf, 0.23, 0.2, i));
  [-0.47, -0.22, 0.03].forEach((x) => dashes(STENCIL, x, 1.475, zf + 0.001, 5, 0.01, 0.006));
  redLabel(-0.45, 1.43, zf + 0.001, 0.15, 0.03, 5);
  plane(P.warnYellow, 0.1, 0.03, -0.27, 1.43, zf + 0.001);
  dashes(P.black, -0.27, 1.43, zf + 0.003, 3, 0.01, 0.01);
  plane(P.warnOrange, 0.1, 0.03, -0.1, 1.43, zf + 0.001);
  dashes(P.black, -0.1, 1.43, zf + 0.003, 3, 0.01, 0.01);
  for (let k = 0; k < 8; k++) {
    const x = -0.56 + k * 0.055;
    toggle(x, 1.34, zf, k % 3 === 1 ? -1 : 1, k === 2 || k === 5 ? REDLED : P.amberLight);
    dashes(STENCIL, x, 1.293, zf + 0.001, 2, 0.007, 0.005);
  }
  knob(-0.04, 1.34, zf, 0.03, -0.5);
  knob(0.075, 1.34, zf, 0.03, 1.0);
  // button grid
  for (let r = 0; r < 2; r++)
    for (let k = 0; k < 6; k++) {
      const x = -0.55 + k * 0.05;
      const y = 1.215 - r * 0.05;
      box(P.darkSteel, 0.042, 0.038, 0.01, x, y, zf + 0.005);
      const roll = R();
      const lit = roll < 0.28 ? P.amberLight : roll < 0.5 ? P.crtGreen : roll < 0.62 ? REDLED : null;
      box(lit ?? P.black, 0.032, 0.028, 0.012, x, y, zf + 0.014, 0, lit ? 1.5 : 0);
    }
  // sliders
  [-0.19, -0.135, -0.08].forEach((x, i) => {
    box(P.black, 0.012, 0.11, 0.004, x, 1.15, zf + 0.002);
    box(P.steel, 0.026, 0.014, 0.014, x, 1.12 + i * 0.03, zf + 0.01);
    for (let k = 0; k < 5; k++) plane(STENCIL, 0.01, 0.003, x + 0.016, 1.1 + k * 0.025, zf + 0.001);
  });
  // emergency button
  cyl(P.warnYellow, 0.048, 0.01, "z", 0.075, 1.14, zf + 0.005, 12);
  cyl(P.black, 0.04, 0.014, "z", 0.075, 1.14, zf + 0.007, 12);
  cyl(P.redLabel, 0.03, 0.026, "z", 0.075, 1.14, zf + 0.013, 10);
  redLabel(0.075, 1.2, zf + 0.001, 0.08, 0.022, 4);
  hazard(UX, 1.015, 0.7, 0.026, zf + 0.001);
  dashes(STENCIL, -0.4, 1.062, zf + 0.001, 6, 0.012, 0.007);
  for (const sx of [-1, 1])
    for (const sy of [-1, 1]) bolt(UX + sx * 0.355, PY + sy * 0.345, zf, P.steel, 0.016);

  // ======================================================== FRIDGE-FREEZER
  const FX = 0.56;
  const FW = 0.6;
  box(P.black, FW, 0.1, 0.36, FX, 0.05, Z0 + 0.18);
  box(P.panelGrey, FW, 1.85, 0.35, FX, 0.1 + 0.925, Z0 + 0.175);
  box(P.steel, FW + 0.02, 0.02, 0.37, FX, 1.96, Z0 + 0.185);
  const fz = -1.09;
  const door = (y0: number, y1: number) => {
    const h = y1 - y0;
    const cy = (y0 + y1) / 2;
    box(P.panelBeige, 0.56, h, 0.02, FX, cy, fz);
    plane(INSET, 0.46, h - 0.1, FX, cy, fz + 0.0105);
    const iw = 0.46;
    const ih = h - 0.1;
    plane(P.darkSteel, iw, 0.004, FX, cy + ih / 2, fz + 0.012);
    plane(P.darkSteel, iw, 0.004, FX, cy - ih / 2, fz + 0.012);
    plane(P.darkSteel, 0.004, ih, FX - iw / 2, cy, fz + 0.012);
    plane(P.darkSteel, 0.004, ih, FX + iw / 2, cy, fz + 0.012);
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) bolt(FX + sx * 0.255, cy + sy * (h / 2 - 0.015), fz + 0.01);
    for (const sy of [-1, 1]) cyl(P.darkSteel, 0.012, 0.05, "y", FX - 0.29, cy + sy * (h / 2 - 0.08), fz + 0.0, 6);
  };
  door(1.21, 1.93);
  door(0.14, 1.17);
  box(P.black, 0.58, 0.04, 0.012, FX, 1.19, fz);
  // handles
  cyl(P.stainless, 0.011, 0.34, "y", FX + 0.22, 1.55, -1.065, 6);
  for (const sy of [-1, 1]) box(P.steel, 0.02, 0.02, 0.016, FX + 0.22, 1.55 + sy * 0.14, -1.073);
  cyl(P.stainless, 0.011, 0.6, "y", FX + 0.22, 0.76, -1.065, 6);
  for (const sy of [-1, 1]) box(P.steel, 0.02, 0.02, 0.016, FX + 0.22, 0.76 + sy * 0.26, -1.073);
  // display + lights
  box(P.black, 0.14, 0.07, 0.01, FX - 0.08, 1.8, -1.075);
  plane(P.crtGreen, 0.014, 0.004, FX - 0.125, 1.8, -1.0695, 0, 1.4);
  number("18", FX - 0.09, 1.8, -1.0695, 0.036, P.crtGreen, 1.4);
  plane(P.crtGreen, 0.014, 0.004, FX - 0.06, 1.8, -1.0695, 0, 1.4); // degree dash
  box(P.darkSteel, 0.034, 0.034, 0.01, FX + 0.05, 1.8, -1.075);
  cyl(P.amberLight, 0.011, 0.007, "z", FX + 0.05, 1.8, -1.068, 8, 1.8);
  led(P.crtGreen, FX + 0.1, 1.8, -1.0795, 1.5);
  // warning diamond and labels
  plane(P.warnYellow, 0.05, 0.05, FX - 0.15, 1.63, -1.0695, PI / 4);
  plane(P.black, 0.006, 0.02, FX - 0.15, 1.636, -1.0685);
  plane(P.black, 0.007, 0.007, FX - 0.15, 1.612, -1.0685);
  redLabel(FX - 0.1, 1.48, -1.0695, 0.14, 0.05, 5);
  redLabel(FX - 0.05, 0.42, -1.0695, 0.12, 0.04, 4);
  box(P.darkSteel, 0.12, 0.035, 0.005, FX - 0.05, 0.6, -1.0775);
  number("03", FX - 0.05, 0.6, -1.0745, 0.024);
  for (let k = 0; k < 4; k++) plane(P.black, 0.3, 0.012, FX - 0.02, 0.2 + k * 0.026 - 0.04, -1.0695);
  // fridge top condenser pipes
  vpipe(P.pipeGrey, 0.03, 0.4, -1.3, 1.97, 2.25, [1.99, 2.23], [2.05]);
  vpipe(P.pipeCopper, 0.025, 0.56, -1.3, 1.97, 2.25, [1.99, 2.23], []);
  vpipe(P.pipeGrey, 0.03, 0.72, -1.3, 1.97, 2.25, [1.99, 2.23], [2.05]);
  hpipe(P.pipeCopper, 0.022, 2.12, -1.3, 0.38, 0.74, [], []);
  for (const x of [0.4, 0.56, 0.72]) sph(P.pipeGrey, 0.036, x, 2.12, -1.3);
  cyl(P.warnYellow, 0.034, 0.03, "y", 0.4, 2.0, -1.3, 10);
  cyl(P.warnYellow, 0.034, 0.03, "y", 0.72, 2.0, -1.3, 10);
  // gauge in the gap between panel and fridge
  vpipe(P.pipeCopper, 0.022, 0.22, -1.36, 0, 2.25, [0.02, 2.23], [0.6, 1.2, 1.85]);
  gauge(0.22, 1.55, -1.36, 0.03, 0.5);
  // meter housing hint
  box(P.darkSteel, 0.1, 0.012, 0.12, FX + 0.0, 1.972, -1.21);

  // ======================================================== MAIN PIPE RUNS
  hpipe(P.pipeCopper, 0.04, 2.16, -1.405, -1.75, 0.9, [-1.72, -0.69, 0.22, 0.88], [-1.5, -1.1, -0.3, 0.5]);
  hpipe(P.pipeGrey, 0.055, 2.03, -1.39, -1.75, 0.2, [-1.72, -1.05, -0.69, 0.18], [-1.4, -0.9, -0.1]);
  hpipe(P.pipeCopper, 0.022, 1.89, -1.425, -1.75, -0.7, [-1.72], [-1.55, -1.2, -0.9]);
  // insulation / hazard bands
  for (const x of [-1.6, -1.2, -0.85, -0.45]) cyl(P.warnYellow, 0.059, 0.03, "x", x, 2.03, -1.39, 10);
  for (const x of [-1.3, -0.5, 0.4]) cyl(P.warnOrange, 0.044, 0.025, "x", x, 2.16, -1.405, 10);
  // vertical pipes
  vpipe(P.pipeGrey, 0.045, -0.69, -1.38, 0, 2.25, [0.02, 2.23, 0.9], [0.35, 1.05, 1.7]);
  for (const y of [0.7, 1.45]) cyl(P.warnYellow, 0.049, 0.035, "y", -0.69, y, -1.38, 10);
  sph(P.pipeGrey, 0.062, -0.69, 2.03, -1.385);
  sph(P.pipeCopper, 0.055, -0.69, 2.16, -1.4);
  sph(P.pipeCopper, 0.04, 0.22, 2.16, -1.38);
  // valves
  wheel(-0.69, 1.25, -1.27, 0.05, P.redLabel, 0.07);
  wheel(-0.69, 0.5, -1.27, 0.05, P.warnYellow, 0.07);
  wheel(-1.35, 2.03, -1.27, 0.055, P.redLabel, 0.065);
  wheel(-0.3, 2.03, -1.27, 0.055, P.warnYellow, 0.065);
  gauge(-0.69, 1.62, -1.33, 0.036, -0.4, P.lightPanel);
  gauge(-1.0, 2.03, -1.37, 0.04, 0.7, P.amberLight);
  gauge(-1.62, 2.03, -1.37, 0.04, -0.8, P.lightPanel);
  // caged lamp
  cyl(P.darkSteel, 0.036, 0.06, "z", -0.22, 1.9, -1.4, 8);
  sph(P.amberLight, 0.03, -0.22, 1.9, -1.355, 1.6);
  for (const sx of [-1, 1]) box(P.steel, 0.006, 0.07, 0.006, -0.22 + sx * 0.032, 1.9, -1.345);
  for (const sy of [-1, 1]) box(P.steel, 0.07, 0.006, 0.006, -0.22, 1.9 + sy * 0.032, -1.345);
  box(P.steel, 0.07, 0.006, 0.006, -0.22, 1.9, -1.33);
  // second caged lamp over lockers
  cyl(P.darkSteel, 0.03, 0.05, "z", -1.25, 1.82, -1.42, 8);
  sph(P.warnOrange, 0.026, -1.25, 1.82, -1.385, 1.3);

  // ======================================================== CABLES
  const cableStrand = (pts: number[][], r: number, c: string) => b.sweep(catmull(pts), r, { color: c, sides: 5 });
  const c1 = [
    [-1.72, 1.86, -1.435],
    [-1.4, 1.805, -1.435],
    [-1.05, 1.835, -1.435],
    [-0.78, 1.8, -1.435],
    [-0.62, 1.84, -1.43],
    [-0.5, 1.8, -1.41],
  ];
  [0, 1, 2].forEach((k) =>
    cableStrand(
      c1.map((p) => [p[0], p[1] + k * 0.02, p[2] + (k === 1 ? 0.004 : 0)]),
      0.0095,
      k === 1 ? P.redLabel : k === 0 ? P.black : P.rubber,
    ),
  );
  const c2 = [
    [0.08, 1.82, -1.41],
    [0.12, 1.95, -1.43],
    [0.32, 1.99, -1.435],
    [0.6, 1.93, -1.435],
    [0.86, 1.97, -1.43],
  ];
  cableStrand(c2, 0.011, P.black);
  cableStrand(c2.map((p) => [p[0], p[1] + 0.024, p[2]]), 0.009, P.warnOrange);
  for (const [x, y] of [[-1.4, 1.805], [-1.05, 1.835], [-0.78, 1.8], [0.32, 1.99], [0.6, 1.93]])
    box(P.darkSteel, 0.03, 0.07, 0.014, x, y + 0.02, -1.43);

  // ======================================================== GRIME
  for (const d of doorCenters) {
    if (R() < 0.7) streak(d.cx + (R() - 0.5) * 0.12, d.cy + d.dh / 2 - 0.1, d.zd + 0.0045, 0.012 + R() * 0.012, 0.15 + R() * 0.3);
    if (R() < 0.5) streak(d.cx + (R() - 0.5) * 0.15, d.cy + 0.1, d.zd + 0.0045, 0.01, 0.1 + R() * 0.2);
  }
  plane(P.grime, 0.5, 0.05, FX, 0.19, fz + 0.0108);
  streak(FX + 0.15, 1.17, fz + 0.0108, 0.016, 0.5);
  streak(FX - 0.18, 1.88, fz + 0.0108, 0.012, 0.3);
  streak(UX + 0.2, 0.8, zp + 0.0125, 0.014, 0.4);
  streak(UX - 0.3, 0.8, zp + 0.0125, 0.01, 0.2);
  plane(P.grime, 0.7, 0.04, UX, 0.1, Z0 + 0.3135);

  // ======================================================== FLUSH THE MERGED PARTS
  for (const grp of groups.values()) {
    const merged = mergeGeometries(grp.geos, false);
    if (!merged) continue;
    const part = b.part(merged, grp.color, { at: [0, 0, 0], flat: true });
    if (grp.strength > 0) glow(part, grp.strength);
  }
}
```