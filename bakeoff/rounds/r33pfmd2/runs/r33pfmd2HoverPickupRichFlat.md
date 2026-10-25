```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Hover Technical",
  description: "Militarized pickup converted to four-thruster hover propulsion, low-poly cyberpunk with neon trim and a bed-mounted railgun.",
};

const HULL = "#1d2230";
const PLATE = "#2e3649";
const PLATE_HI = "#434d66";
const METAL = "#5a6279";
const BLACK = "#0b0d14";
const GLASS = "#0f2a3a";
const CYAN = "#19f0ff";
const MAGENTA = "#ff2d9a";
const YELLOW = "#ffd02a";
const ORANGE = "#ff7a1a";
const OLIVE = "#3a4a35";

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });

  // ---- helpers -------------------------------------------------------------
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, glowing = 0) => {
    const p = b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });
    if (glowing) glow(p, glowing);
    return p;
  };
  const cylY = (r: number, h: number, color: string, x: number, y: number, z: number, sides = 8, glowing = 0) => {
    const p = b.part(new THREE.CylinderGeometry(r, r, h, sides), color, { at: [x, y, z], flat: true });
    if (glowing) glow(p, glowing);
    return p;
  };
  // cylinder lying along Z
  const cylZ = (r0: number, r1: number, len: number, color: string, x: number, y: number, z: number, sides = 8, glowing = 0) => {
    const p = b.part(new THREE.CylinderGeometry(r1, r0, len, sides), color, { at: [x, y, z], rotation: [90, 0, 0], flat: true });
    if (glowing) glow(p, glowing);
    return p;
  };
  const sideProfile = (pts: [number, number][], width: number, color: string, x = 0) =>
    b.extrude(pts, { at: [x, 0, 0], x: [0, 0, 1], thickness: width, color });

  // ---- hull ---------------------------------------------------------------
  sideProfile(
    [
      [-2.7, 0.6], [2.6, 0.6], [2.85, 0.85], [2.75, 1.15], [1.2, 1.32], [-0.7, 1.2], [-2.7, 1.2],
    ],
    1.9,
    HULL,
  );
  // belly plate and skids
  box(1.6, 0.1, 4.8, METAL, 0, 0.55, 0);
  for (const s of [1, -1]) {
    box(0.1, 0.07, 3.8, YELLOW, s * 0.72, 0.06, 0);
    for (const z of [-1.4, 1.4]) box(0.08, 0.5, 0.12, METAL, s * 0.72, 0.3, z);
  }
  // side armour skirts
  for (const s of [1, -1]) {
    box(0.1, 0.4, 3.9, PLATE, s * 0.98, 0.82, -0.1);
    box(0.12, 0.05, 3.9, MAGENTA, s * 0.99, 0.62, -0.1, 1.3);
    for (let i = 0; i < 5; i++) box(0.12, 0.34, 0.06, PLATE_HI, s * 0.99, 0.82, -1.9 + i * 0.85);
    // door panel seam + hazard stripes
    box(0.03, 0.5, 0.04, BLACK, s * 0.87, 1.5, 0.15);
    for (let i = 0; i < 4; i++) {
      const st = box(0.03, 0.06, 0.28, YELLOW, s * 0.875, 1.0 + i * 0.0, -2.2 + i * 0.32);
      st.mesh.rotation.x = 0.5;
    }
  }

  // ---- hood & front -------------------------------------------------------
  box(1.5, 0.08, 1.3, PLATE, 0, 1.33, 1.95);
  for (let i = 0; i < 5; i++) box(1.1, 0.03, 0.05, BLACK, 0, 1.38, 1.5 + i * 0.16);
  box(0.5, 0.12, 0.5, METAL, 0, 1.42, 2.1); // air scoop
  box(0.4, 0.06, 0.4, CYAN, 0, 1.47, 2.1, 1.1);
  // bullbar
  box(1.9, 0.18, 0.2, PLATE_HI, 0, 0.82, 2.95);
  box(1.9, 0.12, 0.16, PLATE, 0, 1.05, 2.9);
  for (const s of [1, -1]) {
    box(0.12, 0.5, 0.14, PLATE_HI, s * 0.75, 0.95, 2.9);
    box(0.12, 0.5, 0.14, PLATE_HI, s * 0.2, 0.95, 2.93);
  }
  box(1.5, 0.05, 0.05, CYAN, 0, 0.93, 3.02, 1.5);
  // headlights
  for (const s of [1, -1]) {
    box(0.45, 0.12, 0.08, CYAN, s * 0.6, 1.15, 2.86, 1.6);
    box(0.5, 0.04, 0.1, BLACK, s * 0.6, 1.23, 2.86);
    box(0.14, 0.14, 0.1, ORANGE, s * 0.9, 1.0, 2.8, 1.2);
  }

  // ---- cab ----------------------------------------------------------------
  sideProfile(
    [
      [-0.75, 1.2], [1.2, 1.3], [0.55, 1.95], [-0.45, 2.0], [-0.75, 1.85],
    ],
    1.75,
    HULL,
  );
  // roof plate
  box(1.6, 0.06, 0.85, PLATE_HI, 0, 2.02, -0.1);
  // windshield
  const ws = b.part(new THREE.BoxGeometry(1.5, 0.05, 0.8), GLASS, { at: [0, 1.65, 0.9], rotation: [-41, 0, 0] });
  glow(ws, 0.35);
  // rear window
  box(1.3, 0.35, 0.04, GLASS, 0, 1.6, -0.76, 0.3);
  for (const s of [1, -1]) {
    // side windows
    const sw = sideProfile([[-0.4, 1.5], [0.7, 1.5], [0.45, 1.88], [-0.4, 1.9]], 0.02, GLASS, s * 0.885);
    glow(sw, 0.3);
    box(0.04, 0.08, 0.2, PLATE_HI, s * 0.89, 1.4, 0.1); // handle
    // mirrors
    box(0.1, 0.18, 0.24, PLATE, s * 1.0, 1.55, 0.85);
    box(0.02, 0.14, 0.2, MAGENTA, s * 1.06, 1.55, 0.85, 1.2);
    // armoured window slats
    for (let i = 0; i < 3; i++) box(0.05, 0.03, 1.0, BLACK, s * 0.9, 1.55 + i * 0.12, 0.15);
  }
  // roof light bar
  box(1.4, 0.1, 0.16, BLACK, 0, 2.12, 0.3);
  for (let i = 0; i < 4; i++) {
    box(0.3, 0.07, 0.18, i % 2 ? MAGENTA : CYAN, -0.5 + i * 0.33, 2.13, 0.3, 1.5);
  }
  // roof pod & antennae
  box(0.5, 0.14, 0.4, OLIVE, 0, 2.12, -0.3);
  cylY(0.04, 0.12, METAL, 0, 2.25, -0.3, 6);
  for (const s of [1, -1]) {
    b.rod([s * 0.75, 2.0, -0.55], [s * 0.95, 2.9, -0.8], 0.012, METAL);
    box(0.06, 0.06, 0.06, MAGENTA, s * 0.95, 2.92, -0.8, 1.8);
  }
  // sensor dish
  b.part(new THREE.CylinderGeometry(0.2, 0.05, 0.08, 8), PLATE_HI, { at: [0, 2.3, -0.3], rotation: [25, 0, 0], flat: true });

  // ---- bed ----------------------------------------------------------------
  box(1.8, 0.05, 1.9, BLACK, 0, 1.21, -1.7);
  for (const s of [1, -1]) {
    box(0.1, 0.42, 2.0, PLATE, s * 0.9, 1.4, -1.7);
    box(0.12, 0.05, 2.0, CYAN, s * 0.9, 1.63, -1.7, 1.2);
    for (let i = 0; i < 3; i++) box(0.12, 0.3, 0.05, PLATE_HI, s * 0.9, 1.4, -2.3 + i * 0.6);
  }
  box(1.9, 0.42, 0.1, PLATE, 0, 1.4, -2.68);
  box(1.3, 0.05, 0.04, MAGENTA, 0, 1.55, -2.74, 1.3);
  // tail lights
  for (const s of [1, -1]) box(0.3, 0.14, 0.05, MAGENTA, s * 0.65, 1.18, -2.76, 1.6);
  // roll cage
  for (const s of [1, -1]) {
    b.rod([s * 0.8, 1.2, -0.85], [s * 0.8, 2.0, -0.95], 0.04, PLATE_HI);
    b.rod([s * 0.8, 2.0, -0.95], [s * 0.8, 1.7, -2.3], 0.035, PLATE_HI);
    b.rod([s * 0.8, 1.7, -2.3], [s * 0.8, 1.2, -2.3], 0.035, PLATE_HI);
  }
  b.rod([-0.8, 2.0, -0.95], [0.8, 2.0, -0.95], 0.035, PLATE_HI);

  // ---- railgun turret -----------------------------------------------------
  cylY(0.28, 0.3, METAL, 0, 1.4, -1.65, 8);
  cylY(0.34, 0.08, PLATE_HI, 0, 1.56, -1.65, 8);
  box(0.62, 0.4, 0.8, OLIVE, 0, 1.8, -1.65);
  box(0.66, 0.1, 0.5, PLATE, 0, 2.04, -1.6);
  box(0.4, 0.04, 0.3, CYAN, 0, 2.1, -1.55, 1.2);
  for (const s of [1, -1]) {
    box(0.08, 0.3, 0.5, PLATE_HI, s * 0.36, 1.8, -1.65);
    cylZ(0.07, 0.07, 1.6, METAL, s * 0.18, 1.8, -0.9, 8);
    cylZ(0.1, 0.1, 0.25, BLACK, s * 0.18, 1.8, -0.2, 8);
    cylZ(0.04, 0.04, 1.45, CYAN, s * 0.18, 1.8, -0.95, 6, 1.4);
    for (const z of [-1.3, -0.8, -0.4]) box(0.22, 0.22, 0.05, PLATE_HI, s * 0.18, 1.8, z);
  }
  // ammo / battery crates in bed
  box(0.6, 0.3, 0.5, OLIVE, -0.5, 1.4, -2.35);
  box(0.62, 0.05, 0.1, YELLOW, -0.5, 1.56, -2.35);
  box(0.5, 0.3, 0.5, PLATE_HI, 0.55, 1.4, -2.35);
  box(0.3, 0.06, 0.06, CYAN, 0.55, 1.56, -2.35, 1.4);

  // ---- exhaust / cooling stacks behind cab -------------------------------
  for (const s of [1, -1]) {
    cylY(0.07, 0.8, METAL, s * 0.95, 1.7, -0.62, 6);
    cylY(0.08, 0.06, ORANGE, s * 0.95, 2.12, -0.62, 6, 1.4);
  }

  // ---- hover thrusters ----------------------------------------------------
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const x = sx * 1.45;
      const z = sz * 1.75;
      // pylon arm
      box(0.7, 0.14, 0.3, PLATE_HI, sx * 1.15, 0.85, z);
      box(0.6, 0.06, 0.12, MAGENTA, sx * 1.15, 0.93, z, 1.0);
      // nacelle
      b.part(new THREE.CylinderGeometry(0.46, 0.4, 0.55, 10), PLATE, { at: [x, 0.7, z], flat: true });
      cylY(0.5, 0.08, OLIVE, x, 0.98, z, 10);
      // intake grille on top
      cylY(0.34, 0.04, BLACK, x, 1.04, z, 10);
      for (let i = 0; i < 3; i++) box(0.62, 0.03, 0.05, METAL, x, 1.07, z - 0.2 + i * 0.2);
      // bottom: ring and glowing disc
      b.part(new THREE.TorusGeometry(0.4, 0.05, 5, 12), CYAN, { at: [x, 0.38, z], rotation: [90, 0, 0], flat: true });
      glow(b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.03, 12), CYAN, { at: [x, 0.4, z], flat: true }), 1.6);
      cylY(0.12, 0.05, BLACK, x, 0.37, z, 8);
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 4;
        b.part(new THREE.BoxGeometry(0.66, 0.025, 0.04), METAL, { at: [x, 0.37, z], rotation: [0, (a * 180) / Math.PI, 0] });
      }
      // fins outside
      box(0.04, 0.4, 0.5, PLATE_HI, x + sx * 0.46, 0.75, z);
      box(0.05, 0.05, 0.4, YELLOW, x + sx * 0.49, 0.9, z);
      // landing foot
      box(0.1, 0.34, 0.1, METAL, x, 0.17, z + sz * 0.3);
      box(0.3, 0.04, 0.3, YELLOW, x, 0.02, z + sz * 0.3);
    }

  // ---- underglow strips ---------------------------------------------------
  for (const s of [1, -1]) box(0.05, 0.04, 3.2, MAGENTA, s * 0.5, 0.5, 0, 1.5);
  box(1.0, 0.04, 0.05, MAGENTA, 0, 0.5, 1.6, 1.5);

  // ---- emblem & plates on hood sides / cab doors --------------------------
  for (const s of [1, -1]) {
    box(0.03, 0.12, 0.5, CYAN, s * 0.96, 1.18, 1.9, 1.2);
    box(0.03, 0.04, 0.5, MAGENTA, s * 0.96, 1.03, 1.9, 1.2);
    // number "07" blocks
    box(0.03, 0.22, 0.05, YELLOW, s * 0.96, 1.15, -0.35);
    box(0.03, 0.05, 0.14, YELLOW, s * 0.96, 1.25, -0.4);
    box(0.03, 0.05, 0.14, YELLOW, s * 0.96, 1.05, -0.4);
    box(0.03, 0.22, 0.05, YELLOW, s * 0.96, 1.15, -0.5);
  }

  return b.root;
}
```