import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull, spiral } from "../src/path";
import { cel } from "../kits/toon";
import { glow } from "../kits/glow";
import { svg } from "../src/texture";

const INK = "#170d2b";
const BONE = cel("#e3cfa4", "#76506b", { threshold: 0.1 });
const BONE_DARK = cel("#9b6f7d", "#3b214e", { threshold: 0.08 });
const BLADE = cel("#5d3ab2", "#21133f", { threshold: 0.05 });
const EDGE = cel("#a46cff", "#43216f", { threshold: 0.16 });
const GOLD = cel("#f7bb4f", "#9b3f62", { threshold: 0.18 });
const CYAN = "#35e4ff";
const CYAN_PALE = "#c6ffff";
const SOUL = "#c04dff";

const RUNE = svg(
  `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 3 L32 23 L17 38 L32 49 L48 37 M32 49 L32 73 L19 89 M32 73 L47 89" fill="none" stroke="#c6ffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="32" cy="49" r="5" fill="#35e4ff"/>
  </svg>`,
  { size: 128 },
);

export const meta = {
  name: "Dragonbone Soul Scythe",
  description: "A towering dragonbone reaper with a crescent void blade, soul runes, and a spectral violet core.",
  style: "League of Legends",
  commit: "34f986c",
};

export default function build() {
  const b = createBuilder({ name: "soulScythe", detail: 1.15, paintSize: 1024 });
  const root = b.joint("scytheRoot", { at: [0, 0, 0] });

  // A slightly crooked, faceted bone haft gives the weapon a hand-painted, heroic silhouette.
  const haftPath = catmull([
    [0, 0.08, 0],
    [0.01, 0.46, 0.005],
    [-0.015, 0.86, -0.002],
    [0.025, 1.18, 0.008],
    [0.055, 1.44, 0.018],
  ]);
  const haft = b.sweep(haftPath, (t) => 0.053 - t * 0.012, {
    bone: root,
    section: { ngon: 6 },
    caps: "flat",
    color: BONE_DARK,
    group: "dragonbone-haft",
    name: "boneHaft",
  });

  // Deep leather/void wrap around the grip, with gold and bone cuffs at the hand positions.
b.sweep(
  spiral([0, 0.16, 0], [0.067, 0.16, 0], [0, 1, 0], { turns: 5.25, pitch: 0.2 }),
  0.014,
  { bone: root, section: { ngon: 5 }, caps: "round", color: INK, group: "grip-wrap", name: "voidGripWrap" },
);
  const cuffYs = [0.11, 0.42, 0.75, 1.08];
  for (const [i, y] of cuffYs.entries()) {
    b.part(new THREE.TorusGeometry(0.061, 0.012, 6, 10), i % 2 ? GOLD : BONE, {
      bone: root,
      at: [0, y, 0],
      group: "haft-cuffs",
      name: `cuff${i}`,
      flat: true,
    });
  }

  // Bone studs are repeated as a readable carved grip detail, not a smooth generic cylinder.
  for (const [i, at] of b.along(haft, 9, () => {}).map((p) => p).entries()) {
    if (i === 0 || i === 8) continue;
    b.ring(at, { count: 6, radius: 0.052, fromDeg: 0, toDeg: 300 }, (stud) => {
      b.spike(stud, stud, 0.026, 0.0075, {
        bone: root,
        color: i % 2 ? BONE : GOLD,
        group: "grip-studs",
      });
    });
  }

  // Flared butt socket, built as a low-poly turned piece, lets the scythe sit naturally on the floor.
  b.lathe(
    [
      [0, 0],
      [0.065, 0],
      [0.085, 0.045],
      [0.077, 0.09],
      [0.052, 0.13],
      [0, 0.16],
    ],
    { at: [0, 0.045, 0], axis: [0, 1, 0], segments: 8, color: BONE, bone: root, group: "butt-cap", name: "boneButtCap" },
  );
  b.part(new THREE.SphereGeometry(0.032, 8, 5), CYAN, {
    bone: root,
    at: [0, 0.032, 0.065],
    group: "butt-rune",
    name: "buttRune",
  });
  glow(b.part(new THREE.SphereGeometry(0.032, 8, 5), CYAN, {
    bone: root,
    at: [0, 0.032, 0.065],
    group: "butt-rune",
    name: "buttRuneGlow",
  }), 1.5);

  // Main crescent: the outer silhouette is broad and heroic while the inner edge hooks toward the skull.
  const bladeRoot: [number, number, number] = [0.02, 1.34, 0.01];
  const bladeOutline: Array<[number, number] | [number, number, "sharp"]> = [
    [0, -0.09, "sharp"],
    [0.27, -0.02],
    [0.53, 0.1],
    [0.76, 0.29],
    [0.94, 0.53],
    [1.02, 0.81],
    [1.0, 1.06],
    [0.9, 1.3],
    [0.72, 1.49],
    [0.5, 1.61],
    [0.25, 1.65],
    [0.03, 1.6, "sharp"],
    [0.27, 1.42],
    [0.46, 1.25],
    [0.59, 1.04],
    [0.62, 0.83],
    [0.56, 0.63],
    [0.43, 0.46],
    [0.24, 0.33],
    [0, 0.28, "sharp"],
  ];
b.extrude(bladeOutline, {
  at: bladeRoot,
  x: [1, 0, 0],
  y: [0, 1, 0],
  thickness: [0.055, 0.025],
  bevel: 0.014,
  smoothing: 1,
  color: BLADE,
  bone: root,
  group: "void-crescent",
  name: "crescentBlade",
});

  // Bright inner cutting edge and a thicker dorsal ridge sell the painted, game-readable silhouette.
b.extrude(
  [
    [0.08, 0.24],
    [0.3, 0.3],
    [0.49, 0.44],
    [0.63, 0.63],
    [0.7, 0.84],
    [0.67, 1.07],
    [0.55, 1.27],
    [0.37, 1.44],
    [0.2, 1.54],
    [0.29, 1.42],
    [0.47, 1.24],
    [0.59, 1.03],
    [0.62, 0.83],
    [0.56, 0.63],
    [0.43, 0.46],
    [0.24, 0.33],
  ],
  {
    at: [bladeRoot[0], bladeRoot[1], bladeRoot[2] + 0.036],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.004,
    color: EDGE,
    bone: root,
    group: "blade-edge",
    name: "violetCuttingEdge",
  },
);
  b.sweep(
    catmull([
      [0.1, 1.43, 0.05],
      [0.39, 2.73, 0.05],
      [0.72, 2.7, 0.05],
      [0.98, 2.22, 0.05],
    ]),
    [0.026, 0.014],
    { bone: root, section: { ngon: 5 }, caps: "point", color: GOLD, group: "blade-ridge", name: "goldenBladeRidge" },
  );

  // Painted-looking blade studs and a runic trail break up the large surface.
  const bladeStuds: Array<[number, number, number]> = [
    [0.23, 1.65, 0.055],
    [0.4, 1.86, 0.055],
    [0.58, 2.07, 0.055],
    [0.75, 2.27, 0.055],
    [0.87, 2.47, 0.055],
  ];
  for (const [i, p] of bladeStuds.entries()) {
    b.part(new THREE.SphereGeometry(0.028, 8, 5), i % 2 ? CYAN : GOLD, {
      bone: root,
      at: p,
      group: "blade-studs",
      name: `bladeStud${i}`,
      flat: true,
    });
  }
  const runePlaces: Array<[number, number, number, number]> = [
    [0.28, 1.73, 18, 0.18],
    [0.49, 1.99, -14, 0.2],
    [0.68, 2.24, 12, 0.18],
  ];
  for (const [i, [x, y, rot, size]] of runePlaces.entries()) {
    glow(b.part(new THREE.PlaneGeometry(size * 0.67, size), "#ffffff", {
      bone: root,
      at: [x, y, 0.062],
      rotation: [0, 0, rot],
      texture: RUNE,
      group: "soul-runes",
      name: `soulRune${i}`,
    }), 1.7);
  }

  // Eight bone teeth hang from the inner cutting edge like a dragon's jaw.
  const teeth: Array<[number, number, number, number]> = [
    [0.19, 1.63, -0.35, 0.1],
    [0.31, 1.52, -0.45, 0.12],
    [0.43, 1.39, -0.55, 0.12],
    [0.54, 1.22, -0.62, 0.11],
    [0.61, 1.03, -0.7, 0.1],
    [0.62, 0.83, -0.8, 0.095],
    [0.55, 0.64, -0.9, 0.085],
    [0.43, 0.49, -1.0, 0.075],
  ];
  for (const [i, [x, y, dx, length]] of teeth.entries()) {
    b.spike([bladeRoot[0] + x, bladeRoot[1] + y, bladeRoot[2] + 0.06], [dx, -0.92, 0], length, 0.022, {
      bone: root,
      color: i % 3 === 0 ? GOLD : BONE,
      group: "dragon-teeth",
      name: `cuttingTooth${i}`,
    });
  }

  // The dragon skull grips the blade socket: cranium, lower jaw, cheek plates, nostrils, eyes and horns.
  b.part(new THREE.SphereGeometry(1, 12, 8), BONE, {
    bone: root,
    at: [0.02, 1.39, 0.035],
    scale: [0.18, 0.16, 0.14],
    group: "dragon-skull",
    name: "dragonCranium",
    flat: true,
  });
  b.part(new THREE.SphereGeometry(1, 10, 6), BONE_DARK, {
    bone: root,
    at: [0.02, 1.25, 0.1],
    scale: [0.15, 0.055, 0.13],
    rotation: [12, 0, 0],
    group: "dragon-skull",
    name: "dragonLowerJaw",
    flat: true,
  });
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(1, 8, 5), BONE_DARK, {
      bone: root,
      at: [0.02 + s * 0.145, 1.34, 0.02],
      scale: [0.045, 0.12, 0.11],
      rotation: [0, 0, s * 22],
      group: "dragon-cheeks",
      name: s > 0 ? "leftCheekPlate" : "rightCheekPlate",
      flat: true,
    });
    const eye = b.part(new THREE.SphereGeometry(0.035, 8, 5), CYAN, {
      bone: root,
      at: [0.02 + s * 0.08, 1.42, 0.158],
      scale: [1.1, 0.7, 0.6],
      group: "soul-eyes",
      name: s > 0 ? "leftSoulEye" : "rightSoulEye",
      flat: true,
    });
    glow(eye, 2.3);
    b.spike([0.02 + s * 0.1, 1.5, 0.12], [s * 0.25, 0.8, 0], 0.1, 0.018, {
      bone: root,
      color: BONE,
      group: "brow-horns",
      name: s > 0 ? "leftBrowHorn" : "rightBrowHorn",
    });
    b.spike([0.02 + s * 0.09, 1.26, 0.16], [s * 0.2, -0.8, 0.15], 0.075, 0.014, {
      bone: root,
      color: BONE,
      group: "jaw-fangs",
      name: s > 0 ? "leftFang" : "rightFang",
    });
  }
  for (const s of [-1, 1]) {
    const horn = b.sweep(
      catmull([
        [0.02 + s * 0.1, 1.5, 0.03],
        [0.02 + s * 0.19, 1.63, 0.02],
        [0.02 + s * 0.27, 1.84, 0.01],
        [0.02 + s * 0.25, 2.0, 0.02],
      ]),
      [0.038, 0.004],
      { bone: root, section: { ngon: 6 }, caps: "point", color: BONE, group: "dragon-horns", name: s > 0 ? "leftDragonHorn" : "rightDragonHorn" },
    );
    b.along(horn, 4, (at) => {
      b.spike(at, at, 0.035, 0.006, { bone: root, color: BONE_DARK, group: "horn-ridges" });
    });
  }
  // Nose socket and a tiny ember in the mouth make the skull read from the front shot.
  b.part(new THREE.SphereGeometry(0.03, 7, 5), INK, {
    bone: root,
    at: [0.02, 1.36, 0.17],
    scale: [1.2, 0.7, 0.45],
    group: "skull-details",
    name: "noseSocket",
  });
  glow(b.part(new THREE.SphereGeometry(0.018, 7, 5), SOUL, {
    bone: root,
    at: [0.02, 1.29, 0.17],
    group: "skull-details",
    name: "mouthEmber",
  }), 1.6);

  // A spectral heart and three curling soul wisps hover inside the crescent.
  const soulCore = b.part(new THREE.IcosahedronGeometry(0.095, 1), SOUL, {
    bone: root,
    at: [0.53, 1.93, 0.08],
    group: "soul-core",
    name: "soulCore",
    flat: true,
  });
  glow(soulCore, 2.2);
  for (const [i, rot] of [0, 55, -55].entries()) {
    const ring = b.part(new THREE.TorusGeometry(0.13 + i * 0.018, 0.008, 5, 16), i === 1 ? CYAN_PALE : SOUL, {
      bone: root,
      at: [0.53, 1.93, 0.08],
      rotation: [90, rot, 0],
      group: "soul-rings",
      name: `soulRing${i}`,
      flat: true,
    });
    glow(ring, 1.8);
  }
  const wispPaths = [
    catmull([[0.52, 1.86, 0.09], [0.69, 1.78, 0.1], [0.78, 1.89, 0.1], [0.71, 2.04, 0.1]]),
    catmull([[0.47, 1.98, 0.1], [0.35, 2.1, 0.1], [0.4, 2.25, 0.1], [0.56, 2.31, 0.1]]),
    catmull([[0.59, 1.97, 0.1], [0.77, 2.08, 0.1], [0.83, 2.22, 0.1], [0.76, 2.37, 0.1]]),
  ];
  for (const [i, path] of wispPaths.entries()) {
    const wisp = b.sweep(path, [0.014, 0.002], {
      bone: root,
      section: { ngon: 5 },
      caps: "point",
      color: i === 1 ? CYAN : SOUL,
      group: "soul-wisps",
      name: `soulWisp${i}`,
    });
    glow(wisp, 2.0);
  }

  // A few floating motes frame the blade without making the silhouette noisy.
  const motes: Array<[number, number, number, number]> = [
    [0.86, 1.82, 0.09, 0.025],
    [0.93, 2.02, 0.1, 0.018],
    [0.77, 2.51, 0.09, 0.02],
    [0.32, 2.42, 0.1, 0.016],
    [0.16, 1.86, 0.1, 0.02],
  ];
  for (const [i, [x, y, z, r]] of motes.entries()) {
    const mote = b.part(new THREE.IcosahedronGeometry(r, 1), i % 2 ? CYAN : SOUL, {
      bone: root,
      at: [x, y, z],
      group: "soul-motes",
      name: `soulMote${i}`,
      flat: true,
    });
    glow(mote, 1.8);
  }

  return b.root;
}
