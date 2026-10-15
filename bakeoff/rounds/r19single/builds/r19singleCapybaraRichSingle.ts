// A chubby storybook capybara with a little bluebird dozing on its head. Toon-cel paints, fur-tuft cards, a daisy.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { countershade, gradient, grain, mottle, paint } from "../../../../src/paint";
import { interpolate } from "../../../../src/sweep";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";

export const meta = {
  name: "Capybara with Bluebird",
  description:
    "A plump, whimsical capybara with buck teeth, rosy cheeks and a daisy behind its ear, carrying a tiny bluebird on its head.",
  style: "whimsical",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const FUR_BASE = mottle("#c08a55", "#b27c49", { size: 0.16, seed: 2 });
const FUR = grain(FUR_BASE, "#9a6a3d", { size: 0.025, axis: "z", seed: 4 });
const BELLY = "#ecd09a";
const COAT = cel(countershade(FUR, BELLY, { level: -0.25, soft: 0.3 }));
const HEAD_P = cel(
  gradient(countershade(FUR, BELLY, { level: -0.4, soft: 0.3 }), "#6b452c", [0, 0.47, 0.6], [0, 0.47, 0.8]),
);
const LEG_P = cel(gradient(FUR, "#5b3b27", [0, 0.2, 0], [0, 0.07, 0]));
const TUFT_P = cel(mottle("#c99660", "#aa7440", { size: 0.1, seed: 7 }));
const JAW_P = cel("#e6c48e");
const EAR_OUT = cel("#6a4529");
const EAR_IN = cel("#e49a8c");
const NOSE = cel("#3d2a22");
const PAW = cel("#4d3324");
const NAIL = "#2b1d17";
const EYE_RIM = "#2e1c14";
const EYE = "#120c0a";
const WHITE = "#ffffff";
const BLUSH = "#ec8a64";
const TEETH = "#fbeec0";
const WHISK = "#4b3223";
const PETAL = "#fffaf0";
const DAISY = "#ffc933";

const BLUE = "#4aa3ea";
const BIRD_BODY = cel(paint((_p, n) => (n.y < -0.35 ? "#fff0d2" : n.y < 0.3 && n.z > 0.15 ? "#ff9d4a" : BLUE)));
const BIRD_HEAD = cel(paint((_p, n) => (n.y < -0.4 ? "#fff0d2" : BLUE)));
const WING = cel("#2f7fd0");
const FEATHER = "#1f5aa8";
const TAIL_TIP = "#0f3270";
const BEAK = "#ffb02e";
const BEAK_LOW = "#e68a1f";
const BIRD_FOOT = "#f2a03a";

const ball = (w = 8, h = 6) => new THREE.SphereGeometry(1, w, h);

const WING_FEATHER: OutlinePoint[] = [
  [0, 0],
  [0.02, 0.012],
  [0.05, 0.011],
  [0.075, 0, "sharp"],
  [0.05, -0.011],
  [0.02, -0.012],
];
const TAIL_FEATHER: OutlinePoint[] = [
  [0, 0],
  [0.03, 0.014],
  [0.085, 0.016],
  [0.12, 0, "sharp"],
  [0.085, -0.016],
  [0.03, -0.014],
];

export default function build() {
  const b = createBuilder({ name: "capybara" });

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.36, -0.33], dir: [0, 0, 1], role: "spine", group: "body" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.365, -0.2],
      [0, 0.37, 0.05],
      [0, 0.38, 0.3],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine", group: "body" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.385, 0.3],
      [0, 0.4, 0.38],
      [0, 0.43, 0.45],
    ]),
    { parent: spine.joints[1], names: ["neck1", "neck2"], role: "neck", group: "body" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.43, 0.45],
    dir: [0, 0.02, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.39, 0.5],
    aim: [0, 0.375, 0.75],
    role: "jaw",
    group: "head",
  });
  b.joint("tail", { parent: hips, at: [0, 0.33, -0.5], dir: [0, -0.2, -1], role: "tail", group: "body" });

  // -------------------------------------------------------------------------------------------------------------
  // Barrel body
  const T = [0, 0.12, 0.45, 0.78, 1];
  const RX = [0.11, 0.18, 0.2, 0.19, 0.125];
  const RY = [0.115, 0.19, 0.21, 0.2, 0.125];
  const bodyPath = catmull([
    [0, 0.34, -0.46],
    [0, 0.355, -0.3],
    [0, 0.365, -0.08],
    [0, 0.37, 0.15],
    [0, 0.385, 0.3],
    [0, 0.415, 0.4],
  ]);
  const body = b.sweep(
    bodyPath,
    (t: number): [number, number] => [interpolate(T, RX, t), interpolate(T, RY, t)],
    { bone: [hips, spine, neck], color: COAT, shift: [0, -0.02], sides: 12, group: "body" },
  );
  b.part(ball(8, 6), COAT, { bone: "tail", at: [0, 0.31, -0.585], scale: [0.035, 0.03, 0.028] });

  // -------------------------------------------------------------------------------------------------------------
  // Legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = s * 0.15;

    // Front leg: straight and short, elbow back.
    const fPts = limb([x, 0.31, 0.2], [x, 0.05, 0.22], [0.15, 0.14], [[0, 0, -1]]);
    const fLeg = b.chain(`legF${S}`, fPts, {
      parent: spine.joints[1],
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "leg",
      group: "legs",
    });
    b.sweep(fLeg, (t: number) => 0.07 - 0.025 * t, { color: LEG_P, sides: 8, group: "legs" });
    b.part(ball(10, 8), COAT, { bone: fLeg.joints[0], at: [x, 0.3, 0.2], scale: [0.085, 0.11, 0.12] });
    const fFoot = fLeg.joints[fLeg.joints.length - 1];
    b.part(ball(8, 6), PAW, { bone: fFoot, at: [x, 0.03, 0.235], scale: [0.052, 0.03, 0.07] });
    for (let k = 0; k < 4; k++) {
      const dx = (k - 1.5) * 0.026;
      const tip: [number, number, number] = [x + dx * 1.25, 0.021, 0.318 - Math.abs(k - 1.5) * 0.012];
      b.capsule([x + dx * 0.8, 0.03, 0.25], tip, 0.016, PAW, { bone: fFoot, sides: 6 });
      b.part(ball(6, 4), NAIL, { bone: fFoot, at: [tip[0], tip[1] - 0.001, tip[2] + 0.012], scale: [0.011, 0.009, 0.013] });
    }

    // Hind leg: thigh forward, hock back, foot flat.
    const hPts = limb(
      [x, 0.31, -0.3],
      [x, 0.045, -0.36],
      [0.17, 0.15, 0.09],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hLeg = b.chain(`legH${S}`, hPts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `foot${S}`],
      role: "leg",
      group: "legs",
    });
    b.sweep(hLeg, [0.095, 0.065, 0.05, 0.046], { color: LEG_P, sides: 8, group: "legs" });
    b.part(ball(10, 8), COAT, { bone: hLeg.joints[0], at: [x + s * 0.005, 0.3, -0.3], scale: [0.09, 0.12, 0.13] });
    const hFoot = hLeg.joints[hLeg.joints.length - 1];
    b.part(ball(8, 6), PAW, { bone: hFoot, at: [x, 0.03, -0.33], scale: [0.05, 0.03, 0.07] });
    for (let k = 0; k < 3; k++) {
      const dx = (k - 1) * 0.03;
      const tip: [number, number, number] = [x + dx * 1.3, 0.021, -0.272 - Math.abs(k - 1) * 0.01];
      b.capsule([x + dx * 0.8, 0.03, -0.34], tip, 0.017, PAW, { bone: hFoot, sides: 6 });
      b.part(ball(6, 4), NAIL, { bone: hFoot, at: [tip[0], tip[1] - 0.001, tip[2] + 0.012], scale: [0.012, 0.01, 0.014] });
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Head: blunt skull and snout, jaw, nose, teeth, eyes, ears, whiskers
  const headLoft = b.loft(
    [
      { at: [0, 0.47, 0.38], w: 0.3, h: 0.32 },
      { at: [0, 0.48, 0.52], w: 0.3, h: 0.31 },
      { at: [0, 0.475, 0.64], w: 0.27, h: 0.27 },
      { at: [0, 0.465, 0.7], w: 0.22, h: 0.21 },
    ],
    { bone: head, color: HEAD_P, sides: 12, group: "head" },
  );
  b.sweep(
    [
      [0, 0.352, 0.5],
      [0, 0.35, 0.7],
    ],
    (t: number): [number, number] => [0.09 - 0.02 * t, 0.032],
    { bone: jaw, color: JAW_P, sides: 8, group: "head" },
  );
  b.part(ball(10, 8), NOSE, { bone: head, at: [0, 0.475, 0.795], scale: [0.07, 0.045, 0.035] });
  b.part(ball(8, 6), HEAD_P, { bone: head, at: [0, 0.565, 0.72], scale: [0.035, 0.018, 0.04] });
  for (const s of [1, -1]) {
    b.part(ball(6, 4), EYE, { bone: head, at: [s * 0.032, 0.48, 0.824], scale: [0.015, 0.01, 0.008] });
    b.part(new THREE.BoxGeometry(0.022, 0.036, 0.012), TEETH, { bone: head, at: [s * 0.013, 0.405, 0.797] });
  }
  b.rod([0, 0.46, 0.815], [0, 0.415, 0.805], 0.004, EYE_RIM, { bone: head, sides: 4 });

  for (const s of [1, -1]) {
    // Eyes: rim, bead and two highlights.
    const e: [number, number, number] = [s * 0.135, 0.525, 0.56];
    b.part(ball(8, 6), EYE_RIM, { bone: head, at: e, scale: [0.02, 0.036, 0.036] });
    b.part(ball(8, 6), EYE, { bone: head, at: [e[0] + s * 0.006, e[1], e[2] + 0.002], scale: [0.018, 0.029, 0.029] });
    b.part(ball(6, 4), WHITE, { bone: head, at: [e[0] + s * 0.017, e[1] + 0.012, e[2] + 0.01], scale: [0.007, 0.01, 0.01] });
    b.part(ball(6, 4), WHITE, { bone: head, at: [e[0] + s * 0.019, e[1] - 0.012, e[2] - 0.008], scale: [0.004, 0.005, 0.005] });

    // Rosy cheeks.
    b.part(ball(8, 6), BLUSH, { bone: head, at: [s * 0.133, 0.445, 0.6], scale: [0.01, 0.028, 0.038] });

    // Ears.
    b.part(ball(8, 6), EAR_OUT, { bone: head, at: [s * 0.105, 0.605, 0.36], rotation: [0, 0, -s * 22], scale: [0.02, 0.046, 0.04] });
    b.part(ball(8, 6), EAR_IN, { bone: head, at: [s * 0.108, 0.605, 0.375], rotation: [0, 0, -s * 22], scale: [0.012, 0.034, 0.028] });

    // Whiskers.
    for (let j = 0; j < 3; j++) {
      const by = 0.435 + 0.02 * j;
      b.rod([s * 0.07, by, 0.775], [s * 0.2, by + 0.03 * (j - 1), 0.83 + 0.01 * j], [0.004, 0.0015], WHISK, {
        bone: head,
        sides: 4,
      });
    }
  }

  // A daisy tucked in front of the left ear.
  const daisyAt: [number, number, number] = [0.105, 0.592, 0.47];
  const daisyDir: [number, number, number] = [0.45, 0.85, 0.25];
  const petal = ball(6, 4);
  petal.scale(0.0065, 0.014, 0.002);
  petal.translate(0, 0.011, 0);
  b.ring(frame(daisyAt, daisyDir), { count: 8, radius: 0.008 }, (item) =>
    b.stick(petal, PETAL, item, { bone: head, embed: 0 }),
  );
  b.part(ball(8, 6), DAISY, { bone: head, at: [daisyAt[0] + 0.003, daisyAt[1] + 0.006, daisyAt[2] + 0.002], scale: 0.011 });

  // -------------------------------------------------------------------------------------------------------------
  // Fur tufts
  const tuft = svg(
    `<svg viewBox="0 0 32 64"><path d="M2 64 Q8 34 12 6 Q15 34 18 64Z" fill="#ffffff"/><path d="M10 64 Q16 30 20 0 Q25 32 26 64Z" fill="#f2f2f2"/><path d="M18 64 Q24 40 30 14 Q30 44 30 64Z" fill="#e6e6e6"/></svg>`,
    { size: 128 },
  );
  const bodyHits = b.surface(body).scatter(420, { rng: rng(3), minDist: 0.035, filter: (h) => h.n.y > -0.3 });
  b.cards(bodyHits, tuft, {
    size: [0.045, 0.07],
    lean: 70,
    bend: 25,
    flow: [0, -0.25, -1],
    vary: 0.3,
    spin: 20,
    rng: rng(4),
    color: TUFT_P,
    sink: 0.2,
    group: "body",
  });
  const headHits = b.surface(headLoft).scatter(70, {
    rng: rng(5),
    minDist: 0.032,
    filter: (h) =>
      h.n.y > 0.1 &&
      h.at.z > 0.3 &&
      h.at.z < 0.66 &&
      !(Math.abs(h.at.x) < 0.08 && h.at.z > 0.42 && h.at.z < 0.58) &&
      !(h.at.x > 0.07 && h.at.z > 0.42 && h.at.z < 0.52),
  });
  b.cards(headHits, tuft, {
    size: [0.03, 0.045],
    lean: 75,
    bend: 20,
    flow: [0, -0.2, -1],
    vary: 0.3,
    spin: 20,
    rng: rng(6),
    color: TUFT_P,
    sink: 0.2,
    group: "head",
  });

  // -------------------------------------------------------------------------------------------------------------
  // The bluebird
  const BY = 0.695;
  const birdBody = b.joint("birdBody", { parent: head, at: [0, BY, 0.5], dir: [0, 1, 0], role: "spine", group: "bird" });
  const birdHead = b.joint("birdHead", {
    parent: birdBody,
    at: [0, BY + 0.035, 0.52],
    dir: [0, 0.4, 1],
    role: "head",
    group: "bird",
  });
  const beakLow = b.joint("beakLower", {
    parent: birdHead,
    at: [0, BY + 0.04, 0.57],
    dir: [0, -0.12, 1],
    role: "jaw",
    group: "bird",
  });
  const tailB = b.joint("birdTail", {
    parent: birdBody,
    at: [0, BY - 0.005, 0.45],
    dir: [0, 0.15, -1],
    role: "tail",
    group: "bird",
  });

  b.part(ball(12, 8), BIRD_BODY, { bone: birdBody, at: [0, BY, 0.5], scale: [0.058, 0.055, 0.068] });
  b.part(ball(12, 8), BIRD_HEAD, { bone: birdHead, at: [0, BY + 0.045, 0.54], scale: [0.043, 0.041, 0.043] });
  b.spike([0, BY + 0.045, 0.572], [0, -0.08, 1], 0.034, 0.013, BEAK, { bone: birdHead, sides: 6 });
  b.spike([0, BY + 0.037, 0.572], [0, -0.12, 1], 0.026, 0.009, BEAK_LOW, { bone: beakLow, sides: 6 });

  // Crest
  for (const c of [-1, 0, 1]) {
    b.spike([c * 0.009, BY + 0.081, 0.535 - Math.abs(c) * 0.005], [c * 0.3, 1, -0.7], 0.04, 0.008, TAIL_TIP, {
      bone: birdHead,
      sides: 5,
    });
  }

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // Eyes
    const e: [number, number, number] = [s * 0.034, BY + 0.05, 0.565];
    b.part(ball(6, 4), EYE, { bone: birdHead, at: e, scale: 0.011 });
    b.part(ball(4, 3), WHITE, { bone: birdHead, at: [e[0] + s * 0.004, e[1] + 0.005, e[2] + 0.006], scale: 0.004 });

    // Wing: hinge joint, body ellipsoid and a fan of flight feathers.
    const wing = b.joint(`wing${S}`, {
      parent: birdBody,
      at: [s * 0.05, BY + 0.02, 0.52],
      dir: [s * 0.1, -0.15, -1],
      role: "wing",
      group: "bird",
    });
    b.part(ball(10, 8), WING, {
      bone: wing,
      at: [s * 0.052, BY + 0.005, 0.495],
      rotation: [-10, 0, 0],
      scale: [0.013, 0.04, 0.055],
    });
    for (let k = 0; k < 3; k++) {
      const a = 0.12 * k;
      b.extrude(WING_FEATHER, {
        at: [s * 0.056, BY + 0.004 - 0.013 * k, 0.455],
        x: [0, -a, -1],
        y: [0, 1, -a],
        thickness: 0.004,
        color: k === 1 ? TAIL_TIP : FEATHER,
        bone: wing,
      });
    }

    // Legs and toes gripping the fur.
    const leg = b.joint(`birdLeg${S}`, {
      parent: birdBody,
      at: [s * 0.025, BY - 0.03, 0.5],
      dir: [0, -1, 0],
      role: "leg",
      group: "bird",
    });
    b.rod([s * 0.025, BY - 0.03, 0.5], [s * 0.025, 0.654, 0.505], 0.005, BIRD_FOOT, { bone: leg, sides: 5 });
    for (const dx of [-0.01, 0, 0.01]) {
      b.capsule([s * 0.025, 0.655, 0.505], [s * 0.025 + dx, 0.653, 0.54], 0.004, BIRD_FOOT, { bone: leg, sides: 5 });
    }
    b.capsule([s * 0.025, 0.655, 0.505], [s * 0.025, 0.653, 0.478], 0.004, BIRD_FOOT, { bone: leg, sides: 5 });
  }

  // Tail feathers fanned behind.
  for (const sx of [-0.2, 0, 0.2]) {
    b.extrude(TAIL_FEATHER, {
      at: [0, BY - 0.012, 0.44],
      x: [sx, 0.15, -1],
      y: [1, 0, sx],
      thickness: 0.004,
      color: paint((_p, _n, st) => (st[0] > 0.095 ? TAIL_TIP : FEATHER)),
      bone: tailB,
    });
  }

  return b.root;
}
