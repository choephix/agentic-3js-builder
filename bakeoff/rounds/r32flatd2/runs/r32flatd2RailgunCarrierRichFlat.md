```ts
import * as THREE from "three";
import { createBuilder, catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Six-wheeled railgun carrier",
  description:
    "Low-poly sci-fi military 6x6 carrier with a rear-mounted elevated railgun turret and four deployed stabiliser outriggers with ground pads.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });

  // ---------- palette ----------
  const OLIVE = "#5d6b3e";
  const OLIVE_D = "#414c2b";
  const OLIVE_L = "#7a8a52";
  const TAN = "#9a8a5a";
  const GUN = "#363c45";
  const GUN_D = "#23272d";
  const STEEL = "#8b949f";
  const TIRE = "#1a1c1f";
  const YELLOW = "#e2b61c";
  const BLACK = "#16181a";
  const CYAN = "#52e6ff";
  const RED = "#d93a2f";
  const WHITE = "#e8e8e0";
  const GLASS = "#1b4a5c";
  const LAMP = "#fff1b0";

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, color: string, at: V, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: V, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, ...o });
  const ball = (r: number, color: string, at: V) => b.part(new THREE.SphereGeometry(r, 8, 6), color, { at });
  const lerp3 = (a: V, c: V, t: number): V => [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];

  // barrel axis: slight elevation, y rises with z
  const SLOPE = 0.08125;
  const P = (z: number, x = 0, dy = 0): V => [x, 3.1 + SLOPE * (z + 1.2) + dy, z];
  const D: V = [0, 0.65, 8];

  // ---------- hull ----------
  box(2.2, 0.35, 9.0, GUN_D, [0, 0.7, 0]); // underbelly
  box(2.5, 0.7, 9.0, OLIVE, [0, 1.15, 0]); // main hull
  box(2.9, 0.3, 6.0, OLIVE_D, [0, 1.65, -1.5]); // rear deck
  box(2.3, 0.12, 1.0, GUN, [0, 1.56, 2.0]); // engine deck
  for (let i = 0; i < 5; i++) box(2.1, 0.03, 0.06, BLACK, [0, 1.63, 1.65 + i * 0.17]);
  // deck edge trim and hull panel lines
  for (const s of [1, -1]) {
    box(0.1, 0.12, 6.0, OLIVE_L, [s * 1.5, 1.82, -1.5]);
    box(0.05, 0.5, 0.05, BLACK, [s * 1.26, 1.15, 0.6]);
    box(0.05, 0.5, 0.05, BLACK, [s * 1.26, 1.15, 3.0]);
    box(0.05, 0.5, 0.05, BLACK, [s * 1.26, 1.15, -2.2]);
    // side vents
    for (let i = 0; i < 4; i++) box(0.04, 0.05, 0.7, BLACK, [s * 1.27, 1.0 + i * 0.11, -3.6]);
    // storage lockers between wheels
    box(0.22, 0.5, 1.3, TAN, [s * 1.36, 1.1, -1.3]);
    box(0.04, 0.12, 0.2, GUN_D, [s * 1.48, 1.2, -1.3]);
    box(0.04, 0.04, 1.2, OLIVE_D, [s * 1.48, 0.95, -1.3]);
    // armour plate near cab
    box(0.08, 0.55, 1.1, OLIVE_L, [s * 1.29, 1.17, 3.7]);
  }

  // bumpers
  box(2.7, 0.4, 0.35, GUN, [0, 1.0, 4.62]);
  box(2.7, 0.4, 0.3, GUN, [0, 1.0, -4.65]);
  for (let i = 0; i < 6; i++) {
    const c = i % 2 ? BLACK : YELLOW;
    box(0.4, 0.4, 0.04, c, [-1.0 + i * 0.4, 1.0, 4.8]);
    box(0.4, 0.4, 0.04, c, [-1.0 + i * 0.4, 1.0, -4.82]);
  }
  cyl(0.12, 0.12, 1.0, 8, STEEL, [0, 0.8, 4.75], { dir: [1, 0, 0] }); // winch drum
  for (const s of [1, -1]) {
    glow(box(0.4, 0.2, 0.08, LAMP, [s * 1.05, 1.2, 4.52]), 1.4); // headlights
    glow(box(0.3, 0.15, 0.06, RED, [s * 1.0, 1.25, -4.52]), 1.2); // tail lights
    box(0.12, 0.12, 0.2, STEEL, [s * 0.6, 0.85, -4.9]); // tow eyes
  }

  // ---------- cab ----------
  b.extrude(
    [
      [-0.9, 0],
      [0.9, 0],
      [0.9, 0.5, "sharp"],
      [0.45, 1.0, "sharp"],
      [-0.9, 1.0],
    ],
    { at: [0, 1.5, 3.5], x: [0, 0, 1], thickness: 2.4, color: OLIVE },
  );
  glow(box(2.0, 0.62, 0.05, GLASS, [0, 2.25, 4.2], { dir: [0, 0.5, -0.45], axis: "y" }), 0.6);
  box(2.1, 0.07, 0.07, GUN_D, [0, 2.0, 4.42], { rotation: [0, 0, 0] });
  // grille
  box(1.1, 0.3, 0.05, GUN_D, [0, 1.72, 4.42]);
  for (let i = 0; i < 5; i++) box(1.0, 0.025, 0.07, STEEL, [0, 1.62 + i * 0.07, 4.43]);
  for (const s of [1, -1]) {
    glow(box(0.04, 0.38, 0.8, GLASS, [s * 1.21, 2.0, 3.55]), 0.6); // side window
    box(0.04, 0.45, 0.03, BLACK, [s * 1.21, 1.9, 3.1]);
    box(0.04, 0.45, 0.03, BLACK, [s * 1.21, 1.9, 4.05]);
    box(0.05, 0.05, 0.16, STEEL, [s * 1.22, 1.75, 3.2]); // door handle
    b.rod([s * 1.2, 2.1, 4.1], [s * 1.45, 2.25, 4.15], 0.02, STEEL);
    box(0.06, 0.25, 0.16, GUN, [s * 1.48, 2.25, 4.15]); // mirror
    box(0.3, 0.16, 0.06, TAN, [s * 1.0, 1.58, 4.43]); // plate
    cyl(0.12, 0.12, 1.0, 8, GUN, [s * 1.1, 2.0, 2.3]); // exhaust stack
    cyl(0.15, 0.15, 0.08, 8, GUN_D, [s * 1.1, 2.52, 2.3]);
    cyl(0.08, 0.08, 0.02, 8, BLACK, [s * 1.1, 2.57, 2.3]);
  }
  // roof gear: radar, antenna
  b.rod([-0.8, 2.5, 3.2], [-0.8, 2.75, 3.2], 0.04, STEEL);
  b.lathe(
    [
      [0, 0],
      [0.28, 0.1],
      [0.28, 0.13],
      [0, 0.05],
    ],
    { at: [-0.8, 2.8, 3.2], axis: [0, 0.6, 0.8], segments: 10, color: STEEL },
  );
  b.rod([-0.8, 2.8, 3.2], [-0.8, 2.95, 3.5], 0.015, GUN_D);
  b.rod([1.0, 2.5, 3.0], [1.0, 3.1, 3.0], 0.015, GUN_D);
  glow(ball(0.04, RED, [1.0, 3.12, 3.0]), 1.5);
  box(0.4, 0.1, 0.3, GUN, [0.8, 2.55, 3.0]);

  // ---------- running gear ----------
  const wheelZ = [3.2, 0.2, -2.8];
  const wy = 0.62;
  for (const z of wheelZ) {
    b.rod([-1.5, wy, z], [1.5, wy, z], 0.1, STEEL);
    ball(0.3, GUN, [0, wy, z]);
    for (const s of [1, -1]) {
      const x = s * 1.5;
      cyl(0.58, 0.58, 0.5, 16, TIRE, [x, wy, z], { dir: [1, 0, 0] });
      cyl(0.4, 0.4, 0.52, 12, GUN, [x, wy, z], { dir: [1, 0, 0] });
      cyl(0.2, 0.2, 0.58, 10, STEEL, [x, wy, z], { dir: [1, 0, 0] });
      cyl(0.09, 0.09, 0.62, 8, GUN_D, [x, wy, z], { dir: [1, 0, 0] });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        cyl(0.03, 0.03, 0.06, 6, YELLOW, [x + s * 0.3, wy + Math.cos(a) * 0.29, z + Math.sin(a) * 0.29], { dir: [1, 0, 0] });
      }
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        box(0.52, 0.08, 0.16, TIRE, [x, wy + Math.cos(a) * 0.58, z + Math.sin(a) * 0.58], {
          rotation: [(a * 180) / Math.PI, 0, 0],
        });
      }
      box(0.7, 0.1, 1.5, OLIVE_D, [x, 1.33, z]); // fender
      box(0.06, 0.2, 1.5, OLIVE_D, [s * 1.83, 1.25, z]);
    }
  }

  // ---------- stabiliser outriggers ----------
  for (const s of [1, -1]) {
    for (const zz of [1.7, -4.0]) {
      box(1.6, 0.3, 0.45, OLIVE_D, [s * 1.9, 1.1, zz]);
      box(0.3, 0.5, 0.6, GUN, [s * 1.15, 1.1, zz]); // hull socket
      for (let i = 0; i < 7; i++)
        box(0.2, 0.03, 0.4, i % 2 ? BLACK : YELLOW, [s * (1.3 + 0.2 * i), 1.265, zz]);
      const a: V = [s * 2.7, 1.2, zz];
      const f: V = [s * 2.95, 0.14, zz];
      b.rod(a, lerp3(a, f, 0.55), 0.15, YELLOW);
      b.rod(lerp3(a, f, 0.45), f, 0.09, STEEL);
      ball(0.17, GUN, a);
      b.rod([s * 1.6, 0.95, zz], lerp3(a, f, 0.6), 0.06, GUN);
      cyl(0.42, 0.5, 0.14, 8, GUN_D, [s * 2.95, 0.07, zz]);
      cyl(0.3, 0.3, 0.03, 8, YELLOW, [s * 2.95, 0.15, zz]);
      ball(0.13, STEEL, f);
    }
  }

  // ---------- turret ----------
  cyl(1.1, 1.1, 0.25, 14, GUN, [0, 1.925, -1.2]);
  box(2.0, 0.9, 2.8, OLIVE, [0, 2.5, -1.2]);
  box(1.6, 0.6, 0.4, GUN, [0, 2.7, 0.35]); // mantlet
  box(1.9, 0.12, 2.6, OLIVE_L, [0, 2.99, -1.2]); // roof plate
  for (const s of [1, -1]) {
    box(0.12, 0.7, 2.4, TAN, [s * 1.06, 2.45, -1.2]); // side armour
    // roundel emblem
    cyl(0.3, 0.3, 0.03, 14, WHITE, [s * 1.13, 2.5, -0.5], { dir: [1, 0, 0] });
    cyl(0.2, 0.2, 0.04, 14, RED, [s * 1.13, 2.5, -0.5], { dir: [1, 0, 0] });
    // chevrons
    for (let i = 0; i < 3; i++) box(0.03, 0.08, 0.5, YELLOW, [s * 1.13, 2.25 + i * 0.0, -1.5 + i * 0.0 - 0.0 + 0], { rotation: [0, 0, 0] });
    box(0.03, 0.55, 0.06, BLACK, [s * 1.13, 2.45, -1.9]);
    box(0.03, 0.55, 0.06, BLACK, [s * 1.13, 2.45, -1.75]);
    // cradle arms and elevation rams
    box(0.2, 0.6, 1.4, GUN, [s * 0.5, 3.15, -1.0]);
    b.capsule([s * 0.7, 2.95, -0.2], P(1.5, s * 0.4, -0.22), 0.07, STEEL);
    b.capsule([s * 0.95, 3.0, -2.2], P(-1.0, s * 0.45, -0.1), 0.05, STEEL);
  }
  cyl(0.3, 0.3, 0.1, 10, GUN_D, [0.6, 3.04, -1.9]); // hatch
  cyl(0.22, 0.22, 0.05, 10, STEEL, [0.6, 3.1, -1.9]);
  glow(ball(0.1, CYAN, [-0.6, 3.1, -0.2]), 1.2); // sensor
  box(0.3, 0.2, 0.3, GUN, [-0.6, 3.02, -0.2]);

  // ---------- railgun ----------
  box(1.1, 0.95, 0.9, GUN, P(-2.55), { dir: D, axis: "z" }); // breech
  for (let i = 0; i < 5; i++) box(1.0, 0.04, 0.12, STEEL, P(-2.85 + i * 0.16, 0, 0.5), { dir: D, axis: "z" });
  glow(box(0.5, 0.1, 0.06, CYAN, P(-3.04, 0, 0.1), { dir: D, axis: "z" }), 1.3);
  for (const s of [1, -1]) {
    b.frustumBox(P(-2.0, s * 0.22), P(6.8, s * 0.22), [0.2, 0.36], [0.2, 0.36], { color: STEEL });
    glow(b.frustumBox(P(-1.0, s * 0.115), P(6.7, s * 0.115), [0.03, 0.26], [0.03, 0.26], { color: CYAN }), 1.4);
  }
  for (let i = 0; i < 9; i++) {
    const z = 0.6 + i * 0.68;
    box(0.9, 0.78, 0.18, i % 2 ? GUN : GUN_D, P(z), { dir: D, axis: "z" });
    glow(box(0.62, 0.04, 0.2, CYAN, P(z, 0, 0.4), { dir: D, axis: "z" }), 1.3);
    box(0.94, 0.12, 0.1, YELLOW, P(z + 0.22, 0, -0.2), { dir: D, axis: "z" });
  }
  box(0.95, 0.85, 0.7, GUN, P(6.7), { dir: D, axis: "z" }); // muzzle housing
  box(0.28, 0.3, 0.06, BLACK, P(7.06), { dir: D, axis: "z" });
  glow(box(0.6, 0.06, 0.05, CYAN, P(7.07, 0, 0.3), { dir: D, axis: "z" }), 1.5);
  glow(box(0.6, 0.06, 0.05, CYAN, P(7.07, 0, -0.3), { dir: D, axis: "z" }), 1.5);

  // ---------- capacitor bank + cabling ----------
  for (const s of [1, -1]) {
    for (const x of [0.65, 1.2]) {
      cyl(0.24, 0.24, 1.6, 10, x > 1 ? OLIVE_L : TAN, [s * x, 2.08, -3.6], { dir: [0, 0, 1] });
      cyl(0.25, 0.25, 0.08, 10, GUN_D, [s * x, 2.08, -2.78], { dir: [0, 0, 1] });
      glow(cyl(0.16, 0.16, 0.04, 10, CYAN, [s * x, 2.08, -4.42], { dir: [0, 0, 1] }), 1.2);
    }
    b.sweep(
      catmull([[s * 0.65, 2.3, -3.0], [s * 0.6, 2.7, -3.0], [s * 0.5, 2.85, -2.6], P(-2.4, s * 0.45, -0.2)]),
      0.04,
      { color: BLACK },
    );
  }
  // rear ladder and antennas
  for (const s of [1, -1]) {
    b.rod([s * 0.9, 1.0, -4.55], [s * 0.9, 2.0, -4.55], 0.03, STEEL);
    b.rod([s * 1.4, 1.9, -4.4], [s * 1.4, 3.0, -4.4], 0.015, GUN_D);
    glow(ball(0.04, RED, [s * 1.4, 3.02, -4.4]), 1.5);
  }
  for (let i = 0; i < 4; i++) b.rod([-0.9, 1.3 + i * 0.25, -4.55], [0.9, 1.3 + i * 0.25, -4.55], 0.025, STEEL);

  // ---------- floor weld/dirt: mud at wheel bottoms ----------
  for (const z of wheelZ) for (const s of [1, -1]) box(0.52, 0.1, 0.9, "#5a4a33", [s * 1.5, 0.1, z]);

  return b.root;
}
```