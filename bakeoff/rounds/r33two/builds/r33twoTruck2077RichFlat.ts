import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Aegis-77 Armored Hauler",
  description: "Low-poly cyberpunk militarized 6-wheel truck from 2077 with neon trim, turret, missile pods and cargo bed.",
};

const HULL = "#2f3a3a", HULL2 = "#252d2e", PLATE = "#4a5650", DARK = "#101214", RUBBER = "#17181a";
const RIM = "#6b7078", NEON = "#19f2e0", MAG = "#ff2d95", AMBER = "#ffb02e", RED = "#ff3a3a";
const GLASS = "#0a2a3a", STEEL = "#8a9096", CAMO = "#5b6b4a", WARN = "#e8c020";

export default function build() {
  const b = createBuilder({ name: "truck2077" });
  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: at as any, rotation: rot as any });
  const cyl = (rt: number, rb: number, h: number, c: string, at: number[], rot: number[] = [0, 0, 0], seg = 8) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: at as any, rotation: rot as any });
  const lit = (w: number, h: number, d: number, c: string, at: number[], s = 1.2) => glow(box(w, h, d, c, at), s);

  const WR = 0.62;
  // chassis
  box(2.5, 0.3, 8.4, DARK, [0, 0.95, -0.4]);
  box(2.3, 0.18, 8.2, HULL2, [0, 0.75, -0.4]);
  // wheels: 3 axles
  for (const z of [2.6, -1.2, -3.2]) {
    box(2.2, 0.2, 0.25, DARK, [0, 0.9, z]);
    for (const s of [1, -1]) {
      cyl(WR, WR, 0.55, RUBBER, [s * 1.35, WR, z], [0, 0, 90], 12);
      cyl(0.36, 0.36, 0.58, RIM, [s * 1.36, WR, z], [0, 0, 90], 8);
      cyl(0.12, 0.12, 0.64, DARK, [s * 1.38, WR, z], [0, 0, 90], 6);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        cyl(0.04, 0.04, 0.62, STEEL, [s * 1.37, WR + Math.sin(a) * 0.24, z + Math.cos(a) * 0.24], [0, 0, 90], 5);
      }
      // fender
      box(0.7, 0.12, 1.5, HULL, [s * 1.35, 1.35, z]);
      box(0.08, 0.3, 1.5, PLATE, [s * 1.68, 1.22, z]);
      lit(0.04, 0.06, 0.5, AMBER, [s * 1.7, 1.3, z], 1.2);
    }
  }
  // cab
  box(2.5, 1.0, 2.6, HULL, [0, 1.6, 2.3]);
  box(2.4, 0.9, 1.6, HULL, [0, 2.45, 1.9]);
  box(2.2, 0.5, 1.2, PLATE, [0, 2.1, 3.6], [-12, 0, 0]);
  box(2.45, 0.2, 1.7, PLATE, [0, 2.95, 1.9]);
  // windshield & windows
  box(2.1, 0.6, 0.06, GLASS, [0, 2.55, 2.75], [-25, 0, 0]);
  for (const s of [1, -1]) {
    box(0.06, 0.5, 1.0, GLASS, [s * 1.22, 2.55, 1.9]);
    box(0.1, 0.1, 1.1, NEON, [s * 1.23, 2.25, 1.9]);
    box(0.12, 0.7, 0.5, HULL2, [s * 1.26, 1.7, 2.6]);
  }
  // front bumper & grill
  box(2.7, 0.5, 0.5, PLATE, [0, 0.95, 3.85]);
  box(2.0, 0.6, 0.12, DARK, [0, 1.6, 3.65]);
  for (let i = 0; i < 6; i++) box(1.9, 0.04, 0.05, STEEL, [0, 1.4 + i * 0.1, 3.72]);
  for (let i = -3; i <= 3; i++)
    b.part(new THREE.ConeGeometry(0.08, 0.3, 4), WARN, { at: [i * 0.36, 0.85, 4.15], rotation: [90, 0, 0] });
  // headlights
  for (const s of [1, -1]) {
    lit(0.55, 0.14, 0.08, "#e8ffff", [s * 0.85, 1.9, 3.7], 1.8);
    lit(0.3, 0.06, 0.08, MAG, [s * 0.85, 1.7, 3.72], 1.5);
    box(0.7, 0.04, 0.1, DARK, [s * 0.85, 2.02, 3.7]);
  }
  lit(2.2, 0.06, 0.08, NEON, [0, 1.25, 3.68], 1.5);
  // roof: light bar, antennas, sensor
  lit(1.8, 0.1, 0.18, RED, [0, 3.1, 2.6], 1.4);
  lit(0.5, 0.1, 0.18, "#2a6aff", [0.6, 3.1, 2.6], 1.4);
  for (const s of [1, -1]) {
    cyl(0.015, 0.015, 1.6, DARK, [s * 1.0, 3.8, 1.2], [0, 0, s * 8], 4);
    lit(0.08, 0.08, 0.08, RED, [s * 1.1, 4.6, 1.2], 1.8);
  }
  cyl(0.3, 0.35, 0.2, HULL2, [0, 3.15, 1.4], [0, 0, 0], 8);
  b.part(new THREE.SphereGeometry(0.22, 8, 5, 0, 6.3, 0, 1.6), STEEL, { at: [0, 3.25, 1.4] });
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), NEON, { at: [0, 3.4, 1.55] }), 2);
  // side skirts & neon
  for (const s of [1, -1]) {
    box(0.1, 0.5, 5.5, PLATE, [s * 1.3, 0.85, -0.5]);
    lit(0.05, 0.06, 5.2, NEON, [s * 1.36, 0.6, -0.5], 1.6);
    for (let i = 0; i < 5; i++) box(0.12, 0.35, 0.8, HULL, [s * 1.3, 0.9, -2.7 + i * 1.1 + 0.55]).rotation.z = 0;
  }
  // cargo bed with armor
  box(2.5, 0.2, 5.2, HULL2, [0, 1.2, -2.4]);
  for (const s of [1, -1]) {
    box(0.15, 1.1, 5.2, HULL, [s * 1.2, 1.8, -2.4]);
    box(0.2, 0.15, 5.2, PLATE, [s * 1.2, 2.4, -2.4]);
    for (let i = 0; i < 6; i++) lit(0.04, 0.5, 0.06, MAG, [s * 1.29, 1.8, -4.6 + i * 0.85], 1.2);
  }
  box(2.5, 1.1, 0.15, HULL, [0, 1.8, -4.95]);
  box(2.5, 1.1, 0.15, HULL, [0, 1.8, -0.0]);
  // containers
  box(2.0, 1.1, 2.0, CAMO, [0, 1.95, -1.3]);
  box(2.05, 0.08, 2.05, PLATE, [0, 2.55, -1.3]);
  for (let i = 0; i < 4; i++) box(0.05, 1.0, 0.04, DARK, [-0.7 + i * 0.47, 1.95, -0.28]);
  lit(0.5, 0.12, 0.04, WARN, [0.5, 2.3, -0.27], 1);
  box(1.9, 0.9, 1.4, "#3a4a5a", [0, 1.85, -3.6]);
  lit(1.3, 0.08, 0.04, AMBER, [0, 2.1, -2.88], 1.2);
  // turret on rear
  cyl(0.65, 0.75, 0.2, PLATE, [0, 2.65, -3.6], [0, 0, 0], 10);
  box(1.0, 0.5, 1.1, HULL, [0, 2.95, -3.6]);
  box(0.9, 0.2, 0.9, PLATE, [0, 3.3, -3.6], [10, 0, 0]);
  for (const s of [1, -1]) {
    cyl(0.07, 0.07, 1.6, DARK, [s * 0.25, 3.0, -2.7], [90, 0, 0], 6);
    cyl(0.1, 0.1, 0.25, STEEL, [s * 0.25, 3.0, -1.9], [90, 0, 0], 6);
    lit(0.12, 0.12, 0.1, MAG, [s * 0.25, 3.0, -1.75], 2);
    box(0.4, 0.4, 0.5, HULL2, [s * 0.75, 3.0, -3.6]);
  }
  glow(b.part(new THREE.SphereGeometry(0.1, 6, 4), RED, { at: [0, 3.5, -3.3] }), 2);
  // missile pods on cab sides
  for (const s of [1, -1]) {
    box(0.7, 0.7, 1.4, HULL2, [s * 1.65, 2.0, 1.2]);
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 2; j++) {
        cyl(0.13, 0.13, 0.1, DARK, [s * (1.5 + i * 0.3), 1.85 + j * 0.3, 1.95], [90, 0, 0], 8);
        b.part(new THREE.ConeGeometry(0.1, 0.25, 6), RED, { at: [s * (1.5 + i * 0.3), 1.85 + j * 0.3, 2.0], rotation: [90, 0, 0] });
      }
    box(0.5, 0.15, 0.3, DARK, [s * 1.4, 1.65, 1.2]);
  }
  // rear: bumper, tail lights, exhaust
  box(2.6, 0.4, 0.3, PLATE, [0, 0.95, -5.1]);
  lit(2.2, 0.1, 0.06, RED, [0, 1.3, -5.12], 1.8);
  for (const s of [1, -1]) {
    cyl(0.1, 0.1, 2.6, STEEL, [s * 1.0, 2.6, -0.1], [0, 0, 0], 6);
    cyl(0.14, 0.14, 0.1, DARK, [s * 1.0, 3.95, -0.1], [0, 0, 0], 8);
    cyl(0.12, 0.12, 0.15, DARK, [s * 0.55, 0.75, -5.1], [90, 0, 0], 8);
  }
  // underbody pipes and hazard stripes
  cyl(0.1, 0.1, 6, STEEL, [0.4, 0.62, -0.4], [90, 0, 0], 6);
  cyl(0.08, 0.08, 6, "#c07030", [-0.4, 0.62, -0.4], [90, 0, 0], 6);
  for (let i = 0; i < 6; i++) box(0.3, 0.05, 0.12, WARN, [0.9, 1.1, 3.9 - i * 0.0]).position.x = -1.1 + i * 0.44;
  // emblem
  for (const s of [1, -1]) {
    box(0.04, 0.3, 0.6, MAG, [s * 1.27, 1.7, 2.0]);
    glow(box(0.05, 0.12, 0.3, NEON, [s * 1.29, 1.7, 2.0]), 1.8);
  }
  // push-bar blades
  for (const s of [1, -1]) box(0.2, 0.7, 0.3, PLATE, [s * 1.1, 1.0, 4.1], [0, 0, s * 15]);

  return b.root;
}
