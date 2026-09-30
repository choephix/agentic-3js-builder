// Blacksmith's Forge · Ox — a tabletop smithy yard diorama about 1.5 m across on an octagonal plank base:
// a stone forge with glowing coals, flames and a soot-stained chimney, a leather bellows on a trestle (hinged),
// an anvil on a tree stump with a half-forged glowing sword, a quench barrel with a hot bar being dunked,
// a tool rack with hammers and tongs, a workbench with a vice and mallet, horseshoes, a firewood pile,
// a lit lantern on a hooked post and a hanging SMITHY sign that swings. Cobble-and-dirt ground, grass tufts,
// pebbles and chimney smoke finish the scene.
// Style: stylised low-poly. Blocks, faceted cylinders and lathes; stone, wood, dirt and leather are paints;
// the fire, hot sword and lantern glass are emissive (kits/glow). Three hinge joints: the bellows lid,
// the hanging sign and the lantern.
import * as THREE from "three";
import type { Texture } from "three";
import { createBuilder } from "../src/builder";
import { glow } from "../kits/glow";
import type { Joint } from "../src/skeleton";
import { rng } from "../src/math";
import type { V3 } from "../src/math";
import { cells, grain, mix, mottle, noise, paint, scales, smoothstep } from "../src/paint";
import type { Paint } from "../src/paint";
import { catmull, polyline } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Blacksmith's Forge · Ox",
  builtBy: "BlacksmithForgeOx",
  description:
    "A 1.5 m smithy-yard diorama on a plank base: stone forge with glowing coals, flames and a soot-stained chimney, leather bellows on a trestle, anvil on a stump with a half-forged glowing sword, quench barrel with a hot bar, tool rack, workbench, horseshoes, firewood, a lit lantern and a hanging SMITHY sign.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette

const WOOD_TOP = "#9c7444";
const WOOD_LT = "#b0854e";
const WOOD_DARK = "#6b4a2a";
const PLANK_SIDE = "#7a5731";
const PLANK_DARK = "#4a3220";
const DIRT = "#6e5236";
const DIRT_DARK = "#54402a";
const GRASS_A = "#7f9a4a";
const GRASS_B = "#5d8038";
const STONE = "#8d8a80";
const STONE_DK = "#6a675e";
const STONE_LT = "#a5a297";
const MORTAR = "#4c4a42";
const SOOT = "#26221f";
const IRON = "#34373c";
const IRON_LT = "#4d5157";
const STEEL = "#3d4046";
const EMBER = "#e86a28";
const EMBER_MID = "#ff9a3c";
const EMBER_HOT = "#ffd85a";
const COAL = "#2a2622";
const LEATHER_DK = "#573318";
const BARK = "#5e4025";
const BARK_DK = "#432c18";
const RING_A = "#c9a367";
const RING_B = "#a87f47";
const WATER = "#3a545c";
const WATER_LT = "#51707a";
const BRASS = "#c9973f";
const ROPE = "#d9c39a";
const GLASS = "#ffd978";
const WOOD_BOARD = "#3a2718";

const GY = 0.1; // top of the ground, where everything stands
type Pos2 = [number, number];
const FORGE: Pos2 = [-0.18, -0.26]; // hearth centre (x, z); its mouth faces +Z
const FLUE: Pos2 = [-0.18, -0.32]; // chimney centre (x, z)
const STUMP: Pos2 = [-0.36, 0.3]; // anvil stump centre (x, z)
const BARREL: Pos2 = [0.52, 0.04]; // quench barrel centre (x, z)

// ---------------------------------------------------------------------------------------------------------------
// Paints

/** The plank base and bench tops: planks running along x, seams, grain and a few knots. */
const plankGrain = grain(WOOD_TOP, WOOD_DARK, { size: 0.012, axis: "x", seed: 21 });
const plankPaint = paint((p, n, s) => {
  if (n.y < 0.85) return mix(PLANK_SIDE, PLANK_DARK, noise(p, 0.04, 22));
  const d = Math.abs(p.z / 0.12 - Math.round(p.z / 0.12)) * 0.12;
  const row = Math.floor(p.z / 0.12 + 0.5);
  let c = plankGrain.at(p, n, s);
  if (row % 2) c = mix(c, WOOD_LT, 0.22);
  c = mix(c, PLANK_DARK, smoothstep(0.006, 0.001, d));
  const knot = cells(p, 0.09, 33);
  if (knot.d2 - knot.d1 < 0.07 && noise(p, 0.02, 34) > 0.55) c = mix(c, PLANK_DARK, 0.6);
  return c;
});

/** Smithy ground: dirt, a cobbled work yard in front of the forge, soot near the mouth, grass at the fringe. */
const cobbles = scales("#98948a", "#5a5850", { size: 0.085, seed: 11 });
const groundPaint = paint((p, n, s) => {
  if (n.y < 0.6) return mix("#4a3826", "#3c2d1e", noise(p, 0.03, 2));
  const r = Math.hypot(p.x, p.z);
  let c = mix(DIRT, DIRT_DARK, noise(p, 0.05, 3));
  const peb = cells(p, 0.05, 8);
  if (peb.d2 - peb.d1 < 0.1) c = mix(c, "#7d7a70", 0.3 * noise(p, 0.02, 9));
  const cob = smoothstep(0.5, 0.32, Math.hypot(p.x + 0.24, p.z - 0.12));
  if (cob > 0.01) c = mix(c, cobbles.at(p, n, s), cob * 0.9);
  const mouth = smoothstep(0.4, 0.08, Math.hypot(p.x - FORGE[0], p.z));
  c = mix(c, SOOT, mouth * 0.55);
  const gr = smoothstep(0.56, 0.68, r + 0.05 * noise(p, 0.08, 12));
  c = mix(c, mix(GRASS_A, GRASS_B, noise(p, 0.03, 13)), gr * 0.65);
  return c;
});

/** Forge stonework: big irregular blocks, one shaded each, with soot round the mouth and the chimney pot. */
const blocks = scales(STONE, MORTAR, { size: 0.13, seed: 5 });
const forgeStone = paint((p, n, s) => {
  let c = mix(blocks.at(p, n, s), mix(STONE_LT, STONE_DK, noise(p, 0.07, 6)), 0.3);
  const mouth = smoothstep(0.34, 0.1, Math.hypot(p.x - FORGE[0], p.z) * 0.8 + Math.abs(p.y - 0.4) * 0.9);
  const pot = smoothstep(1.14, 1.26, p.y) * smoothstep(0.3, 0.1, Math.hypot(p.x - FLUE[0], p.z - FLUE[1]));
  c = mix(c, SOOT, Math.max(mouth * 0.8, pot * 0.7));
  return c;
});

/** Charred firebox interior, faintly ember-lit near the coal bed. */
const charPaint = paint((p, _n, _s) => {
  const t = smoothstep(0.24, 0.48, p.y);
  return mix(mix("#1a1512", EMBER, 0.22 * (1 - t)), "#241f1b", t * 0.85 + noise(p, 0.03, 15) * 0.15);
});

/** Leather bellows skin. */
const leatherPaint = mottle("#a87844", "#8a5a30", { size: 0.035, seed: 7 });

/** Bellows boards: pale plank wood, grain running along the board. */
const bellowsWood = grain(WOOD_LT, "#8a5a30", { size: 0.015, axis: [-0.31, -0.06, 0.95], seed: 23 });

/** Dark iron with a faint sheen variation. */
const ironPaint = mottle(IRON, IRON_LT, { size: 0.05, seed: 9, contrast: 0.5 });

/** Tree stump: growth rings on the top, bark down the sides. */
const stumpBark = grain(BARK, BARK_DK, { size: 0.018, axis: "y", seed: 26 });
const stumpPaint = paint((p, n, s) => {
  if (n.y > 0.8) {
    const r = Math.hypot(p.x - STUMP[0], p.z - STUMP[1]) + 0.008 * noise(p, 0.02, 25);
    return Math.floor(r / 0.013) % 2 ? RING_A : RING_B;
  }
  return stumpBark.at(p, n, s);
});

/** A firewood log: bark along its length, growth rings on the cut ends. */
const barkFineX = grain(BARK, BARK_DK, { size: 0.006, axis: "x", seed: 41 });
const barkFineZ = grain(BARK, BARK_DK, { size: 0.006, axis: "z", seed: 41 });
const logPaint = (c: [number, number, number], along: "x" | "z") =>
  paint((p, n, s) => {
    const cap = along === "z" ? Math.abs(n.z) : Math.abs(n.x);
    if (cap > 0.85) {
      const r = along === "z" ? Math.hypot(p.x - c[0], p.y - c[1]) : Math.hypot(p.y - c[1], p.z - c[2]);
      return Math.floor(r / 0.011) % 2 ? RING_A : RING_B;
    }
    return (along === "z" ? barkFineZ : barkFineX).at(p, n, s);
  });

/** Barrel staves: vertical grain, dark seams every stave, charred inside above the water line. */
const staveGrain = grain(WOOD_TOP, WOOD_DARK, { size: 0.01, axis: "y", seed: 52 });
const barrelPaint = paint((p, n, s) => {
  const inner = (p.x - BARREL[0]) * n.x + (p.z - BARREL[1]) * n.z < 0;
  if (inner && p.y > 0.47) return mix("#3c2c1c", SOOT, noise(p, 0.03, 55));
  const seam = Math.abs(((s[1] + 15) % 30) - 15);
  let c = staveGrain.at(p, n, s);
  c = mix(c, PLANK_SIDE, noise(p, 0.05, 51) * 0.5);
  if (seam < 1.4) c = mix(c, "#3f2d1a", 0.7);
  return c;
});

/** Barrel water: dark, with faint concentric ripples. */
const waterPaint = paint((p, n, _s) => {
  if (n.y < 0.5) return WATER;
  const r = Math.hypot(p.x - BARREL[0], p.z - BARREL[1]);
  const ring = 0.5 + 0.5 * Math.sin(r * 55 - 1.2);
  return mix(WATER, WATER_LT, ring * 0.35 + noise(p, 0.02, 57) * 0.2);
});

// ---------------------------------------------------------------------------------------------------------------
// Drawings

/** The hanging shop sign: horseshoe, anvil and lettering on a dark board. */
const SIGN = svg(
  `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.5" y="0.5" width="63" height="47" rx="5" fill="${WOOD_BOARD}"/>
    <rect x="3.5" y="3.5" width="57" height="41" rx="3" fill="none" stroke="${BRASS}" stroke-width="2"/>
    <path d="M24 15 a8 8 0 1 1 16 0" fill="none" stroke="#e8c476" stroke-width="3.6" stroke-linecap="round"/>
    <circle cx="24" cy="13.4" r="1.1" fill="#e8c476"/>
    <circle cx="40" cy="13.4" r="1.1" fill="#e8c476"/>
    <circle cx="27" cy="9.4" r="1.1" fill="#e8c476"/>
    <circle cx="37" cy="9.4" r="1.1" fill="#e8c476"/>
    <rect x="17" y="22.5" width="25" height="4.5" rx="1" fill="#e8c476"/>
    <path d="M17 22.5 q-7 0 -8 3.4 l8 1.6 z" fill="#e8c476"/>
    <rect x="26.5" y="27" width="6" height="3" fill="#e8c476"/>
    <rect x="21" y="30" width="17" height="3.6" rx="1" fill="#e8c476"/>
    <text x="32" y="42.5" text-anchor="middle" font-family="Georgia, serif" font-size="7" fill="#f0dca8" letter-spacing="2">SMITHY</text>
  </svg>`,
  { size: 256 },
);

/** Grass tufts for the yard fringe. */
const grassTex = (seed: number) => {
  const r = rng(seed);
  const tones = [GRASS_A, GRASS_B, "#8aa04c", "#5f8f3a"];
  let body = "";
  for (let i = 0; i < 6; i++) {
    const x0 = 6 + r() * 20;
    const tip = x0 + (r() - 0.5) * 15;
    const h = 13 + r() * 15;
    body += `<path d="M${x0.toFixed(1)} 32 Q${(x0 + (tip - x0) * 0.15).toFixed(1)} ${(32 - h * 0.6).toFixed(1)} ${tip.toFixed(1)} ${(32 - h).toFixed(1)}" stroke="${tones[Math.floor(r() * tones.length)]}" stroke-width="2.7" fill="none" stroke-linecap="round"/>`;
  }
  return svg(`<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">${body}</svg>`, { size: 128 });
};

// ---------------------------------------------------------------------------------------------------------------
// Scene layout helpers

/** Zones other scatter must keep out of: [x, z, radius]. */
const ZONES: [number, number, number][] = [
  [FORGE[0], FORGE[1], 0.48], // forge
  [STUMP[0], STUMP[1], 0.28], // anvil stump
  [BARREL[0], BARREL[1], 0.28], // quench barrel
  [0.32, 0.36, 0.32], // workbench
  [0.51, -0.31, 0.32], // tool rack
  [0.26, -0.38, 0.24], // firewood pile
  [-0.53, -0.15, 0.26], // bellows
  [-0.64, 0.24, 0.14], // sign post
  [0.68, 0.28, 0.16], // lantern post
];
const blocked = (x: number, z: number, shrink = 1) =>
  ZONES.some(([zx, zz, zr]) => Math.hypot(x - zx, z - zz) < zr * shrink);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "blacksmithForgeOx" });
  const root = b.joint("root", { at: [0, 0, 0] });

  const box = (size: [number, number, number], color: string | Paint, at: V3, opts: PartOpts = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, ...opts });
  const cyl = (r0: number, r1: number, h: number, sides: number, color: string | Paint, at: V3, opts: PartOpts = {}) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, sides), color, { at, flat: true, ...opts });

  // ---- Base and ground -----------------------------------------------------------------------------------------
  b.lathe(
    [
      [0, 0],
      [0.76, 0],
      [0.76, 0.062],
      [0.72, 0.075],
      [0, 0.075],
    ],
    { at: [0, 0, 0], segments: 8, color: plankPaint, bone: root, name: "base" },
  );
  const ground = b.lathe(
    [
      [0, 0],
      [0.715, 0],
      [0.715, 0.025],
      [0, 0.025],
    ],
    { at: [0, 0.075, 0], segments: 12, color: groundPaint, bone: root, name: "ground" },
  );

  // ---- Forge hearth --------------------------------------------------------------------------------------------
  // Footing slab, then courses of stone: side pillars, back wall, lintel, hearth table. Mouth faces +Z.
  const FX = FORGE[0];
  const FZ = FORGE[1];
  box([0.58, 0.12, 0.52], forgeStone, [FX, 0.16, FZ], { bone: root, name: "hearthFooting" });
  const course = (y0: number, h: number) => {
    box([0.13, h, 0.52], forgeStone, [FX - 0.205, y0 + h / 2, FZ], { bone: root, name: "forgePillar" });
    box([0.13, h, 0.52], forgeStone, [FX + 0.205, y0 + h / 2, FZ], { bone: root, name: "forgePillar" });
    box([0.28, h, 0.11], forgeStone, [FX, y0 + h / 2, FZ - 0.205], { bone: root, name: "forgeBack" });
  };
  course(0.22, 0.11);
  course(0.33, 0.11);
  course(0.44, 0.11);
  box([0.56, 0.08, 0.52], forgeStone, [FX, 0.59, FZ], { bone: root, name: "forgeLintel" });
  box([0.6, 0.065, 0.54], forgeStone, [FX, 0.6625, FZ + 0.01], { bone: root, name: "hearthTable" });
  box([0.6, 0.035, 0.06], forgeStone, [FX, 0.7125, FZ + 0.27], { bone: root, name: "tableLip" });

  // Charred firebox: floor slab and back panel, ember-lit from below.
  box([0.28, 0.025, 0.42], charPaint, [FX, 0.2325, FZ], { bone: root, name: "fireFloor" });
  box([0.28, 0.28, 0.025], charPaint, [FX, 0.39, FZ - 0.14], { bone: root, name: "fireBack" });

  // Chimney: four tapering stone courses, a cap slab, a dark flue mouth.
  for (let i = 0; i < 4; i++) {
    const y0 = 0.695 + i * 0.14;
    const w0 = 0.28 - i * 0.02;
    b.frustumBox([FLUE[0], y0, FLUE[1]], [FLUE[0], y0 + 0.14, FLUE[1]], [w0, w0], [w0 - 0.02, w0 - 0.02], {
      bone: root,
      color: forgeStone,
      name: "chimney",
    });
  }
  box([0.32, 0.045, 0.32], forgeStone, [FLUE[0], 1.2775, FLUE[1]], { bone: root, name: "chimneyCap" });
  box([0.1, 0.012, 0.1], SOOT, [FLUE[0], 1.306, FLUE[1]], { bone: root, name: "flueMouth" });

  // Coal bed: dark chunks, glowing embers, and low flames.
  const cr = rng(31);
  for (let i = 0; i < 9; i++) {
    const px = FX - 0.12 + cr() * 0.22;
    const pz = FZ - 0.04 + cr() * 0.24;
    const rad = 0.026 + cr() * 0.02;
    const hot = i < 6;
    const chunk = b.part(new THREE.DodecahedronGeometry(rad, 0), hot ? (i % 2 ? EMBER_MID : EMBER_HOT) : COAL, {
      bone: root,
      at: [px, 0.262 + cr() * 0.024, pz],
      flat: true,
      name: "coal",
    });
    if (hot) glow(chunk, 1.1);
  }
  glow(b.part(new THREE.ConeGeometry(0.048, 0.19, 5), EMBER_MID, { bone: root, at: [FX - 0.05, 0.345, FZ + 0.06], dir: [0.18, 1, -0.08], flat: true, name: "flame" }), 1.8);
  glow(b.part(new THREE.ConeGeometry(0.055, 0.14, 5), EMBER_HOT, { bone: root, at: [FX + 0.04, 0.325, FZ + 0.12], dir: [-0.12, 1, 0.14], flat: true, name: "flame" }), 2);
  glow(b.part(new THREE.ConeGeometry(0.038, 0.12, 5), EMBER_MID, { bone: root, at: [FX, 0.325, FZ - 0.02], dir: [-0.2, 1, -0.12], flat: true, name: "flame" }), 1.6);

  // Stray embers and cooled clinker on the ground in front of the forge.
  for (const [ex, ez, hot] of [
    [-0.1, 0.12, 1],
    [-0.26, 0.06, 1],
    [0.0, 0.08, 0],
  ] as const) {
    const e = box([0.022, 0.016, 0.022], hot ? EMBER : COAL, [ex, GY + 0.006, ez], { bone: root, name: "ember" });
    if (hot) glow(e, 0.7);
  }

  // A poker leaning against the hearth table's lip.
  b.rod([0.24, GY, 0.02], [0.16, 0.715, -0.01], [0.009, 0.007], { bone: root, color: ironPaint, name: "poker" });

  // Coal heap and a pair of tongs resting on the hearth table.
  const heap = rng(37);
  for (let i = 0; i < 5; i++) {
    const chunk = b.part(
      new THREE.DodecahedronGeometry(0.022 + heap() * 0.012, 0),
      i === 0 ? EMBER : COAL,
      { bone: root, at: [0.01 + heap() * 0.09, 0.7 + heap() * 0.015, -0.48 + heap() * 0.08], flat: true, name: "coalHeap" },
    );
    if (i === 0) glow(chunk, 0.5);
  }
  for (const tz of [0.014, -0.014])
    b.rod([0.03, 0.702, -0.4 + tz * 0.5], [0.045, 0.702, -0.12 + tz], 0.005, { bone: root, color: ironPaint, name: "tableTongs" });
  b.part(new THREE.SphereGeometry(0.009, 6, 4), IRON_LT, { bone: root, at: [0.037, 0.706, -0.26], flat: true, name: "tableTongsRivet" });

  // ---- Bellows -------------------------------------------------------------------------------------------------
  // Nozzle into the forge's left wall; the leather wedge lies on a trestle, its top board hinged at the nozzle end.
  const N = new THREE.Vector3(-0.47, 0.4, -0.3);
  const T = new THREE.Vector3(-0.6, 0.375, 0.1);
  const u = T.clone().sub(N).normalize();
  const vUp = new THREE.Vector3(0, 1, 0).addScaledVector(u, -u.y).normalize();
  const wSide = new THREE.Vector3().crossVectors(vUp, u).normalize();
  const along = (t: number, upOff: number, sideOff = 0) =>
    N.clone().addScaledVector(u, 0.42 * t).addScaledVector(vUp, upOff).addScaledVector(wSide, sideOff);

  b.rod([-0.41, 0.4, -0.3], N.toArray() , [0.032, 0.058], { bone: root, color: ironPaint, name: "bellowsNozzle" });
  b.frustumBox(along(0, -0.014).toArray() , along(1.06, -0.024).toArray() , [0.23, 0.028], [0.23, 0.024], {
    bone: root,
    color: bellowsWood,
    name: "bellowsBottom",
  });

  const leatherStations = [0.12, 0.26, 0.4, 0.54, 0.68, 0.82, 0.94].map((t, i) => ({
    at: along(t, 0).toArray() ,
    w: i % 2 ? 0.185 : 0.25,
    h: 0.008 + 0.055 * t,
  }));
  b.loft(leatherStations, { bone: root, color: leatherPaint, name: "bellowsLeather", detail: 0.7 });

  const bellowsLid = b.joint("bellowsLid", { parent: root, at: along(0, 0.014).toArray() , dir: u.toArray() , role: "hinge" });
  b.frustumBox(bellowsLid.local([0, 0.006, 0]), bellowsLid.local([0, 0.32, 0.004]), [0.23, 0.028], [0.23, 0.024], {
    bone: bellowsLid,
    color: bellowsWood,
    name: "bellowsTop",
  });
  b.rod(bellowsLid.local([0, 0.31, 0.01]), bellowsLid.local([0, 0.38, 0.09]), [0.012, 0.011], {
    bone: bellowsLid,
    color: WOOD_LT,
    name: "bellowsHandle",
  });
  box([0.05, 0.034, 0.034], LEATHER_DK, bellowsLid.local([0, 0.405, 0.105]) , {
    bone: bellowsLid,
    name: "bellowsGrip",
  });

  for (const t of [0.3, 0.76])
    for (const side of [1, -1]) {
      const top = along(t, -0.028, side * 0.085);
      b.rod(top.toArray() , [top.x, GY, top.z + side * 0.015], [0.01, 0.008], {
        bone: root,
        color: PLANK_DARK,
        name: "trestleLeg",
      });
    }

  // ---- Anvil and stump -----------------------------------------------------------------------------------------
  const SX = STUMP[0];
  const SZ = STUMP[1];
  cyl(0.17, 0.15, 0.4, 10, stumpPaint, [SX, GY + 0.2, SZ], { bone: root, name: "stump" });
  const rootBump = rng(45);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + rootBump() * 0.8;
    const rr = 0.165 + rootBump() * 0.02;
    b.part(new THREE.SphereGeometry(0.032, 6, 4), BARK, {
      bone: root,
      at: [SX + Math.cos(a) * rr, GY + 0.012, SZ + Math.sin(a) * rr],
      scale: [1.4, 0.7, 1.4],
      flat: true,
      name: "stumpRoot",
    });
  }
  const anvil = mottle(IRON, IRON_LT, { size: 0.04, seed: 63, contrast: 0.4 });
  box([0.32, 0.055, 0.16], anvil, [SX, GY + 0.4275, SZ], { bone: root, name: "anvilBase" });
  box([0.14, 0.1, 0.095], anvil, [SX, GY + 0.505, SZ], { bone: root, name: "anvilWaist" });
  box([0.38, 0.07, 0.12], anvil, [SX, GY + 0.59, SZ], { bone: root, name: "anvilFace" });
  b.part(new THREE.ConeGeometry(0.05, 0.17, 6), anvil, {
    bone: root,
    at: [SX + 0.265, GY + 0.59, SZ],
    dir: [1, 0, 0],
    flat: true,
    name: "anvilHorn",
  });
  box([0.024, 0.006, 0.032], SOOT, [SX - 0.08, GY + 0.628, SZ], { bone: root, name: "hardyHole" });

  // The half-forged sword: glowing at the guard end, cooling to raw steel toward the tip, handle off the heel.
  const bladeAt = (x: number): V3 => [-0.54 + x, 0.737, SZ + 0.02];
  glow(
    b.extrude(
      [
        [0, 0],
        [0.14, 0],
        [0.14, 0.04],
        [0, 0.04],
      ],
      { at: bladeAt(0), x: [1, 0, 0], y: [0, 0, -1], thickness: [0.026, 0.008], color: EMBER_HOT, bone: root, name: "swordHot" },
    ),
    2.2,
  );
  glow(
    b.extrude(
      [
        [0, 0],
        [0.06, 0],
        [0.06, 0.04],
        [0, 0.04],
      ],
      { at: bladeAt(0.14), x: [1, 0, 0], y: [0, 0, -1], thickness: [0.026, 0.008], color: EMBER_MID, bone: root, name: "swordWarm" },
    ),
    1.7,
  );
  glow(
    b.extrude(
      [
        [0, 0],
        [0.06, 0.01],
        [0.06, 0.03],
        [0, 0.04],
      ],
      { at: bladeAt(0.2), x: [1, 0, 0], y: [0, 0, -1], thickness: [0.026, 0.008], color: "#e0722c", bone: root, name: "swordCooling" },
    ),
    1,
  );
  b.extrude(
    [
      [0, 0.01],
      [0.06, 0.02],
      [0, 0.03],
    ],
    { at: bladeAt(0.26), x: [1, 0, 0], y: [0, 0, -1], thickness: [0.026, 0.008], color: STEEL, bone: root, name: "swordTip" },
  );
  box([0.03, 0.05, 0.075], IRON, [-0.565, 0.757, SZ], { bone: root, name: "swordGuard" });
  cyl(0.014, 0.014, 0.09, 8, LEATHER_DK, [-0.625, 0.757, SZ], { bone: root, name: "swordGrip", dir: [-1, 0, 0] });
  b.part(new THREE.SphereGeometry(0.019, 6, 4), BRASS, { bone: root, at: [-0.68, 0.757, SZ], flat: true, name: "swordPommel" });

  // ---- Quench barrel -------------------------------------------------------------------------------------------
  const BX = BARREL[0];
  const BZ = BARREL[1];
  b.lathe(
    [
      [0.15, 0],
      [0.163, 0.05],
      [0.176, 0.26],
      [0.163, 0.46],
      [0.152, 0.505, "sharp"],
      [0.138, 0.505, "sharp"],
      [0.149, 0.44],
      [0.16, 0.26],
      [0.148, 0.06],
      [0.137, 0.015],
    ],
    { at: [BX, GY, BZ], segments: 12, color: barrelPaint, bone: root, name: "barrel" },
  );
  b.part(new THREE.CircleGeometry(0.15, 12), waterPaint, {
    bone: root,
    at: [BX, GY + 0.365, BZ],
    dir: [0, 1, 0],
    axis: "z",
    name: "barrelWater",
  });
  const hoop = (h: number, r: number) => {
    const pts: V3[] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      pts.push([BX + Math.cos(a) * r, GY + h, BZ + Math.sin(a) * r]);
    }
    b.sweep(polyline(pts, { closed: true }), () => [0.009, 0.016], {
      bone: root,
      color: IRON,
      section: "box",
      name: "barrelHoop",
    });
  };
  hoop(0.06, 0.166);
  hoop(0.26, 0.179);
  hoop(0.44, 0.166);

  // A hot bar on tongs, half-dunked in the quench.
  glow(
    b.rod([BX, 0.72, BZ], [BX, 0.44, BZ], 0.012, {
      bone: root,
      color: EMBER_MID,
      bands: [
        [0.55, EMBER_MID],
        [1, STEEL],
      ],
      name: "quenchBar",
    }),
    1.3,
  );
  b.rod([0.39, 0.595, BZ - 0.027], [BX, 0.705, BZ - 0.008], 0.006, { bone: root, color: ironPaint, name: "quenchTongs" });
  b.rod([0.39, 0.595, BZ + 0.027], [BX, 0.705, BZ + 0.008], 0.006, { bone: root, color: ironPaint, name: "quenchTongs" });

  // ---- Tool rack -----------------------------------------------------------------------------------------------
  const RA = new THREE.Vector3(0.44, 0, -0.38);
  const RB = new THREE.Vector3(0.58, 0, -0.24);
  const uR = RB.clone().sub(RA).normalize();
  const pR = new THREE.Vector3().crossVectors(uR, new THREE.Vector3(0, 1, 0)).normalize();
  const railPt = (t: number, y: number) => RA.clone().addScaledVector(RB.clone().sub(RA), t).setY(y);
  for (const t of [0, 1]) {
    const p = railPt(t, 0);
    b.part(new THREE.BoxGeometry(0.06, 1.22, 0.06), PLANK_DARK, { bone: root, at: [p.x, GY + 0.61, p.z], name: "rackPost" });
  }
  for (const y of [0.96, 1.18])
    b.rod(railPt(0, y).toArray() , railPt(1, y).toArray() , 0.02, { bone: root, color: WOOD_DARK, name: "rackRail" });
  b.rod(railPt(0, 0.3).toArray() , railPt(1, 0.3).toArray() , 0.012, { bone: root, color: WOOD_DARK, name: "rackBrace" });

  const hammer = (t: number, headW: number, headH: number) => {
    const top = railPt(t, 1.155);
    const bottom = railPt(t, 0.9);
    b.rod(top.toArray() , bottom.toArray() , 0.011, { bone: root, color: WOOD_LT, name: "hammerHandle" });
    b.frustumBox(
      bottom.clone().addScaledVector(pR, headW / 2).toArray() ,
      bottom.clone().addScaledVector(pR, -headW / 2).toArray() ,
      [headH, headH],
      [headH, headH],
      { bone: root, color: ironPaint, name: "hammerHead" },
    );
  };
  hammer(0.14, 0.11, 0.062);
  hammer(0.36, 0.085, 0.05);
  const tongs = (t: number) => {
    const top = railPt(t, 1.15);
    b.rod(top.clone().addScaledVector(pR, 0.012).toArray() , top.clone().add(new THREE.Vector3(0, -0.3, 0)).addScaledVector(pR, 0.055).toArray() , 0.007, { bone: root, color: ironPaint, name: "tongs" });
    b.rod(top.clone().addScaledVector(pR, -0.012).toArray() , top.clone().add(new THREE.Vector3(0, -0.3, 0)).addScaledVector(pR, -0.055).toArray() , 0.007, { bone: root, color: ironPaint, name: "tongs" });
    b.part(new THREE.SphereGeometry(0.011, 6, 4), IRON_LT, { bone: root, at: top.toArray() , flat: true, name: "tongsRivet" });
  };
  tongs(0.6);

  // ---- Workbench ----------------------------------------------------------------------------------------------
  const bench = mottle(WOOD_DARK, PLANK_DARK, { size: 0.05, seed: 71 });
  box([0.38, 0.045, 0.24], plankPaint, [0.32, 0.6825, 0.36], { bone: root, name: "benchTop" });
  for (const sx of [0.165, 0.475])
    for (const sz of [0.26, 0.46]) box([0.045, 0.56, 0.045], bench, [sx, GY + 0.28, sz], { bone: root, name: "benchLeg" });
  b.rod([0.165, GY + 0.36, 0.26], [0.475, GY + 0.36, 0.26], 0.014, { bone: root, color: bench, name: "benchStretcher" });
  b.rod([0.165, GY + 0.36, 0.46], [0.475, GY + 0.36, 0.46], 0.014, { bone: root, color: bench, name: "benchStretcher" });

  // Vice on the bench's anvil-side end.
  box([0.07, 0.045, 0.13], IRON, [0.17, 0.7275, 0.36], { bone: root, name: "viceBase" });
  box([0.06, 0.07, 0.028], IRON, [0.17, 0.785, 0.43], { bone: root, name: "viceJaw" });
  box([0.06, 0.07, 0.028], IRON, [0.17, 0.785, 0.3], { bone: root, name: "viceJaw" });
  b.rod([0.17, 0.76, 0.28], [0.17, 0.76, 0.44], 0.008, { bone: root, color: IRON_LT, name: "viceScrew" });
  // A mallet and a horseshoe lying on the top.
  cyl(0.032, 0.032, 0.09, 8, WOOD_LT, [0.4, 0.7375, 0.4], { bone: root, name: "malletHead", dir: [0, 0, 1] });
  b.rod([0.4, 0.7325, 0.36], [0.4, 0.7325, 0.52], 0.011, { bone: root, color: WOOD_LT, name: "malletHandle" });

  // ---- Horseshoes ----------------------------------------------------------------------------------------------
  const shoe = (at: V3, opts: { x?: V3; y?: V3; color?: string | Paint; name?: string } = {}) =>
    b.extrude(
      [
        [-0.055, 0],
        [-0.06, 0.05],
        [-0.045, 0.1],
        [0, 0.125],
        [0.045, 0.1],
        [0.06, 0.05],
        [0.055, 0],
        [0.025, 0.004],
        [0.028, 0.05],
        [0.018, 0.083],
        [0, 0.095],
        [-0.018, 0.083],
        [-0.028, 0.05],
        [-0.025, 0.004],
      ],
      {
        at,
        x: opts.x ?? [0, 0, 1],
        y: opts.y ?? [0, 1, 0],
        thickness: 0.018,
        bevel: 0,
        smoothing: 0,
        color: opts.color ?? ironPaint,
        bone: root,
        name: opts.name ?? "horseshoe",
      },
    );
  const rust = mottle("#4d423a", "#6b5142", { size: 0.02, seed: 81 });
  shoe([-0.34, GY + 0.009, 0.1], { x: [1, 0, 0], y: [0, 0, 1] });
  shoe([0.3, GY + 0.009, -0.06], { x: [1, 0, 0], y: [0, 0, -1], color: rust });
  shoe([0.06, GY + 0.009, 0.44], { x: [1, 0, 0], y: [0, 0, 1] });
  shoe([0.28, 0.714, 0.31], { x: [1, 0, 0], y: [0, 0, 1] });
  shoe(railPt(0.86, 1.032).toArray() ); // hanging on the rack

  // Hammer scale flakes knocked off on the anvil, scattered on its work side.
  const flakes = rng(93);
  for (let i = 0; i < 6; i++) {
    const a = (-0.5 + flakes()) * Math.PI;
    const rr = 0.18 + flakes() * 0.1;
    box(
      [0.014 + flakes() * 0.012, 0.005, 0.012 + flakes() * 0.01],
      i % 2 ? STEEL : "#57514b",
      [SX + Math.cos(a) * rr, GY + 0.004, SZ + Math.sin(a) * rr],
      { bone: root, rotation: [0, flakes() * 180, 0], name: "scaleFlake" },
    );
  }

  // ---- Firewood pile -------------------------------------------------------------------------------------------
  const logs: { c: [number, number, number]; along: "x" | "z"; r: number; l: number }[] = [
    { c: [0.26, GY + 0.048, -0.44], along: "x", r: 0.048, l: 0.2 },
    { c: [0.26, GY + 0.046, -0.33], along: "x", r: 0.046, l: 0.18 },
    { c: [0.24, GY + 0.14, -0.385], along: "z", r: 0.044, l: 0.18 },
    { c: [0.27, GY + 0.175, -0.385], along: "x", r: 0.03, l: 0.14 },
  ];
  for (const log of logs)
    cyl(log.r, log.r * 1.08, log.l, 7, logPaint(log.c, log.along), log.c, {
      bone: root,
      name: "firewoodLog",
      dir: log.along === "x" ? [1, 0, 0] : [0, 0, 1],
    });

  // ---- Lantern post and lantern --------------------------------------------------------------------------------
  const LX = 0.68;
  const LZ = 0.28;
  cyl(0.024, 0.03, 1.18, 8, WOOD_DARK, [LX, GY + 0.59, LZ], { bone: root, name: "lanternPost" });
  b.sweep(
    catmull([
      [LX, GY + 1.14, LZ],
      [LX - 0.06, GY + 1.13, LZ],
      [LX - 0.11, GY + 1.08, LZ],
      [LX - 0.12, GY + 1.02, LZ],
    ]),
    [0.013, 0.01],
    { bone: root, color: ironPaint, caps: "flat", name: "lanternHook" },
  );
  const lanternSwing = b.joint("lanternSwing", { parent: root, at: [LX - 0.12, GY + 1.02, LZ], dir: [0, -1, 0], role: "hinge" });
  b.part(new THREE.ConeGeometry(0.075, 0.055, 4), IRON, { bone: lanternSwing, at: lanternSwing.local([0, 0.03, 0]), flat: true, name: "lanternCap" });
  b.part(new THREE.SphereGeometry(0.012, 6, 4), BRASS, { bone: lanternSwing, at: lanternSwing.local([0, -0.012, 0]), flat: true, name: "lanternFinial" });
  box([0.095, 0.015, 0.095], IRON, lanternSwing.local([0, 0.068, 0]) , { bone: lanternSwing, name: "lanternTop" });
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      box([0.012, 0.16, 0.012], IRON, lanternSwing.local([sx * 0.043, 0.155, sz * 0.043]) , { bone: lanternSwing, name: "lanternPost" });
  for (const pane of [
    { at: lanternSwing.local([0, 0.155, 0.046]) , dir: [0, 0, 1]  },
    { at: lanternSwing.local([0, 0.155, -0.046]) , dir: [0, 0, -1]  },
    { at: lanternSwing.local([0.046, 0.155, 0]) , dir: [1, 0, 0]  },
    { at: lanternSwing.local([-0.046, 0.155, 0]) , dir: [-1, 0, 0]  },
  ])
    glow(
      b.part(new THREE.PlaneGeometry(0.082, 0.14), GLASS, { bone: lanternSwing, at: pane.at, dir: pane.dir, axis: "z", name: "lanternGlass" }),
      1.1,
    );
  glow(
    b.part(new THREE.ConeGeometry(0.02, 0.06, 5), EMBER_HOT, { bone: lanternSwing, at: lanternSwing.local([0, 0.225, 0]), flat: true, name: "lanternFlame" }),
    1.6,
  );
  box([0.1, 0.02, 0.1], IRON, lanternSwing.local([0, 0.245, 0]) , { bone: lanternSwing, name: "lanternTray" });
  b.part(new THREE.SphereGeometry(0.014, 6, 4), IRON, { bone: lanternSwing, at: lanternSwing.local([0, 0.262, 0]), flat: true, name: "lanternFoot" });

  // ---- Shop sign post and hanging sign -------------------------------------------------------------------------
  const PX = -0.64;
  const PZ = 0.24;
  cyl(0.028, 0.034, 1.22, 8, WOOD_DARK, [PX, GY + 0.61, PZ], { bone: root, name: "signPost" });
  b.part(new THREE.SphereGeometry(0.036, 6, 4), BRASS, { bone: root, at: [PX, GY + 1.24, PZ], flat: true, name: "signPostKnob" });
  b.rod([PX, GY + 1.19, PZ + 0.01], [PX, 1.26, 0.46], 0.015, { bone: root, color: ironPaint, name: "signArm" });
  b.rod([PX, GY + 1.0, PZ + 0.035], [PX, 1.245, 0.4], 0.01, { bone: root, color: ironPaint, name: "signBracket" });
  const signSwing = b.joint("signSwing", { parent: root, at: [PX, 1.26, 0.46], dir: [0, -1, 0], role: "hinge" });
  box([0.26, 0.022, 0.022], WOOD_DARK, signSwing.local([0, 0.008, 0]) , { bone: signSwing, name: "signYoke" });
  for (const sx of [1, -1])
    b.rod(signSwing.local([sx * 0.1, 0, 0]), signSwing.local([sx * 0.1, 0.075, 0]), 0.0055, {
      bone: signSwing,
      color: ROPE,
      name: "signRope",
    });
  box([0.36, 0.26, 0.02], WOOD_BOARD, signSwing.local([0, 0.205, 0]) , { bone: signSwing, name: "signBoard" });
  b.part(new THREE.PlaneGeometry(0.32, 0.22), "#ffffff", {
    bone: signSwing,
    at: signSwing.local([0, 0.205, 0.013]) ,
    dir: [0, 0, 1],
    axis: "z",
    up: [0, 1, 0],
    texture: SIGN,
    name: "signFace",
  });
  b.part(new THREE.PlaneGeometry(0.32, 0.22), "#ffffff", {
    bone: signSwing,
    at: signSwing.local([0, 0.205, -0.013]) ,
    dir: [0, 0, -1],
    axis: "z",
    up: [0, 1, 0],
    texture: SIGN,
    name: "signFace",
  });

  // ---- Chimney smoke -------------------------------------------------------------------------------------------
  const SMOKE_STEPS = ["#b9bcb9", "#c2c5c2", "#ccd0cc", "#d5d8d5", "#dee1de"];
  {
    let sy = 1.312 + 0.034 - 0.02;
    let sr2 = 0.034;
    for (let i = 0; i < 5; i++) {
      b.part(new THREE.IcosahedronGeometry(sr2, 0), SMOKE_STEPS[i], {
        bone: root,
        at: [FLUE[0] + 0.02 * i, sy, FLUE[1] + 0.016 * i],
        flat: true,
        name: "smoke",
      });
      const nr = sr2 + 0.014;
      sy += sr2 + nr - 0.035;
      sr2 = nr;
    }
  }

  // ---- Pebbles and grass ---------------------------------------------------------------------------------------
  const sr = rng(91);
  const drop = (count: number, minR: number, maxR: number, shrink: number, place: (x: number, z: number, i: number) => void) => {
    let placed = 0;
    for (let guard = 0; placed < count && guard < count * 60; guard++) {
      const a = sr() * Math.PI * 2;
      const r = minR + sr() * (maxR - minR);
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (blocked(x, z, shrink)) continue;
      place(x, z, placed++);
    }
  };
  drop(12, 0.3, 0.66, 0.72, (x, z, i) => {
    const rad = 0.02 + sr() * 0.024;
    b.part(new THREE.SphereGeometry(rad, 6, 4), i % 3 ? STONE : STONE_DK, {
      bone: root,
      at: [x, GY + 0.006, z],
      scale: [1, 0.55, 1],
      rotation: [0, sr() * 180, 0],
      flat: true,
      name: "pebble",
    });
  });
  const hits = b.surface(ground).scatter(26, {
    rng: rng(77),
    minDist: 0.075,
    filter: (h) => h.n.y > 0.9 && Math.hypot(h.at.x, h.at.z) > 0.42 && Math.hypot(h.at.x, h.at.z) < 0.67 && !blocked(h.at.x, h.at.z, 0.6),
  });
  b.cards(hits, [grassTex(111), grassTex(222)], {
    size: [0.055, 0.095],
    lean: 62,
    bend: 22,
    flow: (h) => [h.at.x, 0, h.at.z],
    vary: 0.3,
    spin: 35,
    rng: rng(78),
  });

  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Types

type PartOpts = {
  bone?: Joint;
  name?: string;
  dir?: V3;
  axis?: "x" | "y" | "z";
  up?: V3;
  scale?: V3;
  flat?: boolean;
  rotation?: V3;
  texture?: Texture;
};