```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Riot Interceptor",
  description: "Corporate riot-control armored interceptor with roof water cannon and neon light bars, cyberpunk style.",
};

const HULL = "#1b1e2a";
const HULL2 = "#2a2f42";
const PLATE = "#3a4058";
const DARK = "#0a0b10";
const TIRE = "#101116";
const RIM = "#7a8196";
const CYAN = "#19f0ff";
const PINK = "#ff2d95";
const YEL = "#ffd21a";
const RED = "#ff2a3a";
const WHITE = "#e8f6ff";
const GLASS = "#12333f";

export default function build() {
  const b = createBuilder({ name: "interceptor" });
  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: at as [number, number, number], rotation: rot as any });
  const lit = (w: number, h: number, d: number, c: string, at: number[], s = 1.5) =>
    glow(box(w, h, d, c, at), s);

  // chassis and body
  box(1.9, 0.3, 4.6, DARK, [0, 0.5, 0]);
  box(2.0, 0.55, 4.4, HULL, [0, 0.9, 0]);
  box(1.8, 0.5, 1.6, HULL2, [0, 1.2, 1.45]); // hood
  box(1.7, 0.1, 1.3, PLATE, [0, 1.5, 1.5], [-8, 0, 0]);
  box(1.85, 0.7, 2.0, HULL, [0, 1.45, -0.5]); // cabin
  box(1.7, 0.12, 1.8, PLATE, [0, 1.85, -0.5]); // roof
  box(1.95, 0.45, 1.0, HULL2, [0, 1.2, -1.9]); // rear
  // windows
  box(1.6, 0.4, 0.06, GLASS, [0, 1.55, 0.55], [-25, 0, 0]);
  for (const s of [1, -1]) {
    box(0.06, 0.34, 1.5, GLASS, [s * 0.93, 1.55, -0.3]);
    box(0.06, 0.3, 0.1, DARK, [s * 0.93, 1.55, -1.1]);
    // side armor plates
    box(0.1, 0.4, 3.0, PLATE, [s * 1.02, 0.85, 0]);
    box(0.12, 0.08, 3.0, HULL2, [s * 1.03, 1.1, 0]);
    // neon side strips
    lit(0.05, 0.05, 3.0, s > 0 ? CYAN : PINK, [s * 1.1, 0.62, 0]);
    // headlights
    lit(0.4, 0.12, 0.06, WHITE, [s * 0.65, 1.2, 2.27], 2);
    lit(0.3, 0.06, 0.06, CYAN, [s * 0.65, 1.05, 2.27], 2);
    // taillights
    lit(0.5, 0.1, 0.06, RED, [s * 0.65, 1.3, -2.42], 2);
    // mirrors
    box(0.25, 0.14, 0.12, DARK, [s * 1.1, 1.65, 0.45]);
    // wheels
    for (const z of [1.45, -1.45]) {
      b.part(new THREE.CylinderGeometry(0.46, 0.46, 0.4, 12), TIRE, {
        at: [s * 0.98, 0.46, z],
        rotation: [0, 0, 90],
      });
      b.part(new THREE.CylinderGeometry(0.26, 0.26, 0.42, 8), RIM, {
        at: [s * 0.99, 0.46, z],
        rotation: [0, 0, 90],
      });
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.46, 6), CYAN, {
        at: [s * 0.99, 0.46, z],
        rotation: [0, 0, 90],
      });
      box(0.2, 0.12, 1.0, DARK, [s * 0.98, 0.95, z]); // arch
    }
  }
  // front bumper / ram
  box(2.1, 0.4, 0.4, PLATE, [0, 0.65, 2.35]);
  box(1.6, 0.2, 0.2, DARK, [0, 0.55, 2.55]);
  for (let i = -3; i <= 3; i++) box(0.12, 0.35, 0.1, HULL2, [i * 0.26, 0.9, 2.3]);
  lit(1.4, 0.05, 0.05, PINK, [0, 0.72, 2.57]);
  // grille
  box(1.0, 0.25, 0.05, DARK, [0, 1.0, 2.26]);
  // emblem
  lit(0.22, 0.22, 0.04, YEL, [0, 1.3, 2.27], 1.2);
  box(0.08, 0.14, 0.05, DARK, [0, 1.3, 2.29]);

  // roof light bar
  box(1.7, 0.1, 0.35, DARK, [0, 2.0, 0.2]);
  for (let i = 0; i < 6; i++) lit(0.26, 0.1, 0.3, i % 2 ? CYAN : PINK, [-0.7 + i * 0.28, 2.1, 0.2], 2);
  // rear neon bar
  lit(1.7, 0.06, 0.06, CYAN, [0, 1.75, -1.52], 1.8);
  lit(1.2, 0.05, 0.05, PINK, [0, 1.0, -2.43], 1.8);

  // water cannon turret
  b.part(new THREE.CylinderGeometry(0.5, 0.58, 0.2, 10), PLATE, { at: [0, 1.99, -0.8] });
  b.part(new THREE.CylinderGeometry(0.34, 0.4, 0.4, 8), HULL2, { at: [0, 2.28, -0.8] });
  box(0.5, 0.35, 0.6, HULL, [0, 2.6, -0.8]);
  b.part(new THREE.CylinderGeometry(0.1, 0.13, 1.5, 8), PLATE, { at: [0, 2.7, -0.0], rotation: [90 - 10, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.16, 0.12, 0.2, 8), DARK, { at: [0, 2.8, 0.78], rotation: [80, 0, 0] });
  glow(b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 8), CYAN, { at: [0, 2.82, 0.89], rotation: [80, 0, 0] }), 2);
  for (const s of [1, -1]) {
    box(0.1, 0.1, 0.5, DARK, [s * 0.3, 2.55, -0.8]);
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.7, 6), CYAN, { at: [s * 0.32, 2.3, -1.1] });
  }
  // water tank on rear
  b.part(new THREE.CylinderGeometry(0.5, 0.5, 1.2, 10), HULL2, { at: [0, 1.7, -1.75], rotation: [0, 0, 90] });
  lit(1.1, 0.06, 0.06, CYAN, [0, 2.05, -1.75], 1.5);
  // antenna
  box(0.03, 0.7, 0.03, DARK, [0.7, 2.3, -1.6]);
  lit(0.06, 0.06, 0.06, RED, [0.7, 2.67, -1.6], 2);
  // hazard stripes on bumper
  for (let i = -3; i <= 3; i++) box(0.12, 0.08, 0.04, i % 2 ? YEL : DARK, [i * 0.28, 0.5, 2.57]);

  return b.root;
}
```