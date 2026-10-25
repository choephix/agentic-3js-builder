```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Hover Technical",
  description: "Militarized pickup converted to four hover thrusters, low-poly cyberpunk: olive armor, neon trim, roof missile racks and a bed-mounted gun.",
};

const OLIVE = "#3c4a3b";
const OLIVE_D = "#2a352b";
const OLIVE_L = "#586b52";
const DARK = "#16171f";
const STEEL = "#5d6573";
const STEEL_D = "#383d48";
const GLASS = "#0c3a52";
const CYAN = "#19f0ff";
const MAG = "#ff2fa8";
const AMBER = "#ffb02e";
const WHITE = "#e8fbff";
const RUST = "#7a4a2a";

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });

  type V = [number, number, number];
  const bx = (size: V, color: string, at: V, rot?: V) =>
    b.part(new THREE.BoxGeometry(...size), color, { at, rotation: rot });
  const cy = (r: number, h: number, color: string, at: V, rot?: V, seg = 8, r2?: number) =>
    b.part(new THREE.CylinderGeometry(r2 ?? r, r, h, seg), color, { at, rotation: rot, flat: true });
  const gl = (p: ReturnType<typeof bx>, s = 1.4) => glow(p, s);

  // ---------- Hull ----------
  const hullProfile: [number, number][] = [
    [-2.6, 0.5], [2.6, 0.5], [2.75, 0.85], [2.25, 1.12], [1.0, 1.2], [-0.5, 1.2], [-0.5, 1.05], [-2.6, 1.05],
  ];
  b.extrude(hullProfile, { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.8, bevel: 0.03, color: OLIVE });
  // belly armor
  bx([1.5, 0.12, 4.9], DARK, [0, 0.47, 0]);
  bx([1.0, 0.06, 3.6], STEEL_D, [0, 0.4, -0.1]);

  // cab
  const cabProfile: [number, number][] = [
    [-0.5, 1.2], [-0.5, 1.95], [0.45, 1.98], [1.0, 1.5], [1.0, 1.2],
  ];
  b.extrude(cabProfile, { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.7, bevel: 0.03, color: OLIVE_L });
  // roof plate
  bx([1.6, 0.06, 0.95], OLIVE_D, [0, 2.0, -0.02]);
  // windshield + rear window
  gl(bx([1.5, 0.71, 0.04], GLASS, [0, 1.74, 0.745], [-51, 0, 0]), 0.5);
  bx([1.5, 0.45, 0.04], GLASS, [0, 1.62, -0.52]);
  const winProfile: [number, number][] = [[-0.38, 1.42], [-0.38, 1.88], [0.38, 1.9], [0.82, 1.48], [0.82, 1.42]];
  for (const s of [1, -1]) {
    b.extrude(winProfile, { at: [s * 0.87, 0, 0], x: [0, 0, 1], thickness: 0.05, color: GLASS });
    // door seam + handle
    bx([0.03, 0.62, 0.03], DARK, [s * 0.9, 1.5, 0.45]);
    bx([0.03, 0.62, 0.03], DARK, [s * 0.9, 1.5, -0.4]);
    bx([0.04, 0.05, 0.22], STEEL, [s * 0.9, 1.3, 0.1]);
    // side armor plate on door
    bx([0.05, 0.4, 0.7], OLIVE_D, [s * 0.9, 1.38, 0.05]);
    // magenta side stripe
    gl(bx([0.04, 0.05, 4.7], MAG, [s * 0.91, 0.78, 0]), 1.5);
    gl(bx([0.04, 0.03, 4.3], CYAN, [s * 0.91, 0.68, 0]), 1.5);
  }

  // hood
  bx([1.7, 0.1, 1.2], OLIVE_D, [0, 1.22, 1.55], [-6, 0, 0]);
  bx([0.5, 0.12, 0.9], STEEL_D, [0, 1.3, 1.6], [-6, 0, 0]); // scoop
  for (let i = 0; i < 4; i++) bx([0.4, 0.02, 0.05], DARK, [0, 1.37, 1.35 + i * 0.16], [-6, 0, 0]);
  for (const s of [1, -1]) {
    gl(bx([0.05, 0.03, 1.0], CYAN, [s * 0.65, 1.28, 1.58], [-6, 0, 0]), 1.6);
    // hood bolts
    cy(0.04, 0.03, STEEL, [s * 0.75, 1.27, 1.1], undefined, 6);
  }

  // front: bumper, grille, headlights
  bx([1.95, 0.3, 0.3], DARK, [0, 0.72, 2.75]);
  bx([1.5, 0.22, 0.12], STEEL_D, [0, 0.98, 2.62], [-18, 0, 0]);
  for (let i = -3; i <= 3; i++) gl(bx([0.05, 0.16, 0.04], CYAN, [i * 0.2, 0.98, 2.68], [-18, 0, 0]), 1.2);
  for (const s of [1, -1]) {
    gl(bx([0.38, 0.12, 0.08], WHITE, [s * 0.72, 1.0, 2.5], [-25, 0, 0]), 2);
    bx([0.5, 0.05, 0.1], DARK, [s * 0.72, 1.1, 2.5], [-25, 0, 0]);
    bx([0.16, 0.5, 0.35], STEEL_D, [s * 0.95, 0.75, 2.62]); // bumper wing
    gl(bx([0.18, 0.08, 0.06], MAG, [s * 0.95, 0.85, 2.82]), 1.4);
  }
  // push bar
  bx([1.6, 0.08, 0.08], STEEL, [0, 0.9, 2.95]);
  for (const s of [1, -1]) bx([0.08, 0.35, 0.08], STEEL, [s * 0.75, 0.78, 2.9]);

  // ---------- Bed ----------
  bx([1.62, 0.04, 2.0], DARK, [0, 1.07, -1.55]);
  for (const s of [1, -1]) {
    bx([0.12, 0.38, 2.15], OLIVE, [s * 0.88, 1.24, -1.55]);
    bx([0.14, 0.05, 2.18], STEEL, [s * 0.88, 1.45, -1.55]);
    for (let i = 0; i < 4; i++) bx([0.14, 0.3, 0.05], OLIVE_D, [s * 0.88, 1.25, -0.8 - i * 0.5]);
  }
  bx([1.8, 0.4, 0.1], OLIVE, [0, 1.25, -2.62]);
  bx([1.82, 0.05, 0.12], STEEL, [0, 1.46, -2.62]);
  gl(bx([1.2, 0.05, 0.04], MAG, [0, 1.25, -2.69]), 1.6);
  for (const s of [1, -1]) gl(bx([0.16, 0.12, 0.05], "#ff2a3a", [s * 0.75, 1.0, -2.65]), 1.6);

  // roll bar behind cab
  for (const s of [1, -1]) cy(0.045, 0.85, STEEL, [s * 0.78, 1.55, -0.75], undefined, 6);
  bx([1.65, 0.08, 0.08], STEEL, [0, 1.98, -0.75]);
  bx([1.5, 0.05, 0.6], STEEL_D, [0, 1.35, -0.9]);

  // pintle gun mount
  cy(0.2, 0.08, STEEL_D, [0, 1.12, -1.5], undefined, 8);
  cy(0.07, 0.6, STEEL, [0, 1.42, -1.5], undefined, 6);
  bx([0.34, 0.22, 0.55], STEEL_D, [0, 1.8, -1.4]);
  bx([0.3, 0.14, 0.3], OLIVE_D, [0, 1.95, -1.4]);
  cy(0.045, 1.0, DARK, [0, 1.8, -0.7], [90, 0, 0], 6);
  cy(0.075, 0.18, STEEL, [0, 1.8, -0.2], [90, 0, 0], 6);
  gl(bx([0.04, 0.05, 0.05], AMBER, [0, 1.86, -0.18]), 2);
  bx([0.5, 0.55, 0.05], STEEL_D, [0, 1.85, -0.95]); // shield
  gl(bx([0.3, 0.04, 0.02], CYAN, [0, 1.95, -0.93]), 1.6);
  bx([0.2, 0.2, 0.2], OLIVE_D, [0.32, 1.7, -1.5]); // ammo box
  // cargo crates in bed
  bx([0.5, 0.35, 0.5], RUST, [0.45, 1.27, -2.2]);
  bx([0.5, 0.05, 0.5], STEEL_D, [0.45, 1.46, -2.2]);
  gl(bx([0.12, 0.05, 0.02], AMBER, [0.45, 1.3, -1.94]), 1.5);
  bx([0.45, 0.3, 0.4], STEEL_D, [-0.45, 1.25, -2.1]);

  // ---------- Roof gear ----------
  bx([1.5, 0.05, 0.12], DARK, [0, 2.05, 0.35]);
  gl(bx([1.3, 0.07, 0.07], AMBER, [0, 2.1, 0.35]), 1.8);
  for (const s of [1, -1]) {
    // missile pods
    bx([0.42, 0.34, 0.9], OLIVE_D, [s * 0.5, 2.2, -0.15]);
    bx([0.12, 0.1, 0.12], STEEL, [s * 0.5, 2.05, -0.15]);
    for (const dx of [-0.1, 0.1])
      for (const dy of [-0.07, 0.07]) {
        cy(0.065, 0.06, DARK, [s * 0.5 + dx, 2.2 + dy, 0.31], [90, 0, 0], 6);
        cy(0.035, 0.07, RED(), [s * 0.5 + dx, 2.2 + dy, 0.3], [90, 0, 0], 6);
      }
    // antenna
    cy(0.015, 1.1, DARK, [s * 0.85, 2.55, -0.65], [0, 0, s * -5], 5);
    gl(b.part(new THREE.SphereGeometry(0.035, 6, 4), MAG, { at: [s * 0.88, 3.1, -0.65] }), 2);
  }
  // sensor dome
  cy(0.14, 0.1, STEEL_D, [0, 2.07, -0.2], undefined, 8);
  gl(b.part(new THREE.SphereGeometry(0.12, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), CYAN, { at: [0, 2.12, -0.2] }), 1.2);

  // ---------- Hover thrusters ----------
  for (const sx of [1, -1])
    for (const z of [1.65, -1.65]) {
      const x = sx * 1.2;
      // strut to hull
      bx([0.35, 0.16, 0.4], STEEL_D, [sx * 0.98, 0.6, z]);
      // housing (8-sided, bottom at y=0)
      cy(0.46, 0.56, OLIVE_D, [x, 0.3, z], undefined, 8, 0.4);
      cy(0.47, 0.08, STEEL_D, [x, 0.55, z], undefined, 8);
      cy(0.43, 0.06, STEEL_D, [x, 0.1, z], undefined, 8);
      // glowing exhaust
      gl(cy(0.33, 0.03, CYAN, [x, 0.02, z], undefined, 8), 2.2);
      cy(0.18, 0.04, WHITE, [x, 0.04, z], undefined, 8);
      // top intake with fan
      cy(0.4, 0.1, DARK, [x, 0.62, z], undefined, 8);
      for (let k = 0; k < 4; k++)
        bx([0.7, 0.025, 0.09], STEEL, [x, 0.68, z], [0, k * 45 + 11, 0]);
      cy(0.07, 0.08, MAG, [x, 0.7, z], undefined, 6);
      gl(cy(0.07, 0.03, MAG, [x, 0.75, z], undefined, 6), 2);
      // glow ring bands
      gl(cy(0.47, 0.035, MAG, [x, 0.35, z], undefined, 8, 0.45), 1.6);
      // outer fin
      bx([0.06, 0.4, 0.5], OLIVE, [x + sx * 0.42, 0.4, z]);
    }

  // rear main thrusters
  for (const s of [1, -1]) {
    cy(0.3, 0.55, STEEL_D, [s * 0.55, 0.78, -2.85], [90, 0, 0], 8);
    cy(0.34, 0.08, DARK, [s * 0.55, 0.78, -2.58], [90, 0, 0], 8);
    gl(cy(0.24, 0.04, CYAN, [s * 0.55, 0.78, -3.14], [90, 0, 0], 8), 2.2);
    cy(0.12, 0.05, WHITE, [s * 0.55, 0.78, -3.15], [90, 0, 0], 6);
    gl(cy(0.31, 0.03, MAG, [s * 0.55, 0.78, -2.95], [90, 0, 0], 8, 0.31), 1.6);
  }
  bx([1.5, 0.15, 0.3], OLIVE_D, [0, 0.62, -2.75]);

  // underglow strips
  for (const s of [1, -1]) gl(bx([0.04, 0.03, 3.4], CYAN, [s * 0.72, 0.4, 0]), 1.8);
  gl(bx([1.3, 0.03, 0.04], CYAN, [0, 0.4, 1.8]), 1.8);

  // armor details: scuffs, plates, numerals
  for (const s of [1, -1]) {
    bx([0.04, 0.3, 0.9], OLIVE_L, [s * 0.91, 0.95, 1.5]);
    bx([0.045, 0.1, 0.5], RUST, [s * 0.915, 0.88, -1.0]);
    gl(bx([0.045, 0.22, 0.05], AMBER, [s * 0.92, 0.95, 1.2]), 1.4);
    gl(bx([0.045, 0.05, 0.22], AMBER, [s * 0.92, 0.95, 1.2]), 1.4);
    // tow hooks
    bx([0.1, 0.1, 0.1], STEEL, [s * 0.5, 0.58, 2.85]);
    // mirrors
    bx([0.06, 0.2, 0.14], DARK, [s * 1.0, 1.65, 0.78]);
    bx([0.04, 0.05, 0.25], STEEL_D, [s * 0.93, 1.6, 0.78]);
  }
  // cyber sign on hood: chevrons
  for (let i = 0; i < 3; i++) gl(bx([0.35, 0.02, 0.05], MAG, [0, 1.285, 1.82 + i * 0.1], [-6, 0, 0]), 1.4);

  return b.root;

  function RED() {
    return "#ff3a3a";
  }
}
```