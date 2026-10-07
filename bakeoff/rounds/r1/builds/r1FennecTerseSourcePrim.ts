import * as THREE from "three";
import { createBuilder, countershade, paint } from "../../../../src/index";

export const meta = {
  name: "Fennec Fox",
  description:
    "A small desert fox with oversized ears, a cream belly, a bushy dark-tipped tail and digitigrade hind legs, rigged with spine, neck, jaw, ears, tail and four legs.",
};

const SAND = "#e6b273";
const CREAM = "#f7e8d0";
const DARK = "#3a2a22";
const PINK = "#e9a9a0";

export default function build() {
  const b = createBuilder({ name: "fennec" });

  // Skeleton
  b.joint("hips", { at: [0, 0.17, -0.12], dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    [[0, 0.17, -0.12], [0, 0.18, 0], [0, 0.19, 0.1]],
    { parent: "hips", names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  b.chain(
    "neck",
    [[0, 0.19, 0.1], [0, 0.23, 0.16]],
    { parent: "chest", names: ["neck", "head"], role: "neck" },
  );
  b.joint("jaw", { parent: "head", at: [0, 0.215, 0.2], dir: [0, 0, 1], role: "jaw" });

  // Body
  const coat = countershade(SAND, CREAM, { level: -0.15, soft: 0.3 });
  b.sweep(spine, [0.046, 0.056, 0.052], { color: coat, extend: [0.03, 0.01], sides: 10 });
  b.part(new THREE.SphereGeometry(0.048, 8, 6), CREAM, { bone: "chest", at: [0, 0.16, 0.115], scale: [1, 1, 0.9] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.05, 8, 6), SAND, { bone: "hips", at: [s * 0.05, 0.15, -0.13], scale: [0.85, 1.05, 1.1] });
    b.part(new THREE.SphereGeometry(0.036, 8, 6), SAND, { bone: "chest", at: [s * 0.045, 0.165, 0.08] });
  }

  // Head
  b.part(new THREE.SphereGeometry(0.05, 10, 8), SAND, { bone: "head", at: [0, 0.235, 0.185], scale: [1, 0.88, 1] });
  b.part(new THREE.CylinderGeometry(0.012, 0.03, 0.07, 8), CREAM, {
    bone: "head", at: [0, 0.23, 0.235], dir: [0, -0.12, 1],
  });
  b.part(new THREE.SphereGeometry(0.01, 6, 5), DARK, { bone: "head", at: [0, 0.226, 0.272], scale: [1.2, 0.9, 1] });
  b.part(new THREE.BoxGeometry(0.036, 0.012, 0.055), CREAM, { bone: "jaw", at: [0, 0.205, 0.226] });
  b.part(new THREE.BoxGeometry(0.02, 0.004, 0.008), PINK, { bone: "jaw", at: [0, 0.2, 0.25] });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // eyes and tear marks
    b.part(new THREE.SphereGeometry(0.009, 6, 5), DARK, { bone: "head", at: [s * 0.028, 0.247, 0.222] });
    b.part(new THREE.SphereGeometry(0.0028, 4, 3), "#ffffff", { bone: "head", at: [s * 0.03, 0.2505, 0.229] });
    b.part(new THREE.BoxGeometry(0.005, 0.03, 0.008), DARK, {
      bone: "head", at: [s * 0.03, 0.228, 0.232], rotation: [-15, 0, s * 12],
    });
    // cheek fluff
    b.part(new THREE.ConeGeometry(0.02, 0.05, 5), CREAM, {
      bone: "head", at: [s * 0.055, 0.222, 0.18], dir: [s * 1, -0.25, -0.5],
    });

    // ears
    b.joint("ear" + side, { parent: "head", at: [s * 0.032, 0.265, 0.17], dir: [s * 0.3, 1, -0.15] });
    const d = new THREE.Vector3(s * 0.3, 1, -0.15).normalize();
    const base = new THREE.Vector3(s * 0.032, 0.265, 0.17);
    const c1 = base.clone().addScaledVector(d, 0.065);
    b.part(new THREE.ConeGeometry(0.04, 0.13, 6), SAND, {
      bone: "ear" + side, at: c1, dir: d, scale: [1, 1, 0.35],
    });
    const c2 = base.clone().addScaledVector(d, 0.058).add(new THREE.Vector3(0, 0, 0.007));
    b.part(new THREE.ConeGeometry(0.03, 0.11, 6), PINK, {
      bone: "ear" + side, at: c2, dir: d, scale: [1, 1, 0.3],
    });
    const c3 = base.clone().addScaledVector(d, 0.122);
    b.part(new THREE.ConeGeometry(0.012, 0.025, 5), DARK, {
      bone: "ear" + side, at: c3, dir: d, scale: [1, 1, 0.4],
    });

    // front leg
    const fx = s * 0.045;
    const front = b.chain(
      "armChain" + side,
      [[fx, 0.17, 0.08], [fx, 0.1, 0.086], [fx, 0.05, 0.08], [fx, 0.014, 0.095]],
      { parent: "chest", names: ["shoulder" + side, "elbow" + side, "wrist" + side, "paw" + side], role: "leg" },
    );
    b.sweep(front, [0.024, 0.016, 0.011, 0.011], { color: SAND, sides: 7 });
    b.part(new THREE.BoxGeometry(0.026, 0.02, 0.04), CREAM, {
      bone: "paw" + side, at: [fx, 0.01, 0.108],
    });

    // hind leg
    const hx = s * 0.05;
    const hind = b.chain(
      "legChain" + side,
      [[hx, 0.17, -0.13], [hx, 0.105, -0.1], [hx, 0.065, -0.155], [hx, 0.014, -0.14]],
      { parent: "hips", names: ["hip" + side, "knee" + side, "hock" + side, "foot" + side], role: "leg" },
    );
    b.sweep(hind, [0.036, 0.022, 0.012, 0.011], { color: SAND, sides: 7 });
    b.part(new THREE.BoxGeometry(0.026, 0.02, 0.045), CREAM, {
      bone: "foot" + side, at: [hx, 0.01, -0.12],
    });
  }

  // Tail
  const tail = b.chain(
    "tail",
    [[0, 0.17, -0.17], [0, 0.15, -0.26], [0, 0.125, -0.34], [0, 0.1, -0.42]],
    { parent: "hips", names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );
  const tailPaint = paint((p) => (p.z < -0.385 ? DARK : p.y < 0.13 && p.z < -0.2 ? coat : coat));
  b.sweep(tail, [0.028, 0.04, 0.04, 0.024], { color: tailPaint, sides: 8 });

  return b.root;
}
