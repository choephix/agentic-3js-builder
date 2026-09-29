// Game Boy horned frog: a chunky Ceratophrys sitting on a pixel-art lily pad, its huge mouth ajar on a tongue curled
// back on itself, in the four greens of the original handheld (#0f380f, #306230, #8bac0f, #9bbc0f) and nothing else.
// Style: a Game Boy sprite brought into 3D. Every colour on the model is one of those four shades. The lily pad is a
// stepped disc of 12.6 mm cells whose 24x25 pixel drawing (radial veins, a lit lip, a notch) is an `svg()` texture
// mapped one texel per cell; the eyes are 20x10 pixel drawings wrapped once round a faceted sphere at half that
// texel size, and the lotus bud petals are 8x13 sprites on cards. The frog itself is painted in the same square
// cells: 4x4 Bayer dithering between the shades (light belly, darker flanks), blotches, back chevrons, dark speckles
// and lighter warts, all hard-edged and one cell size everywhere. Volumes are octagonal lofts, six-sided limbs and
// four-sided horn pyramids: faceted, stepped, never smooth.
import { BoxGeometry, BufferGeometry, ConeGeometry, Float32BufferAttribute, SphereGeometry, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { noise, paint } from "../src/paint";
import { polyline, spiral } from "../src/path";
import { svg } from "../src/texture";
import type { Joint } from "../src/skeleton";

export const meta = {
  name: "Game Boy horned frog",
  description:
    "A horned frog in the four Game Boy greens: dithered pixel paints, a 24x25 pixel lily pad texture, pixel-drawn eyes, a curled tongue in an open mouth and a full rig with toes, lids and jaw.",
  builtBy: "Claude Sonnet 5.5",
};

// ---------------------------------------------------------------------------------------------------------------
// The four shades, darkest to lightest. Nothing on the model is any other colour.

const D0 = "#0f380f";
const D1 = "#306230";
const D2 = "#8bac0f";
const D3 = "#9bbc0f";
const SHADES = [D0, D1, D2, D3] as const;
const WHITE = "#ffffff"; // texture tint only: the drawings carry the four shades themselves

/** One pixel, in meters, for every paint, the pad and the frog. The eyes and petals use half of it. */
const CELL = 0.0126;
const DEG = Math.PI / 180;

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
/** Ordered-dither threshold (0..1) at integer cell (i, j). */
const bayer = (i: number, j: number) => (BAYER[((j % 4) + 4) % 4][((i % 4) + 4) % 4] + 0.5) / 16;
const hash = (x: number, y: number, seed = 0) => {
  const h = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return h - Math.floor(h);
};
const clamp = (x: number, lo = 0, hi = 1) => Math.min(Math.max(x, lo), hi);
/** The shade for a tone 0..3 (0 = D0, 3 = D3), dithered between neighbouring shades by threshold t. */
function shade(tone: number, t: number) {
  const x = clamp(tone, 0, 3);
  const i = Math.min(Math.floor(x), 2);
  // Mostly solid, with the dither confined to a narrow band round each threshold.
  return clamp((x - i - 0.5) * 2.5 + 0.5) > t ? SHADES[i + 1] : SHADES[i];
}

// ---------------------------------------------------------------------------------------------------------------
// Pixel drawings: rows of characters, `0`..`3` = the four shades, `.` = transparent.

function pixels(rows: string[][]) {
  const h = rows.length;
  const w = rows[0].length;
  const rects: string[] = [];
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      const c = rows[y][x];
      let n = 1;
      while (x + n < w && rows[y][x + n] === c) n++;
      if (c !== ".") rects.push(`<rect x="${x}" y="${y}" width="${n}" height="1" fill="${SHADES[Number(c)]}"/>`);
      x += n;
    }
  }
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${rects.join("")}</svg>`,
    { size: Math.max(w, h), pixelated: true },
  );
}
const blank = (w: number, h: number, c: string) => Array.from({ length: h }, () => Array<string>(w).fill(c));

/**
 * The eye: 40x20 pixels wrapped once round a sphere, so the front sits on the equator at column 10 and every texel is
 * a CELL/4 square there. A bright ball, a dark ring, a mid iris and a horizontal slit pupil with a glint.
 */
function eyeTexture() {
  const g = blank(40, 20, "3");
  for (let r = 0; r < 20; r++)
    for (let c = 0; c < 40; c++) {
      const dx = (c + 0.5 - 10) / 5.6;
      const dy = (r + 0.5 - 10) / 4.6;
      const d = dx * dx + dy * dy;
      if (d <= 0.62) g[r][c] = "2";
      else if (d <= 1) g[r][c] = "1";
      else if (c >= 22 && hash(c, r, 5) < 0.18) g[r][c] = "2"; // flecks on the back of the ball
    }
  const set = (r: number, cs: number[], ch: string) => cs.forEach((c) => (g[r][c] = ch));
  set(8, [8, 9, 10, 11], "0");
  set(11, [8, 9, 10, 11], "0");
  for (const r of [9, 10]) set(r, [7, 8, 9, 10, 11, 12], "0");
  g[9][8] = "3"; // glint
  return pixels(g);
}

/** A lotus petal: an 8x13 lens, light, with a mid lit edge, a dark shaded edge and tip and a shaded base. */
function petalTexture() {
  const widths = [2, 4, 4, 6, 6, 8, 8, 8, 8, 6, 6, 4, 2];
  const g = blank(8, 13, ".");
  widths.forEach((w, r) => {
    const c0 = (8 - w) / 2;
    for (let c = c0; c < c0 + w; c++) {
      const tip = r <= 1 || r === 12;
      g[r][c] = tip || c === c0 + w - 1 ? "1" : c === c0 || r >= 10 ? "2" : "3";
    }
  });
  return pixels(g);
}

// ---------------------------------------------------------------------------------------------------------------
// The lily pad: a stepped disc of cells, built as a height field so every texel of its drawing is one cell.

const PAD_N = 24;
const PAD_ROWS = PAD_N + 1; // the last drawing row is the wall texels
const PAD_TOP = 0.016;
const PAD_LIP = 0.0215;
const PAD_BASE = 0.0075; // the top layer overhangs a base this tall
const NOTCH = new Vector3(0.72, 0, -0.69).normalize();

type PadCell = { inside: boolean; lip: boolean };
type PadGrid = { cells: PadCell[][]; half: number };

function padGrid(): PadGrid {
  const half = PAD_N / 2;
  const inside = (i: number, j: number) => {
    if (i < 0 || j < 0 || i >= PAD_N || j >= PAD_N) return false;
    const cx = i + 0.5 - half;
    const cz = j + 0.5 - half;
    if (Math.hypot(cx, cz) >= half) return false;
    const along = cx * NOTCH.x + cz * NOTCH.z;
    const perp = Math.abs(cx * NOTCH.z - cz * NOTCH.x);
    return !(along > 1.5 && perp < 0.6 + 0.13 * (along - 1.5));
  };
  const cells: PadCell[][] = Array.from({ length: PAD_N }, (_, i) =>
    Array.from({ length: PAD_N }, (_, j) => {
      const ins = inside(i, j);
      const lip = ins && !(inside(i + 1, j) && inside(i - 1, j) && inside(i, j + 1) && inside(i, j - 1));
      return { inside: ins, lip };
    }),
  );
  return { cells, half };
}

/** The pad's 24x25 drawing: dark water-green with dither flecks, mid veins, a light lip; the last row colours the walls. */
function padTexture(grid: PadGrid) {
  const { cells, half } = grid;
  const g = blank(PAD_N, PAD_ROWS, ".");
  for (let j = 0; j < PAD_N; j++)
    for (let i = 0; i < PAD_N; i++) {
      if (!cells[i][j].inside) continue;
      const cx = i + 0.5 - half;
      const cz = j + 0.5 - half;
      const r = Math.hypot(cx, cz);
      if (cells[i][j].lip) {
        g[j][i] = hash(i, j, 3) < 0.3 ? "2" : "3";
        continue;
      }
      const ang = Math.atan2(cz, cx);
      const step = (Math.PI * 2) / 18;
      const perp = r * Math.abs(Math.sin(ang - Math.round(ang / step) * step));
      const vein = r > 1.8 && r < 10.4 && perp < 0.5;
      const t = bayer(i, j);
      g[j][i] = vein ? (r < 5 ? "3" : "2") : hash(i, j, 9) < 0.025 ? "0" : hash(i, j, 4) < 0.06 && t < 0.5 ? "2" : "1";
    }
  g[PAD_N][0] = "1"; // outer wall
  g[PAD_N][1] = "0"; // underside
  g[PAD_N][2] = "2"; // the step up to the lip
  return pixels(g);
}

/** The pad as one faceted mesh: a top quad per cell, walls wherever a neighbour is lower, a flat underside. */
function padGeometry(grid: PadGrid) {
  const { cells, half } = grid;
  const pos: number[] = [];
  const nor: number[] = [];
  const uv: number[] = [];
  const quad = (corners: Vector3[], uvs: [number, number][], normal: Vector3) => {
    const [a, b, c] = corners;
    const flip = b.clone().sub(a).cross(c.clone().sub(a)).dot(normal) < 0;
    const order = flip ? [0, 2, 1, 0, 3, 2] : [0, 1, 2, 0, 2, 3];
    for (const k of order) {
      const p = corners[k];
      pos.push(p.x, p.y, p.z);
      nor.push(normal.x, normal.y, normal.z);
      uv.push(uvs[k][0], uvs[k][1]);
    }
  };
  const inside = (i: number, j: number) => cells[i]?.[j]?.inside === true;
  const height = (i: number, j: number) => (!inside(i, j) ? 0 : cells[i][j].lip ? PAD_LIP : PAD_TOP);
  // The base is the disc inset by one cell: the top layer overhangs it all round, like a stacked sprite tile.
  const base = (i: number, j: number) =>
    inside(i, j) && inside(i + 1, j) && inside(i - 1, j) && inside(i, j + 1) && inside(i, j - 1);
  const wallV = 0.5 / PAD_ROWS;
  const texel = (k: number): [number, number][] => Array.from({ length: 4 }, () => [(k + 0.5) / PAD_N, wallV]);
  for (let i = 0; i < PAD_N; i++)
    for (let j = 0; j < PAD_N; j++) {
      if (!inside(i, j)) continue;
      const h = height(i, j);
      const x0 = (i - half) * CELL;
      const x1 = x0 + CELL;
      const z0 = (j - half) * CELL;
      const z1 = z0 + CELL;
      const u0 = (i + 0.04) / PAD_N;
      const u1 = (i + 0.96) / PAD_N;
      const vHi = 1 - (j + 0.04) / PAD_ROWS;
      const vLo = 1 - (j + 0.96) / PAD_ROWS;
      const floor = (y: number) => [
        new Vector3(x0, y, z0),
        new Vector3(x0, y, z1),
        new Vector3(x1, y, z1),
        new Vector3(x1, y, z0),
      ];
      quad(
        floor(h),
        [
          [u0, vHi],
          [u0, vLo],
          [u1, vLo],
          [u1, vHi],
        ],
        new Vector3(0, 1, 0),
      );
      const isBase = base(i, j);
      quad(floor(isBase ? 0 : PAD_BASE), texel(1), new Vector3(0, -1, 0));
      for (const [di, dj] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const [xa, xb] = di === 0 ? [x0, x1] : [di > 0 ? x1 : x0, di > 0 ? x1 : x0];
        const [za, zb] = dj === 0 ? [z0, z1] : [dj > 0 ? z1 : z0, dj > 0 ? z1 : z0];
        const wall = (lo: number, hi: number, k: number) =>
          quad(
            [new Vector3(xa, lo, za), new Vector3(xa, hi, za), new Vector3(xb, hi, zb), new Vector3(xb, lo, zb)],
            texel(k),
            new Vector3(di, 0, dj),
          );
        if (!inside(i + di, j + dj)) wall(PAD_BASE, h, 0);
        else if (height(i + di, j + dj) < h) wall(height(i + di, j + dj), h, 2);
        if (isBase && !base(i + di, j + dj)) wall(0, PAD_BASE, 1);
      }
    }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new Float32BufferAttribute(nor, 3));
  geo.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  return geo;
}

// ---------------------------------------------------------------------------------------------------------------
// The frog's paint: square cells, four shades, ordered dither.

/** The two cell axes of the face `n` points at, and the cell they fall in. */
function cellOf(p: Vector3, n: Vector3) {
  const ax = Math.abs(n.x);
  const ay = Math.abs(n.y);
  const az = Math.abs(n.z);
  const [u, v] = ay >= ax && ay >= az ? [p.x, p.z] : ax >= az ? [p.z, p.y] : [p.x, p.y];
  return [Math.floor(u / CELL), Math.floor(v / CELL)] as const;
}

/**
 * The coat at a point: a light belly, dithered from mid flanks to a mid back, dark blotches, back chevrons, dark
 * speckles and light sparkles. `dark` pushes the tone down a shade (leg bars).
 */
const LIGHT = new Vector3(0.35, 0.8, 0.5).normalize();
function coat(p: Vector3, n: Vector3, dark = 0) {
  const [iu, iv] = cellOf(p, n);
  const t = bayer(iu, iv);
  const q = new Vector3(
    (Math.floor(p.x / CELL) + 0.5) * CELL,
    (Math.floor(p.y / CELL) + 0.5) * CELL,
    (Math.floor(p.z / CELL) + 0.5) * CELL,
  );
  const belly = clamp((-n.y - 0.1) / 0.45);
  let tone = 1.5 + 0.9 * n.dot(LIGHT) + 1.5 * belly - dark;
  const speck = hash(iu, iv, 2 + Math.round(n.y * 3));
  if (belly < 0.4) {
    if (noise(q, 0.06, 3) > 0.6) tone -= 0.8;
    const chevron = q.z + 0.85 * Math.abs(q.x);
    const k = Math.floor((chevron + 0.4) / CELL);
    if (n.y > 0.3 && q.z < 0.012 && q.z > -0.1 && Math.abs(q.x) < 0.062 && ((k % 4) + 4) % 4 === 0) return D0;
    if (speck < 0.035) return D0;
    if (speck > 0.965 && n.y > 0.4) return D3;
  } else if (speck > 0.93) tone -= 1;
  return shade(tone, t);
}

const COAT = paint((p, n) => coat(p, n));
/** A limb with dark bars: about 1.6 cells wide every 3rd step along its `length` (meters). */
const barred = (length: number) =>
  paint((p, n, s) => coat(p, n, n.y > -0.2 && Math.floor((s[0] * length) / (CELL * 1.6)) % 3 === 1 ? 0.95 : 0));
/** Toes: the limb coat, with a light pad on the last fifth. */
const toes = (length: number) => {
  const limb = barred(length);
  return paint((_p, _n, s) => (s[0] > 0.78 ? D3 : limb));
};
/** The tongue: mid to light, a hard ordered dither along its length. */
const TONGUE = paint((p, n, s) => {
  const [iu, iv] = cellOf(p, n);
  return shade(1.5 + 1.5 * s[0], bayer(iu, iv));
});
/** An eyelid: the coat with a dark rim round its lower edge. */
const lidPaint = (centre: Vector3, axis: Vector3, half: number) =>
  paint((p, n) => {
    const d = p.clone().sub(centre).normalize();
    return Math.acos(clamp(d.dot(axis), -1, 1)) > half - 0.2 ? D0 : coat(p, n);
  });

/** Flat-shaded copy of a geometry: chunky facets that keep their UVs. */
const faceted = (geo: BufferGeometry) => {
  const flat = geo.toNonIndexed();
  flat.computeVertexNormals();
  return flat;
};

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "gameboyFrog" });
  const random = rng(6);

  const X = new Vector3(1, 0, 0);
  const Y = new Vector3(0, 1, 0);
  /** The head is tipped up so the open jaw clears the pad; its frame is this pitch about X around `H0`. */
  const PITCH = 32 * DEG;
  const H0 = new Vector3(0, 0.072, 0.05);
  const hd = (x: number, y: number, z: number) => new Vector3(x, y, z).applyAxisAngle(X, -PITCH);
  const hp = (x: number, y: number, z: number) => hd(x, y, z).add(H0);

  // ---------------------------------------------------------------------------------------------- skeleton
  const root = b.joint("root", { at: [0, PAD_TOP, 0], dir: [0, 0, 1], group: "pad" });
  const hips = b.joint("hips", { parent: root, at: [0, 0.058, -0.06], dir: [0, 0, 1], role: "spine", group: "body" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.058, -0.06],
      [0, 0.058, -0.03],
      [0, 0.058, 0],
      [0, 0.059, 0.03],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine", group: "body" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 0.059, 0.03], aim: H0, role: "neck", group: "head" });
  const head = b.joint("head", { parent: neck, at: H0, dir: hd(0, 0, 1), role: "head", group: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: hp(0, -0.028, -0.006),
    aim: hp(0, -0.026, 0.09),
    role: "jaw",
    group: "jaw",
  });

  // ---------------------------------------------------------------------------------------------- body
  const trunk = b.loft(
    [
      { at: new Vector3(0, 0.05, -0.105), w: 0.06, h: 0.06 },
      { at: new Vector3(0, 0.058, -0.07), w: 0.125, h: 0.082 },
      { at: new Vector3(0, 0.06, -0.03), w: 0.15, h: 0.088 },
      { at: new Vector3(0, 0.058, 0.01), w: 0.15, h: 0.084 },
      { at: new Vector3(0, 0.057, 0.045), w: 0.13, h: 0.08 },
    ],
    { bone: [spine, hips], color: COAT, section: { ngon: 8 }, group: "body", name: "trunk" },
  );

  // ---------------------------------------------------------------------------------------------- head
  const upper = b.loft(
    [
      { at: hp(0, 0.01, -0.012), w: 0.135, h: 0.07 },
      { at: hp(0, 0.013, 0.018), w: 0.16, h: 0.072 },
      { at: hp(0, 0.006, 0.05), w: 0.152, h: 0.058 },
      { at: hp(0, -0.001, 0.078), w: 0.118, h: 0.044 },
      { at: hp(0, -0.003, 0.088), w: 0.085, h: 0.036 },
    ],
    {
      bone: head,
      color: COAT,
      section: { ngon: 8 },
      sectors: [[135, 225, D0]],
      caps: { start: "round", end: "flat" },
      group: "head",
      name: "upperJaw",
    },
  );
  const lower = b.loft(
    [
      { at: hp(0, -0.028, -0.006), w: 0.125, h: 0.03 },
      { at: hp(0, -0.031, 0.02), w: 0.145, h: 0.03 },
      { at: hp(0, -0.03, 0.052), w: 0.138, h: 0.028 },
      { at: hp(0, -0.027, 0.07), w: 0.108, h: 0.026 },
      { at: hp(0, -0.025, 0.08), w: 0.078, h: 0.024 },
    ],
    {
      bone: jaw,
      color: COAT,
      section: { ngon: 8 },
      sectors: [[-30, 30, D0]],
      caps: { start: "round", end: "flat" },
      group: "jaw",
      name: "lowerJaw",
    },
  );
  const skin = b.surface([trunk, upper]);

  // Nostrils: two dark pixels on the snout.
  for (const s of [1, -1]) {
    const hit = b.surface(upper).ray(hp(s * 0.016, 0.08, 0.073), hd(0, -1, 0));
    if (hit)
      b.stick(new BoxGeometry(CELL * 0.6, CELL * 0.4, CELL * 0.6), D0, hit, { embed: 0.35, bone: head, group: "head" });
  }

  // Warts: light pixel bumps scattered over the back and the crown.
  const eyeSpots = [hp(0.052, 0.05, 0.016), hp(-0.052, 0.05, 0.016)];
  const warts = skin.scatter(26, {
    rng: rng(11),
    minDist: 0.03,
    filter: (h) => h.n.y > 0.55 && h.at.y > 0.07 && eyeSpots.every((e) => e.distanceTo(h.at) > 0.04),
  });
  for (const hit of warts)
    b.stick(new BoxGeometry(CELL * 0.7, CELL * 0.5, CELL * 0.7), D3, hit, {
      embed: 0.3,
      spin: random() * 90,
      group: "body",
    });

  // ---------------------------------------------------------------------------------------------- eyes, lids and horns
  const EYE_R = (40 * (CELL / 4)) / (Math.PI * 2);
  const eyeTex = eyeTexture();
  const LID_A = 80 * DEG; // angle between the gaze and the lid's cap axis
  const CAP = 58 * DEG; // the lid's cap covers this far from its axis
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const group = `eye${side}`;
    const eyeC = hp(s * 0.052, 0.05, 0.016);
    const gaze = new Vector3(s * 0.35, 0.3, 0.88).normalize();
    const upPerp = Y.clone().addScaledVector(gaze, -Y.dot(gaze)).normalize();
    const axis = gaze.clone().multiplyScalar(Math.cos(LID_A)).addScaledVector(upPerp, Math.sin(LID_A)).normalize();
    const eye = b.joint(`eye${side}`, { parent: head, at: eyeC, dir: gaze, group });
    b.part(faceted(new SphereGeometry(EYE_R, 10, 6)), WHITE, {
      texture: eyeTex,
      bone: eye,
      at: eyeC,
      dir: gaze,
      axis: "z",
      group,
    });
    const lid = b.joint(`lid${side}`, { parent: head, at: eyeC, dir: axis, role: "hinge", group });
    b.part(faceted(new SphereGeometry(EYE_R * 1.14, 10, 5, 0, Math.PI * 2, 0, CAP)), lidPaint(eyeC, axis, CAP), {
      bone: lid,
      at: eyeC,
      dir: axis,
      group,
    });
    // The horn: a four-sided pyramid rising from the lid, swept back and out.
    const back = hd(0, 0, -1);
    const hornDir = axis
      .clone()
      .multiplyScalar(0.6)
      .addScaledVector(back, 0.75)
      .addScaledVector(X, s * 0.3)
      .normalize();
    const hornBase = eyeC.clone().addScaledVector(axis, EYE_R * 1.05);
    b.spike(hornBase, hornDir, 0.032, 0.011, {
      bone: lid,
      section: { ngon: 4 },
      bands: [
        [0.45, D1],
        [0.8, D2],
        [1, D3],
      ],
      group,
      name: `horn${side}`,
    });
  }

  // ---------------------------------------------------------------------------------------------- legs
  const FLOOR = PAD_TOP;
  const digits = (
    prefix: string,
    side: string,
    s: number,
    parent: Joint,
    base: Vector3,
    yaw: number,
    spread: number[],
    lens: number[],
    radius: number,
    group: string,
  ) => {
    spread.forEach((deg, i) => {
      const a = (yaw + deg) * s * DEG;
      const dir = new Vector3(Math.sin(a), 0, Math.cos(a));
      const y = FLOOR + radius * 0.95;
      const p0 = new Vector3(base.x, y, base.z);
      const mid = p0.clone().addScaledVector(dir, lens[i] * 0.55);
      const tip = p0.clone().addScaledVector(dir, lens[i]);
      const name = `${prefix}${side}${i + 1}`;
      const chain = b.chain(name, polyline([p0, mid, tip]), {
        parent,
        names: [`${name}_1`, `${name}_2`],
        role: "digit",
        group,
      });
      b.sweep(chain, [radius, radius * 0.78], {
        color: toes(lens[i]),
        section: { ngon: 5 },
        group,
        name: name,
      });
    });
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // Front leg: shoulder tucked in the flank, elbow out and back, hand flat under the cheek, four fingers.
    {
      const group = `legF${side}`;
      const pts = [
        new Vector3(s * 0.058, 0.052, 0.028),
        new Vector3(s * 0.097, 0.031, 0.002),
        new Vector3(s * 0.104, FLOOR + 0.0055, 0.062),
        new Vector3(s * 0.107, FLOOR + 0.0055, 0.076),
      ];
      const leg = b.chain(`legF${side}`, polyline(pts), {
        parent: chest,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
        role: "leg",
        contact: [pts[3].x, FLOOR, pts[3].z],
        group,
      });
      const len = 0.15;
      b.sweep(leg, [0.017, 0.012, 0.0105, 0.0085], { color: barred(len), section: { ngon: 6 }, group, name: group });
      digits(
        "finger",
        side,
        s,
        leg.joints[2],
        pts[3],
        8,
        [-24, -8, 8, 24],
        [0.026, 0.032, 0.032, 0.026],
        0.0052,
        group,
      );
    }
    // Hind leg: thigh forward and out, shank folded back, long foot flat on the pad, five toes fanned forward.
    {
      const group = `legH${side}`;
      const pts = [
        new Vector3(s * 0.046, 0.058, -0.062),
        new Vector3(s * 0.106, 0.036, -0.014),
        new Vector3(s * 0.088, 0.025, -0.1),
        new Vector3(s * 0.122, FLOOR + 0.0055, -0.076),
      ];
      const leg = b.chain(`legH${side}`, polyline(pts), {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
        contact: [pts[3].x, FLOOR, pts[3].z],
        group,
      });
      const len = 0.24;
      b.sweep(leg, [0.024, 0.016, 0.0125, 0.009], { color: barred(len), section: { ngon: 6 }, group, name: group });
      digits(
        "toe",
        side,
        s,
        leg.joints[2],
        pts[3],
        4,
        [-30, -15, 0, 15, 30],
        [0.028, 0.036, 0.042, 0.038, 0.03],
        0.0056,
        group,
      );
    }
  }

  // ---------------------------------------------------------------------------------------------- tongue and teeth
  // The tongue is rooted at the front of the lower jaw, runs back along the floor of the mouth and rolls up into a
  // curl. It is built with the jaw closed, so it rides the jaw bone when the jaw is opened below.
  {
    const floorY = -0.0135;
    const P2 = hp(0, floorY, 0.044);
    const coil = spiral(hp(0, floorY + 0.009, 0.044), P2, hd(1, 0, 0), { turns: 1.3, r1: 0.0035 });
    const path = polyline([hp(0, floorY, 0.07), hp(0, floorY, 0.057), P2]).concat(coil);
    const tongue = b.chain("tongue", path, { parent: jaw, count: 7, role: "tentacle", group: "jaw" });
    b.sweep(tongue, (t) => [0.0075 * (1 - 0.35 * t), 0.0038], {
      color: TONGUE,
      section: "box",
      group: "jaw",
      name: "tongue",
    });
  }
  const jawSkin = b.surface(lower);
  for (const [x, z] of [
    [0.014, 0.077],
    [-0.014, 0.077],
    [0.027, 0.058],
    [-0.027, 0.058],
  ]) {
    const hit = jawSkin.ray(hp(x, 0.03, z), hd(0, -1, 0));
    if (hit) b.stick(new ConeGeometry(0.0042, 0.012, 3), D3, hit, { embed: 0.2, bone: jaw, group: "jaw" });
  }
  b.pose(jaw, { axis: [1, 0, 0], deg: 36 });

  // ---------------------------------------------------------------------------------------------- the pad
  const padCells = padGrid();
  b.part(padGeometry(padCells), WHITE, {
    texture: padTexture(padCells),
    bone: root,
    at: [0, 0, 0],
    group: "pad",
    name: "lilyPad",
  });

  // A lotus bud tucked behind the frog: two rings of pixel petal cards.
  {
    const base = new Vector3(-0.03, PAD_TOP, -0.126);
    const petals = petalTexture();
    const ring = (count: number, lean: number, twist: number, size: [number, number], radius: number) => {
      const radials: Vector3[] = [];
      const frames = Array.from({ length: count }, (_, k) => {
        const a = (k / count) * Math.PI * 2 + twist * DEG;
        const radial = new Vector3(Math.cos(a), 0, Math.sin(a));
        radials.push(radial);
        const dir = radial
          .clone()
          .multiplyScalar(Math.sin(lean * DEG))
          .addScaledVector(Y, Math.cos(lean * DEG));
        return frame(base.clone().addScaledVector(radial, radius), dir);
      });
      b.cards(frames, petals, {
        size,
        flow: (_f, i) => radials[i],
        bone: root,
        sink: 0.05,
        group: "bud",
        name: "petals",
      });
    };
    ring(5, 26, 10, [0.019, 0.048], 0.006);
    ring(4, 8, 40, [0.015, 0.044], 0.003);
  }

  return b.root;
}
