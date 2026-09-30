import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { glow } from "../kits/glow";

export const meta = {
  name: "Blacksmith's Forge · Astra",
  description: "A stylized low-poly blacksmith shop diorama with a glowing forge, tools, anvil, bellows, and tiny workshop details.",
};

const STONE = "#66707a";
const STONE_DARK = "#3d4650";
const STONE_LIGHT = "#8f9aa0";
const WOOD = "#69402d";
const WOOD_LIGHT = "#9b603b";
const WOOD_DARK = "#3e261f";
const IRON = "#252b31";
const IRON_LIGHT = "#59636a";
const LEATHER = "#713c27";
const LEATHER_LIGHT = "#a9653d";
const COAL = "#1e2024";
const FIRE = "#ff6b22";
const FIRE_LIGHT = "#ffd05b";
const BRASS = "#c1883f";
const WATER = "#3d9bb0";
const ROPE = "#c49b61";
const PAPER = "#ead9a8";

export default function build() {
  const b = createBuilder({ name: "blacksmithForgeAstra", detail: 0.85 });
  const root = b.joint("root", { at: [0, 0, 0], role: "spine" });
  const bellowsHinge = b.joint("bellowsHinge", {
    parent: root,
    at: [-0.71, 0.3, 0.18],
    aim: [-0.71, 0.55, 0.18],
    role: "hinge",
  });
  const signHinge = b.joint("signHinge", {
    parent: root,
    at: [0.05, 0.91, -0.43],
    aim: [0.05, 1.1, -0.43],
    role: "hinge",
  });

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    options: { bone?: typeof root; rotation?: [number, number, number] } = {},
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      bone: options.bone ?? root,
      at,
      rotation: options.rotation,
      flat: true,
    });
  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    options: { bone?: typeof root; dir?: [number, number, number]; segments?: number } = {},
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, options.segments ?? b.segments(8)), color, {
      bone: options.bone ?? root,
      at,
      dir: options.dir,
      axis: "y",
      flat: true,
    });
  const cone = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    options: { bone?: typeof root; dir?: [number, number, number] } = {},
  ) =>
    b.part(new THREE.ConeGeometry(radius, height, b.segments(7)), color, {
      bone: options.bone ?? root,
      at,
      dir: options.dir,
      axis: "y",
      flat: true,
    });
  const rod = (a: [number, number, number], c: [number, number, number], radius: number, color: string) =>
    b.rod(a, c, radius, { color, section: "box", sides: 6 });

  // A chunky timber plinth and inset floor establish the tabletop scale.
  box([1.62, 0.16, 1.1], [0, 0.08, 0], WOOD_DARK);
  box([1.5, 0.045, 0.98], [0, 0.182, 0], "#a6764f");
  for (const x of [-0.72, 0.72]) box([0.08, 0.22, 1.08], [x, 0.11, 0], WOOD);
  for (const z of [-0.48, 0.48]) box([1.48, 0.22, 0.07], [0, 0.11, z], WOOD);
  // Nail heads around the rim.
  for (const x of [-0.64, 0, 0.64]) for (const z of [-0.48, 0.48]) cyl(0.018, 0.012, [x, 0.235, z], IRON_LIGHT, { segments: 6 });

  // Forge: masonry hearth, bright coal bed, and a stepped chimney.
  box([0.45, 0.16, 0.4], [-0.42, 0.27, 0.21], STONE_DARK);
  for (const [x, z, c] of [
    [-0.65, 0.21, STONE_LIGHT], [-0.42, 0.21, STONE], [-0.19, 0.21, STONE_LIGHT],
    [-0.65, 0.39, STONE], [-0.42, 0.39, STONE_LIGHT], [-0.19, 0.39, STONE],
  ] as [number, number, string][]) box([0.2, 0.17, 0.16], [x, 0.35, z], c);
  box([0.36, 0.04, 0.28], [-0.42, 0.405, 0.23], COAL);
  for (const p of [[-0.55, 0.445, 0.17], [-0.39, 0.445, 0.26], [-0.28, 0.445, 0.18], [-0.48, 0.455, 0.32]] as [number, number, number][]) {
    glow(cyl(0.038, 0.06, p, FIRE, { segments: 6 }), 2.1);
  }
  box([0.29, 0.06, 0.2], [-0.42, 0.48, 0.23], FIRE_LIGHT);
  glow(b.part(new THREE.BoxGeometry(0.25, 0.035, 0.17), FIRE, { bone: root, at: [-0.42, 0.52, 0.23], flat: true }), 1.8);
  for (let row = 0; row < 3; row++) {
    const y = 0.52 + row * 0.16;
    const width = 0.33 - row * 0.035;
    box([width, 0.14, 0.28], [-0.42, y, 0.28], row === 1 ? STONE_LIGHT : STONE);
    box([width * 0.94, 0.035, 0.04], [-0.42, y + 0.07, 0.14], STONE_DARK);
  }
  box([0.39, 0.12, 0.33], [-0.42, 1.03, 0.28], STONE_DARK);
  box([0.46, 0.07, 0.38], [-0.42, 1.125, 0.28], STONE_LIGHT);
  // Chimney lip and a few soot-dark courses.
  box([0.3, 0.12, 0.25], [-0.42, 1.22, 0.28], IRON);
  box([0.36, 0.035, 0.31], [-0.42, 1.295, 0.28], STONE_DARK);

  // Leather bellows at the forge side, with a visible hinge and handles.
  box([0.3, 0.18, 0.2], [-0.72, 0.36, 0.18], LEATHER, { bone: bellowsHinge, rotation: [0, 0, -9] });
  box([0.24, 0.12, 0.16], [-0.71, 0.49, 0.18], LEATHER_LIGHT, { bone: bellowsHinge, rotation: [0, 0, 8] });
  rod([-0.81, 0.35, 0.08], [-0.81, 0.68, 0.08], 0.018, WOOD_LIGHT);
  rod([-0.61, 0.34, 0.08], [-0.61, 0.67, 0.08], 0.018, WOOD_LIGHT);
  box([0.3, 0.035, 0.24], [-0.71, 0.69, 0.08], WOOD_LIGHT, { bone: bellowsHinge, rotation: [0, 0, -4] });
  cyl(0.025, 0.08, [-0.71, 0.41, 0.08], BRASS, { bone: bellowsHinge, segments: 6 });
  rod([-0.72, 0.36, 0.29], [-0.42, 0.44, 0.29], 0.025, IRON);

  // Anvil and stump, front and centre for a strong silhouette.
  cyl(0.18, 0.4, [-0.02, 0.39, 0.05], WOOD_DARK, { segments: 8 });
  cyl(0.2, 0.05, [-0.02, 0.6, 0.05], WOOD_LIGHT, { segments: 8 });
  box([0.3, 0.12, 0.2], [-0.02, 0.7, 0.05], IRON, { rotation: [0, 0, 0] });
  box([0.4, 0.07, 0.17], [-0.02, 0.79, 0.05], IRON_LIGHT);
  cone(0.1, 0.34, [0.22, 0.79, 0.05], IRON, { dir: [1, 0, 0] });
  box([0.07, 0.13, 0.19], [-0.13, 0.62, 0.05], IRON);
  box([0.07, 0.13, 0.19], [0.09, 0.62, 0.05], IRON);

  // Quench barrel with dark hoops and blue water.
  cyl(0.19, 0.35, [0.48, 0.39, 0.18], WOOD, { segments: 10 });
  cyl(0.17, 0.018, [0.48, 0.575, 0.18], WATER, { segments: 10 });
  for (const y of [0.27, 0.47, 0.57]) {
    b.part(new THREE.TorusGeometry(0.19, 0.018, 5, 10), IRON, { bone: root, at: [0.48, y, 0.18], rotation: [90, 0, 0], flat: true });
  }
  box([0.04, 0.19, 0.04], [0.48, 0.69, 0.18], WOOD_LIGHT, { rotation: [0, 0, -18] });
  box([0.04, 0.19, 0.04], [0.55, 0.69, 0.18], WOOD_LIGHT, { rotation: [0, 0, 22] });

  // Workbench at the rear right, with legs and a shelf.
  box([0.56, 0.1, 0.25], [0.52, 0.67, 0.32], WOOD_LIGHT);
  for (const x of [0.3, 0.74]) for (const z of [0.23, 0.41]) box([0.07, 0.43, 0.07], [x, 0.42, z], WOOD_DARK);
  box([0.5, 0.06, 0.22], [0.52, 0.26, 0.32], WOOD);
  // Horseshoes on the bench front.
  for (const x of [0.38, 0.52, 0.66]) {
    b.part(new THREE.TorusGeometry(0.055, 0.012, 5, 8, Math.PI * 1.55), IRON_LIGHT, {
      bone: root,
      at: [x, 0.76, 0.18],
      rotation: [90, 0, 0],
      flat: true,
    });
  }

  // Tool rack: upright posts, crossbar, tongs, and three hammers.
  box([0.06, 0.64, 0.06], [0.2, 0.67, 0.48], WOOD_DARK);
  box([0.06, 0.64, 0.06], [0.78, 0.67, 0.48], WOOD_DARK);
  rod([0.2, 0.98, 0.48], [0.78, 0.98, 0.48], 0.035, WOOD_LIGHT);
  for (const x of [0.3, 0.48, 0.66]) {
    rod([x, 0.94, 0.48], [x + 0.015, 0.62, 0.48], 0.012, IRON_LIGHT);
    box([0.12, 0.07, 0.07], [x + 0.015, 0.59, 0.48], IRON, { rotation: [0, 0, x % 0.1 * 20] });
  }
  // Long tongs hang at an angle.
  rod([0.29, 0.95, 0.44], [0.43, 0.55, 0.44], 0.012, IRON_LIGHT);
  rod([0.33, 0.95, 0.44], [0.49, 0.56, 0.44], 0.012, IRON_LIGHT);
  cyl(0.035, 0.04, [0.31, 0.96, 0.44], BRASS, { segments: 6, dir: [0, 0, 1] });

  // Half-forged glowing sword cooling on the workbench.
  const blade = b.extrude(
    [[0, 0, "sharp"], [0.38, 0.035], [0.54, 0.0, "sharp"], [0.38, -0.035], [0, 0, "sharp"]],
    { at: [0.38, 0.8, 0.32], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.035, color: FIRE_LIGHT, bevel: 0.008 },
  );
  glow(blade, 2.2);
  box([0.15, 0.045, 0.08], [0.31, 0.8, 0.29], IRON, { rotation: [0, 0, 0] });
  rod([0.27, 0.8, 0.24], [0.14, 0.8, 0.24], 0.026, WOOD_DARK);
  cyl(0.035, 0.12, [0.25, 0.8, 0.24], BRASS, { segments: 6, dir: [0, 0, 1] });

  // Firewood pile in the front-right corner.
  for (const [a, c] of [
    [[0.64, 0.29, -0.25], [0.9, 0.34, -0.25]],
    [[0.62, 0.39, -0.25], [0.86, 0.44, -0.25]],
    [[0.7, 0.49, -0.25], [0.93, 0.54, -0.25]],
  ] as [[number, number, number], [number, number, number]][]) {
    b.capsule(a, c, 0.055, { color: WOOD_LIGHT, section: "box", sides: 6 });
    cyl(0.042, 0.008, a, STONE_LIGHT, { segments: 6, dir: [1, 0, 0] });
  }

  // A warm hanging lantern tucked between rack and sign.
  box([0.12, 0.19, 0.12], [0.82, 0.74, 0.2], IRON);
  glow(cyl(0.052, 0.11, [0.82, 0.74, 0.2], FIRE_LIGHT, { segments: 8 }), 1.6);
  cone(0.09, 0.07, [0.82, 0.875, 0.2], BRASS);
  rod([0.82, 0.91, 0.2], [0.82, 1.0, 0.2], 0.012, BRASS);

  // Shop sign: a movable board with a painted-looking raised anvil emblem.
  box([0.43, 0.22, 0.045], [0.05, 1.02, -0.45], WOOD_LIGHT, { bone: signHinge, rotation: [0, 0, -3] });
  box([0.37, 0.15, 0.018], [0.05, 1.02, -0.475], PAPER, { bone: signHinge, rotation: [0, 0, -3] });
  box([0.16, 0.035, 0.025], [0.05, 1.01, -0.495], IRON, { bone: signHinge, rotation: [0, 0, -3] });
  cone(0.045, 0.12, [-0.015, 1.055, -0.495], IRON, { bone: signHinge });
  box([0.06, 0.95, 0.06], [-0.2, 0.68, -0.43], WOOD_DARK);
  box([0.06, 0.95, 0.06], [0.3, 0.68, -0.43], WOOD_DARK);
  box([0.56, 0.06, 0.06], [0.05, 1.16, -0.43], WOOD_DARK);
  rod([-0.2, 1.15, -0.43], [0.05, 1.15, -0.43], 0.012, ROPE);
  rod([0.05, 1.15, -0.43], [0.3, 1.15, -0.43], 0.012, ROPE);

  return b.root;
}
