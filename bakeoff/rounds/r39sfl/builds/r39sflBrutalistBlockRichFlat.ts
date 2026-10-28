import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Brutalist Housing Block",
  description: "Raw concrete slab block with deep balconies, stair tower, pilotis and rooftop plant.",
};

const CONC = "#8d8b85";
const CONC_D = "#6f6d68";
const CONC_L = "#a6a49d";
const DARK = "#2a2b2e";
const GLASS = "#4b5d6b";
const GLASS_L = "#7d92a0";
const RUST = "#7a4a33";
const MOSS = "#5d6b4a";
const WARM = "#e8b95a";

export default function build() {
  const b = createBuilder({ name: "brutalist_block" });
  const R = rng(11);

  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });

  const W = 36, D = 11, FLOORS = 8, FH = 3.2, PIL = 3.6;
  const top = PIL + FLOORS * FH;

  // plinth
  box(W + 2, 0.3, D + 2, CONC_D, 0, 0.15 - 0.05, 0);

  // pilotis
  const px = [-16, -8, 0, 8, 16];
  for (const x of px) {
    for (const z of [-3.8, 3.8]) {
      box(1.3, PIL, 1.3, CONC, x, PIL / 2, z);
      box(1.6, 0.25, 1.6, CONC_L, x, PIL - 0.1, z);
      box(1.6, 0.3, 1.6, CONC_D, x, 0.2, z);
    }
  }
  // ground-level entrance core and lobby glass
  box(6, 3, 5, GLASS, -4, 1.5, 0);
  box(6.2, 0.3, 5.2, CONC_L, -4, 3.0, 0);
  box(1.4, 2.2, 0.15, DARK, -4, 1.1, 2.55);
  box(2.2, 0.15, 1.6, CONC, -4, 2.6, 3.2);

  // main slab body
  box(W, FH * FLOORS, D, CONC, 0, PIL + (FH * FLOORS) / 2, 0);
  // floor slab bands projecting
  for (let f = 0; f <= FLOORS; f++) {
    const y = PIL + f * FH;
    box(W + 0.6, 0.35, D + 0.6, CONC_L, 0, y, 0);
  }
  // roof parapet
  box(W + 0.6, 0.9, D + 0.6, CONC_D, 0, top + 0.5, 0);
  box(W - 0.8, 0.5, D - 0.8, MOSS, 0, top + 0.8, 0);

  // facade bays: front (+z) and back (-z)
  const bays = 12;
  const bw = W / bays;
  for (const side of [1, -1]) {
    const zf = side * (D / 2);
    for (let f = 0; f < FLOORS; f++) {
      const y0 = PIL + f * FH;
      for (let i = 0; i < bays; i++) {
        const x = -W / 2 + bw * (i + 0.5);
        const balcony = (i + f) % 3 !== 1;
        if (balcony) {
          // deep concrete balcony box
          box(bw - 0.4, FH - 0.5, 1.8, CONC_D, x, y0 + FH / 2 + 0.05, zf + side * 0.9);
          box(bw - 0.9, FH - 1.1, 1.7, DARK, x, y0 + FH / 2 + 0.1, zf + side * 0.95);
          box(bw - 0.8, 0.9, 0.12, CONC_L, x, y0 + 0.95, zf + side * 1.75);
          // glazing recess behind
          box(bw - 1.2, FH - 1.3, 0.1, GLASS, x, y0 + FH / 2 + 0.1, zf + side * 0.05);
          box(0.05, FH - 1.3, 0.12, DARK, x, y0 + FH / 2 + 0.1, zf + side * 0.08);
          if (R() > 0.7) box(bw - 1.3, FH - 1.5, 0.08, WARM, x, y0 + FH / 2 + 0.1, zf + side * 0.12);
          if (R() > 0.8) box(0.7, 0.5, 0.5, RUST, x + 0.5, y0 + 1.2, zf + side * 1.3);
        } else {
          // flush window strip with deep fins
          box(bw - 1.0, 1.4, 0.15, GLASS_L, x, y0 + FH / 2 + 0.2, zf + side * 0.05);
          box(bw - 0.9, 0.2, 0.4, CONC_L, x, y0 + FH / 2 + 1.0, zf + side * 0.2);
          box(bw - 0.9, 0.2, 0.4, CONC_L, x, y0 + FH / 2 - 0.6, zf + side * 0.2);
          box(0.05, 1.4, 0.18, DARK, x, y0 + FH / 2 + 0.2, zf + side * 0.1);
        }
      }
    }
    // vertical concrete fins between bays
    for (let i = 0; i <= bays; i++) {
      const x = -W / 2 + bw * i;
      box(0.35, FH * FLOORS, 0.5, CONC_L, x, PIL + (FH * FLOORS) / 2, zf + side * 0.2);
    }
  }

  // end gable walls with slit windows
  for (const s of [1, -1]) {
    for (let f = 0; f < FLOORS; f++) {
      const y = PIL + f * FH + FH / 2;
      box(0.15, 1.6, 0.35, DARK, s * (W / 2 + 0.02), y, -2);
      box(0.15, 1.6, 0.35, DARK, s * (W / 2 + 0.02), y, 2);
    }
    box(0.5, FH * FLOORS, 1.2, CONC_L, s * (W / 2 + 0.2), PIL + (FH * FLOORS) / 2, 0);
  }

  // stair tower (tall, windowless slit)
  const tx = 11;
  box(4.2, top + 4 - 0.5, 4.2, CONC_D, tx, (top + 3.5) / 2, -1.5);
  box(4.8, 0.5, 4.8, CONC_L, tx, top + 3.8, -1.5);
  for (let i = 0; i < 9; i++) box(0.5, 1.2, 0.2, GLASS, tx + 1.2, 3.5 + i * 3.1, 0.65);
  box(0.5, 1.2, 0.2, GLASS, tx - 1.2, 8, 0.65);

  // rooftop plant
  box(7, 2.2, 4, CONC, -9, top + 1.9, 0);
  box(7.4, 0.3, 4.4, CONC_L, -9, top + 3.1, 0);
  for (let i = 0; i < 5; i++) box(0.15, 1.2, 0.15, DARK, -11.5 + i * 1.2, top + 3.4, -1.9);
  for (const x of [-3, -1.5, 0]) {
    b.part(new THREE.CylinderGeometry(0.5, 0.5, 1.4, 8), RUST, { at: [x, top + 1.9, 2] });
  }
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 5, 6), DARK, { at: [tx, top + 7, -1.5] });

  // planters at base
  for (const x of [-14, 4, 12, 18]) {
    box(2.4, 0.6, 1.2, CONC_L, x, 0.6, 6.4);
    box(2.2, 0.15, 1.0, MOSS, x, 0.95, 6.4);
  }

  // lower stain / weathering streaks
  for (let i = 0; i < 18; i++) {
    const x = (R() - 0.5) * (W - 2);
    box(0.5 + R() * 0.6, 3 + R() * 4, 0.05, "#5a5853", x, top - 2 - R() * 6, D / 2 + 0.55);
  }

  return b.root;
}
