```ts
import * as THREE from "three";
import { createBuilder, frame, rng, catmull, offset } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Baba Yaga's Hut",
  description:
    "A painted Slavic folk-art log hut standing on two giant chicken legs, with carved konyok horse ridge ends, a sunburst gable, glowing windows, skull stakes and a ladder, on a small grass diorama base.",
};

// ---------- palette ----------
const LOG_A = "#6b4426";
const LOG_B = "#7a4e2b";
const LOG_C = "#5a381f";
const LOG_END = "#d3a566";
const PLANK = "#8a5c34";
const RED = "#c8261e";
const BLUE = "#234a96";
const DEEP_BLUE = "#17306a";
const GOLD = "#f2b82b";
const CREAM = "#f4e8c8";
const GREEN = "#2f7d3a";
const MOSS = "#4d7a2c";
const SHINGLE_A = "#5a4a38";
const SHINGLE_B = "#6e5b44";
const LEG = "#e8b02e";
const LEG_RING = "#c48a1a";
const CLAW = "#4a3320";
const FEATHER_A = "#c9822c";
const FEATHER_B = "#f0d9a0";
const FEATHER_C = "#9c5a22";
const BONE = "#efe6cf";
const DARK = "#1c1410";
const EMBER = "#ff9a2a";
const WINDOW = "#ffd466";
const BRICK = "#8a4a3a";
const SMOKE = "#cfcfd6";
const EARTH = "#5a3b24";
const GRASS = "#5b8f3a";
const STONE = "#8d8a86";

// ---------- dimensions ----------
const G = 0.18; // grass top
const FL = 2.6; // hut floor height
const W = 1.3; // half width (x) of the log walls
const D = 1.4; // half depth (z)
const ROOF_A = (Math.atan2(1.3, 1.75) * 180) / Math.PI;
const RAD = Math.PI / 180;

export default function build() {
  const b = createBuilder({ name: "baba_yaga_hut" });
  const R = rng(11);

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, color: string, at: number[], rotation?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, rotation, flat: true });
  const cyl = (rt: number, rb: number, h: number, color: string, at: number[], dir?: number[], seg = 8) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, dir, flat: true });
  const ball = (r: number, color: string, at: number[], scale?: number[], seg = 8) =>
    b.part(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2)), color, { at, scale, flat: true });

  /** Painted flower: disc, petals ring, centre dot. */
  function rosette(at: number[], dir: number[], r: number, c1: string, c2: string, c3: string) {
    cyl(r, r, 0.02, c1, at, dir, 12);
    const lift = offset(at, dir, 0.014);
    b.ring(frame(lift, dir), { count: 6, radius: r * 0.55 }, (it) =>
      b.part(new THREE.SphereGeometry(r * 0.3, 6, 4), c2, { frame: it, scale: [1, 1.5, 0.5], flat: true }),
    );
    cyl(r * 0.3, r * 0.3, 0.02, c3, offset(at, dir, 0.026), dir, 8);
  }

  /** Log with a lighter end disc at chosen ends. */
  function log(a: number[], c: number[], r: number, color: string, endA: boolean, endB: boolean) {
    b.rod(a, c, r, color, { sides: 8 });
    const d = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const l = Math.hypot(d[0], d[1], d[2]);
    const n = d.map((v) => v / l);
    if (endB) cyl(r * 0.85, r * 0.85, 0.02, LOG_END, [c[0] + n[0] * 0.006, c[1] + n[1] * 0.006, c[2] + n[2] * 0.006], n, 8);
    if (endA) cyl(r * 0.85, r * 0.85, 0.02, LOG_END, [a[0] - n[0] * 0.006, a[1] - n[1] * 0.006, a[2] - n[2] * 0.006], n, 8);
  }

  function skull(x: number, y: number, z: number) {
    ball(0.15, BONE, [x, y, z], [1, 1.05, 1.1]);
    box(0.16, 0.09, 0.17, BONE, [x, y - 0.14, z + 0.03]);
    for (const s of [1, -1]) {
      ball(0.05, DARK, [x + s * 0.07, y - 0.01, z + 0.13], undefined, 6);
      glow(ball(0.032, EMBER, [x + s * 0.07, y - 0.01, z + 0.158], undefined, 6), 1.6);
    }
    box(0.04, 0.05, 0.03, DARK, [x, y - 0.07, z + 0.16]);
    for (let i = -1; i <= 1; i++) box(0.012, 0.04, 0.012, DARK, [x + i * 0.04, y - 0.17, z + 0.12]);
  }

  // =====================================================
  // GROUND BASE (small diorama plinth)
  // =====================================================
  b.lathe(
    [[0, 0], [4.2, 0], [4.15, 0.1], [0, 0.1]] as [number, number][],
    { at: [0, 0, 0], segments: 20, color: EARTH },
  );
  b.lathe(
    [[0, 0.08], [4.15, 0.08], [4.0, G], [0, G]] as [number, number][],
    { at: [0, 0, 0], segments: 20, color: GRASS },
  );
  // earth/grass drip trim
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    ball(0.16 + R() * 0.08, i % 2 ? "#4a7d2e" : "#6aa044", [Math.sin(a) * 4.05, G - 0.04, Math.cos(a) * 4.05], [1, 0.45, 1], 6);
  }
  // grass tufts
  for (let i = 0; i < 26; i++) {
    const a = R() * Math.PI * 2;
    const rr = 1.8 + R() * 2.1;
    const x = Math.sin(a) * rr;
    const z = Math.cos(a) * rr;
    if (z > 1.8 && Math.abs(x) < 0.9) continue;
    for (let k = -1; k <= 1; k++)
      b.spike([x + k * 0.04, G, z], [k * 0.3, 1, 0], 0.18 + R() * 0.1, 0.025, { color: i % 3 ? GREEN : MOSS, sides: 4 });
  }
  // stepping stones to the ladder
  for (let i = 0; i < 4; i++) cyl(0.26 - i * 0.02, 0.3 - i * 0.02, 0.07, STONE, [0.1 * Math.sin(i * 2), G + 0.02, 3.75 + i * 0.5], undefined, 7);

  // mushrooms
  const mush = (x: number, z: number, s: number) => {
    cyl(0.05 * s, 0.07 * s, 0.22 * s, CREAM, [x, G + 0.1 * s, z], undefined, 6);
    b.part(new THREE.SphereGeometry(0.18 * s, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), RED, { at: [x, G + 0.2 * s, z], flat: true });
    for (let k = 0; k < 4; k++) {
      const a = k * 1.7;
      ball(0.025 * s, CREAM, [x + Math.sin(a) * 0.1 * s, G + (0.3 + (k % 2) * 0.03) * s - 0.04 * s, z + Math.cos(a) * 0.1 * s], undefined, 5);
    }
  };
  mush(-2.1, 2.2, 1.1);
  mush(-2.4, 2.45, 0.7);
  mush(2.3, 1.2, 0.9);
  mush(2.6, -1.4, 1.2);

  // spruces
  const fir = (x: number, z: number, h: number) => {
    cyl(0.1, 0.14, 0.5, LOG_C, [x, G + 0.25, z], undefined, 6);
    for (let i = 0; i < 4; i++) {
      const r = (0.75 - i * 0.14) * (h / 2.6);
      b.part(new THREE.ConeGeometry(r, h * 0.34, 7), i % 2 ? "#1f5a34" : "#2a6b3c", { at: [x, G + 0.55 + i * h * 0.2 + h * 0.15, z], flat: true });
    }
  };
  fir(-3.0, -1.6, 2.8);
  fir(3.0, -2.2, 2.4);
  fir(-3.3, 0.6, 1.9);

  // =====================================================
  // CHICKEN LEGS
  // =====================================================
  for (const s of [1, -1]) {
    const x = s * 0.85;
    // hip ball and thigh
    ball(0.34, FEATHER_C, [x, FL - 0.38, 0.0], [1, 0.9, 1.05], 8);
    ball(1, FEATHER_A, [x, FL - 0.95, 0.02], [0.42, 0.62, 0.44], 10);
    const rings: [number, number, number, string, number][] = [
      [FL - 0.55, 0.4, 36, FEATHER_C, 10],
      [FL - 0.8, 0.36, 40, FEATHER_A, 10],
      [FL - 1.05, 0.3, 42, FEATHER_B, 9],
    ];
    for (const [y, rad, tilt, col, cnt] of rings)
      b.ring(frame([x, y, 0.02], [0, -1, 0]), { count: cnt, radius: rad, tilt }, (it) =>
        b.spike(it, it, 0.42, 0.095, { color: col, sides: 5 }),
      );
    // tarsus
    const path = catmull([[x, FL - 1.2, 0.0], [x, 1.55, 0.02], [x, 0.9, 0.06], [x, 0.4, 0.12], [x, G + 0.1, 0.2]]);
    b.sweep(path, [0.15, 0.11, 0.1], { color: LEG, sides: 8 });
    b.along(path, 7, (at) => {
      const t = at.t;
      const r = 0.15 - 0.05 * t;
      b.part(new THREE.CylinderGeometry(r * 1.13, r * 1.13, 0.04, 8), LEG_RING, { frame: at, flat: true });
    });
    // spur
    b.spike([x, G + 0.75, 0.0], [0, -0.55, -1], 0.34, 0.065, { color: CLAW, sides: 6 });
    // ankle & toes
    const A = [x, G + 0.1, 0.2];
    ball(0.14, LEG, A, [1, 0.9, 1], 8);
    for (const [deg, len] of [[-38, 0.85], [0, 0.98], [38, 0.85], [180, 0.52]] as [number, number][]) {
      const dx = Math.sin(deg * RAD);
      const dz = Math.cos(deg * RAD);
      const mid = [A[0] + dx * len * 0.5, G + 0.095, A[2] + dz * len * 0.5];
      const tip = [A[0] + dx * len, G + 0.065, A[2] + dz * len];
      b.sweep(catmull([A, mid, tip]), [0.1, 0.055], { color: LEG, sides: 8 });
      ball(0.085, LEG_RING, mid, undefined, 6);
      for (let k = 1; k <= 2; k++)
        cyl(0.075 - k * 0.012, 0.075 - k * 0.012, 0.03, LEG_RING, [A[0] + dx * len * (0.5 + k * 0.17), G + 0.085, A[2] + dz * len * (0.5 + k * 0.17)], [dx, 0, dz], 8);
      b.spike(tip, [dx, -0.35, dz], 0.26, 0.055, { color: CLAW, sides: 6 });
    }
  }

  // =====================================================
  // PLATFORM
  // =====================================================
  box(3.7, 0.2, 4.0, PLANK, [0, FL - 0.1, 0.1]);
  for (let i = -6; i <= 6; i++) box(0.02, 0.01, 4.0, LOG_C, [i * 0.28, FL + 0.005, 0.1]);
  for (const z of [-1.4, -0.45, 0.5, 1.45]) log([-1.95, FL - 0.34, z], [1.95, FL - 0.34, z], 0.17, LOG_C, true, true);
  // carved fascia on beams
  for (const s of [1, -1]) for (let i = 0; i < 4; i++) rosette([s * 1.99, FL - 0.34, -1.4 + i * 0.95], [s, 0, 0], 0.09, RED, GOLD, BLUE);

  // =====================================================
  // LOG WALLS
  // =====================================================
  const LOGS = [LOG_A, LOG_B, LOG_C];
  for (let i = 0; i < 8; i++) {
    const y = FL + 0.14 + i * 0.26;
    const col = LOGS[i % 3];
    for (const sz of [1, -1]) {
      const zz = sz * D;
      if (sz === 1 && i <= 5) {
        for (const sx of [1, -1]) log([sx * 0.55, y, zz], [sx * (W + 0.28), y, zz], 0.14, col, false, true);
      } else log([-(W + 0.28), y, zz], [W + 0.28, y, zz], 0.14, col, true, true);
    }
    if (i < 7) {
      const y2 = y + 0.13;
      for (const sx of [1, -1]) log([sx * W, y2, -(D + 0.28)], [sx * W, y2, D + 0.28], 0.14, LOGS[(i + 1) % 3], true, true);
    }
  }
  // top wall plates
  for (const sx of [1, -1]) log([sx * W, FL + 2.1, -D - 0.3], [sx * W, FL + 2.1, D + 0.3], 0.1, LOG_C, true, true);

  // =====================================================
  // DOOR
  // =====================================================
  const DOOR: [number, number][] = [
    [-0.45, 0], [0.45, 0], [0.45, 1.2], [0.32, 1.45], [0, 1.55], [-0.32, 1.45], [-0.45, 1.2],
  ];
  b.extrude(DOOR, { at: [0, FL, D + 0.06], x: [1, 0, 0], thickness: 0.12, color: DEEP_BLUE });
  for (const px of [-0.3, -0.15, 0, 0.15, 0.3]) box(0.012, 1.3, 0.02, "#0f2050", [px, FL + 0.7, D + 0.125]);
  for (const hy of [0.25, 0.9]) {
    box(0.88, 0.09, 0.03, RED, [0, FL + hy, D + 0.135]);
    for (let k = -3; k <= 3; k++) ball(0.02, GOLD, [k * 0.13, FL + hy, D + 0.155], undefined, 5);
  }
  rosette([0, FL + 1.28, D + 0.13], [0, 0, 1], 0.15, GOLD, RED, BLUE);
  b.part(new THREE.TorusGeometry(0.055, 0.014, 6, 10), GOLD, { at: [0.3, FL + 0.6, D + 0.16] });
  cyl(0.03, 0.03, 0.03, GOLD, [0.3, FL + 0.67, D + 0.145], [0, 0, 1], 6);
  // platbands
  const archPts = [[-0.55, FL, D + 0.2], [-0.55, FL + 1.2, D + 0.2], [-0.4, FL + 1.55, D + 0.2], [0, FL + 1.7, D + 0.2], [0.4, FL + 1.55, D + 0.2], [0.55, FL + 1.2, D + 0.2], [0.55, FL, D + 0.2]];
  b.sweep(catmull(archPts), 0.05, { color: RED, sides: 6 });
  b.sweep(catmull(archPts.map((p) => [p[0] * 1.2, p[1] + (p[1] > FL + 1 ? 0.07 : 0), p[2] - 0.03])), 0.03, { color: GOLD, sides: 6 });
  // kokoshnik crown over door
  const CROWN: [number, number][] = [
    [-0.75, 0], [0.75, 0], [0.66, 0.18], [0.42, 0.34], [0.22, 0.52], [0, 0.66], [-0.22, 0.52], [-0.42, 0.34], [-0.66, 0.18],
  ];
  b.extrude(CROWN, { at: [0, FL + 1.88, D + 0.17], x: [1, 0, 0], thickness: 0.07, color: BLUE });
  b.extrude(CROWN.map(([u, v]) => [u * 0.78, v * 0.72 + 0.05] as [number, number]), { at: [0, FL + 1.88, D + 0.21], x: [1, 0, 0], thickness: 0.05, color: RED });
  rosette([0, FL + 2.05, D + 0.25], [0, 0, 1], 0.1, GOLD, BLUE, RED);
  // threshold
  box(1.15, 0.06, 0.34, PLANK, [0, FL + 0.03, D + 0.2]);

  // front small windows
  for (const sx of [1, -1]) {
    const x = sx * 0.98;
    box(0.58, 0.68, 0.06, RED, [x, FL + 1.2, D + 0.15]);
    glow(box(0.42, 0.52, 0.05, WINDOW, [x, FL + 1.2, D + 0.18]), 1.2);
    box(0.03, 0.54, 0.03, RED, [x, FL + 1.2, D + 0.2]);
    box(0.44, 0.03, 0.03, RED, [x, FL + 1.2, D + 0.2]);
    box(0.7, 0.05, 0.14, GOLD, [x, FL + 0.82, D + 0.22]);
  }

  // =====================================================
  // SIDE WINDOWS
  // =====================================================
  for (const s of [1, -1]) {
    const x = s * (W + 0.17);
    const y = FL + 1.2;
    const z = 0.1;
    box(0.07, 0.8, 0.7, RED, [x, y, z]);
    glow(box(0.05, 0.6, 0.5, WINDOW, [x + s * 0.03, y, z]), 1.2);
    box(0.06, 0.62, 0.04, RED, [x + s * 0.04, y, z]);
    box(0.06, 0.04, 0.52, RED, [x + s * 0.04, y, z]);
    box(0.2, 0.06, 0.95, GOLD, [x + s * 0.06, y - 0.45, z]);
    b.extrude([[-0.5, 0], [0.5, 0], [0.38, 0.14], [0, 0.3], [-0.38, 0.14]] as [number, number][], {
      at: [x, y + 0.4, z], x: [0, 0, 1], thickness: 0.09, color: RED,
    });
    ball(0.045, GOLD, [x + s * 0.05, y + 0.52, z], undefined, 6);
    for (const dz of [1, -1]) {
      box(0.05, 0.78, 0.34, BLUE, [x + s * 0.045, y, z + dz * 0.54]);
      rosette([x + s * 0.075, y + 0.14, z + dz * 0.54], [s, 0, 0], 0.1, GOLD, RED, BLUE);
      for (let k = 0; k < 3; k++) ball(0.022, CREAM, [x + s * 0.075, y - 0.2 - k * 0.0, z + dz * (0.43 + k * 0.11)], undefined, 5);
    }
  }

  // =====================================================
  // ROOF
  // =====================================================
  for (const s of [1, -1]) {
    box(2.2, 0.12, 3.7, SHINGLE_A, [s * 0.875, 5.45 + 0.0, 0], [0, 0, -s * ROOF_A]);
    const cA = Math.cos(ROOF_A * RAD);
    const sA = Math.sin(ROOF_A * RAD);
    for (let k = 0; k < 8; k++) {
      const u = 0.22 + k * 0.26;
      const px = s * cA * u + s * sA * 0.09;
      const py = 6.1 - sA * u + cA * 0.09;
      b.rod([px, py, -1.86], [px, py, 1.86], 0.07, k % 2 ? SHINGLE_B : SHINGLE_A, { sides: 6 });
    }
    // moss patches
    for (let k = 0; k < 5; k++) {
      const u = 0.4 + R() * 1.7;
      const px = s * cA * u + s * sA * 0.15;
      const py = 6.1 - sA * u + cA * 0.15;
      ball(0.18 + R() * 0.12, k % 2 ? MOSS : "#6a9a3a", [px, py, -1.5 + R() * 3], [1, 0.4, 1.4], 6);
    }
  }
  // ridge
  log([0, 6.17, -1.95], [0, 6.17, 1.95], 0.15, LOG_C, true, true);

  // =====================================================
  // KONYOK horse heads on ridge
  // =====================================================
  const K = 0.85;
  const HORSE = ([
    [0, 0], [0, 0.9], [0.1, 1.15], [0.22, 0.95], [0.45, 0.9], [0.8, 0.55], [0.82, 0.4], [0.62, 0.4], [0.5, 0.5], [0.4, 0.25], [0.4, 0],
  ] as [number, number][]).map(([u, v]) => [u * K, v * K] as [number, number]);
  for (const sz of [1, -1]) {
    const zb = sz * 1.82;
    b.extrude(HORSE, { at: [0, 6.2, zb], x: [0, 0, sz], thickness: 0.15, color: "#e8d3a2" });
    for (let k = 0; k < 6; k++) ball(0.07, k % 2 ? RED : GOLD, [0, 6.2 + (0.12 + k * 0.14) * K, zb + sz * 0.0], [1.1, 1, 1], 6);
    for (const sx of [1, -1]) {
      glow(cyl(0.045, 0.045, 0.02, EMBER, [sx * 0.078, 6.2 + 0.72 * K, zb + sz * 0.5 * K], [sx, 0, 0], 8), 0.8);
      cyl(0.02, 0.02, 0.025, DARK, [sx * 0.082, 6.2 + 0.72 * K, zb + sz * 0.5 * K], [sx, 0, 0], 6);
      rosette([sx * 0.078, 6.2 + 0.28 * K, zb + sz * 0.2 * K], [sx, 0, 0], 0.09, RED, GOLD, BLUE);
      // bridle
      box(0.17, 0.05, 0.05, BLUE, [sx * 0.0, 6.2 + 0.52 * K, zb + sz * 0.7 * K], [0, 0, 0]);
      ball(0.025, DARK, [sx * 0.078, 6.2 + 0.45 * K, zb + sz * 0.72 * K], undefined, 5);
    }
    // ear tip
    b.spike([0, 6.2 + 1.0 * K, zb + sz * 0.1 * K], [0, 1, 0], 0.12, 0.05, { color: RED, sides: 4 });
  }

  // =====================================================
  // GABLES
  // =====================================================
  const GABLE: [number, number][] = [[-1.7, 4.66], [1.7, 4.66], [1.7, 4.8], [0, 6.0], [-1.7, 4.8]];
  for (const sz of [1, -1]) {
    const zf = sz * 1.62;
    b.extrude(GABLE, { at: [0, 0, zf], x: [sz, 0, 0], thickness: 0.12, color: BLUE });
    const zp = sz * 1.7;
    // sunburst
    cyl(0.22, 0.22, 0.04, GOLD, [0, 5.15, zp], [0, 0, sz], 16);
    cyl(0.1, 0.1, 0.05, RED, [0, 5.15, zp + sz * 0.01], [0, 0, sz], 10);
    b.ring(frame([0, 5.15, zp], [0, 0, sz]), { count: 12, radius: 0.24 }, (it) => b.spike(it, it, 0.26, 0.05, { color: RED, sides: 4 }));
    b.ring(frame([0, 5.15, zp], [0, 0, sz]), { count: 12, radius: 0.24, fromDeg: 15, toDeg: 345 }, (it) =>
      b.spike(it, it, 0.16, 0.035, { color: GOLD, sides: 4 }),
    );
    for (const sx of [1, -1]) rosette([sx * 0.95, 5.0, zp], [0, 0, sz], 0.13, GOLD, RED, BLUE);
    // trim band + diamonds
    box(3.4, 0.2, 0.05, DEEP_BLUE, [0, 4.77, zp + sz * 0.02]);
    for (let i = -6; i <= 6; i++) box(0.12, 0.12, 0.03, i % 2 ? RED : GOLD, [i * 0.25, 4.77, zp + sz * 0.05], [0, 0, 45]);
    // bargeboards
    for (const s of [1, -1]) {
      box(2.25, 0.2, 0.06, RED, [s * 0.9, 5.4, sz * 1.88], [0, 0, -s * ROOF_A]);
      box(2.25, 0.05, 0.07, GOLD, [s * 0.9 + s * 0.04, 5.3, sz * 1.88], [0, 0, -s * ROOF_A]);
      for (let k = 0; k < 7; k++) {
        const t = (k + 0.5) / 7.2;
        ball(0.06, k % 2 ? GOLD : BLUE, [s * 1.78 * t, 6.1 - 1.3 * t - 0.2, sz * 1.88], [1, 1.4, 1], 6);
      }
    }
  }

  // =====================================================
  // CHIMNEY & SMOKE
  // =====================================================
  box(0.4, 1.0, 0.4, BRICK, [0.7, 5.8, -0.9]);
  for (let i = 0; i < 4; i++) box(0.42, 0.03, 0.42, "#5c2e24", [0.7, 5.5 + i * 0.22, -0.9]);
  box(0.52, 0.08, 0.52, STONE, [0.7, 6.34, -0.9]);
  const sm = [[0.72, 6.65, 0.18], [0.82, 7.0, 0.24], [0.96, 7.38, 0.3], [1.14, 7.8, 0.36]];
  sm.forEach(([x, y, r], i) => ball(r, i % 2 ? SMOKE : "#e4e4ea", [x, y, -0.9], undefined, 7));

  // =====================================================
  // PORCH: SKULL STAKES, RAIL, LADDER
  // =====================================================
  for (const s of [1, -1]) {
    b.rod([s * 1.65, FL, 1.95], [s * 1.65, FL + 0.95, 1.95], 0.06, LOG_C, { sides: 6 });
    skull(s * 1.65, FL + 1.1, 1.97);
    b.rod([s * 0.55, FL + 0.65, 1.95], [s * 1.65, FL + 0.65, 1.95], 0.045, RED, { sides: 6 });
    b.rod([s * 0.55, FL + 0.3, 1.95], [s * 1.65, FL + 0.3, 1.95], 0.04, GOLD, { sides: 6 });
    b.rod([s * 0.55, FL, 1.95], [s * 0.55, FL + 0.65, 1.95], 0.045, LOG_C, { sides: 6 });
    // ladder rails
    b.rod([s * 0.42, FL + 0.15, 2.0], [s * 0.42, G + 0.02, 3.65], 0.05, LOG_B, { sides: 6 });
  }
  for (let i = 0; i < 8; i++) {
    const t = (i + 0.7) / 8.6;
    b.rod([-0.42, FL + 0.15 - (FL + 0.13 - G) * t, 2.0 + 1.65 * t], [0.42, FL + 0.15 - (FL + 0.13 - G) * t, 2.0 + 1.65 * t], 0.035, PLANK, { sides: 6 });
  }

  // lantern skull-pot hanging at front eave
  b.rod([0, 4.66, 1.72], [0, 4.36, 1.72], 0.01, DARK, { sides: 4 });
  glow(ball(0.1, EMBER, [0, 4.26, 1.72], [1, 1.2, 1], 7), 1.5);
  cyl(0.06, 0.1, 0.04, DARK, [0, 4.4, 1.72], undefined, 6);

  return b.root;
}
```