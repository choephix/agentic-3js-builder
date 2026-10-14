import * as THREE from "three";
import { createBuilder, catmull, limb } from "../../../../src/index";

export const meta = {
  name: "desert-scorpion",
  description: "Threatening desert scorpion: glossy amber armour, banded joints, raised segmented tail with a dark bulbous stinger, big pincers and eight legs.",
};

const AMBER = "#c9822e";
const DARK = "#4d2a12";
const BLACK = "#140d09";

export default function build() {
  const b = createBuilder({ name: "desert-scorpion" });

  // Skeleton: root body, head shield, tail arch, eight legs, two pincer arms.
  const core = b.joint("core", { at: [0, 0.07, 0], dir: [0, 0, 1] });
  const head = b.joint("head", { parent: core, at: [0, 0.075, 0.06], dir: [0, 0, 1] });

  // Opisthosoma: five banded segments tapering toward the rear.
  const segs = [
    { z: -0.01, r: 0.047 },
    { z: -0.05, r: 0.045 },
    { z: -0.09, r: 0.04 },
    { z: -0.125, r: 0.035 },
    { z: -0.155, r: 0.03 },
  ];
  for (const g of segs) {
    b.part(new THREE.SphereGeometry(g.r, 14, 10), AMBER, {
      bone: core,
      at: [0, 0.07, g.z],
      scale: [1, 0.8, 1.1],
    });
  }
  // Dark bands at every segment joint.
  const bands: [number, number][] = [
    [-0.03, 0.044],
    [-0.07, 0.042],
    [-0.107, 0.037],
    [-0.14, 0.032],
  ];
  for (const [z, r] of bands) {
    b.part(new THREE.TorusGeometry(r, 0.0045, 6, 14), DARK, {
      bone: core,
      at: [0, 0.07, z],
      scale: [1, 0.8, 1],
    });
  }

  // Head shield (prosoma): a flattened dome.
  b.part(new THREE.SphereGeometry(0.05, 16, 10), AMBER, {
    bone: head,
    at: [0, 0.07, 0.07],
    scale: [1, 0.55, 1.25],
  });

  // Tail: a high arch over the back, curling forward over the head.
  const tailPath = catmull([
    [0, 0.08, -0.15],
    [0, 0.17, -0.25],
    [0, 0.31, -0.22],
    [0, 0.34, -0.1],
    [0, 0.28, 0.02],
  ]);
  const tail = b.chain("tail", tailPath, { parent: core, count: 7, role: "tail" });
  b.sweep(tail, (t: number) => 0.03 - 0.014 * t, {
    color: (t: number) => (Math.round(t * 7) % 2 === 0 ? AMBER : DARK),
  });
  const tip = tail.at(1);
  b.part(new THREE.SphereGeometry(0.034, 14, 10), BLACK, {
    frame: tip,
    scale: [1, 1, 1.15],
  });
  b.spike(tip, tip, 0.045, 0.01, { color: BLACK });

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // Eight legs: four per side, knees bent outward and up.
    const hipZ = [0.04, 0.0, -0.045, -0.09];
    const footZ = [0.08, 0.0, -0.075, -0.15];
    for (let i = 0; i < 4; i++) {
      const root: [number, number, number] = [s * 0.035, 0.07, hipZ[i]];
      const target: [number, number, number] = [s * 0.13, 0.006, footZ[i]];
      const pts = limb(root, target, [0.075, 0.09], [[s * 0.8, 1, 0]]);
      const leg = b.chain(`leg${S}${i}`, pts, {
        parent: core,
        names: [`hip${S}${i}`, `knee${S}${i}`, `foot${S}${i}`],
        role: "leg",
        contact: target,
      });
      b.sweep(leg, [0.007, 0.004], { color: DARK });
    }

    // Pincer arm, rooted at the head, ending in a hand joint.
    const armPath = catmull([
      [s * 0.03, 0.075, 0.08],
      [s * 0.065, 0.085, 0.14],
      [s * 0.085, 0.075, 0.21],
    ]);
    const arm = b.chain(`arm${S}`, armPath, {
      parent: head,
      names: [`arm${S}`, `forearm${S}`, `hand${S}`],
      role: "arm",
    });
    b.sweep(arm, [0.014, 0.011], { color: AMBER });
    const hand = arm.joints[arm.joints.length - 1];

    // Palm.
    b.part(new THREE.SphereGeometry(0.03, 12, 8), AMBER, {
      bone: hand,
      at: [s * 0.085, 0.075, 0.2],
      scale: [1.1, 0.8, 1.5],
    });

    // Two pincer fingers that meet at the tips.
    b.sweep(
      catmull([
        [s * 0.085, 0.075, 0.21],
        [s * 0.1, 0.075, 0.28],
        [s * 0.1, 0.075, 0.36],
      ]),
      [0.014, 0.006],
      { bone: hand, color: AMBER },
    );
    b.sweep(
      catmull([
        [s * 0.085, 0.075, 0.21],
        [s * 0.075, 0.075, 0.28],
        [s * 0.06, 0.075, 0.34],
        [s * 0.06, 0.075, 0.38],
      ]),
      [0.012, 0.005],
      { bone: hand, color: AMBER },
    );
    b.part(new THREE.SphereGeometry(0.006, 6, 4), BLACK, {
      bone: hand,
      at: [s * 0.1, 0.075, 0.36],
    });
    b.part(new THREE.SphereGeometry(0.006, 6, 4), BLACK, {
      bone: hand,
      at: [s * 0.06, 0.075, 0.38],
    });

    // Eye cluster on the shield's top-front edge.
    const eyes: [number, number, number][] = [
      [0.012, 0.1, 0.1],
      [0.026, 0.095, 0.085],
      [0.005, 0.104, 0.118],
    ];
    for (const [x, y, z] of eyes) {
      b.part(new THREE.SphereGeometry(0.0045, 6, 4), BLACK, {
        bone: head,
        at: [s * x, y, z],
      });
    }
  }

  return b.root;
}
