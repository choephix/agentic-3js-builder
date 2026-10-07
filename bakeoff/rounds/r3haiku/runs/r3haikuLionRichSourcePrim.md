```ts
import * as THREE from "three";
import { countershade, createBuilder, mix, paint, rng, smoothstep } from "agentic-3js-builder";

export const meta = {
  name: "Proud old lion",
  description: "A resting adult lion with head held high, golden-to-chocolate mane, tawny coat and a dark tail tuft.",
};

export default function lion() {
  const b = createBuilder({ name: "lion", paintSize: 1024 });

  // Colours
  const tawny = countershade("#b97a3e", "#f1ddb5", { level: -0.3, soft: 0.3 });
  const cream = "#f3e3c0";
  const dark = "#2b1a0c";
  const H = new THREE.Vector3(0, 1.2, 0.9); // head centre

  // Mane: blond at the face, fading to dark chocolate toward its outer edge (and the head itself).
  const mane = paint((p) => mix("#e8bd62", "#3b2213", smoothstep(0.3, 0.55, p.distanceTo(H))));

  // Skeleton: spine, neck, head, jaw.
  b.joint("root", { at: [0, 0.6, -0.3] });
  const spine = b.chain("spine", [[0, 0.6, -0.8], [0, 0.62, -0.1], [0, 0.7, 0.4]], {
    names: ["spine1", "spine2"],
    role: "spine",
  });
  const neck = b.chain("neck", [[0, 0.7, 0.4], [0, 0.92, 0.58], [0, 1.08, 0.78]], {
    parent: "spine2",
    names: ["neck1", "neck2"],
    role: "neck",
  });
  b.joint("head", { parent: "neck2", at: H, aim: [0, 1.25, 1.5], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 1.1, 1.0], dir: [0, -1, 0], role: "jaw" });

  // Body and neck as smooth blended tubes.
  b.sweep(spine, [0.26, 0.34, 0.33], { color: tawny, name: "torso" });
  b.sweep(neck, [0.2, 0.17, 0.15], { color: tawny, name: "neck" });

  // Legs: forelegs stretched forward, hind legs folded under the haunch.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const x = (v: number) => s * v;

    const fore = b.chain(`arm${side}`, [[x(0.2), 0.5, 0.35], [x(0.22), 0.2, 0.48], [x(0.22), 0.09, 0.78], [x(0.22), 0.06, 0.9]], {
      parent: "spine2",
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `paw${side}`],
      role: "leg",
    });
    b.sweep(fore, [0.12, 0.09, 0.07, 0.075], { color: tawny, name: `foreleg${side}` });
    b.part(new THREE.SphereGeometry(0.1, b.segments(10), b.segments(7)), "#9a6230", {
      at: [x(0.22), 0.06, 0.9],
      bone: `paw${side}`,
      scale: [1.15, 0.55, 1.3],
      name: `paw${side}`,
    });

    const hind = b.chain(`leg${side}`, [[x(0.26), 0.62, -0.7], [x(0.3), 0.22, -0.42], [x(0.28), 0.09, -0.78], [x(0.28), 0.06, -0.55]], {
      parent: "spine1",
      names: [`thigh${side}`, `knee${side}`, `hock${side}`, `pawH${side}`],
      role: "leg",
    });
    b.sweep(hind, [0.2, 0.12, 0.08, 0.085], { color: tawny, name: `hindleg${side}` });
    b.part(new THREE.SphereGeometry(0.24, b.segments(12), b.segments(9)), tawny, {
      at: [x(0.22), 0.6, -0.7],
      bone: "spine1",
      scale: [0.9, 1, 1.1],
      name: `haunch${side}`,
    });
    b.part(new THREE.SphereGeometry(0.1, b.segments(10), b.segments(7)), "#9a6230", {
      at: [x(0.28), 0.06, -0.55],
      bone: `pawH${side}`,
      scale: [1.15, 0.55, 1.3],
      name: `pawH${side}`,
    });
  }

  // Tail: sweeps back along the ground, rising to a dark tuft.
  const tail = b.chain("tail", [[0, 0.5, -0.82], [0, 0.3, -1.2], [0, 0.24, -1.6], [0, 0.46, -1.88]], {
    parent: "spine1",
    names: ["tail1", "tail2", "tail3"],
    role: "tail",
  });
  b.sweep(tail, [0.07, 0.05, 0.04, 0.035], { color: tawny, name: "tail" });
  b.part(new THREE.IcosahedronGeometry(0.09, 1), dark, {
    at: [0, 0.46, -1.9],
    bone: "tail3",
    scale: [1, 1.4, 1],
    name: "tailTuft",
  });

  // Head: blond face wrapped in the mane.
  b.part(new THREE.SphereGeometry(0.2, b.segments(12), b.segments(9)), mane, { at: H, bone: "head", name: "head" });

  // Shaggy mane: clumps of icosahedra around the back and sides of the head, skipping the front.
  const random = rng(7);
  for (let i = 0; i < 80; i++) {
    const th = random() * Math.PI * 2;
    const ph = -0.35 + random() * 1.4;
    const d = new THREE.Vector3(Math.sin(th) * Math.cos(ph), Math.sin(ph), Math.cos(th) * Math.cos(ph));
    if (d.z > 0.5) continue;
    const radius = 0.22 + random() * 0.1;
    const size = 0.085 + random() * 0.06;
    b.part(new THREE.IcosahedronGeometry(size, 1), mane, {
      at: H.clone().addScaledVector(d, radius),
      bone: "head",
      group: "mane",
    });
  }

  // Face: cream muzzle, lower jaw, broad black nose.
  b.part(new THREE.SphereGeometry(0.1, b.segments(10), b.segments(8)), cream, {
    at: [0, 1.13, 1.06],
    bone: "head",
    scale: [1.2, 0.8, 1.1],
    name: "muzzle",
  });
  b.part(new THREE.SphereGeometry(0.075, b.segments(10), b.segments(7)), cream, {
    at: [0, 1.1, 1.07],
    bone: "jaw",
    scale: [1.1, 0.5, 1.4],
    name: "lowerJaw",
  });
  b.part(new THREE.SphereGeometry(0.045, b.segments(8), b.segments(6)), "#1c1412", {
    at: [0, 1.16, 1.15],
    bone: "head",
    scale: [1.3, 0.85, 0.9],
    name: "nose",
  });

  // Amber eyes with dark pupils, and a scar through the brow over one eye.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, b.segments(8), b.segments(6)), "#e7a22a", {
      at: [s * 0.075, 1.25, 1.09],
      bone: "head",
      name: "eye",
    });
    b.part(new THREE.SphereGeometry(0.014, b.segments(6), b.segments(4)), "#120a05", {
      at: [s * 0.075, 1.25, 1.115],
      bone: "head",
      name: "pupil",
    });
  }
  b.part(new THREE.BoxGeometry(0.016, 0.075, 0.012), "#4a2418", {
    at: [0.085, 1.29, 1.05],
    bone: "head",
    rotation: [0, 0, -25],
    name: "scar",
  });

  // Rounded ears, half-hidden in the mane.
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.07, b.segments(8), b.segments(6)), "#a86d35", {
      at: [s * 0.15, 1.37, 0.8],
      bone: "head",
      scale: [1, 1, 0.5],
      name: "ear",
    });

  return b.root;
}
```