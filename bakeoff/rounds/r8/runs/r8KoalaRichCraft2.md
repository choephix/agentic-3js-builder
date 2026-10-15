```ts
import * as THREE from "three";
import { createBuilder, frame, rng, catmull, polyline, noise } from "agentic-3js-builder";
import { cellPaint, pixelArt, pixelTexture, tileBox, stepped, pick, bayer } from "agentic-3js-builder/kits/pixel";
import type { Cell } from "agentic-3js-builder/kits/pixel";

export const meta = {
  name: "Koala on a eucalyptus stand",
  description:
    "A chunky pixel-art koala sitting on a seat branch, hugging a eucalyptus trunk with its arms and gripping the branch with its feet, on a plank display stand with turf, gumnuts and a plaque.",
};

type V = [number, number, number];
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
const CREAM = ["#9d988b", "#c2bcab", "#e0dac8", "#f4f0e2"];
const PAWR = ["#16171c", "#24262e", "#363945"];
const BARK = ["#6e6354", "#8f8472", "#b3a994", "#cfc7b0", "#e3dcc6"];
const PEEL = ["#b98c74", "#d9b79a", "#efdcc2", "#f8ecd8"];
const TWIGR = ["#4a2a22", "#6a3c2e", "#8a5640"];
const GRASS = ["#1f3a1c", "#2f5a2a", "#3f7a36", "#5a9a46", "#86bb62"];
const SOIL = ["#2a1a10", "#3c2616", "#533520"];
const STONE = ["#3b3d46", "#575a66", "#767a88", "#9a9eac"];
const CLAW = "#eadfc6";

function furTone(c: Cell, bias = 0) {
  const n = noise(c.at, 0.14, 3);
  let v = 0.5 + 0.2 * c.n.y + 0.45 * (n - 0.5) + bias;
  const r = c.random(7);
  if (r < 0.06) v += 0.22;
  else if (r < 0.11) v -= 0.18;
  return c.pick(FUR, v);
}
function creamTone(c: Cell, bias = 0) {
  const n = noise(c.at, 0.1, 4);
  let v = 0.55 + 0.25 * c.n.y + 0.3 * (n - 0.5) + bias;
  if (c.random(5) < 0.08) v += 0.2;
  else if (c.random(6) < 0.06) v -= 0.2;
  return c.pick(CREAM, v);
}
function barkTone(c: Cell) {
  const q = new THREE.Vector3(c.at.x * 4, c.at.y * 0.7, c.at.z * 4);
  const n = noise(q, 0.12, 5);
  const m = noise(c.at, 0.25, 8);
  let v = 0.55 + 0.6 * (n - 0.5);
  if (m > 0.62) return c.pick(["#a9684f", "#c98a68", "#dca47e"], 0.3 + v * 0.6);
  if (m < 0.33) return c.pick(["#586a58", "#7b8d78", "#9fb09a"], v);
  if (c.random(4) < 0.06) v -= 0.3;
  return c.pick(BARK, v);
}

const COAT = cellPaint(TEXEL, (c) => furTone(c), { dither: true });
const COAT_DARK = cellPaint(TEXEL, (c) => furTone(c, -0.12), { dither: true });
const CREAMP = cellPaint(TEXEL, (c) => creamTone(c), { dither: true });
const TORSO = cellPaint(
  TEXEL,
  (c) => {
    const hw = 0.12 - Math.max(0, c.at.y - 0.62) * 0.25 + (c.v & 1 ? 0.02 : 0);
    if (c.n.z > 0.5 && c.at.y > 0.5 && c.at.y < 0.87 && Math.abs(c.at.x) < hw) return creamTone(c, 0.05);
    return furTone(c);
  },
  { dither: true },
);
const CHEEK = cellPaint(TEXEL, (c) => (c.n.y > 0.5 ? furTone(c, 0.05) : creamTone(c, 0.08)), { dither: true });
const MUZZLE = cellPaint(FINE, (c) => creamTone(c, -0.12), { dither: true });
const CROWN = cellPaint(TEXEL, (c) => furTone(c, 0.12), { dither: true });
const EAR_OUT = cellPaint(TEXEL, (c) => furTone(c, -0.1), { dither: true });
const EAR_FRINGE = cellPaint(TEXEL, (c) => creamTone(c, 0.1), { dither: true });
const EAR_CORE = cellPaint(FINE, (c) => c.pick(["#6e4a52", "#946a70", "#b88a8e"], 0.4 + 0.4 * c.n.y + 0.4 * (noise(c.at, 0.03, 2) - 0.5)), { dither: true });
const PAW = cellPaint(FINE, (c) => c.pick(PAWR, 0.4 + 0.3 * c.n.y + 0.5 * (noise(c.at, 0.05, 2) - 0.5)), { dither: true });
const NOSEP = cellPaint(0.009, (c) => c.pick(["#0b0a10", "#16151e", "#24232f"], 0.3 + 0.5 * c.n.y), { dither: true });
const BARKP = cellPaint(TEXEL, barkTone, { dither: true });
const FLAPP = cellPaint(FINE, (c) => c.pick(PEEL, 0.5 + 0.4 * (noise(c.at, 0.05, 6) - 0.5) + 0.2 * c.n.y), { dither: true });
const TWIG = cellPaint(FINE, (c) => c.pick(TWIGR, 0.5 + 0.5 * (noise(c.at, 0.06, 3) - 0.5) + 0.2 * c.n.y), { dither: true });
const TURF = cellPaint(
  TEXEL,
  (c) => {
    if (c.n.y < 0.5) return c.pick(SOIL, 0.5 + 0.5 * (noise(c.at, 0.08, 4) - 0.5));
    let v = 0.5 + 0.5 * (noise(c.at, 0.12, 9) - 0.5);
    if (c.random(2) < 0.08) v += 0.3;
    if (c.random(3) < 0.05) v -= 0.3;
    return c.pick(GRASS, v);
  },
  { dither: true },
);
const ROCK = cellPaint(FINE * 1.5, (c) => c.pick(STONE, 0.45 + 0.35 * c.n.y + 0.5 * (noise(c.at, 0.05, 5) - 0.5)), { dither: true });
const NUT = cellPaint(FINE, (c) => c.pick(["#3a2416", "#5a3a22", "#7e5430"], 0.4 + 0.4 * c.n.y), { dither: true });
const WOODSIDE = cellPaint(TEXEL, (c) => c.pick(["#3a2314", "#5d3b24", "#704a2c"], 0.4 + 0.3 * c.n.y + 0.4 * (noise(c.at, 0.1, 2) - 0.5)), { dither: true });

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

const TUFT = pixelArt(
  [".h..h..", ".g.hg.h", "gg.gg.g", "ggggggg", "ggggggg"],
  { g: "#3f7a36", h: "#6aa84e" },
);

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

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "koala" });

  const root = b.joint("root", { at: [0, 0, 0], dir: [0, 1, 0] });

  // helpers --------------------------------------------------------------
  const box = (size: V, color: any, at: V, bone: any, extra: Record<string, unknown> = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone, at, ...extra });

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
  b.part(tileBox([0.94, 0.03, 0.9], WOOD, 0.02, { rand: rng(3), step: [1, 6] }), "#ffffff", {
    texture: WOOD, bone: root, at: [0, 0.015, 0],
  });
  b.part(tileBox([0.86, 0.05, 0.82], WOOD, 0.02, { rand: rng(4), step: [1, 6] }), "#ffffff", {
    texture: WOOD, bone: root, at: [0, 0.055, 0],
  });
  box([0.8, 0.03, 0.76], TURF, [0, 0.08, 0], root);
  // plinth corner blocks
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box([0.07, 0.07, 0.07], WOODSIDE, [sx * 0.43, 0.065, sz * 0.41], root);
  b.part(new THREE.PlaneGeometry(0.24, 0.0525), "#ffffff", {
    bone: root, at: [0, 0.055, 0.412], dir: [0, 0, 1], axis: "z", texture: PLAQUE,
  });

  // turf details
  const nutPos: V[] = [[-0.27, 0.11, 0.26], [-0.31, 0.108, 0.2], [0.3, 0.108, 0.27]];
  for (const p of nutPos) {
    b.part(new THREE.SphereGeometry(0.02, 6, 4), NUT, { bone: root, at: p });
    b.part(new THREE.CylinderGeometry(0.015, 0.015, 0.008, 6), "#2b1a10", { bone: root, at: add(p, [0, 0.016, 0]) });
  }
  b.part(new THREE.BoxGeometry(0.11, 0.06, 0.09), ROCK, { bone: root, at: [0.31, 0.12, 0.1], rotation: [0, 25, 0] });
  b.part(new THREE.BoxGeometry(0.06, 0.035, 0.05), ROCK, { bone: root, at: [0.37, 0.108, 0.04], rotation: [0, -20, 0] });
  const tuftSpots: V[] = [[0.36, 0.098, -0.3], [-0.36, 0.098, -0.28], [0.1, 0.098, -0.35], [-0.34, 0.098, 0.3], [0.2, 0.098, 0.33], [-0.12, 0.098, -0.34]];
  b.cards(tuftSpots.map((p) => frame(p, [0, 1, 0])), TUFT, {
    size: [0.1, 0.09], lean: 0, flow: [0, 0, 1], cross: true, vary: 0.25, rng: rng(21), bone: root,
  });
  const fallen: V[] = [[-0.2, 0.099, 0.3], [0.15, 0.099, 0.3], [-0.38, 0.099, -0.05]];
  b.cards(fallen.map((p) => frame(p, [0, 1, 0])), [LEAF_A, LEAF_B], {
    size: [0.055, 0.14], lean: 90, flow: (_f, i) => [Math.cos(i * 2.3 + 1), 0, Math.sin(i * 2.3 + 1)],
    mirror: true, rng: rng(22), bone: root,
  });

  // ------------------------------------------------------------------ TREE
  const trunkR = (y: number) => 0.1 - 0.0289 * (y - 0.09);
  b.part(new THREE.CylinderGeometry(0.072, 0.1, 0.97, 8), BARKP, { bone: root, at: [0, 0.575, -0.22] });
  b.part(new THREE.PlaneGeometry(0.15, 0.15), "#ffffff", {
    bone: root, at: [0, 1.0615, -0.22], dir: [0, 1, 0], axis: "z", texture: RINGS,
  });
  // root flare
  b.part(new THREE.CylinderGeometry(0.1, 0.135, 0.07, 8), BARKP, { bone: root, at: [0, 0.125, -0.22] });

  // seat branch (runs forward from the trunk) with a ringed cut end
  b.part(new THREE.CylinderGeometry(0.048, 0.052, 0.56, 8), BARKP, { bone: root, at: [0, 0.4, 0.02], dir: [0, 0, 1] });
  b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", {
    bone: root, at: [0, 0.4, 0.3025], dir: [0, 0, 1], axis: "z", texture: RINGS,
  });
  // stubs
  const stubs: [V, V][] = [
    [[0.09, 0.33, -0.22], [1, 0.35, -0.1]],
    [[-0.085, 0.64, -0.25], [-1, 0.3, -0.3]],
  ];
  for (const [base, d] of stubs) {
    const dn = norm(d);
    b.part(new THREE.CylinderGeometry(0.022, 0.03, 0.16, 6), BARKP, { bone: root, at: add(base, mul(dn, 0.07)), dir: dn });
    b.part(new THREE.CircleGeometry(0.022, 6), "#d9b98a", { bone: root, at: add(base, mul(dn, 0.1515)), dir: dn, axis: "z" });
  }
  // peeling bark flaps
  const flaps: [number, number, number][] = [
    [0.3, 0.4, 3], [0.2, -0.7, 4], [0.55, -2.3, 3], [0.95, 2.6, 3], [0.7, 2.0, 2], [0.88, -1.2, 2], [0.5, 1.4, 3],
  ];
  for (const [y, phi, n] of flaps) {
    const R = trunkR(y) + 0.004;
    const xd: V = [Math.cos(phi), 0, -Math.sin(phi)];
    const pos: V = [R * Math.sin(phi), y, -0.22 + R * Math.cos(phi)];
    const yd = norm([Math.sin(phi) * 0.3, 1, Math.cos(phi) * 0.3]);
    const spans = ([[0, 3], [0, 3], [1, 3], [1, 2], [1, 2], [1, 2]] as [number, number][]).slice(0, n + 2);
    b.extrude(stepped(spans, 0.014, { rows: true }), {
      at: add(pos, mul(xd, -0.02)), x: xd, y: yd, thickness: 0.008, color: FLAPP, bone: root,
    });
  }

  // leafy twigs
  const twig = (pts: V[], ts: number[], seed: number) => {
    const path = catmull(pts);
    b.sweep(path, [0.02, 0.008], { bone: root, color: TWIG, section: { ngon: 5 }, caps: "round" });
    const frames = ts.map((t) => frame(path.at(t), [0, 1, 0]));
    b.cards(frames, [LEAF_A, LEAF_B, LEAF_A], {
      size: [0.085, 0.2], lean: 150, flow: (_f, i) => [0.3 * Math.sin(i * 2.1 + seed), 0, 1],
      vary: 0.25, spin: 25, rng: rng(seed), bone: root, cross: true,
    });
  };
  twig([[0.03, 0.97, -0.22], [0.2, 1.1, -0.27], [0.4, 1.12, -0.22], [0.55, 1.03, -0.16]], [0.3, 0.45, 0.6, 0.75, 0.9, 1], 31);
  twig([[-0.02, 0.88, -0.22], [-0.2, 0.98, -0.3], [-0.4, 1.08, -0.25], [-0.54, 1.05, -0.16]], [0.3, 0.45, 0.6, 0.75, 0.9, 1], 32);
  twig([[0, 1.04, -0.22], [0, 1.1, -0.27], [-0.05, 1.14, -0.3]], [0.5, 0.8, 1], 33);

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

  // torso
  box([0.34, 0.16, 0.3], TORSO, [0, 0.53, -0.03], hips);
  box([0.36, 0.14, 0.29], TORSO, [0, 0.66, -0.025], spine1);
  box([0.3, 0.14, 0.26], TORSO, [0, 0.79, -0.03], spine2);
  for (const s of [1, -1]) {
    box([0.07, 0.11, 0.12], COAT, [s * 0.15, 0.78, -0.03], spine2);
    box([0.06, 0.08, 0.2], COAT_DARK, [s * 0.18, 0.54, -0.03], hips);
  }

  // head
  box([0.34, 0.2, 0.26], COAT, [0, 1.02, 0.03], head);
  box([0.4, 0.14, 0.28], CHEEK, [0, 0.93, 0.04], head);
  box([0.15, 0.1, 0.1], MUZZLE, [0, 0.95, 0.2], head);
  // crown tuft
  b.extrude(stepped([[-3, 3], [-3, 3], [-2, 2], [-1, 1]], TEXEL, { rows: true }), {
    at: [0, 1.11, 0.03], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.2, color: CROWN, bone: head,
  });
  // nose
  b.extrude(stepped([[-2, 2], [-3, 3], [-3, 3], [-3, 3], [-2, 2]], 0.018, { rows: true }), {
    at: [0, 0.955, 0.245], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.05, color: NOSEP, bone: head,
  });
  box([0.034, 0.014, 0.008], "#6d6d86", [-0.02, 1.027, 0.2735], head);
  box([0.016, 0.012, 0.008], "#6d6d86", [-0.045, 1.012, 0.2735], head);
  // mouth lines
  box([0.1, 0.008, 0.01], "#1a1014", [0, 0.912, 0.252], head);
  box([0.008, 0.04, 0.01], "#1a1014", [0, 0.935, 0.252], head);
  // lower jaw
  box([0.13, 0.045, 0.12], CREAMP, [0, 0.875, 0.17], jaw);
  box([0.1, 0.008, 0.01], "#1a1014", [0, 0.8985, 0.231], jaw);
  // eyes + brows
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.052, 0.052), "#ffffff", {
      bone: head, at: [s * 0.095, 1.045, 0.1635], dir: [0, 0, 1], axis: "z", texture: EYE,
    });
    box([0.06, 0.012, 0.01], "#23252d", [s * 0.098, 1.082, 0.164], head, { rotation: [0, 0, s * 8] });
    // cheek tuft
    b.extrude(stepped([[0, 2], [0, 3], [0, 2], [0, 3], [0, 2], [0, 3]], TEXEL, { rows: true }), {
      at: [s * 0.185, 0.86, 0.04], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.22, color: CREAMP, bone: head,
    });
  }

  // ears
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${L}`, { parent: head, at: [s * 0.16, 1.08, -0.03], dir: [s * 0.4, 1, 0.2], role: "hinge" });
    const a = 0.45;
    const xd: V = [Math.cos(a), 0, -s * Math.sin(a)];
    const th: V = [s * Math.sin(a), 0, Math.cos(a)];
    const C: V = [s * 0.18, 1.105, -0.03];
    disc(7, 0.018, C, xd, th, 0.03, EAR_OUT, ear, 0);
    disc(5, 0.018, C, xd, th, 0.03, EAR_FRINGE, ear, 0.02);
    disc(3, 0.018, C, xd, th, 0.03, EAR_CORE, ear, 0.04);
  }

  // arms and hands wrapped around the trunk
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${L}`,
      polyline([
        [s * 0.17, 0.77, -0.03],
        [s * 0.27, 0.73, -0.07],
        [s * 0.15, 0.775, -0.2],
        [s * 0.115, 0.775, -0.235],
      ]),
      { parent: spine2, names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `hand${L}`], role: "arm" },
    );
    b.sweep(arm, [0.052, 0.04], { section: "box", color: COAT, caps: "flat" });
    const hand = arm.joints[3];
    box([0.065, 0.1, 0.075], PAW, [s * 0.13, 0.775, -0.218], hand);
    for (let i = 0; i < 3; i++) {
      const y = 0.775 + (i - 1) * 0.034 + (s < 0 ? 0.017 : 0);
      const pts: V[] = [
        [s * 0.1, y, -0.24],
        [s * 0.052, y, -0.294],
        [s * 0.02, y, -0.308],
      ];
      const f = b.chain(`finger${i}${L}`, polyline(pts), { parent: hand, role: "digit" });
      b.sweep(f, 0.011, { section: "box", color: PAW, caps: "flat" });
      b.spike(pts[2], norm([pts[2][0] - pts[1][0], 0, pts[2][2] - pts[1][2]]), 0.035, 0.01, {
        color: CLAW, bone: f.joints[f.joints.length - 1], section: { ngon: 4 },
      });
    }
  }

  // legs and feet gripping the seat branch
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${L}`,
      polyline([
        [s * 0.12, 0.5, -0.04],
        [s * 0.2, 0.5, 0.12],
        [s * 0.1, 0.43, 0.17],
        [s * 0.07, 0.4, 0.22],
      ]),
      { parent: hips, names: [`hip${L}`, `knee${L}`, `ankle${L}`, `foot${L}`], role: "leg" },
    );
    b.sweep(leg, [0.072, 0.052], { section: "box", color: COAT, caps: "flat" });
    const foot = leg.joints[3];
    box([0.055, 0.06, 0.13], PAW, [s * 0.08, 0.405, 0.2], foot);
    // thigh fluff
    box([0.05, 0.05, 0.1], CREAMP, [s * 0.215, 0.545, 0.07], leg.joints[0]);
    for (let i = 0; i < 3; i++) {
      const z = 0.16 + i * 0.045 - s * 0.011;
      const pts: V[] = [
        [s * 0.052, 0.41, z],
        [s * 0.054, 0.452, z],
        [s * 0.016, 0.462, z],
      ];
      const t = b.chain(`toe${i}${L}`, polyline(pts), { parent: foot, role: "digit" });
      b.sweep(t, 0.011, { section: "box", color: PAW, caps: "flat" });
      b.spike(pts[2], [-s, 0, 0], 0.028, 0.009, {
        color: CLAW, bone: t.joints[t.joints.length - 1], section: { ngon: 4 },
      });
    }
  }

  return b.root;
}
```