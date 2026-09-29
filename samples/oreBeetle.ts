// Ore beetle, in pixel art. A cave-mining rhinoceros beetle about half a metre long: a big forward horn with a
// little lantern hanging from an iron ring near its tip, dark elytra made of stepped stone plates studded with blue
// crystals and gold nuggets, six spurred legs, lamellate antennae and mandibles that rest half open.
// Style: post-Minecraft low-poly. Every surface sits on one small pixel grid (TEXEL): the stone, shell, crystal, gold,
// eye and lantern drawings are 8x8..24x24 `svg()` pixel textures cropped onto chunky boxes on whole-pixel steps, and
// every paint (shell, horn, legs, abdomen) is quantised into square hard-edged cells of one size from a small
// palette. Volumes are boxes, 4-6 sided tubes and stepped slabs.
import { BoxGeometry, ConeGeometry, DodecahedronGeometry, LatheGeometry, TorusGeometry, Vector2, Vector3 } from "three";
import type { BufferGeometry } from "three";
import { createBuilder } from "../src/builder";
import { DEG, rng } from "../src/math";
import { paint } from "../src/paint";
import { catmull, polyline } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Ore beetle",
  description:
    "Cave-mining rhinoceros beetle in pixel art: horn with a hanging lantern, elytra of stone plates with ore crystals, hinged shell, jaws and antennae.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette (flat colours; textures bring their own).
const IRON = "#1d1f26";
const STEEL = "#8a929c";
const RUST_DK = "#6e2f14";
const BONE = "#c9b48a";

/** One pixel, in meters. Every texture texel and every paint cell is this size. */
const TEXEL = 0.0045;
const TILE = 24; // pixels per stone / shell tile

// ---------------------------------------------------------------------------------------------------------------
// Pixel textures.

type Pal = Record<string, string>;
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

/** Stone plate tile: clumps of four tones, dark cracks, and a few blue and gold ore flecks. */
function stoneTile(seed: number, tones: [string, string, string, string], cracks: number, flecks: number) {
  const r = rng(seed);
  const g = canvas(TILE, TILE, "a");
  const tone = "abcd";
  for (let by = 0; by < TILE / 2; by++)
    for (let bx = 0; bx < TILE / 2; bx++) {
      const v = r();
      const c = v < 0.34 ? "a" : v < 0.66 ? "b" : v < 0.9 ? "c" : "d";
      for (let k = 0; k < 4; k++) g[by * 2 + (k >> 1)][bx * 2 + (k & 1)] = c;
    }
  for (let i = 0; i < 60; i++) {
    const x = Math.floor(r() * TILE);
    const y = Math.floor(r() * TILE);
    g[y][x] = tone[Math.min(3, Math.max(0, tone.indexOf(g[y][x]) + (r() < 0.5 ? -1 : 1)))];
  }
  for (let i = 0; i < cracks; i++) {
    let x = Math.floor(r() * TILE);
    let y = Math.floor(r() * TILE);
    const dx = r() < 0.5 ? 1 : -1;
    for (let k = 0; k < 7 + Math.floor(r() * 6); k++) {
      if (x < 0 || y < 0 || x >= TILE || y >= TILE) break;
      g[y][x] = "k";
      if (r() < 0.55) x += dx;
      else y += 1;
    }
  }
  for (let i = 0; i < flecks; i++) {
    const x = 1 + Math.floor(r() * (TILE - 3));
    const y = 1 + Math.floor(r() * (TILE - 3));
    const blue = r() < 0.55;
    const cells: [number, number, string][] = blue
      ? [
          [0, 0, "B"],
          [1, 0, "B"],
          [0, 1, "C"],
          [1, 1, "D"],
        ]
      : [
          [0, 0, "H"],
          [1, 0, "G"],
          [0, 1, "G"],
        ];
    for (const [dx, dy, c] of cells) if (r() < 0.85) g[y + dy][x + dx] = c;
  }
  return pixels(g, {
    a: tones[0],
    b: tones[1],
    c: tones[2],
    d: tones[3],
    k: "#16171b",
    B: "#1e7bff",
    C: "#7fe3ff",
    D: "#0b3fb8",
    H: "#ffe15a",
    G: "#d98c08",
  });
}

/** Polished shell tile: violet clumps with a diagonal sheen and a few rust chips. */
function shellTile(seed: number) {
  const r = rng(seed);
  const g = canvas(TILE, TILE, "a");
  for (let by = 0; by < TILE / 2; by++)
    for (let bx = 0; bx < TILE / 2; bx++) {
      const v = r();
      const c = v < 0.45 ? "a" : v < 0.85 ? "b" : "c";
      for (let k = 0; k < 4; k++) g[by * 2 + (k >> 1)][bx * 2 + (k & 1)] = c;
    }
  for (let y = 0; y < TILE; y++)
    for (let x = 0; x < TILE; x++) {
      const d = (((x - y) % 12) + 12) % 12;
      if (d === 0 || d === 1) g[y][x] = "s";
      else if (d === 2 && r() < 0.5) g[y][x] = "s";
      if (d === 0 && (x + y) % 5 === 0) g[y][x] = "w";
    }
  for (let i = 0; i < 9; i++) g[Math.floor(r() * TILE)][Math.floor(r() * TILE)] = r() < 0.5 ? "r" : "e";
  return pixels(g, {
    a: "#241c36",
    b: "#302645",
    c: "#40345a",
    s: "#7160a0",
    w: "#c4b8f0",
    r: "#8f3f18",
    e: "#d0692a",
  });
}

/** Six-facet crystal, two pixels per facet: bright tip, lit left-centre facets, dark base. */
function crystalTexture(cols: string[]) {
  const g = canvas(12, 16);
  const facet = [1, 2, 3, 2, 1, 0];
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 12; x++) {
      let k = facet[x >> 1];
      if (y < 3) k += 1;
      if (y >= 12) k -= 1;
      if (y === 8 && x >> 1 === 2) k += 1;
      g[y][x] = String(Math.min(3, Math.max(0, k)));
    }
  for (const [x, y] of [
    [4, 9],
    [5, 10],
    [4, 2],
    [5, 5],
  ])
    g[y][x] = "w";
  return pixels(g, { "0": cols[0], "1": cols[1], "2": cols[2], "3": cols[3], w: "#ffffff" });
}

function goldTexture() {
  const r = rng(5);
  const g = canvas(8, 8);
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 8; x++) {
      const t = 1 - (x + y) / 14 + (r() - 0.5) * 0.7;
      g[y][x] = t < 0.25 ? "0" : t < 0.5 ? "1" : t < 0.8 ? "2" : "3";
    }
  g[1][1] = "3";
  g[1][2] = "3";
  return pixels(g, { "0": "#8a4a00", "1": "#d18a0a", "2": "#ffc72e", "3": "#fff09a" });
}

const eyeTexture = () =>
  pixels(
    ["..kkkk..", ".kNNNNk.", "kNNbbNNk", "kNbCwbNk", "kNbbbbNk", "kNNbbNNk", ".kNNNNk.", "..kkkk.."].map((row) =>
      row.split(""),
    ),
    { k: "#0a0c1a", N: "#101a45", b: "#1e4fd6", C: "#8fe4ff", w: "#ffffff" },
  );

/** Lantern glass: a stepped flame, white core to orange, dark rim. */
function lanternTexture() {
  const W = 12;
  const H = 16;
  const g = canvas(W, H, "r");
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const dx = Math.abs(x - 5.5) / 5.5;
      const dy = (y - 9) / 7;
      const flame = Math.abs(dx) * 1.05 + Math.max(0, -dy) * 1.25 + Math.max(0, dy) * 0.6;
      g[y][x] = flame < 0.28 ? "w" : flame < 0.5 ? "Y" : flame < 0.78 ? "y" : flame < 1.02 ? "o" : "r";
    }
  for (let x = 0; x < W; x++) {
    g[0][x] = "d";
    g[H - 1][x] = "d";
  }
  return pixels(g, { w: "#fff8d0", Y: "#ffe98a", y: "#ffc93c", o: "#ff8a1f", r: "#c45a12", d: "#7a3410" });
}

// ---------------------------------------------------------------------------------------------------------------
// Paints: square cells in meters, a small palette, clumps at two scales, no gradients.

const cellHash = (x: number, y: number, z: number, seed: number) => {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1274126177) ^ Math.imul(seed, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

function voxels(palette: string[], seed: number) {
  return paint((p) => {
    const x = Math.floor(p.x / TEXEL);
    const y = Math.floor(p.y / TEXEL);
    const z = Math.floor(p.z / TEXEL);
    const clump = cellHash(Math.floor(x / 3), Math.floor(y / 3), Math.floor(z / 3), seed + 7);
    const v = clump * 0.55 + cellHash(x, y, z, seed) * 0.45;
    return palette[Math.min(palette.length - 1, Math.floor(v * palette.length))];
  });
}

const CHITIN = voxels(["#1f1829", "#2a2138", "#372c49", "#463a5c"], 1);
const RUSTY = voxels(["#6e2f14", "#8f3f18", "#b4531f", "#cf6a2a"], 2);
const STEELY = voxels(["#59616b", "#6d7681", "#828c98", "#a3adb8"], 3);
const GILT = voxels(["#a85f00", "#e09a10", "#ffd23a"], 4);
/** Sides a shade lighter than the top and bottom: the rim of a shell slab. */
const RIM = paint((_p, n) => (Math.abs(n.y) < 0.6 ? voxels(["#2a2138", "#372c49", "#463a5c", "#584a72"], 6) : CHITIN));
/** Dorsal abdomen segments alternate dark violet and dark rust, a cell-row at a time. */
const SEGMENTS = paint((p, n) =>
  n.y > 0.5 && Math.floor(p.z / (TEXEL * 4)) % 2 === 0 ? voxels(["#4a2110", "#5c2914", "#6e2f14"], 5) : CHITIN,
);
const HORN = paint((_p, _n, s) => (s[0] > 0.84 ? STEELY : s[0] > 0.74 && s[0] < 0.79 ? GILT : RUSTY));
const LEG = paint((_p, _n, s) => (s[0] > 0.37 && s[0] < 0.45 ? RUSTY : s[0] > 0.84 ? RUSTY : CHITIN));

// ---------------------------------------------------------------------------------------------------------------
// Geometry.

/**
 * A box whose faces show whole-pixel crops of one tile, so a stone plate of any size keeps square texels. `rand`
 * picks the crop offset of each face.
 */
function plateGeo(w: number, h: number, d: number, rand: () => number) {
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
    const nu = Math.min(TILE, Math.max(2, Math.round(fw / TEXEL)));
    const nv = Math.min(TILE, Math.max(2, Math.round(fh / TEXEL)));
    const u0 = Math.floor(rand() * (TILE - nu + 1)) / TILE;
    const v0 = Math.floor(rand() * (TILE - nv + 1)) / TILE;
    for (let i = 0; i < 4; i++) {
      const k = f * 4 + i;
      uv.setXY(k, u0 + uv.getX(k) * (nu / TILE), v0 + uv.getY(k) * (nv / TILE));
    }
  });
  return geo;
}

const faceted = (geo: BufferGeometry) => {
  const flat = geo.toNonIndexed();
  flat.computeVertexNormals();
  return flat;
};

/** A pointed prism: `sides` flat facets, straight for 60% of its height, then a pyramid tip. */
const crystalGeo = (r: number, h: number, sides: number) =>
  faceted(new LatheGeometry([new Vector2(r, 0), new Vector2(r, h * 0.6), new Vector2(0, h)], sides));

/** A low-poly nugget (12 faces) whose faces are mapped flat along their dominant axis, inside 0..1. */
function nuggetGeo(r: number) {
  const geo = new DodecahedronGeometry(r, 0);
  geo.computeVertexNormals();
  const pos = geo.getAttribute("position");
  const nor = geo.getAttribute("normal");
  const uv = geo.getAttribute("uv");
  for (let i = 0; i < pos.count; i++) {
    const [nx, ny, nz] = [Math.abs(nor.getX(i)), Math.abs(nor.getY(i)), Math.abs(nor.getZ(i))];
    const [u, v] =
      nx > ny && nx > nz
        ? [pos.getZ(i), pos.getY(i)]
        : ny > nz
          ? [pos.getX(i), pos.getZ(i)]
          : [pos.getX(i), pos.getY(i)];
    uv.setXY(
      i,
      Math.min(0.99, Math.max(0.01, u / (2.1 * r) + 0.5)),
      Math.min(0.99, Math.max(0.01, v / (2.1 * r) + 0.5)),
    );
  }
  return geo;
}

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "oreBeetle" });
  const rand = rng(11);

  const stones = [
    stoneTile(1, ["#565b63", "#6b7078", "#858b93", "#a7adb5"], 2, 3),
    stoneTile(2, ["#665c55", "#7a6f66", "#948878", "#b3a48f"], 3, 2),
    stoneTile(3, ["#4f5468", "#626880", "#7b819c", "#9da3c0"], 1, 4),
  ];
  const shell = shellTile(9);
  const crystalBlue = crystalTexture(["#0a2f9c", "#1668e8", "#43bdff", "#b6f0ff"]);
  const gold = goldTexture();
  const WHITE = "#ffffff";

  // ------------------------------------------------------------------------------------------------ skeleton
  const body = b.joint("body", { at: [0, 0.115, -0.03], dir: [0, 0, 1], group: "body" });
  const thorax = b.joint("thorax", { parent: body, at: [0, 0.12, 0.03], dir: [0, 0, 1], group: "body" });
  const head = b.joint("head", { parent: thorax, at: [0, 0.11, 0.115], dir: [0, 0, 1], role: "head", group: "head" });

  // ------------------------------------------------------------------------------------------------ abdomen
  b.sweep(
    polyline([
      [0, 0.11, 0.036],
      [0, 0.11, -0.18],
    ]),
    (t) => [0.066 - 0.016 * t, 0.038 - 0.006 * t],
    { section: "box", caps: "flat", bone: body, color: SEGMENTS, group: "body" },
  );

  // ------------------------------------------------------------------------------------------------ pronotum
  const pron = [
    [0, -0.082],
    [0.012, -0.092],
    [0.05, -0.094],
    [0.085, -0.062],
    [0.095, -0.03],
    [0.095, 0.03],
    [0.085, 0.062],
    [0.05, 0.094],
    [0.012, 0.092],
    [0, 0.082],
  ] as [number, number][];
  b.extrude(pron, {
    at: [0, 0.165, 0.035],
    x: [0, 0, 1],
    y: [1, 0, 0],
    thickness: 0.05,
    color: RIM,
    bone: thorax,
    group: "body",
  });
  const pronotumTop = b.part(plateGeo(0.062, 0.026, 0.08, rand), WHITE, {
    texture: shell,
    bone: thorax,
    at: [0, 0.205, 0.08],
    rotation: [10, 0, 0],
    group: "body",
  });
  for (const s of [1, -1])
    b.part(plateGeo(0.04, 0.024, 0.08, rand), WHITE, {
      texture: shell,
      bone: thorax,
      at: [s * 0.05, 0.184, 0.074],
      rotation: [8, 0, -s * 36],
      group: "body",
    });

  /** Two or three crystals leaning off a point on a plate's top face, and gold nuggets. */
  const crystals = (
    plate: { local: (p: [number, number, number]) => Vector3; dir: (v: [number, number, number]) => Vector3 },
    top: number,
    bone: typeof body,
    lx: number,
    lz: number,
    scale = 1,
  ) => {
    const spec: [number, number, number, number, number, number][] = [
      [0, 0, 0.05, 0.011, 0, 0],
      [0.014, 0.007, 0.032, 0.008, 0.4, 0.1],
      [-0.011, -0.01, 0.026, 0.007, -0.35, -0.25],
    ];
    spec.forEach(([dx, dz, h, r, tx, tz], i) =>
      b.part(crystalGeo(r * scale, h * scale, i === 1 ? 5 : 6), WHITE, {
        texture: crystalBlue,
        bone,
        at: plate.local([lx + dx * scale, top - 0.004, lz + dz * scale]),
        dir: plate.dir([tx, 1, tz]),
        group: bone.name,
      }),
    );
  };
  const nugget = (
    plate: { local: (p: [number, number, number]) => Vector3 },
    top: number,
    bone: typeof body,
    lx: number,
    lz: number,
    r = 0.011,
  ) =>
    b.part(nuggetGeo(r), WHITE, {
      texture: gold,
      bone,
      at: plate.local([lx, top - r * 0.25, lz]),
      rotation: [rand() * 360, rand() * 360, rand() * 360],
      group: bone.name,
    });

  crystals(pronotumTop, 0.013, thorax, 0.008, -0.008, 0.8);
  nugget(pronotumTop, 0.013, thorax, -0.02, 0.026, 0.009);

  // ------------------------------------------------------------------------------------------------ elytra
  // Each elytron is a hinge joint at the front of its suture, a rim slab and a raised ridge, and eight stone plates
  // on top in three columns, tilted more and more steeply toward the flank so the shell reads as a dome, rounding
  // off toward the rear, laid brick-fashion.
  const outline = [
    [0, 0.003],
    [0, 0.095],
    [0.02, 0.118],
    [0.12, 0.12],
    [0.17, 0.108],
    [0.205, 0.075],
    [0.21, 0.003],
  ] as [number, number][];
  const columns = [
    {
      l0: 0.003,
      l1: 0.045,
      yBase: 0.205,
      roll: 4,
      rows: [
        [0.03, -0.045],
        [-0.048, -0.115],
        [-0.118, -0.18],
      ],
    },
    {
      l0: 0.048,
      l1: 0.083,
      yBase: 0.19,
      roll: 20,
      rows: [
        [0.03, -0.015],
        [-0.018, -0.09],
        [-0.093, -0.16],
      ],
    },
    {
      l0: 0.086,
      l1: 0.114,
      yBase: 0.164,
      roll: 48,
      rows: [
        [0.03, -0.06],
        [-0.063, -0.14],
      ],
    },
  ];
  const ore: Record<string, [number, number, number, number][]> = {
    // kind (0 crystals, 1 nugget), plate index, lx, lz
    L: [
      [0, 1, -0.004, 0.012],
      [1, 1, 0.012, -0.024],
      [1, 2, 0.004, 0.006],
      [0, 4, 0.002, 0.004],
      [1, 5, -0.008, 0.012],
      [0, 3, 0.0, 0.004],
      [1, 6, 0.0, 0.0],
    ],
    R: [
      [1, 0, 0.008, 0.0],
      [0, 2, 0.0, 0.01],
      [0, 4, 0.004, -0.012],
      [1, 3, 0.0, 0.0],
      [0, 5, -0.004, 0.008],
      [1, 1, -0.014, 0.02],
      [1, 7, 0.0, 0.0],
    ],
  };
  const rimTop = 0.17;
  const elytra = [1, -1].map((s) => {
    const name = s > 0 ? "L" : "R";
    const hinge = b.joint(`elytra${name}`, {
      parent: body,
      at: [s * 0.006, 0.17, 0.03],
      dir: [s * 0.05, -0.06, -1],
      role: "hinge",
      group: `elytra${name}`,
    });
    const group = `elytra${name}`;
    b.extrude(outline, {
      at: [0, rimTop - 0.02, 0.03],
      x: [0, 0, -1],
      y: [s, 0, 0],
      thickness: 0.04,
      color: RIM,
      bone: hinge,
      group,
    });
    b.extrude(
      [
        [0, 0.003],
        [0, 0.07],
        [0.195, 0.07],
        [0.195, 0.003],
      ],
      { at: [0, 0.175, 0.03], x: [0, 0, -1], y: [s, 0, 0], thickness: 0.05, color: RIM, bone: hinge, group },
    );
    const plates: { local: (p: [number, number, number]) => Vector3; dir: (v: [number, number, number]) => Vector3 }[] =
      [];
    for (const col of columns)
      for (const [z0, z1] of col.rows) {
        const zc = (z0 + z1) / 2;
        const w = col.l1 - col.l0;
        const d = 0.03 - zc;
        const p = b.part(plateGeo(w, 0.026, z0 - z1, rand), WHITE, {
          texture: stones[Math.floor(rand() * stones.length)],
          bone: hinge,
          at: [s * (col.l0 + w / 2), col.yBase - (0.2 * d * d) / 0.15, zc],
          rotation: [-Math.atan((0.4 * d) / 0.15) / DEG, 0, -s * col.roll],
          group,
        });
        plates.push(p);
      }
    for (const [kind, i, lx, lz] of ore[name]) {
      if (kind === 0) crystals(plates[i], 0.013, hinge, lx, lz, i % 3 === 0 ? 0.75 : 0.85);
      else nugget(plates[i], 0.013, hinge, lx, lz, 0.008 + (i % 3) * 0.002);
    }
    return hinge;
  });
  void elytra;

  // ------------------------------------------------------------------------------------------------ head
  b.frustumBox([0, 0.105, 0.112], [0, 0.105, 0.192], [0.12, 0.085], [0.092, 0.064], {
    bone: head,
    color: CHITIN,
    group: "head",
  });
  b.part(plateGeo(0.09, 0.018, 0.064, rand), WHITE, {
    texture: shell,
    bone: head,
    at: [0, 0.148, 0.15],
    rotation: [-4, 0, 0],
    group: "head",
  });
  // Clypeus and labrum: a rust brow across the front and a small block between the jaws.
  b.frustumBox([0, 0.118, 0.19], [0, 0.118, 0.203], [0.09, 0.03], [0.07, 0.024], {
    bone: head,
    color: RUSTY,
    group: "head",
  });
  b.frustumBox([0, 0.082, 0.19], [0, 0.082, 0.208], [0.04, 0.022], [0.028, 0.016], {
    bone: head,
    color: RUST_DK,
    group: "head",
  });

  const eye = eyeTexture();
  for (const s of [1, -1])
    b.part(new BoxGeometry(0.016, 0.03, 0.03), WHITE, {
      texture: eye,
      bone: head,
      at: [s * 0.052, 0.118, 0.148],
      rotation: [0, 0, 0],
      group: "head",
    });

  // ------------------------------------------------------------------------------------------------ horn
  const horn = b.chain(
    "horn",
    catmull([
      [0, 0.135, 0.145],
      [0, 0.17, 0.205],
      [0, 0.225, 0.25],
      [0, 0.255, 0.325],
    ]),
    { parent: head, count: 3, group: "horn" },
  );
  b.sweep(horn, [0.036, 0.03, 0.023, 0.016, 0.009], {
    section: { ngon: 5 },
    caps: { start: "flat", end: "point" },
    color: HORN,
    group: "horn",
  });
  // Tines: one up-curved prong and a pair of side prongs, like a pick head.
  b.spike(horn.at(0.7), [0, 0.75, 0.45], 0.05, 0.012, { color: RUSTY, section: { ngon: 4 }, group: "horn" });
  for (const s of [1, -1])
    b.spike(horn.at(0.5), [s * 0.9, 0.35, 0.3], 0.042, 0.011, { color: RUSTY, section: { ngon: 4 }, group: "horn" });

  // The lantern's iron ring around the horn, a chain and the lantern on its own swinging joint.
  const ring = horn.at(0.88);
  const R = 0.019;
  b.part(new TorusGeometry(R, 0.0032, 4, 6), IRON, {
    at: ring,
    dir: ring.axis,
    axis: "z",
    bone: horn.joints[2],
    group: "lantern",
  });
  const tangent = ring.axis.clone();
  const down = new Vector3(0, -1, 0).addScaledVector(tangent, tangent.y).normalize();
  const hook = ring.at.clone().addScaledVector(down, R);
  const lantern = b.joint("lantern", { parent: horn.joints[2], at: hook, dir: [0, -1, 0], group: "lantern" });
  const under = (dy: number) => [hook.x, hook.y + dy, hook.z] as [number, number, number];
  const lit = (geo: BufferGeometry, dy: number, color: string, extra: Record<string, unknown> = {}) =>
    b.part(geo, color, { bone: lantern, at: under(dy), group: "lantern", ...extra });
  lit(new BoxGeometry(0.008, 0.012, 0.0025), -0.006, IRON);
  lit(new BoxGeometry(0.0025, 0.012, 0.008), -0.0135, IRON);
  lit(new ConeGeometry(0.022, 0.016, 4).rotateY(Math.PI / 4), -0.0275, IRON);
  lit(new BoxGeometry(0.022, 0.036, 0.022), -0.0535, WHITE, { texture: lanternTexture() });
  for (const [px, pz] of [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ])
    b.part(new BoxGeometry(0.0035, 0.036, 0.0035), IRON, {
      bone: lantern,
      at: [hook.x + px * 0.0115, hook.y - 0.0535, hook.z + pz * 0.0115],
      group: "lantern",
    });
  lit(new BoxGeometry(0.03, 0.006, 0.03), -0.0745, IRON);

  // ------------------------------------------------------------------------------------------------ jaws
  for (const s of [1, -1]) {
    const name = s > 0 ? "L" : "R";
    const jaw = b.joint(`jaw${name}`, {
      parent: head,
      at: [s * 0.03, 0.088, 0.172],
      aim: [s * 0.056, 0.083, 0.212],
      role: "jaw",
      group: "jaw",
    });
    b.sweep(
      catmull([
        [s * 0.03, 0.088, 0.172],
        [s * 0.056, 0.083, 0.208],
        [s * 0.05, 0.083, 0.236],
        [s * 0.03, 0.086, 0.254],
      ]),
      [0.02, 0.015, 0.009, 0.003],
      { section: { ngon: 4 }, bone: jaw, color: RUSTY, group: "jaw" },
    );
    b.spike([s * 0.053, 0.083, 0.222], [-s * 0.6, 0, 0.8], 0.02, 0.005, {
      bone: jaw,
      color: BONE,
      section: { ngon: 4 },
      group: "jaw",
    });
  }

  // ------------------------------------------------------------------------------------------------ antennae
  const clubPlate: [number, number][] = [
    [0, 0],
    [0.02, 0.003],
    [0.024, 0.009],
    [0.019, 0.014],
    [0.003, 0.011],
  ];
  for (const s of [1, -1]) {
    const name = s > 0 ? "L" : "R";
    const ant = b.chain(
      `ant${name}`,
      catmull([
        [s * 0.035, 0.115, 0.178],
        [s * 0.07, 0.14, 0.215],
        [s * 0.095, 0.155, 0.26],
        [s * 0.105, 0.15, 0.295],
      ]),
      { parent: head, count: 3, role: "tentacle", group: "antenna" },
    );
    b.sweep(ant, [0.007, 0.0045, 0.003, 0.0028], { section: { ngon: 4 }, color: CHITIN, group: "antenna" });
    const tip = ant.at(1);
    b.ring(tip, { count: 3, radius: 0.004 }, (item) =>
      b.extrude(clubPlate, { at: item, x: tip.axis, y: item.axis, thickness: 0.004, color: GILT, group: "antenna" }),
    );
  }

  // ------------------------------------------------------------------------------------------------ legs
  type LegSpec = {
    id: string;
    parent: typeof body;
    hip: [number, number, number];
    knee: [number, number, number];
    ankle: [number, number, number];
    base: [number, number, number];
    tip: [number, number, number];
    girth: number;
    spurs: number;
    spurDir: [number, number, number];
  };
  const legs: LegSpec[] = [
    {
      id: "F",
      parent: thorax,
      hip: [0.062, 0.09, 0.085],
      knee: [0.12, 0.13, 0.125],
      ankle: [0.155, 0.048, 0.155],
      base: [0.165, 0.02, 0.167],
      tip: [0.17, 0, 0.178],
      girth: 1.15,
      spurs: 3,
      spurDir: [0.7, -0.1, 0.7],
    },
    {
      id: "M",
      parent: body,
      hip: [0.075, 0.088, -0.02],
      knee: [0.135, 0.13, -0.03],
      ankle: [0.175, 0.05, -0.04],
      base: [0.183, 0.02, -0.045],
      tip: [0.188, 0, -0.05],
      girth: 1,
      spurs: 2,
      spurDir: [0.6, 0.6, -0.3],
    },
    {
      id: "H",
      parent: body,
      hip: [0.072, 0.088, -0.1],
      knee: [0.125, 0.13, -0.13],
      ankle: [0.16, 0.05, -0.17],
      base: [0.167, 0.02, -0.185],
      tip: [0.171, 0, -0.195],
      girth: 1,
      spurs: 2,
      spurDir: [0.6, 0.6, -0.3],
    },
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const leg of legs) {
      const m = (p: [number, number, number]): [number, number, number] => [p[0] * s, p[1], p[2]];
      const group = `leg${leg.id}${side}`;
      const chain = b.chain(group, polyline([m(leg.hip), m(leg.knee), m(leg.ankle), m(leg.base)]), {
        parent: leg.parent,
        names: [`hip${leg.id}${side}`, `knee${leg.id}${side}`, `ankle${leg.id}${side}`],
        role: "leg",
        contact: m(leg.tip),
        group,
      });
      const k = leg.girth;
      b.sweep(chain, [0.028 * k, 0.026 * k, 0.023 * k, 0.02 * k, 0.018 * k, 0.015 * k, 0.011, 0.008], {
        section: { ngon: 5 },
        caps: { start: "flat", end: "flat" },
        color: LEG,
        group,
      });
      // Coxa block at the hip and a small rust cap on the knee.
      b.part(new BoxGeometry(0.04, 0.036, 0.04), CHITIN, { bone: chain.joints[0], at: m(leg.hip), group });
      b.part(new BoxGeometry(0.036, 0.036, 0.036), RUSTY, {
        bone: chain.joints[1],
        at: m(leg.knee),
        rotation: [0, 45, 0],
        group,
      });
      // Tibial spurs, and a steel claw whose point is the leg's contact with the floor.
      for (let i = 0; i < leg.spurs; i++) {
        const t = ((i + 1) / (leg.spurs + 1)) * 0.8 + 0.1;
        const at = m(leg.knee).map((v, j) => v + (m(leg.ankle)[j] - v) * t) as [number, number, number];
        b.spike(
          at,
          [leg.spurDir[0] * s, leg.spurDir[1], leg.spurDir[2]],
          leg.id === "F" ? 0.052 : 0.044,
          leg.id === "F" ? 0.01 : 0.008,
          {
            bone: chain.joints[1],
            color: leg.id === "F" ? STEEL : BONE,
            section: { ngon: 4 },
            group,
          },
        );
      }
      b.spike(m(leg.base), m(leg.tip), null, 0.009, {
        bone: chain.joints[2],
        color: STEEL,
        section: { ngon: 4 },
        group,
      });
    }
  }

  return b.root;
}
