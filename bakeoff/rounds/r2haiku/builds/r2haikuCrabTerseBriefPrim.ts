import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "crab",
  description:
    "A stylised shore crab in rest pose: a wide domed shell, stalked eyes, two pincers and eight jointed walking legs.",
};

const SHELL = "#d4482a";
const SHELL_DARK = "#8e2b18";
const SHELL_LIGHT = "#f08a4b";
const LEG = "#b5361f";
const CLAW = "#e8642f";
const TIP = "#2a1410";
const WHITE = "#f4efe6";
const BLACK = "#120c0a";

export default function build() {
  const b = createBuilder({ name: "crab" });
  const body = b.joint("body", { at: [0, 0.12, 0] });

  // Carapace: a wide, low dome.
  b.part(new THREE.SphereGeometry(0.2, 14, 9), SHELL, {
    at: [0, 0.12, 0],
    bone: body,
    scale: [1, 0.35, 0.82],
  });

  // Tucked abdomen under the back edge.
  b.part(new THREE.SphereGeometry(0.12, 10, 6), SHELL_DARK, {
    at: [0, 0.085, -0.13],
    bone: body,
    scale: [0.9, 0.45, 0.9],
  });

  // Blunt front rostrum between the eye stalks.
  b.part(new THREE.BoxGeometry(0.12, 0.05, 0.06), SHELL, {
    at: [0, 0.1, 0.19],
    bone: body,
  });

  // Raised bumps on the shell for a bit of character.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 8, 6), SHELL_LIGHT, {
      at: [s * 0.09, 0.178, 0.04],
      bone: body,
    });
    b.part(new THREE.SphereGeometry(0.022, 8, 6), SHELL_LIGHT, {
      at: [s * 0.12, 0.17, -0.06],
      bone: body,
    });
  }

  // Stalked eyes and pincers, mirrored left (+X) and right (-X).
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Eye stalk.
    const stalk = b.chain(`eye${side}`, [
      [s * 0.07, 0.15, 0.18],
      [s * 0.08, 0.2, 0.22],
      [s * 0.085, 0.25, 0.25],
    ]);
    b.sweep(stalk, 0.012, { color: SHELL_DARK });

    // Eyeball with a black pupil set forward.
    b.part(new THREE.SphereGeometry(0.035, 12, 8), WHITE, {
      at: [s * 0.085, 0.26, 0.26],
    });
    b.part(new THREE.SphereGeometry(0.017, 8, 6), BLACK, {
      at: [s * 0.085, 0.26, 0.29],
    });

    // Arm: a bending chain from the body to the wrist.
    const arm = b.chain(`arm${side}`, [
      [s * 0.16, 0.12, 0.12],
      [s * 0.26, 0.1, 0.24],
      [s * 0.32, 0.08, 0.38],
      [s * 0.38, 0.08, 0.46],
    ]);
    b.sweep(arm, 0.03, { color: SHELL });

    // Claw palm.
    b.part(new THREE.SphereGeometry(0.07, 10, 8), CLAW, {
      at: [s * 0.4, 0.08, 0.52],
      scale: [1.1, 0.8, 1.3],
    });

    // Two fingers: a fixed upper claw and a lower claw, tips dark.
    const upperBase = [s * 0.44, 0.1, 0.54];
    const upperTip = [s * 0.42, 0.09, 0.68];
    const lowerBase = [s * 0.36, 0.06, 0.54];
    const lowerTip = [s * 0.38, 0.05, 0.66];

    b.part(new THREE.ConeGeometry(0.03, 0.15, 6), CLAW, {
      at: [
        (upperBase[0] + upperTip[0]) / 2,
        (upperBase[1] + upperTip[1]) / 2,
        (upperBase[2] + upperTip[2]) / 2,
      ],
      aim: upperTip,
    });
    b.part(new THREE.ConeGeometry(0.026, 0.13, 6), CLAW, {
      at: [
        (lowerBase[0] + lowerTip[0]) / 2,
        (lowerBase[1] + lowerTip[1]) / 2,
        (lowerBase[2] + lowerTip[2]) / 2,
      ],
      aim: lowerTip,
    });
    b.part(new THREE.SphereGeometry(0.018, 8, 6), TIP, { at: upperTip });
    b.part(new THREE.SphereGeometry(0.016, 8, 6), TIP, { at: lowerTip });
  }

  // Four jointed walking legs per side, splayed out and down to the floor.
  const zs = [0.1, 0.0, -0.1, -0.19];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    zs.forEach((z, i) => {
      const leg = b.chain(`leg${side}${i}`, [
        [s * 0.17, 0.11, z],
        [s * 0.34, 0.16, z + 0.02],
        [s * 0.5, 0.03, z - 0.05],
      ]);
      b.sweep(leg, 0.022, { color: LEG });
      b.part(new THREE.SphereGeometry(0.026, 8, 6), TIP, {
        at: [s * 0.5, 0.03, z - 0.05],
      });
    });
  }

  return b.root;
}
