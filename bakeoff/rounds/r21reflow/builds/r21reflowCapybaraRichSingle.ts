import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { countershade, gradient, mottle, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, furEdge, INK } from "../../../../kits/toon";

export const meta = {
  name: "Capybara with a Small Bird",
  description:
    "A plump, serene storybook capybara with a cel-shaded cinnamon coat, fur tufts, whiskers and a little blue-and-yellow bird perched on its head.",
  style: "whimsical",
  commit: "88fc1f0",
};

const COAT_A = "#cf8c4c";
const COAT_B = "#b9763a";
const BELLY = "#e9bf86";
const DARKBROWN = "#7b5238";
const MUZZLE = "#b98250";
const NOSE = "#5a3a38";
const TOE = "#5b3e30";
const NAIL = "#2e2019";
const EARIN = "#8a5a52";
const WHITE = "#ffffff";
const TEETH = "#ecc878";
const BLUE = "#6f97c9";
const BLUEDK = "#4c6fa6";
const YELLOW = "#f3c744";
const BWHITE = "#fbf3dc";
const BEAK = "#2d2a2e";
const BLEG = "#4a4048";

export default function build() {
  const b = createBuilder({ name: "capybara" });
  const rand = rng(11);

  const ball = (r = 1) => new THREE.SphereGeometry(r, 10, 7);

  // Paints
  const coatBase = mottle(COAT_A, COAT_B, { size: 0.12, seed: 4, contrast: 0.8 });
  const COAT = cel(furEdge(coatBase, BELLY, { level: -0.28, teeth: 0.2, period: 0.03 }));
  const LEGP = cel(gradient(coatBase, DARKBROWN, [0, 0.22, 0], [0, 0.07, 0]));
  const MUZP = cel(furEdge(MUZZLE, BELLY, { level: -0.3, teeth: 0.15, period: 0.025 }));
  const JAWP = cel(BELLY);
  const NOSEP = cel(NOSE);

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.37, -0.4], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.37, -0.4],
      [0, 0.38, -0.15],
      [0, 0.4, 0.12],
      [0, 0.43, 0.36],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.43, 0.36],
      [0, 0.48, 0.46],
      [0, 0.52, 0.56],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.52, 0.56], dir: [0, -0.05, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.44, 0.7], aim: [0, 0.42, 0.9], role: "jaw" });
  const tail = b.joint("tail", { parent: hips, at: [0, 0.36, -0.56], dir: [0, -0.3, -1], role: "tail" });

  // Body
  const body = b.loft(
    [
      { at: [0, 0.36, -0.58], w: 0.22, h: 0.28 },
      { at: [0, 0.38, -0.42], w: 0.42, h: 0.44 },
      { at: [0, 0.39, -0.1], w: 0.46, h: 0.46 },
      { at: [0, 0.41, 0.2], w: 0.44, h: 0.46 },
      { at: [0, 0.45, 0.38], w: 0.36, h: 0.4 },
      { at: [0, 0.5, 0.5], w: 0.26, h: 0.28 },
    ],
    { bone: [hips, spine, neck], color: COAT, name: "body" },
  );

  // Legs
  type Side = 1 | -1;
  const legs = (front: boolean, s: Side) => {
    const side = s > 0 ? "L" : "R";
    const root: [number, number, number] = front ? [s * 0.15, 0.3, 0.26] : [s * 0.16, 0.3, -0.4];
    const foot: [number, number, number] = front ? [s * 0.14, 0.04, 0.3] : [s * 0.15, 0.04, -0.37];
    const pts = limb(root, foot, [0.15, 0.15], [front ? [0, 0, -1] : [0, 0, 1]]);
    const names = front ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`] : [`hip${side}`, `knee${side}`, `ankle${side}`];
    const chain = b.chain(front ? `legF${side}` : `legH${side}`, pts, {
      parent: front ? spine.joints[2] : hips,
      names,
      role: "leg",
    });
    b.sweep(chain, [0.1, 0.08, 0.05, 0.04], LEGP, { sides: 8 });
    const tip = chain.joints[chain.joints.length - 1];
    // foot pad
    b.part(ball(0.045), TOE, { bone: tip, at: [foot[0], 0.027, foot[2] + 0.02], scale: [1, 0.6, 1.3] });
    const n = front ? 4 : 3;
    for (let k = 0; k < n; k++) {
      const off = k - (n - 1) / 2;
      const tx = foot[0] + off * 0.03;
      const tz = foot[2] + 0.055 - Math.abs(off) * 0.006;
      b.part(ball(0.02), TOE, { bone: tip, at: [tx, 0.024, tz], scale: [0.9, 0.8, 1.5] });
      b.spike([tx, 0.022, tz + 0.025], [off * 0.08, -0.25, 1], 0.022, 0.009, NAIL, { bone: tip, sides: 5 });
    }
  };
  for (const s of [1, -1] as const) {
    legs(true, s);
    legs(false, s);
  }

  // Tail nub
  b.part(ball(0.035), COAT, { bone: tail, at: [0, 0.35, -0.6], scale: [1, 0.8, 1] });

  // Head
  const skull = b.part(ball(), COAT, { bone: head, at: [0, 0.53, 0.66], scale: [0.15, 0.15, 0.2] });
  const snout = b.part(ball(), MUZP, { bone: head, at: [0, 0.47, 0.82], scale: [0.12, 0.11, 0.14] });
  b.part(ball(), NOSEP, { bone: head, at: [0, 0.5, 0.945], scale: [0.06, 0.045, 0.04] });
  for (const s of [1, -1]) {
    b.part(ball(0.012), INK, { bone: head, at: [s * 0.025, 0.5, 0.982], scale: [1, 0.8, 0.8] });
    // cheeks
    b.part(ball(), COAT, { bone: head, at: [s * 0.1, 0.46, 0.7], scale: [0.07, 0.08, 0.1] });
    // eyes
    b.part(ball(0.022), INK, { bone: head, at: [s * 0.103, 0.58, 0.78] });
    b.part(ball(0.007), WHITE, { bone: head, at: [s * 0.118, 0.589, 0.792] });
    b.part(ball(0.028), DARKBROWN, { bone: head, at: [s * 0.099, 0.578, 0.775], scale: [0.7, 0.9, 0.9] });
    // ears
    b.part(ball(), COAT, {
      bone: head,
      at: [s * 0.095, 0.635, 0.56],
      scale: [0.016, 0.038, 0.03],
      rotation: [0, 0, -s * 25],
    });
    b.part(ball(), EARIN, {
      bone: head,
      at: [s * 0.106, 0.633, 0.562],
      scale: [0.01, 0.028, 0.022],
      rotation: [0, 0, -s * 25],
    });
    // whiskers
    for (let k = 0; k < 4; k++) {
      const y = 0.45 + k * 0.012;
      b.rod([s * 0.1, y, 0.9], [s * 0.26, y + 0.03 - k * 0.025, 0.96 + k * 0.01], 0.0015, "#5a4030", { bone: head, sides: 4 });
    }
    b.rod([s * 0.09, 0.62, 0.8], [s * 0.15, 0.68, 0.84], 0.0015, "#5a4030", { bone: head, sides: 4 });
    // teeth
    b.rod([s * 0.008, 0.432, 0.956], [s * 0.008, 0.416, 0.952], 0.007, TEETH, { bone: jaw, sides: 5 });
  }
  // lower jaw
  b.part(ball(), JAWP, { bone: jaw, at: [0, 0.4, 0.82], scale: [0.085, 0.055, 0.12] });
  // mouth line and philtrum
  b.sweep(
    catmull([
      [0.09, 0.44, 0.885],
      [0.05, 0.435, 0.94],
      [0, 0.43, 0.958],
      [-0.05, 0.435, 0.94],
      [-0.09, 0.44, 0.885],
    ]),
    0.003,
    INK,
    { bone: head, sides: 4 },
  );
  b.rod([0, 0.49, 0.985], [0, 0.435, 0.957], 0.003, INK, { bone: head, sides: 4 });

  // Fur tufts
  const tuft = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 0 C20 20 26 44 30 64 L2 64 C6 44 12 20 16 0Z" fill="#ffffff"/><path d="M16 8 C17 28 19 46 22 64 L14 64 C14 46 14 28 16 8Z" fill="#d9d9d9"/></svg>`,
    { size: 128 },
  );
  const bodyHits = b.surface(body).scatter(430, { rng: rng(3), minDist: 0.035, filter: (h) => h.n.y > -0.3 });
  b.cards(bodyHits, tuft, { size: [0.035, 0.055], lean: 70, bend: 25, vary: 0.3, spin: 25, rng: rng(4), color: COAT });
  const headHits = b.surface(skull).scatter(110, { rng: rng(5), minDist: 0.03, filter: (h) => h.n.y > -0.2 && h.n.z < 0.7 });
  b.cards(headHits, tuft, { size: [0.025, 0.04], lean: 70, bend: 20, vary: 0.3, spin: 25, rng: rng(6), color: COAT });
  void rand;
  void snout;

  // Bird
  const birdBody = b.joint("birdBody", { parent: head, at: [0, 0.72, 0.6], dir: [0, 0, 1] });
  const birdHead = b.joint("birdHead", { parent: birdBody, at: [0, 0.76, 0.64], dir: [0.2, 0.3, 1], role: "head" });
  const birdTail = b.joint("birdTail", { parent: birdBody, at: [0, 0.735, 0.56], aim: [0, 0.72, 0.47], role: "tail" });
  b.part(ball(), cel(countershade(BLUE, YELLOW, { level: -0.1, soft: 0.3 })), {
    bone: birdBody,
    at: [0, 0.738, 0.6],
    scale: [0.032, 0.032, 0.05],
  });
  b.part(ball(), cel(countershade(BLUE, BWHITE, { level: 0.15 })), {
    bone: birdHead,
    at: [0, 0.775, 0.645],
    scale: [0.026, 0.026, 0.026],
  });
  b.spike([0, 0.775, 0.665], [0, -0.05, 1], 0.022, 0.008, BEAK, { bone: birdHead, sides: 5 });
  b.frustumBox([0, 0.735, 0.56], [0, 0.72, 0.47], [0.03, 0.006], [0.04, 0.004], {
    bone: birdTail,
    color: cel(BLUEDK),
  });
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(ball(0.006), INK, { bone: birdHead, at: [s * 0.021, 0.78, 0.658] });
    b.rod([s * 0.024, 0.786, 0.652], [s * 0.02, 0.784, 0.625], 0.004, INK, { bone: birdHead, sides: 4 });
    const wing = b.joint(`wing${side}`, {
      parent: birdBody,
      at: [s * 0.03, 0.75, 0.62],
      aim: [s * 0.04, 0.74, 0.55],
      role: "wing",
    });
    b.part(ball(), cel(stripes(BLUEDK, BWHITE, { size: 0.014, axis: "z", width: 0.25 })), {
      bone: wing,
      at: [s * 0.033, 0.745, 0.585],
      scale: [0.009, 0.022, 0.04],
    });
    b.rod([s * 0.012, 0.708, 0.6], [s * 0.012, 0.668, 0.6], 0.003, BLEG, { bone: birdBody, sides: 4 });
    for (let k = -1; k <= 1; k++) {
      b.rod([s * 0.012, 0.669, 0.6], [s * 0.012 + k * 0.008, 0.668, 0.622], 0.0022, BLEG, { bone: birdBody, sides: 4 });
    }
  }

  return b.root;
}
