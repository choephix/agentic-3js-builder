```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Aegis-77 Armored Hauler",
  description: "Low-poly cyberpunk militarized six-wheel truck from 2077 with neon trim, turret and armor plating.",
};

const HULL = "#2b3038", HULL2 = "#3a414c", DARK = "#14161b", PLATE = "#4a5361", OLIVE = "#4b5238";
const NEON = "#19f0ff", PINK = "#ff2d95", AMBER = "#ffb02e", RED = "#ff2a2a", TIRE = "#101114", RIM = "#8a93a3";
const GLASS = "#0c3a52", WARN = "#e8c31c";

export default function build() {
  const b = createBuilder({ name: "aegis77" });
  const r = rng(77);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z], rotation: rot });
  const gl = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, s = 1.4) =>
    glow(box(w, h, d, c, x, y, z), s);

  // chassis
  box(2.3, 0.35, 8.2, DARK, 0, 0.85, 0);
  box(2.1, 0.12, 7.8, HULL2, 0, 1.05, 0);
  // axles & wheels (six)
  const axles = [-3.0, -0.9, 3.0];
  for (const z of axles) {
    cyl(0.12, 0.12, 2.6, 8, RIM, 0, 0.62, z, [0, 0, 90]);
    for (const s of [1, -1]) {
      const x = s * 1.25;
      cyl(0.62, 0.62, 0.55, 12, TIRE, x, 0.62, z, [0, 0, 90]);
      cyl(0.36, 0.36, 0.58, 8, RIM, x, 0.62, z, [0, 0, 90]);
      cyl(0.16, 0.16, 0.62, 6, DARK, x, 0.62, z, [0, 0, 90]);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        box(0.05, 0.05, 0.05, AMBER, s * 1.55, 0.62 + Math.sin(a) * 0.26, z + Math.cos(a) * 0.26);
      }
      // fender
      box(0.5, 0.1, 1.5, PLATE, s * 1.2, 1.28, z);
      box(0.08, 0.35, 1.5, HULL, s * 1.45, 1.12, z);
      // hub neon ring
      gl(0.04, 0.9, 0.9, NEON, s * 1.55, 0.62, z, 0.8).mesh.scale.set(1, 1, 1);
    }
  }
  // cab
  box(2.3, 1.1, 2.4, HULL, 0, 1.75, 2.9);
  box(2.2, 0.7, 1.6, PLATE, 0, 2.55, 2.6);
  box(2.0, 0.25, 1.3, HULL2, 0, 3.0, 2.5, [-4, 0, 0]);
  // sloped hood
  box(2.2, 0.5, 1.7, HULL2, 0, 1.7, 4.2, [12, 0, 0]);
  box(2.3, 0.7, 0.4, PLATE, 0, 1.35, 5.1, [-10, 0, 0]);
  // windshield & side windows
  box(1.9, 0.55, 0.08, GLASS, 0, 2.55, 3.45, [-25, 0, 0]);
  gl(1.9, 0.04, 0.05, NEON, 0, 2.86, 3.5, 1);
  for (const s of [1, -1]) {
    box(0.06, 0.45, 1.1, GLASS, s * 1.12, 2.55, 2.6);
    box(0.12, 0.25, 0.9, DARK, s * 1.18, 2.1, 2.9);
    // headlights
    gl(0.4, 0.14, 0.08, "#eaffff", s * 0.75, 1.4, 5.3, 2);
    gl(0.3, 0.05, 0.06, NEON, s * 0.75, 1.55, 5.28, 1.5);
    // mirrors
    box(0.05, 0.4, 0.05, DARK, s * 1.35, 2.5, 3.5);
    box(0.08, 0.3, 0.2, HULL, s * 1.38, 2.7, 3.55);
    // shoulder armor spikes
    box(0.3, 0.2, 0.9, PLATE, s * 1.25, 2.4, 2.0, [0, 0, s * 10]);
    // exhaust stacks
    cyl(0.1, 0.12, 1.8, 8, DARK, s * 1.2, 2.7, 1.5);
    cyl(0.13, 0.13, 0.08, 8, RED, s * 1.2, 3.62, 1.5);
  }
  // grille / bumper
  box(2.1, 0.5, 0.2, DARK, 0, 1.0, 5.25);
  for (let i = -4; i <= 4; i++) box(0.06, 0.4, 0.05, i % 2 ? PINK : NEON, i * 0.22, 1.0, 5.37);
  box(2.5, 0.25, 0.35, WARN, 0, 0.6, 5.2);
  for (let i = -5; i <= 5; i += 2) box(0.18, 0.26, 0.37, DARK, i * 0.2, 0.6, 5.2, [0, 0, 30]);
  // roof light bar
  box(1.6, 0.12, 0.25, DARK, 0, 3.17, 2.7);
  for (let i = 0; i < 6; i++) gl(0.2, 0.1, 0.2, i % 2 ? RED : NEON, -0.65 + i * 0.26, 3.27, 2.7, 2);
  // antennas
  for (const s of [1, -1]) {
    cyl(0.015, 0.025, 1.6, 5, DARK, s * 0.9, 3.9, 1.8);
    gl(0.06, 0.06, 0.06, RED, s * 0.9, 4.7, 1.8, 2);
  }
  // cargo bed armored container
  box(2.4, 1.7, 4.6, OLIVE, 0, 2.0, -1.5);
  box(2.5, 0.15, 4.7, PLATE, 0, 2.9, -1.5);
  box(2.5, 0.15, 4.7, PLATE, 0, 1.15, -1.5);
  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      const z = -3.4 + i * 0.95;
      box(0.1, 1.6, 0.14, PLATE, s * 1.22, 2.0, z);
      box(0.12, 0.2, 0.5, HULL, s * 1.26, 1.5 + (i % 2) * 0.9, z + 0.45);
    }
    gl(0.04, 0.06, 4.4, s > 0 ? NEON : PINK, s * 1.27, 2.45, -1.5, 1.5);
    gl(0.04, 0.06, 4.4, s > 0 ? PINK : NEON, s * 1.27, 1.55, -1.5, 1.2);
    // side hazard patches
    for (let i = 0; i < 4; i++) box(0.04, 0.3, 0.3, WARN, s * 1.26, 1.95, -3 + i * 0.45, [0, 0, 0]);
  }
  // rear
  box(2.2, 1.5, 0.2, HULL2, 0, 2.0, -3.85);
  for (const s of [1, -1]) {
    gl(0.3, 0.16, 0.06, RED, s * 0.85, 1.4, -3.97, 2);
    box(0.5, 0.5, 0.1, DARK, s * 0.5, 2.3, -3.98);
  }
  box(2.4, 0.3, 0.3, WARN, 0, 0.7, -4.1);
  // roof vents & hex panels
  for (let i = 0; i < 4; i++) box(0.9, 0.12, 0.5, DARK, i % 2 ? -0.5 : 0.5, 3.05, -3.1 + i * 1.0);
  // turret
  cyl(0.8, 0.9, 0.2, 10, DARK, 0, 3.08, -0.3);
  const tur = box(1.2, 0.5, 1.4, PLATE, 0, 3.45, -0.3);
  box(0.9, 0.3, 0.8, HULL, 0, 3.85, -0.4, [8, 0, 0]);
  gl(0.5, 0.1, 0.05, RED, 0, 3.85, 0.05, 2);
  for (const s of [1, -1]) {
    cyl(0.06, 0.06, 2.2, 6, DARK, s * 0.3, 3.5, 1.1, [90, 0, 0]);
    cyl(0.09, 0.09, 0.3, 6, PLATE, s * 0.3, 3.5, 2.2, [90, 0, 0]);
    gl(0.07, 0.07, 0.04, AMBER, s * 0.3, 3.5, 2.37, 2);
    // missile pods
    box(0.5, 0.45, 1.0, OLIVE, s * 0.95, 3.55, -0.5);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++)
      cyl(0.07, 0.07, 0.05, 6, RED, s * 0.95 + (j - 0.5) * 0.2, 3.55 + (i - 1) * 0.13, 0.03, [90, 0, 0]);
  }
  // under-glow
  gl(1.9, 0.04, 7.4, NEON, 0, 0.62, 0, 1.2);
  // fuel/battery cylinders under bed
  for (const s of [1, -1]) cyl(0.25, 0.25, 1.6, 8, HULL2, s * 0.9, 0.85, -1.9, [90, 0, 0]);
  // rivets scatter on container roof
  for (let i = 0; i < 28; i++) box(0.07, 0.05, 0.07, DARK, (r() - 0.5) * 2.1, 3.0, -3.7 + r() * 4.3);
  // emblem
  gl(0.5, 0.5, 0.04, PINK, -1.0, 2.0, 4.0 - 4.0 + 0.0, 0.01).mesh.visible = false;
  for (const s of [1, -1]) box(0.04, 0.5, 0.5, PINK, s * 1.17, 2.55, 2.0);

  return b.root;
}
```