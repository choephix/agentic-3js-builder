```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Riot Interceptor",
  description: "Corporate riot-control armored interceptor with roof water cannon and neon light bars, cyberpunk style.",
};

const HULL = "#1c2030";
const HULL2 = "#2a3046";
const PLATE = "#10131d";
const STEEL = "#6b7488";
const TIRE = "#0a0a0e";
const CYAN = "#19f0ff";
const MAG = "#ff2bd6";
const YEL = "#ffd21a";
const RED = "#ff2a3c";
const GLASS = "#0c3b52";

export default function build() {
  const b = createBuilder({ name: "interceptor" });
  const P = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { at, ...o });
  const box = (w: number, h: number, d: number, c: string, at: number[], o: any = {}) =>
    P(new THREE.BoxGeometry(w, h, d), c, at, { flat: true, ...o });
  const cyl = (r1: number, r2: number, h: number, seg: number, c: string, at: number[], o: any = {}) =>
    P(new THREE.CylinderGeometry(r1, r2, h, seg), c, at, { flat: true, ...o });
  const X = [0, 0, 1];

  // chassis
  box(2.0, 0.5, 5.0, PLATE, [0, 0.55, 0]);
  box(2.1, 0.55, 4.6, HULL, [0, 0.95, -0.1]);
  // hood sloped
  b.frustumBox([0, 1.0, 1.0], [0, 1.0, 2.5], [2.0, 0.5], [1.7, 0.3], { color: HULL2 });
  // cabin
  b.frustumBox([0, 1.3, -1.6], [0, 1.3, 1.0], [1.9, 0.5], [1.8, 0.6], { color: HULL });
  box(1.8, 0.55, 2.0, HULL2, [0, 1.75, -0.1]);
  box(1.6, 0.1, 1.9, PLATE, [0, 2.05, -0.1]);
  // windows
  box(1.84, 0.34, 0.9, GLASS, [0, 1.8, 0.45], { rotation: [-12, 0, 0] });
  box(1.84, 0.3, 0.6, GLASS, [0, 1.8, -0.9]);
  for (const s of [1, -1]) {
    box(0.04, 0.3, 1.5, GLASS, [s * 0.91, 1.8, -0.1]);
    // armor side plates
    box(0.06, 0.4, 3.6, PLATE, [s * 1.05, 0.85, -0.2]);
    box(0.05, 0.08, 3.2, MAG, [s * 1.09, 0.65, -0.2]);
    glow(b.part(new THREE.BoxGeometry(0.05, 0.08, 3.2), MAG, { at: [s * 1.09, 0.65, -0.2] }), 1.5);
    // wheels
    for (const z of [1.6, -1.6]) {
      cyl(0.5, 0.5, 0.4, 14, TIRE, [s * 1.0, 0.5, z], { dir: [1, 0, 0] });
      cyl(0.28, 0.28, 0.42, 8, STEEL, [s * 1.0, 0.5, z], { dir: [1, 0, 0] });
      cyl(0.1, 0.1, 0.44, 6, CYAN, [s * 1.0, 0.5, z], { dir: [1, 0, 0] });
      box(0.15, 0.7, 1.3, PLATE, [s * 1.0, 0.85, z]);
    }
    // headlights
    glow(P(new THREE.BoxGeometry(0.5, 0.1, 0.06), CYAN, [s * 0.65, 1.0, 2.5]), 2);
    glow(P(new THREE.BoxGeometry(0.4, 0.08, 0.06), RED, [s * 0.7, 1.1, -2.52]), 2);
    // push-bar fins
    box(0.12, 0.5, 0.3, STEEL, [s * 0.7, 0.6, 2.55]);
    // roof siren pods
    box(0.5, 0.18, 0.3, PLATE, [s * 0.55, 2.2, 0.6]);
    glow(P(new THREE.BoxGeometry(0.46, 0.12, 0.26), s > 0 ? RED : CYAN, [s * 0.55, 2.28, 0.6]), 2);
  }
  // roof neon light bar
  box(1.7, 0.1, 0.25, PLATE, [0, 2.15, 0.9]);
  glow(P(new THREE.BoxGeometry(1.6, 0.06, 0.2), CYAN, [0, 2.22, 0.9]), 2);
  glow(P(new THREE.BoxGeometry(1.6, 0.06, 0.2), MAG, [0, 2.2, 0.62]), 2);
  // front bumper ram
  box(2.2, 0.4, 0.3, PLATE, [0, 0.55, 2.55]);
  box(2.0, 0.08, 0.1, YEL, [0, 0.72, 2.72]);
  glow(P(new THREE.BoxGeometry(1.8, 0.05, 0.04), CYAN, [0, 0.5, 2.72]), 2);
  // grille
  box(1.2, 0.3, 0.06, "#05060a", [0, 0.9, 2.52]);
  for (let i = -2; i <= 2; i++) box(0.04, 0.26, 0.08, MAG, [i * 0.2, 0.9, 2.54]);
  // roof water cannon
  cyl(0.45, 0.5, 0.2, 10, PLATE, [0, 2.2, -0.9]);
  cyl(0.3, 0.3, 0.4, 10, HULL2, [0, 2.5, -0.9]);
  box(0.5, 0.5, 0.5, HULL, [0, 2.85, -0.9]);
  cyl(0.15, 0.15, 1.3, 10, STEEL, [0, 2.95, -0.2], { dir: [0, 0.12, 1] });
  cyl(0.2, 0.2, 0.2, 10, YEL, [0, 2.95, -0.55], { dir: [0, 0.12, 1] });
  cyl(0.2, 0.12, 0.25, 10, PLATE, [0, 3.0, 0.5], { dir: [0, 0.12, 1] });
  glow(cyl(0.1, 0.1, 0.05, 10, CYAN, [0, 3.02, 0.64], { dir: [0, 0.12, 1] }), 2);
  // water tank on back
  cyl(0.55, 0.55, 1.4, 12, STEEL, [0, 1.45, -1.9], { dir: [1, 0, 0], rotation: [0, 0, 90] });
  for (const x of [-0.5, 0, 0.5]) cyl(0.57, 0.57, 0.08, 12, YEL, [x, 1.45, -1.9], { dir: [1, 0, 0] });
  glow(box(1.0, 0.08, 0.05, CYAN, [0, 1.45, -2.62]), 1.5);
  // corporate emblem on door sides
  for (const s of [1, -1]) {
    box(0.03, 0.25, 0.7, MAG, [s * 0.93, 1.25, -0.1]);
    glow(box(0.03, 0.12, 0.4, CYAN, [s * 0.95, 1.25, -0.1]), 1.5);
  }
  // antenna
  cyl(0.015, 0.015, 0.8, 5, STEEL, [0.7, 2.5, -1.3]);
  glow(P(new THREE.SphereGeometry(0.04, 6, 4), RED, [0.7, 2.92, -1.3]), 2);
  void X;
  return b.root;
}
```