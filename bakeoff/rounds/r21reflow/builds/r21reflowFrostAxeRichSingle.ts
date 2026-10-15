import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { grain, mottle } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Frost-Forged Battle Axe",
  description:
    "A heavy dwarven battle axe: runed dark-steel head rimmed with jagged glacial ice, glowing frost crystal on the poll, leather-wrapped haft with riveted steel bands, displayed upright on an icy stone plinth.",
  style: "League of Legends",
  commit: "88fc1f0",
};

const STEEL = cel("#5b6a84", "#3a4560");
const STEEL_LIGHT = cel("#9aa8c0", "#5f6d88");
const STEEL_DARK = cel("#3f4a63", "#262e44");
const ICE = cel(mottle("#c6ecff", "#8fc8f5", { size: 0.07, seed: 4 }), "#5f9ce0");
const ICE_DEEP = cel(mottle("#8fd0ff", "#4f9be8", { size: 0.05, seed: 9 }), "#3a6fc4");
const WOOD = cel(grain("#7a4a2c", "#5a3320", { size: 0.012, axis: "y", seed: 2 }), "#3d2216");
const LEATHER = cel("#8a3a2c", "#4e1e20");
const STONE = cel("#7a8696", "#4b5568");
const STONE_DARK = cel("#5d6878", "#3a4254");
const SNOW = cel("#f2fbff", "#a9d0f0");
const CRYSTAL = "#7fe0ff";
const RUNE_GLOW = "#8fefff";

const RUNE = svg(
  `<svg viewBox="0 0 60 70">
  <g stroke="#8fefff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M10 8 L10 40 L26 26 L10 14"/>
    <path d="M30 6 L48 22 L34 30 L50 46"/>
    <path d="M12 52 L26 62 L40 52 L52 64"/>
    <path d="M22 40 L30 44"/>
  </g>
  <g fill="#8fefff"><circle cx="46" cy="8" r="2.6"/><circle cx="8" cy="64" r="2.6"/></g>
</svg>`,
  { size: 256 },
);

const SMALL_RUNE = svg(
  `<svg viewBox="0 0 30 40">
  <g stroke="#8fefff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M8 4 L8 34 M8 12 L22 4 M8 22 L22 14"/>
  </g></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "frostAxe" });
  const root = b.joint("root", { at: [0, 0.6, 0] });
  const on = { bone: root };

  // ---- plinth -------------------------------------------------------------
  b.part(new THREE.CylinderGeometry(0.21, 0.24, 0.06, 8), STONE_DARK, { ...on, at: [0, 0.03, 0], flat: true });
  b.part(new THREE.CylinderGeometry(0.15, 0.18, 0.06, 8), STONE, { ...on, at: [0, 0.09, 0], flat: true });
  b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.008, 8), SNOW, { ...on, at: [0, 0.121, 0], flat: true });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    b.part(new THREE.BoxGeometry(0.03, 0.012, 0.012), STEEL_LIGHT, {
      ...on,
      at: [Math.sin(a) * 0.236, 0.03, Math.cos(a) * 0.236],
      rotation: [0, (a * 180) / Math.PI, 0],
    });
  }
  // ice shards around the base
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.5;
    const r = 0.25 + (i % 2) * 0.03;
    const h = 0.09 + (i % 3) * 0.04;
    b.part(new THREE.ConeGeometry(0.03, h, 5), i % 2 ? ICE : ICE_DEEP, {
      ...on,
      at: [Math.sin(a) * r, h / 2 - 0.005, Math.cos(a) * r],
      dir: [Math.sin(a) * 0.25, 1, Math.cos(a) * 0.25],
      flat: true,
    });
  }

  // ---- pommel -------------------------------------------------------------
  b.lathe(
    [
      [0, 0],
      [0.055, 0],
      [0.08, 0.04],
      [0.065, 0.095],
      [0.042, 0.11],
      [0, 0.11],
    ],
    { at: [0, 0.12, 0], segments: 6, color: STEEL, ...on },
  );
  b.part(new THREE.ConeGeometry(0.03, 0.03, 4), STEEL_LIGHT, { ...on, at: [0, 0.2, 0.067], dir: [0, 0.3, 1], flat: true });
  b.part(new THREE.ConeGeometry(0.03, 0.03, 4), STEEL_LIGHT, { ...on, at: [0, 0.2, -0.067], dir: [0, 0.3, -1], flat: true });
  b.part(new THREE.ConeGeometry(0.03, 0.03, 4), STEEL_LIGHT, { ...on, at: [0.067, 0.2, 0], dir: [1, 0.3, 0], flat: true });
  b.part(new THREE.ConeGeometry(0.03, 0.03, 4), STEEL_LIGHT, { ...on, at: [-0.067, 0.2, 0], dir: [-1, 0.3, 0], flat: true });

  // ---- haft ---------------------------------------------------------------
  b.sweep(
    [
      [0, 0.2, 0],
      [0, 0.9, 0],
    ],
    [0.03, 0.026],
    { color: WOOD, caps: "flat", sides: 8, ...on },
  );
  // leather wrap
  for (let i = 0; i < 9; i++) {
    b.part(new THREE.TorusGeometry(0.033, 0.0075, 4, 10), LEATHER, {
      ...on,
      at: [0, 0.3 + i * 0.027, 0],
      rotation: [90 + 14, 0, 0],
    });
  }
  b.part(new THREE.CylinderGeometry(0.031, 0.031, 0.25, 8), LEATHER, { ...on, at: [0, 0.42, 0] });
  // steel bands with studs
  const bands = [0.27, 0.565, 0.72];
  for (const y of bands) {
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.035, 6), STEEL, { ...on, at: [0, y, 0], flat: true });
    b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.006, 6), STEEL_LIGHT, { ...on, at: [0, y + 0.018, 0], flat: true });
    b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.006, 6), STEEL_DARK, { ...on, at: [0, y - 0.018, 0], flat: true });
    b.part(new THREE.ConeGeometry(0.016, 0.02, 4), STEEL_LIGHT, { ...on, at: [0, y, 0.054], dir: [0, 0, 1], flat: true });
    b.part(new THREE.ConeGeometry(0.016, 0.02, 4), STEEL_LIGHT, { ...on, at: [0, y, -0.054], dir: [0, 0, -1], flat: true });
  }
  // carved glowing runes on the haft
  for (const [y, s] of [
    [0.64, 1],
    [0.8, -1],
  ] as const) {
    glow(
      b.part(new THREE.PlaneGeometry(0.03, 0.04), "#ffffff", {
        ...on,
        at: [0, y, s * 0.0285],
        dir: [0, 0, s],
        axis: "z",
        texture: SMALL_RUNE,
      }),
      1.2,
    );
  }

  // ---- socket / head mount -------------------------------------------------
  b.part(new THREE.BoxGeometry(0.115, 0.2, 0.115), STEEL, { ...on, at: [0, 0.94, 0] });
  b.part(new THREE.BoxGeometry(0.125, 0.03, 0.125), STEEL_LIGHT, { ...on, at: [0, 1.055, 0] });
  b.part(new THREE.BoxGeometry(0.125, 0.03, 0.125), STEEL_DARK, { ...on, at: [0, 0.83, 0] });
  b.part(new THREE.ConeGeometry(0.02, 0.025, 4), STEEL_LIGHT, { ...on, at: [0, 0.94, 0.06], dir: [0, 0, 1], flat: true });
  b.part(new THREE.ConeGeometry(0.02, 0.025, 4), STEEL_LIGHT, { ...on, at: [0, 0.94, -0.06], dir: [0, 0, -1], flat: true });
  b.part(new THREE.ConeGeometry(0.02, 0.025, 4), STEEL_LIGHT, { ...on, at: [-0.06, 0.94, 0], dir: [-1, 0, 0], flat: true });
  b.lathe(
    [
      [0, 0],
      [0.07, 0],
      [0.07, 0.015],
      [0.05, 0.03],
      [0, 0.03],
    ],
    { at: [0, 1.07, 0], segments: 8, color: STEEL, ...on },
  );
  // frost crystal on the poll
  glow(
    b.part(new THREE.OctahedronGeometry(0.05), CRYSTAL, {
      ...on,
      at: [0, 1.15, 0],
      scale: [1, 1.8, 1],
      flat: true,
    }),
    1.3,
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.03), "#c9f4ff", {
      ...on,
      at: [0.04, 1.12, 0.025],
      scale: [0.8, 1.5, 0.8],
      rotation: [0, 30, 14],
      flat: true,
    }),
    1.4,
  );
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    b.part(new THREE.ConeGeometry(0.014, 0.065, 4), STEEL_LIGHT, {
      ...on,
      at: [Math.sin(a) * 0.065, 1.1, Math.cos(a) * 0.065],
      dir: [Math.sin(a) * 0.35, 1, Math.cos(a) * 0.35],
      flat: true,
    });
  }

  // ---- back spike and ice horn on the -X side -------------------------------
  b.spike([-0.04, 0.95, 0], [-1, 0.12, 0], 0.26, 0.045, STEEL, { sides: 4, ...on });
  b.spike([-0.09, 0.95, 0], [-1, 0.12, 0], 0.17, 0.028, STEEL_LIGHT, { sides: 4, ...on });
  b.part(new THREE.BoxGeometry(0.06, 0.1, 0.1), STEEL_LIGHT, { ...on, at: [-0.07, 0.95, 0], flat: true });
  b.part(new THREE.ConeGeometry(0.03, 0.14, 5), ICE_DEEP, {
    ...on,
    at: [-0.12, 1.05, 0],
    dir: [-0.6, 1, 0],
    flat: true,
  });

  // ---- blade ---------------------------------------------------------------
  const steelPlate: OutlinePoint[] = [
    [0.05, 1.0],
    [0.14, 1.06],
    [0.28, 1.14, "sharp"],
    [0.36, 1.02],
    [0.4, 0.88],
    [0.38, 0.74],
    [0.36, 0.62, "sharp"],
    [0.26, 0.68],
    [0.17, 0.76],
    [0.12, 0.86],
    [0.05, 0.9],
  ];
  const icePlate: OutlinePoint[] = [
    [0.18, 1.06],
    [0.24, 1.16],
    [0.31, 1.24, "sharp"],
    [0.37, 1.13],
    [0.47, 1.15, "sharp"],
    [0.47, 1.03],
    [0.56, 0.99, "sharp"],
    [0.5, 0.89],
    [0.58, 0.79, "sharp"],
    [0.48, 0.73],
    [0.51, 0.6, "sharp"],
    [0.4, 0.63],
    [0.31, 0.6, "sharp"],
    [0.27, 0.68],
    [0.19, 0.75],
    [0.14, 0.84],
    [0.14, 0.95],
  ];
  b.extrude(icePlate, { at: [0, 0, 0], x: [1, 0, 0], thickness: 0.034, bevel: 0.006, color: ICE, ...on });
  // inner deeper ice core stripes (thin facets along the edge)
  b.extrude(
    [
      [0.42, 1.0],
      [0.5, 0.96],
      [0.46, 0.85],
      [0.53, 0.78],
      [0.45, 0.72],
      [0.44, 0.84],
      [0.39, 0.92],
    ],
    { at: [0, 0, 0], x: [1, 0, 0], thickness: 0.044, bevel: 0.006, color: ICE_DEEP, ...on },
  );
  b.extrude(steelPlate, { at: [0, 0, 0], x: [1, 0, 0], thickness: 0.056, bevel: 0.008, color: STEEL, ...on });
  // raised steel rim along the top horn and toe
  b.extrude(
    [
      [0.05, 1.0],
      [0.14, 1.06],
      [0.28, 1.14, "sharp"],
      [0.25, 1.06],
      [0.14, 1.0],
      [0.05, 0.95],
    ],
    { at: [0, 0, 0], x: [1, 0, 0], thickness: 0.068, bevel: 0.008, color: STEEL_LIGHT, ...on },
  );
  b.extrude(
    [
      [0.36, 0.62, "sharp"],
      [0.26, 0.68],
      [0.17, 0.76],
      [0.12, 0.86],
      [0.16, 0.86],
      [0.2, 0.78],
      [0.28, 0.71],
      [0.34, 0.67],
    ],
    { at: [0, 0, 0], x: [1, 0, 0], thickness: 0.068, bevel: 0.008, color: STEEL_LIGHT, ...on },
  );
  // dark inset panel
  b.extrude(
    [
      [0.14, 0.95],
      [0.24, 1.04],
      [0.31, 1.0],
      [0.34, 0.88],
      [0.32, 0.76],
      [0.24, 0.78],
      [0.16, 0.86],
    ],
    { at: [0, 0, 0], x: [1, 0, 0], thickness: 0.062, bevel: 0.004, color: STEEL_DARK, ...on },
  );
  // glowing runes both faces
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.17, 0.2), "#ffffff", {
        ...on,
        at: [0.23, 0.895, s * 0.0325],
        dir: [0, 0, s],
        axis: "z",
        texture: RUNE,
      }),
      1.3,
    );
    // rivets
    for (const [x, y] of [
      [0.12, 0.99],
      [0.31, 1.06],
      [0.36, 0.84],
      [0.3, 0.68],
      [0.15, 0.82],
    ] as const) {
      b.part(new THREE.SphereGeometry(0.01, 5, 4), STEEL_LIGHT, { ...on, at: [x, y, s * 0.033] });
    }
  }
  // ice spikes along the edge
  const shards: Array<[number, number, number, number, number]> = [
    [0.31, 1.2, 0.2, 1, 0.07],
    [0.45, 1.12, 0.5, 0.9, 0.06],
    [0.54, 0.98, 1, 0.3, 0.06],
    [0.56, 0.8, 1, -0.1, 0.07],
    [0.5, 0.65, 0.6, -0.8, 0.06],
    [0.36, 0.6, 0, -1, 0.06],
  ];
  for (const [x, y, dx, dy, l] of shards) {
    for (const s of [1, -1]) {
      b.part(new THREE.ConeGeometry(0.014, l, 4), ICE, {
        ...on,
        at: [x, y, s * 0.014],
        dir: [dx, dy, s * 0.35],
        flat: true,
      });
    }
  }
  // frost cracks / edge bright line
  b.rod([0.31, 1.24, 0], [0.37, 1.13, 0], 0.006, "#eafaff", { ...on, caps: "flat" });
  b.rod([0.47, 1.15, 0], [0.47, 1.03, 0], 0.006, "#eafaff", { ...on, caps: "flat" });
  b.rod([0.56, 0.99, 0], [0.5, 0.89, 0], 0.006, "#eafaff", { ...on, caps: "flat" });
  b.rod([0.58, 0.79, 0], [0.48, 0.73, 0], 0.006, "#eafaff", { ...on, caps: "flat" });
  b.rod([0.51, 0.6, 0], [0.4, 0.63, 0], 0.006, "#eafaff", { ...on, caps: "flat" });
  // ink line under blade horn for LoL contrast
  b.rod([0.05, 0.9, 0], [0.12, 0.86, 0], 0.006, INK, { ...on, caps: "flat" });

  // tassel of frozen cord on the grip
  glow(
    b.part(new THREE.SphereGeometry(0.012, 5, 4), RUNE_GLOW, { ...on, at: [0.05, 0.57, 0.02] }),
    1.2,
  );
  b.rod([0.045, 0.57, 0.02], [0.06, 0.45, 0.03], 0.005, LEATHER, { ...on, caps: "flat" });

  return b.root;
}
