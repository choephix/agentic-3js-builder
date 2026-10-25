```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Hover Technical",
  description: "Militarized pickup converted to hover thrusters, low-poly cyberpunk.",
};

export default function build() {
  const b = createBuilder({ name: "hover_pickup" });
  const HULL = "#3b4a3a", HULL2 = "#2c382d", DARK = "#15171c", METAL = "#6b7280", TRIM = "#e8a317";
  const CYAN = "#31f0ff", PINK = "#ff2d95", GLASS = "#0e2a3a", RUST = "#7a4a2a";

  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: rot });
  const cyl = (r1: number, r2: number, h: number, seg: number, c: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(r1, r2, h, seg), c, { at: [x, y, z], rotation: rot });
  const lit = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, s = 1.4) =>
    glow(box(w, h, d, c, x, y, z), s);

  // chassis
  box(1.9, 0.25, 4.8, DARK, 0, 0.55, 0);
  box(1.8, 0.3, 1.6, HULL, 0, 0.8, 1.45); // hood
  box(1.85, 0.12, 1.5, HULL2, 0, 0.98, 1.5);
  box(1.8, 0.5, 0.2, HULL, 0, 0.8, 2.3); // bumper
  box(1.7, 0.1, 0.3, TRIM, 0, 0.62, 2.45);
  // cab
  box(1.8, 0.7, 1.4, HULL, 0, 1.15, 0.2);
  box(1.7, 0.1, 1.3, HULL2, 0, 1.55, 0.15, [-3, 0, 0]);
  box(1.72, 0.42, 0.06, GLASS, 0, 1.3, 0.88, [-25, 0, 0]);
  for (const s of [1, -1]) {
    box(0.04, 0.35, 0.9, GLASS, s * 0.9, 1.3, 0.2);
    box(0.1, 0.5, 0.1, HULL2, s * 0.9, 1.15, -0.5);
    lit(0.1, 0.1, 0.12, "#fff2b0", s * 0.65, 0.88, 2.34, 2); // headlights
    lit(0.1, 0.08, 0.1, PINK, s * 0.7, 0.8, -2.42, 2);
    box(0.1, 0.4, 1.4, HULL2, s * 0.92, 0.8, 0.2); // door panel
    box(0.04, 0.05, 1.2, TRIM, s * 0.96, 0.7, 0.2);
    // armour skirts
    box(0.12, 0.35, 3.2, HULL2, s * 0.98, 0.55, 0.1);
  }
  // bed
  box(1.8, 0.1, 1.9, HULL2, 0, 0.78, -1.45);
  for (const s of [1, -1]) {
    box(0.1, 0.45, 1.9, HULL, s * 0.9, 1.0, -1.45);
    box(0.1, 0.06, 1.9, TRIM, s * 0.9, 1.26, -1.45);
  }
  box(1.8, 0.45, 0.1, HULL, 0, 1.0, -2.4);
  box(1.8, 0.45, 0.1, HULL, 0, 1.0, -0.5);
  // light bar
  lit(1.3, 0.08, 0.1, CYAN, 0, 1.64, 0.6, 1.8);
  // roll bar + turret
  for (const s of [1, -1]) box(0.08, 0.7, 0.08, METAL, s * 0.7, 1.3, -0.6);
  box(1.5, 0.08, 0.08, METAL, 0, 1.65, -0.6);
  cyl(0.28, 0.34, 0.2, 8, METAL, 0, 0.93, -1.5);
  box(0.5, 0.3, 0.6, HULL2, 0, 1.18, -1.5);
  box(0.12, 0.12, 1.1, DARK, 0.14, 1.2, -0.85);
  box(0.12, 0.12, 1.1, DARK, -0.14, 1.2, -0.85);
  lit(0.14, 0.14, 0.04, PINK, 0.14, 1.2, -0.28, 2);
  lit(0.14, 0.14, 0.04, PINK, -0.14, 1.2, -0.28, 2);
  // antenna
  cyl(0.015, 0.015, 1.0, 5, METAL, -0.75, 2.0, -0.5);
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), PINK, { at: [-0.75, 2.5, -0.5] }), 2);
  // thrusters (4 pods)
  for (const sx of [1, -1])
    for (const sz of [1.5, -1.5]) {
      const x = sx * 1.25;
      box(0.5, 0.12, 0.2, METAL, sx * 1.05, 0.6, sz); // strut
      cyl(0.5, 0.55, 0.3, 10, HULL2, x, 0.4, sz); // housing
      cyl(0.58, 0.58, 0.06, 10, TRIM, x, 0.56, sz);
      cyl(0.4, 0.45, 0.1, 10, DARK, x, 0.2, sz);
      glow(b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.04, 10), CYAN, { at: [x, 0.14, sz] }), 2.2);
      glow(b.part(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 8), "#d8ffff", { at: [x, 0.12, sz] }), 2.5);
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 + Math.PI / 4;
        box(0.06, 0.25, 0.16, METAL, x + Math.cos(a) * 0.5, 0.5, sz + Math.sin(a) * 0.5, [0, -a * 57.3, 0]);
      }
      box(0.4, 0.2, 0.3, HULL, x, 0.62, sz); // intake
    }
  // underglow
  glow(b.part(new THREE.BoxGeometry(1.4, 0.04, 3.6), CYAN, { at: [0, 0.38, 0] }), 1.5);
  // racing stripe & decals
  box(0.3, 0.02, 4.4, TRIM, 0, 1.0, 0.3).position.y += 0;
  box(0.3, 0.02, 1.4, TRIM, 0, 1.575, 0.15, [-3, 0, 0]);
  for (const s of [1, -1]) {
    box(0.03, 0.18, 0.5, RUST, s * 0.93, 0.95, 0.2);
    lit(0.03, 0.08, 0.3, CYAN, s * 1.05, 0.55, 1.0, 1.6);
  }
  // exhaust
  for (const s of [1, -1]) cyl(0.07, 0.07, 0.4, 6, METAL, s * 0.55, 0.9, -2.5, [90, 0, 0]);

  return b.root;
}
```