// NES boar: a tusked wild boar drawn like an 8-bit sprite and turned 3D. One palette rules everything: black, dark
// brown, silver-grey and cream from the NES master palette (tawny for the snout, red and salmon inside the mouth).
// The coat is a paint that quantises the whole animal into 2 cm square cells, one colour per cell, face by face: a
// black dorsal stripe, silver bristle streaks grizzling the shoulders and flanks, black socks with a checkerboard
// dither where they fade into the brown, a paler muzzle. Every drawing is an ASCII pixel grid with at most four
// colours, rasterised 1:1 with `svg()` and `pixelated: true` (2 cm per pixel, like the coat cells): the disc snout
// with its nostrils, the eyes, the mouth floor and roof with their teeth, the bristle sprite of the mane and the
// tail tuft. The shapes are blocky: an octagonal barrel, a box-section wedge of a head, square legs on split black
// hooves, a stepped staircase ear and a tail that curls in straight, angular strokes.
import { BoxGeometry, PlaneGeometry, Vector3 } from "three";
import type { Texture } from "three";
import { createBuilder } from "../src/builder";
import { aim, rng } from "../src/math";
import { paint, smoothstep } from "../src/paint";
import { bezier, catmull, polyline } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "NES boar",
  description:
    "A tusked wild boar as an 8-bit sprite in 3D: coat quantised to 2 cm cells in four NES colours, ASCII-drawn pixel textures (snout, eyes, mouth, bristle mane, tail tuft), blocky barrel body, staircase ears, curved tusks and a rigged jaw, legs and curly tail.",
  builtBy: "Claude Sonnet 5.5",
};

type V3 = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Palette: NES master palette entries. Coat and paint sheet stay within BLACK / DARK / SILVER / CREAM; every drawing has at most four.

const BLACK = "#000000";
const DARK = "#503000";
const TAWNY = "#ac7c00";
const SILVER = "#bcbcbc";
const CREAM = "#fce0a8";
const RED = "#a80020";
const SALMON = "#f87858";

const KEY: Record<string, string> = { B: BLACK, D: DARK, T: TAWNY, G: SILVER, C: CREAM, R: RED, S: SALMON };

/** One pixel = 2 cm: the size of a coat cell and of every drawing's pixels. */
const CELL = 0.02;

/** An ASCII pixel grid (top row first, "." transparent) as a texture: one `<rect>` per run, rasterised 1:1. */
function pixelArt(rows: readonly string[]) {
  const h = rows.length;
  const w = rows[0].length;
  const rects: string[] = [];
  rows.forEach((row, y) => {
    if (row.length !== w) throw new Error(`nesBoar: pixel row ${y} is ${row.length} wide, expected ${w}`);
    let x = 0;
    while (x < w) {
      const ch = row[x];
      let n = 1;
      while (x + n < w && row[x + n] === ch) n++;
      if (ch !== ".") {
        const fill = KEY[ch];
        if (!fill) throw new Error(`nesBoar: unknown pixel colour ${ch}`);
        rects.push(`<rect x="${x}" y="${y}" width="${n}" height="1" fill="${fill}"/>`);
      }
      x += n;
    }
  });
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${rects.join("")}</svg>`,
    { size: Math.max(w, h), pixelated: true },
  );
}

const SNOUT_ART = ["..BBBB..", ".BCTTTB.", "BCTTTTTB", "BTBTTBTB", "BTBTTBDB", ".BTTTDB.", "..BBBB.."];
/** Eye: a dark bead with one cream glint, on the front-top pixel (mirrored for the other side). */
const EYE_L_ART = ["CB", "BB"];
const EYE_R_ART = ["BC", "BB"];
/** Mane bristles: one chunky spike with silver tips over a black base, rooted on the bottom edge. */
const MANE_ART = ["...G...", "..GDG..", ".GDDDG.", ".DDDDD.", "GDDBDDG", "DDBBBDD", "DBBBBBD", "BBBBBBB"];
/** Tail tuft: a small fan of bristles from a one-pixel root. */
const TUFT_ART = ["G.G.G", "DGDGD", "D.D.D", "DDDDD", ".DBD.", "..B.."];

/** The mouth floor (tongue, cream tooth run either side) and roof (ridged palate), front at the top. */
function mouthArt(roof: boolean) {
  const rows: string[] = [];
  const len = 13;
  for (let y = 0; y < len; y++) {
    const tooth = y % 2 === 0 ? "C" : "R";
    const inner = roof ? (y % 3 === 1 ? "BBB" : "RRR") : y < 2 ? "RRR" : y === len - 1 ? "BBB" : "SSS";
    rows.push(`${tooth}${inner}${tooth}`);
  }
  return pixelArt(rows);
}

// ---------------------------------------------------------------------------------------------------------------
// The coat: a paint that works in 2 cm cells so every face reads as big square texels, one colour per cell.

const hash = (a: number, b: number, seed = 0) => {
  const h = Math.sin(a * 127.1 + b * 311.7 + seed * 74.7) * 43758.5453;
  return h - Math.floor(h);
};

/** The cell of face-on axis `axis` that `p` falls in: (u, v) index it, (x, y, z) is its centre. */
function cellOf(p: Vector3, n: Vector3) {
  const ax = Math.abs(n.x);
  const ay = Math.abs(n.y);
  const az = Math.abs(n.z);
  const axis = ay >= ax && ay >= az ? 1 : ax >= az ? 0 : 2;
  const i = Math.floor(p.x / CELL);
  const j = Math.floor(p.y / CELL);
  const k = Math.floor(p.z / CELL);
  return {
    axis,
    u: axis === 0 ? k : i,
    v: axis === 1 ? k : j,
    x: (i + 0.5) * CELL,
    y: (j + 0.5) * CELL,
    z: (k + 0.5) * CELL,
  };
}

/** Body coat: dark brown, black dorsal stripe, silver bristle streaks (more over the shoulders), pale-flecked belly. */
const BODY = paint((p, n) => {
  const c = cellOf(p, n);
  const r = hash(c.u, c.v, c.axis);
  const streak = hash(c.u, Math.floor(c.v / 2), c.axis + 3);
  const checker = (c.u + c.v) & 1;
  if (n.y > 0.3 && Math.abs(c.x) < 0.05 + (r < 0.35 ? CELL : 0)) return r > 0.86 ? DARK : BLACK;
  if (n.y < -0.25) return r < 0.14 ? BLACK : r > 0.9 ? SILVER : DARK;
  const weight = smoothstep(0.42, 0.66, c.y) * (0.07 + 0.22 * smoothstep(-0.35, 0.25, c.z));
  if (streak < weight) return SILVER;
  if (streak < weight + 0.06) return checker ? SILVER : DARK;
  if (streak > 0.9 || (c.y < 0.5 && r < 0.2)) return BLACK;
  return DARK;
});

/** Legs: black socks to knee height with a checker fade, dark brown flecked with silver above. */
const LEG = paint((p, n) => {
  const c = cellOf(p, n);
  const r = hash(c.u, c.v, c.axis + 7);
  if (c.y < 0.3) return BLACK;
  if (c.y < 0.38) return (c.u + c.v) & 1 ? BLACK : DARK;
  if (r < 0.16) return SILVER;
  return r > 0.92 ? BLACK : DARK;
});

const TAIL = paint((p, n) => {
  const c = cellOf(p, n);
  const r = hash(c.u, c.v, c.axis + 11);
  return r < 0.26 ? BLACK : r > 0.84 ? SILVER : DARK;
});

/** Head and jaw coats read the head's own axes (`at`, unit forward `fwd`, unit up `up`): pale muzzle, dark nose. */
function headPaint(at: Vector3, fwd: Vector3, up: Vector3, jaw: boolean) {
  return paint((p, n) => {
    const c = cellOf(p, n);
    const r = hash(c.u, c.v, c.axis + 19);
    const streak = hash(c.u, Math.floor(c.v / 2), c.axis + 23);
    const local = new Vector3(c.x, c.y, c.z).sub(at);
    const zl = local.dot(fwd);
    const yl = local.dot(up);
    const checker = (c.u + c.v) & 1;
    if (jaw) {
      if (n.y < -0.3) return r < 0.45 ? CREAM : SILVER;
      if (zl > 0.26) return r < 0.6 ? BLACK : DARK;
      return zl > 0.1 ? (r < 0.5 ? SILVER : r > 0.85 ? CREAM : DARK) : streak < 0.3 ? SILVER : DARK;
    }
    if (n.y > 0.3 && yl > 0.02 && Math.abs(c.x) < 0.03) return BLACK;
    if (zl > 0.3) return r < 0.35 ? BLACK : DARK;
    if (zl > 0.2) return r < 0.42 ? SILVER : r > 0.9 ? CREAM : DARK;
    if (zl > 0.15) return checker ? SILVER : DARK;
    if (c.axis === 0 && yl < 0.03 && zl > 0.0) return r > 0.82 ? CREAM : r < 0.6 ? SILVER : DARK;
    return streak < 0.2 ? SILVER : streak > 0.92 ? BLACK : DARK;
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Staircase outlines: half widths in pixels, bottom row first, each row one pixel tall.

function stairs(halfWidths: readonly number[]): [number, number][] {
  const right: [number, number][] = [];
  halfWidths.forEach((hw, i) => right.push([hw * CELL, i * CELL], [hw * CELL, (i + 1) * CELL]));
  const all = [...right, ...[...right].reverse().map(([x, y]): [number, number] => [-x, y])];
  return all.filter(([x, y], i) => {
    const [px, py] = all[(i + all.length - 1) % all.length];
    return Math.abs(x - px) > 1e-9 || Math.abs(y - py) > 1e-9;
  });
}

const EAR_ROWS = [3, 3, 3, 2, 2, 1, 1];

/** Piecewise-linear lookup through sorted `[x, y]` keys. */
function interp(keys: readonly (readonly [number, number])[], x: number) {
  if (x <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++)
    if (x <= keys[i][0])
      return keys[i - 1][1] + ((keys[i][1] - keys[i - 1][1]) * (x - keys[i - 1][0])) / (keys[i][0] - keys[i - 1][0]);
  return keys[keys.length - 1][1];
}

export default function build() {
  const b = createBuilder({ name: "nesBoar", paintSize: 1024 });

  const snoutTex = pixelArt(SNOUT_ART);
  const eyeTex = { 1: pixelArt(EYE_L_ART), [-1]: pixelArt(EYE_R_ART) } as Record<number, Texture>;
  const maneTex = pixelArt(MANE_ART);
  const tuftTex = pixelArt(TUFT_ART);
  const floorTex = mouthArt(false);
  const roofTex = mouthArt(true);

  // ---------------------------------------------------------------- body: one octagonal barrel from rump to poll
  const stations = [
    { at: [0, 0.6, -0.5], w: 0.22, h: 0.26 },
    { at: [0, 0.61, -0.36], w: 0.34, h: 0.36 },
    { at: [0, 0.61, -0.16], w: 0.38, h: 0.38 },
    { at: [0, 0.62, 0.06], w: 0.4, h: 0.42 },
    { at: [0, 0.64, 0.22], w: 0.42, h: 0.5 },
    { at: [0, 0.65, 0.36], w: 0.38, h: 0.48 },
    { at: [0, 0.63, 0.48], w: 0.32, h: 0.4 },
  ] as const;
  const curve = catmull(stations.map((s) => s.at));
  const hipsT = curve.knots[1];
  const withersT = curve.knots[4];
  const hips = b.joint("hips", { at: stations[1].at, role: "spine", group: "body" });
  const spine = b.chain("spine", curve.slice(hipsT, withersT), {
    parent: hips,
    count: 3,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
    group: "body",
  });
  const neck = b.chain("neck", curve.slice(withersT, 1), {
    parent: spine.joints[2],
    count: 2,
    names: ["neck1", "neck2"],
    role: "neck",
    group: "body",
  });
  const body = b.loft(stations, {
    bone: [hips, spine, neck],
    color: BODY,
    sides: 8,
    smooth: false,
    caps: { start: "round", end: "flat" },
    group: "body",
  });

  // ---------------------------------------------------------------- tail: a curl drawn in straight strokes
  const tailPts: V3[] = [
    [0, 0.71, -0.49],
    [0, 0.78, -0.56],
    [0, 0.86, -0.61],
    [0, 0.93, -0.67],
    [0.015, 0.93, -0.74],
    [0.03, 0.86, -0.76],
    [0.03, 0.82, -0.7],
  ] as V3[];
  const tail = b.chain("tail", polyline(tailPts), {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6"],
    role: "tail",
    group: "tail",
  });
  b.sweep(tail, [0.042, 0.034, 0.028, 0.024, 0.02, 0.017, 0.014], {
    section: "box",
    color: TAIL,
    caps: { start: "flat", end: "flat" },
    group: "tail",
  });
  b.cards([tail.at(1)], tuftTex, {
    size: [0.1, 0.12],
    lean: 0,
    flow: [0, -0.4, -1],
    cross: true,
    sink: 0.15,
    group: "tail",
    name: "tailTuft",
  });

  // ---------------------------------------------------------------- legs: square columns on split black hooves
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const legs = [
      {
        front: true,
        pts: [
          [s * 0.14, 0.56, 0.2],
          [s * 0.14, 0.34, 0.18],
          [s * 0.13, 0.17, 0.21],
          [s * 0.13, 0.085, 0.235],
          [s * 0.13, 0.06, 0.25],
        ] as V3[],
        names: ["shoulder", "elbow", "wrist", "frontFetlock"],
        parent: spine.joints[2],
        keys: [
          [0, 0.09, 0.1],
          [1, 0.06, 0.07],
          [2, 0.04, 0.045],
          [3, 0.034, 0.038],
          [4, 0.03, 0.034],
        ],
      },
      {
        front: false,
        pts: [
          [s * 0.15, 0.56, -0.36],
          [s * 0.16, 0.37, -0.27],
          [s * 0.14, 0.19, -0.36],
          [s * 0.14, 0.085, -0.335],
          [s * 0.14, 0.06, -0.32],
        ] as V3[],
        names: ["hip", "knee", "hock", "hindFetlock"],
        parent: hips,
        keys: [
          [0, 0.1, 0.12],
          [1, 0.065, 0.08],
          [2, 0.04, 0.05],
          [3, 0.034, 0.038],
          [4, 0.03, 0.034],
        ],
      },
    ];
    for (const leg of legs) {
      const tag = `leg${leg.front ? "F" : "H"}${side}`;
      const chain = b.chain(tag, leg.pts, {
        parent: leg.parent,
        names: leg.names.map((n) => n + side),
        role: "leg",
        contact: [leg.pts[4][0], 0, leg.pts[4][2] + 0.02],
        group: tag,
      });
      const ts = [...chain.ts];
      const across = leg.keys.map(([i, rx]) => [ts[i], rx] as const);
      const along = leg.keys.map(([i, , ry]) => [ts[i], ry] as const);
      b.sweep(chain, (t) => [interp(across, t), interp(along, t)], {
        section: "box",
        color: LEG,
        caps: { start: "flat", end: "flat" },
        group: tag,
      });
      // The cloven hoof: two black wedge boxes side by side, on the fetlock.
      const [fx, , fz] = leg.pts[4];
      for (const dx of [-1, 1])
        b.frustumBox([fx + dx * 0.027, 0, fz], [fx + dx * 0.027, 0.075, fz], [0.048, 0.11], [0.038, 0.085], {
          bone: chain.joints[3],
          color: BLACK,
          group: tag,
          name: "hoof",
        });
    }
  }

  // ---------------------------------------------------------------- head: a box-section wedge, region on the skull
  const headDir: V3 = [0, -0.3, 1];
  const skull = b.joint("head", { parent: neck.joints[1], at: curve.at(1), dir: headDir, role: "head", group: "head" });
  const head = b.region({ at: skull, quat: aim(headDir, [0, 1, 0], "z") });
  const fwd = head.d([0, 0, 1]);
  const upv = head.d([0, 1, 0]);
  const H = (x: number, y: number, z: number) => head.p([x, y, z]);
  const cranium = b.loft(
    [
      { at: H(0, 0.02, -0.1), w: 0.25, h: 0.27 },
      { at: H(0, 0.015, 0.05), w: 0.25, h: 0.26 },
      { at: H(0, -0.015, 0.17), w: 0.18, h: 0.2 },
      { at: H(0, -0.045, 0.28), w: 0.14, h: 0.155 },
      { at: H(0, -0.058, 0.37), w: 0.14, h: 0.13 },
    ],
    {
      bone: skull,
      color: headPaint(skull.at, fwd, upv, false),
      section: "box",
      caps: { start: "flat", end: "flat" },
      group: "head",
      name: "upperHead",
    },
  );

  // Snout disc: the pixel snout drawn on the flat front of the muzzle.
  b.part(new PlaneGeometry(SNOUT_ART[0].length * CELL, SNOUT_ART.length * CELL), "#ffffff", {
    texture: snoutTex,
    bone: skull,
    at: H(0, -0.058, 0.374),
    dir: fwd,
    axis: "z",
    up: upv,
    group: "head",
    name: "snout",
  });

  // Lower jaw, separate so the mouth opens; its top sits just under the roof of the upper head.
  const jaw = b.joint("jaw", {
    parent: skull,
    at: H(0, -0.09, 0.0),
    aim: H(0, -0.158, 0.33),
    role: "jaw",
    group: "jaw",
  });
  b.loft(
    [
      { at: H(0, -0.155, 0.0), w: 0.17, h: 0.05 },
      { at: H(0, -0.157, 0.15), w: 0.13, h: 0.055 },
      { at: H(0, -0.158, 0.28), w: 0.1, h: 0.056 },
      { at: H(0, -0.158, 0.33), w: 0.09, h: 0.056 },
    ],
    {
      bone: jaw,
      color: headPaint(skull.at, fwd, upv, true),
      section: "box",
      caps: { start: "flat", end: "flat" },
      group: "jaw",
      name: "lowerJaw",
    },
  );
  // Mouth interior: tongue floor on the jaw, ridged palate under the skull, each with a run of cream teeth.
  b.part(new PlaneGeometry(0.1, 0.26), "#ffffff", {
    texture: floorTex,
    bone: jaw,
    at: H(0, -0.127, 0.18),
    dir: upv,
    axis: "z",
    up: fwd,
    group: "jaw",
    name: "mouthFloor",
  });
  b.part(new PlaneGeometry(0.1, 0.26), "#ffffff", {
    texture: roofTex,
    bone: skull,
    at: H(0, -0.1235, 0.2),
    dir: upv.clone().negate(),
    axis: "z",
    up: fwd,
    group: "head",
    name: "mouthRoof",
  });

  // Eyes set on the flat cheek by ray, a black brow ridge slanting over each.
  const faceSkin = b.surface(cranium);
  for (const s of [1, -1]) {
    const socket = faceSkin.ray(H(s * 0.4, 0.03, 0.12), head.d([-s, 0, 0]));
    if (!socket) throw new Error("nesBoar: no face under the eye");
    const eye = b.part(new PlaneGeometry(2 * CELL, 2 * CELL), "#ffffff", {
      texture: eyeTex[s],
      bone: skull,
      at: socket.at.clone().addScaledVector(socket.n, 0.004),
      dir: socket.n,
      axis: "z",
      up: upv,
      group: "head",
      name: "eye",
    });
    b.part(new BoxGeometry(0.03, 0.028, 0.1), BLACK, {
      bone: skull,
      at: eye.at.clone().addScaledVector(upv, 0.038).addScaledVector(socket.n, 0.006),
      dir: head.d([0, -0.35, 1]),
      axis: "z",
      up: upv,
      group: "head",
      name: "brow",
    });
  }

  // Tusks: long lower canines curving up beside the snout, and short upper ones pointing down.
  for (const s of [1, -1]) {
    b.sweep(
      bezier(H(s * 0.05, -0.14, 0.26), H(s * 0.088, -0.115, 0.29), H(s * 0.104, -0.05, 0.3), H(s * 0.094, 0.03, 0.27)),
      [0.03, 0],
      {
        bone: jaw,
        color: CREAM,
        section: { ngon: 4 },
        caps: { start: "flat", end: "point" },
        group: "jaw",
        name: "tusk",
      },
    );
    b.spike(H(s * 0.062, -0.112, 0.31), head.d([s * 0.1, -1, 0.15]), 0.05, 0.014, {
      bone: skull,
      color: CREAM,
      section: { ngon: 4 },
      group: "head",
      name: "upperTusk",
    });
  }

  // Ears: staircase-outline slabs on their own joints, erect, angled out and back.
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const a = (25 * Math.PI) / 180;
    const ear = b.joint(`ear${side}`, {
      parent: skull,
      at: H(s * 0.085, 0.13, -0.05),
      dir: head.d([s * Math.sin(a), Math.cos(a), -0.3]),
      role: "hinge",
      group: "head",
    });
    const inner = paint((_p, _n, uv) => {
      const row = Math.min(EAR_ROWS.length - 1, Math.max(0, Math.floor(uv[1] / CELL)));
      const d = EAR_ROWS[row] * CELL - Math.abs(uv[0]);
      if (d < CELL * 0.99 || uv[1] > EAR_ROWS.length * CELL - CELL || uv[1] < CELL) return BLACK;
      return d < 2 * CELL ? DARK : CREAM;
    });
    b.extrude(stairs(EAR_ROWS), {
      at: H(s * 0.085, 0.13, -0.05),
      x: head.d([s * Math.cos(a), -Math.sin(a), 0]),
      y: head.d([s * Math.sin(a), Math.cos(a), -0.3]),
      thickness: 0.035,
      color: inner,
      bone: ear,
      group: "head",
      name: "ear",
    });
  }

  // ---------------------------------------------------------------- bristles: mane along the spine, cheek and crown tufts
  const stripe = (t0: number, t1: number, gap: number, deg: number) => {
    const n = Math.max(2, Math.round(((t1 - t0) * curve.length) / gap));
    return Array.from({ length: n }, (_, i) => body.at(t0 + ((t1 - t0) * i) / (n - 1), deg));
  };
  const rows: [number, number, number, number][] = [
    [0.05, 0.96, 0.085, 0],
    [0.4, 0.93, 0.13, 30],
    [0.4, 0.93, 0.13, -30],
  ];
  const maneFrames = rows.flatMap(([t0, t1, gap, deg]) => stripe(t0, t1, gap, deg));
  b.cards(
    maneFrames.filter((f) => f.t >= 0.3),
    maneTex,
    { size: [0.16, 0.18], lean: 28, vary: 0.12, spin: 8, cross: true, rng: rng(5), group: "mane", name: "mane" },
  );
  b.cards(
    maneFrames.filter((f) => f.t < 0.3),
    maneTex,
    { size: [0.12, 0.135], lean: 28, vary: 0.12, spin: 8, cross: true, rng: rng(6), group: "mane", name: "maneRump" },
  );
  // Crown forelock and jowl bristles on the head.
  const crown = Array.from({ length: 4 }, (_, i) => cranium.at(0.06 + i * 0.09, 0));
  b.cards(crown, maneTex, {
    size: [0.09, 0.1],
    lean: 25,
    cross: true,
    vary: 0.1,
    rng: rng(7),
    group: "head",
    name: "forelock",
  });
  for (const s of [1, -1])
    b.cards(
      Array.from({ length: 3 }, (_, i) => cranium.at(0.14 + i * 0.09, s * 78)),
      maneTex,
      {
        size: [0.07, 0.08],
        lean: 55,
        vary: 0.1,
        rng: rng(8 + s),
        group: "head",
        name: "jowl",
      },
    );

  // Rest pose: the jaw a little open.
  b.pose(jaw, { axis: [1, 0, 0], deg: 10 });
  return b.root;
}
