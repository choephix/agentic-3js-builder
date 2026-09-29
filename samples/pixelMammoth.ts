// Pixel mammoth. A woolly mammoth about 3.5 m tall, in pixel art, post-Minecraft low-poly: huge tusks curling forward
// and back up, a raised trumpeting trunk, a high-domed skull, a sloping back and a shaggy coat with a little snow on it.
// Style: every surface sits on one pixel size (TEXEL, 5 cm). Volumes are few-sided: an octagonal barrel and skull,
// hex-column legs, a hex trunk and hex tusks, stepped-outline ears, an octagonal foot pad. Every paint (coat, trunk
// skin, ivory, snow) is quantised into TEXEL squares and dithered with a 4x4 Bayer matrix between the steps of a small
// hand-picked ramp (blue-black shadows, warm browns, sun-bleached tips, ice blues, ivory). The coat itself is hair
// cards: 4..6 pixel wide `svg()` pixel sprites with stepped tips, shingled over the body, longer on the hump mane,
// the topknot and the belly skirt, hanging in rows on the legs, tinted by the same quantised coat paint so patches of
// hair read as coloured pixel clumps. Snow lies in stepped two-layer drifts of little boxes, and icicles hang from the
// chin and belly.
// Skeleton: hips, spine1..3, neck1..2, head, jaw; earL/earR hinges; an eight-joint trunk; four legs of four joints
// (shoulder / elbow / wrist / frontFoot and hip / knee / ankle / hindFoot); a three-joint tail.
import { BoxGeometry, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { noise, paint, smoothstep } from "../src/paint";
import { catmull } from "../src/path";
import { svg } from "../src/texture";
import type { Hit } from "../src/surface";

export const meta = {
  name: "Pixel mammoth",
  builtBy: "Claude Sonnet 5.5",
  description:
    "Woolly mammoth in pixel art: huge curling tusks, raised trunk, high-domed skull, a coat of pixel-sprite hair cards over a dithered brown paint, and stepped snow drifts on its back.",
};

// ---------------------------------------------------------------------------------------------------------------
// One pixel, in meters: the size of every paint cell and of a texel of every drawing.
const TEXEL = 0.05;
const CELL = TEXEL;

// Ramps, dark to light. Textures bring their own colours; only ice, nails and icicles are flat.
const FUR = ["#1b1524", "#3a2314", "#5b3a1f", "#83552c", "#a97b43", "#cf9f5d"] as const;
const SKIN = ["#33262a", "#523a38", "#755548", "#96705a", "#b48c72"] as const;
const IVORY = ["#7a6640", "#b3a170", "#d8cb9c", "#efe6c4", "#fbf5df"] as const;
const SNOW = ["#86a9d6", "#b9d3f0", "#e0effc", "#ffffff"] as const;
const ICE = ["#4a7ab5", "#7aa5d6", "#b2d4f2", "#e0f1ff"] as const;
const NAIL = "#cbbd93";
const ICICLE = ["#a9d2f5", "#dff2ff"] as const;

// ---------------------------------------------------------------------------------------------------------------
// Pixel helpers.

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
/** Ordered-dither threshold (0..1) at integer cell (i, j). */
const bayer = (i: number, j: number) => (BAYER[((j % 4) + 4) % 4][((i % 4) + 4) % 4] + 0.5) / 16;
/** The ramp step for value v (0..1), dithered between neighbouring steps by threshold t. */
function pick(ramp: readonly string[], v: number, t: number) {
  const x = Math.min(Math.max(v, 0), 1) * (ramp.length - 1);
  const i = Math.min(Math.floor(x), ramp.length - 2);
  return x - i > t ? ramp[i + 1] : ramp[i];
}
const hash = (x: number, y: number, seed = 0) => {
  const h = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return h - Math.floor(h);
};
const snap = (v: number) => (Math.floor(v / CELL) + 0.5) * CELL;

/** The two cell axes of the face `n` points at, and the cell they fall in. */
function cellOf(p: Vector3, n: Vector3) {
  const ax = Math.abs(n.x);
  const ay = Math.abs(n.y);
  const az = Math.abs(n.z);
  const [u, v] = ay >= ax && ay >= az ? [p.x, p.z] : ax >= az ? [p.z, p.y] : [p.x, p.y];
  return [Math.floor(u / CELL), Math.floor(v / CELL)] as const;
}

/** A pixel grid ("" = transparent) as an `svg()` drawing: one rect per horizontal run, rasterised 1:1. */
function pixelTexture(w: number, h: number, draw: (g: string[][]) => void) {
  const g = Array.from({ length: h }, () => Array<string>(w).fill(""));
  draw(g);
  const rects: string[] = [];
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      const c = g[y][x];
      let n = 1;
      while (x + n < w && g[y][x + n] === c) n++;
      if (c) rects.push(`<rect x="${x}" y="${y}" width="${n}" height="1" fill="${c}"/>`);
      x += n;
    }
  }
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${rects.join("")}</svg>`,
    { size: Math.max(w, h), pixelated: true },
  );
}

// Hair sprites in greys (the coat paint tints them): dark at the root, pale at the stepped tips.
const HAIR = ["#7e7e7e", "#d0d0d0", "#b4b4b4", "#ffffff"] as const;

/** A comb of strands `pw` pixels wide: column x is `heights[x]` pixels tall from the bottom (the card root); the
 * top of a strand sways by `sway[x]` pixels. */
function strands(w: number, h: number, heights: number[], sway: number[], pw: number) {
  return pixelTexture(w, h, (g) => {
    for (let x = 0; x < w; x++) {
      const H = heights[x];
      for (let r = 0; r < H; r++) {
        const dx = r >= Math.ceil(H * 0.6) ? sway[x] : 0;
        const xx = Math.min(w - 1, Math.max(0, x + dx));
        const alt = Math.floor(x / pw) % 2;
        g[h - 1 - r][xx] = r === 0 ? HAIR[0] : r >= H - 1 ? HAIR[3] : alt ? HAIR[2] : HAIR[1];
      }
    }
  });
}

const eyeTexture = () =>
  pixelTexture(5, 4, (g) => {
    const rows = ["kkkkk", "kbwbk", "kbbbk", ".kkk."];
    const pal: Record<string, string> = { k: "#180d09", b: "#6b3b17", w: "#f5e6b4" };
    rows.forEach((row, y) => {
      for (let x = 0; x < 5; x++) if (row[x] !== ".") g[y][x] = pal[row[x]];
    });
  });

// ---------------------------------------------------------------------------------------------------------------
// Paints.

/** The woolly coat: vertical strands of hair on the flanks, clumps from soft noise, blue-black shadows, dithered
 * between five browns. Snow settles on upward faces above `snowY`; ice frosts the fur below `frostY`. */
function furPaint(snowY: number, frostY: number, tone = 0) {
  return paint((p, n) => {
    const [iu, iv] = cellOf(p, n);
    const t = bayer(iu, iv);
    const q = new Vector3(snap(p.x), snap(p.y), snap(p.z));
    const wall = Math.abs(n.y) < 0.6;
    const strand = wall ? hash(iu, 11) - 0.5 : 0;
    const drift = wall ? hash(iu, Math.floor(iv / 4), 12) - 0.5 : 0;
    const lump = noise(q, 0.5, 9) - 0.5;
    const snow = smoothstep(0.45, 0.8, n.y) * smoothstep(0.02, 0.34, lump * 0.8 + (p.y - snowY) * 1.2);
    if (snow > t) return pick(SNOW, 0.42 + 0.5 * n.y - 0.3 * hash(iu, iv, 5), bayer(iv + 1, iu + 2));
    const frost = smoothstep(frostY, frostY - 0.6, p.y);
    if (frost > 0.05 && hash(iu, iv, 8) < frost * 0.55)
      return pick(ICE, 0.2 + 0.7 * hash(iv, iu, 4), bayer(iu + 3, iv));
    let v =
      0.56 +
      tone +
      0.6 * (noise(q, 0.6, 3) - 0.5) +
      0.4 * (noise(q, 1.2, 21) - 0.5) +
      0.32 * strand +
      0.2 * drift +
      0.16 * (hash(iu, iv, 2) - 0.5) +
      0.12 * n.y;
    v -= 0.22 * smoothstep(-0.2, -0.9, n.y);
    return pick(FUR, v, bayer(iv + 1, iu + 2));
  });
}

const COAT_BODY = furPaint(2.9, 1.9);
const COAT_HEAD = furPaint(3.15, 0);
const COAT_LEG = furPaint(99, 1.15, -0.04);
const COAT_PLAIN = furPaint(99, 0);

/** Cells on a swept tube: `row` along it in TEXEL steps, `col` around it in TEXEL steps for the radius there. */
function tubeCell(t: number, deg: number, length: number, r: number) {
  const row = Math.floor((t * length) / CELL);
  const cols = Math.max(3, Math.round((2 * Math.PI * r) / CELL));
  const col = Math.floor(((((deg % 360) + 360) % 360) / 360) * cols);
  return [row, col] as const;
}

const TRUNK_POINTS: [number, number, number][] = [
  [0, 2.2, 2.45],
  [0, 2.02, 2.95],
  [0, 2.2, 3.4],
  [0, 2.65, 3.7],
  [0, 3.2, 3.72],
  [0, 3.5, 3.42],
  [0, 3.42, 3.08],
];
const TRUNK_LEN = catmull(TRUNK_POINTS).length;
const trunkR = (t: number) => 0.23 * Math.pow(1 - t, 0.9) + 0.09;

/** Trunk skin: rings of wrinkles every third cell, dithered greys-browns, a dusting of snow on the top of the curl. */
const TRUNK_PAINT = paint((p, n, s) => {
  const [row, col] = tubeCell(s[0], s[1], TRUNK_LEN, trunkR(s[0]));
  const t = bayer(col, row);
  if (n.y > 0.7 && p.y > 3.25 && noise(p, 0.3, 4) > 0.45 + 0.3 * t) return pick(SNOW, 0.5 + 0.4 * hash(col, row, 3), t);
  let v = 0.5 + 0.28 * (hash(col, row, 1) - 0.5) + 0.14 * n.y + 0.2 * (noise(p, 0.5, 6) - 0.5);
  if (row % 3 === 0) v -= 0.2;
  else if (row % 3 === 1) v += 0.06;
  return pick(SKIN, v, bayer(col + 1, row + 2));
});

const TUSK_POINTS: [number, number, number][] = [
  [0.42, 2.15, 2.2],
  [0.8, 1.9, 2.55],
  [1.02, 1.5, 2.95],
  [1.1, 1.1, 3.4],
  [1.06, 0.95, 3.85],
  [0.9, 1.05, 4.2],
  [0.7, 1.4, 4.35],
  [0.5, 1.85, 4.25],
];
const TUSK_LEN = catmull(TUSK_POINTS).length;
const tuskR = (t: number) => 0.17 * Math.pow(1 - t, 0.8) + 0.03;

/** Ivory: stepped growth rings, hair-line cracks, dithered light on top, amber stain at the root and the worn tip. */
const TUSK_PAINT = paint((_p, n, s) => {
  const [row, col] = tubeCell(s[0], s[1], TUSK_LEN, tuskR(s[0]));
  let v = 0.7 + 0.16 * n.y + 0.12 * (hash(col, row, 2) - 0.5);
  if (row % 6 === 0) v -= 0.16;
  if (hash(col, Math.floor(row / 2), 7) < 0.05) v -= 0.3;
  const stain = smoothstep(0.16, 0.02, s[0]) + smoothstep(0.93, 1, s[0]) * 0.6;
  v -= 0.45 * stain;
  return pick(IVORY, v, bayer(col + 1, row + 2));
});

/** Lumps of drift snow: white on top, ice blue down the sides, dithered. */
const SNOW_PAINT = paint((p, n) => {
  const [iu, iv] = cellOf(p, n);
  return pick(SNOW, 0.3 + 0.75 * Math.max(n.y, 0) + 0.25 * (hash(iu, iv, 6) - 0.5), bayer(iu, iv));
});

/** A hoof pad: dark horn, dithered. */
const HOOF_PAINT = paint((p, n) => {
  const [iu, iv] = cellOf(p, n);
  return pick(SKIN, 0.18 + 0.25 * hash(iu, iv, 3) + 0.2 * n.y, bayer(iu, iv));
});

// ---------------------------------------------------------------------------------------------------------------
// Ear outline: a staircase, one 0.07 m step at a time (x runs out from the head, y up).
const EAR: [number, number][] = (
  [
    [0, 0.3],
    [0.15, 0.3],
    [0.15, 0.4],
    [0.4, 0.4],
    [0.4, 0.3],
    [0.55, 0.3],
    [0.55, 0.0],
    [0.65, 0.0],
    [0.65, -0.3],
    [0.55, -0.3],
    [0.55, -0.45],
    [0.4, -0.45],
    [0.4, -0.55],
    [0.15, -0.55],
    [0.15, -0.4],
    [0, -0.4],
  ] as [number, number][]
).map(([x, y]): [number, number] => [x * 0.7, y * 0.7]);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "pixelMammoth", paintSize: 1024 });
  const random = rng(11);

  const TUFT_A = strands(6, 8, [5, 5, 8, 8, 6, 6], [0, 0, 1, 1, -1, -1], 2);
  const TUFT_B = strands(6, 8, [7, 7, 5, 5, 8, 8], [1, 1, 0, 0, -1, -1], 2);
  const TUFT_C = strands(6, 8, [6, 8, 5, 7, 8, 4], [1, 0, -1, 1, 0, -1], 1);
  const SHAG = strands(4, 12, [9, 9, 12, 12], [1, 1, -1, -1], 2);
  const LONG = strands(6, 14, [10, 10, 14, 14, 9, 9], [-1, -1, 0, 0, 1, 1], 2);
  const SHORT = strands(5, 5, [3, 5, 4, 5, 3], [0, 0, 0, 0, 0], 1);
  const EYE = eyeTexture();
  const TUFTS = [TUFT_A, TUFT_B, TUFT_C];
  const LOCKS = [SHAG, LONG, LONG];

  // ---------------------------------------------------------------- skeleton: spine, neck, head, jaw
  const hips = b.joint("hips", { at: [0, 2.0, -0.95], role: "spine", group: "body" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.0, -0.95],
      [0, 2.1, -0.2],
      [0, 2.35, 0.6],
      [0, 2.45, 1.2],
    ]),
    { parent: hips, count: 3, names: ["spine1", "spine2", "spine3"], role: "spine", group: "body" },
  );
  const neckPath = catmull([
    [0, 2.45, 1.2],
    [0, 2.6, 1.55],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: spine.joints[2],
    count: 2,
    names: ["neck1", "neck2"],
    role: "neck",
    group: "body",
  });
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: neckPath.at(1),
    dir: [0, -0.05, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 2.02, 1.95],
    aim: [0, 1.85, 2.45],
    role: "jaw",
    group: "jaw",
  });

  // ---------------------------------------------------------------- barrel: sloping back, shoulder hump
  const body = b.loft(
    [
      { at: [0, 1.95, -1.75], w: 0.9, h: 1.0 },
      { at: [0, 2.0, -1.2], w: 1.6, h: 1.55 },
      { at: [0, 2.1, -0.3], w: 1.85, h: 1.7 },
      { at: [0, 2.3, 0.55], w: 1.9, h: 1.8 },
      { at: [0, 2.35, 1.2], w: 1.5, h: 1.65 },
      { at: [0, 2.45, 1.5], w: 1.1, h: 1.4 },
    ],
    { bone: [hips, spine, neck], color: COAT_BODY, section: { ngon: 8 }, group: "body", name: "barrel" },
  );

  // ---------------------------------------------------------------- skull: a high dome, cheeks, snout
  const skull = b.loft(
    [
      { at: [0, 2.78, 1.4], w: 1.15, h: 1.2 },
      { at: [0, 2.78, 1.85], w: 1.1, h: 1.2 },
      { at: [0, 2.48, 2.25], w: 0.85, h: 0.95 },
      { at: [0, 2.25, 2.55], w: 0.6, h: 0.7 },
    ],
    { bone: head, color: COAT_HEAD, section: { ngon: 8 }, group: "head", name: "skull" },
  );
  const jawMesh = b.frustumBox([0, 2.0, 1.97], [0, 1.82, 2.45], [0.5, 0.3], [0.3, 0.22], {
    bone: jaw,
    color: COAT_PLAIN,
    group: "jaw",
    name: "jaw",
  });

  // Eyes: 5x4 pixel drawings on little boxes, sunk into the cheeks.
  const skullSkin = b.surface(skull);
  const eyeAt: Vector3[] = [];
  for (const s of [1, -1]) {
    const hit = skullSkin.around([0, 2.55, 2.0]).at(s * 85, 0);
    if (!hit) continue;
    eyeAt.push(hit.at.clone());
    b.part(new BoxGeometry(5 * TEXEL, 4 * TEXEL, 0.05), "#ffffff", {
      texture: EYE,
      bone: head,
      at: hit.at.clone().addScaledVector(hit.n, 0.004),
      dir: hit.n,
      axis: "z",
      up: [0, 1, 0],
      group: "head",
      name: "eye",
    });
  }

  // ---------------------------------------------------------------- trunk, raised
  const trunk = b.chain("trunk", catmull(TRUNK_POINTS), {
    parent: head,
    count: 8,
    names: ["trunk1", "trunk2", "trunk3", "trunk4", "trunk5", "trunk6", "trunk7", "trunk8"],
    role: "tentacle",
    group: "trunk",
  });
  const trunkTube = b.sweep(trunk, trunkR, {
    color: TRUNK_PAINT,
    section: { ngon: 6 },
    caps: { start: "flat", end: "round" },
    group: "trunk",
    name: "trunk",
  });

  // ---------------------------------------------------------------- tusks
  for (const s of [1, -1])
    b.sweep(catmull(TUSK_POINTS.map(([x, y, z]): [number, number, number] => [s * x, y, z])), tuskR, {
      bone: head,
      color: TUSK_PAINT,
      section: { ngon: 6 },
      caps: { start: "flat", end: "point" },
      detail: 1.7,
      group: "head",
      name: "tusk",
    });

  // ---------------------------------------------------------------- ears: stepped slabs on hinges
  const earParts = [];
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const ear = b.joint(`ear${side}`, {
      parent: head,
      at: [s * 0.6, 3.0, 1.45],
      dir: [s * 0.85, 0, -0.5],
      role: "hinge",
      group: `ear${side}`,
    });
    earParts.push(
      b.extrude(EAR, {
        at: ear,
        x: [s * 0.85, -0.05, -0.5],
        y: [0, 1, 0],
        thickness: 0.08,
        color: COAT_PLAIN,
        bone: ear,
        group: `ear${side}`,
        name: "ear",
      }),
    );
  }

  // ---------------------------------------------------------------- legs: hex columns and octagonal pads
  const legTubes = [];
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    for (const [name, z, parent, joints, hipY, kneeShift] of [
      [
        "front",
        0.9,
        spine.joints[2],
        [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `frontFoot${side}`],
        1.95,
        0.02,
      ],
      ["hind", -1.1, hips, [`hip${side}`, `knee${side}`, `ankle${side}`, `hindFoot${side}`], 1.85, 0.12],
    ] as const) {
      const x = s * 0.62;
      const chain = b.chain(
        `${name}Leg${side}`,
        catmull([
          [x, hipY, z],
          [x, 1.3, z + kneeShift],
          [x, 0.8, z + 0.02],
          [x, 0.4, z + 0.02],
          [x, 0.2, z + 0.06],
        ]),
        { parent, names: [...joints], role: "leg", contact: [x, 0, z + 0.06], group: `${name}Leg${side}` },
      );
      legTubes.push(
        b.sweep(chain, [0.46, 0.42, 0.34, 0.31, 0.35], {
          color: COAT_LEG,
          section: { ngon: 6 },
          caps: { start: "round", end: "flat" },
          group: `${name}Leg${side}`,
          name: "leg",
        }),
      );
      const foot = chain.joints[3];
      b.lathe(
        [
          [0, 0],
          [0.36, 0],
          [0.4, 0.06],
          [0.38, 0.22],
          [0, 0.22],
        ],
        {
          at: [x, 0, z + 0.06],
          bone: foot,
          segments: 8,
          color: HOOF_PAINT,
          group: `${name}Leg${side}`,
          name: "foot",
        },
      );
      for (const a of [-0.5, 0, 0.5])
        b.part(new BoxGeometry(0.14, 0.16, 0.08), NAIL, {
          bone: foot,
          at: [x + Math.sin(a) * 0.4, 0.1, z + 0.06 + Math.cos(a) * 0.4],
          dir: [Math.sin(a), 0, Math.cos(a)],
          axis: "z",
          group: `${name}Leg${side}`,
          name: "toenail",
        });
    }
  }

  // ---------------------------------------------------------------- tail
  const tailChain = b.chain(
    "tail",
    catmull([
      [0, 1.95, -1.65],
      [0, 1.7, -2.0],
      [0, 1.25, -2.1],
      [0, 0.85, -2.05],
    ]),
    { parent: hips, count: 3, names: ["tail1", "tail2", "tail3"], role: "tail", group: "tail" },
  );
  const tailTube = b.sweep(tailChain, (t) => 0.17 * (1 - t) + 0.07, {
    color: COAT_PLAIN,
    section: { ngon: 6 },
    caps: { start: "round", end: "round" },
    group: "tail",
    name: "tail",
  });

  // ---------------------------------------------------------------- the coat: hair cards
  const bodySkin = b.surface(body);
  const earAt = earParts.map((e) => e.local([0.25, 0, 0]));
  const bodyHits = bodySkin.scatter(2600, {
    rng: random,
    minDist: 0.1,
    filter: (h: Hit) => !(h.at.z > 1.3 && h.at.y > 2.1) && !earAt.some((e) => e.distanceTo(h.at) < 0.4),
  });
  const top: Hit[] = [];
  const mane: Hit[] = [];
  const mid: Hit[] = [];
  const skirt: Hit[] = [];
  for (const h of bodyHits) {
    if (h.at.y < 1.8 || h.n.y < -0.3) skirt.push(h);
    else if (h.n.y > 0.7 && h.at.z > 0.15 && h.at.z < 1.3) mane.push(h);
    else if (h.n.y > 0.7) top.push(h);
    else mid.push(h);
  }
  b.cards(top, TUFTS, {
    size: [0.3, 0.4],
    lean: 80,
    flow: [0, -0.3, -1],
    vary: 0.15,
    spin: 20,
    rng: rng(3),
    color: COAT_BODY,
    group: "coat",
    name: "back",
  });
  b.cards(mane, [TUFT_B, SHAG, LONG], {
    size: [0.3, 0.55],
    lean: 66,
    cross: true,
    flow: [0, -0.5, -1],
    vary: 0.2,
    spin: 20,
    rng: rng(4),
    color: COAT_BODY,
    group: "coat",
    name: "mane",
  });
  b.cards(mid, [...TUFTS, SHAG], {
    size: [0.3, 0.45],
    lean: 70,
    cross: true,
    flow: [0, -1, -0.15],
    vary: 0.15,
    spin: 20,
    rng: rng(5),
    color: COAT_BODY,
    group: "coat",
    name: "flank",
  });
  b.cards(skirt, LOCKS, {
    size: [0.3, 0.62],
    lean: 42,
    cross: true,
    flow: [0, -1, 0],
    vary: 0.2,
    spin: 15,
    rng: rng(6),
    color: COAT_BODY,
    group: "coat",
    name: "skirt",
  });

  // Head: a topknot falling forward over the brow, cheek locks, short hair round the eyes, a beard under the chin.
  const nearEye = (h: Hit) =>
    eyeAt.some((e) => e.distanceTo(h.at) < 0.42) || earAt.some((e) => e.distanceTo(h.at) < 0.4);
  const headHits = skullSkin.scatter(520, {
    rng: rng(21),
    minDist: 0.12,
    filter: (h: Hit) => h.at.z < 2.4 && h.n.y > -0.45 && !nearEye(h),
  });
  b.cards(
    headHits.filter((h) => h.n.y > 0.55),
    TUFTS,
    {
      size: [0.3, 0.5],
      lean: 66,
      flow: [0, -0.3, 1],
      vary: 0.2,
      spin: 20,
      rng: rng(22),
      color: COAT_HEAD,
      group: "coat",
      name: "topknot",
    },
  );
  b.cards(
    headHits.filter((h) => h.n.y <= 0.55 && h.at.y >= 2.4),
    [...TUFTS, SHAG],
    {
      size: [0.28, 0.4],
      lean: 60,
      flow: [0, -1, -0.4],
      vary: 0.15,
      spin: 20,
      rng: rng(23),
      color: COAT_HEAD,
      group: "coat",
      name: "cheek",
    },
  );
  b.cards(
    headHits.filter((h) => h.n.y <= 0.55 && h.at.y < 2.4),
    LOCKS,
    {
      size: [0.26, 0.55],
      lean: 35,
      flow: [0, -1, -0.2],
      vary: 0.2,
      spin: 15,
      rng: rng(24),
      color: COAT_HEAD,
      group: "coat",
      name: "jowl",
    },
  );
  const beardHits = b.surface(jawMesh).scatter(60, { rng: rng(25), minDist: 0.12 });
  b.cards(
    beardHits.filter((h) => h.n.y < 0.3),
    LOCKS,
    {
      size: [0.24, 0.55],
      lean: 30,
      flow: [0, -1, 0],
      vary: 0.2,
      spin: 15,
      rng: rng(26),
      color: COAT_PLAIN,
      group: "coat",
      name: "beard",
    },
  );

  // Trunk root: short bristles for the first third.
  const trunkPath = catmull(TRUNK_POINTS);
  b.cards(
    b
      .surface(trunkTube)
      .scatter(80, { rng: rng(31), minDist: 0.13, filter: (h: Hit) => trunkPath.closestT(h.at) < 0.32 })
      .filter((h) => h.n.y > -0.4),
    [SHORT, TUFT_A],
    {
      size: [0.25, 0.3],
      lean: 62,
      flow: [0, -1, -0.5],
      vary: 0.15,
      spin: 20,
      rng: rng(32),
      color: COAT_HEAD,
      group: "coat",
      name: "trunkHair",
    },
  );

  // Feathered legs: long hair down to the pads.
  legTubes.forEach((tube, i) => {
    b.cards(
      b.surface(tube).scatter(190, { rng: rng(40 + i), minDist: 0.12, filter: (h: Hit) => h.at.y > 0.6 }),
      [...LOCKS, TUFT_A],
      {
        size: [0.28, 0.5],
        lean: 50,
        cross: true,
        flow: [0, -1, 0],
        vary: 0.15,
        spin: 15,
        rng: rng(50 + i),
        color: COAT_LEG,
        group: "coat",
        name: "legHair",
      },
    );
  });

  // Ear rims and the tail brush.
  earParts.forEach((ear, i) => {
    b.cards(b.surface(ear).scatter(36, { rng: rng(60 + i), minDist: 0.11 }), [SHORT, TUFT_A], {
      size: [0.2, 0.25],
      lean: 40,
      flow: [0, -1, 0],
      vary: 0.15,
      spin: 20,
      rng: rng(62 + i),
      color: COAT_PLAIN,
      group: "coat",
      name: "earHair",
    });
  });
  b.cards(b.surface(tailTube).scatter(60, { rng: rng(70), minDist: 0.11, filter: (h: Hit) => h.at.y < 1.5 }), LOCKS, {
    size: [0.3, 0.55],
    lean: 25,
    flow: [0, -1, 0],
    vary: 0.2,
    spin: 20,
    rng: rng(71),
    color: COAT_PLAIN,
    group: "coat",
    name: "tailBrush",
  });

  // ---------------------------------------------------------------- snow: stepped two-layer drifts
  const BASE: [number, number][] = [
    [0.4, 0.3],
    [0.3, 0.35],
    [0.5, 0.4],
    [0.35, 0.3],
    [0.45, 0.35],
  ];
  const CROWN: [number, number][] = [
    [0.2, 0.15],
    [0.15, 0.2],
    [0.25, 0.2],
    [0.2, 0.15],
    [0.25, 0.2],
  ];
  const drift = (hits: Hit[], name: string) =>
    hits.forEach((hit, i) => {
      const spin = [0, 30, 60, 90][i % 4];
      const [w, d] = BASE[i % BASE.length];
      b.stick(new BoxGeometry(w, TEXEL * 2, d), SNOW_PAINT, hit, { embed: 0.6, spin, group: "snow", name });
      const [cw, cd] = CROWN[i % CROWN.length];
      b.stick(new BoxGeometry(cw, TEXEL * 2, cd), SNOW_PAINT, hit.moved([0, 0.07, 0]), {
        embed: 0.3,
        spin,
        group: "snow",
        name,
      });
    });
  drift(
    bodySkin.scatter(28, {
      rng: rng(80),
      minDist: 0.42,
      filter: (h: Hit) => h.n.y > 0.85 && h.at.y > 2.85 && h.at.z < 1.25,
    }),
    "backDrift",
  );
  drift(
    skullSkin.scatter(6, { rng: rng(81), minDist: 0.45, filter: (h: Hit) => h.n.y > 0.85 && h.at.y > 3.2 }),
    "domeDrift",
  );

  // Icicles hang under the chin and the front of the belly, longer than the hair skirt.
  const ice = [
    ...bodySkin
      .scatter(60, {
        rng: rng(90),
        minDist: 0.3,
        filter: (h: Hit) => h.n.y < -0.5 && h.at.y > 1.35 && h.at.z > -1.2 && h.at.z < 1.4,
      })
      .slice(0, 8),
    ...beardHits.filter((h) => h.n.y < -0.4).slice(0, 4),
  ];
  ice.forEach((hit, i) =>
    b.spike(hit, [0, -1, 0], 0.5 + 0.3 * hash(i, 3), 0.06, {
      color: ICICLE[i % 2],
      sides: 4,
      group: "ice",
      name: "icicle",
    }),
  );

  return b.root;
}
