import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Builder } from "../src/builder";
import { catmull, polyline } from "../src/path";
import { grain, countershade, type Paint } from "../src/paint";
import { cel, furEdge, INK } from "../kits/toon";
import { glow } from "../kits/glow";

function box(
  b: Builder,
  name: string,
  size: [number, number, number],
  at: [number, number, number],
  color: string | Paint,
  rotation: [number, number, number] = [0, 0, 0],
  bevel = 0,
) {
  return b.part(new THREE.BoxGeometry(...size, bevel ? 2 : 1, bevel ? 1 : 1, bevel ? 2 : 1), color, {
    at,
    rotation,
    flat: true,
    name,
  });
}

const WOOD_LIGHT = cel("#c77855", "#69394b");
const ROOF = cel("#31517f", "#18284e");
const ROOF_EDGE = cel("#5d83bd", "#273f74");
const WALL = cel("#f5dca7", "#b77b79");
const PAPER = cel("#fff1c7", "#d9a68e");
const STONE = cel("#68748f", "#343a60");
const STONE_LIGHT = cel("#8c9bb2", "#4b5276");
const LEAF = cel("#3f9b78", "#1c5363");
const LEAF_LIGHT = cel("#7acb8a", "#32766d");
const BLOSSOM_LIGHT = cel("#ffd2df", "#d177a1");
const GOLD = cel("#ffd36a", "#b96845");
const RED = cel("#d95256", "#722e52");
const WATER = cel("#55b9cf", "#2c668e");
const INK_PAINT = furEdge(WOOD_LIGHT, INK, {
  level: 0.38,
  teeth: 0.06,
  period: 0.18,
  axis: [0, 1, 0],
  along: [1, 0, 0],
});
const WOOD_GRAIN = grain(INK_PAINT, WOOD_LIGHT, { size: 0.28, axis: "y", seed: 12 });
const STONE_MOTTLE = countershade(STONE_LIGHT, STONE, { level: -0.15, soft: 0.12 });

function cyl(
  b: Builder,
  name: string,
  radius: number,
  height: number,
  at: [number, number, number],
  color: string | Paint,
  segments = 8,
) {
  return b.part(new THREE.CylinderGeometry(radius, radius * 1.05, height, segments), color, {
    at,
    flat: true,
    name,
  });
}

function sphere(
  b: Builder,
  name: string,
  radius: number,
  at: [number, number, number],
  color: string | Paint,
  segments = 8,
) {
  return b.part(new THREE.IcosahedronGeometry(radius, segments <= 8 ? 1 : 2), color, {
    at,
    flat: true,
    name,
  });
}

export const meta = {
  name: "Moonbridge Tea House",
  description: "A high-fantasy anime mountain tea house with a blossom tree, lanterns, and a little arched bridge.",
  style: "high-fantasy anime",
  commit: "34f986c",
};

export default function build() {
  const b = createBuilder({ name: "teaHouseDiorama", detail: 1.25, paintSize: 1024 });
  const foundation = b.joint("foundation", { at: [0, 0, 0], role: "spine" });

  // Ground, stream, and layered mountain garden.
  box(b, "groundPlinth", [6.8, 0.24, 5.2], [0, 0.12, 0], STONE_MOTTLE);
  box(b, "gardenMoss", [6.45, 0.08, 4.85], [0, 0.29, 0], cel("#76ae82", "#3a6b6e"));
  const stream = b.sweep(
    catmull([
      [-3.1, 0.38, 1.45],
      [-1.9, 0.36, 1.7],
      [-0.55, 0.35, 1.35],
      [0.65, 0.34, 1.62],
      [2.8, 0.36, 1.38],
    ]),
    0.34,
    { color: WATER, section: { ngon: 6 }, caps: "round", name: "mountainStream" },
  );
  for (let i = 0; i < 13; i += 1) {
    const x = -2.9 + i * 0.47;
    const z = 1.35 + Math.sin(i * 1.7) * 0.24;
    sphere(b, `streamStone${i}`, 0.14 + (i % 3) * 0.025, [x, 0.43, z], STONE_LIGHT, 8);
  }
  const mountainSpots: [number, number, number, number][] = [
    [-2.8, 1.1, -1.7, 0.9],
    [2.65, 1.4, -1.65, 1.05],
    [3.25, 0.75, -0.9, 0.65],
    [-3.35, 0.78, -0.7, 0.72],
  ];
  for (let i = 0; i < mountainSpots.length; i += 1) {
    const [x, y, z, r] = mountainSpots[i];
    b.part(new THREE.ConeGeometry(r, y * 2.2, 7), STONE_MOTTLE, {
      at: [x, y + 0.28, z],
      rotation: [0, i * 0.35, 0],
      flat: true,
      name: `mountainRock${i}`,
    });
    sphere(b, `mountainCap${i}`, r * 0.48, [x + 0.08, y * 1.64 + 0.3, z + 0.04], STONE_LIGHT, 8);
  }

  // Raised tea house platform and foundation stones.
  box(b, "houseDeck", [3.9, 0.22, 2.55], [0, 0.58, -0.12], WOOD_GRAIN);
  for (const x of [-1.65, -0.55, 0.55, 1.65]) {
    cyl(b, `deckPost${x}`, 0.16, 0.48, [x, 0.38, -0.86], STONE_MOTTLE, 8);
    cyl(b, `deckPostFront${x}`, 0.16, 0.48, [x, 0.38, 0.62], STONE_MOTTLE, 8);
  }

  // Main walls, dark timber frame, and shoji panel rhythm.
  box(b, "backWall", [3.55, 2.05, 0.18], [0, 1.75, -1.18], WALL);
  box(b, "leftWall", [0.18, 2.05, 2.22], [-1.76, 1.75, -0.12], WALL);
  box(b, "rightWall", [0.18, 2.05, 2.22], [1.76, 1.75, -0.12], WALL);
  box(b, "frontLintel", [3.6, 0.22, 0.2], [0, 2.57, 0.9], WOOD_GRAIN);
  for (const x of [-1.63, -0.72, 0.72, 1.63]) {
    box(b, `frontPost${x}`, [0.16, 2.06, 0.18], [x, 1.72, 0.9], WOOD_GRAIN);
  }
  for (const y of [1.02, 1.72, 2.42]) {
    box(b, `frontBeam${y}`, [3.45, 0.13, 0.19], [0, y, 0.9], WOOD_GRAIN);
  }
  for (const x of [-1.18, -0.25, 0.25, 1.18]) {
    box(b, `shojiMullion${x}`, [0.08, 1.35, 0.1], [x, 1.74, 0.79], WOOD_LIGHT);
  }
  for (const y of [1.39, 1.75, 2.1]) {
    box(b, `shojiCrossbar${y}`, [3.2, 0.06, 0.12], [0, y, 0.79], WOOD_LIGHT);
  }
  // A warm central entry, framed by gold and red accents.
  box(b, "entryDark", [0.82, 1.55, 0.08], [0, 1.45, 1.0], "#3a2548");
  box(b, "entryGoldTop", [1.08, 0.1, 0.12], [0, 2.25, 1.06], GOLD);
  box(b, "entryGoldL", [0.1, 1.45, 0.12], [-0.53, 1.52, 1.06], GOLD);
  box(b, "entryGoldR", [0.1, 1.45, 0.12], [0.53, 1.52, 1.06], GOLD);
  for (const x of [-0.34, 0.34]) {
    box(b, "entryRedRibbon", [0.08, 1.34, 0.1], [x, 1.48, 1.1], RED);
  }

  // Roof: broad layered eaves and a jewel-like ridge ornament.
  box(b, "roofUnderlay", [4.35, 0.2, 2.78], [0, 2.78, -0.1], WOOD_GRAIN);
  box(b, "roofLeft", [4.55, 0.18, 1.55], [0, 3.25, 0.38], ROOF, [Math.PI * 0.25, 0, 0]);
  box(b, "roofRight", [4.55, 0.18, 1.55], [0, 3.25, -0.58], ROOF, [-Math.PI * 0.25, 0, 0]);
  box(b, "eaveFront", [4.75, 0.18, 0.2], [0, 2.84, 1.16], ROOF_EDGE);
  box(b, "eaveBack", [4.75, 0.18, 0.2], [0, 2.84, -1.36], ROOF_EDGE);
  for (const x of [-2.05, -1.25, -0.45, 0.45, 1.25, 2.05]) {
    sphere(b, `eaveBell${x}`, 0.075, [x, 2.69, 1.23], GOLD, 8);
    b.rod([x, 2.7, 1.2], [x, 2.48, 1.2], 0.018, { color: GOLD, name: `eaveTasselRod${x}` });
    b.sweep(polyline([[x, 2.49, 1.2], [x - 0.04, 2.34, 1.2], [x + 0.05, 2.22, 1.2]]), 0.022, {
      color: RED,
      section: { ngon: 5 },
      caps: "round",
      name: `eaveTassel${x}`,
    });
  }
  box(b, "ridgeBeam", [4.5, 0.17, 0.2], [0, 3.7, -0.1], ROOF_EDGE);
  for (const x of [-1.55, -0.8, -0.05, 0.7, 1.45]) {
    sphere(b, `ridgeOrnament${x}`, 0.11, [x, 3.78, -0.1], GOLD, 8);
  }
  b.part(new THREE.OctahedronGeometry(0.22, 0), GOLD, { at: [0, 3.92, -0.1], flat: true, name: "ridgeJewel" });
  b.rod([-0.2, 3.83, -0.1], [0.2, 3.83, -0.1], 0.028, { color: RED, name: "ridgeRubyBar" });

  // Interior glow visible through the doorway and side windows.
  glow(box(b, "entryGlow", [0.66, 1.35, 0.035], [0, 1.46, 1.13], "#ffba67"), 1.8);
  glow(box(b, "leftWindowGlow", [0.06, 0.68, 1.05], [-1.86, 1.74, -0.22], "#ffd47c"), 1.2);
  glow(box(b, "rightWindowGlow", [0.06, 0.68, 1.05], [1.86, 1.74, -0.22], "#ffd47c"), 1.2);

  // Tea service on the deck: low table, brazier, kettle, cups and scrolls.
  box(b, "teaTableTop", [1.45, 0.12, 0.72], [0, 0.94, -0.18], WOOD_LIGHT);
  for (const x of [-0.55, 0.55]) {
    for (const z of [-0.4, 0.1]) {
      cyl(b, `teaTableLeg${x}${z}`, 0.07, 0.34, [x, 0.73, z], WOOD_GRAIN, 7);
    }
  }
  cyl(b, "brazierBody", 0.2, 0.18, [0, 1.1, -0.18], RED, 8);
  glow(sphere(b, "brazierCoal", 0.13, [0, 1.25, -0.18], "#ff6a3b", 8), 2.2);
  const kettle = b.lathe(
    [[0.0, -0.16], [0.16, -0.13], [0.22, -0.05], [0.2, 0.08], [0.13, 0.15], [0.0, 0.17]],
    { at: [-0.32, 1.22, -0.18], axis: [0, 1, 0], segments: 10, color: GOLD, name: "teaKettle" },
  );
  b.rod([-0.5, 1.33, -0.18], [-0.15, 1.45, -0.18], 0.035, { color: INK, name: "kettleHandle" });
  b.rod([-0.1, 1.26, -0.2], [0.14, 1.3, -0.2], 0.03, { color: GOLD, name: "kettleSpout" });
  for (const x of [-0.68, 0.35]) {
    cyl(b, `teaCup${x}`, 0.09, 0.1, [x, 1.08, 0.1], PAPER, 8);
    cyl(b, `teaCupTea${x}`, 0.065, 0.015, [x, 1.14, 0.1], "#9d503f", 8);
  }
  box(b, "teaScroll", [0.42, 0.035, 0.18], [0.45, 1.05, -0.42], PAPER, [0.1, 0.15, -0.12]);
  for (const z of [-0.47, -0.37]) box(b, "scrollEnd", [0.04, 0.06, 0.24], [0.23, 1.07, z], GOLD, [0, 0, 0.12]);

  // Hanging lanterns with decorative bands.
  for (const [x, z] of [[-1.35, 0.88], [1.35, 0.88]] as [number, number][]) {
    b.rod([x, 2.58, z], [x, 2.18, z], 0.022, { color: INK, name: `lanternCord${x}` });
    const lantern = box(b, `lantern${x}`, [0.34, 0.48, 0.34], [x, 2.02, z], "#f1a94f");
    glow(lantern, 1.7);
    box(b, `lanternTop${x}`, [0.42, 0.06, 0.42], [x, 2.28, z], RED);
    box(b, `lanternBottom${x}`, [0.42, 0.06, 0.42], [x, 1.77, z], RED);
    for (const rot of [0, Math.PI / 2]) box(b, `lanternBand${x}${rot}`, [0.025, 0.44, 0.025], [x, 2.02, z], GOLD, [0, rot, 0]);
  }

  // Curving moon bridge over the stream.
  for (let i = 0; i < 9; i += 1) {
    const t = i / 8;
    const x = -1.9 + t * 3.7;
    const z = 1.65 + Math.sin(t * Math.PI) * 0.5;
    const y = 0.74 + Math.sin(t * Math.PI) * 0.34;
    box(b, `bridgePlank${i}`, [0.42, 0.12, 0.85], [x, y, z], WOOD_GRAIN, [0.16 * Math.cos(t * Math.PI), 0, 0]);
    box(b, `bridgeRimL${i}`, [0.08, 0.22, 0.87], [x - 0.21, y + 0.14, z], WOOD_LIGHT, [0.16 * Math.cos(t * Math.PI), 0, 0]);
    box(b, `bridgeRimR${i}`, [0.08, 0.22, 0.87], [x + 0.21, y + 0.14, z], WOOD_LIGHT, [0.16 * Math.cos(t * Math.PI), 0, 0]);
    if (i % 2 === 0) {
      sphere(b, `bridgeStudL${i}`, 0.045, [x - 0.21, y + 0.28, z], GOLD, 8);
      sphere(b, `bridgeStudR${i}`, 0.045, [x + 0.21, y + 0.28, z], GOLD, 8);
    }
  }
  const railPathL = catmull([
    [-1.9, 1.12, 1.65],
    [-1.0, 1.4, 1.97],
    [0, 1.55, 2.15],
    [1, 1.4, 1.97],
    [1.8, 1.12, 1.65],
  ]);
  const railPathR = catmull([
    [-1.9, 1.12, 1.23],
    [-1.0, 1.4, 1.55],
    [0, 1.55, 1.73],
    [1, 1.4, 1.55],
    [1.8, 1.12, 1.23],
  ]);
  b.sweep(railPathL, 0.06, { color: WOOD_LIGHT, section: { ngon: 6 }, caps: "round", name: "bridgeRailL" });
  b.sweep(railPathR, 0.06, { color: WOOD_LIGHT, section: { ngon: 6 }, caps: "round", name: "bridgeRailR" });
  for (const t of [0, 0.2, 0.4, 0.6, 0.8, 1]) {
    const z = 1.44 + Math.sin(t * Math.PI) * 0.5;
    const x = -1.9 + t * 3.7;
    const y = 0.92 + Math.sin(t * Math.PI) * 0.27;
    b.rod([x, y, z - 0.18], [x, y + 0.2, z - 0.18], 0.035, { color: WOOD_LIGHT, name: `bridgeBaluster${t}` });
    b.rod([x, y, z + 0.18], [x, y + 0.2, z + 0.18], 0.035, { color: WOOD_LIGHT, name: `bridgeBalusterOther${t}` });
  }

  // Cherry tree: trunk, branching silhouette, leaf clusters, and blossom sprays.
  const trunkPath = catmull([
    [-2.25, 0.36, -0.35],
    [-2.2, 1.25, -0.38],
    [-2.0, 2.08, -0.44],
    [-1.65, 2.72, -0.5],
    [-1.35, 3.25, -0.42],
  ]);
  b.sweep(trunkPath, (t) => 0.22 - t * 0.13, { color: WOOD_GRAIN, section: { ngon: 7 }, caps: "round", name: "cherryTrunk" });
  const branchPaths = [
    [[-2.05, 2.0, -0.42], [-2.65, 2.45, -0.35], [-3.0, 2.9, -0.28], [-3.3, 3.08, -0.22]],
    [[-1.76, 2.48, -0.5], [-1.35, 2.75, -0.35], [-0.75, 2.96, -0.25], [-0.3, 3.18, -0.2]],
    [[-1.5, 2.9, -0.46], [-1.15, 3.3, -0.4], [-0.75, 3.55, -0.32], [-0.38, 3.72, -0.25]],
    [[-2.18, 1.62, -0.4], [-2.65, 1.93, -0.2], [-3.05, 2.16, -0.12]],
  ];
  for (let i = 0; i < branchPaths.length; i += 1) {
    b.sweep(catmull(branchPaths[i]), (t) => 0.11 - t * 0.07, { color: WOOD_GRAIN, section: { ngon: 6 }, caps: "round", name: `cherryBranch${i}` });
  }
  const leafClusters: [number, number, number, number][] = [
    [-3.16, 3.14, -0.2, 0.56],
    [-2.7, 2.85, -0.28, 0.62],
    [-2.0, 3.18, -0.28, 0.66],
    [-1.25, 3.55, -0.26, 0.58],
    [-0.45, 3.76, -0.2, 0.52],
    [-0.9, 3.03, -0.18, 0.55],
    [-2.9, 2.2, -0.1, 0.42],
  ];
  for (let i = 0; i < leafClusters.length; i += 1) {
    const [x, y, z, r] = leafClusters[i];
    sphere(b, `cherryFoliage${i}`, r, [x, y, z], LEAF, 8);
    sphere(b, `cherryFoliageLight${i}`, r * 0.62, [x + 0.13, y + 0.14, z + 0.06], LEAF_LIGHT, 8);
  }
  const blossoms: [number, number, number][] = [
    [-3.42, 3.2, -0.16], [-3.08, 3.36, -0.05], [-2.87, 2.74, 0.02], [-2.52, 3.0, -0.48],
    [-2.18, 3.38, -0.1], [-1.82, 3.12, 0.02], [-1.3, 3.76, -0.04], [-1.0, 3.46, -0.38],
    [-0.7, 3.98, -0.06], [-0.24, 3.77, -0.34], [-0.58, 3.2, 0.02], [-2.95, 2.22, 0.1],
  ];
  for (let i = 0; i < blossoms.length; i += 1) {
    const [x, y, z] = blossoms[i];
    sphere(b, `blossom${i}`, 0.16, [x, y, z], BLOSSOM_LIGHT, 8);
    sphere(b, `blossomCenter${i}`, 0.045, [x, y, z + 0.13], GOLD, 8);
    b.rod([x, y - 0.03, z], [x + 0.07, y - 0.15, z - 0.02], 0.014, { color: RED, name: `blossomStem${i}` });
  }

  // Sunburst crest above the entry, a small high-fantasy anime flourish.
  b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 12), GOLD, {
    at: [0, 2.68, 1.08],
    rotation: [Math.PI / 2, 0, 0],
    flat: true,
    name: "entrySunCrest",
  });
  b.part(new THREE.CylinderGeometry(0.19, 0.19, 0.07, 10), RED, {
    at: [0, 2.68, 1.12],
    rotation: [Math.PI / 2, 0, 0],
    flat: true,
    name: "entrySunCore",
  });
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    const x0 = Math.cos(a) * 0.24;
    const y0 = 2.68 + Math.sin(a) * 0.24;
    const x1 = Math.cos(a) * 0.38;
    const y1 = 2.68 + Math.sin(a) * 0.38;
    b.rod([x0, y0, 1.13], [x1, y1, 1.13], 0.022, { color: GOLD, name: `entrySunRay${i}` });
  }

  // Tiny flower pots at the porch corners tie the blossom tree back to the house.
  for (const s of [-1, 1]) {
    cyl(b, `porchPot${s}`, 0.15, 0.18, [s * 1.42, 0.94, 1.02], RED, 8);
    cyl(b, `porchSoil${s}`, 0.115, 0.025, [s * 1.42, 1.04, 1.02], "#4a3040", 8);
    for (let j = 0; j < 3; j += 1) {
      const px = s * (1.42 + (j - 1) * 0.1);
      const py = 1.2 + (j % 2) * 0.06;
      b.rod([px, 1.04, 1.02], [px, py, 1.02], 0.014, { color: LEAF, name: `porchStem${s}${j}` });
      sphere(b, `porchFlower${s}${j}`, 0.07, [px, py, 1.02], BLOSSOM_LIGHT, 8);
      sphere(b, `porchFlowerGold${s}${j}`, 0.022, [px, py, 1.08], GOLD, 8);
    }
  }

  // Small shrine marker and gold prayer plaques at the garden edge.
  box(b, "shrinePostL", [0.12, 0.95, 0.12], [2.58, 0.8, 0.2], RED);
  box(b, "shrinePostR", [0.12, 0.95, 0.12], [3.05, 0.8, 0.2], RED);
  box(b, "shrineTop", [0.78, 0.13, 0.2], [2.82, 1.32, 0.2], GOLD);
  box(b, "shrineRoof", [0.92, 0.12, 0.3], [2.82, 1.45, 0.2], ROOF);
  for (let i = 0; i < 4; i += 1) {
    box(b, `prayerPlaque${i}`, [0.16, 0.32, 0.03], [2.5 + i * 0.2, 0.58 + (i % 2) * 0.12, 0.34], GOLD, [0, 0.1 * i, 0.08 * (i - 2)]);
    b.rod([2.5 + i * 0.2, 0.9, 0.34], [2.5 + i * 0.2, 0.72, 0.34], 0.012, { color: RED, name: `plaqueCord${i}` });
  }

  // A few foreground stepping stones, grasses, and wind-borne petals.
  for (let i = 0; i < 11; i += 1) {
    const x = -2.9 + (i % 6) * 1.05;
    const z = 2.15 + Math.floor(i / 6) * 0.6 + Math.sin(i) * 0.12;
    sphere(b, `foregroundStone${i}`, 0.12 + (i % 3) * 0.018, [x, 0.42, z], STONE_LIGHT, 8);
  }
  for (let i = 0; i < 16; i += 1) {
    const x = -3.1 + (i % 8) * 0.82;
    const z = -2.05 + Math.floor(i / 8) * 0.55;
    const h = 0.18 + (i % 3) * 0.06;
    b.sweep(polyline([[x, 0.34, z], [x + 0.04, 0.34 + h, z + 0.02]]), 0.018, {
      color: i % 2 ? LEAF : LEAF_LIGHT,
      section: { ngon: 5 },
      caps: "point",
      name: `gardenGrass${i}`,
    });
  }
  for (let i = 0; i < 9; i += 1) {
    const x = -1.9 + (i % 3) * 0.78;
    const y = 1.0 + (i % 2) * 0.45;
    const z = 2.25 + Math.floor(i / 3) * 0.3;
    sphere(b, `fallenPetal${i}`, 0.045, [x, y, z], BLOSSOM_LIGHT, 8);
  }

  void foundation;
  void stream;
  void kettle;
  return b.root;
}
