import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "penguin",
  description: "A stylised standing penguin: black back, white front, orange feet and ear patches, with a rigged head, jaw and flippers.",
};

const BLACK = "#16181c";
const WHITE = "#f4f5f0";
const ORANGE = "#f2971c";
const BEAK = "#f7b733";
const EYE_BLACK = "#0b0c0e";

export default function build() {
  const b = createBuilder({ name: "penguin" });

  // ---- Skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.25, 0] });
  const chest = b.joint("chest", { at: [0, 0.45, 0.02], parent: hips });
  const head = b.joint("head", { at: [0, 0.62, 0.02], parent: chest });
  const jaw = b.joint("jaw", { at: [0, 0.6, 0.12], parent: head });

  const shoulderL = b.joint("shoulderL", { at: [0.15, 0.5, 0], parent: chest });
  const shoulderR = b.joint("shoulderR", { at: [-0.15, 0.5, 0], parent: chest });

  const legL = b.joint("legL", { at: [0.07, 0.13, 0], parent: hips });
  const legR = b.joint("legR", { at: [-0.07, 0.13, 0], parent: hips });

  // ---- Body ---------------------------------------------------------------
  // Black back: a tall, slightly tapered egg.
  b.part(new THREE.SphereGeometry(1, 14, 10), BLACK, {
    at: [0, 0.4, 0],
    bone: hips,
    scale: [0.17, 0.3, 0.16],
  });

  // White front, pushed forward so it reads as a shirt-front.
  b.part(new THREE.SphereGeometry(1, 12, 10), WHITE, {
    at: [0, 0.41, 0.075],
    bone: chest,
    scale: [0.12, 0.26, 0.09],
  });

  // Chest bulge that rounds the top of the body into the neck.
  b.part(new THREE.SphereGeometry(1, 12, 10), BLACK, {
    at: [0, 0.5, 0.0],
    bone: chest,
    scale: [0.15, 0.1, 0.14],
  });

  // ---- Head ---------------------------------------------------------------
  b.part(new THREE.SphereGeometry(1, 14, 12), BLACK, {
    at: [0, 0.62, 0.02],
    bone: head,
    scale: [0.12, 0.115, 0.11],
  });

  // White face patch, the signature penguin mask.
  b.part(new THREE.SphereGeometry(1, 12, 10), WHITE, {
    at: [0, 0.625, 0.09],
    bone: head,
    scale: [0.085, 0.075, 0.05],
  });

  // Orange ear patches on the sides of the head.
  for (const [x, side] of [
    [0.115, "L"],
    [-0.115, "R"],
  ] as const) {
    b.part(new THREE.SphereGeometry(1, 8, 6), ORANGE, {
      at: [x, 0.635, 0.0],
      bone: head,
      scale: [0.03, 0.04, 0.05],
    });
  }

  // Eyes: white sclera with a black pupil set slightly forward.
  for (const x of [0.055, -0.055]) {
    b.part(new THREE.SphereGeometry(1, 10, 8), WHITE, {
      at: [x, 0.645, 0.1],
      bone: head,
      scale: [0.03, 0.03, 0.025],
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), EYE_BLACK, {
      at: [x, 0.645, 0.118],
      bone: head,
      scale: [0.015, 0.015, 0.012],
    });
  }

  // ---- Beak: separate upper and lower halves so the jaw can open ----------
  const beakUp = new THREE.ConeGeometry(0.03, 0.1, 8);
  beakUp.rotateX(Math.PI / 2); // tip points along +Z
  b.part(beakUp, BEAK, {
    at: [0, 0.625, 0.155],
    bone: head,
  });

  const beakLow = new THREE.ConeGeometry(0.024, 0.08, 8);
  beakLow.rotateX(Math.PI / 2);
  b.part(beakLow, BEAK, {
    at: [0, 0.6, 0.14],
    bone: jaw,
  });

  // ---- Flippers -----------------------------------------------------------
  // Flat, paddle-like, angled slightly out from the body.
  const flipperL = new THREE.SphereGeometry(1, 10, 8);
  flipperL.scale(0.035, 0.2, 0.11);
  flipperL.rotateZ(0.22);
  b.part(flipperL, BLACK, {
    at: [0.16, 0.4, 0],
    bone: shoulderL,
  });

  const flipperR = new THREE.SphereGeometry(1, 10, 8);
  flipperR.scale(0.035, 0.2, 0.11);
  flipperR.rotateZ(-0.22);
  b.part(flipperR, BLACK, {
    at: [-0.16, 0.4, 0],
    bone: shoulderR,
  });

  // ---- Legs and feet -------------------------------------------------------
  for (const [x, leg] of [
    [0.07, legL],
    [-0.07, legR],
  ] as const) {
    // Short leg, mostly hidden under the body.
    const shank = new THREE.CylinderGeometry(0.018, 0.02, 0.12, 8);
    b.part(shank, ORANGE, {
      at: [x, 0.07, 0],
      bone: leg,
    });

    // Flat webbed foot pointing forward.
    b.part(new THREE.SphereGeometry(1, 10, 8), ORANGE, {
      at: [x, 0.025, 0.045],
      bone: leg,
      scale: [0.05, 0.025, 0.09],
    });
  }

  return b.root;
}
