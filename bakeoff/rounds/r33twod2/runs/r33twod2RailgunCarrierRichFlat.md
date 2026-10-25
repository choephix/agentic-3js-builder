```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Railgun Carrier",
  description: "Six-wheeled sci-fi railgun carrier braced on four hydraulic stabiliser legs.",
};

const OLIVE = "#5b6b45";
const OLIVE_D = "#434f33";
const OLIVE_L = "#7a8c5c";
const STEEL = "#8a929c";
const DARK = "#23272d";
const TYRE = "#1b1c1f";
const HAZ = "#e8b82a";
const GLOW = "#4de3ff";
const RED = "#c0392b";

export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });
  const hull = b.joint("hull", { at: [0, 1.0, 0] });
  const turret = b.joint("turret", { parent: hull, at: [0, 1.75, -0.6], dir: [0, 1, 0] });
  const gun = b.joint("gun", { parent: turret, at: [0, 0.55, 0.2], dir: [0, 0, 1] });

  const box = (w: number, h: number, d: number, c: string, at: number[], bone: any = hull, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, at: number[], bone: any, dir: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at, dir });

  // Chassis
  box(2.4, 0.5, 8.0, OLIVE_D, [0, 0.9, 0]);
  box(2.6, 0.5, 7.4, OLIVE, [0, 1.35, -0.2]);
  box(2.2, 0.12, 6.4, OLIVE_L, [0, 1.66, -0.4]);
  // sloped nose
  b.part(new THREE.BoxGeometry(2.5, 0.5, 1.4), OLIVE, { bone: hull, at: [0, 1.25, 3.9], rotation: [-25, 0, 0] });
  // cab
  box(2.2, 0.9, 1.8, OLIVE, [0, 1.95, 2.5]);
  b.part(new THREE.BoxGeometry(2.0, 0.55, 0.9), "#1d3a4a", { bone: hull, at: [0, 2.1, 3.25], rotation: [-30, 0, 0] });
  box(0.1, 0.4, 0.5, "#1d3a4a", [1.11, 2.05, 2.5]);
  box(0.1, 0.4, 0.5, "#1d3a4a", [-1.11, 2.05, 2.5]);
  // headlights
  for (const s of [1, -1]) {
    glow(box(0.3, 0.14, 0.08, "#fff3b0", [s * 0.8, 1.2, 4.55]), 1.2);
    box(0.34, 0.2, 0.06, DARK, [s * 0.8, 1.2, 4.52]);
    box(0.5, 0.6, 0.3, DARK, [s * 1.4, 1.0, -4.0]);
    glow(box(0.3, 0.1, 0.05, RED, [s * 1.4, 1.1, -4.2]), 1);
  }
  // hazard stripes at rear and sides
  for (let i = 0; i < 6; i++) {
    box(0.22, 0.2, 0.05, i % 2 ? DARK : HAZ, [-1.1 + i * 0.44, 0.75, -4.02]);
  }
  // side armour skirts & vents
  for (const s of [1, -1]) {
    box(0.12, 0.55, 6.6, OLIVE_D, [s * 1.3, 1.0, -0.2]);
    for (let i = 0; i < 5; i++) box(0.06, 0.28, 0.5, DARK, [s * 1.38, 1.5, -2.2 + i * 0.7]);
    box(0.08, 0.2, 1.2, HAZ, [s * 1.37, 1.0, 1.4]);
  }
  // wheels: 3 axles
  const wz = [2.6, -0.3, -2.9];
  wz.forEach((z, i) => {
    for (const s of [1, -1]) {
      const x = s * 1.45;
      cyl(0.62, 0.62, 0.5, 10, TYRE, [x, 0.62, z], hull, [1, 0, 0]);
      cyl(0.34, 0.34, 0.54, 8, STEEL, [x, 0.62, z], hull, [1, 0, 0]);
      cyl(0.12, 0.12, 0.58, 6, DARK, [x, 0.62, z], hull, [1, 0, 0]);
      box(0.4, 0.14, 1.5, OLIVE_D, [s * 1.4, 1.2, z]);
      void i;
    }
    cyl(0.1, 0.1, 2.9, 6, DARK, [0, 0.62, z], hull, [1, 0, 0]);
  });

  // Stabiliser legs
  const legs: [number, number][] = [[1, 1.9], [-1, 1.9], [1, -2.2], [-1, -2.2]];
  for (const [s, z] of legs) {
    const x = s * 2.05;
    box(0.7, 0.3, 0.5, OLIVE, [s * 1.6, 1.0, z]);
    b.part(new THREE.BoxGeometry(0.22, 0.2, 1.1), STEEL, {
      bone: hull, at: [s * 1.95, 0.85, z], rotation: [0, 0, s * -30],
    });
    cyl(0.14, 0.14, 0.8, 8, STEEL, [x, 0.5, z], hull, [0, 1, 0]);
    cyl(0.09, 0.09, 0.6, 6, "#c9ced4", [x, 0.3, z], hull, [0, 1, 0]);
    cyl(0.4, 0.46, 0.08, 8, DARK, [x, 0.05, z], hull, [0, 1, 0]);
    box(0.5, 0.04, 0.14, HAZ, [x, 0.1, z]);
  }

  // Turret ring and body
  cyl(1.35, 1.45, 0.25, 12, DARK, [0, 1.8, -0.6], hull, [0, 1, 0]);
  const tb = [0, 0.35, 0];
  void tb;
  b.part(new THREE.BoxGeometry(2.3, 0.9, 2.8), OLIVE, { bone: turret, at: [0, 1.9, -0.6] });
  b.part(new THREE.BoxGeometry(2.0, 0.2, 2.5), OLIVE_L, { bone: turret, at: [0, 2.42, -0.6] });
  b.part(new THREE.BoxGeometry(1.2, 0.5, 1.0), OLIVE_D, { bone: turret, at: [0, 1.95, -2.2] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.15, 0.7, 1.4), OLIVE_D, { bone: turret, at: [s * 1.2, 2.0, 0.0], rotation: [0, s * 10, 0] });
    glow(b.part(new THREE.BoxGeometry(0.06, 0.1, 1.0), GLOW, { bone: turret, at: [s * 1.2, 2.3, -0.9] }), 1.4);
  }
  // sensor mast
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 6), DARK, { bone: turret, at: [0.8, 2.8, -1.2] });
  b.part(new THREE.SphereGeometry(0.15, 8, 6), RED, { bone: turret, at: [0.8, 3.15, -1.2] });

  // Railgun: cradle, twin rails, coils
  b.part(new THREE.BoxGeometry(1.0, 0.7, 2.0), STEEL, { bone: gun, at: [0, 1.95 - 0.55 + 0.3, 0.8] });
  const gy = 1.95;
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.2, 0.28, 8.6), DARK, { bone: gun, at: [s * 0.3, gy - 0.1 + 0.0, 5.0] });
    b.part(new THREE.BoxGeometry(0.12, 0.12, 8.6), STEEL, { bone: gun, at: [s * 0.42, gy + 0.1, 5.0] });
  }
  b.part(new THREE.BoxGeometry(0.4, 0.12, 8.2), DARK, { bone: gun, at: [0, gy - 0.35, 5.0] });
  for (let i = 0; i < 9; i++) {
    const z = 2.2 + i * 0.9;
    b.part(new THREE.BoxGeometry(1.0, 0.7, 0.2), i % 2 ? OLIVE_D : STEEL, { bone: gun, at: [0, gy, z] });
    glow(b.part(new THREE.BoxGeometry(0.62, 0.14, 0.24), GLOW, { bone: gun, at: [0, gy + 0.0, z] }), 1.5);
  }
  b.part(new THREE.BoxGeometry(0.8, 0.5, 0.3), HAZ, { bone: gun, at: [0, gy, 9.6] });
  glow(b.part(new THREE.BoxGeometry(0.3, 0.2, 0.1), GLOW, { bone: gun, at: [0, gy, 9.78] }), 2);

  // roof details: hatch, ammo boxes
  box(0.8, 0.12, 0.8, DARK, [0.4, 1.78, -2.6]);
  box(0.9, 0.35, 0.5, OLIVE_D, [-0.6, 1.85, 1.6]);
  box(0.4, 0.2, 0.4, HAZ, [0.6, 1.8, 1.6]);

  // lower the whole model so it rests on y=0 (wheels bottom at 0, legs touch floor)
  return b.root;
}
```