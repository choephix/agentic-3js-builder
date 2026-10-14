import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Fennec fox",
  description: "A stylized fennec fox in a rest pose: huge ears, fox-tan coat, cream underside and cheeks, black nose and tail tip.",
};

const FUR = "#dc9448";
const FUR_DARK = "#b86f32";
const CREAM = "#f7e6c8";
const INNER_EAR = "#f2b9a0";
const BLACK = "#241b18";
const EYE = "#120d0c";

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "fennec" });

  // ---- Skeleton ------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.3, -0.12] });
  const chest = b.joint("chest", { at: [0, 0.33, 0.1], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.39, 0.21], parent: chest });
  const head = b.joint("head", { at: [0, 0.45, 0.3], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.4, 0.36], parent: head });
  b.joint("earL", { at: [0.05, 0.5, 0.29], parent: head });
  b.joint("earR", { at: [-0.05, 0.5, 0.29], parent: head });

  // Legs
  for (const [s, side] of [[1, "L"], [-1, "R"]] as const) {
    const x = 0.075 * s;
    b.joint("hip" + side, { at: [x, 0.3, -0.12], parent: hips });
    b.joint("knee" + side, { at: [x, 0.16, -0.13], parent: hips });
    b.joint("ankle" + side, { at: [x, 0.04, -0.1], parent: hips });

    const fx = 0.07 * s;
    b.joint("shoulder" + side, { at: [fx, 0.3, 0.12], parent: chest });
    b.joint("elbow" + side, { at: [fx, 0.16, 0.12], parent: chest });
    b.joint("wrist" + side, { at: [fx, 0.035, 0.12], parent: chest });
  }

  // Tail
  const tail1 = b.joint("tail1", { at: [0, 0.34, -0.2], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.33, -0.36], parent: tail1 });
  const tail3 = b.joint("tail3", { at: [0, 0.3, -0.5], parent: tail2 });

  // ---- Helpers -------------------------------------------------------------
  const ellipsoid = (at: V, scale: V, color: string) =>
    b.part(new THREE.SphereGeometry(1, 12, 9), color, { at, scale });

  // A cylinder from a to c, thick at a (rA) and c (rC).
  const limbSeg = (a: V, c: V, rA: number, rC: number, color: string) => {
    const A = new THREE.Vector3(...a);
    const C = new THREE.Vector3(...c);
    const mid = A.clone().add(C).multiplyScalar(0.5);
    const len = A.distanceTo(C);
    b.part(new THREE.CylinderGeometry(rC, rA, len, 7), color, {
      at: [mid.x, mid.y, mid.z],
      aim: c,
    });
  };

  // A cone with its base at `base` and its tip at `tip`.
  const cone = (base: V, tip: V, r: number, color: string) => {
    const B = new THREE.Vector3(...base);
    const T = new THREE.Vector3(...tip);
    const mid = B.clone().add(T).multiplyScalar(0.5);
    const len = B.distanceTo(T);
    b.part(new THREE.ConeGeometry(r, len, 6), color, {
      at: [mid.x, mid.y, mid.z],
      aim: tip,
    });
  };

  // ---- Body ----------------------------------------------------------------
  ellipsoid([0, 0.32, -0.02], [0.12, 0.12, 0.25], FUR);      // barrel
  ellipsoid([0, 0.33, 0.12], [0.105, 0.115, 0.11], FUR);     // chest
  ellipsoid([0, 0.265, 0.0], [0.085, 0.05, 0.22], CREAM);    // cream underside
  ellipsoid([0, 0.36, -0.2], [0.07, 0.07, 0.09], FUR_DARK);  // haunch saddle

  // Neck
  limbSeg([0, 0.36, 0.17], [0, 0.44, 0.27], 0.07, 0.065, FUR);

  // ---- Head ----------------------------------------------------------------
  ellipsoid([0, 0.45, 0.3], [0.085, 0.08, 0.095], FUR);          // skull
  cone([0, 0.42, 0.335], [0, 0.4, 0.44], 0.05, FUR);             // muzzle
  ellipsoid([0, 0.39, 0.37], [0.04, 0.03, 0.06], CREAM);         // lower jaw / chin
  ellipsoid([0, 0.4, 0.44], [0.018, 0.016, 0.018], BLACK);       // nose
  for (const s of [1, -1]) {
    ellipsoid([0.05 * s, 0.41, 0.36], [0.04, 0.034, 0.05], CREAM); // cheek
    ellipsoid([0.04 * s, 0.46, 0.365], [0.013, 0.011, 0.012], EYE); // eye
  }

  // ---- Ears (huge, the fennec signature) ------------------------------------
  for (const s of [1, -1]) {
    cone([0.05 * s, 0.5, 0.29], [0.075 * s, 0.67, 0.265], 0.05, FUR);            // outer ear
    cone([0.05 * s, 0.505, 0.305], [0.072 * s, 0.63, 0.28], 0.03, INNER_EAR);     // inner ear
    cone([0.07 * s, 0.6, 0.272], [0.075 * s, 0.67, 0.265], 0.022, BLACK);         // dark tip
  }

  // ---- Legs ----------------------------------------------------------------
  for (const s of [1, -1]) {
    const x = 0.075 * s;
    // rear leg
    limbSeg([x, 0.3, -0.12], [x, 0.16, -0.13], 0.03, 0.026, FUR_DARK);
    limbSeg([x, 0.16, -0.13], [x, 0.04, -0.1], 0.024, 0.02, FUR_DARK);
    b.part(new THREE.BoxGeometry(0.05, 0.035, 0.08), BLACK, { at: [x, 0.018, -0.07] });

    // front leg
    const fx = 0.07 * s;
    limbSeg([fx, 0.3, 0.12], [fx, 0.16, 0.12], 0.028, 0.024, FUR_DARK);
    limbSeg([fx, 0.16, 0.12], [fx, 0.035, 0.12], 0.022, 0.018, FUR_DARK);
    b.part(new THREE.BoxGeometry(0.045, 0.035, 0.07), BLACK, { at: [fx, 0.018, 0.155] });
  }

  // ---- Tail (big, bushy, cream tip) -----------------------------------------
  limbSeg([0, 0.34, -0.2], [0, 0.33, -0.36], 0.05, 0.058, FUR);
  limbSeg([0, 0.33, -0.36], [0, 0.3, -0.5], 0.058, 0.045, FUR);
  limbSeg([0, 0.3, -0.5], [0, 0.29, -0.6], 0.045, 0.03, FUR);
  ellipsoid([0, 0.285, -0.62], [0.04, 0.04, 0.05], CREAM);

  return b.root;
}
