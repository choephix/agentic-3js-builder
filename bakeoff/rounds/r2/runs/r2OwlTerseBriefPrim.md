```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Owl",
  description: "A stylized, rigged barn/horned owl built from primitives: facial disc, big amber eyes, ear tufts, spotted chest, folded wings, tail and talons.",
};

const BROWN = "#8a6a45";
const DARK = "#5a4129";
const MID = "#a6824f";
const CREAM = "#ecdcb6";
const DISC = "#f4ead2";
const ORANGE = "#f2a31b";
const BLACK = "#111111";
const BEAK = "#d8c48a";
const TALON = "#3b3226";
const LEG = "#cdb68a";

function ell(rx: number, ry: number, rz: number, w = 10, h = 8) {
  const g = new THREE.SphereGeometry(1, w, h);
  g.scale(rx, ry, rz);
  return g;
}

export default function build() {
  const b = createBuilder({ name: "owl" });

  // ---- skeleton ----
  const hips = b.joint("hips", { at: [0, 0.16, 0] });
  const chest = b.joint("chest", { at: [0, 0.24, 0.01], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.31, 0.02], parent: chest });
  const head = b.joint("head", { at: [0, 0.38, 0.02], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.343, 0.085], parent: head });
  const tail1 = b.joint("tail1", { at: [0, 0.12, -0.09], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.08, -0.17], parent: tail1 });

  // ---- body ----
  const bodyC = { x: 0, y: 0.2, z: 0 };
  const brx = 0.115, bry = 0.15, brz = 0.1;
  b.part(ell(brx, bry, brz, 12, 10), BROWN, { at: [bodyC.x, bodyC.y, bodyC.z], bone: chest });
  // cream chest
  b.part(ell(0.085, 0.12, 0.07, 12, 10), CREAM, { at: [0, 0.19, 0.04], bone: chest });
  // chest spots, seated on the front of the belly
  const rows = [0.27, 0.235, 0.2, 0.165, 0.13, 0.1];
  rows.forEach((y, ri) => {
    const n = ri % 2 === 0 ? 3 : 2;
    for (let i = 0; i < n; i++) {
      const x = (i - (n - 1) / 2) * 0.04;
      const zz = 0.04 + 0.07 * Math.sqrt(Math.max(0.05, 1 - (x / 0.085) ** 2 - ((y - 0.19) / 0.12) ** 2));
      const g = ell(0.008, 0.014, 0.004, 5, 4);
      b.part(g, DARK, { at: [x, y, zz + 0.002], bone: chest });
    }
  });
  // back saddle (darker)
  b.part(ell(0.1, 0.13, 0.05, 10, 8), DARK, { at: [0, 0.2, -0.065], bone: chest });
  for (let i = 0; i < 6; i++) {
    const x = (i % 3 - 1) * 0.04;
    const y = 0.14 + Math.floor(i / 3) * 0.08;
    b.part(ell(0.012, 0.018, 0.006, 5, 4), CREAM, { at: [x, y, -0.113], bone: chest });
  }

  // ---- head ----
  b.part(ell(0.1, 0.092, 0.092, 12, 9), BROWN, { at: [0, 0.385, 0.02], bone: head });
  // facial discs
  for (const s of [1, -1]) {
    const g = ell(0.056, 0.062, 0.022, 10, 8);
    g.rotateY(s * 0.35);
    b.part(g, DISC, { at: [s * 0.044, 0.383, 0.09], bone: head });
    // dark rim of disc
    const r = ell(0.062, 0.068, 0.018, 10, 8);
    r.rotateY(s * 0.4);
    b.part(r, MID, { at: [s * 0.046, 0.383, 0.083], bone: head });
    // eye surround, eye, pupil
    b.part(ell(0.036, 0.036, 0.02, 8, 6), BLACK, { at: [s * 0.04, 0.39, 0.104], bone: head });
    b.part(new THREE.SphereGeometry(0.029, 10, 8), ORANGE, { at: [s * 0.04, 0.39, 0.112], bone: head });
    b.part(new THREE.SphereGeometry(0.016, 8, 6), BLACK, { at: [s * 0.04, 0.39, 0.128], bone: head });
    b.part(new THREE.SphereGeometry(0.005, 4, 4), "#ffffff", { at: [s * 0.046, 0.397, 0.142], bone: head });
    // brow
    const brow = new THREE.BoxGeometry(0.05, 0.012, 0.015);
    brow.rotateZ(s * -0.4);
    b.part(brow, DARK, { at: [s * 0.04, 0.425, 0.098], bone: head });
    // ear tufts
    const tuft = new THREE.ConeGeometry(0.02, 0.09, 5);
    tuft.rotateZ(-s * 0.3);
    b.part(tuft, DARK, { at: [s * 0.06, 0.475, 0.0], bone: head });
    const tuftIn = new THREE.ConeGeometry(0.01, 0.06, 4);
    tuftIn.rotateZ(-s * 0.3);
    b.part(tuftIn, BROWN, { at: [s * 0.058, 0.468, 0.014], bone: head });
  }
  // beak: upper + lower
  const up = new THREE.ConeGeometry(0.02, 0.05, 4);
  up.rotateX(Math.PI / 2 + 0.7);
  b.part(up, BEAK, { at: [0, 0.358, 0.115], bone: head });
  const lo = new THREE.ConeGeometry(0.014, 0.03, 4);
  lo.rotateX(Math.PI / 2 + 0.5);
  b.part(lo, "#c2ae75", { at: [0, 0.342, 0.108], bone: jaw });

  // ---- wings ----
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulder = b.joint("shoulder" + side, { at: [s * 0.1, 0.29, -0.01], parent: chest });
    const elbow = b.joint("elbow" + side, { at: [s * 0.125, 0.2, -0.03], parent: shoulder });
    const wrist = b.joint("wrist" + side, { at: [s * 0.135, 0.11, -0.06], parent: elbow });

    const upper = ell(0.026, 0.1, 0.065, 8, 7);
    upper.rotateZ(s * 0.12);
    b.part(upper, BROWN, { at: [s * 0.115, 0.22, -0.02], bone: shoulder });
    const lower = ell(0.024, 0.1, 0.06, 8, 7);
    lower.rotateX(-0.12);
    lower.rotateZ(s * 0.08);
    b.part(lower, MID, { at: [s * 0.132, 0.12, -0.05], bone: elbow });
    // primary feathers
    for (let i = 0; i < 4; i++) {
      const f = new THREE.BoxGeometry(0.012, 0.14, 0.03);
      f.translate(0, -0.07, 0);
      f.rotateX(0.2);
      f.rotateZ(s * (0.06 + i * 0.01));
      b.part(f, i % 2 ? DARK : BROWN, { at: [s * (0.135 + i * 0.001), 0.07, -0.06 - i * 0.022], bone: wrist });
    }
    // wing bars / coverts
    for (let i = 0; i < 3; i++) {
      b.part(ell(0.006, 0.014, 0.05, 5, 4), CREAM, { at: [s * 0.143, 0.24 - i * 0.05, -0.02 - i * 0.015], bone: shoulder });
    }
  }

  // ---- tail ----
  for (let i = 0; i < 3; i++) {
    const f = new THREE.BoxGeometry(0.035, 0.012, 0.16);
    f.translate(0, 0, -0.08);
    f.rotateY((i - 1) * 0.18);
    f.rotateX(-0.45);
    b.part(f, i === 1 ? DARK : BROWN, { at: [(i - 1) * 0.015, 0.1, -0.09], bone: tail1 });
  }
  for (let i = 0; i < 3; i++) {
    b.part(new THREE.BoxGeometry(0.09 - i * 0.012, 0.004, 0.012), CREAM, { at: [0, 0.058 - i * 0.012, -0.12 - i * 0.03], bone: tail2 });
  }

  // ---- legs and talons ----
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip = b.joint("hip" + side, { at: [s * 0.045, 0.1, 0.0], parent: hips });
    const knee = b.joint("knee" + side, { at: [s * 0.045, 0.06, 0.02], parent: hip });
    const ankle = b.joint("ankle" + side, { at: [s * 0.045, 0.025, 0.035], parent: knee });
    // feathered thigh
    b.part(ell(0.04, 0.05, 0.045, 8, 6), CREAM, { at: [s * 0.05, 0.085, 0.015], bone: hip });
    // tarsus
    b.part(new THREE.CylinderGeometry(0.014, 0.012, 0.06, 6), LEG, { at: [s * 0.045, 0.04, 0.03], bone: knee });
    // foot
    b.part(ell(0.02, 0.012, 0.025, 6, 5), LEG, { at: [s * 0.045, 0.012, 0.045], bone: ankle });
    for (let t = 0; t < 3; t++) {
      const ang = (t - 1) * 0.4 + s * 0.05;
      const toe = new THREE.BoxGeometry(0.014, 0.014, 0.05);
      toe.translate(0, 0, 0.025);
      toe.rotateY(ang);
      b.part(toe, LEG, { at: [s * 0.045, 0.009, 0.05], bone: ankle });
      const claw = new THREE.ConeGeometry(0.008, 0.026, 4);
      claw.rotateX(Math.PI / 2 + 0.9);
      b.part(claw, TALON, {
        at: [s * 0.045 + Math.sin(ang) * 0.058, 0.008, 0.05 + Math.cos(ang) * 0.058],
        bone: ankle,
      });
    }
  }

  return b.root;
}
```