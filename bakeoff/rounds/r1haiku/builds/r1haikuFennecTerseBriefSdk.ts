import * as THREE from "three";
import { createBuilder, frame } from "../../../../src/index";

export const meta = {
  name: "fennec fox",
  description: "A stylised fennec fox in a rest pose: oversized ears, cream body, sandy back, black-tipped tail.",
};

const CREAM = "#eedcb8";
const SAND = "#d9a46a";
const WHITE = "#f8f1e4";
const INNER_EAR = "#f3cfa2";
const BLACK = "#1d1714";
const EYE = "#140f0c";

export default function build() {
  const b = createBuilder({ name: "fennec fox" });

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.36, -0.1] });
  const chest = b.joint("chest", { at: [0, 0.4, 0.12], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.46, 0.22], parent: chest });
  const head = b.joint("head", { at: [0, 0.52, 0.3], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.45, 0.36], parent: head });

  const tail1 = b.joint("tail1", { at: [0, 0.38, -0.22], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.36, -0.36], parent: tail1 });
  const tail3 = b.joint("tail3", { at: [0, 0.33, -0.5], parent: tail2 });
  const tail4 = b.joint("tail4", { at: [0, 0.3, -0.6], parent: tail3 });

  const hipL = b.joint("hipL", { at: [0.07, 0.36, -0.08], parent: hips });
  const kneeL = b.joint("kneeL", { at: [0.07, 0.2, -0.07], parent: hipL });
  const ankleL = b.joint("ankleL", { at: [0.07, 0.05, -0.05], parent: kneeL });
  const hipR = b.joint("hipR", { at: [-0.07, 0.36, -0.08], parent: hips });
  const kneeR = b.joint("kneeR", { at: [-0.07, 0.2, -0.07], parent: hipR });
  const ankleR = b.joint("ankleR", { at: [-0.07, 0.05, -0.05], parent: kneeR });

  const shoulderL = b.joint("shoulderL", { at: [0.07, 0.4, 0.12], parent: chest });
  const elbowL = b.joint("elbowL", { at: [0.07, 0.2, 0.12], parent: shoulderL });
  const wristL = b.joint("wristL", { at: [0.07, 0.05, 0.13], parent: elbowL });
  const shoulderR = b.joint("shoulderR", { at: [-0.07, 0.4, 0.12], parent: chest });
  const elbowR = b.joint("elbowR", { at: [-0.07, 0.2, 0.12], parent: shoulderR });
  const wristR = b.joint("wristR", { at: [-0.07, 0.05, 0.13], parent: elbowR });

  // Torso and neck
  b.capsule([0, 0.36, -0.1], [0, 0.4, 0.12], 0.1, CREAM);
  b.capsule([0, 0.4, 0.12], [0, 0.46, 0.22], 0.065, SAND);
  b.capsule([0, 0.46, 0.22], [0, 0.52, 0.3], 0.075, CREAM);

  // Saddle of sandy fur along the back
  b.capsule([0, 0.45, -0.02], [0, 0.44, 0.12], 0.07, SAND);

  // Head and muzzle
  b.capsule([0, 0.52, 0.3], [0, 0.5, 0.4], 0.05, WHITE);
  b.capsule([0, 0.45, 0.36], [0, 0.47, 0.44], 0.035, WHITE);
  b.stick(new THREE.SphereGeometry(0.022, 8, 6), BLACK, frame([0, 0.48, 0.47], [0, 0, 1]));

  // Jaw: separate lower piece
  b.capsule([0, 0.44, 0.36], [0, 0.44, 0.44], 0.025, CREAM);

  // Eyes: dark almond shapes set into the face
  for (const s of [-1, 1]) {
    b.stick(new THREE.SphereGeometry(0.018, 8, 6), EYE, frame([s * 0.04, 0.545, 0.36], [s, 0.2, 1]));
  }

  // Oversized ears: sand outside, pale inside, black-tipped
  for (const s of [-1, 1]) {
    b.stick(new THREE.ConeGeometry(0.075, 0.22, 4), SAND, frame([s * 0.045, 0.6, 0.27], [s * 0.2, 1, -0.25]));
    b.stick(new THREE.ConeGeometry(0.045, 0.16, 4), INNER_EAR, frame([s * 0.045, 0.6, 0.28], [s * 0.2, 1, -0.2]));
    b.stick(new THREE.SphereGeometry(0.02, 6, 4), BLACK, frame([s * 0.075, 0.7, 0.23], [s * 0.2, 1, -0.25]));
  }

  // Legs with cream stockings and dark paws
  for (const s of [-1, 1]) {
    b.capsule([s * 0.07, 0.36, -0.08], [s * 0.07, 0.2, -0.07], 0.035, SAND);
    b.capsule([s * 0.07, 0.2, -0.07], [s * 0.07, 0.05, -0.05], 0.024, CREAM);
    b.capsule([s * 0.07, 0.4, 0.12], [s * 0.07, 0.2, 0.12], 0.032, SAND);
    b.capsule([s * 0.07, 0.2, 0.12], [s * 0.07, 0.05, 0.13], 0.022, CREAM);
    b.stick(new THREE.BoxGeometry(0.055, 0.03, 0.09), WHITE, frame([s * 0.07, 0.015, -0.02], [0, 1, 0]));
    b.stick(new THREE.BoxGeometry(0.05, 0.03, 0.09), WHITE, frame([s * 0.07, 0.015, 0.16], [0, 1, 0]));
  }

  // Bushy tail with black tip
  b.capsule([0, 0.38, -0.22], [0, 0.36, -0.36], 0.05, SAND);
  b.capsule([0, 0.36, -0.36], [0, 0.33, -0.5], 0.058, CREAM);
  b.capsule([0, 0.33, -0.5], [0, 0.3, -0.6], 0.05, SAND);
  b.stick(new THREE.SphereGeometry(0.05, 8, 6), BLACK, frame([0, 0.3, -0.66], [0, 0, -1]));

  return b.root;
}
