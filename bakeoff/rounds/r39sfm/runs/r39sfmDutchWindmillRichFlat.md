```ts
import * as THREE from "three";
import { createBuilder, polyline, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dutch Windmill",
  description: "A cosy Animal Crossing style Dutch windmill with a brick base, round red cap, gallery, cloth sails and a fantail.",
};

// Palette: soft, warm, Animal Crossing
const WALL = "#f7ebd0";
const WALL_SH = "#efdcb4";
const BRICK = "#e69a82";
const BRICK_D = "#c9695a";
const ROOF = "#e5574c";
const ROOF_D = "#c43f3d";
const TRIM = "#fffaf0";
const WOOD = "#9a6240";
const WOOD_L = "#c68a58";
const WOOD_D = "#6e4329";
const STONE = "#bdb7aa";
const STONE_D = "#a09a8e";
const TEAL = "#63bfae";
const GLASS = "#ffe28c";
const GOLD = "#f5c542";
const CLOTH = "#fff3dc";
const CLOTH_R = "#f08a7e";
const LEAF = "#6fbf6a";
const FLOWERS = ["#ff8fb5", "#ffd84d", "#ffffff", "#b79cff"];
const POT = "#d9835a";

const R0 = 1.5;
const R1 = 0.95;
const Y0 = 0.25;
const H = 3.75;
const AP = Math.cos(Math.PI / 8);
const Rad = (y: number) => R0 + (R1 - R0) * ((y - Y0) / H);
const TILT = 0.134;

export default function build() {
  const b = createBuilder({ name: "windmill" });
  const rand = rng(11);

  const cyl8 = (rTop: number, rBot: number, h: number) => new THREE.CylinderGeometry(rTop, rBot, h, 8, 1);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const ball = (r: number, ws = 6, hs = 5) => new THREE.SphereGeometry(r, ws, hs);

  // ---- placement on the tapered octagon faces
  const nrm = (a: number): [number, number, number] => [Math.sin(a), 0, Math.cos(a)];
  const dirOf = (a: number): [number, number, number] => [Math.sin(a) * 0.991, TILT, Math.cos(a) * 0.991];
  const pl = (a: number, y: number, off = 0, lat = 0): [number, number, number] => {
    const ap = AP * Rad(y) + off;
    const n = nrm(a);
    const s = [Math.cos(a), 0, -Math.sin(a)];
    return [n[0] * ap + s[0] * lat, y, n[2] * ap + s[2] * lat];
  };
  const onFace = (g: THREE.BufferGeometry, color: string, a: number, y: number, off = 0, lat = 0) =>
    b.part(g, color, { at: pl(a, y, off, lat), dir: dirOf(a), axis: "z" });

  // ---- plinth and steps
  b.part(cyl8(1.85, 1.9, 0.25), STONE, { at: [0, 0.125, 0], rotation: [0, 22.5, 0], flat: true });
  b.part(cyl8(1.7, 1.85, 0.06), STONE_D, { at: [0, 0.27, 0], rotation: [0, 22.5, 0], flat: true });
  b.part(box(1.4, 0.2, 0.55), STONE, { at: [0, 0.1, 1.95] });
  b.part(box(1.1, 0.12, 0.35), STONE_D, { at: [0, 0.26, 1.68] });

  // ---- tower
  const baseTop = 1.5;
  b.part(cyl8(Rad(baseTop) * 1.02, R0 * 1.02, baseTop - Y0), BRICK, {
    at: [0, (Y0 + baseTop) / 2, 0], rotation: [0, 22.5, 0], flat: true,
  });
  b.part(cyl8(R1, Rad(baseTop), 4.0 - baseTop), WALL, {
    at: [0, (4.0 + baseTop) / 2, 0], rotation: [0, 22.5, 0], flat: true,
  });
  // brick courses
  for (const y of [0.5, 0.75, 1.0, 1.25]) {
    b.part(cyl8(Rad(y + 0.015) * 1.035, Rad(y - 0.015) * 1.035, 0.03), BRICK_D, {
      at: [0, y, 0], rotation: [0, 22.5, 0], flat: true,
    });
  }
  // base cornice
  b.part(cyl8(Rad(baseTop + 0.05) * 1.06, Rad(baseTop - 0.05) * 1.08, 0.1), TRIM, {
    at: [0, baseTop, 0], rotation: [0, 22.5, 0], flat: true,
  });
  // soft wall shading bands
  for (const y of [2.2, 3.1]) {
    b.part(cyl8(Rad(y + 0.02) * 1.012, Rad(y - 0.02) * 1.012, 0.04), WALL_SH, {
      at: [0, y, 0], rotation: [0, 22.5, 0], flat: true,
    });
  }
  // corner quoin posts on the upper tower
  for (let k = 0; k < 8; k++) {
    const th = ((22.5 + 45 * k) * Math.PI) / 180;
    const y = 2.75;
    const r = Rad(y) * 1.0;
    b.part(box(0.08, 2.2, 0.08), TRIM, {
      at: [Math.sin(th) * r, y, Math.cos(th) * r],
      rotation: [0, (th * 180) / Math.PI, 0],
    });
  }

  // ---- gallery
  b.part(cyl8(1.78, 1.85, 0.12), WOOD_L, { at: [0, 1.58, 0], rotation: [0, 22.5, 0], flat: true });
  b.part(cyl8(1.7, 1.78, 0.05), WOOD, { at: [0, 1.5, 0], rotation: [0, 22.5, 0], flat: true });
  const RR = 1.72;
  const verts: number[][] = [];
  for (let k = 0; k < 8; k++) {
    const th = ((22.5 + 45 * k) * Math.PI) / 180;
    verts.push([Math.sin(th) * RR, 2.0, Math.cos(th) * RR]);
    b.part(box(0.1, 0.42, 0.1), TRIM, { at: [Math.sin(th) * RR, 1.83, Math.cos(th) * RR] });
    const th2 = th + Math.PI / 8;
    const r2 = RR * AP;
    for (const f of [-0.5, 0, 0.5]) {
      const tt = th2 + f * 0.0;
      void tt;
    }
    b.part(box(0.06, 0.34, 0.06), TRIM, { at: [Math.sin(th2) * r2, 1.8, Math.cos(th2) * r2] });
  }
  b.sweep(polyline(verts, { closed: true }), 0.045, { color: WOOD_L, sides: 6, bone: undefined });
  const lowRail = verts.map((v) => [v[0], 1.8, v[2]]);
  b.sweep(polyline(lowRail, { closed: true }), 0.025, { color: TRIM, sides: 6 });

  // ---- roof (round cap)
  const roofY = 4.0;
  const profile: [number, number][] = [
    [0, 0], [1.18, 0], [1.22, 0.1], [1.12, 0.3], [0.88, 0.6], [0.52, 0.85], [0.2, 1.0], [0, 1.06],
  ];
  b.lathe(profile, { at: [0, roofY, 0], segments: 16, color: ROOF, smoothing: 0 });
  b.part(new THREE.TorusGeometry(1.2, 0.06, 5, 16), TRIM, { at: [0, roofY + 0.03, 0], rotation: [90, 0, 0] });
  for (const [r, y] of [[1.13, 0.3], [0.89, 0.6], [0.53, 0.85]] as const) {
    b.part(new THREE.TorusGeometry(r, 0.035, 4, 16), ROOF_D, { at: [0, roofY + y, 0], rotation: [90, 0, 0] });
  }
  b.part(ball(0.09, 8, 6), GOLD, { at: [0, roofY + 1.1, 0] });
  b.part(new THREE.ConeGeometry(0.04, 0.2, 6), GOLD, { at: [0, roofY + 1.25, 0] });

  // ---- door
  const doorY = 0.8;
  onFace(box(1.04, 1.16, 0.1), TRIM, 0, doorY - 0.0, 0.0);
  b.part(new THREE.CylinderGeometry(0.52, 0.52, 0.1, 14), TRIM, { at: pl(0, 1.38, 0), dir: dirOf(0) });
  onFace(box(0.84, 1.1, 0.1), WOOD_L, 0, doorY, 0.04);
  b.part(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 12), WOOD_L, { at: pl(0, 1.35, 0.04), dir: dirOf(0) });
  for (const lat of [-0.21, 0, 0.21]) onFace(box(0.03, 1.4, 0.04), WOOD, 0, 0.95, 0.09, lat);
  onFace(box(0.84, 0.05, 0.04), WOOD_D, 0, 0.55, 0.09);
  onFace(box(0.84, 0.05, 0.04), WOOD_D, 0, 1.1, 0.09);
  b.part(ball(0.045), GOLD, { at: pl(0, 0.85, 0.13, -0.3) });
  // heart on door
  onFace(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 6), CLOTH_R, 0, 1.35, 0.11, 0);

  // lantern by the door
  const lanternAt = pl(0, 1.25, 0.18, -0.85);
  b.part(box(0.28, 0.04, 0.04), WOOD_D, { at: pl(0, 1.5, 0.1, -0.85) });
  b.part(box(0.04, 0.04, 0.22), WOOD_D, { at: pl(0, 1.5, 0.12, -0.85) });
  b.part(box(0.04, 0.2, 0.04), WOOD_D, { at: pl(0, 1.4, 0.2, -0.85) });
  glow(b.part(box(0.15, 0.2, 0.15), GLASS, { at: lanternAt }), 1.4);
  b.part(new THREE.ConeGeometry(0.12, 0.1, 4), ROOF_D, { at: [lanternAt[0], lanternAt[1] + 0.15, lanternAt[2]], rotation: [0, 45, 0] });
  b.part(box(0.17, 0.03, 0.17), WOOD_D, { at: [lanternAt[0], lanternAt[1] - 0.11, lanternAt[2]] });

  // flower pots at the door
  for (const s of [-1, 1]) {
    const px = s * 0.95;
    const pz = 1.9;
    b.part(new THREE.CylinderGeometry(0.2, 0.14, 0.26, 8), POT, { at: [px, 0.33, pz - 0.15], flat: true });
    b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 8), BRICK_D, { at: [px, 0.48, pz - 0.15], flat: true });
    b.part(ball(0.17, 6, 4), LEAF, { at: [px, 0.6, pz - 0.15] });
    for (let i = 0; i < 4; i++) {
      const an = i * 1.6 + s;
      b.part(ball(0.06, 5, 4), FLOWERS[(i + (s > 0 ? 1 : 0)) % 4], {
        at: [px + Math.cos(an) * 0.1, 0.7 + (i % 2) * 0.06, pz - 0.15 + Math.sin(an) * 0.1],
      });
    }
  }

  // ---- windows
  const windowAt = (a: number, y: number, round = false) => {
    onFace(box(0.62, 0.8, 0.1), TRIM, a, y, 0);
    if (round) {
      b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 12), TRIM, { at: pl(a, y, 0), dir: dirOf(a) });
      glow(b.part(new THREE.CylinderGeometry(0.31, 0.31, 0.1, 12), GLASS, { at: pl(a, y, 0.03), dir: dirOf(a) }), 1.2);
      onFace(box(0.04, 0.62, 0.05), TRIM, a, y, 0.08);
      onFace(box(0.62, 0.04, 0.05), TRIM, a, y, 0.08);
      return;
    }
    glow(onFace(box(0.46, 0.64, 0.1), GLASS, a, y, 0.03), 1.2);
    onFace(box(0.04, 0.64, 0.05), TRIM, a, y, 0.08);
    onFace(box(0.46, 0.04, 0.05), TRIM, a, y, 0.08);
    for (const s of [-1, 1]) {
      onFace(box(0.22, 0.78, 0.06), TEAL, a, y, 0.06, s * 0.42);
      for (const dy of [-0.2, 0, 0.2]) onFace(box(0.16, 0.025, 0.03), "#4a9d8f", a, y + dy, 0.1, s * 0.42);
    }
    onFace(box(0.74, 0.07, 0.1), TRIM, a, y + 0.42, 0.02);
    // flower box
    onFace(box(0.78, 0.15, 0.2), WOOD, a, y - 0.52, 0.12);
    onFace(box(0.74, 0.04, 0.18), LEAF, a, y - 0.43, 0.12);
    for (let i = 0; i < 5; i++) {
      const lat = -0.3 + i * 0.15;
      onFace(ball(0.055, 5, 4), FLOWERS[Math.floor(rand() * 4)], a, y - 0.4 + (i % 2) * 0.03, 0.12, lat);
    }
  };
  const A = Math.PI / 4;
  for (const a of [-A, A, 2 * A, -2 * A, 3 * A, -3 * A]) windowAt(a, 2.6);
  windowAt(Math.PI, 2.6);
  windowAt(0, 3.3, true);
  windowAt(A, 0.95 + 0.0, false);
  windowAt(-A, 0.95, false);

  // ---- axle, hub, sails
  const hubY = 4.5;
  const HZ = 2.25;
  b.part(new THREE.CylinderGeometry(0.1, 0.1, HZ - 0.5, 8), WOOD_D, { at: [0, hubY, (HZ + 0.5) / 2], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.25, 0.28, 0.2, 8), WOOD, { at: [0, hubY, 0.95], dir: [0, 0, 1], flat: true });
  b.part(new THREE.CylinderGeometry(0.24, 0.24, 0.36, 8), WOOD, { at: [0, hubY, HZ], dir: [0, 0, 1], flat: true });
  b.part(new THREE.ConeGeometry(0.2, 0.3, 8), ROOF, { at: [0, hubY, HZ + 0.3], dir: [0, 0, 1] });
  b.part(ball(0.07, 6, 4), GOLD, { at: [0, hubY, HZ + 0.5] });

  const bar = (a: number, u0: number, u1: number, v: number, w: number, d: number, z: number, color: string) => {
    const r = (a * Math.PI) / 180;
    const u = (u0 + u1) / 2;
    b.part(box(u1 - u0, w, d), color, {
      at: [-Math.sin(r) * v + Math.cos(r) * u, hubY + Math.cos(r) * v + Math.sin(r) * u, z],
      rotation: [0, 0, a],
    });
  };
  const cross = (a: number, u: number, v0: number, v1: number, w: number, d: number, z: number, color: string) => {
    const r = (a * Math.PI) / 180;
    const v = (v0 + v1) / 2;
    b.part(box(v1 - v0, w, d), color, {
      at: [-Math.sin(r) * v + Math.cos(r) * u, hubY + Math.cos(r) * v + Math.sin(r) * u, z],
      rotation: [0, 0, a + 90],
    });
  };
  const L = 3.6;
  for (let k = 0; k < 4; k++) {
    const a = 20 + k * 90;
    bar(a, 0.25, L, 0, 0.15, 0.15, HZ + 0.02, WOOD_D);
    bar(a, 0.9, L, 1.0, 0.07, 0.09, HZ - 0.02, WOOD);
    bar(a, 0.9, L, 0.2, 0.06, 0.09, HZ - 0.02, WOOD);
    cross(a, 0.93, 0.2, 1.0, 0.07, 0.09, HZ - 0.02, WOOD);
    cross(a, L - 0.03, 0.2, 1.0, 0.07, 0.09, HZ - 0.02, WOOD);
    // cloth: alternate cream and rose panels
    const segs = 6;
    const w = (L - 0.96 - 0.06) / segs;
    for (let i = 0; i < segs; i++) {
      const u0 = 0.96 + i * w;
      bar(a, u0, u0 + w, 0.6, 0.76, 0.03, HZ - 0.03, i % 2 ? CLOTH_R : CLOTH);
    }
    for (let i = 1; i < segs; i++) cross(a, 0.96 + i * w, 0.22, 1.0, 0.04, 0.08, HZ - 0.01, TRIM);
    b.part(ball(0.08, 5, 4), GOLD, { at: [Math.cos((a * Math.PI) / 180) * (L + 0.02), hubY + Math.sin((a * Math.PI) / 180) * (L + 0.02), HZ + 0.02] });
  }

  // ---- fantail
  const FZ = -2.1;
  b.rod([0, hubY, -0.8], [0, hubY, FZ], 0.05, WOOD_D);
  b.rod([0, 3.95, -1.0], [0, hubY - 0.1, FZ], 0.04, WOOD);
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.14, 8), WOOD, { at: [0, hubY, FZ], dir: [0, 0, 1] });
  for (let k = 0; k < 6; k++) {
    const a = k * 60 + 15;
    const r = (a * Math.PI) / 180;
    const u = 0.42;
    b.part(box(0.6, 0.2, 0.03), k % 2 ? ROOF : TRIM, {
      at: [Math.cos(r) * u, hubY + Math.sin(r) * u, FZ - 0.04],
      rotation: [0, 0, a],
    });
  }
  b.part(ball(0.06, 5, 4), GOLD, { at: [0, hubY, FZ - 0.1] });

  // ---- little sacks of flour by the wall
  for (const [x, z, s] of [[-1.35, 1.35, 1], [-1.6, 1.0, 0.85]] as const) {
    b.part(new THREE.CylinderGeometry(0.17 * s, 0.24 * s, 0.38 * s, 7), "#efe0bd", { at: [x, 0.25 + 0.19 * s, z], flat: true });
    b.part(ball(0.13 * s, 6, 4), "#efe0bd", { at: [x, 0.25 + 0.4 * s, z] });
    b.part(new THREE.TorusGeometry(0.1 * s, 0.015, 4, 8), CLOTH_R, { at: [x, 0.25 + 0.34 * s, z], rotation: [90, 0, 0] });
  }

  return b.root;
}
```