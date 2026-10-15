import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { countershade, gradient, mottle } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Capybara with Songbird",
  description:
    "A chunky, sleepy-eyed capybara with buck teeth, rosy cheeks and a fuzzy coat, calmly wearing a little teal songbird and a pair of yuzu on its head.",
  style: "whimsical",
  commit: "88fc1f0",
};

const COAT_A = "#a96d3e";
const COAT_B = "#93592f";
const BACK = "#7a4726";
const BELLY = "#cf9d62";
const LEG_DARK = "#5e3a21";
const TOE = "#43281a";
const NOSE = "#35211a";
const EAR = "#6b3d22";
const EAR_IN = "#e49a86";
const CHEEK = "#e8907a";
const TEETH = "#fff1c8";
const INK = "#1b100b";
const TEAL = "#3fb6b0";
const TEAL_D = "#2a8f95";
const CREAM = "#ffeab0";
const ORANGE = "#ff9a2e";
const YUZU = "#ffb52e";
const LEAF = "#5fae45";

export default function build() {
  const b = createBuilder({ name: "capybara" });

  const coat = mottle(COAT_A, COAT_B, { size: 0.13, seed: 5 });
  const bodyPaint = countershade(coat, BELLY, { level: -0.3 });
  const dorsal = mottle(BACK, "#6a3b1f", { size: 0.1, seed: 3 });
  const headPaint = gradient(bodyPaint, "#bd8750", [0, 0.5, 0.7], [0, 0.46, 0.9]);
  const legPaint = gradient(bodyPaint, LEG_DARK, [0, 0.22, 0], [0, 0.06, 0]);

  const ball = (
    bone: Joint,
    color: string | ReturnType<typeof mottle>,
    at: number[],
    scale: number[],
    rotation?: number[],
  ) =>
    b.part(new THREE.SphereGeometry(1, 8, 6), color, {
      bone,
      at,
      scale,
      ...(rotation ? { rotation } : {}),
    });

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.4, -0.28], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.4, -0.28],
      [0, 0.4, -0.05],
      [0, 0.41, 0.15],
      [0, 0.43, 0.3],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.43, 0.3],
      [0, 0.47, 0.4],
      [0, 0.51, 0.52],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.51, 0.52], dir: [0, -0.05, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.43, 0.62], aim: [0, 0.41, 0.86], role: "jaw" });
  const earL = b.joint("earL", { parent: head, at: [0.105, 0.63, 0.56], dir: [0.5, 1, 0], role: "hinge" });
  const earR = b.joint("earR", { parent: head, at: [-0.105, 0.63, 0.56], dir: [-0.5, 1, 0], role: "hinge" });
  const tail1 = b.joint("tail1", { parent: hips, at: [0, 0.38, -0.46], dir: [0, -0.2, -1], role: "tail" });

  // ---------------------------------------------------------------- body
  const body = b.loft(
    [
      { at: [0, 0.37, -0.48], w: 0.26, h: 0.28 },
      { at: [0, 0.39, -0.36], w: 0.4, h: 0.4 },
      { at: [0, 0.4, -0.15], w: 0.44, h: 0.42 },
      { at: [0, 0.4, 0.05], w: 0.44, h: 0.42 },
      { at: [0, 0.42, 0.24], w: 0.4, h: 0.4 },
      { at: [0, 0.45, 0.38], w: 0.28, h: 0.3 },
    ],
    { bone: [hips, spine, neck], color: bodyPaint, sectors: [[-55, 55, dorsal]] },
  );
  b.sweep(neck, 0.145, { color: bodyPaint });
  ball(tail1, LEG_DARK, [0, 0.37, -0.49], [0.03, 0.03, 0.04]);

  // ---------------------------------------------------------------- head
  const skull = b.loft(
    [
      { at: [0, 0.51, 0.48], w: 0.25, h: 0.27 },
      { at: [0, 0.51, 0.62], w: 0.26, h: 0.29 },
      { at: [0, 0.49, 0.77], w: 0.22, h: 0.26 },
      { at: [0, 0.46, 0.88], w: 0.19, h: 0.22 },
    ],
    { bone: head, color: headPaint },
  );
  b.frustumBox([0, 0.4, 0.68], [0, 0.4, 0.86], [0.2, 0.1], [0.17, 0.09], { bone: jaw, color: "#b98350" });
  ball(head, NOSE, [0, 0.5, 0.885], [0.07, 0.05, 0.04]);
  for (const s of [1, -1]) {
    ball(head, INK, [s * 0.028, 0.505, 0.918], [0.012, 0.01, 0.006]);
    // eyes: sleepy lid, dark eye, shine
    ball(head, INK, [s * 0.105, 0.575, 0.69], [0.03, 0.032, 0.032]);
    ball(head, "#ffffff", [s * 0.123, 0.587, 0.708], [0.009, 0.009, 0.009]);
    ball(head, "#6b3d22", [s * 0.105, 0.603, 0.69], [0.036, 0.013, 0.036]);
    // rosy cheeks
    ball(head, CHEEK, [s * 0.112, 0.525, 0.745], [0.012, 0.028, 0.034]);
    // ears
    const ear = s > 0 ? earL : earR;
    ball(ear, EAR, [s * 0.108, 0.635, 0.56], [0.03, 0.05, 0.016], [-10, 0, s * -25]);
    ball(ear, EAR_IN, [s * 0.108, 0.633, 0.572], [0.018, 0.03, 0.01], [-10, 0, s * -25]);
    // mouth line and teeth
    b.rod([s * 0.07, 0.435, 0.89], [s * 0.1, 0.43, 0.74], 0.0055, INK, { bone: head });
    b.part(new THREE.BoxGeometry(0.016, 0.03, 0.008), TEETH, { bone: head, at: [s * 0.011, 0.418, 0.9] });
    // whiskers
    for (const [dy, dz] of [
      [0.012, 0.0],
      [0.0, 0.02],
      [-0.014, 0.04],
    ])
      b.rod([s * 0.075, 0.47 + dy, 0.86 - dz * 0.3], [s * 0.2, 0.48 + dy * 3, 0.9 + dz], 0.0028, INK, { bone: head });
  }
  b.part(new THREE.BoxGeometry(0.1, 0.006, 0.006), INK, { bone: head, at: [0, 0.455, 0.9] });

  // ---------------------------------------------------------------- legs
  const toes = (foot: Joint, x: number, z: number) => {
    for (const dx of [-0.03, 0, 0.03]) ball(foot, TOE, [x + dx, 0.022, z + 0.045], [0.02, 0.02, 0.026]);
  };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const fpts = limb([s * 0.16, 0.36, 0.2], [s * 0.16, 0.045, 0.25], [0.18, 0.17], [[0, 0, -1]]);
    const front = b.chain(`legF${side}`, fpts, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `hand${side}`],
      role: "leg",
    });
    b.sweep(front, [0.085, 0.05], { color: legPaint });
    toes(front.joints[front.joints.length - 1], s * 0.16, 0.25);

    const hpts = limb([s * 0.17, 0.36, -0.3], [s * 0.17, 0.045, -0.27], [0.2, 0.19], [[0, 0, 1]]);
    const hind = b.chain(`legH${side}`, hpts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `foot${side}`],
      role: "leg",
    });
    b.sweep(hind, [0.1, 0.05], { color: legPaint });
    ball(hind.joints[0], bodyPaint, [s * 0.18, 0.33, -0.3], [0.1, 0.14, 0.15]);
    toes(hind.joints[hind.joints.length - 1], s * 0.17, -0.27);
  }

  // ---------------------------------------------------------------- fur tufts
  const tuft = svg(
    `<svg viewBox="0 0 16 32"><path d="M2 32 Q6 14 8 0 Q10 14 14 32 Z" fill="#ffffff"/></svg>`,
    { size: 64 },
  );
  const bodyHits = b.surface(body).scatter(320, {
    rng: rng(3),
    minDist: 0.05,
    filter: (h) => h.n.y > -0.25,
  });
  b.cards(bodyHits, tuft, { size: [0.035, 0.05], lean: 70, bend: 20, vary: 0.3, spin: 25, rng: rng(4), color: bodyPaint });
  const headHits = b.surface(skull).scatter(60, {
    rng: rng(5),
    minDist: 0.045,
    filter: (h) => h.n.y > 0.1 && h.at.z < 0.75,
  });
  b.cards(headHits, tuft, { size: [0.025, 0.035], lean: 70, bend: 20, vary: 0.3, rng: rng(6), color: headPaint });

  // ---------------------------------------------------------------- yuzu
  for (const [x, z, k] of [
    [-0.085, 0.54, 1],
    [0.095, 0.5, 0.85],
  ]) {
    ball(head, YUZU, [x, 0.665, z], [0.04 * k, 0.034 * k, 0.04 * k]);
    ball(head, LEAF, [x, 0.696 * 1 + (k - 1) * 0.004, z], [0.02, 0.006, 0.012], [0, 30 * k, 10]);
    ball(head, "#e08a14", [x, 0.699, z], [0.006, 0.004, 0.006]);
  }

  // ---------------------------------------------------------------- songbird
  const bird = b.joint("bird", { parent: head, at: [0, 0.68, 0.62], dir: [0, 1, 0] });
  const birdHead = b.joint("birdHead", { parent: bird, at: [0, 0.75, 0.65], dir: [0, 1, 0.3] });
  const wingL = b.joint("wingL", { parent: bird, at: [0.055, 0.72, 0.64], dir: [0.2, -0.3, -1], role: "wing" });
  const wingR = b.joint("wingR", { parent: bird, at: [-0.055, 0.72, 0.64], dir: [-0.2, -0.3, -1], role: "wing" });
  ball(bird, TEAL, [0, 0.7, 0.62], [0.06, 0.055, 0.07]);
  ball(bird, CREAM, [0, 0.69, 0.645], [0.048, 0.04, 0.05]);
  ball(birdHead, TEAL, [0, 0.765, 0.65], [0.042, 0.042, 0.042]);
  ball(birdHead, CREAM, [0, 0.752, 0.665], [0.03, 0.025, 0.026]);
  b.spike([0, 0.76, 0.688], [0, 0.752, 0.742], null, 0.014, ORANGE, { bone: birdHead });
  for (const s of [1, -1]) {
    ball(birdHead, INK, [s * 0.032, 0.775, 0.685], [0.009, 0.01, 0.009]);
    ball(birdHead, "#ffffff", [s * 0.035, 0.779, 0.69], [0.003, 0.003, 0.003]);
    ball(birdHead, "#ff8fa0", [s * 0.036, 0.755, 0.675], [0.01, 0.01, 0.008]);
    const wing = s > 0 ? wingL : wingR;
    ball(wing, TEAL_D, [s * 0.058, 0.705, 0.615], [0.012, 0.038, 0.05], [-15, 0, s * 0]);
    ball(wing, TEAL, [s * 0.064, 0.7, 0.6], [0.008, 0.026, 0.034], [-15, 0, 0]);
    b.rod([s * 0.02, 0.655, 0.63], [s * 0.02, 0.645, 0.628], 0.006, ORANGE, { bone: bird });
    b.spike([s * 0.02, 0.652, 0.63], [s * 0.02, 0.652, 0.668], null, 0.006, ORANGE, { bone: bird });
  }
  b.frustumBox([0, 0.705, 0.575], [0, 0.72, 0.5], [0.035, 0.008], [0.055, 0.006], { bone: bird, color: TEAL_D });
  b.frustumBox([0, 0.707, 0.52], [0, 0.72, 0.495], [0.03, 0.009], [0.045, 0.007], { bone: bird, color: ORANGE });
  for (const [dx, dz] of [
    [-0.012, -0.01],
    [0, 0],
    [0.012, -0.01],
  ])
    b.spike([dx, 0.8, 0.645 + dz], [dx * 0.6, 1, -0.2], 0.035, 0.008, TEAL_D, { bone: birdHead });

  return b.root;
}
