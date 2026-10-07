```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Fennec Fox",
  description: "A small desert fox with oversized ears, cream chest, and a dark-tipped bushy tail, built from primitives.",
};

export default function build() {
  const b = createBuilder({ name: "fennec" });

  const SAND = "#e6bf8a";
  const CREAM = "#f6e9d3";
  const DARK = "#2e2320";
  const PINK = "#e8a79f";
  const TAIL_TIP = "#3a2c28";

  // ---- skeleton ----
  const hips = b.joint("hips", { at: [0, 0.2, -0.1] });
  const spine = b.joint("spine", { at: [0, 0.21, 0.02], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.24, 0.12], parent: spine });
  const head = b.joint("head", { at: [0, 0.28, 0.2], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.258, 0.23], parent: head });
  const earL = b.joint("earL", { at: [0.045, 0.325, 0.185], parent: head });
  const earR = b.joint("earR", { at: [-0.045, 0.325, 0.185], parent: head });

  const tail1 = b.joint("tail1", { at: [0, 0.2, -0.17], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.18, -0.26], parent: tail1 });
  const tail3 = b.joint("tail3", { at: [0, 0.15, -0.34], parent: tail2 });

  const legs: Record<string, any> = {};
  for (const [s, sx] of [["L", 1], ["R", -1]] as const) {
    const hipJ = b.joint("hip" + s, { at: [0.05 * sx, 0.19, -0.1], parent: hips });
    const kneeJ = b.joint("knee" + s, { at: [0.05 * sx, 0.1, -0.11], parent: hipJ });
    b.joint("ankle" + s, { at: [0.05 * sx, 0.05, -0.1], parent: kneeJ });
    const shL = b.joint("shoulder" + s, { at: [0.045 * sx, 0.19, 0.1], parent: spine });
    const elb = b.joint("elbow" + s, { at: [0.045 * sx, 0.1, 0.1], parent: shL });
    b.joint("wrist" + s, { at: [0.045 * sx, 0.04, 0.1], parent: elb });
    legs[s] = sx;
  }

  const sph = (seg = 10) => new THREE.SphereGeometry(1, seg, seg - 2);
  const cyl = (r: number, h: number) => new THREE.CylinderGeometry(r, r * 0.8, h, 6);

  // ---- body ----
  b.part(sph(), SAND, { at: [0, 0.2, -0.04], scale: [0.065, 0.062, 0.14] });
  b.part(sph(), CREAM, { at: [0, 0.185, 0.07], scale: [0.058, 0.055, 0.07] });
  b.part(sph(), SAND, { at: [0, 0.215, 0.07], scale: [0.058, 0.05, 0.08] });
  b.part(sph(), SAND, { at: [0, 0.23, 0.14], scale: [0.04, 0.045, 0.05] }); // neck
  b.part(sph(), CREAM, { at: [0, 0.2, 0.15], scale: [0.03, 0.04, 0.04] }); // throat

  // ---- head ----
  b.part(sph(), SAND, { at: [0, 0.28, 0.2], scale: [0.06, 0.052, 0.058] });
  b.part(sph(), CREAM, { at: [0.035, 0.262, 0.235], scale: [0.025, 0.025, 0.03] }); // cheeks
  b.part(sph(), CREAM, { at: [-0.035, 0.262, 0.235], scale: [0.025, 0.025, 0.03] });
  b.part(new THREE.ConeGeometry(0.036, 0.075, 6), SAND, { at: [0, 0.27, 0.268], dir: [0, 0, 1] }); // muzzle
  b.part(sph(6), DARK, { at: [0, 0.272, 0.307], scale: [0.011, 0.009, 0.01] }); // nose
  // lower jaw
  b.part(new THREE.ConeGeometry(0.026, 0.06, 6), CREAM, { at: [0, 0.252, 0.258], dir: [0, 0, 1] });
  // eyes
  for (const sx of [1, -1]) {
    b.part(sph(8), DARK, { at: [0.03 * sx, 0.292, 0.245], scale: [0.011, 0.014, 0.008] });
    b.part(sph(6), "#ffffff", { at: [0.031 * sx, 0.296, 0.252], scale: [0.003, 0.003, 0.003] });
    // dark eye streak
    b.part(new THREE.BoxGeometry(0.005, 0.005, 0.03), DARK, { at: [0.032 * sx, 0.28, 0.255] });
  }

  // ---- ears ----
  for (const [sx, j] of [[1, earL], [-1, earR]] as const) {
    b.part(new THREE.ConeGeometry(0.048, 0.2, 5), SAND, {
      at: [0.075 * sx, 0.42, 0.165], dir: [0.35 * sx, 1, -0.15], scale: [1, 1, 0.35],
    });
    b.part(new THREE.ConeGeometry(0.034, 0.16, 5), PINK, {
      at: [0.072 * sx, 0.415, 0.178], dir: [0.35 * sx, 1, -0.15], scale: [1, 1, 0.25],
    });
    b.part(new THREE.ConeGeometry(0.02, 0.05, 5), DARK, {
      at: [0.115 * sx, 0.52, 0.15], dir: [0.35 * sx, 1, -0.15], scale: [1, 1, 0.3],
    });
  }

  // ---- legs ----
  for (const sx of [1, -1]) {
    const x = 0.05 * sx;
    // hind
    b.part(sph(), SAND, { at: [x, 0.16, -0.11], scale: [0.03, 0.055, 0.05] });
    b.part(cyl(0.014, 0.1), SAND, { at: [x, 0.1, -0.11] });
    b.part(cyl(0.012, 0.06), SAND, { at: [x, 0.04, -0.1] });
    b.part(new THREE.BoxGeometry(0.03, 0.025, 0.06), DARK, { at: [x, 0.0125, -0.085] });
    // front
    const fx = 0.045 * sx;
    b.part(cyl(0.015, 0.1), SAND, { at: [fx, 0.14, 0.1] });
    b.part(cyl(0.011, 0.1), CREAM, { at: [fx, 0.05, 0.1] });
    b.part(new THREE.BoxGeometry(0.028, 0.025, 0.055), DARK, { at: [fx, 0.0125, 0.115] });
  }

  // ---- tail ----
  b.part(sph(), SAND, { at: [0, 0.195, -0.2], scale: [0.04, 0.04, 0.06] });
  b.part(sph(), SAND, { at: [0, 0.18, -0.275], scale: [0.048, 0.048, 0.07] });
  b.part(sph(), CREAM, { at: [0, 0.155, -0.345], scale: [0.045, 0.045, 0.06] });
  b.part(sph(), TAIL_TIP, { at: [0, 0.13, -0.405], scale: [0.04, 0.04, 0.055] });

  return b.root;
}
```