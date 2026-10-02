import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { pixelArt } from "../kits/pixel";
import { glow } from "../kits/glow";

export const meta = {
  name: "Rainy Bus Stop Diorama",
  description:
    "A cosy small-town bus shelter glowing through a rainy evening, with a bench, timetable, puddled road, lamppost and fallen leaves.",
};

const ASPHALT = "#172536";
const ASPHALT_EDGE = "#26384a";
const CONCRETE = "#6e7d86";
const CONCRETE_LIGHT = "#a6b1ae";
const STEEL = "#344a5b";
const STEEL_HIGHLIGHT = "#7893a0";
const GLASS = "#274d60";
const GLASS_EDGE = "#5d9ab0";
const WOOD = "#553d32";
const WOOD_LIGHT = "#93654a";
const BLACK = "#101722";
const RAIN = "#8bbdd0";
const AMBER = "#ffb34e";
const AMBER_DARK = "#a65d2c";
const LEAF = "#cb7040";
const LEAF_GOLD = "#e6b449";
const PUDDLE = "#214f68";
const PUDDLE_HIGHLIGHT = "#4c9bb0";

const AD = pixelArt(
  [
    "................",
    "....YYYYYY......",
    "...YWWWWWWY.....",
    "..YWW....WWY....",
    ".YWW..CC..WWY...",
    ".YWW.CCCC.WWY...",
    ".YWW..CC..WWY...",
    ".YWW....WWY.....",
    ".YWWWWWWWWY.....",
    "..YYYYYYYY......",
    "................",
    "....BBBBBBBB....",
    "....B...B.......",
    "....B...B.......",
    "....B...B.......",
    "....BBBBBBBB....",
    "................",
    "..WWWWWWWWWW....",
    "..W..W..W..W....",
    "..WWWWWWWWWW....",
    "................",
    "...CCCCCCCCCC...",
    "................",
    "................",
  ],
  { Y: "#ffc45b", W: "#fff1bd", C: "#74c8d2", B: "#23485c" },
);

const TIMETABLE = pixelArt(
  [
    "................",
    ".BBBBBBBBBBBBBB.",
    ".BWWWWWWWWWWWWB.",
    ".BW..W..W..W..B.",
    ".BWWWWWWWWWWWWB.",
    ".BW..W..W..W..B.",
    ".BWWWWWWWWWWWWB.",
    ".BBBBBBBBBBBBBB.",
    "................",
    "....C......C....",
    "....C......C....",
    "....C......C....",
    "................",
    "....A......A....",
    "....A......A....",
    "................",
  ],
  { B: "#142838", W: "#dfe7d8", C: "#75b4ba", A: "#f2b04b" },
);

const rand = rng(481516);

export default function build() {
  const b = createBuilder({ name: "rainyBusStopDiorama", detail: 0.85, paintSize: 1024 });
  const root = b.joint("ground", { at: [0, 0, 0], role: "spine" });
  const part = (
    name: string,
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    options: Record<string, unknown> = {},
  ) => b.part(geometry, color, { bone: root, at, name, ...options });
  const box = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    options: Record<string, unknown> = {},
  ) => part(name, new THREE.BoxGeometry(...size), color, at, options);
  const cylinder = (
    name: string,
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    options: Record<string, unknown> = {},
  ) => part(name, new THREE.CylinderGeometry(radius, radius, height, b.segments(8)), color, at, options);
  const rod = (name: string, a: [number, number, number], z: [number, number, number], radius: number, color: string) =>
    b.rod(a, z, radius, { bone: root, color, name, section: "circle", sides: 8 });

  // A chunky square plinth, split into a wet road and a raised rear pavement.
  box("base", [1.2, 0.07, 1.2], [0, 0.035, 0], ASPHALT, { flat: true });
  box("rearPavement", [1.16, 0.045, 0.34], [0, 0.092, -0.42], CONCRETE, { flat: true });
  box("kerb", [1.14, 0.11, 0.11], [0, 0.14, -0.22], CONCRETE_LIGHT, { flat: true });
  for (let x = -0.49; x <= 0.49; x += 0.14)
    box(`kerbJoint${Math.round((x + 0.5) * 100)}`, [0.012, 0.112, 0.114], [x, 0.14, -0.22], ASPHALT_EDGE);
  box("roadGutter", [1.15, 0.012, 0.055], [0, 0.102, -0.145], ASPHALT_EDGE);

  // Deep puddles are deliberately polygonal; slim amber streaks imply the shelter's reflections.
  b.slab(
    [
      [-0.53, 0.102, 0.31],
      [-0.38, 0.102, 0.39],
      [-0.12, 0.102, 0.37],
      [0.02, 0.102, 0.3],
      [-0.06, 0.102, 0.23],
      [-0.36, 0.102, 0.23],
    ],
    { bone: root, color: PUDDLE, thickness: 0.006, name: "puddleLeft" },
  );
  b.slab(
    [
      [0.12, 0.104, 0.34],
      [0.3, 0.104, 0.4],
      [0.54, 0.104, 0.33],
      [0.47, 0.104, 0.2],
      [0.2, 0.104, 0.22],
    ],
    { bone: root, color: PUDDLE, thickness: 0.006, name: "puddleRight" },
  );
  box("reflectionAmber", [0.28, 0.008, 0.018], [-0.18, 0.111, 0.3], AMBER, { flat: true });
  box("reflectionAmber2", [0.18, 0.008, 0.012], [0.12, 0.112, 0.25], AMBER_DARK, { flat: true });
  box("reflectionBlue", [0.22, 0.008, 0.012], [0.34, 0.112, 0.31], PUDDLE_HIGHLIGHT, { flat: true });

  // Shelter frame: four steel uprights, a broad cap, gutter, and glass panels.
  for (const x of [-0.4, 0.4] as const) {
    for (const z of [-0.26, 0.25] as const)
      rod(`shelterPost${x}${z}`, [x, 0.19, z], [x, 1.25, z], 0.017, STEEL_HIGHLIGHT);
  }
  box("shelterRoof", [0.9, 0.055, 0.58], [0, 1.27, -0.005], STEEL, { flat: true });
  box("roofLightEdge", [0.86, 0.025, 0.025], [0, 1.225, 0.27], STEEL_HIGHLIGHT, { flat: true });
  box("roofBackEdge", [0.86, 0.025, 0.025], [0, 1.225, -0.28], STEEL_HIGHLIGHT, { flat: true });
  box("backGlass", [0.77, 0.98, 0.014], [0, 0.7, -0.255], GLASS, { flat: true });
  box("leftGlass", [0.014, 0.98, 0.47], [-0.39, 0.7, -0.005], GLASS, { flat: true });
  box("rightGlass", [0.014, 0.98, 0.47], [0.39, 0.7, -0.005], GLASS, { flat: true });
  box("backGlassTop", [0.77, 0.02, 0.02], [0, 1.19, -0.247], GLASS_EDGE);
  box("glassSill", [0.77, 0.04, 0.03], [0, 0.2, -0.247], GLASS_EDGE);
  for (const x of [-0.2, 0.2] as const) rod(`backMullion${x}`, [x, 0.22, -0.265], [x, 1.2, -0.265], 0.007, STEEL);

  // The bench is layered from broad wooden boards and simple legs.
  box("benchSeat", [0.61, 0.065, 0.18], [0, 0.48, 0.08], WOOD_LIGHT, { flat: true });
  box("benchSeatShadow", [0.61, 0.018, 0.19], [0, 0.44, 0.08], WOOD, { flat: true });
  box("benchBack", [0.61, 0.18, 0.05], [0, 0.69, -0.08], WOOD_LIGHT, { flat: true });
  for (const x of [-0.24, 0.24] as const) {
    rod(`benchLeg${x}`, [x, 0.2, 0.08], [x, 0.45, 0.08], 0.014, STEEL);
    rod(`benchBrace${x}`, [x, 0.28, 0.08], [x, 0.28, -0.08], 0.012, STEEL);
  }
  for (const x of [-0.23, 0, 0.23] as const)
    box(`benchSlat${x}`, [0.018, 0.07, 0.19], [x, 0.49, 0.08], WOOD, { flat: true });

  // A lit poster adds the central warm focal point inside the cool glass.
  box("adFrame", [0.31, 0.48, 0.035], [-0.18, 0.75, -0.23], BLACK, { flat: true });
  const ad = part("litAdvertisement", new THREE.PlaneGeometry(0.275, 0.425), "#ffffff", [-0.18, 0.75, -0.205], {
    dir: [0, 0, 1],
    axis: "z",
    texture: AD,
  });
  glow(ad, 1.8);

  // Timetable post and its tiny readable grid.
  rod("timetablePost", [0.29, 0.18, 0.12], [0.29, 0.81, 0.12], 0.014, STEEL_HIGHLIGHT);
  box("timetableCap", [0.1, 0.025, 0.06], [0.29, 0.85, 0.12], STEEL, { flat: true });
  box("timetableFrame", [0.18, 0.27, 0.035], [0.29, 0.98, 0.105], BLACK, { flat: true });
  part("timetable", new THREE.PlaneGeometry(0.15, 0.24), "#ffffff", [0.29, 0.98, 0.125], {
    dir: [0, 0, 1],
    axis: "z",
    texture: TIMETABLE,
  });

  // Bin with a contrasting lid and a small foot ring.
  box("binBody", [0.13, 0.27, 0.13], [-0.31, 0.25, 0.13], BLACK, { flat: true });
  box("binLid", [0.16, 0.035, 0.16], [-0.31, 0.405, 0.13], STEEL, { flat: true });
  cylinder("binFoot", 0.075, 0.025, [-0.31, 0.11, 0.13], STEEL);

  // Warm street lamp just outside the shelter.
  rod("lampPost", [0.5, 0.19, -0.4], [0.5, 1.28, -0.4], 0.018, STEEL);
  rod("lampArm", [0.5, 1.27, -0.4], [0.54, 1.27, -0.4], 0.014, STEEL_HIGHLIGHT);
  box("lampCap", [0.13, 0.035, 0.11], [0.54, 1.22, -0.4], BLACK, { flat: true });
  const lamp = part(
    "lampGlow",
    new THREE.SphereGeometry(0.055, b.segments(10), b.segments(6)),
    AMBER,
    [0.54, 1.18, -0.4],
    { flat: true },
  );
  glow(lamp, 2.4);
  box("lampBase", [0.12, 0.03, 0.12], [0.5, 0.17, -0.4], STEEL, { flat: true });

  // Flat fallen leaves, varied by the seeded generator and kept close to the pavement.
  const leafColours = [LEAF, LEAF_GOLD, AMBER_DARK];
  for (let i = 0; i < 13; i++) {
    const x = -0.54 + rand() * 1.08;
    const z = -0.1 + rand() * 0.62;
    const w = 0.035 + rand() * 0.032;
    const d = 0.018 + rand() * 0.022;
    box(`leaf${i}`, [w, 0.006, d], [x, 0.11 + i * 0.0001, z], leafColours[i % leafColours.length], {
      flat: true,
      rotation: [0, rand() * 55, 0],
    });
    if (i % 4 === 0)
      box(`leafStem${i}`, [w * 0.65, 0.004, 0.004], [x, 0.115, z + d * 0.3], LEAF_GOLD, {
        flat: true,
        rotation: [0, rand() * 55, 0],
      });
  }

  // A sparse curtain of rain is enough to establish the weather without obscuring the diorama.
  for (let i = 0; i < 24; i++) {
    const x = -0.56 + rand() * 1.12;
    const z = -0.52 + rand() * 1.0;
    const y = 0.48 + rand() * 1.1;
    const length = 0.055 + rand() * 0.075;
    rod(`rain${i}`, [x, y, z], [x - 0.008, y - length, z + 0.012], 0.0024, RAIN);
  }

  // A few bright puddle ripples catch the ad and lamp colours.
  for (const [x, z, w] of [
    [-0.4, 0.31, 0.11],
    [0.07, 0.36, 0.16],
    [0.44, 0.28, 0.1],
  ] as const) {
    box(`ripple${x}`, [w, 0.004, 0.006], [x, 0.116, z], PUDDLE_HIGHLIGHT, { flat: true });
    box(`rippleCross${x}`, [0.006, 0.004, w * 0.42], [x, 0.117, z], PUDDLE_HIGHLIGHT, { flat: true });
  }

  return b.root;
}
