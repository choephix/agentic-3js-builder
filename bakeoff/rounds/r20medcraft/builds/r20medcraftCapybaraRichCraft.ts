import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { limb } from "../../../../src/ik";
import { catmull } from "../../../../src/path";
import { countershade, gradient, grain, mottle, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Capybara with Songbird",
  description:
    "A chubby, sleepy-eyed capybara in storybook proportions, with a round little bluebird perched on its head and a daisy tucked behind one ear.",
  style: "whimsical",
  commit: "88fc1f0",
};

// ---- palette --------------------------------------------------------------------------------------------------
const COAT = grain(
  countershade(
    mottle("#94623a", "#a87244", { size: 0.14, seed: 3, contrast: 0.7 }),
    mottle("#d4a56c", "#e0b67c", { size: 0.12, seed: 5, contrast: 0.6 }),
    { level: -0.2, soft: 0.45 },
  ),
  countershade("#7b4d2b", "#bf8a54", { level: -0.2, soft: 0.45 }),
  { size: 0.02, axis: "z", seed: 2 },
);
const HEAD = grain(
  countershade("#8b5a33", "#d0a070", { level: -0.05, soft: 0.4 }),
  countershade("#744827", "#b98a5a", { level: -0.05, soft: 0.4 }),
  { size: 0.014, axis: "z", seed: 4 },
);
const SNOUT = countershade("#7a4e2c", "#c9996a", { level: -0.1, soft: 0.3 });
const LEG = gradient(COAT, "#5a3a22", [0, 0.13, 0], [0, 0.03, 0]);
const EAR_OUT = "#6d4426";
const EAR_IN = "#e0968a";
const DARK = "#2a1a12";
const NOSE = "#3a2418";
const GLAND = "#4b2f1c";
const TOE = "#4a3020";
const TOOTH = "#f4e3b0";
const JAW = "#d9b27e";
const LID = "#8a5a34";
const BLUSH = "#f0a08a";
const WHITE = "#ffffff";
const PETAL = "#fffaf0";
const FLOWER_EYE = "#ffc933";

const BIRD_BACK = "#4fa8e0";
const BIRD_BELLY = "#ffe2b0";
const BIRD_CHEST = "#ff9b6b";
const BIRD_WING_A = "#3a86c4";
const BIRD_WING_B = "#245f99";
const BIRD_WING_BAR = "#f6f1e0";
const BIRD_BEAK = "#ffb347";
const BIRD_BEAK_LOW = "#f09a2a";
const BIRD_LEG = "#f0a050";
const BIRD_EYE = "#1b1018";

const SIDES = [1, -1] as const;

export default function build() {
  const b = createBuilder({ name: "capybara" });

  // ---- skeleton -----------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.34, -0.42] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.34, -0.42],
      [0, 0.36, -0.05],
      [0, 0.38, 0.28],
    ]),
    { parent: hips, count: 3, role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.38, 0.28],
      [0, 0.4, 0.4],
      [0, 0.4, 0.5],
    ]),
    { parent: spine.joints[2], count: 2, role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.4, 0.5], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.36, 0.58], aim: [0, 0.34, 0.78], role: "jaw" });
  const tail1 = b.joint("tail1", { parent: hips, at: [0, 0.32, -0.7], dir: [0, -0.2, -1], role: "tail" });

  // ---- body ---------------------------------------------------------------------------------------------------
  const body = b.loft(
    [
      { at: [0, 0.33, -0.62], w: 0.26, h: 0.26 },
      { at: [0, 0.35, -0.45], w: 0.42, h: 0.38 },
      { at: [0, 0.37, -0.1], w: 0.48, h: 0.42 },
      { at: [0, 0.38, 0.22], w: 0.44, h: 0.4 },
      { at: [0, 0.385, 0.4], w: 0.27, h: 0.27 },
    ],
    { bone: [hips, spine, neck], color: COAT },
  );

  b.part(new THREE.SphereGeometry(1, 8, 6), DARK, {
    bone: tail1,
    at: [0, 0.31, -0.735],
    scale: [0.03, 0.03, 0.035],
  });

  // ---- legs ---------------------------------------------------------------------------------------------------
  const toes = (x: number, z: number, n: number, bone: ReturnType<typeof b.joint>) => {
    for (let i = 0; i < n; i++) {
      const dx = (i - (n - 1) / 2) * 0.034;
      b.capsule([x + dx, 0.021, z + 0.035], [x + dx * 1.25, 0.019, z + 0.105], 0.0145, TOE, { bone, sides: 5 });
    }
  };

  for (const s of SIDES) {
    const S = s > 0 ? "L" : "R";
    const fx = s * 0.15;
    const fp = limb([fx, 0.27, 0.22], [fx, 0.048, 0.24], [0.13, 0.13], [[0, 0, -1]]);
    const fl = b.chain(`legF${S}`, fp, {
      parent: spine.joints[2],
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "leg",
    });
    b.sweep(fl, [0.08, 0.045], { color: LEG, sides: 8 });
    const ftip = fl.joints[fl.joints.length - 1];
    toes(fx, 0.24, 4, ftip);
    // shoulder mass
    b.part(new THREE.SphereGeometry(1, 10, 8), COAT, {
      bone: fl.joints[0],
      at: [s * 0.18, 0.31, 0.2],
      scale: [0.09, 0.11, 0.12],
    });

    const rx = s * 0.17;
    const rp = limb(
      [rx, 0.27, -0.45],
      [rx, 0.05, -0.46],
      [0.12, 0.11, 0.08],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const rl = b.chain(`legH${S}`, rp, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `foot${S}`],
      role: "leg",
    });
    b.sweep(rl, [0.09, 0.047], { color: LEG, sides: 8 });
    const rtip = rl.joints[rl.joints.length - 1];
    toes(rx, -0.46, 3, rtip);
    // haunch
    b.part(new THREE.SphereGeometry(1, 10, 8), COAT, {
      bone: rl.joints[0],
      at: [s * 0.19, 0.3, -0.45],
      scale: [0.1, 0.13, 0.15],
    });
  }

  // ---- head ---------------------------------------------------------------------------------------------------
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), HEAD, {
    bone: head,
    at: [0, 0.44, 0.56],
    scale: [0.1, 0.095, 0.115],
  });

  const snout = b.sweep(
    [
      [0, 0.43, 0.6],
      [0, 0.42, 0.68],
      [0, 0.415, 0.76],
    ],
    (t: number): [number, number] => [0.082 - 0.012 * t, 0.066 - 0.004 * t],
    { color: SNOUT, bone: head, sides: 10 },
  );
  const jawTube = b.sweep(
    [
      [0, 0.34, 0.6],
      [0, 0.335, 0.74],
    ],
    [0.04, 0.034],
    { color: JAW, bone: jaw, sides: 8 },
  );
  void jawTube;

  // nose pad, nostrils, gland, teeth
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, { bone: head, at: [0, 0.405, 0.808], scale: [0.052, 0.04, 0.03] });
  for (const s of SIDES) {
    b.part(new THREE.SphereGeometry(0.012, 6, 4), DARK, { bone: head, at: [s * 0.026, 0.41, 0.832] });
    b.part(new THREE.BoxGeometry(0.017, 0.024, 0.01), TOOTH, { bone: head, at: [s * 0.0105, 0.352, 0.812] });
  }
  b.part(new THREE.SphereGeometry(1, 8, 6), GLAND, { bone: head, at: [0, 0.478, 0.7], scale: [0.036, 0.012, 0.042] });

  // mouth line
  const snoutSurface = b.surface(snout);
  for (const s of SIDES) {
    const mouth = snoutSurface.drape(
      catmull([
        [s * 0.06, 0.375, 0.6],
        [s * 0.068, 0.378, 0.68],
        [s * 0.058, 0.385, 0.75],
      ]),
      { lift: 0.003 },
    );
    b.sweep(mouth, 0.0035, { color: DARK, sides: 4, bone: head });
  }

  // cheeks, eyes, lids
  for (const s of SIDES) {
    b.part(new THREE.SphereGeometry(1, 8, 6), BLUSH, {
      bone: head,
      at: [s * 0.09, 0.405, 0.6],
      scale: [0.012, 0.028, 0.034],
    });
    const eyeAt: [number, number, number] = [s * 0.082, 0.47, 0.62];
    b.part(new THREE.SphereGeometry(0.03, 8, 6), DARK, { bone: head, at: eyeAt });
    b.part(new THREE.SphereGeometry(0.0075, 6, 4), WHITE, {
      bone: head,
      at: [eyeAt[0] + s * 0.016, eyeAt[1] + 0.005, eyeAt[2] + 0.022],
    });
    b.part(new THREE.SphereGeometry(0.0045, 6, 4), WHITE, {
      bone: head,
      at: [eyeAt[0] + s * 0.012, eyeAt[1] - 0.012, eyeAt[2] + 0.024],
    });
    b.part(new THREE.SphereGeometry(0.0325, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.33), LID, {
      bone: head,
      at: [eyeAt[0], eyeAt[1] + 0.002, eyeAt[2]],
    });
    // lash line over the lid
    b.capsule([s * 0.06, 0.492, 0.64], [s * 0.09, 0.494, 0.59], 0.003, DARK, { bone: head, sides: 4 });

    // ears
    const ear: Array<[number, number]> = [
      [-0.03, 0],
      [-0.033, 0.04],
      [-0.012, 0.074],
      [0.015, 0.072],
      [0.031, 0.04],
      [0.028, 0],
    ];
    const earIn: Array<[number, number]> = [
      [-0.018, 0.004],
      [-0.02, 0.035],
      [-0.006, 0.058],
      [0.01, 0.057],
      [0.019, 0.035],
      [0.017, 0.004],
    ];
    b.extrude(ear, {
      at: [s * 0.07, 0.485, 0.48],
      x: [0, 0, 1],
      y: [s * 0.35, 1, 0],
      thickness: 0.014,
      bevel: 0.004,
      smoothing: 1,
      color: EAR_OUT,
      bone: head,
    });
    b.extrude(earIn, {
      at: [s * 0.0795, 0.489, 0.48],
      x: [0, 0, 1],
      y: [s * 0.35, 1, 0],
      thickness: 0.006,
      smoothing: 1,
      color: EAR_IN,
      bone: head,
    });

    // whiskers
    for (let i = 0; i < 3; i++) {
      b.rod(
        [s * 0.07, 0.435 - 0.012 * i, 0.74 - 0.015 * i],
        [s * 0.19, 0.46 + 0.028 * (i - 1), 0.78 + 0.03 * (i - 1) - 0.01 * i],
        0.0025,
        "#3a2a20",
        { bone: head, sides: 4 },
      );
    }
  }

  // daisy behind the right ear
  const fc = [-0.085, 0.497, 0.55];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const dir = [-0.25, Math.sin(a), Math.cos(a)];
    b.part(new THREE.SphereGeometry(1, 6, 4), PETAL, {
      bone: head,
      at: [fc[0] - 0.004, fc[1] + dir[1] * 0.02, fc[2] + dir[2] * 0.02],
      dir: [0, dir[1], dir[2]],
      scale: [0.004, 0.016, 0.0085],
    });
  }
  b.part(new THREE.SphereGeometry(1, 6, 5), FLOWER_EYE, { bone: head, at: [fc[0] - 0.006, fc[1], fc[2]], scale: [0.007, 0.011, 0.011] });

  // ---- fur tufts ----------------------------------------------------------------------------------------------
  const tuft = svg(
    `<svg viewBox="0 0 32 48"><path d="M16 0 C20 14 30 30 28 48 L4 48 C2 30 12 14 16 0Z" fill="#ffffff"/><path d="M16 8 C17 20 22 32 21 48 L11 48 C10 32 15 20 16 8Z" fill="#d6d6d6"/></svg>`,
    { size: 96 },
  );
  const bodyHits = b.surface(body).scatter(150, { rng: rng(7), minDist: 0.07, filter: (h) => h.n.y > -0.1 });
  b.cards(bodyHits, tuft, { size: [0.05, 0.07], lean: 70, vary: 0.3, rng: rng(8), color: COAT, spin: 25 });
  const headHits = b
    .surface(skull)
    .scatter(45, { rng: rng(11), minDist: 0.035, filter: (h) => h.n.y > -0.2 && h.at.z < 0.62 });
  b.cards(headHits, tuft, { size: [0.03, 0.045], lean: 70, vary: 0.3, rng: rng(12), color: HEAD, spin: 25 });

  // ---- songbird -----------------------------------------------------------------------------------------------
  const birdBody = b.joint("birdBody", { parent: head, at: [0, 0.595, 0.56], dir: [0, 0.1, 1] });
  const birdHead = b.joint("birdHead", { parent: birdBody, at: [0, 0.645, 0.615], dir: [0, 0.2, 1], role: "head" });
  const birdJaw = b.joint("birdJaw", { parent: birdHead, at: [0, 0.635, 0.64], aim: [0, 0.63, 0.675], role: "jaw" });
  const birdTail = b.joint("birdTail", { parent: birdBody, at: [0, 0.6, 0.52], dir: [0, 0, -1], role: "tail" });
  const wings = SIDES.map((s) =>
    b.joint(`birdWing${s > 0 ? "L" : "R"}`, {
      parent: birdBody,
      at: [s * 0.045, 0.61, 0.6],
      dir: [s * 0.15, 0, -1],
      role: "wing",
    }),
  );
  const legs = SIDES.map((s) =>
    b.joint(`birdLeg${s > 0 ? "L" : "R"}`, {
      parent: birdBody,
      at: [s * 0.02, 0.555, 0.56],
      dir: [0, -1, 0.1],
      role: "leg",
    }),
  );

  b.part(new THREE.SphereGeometry(1, 10, 8), countershade(BIRD_BACK, BIRD_BELLY, { level: -0.1, soft: 0.3 }), {
    bone: birdBody,
    at: [0, 0.595, 0.56],
    scale: [0.05, 0.047, 0.058],
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), BIRD_CHEST, { bone: birdBody, at: [0, 0.585, 0.605], scale: [0.034, 0.03, 0.022] });
  b.part(new THREE.SphereGeometry(1, 10, 8), countershade(BIRD_BACK, BIRD_BELLY, { level: -0.2, soft: 0.3 }), {
    bone: birdHead,
    at: [0, 0.645, 0.615],
    scale: [0.034, 0.033, 0.034],
  });
  b.spike([0, 0.645, 0.64], [0, -0.15, 1], 0.04, 0.0115, BIRD_BEAK, { bone: birdHead, sides: 5 });
  b.spike([0, 0.632, 0.642], [0, -0.1, 1], 0.03, 0.008, BIRD_BEAK_LOW, { bone: birdJaw, sides: 5 });
  for (let i = 0; i < 3; i++) {
    b.spike([(i - 1) * 0.008, 0.674, 0.61 - i * 0.002], [(i - 1) * 0.3, 1, -0.6], 0.036 - Math.abs(i - 1) * 0.008, 0.007, BIRD_BACK, {
      bone: birdHead,
      sides: 4,
    });
  }
  for (const s of SIDES) {
    b.part(new THREE.SphereGeometry(0.0085, 6, 4), BIRD_EYE, { bone: birdHead, at: [s * 0.027, 0.652, 0.633] });
    b.part(new THREE.SphereGeometry(0.003, 4, 3), WHITE, { bone: birdHead, at: [s * 0.03, 0.656, 0.64] });
    b.part(new THREE.SphereGeometry(1, 6, 4), BLUSH, { bone: birdHead, at: [s * 0.03, 0.637, 0.628], scale: [0.006, 0.008, 0.008] });
  }

  const wingPaint = paint((_p, _n, s) => (s[0] > 0.058 ? BIRD_WING_B : s[0] > 0.04 && s[0] < 0.048 ? BIRD_WING_BAR : BIRD_WING_A));
  const wingOutline: OutlinePoint[] = [
    [0, 0.012],
    [0.025, 0.03],
    [0.06, 0.012],
    [0.088, -0.016, "sharp"],
    [0.05, -0.026],
    [0.015, -0.02],
  ];
  SIDES.forEach((s, i) => {
    b.extrude(wingOutline, {
      at: [s * 0.047, 0.6, 0.585],
      x: [0, 0, -1],
      y: [s * 0.25, 1, 0],
      thickness: 0.008,
      bevel: 0.002,
      smoothing: 1,
      color: wingPaint,
      bone: wings[i],
    });
  });
  b.extrude(
    [
      [0, -0.012],
      [0.06, -0.024],
      [0.092, -0.02],
      [0.076, 0],
      [0.092, 0.02],
      [0.06, 0.024],
      [0, 0.012],
    ],
    {
      at: [0, 0.6, 0.52],
      x: [0, 0, -1],
      y: [1, 0, 0],
      thickness: 0.007,
      smoothing: 0,
      color: BIRD_WING_B,
      bone: birdTail,
    },
  );
  SIDES.forEach((s, i) => {
    b.rod([s * 0.02, 0.56, 0.56], [s * 0.022, 0.534, 0.565], 0.0034, BIRD_LEG, { bone: legs[i], sides: 4 });
    for (let k = -1; k <= 1; k++) {
      b.rod([s * 0.022, 0.536, 0.565], [s * 0.022 + k * 0.01, 0.532, 0.59], 0.0028, BIRD_LEG, { bone: legs[i], sides: 4 });
    }
  });

  return b.root;
}
