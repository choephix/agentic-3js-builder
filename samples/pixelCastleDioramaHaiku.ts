// A castle on a hill in pixel art: a walled castle with a moat and a drawbridge on a rocky hill, a village with a
// church, inn and square at its foot, farm fields, a windmill and a forest, on a 3 m planked base. Every surface is a
// paint in 2 cm square cells, so one pixel of the look is one cell everywhere.
import * as THREE from "three";
import type { BufferGeometry } from "three";
import type { Builder, OutlinePoint } from "../src/builder";
import { createBuilder } from "../src/builder";
import type { Fill, JointRef } from "../src/context";
import { frame } from "../src/frame";
import { DEG, rng } from "../src/math";
import { noise } from "../src/paint";
import { cellPaint, pixelArt } from "../kits/pixel";
import type { Cell } from "../kits/pixel";

export const meta = {
  name: "Castle on a Hill",
  description:
    "A walled castle with a moat and drawbridge on a rocky hill, a village with a church, inn and square at its foot, farm fields, a windmill and a forest, on a planked base.",
  style: "pixel art",
  commit: "b816db2",
};

// ---------------------------------------------------------------------------------------------------------------
// Scene constants (metres, +Y up, the viewer stands at +Z)

const T = 0.02; // one pixel: every paint cell and card texel is this size
const G = 0.2; // top of the grass slab
const CZ = -0.3; // hill centre, z
const TOP = 0.6; // plateau height above the grass
const P = G + TOP; // plateau top, where the castle stands
const WM = { x: 1.28, z: -0.78 }; // windmill
const SC = { x: 1.2, z: -1.2 }; // scarecrow
const POND = { x: -1.25, z: -1.0, r: 0.17 };

// Hill profile: radius from the hill centre and height above the grass, from the foot up to the plateau edge.
const HILL: [number, number][] = [
  [1.16, 0],
  [1.13, 0.05],
  [1.06, 0.08],
  [1.02, 0.12],
  [0.96, 0.16],
  [0.92, 0.22],
  [0.88, 0.28],
  [0.84, 0.34],
  [0.8, 0.4],
  [0.78, 0.46],
  [0.76, 0.52],
  [0.74, 0.56],
  [0.72, 0.6],
];

function hillH(r: number) {
  if (r >= HILL[0][0]) return 0;
  if (r <= HILL[HILL.length - 1][0]) return TOP;
  for (let i = 0; i < HILL.length - 1; i++) {
    const [r0, h0] = HILL[i];
    const [r1, h1] = HILL[i + 1];
    if (r <= r0 && r >= r1) return h0 + ((h1 - h0) * (r0 - r)) / (r0 - r1);
  }
  return 0;
}

/** Height of the terrain (grass or hill) at x, z. */
const groundY = (x: number, z: number) => G + hillH(Math.hypot(x, z - CZ));

// ---------------------------------------------------------------------------------------------------------------
// Palette: dark to light ramps; each surface picks a step by how it faces the light.

const R = {
  grass: ["#24491c", "#33692a", "#4a8a36", "#62a444", "#86c45a"],
  grassDeep: ["#172f13", "#1f3f19", "#2a5423", "#36692c"],
  dirt: ["#3a2818", "#55391f", "#74502c", "#94693b"],
  cobble: ["#4a4744", "#65625c", "#83807a", "#a39f97"],
  road: ["#7d5f3c", "#9a7749", "#b8925c", "#d2ad76"],
  water: ["#123f63", "#1b5b88", "#2777ad", "#3f97cc", "#7cc4e8"],
  sand: ["#8f7e54", "#b3a06c", "#d4c28a"],
  wheat: ["#7d5d1e", "#a67c2a", "#cd9d3c", "#eec563"],
  soil: ["#2e1d10", "#452b18", "#5e3c22"],
  rock: ["#353a46", "#4b515e", "#666d7c", "#838b9b"],
  stone: ["#5f584c", "#7d7567", "#9d9584", "#c2b9a4"],
  flag: ["#8f7c5a", "#b09a6f", "#d0b98a", "#eedcae"],
  plaster: ["#a68760", "#c9aa7c", "#e6cd9d", "#fbe9bf"],
  wash: ["#5f7384", "#8197a8", "#a9bccb", "#cfdde7"],
  ochre: ["#7e5a1c", "#a87a2c", "#d19c40", "#f2c86a"],
  timber: ["#2a1709", "#452612", "#66391d", "#86532c"],
  frame: ["#a8a08a", "#cfc8b2", "#ece6d4"],
  glass: ["#14283a", "#22405c", "#37668c", "#7fb5d6"],
  barn: ["#4a1210", "#6e1d17", "#94291e", "#b6402c"],
  roofRed: ["#451610", "#6f2216", "#9a3320", "#c4502f"],
  roofBlue: ["#1c2435", "#2c3a54", "#43557a", "#5f7599"],
  thatch: ["#5c3f16", "#82581f", "#a87630", "#cc9a4c"],
  wood: ["#3a2213", "#563419", "#744a25", "#93623a"],
  plank: ["#5e3c1c", "#7d5228", "#9c6a36", "#c08a4c"],
  foliage: ["#10331b", "#1c5327", "#2b7434", "#3f9440", "#5fb34f"],
  pine: ["#0a2418", "#123f29", "#1d5a37", "#2f7549"],
  metal: ["#2b2f38", "#444a56", "#687080", "#9aa3b2"],
  gold: ["#6e4a0c", "#a06f16", "#cf9a25", "#f5d35c"],
  wool: ["#9d9a92", "#c4c1b8", "#e2e0d6", "#fbfaf4"],
  black: ["#0d0d12", "#1f1f28", "#34343f", "#4a4a58"],
  skin: ["#8a5a3a", "#b07a52", "#d9a072", "#f2c596"],
  hay: ["#7a5420", "#a87630", "#cf9a40", "#eec66a"],
  red: ["#4a1212", "#7c1e1e", "#b03030", "#d9584a"],
  blue: ["#14234a", "#1f3a72", "#2f57a0", "#4f7fd0"],
  green: ["#16361a", "#24582a", "#378040", "#58a85c"],
  brown: ["#3a2412", "#5c3a1e", "#7c5230", "#9e6e44"],
  yellow: ["#6e5210", "#9a7620", "#c89c32", "#f0c85a"],
};

const MORTAR = "#2e2a24";
const DARK = "#1a1410";
const IRON = "#5b616c";
const LANTERN = "#ffd76a";
const FLAME = "#ffb43a";
const FLOWERS = ["#f2d24a", "#e8708a", "#fbf6e8", "#c48be0"];

// ---------------------------------------------------------------------------------------------------------------
// Shading: a cell's lightness comes from its normal against one light, so every face steps through its ramp.

const LIGHT = new THREE.Vector3(0.4, 0.8, 0.45).normalize();
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const md = (n: number, m: number) => ((n % m) + m) % m;
const lit = (c: Cell) => clamp01(0.5 + 0.5 * c.n.dot(LIGHT));
const shade = (c: Cell, ramp: readonly string[], lift = 0) => c.pick(ramp, clamp01(lit(c) * 0.86 + lift));
const flower = (c: Cell) => FLOWERS[Math.floor(c.random(88) * FLOWERS.length)];

// ---------------------------------------------------------------------------------------------------------------
// Geometry helpers: each returns a BufferGeometry placed in model space.

type Rot = readonly [number, number, number];

function place<Geo extends BufferGeometry>(g: Geo, x: number, y: number, z: number, rot: Rot = [0, 0, 0]) {
  if (rot[0]) g.rotateX(rot[0] * DEG);
  if (rot[1]) g.rotateY(rot[1] * DEG);
  if (rot[2]) g.rotateZ(rot[2] * DEG);
  return g.translate(x, y, z);
}
const boxG = (w: number, h: number, d: number, x: number, y: number, z: number, rot?: Rot) =>
  place(new THREE.BoxGeometry(w, h, d), x, y, z, rot);
const cylG = (rt: number, rb: number, h: number, seg: number, x: number, y: number, z: number, rot?: Rot) =>
  place(new THREE.CylinderGeometry(rt, rb, h, seg), x, y, z, rot);
const coneG = (r: number, h: number, seg: number, x: number, y: number, z: number, rot?: Rot) =>
  cylG(0, r, h, seg, x, y, z, rot);
const ballG = (r: number, ws: number, hs: number, x: number, y: number, z: number) =>
  place(new THREE.SphereGeometry(r, ws, hs), x, y, z);

/** Up to `n` points inside `box` ([x0, x1, z0, z1]) that pass `ok`, deterministically. */
function scatter(n: number, seed: number, box: readonly [number, number, number, number], ok: (x: number, z: number) => boolean) {
  const r = rng(seed);
  const out: [number, number][] = [];
  for (let guard = 0; out.length < n && guard < n * 80; guard++) {
    const x = box[0] + (box[1] - box[0]) * r();
    const z = box[2] + (box[3] - box[2]) * r();
    if (ok(x, z)) out.push([x, z]);
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------
// Cell functions: each takes one pixel cell and returns its colour.

function stoneCell(c: Cell): string {
  if (c.axis === 1) return c.n.y > 0 ? shade(c, R.flag) : MORTAR;
  if (md(c.v, 3) === 0) return MORTAR;
  const off = md(Math.floor(c.v / 3), 2) * 2;
  if (md(c.u + off, 5) === 0) return MORTAR;
  return shade(c, R.stone, 0.12 * (c.random(3) - 0.5));
}

function tileCell(c: Cell, ramp: readonly string[]): string {
  const off = md(Math.floor(c.v / 2), 2) * 2;
  if (md(c.v, 2) === 0) return ramp[0];
  if (md(c.u + off, 4) === 0) return ramp[0];
  return c.pick(ramp, clamp01(lit(c) * 0.8 + 0.2 * c.random(7)));
}

/** The base: honey planks with a dark seam every third cell and iron rivets. */
function baseCell(c: Cell): string {
  if (md(c.v, 3) === 0) return "#2a1808";
  if (c.random(91) < 0.01) return "#8a8f9a";
  return shade(c, R.plank, 0.08 * (c.random(92) - 0.5));
}

function woodCell(c: Cell): string {
  if (md(c.v, 6) === 0) return R.wood[0];
  return c.random(71) < 0.06 ? R.wood[0] : shade(c, R.wood, 0.08 * (c.random(72) - 0.5));
}

function grassCell(c: Cell): string {
  if (c.random(21) < 0.014) return flower(c);
  if (c.random(22) < 0.07) return R.grass[0];
  return shade(c, R.grass, 0.14 * (noise(c.at, 0.22, 3) - 0.5));
}

function roadCell(c: Cell): string {
  return c.random(41) < 0.1 ? R.road[0] : shade(c, R.road, 0.12 * (c.random(42) - 0.5));
}

function cobbleCell(c: Cell): string {
  if (md(c.u, 3) === 0 || md(c.v, 3) === 0) return "#34322e";
  return shade(c, R.cobble, 0.15 * (c.random(43) - 0.5));
}

/** The grass slab: a meadow with a road, a village square, fields, a pond and a dark forest floor; earth on its sides. */
function groundCell(c: Cell): string {
  const { x, z } = c.at;
  if (c.axis !== 1 || c.n.y < 0.5) {
    if (c.at.y > G - 0.02) return c.random(51) < 0.55 ? shade(c, R.grass) : shade(c, R.dirt);
    return md(c.v, 5) === 0 ? R.dirt[0] : c.random(52) < 0.08 ? R.rock[1] : shade(c, R.dirt, 0.1 * (c.random(53) - 0.5));
  }
  const pond = Math.hypot(x - POND.x, z - POND.z);
  if (pond < POND.r) return c.random(54) < 0.05 ? R.water[4] : c.pick(R.water, clamp01(0.4 + 0.5 * noise(c.at, 0.1, 6)));
  if (pond < POND.r + 0.03) return c.pick(R.sand, c.random(55));
  if (Math.abs(x) < 0.2 && z > 0.98 && z < 1.42) return cobbleCell(c);
  if (Math.abs(x) < 0.035 && z > 0.28 && z < 1.5) return roadCell(c);
  if ((x > 1.12 && z > -0.45 && z < 0.28) || (x > 0.8 && z < -0.95))
    return md(c.v, 4) === 0 ? R.soil[1] : c.pick(R.wheat, clamp01(0.35 + 0.6 * c.random(56)));
  if (x < -0.95 && z < -0.2) return shade(c, R.grassDeep, 0.1 * (noise(c.at, 0.2, 7) - 0.5));
  return grassCell(c);
}

/** The hill: a grass cap with the moat on its plateau, a road up its front and a rocky cliff at the rim. */
function hillCell(c: Cell): string {
  const { x, y, z } = c.at;
  const r = Math.hypot(x, z - CZ);
  if (Math.abs(x) < 0.035 && z > 0.28 && c.n.y > 0.3) return roadCell(c);
  if (c.n.y > 0.5) {
    if (r > 0.4 && r < 0.56) return c.pick(R.water, clamp01(0.4 + 0.5 * noise(c.at, 0.1, 6)));
    return grassCell(c);
  }
  if (y - G < 0.12) return md(c.v, 4) === 0 ? R.rock[0] : shade(c, R.rock, 0.1 * (c.random(62) - 0.5));
  if (y - G > TOP - 0.06 && c.random(61) < 0.5) return grassCell(c);
  return shade(c, R.rock, 0.1 * (c.random(62) - 0.5));
}

// ---------------------------------------------------------------------------------------------------------------
// Paints

const groundP = cellPaint(T, groundCell, { dither: true });
const hillP = cellPaint(T, hillCell, { dither: true });
const baseP = cellPaint(T, baseCell);
const stoneP = cellPaint(T, stoneCell);
const cobbleP = cellPaint(T, cobbleCell);
const woodP = cellPaint(T, woodCell);
const bridgeP = cellPaint(T, (c) => (md(c.u, 6) === 0 ? R.wood[0] : shade(c, R.wood, 0.08 * (c.random(74) - 0.5))));
const trunkP = cellPaint(T, (c) => (md(c.u, 3) === 0 ? R.wood[0] : shade(c, R.wood)));
const foliageP = cellPaint(T, (c) => (c.random(77) < 0.035 ? flower(c) : shade(c, R.foliage, 0.1 * (noise(c.at, 0.1, 8) - 0.5))), {
  dither: true,
});
const pineP = cellPaint(T, (c) => (md(c.v, 3) === 0 ? R.pine[0] : shade(c, R.pine, 0.1 * (c.random(79) - 0.5))));
const metalP = cellPaint(T, (c) => shade(c, R.metal));
const woolP = cellPaint(T, (c) => (c.random(81) < 0.12 ? R.wool[1] : shade(c, R.wool)));
const blackP = cellPaint(T, (c) => shade(c, R.black));
const skinP = cellPaint(T, (c) => shade(c, R.skin));
const hayP = cellPaint(T, (c) => (md(c.u + c.v, 4) === 0 ? R.hay[0] : shade(c, R.hay, 0.1 * (c.random(83) - 0.5))));
const sailP = cellPaint(T, (c) => (md(c.v, 6) < 1 ? "#b8282e" : shade(c, R.flag)));
const flagP = cellPaint(T, (c) => (md(c.u + c.v, 6) < 2 ? "#f5d35c" : "#b8282e"));
const roofRedP = cellPaint(T, (c) => tileCell(c, R.roofRed));
const roofBlueP = cellPaint(T, (c) => tileCell(c, R.roofBlue));
const thatchP = cellPaint(T, (c) => tileCell(c, R.thatch));
const cowP = cellPaint(T, (c) => (noise(c.at, 0.05, 2) > 0.52 ? DARK : shade(c, R.wool)));
const clothP = {
  red: cellPaint(T, (c) => shade(c, R.red)),
  blue: cellPaint(T, (c) => shade(c, R.blue)),
  green: cellPaint(T, (c) => shade(c, R.green)),
  brown: cellPaint(T, (c) => shade(c, R.brown)),
  yellow: cellPaint(T, (c) => shade(c, R.yellow)),
};

/** The gatehouse: a gate with a portcullis, and arrow slits. */
const gateP = cellPaint(T, (c) => {
  const lx = c.at.x;
  const ly = c.at.y - P;
  if (c.n.z > 0.5) {
    if (Math.abs(lx) < 0.03 && ly < 0.09) return md(c.u, 3) === 0 ? IRON : DARK;
    if (Math.abs(Math.abs(lx) - 0.055) < 0.008 && ly > 0.13 && ly < 0.17) return DARK;
  }
  return stoneCell(c);
});
/** The keep: a door, arrow slits and two windows on its front. */
const keepP = cellPaint(T, (c) => {
  const lx = c.at.x;
  const ly = c.at.y - P;
  if (c.n.z > 0.5) {
    if (Math.abs(lx) < 0.016 && ly < 0.08) return DARK;
    if (Math.abs(lx) < 0.008 && ly > 0.12 && ly < 0.2) return DARK;
    if (Math.abs(Math.abs(lx) - 0.035) < 0.008 && ly > 0.15 && ly < 0.19) return DARK;
  }
  return stoneCell(c);
});
/** The church tower: a clock face on its front. */
const clockP = cellPaint(T, (c) => {
  if (c.n.z > 0.5) {
    const dx = c.at.x - 0.42;
    const dy = c.at.y - (G + 0.22);
    const d = Math.hypot(dx, dy);
    if (d < 0.024) return d < 0.019 ? "#f4efe0" : "#2a2a33";
    if ((Math.abs(dx) < 0.004 && dy > -0.004 && dy < 0.016) || (Math.abs(dy) < 0.004 && dx > -0.004 && dx < 0.012))
      return "#2a2a33";
  }
  return stoneCell(c);
});
/** The barn: red planks and a white-cross door. */
const barnP = cellPaint(T, (c) => {
  const lx = c.at.x - 1.31;
  const ly = c.at.y - G;
  if (c.n.z > 0.5 && Math.abs(lx) < 0.03 && ly < 0.09)
    return md(c.u - c.v, 5) === 0 || md(c.u + c.v, 5) === 0 ? "#f3efe4" : "#5a1414";
  if (c.axis === 1) return shade(c, R.wood);
  return md(c.u, 4) === 0 ? "#3a0e0c" : shade(c, R.barn);
});
/** The inn's hanging sign: a tankard on a board. */
const signP = cellPaint(T, (c) => {
  const lx = c.at.x + 0.2;
  const ly = c.at.y - (G + 0.1);
  if (c.n.z > 0.5) {
    if (Math.abs(lx) < 0.011 && Math.abs(ly) < 0.013) return ly > 0.007 ? "#f7f2e0" : "#c88a20";
    if (lx > 0.011 && lx < 0.018 && Math.abs(ly) < 0.006) return "#c88a20";
  }
  return shade(c, R.timber);
});
/** The plaque on the base's front edge: a brass tower on a dark frame. */
const plaqueP = cellPaint(T, (c) => {
  const lx = c.at.x;
  const ly = c.at.y - 0.06;
  if (Math.abs(lx) > 0.19 || Math.abs(ly) > 0.017) return "#3a2a14";
  if (Math.abs(lx) < 0.01 && Math.abs(ly) < 0.012) return "#3a2a14";
  return shade(c, R.gold);
});

// ---------------------------------------------------------------------------------------------------------------
// Houses: a box of plaster with half-timber posts, painted windows and a door, under a pitched tile roof.

type House = {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  wall: readonly string[];
  roof: Fill;
  pitch?: number;
  chimney?: boolean;
};

function housePaint(h: House) {
  const hw = h.w / 2;
  const hd = h.d / 2;
  return cellPaint(T, (c) => {
    const lx = c.at.x - h.x;
    const lz = c.at.z - h.z;
    const ly = c.at.y - G;
    if (ly > h.h) {
      // the gable above the walls
      return Math.abs(lz) < 0.008 ? shade(c, R.timber) : shade(c, h.wall, 0.08 * (c.random(9) - 0.5));
    }
    const front = c.n.z > 0.5;
    const back = c.n.z < -0.5;
    if (front || back) {
      if (front && Math.abs(lx) < 0.018 && ly < 0.07) return shade(c, R.timber, -0.1);
      for (const wx of [-0.6 * hw, 0.6 * hw]) {
        const dx = lx - wx;
        const dy = ly - 0.085;
        if (Math.abs(dx) < 0.02 && Math.abs(dy) < 0.026) {
          if (Math.abs(dx) > 0.0165 || Math.abs(dy) > 0.0225 || Math.abs(dx) < 0.0015 || Math.abs(dy) < 0.0015)
            return shade(c, R.frame);
          return md(c.u + c.v, 5) === 0 ? R.glass[3] : shade(c, R.glass);
        }
      }
    }
    const post = front || back ? Math.abs(lx) > hw - 0.012 : Math.abs(lz) > hd - 0.012;
    if (post || ly > h.h - 0.014) return shade(c, R.timber);
    if (ly < 0.01) return shade(c, R.stone);
    return shade(c, h.wall, 0.1 * (c.random(11) - 0.5));
  });
}

// ---------------------------------------------------------------------------------------------------------------
// The model

export default function build() {
  const b: Builder = createBuilder({ name: "pixelCastleDiorama", paintSize: 2048 });

  /** One model-space mesh as its own part, on the root or on the bone given. */
  const put = (g: BufferGeometry, fill: Fill, bone?: JointRef) => b.part(g, fill, { at: [0, 0, 0], bone });

  /** A pitched roof of two tile slabs on a box whose eaves sit at `eave`, with gable ends in `wall`. Returns the ridge height. */
  const gabled = (x: number, z: number, w: number, d: number, eave: number, pitch: number, roof: Fill, wall: Fill) => {
    const run = d / 2 + 0.02;
    const rise = run * pitch;
    const ang = Math.atan2(rise, run) / DEG;
    const len = Math.hypot(run, rise) + 0.01;
    const ridge = eave + rise;
    for (const s of [1, -1]) put(boxG(w + 0.05, 0.02, len, x, ridge - rise / 2, z + (s * run) / 2, [s * ang, 0, 0]), roof);
    for (const s of [1, -1]) {
      b.extrude(
        [
          [-run, 0],
          [run, 0],
          [0, rise],
        ],
        { at: [x + (s * w) / 2, eave, z], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.012, color: wall },
      );
    }
    return ridge;
  };

  const house = (h: House, wallFill: Fill = housePaint(h)) => {
    put(boxG(h.w, h.h, h.d, h.x, G + h.h / 2, h.z), wallFill);
    const ridge = gabled(h.x, h.z, h.w, h.d, G + h.h, h.pitch ?? 0.6, h.roof, wallFill);
    if (h.chimney) put(boxG(0.03, 0.08, 0.03, h.x + h.w * 0.25, ridge + 0.005, h.z), stoneP);
  };

  const fence = (x0: number, z0: number, x1: number, z1: number) => {
    const dx = x1 - x0;
    const dz = z1 - z0;
    const len = Math.hypot(dx, dz);
    const n = Math.max(2, Math.round(len / 0.06));
    const ang = Math.atan2(dx, dz) / DEG;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      put(boxG(0.012, 0.09, 0.012, x0 + dx * t, G + 0.045, z0 + dz * t), woodP);
    }
    for (const y of [G + 0.03, G + 0.07]) put(boxG(0.007, 0.008, len, (x0 + x1) / 2, y, (z0 + z1) / 2, [0, ang, 0]), woodP);
  };

  const tree = (x: number, z: number, kind: "round" | "pine", s: number, y = groundY(x, z)) => {
    put(cylG(0.011 * s, 0.015 * s, 0.1 * s, 6, x, y + 0.05 * s, z), trunkP);
    if (kind === "round") {
      put(ballG(0.075 * s, 7, 5, x, y + 0.14 * s, z), foliageP);
      put(ballG(0.05 * s, 6, 4, x + 0.035 * s, y + 0.2 * s, z - 0.02 * s), foliageP);
    } else {
      put(coneG(0.075 * s, 0.15 * s, 6, x, y + 0.13 * s, z), pineP);
      put(coneG(0.058 * s, 0.13 * s, 6, x, y + 0.2 * s, z), pineP);
      put(coneG(0.038 * s, 0.1 * s, 6, x, y + 0.27 * s, z), pineP);
    }
  };

  /** A four-legged animal: a body along its yaw, a head at the front, legs at the corners. */
  const animal = (x: number, z: number, yaw: number, body: Fill, head: Fill, bodyLen: number, y = groundY(x, z)) => {
    const s = Math.sin(yaw * DEG);
    const c = Math.cos(yaw * DEG);
    put(boxG(0.04, 0.04, bodyLen, x, y + 0.035, z, [0, yaw, 0]), body);
    put(boxG(0.026, 0.026, 0.026, x + s * (bodyLen / 2 + 0.012), y + 0.045, z + c * (bodyLen / 2 + 0.012), [0, yaw, 0]), head);
    for (const [dx, dz] of [
      [-0.012, -bodyLen / 3],
      [0.012, -bodyLen / 3],
      [-0.012, bodyLen / 3],
      [0.012, bodyLen / 3],
    ]) {
      put(boxG(0.012, 0.024, 0.012, x + dx * c + dz * s, y + 0.012, z - dx * s + dz * c), blackP);
    }
  };

  const villager = (x: number, z: number, tunic: Fill, hat: Fill, y = G) => {
    put(boxG(0.008, 0.024, 0.01, x - 0.006, y + 0.012, z), blackP);
    put(boxG(0.008, 0.024, 0.01, x + 0.006, y + 0.012, z), blackP);
    put(boxG(0.026, 0.03, 0.016, x, y + 0.039, z), tunic);
    put(boxG(0.02, 0.02, 0.02, x, y + 0.064, z), skinP);
    put(boxG(0.024, 0.008, 0.024, x, y + 0.08, z), hat);
  };

  // ---- joints: the drawbridge and the windmill rotor are the only moving parts
  const root = b.joint("root", { at: [0, 0, 0] });
  const bridge = b.joint("drawbridge", { parent: root, at: [0, P, CZ + 0.4], dir: [0, 0, 1], role: "hinge" });
  const rotor = b.joint("rotor", { parent: root, at: [WM.x, G + 0.24, WM.z + 0.075], dir: [0, 0, 1], role: "hinge" });

  // ---- base: planked honey wood with rivets, a grass slab on top and a brass plaque on the front
  put(boxG(3.0, 0.12, 3.0, 0, 0.06, 0), baseP);
  put(boxG(2.9, 0.08, 2.9, 0, 0.16, 0), groundP);
  put(boxG(0.4, 0.06, 0.008, 0, 0.06, 1.504), plaqueP);
  for (const [x, z] of [
    [-1.47, -1.47],
    [1.47, -1.47],
    [-1.47, 1.47],
    [1.47, 1.47],
  ])
    put(boxG(0.05, 0.13, 0.05, x, 0.065, z), metalP);

  // ---- the hill: a lathe with a flat plateau and a rocky rim
  const hillProfile: OutlinePoint[] = [
    [0, 0],
    ...HILL.map(([r, h], i): OutlinePoint => (i === 0 || i === HILL.length - 1 ? [r, h, "sharp"] : [r, h])),
    [0, TOP],
  ];
  b.lathe(hillProfile, { at: [0, G, CZ], segments: 28, color: hillP });

  // ---- moat curbs: the moat is painted on the plateau between them
  b.lathe(
    [
      [0.56, 0],
      [0.586, 0],
      [0.586, 0.03],
      [0.56, 0.03],
    ],
    { at: [0, P, CZ], segments: 40, color: stoneP },
  );
  b.lathe(
    [
      [0.382, 0],
      [0.4, 0],
      [0.4, 0.03],
      [0.382, 0.03],
    ],
    { at: [0, P, CZ], segments: 40, color: stoneP },
  );

  // ---- the castle on the island
  put(boxG(0.44, 0.004, 0.44, 0, P + 0.002, CZ), cobbleP);
  const WH = 0.16;
  put(boxG(0.44, WH, 0.04, 0, P + WH / 2, CZ - 0.22), stoneP);
  put(boxG(0.04, WH, 0.44, -0.22, P + WH / 2, CZ), stoneP);
  put(boxG(0.04, WH, 0.44, 0.22, P + WH / 2, CZ), stoneP);
  put(boxG(0.15, WH, 0.04, -0.145, P + WH / 2, CZ + 0.22), stoneP);
  put(boxG(0.15, WH, 0.04, 0.145, P + WH / 2, CZ + 0.22), stoneP);
  for (const x of [-0.2, -0.15, -0.1, -0.05, 0, 0.05, 0.1, 0.15, 0.2])
    put(boxG(0.025, 0.035, 0.045, x, P + WH + 0.0175, CZ - 0.22), stoneP);
  for (const z of [-0.2, -0.15, -0.1, -0.05, 0, 0.05, 0.1, 0.15, 0.2]) {
    put(boxG(0.045, 0.035, 0.025, -0.22, P + WH + 0.0175, CZ + z), stoneP);
    put(boxG(0.045, 0.035, 0.025, 0.22, P + WH + 0.0175, CZ + z), stoneP);
  }
  for (const x of [-0.2, -0.15, -0.1, 0.1, 0.15, 0.2]) put(boxG(0.025, 0.035, 0.045, x, P + WH + 0.0175, CZ + 0.22), stoneP);

  // gatehouse, its banner, the torches beside the gate, and the causeway in front of it
  put(boxG(0.16, 0.28, 0.12, 0, P + 0.14, CZ + 0.22), gateP);
  for (const x of [-0.06, 0, 0.06]) put(boxG(0.025, 0.035, 0.045, x, P + 0.2975, CZ + 0.22), stoneP);
  put(boxG(0.03, 0.06, 0.002, -0.05, P + 0.22, CZ + 0.2815), flagP);
  for (const s of [-1, 1]) {
    put(boxG(0.012, 0.02, 0.012, s * 0.105, P + 0.11, CZ + 0.245), woodP);
    put(coneG(0.008, 0.02, 4, s * 0.105, P + 0.13, CZ + 0.245), FLAME);
  }
  put(boxG(0.14, 0.004, 0.12, 0, P + 0.002, CZ + 0.34), cobbleP);

  // corner towers with pointed roofs and pennants
  for (const [sx, sz] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ] as const) {
    const tx = sx * 0.22;
    const tz = CZ + sz * 0.22;
    put(cylG(0.055, 0.058, 0.26, 10, tx, P + 0.13, tz), stoneP);
    put(coneG(0.07, 0.14, 8, tx, P + 0.33, tz), roofRedP);
    put(cylG(0.003, 0.003, 0.07, 4, tx, P + 0.435, tz), woodP);
    put(boxG(0.06, 0.028, 0.002, tx + 0.03, P + 0.45, tz), flagP);
  }

  // the keep at the back of the courtyard
  put(boxG(0.13, 0.26, 0.13, 0, P + 0.13, CZ - 0.12), keepP);
  put(coneG(0.095, 0.12, 4, 0, P + 0.32, CZ - 0.12, [0, 45, 0]), roofRedP);
  put(cylG(0.004, 0.004, 0.1, 4, 0, P + 0.43, CZ - 0.12), woodP);
  put(boxG(0.07, 0.04, 0.002, 0.035, P + 0.45, CZ - 0.12), flagP);

  // chapel with its spire, barracks, and a well inside the walls
  const chapelZ = CZ + 0.04;
  const chapelRidge = gabled(-0.11, chapelZ, 0.12, 0.14, P + 0.1, 0.6, roofBlueP, stoneP);
  put(boxG(0.12, 0.1, 0.14, -0.11, P + 0.05, chapelZ), stoneP);
  put(coneG(0.03, 0.09, 6, -0.11, chapelRidge + 0.045, chapelZ), roofBlueP);
  put(boxG(0.12, 0.08, 0.12, 0.11, P + 0.04, CZ + 0.06), stoneP);
  gabled(0.11, CZ + 0.06, 0.12, 0.12, P + 0.08, 0.5, thatchP, stoneP);
  put(cylG(0.025, 0.027, 0.04, 8, 0, P + 0.02, CZ + 0.09), stoneP);
  put(boxG(0.006, 0.06, 0.006, -0.02, P + 0.07, CZ + 0.09), woodP);
  put(boxG(0.006, 0.06, 0.006, 0.02, P + 0.07, CZ + 0.09), woodP);
  put(boxG(0.06, 0.008, 0.05, 0, P + 0.1, CZ + 0.09), thatchP);

  // island trees outside the walls
  tree(-0.3, CZ - 0.12, "round", 0.7, P);
  tree(0.3, CZ - 0.12, "pine", 0.7, P);

  // the drawbridge planks and rails ride the hinge
  put(boxG(0.13, 0.012, 0.21, 0, P + 0.006, CZ + 0.505), bridgeP, bridge);
  for (const x of [-0.066, 0.066]) {
    put(boxG(0.008, 0.01, 0.21, x, P + 0.032, CZ + 0.505), woodP, bridge);
    for (const z of [CZ + 0.42, CZ + 0.5, CZ + 0.59]) put(boxG(0.012, 0.03, 0.012, x, P + 0.02, z), woodP, bridge);
  }

  // ---- the village at the foot of the hill, along the road
  const roadHouses: House[] = [
    { x: -0.3, z: 1.08, w: 0.24, d: 0.17, h: 0.13, wall: R.ochre, roof: roofRedP, chimney: true }, // inn
    { x: -0.66, z: 1.06, w: 0.2, d: 0.16, h: 0.12, wall: R.plaster, roof: thatchP },
    { x: -1.0, z: 1.08, w: 0.19, d: 0.16, h: 0.13, wall: R.wash, roof: roofBlueP, chimney: true }, // smithy
    { x: -0.4, z: 1.31, w: 0.18, d: 0.15, h: 0.11, wall: R.plaster, roof: roofRedP },
    { x: -0.84, z: 1.31, w: 0.17, d: 0.15, h: 0.11, wall: R.ochre, roof: thatchP },
    { x: -1.16, z: 1.3, w: 0.15, d: 0.14, h: 0.1, wall: R.wash, roof: roofRedP },
    { x: 0.8, z: 1.07, w: 0.2, d: 0.16, h: 0.12, wall: R.plaster, roof: roofRedP, chimney: true },
    { x: 1.1, z: 1.07, w: 0.18, d: 0.15, h: 0.11, wall: R.wash, roof: thatchP },
    { x: 0.66, z: 1.31, w: 0.16, d: 0.14, h: 0.1, wall: R.ochre, roof: roofBlueP },
    { x: 1.1, z: 1.3, w: 0.18, d: 0.15, h: 0.12, wall: R.plaster, roof: roofRedP },
  ];
  for (const h of roadHouses) house(h);
  // the inn's hanging sign and its iron bracket
  put(boxG(0.05, 0.04, 0.005, -0.2, G + 0.1, 1.178), signP);
  put(boxG(0.07, 0.005, 0.005, -0.2, G + 0.13, 1.17), metalP);

  // church: a nave with a clock tower and spire at the front, and a few graves beside it
  house({ x: 0.42, z: 1.06, w: 0.22, d: 0.2, h: 0.14, wall: R.frame, roof: roofBlueP, pitch: 0.55 });
  put(boxG(0.09, 0.3, 0.09, 0.42, G + 0.15, 1.21), clockP);
  put(coneG(0.07, 0.14, 4, 0.42, G + 0.37, 1.21, [0, 45, 0]), roofBlueP);
  for (const [x, z] of [
    [0.56, 0.94],
    [0.6, 0.95],
    [0.58, 0.9],
    [0.63, 0.92],
  ])
    put(boxG(0.012, 0.022, 0.005, x, G + 0.011, z), stoneP);

  // village square: well, market stall, barrels, crates, a cart, a signpost and two lamp posts on the road
  put(cylG(0.035, 0.035, 0.035, 10, -0.13, G + 0.0175, 1.25), stoneP);
  put(boxG(0.008, 0.11, 0.008, -0.16, G + 0.055, 1.25), woodP);
  put(boxG(0.008, 0.11, 0.008, -0.1, G + 0.055, 1.25), woodP);
  put(boxG(0.09, 0.008, 0.07, -0.13, G + 0.115, 1.25), thatchP);
  put(boxG(0.12, 0.05, 0.07, 0.16, G + 0.025, 1.28), woodP);
  for (const [x, z] of [
    [0.1, 1.245],
    [0.22, 1.245],
    [0.1, 1.315],
    [0.22, 1.315],
  ])
    put(boxG(0.008, 0.13, 0.008, x, G + 0.065, z), woodP);
  put(boxG(0.14, 0.008, 0.1, 0.16, G + 0.135, 1.28), sailP);
  put(boxG(0.03, 0.02, 0.03, 0.13, G + 0.06, 1.28), clothP.red);
  put(boxG(0.03, 0.02, 0.03, 0.19, G + 0.06, 1.28), clothP.yellow);
  put(ballG(0.012, 5, 4, 0.16, G + 0.062, 1.27), clothP.green);
  for (const [x, z] of [
    [-0.23, 1.25],
    [-0.23, 1.3],
  ]) {
    put(cylG(0.018, 0.02, 0.05, 8, x, G + 0.025, z), woodP);
    put(cylG(0.0205, 0.0205, 0.006, 8, x, G + 0.012, z), metalP);
    put(cylG(0.0205, 0.0205, 0.006, 8, x, G + 0.038, z), metalP);
  }
  put(boxG(0.03, 0.03, 0.03, -0.2, G + 0.015, 1.2), woodP);
  put(boxG(0.03, 0.03, 0.03, -0.2, G + 0.045, 1.2), woodP);
  put(boxG(0.1, 0.025, 0.06, 0.22, G + 0.06, 0.93), woodP);
  put(boxG(0.09, 0.03, 0.055, 0.22, G + 0.085, 0.93), hayP);
  for (const x of [0.16, 0.28]) put(cylG(0.03, 0.03, 0.012, 8, x, G + 0.03, 0.93, [0, 0, 90]), woodP);
  put(boxG(0.007, 0.13, 0.007, 0.07, G + 0.065, 0.93), woodP);
  put(boxG(0.05, 0.03, 0.004, 0.075, G + 0.11, 0.93), woodP);
  for (const [x, z] of [
    [-0.07, 1.0],
    [0.07, 1.36],
  ]) {
    put(cylG(0.004, 0.005, 0.1, 5, x, G + 0.05, z), woodP);
    put(boxG(0.014, 0.004, 0.014, x, G + 0.109, z), woodP);
    put(boxG(0.01, 0.014, 0.01, x, G + 0.1, z), LANTERN);
  }

  // bushes and hay bales round the houses
  for (const [x, z] of [
    [-0.52, 1.2],
    [0.62, 1.2],
    [1.0, 1.2],
    [-1.02, 1.22],
  ])
    put(ballG(0.035, 6, 4, x, G + 0.02, z), foliageP);
  for (const [x, z] of [
    [-0.62, 1.33],
    [0.9, 1.25],
  ])
    put(cylG(0.03, 0.03, 0.04, 8, x, G + 0.03, z, [0, 0, 90]), hayP);

  // villagers in the square and on the road
  villager(-0.08, 1.06, clothP.red, blackP);
  villager(0.09, 1.15, clothP.blue, blackP);
  villager(0.1, 1.38, clothP.green, blackP);
  villager(-0.11, 1.4, clothP.brown, blackP);
  villager(0.7, 0.6, clothP.yellow, blackP);

  // ---- farm: the barn, haystacks, fences, a cow, the windmill and the scarecrow
  house({ x: 1.31, z: 0.42, w: 0.16, d: 0.22, h: 0.12, wall: R.barn, roof: roofRedP }, barnP);
  put(coneG(0.07, 0.09, 8, 1.36, G + 0.045, 0.66), hayP);
  put(coneG(0.05, 0.07, 8, 1.2, G + 0.035, 0.72), hayP);
  fence(1.12, 0.28, 1.44, 0.28);
  fence(1.44, -0.42, 1.44, 0.28);
  fence(-1.44, 0, -1.19, 0);
  fence(-1.19, 0, -1.19, 0.72);
  fence(-1.19, 0.72, -1.44, 0.72);
  fence(-1.44, 0.72, -1.44, 0);
  animal(0.88, 0.85, 20, cowP, cowP, 0.09);

  put(cylG(0.045, 0.06, 0.2, 10, WM.x, G + 0.1, WM.z), woodP);
  put(coneG(0.066, 0.07, 10, WM.x, G + 0.235, WM.z), roofRedP);
  const hubY = G + 0.24;
  const hubZ = WM.z + 0.075;
  put(cylG(0.014, 0.014, 0.03, 6, WM.x, hubY, hubZ, [90, 0, 0]), woodP, rotor);
  for (const a of [0, 90, 180, 270]) {
    put(new THREE.BoxGeometry(0.012, 0.2, 0.012).translate(0, 0.1, 0).rotateZ(a * DEG).translate(WM.x, hubY, hubZ), woodP, rotor);
    put(new THREE.BoxGeometry(0.07, 0.16, 0.004).translate(0, 0.12, 0).rotateZ(a * DEG).translate(WM.x, hubY, hubZ), sailP, rotor);
  }

  put(boxG(0.008, 0.16, 0.008, SC.x, G + 0.08, SC.z), woodP);
  put(boxG(0.1, 0.008, 0.008, SC.x, G + 0.13, SC.z), woodP);
  put(boxG(0.03, 0.05, 0.02, SC.x, G + 0.1, SC.z), clothP.blue);
  put(ballG(0.014, 6, 4, SC.x, G + 0.165, SC.z), hayP);
  put(coneG(0.02, 0.03, 6, SC.x, G + 0.19, SC.z), blackP);

  // ---- the forest, the pond with its boat, dock, lilies and reeds, and the trees on the hill
  const forest: [number, number, "round" | "pine", number][] = [
    [-1.4, -1.3, "pine", 1.1],
    [-1.15, -1.38, "round", 1.0],
    [-0.95, -1.32, "pine", 0.9],
    [-1.42, -0.62, "round", 0.9],
    [-1.3, -0.5, "pine", 1.0],
    [-0.8, -1.4, "round", 1.0],
    [-1.05, -1.38, "pine", 1.2],
    [-1.38, 0.95, "round", 0.8],
    [1.4, -1.3, "round", 1.0],
    [1.3, -1.42, "pine", 1.0],
    [0.6, -1.4, "round", 0.9],
    [1.42, 0.95, "round", 0.9],
    [-0.55, -0.95, "round", 1.0],
    [0.62, -0.95, "pine", 0.9],
    [-0.25, -1.25, "round", 0.9],
    [0.85, -0.55, "round", 0.8],
    [1.4, 1.4, "round", 0.9],
    [-1.4, 1.4, "pine", 0.9],
    [-0.89, -0.63, "pine", 0.9],
    [0.78, 0.25, "round", 0.9],
    [-0.55, 0.48, "round", 0.8],
    [0.3, 0.63, "pine", 0.7],
  ];
  for (const [x, z, kind, s] of forest) tree(x, z, kind, s);
  for (const [x, z] of [
    [-0.85, -0.3],
    [0.95, 0.1],
    [-0.45, -1.15],
    [-1.1, -1.0],
    [-1.36, -1.12],
  ])
    put(ballG(0.035, 5, 4, x, groundY(x, z) + 0.005, z), stoneP);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.3;
    const x = POND.x + Math.cos(a) * 0.19;
    const z = POND.z + Math.sin(a) * 0.19;
    put(boxG(0.006, 0.05 + 0.02 * ((i * 7) % 3), 0.006, x, G + 0.03, z), foliageP);
  }
  put(boxG(0.075, 0.016, 0.026, POND.x + 0.03, G + 0.006, POND.z - 0.02, [0, 25, 0]), woodP);
  put(boxG(0.03, 0.01, 0.02, POND.x + 0.035, G + 0.016, POND.z - 0.018, [0, 25, 0]), woodP);
  put(boxG(0.1, 0.01, 0.1, -1.04, G + 0.005, -1.0), woodP);
  for (const z of [-1.05, -0.95]) put(boxG(0.008, 0.03, 0.008, -1.09, G + 0.015, z), woodP);
  const lilyTex = pixelArt([".ggg.", "gglgg", "ggggg", ".ggg."], { g: "#3f8a3a", l: "#6fb04a" });
  const lilies: [number, number][] = [];
  for (let i = 0; i < 7; i++) {
    const a = i * 2.1;
    const rr = 0.04 + (0.1 * ((i * 37) % 7)) / 7;
    lilies.push([POND.x + Math.cos(a) * rr, POND.z + Math.sin(a) * rr]);
  }
  b.cards(
    lilies.map(([x, z]) => frame([x, G + 0.003, z], [0, 1, 0])),
    lilyTex,
    { size: 0.03, lean: 90, flow: [1, 0, 0], mirror: true },
  );

  // a woodpile and a stump by the forest
  for (const [y, z] of [
    [G + 0.016, -0.31],
    [G + 0.016, -0.28],
    [G + 0.016, -0.25],
    [G + 0.046, -0.295],
    [G + 0.046, -0.265],
  ])
    put(cylG(0.016, 0.016, 0.1, 6, -1.32, y, z, [0, 0, 90]), woodP);
  put(cylG(0.035, 0.04, 0.04, 8, -1.22, G + 0.02, -0.24), trunkP);

  // sheep grazing in the paddock and on the farm lawn
  animal(-1.32, 0.18, 10, woolP, blackP, 0.06);
  animal(-1.26, 0.42, -20, woolP, blackP, 0.06);
  animal(-1.34, 0.6, 40, woolP, blackP, 0.06);
  animal(0.92, 0.6, 30, woolP, blackP, 0.06);
  animal(0.8, 0.7, -15, woolP, blackP, 0.06);

  // ---- grass tufts, wheat, and flower beds: textured cards on the meadows and the fields
  const tuftTex = pixelArt(["..l..", ".lgl.", "lgglg", "ggggg"], { l: "#86c45a", g: "#3f7a2c" });
  const wheatTex = pixelArt(
    [".y.y.", ".yyy.", "..y..", ".yyy.", "..y..", "..g..", "..g..", ".gg..", ".g..."],
    { y: "#ecc65a", g: "#6f9a2e" },
  );
  const flowerTex = pixelArt([".p.p.", "pypyp", ".p.p.", "..g..", "..g.."], { p: "#e8708a", y: "#f2d24a", g: "#3f7a2c" });
  const clearOfHill = (x: number, z: number) =>
    Math.hypot(x, z - CZ) > 1.2 && Math.hypot(x - POND.x, z - POND.z) > 0.22 && Math.hypot(x - SC.x, z - SC.z) > 0.14;
  const tufts = [
    ...scatter(90, 3, [-1.42, -0.95, -1.42, 0.75], clearOfHill),
    ...scatter(40, 4, [0.9, 1.42, -1.42, -1.0], clearOfHill),
  ];
  b.cards(
    tufts.map(([x, z]) => frame([x, groundY(x, z), z], [0, 1, 0])),
    tuftTex,
    { size: [0.03, 0.024], lean: 0, vary: 0.25, rng: rng(5), cross: true },
  );
  const wheat = [
    ...scatter(110, 6, [1.13, 1.42, -0.42, 0.26], () => true),
    ...scatter(120, 7, [0.8, 1.42, -1.42, -0.98], (x, z) => clearOfHill(x, z) && Math.hypot(x, z - CZ) > 1.18),
  ];
  b.cards(
    wheat.map(([x, z]) => frame([x, groundY(x, z), z], [0, 1, 0])),
    wheatTex,
    { size: [0.02, 0.036], lean: 0, vary: 0.2, rng: rng(8), cross: true },
  );
  const beds = roadHouses.flatMap((h) => [-0.4, 0, 0.4].map((k): [number, number] => [h.x + k * h.w, h.z + h.d / 2 + 0.02]));
  b.cards(
    beds.map(([x, z]) => frame([x, G, z], [0, 1, 0])),
    flowerTex,
    { size: [0.02, 0.02], lean: 0, vary: 0.2, rng: rng(14), cross: true },
  );

  return b.root;
}
