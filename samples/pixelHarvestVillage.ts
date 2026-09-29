import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { pixelTexture, tileBox } from "../kits/pixel";

export const meta = {
  name: "Pixel Harvest Village",
  builtBy: "GPT-6 Astra",
  description: "A 1.5 m harvest-season farming-sim diorama: cream farmhouse, red barn and silo, pumpkin and vegetable rows, articulated livestock and gate, wishing well, lily pond and dock. Every textured surface uses the same one-centimetre square pixel grid.",
};

const PX = 0.01;
const C = {
  ink: "#34272d", wood: "#98633e", woodDark: "#614030", tan: "#d2a567",
  cream: "#f5e0ae", grass: "#779648", grassLight: "#95ad55", grassDark: "#5b783c",
  earth: "#845037", earthLight: "#a16940", path: "#cfaa70", red: "#b9473c", redLight: "#d66747",
  redDark: "#873b37", roof: "#52616b", roofLight: "#738084", roofDark: "#394956",
  water: "#3e929a", waterLight: "#74b9b1", waterDark: "#316b80", green: "#417341",
  leaf: "#6da04b", leafLight: "#a3be61", orange: "#ec943c", orangeDark: "#c76630",
  stone: "#a59a86", stoneDark: "#797c72", pink: "#e5918b", yellow: "#f1c656",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "pixelHarvestVillage" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const gate = b.joint("pastureGate", { parent: root, at: [0.28, 0.20, 0.125], role: "hinge" });
  const vane = b.joint("weathervane", { parent: root, at: [0.21, 0.59, -0.33], role: "hinge" });
  const animals = [
    { name: "cow", x: 0.45, z: -0.025, w: 0.065, h: 0.064, d: 0.11, coat: C.cream },
    { name: "sheep", x: 0.60, z: -0.025, w: 0.064, h: 0.058, d: 0.085, coat: C.cream },
  ].map((a) => {
    const bodyY = 0.194;
    const body = b.joint(`${a.name}Hips`, { parent: root, at: [a.x, bodyY, a.z], role: "spine" });
    const head = b.joint(`${a.name}Head`, { parent: body, at: [a.x, bodyY + 0.024, a.z + a.d / 2], role: "head" });
    const jaw = b.joint(`${a.name}Jaw`, { parent: head, at: [a.x, bodyY + 0.012, a.z + a.d / 2 + 0.028], role: "jaw" });
    const legs = [-1, 1].flatMap((s) => [-1, 1].map((t) => {
      const at: V = [a.x + s * a.w * 0.34, bodyY - 0.021, a.z + t * a.d * 0.32];
      return { at, bone: b.joint(`${a.name}${t > 0 ? "fore" : "hind"}Leg${s > 0 ? "L" : "R"}`, { parent: body, at, role: "leg" }) };
    }));
    const tail = b.joint(`${a.name}Tail`, { parent: body, at: [a.x, bodyY, a.z - a.d / 2], role: "tail" });
    return { ...a, bodyY, body, head, jaw, legs, tail };
  });
  const hen = b.joint("henHips", { parent: root, at: [0.34, 0.167, 0.015], role: "spine" });
  const henHead = b.joint("henHead", { parent: hen, at: [0.34, 0.198, 0.04], role: "head" });
  const henJaw = b.joint("henJaw", { parent: henHead, at: [0.34, 0.19, 0.06], role: "jaw" });
  const henLegs = [-1, 1].map((s) => b.joint(`henLeg${s > 0 ? "L" : "R"}`, { parent: hen, at: [0.34 + s * 0.014, 0.15, 0.015], role: "leg" }));

  const random = rng(824);
  function tex(base: string, light: string, dark: string, mode: "speck" | "wood" | "roof" | "brick" | "water" = "speck", size = 64) {
    return pixelTexture(size, size, (g) => {
      g.fill((x, y) => {
        if (mode === "wood") return x % 5 === 0 ? dark : (x + 3 * y) % 41 === 0 ? light : base;
        if (mode === "roof") return y % 3 === 0 || (x + Math.floor(y / 3) * 3) % 7 === 0 ? dark : y % 3 === 1 ? light : base;
        if (mode === "brick") return y % 4 === 0 || (x + Math.floor(y / 4) * 3) % 7 === 0 ? dark : base;
        if (mode === "water") return y % 9 === 0 && (x + Math.floor(y / 9) * 4) % 13 < 5 ? light : (x + y * 4) % 37 === 0 ? dark : base;
        const r = random();
        return r < 0.07 ? dark : r > 0.93 ? light : base;
      });
    });
  }
  const T = {
    grass: tex(C.grass, C.grassLight, C.grassDark, "speck", 160),
    wood: tex(C.wood, C.tan, C.woodDark, "wood", 160),
    wall: tex(C.cream, C.tan, "#e0c18a", "wood"),
    barn: tex(C.red, C.redLight, C.redDark, "wood"),
    roof: tex(C.roof, C.roofLight, C.roofDark, "roof"),
    soil: tex(C.earth, C.earthLight, C.woodDark),
    path: tex(C.path, C.cream, C.tan, "speck", 160),
    water: tex(C.water, C.waterLight, C.waterDark, "water"),
    stone: tex(C.stone, C.cream, C.stoneDark, "brick"),
    leaf: tex(C.leaf, C.leafLight, C.green),
    pumpkin: tex(C.orange, C.yellow, C.orangeDark, "wood"),
    wool: tex(C.cream, C.cream, "#dbcaaa"),
    hay: tex(C.yellow, C.cream, C.tan, "wood"),
  };
  type Bone = typeof root;
  const batches = new Map<string, { geos: THREE.BufferGeometry[]; color: string; texture?: THREE.Texture; bone: Bone; group: string }>();
  function box(size: V, at: V, color: string, group: string, texture?: THREE.Texture, bone = root, rotation: V = [0, 0, 0]) {
    const geo = texture ? tileBox(size, texture, PX, { rand: random }) : new THREE.BoxGeometry(...size);
    geo.rotateX(rotation[0] * Math.PI / 180); geo.rotateY(rotation[1] * Math.PI / 180); geo.rotateZ(rotation[2] * Math.PI / 180);
    geo.translate(...at);
    const key = `${bone.name}:${group}:${texture?.uuid ?? color}`;
    let batch = batches.get(key);
    if (!batch) { batch = { geos: [], color, texture, bone, group }; batches.set(key, batch); }
    batch.geos.push(geo);
  }
  function roof(x: number, y: number, z: number, width: number, depth: number, steps: number) {
    for (let i = 0; i < steps; i++) box([width - i * 0.04, 0.02, depth], [x, y + i * 0.02, z], C.roof, "roofs", T.roof);
  }
  function window(x: number, y: number, z: number) {
    box([0.08, 0.08, 0.018], [x, y, z], C.woodDark, "windows");
    box([0.06, 0.06, 0.021], [x, y, z + 0.003], C.waterLight, "windows");
    box([0.01, 0.065, 0.025], [x, y, z + 0.005], C.cream, "windows");
    box([0.065, 0.01, 0.025], [x, y, z + 0.005], C.cream, "windows");
    for (const s of [-1, 1]) box([0.02, 0.08, 0.02], [x + s * 0.053, y, z], C.green, "windows");
  }

  // A thin collectible-tabletop plinth with exposed earth and grass lips.
  box([1.50, 0.045, 1.18], [0, 0.0225, 0], C.woodDark, "plinth", T.wood);
  box([1.47, 0.01, 1.15], [0, 0.05, 0], C.tan, "plinth");
  box([1.44, 0.055, 1.12], [0, 0.0825, 0], C.earth, "earth", T.soil);
  box([1.44, 0.015, 1.12], [0, 0.1175, 0], C.grass, "grass", T.grass);
  // Central path gives foreground crops and pond breathing room.
  box([0.13, 0.008, 0.89], [0.025, 0.129, 0.085], C.path, "path", T.path);
  box([1.04, 0.008, 0.11], [-0.035, 0.13, -0.13], C.path, "path", T.path);
  box([0.19, 0.008, 0.14], [-0.425, 0.13, -0.21], C.path, "path", T.path);

  // Tall forms sit at the back, leaving all farm activities visible from +Z.
  box([0.33, 0.235, 0.28], [-0.43, 0.2425, -0.36], C.cream, "farmhouse", T.wall);
  box([0.35, 0.02, 0.30], [-0.43, 0.145, -0.36], C.stone, "farmhouse", T.stone);
  roof(-0.43, 0.37, -0.36, 0.41, 0.35, 10);
  box([0.065, 0.14, 0.025], [-0.43, 0.225, -0.211], C.wood, "farmhouse", T.wood);
  box([0.01, 0.01, 0.01], [-0.409, 0.23, -0.193], C.yellow, "farmhouse");
  for (const x of [-0.54, -0.32]) window(x, 0.28, -0.213);
  box([0.07, 0.19, 0.06], [-0.55, 0.465, -0.43], C.stone, "chimney", T.stone);
  box([0.085, 0.02, 0.075], [-0.55, 0.57, -0.43], C.cream, "chimney");
  box([0.045, 0.008, 0.035], [-0.55, 0.584, -0.43], C.ink, "chimney");
  for (let i = 0; i < 2; i++) box([0.11 + i * 0.025, 0.015, 0.04], [-0.43, 0.147 - i * 0.01, -0.18 + i * 0.035], C.stone, "steps", T.stone);
  for (const x of [-0.54, -0.32]) {
    box([0.085, 0.028, 0.035], [x, 0.222, -0.183], C.wood, "flowerBoxes", T.wood);
    for (let i = -1; i <= 1; i++) box([0.018, 0.02, 0.018], [x + i * 0.026, 0.247, -0.181], i === 0 ? C.yellow : C.pink, "flowerBoxes");
  }
  box([0.36, 0.27, 0.31], [0.205, 0.27, -0.365], C.red, "barn", T.barn);
  roof(0.205, 0.405, -0.365, 0.44, 0.37, 10);
  box([0.19, 0.19, 0.025], [0.205, 0.232, -0.202], C.redDark, "barnDoors", T.barn);
  for (const x of [0.10, 0.205, 0.31]) box([0.012, 0.20, 0.018], [x, 0.233, -0.183], C.cream, "barnTrim");
  box([0.23, 0.015, 0.025], [0.205, 0.338, -0.194], C.cream, "barnTrim");
  for (const s of [-1, 1]) box([0.015, 0.19, 0.02], [0.205 + s * 0.052, 0.231, -0.173], C.cream, "barnTrim", undefined, root, [0, 0, s * 28]);
  for (const x of [0.037, 0.373]) box([0.016, 0.27, 0.025], [x, 0.27, -0.20], C.cream, "barnTrim");
  box([0.055, 0.055, 0.02], [0.205, 0.445, -0.175], C.ink, "barnLoft");
  box([0.065, 0.012, 0.025], [0.205, 0.478, -0.175], C.cream, "barnLoft");
  // Octagonal silo is assembled from square courses, preserving square texels.
  for (let i = 0; i < 12; i++) {
    box([0.15, 0.025, 0.19], [0.515, 0.14 + i * 0.025, -0.365], C.stone, "silo", T.stone);
    box([0.19, 0.025, 0.13], [0.515, 0.14 + i * 0.025, -0.365], C.stone, "silo", T.stone);
  }
  for (let i = 0; i < 5; i++) box([0.22 - i * 0.035, 0.02, 0.22 - i * 0.035], [0.515, 0.45 + i * 0.02, -0.365], C.roof, "siloRoof", T.roof);
  for (const y of [0.18, 0.29, 0.40]) box([0.192, 0.012, 0.194], [0.515, y, -0.365], C.roofDark, "siloBands");
  for (const x of [0.49, 0.54]) box([0.009, 0.25, 0.009], [x, 0.28, -0.258], C.cream, "siloLadder");
  for (let i = 0; i < 7; i++) box([0.055, 0.008, 0.009], [0.515, 0.17 + i * 0.035, -0.258], C.cream, "siloLadder");
  box([0.012, 0.09, 0.012], [0.21, 0.61, -0.33], C.woodDark, "weathervane");
  box([0.13, 0.012, 0.012], [0.21, 0.65, -0.33], C.yellow, "weathervane", undefined, vane);
  box([0.035, 0.035, 0.012], [0.275, 0.65, -0.33], C.yellow, "weathervane", undefined, vane, [0, 0, 45]);
  box([0.03, 0.035, 0.012], [0.20, 0.68, -0.33], C.red, "weathervane", undefined, vane);

  // Three vegetable rows plus a dedicated pumpkin patch.
  box([0.47, 0.014, 0.47], [-0.385, 0.136, 0.28], C.earth, "field", T.soil);
  for (let row = 0; row < 4; row++) {
    const z = 0.11 + row * 0.105;
    box([0.45, 0.008, 0.024], [-0.385, 0.148, z], C.woodDark, "furrows");
    for (let i = 0; i < 6; i++) {
      const x = -0.575 + i * 0.075;
      if (row === 3) {
        box([0.053, 0.045, 0.053], [x, 0.177, z], C.orange, "pumpkins", T.pumpkin);
        box([0.035, 0.061, 0.035], [x, 0.177, z], C.orange, "pumpkins", T.pumpkin);
        box([0.012, 0.017, 0.012], [x, 0.215, z], C.green, "pumpkinStems");
      } else if (row === 0) {
        box([0.036, 0.021, 0.036], [x, 0.168, z], C.green, "cabbages", T.leaf);
        box([0.023, 0.027, 0.026], [x, 0.18, z], C.leafLight, "cabbages");
      } else {
        box([0.012, 0.045 + row * 0.009, 0.012], [x, 0.179, z], C.green, "vegetables");
        for (const s of [-1, 1]) box([0.028, 0.012, 0.025], [x + s * 0.013, 0.193 + row * 0.007, z], C.leaf, "vegetables", T.leaf, root, [0, 0, s * 20]);
        if (row === 2) box([0.018, 0.018, 0.018], [x, 0.18, z + 0.015], C.redLight, "tomatoes");
      }
    }
  }
  // Tiny harvest crate at the path edge.
  box([0.09, 0.06, 0.08], [-0.095, 0.16, 0.35], C.wood, "harvestCrate", T.wood);
  for (const x of [-0.12, -0.09, -0.065]) box([0.025, 0.025, 0.025], [x, 0.202, 0.35], C.orange, "harvestCrate");

  // Scarecrow: overalls, open sleeves, square straw hat and stitched face.
  box([0.018, 0.23, 0.018], [-0.615, 0.23, 0.015], C.woodDark, "scarecrow");
  box([0.066, 0.08, 0.034], [-0.615, 0.29, 0.015], C.roof, "scarecrow", T.roof);
  box([0.19, 0.035, 0.034], [-0.615, 0.318, 0.015], C.red, "scarecrow", T.barn);
  box([0.062, 0.06, 0.05], [-0.615, 0.378, 0.015], C.cream, "scarecrow");
  box([0.10, 0.015, 0.085], [-0.615, 0.413, 0.015], C.yellow, "scarecrow", T.hay);
  box([0.058, 0.035, 0.05], [-0.615, 0.438, 0.015], C.tan, "scarecrow", T.hay);
  for (const s of [-1, 1]) box([0.01, 0.01, 0.01], [-0.615 + s * 0.015, 0.385, 0.044], C.ink, "scarecrowFace");
  box([0.024, 0.008, 0.009], [-0.615, 0.366, 0.044], C.woodDark, "scarecrowFace");

  function fence(a: [number, number], end: [number, number], spans: number) {
    const dx = end[0] - a[0], dz = end[1] - a[1];
    for (let i = 0; i <= spans; i++) {
      const x = a[0] + dx * i / spans, z = a[1] + dz * i / spans;
      box([0.025, 0.12, 0.025], [x, 0.184, z], C.tan, "fences", T.wood);
      box([0.031, 0.01, 0.031], [x, 0.249, z], C.cream, "fences");
    }
    for (const y of [0.168, 0.214]) box([Math.abs(dx) + 0.02 || 0.02, 0.018, Math.abs(dz) + 0.02], [(a[0] + end[0]) / 2, y, (a[1] + end[1]) / 2], C.tan, "fences", T.wood);
  }
  // A closed animal pen with a short movable gate on the front edge.
  fence([0.28, -0.13], [0.69, -0.13], 4);
  fence([0.69, -0.13], [0.69, 0.125], 2);
  fence([0.28, -0.13], [0.28, 0.125], 2);
  fence([0.43, 0.125], [0.69, 0.125], 2);
  for (const y of [0.167, 0.214]) box([0.14, 0.016, 0.022], [0.35, y, 0.125], C.cream, "gate", undefined, gate);
  box([0.015, 0.095, 0.022], [0.411, 0.19, 0.125], C.cream, "gate", undefined, gate);
  box([0.14, 0.012, 0.02], [0.35, 0.19, 0.13], C.tan, "gate", undefined, gate, [0, 0, 24]);
  fence([-0.70, 0.51], [-0.17, 0.51], 4);
  box([0.08, 0.055, 0.065], [0.62, 0.155, -0.085], C.yellow, "hay", T.hay);
  box([0.10, 0.03, 0.06], [0.335, 0.146, -0.08], C.woodDark, "trough");
  box([0.08, 0.007, 0.04], [0.335, 0.165, -0.08], C.water, "trough", T.water);

  for (const a of animals) {
    box([a.w, a.h, a.d], [a.x, a.bodyY, a.z], a.coat, "livestock", T.wool, a.body);
    box([0.045, 0.042, 0.045], [a.x, a.bodyY + 0.027, a.z + a.d / 2 + 0.015], a.name === "cow" ? C.cream : C.woodDark, "livestock", undefined, a.head);
    box([0.042, 0.012, 0.03], [a.x, a.bodyY + 0.005, a.z + a.d / 2 + 0.031], a.name === "cow" ? C.pink : C.stoneDark, "livestock", undefined, a.jaw);
    for (const s of [-1, 1]) {
      box([0.008, 0.01, 0.01], [a.x + s * 0.014, a.bodyY + 0.035, a.z + a.d / 2 + 0.04], C.ink, "livestock", undefined, a.head);
      box([0.022, 0.01, 0.018], [a.x + s * 0.031, a.bodyY + 0.041, a.z + a.d / 2 + 0.006], C.tan, "livestock", undefined, a.head);
    }
    for (const leg of a.legs) {
      box([0.013, 0.039, 0.013], [leg.at[0], 0.151, leg.at[2]], C.woodDark, "livestock", undefined, leg.bone);
      box([0.016, 0.012, 0.02], [leg.at[0], 0.131, leg.at[2] + 0.003], C.ink, "livestock", undefined, leg.bone);
    }
    box([0.012, 0.012, 0.035], [a.x, a.bodyY, a.z - a.d / 2 - 0.013], C.cream, "livestock", undefined, a.tail);
    if (a.name === "cow") {
      for (const s of [-1, 1]) box([0.006, 0.035, 0.04], [a.x + s * 0.034, a.bodyY + 0.003, a.z - 0.012], C.ink, "cowPatches", undefined, a.body);
      box([0.027, 0.007, 0.028], [a.x + 0.014, a.bodyY + 0.034, a.z + 0.028], C.ink, "cowPatches", undefined, a.body);
    }
  }
  box([0.043, 0.038, 0.05], [0.34, 0.174, 0.015], C.cream, "hen", undefined, hen);
  box([0.03, 0.032, 0.03], [0.34, 0.203, 0.044], C.cream, "hen", undefined, henHead);
  box([0.012, 0.016, 0.027], [0.34, 0.226, 0.044], C.red, "hen", undefined, henHead);
  box([0.016, 0.009, 0.018], [0.34, 0.20, 0.067], C.orange, "hen", undefined, henHead);
  box([0.012, 0.006, 0.015], [0.34, 0.19, 0.065], C.orange, "hen", undefined, henJaw);
  for (let i = 0; i < 2; i++) {
    const x = 0.34 + (i ? 1 : -1) * 0.014;
    box([0.008, 0.026, 0.008], [x, 0.14, 0.015], C.orange, "hen", undefined, henLegs[i]);
    box([0.012, 0.007, 0.022], [x, 0.128, 0.022], C.orange, "hen", undefined, henLegs[i]);
    box([0.008, 0.008, 0.009], [x, 0.208, 0.059], C.ink, "hen", undefined, henHead);
  }

  // A pixel-stepped pond with turquoise shallows and square lily pads.
  for (const [width, z] of [[0.30, 0.215], [0.40, 0.265], [0.46, 0.315], [0.46, 0.365], [0.38, 0.415], [0.28, 0.465]]) {
    box([width + 0.035, 0.012, 0.055], [0.43, 0.134, z], C.tan, "pondBank", T.path);
    box([width, 0.013, 0.05], [0.43, 0.142, z], C.water, "pond", T.water);
  }
  for (const [x, z] of [[0.58, 0.33], [0.36, 0.43], [0.50, 0.26]]) {
    box([0.045, 0.008, 0.04], [x, 0.154, z], C.green, "lilies");
    box([0.018, 0.012, 0.018], [x + 0.005, 0.166, z], C.pink, "lilies");
  }
  for (let i = 0; i < 6; i++) box([0.14, 0.018, 0.027], [0.29, 0.184, 0.19 + i * 0.03], C.wood, "dock", T.wood);
  for (const x of [0.235, 0.345]) for (const z of [0.20, 0.335]) {
    box([0.018, 0.082, 0.018], [x, 0.171, z], C.woodDark, "dockPosts", T.wood);
    box([0.027, 0.012, 0.027], [x, 0.218, z], C.tan, "dockPosts");
  }
  for (const [x, z] of [[0.65, 0.40], [0.58, 0.49], [0.20, 0.39]]) {
    for (let i = 0; i < 3; i++) box([0.009, 0.08 + i * 0.01, 0.009], [x + i * 0.012, 0.17 + i * 0.005, z], C.green, "reeds");
    box([0.014, 0.027, 0.014], [x + 0.012, 0.226, z], C.woodDark, "reeds");
  }

  // Open well, complete with dark water, timber axle, rope and bucket.
  const wx = -0.10, wz = -0.12;
  for (const s of [-1, 1]) {
    box([0.025, 0.085, 0.15], [wx + s * 0.067, 0.17, wz], C.stone, "well", T.stone);
    box([0.11, 0.085, 0.025], [wx, 0.17, wz + s * 0.067], C.stone, "well", T.stone);
    box([0.018, 0.22, 0.018], [wx + s * 0.08, 0.263, wz], C.wood, "well", T.wood);
  }
  box([0.10, 0.01, 0.10], [wx, 0.15, wz], C.waterDark, "wellWater");
  roof(wx, 0.38, wz, 0.23, 0.21, 5);
  box([0.20, 0.02, 0.02], [wx, 0.295, wz], C.woodDark, "wellAxle");
  box([0.008, 0.075, 0.008], [wx, 0.256, wz], C.tan, "wellRope");
  box([0.032, 0.029, 0.032], [wx, 0.212, wz], C.wood, "wellBucket", T.wood);
  box([0.012, 0.048, 0.012], [wx + 0.105, 0.278, wz], C.woodDark, "wellCrank");

  // Stepped orchard crowns and a golden harvest tree, kept clear of the buildings.
  for (const [x, z, golden] of [[-0.655, -0.43, 0], [0.65, -0.48, 0], [0.66, 0.49, 1]] as [number, number, number][]) {
    box([0.035, 0.20, 0.035], [x, 0.225, z], C.wood, "treeTrunks", T.wood);
    const foliage = golden ? T.hay : T.leaf;
    box([0.16, 0.10, 0.16], [x, 0.355, z], C.leaf, "treeCrowns", foliage);
    box([0.20, 0.07, 0.12], [x, 0.34, z], C.leaf, "treeCrowns", foliage);
    box([0.12, 0.06, 0.12], [x, 0.431, z], C.leaf, "treeCrowns", foliage);
    if (!golden) for (const s of [-1, 1]) box([0.021, 0.024, 0.019], [x + s * 0.049, 0.35, z + 0.084], C.redLight, "apples");
  }
  for (const [x, z] of [[-0.67, -0.11], [-0.23, -0.19], [0.14, 0.49], [-0.14, 0.07], [0.69, 0.19], [-0.66, 0.38]]) {
    for (let i = 0; i < 3; i++) {
      const fx = x + (i - 1) * 0.025, fz = z + (i % 2) * 0.021;
      box([0.008, 0.035, 0.008], [fx, 0.144, fz], C.green, "flowerStems");
      box([0.025, 0.009, 0.025], [fx, 0.166, fz], i % 2 ? C.pink : C.cream, "flowers");
      box([0.009, 0.012, 0.009], [fx, 0.174, fz], C.yellow, "flowers");
    }
  }
  // Batching is by texture, bone and semantic group; articulated pieces remain independent.
  for (const batch of batches.values()) {
    const geometry = mergeGeometries(batch.geos);
    if (!geometry) throw new Error(`Could not merge ${batch.group}`);
    b.part(geometry, batch.texture ? "#ffffff" : batch.color, { at: [0, 0, 0], bone: batch.bone, texture: batch.texture, group: batch.group, name: `${batch.group}_${batch.bone.name}` });
    for (const geo of batch.geos) geo.dispose();
  }
  return b.root;
}
