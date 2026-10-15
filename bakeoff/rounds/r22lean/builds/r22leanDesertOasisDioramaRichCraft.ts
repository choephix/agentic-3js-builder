import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { mix, mottle, noise, paint, stripes } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Desert Oasis Diorama",
  description:
    "A round sand base with a teal pond, four crooked palms, a striped tent, a canopy pavilion, a campfire, jars, cacti, a mesa and three whimsical camels, in chunky low-poly shapes.",
  style: "low-poly whimsical mix",
  commit: "88fc1f0",
};

const GY = 0.14; // sand top height

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "desertOasisDiorama" });
  const rand = rng(11);

  const part = (g: THREE.BufferGeometry, c: string | ReturnType<typeof paint>, at: number[], o: PartOptions = {}) =>
    b.part(g, c, { at, ...o });
  const ball = (r: number, c: string, at: number[], sc: number[] = [1, 1, 1], seg = 6) =>
    part(new THREE.SphereGeometry(r, seg, Math.max(3, seg - 2)), c, at, { scale: sc });
  const box = (w: number, h: number, d: number, c: string | ReturnType<typeof paint>, at: number[], rotY = 0) =>
    part(new THREE.BoxGeometry(w, h, d), c, at, { rotation: [0, rotY, 0] });
  const rot = (lx: number, lz: number, yaw: number): [number, number] => [
    lx * Math.cos(yaw) + lz * Math.sin(yaw),
    -lx * Math.sin(yaw) + lz * Math.cos(yaw),
  ];

  // ---------- palette ----------
  const SAND = "#f0c776";
  const SAND2 = "#e3a95a";
  const SANDSIDE = "#c98b4f";
  const RED = "#d9503a";
  const CREAM = "#fff0cf";
  const TEAL = "#2fb8b4";
  const GOLD = "#f2b632";
  const WOOD = "#7a4a28";
  const DARK = "#3a2418";

  // ---------- base ----------
  const sandPaint = paint((p, n) => {
    if (n.y < 0.5) return mix(SANDSIDE, "#a96d3a", noise(p, 0.12, 4));
    const ripple = 0.5 + 0.5 * Math.sin(p.x * 26 + Math.sin(p.z * 6) * 2.5);
    return mix(SAND, SAND2, ripple * 0.5 + noise(p, 0.3, 2) * 0.4);
  });
  b.lathe(
    [
      [0, 0],
      [1.16, 0],
      [1.24, 0.06],
      [1.21, GY],
      [0, GY],
    ],
    { at: [0, 0, 0], segments: 24, color: sandPaint },
  );
  // dunes
  const dunes: Array<[number, number, number, number, number, number]> = [
    [0.7, 0.55, 0.28, 0.07, 0.25, 0.4],
    [-0.15, -0.95, 0.4, 0.08, 0.18, 0],
    [-0.88, 0.4, 0.18, 0.07, 0.25, 0.3],
    [0.1, 0.98, 0.35, 0.05, 0.12, 0],
  ];
  for (const [x, z, sx, sy, sz, ry] of dunes)
    part(new THREE.SphereGeometry(1, 10, 5), sandPaint, [x, GY, z], {
      scale: [sx, sy, sz],
      rotation: [0, ry * 57, 0],
    });

  // ---------- pond ----------
  const PX = 0;
  const PZ = 0.05;
  const rp = (a: number) => 0.4 + 0.05 * Math.sin(3 * a + 1) + 0.03 * Math.cos(2 * a);
  const blob = (grow: number): Array<[number, number]> =>
    Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return [Math.cos(a) * (rp(a) + grow), Math.sin(a) * (rp(a) + grow)];
    });
  b.extrude(blob(0.06), { at: [PX, GY, PZ], x: [1, 0, 0], y: [0, 0, -1], thickness: 0.014, smoothing: 1, color: "#b98446" });
  b.extrude(blob(0), {
    at: [PX, GY, PZ],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.03,
    smoothing: 1,
    color: mottle("#43c6c8", "#2a96bd", { size: 0.14, seed: 3 }),
  });
  for (const [rx, rz, r] of [
    [0.0, 0.0, 0.07],
    [0.1, 0.18, 0.045],
    [-0.14, -0.14, 0.05],
  ] as const)
    part(new THREE.TorusGeometry(r, 0.0035, 3, 10), "#c8f4f0", [PX + rx, GY + 0.017, PZ + rz], { rotation: [90, 0, 0] });
  // pebbles around the rim
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + 0.1;
    const r = rp(a) + 0.075 + rand() * 0.02;
    ball(0.022 + rand() * 0.018, i % 3 ? "#b8a58a" : "#8f8070", [PX + Math.cos(a) * r, GY + 0.008, PZ - Math.sin(a) * r], [1.2, 0.7, 1]);
  }
  // lily pads and lotus
  for (const [lx, lz, s] of [
    [-0.1, 0.16, 1],
    [0.18, -0.06, 0.8],
    [0.2, 0.2, 0.7],
  ] as const) {
    part(new THREE.CylinderGeometry(0.05 * s, 0.05 * s, 0.004, 7), "#3f9d45", [PX + lx, GY + 0.017, PZ + lz]);
    part(new THREE.CylinderGeometry(0.01 * s, 0.01 * s, 0.006, 5), "#77c85a", [PX + lx + 0.01, GY + 0.02, PZ + lz]);
  }
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2;
    b.spike([PX - 0.1 + Math.cos(a) * 0.012, GY + 0.02, PZ + 0.16 + Math.sin(a) * 0.012], [Math.cos(a) * 0.5, 1, Math.sin(a) * 0.5], 0.04, 0.012, {
      color: "#ff9fc4",
      sides: 5,
    });
  }
  // duck
  ball(0.04, "#fff6dc", [PX + 0.12, GY + 0.04, PZ + 0.02], [1.3, 0.9, 1]);
  ball(0.027, "#fff6dc", [PX + 0.15, GY + 0.075, PZ + 0.02]);
  b.spike([PX + 0.17, GY + 0.072, PZ + 0.02], [1, -0.1, 0], 0.025, 0.012, { color: "#ffa21f", sides: 5 });
  ball(0.005, DARK, [PX + 0.165, GY + 0.083, PZ + 0.035], [1, 1, 1], 4);
  ball(0.005, DARK, [PX + 0.165, GY + 0.083, PZ + 0.005], [1, 1, 1], 4);
  b.spike([PX + 0.08, GY + 0.05, PZ + 0.02], [-1, 0.5, 0], 0.035, 0.015, { color: "#f1e2b8", sides: 5 });

  // reeds
  const reed = svg(
    `<svg viewBox="0 0 32 64"><path d="M6 64 Q4 30 10 4 Q13 34 11 64Z" fill="#4f9d3a"/><path d="M13 64 Q13 28 17 0 Q21 30 19 64Z" fill="#6bb745"/><path d="M21 64 Q24 32 29 8 Q28 36 27 64Z" fill="#3f8a34"/><ellipse cx="17" cy="9" rx="3" ry="8" fill="#7a4a28"/></svg>`,
    { size: 128 },
  );
  const reedFrames = [];
  for (let i = 0; i < 12; i++) {
    const a = 0.3 + i * 0.5 + rand() * 0.2;
    if (a > 5.2 && a < 6.6) continue;
    const r = rp(a) + 0.09 + rand() * 0.04;
    reedFrames.push(frame([PX + Math.cos(a) * r, GY, PZ - Math.sin(a) * r], [0, 1, 0]));
  }
  b.cards(reedFrames, reed, { size: [0.1, 0.2], vary: 0.3, cross: true, rng: rng(3), spin: 180 });

  // ---------- palms ----------
  const leafOutline = (len: number, w: number, n: number): Array<[number, number]> => {
    const top: Array<[number, number]> = [];
    const bot: Array<[number, number]> = [];
    for (let i = 0; i < n; i++) {
      const u = (len * i) / n;
      const env = Math.sin(Math.PI * (0.08 + 0.85 * (i / n)));
      const wd = w * env * (i % 2 ? 1 : 0.5) + 0.003;
      top.push([u, wd]);
      bot.unshift([u, -wd]);
    }
    return [...top, [len, 0], ...bot];
  };
  const palm = (x: number, z: number, h: number, lx: number, lz: number, seed: number) => {
    const pts = [0, 1, 2, 3].map((i) => {
      const t = i / 3;
      return [x + lx * t * t, GY - 0.01 + h * t, z + lz * t * t];
    });
    const ringPaint = paint((p) => (Math.floor(p.y / 0.035) % 2 ? "#8a5a34" : "#b07a48"));
    b.sweep(catmull(pts), [0.06, 0.032], { color: ringPaint, sides: 6, caps: "flat" });
    ball(0.075, "#9a6a3c", [x, GY + 0.005, z], [1, 0.5, 1]);
    const top = pts[3];
    ball(0.05, "#4a7a2e", [top[0], top[1] + 0.01, top[2]]);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + seed;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const d1 = new THREE.Vector3(ca * 0.9, 0.4, sa * 0.9).normalize();
      const d2 = new THREE.Vector3(ca, -0.6, sa).normalize();
      const yv = [-sa, 0, ca];
      const l1 = 0.28;
      const start = [top[0], top[1] + 0.02, top[2]];
      const mid = [start[0] + d1.x * l1, start[1] + d1.y * l1, start[2] + d1.z * l1];
      const green = k % 2 ? "#3f9a3c" : "#58b447";
      b.extrude(leafOutline(l1, 0.07, 6), { at: start, x: [d1.x, d1.y, d1.z], y: yv, thickness: 0.008, color: green });
      b.extrude(leafOutline(0.3, 0.06, 6), { at: mid, x: [d2.x, d2.y, d2.z], y: yv, thickness: 0.008, color: "#2f8a3a" });
    }
    for (let k = 0; k < 3; k++) {
      const a = seed * 2 + k * 2.1;
      ball(0.03, "#6b4a2b", [top[0] + Math.cos(a) * 0.045, top[1] - 0.035, top[2] + Math.sin(a) * 0.045]);
    }
    ball(0.016, "#f08a24", [top[0] + 0.01, top[1] - 0.06, top[2] + 0.05], [1, 1.2, 1], 5);
    ball(0.016, "#e3701b", [top[0] - 0.015, top[1] - 0.07, top[2] + 0.055], [1, 1.2, 1], 5);
  };
  palm(-0.15, -0.62, 1.0, 0.2, 0.14, 0.2);
  palm(0.62, 0.45, 0.85, -0.18, -0.1, 0.9);
  palm(-0.55, 0.12, 0.78, 0.14, 0.05, 1.5);
  palm(-0.95, -0.05, 0.68, 0.14, 0.0, 2.1);

  // ---------- striped tent ----------
  const tent = (cx: number, cz: number, yaw: number, c1: string, c2: string) => {
    const roof = paint((_p, _n, s) => {
      if (s[0] < 0.19) return s[0] < 0.03 ? WOOD : CREAM;
      return Math.floor((((s[1] / 30) % 12) + 12) % 12) % 2 ? c1 : c2;
    });
    b.lathe(
      [
        [0, 0],
        [0.28, 0],
        [0.28, 0.18],
        [0.37, 0.2],
        [0, 0.54],
      ],
      { at: [cx, GY, cz], segments: 12, color: roof },
    );
    const [dx, dz] = rot(0, 0.272, yaw);
    box(0.13, 0.16, 0.04, DARK, [cx + dx, GY + 0.08, cz + dz], (yaw * 180) / Math.PI);
    const [fx, fz] = rot(0, 0.286, yaw);
    box(0.17, 0.02, 0.03, c1, [cx + fx, GY + 0.17, cz + fz], (yaw * 180) / Math.PI);
    for (const s of [1, -1]) {
      const [px, pz] = rot(s * 0.08, 0.285, yaw);
      box(0.018, 0.17, 0.03, WOOD, [cx + px, GY + 0.085, cz + pz], (yaw * 180) / Math.PI);
    }
    b.rod([cx, GY + 0.52, cz], [cx, GY + 0.66, cz], 0.008, { color: WOOD, sides: 5 });
    ball(0.022, GOLD, [cx, GY + 0.67, cz]);
    b.extrude(
      [
        [0, 0],
        [0.09, 0.02],
        [0.12, 0.0, "sharp"],
        [0.09, -0.03],
        [0, -0.025],
      ],
      { at: [cx, GY + 0.64, cz], x: [Math.cos(yaw), 0, -Math.sin(yaw)], thickness: 0.006, color: c1 },
    );
    for (let k = 0; k < 4; k++) {
      const a = k * (Math.PI / 2) + yaw + 0.8;
      const ex = cx + Math.sin(a) * 0.35;
      const ez = cz + Math.cos(a) * 0.35;
      const sx = cx + Math.sin(a) * 0.52;
      const sz = cz + Math.cos(a) * 0.52;
      b.rod([ex, GY + 0.2, ez], [sx, GY + 0.01, sz], 0.004, { color: "#d8c7a0", sides: 4 });
      b.spike([sx, GY + 0.03, sz], [0.2, -1, 0], 0.045, 0.01, { color: WOOD, sides: 4 });
    }
  };
  tent(0.7, -0.3, -0.5, RED, "#f4b64a");
  // rug and cushions in front of the tent
  const rugTex = svg(
    `<svg viewBox="0 0 90 70"><rect width="90" height="70" fill="#a8332e"/><rect x="5" y="5" width="80" height="60" fill="#f3d9a0"/><rect x="10" y="10" width="70" height="50" fill="#2c7f89"/><path d="M45 14 L72 35 L45 56 L18 35Z" fill="#e8b23a"/><path d="M45 24 L58 35 L45 46 L32 35Z" fill="#a8332e"/><circle cx="45" cy="35" r="4" fill="#fff0cf"/></svg>`,
    { size: 256 },
  );
  part(new THREE.PlaneGeometry(0.34, 0.26), "#ffffff", [0.62, GY + 0.003, -0.06], { dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: rugTex, rotation: undefined });
  box(0.07, 0.03, 0.06, "#e0584b", [0.52, GY + 0.015, -0.08], 25);
  box(0.06, 0.03, 0.06, "#3a9fb0", [0.74, GY + 0.015, -0.12], -15);

  // ---------- pavilion ----------
  const pvx = -0.6;
  const pvz = -0.4;
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      b.rod([pvx + sx * 0.27, GY, pvz + sz * 0.27], [pvx + sx * 0.27, GY + 0.34, pvz + sz * 0.27], 0.013, { color: WOOD, sides: 6 });
      ball(0.02, GOLD, [pvx + sx * 0.27, GY + 0.35, pvz + sz * 0.27]);
      b.spike([pvx + sx * 0.27, GY + 0.3, pvz + sz * 0.27], [0, -1, 0], 0.06, 0.013, { color: RED, sides: 5 });
    }
  b.lathe(
    [
      [0, 0],
      [0.42, 0],
      [0.42, 0.04],
      [0.2, 0.14],
      [0, 0.15],
    ],
    {
      at: [pvx, GY + 0.34, pvz],
      segments: 4,
      spin: 45,
      color: paint((p) => (Math.floor((p.x + p.z + 5) / 0.08) % 2 ? "#3a8fc0" : CREAM)),
    },
  );
  b.rod([pvx, GY + 0.47, pvz], [pvx, GY + 0.56, pvz], 0.008, { color: GOLD, sides: 5 });
  b.spike([pvx, GY + 0.55, pvz], [0, 1, 0], 0.07, 0.025, { color: GOLD, sides: 5 });
  // hanging lantern
  b.rod([pvx, GY + 0.34, pvz], [pvx, GY + 0.28, pvz], 0.004, { color: DARK, sides: 4 });
  glow(part(new THREE.OctahedronGeometry(0.03, 0), "#ffcf5a", [pvx, GY + 0.255, pvz], { scale: [1, 1.3, 1] }), 1.4);
  // rug + cushions + tea set
  part(new THREE.PlaneGeometry(0.46, 0.36), "#ffffff", [pvx, GY + 0.003, pvz], { dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: rugTex });
  box(0.09, 0.04, 0.07, "#d9503a", [pvx - 0.14, GY + 0.025, pvz - 0.1], 20);
  box(0.09, 0.04, 0.07, "#f2b632", [pvx + 0.14, GY + 0.025, pvz - 0.1], -20);
  box(0.08, 0.04, 0.07, "#4aa57f", [pvx, GY + 0.025, pvz + 0.14], 5);
  part(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 8), "#b9632c", [pvx, GY + 0.015, pvz - 0.02]);
  part(new THREE.CylinderGeometry(0.075, 0.075, 0.008, 8), "#f2c36b", [pvx, GY + 0.034, pvz - 0.02]);
  part(new THREE.CylinderGeometry(0.014, 0.02, 0.04, 6), GOLD, [pvx - 0.02, GY + 0.058, pvz - 0.02]);
  ball(0.012, GOLD, [pvx - 0.02, GY + 0.082, pvz - 0.02], [1, 0.8, 1], 5);
  for (const cx of [0.03, 0.055]) part(new THREE.CylinderGeometry(0.01, 0.007, 0.014, 6), "#fff0cf", [pvx + cx, GY + 0.045, pvz - 0.0]);

  // ---------- mesa ----------
  b.lathe(
    [
      [0, 0],
      [0.2, 0],
      [0.17, 0.2],
      [0.21, 0.26],
      [0.16, 0.42],
      [0.1, 0.46],
      [0, 0.46],
    ],
    {
      at: [0.4, GY - 0.01, -0.85],
      segments: 7,
      color: stripes("#d8884a", "#a9552f", { size: 0.06, axis: "y", width: 0.5, seed: 5 }),
    },
  );
  ball(0.05, "#c9783f", [0.34, GY + 0.04, -0.7], [1.4, 0.8, 1]);
  ball(0.04, "#c9783f", [0.5, GY + 0.03, -0.72], [1.2, 0.8, 1]);

  // ---------- campfire ----------
  const fx = 0.28;
  const fz = -0.6;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ball(0.028, i % 2 ? "#9b8c78" : "#7f7466", [fx + Math.cos(a) * 0.09, GY + 0.015, fz + Math.sin(a) * 0.09], [1.2, 0.8, 1]);
  }
  b.rod([fx - 0.06, GY + 0.02, fz - 0.03], [fx + 0.06, GY + 0.035, fz + 0.03], 0.012, { color: "#5a3a22", sides: 5 });
  b.rod([fx - 0.05, GY + 0.035, fz + 0.04], [fx + 0.05, GY + 0.02, fz - 0.04], 0.012, { color: "#6b4528", sides: 5 });
  glow(b.spike([fx, GY + 0.03, fz], [0, 1, 0], 0.11, 0.035, { color: "#ff7a1a", sides: 5 }), 1.4);
  glow(b.spike([fx + 0.01, GY + 0.04, fz], [0.1, 1, 0], 0.08, 0.02, { color: "#ffd23f", sides: 5 }), 1.6);
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.4;
    b.rod([fx + Math.cos(a) * 0.12, GY, fz + Math.sin(a) * 0.12], [fx, GY + 0.2, fz], 0.006, { color: WOOD, sides: 4 });
  }
  part(new THREE.CylinderGeometry(0.05, 0.035, 0.05, 7), "#2b2b33", [fx, GY + 0.16, fz]);
  part(new THREE.CylinderGeometry(0.052, 0.052, 0.008, 7), "#4a4a55", [fx, GY + 0.188, fz]);

  // ---------- jars, sacks, crates ----------
  const jar = (x: number, z: number, s: number, c: string, band: string) =>
    b.lathe(
      [
        [0, 0],
        [0.03 * s, 0],
        [0.045 * s, 0.04 * s],
        [0.052 * s, 0.07 * s],
        [0.032 * s, 0.11 * s],
        [0.035 * s, 0.125 * s],
        [0, 0.125 * s],
      ],
      {
        at: [x, GY, z],
        segments: 8,
        color: paint((_p, _n, st) => (st[0] > 0.06 * s && st[0] < 0.078 * s ? band : c)),
      },
    );
  jar(-0.92, -0.62, 1.4, "#c4642f", "#fff0cf");
  jar(-0.86, -0.7, 1.0, "#2e8f9a", GOLD);
  jar(-0.3, -0.12 - 0.45, 1.0, "#d9894a", "#7a4a28");
  jar(0.95, 0.0, 1.2, "#b9632c", "#f2b632");
  for (const [x, z, r] of [
    [-0.28, -0.28, 0.2],
    [0.55, -0.02, 0.5],
    [0.92, -0.15, 0.9],
  ] as const) {
    ball(0.05, "#d9c294", [x, GY + 0.04, z], [1, 0.9, 1], 6);
    part(new THREE.CylinderGeometry(0.014, 0.02, 0.025, 5), "#b39a6c", [x, GY + 0.088, z], { rotation: [0, r * 57, 0] });
  }
  box(0.09, 0.07, 0.08, "#8a5a34", [-0.34, GY + 0.035, -0.22], 15);
  box(0.092, 0.012, 0.082, WOOD, [-0.34, GY + 0.045, -0.22], 15);
  box(0.095, 0.01, 0.01, DARK, [-0.34, GY + 0.07, -0.18], 15);

  // ---------- cacti ----------
  const cactus = (x: number, z: number, h: number, flower: string) => {
    const g = paint((p) => (Math.floor(Math.atan2(p.z - z, p.x - x) * 2.5 + 20) % 2 ? "#3f8f4c" : "#58ad5c"));
    b.sweep([[x, GY - 0.01, z], [x, GY + h, z]], 0.032, { color: g, sides: 6, caps: "round" });
    for (const s of [1, -1])
      b.sweep(
        [
          [x + s * 0.02, GY + h * 0.4, z],
          [x + s * 0.07, GY + h * 0.42, z],
          [x + s * 0.08, GY + h * 0.4 + 0.07, z],
        ],
        0.02,
        { color: "#4a9e52", sides: 6 },
      );
    ball(0.016, flower, [x, GY + h + 0.025, z], [1, 0.8, 1], 5);
  };
  cactus(1.0, -0.05, 0.24, "#ff6fa5");
  cactus(0.88, -0.78, 0.16, "#ffd23f");
  cactus(-1.0, 0.65, 0.18, "#ff6fa5");

  // ---------- rocks ----------
  for (const [x, z, r, c] of [
    [-0.35, 0.28, 0.07, "#b69674"],
    [0.4, 0.3, 0.05, "#a78766"],
    [0.55, 0.95 - 0.35, 0.06, "#c0a07c"],
    [-0.45, -0.95 + 0.25, 0.08, "#a78766"],
    [-1.05, -0.3, 0.06, "#b69674"],
    [0.95, 0.55, 0.05, "#a78766"],
  ] as const)
    part(new THREE.IcosahedronGeometry(r, 0), c, [x, GY + r * 0.2, z], { scale: [1.2, 0.7, 1], rotation: [0, x * 200, 0] });

  // ---------- camels ----------
  const camel = (ox: number, oz: number, yaw: number, sc: number, kneel: boolean, coat: string, blanket: [string, string]) => {
    const yd = (yaw * 180) / Math.PI;
    const w = (lx: number, ly: number, lz: number): number[] => {
      const [rx, rz] = rot(lx, lz, yaw);
      return [ox + rx * sc, GY - 0.003 + ly * sc, oz + rz * sc];
    };
    const by = kneel ? 0.1 : 0.2;
    const cball = (r: number, c: string, lx: number, ly: number, lz: number, s: number[] = [1, 1, 1], seg = 6) =>
      part(new THREE.SphereGeometry(r * sc, seg, Math.max(3, seg - 2)), c, w(lx, ly, lz), { scale: s, rotation: [0, yd, 0] });
    const dark = "#5a3c28";
    b.capsule(w(0, by, -0.11), w(0, by, 0.11), 0.076 * sc, { color: coat, sides: 6 });
    cball(0.07, coat, 0, by + 0.02, 0.12, [1, 1, 1]);
    cball(0.05, coat, 0, by + 0.095, -0.06, [1, 1.2, 1.1]);
    cball(0.05, coat, 0, by + 0.1, 0.05, [1, 1.15, 1.1]);
    cball(0.03, "#b08358", 0, by + 0.135, -0.06, [1.1, 0.5, 1.1]);
    cball(0.03, "#b08358", 0, by + 0.135, 0.05, [1.1, 0.5, 1.1]);
    for (const x of [-0.045, 0.045])
      for (const z of [-0.09, 0.09]) {
        if (kneel)
          b.rod(w(x, 0.025, z - 0.07), w(x, 0.025, z + 0.06), 0.02 * sc, { color: coat, sides: 5 });
        else {
          const kz = z > 0 ? 0.014 : -0.016;
          b.sweep([w(x, by - 0.02, z), w(x, 0.095, z + kz), w(x, 0.02, z)], [0.024 * sc, 0.014 * sc], { color: coat, sides: 5, caps: "flat" });
          part(new THREE.CylinderGeometry(0.02 * sc, 0.023 * sc, 0.016 * sc, 6), dark, w(x, 0.008, z), { rotation: [0, yd, 0] });
        }
      }
    b.sweep(
      [w(0, by + 0.04, 0.1), w(0, by + 0.12, 0.15), w(0, by + 0.19, 0.17), w(0, by + 0.24, 0.2)],
      [0.037 * sc, 0.026 * sc],
      { color: coat, sides: 6 },
    );
    b.capsule(w(0, by + 0.245, 0.2), w(0, by + 0.23, 0.265), [0.034 * sc, 0.028 * sc], { color: coat, sides: 6 });
    cball(0.032, "#e8cfa0", 0, by + 0.225, 0.285, [1.1, 0.9, 1.1]);
    for (const s of [1, -1]) {
      cball(0.007, dark, s * 0.014, by + 0.225, 0.312, [1, 1, 1], 4);
      cball(0.013, "#fff6dc", s * 0.032, by + 0.258, 0.222, [0.7, 1, 1], 5);
      cball(0.008, DARK, s * 0.04, by + 0.258, 0.226, [0.5, 1, 1], 4);
      b.spike(w(s * 0.032, by + 0.275, 0.185), w(s * 0.3, 1, -0.2), 0.03 * sc / 0.03 * 0.03, 0.013 * sc, { color: coat, sides: 4 });
      // saddle blanket sides, bag
      box(0.01 * sc, 0.075 * sc, 0.12 * sc, stripes(blanket[0], blanket[1], { size: 0.022, axis: "y", width: 0.5, seed: 2 }), w(s * 0.078, by + 0.005, 0.0), yd);
      cball(0.03, "#a86a3a", s * 0.095, by - 0.03, 0.0, [0.7, 1, 1.1]);
    }
    box(0.12 * sc, 0.006 * sc, 0.03 * sc, blanket[0], w(0, by + 0.07, -0.005), yd);
    // bridle
    box(0.075 * sc, 0.012 * sc, 0.012 * sc, RED, w(0, by + 0.235, 0.265), yd);
    cball(0.01, GOLD, 0, by + 0.235, 0.275, [1, 1, 1], 4);
    // tail
    b.sweep([w(0, by + 0.07, -0.17), w(0, by + 0.04, -0.21), w(0, by - 0.03, -0.215)], 0.009 * sc, { color: coat, sides: 4 });
    cball(0.016, dark, 0, by - 0.045, -0.215, [1, 1.4, 1], 5);
  };
  camel(-0.45, 0.78, 1.2, 1, false, "#d6a15f", ["#d9503a", "#fff0cf"]);
  camel(0.32, 0.82, -1.5, 1, true, "#c58e4f", ["#2e8f9a", "#f2b632"]);
  camel(-0.08, 0.92, 0.3, 0.6, false, "#e0b373", ["#f2b632", "#d9503a"]);

  // footprints
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    const px = -0.95 + t * 0.35;
    const pz = 0.3 + t * 0.4 + (i % 2 ? 0.03 : -0.03);
    part(new THREE.CylinderGeometry(0.014, 0.014, 0.004, 6), "#c08d4a", [px, GY + 0.001, pz], { scale: [1, 1, 1.4] });
  }

  return b.root;
}
