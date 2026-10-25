```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Riot Interceptor",
  description: "Corporate riot-control interceptor truck with water cannon and neon light bars, cyberpunk style.",
};

export default function build() {
  const b = createBuilder({ name: "interceptor" });
  const R = rng(5);

  const HULL = "#1b1f2b", HULL2 = "#2a3042", PLATE = "#3a4258", DARK = "#0b0d14", TIRE = "#101116";
  const CYAN = "#19f0ff", PINK = "#ff2d95", YEL = "#ffd21f", RED = "#ff2a3a", GLASS = "#0d2a3a", STEEL = "#8a93a8";

  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, rotation: rot });
  const lit = (w: number, h: number, d: number, c: string, at: number[], s = 1.4) =>
    glow(b.part(new THREE.BoxGeometry(w, h, d), c, { at }), s);

  // chassis
  box(2.1, 0.35, 5.2, DARK, [0, 0.55, 0]);
  box(2.3, 0.6, 4.6, HULL, [0, 0.95, -0.1]);
  box(2.35, 0.1, 4.7, PLATE, [0, 1.27, -0.1]);
  // hood, wedge
  b.part(new THREE.BoxGeometry(2.2, 0.45, 1.5), HULL2, { at: [0, 1.0, 2.1], rotation: [-8, 0, 0] });
  box(2.0, 0.12, 1.2, PLATE, [0, 1.28, 2.0], [-8, 0, 0]);
  // bumper ram
  box(2.5, 0.5, 0.35, PLATE, [0, 0.7, 2.95]);
  box(2.6, 0.12, 0.4, YEL, [0, 0.98, 2.95]);
  for (let i = -4; i <= 4; i++) box(0.12, 0.3, 0.05, DARK, [i * 0.28, 0.7, 3.14]);
  // cab
  box(2.2, 0.8, 1.7, HULL, [0, 1.65, 0.7]);
  box(2.0, 0.1, 1.6, PLATE, [0, 2.08, 0.7]);
  b.part(new THREE.BoxGeometry(1.9, 0.5, 0.06), GLASS, { at: [0, 1.75, 1.55], rotation: [-20, 0, 0] });
  for (const s of [1, -1]) {
    box(0.06, 0.45, 1.2, GLASS, [s * 1.11, 1.72, 0.7]);
    box(0.5, 0.03, 0.03, CYAN, [s * 1.12, 1.4, 0.7]);
  }
  // cab light bar
  box(1.9, 0.14, 0.3, DARK, [0, 2.2, 0.9]);
  lit(0.9, 0.09, 0.32, RED, [-0.5, 2.2, 0.9], 2);
  lit(0.9, 0.09, 0.32, "#2a6bff", [0.5, 2.2, 0.9], 2);

  // armored rear box
  box(2.4, 1.1, 2.3, HULL2, [0, 1.65, -1.75]);
  box(2.5, 0.1, 2.4, PLATE, [0, 2.25, -1.75]);
  for (const s of [1, -1]) {
    for (let k = 0; k < 4; k++) box(0.05, 0.7, 0.35, PLATE, [s * 1.23, 1.65, -0.95 - k * 0.55]);
    lit(0.04, 0.06, 2.1, s > 0 ? CYAN : PINK, [s * 1.26, 1.2, -1.75], 2);
    lit(0.04, 0.06, 2.1, s > 0 ? PINK : CYAN, [s * 1.26, 2.05, -1.75], 2);
  }
  // corporate emblem on sides
  for (const s of [1, -1]) {
    box(0.04, 0.5, 0.5, DARK, [s * 1.26, 1.62, -1.2]);
    lit(0.05, 0.3, 0.06, YEL, [s * 1.28, 1.62, -1.2], 1.6);
    lit(0.05, 0.06, 0.3, YEL, [s * 1.28, 1.7, -1.2], 1.6);
  }
  // rear
  box(2.2, 0.8, 0.1, DARK, [0, 1.6, -2.94]);
  lit(2.0, 0.07, 0.06, RED, [0, 1.95, -2.99], 2);
  lit(2.0, 0.07, 0.06, PINK, [0, 1.3, -2.99], 2);

  // water tank on roof
  b.part(new THREE.CylinderGeometry(0.55, 0.55, 1.7, 10), STEEL, { at: [0, 2.6, -1.7], rotation: [90, 0, 0] });
  for (let i = -2; i <= 2; i++)
    b.part(new THREE.CylinderGeometry(0.57, 0.57, 0.06, 10), PLATE, { at: [0, 2.6, -1.7 + i * 0.38], rotation: [90, 0, 0] });
  glow(b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 8), CYAN, { at: [0, 2.6, -2.58], rotation: [90, 0, 0] }), 1.5);

  // turret and water cannon
  b.part(new THREE.CylinderGeometry(0.5, 0.6, 0.2, 10), PLATE, { at: [0, 2.35, -0.35] });
  b.part(new THREE.CylinderGeometry(0.38, 0.45, 0.35, 8), HULL, { at: [0, 2.6, -0.35] });
  box(0.7, 0.4, 0.7, HULL2, [0, 2.95, -0.35]);
  b.part(new THREE.CylinderGeometry(0.14, 0.18, 1.8, 8), DARK, { at: [0, 3.05, 0.6], rotation: [80, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.22, 0.17, 0.35, 8), PLATE, { at: [0, 3.1, 1.6], rotation: [80, 0, 0] });
  glow(b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 8), CYAN, { at: [0, 3.12, 1.78], rotation: [80, 0, 0] }), 2);
  for (const s of [1, -1]) box(0.08, 0.5, 0.5, STEEL, [s * 0.42, 2.95, -0.35]);

  // headlights and front neon
  for (const s of [1, -1]) {
    lit(0.5, 0.12, 0.06, "#ffffff", [s * 0.8, 1.05, 2.84], 2);
    lit(0.3, 0.05, 0.06, CYAN, [s * 0.8, 0.92, 2.85], 2);
  }
  lit(1.6, 0.06, 0.06, PINK, [0, 0.45, 3.0], 2);
  // roof neon bar on rear box
  lit(2.0, 0.08, 0.1, CYAN, [0, 2.32, -0.6], 2);

  // antennas
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.015, 0.015, 1.0, 5), STEEL, { at: [s * 1.0, 2.7, -2.7] });
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), RED, { at: [s * 1.0, 3.22, -2.7] }), 2);
  }

  // wheels
  for (const s of [1, -1])
    for (const z of [2.0, 0.6, -1.0, -2.3]) {
      const x = s * 1.15;
      box(0.1, 0.1, 0.1, DARK, [x, 0.6, z]);
      b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 12), TIRE, { at: [x, 0.5, z], rotation: [0, 0, 90] });
      b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.42, 8), STEEL, { at: [x + s * 0.01, 0.5, z], rotation: [0, 0, 90] });
      glow(b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.43, 8), s > 0 ? CYAN : PINK, { at: [x + s * 0.02, 0.5, z], rotation: [0, 0, 90] }), 1.3);
      box(0.1, 0.1, 0.9, HULL, [s * 1.0, 0.98, z]);
    }
  // rivets/graffiti flecks
  for (let i = 0; i < 24; i++) {
    const s = R() > 0.5 ? 1 : -1;
    box(0.04, 0.06, 0.06, R() > 0.5 ? YEL : PLATE, [s * 1.27, 1.4 + R() * 0.5, -0.9 - R() * 1.8]);
  }

  // sink wheels slightly into floor
  b.root.position.y = -0.0;
  return b.root;
}
```