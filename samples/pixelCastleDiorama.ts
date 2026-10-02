import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Fill } from "../src/context";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { cellPaint, pixelArt, pixelTexture, pick, tileBox } from "../kits/pixel";

const TEXEL = 0.03;

const INK = "#20233a";
const STONE_DARK = "#4a5068";
const STONE = "#737b92";
const STONE_LIGHT = "#a7afbd";
const MORTAR = "#363b52";
const GRASS_DARK = "#1d4d3a";
const GRASS = "#3d8050";
const GRASS_LIGHT = "#78ad5a";
const WATER_DARK = "#173e66";
const WATER = "#2677a1";
const WATER_LIGHT = "#58b7be";
const WOOD_DARK = "#4a2d32";
const WOOD = "#86513a";
const WOOD_LIGHT = "#c17b4b";
const ROOF_DARK = "#402a4b";
const ROOF = "#70415f";
const ROOF_LIGHT = "#a35e68";
const GOLD = "#e0b552";
const CREAM = "#f7d987";
const ROAD_DARK = "#5d4650";
const ROAD = "#9a6b62";
const LEAF_DARK = "#24553b";
const LEAF = "#41834b";
const LEAF_LIGHT = "#83b957";

const STONE_TILE = pixelTexture(64, 48, (g) => {
  g.fill((_x, y) => (y % 12 === 0 ? MORTAR : STONE_DARK));
  for (let row = 0; row < 4; row++) {
    const y = row * 12 + 1;
    const offset = row % 2 ? -8 : 0;
    for (let col = -1; col < 6; col++) {
      const x = offset + col * 16 + 1;
      g.fill((lx, ly, w, h) => {
        const edge = ly === 0 || ly === h - 1 || lx === 0 || lx === w - 1;
        if (edge) return MORTAR;
        return (lx + ly + col + row) % 7 === 0 ? STONE_LIGHT : STONE;
      }, [x, y, 15, 10]);
    }
  }
});

const GRASS_TILE = pixelTexture(64, 64, (g) => {
  g.fill((x, y) => ((x * 7 + y * 11) % 19 === 0 ? GRASS_LIGHT : (x + y) % 7 === 0 ? GRASS : GRASS_DARK));
  for (let y = 4; y < 64; y += 13) for (let x = (y % 3) * 5; x < 64; x += 17) g.set(x, y, GRASS_LIGHT);
});

const WATER_TILE = pixelTexture(48, 32, (g) => {
  g.fill((x, y) => (y % 8 === 0 ? WATER_DARK : (x + y * 3) % 11 === 0 ? WATER_LIGHT : WATER));
  for (let y = 2; y < 32; y += 8) for (let x = (y % 2) * 7; x < 48; x += 19) {
    g.set(x, y, WATER_LIGHT);
    g.set(x + 1, y, WATER_LIGHT);
    g.set(x + 2, y, WATER_DARK);
  }
});

const WOOD_TILE = pixelTexture(48, 48, (g) => {
  g.fill((_x, y) => (y % 12 === 0 ? WOOD_DARK : (y % 12 === 1 ? WOOD_LIGHT : WOOD)));
  for (let y = 3; y < 48; y += 12) for (let x = 4 + ((y / 12) % 2) * 11; x < 48; x += 22) g.set(x, y, GOLD);
});

const ROOF_TILE = pixelTexture(48, 48, (g) => {
  g.fill((x, y) => (y % 8 === 0 ? ROOF_DARK : (x + y) % 13 === 0 ? ROOF_LIGHT : ROOF));
  for (let y = 2; y < 48; y += 8) for (let x = (y % 3) * 4; x < 48; x += 16) g.set(x, y, ROOF_LIGHT);
});

const ROAD_TILE = pixelTexture(48, 48, (x) => {
  x.fill((u, v) => (u + v * 5) % 17 === 0 ? ROAD_DARK : ROAD);
  for (let y = 5; y < 48; y += 12) x.set((y * 3) % 42, y, ROAD_DARK);
});

const LEAF_TILE = pixelTexture(32, 32, (g) => {
  g.fill((x, y) => (x * 3 + y * 5) % 13 === 0 ? LEAF_LIGHT : (x + y) % 5 === 0 ? LEAF : LEAF_DARK);
});

const WINDOW = pixelArt(
  [
    "dddddddd",
    "dwwwkkwd",
    "dwggggwd",
    "dwwwkkwd",
    "dwwwwwwd",
    "dwwkkwwd",
    "dwwggwwd",
    "dwwwwwwd",
    "dddddddd",
    "dddddddd",
  ],
  { d: INK, w: CREAM, k: GOLD, g: "#9fe1c5" },
);
const DOOR = pixelArt(
  [
    "dddddddddd",
    "dwwwwwwwwd",
    "dwkkkkkkwd",
    "dwkkkkkkwd",
    "dwkkkkkkwd",
    "dwkkkkkkwd",
    "dwkkkkkkwd",
    "dwkkkkkkwd",
    "dwkkkggkwd",
    "dwkkkkkkwd",
    "dwwwwwwwwd",
    "dddddddddd",
  ],
  { d: INK, w: WOOD_LIGHT, k: WOOD, g: GOLD },
);
const BANNER = pixelArt(
  [
    "..rr..",
    ".rrrr.",
    "rrrrrr",
    "rrrrrr",
    ".rrrr.",
    "..rr..",
    "..rr..",
    "..rr..",
    "..rr..",
    "..rr..",
  ],
  { r: ROOF_LIGHT },
);
const ARROW = pixelArt(
  [
    "ddddd",
    "dwwdd",
    "dwwdd",
    "dwwdd",
    "ddddd",
    "dwwdd",
    "dwwdd",
    "dwwdd",
    "ddddd",
  ],
  { d: INK, w: STONE_LIGHT },
);
const LILY = pixelArt(
  [
    "...g...",
    "..ggg..",
    ".ggggg.",
    "gggkggg",
    ".ggggg.",
    "..ggg..",
    "...g...",
  ],
  { g: LEAF_LIGHT, k: GOLD },
);
const GRASS_CARD = pixelArt(
  [
    "...g...",
    "...g...",
    "..ggg..",
    ".ggggg.",
    "..ggg..",
    "...g...",
    ".......",
    ".......",
  ],
  { g: GRASS_LIGHT },
);

const GRASS_PAINT = cellPaint(TEXEL, (c) => pick([GRASS_DARK, GRASS, GRASS_LIGHT], 0.35 + 0.35 * c.random(7) + 0.2 * c.n.y, c.threshold), { dither: true });

export const meta = {
  name: "Pixel Castle Diorama",
  description: "A tiny pixel-art hilltop castle with a moat, bridge, village cottages, road, trees, and storybook details.",
  style: "pixel art",
  commit: "e503085",
};

export default function build() {
  const b = createBuilder({ name: "pixelCastleDiorama", detail: 0.8, paintSize: 1024 });
  const root = b.joint("root", { at: [0, 0, 0], role: "spine" });
  const random = rng(431);
  const box = (
    name: string,
    size: readonly [number, number, number],
    at: readonly [number, number, number],
    tile: THREE.Texture,
    color = "#ffffff",
  ) => b.part(tileBox(size, tile, TEXEL, { rand: random, step: [1, 4] }), color, { bone: root, at, texture: tile, name });
  const solid = (
    name: string,
    size: readonly [number, number, number],
    at: readonly [number, number, number],
    color: Fill,
  ) => b.part(new THREE.BoxGeometry(...size), color, { bone: root, at, name, flat: true });
  const plane = (
    name: string,
    size: readonly [number, number],
    at: readonly [number, number, number],
    texture: THREE.Texture,
    dir: readonly [number, number, number] = [0, 0, 1],
  ) => b.part(new THREE.PlaneGeometry(...size), "#ffffff", { bone: root, at, dir, axis: "z", texture, name });

  // The square plinth, four moat arms, and stepped grassy island establish the readable silhouette.
  box("plinth", [3.8, 0.18, 3.2], [0, 0.09, 0], GRASS_TILE);
  box("moatFront", [3.25, 0.16, 0.34], [0, 0.29, 1.18], WATER_TILE);
  box("moatBack", [3.25, 0.16, 0.34], [0, 0.29, -1.18], WATER_TILE);
  box("moatLeft", [0.34, 0.16, 2.1], [1.46, 0.29, 0], WATER_TILE);
  box("moatRight", [0.34, 0.16, 2.1], [-1.46, 0.29, 0], WATER_TILE);
  solid("hillLow", [2.95, 0.28, 2.25], [0, 0.40, -0.05], GRASS_PAINT);
  solid("hillHigh", [2.45, 0.30, 1.78], [0, 0.69, -0.05], GRASS_PAINT);
  box("hillCrown", [2.08, 0.12, 1.52], [0, 0.90, -0.05], GRASS_TILE);
  // A timber bridge, stepped road, and stepping stones connect the village to the gate.
  box("bridgeDeck", [0.58, 0.16, 0.68], [0, 0.44, 0.92], WOOD_TILE);
  for (let z = 0.66; z <= 1.18; z += 0.13) box(`bridgeRailL${z.toFixed(2)}`, [0.06, 0.30, 0.06], [-0.34, 0.62, z], WOOD_TILE);
  for (let z = 0.66; z <= 1.18; z += 0.13) box(`bridgeRailR${z.toFixed(2)}`, [0.06, 0.30, 0.06], [0.34, 0.62, z], WOOD_TILE);
  box("road", [0.46, 0.035, 1.25], [0, 0.20, 1.02], ROAD_TILE);
  for (let i = 0; i < 7; i++) box(`roadStone${i}`, [0.24, 0.035, 0.09], [0, 0.235, 0.48 + i * 0.17], STONE_TILE);

  // Castle keep and four chunky towers.
  box("keep", [1.08, 0.76, 0.88], [0, 1.30, -0.10], STONE_TILE);
  const towers = [
    [-0.62, -0.43],
    [0.62, -0.43],
    [-0.62, 0.25],
    [0.62, 0.25],
  ] as const;
  towers.forEach(([x, z], i) => {
    box(`tower${i}`, [0.42, 1.02, 0.42], [x, 1.36, z], STONE_TILE);
    box(`towerCrown${i}`, [0.50, 0.12, 0.50], [x, 1.92, z], ROOF_TILE);
    box(`towerCrown2${i}`, [0.42, 0.10, 0.42], [x, 2.03, z], ROOF_TILE);
    box(`towerMerlonA${i}`, [0.11, 0.15, 0.11], [x - 0.16, 1.99, z - 0.16], STONE_TILE);
    box(`towerMerlonB${i}`, [0.11, 0.15, 0.11], [x + 0.16, 1.99, z + 0.16], STONE_TILE);
    box(`towerMerlonC${i}`, [0.11, 0.15, 0.11], [x - 0.16, 1.99, z + 0.16], STONE_TILE);
  });

  // Keep roofline and crenellations make the silhouette legible from every side.
  box("keepRoofLower", [1.18, 0.10, 0.98], [0, 1.73, -0.10], ROOF_TILE);
  box("keepRoofUpper", [0.92, 0.10, 0.72], [0, 1.84, -0.10], ROOF_TILE);
  for (const x of [-0.43, -0.14, 0.14, 0.43]) {
    box(`frontMerlon${x}`, [0.14, 0.16, 0.14], [x, 1.86, 0.34], STONE_TILE);
    box(`backMerlon${x}`, [0.14, 0.16, 0.14], [x, 1.86, -0.54], STONE_TILE);
  }
  for (const z of [-0.32, -0.02, 0.18]) {
    box(`leftMerlon${z}`, [0.14, 0.16, 0.14], [-0.54, 1.86, z], STONE_TILE);
    box(`rightMerlon${z}`, [0.14, 0.16, 0.14], [0.54, 1.86, z], STONE_TILE);
  }

  // Gate, windows, and heraldic banners use tiny hard-edged textures.
  plane("gate", [0.30, 0.46], [0, 1.10, 0.347], DOOR);
  plane("keepWindowFront", [0.18, 0.24], [-0.31, 1.46, 0.347], WINDOW);
  plane("keepWindowFrontR", [0.18, 0.24], [0.31, 1.46, 0.347], WINDOW);
  plane("keepWindowBack", [0.18, 0.24], [0.31, 1.46, -0.547], WINDOW, [0, 0, -1]);
  plane("keepWindowLeft", [0.18, 0.24], [0.547, 1.46, -0.10], WINDOW, [1, 0, 0]);
  plane("keepWindowRight", [0.18, 0.24], [-0.547, 1.46, -0.10], WINDOW, [-1, 0, 0]);
  plane("bannerL", [0.20, 0.34], [-0.32, 1.30, 0.352], BANNER);
  plane("bannerR", [0.20, 0.34], [0.32, 1.30, 0.352], BANNER);
  plane("towerWindow0", [0.12, 0.18], [-0.62, 1.39, -0.647], WINDOW, [0, 0, -1]);
  plane("towerWindow1", [0.12, 0.18], [0.62, 1.39, -0.647], WINDOW, [0, 0, -1]);
  plane("towerWindow2", [0.12, 0.18], [-1.647, 1.39, 0.25], WINDOW, [-1, 0, 0]);
  plane("towerWindow3", [0.12, 0.18], [1.647, 1.39, 0.25], WINDOW, [1, 0, 0]);
  plane("keepArrowFrontL", [0.09, 0.16], [-0.45, 1.08, 0.347], ARROW);
  plane("keepArrowFrontR", [0.09, 0.16], [0.45, 1.08, 0.347], ARROW);
  plane("keepArrowBackL", [0.09, 0.16], [-0.45, 1.08, -0.547], ARROW, [0, 0, -1]);
  plane("keepArrowBackR", [0.09, 0.16], [0.45, 1.08, -0.547], ARROW, [0, 0, -1]);
  plane("keepArrowSideL", [0.09, 0.16], [0.547, 1.08, -0.28], ARROW, [1, 0, 0]);
  plane("keepArrowSideR", [0.09, 0.16], [-0.547, 1.08, -0.28], ARROW, [-1, 0, 0]);

  // Four flagpoles and fluttering pixel flags.
  towers.forEach(([x, z], i) => {
    b.rod([x, 2.08, z], [x, 2.42, z], 0.018, { bone: root, color: WOOD_DARK, name: `flagPole${i}` });
    plane(`flag${i}`, [0.23, 0.16], [x + (x > 0 ? -0.10 : 0.10), 2.32, z + 0.012], BANNER);
  });

  // Two cottages in the foreground, dressed with doors, shutters, chimneys, and roof trim.
  const cottages = [
    { x: -1.02, z: 1.08, wall: [0.70, 0.42, 0.58] as const },
    { x: 1.02, z: 1.10, wall: [0.62, 0.38, 0.52] as const },
  ];
  cottages.forEach((c, i) => {
    const [w, h, d] = c.wall;
    box(`cottage${i}`, c.wall, [c.x, 0.20 + h / 2, c.z], WOOD_TILE);
    box(`cottageRoof${i}`, [w + 0.16, 0.12, d + 0.14], [c.x, 0.20 + h + 0.08, c.z], ROOF_TILE);
    box(`cottageRoofTrim${i}`, [w + 0.22, 0.06, d + 0.18], [c.x, 0.20 + h + 0.17, c.z], ROOF_TILE);
    box(`chimney${i}`, [0.12, 0.28, 0.12], [c.x + 0.18, 0.20 + h + 0.28, c.z - 0.10], STONE_TILE);
    plane(`cottageDoor${i}`, [0.16, 0.28], [c.x, 0.20 + 0.14, c.z + d / 2 + 0.006], DOOR);
    plane(`cottageWindowL${i}`, [0.12, 0.14], [c.x - 0.22, 0.20 + h * 0.60, c.z + d / 2 + 0.008], WINDOW);
    plane(`cottageWindowR${i}`, [0.12, 0.14], [c.x + 0.22, 0.20 + h * 0.60, c.z + d / 2 + 0.008], WINDOW);
  });
  // A low picket fence frames the market side of the tiny village.
  for (const x of [-1.48, -1.15, -0.82, 0.82, 1.15, 1.48])
    box(`fencePost${x}`, [0.06, 0.26, 0.06], [x, 0.30, 1.48], WOOD_TILE);
  box("fenceRailL", [0.66, 0.06, 0.06], [-1.15, 0.32, 1.48], WOOD_TILE);
  box("fenceRailR", [0.66, 0.06, 0.06], [1.15, 0.32, 1.48], WOOD_TILE);

  // Market stall, barrels, and crates provide a lived-in village edge.
  box("stallTop", [0.62, 0.08, 0.42], [0.56, 0.64, 1.48], ROOF_TILE);
  for (const x of [0.31, 0.81]) box(`stallPost${x}`, [0.06, 0.45, 0.06], [x, 0.41, 1.48], WOOD_TILE);
  box("stallCounter", [0.58, 0.12, 0.30], [0.56, 0.28, 1.48], WOOD_TILE);
  box("crateA", [0.20, 0.18, 0.20], [0.26, 0.23, 1.68], WOOD_TILE);
  box("crateB", [0.20, 0.14, 0.20], [0.48, 0.20, 1.70], WOOD_TILE);
  box("barrel", [0.18, 0.26, 0.18], [0.82, 0.30, 1.67], WOOD_TILE);

  // Pixel-block trees and a pair of reed cards soften the moat edge.
  const trees = [
    [-1.55, 0.25, 0.48],
    [1.55, 0.18, 0.44],
    [-1.48, 0.45, -0.48],
  ] as const;
  trees.forEach(([x, y, z], i) => {
    box(`treeTrunk${i}`, [0.14, 0.54, 0.14], [x, y + 0.27, z], WOOD_TILE);
    box(`treeLeafLower${i}`, [0.52, 0.30, 0.46], [x, y + 0.62, z], LEAF_TILE);
    box(`treeLeafUpper${i}`, [0.36, 0.28, 0.34], [x, y + 0.90, z], LEAF_TILE);
    box(`treeLeafTop${i}`, [0.20, 0.18, 0.20], [x, y + 1.13, z], LEAF_TILE);
  });
  b.cards(
    [-1.18, -0.86, 0.92, 1.22].map((x, i) => frame([x, 0.38, 1.18 + (i % 2) * 0.10], [0, 1, 0])),
    GRASS_CARD,
    { size: [0.10, 0.26], cross: true, vary: 0.2, spin: 18, color: GRASS_LIGHT, bone: root, name: "moatReeds" },
  );
  b.cards(
    [-1.34, -0.52, 0.42, 1.34].map((x, i) => frame([x, 0.375, 0.88 + (i % 2) * 0.12], [0, 1, 0])),
    LILY,
    { size: [0.16, 0.14], lean: 90, flow: [1, 0, 0], mirror: true, color: "#ffffff", bone: root, name: "waterLilies" },
  );

  // Small square lanterns and gold studs finish the gate façade.
  for (const x of [-0.25, 0.25]) {
    box(`gateLantern${x}`, [0.07, 0.11, 0.05], [x, 1.02, 0.38], WOOD_TILE);
    solid(`gateLight${x}`, [0.035, 0.05, 0.012], [x, 1.03, 0.41], CREAM);
  }
  for (const x of [-0.40, -0.20, 0.20, 0.40]) solid(`goldStud${x}`, [0.035, 0.035, 0.018], [x, 1.72, 0.35], GOLD);

  return b.root;
}
