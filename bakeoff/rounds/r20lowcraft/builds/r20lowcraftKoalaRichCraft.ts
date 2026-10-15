import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { noise } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, snapColor, tileBox } from "../../../../kits/pixel";

export const meta = {
  name: "Koala on Eucalyptus Branch Stand",
  description:
    "A chunky pixel-art koala sitting on a eucalyptus branch, gripping a front branch with both hands, mounted on a wooden display plinth.",
  style: "pixel art",
  commit: "88fc1f0",
};

const snap = (c: string) => snapColor(c, 32);
const GREY = ["#2c2f36", "#454952", "#626872", "#818792", "#a3a9b3", "#c2c7cf"].map((c) => snap(c));
const LIGHT = ["#818792", "#a3a9b3", "#c2c7cf", "#dfe3e8"].map((c) => snap(c));
const CREAM = ["#8f8a80", "#b3aea3", "#d2cdc1", "#ece7da", "#faf6ea"].map((c) => snap(c));
const BARK = ["#4d4636", "#6a644f", "#8a846b", "#a8a28a", "#c6c0a6"].map((c) => snap(c));
const WOODP = ["#2b1a12", "#43291b", "#5e3b26", "#7a4f33", "#946342"].map((c) => snap(c));
const RUST = snap("#9a5a3c");
const SAGE = snap("#8da07e");
const HAND = "#2e3036";
const CLAW = "#e9e1cb";
const CUT = "#d9d2b4";

const FUR = cellPaint(
  0.02,
  (c) => c.pick(GREY, 0.5 + 0.3 * c.n.y + 0.7 * (noise(c.at, 0.1, 7) - 0.5) + 0.25 * (c.random(2) - 0.5)),
  { dither: true },
);
const BODY = cellPaint(
  0.02,
  (c) => {
    const front = c.n.z > 0.3 && c.at.y > 0.72 && c.at.y < 1.06;
    if (front) return c.pick(CREAM, 0.45 + 0.5 * (noise(c.at, 0.08, 4) - 0.3) + 0.2 * (c.random(4) - 0.5));
    return c.pick(GREY, 0.5 + 0.3 * c.n.y + 0.7 * (noise(c.at, 0.1, 7) - 0.5) + 0.25 * (c.random(2) - 0.5));
  },
  { dither: true },
);
const FACE = cellPaint(
  0.02,
  (c) => c.pick(LIGHT, 0.35 + 0.4 * c.n.y + 0.5 * (c.random(3) - 0.5)),
  { dither: true },
);
const BARKP = cellPaint(
  0.02,
  (c) => {
    const q = new THREE.Vector3(c.at.x * 3, c.at.y * 0.35, c.at.z * 3);
    const n1 = noise(q, 0.09, 3);
    const n2 = noise(c.at, 0.15, 9);
    if (c.random(5) < 0.05) return RUST;
    if (n2 > 0.66) return SAGE;
    return c.pick(BARK, 0.2 + 0.8 * n1);
  },
  { dither: true },
);

const EYE = pixelArt([".kkk.", "kkwkk", "kkkkk", ".kkk."], { k: "#0d0c10", w: "#ffffff" });
const NOSE = pixelArt(
  [".kkkkkk.", "kkhhkkkk", "kkhkkkkk", "kkkkkkkk", ".kkkkkk."],
  { k: "#16131a", h: "#6a6670" },
);
const LEAF1 = pixelArt(
  [
    "..g..",
    "..gg.",
    ".gLg.",
    ".gLg.",
    ".gLLg",
    "gLLLg",
    "gLlLg",
    "gLLLg",
    ".gLLg",
    ".gLg.",
    ".gLg.",
    ".gLg.",
    "..gg.",
    "..g..",
  ],
  { g: "#2f5a4a", L: "#5d8f78", l: "#a6c8b0" },
);
const LEAF2 = pixelArt(
  [
    "..g..",
    "..gg.",
    ".gLg.",
    ".gLg.",
    ".gLLg",
    "gLLLg",
    "gLlLg",
    "gLLLg",
    ".gLLg",
    ".gLg.",
    ".gLg.",
    ".gLg.",
    "..gg.",
    "..g..",
  ],
  { g: "#3d6b55", L: "#7aa890", l: "#c0dcc8" },
);
const TUFT_G = pixelArt(["..a..", ".abb.", ".abb.", "abbba", "bbbbb"], { a: "#4a4e57", b: "#8a909a" });
const TUFT_C = pixelArt(["..a..", ".abb.", ".abb.", "abbba", "bbbbb"], { a: "#cfc9bb", b: "#f2eee2" });
const STRIP = pixelArt(["..a", ".ab", ".ab", "abb", "abb", ".bb", ".b."], { a: "#b4ae96", b: "#d8d2b8" });
const WOOD = pixelTexture(48, 32, (g) => {
  g.fill((x, y) => {
    const row = Math.floor(y / 8);
    if (y % 8 === 0) return WOODP[0];
    const n = (x * 7 + row * 13 + (x >> 2) * 5) % 9;
    return pick(WOODP, 0.35 + 0.12 * (row % 3) + 0.03 * n + (y % 8 === 1 ? 0.15 : 0), bayer(x, y));
  });
  for (let r = 0; r < 4; r++) {
    g.set(2, r * 8 + 4, "#1d120c");
    g.set(45, r * 8 + 4, "#1d120c");
  }
});
const PLATE = pixelTexture(20, 8, (g) => {
  g.fill((x, y) => (x === 0 || y === 0 || x === 19 || y === 7 ? "#8a6a1e" : (x + y) % 5 === 0 ? "#f0d060" : "#d8b440"));
  g.stamp(4, 2, ["..g....g....g", ".ggg..ggg..ggg", "..g....g....g"], { g: "#3a5a2a" });
});

export default function build() {
  const b = createBuilder({ name: "koala", paintSize: 2048 });
  const R = rng(5);

  // ---------------------------------------------------------------- skeleton
  const pelvis = b.joint("pelvis", { at: [0, 0.66, -0.06], role: "spine" });
  const SPINE = [
    [0, 0.66, -0.06],
    [0, 0.8, -0.02],
    [0, 0.97, 0.04],
    [0, 1.07, 0.09],
  ];
  const spine = b.chain("spine", catmull(SPINE), {
    parent: pelvis,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });
  const neck = b.joint("neck", { parent: spine.joints[2], at: [0, 1.03, 0.08], aim: [0, 1.12, 0.12], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.07, 0.09], aim: [0, 1.2, 0.25], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.11, 0.17], aim: [0, 1.09, 0.28], role: "jaw" });
  const stand = b.joint("stand", { parent: pelvis, at: [0, 0.05, -0.1], dir: [0, 1, 0] });

  // ---------------------------------------------------------------- stand: plinth, plate
  b.part(tileBox([1.1, 0.06, 0.7], WOOD, 0.02), "#ffffff", { texture: WOOD, bone: stand, at: [0, 0.03, -0.05] });
  b.part(tileBox([0.94, 0.04, 0.54], WOOD, 0.02), "#ffffff", { texture: WOOD, bone: stand, at: [0, 0.08, -0.05] });
  b.part(new THREE.PlaneGeometry(0.22, 0.04), "#ffffff", {
    texture: PLATE,
    bone: stand,
    at: [0, 0.03, 0.302],
    dir: [0, 0, 1],
    axis: "z",
  });
  for (const [x, z] of [
    [0.3, 0.14],
    [-0.35, 0.1],
    [0.1, 0.2],
    [-0.15, 0.17],
    [0.38, -0.2],
  ])
    b.part(new THREE.BoxGeometry(0.05, 0.008, 0.03), x > 0.2 ? "#6a7a3a" : "#8a6a3a", {
      bone: stand,
      at: [x, 0.104, z],
      rotation: [0, x * 120, 0],
    });

  // ---------------------------------------------------------------- eucalyptus branches
  const trunk = b.sweep(
    catmull([
      [0, 0.09, -0.28],
      [0.01, 0.5, -0.29],
      [0, 0.9, -0.3],
      [-0.03, 1.35, -0.28],
    ]),
    [0.09, 0.07, 0.055, 0.035],
    { bone: stand, color: BARKP, sides: 8, caps: { start: "flat", end: "round" } },
  );
  b.part(new THREE.CylinderGeometry(0.115, 0.13, 0.04, 8), BARK[1], { bone: stand, at: [0, 0.12, -0.28] });
  b.rod([-0.5, 0.5, -0.03], [0.5, 0.5, -0.03], 0.045, { bone: stand, color: BARKP, sides: 8 });
  b.rod([0, 0.45, -0.28], [0, 0.5, -0.04], 0.04, { bone: stand, color: BARKP, sides: 8 });
  b.rod([-0.5, 0.8, 0.4], [0.5, 0.8, 0.4], 0.035, { bone: stand, color: BARKP, sides: 8 });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.043, 0.043, 0.012, 8), CUT, {
      bone: stand,
      at: [s * 0.505, 0.5, -0.03],
      dir: [1, 0, 0],
    });
    b.part(new THREE.CylinderGeometry(0.033, 0.033, 0.012, 8), CUT, {
      bone: stand,
      at: [s * 0.505, 0.8, 0.4],
      dir: [1, 0, 0],
    });
    b.sweep(
      catmull([
        [s * 0.46, 0.5, -0.03],
        [s * 0.52, 0.6, 0.1],
        [s * 0.52, 0.73, 0.3],
        [s * 0.48, 0.8, 0.4],
      ]),
      0.036,
      { bone: stand, color: BARKP, sides: 8 },
    );
    // upper branches off the trunk
    const br = [
      [0, 0.95 + (s < 0 ? 0.1 : 0), -0.3],
      [s * 0.22, 1.08 + (s < 0 ? 0.1 : 0), -0.3],
      [s * 0.4, 1.2 + (s < 0 ? 0.08 : 0), -0.26],
      [s * 0.52, 1.28 + (s < 0 ? 0.06 : 0), -0.22],
    ];
    b.sweep(catmull(br), [0.035, 0.012], { bone: stand, color: BARKP, sides: 6 });
    b.rod(br[2], [s * 0.42, 1.36, -0.3], 0.012, { bone: stand, color: BARK[2], sides: 5 });
    b.rod(br[1], [s * 0.3, 0.98, -0.38], 0.012, { bone: stand, color: BARK[2], sides: 5 });
    b.rod([s * 0.5, 0.8, 0.4], [s * 0.63, 0.84, 0.5], 0.014, { bone: stand, color: BARK[2], sides: 5 });
  }
  b.rod([-0.03, 1.33, -0.28], [0.06, 1.5, -0.25], 0.014, { bone: stand, color: BARK[2], sides: 5 });
  b.rod([-0.03, 1.33, -0.28], [-0.1, 1.46, -0.33], 0.014, { bone: stand, color: BARK[2], sides: 5 });

  // leaves and gumnuts
  const leafR = rng(11);
  const leaves = (at: number[], n: number, spread: number) => {
    const fr = [];
    for (let i = 0; i < n; i++) {
      const d = [leafR() - 0.5, leafR() * 0.5 + 0.1, leafR() - 0.5];
      fr.push(frame([at[0] + (leafR() - 0.5) * spread, at[1] + (leafR() - 0.5) * spread * 0.6, at[2] + (leafR() - 0.5) * spread], d));
    }
    b.cards(fr, [LEAF1, LEAF2], {
      size: [0.07, 0.22],
      lean: 50,
      bend: 35,
      flow: [0, -1, 0],
      vary: 0.25,
      spin: 30,
      rng: leafR,
      bone: stand,
      sink: 0.05,
    });
  };
  leaves([0, 1.38, -0.28], 16, 0.12);
  leaves([0.06, 1.5, -0.25], 8, 0.08);
  leaves([-0.1, 1.46, -0.33], 8, 0.08);
  leaves([0.52, 1.28, -0.22], 12, 0.1);
  leaves([0.42, 1.36, -0.3], 8, 0.08);
  leaves([0.3, 1.0, -0.38], 6, 0.08);
  leaves([-0.52, 1.34, -0.22], 12, 0.1);
  leaves([-0.42, 1.44, -0.3], 8, 0.08);
  leaves([-0.3, 1.08, -0.38], 6, 0.08);
  leaves([0.63, 0.84, 0.5], 8, 0.06);
  leaves([-0.63, 0.84, 0.5], 8, 0.06);
  for (const [x, y, z] of [
    [0.5, 1.26, -0.2],
    [0.4, 1.34, -0.28],
    [-0.5, 1.32, -0.2],
    [0.02, 1.36, -0.26],
    [0.62, 0.82, 0.49],
    [-0.62, 0.82, 0.49],
  ]) {
    b.part(new THREE.SphereGeometry(0.02, 6, 4), "#6a5a3a", { bone: stand, at: [x, y, z] });
    b.part(new THREE.CylinderGeometry(0.014, 0.01, 0.008, 6), "#8a7a52", { bone: stand, at: [x, y + 0.016, z] });
  }
  b.cards(b.surface(trunk).scatter(14, { rng: rng(21), minDist: 0.1 }), STRIP, {
    size: [0.05, 0.16],
    lean: 70,
    flow: [0, -1, 0],
    rng: rng(22),
    vary: 0.3,
  });

  // ---------------------------------------------------------------- body
  const body = b.loft(
    [
      { at: SPINE[0], w: 0.36, h: 0.3 },
      { at: SPINE[1], w: 0.38, h: 0.32 },
      { at: SPINE[2], w: 0.36, h: 0.3 },
      { at: SPINE[3], w: 0.28, h: 0.24 },
    ],
    { bone: spine, color: BODY, sides: 10 },
  );
  const bs = b.surface(body);
  b.cards(bs.scatter(60, { rng: rng(31), minDist: 0.05, filter: (h) => h.n.z <= 0.35 && h.n.y > -0.3 }), TUFT_G, {
    size: [0.06, 0.06],
    lean: 60,
    bend: 20,
    flow: [0, -0.5, -1],
    rng: rng(32),
    vary: 0.2,
  });
  b.cards(bs.scatter(50, { rng: rng(33), minDist: 0.045, filter: (h) => h.n.z > 0.35 && h.at.y > 0.75 }), TUFT_C, {
    size: [0.05, 0.05],
    lean: 60,
    bend: 20,
    flow: [0, -1, 0.2],
    rng: rng(34),
    vary: 0.2,
  });

  // ---------------------------------------------------------------- head
  const HC = [0, 1.19, 0.12];
  const skull = b.part(new THREE.SphereGeometry(1, 10, 8), FUR, { bone: head, at: HC, scale: [0.19, 0.15, 0.16] });
  b.part(new THREE.SphereGeometry(1, 8, 6), FACE, { bone: head, at: [0, 1.155, 0.235], scale: [0.105, 0.06, 0.085] });
  b.part(new THREE.BoxGeometry(0.1, 0.07, 0.06), "#ffffff", { texture: NOSE, bone: head, at: [0, 1.19, 0.305] });
  b.part(new THREE.SphereGeometry(1, 8, 6), CREAM[3], { bone: jaw, at: [0, 1.085, 0.24], scale: [0.08, 0.035, 0.075] });
  b.part(new THREE.BoxGeometry(0.09, 0.01, 0.07), "#2a1a1e", { bone: head, at: [0, 1.103, 0.262] });
  b.cards(
    b.surface(skull).scatter(40, {
      rng: rng(41),
      minDist: 0.045,
      filter: (h) => Math.abs(h.n.x) > 0.5 && h.at.y < 1.22 && h.at.z > 0.0,
    }),
    TUFT_C,
    { size: [0.06, 0.07], lean: 70, bend: 25, flow: [0, -0.4, -1], rng: rng(42), vary: 0.2 },
  );
  b.cards(b.surface(skull).scatter(24, { rng: rng(43), minDist: 0.05, filter: (h) => h.n.y > 0.5 }), TUFT_G, {
    size: [0.05, 0.06],
    lean: 55,
    flow: [0, -0.3, -1],
    rng: rng(44),
    vary: 0.2,
  });
  for (const s of [1, -1]) {
    b.decal(skull, EYE, {
      at: [s * 0.09, 1.215, 0.25],
      dir: [s * 0.3, 0.05, 1],
      size: [0.05, 0.045],
      mirror: s > 0,
    });
    const S = s > 0 ? "L" : "R";
    const epos = [s * 0.15, 1.3, 0.07];
    const edir = [s * 0.35, 0.1, 1];
    const ear = b.joint(`ear${S}`, { parent: head, at: epos, aim: [s * 0.2, 1.4, 0.07] });
    b.part(new THREE.SphereGeometry(1, 8, 6), FUR, { bone: ear, at: epos, dir: edir, axis: "z", scale: [0.085, 0.085, 0.04] });
    const inner = [epos[0] + edir[0] * 0.02, epos[1] + 0.002, epos[2] + 0.025];
    b.part(new THREE.SphereGeometry(1, 8, 6), CREAM[2], { bone: ear, at: inner, dir: edir, axis: "z", scale: [0.06, 0.06, 0.03] });
    b.cards(b.ring({ at: epos, axis: edir }, { count: 12, radius: 0.082 }).items, TUFT_C, {
      size: [0.05, 0.065],
      lean: 20,
      flow: [0, 0, -1],
      bone: ear,
    });
  }

  // ---------------------------------------------------------------- arms (gripping the front branch)
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.2, 0.98, 0.06], [s * 0.17, 0.81, 0.34], [0.22, 0.22], [[s * 0.6, -0.5, -0.4]]);
    const arm = b.chain(`arm${S}`, pts, {
      parent: spine.joints[2],
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const sw = b.sweep(arm, [0.085, 0.07, 0.058], { color: FUR, sides: 8 });
    b.cards(b.surface(sw).scatter(14, { rng: rng(51 + s), minDist: 0.05, filter: (h) => h.n.y > -0.3 }), TUFT_G, {
      size: [0.05, 0.05],
      lean: 60,
      flow: [0, -0.3, -1],
      rng: rng(53),
    });
    const wrist = arm.joints[2];
    b.part(new THREE.SphereGeometry(1, 8, 6), HAND, { bone: wrist, at: [s * 0.17, 0.815, 0.34], scale: [0.065, 0.045, 0.05] });
    for (let i = 0; i < 5; i++) {
      const xo = s * 0.17 + (i - 2) * 0.021;
      const f = b.chain(
        `f${S}${i}`,
        catmull([
          [xo, 0.82, 0.345],
          [xo, 0.855, 0.4],
          [xo, 0.795, 0.445],
        ]),
        { parent: wrist, names: [`f${S}${i}a`, `f${S}${i}b`], role: "digit" },
      );
      b.sweep(f, [0.014, 0.01], { color: HAND, sides: 5 });
      b.spike([xo, 0.795, 0.445], [0, -0.6, 0.5], 0.035, 0.007, { color: CLAW, bone: f.joints[1], sides: 5 });
    }
  }

  // ---------------------------------------------------------------- legs (feet clasp the seat branch)
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.17, 0.65, -0.04], [s * 0.3, 0.585, -0.04], [0.2, 0.2], [[s * 0.2, 0.6, 1]]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: pelvis,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
    });
    const sw = b.sweep(leg, [0.105, 0.085, 0.065], { color: FUR, sides: 8 });
    b.cards(b.surface(sw).scatter(14, { rng: rng(61 + s), minDist: 0.05, filter: (h) => h.n.y > -0.2 }), TUFT_G, {
      size: [0.05, 0.05],
      lean: 60,
      flow: [0, -0.3, -1],
      rng: rng(63),
    });
    const ankle = leg.joints[2];
    b.part(new THREE.SphereGeometry(1, 8, 6), HAND, { bone: ankle, at: [s * 0.3, 0.585, -0.03], scale: [0.06, 0.04, 0.075] });
    for (let i = 0; i < 5; i++) {
      const xo = s * 0.3 + (i - 2) * 0.02;
      const t = b.chain(
        `toe${S}${i}`,
        catmull([
          [xo, 0.567, -0.06],
          [xo, 0.553, 0.0],
          [xo, 0.505, 0.035],
        ]),
        { parent: ankle, names: [`toe${S}${i}a`, `toe${S}${i}b`], role: "digit" },
      );
      b.sweep(t, [0.013, 0.009], { color: HAND, sides: 5 });
      b.spike([xo, 0.505, 0.035], [0, -0.6, 0.5], 0.03, 0.006, { color: CLAW, bone: t.joints[1], sides: 5 });
    }
  }
  void R;
  return b.root;
}
