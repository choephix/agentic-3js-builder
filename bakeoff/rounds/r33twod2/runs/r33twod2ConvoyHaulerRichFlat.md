```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Convoy Hauler",
  description: "Armoured six-wheel cyberpunk convoy hauler carrying a sealed, glowing cargo pod.",
};

const HULL = "#2b3040";
const HULL2 = "#3a4156";
const PLATE = "#4b536b";
const DARK = "#12141c";
const TIRE = "#17181d";
const RIM = "#8a93a8";
const NEON = "#19f0ff";
const PINK = "#ff2d8a";
const AMBER = "#ffb300";
const POD = "#d8dde8";
const WARN = "#f2c200";

export default function build() {
  const b = createBuilder({ name: "hauler" });
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, x: number, y: number, z: number, rot: [number, number, number] = [0, 0, 0]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z], rotation: rot });
  const g = (p: any, s = 1) => glow(p, s);

  // chassis
  box(2.2, 0.35, 8.2, DARK, 0, 0.95, 0);
  box(2.4, 0.25, 8.0, HULL, 0, 1.2, 0);

  // wheels: three axles
  for (const z of [-2.8, -0.9, 2.6]) {
    for (const s of [1, -1]) {
      const x = s * 1.2;
      cyl(0.62, 0.62, 0.55, 10, TIRE, x, 0.62, z, [0, 0, 90]);
      cyl(0.36, 0.36, 0.58, 8, RIM, x, 0.62, z, [0, 0, 90]);
      cyl(0.12, 0.12, 0.62 + 0.04, 6, DARK, x + s * 0.02, 0.62, z, [0, 0, 90]);
      // fender
      box(0.12, 0.12, 1.5, HULL2, s * 1.2, 1.35, z);
      box(0.7, 0.1, 1.5, HULL2, s * 1.2, 1.45, z);
      for (let k = 0; k < 3; k++) box(0.04, 0.04, 0.4, NEON, s * 1.52, 0.9, z - 0.4 + k * 0.4);
    }
    cyl(0.12, 0.12, 2.4, 6, PLATE, 0, 0.62, z, [0, 0, 90]);
  }

  // cab
  box(2.3, 1.5, 2.0, HULL2, 0, 2.1, 3.0);
  box(2.4, 0.5, 1.4, PLATE, 0, 1.55, 3.7);
  box(2.1, 0.8, 0.9, HULL, 0, 3.0, 2.7); // roof step
  // windshield
  const ws = b.part(new THREE.BoxGeometry(1.9, 0.6, 0.08), NEON, { at: [0, 2.55, 4.03], rotation: [-12, 0, 0] });
  g(ws, 0.8);
  box(1.9, 0.08, 0.1, DARK, 0, 2.88, 4.0);
  // side windows
  for (const s of [1, -1]) g(box(0.06, 0.5, 1.1, NEON, s * 1.16, 2.5, 3.0), 0.6);
  // grille / bumper
  box(2.6, 0.5, 0.35, PLATE, 0, 1.0, 4.2);
  box(2.0, 0.22, 0.12, DARK, 0, 1.55, 4.1);
  for (let i = -3; i <= 3; i++) box(0.12, 0.2, 0.06, PINK, i * 0.28, 1.55, 4.18).mesh;
  // bumper hazard stripes
  for (let i = -4; i <= 4; i++) box(0.2, 0.14, 0.05, i % 2 ? WARN : DARK, i * 0.28, 0.85, 4.4);
  // headlights
  for (const s of [1, -1]) {
    g(box(0.4, 0.2, 0.1, "#fff6c8", s * 0.9, 1.2, 4.12), 1.5);
    box(0.5, 0.06, 0.12, DARK, s * 0.9, 1.35, 4.12);
    // exhaust stacks
    cyl(0.1, 0.1, 2.0, 8, PLATE, s * 1.2, 3.1, 1.8);
    cyl(0.12, 0.12, 0.1, 8, DARK, s * 1.2, 4.1, 1.8);
    g(cyl(0.07, 0.07, 0.04, 8, AMBER, s * 1.2, 4.12, 1.8), 1.5);
    // wing mirrors
    box(0.08, 0.5, 0.3, DARK, s * 1.5, 2.6, 3.9);
    g(box(0.04, 0.4, 0.2, PINK, s * 1.55, 2.6, 3.9), 1);
  }
  // roof light bar & antenna
  box(1.6, 0.12, 0.3, DARK, 0, 3.45, 2.9);
  for (let i = 0; i < 4; i++) g(box(0.3, 0.08, 0.2, i % 2 ? PINK : NEON, -0.55 + i * 0.37, 3.53, 2.9), 1.5);
  cyl(0.02, 0.03, 1.6, 5, DARK, -0.8, 4.2, 2.2);
  g(b.part(new THREE.SphereGeometry(0.06, 6, 4), PINK, { at: [-0.8, 5.0, 2.2] }), 2);

  // armour plating on flanks
  for (const s of [1, -1]) {
    box(0.18, 1.0, 5.6, PLATE, s * 1.3, 1.7, -1.6);
    for (let i = 0; i < 5; i++) box(0.22, 0.7, 0.9, i % 2 ? HULL2 : HULL, s * 1.32, 1.7, -3.7 + i * 1.1);
    g(box(0.22, 0.06, 5.4, NEON, s * 1.33, 2.15, -1.6), 1);
    // turret-like side guns
    cyl(0.2, 0.2, 0.3, 8, DARK, s * 1.15, 3.6, 1.6);
    box(0.12, 0.12, 1.0, PLATE, s * 1.15, 3.7, 2.2);
  }

  // cargo pod: cradle + pod
  box(2.0, 0.3, 4.8, PLATE, 0, 1.5, -1.8);
  for (const z of [-3.7, -2.2, -0.7]) {
    box(2.5, 0.2, 0.3, HULL2, 0, 1.75, z);
  }
  const pod = b.part(new THREE.CylinderGeometry(1.0, 1.0, 4.8, 12), POD, { at: [0, 2.9, -1.8], rotation: [90, 0, 0] });
  void pod;
  for (const z of [-0.5, -3.1]) {
    b.part(new THREE.TorusGeometry(1.02, 0.08, 4, 12), HULL, { at: [0, 2.9, z] });
  }
  // pod end caps
  b.part(new THREE.SphereGeometry(1.0, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), POD, { at: [0, 2.9, -4.2], rotation: [-90, 0, 0] });
  b.part(new THREE.SphereGeometry(1.0, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), POD, { at: [0, 2.9, 0.6], rotation: [90, 0, 0] });
  // pod stripes, seals, glow window
  for (const z of [-1.0, -2.0, -2.6]) b.part(new THREE.TorusGeometry(1.01, 0.04, 4, 12), z === -2.0 ? PINK : HULL2, { at: [0, 2.9, z] });
  g(box(0.06, 0.5, 1.6, NEON, 1.0, 3.2, -1.8), 1.5);
  g(box(0.06, 0.5, 1.6, NEON, -1.0, 3.2, -1.8), 1.5);
  g(box(1.3, 0.05, 1.8, AMBER, 0, 3.92, -1.8), 1.2); // roof hatch glow
  box(1.5, 0.1, 2.0, DARK, 0, 3.88, -1.8);
  // seal lock
  box(0.6, 0.6, 0.15, DARK, 0, 2.9, -4.5);
  g(box(0.3, 0.3, 0.05, PINK, 0, 2.9, -4.6), 1.8);

  // rear
  box(2.4, 0.4, 0.3, PLATE, 0, 1.0, -4.2);
  for (let i = -4; i <= 4; i++) box(0.2, 0.14, 0.05, i % 2 ? WARN : DARK, i * 0.26, 1.0, -4.38);
  for (const s of [1, -1]) g(box(0.35, 0.18, 0.08, "#ff1a1a", s * 0.9, 1.4, -4.2), 1.5);

  // rear drone-gun mount
  cyl(0.35, 0.4, 0.3, 8, DARK, 0, 1.8, -4.0);
  box(0.25, 0.25, 1.0, PLATE, 0, 2.0, -4.5);

  // underglow
  g(box(2.0, 0.04, 7.0, NEON, 0, 0.78, 0), 1.3);

  return b.root;
}
```