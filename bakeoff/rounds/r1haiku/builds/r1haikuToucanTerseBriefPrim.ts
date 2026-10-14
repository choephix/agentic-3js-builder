import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

const INK = "#15171b";
const WHITE = "#f4f1ea";
const ORANGE = "#f58a1f";
const YELLOW = "#ffc21a";
const BLUE = "#2a7fd6";
const RED = "#d7322a";
const GREY = "#5d6268";

export const meta = {
  name: "Toucan",
  description: "A perched toucan: oversized orange bill, black plumage, white throat, blue eye ring.",
};

export default function build() {
  const b = createBuilder({ name: "toucan" });

  // ---- Skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.27, -0.1] });
  const chest = b.joint("chest", { at: [0, 0.34, 0.02], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.4, 0.1], parent: chest });
  const head = b.joint("head", { at: [0, 0.45, 0.14], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.4, 0.2], parent: head });

  const tail1 = b.joint("tail1", { at: [0, 0.2, -0.2], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.15, -0.36], parent: tail1 });

  const wingL = b.joint("wingL", { at: [0.1, 0.33, -0.02], parent: chest });
  const wingR = b.joint("wingR", { at: [-0.1, 0.33, -0.02], parent: chest });

  b.joint("hipL", { at: [0.06, 0.27, -0.1], parent: hips });
  b.joint("kneeL", { at: [0.065, 0.14, -0.02], parent: hips });
  b.joint("ankleL", { at: [0.065, 0.035, 0.0], parent: hips });
  b.joint("hipR", { at: [-0.06, 0.27, -0.1], parent: hips });
  b.joint("kneeR", { at: [-0.065, 0.14, -0.02], parent: hips });
  b.joint("ankleR", { at: [-0.065, 0.035, 0.0], parent: hips });

  // ---- Helpers ------------------------------------------------------------
  const ellipsoid = (at: number[], scale: number[], color: string) =>
    b.part({
      geo: new THREE.SphereGeometry(1, 14, 10),
      color,
      at,
      scale,
    });

  const seg = (a: number[], c: number[], r: number, color: string) => {
    const d = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const len = Math.hypot(d[0], d[1], d[2]);
    const dir = [d[0] / len, d[1] / len, d[2] / len];
    const at = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
    b.part({
      geo: new THREE.CylinderGeometry(r, r, len, 8),
      color,
      at,
      dir,
    });
  };

  // ---- Body ---------------------------------------------------------------
  ellipsoid([0, 0.3, -0.04], [0.13, 0.13, 0.2], INK); // black body
  ellipsoid([0, 0.27, 0.05], [0.1, 0.11, 0.12], WHITE); // white breast
  ellipsoid([0, 0.13, -0.26], [0.06, 0.05, 0.06], RED); // red under-tail

  // Folded wings, sitting along the flanks
  ellipsoid([0.12, 0.3, -0.04], [0.04, 0.11, 0.17], INK);
  ellipsoid([-0.12, 0.3, -0.04], [0.04, 0.11, 0.17], INK);

  // Tail: a long flat blade angled down and back
  b.part({
    geo: new THREE.BoxGeometry(0.1, 0.26, 0.015),
    color: INK,
    at: [0, 0.16, -0.32],
    dir: [0, -0.35, -1],
  });

  // ---- Head and face ------------------------------------------------------
  ellipsoid([0, 0.45, 0.14], [0.075, 0.075, 0.075], INK);
  ellipsoid([0, 0.39, 0.17], [0.055, 0.04, 0.05], WHITE); // throat

  // Eyes with a bold blue ring
  for (const s of [1, -1]) {
    ellipsoid([s * 0.045, 0.46, 0.19], [0.032, 0.032, 0.014], BLUE);
    ellipsoid([s * 0.045, 0.46, 0.2], [0.02, 0.02, 0.01], WHITE);
  }

  // ---- Bill (upper on head, lower on jaw) ---------------------------------
  ellipsoid([0, 0.475, 0.2], [0.055, 0.05, 0.07], YELLOW); // bill base
  ellipsoid([0, 0.47, 0.28], [0.05, 0.047, 0.14], ORANGE); // upper mandible
  ellipsoid([0, 0.46, 0.38], [0.03, 0.03, 0.03], INK); // black tip
  ellipsoid([0, 0.4, 0.27], [0.045, 0.03, 0.14], ORANGE); // lower mandible
  ellipsoid([0, 0.387, 0.2], [0.04, 0.012, 0.09], INK); // lower bill shadow

  // ---- Legs and feet (grey, perched) --------------------------------------
  const legs: [number, string, string][] = [
    [1, "L", "R"],
    [-1, "R", "L"],
  ];
  for (const [s] of legs) {
    const hip = [s * 0.06, 0.27, -0.1];
    const knee = [s * 0.065, 0.14, -0.02];
    const ankle = [s * 0.065, 0.035, 0.0];
    seg(hip, knee, 0.018, GREY);
    seg(knee, ankle, 0.013, GREY);
    // three forward and side toes resting on the ground
    seg(ankle, [s * 0.065, 0.012, 0.07], 0.01, GREY);
    seg(ankle, [s * 0.1, 0.012, 0.03], 0.01, GREY);
    seg(ankle, [s * 0.03, 0.012, 0.03], 0.01, GREY);
  }

  return b.root;
}
