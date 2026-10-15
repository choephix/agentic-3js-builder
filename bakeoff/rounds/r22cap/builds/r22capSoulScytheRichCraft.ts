import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { gradient, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A towering dragonbone scythe on a clawed rune plinth: vertebra shaft, skull crown, caged soul orb and a spectral glowing blade.",
  style: "League of Legends",
  commit: "88fc1f0",
};

const BONE = cel("#f1e8d2", "#a98fb8");
const BONE_FLAT = "#e9dfc6";
const BONE_DK = "#b9a98c";
const VIOLET = "#3b2166";
const VIOLET_L = cel("#5b34a0", "#2a1450");
const GOLD = cel("#f2c14e", "#b9731f");
const CYAN = "#46f0ff";
const CYAN_D = "#12a9d6";
const STONE = cel("#4a3f6b", "#261f3d");

const RUNES = svg(
  `<svg viewBox="0 0 100 20"><g fill="none" stroke="#7ffbff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
  <path d="M6 3 L6 17 M6 8 L14 3 M6 12 L14 7"/><path d="M22 3 L30 10 L22 17 M30 3 L30 17"/>
  <path d="M40 17 L44 3 L48 17 M41.5 12 L46.5 12"/><path d="M56 3 L56 17 M56 3 L64 3 L56 10 L64 17"/>
  <path d="M72 10 L78 3 L84 10 L78 17 Z"/><path d="M92 3 L92 17 M88 8 L96 12"/></g></svg>`,
  { size: 384 },
);

const SPARK = svg(
  `<svg viewBox="0 0 32 32"><path d="M16 1 L19 13 L31 16 L19 19 L16 31 L13 19 L1 16 L13 13 Z" fill="#9ffcff"/></svg>`,
  { size: 64 },
);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "soulScythe" });
  const TAU = Math.PI * 2;

  // ---------- plinth ----------
  b.lathe(
    [
      [0, 0],
      [0.34, 0],
      [0.34, 0.05],
      [0.28, 0.09],
      [0.24, 0.17],
      [0, 0.17],
    ],
    { at: [0, 0, 0], segments: 8, spin: 22, color: STONE },
  );
  b.lathe(
    [
      [0, 0.17],
      [0.2, 0.17],
      [0.2, 0.185],
      [0.12, 0.2],
      [0, 0.2],
    ],
    { at: [0, 0, 0], segments: 8, color: VIOLET_L },
  );
  // gold trim ring on plinth
  const trim: number[][] = [];
  for (let i = 0; i < 8; i++) trim.push([Math.cos((i / 8) * TAU) * 0.325, 0.055, Math.sin((i / 8) * TAU) * 0.325]);
  b.sweep(trim, 0.012, { closed: true, color: GOLD, section: { ngon: 4 } });
  // glowing rune ring
  const ring: number[][] = [];
  for (let i = 0; i < 16; i++) ring.push([Math.cos((i / 16) * TAU) * 0.17, 0.2, Math.sin((i / 16) * TAU) * 0.17]);
  glow(b.sweep(ring, 0.007, { closed: true, color: CYAN, sides: 4 }), 1.4);
  for (let i = 0; i < 8; i++) {
    const a = ((i + 0.5) / 8) * TAU;
    glow(
      b.part(new THREE.OctahedronGeometry(0.018, 0), CYAN, {
        at: [Math.cos(a) * 0.29, 0.1, Math.sin(a) * 0.29],
        dir: [Math.cos(a), 0.2, Math.sin(a)],
      }),
      1.3,
    );
  }
  // dragon claws clutching the shaft
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + 0.4;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    b.sweep(
      [
        [ca * 0.2, 0.19, sa * 0.2],
        [ca * 0.17, 0.3, sa * 0.17],
        [ca * 0.09, 0.4, sa * 0.09],
        [ca * 0.04, 0.37, sa * 0.04],
      ],
      [0.03, 0.004],
      { color: BONE, caps: { start: "round", end: "point" }, sides: 6 },
    );
    b.sweep(
      [
        [ca * 0.2, 0.19, sa * 0.2],
        [ca * 0.19, 0.25, sa * 0.19],
      ],
      0.036,
      { color: BONE_DK, sides: 6 },
    );
  }

  // ---------- shaft ----------
  const shaft = b.rod([0, 0.19, 0], [0, 1.9, 0], 0.024, {
    color: paint((p, n, s) => {
      void n;
      void s;
      return Math.sin(p.y * 90) > 0.55 ? "#6a43b8" : VIOLET;
    }),
    sides: 8,
  });
  void shaft;
  // vertebrae with back spines
  for (let k = 0; k < 14; k++) {
    const y = 0.45 + k * 0.075;
    b.part(new THREE.CylinderGeometry(0.036, 0.04, 0.05, 7), k % 2 ? BONE : BONE, { at: [0, y, 0] });
    b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.012, 7), BONE_DK, { at: [0, y + 0.03, 0] });
    b.spike([0, y, -0.03], [0, 0.35, -1], 0.07, 0.013, BONE_FLAT, { sides: 5 });
    for (const s of [1, -1]) b.spike([s * 0.03, y, 0], [s, 0.2, 0], 0.045, 0.01, BONE_FLAT, { sides: 5 });
  }
  // cloth grip wrap
  for (let k = 0; k < 6; k++) {
    b.part(new THREE.CylinderGeometry(0.031, 0.031, 0.03, 8), k % 2 ? "#7e2fd0" : "#3a1c6e", { at: [0, 0.3 + k * 0.03, 0] });
  }
  // gold collars
  for (const y of [0.28, 0.5, 1.5, 1.88]) {
    b.part(new THREE.CylinderGeometry(0.044, 0.044, 0.02, 8), GOLD, { at: [0, y, 0] });
  }

  // ---------- soul cage ----------
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    b.sweep(
      [
        [ca * 0.035, 1.53, sa * 0.035],
        [ca * 0.1, 1.62, sa * 0.1],
        [ca * 0.115, 1.72, sa * 0.115],
        [ca * 0.1, 1.82, sa * 0.1],
        [ca * 0.035, 1.9, sa * 0.035],
      ],
      [0.016, 0.01, 0.006],
      { color: BONE, sides: 5, caps: "round" },
    );
    b.spike([ca * 0.112, 1.72, sa * 0.112], [ca, 0.3, sa], 0.055, 0.011, BONE_FLAT, { sides: 5 });
  }
  glow(b.part(new THREE.IcosahedronGeometry(0.065, 1), CYAN, { at: [0, 1.71, 0] }), 1.6);
  glow(b.part(new THREE.IcosahedronGeometry(0.036, 0), "#e8ffff", { at: [0, 1.71, 0] }), 1.8);
  glow(
    b.cards([0, 1, 2, 3].map((i) => ({ at: [0.0, 1.71, 0.0], axis: [Math.sin(i * 1.57), 0.2, Math.cos(i * 1.57)] }) as never), SPARK, {
      size: 0.14,
    }),
    1.2,
  );

  // pennant tied under the cage
  b.extrude(
    [
      [-0.06, 0],
      [0.06, 0],
      [0.06, -0.22],
      [0.02, -0.19, "sharp"],
      [0, -0.3, "sharp"],
      [-0.02, -0.19, "sharp"],
      [-0.06, -0.22],
    ],
    {
      at: [0, 1.5, 0.045],
      x: [1, 0, 0],
      thickness: 0.008,
      bevel: 0.002,
      color: paint((_p, _n, s) => (Math.abs(s[0]) < 0.012 ? CYAN_D : s[1] > -0.025 ? "#f2c14e" : "#6a2fc0")),
    },
  );

  // ---------- skull crown ----------
  const SC: [number, number, number] = [0, 1.965, 0.03];
  b.part(new THREE.SphereGeometry(1, 8, 6), BONE, { at: SC, scale: [0.065, 0.055, 0.09] });
  b.frustumBox([0, 1.955, 0.09], [0, 1.935, 0.23], [0.085, 0.06], [0.05, 0.035], { color: BONE });
  b.frustumBox([0, 1.915, 0.09], [0, 1.9, 0.2], [0.07, 0.025], [0.04, 0.02], { color: BONE_DK });
  b.part(new THREE.SphereGeometry(0.014, 5, 4), INK, { at: [0.012, 1.945, 0.235] });
  b.part(new THREE.SphereGeometry(0.014, 5, 4), INK, { at: [-0.012, 1.945, 0.235] });
  for (const s of [1, -1]) {
    glow(b.part(new THREE.SphereGeometry(0.018, 6, 4), CYAN, { at: [s * 0.04, 1.98, 0.095] }), 1.7);
    b.part(new THREE.BoxGeometry(0.05, 0.012, 0.03), BONE_DK, { at: [s * 0.04, 2.005, 0.1], rotation: [0, 0, -s * 14] });
    // horns
    b.sweep(
      [
        [s * 0.04, 1.99, -0.02],
        [s * 0.1, 2.04, -0.09],
        [s * 0.17, 2.05, -0.18],
        [s * 0.22, 2.1, -0.24],
      ],
      [0.022, 0.002],
      { color: BONE, sides: 6, caps: { start: "round", end: "point" } },
    );
    for (let i = 0; i < 5; i++) {
      b.spike([s * 0.026, 1.916, 0.11 + i * 0.026], [0, -1, 0], 0.03, 0.006, "#fffaf0", { sides: 4 });
    }
    // cheek frills
    b.spike([s * 0.055, 1.95, 0.0], [s, 0.1, -0.5], 0.1, 0.014, BONE_DK, { sides: 5 });
  }

  // ---------- blade ----------
  const OX = 0.045;
  const OY = 1.93;
  const P = (x: number, y: number, z = 0): [number, number, number] => [OX + x, OY + y, z];
  b.extrude(
    [
      [0, 0.05],
      [0.25, 0.14],
      [0.55, 0.12],
      [0.85, -0.02],
      [1.08, -0.3, "sharp"],
      [0.8, -0.12],
      [0.55, -0.02],
      [0.25, -0.03],
      [0, -0.05],
    ],
    {
      at: P(0, 0),
      x: [1, 0, 0],
      thickness: 0.028,
      bevel: 0.007,
      color: gradient(BONE, VIOLET_L, P(0.1, 0), P(1.05, -0.28)),
    },
  );
  // spectral edge
  glow(
    b.sweep(
      [P(0.08, -0.062), P(0.3, -0.045), P(0.55, -0.032), P(0.78, -0.13), P(0.98, -0.27)],
      [0.01, 0.003],
      { color: CYAN, sides: 5, caps: "point" },
    ),
    1.5,
  );
  // soul-fire inner fringe
  b.sweep([P(0.1, -0.085), P(0.35, -0.075), P(0.6, -0.07), P(0.8, -0.18), P(0.96, -0.3)], [0.006, 0.002], {
    color: CYAN_D,
    sides: 4,
    caps: "point",
  });
  // top-edge bone spines
  for (const [x, y, len] of [
    [0.22, 0.14, 0.09],
    [0.38, 0.15, 0.1],
    [0.54, 0.13, 0.1],
    [0.7, 0.07, 0.09],
    [0.86, -0.03, 0.08],
  ] as const) {
    b.spike(P(x, y), [0.5, 1, 0], len, 0.016, BONE_FLAT, { sides: 5 });
  }
  // gold spine rivets along blade
  for (let i = 0; i < 6; i++) {
    const x = 0.1 + i * 0.12;
    const y = 0.05 + (i > 3 ? -0.04 * (i - 3) : 0) + 0.02;
    for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.009, 5, 4), GOLD, { at: P(x, y * 0.6, s * 0.016) });
  }
  // blade root clamp to skull
  b.part(new THREE.BoxGeometry(0.09, 0.15, 0.06), GOLD, { at: P(0.0, 0.0) });
  b.part(new THREE.BoxGeometry(0.06, 0.1, 0.075), BONE_DK, { at: P(0.01, 0.0) });
  // rune strips both faces
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.46, 0.092), "#ffffff", {
        at: P(0.4, 0.045, s * 0.0165),
        dir: [0, 0, s],
        axis: "z",
        up: [0, 1, 0],
        texture: RUNES,
        rotation: undefined,
      }),
      1.3,
    );
  }

  // ---------- trailing soul wisps ----------
  const wisps: Array<{ at: [number, number, number]; axis: [number, number, number] }> = [];
  for (let i = 0; i < 7; i++) {
    wisps.push({ at: P(0.55 + i * 0.07, -0.1 - i * 0.03, (i % 2 ? 1 : -1) * 0.03), axis: [0, -1, 0] });
  }
  glow(b.cards(wisps as never, SPARK, { size: 0.06, lean: 20, flow: [0, 0, 1], cross: true }), 1.2);

  return b.root;
}
