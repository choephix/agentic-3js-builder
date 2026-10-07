import * as THREE from "three";
import type { Texture } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { Fill, JointRef } from "../src/context";
import { grain, noise, paint, scales, stripes } from "../src/paint";
import { catmull } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Fruit market stall",
  description:
    "A whimsical fruit stall on cobbles: turned posts under a striped awning with a scalloped valance, a counter piled with apples, oranges, melons, bananas, grapes and a potted plant, wicker baskets, price tags and a cash tin, a lidded crate and stacked crates, a back shelf of jam jars and pumpkins, brass lanterns, a sleeping ginger cat, and a chalkboard sign that swings from a hinge.",
  style: "whimsical",
  commit: "b816db2",
};

type V = [number, number, number];
type Opts = { g?: string; bone?: JointRef; name?: string; rot?: V; scale?: V; seg?: number };

const C = {
  wood: "#c98b52",
  woodDeep: "#8a5230",
  woodPale: "#ecc796",
  cream: "#fff1d6",
  red: "#e8453c",
  leaf: "#58b35a",
  leafDark: "#2f7d45",
  brass: "#e8b84a",
  iron: "#4a4650",
  ink: "#3b2a22",
  stem: "#6e4a2c",
  apple: "#e23c3a",
  appleHi: "#ff7a68",
  appleGreen: "#a9d34f",
  orange: "#ff9b2f",
  orangeDark: "#f0781a",
  lemon: "#ffe04d",
  banana: "#ffd43a",
  pear: "#c9dc4f",
  grape: "#7a4bd6",
  melonLight: "#8fd06b",
  melonDark: "#2f8a3f",
  flesh: "#ff5a6e",
  seed: "#2a1e1a",
  pumpkin: "#ff8a1f",
  pumpkinDark: "#e06a10",
  cabbage: "#9ad49a",
  cabbageDark: "#5fae6a",
  jam: "#b0234b",
  jarLid: "#fff1d6",
  wicker: "#dca85f",
  wickerDark: "#b07a3a",
  plate: "#fbf6ea",
  terra: "#d4733f",
  burlap: "#d9b77e",
  rope: "#8a6a3a",
  mortar: "#9d8a6a",
  chalk: "#2f6b4f",
  carrot: "#ff7b1c",
  carrotTop: "#4caf50",
  flower: "#ff6fa8",
  flowerPale: "#ffd0e4",
  catGinger: "#f0a04b",
  catStripe: "#c9732a",
  catCream: "#ffe9c7",
  catNose: "#ff8fa3",
  tin: "#c9a24a",
  lantern: "#ffd27a",
};

// Paints: keyed to model space (p) or to each geometry's own coordinates (s: uv, lathe [height, deg], extrude [x, y]).
const cobbles = scales(["#d9c8a4", "#cdb98f", "#e2d3b2"], C.mortar, { size: 0.24, width: 0.05 });
const woodGrain = grain(C.wood, C.woodDeep, { size: 0.05, axis: "y" });
const burlap = grain(C.burlap, "#b8955a", { size: 0.02, axis: "y" });
const wicker = paint((_p, _n, s) => ((Math.floor(s[0] / 0.03) + Math.floor(s[1] / 15)) % 2 === 0 ? C.wicker : C.wickerDark));
const barrelStaves = paint((_p, _n, s) => (Math.floor(s[1] / 20) % 2 === 0 ? C.wood : C.woodDeep));
const awningStripe = paint((p) => (Math.floor((p.x + 1.46) / 0.292) % 2 === 0 ? C.red : C.cream));
const clothStripe = paint((p) => (Math.floor((p.x + 1.14) / 0.228) % 2 === 0 ? C.red : C.cream));
const orangeSkin = paint((p) => (noise(p, 0.02, 3) > 0.62 ? C.orangeDark : C.orange));
const appleRed = paint((_p, n) => (n.y > 0.4 ? C.appleHi : C.apple));
const appleGreen = paint((_p, n) => (n.y > 0.4 ? "#d4ec7a" : C.appleGreen));
const melonWhole = paint((_p, _n, s) => (Math.floor(s[0] * 8) % 2 === 0 ? C.melonLight : C.melonDark));
const melonRind = paint((_p, _n, s) => (Math.floor(s[1] / 22.5) % 2 === 0 ? C.melonLight : C.melonDark));
const pumpkinRibs = paint((_p, _n, s) => (Math.floor(s[0] * 10) % 2 === 0 ? C.pumpkin : C.pumpkinDark));
const cabbageVeins = paint((_p, _n, s) => (Math.floor(s[0] * 18) % 3 === 0 ? C.cabbageDark : C.cabbage));
const catCoat = stripes(C.catGinger, C.catStripe, { size: 0.06, axis: "y", width: 0.35 });

/** Wood planks: seams across `axis` every `size` metres. */
const planks = (base: string, seam: string, axis: "x" | "y" | "z", size: number) =>
  paint((p) => {
    const v = axis === "x" ? p.x : axis === "y" ? p.y : p.z;
    const f = v / size - Math.floor(v / size);
    return f < 0.07 ? seam : base;
  });

/** Scalloped hem from x1 back to x0 along a line at `yEdge`; each scallop dips `depth` below it. */
const hem = (x0: number, x1: number, yEdge: number, depth: number, n: number): number[][] => {
  const pts: number[][] = [];
  const w = (x1 - x0) / n;
  for (let i = n - 1; i >= 0; i--) {
    const xc = x0 + (i + 0.5) * w;
    for (let k = 0; k < 6; k++) {
      const u = 1 - (2 * k) / 6;
      pts.push([xc + (u * w) / 2, yEdge - depth * Math.sqrt(1 - u * u)]);
    }
  }
  pts.push([x0, yEdge]);
  return pts;
};

/** Half a melon, cut face up: a dome from the flat top down to the bottom pole. */
const dome = (R: number, n: number): number[][] => {
  const pts: number[][] = [[0, 0]];
  for (let k = 1; k <= n; k++) {
    const a = (Math.PI / 2) * (k / n);
    pts.push([R * Math.sin(a), R * (1 - Math.cos(a))]);
  }
  pts.push([0, R]);
  return pts;
};

const tagSvg = (name: string, price: string) => `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
<rect x="6" y="6" width="188" height="108" rx="16" fill="${C.cream}" stroke="${C.red}" stroke-width="9"/>
<text x="100" y="60" text-anchor="middle" font-family="Georgia, serif" font-size="30" font-weight="700" fill="${C.ink}">${name}</text>
<text x="100" y="95" text-anchor="middle" font-family="Georgia, serif" font-size="24" fill="${C.red}">${price}</text>
</svg>`;

const signSvg = `<svg viewBox="0 0 580 420" xmlns="http://www.w3.org/2000/svg">
<rect x="8" y="8" width="564" height="404" rx="36" fill="${C.chalk}" stroke="${C.brass}" stroke-width="16"/>
<text x="290" y="132" text-anchor="middle" font-family="Georgia, serif" font-size="66" font-weight="700" fill="${C.cream}">FRESH FRUIT</text>
<path d="M90 176 H490" stroke="${C.brass}" stroke-width="6" stroke-dasharray="18 12"/>
<circle cx="152" cy="296" r="46" fill="${C.apple}"/>
<path d="M152 250 q8 -32 40 -36 q-6 30 -40 36z" fill="${C.leaf}"/>
<circle cx="290" cy="296" r="46" fill="${C.orange}"/>
<ellipse cx="428" cy="296" rx="58" ry="40" fill="${C.lemon}"/>
<text x="290" y="384" text-anchor="middle" font-family="Georgia, serif" font-size="30" fill="${C.cream}">apples · oranges · lemons</text>
</svg>`;

const priceSvg = `<svg viewBox="0 0 500 100" xmlns="http://www.w3.org/2000/svg">
<rect x="6" y="6" width="488" height="88" rx="14" fill="${C.cream}" stroke="${C.wood}" stroke-width="10"/>
<text x="250" y="44" text-anchor="middle" font-family="Georgia, serif" font-size="32" font-weight="700" fill="${C.ink}">TODAY'S PRICES</text>
<text x="250" y="78" text-anchor="middle" font-family="Georgia, serif" font-size="24" fill="${C.red}">apples 3 · oranges 5 · melon 4</text>
</svg>`;

export default function build() {
  const b = createBuilder({ name: "fruitMarketStall" });
  const root = b.joint("stall", { at: [0, 0, 0] });
  const TOP = 0.98; // counter top surface

  // ---- helpers: static parts ride the root bone unless a joint is given ----
  const put = (geo: THREE.BufferGeometry, color: Fill, at: V, o: Opts = {}) =>
    b.part(geo, color, { at, bone: o.bone ?? root, group: o.g, name: o.name, rotation: o.rot, scale: o.scale });
  const box = (c: V, s: V, color: Fill, o: Opts = {}) => put(new THREE.BoxGeometry(s[0], s[1], s[2]), color, c, o);
  const ball = (c: V, r: number, color: Fill, o: Opts = {}) =>
    put(new THREE.SphereGeometry(r, b.segments(10), b.segments(7)), color, c, o);
  const cyl = (c: V, rt: number, rb: number, h: number, color: Fill, o: Opts = {}) =>
    put(new THREE.CylinderGeometry(rt, rb, h, b.segments(10)), color, c, o);
  const hoop = (c: V, R: number, tubeR: number, color: Fill, o: Opts = {}) =>
    put(new THREE.TorusGeometry(R, tubeR, 4, b.segments(12)), color, c, { rot: [90, 0, 0], ...o });
  const turn = (outline: Parameters<typeof b.lathe>[0], at: V, color: Fill, o: Opts = {}) =>
    b.lathe(outline, { at, color, bone: o.bone ?? root, group: o.g, name: o.name, segments: o.seg });
  const flat = (
    outline: Parameters<typeof b.extrude>[0],
    at: V,
    x: V,
    y: V,
    thick: number,
    color: Fill,
    o: Opts = {},
  ) => b.extrude(outline, { at, x, y, thickness: thick, color, bone: o.bone ?? root, group: o.g, name: o.name });
  const rod = (a: V, c: V, r: number, color: Fill, o: Opts = {}) =>
    b.rod(a, c, r, { color, bone: o.bone ?? root, group: o.g, name: o.name });
  const card = (c: V, w: number, h: number, tex: Texture, o: Opts = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
      at: c,
      dir: [0, 0, 1],
      axis: "z",
      texture: tex,
      bone: o.bone ?? root,
      group: o.g,
      name: o.name,
    });

  // ---- drawings and labels ----
  const tagApples = svg(tagSvg("APPLES", "2 for 3"), { size: 256 });
  const tagOranges = svg(tagSvg("ORANGES", "3 for 5"), { size: 256 });
  const tagJam = svg(tagSvg("JAM", "2.50"), { size: 256 });
  const tagLemons = svg(tagSvg("LEMONS", "fresh"), { size: 256 });
  const tagPears = svg(tagSvg("PEARS", "sweet"), { size: 256 });
  const signTex = svg(signSvg, { size: 512 });
  const priceTex = svg(priceSvg, { size: 512 });

  // ---- fruit and produce ----
  const apple = (c: V, green = false) => {
    ball(c, 0.058, green ? appleGreen : appleRed, { g: "fruit" });
    rod([c[0], c[1] + 0.05, c[2]], [c[0] + 0.004, c[1] + 0.085, c[2]], 0.005, C.stem, { g: "fruit" });
  };
  const leaf = (c: V, yaw: number) =>
    flat(
      [
        [0, 0, "sharp"],
        [0.035, 0.022],
        [0.075, 0, "sharp"],
        [0.035, -0.022],
      ],
      c,
      [Math.cos(yaw), 0, Math.sin(yaw)],
      [0, 1, 0],
      0.004,
      C.leaf,
      { g: "fruit" },
    );
  const lemon = (c: V, yaw = 0) =>
    put(new THREE.SphereGeometry(0.04, 9, 6), C.lemon, c, { g: "fruit", scale: [1.25, 0.9, 0.9], rot: [0, yaw, 0] });
  const pear = (c: V) => {
    turn(
      [
        [0, 0],
        [0.045, 0.005],
        [0.058, 0.04],
        [0.052, 0.08],
        [0.04, 0.11],
        [0.026, 0.14],
        [0.012, 0.16],
        [0, 0.165],
      ],
      c,
      C.pear,
      { g: "fruit", seg: 8 },
    );
    rod([c[0], c[1] + 0.165, c[2]], [c[0] + 0.006, c[1] + 0.19, c[2]], 0.006, C.stem, { g: "fruit" });
  };
  const orange = (c: V) => ball(c, 0.047, orangeSkin, { g: "fruit" });
  const melon = (c: V, r: number) => ball([c[0], c[1] + r, c[2]], r, melonWhole, { g: "fruit" });
  const pumpkin = (x: number, y: number, z: number, r: number) => {
    ball([x, y + r * 0.82, z], r, pumpkinRibs, { g: "fruit", scale: [1.12, 0.82, 1.12] });
    cyl([x, y + r * 1.64 + 0.02, z], 0.016, 0.022, 0.05, C.stem, { g: "fruit" });
  };
  const banana = (pts: V[], r: number) =>
    b.sweep(catmull(pts), (t) => r * (0.6 + 0.4 * Math.sin(Math.PI * t)), {
      color: C.banana,
      bone: root,
      group: "fruit",
    });
  const carrot = (x: number, y: number, z: number) => {
    put(new THREE.ConeGeometry(0.03, 0.2, 7), C.carrot, [x, y, z], { g: "fruit", rot: [0, 0, 90] });
    ball([x + 0.12, y, z], 0.025, C.carrotTop, { g: "fruit" });
  };

  // ---- crates: open-top boxes; returns the floor height inside ----
  const crate = (cx: number, y0: number, cz: number, w: number, d: number, h: number, bone?: JointRef) => {
    const t = 0.025;
    const o: Opts = { g: "crates", bone };
    box([cx, y0 + t / 2, cz], [w, t, d], planks(C.wood, C.woodDeep, "x", 0.2), o);
    const side = planks(C.woodPale, C.wood, "y", 0.14);
    box([cx, y0 + h / 2, cz - d / 2 + t / 2], [w, h, t], side, o);
    box([cx, y0 + h / 2, cz + d / 2 - t / 2], [w, h, t], side, o);
    box([cx - w / 2 + t / 2, y0 + h / 2, cz], [t, h, d - 2 * t], side, o);
    box([cx + w / 2 - t / 2, y0 + h / 2, cz], [t, h, d - 2 * t], side, o);
    return y0 + t;
  };

  // ---- jars and sacks ----
  const jar = (x: number, y: number, z: number) => {
    turn(
      [
        [0, 0],
        [0.05, 0],
        [0.062, 0.03],
        [0.064, 0.09],
        [0.055, 0.12],
        [0.05, 0.13],
        [0, 0.13],
      ],
      [x, y, z],
      C.jam,
      { g: "jars", seg: 8 },
    );
    cyl([x, y + 0.14, z], 0.05, 0.05, 0.022, C.jarLid, { g: "jars" });
    card([x, y + 0.07, z + 0.064], 0.08, 0.06, tagJam, { g: "jars" });
  };
  const sack = (x: number, z: number) => {
    turn(
      [
        [0, 0],
        [0.13, 0],
        [0.16, 0.1],
        [0.15, 0.22],
        [0.1, 0.3],
        [0.07, 0.34],
        [0, 0.34],
      ],
      [x, 0, z],
      burlap,
      { g: "sacks", seg: 10 },
    );
    hoop([x, 0.3, z], 0.075, 0.012, C.rope, { g: "sacks" });
  };

  // ---- ground: cobbled base ----
  box([0, 0.02, 0.1], [3.3, 0.04, 2.6], cobbles, { g: "platform" });

  // ---- posts: turned, bulbous, four corners ----
  for (const [x, z, top] of [
    [-1.22, -0.93, 2.58],
    [1.22, -0.93, 2.58],
    [-1.22, 1.18, 2.18],
    [1.22, 1.18, 2.18],
  ] as const) {
    const h = top - 0.04;
    turn(
      [
        [0, 0],
        [0.095, 0],
        [0.095, 0.05],
        [0.06, 0.1],
        [0.045, 0.16],
        [0.075, 0.32],
        [0.05, 0.42],
        [0.045, h - 0.24],
        [0.075, h - 0.16],
        [0.075, h - 0.12],
        [0.05, h - 0.09],
        [0.065, h - 0.05],
        [0.065, h - 0.02],
        [0.07, h],
        [0, h],
      ],
      [x, 0.04, z],
      woodGrain,
      { g: "posts" },
    );
  }

  // ---- back board, shelves and brackets ----
  box([0, 1.165, -0.945], [2.42, 2.25, 0.03], planks(C.woodPale, C.wood, "y", 0.2), { g: "back" });
  for (const y of [1.12, 1.58]) {
    box([0, y, -0.78], [2.3, 0.04, 0.32], planks(C.woodPale, C.wood, "z", 0.3), { g: "shelves" });
    for (const x of [-1.08, 1.08]) box([x, y - 0.09, -0.78], [0.03, 0.14, 0.2], C.woodDeep, { g: "shelves" });
  }
  // shelf 1: cabbages in one crate, melons in another, pumpkins at either end
  const f1 = crate(-0.62, 1.14, -0.78, 0.44, 0.24, 0.16);
  ball([-0.72, f1 + 0.085, -0.78], 0.085, cabbageVeins, { g: "fruit" });
  ball([-0.52, f1 + 0.085, -0.78], 0.085, cabbageVeins, { g: "fruit" });
  const f1b = crate(0.35, 1.14, -0.78, 0.44, 0.24, 0.16);
  melon([0.27, f1b, -0.78], 0.105);
  melon([0.43, f1b, -0.78], 0.105);
  pumpkin(0.86, 1.14, -0.8, 0.1);
  pumpkin(-1.0, 1.14, -0.8, 0.095);
  // shelf 2: jam jars
  for (const x of [-0.9, -0.45, 0, 0.45, 0.9]) jar(x, 1.6, -0.76);

  // ---- floor behind the counter: carrot crate and a sack ----
  const fc = crate(0.42, 0, -0.78, 0.44, 0.24, 0.16);
  for (const z of [-0.84, -0.78, -0.72]) carrot(0.42, fc + 0.03, z);
  sack(-0.35, -0.78);

  // ---- counter ----
  box([0, 0.5, 0.08], [2.26, 0.84, 1.4], planks(C.woodPale, C.wood, "x", 0.14), { g: "counter" });
  box([0, 0.95, 0.1], [2.36, 0.06, 1.48], planks(C.woodPale, C.wood, "z", 0.2), { g: "counter" });
  // scalloped striped cloth hanging over the front, with a price card pinned to it
  flat(
    [
      [-1.14, TOP],
      [1.14, TOP],
      ...hem(-1.14, 1.14, 0.5, 0.07, 10),
    ],
    [0, 0, 0.785],
    [1, 0, 0],
    [0, 1, 0],
    0.012,
    clothStripe,
    { g: "counter" },
  );
  card([0.25, 0.77, 0.797], 0.5, 0.1, priceTex, { g: "counter" });
  // cash tin with a brass band
  const tin: V = [-0.32, TOP, 0.62];
  box([tin[0], TOP + 0.06, tin[2]], [0.22, 0.12, 0.16], C.woodDeep, { g: "counter" });
  box([tin[0], TOP + 0.125, tin[2]], [0.23, 0.02, 0.17], C.tin, { g: "counter" });
  box([tin[0], TOP + 0.07, tin[2] + 0.082], [0.1, 0.03, 0.01], C.tin, { g: "counter" });

  // apples in a wicker basket, with a stake and price tag
  const bA: V = [-0.72, TOP, 0.22];
  turn(
    [
      [0, 0],
      [0.15, 0],
      [0.2, 0.06],
      [0.22, 0.12],
      [0.23, 0.16],
      [0.21, 0.165],
      [0.2, 0.12],
      [0.18, 0.07],
      [0.12, 0.045],
      [0, 0.045],
    ],
    bA,
    wicker,
    { g: "fruit" },
  );
  b.sweep(
    catmull([
      [bA[0] - 0.22, TOP + 0.14, bA[2]],
      [bA[0] - 0.16, TOP + 0.27, bA[2]],
      [bA[0], TOP + 0.31, bA[2]],
      [bA[0] + 0.16, TOP + 0.27, bA[2]],
      [bA[0] + 0.22, TOP + 0.14, bA[2]],
    ]),
    0.012,
    { color: C.woodDeep, bone: root, group: "fruit" },
  );
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    apple([bA[0] + 0.12 * Math.cos(a), TOP + 0.105, bA[2] + 0.12 * Math.sin(a)], i % 3 === 1);
  }
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + 0.4;
    apple([bA[0] + 0.05 * Math.cos(a), TOP + 0.16, bA[2] + 0.05 * Math.sin(a)], i === 2);
  }
  apple([bA[0], TOP + 0.21, bA[2]]);
  leaf([bA[0] - 0.02, TOP + 0.24, bA[2] + 0.02], 0.5);
  leaf([bA[0] + 0.1, TOP + 0.16, bA[2] - 0.06], 2.2);
  rod([-0.46, TOP, 0.22], [-0.46, TOP + 0.24, 0.22], 0.008, C.woodDeep, { g: "tags" });
  card([-0.46, TOP + 0.25, 0.22], 0.17, 0.1, tagApples, { g: "tags" });

  // oranges on a tray in a pyramid, with a stake and price tag
  const tr: V = [0.12, TOP, 0.22];
  box([tr[0], TOP + 0.01, tr[2]], [0.62, 0.02, 0.46], planks(C.woodPale, C.wood, "z", 0.2), { g: "fruit" });
  box([tr[0], TOP + 0.04, tr[2] - 0.23], [0.62, 0.04, 0.02], C.woodDeep, { g: "fruit" });
  box([tr[0], TOP + 0.04, tr[2] + 0.23], [0.62, 0.04, 0.02], C.woodDeep, { g: "fruit" });
  box([tr[0] - 0.31, TOP + 0.04, tr[2]], [0.02, 0.04, 0.46], C.woodDeep, { g: "fruit" });
  box([tr[0] + 0.31, TOP + 0.04, tr[2]], [0.02, 0.04, 0.46], C.woodDeep, { g: "fruit" });
  const y1 = TOP + 0.067;
  for (const i of [-1, 0, 1]) for (const j of [-1, 0, 1]) orange([tr[0] + 0.1 * i, y1, tr[2] + 0.1 * j]);
  for (const i of [-1, 1]) for (const j of [-1, 1]) orange([tr[0] + 0.05 * i, y1 + 0.062, tr[2] + 0.05 * j]);
  orange([tr[0], y1 + 0.124, tr[2]]);
  orange([tr[0] + 0.05, y1 + 0.186, tr[2] + 0.05]);
  leaf([tr[0] + 0.05, y1 + 0.24, tr[2] + 0.06], 0.9);
  rod([0.44, TOP, 0.44], [0.44, TOP + 0.2, 0.44], 0.008, C.woodDeep, { g: "tags" });
  card([0.44, TOP + 0.21, 0.44], 0.17, 0.1, tagOranges, { g: "tags" });

  // whole watermelon, and a half melon cut face up with seeds
  melon([0.5, TOP, -0.22], 0.2);
  const hm: V = [0.9, TOP, 0.5];
  turn(dome(0.19, 8), hm, melonRind, { g: "fruit" });
  cyl([hm[0], TOP + 0.19 + 0.003, hm[2]], 0.171, 0.171, 0.006, C.flesh, { g: "fruit" });
  const seeds: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 13; k++) {
    const a = k * 0.8;
    const r = k < 9 ? 0.11 : 0.05;
    seeds.push(
      new THREE.SphereGeometry(0.008, 4, 3).translate(hm[0] + r * Math.cos(a), TOP + 0.196, hm[2] + r * Math.sin(a)),
    );
  }
  const seedGeo = mergeGeometries(seeds);
  if (!seedGeo) throw new Error("melon seeds did not merge");
  put(seedGeo, C.seed, [0, 0, 0], { g: "fruit", name: "melonSeeds" });

  // grapes on a plate
  const P: V = [-0.22, TOP, -0.28];
  turn(
    [
      [0, 0],
      [0.17, 0],
      [0.2, 0.012],
      [0.2, 0.02],
      [0.16, 0.024],
      [0, 0.024],
    ],
    P,
    C.plate,
    { g: "fruit", seg: 10 },
  );
  const grapes: THREE.BufferGeometry[] = [];
  const levels = [
    { y: 0.03, n: 7, R: 0.1 },
    { y: 0.075, n: 5, R: 0.072 },
    { y: 0.115, n: 4, R: 0.05 },
    { y: 0.15, n: 3, R: 0.03 },
    { y: 0.18, n: 1, R: 0 },
  ];
  levels.forEach((lv, li) => {
    for (let k = 0; k < lv.n; k++) {
      const a = (k * 2 * Math.PI) / lv.n + li * 0.3;
      grapes.push(
        new THREE.SphereGeometry(0.03, 6, 4).translate(
          P[0] + lv.R * Math.cos(a),
          P[1] + 0.024 + lv.y,
          P[2] + lv.R * Math.sin(a),
        ),
      );
    }
  });
  const grapeGeo = mergeGeometries(grapes);
  if (!grapeGeo) throw new Error("grapes did not merge");
  put(grapeGeo, C.grape, [0, 0, 0], { g: "fruit", name: "grapes" });
  rod([P[0], P[1] + 0.2, P[2]], [P[0] + 0.02, P[1] + 0.25, P[2] - 0.01], 0.008, C.stem, { g: "fruit" });
  leaf([P[0] + 0.04, P[1] + 0.24, P[2] + 0.01], 0.3);

  // bananas lying on a board
  box([-0.82, TOP + 0.01, -0.3], [0.46, 0.02, 0.32], planks(C.woodPale, C.wood, "x", 0.2), { g: "fruit" });
  for (let i = 0; i < 5; i++) {
    const z = -0.39 + i * 0.045;
    const y = TOP + 0.037;
    banana(
      [
        [-1.02, y, z],
        [-0.9, y, z + 0.04],
        [-0.74, y, z + 0.04],
        [-0.62, y, z],
      ],
      0.017,
    );
    rod([-1.02, y, z], [-1.07, y + 0.01, z], 0.008, C.stem, { g: "fruit" });
  }

  // potted plant at the back right
  const pp: V = [1.0, TOP, -0.42];
  turn(
    [
      [0, 0],
      [0.07, 0],
      [0.1, 0.08],
      [0.115, 0.14],
      [0.122, 0.15],
      [0.1, 0.15],
      [0.1, 0.12],
      [0, 0.12],
    ],
    pp,
    C.terra,
    { g: "plant", seg: 10 },
  );
  cyl([pp[0], TOP + 0.125, pp[2]], 0.1, 0.1, 0.01, C.woodDeep, { g: "plant" });
  ball([pp[0], TOP + 0.2, pp[2]], 0.07, C.leaf, { g: "plant" });
  ball([pp[0] - 0.05, TOP + 0.24, pp[2] + 0.03], 0.055, C.leafDark, { g: "plant" });
  ball([pp[0] + 0.06, TOP + 0.23, pp[2] - 0.02], 0.05, C.leaf, { g: "plant" });
  ball([pp[0] - 0.02, TOP + 0.31, pp[2]], 0.025, C.flower, { g: "plant" });
  ball([pp[0] + 0.05, TOP + 0.3, pp[2] + 0.04], 0.025, C.flowerPale, { g: "plant" });

  // front-left stack on the ground: lemons below, pears above, each with a label
  const fl = crate(-0.88, 0.04, 1.0, 0.5, 0.36, 0.24);
  for (const x of [-1.02, -0.88, -0.74]) for (const z of [0.93, 1.07]) lemon([x, fl + 0.036, z], x * 3);
  lemon([-0.95, fl + 0.106, 1.0], 0.4);
  lemon([-0.81, fl + 0.106, 1.0], 1.1);
  card([-0.88, 0.16, 1.183], 0.16, 0.096, tagLemons, { g: "crates" });
  const fu = crate(-0.88, 0.28, 1.0, 0.5, 0.36, 0.24);
  for (const x of [-1.0, -0.76]) for (const z of [0.93, 1.07]) pear([x, fu, z]);
  card([-0.88, 0.4, 1.183], 0.16, 0.096, tagPears, { g: "crates" });

  // a ginger cat sitting by the crates, tail curled round its front
  const catX = -0.42;
  const catZ = 1.02;
  ball([catX, 0.156, catZ], 0.13, catCoat, { g: "cat", scale: [0.85, 1.2, 0.9] });
  ball([catX, 0.36, catZ + 0.035], 0.09, catCoat, { g: "cat" });
  for (const s of [-1, 1]) {
    put(new THREE.ConeGeometry(0.03, 0.07, 6), C.catGinger, [catX + 0.05 * s, 0.45, catZ + 0.03], { g: "cat" });
    ball([catX + 0.035 * s, 0.37, catZ + 0.115], 0.016, C.ink, { g: "cat" });
    ball([catX + 0.06 * s, 0.035, catZ + 0.11], 0.04, C.catCream, { g: "cat" });
  }
  ball([catX, 0.345, catZ + 0.122], 0.011, C.catNose, { g: "cat" });
  b.sweep(
    catmull([
      [catX + 0.1, 0.03, catZ - 0.02],
      [catX + 0.22, 0.03, catZ + 0.02],
      [catX + 0.25, 0.12, catZ + 0.1],
      [catX + 0.2, 0.2, catZ + 0.14],
    ]),
    (t) => 0.035 - 0.012 * t,
    { color: C.catGinger, bone: root, group: "cat" },
  );

  // ---- awning: striped canopy, rolled back edge, scalloped valance with brass beads ----
  b.slab(
    [
      [-1.46, 2.62, -1.02],
      [1.46, 2.62, -1.02],
      [1.46, 2.2, 1.28],
      [-1.46, 2.2, 1.28],
    ],
    { color: awningStripe, thickness: 0.024, bone: root, group: "awning" },
  );
  b.capsule([-1.46, 2.62, -1.02], [1.46, 2.62, -1.02], 0.04, { color: C.woodDeep, bone: root, group: "awning" });
  b.capsule([-1.46, 2.2, 1.28], [1.46, 2.2, 1.28], 0.025, { color: C.woodDeep, bone: root, group: "awning" });
  flat(
    [
      [-1.46, 2.2],
      [1.46, 2.2],
      ...hem(-1.46, 1.46, 2.06, 0.12, 10),
    ],
    [0, 0, 1.28],
    [1, 0, 0],
    [0, 1, 0],
    0.024,
    awningStripe,
    { g: "valance" },
  );
  for (let i = 0; i < 10; i++) {
    const xc = -1.46 + (i + 0.5) * 0.292;
    ball([xc, 1.92, 1.3], 0.016, C.brass, { g: "valance" });
  }
  // two brass lanterns hang from the rolled back edge of the awning
  for (const s of [-1, 1]) {
    const lx = s * 0.85;
    rod([lx, 2.6, -1.02], [lx, 2.44, -1.02], 0.006, C.iron, { g: "lanterns" });
    cyl([lx, 2.42, -1.02], 0.03, 0.04, 0.02, C.brass, { g: "lanterns" });
    ball([lx, 2.34, -1.02], 0.06, C.lantern, { g: "lanterns", scale: [1, 1.25, 1] });
    cyl([lx, 2.25, -1.02], 0.04, 0.03, 0.02, C.brass, { g: "lanterns" });
  }

  // ---- hanging chalkboard sign on a hinge under the valance ----
  const H: V = [-0.6, 2.0, 1.36];
  rod([-0.6, 2.06, 1.29], H, 0.008, C.brass, { g: "sign" });
  const sign = b.joint("signHang", { parent: root, at: H, role: "hinge" });
  rod(H, [-0.85, 1.89, 1.36], 0.006, C.brass, { bone: sign, g: "sign" });
  rod(H, [-0.35, 1.89, 1.36], 0.006, C.brass, { bone: sign, g: "sign" });
  box([-0.6, 1.66, 1.36], [0.62, 0.46, 0.03], C.woodDeep, { bone: sign, g: "sign" });
  card([-0.6, 1.66, 1.378], 0.58, 0.42, signTex, { bone: sign, g: "sign" });

  // ---- hanging bunch of bananas from a hook on the valance ----
  rod([0.55, 2.08, 1.29], [0.55, 2.0, 1.36], 0.008, C.brass, { g: "fruit" });
  for (const j of [-1, 0, 1]) {
    banana(
      [
        [0.55, 1.98, 1.36],
        [0.55 + 0.04 * j, 1.86, 1.4],
        [0.55 + 0.06 * j, 1.74, 1.42],
        [0.55 + 0.04 * j, 1.66, 1.38],
      ],
      0.015,
    );
  }

  // ---- the lidded crate: melons inside, its lid hinged at the back edge and standing open ----
  const fr = crate(0.88, 0.04, 1.0, 0.5, 0.36, 0.24);
  melon([0.77, fr, 1.0], 0.1);
  melon([0.99, fr, 1.0], 0.1);
  const lid = b.joint("lidR", { parent: root, at: [0.88, 0.28, 0.82], role: "hinge" });
  box([0.88, 0.2925, 1.0], [0.5, 0.025, 0.36], planks(C.woodPale, C.wood, "z", 0.12), { bone: lid, g: "lid" });

  // ---- back right: two crates stacked outside, the upper one holding cabbages ----
  const br = crate(1.44, 0.04, -0.68, 0.4, 0.3, 0.22);
  const br2 = crate(1.44, 0.26, -0.68, 0.4, 0.3, 0.2);
  ball([1.37, br2 + 0.085, -0.68], 0.085, cabbageVeins, { g: "fruit" });
  ball([1.51, br2 + 0.085, -0.68], 0.085, cabbageVeins, { g: "fruit" });
  pumpkin(1.44, br, -0.68, 0.095);

  // ---- ground: barrel, sack, pumpkins ----
  const bar: V = [-1.42, 0, -0.35];
  turn(
    [
      [0, 0],
      [0.14, 0],
      [0.16, 0.06],
      [0.175, 0.2],
      [0.18, 0.3],
      [0.175, 0.4],
      [0.16, 0.54],
      [0.14, 0.6],
      [0, 0.6],
    ],
    bar,
    barrelStaves,
    { g: "barrel" },
  );
  hoop([bar[0], 0.12, bar[2]], 0.168, 0.01, C.iron, { g: "barrel" });
  hoop([bar[0], 0.48, bar[2]], 0.168, 0.01, C.iron, { g: "barrel" });
  sack(-1.42, 0.45);
  pumpkin(1.4, 0, 0.1, 0.12);
  pumpkin(1.54, 0, 0.42, 0.11);
  pumpkin(1.36, 0, 0.7, 0.1);

  b.pose(lid, { axis: [1, 0, 0], deg: -75 });
  b.pose(sign, { axis: [0, 0, 1], deg: 6 });
  return b.root;
}
