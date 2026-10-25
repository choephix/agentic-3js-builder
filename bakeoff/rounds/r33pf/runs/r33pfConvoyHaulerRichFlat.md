```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Convoy Hauler",
  description: "Armoured six-wheel cyberpunk hauler with a sealed, glowing cargo pod.",
};

const HULL = "#2b3040";
const HULL2 = "#3a4156";
const DARK = "#12141c";
const TIRE = "#0b0c10";
const RIM = "#7d869c";
const NEON = "#19e6ff";
const PINK = "#ff2d8a";
const AMBER = "#ffb02e";
const POD = "#d9dde6";
const WARN = "#f2c200";

export default function build() {
  const b = createBuilder({ name: "hauler" });
  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, c: string, at: number[], seg = 8, rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at, rotation: rot });
  const lit = (w: number, h: number, d: number, c: string, at: number[], s = 1.6) =>
    glow(b.part(new THREE.BoxGeometry(w, h, d), c, { at }), s);

  // chassis
  box(2.5, 0.35, 9, DARK, [0, 0.85, 0]);
  box(2.3, 0.2, 8.6, HULL2, [0, 1.05, 0]);

  // wheels: 3 axles
  for (const z of [-3.3, -1.9, 2.8]) {
    for (const s of [1, -1]) {
      cyl(0.62, 0.62, 0.5, TIRE, [s * 1.3, 0.62, z], 10, [0, 0, 90]);
      cyl(0.35, 0.35, 0.54, RIM, [s * 1.3, 0.62, z], 6, [0, 0, 90]);
      cyl(0.12, 0.12, 0.58, NEON, [s * 1.3, 0.62, z], 6, [0, 0, 90]);
      box(0.15, 0.5, 1.5, HULL, [s * 1.42, 1.25, z]);
    }
    cyl(0.1, 0.1, 2.6, DARK, [0, 0.62, z], 6, [0, 0, 90]);
  }

  // cab
  box(2.4, 1.3, 2.4, HULL, [0, 1.85, 3.2]);
  box(2.2, 0.9, 1.6, HULL2, [0, 2.7, 2.9]);
  box(2.1, 0.6, 0.9, HULL2, [0, 2.45, 4.2], [-25, 0, 0]);
  // windshield
  box(1.9, 0.5, 0.08, "#0a2a3a", [0, 2.8, 3.72], [-18, 0, 0]);
  lit(1.7, 0.08, 0.06, NEON, [0, 2.96, 3.76], 1.2);
  for (const s of [1, -1]) box(0.05, 0.45, 0.9, "#0a2a3a", [s * 1.12, 2.75, 3.0]);
  // hood / bull bar
  box(2.3, 0.8, 1.2, HULL, [0, 1.5, 4.7]);
  box(2.5, 0.5, 0.3, DARK, [0, 1.2, 5.4]);
  for (let i = -3; i <= 3; i++) box(0.12, 0.5, 0.08, WARN, [i * 0.3, 1.2, 5.57]);
  box(2.6, 0.12, 0.5, RIM, [0, 0.7, 5.5]);
  // headlights
  for (const s of [1, -1]) {
    lit(0.5, 0.2, 0.08, "#fff6c8", [s * 0.85, 1.7, 5.32], 2);
    lit(0.3, 0.08, 0.08, PINK, [s * 0.85, 1.52, 5.32], 1.5);
    // exhaust stacks
    cyl(0.1, 0.12, 2.2, RIM, [s * 1.3, 3.0, 2.2], 6);
    cyl(0.14, 0.1, 0.12, DARK, [s * 1.3, 4.14, 2.2], 6);
    // mirrors
    box(0.08, 0.5, 0.3, DARK, [s * 1.35, 2.5, 3.9]);
    // side armour plates
    box(0.12, 0.7, 2.2, HULL2, [s * 1.26, 1.9, 3.2]);
    lit(0.04, 0.08, 1.8, NEON, [s * 1.33, 2.1, 3.2]);
  }
  // roof lightbar and antenna
  box(1.6, 0.12, 0.3, DARK, [0, 3.2, 3.1]);
  lit(0.5, 0.1, 0.32, PINK, [0.4, 3.28, 3.1]);
  lit(0.5, 0.1, 0.32, NEON, [-0.4, 3.28, 3.1]);
  cyl(0.02, 0.03, 1.4, DARK, [0.9, 3.7, 2.3], 5);
  lit(0.08, 0.08, 0.08, AMBER, [0.9, 4.45, 2.3]);

  // cargo pod cradle
  box(2.6, 0.3, 5.4, DARK, [0, 1.3, -2.2]);
  for (const z of [-4.4, -2.2, 0])
    for (const s of [1, -1]) box(0.18, 1.0, 0.25, HULL, [s * 1.2, 1.9, z]);
  // pod: capsule body
  b.part(new THREE.CylinderGeometry(1.15, 1.15, 4.6, 10), POD, { at: [0, 2.7, -2.2], rotation: [90, 0, 0] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1.15, 10, 6), POD, { at: [0, 2.7, -2.2 + s * 2.3], scale: [1, 1, 0.6] });
  }
  // pod bands
  for (const z of [-4, -3.1, -1.3, -0.4]) {
    b.part(new THREE.CylinderGeometry(1.2, 1.2, 0.18, 10), HULL, { at: [0, 2.7, z], rotation: [90, 0, 0] });
  }
  // glowing seal strip & hazard
  for (const s of [1, -1]) {
    lit(0.06, 0.12, 3.6, NEON, [s * 1.17, 2.9, -2.2]);
    box(0.05, 0.6, 0.8, WARN, [s * 1.16, 2.5, -1.8]);
    box(0.06, 0.4, 0.5, DARK, [s * 1.18, 2.5, -1.8]);
  }
  lit(0.9, 0.06, 2.6, PINK, [0, 3.85, -2.2], 1.4);
  box(0.5, 0.3, 0.5, DARK, [0, 3.95, -3.3]);
  // rear hatch lock
  b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.15, 8), HULL, { at: [0, 2.7, -4.62], rotation: [90, 0, 0] });
  glow(b.part(new THREE.CylinderGeometry(0.18, 0.18, 0.18, 6), AMBER, { at: [0, 2.7, -4.66], rotation: [90, 0, 0] }), 1.6);

  // gun turret on cab roof rear
  cyl(0.4, 0.5, 0.3, HULL, [0, 1.25 + 1.95 + 0.0, 0.6], 8);
  box(0.7, 0.4, 0.9, HULL2, [0, 3.45, 0.6]);
  for (const s of [1, -1]) cyl(0.05, 0.05, 1.3, DARK, [s * 0.2, 3.5, 1.4], 6, [90, 0, 0]);

  // rear lights & underglow
  for (const s of [1, -1]) {
    lit(0.4, 0.15, 0.08, PINK, [s * 0.9, 1.1, -4.55]);
  }
  lit(2.2, 0.05, 8, NEON, [0, 0.62, 0], 0.9);
  box(2.2, 0.1, 0.1, WARN, [0, 0.95, -4.55]);

  return b.root;
}
```