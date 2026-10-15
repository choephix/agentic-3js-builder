import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { polyline } from "../../../../src/path";
import { rng } from "../../../../src/math";
import { svg } from "../../../../src/texture";
import { grain, mottle } from "../../../../src/paint";
import { cel, furEdge, INK, inkLines } from "../../../../kits/toon";

export const meta = {
  name: "Capybara with Bird",
  description: "A chubby, sleepy capybara with a little blue bird perched on its head, whimsical storybook style.",
  style: "whimsical",
  commit: "88fc1f0",
};

const FUR = "#b07a45";
const FUR_DK = "#8a5a30";
const BELLY = "#e6c590";
const NOSE = "#3b2a22";
const BIRD = "#4fb3e8";
const BIRD_DK = "#2d7fc4";
const CREAM = "#fff1cf";
const BEAK = "#ffb028";
const PINK = "#ff8fb3";
const PETAL = "#ffd1e0";
const YELLOW = "#ffd23f";
const LEAF = "#5fae4a";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "capybara" });
  const rnd = rng(7);

  const ball = (c: number[], sc: number[], color: any, seg = 10, rows = 7) =>
    b.part(new THREE.SphereGeometry(1, seg, rows), color, { at: c, scale: sc });

  // ---- coat paints
  const coatBase = cel(
    mottle(grain(FUR, "#9c6a3a", { size: 0.025, axis: "z", seed: 2 }), "#c28a52", { size: 0.12, contrast: 0.5, seed: 4 }),
  );
  const belly = cel(BELLY, "#d3a96f");
  const coat = furEdge(coatBase, belly, { level: -0.3, teeth: 0.18, period: 0.035, ink: INK, inkWidth: 0.025 });
  const headCoat = cel(
    mottle(grain("#b98350", "#a67040", { size: 0.02, axis: "z", seed: 5 }), "#c99660", { size: 0.08, contrast: 0.4, seed: 6 }),
  );
  const snoutCoat = furEdge(cel("#a8703c"), cel("#cfa06a"), {
    by: "position",
    axis: [0, 1, 0],
    level: 0.43,
    teeth: 0.02,
    period: 0.03,
    along: [1, 0, 0],
  });
  const legCoat = cel(grain(FUR_DK, "#7a4e28", { size: 0.015, axis: "y", seed: 8 }));

  // ---- body
  const body = b.sweep(
    polyline([
      [0, 0.34, -0.4],
      [0, 0.35, -0.08],
      [0, 0.37, 0.26],
    ]),
    [0.2, 0.27, 0.285, 0.24],
    { color: coat, sides: 12 },
  );

  // fur tufts
  const tuft = svg(
    `<svg viewBox="0 0 32 64"><path d="M4 64 Q10 30 16 2 Q22 30 28 64 Z" fill="#8f5d2f"/><path d="M12 64 Q16 36 16 14 Q20 36 22 64 Z" fill="#c28a52"/></svg>`,
    { size: 64 },
  );
  const hits = b
    .surface(body)
    .scatter(160, { rng: rnd, minDist: 0.05, filter: (h) => h.n.y > -0.1 });
  b.cards(hits, tuft, { size: [0.03, 0.05], lean: 55, bend: 20, vary: 0.3, rng: rng(11), spin: 25 });

  // back saddle stripe of darker fur
  b.sweep(
    polyline([
      [0, 0.6, -0.3],
      [0, 0.635, -0.02],
      [0, 0.625, 0.2],
    ]),
    [0.012, 0.03, 0.02],
    { color: "#7d5028", sides: 6, caps: "round" },
  );

  // ---- legs
  for (const s of [1, -1]) {
    for (const [z, r0, r1] of [
      [0.27, 0.075, 0.06],
      [-0.3, 0.095, 0.065],
    ] as number[][]) {
      b.rod([s * 0.15, 0.24, z], [s * 0.15, 0.035, z + 0.015], [r0, r1], { color: legCoat, sides: 8 });
      b.part(new THREE.BoxGeometry(0.1, 0.045, 0.13), "#6e4725", { at: [s * 0.15, 0.02, z + 0.05] });
      for (const dx of [-0.032, 0, 0.032]) {
        ball([s * 0.15 + dx, 0.022, z + 0.12], [0.016, 0.018, 0.02], "#2e1d14", 6, 4);
      }
    }
  }

  // ---- head
  const HC = [0, 0.5, 0.54];
  const skull = ball(HC, [0.155, 0.15, 0.17], headCoat, 14, 10);
  const snout = ball([0, 0.465, 0.71], [0.125, 0.115, 0.15], snoutCoat, 14, 10);
  b.part(new THREE.BoxGeometry(0.2, 0.09, 0.16), headCoat, { at: [0, 0.52, 0.64], rotation: [-8, 0, 0] });
  // nose pad
  ball([0, 0.485, 0.84], [0.1, 0.075, 0.04], NOSE, 10, 7);
  for (const s of [1, -1]) {
    ball([s * 0.04, 0.488, 0.875], [0.017, 0.013, 0.01], "#120a07", 6, 4);
    // eyes
    ball([s * 0.098, 0.565, 0.62], [0.028, 0.032, 0.026], "#1a0f0a", 8, 6);
    ball([s * 0.104, 0.576, 0.642], [0.009, 0.01, 0.008], "#ffffff", 5, 4);
    // eyelids heavy sleepy
    ball([s * 0.098, 0.585, 0.618], [0.035, 0.014, 0.03], FUR_DK, 8, 4);
    // cheek blush
    ball([s * 0.12, 0.5, 0.64], [0.02, 0.02, 0.012], PINK, 6, 4);
    // ears
    ball([s * 0.105, 0.64, 0.45], [0.04, 0.04, 0.03], FUR_DK, 8, 6);
    ball([s * 0.105, 0.64, 0.468], [0.026, 0.028, 0.012], "#e0a090", 6, 4);
    // whiskers
    for (const dy of [-0.012, 0.012]) {
      b.rod([s * 0.07, 0.47 + dy, 0.85], [s * 0.2, 0.47 + dy * 3, 0.82], 0.0025, { color: INK, sides: 4 });
    }
    // brow tuft
    ball([s * 0.08, 0.605, 0.66], [0.02, 0.01, 0.025], "#6e4725", 5, 4);
    // front incisor peek
    b.part(new THREE.BoxGeometry(0.014, 0.018, 0.006), "#fff4dc", { at: [s * 0.009, 0.436, 0.886] });
  }
  // mouth line
  b.sweep(
    polyline([
      [-0.07, 0.435, 0.83],
      [-0.03, 0.428, 0.865],
      [0, 0.436, 0.872],
      [0.03, 0.428, 0.865],
      [0.07, 0.435, 0.83],
    ]),
    0.004,
    { color: INK, sides: 4 },
  );
  // tummy ink rim on snout
  b.part(new THREE.SphereGeometry(1, 12, 8), inkLines(cel("#c99660"), { levels: [0.2], axis: [0, 0, 1] }), {
    at: [0, 0.47, 0.5],
    scale: [0.02, 0.02, 0.02],
  });
  void skull;
  void snout;

  // ---- flower on ear
  const FC = [0.14, 0.675, 0.43];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    ball([FC[0] + Math.cos(a) * 0.022, FC[1] + Math.sin(a) * 0.022, FC[2] + 0.005], [0.014, 0.014, 0.008], PETAL, 6, 4);
  }
  ball([FC[0], FC[1], FC[2] + 0.01], [0.011, 0.011, 0.008], YELLOW, 6, 4);
  b.part(new THREE.SphereGeometry(1, 6, 4), LEAF, { at: [FC[0] - 0.04, FC[1] - 0.025, FC[2] - 0.005], scale: [0.02, 0.008, 0.012] });

  // ---- bird on head
  const BC = [0, 0.7, 0.52];
  ball(BC, [0.052, 0.048, 0.056], BIRD, 12, 8);
  ball([0, BC[1] - 0.012, BC[2] + 0.02], [0.038, 0.035, 0.036], CREAM, 10, 6);
  ball([0, BC[1] + 0.045, BC[2] + 0.025], [0.036, 0.034, 0.036], BIRD, 10, 8);
  ball([0, BC[1] + 0.035, BC[2] + 0.045], [0.02, 0.015, 0.012], CREAM, 6, 4);
  b.spike([0, BC[1] + 0.04, BC[2] + 0.057], [0, -0.05, 1], 0.03, 0.011, { color: BEAK, sides: 6 });
  for (const s of [1, -1]) {
    ball([s * 0.022, BC[1] + 0.055, BC[2] + 0.05], [0.007, 0.008, 0.007], "#14100d", 6, 4);
    ball([s * 0.024, BC[1] + 0.058, BC[2] + 0.055], [0.0025, 0.0025, 0.0025], "#ffffff", 4, 3);
    // wings
    b.part(new THREE.SphereGeometry(1, 8, 6), BIRD_DK, {
      at: [s * 0.05, BC[1] + 0.005, BC[2] - 0.005],
      scale: [0.012, 0.03, 0.045],
      rotation: [-20, 0, s * 12],
    });
    // cheek blush
    ball([s * 0.03, BC[1] + 0.038, BC[2] + 0.045], [0.009, 0.007, 0.005], PINK, 5, 4);
    // legs
    b.rod([s * 0.015, BC[1] - 0.04, BC[2] + 0.01], [s * 0.015, 0.645, BC[2] + 0.015], 0.003, { color: BEAK, sides: 4 });
    for (const dz of [0.012, 0.022]) {
      b.rod([s * 0.015, 0.648, BC[2] + 0.015], [s * 0.015 + s * 0.004, 0.645, BC[2] + 0.015 + dz], 0.002, {
        color: BEAK,
        sides: 4,
      });
    }
  }
  // crest feathers
  for (const [dx, dz, ln] of [
    [0, -0.005, 0.035],
    [0.012, -0.015, 0.028],
    [-0.012, -0.015, 0.028],
  ]) {
    b.spike([dx, BC[1] + 0.07, BC[2] + 0.025], [dx * 2, 1, dz * 6], ln, 0.007, { color: BIRD_DK, sides: 5 });
  }
  // tail
  b.spike([0, BC[1] + 0.005, BC[2] - 0.04], [0, 0.35, -1], 0.07, 0.016, { color: BIRD_DK, sides: 6 });
  b.spike([0.012, BC[1] + 0.005, BC[2] - 0.04], [0.3, 0.3, -1], 0.055, 0.012, { color: BIRD, sides: 6 });
  b.spike([-0.012, BC[1] + 0.005, BC[2] - 0.04], [-0.3, 0.3, -1], 0.055, 0.012, { color: BIRD, sides: 6 });

  return b.root;
}
