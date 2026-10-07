// Floating sky island diorama: ruined wind temple, waterfall, sakura and meadow trees, in a cel-shaded Genshin style.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { DEG, rng } from "../src/math";
import { catmull, spiral } from "../src/path";
import { cells, grain, mottle, paint, scales, spots } from "../src/paint";
import type { Frame } from "../src/frame";
import type { Fill } from "../src/context";
import { svg } from "../src/texture";
import { cel, zigzag } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Windrise Ruins, Floating Sky Island",
  description:
    "A cel-shaded floating island with a ruined wind temple and crystal altar, a waterfall spilling into the clouds, a sakura and a meadow tree, stepping stones, a stone bridge, lanterns and little story props.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type V = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Layout constants
const TOP = 1.5; // grass level
const SK = (TOP - 0.18) / 0.98; // vertical stretch of the rock body
const R = (a: number) =>
  1.18 * (1 + 0.09 * Math.sin(2 * a + 0.6) + 0.06 * Math.sin(3 * a + 2.1) + 0.035 * Math.sin(5 * a + 0.3));
const pol = (a: number, r: number): [number, number] => [r * Math.sin(a), r * Math.cos(a)];
const TC: [number, number] = [-0.12, -0.2]; // temple centre
const PLAT = TOP + 0.12; // temple floor height
const POND: [number, number] = [0.68, -0.1];
const AW = 0.38; // waterfall compass angle
const OUT: [number, number] = [Math.sin(AW), Math.cos(AW)];
const RIM = pol(AW, R(AW) - 0.035);
const TREE_S: [number, number] = [-0.8, 0.14]; // sakura
const TREE_G: [number, number] = [0.78, -0.62]; // meadow tree
const ARCH_Z = -0.84;

// ---------------------------------------------------------------------------------------------------------------
// Palette: every surface colour is a two-tone cel paint with a hue-shifted shadow.
const SHADE_GREEN = "#2f9c78";
const GRASS = cel(mottle("#8ce04c", "#6fd14f", { size: 0.32, seed: 3 }), SHADE_GREEN);
const SOIL = cel(mottle("#d29a63", "#c28a5c", { size: 0.2, seed: 4 }), "#8a5a5e");
const MOSS_C = "#7fd35a";
const STONE_MOT = mottle("#f2e6cb", "#e3d3ae", { size: 0.18, seed: 5 });
const STONE = cel(STONE_MOT, "#a9a3c4");
const mossy = (y0: number) =>
  cel(
    paint((p) => (p.y < y0 + 0.07 * zigzag((p.x * 0.8 + p.z) / 0.08) ? MOSS_C : STONE_MOT)),
    "#a9a3c4",
  );
const STONE_MOSS = mossy(TOP + 0.16);
const STONE_MOSS_LOW = mossy(TOP + 0.06);
const FLOOR = cel(
  scales(["#f3e9d2", "#eadcbc", "#f7f0de"], "#bcab8c", { size: 0.1, width: 0.14, seed: 2 }),
  "#aaa5c6",
);
const FLOOR_DARK = cel(scales(["#dccfb0", "#d2c3a2"], "#a89877", { size: 0.11, width: 0.14, seed: 6 }), "#8f8aae");
const GOLD = cel("#ffd964", "#d08a2e");
const WOOD = cel(grain("#b9774a", "#a3653f", { size: 0.03, axis: "y", seed: 2 }), "#6f4259");
const WOOD_L = cel("#d89a62", "#8d5560");
const BARK = cel(grain("#9a6a52", "#7c5046", { size: 0.03, axis: "y", seed: 3 }), "#4e3550");
const PINK = cel(mottle("#ffc6da", "#ffa5c4", { size: 0.22, seed: 7 }), "#d97bb0");
const LEAF_G = cel(mottle("#a4e55a", "#7fd458", { size: 0.22, seed: 8 }), "#2f9a74");
const PINE = cel(mottle("#4fbf6a", "#3aa862", { size: 0.2, seed: 9 }), "#1f7a7a");
const CLOUD = cel("#ffffff", "#dde5ff");
const strata = (p: THREE.Vector3, tones: string[]) => {
  const band = Math.floor((p.y + 0.04 * Math.sin(p.x * 7 + p.z * 5)) / 0.11);
  return tones[((band % tones.length) + tones.length) % tones.length];
};
const seam = (p: THREE.Vector3) => {
  const c = cells(p, 0.34, 4);
  return c.d2 - c.d1 < 0.055 && p.y < TOP - 0.4;
};
const ROCK = cel(
  paint((p) => (seam(p) ? "#7fe6d6" : strata(p, ["#cdbfc2", "#bdaebd", "#d6c6bc", "#aea1bc"]))),
  paint((p) => (seam(p) ? "#58c8d8" : strata(p, ["#b9afd8", "#ada3d2", "#c3b9db", "#a097c8"]))),
);
const ROCK_B = cel(mottle("#bdadba", "#ac9fb6", { size: 0.16, seed: 11 }), "#b1a8d4");
const RED = cel("#ee4a58", "#a8305f");
const CREAM = cel("#fff4dc", "#d9c3d6");
const TEAL_STONE = cel("#68d6c4", "#3a8fa6");
const CAPRED = cel(spots("#ff6a6a", "#fff3e0", { size: 0.03, amount: 0.4, seed: 2 }), "#b83a68");

// ---------------------------------------------------------------------------------------------------------------
// Textures (cards and glowing glyphs)
const LEAF = svg(
  `<svg viewBox="0 0 48 64"><path d="M24 62 C6 44 6 18 24 2 C42 18 42 44 24 62Z" fill="#9be45a"/><path d="M24 62 C42 44 42 18 24 2 C34 20 34 44 24 62Z" fill="#58b85a"/><path d="M24 60 L24 12" stroke="#2f9a6a" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
  { size: 96 },
);
const BLOSSOM = (() => {
  const petals = (cx: number, cy: number, s: number, rot: number) =>
    [0, 72, 144, 216, 288]
      .map(
        (a) =>
          `<path d="M0 0 C-10 -7 -11 -22 0 -24 C11 -22 10 -7 0 0Z" fill="#ffe6f0" stroke="#ff9fc0" stroke-width="1.6" transform="translate(${cx} ${cy}) rotate(${a + rot}) scale(${s})"/>`,
      )
      .join("") + `<circle cx="${cx}" cy="${cy}" r="${3.4 * s}" fill="#ffc94d"/>`;
  return svg(
    `<svg viewBox="0 0 64 64">${petals(20, 40, 0.85, 8)}${petals(44, 24, 0.8, 30)}${petals(40, 48, 0.62, 50)}</svg>`,
    { size: 128 },
  );
})();
const PETAL = svg(
  `<svg viewBox="0 0 32 32"><path d="M16 2 C28 8 28 24 16 30 C4 24 4 8 16 2Z" fill="#ffd0e2"/><path d="M16 2 C28 8 28 24 16 30 C22 20 22 10 16 2Z" fill="#ff9fc0"/></svg>`,
  { size: 64 },
);
const GRASS_TUFT = svg(
  `<svg viewBox="0 0 64 64"><path d="M8 64 C10 44 16 24 20 6 C26 26 26 46 24 64Z" fill="#6cd25a"/><path d="M22 64 C26 40 32 22 40 4 C44 26 40 48 38 64Z" fill="#92e45a"/><path d="M36 64 C40 46 50 30 58 18 C58 38 52 52 52 64Z" fill="#5cc062"/><path d="M40 64 C42 48 44 34 40 4 C46 30 46 48 46 64Z" fill="#43a566"/></svg>`,
  { size: 96 },
);
const flower = (petal: string, petal2: string, center: string) =>
  svg(
    `<svg viewBox="0 0 48 64"><path d="M24 64 C24 50 25 42 24 30" stroke="#3ea462" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M24 54 C14 52 10 46 8 40 C18 40 22 46 24 54Z" fill="#58b85a"/><g transform="translate(24 22)">${[0, 60, 120, 180, 240, 300]
      .map(
        (a) =>
          `<path d="M0 0 C-7 -5 -8 -15 0 -17 C8 -15 7 -5 0 0Z" fill="${a % 120 === 0 ? petal : petal2}" transform="rotate(${a})"/>`,
      )
      .join("")}<circle r="4.2" fill="${center}"/></g></svg>`,
    { size: 96 },
  );
const FLOWER_W = flower("#ffffff", "#d9f4ff", "#ffd45e");
const FLOWER_Y = flower("#ffe066", "#ffc43d", "#ff8a3d");
const FLOWER_B = flower("#9cc4ff", "#7ea6ff", "#fff3b0");
const FLOWER_P = flower("#ffa6cb", "#ff86b6", "#fff3b0");
const TASSEL = svg(
  `<svg viewBox="0 0 24 72"><path d="M9 0 L6.5 52 M15 0 L17.5 52 M12 0 L12 54" stroke="#ff7a85" stroke-width="1.6" fill="none"/><path d="M7 0 L5 60 Q12 72 19 60 L17 0Z" fill="#e8434f"/><path d="M12 0 L12 66" stroke="#b02a3e" stroke-width="1.6"/><rect x="5.5" y="18" width="13" height="4" fill="#ffd45e"/><circle cx="12" cy="62" r="5.5" fill="#ffd45e" stroke="#c9822e" stroke-width="1.2"/></svg>`,
  { size: 128 },
);
const VINE = svg(
  `<svg viewBox="0 0 28 80"><path d="M14 80 C10 60 18 44 13 26 C11 18 14 10 14 2" stroke="#3a9a60" stroke-width="2.6" fill="none" stroke-linecap="round"/>${[
    [12, 66, -1],
    [17, 54, 1],
    [11, 42, -1],
    [17, 32, 1],
    [12, 20, -1],
    [15, 9, 1],
  ]
    .map(
      ([x, y, d]) =>
        `<path d="M${x} ${y} C${x + d * 4} ${y - 6} ${x + d * 11} ${y - 5} ${x + d * 12} ${y} C${x + d * 9} ${y + 5} ${x + d * 3} ${y + 4} ${x} ${y}Z" fill="${d > 0 ? "#78d85a" : "#58bd5c"}"/>`,
    )
    .join("")}</svg>`,
  { size: 128 },
);
const PAD = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 32 L52 14 A28 28 0 1 1 28 5Z" fill="#58c868" transform="rotate(-20 32 32)"/><path d="M32 32 L50 40 A28 28 0 0 1 34 60Z" fill="#3ea066" opacity="0.9" transform="rotate(-20 32 32)"/><circle cx="32" cy="32" r="3" fill="#a4ec84"/></svg>`,
  { size: 96 },
);
const RUNE = svg(
  `<svg viewBox="0 0 200 200" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="100" cy="100" r="95" stroke="#ffd45e" stroke-width="4"/><circle cx="100" cy="100" r="86" stroke="#ffd45e" stroke-width="1.8"/>${Array.from(
    { length: 24 },
    (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      const r0 = 62 + (i % 2) * 6;
      return `<path d="M${100 + Math.sin(a) * r0} ${100 - Math.cos(a) * r0} L${100 + Math.sin(a) * 82} ${100 - Math.cos(a) * 82}" stroke="#7ff2dc" stroke-width="${i % 2 ? 2.4 : 3.4}"/>`;
    },
  ).join(
    "",
  )}<circle cx="100" cy="100" r="58" stroke="#7ff2dc" stroke-width="3.4"/><path d="M100 46 L146.8 127 L53.2 127Z M100 154 L53.2 73 L146.8 73Z" stroke="#7ff2dc" stroke-width="2.6"/><circle cx="100" cy="100" r="22" stroke="#ffd45e" stroke-width="3"/><path d="M100 84 L108 100 L100 116 L92 100Z" fill="#c9fff3"/></svg>`,
  { size: 512 },
);
const GLYPH = svg(
  `<svg viewBox="0 0 40 80" fill="none" stroke="#7ff2dc" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6 H32 V22 H8Z"/><path d="M20 6 V22 M8 14 H32"/><path d="M20 30 L8 44 L20 58 L32 44Z"/><path d="M20 36 V52"/><path d="M8 66 Q20 74 32 66 M14 74 Q20 78 26 74"/></svg>`,
  { size: 128 },
);
const FILIGREE = svg(
  `<svg viewBox="0 0 256 32" fill="none" stroke="#ffd45e" stroke-width="2.6" stroke-linecap="round"><defs><g id="s"><path d="M4 16 C4 5 22 5 22 15 C22 22 13 22 13 16"/><path d="M22 16 C22 27 40 27 40 17 C40 10 31 10 31 16"/></g></defs>${Array.from(
    { length: 6 },
    (_, i) => `<use href="#s" x="${i * 42}"/>`,
  ).join("")}<path d="M2 3 H254 M2 29 H254" stroke-width="2"/></svg>`,
  { size: 512 },
);
const SPARK = svg(
  `<svg viewBox="0 0 32 32"><path d="M16 1 L19 13 L31 16 L19 19 L16 31 L13 19 L1 16 L13 13Z" fill="#e9fff9"/></svg>`,
  { size: 64 },
);

// ---------------------------------------------------------------------------------------------------------------
// Builder, skeleton and helpers
const b = createBuilder({ name: "floatingIslandDioramaSonnet", paintSize: 2048 });
const r = rng(11);
const ISL = b.joint("island", { at: [0, 0.55, 0] });
const CRYSTAL_AT: V = [TC[0], PLAT + 0.62, TC[1]];
const crystalJ = b.joint("crystalSpin", { parent: ISL, at: CRYSTAL_AT, dir: [0, 1, 0], role: "hinge" });
const SWING_AT: V = [TREE_S[0] - 0.02, TOP + 0.62, TREE_S[1] + 0.34];
const swingJ = b.joint("swing", { parent: ISL, at: SWING_AT, dir: [0, -1, 0], role: "hinge" });
const PIN_AT: V = [0.26, TOP + 0.33, 0.9];
const pinJ = b.joint("pinwheel", { parent: ISL, at: PIN_AT, dir: [0, 0, 1], role: "hinge" });
const CHIME_AT: V = [TC[0] + 0.16, TOP + 0.77, ARCH_Z + 0.02];
const chimeJ = b.joint("chime", { parent: ISL, at: CHIME_AT, dir: [0, -1, 0], role: "hinge" });

type PartOpts = NonNullable<Parameters<typeof b.part>[2]>;
type ExtOpts = Parameters<typeof b.extrude>[1];
type LatheOpts = Parameters<typeof b.lathe>[1];
type SweepOpts = NonNullable<Parameters<typeof b.sweep>[2]>;
type SweepSrc = Parameters<typeof b.sweep>[0];
type SweepRad = Parameters<typeof b.sweep>[1];
const put = (geo: THREE.BufferGeometry, color: Fill, o: PartOpts = {}) =>
  b.part(geo, color, { bone: ISL, ...o });
const ext = (outline: OutlinePoint[], o: ExtOpts) => b.extrude(outline, { bone: ISL, ...o });
const lat = (outline: OutlinePoint[], o: LatheOpts) => b.lathe(outline, { bone: ISL, ...o });
const swp = (src: SweepSrc, rad: SweepRad, o: SweepOpts = {}) => b.sweep(src, rad, { bone: ISL, ...o });
const up = (x: number, z: number, y = TOP) => frame([x, y, z], [0, 1, 0]);

function G<T extends THREE.BufferGeometry>(g: T, at: V, rot: V = [0, 0, 0], sc: number | V = 1): T {
  const s = typeof sc === "number" ? ([sc, sc, sc] as V) : sc;
  g.applyMatrix4(
    new THREE.Matrix4().compose(
      new THREE.Vector3(...at),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG)),
      new THREE.Vector3(...s),
    ),
  );
  return g;
}
const hash = (x: number, y: number, z: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
};
/** A rough boulder: icosahedron with its vertices pushed about, so every facet differs. */
function rockGeo(radius: number, detail = 0, amt = 0.28, seed = 0) {
  const g = new THREE.IcosahedronGeometry(1, detail);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      y = p.getY(i),
      z = p.getZ(i);
    const k = radius * (1 + (hash(Math.round(x * 1e3), Math.round(y * 1e3), Math.round(z * 1e3) + seed) - 0.5) * amt);
    p.setXYZ(i, x * k, y * k, z * k);
  }
  return g;
}

const flatBatches = new Map<Fill, THREE.BufferGeometry[]>();
const smoothBatches = new Map<Fill, THREE.BufferGeometry[]>();
const glowBatches = new Map<string, { strength: number; geos: THREE.BufferGeometry[] }>();
function plain(geo: THREE.BufferGeometry) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  for (const k of Object.keys(g.attributes)) if (!["position", "normal", "uv"].includes(k)) g.deleteAttribute(k);
  return g;
}
/** Queues a geometry (already in model space) to be merged with every other of its colour. */
function M(color: Fill, geo: THREE.BufferGeometry, smooth = false) {
  const map = smooth ? smoothBatches : flatBatches;
  const list = map.get(color) ?? [];
  list.push(plain(geo));
  map.set(color, list);
}
function GL(color: string, geo: THREE.BufferGeometry, strength = 1) {
  const key = `${color}@${strength}`;
  const e = glowBatches.get(key) ?? { strength, geos: [] };
  e.geos.push(plain(geo));
  glowBatches.set(key, e);
}
function flush() {
  for (const [color, geos] of flatBatches)
    if (geos.length) put(mergeGeometries(geos)!, color, { at: [0, 0, 0], flat: true, name: "merged" });
  for (const [color, geos] of smoothBatches)
    if (geos.length) put(mergeGeometries(geos)!, color, { at: [0, 0, 0], name: "mergedSmooth" });
  for (const [key, e] of glowBatches)
    glow(put(mergeGeometries(e.geos)!, key.split("@")[0], { at: [0, 0, 0], flat: true, name: "glowMerged" }), e.strength);
}

const clearOf: { x: number; z: number; r: number }[] = [];
const streamPts: V[] = [
  [POND[0] - 0.04, TOP + 0.012, POND[1] + 0.2],
  [0.62, TOP + 0.012, 0.32],
  [0.68, TOP + 0.012, 0.55],
  [0.58, TOP + 0.012, 0.8],
  [0.5, TOP + 0.012, 1.0],
  [RIM[0], TOP + 0.012, RIM[1]],
];
const stream = catmull(streamPts);
const nearStream = (x: number, z: number) => {
  let d = 9;
  for (let i = 0; i <= 40; i++) {
    const q = stream.at(i / 40);
    d = Math.min(d, Math.hypot(q.x - x, q.z - z));
  }
  return d;
};
const inIsland = (x: number, z: number, m: number) => Math.hypot(x, z) < R(Math.atan2(x, z)) - m;
const isFree = (x: number, z: number, m = 0) =>
  inIsland(x, z, 0.1 + m) && nearStream(x, z) > 0.14 + m && clearOf.every((c) => Math.hypot(x - c.x, z - c.z) > c.r + m);
clearOf.push(
  { x: TC[0], z: TC[1] + 0.05, r: 0.62 },
  { x: TC[0], z: 0.4, r: 0.2 },
  { x: POND[0], z: POND[1], r: 0.36 },
  { x: TREE_S[0], z: TREE_S[1], r: 0.12 },
  { x: TREE_G[0], z: TREE_G[1], r: 0.14 },
  { x: TC[0], z: ARCH_Z, r: 0.62 },
  { x: -0.12, z: 0.75, r: 0.2 },
  { x: PIN_AT[0], z: PIN_AT[2], r: 0.08 },
  { x: -0.5, z: 0.5, r: 0.28 },
  { x: -0.3, z: 0.78, r: 0.08 },
  { x: 0.62, z: 0.45, r: 0.28 },
);

// ---------------------------------------------------------------------------------------------------------------
// 1. The island: grass-and-soil slab, faceted rock body, stalactites, crystals, roots
function islandOutline(scale: number, n: number, jit: number, seed: number): OutlinePoint[] {
  const q = rng(seed);
  const pts: OutlinePoint[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = R(a) * scale * (1 + jit * (q() - 0.5));
    pts.push([rr * Math.sin(a), -rr * Math.cos(a)]);
  }
  return pts;
}
const GRASS_OR_SOIL = paint((p, n) =>
  n.y > 0.5 ? GRASS : p.y > TOP - 0.075 - 0.055 * zigzag((p.x * 1.0 + p.z * 0.6) / 0.14) ? GRASS : SOIL,
);
ext(islandOutline(1.0, 40, 0.05, 21), {
  at: [0, TOP - 0.11, 0],
  x: [1, 0, 0],
  y: [0, 0, -1],
  thickness: 0.22,
  bevel: 0.035,
  smoothing: 1,
  color: GRASS_OR_SOIL,
  name: "islandTurf",
});
// carved stone foundation band under the turf, trimmed in gold, with glowing glyph tiles
const BAND_N = 28;
const bandOutline = (scale: number): OutlinePoint[] =>
  Array.from({ length: BAND_N }, (_, i) => {
    const a = (i / BAND_N) * Math.PI * 2;
    return [R(a) * scale * Math.sin(a), -R(a) * scale * Math.cos(a)] as OutlinePoint;
  });
ext(bandOutline(0.955), { at: [0, TOP - 0.265, 0], x: [1, 0, 0], y: [0, 0, -1], thickness: 0.1, bevel: 0.008, color: cel(scales(["#f3e8cf", "#ebdcbc", "#f7efdc"], "#b9a888", { size: 0.1, width: 0.12, seed: 9 }), "#a8a2c6"), name: "foundationBand" });
ext(bandOutline(0.962), { at: [0, TOP - 0.216, 0], x: [1, 0, 0], y: [0, 0, -1], thickness: 0.014, bevel: 0.004, color: GOLD, name: "bandTrimTop" });
ext(bandOutline(0.962), { at: [0, TOP - 0.312, 0], x: [1, 0, 0], y: [0, 0, -1], thickness: 0.014, bevel: 0.004, color: GOLD, name: "bandTrimBottom" });

const RINGS: [number, number][] = (
  [
    [0.98, 0.9],
    [0.84, 0.92],
    [0.7, 0.84],
    [0.54, 0.68],
    [0.38, 0.48],
    [0.22, 0.27],
    [0.1, 0.1],
  ] as [number, number][]
).map(([y, s]) => [y * SK, s]);
const scAt = (y: number) => {
  for (let i = 0; i < RINGS.length - 1; i++) {
    const [y0, s0] = RINGS[i];
    const [y1, s1] = RINGS[i + 1];
    if (y <= y0 && y >= y1) return s1 + ((s0 - s1) * (y - y1)) / (y0 - y1);
  }
  return 0.05;
};
function underRock() {
  const q = rng(31);
  const n = 13;
  const pos: number[] = [];
  for (const [y, sc] of RINGS)
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rr = R(a) * sc * (0.86 + 0.26 * q());
      pos.push(rr * Math.sin(a), y + (q() - 0.5) * 0.06, rr * Math.cos(a));
    }
  pos.push(0.015, 0, 0.01);
  const apex = RINGS.length * n;
  const idx: number[] = [];
  const tri = (a: number, bb: number, c: number) => {
    const A = new THREE.Vector3(pos[a * 3], pos[a * 3 + 1], pos[a * 3 + 2]);
    const B = new THREE.Vector3(pos[bb * 3], pos[bb * 3 + 1], pos[bb * 3 + 2]);
    const C = new THREE.Vector3(pos[c * 3], pos[c * 3 + 1], pos[c * 3 + 2]);
    const nrm = B.clone().sub(A).cross(C.clone().sub(A));
    const mid = A.clone().add(B).add(C).divideScalar(3).sub(new THREE.Vector3(0, 0.75, 0));
    if (nrm.dot(mid) >= 0) idx.push(a, bb, c);
    else idx.push(a, c, bb);
  };
  for (let k = 0; k < RINGS.length - 1; k++)
    for (let i = 0; i < n; i++) {
      const a = k * n + i;
      const bb = k * n + ((i + 1) % n);
      const c = (k + 1) * n + ((i + 1) % n);
      const d = (k + 1) * n + i;
      tri(a, bb, c);
      tri(a, c, d);
    }
  const last = (RINGS.length - 1) * n;
  for (let i = 0; i < n; i++) tri(last + i, last + ((i + 1) % n), apex);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}
put(underRock(), ROCK, { at: [0, 0, 0], flat: true, name: "islandRock" });

// boulders jutting from the flank
for (let i = 0; i < 9; i++) {
  const a = (i / 9) * Math.PI * 2 + 0.3 + r() * 0.3;
  const y = (0.86 - r() * 0.55) * SK;
  const rr = R(a) * scAt(y) * 0.96;
  const size = 0.1 + 0.07 * r() + (y > 0.6 ? 0.04 : 0);
  M(i % 2 ? ROCK_B : ROCK, G(rockGeo(size, 0, 0.45, i), [rr * Math.sin(a), y, rr * Math.cos(a)], [r() * 90, r() * 360, 0], [1, 0.8, 1]));
}
// stalactites under the rim
for (let i = 0; i < 12; i++) {
  const a = (i / 12) * Math.PI * 2 + 0.1 + r() * 0.2;
  const y = (0.9 - r() * 0.35) * SK;
  const rr = R(a) * scAt(y) * 0.9;
  const len = 0.22 + 0.2 * r();
  const [px, pz] = pol(a, rr);
  M(ROCK_B, G(new THREE.ConeGeometry(0.045 + 0.025 * r(), len, 5), [px, y - len / 2 + 0.03, pz], [180, r() * 360, 0]));
}
// glowing crystal clusters on the underside
const CRYS: { a: number; y: number; s: number }[] = [
  { a: 0.9, y: 0.62, s: 1.0 },
  { a: 2.5, y: 0.7, s: 1.2 },
  { a: 4.0, y: 0.55, s: 0.9 },
  { a: 5.3, y: 0.72, s: 1.1 },
  { a: 3.3, y: 0.34, s: 0.8 },
  { a: 1.7, y: 0.28, s: 0.7 },
  { a: -0.4, y: 0.52, s: 1.4 },
  { a: 0.15, y: 0.3, s: 1.0 },
  { a: -1.2, y: 0.4, s: 1.1 },
];
for (const c0 of CRYS) {
  const c = { ...c0, y: c0.y * SK };
  const rr = R(c.a) * scAt(c.y) * 0.92;
  const [px, pz] = pol(c.a, rr);
  const out = new THREE.Vector3(Math.sin(c.a), -0.55, Math.cos(c.a)).normalize();
  for (let k = 0; k < 4; k++) {
    const dir = out.clone().add(new THREE.Vector3((r() - 0.5) * 0.8, (r() - 0.5) * 0.6, (r() - 0.5) * 0.8)).normalize();
    const h = (0.2 + 0.14 * r()) * c.s;
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    const e = new THREE.Euler().setFromQuaternion(quat);
    const g = new THREE.ConeGeometry(0.05 * c.s, h, 5);
    GL(k % 2 ? "#6ff0d6" : "#58d4f2", G(g, [px + dir.x * h * 0.35, c.y + dir.y * h * 0.35, pz + dir.z * h * 0.35], [e.x / DEG, e.y / DEG, e.z / DEG]), 1.2);
  }
  M(ROCK_B, G(rockGeo(0.07 * c.s, 0, 0.4, 3), [px, c.y, pz]));
}
// glowing glyph tiles on the foundation band
for (let i = 0; i < BAND_N / 2; i++) {
  const a = ((2 * i + 1) * Math.PI) / BAND_N;
  const [px, pz] = pol(a, R(a) * 0.955 * 0.9937 + 0.004);
  GL(i % 3 === 0 ? "#ffd45e" : "#7ff2dc", G(new THREE.BoxGeometry(0.06, 0.05, 0.012), [px, TOP - 0.265, pz], [0, a / DEG, 0]), 1);
}
// hanging roots
for (let i = 0; i < 9; i++) {
  const a = 0.4 + i * 0.7 + r() * 0.3;
  const [x0, z0] = pol(a, R(a) * 0.97);
  const [x1, z1] = pol(a, R(a) * 0.9);
  const [x2, z2] = pol(a, R(a) * (0.84 + 0.1 * r()));
  const ln = 0.25 + 0.3 * r();
  swp(catmull([[x0, TOP - 0.1, z0], [x1, TOP - 0.2, z1], [x2, TOP - 0.2 - ln, z2]]), [0.022, 0.003], {
    color: BARK,
    sides: 5,
    caps: { start: "flat", end: "point" },
  });
}
// vines hanging over the rim
{
  const frames = [];
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2 + r() * 0.15;
    if (Math.abs(a - AW) < 0.3) continue;
    const [x, z] = pol(a, R(a) - 0.01);
    frames.push(up(x, z, TOP - 0.07 - 0.04 * r()));
  }
  b.cards(frames, VINE, {
    size: [0.09, 0.26],
    lean: 180,
    flow: (f) => [f.at.x, 0, f.at.z],
    vary: 0.4,
    rng: rng(5),
    bone: ISL,
  });
}

// ---------------------------------------------------------------------------------------------------------------
// 2. Water: pond, stream, bridge, waterfall, mist
const WATER = paint((_p, _n, s) => {
  const w = zigzag(s[0] * stream.length * 3.4 + 0.5 * Math.sin(s[1] / 25));
  return w < 0.14 ? "#c8f6ff" : "#46c9f0";
});
const POND_WATER = paint((p) => {
  const d = Math.hypot(p.x - POND[0], p.z - POND[1]);
  const ring = zigzag(d / 0.065);
  return d < 0.05 || (ring < 0.1 && d < 0.22) ? "#bff3ff" : d > 0.2 ? "#2fb7e8" : "#44c8f1";
});
swp(stream, (t) => [0.062 + 0.03 * t, 0.014], {
  section: "box",
  color: WATER,
  caps: "flat",
  name: "stream",
});
put(new THREE.CylinderGeometry(0.255, 0.255, 0.03, 16), POND_WATER, { at: [POND[0], TOP + 0.01, POND[1]], name: "pondWater" });
// pond rim stones and stream bank stones
for (let i = 0; i < 18; i++) {
  const a = (i / 18) * Math.PI * 2;
  const rr = 0.27 + 0.02 * r();
  M(i % 3 ? ROCK_B : STONE, G(rockGeo(0.04 + 0.025 * r(), 0, 0.4, i), [POND[0] + rr * Math.sin(a), TOP + 0.018, POND[1] + rr * Math.cos(a)], [0, r() * 360, 0], [1.1, 0.7, 1]));
}
for (let i = 1; i < 26; i++) {
  const t = i / 26;
  const c = stream.at(t);
  const tg = stream.tangentAt(t);
  const side = i % 2 ? 1 : -1;
  const wid = 0.062 + 0.03 * t + 0.03 + 0.012 * r();
  M(i % 3 ? ROCK_B : STONE, G(rockGeo(0.022 + 0.018 * r(), 0, 0.4, i + 40), [c.x - tg.z * wid * side, TOP + 0.014, c.z + tg.x * wid * side], [0, r() * 360, 0], [1, 0.7, 1]));
}
// lily pads and lotus
b.cards(
  [[-0.1, 0.06], [0.08, -0.12], [0.02, 0.1], [-0.07, -0.08], [0.12, 0.05]].map(([dx, dz]) => up(POND[0] + dx, POND[1] + dz, TOP + 0.027)),
  PAD,
  { size: [0.075, 0.075], lean: 90, flow: (_f, i) => [Math.cos(i * 2.1), 0, Math.sin(i * 2.1)], mirror: true, vary: 0.2, rng: rng(8), bone: ISL },
);
for (const [dx, dz] of [[-0.08, 0.04], [0.09, -0.1]]) {
  const x = POND[0] + dx;
  const z = POND[1] + dz;
  for (let k = 0; k < 6; k++) M(cel("#ffb8d4", "#d97bb0"), G(new THREE.ConeGeometry(0.014, 0.05, 4), [x + Math.sin(k) * 0.016, TOP + 0.052, z + Math.cos(k) * 0.016], [Math.cos(k) * 40, 0, -Math.sin(k) * 40]));
  M(GOLD, G(new THREE.SphereGeometry(0.01, 5, 4), [x, TOP + 0.045, z]));
}
// two koi
for (const [x, z, a] of [[0.55, -0.05, 0.5], [0.77, -0.17, 3.4]]) {
  const f = (v: V) => [x + v[0] * Math.cos(a) + v[2] * Math.sin(a), TOP + 0.02 + v[1], z - v[0] * Math.sin(a) + v[2] * Math.cos(a)] as V;
  M("#ff8a3d", G(new THREE.SphereGeometry(0.025, 6, 4), f([0, 0, 0]), [0, a / DEG, 0], [0.7, 0.5, 1.7]));
  M("#fff3e0", G(new THREE.SphereGeometry(0.014, 5, 4), f([0, 0.008, 0.01]), [0, a / DEG, 0], [0.8, 0.5, 1.2]));
  M("#ff8a3d", G(new THREE.ConeGeometry(0.02, 0.04, 4), f([0, 0, -0.058]), [90, a / DEG, 0], [1, 1, 0.3]));
}

// stone bridge across the stream
{
  const bx = 0.63, bz = 0.44;
  const bridge: OutlinePoint[] = [[-0.26, 0], [-0.26, 0.05]];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    bridge.push([-0.2 + 0.4 * t, 0.05 + 0.1 * Math.sin(Math.PI * t)]);
  }
  bridge.push([0.26, 0.05], [0.26, 0], [0.16, 0], [0.1, 0.075, ], [-0.1, 0.075], [-0.16, 0]);
  ext(bridge, { at: [bx, TOP, bz], x: [1, 0, 0], thickness: 0.2, bevel: 0.008, color: STONE_MOSS_LOW, name: "bridge" });
  for (const s of [1, -1]) {
    const zz = bz + s * 0.095;
    swp([[bx - 0.2, TOP + 0.06, zz], [bx - 0.1, TOP + 0.15, zz], [bx, TOP + 0.18, zz], [bx + 0.1, TOP + 0.15, zz], [bx + 0.2, TOP + 0.06, zz]], 0.013, { color: GOLD, sides: 6, name: "bridgeRail" });
    for (const k of [-0.2, -0.1, 0, 0.1, 0.2]) {
      const hh = 0.06 + 0.12 * (1 - Math.abs(k / 0.2) ** 2) ;
      M(STONE, G(new THREE.BoxGeometry(0.03, hh + 0.03, 0.03), [bx + k, TOP + 0.03 + hh / 2 + 0.02, zz]));
      M(GOLD, G(new THREE.SphereGeometry(0.02, 6, 4), [bx + k, TOP + 0.05 + hh + 0.02, zz]));
    }
  }
}

// the waterfall
const fallPts: V[] = [
  [RIM[0], TOP + 0.012, RIM[1]],
  [RIM[0] + OUT[0] * 0.07, TOP - 0.035, RIM[1] + OUT[1] * 0.07],
  [RIM[0] + OUT[0] * 0.13, TOP - 0.3, RIM[1] + OUT[1] * 0.13],
  [RIM[0] + OUT[0] * 0.15, 0.85, RIM[1] + OUT[1] * 0.15],
  [RIM[0] + OUT[0] * 0.16, 0.34, RIM[1] + OUT[1] * 0.16],
];
const FALL = paint((p) => {
  const lt = p.x * OUT[1] - p.z * OUT[0];
  const w = zigzag(lt / 0.05 + 0.3 * Math.sin(p.y * 7 + lt * 28));
  if (p.y > TOP - 0.05 || p.y < 0.42) return w < 0.5 ? "#f2fdff" : "#a9ecfb";
  return w < 0.2 ? "#d9f8ff" : w < 0.58 ? "#7fdcf6" : "#4cc4ee";
});
swp(catmull(fallPts), (t) => [0.125 + 0.03 * t, 0.022], {
  section: "box",
  up: [OUT[0], 0, OUT[1]],
  color: FALL,
  caps: "flat",
  name: "waterfall",
});
for (const k of [-0.05, 0.03, 0.08]) {
  const px = OUT[1] * k;
  const pz = -OUT[0] * k;
  swp(
    catmull(fallPts.map((p, i) => [p[0] + px + OUT[0] * 0.025, p[1] - (i === 4 ? 0.02 : 0), p[2] + pz + OUT[1] * 0.025] as V)),
    0.007,
    { color: "#f4feff", sides: 4, caps: "flat", name: "fallStreak" },
  );
}
// stone gate pieces at the lip
for (const s of [1, -1]) {
  const px = OUT[1] * s * 0.145;
  const pz = -OUT[0] * s * 0.145;
  M(STONE_MOSS_LOW, G(rockGeo(0.08, 0, 0.35, 5 + s), [RIM[0] + px, TOP + 0.03, RIM[1] + pz], [0, r() * 360, 0], [1, 0.75, 1]));
}
// spray, drops and mist
for (let i = 0; i < 22; i++) {
  const y = 0.34 + r() * (TOP - 0.4);
  const lt = (r() - 0.5) * 0.3;
  const o = 0.17 + r() * 0.1;
  M("#e6fbff", G(new THREE.SphereGeometry(0.008 + 0.01 * r(), 5, 4), [RIM[0] + OUT[0] * o + OUT[1] * lt, y, RIM[1] + OUT[1] * o - OUT[0] * lt]), false);
}

// ---------------------------------------------------------------------------------------------------------------
// 3. Temple ruins: platform, stairs, columns, altar, glowing seal
const hexTier = (rad: number, h: number, y: number, col: Fill) =>
  put(new THREE.CylinderGeometry(rad, rad * 1.03, h, 6), col, { at: [TC[0], y + h / 2, TC[1]], rotation: [0, 30, 0], name: "tier" });
hexTier(0.5, 0.06, TOP, FLOOR_DARK);
hexTier(0.42, 0.06, TOP + 0.06, FLOOR);
// gold inlay ring + glowing seal
lat([[0.3, 0], [0.315, 0], [0.315, 0.005], [0.3, 0.005]], { at: [TC[0], PLAT, TC[1]], segments: 24, color: GOLD, name: "inlayRing" });
glow(put(new THREE.PlaneGeometry(0.66, 0.66), "#ffffff", { at: [TC[0], PLAT + 0.006, TC[1]], dir: [0, 1, 0], axis: "z", up: [0, 0, -1], texture: RUNE, name: "seal" }), 1);
// stairs
M(FLOOR_DARK, G(new THREE.BoxGeometry(0.42, 0.04, 0.1), [TC[0], TOP + 0.02, TC[1] + 0.43 + 0.05]));
M(FLOOR_DARK, G(new THREE.BoxGeometry(0.34, 0.03, 0.1), [TC[0] + 0.0, TOP + 0.015, TC[1] + 0.43 + 0.1]));
// stair cheek walls and lanterns
function stoneLantern(x: number, y: number, z: number, s = 1) {
  M(STONE, G(new THREE.CylinderGeometry(0.05 * s, 0.06 * s, 0.03 * s, 6), [x, y + 0.015 * s, z]));
  M(STONE, G(new THREE.CylinderGeometry(0.02 * s, 0.025 * s, 0.1 * s, 6), [x, y + 0.08 * s, z]));
  M(GOLD, G(new THREE.CylinderGeometry(0.032 * s, 0.032 * s, 0.01 * s, 6), [x, y + 0.135 * s, z]));
  M(STONE, G(new THREE.CylinderGeometry(0.05 * s, 0.05 * s, 0.012 * s, 4), [x, y + 0.146 * s, z], [0, 45, 0]));
  GL("#ffd27a", G(new THREE.BoxGeometry(0.058 * s, 0.062 * s, 0.058 * s), [x, y + 0.183 * s, z]), 1.4);
  for (const sx of [1, -1]) for (const sz of [1, -1]) M(STONE, G(new THREE.BoxGeometry(0.012 * s, 0.07 * s, 0.012 * s), [x + sx * 0.03 * s, y + 0.183 * s, z + sz * 0.03 * s]));
  M(STONE, G(new THREE.ConeGeometry(0.058 * s, 0.06 * s, 4), [x, y + 0.247 * s, z], [0, 45, 0]));
  M(GOLD, G(new THREE.SphereGeometry(0.012 * s, 6, 4), [x, y + 0.285 * s, z]));
}
for (const s of [1, -1]) {
  const x = TC[0] + s * 0.25;
  const cheek: OutlinePoint[] = [[0, 0], [0.2, 0], [0.2, 0.05], [0.06, 0.12], [0, 0.12]];
  ext(cheek, { at: [x + s * 0.03, TOP, TC[1] + 0.54], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.06, bevel: 0.006, color: STONE_MOSS_LOW, name: "stairCheek" });
  stoneLantern(x + s * 0.03, TOP + 0.12, TC[1] + 0.47, 1);
}

// columns
function column(a: number, h: number, broken: boolean, seed: number) {
  const x = TC[0] + 0.4 * Math.sin(a * DEG);
  const z = TC[1] + 0.4 * Math.cos(a * DEG);
  const prof: OutlinePoint[] = [[0, 0], [0.095, 0], [0.095, 0.03], [0.078, 0.045], [0.062, 0.065], [0.056, h * 0.5], [0.052, broken ? h : h - 0.1]];
  if (!broken) prof.push([0.075, h - 0.07], [0.086, h - 0.04], [0.108, h - 0.028], [0.108, h]);
  prof.push([0, broken ? h : h]);
  lat(prof, { at: [x, PLAT, z], segments: 8, spin: seed * 7, color: STONE_MOSS, name: "column" });
  M(GOLD, G(new THREE.TorusGeometry(0.063, 0.008, 4, 8), [x, PLAT + 0.09, z], [90, 22.5, 0]));
  if (!broken) {
    M(GOLD, G(new THREE.TorusGeometry(0.058, 0.008, 4, 8), [x, PLAT + h - 0.115, z], [90, 22.5, 0]));
    M(GOLD, G(new THREE.CylinderGeometry(0.111, 0.111, 0.008, 8), [x, PLAT + h - 0.012, z], [0, 22.5, 0]));
    for (let k = 0; k < 4; k++) M(GOLD, G(new THREE.BoxGeometry(0.014, 0.05, 0.004), [x + 0.06 * Math.sin(k * 1.571), PLAT + h * 0.5, z + 0.06 * Math.cos(k * 1.571)], [0, k * 90, 0]));
  } else {
    M(STONE_MOSS, G(new THREE.ConeGeometry(0.05, 0.07, 5), [x, PLAT + h + 0.025, z], [seed * 7, seed * 50, seed * 5]));
  }
}
column(30, 0.74, false, 1);
column(90, 0.74, false, 2);
column(150, 0.36, true, 3);
column(210, 0.74, false, 4);
column(270, 0.5, true, 5);
column(330, 0.74, false, 6);
// architrave between front columns and the east pair, plus gold trim and hanging tassels
{
  const xs = TC[0] + 0.4 * Math.sin(30 * DEG);
  const xw = TC[0] - 0.4 * Math.sin(30 * DEG);
  const zf = TC[1] + 0.4 * Math.cos(30 * DEG);
  const yb = PLAT + 0.74 + 0.035;
  M(STONE_MOSS, G(new THREE.BoxGeometry(xs - xw + 0.2, 0.07, 0.12), [TC[0], yb, zf]));
  M(GOLD, G(new THREE.BoxGeometry(xs - xw + 0.22, 0.014, 0.13), [TC[0], yb - 0.037, zf]));
  M(GOLD, G(new THREE.BoxGeometry(xs - xw + 0.22, 0.014, 0.13), [TC[0], yb + 0.037, zf]));
  for (let k = -3; k <= 3; k++) M(GOLD, G(new THREE.SphereGeometry(0.012, 5, 4), [TC[0] + k * 0.062, yb, zf + 0.064]));
  const ex = TC[0] + 0.4;
  M(STONE_MOSS, G(new THREE.BoxGeometry(0.12, 0.07, 0.4), [ex, yb, TC[1] + 0.0], [0, 0, 0]));
  put(new THREE.PlaneGeometry((xs - xw) * 0.95, 0.065), "#ffffff", { at: [TC[0], yb, zf + 0.0615], dir: [0, 0, 1], axis: "z", texture: FILIGREE, name: "filigree" });
  b.cards(
    [-0.16, -0.08, 0, 0.08, 0.16].map((k) => up(TC[0] + k, zf + 0.075, yb - 0.04)),
    TASSEL,
    { size: [0.035, 0.13], lean: 180, flow: [0, 0, 1], vary: 0.12, rng: rng(3), bone: ISL },
  );
  // rope garland sagging across the front, tied to the gold ring
  swp(catmull([[xw - 0.02, yb - 0.06, zf + 0.09], [TC[0], yb - 0.13, zf + 0.1], [xs + 0.02, yb - 0.06, zf + 0.09]]), 0.007, { color: "#ff6a7a", sides: 4, name: "garland" });
}
// fallen column drum and blocks on the platform
M(STONE_MOSS_LOW, G(new THREE.CylinderGeometry(0.055, 0.055, 0.2, 8), [TC[0] - 0.25, PLAT + 0.055, TC[1] + 0.12], [90, 0, 62]));
M(GOLD, G(new THREE.TorusGeometry(0.058, 0.007, 4, 8), [TC[0] - 0.25 + 0.1 * Math.cos(62 * DEG) * -0.0, PLAT + 0.055, TC[1] + 0.12], [0, 28, 0]));
M(STONE_MOSS_LOW, G(new THREE.BoxGeometry(0.12, 0.06, 0.09), [TC[0] + 0.3, PLAT + 0.03, TC[1] - 0.16], [0, 25, 0]));

// altar
lat([[0, 0], [0.12, 0], [0.12, 0.02], [0.1, 0.035], [0.075, 0.06], [0.07, 0.17], [0.09, 0.2], [0.11, 0.24], [0.11, 0.26], [0.0, 0.26]], { at: [TC[0], PLAT, TC[1]], segments: 8, color: STONE, name: "altar" });
M(GOLD, G(new THREE.TorusGeometry(0.095, 0.008, 4, 8), [TC[0], PLAT + 0.04, TC[1]], [90, 22.5, 0]));
M(GOLD, G(new THREE.TorusGeometry(0.112, 0.01, 4, 8), [TC[0], PLAT + 0.255, TC[1]], [90, 22.5, 0]));
M(TEAL_STONE, G(new THREE.CylinderGeometry(0.08, 0.1, 0.022, 8), [TC[0], PLAT + 0.272, TC[1]]));
for (let k = 0; k < 4; k++) put(new THREE.PlaneGeometry(0.085, 0.011), "#ffffff", { at: [TC[0] + 0.0765 * Math.sin(k * 1.571), PLAT + 0.13, TC[1] + 0.0765 * Math.cos(k * 1.571)], dir: [Math.sin(k * 1.571), 0, Math.cos(k * 1.571)], axis: "z", texture: FILIGREE, name: "altarBand" });
// the floating wind crystal (spins on its own hinge joint)
const cryA = PLAT + 0.62;
glow(b.part(new THREE.OctahedronGeometry(1, 0), "#6ff0d6", { bone: crystalJ, at: CRYSTAL_AT, scale: [0.075, 0.15, 0.075], flat: true, name: "crystal" }), 1.5);
glow(b.part(new THREE.OctahedronGeometry(1, 0), "#d8fff6", { bone: crystalJ, at: CRYSTAL_AT, scale: [0.04, 0.09, 0.04], flat: true, name: "crystalCore" }), 2);
b.part(new THREE.TorusGeometry(0.16, 0.006, 4, 28), "#ffd45e", { bone: crystalJ, at: CRYSTAL_AT, rotation: [75, 0, 0], name: "orbitRingA" });
b.part(new THREE.TorusGeometry(0.2, 0.005, 4, 32), "#ffd45e", { bone: crystalJ, at: CRYSTAL_AT, rotation: [20, 35, 20], name: "orbitRingB" });
for (let k = 0; k < 5; k++) {
  const a = (k / 5) * Math.PI * 2;
  glow(b.part(new THREE.OctahedronGeometry(1, 0), k % 2 ? "#7ff2dc" : "#c9f8ff", { bone: crystalJ, at: [CRYSTAL_AT[0] + 0.2 * Math.sin(a), cryA + 0.04 * Math.sin(k * 3) + 0.03, CRYSTAL_AT[2] + 0.2 * Math.cos(a)], scale: [0.016, 0.03, 0.016], rotation: [0, a / DEG, 15], flat: true, name: "orbitShard" }), 1.3);
}
// light motes under the crystal
b.cards([up(TC[0] + 0.0, TC[1] + 0.0, cryA - 0.3)], SPARK, { size: 0.08, lean: 0, bone: ISL, cross: true });

// ---------------------------------------------------------------------------------------------------------------
// 4. Ruined gate wall with the broken arch
const AX = TC[0];
const ZA = ARCH_Z;
function archSide(s: number, broken: boolean) {
  const ri = 0.3,
    ro = 0.44,
    cy = 0.56;
  const end = broken ? 56 : 90;
  const pts: OutlinePoint[] = [[ri, 0], [ro, 0], [ro, cy]];
  const steps = 8;
  for (let i = 1; i <= steps; i++) {
    const a = (end * i * DEG) / steps;
    pts.push([ro * Math.cos(a), cy + ro * Math.sin(a)]);
  }
  if (broken) pts.push([0.215, cy + 0.33, "sharp"]);
  for (let i = steps; i >= 0; i--) {
    const a = (end * i * DEG) / steps;
    pts.push([ri * Math.cos(a), cy + ri * Math.sin(a)]);
  }
  const outline = pts.map(([u, v, k]) => (k ? ([s * u, v, k] as OutlinePoint) : ([s * u, v] as OutlinePoint)));
  if (s < 0) outline.reverse();
  ext(outline, { at: [AX, TOP, ZA], x: [1, 0, 0], thickness: 0.13, bevel: 0.01, color: STONE_MOSS, name: "archSide" });
  // gold trim along the inner edge
  const trim: OutlinePoint[] = [];
  const inner: OutlinePoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = (end * i * DEG) / steps;
    trim.push([s * (ri - 0.002) * Math.cos(a), cy + (ri - 0.002) * Math.sin(a)]);
    inner.push([s * (ri + 0.026) * Math.cos(a), cy + (ri + 0.026) * Math.sin(a)]);
  }
  const loop = [...trim, ...inner.reverse()];
  if (s < 0) loop.reverse();
  ext(loop, { at: [AX, TOP, ZA], x: [1, 0, 0], thickness: 0.145, bevel: 0.004, color: GOLD, name: "archTrim" });
  // pier glyph plate
  glow(put(new THREE.PlaneGeometry(0.06, 0.12), "#ffffff", { at: [AX + s * 0.37, TOP + 0.28, ZA + 0.068], dir: [0, 0, 1], axis: "z", texture: GLYPH, name: "pierGlyph" }), 1);
  M(GOLD, G(new THREE.BoxGeometry(0.15, 0.03, 0.15), [AX + s * 0.37, TOP + 0.015, ZA]));
  M(GOLD, G(new THREE.BoxGeometry(0.15, 0.025, 0.15), [AX + s * 0.37, TOP + 0.45, ZA]));
}
archSide(1, true);
archSide(-1, false);
// broken keystone resting on the grass
M(STONE_MOSS_LOW, G(new THREE.CylinderGeometry(0.1, 0.13, 0.13, 4), [AX + 0.06, TOP + 0.06, ZA + 0.3], [0, 15, 90], [1, 1, 1]));
M(GOLD, G(new THREE.BoxGeometry(0.1, 0.012, 0.12), [AX + 0.06, TOP + 0.126, ZA + 0.3], [0, 15, 90]));
// flanking ruined walls
function wallPiece(x0: number, x1: number, tops: number[], windowAt?: number) {
  const w = x1 - x0;
  const n = tops.length;
  const outline: OutlinePoint[] = [[0, 0]];
  for (let i = 0; i < n; i++) {
    outline.push([(w * i) / n, tops[i], "sharp"], [(w * (i + 1)) / n - 0.01, tops[i] + (i % 2 ? 0.03 : -0.02), "sharp"]);
  }
  outline.push([w, 0]);
  ext(outline, { at: [x0, TOP, ZA], x: [1, 0, 0], thickness: 0.11, bevel: 0.008, color: STONE_MOSS, name: "wall" });
  M(GOLD, G(new THREE.BoxGeometry(w + 0.01, 0.018, 0.12), [x0 + w / 2, TOP + 0.12, ZA]));
  put(new THREE.PlaneGeometry(w * 0.9, 0.04), "#ffffff", { at: [x0 + w / 2, TOP + 0.07, ZA + 0.0565], dir: [0, 0, 1], axis: "z", texture: FILIGREE, name: "wallFiligree" });
  if (windowAt !== undefined) {
    // an arched window: dark recess with a glowing sill
    const wx = x0 + windowAt;
    M("#3b3560", G(new THREE.BoxGeometry(0.1, 0.18, 0.02), [wx, TOP + 0.34, ZA + 0.055]));
    M("#3b3560", G(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 8), [wx, TOP + 0.43, ZA + 0.055], [90, 0, 0]));
    GL("#ffd27a", G(new THREE.BoxGeometry(0.1, 0.012, 0.03), [wx, TOP + 0.245, ZA + 0.06]), 1);
    M(GOLD, G(new THREE.TorusGeometry(0.056, 0.007, 4, 10, Math.PI), [wx, TOP + 0.43, ZA + 0.066]));
  }
}
wallPiece(AX - 0.95, AX - 0.52, [0.52, 0.4, 0.58, 0.34, 0.26], 0.2);
wallPiece(AX + 0.34, AX + 0.76, [0.34, 0.22, 0.3, 0.14]);
// wind chime on the arch
b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.06, 4), "#ffd45e", { bone: chimeJ, at: [CHIME_AT[0], CHIME_AT[1] - 0.03, CHIME_AT[2]], name: "chimeCord" });
b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 8), GOLD, { bone: chimeJ, at: [CHIME_AT[0], CHIME_AT[1] - 0.065, CHIME_AT[2]], name: "chimeDisc" });
for (let k = 0; k < 5; k++) {
  const a = (k / 5) * Math.PI * 2;
  b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.08 + 0.02 * (k % 2), 5), k % 2 ? "#7ff2dc" : "#c9f8ff", { bone: chimeJ, at: [CHIME_AT[0] + 0.028 * Math.sin(a), CHIME_AT[1] - 0.115 - 0.01 * (k % 2), CHIME_AT[2] + 0.028 * Math.cos(a)], name: "chimeRod" });
}
b.part(new THREE.SphereGeometry(0.014, 6, 4), "#ffd45e", { bone: chimeJ, at: [CHIME_AT[0], CHIME_AT[1] - 0.1, CHIME_AT[2]], name: "chimeClapper" });
b.cards([frame(CHIME_AT, [0, 1, 0])], TASSEL, { size: [0.03, 0.1], lean: 180, flow: [0, 0, 1], bone: chimeJ, sink: 0 });
// vines on the walls
b.cards(
  [[AX - 0.8, 0.5], [AX - 0.62, 0.38], [AX + 0.5, 0.3], [AX - 0.35, 0.0], [AX + 0.2, 0.0]].map(([x, h]) => up(x, ZA + 0.058, TOP + 0.12 + h * 0.8)),
  VINE,
  { size: [0.06, 0.2], lean: 180, flow: [0, 0, 1], vary: 0.3, rng: rng(12), bone: ISL },
);

// ---------------------------------------------------------------------------------------------------------------
// 5. Trees
function blobs(list: [number, number, number, number][], color: Fill, name: string) {
  const parts = [];
  for (const [x, y, z, rad] of list) {
    const p = put(rockGeo(rad, 1, 0.18, Math.round(x * 100)), color, { at: [x, y, z], flat: true, rotation: [r() * 90, r() * 360, 0], scale: [1, 0.86, 1], name });
    parts.push(p);
  }
  return parts;
}

// sakura
{
  const [sx, sz] = TREE_S;
  const base: V = [sx, TOP - 0.03, sz];
  const trunkPts: V[] = [base, [sx + 0.03, TOP + 0.18, sz + 0.01], [sx - 0.05, TOP + 0.42, sz + 0.04], [sx - 0.1, TOP + 0.64, sz + 0.0]];
  swp(catmull(trunkPts), [0.1, 0.075, 0.05, 0.035], { color: BARK, section: { ngon: 7 }, caps: "flat", name: "sakuraTrunk" });
  for (let k = 0; k < 5; k++) {
    const a = k * 1.3 + 0.4;
    swp([[sx + 0.05 * Math.sin(a), TOP + 0.1, sz + 0.05 * Math.cos(a)], [sx + 0.13 * Math.sin(a), TOP + 0.02, sz + 0.13 * Math.cos(a)], [sx + 0.2 * Math.sin(a), TOP - 0.01, sz + 0.2 * Math.cos(a)]], [0.04, 0.012], { color: BARK, sides: 5, caps: { start: "flat", end: "round" }, name: "sakuraRoot" });
  }
  // branches (one thick bough carries the swing)
  const tips: V[] = [
    [sx + 0.2, TOP + 0.62, sz + 0.1],
    [sx - 0.3, TOP + 0.68, sz - 0.05],
    [sx - 0.1, TOP + 0.85, sz - 0.2],
    [sx + 0.04, TOP + 0.8, sz + 0.22],
  ];
  for (const t of tips) swp(catmull([[sx - 0.09, TOP + 0.5, sz + 0.02], [(sx - 0.09 + t[0]) / 2, TOP + 0.58, (sz + t[2]) / 2], t]), [0.04, 0.012], { color: BARK, sides: 5, caps: "round", name: "sakuraBranch" });
  swp(catmull([[sx - 0.06, TOP + 0.42, sz + 0.04], [sx - 0.04, TOP + 0.54, sz + 0.2], [SWING_AT[0], SWING_AT[1] + 0.02, SWING_AT[2] + 0.02]]), [0.032, 0.014], { color: BARK, sides: 5, caps: "round", name: "swingBough" });
  const canopy = blobs(
    [
      [sx - 0.08, TOP + 0.95, sz - 0.02, 0.27],
      [sx + 0.18, TOP + 0.84, sz + 0.08, 0.22],
      [sx - 0.34, TOP + 0.84, sz - 0.02, 0.22],
      [sx - 0.12, TOP + 1.12, sz - 0.12, 0.2],
      [sx + 0.02, TOP + 0.92, sz + 0.24, 0.2],
      [sx - 0.22, TOP + 0.78, sz + 0.2, 0.17],
      [sx - 0.02, TOP + 0.78, sz - 0.3, 0.19],
      [sx + 0.22, TOP + 0.98, sz - 0.12, 0.17],
      [sx - 0.35, TOP + 1.02, sz - 0.22, 0.15],
    ],
    PINK,
    "sakuraBlob",
  );
  const surf = b.surface(canopy);
  const hits = surf.scatter(120, { rng: rng(15), minDist: 0.06, filter: (h) => h.n.y > -0.35 });
  b.cards(hits, BLOSSOM, { size: [0.1, 0.1], lean: 70, flow: (_f, i) => [Math.cos(i * 2.4), -0.6, Math.sin(i * 2.4)], vary: 0.3, rng: rng(16), spin: 180, bone: ISL });
  // petals drifting down
  const drift: Frame[] = [];
  for (let i = 0; i < 28; i++)
    drift.push(frame([sx + (r() - 0.5) * 1.1, TOP + 0.08 + r() * 0.9, sz + (r() - 0.5) * 1.1], [0.3 * Math.sin(i), 1, 0.3 * Math.cos(i)]));
  b.cards(drift, PETAL, {
    size: [0.035, 0.035],
    lean: 90,
    flow: (_f, i) => [Math.cos(i * 1.7), 0, Math.sin(i * 1.7)],
    mirror: true,
    rng: rng(17),
    bone: ISL,
  });
  // fallen petals on the grass
  const fallen: Frame[] = [];
  for (let i = 0; i < 40; i++) {
    const a = r() * 6.283;
    const d = 0.1 + 0.5 * r();
    const px = sx + d * Math.sin(a) + 0.1;
    const pz = sz + d * Math.cos(a);
    if (isFree(px, pz, -0.1) || Math.hypot(px - sx, pz - sz) > 0.12) if (inIsland(px, pz, 0.1) && nearStream(px, pz) > 0.1) fallen.push(up(px, pz, TOP + 0.004));
  }
  b.cards(fallen, PETAL, { size: [0.04, 0.04], lean: 90, flow: (_f, i) => [Math.cos(i * 2.9), 0, Math.sin(i * 2.9)], mirror: true, vary: 0.3, rng: rng(18), bone: ISL });
  // swing: rope and seat on a hinge joint at the bough
  const seatY = TOP + 0.17;
  for (const k of [-1, 1]) {
    b.sweep([[SWING_AT[0] + k * 0.06, SWING_AT[1] - 0.01, SWING_AT[2]], [SWING_AT[0] + k * 0.06, seatY + 0.02, SWING_AT[2]]], 0.0055, { bone: swingJ, color: "#d9b27a", sides: 4, name: "swingRope" });
  }
  b.part(new THREE.BoxGeometry(0.17, 0.02, 0.07), WOOD_L, { bone: swingJ, at: [SWING_AT[0], seatY, SWING_AT[2]], name: "swingSeat" });
  b.part(new THREE.BoxGeometry(0.18, 0.006, 0.01), GOLD, { bone: swingJ, at: [SWING_AT[0], seatY + 0.012, SWING_AT[2] + 0.034], name: "swingTrim" });
  b.part(new THREE.BoxGeometry(0.18, 0.006, 0.01), GOLD, { bone: swingJ, at: [SWING_AT[0], seatY + 0.012, SWING_AT[2] - 0.034], name: "swingTrim" });
  // grass mound under the tree
  put(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), GRASS, { at: [sx + 0.04, TOP - 0.01, sz], scale: [0.32, 0.06, 0.3], name: "sakuraMound" });
  // picnic: blanket, basket, teapot, cups
  const px = -0.46, pz = 0.5;
  put(new THREE.BoxGeometry(0.3, 0.01, 0.24), cel(paint((p) => ((Math.floor((p.x + 5) / 0.04) + Math.floor((p.z + 5) / 0.04)) % 2 ? "#ff7a8a" : "#fff0d8")), "#b8486f"), { at: [px, TOP + 0.005, pz], rotation: [0, 18, 0], name: "picnicBlanket" });
  const pt = (o: V) => [px + o[0] * Math.cos(18 * DEG) + o[2] * Math.sin(18 * DEG), TOP + o[1], pz - o[0] * Math.sin(18 * DEG) + o[2] * Math.cos(18 * DEG)] as V;
  M(cel("#c98a52", "#7a4a5a"), G(new THREE.CylinderGeometry(0.06, 0.05, 0.05, 8), pt([-0.07, 0.035, 0.02])));
  swp(catmull([pt([-0.13, 0.055, 0.02]), pt([-0.07, 0.115, 0.02]), pt([-0.01, 0.055, 0.02])]), 0.006, { color: "#9a6038", sides: 5, name: "basketHandle" });
  M(cel("#fff8e8", "#c4b8d8"), G(new THREE.SphereGeometry(0.035, 8, 6), pt([0.06, 0.04, -0.03]), [0, 0, 0], [1, 0.85, 1]));
  M(cel("#fff8e8", "#c4b8d8"), G(new THREE.SphereGeometry(0.018, 6, 4), pt([0.06, 0.082, -0.03])));
  M(GOLD, G(new THREE.TorusGeometry(0.016, 0.004, 4, 8), pt([0.095, 0.045, -0.03]), [0, 0, 0]));
  M(cel("#4fc6d8", "#2a7ea6"), G(new THREE.CylinderGeometry(0.016, 0.012, 0.025, 6), pt([0.08, 0.017, 0.07])));
  M(cel("#4fc6d8", "#2a7ea6"), G(new THREE.CylinderGeometry(0.016, 0.012, 0.025, 6), pt([0.02, 0.017, 0.08])));
  M(cel("#ffb347", "#c9702e"), G(new THREE.SphereGeometry(0.03, 7, 5), pt([0.1, 0.03, 0.0]), [0, 0, 0], [1, 0.8, 1]));
  M("#5cba5c", G(new THREE.ConeGeometry(0.01, 0.02, 4), pt([0.1, 0.07, 0.0])));
}

// meadow tree
{
  const [gx, gz] = TREE_G;
  const trunk: V[] = [[gx, TOP - 0.03, gz], [gx - 0.03, TOP + 0.22, gz + 0.02], [gx + 0.05, TOP + 0.5, gz - 0.02], [gx + 0.02, TOP + 0.74, gz + 0.0]];
  swp(catmull(trunk), [0.12, 0.085, 0.06, 0.045], { color: BARK, section: { ngon: 7 }, caps: "flat", name: "meadowTrunk" });
  for (let k = 0; k < 5; k++) {
    const a = k * 1.26 + 0.9;
    swp([[gx + 0.06 * Math.sin(a), TOP + 0.12, gz + 0.06 * Math.cos(a)], [gx + 0.15 * Math.sin(a), TOP + 0.03, gz + 0.15 * Math.cos(a)], [gx + 0.24 * Math.sin(a), TOP - 0.01, gz + 0.24 * Math.cos(a)]], [0.045, 0.012], { color: BARK, sides: 5, caps: { start: "flat", end: "round" }, name: "meadowRoot" });
  }
  for (const t of [[0.25, 0.66, 0.06], [-0.22, 0.7, -0.1], [0.0, 0.92, -0.2], [0.04, 0.85, 0.22]] as V[])
    swp(catmull([[gx + 0.03, TOP + 0.55, gz], [gx + t[0] / 2, TOP + 0.65, gz + t[2] / 2], [gx + t[0], TOP + t[1], gz + t[2]]]), [0.04, 0.012], { color: BARK, sides: 5, caps: "round", name: "meadowBranch" });
  const canopy = blobs(
    [
      [gx + 0.02, TOP + 1.0, gz, 0.3],
      [gx + 0.26, TOP + 0.8, gz + 0.06, 0.23],
      [gx - 0.24, TOP + 0.84, gz - 0.08, 0.24],
      [gx - 0.02, TOP + 1.2, gz - 0.1, 0.2],
      [gx + 0.04, TOP + 0.84, gz + 0.26, 0.21],
      [gx + 0.04, TOP + 0.86, gz - 0.28, 0.2],
      [gx + 0.22, TOP + 1.06, gz - 0.14, 0.18],
    ],
    LEAF_G,
    "meadowBlob",
  );
  const hits = b.surface(canopy).scatter(80, { rng: rng(21), minDist: 0.07, filter: (h) => h.n.y > -0.3 });
  b.cards(hits, LEAF, { size: [0.09, 0.11], lean: 65, flow: (_f, i) => [Math.cos(i * 2.4), -0.7, Math.sin(i * 2.4)], vary: 0.3, rng: rng(22), spin: 180, bone: ISL });
  put(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), GRASS, { at: [gx, TOP - 0.01, gz], scale: [0.34, 0.07, 0.32], name: "meadowMound" });
  // little wooden birdhouse hung from a branch
  const hx = gx + 0.3, hy = TOP + 0.5, hz = gz + 0.1;
  swp([[hx, hy + 0.1, hz], [hx, hy + 0.045, hz]], 0.004, { color: "#d9b27a", sides: 4, name: "birdhouseCord" });
  M(WOOD_L, G(new THREE.BoxGeometry(0.07, 0.065, 0.06), [hx, hy + 0.01, hz]));
  M(RED, G(new THREE.ConeGeometry(0.058, 0.04, 4), [hx, hy + 0.062, hz], [0, 45, 0], [1, 1, 0.9]));
  M("#3b3560", G(new THREE.CylinderGeometry(0.011, 0.011, 0.01, 6), [hx, hy + 0.012, hz + 0.031], [90, 0, 0]));
}

// small pines
function pine(x: number, z: number, h: number) {
  swp([[x, TOP - 0.02, z], [x, TOP + h * 0.4, z]], [0.03, 0.02], { color: BARK, sides: 5, caps: "flat", name: "pineTrunk" });
  const tiers = 4;
  for (let i = 0; i < tiers; i++) {
    const t = i / (tiers - 1);
    const rr = 0.15 * (1 - t * 0.65);
    M(PINE, G(new THREE.ConeGeometry(rr, h * 0.34, 7), [x, TOP + h * (0.22 + t * 0.58), z], [0, i * 25, 0]));
  }
  M(GOLD, G(new THREE.SphereGeometry(0.014, 5, 4), [x, TOP + h * 1.0 + 0.04, z]));
}
pine(-0.62, -0.62, 0.62);
pine(0.98, 0.14, 0.5);
pine(-0.32, -0.55, 0.38);

// ---------------------------------------------------------------------------------------------------------------
// 6. Meadow details: path, signpost, pinwheel, fence, mushrooms, bushes, flowers, rocks
// stepping stones from the stairs to the front
const pathPts: [number, number][] = [[TC[0], 0.5], [TC[0] - 0.05, 0.64], [TC[0] - 0.12, 0.76], [TC[0] - 0.05, 0.9], [TC[0] - 0.14, 1.03], [TC[0] - 0.08, 1.16]];
for (const [x, z] of pathPts) {
  const rad = 0.06 + 0.02 * r();
  M(FLOOR, G(new THREE.CylinderGeometry(rad * 0.9, rad, 0.026, 7), [x, TOP + 0.005, z], [0, r() * 360, 0], [1.1, 1, 0.9]));
  for (let k = 0; k < 2; k++) M(MOSS_C, G(new THREE.SphereGeometry(0.014, 5, 3), [x + (r() - 0.5) * 0.1, TOP + 0.016, z + (r() - 0.5) * 0.1], [0, 0, 0], [1, 0.4, 1]));
}
// signpost
{
  const [x, z] = [-0.28, 0.72];
  swp([[x, TOP - 0.02, z], [x, TOP + 0.34, z]], 0.017, { color: WOOD, sides: 6, caps: "flat", name: "signPost" });
  M(GOLD, G(new THREE.SphereGeometry(0.026, 6, 4), [x, TOP + 0.365, z]));
  const board = (y: number, dirSign: number, tilt: number) => {
    const outline: OutlinePoint[] = [[-0.02, -0.032], [0.15 * dirSign, -0.032], [0.19 * dirSign, 0], [0.15 * dirSign, 0.032], [-0.02, 0.032]];
    if (dirSign < 0) outline.reverse();
    ext(outline, {
      at: [x, y, z + 0.022],
      x: [1, 0, 0],
      thickness: 0.016,
      bevel: 0.004,
      rotation: [0, tilt, 0],
      color: cel(paint((_p, n, s) => (Math.abs(n.z) > 0.5 && (Math.abs(s[1]) > 0.024 || Math.abs(s[0]) > 0.17) ? GOLD : WOOD_L)), "#8d5560"),
      name: "signBoard",
    } as ExtOpts);
  };
  board(TOP + 0.3, 1, 0);
  board(TOP + 0.22, -1, 0);
  M(GOLD, G(new THREE.SphereGeometry(0.008, 4, 3), [x + 0.1, TOP + 0.3, z + 0.032]));
  M(GOLD, G(new THREE.SphereGeometry(0.008, 4, 3), [x - 0.1, TOP + 0.22, z + 0.032]));
}
// paper-lantern string from the sakura to the signpost
{
  const rope = catmull([
    [TREE_S[0] + 0.03, TOP + 0.6, TREE_S[1] + 0.05],
    [-0.64, TOP + 0.5, 0.3],
    [-0.46, TOP + 0.43, 0.5],
    [-0.3, TOP + 0.4, 0.66],
    [-0.28, TOP + 0.375, 0.72],
  ]);
  swp(rope, 0.005, { color: "#d9b27a", sides: 4, caps: "round", name: "lanternRope" });
  for (const t of [0.2, 0.4, 0.6, 0.8]) {
    const q = rope.at(t);
    GL("#ff9a4d", G(new THREE.SphereGeometry(0.03, 7, 5), [q.x, q.y - 0.04, q.z], [0, 0, 0], [1, 1.25, 1]), 1.3);
    M(GOLD, G(new THREE.CylinderGeometry(0.018, 0.018, 0.01, 6), [q.x, q.y - 0.0085, q.z]));
    M(GOLD, G(new THREE.CylinderGeometry(0.012, 0.012, 0.008, 6), [q.x, q.y - 0.08, q.z]));
    M("#e8434f", G(new THREE.CylinderGeometry(0.003, 0.003, 0.03, 4), [q.x, q.y - 0.1, q.z]));
  }
}
// pinwheel on a pole
{
  const [x, z] = [PIN_AT[0], PIN_AT[2]];
  swp([[x, TOP - 0.02, z - 0.01], [x, PIN_AT[1], z - 0.01]], 0.01, { color: "#e9d9b8", sides: 5, caps: "flat", name: "pinPole" });
  const vane: OutlinePoint[] = [[0, 0], [0.095, 0], [0.095, 0.095], [0.05, 0.05]];
  const cols = ["#ff7a8a", "#fff3d0", "#58d4f2", "#ffd45e"];
  for (let k = 0; k < 4; k++) {
    b.extrude(vane, { bone: pinJ, at: [x, PIN_AT[1], z + 0.003 * (k % 2)], x: [Math.cos(k * 1.5708), Math.sin(k * 1.5708), 0], y: [-Math.sin(k * 1.5708), Math.cos(k * 1.5708), 0], thickness: 0.004, color: cols[k], name: "pinVane" });
  }
  b.part(new THREE.SphereGeometry(0.014, 6, 4), "#ffd45e", { bone: pinJ, at: [x, PIN_AT[1], z + 0.008], name: "pinButton" });
}
// short fence along the front-left rim
{
  const posts: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const a = -0.62 + i * 0.1;
    posts.push(pol(a, R(a) - 0.12));
  }
  for (const [x, z] of posts) {
    M(WOOD, G(new THREE.BoxGeometry(0.03, 0.15, 0.03), [x, TOP + 0.07, z]));
    M(GOLD, G(new THREE.ConeGeometry(0.022, 0.03, 4), [x, TOP + 0.165, z], [0, 45, 0]));
  }
  swp(catmull(posts.map(([x, z]) => [x, TOP + 0.12, z] as V)), 0.008, { color: "#d9b27a", sides: 4, caps: "flat", name: "fenceRail" });
  swp(catmull(posts.map(([x, z]) => [x, TOP + 0.06, z] as V)), 0.008, { color: "#d9b27a", sides: 4, caps: "flat", name: "fenceRail" });
}
// mushrooms and clutter
for (const [x, z, s] of [[0.15, -0.02, 1], [-0.62, -0.28, 0.8], [-0.7, 0.78, 1.1], [0.95, -0.5, 0.9]] as [number, number, number][]) {
  for (let k = 0; k < 3; k++) {
    const ox = x + (k - 1) * 0.045 * s + (k === 1 ? 0.02 : 0);
    const oz = z + ((k * 7) % 3) * 0.03 * s;
    const sz = (k === 1 ? 1 : 0.7) * s;
    M(CREAM, G(new THREE.CylinderGeometry(0.012 * sz, 0.016 * sz, 0.05 * sz, 6), [ox, TOP + 0.02 * sz, oz]));
    M(CAPRED, G(new THREE.SphereGeometry(0.034 * sz, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), [ox, TOP + 0.045 * sz, oz], [0, 0, 0], [1, 0.8, 1]));
  }
}
for (const [x, z, s] of [[-0.62, 0.0, 1], [0.38, -0.4, 0.8], [-0.4, 0.95, 0.7], [0.25, 0.35, 0.7], [-0.9, -0.3, 0.8], [0.9, -0.26, 0.9]] as [number, number, number][]) {
  for (let k = 0; k < 4; k++) M(k % 2 ? LEAF_G : PINE, G(new THREE.SphereGeometry(0.06 * s, 6, 5), [x + (k - 1.5) * 0.06 * s, TOP + 0.03 * s, z + ((k * 5) % 3 - 1) * 0.04 * s], [0, 0, 0], [1, 0.75, 1]), true);
}
for (let i = 0; i < 12; i++) {
  const a = r() * 6.28;
  const d = 0.25 + r() * 0.8;
  const x = d * Math.sin(a), z = d * Math.cos(a);
  if (!isFree(x, z, 0.02)) continue;
  M(i % 3 ? ROCK_B : STONE_MOSS_LOW, G(rockGeo(0.03 + 0.04 * r(), 0, 0.4, i + 70), [x, TOP + 0.01, z], [0, r() * 360, 0], [1, 0.7, 1]));
}
// rolling mounds break up the lawn; grass and flowers follow them
const MOUNDS: [number, number, number, number][] = [
  [-0.22, 0.92, 0.26, 0.07],
  [0.3, -0.58, 0.3, 0.08],
  [0.2, 1.05, 0.2, 0.05],
  [-0.85, -0.38, 0.22, 0.07],
];
const gy = (x: number, z: number) =>
  TOP + Math.max(0, ...MOUNDS.map(([mx, mz, mr, mh]) => mh * Math.sqrt(Math.max(0, 1 - ((x - mx) ** 2 + (z - mz) ** 2) / mr ** 2))));
for (const [mx, mz, mr, mh] of MOUNDS)
  put(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), GRASS, { at: [mx, TOP - 0.01, mz], scale: [mr, mh + 0.01, mr], name: "mound" });
{
  const tufts = [];
  const flowers: Frame[][] = [[], [], [], []];
  let guard = 0;
  while (tufts.length < 140 && guard++ < 2500) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * 1.35;
    const x = d * Math.sin(a), z = d * Math.cos(a);
    if (!isFree(x, z, 0.02)) continue;
    tufts.push(up(x, z, gy(x, z) + 0.005));
  }
  b.cards(tufts, GRASS_TUFT, { size: [0.09, 0.09], cross: true, lean: 0, flow: [0, 0, 1], vary: 0.4, spin: 180, rng: rng(33), bone: ISL });
  guard = 0;
  let nf = 0;
  while (nf < 70 && guard++ < 3000) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * 1.3;
    const x = d * Math.sin(a), z = d * Math.cos(a);
    if (!isFree(x, z, 0.02)) continue;
    flowers[nf % 4].push(up(x, z, gy(x, z) + 0.005));
    nf++;
  }
  [FLOWER_W, FLOWER_Y, FLOWER_B, FLOWER_P].forEach((tex, i) =>
    b.cards(flowers[i], tex, { size: [0.055, 0.075], cross: true, lean: 0, flow: [0, 0, 1], vary: 0.3, spin: 180, rng: rng(40 + i), bone: ISL }),
  );
  // bushes dotted with flowers by the stairs and pond
  for (const [x, z] of [[TC[0] + 0.45, 0.36], [TC[0] - 0.5, 0.3], [0.38, -0.08], [0.98, -0.38]] as [number, number][]) {
    const bb = blobs([[x, TOP + 0.05, z, 0.1], [x + 0.09, TOP + 0.04, z + 0.03, 0.08], [x - 0.08, TOP + 0.04, z - 0.02, 0.08]], LEAF_G, "bush");
    const hits = b.surface(bb).scatter(16, { rng: rng(x * 100 + 50), minDist: 0.04, filter: (h) => h.n.y > 0 });
    b.cards(hits, FLOWER_P, { size: 0.05, lean: 60, flow: (_f, i) => [Math.cos(i * 2), 0, Math.sin(i * 2)], rng: rng(9), bone: ISL });
  }
}

// ---------------------------------------------------------------------------------------------------------------
// 7. Floating fragments, clouds, wind
function floater(x: number, y: number, z: number, s: number, tree: boolean, ruin: boolean) {
  M(ROCK_B, G(rockGeo(0.2 * s, 1, 0.3, 90), [x, y, z], [0, 40, 0], [1, 0.62, 1]));
  M(ROCK, G(new THREE.ConeGeometry(0.18 * s, 0.34 * s, 7), [x, y - 0.18 * s, z], [180, 20, 0]));
  M(ROCK, G(new THREE.ConeGeometry(0.06 * s, 0.22 * s, 5), [x + 0.06 * s, y - 0.33 * s, z - 0.02 * s], [180, 0, 0]));
  M(GRASS, G(new THREE.CylinderGeometry(0.17 * s, 0.19 * s, 0.035 * s, 8), [x, y + 0.12 * s, z], [0, 20, 0]), false);
  for (let k = 0; k < 5; k++) M(MOSS_C, G(new THREE.ConeGeometry(0.02 * s, 0.035 * s, 4), [x + Math.sin(k * 1.3) * 0.15 * s, y + 0.1 * s, z + Math.cos(k * 1.3) * 0.15 * s], [180, 0, 0]));
  if (tree) {
    swp([[x, y + 0.13 * s, z], [x + 0.01, y + 0.26 * s, z]], [0.018 * s, 0.012 * s], { color: BARK, sides: 5, name: "fragTrunk" });
    for (const [dx, dy, dz, rad] of [[0, 0.34, 0, 0.1], [0.07, 0.3, 0.02, 0.07], [-0.06, 0.3, -0.03, 0.07]])
      M(PINK, G(rockGeo(rad * s, 1, 0.2, 5), [x + dx * s, y + dy * s, z + dz * s]));
  }
  if (ruin) {
    M(STONE_MOSS_LOW, G(new THREE.CylinderGeometry(0.035 * s, 0.04 * s, 0.22 * s, 8), [x, y + 0.24 * s, z]));
    M(GOLD, G(new THREE.TorusGeometry(0.04 * s, 0.005, 4, 8), [x, y + 0.2 * s, z], [90, 0, 0]));
    M(STONE, G(new THREE.BoxGeometry(0.09 * s, 0.035 * s, 0.09 * s), [x, y + 0.36 * s, z], [0, 20, 0]));
    GL("#6ff0d6", G(new THREE.OctahedronGeometry(0.035 * s, 0), [x, y + 0.46 * s, z], [0, 0, 0], [0.7, 1.5, 0.7]), 1.4);
  }
  GL("#7ff2dc", G(new THREE.ConeGeometry(0.025 * s, 0.09 * s, 5), [x + 0.07 * s, y - 0.06 * s, z + 0.15 * s], [-70, 0, 0]), 1.1);
}
floater(-1.35, 1.95, 0.3, 1.0, true, false);
floater(1.4, 1.35, -0.45, 0.85, false, true);
floater(-0.95, 0.75, 1.1, 0.5, false, false);
floater(0.9, 2.3, -0.95, 0.6, false, true);
// pebbles
for (const [x, y, z, s] of [[-1.15, 1.3, 0.7, 1], [1.2, 1.9, 0.4, 0.8], [1.0, 0.65, 0.95, 0.7], [-0.4, 2.15, -1.0, 0.8], [0.3, 2.4, 0.7, 0.7]] as [number, number, number, number][])
  M(i2(s), G(rockGeo(0.04 * s, 0, 0.5, 8), [x, y, z], [r() * 90, r() * 90, 0]));
function i2(s: number) {
  return s > 0.75 ? ROCK_B : ROCK;
}

// cloud bank round the tip, wrapping the waterfall's end
const cloudPuffs: [number, number, number, number][] = [];
for (let i = 0; i < 15; i++) {
  const a = (i / 15) * Math.PI * 2 + r() * 0.3;
  const front = Math.max(0, Math.cos(a));
  const d = 0.85 + 0.7 * r() + 0.2 * front;
  const rad = 0.14 + 0.1 * r();
  const y = rad * 0.62 + 0.12 * r() * (1 - front);
  cloudPuffs.push([d * Math.sin(a), y, d * Math.cos(a), rad]);
}
for (let i = 0; i < 7; i++) {
  const lt = (r() - 0.5) * 0.4;
  const o = 0.19 + 0.12 * r();
  cloudPuffs.push([RIM[0] + OUT[0] * o + OUT[1] * lt, 0.12 + 0.16 * r(), RIM[1] + OUT[1] * o - OUT[0] * lt, 0.1 + 0.07 * r()]);
}
cloudPuffs.push([0.0, 0.07, 0.0, 0.1], [0.2, 0.08, -0.16, 0.11], [-0.2, 0.1, 0.14, 0.12]);
for (const [x, y, z, rad] of cloudPuffs) {
  const k = r();
  M(CLOUD, G(new THREE.SphereGeometry(rad, 9, 6), [x, y, z], [0, r() * 90, 0], [1.2, 0.75, 1.05]), true);
  M(CLOUD, G(new THREE.SphereGeometry(rad * 0.7, 9, 6), [x + rad * 0.85, y - rad * 0.12, z + rad * (k - 0.5)], [0, 0, 0], [1.2, 0.7, 1]), true);
  M(CLOUD, G(new THREE.SphereGeometry(rad * 0.62, 9, 6), [x - rad * 0.7, y + rad * 0.16, z - rad * (k - 0.2)], [0, 0, 0], [1.1, 0.8, 1]), true);
}
for (const [x, y, z, rad] of [[-1.2, 1.2, -0.7, 0.2], [1.4, 0.9, 0.3, 0.18], [-1.5, 2.1, -0.3, 0.13], [1.55, 2.0, 0.5, 0.16], [0.2, 2.6, -1.0, 0.14]] as [number, number, number, number][]) {
  M(CLOUD, G(new THREE.SphereGeometry(rad, 9, 6), [x, y, z], [0, 0, 0], [1.3, 0.7, 1]), true);
  M(CLOUD, G(new THREE.SphereGeometry(rad * 0.75, 9, 6), [x + rad * 0.9, y - rad * 0.1, z + rad * 0.2], [0, 0, 0], [1.3, 0.7, 1]), true);
  M(CLOUD, G(new THREE.SphereGeometry(rad * 0.7, 9, 6), [x - rad * 0.9, y - rad * 0.15, z - rad * 0.1], [0, 0, 0], [1.3, 0.7, 1]), true);
}

// wind ribbons spiralling around the temple and light motes
for (const [rad, h0, turns, sign, w] of [[0.85, TOP + 0.4, 1.0, 1, 0.006], [0.7, TOP + 0.6, 0.8, -1, 0.005]] as [number, number, number, number, number][]) {
  const path = spiral([TC[0], h0, TC[1]], [TC[0] + rad * sign, h0, TC[1]], [0, 1, 0], { turns: turns * sign, r1: rad * 0.5, pitch: 0.2 });
  swp(path, [0.0, w, w, w * 0.6, 0.0], { color: "#d4fff4", sides: 4, caps: "none", name: "windRibbon" });
}
for (let i = 0; i < 34; i++) {
  const a = r() * 6.28;
  const d = 0.3 + r() * 1.2;
  const y = TOP + 0.15 + r() * 1.0;
  GL(i % 3 ? "#e9fff9" : "#ffe58a", G(new THREE.OctahedronGeometry(0.012 + 0.01 * r(), 0), [TC[0] + d * Math.sin(a), y, TC[1] + d * Math.cos(a)]), 1.2);
}

flush();
export default function build() {
  return b.root;
}
