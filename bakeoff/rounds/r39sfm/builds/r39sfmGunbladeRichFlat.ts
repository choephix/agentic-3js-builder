import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gunblade",
  description:
    "A Final Fantasy style gunblade: a long steel blade with a barrel along its spine, a revolver drum and hammer at the hilt, a trigger guard, a winged lion crossguard and a gold pommel. About 1.4 m tall, standing on its pommel.",
};

const STEEL = "#c9d3e0";
const STEEL_DK = "#8a97ae";
const STEEL_HI = "#f4f8ff";
const GUN = "#363c4c";
const GUN_DK = "#1f232d";
const GOLD = "#d9a441";
const GOLD_HI = "#f6d77a";
const LEATHER = "#3b2830";
const LEATHER_HI = "#5a3d44";
const BLUE = "#4ad8ff";
const BRASS = "#b9803a";

export default function build() {
  const b = createBuilder({ name: "gunblade" });

  const cyl = (r0: number, r1: number, h: number, seg = 8) => new THREE.CylinderGeometry(r0, r1, h, seg);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  // ---------- Pommel ----------
  b.lathe(
    [
      [0, 0],
      [0.02, 0],
      [0.036, 0.02],
      [0.036, 0.045],
      [0.024, 0.072],
      [0, 0.072],
    ],
    { at: [0, 0, 0], segments: 8, color: GOLD },
  );
  b.part(cyl(0.039, 0.039, 0.008, 8), GOLD_HI, { at: [0, 0.033, 0] });
  b.part(new THREE.OctahedronGeometry(0.014), BLUE, { at: [0, 0.006, 0] });
  glow(b.part(new THREE.OctahedronGeometry(0.012), BLUE, { at: [0, 0.012, 0.0] }), 1.2);

  // ---------- Grip ----------
  b.part(cyl(0.02, 0.02, 0.23, 8), LEATHER, { at: [0, 0.185, 0] });
  for (let i = 0; i < 7; i++) {
    b.part(cyl(0.0225, 0.0225, 0.007, 8), i % 2 ? LEATHER_HI : GUN_DK, { at: [0, 0.095 + i * 0.03, 0] });
  }
  b.part(cyl(0.026, 0.026, 0.012, 8), GOLD, { at: [0, 0.075, 0] });
  b.part(cyl(0.026, 0.024, 0.014, 8), GOLD, { at: [0, 0.296, 0] });

  // ---------- Trigger guard and trigger ----------
  b.sweep(
    catmull([
      [0, 0.31, -0.035],
      [0, 0.298, -0.088],
      [0, 0.25, -0.097],
      [0, 0.215, -0.025],
    ]),
    0.0055,
    { color: GOLD, caps: "round" },
  );
  b.capsule([0, 0.302, -0.05], [0, 0.262, -0.042], 0.0075, GOLD_HI);

  // ---------- Receiver ----------
  b.part(box(0.05, 0.12, 0.1), GUN, { at: [0, 0.36, 0] });
  b.part(box(0.042, 0.012, 0.108), GOLD, { at: [0, 0.428, 0] });
  b.part(box(0.042, 0.012, 0.108), GOLD, { at: [0, 0.304, 0] });
  // hammer
  b.part(box(0.012, 0.045, 0.014), GUN_DK, { at: [0, 0.446, -0.06], rotation: [-32, 0, 0] });
  b.part(box(0.016, 0.01, 0.02), GOLD_HI, { at: [0, 0.466, -0.07], rotation: [-32, 0, 0] });
  // screws
  for (const s of [1, -1])
    for (const [y, z] of [
      [0.33, -0.035],
      [0.39, -0.035],
      [0.33, 0.04],
    ])
      b.part(new THREE.SphereGeometry(0.006, 6, 4), GOLD_HI, { at: [s * 0.026, y, z] });

  // ---------- Revolver drum ----------
  const dy = 0.36;
  const dz = 0.022;
  b.part(cyl(0.05, 0.05, 0.07, 12), GUN_DK, { at: [0, dy, dz], dir: [1, 0, 0] });
  for (const s of [1, -1]) {
    b.part(cyl(0.052, 0.052, 0.008, 12), GOLD, { at: [s * 0.028, dy, dz], dir: [1, 0, 0] });
    b.part(cyl(0.013, 0.013, 0.01, 8), GOLD_HI, { at: [s * 0.038, dy, dz], dir: [1, 0, 0] });
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const y = dy + 0.03 * Math.cos(a);
      const z = dz + 0.03 * Math.sin(a);
      b.part(cyl(0.0095, 0.0095, 0.004, 8), "#0c0e14", { at: [s * 0.0365, y, z], dir: [1, 0, 0] });
      b.part(cyl(0.005, 0.005, 0.005, 6), BRASS, { at: [s * 0.0375, y, z], dir: [1, 0, 0] });
    }
  }

  // ---------- Crossguard with lion emblem ----------
  b.extrude(
    [
      [-0.03, 0],
      [-0.13, 0.02],
      [-0.17, 0.075, "sharp"],
      [-0.1, 0.055],
      [-0.03, 0.06],
      [0.03, 0.06],
      [0.1, 0.055],
      [0.17, 0.075, "sharp"],
      [0.13, 0.02],
      [0.03, 0],
    ],
    { at: [0, 0.42, 0.01], x: [1, 0, 0], thickness: 0.03, bevel: 0.004, color: STEEL },
  );
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0.04, 0.012],
        [0.11, 0.028],
        [0.14, 0.058, "sharp"],
        [0.1, 0.045],
        [0.04, 0.045],
      ],
      { at: [s * 0, 0.42, 0.0262], x: [s, 0, 0], thickness: 0.004, color: GOLD },
    );
  }
  b.part(cyl(0.024, 0.024, 0.006, 12), GOLD, { at: [0, 0.455, 0.027], dir: [0, 0, 1] });
  b.part(cyl(0.015, 0.015, 0.007, 10), GOLD_HI, { at: [0, 0.455, 0.029], dir: [0, 0, 1] });
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    b.part(new THREE.ConeGeometry(0.007, 0.02, 4), GOLD_HI, {
      at: [Math.sin(a) * 0.028, 0.455 + Math.cos(a) * 0.028, 0.027],
      dir: [Math.sin(a), Math.cos(a), 0],
    });
  }
  glow(b.part(new THREE.OctahedronGeometry(0.01), BLUE, { at: [0, 0.455, 0.034] }), 1.3);

  // ---------- Blade ----------
  const BASE = 0.42;
  b.extrude(
    [
      [-0.03, 0],
      [0.05, 0],
      [0.056, 0.14],
      [0.056, 0.78],
      [-0.005, 0.97, "sharp"],
      [-0.03, 0.88],
    ],
    { at: [0, BASE, 0], x: [0, 0, 1], thickness: [0.016, 0.01], color: STEEL },
  );
  // bevelled edge highlight
  b.extrude(
    [
      [0.04, 0.14],
      [0.0565, 0.14],
      [0.0565, 0.78],
      [0.04, 0.8],
    ],
    { at: [0, BASE, 0], x: [0, 0, 1], thickness: 0.0125, color: STEEL_HI },
  );
  // gold collar
  b.extrude(
    [
      [-0.034, 0],
      [0.054, 0],
      [0.054, 0.07],
      [-0.034, 0.07],
    ],
    { at: [0, BASE, 0], x: [0, 0, 1], thickness: 0.022, color: GOLD },
  );
  // fullers and energy inlay
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0.0, 0.11],
        [0.03, 0.11],
        [0.03, 0.7],
        [0.012, 0.77, "sharp"],
        [0.0, 0.7],
      ],
      { at: [s * 0.0065, BASE, 0], x: [0, 0, 1], thickness: 0.0035, color: STEEL_DK },
    );
    glow(
      b.extrude(
        [
          [0.008, 0.14],
          [0.016, 0.14],
          [0.016, 0.62],
          [0.012, 0.66, "sharp"],
          [0.008, 0.62],
        ],
        { at: [s * 0.0085, BASE, 0], x: [0, 0, 1], thickness: 0.0035, color: BLUE },
      ),
      1.2,
    );
    // gold rune studs
    for (let i = 0; i < 3; i++)
      b.part(new THREE.BoxGeometry(0.003, 0.012, 0.008), GOLD_HI, {
        at: [s * 0.0085, BASE + 0.1 + i * 0.0, 0.043 - i * 0.0],
        rotation: [0, 0, 0],
      });
  }
  // spine ridge + barrel
  b.rod([0, BASE + 0.04, -0.046], [0, BASE + 0.9, -0.046], 0.014, GUN, { caps: "flat", sides: 8 });
  for (const y of [0.1, 0.3, 0.5, 0.7, 0.88]) b.part(cyl(0.0175, 0.0175, 0.014, 8), GOLD, { at: [0, BASE + y, -0.046] });
  b.part(cyl(0.012, 0.012, 0.01, 8), "#0a0b10", { at: [0, BASE + 0.905, -0.046] });
  // serrations along the spine
  for (let i = 0; i < 4; i++)
    b.part(new THREE.ConeGeometry(0.008, 0.03, 4), STEEL_DK, {
      at: [0, BASE + 0.25 + i * 0.16, -0.068],
      dir: [0, 0, -1],
    });

  return b.root;
}
