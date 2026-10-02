import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { cellPaint, pixelTexture, pick, tileBox } from "../kits/pixel";

export const meta = {
  name: "Pixel Hero Sword",
  description: "A legendary hero sword locked in a rune-carved stone, built as a crisp pixel-art shrine.",
  style: "pixel art",
  commit: "e503085",
};

const TEXEL = 0.02;

const STONE_DARK = "#30334f";
const STONE = "#555a78";
const STONE_LIGHT = "#8589a4";
const MOSS = "#52705d";
const MOSS_LIGHT = "#83a36b";
const BLADE_DARK = "#273b63";
const BLADE = "#5d83b8";
const BLADE_LIGHT = "#b2d8e8";
const GOLD_DARK = "#744533";
const GOLD = "#c17c3c";
const GOLD_LIGHT = "#f2c45b";
const GRIP_DARK = "#37233a";
const GRIP = "#73405c";
const GRIP_LIGHT = "#a75f66";
const CYAN_DARK = "#14536a";
const CYAN = "#2bb3ad";
const CYAN_LIGHT = "#9df2c2";

const STONE_RAMP = [STONE_DARK, STONE, STONE_LIGHT];
const BLADE_RAMP = [BLADE_DARK, BLADE, BLADE_LIGHT];
const STONE_TILE = pixelTexture(32, 32, (g) => {
  g.fill((x, y) => {
    if (x % 8 === 0 || y % 8 === 0) return STONE_DARK;
    if ((x * 7 + y * 11) % 29 === 0) return STONE_LIGHT;
    return pick(STONE_RAMP, 0.45 + 0.22 * Math.sin(x * 0.8 + y * 0.35), (x + y) % 16 / 16);
  });
  for (const [x, y] of [[3, 5], [18, 12], [26, 26], [8, 24], [14, 3]]) {
    g.set(x, y, MOSS);
    g.set(x + 1, y, MOSS_LIGHT);
    g.set(x, y + 1, MOSS);
  }
});

const HANDLE_TILE = pixelTexture(16, 16, (g) => {
  g.fill((x, y) => (y % 4 === 0 ? GOLD_DARK : (x + y) % 5 === 0 ? GRIP_LIGHT : GRIP));
  for (let y = 1; y < 16; y += 4) {
    g.set(2, y, GRIP_DARK);
    g.set(13, y + 1, GRIP_DARK);
  }
});

const RUNES = pixelTexture(16, 32, (g) => {
  const rune = CYAN_LIGHT;
  const shadow = CYAN_DARK;
  for (const y of [2, 15, 28]) {
    g.set(7, y, shadow);
    g.set(8, y, rune);
    g.set(6, y + 1, shadow);
    g.set(7, y + 1, rune);
    g.set(8, y + 1, rune);
    g.set(9, y + 1, shadow);
    g.set(7, y + 2, rune);
    g.set(8, y + 2, shadow);
    g.set(5, y + 3, shadow);
    g.set(6, y + 3, rune);
    g.set(9, y + 3, rune);
    g.set(10, y + 3, shadow);
  }
  for (let y = 5; y < 28; y += 5) {
    g.set(7, y, rune);
    g.set(8, y, shadow);
  }
});

const CRACK = pixelTexture(24, 16, (g) => {
  const c = STONE_DARK;
  for (const [x, y] of [[12, 0], [12, 1], [11, 2], [12, 2], [10, 3], [11, 3], [9, 4], [10, 4], [9, 5], [8, 6], [9, 6], [7, 7], [8, 7], [6, 8], [7, 8], [5, 9], [4, 10], [5, 10], [3, 11], [2, 12], [3, 12]]) {
    g.set(x, y, c);
  }
  for (const [x, y] of [[11, 5], [10, 6], [10, 7], [14, 4], [15, 5], [16, 6], [17, 7], [18, 8]]) {
    g.set(x, y, c);
  }
});

const STONE_PAINT = cellPaint(TEXEL, (c) => {
  const value = 0.35 + 0.38 * c.n.y + 0.22 * (c.random(7) - 0.5);
  return c.pick(STONE_RAMP, value);
}, { dither: true });

const BLADE_PAINT = cellPaint(TEXEL, (c) => {
  const face = Math.max(0, c.n.z);
  const value = 0.28 + 0.48 * face + 0.18 * (c.random(11) - 0.5);
  return c.pick(BLADE_RAMP, value);
}, { dither: true });

const bladeOutline: [number, number, "sharp"][] = [
  [-0.08, 0, "sharp"],
  [0.08, 0, "sharp"],
  [0.09, 0.30, "sharp"],
  [0.13, 0.61, "sharp"],
  [0.00, 0.84, "sharp"],
  [-0.13, 0.61, "sharp"],
  [-0.09, 0.30, "sharp"],
];

const stoneOutline: [number, number, "sharp"][] = [
  [-0.31, 0, "sharp"],
  [0.27, 0, "sharp"],
  [0.33, 0.10, "sharp"],
  [0.25, 0.28, "sharp"],
  [0.17, 0.41, "sharp"],
  [-0.06, 0.45, "sharp"],
  [-0.25, 0.34, "sharp"],
  [-0.34, 0.16, "sharp"],
];

export default function build() {
  const b = createBuilder({ name: "pixelHeroSword", detail: 1, paintSize: 1024 });
  const root = b.joint("root", { at: [0, 0, 0], role: "spine" });

  // Three broad pixel-cut foundation tiers give the relic a grounded shrine silhouette.
  b.part(tileBox([0.86, 0.14, 0.68], STONE_TILE, TEXEL), STONE, {
    bone: root,
    at: [0, 0.07, 0],
    texture: STONE_TILE,
    name: "foundationBottom",
  });
  b.part(tileBox([0.73, 0.17, 0.58], STONE_TILE, TEXEL), STONE, {
    bone: root,
    at: [0, 0.225, 0],
    texture: STONE_TILE,
    name: "foundationMiddle",
  });
  b.part(tileBox([0.60, 0.16, 0.49], STONE_TILE, TEXEL), STONE, {
    bone: root,
    at: [0, 0.39, 0],
    texture: STONE_TILE,
    name: "foundationTop",
  });

  b.extrude(stoneOutline, {
    at: [0, 0.42, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: [0.42, 0.30],
    bevel: 0.012,
    color: STONE_PAINT,
    bone: root,
    name: "runestone",
  });

  // Mossy pixel flecks break up the clean stone tiers.
  const mossChips = [
    [-0.34, 0.13, 0.30, 0.08, 0.025], [0.28, 0.14, 0.26, 0.06, 0.02],
    [-0.24, 0.31, 0.26, 0.05, 0.018], [0.18, 0.33, 0.22, 0.07, 0.022],
    [-0.37, 0.47, 0.17, 0.06, 0.018], [0.27, 0.54, 0.12, 0.05, 0.016],
    [-0.08, 0.77, 0.16, 0.05, 0.014], [0.15, 0.72, 0.10, 0.04, 0.014],
  ];
  mossChips.forEach(([x, y, z, w, d], i) => {
    b.part(new THREE.BoxGeometry(w, 0.018 + (i % 2) * 0.008, d), i % 2 ? MOSS : MOSS_LIGHT, {
      bone: root,
      at: [x, y, z],
      name: `mossChip${i}`,
      flat: true,
    });
  });

  // Front-face cracks are actual pixel textures, not smooth decals.
  b.part(new THREE.PlaneGeometry(0.24, 0.16), STONE_DARK, {
    bone: root,
    at: [-0.13, 0.54, 0.217],
    dir: [0, 0, 1],
    axis: "z",
    texture: CRACK,
    name: "stoneCrackFront",
  });
  b.part(new THREE.PlaneGeometry(0.18, 0.12), STONE_DARK, {
    bone: root,
    at: [0.20, 0.29, 0.294],
    dir: [0, 0, 1],
    axis: "z",
    texture: CRACK,
    name: "stoneCrackTier",
  });

  // A broad, faceted blade is planted deeply into the top of the stone.
  b.extrude(bladeOutline, {
    at: [0, 0.55, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: [0.050, 0.030],
    color: BLADE_PAINT,
    bone: root,
    name: "heroBlade",
  });
  const fullerOutline: [number, number, "sharp"][] = [
    [-0.018, 0.06, "sharp"], [0.018, 0.06, "sharp"], [0.026, 0.58, "sharp"], [0, 0.73, "sharp"], [-0.026, 0.58, "sharp"],
  ];
  b.extrude(fullerOutline, {
    at: [0, 0.55, 0.031],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.009,
    color: BLADE_LIGHT,
    bone: root,
    name: "bladeFuller",
  });
  b.part(new THREE.PlaneGeometry(0.105, 0.27), CYAN, {
    bone: root,
    at: [0, 0.94, 0.039],
    dir: [0, 0, 1],
    axis: "z",
    texture: RUNES,
    name: "bladeRunesFront",
  });
  b.part(new THREE.PlaneGeometry(0.105, 0.27), CYAN, {
    bone: root,
    at: [0, 0.94, -0.039],
    dir: [0, 0, -1],
    axis: "z",
    texture: RUNES,
    name: "bladeRunesBack",
  });

  // Pixel-stepped crossguard, with a cyan jewel and gold end caps.
  const guardOutline: [number, number, "sharp"][] = [
    [-0.31, 0.00, "sharp"], [0.31, 0.00, "sharp"], [0.27, 0.055, "sharp"],
    [0.17, 0.10, "sharp"], [-0.17, 0.10, "sharp"], [-0.27, 0.055, "sharp"],
  ];
  b.extrude(guardOutline, {
    at: [0, 1.375, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: [0.105, 0.075],
    color: GOLD,
    bone: root,
    name: "crossguard",
  });
  b.part(new THREE.BoxGeometry(0.13, 0.09, 0.13), GOLD_DARK, {
    bone: root,
    at: [0, 1.405, 0],
    name: "guardCore",
    flat: true,
  });
  for (const side of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.075, 0.062, 0.12), GOLD_LIGHT, {
      bone: root,
      at: [side * 0.255, 1.414, 0],
      name: `guardCap${side < 0 ? "L" : "R"}`,
      flat: true,
    });
    b.part(new THREE.BoxGeometry(0.045, 0.052, 0.126), CYAN, {
      bone: root,
      at: [side * 0.20, 1.42, 0.008],
      name: `guardGem${side < 0 ? "L" : "R"}`,
      flat: true,
    });
  }
  b.part(new THREE.BoxGeometry(0.06, 0.045, 0.14), GOLD_LIGHT, {
    bone: root,
    at: [0, 1.423, 0.01],
    name: "guardRune",
    texture: RUNES,
  });

  // Wrapped grip: alternating pixel bands read clearly from every angle.
  b.part(new THREE.BoxGeometry(0.115, 0.285, 0.115), GRIP, {
    bone: root,
    at: [0, 1.555, 0],
    texture: HANDLE_TILE,
    name: "gripCore",
  });
  for (let i = 0; i < 6; i++) {
    b.part(new THREE.BoxGeometry(0.132, 0.022, 0.132), i % 2 ? GOLD_DARK : GRIP_DARK, {
      bone: root,
      at: [0, 1.435 + i * 0.047, 0],
      name: `gripBand${i}`,
      flat: true,
    });
    b.part(new THREE.BoxGeometry(0.030, 0.014, 0.014), GOLD_LIGHT, {
      bone: root,
      at: [0.058, 1.447 + i * 0.047, 0.066],
      name: `gripRivet${i}`,
      flat: true,
    });
  }
  b.part(new THREE.BoxGeometry(0.15, 0.045, 0.15), GOLD, {
    bone: root,
    at: [0, 1.715, 0],
    name: "pommelCollar",
    flat: true,
  });
  b.part(new THREE.OctahedronGeometry(0.105, 0), GOLD_LIGHT, {
    bone: root,
    at: [0, 1.80, 0],
    name: "pommelCrown",
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.040, 0.040, 0.018), CYAN_LIGHT, {
    bone: root,
    at: [0, 1.80, 0.094],
    name: "pommelGem",
    flat: true,
  });

  // Tiny exposed stone shards and rune blocks make the impact site feel ancient.
  const shards = [
    [-0.20, 0.73, 0.17, 0.06, 0.05], [0.22, 0.67, 0.16, 0.05, 0.04],
    [-0.29, 0.58, -0.15, 0.05, 0.07], [0.28, 0.50, -0.14, 0.06, 0.06],
    [-0.11, 0.80, -0.17, 0.04, 0.04], [0.12, 0.79, 0.18, 0.05, 0.04],
  ];
  shards.forEach(([x, y, z, w, d], i) => {
    b.part(new THREE.BoxGeometry(w, 0.05 + (i % 3) * 0.012, d), i % 2 ? STONE_LIGHT : STONE_DARK, {
      bone: root,
      at: [x, y, z],
      name: `stoneShard${i}`,
      flat: true,
    });
  });
  for (const side of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.045, 0.018, 0.012), CYAN, {
      bone: root,
      at: [side * 0.13, 0.755, 0.218],
      name: `runeSpark${side < 0 ? "L" : "R"}`,
      flat: true,
    });
  }
  // Freshly chipped highlights on the fuller and a small glyph row on the stone.
  for (const [x, y, w] of [[-0.052, 1.17, 0.026], [0.050, 1.25, 0.020], [-0.044, 1.31, 0.016]]) {
    b.part(new THREE.BoxGeometry(w, 0.018, 0.010), BLADE_LIGHT, {
      bone: root,
      at: [x, y, 0.042],
      name: `bladeGlimmer${Math.round(y * 100)}`,
      flat: true,
    });
  }
  for (const [x, y, w] of [[-0.19, 0.59, 0.040], [-0.14, 0.64, 0.022], [0.14, 0.60, 0.030], [0.19, 0.65, 0.018]]) {
    b.part(new THREE.BoxGeometry(w, 0.018, 0.012), y > 0.62 ? CYAN_LIGHT : CYAN, {
      bone: root,
      at: [x, y, 0.219],
      name: `stoneGlyph${Math.round((x + 0.2) * 100)}${Math.round(y * 100)}`,
      flat: true,
    });
  }

  return b.root;
}
