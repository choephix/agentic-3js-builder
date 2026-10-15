// Koala sitting on a eucalyptus branch stand, gripping the branch with both hands and both feet. Pixel art:
// every surface is made of 1.6-2 cm square texels (cellPaint fur with Bayer dither, tile boxes, stepped ears).
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { noise } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, stepped, tileBox } from "../../../../kits/pixel";
import type { Cell } from "../../../../kits/pixel";

export const meta = {
  name: "Koala on Eucalyptus Stand",
  description:
    "A chubby pixel-art koala sitting on a eucalyptus branch, hands and feet wrapped around it, on a wooden display plinth with leaf sprays, peeling bark and gumnuts.",
  style: "pixel art",
  commit: "88fc1f0",
};

const TEXEL = 0.02;
const FINE = 0.016;

// ---------------------------------------------------------------------------------------------------------------
// Palette
const GREY_R = ["#33373f", "#4f545e", "#6f7580", "#8f95a0", "#aeb3bc", "#c6cad1"];
const CREAM_R = ["#8f8878", "#b3ab98", "#cfc8b4", "#e4dfcd", "#f3efe2"];
const MUZ_R = ["#4f545e", "#6f7580", "#8f95a0", "#aeb3bc"];
const DARK_R = ["#17181c", "#25272d", "#383b43", "#4c505a"];
const BARK_R = ["#4c3d32", "#6e5a49", "#8f7a64", "#b09a80", "#cdbea2", "#e3d8c0"];
const MOSS_R = ["#1f3a1a", "#2f5a26", "#437d33", "#5fa045"];
const CLAW = "#ece3c8";
const CREAM = "#ece6d4";

const lit = (c: Cell, seed: number, bias: number) => {
  let v = 0.5 + bias + 0.3 * c.n.y + (noise(c.at, 0.1, seed) - 0.5) * 0.55;
  const r = c.random(seed);
  if (r < 0.06) v -= 0.3;
  else if (r > 0.94) v += 0.22;
  return v;
};
const furPaint = (ramp: string[], seed = 1, bias = 0) =>
  cellPaint(FINE, (c) => c.pick(ramp, lit(c, seed, bias)), { dither: true });

const FUR = furPaint(GREY_R, 1, 0);
const FUR_B = furPaint(GREY_R, 2, 0.05);
const DARKP = furPaint(DARK_R, 4, 0);
const MUZZLE = furPaint(MUZ_R, 6, 0.15);
const CREAMP = furPaint(CREAM_R, 7, 0.1);
const BODY = cellPaint(
  FINE,
  (c) => {
    const edge = 0.22 + 0.3 * (noise(c.at, 0.12, 8) - 0.5);
    const chest = c.n.z > edge && c.at.y > 0.45 && c.at.y < 0.83;
    return chest ? c.pick(CREAM_R, lit(c, 5, 0.12) + 0.08) : c.pick(GREY_R, lit(c, 1, 0));
  },
  { dither: true },
);
const HEAD = cellPaint(
  FINE,
  (c) =>
    c.at.y < 0.885 + 0.02 * (noise(c.at, 0.08, 9) - 0.5)
      ? c.pick(CREAM_R, lit(c, 5, 0.1) + 0.05)
      : c.pick(GREY_R, lit(c, 3, 0.08)),
  { dither: true },
);
const BARK = cellPaint(
  TEXEL,
  (c) => {
    const q = new THREE.Vector3(c.at.x * 5, c.at.y * 0.45, c.at.z * 5);
    let v = noise(q, 0.12, 3) * 1.1 - 0.05;
    if (c.at.y < 0.25) v -= 0.25;
    const r = c.random(11);
    if (r < 0.05) v -= 0.4;
    else if (r > 0.96) v += 0.25;
    return c.pick(BARK_R, v);
  },
  { dither: true },
);
const MOSS = cellPaint(0.02, (c) => c.pick(MOSS_R, 0.45 + 0.4 * c.n.y + (c.random(2) - 0.5) * 0.5), { dither: true });

// ---------------------------------------------------------------------------------------------------------------
// Textures
const WOOD_R = ["#3f2a1c", "#573a25", "#6f4b2e", "#855d38"];
const plankTile = (seed: number, light: number) =>
  pixelTexture(32, 20, (g) => {
    const r = rng(seed);
    g.fill((x, y) => {
      const row = Math.floor(y / 5);
      const k = y % 5;
      if (k === 0) return "#2a1a10";
      if (k === 1) return pick(WOOD_R, 0.7 + light, bayer(x, y));
      const streak = 0.35 + light + 0.25 * Math.sin((x + row * 9) * 0.7) + 0.15 * (r() - 0.5);
      return pick(WOOD_R, streak, bayer(x, y));
    });
    for (let row = 0; row < 4; row++) {
      const nx = 3 + Math.floor(r() * 26);
      g.set(nx, row * 5 + 2, "#2a1a10");
      g.set(nx + 1, row * 5 + 3, "#2a1a10");
      g.set(2 + ((row * 11) % 28), row * 5 + 1, "#c8b080");
    }
  });
const PLANK_A = plankTile(5, 0);
const PLANK_B = plankTile(9, 0.15);

const PLAQUE = pixelTexture(24, 8, (g) => {
  g.fill((x, y) => (y === 0 || x === 0 ? "#f1d98a" : y === 7 || x === 23 ? "#7a5a1c" : "#c8a24a"));
  const P = { X: "#3a2a10" };
  const glyphs: string[][] = [
    ["X.X", "X.X", "XX.", "X.X", "X.X"],
    ["XXX", "X.X", "X.X", "X.X", "XXX"],
    [".X.", "X.X", "XXX", "X.X", "X.X"],
    ["X..", "X..", "X..", "X..", "XXX"],
    [".X.", "X.X", "XXX", "X.X", "X.X"],
  ];
  glyphs.forEach((rows, i) => g.stamp(3 + i * 4, 1, rows, P));
});

const EYE = pixelArt(["wkk", "kkk", "kkk"], { w: "#d8dce4", k: "#0c0d10" });
const NOSE = pixelArt(
  ["kkkkkkkk", "kgkkkkkk", "kkkkkkkk", "kkdkkdkk", "kkkkkkkk"],
  { k: "#0f1013", g: "#4a4e5a", d: "#050507" },
);

const tuftTex = (p: { w: string; W: string; g: string; G: string }) =>
  pixelArt(["..w..", ".wWw.", ".wWw.", "wWgWw", "wgGgw", ".gGg."], p);
const TUFT_G = tuftTex({ w: "#d5d8dd", W: "#b9bdc5", g: "#979ca7", G: "#767b86" });
const TUFT_C = tuftTex({ w: "#faf6ea", W: "#ece6d4", g: "#d2cbb6", G: "#b3ab98" });

function leafTexture(dark: string, mid: string, light: string, vein: string) {
  const H = 24;
  return pixelTexture(8, H, (g) => {
    for (let y = 0; y < H; y++) {
      const t = (y + 0.5) / H;
      const center = 3 + 1.8 * t;
      if (y >= H - 3) {
        g.set(Math.round(center - 0.5), y, "#6b5a3a");
        continue;
      }
      const half = 3.4 * Math.pow(Math.sin((Math.PI * t) / 0.88), 0.7);
      for (let x = 0; x < 8; x++) {
        const d = x + 0.5 - center;
        const a = Math.abs(d);
        if (a >= half) continue;
        g.set(x, y, a > half - 0.9 ? dark : a < 0.5 ? vein : d < 0 ? light : mid);
      }
    }
  });
}
const LEAF_A = leafTexture("#2f5a4a", "#4f8a6a", "#6fa886", "#b4d4b0");
const LEAF_B = leafTexture("#3d6050", "#6a9a80", "#8cbc9c", "#cfe4cc");
const BARK_STRIP = pixelTexture(4, 14, (g) =>
  g.fill((x, y) => (x < 4 - Math.floor(y / 5) && x >= Math.floor(y / 9) ? (x % 2 ? "#e0d4b8" : "#bba98a") : "")),
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "koala", paintSize: 2048 });

  // Skeleton ---------------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.53, -0.05] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.53, -0.05],
      [0, 0.62, -0.02],
      [0, 0.73, 0.02],
      [0, 0.83, 0.06],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const head = b.joint("head", { parent: chest, at: [0, 0.86, 0.08], aim: [0, 0.97, 0.14], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.885, 0.115], aim: [0, 0.872, 0.21], role: "jaw" });

  // Stand: plinth, trunk, seat branch -------------------------------------------------------------------------
  const rand = rng(5);
  b.part(tileBox([0.7, 0.05, 0.62], PLANK_A, TEXEL, { rand, step: [1, 5] }), "#ffffff", {
    texture: PLANK_A,
    bone: hips,
    at: [0, 0.025, 0],
  });
  b.part(tileBox([0.58, 0.04, 0.5], PLANK_B, TEXEL, { rand, step: [1, 5] }), "#ffffff", {
    texture: PLANK_B,
    bone: hips,
    at: [0, 0.07, 0],
  });
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.part(new THREE.BoxGeometry(0.05, 0.052, 0.05), "#3b3a40", {
        bone: hips,
        at: [sx * 0.338, 0.026, sz * 0.298],
      });
  b.part(new THREE.BoxGeometry(0.24, 0.034, 0.01), "#ffffff", {
    texture: PLAQUE,
    bone: hips,
    at: [0, 0.027, 0.312],
  });
  // moss mounds and fallen leaves on the plinth
  const mossAt: Array<[number, number, number, number]> = [
    [0.22, 0.2, 0.07, 0.05],
    [-0.24, 0.15, 0.06, 0.045],
    [0.2, -0.17, 0.05, 0.04],
    [-0.2, -0.2, 0.065, 0.05],
  ];
  for (const [mx, mz, rx, rz] of mossAt)
    b.part(new THREE.SphereGeometry(1, 8, 5), MOSS, { bone: hips, at: [mx, 0.09, mz], scale: [rx, 0.025, rz] });
  const lr = rng(21);
  b.cards(
    [
      [0.1, 0.22],
      [-0.12, 0.2],
      [0.3, 0.02],
      [-0.3, -0.05],
      [0.05, -0.2],
      [-0.08, 0.05],
    ].map(([x, z]) => frame([x, 0.092, z], [0, 1, 0])),
    LEAF_A,
    { size: [0.04, 0.12], lean: 90, flow: () => [lr() - 0.5, 0, lr() - 0.5], mirror: true, bone: hips, sink: 0 },
  );

  const trunk = b.sweep(
    catmull([
      [0, 0.07, -0.235],
      [0.01, 0.5, -0.25],
      [0, 0.95, -0.27],
      [-0.01, 1.4, -0.29],
    ]),
    [0.12, 0.075, 0.065, 0.05],
    { color: BARK, bone: hips },
  );
  const seat = b.sweep(
    catmull([
      [0, 0.3, -0.235],
      [0, 0.345, -0.06],
      [0, 0.372, 0.15],
      [0, 0.385, 0.42],
      [0, 0.4, 0.62],
    ]),
    [0.06, 0.052, 0.047, 0.04, 0.028],
    { color: BARK, bone: hips },
  );
  const twig = (pts: number[][], radii: number[]) => b.sweep(catmull(pts), radii, { color: BARK, bone: hips });
  const t1 = twig(
    [
      [0, 0.95, -0.27],
      [0.12, 1.08, -0.23],
      [0.32, 1.17, -0.13],
      [0.52, 1.2, 0.03],
    ],
    [0.04, 0.03, 0.022, 0.012],
  );
  const t2 = twig(
    [
      [0, 1.1, -0.28],
      [-0.14, 1.2, -0.23],
      [-0.34, 1.3, -0.15],
      [-0.5, 1.33, -0.02],
    ],
    [0.035, 0.026, 0.019, 0.011],
  );
  const t3 = twig(
    [
      [0, 0.62, -0.26],
      [-0.18, 0.7, -0.3],
      [-0.34, 0.8, -0.28],
    ],
    [0.03, 0.022, 0.012],
  );
  const leafDir = (_f: unknown, i: number) => [Math.sin(i * 2.3) * 0.4, -1, Math.cos(i * 1.7) * 0.4];
  const leafy = (s: Parameters<typeof b.surface>[0], n: number, seed: number, minY = -1) => {
    const hits = b
      .surface(s)
      .scatter(n, { rng: rng(seed), minDist: 0.03, filter: (h) => h.at.y > minY });
    b.cards(hits, [LEAF_A, LEAF_B], {
      size: [0.05, 0.17],
      lean: 55,
      bend: 25,
      vary: 0.3,
      spin: 180,
      flow: leafDir,
      rng: rng(seed + 100),
      bone: hips,
    });
  };
  leafy(t1, 70, 31);
  leafy(t2, 70, 32);
  leafy(t3, 30, 33);
  leafy(trunk, 50, 34, 1.15);
  const strips = b.surface(trunk).scatter(16, { rng: rng(40), minDist: 0.08, filter: (h) => h.at.y > 0.2 && h.at.y < 1.2 });
  b.cards(strips, BARK_STRIP, { size: [0.05, 0.15], lean: 28, flow: [0, -1, 0], bend: 20, vary: 0.3, bone: hips });
  void seat;

  // gumnuts
  for (const [gx, gy, gz] of [
    [0.34, 1.12, -0.1],
    [0.24, 1.07, -0.15],
    [-0.32, 1.24, -0.12],
    [-0.2, 1.17, -0.2],
    [-0.3, 0.74, -0.27],
  ]) {
    b.rod([gx, gy + 0.04, gz], [gx, gy, gz], 0.004, "#5a4a30", { bone: hips });
    b.part(new THREE.SphereGeometry(0.017, 6, 4), "#6b5a3a", { bone: hips, at: [gx, gy - 0.012, gz] });
    b.part(new THREE.CylinderGeometry(0.013, 0.015, 0.008, 6), "#a89a70", { bone: hips, at: [gx, gy + 0.004, gz] });
  }

  // Koala body -------------------------------------------------------------------------------------------------
  const torso = b.sweep(spine, [0.15, 0.175, 0.15, 0.115], { color: BODY });
  b.part(new THREE.SphereGeometry(1, 9, 7), FUR, { bone: hips, at: [0, 0.43, -0.14], scale: [0.13, 0.09, 0.09] });

  // Head
  const headC = new THREE.Vector3(0, 0.95, 0.11);
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), HEAD, {
    bone: head,
    at: headC,
    scale: [0.13, 0.115, 0.12],
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), MUZZLE, {
    bone: head,
    at: [0, 0.915, 0.17],
    scale: [0.065, 0.052, 0.062],
  });
  b.part(new THREE.BoxGeometry(0.075, 0.05, 0.04), "#ffffff", { texture: NOSE, bone: head, at: [0, 0.948, 0.222] });
  b.part(new THREE.BoxGeometry(0.075, 0.03, 0.085), CREAMP, { bone: jaw, at: [0, 0.872, 0.175] });
  const cheeks = [1, -1].map((s) =>
    b.part(new THREE.SphereGeometry(1, 8, 6), CREAMP, {
      bone: head,
      at: [s * 0.095, 0.895, 0.12],
      scale: [0.05, 0.042, 0.05],
    }),
  );
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.024, 0.024, 0.012), "#ffffff", {
      texture: EYE,
      bone: head,
      at: [s * 0.058, 0.972, 0.2],
    });
    // brow tuft over each eye
    b.part(new THREE.BoxGeometry(0.036, 0.01, 0.014), "#7a808b", {
      bone: head,
      at: [s * 0.058, 0.994, 0.197],
      rotation: [0, 0, s * -12],
    });
  }

  // Ears: three stepped pixel layers (cream fringe, grey cup, cream inner), facing outward and forward
  const earLayer = (
    s: number,
    cols: Array<[number, number]>,
    off: number,
    thickness: number,
    color: string | Paint,
  ) => {
    const d = new THREE.Vector3(s * 0.7, 0.2, 0.7).normalize();
    const up = new THREE.Vector3(0, 1, 0).addScaledVector(d, -d.y).normalize();
    const xAxis = new THREE.Vector3().crossVectors(up, d);
    const w = cols.length * TEXEL;
    const h = Math.max(...cols.map((c) => c[1])) * TEXEL;
    const center = new THREE.Vector3(s * 0.118, 1.035, 0.095).addScaledVector(d, off);
    const at = center.clone().addScaledVector(xAxis, -w / 2).addScaledVector(up, -h / 2);
    b.extrude(stepped(cols, TEXEL), { at, x: xAxis, y: up, thickness, color, bone: head });
  };
  for (const s of [1, -1]) {
    earLayer(s, [[1, 5], [0, 6], [0, 6], [0, 6], [0, 6], [1, 5]], -0.012, 0.03, CREAM);
    earLayer(s, [[1, 4], [0, 5], [0, 5], [0, 5], [1, 4]], 0.002, 0.03, FUR_B);
    earLayer(s, [[1, 3], [0, 3], [1, 3]], 0.014, 0.012, "#f4efe2");
  }

  // Legs -------------------------------------------------------------------------------------------------------
  const legSweeps: Array<ReturnType<typeof b.sweep>> = [];
  const armSweeps: Array<ReturnType<typeof b.sweep>> = [];
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    // hind leg: thigh out and forward, foot clamped on the side of the branch
    const pts = limb([s * 0.11, 0.5, -0.04], [s * 0.075, 0.385, 0.15], [0.16, 0.16], [s * 0.6, 0.4, 0.7]);
    const leg = b.chain(`leg${L}`, pts, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`],
      role: "leg",
    });
    legSweeps.push(b.sweep(leg, [0.09, 0.065, 0.05], { color: FUR }));
    b.part(new THREE.SphereGeometry(1, 8, 6), DARKP, {
      bone: leg.tip!,
      at: [s * 0.08, 0.4, 0.15],
      scale: [0.04, 0.035, 0.07],
    });
    [0.095, 0.12, 0.145, 0.17, 0.195].forEach((z, i) => {
      const n = `toe${L}${i + 1}`;
      const p = [
        [s * 0.075, 0.395, z],
        [s * 0.062, 0.345, z],
        [s * 0.025, 0.312, z],
      ];
      const dj = b.chain(n, catmull(p), { parent: leg.tip!, names: [`${n}a`, `${n}b`], role: "digit" });
      b.sweep(dj, [0.017, 0.013], { color: DARKP });
      b.spike(p[2], [p[2][0] - p[1][0], p[2][1] - p[1][1], 0], 0.02, 0.006, CLAW, { bone: dj.joints[1] });
    });

    // arm: reaches forward to the branch, fingers wrap over the top
    const zc = s > 0 ? 0.355 : 0.275;
    const apts = limb([s * 0.13, 0.76, 0.06], [s * 0.075, 0.455, zc], [0.24, 0.22], [s, -0.1, -0.3]);
    const arm = b.chain(`arm${L}`, apts, {
      parent: chest,
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`],
      role: "arm",
    });
    armSweeps.push(b.sweep(arm, [0.062, 0.052, 0.042], { color: FUR }));
    b.part(new THREE.SphereGeometry(1, 8, 6), DARKP, {
      bone: arm.tip!,
      at: [s * 0.065, 0.45, zc],
      scale: [0.04, 0.028, 0.07],
    });
    const fingers: number[][][] = [0, 1, 2, 3].map((i) => {
      const z = zc - 0.0375 + 0.025 * i;
      return [
        [s * 0.065, 0.445, z],
        [s * 0.03, 0.443, z],
        [s * 0.004, 0.41, z],
      ];
    });
    fingers.unshift([
      [s * 0.07, 0.44, zc - 0.07],
      [s * 0.073, 0.405, zc - 0.07],
      [s * 0.055, 0.375, zc - 0.07],
    ]);
    fingers.forEach((p, i) => {
      const n = `finger${L}${i + 1}`;
      const dj = b.chain(n, catmull(p), { parent: arm.tip!, names: [`${n}a`, `${n}b`], role: "digit" });
      b.sweep(dj, [0.016, 0.012], { color: DARKP });
      b.spike(p[2], [p[2][0] - p[1][0], p[2][1] - p[1][1], p[2][2] - p[1][2]], 0.02, 0.006, CLAW, {
        bone: dj.joints[1],
      });
    });
  }

  // Fur tufts (cards) ------------------------------------------------------------------------------------------
  const torsoHits = b.surface(torso).scatter(170, { rng: rng(3), minDist: 0.035 });
  const isChest = (h: { n: THREE.Vector3; at: THREE.Vector3 }) => h.n.z > 0.25 && h.at.y > 0.5 && h.at.y < 0.82;
  b.cards(torsoHits.filter((h) => !isChest(h)), TUFT_G, {
    size: [0.045, 0.055],
    lean: 60,
    bend: 20,
    vary: 0.25,
    rng: rng(4),
  });
  b.cards(torsoHits.filter(isChest), TUFT_C, {
    size: [0.045, 0.055],
    lean: 60,
    bend: 20,
    vary: 0.25,
    rng: rng(5),
  });
  const headHits = b.surface(skull).scatter(70, {
    rng: rng(6),
    minDist: 0.035,
    filter: (h) => h.n.z < 0.55 && h.at.y > 0.9,
  });
  b.cards(headHits, TUFT_G, { size: [0.04, 0.05], lean: 60, vary: 0.25, rng: rng(7) });
  for (const c of cheeks) {
    const hits = b.surface(c).scatter(14, { rng: rng(8), minDist: 0.03, filter: (h) => h.n.z < 0.6 });
    b.cards(hits, TUFT_C, { size: [0.04, 0.05], lean: 60, vary: 0.25, rng: rng(9) });
  }
  for (const sw of [...legSweeps, ...armSweeps]) {
    const hits = b.surface(sw).scatter(26, { rng: rng(12), minDist: 0.03 });
    b.cards(hits, TUFT_G, { size: [0.035, 0.045], lean: 60, vary: 0.25, rng: rng(13) });
  }

  return b.root;
}
