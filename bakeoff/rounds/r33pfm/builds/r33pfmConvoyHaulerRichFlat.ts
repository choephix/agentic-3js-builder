import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Convoy Hauler",
  description: "Low-poly cyberpunk armoured convoy hauler guarding a sealed, neon-seamed cargo pod.",
};

const HULL = "#2b3040";
const HULL_LT = "#434a60";
const HULL_DK = "#161923";
const PLATE = "#3a4258";
const RUST = "#6b4a3a";
const TYRE = "#101114";
const HUB = "#7b8296";
const POD = "#8d95a8";
const POD_DK = "#555c70";
const YELLOW = "#f2c418";
const BLACK = "#0b0b0f";
const CYAN = "#19f0ff";
const MAGENTA = "#ff2fa8";
const AMBER = "#ffae1f";
const RED = "#ff2a3a";
const GLASS = "#0f5560";

export default function build() {
  const b = createBuilder({ name: "convoy_hauler" });
  type V = [number, number, number];

  const box = (size: V, color: string, at: V, rot: V = [0, 0, 0], g = 0) => {
    const p = b.part(new THREE.BoxGeometry(...size), color, { at, rotation: rot, flat: true });
    if (g) glow(p, g);
    return p;
  };
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: V, rot: V = [0, 0, 0], g = 0) => {
    const p = b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, rotation: rot, flat: true });
    if (g) glow(p, g);
    return p;
  };

  // ---- Chassis ----
  box([2.4, 0.5, 8.7], HULL_DK, [0, 1.15, -0.05]);
  box([2.0, 0.2, 8.4], HULL, [0, 0.85, -0.05]);
  // rails
  for (const s of [1, -1]) {
    box([0.18, 0.3, 8.8], HULL_LT, [s * 1.2, 1.0, -0.05]);
    // skirt armour plates along the side
    for (let i = 0; i < 4; i++) {
      const z = 1.0 - i * 1.55;
      box([0.14, 0.7, 1.4], PLATE, [s * 1.38, 1.45, z], [0, 0, s * 4]);
      box([0.04, 0.06, 1.1], YELLOW, [s * 1.46, 1.3, z]);
      for (const dz of [-0.55, 0.55]) box([0.06, 0.08, 0.08], HULL_LT, [s * 1.46, 1.65, z + dz]);
    }
    // neon underglow strip
    box([0.05, 0.07, 7.8], CYAN, [s * 1.12, 0.78, -0.1], [0, 0, 0], 1.4);
  }

  // ---- Wheels ----
  const axles = [2.9, -1.2, -3.1];
  for (const z of axles) {
    cyl(0.12, 0.12, 2.6, 8, HUB, [0, 0.7, z], [0, 0, 90]);
    for (const s of [1, -1]) {
      cyl(0.7, 0.7, 0.55, 10, TYRE, [s * 1.38, 0.7, z], [0, 0, 90]);
      cyl(0.42, 0.42, 0.6, 10, HUB, [s * 1.4, 0.7, z], [0, 0, 90]);
      cyl(0.2, 0.2, 0.66, 6, CYAN, [s * 1.4, 0.7, z], [0, 0, 90], 1.2);
      // tread blocks
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * Math.PI * 2;
        box([0.6, 0.12, 0.2], BLACK, [s * 1.38, 0.7 + Math.sin(a) * 0.7, z + Math.cos(a) * 0.7], [(-a * 180) / Math.PI, 0, 0]);
      }
      // fender
      box([0.7, 0.14, 1.7], HULL, [s * 1.38, 1.5, z]);
      box([0.7, 0.35, 0.14], HULL_LT, [s * 1.38, 1.35, z + 0.85], [-30, 0, 0]);
      box([0.7, 0.35, 0.14], HULL_LT, [s * 1.38, 1.35, z - 0.85], [30, 0, 0]);
    }
  }

  // ---- Cab ----
  box([2.7, 1.5, 2.0], HULL, [0, 2.2, 3.1]);
  box([2.75, 0.2, 2.05], HULL_LT, [0, 2.98, 3.1]);
  // hood sloped
  box([2.6, 0.9, 1.2], PLATE, [0, 1.85, 4.15], [0, 0, 0]);
  box([2.6, 0.12, 1.1], HULL_LT, [0, 2.35, 4.15], [10, 0, 0]);
  // windshield
  box([2.3, 0.7, 0.1], GLASS, [0, 2.65, 4.08], [-25, 0, 0], 0.8);
  box([2.4, 0.08, 0.14], HULL_DK, [0, 3.0, 4.0]);
  box([2.4, 0.08, 0.14], HULL_DK, [0, 2.3, 4.17]);
  // side windows
  for (const s of [1, -1]) {
    box([0.06, 0.55, 1.2], GLASS, [s * 1.37, 2.6, 3.3], [0, 0, 0], 0.7);
    box([0.1, 0.75, 1.5], HULL_DK, [s * 1.37, 2.55, 3.3]);
    box([0.06, 0.55, 1.2], GLASS, [s * 1.4, 2.6, 3.3], [0, 0, 0], 0.7);
    // door armour
    box([0.1, 0.5, 1.6], PLATE, [s * 1.4, 1.85, 3.1]);
    box([0.04, 0.05, 1.2], MAGENTA, [s * 1.46, 1.85, 3.1], [0, 0, 0], 1.3);
    // mirrors
    box([0.08, 0.1, 0.1], HULL_DK, [s * 1.55, 2.6, 3.9]);
    box([0.26, 0.4, 0.06], HULL, [s * 1.7, 2.6, 3.9]);
    // headlights
    box([0.5, 0.2, 0.08], "#e8fbff", [s * 0.85, 2.0, 4.78], [0, 0, 0], 1.6);
    box([0.6, 0.3, 0.06], HULL_DK, [s * 0.85, 2.0, 4.74]);
    // ram horns
    box([0.2, 0.2, 0.9], PLATE, [s * 1.2, 1.2, 4.9], [0, s * -12, 0]);
  }
  // grille
  box([1.2, 0.8, 0.08], HULL_DK, [0, 1.8, 4.76]);
  for (let i = 0; i < 4; i++) box([1.1, 0.05, 0.05], MAGENTA, [0, 1.55 + i * 0.18, 4.8], [0, 0, 0], 1.2);
  // bumper ram
  box([2.8, 0.5, 0.5], PLATE, [0, 1.15, 4.85]);
  box([2.8, 0.1, 0.52], YELLOW, [0, 0.95, 4.86]);
  box([2.0, 0.5, 0.3], HULL_LT, [0, 1.15, 5.15], [0, 0, 0]);
  box([2.0, 0.5, 0.3], PLATE, [0, 1.0, 5.1], [25, 0, 0]);
  // light bar
  box([2.2, 0.16, 0.3], HULL_DK, [0, 3.15, 3.8]);
  for (let i = 0; i < 5; i++) box([0.34, 0.12, 0.08], AMBER, [-0.88 + i * 0.44, 3.15, 3.97], [0, 0, 0], 1.6);
  // roof plate & hazard stripes
  box([2.3, 0.06, 1.5], HULL_DK, [0, 3.12, 2.9]);
  for (let i = 0; i < 4; i++) box([0.18, 0.04, 1.5], YELLOW, [-0.75 + i * 0.5, 3.16, 2.9], [0, 0, 0]);

  // ---- Turret ----
  cyl(0.5, 0.55, 0.2, 8, HULL_DK, [0, 3.28, 2.5]);
  box([0.9, 0.4, 0.9], PLATE, [0, 3.58, 2.5]);
  box([0.5, 0.12, 0.5], HULL_LT, [0, 3.84, 2.5]);
  for (const s of [1, -1]) {
    cyl(0.07, 0.07, 1.4, 6, HULL_DK, [s * 0.28, 3.58, 3.3], [90, 0, 0]);
    cyl(0.11, 0.11, 0.3, 6, HUB, [s * 0.28, 3.58, 3.95], [90, 0, 0]);
    cyl(0.04, 0.04, 0.06, 6, CYAN, [s * 0.28, 3.58, 4.12], [90, 0, 0], 1.6);
  }
  box([0.2, 0.2, 0.06], RED, [0, 3.62, 2.04], [0, 0, 0], 1.6);

  // ---- Exhaust & antennae ----
  for (const s of [1, -1]) {
    cyl(0.14, 0.14, 2.2, 8, HULL_LT, [s * 1.2, 3.1, 1.95]);
    cyl(0.17, 0.17, 0.2, 8, HULL_DK, [s * 1.2, 4.2, 1.95]);
    cyl(0.08, 0.08, 0.05, 8, AMBER, [s * 1.2, 4.32, 1.95], [0, 0, 0], 1.3);
    box([0.1, 0.1, 0.5], PLATE, [s * 1.2, 2.6, 2.1]);
  }
  cyl(0.02, 0.02, 1.8, 5, HULL_DK, [-1.1, 4.1, 2.9], [0, 0, 6]);
  cyl(0.05, 0.05, 0.1, 5, MAGENTA, [-1.1, 5.0, 2.9], [0, 0, 6], 1.6);
  box([0.5, 0.3, 0.05], HULL_DK, [0.9, 3.45, 3.0], [0, 0, 0]);
  cyl(0.18, 0.18, 0.08, 8, CYAN, [0.9, 3.5, 3.04], [90, 0, 0], 1.0);

  // ---- Cargo pod ----
  const podY = 3.0, podZ = -1.4;
  cyl(1.15, 1.15, 5, 8, POD, [0, podY, podZ], [90, 22.5, 0]);
  box([1.9, 0.2, 5.4], POD_DK, [0, podY + 1.15, podZ], [0, 0, 0]);
  // end caps
  cyl(0.55, 1.15, 0.7, 8, POD_DK, [0, podY, 1.1 + 0.35], [90, 22.5, 0]);
  cyl(0.55, 1.15, 0.7, 8, POD_DK, [0, podY, -3.9 - 0.35], [-90, 22.5, 0]);
  box([0.5, 0.5, 0.1], MAGENTA, [0, podY, 1.84], [0, 0, 45], 1.4);
  // bands w/ hazard stripes
  for (const z of [0.5, -1.4, -3.3]) {
    cyl(1.24, 1.24, 0.34, 8, HULL_DK, [0, podY, z], [90, 22.5, 0]);
    for (const s of [1, -1]) {
      box([0.1, 1.4, 0.2], YELLOW, [s * 1.24, podY, z], [0, 0, 0]);
      box([0.08, 0.4, 0.2], BLACK, [s * 1.26, podY + 0.5, z]);
      box([0.08, 0.4, 0.2], BLACK, [s * 1.26, podY - 0.5, z]);
    }
    box([0.5, 0.1, 0.36], YELLOW, [0, podY + 1.22, z]);
  }
  // neon seam
  box([0.14, 0.1, 5.2], MAGENTA, [0, podY + 1.26, podZ], [0, 0, 0], 1.8);
  for (const s of [1, -1]) {
    box([0.07, 0.1, 4.6], CYAN, [s * 1.1, podY + 0.3, podZ], [0, 0, 0], 1.3);
    // label panel
    box([0.06, 0.5, 1.2], HULL_DK, [s * 1.12, podY - 0.1, podZ + 0.5], [0, 0, 0]);
    box([0.07, 0.1, 0.8], AMBER, [s * 1.15, podY - 0.05, podZ + 0.5], [0, 0, 0], 1.2);
    box([0.07, 0.1, 0.5], RED, [s * 1.15, podY - 0.25, podZ + 0.4], [0, 0, 0], 1.2);
    // clamps
    for (const z of [0.5, -1.4, -3.3]) box([0.2, 0.5, 0.5], HULL_DK, [s * 1.0, 1.7, z]);
  }
  // cradle
  for (const z of [0.5, -1.4, -3.3]) box([2.3, 0.4, 0.5], HULL_DK, [0, 1.6, z]);
  // rear hatch lock
  box([1.0, 1.0, 0.1], HULL_DK, [0, podY, -4.52]);
  cyl(0.3, 0.3, 0.1, 8, HUB, [0, podY, -4.6], [90, 0, 0]);
  cyl(0.12, 0.12, 0.12, 6, RED, [0, podY, -4.64], [90, 0, 0], 1.6);

  // ---- Rear ----
  box([2.6, 0.4, 0.4], PLATE, [0, 1.0, -4.55]);
  box([2.6, 0.1, 0.42], YELLOW, [0, 0.85, -4.55]);
  for (const s of [1, -1]) {
    box([0.35, 0.2, 0.08], RED, [s * 1.0, 1.25, -4.78], [0, 0, 0], 1.6);
    box([0.3, 0.7, 0.9], HULL_DK, [s * 1.0, 1.7, -4.2]);
  }
  // mud flaps
  for (const s of [1, -1]) box([0.6, 0.5, 0.05], BLACK, [s * 1.38, 0.55, -3.9]);

  const root = b.root;
  return root;
}
