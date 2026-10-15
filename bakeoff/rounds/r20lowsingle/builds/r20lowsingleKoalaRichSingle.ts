// Koala gripping a eucalyptus branch stand, in pixel art: one texel size (1.6 cm) on every fur, bark and wood surface.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { noise } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import type { Sweep } from "../../../../src/sweep";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, snapColor, tileBox } from "../../../../kits/pixel";

export const meta = {
  name: "Eucalyptus Koala",
  description:
    "A chunky pixel-art koala sitting in the crook of a eucalyptus branch stand, both hands wrapped round an upright twig, feet clamped on the limb.",
  style: "pixel art",
  commit: "88fc1f0",
};

const TEXEL = 0.016;
const snap = (list: string[]) => list.map((c) => snapColor(c, 64));

const GRAY = snap(["#3d4048", "#585d66", "#757b85", "#979ca5", "#b9bec6"]);
const MUZ = snap(["#6f747d", "#8f949d", "#aeb3ba", "#c9ccd1"]);
const CREAM = snap(["#a9a79e", "#c8c5b8", "#e3dfd0", "#f3efe2"]);
const DARK = snap(["#101114", "#1c1d22", "#2a2c33", "#383b44"]);
const BARKR = snap(["#6a5a4a", "#8c7c66", "#b2a58b", "#d3c9ae", "#ece4cc"]);
const MOSSY = snap(["#59644a", "#74825d", "#92a374"]);
const WOOD = snap(["#4a2f1b", "#6a4426", "#8a5d34", "#a87a45"]);
const GREENS = snap(["#1f3a1a", "#2f5a22", "#468a2e", "#6db23f", "#9ad45a"]);
const STONE = snap(["#55585f", "#73767d", "#92959c", "#b0b3b9"]);

const NOSE = "#101014";
const CLAW = "#e6dcc0";
const GUM = "#6b5a3a";

const FUR = cellPaint(
  TEXEL,
  (c) => {
    if (c.random(1) < 0.05) return GRAY[0];
    if (c.random(2) > 0.96) return GRAY[4];
    return c.pick(GRAY, 0.55 + 0.32 * c.n.y + 0.7 * (noise(c.at, 0.07, 3) - 0.5));
  },
  { dither: true },
);

const BODYFUR = cellPaint(
  TEXEL,
  (c) => {
    if (c.n.z + 0.3 * (c.random(5) - 0.5) > 0.3 && c.at.y < 0.74)
      return c.pick(CREAM, 0.55 + 0.4 * (noise(c.at, 0.06, 8) - 0.5) + 0.2 * (c.random(6) - 0.5));
    if (c.random(1) < 0.05) return GRAY[0];
    if (c.random(2) > 0.96) return GRAY[4];
    return c.pick(GRAY, 0.5 + 0.32 * c.n.y + 0.7 * (noise(c.at, 0.07, 3) - 0.5));
  },
  { dither: true },
);

const MUZP = cellPaint(
  TEXEL,
  (c) => c.pick(MUZ, 0.5 + 0.5 * c.n.y + 0.6 * (noise(c.at, 0.05, 12) - 0.5)),
  { dither: true },
);
const CREAMP = cellPaint(
  TEXEL,
  (c) => c.pick(CREAM, 0.55 + 0.5 * (noise(c.at, 0.05, 14) - 0.5) + 0.3 * (c.random(4) - 0.5)),
  { dither: true },
);
const DARKP = cellPaint(TEXEL * 0.75, (c) => c.pick(DARK, 0.2 + 0.6 * c.random(7) + 0.2 * c.n.y), { dither: true });

const bark = (sx: number, sy: number, sz: number) =>
  cellPaint(TEXEL, (c) => {
    const q = new THREE.Vector3(c.at.x * sx, c.at.y * sy, c.at.z * sz);
    const v = noise(q, 0.09, 4);
    const w = noise(c.at, 0.2, 9);
    if (c.random(3) < 0.04) return "#5a4a3a";
    if (w > 0.66) return c.pick(MOSSY, 0.3 + 1.2 * (v - 0.4));
    return c.pick(BARKR, 0.3 + 1.1 * (v - 0.5) + 0.3 * (w - 0.5));
  });
const BARK_V = bark(1, 0.25, 1);
const BARK_H = bark(0.25, 1, 1);
const BARK_I = bark(1, 1, 1);

const MOSS = cellPaint(0.012, (c) => c.pick(GREENS, 0.1 + 0.9 * noise(c.at, 0.06, 2) + 0.2 * (c.random(1) - 0.5)));
const PEBBLE = cellPaint(0.012, (c) => c.pick(STONE, 0.5 + 0.5 * c.n.y + 0.4 * (c.random(2) - 0.5)), { dither: true });

const leafTex = (p: { a: string; b: string; c: string; rib: string }) =>
  pixelTexture(6, 12, (g) => {
    const hw = [1, 1, 2, 2, 3, 3, 3, 3, 2, 2, 1, 1];
    hw.forEach((h, y) => {
      for (let x = 3 - h; x < 3 + h; x++) {
        const edge = x === 3 - h || x === 2 + h;
        g.set(x, y, edge ? p.a : x === 2 || x === 3 ? p.rib : y % 3 === 1 ? p.c : p.b);
      }
    });
  });

export default function build() {
  const b = createBuilder({ name: "koala" });

  // ---------------------------------------------------------------- skeleton
  const base = b.joint("base", { at: [0, 0.05, 0] });
  const hips = b.joint("hips", { parent: base, at: [0, 0.5, -0.06], role: "spine" });
  const S = [
    [0, 0.5, -0.06],
    [0, 0.59, -0.05],
    [0, 0.68, -0.02],
    [0, 0.76, 0.03],
  ];
  const spine = b.chain("spine", catmull(S), { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" });
  const N1 = [0, 0.81, 0.065];
  const neck = b.chain("neck", [S[3], N1], { parent: spine, names: ["neck"], role: "neck" });
  const head = b.joint("head", { parent: neck, at: N1, dir: [0, 0.25, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.8, 0.12], aim: [0, 0.79, 0.2], role: "jaw" });
  const chest = spine.joints[2];

  // ---------------------------------------------------------------- helpers
  const ell = (
    at: number[],
    r: number[],
    color: string | Paint,
    bone: Joint,
    opts: { dir?: number[] } = {},
  ) =>
    b.part(new THREE.SphereGeometry(1, 10, 8), color, {
      bone,
      at,
      scale: r,
      flat: true,
      ...(opts.dir ? { dir: opts.dir, axis: "x" as const } : {}),
    });

  const TUFT_A = pixelArt([".b.", "bcb", "bcb", "ccc", "ccc"], { b: "#c3c8cf", c: "#8f949d" });
  const TUFT_B = pixelArt([".b.", "bcb", "bcb", "ccc", "ccc"], { b: "#f3efe2", c: "#cfc9b6" });
  const LEAF_A = leafTex({ a: "#2c5a32", b: "#4f8a4a", c: "#5f9c58", rib: "#8cc27a" });
  const LEAF_B = leafTex({ a: "#35625a", b: "#5a9a8a", c: "#6aaa98", rib: "#a4d4c0" });

  const fur = (
    target: Parameters<typeof b.surface>[0],
    count: number,
    seed: number,
    minDist: number,
    tex: typeof TUFT_A,
    filter: (h: { n: THREE.Vector3; at: THREE.Vector3 }) => boolean,
  ) => {
    const hits = b.surface(target).scatter(count, { rng: rng(seed), minDist, filter });
    b.cards(hits, tex, { size: [0.03, 0.05], lean: 60, vary: 0.25, spin: 20, rng: rng(seed + 1) });
  };

  const leaves = (sw: Sweep, n: number, t0: number, t1: number, size: [number, number], seed: number) => {
    const r = rng(seed);
    const frames = [];
    for (let i = 0; i < n; i++) frames.push(sw.at(t0 + ((t1 - t0) * (i + 0.5)) / n, (i * 137) % 360));
    b.cards(frames, [LEAF_A, LEAF_B], {
      size,
      lean: 50,
      bend: 35,
      flow: [0, -1, 0.25],
      vary: 0.25,
      spin: 25,
      rng: r,
      sink: 0.05,
    });
    b.cards([sw.at(1, 0)], [LEAF_A], { size, lean: 5, bend: 10, flow: [0, -1, 0.25], sink: 0.05 });
  };

  // ---------------------------------------------------------------- stand
  const woodTile = pixelTexture(64, 40, (g) => {
    const r = rng(5);
    g.fill((x, y) => {
      const m = y % 8;
      if (m === 0) return "#2e1c10";
      if (m === 1) return "#a67846";
      return pick(WOOD, 0.3 + 0.35 * r() + 0.15 * Math.sin(x * 0.3 + Math.floor(y / 8) * 2), bayer(x, y));
    });
    for (let p = 0; p < 5; p++) {
      g.set(2, p * 8 + 4, "#1d1410");
      g.set(61, p * 8 + 4, "#1d1410");
      g.set((p * 23 + p * p * 7) % 56 + 4, p * 8 + 5, "#3a2412");
    }
  });
  b.part(tileBox([1.0, 0.05, 0.62], woodTile, TEXEL), "#ffffff", { texture: woodTile, bone: base, at: [0, 0.025, 0.05] });
  for (const sx of [1, -1])
    for (const z of [-0.24, 0.34]) {
      b.part(new THREE.BoxGeometry(0.07, 0.012, 0.07), "#6c717a", { bone: base, at: [sx * 0.46, 0.056, z] });
      b.part(new THREE.BoxGeometry(0.02, 0.008, 0.02), "#2b2e35", { bone: base, at: [sx * 0.46, 0.064, z] });
    }
  const plaque = pixelTexture(28, 4, (g) => {
    g.fill((x, y) => (x === 0 || y === 0 || x === 27 || y === 3 ? "#c9a24b" : "#8a6a2a"));
    for (const x of [6, 13, 20]) {
      g.set(x, 1, "#cfe3a0");
      g.set(x + 1, 1, "#cfe3a0");
      g.set(x + 1, 2, "#6db23f");
    }
  });
  b.part(new THREE.BoxGeometry(0.24, 0.03, 0.008), "#ffffff", { texture: plaque, bone: base, at: [0, 0.025, 0.362] });

  const mossAt = [
    [-0.42, 0.2, 0.14, 0.1],
    [0.3, -0.15, 0.12, 0.09],
    [0.38, 0.25, 0.1, 0.08],
    [-0.22, -0.2, 0.13, 0.07],
    [0.1, 0.3, 0.1, 0.06],
  ];
  for (const [x, z, w, d] of mossAt) b.part(new THREE.BoxGeometry(w, 0.012, d), MOSS, { bone: base, at: [x, 0.056, z] });
  for (const [x, z, r] of [
    [-0.3, 0.27, 0.03],
    [0.2, -0.22, 0.04],
    [0.44, -0.05, 0.026],
  ])
    b.part(new THREE.SphereGeometry(r, 6, 5), PEBBLE, { bone: base, at: [x, 0.05 + r * 0.45, z], flat: true });
  const litter = [
    [-0.1, 0.25],
    [0.28, 0.12],
    [-0.35, -0.12],
    [0.05, -0.2],
    [0.4, 0.3],
    [-0.45, 0.28],
    [0.18, 0.3],
  ];
  b.cards(
    litter.map(([x, z]) => frame([x, 0.0525, z], [0, 1, 0])),
    [LEAF_A, LEAF_B],
    {
      size: [0.05, 0.12],
      lean: 90,
      flow: (_f, i) => [Math.cos(i * 2.1), 0, Math.sin(i * 2.1)],
      mirror: true,
      sink: 0,
    },
  );

  b.part(new THREE.BoxGeometry(0.17, 0.02, 0.17), BARK_V, { bone: base, at: [-0.4, 0.06, 0] });
  const trunk = b.sweep(
    [
      [-0.4, 0.05, 0],
      [-0.4, 0.3, 0],
    ],
    [0.062, 0.05],
    { color: BARK_V, bone: base, sides: 8, smooth: false, caps: { start: "flat", end: "round" } },
  );
  const limbSw = b.sweep(
    catmull([
      [-0.4, 0.3, 0],
      [-0.37, 0.352, 0],
      [-0.2, 0.364, 0],
      [0.1, 0.36, 0],
      [0.4, 0.37, 0],
      [0.53, 0.42, 0],
    ]),
    [0.05, 0.042, 0.037, 0.035, 0.03, 0.022],
    { color: BARK_H, bone: base, sides: 8, smooth: false },
  );
  // Sawn stub with ring-textured end.
  b.rod([-0.4, 0.2, 0.03], [-0.4, 0.23, 0.19], 0.02, { color: BARK_I, bone: base, sides: 8, smooth: false });
  const rings = pixelArt(
    ["..aaaa..", ".abbbba.", "abccccba", "abcddcba", "abcddcba", "abccccba", ".abbbba.", "..aaaa.."],
    { a: "#6a5a4a", b: "#d3c9ae", c: "#b89a68", d: "#8a6a3a" },
  );
  b.part(new THREE.CircleGeometry(0.02, 10), "#ffffff", {
    texture: rings,
    bone: base,
    at: [-0.4, 0.2305, 0.1925],
    dir: [0, 0.03, 0.16],
    axis: "z",
  });

  // The upright twig the koala holds.
  const twig = b.sweep(
    catmull([
      [0.02, 0.37, 0.0],
      [0.015, 0.43, 0.1],
      [0.0, 0.52, 0.21],
      [0, 0.62, 0.24],
      [0, 0.72, 0.24],
      [0, 0.84, 0.22],
    ]),
    [0.022, 0.012],
    { color: BARK_V, bone: base, sides: 8, smooth: false },
  );
  leaves(twig, 9, 0.72, 1, [0.07, 0.17], 21);

  const twigB = b.sweep(
    catmull([
      [0.53, 0.42, 0],
      [0.57, 0.52, 0.02],
      [0.6, 0.64, 0.0],
      [0.58, 0.78, -0.03],
    ]),
    [0.02, 0.008],
    { color: BARK_I, bone: base, sides: 6, smooth: false },
  );
  leaves(twigB, 12, 0.2, 1, [0.07, 0.17], 22);
  const twigC = b.sweep(
    catmull([
      [-0.4, 0.28, 0],
      [-0.45, 0.4, -0.04],
      [-0.52, 0.55, -0.05],
      [-0.5, 0.7, -0.03],
    ]),
    [0.018, 0.007],
    { color: BARK_I, bone: base, sides: 6, smooth: false },
  );
  leaves(twigC, 11, 0.3, 1, [0.07, 0.17], 23);
  const twigD = b.sweep(
    catmull([
      [0.3, 0.37, 0.0],
      [0.34, 0.5, 0.02],
      [0.4, 0.62, 0.04],
      [0.38, 0.74, 0.06],
    ]),
    [0.016, 0.007],
    { color: BARK_I, bone: base, sides: 6, smooth: false },
  );
  leaves(twigD, 10, 0.3, 1, [0.065, 0.16], 24);
  for (const [sw, t, a] of [
    [twigC, 0.35, 90],
    [twigC, 0.6, 250],
    [twigD, 0.45, 90],
    [twigD, 0.7, 270],
    [twigB, 0.5, 90],
  ] as const)
    b.stick(new THREE.SphereGeometry(0.013, 6, 5), GUM, sw.at(t, a), { embed: 0.3, flat: true });
  for (const [t, a] of [
    [0.4, 90],
    [0.75, 250],
  ] as const)
    b.stick(new THREE.SphereGeometry(0.02, 6, 4), "#3b2b1d", trunk.at(t, a), { embed: 0.7, flat: true });
  const peel = rng(31);
  for (let i = 0; i < 10; i++)
    b.stick(
      new THREE.BoxGeometry(0.05, 0.008, 0.03),
      i % 3 === 0 ? "#8d9a6a" : "#d9cfb0",
      limbSw.at(0.08 + 0.1 * i, (i * 83) % 360),
      { embed: 0.4, spin: peel() * 360 },
    );

  // ---------------------------------------------------------------- koala body
  const prof = (ks: number[]) => (t: number) => {
    const x = Math.min(Math.max(t, 0), 1) * (ks.length - 1);
    const i = Math.min(Math.floor(x), ks.length - 2);
    return ks[i] + (ks[i + 1] - ks[i]) * (x - i);
  };
  const rx = prof([0.118, 0.128, 0.105, 0.082]);
  const ry = prof([0.112, 0.12, 0.098, 0.08]);
  const body = b.sweep(spine, (t) => [rx(t), ry(t)], { color: BODYFUR, sides: 8, smooth: false });
  b.sweep(neck, [0.082, 0.078], { color: FUR, sides: 8, smooth: false });
  fur(body, 70, 3, 0.045, TUFT_A, (h) => h.n.y > -0.25 && h.at.y > 0.45 && h.n.z < 0.3);
  fur(body, 40, 5, 0.05, TUFT_B, (h) => h.at.y > 0.45 && h.n.z > 0.3);

  // ---------------------------------------------------------------- head
  const H = [0, 0.86, 0.085];
  const skull = ell(H, [0.098, 0.085, 0.088], FUR, head);
  ell([0, 0.842, 0.158], [0.052, 0.037, 0.05], MUZP, head);
  ell([0, 0.866, 0.206], [0.036, 0.028, 0.026], NOSE, head);
  b.part(new THREE.BoxGeometry(0.008, 0.008, 0.008), "#8d93a0", { bone: head, at: [0.012, 0.876, 0.226] });
  ell([0, 0.793, 0.16], [0.04, 0.018, 0.042], CREAMP, jaw);
  b.part(new THREE.BoxGeometry(0.05, 0.006, 0.034), "#1b1214", { bone: head, at: [0, 0.805, 0.188] });
  const EYE = pixelArt([".kk.", "kwkk", "kkkk", ".kk."], { k: "#0d0d12", w: "#ffffff" });
  for (const s of [1, -1]) {
    ell([s * 0.078, 0.826, 0.118], [0.03, 0.032, 0.04], CREAMP, head);
    b.part(new THREE.BoxGeometry(0.032, 0.032, 0.008), "#ffffff", {
      texture: EYE,
      bone: head,
      at: [s * 0.052, 0.878, 0.158],
      dir: [s * 0.4, 0, 1],
      axis: "z",
    });
    // brow ridge
    b.part(new THREE.BoxGeometry(0.036, 0.008, 0.012), "#3d4048", {
      bone: head,
      at: [s * 0.052, 0.9, 0.152],
    });
    const ec = [s * 0.108, 0.925, 0.055];
    const ed = [s, 0.35, 0.25];
    ell(ec, [0.022, 0.066, 0.062], FUR, head, { dir: ed });
    const dn = new THREE.Vector3(...ed).normalize();
    ell([ec[0] + dn.x * 0.01, ec[1] + dn.y * 0.01, ec[2] + dn.z * 0.01], [0.02, 0.052, 0.048], CREAMP, head, {
      dir: ed,
    });
    b.ring(frame(ec, ed), { count: 12, radius: 0.062 }, (item) =>
      b.part(new THREE.BoxGeometry(0.02, 0.02, 0.02), item.i % 2 ? "#e9e5d6" : "#cfcabb", { at: item, bone: head }),
    );
  }
  fur(skull, 34, 11, 0.035, TUFT_A, (h) => h.n.z < 0.55 && h.n.y > -0.1);

  // ---------------------------------------------------------------- arms and hands
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = [s * 0.1, 0.69, 0.0];
    const hy = s > 0 ? 0.65 : 0.59;
    const hand = [s * 0.035, hy, 0.2];
    const pts = limb(sh, hand, [0.15, 0.13], [[s, -0.6, -0.1]]);
    const arm = b.chain(`arm${side}`, pts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `hand${side}`],
      role: "arm",
    });
    const armSw = b.sweep(arm, [0.05, 0.032], { color: FUR, sides: 8, smooth: false });
    ell([s * 0.1, 0.7, 0.0], [0.055, 0.055, 0.05], FUR, chest);
    const handJ = arm.tip!;
    ell(hand, [0.03, 0.03, 0.03], DARKP, handJ);
    for (let k = 0; k < 3; k++) {
      const y = hy + (k - 1) * 0.022;
      const ring = [30, 90, 150].map((a) => {
        const rad = (a * Math.PI) / 180;
        return [s * 0.027 * Math.sin(rad), y, 0.24 - 0.027 * Math.cos(rad)];
      });
      const fp = [[s * 0.035, y, 0.2], ...ring];
      const f = b.chain(`f${k}${side}`, fp, {
        parent: handJ,
        names: [`f${k}${side}a`, `f${k}${side}b`, `f${k}${side}c`],
        role: "digit",
      });
      b.sweep(f, [0.012, 0.008], { color: DARKP, sides: 6, smooth: false });
      b.spike(
        fp[3],
        [fp[3][0] - fp[2][0], 0, fp[3][2] - fp[2][2]],
        0.02,
        0.006,
        CLAW,
        { bone: f.joints[2] },
      );
    }
    fur(armSw, 10, 40 + (s > 0 ? 0 : 1), 0.04, TUFT_A, (h) => h.n.y > -0.3);
  }

  // ---------------------------------------------------------------- legs and feet
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hp = [s * 0.09, 0.5, -0.06];
    const ft = [s * 0.11, 0.405, 0.035];
    const pts = limb(hp, ft, [0.15, 0.13], [[s * 0.6, -0.1, 1]]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `foot${side}`],
      role: "leg",
    });
    const legSw = b.sweep(leg, [0.065, 0.04], { color: FUR, sides: 8, smooth: false });
    const footJ = leg.tip!;
    ell(ft, [0.032, 0.026, 0.04], DARKP, footJ);
    for (let k = 0; k < 3; k++) {
      const x = s * 0.11 + (k - 1) * 0.024;
      const tp = [35, 80, 125, 165].map((a) => {
        const rad = (a * Math.PI) / 180;
        return [x, 0.362 + 0.046 * Math.cos(rad), 0.046 * Math.sin(rad)];
      });
      const t = b.chain(`toe${k}${side}`, tp, {
        parent: footJ,
        names: [`toe${k}${side}a`, `toe${k}${side}b`, `toe${k}${side}c`],
        role: "digit",
      });
      b.sweep(t, [0.012, 0.008], { color: DARKP, sides: 6, smooth: false });
      b.spike(
        tp[3],
        [0, tp[3][1] - tp[2][1], tp[3][2] - tp[2][2]],
        0.02,
        0.006,
        CLAW,
        { bone: t.joints[2] },
      );
    }
    fur(legSw, 14, 60 + (s > 0 ? 0 : 1), 0.045, TUFT_A, (h) => h.n.y > -0.3);
  }

  return b.root;
}
