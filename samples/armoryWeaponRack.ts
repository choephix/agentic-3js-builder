import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Fill } from "../src/context";
import { grain } from "../src/paint";

const WOOD_DARK = "#24130f";
const WOOD = grain("#5b3020", "#946038", { size: 0.16, axis: "y", seed: 31 });
const WOOD_LIGHT = "#a66a3f";
const IRON = "#252a31";
const IRON_EDGE = "#4d5861";
const STEEL = "#64717a";
const STEEL_HI = "#b4c1c7";
const GOLD = "#b77c25";
const GOLD_HI = "#edc15a";
const LEATHER = "#3b1d18";
const RED = "#791f27";
const BLUE = "#1d4776";
const CREAM = "#d0b98a";

export const meta = {
  name: "Warcraft Armory Weapon Rack",
  description: "A chunky hand-painted armory rack crowded with shields, blades, helmets, a spear and an axe.",
  style: "Blizzard/Warcraft",
  commit: "9555ebf",
};

type Vec = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "armoryWeaponRack", detail: 1 });
  const root = b.joint("rackRoot", { at: [0, 0, 0], role: "spine" });

  const box = (name: string, size: Vec, at: Vec, color: Fill, rotation?: Vec) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      name,
      bone: root,
      at,
      rotation,
      flat: true,
    });

  const cylinder = (
    name: string,
    radius: number,
    depth: number,
    at: Vec,
    color: Fill,
    rotation?: Vec,
    segments = 10,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, {
      name,
      bone: root,
      at,
      rotation,
      flat: true,
    });

  const sphere = (name: string, radius: number, at: Vec, color: Fill) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, { name, bone: root, at, flat: true });

  // Heavy timber carcass: broad feet, a deep plinth, two uprights, a shelf and a crowned lintel.
  box("basePlinth", [2.28, 0.18, 0.64], [0, 0.09, 0], WOOD);
  box("baseFrontLip", [2.12, 0.11, 0.08], [0, 0.19, 0.31], WOOD_LIGHT);
  box("baseShadow", [1.86, 0.08, 0.08], [0, 0.205, -0.31], WOOD_DARK);
  for (const s of [-1, 1]) {
    box(`foot${s < 0 ? "L" : "R"}`, [0.46, 0.18, 0.72], [s * 0.82, 0.27, 0], WOOD_DARK);
    box(`upright${s < 0 ? "L" : "R"}`, [0.2, 1.62, 0.34], [s * 0.95, 1.04, 0], WOOD);
    box(`uprightFace${s < 0 ? "L" : "R"}`, [0.06, 1.43, 0.07], [s * 0.84, 1.07, 0.205], WOOD_LIGHT);
    box(`uprightIronBand${s < 0 ? "L" : "R"}`, [0.26, 0.1, 0.39], [s * 0.95, 1.55, 0], IRON);
    box(`uprightIronBandLow${s < 0 ? "L" : "R"}`, [0.26, 0.1, 0.39], [s * 0.95, 0.48, 0], IRON);
  }
  box("topLintel", [2.22, 0.22, 0.44], [0, 1.88, 0], WOOD);
  box("topLintelFace", [2.0, 0.09, 0.07], [0, 1.79, 0.235], WOOD_LIGHT);
  box("middleShelf", [1.86, 0.14, 0.48], [0, 1.56, -0.01], WOOD_DARK);
  box("middleShelfFront", [1.76, 0.1, 0.08], [0, 1.61, 0.245], WOOD_LIGHT);

  // Back slats and warm metal brackets make the silhouette read as an actual rack.
  for (const [i, x] of [-0.61, 0, 0.61].entries()) {
    box(`backSlat${i}`, [0.22, 1.38, 0.12], [x, 0.89, -0.18], WOOD_DARK);
    box(`backSlatHighlight${i}`, [0.05, 1.22, 0.03], [x + 0.08, 0.92, -0.248], WOOD_LIGHT);
  }
  for (const s of [-1, 1]) {
    box(`shelfBracket${s < 0 ? "L" : "R"}`, [0.1, 0.34, 0.1], [s * 0.69, 1.41, 0.18], GOLD);
    box(`shelfBracketFoot${s < 0 ? "L" : "R"}`, [0.28, 0.07, 0.1], [s * 0.69, 1.25, 0.18], GOLD);
  }

  // Painted iron rivets across the timber joinery.
  const rivetPositions: Vec[] = [
    [-1.0, 1.76, 0.25], [1.0, 1.76, 0.25], [-0.95, 0.57, 0.25], [0.95, 0.57, 0.25],
    [-0.78, 0.2, 0.34], [0.78, 0.2, 0.34], [-0.58, 1.66, 0.27], [0.58, 1.66, 0.27],
  ];
  for (const [i, p] of rivetPositions.entries()) sphere(`rivet${i}`, 0.035, p, GOLD_HI);

  const shieldOutline = (scale: number): [number, number][] => [
    [0, 0], [0.19 * scale, 0.1 * scale], [0.245 * scale, 0.32 * scale],
    [0.17 * scale, 0.56 * scale], [0, 0.69 * scale], [-0.17 * scale, 0.56 * scale],
    [-0.245 * scale, 0.32 * scale], [-0.19 * scale, 0.1 * scale],
  ];

  const shield = (side: -1 | 1, color: string, name: string) => {
    const x = side * 0.62;
    const y = 0.86;
    // Gold outer silhouette under a thick painted shield face.
    b.extrude(shieldOutline(1.08), {
      name: `${name}Rim`,
      bone: root,
      at: [x, y, 0.29],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.055,
      bevel: 0.014,
      color: GOLD,
    });
    b.extrude(shieldOutline(0.96), {
      name: `${name}Face`,
      bone: root,
      at: [x, y + 0.015, 0.335],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.01,
      color,
    });
    b.extrude([
      [-0.13, 0.05], [0.13, 0.05], [0.16, 0.17], [0, 0.3], [-0.16, 0.17],
    ], {
      name: `${name}Chevron`,
      bone: root,
      at: [x, y + 0.03, 0.362],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.004,
      color: side < 0 ? GOLD_HI : CREAM,
    });
    cylinder(`${name}Boss`, 0.075, 0.045, [x, y + 0.33, 0.39], GOLD_HI, [90, 0, 0], 10);
    cylinder(`${name}BossDark`, 0.044, 0.052, [x, y + 0.33, 0.418], IRON, [90, 0, 0], 8);
    for (const [i, [dx, dy]] of [[-0.15, 0.16], [0.15, 0.16], [-0.12, 0.48], [0.12, 0.48]].entries())
      sphere(`${name}Rivet${i}`, 0.021, [x + dx, y + dy, 0.395], GOLD_HI);
  };
  shield(-1, BLUE, "shieldL");
  shield(1, RED, "shieldR");

  // The central greatsword hangs forward of the backboard, with a broad painted blade.
  b.extrude([
    [-0.075, 0], [0.075, 0], [0.062, 0.5], [0.018, 0.8], [0, 0.91, "sharp"],
    [-0.018, 0.8], [-0.062, 0.5],
  ], {
    name: "greatswordBlade",
    bone: root,
    at: [0, 0.48, 0.39],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: [0.052, 0.025],
    bevel: 0.008,
    color: STEEL,
  });
  box("greatswordFuller", [0.025, 0.67, 0.018], [0, 0.88, 0.425], STEEL_HI);
  box("greatswordGuard", [0.34, 0.07, 0.09], [0, 1.3, 0.4], GOLD);
  b.rod([0, 1.33, 0.4], [0, 1.56, 0.4], 0.035, { name: "greatswordGrip", color: LEATHER, bone: root, section: { ngon: 6 } });
  sphere("greatswordPommel", 0.06, [0, 1.6, 0.4], GOLD_HI);
  cylinder("greatswordPommelCap", 0.028, 0.025, [0, 1.65, 0.4], IRON, undefined, 8);

  // A spear is tucked behind the left shield, with a faceted steel point and collar.
  b.rod([-0.32, 0.37, 0.18], [-0.32, 1.54, 0.18], 0.027, { name: "spearShaft", color: WOOD_LIGHT, bone: root, section: { ngon: 6 } });
  cylinder("spearGrip", 0.041, 0.28, [-0.32, 0.57, 0.18], LEATHER, undefined, 8);
  cylinder("spearCollar", 0.052, 0.065, [-0.32, 1.51, 0.18], GOLD, undefined, 8);
  b.spike([-0.32, 1.54, 0.18], [0, 1, 0], 0.3, 0.075, { name: "spearHead", color: STEEL_HI, bone: root, section: { ngon: 6 }, caps: "point" });
  box("spearHeadInlay", [0.024, 0.17, 0.02], [-0.32, 1.66, 0.235], GOLD);

  // An axe leans across the lower right bay; the separate head gives it a readable silhouette.
  b.rod([0.28, 0.36, 0.35], [0.88, 1.4, 0.35], 0.034, { name: "axeHandle", color: WOOD_LIGHT, bone: root, section: { ngon: 6 } });
  cylinder("axeGrip", 0.052, 0.3, [0.42, 0.59, 0.35], LEATHER, [0, 30, 0], 8);
  b.extrude([
    [-0.02, 0], [0.15, 0.04], [0.27, 0.2], [0.24, 0.37], [0.1, 0.46],
    [-0.04, 0.4], [-0.11, 0.2],
  ], {
    name: "axeBlade",
    bone: root,
    at: [0.85, 1.3, 0.42],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: [0.065, 0.03],
    bevel: 0.012,
    color: STEEL,
  });
  box("axeHeadSocket", [0.11, 0.16, 0.12], [0.86, 1.35, 0.42], IRON);
  sphere("axeEndCap", 0.045, [0.28, 0.36, 0.35], GOLD);

  // Two squat helmets sit on the shelf. Low-sided lathes keep the chunky Warcraft facets.
  const helmet = (side: -1 | 1, name: string, accent: string) => {
    const x = side * 0.61;
    b.lathe([
      [0, 0], [0.18, 0], [0.2, 0.055], [0.19, 0.13], [0.145, 0.24], [0.09, 0.31], [0, 0.34],
    ], {
      name: `${name}Dome`, bone: root, at: [x, 1.68, 0.24], segments: 10, color: IRON,
    });
    box(`${name}Brow`, [0.38, 0.07, 0.08], [x, 1.86, 0.39], STEEL);
    box(`${name}NoseGuard`, [0.07, 0.22, 0.07], [x, 1.76, 0.44], STEEL_HI);
    box(`${name}CheekL`, [0.08, 0.2, 0.15], [x - 0.16, 1.73, 0.29], IRON_EDGE, [0, 0, -8]);
    box(`${name}CheekR`, [0.08, 0.2, 0.15], [x + 0.16, 1.73, 0.29], IRON_EDGE, [0, 0, 8]);
    box(`${name}Crest`, [0.055, 0.25, 0.12], [x, 2.02, 0.25], accent, [0, 0, 0]);
    cylinder(`${name}BrowStudL`, 0.025, 0.035, [x - 0.13, 1.87, 0.44], GOLD_HI, [90, 0, 0], 8);
    cylinder(`${name}BrowStudR`, 0.025, 0.035, [x + 0.13, 1.87, 0.44], GOLD_HI, [90, 0, 0], 8);
  };
  helmet(-1, "helmetL", RED);
  helmet(1, "helmetR", BLUE);

  // Small painted trim plates and hanging hooks fill the negative spaces without cluttering the silhouette.
  for (const [i, x] of [-0.4, 0.4].entries()) {
    box(`hookPlate${i}`, [0.16, 0.13, 0.035], [x, 1.53, 0.28], GOLD);
    cylinder(`hook${i}`, 0.018, 0.18, [x, 1.42, 0.3], IRON_EDGE, [90, 0, 0], 7);
    sphere(`hookTip${i}`, 0.026, [x, 1.33, 0.3], GOLD_HI);
  }

  // A few chunky corner caps sell the hand-forged, riveted construction.
  for (const [i, x] of [-1.0, 1.0].entries()) {
    cylinder(`topCap${i}`, 0.09, 0.08, [x, 1.99, 0], GOLD, undefined, 8);
    sphere(`baseCap${i}`, 0.07, [x, 0.38, 0.18], GOLD_HI);
  }

  return b.root;
}
