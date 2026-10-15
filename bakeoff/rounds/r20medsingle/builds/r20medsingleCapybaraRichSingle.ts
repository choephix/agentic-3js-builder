import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { countershade, mottle, paint } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { cel, furEdge, INK } from "../../../../kits/toon";

export const meta = {
  name: "Capybara with Songbird",
  description:
    "A chubby, sleepy-eyed capybara with buck teeth, a reed in its mouth and a yuzu on its head, while a tiny round songbird perches on its crown.",
  style: "whimsical",
  commit: "88fc1f0",
};

// Palette
const FUR = "#b9824f";
const FUR_DARK = "#9a6a3f";
const BELLY = "#e0bf8c";
const LEG_A = "#8d5f38";
const LEG_B = "#7a5030";
const SKIN_DARK = "#5b3d2e";
const TOE = "#6a4733";
const NAIL = "#2b1d16";
const NOSE = "#4a2f26";
const EYE = "#24150f";
const WHITE = "#fffaf0";
const BLUSH = "#f2a08c";
const EAR_IN = "#e9a58f";
const JAW = "#cfa673";
const TOOTH = "#fff3d6";
const REED = "#6fb85a";
const YUZU = "#ffc83a";
const YUZU_B = "#f0a61f";
const BIRD_BLUE = "#3fb7c9";
const BIRD_YEL = "#ffe27a";
const BIRD_CAP = "#e8483f";
const BIRD_BEAK = "#ff9a3c";
const WING_A = "#2c93b3";
const WING_B = "#1f6f94";
const WHISKER = "#3a2a22";

export default function build() {
  const b = createBuilder({ name: "capybara" });

  // Paints
  const coatBase = mottle(FUR, FUR_DARK, { size: 0.07, contrast: 0.6, seed: 3 });
  const COAT = cel(furEdge(coatBase, BELLY, { level: -0.3, teeth: 0.22, period: 0.032 }));
  const HEADP = cel(
    furEdge(coatBase, BELLY, { by: "position", axis: [0, 1, 0], level: 0.43, teeth: 0.02, period: 0.03, along: [1, 0, 0] }),
  );
  const LEGP = cel(mottle(LEG_A, LEG_B, { size: 0.06, seed: 5 }));
  const BIRDP = cel(countershade(BIRD_BLUE, BIRD_YEL, { level: 0, soft: 0.25 }));
  const BIRDHEAD = cel(countershade(BIRD_CAP, BIRD_YEL, { level: 0.45, soft: 0.1 }));
  const WINGP = paint((_p, _n, s) => (Math.floor(s[0] / 0.025) % 2 === 0 ? WING_A : WING_B));

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.37, -0.3], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.37, -0.3],
      [0, 0.39, -0.12],
      [0, 0.4, 0.05],
      [0, 0.42, 0.2],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.42, 0.2],
      [0, 0.46, 0.31],
      [0, 0.49, 0.42],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.49, 0.42], aim: [0, 0.48, 0.7], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.41, 0.58], aim: [0, 0.4, 0.76], role: "jaw" });
  const tail = b.chain(
    "tail",
    [
      [0, 0.36, -0.5],
      [0, 0.35, -0.58],
    ],
    { parent: hips, names: ["tail1", "tail2"], role: "tail" },
  );

  // Body
  const body = b.loft(
    [
      { at: [0, 0.36, -0.42], w: 0.3, h: 0.3 },
      { at: [0, 0.37, -0.28], w: 0.46, h: 0.42 },
      { at: [0, 0.38, -0.08], w: 0.52, h: 0.46 },
      { at: [0, 0.39, 0.12], w: 0.5, h: 0.45 },
      { at: [0, 0.4, 0.24], w: 0.4, h: 0.38 },
    ],
    { bone: spine, color: COAT, name: "body" },
  );
  b.part(new THREE.SphereGeometry(0.032, 6, 5), FUR_DARK, {
    bone: tail.joints[0],
    at: [0, 0.355, -0.57],
    scale: [1, 0.8, 1.3],
  });

  // Head
  const skull = b.loft(
    [
      { at: [0, 0.5, 0.42], w: 0.3, h: 0.3 },
      { at: [0, 0.5, 0.56], w: 0.29, h: 0.28 },
      { at: [0, 0.48, 0.7], w: 0.22, h: 0.2 },
    ],
    { bone: head, color: HEADP, name: "skull" },
  );
  b.part(new THREE.SphereGeometry(0.055, 8, 6), NOSE, { bone: head, at: [0, 0.48, 0.79], scale: [1.1, 0.8, 0.85] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.01, 5, 4), EYE, { bone: head, at: [s * 0.024, 0.506, 0.822], scale: [1, 0.6, 1.2] });
    // eyes with sleepy lids
    const E = [s * 0.122, 0.572, 0.575];
    b.part(new THREE.SphereGeometry(0.028, 8, 6), EYE, { bone: head, at: E });
    b.part(new THREE.SphereGeometry(0.007, 5, 4), WHITE, { bone: head, at: [E[0] + s * 0.013, E[1] - 0.004, E[2] + 0.017] });
    b.part(new THREE.SphereGeometry(0.0305, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), HEADP, {
      bone: head,
      at: [E[0], E[1] + 0.002, E[2]],
      dir: [s * 0.3, 1, 0.3],
    });
    // cheeks
    b.part(new THREE.SphereGeometry(0.03, 7, 5), BLUSH, { bone: head, at: [s * 0.137, 0.51, 0.62], scale: [0.35, 1, 1] });
    // ears
    b.part(new THREE.SphereGeometry(0.045, 8, 6), FUR_DARK, {
      bone: head,
      at: [s * 0.095, 0.625, 0.45],
      dir: [s * 0.7, 0.3, 0.1],
      axis: "z",
      scale: [1, 1.1, 0.5],
    });
    b.part(new THREE.SphereGeometry(0.03, 7, 5), EAR_IN, {
      bone: head,
      at: [s * 0.104, 0.627, 0.455],
      dir: [s * 0.7, 0.3, 0.1],
      axis: "z",
      scale: [1, 1.1, 0.4],
    });
    // buck teeth
    b.part(new THREE.BoxGeometry(0.017, 0.04, 0.01), TOOTH, { bone: head, at: [s * 0.011, 0.425, 0.79] });
    // whiskers
    for (let k = 0; k < 3; k++) {
      b.rod([s * 0.08, 0.455 + k * 0.012, 0.76], [s * (0.2 + k * 0.01), 0.45 + k * 0.035, 0.72 - k * 0.02], 0.0025, {
        color: WHISKER,
        bone: head,
      });
    }
  }
  // lower jaw
  b.capsule([0, 0.4, 0.6], [0, 0.395, 0.76], [0.07, 0.055], { color: JAW, bone: jaw, name: "jaw" });
  b.part(new THREE.SphereGeometry(0.03, 6, 5), JAW, { bone: jaw, at: [0, 0.34, 0.74], scale: [1.2, 0.7, 1] });
  // reed in mouth
  b.rod([0.025, 0.4, 0.72], [0.12, 0.46, 0.88], 0.004, { color: REED, bone: jaw });
  b.rod([0.12, 0.46, 0.88], [0.15, 0.5, 0.93], 0.003, { color: "#9bd36d", bone: jaw });
  // smile
  const headSkin = b.surface(skull);
  for (const s of [1, -1]) {
    const smile = headSkin.drape(
      catmull([
        [s * 0.035, 0.425, 0.775],
        [s * 0.085, 0.43, 0.735],
        [s * 0.108, 0.44, 0.69],
      ]),
      { lift: 0.003 },
    );
    b.sweep(smile, 0.004, { color: INK, bone: head });
  }

  // Legs
  const addFoot = (bone: Joint, x: number, z: number, count: number, r: number, gap: number) => {
    b.part(new THREE.SphereGeometry(0.055, 8, 6), SKIN_DARK, { bone, at: [x, 0.022, z + 0.02], scale: [1, 0.4, 1.3] });
    for (let i = 0; i < count; i++) {
      const dx = (i - (count - 1) / 2) * gap;
      b.capsule([x + dx, 0.02, z + 0.02], [x + dx * 1.25, 0.02, z + 0.08], r, { color: TOE, bone });
      b.spike([x + dx * 1.25, 0.02, z + 0.092], [0, 0, 1], 0.02, r * 0.75, { color: NAIL, bone });
    }
  };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const fPts = limb([s * 0.16, 0.29, 0.15], [s * 0.16, 0.05, 0.17], [0.13, 0.13], [[0, 0, -1]]);
    const fLeg = b.chain(`legF${side}`, fPts, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "leg",
      contact: [s * 0.16, 0, 0.17],
    });
    b.sweep(fLeg, [0.085, 0.062, 0.05], { color: LEGP });
    addFoot(fLeg.joints[fLeg.joints.length - 1], s * 0.16, 0.17, 4, 0.0155, 0.018);

    const hPts = limb(
      [s * 0.17, 0.31, -0.28],
      [s * 0.17, 0.05, -0.33],
      [0.13, 0.12, 0.08],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hLeg = b.chain(`legH${side}`, hPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
      role: "leg",
      contact: [s * 0.17, 0, -0.33],
    });
    b.sweep(hLeg, [0.11, 0.075, 0.055, 0.05], { color: LEGP });
    addFoot(hLeg.joints[hLeg.joints.length - 1], s * 0.17, -0.33, 3, 0.0185, 0.022);
  }

  // Fur tufts
  const tuft = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 0 Q24 20 26 64 L6 64 Q8 20 16 0Z" fill="#ffffff"/><path d="M16 6 L16 64" stroke="#d8d8d8" stroke-width="3" fill="none"/></svg>`,
    { size: 64 },
  );
  const bodySkin = b.surface(body);
  const bodyHits = bodySkin.scatter(300, { rng: rng(7), minDist: 0.04, filter: (h) => h.n.y > -0.4 });
  b.cards(bodyHits, tuft, { size: [0.05, 0.06], lean: 75, bend: 20, vary: 0.3, rng: rng(8), color: COAT, bone: spine.joints[1] });
  const headHits = headSkin.scatter(80, { rng: rng(9), minDist: 0.035, filter: (h) => h.n.y > 0.1 && h.at.z < 0.68 });
  b.cards(headHits, tuft, { size: [0.03, 0.04], lean: 70, vary: 0.3, rng: rng(10), color: HEADP, bone: head });

  // Yuzu on the head
  b.part(new THREE.SphereGeometry(0.032, 8, 6), mottle(YUZU, YUZU_B, { size: 0.02, seed: 2 }), {
    bone: head,
    at: [-0.085, 0.633, 0.43],
    scale: [1, 0.9, 1],
  });
  b.extrude(
    [
      [0, 0],
      [0.02, 0.012],
      [0.045, 0],
      [0.02, -0.012],
    ],
    { at: [-0.085, 0.662, 0.43], x: [-0.8, 0, 0.6], y: [0.6, 0, 0.8], thickness: 0.004, smoothing: 1, color: REED, bone: head },
  );

  // Songbird
  const birdBody = b.joint("birdBody", { parent: head, at: [0, 0.675, 0.5], dir: [0, 0, 1] });
  const birdHead = b.joint("birdHead", { parent: birdBody, at: [0, 0.715, 0.535], dir: [0, 0.3, 1] });
  const birdTail = b.joint("birdTail", { parent: birdBody, at: [0, 0.69, 0.46], aim: [0, 0.71, 0.36] });
  b.part(new THREE.SphereGeometry(0.05, 10, 8), BIRDP, { bone: birdBody, at: [0, 0.685, 0.5], scale: [1, 0.95, 1.2] });
  b.part(new THREE.SphereGeometry(0.037, 10, 8), BIRDHEAD, { bone: birdHead, at: [0, 0.722, 0.54] });
  b.part(new THREE.ConeGeometry(0.012, 0.03, 6), BIRD_BEAK, { bone: birdHead, at: [0, 0.717, 0.585], dir: [0, -0.05, 1] });
  b.part(new THREE.ConeGeometry(0.009, 0.024, 6), "#e2742a", { bone: birdHead, at: [0, 0.709, 0.58], dir: [0, -0.05, 1] });
  for (const dx of [-0.012, 0, 0.012])
    b.spike([dx, 0.752, 0.535], [dx * 3, 1, -0.5], 0.03, 0.008, { color: BIRD_CAP, bone: birdHead });
  b.extrude(
    [
      [0, -0.012],
      [0.1, -0.026],
      [0.11, 0],
      [0.1, 0.026],
      [0, 0.012],
    ],
    { at: [0, 0.69, 0.455], x: [0, 0.25, -1], y: [1, 0, 0], thickness: 0.006, smoothing: 1, color: WING_B, bone: birdTail },
  );
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const wing = b.joint(`birdWing${side}`, {
      parent: birdBody,
      at: [s * 0.05, 0.7, 0.53],
      aim: [s * 0.05, 0.68, 0.43],
      role: "wing",
    });
    b.extrude(
      [
        [0, 0.03],
        [0.04, 0.035],
        [0.1, 0],
        [0.12, -0.015],
        [0.05, -0.035],
        [0, -0.02],
      ],
      { at: [s * 0.05, 0.695, 0.53], x: [s * 0.12, 0, -1], y: [0, 1, 0], thickness: 0.01, bevel: 0.003, smoothing: 1, color: WINGP, bone: wing },
    );
    b.part(new THREE.SphereGeometry(0.0085, 6, 4), EYE, { bone: birdHead, at: [s * 0.03, 0.73, 0.563] });
    b.part(new THREE.SphereGeometry(0.003, 4, 3), WHITE, { bone: birdHead, at: [s * 0.034, 0.734, 0.569] });
    b.part(new THREE.SphereGeometry(0.008, 5, 4), BLUSH, { bone: birdHead, at: [s * 0.032, 0.714, 0.556], scale: [0.5, 1, 1] });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), BIRD_BEAK, { bone: birdBody, at: [s * 0.018, 0.648, 0.51], scale: [1, 0.5, 1.5] });
  }

  return b.root;
}
