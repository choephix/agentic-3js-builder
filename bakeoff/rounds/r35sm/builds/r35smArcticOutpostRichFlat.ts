import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Arctic Research Outpost",
  description: "Firewatch-style flat-colour diorama: stilted orange cabin, radio mast, weather station, shed, snowmobile and sunset peaks on an ice slab.",
};

const SNOW = "#f6e8de", SNOW2 = "#e6cfd0", SNOW3 = "#d3b4c0", ICE = "#8fb6c4", ICE2 = "#5f8fa6";
const ORANGE = "#d9582b", ORANGE2 = "#b8441f", RED = "#a63a30", DKRED = "#6e2a2e";
const TEAL = "#1f4a54", TEAL2 = "#2f6a70", WOOD = "#5a3a2e", WOOD2 = "#7a5238";
const PURPLE = "#6b4a7a", PURPLE2 = "#8a5a86", PINK = "#c9708a", SUN = "#f6a640", SUN2 = "#ffd27a";
const DARK = "#2a1e28", WHITE = "#fff4ea", GREY = "#8a8290", YEL = "#e8b030";

export default function build() {
  const b = createBuilder({ name: "outpost" });
  const G = 0.5; // ground level

  const P = (geo: THREE.BufferGeometry, c: string, x: number, y: number, z: number, rot?: number[], extra: any = {}) =>
    b.part(geo, c, { at: [x, y, z], flat: true, ...(rot ? { rotation: rot } : {}), ...extra });
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rot?: number[]) =>
    P(new THREE.BoxGeometry(w, h, d), c, x, y, z, rot);
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, x: number, y: number, z: number, rot?: number[]) =>
    P(new THREE.CylinderGeometry(rt, rb, h, seg), c, x, y, z, rot);
  const ball = (r: number, c: string, x: number, y: number, z: number, sc?: number[]) =>
    P(new THREE.SphereGeometry(r, 8, 6), c, x, y, z, undefined, sc ? { scale: sc } : {});
  const rodP = (a: number[], d: number[], r: number, c: string) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...d);
    const m = A.clone().add(B).multiplyScalar(0.5);
    const dir = B.clone().sub(A);
    return b.part(new THREE.CylinderGeometry(r, r, dir.length(), 5), c, { at: [m.x, m.y, m.z], dir: [dir.x, dir.y, dir.z] });
  };

  // ---------- base slab ----------
  cyl(4.2, 4.0, 0.3, 14, ICE2, 0, 0.15, 0);
  cyl(4.2, 4.2, 0.08, 14, ICE, 0, 0.22, 0);
  cyl(4.05, 4.15, 0.22, 14, SNOW, 0, 0.39, 0);
  for (const [x, z, r, h] of [[1.2, 1.2, 1.1, 0.25], [-2.5, 0.5, 1.0, 0.3], [2.8, -0.6, 0.9, 0.25], [-1, -2.2, 1.2, 0.3], [0.5, 2.8, 0.9, 0.2], [3, 1.8, 0.7, 0.2]])
    ball(r, SNOW, x, G - 0.05, z, [1, h / r, 1]);
  ball(0.9, SNOW2, -0.6, G - 0.02, 3.0, [1, 0.12, 0.8]);

  // ---------- backdrop: sun and peaks ----------
  P(new THREE.CircleGeometry(0.85, 20), SUN, 0.8, 2.6, -3.7, undefined, { dir: [0, 0, 1], axis: "z" });
  P(new THREE.CircleGeometry(0.55, 20), SUN2, 0.8, 2.6, -3.68, undefined, { dir: [0, 0, 1], axis: "z" });
  const peaks: [number, number, number, number, string][] = [
    [-2.6, -2.7, 1.1, 2.6, PURPLE], [-1.2, -3.2, 1.0, 3.3, PURPLE2], [0.4, -3.0, 0.9, 2.0, PINK],
    [1.8, -3.1, 1.1, 3.0, PURPLE], [2.9, -2.2, 0.8, 1.9, PURPLE2], [-3.1, -1.2, 0.7, 1.6, PINK],
  ];
  for (const [x, z, r, h, c] of peaks) {
    P(new THREE.ConeGeometry(r, h, 5), c, x, G + h / 2 - 0.05, z);
    P(new THREE.ConeGeometry(r * 0.42, h * 0.3, 5), SNOW, x, G + h * 0.85 - 0.05, z);
  }
  // pines
  for (const [x, z, s] of [[-3.0, 1.8, 1], [-2.4, 2.6, 0.8], [3.3, 0.6, 0.9], [-3.3, -0.2, 0.7]] as number[][]) {
    cyl(0.05 * s, 0.07 * s, 0.4 * s, 5, WOOD, x, G + 0.15, z);
    for (let i = 0; i < 3; i++) {
      const r = (0.5 - i * 0.14) * s;
      P(new THREE.ConeGeometry(r, 0.6 * s, 6), TEAL, x, G + (0.5 + i * 0.35) * s, z);
      P(new THREE.ConeGeometry(r * 0.7, 0.2 * s, 6), SNOW, x, G + (0.65 + i * 0.35) * s, z);
    }
  }

  // ---------- main cabin ----------
  const W = G + 0.45, WH = 2.2, WT = W + WH;
  for (const [x, z] of [[-1.4, -1.0], [1.4, -1.0], [-1.4, 1.0], [1.4, 1.0], [0, -1], [0, 1]])
    cyl(0.07, 0.09, 0.5, 6, WOOD, x, G + 0.2, z);
  box(3.4, 0.12, 2.6, WOOD2, 0, W - 0.06, 0);
  box(3.2, WH, 2.4, ORANGE, 0, W + WH / 2, 0);
  // siding lines
  for (let i = 1; i < 7; i++) {
    const y = W + i * 0.31;
    box(3.22, 0.025, 2.42, ORANGE2, 0, y, 0);
  }
  // corner boards
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.14, WH, 0.14, DKRED, sx * 1.6, W + WH / 2, sz * 1.2);
  // gables
  for (const sz of [-1, 1]) {
    b.extrude([[-1.6, 0], [1.6, 0], [0, 0.9]], { at: [0, WT, sz * 1.15], x: [1, 0, 0], thickness: 0.12, color: ORANGE });
    b.extrude([[-1.0, 0.04], [1.0, 0.04], [0, 0.6]], { at: [0, WT, sz * 1.215], x: [1, 0, 0], thickness: 0.03, color: ORANGE2 });
  }
  // roof
  const ang = (Math.atan2(0.9, 1.6) * 180) / Math.PI;
  for (const s of [-1, 1]) {
    const nx = Math.sin((ang * Math.PI) / 180), ny = Math.cos((ang * Math.PI) / 180);
    const cx = s * 0.8, cy = WT + 0.45;
    box(1.98, 0.1, 2.9, DKRED, cx + nx * s * 0.05, cy + ny * 0.05, 0, [0, 0, -s * ang]);
    box(1.8, 0.14, 2.8, SNOW, cx + nx * s * 0.13, cy + ny * 0.13, 0, [0, 0, -s * ang]);
    box(1.8, 0.1, 0.1, SNOW2, cx + nx * s * 0.1, cy + ny * 0.1, 1.45, [0, 0, -s * ang]);
  }
  box(0.2, 0.14, 2.9, SNOW, 0, WT + 0.93, 0);
  // chimney + smoke
  box(0.45, 1.25, 0.45, DKRED, 0.7, WT + 0.82, -0.5);
  box(0.55, 0.1, 0.55, DARK, 0.7, WT + 1.48, -0.5);
  box(0.4, 0.06, 0.4, SNOW, 0.7, WT + 1.55, -0.5);
  [[0.75, 1.8, 0.2], [0.9, 2.15, 0.26], [1.15, 2.55, 0.32]].forEach(([x, y, r], i) =>
    ball(r, i % 2 ? SNOW2 : WHITE, x, WT + y - 0.1, -0.5));

  // door (front +Z)
  box(0.9, 1.6, 0.1, DARK, 0, W + 0.8, 1.2);
  box(0.76, 1.46, 0.08, TEAL2, 0, W + 0.78, 1.24);
  box(0.3, 0.5, 0.09, TEAL, 0, W + 1.1, 1.27);
  box(0.3, 0.5, 0.09, TEAL, 0, W + 0.45, 1.27);
  ball(0.045, YEL, 0.27, W + 0.8, 1.3);
  box(1.1, 0.1, 0.14, DKRED, 0, W + 1.68, 1.22);
  // steps + rail
  for (let i = 0; i < 3; i++) {
    const h = 0.15 * (3 - i);
    box(1.1, h, 0.32, WOOD2, 0, G + h / 2 - 0.02, 1.5 + i * 0.3);
    box(1.1, 0.03, 0.34, SNOW, 0, G + h, 1.5 + i * 0.3);
  }
  for (const sx of [-0.6, 0.6]) {
    box(0.06, 0.8, 0.06, WOOD, sx, G + 0.7, 1.45);
    box(0.06, 0.8, 0.06, WOOD, sx, G + 0.4, 2.2);
    rodP([sx, G + 1.05, 1.45], [sx, G + 0.78, 2.2], 0.025, WOOD);
  }
  // porch lamp
  glow(ball(0.1, SUN2, 0.75, W + 1.75, 1.3), 1.5);
  box(0.08, 0.08, 0.1, DARK, 0.75, W + 1.88, 1.25);

  const win = (x: number, y: number, z: number, axis: "z" | "x", s: number) => {
    const d = (a: number, h: number, t: number) => (axis === "z" ? [a, h, t] : [t, h, a]);
    const o = (t: number) => (axis === "z" ? [x, y, z + s * t] : [x + s * t, y, z]);
    const pos = (t: number) => o(t) as [number, number, number];
    const mk = (a: number, h: number, t: number, c: string, off: number) => {
      const [w, hh, dd] = d(a, h, t);
      return box(w, hh, dd, c, ...pos(off));
    };
    mk(0.8, 0.8, 0.08, WHITE, 0.04);
    glow(mk(0.62, 0.62, 0.06, SUN2, 0.08), 1.3);
    mk(0.05, 0.62, 0.08, WHITE, 0.1);
    mk(0.62, 0.05, 0.08, WHITE, 0.1);
    mk(0.95, 0.07, 0.14, DKRED, 0.07);
    // sill snow
    const [w2, , d2] = d(0.95, 0, 0.16);
    box(w2, 0.04, d2, SNOW, x + (axis === "x" ? s * 0.07 : 0), y - 0.44, z + (axis === "z" ? s * 0.07 : 0));
  };
  win(-1.0, W + 1.3, 1.2, "z", 1);
  win(1.0, W + 1.3, 1.2, "z", 1);
  win(0, W + 1.3, -1.2, "z", -1);
  win(1.6, W + 1.3, -0.4, "x", 1);
  win(1.6, W + 1.3, 0.5, "x", 1);
  win(-1.6, W + 1.3, -0.4, "x", -1);
  win(-1.6, W + 1.3, 0.5, "x", -1);
  // gable round vent
  glow(cyl(0.2, 0.2, 0.05, 8, SUN, 0, WT + 0.4, 1.25, [90, 0, 0]), 1.1);
  cyl(0.24, 0.24, 0.04, 8, WHITE, 0, WT + 0.4, 1.22, [90, 0, 0]);
  // firewood stack on left side
  for (let r = 0; r < 3; r++)
    for (let i = 0; i < 4 - r; i++) cyl(0.09, 0.09, 0.7, 6, r % 2 ? WOOD2 : WOOD, -1.9 - 0.0, G + 0.1 + r * 0.17, -0.5 + i * 0.19 + r * 0.1, [0, 0, 90]);
  box(0.9, 0.05, 0.9, SNOW, -1.9, G + 0.5, 0.0);

  // ---------- radio mast ----------
  const mx = -2.3, mz = -1.0;
  for (let i = 0; i < 6; i++) {
    const h = 0.7;
    cyl(0.07 - i * 0.006, 0.08 - i * 0.006, h, 6, i % 2 ? WHITE : RED, mx, G + h / 2 + i * h, mz);
  }
  cyl(0.03, 0.03, 0.5, 5, GREY, mx, G + 4.45, mz);
  glow(ball(0.08, "#ff4a3a", mx, G + 4.75, mz), 1.8);
  for (const [dx, dz] of [[1, 0.3], [-0.5, 1], [-0.3, -1]]) {
    const n = Math.hypot(dx, dz);
    rodP([mx, G + 3.4, mz], [mx + (dx / n) * 1.5, G + 0.05, mz + (dz / n) * 1.5], 0.012, DARK);
    cyl(0.05, 0.05, 0.15, 5, GREY, mx + (dx / n) * 1.5, G + 0.05, mz + (dz / n) * 1.5);
  }
  for (const s of [-1, 1]) box(0.9, 0.04, 0.04, GREY, mx, G + 3.0 + (s > 0 ? 0 : 0.35), mz, [0, s > 0 ? 0 : 90, 0]);
  box(0.4, 0.3, 0.3, TEAL, mx + 0.35, G + 0.2, mz + 0.35); // radio box
  box(0.42, 0.04, 0.32, SNOW, mx + 0.35, G + 0.37, mz + 0.35);

  // ---------- weather station ----------
  const wx = 2.3, wz = 1.1;
  cyl(0.04, 0.05, 2.0, 6, GREY, wx, G + 1.0, wz);
  cyl(0.05, 0.05, 0.1, 6, DARK, wx, G + 2.05, wz);
  for (let i = 0; i < 3; i++) {
    const a = (i * 2 * Math.PI) / 3;
    rodP([wx, G + 2.15, wz], [wx + Math.cos(a) * 0.3, G + 2.15, wz + Math.sin(a) * 0.3], 0.015, DARK);
    P(new THREE.SphereGeometry(0.075, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2 * 1.4), i === 0 ? ORANGE : WHITE, wx + Math.cos(a) * 0.3, G + 2.15, wz + Math.sin(a) * 0.3);
  }
  box(0.05, 0.12, 0.5, ORANGE, wx, G + 1.65, wz, [0, 25, 0]);
  P(new THREE.ConeGeometry(0.08, 0.2, 4), ORANGE, wx + 0.12, G + 1.65, wz + 0.2, [90, 25, 0]);
  // screen
  for (const [dx, dz] of [[-0.25, -0.2], [0.25, -0.2], [-0.25, 0.2], [0.25, 0.2]]) cyl(0.025, 0.025, 0.6, 5, WOOD, wx + 1.0 + dx * 0.5, G + 0.3, wz - 0.6 + dz * 0.5);
  box(0.6, 0.4, 0.45, WHITE, wx + 1.0, G + 0.85, wz - 0.6);
  for (let i = 0; i < 5; i++) box(0.62, 0.02, 0.47, SNOW3, wx + 1.0, G + 0.7 + i * 0.07, wz - 0.6);
  box(0.7, 0.06, 0.55, SNOW, wx + 1.0, G + 1.08, wz - 0.6);
  box(0.5, 0.04, 0.4, DKRED, wx + 1.0, G + 1.04, wz - 0.6);

  // ---------- shed with dish ----------
  const sx = 2.2, sz = -1.6;
  box(1.5, 1.3, 1.2, TEAL2, sx, G + 0.65, sz);
  for (let i = 1; i < 4; i++) box(1.52, 0.025, 1.22, TEAL, sx, G + i * 0.32, sz);
  box(1.8, 0.1, 1.5, DKRED, sx, G + 1.35, sz, [0, 0, -4]);
  box(1.7, 0.1, 1.4, SNOW, sx, G + 1.45, sz, [0, 0, -4]);
  box(0.5, 0.95, 0.06, DARK, sx - 0.3, G + 0.5, sz + 0.62);
  box(0.4, 0.85, 0.06, ORANGE, sx - 0.3, G + 0.5, sz + 0.65);
  glow(box(0.3, 0.3, 0.05, SUN2, sx + 0.4, G + 0.8, sz + 0.62), 1.2);
  box(0.4, 0.04, 0.07, WHITE, sx + 0.4, G + 0.8, sz + 0.62);
  // dish
  cyl(0.04, 0.05, 0.5, 5, GREY, sx + 0.1, G + 1.75, sz);
  P(new THREE.SphereGeometry(0.45, 10, 4, 0, Math.PI * 2, 0, 0.9), WHITE, sx + 0.1, G + 2.05, sz, [-55, -30, 0], { side: THREE.DoubleSide });
  P(new THREE.SphereGeometry(0.4, 10, 4, 0, Math.PI * 2, 0, 0.9), SNOW3, sx + 0.1, G + 2.04, sz, [-55, -30, 0]);
  rodP([sx + 0.1, G + 2.05, sz], [sx + 0.38, G + 2.5, sz + 0.28], 0.015, DARK);
  ball(0.04, RED, sx + 0.38, G + 2.5, sz + 0.28);

  // ---------- fuel barrels ----------
  [[1.9, 1.9, ORANGE], [2.35, 2.15, TEAL2], [1.7, 2.4, YEL]].forEach(([x, z, c], i) => {
    cyl(0.22, 0.22, 0.6, 9, c as string, x as number, G + 0.3, z as number);
    cyl(0.235, 0.235, 0.05, 9, DARK, x as number, G + 0.15, z as number);
    cyl(0.235, 0.235, 0.05, 9, DARK, x as number, G + 0.45, z as number);
    cyl(0.2, 0.2, 0.03, 9, SNOW, x as number, G + 0.61, z as number);
    if (i === 0) cyl(0.04, 0.04, 0.06, 5, DARK, 1.97, G + 0.65, 1.95);
  });

  // ---------- snowmobile ----------
  const ox = -1.6, oz = 2.2, ry = 28 * Math.PI / 180;
  const loc = (lx: number, ly: number, lz: number): [number, number, number] =>
    [ox + lx * Math.cos(ry) + lz * Math.sin(ry), G + ly, oz - lx * Math.sin(ry) + lz * Math.cos(ry)];
  const rot = [0, 28, 0];
  box(0.5, 0.22, 1.2, RED, ...loc(0, 0.32, -0.1), rot);
  box(0.46, 0.2, 0.5, ORANGE, ...loc(0, 0.48, 0.45), [5, 28, 0]);
  box(0.42, 0.08, 0.55, DARK, ...loc(0, 0.5, -0.3), rot);
  box(0.4, 0.28, 0.04, ICE, ...loc(0, 0.7, 0.3), [-25, 28, 0]);
  glow(box(0.3, 0.08, 0.05, SUN2, ...loc(0, 0.5, 0.72), rot), 1.4);
  cyl(0.025, 0.025, 0.55, 5, DARK, ...loc(0, 0.72, 0.1), [0, 28, 90]);
  for (const s of [-1, 1]) {
    box(0.1, 0.05, 1.3, DARK, ...loc(s * 0.28, 0.1, 0.45), rot);
    box(0.14, 0.14, 0.9, DARK, ...loc(s * 0.0 + s * 0.0, 0.1, -0.3), rot);
    box(0.1, 0.06, 0.28, DARK, ...loc(s * 0.28, 0.14, 1.05), [-25, 28, 0]);
  }
  box(0.5, 0.14, 0.95, DARK, ...loc(0, 0.12, -0.45), rot);
  box(0.46, 0.04, 0.3, SNOW, ...loc(0, 0.58, 0.2), rot);

  // ---------- sled with crates ----------
  const sdx = 0.5, sdz = 3.0;
  for (const s of [-1, 1]) {
    box(0.06, 0.06, 1.2, WOOD, sdx + s * 0.28, G + 0.05, sdz);
    box(0.06, 0.06, 0.2, WOOD, sdx + s * 0.28, G + 0.1, sdz + 0.62, [-30, 0, 0]);
  }
  box(0.66, 0.05, 1.1, WOOD2, sdx, G + 0.12, sdz);
  box(0.5, 0.35, 0.45, ORANGE2, sdx, G + 0.32, sdz - 0.2);
  box(0.52, 0.04, 0.47, SNOW, sdx, G + 0.51, sdz - 0.2);
  box(0.4, 0.25, 0.4, TEAL2, sdx, G + 0.27, sdz + 0.3, [0, 15, 0]);
  rodP([sdx - 0.3, G + 0.4, sdz - 0.5], [sdx + 0.3, G + 0.4, sdz + 0.5], 0.015, DARK);

  // ---------- flag ----------
  cyl(0.03, 0.04, 2.3, 5, WHITE, 1.9, G + 1.15, 1.6);
  ball(0.05, YEL, 1.9, G + 2.32, 1.6);
  box(0.02, 0.4, 0.65, RED, 1.9, G + 2.0, 1.95);
  box(0.025, 0.1, 0.65, WHITE, 1.9, G + 2.0, 1.95);
  box(0.025, 0.4, 0.1, WHITE, 1.9, G + 2.0, 1.8);

  // ---------- ice chunks & snow bits ----------
  for (const [x, z, s, c] of [[-3.0, 3.0 - 1.2, 0.35, ICE], [3.2, -2.2 + 0.2, 0.3, ICE2], [0.9, -2.2, 0.28, ICE], [-0.6, -2.0, 0.2, ICE2]] as any[])
    P(new THREE.IcosahedronGeometry(s, 0), c, x, G + s * 0.5, z, [10, x * 20, 15]);
  // footprint path to door
  for (let i = 0; i < 6; i++) box(0.14, 0.012, 0.28, SNOW3, (i % 2 ? 0.2 : -0.2) + 0.08 * Math.sin(i), G + 0.0, 3.6 - i * 0.2 + 0.0 * i);

  return b.root;
}
