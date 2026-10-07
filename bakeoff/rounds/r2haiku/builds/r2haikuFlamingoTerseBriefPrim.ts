import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "flamingo",
  description: "A standing flamingo with an S-curved neck, folded wings and a bent beak.",
};

const PINK = "#f4a6c0";
const DEEP = "#e8577f";
const WING = "#f08aa8";
const LEG = "#e88aa0";
const BLACK = "#1a1a1a";
const WHITE = "#fdf6f0";
const BEAK = "#f6c4d4";

export default function build() {
  const b = createBuilder({ name: "flamingo" });

  // Skeleton: body, legs, wings, tail, neck and head
  const hips = b.joint("hips", { at: [0, 0.8, 0] });

  const hipL = b.joint("hipL", { at: [0.1, 0.8, 0], parent: hips });
  const kneeL = b.joint("kneeL", { at: [0.1, 0.42, -0.05], parent: hipL });
  const ankleL = b.joint("ankleL", { at: [0.1, 0.04, 0.03], parent: kneeL });

  const hipR = b.joint("hipR", { at: [-0.1, 0.8, 0], parent: hips });
  const kneeR = b.joint("kneeR", { at: [-0.1, 0.42, -0.05], parent: hipR });
  const ankleR = b.joint("ankleR", { at: [-0.1, 0.04, 0.03], parent: kneeR });

  const wingL = b.joint("wingL", { at: [0.16, 1.0, 0], parent: hips });
  const wingR = b.joint("wingR", { at: [-0.16, 1.0, 0], parent: hips });
  const tail = b.joint("tail", { at: [0, 0.98, -0.22], parent: hips });
  const head = b.joint("head", { at: [0, 1.7, 0.08], parent: hips });
  const jaw = b.joint("jaw", { at: [0, 1.67, 0.16], parent: head });

  // Body: a long, chunky teardrop
  b.part(new THREE.SphereGeometry(0.2, 16, 12), PINK, {
    at: [0, 0.98, 0],
    bone: hips,
    scale: [0.9, 0.8, 1.35],
  });

  // Legs: long thin stilts with a bent knee
  const legs = [
    { hip: hipL, knee: kneeL, ankle: ankleL, x: 0.1 },
    { hip: hipR, knee: kneeR, ankle: ankleR, x: -0.1 },
  ];
  for (const l of legs) {
    b.part(new THREE.CylinderGeometry(0.022, 0.018, 0.4, 6), LEG, {
      at: [l.x, 0.61, -0.02],
      bone: l.hip,
      dir: [0, -1, -0.1],
    });
    b.part(new THREE.CylinderGeometry(0.016, 0.014, 0.4, 6), LEG, {
      at: [l.x, 0.23, 0.0],
      bone: l.knee,
      dir: [0, -1, 0.12],
    });
    // Webbed foot: a flat blade with three toe stubs
    b.part(new THREE.BoxGeometry(0.075, 0.014, 0.11), DEEP, {
      at: [l.x, 0.012, 0.07],
      bone: l.ankle,
    });
  }

  // Folded wings: pink coverts with black primary tips
  for (const [joint, x] of [[wingL, 0.16], [wingR, -0.16]] as const) {
    b.part(new THREE.SphereGeometry(0.1, 12, 8), WING, {
      at: [x, 0.98, -0.02],
      bone: joint,
      scale: [0.45, 0.4, 1.5],
    });
    b.part(new THREE.BoxGeometry(0.05, 0.03, 0.14), BLACK, {
      at: [x * 1.05, 0.9, -0.2],
      bone: joint,
    });
  }

  // Tail: a short fan of feathers
  b.part(new THREE.BoxGeometry(0.2, 0.05, 0.14), PINK, {
    at: [0, 1.0, -0.3],
    bone: tail,
    dir: [0, 0.3, -1],
  });

  // Neck: an S-curve swept as one smooth tube
  const neckPath = [
    [0, 1.0, 0.18],
    [0, 1.3, 0.3],
    [0, 1.52, 0.3],
    [0, 1.66, 0.18],
    [0, 1.7, 0.1],
  ] as [number, number, number][];
  const neck = b.chain("neck", neckPath, { role: "neck" });
  b.sweep(neck, 0.05, { color: PINK });

  // Head: a rounded knob with a dark eye patch
  b.part(new THREE.SphereGeometry(0.09, 14, 10), PINK, {
    at: [0, 1.72, 0.08],
    bone: head,
    scale: [1, 0.95, 1.1],
  });

  // Eyes: white ring with a black pupil on each side
  for (const x of [0.078, -0.078]) {
    b.part(new THREE.SphereGeometry(0.02, 8, 6), WHITE, {
      at: [x, 1.73, 0.12],
      bone: head,
    });
    b.part(new THREE.SphereGeometry(0.011, 6, 5), BLACK, {
      at: [x * 1.1, 1.73, 0.135],
      bone: head,
    });
  }

  // Beak: upper bill bent downward with a black tip, lower bill on the jaw
  b.part(new THREE.BoxGeometry(0.035, 0.14, 0.03), BEAK, {
    at: [0, 1.66, 0.22],
    bone: head,
    dir: [0, -0.5, 0.85],
  });
  b.part(new THREE.BoxGeometry(0.03, 0.035, 0.03), BLACK, {
    at: [0, 1.56, 0.26],
    bone: head,
    dir: [0, -0.5, 0.85],
  });
  b.part(new THREE.BoxGeometry(0.03, 0.09, 0.03), BEAK, {
    at: [0, 1.63, 0.2],
    bone: jaw,
    dir: [0, -0.5, 0.85],
  });

  return b.root;
}
