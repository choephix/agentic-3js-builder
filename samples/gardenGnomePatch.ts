import * as THREE from "three";
import { createBuilder } from "../src/builder";

const SOIL = "#5a3527";
const SOIL_DARK = "#3a231d";
const GRASS = "#63a84f";
const GRASS_DARK = "#39713a";
const WOOD = "#8a4d2c";
const WOOD_DARK = "#59331f";
const TERRACOTTA = "#c9683f";
const TERRACOTTA_LIGHT = "#e18650";
const STONE = "#b9b49d";
const STONE_DARK = "#7f806f";
const BLUE = "#478bc2";
const WATER = "#65cce0";
const RED = "#dd4e45";
const YELLOW = "#f5c84b";
const CREAM = "#f7e7b7";
const SKIN = "#f0a06d";
const SKIN_DARK = "#c86b4d";
const HAT_RED = "#b83f4c";
const HAT_TEAL = "#277d78";
const CLOTH = "#385f8c";
const WHITE = "#fff7da";
const BLACK = "#272b2d";
const GOLD = "#e4a23a";
const PURPLE = "#975bb6";
const PINK = "#ed7da5";
const LEAF = "#4d9a48";
const LEAF_LIGHT = "#82bf53";

export const meta = {
  name: "Whimsical Garden Gnome Patch",
  description: "A storybook garden patch with two busy gnomes, flower planters, a watering can, birdbath, vegetables, and a hand-built fence.",
  style: "whimsical",
  commit: "34f986c",
};

export default function build() {
  const b = createBuilder({ name: "gardenGnomePatch", detail: 1 });
  const root = b.joint("garden", { at: [0, 0, 0], role: "fan" });

  const box = (size: [number, number, number], at: [number, number, number], color: string, name: string, rotation?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(...size), color, { bone: root, at, rotation, name, flat: true });
  const sphere = (r: number, at: [number, number, number], color: string, name: string, scale?: [number, number, number]) =>
    b.part(new THREE.SphereGeometry(r, 10, 7), color, { bone: root, at, scale, name, flat: true });
  const cyl = (radius: number, height: number, at: [number, number, number], color: string, name: string, radial = 10) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, radial), color, { bone: root, at, name, flat: true });
  const cone = (radius: number, height: number, at: [number, number, number], color: string, name: string, radial = 10, rotation?: [number, number, number]) =>
    b.part(new THREE.ConeGeometry(radius, height, radial), color, { bone: root, at, rotation, name, flat: true });
  const rod = (a: [number, number, number], z: [number, number, number], radius: number, color: string, name: string) =>
    b.rod(a, z, radius, { bone: root, color, name, section: { ngon: 6 } });
  const disk = (radius: number, at: [number, number, number], color: string, name: string, height = 0.025) =>
    cyl(radius, height, at, color, name, 12);

  // A soft raised earth island, grass lip, and a pebble border establish the patch.
  box([2.85, 0.18, 2.25], [0, 0.09, 0], SOIL, "earthBed");
  box([2.72, 0.045, 2.12], [0, 0.215, 0], GRASS, "grassTop");
  box([2.92, 0.12, 0.12], [0, 0.15, -1.12], STONE_DARK, "frontEarthWall");
  box([2.92, 0.12, 0.12], [0, 0.15, 1.12], STONE_DARK, "backEarthWall");
  box([0.12, 0.12, 2.1], [-1.4, 0.15, 0], STONE_DARK, "leftEarthWall");
  box([0.12, 0.12, 2.1], [1.4, 0.15, 0], STONE_DARK, "rightEarthWall");
  const border = [
    [-1.16, 0.28, -1.12], [-0.7, 0.28, -1.12], [-0.2, 0.28, -1.12], [0.3, 0.28, -1.12],
    [0.82, 0.28, -1.12], [1.25, 0.28, -0.92], [1.4, 0.28, -0.48], [1.4, 0.28, 0.02],
    [1.4, 0.28, 0.55], [1.18, 0.28, 1.08], [0.65, 0.28, 1.12], [0.15, 0.28, 1.12],
    [-0.4, 0.28, 1.12], [-0.92, 0.28, 1.12], [-1.35, 0.28, 0.82], [-1.4, 0.28, 0.28], [-1.4, 0.28, -0.3],
  ] as [number, number, number][];
  border.forEach((p, i) => sphere(0.13, p, i % 3 === 0 ? STONE_DARK : STONE, `borderStone${i}` , [1.25, 0.72, 1]));
  [[-0.45, 0.24, -0.55], [0.05, 0.24, -0.55], [0.55, 0.24, -0.55], [0.3, 0.24, -0.83]].forEach((p, i) => sphere(0.12, p as [number, number, number], STONE, `stepStone${i}`, [1.3, 0.38, 1.1]));

  // Back fence with pointed posts, rails, nails, and a tiny welcome plaque.
  for (const x of [-1.18, -0.58, 0, 0.58, 1.18]) {
    box([0.13, 0.72, 0.13], [x, 0.62, 0.93], WOOD, `fencePost${x}`);
    cone(0.11, 0.18, [x, 1.07, 0.93], WOOD_DARK, `fencePostCap${x}`, 5);
    sphere(0.025, [x - 0.045, 0.67, 0.86], GOLD, `fenceNailFront${x}`);
  }
  box([2.45, 0.12, 0.12], [0, 0.53, 0.93], WOOD_DARK, "fenceRailLow");
  box([2.45, 0.12, 0.12], [0, 0.79, 0.93], WOOD_DARK, "fenceRailHigh");
  box([0.62, 0.34, 0.06], [0, 0.72, 0.84], TERRACOTTA_LIGHT, "welcomePlaque");
  box([0.42, 0.045, 0.014], [0, 0.74, 0.805], GOLD, "plaqueStripe");
  sphere(0.035, [-0.27, 0.72, 0.79], GOLD, "plaquePinL");
  sphere(0.035, [0.27, 0.72, 0.79], GOLD, "plaquePinR");

  // Gnome helper: chunky body, expressive face, hat, beard, belt, gloves and boots.
  const gnome = (x: number, z: number, s: number, hat: string, shirt: string, name: string, lean = 0) => {
    const y = 0.25;
    sphere(0.2 * s, [x, y + 0.2 * s, z], shirt, `${name}Body`, [1, 1.1, 0.82]);
    sphere(0.17 * s, [x, y + 0.48 * s, z + 0.01], SKIN, `${name}Head`, [1, 1.05, 0.92]);
    cone(0.23 * s, 0.42 * s, [x + lean * 0.04, y + 0.84 * s, z], hat, `${name}Hat`, 8, [lean * 0.35, 0, lean * 0.18]);
    sphere(0.24 * s, [x + lean * 0.1, y + 1.03 * s, z], hat, `${name}HatPom`, [0.7, 0.7, 0.7]);
    // brim as a broad squashy disk
    cyl(0.25 * s, 0.055 * s, [x, y + 0.65 * s, z], hat, `${name}HatBrim`, 10);
    // beard, nose, cheeks, eyes and brows all face +Z.
    cone(0.15 * s, 0.31 * s, [x, y + 0.33 * s, z + 0.15 * s], CREAM, `${name}Beard`, 8, [Math.PI, 0, 0]);
    sphere(0.052 * s, [x, y + 0.52 * s, z + 0.17 * s], SKIN_DARK, `${name}Nose`);
    for (const side of [-1, 1]) {
      sphere(0.022 * s, [x + side * 0.07 * s, y + 0.57 * s, z + 0.145 * s], BLACK, `${name}Eye${side}`);
      sphere(0.037 * s, [x + side * 0.09 * s, y + 0.49 * s, z + 0.13 * s], PINK, `${name}Cheek${side}`);
      rod([x + side * 0.025 * s, y + 0.62 * s, z + 0.15 * s], [x + side * 0.095 * s, y + 0.63 * s, z + 0.15 * s], 0.012 * s, WOOD_DARK, `${name}Brow${side}`);
    }
    // belt, buckle, shirt buttons
    b.part(new THREE.TorusGeometry(0.18 * s, 0.026 * s, 6, 12), GOLD, {
      bone: root,
      at: [x, y + 0.3 * s, z],
      rotation: [90, 0, 0],
      name: `${name}Belt`,
      flat: true,
    });
    box([0.08 * s, 0.09 * s, 0.035 * s], [x, y + 0.3 * s, z + 0.2 * s], GOLD, `${name}Buckle`);
    for (let i = 0; i < 2; i++) sphere(0.018 * s, [x, y + (0.25 + i * 0.1) * s, z + 0.19 * s], YELLOW, `${name}Button${i}`);
    // arms at a cheerful working angle and mitten hands
    const armY = y + 0.4 * s;
    rod([x - 0.15 * s, armY, z], [x - 0.31 * s, armY + 0.02 * s, z + 0.08 * s], 0.055 * s, shirt, `${name}ArmL`);
    rod([x + 0.15 * s, armY, z], [x + 0.31 * s, armY + 0.06 * s, z + 0.04 * s], 0.055 * s, shirt, `${name}ArmR`);
    sphere(0.067 * s, [x - 0.33 * s, armY + 0.03 * s, z + 0.09 * s], SKIN, `${name}HandL`);
    sphere(0.067 * s, [x + 0.33 * s, armY + 0.07 * s, z + 0.05 * s], SKIN, `${name}HandR`);
    // short legs and oversized shoes
    rod([x - 0.08 * s, y + 0.12 * s, z], [x - 0.09 * s, y, z + 0.02 * s], 0.065 * s, CLOTH, `${name}LegL`);
    rod([x + 0.08 * s, y + 0.12 * s, z], [x + 0.09 * s, y, z + 0.02 * s], 0.065 * s, CLOTH, `${name}LegR`);
    sphere(0.105 * s, [x - 0.11 * s, y - 0.01, z + 0.08 * s], WOOD_DARK, `${name}BootL`, [1.2, 0.65, 1.5]);
    sphere(0.105 * s, [x + 0.11 * s, y - 0.01, z + 0.08 * s], WOOD_DARK, `${name}BootR`, [1.2, 0.65, 1.5]);
  };
  gnome(-0.65, 0.08, 0.9, HAT_RED, CLOTH, "gnomeRed", -0.2);
  gnome(0.18, 0.46, 0.74, HAT_TEAL, "#d8893e", "gnomeTeal", 0.25);

  // Three terracotta planters, each with rim, soil, stems, leaves and different blooms.
  const planter = (x: number, z: number, w: number, h: number, name: string) => {
    box([w, h, w * 0.72], [x, 0.27 + h / 2, z], TERRACOTTA, `${name}Pot`);
    box([w + 0.06, 0.07, w * 0.8], [x, 0.3 + h, z], TERRACOTTA_LIGHT, `${name}Rim`);
    box([w * 0.78, 0.025, w * 0.58], [x, 0.34 + h, z], SOIL_DARK, `${name}Dirt`);
    box([w * 0.62, 0.025, 0.025], [x, 0.42 + h, z - w * 0.27], GOLD, `${name}Stripe`);
  };
  planter(-1.05, -0.28, 0.42, 0.28, "leftPlanter");
  planter(0.82, 0.17, 0.5, 0.32, "rightPlanter");
  planter(0.55, -0.76, 0.4, 0.24, "frontPlanter");

  const flower = (x: number, z: number, stemH: number, petal: string, name: string, scale = 1) => {
    rod([x, 0.58, z], [x, 0.58 + stemH, z], 0.018 * scale, LEAF, `${name}Stem`);
    sphere(0.07 * scale, [x, 0.58 + stemH, z], petal, `${name}Bloom`, [1.15, 0.75, 1.15]);
    sphere(0.025 * scale, [x, 0.58 + stemH, z + 0.065 * scale], YELLOW, `${name}Center`);
    for (const side of [-1, 1]) {
      sphere(0.05 * scale, [x + side * 0.05 * scale, 0.58 + stemH * 0.48, z], LEAF_LIGHT, `${name}Leaf${side}`, [1.5, 0.45, 0.65]);
    }
  };
  flower(-1.16, -0.3, 0.42, PURPLE, "purpleFlowerA", 0.9);
  flower(-0.98, -0.3, 0.53, YELLOW, "yellowFlowerA", 0.75);
  flower(-0.82, -0.27, 0.4, PINK, "pinkFlowerA", 0.82);
  flower(0.72, 0.17, 0.5, RED, "redFlowerB", 1.0);
  flower(0.93, 0.16, 0.62, YELLOW, "yellowFlowerB", 0.78);
  flower(0.53, 0.18, 0.44, PURPLE, "purpleFlowerB", 0.9);
  flower(0.48, -0.76, 0.38, PINK, "pinkFlowerC", 0.9);
  flower(0.66, -0.75, 0.47, RED, "redFlowerC", 0.73);

  // Vegetables and tiny row markers in the open soil.
  for (const [i, x] of [-0.2, 0.05, 0.3].entries()) {
    sphere(0.075, [x, 0.3, -0.38], i % 2 ? LEAF_LIGHT : LEAF, `cabbage${i}`, [1.2, 0.75, 1.2]);
    sphere(0.04, [x + 0.06, 0.34, -0.38], GRASS_DARK, `cabbageFold${i}`);
  }
  for (const x of [-0.15, 0.1, 0.35]) {
    rod([x, 0.25, 0.02], [x, 0.5, 0.02], 0.018, LEAF, `carrotStem${x}`);
    cone(0.07, 0.2, [x, 0.25, 0.02], "#ee813f", `carrotRoot${x}`, 7);
  }
  box([0.36, 0.12, 0.025], [0.15, 0.45, 0.1], WOOD, "rowMarker");
  rod([0.15, 0.48, 0.1], [0.15, 0.73, 0.1], 0.018, WOOD_DARK, "rowMarkerPost");

  // Birdbath: carved pedestal, broad basin, water, and a tiny perched bird.
  cyl(0.18, 0.46, [-1.0, 0.47, 0.58], STONE, "birdbathPedestal", 8);
  cyl(0.28, 0.08, [-1.0, 0.7, 0.58], STONE_DARK, "birdbathFoot", 10);
  cyl(0.4, 0.09, [-1.0, 0.82, 0.58], STONE, "birdbathBowl", 12);
  disk(0.31, [-1.0, 0.89, 0.58], WATER, "birdbathWater", 0.018);
  sphere(0.09, [-1.0, 0.99, 0.64], BLUE, "birdBody", [1.2, 0.85, 1.45]);
  sphere(0.065, [-1.0, 1.06, 0.7], BLUE, "birdHead");
  cone(0.04, 0.09, [-1.0, 1.06, 0.78], GOLD, "birdBeak", 5, [Math.PI / 2, 0, 0]);
  sphere(0.012, [-1.035, 1.08, 0.746], BLACK, "birdEyeL");
  sphere(0.012, [-0.965, 1.08, 0.746], BLACK, "birdEyeR");
  cone(0.075, 0.14, [-1.0, 1.15, 0.66], YELLOW, "birdCrest", 5);

  // Watering can at the front right: squat body, lid, handle and long spout.
  sphere(0.3, [1.02, 0.5, -0.63], BLUE, "wateringCanBody", [1.25, 0.82, 1.0]);
  cyl(0.13, 0.06, [1.02, 0.75, -0.63], BLUE, "wateringCanLid", 10);
  sphere(0.04, [1.02, 0.8, -0.63], GOLD, "wateringCanKnob");
  rod([0.78, 0.52, -0.63], [0.47, 0.46, -0.89], 0.06, BLUE, "wateringCanSpout");
  cone(0.115, 0.16, [0.42, 0.44, -0.96], BLUE, "wateringCanRose", 8, [Math.PI / 2, 0, 0]);
  // handle is a squared arch, thick enough to read from the back too
  rod([0.83, 0.63, -0.58], [0.78, 0.98, -0.58], 0.045, BLUE, "wateringCanHandleL");
  rod([1.21, 0.63, -0.58], [1.25, 0.98, -0.58], 0.045, BLUE, "wateringCanHandleR");
  rod([0.78, 0.98, -0.58], [1.25, 0.98, -0.58], 0.045, BLUE, "wateringCanHandleTop");
  for (const p of [[0.93, 0.52, -0.9], [1.03, 0.45, -0.91], [1.13, 0.52, -0.9]] as [number, number, number][]) sphere(0.025, p, GOLD, `wateringCanRivet${p[0]}`);

  // Mushrooms and a whimsical butterfly tie the foreground together.
  const mushroom = (x: number, z: number, cap: string, name: string) => {
    cyl(0.045, 0.2, [x, 0.34, z], CREAM, `${name}Stem`, 8);
    sphere(0.14, [x, 0.47, z], cap, `${name}Cap`, [1.35, 0.52, 1.15]);
    for (const side of [-1, 1]) sphere(0.022, [x + side * 0.06, 0.48, z + 0.08], WHITE, `${name}Spot${side}`);
  };
  mushroom(-0.44, -0.9, RED, "mushroomRed");
  mushroom(1.12, 0.28, PURPLE, "mushroomPurple");
  rod([0.1, 0.5, -0.98], [0.1, 0.78, -0.98], 0.01, WOOD_DARK, "butterflyStem");
  sphere(0.025, [0.1, 0.82, -0.98], GOLD, "butterflyBody");
  sphere(0.075, [0.03, 0.84, -0.98], PINK, "butterflyWingL", [1, 0.45, 0.65]);
  sphere(0.075, [0.17, 0.84, -0.98], PINK, "butterflyWingR", [1, 0.45, 0.65]);

  // A few grass tufts and fallen leaves soften the hard primitive edges.
  for (const [i, p] of [
    [-1.15, 0.3, -0.7], [-0.6, 0.3, 0.72], [0.95, 0.3, 0.72], [1.15, 0.3, -0.18], [-0.28, 0.3, 0.72],
  ].entries()) {
    const [x, y, z] = p;
    for (const side of [-1, 1]) rod([x, y, z], [x + side * 0.07, y + 0.2, z], 0.012, i % 2 ? LEAF : LEAF_LIGHT, `grassTuft${i}${side}`);
  }
  for (const [i, p] of ([
    [-0.8, 0.245, -0.74], [0.4, 0.245, 0.73], [1.1, 0.245, -0.35], [-0.25, 0.245, -0.8],
  ] as [number, number, number][]).entries()) {
    sphere(0.06, p, i % 2 ? YELLOW : RED, `fallenLeaf${i}`, [1.7, 0.18, 0.75]);
  }

  return b.root;
}
