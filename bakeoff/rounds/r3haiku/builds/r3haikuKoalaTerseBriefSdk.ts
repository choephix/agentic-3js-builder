import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "koala",
  description: "A sitting koala with a grey fluffy body, big round ears, a huge black nose and a cream chest.",
};

export default function build() {
  const b = createBuilder({ name: "koala" });

  const GREY = "#8d939a";
  const DARK = "#6b7179";
  const CREAM = "#e9e3d6";
  const INNER = "#cbbba8";
  const NOSE = "#1c1a19";
  const EYE = "#0d0d0d";
  const CLAW = "#3a3634";

  // Skeleton: spine and head, two arms, two legs.
  const spine = b.chain(
    "spine",
    [
      [0, 0.2, 0],
      [0, 0.36, 0.02],
      [0, 0.52, 0.04],
      [0, 0.66, 0.07],
    ],
    { role: "spine" },
  );
  const armL = b.chain(
    "armL",
    [
      [0.13, 0.5, 0.02],
      [0.22, 0.4, 0.09],
      [0.24, 0.33, 0.17],
    ],
    { role: "arm" },
  );
  const armR = b.chain(
    "armR",
    [
      [-0.13, 0.5, 0.02],
      [-0.22, 0.4, 0.09],
      [-0.24, 0.33, 0.17],
    ],
    { role: "arm" },
  );
  const legL = b.chain(
    "legL",
    [
      [0.13, 0.18, 0.0],
      [0.17, 0.1, 0.11],
      [0.15, 0.03, 0.2],
    ],
    { role: "leg" },
  );
  const legR = b.chain(
    "legR",
    [
      [-0.13, 0.18, 0.0],
      [-0.17, 0.1, 0.11],
      [-0.15, 0.03, 0.2],
    ],
    { role: "leg" },
  );

  // Tubes that bend with the rig.
  b.sweep(spine, 0.15, { color: GREY });
  b.sweep(armL, 0.045, { color: GREY });
  b.sweep(armR, 0.045, { color: GREY });
  b.sweep(legL, 0.06, { color: GREY });
  b.sweep(legR, 0.06, { color: GREY });

  const ball = () => new THREE.SphereGeometry(1, 20, 14);

  // Body mass: rounded belly, bottom and chest.
  b.part(ball(), GREY, { at: [0, 0.32, 0.02], scale: [0.19, 0.22, 0.17] });
  b.part(ball(), GREY, { at: [0, 0.12, -0.02], scale: [0.16, 0.12, 0.15] });
  b.part(ball(), CREAM, { at: [0, 0.33, 0.15], scale: [0.12, 0.13, 0.05] });

  // Head and fluffy cheeks.
  b.part(ball(), GREY, { at: [0, 0.7, 0.08], scale: [0.13, 0.115, 0.115] });
  b.part(ball(), CREAM, { at: [0, 0.64, 0.15], scale: [0.1, 0.07, 0.06] });

  // Big round ears with pale inner discs, set on each side of the head.
  const earDisc = new THREE.CylinderGeometry(0.075, 0.075, 0.02, 20).rotateX(Math.PI / 2);
  const innerDisc = new THREE.CylinderGeometry(0.05, 0.05, 0.012, 16).rotateX(Math.PI / 2);
  for (const s of [1, -1]) {
    b.part(earDisc, GREY, { at: [s * 0.11, 0.8, 0.05] });
    b.part(innerDisc, INNER, { at: [s * 0.11, 0.8, 0.063] });
  }

  // Huge black nose, small dark eyes.
  b.part(ball(), NOSE, { at: [0, 0.69, 0.2], scale: [0.055, 0.04, 0.04] });
  for (const s of [1, -1]) {
    b.part(ball(), EYE, { at: [s * 0.065, 0.73, 0.178], scale: [0.02, 0.024, 0.012] });
  }

  // Arms: paws with claws.
  const clawGeo = new THREE.ConeGeometry(0.008, 0.035, 5).rotateX(Math.PI / 2);
  for (const s of [1, -1]) {
    b.part(ball(), DARK, { at: [s * 0.24, 0.33, 0.19], scale: [0.05, 0.04, 0.05] });
    for (const dx of [-0.02, 0, 0.02]) {
      b.part(clawGeo, CLAW, { at: [s * 0.24 + s * dx, 0.31, 0.25] });
    }
  }

  // Legs: thighs, feet pads and claws resting on the floor.
  for (const s of [1, -1]) {
    b.part(ball(), GREY, { at: [s * 0.13, 0.15, 0.06], scale: [0.09, 0.1, 0.11] });
    b.part(ball(), DARK, { at: [s * 0.14, 0.03, 0.2], scale: [0.07, 0.03, 0.075] });
    for (const dx of [-0.02, 0, 0.02]) {
      b.part(clawGeo, CLAW, { at: [s * 0.14 + s * dx, 0.025, 0.27] });
    }
  }

  // Tiny tail tuft.
  b.part(ball(), CREAM, { at: [0, 0.12, -0.17], scale: [0.04, 0.04, 0.04] });

  return b.root;
}
