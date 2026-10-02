import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { bezier, catmull } from "../src/path";

const SKIN = "#8b8c83";
const SKIN_LIGHT = "#a4a49a";
const SKIN_DARK = "#62655f";
const EAR = "#696c65";
const EAR_INNER = "#555951";
const TUSK = "#d8d0b4";
const TUSK_SHADE = "#b8af94";
const EYE = "#171916";
const IRIS = "#8f7a45";
const MOUTH = "#3e3d35";
const NAIL = "#bcb39a";
const TAIL = "#454944";

export const meta = {
  name: "African Bush Elephant",
  description: "A full-skeleton low-poly adult African bush elephant with broad ears, a curling trunk, tusks, and planted feet.",
  style: "low-poly",
  commit: "9555ebf",
};

export default function build() {
  const b = createBuilder({ name: "africanElephant", detail: 1 });

  // The skeleton is deliberately laid out first, in a neutral standing pose.
  const hips = b.joint("hips", { at: [0, 1.58, -0.42], dir: [0, 0, 1], role: "spine" });
  const shoulder = b.joint("shoulder", { parent: hips, at: [0, 1.7, 0.65], dir: [0, 0.05, 1], role: "spine" });

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.72, 0.62],
      [0, 1.96, 0.88],
      [0, 2.22, 1.12],
      [0, 2.36, 1.2],
    ]),
    { parent: shoulder, names: ["neckBase", "neckMid", "neckTop"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.tip ?? neck.joints[neck.joints.length - 1],
    at: [0, 2.36, 1.2],
    dir: [0, 0.06, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 2.17, 1.56],
    dir: [0, -0.12, 1],
    role: "jaw",
  });

  const legPaths = [
    { side: 1, name: "frontL", hip: [0.58, 1.55, 0.58] as [number, number, number], knee: [0.65, 0.9, 0.62] as [number, number, number], ankle: [0.63, 0.28, 0.65] as [number, number, number], foot: [0.63, 0.16, 0.68] as [number, number, number] },
    { side: -1, name: "frontR", hip: [-0.58, 1.55, 0.58] as [number, number, number], knee: [-0.65, 0.9, 0.62] as [number, number, number], ankle: [-0.63, 0.28, 0.65] as [number, number, number], foot: [-0.63, 0.16, 0.68] as [number, number, number] },
    { side: 1, name: "hindL", hip: [0.62, 1.48, -0.88] as [number, number, number], knee: [0.7, 0.86, -0.9] as [number, number, number], ankle: [0.66, 0.28, -0.95] as [number, number, number], foot: [0.66, 0.16, -0.99] as [number, number, number] },
    { side: -1, name: "hindR", hip: [-0.62, 1.48, -0.88] as [number, number, number], knee: [-0.7, 0.86, -0.9] as [number, number, number], ankle: [-0.66, 0.28, -0.95] as [number, number, number], foot: [-0.66, 0.16, -0.99] as [number, number, number] },
  ];
  const legs = legPaths.map((leg) => ({
    ...leg,
    chain: b.chain(
      leg.name,
      catmull([leg.hip, leg.knee, leg.ankle, leg.foot]),
      { parent: hips, names: [`${leg.name}Hip`, `${leg.name}Knee`, `${leg.name}Ankle`], role: "leg" },
    ),
  }));

  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 2.26, 1.58],
      [0, 1.88, 1.67],
      [0, 1.37, 1.72],
      [0, 0.83, 1.64],
      [0, 0.34, 1.45],
      [0, 0.17, 1.3],
    ]),
    { parent: head, names: ["trunkBase", "trunkUpper", "trunkMid", "trunkLower", "trunkTip"], role: "tentacle" },
  );
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.48, -1.45],
      [0, 1.32, -1.72],
      [0, 1.02, -1.98],
      [0, 0.68, -2.15],
      [0, 0.45, -2.2],
    ]),
    { parent: hips, names: ["tailBase", "tailMid", "tailLower", "tailTip"], role: "tail" },
  );

  // Main faceted masses.
  const bodyPath = catmull([
    [0, 1.55, -1.28],
    [0, 1.67, -0.75],
    [0, 1.7, 0.05],
    [0, 1.74, 0.72],
    [0, 1.68, 1.0],
  ]);
  b.sweep(bodyPath, (t) => 0.72 + 0.18 * Math.sin(Math.PI * t), {
    bone: [hips, shoulder],
    section: { ngon: 8 },
    smooth: false,
    color: SKIN,
    sectors: [[-62, 62, SKIN_LIGHT], [120, 240, SKIN_DARK]],
    name: "bodyMass",
    group: "body",
  });
  b.sweep(neck, [0.5, 0.39], {
    section: { ngon: 7 },
    smooth: false,
    color: SKIN,
    sectors: [[-60, 60, SKIN_LIGHT], [120, 240, SKIN_DARK]],
    name: "neckMass",
    group: "neck",
  });
  b.sweep(trunk, (t) => 0.27 - 0.16 * t, {
    section: { ngon: 8 },
    smooth: false,
    color: SKIN,
    sectors: [[-60, 60, SKIN_LIGHT], [120, 240, SKIN_DARK]],
    name: "trunkMass",
    group: "trunk",
  });
  b.sweep(tail, [0.13, 0.055], {
    section: { ngon: 7 },
    smooth: false,
    color: TAIL,
    name: "tailMass",
    group: "tail",
  });

  for (const leg of legs) {
    b.sweep(leg.chain, [0.25, 0.19, 0.16], {
      section: { ngon: 7 },
      smooth: false,
      color: SKIN,
      sectors: [[-55, 55, SKIN_LIGHT], [125, 235, SKIN_DARK]],
      name: `${leg.name}Mass`,
      group: "legs",
    });
    const ankleBone = leg.chain.joints[leg.chain.joints.length - 1];
    b.part(new THREE.CylinderGeometry(0.25, 0.27, 0.23, 8), SKIN_DARK, {
      bone: ankleBone,
      at: leg.foot,
      scale: [1, 1, 1.18],
      flat: true,
      name: `${leg.name}Foot`,
      group: "legs",
    });
    b.part(new THREE.BoxGeometry(0.24, 0.035, 0.14), NAIL, {
      bone: ankleBone,
      at: [leg.foot[0], 0.275, leg.foot[2] + 0.16],
      flat: true,
      name: `${leg.name}Toenail`,
      group: "legs",
    });
  }

  const headBone = head;
  b.part(new THREE.SphereGeometry(0.57, 8, 6), SKIN, {
    bone: headBone,
    at: head.at,
    scale: [0.92, 0.9, 1.08],
    flat: true,
    name: "headMass",
    group: "head",
  });
  b.part(new THREE.BoxGeometry(0.76, 0.42, 0.62), SKIN_LIGHT, {
    bone: headBone,
    at: [0, 2.23, 1.66],
    scale: [1, 0.9, 1.05],
    flat: true,
    name: "upperMuzzle",
    group: "head",
  });
  b.part(new THREE.BoxGeometry(0.52, 0.15, 0.38), MOUTH, {
    bone: jaw,
    at: [0, 2.16, 1.86],
    flat: true,
    name: "lowerJaw",
    group: "jaw",
  });
  b.part(new THREE.BoxGeometry(0.58, 0.045, 0.05), MOUTH, {
    bone: headBone,
    at: [0, 2.17, 1.985],
    flat: true,
    name: "mouthLine",
    group: "jaw",
  });

  // Broad, slightly cupped ears: flattened faceted spheres give a crisp fan silhouette.
  for (const s of [1, -1]) {
    const earBone = shoulder;
    b.part(new THREE.SphereGeometry(0.9, 7, 5), EAR, {
      bone: earBone,
      at: [s * 0.72, 1.98, 0.82],
      scale: [0.12, 0.96, 1.13],
      rotation: [0, s * 8, s * 13],
      flat: true,
      name: `ear${s > 0 ? "L" : "R"}`,
      group: "ears",
    });
    b.part(new THREE.SphereGeometry(0.68, 7, 5), EAR_INNER, {
      bone: earBone,
      at: [s * 0.835, 1.98, 0.82],
      scale: [0.035, 0.78, 0.94],
      rotation: [0, s * 8, s * 13],
      flat: true,
      name: `earInner${s > 0 ? "L" : "R"}`,
      group: "ears",
    });
  }

  // Eyes sit high and wide, with a tiny warm iris facet on each side.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.075, 6, 4), EYE, {
      bone: headBone,
      at: [s * 0.43, 2.49, 1.51],
      flat: true,
      name: `eye${s > 0 ? "L" : "R"}`,
      group: "face",
    });
    b.part(new THREE.SphereGeometry(0.032, 6, 4), IRIS, {
      bone: headBone,
      at: [s * 0.468, 2.49, 1.545],
      flat: true,
      name: `iris${s > 0 ? "L" : "R"}`,
      group: "face",
    });
    b.part(new THREE.BoxGeometry(0.2, 0.055, 0.1), SKIN_DARK, {
      bone: headBone,
      at: [s * 0.43, 2.58, 1.51],
      rotation: [0, s * 11, s * 8],
      flat: true,
      name: `brow${s > 0 ? "L" : "R"}`,
      group: "face",
    });
  }

  // Two low-poly ivory tusks curve forward and down from the cheek line.
  for (const s of [1, -1]) {
    const tuskPath = bezier(
      [s * 0.25, 2.17, 1.69],
      [s * 0.4, 2.05, 1.93],
      [s * 0.49, 1.79, 2.08],
      [s * 0.4, 1.61, 2.12],
    );
    b.sweep(tuskPath, [0.105, 0], {
      bone: headBone,
      section: { ngon: 6 },
      smooth: false,
      color: TUSK,
      sectors: [[-75, 75, TUSK_SHADE]],
      caps: "point",
      name: `tusk${s > 0 ? "L" : "R"}`,
      group: "tusks",
    });
  }

  // Short whisker-like trunk tip lobes and a dark tail tuft provide small scale cues.
  for (const s of [1, -1]) {
    b.spike(trunk.at(0.98), [s * 0.7, 0.08, 0.55], 0.09, 0.035, { color: SKIN_DARK, name: `trunkLobe${s > 0 ? "L" : "R"}`, group: "trunk" });
  }
  const tailEnd = tail.at(1);
  for (const s of [-1, -0.5, 0, 0.5, 1]) {
    b.spike(tailEnd, [s * 0.45, -0.15, -0.9], 0.24, 0.028, { color: TAIL, name: `tailHair${s}`, group: "tail" });
  }

  return b.root;
}
