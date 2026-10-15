import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { countershade, mottle } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";

export const meta = {
  name: "Capybara with Songbird",
  description:
    "A chubby, cel-shaded capybara with buck teeth, a daisy behind one ear and a little blue bird napping on its head.",
  style: "whimsical",
  commit: "88fc1f0",
};

const DARK = "#2a1a14";
const NOSE = "#3b2620";
const EAR = "#6d4126";
const EAR_IN = "#e9a0a0";
const CREAM = "#fff1c9";
const TOOTH = "#fff6dc";
const ORANGE = "#f29a2e";
const BLUE = "#4aa8e8";
const BLUE_DARK = "#2f7fc4";
const PAD = "#6b4a38";

const COAT = cel(countershade(mottle("#b0703c", "#9a5d30", { size: 0.14, seed: 3 }), "#dba96a", { level: -0.15 }));
const BACK = cel("#84502a");
const TAN = cel("#dba96a");

export default function build() {
  const b = createBuilder({ name: "capybara" });

  // ---- skeleton
  const hips = b.joint("hips", { at: [0, 0.34, -0.25], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.34, -0.25],
      [0, 0.36, 0],
      [0, 0.38, 0.22],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chestJ = spine.joints[spine.joints.length - 1];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.38, 0.22],
      [0, 0.42, 0.33],
      [0, 0.43, 0.42],
    ]),
    { parent: chestJ, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: [0, 0.43, 0.4],
    dir: [0, -0.05, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.35, 0.5], aim: [0, 0.34, 0.65], role: "jaw" });

  // ---- body
  const body = b.sweep(
    catmull([
      [0, 0.34, -0.45],
      [0, 0.34, -0.25],
      [0, 0.36, 0],
      [0, 0.38, 0.22],
    ]),
    [0.15, 0.2, 0.215, 0.19],
    { bone: [hips, spine], color: COAT, sectors: [[-40, 40, BACK]], sides: 10 },
  );
  b.sweep(neck, [0.15, 0.115], { color: COAT, sides: 10 });

  // fur tufts
  const tuft = svg(
    `<svg viewBox="0 0 20 40"><path d="M2 40 L10 0 L18 40 Z" fill="#a8683a"/><path d="M7 40 L10 8 L13 40 Z" fill="#c98d52"/></svg>`,
    { size: 64 },
  );
  const hits = b.surface(body).scatter(150, { rng: rng(3), minDist: 0.045, filter: (h) => h.n.y > 0.15 });
  b.cards(hits, tuft, { size: [0.03, 0.05], lean: 60, vary: 0.3, rng: rng(4), spin: 25 });

  // ---- legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const front = limb([s * 0.13, 0.27, 0.15], [s * 0.13, 0.05, 0.2], [0.13, 0.13], [[0, 0, -1]]);
    const fl = b.chain(`legF${side}`, front, {
      parent: chestJ,
      names: [`shoulder${side}`, `elbow${side}`, `hand${side}`],
      role: "leg",
      contact: [s * 0.13, 0, 0.2],
    });
    b.sweep(fl, [0.075, 0.045], { color: COAT, sides: 8 });
    const hind = limb([s * 0.14, 0.27, -0.3], [s * 0.14, 0.05, -0.28], [0.14, 0.13], [[0, 0, 1]]);
    const hl = b.chain(`legH${side}`, hind, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `foot${side}`],
      role: "leg",
      contact: [s * 0.14, 0, -0.28],
    });
    b.sweep(hl, [0.085, 0.045], { color: COAT, sides: 8 });
    for (const [leg, x, z] of [
      [fl, s * 0.13, 0.2],
      [hl, s * 0.14, -0.28],
    ] as const) {
      const tip = leg.joints[leg.joints.length - 1];
      b.part(new THREE.SphereGeometry(1, 8, 6), PAD, {
        bone: tip,
        at: [x, 0.03, z + 0.015],
        scale: [0.055, 0.03, 0.075],
      });
      for (const k of [-1, 0, 1])
        b.part(new THREE.SphereGeometry(1, 6, 4), DARK, {
          bone: tip,
          at: [x + k * 0.028, 0.025, z + 0.085 - Math.abs(k) * 0.008],
          scale: [0.014, 0.014, 0.014],
        });
    }
  }

  // ---- head
  b.part(new THREE.SphereGeometry(1, 12, 8), COAT, { bone: head, at: [0, 0.43, 0.44], scale: [0.115, 0.115, 0.14] });
  b.frustumBox([0, 0.435, 0.5], [0, 0.41, 0.645], [0.2, 0.12], [0.17, 0.1], { bone: head, color: COAT });
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, { bone: head, at: [0, 0.415, 0.65], scale: [0.07, 0.045, 0.03] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 6, 4), "#1d1210", {
      bone: head,
      at: [s * 0.028, 0.42, 0.677],
      scale: [0.012, 0.009, 0.006],
    });
    // eyes
    b.part(new THREE.SphereGeometry(0.028, 8, 6), DARK, { bone: head, at: [s * 0.093, 0.47, 0.49] });
    b.part(new THREE.SphereGeometry(0.009, 6, 4), "#ffffff", { bone: head, at: [s * 0.104, 0.482, 0.508] });
    // eyebrow tuft
    b.rod([s * 0.08, 0.505, 0.5], [s * 0.105, 0.5, 0.47], 0.006, { bone: head, color: BACK });
    // ears
    b.part(new THREE.SphereGeometry(1, 8, 6), EAR, { bone: head, at: [s * 0.085, 0.535, 0.4], scale: [0.03, 0.04, 0.022] });
    b.part(new THREE.SphereGeometry(1, 6, 4), EAR_IN, {
      bone: head,
      at: [s * 0.088, 0.535, 0.412],
      scale: [0.018, 0.026, 0.01],
    });
    // teeth
    b.part(new THREE.BoxGeometry(0.02, 0.032, 0.01), TOOTH, { bone: head, at: [s * 0.012, 0.352, 0.645] });
    // whiskers
    for (const k of [-1, 0, 1])
      b.rod([s * 0.07, 0.41 + k * 0.012, 0.64], [s * 0.16, 0.42 + k * 0.03, 0.69], 0.0025, {
        bone: head,
        color: DARK,
      });
    // mouth line
    b.rod([s * 0.075, 0.385, 0.625], [s * 0.012, 0.388, 0.648], 0.003, { bone: head, color: DARK });
  }
  b.frustumBox([0, 0.345, 0.5], [0, 0.345, 0.63], [0.15, 0.05], [0.13, 0.05], { bone: jaw, color: TAN });

  // daisy behind the right ear
  const fc = [-0.06, 0.55, 0.37];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.014, 6, 4), "#ffffff", {
      bone: head,
      at: [fc[0] + Math.cos(a) * 0.02, fc[1] + 0.004, fc[2] + Math.sin(a) * 0.02],
      scale: [1, 0.5, 1],
    });
  }
  b.part(new THREE.SphereGeometry(0.01, 6, 4), "#ffd23a", { bone: head, at: [fc[0], fc[1] + 0.008, fc[2]] });

  // ---- bird
  const birdBody = b.joint("birdBody", { parent: head, at: [0, 0.585, 0.42], dir: [0, 1, 0] });
  const birdHead = b.joint("birdHead", { parent: birdBody, at: [0, 0.635, 0.44], dir: [0, 0.3, 1] });
  const wingL = b.joint("birdWingL", { parent: birdBody, at: [0.04, 0.595, 0.42], dir: [0.3, 0.2, -1], role: "wing" });
  const wingR = b.joint("birdWingR", { parent: birdBody, at: [-0.04, 0.595, 0.42], dir: [-0.3, 0.2, -1], role: "wing" });
  b.part(new THREE.SphereGeometry(1, 8, 6), BLUE, { bone: birdBody, at: [0, 0.586, 0.42], scale: [0.042, 0.042, 0.05] });
  b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, { bone: birdBody, at: [0, 0.575, 0.445], scale: [0.03, 0.03, 0.026] });
  b.part(new THREE.SphereGeometry(0.03, 8, 6), BLUE, { bone: birdHead, at: [0, 0.635, 0.44] });
  b.spike([0, 0.633, 0.465], [0, 0, 1], 0.03, 0.011, ORANGE, { bone: birdHead, sides: 6 });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.007, 6, 4), DARK, { bone: birdHead, at: [s * 0.02, 0.641, 0.462] });
    b.part(new THREE.SphereGeometry(0.009, 6, 4), "#ff9aa8", { bone: birdHead, at: [s * 0.026, 0.628, 0.455] });
  }
  for (const [s, w] of [
    [1, wingL],
    [-1, wingR],
  ] as const)
    b.part(new THREE.SphereGeometry(1, 8, 6), BLUE_DARK, {
      bone: w,
      at: [s * 0.045, 0.595, 0.41],
      scale: [0.012, 0.03, 0.045],
    });
  b.frustumBox([0, 0.6, 0.38], [0, 0.635, 0.325], [0.03, 0.01], [0.05, 0.01], { bone: birdBody, color: BLUE_DARK });
  for (const [k, dx] of [
    [0, 0],
    [1, 0.012],
    [2, -0.012],
  ] as const)
    b.spike([dx, 0.658, 0.435 - k * 0.004], [dx * 2, 1, -0.4], 0.035, 0.007, BLUE_DARK, { bone: birdHead, sides: 5 });

  return b.root;
}
