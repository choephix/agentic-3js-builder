```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Brutalist Housing Block",
  description:
    "Raw board-formed concrete slab block on pilotis with an egg-crate loggia facade, colored balcony panels, stair towers and a rooftop plant deck.",
};

// ---- palette ----
const CONC = "#8f8c85";
const CONC_LIGHT = "#a5a29a";
const CONC_DARK = "#74716b";
const CONC_STAIN = "#625f5a";
const RECESS = "#4a4845";
const GLASS = "#2b3a45";
const GLASS_LIT = "#ffcf7a";
const FRAME = "#2a2a2a";
const PANELS = ["#c9892c", "#a8452f", "#3d7f86", "#d8d2c0", "#b9b3a3", "#8a9a5b"];
const MOSS = "#5f6b4a";
const STEEL = "#555a60";
const ROOF = "#3c3b3a";

export default function build() {
  const b = createBuilder({ name: "brutalist_block" });
  const rand = rng(11);

  const box = (w: number, h: number, d: number, x: number, y: number, z: number, c: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (rt: number, rb: number, h: number, seg: number, x: number, y: number, z: number, c: string) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z] });

  // ---- dimensions ----
  const L = 48; // length
  const D = 14; // depth
  const BAYS = 12;
  const BW = L / BAYS;
  const FLOORS = 7;
  const FH = 3;
  const PIL = 4; // pilotis height
  const SLAB_T = 0.4;
  const TOP = PIL + FLOORS * FH; // 25
  const WALL_Z = D / 2 - 1.2;

  // ---- pilotis ----
  for (let i = 0; i <= BAYS; i++) {
    const x = -L / 2 + i * BW;
    for (const z of [-5, 5]) {
      // tapered column: thick at the top, with a base block and a cap
      box(1.3, PIL, 1.3, x, PIL / 2, z, CONC_DARK);
      box(1.7, 0.5, 1.7, x, PIL - 0.25, z, CONC);
      box(1.6, 0.35, 1.6, x, 0.18, z, CONC_STAIN);
    }
  }
  // transverse beams under the first slab
  for (let i = 0; i <= BAYS; i += 2) {
    box(0.9, 0.7, D, -L / 2 + i * BW, PIL - 0.35, 0, CONC_LIGHT);
  }
  // lobby box at ground centre
  box(9, 3.2, 8, 0, 1.6, 0, CONC);
  box(0.4, 2.6, 7.2, 0, 1.4, 0, CONC);
  for (const s of [1, -1]) {
    box(6.4, 2.2, 0.15, 0, 1.5, s * 4.05, GLASS);
    box(0.25, 2.3, 0.2, -2.0, 1.5, s * 4.1, FRAME);
    box(0.25, 2.3, 0.2, 2.0, 1.5, s * 4.1, FRAME);
    box(6.6, 0.25, 0.2, 0, 2.7, s * 4.1, FRAME);
  }
  glow(box(5.8, 1.9, 0.1, 0, 1.4, 4.12, GLASS_LIT), 0.8);
  // entrance canopy
  box(10, 0.3, 3, 0, 3.4, 5.4, CONC_LIGHT);
  box(0.4, 3.4, 0.4, -4.5, 1.7, 6.7, CONC_DARK);
  box(0.4, 3.4, 0.4, 4.5, 1.7, 6.7, CONC_DARK);
  // entrance steps
  for (let k = 0; k < 3; k++) box(8 - k * 0.6, 0.18, 1 - k * 0.0, 0, 0.09 + k * 0.0, 4.6 + k * 0.45, CONC_STAIN).position.y += 0;

  // ---- main body wall (recessed core) ----
  box(L, FLOORS * FH, WALL_Z * 2, 0, PIL + (FLOORS * FH) / 2, 0, RECESS);

  // ---- floor slabs (egg-crate horizontals) ----
  for (let f = 0; f <= FLOORS; f++) {
    const y = PIL + f * FH;
    box(L + 0.6, SLAB_T, D, 0, y + SLAB_T / 2 - 0.2, 0, f % 2 ? CONC : CONC_LIGHT);
    // staining under each slab edge
    for (const s of [1, -1]) box(L + 0.6, 0.12, 0.2, 0, y - 0.28, s * (D / 2 - 0.05), CONC_STAIN);
  }

  // ---- vertical fins ----
  for (let i = 0; i <= BAYS; i++) {
    const x = -L / 2 + i * BW;
    for (const s of [1, -1]) {
      box(0.55, FLOORS * FH, 1.2, x, PIL + (FLOORS * FH) / 2, s * (D / 2 - 0.6), i % 2 ? CONC : CONC_LIGHT);
      // board-form seam lines on fin faces
      for (let k = 1; k < FLOORS; k++) {
        box(0.58, 0.04, 1.24, x, PIL + k * FH + 1.2, s * (D / 2 - 0.6), CONC_STAIN);
      }
    }
  }

  // ---- cells: glazing, balcony panels, mullions ----
  for (let f = 0; f < FLOORS; f++) {
    const y0 = PIL + f * FH + SLAB_T - 0.2;
    for (let i = 0; i < BAYS; i++) {
      const x = -L / 2 + (i + 0.5) * BW;
      for (const s of [1, -1]) {
        const lit = rand() < 0.22;
        const gl = box(BW - 1.1, 1.55, 0.12, x, y0 + 1.5, s * (WALL_Z + 0.05), lit ? GLASS_LIT : GLASS);
        if (lit) glow(gl, 0.7);
        box(0.08, 1.55, 0.16, x, y0 + 1.5, s * (WALL_Z + 0.08), FRAME);
        box(BW - 1.0, 0.08, 0.16, x, y0 + 2.3, s * (WALL_Z + 0.08), FRAME);
        // balcony parapet panel set forward
        const col = PANELS[Math.floor(rand() * PANELS.length)];
        box(BW - 0.7, 0.95, 0.14, x, y0 + 0.55, s * (D / 2 - 0.35), col);
        box(BW - 0.7, 0.07, 0.3, x, y0 + 1.06, s * (D / 2 - 0.35), CONC_LIGHT);
        // side recess shading strip
        box(BW - 0.9, 0.5, 0.04, x, y0 + 2.55, s * (WALL_Z + 0.03), RECESS);
      }
    }
  }

  // ---- gable ends: raw wall with board-form ribs and slits ----
  for (const s of [1, -1]) {
    const gx = s * (L / 2 + 0.31);
    box(0.2, FLOORS * FH, D - 0.4, gx, PIL + (FLOORS * FH) / 2, 0, CONC);
    for (let k = 0; k < 12; k++) {
      box(0.06, FLOORS * FH, 0.14, gx + s * 0.12, PIL + (FLOORS * FH) / 2, -D / 2 + 1 + k * ((D - 2) / 11), CONC_DARK);
    }
    for (let f = 0; f < FLOORS; f++) {
      box(0.1, 0.35, 1.6, gx + s * 0.1, PIL + f * FH + 1.8, 0, GLASS);
    }
    // large gable stain
    box(0.05, 6, 5, gx + s * 0.12, PIL + 4, 3, CONC_STAIN);
  }

  // ---- stair / lift towers ----
  const tower = (x: number, z: number, w: number, d: number, h: number) => {
    box(w, h, d, x, h / 2, z, CONC_DARK);
    box(w + 0.3, 0.4, d + 0.3, x, h + 0.2, z, CONC_LIGHT);
    // ribs
    for (let k = -2; k <= 2; k++) box(0.25, h, 0.2, x + k * (w / 5), h / 2, z + d / 2 + 0.08, CONC);
    // slit windows
    for (let f = 0; f < FLOORS + 1; f++) {
      const y = PIL + f * FH + 0.8;
      box(0.45, 1.6, 0.1, x - w / 4, y, z + d / 2 + 0.1, GLASS);
      box(0.45, 1.6, 0.1, x + w / 4, y, z + d / 2 + 0.1, GLASS);
    }
    box(w + 0.2, 1.0, 0.1, x, h - 0.5, z + d / 2 + 0.05, CONC_STAIN);
  };
  tower(-L / 2 - 2.2, 0, 4.2, 6, TOP + 1.2);
  tower(L / 2 + 2.2, 0, 4.2, 6, TOP + 1.2);
  // central rear service core
  tower(0, -D / 2 - 1.4, 5, 3, TOP + 1.2);
  // bridges to end towers
  for (const s of [1, -1]) box(1.8, 0.35, 3, s * (L / 2 + 0.6), TOP - 0.2, 0, CONC_LIGHT);

  // ---- roof ----
  box(L + 0.8, 1.0, 0.35, 0, TOP + 0.5, D / 2 - 0.15, CONC_LIGHT);
  box(L + 0.8, 1.0, 0.35, 0, TOP + 0.5, -D / 2 + 0.15, CONC_LIGHT);
  box(0.35, 1.0, D, -L / 2 - 0.2, TOP + 0.5, 0, CONC_LIGHT);
  box(0.35, 1.0, D, L / 2 + 0.2, TOP + 0.5, 0, CONC_LIGHT);
  box(L, 0.1, D - 0.6, 0, TOP + 0.05, 0, ROOF);
  // barrel-vault plant room
  const vault = b.part(new THREE.CylinderGeometry(3, 3, 12, 10, 1, false, 0, Math.PI), CONC, {
    at: [-10, TOP + 0.1, -1],
    dir: [1, 0, 0],
  });
  void vault;
  box(12, 0.12, 6, -10, TOP + 0.06, -1, CONC_DARK);
  // roof slab ramp
  b.part(new THREE.BoxGeometry(8, 0.4, 3), CONC_LIGHT, { at: [12, TOP + 1.2, -2], rotation: [0, 0, 18] });
  box(8, 0.3, 3.4, 14, TOP + 0.3, -2, CONC_DARK);
  // sunshade pergola
  for (let k = 0; k < 4; k++) box(0.4, 2.6, 0.4, 6 + k * 3.2, TOP + 1.3, 3.5, CONC_DARK);
  box(10.4, 0.35, 0.8, 9.6, TOP + 2.7, 3.5, CONC_LIGHT);
  for (let k = 0; k < 9; k++) box(0.25, 0.25, 4, 5 + k * 1.2, TOP + 3.0, 3.5, CONC);
  // water tanks, chimneys
  cyl(1.4, 1.4, 2.6, 10, 20, TOP + 1.4, 3.5, STEEL);
  cyl(1.5, 1.5, 0.2, 10, 20, TOP + 2.8, 3.5, CONC_DARK);
  for (let k = 0; k < 4; k++) {
    box(1.1, 3 + (k % 2), 1.1, -3 + k * 2.2, TOP + 1.5 + (k % 2) * 0.5, -4.5, CONC_DARK);
    box(1.4, 0.3, 1.4, -3 + k * 2.2, TOP + 3.1 + (k % 2), -4.5, CONC_LIGHT);
  }
  // moss tufts on roof parapet
  for (let k = 0; k < 8; k++) box(1.2, 0.12, 0.4, -20 + k * 5.5, TOP + 1.05, D / 2 - 0.15, MOSS);

  // ---- ground rain-streaks on pilotis & plinth bits ----
  for (let i = 0; i <= BAYS; i += 2) {
    const x = -L / 2 + i * BW;
    box(0.3, 1.5, 0.05, x, PIL - 1.6, 5.66, CONC_STAIN);
  }

  return b.root;
}
```