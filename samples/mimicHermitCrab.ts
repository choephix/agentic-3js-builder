// Mimic hermit crab, in pixel art. A hermit crab that has moved into a pirate's treasure chest instead of a shell:
// an iron-banded plank chest with a padlock hanging from its staple, the lid propped open on a heap of gold coins and
// gems that spills over the front rim and onto the floor, and the crab's eyestalks, antennae, one oversized and one
// small claw and four walking legs poking out of the gap and out of holes broken through the side planks.
// Style: post-Minecraft low-poly. Wood, iron rivets, coins, gems, eyes, the padlock face and the broken holes are
// 4x4..32x30 `svg()` pixel drawings rasterised 1:1 and cropped onto boxes on whole-pixel steps; every paint (gold,
// iron, crab shell) is quantised into square hard-edged cells from a small palette. Volumes are boxes, stepped
// ziggurats, 4-6 sided tubes and claws extruded from stepped, pixel-staircase outlines.
import { BoxGeometry, CylinderGeometry, LatheGeometry, PlaneGeometry, Vector2 } from "three";
import type { BufferGeometry } from "three";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { paint } from "../src/paint";
import { catmull, polyline } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Mimic hermit crab",
  builtBy: "Claude Opus 5.5",
  description:
    "Pixel-art hermit crab living in an iron-banded treasure chest: hinged lid, spilling coins and gems, one giant claw.",
};

type V3 = [number, number, number];
type Pal = Record<string, string>;

const WHITE = "#ffffff";

/** One chest pixel, in meters: every wood, gold and iron texel is this size. The crab uses half of it. */
const TEXEL = 0.0115;
const CRAB_TEXEL = TEXEL / 2;

// ---------------------------------------------------------------------------------------------------------------
// Pixel textures.

const canvas = (w: number, h: number, fill = ".") => Array.from({ length: h }, () => Array<string>(w).fill(fill));

/** A pixel grid as an `svg()` drawing: one rect per horizontal run, rasterised 1:1 without smoothing. */
function pixels(rows: string[][], pal: Pal) {
  const h = rows.length;
  const w = rows[0].length;
  const rects: string[] = [];
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      const c = rows[y][x];
      let n = 1;
      while (x + n < w && rows[y][x + n] === c) n++;
      if (c !== ".") rects.push(`<rect x="${x}" y="${y}" width="${n}" height="1" fill="${pal[c]}"/>`);
      x += n;
    }
  }
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${rects.join("")}</svg>`,
    { size: Math.max(w, h), pixelated: true },
  );
}

/** Rows drawn as strings, one character per pixel. */
const grid = (rows: string[]) => rows.map((r) => r.split(""));

const WOOD_W = 32;
const WOOD_H = 30;
const PLANK = 6;

/** Planks: five 6-pixel boards with a dark seam row, lit top row, shaded bottom row, grain runs, butt joints, nails and knots. */
function woodTile(seed: number) {
  const r = rng(seed);
  const g = canvas(WOOD_W, WOOD_H, "a");
  for (let p = 0; p < WOOD_H / PLANK; p++) {
    const y0 = p * PLANK;
    const tone = r() < 0.4 ? "b" : "a";
    for (let x = 0; x < WOOD_W; x++) {
      g[y0][x] = "k";
      g[y0 + 1][x] = "c";
      for (let y = y0 + 2; y < y0 + PLANK - 1; y++) g[y][x] = tone;
      g[y0 + PLANK - 1][x] = "d";
    }
    // Grain: short darker runs along the board.
    for (let i = 0; i < 6; i++) {
      const y = y0 + 2 + Math.floor(r() * 3);
      const x0 = Math.floor(r() * WOOD_W);
      const n = 3 + Math.floor(r() * 6);
      for (let k = 0; k < n; k++) g[y][(x0 + k) % WOOD_W] = tone === "a" ? "b" : "e";
    }
    // A butt joint with a nail either side.
    const bx = 4 + Math.floor(r() * (WOOD_W - 8));
    for (let y = y0 + 1; y < y0 + PLANK; y++) g[y][bx] = "k";
    g[y0 + 2][bx - 2] = "n";
    g[y0 + 2][bx + 2] = "n";
    // A knot.
    if (r() < 0.7) {
      const kx = Math.floor(r() * (WOOD_W - 3));
      const ky = y0 + 2;
      g[ky][kx] = "d";
      g[ky][kx + 1] = "k";
      g[ky][kx + 2] = "d";
      g[ky + 1][kx + 1] = "d";
    }
  }
  return pixels(g, {
    a: "#8a4f22",
    b: "#9c5c2a",
    c: "#c07a3a",
    d: "#5e3214",
    e: "#7a4219",
    k: "#2c160a",
    n: "#b8bcc4",
  });
}

/** A domed rivet head: dark rim, lit top-left. */
const RIVET = pixels(grid(["dmmd", "mhlm", "mllm", "dmmd"]), {
  d: "#1a1a20",
  m: "#4a4d58",
  l: "#7c808c",
  h: "#d4d8e0",
});

/** A gold coin face: a stepped disc with a dark rim, a lit upper-left arc and a stamped crown. */
function coinTexture() {
  const N = 12;
  const g = canvas(N, N);
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const dx = x + 0.5 - N / 2;
      const dy = y + 0.5 - N / 2;
      const d = Math.hypot(dx, dy);
      if (d > 6) continue;
      g[y][x] = d > 4.9 ? "r" : dx + dy < -3.5 && d > 3.4 ? "h" : "g";
    }
  // Crown emblem.
  const crown = ["o.o.o", "ooooo", "ooooo", "e.e.e"];
  crown.forEach((row, j) =>
    row.split("").forEach((c, i) => c !== "." && (g[4 + j][3 + i + 0] = c === "o" ? "e" : "r")),
  );
  return pixels(g, { r: "#a25e00", g: "#f2b418", h: "#fff29a", e: "#c77a00" });
}

/** Gem facets for a six-sided lathe: two pixels per facet round the crown, a bright table at the top. Tinted per gem. */
function gemTexture() {
  const W = 12;
  const H = 8;
  const g = canvas(W, H);
  const shade = ["w", "l", "m", "d", "m", "l"];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const f = shade[x >> 1];
      g[y][x] = y < 2 ? (x % 4 === 0 ? "w" : "l") : y < 4 ? f : f === "w" ? "l" : f === "l" ? "m" : "d";
    }
  g[5][1] = "w";
  g[2][6] = "w";
  return pixels(g, { w: "#ffffff", l: "#c8c8c8", m: "#8c8c8c", d: "#505050" });
}

/** The crab's eye: glossy black with a two-pixel glint. */
const EYE = pixels(grid(["kkkkkk", "kwwkkk", "kwgkkk", "kkkkkk", "kkkkgk", "kkkkkk"]), {
  k: "#0b0b12",
  w: "#ffffff",
  g: "#3a3d5c",
});

/** The padlock's face: a brass plate with a dark rim, a lit edge and a keyhole. */
const LOCK = pixels(
  grid([
    "kkkkkkkkkk",
    "khhhhhhhbk",
    "khbbbbbbdk",
    "khbbkkbbdk",
    "khbkkkkbdk",
    "khbbkkbbdk",
    "khbbkkbbdk",
    "khbbkkbbdk",
    "khbbbbbbdk",
    "kbddddddok",
    "kkkkkkkkkk",
  ]),
  { k: "#2a1a08", h: "#ffe07a", b: "#d8a12a", d: "#946414", o: "#6a4208" },
);

/** A hole broken through the planks: splintered pale edges round a black void; the rest is cut away. */
const HOLE = pixels(
  grid([
    "...s..s...",
    "..sdsdds..",
    ".sdkkkkds.",
    "sdkkkkkkds",
    ".dkkkkkkd.",
    "sdkkkkkkds",
    ".dkkkkkkd.",
    ".sdkkkkds.",
    "..sddsds..",
    "...s..s...",
  ]),
  { s: "#d8a064", d: "#5e3214", k: "#0c0604" },
);

// ---------------------------------------------------------------------------------------------------------------
// Paints: square cells in meters, a small palette, clumps at two scales, no gradients.

const cellHash = (x: number, y: number, z: number, seed: number) => {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1274126177) ^ Math.imul(seed, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

function voxels(palette: string[], seed: number, size = TEXEL) {
  return paint((p) => {
    const x = Math.floor(p.x / size);
    const y = Math.floor(p.y / size);
    const z = Math.floor(p.z / size);
    const clump = cellHash(Math.floor(x / 3), Math.floor(y / 3), Math.floor(z / 3), seed + 7);
    const v = clump * 0.55 + cellHash(x, y, z, seed) * 0.45;
    return palette[Math.min(palette.length - 1, Math.floor(v * palette.length))];
  });
}

const GOLD = voxels(["#a86a00", "#e09a10", "#f7c52a", "#ffe98a"], 4);
const IRON = voxels(["#23242b", "#2f3039", "#3d3f4a", "#3d3f4a", "#6b3218"], 2);
const BRASS = voxels(["#946414", "#c48a22", "#e0a834"], 9);
/** Crab shell: two reds in big clumps, sparse dark mottles and bright flecks, one pixel each. */
const SHELL = paint((p) => {
  const x = Math.floor(p.x / CRAB_TEXEL);
  const y = Math.floor(p.y / CRAB_TEXEL);
  const z = Math.floor(p.z / CRAB_TEXEL);
  const v = cellHash(x, y, z, 1);
  if (v < 0.09) return "#8e1e12";
  if (v > 0.94) return "#ff9a4a";
  return cellHash(Math.floor(x / 4), Math.floor(y / 4), Math.floor(z / 4), 8) < 0.5 ? "#d23c1c" : "#e8532a";
});
const CREAM = voxels(["#f0c890", "#ffe2b0", "#ffe2b0"], 3, CRAB_TEXEL);
const TIP = "#3a1210";
/** Legs: red shell, a cream band before the last joint, dark claw tips. */
const LEG = paint((_p, _n, s) => (s[0] > 0.9 ? TIP : s[0] > 0.6 && s[0] < 0.7 ? CREAM : SHELL));
/** Antennae: red and cream rings, a few centimetres each. */
const ANTENNA = paint((_p, _n, s) => (Math.floor(s[0] * 9) % 2 === 0 ? SHELL : CREAM));

// ---------------------------------------------------------------------------------------------------------------
// Geometry.

/** A box whose faces show whole-pixel crops of one tile, so any size keeps square texels. */
function tileBox(w: number, h: number, d: number, tw: number, th: number, rand: () => number) {
  const geo = new BoxGeometry(w, h, d);
  const uv = geo.getAttribute("uv");
  const faces: [number, number][] = [
    [d, h],
    [d, h],
    [w, d],
    [w, d],
    [w, h],
    [w, h],
  ];
  faces.forEach(([fw, fh], f) => {
    const nu = Math.min(tw, Math.max(1, Math.round(fw / TEXEL)));
    const nv = Math.min(th, Math.max(1, Math.round(fh / TEXEL)));
    const u0 = Math.floor(rand() * (tw - nu + 1)) / tw;
    const v0 = Math.floor(rand() * ((th - nv) / PLANK + 1)) * (PLANK / th);
    for (let i = 0; i < 4; i++) {
      const k = f * 4 + i;
      uv.setXY(k, u0 + uv.getX(k) * (nu / tw), Math.min(1 - nv / th, v0) + uv.getY(k) * (nv / th));
    }
  });
  return geo;
}

const faceted = (geo: BufferGeometry) => {
  const flat = geo.toNonIndexed();
  flat.computeVertexNormals();
  return flat;
};

/** A six-facet cut gem: pointed pavilion, a crown and a flat table. */
const gemGeo = (r: number) =>
  faceted(
    new LatheGeometry(
      [new Vector2(0, -r * 0.9), new Vector2(r, 0), new Vector2(r * 0.62, r * 0.45), new Vector2(0, r * 0.45)],
      6,
    ),
  );

/**
 * A pixel-staircase outline: columns `u` wide, each spanning [bottom, top] (in units of `unit`), traced round.
 * Starts `x0` columns back so the root sinks into whatever it grows from.
 */
function stepped(cols: [number, number][], u: number, unit: number, x0 = 0): [number, number, "sharp"][] {
  const pts: [number, number][] = [];
  const push = (x: number, y: number) => {
    const last = pts[pts.length - 1];
    if (!last || Math.abs(last[0] - x) > 1e-9 || Math.abs(last[1] - y) > 1e-9) pts.push([x, y]);
  };
  cols.forEach(([bot], i) => {
    push((i + x0) * u, bot * unit);
    push((i + 1 + x0) * u, bot * unit);
  });
  for (let i = cols.length - 1; i >= 0; i--) {
    push((i + 1 + x0) * u, cols[i][1] * unit);
    push((i + x0) * u, cols[i][1] * unit);
  }
  return pts.map(([x, y]) => [x, y, "sharp"]);
}

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "mimicHermitCrab" });
  const rand = rng(11);

  // Chest dimensions: 0.36 wide, 0.26 deep, body 0.17 tall, lifted 4 cm off the floor on the crab's legs.
  const W = 0.36;
  const D = 0.26;
  const Y0 = 0.04;
  const YT = 0.21;
  const ZB = -0.15;
  const ZF = ZB + D;
  const ZC = (ZB + ZF) / 2;
  const YC = (Y0 + YT) / 2;

  const body = b.joint("body", { at: [0, 0.2, 0], dir: [0, 0, 1], group: "body" });
  const woods = [woodTile(1), woodTile(2)];
  const woodBox = (w: number, h: number, d: number, at: V3, bone = body, group = "chest", i = 0) =>
    b.part(tileBox(w, h, d, WOOD_W, WOOD_H, rand), WHITE, { texture: woods[i], bone, at, group });

  // ------------------------------------------------------------------------------------------------ chest body
  woodBox(W, YT - Y0, D, [0, YC, ZC]);
  // Plinth: a thicker bottom board, one step out.
  woodBox(W + 0.016, 0.03, D + 0.016, [0, Y0 + 0.015, ZC], body, "chest", 1);
  const ironBox = (w: number, h: number, d: number, at: V3, bone = body, group = "chest") =>
    b.part(new BoxGeometry(w, h, d), IRON, { bone, at, group });
  const rivet = (at: V3, dir: V3, bone = body, group = "chest") =>
    b.part(new BoxGeometry(0.012, 0.012, 0.006), WHITE, { texture: RIVET, bone, at, dir, axis: "z", group });

  const BAND_X = 0.105;
  for (const s of [1, -1]) {
    ironBox(0.034, YT - Y0 + 0.036, D + 0.024, [s * BAND_X, YC + 0.001, ZC]);
    for (const y of [0.075, 0.12, 0.165]) {
      rivet([s * BAND_X, y, ZF + 0.014], [0, 0, 1]);
      rivet([s * BAND_X, y, ZB - 0.014], [0, 0, -1]);
    }
    // Corner caps: iron angles on the four vertical edges, a step proud of the planks.
    for (const z of [ZF, ZB]) {
      ironBox(0.04, YT - Y0 + 0.02, 0.04, [s * (W / 2 - 0.012), YC, z + (z > 0 ? -0.012 : 0.012)]);
      rivet([s * (W / 2 + 0.008), YT - 0.03, z + (z > 0 ? -0.012 : 0.012)], [s, 0, 0]);
      rivet([s * (W / 2 + 0.008), Y0 + 0.03, z + (z > 0 ? -0.012 : 0.012)], [s, 0, 0]);
    }
  }
  // Front rim: an iron lip along the top edge, where the coins spill over.
  ironBox(W + 0.012, 0.02, 0.02, [0, YT - 0.006, ZF + 0.002]);

  // Staple and padlock, hanging open-shackled at the front.
  ironBox(0.03, 0.03, 0.016, [0, YT - 0.035, ZF + 0.012]);
  const lockAt: V3 = [0, 0.125, ZF + 0.022];
  b.part(new BoxGeometry(0.072, 0.08, 0.03), BRASS, { bone: body, at: lockAt, group: "lock" });
  b.part(new PlaneGeometry(0.066, 0.074), WHITE, {
    texture: LOCK,
    bone: body,
    at: [lockAt[0], lockAt[1], lockAt[2] + 0.0165],
    dir: [0, 0, 1],
    axis: "z",
    group: "lock",
  });
  b.sweep(
    polyline([
      [-0.022, lockAt[1] + 0.036, lockAt[2]],
      [-0.022, YT - 0.03, lockAt[2]],
      [0.022, YT - 0.03, lockAt[2]],
      [0.022, lockAt[1] + 0.036, lockAt[2]],
    ]),
    0.0065,
    { section: "box", caps: "flat", skin: "rigid", color: "#9aa0ac", bone: body, group: "lock" },
  );

  // ------------------------------------------------------------------------------------------------ lid
  const lid = b.joint("lid", { parent: body, at: [0, YT, ZB - 0.008], aim: [0, YT, ZF], role: "hinge", group: "lid" });
  const LID_H = 0.05;
  woodBox(W + 0.012, LID_H, D + 0.016, [0, YT + LID_H / 2, ZC], lid, "lid", 1);
  woodBox(W - 0.03, 0.032, D - 0.04, [0, YT + LID_H + 0.016, ZC], lid, "lid", 0);
  for (const s of [1, -1]) {
    ironBox(0.034, LID_H + 0.008, D + 0.028, [s * BAND_X, YT + LID_H / 2 + 0.002, ZC], lid, "lid");
    ironBox(0.034, 0.036, D - 0.028, [s * BAND_X, YT + LID_H + 0.017, ZC], lid, "lid");
    rivet([s * BAND_X, YT + 0.025, ZF + 0.022], [0, 0, 1], lid, "lid");
    rivet([s * BAND_X, YT + LID_H + 0.036, ZC + 0.04], [0, 1, 0], lid, "lid");
    rivet([s * BAND_X, YT + LID_H + 0.036, ZC - 0.06], [0, 1, 0], lid, "lid");
  }
  // Hasp: an iron tongue hanging from the lid's front edge.
  ironBox(0.04, 0.06, 0.01, [0, YT + 0.005, ZF + 0.014], lid, "lid");
  rivet([0, YT + 0.024, ZF + 0.02], [0, 0, 1], lid, "lid");

  // ------------------------------------------------------------------------------------------------ treasure
  // A stepped gold heap filling the chest and mounding above the rim, clear of the open lid near the hinge.
  const heap = [
    b.part(new BoxGeometry(W - 0.02, 0.03, D - 0.07), GOLD, {
      bone: body,
      at: [0, YT + 0.005, ZC + 0.025],
      group: "gold",
    }),
    b.part(new BoxGeometry(W - 0.1, 0.024, D - 0.13), GOLD, {
      bone: body,
      at: [0.02, YT + 0.028, ZC + 0.045],
      group: "gold",
    }),
    b.part(new BoxGeometry(0.12, 0.018, 0.07), GOLD, { bone: body, at: [0.04, YT + 0.046, ZC + 0.05], group: "gold" }),
  ];
  // Floor pile under the spill at the front-left corner.
  const pileX = 0.1;
  const pileZ = ZF + 0.07;
  heap.push(
    b.part(new BoxGeometry(0.2, 0.014, 0.13), GOLD, { bone: body, at: [pileX, 0.007, pileZ + 0.01], group: "gold" }),
    b.part(new BoxGeometry(0.12, 0.012, 0.08), GOLD, { bone: body, at: [pileX + 0.005, 0.02, pileZ], group: "gold" }),
    b.part(new BoxGeometry(0.05, 0.01, 0.04), GOLD, {
      bone: body,
      at: [pileX + 0.01, 0.031, pileZ - 0.01],
      group: "gold",
    }),
  );
  const coinTex = coinTexture();
  const gemTex = gemTexture();
  const coin = (at: V3, dir: V3, r = 0.017) =>
    b.part(new CylinderGeometry(r, r, r * 0.28, 8), WHITE, { texture: coinTex, bone: body, at, dir, group: "gold" });
  const gold = b.surface(heap);
  const hits = gold.scatter(46, { rng: rng(5), minDist: 0.028, filter: (h) => h.n.y > 0.8 });
  hits.push(...gold.scatter(60, { rng: rng(6), minDist: 0.02, filter: (h) => h.n.y > 0.8 && h.at.y < 0.05 }));
  for (const h of hits) {
    const r = 0.015 + rand() * 0.004;
    coin([h.at.x, h.at.y + r * 0.2, h.at.z], [(rand() - 0.5) * 0.9, 1, (rand() - 0.5) * 0.9], r);
  }
  // The spill: coins tumbling over the front rim and down the face beside the padlock, a few leaning at the pile.
  const spill: [V3, V3][] = [
    [
      [0.085, YT + 0.008, ZF + 0.02],
      [0, 0.6, 1],
    ],
    [
      [0.125, YT + 0.004, ZF + 0.024],
      [0.2, 0.3, 1],
    ],
    [
      [0.105, YT - 0.03, ZF + 0.02],
      [0.1, 0.15, 1],
    ],
    [
      [0.14, YT - 0.07, ZF + 0.022],
      [-0.2, 0.2, 1],
    ],
    [
      [0.1, 0.08, ZF + 0.03],
      [0.3, 0.4, 1],
    ],
    [
      [0.135, 0.045, ZF + 0.035],
      [-0.4, 0.5, 1],
    ],
    [
      [0.04, 0.014, pileZ + 0.05],
      [0.5, 1, 0.3],
    ],
    [
      [0.18, 0.012, pileZ + 0.03],
      [-0.2, 1, 0.1],
    ],
    [
      [0.2, 0.016, pileZ - 0.03],
      [0.9, 1, 0.3],
    ],
    [
      [0.06, 0.0025, pileZ + 0.08],
      [0, 1, 0],
    ],
  ];
  for (const [at, dir] of spill) coin(at, dir);
  // Gems nestled in the gold.
  const gem = (at: V3, dir: V3, tint: string, r = 0.016) =>
    b.part(gemGeo(r), tint, { texture: gemTex, bone: body, at, dir, group: "gold" });
  gem([-0.1, YT + 0.036, ZC + 0.06], [0.2, 1, 0.3], "#ff3048", 0.02);
  gem([0.1, YT + 0.052, ZC + 0.03], [-0.3, 1, 0.2], "#30e0ff", 0.018);
  gem([0.02, YT + 0.066, ZC + 0.06], [0, 1, 0.1], "#50ff5a", 0.016);
  gem([-0.13, YT + 0.024, ZF - 0.02], [0.1, 1, 0.5], "#30e0ff", 0.014);
  gem([pileX - 0.03, 0.024, pileZ + 0.01], [0.3, 1, 0.2], "#ff3048", 0.016);
  gem([pileX + 0.04, 0.03, pileZ - 0.01], [-0.2, 1, 0], "#50ff5a", 0.013);

  // ------------------------------------------------------------------------------------------------ crab head
  const head = b.joint("head", { parent: body, at: [0, 0.245, 0.03], dir: [0, 0, 1], role: "head", group: "head" });
  b.frustumBox([0, 0.25, 0.02], [0, 0.252, 0.15], [0.13, 0.07], [0.1, 0.052], {
    bone: head,
    color: SHELL,
    group: "head",
  });
  // Brow ridge and mouthparts: stepped blocks on the front.
  b.frustumBox([0, 0.272, 0.13], [0, 0.272, 0.162], [0.07, 0.022], [0.05, 0.016], {
    bone: head,
    color: SHELL,
    group: "head",
  });
  for (const s of [1, -1])
    b.frustumBox([s * 0.018, 0.232, 0.13], [s * 0.022, 0.222, 0.165], [0.026, 0.026], [0.02, 0.018], {
      bone: head,
      color: CREAM,
      group: "head",
    });

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // Eyestalks: two joints each, eye box at the tip.
    const stalk = b.chain(
      `eyeStalk${S}`,
      polyline([
        [s * 0.026, 0.27, 0.12],
        [s * 0.036, 0.33, 0.135],
        [s * 0.05, 0.385, 0.15],
      ]),
      { parent: head, names: [`eyeStalk${S}`, `eye${S}`], role: "tentacle", group: "eyes" },
    );
    b.sweep(stalk, [0.011, 0.009, 0.008], {
      section: { ngon: 5 },
      skin: "rigid",
      caps: "flat",
      color: SHELL,
      group: "eyes",
    });
    b.part(new BoxGeometry(0.036, 0.036, 0.036), WHITE, {
      texture: EYE,
      bone: stalk.joints[1],
      at: [s * 0.05, 0.398, 0.152],
      dir: [0, 0, 1],
      axis: "z",
      group: "eyes",
    });

    // Antennae: long, ringed, sweeping forward and out.
    const ant = b.chain(
      `antenna${S}`,
      catmull([
        [s * 0.034, 0.255, 0.15],
        [s * 0.08, 0.31, 0.24],
        [s * 0.15, 0.34, 0.32],
        [s * 0.23, 0.33, 0.4],
      ]),
      { parent: head, count: 3, role: "tentacle", group: "antennae" },
    );
    b.sweep(ant, [0.0055, 0.004, 0.003, 0.002], {
      section: { ngon: 4 },
      caps: { end: "point" },
      color: ANTENNA,
      group: "antennae",
    });

    // ---------------------------------------------------------------------------------------------- claws
    const big = s < 0;
    const k = big ? 1 : 0.62;
    const wristY = big ? 0.145 : 0.185;
    const wristZ = big ? 0.27 : 0.25;
    const palmEnd: V3 = [s * 0.15, wristY, wristZ + 0.13 * k];
    const arm = b.chain(
      `claw${S}`,
      polyline([[s * 0.055, 0.24, 0.12], [s * 0.14, 0.27, 0.19], [s * 0.15, wristY, wristZ], palmEnd]),
      { parent: head, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm", group: `claw${S}` },
    );
    const wrist = arm.joints[2];
    b.sweep(arm, (t) => (t < 0.5 ? 0.021 : 0.024) * (0.55 + 0.45 * k), {
      to: arm.ts[2],
      section: { ngon: 6 },
      skin: "rigid",
      color: SHELL,
      group: `claw${S}`,
    });
    // Palm: a chunky box, fatter at the knuckle.
    b.frustumBox(wrist.at, palmEnd, [0.05 * k, 0.07 * k], [0.06 * k, 0.095 * k], {
      bone: wrist,
      color: SHELL,
      group: `claw${S}`,
    });
    // Knuckle studs along the top of the palm.
    for (let i = 0; i < 3; i++)
      b.part(new BoxGeometry(0.014 * k, 0.012 * k, 0.018 * k), CREAM, {
        bone: wrist,
        at: [s * 0.15, wristY + 0.045 * k, wristZ + (0.03 + i * 0.035) * k],
        group: `claw${S}`,
      });
    const unit = 0.01 * k;
    const u = 0.014 * k;
    const tipPaint = paint((_p, _n, st) => (st[0] > 0.085 * k ? TIP : SHELL));
    // Fixed finger (pollex): lower half, teeth stepping along its top edge.
    b.extrude(
      stepped(
        [
          [-4.4, 0],
          [-4.2, -0.6],
          [-3.8, 0],
          [-3.4, -0.6],
          [-3, 0],
          [-2.4, -0.4],
          [-1.8, 0.4],
          [-1, 1.2],
        ],
        u,
        unit,
        -1,
      ),
      { at: palmEnd, x: [0, 0, 1], y: [0, 1, 0], thickness: 0.04 * k, color: tipPaint, bone: wrist, group: `claw${S}` },
    );
    // Movable finger (dactyl) on its own hinge at the top of the palm's end.
    const pincer = b.joint(`pincer${S}`, {
      parent: wrist,
      at: [palmEnd[0], palmEnd[1] + 0.012 * k, palmEnd[2] - 0.006 * k],
      aim: [palmEnd[0], palmEnd[1] + 0.012 * k, palmEnd[2] + 0.1],
      role: "hinge",
      group: `claw${S}`,
    });
    b.extrude(
      stepped(
        [
          [-0.4, 3.6],
          [0.4, 3.6],
          [-0.2, 3.4],
          [0.4, 3.2],
          [-0.2, 3],
          [0.2, 2.6],
          [-0.4, 2],
          [-1.4, 1.2],
        ],
        u,
        unit,
        -1,
      ),
      {
        at: pincer.at,
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.036 * k,
        color: tipPaint,
        bone: pincer,
        group: `claw${S}`,
      },
    );
    b.pose(pincer, { axis: [1, 0, 0], deg: -16 });

    // ---------------------------------------------------------------------------------------------- legs
    [0.055, -0.045].forEach((zr, i) => {
      const n = i + 1;
      const root: V3 = [s * (W / 2 - 0.01), 0.1, zr];
      const foot: V3 = [s * 0.37, 0.006, zr + (i === 0 ? 0.08 : -0.07)];
      const pts = limb(
        root,
        foot,
        [0.11, 0.12, 0.1],
        [
          [0, 1, 0],
          [s, 0.4, 0],
        ],
      );
      const leg = b.chain(`leg${S}${n}`, polyline(pts), {
        parent: body,
        names: [`hip${S}${n}`, `knee${S}${n}`, `ankle${S}${n}`],
        role: "leg",
        contact: [foot[0], 0, foot[2]],
        group: `leg${S}${n}`,
      });
      b.sweep(leg, (t) => 0.016 * (1 - t) + 0.006, {
        section: { ngon: 5 },
        skin: "rigid",
        caps: { start: "flat", end: "point" },
        color: LEG,
        group: `leg${S}${n}`,
      });
      b.part(new PlaneGeometry(0.06, 0.06), WHITE, {
        texture: HOLE,
        bone: body,
        at: [s * (W / 2 + 0.002), 0.1, zr],
        dir: [s, 0, 0],
        axis: "z",
        group: "chest",
      });
    });
  }

  b.pose(lid, { axis: [1, 0, 0], deg: -30 });
  return b.root;
}
