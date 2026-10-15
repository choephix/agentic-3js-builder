import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { noise } from "../../../../src/paint";
import { catmull, polyline } from "../../../../src/path";
import { bayer, cellPaint, pixelArt, pixelTexture, stepped, tileBox } from "../../../../kits/pixel";

export const meta = {
  name: "Koala on a eucalyptus branch stand",
  description:
    "A chunky pixel-art koala sitting in the fork of a eucalyptus branch mounted on a log-slice base, gripping both limbs with two-thumbed paws, leafy twigs and gumnuts around it.",
  style: "pixel art",
  commit: "88fc1f0",
};

const TEXEL = 0.02;
const FINE = 0.01;

// ---------------------------------------------------------------------------------------------------------------
// Palette ramps (dark -> light)

const FUR = ["#35313a", "#4a4650", "#615d67", "#7a757e", "#948f96", "#b0aaaf"];
const CREAM = ["#8b8377", "#a9a191", "#c6bfac", "#ddd6c2", "#efe9d8"];
const DARKF = ["#1d1a21", "#2a262f", "#38343e", "#4a4551"];
const BARK = ["#675f4d", "#857b65", "#a39a80", "#c0b79b", "#d6cdb0", "#e5ddc3"];
const SALMON = ["#8f634a", "#af7c58", "#cd9a68", "#e0b484"];
const MOSS = ["#2f4a28", "#3f6232", "#547f3c", "#72a04a"];
const RINGS = ["#5f4129", "#7d5736", "#9b7347", "#b78d5c", "#cca673"];
const LOGBARK = ["#2f2218", "#43301f", "#573f29", "#6c5034"];
const STONE = ["#5d5b60", "#76747a", "#8f8d92", "#aaa8ad"];

// ---------------------------------------------------------------------------------------------------------------
// Pixel textures

const NOSE = pixelArt(
  ["kkkkkkkk", "kgggkkkk", "kgwgkkkk", "kkkkkkkk", "kkkkkkkk", "kkdkkdkk", "kdddkddk", "kkkkkkkk"],
  { k: "#17141a", g: "#3a3640", w: "#7d7886", d: "#07060a" },
);

function tuftTex(): ReturnType<typeof pixelArt> {
  return pixelArt(["..a..", "..a..", ".aba.", ".bbb.", "abbbc", "bbbcc"], { a: "#ffffff", b: "#d8d8d8", c: "#a8a8a8" });
}
const TUFT = tuftTex();

const FRINGE = pixelArt(["..w..", ".www.", ".www.", "wwwww", "wwwww"], { w: "#ffffff" });

function leafTex(mid: string, light: string, dark: string, rib: string) {
  return pixelTexture(7, 18, (g) => {
    for (let y = 0; y < 18; y++) {
      const t = y / 17; // 0 tip, 1 base
      const half = Math.min(3.1, 3.4 * Math.sin(Math.PI * (0.07 + 0.86 * t)) + 0.2) * (t > 0.92 ? 0.35 : 1);
      const cx = 3.3 + 1.9 * (1 - t) * (1 - t);
      for (let x = 0; x < 7; x++) {
        const d = x + 0.5 - cx;
        if (Math.abs(d) > half) continue;
        if (Math.abs(d) < 0.55) g.set(x, y, rib);
        else if (Math.abs(d) > half - 0.9 && t > 0.1) g.set(x, y, dark);
        else g.set(x, y, d < 0 ? mid : light);
      }
    }
  });
}
const LEAVES = [
  leafTex("#3b7a66", "#58a285", "#245547", "#a3dcb8"),
  leafTex("#4b8a62", "#6cb07c", "#2f6044", "#b6e6b4"),
  leafTex("#3a6f72", "#5a9a98", "#244e56", "#9ad4cc"),
];

const MOSSY = pixelArt([".mm.m.", "mmlmmm", "mlmmlm", ".mmmm.", "..m..."], { m: "#4d7a38", l: "#74a64c" });

const PAW = pixelArt(
  [
    "..................",
    ".ppp..ppp..ppp....",
    ".ppp..ppp..ppp....",
    "..................",
    "....pppppppp......",
    "...pppppppppp.....",
    "...pppppppppp.....",
    "....pppppppp......",
  ],
  { p: "#d9b25f" },
);

function letters(text: string) {
  const glyph: Record<string, string[]> = {
    K: ["x.x", "x.x", "xx.", "x.x", "x.x"],
    O: ["xxx", "x.x", "x.x", "x.x", "xxx"],
    A: [".x.", "x.x", "xxx", "x.x", "x.x"],
    L: ["x..", "x..", "x..", "x..", "xxx"],
  };
  const w = text.length * 4 + 3;
  return pixelTexture(w, 11, (g) => {
    g.fill((x, y, gw, gh) => (x === 0 || y === 0 || x === gw - 1 || y === gh - 1 ? "#b89442" : "#4a3220"));
    g.fill((x, y) => (bayer(x, y) < 0.18 ? "#3d2918" : ""), [1, 1, w - 2, 9]);
    [...text].forEach((ch, i) => {
      const rows = glyph[ch];
      rows.forEach((row, ry) =>
        [...row].forEach((c, rx) => {
          if (c === "x") g.set(2 + i * 4 + rx, 3 + ry, "#f1d47a");
        }),
      );
    });
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Cell paints

const V = THREE.Vector3;
const HC = { x: 0, y: 1.0, z: 0.05 }; // head centre

const furPaint = cellPaint(
  TEXEL,
  (c) => {
    const { x, y } = c.at;
    const nz = noise(c.at, 0.09, 3);
    const r = c.random(1);
    const bib = c.n.z > 0.2 && y > 0.5 && y < 0.9 && Math.abs(x) < 0.115 + 0.06 * (nz - 0.5);
    if (bib) return c.pick(CREAM, 0.5 + 0.9 * (nz - 0.5) + (r - 0.5) * 0.4);
    if (c.n.z < -0.15 && y < 0.7 && r < 0.2) return c.pick(CREAM, 0.35 + r);
    return c.pick(FUR, 0.5 + 0.3 * c.n.y + 0.55 * (nz - 0.5) + (r - 0.5) * 0.32);
  },
  { dither: true },
);

const limbFur = cellPaint(
  TEXEL,
  (c) => {
    const nz = noise(c.at, 0.08, 5);
    const r = c.random(2);
    return c.pick(FUR, 0.42 + 0.22 * c.n.y + 0.55 * (nz - 0.5) + (r - 0.5) * 0.3 - (c.at.z > 0.1 ? 0.05 : 0));
  },
  { dither: true },
);

const headFur = cellPaint(
  TEXEL,
  (c) => {
    const { x, y, z } = c.at;
    const nz = noise(c.at, 0.07, 9);
    const r = c.random(3);
    const low = y < HC.y - 0.035;
    if (low && c.n.z > -0.1) return c.pick(CREAM, 0.55 + 0.7 * (nz - 0.5) + (r - 0.5) * 0.35);
    if (Math.abs(x) > 0.1 && y < HC.y + 0.01 && z > HC.z - 0.02) return c.pick(CREAM, 0.38 + 0.6 * (nz - 0.5) + (r - 0.5) * 0.3);
    return c.pick(FUR, 0.5 + 0.28 * c.n.y + 0.5 * (nz - 0.5) + (r - 0.5) * 0.3);
  },
  { dither: true },
);

const muzzlePaint = cellPaint(
  FINE * 2,
  (c) => c.pick(CREAM, 0.62 + 0.5 * (noise(c.at, 0.05, 4) - 0.5) + (c.random(4) - 0.5) * 0.3),
  { dither: true },
);

const earPaint = cellPaint(
  TEXEL,
  (c) => c.pick(DARKF, 0.45 + 0.7 * (noise(c.at, 0.06, 6) - 0.5) + (c.random(6) - 0.5) * 0.4),
  { dither: true },
);
const earInner = cellPaint(
  FINE * 2,
  (c) => c.pick(CREAM, 0.7 + 0.5 * (noise(c.at, 0.05, 8) - 0.5) + (c.random(7) - 0.5) * 0.3),
  { dither: true },
);

const pawPaint = cellPaint(
  FINE * 2,
  (c) => c.pick(DARKF, 0.3 + 0.35 * c.n.y + (c.random(8) - 0.5) * 0.4 + 0.3 * (noise(c.at, 0.05, 2) - 0.5)),
  { dither: true },
);

const barkPaint = cellPaint(
  TEXEL,
  (c) => {
    const streak = noise(new V(c.at.x * 3, c.at.y * 0.55, c.at.z * 3), 0.1, 11);
    const blot = noise(c.at, 0.22, 7);
    const r = c.random(9);
    if (blot > 0.62 && streak > 0.45) return c.pick(SALMON, 0.3 + 1.0 * (blot - 0.6) + (r - 0.5) * 0.3);
    if (blot < 0.34) return c.pick(MOSS, 0.1 + 0.9 * streak);
    if (r < 0.035) return "#3a332a";
    return c.pick(BARK, 0.15 + 0.85 * streak + 0.25 * c.n.y + (r - 0.5) * 0.28);
  },
  { dither: true },
);

const logTop = cellPaint(
  FINE * 2,
  (c) => {
    const d = Math.hypot(c.at.x - 0.03, c.at.z + 0.02) + 0.012 * (noise(c.at, 0.12, 5) - 0.5);
    if (c.n.y < 0.6) {
      const v = noise(new V(c.at.x * 4, c.at.y * 0.4, c.at.z * 4), 0.1, 3);
      return c.pick(LOGBARK, v + (c.random(1) - 0.5) * 0.4);
    }
    const ring = Math.floor(d / 0.03);
    const crack = Math.abs(Math.atan2(c.at.z + 0.02, c.at.x - 0.03) - 0.9) < 0.025 && d > 0.05;
    if (crack) return RINGS[0];
    if (d > 0.5) return LOGBARK[2];
    return c.pick(RINGS, (ring % 3) / 3 + 0.18 + 0.2 * (c.random(5) - 0.5) + (ring % 7 === 0 ? 0.25 : 0));
  },
  { dither: true },
);

const stonePaint = cellPaint(FINE * 2, (c) => c.pick(STONE, 0.5 + 0.4 * (noise(c.at, 0.04, 2) - 0.5) + 0.3 * c.n.y + (c.random(3) - 0.5) * 0.3), { dither: true });
const mossPaint = cellPaint(FINE * 2, (c) => c.pick(MOSS, 0.55 + 0.9 * (noise(c.at, 0.05, 6) - 0.5) + 0.2 * c.n.y + (c.random(4) - 0.5) * 0.4), { dither: true });

const GUM = "#7a5a3a";
const GUMCAP = "#b08a5a";
const CLAW = "#efe3c6";
const LIP = "#3c2f34";

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "koalaSonnet", paintSize: 2048 });
  const R = rng(7);

  // ------------------------------------------------------------------------------------------ skeleton
  const stand = b.joint("stand", { at: [0, 0, 0] });

  const spinePts = [
    [0, 0.56, -0.07],
    [0, 0.67, -0.075],
    [0, 0.78, -0.055],
    [0, 0.9, -0.02],
  ];
  const spine = b.chain("spine", catmull(spinePts), {
    parent: stand,
    names: ["hips", "spine1", "spine2"],
    role: "spine",
  });
  const hips = spine.joints[0];
  const chestJ = spine.joints[2];
  const neck = b.chain("neck", polyline([[0, 0.9, -0.02], [0, 0.95, 0.02]]), {
    parent: chestJ,
    names: ["neck"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 0.95, 0.02], dir: [0, 0.25, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, HC.y - 0.06, HC.z + 0.05],
    aim: [0, HC.y - 0.07, HC.z + 0.2],
    role: "jaw",
  });

  // ------------------------------------------------------------------------------------------ the stand
  // U-shaped eucalyptus fork, seat at the bottom
  const U = catmull([
    [-0.52, 1.32, 0.0],
    [-0.4, 0.98, 0.0],
    [-0.315, 0.64, 0.0],
    [-0.17, 0.43, 0.0],
    [0, 0.385, 0.0],
    [0.17, 0.43, 0.0],
    [0.315, 0.64, 0.0],
    [0.4, 0.98, 0.0],
    [0.52, 1.32, 0.0],
  ]);
  const limbAt = (s: number, y: number) => {
    const t = U.closestT([s * 0.34, y, 0]);
    return U.at(t);
  };

  const fork = b.sweep(U, [0.03, 0.04, 0.056, 0.064, 0.056, 0.04, 0.03], {
    bone: stand,
    color: barkPaint,
    sides: 8,
    smooth: false,
    caps: "flat",
    name: "fork",
  });

  // log slice base
  b.part(new THREE.CylinderGeometry(0.52, 0.55, 0.1, 12), logTop, { bone: stand, at: [0, 0.047, 0], flat: true, name: "baseLog" });
  b.part(new THREE.CylinderGeometry(0.575, 0.58, 0.012, 12), "#2a1e15", { bone: stand, at: [0, 0.002, 0], flat: true, name: "baseShadow" });
  // trunk
  const trunk = b.sweep(
    catmull([
      [0.01, 0.08, 0.0],
      [0.0, 0.22, 0.0],
      [0.0, 0.34, 0.0],
      [0, 0.4, 0],
    ]),
    [0.105, 0.088, 0.075],
    { bone: stand, color: barkPaint, sides: 8, smooth: false, caps: "flat", name: "trunk" },
  );
  // buttress roots
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const ex = Math.sin(a) * 0.3;
    const ez = Math.cos(a) * 0.3;
    b.sweep(
      catmull([
        [Math.sin(a) * 0.05, 0.2, Math.cos(a) * 0.05],
        [Math.sin(a) * 0.12, 0.13, Math.cos(a) * 0.12],
        [ex, 0.095, ez],
      ]),
      [0.04, 0.028, 0.012],
      { bone: stand, color: barkPaint, sides: 6, smooth: false, caps: "round", name: `root${i}` },
    );
  }
  // bark knots and scribbles
  const forkSurf = b.surface(fork);
  const scribble = new THREE.BoxGeometry(0.014, 0.012, 0.05);
  for (const hit of forkSurf.scatter(34, { rng: rng(21), minDist: 0.12, filter: (h) => h.n.z > -0.6 && h.at.y > 0.5 })) {
    b.stick(scribble, "#4a3f33", hit, { embed: 0.7, spin: R() * 180 });
  }
  const knotGeo = new THREE.CylinderGeometry(0.02, 0.026, 0.02, 6);
  for (const hit of forkSurf.scatter(7, { rng: rng(33), minDist: 0.25, filter: (h) => h.n.z > 0.5 && h.at.y > 0.55 })) {
    b.stick(knotGeo, "#4b3b2c", hit, { embed: 0.5 });
    b.stick(new THREE.CylinderGeometry(0.01, 0.013, 0.02, 6), "#241a14", hit, { embed: 0.2 });
  }
  const trunkSurf = b.surface(trunk);
  for (const hit of trunkSurf.scatter(8, { rng: rng(5), minDist: 0.1, filter: (h) => h.n.z > 0.2 })) {
    b.stick(scribble, "#4a3f33", hit, { embed: 0.7, spin: R() * 180 });
  }

  // ------------------------------------------------------------------------------------------ body
  const bodyR = (t: number): [number, number] => {
    const k = [0.168, 0.188, 0.19, 0.172, 0.14, 0.11];
    const f = t * (k.length - 1);
    const i = Math.min(Math.floor(f), k.length - 2);
    const r = k[i] + (k[i + 1] - k[i]) * (f - i);
    return [r, r * 0.94];
  };
  const body = b.sweep(spine, bodyR, {
    color: furPaint,
    sides: 10,
    smooth: false,
    shift: [0, -0.018],
    name: "body",
  });

  // shoulder / rump masses
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), furPaint, {
      bone: chestJ,
      at: [s * 0.14, 0.82, 0.02],
      scale: [0.075, 0.08, 0.08],
      flat: true,
      name: s > 0 ? "shoulderMassL" : "shoulderMassR",
    });
  }
  // fur tufts over body
  const bodySurf = b.surface(body);
  const tufts = bodySurf.scatter(210, { rng: rng(41), minDist: 0.045, filter: (h) => h.at.y > 0.42 });
  b.cards(tufts, TUFT, {
    size: [0.045, 0.055],
    lean: 62,
    flow: [0, -1, -0.15],
    vary: 0.3,
    rng: rng(42),
    color: furPaint,
    spin: 25,
  });

  // ------------------------------------------------------------------------------------------ head
  const skull = b.part(new THREE.SphereGeometry(1, 10, 8), headFur, {
    bone: head,
    at: [HC.x, HC.y, HC.z],
    scale: [0.155, 0.125, 0.135],
    flat: true,
    name: "skull",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), headFur, {
      bone: head,
      at: [s * 0.1, HC.y - 0.055, HC.z + 0.035],
      scale: [0.075, 0.062, 0.075],
      flat: true,
      name: s > 0 ? "cheekL" : "cheekR",
    });
  }
  // muzzle
  const muzzle = b.part(new THREE.SphereGeometry(1, 8, 6), muzzlePaint, {
    bone: head,
    at: [0, HC.y - 0.045, HC.z + 0.125],
    scale: [0.082, 0.055, 0.07],
    flat: true,
    name: "muzzle",
  });
  // nose: stacked pixel boxes
  b.part(tileBox([0.08, 0.05, 0.05], NOSE, FINE), "#ffffff", {
    texture: NOSE,
    bone: head,
    at: [0, HC.y - 0.015, HC.z + 0.18],
    name: "noseMain",
  });
  b.part(tileBox([0.064, 0.02, 0.04], NOSE, FINE), "#ffffff", {
    texture: NOSE,
    bone: head,
    at: [0, HC.y + 0.019, HC.z + 0.172],
    name: "noseTop",
  });
  b.part(tileBox([0.04, 0.014, 0.012], NOSE, FINE), "#ffffff", {
    texture: NOSE,
    bone: head,
    at: [0, HC.y - 0.045, HC.z + 0.208],
    name: "noseLip",
  });
  // lower jaw
  b.part(new THREE.SphereGeometry(1, 8, 5), muzzlePaint, {
    bone: jaw,
    at: [0, HC.y - 0.085, HC.z + 0.1],
    scale: [0.062, 0.032, 0.065],
    flat: true,
    name: "jawChin",
  });
  b.part(new THREE.BoxGeometry(0.09, 0.006, 0.05), LIP, {
    bone: head,
    at: [0, HC.y - 0.068, HC.z + 0.135],
    name: "mouthLine",
  });
  b.part(new THREE.BoxGeometry(0.024, 0.01, 0.01), "#c56f78", {
    bone: jaw,
    at: [0, HC.y - 0.072, HC.z + 0.19],
    name: "tongueTip",
  });
  // eyes: dark beads with pixel glint, brow tufts
  const skullSurf = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSurf.nearest([s * 0.07, HC.y + 0.0, HC.z + 0.3]);
    b.stick(new THREE.SphereGeometry(0.02, 6, 5), "#100d12", hit, { embed: 0.45, name: s > 0 ? "eyeL" : "eyeR" });
    const glint = hit.moved([0.007, 0.018, 0.007]);
    b.stick(new THREE.BoxGeometry(0.008, 0.008, 0.008), "#ffffff", glint, { embed: 0.2, bone: head, name: s > 0 ? "glintL" : "glintR" });
    b.stick(new THREE.BoxGeometry(0.03, 0.01, 0.014), "#2d2831", hit.moved([-0.001, 0.0, 0.0]), {
      embed: -1.1,
      bone: head,
      name: s > 0 ? "browL" : "browR",
    });
  }
  // cheek fluff
  const cheekHits = skullSurf.scatter(90, { rng: rng(51), minDist: 0.03, filter: (h) => Math.abs(h.at.x) > 0.075 && h.at.y < HC.y + 0.02 && h.at.z > HC.z - 0.04 });
  b.cards(cheekHits, TUFT, { size: [0.045, 0.06], lean: 70, flow: [0, -0.8, -0.2], vary: 0.25, rng: rng(52), color: "#e6dfcd", spin: 20 });
  const crownHits = skullSurf.scatter(60, { rng: rng(53), minDist: 0.035, filter: (h) => h.n.y > 0.3 });
  b.cards(crownHits, TUFT, { size: [0.04, 0.05], lean: 70, flow: [0, -0.3, -1], vary: 0.25, rng: rng(54), color: furPaint, spin: 20 });

  // ears
  const earOutline = stepped(
    [
      [-2.5, 2.5],
      [-3.5, 3.5],
      [-4, 4],
      [-4.5, 4.5],
      [-4.5, 4.5],
      [-4.5, 4.5],
      [-4, 4],
      [-3.5, 3.5],
      [-2.5, 2.5],
    ],
    0.0165,
    { rows: true },
  );
  const earIn = stepped(
    [
      [-1.5, 1.5],
      [-2.5, 2.5],
      [-3, 3],
      [-3, 3],
      [-3, 3],
      [-2.5, 2.5],
      [-1.5, 1.5],
    ],
    0.0165,
    { rows: true },
  );
  const earRing = [
    [-2.5, -2.5],
    [-3, -1],
    [-3.2, 1],
    [-2.5, 3],
    [-1, 4],
    [1, 4],
    [2.5, 3],
    [3.2, 1],
    [3, -1],
    [2.5, -2.5],
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${side}`, {
      parent: head,
      at: [s * 0.13, HC.y + 0.07, HC.z - 0.02],
      dir: [s * 0.55, 1, 0.05],
      role: "hinge",
    });
    const ex: [number, number, number] = [0.9, 0, -0.35 * s];
    const ey: [number, number, number] = [0.3 * s, 1, 0];
    const e = b.extrude(earOutline, {
      at: [s * 0.15, HC.y + 0.085, HC.z - 0.03],
      x: ex,
      y: ey,
      thickness: 0.034,
      color: earPaint,
      bone: ear,
      name: `ear${side}`,
    });
    const faceDir = e.axis.clone().multiplyScalar(1);
    b.extrude(earIn, {
      at: new V(...(s > 0 ? [s * 0.148, HC.y + 0.091, HC.z - 0.03] : [s * 0.148, HC.y + 0.091, HC.z - 0.03])).addScaledVector(faceDir, 0.014).toArray() as [number, number, number],
      x: ex,
      y: ey,
      thickness: 0.012,
      color: earInner,
      bone: ear,
      name: `earIn${side}`,
    });
    // fringe of white fluff around the ear rim
    const fr = earRing.map((p) => {
      const pt = e.local([p[0] * 0.0165, (p[1] + 4.4) * 0.0165, 0.012]);
      return frame(pt, [s * 0.4, 0.6, 0.6]);
    });
    b.cards(fr, FRINGE, { size: [0.04, 0.05], lean: 20, flow: [0, 1, 0.4], vary: 0.2, rng: rng(60 + s), color: "#f2ecdc", bone: ear, spin: 30 });
  }

  // ------------------------------------------------------------------------------------------ arms, legs, paws
  const shoulderY = 0.8;
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const y0 = 0.77;
    const lc = limbAt(s, y0);
    const cx = lc.x;
    const palm: [number, number, number] = [cx - s * 0.052, y0, 0.034];
    const pts = limb([s * 0.14, shoulderY, 0.03], palm, [0.17, 0.16], [[0, -1, 0.15]]);
    const arm = b.chain(`arm${side}`, pts, {
      parent: chestJ,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    b.sweep(arm, [0.058, 0.05, 0.042], { color: limbFur, sides: 8, smooth: false, name: `arm${side}` });
    const hand = arm.tip!;
    b.part(new THREE.SphereGeometry(1, 8, 6), pawPaint, {
      bone: hand,
      at: [palm[0] - s * 0.005, palm[1], palm[2] + 0.004],
      scale: [0.038, 0.062, 0.045],
      flat: true,
      name: `palm${side}`,
    });
    // three fingers wrap the limb front -> outside -> back; two thumbs wrap from behind
    const fingerDy = [-0.034, 0, 0.034];
    fingerDy.forEach((dy, i) => {
      const y = y0 + dy;
      const p = catmull([
        [cx - s * 0.042, y, 0.052],
        [cx + s * 0.008, y, 0.066],
        [cx + s * 0.056, y, 0.018],
        [cx + s * 0.042, y, -0.04],
      ]);
      const d = b.chain(`finger${i + 1}${side}`, p, { parent: hand, names: [`finger${i + 1}${side}_1`, `finger${i + 1}${side}_2`, `finger${i + 1}${side}_3`], role: "digit" });
      b.sweep(d, [0.016, 0.013, 0.011], { color: pawPaint, sides: 6, smooth: false, caps: "round", name: `finger${i + 1}${side}` });
      const end = d.at(1);
      b.spike(end, end, 0.034, 0.0085, { color: CLAW, bone: d.joints[2], sides: 5 });
    });
    [-0.017, 0.017].forEach((dy, i) => {
      const y = y0 + dy;
      const p = catmull([
        [cx - s * 0.05, y, 0.0],
        [cx - s * 0.024, y, -0.06],
        [cx + s * 0.034, y, -0.066],
        [cx + s * 0.058, y, -0.02],
      ]);
      const d = b.chain(`thumb${i + 1}${side}`, p, { parent: hand, names: [`thumb${i + 1}${side}_1`, `thumb${i + 1}${side}_2`, `thumb${i + 1}${side}_3`], role: "digit" });
      b.sweep(d, [0.019, 0.015, 0.012], { color: pawPaint, sides: 6, smooth: false, caps: "round", name: `thumb${i + 1}${side}` });
      const end = d.at(1);
      b.spike(end, end, 0.03, 0.008, { color: CLAW, bone: d.joints[2], sides: 5 });
    });
  }

  // legs
  const gripY = 0.62;
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const lc = limbAt(s, gripY);
    const cx = lc.x;
    const ankle: [number, number, number] = [cx - s * 0.058, gripY, 0.03];
    const pts = limb([s * 0.12, 0.58, -0.05], ankle, [0.24, 0.17], [[0, 0.7, 1]]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    b.sweep(leg, [0.082, 0.064, 0.05], { color: limbFur, sides: 8, smooth: false, name: `leg${side}` });
    // thigh haunch
    b.part(new THREE.SphereGeometry(1, 8, 6), limbFur, {
      bone: leg.joints[0],
      at: [s * 0.13, 0.6, -0.04],
      scale: [0.09, 0.09, 0.1],
      flat: true,
      name: `haunch${side}`,
    });
    const foot = leg.tip!;
    b.part(new THREE.SphereGeometry(1, 8, 6), pawPaint, {
      bone: foot,
      at: [ankle[0] - s * 0.004, ankle[1], ankle[2] + 0.006],
      scale: [0.04, 0.07, 0.048],
      flat: true,
      name: `sole${side}`,
    });
    // toes: fused pair (two claws), 4th, 5th wrap the front; hallux (no claw) wraps behind
    const toeSets: { dy: number; r: number; claws: number; name: string }[] = [
      { dy: -0.012, r: 0.023, claws: 2, name: "toe23" },
      { dy: 0.034, r: 0.016, claws: 1, name: "toe4" },
      { dy: 0.062, r: 0.014, claws: 1, name: "toe5" },
    ];
    for (const ts of toeSets) {
      const y = gripY + ts.dy;
      const p = catmull([
        [cx - s * 0.046, y, 0.055],
        [cx + s * 0.008, y, 0.07],
        [cx + s * 0.058, y, 0.02],
        [cx + s * 0.044, y, -0.04],
      ]);
      const d = b.chain(`${ts.name}${side}`, p, { parent: foot, names: [`${ts.name}${side}_1`, `${ts.name}${side}_2`, `${ts.name}${side}_3`], role: "digit" });
      b.sweep(d, [ts.r, ts.r * 0.85, ts.r * 0.7], { color: pawPaint, sides: 6, smooth: false, caps: "round", name: `${ts.name}${side}` });
      const end = d.at(1);
      if (ts.claws === 2) {
        for (const o of [-0.009, 0.009]) {
          const base = end.moved(end.local([0, 0, 0]));
          b.spike(frame([base.at.x, base.at.y + o, base.at.z], end), end, 0.03, 0.0085, { color: CLAW, bone: d.joints[2], sides: 5 });
        }
      } else b.spike(end, end, 0.03, 0.0085, { color: CLAW, bone: d.joints[2], sides: 5 });
    }
    {
      const y = gripY - 0.045;
      const p = catmull([
        [cx - s * 0.05, y, 0.0],
        [cx - s * 0.024, y, -0.062],
        [cx + s * 0.034, y, -0.068],
        [cx + s * 0.058, y, -0.02],
      ]);
      const d = b.chain(`hallux${side}`, p, { parent: foot, names: [`hallux${side}_1`, `hallux${side}_2`, `hallux${side}_3`], role: "digit" });
      b.sweep(d, [0.022, 0.018, 0.015], { color: pawPaint, sides: 6, smooth: false, caps: "round", name: `hallux${side}` });
    }
  }

  // rump fluff
  const rumpHits = bodySurf.scatter(40, { rng: rng(77), minDist: 0.05, filter: (h) => h.at.y < 0.62 && h.n.z < -0.2 });
  b.cards(rumpHits, TUFT, { size: [0.05, 0.06], lean: 40, flow: [0, -1, -0.4], vary: 0.2, rng: rng(78), color: "#d9d2bf", spin: 30 });

  // ------------------------------------------------------------------------------------------ foliage
  const leafFrames: ReturnType<typeof frame>[] = [];
  const nutGeos: THREE.BufferGeometry[] = [];
  const capGeos: THREE.BufferGeometry[] = [];
  const addNut = (p: THREE.Vector3) => {
    nutGeos.push(new THREE.SphereGeometry(0.014, 5, 4).translate(p.x, p.y, p.z));
    capGeos.push(new THREE.CylinderGeometry(0.01, 0.012, 0.008, 5).translate(p.x, p.y + 0.012, p.z));
  };
  const twig = (pts: number[][], r: [number, number], leaves: number, nuts = 0) => {
    const path = catmull(pts);
    b.sweep(path, r, { bone: stand, color: barkPaint, sides: 5, smooth: false, caps: "round", name: "twig" });
    for (let i = 0; i < leaves; i++) {
      const t = 0.18 + (0.82 * (i + R() * 0.6)) / leaves;
      const p = path.at(Math.min(t, 1));
      const tg = path.tangentAt(Math.min(t, 1));
      const ang = R() * Math.PI * 2;
      const out = new V(Math.cos(ang), 0.15 + R() * 0.3, Math.sin(ang)).addScaledVector(new V(...tg.toArray()), 0.4).normalize();
      leafFrames.push(frame(p, out));
    }
    // terminal cluster
    const tip = path.at(1);
    const tt = path.tangentAt(1);
    for (let i = 0; i < 4; i++) {
      const out = new V(R() - 0.5, 0.2 + R() * 0.4, R() - 0.5).addScaledVector(new V(...tt.toArray()), 0.8).normalize();
      leafFrames.push(frame(tip, out));
    }
    for (let i = 0; i < nuts; i++) {
      const t = 0.5 + R() * 0.45;
      const p = path.at(t);
      addNut(new V(p.x + (R() - 0.5) * 0.03, p.y - 0.035 - R() * 0.02, p.z + (R() - 0.5) * 0.03));
    }
  };

  for (const s of [1, -1]) {
    // upper continuation of each fork limb
    twig(
      [
        [s * 0.52, 1.32, 0],
        [s * 0.57, 1.44, 0.03],
        [s * 0.6, 1.55, 0.0],
      ],
      [0.026, 0.01],
      14,
      3,
    );
    const rel = (y: number, d: number[], len: number, rise: number, lift = 0) => {
      const st = limbAt(s, y);
      const a = [st.x, st.y, st.z];
      const m = [a[0] + d[0] * len * 0.5, a[1] + rise * 0.6 + 0.02, a[2] + d[2] * len * 0.5];
      const e = [a[0] + d[0] * len, a[1] + rise + lift, a[2] + d[2] * len];
      return [a, m, e];
    };
    twig(rel(1.02, [s * 0.7, 0, 0.7], 0.3, 0.1), [0.019, 0.008], 12, 2);
    twig(rel(1.12, [s * 0.5, 0, -0.85], 0.3, 0.12), [0.018, 0.008], 12, 0);
    twig(rel(0.9, [s * 0.85, 0, -0.5], 0.24, 0.05, -0.04), [0.017, 0.008], 10, 2);
    twig(rel(1.22, [s * 0.9, 0, 0.45], 0.24, 0.14), [0.017, 0.007], 10, 0);
    twig(rel(1.3, [s * -0.3, 0, 0.9], 0.22, 0.14), [0.015, 0.007], 8, 0);
  }
  // nibbling twig: leaf bunch hangs by the koala's chest on the left limb
  {
    const st = limbAt(1, 0.93);
    twig(
      [
        [st.x, st.y, st.z],
        [st.x - 0.1, st.y - 0.02, 0.11],
        [0.13, 0.9, 0.26],
        [0.09, 0.88, 0.31],
      ],
      [0.017, 0.008],
      9,
      2,
    );
  }

  b.cards(leafFrames, LEAVES, {
    size: [0.07, 0.19],
    lean: 98,
    flow: [0, -1, 0.1],
    bend: 22,
    vary: 0.3,
    spin: 180,
    rng: rng(91),
    bone: stand,
  });
  b.part(mergeGeometries(nutGeos)!, GUM, { bone: stand, at: [0, 0, 0], flat: true, name: "gumnuts" });
  b.part(mergeGeometries(capGeos)!, GUMCAP, { bone: stand, at: [0, 0, 0], flat: true, name: "gumcaps" });

  // ------------------------------------------------------------------------------------------ base clutter
  const flat = new V(0, 1, 0);
  const litter: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 14; i++) {
    const a = R() * Math.PI * 2;
    const rr = 0.18 + R() * 0.3;
    litter.push(frame([Math.sin(a) * rr, 0.1, Math.cos(a) * rr], flat));
  }
  b.cards(litter, LEAVES, {
    size: [0.06, 0.17],
    lean: 90,
    flow: (_f, i) => [Math.sin(i * 2.4), 0, Math.cos(i * 2.4)],
    mirror: true,
    rng: rng(92),
    bone: stand,
    vary: 0.2,
  });
  // moss patches and pebbles
  const mossSpots: [number, number, number][] = [
    [-0.33, 0.1, 0.25],
    [0.3, 0.1, -0.28],
    [0.14, 0.1, 0.4],
    [-0.12, 0.1, -0.4],
  ];
  for (const [x, y, z] of mossSpots) {
    b.part(new THREE.SphereGeometry(1, 7, 4), mossPaint, { bone: stand, at: [x, y, z], scale: [0.09 + R() * 0.03, 0.03, 0.08 + R() * 0.03], flat: true, name: "moss" });
    b.cards([frame([x, y + 0.02, z], [0, 1, 0])], MOSSY, { size: [0.06, 0.05], lean: 0, rng: rng(5), bone: stand, cross: true });
  }
  const pebbles: [number, number, number, number][] = [
    [0.38, 0.105, 0.22, 0.04],
    [0.42, 0.105, 0.14, 0.025],
    [-0.4, 0.105, -0.15, 0.035],
    [-0.28, 0.105, 0.35, 0.025],
  ];
  for (const [x, y, z, r] of pebbles)
    b.part(new THREE.SphereGeometry(1, 5, 4), stonePaint, { bone: stand, at: [x, y, z], scale: [r, r * 0.7, r * 0.9], flat: true, name: "pebble" });
  // fallen gumnuts on the base
  const fallen: THREE.BufferGeometry[] = [];
  const fcap: THREE.BufferGeometry[] = [];
  [
    [0.2, 0.3],
    [0.25, 0.26],
    [-0.22, -0.3],
    [0.05, 0.43],
    [-0.38, 0.1],
  ].forEach(([x, z]) => {
    fallen.push(new THREE.SphereGeometry(0.015, 5, 4).translate(x, 0.108, z));
    fcap.push(new THREE.CylinderGeometry(0.011, 0.013, 0.008, 5).translate(x, 0.123, z));
  });
  b.part(mergeGeometries(fallen)!, GUM, { bone: stand, at: [0, 0, 0], flat: true, name: "fallenNuts" });
  b.part(mergeGeometries(fcap)!, GUMCAP, { bone: stand, at: [0, 0, 0], flat: true, name: "fallenCaps" });

  // nameplate on the front rim
  const plate = letters("KOALA");
  const pw = plate.image ? 0 : 0;
  void pw;
  b.part(new THREE.BoxGeometry(0.3, 0.06, 0.024), "#3a2a1c", { bone: stand, at: [0, 0.09, 0.54], rotation: [-38, 0, 0], name: "plateBack" });
  b.part(new THREE.PlaneGeometry(0.276, 0.0792), "#ffffff", {
    texture: plate,
    bone: stand,
    at: [0, 0.1, 0.5575],
    dir: [0, 0.62, 0.79],
    axis: "z",
    name: "plateText",
  });
  b.part(new THREE.BoxGeometry(0.02, 0.025, 0.02), "#b89442", { bone: stand, at: [0.14, 0.07, 0.545], name: "plateScrewR" });
  b.part(new THREE.BoxGeometry(0.02, 0.025, 0.02), "#b89442", { bone: stand, at: [-0.14, 0.07, 0.545], name: "plateScrewL" });
  void PAW;
  void muzzle;

  return b.root;
}
