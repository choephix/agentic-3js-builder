<!-- call: plan -->

```json
{
  "name": "Baba Yaga's Hut on Chicken Legs",
  "description": "A stylized Slavic folk diorama: a log witch hut with carved gable boards and glowing windows, perched on two scaled chicken legs with clawed feet, beside a mossy mound with fly agaric.",
  "builderName": "babaYagaHut",
  "size": [2.7, 3.9, 2.9],
  "layout": "The hut stands on two splayed chicken legs and faces +Z. Feet (y=0) at x=±0.72 splay outward; each leg is a tall scaled shank rising to a feathered thigh that meets the hut floor at y=1.5. The hut body (y=1.5–2.6) is a log cabin of horizontal rounded logs, 1.7 m square in plan, its long front to +Z: a plank door with a carved red frame and a small round window sits on the front wall, and a second small window glows warm on the front-right. Above y=2.6 a steep shingled roof runs ridge along z, overhanging the walls by ~0.35 m; the +Z gable is a carved triangle of painted boards topped by a horse-head finial reaching y=3.9, with a stone chimney stub punching through the back slope. Painted folk trim (bright red boards with white zigzag bands) trims eaves, door and window frames; every surface is a flat colour with patterned boards built as separate parts. Around the feet: a low mossy mound with grey stones, grass tufts and two fly agaric mushrooms, sized to the hut's footprint, the only scenery.",
  "palette": {
    "logWood": "#8a5a33",
    "logDark": "#5f3c22",
    "plank": "#a06a3a",
    "roofShingle": "#7a4a2e",
    "trimRed": "#b23a2e",
    "trimWhite": "#f2e8d0",
    "doorWood": "#4a3220",
    "glow": "#ffca4a",
    "windowInk": "#2a2018",
    "featherWhite": "#e8dcc4",
    "featherBrown": "#7a4a2e",
    "scaleGold": "#d8a848",
    "claw": "#e8dcc4",
    "beak": "#e8a02a",
    "comb": "#e05656",
    "chimneyStone": "#6b6b66",
    "moss": "#6f8f3c",
    "grass": "#4f7a32",
    "stone": "#9a948a",
    "mushroom": "#d8663c",
    "straw": "#c8a24a"
  },
  "mounts": {
    "groundFeet": [0, 0, 0],
    "legTopL": [0.62, 1.5, 0.05],
    "legTopR": [-0.62, 1.5, 0.05],
    "hutFloor": [0, 1.5, 0],
    "roofLine": [0, 2.6, 0]
  },
  "joints": [],
  "parts": [
    {
      "id": "mound",
      "builds": "The ground scenery: a low irregular mossy mound (a lathe or stacked flattened domes, moss over stone, tallest ~0.25 m at centre, tapering to y=0 by radius 1.1 so it laps around the feet) standing on y=0. Grey stone outcrops poking through the moss, several upright grass tufts of flat blades, and two fly agaric mushrooms (chunky stems, red caps with small white dots as seated discs, one big one small) beside the front foot. All flat colours from the palette; keep it simpler and rougher than the hut.",
      "box": [[-1.3, 0, -1.3], [1.3, 0.3, 1.3]],
      "attaches": "Rests on y=0 across the model footprint; the chicken feet of part chickenLegs press into and stand on the mound at mount groundFeet.",
      "joints": [],
      "floor": true,
      "budget": 130
    },
    {
      "id": "chickenLegs",
      "builds": "Both chicken legs, mirrored about x=0. Each leg: a chunky scaled shank (a tapering sweep or stacked lathe segments, scaleGold with horizontal scale rings as thin seated discs) from y=0 up to a knee at ~y=0.95, a feathered thigh (overlapping flat feather blades in featherBrown with featherWhite tips) from the knee to y=1.5 where it ends under the hut floor, a small backward-bent hock spur, and a foot at y=0: three chunky forward toes plus one rear toe, each a two-segment bend with blunt claw tips in claw, and tiny scale studs on the toe tops. A yellow beak-shaped wattle/comb detail is not needed on legs; keep the feet birdlike and sturdy. The legs splay outward: foot centres at x=±0.72, leg tops at x=±0.62.",
      "box": [[-1.05, 0, -0.55], [1.05, 1.55, 0.55]],
      "attaches": "Feet stand on the mound at groundFeet (y=0); each thigh top meets the underside of the hut floor at mounts legTopL and legTopR, hidden inside the log base.",
      "joints": [],
      "floor": true,
      "budget": 220
    },
    {
      "id": "hutWalls",
      "builds": "The log cabin body, 1.7 m square in plan (x and z ±0.85), from the underside floor level y=1.45 to the wall top y=2.6. Walls are horizontal rounded logs (about 7 courses of short cylinders or a loft with a log-scale ripple), logWood with darker logDark end-caps at the corners and a logDark chink line between every course built as thin seated strips. Front (+Z) face: a plank door (~0.55 m wide) with a trimRed carved frame and a trimWhite zigzag band, a small square window (~0.28 m) with a glowing glow pane, windowInk frame and trimRed shutters, and a second smaller window on the front-right. Base trim: a trimRed skirt board with white notches around the whole cabin at y≈1.55. A tiny straw bundle or dried charm hanging beside the door adds folk detail.",
      "box": [[-0.9, 1.45, -0.9], [0.9, 2.6, 0.95]],
      "attaches": "Sits on the legs: its underside is the hutFloor plane at y=1.5, resting on the thigh tops at mounts legTopL and legTopR. Its top wall edge meets the roof at mount roofLine (y=2.6).",
      "joints": [],
      "floor": false,
      "budget": 280
    },
    {
      "id": "roof",
      "builds": "The steep shingled roof from y=2.6 to a ridge at y=3.5, ridge running along z, overhanging the walls to x=±1.25 and z=±1.15. Rows of roofShingle shingles (stepped bands with visible seated shingle lips), a ridge cap of raised boards, and eave fascia boards in trimRed with trimWhite zigzag folk bands on all four sides. The +Z gable is a filled triangle of plank with a big carved trimRed sun or horse motif and white outline parts, topped by a horse-head finial (a simple flat carved head silhouette in plank with a mane of small blades and a trimRed bridle line) rising to y≈3.9. A chimneyStone stub (~0.16 m across) punches through the back slope at (x=-0.35, z=-0.55) with a moss cap and a rim of stones at its top. A few moss patches and one lichen spot on the shingles near the eaves.",
      "box": [[-1.25, 2.55, -1.15], [1.25, 3.9, 1.15]],
      "attaches": "Its eave underside sits on the wall tops at mount roofLine (y=2.6); the gable face and finial hang over the +Z front, clear of the door and windows below.",
      "joints": [],
      "floor": false,
      "budget": 270
    }
  ]
}
```

<!-- call: mound -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildMound({ b, J, P, M }: Ctx) {
  const r = rng(11);
  const DARK_MOSS = "#587532";
  const CAP = "#c8382a";
  const STEM = "#efe6cf";
  const SOIL = "#5f3c22";

  // Moss mound: stacked flattened lathe domes with an irregular rim
  b.lathe(
    [
      [0, 0],
      [1.1, 0],
      [1.08, 0.03],
      [0.85, 0.1],
      [0.5, 0.19],
      [0.2, 0.245],
      [0, 0.25],
    ],
    { at: [0, 0, 0], segments: 14, color: P.moss },
  );
  // soil skirt ring at the rim
  b.lathe(
    [
      [0.95, 0],
      [1.14, 0],
      [1.1, 0.025],
      [0.95, 0.04],
    ],
    { at: [0, 0, 0], segments: 14, color: SOIL },
  );
  // lumpy moss blobs
  for (let i = 0; i < 12; i++) {
    const a = r() * Math.PI * 2;
    const d = 0.25 + r() * 0.7;
    const s = 0.12 + r() * 0.14;
    const h = Math.max(0.02, 0.24 - d * 0.2);
    b.part(new THREE.SphereGeometry(1, 7, 5), i % 3 ? P.moss : DARK_MOSS, {
      at: [Math.sin(a) * d, h * 0.7, Math.cos(a) * d],
      scale: [s, s * 0.35, s],
      flat: true,
    });
  }

  // Stone outcrops
  const stones: [number, number, number, number][] = [
    [-0.8, 0.2, 0.2, 0.15],
    [0.85, 0.35, 0.18, 0.12],
    [-0.4, -0.75, 0.22, 0.16],
    [0.5, -0.8, 0.16, 0.11],
    [1.0, -0.2, 0.13, 0.09],
    [-1.0, -0.4, 0.12, 0.09],
    [0.1, 0.95, 0.14, 0.1],
    [-0.65, 0.8, 0.12, 0.08],
  ];
  for (const [x, z, s, h] of stones) {
    b.part(new THREE.DodecahedronGeometry(s, 0), P.stone, {
      at: [x, h * 0.4, z],
      scale: [1, h / s, 0.85],
      rotation: [0, r() * 180, 0],
      flat: true,
    });
    b.part(new THREE.DodecahedronGeometry(s * 0.55, 0), "#7d776e", {
      at: [x + s * 0.7, h * 0.18, z + s * 0.3],
      scale: [1, 0.6, 1],
      rotation: [0, r() * 180, 0],
      flat: true,
    });
    // moss cap on the stone
    b.part(new THREE.SphereGeometry(s * 0.6, 6, 4), P.moss, {
      at: [x, h * 0.85, z],
      scale: [1, 0.3, 0.9],
      flat: true,
    });
  }

  // Grass tufts: fans of flat blades
  const tufts: [number, number][] = [
    [-0.55, 0.45], [0.7, 0.6], [-0.9, -0.1], [0.3, -0.55],
    [-0.2, -0.95], [0.95, -0.55], [-0.75, 0.9], [0.35, 1.0],
    [0.0, 0.55], [-0.3, 0.2],
  ];
  for (const [x, z] of tufts) {
    const y0 = Math.max(0.03, 0.22 - Math.hypot(x, z) * 0.18);
    const n = 5;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + r();
      const lean = 0.25 + r() * 0.3;
      const len = 0.16 + r() * 0.12;
      const bx = Math.sin(a), bz = Math.cos(a);
      b.spike(
        [x + bx * 0.015, y0, z + bz * 0.015],
        [bx * lean, 1, bz * lean],
        len,
        0.016,
        { color: k % 2 ? P.grass : "#6a9a3a", sides: 3 },
      );
    }
  }

  // Fly agaric mushrooms beside the front foot (x ~ ±0.72, z front)
  const mush = (x: number, z: number, s: number, tilt: number) => {
    const y0 = Math.max(0.03, 0.22 - Math.hypot(x, z) * 0.18);
    const stemH = 0.2 * s;
    b.part(new THREE.CylinderGeometry(0.035 * s, 0.05 * s, stemH, 8), STEM, {
      at: [x, y0 + stemH / 2 - 0.01, z],
      rotation: [tilt, 0, tilt * 0.5],
    });
    // skirt ring
    b.part(new THREE.CylinderGeometry(0.05 * s, 0.045 * s, 0.015 * s, 8), "#d8ccb0", {
      at: [x, y0 + stemH * 0.65, z],
    });
    const capY = y0 + stemH - 0.01;
    const R = 0.11 * s;
    b.part(new THREE.SphereGeometry(R, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), CAP, {
      at: [x, capY, z],
      scale: [1, 0.75, 1],
      flat: true,
    });
    // underside gill disc
    b.part(new THREE.CylinderGeometry(R * 0.95, R * 0.7, 0.012, 10), "#e8dcc4", {
      at: [x, capY - 0.005, z],
    });
    // white dots seated on the cap
    const dots = 8;
    for (let k = 0; k < dots; k++) {
      const az = (k / dots) * Math.PI * 2 + s;
      const el = k % 2 ? 0.55 : 0.95;
      const nx = Math.sin(az) * Math.cos(el);
      const ny = Math.sin(el);
      const nz = Math.cos(az) * Math.cos(el);
      const p: [number, number, number] = [
        x + nx * R * 0.97,
        capY + ny * R * 0.75 * 0.97,
        z + nz * R * 0.97,
      ];
      b.part(new THREE.CylinderGeometry(0.018 * s, 0.018 * s, 0.008, 6), P.trimWhite, {
        at: p,
        dir: [nx, ny, nz],
      });
    }
    b.part(new THREE.CylinderGeometry(0.02 * s, 0.02 * s, 0.008, 6), P.trimWhite, {
      at: [x, capY + R * 0.75 * 0.99, z],
    });
  };
  mush(0.98, 0.7, 1.3, 0.05);
  mush(1.12, 0.45, 0.7, -0.12);
}
```

<!-- call: hutWalls -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildHutWalls({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const W = 0.85; // half width
  const Y0 = 1.45;
  const COURSES = 7;
  const LR = 0.082; // log radius
  const pitch = (2.6 - 1.5) / COURSES; // ~0.157
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, ry = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], rotation: [0, ry, 0] });
  const cyl = (r: number, len: number, color: string, at: number[], rot: number[], seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at: at as [number, number, number], rotation: rot as [number, number, number] });

  // inner core so there are no gaps
  box(2 * W - 0.1, 1.15, 2 * W - 0.1, P.logDark, 0, 2.025, 0);

  // log courses
  for (let i = 0; i < COURSES; i++) {
    const y = 1.5 + pitch * (i + 0.5);
    const off = i % 2 ? 0.04 : 0;
    const col = i % 2 ? P.logWood : "#98643a";
    // front/back logs run along X, side logs along Z; alternate protruding ends
    for (const s of [1, -1]) {
      const ext = 0.12 + (i % 2) * 0.06;
      cyl(LR, 2 * W + ext, col, [0, y, s * (W - 0.02 + off)], [0, 0, 90]);
      cyl(LR, 2 * W + ext, col, [s * (W - 0.02 + (i % 2 ? 0 : 0.04)), y, 0], [90, 0, 0]);
      // end caps (dark rings)
      const e = (2 * W + ext) / 2;
      for (const t of [1, -1]) {
        b.part(new THREE.CylinderGeometry(LR * 0.8, LR * 0.8, 0.014, 8), P.logDark, {
          at: [t * e, y, s * (W - 0.02 + off)], rotation: [0, 0, 90],
        });
        b.part(new THREE.CylinderGeometry(LR * 0.8, LR * 0.8, 0.014, 8), P.logDark, {
          at: [s * (W - 0.02 + (i % 2 ? 0 : 0.04)), y, t * e], rotation: [90, 0, 0],
        });
      }
    }
    // chink lines between courses
    if (i > 0) {
      const cy = 1.5 + pitch * i;
      box(2 * W - 0.1, 0.012, 0.012, P.logDark, 0, cy, W + 0.045);
      box(2 * W - 0.1, 0.012, 0.012, P.logDark, 0, cy, -W - 0.025);
      box(0.012, 0.012, 2 * W - 0.1, P.logDark, W + 0.045, cy, 0);
      box(0.012, 0.012, 2 * W - 0.1, P.logDark, -W - 0.045, cy, 0);
    }
    // wood grain knots
    if (R() > 0.4) {
      b.part(new THREE.SphereGeometry(0.02, 5, 4), P.logDark, { at: [(R() - 0.5) * 1.2, y, W + 0.06], scale: [1, 1, 0.4] });
    }
  }

  const FZ = W + LR * 0.9; // front surface z ~0.93

  // skirt board with white notches
  box(2 * W + 0.2, 0.09, 0.05, P.trimRed, 0, 1.55, FZ + 0.01);
  box(2 * W + 0.2, 0.09, 0.05, P.trimRed, 0, 1.55, -FZ - 0.01);
  box(0.05, 0.09, 2 * W + 0.2, P.trimRed, FZ + 0.01, 1.55, 0);
  box(0.05, 0.09, 2 * W + 0.2, P.trimRed, -FZ - 0.01, 1.55, 0);
  for (let i = 0; i < 12; i++) {
    const t = -0.95 + i * (1.9 / 11);
    const nz = (x: number, z: number, ry: number) =>
      b.part(new THREE.ConeGeometry(0.03, 0.04, 3), P.trimWhite, { at: [x, 1.55, z], rotation: [0, ry, 180] });
    nz(t, FZ + 0.04, 0);
    nz(t, -FZ - 0.04, 0);
    b.part(new THREE.ConeGeometry(0.03, 0.04, 3), P.trimWhite, { at: [FZ + 0.04, 1.55, t], rotation: [0, 90, 180] });
    b.part(new THREE.ConeGeometry(0.03, 0.04, 3), P.trimWhite, { at: [-FZ - 0.04, 1.55, t], rotation: [0, 90, 180] });
  }

  // corner posts accents
  for (const sx of [1, -1]) for (const sz of [1, -1]) box(0.05, 1.1, 0.05, P.logDark, sx * (W + 0.1), 2.05, sz * (W + 0.1));

  // ---- DOOR (left of centre, x=-0.2) ----
  const dx = -0.22, dy = 1.98, dz = FZ + 0.03;
  box(0.7, 0.94, 0.03, P.trimRed, dx, dy + 0.02, dz); // frame
  box(0.55, 0.82, 0.04, P.doorWood, dx, dy, dz + 0.015);
  for (let i = 0; i < 4; i++) box(0.005, 0.8, 0.045, P.windowInk, dx - 0.2 + i * 0.133 + 0.067, dy, dz + 0.02);
  box(0.55, 0.035, 0.05, P.windowInk, dx, dy + 0.22, dz + 0.025); // hinge straps
  box(0.55, 0.035, 0.05, P.windowInk, dx, dy - 0.22, dz + 0.025);
  // zigzag band above door
  box(0.74, 0.06, 0.03, P.trimWhite, dx, dy + 0.53, dz + 0.01);
  for (let i = 0; i < 7; i++)
    b.part(new THREE.ConeGeometry(0.03, 0.05, 3), P.trimRed, { at: [dx - 0.3 + i * 0.1, dy + 0.53, dz + 0.035], rotation: [90, 0, i % 2 ? 180 : 0] });
  // door arch top peak
  b.part(new THREE.ConeGeometry(0.2, 0.12, 3), P.trimRed, { at: [dx, dy + 0.64, dz], rotation: [90, 0, 0], scale: [1.8, 1, 0.2] });
  // handle
  b.part(new THREE.SphereGeometry(0.026, 6, 5), P.scaleGold, { at: [dx + 0.2, dy - 0.02, dz + 0.055] });
  // step
  box(0.66, 0.05, 0.2, P.plank, dx, 1.51, FZ + 0.12);
  box(0.5, 0.05, 0.14, P.logWood, dx, 1.46, FZ + 0.2);

  // ---- WINDOW 1 (above-left of door? small round-ish square) on the right of the door ----
  const win = (x: number, y: number, z: number, s: number) => {
    box(s + 0.12, s + 0.12, 0.03, P.trimRed, x, y, z);
    box(s + 0.04, s + 0.04, 0.04, P.windowInk, x, y, z + 0.008);
    box(s - 0.02, s - 0.02, 0.045, P.glow, x, y, z + 0.015);
    box(0.014, s - 0.02, 0.05, P.windowInk, x, y, z + 0.02);
    box(s - 0.02, 0.014, 0.05, P.windowInk, x, y, z + 0.02);
    // sill
    box(s + 0.2, 0.035, 0.08, P.trimWhite, x, y - s / 2 - 0.08, z + 0.02);
    // shutters
    for (const sx of [1, -1]) {
      const sxp = x + sx * (s / 2 + 0.1);
      box(0.1, s + 0.08, 0.03, P.trimRed, sxp, y, z + 0.01);
      box(0.03, s - 0.02, 0.035, P.trimWhite, sxp, y, z + 0.03);
      b.part(new THREE.SphereGeometry(0.016, 5, 4), P.trimWhite, { at: [sxp, y + s * 0.3, z + 0.03] });
      b.part(new THREE.SphereGeometry(0.016, 5, 4), P.trimWhite, { at: [sxp, y - s * 0.3, z + 0.03] });
    }
    // top zigzag
    for (let i = 0; i < 4; i++)
      b.part(new THREE.ConeGeometry(0.028, 0.05, 3), P.trimWhite, { at: [x - 0.09 + i * 0.06, y + s / 2 + 0.09, z + 0.02], rotation: [90, 0, i % 2 ? 180 : 0] });
  };
  win(0.5, 2.15, FZ + 0.03, 0.28);
  // second smaller on the front-right: on the right (-X is model right; spec says front-right) side wall
  win(-0.62, 2.28, FZ + 0.03, 0.2);

  // round-ish glowing window on right-hand side wall too
  const sx = -(FZ + 0.03);
  box(0.03, 0.4, 0.4, P.trimRed, sx, 2.1, 0.1);
  box(0.04, 0.3, 0.3, P.windowInk, sx - 0.005, 2.1, 0.1);
  box(0.045, 0.26, 0.26, P.glow, sx - 0.012, 2.1, 0.1);
  box(0.05, 0.012, 0.26, P.windowInk, sx - 0.016, 2.1, 0.1);
  box(0.05, 0.26, 0.012, P.windowInk, sx - 0.016, 2.1, 0.1);
  // left wall window
  box(0.03, 0.4, 0.4, P.trimRed, FZ + 0.03, 2.1, -0.1);
  box(0.04, 0.3, 0.3, P.windowInk, FZ + 0.035, 2.1, -0.1);
  box(0.045, 0.26, 0.26, P.glow, FZ + 0.042, 2.1, -0.1);
  box(0.05, 0.012, 0.26, P.windowInk, FZ + 0.046, 2.1, -0.1);
  box(0.05, 0.26, 0.012, P.windowInk, FZ + 0.046, 2.1, -0.1);

  // top wall trim band (under roof)
  box(2 * W + 0.12, 0.05, 0.04, P.trimRed, 0, 2.56, FZ + 0.02);
  box(2 * W + 0.12, 0.05, 0.04, P.trimRed, 0, 2.56, -FZ - 0.02);
  box(0.04, 0.05, 2 * W + 0.12, P.trimRed, FZ + 0.02, 2.56, 0);
  box(0.04, 0.05, 2 * W + 0.12, P.trimRed, -FZ - 0.02, 2.56, 0);

  // ---- hanging straw charm beside door ----
  const hx = 0.12, hz = FZ + 0.04;
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.08, 5), P.logDark, { at: [hx, 2.5, hz] });
  b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.14, 4), P.windowInk, { at: [hx, 2.4, hz + 0.01] });
  b.part(new THREE.CylinderGeometry(0.035, 0.05, 0.16, 7), P.straw, { at: [hx, 2.28, hz + 0.02] });
  b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.025, 7), P.trimRed, { at: [hx, 2.32, hz + 0.02] });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(new THREE.ConeGeometry(0.012, 0.09, 4), P.straw, {
      at: [hx + Math.cos(a) * 0.035, 2.16, hz + 0.02 + Math.sin(a) * 0.035], rotation: [180, 0, 0],
    });
  }
  b.part(new THREE.SphereGeometry(0.02, 6, 5), P.comb, { at: [hx, 2.12, hz + 0.02] });
}
```

<!-- call: chickenLegs -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildChickenLegs({ b, J, P, M }: any) {
  const rand = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const RING = "#b8862e";
  const CLAW_TIP = "#cdbf9f";

  const place = (geo: THREE.BufferGeometry, color: string, at: THREE.Vector3, dir: THREE.Vector3, scale?: number[]) =>
    b.part(geo, color, { at: at.toArray(), dir: dir.clone().normalize().toArray(), scale });

  const unitSphere = new THREE.SphereGeometry(1, 6, 4);
  const ringGeo = new THREE.CylinderGeometry(0.066, 0.066, 0.014, 8);
  const studGeo = new THREE.SphereGeometry(0.014, 5, 4);
  const clawGeo = new THREE.ConeGeometry(0.04, 0.11, 6);

  for (const s of [1, -1]) {
    const top = V((M?.legTopL?.[0] ?? 0.62) * s, M?.legTopL?.[1] ?? 1.5, M?.legTopL?.[2] ?? 0.05);
    const knee = V(0.67 * s, 0.95, 0.12);
    const ankle = V(0.72 * s, 0.11, -0.02);

    // Thigh core, hidden under the feathers, extends into the hut floor
    b.capsule([top.x, top.y + 0.1, top.z], knee.toArray(), [0.1, 0.085], P.featherBrown);
    // knee joint ball
    b.part(new THREE.SphereGeometry(0.09, 8, 6), P.featherBrown, { at: knee.toArray() });

    // Feathers
    const u = knee.clone().sub(top).normalize();
    const rows = 4;
    const count = 7;
    for (let r = 0; r < rows; r++) {
      const t = 0.02 + r * 0.24;
      const center = top.clone().lerp(knee, t);
      const rad0 = 0.1 - t * 0.015;
      for (let i = 0; i < count; i++) {
        const a = ((i + (r % 2) * 0.5) / count) * Math.PI * 2;
        const radial = V(Math.cos(a), 0, Math.sin(a));
        const pos = center.clone().addScaledVector(radial, rad0);
        const dir = u.clone().add(radial.clone().multiplyScalar(0.3 + rand() * 0.1)).normalize();
        const len = 0.2 + rand() * 0.03;
        const c = pos.clone().addScaledVector(dir, len * 0.5);
        place(unitSphere, P.featherBrown, c, dir, [0.05, len * 0.5, 0.02]);
        const tip = pos.clone().addScaledVector(dir, len * 0.88);
        place(unitSphere, P.featherWhite, tip, dir, [0.042, len * 0.17, 0.018]);
      }
    }

    // Shank
    b.capsule(knee.toArray(), ankle.toArray(), [0.062, 0.05], P.scaleGold);
    const sd = ankle.clone().sub(knee).normalize();
    for (let i = 0; i < 6; i++) {
      const t = 0.18 + i * 0.14;
      const p = knee.clone().lerp(ankle, t);
      const r = 1.0 - t * 0.2;
      b.part(ringGeo, RING, { at: p.toArray(), dir: sd.toArray(), scale: [r, 1, r] });
    }

    // Hock spur, bent backward
    const spurBase = knee.clone().lerp(ankle, 0.35).add(V(0, 0, -0.04));
    b.part(new THREE.ConeGeometry(0.035, 0.16, 6), P.claw, {
      at: spurBase.clone().add(V(0, -0.02, -0.07)).toArray(),
      dir: V(0, -0.35, -1).normalize().toArray(),
    });

    // Ankle pad
    b.part(new THREE.SphereGeometry(0.07, 8, 6), P.scaleGold, { at: [ankle.x, 0.075, ankle.z], scale: [1.1, 0.95, 1.1] });

    // Toes: three forward, one rear
    const toes = [
      { ang: -38, l1: 0.2, l2: 0.14 },
      { ang: 0, l1: 0.24, l2: 0.16 },
      { ang: 38, l1: 0.2, l2: 0.14 },
      { ang: 180, l1: 0.14, l2: 0.1 },
    ];
    for (const toe of toes) {
      const a = (toe.ang * Math.PI) / 180;
      const d1 = V(Math.sin(a), 0, Math.cos(a));
      const base = V(ankle.x, 0.04, ankle.z + (toe.ang === 180 ? -0.03 : 0.0));
      const joint = base.clone().addScaledVector(d1, toe.l1);
      const d2 = d1.clone().add(V(0, -0.12, 0)).normalize();
      const end = joint.clone().addScaledVector(d2, toe.l2);
      end.y = Math.max(end.y, 0.036);
      b.capsule(base.toArray(), joint.toArray(), [0.045, 0.04], P.scaleGold);
      b.capsule(joint.toArray(), end.toArray(), [0.04, 0.034], P.scaleGold);
      // claw
      const cd = d2.clone().add(V(0, -0.25, 0)).normalize();
      const cpos = end.clone().addScaledVector(cd, 0.05);
      place(clawGeo, P.claw, cpos, cd);
      place(new THREE.ConeGeometry(0.014, 0.03, 5), CLAW_TIP, end.clone().addScaledVector(cd, 0.1), cd);
      // studs on toe top
      for (const [pt, p0, p1] of [[0.5, base, joint], [0.55, joint, end]] as const) {
        const p = p0.clone().lerp(p1, pt);
        b.part(studGeo, RING, { at: [p.x, p.y + 0.035, p.z], scale: [1, 0.7, 1] });
      }
    }
  }
}
```

<!-- call: roof -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildRoof({ b, J, P, M }: Ctx) {
  const RIDGE = 3.5;
  const RUN = 1.25;
  const RISE = 0.95; // eave edge sits at y = 2.55
  const L = Math.hypot(RUN, RISE);
  const ang = Math.atan2(RISE, RUN);
  const c = Math.cos(ang);
  const sn = Math.sin(ang);
  const SH_LIGHT = "#8a5a3a";
  const SEAM = "#7e5230";
  const BAND = "#55554f";
  const LICHEN = "#c9c88a";
  const FLUE = "#1c1612";
  const r = rng(11);

  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  // Place a part in a roof slope frame: u down the slope from the ridge, v out of the surface.
  const put = (
    geo: THREE.BufferGeometry,
    color: string,
    s: number,
    u: number,
    v: number,
    z: number,
    extra: [number, number, number] = [0, 0, 0],
    scale?: [number, number, number],
  ) => {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -s * ang));
    q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(...extra)));
    return b.part(geo, color, {
      at: [s * (u * c + v * sn), RIDGE - u * sn + v * c, z],
      quat: q,
      scale,
    });
  };

  for (const s of [1, -1]) {
    // Roof deck
    put(box(L + 0.06, 0.06, 2.3), P.roofShingle, s, L / 2, -0.03, 0);

    // Shingle rows with seated lips
    for (let i = 0; i < 5; i++) {
      const uc = 0.2 + i * 0.3;
      const col = i % 2 ? P.roofShingle : SH_LIGHT;
      put(box(0.29, 0.04, 2.28), col, s, uc, 0.02, 0);
      const off = i % 2 ? 0.115 : 0;
      for (let k = 0; k < 10; k++) {
        const z = -1.035 + k * 0.23 + off;
        if (Math.abs(z) > 1.07) continue;
        put(box(0.045, 0.05, 0.205), (k + i) % 2 ? SH_LIGHT : P.roofShingle, s, uc + 0.15, 0.04, z);
      }
    }

    // Eave fascia with white zigzag diamonds
    put(box(0.05, 0.17, 2.3), P.trimRed, s, L + 0.01, -0.04, 0);
    for (let k = 0; k < 10; k++) {
      const z = -1.035 + k * 0.23;
      put(box(0.012, 0.075, 0.075), P.trimWhite, s, L + 0.04, -0.04, z, [Math.PI / 4, 0, 0]);
    }

    // Barge boards on front and back slope edges
    for (const zs of [1, -1]) {
      put(box(L, 0.13, 0.05), P.trimRed, s, L / 2, 0.06, zs * 1.12);
      for (let k = 0; k < 8; k++) {
        put(box(0.07, 0.05, 0.012), P.trimWhite, s, 0.12 + k * 0.19, 0.06, zs * 1.148, [0, 0, Math.PI / 4]);
      }
    }

    // Ridge cap boards
    put(box(0.3, 0.04, 2.3), P.plank, s, 0.1, 0.06, 0, [0, 0, 0]);
    put(box(0.05, 0.05, 2.3), P.trimRed, s, 0.27, 0.07, 0);
  }

  // Ridge pole and knobs
  b.part(box(0.1, 0.09, 2.3), P.trimRed, { at: [0, RIDGE + 0.1, 0] });
  for (let k = 0; k < 9; k++) {
    b.part(new THREE.SphereGeometry(0.03, 6, 4), P.trimWhite, { at: [0, RIDGE + 0.155, -0.98 + k * 0.245] });
  }

  // Moss patches and lichen near the eaves
  const mossSpots: [number, number, number][] = [
    [1, 1.3, 0.6],
    [1, 1.45, -0.7],
    [-1, 1.35, 0.3],
    [-1, 1.2, -0.9],
    [1, 1.1, -0.2],
  ];
  for (const [s, u, z] of mossSpots) {
    const k = 0.8 + r() * 0.5;
    put(new THREE.SphereGeometry(0.1, 7, 4), P.moss, s, u, 0.04, z, [0, 0, 0], [k * 1.3, 0.25, k]);
  }
  put(new THREE.CylinderGeometry(0.05, 0.05, 0.01, 8), LICHEN, -1, 0.9, 0.06, 0.75);
  put(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 8), LICHEN, -1, 0.97, 0.06, 0.82);

  // Gables
  const tri: [number, number][] = [
    [-1.2, 0],
    [1.2, 0],
    [0, 0.88],
  ];
  for (const zs of [1, -1]) {
    b.extrude(tri, { at: [0, 2.56, zs * 1.1], x: [zs, 0, 0], thickness: 0.06, color: P.plank });
    for (let k = -4; k <= 4; k++) {
      const x = k * 0.2 + 0.1;
      const h = 0.88 * (1 - Math.abs(x) / 1.2) - 0.03;
      if (h < 0.05) continue;
      b.part(box(0.012, h, 0.008), SEAM, { at: [x, 2.56 + h / 2, zs * 1.132] });
    }
  }

  // Front sun motif
  const SC: [number, number] = [0, 2.95];
  const disc = (rad: number, col: string, z: number, zs = 1) =>
    b.part(new THREE.CylinderGeometry(rad, rad, 0.01, 18), col, {
      at: [SC[0], SC[1], zs * z],
      rotation: [90, 0, 0],
    });
  disc(0.31, P.trimWhite, 1.138);
  disc(0.27, P.trimRed, 1.144);
  disc(0.17, P.trimWhite, 1.148);
  disc(0.13, P.trimRed, 1.152);
  disc(0.05, P.glow, 1.156);
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    const dx = -Math.sin(a);
    const dy = Math.cos(a);
    if (SC[1] + dy * 0.42 < 2.66) continue;
    b.part(new THREE.ConeGeometry(0.04, 0.16, 4), k % 2 ? P.trimRed : P.trimWhite, {
      at: [dx * 0.4, SC[1] + dy * 0.4, 1.14],
      rotation: [0, 0, (a * 180) / Math.PI],
    });
  }
  // Back: small sun
  disc(0.2, P.trimWhite, 1.138, -1);
  disc(0.16, P.trimRed, 1.144, -1);
  disc(0.06, P.trimWhite, 1.148, -1);

  // Horse-head finials
  const head: [number, number][] = [
    [-0.1, 0],
    [0.1, 0],
    [0.12, 0.1],
    [0.2, 0.2],
    [0.3, 0.26],
    [0.31, 0.32],
    [0.22, 0.37],
    [0.14, 0.4],
    [0.08, 0.47],
    [0.0, 0.4],
    [-0.1, 0.3],
    [-0.12, 0.15],
  ];
  const k = 0.82;
  for (const zs of [1, -1]) {
    const base = [0, 3.46, zs * 1.0];
    const sc = zs > 0 ? 1 : 0.8;
    b.extrude(
      head.map(([x, y]) => [x * k * sc, y * k * sc] as [number, number]),
      { at: base as [number, number, number], x: [0, 0, zs], thickness: 0.06, color: P.plank },
    );
    const W = (px: number, py: number) => [0, base[1] + py * k * sc, base[2] + zs * px * k * sc] as [number, number, number];
    for (const sx of [1, -1]) {
      const e = W(0.18, 0.3);
      b.part(new THREE.SphereGeometry(0.014, 5, 4), P.windowInk, { at: [sx * 0.03, e[1], e[2]] });
      const n = W(0.3, 0.29);
      b.part(new THREE.SphereGeometry(0.01, 5, 4), P.windowInk, { at: [sx * 0.03, n[1], n[2]] });
    }
    // bridle
    const br = W(0.19, 0.22);
    b.part(box(0.07, 0.014, 0.035), P.trimRed, { at: br, rotation: [zs * -35, 0, 0] });
    const br2 = W(0.12, 0.3);
    b.part(box(0.07, 0.014, 0.03), P.trimRed, { at: br2, rotation: [zs * 30, 0, 0] });
    // mane blades
    for (let i = 0; i < 5; i++) {
      const p = W(-0.1 - i * 0.002, 0.08 + i * 0.065);
      b.part(new THREE.ConeGeometry(0.018, 0.1, 4), i % 2 ? P.trimWhite : P.trimRed, {
        at: p,
        rotation: [0, 0, 0],
        dir: [0, 0.3, -zs],
      });
    }
  }

  // Chimney
  const cx = -0.35;
  const cz = -0.55;
  b.part(box(0.16, 0.47, 0.16), P.chimneyStone, { at: [cx, 3.385, cz] });
  for (const y of [3.3, 3.45, 3.57]) b.part(box(0.17, 0.015, 0.17), BAND, { at: [cx, y, cz] });
  b.part(box(0.1, 0.01, 0.1), FLUE, { at: [cx, 3.625, cz] });
  const rim: [number, number][] = [
    [0.085, 0],
    [-0.085, 0],
    [0, 0.085],
    [0, -0.085],
    [0.07, 0.07],
    [-0.07, 0.07],
    [0.07, -0.07],
    [-0.07, -0.07],
  ];
  rim.forEach(([dx, dz], i) => {
    b.part(box(0.06, 0.05, 0.06), i % 3 ? P.stone : P.chimneyStone, {
      at: [cx + dx, 3.635, cz + dz],
      rotation: [0, i * 20, 0],
    });
  });
  b.part(new THREE.SphereGeometry(0.05, 6, 4), P.moss, { at: [cx + 0.07, 3.665, cz + 0.07], scale: [1.2, 0.5, 1.2] });
  b.part(new THREE.SphereGeometry(0.04, 6, 4), P.moss, { at: [cx - 0.07, 3.66, cz - 0.07], scale: [1.2, 0.5, 1.2] });
  // soot/moss at base of chimney on roof
  b.part(new THREE.SphereGeometry(0.08, 6, 4), P.moss, { at: [cx - 0.09, 3.2, cz + 0.05], scale: [1, 0.35, 1.3] });

  return b.root;
}
```