import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "koala",
  description: "A stylised sitting koala with a fluffy grey coat, cream chest, round ears and a big black nose.",
};

const FUR = "#8d8e93";
const FUR_DARK = "#6f7076";
const CREAM = "#e6e0d2";
const NOSE = "#161618";
const CLAW = "#2b2b2e";

export default function build() {
  const b = createBuilder({ name: "koala" });

  // Ellipsoid helper: a unit sphere scaled into an oval, placed in model space.
  const blob = (at: [number, number, number], radii: [number, number, number], color: string, bone: any) =>
    b.part(new THREE.SphereGeometry(1, 16, 12), color, { at, bone, scale: radii });

  // ---- Skeleton ----
  const hips = b.joint("hips", { at: [0, 0.16, 0] });
  const spine = b.joint("spine", { at: [0, 0.36, 0], parent: hips });
  const chest = b.joint("chest", { at: [0, 0.55, 0.02], parent: spine });
  const neck = b.joint("neck", { at: [0, 0.66, 0.04], parent: chest });
  const head = b.joint("head", { at: [0, 0.77, 0.06], parent: neck });

  const hipL = b.joint("hipL", { at: [0.14, 0.14, 0.05], parent: hips });
  const hipR = b.joint("hipR", { at: [-0.14, 0.14, 0.05], parent: hips });
  const shoulderL = b.joint("shoulderL", { at: [0.19, 0.6, 0.03], parent: chest });
  const shoulderR = b.joint("shoulderR", { at: [-0.19, 0.6, 0.03], parent: chest });
  const earL = b.joint("earL", { at: [0.1, 0.86, 0.02], parent: head });
  const earR = b.joint("earR", { at: [-0.1, 0.86, 0.02], parent: head });

  // ---- Body ----
  // Torso: a tall oval, slightly wider at the bottom like a sitting bear-shaped koala.
  blob([0, 0.4, 0], [0.2, 0.24, 0.18], FUR, spine);
  // Haunches resting on the floor, pushing forward.
  blob([0.14, 0.15, 0.05], [0.1, 0.09, 0.12], FUR_DARK, hipL);
  blob([-0.14, 0.15, 0.05], [0.1, 0.09, 0.12], FUR_DARK, hipR);
  // Cream chest patch.
  blob([0, 0.5, 0.12], [0.1, 0.11, 0.05], CREAM, chest);
  // Thick neck joining head to body.
  blob([0, 0.63, 0.03], [0.1, 0.08, 0.1], FUR, neck);

  // ---- Arms, hugging the chest ----
  for (const s of [1, -1]) {
    const sh = s > 0 ? shoulderL : shoulderR;
    const elbowX = 0.2 * s;
    const wristX = 0.18 * s;
    blob([0.195 * s, 0.53, 0.065], [0.05, 0.09, 0.05], FUR, sh);
    blob([0.195 * s, 0.395, 0.15], [0.045, 0.07, 0.05], FUR, sh);
    blob([wristX, 0.33, 0.21], [0.05, 0.045, 0.055], FUR_DARK, sh);
    // Claws on the hand.
    for (const dx of [-0.02, 0, 0.02]) {
      b.part(new THREE.ConeGeometry(0.009, 0.035, 5), CLAW, {
        at: [wristX + dx * s, 0.31, 0.25],
        bone: sh,
      });
    }
    void elbowX;
  }

  // ---- Legs and feet ----
  for (const s of [1, -1]) {
    const hip = s > 0 ? hipL : hipR;
    // Foot pad resting on the ground, toes pointing forward.
    blob([0.12 * s, 0.035, 0.22], [0.07, 0.035, 0.1], FUR_DARK, hip);
    // Claws on the toes.
    for (const dx of [-0.03, 0, 0.03]) {
      b.part(new THREE.SphereGeometry(0.012, 8, 6), CLAW, {
        at: [(0.12 + dx) * s, 0.02, 0.31],
        bone: hip,
      });
    }
  }

  // ---- Head ----
  blob([0, 0.77, 0.06], [0.13, 0.12, 0.12], FUR, head);
  // Round fluffy ears with cream inner discs.
  for (const s of [1, -1]) {
    const ear = s > 0 ? earL : earR;
    blob([0.1 * s, 0.87, 0.03], [0.07, 0.075, 0.025], FUR, ear);
    blob([0.1 * s, 0.87, 0.05], [0.045, 0.05, 0.01], CREAM, ear);
  }
  // Muzzle.
  blob([0, 0.73, 0.16], [0.08, 0.065, 0.07], CREAM, head);
  // Big black nose.
  blob([0, 0.76, 0.2], [0.045, 0.035, 0.03], NOSE, head);
  // Eyes.
  for (const s of [1, -1]) {
    blob([0.065 * s, 0.8, 0.17], [0.018, 0.02, 0.012], NOSE, head);
  }

  return b.root;
}
