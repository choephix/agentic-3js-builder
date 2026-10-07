import * as THREE from "three";
import { createBuilder, mix, mottle, paint, smoothstep } from "../../../../src/index";

export const meta = {
  name: "Koala",
  description: "A koala sitting upright with grey fur, a cream chest and face, big fluffy ears and a large black nose.",
};

const FUR_DARK = "#8f8d86";
const FUR_LIGHT = "#c6c2b6";
const CREAM = "#ece6d8";
const NOSE = "#2a2422";
const EAR_INNER = "#d8d0bf";
const EYE = "#15110f";

// Grey fur in soft mottled patches, with the front of the body (chest, face, arms and legs) shading to cream.
const fur = mottle(FUR_DARK, FUR_LIGHT, { size: 0.07, contrast: 0.9 });
const coat = paint((p, n) => mix(fur.at(p, n), CREAM, smoothstep(0.45, 0.8, n.z)));

export default function koala() {
  const b = createBuilder({ name: "koala", paintSize: 1024 });

  // Root and spine. The spine's last joint is the head.
  b.joint("hips", { at: [0, 0.12, 0], dir: [0, 1, 0] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.17, 0],
      [0, 0.33, 0.02],
      [0, 0.48, 0.04],
      [0, 0.57, 0.07],
    ],
    { names: ["spine1", "spine2", "spine3", "head"], role: "spine" },
  );

  // A round, slightly pear-shaped body that is widest low down.
  b.sweep(spine, {
    radius: (t: number) => [
      0.16 + 0.04 * Math.sin(Math.PI * t) - 0.03 * t,
      0.15 + 0.04 * Math.sin(Math.PI * t) - 0.03 * t,
    ],
    color: coat,
    sides: 12,
    name: "body",
  });

  // Head: a big round skull with a bold black nose and small dark eyes.
  b.part(new THREE.SphereGeometry(0.12, b.segments(20), b.segments(14)), coat, {
    bone: "head",
    at: [0, 0.7, 0.09],
    scale: [1, 0.95, 0.95],
    name: "head",
  });
  b.part(new THREE.SphereGeometry(0.04, b.segments(16), b.segments(12)), NOSE, {
    bone: "head",
    at: [0, 0.695, 0.2],
    scale: [1.35, 0.85, 0.9],
    name: "nose",
  });

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.02, b.segments(10), b.segments(8)), EYE, {
      bone: "head",
      at: [s * 0.058, 0.725, 0.185],
      name: "eye",
    });
    // Big round ears, flat against the sides of the head, with a paler inner disc.
    b.part(new THREE.SphereGeometry(0.055, b.segments(14), b.segments(10)), coat, {
      bone: "head",
      at: [s * 0.105, 0.8, 0.045],
      scale: [1, 1, 0.35],
      name: "ear",
    });
    b.part(new THREE.SphereGeometry(0.035, b.segments(12), b.segments(8)), EAR_INNER, {
      bone: "head",
      at: [s * 0.11, 0.8, 0.07],
      scale: [1, 1, 0.3],
      name: "earInner",
    });
  }

  // A tiny tail tucked behind.
  b.part(new THREE.SphereGeometry(0.035, b.segments(10), b.segments(8)), coat, {
    bone: "hips",
    at: [0, 0.14, -0.16],
    name: "tail",
  });

  // Arms, hands and legs, mirrored left (+X) and right (-X).
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const x = (v: number) => s * v;

    // Arms hug the chest: shoulder, elbow, then a wrist tip joint.
    const arm = b.chain(
      `arm${side}`,
      [
        [x(0.14), 0.42, 0.04],
        [x(0.18), 0.33, 0.1],
        [x(0.13), 0.26, 0.17],
      ],
      { parent: "spine2", role: "arm", names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`] },
    );
    b.sweep(arm, { radius: (t: number) => 0.05 - 0.01 * t, color: coat, sides: 8, name: `arm${side}` });

    b.part(new THREE.SphereGeometry(0.045, b.segments(14), b.segments(10)), coat, {
      bone: `wrist${side}`,
      at: [x(0.13), 0.255, 0.19],
      scale: [1, 0.8, 1.3],
      name: `hand${side}`,
    });
    for (const dx of [-0.02, 0, 0.02]) {
      b.spike([x(0.13) + dx * s, 0.25, 0.235], [0, 0, 1], 0.03, 0.008, {
        color: NOSE,
        bone: `wrist${side}`,
        name: `claw${side}`,
      });
    }

    // Legs sit forward with the ankle on the floor, and feet flat on the ground.
    const leg = b.chain(
      `leg${side}`,
      [
        [x(0.1), 0.11, 0.02],
        [x(0.15), 0.08, 0.15],
        [x(0.1), 0.05, 0.25],
      ],
      { parent: "hips", role: "leg", names: [`hip${side}`, `knee${side}`, `ankle${side}`] },
    );
    b.sweep(leg, { radius: (t: number) => 0.07 - 0.02 * t, color: coat, sides: 10, name: `leg${side}` });

    b.part(new THREE.SphereGeometry(0.05, b.segments(14), b.segments(10)), coat, {
      bone: `ankle${side}`,
      at: [x(0.1), 0.04, 0.28],
      scale: [1, 0.65, 1.5],
      name: `foot${side}`,
    });
    for (const dx of [-0.025, 0, 0.025]) {
      b.spike([x(0.1) + dx * s, 0.03, 0.33], [0, 0, 1], 0.03, 0.008, {
        color: NOSE,
        bone: `ankle${side}`,
        name: `toeClaw${side}`,
      });
    }
  }

  return b.root;
}
