```ts
import * as THREE from "three";
import { createBuilder, catmull, gradient, limb, patches } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "reticulated giraffe calf",
  description: "A young reticulated giraffe with chestnut patches outlined in cream, a stiff brown mane, fuzzy ossicones and long lashes.",
};

const CREAM = "#efe2bf";
const CHESTNUT = "#8c4a25";
const MANE = "#4b2a15";
const DARK = "#1c1410";
const HOOF = "#2a2019";
const TONGUE = "#3b1424";
const OSSICONE = "#7a5232";

export default function build() {
  const b = createBuilder({ name: "giraffe" });

  // Chestnut patches split by cream lines: the same paint runs across body, neck, legs and head.
  const BODY = patches(CREAM, CHESTNUT, { size: 0.2, gap: 0.03, seed: 4 });

  // ---- Skeleton -------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 1.2, -0.1], role: "spine" });

  const spine = b.chain("spine", catmull([
    [0, 1.2, -0.1],
    [0, 1.26, 0.15],
    [0, 1.34, 0.38],
    [0, 1.4, 0.5],
  ]), { parent: hips, role: "spine" });

  const neck = b.chain("neck", catmull([
    [0, 1.4, 0.5],
    [0, 1.7, 0.62],
    [0, 1.98, 0.74],
    [0, 2.2, 0.8],
  ]), { parent: spine.joints[2], role: "neck" });

  const head = b.joint("head", {
    parent: neck.joints[2],
    at: [0, 2.2, 0.8],
    dir: [0, 0.3, 1],
    role: "head",
  });

  const tail = b.chain("tail", catmull([
    [0, 1.2, -0.1],
    [0, 1.12, -0.4],
    [0, 0.95, -0.6],
    [0, 0.72, -0.66],
  ]), { parent: hips, role: "tail" });

  // ---- Body and neck ----------------------------------------------------
  b.sweep(spine, () => [0.16, 0.2], { color: BODY });

  const neckSw = b.sweep(neck, (t) => 0.13 - 0.05 * t, { color: BODY });

  b.sweep(tail, (t) => 0.035 - 0.018 * t, { color: BODY });
  b.part(new THREE.SphereGeometry(0.045, 6, 4), DARK, {
    bone: tail.joints[tail.joints.length - 1],
    at: [0, 0.7, -0.66],
  });

  // Short stiff mane along the dorsal line of the neck.
  b.along(neckSw.line(0, 0.004), 16, (at) => {
    b.spike(at, [0, 1, -0.4], 0.075, 0.011, { color: MANE });
  });

  // ---- Head -------------------------------------------------------------
  b.part(new THREE.BoxGeometry(0.15, 0.13, 0.2), BODY, {
    bone: head,
    at: [0, 2.26, 0.8],
    flat: true,
  });

  b.frustumBox([0, 2.22, 0.9], [0, 2.1, 1.12], [0.13, 0.11], [0.09, 0.08], {
    bone: head,
    color: CREAM,
  });

  b.part(new THREE.SphereGeometry(0.03, 6, 4), DARK, {
    bone: head,
    at: [0, 2.11, 1.13],
  });

  // Long dark tongue peeking out of the mouth.
  b.capsule([0, 2.12, 1.02], [0, 2.06, 1.17], [0.02, 0.011], {
    bone: head,
    color: TONGUE,
  });

  // Big ears: flat plates lying horizontally, sticking out sideways.
  const ear: OutlinePoint[] = [
    [-0.06, 0],
    [0, 0.03],
    [0.05, 0.1, "sharp"],
    [0.02, 0.13],
    [-0.06, 0.06],
  ];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const x = s * 0.13;

    // Ossicones: short brown posts with black fuzzy tufts.
    b.capsule([s * 0.045, 2.33, 0.78], [s * 0.05, 2.45, 0.76], [0.016, 0.012], {
      bone: head,
      color: OSSICONE,
    });
    const tuft = b.part(new THREE.SphereGeometry(0.03, 6, 4), DARK, {
      bone: head,
      at: [s * 0.05, 2.46, 0.76],
    });
    b.ring(tuft, { count: 7, radius: 0.025, tilt: 50 }, (f) => {
      b.spike(f, f, 0.035, 0.008, { color: DARK });
    });

    // Ear.
    b.extrude(ear, {
      at: [s * 0.06, 2.26, 0.74],
      x: [0, 0, 1],
      y: [s, 0, 0],
      thickness: [0.02, 0.012],
      bevel: 0.004,
      color: BODY,
      bone: head,
    });

    // Eye with long lashes.
    const eye = b.part(new THREE.SphereGeometry(0.034, 6, 4), DARK, {
      bone: head,
      at: [s * 0.08, 2.28, 0.84],
    });
    b.ring(eye, { count: 7, radius: 0.03, fromDeg: -75, toDeg: 75, tilt: 35 }, (lash) => {
      b.spike(lash, lash, 0.045, 0.006, { color: DARK });
    });

    // Legs: slender, cream at the hoof fading to the patterned coat above.
    const frontZ = 0.32;
    const frontPts = limb([x, 1.2, 0.3], [x, 0.04, frontZ], [0.6, 0.6], [[0, 0, 1]]);
    const fore = b.chain(`fore${side}`, frontPts, {
      parent: spine.joints[1],
      names: [`shoulder${side}`, `knee${side}`, `hoofF${side}`],
      role: "leg",
    });
    const foreTip = fore.tip ?? fore.joints[fore.joints.length - 1];
    b.sweep(fore, [0.065, 0.034], {
      color: gradient(CREAM, BODY, [x, 0.22, frontZ], [x, 0.62, frontZ]),
    });
    b.part(new THREE.CylinderGeometry(0.045, 0.05, 0.07, 8), HOOF, {
      bone: foreTip,
      at: [x, 0.035, frontZ],
    });

    const hindZ = -0.22;
    const hindPts = limb([x, 1.2, -0.2], [x, 0.04, hindZ], [0.6, 0.6], [[0, 0, -1]]);
    const hind = b.chain(`hind${side}`, hindPts, {
      parent: hips,
      names: [`hip${side}`, `hock${side}`, `hoofH${side}`],
      role: "leg",
    });
    const hindTip = hind.tip ?? hind.joints[hind.joints.length - 1];
    b.sweep(hind, [0.065, 0.034], {
      color: gradient(CREAM, BODY, [x, 0.22, hindZ], [x, 0.62, hindZ]),
    });
    b.part(new THREE.CylinderGeometry(0.045, 0.05, 0.07, 8), HOOF, {
      bone: hindTip,
      at: [x, 0.035, hindZ],
    });
  }

  return b.root;
}
```