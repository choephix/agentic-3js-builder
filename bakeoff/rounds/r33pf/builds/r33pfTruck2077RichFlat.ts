import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Aegis-77 Military Cyber Truck",
  description: "Low-poly cyberpunk armored 6x6 military truck from 2077 with neon trim, turret, rocket pods and sensors.",
};

export default function build() {
  const b = createBuilder({ name: "truck2077" });
  const HULL = "#3b4a3a", HULL2 = "#2c382d", DARK = "#15181d", STEEL = "#6b7480", TIRE = "#0e0f12";
  const NEON = "#19f0ff", PINK = "#ff2d9a", AMBER = "#ffb02e", GLASS = "#0b2a3a", WARN = "#e8d020", RED = "#d8202a";

  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[], flat = false) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: at as any, rotation: rot as any, flat });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: at as any, rotation: rot as any, flat: true });
  const lit = (w: number, h: number, d: number, c: string, at: number[], s = 1.5) =>
    glow(b.part(new THREE.BoxGeometry(w, h, d), c, { at: at as any }), s);

  const R = 0.62; // wheel radius
  const zs = [-2.6, -0.9, 1.9];
  // chassis
  box(2.3, 0.35, 7.4, DARK, [0, 0.95, -0.2]);
  box(2.0, 0.2, 7.0, STEEL, [0, 0.72, -0.2]);
  // wheels
  for (const s of [1, -1]) for (const z of zs) {
    cyl(R, R, 0.6, 10, TIRE, [s * 1.2, R, z], [0, 0, 90]);
    cyl(0.38, 0.38, 0.64, 8, STEEL, [s * 1.2, R, z], [0, 0, 90]);
    cyl(0.16, 0.16, 0.7, 6, AMBER, [s * 1.2, R, z], [0, 0, 90]);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.BoxGeometry(0.68, 0.08, 0.08), DARK, { at: [s * 1.2, R + Math.sin(a) * 0.28, z + Math.cos(a) * 0.28], rotation: [(-a * 180) / Math.PI, 0, 0] });
    }
    // fender
    box(0.8, 0.1, 1.5, HULL2, [s * 1.2, R * 2 + 0.12, z]);
    box(0.08, 0.35, 1.5, HULL2, [s * 1.58, R * 2 - 0.05, z]);
    box(0.08, 0.35, 1.5, HULL2, [s * 0.82, R * 2 - 0.05, z]);
    lit(0.03, 0.04, 1.3, NEON, [s * 1.63, R * 2 - 0.05, z]);
  }
  // hull body (rear bed)
  box(2.4, 0.9, 3.6, HULL, [0, 1.55, -2.0]);
  box(2.5, 0.12, 3.7, HULL2, [0, 2.06, -2.0]);
  for (const s of [1, -1]) {
    box(0.1, 0.5, 3.4, HULL2, [s * 1.22, 1.6, -2.0], [0, 0, 0]);
    for (let i = 0; i < 6; i++) box(0.04, 0.3, 0.3, DARK, [s * 1.28, 1.6, -3.3 + i * 0.55]);
    lit(0.03, 0.05, 3.3, i2c(s), [s * 1.285, 1.95, -2.0]);
  }
  function i2c(s: number) { return s > 0 ? NEON : PINK; }
  // cab
  box(2.3, 1.1, 2.4, HULL, [0, 1.7, 1.5]);
  box(2.1, 0.7, 1.4, HULL2, [0, 2.45, 1.2]);
  box(1.8, 0.1, 1.2, HULL2, [0, 2.85, 1.15], [-4, 0, 0]);
  box(2.2, 0.8, 1.1, HULL, [0, 1.35, 2.85], [0, 0, 0]);
  box(2.0, 0.45, 0.5, HULL2, [0, 2.0, 2.65], [-35, 0, 0]);
  // windshield + side windows
  glow(b.part(new THREE.BoxGeometry(1.9, 0.5, 0.06), GLASS, { at: [0, 2.5, 1.9], rotation: [-30, 0, 0] }), 0.5);
  for (const s of [1, -1]) {
    glow(b.part(new THREE.BoxGeometry(0.05, 0.45, 1.0), GLASS, { at: [s * 1.07, 2.5, 1.2] }), 0.5);
    box(0.06, 0.5, 0.08, DARK, [s * 1.09, 2.5, 0.65]);
    box(0.12, 0.2, 0.3, DARK, [s * 1.2, 2.2, 2.2]); // mirror
    // headlights
    lit(0.4, 0.12, 0.06, "#ffffff", [s * 0.7, 1.4, 3.42], 2);
    lit(0.25, 0.06, 0.06, AMBER, [s * 0.95, 1.2, 3.42]);
    // exhaust stacks
    cyl(0.07, 0.07, 1.6, 6, STEEL, [s * 1.15, 2.7, 0.35]);
    cyl(0.1, 0.07, 0.1, 6, DARK, [s * 1.15, 3.52, 0.35]);
  }
  // grille / bumper
  box(2.4, 0.5, 0.3, DARK, [0, 0.95, 3.45]);
  box(2.6, 0.2, 0.4, STEEL, [0, 0.62, 3.5]);
  for (let i = -4; i <= 4; i++) box(0.05, 0.4, 0.05, NEON, [i * 0.22, 1.0, 3.62]);
  for (let i = 0; i < 6; i++) box(0.22, 0.2, 0.05, i % 2 ? WARN : DARK, [-0.55 + i * 0.22, 0.62, 3.72]);
  // plow blades
  for (const s of [1, -1]) b.part(new THREE.ConeGeometry(0.2, 0.7, 4), STEEL, { at: [s * 1.1, 0.65, 3.8], rotation: [90, 45, 0], flat: true });
  // roof sensors
  box(0.9, 0.12, 0.7, DARK, [0, 3.0, 1.0]);
  cyl(0.05, 0.05, 0.9, 6, STEEL, [-0.7, 3.5, 0.8]);
  lit(0.1, 0.1, 0.1, RED, [-0.7, 4.0, 0.8], 2);
  cyl(0.3, 0.3, 0.05, 12, STEEL, [0.4, 3.3, 1.0], [-30, 0, 20]);
  b.part(new THREE.ConeGeometry(0.28, 0.2, 10), NEON, { at: [0.4, 3.38, 1.0], rotation: [-30, 0, 20], flat: true });
  // light bar
  for (let i = 0; i < 8; i++) lit(0.2, 0.1, 0.1, i % 2 ? PINK : NEON, [-0.8 + i * 0.23, 2.98, 1.7]);
  // turret
  cyl(0.8, 0.9, 0.2, 12, STEEL, [0, 2.2, -1.3]);
  box(1.1, 0.55, 1.3, HULL, [0, 2.6, -1.3]);
  box(0.9, 0.3, 0.6, HULL2, [0, 2.65, -0.55], [-8, 0, 0]);
  cyl(0.09, 0.09, 1.9, 8, DARK, [0, 2.7, 0.3], [90, 0, 0]);
  cyl(0.13, 0.13, 0.3, 8, STEEL, [0, 2.7, 1.3], [90, 0, 0]);
  lit(0.2, 0.12, 0.05, RED, [0.4, 2.75, -0.45], 2);
  for (const s of [1, -1]) {
    box(0.5, 0.45, 0.9, DARK, [s * 0.85, 2.7, -1.3]); // rocket pods
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++)
      cyl(0.07, 0.07, 0.05, 6, AMBER, [s * (0.7 + i * 0.2), 2.6 + j * 0.2 , -0.83], [90, 0, 0]);
    lit(0.03, 0.03, 0.8, PINK, [s * 0.62, 2.95, -1.3]);
  }
  // rear: cargo rack & drones
  for (let i = 0; i < 4; i++) box(2.2, 0.08, 0.1, STEEL, [0, 2.2, -3.4 + i * 0.2]);
  box(2.0, 0.5, 0.9, DARK, [0, 2.4, -3.0]);
  lit(1.8, 0.04, 0.04, NEON, [0, 2.7, -3.46]);
  // antennas
  for (const x of [-1, 1]) { cyl(0.025, 0.025, 2.2, 5, STEEL, [x * 1.0, 3.2, -3.5]); lit(0.07, 0.07, 0.07, AMBER, [x * 1.0, 4.35, -3.5], 2); }
  // tail lights + underglow
  lit(2.0, 0.1, 0.05, RED, [0, 1.15, -3.82], 2);
  for (const s of [1, -1]) cyl(0.15, 0.2, 0.3, 6, DARK, [s * 0.7, 0.9, -3.9], [90, 0, 0]);
  lit(1.8, 0.04, 6.6, NEON, [0, 0.55, -0.2], 1);
  // armor plates & hazard stripes
  const r = rng(5);
  for (const s of [1, -1]) for (let i = 0; i < 7; i++) {
    const z = -3.3 + i * 0.5;
    box(0.04, 0.2 + r() * 0.1, 0.35, i % 2 ? HULL2 : STEEL, [s * 1.24, 1.2, z]);
  }
  for (let i = 0; i < 5; i++) box(0.04, 0.12, 0.2, WARN, [1.26, 1.05, 1.0 + i * 0.3], [0, 0, 0]);
  // emblem
  lit(0.02, 0.35, 0.35, PINK, [1.26, 1.7, 0.7], 1.5);
  lit(0.02, 0.35, 0.35, PINK, [-1.26, 1.7, 0.7], 1.5);

  return b.root;
}
