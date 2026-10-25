```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Hover Technical",
  description: "Militarized pickup converted to hover thrusters, low-poly cyberpunk.",
};

const HULL = "#3b4350";
const HULL_D = "#262c36";
const PLATE = "#58624f";
const DARK = "#14161c";
const TRIM = "#e6c229";
const NEON = "#22e6ff";
const PINK = "#ff2d95";
const GLASS = "#1a3a52";
const STEEL = "#8a93a0";

export default function build() {
  const b = createBuilder({ name: "hoverTruck" });
  const body = b.joint("body", { at: [0, 0.6, 0] });

  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: body, at: [x, y, z], ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, at: number[], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone: body, at, ...o });
  const lit = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}, s = 1.4) =>
    glow(b.part(g, c, { bone: body, at, ...o }), s);

  // chassis
  box(2.0, 0.3, 4.6, HULL_D, 0, 0.55, 0);
  box(1.7, 0.12, 4.3, DARK, 0, 0.38, 0);
  // hood
  box(1.9, 0.4, 1.5, HULL, 0, 0.9, 1.5);
  box(1.5, 0.08, 1.0, PLATE, 0, 1.14, 1.5);
  // hood vents
  for (let i = 0; i < 4; i++) box(1.1, 0.03, 0.06, DARK, 0, 1.19, 1.15 + i * 0.18);
  // front bumper wedge
  b.part(new THREE.BoxGeometry(2.1, 0.35, 0.3), STEEL, { bone: body, at: [0, 0.65, 2.4], rotation: [-15, 0, 0] });
  box(2.15, 0.06, 0.32, TRIM, 0, 0.5, 2.42);
  // cab
  box(1.9, 0.75, 1.5, HULL, 0, 1.3, 0.2);
  box(1.8, 0.1, 1.3, PLATE, 0, 1.72, 0.2);
  // windshield
  b.part(new THREE.BoxGeometry(1.7, 0.6, 0.05), GLASS, { bone: body, at: [0, 1.4, 0.98], rotation: [-30, 0, 0] });
  // side windows
  for (const s of [1, -1]) {
    box(0.04, 0.4, 1.1, GLASS, s * 0.96, 1.45, 0.2);
    box(0.06, 0.05, 1.5, TRIM, s * 0.96, 1.05, 0.2);
    // doors
    box(0.05, 0.5, 1.2, HULL_D, s * 0.96, 1.0, 0.2);
    // side skirts
    box(0.12, 0.2, 3.4, PLATE, s * 1.02, 0.5, 0);
    box(0.03, 0.05, 3.2, NEON, s * 1.09, 0.5, 0);
    lit(new THREE.BoxGeometry(0.03, 0.05, 3.2), NEON, [s * 1.09, 0.5, 0]);
  }
  // bed
  box(1.9, 0.12, 2.0, HULL_D, 0, 0.75, -1.5);
  for (const s of [1, -1]) box(0.1, 0.5, 2.0, PLATE, s * 0.95, 1.0, -1.5);
  box(1.9, 0.5, 0.1, PLATE, 0, 1.0, -2.5);
  box(1.9, 0.5, 0.1, PLATE, 0, 1.0, -0.5);
  // roll bar
  for (const s of [1, -1]) cyl(0.04, 0.04, 0.9, 6, STEEL, [s * 0.85, 1.3, -0.6]);
  cyl(0.04, 0.04, 1.7, 6, STEEL, [0, 1.75, -0.6], { rotation: [0, 0, 90] });

  // turret / mounted gun
  cyl(0.35, 0.4, 0.15, 8, HULL_D, [0, 0.9, -1.6]);
  box(0.5, 0.35, 0.6, HULL, 0, 1.15, -1.6);
  cyl(0.06, 0.06, 1.2, 6, DARK, [0.15, 1.2, -0.9], { rotation: [90, 0, 0] });
  cyl(0.06, 0.06, 1.2, 6, DARK, [-0.15, 1.2, -0.9], { rotation: [90, 0, 0] });
  box(0.7, 0.1, 0.3, TRIM, 0, 1.38, -1.6);

  // headlights, light bar
  for (const s of [1, -1]) {
    lit(new THREE.BoxGeometry(0.4, 0.1, 0.05), "#fff6c0", [s * 0.65, 0.95, 2.27], {}, 1.6);
    lit(new THREE.BoxGeometry(0.3, 0.08, 0.05), PINK, [s * 0.7, 0.75, -2.32], {}, 1.6);
  }
  lit(new THREE.BoxGeometry(1.2, 0.07, 0.07), PINK, [0, 1.8, 0.85]);
  // antenna
  cyl(0.015, 0.015, 1.0, 5, DARK, [0.8, 2.2, -0.2]);
  lit(new THREE.SphereGeometry(0.04, 6, 4), PINK, [0.8, 2.7, -0.2]);
  // emblem stripes
  box(0.5, 0.02, 0.2, TRIM, 0, 1.77, 0.2);
  box(0.3, 0.02, 0.1, PINK, 0, 1.78, 0.2);

  // hover thrusters
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const x = sx * 1.25;
      const z = sz * 1.6;
      box(0.35, 0.1, 0.5, STEEL, sx * 1.1, 0.6, z); // strut
      cyl(0.5, 0.42, 0.35, 8, HULL_D, [x, 0.4, z]); // housing
      cyl(0.52, 0.52, 0.05, 8, TRIM, [x, 0.55, z]); // band
      cyl(0.38, 0.38, 0.05, 8, DARK, [x, 0.2, z]); // nozzle
      lit(new THREE.CylinderGeometry(0.32, 0.32, 0.04, 8), NEON, [x, 0.17, z], {}, 1.8);
      lit(new THREE.CylinderGeometry(0.2, 0.28, 0.03, 8), "#ffffff", [x, 0.14, z], {}, 1.5);
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        box(0.05, 0.3, 0.05, STEEL, x + Math.cos(a) * 0.46, 0.42, z + Math.sin(a) * 0.46);
      }
    }
  // rear exhaust
  for (const s of [1, -1]) cyl(0.08, 0.08, 0.4, 6, STEEL, [s * 0.5, 1.0, -2.45], { rotation: [90, 0, 0] });

  return b.root;
}
```