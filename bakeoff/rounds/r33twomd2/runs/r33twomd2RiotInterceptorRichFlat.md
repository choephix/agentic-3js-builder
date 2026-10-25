```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Riot-Control Interceptor",
  description:
    "Corporate armored riot-control truck with a roof water cannon, hazard ram bumper and neon light bars, in a Cyberpunk 2077 style.",
};

const HULL = "#1b1d26";
const HULL2 = "#2a2d3a";
const PLATE = "#3a3f52";
const DARK = "#0b0b10";
const GLASS = "#0f2a3a";
const MAG = "#ff2bd6";
const CYAN = "#19f3ff";
const RED = "#ff2a3c";
const BLUE = "#2a5cff";
const YEL = "#ffd21a";
const WHITE = "#e8f6ff";
const TIRE = "#101014";
const STEEL = "#7d8599";
const TANK = "#2b5d78";

export default function build() {
  const b = createBuilder({ name: "interceptor" });

  const box = (w: number, h: number, d: number, color: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: at as [number, number, number], rotation: rot as any });
  const cylZ = (r: number, len: number, color: string, at: number[], seg = 12) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at: at as [number, number, number], rotation: [90, 0, 0] });
  const cylX = (r: number, len: number, color: string, at: number[], seg = 12) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at: at as [number, number, number], rotation: [0, 0, 90] });
  const cylY = (r: number, len: number, color: string, at: number[], seg = 12) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at: at as [number, number, number] });

  // ---- chassis & hull
  box(2.3, 0.8, 5.8, HULL, [0, 1.0, 0]);
  box(2.0, 0.25, 5.6, DARK, [0, 0.62, 0]);
  // hood
  box(2.2, 0.5, 1.5, HULL2, [0, 1.65, 2.05]);
  box(2.2, 0.3, 0.6, HULL2, [0, 1.55, 2.85], [-12, 0, 0]);
  // cabin
  box(2.2, 1.0, 1.4, HULL2, [0, 1.9, 0.5]);
  box(2.0, 0.75, 0.05, GLASS, [0, 2.12, 1.25], [-42, 0, 0]);
  box(2.15, 0.08, 1.45, PLATE, [0, 2.44, 0.5]);
  // rear compartment
  box(2.3, 1.1, 2.9, HULL, [0, 1.95, -1.9]);
  box(2.1, 0.1, 2.8, PLATE, [0, 2.54, -1.9]);
  // rear doors
  box(2.0, 0.9, 0.05, PLATE, [0, 1.95, -3.37]);
  box(0.04, 0.9, 0.06, DARK, [0, 1.95, -3.4]);
  for (const s of [1, -1]) for (let i = 0; i < 3; i++)
    box(0.9, 0.08, 0.05, i % 2 ? YEL : DARK, [s * 0.5, 1.65 + i * 0.25, -3.41], [0, 0, s * 12]);

  // ---- cab side windows, doors, emblems
  for (const s of [1, -1]) {
    box(0.04, 0.5, 1.0, GLASS, [s * 1.12, 2.1, 0.55]);
    box(0.05, 0.04, 1.1, CYAN, [s * 1.12, 2.38, 0.55]);
    box(0.06, 0.8, 0.04, DARK, [s * 1.12, 1.9, -0.18]);
    // side armor plates
    box(0.1, 0.7, 2.5, PLATE, [s * 1.2, 1.9, -1.9]);
    for (let i = 0; i < 4; i++) box(0.12, 0.06, 0.5, i % 2 ? DARK : YEL, [s * 1.2, 1.5, -0.9 - i * 0.6]);
    // corp emblem (hexagon + core)
    b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.04, 6), MAG, { at: [s * 1.26, 2.0, -1.9], rotation: [0, 0, 90] });
    b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 6), DARK, { at: [s * 1.27, 2.0, -1.9], rotation: [0, 0, 90] });
    glow(box(0.06, 0.28, 0.06, CYAN, [s * 1.3, 2.0, -1.9]), 1.5);
    glow(box(0.06, 0.06, 0.3, CYAN, [s * 1.3, 2.0, -1.9]), 1.5);
    // neon side strips
    glow(box(0.04, 0.05, 5.4, MAG, [s * 1.16, 1.3, 0]), 1.6);
    glow(box(0.04, 0.04, 2.4, CYAN, [s * 1.21, 2.3, -1.9]), 1.4);
    // underglow
    glow(box(0.05, 0.05, 1.6, MAG, [s * 1.0, 0.5, 0.2]), 1.5);
    glow(box(0.05, 0.05, 1.3, MAG, [s * 1.0, 0.5, -2.2]), 1.5);
    // mirrors
    box(0.1, 0.4, 0.22, DARK, [s * 1.38, 2.2, 1.05]);
    glow(box(0.06, 0.06, 0.2, RED, [s * 1.38, 2.0, 1.05]), 1.2);
    // headlights
    glow(box(0.5, 0.16, 0.1, WHITE, [s * 0.8, 1.6, 2.88], [0, 0, 0]), 1.8);
    glow(box(0.5, 0.05, 0.12, CYAN, [s * 0.8, 1.74, 2.89]), 1.8);
    // taillights
    glow(box(0.4, 0.14, 0.08, RED, [s * 0.85, 1.35, -2.92]), 1.8);
    // fender flares
    box(0.12, 0.2, 1.4, HULL2, [s * 1.25, 1.2, 1.8]);
    box(0.12, 0.2, 1.4, HULL2, [s * 1.25, 1.2, -1.2]);
    box(0.12, 0.2, 1.0, HULL2, [s * 1.25, 1.2, -2.5]);
    // water tank gauges on rear
    glow(box(0.05, 0.4, 0.1, CYAN, [s * 1.2, 2.2, -3.0]), 1.4);
    // push-bar posts
    box(0.14, 0.6, 0.14, STEEL, [s * 0.95, 1.1, 3.05]);
  }

  // ---- front: grille, ram bumper with hazard stripes
  box(1.8, 0.45, 0.1, DARK, [0, 1.15, 2.92]);
  for (let i = 0; i < 5; i++) glow(box(1.5, 0.03, 0.04, MAG, [0, 1.0 + i * 0.1, 2.98]), 1.3);
  box(2.5, 0.5, 0.35, PLATE, [0, 0.8, 3.0]);
  for (let i = 0; i < 9; i++) box(0.22, 0.4, 0.04, i % 2 ? DARK : YEL, [-1.0 + i * 0.25, 0.8, 3.19], [0, 0, i % 2 ? 0 : 0]);
  box(2.5, 0.12, 0.5, STEEL, [0, 0.52, 3.05], [15, 0, 0]);
  box(2.0, 0.1, 0.4, DARK, [0, 1.4, 3.0], [-20, 0, 0]);

  // ---- roof light bars (neon red/blue strobes)
  box(2.0, 0.1, 0.35, DARK, [0, 2.54, 0.9]);
  for (let i = 0; i < 6; i++) {
    glow(box(0.3, 0.14, 0.3, i < 3 ? RED : BLUE, [-0.83 + i * 0.33, 2.64, 0.9]), 2);
  }
  glow(box(2.0, 0.04, 0.05, WHITE, [0, 2.5, 1.2]), 1.6);
  // rear light bar
  box(2.0, 0.1, 0.25, DARK, [0, 2.62, -3.2]);
  for (let i = 0; i < 6; i++) glow(box(0.3, 0.1, 0.2, i % 2 ? RED : BLUE, [-0.83 + i * 0.33, 2.7, -3.2]), 2);
  // spotlights on cab
  for (const s of [1, -1]) {
    box(0.1, 0.25, 0.1, STEEL, [s * 1.0, 2.6, 0.2]);
    cylZ(0.12, 0.2, DARK, [s * 1.0, 2.8, 0.3]);
    glow(cylZ(0.09, 0.05, WHITE, [s * 1.0, 2.8, 0.42]), 2);
  }

  // ---- water tanks on rear roof
  cylX(0.38, 1.9, TANK, [0, 2.95, -2.6], 10);
  for (const s of [1, -1]) cylX(0.4, 0.08, STEEL, [s * 0.96, 2.95, -2.6], 10);
  glow(box(1.3, 0.05, 0.05, CYAN, [0, 3.2, -2.35]), 1.4);
  box(0.12, 0.4, 0.5, PLATE, [0.6, 2.7, -2.6]);
  box(0.12, 0.4, 0.5, PLATE, [-0.6, 2.7, -2.6]);

  // ---- water cannon turret
  const tz = -1.15;
  cylY(0.5, 0.15, PLATE, [0, 2.65, tz], 10);
  cylY(0.35, 0.3, HULL2, [0, 2.85, tz], 8);
  box(0.7, 0.45, 0.8, HULL2, [0, 3.2, tz]);
  glow(box(0.5, 0.05, 0.05, MAG, [0, 3.32, tz + 0.42]), 1.6);
  // barrel (pointing +Z)
  cylZ(0.14, 1.8, STEEL, [0, 3.2, tz + 1.2], 10);
  cylZ(0.2, 0.2, PLATE, [0, 3.2, tz + 0.5], 10);
  cylZ(0.17, 0.12, MAG, [0, 3.2, tz + 1.5], 10);
  cylZ(0.2, 0.25, DARK, [0, 3.2, tz + 2.0], 10);
  glow(cylZ(0.1, 0.05, CYAN, [0, 3.2, tz + 2.14], 10), 2);
  // hose to tank
  cylZ(0.06, 0.8, DARK, [0.3, 3.15, tz - 0.8], 6);
  // side sensor pods on turret
  for (const s of [1, -1]) {
    box(0.18, 0.2, 0.3, DARK, [s * 0.44, 3.25, tz + 0.1]);
    glow(box(0.05, 0.05, 0.05, RED, [s * 0.54, 3.28, tz + 0.26]), 2);
  }

  // ---- antennas
  cylY(0.015, 1.0, STEEL, [0.9, 3.0, -0.1], 5);
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), RED, { at: [0.9, 3.52, -0.1] }), 2);
  cylY(0.012, 0.7, STEEL, [-0.9, 2.9, -0.1], 5);
  box(0.3, 0.2, 0.04, DARK, [-0.9, 3.2, -0.1]);
  glow(box(0.2, 0.1, 0.02, CYAN, [-0.9, 3.2, -0.08]), 1.5);

  // ---- wheels
  for (const s of [1, -1])
    for (const z of [1.9, -1.2, -2.4]) {
      cylX(0.55, 0.5, TIRE, [s * 1.3, 0.55, z], 14);
      cylX(0.34, 0.54, STEEL, [s * 1.3, 0.55, z], 8);
      b.part(new THREE.TorusGeometry(0.4, 0.03, 4, 14), MAG, { at: [s * 1.57, 0.55, z], rotation: [0, 90, 0] });
      glow(b.part(new THREE.TorusGeometry(0.4, 0.03, 4, 14), MAG, { at: [s * 1.575, 0.55, z], rotation: [0, 90, 0] }), 1.6);
      cylX(0.1, 0.58, DARK, [s * 1.3, 0.55, z], 6);
    }

  // ---- rear bumper
  box(2.3, 0.3, 0.2, PLATE, [0, 0.8, -3.0]);
  glow(box(1.6, 0.04, 0.04, MAG, [0, 0.58, -3.12]), 1.5);

  return b.root;
}
```