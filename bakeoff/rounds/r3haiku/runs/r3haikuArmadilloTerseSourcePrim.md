```ts
import * as THREE from "three";
import { createBuilder, scales, stripes } from "agentic-3js-builder";

export const meta = {
  name: "Armadillo",
  description:
    "A nine-banded armadillo: a domed, scaled shell over a pale head shield, a pointed snout with long upright ears, four short legs and a tapering banded tail.",
};

const SHELL = scales(["#9c7f62", "#8b6d52", "#a68a68"], "#4a3a2e", { size: 0.03, width: 0.14, seed: 3 });
const TAIL = stripes("#7a6758", "#4a3e36", { size: 0.03, width: 0.5, axis: "z", seed: 5 });
const SHIELD = "#8c7560";
const SKIN = "#6f5d4f";
const HEAD = "#9a806a";
const DARK = "#2a221e";

export default function armadillo() {
  const b = createBuilder({ name: "armadillo", detail: 1, paintSize: 1024 });

  // Skeleton: pelvis is the root; the spine runs forward through spine1, spine2, neck and into the head.
  b.joint("pelvis", { at: [0, 0.13, -0.11] });
  b.chain(
    "spine",
    [
      [0, 0.13, -0.11],
      [0, 0.135, 0.0],
      [0, 0.14, 0.09],
      [0, 0.15, 0.13],
    ],
    { parent: "pelvis", names: ["spine1", "spine2", "neck", "head"], role: "spine" },
  );
  b.joint("jaw", { parent: "head", at: [0, 0.14, 0.16], dir: [0, 0, 1], role: "jaw" });

  // Four legs: fore legs from the shoulders, hind legs from the pelvis, each a three-span chain with a paw tip.
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";

    const fore = b.chain(
      `foreLeg${side}`,
      [
        [0.05 * s, 0.13, 0.07],
        [0.055 * s, 0.07, 0.075],
        [0.055 * s, 0.025, 0.075],
        [0.055 * s, 0, 0.095],
      ],
      {
        parent: "spine2",
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `paw${side}`],
        role: "leg",
      },
    );
    b.sweep(fore, [0.02, 0.011], { color: SKIN });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), DARK, {
      bone: `paw${side}`,
      at: [0.055 * s, 0.005, 0.105],
      scale: [1.2, 0.55, 1.4],
    });

    const hind = b.chain(
      `hindLeg${side}`,
      [
        [0.05 * s, 0.13, -0.1],
        [0.06 * s, 0.07, -0.09],
        [0.06 * s, 0.02, -0.11],
        [0.06 * s, 0, -0.09],
      ],
      {
        parent: "pelvis",
        names: [`hip${side}`, `knee${side}`, `ankle${side}`, `toe${side}`],
        role: "leg",
      },
    );
    b.sweep(hind, [0.024, 0.012], { color: SKIN });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), DARK, {
      bone: `toe${side}`,
      at: [0.06 * s, 0.005, -0.07],
      scale: [1.3, 0.55, 1.2],
    });
  }

  // Tail: tapering, banded, from the pelvis down and back.
  const tail = b.chain(
    "tail",
    [
      [0, 0.12, -0.12],
      [0, 0.1, -0.19],
      [0, 0.085, -0.25],
      [0, 0.075, -0.31],
    ],
    { parent: "pelvis", names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );
  b.sweep(tail, [0.03, 0.008], { color: TAIL });

  // Banded domed shell: an ellipsoid painted with overlapping scales.
  b.part(new THREE.SphereGeometry(1, 20, 12), SHELL, {
    bone: "spine1",
    at: [0, 0.135, 0.0],
    scale: [0.11, 0.072, 0.17],
  });

  // Pale head shield over the shoulders and rear shield over the hips.
  b.part(new THREE.SphereGeometry(1, 14, 8), SHIELD, {
    bone: "neck",
    at: [0, 0.165, 0.1],
    scale: [0.095, 0.045, 0.07],
  });
  b.part(new THREE.SphereGeometry(1, 14, 8), SHIELD, {
    bone: "pelvis",
    at: [0, 0.13, -0.1],
    scale: [0.1, 0.05, 0.07],
  });

  // Head: rounded skull, tapering snout, upright ears, small eyes, dark nose and a separate lower jaw.
  b.part(new THREE.SphereGeometry(1, 14, 10), HEAD, {
    bone: "head",
    at: [0, 0.15, 0.14],
    scale: [0.042, 0.04, 0.052],
  });
  b.part(new THREE.ConeGeometry(0.024, 0.07, 6), HEAD, {
    bone: "head",
    at: [0, 0.145, 0.195],
    dir: [0, 0, 1],
  });
  b.part(new THREE.SphereGeometry(0.009, 6, 4), DARK, {
    bone: "head",
    at: [0, 0.146, 0.23],
  });
  for (const s of [1, -1] as const) {
    b.part(new THREE.ConeGeometry(0.013, 0.035, 5), SKIN, {
      bone: "head",
      at: [0.02 * s, 0.19, 0.12],
      dir: [0.25 * s, 1, -0.15],
    });
    b.part(new THREE.SphereGeometry(0.0065, 6, 4), DARK, {
      bone: "head",
      at: [0.028 * s, 0.163, 0.165],
    });
  }
  b.part(new THREE.SphereGeometry(1, 10, 6), SKIN, {
    bone: "jaw",
    at: [0, 0.138, 0.18],
    scale: [0.02, 0.01, 0.05],
  });

  return b.root;
}
```