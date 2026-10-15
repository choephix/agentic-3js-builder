import * as THREE from "three";
import { createBuilder, limb, rng, catmull, noise } from "../../../../src/index";
import { cellPaint, pixelArt, pixelTexture, tileBox, pick, bayer } from "../../../../kits/pixel";

export const meta = {
  name: "Koala on Eucalyptus Perch",
  description: "Pixel-art koala sitting astride a eucalyptus branch stand, gripping it with hands and feet.",
};

const TEXEL = 0.02;
const FUR = ["#3f434f", "#5a5f6c", "#767b88", "#979ca8", "#b9bdc6"];
const BELLY = ["#a9a7a6", "#c8c6c2", "#e3e0d8", "#f4f1e8"];
const BARK = ["#3a2a1e", "#53392a", "#6e4c37", "#8b6a4c", "#a8896a"];
const DARK = "#1d1b22";
const SKIN = "#34303a";
const CLAW = "#e8e0d0";
const PINK = "#e9a9b0";

export default function build() {
  const b = createBuilder({ name: "koala" });
  const R = rng(11);

  // ---------- paints ----------
  const furPaint = cellPaint(
    0.02,
    (c) => c.pick(FUR, 0.45 + 0.3 * c.n.y + 0.55 * (noise(c.at, 0.12, 3) - 0.5) + 0.12 * (c.random(4) - 0.5)),
    { dither: true },
  );
  const bellyPaint = cellPaint(0.02, (c) => c.pick(BELLY, 0.55 + 0.4 * (noise(c.at, 0.1, 8) - 0.5) + 0.2 * (c.random(2) - 0.5)), {
    dither: true,
  });
  const barkPaint = cellPaint(0.02, (c) =>
    c.pick(BARK, 0.5 + 0.5 * (c.random(1) - 0.5) + (c.u % 3 === 0 ? -0.18 : 0.05) + 0.2 * (c.n.y - 0.3)),
  );

  // ---------- textures ----------
  const EYE = pixelArt([".kkk.", "kkkkk", "kwkkk", "kkkkk", ".kkk."], { k: DARK, w: "#ffffff" });
  const NOSE = pixelArt(["kkkkkk", "kgkkkk", "kkkkkk", "kkkkkk", ".kkkk."], { k: DARK, g: "#8a8c9a" });
  const LEAF = pixelArt(
    ["....gg", "...glg", "..gglg", "..gggd", ".gglgd", ".ggggd", "gglgdd", "gggddd", "gggdd.", ".ggd..", ".gd...", ".d...."],
    { g: "#6fa58a", l: "#a7d3b6", d: "#3e7060" },
  );
  const GRASS = pixelTexture(16, 16, (g) => {
    g.fill((x, y) => pick(["#2f5a2a", "#437c34", "#5ea044", "#86c25a"], 0.45 + 0.4 * (((x * 7 + y * 13) % 5) / 5 - 0.4), bayer(x, y)));
  });
  const STONE = pixelTexture(16, 12, (g) => {
    g.fill((x, y) => (y % 6 === 0 || (x + (y > 5 ? 4 : 0)) % 8 === 0 ? "#4a4650" : pick(["#6c6874", "#8a8693", "#a29eab"], ((x * 5 + y * 3) % 7) / 7, bayer(x, y))));
  });

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, color: any, bone: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...extra });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.6, -0.04], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.6, -0.04],
      [0, 0.78, -0.02],
      [0, 0.93, 0.03],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const head = b.joint("head", { parent: spine.joints[1], at: [0, 0.97, 0.04], dir: [0, 1, 0.15], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.99, 0.08], aim: [0, 0.99, 0.24], role: "jaw" });

  // ---------- torso ----------
  box(0.48, 0.22, 0.4, furPaint, hips, [0, 0.58, -0.05]);
  box(0.4, 0.34, 0.34, furPaint, spine.joints[0], [0, 0.8, -0.03]);
  box(0.28, 0.3, 0.02, bellyPaint, spine.joints[0], [0, 0.79, 0.145]);
  box(0.22, 0.14, 0.02, bellyPaint, hips, [0, 0.58, 0.15]);
  box(0.26, 0.16, 0.05, furPaint, hips, [0, 0.56, -0.27]); // rump fluff
  box(0.3, 0.1, 0.18, furPaint, spine.joints[1], [0, 0.96, 0.0]); // shoulders / neck

  // ---------- head ----------
  box(0.46, 0.34, 0.36, furPaint, head, [0, 1.13, 0.06]);
  box(0.56, 0.14, 0.26, furPaint, head, [0, 1.04, 0.03]); // cheek ruffs
  box(0.5, 0.06, 0.2, bellyPaint, head, [0, 1.0, 0.04], {});
  box(0.34, 0.08, 0.04, furPaint, head, [0, 1.3, 0.12]); // brow fluff
  const nose = box(0.13, 0.18, 0.07, DARK, head, [0, 1.1, 0.27]);
  b.part(new THREE.PlaneGeometry(0.13, 0.18), "#ffffff", {
    bone: head, at: [0, 1.1, 0.3055], dir: [0, 0, 1], axis: "z", texture: NOSE,
  });
  void nose;
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.065, 0.065), "#ffffff", {
      bone: head, at: [s * 0.125, 1.17, 0.2425], dir: [0, 0, 1], axis: "z", texture: EYE,
    });
    box(0.07, 0.015, 0.012, furPaint, head, [s * 0.125, 1.215, 0.243]);
    // ears: stacked pixel discs with a cream fluffy inside
    const ex = s * 0.26;
    box(0.2, 0.28, 0.06, furPaint, head, [ex, 1.3, 0.0]);
    box(0.28, 0.2, 0.06, furPaint, head, [ex, 1.3, 0.0]);
    box(0.17, 0.22, 0.05, bellyPaint, head, [ex, 1.3, 0.04]);
    box(0.1, 0.13, 0.03, PINK, head, [ex, 1.29, 0.07]);
    box(0.06, 0.06, 0.04, bellyPaint, head, [ex + s * 0.05, 1.36, 0.045]);
  }
  box(0.17, 0.014, 0.012, SKIN, head, [0, 0.99, 0.243]);
  // jaw (lower)
  box(0.3, 0.06, 0.2, bellyPaint, jaw, [0, 0.965, 0.14]);
  box(0.12, 0.03, 0.02, "#6d4a52", jaw, [0, 0.995, 0.23]);

  // ---------- legs ----------
  const legs: any = {};
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const hipP = [s * 0.17, 0.58, -0.02];
    const foot = [s * 0.11, 0.44, 0.36];
    const pts = limb(hipP, foot, [0.24, 0.24], [[0, 1, 0]]);
    const leg = b.chain(`leg${sd}`, pts, { parent: hips, names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`], role: "leg" });
    legs[sd] = leg;
    b.sweep(leg, [0.095, 0.065], { color: furPaint, sides: 6 });
    const tip = leg.joints[leg.joints.length - 1];
    box(0.11, 0.07, 0.14, SKIN, tip, [foot[0], foot[1], foot[2] + 0.03]);
    for (let i = -1; i <= 1; i++) {
      box(0.03, 0.035, 0.07, SKIN, tip, [foot[0] + i * 0.035, foot[1] - 0.005, foot[2] + 0.12]);
      box(0.02, 0.02, 0.03, CLAW, tip, [foot[0] + i * 0.035, foot[1] - 0.012, foot[2] + 0.17]);
    }
  }

  // ---------- arms ----------
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const sh = [s * 0.21, 0.9, 0.06];
    const hand = [s * 0.09, 0.545, 0.24];
    const pts = limb(sh, hand, [0.23, 0.23], [[s, 0.2, -0.5]]);
    const arm = b.chain(`arm${sd}`, pts, { parent: spine.joints[1], names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`], role: "arm" });
    b.sweep(arm, [0.085, 0.055], { color: furPaint, sides: 6 });
    box(0.17, 0.17, 0.17, furPaint, spine.joints[1], [s * 0.21, 0.9, 0.04]); // shoulder fluff
    const tip = arm.joints[arm.joints.length - 1];
    box(0.1, 0.06, 0.1, SKIN, tip, [hand[0], hand[1], hand[2]]);
    for (let i = -1; i <= 1; i++) {
      box(0.028, 0.03, 0.07, SKIN, tip, [hand[0] + i * 0.032, hand[1] - 0.02, hand[2] + 0.07]);
      box(0.018, 0.018, 0.03, CLAW, tip, [hand[0] + i * 0.032, hand[1] - 0.03, hand[2] + 0.115]);
    }
  }

  // ---------- stand ----------
  const rootBone = hips;
  b.part(tileBox([0.9, 0.1, 1.4], STONE, TEXEL, { rand: R }), "#ffffff", { bone: rootBone, at: [0, 0.05, 0.1], texture: STONE });
  b.part(tileBox([0.8, 0.05, 1.3], GRASS, TEXEL, { rand: R }), "#ffffff", { bone: rootBone, at: [0, 0.125, 0.1], texture: GRASS });
  // grass tufts and clover
  for (let i = 0; i < 14; i++) {
    const x = (R() - 0.5) * 0.7;
    const z = -0.5 + R() * 1.2;
    box(0.025, 0.05 + R() * 0.04, 0.025, R() > 0.5 ? "#6cae48" : "#4b8a38", rootBone, [x, 0.17, z]);
  }
  // trunk
  b.sweep(
    [
      [0, 0.14, -0.3],
      [0.02, 0.9, -0.31],
      [0, 1.55, -0.3],
    ],
    [0.075, 0.04],
    { color: barkPaint, bone: rootBone, sides: 6 },
  );
  // perch branch along z
  b.rod([0, 0.46, -0.3], [0, 0.46, 0.6], 0.052, barkPaint, { bone: rootBone, sides: 6 });
  b.part(new THREE.SphereGeometry(0.055, 6, 4), "#6e4c37", { bone: rootBone, at: [0, 0.46, 0.6], flat: true });
  // front support post
  b.rod([0, 0.14, 0.5], [0, 0.45, 0.5], 0.04, barkPaint, { bone: rootBone, sides: 6 });
  b.rod([0, 0.2, -0.3], [0, 0.44, 0.2], 0.026, barkPaint, { bone: rootBone, sides: 6 }); // brace
  // broken stub + knots
  box(0.07, 0.07, 0.07, "#3a2a1e", rootBone, [0.07, 0.7, -0.33]);
  box(0.05, 0.05, 0.05, "#3a2a1e", rootBone, [-0.07, 1.05, -0.33]);

  // twigs with eucalyptus leaves
  const twigs = [
    [[0, 1.2, -0.3], [0.2, 1.42, -0.28], [0.42, 1.55, -0.24]],
    [[0, 1.3, -0.3], [-0.2, 1.5, -0.3], [-0.4, 1.62, -0.28]],
    [[0, 1.5, -0.3], [0.04, 1.7, -0.33], [0.0, 1.9, -0.34]],
    [[0, 0.95, -0.31], [-0.25, 1.05, -0.25], [-0.5, 1.12, -0.12]],
    [[0, 0.8, -0.31], [0.28, 0.92, -0.22], [0.5, 1.0, -0.1]],
  ];
  const frames: any[] = [];
  for (const t of twigs) {
    const tw = b.sweep(catmull(t), [0.025, 0.008], { color: barkPaint, bone: rootBone, sides: 5 });
    b.along(tw, 6, (at: any) => {
      frames.push(at);
    });
    frames.push(tw.at(1));
  }
  b.cards(frames, LEAF, {
    size: [0.1, 0.26],
    lean: 62,
    bend: 25,
    flow: [0, -0.5, 0.5],
    vary: 0.3,
    spin: 180,
    rng: rng(7),
    cross: true,
    bone: rootBone,
  });

  const root = b.root;
  return root;
}
