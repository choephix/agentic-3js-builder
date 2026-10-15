import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { rng } from "../../../../src/math";
import { noise } from "../../../../src/paint";
import { frame } from "../../../../src/frame";
import { cellPaint, pixelArt, pixelTexture, tileBox, pick, bayer, snapColor } from "../../../../kits/pixel";

export const meta = {
  name: "Koala on Eucalyptus Stand",
  description: "A pixel-art koala sitting on a eucalyptus branch, hugging a leafy stem, on a wooden stand.",
  style: "pixel art",
  commit: "88fc1f0",
};

const TEXEL = 0.02;
const FUR_RAMP = ["#33353d", "#4e515c", "#6b6f7c", "#8c909c", "#b0b3bd"].map((c) => snapColor(c, 32));
const CREAM_RAMP = ["#a79f92", "#c7c0b2", "#e2dccc", "#f3efe3"].map((c) => snapColor(c, 32));
const BARK_RAMP = ["#5e4e3a", "#7d6b50", "#a39674", "#c2b890", "#8a9a72"].map((c) => snapColor(c, 32));
const MOSS_RAMP = ["#1f3a1a", "#2f5a24", "#468a30", "#6cb04a"].map((c) => snapColor(c, 32));

const NOSE = "#16141a";
const CLAW = "#d8cfb8";
const EAR_IN = "#f2d9d2";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "koala", paintSize: 2048 });
  const rand = rng(11);

  const fur = cellPaint(
    TEXEL,
    (c) => {
      const lum = 0.5 + 0.28 * c.n.y + 0.5 * (noise(c.at, 0.09, 3) - 0.5) + (c.random(5) < 0.08 ? 0.2 : 0);
      return c.pick(FUR_RAMP, lum);
    },
    { dither: true },
  );
  const cream = cellPaint(
    TEXEL,
    (c) => c.pick(CREAM_RAMP, 0.6 + 0.6 * (noise(c.at, 0.07, 8) - 0.5) + 0.2 * (c.random(2) - 0.5)),
    { dither: true },
  );
  const bark = cellPaint(
    TEXEL,
    (c) => {
      const n = noise(c.at, 0.16, 4);
      const streak = c.random(c.u * 7 + 1) < 0.15 ? -0.2 : 0;
      return c.pick(BARK_RAMP, 0.2 + 0.9 * n + streak);
    },
    { dither: true },
  );
  const moss = cellPaint(TEXEL, (c) => c.pick(MOSS_RAMP, 0.4 + 0.8 * (noise(c.at, 0.12, 9) - 0.5) + 0.3 * (c.random(1) - 0.5)), {
    dither: true,
  });

  // ---- stand base ----
  const WOOD = pixelTexture(32, 24, (g) => {
    g.fill((x, y) => (y % 6 === 0 ? "#3c2a1a" : pick(["#5a3f27", "#6e4d2f", "#85603a"], 0.3 + 0.6 * ((x * 7 + y * 3) % 5) / 5, bayer(x, y))));
    g.stamp(3, 2, ["n"], { n: "#2a1e14" });
    g.stamp(28, 14, ["n"], { n: "#2a1e14" });
  });
  b.part(tileBox([0.62, 0.05, 0.62], WOOD, 0.014, { rand, step: [1, 6] }), "#ffffff", { texture: WOOD, at: [0, 0.025, 0] });
  b.part(tileBox([0.5, 0.04, 0.5], WOOD, 0.014, { rand, step: [1, 6] }), "#ffffff", { texture: WOOD, at: [0, 0.07, 0] });
  b.part(new THREE.BoxGeometry(0.46, 0.02, 0.46), moss, { at: [0, 0.1, 0] });
  for (const [x, z, w] of [
    [0.17, 0.15, 0.07],
    [-0.18, 0.1, 0.05],
    [0.1, -0.15, 0.06],
  ] as const) b.part(new THREE.BoxGeometry(w, w * 0.6, w), "#7b7a80", { at: [x, 0.11 + w * 0.3, z] });
  for (const s of [1, -1]) for (const z of [0.25, -0.25]) b.part(new THREE.BoxGeometry(0.05, 0.03, 0.05), "#2a1e14", { at: [s * 0.27, 0.0, z] });

  // ---- trunk + seat branch + held stem ----
  b.sweep(catmull([[0.0, 0.1, -0.2], [0.02, 0.5, -0.2], [0.05, 0.9, -0.2], [0.06, 1.2, -0.2], [0.05, 1.4, -0.19]]), [0.09, 0.045], {
    color: bark, caps: "flat", sides: 8,
  });
  b.sweep(
    catmull([[0.02, 0.5, -0.2], [0.0, 0.52, 0.0], [0.0, 0.56, 0.2], [0.0, 0.66, 0.285], [0.0, 0.95, 0.29]]),
    [0.045, 0.027],
    { color: bark, caps: "round", sides: 8 },
  );
  // knots and stub
  for (const [x, y, z, r] of [[0.07, 0.75, -0.17, 0.03], [-0.07, 1.05, -0.19, 0.025], [0.0, 0.3, -0.12, 0.035]] as const)
    b.part(new THREE.SphereGeometry(r, 6, 4), "#5e4e3a", { at: [x, y, z] });

  // ---- koala body ----
  b.capsule([0, 0.68, -0.07], [0, 0.92, -0.1], [0.17, 0.14], fur, { sides: 8 });
  b.part(new THREE.SphereGeometry(0.1, 8, 6), cream, { at: [0, 0.8, 0.05], scale: [1.0, 1.4, 0.5] });
  // haunches
  for (const s of [1, -1]) {
    b.capsule([s * 0.12, 0.72, -0.07], [s * 0.11, 0.64, 0.15], [0.085, 0.065], fur, { sides: 8 });
    b.part(new THREE.BoxGeometry(0.07, 0.04, 0.1), fur, { at: [s * 0.11, 0.62, 0.2] });
    for (const dx of [-1, 0, 1]) b.spike([s * 0.11 + dx * 0.022, 0.6, 0.25], [0, -0.3, 1], 0.04, 0.008, CLAW, { sides: 4 });
    // arms
    b.capsule([s * 0.16, 0.9, -0.02], [s * 0.05, 0.84, 0.25], [0.055, 0.04], fur, { sides: 8 });
    b.part(new THREE.SphereGeometry(0.045, 6, 5), fur, { at: [s * 0.05, 0.84, 0.25] });
    for (const dy of [-1, 0, 1]) b.spike([s * 0.05, 0.84 + dy * 0.02, 0.29], [-s * 0.6, dy * 0.1, 0.4], 0.045, 0.008, CLAW, { sides: 4 });
  }

  // ---- head ----
  const H: [number, number, number] = [0, 1.05, 0.0];
  b.part(new THREE.SphereGeometry(0.15, 9, 7), fur, { at: H, scale: [1.15, 0.9, 1.0] });
  b.part(new THREE.SphereGeometry(0.1, 7, 5), cream, { at: [0, 1.0, 0.075], scale: [1.1, 0.8, 0.8] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.075, 8, 6), fur, { at: [s * 0.17, 1.15, -0.03], scale: [1, 1, 0.5], rotation: [0, s * 20, 0] });
    b.part(new THREE.SphereGeometry(0.055, 7, 5), EAR_IN, { at: [s * 0.172, 1.15, 0.0], scale: [1, 1, 0.4], rotation: [0, s * 20, 0] });
    b.part(new THREE.SphereGeometry(0.05, 7, 5), CREAM_RAMP[3], { at: [s * 0.17, 1.2, -0.01], scale: [1.4, 0.6, 0.6] });
    b.part(new THREE.SphereGeometry(0.015, 6, 4), "#0a0a10", { at: [s * 0.062, 1.075, 0.127] });
    b.part(new THREE.SphereGeometry(0.005, 4, 3), "#ffffff", { at: [s * 0.058, 1.083, 0.142] });
    b.part(new THREE.BoxGeometry(0.04, 0.008, 0.01), "#2a2b33", { at: [s * 0.062, 1.1, 0.125], rotation: [0, 0, s * 10] });
    // cheek fluff
    b.spike([s * 0.13, 1.0, 0.07], [s * 0.6, -0.3, 0.5], 0.05, 0.025, CREAM_RAMP[3], { sides: 5 });
  }
  b.part(new THREE.SphereGeometry(0.036, 7, 5), NOSE, { at: [0, 1.03, 0.14], scale: [1.15, 1.5, 0.9] });
  b.part(new THREE.SphereGeometry(0.008, 4, 3), "#6a6a78", { at: [0.01, 1.05, 0.172] });
  b.rod([0, 0.995, 0.145], [0, 0.965, 0.14], 0.005, "#3a2a2a", { sides: 4 });

  // ---- leaves ----
  const LEAF_A = pixelArt(
    [
      "...g..", "..gmg.", "..gmg.", ".gmhg.", ".gmhg.", ".gmhg.", ".gmhg.", ".gmhg.", ".gmhg.", ".gmg..", "..gmg.", "..gmg.", "..gg..", "..g...",
    ],
    { g: "#2c5a3e", m: "#4f8f66", h: "#7fb890" },
  );
  const LEAF_B = pixelArt(
    [
      "...g..", "..gmg.", "..gmg.", "..gmg.", ".gmhg.", ".gmhg.", ".gmmg.", ".gmmg.", "..gmg.", "..gmg.", "..gg..", "..g...",
    ],
    { g: "#3a6a4a", m: "#6aa07a", h: "#a0cfa0" },
  );
  const NUTS = [[0.08, 0.99, 0.31], [0.14, 0.78, -0.12]];
  void NUTS;
  const twigs: number[][][] = [
    [[0.0, 0.95, 0.29], [0.2, 1.03, 0.3], [0.4, 1.1, 0.25]],
    [[0.0, 0.93, 0.29], [-0.2, 0.99, 0.3], [-0.38, 1.07, 0.22]],
    [[0.04, 1.0, -0.2], [0.25, 1.2, -0.2], [0.46, 1.34, -0.14]],
    [[0.05, 1.15, -0.2], [-0.2, 1.3, -0.2], [-0.4, 1.4, -0.25]],
    [[0.05, 1.38, -0.19], [0.1, 1.5, -0.12], [0.0, 1.6, -0.06]],
  ];
  const frames: ReturnType<typeof frame>[] = [];
  for (const tw of twigs) {
    const p = catmull(tw);
    b.sweep(p, [0.018, 0.008], { color: "#7d6b50", caps: "round", sides: 5 });
    const n = 7;
    for (let i = 0; i < n; i++) {
      const t = 0.2 + (0.8 * i) / (n - 1);
      for (let k = 0; k < 2; k++) {
        const d: [number, number, number] = [(rand() - 0.5) * 1.6, 0.15 + rand() * 0.4, (rand() - 0.5) * 1.6];
        frames.push(frame(p.at(t), d));
      }
    }
  }
  b.cards(frames, [LEAF_A, LEAF_B], { size: [0.06, 0.16], lean: 70, flow: [0, -1, 0], bend: 20, vary: 0.25, spin: 25, rng: rand, cross: true });
  for (const [x, y, z] of [[0.3, 1.06, 0.27], [-0.28, 1.03, 0.26], [0.35, 1.28, -0.17]] as const)
    b.part(new THREE.SphereGeometry(0.02, 6, 4), "#6b5a3e", { at: [x, y - 0.02, z] });

  return b.root;
}
