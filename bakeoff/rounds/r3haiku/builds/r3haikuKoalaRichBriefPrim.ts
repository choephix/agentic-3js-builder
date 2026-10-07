import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "sleepy-koala",
  description: "A drowsy ash-grey koala hugging a eucalyptus branch and chewing a sprig of leaves.",
};

// Palette
const FUR = "#9a9ca0";
const FUR_DARK = "#6f7278";
const CREAM = "#efe6cf";
const NOSE = "#1c1a1a";
const EYE = "#4b2d18";
const CLAW = "#2b2b2e";
const LEAF = "#5f9c8f";
const LEAF_DARK = "#3f7a6e";
const STEM = "#8c9a7a";
const BARK = "#7b5b3f";

export default function build() {
  const b = createBuilder({ name: "sleepy-koala" });
  const r = rng(7);

  // ---- Skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.2, 0] });
  const spine = b.joint("spine", { at: [0, 0.4, 0.02], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.56, 0.07], parent: spine });
  const head = b.joint("head", { at: [0, 0.7, 0.1], parent: neck });

  const shoulderL = b.joint("shoulderL", { at: [0.12, 0.47, 0.06], parent: spine });
  const elbowL = b.joint("elbowL", { at: [0.2, 0.42, 0.22], parent: shoulderL });
  const wristL = b.joint("wristL", { at: [0.1, 0.4, 0.36], parent: elbowL });

  const shoulderR = b.joint("shoulderR", { at: [-0.12, 0.47, 0.06], parent: spine });
  const elbowR = b.joint("elbowR", { at: [-0.18, 0.42, 0.2], parent: shoulderR });
  const wristR = b.joint("wristR", { at: [-0.1, 0.5, 0.28], parent: elbowR });

  const hipL = b.joint("hipL", { at: [0.12, 0.18, 0.06], parent: hips });
  const kneeL = b.joint("kneeL", { at: [0.14, 0.08, 0.28], parent: hipL });
  const ankleL = b.joint("ankleL", { at: [0.13, 0.045, 0.38], parent: kneeL });

  const hipR = b.joint("hipR", { at: [-0.12, 0.18, 0.06], parent: hips });
  const kneeR = b.joint("kneeR", { at: [-0.14, 0.08, 0.28], parent: hipR });
  const ankleR = b.joint("ankleR", { at: [-0.13, 0.045, 0.38], parent: kneeR });

  // ---- Helpers ------------------------------------------------------------
  const ell = (bone, p, radius, s, color) =>
    b.part(new THREE.SphereGeometry(radius, 16, 12), color, { at: p, bone, scale: s });

  const leaf = (bone, p, tip, color) =>
    b.part(new THREE.SphereGeometry(0.02, 10, 8), color, {
      at: p,
      bone,
      scale: [1.0, 2.6, 0.35],
      aim: tip,
    });

  // ---- Body ---------------------------------------------------------------
  ell(spine, [0, 0.34, 0.02], 0.17, [0.95, 1.1, 0.9], FUR);
  ell(spine, [0, 0.36, 0.13], 0.12, [0.8, 1.0, 0.5], CREAM); // cream chest
  ell(hips, [0.13, 0.13, 0.07], 0.12, [1, 0.8, 1.0], FUR); // haunches
  ell(hips, [-0.13, 0.13, 0.07], 0.12, [1, 0.8, 1.0], FUR);
  ell(hips, [0, 0.25, -0.14], 0.04, [1, 1, 1], FUR_DARK); // tiny tail nub

  // Thighs and feet
  ell(hipL, [0.13, 0.14, 0.17], 0.07, [1, 1, 1.5], FUR);
  ell(hipR, [-0.13, 0.14, 0.17], 0.07, [1, 1, 1.5], FUR);
  ell(ankleL, [0.13, 0.045, 0.38], 0.05, [1.1, 0.8, 1.3], FUR_DARK);
  ell(ankleR, [-0.13, 0.045, 0.38], 0.05, [1.1, 0.8, 1.3], FUR_DARK);

  for (const [bone, sx] of [[ankleL, 0.13], [ankleR, -0.13]]) {
    for (const dx of [-0.02, 0, 0.02]) {
      const x = sx + dx;
      b.part(new THREE.ConeGeometry(0.006, 0.03, 6), CLAW, {
        at: [x, 0.04, 0.44],
        bone,
        aim: [x, 0.04, 0.48],
      });
    }
  }

  // ---- Arms -----------------------------------------------------------------
  // Left arm wraps around the branch in front of the chest.
  ell(shoulderL, [0.17, 0.445, 0.13], 0.055, [1, 1, 1.9], FUR);
  ell(elbowL, [0.16, 0.39, 0.29], 0.05, [1, 1, 1.7], FUR);
  ell(wristL, [0.1, 0.4, 0.37], 0.055, [1.2, 0.9, 1.2], FUR_DARK);
  for (const dx of [-0.03, 0, 0.03]) {
    b.part(new THREE.ConeGeometry(0.005, 0.025, 6), CLAW, {
      at: [0.1 + dx, 0.4, 0.43],
      bone: wristL,
      aim: [0.1 + dx, 0.4, 0.47],
    });
  }

  // Right arm holds the sprig up toward the mouth.
  ell(shoulderR, [-0.17, 0.455, 0.13], 0.055, [1, 1, 1.9], FUR);
  ell(elbowR, [-0.15, 0.43, 0.24], 0.05, [1, 1, 1.5], FUR);
  ell(wristR, [-0.1, 0.5, 0.28], 0.055, [1.1, 0.9, 1.1], FUR_DARK);
  for (const dx of [-0.02, 0.0, 0.02]) {
    b.part(new THREE.ConeGeometry(0.005, 0.025, 6), CLAW, {
      at: [-0.1 + dx, 0.5, 0.33],
      bone: wristR,
      aim: [-0.1 + dx, 0.5, 0.37],
    });
  }

  // ---- Head -----------------------------------------------------------------
  ell(head, [0, 0.7, 0.1], 0.12, [1, 0.95, 0.95], FUR);
  ell(head, [0, 0.66, 0.2], 0.075, [1, 0.8, 0.9], CREAM); // muzzle

  // Big leathery nose
  ell(head, [0, 0.7, 0.275], 0.045, [1.3, 0.9, 0.8], NOSE);

  // Fluffy ears with cream lining
  for (const sx of [1, -1]) {
    ell(head, [sx * 0.1, 0.8, 0.08], 0.055, [1, 1, 0.35], FUR);
    ell(head, [sx * 0.1, 0.8, 0.1], 0.04, [1, 1, 0.3], CREAM);
  }

  // Drowsy half-closed eyes: brown eyeball with a fur lid covering the top half
  for (const sx of [1, -1]) {
    ell(head, [sx * 0.055, 0.73, 0.215], 0.02, [1, 1, 0.5], EYE);
    ell(head, [sx * 0.055, 0.745, 0.222], 0.027, [1.1, 0.55, 0.5], FUR_DARK);
  }

  // ---- Eucalyptus sprig in the right paw ------------------------------------
  b.sweep(
    [
      [-0.1, 0.5, 0.29],
      [-0.07, 0.58, 0.31],
      [-0.03, 0.65, 0.32],
    ],
    0.005,
    { color: STEM },
  );
  const sprigLeaves = [
    { p: [-0.07, 0.56, 0.31], d: [0.5, 0.6, 0.6] },
    { p: [-0.06, 0.6, 0.315], d: [-0.6, 0.5, 0.5] },
    { p: [-0.04, 0.63, 0.32], d: [0.5, 0.7, 0.4] },
    { p: [-0.03, 0.66, 0.32], d: [-0.3, 0.8, 0.5] },
  ];
  for (const { p, d } of sprigLeaves) {
    const tip = [p[0] + d[0] * 0.05, p[1] + d[1] * 0.05, p[2] + d[2] * 0.05];
    const color = r() > 0.5 ? LEAF : LEAF_DARK;
    b.part(new THREE.SphereGeometry(0.02, 10, 8), color, {
      at: p,
      scale: [1.0, 2.6, 0.35],
      aim: tip,
    });
  }

  // ---- Branch the koala hugs ----------------------------------------------
  const branchPath = [
    [0.3, 0, 0.42],
    [0.18, 0.3, 0.38],
    [0.04, 0.45, 0.34],
    [-0.12, 0.62, 0.36],
    [-0.3, 0.8, 0.36],
  ];
  b.sweep(branchPath, 0.025, { color: BARK });

  // Eucalyptus leaves clustered on the branch
  const branchLeaves = [
    { p: [-0.2, 0.74, 0.36], d: [-0.6, 0.5, 0.3] },
    { p: [-0.26, 0.78, 0.36], d: [-0.4, 0.7, 0.4] },
    { p: [0.12, 0.2, 0.39], d: [0.7, 0.4, 0.2] },
    { p: [0.22, 0.1, 0.41], d: [0.8, 0.3, 0.1] },
  ];
  for (const { p, d } of branchLeaves) {
    const tip = [p[0] + d[0] * 0.05, p[1] + d[1] * 0.05, p[2] + d[2] * 0.05];
    b.part(new THREE.SphereGeometry(0.02, 10, 8), LEAF, {
      at: p,
      scale: [1.0, 2.6, 0.35],
      aim: tip,
    });
  }

  return b.root;
}
