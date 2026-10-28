<!-- call: plan -->

```json
{
  "name": "Arctic Research Outpost",
  "description": "A Firewatch-style flat-colour diorama of a small polar research station: a red-orange main cabin on stilts, a radio mast, a Quonset storage hut, a weather-instrument yard and a snow-drift base with sled and fuel drums.",
  "builderName": "arcticOutpost",
  "size": [6.0, 4.6, 5.0],
  "layout": "A low snow plateau (an irregular faceted slab, 6 x 5 m, 0.3 m thick) forms the base. The main cabin sits left of centre (x -0.6) on short stilts, with its door and stairs facing +Z. A tall lattice radio mast stands at the back right (x 1.9, z -1.4). A curved Quonset hut sits at the back left. A weather yard (Stevenson screen, anemometer, snow stakes) sits at front right. A sled, fuel drums and crates sit at front left. Style: Firewatch flat colour. Warm sunset oranges and reds against cool blue-violet snow shadows. Every surface is one flat colour. Details such as windows, stripes, rivets and lights are separate small parts. Snow caps the roofs and top faces in near-white, and blue-lavender snow shadows go on lower faces.",
  "palette": {
    "snowTop": "#f4eee6",
    "snowShade": "#b9bfdc",
    "snowDeep": "#8e96bd",
    "ice": "#9fd3e0",
    "cabinRed": "#c9452d",
    "cabinDark": "#8f2e24",
    "trimCream": "#f1dcb0",
    "roofGrey": "#5a5568",
    "timber": "#7a4e33",
    "timberDark": "#4d3225",
    "windowGlow": "#ffc766",
    "huttGreen": "#4c6b5c",
    "metal": "#8a8fa0",
    "metalDark": "#43455a",
    "mastOrange": "#e8782e",
    "mastWhite": "#f0ebe4",
    "drumBlue": "#3a5f8f",
    "drumYellow": "#e3b43a",
    "lampRed": "#ff4a3a",
    "rock": "#5c5468",
    "ink": "#2a2233"
  },
  "mounts": {
    "snowTop": [0, 0.3, 0],
    "cabinFloor": [-0.6, 0.7, 0.2],
    "cabinDoor": [-0.6, 1.2, 1.25],
    "mastBase": [1.9, 0.3, -1.4],
    "huttBase": [-1.7, 0.3, -1.6],
    "yardCenter": [1.8, 0.3, 1.3],
    "sledSpot": [-2.0, 0.3, 1.5]
  },
  "joints": [],
  "parts": [
    {
      "id": "terrain",
      "builds": "The snow plateau: a faceted irregular slab made of stacked, overlapping prisms and wedges, snowTop on top and snowShade/snowDeep on the sides and the lower skirt. It has drift wedges against the cabin and hut walls, a packed-path strip in snowShade leading from the cabin door toward the yard, a few rock clusters (rock) at the rim, and small ice patches (ice). Footprints are tiny dark dents on the path.",
      "box": [[-3.0, 0.0, -2.5], [3.0, 0.45, 2.5]],
      "attaches": "Its top face at y=0.3 is the floor for every other part, which sit on snowTop.",
      "joints": [],
      "floor": true,
      "budget": 150
    },
    {
      "id": "cabin",
      "builds": "The main cabin: a 2.2 x 1.3 x 1.8 m box body in cabinRed with cabinDark vertical board seams as thin strips, on four timber stilts with cross braces. It has a cream trim band and corner posts, and a gable roof in roofGrey with a snowTop cap and a snowShade underside. A stovepipe chimney (metalDark) emits a small snow-white cap. The front door is timber with a windowGlow porthole and a handle. Timber stairs lead down to the snow, with a railing. Each side has two glowing windows (windowGlow) with cream frames and shutters in cabinDark. A lampRed beacon sits on the roof ridge, and an ink sign plate is above the door. A fuel pipe runs down one side.",
      "box": [[-1.8, 0.3, -0.8], [0.6, 2.5, 1.9]],
      "attaches": "Stilts end on snowTop (y=0.3). The cabin floor is at the cabinFloor mount, and the stairs meet the door at cabinDoor and the snow.",
      "joints": [],
      "floor": false,
      "budget": 220
    },
    {
      "id": "mast",
      "builds": "The radio mast: a tapering lattice tower 4.4 m tall made of four slim legs, ring braces and diagonal rods in alternating mastOrange and mastWhite bands. At the top are a dish, whip antennas and a lampRed light. Guy wires of thin metal rods run to small snow anchors. Near the base is a small metal equipment box with a door and a cable running to the cabin. A concrete-look footing in snowShade sits at its base.",
      "box": [[1.2, 0.3, -2.1], [2.6, 4.6, -0.7]],
      "attaches": "Base at the mastBase mount on snowTop; the cable heads toward the cabin at x -0.6.",
      "joints": [],
      "floor": false,
      "budget": 150
    },
    {
      "id": "hut",
      "builds": "A Quonset storage hut: a half-cylinder lathe or stacked arc ribs in huttGreen, 1.8 m wide, 1.0 m tall and 1.6 m long, with horizontal corrugation lines as thin darker strips. A snowTop layer lies along the top and metalDark end walls carry a door with a handle and a small windowGlow slit. Timber skids sit underneath, with a lantern (windowGlow) by the door and a stack of crates (timber and timberDark) beside it. Snowdrift wedges sit at the sides.",
      "box": [[-2.7, 0.3, -2.4], [-0.7, 1.4, -0.9]],
      "attaches": "Sits on snowTop at the huttBase mount.",
      "joints": [],
      "floor": false,
      "budget": 150
    },
    {
      "id": "yard",
      "builds": "The weather and supply yard: a white Stevenson screen with louvers on legs, an anemometer on a pole (three cups spinning, a vane), snow stakes in alternating red and white bands, a sled with timber runners and a tarp-covered load (cabinDark, with rope), three fuel drums (drumBlue, drumYellow) with ring ribs and caps, a stack of two crates, and a small ice-drill tripod in metal. Each item has small details: bolts, labels (ink), and a lampRed marker flag.",
      "box": [[-2.8, 0.3, 0.6], [2.9, 1.8, 2.4]],
      "attaches": "Everything rests on snowTop at the yardCenter and sledSpot mounts. The path from cabinDoor leads between them.",
      "joints": [],
      "floor": false,
      "budget": 200
    }
  ]
}
```

<!-- call: mast -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildMast({ b, J, P, M }: Ctx) {
  const [X0, Y0, Z0] = M.mastBase;
  const R = rng(11);

  // ---- tower dimensions ----
  const yBase = 0.46; // leg start (sits on pedestals)
  const yTop = 3.9; // platform level
  const BAYS = 6;
  const halfAt = (y: number) => {
    const t = (y - yBase) / (yTop - yBase);
    return 0.42 + (0.17 - 0.42) * t;
  };
  const level = (i: number) => yBase + (i * (yTop - yBase)) / BAYS;
  const CORN: [number, number][] = [
    [1, 1],
    [-1, 1],
    [-1, -1],
    [1, -1],
  ];
  const corner = (k: number, y: number, out = 0): [number, number, number] => {
    const h = halfAt(y) + out;
    return [X0 + CORN[k][0] * h, y, Z0 + CORN[k][1] * h];
  };
  const bayCol = (i: number) => (i % 2 === 0 ? P.mastOrange : P.mastWhite);
  const bayInv = (i: number) => (i % 2 === 0 ? P.mastWhite : P.mastOrange);

  // ---- concrete footing ----
  b.part(new THREE.BoxGeometry(1.04, 0.06, 1.04), P.snowDeep, { at: [X0, 0.33, Z0] });
  b.part(new THREE.BoxGeometry(0.96, 0.07, 0.96), P.snowShade, { at: [X0, 0.365, Z0] });
  // chipped snow banks on the footing
  b.part(new THREE.BoxGeometry(0.34, 0.035, 0.2), P.snowTop, { at: [X0 + 0.33, 0.415, Z0 - 0.32], rotation: [0, 18, 0] });
  b.part(new THREE.BoxGeometry(0.22, 0.03, 0.3), P.snowTop, { at: [X0 - 0.36, 0.413, Z0 + 0.28], rotation: [0, -12, 0] });
  // pedestals + base plates under each leg
  for (let k = 0; k < 4; k++) {
    const [px, , pz] = corner(k, yBase, 0);
    b.part(new THREE.BoxGeometry(0.15, 0.06, 0.15), P.snowShade, { at: [px, 0.43, pz] });
    b.part(new THREE.BoxGeometry(0.11, 0.015, 0.11), P.metalDark, { at: [px, 0.4675, pz] });
  }

  // ---- lattice: legs, rings, diagonals ----
  for (let i = 0; i < BAYS; i++) {
    for (let k = 0; k < 4; k++) {
      b.rod(corner(k, level(i)), corner(k, level(i + 1)), 0.026, bayCol(i), { sides: 6 });
    }
  }
  for (let i = 0; i <= BAYS; i++) {
    const c = bayCol(i === 0 ? 0 : i - 1);
    for (let k = 0; k < 4; k++) {
      b.rod(corner(k, level(i)), corner((k + 1) % 4, level(i)), 0.015, c, { sides: 4 });
    }
  }
  for (let i = 0; i < BAYS; i++) {
    for (let k = 0; k < 4; k++) {
      const a = k;
      const c = (k + 1) % 4;
      if ((i + k) % 2 === 0) b.rod(corner(a, level(i)), corner(c, level(i + 1)), 0.012, bayInv(i), { sides: 4 });
      else b.rod(corner(c, level(i)), corner(a, level(i + 1)), 0.012, bayInv(i), { sides: 4 });
    }
  }

  // ---- ladder on +Z face ----
  const lz = (y: number) => Z0 + halfAt(y) + 0.07;
  for (const sx of [-1, 1]) {
    b.rod([X0 + sx * 0.1, 0.5, lz(0.5)], [X0 + sx * 0.1, 3.72, lz(3.72)], 0.009, P.metal, { sides: 4 });
  }
  for (let k = 0; k < 10; k++) {
    const y = 0.68 + k * 0.33;
    b.rod([X0 - 0.1, y, lz(y)], [X0 + 0.1, y, lz(y)], 0.008, P.metal, { sides: 4 });
  }
  // ladder stand-offs near top and bottom
  for (const y of [0.7, 3.6]) {
    for (const sx of [-1, 1]) {
      b.rod([X0 + sx * 0.1, y, lz(y)], [X0 + sx * 0.1, y, Z0 + halfAt(y)], 0.008, P.metalDark, { sides: 4 });
    }
  }

  // ---- top platform with rails ----
  b.part(new THREE.BoxGeometry(0.48, 0.04, 0.48), P.metalDark, { at: [X0, yTop + 0.02, Z0] });
  b.part(new THREE.BoxGeometry(0.3, 0.018, 0.2), P.snowTop, { at: [X0 - 0.05, yTop + 0.049, Z0 - 0.1], rotation: [0, 14, 0] });
  const pc = 0.22;
  const post: [number, number][] = [
    [pc, pc],
    [-pc, pc],
    [-pc, -pc],
    [pc, -pc],
  ];
  post.forEach(([dx, dz], k) => {
    b.rod([X0 + dx, yTop + 0.04, Z0 + dz], [X0 + dx, yTop + 0.17, Z0 + dz], 0.01, P.mastWhite, { sides: 4 });
    const [nx, nz] = post[(k + 1) % 4];
    b.rod([X0 + dx, yTop + 0.17, Z0 + dz], [X0 + nx, yTop + 0.17, Z0 + nz], 0.009, P.mastOrange, { sides: 4 });
  });

  // ---- mast pole, lamp, whips ----
  b.rod([X0, yTop + 0.04, Z0], [X0, 4.37, Z0], 0.02, P.mastWhite, { sides: 6 });
  b.part(new THREE.CylinderGeometry(0.05, 0.06, 0.04, 8), P.metalDark, { at: [X0, 4.39, Z0] });
  const lamp = b.part(new THREE.SphereGeometry(0.06, 8, 6), P.lampRed, { at: [X0, 4.46, Z0] });
  glow(lamp, 1.8);
  b.part(new THREE.ConeGeometry(0.045, 0.07, 8), P.metalDark, { at: [X0, 4.545, Z0] });
  // whips
  b.rod([X0 + 0.2, yTop + 0.04, Z0 - 0.2], [X0 + 0.17, 4.58, Z0 - 0.17], 0.008, P.mastWhite, { sides: 4 });
  b.rod([X0 - 0.2, yTop + 0.04, Z0 - 0.2], [X0 - 0.16, 4.43, Z0 - 0.17], 0.007, P.mastOrange, { sides: 4 });
  b.part(new THREE.SphereGeometry(0.014, 5, 4), P.lampRed, { at: [X0 + 0.17, 4.59, Z0 - 0.17] });
  // yagi on a boom
  const yy = 4.14;
  b.rod([X0, yy, Z0 - 0.28], [X0, yy, Z0 + 0.28], 0.012, P.mastWhite, { sides: 4 });
  const el = [0.14, 0.12, 0.1, 0.08];
  el.forEach((len, i) => {
    const z = Z0 - 0.2 + i * 0.13;
    b.rod([X0 - len, yy, z], [X0 + len, yy, z], 0.007, i % 2 ? P.mastWhite : P.mastOrange, { sides: 4 });
  });

  // ---- dish ----
  const axis = new THREE.Vector3(-0.68, 0.16, 0.71).normalize();
  const C = new THREE.Vector3(X0 - 0.27, 3.5, Z0 + 0.27);
  b.lathe(
    [
      [0, 0],
      [0.14, 0.03],
      [0.28, 0.11],
      [0.28, 0.125],
      [0.14, 0.05],
      [0, 0.022],
    ],
    { at: C.toArray() as [number, number, number], axis: axis.toArray() as [number, number, number], color: P.mastWhite, segments: 14 },
  );
  const rimC = C.clone().addScaledVector(axis, 0.118);
  b.part(new THREE.TorusGeometry(0.28, 0.012, 5, 16), P.mastOrange, {
    at: rimC.toArray() as [number, number, number],
    dir: axis.toArray() as [number, number, number],
    axis: "z",
  });
  b.part(new THREE.CylinderGeometry(0.04, 0.05, 0.05, 8), P.metalDark, {
    at: C.clone().addScaledVector(axis, -0.02).toArray() as [number, number, number],
    dir: axis.toArray() as [number, number, number],
  });
  b.rod([X0, 3.5, Z0], C.toArray() as [number, number, number], 0.02, P.metalDark, { sides: 6 });
  const feedTip = C.clone().addScaledVector(axis, 0.26);
  b.rod(C.clone().addScaledVector(axis, 0.03), feedTip, 0.008, P.metalDark, { sides: 5 });
  b.part(new THREE.SphereGeometry(0.022, 6, 5), P.mastOrange, { at: feedTip.toArray() as [number, number, number] });
  const side = new THREE.Vector3().crossVectors(axis, new THREE.Vector3(0, 1, 0)).normalize();
  for (const s of [1, -1]) {
    b.rod(rimC.clone().addScaledVector(side, 0.275 * s), feedTip, 0.005, P.metal, { sides: 4 });
  }

  // ---- guy wires + anchors ----
  const gy = 3.3;
  for (let k = 0; k < 4; k++) {
    const [sx, sz] = CORN[k];
    const top = corner(k, gy);
    const ax = X0 + sx * 0.66;
    const az = Z0 + sz * 0.66;
    const bot: [number, number, number] = [ax, 0.37, az];
    // anchor mound + block
    b.part(new THREE.ConeGeometry(0.14, 0.09, 6), P.snowTop, { at: [ax, 0.335, az], rotation: [0, R() * 60, 0] });
    b.part(new THREE.BoxGeometry(0.08, 0.06, 0.08), P.metalDark, { at: [ax, 0.345, az], rotation: [0, 20 + k * 30, 0] });
    b.rod(top, bot, 0.005, P.metal, { sides: 4 });
    // turnbuckle on the wire
    const mp: [number, number, number] = [
      bot[0] + (top[0] - bot[0]) * 0.22,
      bot[1] + (top[1] - bot[1]) * 0.22,
      bot[2] + (top[2] - bot[2]) * 0.22,
    ];
    const dir: [number, number, number] = [top[0] - bot[0], top[1] - bot[1], top[2] - bot[2]];
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.1, 5), P.mastOrange, { at: mp, dir });
    // collar on the leg
    b.part(new THREE.BoxGeometry(0.06, 0.04, 0.06), P.metalDark, { at: top });
  }

  // ---- equipment box ----
  const bx = 1.3;
  const bz = Z0 - 0.0;
  b.part(new THREE.BoxGeometry(0.18, 0.34, 0.36), P.metal, { at: [bx, 0.47, bz] });
  b.part(new THREE.BoxGeometry(0.2, 0.03, 0.38), P.metalDark, { at: [bx, 0.305, bz] });
  b.part(new THREE.BoxGeometry(0.21, 0.03, 0.4), P.snowTop, { at: [bx, 0.655, bz] });
  b.part(new THREE.BoxGeometry(0.2, 0.012, 0.38), P.snowShade, { at: [bx, 0.635, bz] });
  // door on -x face (faces the cabin)
  const dx = bx - 0.09 - 0.005;
  b.part(new THREE.BoxGeometry(0.012, 0.26, 0.28), P.metalDark, { at: [dx, 0.47, bz] });
  b.part(new THREE.BoxGeometry(0.014, 0.2, 0.22), P.metal, { at: [dx - 0.003, 0.47, bz] });
  b.part(new THREE.BoxGeometry(0.02, 0.05, 0.016), P.mastWhite, { at: [dx - 0.012, 0.47, bz + 0.08] });
  b.part(new THREE.BoxGeometry(0.014, 0.05, 0.1), P.ink, { at: [dx - 0.012, 0.54, bz - 0.03] });
  b.part(new THREE.BoxGeometry(0.016, 0.012, 0.07), P.mastOrange, { at: [dx - 0.015, 0.54, bz - 0.03] });
  const ind = b.part(new THREE.SphereGeometry(0.014, 6, 4), P.lampRed, { at: [dx - 0.014, 0.4, bz - 0.07] });
  glow(ind, 1.5);
  // hinges
  for (const y of [0.37, 0.57]) b.part(new THREE.BoxGeometry(0.016, 0.03, 0.012), P.metalDark, { at: [dx - 0.004, y, bz - 0.145] });
  // louver slits on +z face
  for (let i = 0; i < 3; i++) b.part(new THREE.BoxGeometry(0.12, 0.012, 0.008), P.ink, { at: [bx, 0.52 - i * 0.04, bz + 0.182] });
  // rivets on the top rim
  for (const dz of [-0.14, 0.14]) b.part(new THREE.SphereGeometry(0.01, 5, 4), P.metalDark, { at: [dx - 0.012, 0.6, bz + dz] });

  // conduit from box to the tower, then up a leg
  const legK = 1; // (-x, +z) leg
  const o = 0.03;
  const lp = (y: number): [number, number, number] => {
    const h = halfAt(y);
    return [X0 - h - o * 0.7, y, Z0 + h + o * 0.7];
  };
  b.rod([bx, 0.65, bz + 0.05], lp(0.95), 0.012, P.metalDark, { sides: 5 });
  b.rod(lp(0.95), lp(3.1), 0.012, P.metalDark, { sides: 5 });
  b.part(new THREE.BoxGeometry(0.07, 0.07, 0.07), P.metal, { at: lp(3.15) });
  for (const y of [1.5, 2.1, 2.7]) b.part(new THREE.BoxGeometry(0.035, 0.02, 0.035), P.mastOrange, { at: lp(y) });
  void legK;

  // ---- cable toward the cabin ----
  const cable = [
    [bx - 0.09, 0.4, bz - 0.12],
    [bx - 0.14, 0.325, bz - 0.17],
    [1.12, 0.315, -1.6],
    [0.98, 0.31, -1.5],
    [0.88, 0.31, -1.3],
  ] as [number, number, number][];
  b.sweep(cable, 0.014, { color: P.ink, sides: 5 } as any);
  for (const p of [cable[2], cable[3]]) b.part(new THREE.BoxGeometry(0.04, 0.012, 0.04), P.metalDark, { at: [p[0], 0.32, p[2]] });
  b.part(new THREE.ConeGeometry(0.1, 0.06, 6), P.snowTop, { at: [0.9, 0.33, -1.3] });
}
```

<!-- call: hut -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildHut({ b, J, P, M }: Ctx) {
  // ---------------------------------------------------------------- constants
  const CX = -1.7; // hut centre line (x)
  const RX = 0.88; // half width
  const RY = 0.88; // height of the arch
  const Y0 = 0.38; // hut floor level (on the skids)
  const ZB = -2.36; // back of the arch body
  const ZF = -1.1; // front of the arch body
  const RIB_DARK = "#3a5548";
  const RIB_LIGHT = "#6f9684";
  const r = rng(11);
  const DEG = Math.PI / 180;

  // ---------------------------------------------------------------- helpers
  const archPts = (rx: number, ry: number, a0: number, a1: number, n: number) => {
    const out: [number, number][] = [];
    for (let i = 0; i <= n; i++) {
      const a = (a0 + ((a1 - a0) * i) / n) * DEG;
      out.push([rx * Math.cos(a), ry * Math.sin(a)]);
    }
    return out;
  };
  const toShape = (pts: [number, number][]) => new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], p[1])));
  const solidArch = (rx: number, ry: number, n = 14) => toShape(archPts(rx, ry, 0, 180, n));
  const band = (rx: number, ry: number, t: number, a0: number, a1: number) => {
    const n = Math.max(3, Math.ceil((14 * (a1 - a0)) / 180));
    const outer = archPts(rx, ry, a0, a1, n);
    const inner = archPts(rx - t, ry - t, a0, a1, n).reverse();
    return toShape([...outer, ...inner]);
  };
  const extr = (shape: THREE.Shape, depth: number) =>
    new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, steps: 1 });
  // arch pieces run along +z from z0
  const archPart = (shape: THREE.Shape, depth: number, color: string, z0: number, y = Y0) =>
    b.part(extr(shape, depth), color, { at: [CX, y, z0], flat: true });

  const box = (
    w: number, h: number, d: number, color: string,
    x: number, y: number, z: number, rot?: [number, number, number],
  ) => b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], rotation: rot });
  const cyl = (
    rt: number, rb: number, h: number, seg: number, color: string,
    at: [number, number, number], opts: Record<string, unknown> = {},
  ) => b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, flat: true, ...opts });
  const ball = (
    rad: number, color: string, at: [number, number, number],
    scale: [number, number, number] = [1, 1, 1],
  ) => b.part(new THREE.SphereGeometry(rad, 6, 4), color, { at, scale, flat: true });

  // ---------------------------------------------------------------- skids
  const skidZ0 = -2.4;
  const skidZ1 = -0.98;
  for (const s of [1, -1]) {
    const x = CX + s * 0.7;
    box(0.11, 0.08, skidZ1 - skidZ0, P.timber, x, 0.34, (skidZ0 + skidZ1) / 2);
    // upturned nose
    box(0.11, 0.07, 0.15, P.timber, x, 0.355, skidZ1 + 0.05, [-24, 0, 0]);
    // snow-dark strap bands
    box(0.115, 0.083, 0.03, P.timberDark, x, 0.34, -1.2);
    box(0.115, 0.083, 0.03, P.timberDark, x, 0.34, -2.2);
  }
  for (const z of [-2.25, -1.7, -1.2]) box(1.4, 0.05, 0.07, P.timberDark, CX, 0.335, z);

  // ---------------------------------------------------------------- main arch body
  archPart(solidArch(RX, RY), ZF - ZB, P.huttGreen, ZB);

  // corrugation ribs: a dark rib and a thin lighter edge each
  const ribN = 13;
  const ribEnd = ZF - 0.05;
  for (let i = 0; i < ribN; i++) {
    const z = ZB + (i * (ribEnd - ZB)) / (ribN - 1);
    archPart(band(RX + 0.026, RY + 0.026, 0.04, 0, 180), 0.04, RIB_DARK, z);
    archPart(band(RX + 0.03, RY + 0.03, 0.04, 0, 180), 0.012, RIB_LIGHT, z + 0.04);
  }

  // base rail along both lower edges
  archPart(band(RX + 0.034, RY + 0.034, 0.06, 0, 9), ZF - ZB + 0.02, P.metalDark, ZB - 0.01);
  archPart(band(RX + 0.034, RY + 0.034, 0.06, 171, 180), ZF - ZB + 0.02, P.metalDark, ZB - 0.01);

  // ---------------------------------------------------------------- end walls
  archPart(solidArch(RX - 0.015, RY - 0.015), 0.05, P.metalDark, ZF - 0.01);
  archPart(solidArch(RX - 0.015, RY - 0.015), 0.05, P.metalDark, ZB - 0.03);
  const FZ = ZF + 0.04; // front face of the front plate

  // rivets round both end walls
  for (let i = 0; i < 10; i++) {
    const a = (8 + i * 18) * DEG;
    const x = CX + (RX - 0.05) * Math.cos(a);
    const y = Y0 + (RY - 0.05) * Math.sin(a);
    ball(0.014, P.metal, [x, y, FZ + 0.002], [1, 1, 0.6]);
    if (i % 2 === 0) ball(0.012, P.metal, [x, y, ZB - 0.03 - 0.0], [1, 1, 0.6]);
  }

  // ---------------------------------------------------------------- front door
  const DX = CX - 0.12;
  box(0.56, 0.7, 0.025, P.timberDark, DX, Y0 + 0.35, FZ + 0.0125);
  box(0.46, 0.63, 0.03, P.timber, DX, Y0 + 0.315, FZ + 0.035);
  for (const o of [-0.075, 0.075]) box(0.007, 0.6, 0.004, P.timberDark, DX + o, Y0 + 0.315, FZ + 0.051);
  for (const y of [0.14, 0.5]) {
    box(0.46, 0.05, 0.012, P.metalDark, DX, Y0 + y, FZ + 0.056);
    for (const o of [-0.19, 0.19]) ball(0.012, P.metal, [DX + o, Y0 + y, FZ + 0.064], [1, 1, 0.6]);
  }
  // handle: plate, grip, knob
  box(0.045, 0.14, 0.01, P.metal, DX + 0.16, Y0 + 0.33, FZ + 0.056);
  box(0.022, 0.1, 0.022, P.metalDark, DX + 0.16, Y0 + 0.33, FZ + 0.07);
  ball(0.02, P.metal, [DX + 0.16, Y0 + 0.28, FZ + 0.075]);
  // threshold step
  box(0.66, 0.045, 0.13, P.timber, DX, 0.3225, FZ + 0.07);
  box(0.66, 0.012, 0.13, P.snowTop, DX, 0.349, FZ + 0.07);

  // glowing slit above the door
  box(0.4, 0.075, 0.016, P.metal, DX, Y0 + 0.745, FZ + 0.006);
  glow(box(0.35, 0.045, 0.02, P.windowGlow, DX, Y0 + 0.745, FZ + 0.012), 1.4);

  // ---------------------------------------------------------------- lantern by the door
  const LX = CX + 0.42;
  const ly = Y0 + 0.43;
  const LZ = FZ + 0.12;
  box(0.05, 0.075, 0.012, P.metalDark, LX, Y0 + 0.575, FZ + 0.006);
  box(0.016, 0.016, 0.125, P.metalDark, LX, Y0 + 0.575, FZ + 0.065);
  b.part(new THREE.TorusGeometry(0.016, 0.0045, 5, 8), P.metal, {
    at: [LX, Y0 + 0.555, LZ], rotation: [0, 90, 0], flat: true,
  });
  cyl(0.001, 0.04, 0.035, 6, P.metalDark, [LX, ly + 0.0525 + 0.0175, LZ]);
  cyl(0.036, 0.036, 0.02, 6, P.metalDark, [LX, ly - 0.045, LZ]);
  glow(cyl(0.03, 0.03, 0.075, 6, P.windowGlow, [LX, ly, LZ]), 1.8);
  for (const a of [45, 135, 225, 315])
    box(0.007, 0.08, 0.007, P.metalDark, LX + 0.033 * Math.cos(a * DEG), ly, LZ + 0.033 * Math.sin(a * DEG));

  // ---------------------------------------------------------------- side vents
  for (const s of [1, -1]) {
    const a = 22 * DEG;
    const nrm = new THREE.Vector3((s * Math.cos(a)) / RX, Math.sin(a) / RY, 0).normalize();
    const px = CX + s * (RX + 0.02) * Math.cos(a);
    const py = Y0 + (RY + 0.02) * Math.sin(a);
    const pz = -1.62;
    const n: [number, number, number] = [nrm.x, nrm.y, nrm.z];
    const at = (k: number): [number, number, number] => [px + nrm.x * k, py + nrm.y * k, pz + nrm.z * k];
    cyl(0.075, 0.075, 0.03, 8, P.metalDark, at(0), { dir: n });
    cyl(0.052, 0.052, 0.034, 8, P.ink, at(0.004), { dir: n });
    b.part(new THREE.TorusGeometry(0.072, 0.009, 4, 8), P.metal, { at: at(0.014), dir: n, axis: "z", flat: true });
    b.part(new THREE.BoxGeometry(0.1, 0.012, 0.012), P.metal, { at: at(0.02), dir: n, axis: "y" });
  }

  // ---------------------------------------------------------------- snow cap
  archPart(band(RX + 0.05, RY + 0.05, 0.06, 26, 154), 1.34, P.snowShade, ZB - 0.04);
  archPart(band(RX + 0.085, RY + 0.085, 0.095, 40, 140), 1.36, P.snowTop, ZB - 0.04);
  // snow clumps on the ridge
  const surfY = (dx: number, extra: number) =>
    Y0 + (RY + extra) * Math.sqrt(Math.max(0, 1 - (dx / (RX + extra)) ** 2));
  const lumps: [number, number, number][] = [
    [0.02, -2.2, 0.1], [-0.12, -1.95, 0.085], [0.15, -1.75, 0.09], [-0.05, -1.5, 0.11], [0.1, -1.28, 0.075],
  ];
  for (const [dx, z, rad] of lumps)
    ball(rad, P.snowTop, [CX + dx, surfY(dx, 0.085) + rad * 0.12, z], [1.1, 0.38, 1.5 + r() * 0.3]);
  // drips of shade snow along the lower cap edge
  for (const s of [1, -1])
    for (const z of [-2.25, -1.9, -1.55, -1.2]) {
      const a = 30 * DEG;
      ball(0.05, P.snowShade, [CX + s * (RX + 0.06) * Math.cos(a), Y0 + (RY + 0.06) * Math.sin(a), z + r() * 0.05], [0.7, 0.8, 1.6]);
    }

  // ---------------------------------------------------------------- snowdrift wedges (sides)
  const drift = (k: number, h: number): [number, number, "sharp"][] =>
    ([
      [-0.04, 0], [0.15 * k, 0], [0.13 * k, 0.04 * h], [0.07 * k, 0.12 * h], [0, 0.3 * h], [-0.04, 0.3 * h],
    ] as [number, number][]).map(([x, y]) => [x, y, "sharp"]);
  const driftCap = (k: number, h: number): [number, number, "sharp"][] =>
    ([
      [-0.04, 0.325 * h], [0, 0.325 * h], [0.085 * k, 0.138 * h], [0.15 * k, 0.065 * h], [0.16 * k, 0],
      [0.15 * k, 0], [0.13 * k, 0.04 * h], [0.07 * k, 0.12 * h], [0, 0.3 * h], [-0.04, 0.3 * h],
    ] as [number, number][]).map(([x, y]) => [x, y, "sharp"]);
  const drifts: [number, number, number, number][] = [
    // z centre, length, k, h
    [-2.0, 0.55, 0.8, 1.0],
    [-1.3, 0.4, 0.7, 0.75],
  ];
  for (const s of [1, -1])
    for (const [zc, len, k, h] of drifts) {
      const at: [number, number, number] = [CX + s * 0.86, 0.29, zc + (s > 0 ? 0.05 : -0.04)];
      b.extrude(drift(k, h), { at, x: [s, 0, 0], thickness: len, color: P.snowShade });
      b.extrude(driftCap(k, h), { at: [at[0], at[1] + 0.003, at[2]], x: [s, 0, 0], thickness: len * 0.96, color: P.snowTop });
      ball(0.07, P.snowDeep, [at[0] + s * 0.1 * k, 0.31, at[2] + len * 0.55], [1.2, 0.35, 1.0]);
    }

  // ---------------------------------------------------------------- crates
  const crate = (
    cx: number, cz: number, y0: number, s: number, rot: number,
    main: string, trim: string, snow = false,
  ) => {
    const c = Math.cos(rot * DEG);
    const sn = Math.sin(rot * DEG);
    const loc = (dx: number, dy: number, dz: number): [number, number, number] => [
      cx + dx * c + dz * sn, y0 + dy, cz - dx * sn + dz * c,
    ];
    const R: [number, number, number] = [0, rot, 0];
    const put = (g: THREE.BufferGeometry, col: string, dx: number, dy: number, dz: number) =>
      b.part(g, col, { at: loc(dx, dy, dz), rotation: R });
    put(new THREE.BoxGeometry(s, s, s), main, 0, s / 2, 0);
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        put(new THREE.BoxGeometry(0.026, s + 0.008, 0.026), trim, (sx * s) / 2, s / 2, (sz * s) / 2);
    for (const y of [0.22, 0.78]) {
      put(new THREE.BoxGeometry(s * 0.9, 0.022, 0.012), trim, 0, s * y, s / 2 + 0.003);
      put(new THREE.BoxGeometry(0.012, 0.022, s * 0.9), trim, s / 2 + 0.003, s * y, 0);
    }
    put(new THREE.BoxGeometry(s * 0.34, 0.018, 0.008), P.ink, 0, s * 0.5, s / 2 + 0.004);
    if (snow) put(new THREE.BoxGeometry(s * 1.02, 0.022, s * 1.02), P.snowTop, 0, s + 0.008, 0);
  };
  crate(-1.06, -0.98, 0.3, 0.2, 6, P.timber, P.timberDark);
  crate(-0.86, -0.97, 0.3, 0.17, -9, P.timberDark, P.timber, true);
  crate(-1.06, -0.98, 0.5, 0.14, 28, P.timber, P.timberDark, true);
  ball(0.07, P.snowShade, [-1.2, 0.3, -0.91], [1.3, 0.4, 1]);
  ball(0.06, P.snowDeep, [-0.78, 0.3, -0.92], [1.2, 0.4, 1]);

  return b.root;
}
```

<!-- call: yard -->

```ts
import * as THREE from "three";
import { aim, rng } from "agentic-3js-builder";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildYard({ b, J, P, M }: Ctx) {
  void J;
  const R = rng(23);
  const D = Math.PI / 180;
  const G = M.snowTop[1]; // snow surface height

  // Own flat colours (a few, beside the palette)
  const ROPE = "#cdb089";
  const TARP_HI = "#a23b2c";

  // ---------- helpers ----------
  type Rot = number[] | THREE.Quaternion;
  const bag = new Map<string, THREE.BufferGeometry[]>();
  const _m = new THREE.Matrix4();
  const _q = new THREE.Quaternion();
  const _e = new THREE.Euler();
  const _s = new THREE.Vector3(1, 1, 1);
  const _p = new THREE.Vector3();

  const quatOf = (rot?: Rot) => {
    if (!rot) return _q.identity();
    if (rot instanceof THREE.Quaternion) return _q.copy(rot);
    _e.set(rot[0] * D, rot[1] * D, rot[2] * D, "XYZ");
    return _q.setFromEuler(_e);
  };
  /** queue a geometry for a merged, per-colour part */
  const addM = (geo: THREE.BufferGeometry, c: string, x: number, y: number, z: number, rot?: Rot) => {
    _m.compose(_p.set(x, y, z), quatOf(rot), _s);
    geo.applyMatrix4(_m);
    let list = bag.get(c);
    if (!list) bag.set(c, (list = []));
    list.push(geo);
  };
  /** a single standalone part */
  const direct = (geo: THREE.BufferGeometry, c: string, x: number, y: number, z: number, rot?: Rot) =>
    b.part(geo, c, {
      at: [x, y, z],
      ...(rot ? (rot instanceof THREE.Quaternion ? { quat: rot } : { rotation: rot }) : {}),
      flat: true,
    });

  const boxG = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cylG = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const qy = (yaw: number, rx = 0, rz = 0) =>
    new THREE.Quaternion()
      .setFromEuler(new THREE.Euler(0, yaw * D, 0))
      .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rx * D, 0, rz * D)));

  /** a rod between two points, merged */
  const rodM = (a: number[], c2: number[], r: number, col: string, seg = 5) => {
    const dx = c2[0] - a[0], dy = c2[1] - a[1], dz = c2[2] - a[2];
    const len = Math.hypot(dx, dy, dz);
    addM(cylG(r, r, len, seg), col, (a[0] + c2[0]) / 2, (a[1] + c2[1]) / 2, (a[2] + c2[2]) / 2, aim([dx, dy, dz]));
  };

  /** a low faceted snow mound */
  const mound = (x: number, z: number, r: number, h: number) => {
    const yaw = R() * 60;
    addM(cylG(r * 0.6, r, h * 0.55, 7), P.snowShade, x, G + h * 0.27, z, [0, yaw, 0]);
    addM(cylG(r * 0.25, r * 0.62, h * 0.5, 7), P.snowTop, x, G + h * 0.72, z, [0, yaw, 0]);
  };

  /** a pennant flag on a pole */
  const flag = (x: number, y0: number, z: number, h: number, yaw: number) => {
    rodM([x, y0, z], [x, y0 + h, z], 0.007, P.metalDark, 5);
    addM(new THREE.SphereGeometry(0.014, 6, 4), P.ink, x, y0 + h + 0.008, z);
    const d = [Math.cos(yaw * D), 0, -Math.sin(yaw * D)];
    b.extrude(
      [
        [0, 0],
        [0.19, -0.035],
        [0, -0.095],
      ],
      {
        at: [x + d[0] * 0.006, y0 + h - 0.005, z + d[2] * 0.006],
        x: d,
        thickness: 0.008,
        color: P.lampRed,
      },
    );
  };

  // =====================================================
  // 1. STEVENSON SCREEN (white louvered box on legs)
  // =====================================================
  {
    const sx = 2.25, sz = 0.95;
    const legH = 0.34, bw = 0.46, bh = 0.3, bd = 0.32;
    const by = G + legH + bh / 2;
    const top = G + legH + bh;

    for (const ix of [-1, 1])
      for (const iz of [-1, 1]) {
        addM(boxG(0.04, legH + 0.02, 0.04), P.mastWhite, sx + ix * 0.2, G + legH / 2, sz + iz * 0.13);
        addM(boxG(0.09, 0.02, 0.09), P.snowShade, sx + ix * 0.2, G + 0.008, sz + iz * 0.13);
      }
    for (const iz of [-1, 1]) {
      rodM([sx - 0.2, G + 0.05, sz + iz * 0.13], [sx + 0.2, G + 0.28, sz + iz * 0.13], 0.008, P.metal, 4);
      rodM([sx + 0.2, G + 0.05, sz + iz * 0.13], [sx - 0.2, G + 0.28, sz + iz * 0.13], 0.008, P.metal, 4);
    }
    // floor, shadowed interior and back panel
    direct(boxG(bw + 0.02, 0.022, bd + 0.02), P.mastWhite, sx, G + legH + 0.011, sz);
    direct(boxG(bw - 0.03, bh - 0.02, bd - 0.04), P.metalDark, sx, by, sz);
    direct(boxG(bw, bh, 0.012), P.mastWhite, sx, by, sz - bd / 2);
    // corner posts
    for (const ix of [-1, 1])
      for (const iz of [-1, 1])
        addM(boxG(0.03, bh + 0.01, 0.03), P.mastWhite, sx + ix * (bw / 2), by, sz + iz * (bd / 2));
    // louvers: front and both sides
    for (let i = 0; i < 5; i++) {
      const y = by - 0.115 + i * 0.058;
      addM(boxG(bw - 0.04, 0.012, 0.075), i % 2 ? P.mastWhite : P.trimCream, sx, y, sz + bd / 2 + 0.004, [38, 0, 0]);
      addM(boxG(0.075, 0.012, bd - 0.03), P.mastWhite, sx + bw / 2 + 0.004, y, sz, [0, 0, -38]);
      addM(boxG(0.075, 0.012, bd - 0.03), P.mastWhite, sx - bw / 2 - 0.004, y, sz, [0, 0, 38]);
    }
    // roof with snow cap and ink label plate
    direct(boxG(bw + 0.1, 0.028, bd + 0.1), P.mastWhite, sx, top + 0.026, sz + 0.01, [5, 0, 0]);
    direct(boxG(bw + 0.06, 0.034, bd + 0.05), P.snowTop, sx, top + 0.052, sz + 0.006, [5, 0, 0]);
    addM(boxG(bw + 0.04, 0.016, 0.012), P.snowShade, sx, top + 0.018, sz + bd / 2 + 0.06, [5, 0, 0]);
    direct(boxG(0.13, 0.075, 0.012), P.ink, sx, by + 0.005, sz + bd / 2 + 0.03);
    addM(boxG(0.09, 0.012, 0.014), P.trimCream, sx, by + 0.025, sz + bd / 2 + 0.032);
    addM(boxG(0.06, 0.012, 0.014), P.trimCream, sx, by - 0.005, sz + bd / 2 + 0.032);
    addM(boxG(0.02, 0.02, 0.014), P.lampRed, sx + 0.045, by - 0.025, sz + bd / 2 + 0.032);
    // door handle and hinges
    addM(boxG(0.016, 0.05, 0.016), P.metalDark, sx + bw / 2 - 0.05, by - 0.06, sz + bd / 2 + 0.05);
    mound(sx + 0.2, sz + 0.25, 0.14, 0.05);
  }

  // =====================================================
  // 2. ANEMOMETER ON A POLE
  // =====================================================
  {
    const ax = 1.2, az = 2.08;
    mound(ax, az, 0.22, 0.1);
    addM(cylG(0.07, 0.09, 0.03, 8), P.metalDark, ax, G + 0.02, az);
    rodM([ax, G, az], [ax, G + 1.42, az], 0.018, P.metal, 6);
    for (let i = 0; i < 3; i++) {
      const a = (30 + i * 120) * D;
      rodM([ax, G + 0.5, az], [ax + 0.26 * Math.cos(a), G + 0.015, az + 0.26 * Math.sin(a)], 0.008, P.metal, 4);
      addM(cylG(0.03, 0.04, 0.03, 6), P.metalDark, ax + 0.26 * Math.cos(a), G + 0.012, az + 0.26 * Math.sin(a));
    }
    addM(cylG(0.03, 0.03, 0.05, 6), P.metalDark, ax, G + 0.5, az);
    addM(cylG(0.032, 0.032, 0.12, 8), P.metalDark, ax, G + 0.95, az);
    addM(cylG(0.036, 0.036, 0.018, 8), P.mastOrange, ax, G + 1.02, az);
    // cup wheel
    const hy = G + 1.12;
    addM(cylG(0.032, 0.04, 0.05, 8), P.mastOrange, ax, hy, az);
    for (let i = 0; i < 3; i++) {
      const a = (15 + i * 120) * D;
      const u = [Math.cos(a), 0, Math.sin(a)];
      const t = [-Math.sin(a), 0, Math.cos(a)];
      const cx = ax + u[0] * 0.2, cz = az + u[2] * 0.2;
      rodM([ax, hy, az], [cx, hy, cz], 0.008, P.metal, 4);
      addM(new THREE.SphereGeometry(0.052, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), i === 0 ? P.mastWhite : P.mastOrange, cx, hy, cz, aim([-t[0], 0, -t[2]]));
      addM(new THREE.CircleGeometry(0.052, 8), P.metalDark, cx, hy, cz, aim(t, undefined, "z"));
    }
    addM(cylG(0.012, 0.012, 0.1, 5), P.metal, ax, hy + 0.07, az);
    // wind vane
    const vy = G + 1.36;
    const va = -30;
    const dv = [Math.sin(va * D), 0, Math.cos(va * D)];
    rodM([ax - dv[0] * 0.2, vy, az - dv[2] * 0.2], [ax + dv[0] * 0.17, vy, az + dv[2] * 0.17], 0.008, P.metal, 4);
    addM(new THREE.ConeGeometry(0.028, 0.1, 6), P.mastOrange, ax + dv[0] * 0.2, vy, az + dv[2] * 0.2, aim(dv));
    b.extrude(
      [
        [0, -0.015],
        [0.2, -0.07],
        [0.2, 0.08],
        [0, 0.015],
      ],
      { at: [ax - dv[0] * 0.04, vy, az - dv[2] * 0.04], x: [-dv[0], 0, -dv[2]], thickness: 0.01, color: P.mastWhite },
    );
    addM(new THREE.SphereGeometry(0.024, 6, 4), P.lampRed, ax, G + 1.44, az);
  }

  // =====================================================
  // 3. SNOW STAKES (red / white bands)
  // =====================================================
  {
    const stakes: [number, number, number, number][] = [
      [0.72, 1.42, 0.62, 12],
      [0.95, 1.85, 0.5, -20],
      [0.62, 2.12, 0.72, 35],
      [1.05, 1.2, 0.42, -8],
    ];
    stakes.forEach(([x, z, h, yaw], si) => {
      const n = Math.floor(h / 0.1);
      for (let i = 0; i < n; i++) {
        addM(boxG(0.045, 0.1, 0.022), i % 2 === 0 ? P.lampRed : P.mastWhite, x, G + 0.05 + i * 0.1 - 0.02, z, [0, yaw, 0]);
        if (i % 2 === 1) addM(boxG(0.022, 0.006, 0.026), P.ink, x, G + 0.05 + i * 0.1 - 0.02, z, [0, yaw, 0]);
      }
      addM(boxG(0.052, 0.025, 0.028), P.ink, x, G + n * 0.1 - 0.02 + 0.0125, z, [0, yaw, 0]);
      mound(x, z, 0.1, 0.06);
      if (si === 2) flag(x, G + n * 0.1 - 0.01, z, 0.2, 90);
    });
  }

  // =====================================================
  // 4. SLED WITH TARP LOAD
  // =====================================================
  {
    const cx = -1.95, cz = 1.45;
    for (const s of [-1, 1]) {
      addM(boxG(0.05, 0.07, 0.86), P.timber, cx + s * 0.22, G + 0.035, cz - 0.06);
      addM(boxG(0.05, 0.055, 0.22), P.timber, cx + s * 0.22, G + 0.09, cz + 0.45, [-32, 0, 0]);
      addM(boxG(0.03, 0.012, 0.9), P.metal, cx + s * 0.22, G + 0.004, cz - 0.04);
      addM(cylG(0.014, 0.014, 0.012, 6), P.metalDark, cx + s * 0.22, G + 0.12, cz + 0.28, [0, 0, 90]);
      addM(new THREE.SphereGeometry(0.02, 6, 4), P.metal, cx + s * 0.22, G + 0.157, cz + 0.545);
    }
    for (const dz of [-0.36, -0.02, 0.3]) {
      addM(boxG(0.56, 0.04, 0.07), P.timberDark, cx, G + 0.08, cz + dz);
      for (const s of [-1, 1]) addM(cylG(0.012, 0.012, 0.05, 6), P.metal, cx + s * 0.245, G + 0.085, cz + dz, [0, 0, 90]);
    }
    for (let i = 0; i < 6; i++) addM(boxG(0.54, 0.025, 0.1), i % 2 ? P.timber : P.timberDark, cx, G + 0.1125, cz - 0.4 + i * 0.14);
    // load: tarp
    direct(boxG(0.46, 0.16, 0.62), P.cabinDark, cx, G + 0.21, cz - 0.1);
    direct(cylG(0.12, 0.12, 0.5, 6), P.cabinDark, cx, G + 0.27, cz - 0.1, [90, 0, 0]);
    addM(boxG(0.04, 0.006, 0.4), P.cabinRed, cx, G + 0.388, cz - 0.1);
    addM(boxG(0.34, 0.008, 0.012), P.cabinRed, cx, G + 0.31, cz + 0.1, [0, 0, 8]);
    addM(boxG(0.012, 0.1, 0.4), TARP_HI, cx + 0.235, G + 0.22, cz - 0.12, [0, 0, 0]);
    // snow dusting on the tarp
    addM(boxG(0.14, 0.012, 0.3), P.snowTop, cx - 0.04, G + 0.398, cz - 0.15, [0, 12, 0]);
    // rope lashings
    for (const dz of [-0.3, 0.08]) {
      const pts: [number, number, number][] = [
        [-0.236, 0.125],
        [-0.236, 0.27],
        [-0.1, 0.37],
        [0, 0.405],
        [0.1, 0.37],
        [0.236, 0.27],
        [0.236, 0.125],
        [0, 0.12],
      ].map(([x, y]) => [cx + x, G + y, cz + dz]);
      b.sweep(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), true).getPoints(24).map((v) => [v.x, v.y, v.z]), 0.009, {
        color: ROPE,
        sides: 5,
      });
      addM(new THREE.SphereGeometry(0.018, 6, 4), ROPE, cx + 0.03, G + 0.408, cz + dz);
    }
    // jerrycan at the front
    direct(boxG(0.14, 0.17, 0.08), P.drumYellow, cx + 0.07, G + 0.1275 + 0.085, cz + 0.3);
    addM(cylG(0.016, 0.016, 0.03, 6), P.metalDark, cx + 0.03, G + 0.1275 + 0.185, cz + 0.3);
    addM(boxG(0.05, 0.012, 0.015), P.metalDark, cx + 0.1, G + 0.1275 + 0.175, cz + 0.3);
    addM(boxG(0.07, 0.05, 0.008), P.ink, cx + 0.07, G + 0.1275 + 0.08, cz + 0.344);
    // marker flag at the rear
    flag(cx + 0.2, G + 0.12, cz - 0.4, 0.62, 90);
    // tow rope and its coil
    b.sweep(
      [
        [cx, G + 0.16, cz + 0.56],
        [cx + 0.04, G + 0.22, cz + 0.68],
        [cx + 0.12, G + 0.12, cz + 0.78],
        [cx + 0.25, G + 0.03, cz + 0.85],
        [cx + 0.36, G + 0.012, cz + 0.86],
      ],
      0.01,
      { color: ROPE, sides: 5 },
    );
    addM(new THREE.TorusGeometry(0.09, 0.011, 4, 10), ROPE, cx + 0.45, G + 0.012, cz + 0.86, [90, 0, 0]);
    addM(new THREE.TorusGeometry(0.06, 0.011, 4, 8), ROPE, cx + 0.45, G + 0.026, cz + 0.86, [90, 0, 0]);
    mound(cx - 0.2, cz - 0.55, 0.2, 0.07);
  }

  // =====================================================
  // 5. FUEL DRUMS
  // =====================================================
  const upright = (cx: number, cz: number, col: string, band: string, phi: number) => {
    const r = 0.15, h = 0.42;
    direct(cylG(r, r, h, 10), col, cx, G + h / 2, cz);
    for (const y of [0.07, 0.21, 0.35]) addM(cylG(r + 0.008, r + 0.008, 0.024, 10), P.metalDark, cx, G + y, cz);
    addM(cylG(r + 0.004, r + 0.004, 0.03, 10), band, cx, G + 0.28, cz);
    addM(cylG(r - 0.01, r - 0.01, 0.016, 10), P.metalDark, cx, G + h + 0.008, cz);
    addM(cylG(0.105, 0.115, 0.016, 8), P.snowTop, cx - 0.01, G + h + 0.02, cz + 0.005);
    addM(cylG(0.024, 0.024, 0.026, 6), P.metal, cx + 0.07, G + h + 0.03, cz + 0.03);
    addM(cylG(0.014, 0.014, 0.034, 6), P.metalDark, cx - 0.06, G + h + 0.034, cz - 0.04);
    const sx = Math.sin(phi * D), sz = Math.cos(phi * D);
    const lx = cx + sx * (r + 0.004), lz = cz + sz * (r + 0.004);
    addM(boxG(0.11, 0.11, 0.01), P.ink, lx, G + 0.14, lz, [0, phi, 0]);
    addM(boxG(0.08, 0.012, 0.012), P.trimCream, lx + sx * 0.003, G + 0.165, lz + sz * 0.003, [0, phi, 0]);
    addM(boxG(0.05, 0.012, 0.012), P.trimCream, lx + sx * 0.003, G + 0.14, lz + sz * 0.003, [0, phi, 0]);
    addM(boxG(0.02, 0.02, 0.012), P.lampRed, lx + sx * 0.003 - sz * 0.03, G + 0.112, lz + sz * 0.003 + sx * 0.03, [0, phi, 0]);
    mound(cx + 0.1, cz + 0.12, 0.14, 0.05);
  };
  upright(-2.58, 0.85, P.drumBlue, P.drumYellow, 25);
  upright(-2.28, 0.76, P.drumYellow, P.drumBlue, -35);

  {
    // lying drum along z
    const cx = -2.6, cz = 1.55, r = 0.15;
    direct(cylG(r, r, 0.44, 10), P.drumBlue, cx, G + r, cz, [90, 0, 0]);
    for (const dz of [-0.15, 0, 0.15]) addM(cylG(r + 0.008, r + 0.008, 0.024, 10), P.metalDark, cx, G + r, cz + dz, [90, 0, 0]);
    for (const s of [-1, 1]) addM(cylG(r - 0.01, r - 0.01, 0.016, 10), P.metalDark, cx, G + r, cz + s * 0.225, [90, 0, 0]);
    addM(cylG(0.024, 0.024, 0.026, 6), P.metal, cx, G + r, cz + 0.236, [90, 0, 0]);
    addM(boxG(0.11, 0.01, 0.12), P.ink, cx, G + 2 * r + 0.001, cz, [0, 8, 0]);
    addM(boxG(0.08, 0.012, 0.012), P.trimCream, cx, G + 2 * r + 0.006, cz + 0.02, [0, 8, 0]);
    addM(boxG(0.05, 0.012, 0.012), P.trimCream, cx, G + 2 * r + 0.006, cz - 0.015, [0, 8, 0]);
    addM(cylG(r + 0.004, r + 0.004, 0.03, 10), P.drumYellow, cx, G + r, cz - 0.08, [90, 0, 0]);
    for (const s of [-1, 1]) addM(boxG(0.05, 0.07, 0.14), P.timberDark, cx + s * 0.13, G + 0.03, cz, [0, 0, s * 35]);
    addM(boxG(0.08, 0.014, 0.3), P.snowTop, cx + 0.02, G + 2 * r + 0.012, cz, [0, 0, 6]);
    mound(cx - 0.05, cz + 0.3, 0.15, 0.05);
  }

  // =====================================================
  // 6. CRATE STACK
  // =====================================================
  const crate = (cx: number, cz: number, s: number, y0: number, yaw: number) => {
    const c = Math.cos(yaw * D), sn = Math.sin(yaw * D);
    const L = (lx: number, lz: number): [number, number] => [cx + lx * c + lz * sn, cz - lx * sn + lz * c];
    const yc = y0 + s / 2;
    direct(boxG(s, s, s), P.timber, cx, yc, cz, [0, yaw, 0]);
    for (const ix of [-1, 1])
      for (const iz of [-1, 1]) {
        const [px, pz] = L(ix * s / 2, iz * s / 2);
        addM(boxG(0.038, s + 0.006, 0.038), P.timberDark, px, yc, pz, [0, yaw, 0]);
      }
    for (const sy of [-1, 1]) addM(boxG(s + 0.024, 0.028, s + 0.024), P.timberDark, cx, yc + sy * (s / 2), cz, [0, yaw, 0]);
    const dl = s * 1.2;
    let [fx, fz] = L(0, s / 2 + 0.003);
    addM(boxG(0.03, dl, 0.012), P.timberDark, fx, yc, fz, qy(yaw, 0, 45));
    [fx, fz] = L(s / 2 + 0.003, 0);
    addM(boxG(0.012, dl, 0.03), P.timberDark, fx, yc, fz, qy(yaw, 45, 0));
    [fx, fz] = L(-s / 2 - 0.003, 0);
    addM(boxG(0.012, dl, 0.03), P.timberDark, fx, yc, fz, qy(yaw, -45, 0));
    // label plate
    [fx, fz] = L(s * 0.2, s / 2 + 0.01);
    addM(boxG(0.1, 0.06, 0.008), P.trimCream, fx, yc + s * 0.18, fz, [0, yaw, 0]);
    [fx, fz] = L(s * 0.2, s / 2 + 0.015);
    addM(boxG(0.07, 0.01, 0.006), P.ink, fx, yc + s * 0.2, fz, [0, yaw, 0]);
    addM(boxG(0.045, 0.01, 0.006), P.ink, fx, yc + s * 0.165, fz, [0, yaw, 0]);
    // latch
    [fx, fz] = L(-s * 0.3, s / 2 + 0.01);
    addM(boxG(0.03, 0.04, 0.012), P.metal, fx, yc + s * 0.3, fz, [0, yaw, 0]);
  };
  crate(2.5, 2.0, 0.34, G, 8);
  crate(2.52, 1.99, 0.27, G + 0.34, 28);
  direct(boxG(0.28, 0.034, 0.28), P.snowTop, 2.52, G + 0.34 + 0.27 + 0.014, 1.99, [0, 28, 0]);
  mound(2.72, 2.2, 0.2, 0.09);

  // =====================================================
  // 7. ICE-DRILL TRIPOD
  // =====================================================
  {
    const tx = 1.85, tz = 1.62;
    const apexY = G + 0.95;
    // ice patch and drilled hole
    addM(cylG(0.13, 0.14, 0.008, 8), P.ice, tx, G + 0.003, tz);
    addM(cylG(0.035, 0.035, 0.01, 8), P.ink, tx, G + 0.007, tz);
    const feet: number[][] = [];
    for (let i = 0; i < 3; i++) {
      const a = (90 + i * 120) * D;
      const fx = tx + 0.4 * Math.cos(a), fz = tz + 0.4 * Math.sin(a);
      feet.push([fx, G, fz]);
      rodM([tx, apexY, tz], [fx, G + 0.01, fz], 0.016, P.metal, 5);
      addM(cylG(0.04, 0.045, 0.02, 6), P.metalDark, fx, G + 0.012, fz);
      mound(fx, fz, 0.08, 0.04);
    }
    for (let i = 0; i < 3; i++) {
      const j = (i + 1) % 3;
      const t = 0.62;
      const p = (f: number[]) => [tx + (f[0] - tx) * t, apexY + (G - apexY) * t, tz + (f[2] - tz) * t];
      rodM(p(feet[i]), p(feet[j]), 0.008, P.metal, 4);
      const lp = p(feet[i]);
      addM(cylG(0.02, 0.02, 0.03, 6), P.metalDark, lp[0], lp[1], lp[2]);
    }
    addM(cylG(0.05, 0.05, 0.07, 8), P.metalDark, tx, apexY, tz);
    // pulley
    addM(cylG(0.045, 0.045, 0.014, 10), P.metal, tx, apexY - 0.07, tz, [0, 0, 90]);
    // auger shaft
    rodM([tx, apexY - 0.05, tz], [tx, G - 0.015, tz], 0.013, P.metal, 6);
    for (let i = 0; i < 7; i++)
      addM(boxG(0.075, 0.01, 0.022), P.metalDark, tx, G + 0.06 + i * 0.085, tz, [0, i * 50, 0]);
    // motor, crank, and flag
    addM(boxG(0.12, 0.08, 0.1), P.metalDark, tx, apexY + 0.075, tz);
    addM(boxG(0.1, 0.012, 0.04), P.mastOrange, tx, apexY + 0.12, tz);
    rodM([tx - 0.06, apexY + 0.075, tz], [tx - 0.21, apexY + 0.075, tz], 0.01, P.metal, 5);
    rodM([tx - 0.21, apexY + 0.075, tz], [tx - 0.21, apexY - 0.02, tz], 0.01, P.metal, 5);
    addM(cylG(0.016, 0.016, 0.06, 6), P.drumYellow, tx - 0.21, apexY - 0.04, tz + 0.0, [90, 0, 0]);
    addM(new THREE.SphereGeometry(0.02, 6, 4), P.drumYellow, tx - 0.21, apexY - 0.07, tz);
    addM(boxG(0.06, 0.03, 0.012), P.ink, tx, apexY + 0.075, tz + 0.052);
    flag(tx + 0.05, apexY + 0.11, tz - 0.02, 0.3, 90);
  }

  // =====================================================
  // flush merged geometry: one part per colour
  // =====================================================
  for (const [c, list] of bag) {
    const merged = mergeGeometries(list, false);
    if (merged) b.part(merged, c, { at: [0, 0, 0], flat: true });
  }
}
```

<!-- call: terrain -->

This is `buildTerrain`, the snow plateau, written against the `Ctx` the module provides; I haven't run it. The slab is a superellipse built from three stacked faceted extrudes: a `snowDeep` skirt, a `snowShade` body and a thin `snowTop` cap that overhangs slightly. It rests exactly on y = 0 with its top at y = 0.3, and the added features stay below y = 0.45.

On top of the slab:

- **Rim:** shaded chunks around the edge and snow-cornice lumps on the back and side rim.
- **Drifts:** nine wedges against the cabin and hut walls, lit on the left and back walls, shaded on the right and front.
- **Surface:** snow mounds, sastrugi ridges, and soft lavender cast shadows from the cabin and the hut.
- **Path:** a packed-snow strip from the stair landing toward the yard, with alternating footprint dents, sled drag grooves and boot prints beside them.
- **Rocks and ice:** four rock clusters with snow caps, and ice patches with highlights and cracks.

It uses four colours of its own: `#3f3849`, `#dcd9ea`, `#d7f1f4` and `#6fa9c4`. There are about 120 parts.

```ts
import * as THREE from "three";
import { catmull, rng } from "agentic-3js-builder";

export function buildTerrain({ b, J, P, M }: Ctx) {
  const r = rng(7);
  const TAU = Math.PI * 2;
  const TOP = M.snowTop[1];
  const SNOW_TOP = P.snowTop;
  const SHADE = P.snowShade;
  const DEEP = P.snowDeep;
  const ICE = P.ice;
  const ROCK = P.rock;
  const ROCK_D = "#3f3849";
  const SHADOW = "#dcd9ea";
  const ICE_HI = "#d7f1f4";
  const ICE_D = "#6fa9c4";
  const G = "terrain";

  type XZ = [number, number];

  // ---- helpers -------------------------------------------------------------------------------------------
  // Horizontal prism from an outline given in (x, z), occupying y0..y1.
  const slab = (pts: XZ[], y0: number, y1: number, color: string) =>
    b.extrude(
      pts.map(([x, z]) => [x, -z] as [number, number]),
      {
        at: [0, (y0 + y1) / 2, 0],
        x: [1, 0, 0],
        y: [0, 0, -1],
        thickness: y1 - y0,
        color,
        group: G,
      },
    );

  // Irregular polygon around (cx, cz), optionally stretched and rotated.
  const polyRand = (cx: number, cz: number, rad: number, n: number, jit: number, sx = 1, sz = 1, rot = 0): XZ[] => {
    const out: XZ[] = [];
    const cr = Math.cos(rot);
    const sr = Math.sin(rot);
    for (let j = 0; j < n; j++) {
      const a = ((j + (r() - 0.5) * 0.3) / n) * TAU;
      const rj = rad * (1 + (r() - 0.5) * jit);
      const px = Math.cos(a) * rj * sx;
      const pz = Math.sin(a) * rj * sz;
      out.push([cx + px * cr - pz * sr, cz + px * sr + pz * cr]);
    }
    return out;
  };

  // Snow wedge: sloped drift rising from the snow, running along (dx, dz) from its origin.
  const wedge = (x: number, z: number, dx: number, dz: number, len: number, h: number, w: number, color: string) =>
    b.extrude(
      [
        [0, 0],
        [len, 0],
        [len * 0.55, h * 0.28],
        [len * 0.15, h * 0.7],
        [0, h],
      ],
      { at: [x, TOP - 0.01, z], x: [dx, 0, dz], thickness: [w, w * 0.45], color, group: G },
    );

  const drift = (x: number, z: number, dx: number, dz: number, len: number, h: number, w: number, lit: boolean) => {
    wedge(x, z, dx, dz, len * 1.4, h * 0.4, w * 1.25, lit ? SHADE : DEEP);
    wedge(x, z, dx, dz, len, h, w, lit ? SNOW_TOP : SHADE);
  };

  // ---- the plateau: three stacked faceted layers ----------------------------------------------------------
  const N = 28;
  const PE = 5;
  const rho = (a: number) =>
    1 / Math.pow(Math.pow(Math.abs(Math.cos(a)) / 3, PE) + Math.pow(Math.abs(Math.sin(a)) / 2.5, PE), 1 / PE);
  const angs: number[] = [];
  const fs: number[] = [];
  for (let i = 0; i < N; i++) {
    angs.push(((i + (r() - 0.5) * 0.35) / N) * TAU);
    fs.push(0.95 + 0.05 * r());
  }
  const ring = (scale: number, jit: number): XZ[] =>
    angs.map((a, i) => {
      const k = rho(a) * fs[i] * scale * (1 + (jit ? (r() - 0.5) * jit : 0));
      return [Math.cos(a) * k, Math.sin(a) * k] as XZ;
    });

  const capPts = ring(1.0, 0);
  slab(ring(0.92, 0.06), 0, 0.15, DEEP);
  slab(ring(0.97, 0.04), 0.1, 0.25, SHADE);
  slab(capPts, 0.24, TOP, SNOW_TOP);

  // Lower-skirt chunks poking out of the rim: overlapping prisms in shade tones.
  capPts.forEach(([px, pz], i) => {
    if (i % 2 === 0) return;
    const cx = px * 0.9;
    const cz = pz * 0.9;
    const rr = 0.2 + 0.1 * r();
    const pts: XZ[] = [];
    for (let j = 0; j < 6; j++) {
      const a = ((j + (r() - 0.5) * 0.3) / 6) * TAU;
      const k = rr * (0.8 + 0.3 * r());
      pts.push([cx + Math.cos(a) * k, cz + Math.sin(a) * k]);
    }
    slab(pts, 0, 0.17 + 0.11 * r(), i % 4 === 1 ? SHADE : DEEP);
  });

  // Snow cornice lumps along the back and side rim.
  capPts.forEach(([px, pz], i) => {
    if (i % 2 === 1 || pz > 1.5) return;
    const lump = polyRand(px * 0.94, pz * 0.94, 0.16 + 0.07 * r(), 6, 0.35);
    slab(lump, TOP - 0.01, TOP + 0.03 + 0.02 * r(), SNOW_TOP);
  });

  // ---- cast shadows (low sun from back-left) -------------------------------------------------------------
  slab(
    [
      [-1.8, -0.8],
      [0.6, -0.8],
      [1.4, -0.65],
      [1.4, 2.05],
      [-1.0, 2.05],
      [-1.8, 1.9],
    ],
    TOP - 0.002,
    TOP + 0.002,
    SHADOW,
  );
  slab(
    [
      [-2.7, -2.4],
      [-0.7, -2.4],
      [0.2, -2.3],
      [0.2, -0.8],
      [-1.8, -0.8],
      [-2.7, -0.9],
    ],
    TOP - 0.002,
    TOP + 0.002,
    SHADOW,
  );

  // ---- drift wedges against the cabin and hut -------------------------------------------------------------
  // [x, z, dirX, dirZ, len, height, width, lit]
  const drifts: [number, number, number, number, number, number, number, boolean][] = [
    // cabin
    [-1.72, 0.5, -1, 0, 0.5, 0.14, 1.2, true],
    [-0.6, -0.72, 0, -1, 0.5, 0.14, 1.6, true],
    [0.52, 0.2, 1, 0, 0.55, 0.13, 1.2, false],
    [-1.55, 1.85, 0, 1, 0.3, 0.1, 0.5, true],
    [0.35, 1.85, 0, 1, 0.3, 0.1, 0.5, false],
    // hut
    [-2.58, -1.6, -1, 0, 0.25, 0.12, 1.1, true],
    [-0.78, -1.6, 1, 0, 0.45, 0.13, 1.0, false],
    [-2.4, -0.95, 0, 1, 0.4, 0.12, 0.5, true],
    [-1.0, -0.95, 0, 1, 0.4, 0.12, 0.5, false],
  ];
  for (const d of drifts) drift(...d);

  // ---- snow mounds -----------------------------------------------------------------------------------------
  const mound = (x: number, z: number, rad: number, h: number) => {
    const yaw = r() * 60;
    b.part(new THREE.CylinderGeometry(rad * 0.62, rad * 1.2, h * 0.5, 7), SHADE, {
      at: [x, TOP + h * 0.25 - 0.004, z],
      scale: [1, 1, 0.75],
      rotation: [0, yaw, 0],
      flat: true,
      group: G,
    });
    b.part(new THREE.CylinderGeometry(rad * 0.15, rad * 0.88, h, 7), SNOW_TOP, {
      at: [x, TOP + h * 0.5 - 0.004, z],
      scale: [1, 1, 0.75],
      rotation: [0, yaw, 0],
      flat: true,
      group: G,
    });
  };
  mound(0.3, -1.9, 0.3, 0.09);
  mound(0.9, -1.7, 0.22, 0.06);
  mound(1.2, 0.0, 0.28, 0.08);
  mound(0.85, -0.5, 0.2, 0.05);

  // ---- sastrugi: wind ridges with a steep shaded lee ------------------------------------------------------
  const sastrugi: [number, number, number][] = [
    [-0.3, -1.6, -10],
    [0.9, -1.0, -5],
    [-2.4, 0.05, -20],
    [1.7, -0.45, 25],
  ];
  for (const [x, z, deg] of sastrugi) {
    const a = (deg * Math.PI) / 180;
    const dx = Math.cos(a);
    const dz = Math.sin(a);
    wedge(x, z, dx, dz, 0.38, 0.035, 0.13, SNOW_TOP);
    wedge(x, z, -dx, -dz, 0.26, 0.022, 0.17, SHADE);
  }

  // ---- packed path from the cabin stairs toward the yard --------------------------------------------------
  slab(polyRand(-0.6, 2.05, 0.3, 8, 0.2, 1.3, 1), TOP - 0.004, TOP + 0.012, SHADE);
  const path = catmull([
    [-0.6, TOP, 2.0],
    [0.0, TOP, 2.2],
    [0.7, TOP, 2.15],
    [1.2, TOP, 1.9],
    [1.55, TOP, 1.55],
  ]);
  b.sweep(path, (t) => [0.2 - 0.05 * t + 0.02 * Math.sin(t * 9), 0.012], {
    section: "box",
    caps: "flat",
    color: SHADE,
    up: [0, 1, 0],
    group: G,
  });

  // Footprint dents, alternating left and right.
  const print = (x: number, z: number, yaw: number) =>
    b.part(new THREE.BoxGeometry(0.07, 0.014, 0.15), DEEP, {
      at: [x, TOP + 0.012, z],
      rotation: [0, yaw, 0],
      group: G,
    });
  for (let k = 0; k < 10; k++) {
    const t = 0.06 + k * 0.09;
    const p = path.at(t);
    const tg = path.tangentAt(t);
    const side = k % 2 ? 1 : -1;
    const yaw = (Math.atan2(tg.x, tg.z) * 180) / Math.PI + side * 6 + (r() - 0.5) * 10;
    print(p.x + -tg.z * 0.08 * side, p.z + tg.x * 0.08 * side, yaw);
  }

  // Sled drag grooves running from the sled spot into the path, with a few boot prints beside them.
  const gs: XZ = [-1.9, 1.72];
  const ge: XZ = [-0.85, 2.1];
  const gd: XZ = [0.94, 0.34];
  const gp: XZ = [-0.34, 0.94];
  for (const sd of [-1, 1]) {
    const off = 0.11 * sd;
    b.sweep(
      catmull([
        [gs[0] + gp[0] * off, TOP, gs[1] + gp[1] * off],
        [(gs[0] + ge[0]) / 2 + gp[0] * (off + 0.04), TOP, (gs[1] + ge[1]) / 2 + gp[1] * (off + 0.04)],
        [ge[0] + gp[0] * off, TOP, ge[1] + gp[1] * off],
      ]),
      [0.022, 0.011],
      { section: "box", caps: "flat", color: DEEP, up: [0, 1, 0], group: G },
    );
  }
  for (let k = 0; k < 4; k++) {
    const u = 0.18 + k * 0.22;
    const px = gs[0] + (ge[0] - gs[0]) * u + gp[0] * 0.38;
    const pz = gs[1] + (ge[1] - gs[1]) * u + gp[1] * 0.38;
    print(px, pz, (Math.atan2(gd[0], gd[1]) * 180) / Math.PI + (r() - 0.5) * 14);
  }

  // ---- rock clusters at the rim ---------------------------------------------------------------------------
  const rock = (x: number, z: number, rad: number, col: string) => {
    const sy = 0.7;
    const cy = TOP + rad * 0.25;
    const yaw = r() * 360;
    b.part(new THREE.IcosahedronGeometry(rad, 0), col, {
      at: [x, cy, z],
      scale: [1, sy, 0.85 + 0.3 * r()],
      rotation: [(r() - 0.5) * 20, yaw, (r() - 0.5) * 20],
      flat: true,
      group: G,
    });
    b.part(new THREE.IcosahedronGeometry(rad * 0.78, 0), SNOW_TOP, {
      at: [x, cy + rad * sy * 0.62, z],
      scale: [1, 0.38, 1],
      rotation: [0, yaw, 0],
      flat: true,
      group: G,
    });
  };
  const clusters: [number, number, [number, number, number, string][]][] = [
    [-2.3, -0.55, [[0, 0, 0.12, ROCK], [0.18, 0.12, 0.08, ROCK_D], [-0.1, 0.2, 0.065, ROCK]]],
    [2.3, 0.4, [[0, 0, 0.11, ROCK_D], [0.16, -0.1, 0.085, ROCK], [-0.12, -0.17, 0.06, ROCK_D]]],
    [-0.1, -1.95, [[0, 0, 0.115, ROCK], [-0.17, 0.1, 0.075, ROCK_D], [0.15, 0.13, 0.06, ROCK]]],
    [2.2, -0.95, [[0, 0, 0.1, ROCK_D], [0.14, 0.12, 0.075, ROCK], [-0.1, 0.15, 0.055, ROCK_D]]],
  ];
  for (const [cx, cz, rocks] of clusters) for (const [dx, dz, rad, col] of rocks) rock(cx + dx, cz + dz, rad, col);

  // ---- ice patches -----------------------------------------------------------------------------------------
  const ice: [number, number, number, number][] = [
    [0.1, -1.2, 0.25, 0.35],
    [-2.3, 0.45, 0.26, -0.2],
    [0.95, 0.4, 0.25, 0.2],
    [2.45, 1.1, 0.2, -0.5],
  ];
  for (const [x, z, rad, rot] of ice) {
    slab(polyRand(x, z, rad, 8, 0.3, 1.4, 1, rot), TOP - 0.003, TOP + 0.006, ICE);
    slab(polyRand(x + rad * 0.1, z - rad * 0.05, rad * 0.5, 6, 0.25, 1.4, 1, rot), TOP, TOP + 0.009, ICE_HI);
    for (let c = 0; c < 2; c++) {
      const deg = (-rot * 180) / Math.PI + (c ? 35 : -25);
      b.part(new THREE.BoxGeometry(rad * 0.9, 0.004, 0.014), ICE_D, {
        at: [x + (c ? 0.06 : -0.08), TOP + 0.0105, z + (c ? -0.05 : 0.06)],
        rotation: [0, deg, 0],
        group: G,
      });
    }
  }
}
```

<!-- call: cabin -->

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCabin({ b, P }: Ctx) {
  type V = [number, number, number];
  const DEG = Math.PI / 180;
  const R = rng(11);

  // ---- cabin constants (metres, model space) -------------------------------------------------------------------
  const cx = -0.6; // body centre x
  const cz = 0.2; // body centre z
  const FZ = 1.1; // front wall plane (+z)
  const BZ = -0.7; // back wall plane
  const LX = 0.5; // left wall plane (+x)
  const RX = -1.7; // right wall plane (-x)
  const Y0 = 0.7; // floor
  const Y1 = 2.0; // eaves

  // own colours (the palette covers the rest)
  const CURTAIN = "#e0903a";
  const HOT = "#ffe6a8";

  // ---- merge buckets: one part per group + colour --------------------------------------------------------------
  const buckets = new Map<string, { group: string; color: string; geos: THREE.BufferGeometry[] }>();
  function put(group: string, color: string, geo: THREE.BufferGeometry, pos: V, rot: V = [0, 0, 0]) {
    const g = geo.index ? geo.toNonIndexed() : geo;
    g.applyMatrix4(
      new THREE.Matrix4().compose(
        new THREE.Vector3(pos[0], pos[1], pos[2]),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG)),
        new THREE.Vector3(1, 1, 1),
      ),
    );
    const key = group + "|" + color;
    let bk = buckets.get(key);
    if (!bk) buckets.set(key, (bk = { group, color, geos: [] }));
    bk.geos.push(g);
  }
  const box = (group: string, color: string, d: V, pos: V, rot: V = [0, 0, 0]) =>
    put(group, color, new THREE.BoxGeometry(d[0], d[1], d[2]), pos, rot);
  const cyl = (group: string, color: string, rt: number, rb: number, h: number, seg: number, pos: V, rot: V = [0, 0, 0]) =>
    put(group, color, new THREE.CylinderGeometry(rt, rb, h, seg), pos, rot);

  // a box seated on a wall face: u runs across the face, out = gap from the wall, d = thickness
  type Face = "F" | "B" | "L" | "R";
  function fbox(group: string, color: string, f: Face, u: number, y: number, w: number, h: number, d: number, out = 0) {
    const o = out + d / 2;
    if (f === "F") box(group, color, [w, h, d], [cx + u, y, FZ + o]);
    else if (f === "B") box(group, color, [w, h, d], [cx - u, y, BZ - o]);
    else if (f === "L") box(group, color, [d, h, w], [LX + o, y, cz + u]);
    else box(group, color, [d, h, w], [RX - o, y, cz + u]);
  }

  // =============================================================================================================
  // Stilts, floor frame, braces
  // =============================================================================================================
  box("stilts", P.timberDark, [2.3, 0.1, 1.9], [cx, 0.65, cz]); // rim joist / floor frame
  for (const sx of [-1.55, 0.35])
    for (const sz of [-0.55, 0.95]) {
      box("stilts", P.timber, [0.13, 0.32, 0.13], [sx, 0.45, sz]);
      box("stilts", P.timberDark, [0.3, 0.05, 0.3], [sx, 0.325, sz]);
      box("snow", P.snowShade, [0.4, 0.07, 0.4], [sx, 0.335, sz]);
      box("snow", P.snowTop, [0.3, 0.03, 0.3], [sx, 0.38, sz]);
      box("stilts", P.metalDark, [0.15, 0.03, 0.15], [sx, 0.585, sz]); // bearing plate
    }
  const frontBraceAng = Math.atan2(0.26, 1.9) / DEG;
  for (const [z, s] of [
    [1.03, 1],
    [-0.63, 1],
  ] as [number, number][])
    for (const k of [1, -1]) box("stilts", P.timber, [1.92, 0.05, 0.03], [cx, 0.45, z], [0, 0, k * frontBraceAng * s]);
  const sideBraceAng = Math.atan2(0.26, 1.5) / DEG;
  for (const x of [-1.63, 0.43]) for (const k of [1, -1]) box("stilts", P.timber, [0.03, 0.05, 1.52], [x, 0.45, cz], [k * sideBraceAng, 0, 0]);

  // =============================================================================================================
  // Body, trims, seams
  // =============================================================================================================
  box("body", P.cabinRed, [2.2, 1.3, 1.8], [cx, 1.35, cz]);
  box("trim", P.cabinDark, [2.24, 0.09, 1.84], [cx, 0.745, cz]); // plinth band
  box("trim", P.trimCream, [2.26, 0.08, 1.86], [cx, 1.96, cz]); // eave band
  for (const sx of [1, -1])
    for (const z of [FZ, BZ]) box("trim", P.trimCream, [0.09, 1.3, 0.09], [cx + sx * 1.1, 1.35, z]); // corner posts
  // vertical board seams
  for (let k = 1; k <= 10; k++) {
    const u = -1.1 + 0.2 * k;
    fbox("seam", P.cabinDark, "F", u, 1.35, 0.02, 1.14, 0.012);
    fbox("seam", P.cabinDark, "B", u, 1.35, 0.02, 1.14, 0.012);
  }
  for (let k = 1; k <= 8; k++) {
    const u = -0.9 + 0.2 * k;
    fbox("seam", P.cabinDark, "L", u, 1.35, 0.02, 1.14, 0.012);
    fbox("seam", P.cabinDark, "R", u, 1.35, 0.02, 1.14, 0.012);
  }

  // gable triangles, seams and attic windows
  const gable = new THREE.Shape();
  gable.moveTo(-1.1, 0);
  gable.lineTo(1.1, 0);
  gable.lineTo(1.1, 0.03);
  gable.lineTo(0, 0.245);
  gable.lineTo(-1.1, 0.03);
  gable.closePath();
  put("body", P.cabinRed, new THREE.ExtrudeGeometry(gable, { depth: 0.06, bevelEnabled: false }), [cx, Y1, FZ - 0.06]);
  put("body", P.cabinRed, new THREE.ExtrudeGeometry(gable, { depth: 0.06, bevelEnabled: false }), [cx, Y1, BZ]);
  for (let k = 1; k <= 10; k++) {
    const u = -1.1 + 0.2 * k;
    const hh = (0.03 + 0.215 * (1 - Math.abs(u) / 1.1)) * 0.9;
    if (hh < 0.05 || Math.abs(u) < 0.25) continue;
    box("seam", P.cabinDark, [0.02, hh, 0.012], [cx + u, Y1 + hh / 2, FZ + 0.006]);
    box("seam", P.cabinDark, [0.02, hh, 0.012], [cx + u, Y1 + hh / 2, BZ - 0.006]);
  }
  for (const [z, dir] of [
    [FZ, 1],
    [BZ, -1],
  ] as [number, number][]) {
    cyl("trim", P.trimCream, 0.085, 0.085, 0.015, 10, [cx, 2.09, z + dir * 0.0075], [90, 0, 0]);
    cyl("glow", P.windowGlow, 0.06, 0.06, 0.02, 10, [cx, 2.09, z + dir * 0.016], [90, 0, 0]);
  }

  // =============================================================================================================
  // Windows (glass, frame, curtain, muntins, sill + snow, shutters)
  // =============================================================================================================
  function windowOn(f: Face, u: number, w: number, sw: number) {
    const cy = 1.38;
    const h = 0.42;
    fbox("window", P.trimCream, f, u, cy, w + 0.1, h + 0.1, 0.03);
    fbox("glow", P.windowGlow, f, u, cy, w, h, 0.02, 0.03);
    fbox("glow", CURTAIN, f, u, cy + h / 2 - 0.05, w, 0.1, 0.01, 0.05);
    fbox("glow", HOT, f, u, cy - 0.1, w * 0.5, 0.1, 0.008, 0.05);
    fbox("window", P.trimCream, f, u, cy, 0.022, h, 0.015, 0.05);
    fbox("window", P.trimCream, f, u, cy - 0.04, w, 0.02, 0.015, 0.05);
    fbox("window", P.trimCream, f, u, cy - h / 2 - 0.07, w + 0.14, 0.04, 0.07);
    fbox("snow", P.snowTop, f, u, cy - h / 2 - 0.035, w + 0.1, 0.03, 0.05, 0.03);
    for (const s of [1, -1]) {
      const su = u + s * (w / 2 + 0.06 + sw / 2);
      fbox("shutter", P.cabinDark, f, su, cy, sw, h + 0.1, 0.025);
      for (const dy of [-0.14, 0, 0.14]) fbox("shutter", P.cabinRed, f, su, cy + dy, sw - 0.025, 0.014, 0.01, 0.025);
    }
  }
  for (const s of [1, -1]) {
    windowOn("F", s * 0.74, 0.26, 0.08);
    windowOn("B", s * 0.5, 0.36, 0.1);
    windowOn("L", s * 0.34, 0.32, 0.1);
    windowOn("R", s * 0.34, 0.32, 0.1);
  }

  // =============================================================================================================
  // Roof: grey slabs, cream bargeboards, snow layers, ridge cap, eave lumps and icicles
  // =============================================================================================================
  const SPAN = 1.22;
  const TH = Math.atan2(0.24, SPAN);
  const sT = Math.sin(TH);
  const cT = Math.cos(TH);
  function roofBox(group: string, color: string, dims: V, s: number, nOff: number, tShift: number, z: number) {
    const pos: V = [cx + s * (SPAN / 2) + s * sT * nOff - s * cT * tShift, 2.14 + cT * nOff + sT * tShift, z];
    box(group, color, dims, pos, [0, 0, (-s * TH) / DEG]);
  }
  for (const s of [1, -1]) {
    roofBox("roof", P.roofGrey, [1.29, 0.05, 2.04], s, 0, 0, cz);
    roofBox("roof", P.trimCream, [1.29, 0.08, 0.03], s, -0.01, 0, 1.235);
    roofBox("roof", P.trimCream, [1.29, 0.08, 0.03], s, -0.01, 0, -0.835);
    roofBox("snow", P.snowShade, [1.15, 0.05, 2.0], s, 0.05, 0.03, cz);
    roofBox("snow", P.snowTop, [1.07, 0.04, 1.96], s, 0.095, 0.04, cz);
    box("trim", P.trimCream, [0.04, 0.08, 2.06], [cx + s * 1.215, 2.0, cz]); // eave fascia
  }
  box("snow", P.snowTop, [0.3, 0.05, 1.96], [cx, 2.355, cz]);
  box("snow", P.snowShade, [0.18, 0.04, 2.0], [cx, 2.325, cz]);
  // lumps of snow sagging over the eaves and icicles under them
  for (const s of [1, -1])
    for (let i = 0; i < 7; i++) {
      const z = -0.7 + 0.3 * i + (R() - 0.5) * 0.08;
      const w = 0.16 + R() * 0.12;
      box("snow", P.snowShade, [0.12, 0.08, w], [cx + s * 1.17, 2.03, z]);
      box("snow", P.snowTop, [0.09, 0.03, w * 0.8], [cx + s * 1.16, 2.075, z]);
      if (R() < 0.8) {
        const len = 0.05 + R() * 0.09;
        put("ice", P.ice, new THREE.ConeGeometry(0.012, len, 5), [cx + s * 1.17, 1.99 - len / 2, z + (R() - 0.5) * 0.1], [180, 0, 0]);
      }
    }
  // snow dripping from the gable edge
  for (let i = 0; i < 5; i++) {
    const u = -0.9 + i * 0.45;
    put("ice", P.ice, new THREE.ConeGeometry(0.011, 0.06, 5), [cx + u * 0.9, 1.98, FZ + 0.1], [180, 0, 0]);
  }

  // chimney (stovepipe)
  const chX = cx + 0.5;
  const chZ = -0.25;
  box("snow", P.snowTop, [0.24, 0.05, 0.24], [chX, 2.285, chZ]);
  box("chimney", P.metalDark, [0.15, 0.04, 0.15], [chX, 2.275, chZ]); // flashing
  cyl("chimney", P.metalDark, 0.045, 0.045, 0.24, 8, [chX, 2.33, chZ]);
  cyl("chimney", P.metal, 0.05, 0.05, 0.025, 8, [chX, 2.36, chZ]); // strap
  put("chimney", P.metalDark, new THREE.ConeGeometry(0.085, 0.05, 8), [chX, 2.46, chZ]);
  cyl("snow", P.snowTop, 0.065, 0.07, 0.03, 8, [chX, 2.495, chZ]);

  // beacon on the ridge
  cyl("beacon", P.metalDark, 0.07, 0.08, 0.03, 8, [cx, 2.395, 0.7]);
  put("beacon", P.lampRed, new THREE.SphereGeometry(0.06, 8, 6), [cx, 2.44, 0.7]);
  glow; // (applied when flushing)
  for (const a of [0, 90]) box("beacon", P.metalDark, [0.012, 0.09, 0.012], [cx + (a ? 0.056 : -0.056), 2.44, 0.7]);

  // =============================================================================================================
  // Door, sign, porch deck, stairs and railing
  // =============================================================================================================
  fbox("door", P.trimCream, "F", 0, 1.23, 0.74, 1.06, 0.03);
  fbox("door", P.timber, "F", 0, 1.2, 0.6, 1.0, 0.04, 0.03);
  for (const u of [-0.2, 0.2]) fbox("door", P.timberDark, "F", u, 1.2, 0.014, 0.96, 0.01, 0.07);
  for (const y of [0.85, 1.6]) fbox("door", P.timberDark, "F", 0, y, 0.6, 0.05, 0.012, 0.07);
  fbox("door", P.metalDark, "F", 0, 0.76, 0.6, 0.1, 0.014, 0.07); // kick plate
  cyl("door", P.metalDark, 0.115, 0.115, 0.03, 10, [cx, 1.38, FZ + 0.085], [90, 0, 0]);
  cyl("glow", P.windowGlow, 0.09, 0.09, 0.02, 10, [cx, 1.38, FZ + 0.1], [90, 0, 0]);
  fbox("door", P.metalDark, "F", 0, 1.38, 0.012, 0.18, 0.01, 0.1);
  fbox("door", P.metalDark, "F", 0, 1.38, 0.18, 0.012, 0.01, 0.1);
  for (const y of [0.95, 1.55]) fbox("door", P.metalDark, "F", -0.27, y, 0.08, 0.05, 0.02, 0.07); // hinges
  fbox("door", P.metalDark, "F", 0.22, 1.08, 0.045, 0.15, 0.015, 0.07); // handle plate
  fbox("door", P.metal, "F", 0.2, 1.1, 0.1, 0.025, 0.03, 0.085); // lever
  // sign plate above the door
  fbox("sign", P.trimCream, "F", 0, 1.84, 0.72, 0.12, 0.02);
  fbox("sign", P.ink, "F", 0, 1.84, 0.68, 0.09, 0.015, 0.02);
  const letters = [0.05, 0.03, 0.07, 0.04, 0.06, 0.03, 0.08, 0.04];
  let lu = -0.27;
  for (const lw of letters) {
    fbox("sign", P.trimCream, "F", lu + lw / 2, 1.84, lw, 0.04, 0.01, 0.035);
    lu += lw + 0.035;
  }

  // porch deck
  box("stairs", P.timber, [0.9, 0.06, 0.25], [cx, 0.67, 1.225]);
  box("stairs", P.timberDark, [0.9, 0.03, 0.03], [cx, 0.64, 1.365]);
  box("snow", P.snowTop, [0.55, 0.02, 0.18], [cx + 0.12, 0.71, 1.22]);
  for (const s of [1, -1]) box("stairs", P.timberDark, [0.06, 0.34, 0.06], [cx + s * 0.42, 0.47, 1.32]); // deck legs
  // treads
  const treads: [number, number][] = [
    [1.35, 0.58],
    [1.5, 0.46],
    [1.65, 0.34],
  ];
  for (const [z0, top] of treads) {
    box("stairs", P.timber, [0.8, 0.04, 0.17], [cx, top - 0.02, z0 + 0.075]);
    box("stairs", P.timberDark, [0.78, 0.12, 0.02], [cx, top - 0.1, z0 + 0.01]);
    box("snow", P.snowTop, [0.4 + R() * 0.2, 0.018, 0.1], [cx + (R() - 0.5) * 0.2, top + 0.009, z0 + 0.08]);
  }
  const strAng = Math.atan2(0.36, 0.45) / DEG;
  for (const s of [1, -1]) box("stairs", P.timberDark, [0.04, 0.14, 0.62], [cx + s * 0.4, 0.45, 1.575], [strAng, 0, 0]);
  // railing
  const railY = (z: number) => 1.2 - 0.752 * (z - 1.32);
  const railAng = Math.atan2(0.346, 0.46) / DEG;
  for (const s of [1, -1]) {
    const x = cx + s * 0.42;
    box("stairs", P.timber, [0.045, 0.5, 0.045], [x, 0.95, 1.32]);
    box("stairs", P.timber, [0.045, 0.53, 0.045], [x, 0.585, 1.78]);
    box("stairs", P.timber, [0.05, 0.04, 0.6], [x, 1.027, 1.55], [railAng, 0, 0]);
    box("stairs", P.timber, [0.04, 0.04, 0.24], [x, 1.2, 1.21]); // deck rail
    box("stairs", P.timber, [0.03, 0.03, 0.24], [x, 0.95, 1.21]);
    box("snow", P.snowTop, [0.04, 0.02, 0.5], [x, 1.054, 1.55], [railAng, 0, 0]);
    for (const [z0, top] of treads) {
      const zc = z0 + 0.075;
      const h = railY(zc) - top - 0.02;
      box("stairs", P.timber, [0.025, h, 0.025], [x, top + h / 2, zc]);
    }
  }

  // =============================================================================================================
  // Fuel pipe down the left wall, junction box and cable stub
  // =============================================================================================================
  const pX = LX + 0.045;
  const pZ = -0.55;
  cyl("pipe", P.metal, 0.03, 0.03, 1.3, 8, [pX, 0.99, pZ]);
  put("pipe", P.metal, new THREE.SphereGeometry(0.036, 8, 6), [pX, 1.64, pZ]);
  cyl("pipe", P.metal, 0.03, 0.03, 0.06, 8, [LX + 0.025, 1.64, pZ], [0, 0, 90]);
  cyl("pipe", P.metalDark, 0.055, 0.055, 0.02, 8, [LX + 0.01, 1.64, pZ], [0, 0, 90]);
  for (const y of [0.55, 0.95, 1.35]) box("pipe", P.metalDark, [0.045, 0.035, 0.09], [LX + 0.022, y, pZ]);
  for (const y of [0.75, 1.1]) cyl("pipe", P.drumYellow, 0.034, 0.034, 0.05, 8, [pX, y, pZ]);
  box("pipe", P.metalDark, [0.07, 0.09, 0.07], [pX, 0.48, pZ]); // valve body
  cyl("pipe", P.metalDark, 0.008, 0.008, 0.07, 6, [pX + 0.04, 0.48, pZ], [0, 0, 90]);
  put("valve", P.lampRed, new THREE.TorusGeometry(0.04, 0.009, 4, 8), [pX + 0.075, 0.48, pZ], [0, 90, 0]);
  cyl("pipe", P.metalDark, 0.045, 0.045, 0.03, 8, [pX, 0.345, pZ]);
  put("pipe", P.ink, new THREE.ConeGeometry(0.02, 0.05, 6), [pX, 0.31, pZ], [180, 0, 0]);
  // filler cap plate and snow on the top bracket
  box("pipe", P.snowTop, [0.07, 0.02, 0.07], [pX, 1.685, pZ]);
  // junction box with cable
  box("pipe", P.metalDark, [0.08, 0.2, 0.16], [LX + 0.04, 0.9, cz]);
  box("pipe", P.metal, [0.085, 0.02, 0.17], [LX + 0.04, 1.005, cz]);
  cyl("cable", P.ink, 0.012, 0.012, 0.06, 6, [LX + 0.09, 0.93, cz], [0, 0, 90]);
  box("pipe", P.lampRed, [0.012, 0.03, 0.03], [LX + 0.085, 0.84, cz + 0.05]);

  // =============================================================================================================
  // Flush: one merged, flat-shaded part per group and colour
  // =============================================================================================================
  for (const [, bk] of buckets) {
    const merged = mergeGeometries(bk.geos, false);
    if (!merged) continue;
    const part = b.part(merged, bk.color, {
      at: [0, 0, 0],
      flat: true,
      name: `cabin.${bk.group}.${bk.color.replace("#", "")}`,
    });
    if (bk.group === "glow") glow(part, 1);
    else if (bk.group === "beacon" && bk.color === P.lampRed) glow(part, 1.5);
  }
}
```