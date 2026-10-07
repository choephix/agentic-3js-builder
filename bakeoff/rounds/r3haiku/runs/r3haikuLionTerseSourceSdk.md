```ts
import * as THREE from "three";
import { countershade, createBuilder, frame, mottle } from "agentic-3js-builder";

export const meta = {
  name: "Lion",
  description: "A standing male lion in a rest pose: tawny coat with a cream belly, a dark-maned ruff, tufted tail and a hinged jaw.",
};

const COAT = countershade("#c98b45", "#f2dcaa", { level: -0.2, soft: 0.45 });
const MANE = mottle("#4a2a12", "#c2803a", { size: 0.09, seed: 5 });
const DARK = "#5a3a22";
const CREAM = "#f2dcaa";
const NOSE = "#2b1a14";
const EYE = "#f0b23a";
const PUPIL = "#1a120c";
const EAR = "#8a5224";

export default function lion() {
  const b = createBuilder({ name: "lion", detail: 1, paintSize: 1024 });

  // Skeleton: pelvis, spine, neck, head and jaw.
  b.joint("pelvis", { at: [0, 1.1, -0.35], dir: [0, 0, 1] });
  b.chain("spine", [[0, 1.1, -0.2], [0, 1.17, 0.1], [0, 1.23, 0.5]], {
    role: "spine",
    names: ["spine1", "spine2", "chest"],
  });
  const neck = b.chain("neck", [[0, 1.23, 0.5], [0, 1.29, 0.66], [0, 1.33, 0.8]], {
    role: "neck",
    names: ["neck1", "neck2"],
  });
  b.joint("head", { at: [0, 1.33, 0.8], parent: "neck2", dir: [0, 0.12, 1], role: "head" });
  b.joint("jaw", { at: [0, 1.27, 0.93], parent: "head", dir: [0, 0, 1], role: "jaw" });

  // Body: one smooth tube through the spine, from rump to chest.
  b.loft(
    [
      { at: [0, 1.1, -0.7], w: 0.4, h: 0.48 },
      { at: [0, 1.14, -0.2], w: 0.5, h: 0.6 },
      { at: [0, 1.2, 0.2], w: 0.52, h: 0.64 },
      { at: [0, 1.22, 0.5], w: 0.46, h: 0.6 },
    ],
    { color: COAT, bone: ["pelvis", "spine1", "spine2", "chest"], name: "body" },
  );

  // Legs: a front and a hind leg on each side, each a chain with a tip joint at the paw.
  for (const [side, L] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const x = 0.19 * side;
    const fore = b.chain(`fore${L}`, [[x, 1.2, 0.36], [x, 0.62, 0.4], [x, 0.2, 0.44], [x, 0.07, 0.5]], {
      role: "leg",
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `paw${L}`],
    });
    b.sweep(fore, [0.12, 0.08, 0.06, 0.07], { color: COAT, name: `fore${L}` });
    b.part(new THREE.SphereGeometry(0.15, b.segments(10), b.segments(8)), COAT, {
      at: [x, 1.2, 0.36],
      bone: `shoulder${L}`,
    });
    b.part(new THREE.SphereGeometry(0.085, b.segments(8), b.segments(6)), DARK, {
      at: [x, 0.06, 0.52],
      bone: `paw${L}`,
      scale: [1.15, 0.6, 1.3],
    });

    const hind = b.chain(`hind${L}`, [[x, 1.1, -0.55], [x, 0.62, -0.42], [x, 0.28, -0.74], [x, 0.07, -0.6]], {
      role: "leg",
      names: [`hip${L}`, `knee${L}`, `hock${L}`, `toe${L}`],
    });
    b.sweep(hind, [0.17, 0.1, 0.06, 0.07], { color: COAT, name: `hind${L}` });
    b.part(new THREE.SphereGeometry(0.17, b.segments(10), b.segments(8)), COAT, {
      at: [x, 1.04, -0.5],
      bone: `hip${L}`,
      scale: [1, 1, 1.1],
    });
    b.part(new THREE.SphereGeometry(0.085, b.segments(8), b.segments(6)), DARK, {
      at: [x, 0.06, -0.62],
      bone: `toe${L}`,
      scale: [1.15, 0.6, 1.3],
    });
  }

  // Neck tube.
  b.sweep(neck, [0.15, 0.13], { color: COAT, name: "neck" });

  // Tail: a long curve down the rear, ending in a dark tuft.
  const tail = b.chain("tail", [[0, 1.12, -0.72], [0, 1.0, -0.98], [0, 0.72, -1.1], [0, 0.42, -1.02]], {
    role: "tail",
    names: ["tail1", "tail2", "tail3", "tail4"],
  });
  b.sweep(tail, [0.06, 0.045, 0.035, 0.04], { color: COAT, name: "tail" });
  const tuft = new THREE.SphereGeometry(0.085, b.segments(8), b.segments(6));
  tuft.scale(1, 1.5, 1);
  b.stick(tuft, DARK, tail.at(1), { embed: 0.15 });

  // Head: skull, muzzle, nose, eyes and ears on the head bone.
  b.part(new THREE.SphereGeometry(0.19, b.segments(12), b.segments(10)), COAT, {
    at: [0, 1.33, 0.8],
    bone: "head",
    scale: [0.92, 0.95, 1.02],
    name: "skull",
  });
  b.part(new THREE.SphereGeometry(0.11, b.segments(10), b.segments(8)), CREAM, {
    at: [0, 1.26, 1.0],
    bone: "head",
    scale: [1, 0.85, 1.15],
    name: "muzzle",
  });
  b.part(new THREE.SphereGeometry(0.042, b.segments(8), b.segments(6)), NOSE, {
    at: [0, 1.3, 1.12],
    bone: "head",
    scale: [1.35, 0.8, 0.8],
    name: "nose",
  });
  b.part(new THREE.SphereGeometry(0.09, b.segments(10), b.segments(8)), CREAM, {
    at: [0, 1.2, 1.0],
    bone: "jaw",
    scale: [0.9, 0.5, 1.1],
    name: "jaw",
  });
  for (const side of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.032, b.segments(8), b.segments(6)), EYE, {
      at: [0.075 * side, 1.36, 0.955],
      bone: "head",
    });
    b.part(new THREE.SphereGeometry(0.014, b.segments(6), b.segments(5)), PUPIL, {
      at: [0.075 * side, 1.36, 0.985],
      bone: "head",
    });
    b.part(new THREE.SphereGeometry(0.055, b.segments(8), b.segments(6)), EAR, {
      at: [0.13 * side, 1.47, 0.76],
      bone: "head",
      scale: [1, 1, 0.55],
    });
  }

  // Mane: two staggered rings of tapered tufts around the head, leaning back.
  const tuftGeometry = () => {
    const g = new THREE.SphereGeometry(0.075, b.segments(7), b.segments(5));
    g.scale(1, 1.9, 0.8);
    return g;
  };
  const maneAxis = frame([0, 1.33, 0.74], [0, 0, -1]);
  b.ring(maneAxis, { count: 16, radius: 0.2, tilt: 15 }, (item) => {
    b.stick(tuftGeometry(), MANE, item, { bone: "head", embed: 0.25 });
  });
  b.ring(maneAxis, { count: 20, radius: 0.28, fromDeg: 9, tilt: 40 }, (item) => {
    b.stick(tuftGeometry(), MANE, item, { bone: "head", embed: 0.25 });
  });

  return b.root;
}
```