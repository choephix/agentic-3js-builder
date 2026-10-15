import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { noise } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import type { SweepPoint } from "../../../../src/sweep";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, snapColor, tileBox } from "../../../../kits/pixel";

export const meta = {
  name: "Koala on Eucalyptus Stand",
  description:
    "A pixel-art koala sitting on a eucalyptus branch stand: feet wrapped round the lower branch, hands gripping the upper one, dithered grey fur with cream chest and fluffy ears, on a mossy wooden plinth.",
  style: "pixel art",
  commit: "88fc1f0",
};

const TEXEL = 0.016;
const D2R = Math.PI / 180;
const snap = (c: string) => snapColor(c, 64);

const FURS = ["#2f3238", "#454951", "#5d626b", "#7a7f88", "#9a9ea6", "#b9bcc2"].map(snap);
const CREAMS = ["#a9a79f", "#c8c6bd", "#e1dfd6", "#f2f0e8"].map(snap);
const BARKS = ["#4a3b2e", "#6a553f", "#8c7655", "#b5a07a", "#cfc3a2", "#9fae8c"].map(snap);
const MOSSES = ["#1f3d1c", "#2c5726", "#3f7a31", "#5a9c3f", "#7bb84e"].map(snap);
const WOODS = ["#4a2f1c", "#5e3b22", "#774a2a", "#8f5c33", "#a87141"].map(snap);
const FUR_DARK = snap("#3c3f46");
const CLAW = snap("#e4d8b8");
const NOSE = snap("#15151a");
const INNER = snap("#efece4");

const FUR_BODY = cellPaint(
  TEXEL,
  (c) => {
    const n = noise(c.at, 0.07, 3);
    const r = c.random(1);
    if (r < 0.05) return FURS[5];
    if (r > 0.96) return FURS[0];
    const chest = c.n.z > 0.2 && c.at.y > 0.42 && c.at.y < 0.64 && Math.abs(c.at.x) < 0.14;
    if (chest) return c.pick(CREAMS, 0.55 + (n - 0.5) * 0.9);
    const rump = c.at.z < -0.1 && c.at.y < 0.5 && n > 0.58;
    if (rump) return c.pick(CREAMS, 0.35 + (n - 0.5));
    return c.pick(FURS, 0.5 + (n - 0.5) * 0.9 + 0.12 * c.n.y);
  },
  { dither: true },
);

const FUR_HEAD = cellPaint(
  TEXEL,
  (c) => {
    const n = noise(c.at, 0.06, 8);
    const r = c.random(2);
    if (r < 0.05) return FURS[5];
    if (r > 0.96) return FURS[0];
    if (c.at.y < 0.72 && c.n.z > -0.2) return c.pick(CREAMS, 0.6 + (n - 0.5) * 0.8);
    return c.pick(FURS, 0.5 + (n - 0.5) * 0.9 + 0.15 * c.n.y);
  },
  { dither: true },
);

const FUR_EAR = cellPaint(
  TEXEL,
  (c) => c.pick(FURS.slice(0, 4), 0.4 + (noise(c.at, 0.05, 6) - 0.5) * 1.2 + (c.random(7) - 0.5) * 0.3),
  { dither: true },
);

const bark = (axis: 0 | 1 | 2) =>
  cellPaint(
    0.014,
    (c) => {
      const q = c.at.clone();
      if (axis === 0) q.x *= 0.2;
      else if (axis === 1) q.y *= 0.2;
      else q.z *= 0.2;
      const v = noise(q, 0.07, 5);
      const r = c.random(4);
      if (r < 0.04) return BARKS[0];
      if (v > 0.68 && noise(q, 0.1, 11) > 0.5) return BARKS[5];
      return c.pick(BARKS.slice(0, 5), 0.15 + v * 0.9);
    },
    { dither: true },
  );

const MOSS = cellPaint(
  0.02,
  (c) => c.pick(MOSSES, 0.3 + (noise(c.at, 0.15, 9) - 0.5) * 1.2 + (c.random(5) - 0.5) * 0.3),
  { dither: true },
);

// Textures
const EYE = pixelArt([".kk.", "kkkk", "kkwk", ".kk."], { k: "#0c0c10", w: "#ffffff" });
const TUFT = pixelArt(["...#...", "...#...", "..###..", "..###..", ".#####.", ".#####.", "#######", "#######"], {
  "#": "#ffffff",
});
const leafRows = [
  "...dg.",
  "..dgg.",
  "..dgg.",
  ".dglg.",
  ".dglgg",
  ".dglg.",
  ".dgg..",
  ".dgg..",
  "..dg..",
  "..dg..",
  "..dg..",
  "...d..",
  "...d..",
  "...d..",
];
const LEAF_A = pixelArt(leafRows, { d: "#3f6b5c", g: "#6a9a82", l: "#a9cbb2" });
const LEAF_B = pixelArt(leafRows, { d: "#2f5a4a", g: "#548a6e", l: "#8fbf9c" });
const GRASS = pixelArt([".g..g", ".g.gg", "gg.g.", "ggggg", "ggggg"], { g: "#4f9a3a" });

const WOOD_TILE = pixelTexture(64, 40, (g) => {
  const r = rng(21);
  g.fill((x, y) => {
    if (y % 8 === 0) return WOODS[0];
    if (y % 8 === 1) return WOODS[4];
    const streak = (x * 7 + Math.floor(y / 8) * 13) % 23 < 2 ? 0.12 : 0;
    return pick(WOODS, 0.45 + 0.25 * r() - streak, bayer(x, y));
  });
  for (let row = 0; row < 5; row++) {
    g.set(3 + row * 5, row * 8 + 4, "#2a1a10");
    g.set(60 - row * 4, row * 8 + 4, "#2a1a10");
  }
});

const PLAQUE = pixelTexture(16, 6, (g) => {
  g.fill(() => "#d8a93a");
  g.fill(() => "#2a2016", [1, 1, 14, 4]);
  g.stamp(4, 2, [".ggg....", "gggggggg", ".ggg...."], { g: "#7fb08a" });
  g.set(13, 2, "#d8a93a");
  g.set(13, 4, "#d8a93a");
});

export default function build() {
  const b = createBuilder({ name: "koala" });
  const GROUND = 0.081;

  // ---- skeleton ---------------------------------------------------------------------------------------------
  const base = b.joint("base", { at: [0, GROUND, 0] });
  const hips = b.joint("hips", { parent: base, at: [0, 0.4, -0.05], dir: [0, 1, 0.2] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.4, -0.05],
      [0, 0.47, -0.03],
      [0, 0.56, 0.02],
      [0, 0.63, 0.06],
    ],
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    [
      [0, 0.63, 0.06],
      [0, 0.66, 0.09],
    ],
    { parent: chest, names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 0.66, 0.09], dir: [0, 0.45, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.65, 0.17], aim: [0, 0.64, 0.27], role: "jaw" });

  const blob = (
    color: string | Paint,
    at: number[],
    r: number[],
    bone: Joint,
    rotation: number[] = [0, 0, 0],
    w = 12,
    h = 8,
  ) => b.part(new THREE.SphereGeometry(1, w, h), color, { bone, at, scale: r, rotation });

  // ---- stand: plinth, trunk, branches ---------------------------------------------------------------------
  b.part(tileBox([1.0, 0.06, 0.6], WOOD_TILE, 0.0166, { rand: rng(22), step: [1, 8] }), "#ffffff", {
    texture: WOOD_TILE,
    bone: base,
    at: [0, 0.03, 0],
  });
  b.part(new THREE.BoxGeometry(0.92, 0.022, 0.52), MOSS, { bone: base, at: [0, 0.07, 0] });
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.part(new THREE.BoxGeometry(0.07, 0.064, 0.07), "#2f1e12", { bone: base, at: [sx * 0.465, 0.032, sz * 0.265] });
  b.part(new THREE.PlaneGeometry(0.24, 0.09), "#ffffff", {
    texture: PLAQUE,
    bone: base,
    at: [0, 0.032, 0.302],
    dir: [0, 0, 1],
    axis: "z",
  });

  const trunk = b.sweep(
    catmull([
      [-0.4, 0.05, 0.05],
      [-0.41, 0.3, 0.05],
      [-0.38, 0.58, 0.05],
      [-0.35, 0.82, 0.05],
    ]),
    [0.055, 0.045, 0.032, 0.016],
    { color: bark(1), bone: base },
  );
  const lowerBranch = b.sweep(
    catmull([
      [-0.4, 0.23, 0.04],
      [-0.28, 0.26, 0.02],
      [0.0, 0.26, 0.02],
      [0.2, 0.26, 0.02],
      [0.44, 0.26, 0.02],
    ]),
    [0.04, 0.036, 0.034, 0.03, 0.022],
    { color: bark(0), bone: base },
  );
  const upperBranch = b.sweep(
    catmull([
      [-0.39, 0.5, 0.05],
      [-0.33, 0.575, 0.17],
      [-0.22, 0.6, 0.2],
      [0.0, 0.6, 0.2],
      [0.4, 0.6, 0.2],
    ]),
    [0.032, 0.028, 0.026, 0.024, 0.018],
    { color: bark(0), bone: base },
  );
  b.rod([0.3, 0.07, 0.02], [0.3, 0.235, 0.02], 0.028, bark(1), { bone: base });
  const twig = b.sweep(
    [
      [0.4, 0.6, 0.2],
      [0.46, 0.7, 0.2],
      [0.5, 0.8, 0.18],
    ],
    [0.014, 0.006],
    { color: bark(1), bone: base, caps: { start: "round", end: "point" } },
  );
  // knots and stubs on the trunk
  b.spike([-0.43, 0.4, 0.05], [-1, 0.6, 0.1], 0.08, 0.016, bark(1), { bone: base, sides: 6 });
  b.spike([-0.4, 0.7, 0.07], [-0.5, 0.7, 1], 0.07, 0.013, bark(1), { bone: base, sides: 6 });
  b.spike([-0.36, 0.13, 0.08], [0, 0.4, 1], 0.07, 0.013, bark(1), { bone: base, sides: 6 });

  // gumnuts
  for (const [sw, t, a] of [
    [upperBranch, 0.9, 180],
    [upperBranch, 0.84, 150],
    [lowerBranch, 0.9, 180],
    [lowerBranch, 0.85, 200],
    [twig, 0.5, 180],
  ] as const)
    b.stick(new THREE.SphereGeometry(0.014, 6, 4), snap("#6b5a3a"), sw.at(t, a), { embed: 0.3, bone: base });

  // eucalyptus leaves
  const leafFrames: SweepPoint[] = [];
  for (const t of [0.08, 0.14]) leafFrames.push(upperBranch.at(t, 20));
  for (let i = 0; i < 9; i++) leafFrames.push(upperBranch.at(0.78 + i * 0.027, (i % 5) * 30 - 60));
  for (let i = 0; i < 6; i++) leafFrames.push(lowerBranch.at(0.82 + i * 0.03, (i % 3) * 50 - 50));
  for (let i = 0; i < 8; i++) leafFrames.push(trunk.at(0.62 + i * 0.05, (i % 4) * 40 - 60));
  for (let i = 0; i < 5; i++) leafFrames.push(twig.at(0.5 + i * 0.1, (i % 3) * 60 - 60));
  b.cards(leafFrames, [LEAF_A, LEAF_B], {
    size: [0.05, 0.16],
    lean: 75,
    bend: 50,
    flow: (_f, i) => [Math.cos(i * 2.4), -0.2, Math.sin(i * 2.4)],
    vary: 0.25,
    spin: 20,
    rng: rng(5),
    cross: true,
    bone: base,
  });

  // ground dressing
  const r33 = rng(33);
  const litter = Array.from({ length: 14 }, () =>
    frame([r33() * 0.8 - 0.4, GROUND + 0.002, r33() * 0.44 - 0.22], [0, 1, 0]),
  );
  b.cards(litter, [LEAF_A, LEAF_B], {
    size: [0.05, 0.13],
    lean: 90,
    flow: (_f, i) => [Math.cos(i * 1.9), 0, Math.sin(i * 1.9)],
    mirror: true,
    bone: base,
    rng: rng(34),
    sink: 0,
  });
  const r35 = rng(35);
  const grass = Array.from({ length: 30 }, (_, i) =>
    frame([(i % 2 ? 1 : -1) * (0.3 + r35() * 0.15), GROUND, r35() * 0.46 - 0.23], [0, 1, 0]),
  );
  b.cards(grass, GRASS, {
    size: [0.045, 0.07],
    lean: 15,
    flow: (_f, i) => [Math.cos(i * 2.1), 0, Math.sin(i * 2.1)],
    vary: 0.3,
    rng: rng(36),
    cross: true,
    bone: base,
  });
  for (const [x, z, bg, sg] of [
    [-0.3, 0.18, 0.9, 1],
    [-0.24, 0.24, 0.6, 0.8],
  ] as const) {
    b.part(new THREE.CylinderGeometry(0.012 * sg, 0.014 * sg, 0.04 * sg + 0.01, 6), "#e8dcc4", {
      bone: base,
      at: [x, GROUND + 0.02, z],
    });
    b.part(new THREE.SphereGeometry(0.035 * bg, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), "#c0392b", {
      bone: base,
      at: [x, GROUND + 0.04 * sg + 0.008, z],
    });
    b.part(new THREE.BoxGeometry(0.01, 0.006, 0.01), "#f4efe0", {
      bone: base,
      at: [x + 0.01, GROUND + 0.04 * sg + 0.008 + 0.03 * bg, z + 0.005],
    });
  }
  const r37 = rng(37);
  for (let i = 0; i < 6; i++)
    b.part(new THREE.BoxGeometry(0.03 + r37() * 0.03, 0.02 + r37() * 0.015, 0.03 + r37() * 0.03), i % 2 ? "#8a8f96" : "#6c7178", {
      bone: base,
      at: [0.1 + r37() * 0.35, GROUND + 0.008, 0.18 + r37() * 0.07],
      rotation: [0, r37() * 90, 0],
    });

  // ---- koala torso -----------------------------------------------------------------------------------------
  const body = b.loft(
    [
      { at: [0, 0.4, -0.05], w: 0.22, h: 0.22 },
      { at: [0, 0.47, -0.03], w: 0.31, h: 0.3 },
      { at: [0, 0.56, 0.02], w: 0.3, h: 0.25 },
      { at: [0, 0.63, 0.06], w: 0.2, h: 0.18 },
    ],
    { color: FUR_BODY, bone: spine },
  );

  // chest tufts
  const chestHits = b.surface(body).scatter(40, {
    rng: rng(13),
    minDist: 0.04,
    filter: (h) => h.n.z > 0.35 && h.at.y > 0.44 && h.at.y < 0.62 && Math.abs(h.at.x) < 0.12,
  });
  b.cards(chestHits, TUFT, { size: [0.04, 0.05], lean: 80, flow: [0, -1, 0], color: "#f0eee6", rng: rng(14) });

  // ---- head ------------------------------------------------------------------------------------------------
  const skull = blob(FUR_HEAD, [0, 0.73, 0.125], [0.13, 0.11, 0.115], head, [0, 0, 0], 16, 12);
  blob(FUR_HEAD, [0, 0.69, 0.215], [0.072, 0.05, 0.065], head);
  blob(NOSE, [0, 0.705, 0.268], [0.05, 0.034, 0.04], head, [0, 0, 0], 10, 6);
  b.part(new THREE.BoxGeometry(0.02, 0.006, 0.012), "#4b5160", { bone: head, at: [0.012, 0.737, 0.268] });
  b.part(new THREE.BoxGeometry(0.09, 0.03, 0.085), FUR_HEAD, { bone: jaw, at: [0, 0.648, 0.225] });
  b.part(new THREE.BoxGeometry(0.085, 0.006, 0.02), "#241a1c", { bone: jaw, at: [0, 0.664, 0.262] });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.036, 0.036), "#ffffff", {
      texture: EYE,
      bone: head,
      at: [s * 0.065, 0.755, 0.224],
      dir: [s * 0.35, 0, 1],
      axis: "z",
    });
    b.part(new THREE.BoxGeometry(0.045, 0.008, 0.012), FURS[1], {
      bone: head,
      at: [s * 0.068, 0.785, 0.205],
      rotation: [0, 0, -s * 12],
    });
  }
  // ears
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${side}`, { parent: head, at: [s * 0.115, 0.78, 0.1], dir: [s * 0.35, 1, 0] });
    const earPart = blob(FUR_EAR, [s * 0.125, 0.8, 0.1], [0.04, 0.075, 0.07], ear, [0, 0, -s * 16]);
    blob(INNER, [s * 0.136, 0.8, 0.14], [0.02, 0.055, 0.045], ear, [0, 0, -s * 16], 8, 6);
    const rim = b.surface(earPart).scatter(14, { rng: rng(40 + (s > 0 ? 1 : 2)), minDist: 0.02, filter: (h) => h.n.y > 0.2 });
    b.cards(rim, TUFT, { size: [0.03, 0.05], lean: 40, color: "#f2f0e8", rng: rng(44) });
  }
  // cheek ruff
  const cheek = b.surface(skull).scatter(46, {
    rng: rng(11),
    minDist: 0.028,
    filter: (h) => Math.abs(h.n.x) > 0.55 && h.at.y < 0.76 && h.at.y > 0.64,
  });
  b.cards(cheek, TUFT, { size: [0.035, 0.045], lean: 70, flow: [0, -0.2, -1], color: "#e6e8e6", rng: rng(12) });

  // ---- limbs -----------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // arm: shoulder to hand on the upper branch
    blob(FUR_BODY, [s * 0.15, 0.57, 0.04], [0.065, 0.07, 0.07], chest);
    const armPts = limb([s * 0.15, 0.57, 0.04], [s * 0.1, 0.625, 0.175], [0.14, 0.13], [s * 0.6, -1, 0.2]);
    const arm = b.chain(`arm${side}`, armPts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `hand${side}`],
      role: "arm",
    });
    b.sweep(arm, [0.058, 0.048, 0.04, 0.036], { color: FUR_BODY });
    const hand = arm.joints[2];
    blob(FUR_DARK, [s * 0.1, 0.622, 0.178], [0.04, 0.036, 0.04], hand);
    for (let k = 0; k < 4; k++) {
      const fx = s * 0.1 + (k - 1.5) * 0.02;
      const pts = [-30, 5, 70, 135].map((a) => [fx, 0.6 + 0.037 * Math.cos(a * D2R), 0.2 + 0.037 * Math.sin(a * D2R)]);
      const finger = b.chain(`finger${side}${k}`, pts, {
        parent: hand,
        names: [`f${side}${k}a`, `f${side}${k}b`, `f${side}${k}c`],
        role: "digit",
      });
      b.sweep(finger, [0.012, 0.009, 0.008, 0.006], { color: FUR_DARK, sides: 6 });
      b.spike(pts[3], [fx, 0.6 + 0.037 * Math.cos(170 * D2R), 0.2 + 0.037 * Math.sin(170 * D2R)], null, 0.006, CLAW, {
        bone: finger.joints[2],
        sides: 5,
      });
    }

    // leg: hip to foot gripping the lower branch
    blob(FUR_BODY, [s * 0.13, 0.4, -0.03], [0.075, 0.075, 0.085], hips);
    const footAt = [s * 0.17, 0.26 + 0.046 * Math.cos(-35 * D2R), 0.02 + 0.046 * Math.sin(-35 * D2R)];
    const legPts = limb([s * 0.13, 0.38, -0.04], footAt, [0.11, 0.1], [s * 0.5, 0.8, 1]);
    const leg = b.chain(`leg${side}`, legPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    b.sweep(leg, [0.062, 0.052, 0.042, 0.038], { color: FUR_BODY });
    const ankle = leg.joints[2];
    blob(FUR_DARK, footAt, [0.042, 0.032, 0.045], ankle);
    for (let k = 0; k < 4; k++) {
      const fx = s * 0.17 + (k - 1.5) * 0.022;
      const pts = [-35, 5, 65, 125].map((a) => [fx, 0.26 + 0.046 * Math.cos(a * D2R), 0.02 + 0.046 * Math.sin(a * D2R)]);
      const toe = b.chain(`toe${side}${k}`, pts, {
        parent: ankle,
        names: [`t${side}${k}a`, `t${side}${k}b`, `t${side}${k}c`],
        role: "digit",
      });
      b.sweep(toe, [0.014, 0.011, 0.009, 0.007], { color: FUR_DARK, sides: 6 });
      b.spike(pts[3], [fx, 0.26 + 0.046 * Math.cos(165 * D2R), 0.02 + 0.046 * Math.sin(165 * D2R)], null, 0.006, CLAW, {
        bone: toe.joints[2],
        sides: 5,
      });
    }
  }

  return b.root;
}
