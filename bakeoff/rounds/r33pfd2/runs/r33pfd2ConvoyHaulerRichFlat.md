```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Armoured Convoy Hauler",
  description: "Low-poly cyberpunk six-wheel armoured hauler guarding a sealed glowing cargo pod.",
};

const HULL = "#2b2f3d";
const HULL2 = "#3b4157";
const DARK = "#12141c";
const TIRE = "#0b0c10";
const RIM = "#6b7390";
const NEON = "#19f0ff";
const PINK = "#ff2d8a";
const YEL = "#ffd22e";
const POD = "#7a8296";
const GLASS = "#0fb7d6";

export default function build() {
  const b = createBuilder({ name: "hauler" });

  const box = (w: number, h: number, d: number, c: string, at: [number, number, number], rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, at: [number, number, number], rot?: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at, rotation: rot });
  const lit = (w: number, h: number, d: number, c: string, at: [number, number, number], s = 1.4) =>
    glow(b.part(new THREE.BoxGeometry(w, h, d), c, { at }), s);

  // chassis
  box(2.4, 0.35, 8.2, DARK, [0, 0.85, 0]);
  box(2.6, 0.2, 8.0, HULL2, [0, 1.05, 0]);

  // wheels: 3 axles per side
  for (const s of [1, -1]) {
    for (const z of [-3, -0.6, 3]) {
      cyl(0.62, 0.62, 0.55, 10, TIRE, [s * 1.4, 0.62, z], [0, 0, 90]);
      cyl(0.33, 0.33, 0.58, 8, RIM, [s * 1.4, 0.62, z], [0, 0, 90]);
      cyl(0.12, 0.12, 0.62, 6, NEON, [s * 1.4, 0.62, z], [0, 0, 90]);
      // fender
      box(0.7, 0.14, 1.6, HULL, [s * 1.4, 1.3, z]);
      box(0.12, 0.5, 1.5, HULL2, [s * 1.7, 1.1, z]);
    }
    // side skirt armor plates
    box(0.14, 0.5, 6.4, HULL2, [s * 1.35, 1.0, 0.2]);
    // neon underglow strip
    lit(0.06, 0.06, 6.2, s > 0 ? NEON : PINK, [s * 1.43, 0.78, 0.2]);
  }

  // cab at front
  box(2.5, 1.5, 2.2, HULL, [0, 2.0, 3.0]);
  box(2.3, 0.5, 1.2, HULL2, [0, 2.9, 2.7]);
  box(2.0, 0.8, 0.4, HULL2, [0, 1.5, 4.3], [-20, 0, 0]);
  // armoured windscreen
  box(1.9, 0.55, 0.12, GLASS, [0, 2.45, 4.12], [-18, 0, 0]);
  glow(b.part(new THREE.BoxGeometry(1.9, 0.55, 0.05), GLASS, { at: [0, 2.45, 4.14], rotation: [-18, 0, 0] }), 0.8);
  // side windows
  for (const s of [1, -1]) glow(b.part(new THREE.BoxGeometry(0.06, 0.45, 0.9), GLASS, { at: [s * 1.27, 2.45, 3.1] }), 0.7);

  // front bumper ram
  box(2.8, 0.7, 0.5, DARK, [0, 1.0, 4.6]);
  for (let i = -3; i <= 3; i++) box(0.3, 0.3, 0.2, YEL, [i * 0.38, 1.0, 4.9], [0, 0, i % 2 ? 0 : 0]);
  box(2.2, 0.25, 0.5, HULL2, [0, 1.45, 4.55], [-25, 0, 0]);
  // headlights
  for (const s of [1, -1]) {
    lit(0.45, 0.2, 0.1, "#f4fbff", [s * 0.95, 1.7, 4.4], 2);
    lit(0.12, 0.12, 0.12, PINK, [s * 1.27, 1.7, 4.2], 2);
  }
  // roof light bar and antennae
  box(1.8, 0.1, 0.3, DARK, [0, 3.2, 2.6]);
  lit(0.6, 0.08, 0.2, PINK, [0.5, 3.28, 2.6], 2);
  lit(0.6, 0.08, 0.2, NEON, [-0.5, 3.28, 2.6], 2);
  for (const s of [1, -1]) cyl(0.025, 0.025, 1.4, 5, RIM, [s * 1.1, 3.4, 2.0]);
  // exhaust stacks
  for (const s of [1, -1]) {
    cyl(0.14, 0.14, 1.8, 8, "#555b70", [s * 1.4, 2.6, 1.7]);
    cyl(0.17, 0.17, 0.1, 8, DARK, [s * 1.4, 3.5, 1.7]);
  }

  // armoured cargo pod
  cyl(1.15, 1.15, 4.4, 8, POD, [0, 2.45, -1.7], [90, 0, 0]);
  cyl(0.9, 1.0, 0.6, 8, HULL2, [0, 2.45, -4.1], [90, 0, 0]);
  cyl(1.0, 0.9, 0.5, 8, HULL2, [0, 2.45, 0.6], [90, 0, 0]);
  // cradle
  box(2.0, 0.3, 4.8, HULL, [0, 1.35, -1.7]);
  // reinforcing ribs and neon seams
  for (let i = 0; i < 5; i++) {
    const z = -3.4 + i * 1.0;
    cyl(1.2, 1.2, 0.18, 8, HULL, [0, 2.45, z], [90, 0, 0]);
    for (const s of [1, -1]) lit(0.08, 0.5, 0.2, i % 2 ? NEON : PINK, [s * 1.1, 2.45, z], 1.6);
    lit(0.5, 0.08, 0.2, NEON, [0, 3.62, z], 1.6);
  }
  // seal hatch at rear
  cyl(0.6, 0.6, 0.1, 8, DARK, [0, 2.45, -4.45], [90, 0, 0]);
  glow(b.part(new THREE.CylinderGeometry(0.35, 0.35, 0.12, 6), PINK, { at: [0, 2.45, -4.47], rotation: [90, 0, 0] }), 1.8);
  // hazard stripes on pod roof
  for (let i = 0; i < 6; i++) box(0.5, 0.05, 0.3, i % 2 ? YEL : DARK, [0, 3.62, -3.6 + i * 0.6 + 0.0]);

  // roof turret guard
  cyl(0.5, 0.6, 0.3, 8, HULL2, [0, 3.0, 1.1]);
  box(0.5, 0.4, 0.6, HULL, [0, 3.35, 1.1]);
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 1.3, 6), DARK, { at: [0.15, 3.38, 1.9], rotation: [90, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 1.3, 6), DARK, { at: [-0.15, 3.38, 1.9], rotation: [90, 0, 0] });
  lit(0.2, 0.1, 0.08, PINK, [0, 3.5, 1.42], 2);

  // rear lights and bumper
  box(2.6, 0.5, 0.3, DARK, [0, 1.0, -4.3]);
  for (const s of [1, -1]) lit(0.5, 0.15, 0.08, "#ff2020", [s * 0.9, 1.1, -4.47], 2);

  return b.root;
}
```