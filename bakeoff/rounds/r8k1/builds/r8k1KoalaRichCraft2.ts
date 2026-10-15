import * as THREE from "three";
import { createBuilder, frame, rng, catmull, polyline, noise } from "../../../../src/index";
import { cellPaint, pixelArt, pixelTexture, tileBox, stepped, pick, bayer } from "../../../../kits/pixel";
import type { Cell } from "../../../../kits/pixel";

export const meta = {
  name: "Koala on a eucalyptus stand",
  description:
    "A plump pixel-art koala seated on a eucalyptus branch, hugging the trunk beside it with both arms and gripping the branch with its feet, on a small plank stand with turf, gumnuts, a rock and a plaque.",
};

type V = [number, number, number];
const DEG = Math.PI / 180;
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V, k: number): V => [a[0] * k, a[1] * k, a[2] * k];
const norm = (a: V): V => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

const TEXEL = 0.02;
const FINE = 0.01;

// ---------------------------------------------------------------- palettes
const FUR = ["#2d3039", "#444955", "#5f6573", "#7b8394", "#9ca3b3", "#bcc2cf"];
const CREAM = ["#8f938f", "#b4b8b2", "#d6d9d2", "#eceee6"];
const PAWR = ["#16171c", "#24262e", "#363945"];
const PEEL = ["#b98c74", "#d9b79a", "#efdcc2", "#f8ecd8"];
const TWIGR = ["#4a2a22", "#6a3c2e", "#8a5640"];
const GRASS = ["#2f4a2c", "#3b5a35", "#486a40", "#567a4a", "#668a58"];
const SOIL = ["#2a1a10", "#3c2616", "#533520"];
const STONE = ["#3b3d46", "#575a66", "#767a88", "#9a9eac"];
const CLAW = "#eadfc6";

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

function furTone(c: Cell, bias = 0) {
  const patch = noise(c.at, 0.26, 3);
  const light = noise(c.at, 0.34, 11);
  let v = 0.5 + 0.18 * c.n.y + 0.5 * (patch - 0.5) + 0.3 * (light - 0.5) + bias;
  const r = c.random(7);
  if (r < 0.03) v += 0.15;
  else if (r < 0.055) v -= 0.15;
  return c.pick(FUR, 0.2 + 0.6 * clamp01(v));
}
function creamTone(c: Cell, bias = 0) {
  const n = noise(c.at, 0.16, 4);
  let v = 0.55 + 0.25 * c.n.y + 0.3 * (n - 0.5) + bias;
  if (c.random(5) < 0.04) v += 0.15;
  return c.pick(CREAM, v);
}
function barkTone(c: Cell) {
  const q = new THREE.Vector3(c.at.x * 3, c.at.y * 0.45, c.at.z * 3);
  const m = noise(q, 0.11, 5);
  const t = 0.5 + 0.25 * c.n.y + 0.4 * (noise(c.at, 0.3, 9) - 0.5);
  if (m < 0.4) return c.pick(["#667a6a", "#82967f", "#a2b49d"], t);
  if (m > 0.64) return c.pick(["#9a7660", "#b38f78", "#c9a98f"], t);
  return c.pick(["#b3ab97", "#d0c8b0", "#e5dec8"], t);
}

const COAT = cellPaint(TEXEL, (c) => furTone(c), { dither: true });
const COAT_DARK = cellPaint(TEXEL, (c) => furTone(c, -0.12), { dither: true });
const COAT_HEAD = cellPaint(TEXEL, (c) => furTone(c, 0.04), { dither: true });
const CREAMP = cellPaint(TEXEL, (c) => creamTone(c), { dither: true });
const TORSO = cellPaint(
  TEXEL,
  (c) => {
    const hw = 0.06 + (0.07 * (0.86 - c.at.y)) / 0.36;
    if (c.n.z > 0.4 && c.at.y > 0.5 && c.at.y < 0.86 && Math.abs(c.at.x) < hw) return creamTone(c, 0.05);
    return furTone(c);
  },
  { dither: true },
);
const MUZZLE = cellPaint(TEXEL, (c) => creamTone(c, -0.08), { dither: true });
const EAR_OUT = cellPaint(TEXEL, (c) => furTone(c, -0.1), { dither: true });
const EAR_FRINGE = cellPaint(
  TEXEL,
  (c) => c.pick(["#9ea4aa", "#c3c8cb", "#dfe2e2"], 0.55 + 0.2 * c.n.y + 0.3 * (noise(c.at, 0.12, 2) - 0.5)),
  { dither: true },
);
const EAR_CORE = cellPaint(
  FINE,
  (c) => c.pick(["#6e4a52", "#946a70", "#b88a8e"], 0.4 + 0.4 * c.n.y + 0.4 * (noise(c.at, 0.03, 2) - 0.5)),
  { dither: true },
);
const PAW = cellPaint(
  FINE,
  (c) => c.pick(PAWR, 0.4 + 0.3 * c.n.y + 0.5 * (noise(c.at, 0.05, 2) - 0.5)),
  { dither: true },
);
const NOSEP = cellPaint(0.009, (c) => c.pick(["#0b0a10", "#16151e", "#24232f"], 0.3 + 0.5 * c.n.y), { dither: true });
const BARKP = cellPaint(TEXEL, barkTone, { dither: true });
const FLAPP = cellPaint(
  TEXEL,
  (c) => c.pick(PEEL, 0.5 + 0.4 * (noise(c.at, 0.1, 6) - 0.5) + 0.2 * c.n.y),
  { dither: true },
);
const TWIG = cellPaint(
  TEXEL,
  (c) => c.pick(TWIGR, 0.5 + 0.5 * (noise(c.at, 0.1, 3) - 0.5) + 0.2 * c.n.y),
  { dither: true },
);
const TURF = cellPaint(
  TEXEL,
  (c) => {
    if (c.n.y < 0.5) return c.pick(SOIL, 0.5 + 0.5 * (noise(c.at, 0.12, 4) - 0.5));
    let v = 0.5 + 0.4 * (noise(c.at, 0.16, 9) - 0.5);
    if (c.random(2) < 0.04) v += 0.2;
    return c.pick(GRASS, v);
  },
  { dither: true },
);
const ROCK = cellPaint(
  TEXEL,
  (c) => c.pick(STONE, 0.45 + 0.35 * c.n.y + 0.4 * (noise(c.at, 0.1, 5) - 0.5)),
  { dither: true },
);
const NUT = cellPaint(FINE, (c) => c.pick(["#3a2416", "#5a3a22", "#7e5430"], 0.4 + 0.4 * c.n.y), { dither: true });
const WOODSIDE = cellPaint(
  TEXEL,
  (c) => c.pick(["#3a2314", "#5d3b24", "#704a2c"], 0.4 + 0.3 * c.n.y + 0.4 * (noise(c.at, 0.1, 2) - 0.5)),
  { dither: true },
);

// ---------------------------------------------------------------- textures
const EYE = pixelArt([".kkk.", "kwkkk", "kkkkk", "kkkkk", ".kkk."], { k: "#14121a", w: "#ffffff" });

const RINGS = pixelArt(
  [
    "..bbbbb..",
    ".bcccccb.",
    "bccdddccb",
    "bcdeeedcb",
    "bcdeeedcb",
    "bcdeeedcb",
    "bccdddccb",
    ".bcccccb.",
    "..bbbbb..",
  ],
  { b: "#6b4a32", c: "#d9b98a", d: "#c19a68", e: "#a97d4e" },
);

const LEAF_ROWS = [
  "...e...",
  "..ege..",
  "..gvg..",
  ".egvge.",
  ".egvgg.",
  ".gglvge",
  ".gglvge",
  ".egvgge",
  ".egvge.",
  "..gvge.",
  "..egge.",
  "..egg..",
  "...ee..",
  "...e...",
  "...e...",
];
const LEAF_A = pixelArt(LEAF_ROWS, { e: "#355347", g: "#6f9a86", v: "#b6d2bf", l: "#8fb8a2" });
const LEAF_B = pixelArt(LEAF_ROWS, { e: "#3d5a3c", g: "#7ea36a", v: "#c4dcae", l: "#9bbf84" });

const TUFT = pixelArt([".h..h..", ".g.hg.h", "gg.gg.g", "ggggggg", "ggggggg"], { g: "#4a7040", h: "#6c9a58" });

const WOODC = ["#4a2f1d", "#5d3b24", "#704a2c", "#855c36"];
const WOOD = pixelTexture(48, 48, (g) => {
  const r = rng(11);
  const shade = [0.35, 0.6, 0.45, 0.7, 0.5, 0.3, 0.65, 0.42];
  g.fill((x, y) => {
    const row = Math.floor(y / 6);
    const ly = y % 6;
    if (ly === 5) return "#2a190e";
    if (x === (row % 2 ? 13 : 33) && ly > 0) return "#2a190e";
    if (ly === 0) return "#9a7048";
    const grain = (x * 3 + row * 5) % 13 === 0 ? -0.2 : 0;
    return pick(WOODC, shade[row] + grain + (r() - 0.5) * 0.25, bayer(x, y));
  });
});

const GLYPH: Record<string, string[]> = {
  K: ["x.x", "x.x", "xx.", "x.x", "x.x"],
  O: ["xxx", "x.x", "x.x", "x.x", "xxx"],
  A: [".x.", "x.x", "xxx", "x.x", "x.x"],
  L: ["x..", "x..", "x..", "x..", "xxx"],
};
const PLAQUE = pixelTexture(32, 7, (g) => {
  g.fill((x, y) => ((x + y) % 7 === 0 ? "#d8b85a" : "#c9a54a"));
  g.fill((x, y, w, h) => (x === 0 || y === 0 || x === w - 1 || y === h - 1 ? "#7a5a1c" : undefined));
  "KOALA".split("").forEach((ch, i) => g.stamp(6 + i * 4, 1, GLYPH[ch], { x: "#3a2608" }));
  g.set(2, 3, "#3a2608");
  g.set(29, 3, "#3a2608");
});

// ---------------------------------------------------------------- layout constants
const TX = 0.3; // trunk centre
const TZ = -0.02;
const trunkR = (y: number) => 0.09 - (0.02 * (y - 0.08)) / 0.8;
// point beside the trunk surface at azimuth phi (0 = front, 90 = +X) and height y
const onTrunk = (phiDeg: number, y: number, extra = 0): V => {
  const R = trunkR(y) * 0.95 + 0.009 + extra;
  const p = phiDeg * DEG;
  return [TX + R * Math.sin(p), y, TZ + R * Math.cos(p)];
};
// seat branch centreline: from the trunk toward [-0.16, 0.40, 0.08]
const zb = (x: number) => -0.02 + ((0.3 - x) / 0.46) * 0.1;
const BR = 0.048;
const BY = 0.4;
const CX = 0.04; // stand centre

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "koala" });
  const root = b.joint("root", { at: [0, 0, 0], dir: [0, 1, 0] });

  const box = (size: V, color: any, at: V, bone: any, extra: Record<string, unknown> = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone, at, ...extra });

  // a short oriented box from a to c, ends overlapping so joints stay buried
  const limbBox = (a: V, c: V, th: number, color: any, bone: any) => {
    const d = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    const len = d.length();
    return b.part(new THREE.BoxGeometry(th, len + th * 0.5, th), color, {
      bone,
      at: [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2],
      dir: [d.x, d.y, d.z],
    });
  };

  const discSpans = (R: number) =>
    Array.from({ length: 2 * R }, (_, i) => {
      const y = i + 0.5 - R;
      const hw = Math.max(1, Math.round(Math.sqrt(R * R - y * y)));
      return [-hw, hw] as [number, number];
    });
  const disc = (R: number, cell: number, center: V, xdir: V, th: V, thick: number, color: any, bone: any, off: number) =>
    b.extrude(stepped(discSpans(R), cell, { rows: true }), {
      at: add(add(center, mul(th, off)), [0, -R * cell, 0]),
      x: xdir,
      y: [0, 1, 0],
      thickness: thick,
      color,
      bone,
    });

  // ------------------------------------------------------------------ STAND
  b.part(tileBox([0.78, 0.05, 0.64], WOOD, 0.02, { rand: rng(3), step: [1, 6] }), "#ffffff", {
    texture: WOOD,
    bone: root,
    at: [CX, 0.025, 0],
  });
  box([0.74, 0.04, 0.6], TURF, [CX, 0.07, 0], root);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box([0.045, 0.045, 0.045], WOODSIDE, [CX + sx * 0.365, 0.0725, sz * 0.285], root);
  b.part(new THREE.PlaneGeometry(0.18, 0.0394), "#ffffff", {
    bone: root,
    at: [CX, 0.025, 0.3215],
    dir: [0, 0, 1],
    axis: "z",
    texture: PLAQUE,
  });

  // ground accents
  for (const p of [[-0.1, 0.105, 0.25], [0.14, 0.105, 0.26]] as V[]) {
    b.part(new THREE.SphereGeometry(0.02, 6, 4), NUT, { bone: root, at: p });
    b.part(new THREE.CylinderGeometry(0.015, 0.015, 0.008, 6), "#2b1a10", { bone: root, at: add(p, [0, 0.016, 0]) });
  }
  b.part(new THREE.BoxGeometry(0.1, 0.055, 0.08), ROCK, { bone: root, at: [-0.27, 0.113, 0.19], rotation: [0, 25, 0] });
  b.part(new THREE.BoxGeometry(0.055, 0.032, 0.045), ROCK, { bone: root, at: [-0.2, 0.102, 0.24], rotation: [0, -20, 0] });
  const tuftSpots: V[] = [[-0.3, 0.092, -0.18], [0.3, 0.092, 0.22], [0.02, 0.092, -0.24]];
  b.cards(
    tuftSpots.map((p) => frame(p, [0, 1, 0])),
    TUFT,
    { size: [0.1, 0.09], lean: 0, flow: [0, 0, 1], cross: true, vary: 0.25, rng: rng(21), bone: root },
  );

  // ------------------------------------------------------------------ TREE
  b.part(new THREE.CylinderGeometry(0.07, 0.09, 0.8, 8), BARKP, { bone: root, at: [TX, 0.48, TZ] });
  b.part(new THREE.CylinderGeometry(0.088, 0.098, 0.06, 8), BARKP, { bone: root, at: [TX, 0.105, TZ] });
  b.part(new THREE.PlaneGeometry(0.14, 0.14), "#ffffff", {
    bone: root,
    at: [TX, 0.8815, TZ],
    dir: [0, 1, 0],
    axis: "z",
    texture: RINGS,
  });

  // seat branch from the trunk toward [-0.16, 0.40, 0.08]
  {
    const a: V = [TX, BY, TZ];
    const e: V = [-0.16, BY, 0.08];
    const d: V = [e[0] - a[0], 0, e[2] - a[2]];
    const len = Math.hypot(d[0], d[2]);
    const dn = norm(d);
    b.part(new THREE.CylinderGeometry(BR, BR + 0.004, len, 8), BARKP, {
      bone: root,
      at: [(a[0] + e[0]) / 2, BY, (a[2] + e[2]) / 2],
      dir: d,
    });
    b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", {
      bone: root,
      at: add(e, mul(dn, 0.0015)),
      dir: dn,
      axis: "z",
      texture: RINGS,
    });
  }
  // a broken stub on the back of the trunk
  {
    const base: V = [TX + 0.03, 0.6, TZ - 0.06];
    const dn = norm([0.6, 0.35, -1]);
    b.part(new THREE.CylinderGeometry(0.02, 0.028, 0.16, 6), BARKP, { bone: root, at: add(base, mul(dn, 0.07)), dir: dn });
    b.part(new THREE.CircleGeometry(0.02, 6), "#d9b98a", { bone: root, at: add(base, mul(dn, 0.1515)), dir: dn, axis: "z" });
  }
  // peeling bark flaps
  const flaps: [number, number, number][] = [
    [0.28, 0.5, 3],
    [0.5, -2.3, 3],
    [0.62, 2.2, 2],
    [0.36, -1.0, 2],
    [0.82, 3.0, 2],
  ];
  for (const [y, phi, n] of flaps) {
    const R = trunkR(y) + 0.004;
    const xd: V = [Math.cos(phi), 0, -Math.sin(phi)];
    const pos: V = [TX + R * Math.sin(phi), y, TZ + R * Math.cos(phi)];
    const yd = norm([Math.sin(phi) * 0.3, 1, Math.cos(phi) * 0.3]);
    const spans = ([[0, 3], [0, 3], [1, 3], [1, 2], [1, 2]] as [number, number][]).slice(0, n + 2);
    b.extrude(stepped(spans, 0.014, { rows: true }), {
      at: add(pos, mul(xd, -0.02)),
      x: xd,
      y: yd,
      thickness: 0.008,
      color: FLAPP,
      bone: root,
    });
  }

  // eucalyptus sprays: each leaf is its own double-sided card with its own yaw
  const twig = (pts: V[], ts: number[], seed: number, lean: number) => {
    const path = catmull(pts);
    b.sweep(path, [0.024, 0.008], { bone: root, color: TWIG, section: { ngon: 5 }, caps: "round" });
    const r = rng(seed);
    ts.forEach((t, i) => {
      const a = (r() - 0.5) * 1.6 + (i % 2 ? 0.25 : -0.25);
      b.cards([frame(path.at(t), [0, 1, 0])], i % 2 ? LEAF_A : LEAF_B, {
        size: [0.06, 0.18],
        lean,
        flow: [Math.sin(a), 0, Math.cos(a)] as V,
        vary: 0.15,
        rng: rng(seed * 10 + i),
        bone: root,
      });
    });
  };
  twig(
    [[TX, 0.85, TZ], [0.4, 0.94, -0.04], [0.55, 0.99, -0.07], [0.7, 0.95, -0.06]],
    [0.4, 0.5, 0.62, 0.74, 0.87, 1],
    31,
    160,
  );
  twig(
    [[0.31, 0.87, -0.03], [0.42, 0.98, -0.08], [0.52, 1.1, -0.1], [0.5, 1.22, -0.12]],
    [0.55, 0.72, 0.88, 1],
    32,
    150,
  );

  // ------------------------------------------------------------------ KOALA SKELETON
  const spine = b.chain(
    "spine",
    polyline([[0, 0.5, -0.03], [0, 0.62, -0.03], [0, 0.74, -0.03], [0, 0.84, -0.02]]),
    { parent: root, names: ["hips", "spine1", "spine2", "chest"], role: "spine" },
  );
  const [hips, spine1, spine2, chest] = spine.joints;
  const neck = b.joint("neck", { parent: chest, at: [0, 0.84, -0.02], dir: [0, 1, 0.1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.92, -0.005], dir: [0, 1, 0.15], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.9, 0.05], dir: [0, 0, 1], role: "jaw" });

  // torso: one stepped barrel of overlapping layers, 0.02 corner setbacks
  box([0.4, 0.15, 0.26], TORSO, [0, 0.525, -0.03], hips);
  box([0.36, 0.15, 0.3], TORSO, [0, 0.525, -0.03], hips);
  box([0.36, 0.16, 0.26], TORSO, [0, 0.66, -0.03], spine1);
  box([0.32, 0.16, 0.3], TORSO, [0, 0.66, -0.03], spine1);
  box([0.29, 0.14, 0.25], TORSO, [0, 0.79, -0.03], spine2);
  box([0.25, 0.14, 0.28], TORSO, [0, 0.79, -0.03], spine2);

  // head: wide stepped volume 0.40 x 0.25 x 0.28 at [0, 1.0, 0.03]
  box([0.4, 0.17, 0.28], COAT_HEAD, [0, 1.0, 0.03], head);
  box([0.36, 0.02, 0.26], COAT_HEAD, [0, 1.095, 0.03], head);
  box([0.32, 0.02, 0.24], COAT_HEAD, [0, 1.115, 0.03], head);
  box([0.36, 0.02, 0.26], COAT_HEAD, [0, 0.905, 0.03], head);
  box([0.32, 0.02, 0.24], COAT_HEAD, [0, 0.885, 0.03], head);
  // muzzle
  box([0.14, 0.065, 0.055], MUZZLE, [0, 0.945, 0.1925], head);
  // tall stepped nose
  b.extrude(
    stepped([[-1.5, 1.5], [-2, 2], [-2.5, 2.5], [-2.5, 2.5], [-2.5, 2.5], [-2.5, 2.5], [-2, 2]], 0.018, { rows: true }),
    { at: [0, 0.93, 0.215], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.05, color: NOSEP, bone: head },
  );
  box([0.06, 0.09, 0.04], COAT_DARK, [0, 1.0, 0.19], head);
  box([0.02, 0.012, 0.006], "#6d6d86", [-0.018, 1.033, 0.243], head);
  box([0.01, 0.01, 0.006], "#6d6d86", [-0.03, 1.018, 0.243], head);
  // one short shallow mouth
  box([0.07, 0.008, 0.01], "#1a1014", [0, 0.918, 0.2225], head);
  // lower jaw
  box([0.12, 0.04, 0.1], CREAMP, [0, 0.885, 0.16], jaw);

  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.044, 0.044), "#ffffff", {
      bone: head,
      at: [s * 0.1, 1.03, 0.1735],
      dir: [0, 0, 1],
      axis: "z",
      texture: EYE,
    });
    // small stepped cheek patch
    b.extrude(stepped([[-1, 1], [-2, 2], [-2, 2], [-1, 1]], 0.016, { rows: true }), {
      at: [s * 0.13, 0.9, 0.178],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.02,
      color: CREAMP,
      bone: head,
    });
  }

  // ears
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${L}`, { parent: head, at: [s * 0.21, 1.1, 0.0], dir: [s * 0.4, 1, 0.2], role: "hinge" });
    const a = 0.25;
    const xd: V = [Math.cos(a), 0, -s * Math.sin(a)];
    const th: V = [s * Math.sin(a), 0, Math.cos(a)];
    const C: V = [s * 0.235, 1.13, 0.03];
    disc(7, 0.018, C, xd, th, 0.03, EAR_OUT, ear, 0);
    disc(5, 0.018, C, xd, th, 0.03, EAR_FRINGE, ear, 0.02);
    disc(3, 0.0135, C, xd, th, 0.03, EAR_CORE, ear, 0.04);
  }

  // arms embracing the trunk
  const arms = [
    {
      s: 1,
      L: "L",
      pts: [[0.15, 0.77, -0.03], [0.25, 0.68, 0.12], [0.36, 0.71, 0.11], onTrunk(50, 0.72, 0.02)] as V[],
      y0: 0.72,
      padPhi: 50,
      phis: [50, 75, 105, 130],
    },
    {
      s: -1,
      L: "R",
      pts: [[-0.15, 0.77, -0.03], [-0.05, 0.7, 0.15], [0.15, 0.76, 0.12], onTrunk(-55, 0.78, 0.02)] as V[],
      y0: 0.78,
      padPhi: -55,
      phis: [-55, -35, -10, 10],
    },
  ];
  for (const A of arms) {
    const { L, pts, y0, padPhi, phis } = A;
    const arm = b.chain(`arm${L}`, polyline(pts), {
      parent: spine2,
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `hand${L}`],
      role: "arm",
    });
    const [sh, el, wr, hand] = arm.joints;
    box([0.11, 0.11, 0.11], COAT, pts[0], sh);
    limbBox(pts[0], pts[1], 0.1, COAT, sh);
    box([0.1, 0.1, 0.1], COAT, pts[1], el);
    limbBox(pts[1], pts[2], 0.09, COAT_DARK, el);
    limbBox(pts[2], pts[3], 0.075, COAT_DARK, wr);
    // palm on the bark
    const padR = trunkR(y0) * 0.95 + 0.009 + 0.02;
    const pp = padPhi * DEG;
    b.part(new THREE.BoxGeometry(0.07, 0.1, 0.05), PAW, {
      bone: hand,
      at: [TX + padR * Math.sin(pp), y0, TZ + padR * Math.cos(pp)],
      rotation: [0, padPhi, 0],
    });
    // fingers laid along the bark
    [-1, 0, 1].forEach((k, i) => {
      const y = y0 + k * 0.03;
      const fp = phis.map((p) => onTrunk(p, y)) as V[];
      const f = b.chain(`finger${i}${L}`, polyline(fp), { parent: hand, role: "digit" });
      b.sweep(f, 0.011, { section: "box", color: PAW, caps: "flat" });
      const last = fp[3];
      const t = norm([last[0] - fp[2][0], 0, last[2] - fp[2][2]]);
      const inw = norm([TX - last[0], 0, TZ - last[2]]);
      b.spike(last, norm(add(mul(t, 0.6), mul(inw, 0.4))), 0.03, 0.01, {
        color: CLAW,
        bone: f.joints[f.joints.length - 1],
        section: { ngon: 4 },
      });
    });
  }

  // legs: tucked knees, feet gripping the seat branch
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const xf = s > 0 ? 0.11 : -0.09;
    const pts: V[] = [
      [s * 0.14, 0.53, -0.04],
      [s * 0.21, 0.52, zb(s * 0.21) + 0.075],
      [xf, 0.485, zb(xf) + 0.025],
      [xf, 0.458, zb(xf)],
    ];
    const leg = b.chain(`leg${L}`, polyline(pts), {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`, `foot${L}`],
      role: "leg",
    });
    const [hp, kn, an, foot] = leg.joints;
    box([0.1, 0.12, 0.14], COAT, add(pts[0], [s * 0.02, 0, 0.03]), hp);
    limbBox(pts[0], pts[1], 0.11, COAT, hp);
    box([0.1, 0.1, 0.1], COAT, pts[1], kn);
    limbBox(pts[1], pts[2], 0.08, COAT_DARK, kn);
    limbBox(pts[2], pts[3], 0.07, PAW, an);
    box([0.1, 0.03, 0.08], PAW, [xf, 0.46, zb(xf) - 0.01], foot);
    box([0.05, 0.05, 0.1], CREAMP, [s * 0.215, 0.545, zb(s * 0.21) - 0.02], hp);
    for (let i = 0; i < 3; i++) {
      const xt = xf + (i - 1) * 0.03;
      const Rt = BR + 0.01;
      const tp = [15, 45, 75, 98].map((th) => {
        const a = th * DEG;
        return [xt, BY + Rt * Math.cos(a), zb(xt) + Rt * Math.sin(a)] as V;
      });
      const t = b.chain(`toe${i}${L}`, polyline(tp), { parent: foot, role: "digit" });
      b.sweep(t, 0.011, { section: "box", color: PAW, caps: "flat" });
      const tang = norm([0, tp[3][1] - tp[2][1], tp[3][2] - tp[2][2]]);
      const a98 = 98 * DEG;
      const inward: V = [0, -Math.cos(a98), -Math.sin(a98)];
      b.spike(tp[3], norm(add(mul(tang, 0.6), mul(inward, 0.4))), 0.03, 0.01, {
        color: CLAW,
        bone: t.joints[t.joints.length - 1],
        section: { ngon: 4 },
      });
    }
  }

  return b.root;
}
