import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { cellPaint, pixelArt, pixelTexture, snapColor } from "../kits/pixel";
import { glow } from "../kits/glow";

const TEXEL = 0.05;
const INK = snapColor("#142b46", 32);
const DEEP = snapColor("#173e59", 32);
const SLIME_DARK = snapColor("#1c6170", 32);
const SLIME = snapColor("#36a8a0", 32);
const SLIME_LIGHT = snapColor("#84e0c0", 32);
const SLIME_GLOW = snapColor("#c2ffe2", 32);
const CYAN = snapColor("#45d7c0", 32);
const TEAL = snapColor("#25828b", 32);
const BONE = snapColor("#e9d59d", 32);
const BONE_SHADE = snapColor("#9f875f", 32);
const GOLD = snapColor("#f2b83f", 32);
const GOLD_DARK = snapColor("#9a5b27", 32);
const STEEL = snapColor("#b9d0d1", 32);
const STEEL_DARK = snapColor("#466579", 32);
const LEATHER = snapColor("#6c3b32", 32);
const RED = snapColor("#d94d58", 32);
const VIOLET = snapColor("#a76ad6", 32);

const SLIME_PAINT = cellPaint(TEXEL, (c) => {
  const shimmer = (c.u * 3 + c.v * 5 + c.depth) % 7 === 0;
  if (c.axis === 1 && c.n.y > 0.5) return shimmer ? SLIME_LIGHT : SLIME;
  if (c.axis === 2 && c.n.z > 0.5) return shimmer ? CYAN : SLIME_DARK;
  return shimmer ? TEAL : DEEP;
}, { dither: true });

const SHELL_TEX = pixelTexture(32, 32, (g) => {
  const aqua = CYAN;
  const pale = SLIME_GLOW;
  for (let i = 2; i < 30; i += 4) {
    g.set(i, 2, pale);
    g.set(2, i, aqua);
    g.set(29, i + 1, aqua);
    g.set(i + 1, 29, pale);
  }
  for (const [x, y] of [[8, 7], [9, 7], [10, 8], [21, 11], [22, 12], [15, 19], [16, 20], [25, 24], [6, 25]]) {
    g.set(x, y, pale);
  }
});

const RUNE_TEX = pixelArt([
  "........",
  "..cc....",
  ".c..c...",
  "c....c..",
  ".c..c...",
  "..cc....",
  "........",
  "........",
], { c: SLIME_GLOW });

const BOTTLE_TEX = pixelArt([
  "........",
  "...gg...",
  "..grrg..",
  ".grrrrg.",
  ".grrrrg.",
  ".gggggg.",
  "........",
  "........",
], { g: GOLD, r: RED });

export const meta = {
  name: "Gelatinous Cube",
  description: "A pixel-art gelatinous cube with a readable slime shell, hungry jaw, and treasure suspended inside.",
  style: "pixel art",
  commit: "07503e3",
};

export default function build() {
  const b = createBuilder({ name: "gelatinousCube", detail: 1, paintSize: 1024 });
  const core = b.joint("core", { at: [0, 0, 0], role: "spine" });
  const crown = b.joint("crown", { parent: core, at: [0, 2.28, 0], dir: [0, 1, 0], role: "spine" });
  const jawUpper = b.joint("jawUpper", { parent: core, at: [0, 0.76, 1.23], dir: [0, 0, 1], role: "jaw" });
  const jawLower = b.joint("jawLower", { parent: core, at: [0, 0.42, 1.23], dir: [0, 0, 1], role: "jaw" });

  // The dense inner volume gives the cube a strong silhouette; the quantized paint makes its large faces read as slime.
  b.part(new THREE.BoxGeometry(2.4, 2.4, 2.4), SLIME_PAINT, {
    bone: core,
    at: [0, 1.2, 0],
    flat: true,
    name: "slimeVolume",
  });

  // Eight chunky corners and three-way edge rails establish the crisp pixel-cube outline from every angle.
  const corner = new THREE.BoxGeometry(0.24, 0.24, 0.24);
  for (const x of [-1.08, 1.08]) {
    for (const y of [0.12, 2.28]) {
      for (const z of [-1.08, 1.08]) {
        b.part(corner, SLIME_LIGHT, { bone: core, at: [x, y, z], flat: true, name: "cornerNode" });
      }
    }
  }
  const railY = new THREE.BoxGeometry(0.13, 2.08, 0.13);
  const railX = new THREE.BoxGeometry(2.08, 0.13, 0.13);
  const railZ = new THREE.BoxGeometry(0.13, 0.13, 2.08);
  for (const x of [-1.15, 1.15]) for (const z of [-1.15, 1.15])
    b.part(railY, CYAN, { bone: core, at: [x, 1.2, z], flat: true, name: "verticalRail" });
  for (const y of [0.05, 2.35]) for (const z of [-1.15, 1.15])
    b.part(railX, CYAN, { bone: core, at: [0, y, z], flat: true, name: "horizontalRail" });
  for (const y of [0.05, 2.35]) for (const x of [-1.15, 1.15])
    b.part(railZ, TEAL, { bone: core, at: [x, y, 0], flat: true, name: "depthRail" });

  // Pixel-glint sheets sit on all six faces, with transparent texels letting the darker core show through.
  b.part(new THREE.BoxGeometry(2.12, 2.12, 0.035), "#ffffff", {
    bone: core, at: [0, 1.2, 1.215], texture: SHELL_TEX, name: "frontGlints", flat: true,
  });
  b.part(new THREE.BoxGeometry(2.12, 2.12, 0.035), "#ffffff", {
    bone: core, at: [0, 1.2, -1.215], texture: SHELL_TEX, rotation: [0, 180, 0], name: "backGlints", flat: true,
  });
  b.part(new THREE.BoxGeometry(0.035, 2.12, 2.12), "#ffffff", {
    bone: core, at: [1.215, 1.2, 0], texture: SHELL_TEX, name: "leftGlints", flat: true,
  });
  b.part(new THREE.BoxGeometry(0.035, 2.12, 2.12), "#ffffff", {
    bone: core, at: [-1.215, 1.2, 0], texture: SHELL_TEX, name: "rightGlints", flat: true,
  });
  b.part(new THREE.BoxGeometry(2.12, 0.035, 2.12), "#ffffff", {
    bone: core, at: [0, 2.415, 0], texture: SHELL_TEX, name: "topGlints", flat: true,
  });
  b.part(new THREE.BoxGeometry(2.12, 0.035, 2.12), "#ffffff", {
    bone: core, at: [0, -0.015, 0], texture: SHELL_TEX, name: "bottomGlints", flat: true,
  });
  // A dark front pocket sells the loot as swallowed rather than painted onto the outside wall.
  b.part(new THREE.BoxGeometry(1.72, 1.72, 0.055), INK, {
    bone: core, at: [0, 1.22, 1.235], name: "swallowedPocket", flat: true,
  });
  b.part(new THREE.BoxGeometry(1.88, 0.08, 0.09), SLIME_LIGHT, {
    bone: core, at: [0, 2.08, 1.28], name: "pocketTop", flat: true,
  });
  b.part(new THREE.BoxGeometry(1.88, 0.08, 0.09), TEAL, {
    bone: core, at: [0, 0.36, 1.28], name: "pocketBottom", flat: true,
  });
  b.part(new THREE.BoxGeometry(0.08, 1.64, 0.09), CYAN, {
    bone: core, at: [-0.90, 1.22, 1.28], name: "pocketLeft", flat: true,
  });
  b.part(new THREE.BoxGeometry(0.08, 1.64, 0.09), CYAN, {
    bone: core, at: [0.90, 1.22, 1.28], name: "pocketRight", flat: true,
  });

  // The mouth is a separate upper/lower jaw assembly, with square pixel teeth.
  b.part(new THREE.BoxGeometry(1.22, 0.18, 0.08), INK, { bone: jawUpper, at: [0, 0.67, 1.28], name: "mouthUpper" });
  b.part(new THREE.BoxGeometry(1.22, 0.16, 0.08), INK, { bone: jawLower, at: [0, 0.46, 1.28], name: "mouthLower" });
  b.part(new THREE.BoxGeometry(1.34, 0.08, 0.10), SLIME_LIGHT, { bone: jawUpper, at: [0, 0.79, 1.29], name: "upperLip" });
  b.part(new THREE.BoxGeometry(1.34, 0.08, 0.10), TEAL, { bone: jawLower, at: [0, 0.35, 1.29], name: "lowerLip" });
  const tooth = new THREE.BoxGeometry(0.10, 0.13, 0.08);
  for (const x of [-0.48, -0.24, 0, 0.24, 0.48]) {
    b.part(tooth, BONE, { bone: jawUpper, at: [x, 0.60, 1.33], name: "upperTooth" });
    if (x !== 0) b.part(tooth, BONE_SHADE, { bone: jawLower, at: [x, 0.53, 1.33], rotation: [0, 0, 180], name: "lowerTooth" });
  }

  // A few runic pixels make the otherwise eyeless monster expressive without turning it humanoid.
  b.part(new THREE.BoxGeometry(0.32, 0.32, 0.025), "#ffffff", {
    bone: crown, at: [-0.62, 1.82, 1.225], texture: RUNE_TEX, name: "runeL", flat: true,
  });
  b.part(new THREE.BoxGeometry(0.32, 0.32, 0.025), "#ffffff", {
    bone: crown, at: [0.62, 1.82, 1.225], texture: RUNE_TEX, name: "runeR", flat: true,
  });

  // Loot suspended in the front of the mass: sword, skull, potion, coins, and a folded scroll.
  b.part(new THREE.BoxGeometry(0.11, 0.83, 0.08), STEEL, {
    bone: core, at: [-0.58, 1.30, 1.30], rotation: [0, 0, -22], name: "swordBlade", flat: true,
  });
  b.part(new THREE.BoxGeometry(0.16, 0.16, 0.12), STEEL_DARK, {
    bone: core, at: [-0.42, 0.93, 1.31], rotation: [0, 0, -22], name: "swordGuard", flat: true,
  });
  b.part(new THREE.BoxGeometry(0.09, 0.28, 0.10), LEATHER, {
    bone: core, at: [-0.33, 0.76, 1.32], rotation: [0, 0, -22], name: "swordGrip", flat: true,
  });
  b.part(new THREE.BoxGeometry(0.13, 0.13, 0.13), GOLD, {
    bone: core, at: [-0.28, 0.60, 1.33], rotation: [0, 0, -22], name: "swordPommel", flat: true,
  });

  b.part(new THREE.SphereGeometry(0.20, 8, 6), BONE, {
    bone: core, at: [0.05, 0.72, 1.34], flat: true, name: "skull",
  });
  b.part(new THREE.BoxGeometry(0.28, 0.12, 0.18), BONE_SHADE, {
    bone: core, at: [0.05, 0.54, 1.36], name: "skullJaw", flat: true,
  });
  glow(b.part(new THREE.BoxGeometry(0.07, 0.07, 0.035), VIOLET, {
    bone: core, at: [-0.03, 0.76, 1.54], name: "skullEyeL", flat: true,
  }), 1.7);
  glow(b.part(new THREE.BoxGeometry(0.07, 0.07, 0.035), VIOLET, {
    bone: core, at: [0.13, 0.76, 1.54], name: "skullEyeR", flat: true,
  }), 1.7);

  const potion = b.part(new THREE.CylinderGeometry(0.13, 0.15, 0.30, 6), RED, {
    bone: core, at: [0.54, 1.48, 1.34], texture: BOTTLE_TEX, flat: true, name: "potionBody",
  });
  b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.10, 6), GOLD_DARK, {
    bone: core, at: [0.54, 1.68, 1.34], flat: true, name: "potionNeck",
  });
  glow(potion, 1.2);
  glow(b.part(new THREE.SphereGeometry(0.16, 6, 4), RED, {
    bone: core, at: [0.54, 1.48, 1.34], flat: true, name: "potionGlowCap",
  }), 0.8);

  const coin = new THREE.CylinderGeometry(0.12, 0.12, 0.045, 8);
  for (const [x, y, z, r] of [
    [-0.82, 1.83, 1.33, 18], [-0.66, 1.72, 1.34, -8], [0.78, 0.87, 1.34, 12], [0.70, 0.72, 1.35, -20],
  ] as const) {
    b.part(coin, GOLD, { bone: core, at: [x, y, z], rotation: [0, r, 0], flat: true, name: "goldCoin" });
    b.part(new THREE.BoxGeometry(0.045, 0.045, 0.025), GOLD_DARK, { bone: core, at: [x, y + 0.025, z + 0.06], name: "coinMark", flat: true });
  }

  b.part(new THREE.BoxGeometry(0.42, 0.08, 0.26), BONE_SHADE, {
    bone: core, at: [0.52, 1.02, 1.33], rotation: [0, 0, -12], name: "scrollRoll", flat: true,
  });
  b.part(new THREE.BoxGeometry(0.32, 0.03, 0.20), BONE, {
    bone: core, at: [0.52, 1.00, 1.37], rotation: [0, 0, -12], name: "scrollSheet", flat: true,
  });

  // Floating bubbles and a pair of bone fragments add depth to the captive treasure.
  for (const [x, y, z, r] of [
    [-0.82, 1.28, 1.37, 0.075], [0.72, 1.92, 1.30, 0.060], [0.70, 1.22, 1.36, 0.045], [-0.93, 0.91, 1.35, 0.045],
  ] as const) {
    glow(b.part(new THREE.SphereGeometry(r, 6, 4), SLIME_GLOW, { bone: core, at: [x, y, z], flat: true, name: "slimeBubble" }), 0.7);
  }
  b.rod([-0.88, 1.02, 1.33], [-0.52, 1.20, 1.33], 0.035, { bone: core, color: BONE, caps: "flat", name: "boneShardA" });
  b.rod([0.14, 1.93, 1.32], [0.40, 2.04, 1.32], 0.032, { bone: core, color: BONE_SHADE, caps: "flat", name: "boneShardB" });

  return b.root;
}
