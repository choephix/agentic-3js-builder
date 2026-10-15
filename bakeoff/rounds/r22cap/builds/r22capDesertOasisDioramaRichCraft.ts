import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { mix, mottle, noise, paint, scales, smoothstep, stripes } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { rng } from "../../../../src/math";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Desert Oasis Diorama",
  description:
    "A whimsical low-poly oasis: a turquoise pond ringed by stones and reeds, four palms, a striped cone tent and a ridge tent, a standing and a kneeling camel, a campfire, rugs, jars, crates and cacti on a sandy dune base.",
  style: "low-poly whimsical mix",
  commit: "88fc1f0",
};

const G = 0.12; // sand surface height

type Col = string | Paint;

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "desertOasisDiorama" });
  const R = rng(11);

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const rad = (d: number) => (d * Math.PI) / 180;
  const frameAt = (cx: number, cz: number, deg: number) => {
    const r = rad(deg);
    const c = Math.cos(r);
    const s = Math.sin(r);
    return (lx: number, ly: number, lz: number) => V(cx + lx * c + lz * s, G + ly, cz - lx * s + lz * c);
  };
  const dirX = (deg: number): number[] => [Math.cos(rad(deg)), 0, -Math.sin(rad(deg))];
  const ball = (at: THREE.Vector3, r: number, color: Col, scale?: number[], w = 6, h = 4) =>
    b.part(new THREE.SphereGeometry(r, w, h), color, scale ? { at, scale } : { at });
  const box = (at: THREE.Vector3, w: number, h: number, d: number, color: Col, yaw = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, rotation: [0, yaw, 0] });
  const ringPath = (cx: number, y: number, cz: number, r: number, n: number) => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push(V(cx + Math.cos(a) * r, y, cz + Math.sin(a) * r));
    }
    return catmull(pts, { closed: true });
  };
  const yawTo = (fx: number, fz: number, tx: number, tz: number) => (Math.atan2(tx - fx, tz - fz) * 180) / Math.PI;

  // ---------- palette ----------
  const WOOD = "#7a4f2e";
  const WOOD_D = "#5b3a22";
  const GOLD = "#f2b632";
  const CREAM = "#f7e8c4";
  const RED = "#d9503f";
  const TEAL = "#2fb5b0";
  const PINK = "#f28aa0";
  const STONE_A = "#9a8f84";
  const STONE_B = "#b5a898";
  const STONE_C = "#7c7268";

  const SAND = paint((p) => {
    const w = Math.sin((p.x * 0.9 + p.z * 0.5) * 24 + noise(p, 0.45, 3) * 7);
    const base = mix("#e8bf78", "#f4d796", smoothstep(0.1, 0.9, w));
    return mix(base, "#d3a05a", noise(p, 0.3, 9) * 0.45);
  });
  const WET = mottle("#c79a58", "#b3864a", { size: 0.08, seed: 4 });
  const WATER = paint((p) => {
    const w = noise(p, 0.12, 5);
    const ripple = Math.sin(Math.hypot(p.x + 0.05, p.z - 0.15) * 30) > 0.8 ? 0.35 : 0;
    return mix(mix("#35c9d6", "#1fa0c8", w), "#bff4f2", ripple);
  });
  const COAT = mottle("#cc9a5c", "#b98748", { size: 0.1, seed: 3 });
  const COAT_D = "#8f5f34";
  const HOOF = "#4f3320";
  const TRUNK = stripes("#8a5b34", "#684225", { size: 0.05, axis: "y", width: 0.45, wobble: 0.2, seed: 2 });
  const RIM = scales("#8d7660", "#6a5744", { size: 0.14, width: 0.2, seed: 5 });

  // ---------- base ----------
  b.lathe(
    [
      [0, 0],
      [1.36, 0],
      [1.36, G],
      [0, G],
    ],
    { at: [0, 0, 0], segments: 28, color: SAND },
  );
  b.lathe(
    [
      [1.36, 0],
      [1.42, 0],
      [1.42, G + 0.015],
      [1.36, G + 0.015],
    ],
    { at: [0, 0, 0], segments: 28, color: RIM },
  );
  // dunes
  const dunes: Array<[number, number, number[]]> = [
    [-0.15, -1.02, [0.45, 0.1, 0.28]],
    [1.0, 0.0, [0.28, 0.08, 0.34]],
    [0.1, 1.02, [0.4, 0.09, 0.24]],
    [-1.05, 0.2, [0.2, 0.07, 0.3]],
  ];
  for (const [x, z, s] of dunes)
    b.part(new THREE.SphereGeometry(1, 10, 6), SAND, { at: [x, G, z], scale: s });

  // ---------- pond ----------
  const PX = -0.05;
  const PZ = 0.15;
  b.lathe(
    [
      [0.33, 0],
      [0.43, 0],
      [0.43, 0.03],
      [0.37, 0.04],
      [0.33, 0.025],
    ],
    { at: [PX, G, PZ], segments: 14, color: WET },
  );
  b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.03, 14), WATER, { at: [PX, G, PZ] });
  b.sweep(ringPath(PX, G + 0.017, PZ, 0.3, 12), 0.005, "#d8f8f5", { sides: 4, caps: "none" });
  for (let i = 0; i < 13; i++) {
    const a = (i / 13) * Math.PI * 2 + 0.2;
    const rr = 0.42 + R() * 0.03;
    const s = 0.035 + R() * 0.03;
    const col = [STONE_A, STONE_B, STONE_C][i % 3];
    b.part(new THREE.IcosahedronGeometry(s, 0), col, {
      at: [PX + Math.cos(a) * rr, G + s * 0.5, PZ + Math.sin(a) * rr],
      scale: [1.2, 0.8, 1],
      rotation: [R() * 60, R() * 360, 0],
    });
  }
  // lily pads and flowers
  const pads: Array<[number, number, number]> = [
    [-0.12, 0.08, 0.06],
    [0.08, 0.22, 0.05],
    [-0.02, 0.3, 0.045],
    [0.14, 0.05, 0.04],
  ];
  pads.forEach(([x, z, r], i) => {
    b.part(new THREE.CylinderGeometry(r, r, 0.006, 7), i % 2 ? "#4aa043" : "#5cb84c", { at: [PX + x, G + 0.019, PZ + z - 0.15 + 0.15] });
    if (i % 2 === 0) {
      b.spike(V(PX + x, G + 0.02, PZ + z), V(PX + x, G + 0.065, PZ + z), null, 0.02, PINK);
      ball(V(PX + x, G + 0.03, PZ + z), 0.012, GOLD);
    }
  });
  // leaping fish
  const fx = PX + 0.1;
  const fz = PZ - 0.1;
  b.capsule(V(fx, G + 0.14, fz), V(fx + 0.07, G + 0.2, fz + 0.01), [0.03, 0.022], "#ff8a3d", { sides: 6 });
  b.spike(V(fx + 0.06, G + 0.19, fz + 0.01), V(fx + 0.11, G + 0.25, fz + 0.01), null, 0.026, "#ff6a2a", { sides: 4 });
  b.spike(V(fx - 0.02, G + 0.125, fz), V(fx - 0.06, G + 0.1, fz), null, 0.018, "#ff6a2a", { sides: 4 });
  ball(V(fx + 0.0, G + 0.155, fz + 0.026), 0.008, "#201a2a");
  ball(V(fx + 0.0, G + 0.155, fz - 0.026), 0.008, "#201a2a");
  for (let i = 0; i < 5; i++) ball(V(fx - 0.06 + i * 0.045, G + 0.04 + (i % 2) * 0.05, fz + 0.06 - i * 0.02), 0.009, "#d8f8f5");
  // reeds
  for (let i = 0; i < 22; i++) {
    const a = rad(110 + i * 7.5);
    const rr = 0.45 + R() * 0.07;
    const x = PX + Math.cos(a) * rr;
    const z = PZ + Math.sin(a) * rr;
    const hgt = 0.14 + R() * 0.14;
    b.spike(V(x, G, z), V(x + (R() - 0.5) * 0.06, G + hgt, z + (R() - 0.5) * 0.06), null, 0.009, i % 3 ? "#5fa646" : "#7cbf55", { sides: 4 });
    if (i % 4 === 0) b.rod(V(x, G + hgt * 0.7, z), V(x, G + hgt + 0.02, z), 0.012, "#7a4f2e", { sides: 5 });
  }

  // ---------- palms ----------
  const leafOutline = (len: number, wid: number): OutlinePoint[] => {
    const top: OutlinePoint[] = [[0, 0]];
    const n = 7;
    for (let i = 1; i <= n; i++) {
      const u = i / (n + 1);
      const w = wid * Math.sin(Math.PI * Math.pow(u, 0.7)) * (i % 2 ? 1 : 0.72);
      top.push([u * len, w]);
    }
    const out: OutlinePoint[] = [...top, [len, 0, "sharp"]];
    for (let i = n; i >= 1; i--) {
      const p = top[i] as [number, number];
      out.push([p[0], -p[1]]);
    }
    return out;
  };
  const palm = (x: number, z: number, h: number, lx: number, lz: number, s: number, seed: number) => {
    const base = V(x, G, z);
    const T = V(x + lx, G + h, z + lz);
    const path = catmull([base, V(x + lx * 0.15, G + h * 0.4, z + lz * 0.15), V(x + lx * 0.55, G + h * 0.75, z + lz * 0.55), T]);
    b.sweep(path, [0.085 * s, 0.055 * s, 0.045 * s, 0.038 * s], TRUNK, { sides: 6 });
    b.part(new THREE.ConeGeometry(0.1 * s, 0.07 * s, 6), "#9b6a3a", { at: [x, G + 0.03, z] });
    ball(T.clone().add(V(0, 0.015 * s, 0)), 0.06 * s, "#5d9a38", [1, 0.7, 1]);
    const count = 10;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + seed + (R() - 0.5) * 0.2;
      const len = (0.8 + R() * 0.2) * s;
      const el1 = rad(32 + R() * 10 + (i % 2) * 14);
      const el2 = rad(-30 - R() * 14);
      const side = V(-Math.sin(a), 0, Math.cos(a));
      const d1 = V(Math.cos(a) * Math.cos(el1), Math.sin(el1), Math.sin(a) * Math.cos(el1));
      const d2 = V(Math.cos(a) * Math.cos(el2), Math.sin(el2), Math.sin(a) * Math.cos(el2));
      const l1 = len * 0.5;
      const l2 = len * 0.58;
      const p1 = T.clone().addScaledVector(d1, l1);
      const p2 = p1.clone().addScaledVector(d2, l2);
      const c1 = i % 2 ? "#2f8a3c" : "#3b9a41";
      const c2 = i % 2 ? "#4fae45" : "#5cbb4a";
      b.extrude(leafOutline(l1, 0.07 * s), { at: T, x: d1.toArray(), y: side.toArray(), thickness: 0.008, color: c1 });
      b.extrude(leafOutline(l2, 0.065 * s), { at: p1, x: d2.toArray(), y: side.toArray(), thickness: 0.008, color: c2 });
      b.rod(T, p1, [0.009 * s, 0.006 * s], "#7a9a3a", { sides: 4 });
      b.rod(p1, p2, [0.006 * s, 0.002 * s], "#7a9a3a", { sides: 4 });
    }
    // coconuts and dates
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + seed;
      ball(T.clone().add(V(Math.cos(a) * 0.06 * s, -0.055 * s, Math.sin(a) * 0.06 * s)), 0.032 * s, i % 2 ? "#6b4524" : "#8a5a2c");
    }
    for (let i = 0; i < 3; i++) ball(T.clone().add(V(0.02 * s * (i - 1), -0.1 * s - i * 0.012, 0.03 * s)), 0.018 * s, "#e0742a");
  };
  palm(-0.55, 0.05, 1.15, 0.2, 0.05, 1.0, 0.3);
  palm(0.5, 0.05, 1.3, -0.2, 0.18, 1.1, 1.1);
  palm(0.0, -0.58, 0.9, 0.12, 0.1, 0.85, 2.0);
  palm(0.38, 0.65, 0.6, -0.05, -0.04, 0.6, 0.7);

  // ---------- tent A (cone) ----------
  const ax = -0.92;
  const az = -0.35;
  const aFace = yawTo(ax, az, PX, PZ);
  const aStripe = paint((p) => {
    const a = Math.atan2(p.z - az, p.x - ax);
    const k = Math.floor(((a + Math.PI) / (Math.PI * 2)) * 12);
    return k % 2 ? CREAM : TEAL;
  });
  b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.3, 0.2],
      [0.2, 0.36],
      [0.03, 0.56],
      [0, 0.56],
    ],
    { at: [ax, G, az], segments: 12, color: aStripe },
  );
  b.sweep(ringPath(ax, G + 0.2, az, 0.305, 12), 0.012, GOLD, { sides: 5, caps: "none" });
  b.sweep(ringPath(ax, G + 0.012, az, 0.305, 12), 0.01, WOOD_D, { sides: 5, caps: "none" });
  b.rod(V(ax, G + 0.54, az), V(ax, G + 0.7, az), 0.008, WOOD, { sides: 5 });
  ball(V(ax, G + 0.72, az), 0.022, GOLD);
  b.extrude(
    [
      [0, 0],
      [0.11, 0.025],
      [0, 0.05],
    ],
    { at: V(ax, G + 0.67, az), x: [1, 0, 0.3], y: [0, 1, 0], thickness: 0.006, color: RED },
  );
  const adx = Math.sin(rad(aFace));
  const adz = Math.cos(rad(aFace));
  const doorShape: OutlinePoint[] = [
    [-0.075, 0],
    [0.075, 0],
    [0.075, 0.15],
    [0, 0.22],
    [-0.075, 0.15],
  ];
  const doorFrame: OutlinePoint[] = [
    [-0.09, 0],
    [0.09, 0],
    [0.09, 0.16],
    [0, 0.25],
    [-0.09, 0.16],
  ];
  b.extrude(doorFrame, { at: V(ax + adx * 0.296, G, az + adz * 0.296), x: [-adz, 0, adx], y: [0, 1, 0], thickness: 0.016, color: GOLD });
  b.extrude(doorShape, { at: V(ax + adx * 0.302, G, az + adz * 0.302), x: [-adz, 0, adx], y: [0, 1, 0], thickness: 0.016, color: "#3b2640" });
  for (const s of [1, -1])
    b.extrude(
      [
        [0, 0],
        [0.05, 0],
        [0, 0.17],
      ],
      { at: V(ax + adx * 0.31 - adz * s * 0.075, G, az + adz * 0.31 + adx * s * 0.075), x: [-adz * s, 0, adx * s], y: [0, 1, 0], thickness: 0.01, color: RED },
    );
  for (let i = 0; i < 4; i++) {
    const a = rad(30 + i * 90);
    const gx = ax + Math.cos(a) * 0.52;
    const gz = az + Math.sin(a) * 0.52;
    b.rod(V(ax, G + 0.52, az), V(gx, G + 0.005, gz), 0.0035, CREAM, { sides: 4 });
    b.spike(V(gx, G + 0.04, gz), V(gx, G - 0.005, gz), null, 0.01, WOOD_D, { sides: 4 });
  }

  // ---------- tent B (ridge) ----------
  const bx = 0.72;
  const bz = -0.62;
  const bYaw = yawTo(bx, bz, PX, PZ);
  const LB = frameAt(bx, bz, bYaw);
  const bc = Math.cos(rad(bYaw));
  const bs = Math.sin(rad(bYaw));
  const bStripe = paint((p) => {
    const lx = (p.x - bx) * bc - (p.z - bz) * bs;
    return Math.floor((lx + 5) / 0.08) % 2 ? CREAM : "#e0663a";
  });
  const XB = dirX(bYaw);
  b.extrude(
    [
      [-0.32, 0],
      [0.32, 0],
      [0.32, 0.2],
      [0.2, 0.34],
      [0, 0.42],
      [-0.2, 0.34],
      [-0.32, 0.2],
    ],
    { at: LB(0, 0, 0), x: XB, y: [0, 1, 0], thickness: 0.6, color: bStripe },
  );
  const FB = [Math.sin(rad(bYaw)), 0, Math.cos(rad(bYaw))];
  b.extrude(
    [
      [0, 0.32],
      [0.28, 0.21],
      [0.28, 0.18],
      [0, 0.29],
    ],
    { at: LB(0, 0, 0.3), x: FB, y: [0, 1, 0], thickness: 0.58, color: bStripe },
  );
  b.extrude(
    [
      [-0.12, 0],
      [0.12, 0],
      [0.12, 0.15],
      [0, 0.24],
      [-0.12, 0.15],
    ],
    { at: LB(0, 0, 0.3), x: XB, y: [0, 1, 0], thickness: 0.012, color: "#3b2640" },
  );
  for (const s of [1, -1]) {
    b.rod(LB(s * 0.29, 0, 0.58), LB(s * 0.29, 0.2, 0.58), 0.012, WOOD, { sides: 5 });
    b.rod(LB(s * 0.3, 0.02, 0.3), LB(s * 0.3, 0.22, 0.3), 0.008, WOOD_D, { sides: 5 });
    b.rod(LB(s * 0.32, 0.18, 0.15), LB(s * 0.55, 0, 0.35), 0.0035, CREAM, { sides: 4 });
    b.spike(LB(s * 0.55, 0.04, 0.35), LB(s * 0.55, -0.005, 0.35), null, 0.01, WOOD_D, { sides: 4 });
    b.rod(LB(s * 0.32, 0.18, -0.15), LB(s * 0.55, 0, -0.35), 0.0035, CREAM, { sides: 4 });
    ball(LB(s * 0.3, 0.23, 0.3), 0.014, GOLD);
  }
  for (let i = 0; i < 9; i++) {
    const lx = -0.26 + i * 0.065;
    b.extrude(
      [
        [-0.032, 0],
        [0.032, 0],
        [0, -0.045],
      ],
      { at: LB(lx, 0.19, 0.585), x: XB, y: [0, 1, 0], thickness: 0.006, color: i % 2 ? CREAM : RED },
    );
  }
  b.rod(LB(0, 0.42, -0.3), LB(0, 0.5, -0.3), 0.007, WOOD, { sides: 5 });
  b.extrude(
    [
      [0, 0],
      [0.12, 0.02],
      [0, 0.05],
    ],
    { at: LB(0, 0.46, -0.3), x: XB, y: [0, 1, 0], thickness: 0.006, color: TEAL },
  );
  // lantern on front pole
  b.rod(LB(0.29, 0.2, 0.58), LB(0.34, 0.17, 0.6), 0.004, WOOD_D, { sides: 4 });
  glow(ball(LB(0.34, 0.13, 0.6), 0.026, "#ffd36a", [1, 1.2, 1]), 1.4);
  ball(LB(0.34, 0.165, 0.6), 0.016, GOLD);
  // rugs
  const rugTex = svg(
    `<svg viewBox="0 0 60 40"><rect width="60" height="40" fill="#c8402f"/><rect x="3" y="3" width="54" height="34" fill="#f2dfb0"/><rect x="6" y="6" width="48" height="28" fill="#2b8f94"/><path d="M30 8 L46 20 L30 32 L14 20Z" fill="#e8a63a"/><path d="M30 13 L40 20 L30 27 L20 20Z" fill="#c8402f"/><circle cx="30" cy="20" r="3" fill="#f7e8c4"/><path d="M8 8h6v6M52 8h-6v6M8 32h6v-6M52 32h-6v-6" stroke="#f7e8c4" stroke-width="2" fill="none"/></svg>`,
    { size: 128 },
  );
  const rugAt = (x: number, z: number, yaw: number, w: number, d: number) =>
    b.part(new THREE.BoxGeometry(w, 0.012, d), "#ffffff", { at: [x, G + 0.005, z], rotation: [0, yaw, 0], texture: rugTex });
  const rb = LB(0, 0, 0.62);
  rugAt(rb.x, rb.y, rb.z, bYaw, 0.34, 0.24);
  rugAt(-0.45, -0.52, 20, 0.3, 0.2);
  // cushions
  ball(LB(-0.12, 0.03, 0.66), 0.04, PINK, [1.4, 0.55, 1]);
  ball(LB(0.12, 0.03, 0.62), 0.04, GOLD, [1.4, 0.55, 1]);
  // jars
  const JAR = stripes("#c4643a", "#e8a05a", { size: 0.04, axis: "y", width: 0.4, seed: 8 });
  const jarOutline: OutlinePoint[] = [
    [0, 0],
    [0.04, 0],
    [0.06, 0.05],
    [0.045, 0.1],
    [0.03, 0.12],
    [0.04, 0.135],
    [0.0, 0.135],
  ];
  const jar = (x: number, z: number, s: number) => {
    b.lathe(jarOutline, { at: [x, G, z], segments: 8, color: JAR });
    b.sweep(ringPath(x, G + 0.135 * 1, z, 0.04, 8), 0.006, GOLD, { sides: 4, caps: "none" });
    void s;
  };
  jar(1.02, -0.3, 1);
  jar(1.1, -0.2, 1);
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 7), WOOD, { at: [1.02, G + 0.145, -0.3] });
  // crates and barrel
  const crate = (x: number, z: number, s: number, yaw: number) => {
    box(V(x, s / 2, z), s, s, s, "#a2703d", yaw);
    box(V(x, s + 0.006, z), s * 1.04, 0.012, s * 1.04, WOOD, yaw);
    b.part(new THREE.BoxGeometry(s * 1.02, s * 0.1, s * 1.02), WOOD_D, { at: [x, G + s * 0.5, z], rotation: [0, yaw, 0] });
    b.part(new THREE.BoxGeometry(s * 0.3, s * 0.04, s * 0.02), GOLD, { at: [x, G + s * 0.7, z], rotation: [0, yaw, 0] });
  };
  void crate;
  const crateAt = (x: number, z: number, s: number, yaw: number) => {
    b.part(new THREE.BoxGeometry(s, s, s), "#a2703d", { at: [x, G + s / 2, z], rotation: [0, yaw, 0] });
    b.part(new THREE.BoxGeometry(s * 1.04, 0.012, s * 1.04), WOOD, { at: [x, G + s + 0.004, z], rotation: [0, yaw, 0] });
    b.part(new THREE.BoxGeometry(s * 1.03, s * 0.12, s * 1.03), WOOD_D, { at: [x, G + s * 0.5, z], rotation: [0, yaw, 0] });
    b.part(new THREE.BoxGeometry(s * 0.3, s * 0.12, s * 0.04), GOLD, { at: [x, G + s * 0.5, z], rotation: [0, yaw, 0] });
  };
  crateAt(1.05, -0.65, 0.12, 20);
  crateAt(1.02, -0.9, 0.1, -10);
  crateAt(1.02, -0.65 + 0, 0.0001, 0);
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 8), "#8a5a2c", { at: [0.45, G + 0.06, -1.0] });
  for (const y of [0.03, 0.09])
    b.part(new THREE.CylinderGeometry(0.063, 0.063, 0.012, 8), WOOD_D, { at: [0.45, G + y, -1.0] });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.008, 8), "#3b2a1a", { at: [0.45, G + 0.122, -1.0] });
  // sacks
  for (let i = 0; i < 3; i++) {
    const sx = 0.2 + i * 0.07;
    ball(V(sx, G + 0.045, -1.05 + (i % 2) * 0.05), 0.055, i % 2 ? "#d8b98a" : "#c9a874", [1, 1.1, 0.9], 7, 5);
    ball(V(sx, G + 0.105, -1.05 + (i % 2) * 0.05), 0.014, "#b38c5a");
  }

  // ---------- campfire ----------
  const cfx = -0.47;
  const cfz = -0.78;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.part(new THREE.IcosahedronGeometry(0.03, 0), i % 2 ? STONE_A : STONE_C, {
      at: [cfx + Math.cos(a) * 0.09, G + 0.015, cfz + Math.sin(a) * 0.09],
      scale: [1, 0.7, 1],
      rotation: [0, i * 40, 0],
    });
  }
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI + 0.4;
    b.rod(V(cfx + Math.cos(a) * 0.075, G + 0.02, cfz + Math.sin(a) * 0.075), V(cfx - Math.cos(a) * 0.075, G + 0.035, cfz - Math.sin(a) * 0.075), 0.014, i % 2 ? WOOD : WOOD_D, { sides: 6 });
  }
  glow(b.spike(V(cfx, G + 0.03, cfz), V(cfx, G + 0.15, cfz), null, 0.04, "#ff8a1f", { sides: 5 }), 1.5);
  glow(b.spike(V(cfx + 0.02, G + 0.03, cfz + 0.01), V(cfx + 0.02, G + 0.2, cfz + 0.01), null, 0.022, "#ffd23a", { sides: 5 }), 1.6);
  glow(b.spike(V(cfx - 0.03, G + 0.03, cfz - 0.02), V(cfx - 0.03, G + 0.12, cfz - 0.02), null, 0.02, "#ff5a1f", { sides: 5 }), 1.4);
  // tripod and kettle
  for (let i = 0; i < 3; i++) {
    const a = rad(i * 120 + 20);
    b.rod(V(cfx + Math.cos(a) * 0.15, G, cfz + Math.sin(a) * 0.15), V(cfx, G + 0.28, cfz), 0.007, WOOD_D, { sides: 5 });
  }
  b.rod(V(cfx, G + 0.28, cfz), V(cfx, G + 0.22, cfz), 0.003, "#4a4a52", { sides: 4 });
  b.lathe(
    [
      [0, 0],
      [0.045, 0],
      [0.058, 0.04],
      [0.042, 0.085],
      [0.015, 0.1],
      [0, 0.1],
    ],
    { at: [cfx, G + 0.17, cfz], segments: 8, color: "#5b5f6e" },
  );
  b.spike(V(cfx + 0.04, G + 0.2, cfz), V(cfx + 0.1, G + 0.27, cfz), null, 0.014, "#5b5f6e", { sides: 5 });
  // log seats
  b.rod(V(cfx + 0.28, G + 0.04, cfz + 0.1), V(cfx + 0.28, G + 0.04, cfz + 0.3), 0.04, WOOD, { sides: 7 });
  ball(V(cfx + 0.28, G + 0.04, cfz + 0.3), 0.036, "#d9b27a", [1, 1, 0.2], 7, 3);

  // ---------- cacti ----------
  const cactus = (x: number, z: number, h: number) => {
    const g = "#4f9a52";
    b.rod(V(x, G, z), V(x, G + h, z), [0.05, 0.04], g, { sides: 6, caps: { start: "flat", end: "round" } });
    b.sweep([V(x + 0.03, G + h * 0.4, z), V(x + 0.12, G + h * 0.45, z), V(x + 0.13, G + h * 0.75, z)], 0.026, g, { sides: 6 });
    b.sweep([V(x - 0.03, G + h * 0.55, z), V(x - 0.1, G + h * 0.6, z), V(x - 0.11, G + h * 0.8, z)], 0.022, g, { sides: 6 });
    ball(V(x, G + h + 0.03, z), 0.022, PINK);
    ball(V(x + 0.13, G + h * 0.75 + 0.03, z), 0.018, "#ffd23a");
    for (let i = 0; i < 6; i++) {
      const a = i * 1.05;
      b.spike(V(x + Math.cos(a) * 0.045, G + h * (0.2 + 0.1 * i), z + Math.sin(a) * 0.045), V(x + Math.cos(a) * 0.08, G + h * (0.22 + 0.1 * i), z + Math.sin(a) * 0.08), null, 0.004, CREAM, { sides: 3 });
    }
  };
  cactus(-1.12, 0.2, 0.3);
  cactus(-0.15, 0.95, 0.18);
  // rocks
  const rocks: Array<[number, number, number]> = [
    [0.95, 0.65, 0.1],
    [1.05, 0.55, 0.06],
    [0.85, 0.8, 0.05],
    [-0.35, -1.05, 0.07],
  ];
  rocks.forEach(([x, z, s], i) =>
    b.part(new THREE.IcosahedronGeometry(s, 0), [STONE_A, STONE_B, STONE_C][i % 3], {
      at: [x, G + s * 0.4, z],
      scale: [1.2, 0.8, 1],
      rotation: [10 * i, 40 * i, 0],
    }),
  );
  // signpost
  const SX = 0.15;
  const SZ = 0.92;
  b.rod(V(SX, G, SZ), V(SX, G + 0.34, SZ), 0.012, WOOD, { sides: 5 });
  ball(V(SX, G + 0.355, SZ), 0.016, GOLD);
  b.extrude(
    [
      [0, 0],
      [0.2, 0],
      [0.25, 0.035],
      [0.2, 0.07],
      [0, 0.07],
    ],
    { at: V(SX, G + 0.22, SZ + 0.013), x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, color: "#b9854a" },
  );
  const signTex = svg(
    `<svg viewBox="0 0 40 16"><rect width="40" height="16" fill="#00000000"/><path d="M6 14 Q6 8 8 4 M8 4 L3 6 M8 4 L12 6 M8 4 L9 1 M8 4 L5 2" stroke="#2f7a3a" stroke-width="1.6" fill="none"/><path d="M16 11 q3 -3 6 0 t6 0 t6 0" stroke="#2b8f94" stroke-width="1.6" fill="none"/><circle cx="35" cy="5" r="2.6" fill="#e8a63a"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.2, 0.06), "#ffffff", { at: [SX + 0.1, G + 0.255, SZ + 0.021], dir: [0, 0, 1], axis: "z", texture: signTex });

  // ---------- camels ----------
  const camel = (cx: number, cz: number, face: number, kneel: boolean, blanket: Paint, packs: boolean) => {
    const L = frameAt(cx, cz, face);
    const X = dirX(face);
    const dy = kneel ? -0.2 : 0;
    b.capsule(L(0, 0.36 + dy, -0.2), L(0, 0.36 + dy, 0.2), [0.1, 0.105], COAT, { sides: 8 });
    ball(L(0, 0.5 + dy, -0.04), 0.085, COAT, [1, 1, 1.1], 7, 5);
    // belly lighter patch
    ball(L(0, 0.29 + dy, 0.0), 0.07, "#e0c08a", [1, 0.5, 3], 6, 4);
    const neck = catmull([L(0, 0.4 + dy, 0.2), L(0, 0.52 + dy, 0.3), L(0, 0.66 + dy, 0.33), L(0, 0.73 + dy, 0.37)]);
    b.sweep(neck, [0.06, 0.04], COAT, { sides: 7 });
    for (let i = 1; i < 6; i++) {
      const p = neck.at(i / 6);
      b.spike(p, p.clone().add(V(0, 0.035, 0)), null, 0.014, COAT_D, { sides: 4 });
    }
    // head
    b.capsule(L(0, 0.76 + dy, 0.39), L(0, 0.735 + dy, 0.47), [0.048, 0.038], COAT, { sides: 7 });
    ball(L(0, 0.725 + dy, 0.495), 0.037, "#ead3a2", [1.1, 0.9, 1.1], 7, 5);
    b.rod(L(0, 0.712 + dy, 0.5), L(0, 0.7 + dy, 0.532), 0.003, "#6a4a30", { sides: 3 });
    for (const s of [1, -1]) {
      ball(L(s * 0.014, 0.737 + dy, 0.529), 0.007, "#2a1a14");
      ball(L(s * 0.043, 0.778 + dy, 0.425), 0.015, "#fff6e0");
      ball(L(s * 0.049, 0.78 + dy, 0.432), 0.009, "#241a22");
      ball(L(s * 0.052, 0.784 + dy, 0.436), 0.0035, "#ffffff", undefined, 4, 3);
      ball(L(s * 0.048, 0.748 + dy, 0.455), 0.012, "#f29a8f", [1, 0.8, 1], 5, 3);
      b.spike(L(s * 0.032, 0.8 + dy, 0.37), L(s * 0.05, 0.86 + dy, 0.35), null, 0.016, COAT_D, { sides: 5 });
      b.spike(L(s * 0.034, 0.805 + dy, 0.372), L(s * 0.048, 0.845 + dy, 0.358), null, 0.009, "#e8a08a", { sides: 4 });
    }
    b.spike(L(0, 0.8 + dy, 0.39), L(0, 0.86 + dy, 0.37), null, 0.016, COAT_D, { sides: 5 });
    // legs
    for (const s of [1, -1]) {
      if (!kneel) {
        const kF = L(s * 0.08, 0.17, 0.17);
        b.rod(L(s * 0.075, 0.33, 0.16), kF, [0.035, 0.026], COAT, { sides: 6 });
        b.rod(kF, L(s * 0.08, 0.03, 0.16), [0.024, 0.02], COAT, { sides: 6 });
        ball(kF, 0.028, COAT_D, undefined, 6, 4);
        const kR = L(s * 0.085, 0.2, -0.21);
        b.rod(L(s * 0.075, 0.34, -0.15), kR, [0.04, 0.026], COAT, { sides: 6 });
        b.rod(kR, L(s * 0.08, 0.03, -0.16), [0.024, 0.02], COAT, { sides: 6 });
        ball(kR, 0.028, COAT_D, undefined, 6, 4);
        b.part(new THREE.BoxGeometry(0.055, 0.032, 0.07), HOOF, { at: L(s * 0.08, 0.013, 0.17), rotation: [0, face, 0] });
        b.part(new THREE.BoxGeometry(0.055, 0.032, 0.07), HOOF, { at: L(s * 0.08, 0.013, -0.15), rotation: [0, face, 0] });
      } else {
        b.rod(L(s * 0.09, 0.045, 0.3), L(s * 0.09, 0.045, 0.05), [0.03, 0.035], COAT, { sides: 6 });
        b.rod(L(s * 0.09, 0.045, -0.3), L(s * 0.09, 0.045, -0.04), [0.03, 0.04], COAT, { sides: 6 });
        ball(L(s * 0.09, 0.05, 0.31), 0.03, COAT_D, undefined, 6, 4);
        b.part(new THREE.BoxGeometry(0.05, 0.03, 0.06), HOOF, { at: L(s * 0.09, 0.012, 0.02), rotation: [0, face, 0] });
        b.part(new THREE.BoxGeometry(0.05, 0.03, 0.06), HOOF, { at: L(s * 0.09, 0.012, -0.34), rotation: [0, face, 0] });
      }
    }
    // tail
    b.sweep(catmull([L(0, 0.42 + dy, -0.3), L(0, 0.35 + dy, -0.38), L(0, 0.22 + dy, -0.4)]), [0.016, 0.01], COAT, { sides: 5 });
    ball(L(0, 0.2 + dy, -0.4), 0.026, COAT_D, [1, 1.5, 1], 5, 4);
    // blanket
    b.extrude(
      [
        [-0.118, 0.24],
        [-0.118, 0.36],
        [-0.08, 0.455],
        [0, 0.485],
        [0.08, 0.455],
        [0.118, 0.36],
        [0.118, 0.24],
        [0.09, 0.27],
        [-0.09, 0.27],
      ],
      {
        at: L(0, dy, -0.04),
        x: X,
        y: [0, 1, 0],
        thickness: 0.15,
        color: paint((_p, _n, s) => {
          const k = Math.floor((s[1] + 5) / 0.035) % 4;
          return k === 0 ? RED : k === 2 ? GOLD : k === 1 ? CREAM : TEAL;
        }),
      },
    );
    void blanket;
    for (const s of [1, -1])
      for (let i = 0; i < 4; i++) {
        ball(L(s * 0.12, 0.225 + dy, -0.04 - 0.06 + i * 0.04), 0.012, GOLD, undefined, 5, 3);
      }
    // bell and garland
    b.sweep(ringPath(0, 0, 0, 0.05, 8).slice(0, 1), 0.001, GOLD).meshes.length;
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      ball(L(Math.cos(a) * 0.058, 0.545 + dy + 0.0, 0.265 + Math.sin(a) * 0.0 + 0.02), 0.0001, GOLD);
    }
    const gp = neck.at(0.25);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ball(V(gp.x + Math.cos(a) * 0.058 * Math.cos(rad(face)), gp.y + Math.sin(a) * 0.058, gp.z - Math.cos(a) * 0.058 * Math.sin(rad(face))), 0.013, i % 2 ? PINK : "#ffd23a", undefined, 5, 3);
    }
    ball(L(0, 0.46 + dy, 0.31), 0.02, GOLD);
    if (packs) {
      for (const s of [1, -1]) {
        ball(L(s * 0.17, 0.36 + dy, 0.0), 0.085, s > 0 ? "#d8b98a" : "#c9a874", [0.8, 1.1, 1], 7, 5);
        b.rod(L(s * 0.17, 0.44 + dy, 0.0), L(0, 0.57 + dy, -0.04), 0.007, WOOD_D, { sides: 4 });
        ball(L(s * 0.17, 0.43 + dy, 0.0), 0.016, "#b38c5a");
      }
      b.rod(L(-0.1, 0.58 + dy, -0.15), L(0.1, 0.58 + dy, -0.15), 0.035, RED, { sides: 8 });
      for (const s of [1, -1]) b.rod(L(s * 0.1, 0.58 + dy, -0.15), L(s * 0.105, 0.58 + dy, -0.15), 0.03, CREAM, { sides: 8 });
    } else {
      b.rod(L(0, 0.55 + dy, -0.04), L(0, 0.575 + dy, -0.04), 0.07, CREAM, { sides: 8 });
    }
  };
  const bl = stripes("#d9503f", "#f7e8c4", { size: 0.04, axis: "y" });
  const cA = { x: -0.62, z: 0.72 };
  camel(cA.x, cA.z, yawTo(cA.x, cA.z, PX, PZ), false, bl, false);
  const cB = { x: 0.95, z: 0.3 };
  camel(cB.x, cB.z, yawTo(cB.x, cB.z, PX, PZ) + 25, true, bl, true);

  // palm tuft & bones decor: sun-bleached horns near dune
  b.sweep(catmull([V(-0.35, G, -1.05), V(-0.33, G + 0.05, -1.05), V(-0.28, G + 0.1, -1.05)]), [0.012, 0.004], CREAM, { sides: 5 });

  return b.root;
}
