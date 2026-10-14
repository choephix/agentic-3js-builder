import * as THREE from "three";
import { createBuilder, catmull } from "../../../../src/index";

export const meta = {
  name: "Desert scorpion",
  description: "A threatening desert scorpion: glossy amber armour with dark joint bands, raised arched tail with a bulbous stinger, forward pincers, eight legs and a cluster of black eyes.",
};

const AMBER = "#d9952b";
const DARK = "#4a2508";
const LEG = "#8c5a24";
const EYE = "#070707";

export default function scorpion() {
  const b = createBuilder({ name: "desert scorpion" });

  // Body root: the prosoma sits on this joint.
  b.joint("body", { at: [0, 0.045, 0], dir: [0, 0, 1], role: "spine" });

  // Prosoma (head shield): a smooth amber dome.
  b.part(new THREE.SphereGeometry(1, 16, 12), AMBER, {
    bone: "body",
    at: [0, 0.045, 0.03],
    scale: [0.04, 0.024, 0.045],
  });

  // Mesosoma: five stacked segments, each with a dark band at its front edge.
  const SEGMENTS = 5;
  for (let i = 0; i < SEGMENTS; i++) {
    const z = -0.03 - i * 0.021;
    const k = 1 - i * 0.1;
    b.part(new THREE.SphereGeometry(1, 14, 10), AMBER, {
      bone: "body",
      at: [0, 0.042 - i * 0.001, z],
      scale: [0.03 * k, 0.021 * k, 0.012],
    });
    b.part(new THREE.CylinderGeometry(1, 1, 1, 14, 1), DARK, {
      bone: "body",
      at: [0, 0.042, z + 0.01],
      rotation: [90, 0, 0],
      scale: [0.031 * k, 0.004, 0.022 * k],
    });
  }

  // Tail: six segments arching high over the back, banded dark at every joint.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.05, -0.11],
      [0, 0.1, -0.15],
      [0, 0.18, -0.16],
      [0, 0.23, -0.11],
      [0, 0.23, -0.04],
    ]),
    { parent: "body", count: 6, role: "tail" },
  );
  b.sweep(tail, {
    radius: (t: number) => 0.013 - 0.005 * t,
    color: (t: number) => {
      const f = (t * 6) % 1;
      return f < 0.14 || f > 0.86 ? DARK : AMBER;
    },
    name: "tailSegments",
  });

  // Bulbous dark stinger at the tail tip, with a short barb pointing forward.
  const tip = tail.at(1);
  b.part(new THREE.SphereGeometry(1, 14, 10), DARK, {
    bone: "tail6",
    at: tip,
    scale: 0.016,
  });
  b.spike(tip.moved([0, 0.01, 0]), tip, 0.024, 0.0055, { color: DARK, bone: "tail6" });

  // Pincers: each arm reaches forward, ends in a palm with a fixed and a moving finger.
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${sd}`,
      catmull([
        [s * 0.03, 0.05, 0.06],
        [s * 0.07, 0.05, 0.1],
        [s * 0.09, 0.045, 0.17],
        [s * 0.08, 0.04, 0.21],
      ]),
      { parent: "body", role: "arm", names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`] },
    );
    b.sweep(arm, { radius: [0.0085, 0.0055], color: AMBER });

    b.joint(`claw${sd}`, { parent: `wrist${sd}`, at: [s * 0.08, 0.04, 0.21], dir: [0, 0, 1] });
    b.part(new THREE.SphereGeometry(1, 14, 10), AMBER, {
      bone: `claw${sd}`,
      scale: [0.032, 0.024, 0.036],
    });
    b.capsule([s * 0.098, 0.04, 0.2], [s * 0.05, 0.04, 0.29], 0.0055, {
      color: AMBER,
      bone: `claw${sd}`,
    });

    b.joint(`finger${sd}`, {
      parent: `claw${sd}`,
      at: [s * 0.07, 0.04, 0.2],
      aim: [s * 0.035, 0.04, 0.285],
    });
    b.capsule([s * 0.07, 0.04, 0.2], [s * 0.035, 0.04, 0.285], 0.005, {
      color: DARK,
      bone: `finger${sd}`,
    });
  }

  // Eight thin legs, four per side, each with a knee that lifts the body and a tapered foot on the ground.
  const hips = [0.02, -0.01, -0.04, -0.07];
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    hips.forEach((z, k) => {
      const leg = b.chain(
        `leg${sd}${k + 1}`,
        catmull([
          [s * 0.03, 0.042, z],
          [s * 0.09, 0.075, z + 0.012],
          [s * 0.135, 0.03, z - 0.004],
          [s * 0.155, 0.004, z - 0.022],
        ]),
        {
          parent: "body",
          role: "leg",
          names: [`hip${sd}${k + 1}`, `knee${sd}${k + 1}`, `ankle${sd}${k + 1}`],
        },
      );
      b.sweep(leg, { radius: [0.0055, 0.0025], color: LEG });
    });
  }

  // Cluster of tiny black eyes on the head shield.
  const eyes: Array<[number, number, number]> = [
    [0.008, 0.061, 0.058],
    [0.018, 0.06, 0.056],
    [0.005, 0.064, 0.05],
  ];
  for (const s of [1, -1])
    for (const [x, y, z] of eyes) {
      b.part(new THREE.SphereGeometry(1, 8, 6), EYE, {
        bone: "body",
        at: [s * x, y, z],
        scale: 0.0035,
      });
    }

  return b.root;
}
