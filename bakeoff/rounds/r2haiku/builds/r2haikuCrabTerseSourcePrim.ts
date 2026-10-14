import * as THREE from "three";
import { createBuilder, mottle, countershade } from "../../../../src/index";

export const meta = {
  name: "Crab",
  description:
    "A stylised shore crab: a wide mottled carapace, four jointed walking legs a side, raised pincers and stalked eyes.",
};

const SHELL = "#c2432a";
const LIGHT = "#ef9361";
const DARK = "#7d2517";
const LEG = "#a83a24";
const EYE = "#f4efe6";
const PUPIL = "#141414";

export default function crab() {
  const b = createBuilder({ name: "crab" });

  const shell = mottle(SHELL, LIGHT, { size: 0.05, seed: 3 });
  const belly = countershade("#e0794c", "#ffd2a8", { level: -0.2, soft: 0.5 });

  // Body root, a little above the floor.
  b.joint("body", { at: [0, 0.06, 0] });

  // Carapace: a wide flattened dome.
  b.part(new THREE.SphereGeometry(0.1, b.segments(18), b.segments(12)), shell, {
    name: "carapace",
    bone: "body",
    at: [0, 0.06, 0],
    scale: [1.1, 0.42, 0.78],
  });

  // Tucked abdomen behind the carapace.
  b.part(new THREE.SphereGeometry(0.05, b.segments(12), b.segments(8)), belly, {
    name: "abdomen",
    bone: "body",
    at: [0, 0.035, -0.085],
    scale: [0.72, 0.42, 0.95],
  });

  // Mouth plate at the front.
  b.part(new THREE.SphereGeometry(0.035, b.segments(10), b.segments(8)), LIGHT, {
    name: "mouth",
    bone: "body",
    at: [0, 0.042, 0.08],
    scale: [1.5, 0.5, 0.7],
  });

  // Forward spines on the carapace edge.
  for (const s of [1, -1]) {
    b.spike([s * 0.06, 0.085, 0.06], [s * 0.5, 0.35, 1], 0.02, 0.008, { color: DARK, bone: "body", name: "spine" });
    b.spike([s * 0.095, 0.075, 0.0], [s * 1, 0.3, 0.1], 0.016, 0.007, { color: DARK, bone: "body", name: "spine" });
  }

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const X = (x: number) => x * s;

    // Stalked eyes.
    const eyeBase: [number, number, number] = [X(0.03), 0.06, 0.07];
    const eyeTop: [number, number, number] = [X(0.03), 0.095, 0.095];
    b.capsule(eyeBase, eyeTop, 0.006, { color: SHELL, bone: "body", name: `stalk${side}` });
    b.joint(`eye${side}`, { parent: "body", at: eyeTop, dir: [0, 1, 0] });
    b.part(new THREE.SphereGeometry(0.018, b.segments(10), b.segments(8)), EYE, {
      name: `eye${side}`,
      bone: `eye${side}`,
      at: eyeTop,
    });
    b.part(new THREE.SphereGeometry(0.008, b.segments(8), b.segments(6)), PUPIL, {
      name: `pupil${side}`,
      bone: `eye${side}`,
      at: [X(0.03), 0.095, 0.113],
    });

    // Four walking legs: hip, knee, ankle, foot.
    const zs = [0.04, 0.005, -0.03, -0.065];
    const reach = [0.05, 0.05, 0.04, 0.02];
    zs.forEach((z, i) => {
      const dz = reach[i];
      const leg = b.chain(
        `leg${side}${i}`,
        [
          [X(0.075), 0.05, z],
          [X(0.14), 0.09, z + 0.01],
          [X(0.2), 0.045, z + dz],
          [X(0.24), 0.005, z + dz * 1.4],
        ],
        {
          parent: "body",
          role: "leg",
          names: [`hip${side}${i}`, `knee${side}${i}`, `ankle${side}${i}`, `foot${side}${i}`],
        },
      );
      b.sweep(leg, [0.013, 0.008, 0.005], { color: LEG, name: `leg${side}${i}` });
    });

    // Raised arm with a pincer.
    const arm = b.chain(
      `arm${side}`,
      [
        [X(0.07), 0.055, 0.07],
        [X(0.13), 0.07, 0.13],
        [X(0.17), 0.065, 0.2],
        [X(0.19), 0.06, 0.25],
      ],
      {
        parent: "body",
        role: "arm",
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      },
    );
    b.sweep(arm, [0.02, 0.014, 0.011], { color: SHELL, name: `arm${side}` });

    // Pincer palm and two fingers on the hand joint.
    b.part(new THREE.SphereGeometry(0.032, b.segments(12), b.segments(8)), shell, {
      name: `palm${side}`,
      bone: `hand${side}`,
      at: [X(0.19), 0.06, 0.255],
      scale: [1.0, 0.8, 1.35],
    });
    b.capsule([X(0.19), 0.075, 0.27], [X(0.205), 0.07, 0.36], [0.012, 0.004], {
      color: SHELL,
      bone: `hand${side}`,
      name: `finger${side}`,
    });
    b.capsule([X(0.18), 0.05, 0.27], [X(0.19), 0.05, 0.345], [0.011, 0.004], {
      color: DARK,
      bone: `hand${side}`,
      name: `claw${side}`,
    });
  }

  return b.root;
}
