```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "owl",
  description: "A stylised tawny owl standing upright on primitive shapes, with a big facial disc, yellow eyes and ear tufts.",
};

const BROWN = "#7a5230";
const DARK = "#3b2a1c";
const CREAM = "#e9dcc0";
const FACE = "#d8c293";
const YEL = "#f2b233";
const BLACK = "#15110d";
const BEAK = "#c9a45c";
const TOE = "#d9a22e";

// Ellipsoid built from a unit sphere, so it is one primitive with the right proportions.
function ellipsoid(rx: number, ry: number, rz: number, seg = 14) {
  const g = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.7));
  g.scale(rx, ry, rz);
  return g;
}

export default function build() {
  const b = createBuilder({ name: "owl" });

  // ---- Skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.11, 0] });
  const chest = b.joint("chest", { at: [0, 0.2, 0], parent: hips });
  const head = b.joint("head", { at: [0, 0.28, 0.015], parent: chest });
  const shoulderL = b.joint("shoulderL", { at: [0.07, 0.25, 0], parent: chest });
  const shoulderR = b.joint("shoulderR", { at: [-0.07, 0.25, 0], parent: chest });
  const hipL = b.joint("hipL", { at: [0.045, 0.1, 0], parent: hips });
  const hipR = b.joint("hipR", { at: [-0.045, 0.1, 0], parent: hips });
  const tail = b.joint("tail", { at: [0, 0.1, -0.06], parent: hips });

  // ---- Body ---------------------------------------------------------------
  b.part(ellipsoid(0.1, 0.12, 0.095), BROWN, { at: [0, 0.2, 0], bone: chest });

  // Cream breast plate on the front, with a few dark chevron bars.
  b.part(ellipsoid(0.07, 0.09, 0.03), CREAM, { at: [0, 0.19, 0.075], bone: chest });
  for (const row of [0.23, 0.2, 0.17, 0.14]) {
    for (const x of [-0.03, 0, 0.03]) {
      b.part(ellipsoid(0.008, 0.005, 0.003, 8), DARK, { at: [x, row, 0.1], bone: chest });
    }
  }

  // ---- Head ---------------------------------------------------------------
  b.part(ellipsoid(0.095, 0.085, 0.085), BROWN, { at: [0, 0.31, 0], bone: head });

  // Facial disc and eye rims.
  b.part(ellipsoid(0.085, 0.075, 0.03), FACE, { at: [0, 0.3, 0.07], bone: head });
  for (const s of [-1, 1]) {
    const x = s * 0.034;
    b.part(ellipsoid(0.04, 0.04, 0.012, 12), DARK, { at: [x, 0.315, 0.09], bone: head });
    b.part(new THREE.SphereGeometry(0.03, 14, 10), YEL, { at: [x, 0.315, 0.1], bone: head });
    b.part(new THREE.SphereGeometry(0.016, 10, 8), BLACK, { at: [x, 0.315, 0.125], bone: head });
  }

  // Beak: a cone turned so its tip points along +Z.
  const beak = new THREE.ConeGeometry(0.014, 0.03, 8);
  beak.rotateX(Math.PI / 2);
  b.part(beak, BEAK, { at: [0, 0.295, 0.108], bone: head });

  // Ear tufts, splayed outward.
  for (const s of [-1, 1]) {
    const tuft = new THREE.ConeGeometry(0.018, 0.07, 6);
    tuft.rotateZ(-s * 0.3);
    b.part(tuft, DARK, { at: [s * 0.05, 0.395, 0], bone: head });
  }

  // ---- Wings (folded, along the sides) -------------------------------------
  for (const [s, sh] of [
    [1, shoulderL],
    [-1, shoulderR],
  ] as const) {
    b.part(ellipsoid(0.035, 0.12, 0.075), BROWN, { at: [s * 0.105, 0.2, -0.01], bone: sh });
    for (const y of [0.24, 0.21, 0.18]) {
      b.part(ellipsoid(0.012, 0.02, 0.004, 8), DARK, { at: [s * 0.138, y, -0.01], bone: sh });
    }
  }

  // ---- Legs and feet -------------------------------------------------------
  for (const [s, hip] of [
    [1, hipL],
    [-1, hipR],
  ] as const) {
    const x = s * 0.045;
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.07, 8), TOE, { at: [x, 0.065, 0.01], bone: hip });
    // Three forward toes and one back toe.
    for (const [tx, tz] of [
      [-0.012, 0.02],
      [0, 0.024],
      [0.012, 0.02],
      [0, -0.008],
    ] as const) {
      const toe = new THREE.CylinderGeometry(0.008, 0.008, 0.03, 6);
      toe.rotateX(Math.PI / 2);
      b.part(toe, TOE, { at: [x + tx, 0.009, 0.01 + tz], bone: hip });
    }
  }

  // ---- Tail ----------------------------------------------------------------
  b.part(new THREE.BoxGeometry(0.06, 0.09, 0.012), DARK, { at: [0, 0.06, -0.1], bone: tail });

  const root = b.root;
  return root;
}
```