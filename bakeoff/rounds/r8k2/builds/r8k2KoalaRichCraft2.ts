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
const FUR = ["#585660", "#716f76", "#8a8789", "#a19d9b", "#b8b3ae", "#cdc7bf"];
const CREAM = ["#9a9a94", "#bcbcb4", "#dadad0", "#efefe4"];
const PAWR = ["#16171c", "#24262e", "#363945"];
const PEEL = ["#b98c74", "#d9b79a", "#efdcc2", "#f8ecd8"];
const TWIGR = ["#4a2a22", "#6a3c2e", "#8a5640"];
const GRASS = ["#3c4e36", "#46583f", "#506247", "#5b6c50", "#667859"];
const SOIL = ["#2a1a10", "#3c2616", "#533520"];
const STONE = ["#3b3d46", "#575a66", "#767a88", "#9a9eac"];
const CLAW = "#eadfc6";

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const snap = (v: THREE.Vector3, s: number) =>
  new THREE.Vector3(Math.round(v.x / s) * s, Math.round(v.y / s) * s, Math.round(v.z / s) * s);

// fur: connected 0.04 m tonal clusters, no isolated speckles
function furTone(c: Cell, bias = 0) {
  const q = snap(c.at, 0.04);
  const v = 0.56 + 0.14 * c.n.y + 0.3 * (noise(q, 0.16, 3) - 0.5) + bias;
  return c.pick(FUR, clamp01(v));
}
function creamTone(c: Cell, bias = 0) {
  const q = snap(c.at, 0.04);
  const v = 0.6 + 0.25 * c.n.y + 0.2 * (noise(q, 0.1, 4) - 0.5) + bias;
  return c.pick(CREAM, clamp01(v));
}
function barkTone(c: Cell) {
  const q = new THREE.Vector3(c.at.x * 3, c.at.y * 0.45, c.at.z * 3);
  const m = noise(q, 0.11, 5);
  const t = 0.5 + 0.25 * c.n.y + 0.4 * (noise(c.at, 0.3, 9) - 0.5);
  if (m < 0.4) return c.pick(["#667a6a", "#82967f", "#a2b49d"], t);
  if (m > 0.64) return c.pick(["#9a7660", "#b38f78", "#c9a98f"], t);
  return c.pick(["#b3ab97", "#d0c8b0", "#e5dec8"], t);
}

const COAT = cellPaint(TEXEL, (c) => furTone(c));
const COAT_HEAD = cellPaint(TEXEL, (c) => furTone(c, 0.04));
const CREAMP = cellPaint(TEXEL, (c) => creamTone(c));
const TORSO = cellPaint(TEXEL, (c) => {
  const hw = 0.06 + (0.07 * (0.86 - c.at.y)) / 0.36;
  if (c.n.z > 0.4 && c.at.y > 0.5 && c.at.y < 0.86 && Math.abs(c.at.x) < hw) return creamTone(c, 0.05);
  return furTone(c);
});
const MUZZLE = cellPaint(TEXEL, (c) => creamTone(c, -0.05));
const EAR_OUT = cellPaint(TEXEL, (c) => furTone(c, -0.12));
const EAR_FRINGE = cellPaint(TEXEL, (c) =>
  c.pick(["#a4a39f", "#c6c4bf", "#e0ded8"], 0.55 + 0.2 * c.n.y + 0.2 * (noise(snap(c.at, 0.04), 0.12, 2) - 0.5)),
);
const EAR_CORE = cellPaint(FINE, (c) => c.pick(["#7a5258", "#9a6f74", "#b88e92"], 0.5 + 0.3 * c.n.y));
const PAW = cellPaint(FINE, (c) => c.pick(PAWR, 0.4 + 0.3 * c.n.y + 0.5 * (noise(c.at, 0.05, 2) - 0.5)), {
  dither: true,
});
const NOSEP = cellPaint(0.009, (c) => c.pick(["#0b0a10", "#16151e", "#24232f"], 0.3 + 0.5 * c.n.y), { dither: true });
const BARKP = cellPaint(TEXEL, barkTone, { dither: true });
const FLAPP = cellPaint(TEXEL, (c) => c.pick(PEEL, 0.5 + 0.4 * (noise(c.at, 0.1, 6) - 0.5) + 0.2 * c.n.y), {
  dither: true,
});
const TWIG = cellPaint(TEXEL, (c) => c.pick(TWIGR, 0.5 + 0.5 * (noise(c.at, 0.1, 3) - 0.5) + 0.2 * c.n.y), {
  dither: true,
});
const TURF = cellPaint(
  TEXEL,
  (c) => {
    if (c.n.y < 0.5) return c.pick(SOIL, 0.5 + 0.4 * (noise(c.at, 0.12, 4) - 0.5));
    let v = 0.5 + 0.32 * (noise(c.at, 0.16, 9) - 0.5);
    if (c.random(2) < 0.03) v += 0.15;
    return c.pick(GRASS, v);
  },
  { dither: true },
);
const ROCK = cellPaint(TEXEL, (c) => c.pick(STONE, 0.45 + 0.35 * c.n.y + 0.4 * (noise(c.at, 0.1, 5) - 0.5)), {
  dither: true,
});
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
const CX = 0.04; // stand centre
const BY = 0.4; // seat branch height
const BR = 0.048; // seat branch vertex radius
const HZ = 0.11; // head centre z
const KZ = 0.05; // torso centre z

const trunkR = (y: number) => 0.09 - (0.02 * (y - 0.08)) / 0.8;
// radius of a regular octagon (vertex radius R, vertices at multiples of 45 deg) at azimuth phi
const octR = (R: number, phiDeg: number) => {
  const d = ((phiDeg % 45) + 45) % 45 - 22.5;
  return (R * Math.cos(22.5 * DEG)) / Math.cos(d * DEG);
};
const trunkSurf = (phiDeg: number, y: number) => octR(trunkR(y), phiDeg);
// point on / beside the real octagonal trunk surface (phi 0 = front, 90 = +X)
const onTrunk = (phiDeg: number, y: number, extra = 0): V => {
  const R = trunkSurf(phiDeg, y) + extra;
  const p = phiDeg * DEG;
  return [TX + R * Math.sin(p), y, TZ + R * Math.cos(p)];
};

// seat branch: octagonal sweep from the trunk toward the front-left, under the rump
const BA: V = [TX, BY, TZ];
const BE: V = [-0.18, BY, 0.22];
const BD: V = norm([BE[0] - BA[0], 0, BE[2] - BA[2]]);
const BLEN = Math.hypot(BE[0] - BA[0], BE[2] - BA[2]);
const BSIDE: V = [BD[2], 0, -BD[0]];
const axisPt = (u: number): V => [BA[0] + BD[0] * u, BY, BA[2] + BD[2] * u];
// point around the octagonal branch at angle th (0 = top vertex, 90 = front side)
const branchPt = (u: number, th: number, extra: number): V => {
  const R = octR(BR, th) + extra;
  const a = th * DEG;
  const c = axisPt(u);
  return [c[0] + BSIDE[0] * Math.sin(a) * R, c[1] + Math.cos(a) * R, c[2] + BSIDE[2] * Math.sin(a) * R];
};

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "koala" });
  const root = b.joint("root", { at: [0, 0, 0], dir: [0, 1, 0] });

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

  // seat branch (8-sided, vertex up, so toes can be placed on its real surface)
  b.sweep(polyline([BA, BE]), BR, {
    bone: root,
    color: BARKP,
    section: { ngon: 8 },
    caps: "flat",
    up: [0, 1, 0],
  });
  b.part(new THREE.PlaneGeometry(0.09, 0.09), "#ffffff", {
    bone: root,
    at: add(BE, mul(BD, 0.0015)),
    dir: BD,
    axis: "z",
    texture: RINGS,
  });

  // a broken stub on the back of the trunk
  {
    const base: V = [TX + 0.03, 0.6, TZ - 0.06];
    const dn = norm([0.6, 0.35, -1]);
    b.part(new THREE.CylinderGeometry(0.02, 0.028, 0.16, 6), BARKP, { bone: root, at: add(base, mul(dn, 0.07)), dir: dn });
    b.part(new THREE.CircleGeometry(0.02, 6), "#d9b98a", { bone: root, at: add(base, mul(dn, 0.1515)), dir: dn, axis: "z" });
  }
  // peeling bark flaps, each on a face centre of the octagonal trunk
  const flaps: [number, number, number][] = [
    [0.28, 22.5, 3],
    [0.5, -112.5, 3],
    [0.62, 157.5, 2],
    [0.36, 67.5, 2],
    [0.82, -157.5, 2],
  ];
  for (const [y, phiD, n] of flaps) {
    const phi = phiD * DEG;
    const pos = onTrunk(phiD, y, 0.004);
    const xd: V = [Math.cos(phi), 0, -Math.sin(phi)];
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

  // eucalyptus sprays: leaf stems sit on the twig, faces mostly toward the viewer
  const ANG = [-30, 24, -18, 34, -35, 14, -26, 60];
  const twig = (pts: V[], ts: number[], seed: number, lean: number) => {
    const path = catmull(pts);
    b.sweep(path, [0.014, 0.005], { bone: root, color: TWIG, section: { ngon: 5 }, caps: "round" });
    ts.forEach((t, i) => {
      const q = path.at(t);
      const side = i % 2 ? 0.005 : -0.005;
      const a = ANG[(i + seed) % ANG.length] * DEG;
      b.cards([frame([q.x, q.y, q.z + side], [0, 1, 0])], i % 2 ? LEAF_A : LEAF_B, {
        size: [0.052, 0.18],
        lean,
        flow: [Math.sin(a), 0, Math.cos(a)],
        vary: 0.1,
        rng: rng(seed * 10 + i),
        bone: root,
      });
    });
  };
  twig(
    [[TX, 0.85, TZ], [0.4, 0.94, -0.04], [0.55, 0.99, -0.07], [0.7, 0.95, -0.06]],
    [0.35, 0.46, 0.58, 0.7, 0.82, 0.95],
    3,
    165,
  );
  twig(
    [[0.31, 0.87, -0.03], [0.42, 0.98, -0.08], [0.52, 1.1, -0.1], [0.5, 1.22, -0.12]],
    [0.5, 0.68, 0.85, 1],
    5,
    160,
  );

  // ------------------------------------------------------------------ KOALA SKELETON
  const spine = b.chain(
    "spine",
    polyline([[0, 0.5, KZ], [0, 0.62, KZ], [0, 0.74, KZ], [0, 0.84, KZ + 0.01]]),
    { parent: root, names: ["hips", "spine1", "spine2", "chest"], role: "spine" },
  );
  const hips = spine.joints[0];
  const spine1 = spine.joints[1];
  const spine2 = spine.joints[2];
  const neck = b.joint("neck", { parent: spine.joints[3], at: [0, 0.84, 0.07], dir: [0, 1, 0.1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.92, 0.1], dir: [0, 1, 0.15], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.9, 0.17], dir: [0, 0, 1], role: "jaw" });

  // pear-shaped seated torso: 0.34 at the seat, 0.40 mid, 0.31 at the shoulders
  const layers: [number, number, number][] = [
    [0.485, 0.34, 0.26],
    [0.545, 0.4, 0.3],
    [0.605, 0.4, 0.3],
    [0.665, 0.38, 0.3],
    [0.725, 0.36, 0.28],
    [0.785, 0.34, 0.27],
    [0.84, 0.31, 0.26],
  ];
  for (const [y, w, d] of layers) {
    const bone = y < 0.57 ? hips : y < 0.71 ? spine1 : spine2;
    box([w, 0.07, d], TORSO, [0, y, KZ], bone);
  }
  // neck connector buried in chest and head
  box([0.2, 0.07, 0.19], COAT, [0, 0.87, 0.08], neck);

  // head: one stepped extrude 0.40 x 0.27 x 0.27, plus a narrower rear slab (rear corners 0.02 further in)
  const rowsFront: [number, number][] = [
    [-6, 6], [-8, 8], [-9, 9], [-10, 10], [-10, 10], [-10, 10],
    [-10, 10], [-10, 10], [-10, 10], [-9, 9], [-8, 8], [-6, 6],
  ];
  const rowsBack = rowsFront.map(([a, c]) => [a + 1, c - 1] as [number, number]);
  const HCELL: [number, number] = [0.02, 0.0225];
  b.extrude(stepped(rowsFront, HCELL, { rows: true }), {
    at: [0, 0.865, HZ + 0.02],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.23,
    color: COAT_HEAD,
    bone: head,
  });
  b.extrude(stepped(rowsBack, HCELL, { rows: true }), {
    at: [0, 0.865, HZ - 0.11],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.05,
    color: COAT_HEAD,
    bone: head,
  });
  const FRONT = HZ + 0.135; // head front face z = 0.245

  // shallow pale muzzle + chin as one block
  box([0.14, 0.07, 0.04], MUZZLE, [0, 0.935, FRONT], head);
  box([0.14, 0.05, 0.08], CREAMP, [0, 0.885, FRONT - 0.023], jaw);
  box([0.07, 0.008, 0.004], "#1a1014", [0, 0.912, FRONT + 0.0205], head);
  // tall black nose, projecting ~0.033 m
  b.extrude(
    stepped([[-1.5, 1.5], [-2, 2], [-2.5, 2.5], [-2.5, 2.5], [-2.5, 2.5], [-2.5, 2.5], [-2, 2]], 0.018, { rows: true }),
    { at: [0, 0.93, FRONT + 0.013], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.04, color: NOSEP, bone: head },
  );
  box([0.02, 0.012, 0.006], "#6d6d86", [-0.018, 1.03, FRONT + 0.036], head);
  box([0.01, 0.01, 0.006], "#6d6d86", [-0.03, 1.016, FRONT + 0.036], head);

  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.05, 0.05), "#ffffff", {
      bone: head,
      at: [s * 0.1, 1.03, FRONT + 0.0035],
      dir: [0, 0, 1],
      axis: "z",
      texture: EYE,
    });
    // small, shallow cheek patch
    b.extrude(stepped([[-1, 1], [-2, 2], [-2, 2], [-1, 1]], 0.012, { rows: true }), {
      at: [s * 0.13, 0.89, FRONT + 0.003],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.01,
      color: CREAMP,
      bone: head,
    });
  }

  // ears: flat fluffy interiors
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${L}`, { parent: head, at: [s * 0.21, 1.1, HZ - 0.03], dir: [s * 0.4, 1, 0.2], role: "hinge" });
    const a = 0.25;
    const xd: V = [Math.cos(a), 0, -s * Math.sin(a)];
    const th: V = [s * Math.sin(a), 0, Math.cos(a)];
    const C: V = [s * 0.235, 1.13, HZ - 0.01];
    disc(7, 0.018, C, xd, th, 0.03, EAR_OUT, ear, 0);
    disc(5, 0.018, C, xd, th, 0.01, EAR_FRINGE, ear, 0.015);
    disc(3, 0.0135, C, xd, th, 0.01, EAR_CORE, ear, 0.0165);
  }

  // ------------------------------------------------------------------ ARMS
  const armDefs = [
    {
      s: 1,
      L: "L",
      y0: 0.72,
      pad: 22.5,
      pts: [[0.15, 0.74, 0.05], [0.28, 0.65, 0.24], [0.4, 0.71, 0.15]] as V[],
    },
    {
      s: -1,
      L: "R",
      y0: 0.78,
      pad: -67.5,
      pts: [[-0.15, 0.77, 0.05], [0.0, 0.7, 0.25], [0.12, 0.79, 0.21]] as V[],
    },
  ];
  for (const A of armDefs) {
    const { L, y0, pad } = A;
    const handPt = onTrunk(pad, y0, 0.016);
    const pts: V[] = [...A.pts, handPt];
    const arm = b.chain(`arm${L}`, polyline(pts), {
      parent: spine2,
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `hand${L}`],
      role: "arm",
    });
    const sh = arm.joints[0];
    const hand = arm.joints[3];
    // one continuous bent arm: upper arm ~0.096 thick, forearm tapering to ~0.065
    b.sweep(arm, [0.048, 0.048, 0.04, 0.032], { section: "box", color: COAT, caps: "flat" });
    box([0.1, 0.1, 0.1], COAT, add(pts[0], [A.s * 0.005, 0, 0]), sh);
    // palm block on the trunk face
    b.part(new THREE.BoxGeometry(0.06, 0.11, 0.04), PAW, {
      bone: hand,
      at: [handPt[0], y0 - 0.01, handPt[2]],
      rotation: [0, pad, 0],
    });

    const digit = (name: string, y: number, dir: number, segs: number, half: number) => {
      const dp: V[] = [];
      for (let k = 0; k <= segs; k++) dp.push(onTrunk(pad + dir * 22.5 * k, y, half - 0.0015));
      const f = b.chain(name, polyline(dp), { parent: hand, role: "digit" });
      b.sweep(f, half, { section: "box", color: PAW, caps: "flat" });
      const last = dp[segs];
      const prev = dp[segs - 1];
      const t = norm([last[0] - prev[0], 0, last[2] - prev[2]]);
      const inw = norm([TX - last[0], 0, TZ - last[2]]);
      b.spike(last, norm(add(mul(t, 0.6), mul(inw, 0.5))), 0.017, 0.007, {
        color: CLAW,
        bone: f.joints[f.joints.length - 1],
        section: { ngon: 4 },
      });
    };
    // three longer fingers wrapping one way, staggered ends
    const fOff = [0.035, 0.01, -0.015];
    const fSeg = [4, 3, 3];
    fOff.forEach((o, i) => digit(`finger${i}${L}`, y0 + o, 1, fSeg[i], 0.007));
    // two short opposing thumbs wrapping the other way
    const tOff = [-0.04, -0.06];
    tOff.forEach((o, i) => digit(`thumb${i}${L}`, y0 + o, -1, 2, 0.0075));
  }

  // ------------------------------------------------------------------ LEGS
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const u = s > 0 ? 0.21 : 0.44;
    const ap = axisPt(u);
    const pts: V[] = [
      [s * 0.14, 0.53, 0.04],
      [s * 0.18, 0.52, s > 0 ? 0.14 : 0.2],
      [ap[0], 0.485, ap[2]],
      [ap[0], 0.462, ap[2]],
    ];
    const leg = b.chain(`leg${L}`, polyline(pts), {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`, `foot${L}`],
      role: "leg",
    });
    const hp = leg.joints[0];
    const kn = leg.joints[1];
    const foot = leg.joints[3];
    b.sweep(leg, [0.055, 0.05, 0.04, 0.034], { section: "box", color: COAT, caps: "flat" });
    // stepped haunch overlapping the rump, and a stepped knee
    disc(4, 0.02, [s * 0.165, 0.53, 0.07], [0, 0, 1], [1, 0, 0], 0.09, COAT, hp, 0);
    disc(3, 0.02, [s * 0.18, 0.515, pts[1][2]], [0, 0, 1], [1, 0, 0], 0.08, COAT, kn, 0);
    box([0.1, 0.03, 0.08], PAW, [ap[0], 0.462, ap[2]], foot, { rotation: [0, 26.57, 0] });

    // toes on the real octagonal branch surface
    for (let i = 0; i < 3; i++) {
      const uu = u + (i - 1) * 0.03;
      const tp = [0, 22.5, 45, 67.5, 90].map((th) => branchPt(uu, th, 0.0055));
      const t = b.chain(`toe${i}${L}`, polyline(tp), { parent: foot, role: "digit" });
      b.sweep(t, 0.007, { section: "box", color: PAW, caps: "flat" });
      const last = tp[4];
      const prev = tp[3];
      const tang = norm([last[0] - prev[0], last[1] - prev[1], last[2] - prev[2]]);
      b.spike(last, norm(add(mul(tang, 0.6), mul(BSIDE, -0.5))), 0.017, 0.007, {
        color: CLAW,
        bone: t.joints[t.joints.length - 1],
        section: { ngon: 4 },
      });
    }
  }

  return b.root;
}
