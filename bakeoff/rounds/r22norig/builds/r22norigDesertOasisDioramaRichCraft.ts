import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { bezier, catmull } from "../../../../src/path";
import { rng } from "../../../../src/math";
import { grain, mix, mottle, noise, paint, stripes } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Desert Oasis Diorama",
  description:
    "A round sand diorama with a turquoise spring ringed by stones and reeds, four leaning date palms, three striped tents, a pavilion, a camp fire, a ruin, cacti, jars, crates and three camels (one resting, one calf).",
  style: "low-poly whimsical mix",
  commit: "88fc1f0",
};

type C = string | Paint;

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "desertOasisDiorama" });
  const R = rng(7);
  const G = 0.14; // sand surface height

  // ---------- helpers ----------
  const ball = (p: number[], r: number, c: C, sc?: number[], rot?: number[]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { at: p, scale: sc, rotation: rot });
  const box = (p: number[], w: number, h: number, d: number, c: C, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: p, rotation: rot });
  const cyl = (p: number[], r0: number, r1: number, h: number, c: C, sides = 8, rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, sides), c, { at: p, rotation: rot });
  const rock = (p: number[], r: number, c: C, sc: number[] = [1, 0.7, 1], rot?: number[]) =>
    b.part(new THREE.DodecahedronGeometry(r, 0), c, { at: p, scale: sc, rotation: rot ?? [R() * 90, R() * 360, 0] });

  // ---------- palette & paints ----------
  const WOOD = grain("#8a5a34", "#6c4426", { size: 0.02, axis: "x", seed: 3 });
  const STONE = mottle("#cdb99a", "#a99274", { size: 0.06, seed: 5 });
  const STONE2 = mottle("#b9a58a", "#8d7a62", { size: 0.05, seed: 6 });
  const ROPE = "#d9c08a";
  const GOLD = "#f2c14e";
  const DARK = "#3b2418";

  const sandTop = paint((p) => {
    const w = Math.sin((p.x * 0.8 + p.z * 1.3 + noise(p, 0.6, 3) * 2.2) * 22);
    if (w > 0.82) return "#f8e0a2";
    if (w < -0.85) return "#dcae62";
    return mix("#ecc77e", "#e4b96c", noise(p, 0.3, 1));
  });
  const strata = stripes("#c18b50", "#a8733c", { size: 0.045, axis: "y", seed: 2 });
  const sandPaint = paint((_p, n) => (n.y > 0.6 ? sandTop : strata));
  const sandOnly = paint((p, n) => (n.y > 0.1 ? sandTop : mix("#d9aa62", "#c8964f", noise(p, 0.2, 4))));

  // ---------- base ----------
  b.lathe(
    [
      [0, 0],
      [1.28, 0],
      [1.34, 0.035],
      [1.34, 0.11],
      [1.3, G],
      [0, G],
    ],
    { at: [0, 0, 0], segments: 28, color: sandPaint },
  );
  // earthen rim band
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    rock([Math.sin(a) * 1.33, 0.075, Math.cos(a) * 1.33], 0.045 + R() * 0.02, i % 2 ? "#b88445" : "#a56f38", [1, 1.2, 0.8], [0, (a * 180) / Math.PI, 0]);
  }

  // dunes
  for (const [x, z, r, sx] of [
    [1.02, 0.3, 0.2, 1.2],
    [-0.1, 1.03, 0.17, 1.4],
    [-1.0, -0.25, 0.16, 1.2],
  ] as const) {
    ball([x, G - 0.03, z], r, sandOnly, [sx, 0.4, 1], [0, R() * 180, 0]);
  }

  // ---------- oasis pond ----------
  const PX = 0.05;
  const PZ = 0.12;
  const RX = 0.5;
  const RZ = 0.38;
  cyl([PX, G + 0.004, PZ], 1, 1, 0.02, "#c99f5c", 20).mesh.scale.set(RX + 0.09, 1, RZ + 0.09);
  cyl([PX, G + 0.012, PZ], 1, 1, 0.03, mottle("#46c4d0", "#2a9bc2", { size: 0.14, seed: 9 }), 20).mesh.scale.set(RX, 1, RZ);
  for (const [k, sx, sz] of [
    [0.55, 0.3, 0.2],
    [0.35, 0.18, 0.12],
  ] as const) {
    b.part(new THREE.TorusGeometry(1, 0.012, 4, 20), "#8fe0e6", {
      at: [PX - 0.05 + k * 0.1, G + 0.028, PZ + 0.02],
      rotation: [90, 0, 0],
      scale: [sx, sz, 1],
    });
  }
  // rim stones
  const stoneCols: C[] = [STONE, STONE2, "#c4ad8c", "#9c8870"];
  for (let i = 0; i < 18; i++) {
    const t = (i / 18) * Math.PI * 2;
    const x = PX + (RX + 0.06) * Math.cos(t);
    const z = PZ + (RZ + 0.06) * Math.sin(t);
    const big = 0.055 + R() * 0.035;
    rock([x, G + big * 0.35, z], big, stoneCols[i % 4]);
    if (i % 3 === 0) rock([x + 0.05, G + 0.015, z + 0.03], 0.025, stoneCols[(i + 1) % 4]);
  }
  // lily pads and lotus
  const padCols = ["#4aa04a", "#5fb85a", "#3c8c46"];
  [
    [-0.15, 0.05, 0.075],
    [0.2, 0.2, 0.06],
    [-0.02, 0.28, 0.055],
    [0.28, -0.02, 0.07],
    [-0.3, 0.2, 0.05],
  ].forEach(([dx, dz, r], i) => {
    cyl([PX + dx, G + 0.03, PZ + dz], r, r, 0.008, padCols[i % 3], 8);
    b.part(new THREE.BoxGeometry(r, 0.004, 0.01), "#2f7a3a", { at: [PX + dx + r * 0.4, G + 0.036, PZ + dz], rotation: [0, i * 40, 0] });
  });
  for (const [dx, dz] of [
    [-0.15, 0.05],
    [0.28, -0.02],
  ]) {
    const cx = PX + dx;
    const cz = PZ + dz;
    ball([cx, G + 0.045, cz], 0.018, "#f6d86a");
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      b.spike([cx + Math.sin(a) * 0.012, G + 0.036, cz + Math.cos(a) * 0.012], [cx + Math.sin(a) * 0.05, G + 0.075, cz + Math.cos(a) * 0.05], null, 0.014, k % 2 ? "#f08aa8" : "#f7a8c0", { sides: 4 });
    }
  }
  // reeds & cattails
  for (const [rx, rz] of [
    [-0.5, 0.35],
    [-0.46, 0.4],
    [-0.54, 0.28],
    [-0.42, 0.34],
    [0.55, 0.38],
    [0.5, 0.44],
    [0.6, 0.33],
  ]) {
    const h = 0.2 + R() * 0.12;
    const lx = (R() - 0.5) * 0.08;
    b.rod([rx, G, rz], [rx + lx, G + h, rz + 0.02], 0.005, "#6aa84a", { sides: 4 });
    if (R() > 0.4) b.capsule([rx + lx, G + h - 0.05, rz + 0.02], [rx + lx, G + h, rz + 0.02], 0.012, "#6b4326", { sides: 5 });
  }

  // ---------- palms ----------
  const GREENS = ["#3f9a45", "#58b34f", "#2f8340"];
  const palm = (px: number, pz: number, h: number, lx: number, lz: number, seed: number) => {
    const r = rng(seed);
    const top = [px + lx, G + h, pz + lz];
    const path = catmull([[px, G - 0.01, pz], [px + lx * 0.2, G + h * 0.35, pz + lz * 0.2], [px + lx * 0.6, G + h * 0.72, pz + lz * 0.6], top]);
    const len = path.length;
    const rings = paint((_p, _n, s) => (Math.floor((s[0] * len) / 0.04) % 2 ? "#8a5a34" : "#a97a4b"));
    b.sweep(path, [0.06, 0.033], { color: rings, sides: 6, caps: "flat" });
    ball([px, G + 0.01, pz], 0.075, "#8a5a34", [1, 0.5, 1]);
    // fronds
    const N = 10;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2 + r() * 0.3;
      const L = (0.42 + r() * 0.12) * (0.8 + h * 0.3);
      const o = [Math.sin(a), 0, Math.cos(a)];
      const up = 0.16 + r() * 0.06;
      const fr = bezier(
        [top[0], top[1] + 0.01, top[2]],
        [top[0] + o[0] * L * 0.35, top[1] + up, top[2] + o[2] * L * 0.35],
        [top[0] + o[0] * L * 0.75, top[1] + up, top[2] + o[2] * L * 0.75],
        [top[0] + o[0] * L, top[1] - 0.1 - r() * 0.06, top[2] + o[2] * L],
      );
      b.sweep(fr, (t: number): [number, number] => [0.05 * (1 - t * 0.85) + 0.004, 0.007], {
        section: "box",
        color: GREENS[i % 3],
        caps: "flat",
      });
      // rib highlight
      b.sweep(fr.slice(0.05, 0.95), 0.0045, { color: "#c9e08a", sides: 4, caps: "flat", shift: [0, 0.008] });
    }
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.4;
      b.spike([top[0], top[1], top[2]], [top[0] + Math.sin(a) * 0.08, top[1] + 0.2, top[2] + Math.cos(a) * 0.08], null, 0.022, "#7cc65a", { sides: 4 });
    }
    // coconuts and dates
    for (let i = 0; i < 4; i++) {
      const a = i * 1.6 + r();
      ball([top[0] + Math.sin(a) * 0.045, top[1] - 0.045, top[2] + Math.cos(a) * 0.045], 0.032, i % 2 ? "#6b4326" : "#8b5a2b");
    }
    for (let i = 0; i < 3; i++) ball([top[0] + 0.05 * i - 0.05, top[1] - 0.09, top[2] + 0.02 * i], 0.014, "#e07a2a");
  };
  palm(-0.72, 0.55, 0.95, 0.1, -0.1, 11);
  palm(0.72, 0.12, 1.05, -0.28, 0.05, 12);
  palm(-0.35, -0.5, 0.8, 0.05, 0.12, 13);
  palm(0.5, 0.52, 0.62, -0.08, -0.12, 14);

  // ---------- tents ----------
  const rugTex = svg(
    `<svg viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="24" fill="#b3372f"/><rect x="2" y="2" width="36" height="20" fill="none" stroke="#f2c14e" stroke-width="2"/><polygon points="20,5 30,12 20,19 10,12" fill="#2f6f8f"/><polygon points="20,8 25,12 20,16 15,12" fill="#f2c14e"/><g fill="#f6e7c1"><rect x="4" y="4" width="3" height="3"/><rect x="33" y="4" width="3" height="3"/><rect x="4" y="17" width="3" height="3"/><rect x="33" y="17" width="3" height="3"/></g><g fill="#f6e7c1"><rect x="0" y="1" width="1" height="2"/><rect x="0" y="5" width="1" height="2"/><rect x="0" y="9" width="1" height="2"/><rect x="0" y="13" width="1" height="2"/><rect x="0" y="17" width="1" height="2"/><rect x="39" y="1" width="1" height="2"/><rect x="39" y="5" width="1" height="2"/><rect x="39" y="9" width="1" height="2"/><rect x="39" y="13" width="1" height="2"/><rect x="39" y="17" width="1" height="2"/></g></svg>`,
    { size: 128 },
  );
  const tent = (x: number, z: number, ang: number, s: number, c1: string, c2: string, flag: string) => {
    const deg = (ang * 180) / Math.PI;
    const f = [Math.sin(ang), 0, Math.cos(ang)];
    const rt = [Math.cos(ang), 0, -Math.sin(ang)];
    const tp = paint((_p, _n, sv) => (sv[0] > 0.45 * s ? GOLD : Math.floor(sv[1] / 30) % 2 ? c1 : c2));
    b.lathe(
      [
        [0, 0],
        [0.33 * s, 0],
        [0.32 * s, 0.2 * s],
        [0.21 * s, 0.38 * s],
        [0.05 * s, 0.52 * s],
        [0, 0.55 * s],
      ],
      { at: [x, G, z], segments: 12, color: tp },
    );
    b.part(new THREE.TorusGeometry(0.325 * s, 0.014 * s, 4, 12), flag, { at: [x, G + 0.012, z], rotation: [90, 0, 0] });
    b.part(new THREE.TorusGeometry(0.265 * s, 0.01 * s, 4, 12), GOLD, { at: [x, G + 0.26 * s, z], rotation: [90, 0, 0] });
    // pole + finial + pennant
    b.rod([x, G + 0.52 * s, z], [x, G + 0.68 * s, z], 0.009, WOOD, { sides: 5 });
    ball([x, G + 0.69 * s, z], 0.017, GOLD);
    b.extrude(
      [
        [0, 0],
        [0.14 * s, 0.025],
        [0, 0.05],
      ],
      { at: [x, G + 0.6 * s, z], x: [rt[0], 0, rt[2]], y: [0, 1, 0], thickness: 0.006, color: flag },
    );
    // door
    const dp = (k: number) => [x + f[0] * k * s, G, z + f[2] * k * s];
    b.extrude(
      [
        [-0.085 * s, 0],
        [0.085 * s, 0],
        [0.085 * s, 0.11 * s],
        [0.0, 0.2 * s],
        [-0.085 * s, 0.11 * s],
      ],
      { at: dp(0.324), x: rt, y: [0, 1, 0], thickness: 0.018, color: GOLD },
    );
    b.extrude(
      [
        [-0.07 * s, 0],
        [0.07 * s, 0],
        [0.07 * s, 0.1 * s],
        [0.0, 0.18 * s],
        [-0.07 * s, 0.1 * s],
      ],
      { at: dp(0.33), x: rt, y: [0, 1, 0], thickness: 0.018, color: DARK },
    );
    // tie-back flaps
    for (const sd of [1, -1]) {
      b.extrude(
        [
          [0, 0],
          [0.05 * s, 0],
          [0.02 * s, 0.17 * s],
        ],
        { at: [dp(0.34)[0] + rt[0] * sd * 0.07 * s, G, dp(0.34)[2] + rt[2] * sd * 0.07 * s], x: [rt[0] * sd, 0, rt[2] * sd], y: [0, 1, 0], thickness: 0.012, color: sd > 0 ? c1 : c2, smoothing: 0 },
      );
    }
    // rug
    b.part(new THREE.PlaneGeometry(0.34 * s, 0.2 * s), "#ffffff", {
      at: [x + f[0] * 0.5 * s, G + 0.004, z + f[2] * 0.5 * s],
      dir: [0, 1, 0],
      axis: "z",
      up: [-f[0], 0, -f[2]],
      texture: rugTex,
    });
    // guy ropes + pegs
    for (let k = 0; k < 3; k++) {
      const a = ang + Math.PI * (0.6 + k * 0.4) + 0.2;
      const dx = Math.sin(a);
      const dz = Math.cos(a);
      b.rod([x + dx * 0.29 * s, G + 0.24 * s, z + dz * 0.29 * s], [x + dx * 0.52 * s, G + 0.01, z + dz * 0.52 * s], 0.003, ROPE, { sides: 4 });
      b.rod([x + dx * 0.52 * s, G, z + dz * 0.52 * s], [x + dx * 0.53 * s, G + 0.04, z + dz * 0.53 * s], 0.008, WOOD, { sides: 4 });
    }
    return deg;
  };
  tent(-0.8, -0.5, 0.7, 1.0, "#d9483b", "#f6e7c1", "#2f8fb3");
  tent(0.15, -0.88, 0.05, 1.15, "#2f8fb3", "#f6e7c1", "#d9483b");
  tent(-0.2, -0.3, -0.5, 0.62, "#8e4fb0", "#f2d27a", "#e0602e");

  // ---------- pavilion ----------
  {
    const px = 0.88;
    const pz = -0.52;
    const pc = stripes("#e8574a", "#fff2d6", { size: 0.07, axis: "x" });
    for (const [dx, dz] of [
      [-0.2, -0.2],
      [0.2, -0.2],
      [-0.2, 0.2],
      [0.2, 0.2],
    ]) {
      b.rod([px + dx, G, pz + dz], [px + dx, G + 0.32, pz + dz], 0.012, WOOD, { sides: 5 });
      ball([px + dx, G + 0.325, pz + dz], 0.016, GOLD);
    }
    b.lathe(
      [
        [0, 0.3],
        [0.34, 0.3],
        [0.32, 0.325],
        [0.03, 0.46],
        [0, 0.46],
      ],
      { at: [px, G, pz], segments: 4, spin: 45, color: pc },
    );
    ball([px, G + 0.48, pz], 0.02, GOLD);
    for (const sd of [1, -1]) {
      box([px + sd * 0.235, G + 0.285, pz], 0.012, 0.035, 0.48, sd > 0 ? "#2f8fb3" : "#d9a13b");
      box([px, G + 0.285, pz + sd * 0.235], 0.48, 0.035, 0.012, sd > 0 ? "#d9a13b" : "#2f8fb3");
    }
    // floor carpet, cushions, table, teapot
    box([px, G + 0.008, pz], 0.4, 0.012, 0.4, mottle("#a8322c", "#7f2a3a", { size: 0.04, seed: 21 }));
    box([px, G + 0.016, pz], 0.3, 0.006, 0.3, "#2f6f8f");
    box([px - 0.12, G + 0.04, pz - 0.1], 0.1, 0.04, 0.09, "#f2c14e", [0, 20, 0]);
    box([px + 0.12, G + 0.04, pz - 0.1], 0.1, 0.04, 0.09, "#9b59b6", [0, -15, 0]);
    box([px - 0.12, G + 0.04, pz + 0.12], 0.1, 0.04, 0.09, "#46a870", [0, 10, 0]);
    cyl([px + 0.02, G + 0.065, pz + 0.01], 0.09, 0.09, 0.012, WOOD, 10);
    cyl([px + 0.02, G + 0.035, pz + 0.01], 0.015, 0.015, 0.05, WOOD, 6);
    cyl([px + 0.02, G + 0.012, pz + 0.01], 0.04, 0.04, 0.012, WOOD, 8);
    b.lathe(
      [
        [0, 0],
        [0.03, 0],
        [0.04, 0.03],
        [0.025, 0.055],
        [0.012, 0.062],
        [0, 0.066],
      ],
      { at: [px + 0.03, G + 0.071, pz + 0.02], segments: 8, color: "#d9a13b" },
    );
    b.rod([px + 0.07, G + 0.1, pz + 0.02], [px + 0.1, G + 0.12, pz + 0.02], 0.007, GOLD, { sides: 4 });
    cyl([px - 0.03, G + 0.08, pz - 0.03], 0.015, 0.012, 0.02, "#f6e7c1", 6);
  }

  // ---------- camp fire ----------
  {
    const fx = 0.5;
    const fz = -0.6;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      rock([fx + Math.sin(a) * 0.1, G + 0.02, fz + Math.cos(a) * 0.1], 0.035 + (i % 2) * 0.01, i % 2 ? STONE2 : STONE);
    }
    b.rod([fx - 0.08, G + 0.03, fz - 0.04], [fx + 0.08, G + 0.05, fz + 0.04], 0.016, "#5a3a22", { sides: 5 });
    b.rod([fx - 0.06, G + 0.05, fz + 0.06], [fx + 0.06, G + 0.03, fz - 0.06], 0.016, "#6b4326", { sides: 5 });
    ball([fx, G + 0.045, fz], 0.05, "#2a1a12", [1, 0.5, 1]);
    glow(b.spike([fx, G + 0.04, fz], [0, 1, 0], 0.17, 0.045, "#ff8a2a", { sides: 5 }), 1.4);
    glow(b.spike([fx + 0.015, G + 0.04, fz], [0.1, 1, 0], 0.11, 0.03, "#ffd04a", { sides: 5 }), 1.6);
    glow(b.spike([fx - 0.02, G + 0.04, fz + 0.01], [-0.1, 1, 0.1], 0.08, 0.022, "#fff2a0", { sides: 4 }), 1.8);
    // tripod + kettle
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.5;
      b.rod([fx + Math.sin(a) * 0.15, G, fz + Math.cos(a) * 0.15], [fx, G + 0.24, fz], 0.007, WOOD, { sides: 4 });
    }
    b.rod([fx, G + 0.24, fz], [fx, G + 0.18, fz], 0.003, "#555555", { sides: 4 });
    b.lathe(
      [
        [0, 0],
        [0.04, 0],
        [0.05, 0.04],
        [0.035, 0.07],
        [0, 0.075],
      ],
      { at: [fx, G + 0.11, fz], segments: 8, color: "#4a4a55" },
    );
    // sitting logs
    cyl([fx + 0.28, G + 0.035, fz + 0.1], 0.035, 0.035, 0.16, "#7b5030", 6, [0, 20, 90]);
    cyl([fx - 0.2, G + 0.035, fz + 0.22], 0.035, 0.035, 0.16, "#7b5030", 6, [0, -50, 90]);
  }

  // ---------- crates, jars, sacks ----------
  {
    const cx = -0.5;
    const cz = -0.85;
    const crate = (x: number, y: number, z: number, s: number, rot: number) => {
      box([x, y + s / 2, z], s, s, s, WOOD, [0, rot, 0]);
      const a = (rot * Math.PI) / 180;
      for (const sd of [1, -1]) {
        for (const e of [1, -1]) {
          const ex = x + Math.cos(a) * e * s * 0.5 + Math.sin(a) * sd * 0.0;
          const ez = z - Math.sin(a) * e * s * 0.5;
          b.rod([ex, y + 0.005, ez], [ex, y + s - 0.005, ez], s * 0.07, "#4a3220", { section: "box" });
        }
        b.rod(
          [x - Math.sin(a) * 0.5 * s * sd + Math.cos(a) * -s * 0.5, y + s * 0.97, z - Math.cos(a) * 0.5 * s * sd + Math.sin(a) * s * 0.5],
          [x - Math.sin(a) * 0.5 * s * sd + Math.cos(a) * s * 0.5, y + s * 0.97, z - Math.cos(a) * 0.5 * s * sd - Math.sin(a) * s * 0.5],
          s * 0.05,
          "#4a3220",
          { section: "box" },
        );
      }
    };
    crate(cx, G, cz, 0.16, 15);
    crate(cx + 0.2, G, cz + 0.04, 0.12, -10);
    crate(cx + 0.03, G + 0.16, cz, 0.11, 40);
    const jarPaint = stripes("#c4673a", "#f1d28a", { size: 0.03, axis: "y" });
    const jar = (x: number, z: number, s: number, c: C) => {
      b.lathe(
        [
          [0, 0],
          [0.04 * s, 0],
          [0.068 * s, 0.06 * s],
          [0.05 * s, 0.12 * s],
          [0.03 * s, 0.145 * s],
          [0.042 * s, 0.16 * s],
          [0.03 * s, 0.17 * s],
          [0, 0.17 * s],
        ],
        { at: [x, G, z], segments: 8, color: c },
      );
      for (const sd of [1, -1]) b.sweep([[x + sd * 0.03 * s, G + 0.15 * s, z], [x + sd * 0.07 * s, G + 0.12 * s, z], [x + sd * 0.06 * s, G + 0.07 * s, z]], 0.006 * s, { color: "#8a4a2a", sides: 4 });
    };
    jar(cx - 0.18, cz + 0.05, 1.2, jarPaint);
    jar(cx - 0.28, cz - 0.02, 0.9, "#7a9e6a");
    jar(cx - 0.13, cz + 0.17, 0.8, "#d9a13b");
    for (const [sx, sz, c] of [
      [cx + 0.38, cz + 0.12, "#e8d7a8"],
      [cx + 0.46, cz + 0.02, "#d9c28a"],
    ] as const) {
      ball([sx, G + 0.045, sz], 0.065, c, [1, 0.8, 0.9], [0, sx * 100, 0]);
      ball([sx, G + 0.105, sz], 0.02, c);
      b.part(new THREE.TorusGeometry(0.03, 0.005, 4, 8), "#8a6a3a", { at: [sx, G + 0.088, sz], rotation: [90, 0, 0] });
    }
  }

  // ---------- ruin ----------
  {
    const rx = -0.4;
    const rz = -1.0;
    for (const sd of [1, -1]) {
      cyl([rx + sd * 0.14, G + 0.14, rz], 0.04, 0.045, 0.28, STONE, 6);
      box([rx + sd * 0.14, G + 0.015, rz], 0.11, 0.03, 0.11, STONE2);
      box([rx + sd * 0.14, G + 0.295, rz], 0.1, 0.03, 0.1, STONE2);
      cyl([rx + sd * 0.14, G + 0.2, rz], 0.047, 0.047, 0.02, GOLD, 6);
      cyl([rx + sd * 0.14, G + 0.09, rz], 0.048, 0.048, 0.02, "#2f8fb3", 6);
    }
    box([rx, G + 0.335, rz], 0.38, 0.05, 0.09, STONE);
    box([rx, G + 0.335, rz + 0.047], 0.3, 0.025, 0.005, GOLD);
    for (let i = 0; i < 5; i++) box([rx - 0.1 + i * 0.05, G + 0.335, rz + 0.051], 0.018, 0.03, 0.004, i % 2 ? "#2f8fb3" : "#b3372f");
    // fallen column + rubble
    cyl([rx + 0.1, G + 0.04, rz + 0.2], 0.04, 0.04, 0.2, STONE, 6, [90, 30, 0]);
    for (let i = 0; i < 5; i++) rock([rx - 0.1 + i * 0.07, G + 0.02, rz + 0.12 + (i % 2) * 0.08], 0.025 + (i % 3) * 0.01, i % 2 ? STONE : STONE2);
  }

  // ---------- cacti & shrubs ----------
  const cactus = (x: number, z: number, h: number) => {
    const cp = mottle("#5fae5a", "#3f8f4a", { size: 0.05, seed: 31 });
    b.capsule([x, G, z], [x, G + h, z], 0.035, { color: cp, sides: 6 });
    b.sweep([[x + 0.03, G + h * 0.45, z], [x + 0.1, G + h * 0.5, z], [x + 0.11, G + h * 0.8, z]], 0.024, { color: cp, sides: 6 });
    b.sweep([[x - 0.03, G + h * 0.3, z], [x - 0.09, G + h * 0.34, z], [x - 0.09, G + h * 0.55, z]], 0.022, { color: cp, sides: 6 });
    ball([x, G + h + 0.03, z], 0.018, "#f06a8a");
    ball([x + 0.11, G + h * 0.8 + 0.03, z], 0.013, "#f7d84a");
    for (let i = 0; i < 6; i++) {
      const a = i * 1.05;
      b.spike([x + Math.sin(a) * 0.034, G + h * (0.2 + i * 0.1), z + Math.cos(a) * 0.034], [Math.sin(a), 0.3, Math.cos(a)], 0.025, 0.003, "#f6e7c1", { sides: 3 });
    }
  };
  cactus(0.98, -0.05, 0.22);
  cactus(-1.0, 0.45, 0.17);
  cactus(0.3, 1.0, 0.14);
  const shrub = (x: number, z: number, s: number) => {
    const cols = ["#8fa84a", "#a8b85a", "#7a9640"];
    for (let i = 0; i < 4; i++) {
      const a = i * 1.6;
      ball([x + Math.sin(a) * 0.04 * s, G + 0.035 * s, z + Math.cos(a) * 0.04 * s], 0.045 * s, cols[i % 3], [1, 0.8, 1]);
    }
    ball([x, G + 0.07 * s, z], 0.03 * s, "#f4a259");
    ball([x + 0.04 * s, G + 0.05 * s, z + 0.03 * s], 0.014 * s, "#f6e7c1");
  };
  shrub(-0.55, 0.9, 1);
  shrub(0.82, 0.85, 1.2);
  shrub(0.55, 0.7, 0.8);
  shrub(-1.1, -0.8, 1);
  shrub(0.7, -1.0, 0.9);
  shrub(-0.05, 0.75, 0.8);
  // pebbles
  for (let i = 0; i < 16; i++) {
    const a = R() * Math.PI * 2;
    const d = 0.3 + R() * 0.9;
    const x = Math.sin(a) * d;
    const z = Math.cos(a) * d;
    if (Math.hypot((x - PX) / (RX + 0.12), (z - PZ) / (RZ + 0.12)) < 1) continue;
    rock([x, G + 0.008, z], 0.012 + R() * 0.012, i % 2 ? STONE : STONE2);
  }
  // footprints
  for (let i = 0; i < 8; i++) {
    const x = 0.18 + i * 0.01 * (i % 2 ? 1 : -1);
    const z = 1.1 - i * 0.07;
    cyl([x + (i % 2 ? 0.05 : -0.05), G + 0.002, z], 0.018, 0.018, 0.004, "#c99f5c", 6);
  }

  // ---------- camels ----------
  const camel = (cx: number, cz: number, ang: number, sc: number, rest: boolean, pack: boolean, coat: string, bl: [string, string]) => {
    const co = Math.cos(ang);
    const sn = Math.sin(ang);
    const deg = (ang * 180) / Math.PI;
    const T = (x: number, y: number, z: number): number[] => [cx + sc * (x * co + z * sn), G + sc * y, cz + sc * (-x * sn + z * co)];
    const by = rest ? 0.19 : 0.34;
    const mott = mottle(coat, "#b98348", { size: 0.07 * sc, seed: 41 });
    const fur = paint((_p, n) => (n.y < -0.3 ? "#f0d29a" : mott));
    const rot = [0, deg, 0];
    const S = (x: number, y: number, z: number) => [x * sc, y * sc, z * sc];
    // body
    b.capsule(T(0, by, -0.13), T(0, by, 0.13), [0.105 * sc, 0.095 * sc], { color: fur, sides: 8 });
    ball(T(0, by + 0.1, -0.03), 0.075, fur, S(1, 1.15, 1.25), rot);
    ball(T(0, by, 0.13), 0.1 * sc, fur);
    ball(T(0, by + 0.005, -0.13), 0.098 * sc, fur);
    // neck & head
    b.sweep(catmull([T(0, by + 0.04, 0.12), T(0, by + 0.13, 0.23), T(0, by + 0.26, 0.27)]), [0.058 * sc, 0.038 * sc], { color: fur, sides: 7 });
    b.capsule(T(0, by + 0.27, 0.27), T(0, by + 0.24, 0.36), [0.052 * sc, 0.042 * sc], { color: fur, sides: 7 });
    ball(T(0, by + 0.235, 0.375), 0.046 * sc, "#f0d29a", S(1, 0.9, 1.1), rot);
    for (const sd of [1, -1]) {
      ball(T(sd * 0.039, by + 0.283, 0.305), 0.017 * sc, "#ffffff");
      ball(T(sd * 0.047, by + 0.283, 0.315), 0.009 * sc, "#1a1210");
      b.rod(T(sd * 0.025, by + 0.31, 0.3), T(sd * 0.055, by + 0.3, 0.32), 0.004 * sc, "#6b4a2b", { sides: 3 });
      ball(T(sd * 0.016, by + 0.245, 0.415), 0.006 * sc, "#3b2418");
      b.spike(T(sd * 0.035, by + 0.31, 0.25), T(sd * 0.065, by + 0.375, 0.235), null, 0.02 * sc, "#c9955a", { sides: 4 });
      b.spike(T(sd * 0.036, by + 0.31, 0.25), T(sd * 0.05, by + 0.35, 0.245), null, 0.011 * sc, "#e8a8a0", { sides: 3 });
    }
    b.rod(T(-0.03, by + 0.22, 0.4), T(0.03, by + 0.22, 0.4), 0.004 * sc, "#3b2418", { sides: 3 });
    ball(T(0, by + 0.315, 0.26), 0.03 * sc, "#8b5a2b", S(1, 0.7, 1.2), rot);
    b.part(new THREE.TorusGeometry(0.05 * sc, 0.006 * sc, 4, 8), "#d9483b", { at: T(0, by + 0.24, 0.35), rotation: rot });
    ball(T(0, by + 0.12, 0.285), 0.02 * sc, GOLD);
    // tail
    b.rod(T(0, by + 0.04, -0.21), T(0, by - 0.07, -0.26), [0.012 * sc, 0.008 * sc], fur, { sides: 5 });
    ball(T(0, by - 0.09, -0.265), 0.018 * sc, "#6b4a2b");
    // legs
    for (const sd of [1, -1]) {
      for (const z of [0.12, -0.13]) {
        const front = z > 0;
        const hip = T(sd * 0.07, by - 0.04, z);
        ball(hip, 0.045 * sc, fur);
        if (!rest) {
          const knee = T(sd * 0.07, 0.17, z + (front ? 0.015 : -0.035));
          const foot = T(sd * 0.07, 0.03, z);
          b.rod(hip, knee, [0.038 * sc, 0.026 * sc], { color: fur, sides: 6 });
          b.rod(knee, foot, [0.026 * sc, 0.022 * sc], { color: fur, sides: 6 });
          ball(knee, 0.03 * sc, fur);
          b.part(new THREE.CylinderGeometry(0.032 * sc, 0.038 * sc, 0.03 * sc, 6), "#6b4a2b", { at: T(sd * 0.07, 0.015, z) });
        } else {
          const knee = T(sd * 0.12, 0.04, z);
          const foot = T(sd * 0.12, 0.04, z * 0.2);
          b.rod(hip, knee, [0.036 * sc, 0.03 * sc], { color: fur, sides: 6 });
          b.rod(knee, foot, [0.03 * sc, 0.026 * sc], { color: fur, sides: 6 });
          ball(foot, 0.03 * sc, "#6b4a2b");
        }
      }
    }
    // blanket & tack
    const bp = stripes(bl[0], bl[1], { size: 0.03 * sc, axis: "z" });
    b.part(new THREE.BoxGeometry(0.2 * sc, 0.02 * sc, 0.15 * sc), bp, { at: T(0, by + 0.098, 0.065), rotation: [0, deg, 0] });
    for (const sd of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.014 * sc, 0.09 * sc, 0.15 * sc), bp, { at: T(sd * 0.103, by + 0.05, 0.065), rotation: [0, deg, 0] });
      for (let k = 0; k < 3; k++) ball(T(sd * 0.106, by + 0.0, 0.015 + k * 0.05), 0.01 * sc, GOLD);
    }
    b.part(new THREE.TorusGeometry(0.104 * sc, 0.006 * sc, 4, 10), "#7a4a2a", { at: T(0, by, 0.01), rotation: [0, deg, 0] });
    if (pack) {
      for (const sd of [1, -1]) {
        ball(T(sd * 0.15, by + 0.01, -0.04), 0.055 * sc, sd > 0 ? "#d9c28a" : "#c4673a", S(0.8, 1.15, 1));
        ball(T(sd * 0.15, by + 0.075, -0.04), 0.015 * sc, "#8a6a3a");
      }
      b.part(new THREE.BoxGeometry(0.12 * sc, 0.06 * sc, 0.1 * sc), "#8a5a34", { at: T(0, by + 0.19, -0.03), rotation: [0, deg, 0] });
      b.part(new THREE.BoxGeometry(0.125 * sc, 0.012 * sc, 0.105 * sc), GOLD, { at: T(0, by + 0.19, -0.03), rotation: [0, deg, 0] });
    }
  };
  camel(0.35, 0.8, 2.7, 1.0, false, true, "#d9a566", ["#d9483b", "#f2c14e"]);
  camel(-0.3, 0.82, 0.5, 1.05, false, false, "#cf9a5c", ["#2f8fb3", "#f6e7c1"]);
  camel(0.78, 0.6, -2.3, 0.55, false, false, "#e3b779", ["#46a870", "#f6e7c1"]);
  camel(-0.88, 0.1, 1.6, 0.95, true, true, "#c98f52", ["#8e4fb0", "#f2d27a"]);

  return b.root;
}
