import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { cel } from "../kits/toon";
import { glow } from "../kits/glow";

const ROCK = cel("#6575b8", "#344078");
const ROCK_DARK = cel("#4b5791", "#262d5e");
const EARTH = cel("#9b6248", "#603844");
const GRASS = cel("#70d99a", "#2b8a72");
const GRASS_LIGHT = cel("#b5f2ad", "#4da77f");
const STONE = cel("#ddd9f4", "#8278b1");
const STONE_DARK = cel("#aaa5d1", "#5a5288");
const GOLD = cel("#ffd978", "#b66d42");
const WOOD = cel("#9b624e", "#5a3445");
const LEAF = cel("#69d9b0", "#2f8a91");
const LEAF_LIGHT = cel("#a7f0c3", "#4cae98");
const WATER = cel("#78eaf2", "#2c88d2", { threshold: -0.02 });

export const meta = {
  name: "Luminous Skyroot Sanctuary",
  description: "A cel-shaded Genshin Impact-inspired floating island with ancient ruins, waterfalls, glowing runes, and wind-bent trees.",
  style: "Genshin Impact",
  commit: "9555ebf",
};

export default function build() {
  const b = createBuilder({ name: "floatingIslandDiorama", detail: 0.85, paintSize: 1024 });
  const root = b.joint("islandRoot", { at: [0, 0, 0], role: "spine" });

  // The island is built as a faceted inverted mountain, with a soft grassy crown.
  b.part(new THREE.ConeGeometry(1.22, 1.28, 9, 1), ROCK, {
    bone: root,
    at: [0, 0.68, 0],
    rotation: [180, 0, 0],
    flat: true,
    name: "islandRock",
  });
  b.part(new THREE.CylinderGeometry(1.21, 1.1, 0.18, 12), EARTH, {
    bone: root,
    at: [0, 1.34, 0],
    flat: true,
    name: "earthRim",
  });
  b.part(new THREE.CylinderGeometry(1.12, 1.08, 0.12, 12), GRASS, {
    bone: root,
    at: [0, 1.47, 0],
    flat: true,
    name: "grassCrown",
  });
  b.part(new THREE.ConeGeometry(0.84, 0.82, 7, 1), ROCK_DARK, {
    bone: root,
    at: [0, 0.39, -0.04],
    rotation: [180, 0, 18],
    flat: true,
    name: "deepStone",
  });

  // Chunky floating shards make the underside feel carved rather than spherical.
  const shards: Array<[number, number, number, number, number, number]> = [
    [-0.8, 0.77, -0.46, 0.26, 0.48, -22],
    [0.82, 0.7, -0.18, 0.22, 0.42, 26],
    [-0.58, 0.54, 0.56, 0.2, 0.38, -12],
    [0.54, 0.47, 0.56, 0.24, 0.44, 18],
    [0.12, 0.26, -0.7, 0.18, 0.34, 6],
  ];
  for (const [x, y, z, r, h, rz] of shards) {
    b.part(new THREE.ConeGeometry(r, h, 5, 1), ROCK_DARK, {
      bone: root,
      at: [x, y, z],
      rotation: [180, 0, rz],
      flat: true,
      name: "rockShard",
    });
  }

  // Cloud puffs tucked below the island sell the height and provide a readable silhouette.
  const clouds: Array<[number, number, number, number, number, number]> = [
    [-0.72, 0.42, 0.3, 0.42, 0.2, 0.34],
    [0.72, 0.34, 0.22, 0.45, 0.18, 0.34],
    [0, 0.2, -0.3, 0.52, 0.18, 0.36],
    [-0.18, 0.57, 0.65, 0.34, 0.15, 0.25],
  ];
  for (const [x, y, z, sx, sy, sz] of clouds) {
    b.part(new THREE.IcosahedronGeometry(1, 1), cel("#eef7ff", "#a6b6e3"), {
      bone: root,
      at: [x, y, z],
      scale: [sx, sy, sz],
      flat: true,
      name: "cloudPuff",
    });
  }

  // Ruined shrine: two columns, broken lintel, and violet-gold inlays.
  for (const x of [-0.43, 0.43]) {
    b.part(new THREE.CylinderGeometry(0.14, 0.17, 0.94, 8), STONE, {
      bone: root,
      at: [x, 1.95, -0.22],
      flat: true,
      name: "ruinColumn",
    });
    b.part(new THREE.CylinderGeometry(0.2, 0.17, 0.1, 8), STONE_DARK, {
      bone: root,
      at: [x, 2.44, -0.22],
      flat: true,
      name: "columnCap",
    });
    b.part(new THREE.CylinderGeometry(0.18, 0.18, 0.07, 8), GOLD, {
      bone: root,
      at: [x, 2.5, -0.22],
      flat: true,
      name: "goldCapital",
    });
    b.part(new THREE.BoxGeometry(0.12, 0.6, 0.035), GOLD, {
      bone: root,
      at: [x, 1.98, -0.045],
      rotation: [0, 0, x > 0 ? -7 : 7],
      flat: true,
      name: "columnInlay",
    });
  }
  b.part(new THREE.BoxGeometry(0.62, 0.18, 0.31), STONE, {
    bone: root,
    at: [-0.24, 2.56, -0.22],
    rotation: [0, 0, -4],
    flat: true,
    name: "brokenLintelA",
  });
  b.part(new THREE.BoxGeometry(0.3, 0.18, 0.31), STONE_DARK, {
    bone: root,
    at: [0.38, 2.52, -0.22],
    rotation: [0, 0, 11],
    flat: true,
    name: "brokenLintelB",
  });
  b.part(new THREE.BoxGeometry(0.08, 0.08, 0.36), GOLD, {
    bone: root,
    at: [0.03, 2.53, -0.04],
    flat: true,
    name: "lintelGem",
  });

  // A small staircase descends from the shrine toward the waterfall.
  for (let i = 0; i < 4; i += 1) {
    b.part(new THREE.BoxGeometry(0.38 - i * 0.035, 0.1, 0.22), STONE_DARK, {
      bone: root,
      at: [0, 1.54 + i * 0.08, 0.16 + i * 0.16],
      flat: true,
      name: "shrineStep",
    });
  }

  // Wind-bent trees frame the ruins. Their trunks use rods so the roots visibly meet the soil.
  const trees: Array<[number, number, number, number]> = [
    [-0.72, 1.48, -0.36, -1],
    [0.7, 1.48, -0.55, 1],
    [0.82, 1.48, 0.22, 1],
  ];
  for (const [x, y, z, bend] of trees) {
    b.rod([x, y, z], [x + bend * 0.1, y + 0.64, z - 0.03], 0.075, {
      bone: root,
      color: WOOD,
      section: { ngon: 6 },
      name: "treeTrunk",
    });
    b.rod([x + bend * 0.08, y + 0.5, z], [x + bend * 0.22, y + 0.98, z + 0.02], 0.045, {
      bone: root,
      color: WOOD,
      section: { ngon: 6 },
      name: "treeBranch",
    });
    b.part(new THREE.IcosahedronGeometry(0.34, 1), LEAF, {
      bone: root,
      at: [x + bend * 0.18, y + 0.96, z],
      scale: [1.08, 1.18, 0.92],
      flat: true,
      name: "treeCrown",
    });
    b.part(new THREE.IcosahedronGeometry(0.22, 1), LEAF_LIGHT, {
      bone: root,
      at: [x + bend * 0.06, y + 1.16, z + 0.08],
      scale: [1.2, 0.88, 0.94],
      flat: true,
      name: "treeCrownLight",
    });
  }

  // A blue-white waterfall spills over the front edge in several distinct ribbons.
  const streams: Array<[number, number]> = [
    [-0.29, 0.02],
    [-0.15, -0.03],
    [0.02, 0.04],
    [0.18, -0.02],
    [0.31, 0.05],
  ];
  for (const [x, drift] of streams) {
    b.sweep(
      [
        [x, 1.38, 0.96],
        [x + drift, 1.08, 1.02],
        [x - drift * 0.8, 0.7, 1.08],
        [x + drift, 0.18, 1.12],
      ],
      [0.065, 0.026],
      { bone: root, color: WATER, section: { ngon: 5 }, caps: "round", name: "waterfallRibbon" },
    );
  }
  const pool = b.part(new THREE.CylinderGeometry(0.48, 0.42, 0.035, 12), "#65dce9", {
    bone: root,
    at: [0, 0.13, 1.08],
    flat: true,
    name: "waterPool",
  });
  glow(pool, 0.9);

  // Gold-violet rune stones and luminous crystals decorate the water's landing.
  const runePositions: Array<[number, number, number, number]> = [
    [-0.58, 1.53, 0.54, -18],
    [0.59, 1.53, 0.45, 21],
    [-0.83, 1.54, -0.03, -8],
    [0.8, 1.54, -0.08, 12],
  ];
  for (const [x, y, z, rot] of runePositions) {
    b.part(new THREE.BoxGeometry(0.16, 0.09, 0.23), GOLD, {
      bone: root,
      at: [x, y, z],
      rotation: [0, rot, 0],
      flat: true,
      name: "runeStone",
    });
    const crystal = b.part(new THREE.OctahedronGeometry(0.09, 0), "#a5f7ff", {
      bone: root,
      at: [x, y + 0.16, z],
      rotation: [0, rot, 0],
      flat: true,
      name: "glowingCrystal",
    });
    glow(crystal, 1.8);
  }

  // Tiny grass blades and a few carved border stones make the plateau feel inhabited.
  const tufts: Array<[number, number, number, number]> = [
    [-0.98, 1.56, -0.12, 0.3],
    [-0.84, 1.55, 0.42, -0.2],
    [0.96, 1.55, 0.28, 0.15],
    [0.58, 1.55, 0.72, -0.4],
    [-0.45, 1.55, 0.74, 0.2],
    [0.02, 1.55, -0.91, 0],
  ];
  for (const [x, y, z, lean] of tufts) {
    b.part(new THREE.ConeGeometry(0.045, 0.2, 4, 1), GRASS_LIGHT, {
      bone: root,
      at: [x, y + 0.08, z],
      rotation: [lean * 18, lean * 12, lean * 20],
      flat: true,
      name: "grassTuft",
    });
  }
  for (const [x, z, rot] of [
    [-0.96, -0.62, -12],
    [0.96, -0.52, 18],
    [-0.96, 0.2, 8],
    [0.96, 0.02, -15],
  ] as Array<[number, number, number]>) {
    b.part(new THREE.BoxGeometry(0.2, 0.16, 0.3), STONE_DARK, {
      bone: root,
      at: [x, 1.57, z],
      rotation: [0, rot, 0],
      flat: true,
      name: "borderStone",
    });
  }

  // A suspended banner catches the same cyan light as the waterfall.
  b.part(new THREE.BoxGeometry(0.05, 0.58, 0.05), GOLD, {
    bone: root,
    at: [0, 2.72, -0.22],
    flat: true,
    name: "bannerPole",
  });
  b.part(new THREE.BoxGeometry(0.3, 0.38, 0.018), "#8a63d8", {
    bone: root,
    at: [0.16, 2.57, -0.2],
    rotation: [0, 0, -7],
    flat: true,
    name: "banner",
  });
  const bannerGem = b.part(new THREE.OctahedronGeometry(0.055, 0), "#b6f4ff", {
    bone: root,
    at: [0, 2.74, -0.21],
    flat: true,
    name: "bannerGem",
  });
  glow(bannerGem, 1.4);

  return b.root;
}
