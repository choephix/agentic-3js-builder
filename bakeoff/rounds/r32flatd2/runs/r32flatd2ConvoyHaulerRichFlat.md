```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Convoy Hauler",
  description: "Low-poly cyberpunk armoured convoy hauler guarding a sealed, neon-banded cargo pod.",
};

const HULL = "#23283a";
const PLATE = "#3a4256";
const PLATE_HI = "#505a74";
const YELLOW = "#f2c230";
const BLACK = "#0f1016";
const TIRE = "#14141a";
const RIM = "#7b8499";
const MAGENTA = "#ff2fa0";
const CYAN = "#35f2ff";
const RED = "#ff3050";
const POD = "#c9d2e0";
const POD_DARK = "#8a94aa";

export default function build() {
  const b = createBuilder({ name: "convoyHauler" });

  const box = (w: number, h: number, d: number, color: string, at: [number, number, number], rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: [number, number, number], dir: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, dir });
  const lit = (w: number, h: number, d: number, color: string, at: [number, number, number], str = 1.4, rot?: [number, number, number]) =>
    glow(box(w, h, d, color, at, rot), str);

  // ---- chassis ----
  box(2.6, 0.4, 9, HULL, [0, 0.95, 0]);
  box(1.6, 0.3, 8.6, BLACK, [0, 0.72, 0]);
  for (const s of [1, -1]) {
    box(0.12, 0.5, 8.6, PLATE, [s * 1.3, 1.0, 0]); // skirt rails
    lit(0.05, 0.06, 8, MAGENTA, [s * 1.34, 0.68, 0], 1.6); // underglow
    // fuel / battery tanks between axles
    cyl(0.32, 0.32, 1.6, 8, PLATE_HI, [s * 1.2, 0.95, -0.35], [0, 0, 1]);
    lit(0.04, 0.12, 0.9, CYAN, [s * 1.54, 0.95, -0.35], 1.3);
  }

  // ---- wheels ----
  const axles = [3.3, 1.9, -2.6, -3.8];
  for (const z of axles)
    for (const s of [1, -1]) {
      cyl(0.7, 0.7, 0.55, 10, TIRE, [s * 1.4, 0.7, z], [1, 0, 0]);
      cyl(0.42, 0.42, 0.6, 8, RIM, [s * 1.4, 0.7, z], [1, 0, 0]);
      glow(cyl(0.3, 0.3, 0.66, 8, MAGENTA, [s * 1.4, 0.7, z], [1, 0, 0]), 1.3);
      cyl(0.16, 0.16, 0.7, 6, BLACK, [s * 1.4, 0.7, z], [1, 0, 0]);
      // fender
      box(0.7, 0.12, 1.7, PLATE, [s * 1.45, 1.5, z]);
      box(0.14, 0.4, 1.7, PLATE, [s * 1.78, 1.32, z]);
    }

  // ---- cab ----
  box(2.6, 1.2, 2.4, PLATE, [0, 1.75, 3.2]);
  box(2.4, 0.8, 1.0, HULL, [0, 1.55, 4.55]); // hood
  box(2.4, 0.2, 1.0, PLATE_HI, [0, 2.05, 4.55], [-10, 0, 0]);
  box(2.4, 0.3, 1.9, HULL, [0, 2.5, 3.0]); // roof
  box(2.2, 0.12, 1.6, PLATE_HI, [0, 2.7, 3.0]);
  // windshield + side windows
  lit(2.0, 0.6, 0.08, CYAN, [0, 2.2, 4.1], 0.9, [-25, 0, 0]);
  box(2.1, 0.12, 0.12, BLACK, [0, 2.5, 4.12]);
  for (const s of [1, -1]) {
    lit(0.06, 0.45, 1.0, CYAN, [s * 1.32, 2.2, 3.5], 0.8);
    // armour plates + hazard chevrons
    box(0.12, 0.9, 1.9, PLATE_HI, [s * 1.36, 1.5, 2.8]);
    for (let i = 0; i < 4; i++) box(0.14, 0.9, 0.18, YELLOW, [s * 1.37, 1.5, 2.0 + i * 0.5], [0, 0, 0]);
    // headlights
    lit(0.45, 0.22, 0.1, "#ffffff", [s * 0.85, 1.55, 5.07], 2);
    lit(0.2, 0.1, 0.1, CYAN, [s * 0.85, 1.35, 5.07], 1.5);
    // exhaust stacks behind cab
    cyl(0.12, 0.12, 2.2, 6, "#6a6f80", [s * 1.1, 2.7, 1.85], [0, 1, 0]);
    cyl(0.16, 0.16, 0.12, 6, BLACK, [s * 1.1, 3.82, 1.85], [0, 1, 0]);
    // mirror arms
    box(0.5, 0.1, 0.1, BLACK, [s * 1.55, 2.2, 3.9]);
    box(0.08, 0.4, 0.22, PLATE_HI, [s * 1.8, 2.2, 3.9]);
  }
  box(2.6, 1.2, 0.25, BLACK, [0, 1.75, 2.05]);

  // ---- front ram bumper ----
  box(2.8, 0.55, 0.5, PLATE_HI, [0, 1.0, 5.15]);
  box(2.2, 0.35, 0.4, HULL, [0, 1.0, 5.5], [0, 0, 0]);
  for (let i = -3; i <= 3; i++) {
    b.part(new THREE.ConeGeometry(0.12, 0.35, 4), YELLOW, { at: [i * 0.38, 1.0, 5.75], dir: [0, 0, 1] });
  }
  lit(2.0, 0.06, 0.06, MAGENTA, [0, 0.7, 5.42], 1.6);

  // ---- roof turret & light bar ----
  cyl(0.5, 0.6, 0.25, 8, PLATE_HI, [0, 2.95, 2.6], [0, 1, 0]);
  box(0.9, 0.5, 1.0, HULL, [0, 3.3, 2.6]);
  box(0.7, 0.25, 0.5, PLATE, [0, 3.6, 2.7]);
  for (const s of [1, -1]) {
    cyl(0.07, 0.07, 1.6, 6, BLACK, [s * 0.22, 3.3, 3.5], [0, 0, 1]);
    cyl(0.1, 0.1, 0.25, 6, "#6a6f80", [s * 0.22, 3.3, 4.3], [0, 0, 1]);
    lit(0.06, 0.1, 0.06, RED, [s * 0.5, 3.45, 3.12], 1.8);
  }
  lit(1.8, 0.12, 0.2, MAGENTA, [0, 2.84, 3.88], 1.6);
  lit(0.5, 0.1, 0.1, CYAN, [0, 3.62, 3.0], 1.5);
  // antennas
  for (const [x, h] of [[-1.0, 1.8], [1.0, 1.3]] as const) {
    cyl(0.025, 0.04, h, 5, BLACK, [x, 2.85 + h / 2, 2.2], [0, 1, 0]);
    glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), RED, { at: [x, 2.85 + h, 2.2] }), 2);
  }

  // ---- cargo pod ----
  for (const z of [-2.7, -1.1, 0.5]) {
    box(2.2, 0.35, 0.5, PLATE, [0, 1.33, z]); // cradle
    for (const s of [1, -1]) box(0.18, 0.8, 0.5, PLATE_HI, [s * 1.05, 1.9, z]); // clamp
  }
  cyl(1.2, 1.2, 4.6, 10, POD, [0, 2.65, -1.1], [0, 0, 1]);
  b.part(new THREE.ConeGeometry(1.2, 0.5, 10), POD_DARK, { at: [0, 2.65, 1.45], dir: [0, 0, 1] });
  b.part(new THREE.ConeGeometry(1.2, 0.5, 10), POD_DARK, { at: [0, 2.65, -3.65], dir: [0, 0, -1] });
  for (const z of [-3.0, -1.9, -0.3, 0.8]) {
    cyl(1.26, 1.26, 0.18, 10, PLATE, [0, 2.65, z], [0, 0, 1]);
    cyl(1.28, 1.28, 0.05, 10, MAGENTA, [0, 2.65, z + 0.11], [0, 0, 1]);
    glow(cyl(1.28, 1.28, 0.04, 10, MAGENTA, [0, 2.65, z + 0.11], [0, 0, 1]), 1.5);
  }
  // top spine + sensor window strip
  box(0.35, 0.12, 4.2, PLATE, [0, 3.88, -1.1]);
  for (const s of [1, -1]) {
    lit(0.06, 0.28, 2.2, CYAN, [s * 1.12, 3.05, -1.1], 1.2, [0, 0, s * -25]);
    // hazard placard on side
    box(0.06, 0.7, 0.8, YELLOW, [s * 1.21, 2.5, -2.45], [0, 0, s * -15]);
    box(0.08, 0.15, 0.55, BLACK, [s * 1.23, 2.5, -2.45], [0, 0, s * -15]);
    box(0.08, 0.4, 0.2, BLACK, [s * 1.2, 2.2, -0.9], [0, 0, s * -30]);
  }
  // rear pod hatch
  glow(b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 8), CYAN, { at: [0, 2.65, -4.02], dir: [0, 0, 1] }), 1.2);
  cyl(0.36, 0.36, 0.08, 8, BLACK, [0, 2.65, -4.03], [0, 0, 1]);

  // ---- rear ----
  box(2.6, 0.7, 0.4, PLATE_HI, [0, 1.1, -4.7]);
  for (const s of [1, -1]) {
    lit(0.55, 0.18, 0.08, RED, [s * 0.85, 1.2, -4.93], 2);
    box(0.12, 1.4, 0.3, HULL, [s * 1.3, 1.9, -4.5]);
  }
  lit(1.0, 0.06, 0.06, MAGENTA, [0, 0.82, -4.93], 1.6);
  box(0.9, 0.3, 0.06, YELLOW, [0, 1.0, -4.93]);

  return b.root;
}
```