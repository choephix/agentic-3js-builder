```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Convoy Hauler",
  description: "Low-poly cyberpunk armoured six-wheel hauler guarding a sealed hex cargo pod, with neon trim and a roof turret.",
};

const HULL = "#2b3040";
const HULL_D = "#1a1d28";
const PLATE = "#3d4559";
const PLATE_L = "#5a6580";
const TIRE = "#111218";
const RIM = "#8a93a8";
const CYAN = "#22f0ff";
const MAG = "#ff2bb4";
const AMBER = "#ffb02e";
const RED = "#ff2a3a";
const HAZ = "#e8c41c";
const POD = "#394a5e";
const POD_D = "#232d3c";

export default function build() {
  const b = createBuilder({ name: "convoyHauler" });

  const box = (w: number, h: number, d: number, color: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: at as [number, number, number], rotation: rot as any });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: number[], rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at: at as [number, number, number], rotation: rot as any, flat: true });
  const lit = (p: any, s = 1.4) => glow(p, s);

  // ---------- chassis ----------
  box(2.3, 0.5, 8.6, HULL_D, [0, 0.8, 0]);
  box(2.0, 0.3, 8.0, HULL, [0, 0.6, 0]);
  for (const s of [1, -1]) {
    // side skirts and armour plates
    box(0.14, 0.55, 7.6, PLATE, [s * 1.22, 0.85, -0.2]);
    box(0.06, 0.1, 7.6, PLATE_L, [s * 1.3, 1.08, -0.2]);
    // underglow
    lit(box(0.06, 0.06, 7.0, CYAN, [s * 1.0, 0.45, -0.2]), 1.6);
    // fenders over wheels
    for (const z of [3.0, -1.5, -3.0]) {
      box(0.7, 0.14, 1.5, PLATE, [s * 1.3, 1.3, z]);
      box(0.12, 0.4, 1.5, PLATE, [s * 1.62, 1.12, z]);
    }
    // wheels
    for (const z of [3.0, -1.5, -3.0]) {
      cyl(0.65, 0.65, 0.55, 10, TIRE, [s * 1.3, 0.65, z], [0, 0, 90]);
      cyl(0.36, 0.36, 0.6, 6, RIM, [s * 1.3, 0.65, z], [0, 0, 90]);
      cyl(0.14, 0.14, 0.66, 6, HULL_D, [s * 1.3, 0.65, z], [0, 0, 90]);
      lit(cyl(0.3, 0.3, 0.02, 10, CYAN, [s * 1.6, 0.65, z], [0, 0, 90]), 1.2);
    }
  }
  // axles
  for (const z of [3.0, -1.5, -3.0]) cyl(0.12, 0.12, 2.6, 6, HULL_D, [0, 0.65, z], [0, 0, 90]);

  // ---------- cab ----------
  box(2.4, 1.5, 2.2, HULL, [0, 2.0, 2.7]);
  box(2.5, 0.2, 2.3, PLATE, [0, 2.8, 2.7]); // roof plate
  box(2.1, 0.12, 1.5, PLATE_L, [0, 2.92, 2.5]);
  // hood
  box(2.3, 0.9, 1.4, HULL, [0, 1.55, 4.0]);
  box(2.2, 0.15, 1.3, PLATE, [0, 2.05, 4.0], [-8, 0, 0]);
  // windshield
  lit(box(2.0, 0.65, 0.08, CYAN, [0, 2.45, 3.82], [-20, 0, 0]), 0.9);
  box(2.1, 0.08, 0.1, HULL_D, [0, 2.8, 3.74]);
  for (const s of [1, -1]) {
    lit(box(0.05, 0.55, 0.9, CYAN, [s * 1.21, 2.45, 3.0]), 0.8); // side windows
    box(0.08, 0.1, 1.0, HULL_D, [s * 1.23, 2.12, 3.0]);
    // door emblem: chevrons
    box(0.04, 0.08, 0.5, MAG, [s * 1.21, 1.7, 2.3], [0, 0, 0]);
    box(0.04, 0.08, 0.35, MAG, [s * 1.21, 1.55, 2.4]);
    // mirrors
    box(0.1, 0.4, 0.12, HULL_D, [s * 1.45, 2.4, 3.6]);
    box(0.05, 0.4, 0.25, PLATE, [s * 1.5, 2.4, 3.6]);
    // headlights
    lit(box(0.5, 0.18, 0.08, "#fff6c8", [s * 0.85, 1.7, 4.72]), 2);
    // fog/side lamps
    lit(box(0.3, 0.1, 0.08, AMBER, [s * 0.85, 1.35, 4.73]), 1.5);
    // exhaust stacks
    cyl(0.12, 0.12, 2.0, 6, PLATE_L, [s * 1.0, 3.3, 1.4]);
    cyl(0.15, 0.12, 0.2, 6, HULL_D, [s * 1.0, 4.35, 1.4]);
    lit(cyl(0.1, 0.1, 0.04, 6, AMBER, [s * 1.0, 4.46, 1.4]), 1.5);
    // front armour wedges
    box(0.12, 0.9, 1.4, PLATE, [s * 1.2, 1.55, 4.0]);
  }
  // grille and bull bar
  box(2.0, 0.7, 0.12, HULL_D, [0, 1.45, 4.72]);
  for (let i = -3; i <= 3; i++) box(0.06, 0.6, 0.06, PLATE_L, [i * 0.25, 1.45, 4.8]);
  box(2.6, 0.35, 0.3, PLATE, [0, 0.95, 4.75]);
  for (let i = -4; i <= 4; i++) b.part(new THREE.ConeGeometry(0.1, 0.35, 4), HAZ, { at: [i * 0.3, 0.95, 5.05], rotation: [90, 45, 0], flat: true });
  box(2.6, 0.08, 0.08, HAZ, [0, 1.15, 4.92]);
  // light bar
  box(2.0, 0.14, 0.2, HULL_D, [0, 3.05, 3.5]);
  for (let i = -3; i <= 3; i++) lit(box(0.22, 0.1, 0.06, i % 2 ? MAG : CYAN, [i * 0.28, 3.05, 3.62]), 1.8);

  // ---------- turret ----------
  cyl(0.5, 0.6, 0.2, 8, PLATE, [0, 3.1, 1.9]);
  box(0.9, 0.45, 1.0, HULL, [0, 3.4, 1.9]);
  box(0.8, 0.12, 0.7, PLATE_L, [0, 3.7, 1.85]);
  for (const s of [1, -1]) {
    box(0.1, 0.1, 1.5, HULL_D, [s * 0.28, 3.4, 2.9]);
    cyl(0.08, 0.08, 0.3, 6, PLATE_L, [s * 0.28, 3.4, 3.7], [90, 0, 0]);
    lit(box(0.08, 0.08, 0.04, RED, [s * 0.28, 3.4, 3.88]), 1.8);
  }
  lit(box(0.5, 0.1, 0.06, RED, [0, 3.5, 2.42]), 1.8); // sensor eye

  // antennas
  for (const [x, z, h] of [[-0.9, 1.7, 1.6], [0.8, 1.2, 1.1]] as number[][]) {
    cyl(0.025, 0.04, h, 5, HULL_D, [x, 2.9 + h / 2, z]);
    lit(b.part(new THREE.SphereGeometry(0.06, 6, 4), MAG, { at: [x, 2.9 + h, z] }), 2);
  }

  // ---------- cargo pod ----------
  const PZ = -1.45, PY = 2.35, PL = 5.6;
  cyl(1.4, 1.4, PL, 6, POD, [0, PY, PZ], [90, 0, 0]);
  // cradle under pod
  box(2.4, 0.3, PL + 0.4, HULL_D, [0, 1.15, PZ]);
  // ribs
  for (let i = 0; i < 7; i++) {
    const z = PZ - PL / 2 + 0.3 + i * (PL - 0.6) / 6;
    cyl(1.5, 1.5, 0.22, 6, i % 3 === 1 ? POD_D : PLATE, [0, PY, z], [90, 0, 0]);
  }
  // hazard bands + neon seam
  for (const z of [PZ + 1.35, PZ - 1.35]) {
    cyl(1.46, 1.46, 0.3, 6, HAZ, [0, PY, z], [90, 0, 0]);
    for (const s of [1, -1]) box(0.05, 0.3, 0.12, HULL_D, [s * 1.27, PY, z]);
  }
  // sealed top strip with locks
  lit(box(0.3, 0.06, PL - 0.4, MAG, [0, PY + 1.22, PZ]), 1.5);
  box(0.8, 0.1, PL - 0.8, PLATE_L, [0, PY + 1.3, PZ]);
  lit(box(0.3, 0.06, PL - 0.4, MAG, [0, PY + 1.2, PZ]), 1.5);
  for (let i = 0; i < 4; i++) {
    const z = PZ - 2 + i * 1.33;
    box(0.5, 0.18, 0.3, HULL_D, [0, PY + 1.38, z]);
    lit(box(0.1, 0.06, 0.1, RED, [0, PY + 1.5, z]), 2);
  }
  // side panels with glowing glyph strips
  for (const s of [1, -1]) {
    box(0.08, 0.9, 3.4, PLATE, [s * 1.45, PY - 0.05, PZ + 0.1], [0, 0, 0]);
    for (let i = 0; i < 5; i++) lit(box(0.06, 0.12, 0.35, i % 2 ? CYAN : MAG, [s * 1.5, PY + 0.1 - (i % 2) * 0.1, PZ + 1.4 - i * 0.7]), 1.4);
    lit(box(0.06, 0.06, 4.6, CYAN, [s * 1.23, PY - 0.75, PZ]), 1.3);
    // grab rails
    box(0.06, 0.06, 4.0, PLATE_L, [s * 1.55, PY - 0.5, PZ]);
  }
  // rear door
  const RZ = PZ - PL / 2 - 0.1;
  cyl(1.3, 1.3, 0.18, 6, POD_D, [0, PY, RZ], [90, 0, 0]);
  box(0.12, 1.9, 0.08, HULL_D, [0, PY, RZ - 0.1]);
  lit(cyl(0.3, 0.3, 0.08, 6, RED, [0, PY, RZ - 0.14], [90, 0, 0]), 1.8);
  for (const s of [1, -1]) {
    box(0.18, 0.5, 0.1, PLATE_L, [s * 0.7, PY + 0.5, RZ - 0.12]);
    box(0.18, 0.5, 0.1, PLATE_L, [s * 0.7, PY - 0.5, RZ - 0.12]);
    // tail lights
    lit(box(0.5, 0.16, 0.08, RED, [s * 0.85, 1.2, -4.38]), 2);
  }
  // rear bumper
  box(2.5, 0.35, 0.3, PLATE, [0, 0.95, -4.5]);
  for (let i = -4; i <= 4; i++) box(0.2, 0.12, 0.05, i % 2 ? HAZ : HULL_D, [i * 0.27, 0.95, -4.67]);
  // rear escort drone dock plate
  box(1.6, 0.1, 1.0, PLATE, [0, PY + 1.4, PZ - 2.3]);
  lit(box(1.2, 0.04, 0.6, CYAN, [0, PY + 1.47, PZ - 2.3]), 1.2);

  // fuel tanks
  for (const s of [1, -1]) {
    cyl(0.28, 0.28, 1.3, 8, PLATE_L, [s * 1.25, 0.95, 0.9], [90, 0, 0]);
    box(0.5, 0.06, 0.06, HAZ, [s * 1.25, 1.1, 0.9]);
  }

  return b.root;
}
```