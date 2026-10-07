import * as THREE from "three";
import { catmull, countershade, createBuilder, gradient } from "../../../../src/index";

export const meta = {
  name: "Fennec fox",
  description:
    "A desert fennec fox: enormous ears, sandy coat, cream chin and belly, and a bushy tail with a black tip.",
};

export default function fennec() {
  const b = createBuilder({ name: "fennec fox" });

  const fur = countershade("#e2a766", "#fbf0dc", { level: 0.1, soft: 0.45 });
  const cream = "#f8ecd4";
  const ink = "#1b1410";
  const earPaint = gradient("#f5d9aa", "#b5602b", [0, 0.33, 0.2], [0, 0.47, 0.2]);

  // Spine: pelvis is the root, the chain runs forward to the chest.
  b.joint("pelvis", { at: [0, 0.2, -0.12] });
  const spine = b.chain("spine", catmull([[0, 0.2, -0.12], [0, 0.214, 0], [0, 0.226, 0.12]]), {
    parent: "pelvis",
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  b.sweep(spine, (t) => [0.05 + 0.012 * Math.sin(Math.PI * t), 0.056 + 0.006 * Math.sin(Math.PI * t)], {
    name: "torso",
    color: fur,
    sides: 10,
  });

  // Neck and head.
  const neck = b.chain("neck", catmull([[0, 0.222, 0.12], [0, 0.25, 0.16], [0, 0.28, 0.2]]), {
    parent: "chest",
    names: ["neck1", "neck2"],
    role: "neck",
  });
  b.sweep(neck, (t) => 0.04 - 0.01 * t, { name: "neck", color: fur });

  b.joint("head", { parent: "neck2", at: [0, 0.292, 0.21], role: "head" });
  b.part(new THREE.SphereGeometry(0.068, b.segments(14), b.segments(10)), fur, {
    name: "skull",
    bone: "head",
    at: [0, 0.292, 0.21],
    scale: [1, 0.95, 1.1],
  });

  // Upper muzzle: a tapered capsule that ends in a small black nose.
  b.capsule([0, 0.282, 0.24], [0, 0.27, 0.33], [0.036, 0.011], { name: "muzzle", bone: "head", color: fur } as never);
  b.part(new THREE.SphereGeometry(0.013, b.segments(8), b.segments(6)), ink, {
    name: "nose",
    bone: "head",
    at: [0, 0.283, 0.334],
    scale: [1.2, 0.8, 1],
  });

  // Lower jaw on its own hinge, so the mouth can open.
  b.joint("jaw", { parent: "head", at: [0, 0.272, 0.23], dir: [0, 0, 1], role: "jaw" });
  b.capsule([0, 0.272, 0.23], [0, 0.268, 0.3], [0.02, 0.008], {
    name: "mandible",
    bone: "jaw",
    color: cream,
  } as never);

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Cream cheek ruff.
    b.part(new THREE.SphereGeometry(0.03, b.segments(10), b.segments(8)), cream, {
      name: `cheek${side}`,
      bone: "head",
      at: [s * 0.04, 0.265, 0.26],
      scale: [0.9, 0.8, 1.2],
    });

    // Eyes: dark, almond, set into the skull.
    b.part(new THREE.SphereGeometry(0.013, b.segments(8), b.segments(6)), ink, {
      name: `eye${side}`,
      bone: "head",
      at: [s * 0.034, 0.3, 0.262],
      scale: [1, 1.2, 0.6],
    });

    // Enormous ears: flat tapered fins, pale at the base and tan at the tip.
    b.slab(
      [
        [s * 0.045, 0.33, 0.25],
        [s * 0.03, 0.47, 0.205],
        [s * 0.045, 0.33, 0.17],
      ],
      { name: `ear${side}`, color: earPaint, thickness: 0.012, bone: "head" },
    );
  }

  // Legs: each side a foreleg (shoulder, elbow, wrist) and a hindleg (hip, knee, hock, toe).
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const x = 0.05 * s;

    const fore = b.chain(`foreLeg${side}`, catmull([[x, 0.205, 0.1], [x, 0.1, 0.11], [x, 0.02, 0.1]]), {
      parent: "chest",
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "leg",
    });
    b.sweep(fore, (t) => 0.024 - 0.009 * t, { name: `foreLeg${side}`, color: fur });
    b.part(new THREE.SphereGeometry(0.022, b.segments(8), b.segments(6)), cream, {
      name: `pawFore${side}`,
      bone: `wrist${side}`,
      at: [x, 0.012, 0.115],
      scale: [1, 0.55, 1.4],
    });

    const hind = b.chain(
      `hindLeg${side}`,
      catmull([[x, 0.2, -0.12], [x, 0.1, -0.085], [x, 0.045, -0.14], [x, 0.012, -0.1]]),
      {
        parent: "pelvis",
        names: [`hip${side}`, `knee${side}`, `hock${side}`, `toe${side}`],
        role: "leg",
      },
    );
    b.sweep(hind, (t) => 0.026 - 0.01 * t, { name: `hindLeg${side}`, color: fur });
    b.part(new THREE.SphereGeometry(0.022, b.segments(8), b.segments(6)), cream, {
      name: `pawHind${side}`,
      bone: `toe${side}`,
      at: [x, 0.01, -0.105],
      scale: [1, 0.55, 1.4],
    });
  }

  // Bushy tail with a black tip.
  b.chain("tail", catmull([[0, 0.205, -0.13], [0, 0.2, -0.22], [0, 0.19, -0.31], [0, 0.185, -0.4]]), {
    parent: "pelvis",
    names: ["tail1", "tail2", "tail3", "tailTip"],
    role: "tail",
  });
  const tail = b.chain("tailBody", catmull([[0, 0.205, -0.13], [0, 0.2, -0.22], [0, 0.19, -0.31], [0, 0.185, -0.4]]), {
    parent: "pelvis",
    names: ["tailA1", "tailA2", "tailA3", "tailA4"],
  });
  b.sweep(tail, (t) => 0.024 + 0.018 * Math.sin(Math.PI * t), {
    name: "tail",
    bands: [
      [0.8, fur],
      [1, ink],
    ],
  });

  return b.root;
}
