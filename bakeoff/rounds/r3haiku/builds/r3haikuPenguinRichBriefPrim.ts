import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "emperor-penguin-chick",
  description:
    "An emperor penguin parent with a grey chick between its feet. Blue-black back, white belly, gold neck and ear patches, long beak with an orange stripe.",
};

const INK = "#1b2442";
const INK_DEEP = "#11172b";
const WHITE = "#f5f7fb";
const GOLD = "#e9b330";
const ORANGE = "#f2875e";
const BEAK = "#1c1f2e";
const FOOT = "#1a1a1e";
const EYE = "#0b0b0d";
const CHICK = "#9aa0a8";
const CHICK_LIGHT = "#c9ced6";

export default function build() {
  const b = createBuilder({ name: "emperor-penguin-chick" });

  // ---- Skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.35, 0] });
  const chest = b.joint("chest", { at: [0, 0.72, 0.02], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.98, 0.05], parent: chest });
  const head = b.joint("head", { at: [0, 1.14, 0.07], parent: neck });
  const shoulderL = b.joint("shoulderL", { at: [0.16, 0.82, 0], parent: chest });
  const shoulderR = b.joint("shoulderR", { at: [-0.16, 0.82, 0], parent: chest });
  const hipL = b.joint("hipL", { at: [0.11, 0.3, 0], parent: hips });
  const hipR = b.joint("hipR", { at: [-0.11, 0.3, 0], parent: hips });
  const chick = b.joint("chick", { at: [0, 0.07, 0.2], parent: hips });

  // ---- Body ---------------------------------------------------------------
  // Blue-black back, a tall ellipsoid built from a scaled sphere.
  b.part(new THREE.SphereGeometry(0.2, 18, 12), INK, {
    at: [0, 0.66, -0.02],
    bone: chest,
    scale: [1, 1.45, 0.8],
  });
  // Crisp white belly wrapping the front.
  b.part(new THREE.SphereGeometry(0.19, 18, 12), WHITE, {
    at: [0, 0.66, 0.1],
    bone: chest,
    scale: [0.78, 1.35, 0.5],
  });
  // Lower back dark rim so the belly reads as a crisp shape.
  b.part(new THREE.SphereGeometry(0.18, 14, 10), INK_DEEP, {
    at: [0, 0.4, -0.03],
    bone: hips,
    scale: [1, 0.7, 0.8],
  });

  // Warm gold neck patch.
  b.part(new THREE.SphereGeometry(0.085, 14, 10), GOLD, {
    at: [0, 0.96, 0.13],
    bone: neck,
    scale: [1.1, 0.7, 0.55],
  });

  // ---- Neck and head ------------------------------------------------------
  b.part(new THREE.SphereGeometry(0.1, 14, 10), INK, {
    at: [0, 1.0, 0.04],
    bone: neck,
    scale: [1, 1.1, 0.95],
  });

  // Head: blue-black cap.
  b.part(new THREE.SphereGeometry(0.115, 16, 12), INK, {
    at: [0, 1.14, 0.07],
    bone: head,
    scale: [1, 1, 1.02],
  });

  // Gold ear patches, one each side.
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.045, 12, 8), GOLD, {
      at: [sx * 0.1, 1.15, 0.06],
      bone: head,
      scale: [0.6, 1, 0.5],
    });
  }

  // Eyes.
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.018, 10, 8), EYE, {
      at: [sx * 0.056, 1.165, 0.172],
      bone: head,
    });
  }

  // Long slender beak, pointing forward and slightly down.
  b.part(new THREE.ConeGeometry(0.028, 0.22, 10), BEAK, {
    at: [0, 1.12, 0.27],
    bone: head,
    dir: [0, -0.15, 1],
  });
  // Orange-pink stripe along the lower edge of the beak.
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.15, 8), ORANGE, {
    at: [0, 1.1, 0.27],
    bone: head,
    dir: [0, -0.15, 1],
  });

  // ---- Flippers, held slightly out ----------------------------------------
  for (const sx of [1, -1]) {
    const shoulder = sx > 0 ? shoulderL : shoulderR;
    b.part(new THREE.CapsuleGeometry(0.05, 0.34, 6, 10), INK, {
      at: [sx * 0.3, 0.66, 0],
      bone: shoulder,
      dir: [sx, -0.45, 0.08],
    });
  }

  // ---- Legs and feet ------------------------------------------------------
  for (const sx of [1, -1]) {
    const leg = sx > 0 ? hipL : hipR;
    b.part(new THREE.CapsuleGeometry(0.03, 0.2, 6, 8), FOOT, {
      at: [sx * 0.11, 0.2, 0.02],
      bone: leg,
      dir: [0, 1, 0],
    });
    // Big flat black foot.
    b.part(new THREE.SphereGeometry(0.07, 12, 8), FOOT, {
      at: [sx * 0.11, 0.04, 0.09],
      bone: hips,
      scale: [0.9, 0.22, 1.7],
    });
    // Toe lobe at the front of each foot.
    b.part(new THREE.SphereGeometry(0.03, 8, 6), FOOT, {
      at: [sx * 0.11, 0.035, 0.17],
      bone: hips,
      scale: [1.2, 0.8, 1],
    });
  }

  // ---- Fluffy grey chick between the feet ---------------------------------
  // Main round body.
  b.part(new THREE.SphereGeometry(0.07, 14, 10), CHICK, {
    at: [0, 0.09, 0.2],
    bone: chick,
    scale: [1, 1.1, 1],
  });
  // Fluff tufts around the body.
  const tufts: Array<[number[], number, string]> = [
    [[0.04, 0.12, 0.25], 0.05, CHICK_LIGHT],
    [[-0.04, 0.05, 0.24], 0.045, CHICK],
    [[0.02, 0.05, 0.16], 0.04, CHICK_LIGHT],
    [[-0.03, 0.13, 0.17], 0.04, CHICK],
  ];
  for (const [at, r, color] of tufts) {
    b.part(new THREE.SphereGeometry(r, 10, 8), color, { at, bone: chick });
  }
  // Chick head.
  b.part(new THREE.SphereGeometry(0.06, 12, 10), CHICK_LIGHT, {
    at: [0, 0.17, 0.22],
    bone: chick,
  });
  // Chick eyes and tiny beak.
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.008, 6, 6), EYE, {
      at: [sx * 0.022, 0.18, 0.277],
      bone: chick,
    });
  }
  b.part(new THREE.ConeGeometry(0.01, 0.04, 6), BEAK, {
    at: [0, 0.16, 0.28],
    bone: chick,
    dir: [0, -0.2, 1],
  });

  return b.root;
}
