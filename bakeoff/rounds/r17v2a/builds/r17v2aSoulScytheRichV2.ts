import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { bezier, catmull, polyline } from "../../../../src/path";
import { cells, mottle, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A man-high reaper's scythe: the snath is a dragon's spine, a horned dragon skull clamps a cracked-bone blade with a spectral cutting edge, and a soul-lantern cage and wisps float around it, standing on a runed plinth.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: ivory dragonbone, violet-black iron, wine leather, gold trim, one strong spectral teal accent.
const BONE = cel("#f4ead2", "#a995bd");
const BONE_DK = cel("#d9c6a2", "#8d78a6");
const CRACK = "#9c869f";
const BONE_BASE = mottle("#f5ecd4", "#e6d6b3", { size: 0.14, seed: 2, contrast: 1.2 });
const BLADE_BONE = cel(
  paint((p) => {
    const c = cells(p, 0.2, 5);
    return c.d2 - c.d1 < 0.03 ? CRACK : BONE_BASE;
  }),
);
const IRON = cel("#3a3157", "#1b1430");
const STONE = cel("#51487a", "#2a2347");
const GOLD = cel("#ffd35a", "#b8651f");
const LEATHER = cel(
  paint((_p, _n, s) => (((s[1] - 2160 * s[0]) % 90) + 90) % 90 < 24 ? "#3b1a3c" : "#7a2f62"),
  "#33122f",
);
const HORN = cel(
  paint((_p, _n, s) => {
    if (s[0] > 0.78) return "#4b3d78";
    return (s[0] * 22) % 1 < 0.16 ? "#cdb995" : "#f4ead2";
  }),
);
const TEAL = "#3ff5c6";
const MINT = "#d2fff3";
const TEAL_DK = "#127a67";
const EYE = "#a6fff0";

// ---------------------------------------------------------------------------------------------------------------
// Drawings
const GLYPHS = [
  svg(
    `<svg viewBox="0 0 40 40"><g fill="none" stroke="${TEAL}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4 V36 M10 12 H30 M12 29 L20 22 L28 29"/></g></svg>`,
    { size: 128 },
  ),
  svg(
    `<svg viewBox="0 0 40 40"><g fill="none" stroke="${TEAL}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 V35 M11 20 L29 8 M11 20 L29 33"/><circle cx="31" cy="20" r="2.5"/></g></svg>`,
    { size: 128 },
  ),
  svg(
    `<svg viewBox="0 0 40 40"><g fill="none" stroke="${TEAL}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4 L34 20 L20 36 L6 20 Z M20 13 V27"/></g></svg>`,
    { size: 128 },
  ),
];

const WISP = svg(
  `<svg viewBox="0 0 40 64">
<path d="M20 2 C26 18 38 28 36 44 C35 56 28 62 20 62 C12 62 5 56 4 44 C2 28 14 18 20 2 Z" fill="${TEAL}"/>
<path d="M20 22 C24 32 31 38 30 47 C29 54 25 58 20 58 C15 58 11 54 10 47 C9 38 16 32 20 22 Z" fill="${MINT}"/>
<ellipse cx="15" cy="44" rx="2.6" ry="4.2" fill="${TEAL_DK}"/><ellipse cx="25" cy="44" rx="2.6" ry="4.2" fill="${TEAL_DK}"/>
<ellipse cx="20" cy="53" rx="2.6" ry="3" fill="${TEAL_DK}"/></svg>`,
  { size: 128 },
);
const FLAME = svg(
  `<svg viewBox="0 0 40 64"><path d="M20 2 C27 18 37 30 34 46 C32 57 26 62 20 62 C14 62 8 57 6 46 C3 30 13 18 20 2 Z" fill="${TEAL}"/>
<path d="M20 26 C24 36 29 42 28 50 C27 56 24 59 20 59 C16 59 13 56 12 50 C11 42 16 36 20 26 Z" fill="${MINT}"/></svg>`,
  { size: 96 },
);
const BANNER = svg(
  `<svg viewBox="0 0 40 120">
<path d="M2 0 H38 V100 L33 120 L28 98 L22 116 L16 94 L9 118 L2 96 Z" fill="#4b2a78"/>
<path d="M2 0 H38 V9 H2 Z" fill="#ffd35a"/><path d="M2 9 H38 V13 H2 Z" fill="#b8651f"/>
<path d="M18 13 H22 V92 H18 Z" fill="#ffd35a"/>
<path d="M20 28 L28 42 L20 56 L12 42 Z" fill="#1b1430"/><path d="M20 33 L25 42 L20 51 L15 42 Z" fill="${TEAL}"/>
<path d="M4 70 H14 M26 70 H36 M5 78 H13 M27 78 H35" stroke="#ffd35a" stroke-width="2" stroke-linecap="round" fill="none"/>
<path d="M2 96 L9 118 L16 94 L22 116 L28 98 L33 120 L38 100" fill="none" stroke="${TEAL}" stroke-width="2.2" stroke-linejoin="round"/></svg>`,
  { size: 256 },
);
const RUNE_RING = svg(
  `<svg viewBox="0 0 200 200"><g fill="none" stroke="${TEAL}" stroke-linecap="round" stroke-linejoin="round">
<circle cx="100" cy="100" r="96" stroke-width="3"/><circle cx="100" cy="100" r="72" stroke-width="2.4"/>
<circle cx="100" cy="100" r="34" stroke-width="2.4"/>
<path stroke-width="2.4" d="M100 4 V28 M100 172 V196 M4 100 H28 M172 100 H196 M32 32 L48 48 M152 152 L168 168 M168 32 L152 48 M32 168 L48 152"/>
<path stroke-width="2.4" d="M100 40 L152 130 L48 130 Z M100 160 L48 70 L152 70 Z"/>
<path stroke-width="3" d="M96 80 V120 M104 80 V120 M88 100 H112"/>
<path stroke-width="2.6" d="M100 76 L109 70 M60 100 L52 94 M140 100 L148 94 M100 124 L109 130"/></g></svg>`,
  { size: 1024 },
);
const ORB_FACE = svg(
  `<svg viewBox="0 0 200 100"><rect width="200" height="100" fill="#26d9a9"/>
<g fill="none" stroke="#9affe0" stroke-width="3" stroke-linecap="round"><path d="M0 20 C40 4 60 36 100 16 C140 -4 160 30 200 14"/><path d="M0 80 C40 66 60 94 100 74 C140 56 160 88 200 72"/><path d="M0 50 C30 40 50 62 80 52 M120 52 C150 62 170 40 200 50"/></g>
<ellipse cx="86" cy="42" rx="5.5" ry="9" fill="${TEAL_DK}"/><ellipse cx="114" cy="42" rx="5.5" ry="9" fill="${TEAL_DK}"/>
<ellipse cx="100" cy="68" rx="5" ry="9.5" fill="${TEAL_DK}"/><circle cx="84" cy="38" r="2" fill="#e8fff8"/><circle cx="112" cy="38" r="2" fill="#e8fff8"/></svg>`,
  { size: 256 },
);

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "soulScythe", paintSize: 1024 });
  const r = rng(11);
  const root = b.joint("scythe", { at: [0, 0.12, 0] });
  const jaw = b.joint("jaw", { parent: root, at: [0.04, 1.88, 0], aim: [0.4, 1.79, 0], role: "jaw" });
  const R = { bone: root };

  // ------------------------------------------------------------------------------------------------ plinth
  b.lathe(
    [
      [0, 0],
      [0.48, 0],
      [0.48, 0.03],
      [0.44, 0.045],
      [0.44, 0.09],
      [0.38, 0.115],
      [0, 0.115],
    ],
    { at: [0, 0, 0], segments: 14, color: STONE, ...R, name: "plinth" },
  );
  b.lathe(
    [
      [0.405, 0.1],
      [0.43, 0.088],
      [0.45, 0.088],
      [0.45, 0.1],
      [0.43, 0.108],
    ],
    { at: [0, 0, 0], segments: 28, color: GOLD, ...R, name: "plinthTrim" },
  );
  glow(
    b.part(new THREE.CircleGeometry(0.38, 40), "#ffffff", {
      at: [0, 0.119, 0],
      dir: [0, 1, 0],
      axis: "z",
      texture: RUNE_RING,
      ...R,
      name: "runeRing",
    }),
    1.2,
  );
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.15;
    const c = Math.cos(a);
    const s = Math.sin(a);
    b.spike([0.42 * c, 0.07, 0.42 * s], [c * 0.35, 1, s * 0.35], i % 2 ? 0.14 : 0.2, 0.034, { color: BONE, ...R });
    b.part(new THREE.CylinderGeometry(0.05, 0.06, 0.05, 6), IRON, { at: [0.435 * c, 0.065, 0.435 * s], ...R });
  }

  // gem pommel gripped by talons
  glow(b.part(new THREE.SphereGeometry(0.052, 8, 6), TEAL, { at: [0, 0.25, 0], ...R, flat: true, name: "pommelGem" }), 1.4);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const pt = (rad: number, y: number): V => [rad * c, y, rad * s];
    b.sweep(catmull([pt(0.14, 0.11), pt(0.11, 0.2), pt(0.078, 0.31), pt(0.04, 0.44)]), [0.032, 0.004], {
      color: BONE,
      caps: { start: "flat", end: "point" },
      sides: 6,
      ...R,
    });
  }

  // ------------------------------------------------------------------------------------------------ snath
  b.rod([0, 0.3, 0], [0, 1.86, 0], 0.021, { color: IRON, sides: 8, ...R, name: "core" });

  const ring = (y: number, rad: number, h = 0.026, color = GOLD) =>
    b.lathe(
      [
        [rad - 0.012, -h / 2],
        [rad + 0.006, -h / 2 + 0.005],
        [rad + 0.006, h / 2 - 0.005],
        [rad - 0.012, h / 2],
      ],
      { at: [0, y, 0], segments: 10, color, ...R, name: "ring" },
    );

  const vertebra = (y: number, rad: number, h: number, big = 1) => {
    b.lathe(
      [
        [0, -h / 2],
        [rad, -h / 2],
        [rad * 0.72, -h * 0.2],
        [rad * 0.72, h * 0.2],
        [rad, h / 2],
        [0, h / 2],
      ],
      { at: [0, y, 0], segments: 8, color: BONE, ...R, name: "vertebra" },
    );
    b.spike([-rad * 0.55, y + 0.004, 0], [-1, 0.4, 0], 0.075 * big, 0.014, { color: BONE, ...R, sides: 5 });
    for (const s of [1, -1]) b.spike([0, y, s * rad * 0.6], [0, -0.25, s], 0.06 * big, 0.011, { color: BONE_DK, ...R, sides: 5 });
    glow(
      b.part(new THREE.CylinderGeometry(rad * 0.82, rad * 0.82, 0.02, 8), TEAL, { at: [0, y + h / 2 + 0.009, 0], ...R, name: "soulGap" }),
      1,
    );
  };

  // lower vertebrae
  ring(0.43, 0.04);
  vertebra(0.5, 0.034, 0.05, 0.8);
  vertebra(0.575, 0.036, 0.05, 0.9);
  ring(0.628, 0.04);
  // lower grip
  b.rod([0, 0.64, 0], [0, 0.9, 0], 0.036, { color: LEATHER, sides: 10, ...R, name: "gripLow" });
  ring(0.912, 0.044, 0.03);
  for (const y of [0.675, 0.865]) ring(y, 0.039, 0.012, IRON);
  // mid vertebrae
  [0.98, 1.055, 1.13, 1.205].forEach((y, i) => vertebra(y, 0.038 + i * 0.002, 0.055, 1 + i * 0.1));
  ring(1.265, 0.044, 0.03);
  // upper bone grip band
  b.rod([0, 1.282, 0], [0, 1.3, 0], 0.042, { color: IRON, sides: 8, ...R });

  // soul cage: six dragon ribs round a glowing soul
  const CY = 1.52;
  ring(1.31, 0.052, 0.034);
  ring(1.73, 0.052, 0.034);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const pt = (rad: number, y: number): V => [rad * c, y, rad * s];
    b.sweep(catmull([pt(0.05, 1.32), pt(0.12, CY - 0.13), pt(0.148, CY), pt(0.12, CY + 0.13), pt(0.05, 1.72)]), (t) => 0.019 * (0.55 + 0.45 * Math.sin(Math.PI * t)), {
      color: BONE,
      sides: 6,
      ...R,
      name: "rib",
    });
    b.spike(pt(0.15, CY), [c, 0.35, s], 0.07, 0.016, { color: BONE_DK, ...R, sides: 5 });
    b.part(new THREE.SphereGeometry(0.014, 5, 4), GOLD, { at: pt(0.162, CY + 0.07), ...R });
    b.part(new THREE.SphereGeometry(0.014, 5, 4), GOLD, { at: pt(0.162, CY - 0.07), ...R });
  }
  const eq: V[] = [];
  for (let i = 0; i < 12; i++) eq.push([0.156 * Math.cos((i / 12) * Math.PI * 2), CY, 0.156 * Math.sin((i / 12) * Math.PI * 2)]);
  b.sweep(catmull(eq, { closed: true }), 0.011, { color: GOLD, sides: 5, ...R, name: "cageBand" });
  glow(
    b.part(new THREE.SphereGeometry(0.098, 12, 8), "#ffffff", {
      at: [0, CY, 0],
      rotation: [0, -90, 0],
      texture: ORB_FACE,
      ...R,
      name: "soulOrb",
    }),
    1.3,
  );

  // ------------------------------------------------------------------------------------------------ dragon skull
  ring(1.805, 0.054, 0.036);
  b.part(new THREE.SphereGeometry(1, 10, 7), BONE, { at: [0.02, 2.0, 0], scale: [0.17, 0.122, 0.126], ...R, flat: true, name: "cranium" });
  b.part(new THREE.CylinderGeometry(0.045, 0.07, 0.1, 8), BONE_DK, { at: [-0.03, 1.87, 0], ...R, flat: true, name: "neckCone" });
  // upper snout (box section: rx across, ry up)
  b.sweep(polyline([[0.05, 2.03, 0], [0.42, 2.01, 0]]), (t) => [0.078 - 0.034 * t, 0.054 - 0.022 * t], {
    section: "box",
    caps: "flat",
    color: BONE,
    ...R,
    name: "snout",
  });
  b.part(new THREE.BoxGeometry(0.06, 0.03, 0.1), BONE_DK, { at: [0.06, 2.08, 0], ...R, name: "snoutBridge" });
  // lower jaw
  b.sweep(polyline([[0.05, 1.86, 0], [0.4, 1.78, 0]]), (t) => [0.072 - 0.034 * t, 0.03 - 0.006 * t], {
    section: "box",
    caps: "flat",
    color: BONE,
    bone: jaw,
    name: "lowerJaw",
  });
  b.part(new THREE.BoxGeometry(0.1, 0.03, 0.14), BONE_DK, { at: [0.0, 1.85, 0], bone: jaw, name: "jawBase" });
  // teeth
  for (let i = 0; i < 7; i++) {
    const x = 0.15 + i * 0.04;
    const tl = i === 6 ? 0.075 : 0.034;
    const jy = 1.888 - 0.08 * ((x - 0.05) / 0.35);
    for (const s of [1, -1]) {
      const rx = 0.078 - 0.034 * ((x - 0.05) / 0.37);
      b.spike([x, 1.985, s * (rx - 0.012)], [0.1, -1, 0], tl, 0.01, { color: MINT, ...R, sides: 5 });
      b.spike([x + 0.012, jy - 0.002, s * (rx - 0.012 - 0.018)], [0, 1, 0], tl * 0.9, 0.009, { color: MINT, bone: jaw, sides: 5 });
    }
  }
  // eyes and brow
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.042, 7, 5), IRON, { at: [0.115, 2.045, s * 0.093], ...R, flat: true });
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), EYE, { at: [0.13, 2.05, s * 0.1], ...R, flat: true, name: "eye" }), 1.6);
    b.spike([0.07, 2.085, s * 0.075], [0.7, 0.35, s * 0.5], 0.14, 0.026, { color: BONE_DK, ...R, sides: 6 });
    // horns
    const horn = bezier([-0.03, 2.07, s * 0.08], [-0.26, 2.06, s * 0.21], [-0.42, 2.18, s * 0.24], [-0.47, 2.43, s * 0.16]);
    b.sweep(horn, [0.052, 0.004], { color: HORN, caps: { start: "flat", end: "point" }, sides: 7, ...R, name: "horn" });
    b.sweep(horn, (t) => 0.052 * (1 - t) + 0.004 * t + 0.008, { from: 0.1, to: 0.2, color: GOLD, caps: "flat", sides: 7, ...R });
    // lower back-swept horns and cheek spikes
    const horn2 = bezier([-0.04, 1.97, s * 0.1], [-0.2, 1.95, s * 0.22], [-0.33, 1.9, s * 0.25], [-0.4, 1.78, s * 0.2]);
    b.sweep(horn2, [0.035, 0.004], { color: HORN, caps: { start: "flat", end: "point" }, sides: 6, ...R, name: "hornLow" });
    b.spike([0.1, 1.94, s * 0.085], [0.2, -0.45, s * 0.9], 0.13, 0.024, { color: BONE_DK, ...R, sides: 6 });
    b.spike([0.0, 1.9, s * 0.1], [-0.6, -0.5, s * 0.8], 0.12, 0.022, { color: BONE_DK, ...R, sides: 6 });
    b.part(new THREE.SphereGeometry(0.012, 5, 4), GOLD, { at: [0.2, 2.04, s * 0.052], ...R });
    b.part(new THREE.SphereGeometry(0.012, 5, 4), GOLD, { at: [0.3, 2.03, s * 0.044], ...R });
    // nostril pits
    b.part(new THREE.SphereGeometry(0.014, 5, 4), IRON, { at: [0.41, 2.025, s * 0.026], ...R });
  }
  // crest
  [
    [0.13, 0.095],
    [0.02, 0.135],
    [-0.09, 0.11],
  ].forEach(([x, len]) => b.spike([x, 2.095 + (x < 0 ? 0.0 : 0.005), 0], [-0.35, 1, 0], len, 0.026, { color: BONE_DK, ...R, sides: 5 }));

  // gold flange where the blade leaves the mouth
  const flangeOutline: OutlinePoint[] = [
    [-0.105, 0],
    [-0.07, 0.07],
    [-0.035, 0.105],
    [0.0, 0.135],
    [0.035, 0.105],
    [0.07, 0.07],
    [0.105, 0],
    [0.07, -0.07],
    [0.035, -0.105],
    [0.0, -0.13],
    [-0.035, -0.105],
    [-0.07, -0.07],
  ];
  b.extrude(flangeOutline, { at: [0.462, 1.94, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.032, bevel: 0.008, smoothing: 1, color: GOLD, ...R, name: "flange" });
  for (const dy of [0.082, -0.082]) glow(b.part(new THREE.SphereGeometry(0.022, 6, 4), TEAL, { at: [0.485, 1.94 + dy, 0], ...R, flat: true, name: "flangeGem" }), 1.3);
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.014, 5, 4), GOLD, { at: [0.482, 1.94, s * 0.075], ...R });

  // ------------------------------------------------------------------------------------------------ blade
  const BY = 1.94;
  const TP = [[0.1, 0.055], [0.6, 0.12], [1.1, 0.5], [1.32, -0.42]];
  const BP = [[0.1, -0.05], [0.55, -0.06], [1.0, 0.12], [1.32, -0.42]];
  const cub = (p: number[][], t: number): [number, number] => {
    const m = 1 - t;
    return [
      m * m * m * p[0][0] + 3 * m * m * t * p[1][0] + 3 * m * t * t * p[2][0] + t * t * t * p[3][0],
      m * m * m * p[0][1] + 3 * m * m * t * p[1][1] + 3 * m * t * t * p[2][1] + t * t * t * p[3][1],
    ];
  };
  const T = (u: number) => cub(TP, u);
  const B = (u: number) => cub(BP, u);
  const L = (u: number, k: number): [number, number] => {
    const t = T(u);
    const bb = B(u);
    return [t[0] + (bb[0] - t[0]) * k, t[1] + (bb[1] - t[1]) * k];
  };
  const N = 16;
  const boneOutline: OutlinePoint[] = [];
  for (let i = 0; i <= N; i++) boneOutline.push(i === N ? [...T(1), "sharp"] : T(i / N));
  for (let i = N - 1; i >= 0; i--) boneOutline.push(L(i / N, 0.5));
  b.extrude(boneOutline, { at: [0, BY, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.036, bevel: 0.01, color: BLADE_BONE, ...R, name: "bladeBone" });
  const glowOutline: OutlinePoint[] = [];
  for (let i = 0; i <= N; i++) glowOutline.push(i === N ? [...T(1), "sharp"] : L(i / N, 0.42));
  for (let i = N - 1; i >= 0; i--) glowOutline.push(B(i / N));
  glow(b.extrude(glowOutline, { at: [0, BY, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, bevel: 0.006, color: TEAL, ...R, name: "bladeGlow" }), 1.1);
  const to3 = (p: number[], z = 0): V => [p[0], BY + p[1], z];
  const edge: V[] = [];
  const inlay: V[] = [];
  for (let i = 0; i <= N; i++) {
    edge.push(to3(B(i / N)));
    inlay.push(to3(L(i / N, 0.5)));
  }
  glow(b.sweep(polyline(edge), 0.011, { color: MINT, sides: 5, caps: "round", ...R, name: "bladeEdge" }), 1.5);
  b.sweep(polyline(inlay), (t) => 0.021 * (1 - t) + 0.007, { color: GOLD, sides: 6, ...R, name: "bladeInlay" });
  b.spike(to3(T(1)), [0.35, -1, 0], 0.07, 0.018, { color: BONE, ...R });

  // spurs along the spine like a dragon's wing claws
  [0.28, 0.4, 0.52, 0.64, 0.76, 0.88].forEach((u, i) => {
    const p = T(u);
    const q = T(u + 0.01);
    const tx = q[0] - p[0];
    const ty = q[1] - p[1];
    const l = Math.hypot(tx, ty);
    const nx = -ty / l;
    const ny = tx / l;
    const len = 0.115 - i * 0.012;
    b.spike(to3(p), [nx + (tx / l) * 0.55, ny + (ty / l) * 0.55, 0], len, 0.026 - i * 0.002, { color: BONE, ...R, sides: 6 });
    b.part(new THREE.SphereGeometry(0.016, 5, 4), GOLD, { at: to3(p, 0.019), ...R });
    b.part(new THREE.SphereGeometry(0.016, 5, 4), GOLD, { at: to3(p, -0.019), ...R });
  });
  // runes on both faces
  [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8].forEach((u, i) => {
    const p = L(u, 0.26);
    const q = L(u + 0.01, 0.26);
    const tx = q[0] - p[0];
    const ty = q[1] - p[1];
    const l = Math.hypot(tx, ty);
    const up: V = [-ty / l, tx / l, 0];
    const size = 0.07 - u * 0.03;
    for (const s of [1, -1])
      glow(
        b.part(new THREE.PlaneGeometry(size, size), "#ffffff", {
          at: to3(p, s * 0.0195),
          dir: [0, 0, s],
          axis: "z",
          up,
          texture: GLYPHS[(i + (s > 0 ? 0 : 1)) % 3],
          ...R,
          name: "rune",
        }),
        1.2,
      );
  });
  // soul flames along the spine
  const flames = [0.34, 0.46, 0.58, 0.7, 0.82].map((u) => frame(to3(T(u), 0), [0, 1, 0]));
  glow(b.cards(flames, FLAME, { size: [0.045, 0.1], cross: true, flow: [0, 0, 1], vary: 0.3, rng: r, bone: root }), 1.3);

  // ------------------------------------------------------------------------------------------------ hangings
  for (const s of [1, -1])
    b.cards([frame([-0.4, 1.79, s * 0.2], [0, 1, 0])], BANNER, { size: [0.13, 0.46], lean: 180, flow: [0, 0, 1], bend: 0, bone: root });
  // dangling soul charm on a gold chain
  const charm = b.chain("charm", polyline([[0.462, 1.82, 0], [0.462, 1.7, 0], [0.462, 1.58, 0], [0.462, 1.46, 0]]), {
    parent: root,
    names: ["charm1", "charm2", "charm3"],
    role: "hinge",
  });
  b.sweep(charm, 0.006, { color: GOLD, sides: 5, skin: "rigid" });
  for (const j of charm.joints) b.part(new THREE.SphereGeometry(0.015, 5, 4), GOLD, { bone: j, at: j.at });
  b.spike([0.462, 1.46, 0], [0, -1, 0], 0.13, 0.032, { color: BONE, bone: charm.tip ?? charm.joints[2], sides: 6 });
  glow(b.part(new THREE.SphereGeometry(0.024, 6, 4), TEAL, { at: [0.462, 1.455, 0], bone: charm.tip ?? charm.joints[2], flat: true }), 1.3);

  // floating wisps
  const wispAt: V[] = [
    [0.55, 2.4, 0.15],
    [1.0, 2.28, -0.12],
    [1.42, 1.75, 0.1],
    [1.32, 1.22, -0.05],
    [0.62, 0.5, 0.42],
    [-0.5, 0.75, -0.3],
    [0.35, 1.05, 0.4],
    [-0.35, 1.4, 0.25],
  ];
  glow(
    b.cards(wispAt.map((p) => frame(p, [0, 1, 0])), WISP, { size: [0.09, 0.145], cross: true, flow: [0, 0, 1], vary: 0.25, rng: r, bone: root }),
    1.2,
  );

  void INK;
  return b.root;
}
