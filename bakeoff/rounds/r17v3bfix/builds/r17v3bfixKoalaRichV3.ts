import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { DEG, rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { noise } from "../../../../src/paint";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, snapColor, stepped, tileBox } from "../../../../kits/pixel";
import type { Cell } from "../../../../kits/pixel";

export const meta = {
  name: "Koala on a Eucalyptus Branch Stand",
  description:
    "A pixel-art koala sitting on a gum-tree perch, one hand clamped on the branch and the other holding a leafy shoot up to its mouth; mounted on a mossy wooden plinth.",
  style: "pixel art",
  commit: "88fc1f0",
};

const TEXEL = 0.02;
const q = (c: string) => snapColor(c, 64);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---- palette ramps (dark to light) ----
const GREY = ["#262a36", "#3d4251", "#575c6d", "#767b8c", "#989cab", "#bcbfca"].map(q);
const CREAM = ["#7f7b76", "#a8a398", "#cbc6b7", "#e3dfd0", "#f4f1e6"].map(q);
const PAW = ["#14131a", "#201f29", "#2e2d39", "#3f3e4d"].map(q);
const NOSE = ["#0c0a10", "#15121b", "#241f2c", "#46414f"].map(q);
const GUM = ["#7d7a64", "#9a9780", "#b7b49a", "#d0cdb3", "#e6e3cc"].map(q);
const RUST = ["#4d3626", "#6e4a33", "#8e6244", "#ad7f58"].map(q);
const ROUGH = ["#2a2119", "#3d3025", "#54432f", "#6e5a40"].map(q);
const TWIG = ["#4d3626", "#6e4a33", "#8e6244", "#b08258"].map(q);
const CLAW = q("#efe6cf");
const SPOT = q("#8a6a52");
const EARIN = ["#cfc5b3", "#e6dfcf", "#f6f1e4"].map(q);
const PINK = q("#d7a39d");

const streak = (c: Cell, sx: number, sy: number, sz: number, size: number, seed: number) =>
  noise(V(c.at.x * sx, c.at.y * sy, c.at.z * sz), size, seed);

// ---- paints ----
const TORSO = cellPaint(
  TEXEL,
  (c) => {
    const g = streak(c, 2, 0.7, 2, 0.08, 2) - 0.5;
    const nz = noise(c.at, 0.09, 5) - 0.5;
    const front = c.n.z + 0.5 * nz;
    if (c.random(7) < 0.035) return c.pick(GREY, 0.2 + 0.5 * c.random(8));
    if (c.at.y < 0.7 && c.n.z < -0.05 && c.n.y < 0.6) {
      if (c.random(3) < 0.1) return SPOT;
      return c.pick(CREAM, 0.45 + 0.35 * c.n.y + 0.3 * g);
    }
    if (c.at.y > 0.52 && front > 0.32 + (c.threshold - 0.5) * 0.25) return c.pick(CREAM, 0.6 + 0.35 * c.n.z + 0.4 * g);
    return c.pick(GREY, 0.5 + 0.22 * c.n.y + 0.5 * g);
  },
  { dither: true },
);

const LIMB = cellPaint(
  TEXEL,
  (c) => {
    const g = streak(c, 2, 0.7, 2, 0.08, 4) - 0.5;
    if (c.random(9) < 0.03) return c.pick(GREY, 0.15 + 0.4 * c.random(10));
    return c.pick(GREY, 0.48 + 0.2 * c.n.y + 0.5 * g);
  },
  { dither: true },
);

const HEADP = cellPaint(
  TEXEL,
  (c) => {
    const g = noise(c.at, 0.07, 6) - 0.5;
    if (c.random(7) < 0.03) return c.pick(GREY, 0.2 + 0.5 * c.random(8));
    const lower = c.n.z > 0.15 && c.n.y < 0.05;
    const cheek = Math.abs(c.n.x) > 0.45 && c.n.y < 0.1 && c.n.z > -0.1;
    if ((lower || cheek) && g + c.threshold * 0.2 > -0.16) return c.pick(CREAM, 0.62 + 0.4 * g);
    return c.pick(GREY, 0.52 + 0.25 * c.n.y + 0.6 * g);
  },
  { dither: true },
);

const EAROUT = cellPaint(
  TEXEL,
  (c) => c.pick(GREY, 0.55 + 0.2 * c.n.y + 0.6 * (noise(c.at, 0.06, 3) - 0.5)),
  { dither: true },
);
const EARINP = cellPaint(
  TEXEL,
  (c) => {
    const d = Math.hypot(c.s[0], c.s[1]);
    if (d < 0.028) return PINK;
    return c.pick(EARIN, 0.5 + 0.9 * (noise(c.at, 0.05, 8) - 0.5) + 0.2 * (0.07 - d) * 10);
  },
  { dither: true },
);

const PAWP = cellPaint(TEXEL * 0.75, (c) => c.pick(PAW, 0.3 + 0.7 * c.random(1) * 0.6 + 0.2 * c.n.y), { dither: true });
const NOSEP = cellPaint(TEXEL * 0.6, (c) => c.pick(NOSE, c.n.y > 0.55 && c.n.z > 0.1 ? 0.95 - 0.5 * c.random(2) : 0.2 + 0.3 * c.random(3)), {
  dither: true,
});

const BARK = cellPaint(
  TEXEL,
  (c) => {
    const a = streak(c, 2.4, 0.45, 2.4, 0.09, 4);
    const b = streak(c, 2.4, 0.4, 2.4, 0.12, 11);
    if (c.at.y < 0.26 + 0.12 * (a - 0.5)) return c.pick(ROUGH, 0.3 + 0.9 * (a - 0.2));
    if (b > 0.7) return c.pick(RUST, 0.2 + (b - 0.7) * 4);
    if (c.random(5) < 0.04) return c.pick(GUM, 0.1);
    return c.pick(GUM, 0.2 + 0.85 * a + 0.12 * c.n.y);
  },
  { dither: true },
);

const TWIGP = cellPaint(
  TEXEL * 0.7,
  (c) => c.pick(TWIG, 0.3 + 0.7 * streak(c, 2, 0.5, 2, 0.05, 12) + 0.1 * c.n.y),
  { dither: true },
);

// ---- textures ----
function leafTexture(rib: string, mid: string, dark: string, edge: string) {
  return pixelTexture(6, 16, (g) => {
    for (let y = 0; y < 16; y++) {
      const t = (15 - y) / 15;
      const hw = 0.55 + 2.15 * Math.sin(Math.PI * Math.min(1, t * 0.96 + 0.02));
      const cx = 2.4 + 1.0 * t * t;
      for (let x = 0; x < 6; x++) {
        const d = x + 0.5 - cx;
        if (Math.abs(d) > hw) continue;
        if (t < 0.07) g.set(x, y, dark);
        else if (Math.abs(d) < 0.55) g.set(x, y, rib);
        else if (Math.abs(d) > hw - 0.75) g.set(x, y, edge);
        else g.set(x, y, (x + y) % 5 === 0 ? dark : d < 0 ? mid : q("#86b6a2"));
      }
    }
  });
}
const LEAVES = [
  leafTexture("#c4dfc9", "#6a9c86", "#3f6e5f", "#527f6e"),
  leafTexture("#c9e2c2", "#7fae96", "#46766a", "#5d8c7a"),
  leafTexture("#d6e6b4", "#88aa62", "#4c7048", "#678c52"),
];
const TUFT = pixelArt(["..w..", "..w..", ".www.", ".wwv.", "wwwvv", "wwwvv"], { w: "#ffffff", v: "#cfcfcf" });
const TUFT_FINE = pixelArt(["..w.", ".ww.", ".wwv", "wwvv"], { w: "#ffffff", v: "#cfcfcf" });
const EYE = pixelArt([".kk.", "kwkk", "kkkk", ".kk."], { k: "#0b0a10", w: "#ffffff" });
const GRASS = pixelArt(["..g....g.", "..g..g.g.", ".gg..g.gg", ".ggg.gggg", "gggggdggg", "gddggddgg"], {
  g: "#58a23a",
  d: "#336b2a",
});
const FLATLEAF = pixelArt([".r..", "rrr.", "rrro", ".roo", ".oo.", ".o.."], { r: "#b55a2a", o: "#d98b3a" });

const WOODTILE = pixelTexture(72, 24, (g) => {
  const W = ["#4a2f1d", "#5e3d25", "#76502f", "#8c633a"].map(q);
  const r = rng(11);
  g.fill((x, y) => {
    const row = Math.floor(y / 6);
    const ry = y % 6;
    if (ry === 0) return q("#2c1a10");
    const seam = (x + row * 23) % 41 === 0 ? q("#2c1a10") : "";
    if (seam) return seam;
    const base = 0.35 + 0.15 * (row % 2) + 0.25 * r() + (ry === 1 ? 0.2 : 0) + (ry === 5 ? -0.1 : 0);
    return pick(W, base, bayer(x, y));
  });
  for (let i = 0; i < 14; i++) g.set(Math.floor(r() * 72), 1 + Math.floor(r() * 22), q("#3a2314"));
});
const MOSS = pixelTexture(64, 32, (g) => {
  const G = ["#1f4d22", "#2f6b2a", "#46902f", "#6bb542", "#93d65a"].map(q);
  const r = rng(5);
  g.fill((x, y) => {
    const v = 0.3 + 0.5 * noise(V(x * 0.9, y * 0.9, 1), 7, 3) + 0.2 * r();
    return pick(G, v, bayer(x, y));
  });
  g.fill((x, y) => {
    const n = noise(V(x, y, 9), 6, 8);
    return n > 0.68 ? pick(["#6e4b2c", "#8a6038", "#a47848"].map(q), (n - 0.68) * 4, bayer(x, y)) : "";
  });
  const flowers = [
    [6, 5, "#f2e65a"],
    [22, 24, "#f4f0e8"],
    [41, 9, "#f2e65a"],
    [53, 26, "#e57a9b"],
    [12, 18, "#f4f0e8"],
    [33, 15, "#e57a9b"],
    [58, 6, "#f4f0e8"],
  ] as const;
  for (const [x, y, c] of flowers) {
    g.set(x, y, c);
    g.set(x + 1, y, q("#d9a02a"));
  }
});
const RINGS = pixelTexture(16, 16, (g) => {
  const R = ["#e6c590", "#d4a96c", "#bd8d52", "#a47642"].map(q);
  g.fill((x, y) => {
    const d = Math.hypot(x + 0.5 - 8.5 + 0.8, y + 0.5 - 8.2);
    return d < 0.9 ? q("#7a4e2a") : R[Math.floor(d * 0.95) % 4];
  });
});
const CAPTEX = pixelArt(["..ww..w.", "w.rrrr..", "rrrwrrrr", "rwrrrrwr", "rrrrrrrr"], { r: "#c8402d", w: "#f6efe0" });
const EMBLEM = pixelArt(
  [
    "...ddd...",
    "..dllld..",
    ".dlllmld.",
    "dlllmmmld",
    "dllmmmmld",
    ".dlmmmld.",
    "..dmmld..",
    "...ddr...",
    "....r....",
  ],
  { d: "#27503f", l: "#7fb59b", m: "#a9d5bf", r: "#5e3d25" },
);

// ---- helpers ----
function prof(t: number, keys: number[][]) {
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const a = keys[i - 1];
      const b = keys[i];
      const k = (t - a[0]) / (b[0] - a[0]);
      return a.slice(1).map((v, j) => v + (b[j + 1] - v) * k) as [number, number];
    }
  }
  const last = keys[keys.length - 1];
  return [last[1], last[2]] as [number, number];
}

function wrap(center: THREE.Vector3, axis: THREE.Vector3, ref: THREE.Vector3, radii: number[], degs: number[], along: number) {
  const a = axis.clone().normalize();
  const u = ref.clone().addScaledVector(a, -ref.dot(a)).normalize();
  const v = a.clone().cross(u);
  return degs.map((d, i) =>
    center
      .clone()
      .addScaledVector(a, along)
      .addScaledVector(u, radii[i] * Math.cos(d * DEG))
      .addScaledVector(v, radii[i] * Math.sin(d * DEG)),
  );
}

export default function build() {
  const b = createBuilder({ name: "koala" });
  const rand = rng(21);
  const hips = b.joint("hips", { at: [0, 0.5, 0] });
  void hips;

  // =====================================================================================================
  // STAND: plinth, trunk, perch, stump, shoots
  // =====================================================================================================
  const WOODBASE = q("#5e3d25");
  const plinthLow = b.part(tileBox([1.34, 0.07, 0.74], WOODTILE, TEXEL, { rand, step: [1, 6] }), WOODBASE, {
    texture: WOODTILE,
    at: [0, 0.035, 0],
    bone: "hips",
  });
  void plinthLow;
  return b.root;
}
