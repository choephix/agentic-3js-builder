import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { catmull, polyline } from "../../../../src/path";
import { rng } from "../../../../src/math";
import { gradient, grain, mottle, paint, patches, scales, countershade, mix, noise } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dwarf Rifleman",
  description:
    "A chunky heroic dwarf rifleman with a braided copper beard, riveted blue plate armour and a flared-muzzle brass blunderbuss, in hand-painted Warcraft style.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---------- palette ----------
const SKIN = "#d9916b";
const SKIN_DK = "#b86e50";
const BEARD = "#c4561d";
const BEARD_LT = "#e98a34";
const BEARD_DK = "#8a3410";
const STEEL = "#7d8794";
const STEEL_LT = "#aab4c0";
const STEEL_DK = "#4b5461";
const BLUE = "#2f5fa8";
const BLUE_LT = "#4f8ae0";
const BLUE_DK = "#1d3a6e";
const GOLD = "#e8b83a";
const GOLD_DK = "#a87a1c";
const LEATHER = "#6b4224";
const LEATHER_LT = "#8e5c32";
const LEATHER_DK = "#43271a";
const CLOTH = "#8c2f2a";
const CLOTH_DK = "#5e1c1c";
const WOOD = "#7a4a26";
const WOOD_LT = "#a2683a";
const WOOD_DK = "#4a2a14";
const BRASS = "#c99a2e";
const BRASS_LT = "#f0cd62";
const IRON = "#3a3f48";
const WHITE = "#f4ecd8";
const INKC = "#241410";
const EMBER = "#ff9a2a";

type P3 = [number, number, number];

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "dwarfRifleman", paintSize: 2048 });
  const R = rng(11);

  // ---------- paints ----------
  const skinP = paint((p, n) => {
    const w = noise(p, 0.05, 3);
    const base = mix(SKIN, SKIN_DK, Math.max(0, -n.y) * 0.6 + w * 0.25);
    return mix(base, "#e8a384", Math.max(0, n.y) * 0.25);
  });
  const beardP = paint((p, n, s) => {
    const streak = grain(BEARD, BEARD_LT, { size: 0.012, axis: "y", seed: 4 });
    const c = streak.at(p, n, s);
    const shade = Math.max(0, 0.5 - p.y * 0.1);
    return mix(c, BEARD_DK, Math.max(0, -n.y) * 0.4 + shade * 0.1);
  });
  const blueArmor = paint((p, n) => {
    const hl = Math.max(0, n.y) * 0.5 + Math.max(0, n.z) * 0.15;
    const sh = Math.max(0, -n.y) * 0.5;
    const w = noise(p, 0.06, 7) * 0.18;
    const base = mix(BLUE, BLUE_LT, hl + w);
    return mix(base, BLUE_DK, sh);
  });
  const steelP = paint((p, n) => {
    const hl = Math.max(0, n.y) * 0.55;
    const sh = Math.max(0, -n.y) * 0.5;
    const w = noise(p, 0.05, 9) * 0.2;
    return mix(mix(STEEL, STEEL_LT, hl + w), STEEL_DK, sh);
  });
  const leatherP = paint((p, n) => {
    const g = grain(LEATHER, LEATHER_LT, { size: 0.015, axis: "x", seed: 5 }).at(p, n);
    return mix(g, LEATHER_DK, Math.max(0, -n.y) * 0.4 + noise(p, 0.04, 2) * 0.15);
  });
  const woodP = grain(WOOD, WOOD_LT, { size: 0.01, axis: "z", seed: 8 });
  const clothP = paint((p, n) => {
    const base = mix(CLOTH, CLOTH_DK, Math.max(0, -n.y) * 0.5 + noise(p, 0.07, 6) * 0.3);
    return base;
  });
  const barrelP = paint((p, n) => {
    const hl = Math.max(0, n.y) * 0.6;
    const sh = Math.max(0, -n.y) * 0.5;
    return mix(mix(BRASS, BRASS_LT, hl + noise(p, 0.04, 12) * 0.15), GOLD_DK, sh);
  });
  const bootP = paint((p, n) => {
    const g = mottle(LEATHER_DK, LEATHER, { size: 0.05, seed: 3 }).at(p, n);
    return mix(g, "#2a160c", Math.max(0, -n.y) * 0.5);
  });
  const plateScale = scales(STEEL, STEEL_DK, { size: 0.03, width: 0.15, seed: 2 });
  const tuftP = patches(BEARD, [BEARD_LT, BEARD_DK], { size: 0.03, seed: 4 });

  // ---------- textures ----------
  const RIVET_TEX = svg(
    `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="13" fill="#d9c36a" stroke="#6b4e10" stroke-width="3"/><circle cx="12" cy="12" r="4" fill="#fff6c0"/></svg>`,
    { size: 64 },
  );
  const CREST = svg(
    `<svg viewBox="0 0 64 64">
      <path d="M32 4 L58 14 V34 C58 48 46 58 32 61 C18 58 6 48 6 34 V14 Z" fill="#e8b83a" stroke="#6b4e10" stroke-width="3"/>
      <path d="M32 10 L52 17 V34 C52 44 43 52 32 55 C21 52 12 44 12 34 V17 Z" fill="#2f5fa8"/>
      <path d="M32 14 V52" stroke="#e8b83a" stroke-width="3"/>
      <path d="M32 18 L44 40 H20 Z" fill="#e8b83a" stroke="#6b4e10" stroke-width="2"/>
      <circle cx="32" cy="36" r="4" fill="#c4561d"/>
    </svg>`,
    { size: 128 },
  );
  const EYE = svg(
    `<svg viewBox="0 0 40 24">
      <path d="M2 14 Q20 -2 38 14 Q20 24 2 14Z" fill="#f4ecd8" stroke="#241410" stroke-width="2.5"/>
      <circle cx="21" cy="14" r="6.5" fill="#3aa0e0"/>
      <circle cx="21" cy="14" r="3.2" fill="#241410"/>
      <circle cx="18.5" cy="11.5" r="2" fill="#ffffff"/>
      <path d="M1 9 Q20 -3 39 9" fill="none" stroke="#241410" stroke-width="3.5"/>
    </svg>`,
    { size: 160 },
  );
  const BELT_TEX = svg(
    `<svg viewBox="0 0 64 32">
      <rect x="0" y="0" width="64" height="32" fill="#6b4224"/>
      <rect x="0" y="3" width="64" height="2" fill="#8e5c32"/>
      <rect x="0" y="27" width="64" height="2" fill="#43271a"/>
      <g fill="#e8b83a" stroke="#6b4e10" stroke-width="1">
        <circle cx="8" cy="16" r="3.5"/><circle cx="24" cy="16" r="3.5"/><circle cx="40" cy="16" r="3.5"/><circle cx="56" cy="16" r="3.5"/>
      </g>
    </svg>`,
    { size: 256 },
  );
  const RUNE = svg(
    `<svg viewBox="0 0 64 24">
      <g stroke="#6b4e10" stroke-width="3" fill="none" stroke-linecap="round">
        <path d="M6 20 V4 L14 12 L6 12"/><path d="M22 4 V20 M22 12 L30 4 M22 12 L30 20"/>
        <path d="M38 20 L44 4 L50 20 M40 14 H48"/><path d="M58 4 V20 M56 8 H60"/>
      </g>
    </svg>`,
    { size: 192 },
  );
  const FURTEX = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 2 C26 18 28 44 16 62 C4 44 6 18 16 2Z" fill="#ffffff"/><path d="M16 8 V56" stroke="#bbbbbb" stroke-width="2"/></svg>`,
    { size: 96 },
  );
  const SMOKE = svg(
    `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="#ffffff" fill-opacity="0.9"/></svg>`,
    { size: 64 },
  );

  // ---------- proportions (1.3 m tall dwarf) ----------
  // soles at y=0, hips ~0.5, shoulders ~0.95, head centre ~1.12 (head is oversized)
  const ST = 0.09; // stance half-width

  // ===== BOOTS & LEGS =====
  for (const s of [1, -1]) {
    const x = s * ST;
    // boot foot
    b.part(new THREE.BoxGeometry(0.15, 0.1, 0.27), bootP, { at: [x, 0.05, 0.05] });
    b.part(new THREE.SphereGeometry(0.075, 8, 6), bootP, { at: [x, 0.07, 0.17], scale: [1, 0.8, 0.9] });
    // heel
    b.part(new THREE.BoxGeometry(0.14, 0.04, 0.08), LEATHER_DK, { at: [x, 0.02, -0.07] });
    // sole trim
    b.part(new THREE.BoxGeometry(0.158, 0.02, 0.28), IRON, { at: [x, 0.01, 0.05] });
    // toe cap steel
    b.part(new THREE.SphereGeometry(0.07, 8, 6), steelP, { at: [x, 0.06, 0.195], scale: [1.05, 0.7, 0.7] });
    // boot shaft (frustum)
    b.frustumBox([x, 0.1, -0.01], [x, 0.3, -0.01], [0.15, 0.15], [0.17, 0.16], { color: bootP });
    // boot cuff fold
    b.part(new THREE.BoxGeometry(0.19, 0.045, 0.19), LEATHER_LT, { at: [x, 0.3, -0.01] });
    // buckles
    for (const yy of [0.15, 0.23]) {
      b.part(new THREE.BoxGeometry(0.17, 0.018, 0.17), LEATHER, { at: [x, yy, -0.01] });
      b.part(new THREE.BoxGeometry(0.03, 0.03, 0.01), GOLD, { at: [x + s * 0.0, yy, 0.083] });
    }
    // knee guard
    b.part(new THREE.SphereGeometry(0.085, 8, 6), steelP, { at: [x, 0.38, 0.04], scale: [1, 0.85, 0.8] });
    b.part(new THREE.SphereGeometry(0.02, 6, 4), GOLD, { at: [x, 0.385, 0.11] });
    // thigh
    b.capsule([x, 0.33, -0.01], [x, 0.52, 0], [0.095, 0.105], { color: blueArmor, sides: 8 });
    // thigh plate strip
    b.part(new THREE.BoxGeometry(0.1, 0.12, 0.03), steelP, { at: [x, 0.47, 0.095] });
    for (const yy of [0.43, 0.51]) b.part(new THREE.SphereGeometry(0.008, 6, 4), GOLD, { at: [x, yy, 0.112] });
  }

  // ===== PELVIS / TASSETS / BELT =====
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 10), blueArmor, { at: [0, 0.55, 0], scale: [1, 1, 0.82] });
  // tassets
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.11, 0.14, 0.03), steelP, { at: [s * 0.12, 0.47, 0.14], rotation: [-12, 0, s * -8] });
    b.part(new THREE.BoxGeometry(0.11, 0.12, 0.03), steelP, { at: [s * 0.2, 0.46, 0.04], rotation: [0, s * 80, 0] });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), GOLD, { at: [s * 0.12, 0.5, 0.157] });
  }
  // loincloth tabard
  b.frustumBox([0, 0.58, 0.17], [0, 0.28, 0.185], [0.16, 0.03], [0.2, 0.03], { color: clothP });
  b.part(new THREE.BoxGeometry(0.2, 0.025, 0.035), GOLD, { at: [0, 0.28, 0.19] });
  b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", { at: [0, 0.42, 0.206], dir: [0, 0, 1], axis: "z", texture: CREST });
  // back tail cloth
  b.frustumBox([0, 0.58, -0.17], [0, 0.34, -0.185], [0.17, 0.03], [0.2, 0.03], { color: clothP });
  b.part(new THREE.BoxGeometry(0.2, 0.025, 0.035), GOLD, { at: [0, 0.34, -0.19] });

  // belt
  b.lathe(
    [
      [0, 0],
      [0.21, 0],
      [0.215, 0.015],
      [0.215, 0.075],
      [0.21, 0.09],
      [0, 0.09],
    ],
    { at: [0, 0.6, 0], segments: 14, color: leatherP },
  );
  b.part(new THREE.PlaneGeometry(0.4, 0.07), "#ffffff", { at: [0, 0.645, 0.2], dir: [0, 0, 1], axis: "z", texture: BELT_TEX });
  // big buckle
  b.part(new THREE.BoxGeometry(0.12, 0.09, 0.035), GOLD, { at: [0, 0.645, 0.215] });
  b.part(new THREE.BoxGeometry(0.075, 0.05, 0.02), IRON, { at: [0, 0.645, 0.235] });
  b.part(new THREE.SphereGeometry(0.018, 6, 4), BRASS_LT, { at: [0, 0.645, 0.248] });

  // belt pouches & powder horn & flask
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.07), LEATHER_LT, { at: [s * 0.15, 0.58, 0.17], rotation: [0, s * -20, 0] });
    b.part(new THREE.BoxGeometry(0.105, 0.04, 0.075), LEATHER_DK, { at: [s * 0.15, 0.62, 0.17], rotation: [0, s * -20, 0] });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, { at: [s * 0.15 + s * -0.012, 0.6, 0.208] });
  }
  // shot pouch at back right
  b.part(new THREE.BoxGeometry(0.12, 0.11, 0.07), leatherP, { at: [-0.14, 0.56, -0.17] });
  b.part(new THREE.BoxGeometry(0.125, 0.04, 0.075), LEATHER_DK, { at: [-0.14, 0.6, -0.17] });
  // powder horn at left hip
  b.sweep(catmull([[0.2, 0.62, 0.02], [0.27, 0.54, 0.04], [0.3, 0.44, 0.1], [0.26, 0.38, 0.17]]), [0.034, 0.012], { color: "#e9dcc0", sides: 8 });
  b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.02, 8), GOLD, { at: [0.2, 0.625, 0.02], rotation: [0, 0, -30] });
  b.part(new THREE.SphereGeometry(0.014, 6, 4), BRASS, { at: [0.255, 0.375, 0.178] });
  // hanging bandolier loops: cartridges across chest (drawn later)
  // keys & dangling tin cup at back
  b.rod([-0.05, 0.6, -0.2], [-0.05, 0.5, -0.215], 0.006, { color: IRON });
  b.part(new THREE.CylinderGeometry(0.035, 0.028, 0.06, 8), STEEL, { at: [-0.05, 0.46, -0.22] });
  b.part(new THREE.TorusGeometry(0.03, 0.006, 4, 8), STEEL_DK, { at: [-0.05, 0.49, -0.22], rotation: [90, 0, 0] });

  // ===== TORSO =====
  // belly + chest, barrel-chested
  b.loft(
    [
      { at: [0, 0.6, 0], w: 0.4, h: 0.3 },
      { at: [0, 0.7, 0], w: 0.46, h: 0.34 },
      { at: [0, 0.82, 0.005], w: 0.5, h: 0.35 },
      { at: [0, 0.93, 0], w: 0.48, h: 0.32 },
      { at: [0, 0.99, -0.01], w: 0.4, h: 0.26 },
    ],
    { color: blueArmor, section: { ngon: 8 }, smooth: true, caps: "flat" },
  );
  // chest breastplate bulge with steel trim
  b.part(new THREE.SphereGeometry(0.17, 10, 8), steelP, { at: [0, 0.82, 0.09], scale: [1.25, 0.95, 0.55] });
  b.part(new THREE.PlaneGeometry(0.17, 0.17), "#ffffff", { at: [0, 0.83, 0.2], dir: [0, 0, 1], axis: "z", texture: CREST });
  // chest plate trim lines (gold)
  b.rod([-0.19, 0.72, 0.14], [0.19, 0.72, 0.14], 0.007, { color: GOLD, sides: 6 });
  b.rod([-0.17, 0.95, 0.12], [0.17, 0.95, 0.12], 0.007, { color: GOLD, sides: 6 });
  // belly rivets row
  for (let i = -3; i <= 3; i++) {
    b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD, { at: [i * 0.05, 0.68, 0.172 - Math.abs(i) * 0.008] });
  }
  // back plate
  b.part(new THREE.BoxGeometry(0.34, 0.3, 0.04), steelP, { at: [0, 0.82, -0.17] });
  b.part(new THREE.BoxGeometry(0.34, 0.03, 0.045), GOLD, { at: [0, 0.96, -0.17] });
  // bedroll strapped across back
  b.rod([-0.17, 0.72, -0.24], [0.17, 0.9, -0.24], 0.06, { color: clothP, sides: 8, caps: "flat" });
  b.part(new THREE.TorusGeometry(0.062, 0.012, 4, 8), LEATHER_DK, { at: [-0.09, 0.76, -0.24], rotation: [90, 0, 25] });
  b.part(new THREE.TorusGeometry(0.062, 0.012, 4, 8), LEATHER_DK, { at: [0.09, 0.85, -0.24], rotation: [90, 0, 25] });

  // bandolier of cartridges across chest (left shoulder to right hip)
  const bandPath = polyline([[0.17, 1.0, 0.07], [0.14, 0.9, 0.17], [-0.02, 0.78, 0.21], [-0.14, 0.66, 0.2], [-0.2, 0.62, 0.12]]);
  b.sweep(bandPath, 0.022, { color: leatherP, section: "box", caps: "flat" });
  b.along(bandPath.slice(0.18, 0.88), 6, (at) => {
    b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.06, 6), BRASS, { at: at.moved([0, 0.026, 0]), dir: [0.3, 0.1, 0.9] });
    b.part(new THREE.CylinderGeometry(0.0165, 0.0165, 0.02, 6), BLUE_DK, { at: at.moved([0, 0.027, 0.0]), dir: [0.3, 0.1, 0.9] });
  });

  // ===== SHOULDER PAULDRONS (huge) =====
  for (const s of [1, -1]) {
    const sx = s * 0.3;
    // rounded dome
    b.lathe(
      [
        [0, 0.0],
        [0.17, 0.0],
        [0.2, 0.04],
        [0.18, 0.1],
        [0.11, 0.155],
        [0, 0.175],
      ],
      { at: [sx, 0.97, 0], axis: [s * 0.35, 1, 0], segments: 10, smoothing: 1, color: blueArmor },
    );
    // layered rim plates
    b.lathe(
      [
        [0, 0],
        [0.2, 0],
        [0.215, 0.012],
        [0.2, 0.028],
        [0, 0.028],
      ],
      { at: [sx + s * 0.005, 0.965, 0], axis: [s * 0.35, 1, 0], segments: 10, color: steelP },
    );
    // gold rim ring
    b.part(new THREE.TorusGeometry(0.205, 0.008, 4, 14), GOLD, { at: [sx + s * 0.005, 0.968, 0], rotation: [90, 0, s * -20] });
    // spikes on top
    b.spike([sx + s * 0.03, 1.12, 0], [s * 0.4, 1, 0], 0.11, 0.032, { color: steelP, sides: 6 });
    b.spike([sx - s * 0.04, 1.1, 0.07], [s * 0.1, 1, 0.5], 0.07, 0.022, { color: steelP, sides: 6 });
    b.spike([sx - s * 0.04, 1.1, -0.07], [s * 0.1, 1, -0.5], 0.07, 0.022, { color: steelP, sides: 6 });
    // rivets on pauldron
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.012, 6, 4), GOLD, {
        at: [sx + s * 0.02 + Math.cos(a) * 0.17, 1.0 - Math.abs(Math.cos(a)) * 0.02 + (s * Math.cos(a) * 0.05), Math.sin(a) * 0.17],
      });
    }
    // fur trim collar piece under pauldron
    b.part(new THREE.SphereGeometry(0.12, 8, 6), "#d8c9a8", { at: [s * 0.2, 0.99, 0], scale: [1.2, 0.5, 1.1] });
  }

  // ===== ARMS =====
  // Right arm (model right, -X) holds the stock/trigger; left arm (+X) supports barrel forward.
  // Blunderbuss is held diagonally across the front: butt at model-right shoulder, muzzle forward-left.
  // grip hand (right, -X) at trigger; fore hand (left, +X) forward under barrel.
  const gripR: P3 = [-0.13, 0.78, 0.2];
  const foreL: P3 = [0.17, 0.82, 0.42];

  // right upper arm: shoulder -> elbow
  b.capsule([-0.3, 0.92, 0], [-0.33, 0.76, 0.06], [0.1, 0.085], { color: blueArmor, sides: 8 });
  // right forearm: elbow -> wrist
  b.capsule([-0.33, 0.76, 0.06], [-0.17, 0.77, 0.19], [0.082, 0.07], { color: leatherP, sides: 8 });
  // right bracer
  b.rod([-0.28, 0.765, 0.09], [-0.2, 0.77, 0.165], [0.09, 0.08], { color: steelP, sides: 8, caps: "flat" });
  // left upper arm
  b.capsule([0.3, 0.92, 0], [0.33, 0.78, 0.12], [0.1, 0.085], { color: blueArmor, sides: 8 });
  // left forearm to wrist
  b.capsule([0.33, 0.78, 0.12], [0.2, 0.8, 0.37], [0.082, 0.07], { color: leatherP, sides: 8 });
  b.rod([0.31, 0.785, 0.18], [0.24, 0.795, 0.32], [0.09, 0.08], { color: steelP, sides: 8, caps: "flat" });
  // elbow guards
  b.part(new THREE.SphereGeometry(0.075, 8, 6), steelP, { at: [-0.35, 0.76, 0.045], scale: [0.9, 1, 1] });
  b.part(new THREE.SphereGeometry(0.075, 8, 6), steelP, { at: [0.35, 0.78, 0.105], scale: [0.9, 1, 1] });
  for (const s of [1, -1]) b.spike([s * 0.4, s > 0 ? 0.78 : 0.76, s > 0 ? 0.11 : 0.05], [s, 0, 0], 0.05, 0.025, { color: STEEL_LT, sides: 6 });

  // HANDS (oversized)
  // right hand around grip/trigger
  b.part(new THREE.SphereGeometry(0.075, 8, 6), SKIN, { at: [-0.14, 0.78, 0.22], scale: [1, 0.95, 1.1] });
  b.part(new THREE.SphereGeometry(0.075, 8, 6), skinP, { at: [-0.14, 0.78, 0.22], scale: [1, 0.95, 1.1] });
  for (let i = 0; i < 4; i++) {
    b.capsule([-0.1 - i * 0.0, 0.725 + i * 0.02, 0.24 + i * 0.0], [-0.07, 0.725 + i * 0.02, 0.255 + i * 0.0], 0.017, { color: skinP, sides: 6 });
  }
  b.capsule([-0.1, 0.835, 0.26], [-0.085, 0.82, 0.31], 0.015, { color: skinP, sides: 6 }); // trigger finger
  // left hand around fore-end
  b.part(new THREE.SphereGeometry(0.08, 8, 6), skinP, { at: [0.2, 0.8, 0.4], scale: [1, 0.95, 1.1] });
  for (let i = 0; i < 4; i++) {
    b.capsule([0.15, 0.755 + i * 0.022, 0.42], [0.11, 0.755 + i * 0.022, 0.43], 0.018, { color: skinP, sides: 6 });
  }
  b.capsule([0.18, 0.86, 0.38], [0.12, 0.86, 0.4], 0.02, { color: skinP, sides: 6 }); // thumb
  // fingerless glove cuffs
  b.part(new THREE.CylinderGeometry(0.075, 0.08, 0.04, 8), LEATHER_DK, { at: [-0.18, 0.775, 0.185], dir: [0.7, 0, 0.7] });
  b.part(new THREE.CylinderGeometry(0.075, 0.08, 0.04, 8), LEATHER_DK, { at: [0.23, 0.795, 0.345], dir: [-0.4, 0, 0.9] });

  // ===== BLUNDERBUSS =====
  // axis line from butt to muzzle
  const butt: P3 = [-0.25, 0.88, -0.1];
  const lock: P3 = [-0.1, 0.84, 0.2];
  const muzzleBase: P3 = [0.12, 0.84, 0.62];
  const muzzleTip: P3 = [0.19, 0.85, 0.93];
  // stock (tapered wood) with grain paint
  b.frustumBox([-0.25, 0.86, -0.16], [-0.12, 0.84, 0.16], [0.07, 0.15], [0.07, 0.085], { color: woodP, caps: "flat" });
  // butt plate
  b.part(new THREE.BoxGeometry(0.04, 0.17, 0.075), BRASS, { at: [-0.255, 0.865, -0.155], rotation: [0, 20, 0] });
  b.part(new THREE.BoxGeometry(0.045, 0.14, 0.05), GOLD_DK, { at: [-0.257, 0.865, -0.158], rotation: [0, 20, 0] });
  // cheek rest
  b.part(new THREE.SphereGeometry(0.05, 8, 6), WOOD_LT, { at: [-0.2, 0.94, -0.06], scale: [0.8, 0.6, 1.5] });
  // stock carving rune plate
  b.part(new THREE.PlaneGeometry(0.14, 0.05), "#ffffff", { at: [-0.162, 0.865, 0.02], dir: [-1, 0, 0.12], axis: "z", texture: RUNE, color: GOLD });
  b.part(new THREE.PlaneGeometry(0.14, 0.05), "#ffffff", { at: [-0.186, 0.865, 0.02], dir: [1, 0, -0.12], axis: "z", texture: RUNE, color: GOLD });
  // lock plate and hammer
  b.part(new THREE.BoxGeometry(0.03, 0.09, 0.16), BRASS, { at: [-0.085, 0.855, 0.16] });
  b.part(new THREE.BoxGeometry(0.03, 0.09, 0.16), BRASS, { at: [-0.215, 0.855, 0.12] });
  b.part(new THREE.SphereGeometry(0.03, 8, 6), BRASS_LT, { at: [-0.075, 0.845, 0.16] });
  b.part(new THREE.SphereGeometry(0.03, 8, 6), BRASS_LT, { at: [-0.225, 0.845, 0.12] });
  // hammer / flintlock cock
  b.capsule([-0.15, 0.905, 0.2], [-0.15, 0.97, 0.16], 0.014, { color: IRON, sides: 6 });
  b.part(new THREE.BoxGeometry(0.03, 0.03, 0.03), STEEL_LT, { at: [-0.15, 0.975, 0.15] });
  b.part(new THREE.BoxGeometry(0.035, 0.015, 0.05), IRON, { at: [-0.15, 0.91, 0.24] }); // frizzen
  // trigger guard
  b.part(new THREE.TorusGeometry(0.045, 0.01, 4, 10, Math.PI), BRASS, { at: [-0.15, 0.78, 0.17], rotation: [0, 90, 180] });
  b.rod([-0.15, 0.8, 0.18], [-0.15, 0.775, 0.215], 0.007, { color: IRON, sides: 6 });
  // wooden fore-end under barrel
  b.frustumBox([-0.1, 0.85, 0.2], [0.1, 0.835, 0.55], [0.07, 0.07], [0.06, 0.06], { color: woodP, caps: "flat" });
  // barrel: breech then taper toward flared muzzle
  const barrelPath = polyline([[-0.12, 0.89, 0.12], [-0.02, 0.89, 0.3], [0.12, 0.88, 0.62]]);
  b.sweep(barrelPath, [0.042, 0.052], { color: barrelP, sides: 10, caps: "flat" });
  // breech block
  b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.1, 10), barrelP, { at: [-0.1, 0.89, 0.16], dir: [0.3, 0, 1] });
  // flared muzzle bell
  b.lathe(
    [
      [0, 0],
      [0.048, 0],
      [0.06, 0.08],
      [0.095, 0.2],
      [0.125, 0.32],
      [0.1, 0.32],
      [0.07, 0.22],
      [0.042, 0.09],
      [0, 0.09],
    ],
    { at: [0.12, 0.885, 0.6], axis: [0.2, 0.01, 1], segments: 12, color: barrelP },
  );
  // muzzle dark bore
  b.part(new THREE.CircleGeometry(0.095, 12), "#17110c", { at: [0.205, 0.889, 0.91], dir: [0.2, 0.01, 1], axis: "z" });
  // flared mouth rim ring
  b.part(new THREE.TorusGeometry(0.118, 0.012, 4, 14), GOLD, { at: [0.2, 0.889, 0.915], dir: [0.2, 0.01, 1], axis: "z" });
  // barrel bands (brass rings)
  for (const t of [0.15, 0.4, 0.65, 0.88]) {
    const pt = barrelPath.at(t);
    b.part(new THREE.TorusGeometry(0.048 + t * 0.014, 0.01, 4, 10), GOLD_DK, { at: pt, dir: barrelPath.tangentAt(t), axis: "z" });
  }
  for (const t of [0.3, 0.55]) {
    const pt = barrelPath.at(t);
    b.part(new THREE.BoxGeometry(0.1, 0.012, 0.04), LEATHER_DK, { at: [pt.x, pt.y - 0.045, pt.z], rotation: [0, 12, 0] });
  }
  // barrel engraving rune strip
  b.part(new THREE.PlaneGeometry(0.12, 0.04), "#ffffff", { at: [0.02, 0.945, 0.34], dir: [0, 1, 0], axis: "z", texture: RUNE, color: BRASS_LT });
  // front sight
  b.spike([0.185, 0.97, 0.88], [0, 1, 0], 0.035, 0.012, { color: IRON, sides: 5 });
  // ramrod under barrel
  b.rod([-0.02, 0.8, 0.28], [0.15, 0.795, 0.64], 0.009, { color: WOOD_DK, sides: 6 });
  b.part(new THREE.SphereGeometry(0.014, 6, 4), BRASS, { at: [0.155, 0.795, 0.65] });
  // sling strap from fore to butt
  b.rod([-0.26, 0.82, -0.13], [-0.2, 0.7, 0.05], 0.008, { color: LEATHER, sides: 4 });
  // wisp of smoke from muzzle (cards)
  const smokeFrames = [0, 1, 2, 3].map((i) => ({ at: new THREE.Vector3(0.22 + i * 0.01, 0.9 + i * 0.05, 0.96 + i * 0.03), axis: new THREE.Vector3(0, 1, 0) }));
  void smokeFrames;
  // ember glowing in pan
  glow(b.part(new THREE.SphereGeometry(0.01, 6, 4), EMBER, { at: [-0.15, 0.92, 0.245] }), 1.8);

  // ===== NECK / HEAD =====
  b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.08, 8), skinP, { at: [0, 1.02, 0.01] });
  // gorget (steel collar)
  b.lathe(
    [
      [0.1, 0],
      [0.19, 0.0],
      [0.2, 0.03],
      [0.16, 0.055],
      [0.12, 0.05],
      [0.14, 0.02],
    ],
    { at: [0, 0.98, 0.01], segments: 12, color: steelP },
  );
  b.part(new THREE.TorusGeometry(0.19, 0.008, 4, 14), GOLD, { at: [0, 0.985, 0.01], rotation: [90, 0, 0] });

  // head: big, wide, flat-faced (Warcraft oversized)
  const HC: P3 = [0, 1.14, 0.03];
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), skinP, { at: HC, scale: [0.155, 0.14, 0.15] });
  // brow ridge
  b.part(new THREE.BoxGeometry(0.28, 0.04, 0.07), skinP, { at: [0, 1.185, 0.15], rotation: [-8, 0, 0] });
  // cheeks
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.06, 8, 6), skinP, { at: [s * 0.095, 1.10, 0.14], scale: [1, 0.9, 0.9] });
    // ears
    b.part(new THREE.SphereGeometry(0.04, 6, 5), SKIN, { at: [s * 0.15, 1.13, 0.0], scale: [0.5, 1, 0.8] });
    b.part(new THREE.SphereGeometry(0.02, 6, 4), GOLD, { at: [s * 0.162, 1.1, 0.0], scale: [0.6, 1, 1] }); // earring
  }
  // big bulbous nose
  b.part(new THREE.SphereGeometry(0.052, 8, 6), SKIN_DK, { at: [0, 1.115, 0.18], scale: [1, 0.9, 1] });
  b.part(new THREE.SphereGeometry(0.056, 8, 6), skinP, { at: [0, 1.12, 0.178], scale: [0.95, 0.85, 1] });
  // eyes (decals) with heavy brows
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.075, 0.045), "#ffffff", { at: [s * 0.065, 1.16, 0.171], dir: [s * 0.15, 0, 1], axis: "z", texture: EYE });
    // bushy eyebrow
    b.capsule([s * 0.03, 1.2, 0.17], [s * 0.115, 1.21, 0.125], [0.02, 0.018], { color: beardP, sides: 6 });
    b.capsule([s * 0.115, 1.21, 0.125], [s * 0.14, 1.19, 0.09], [0.018, 0.012], { color: beardP, sides: 6 });
  }
  void skin;

  // ===== HELMET (steel with blue paint, rivets, short horns) =====
  b.lathe(
    [
      [0, 0],
      [0.165, 0],
      [0.172, 0.04],
      [0.16, 0.1],
      [0.12, 0.155],
      [0.06, 0.185],
      [0, 0.19],
    ],
    { at: [0, 1.19, 0.015], segments: 14, smoothing: 1, color: steelP },
  );
  // brim ring
  b.part(new THREE.TorusGeometry(0.17, 0.014, 5, 16), GOLD, { at: [0, 1.195, 0.015], rotation: [90, 0, 0] });
  // nose guard
  b.frustumBox([0, 1.24, 0.165], [0, 1.15, 0.188], [0.025, 0.015], [0.04, 0.02], { color: steelP, caps: "flat" });
  // blue band around helmet
  b.part(new THREE.TorusGeometry(0.168, 0.02, 5, 16), BLUE, { at: [0, 1.23, 0.015], rotation: [90, 0, 0] });
  // central crest ridge
  b.sweep(catmull([[0, 1.37, -0.14], [0, 1.4, -0.02], [0, 1.38, 0.1]]), 0.014, { color: steelP, sides: 6 });
  // short horns
  for (const s of [1, -1]) {
    b.sweep(catmull([[s * 0.17, 1.25, 0.02], [s * 0.25, 1.3, 0.02], [s * 0.28, 1.4, 0.04]]), [0.032, 0.008], { color: "#e9dcc0", sides: 7 });
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.025, 8), GOLD, { at: [s * 0.175, 1.25, 0.02], dir: [s, 0.5, 0] });
    for (const a of [-0.5, 0.5, 1.5]) {
      b.part(new THREE.SphereGeometry(0.01, 6, 4), GOLD, { at: [s * 0.13 * Math.cos(a + 0.3), 1.29 + 0.02 * a, 0.13 * Math.sin(a * 0.9 + 0.2) + 0.05] });
    }
  }
  // rear neck guard
  b.part(new THREE.BoxGeometry(0.28, 0.08, 0.03), steelP, { at: [0, 1.16, -0.15], rotation: [10, 0, 0] });

  // ===== BEARD (braided, copper, huge) =====
  // moustache
  for (const s of [1, -1]) {
    b.sweep(catmull([[s * 0.01, 1.09, 0.19], [s * 0.08, 1.075, 0.18], [s * 0.15, 1.04, 0.12], [s * 0.17, 0.99, 0.08]]), [0.035, 0.012], { color: beardP, sides: 8 });
    // moustache ring
    b.part(new THREE.TorusGeometry(0.02, 0.006, 4, 8), GOLD, { at: [s * 0.15, 1.03, 0.125], rotation: [90, 0, 0] });
  }
  // beard mass on chin (cheek-hugging)
  b.loft(
    [
      { at: [0, 1.1, 0.12], w: 0.3, h: 0.1 },
      { at: [0, 1.0, 0.17], w: 0.3, h: 0.12 },
      { at: [0, 0.9, 0.2], w: 0.24, h: 0.12 },
      { at: [0, 0.8, 0.205], w: 0.14, h: 0.1 },
    ],
    { color: beardP, section: { ngon: 8 }, caps: "round" },
  );
  // side whiskers
  for (const s of [1, -1]) {
    b.capsule([s * 0.14, 1.12, 0.08], [s * 0.14, 1.0, 0.14], [0.055, 0.04], { color: beardP, sides: 8 });
  }
  // three braids hanging from chin
  const braidSpecs: Array<{ x: number; len: number; z: number }> = [
    { x: -0.08, len: 0.42, z: 0.22 },
    { x: 0.0, len: 0.5, z: 0.24 },
    { x: 0.08, len: 0.42, z: 0.22 },
  ];
  for (const sp of braidSpecs) {
    const path = catmull([
      [sp.x, 0.88, sp.z - 0.02],
      [sp.x * 1.1, 0.8, sp.z],
      [sp.x * 1.15, 0.7, sp.z + 0.01],
      [sp.x * 1.1, 0.88 - sp.len, sp.z],
    ]);
    b.sweep(path, [0.045, 0.026], { color: beardP, sides: 7, caps: "round" });
    // braid knots as stacked ellipsoids along the braid
    b.along(path.slice(0.05, 0.95), 7, (at) => {
      b.part(new THREE.SphereGeometry(0.036, 6, 4), BEARD_LT, { at: at.moved([0, 0.0, 0.0]), scale: [1.05, 0.55, 0.75] });
    });
    // gold braid ring at tip
    const tip = path.at(0.93);
    b.part(new THREE.TorusGeometry(0.03, 0.01, 4, 8), GOLD, { at: tip, rotation: [90, 0, 0] });
    b.spike([tip.x, tip.y - 0.01, tip.z], [0, -1, 0], 0.06, 0.028, { color: BEARD_DK, sides: 6 });
  }
  // beard beads on middle braid
  for (const yy of [0.82, 0.72, 0.6]) {
    b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, { at: [0, yy, 0.27] });
  }
  // beard fur cards for texture
  const bearSurface = b.surface(b.part(new THREE.SphereGeometry(0.01, 4, 3), BEARD, { at: [0, 1.0, 0.17], scale: [0.01, 0.01, 0.01] }));
  void bearSurface;
  const tufts: Array<{ at: THREE.Vector3; axis: THREE.Vector3 }> = [];
  for (let i = 0; i < 24; i++) {
    const a = R() * Math.PI - Math.PI / 2;
    tufts.push({
      at: new THREE.Vector3(Math.sin(a) * 0.16, 0.95 + R() * 0.15, 0.17 + Math.cos(a) * 0.04),
      axis: new THREE.Vector3(Math.sin(a) * 0.6, -0.4, 0.7),
    });
  }
  b.cards(tufts, FURTEX, { size: [0.035, 0.07], lean: 70, flow: [0, -1, 0.1], vary: 0.3, rng: R, color: tuftP, bend: 20 });

  // ===== CHEST DETAILS: gold chain, medal, tankard =====
  b.sweep(catmull([[-0.14, 1.0, 0.12], [-0.12, 0.93, 0.19], [0, 0.89, 0.22], [0.12, 0.93, 0.19], [0.14, 1.0, 0.12]]), 0.008, { color: GOLD, sides: 5 });
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 8), GOLD, { at: [0, 0.87, 0.225], dir: [0, 0.1, 1] });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.014, 8), "#2f8ae0", { at: [0, 0.87, 0.23], dir: [0, 0.1, 1] });

  // ===== BACKPACK =====
  b.part(new THREE.BoxGeometry(0.26, 0.22, 0.1), leatherP, { at: [0, 0.76, -0.23] });
  b.part(new THREE.BoxGeometry(0.27, 0.05, 0.11), LEATHER_DK, { at: [0, 0.86, -0.23] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.03, 0.2, 0.01), GOLD_DK, { at: [s * 0.08, 0.76, -0.285] });
    b.part(new THREE.BoxGeometry(0.03, 0.03, 0.015), GOLD, { at: [s * 0.08, 0.72, -0.288] });
  }
  // shoulder straps
  for (const s of [1, -1]) {
    b.rod([s * 0.1, 0.93, -0.19], [s * 0.12, 0.95, 0.1], 0.02, { color: LEATHER, section: "box", caps: "flat" });
  }
  // cooking pot hung
  b.part(new THREE.CylinderGeometry(0.07, 0.055, 0.075, 10), STEEL_DK, { at: [0.1, 0.64, -0.26] });
  b.part(new THREE.TorusGeometry(0.06, 0.006, 4, 10, Math.PI), IRON, { at: [0.1, 0.68, -0.26], rotation: [0, 0, 0] });

  return b.root;
}
