import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";

const SAND = "#d9a441";
const SAND_LIGHT = "#f3c866";
const SAND_DARK = "#b97632";
const WATER = "#36b6b0";
const WATER_LIGHT = "#8ce4d1";
const PALM = "#2f7b43";
const PALM_LIGHT = "#66ad57";
const TRUNK = "#8a512e";
const TRUNK_LIGHT = "#b97642";
const TRUNK_DARK = "#663823";
const CANVAS = "#f5d9a0";
const CANVAS_RED = "#d76a4b";
const CANVAS_DARK = "#9f493a";
const TURQUOISE = "#277f83";
const CLAY = "#b95d3e";
const CLAY_LIGHT = "#e28a56";
const CLAY_DARK = "#7d3f32";
const WOOD = "#633b2a";
const ROPE = "#d6aa58";
const CAMEL = "#c9854b";
const CAMEL_LIGHT = "#e4ae68";
const CAMEL_DARK = "#9b5b38";
const DARK = "#342432";
const GOLD = "#f4c34f";
const PINK = "#e77b75";

export const meta = {
  name: "Sunspun Oasis",
  description: "A low-poly whimsical desert oasis diorama with palms, striped tent, camels, water and market clutter.",
  style: "low-poly whimsical mix",
  commit: "07503e3",
};

export default function build() {
  const b = createBuilder({ name: "desertOasisDiorama", detail: 1 });
  const root = b.joint("oasisRoot", { at: [0, 0, 0], role: "spine" });
  const random = rng(17);

  const part = (
    name: string,
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    options: { rotation?: [number, number, number]; scale?: [number, number, number]; flat?: boolean } = {},
  ) => b.part(geometry, color, { ...options, name, bone: root, at });

  const box = (name: string, at: [number, number, number], size: [number, number, number], color: string, rotation?: [number, number, number]) =>
    part(name, new THREE.BoxGeometry(...size), color, at, { rotation, flat: true });
  const cylinder = (name: string, at: [number, number, number], radius: number, height: number, color: string, segments = 8, rotation?: [number, number, number]) =>
    part(name, new THREE.CylinderGeometry(radius, radius * 1.04, height, segments), color, at, { rotation, flat: true });
  const sphere = (name: string, at: [number, number, number], scale: [number, number, number], color: string) =>
    part(name, new THREE.SphereGeometry(1, 8, 6), color, at, { scale, flat: true });
  const cone = (name: string, at: [number, number, number], radius: number, height: number, color: string, segments = 7, rotation?: [number, number, number]) =>
    part(name, new THREE.ConeGeometry(radius, height, segments), color, at, { rotation, flat: true });

  // A chunky plinth, with a slightly smaller upper layer to make the sand feel sculpted.
  cylinder("sandPlinth", [0, 0.09, 0], 1.52, 0.18, SAND_DARK, 12);
  cylinder("sandTop", [0, 0.205, 0], 1.42, 0.1, SAND, 12);
  cylinder("sandCenter", [0, 0.263, 0], 1.27, 0.035, SAND_LIGHT, 12);
  // Low-poly dune humps around the rim.
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    const r = 1.12 + (i % 3) * 0.1;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    sphere(`duneHump${i}`, [x, 0.31, z], [0.3 + (i % 2) * 0.08, 0.13 + (i % 3) * 0.025, 0.23], i % 3 === 0 ? SAND_DARK : SAND_LIGHT);
  }

  // Oasis pool: stepped shore, water, and four glint tiles.
  cylinder("poolShore", [-0.18, 0.3, 0.2], 0.7, 0.06, SAND_DARK, 10);
  cylinder("poolWater", [-0.18, 0.337, 0.2], 0.59, 0.025, WATER, 10);
  for (let i = 0; i < 7; i += 1) {
    const a = (i / 7) * Math.PI * 2;
    sphere(`waterGlint${i}`, [-0.18 + Math.cos(a) * 0.33, 0.36, 0.2 + Math.sin(a) * 0.25], [0.065, 0.008, 0.018], WATER_LIGHT);
  }
  sphere("LilyPadA", [-0.36, 0.365, 0.1], [0.14, 0.012, 0.09], PALM);
  sphere("LilyPadB", [0.12, 0.365, 0.32], [0.1, 0.012, 0.07], PALM_LIGHT);
  for (const [i, dx, dz] of [[0, 0, 0.04], [1, 0.045, 0], [2, 0, -0.04], [3, -0.045, 0]] as const)
    sphere(`LilyPetal${i}`, [-0.36 + dx, 0.382, 0.1 + dz], [0.035, 0.012, 0.025], PINK);
  for (const [i, x, z] of [[0, -0.75, 0.65], [1, -0.7, -0.35], [2, 0.48, 0.47], [3, 0.8, -0.15]] as const) {
    sphere(`shoreRock${i}`, [x, 0.37, z], [0.13, 0.1, 0.1], i % 2 ? CLAY : SAND_DARK);
  }

  const leaf = (name: string, base: [number, number, number], tip: [number, number, number], color: string) => {
    b.sweep([base, tip], [0.045, 0.008], { bone: root, caps: "point", color, section: { ngon: 5 }, name });
  };
  const palm = (prefix: string, x: number, z: number, h: number, lean: number) => {
    const baseY = 0.31;
    const top: [number, number, number] = [x + lean * 0.12, baseY + h, z + lean * 0.05];
    const mid: [number, number, number] = [x + lean * 0.05, baseY + h * 0.5, z];
    b.sweep([[x, baseY, z], mid, top], [0.095, 0.06, 0.035], { bone: root, color: TRUNK, section: { ngon: 6 }, name: `${prefix}Trunk` });
    for (let j = 0; j < 5; j += 1) {
      const y = baseY + 0.35 + j * 0.27;
      cylinder(`${prefix}BarkBand${j}`, [x + lean * 0.12 * ((y - baseY) / h), y, z], 0.1 - j * 0.011, 0.026, j % 2 ? TRUNK_LIGHT : TRUNK_DARK, 7, [0, 0, 0]);
    }
    sphere(`${prefix}Crown`, top, [0.16, 0.13, 0.16], TRUNK_DARK);
    for (let j = 0; j < 9; j += 1) {
      const a = (j / 9) * Math.PI * 2 + 0.2;
      const length = 0.42 + (j % 3) * 0.06;
      const tip: [number, number, number] = [top[0] + Math.cos(a) * length, top[1] - 0.04 - (j % 2) * 0.045, top[2] + Math.sin(a) * length];
      leaf(`${prefix}Frond${j}`, [top[0], top[1], top[2]], tip, j % 3 ? PALM : PALM_LIGHT);
      if (j % 2 === 0) {
        leaf(`${prefix}FrondRib${j}`, [top[0], top[1] + 0.012, top[2]], [tip[0], tip[1] + 0.012, tip[2]], PALM_LIGHT);
      }
    }
    for (let j = 0; j < 3; j += 1) {
      sphere(`${prefix}Date${j}`, [top[0] + (j - 1) * 0.05, top[1] - 0.12, top[2] + 0.03 * (j % 2)], [0.035, 0.045, 0.035], CLAY_DARK);
    }
  };
  palm("PalmA", -0.98, 0.62, 1.72, 0.4);
  palm("PalmB", 0.85, 0.63, 1.43, -0.32);
  palm("PalmC", 0.94, -0.8, 1.17, 0.18);

  // Striped triangular tent and its layered canopy panels.
  const tentAt: [number, number, number] = [0.32, 0.31, -0.55];
  const tentOutline: [number, number, "sharp"][] = [[-0.56, 0, "sharp"], [0, 0.82, "sharp"], [0.56, 0, "sharp"]];
  b.extrude(tentOutline, { at: tentAt, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.82, bevel: 0.015, color: CANVAS, bone: root, name: "TentCanvas" });
  b.extrude([[-0.56, 0, "sharp"], [0, 0.82, "sharp"], [0.13, 0.63, "sharp"], [-0.26, 0.05, "sharp"]], { at: [tentAt[0], tentAt[1], tentAt[2] + 0.416], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, color: CANVAS_RED, bone: root, name: "TentFrontStripeL" });
  b.extrude([[0.56, 0, "sharp"], [0, 0.82, "sharp"], [-0.13, 0.63, "sharp"], [0.26, 0.05, "sharp"]], { at: [tentAt[0], tentAt[1], tentAt[2] + 0.416], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, color: CANVAS_RED, bone: root, name: "TentFrontStripeR" });
  cylinder("TentPoleL", [-0.23, 0.71, -0.55], 0.025, 0.94, WOOD, 6);
  cylinder("TentPoleR", [0.87, 0.71, -0.55], 0.025, 0.94, WOOD, 6);
  sphere("TentPoleCapL", [-0.23, 1.2, -0.55], [0.05, 0.05, 0.05], GOLD);
  sphere("TentPoleCapR", [0.87, 1.2, -0.55], [0.05, 0.05, 0.05], GOLD);
  box("TentRug", [0.32, 0.33, -0.55], [1.04, 0.025, 0.75], TURQUOISE);
  box("TentRugStripe", [0.32, 0.346, -0.55], [0.18, 0.008, 0.75], GOLD);
  box("TentRugStripe2", [0.05, 0.347, -0.55], [0.04, 0.009, 0.75], CANVAS_RED);
  box("TentRugStripe3", [0.59, 0.347, -0.55], [0.04, 0.009, 0.75], CANVAS_RED);
  for (let i = 0; i < 7; i += 1) {
    const fx = tentAt[0] - 0.48 + i * 0.16;
    box(`TentHem${i}`, [fx, 0.36, tentAt[2] + 0.43], [0.095, 0.025, 0.04], i % 2 ? CANVAS_RED : GOLD);
  }
  b.extrude([[-0.23, 0, "sharp"], [0, 0.52, "sharp"], [0.23, 0, "sharp"]], { at: [tentAt[0], tentAt[1] + 0.01, tentAt[2] + 0.425], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.014, bevel: 0.006, color: CANVAS_DARK, bone: root, name: "TentDoorway" });
  box("TentDoorMat", [tentAt[0], 0.355, tentAt[2] + 0.44], [0.38, 0.018, 0.12], GOLD);
  b.rod([-0.23, 1.16, -0.55], [0.87, 1.16, -0.55], 0.012, { bone: root, color: ROPE, name: "TentPennantRope" });
  for (let i = 0; i < 5; i += 1) {
    const px = -0.12 + i * 0.22;
    cone(`TentPennant${i}`, [px, 1.1 - Math.abs(px - 0.32) * 0.08, -0.55], 0.065, 0.14, i % 2 ? CANVAS_RED : GOLD, 3);
  }

  // A little market corner: awning, crate, painted jars, basket and hanging lantern.
  box("AwningBeam", [-0.84, 1.02, -0.65], [0.76, 0.08, 0.08], WOOD);
  box("AwningCloth", [-0.84, 0.91, -0.65], [0.86, 0.05, 0.46], CANVAS_RED, [0.18, 0, 0]);
  for (let i = 0; i < 5; i += 1) {
    box(`AwningStripe${i}`, [-1.16 + i * 0.16, 0.88, -0.64], [0.07, 0.04, 0.47], CANVAS);
  }
  cylinder("AwningPostL", [-1.19, 0.63, -0.65], 0.035, 0.7, WOOD, 6);
  cylinder("AwningPostR", [-0.49, 0.63, -0.65], 0.035, 0.7, WOOD, 6);
  box("MarketCrate", [-0.98, 0.45, -0.1], [0.38, 0.3, 0.36], WOOD);
  box("CrateSlatTop", [-0.98, 0.62, -0.1], [0.41, 0.035, 0.39], TRUNK_LIGHT);
  for (let i = 0; i < 3; i += 1) box(`CrateSlat${i}`, [-1.1 + i * 0.12, 0.46, -0.1], [0.035, 0.26, 0.38], TRUNK_LIGHT);
  for (let i = 0; i < 3; i += 1) {
    cylinder(`Jar${i}`, [-0.68 + i * 0.2, 0.48, -0.1], 0.1, 0.26, i % 2 ? CLAY_LIGHT : TURQUOISE, 8);
    cylinder(`JarNeck${i}`, [-0.68 + i * 0.2, 0.64, -0.1], 0.065, 0.08, i % 2 ? CLAY : GOLD, 8);
    cylinder(`JarLip${i}`, [-0.68 + i * 0.2, 0.69, -0.1], 0.075, 0.018, GOLD, 8);
  }
  cylinder("Basket", [-1.13, 0.44, 0.36], 0.19, 0.24, TRUNK_LIGHT, 8);
  cylinder("BasketRim", [-1.13, 0.58, 0.36], 0.2, 0.035, ROPE, 8);
  for (let i = 0; i < 5; i += 1) cylinder(`BasketWeave${i}`, [-1.13, 0.45 + i * 0.035, 0.36], 0.195, 0.012, i % 2 ? ROPE : TRUNK, 8);
  cylinder("LanternTop", [-0.84, 1.38, -0.65], 0.11, 0.04, GOLD, 6);
  cylinder("LanternGlow", [-0.84, 1.25, -0.65], 0.085, 0.2, PINK, 8);
  cylinder("LanternBottom", [-0.84, 1.14, -0.65], 0.1, 0.035, GOLD, 6);
  for (const x of [-0.84, -0.92, -0.76]) cylinder(`LanternBar${x}`, [x, 1.25, -0.65], 0.012, 0.22, GOLD, 5);

  // Two friendly low-poly camels, facing toward the pond (+Z).
  const camel = (prefix: string, x: number, z: number, scale: number, blanket: string) => {
    const y = 0.31;
    sphere(`${prefix}Body`, [x, y + 0.38 * scale, z], [0.4 * scale, 0.31 * scale, 0.68 * scale], CAMEL);
    sphere(`${prefix}HumpA`, [x - 0.17 * scale, y + 0.74 * scale, z - 0.12 * scale], [0.17 * scale, 0.24 * scale, 0.2 * scale], CAMEL_DARK);
    sphere(`${prefix}HumpB`, [x + 0.15 * scale, y + 0.76 * scale, z - 0.12 * scale], [0.16 * scale, 0.23 * scale, 0.19 * scale], CAMEL);
    box(`${prefix}Blanket`, [x, y + 0.65 * scale, z + 0.03 * scale], [0.43 * scale, 0.035 * scale, 0.72 * scale], blanket);
    box(`${prefix}BlanketStripe`, [x, y + 0.66 * scale, z + 0.03 * scale], [0.1 * scale, 0.045 * scale, 0.74 * scale], GOLD);
    for (const s of [-1, 1]) {
      const lx = x + s * 0.25 * scale;
      cylinder(`${prefix}Leg${s}F`, [lx, y + 0.15 * scale, z + 0.34 * scale], 0.095 * scale, 0.35 * scale, CAMEL, 7);
      cylinder(`${prefix}Leg${s}B`, [lx, y + 0.15 * scale, z - 0.34 * scale], 0.095 * scale, 0.35 * scale, CAMEL_DARK, 7);
      box(`${prefix}Hoof${s}F`, [lx, y - 0.02 * scale, z + 0.34 * scale], [0.17 * scale, 0.07 * scale, 0.14 * scale], DARK);
      box(`${prefix}Hoof${s}B`, [lx, y - 0.02 * scale, z - 0.34 * scale], [0.17 * scale, 0.07 * scale, 0.14 * scale], DARK);
    }
    b.sweep([[x, y + 0.52 * scale, z + 0.49 * scale], [x + 0.03 * scale, y + 0.86 * scale, z + 0.64 * scale], [x + 0.02 * scale, y + 1.08 * scale, z + 0.6 * scale]], [0.16 * scale, 0.1 * scale, 0.07 * scale], { bone: root, color: CAMEL, section: { ngon: 6 }, name: `${prefix}Neck` });
    sphere(`${prefix}Head`, [x + 0.02 * scale, y + 1.18 * scale, z + 0.61 * scale], [0.19 * scale, 0.17 * scale, 0.23 * scale], CAMEL_LIGHT);
    box(`${prefix}Muzzle`, [x + 0.02 * scale, y + 1.12 * scale, z + 0.79 * scale], [0.22 * scale, 0.12 * scale, 0.2 * scale], CAMEL_LIGHT);
    sphere(`${prefix}Nose`, [x + 0.02 * scale, y + 1.12 * scale, z + 0.89 * scale], [0.09 * scale, 0.06 * scale, 0.045 * scale], CAMEL_DARK);
    for (const s of [-1, 1]) {
      cone(`${prefix}Ear${s}`, [x + s * 0.13 * scale, y + 1.36 * scale, z + 0.57 * scale], 0.065 * scale, 0.18 * scale, CAMEL_DARK, 5, [0, 0, s * 0.35]);
      sphere(`${prefix}Eye${s}`, [x + s * 0.13 * scale, y + 1.2 * scale, z + 0.79 * scale], [0.025 * scale, 0.025 * scale, 0.018 * scale], DARK);
    }
    b.rod([x - 0.14 * scale, y + 1.04 * scale, z + 0.64 * scale], [x + 0.17 * scale, y + 1.04 * scale, z + 0.64 * scale], 0.012 * scale, { bone: root, color: ROPE, name: `${prefix}NeckCollar` });
    b.rod([x + 0.02 * scale, y + 1.11 * scale, z + 0.86 * scale], [x + 0.03 * scale, y + 0.83 * scale, z + 0.68 * scale], 0.009 * scale, { bone: root, color: ROPE, name: `${prefix}Rein` });
    b.sweep([[x - 0.05 * scale, y + 0.51 * scale, z - 0.58 * scale], [x - 0.17 * scale, y + 0.55 * scale, z - 0.78 * scale]], [0.045 * scale, 0.012 * scale], { bone: root, caps: "point", color: CAMEL_DARK, section: { ngon: 5 }, name: `${prefix}Tail` });
    for (let i = 0; i < 3; i += 1) sphere(`${prefix}TailTuft${i}`, [x - 0.17 * scale + i * 0.035 * scale, y + 0.54 * scale, z - 0.79 * scale], [0.045 * scale, 0.06 * scale, 0.045 * scale], CAMEL_DARK);
    // Tiny saddle bags make the two animals feel like travelers, not mannequins.
    for (const s of [-1, 1]) box(`${prefix}SaddleBag${s}`, [x + s * 0.23 * scale, y + 0.55 * scale, z + 0.01 * scale], [0.11 * scale, 0.17 * scale, 0.2 * scale], s > 0 ? CANVAS_RED : TURQUOISE);
  };
  camel("CamelA", 0.72, 0.12, 0.92, CANVAS_RED);
  camel("CamelB", -0.5, 0.87, 0.68, TURQUOISE);

  // Loose story details around the shoreline: cairn, date tray, rope coils and flowers.
  for (let i = 0; i < 4; i += 1) {
    const x = 0.94 + i * 0.08;
    sphere(`Cairn${i}`, [x, 0.34 + i * 0.08, 0.35], [0.11 - i * 0.015, 0.08, 0.1], i % 2 ? CLAY_LIGHT : SAND_DARK);
  }
  cylinder("DateTray", [0.12, 0.38, 0.82], 0.2, 0.04, GOLD, 8);
  for (let i = 0; i < 8; i += 1) sphere(`Date${i}`, [0.12 + Math.cos(i * 0.8) * 0.12, 0.43, 0.82 + Math.sin(i * 0.8) * 0.12], [0.035, 0.03, 0.035], CLAY_DARK);
  for (let i = 0; i < 3; i += 1) {
    const a = i * 2.1;
    cylinder(`RopeCoil${i}`, [0.62 + Math.cos(a) * 0.11, 0.38 + i * 0.018, -0.98 + Math.sin(a) * 0.11], 0.14, 0.018, ROPE, 10);
  }
  for (let i = 0; i < 6; i += 1) {
    const x = -0.26 + (i % 3) * 0.1;
    const z = 0.96 + Math.floor(i / 3) * 0.1;
    cylinder(`FlowerStem${i}`, [x, 0.44, z], 0.012, 0.16, PALM, 5);
    sphere(`Flower${i}`, [x, 0.54, z], [0.055, 0.035, 0.055], i % 2 ? PINK : GOLD);
  }

  // Use the seeded source so any future hand-placed pebbles remain deterministic.
  for (let i = 0; i < 8; i += 1) {
    const x = -1.15 + random() * 2.3;
    const z = -1.15 + random() * 2.3;
    if (Math.abs(x + 0.18) < 0.75 && Math.abs(z - 0.2) < 0.7) continue;
    sphere(`LoosePebble${i}`, [x, 0.34, z], [0.035 + random() * 0.035, 0.025, 0.04], SAND_DARK);
  }

  return b.root;
}
