import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Elephant",
  description: "A stylized African elephant: blocky body, curled trunk, fan ears, ivory tusks and four pillar legs.",
};

const SKIN = "#8d939c";
const SKIN_DARK = "#6b717a";
const INNER = "#e0a2a6";
const IVORY = "#f3ead2";
const EYE = "#1d1d22";
const NAIL = "#ece4cc";
const TUFT = "#4a4a50";

export default function build() {
  const b = createBuilder({ name: "elephant" });

  // Skeleton
  const hips = b.joint("hips", { at: [0, 2.6, 0] });
  const head = b.joint("head", { at: [0, 3.0, 2.3], parent: hips });

  // Body
  b.part(new THREE.SphereGeometry(1, 20, 14), SKIN, {
    at: [0, 2.6, 0],
    scale: [1.05, 0.85, 1.9],
    bone: hips,
  });

  // Head, forehead dome and eyes
  b.part(new THREE.SphereGeometry(0.62, 18, 12), SKIN, {
    at: [0, 3.0, 2.3],
    scale: [0.9, 0.95, 0.92],
    bone: head,
  });
  b.part(new THREE.SphereGeometry(0.42, 14, 10), SKIN, {
    at: [0, 3.4, 2.25],
    scale: [1, 0.9, 0.9],
    bone: head,
  });
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.065, 8, 6), EYE, {
      at: [0.4 * s, 3.22, 2.8],
      scale: [1, 1, 0.6],
      bone: head,
    });
  }

  // Fan ears with pink inner layer
  const earOutline: number[][] = [
    [-0.5, 0.55], [0.1, 0.62], [0.5, 0.4], [0.58, -0.1],
    [0.4, -0.55], [-0.1, -0.62], [-0.5, -0.3],
  ];
  const earInner: number[][] = earOutline.map(([u, v]) => [u * 0.78, v * 0.78]);
  for (const s of [-1, 1]) {
    b.extrude(earOutline, {
      at: [0.8 * s, 3.05, 1.95],
      x: [0, 0, 1],
      y: [0, 1, 0],
    });
    b.extrude(earInner, {
      at: [0.84 * s, 3.05, 1.95],
      x: [0, 0, 1],
      y: [0, 1, 0],
    });
  }

  // Tusks: ivory cones angled forward and down from the mouth
  for (const s of [-1, 1]) {
    const base = [0.3 * s, 2.5, 2.75];
    const dir = [0.245 * s, -0.291, 0.827];
    const centre = [
      base[0] + dir[0] * 0.5,
      base[1] + dir[1] * 0.5,
      base[2] + dir[2] * 0.5,
    ];
    b.part(new THREE.ConeGeometry(0.08, 1.0, 10), IVORY, {
      at: centre,
      dir,
      bone: head,
    });
  }

  // Trunk: a curled chain with a swept tube and a tip
  const trunkPath = [
    [0, 2.7, 2.8],
    [0, 2.3, 3.2],
    [0, 1.8, 3.5],
    [0, 1.2, 3.42],
    [0, 0.7, 3.18],
    [0, 0.45, 2.95],
    [0, 0.55, 2.7],
  ];
  const trunk = b.chain("trunk", trunkPath, { role: "tentacle" });
  b.sweep(trunk, 0.2, { color: SKIN });
  b.part(new THREE.SphereGeometry(0.13, 12, 8), SKIN_DARK, {
    at: [0, 0.55, 2.7],
    bone: head,
  });

  // Legs: shoulder and knee joints, pillar limbs, round feet with nails
  const legs: [number, number, string][] = [
    [0.8, 1.2, "FL"],
    [-0.8, 1.2, "FR"],
    [0.8, -1.2, "BL"],
    [-0.8, -1.2, "BR"],
  ];
  for (const [x, z, name] of legs) {
    const shoulder = b.joint(`shoulder${name}`, { at: [x, 2.9, z], parent: hips });
    const knee = b.joint(`knee${name}`, { at: [x, 1.9, z], parent: shoulder });

    // Upper leg (inside the body, joins it)
    b.part(new THREE.CylinderGeometry(0.36, 0.3, 1.0, 12), SKIN, {
      at: [x, 2.4, z],
      bone: shoulder,
    });
    // Lower leg
    b.part(new THREE.CylinderGeometry(0.3, 0.25, 1.62, 12), SKIN, {
      at: [x, 1.09, z],
      bone: knee,
    });
    // Foot pad
    b.part(new THREE.CylinderGeometry(0.36, 0.34, 0.28, 12), SKIN_DARK, {
      at: [x, 0.14, z],
      bone: knee,
    });
    // Toenails on the front of the foot
    for (const dx of [-0.17, 0, 0.17]) {
      b.part(new THREE.SphereGeometry(0.075, 8, 6), NAIL, {
        at: [x + dx, 0.04, z + 0.33],
        scale: [1, 0.8, 0.5],
        bone: knee,
      });
    }
  }

  // Tail: a thin chain with a dark tuft
  const tailPath = [
    [0, 2.9, -1.9],
    [0, 2.6, -2.3],
    [0, 2.0, -2.5],
    [0, 1.4, -2.55],
    [0, 1.0, -2.6],
  ];
  const tail = b.chain("tail", tailPath, { role: "tail" });
  b.sweep(tail, 0.07, { color: SKIN_DARK });
  b.part(new THREE.SphereGeometry(0.1, 8, 6), TUFT, {
    at: [0, 0.9, -2.62],
    bone: hips,
  });

  return b.root;
}
