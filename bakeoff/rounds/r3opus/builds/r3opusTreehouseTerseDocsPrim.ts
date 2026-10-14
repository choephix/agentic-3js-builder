import * as THREE from "three";
import { createBuilder, rng, catmull, bezier, grain, scales, mottle, paint, svg } from "../../../../src/index";

export const meta = {
  name: "Treehouse",
  description:
    "A storybook treehouse on a grassy diorama: a plank cabin built around an oak trunk, with a shingled roof, glowing windows, porch railing, ladder, swing, pulley bucket, bunting and a faceted canopy.",
};

export default function build() {
  const b = createBuilder({ name: "treehouse", paintSize: 2048 });
  const rand = rng(11);
  const r = () => rand();
  b.joint("root", { at: [0, 0, 0] });

  // ---------- palette ----------
  const DARKWOOD = "#5a3a20";
  const RAILWOOD = "#8b5a30";
  const TRIM = "#f1e6cf";
  const TEAL = "#3f8f8a";
  const BRASS = "#d9a93a";
  const ROOFDARK = "#7f2d22";
  const METAL = "#6f7a82";
  const GLOW = "#ffd36b";
  const LEAF = ["#4e9a3a", "#3f8a36", "#5fae43"];
  const LEAF_HI = "#7cc552";
  const ROPE = "#c9b07a";
  const plankTones = ["#b07a45", "#a06c3b", "#c08a52"];

  const G = 0.16; // ground top
  const P = 3.0; // platform top
  const W = 2.2, D = 1.8, H = 1.6, CZ = 0.15;
  const FZ = CZ + D / 2; // front wall face
  const ridgeY = P + H + 0.95;

  const box = (w: number, h: number, d: number, color: any, at: number[], rotation?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, rotation ? { at, rotation } : { at });

  // ---------- paints & textures ----------
  const bark = grain("#6b4428", "#4a2d18", { size: 0.08, axis: "y" });
  const grass = mottle("#6fae4a", "#5a9a3c", { size: 0.5 });
  const groundPaint = paint((p, n) => (n.y > 0.5 ? grass : p.y > 0.12 ? "#5a9a3c" : "#7a5233"));
  const wallTones = ["#c9925a", "#b98049", "#d39f66"].map((c) => grain(c, "#9a6536", { size: 0.05, axis: "y" }));
  const wallPaint = paint((p, n) => {
    const u = Math.abs(n.z) > 0.5 ? p.x : p.z;
    const q = u / 0.19 + 50;
    const k = Math.floor(q);
    if (q - k < 0.07) return "#6b4426";
    return wallTones[k % 3];
  });
  const roofPaint = scales("#c4563f", ROOFDARK, { size: 0.16 });

  const winTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" fill="#6b4426"/>
      <rect x="6" y="6" width="52" height="52" fill="#ffcf6b"/>
      <rect x="10" y="10" width="8" height="18" fill="#fff1c2"/>
      <path d="M6 6 L22 6 Q14 28 6 46 Z" fill="#d0574a"/>
      <path d="M58 6 L42 6 Q50 28 58 46 Z" fill="#d0574a"/>
      <rect x="30" y="6" width="4" height="52" fill="#6b4426"/>
      <rect x="6" y="30" width="52" height="4" fill="#6b4426"/>
    </svg>`,
    { size: 128 },
  );
  const roundTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="32" fill="#ffc95e"/>
      <circle cx="22" cy="22" r="9" fill="#fff1c2"/>
      <rect x="29" y="0" width="6" height="64" fill="#6b4426"/>
      <rect x="0" y="29" width="64" height="6" fill="#6b4426"/>
    </svg>`,
    { size: 128 },
  );
  const signTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 56">
      <rect width="160" height="56" rx="6" fill="#7a4a28"/>
      <rect x="5" y="5" width="150" height="46" rx="4" fill="none" stroke="#ffe9a8" stroke-width="3"/>
      <text x="80" y="38" font-size="28" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="#ffe9a8">TREE CLUB</text>
    </svg>`,
    { size: 320 },
  );
  const grassTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path d="M3 32 L8 7 L11 32 Z M12 32 L16 2 L20 32 Z M21 32 L26 9 L29 32 Z" fill="#4f8f34"/>
      <path d="M14 32 L16 11 L18 32 Z M6 32 L8 16 L9 32 Z" fill="#86c955"/>
    </svg>`,
    { size: 64 },
  );

  // ---------- ground diorama ----------
  const ground = b.part(new THREE.CylinderGeometry(3.2, 3.0, 0.16, 18), groundPaint, { at: [0, 0.08, 0] });

  // ---------- tree ----------
  const trunk = b.sweep(
    catmull([
      [0, 0.12, 0],
      [0, 1.5, 0.05],
      [0.05, 3.2, -0.1],
      [0, 4.8, -0.3],
      [0, 6.0, -0.5],
      [0, 6.8, -0.6],
    ]),
    [0.62, 0.5, 0.42, 0.38, 0.32, 0.24],
    { color: bark, sides: 10, caps: { start: "flat", end: "round" } },
  );
  for (let i = 0; i < 6; i++) {
    const a = ((i * 60 + 15 + (r() - 0.5) * 20) * Math.PI) / 180;
    const c = Math.cos(a), s = Math.sin(a);
    const reach = 1.1 + r() * 0.3;
    b.sweep(
      bezier([c * 0.3, 0.9, s * 0.3], [c * 0.7, 0.35, s * 0.7], [c * reach, G + 0.04, s * reach]),
      [0.24, 0.05],
      { color: bark, sides: 7, caps: { start: "flat", end: "point" } },
    );
  }
  const branchL = bezier([0.3, 2.2, -0.2], [1.3, 2.4, -1.0], [2.2, 3.2, -1.6], [2.5, 4.3, -1.6]);
  b.sweep(branchL, [0.2, 0.08], { color: bark, sides: 7 });
  const branchR = bezier([-0.3, 2.2, 0.2], [-1.3, 2.3, 0.6], [-2.1, 2.55, 0.9], [-2.8, 2.95, 1.0]);
  b.sweep(branchR, [0.2, 0.07], { color: bark, sides: 7 });

  // canopy
  const clumps: [number[], number, string][] = [
    [[0, 7.0, -0.6], 1.5, LEAF[0]],
    [[1.3, 6.4, -0.3], 1.1, LEAF[1]],
    [[-1.3, 6.5, -0.4], 1.15, LEAF[1]],
    [[0.2, 6.3, -1.6], 1.1, LEAF[2]],
    [[0.5, 7.9, -0.7], 0.9, LEAF[2]],
    [[-0.8, 7.6, -1.0], 0.9, LEAF[0]],
    [[1.0, 7.2, 0.4], 0.8, LEAF[0]],
    [[2.6, 4.7, -1.6], 0.9, LEAF[1]],
    [[-2.9, 3.35, 1.0], 0.7, LEAF[2]],
  ];
  for (const [c, rad, col] of clumps) {
    b.part(new THREE.IcosahedronGeometry(rad, 1), col, { at: c, flat: true, scale: [1, 0.82, 1] });
    for (let k = 0; k < 2; k++) {
      const hr = rad * (0.45 + r() * 0.15);
      b.part(new THREE.IcosahedronGeometry(hr, 1), LEAF_HI, {
        at: [c[0] + (r() - 0.5) * rad * 0.9, c[1] + rad * 0.4, c[2] + rad * (0.2 + r() * 0.25)],
        flat: true,
        scale: [1, 0.8, 1],
      });
    }
    for (let k = 0; k < 3; k++) {
      const az = (r() - 0.5) * 2.4;
      const el = (r() - 0.3) * 1.0;
      const d = [Math.sin(az) * Math.cos(el), Math.sin(el) * 0.82, Math.cos(az) * Math.cos(el)];
      b.part(new THREE.SphereGeometry(0.08, 6, 4), "#d8382e", {
        at: [c[0] + d[0] * rad * 0.97, c[1] + d[1] * rad * 0.97, c[2] + d[2] * rad * 0.97],
      });
    }
  }

  // ---------- platform ----------
  for (let i = 0; i < 13; i++) {
    const z = -1.2 + 0.11 + i * 0.24;
    box(3.6 + (r() - 0.5) * 0.14, 0.1, 0.22, plankTones[i % 3], [(r() - 0.5) * 0.06, P - 0.05, z]);
  }
  for (const x of [-1.5, 0, 1.5]) box(0.14, 0.14, 3.2, DARKWOOD, [x, P - 0.17, 0.36]);
  box(3.6, 0.14, 0.14, DARKWOOD, [0, P - 0.17, 1.82]);
  for (const s of [1, -1]) {
    box(0.16, P - 0.1 - G, 0.16, DARKWOOD, [s * 1.6, (G + P - 0.1) / 2, 1.8]);
    b.rod([s * 0.35, 1.7, -0.2], [s * 1.5, P - 0.22, -1.0], 0.06, { color: DARKWOOD, sides: 6 });
  }
  b.rod([0, 1.8, 0.45], [0, P - 0.22, 1.75], 0.06, { color: DARKWOOD, sides: 6 });

  // ---------- cabin ----------
  box(W, H, D, wallPaint, [0, P + H / 2, CZ]);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(0.1, H, 0.1, DARKWOOD, [sx * (W / 2), P + H / 2, CZ + sz * (D / 2)]);
  for (const z of [FZ - 0.03, CZ - D / 2 + 0.03])
    b.extrude(
      [
        [-1.1, 0],
        [1.1, 0],
        [0, 0.95],
      ],
      { at: [0, P + H, z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.06, color: wallPaint },
    );

  // roof
  const a = Math.atan2(0.95, 1.1);
  const aDeg = (a * 180) / Math.PI;
  const L = 1.4 / Math.cos(a);
  const eaveY = ridgeY - Math.tan(a) * 1.4;
  for (const s of [1, -1]) {
    const mx = s * 0.7;
    const my = ridgeY - Math.tan(a) * 0.7;
    box(L + 0.04, 0.08, 2.3, roofPaint, [mx + s * Math.sin(a) * 0.04, my + Math.cos(a) * 0.04, CZ], [0, 0, -s * aDeg]);
    for (const zf of [CZ + 1.16, CZ - 1.16])
      b.rod([s * 1.42, eaveY + 0.03, zf], [0, ridgeY + 0.1, zf], 0.045, { color: TRIM, sides: 6 });
  }
  b.capsule([0, ridgeY + 0.07, CZ - 1.15], [0, ridgeY + 0.07, CZ + 1.15], 0.07, { color: ROOFDARK, sides: 6 });

  // stovepipe
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.6, 8), METAL, { at: [-0.6, 5.25, -0.2] });
  b.part(new THREE.ConeGeometry(0.14, 0.12, 8), "#4b545a", { at: [-0.6, 5.6, -0.2] });

  // flag
  b.rod([0, ridgeY + 0.05, 1.22], [0, ridgeY + 0.75, 1.22], 0.02, { color: DARKWOOD, sides: 5 });
  b.extrude(
    [
      [0, 0],
      [0.5, 0],
      [0.38, 0.1],
      [0.5, 0.2],
      [0, 0.2],
    ],
    { at: [0, ridgeY + 0.5, 1.22], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.015, color: "#f2c230" },
  );

  // door
  box(0.6, 1.15, 0.05, TEAL, [0.4, P + 0.575, FZ + 0.02]);
  for (const dx of [-0.34, 0.34]) box(0.08, 1.25, 0.07, TRIM, [0.4 + dx, P + 0.625, FZ + 0.03]);
  box(0.76, 0.08, 0.07, TRIM, [0.4, P + 1.23, FZ + 0.03]);
  for (const hy of [0.25, 0.9]) box(0.16, 0.04, 0.02, DARKWOOD, [0.62, P + hy, FZ + 0.05]);
  b.part(new THREE.SphereGeometry(0.035, 6, 4), BRASS, { at: [0.2, P + 0.55, FZ + 0.07] });
  b.part(new THREE.CircleGeometry(0.09, 10), "#ffffff", {
    at: [0.4, P + 0.85, FZ + 0.048],
    dir: [0, 0, 1],
    axis: "z",
    texture: roundTex,
  });

  // front window with shutters and flower box
  const wx = -0.5, wy = P + 0.95;
  b.part(new THREE.PlaneGeometry(0.55, 0.55), "#ffffff", { at: [wx, wy, FZ + 0.01], dir: [0, 0, 1], axis: "z", texture: winTex });
  for (const s of [1, -1]) box(0.2, 0.6, 0.04, TEAL, [wx + s * 0.39, wy, FZ + 0.03]);
  box(0.62, 0.05, 0.05, TRIM, [wx, wy + 0.3, FZ + 0.03]);
  box(0.7, 0.05, 0.12, TRIM, [wx, wy - 0.31, FZ + 0.06]);
  box(0.6, 0.14, 0.14, "#8a5a32", [wx, wy - 0.41, FZ + 0.08]);
  const flowerCols = ["#ff7aa8", "#ffd94a", "#ffffff", "#ff7aa8", "#ffd94a"];
  for (let i = 0; i < 5; i++) {
    const fx = wx - 0.24 + i * 0.12;
    b.part(new THREE.IcosahedronGeometry(0.05, 0), "#3f8a36", { at: [fx, wy - 0.31, FZ + 0.1], flat: true });
    b.part(new THREE.IcosahedronGeometry(0.035, 0), flowerCols[i], { at: [fx + 0.02, wy - 0.26, FZ + 0.12], flat: true });
  }

  // side round windows + attic window
  for (const s of [1, -1]) {
    const at = [s * (W / 2 + 0.012), P + 1.0, CZ + 0.1];
    b.part(new THREE.CircleGeometry(0.25, 12), "#ffffff", { at, dir: [s, 0, 0], axis: "z", texture: roundTex });
    b.part(new THREE.TorusGeometry(0.26, 0.035, 5, 12), TRIM, { at, dir: [s, 0, 0], axis: "z" });
  }
  const atticAt = [0, P + H + 0.35, FZ + 0.012];
  b.part(new THREE.CircleGeometry(0.17, 12), "#ffffff", { at: atticAt, dir: [0, 0, 1], axis: "z", texture: roundTex });
  b.part(new THREE.TorusGeometry(0.18, 0.03, 5, 12), TRIM, { at: atticAt, dir: [0, 0, 1], axis: "z" });

  // ---------- railing ----------
  const rail = (p0: [number, number], p1: [number, number]) => {
    const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
    b.frustumBox([p0[0], P + 0.68, p0[1]], [p1[0], P + 0.68, p1[1]], [0.08, 0.06], [0.08, 0.06], { color: RAILWOOD });
    b.frustumBox([p0[0], P + 0.36, p0[1]], [p1[0], P + 0.36, p1[1]], [0.05, 0.04], [0.05, 0.04], { color: RAILWOOD });
    const n = Math.max(1, Math.round(len / 0.26));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const end = i === 0 || i === n;
      const th = end ? 0.09 : 0.045;
      box(th, 0.68, th, end ? DARKWOOD : RAILWOOD, [
        p0[0] + (p1[0] - p0[0]) * t,
        P + 0.34,
        p0[1] + (p1[1] - p0[1]) * t,
      ]);
    }
  };
  rail([-1.75, 1.86], [-1.45, 1.86]);
  rail([-0.95, 1.86], [1.75, 1.86]);
  rail([1.75, 1.86], [1.75, -1.12]);
  rail([-1.75, 1.86], [-1.75, -1.12]);
  rail([-1.75, -1.12], [1.75, -1.12]);

  // sign on the railing
  box(0.72, 0.26, 0.03, DARKWOOD, [0.9, P + 0.5, 1.94]);
  b.part(new THREE.PlaneGeometry(0.7, 0.245), "#ffffff", { at: [0.9, P + 0.5, 1.958], dir: [0, 0, 1], axis: "z", texture: signTex });

  // ---------- ladder ----------
  const lb = (x: number) => [x, G, 2.6];
  const lt = (x: number) => [x, P + 0.45, 1.95];
  for (const x of [-1.42, -0.98]) b.rod(lb(x), lt(x), 0.04, { color: DARKWOOD, sides: 6 });
  for (let i = 1; i <= 9; i++) {
    const t = i / 10.5;
    const pa = lb(-1.42).map((v, k) => v + (lt(-1.42)[k] - v) * t);
    const pb = lb(-0.98).map((v, k) => v + (lt(-0.98)[k] - v) * t);
    b.rod(pa, pb, 0.028, { color: RAILWOOD, sides: 5 });
  }

  // ---------- swing ----------
  const ra = branchR.at(0.72), rb = branchR.at(0.9);
  const sz = (ra.z + rb.z) / 2;
  for (const q of [ra, rb]) b.rod([q.x, q.y - 0.04, q.z], [q.x, 0.62, sz], 0.015, { color: ROPE, sides: 4 });
  box(Math.abs(ra.x - rb.x) + 0.18, 0.05, 0.22, "#c4563f", [(ra.x + rb.x) / 2, 0.6, sz]);

  // ---------- pulley & bucket ----------
  box(0.1, 1.6, 0.1, DARKWOOD, [1.7, P + 0.8, 0.3]);
  box(0.7, 0.08, 0.08, DARKWOOD, [2.0, P + 1.56, 0.3]);
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 8), METAL, { at: [2.3, P + 1.47, 0.3], rotation: [90, 0, 0] });
  b.rod([2.3, P + 1.42, 0.3], [2.3, 1.33, 0.3], 0.012, { color: ROPE, sides: 4 });
  b.part(new THREE.CylinderGeometry(0.15, 0.12, 0.24, 10), "#8a9aa6", { at: [2.3, 1.08, 0.3], flat: true });
  b.part(new THREE.TorusGeometry(0.152, 0.015, 4, 10), "#4b545a", { at: [2.3, 1.16, 0.3], rotation: [90, 0, 0] });
  b.part(new THREE.TorusGeometry(0.14, 0.012, 4, 10, Math.PI), "#4b545a", { at: [2.3, 1.19, 0.3] });

  // ---------- lantern ----------
  b.rod([1.25, 4.42, 1.25], [1.25, 4.18, 1.25], 0.01, { color: "#333333", sides: 4 });
  b.part(new THREE.ConeGeometry(0.1, 0.08, 6), "#333333", { at: [1.25, 4.14, 1.25], flat: true });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.16, 6), GLOW, { at: [1.25, 4.02, 1.25], flat: true });
  b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 6), "#333333", { at: [1.25, 3.93, 1.25], flat: true });

  // ---------- bunting across the porch ----------
  const bunt = bezier([1.4, 4.3, 1.32], [0, 3.7, 1.42], [-1.4, 4.3, 1.32]);
  b.sweep(bunt, 0.008, { color: "#333333", sides: 4 });
  const flagCols = ["#f2c230", TEAL, "#d0574a", TRIM];
  for (let i = 1; i <= 9; i++) {
    const q = bunt.at(i / 10);
    b.extrude(
      [
        [-0.07, 0],
        [0.07, 0],
        [0, -0.15],
      ],
      { at: [q.x, q.y, q.z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.01, color: flagCols[i % 4] },
    );
  }

  // ---------- birdhouse on the trunk ----------
  const hit = b.surface(trunk).ray([0.1, 1.45, 3], [0, 0, -1]);
  const bz = hit ? hit.at.z + 0.12 : 0.65;
  box(0.26, 0.3, 0.24, "#e9d9b4", [0.1, 1.45, bz]);
  b.part(new THREE.ConeGeometry(0.24, 0.16, 4), "#c4563f", { at: [0.1, 1.68, bz], rotation: [0, 45, 0], flat: true });
  b.part(new THREE.CircleGeometry(0.05, 8), "#2a1a10", { at: [0.1, 1.5, bz + 0.122], dir: [0, 0, 1], axis: "z" });
  b.rod([0.1, 1.38, bz + 0.1], [0.1, 1.38, bz + 0.2], 0.012, { color: DARKWOOD, sides: 4 });

  // ---------- mushrooms ----------
  const shrooms = [
    [0.9, 1.0, 1.0],
    [-1.0, 0.6, 0.8],
    [1.35, -0.4, 1.2],
    [-0.5, -1.4, 0.9],
  ];
  for (const [mx, mz, ms] of shrooms) {
    b.part(new THREE.CylinderGeometry(0.035 * ms, 0.045 * ms, 0.12 * ms, 6), "#f4ead2", { at: [mx, G + 0.06 * ms, mz] });
    b.part(new THREE.SphereGeometry(0.11 * ms, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), "#d8382e", {
      at: [mx, G + 0.1 * ms, mz],
      flat: true,
    });
    for (let k = 0; k < 4; k++) {
      const az = k * 1.57 + r();
      b.part(new THREE.SphereGeometry(0.018 * ms, 5, 3), "#ffffff", {
        at: [mx + Math.sin(az) * 0.07 * ms, G + 0.1 * ms + 0.08 * ms, mz + Math.cos(az) * 0.07 * ms],
      });
    }
  }

  // ---------- stepping stones ----------
  const stones = [
    [-1.2, 2.85],
    [-0.75, 2.95],
    [-1.75, 2.45],
    [2.2, 1.6],
    [1.9, 2.2],
  ];
  stones.forEach(([sx, sz2], i) =>
    b.part(new THREE.CylinderGeometry(0.16, 0.18, 0.05, 6), i % 2 ? "#9aa1a6" : "#b7bcbf", {
      at: [sx, G + 0.005, sz2],
      rotation: [0, r() * 60, 0],
      flat: true,
    }),
  );

  // ---------- grass tufts & meadow flowers ----------
  const hits = b
    .surface(ground)
    .scatter(160, {
      rng: rng(5),
      minDist: 0.22,
      filter: (h) => h.n.y > 0.9 && Math.hypot(h.at.x, h.at.z) > 1.0,
    });
  b.cards(hits, grassTex, { size: [0.22, 0.2], lean: 8, cross: true, vary: 0.35, spin: 40, rng: rng(6) });
  const meadow = ["#ffffff", "#ffd94a", "#ff9ec4"];
  hits.slice(0, 24).forEach((h, i) =>
    b.part(new THREE.IcosahedronGeometry(0.035, 0), meadow[i % 3], {
      at: [h.at.x + 0.08, h.at.y + 0.12, h.at.z + 0.05],
      flat: true,
    }),
  );

  return b.root;
}
