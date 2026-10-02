import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { grain, paint } from "../src/paint";
import { svg } from "../src/texture";

const WOOD = grain("#7a3f25", "#b86935", { size: 0.18, axis: "z", seed: 11 });
const LIGHT_WOOD = grain("#b96f3e", "#e3a35c", { size: 0.12, axis: "x", seed: 7 });
const DARK_WOOD = "#512b24";
const CREAM = "#fff0bd";
const CORAL = "#ed6f67";
const TEAL = "#4aa69a";
const GOLD = "#f3bd45";
const LEAF = "#5d9a4d";
const LEAF_DARK = "#39704a";
const APPLE = "#df5848";
const APPLE_LIGHT = "#f48b51";
const ORANGE = "#f39a35";
const LEMON = "#f5cc4f";
const PLUM = "#7e416c";
const BERRY = "#a7415a";
const CLOTH = paint((_p, n) => (n.y > 0.45 ? CREAM : "#e7b862"));

export const meta = {
  name: "Sunny Orchard Fruit Stall",
  description: "A whimsical hand-built market stall with a striped awning, wooden crates, baskets, and a cheerful abundance of fruit.",
  style: "whimsical",
  commit: "e503085",
};

export default function build() {
  const b = createBuilder({ name: "fruitMarketStall", detail: 1.1 });
  type SurfaceColor = Parameters<typeof b.part>[1];
  const root = b.joint("stallRoot", { at: [0, 0, 0] });
  let id = 0;
  const named = (prefix: string) => `${prefix}_${id++}`;

  const box = (prefix: string, size: [number, number, number], at: [number, number, number], color: SurfaceColor) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone: root, at, name: named(prefix) });
  const cyl = (prefix: string, radius: number, height: number, at: [number, number, number], color: SurfaceColor, segments = 8) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, { bone: root, at, name: named(prefix) });
  const sphere = (prefix: string, at: [number, number, number], scale: [number, number, number], color: SurfaceColor, segments = 10) =>
    b.part(new THREE.SphereGeometry(1, segments, Math.max(6, Math.floor(segments * 0.7))), color, { bone: root, at, scale, name: named(prefix) });
  const rod = (prefix: string, a: [number, number, number], z: [number, number, number], radius: number, color: SurfaceColor) =>
    b.rod(a, z, radius, { bone: root, color, name: named(prefix), caps: "flat" });

  // A chunky painted platform and the lower cabinet.
  box("platform", [3.0, 0.12, 1.42], [0, 0.06, 0], DARK_WOOD);
  box("platformTop", [2.88, 0.06, 1.32], [0, 0.15, 0], LIGHT_WOOD);
  box("cabinetBody", [2.66, 0.82, 0.88], [0, 0.57, -0.03], WOOD);
  box("counterTop", [2.82, 0.14, 1.05], [0, 1.03, 0.02], LIGHT_WOOD);
  box("counterFrontTrim", [2.86, 0.09, 0.08], [0, 0.91, 0.53], GOLD);
  box("counterBackTrim", [2.86, 0.08, 0.07], [0, 0.98, -0.48], DARK_WOOD);
  for (let x = -1.17; x <= 1.18; x += 0.21) {
    box("cabinetSlat", [0.16, 0.67, 0.055], [x, 0.54, 0.45], LIGHT_WOOD);
  }
  box("cabinetLeft", [0.1, 0.72, 0.9], [-1.29, 0.56, 0], GOLD);
  box("cabinetRight", [0.1, 0.72, 0.9], [1.29, 0.56, 0], GOLD);
  for (const x of [-1.19, 1.19]) {
    for (const y of [0.28, 0.78]) cyl("cabinetRivet", 0.025, 0.012, [x, y, 0.49], CORAL, 8);
  }

  // Four posts and the roof frame.
  for (const x of [-1.28, 1.28]) {
    for (const z of [-0.44, 0.47]) {
      box("post", [0.14, 2.34, 0.14], [x, 1.35, z], WOOD);
      box("postCap", [0.2, 0.1, 0.2], [x, 2.54, z], GOLD);
      cyl("postFoot", 0.105, 0.055, [x, 0.2, z], DARK_WOOD, 8);
    }
  }
  box("roofBeamFront", [2.82, 0.15, 0.16], [0, 2.45, 0.5], WOOD);
  box("roofBeamBack", [2.82, 0.15, 0.16], [0, 2.45, -0.45], WOOD);
  box("roof", [3.05, 0.13, 1.34], [0, 2.57, 0.02], CLOTH);
  for (let x = -1.36; x <= 1.36; x += 0.34) {
    box("awningStripe", [0.28, 0.025, 1.27], [x, 2.65, 0.02], Math.round((x + 1.36) / 0.34) % 2 === 0 ? CORAL : CREAM);
  }

  // Scalloped striped valance along the customer-facing edge.
  for (let i = 0; i < 9; i++) {
    const x = -1.36 + i * 0.34;
    const col = i % 2 === 0 ? CORAL : CREAM;
    b.extrude(
      [[-0.17, 0.12], [0.17, 0.12], [0.14, -0.08, "sharp"], [0, -0.16, "sharp"], [-0.14, -0.08, "sharp"]],
      { at: [x, 2.46, 0.59], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.035, bevel: 0.008, color: col, bone: root, name: named("awningValance") },
    );
    sphere("awningTassel", [x, 2.29, 0.61], [0.028, 0.05, 0.028], GOLD, 7);
  }
  // Little bunting flags under the awning.
  for (let i = 0; i < 11; i++) {
    const x = -1.1 + i * 0.22;
    b.extrude(
      [[-0.09, 0.04], [0.09, 0.04], [0, -0.16, "sharp"]],
      { at: [x, 2.28, 0.57], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.022, color: i % 3 === 0 ? TEAL : i % 3 === 1 ? GOLD : CORAL, bone: root, name: named("bunting") },
    );
  }
  rod("buntingCord", [-1.24, 2.31, 0.61], [1.24, 2.31, 0.61], 0.012, DARK_WOOD);

  // A signboard with an illustrated fruit medallion and readable lettering.
  box("signBacking", [1.52, 0.45, 0.1], [0, 2.99, -0.2], WOOD);
  box("signFace", [1.38, 0.34, 0.035], [0, 3.0, -0.145], CORAL);
  box("signTrimTop", [1.48, 0.045, 0.05], [0, 3.205, -0.145], GOLD);
  box("signTrimBottom", [1.48, 0.045, 0.05], [0, 2.795, -0.145], GOLD);
  const lettering = svg(`<svg viewBox="0 0 320 80"><rect width="320" height="80" fill="none"/><text x="160" y="52" text-anchor="middle" font-family="sans-serif" font-size="42" font-weight="900" fill="#fff0bd">ORCHARD</text></svg>`, { size: 256 });
  b.part(new THREE.PlaneGeometry(1.16, 0.29), CREAM, { bone: root, at: [0, 2.99, -0.123], dir: [0, 0, 1], axis: "z", texture: lettering, name: named("signLettering") });
  sphere("signApple", [-0.56, 2.99, -0.1], [0.095, 0.095, 0.035], APPLE, 8);
  sphere("signAppleLeaf", [-0.52, 3.075, -0.1], [0.055, 0.018, 0.018], LEAF, 6);

  const addLeaf = (at: [number, number, number], flip = 1) =>
    b.extrude(
      [[0, 0], [0.085 * flip, 0.025], [0.13 * flip, 0.075], [0.03 * flip, 0.06, "sharp"], [-0.025 * flip, 0.015]],
      { at, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, bevel: 0.003, color: LEAF, bone: root, name: named("leaf") },
    );

  const addApple = (at: [number, number, number], color = APPLE) => {
    sphere("apple", at, [0.105, 0.115, 0.105], color, 10);
    cyl("appleStem", 0.012, 0.075, [at[0], at[1] + 0.12, at[2]], DARK_WOOD, 6);
    addLeaf([at[0] + 0.035, at[1] + 0.148, at[2]], at[0] > 0 ? -1 : 1);
  };
  const addOrange = (at: [number, number, number]) => {
    sphere("orange", at, [0.105, 0.105, 0.105], ORANGE, 10);
    sphere("orangeDimple", [at[0], at[1] + 0.102, at[2]], [0.018, 0.008, 0.018], GOLD, 6);
  };
  const addPear = (at: [number, number, number], color = LEMON) => {
    b.lathe([[0, 0], [0.052, 0], [0.082, 0.045], [0.078, 0.095], [0.053, 0.17], [0.018, 0.205], [0, 0.205]], { at, segments: 9, smoothing: 1, color, bone: root, name: named("pear") });
    cyl("pearStem", 0.012, 0.055, [at[0], at[1] + 0.228, at[2]], DARK_WOOD, 6);
    addLeaf([at[0] - 0.02, at[1] + 0.25, at[2]], -1);
  };
  const addPlum = (at: [number, number, number]) => {
    sphere("plum", at, [0.095, 0.09, 0.095], PLUM, 10);
    rod("plumSeam", [at[0], at[1] - 0.07, at[2] + 0.06], [at[0], at[1] + 0.07, at[2] + 0.06], 0.006, BERRY);
    cyl("plumStem", 0.01, 0.05, [at[0], at[1] + 0.097, at[2]], DARK_WOOD, 6);
  };
  const addGrapes = (at: [number, number, number], color = BERRY) => {
    const dots: [number, number, number][] = [
      [-0.055, 0, 0], [0.055, 0, 0], [-0.075, 0.06, 0], [0, 0.065, 0], [0.075, 0.06, 0], [-0.045, 0.12, 0], [0.045, 0.12, 0], [0, 0.18, 0],
    ];
    for (const d of dots) sphere("grape", [at[0] + d[0], at[1] + d[1], at[2] + d[2]], [0.045, 0.045, 0.045], color, 8);
    cyl("grapeStem", 0.012, 0.12, [at[0], at[1] + 0.23, at[2]], LEAF_DARK, 6);
    addLeaf([at[0] + 0.04, at[1] + 0.25, at[2]], 1);
  };

  const crate = (x: number, y: number, z: number, label: string, fruits: () => void) => {
    box(`${label}Bottom`, [0.7, 0.08, 0.54], [x, y, z], LIGHT_WOOD);
    box(`${label}DarkInside`, [0.56, 0.22, 0.4], [x, y + 0.13, z], DARK_WOOD);
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) box(`${label}Corner`, [0.08, 0.38, 0.08], [x + sx * 0.31, y + 0.2, z + sz * 0.23], WOOD);
    }
    for (const sz of [-1, 1]) box(`${label}Rim`, [0.7, 0.075, 0.08], [x, y + 0.4, z + sz * 0.23], LIGHT_WOOD);
    for (const sx of [-1, 1]) box(`${label}SideRim`, [0.08, 0.075, 0.4], [x + sx * 0.31, y + 0.4, z], LIGHT_WOOD);
    box(`${label}FrontSlat`, [0.51, 0.08, 0.035], [x, y + 0.22, z + 0.277], GOLD);
    sphere(`${label}Medallion`, [x, y + 0.22, z + 0.33], [0.075, 0.075, 0.022], GOLD, 8);
    addLeaf([x + 0.03, y + 0.31, z + 0.33], 1);
    fruits();
  };

  // Three countertop crates with distinct, overflowing displays.
  crate(-0.82, 1.1, 0.34, "redCrate", () => {
    addApple([-1.02, 1.53, 0.27], APPLE);
    addApple([-0.77, 1.54, 0.36], APPLE_LIGHT);
    addOrange([-0.6, 1.52, 0.28]);
    addApple([-0.88, 1.68, 0.34], APPLE);
    addLeaf([-0.72, 1.73, 0.36], 1);
  });
  crate(0.0, 1.1, 0.35, "yellowCrate", () => {
    addPear([-0.2, 1.52, 0.29]);
    addPear([0.02, 1.53, 0.37], LEMON);
    addOrange([0.2, 1.52, 0.3]);
    addPear([-0.05, 1.7, 0.35], LEMON);
  });
  crate(0.82, 1.1, 0.34, "purpleCrate", () => {
    addPlum([0.62, 1.53, 0.29]);
    addPlum([0.84, 1.52, 0.37]);
    addGrapes([1.03, 1.49, 0.31]);
    addPlum([0.76, 1.68, 0.34]);
  });

  // Two large ground crates give the stall a story and fill the lower silhouette.
  crate(-1.0, 0.24, 0.38, "groundCrateL", () => {
    addOrange([-1.12, 0.67, 0.29]);
    addOrange([-0.9, 0.67, 0.39]);
    addApple([-1.0, 0.82, 0.33], APPLE_LIGHT);
  });
  crate(1.0, 0.24, 0.4, "groundCrateR", () => {
    addPear([0.87, 0.66, 0.32]);
    addPear([1.08, 0.67, 0.42], LEMON);
    addGrapes([1.12, 0.65, 0.27], PLUM);
  });

  // Woven-looking baskets on the counter, each with a ring and crossing braces.
  const basket = (x: number, z: number, fruit: () => void, tint: SurfaceColor) => {
    cyl("basketBowl", 0.26, 0.22, [x, 1.22, z], tint, 12);
    b.part(new THREE.TorusGeometry(0.27, 0.025, 6, 14), tint, { bone: root, at: [x, 1.34, z], rotation: [90, 0, 0], name: named("basketRim") });
    rod("basketWeave", [x - 0.2, 1.15, z - 0.1], [x + 0.2, 1.29, z + 0.1], 0.012, GOLD);
    rod("basketWeave", [x + 0.2, 1.15, z - 0.1], [x - 0.2, 1.29, z + 0.1], 0.012, GOLD);
    fruit();
  };
  basket(-1.05, -0.25, () => { addApple([-1.12, 1.45, -0.25]); addOrange([-0.95, 1.45, -0.23]); addApple([-1.04, 1.58, -0.25], APPLE_LIGHT); }, "#c98245");
  basket(1.06, -0.24, () => { addPear([0.98, 1.44, -0.24]); addOrange([1.14, 1.45, -0.22]); addPear([1.05, 1.62, -0.23], LEMON); }, "#b87443");

  // A hanging produce board on the side, with pegs and a little painted fruit.
  box("sideBoard", [0.08, 0.68, 0.62], [1.4, 1.38, -0.02], LIGHT_WOOD);
  for (const y of [1.18, 1.4, 1.62]) {
    cyl("sidePeg", 0.025, 0.18, [1.34, y, 0.34], DARK_WOOD, 7);
    sphere("sidePegCap", [1.34, y, 0.43], [0.04, 0.04, 0.04], GOLD, 7);
  }
  sphere("sideBoardFruit", [1.345, 1.83, -0.01], [0.12, 0.12, 0.035], APPLE, 9);
  addLeaf([1.39, 1.94, -0.01], -1);
  rod("sideBoardHandle", [1.34, 1.05, 0.38], [1.34, 1.05, 0.55], 0.018, CORAL);

  // Loose bananas and a melon tucked between the crates add asymmetry.
  const banana = (x: number, y: number, z: number, flip: number) => {
    const curve: [number, number, number][] = [[x, y, z], [x + flip * 0.09, y + 0.08, z], [x + flip * 0.18, y + 0.1, z + 0.01], [x + flip * 0.25, y + 0.02, z + 0.01]];
    b.sweep(curve, [0.045, 0.02], { bone: root, color: LEMON, caps: "round", name: named("banana") });
    cyl("bananaTip", 0.012, 0.035, [x + flip * 0.26, y + 0.015, z + 0.01], DARK_WOOD, 6);
  };
  banana(-0.45, 1.42, 0.68, 1);
  banana(0.35, 1.43, 0.68, -1);
  sphere("melon", [0.37, 0.7, 0.68], [0.2, 0.16, 0.2], "#7aaf62", 10);
  for (let a = 0; a < 4; a++) {
    const x = 0.37 + (a - 1.5) * 0.07;
    rod("melonRidge", [x, 0.56, 0.68], [x, 0.84, 0.68], 0.008, LEAF_DARK);
  }

  // Corner flourishes: carved spirals and tiny brass knobs.
  for (const s of [-1, 1]) {
    rod("cornerBrace", [s * 1.2, 0.98, 0.49], [s * 1.2, 1.76, 0.49], 0.025, GOLD);
    for (const y of [1.15, 1.42, 1.69]) sphere("cornerKnob", [s * 1.2, y, 0.51], [0.035, 0.035, 0.035], CORAL, 7);
    b.sweep([[s * 1.18, 0.99, 0.54], [s * 1.08, 1.1, 0.58], [s * 1.17, 1.21, 0.54]], [0.018, 0.008], { bone: root, color: GOLD, caps: "round", name: named("scrollwork") });
  }

  return b.root;
}
