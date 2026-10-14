import * as THREE from "three";
import { createBuilder, catmull, grain, paint } from "../../../../src/index";

export const meta = {
  name: "koala",
  description: "A stylised sitting koala: grey fur, cream chest, big round ears and a large dark nose.",
};

const GREY = "#8e8b86";
const LIGHT = "#b8b3aa";
const CREAM = "#e8e2d4";
const NOSE = "#1c1a19";
const DARK = "#161514";
const EAR_IN = "#d8ccb6";
const WHITE = "#ffffff";

// A circle outline for extrusions (kept low-poly on purpose).
const disc = (r: number, n = 14): [number, number][] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [r * Math.cos(a), r * Math.sin(a)] as [number, number];
  });

// Fur: soft vertical grain, with a cream chest patch on the front of the body.
const fur = grain(GREY, LIGHT, { size: 0.025, axis: "y" });
const coat = paint((p, n) => (n.z > 0.45 && p.y > 0.22 && p.y < 0.58 ? CREAM : fur));

export default function build() {
  const b = createBuilder({ name: "koala" });

  // Skeleton: root at the seat, spine up to the neck, head on top.
  const hips = b.joint("hips", { at: [0, 0.2, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.2, -0.02],
      [0, 0.34, 0.02],
      [0, 0.48, 0.04],
      [0, 0.6, 0.06],
    ]),
    { parent: hips, names: ["spine1", "spine2", "neck"], role: "spine" },
  );

  // Body: one tube along the spine, fat at the seat, narrowing to the neck.
  b.sweep(spine, [0.2, 0.19, 0.15, 0.1], { color: coat });

  // Tiny tail nub at the back of the seat.
  b.part(new THREE.SphereGeometry(0.03, 8, 6), GREY, { bone: hips, at: [0, 0.12, -0.2] });

  // Head.
  const head = b.joint("head", { parent: spine.joints[2], at: [0, 0.72, 0.06], role: "head" });
  b.part(new THREE.SphereGeometry(0.12, 18, 14), GREY, {
    bone: head,
    at: head.at,
    scale: [1.05, 0.95, 0.95],
  });

  // Cream muzzle and a big, dark, slightly flattened nose.
  b.part(new THREE.SphereGeometry(0.065, 12, 9), CREAM, {
    bone: head,
    at: head.local({ forward: 0.075, up: -0.045 }),
    scale: [1.1, 0.8, 0.9],
  });
  b.part(new THREE.SphereGeometry(0.04, 12, 8), NOSE, {
    bone: head,
    at: head.local({ forward: 0.11, up: 0.02 }),
    scale: [1.25, 0.85, 0.8],
  });

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // Big round ears on the head's sides, with pale inner discs standing proud.
    b.extrude(disc(0.055), {
      at: head.local({ left: s * 0.11, up: 0.085, forward: -0.01 }),
      bone: head,
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.003,
      color: GREY,
    });
    b.extrude(disc(0.034), {
      at: head.local({ left: s * 0.118, up: 0.085, forward: -0.01 }),
      bone: head,
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.008,
      bevel: 0.002,
      color: EAR_IN,
    });

    // Small dark eyes with a white glint.
    b.part(new THREE.SphereGeometry(0.02, 8, 6), DARK, {
      bone: head,
      at: head.local({ left: s * 0.05, up: 0.035, forward: 0.1 }),
    });
    b.part(new THREE.SphereGeometry(0.006, 6, 4), WHITE, {
      bone: head,
      at: head.local({ left: s * 0.043, up: 0.042, forward: 0.117 }),
    });

    // Arm: shoulder, elbow, wrist, resting forward on the chest.
    const arm = b.chain(
      `arm${S}`,
      catmull([
        [s * 0.15, 0.5, 0.03],
        [s * 0.2, 0.36, 0.08],
        [s * 0.14, 0.24, 0.16],
      ]),
      { parent: spine.joints[2], names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm" },
    );
    b.sweep(arm, [0.055, 0.04], { color: GREY });
    const wrist = arm.joints[arm.joints.length - 1];

    // Paw pad and three dark claws.
    b.part(new THREE.SphereGeometry(0.05, 10, 8), GREY, {
      bone: wrist,
      at: [s * 0.13, 0.22, 0.19],
      scale: [1, 0.7, 1.3],
    });
    for (let k = 0; k < 3; k++) {
      b.spike([s * (0.1 + k * 0.02), 0.2, 0.2], [0, -0.3, 1], 0.035, 0.007, { bone: wrist, color: DARK });
    }

    // Hind leg: seat, knee forward, ankle on the floor in front.
    const leg = b.chain(
      `leg${S}`,
      catmull([
        [s * 0.13, 0.19, 0.0],
        [s * 0.2, 0.09, 0.22],
        [s * 0.14, 0.05, 0.36],
      ]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" },
    );
    b.sweep(leg, [0.085, 0.05], { color: GREY });
    const ankle = leg.joints[leg.joints.length - 1];

    // Flattened foot resting on the floor.
    b.part(new THREE.SphereGeometry(0.05, 10, 8), GREY, {
      bone: ankle,
      at: [s * 0.13, 0.035, 0.38],
      scale: [1, 0.7, 1.5],
    });
  }

  return b.root;
}
