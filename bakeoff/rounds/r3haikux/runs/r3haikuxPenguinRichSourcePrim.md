```ts
import * as THREE from "three";
import { createBuilder, mix, paint, smoothstep } from "agentic-3js-builder";
import type { Paint } from "agentic-3js-builder";

export const meta = {
  name: "Emperor penguin and chick",
  description:
    "A proud emperor penguin parent: glossy blue-black back and head, a crisp white breast running into a gold neck and ear patch, a long beak with an orange-pink stripe, big black feet, and a fluffy grey chick peeking out between them.",
};

type Vec = [number, number, number];

// Palette
const INK = "#131a31"; // blue-black plumage
const WHITE = "#f4f6f7"; // breast
const GOLD = "#f2b335"; // neck and ear
const STRIPE = "#ff7b5c"; // orange-pink bill stripe
const BILL = "#23272f"; // dark bill
const SOOT = "#1b1e25"; // legs and feet
const EYE = "#07080b";
const SHINE = "#ffffff";
const DOWN = "#9ca4ad";
const DOWN_LIGHT = "#d7dde2";
const DOWN_DARK = "#7b848e";
const DOWN_TUFT = "#c5ccd2";
const CHICK_BILL = "#3b3f47";
const CHICK_FOOT = "#5f656d";
const CHICK_EYE = "#0a0b0e";

// Model-space landmarks
const HEAD: Vec = [0, 1.0, 0.04];
const EAR_L = new THREE.Vector3(0.11, 1.0, 0.0);
const EAR_R = new THREE.Vector3(-0.11, 1.0, 0.0);
const NAPE_L = new THREE.Vector3(0.12, 0.9, 0.02);
const NAPE_R = new THREE.Vector3(-0.12, 0.9, 0.02);

// Flipper outline: [forward, down the flipper] in metres, extruded flat.
const FLIPPER: Array<[number, number]> = [
  [-0.035, 0.0],
  [0.035, 0.0],
  [0.058, -0.07],
  [0.05, -0.15],
  [0.0, -0.22],
  [-0.045, -0.15],
  [-0.058, -0.07],
];

// Webbed foot outline: [forward, across] in metres, three toes.
const FOOT: Array<[number, number]> = [
  [-0.035, -0.02],
  [0.03, -0.036],
  [0.1, -0.046],
  [0.075, -0.014],
  [0.15, 0.0],
  [0.075, 0.014],
  [0.1, 0.046],
  [0.03, 0.036],
  [-0.035, 0.02],
];

// Adult plumage, read in model space so body, head and flippers agree where they meet.
const plumage = paint((p, n) => {
  const breast = smoothstep(0.15, 0.3, n.z);
  const white = breast * smoothstep(0.84, 0.78, p.y);
  const bib = breast * smoothstep(0.76, 0.8, p.y) * smoothstep(0.95, 0.9, p.y);
  const patch = Math.max(
    smoothstep(0.05, 0.03, p.distanceTo(EAR_L)),
    smoothstep(0.05, 0.03, p.distanceTo(EAR_R)),
    smoothstep(0.045, 0.025, p.distanceTo(NAPE_L)),
    smoothstep(0.045, 0.025, p.distanceTo(NAPE_R)),
  );
  return mix(mix(INK, WHITE, white), GOLD, Math.max(bib, patch));
});

// Bill: dark, with the lower mandible's flanks in orange-pink.
const beakPaint = paint((p, n) => (Math.abs(n.x) > 0.6 && p.y < 0.99 ? STRIPE : BILL));

export default function emperorAndChick() {
  const b = createBuilder({ name: "emperor-penguin-and-chick", detail: 1, paintSize: 1024 });
  // Glossy plumage: every painted part shares one material, so this gives the sheen.
  b.ctx.paintMaterial().roughness = 0.3;

  const ball = (at: Vec, radii: Vec, color: string | Paint, bone: string, sides = 9) =>
    b.part(new THREE.SphereGeometry(1, b.segments(sides), b.segments(Math.round(sides * 0.7))), color, {
      at,
      bone,
      scale: radii,
    });

  // ---- Skeleton -----------------------------------------------------------------------------
  b.joint("root", { at: [0, 0, 0] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.3, 0],
      [0, 0.62, 0.01],
      [0, 0.9, 0.03],
    ],
    { role: "spine", names: ["hips", "chest", "neck"], parent: "root" },
  );
  b.joint("head", { parent: "neck", at: HEAD, role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.982, 0.11], dir: [0, 0, 1], role: "jaw" });

  b.chain(
    "legL",
    [
      [0.12, 0.2, 0],
      [0.12, 0.03, 0],
    ],
    { role: "leg", names: ["hipL", "ankleL"], parent: "hips" },
  );
  b.chain(
    "legR",
    [
      [-0.12, 0.2, 0],
      [-0.12, 0.03, 0],
    ],
    { role: "leg", names: ["hipR", "ankleR"], parent: "hips" },
  );

  const wingL = b.chain(
    "wingL",
    [
      [0.16, 0.8, 0],
      [0.23, 0.6, 0],
    ],
    { role: "wing", names: ["shoulderL", "wristL"], parent: "chest" },
  );
  const wingR = b.chain(
    "wingR",
    [
      [-0.16, 0.8, 0],
      [-0.23, 0.6, 0],
    ],
    { role: "wing", names: ["shoulderR", "wristR"], parent: "chest" },
  );

  // The chick's own little skeleton: body and head, tucked between the adult's feet.
  b.chain(
    "chick",
    [
      [0, 0.1, 0.09],
      [0, 0.21, 0.165],
    ],
    { role: "spine", names: ["chickBody", "chickHead"], parent: "hips" },
  );

  // ---- Adult body ---------------------------------------------------------------------------
  b.loft(
    [
      { at: [0, 0.18, 0], w: 0.22, h: 0.2 },
      { at: [0, 0.34, 0], w: 0.38, h: 0.34 },
      { at: [0, 0.54, 0.01], w: 0.46, h: 0.4 },
      { at: [0, 0.72, 0.02], w: 0.42, h: 0.34 },
      { at: [0, 0.84, 0.03], w: 0.24, h: 0.22 },
    ],
    { name: "body", color: plumage, bone: spine, sides: 12 },
  );

  // Head, with a little sculpted face.
  ball(HEAD, [0.12, 0.125, 0.13], plumage, "head", 12);
  ball([0.078, 1.02, 0.128], [0.021, 0.021, 0.021], EYE, "head", 8);
  ball([-0.078, 1.02, 0.128], [0.021, 0.021, 0.021], EYE, "head", 8);
  ball([0.088, 1.03, 0.14], [0.007, 0.007, 0.007], SHINE, "head", 6);
  ball([-0.088, 1.03, 0.14], [0.007, 0.007, 0.007], SHINE, "head", 6);

  // Long slender bill, upper and lower mandibles on separate bones so it can open.
  b.frustumBox([0, 1.022, 0.1], [0, 0.998, 0.31], [0.05, 0.04], [0.012, 0.012], {
    color: beakPaint,
    bone: "head",
    name: "billUpper",
  });
  b.frustumBox([0, 0.982, 0.11], [0, 0.972, 0.29], [0.04, 0.028], [0.008, 0.008], {
    color: beakPaint,
    bone: "jaw",
    name: "billLower",
  });

  // Stubby flippers, held slightly out from the body.
  b.extrude(FLIPPER, {
    name: "flipperL",
    at: wingL.joints[0],
    x: [0, 0, 1],
    y: [0.3, -1, 0],
    thickness: [0.012, 0.04],
    bevel: 0.008,
    color: plumage,
  });
  b.extrude(FLIPPER, {
    name: "flipperR",
    at: wingR.joints[0],
    x: [0, 0, 1],
    y: [-0.3, -1, 0],
    thickness: [0.012, 0.04],
    bevel: 0.008,
    color: plumage,
  });

  // Short black legs and big webbed feet.
  b.rod([0.12, 0.2, 0], [0.12, 0.03, 0], 0.024, { color: SOOT, bone: "hipL", name: "shankL" });
  b.rod([-0.12, 0.2, 0], [-0.12, 0.03, 0], 0.024, { color: SOOT, bone: "hipR", name: "shankR" });
  b.extrude(FOOT, {
    name: "footL",
    at: [0.12, 0.015, 0],
    x: [0, 0, 1],
    y: [1, 0, 0],
    thickness: 0.03,
    bevel: 0.006,
    color: SOOT,
    bone: "ankleL",
  });
  b.extrude(FOOT, {
    name: "footR",
    at: [-0.12, 0.015, 0],
    x: [0, 0, 1],
    y: [1, 0, 0],
    thickness: 0.03,
    bevel: 0.006,
    color: SOOT,
    bone: "ankleR",
  });

  // ---- Chick, peeking out from between the feet ---------------------------------------------
  // Body, with a few fluff blobs for a soft silhouette.
  ball([0, 0.1, 0.09], [0.07, 0.085, 0.085], DOWN, "chickBody", 10);
  ball([0, 0.085, 0.135], [0.05, 0.05, 0.04], DOWN_LIGHT, "chickBody", 8);
  ball([-0.045, 0.14, 0.04], [0.032, 0.03, 0.032], DOWN_DARK, "chickBody", 7);
  ball([0.05, 0.135, 0.035], [0.03, 0.03, 0.03], DOWN, "chickBody", 7);
  ball([-0.068, 0.07, 0.085], [0.026, 0.03, 0.026], DOWN_TUFT, "chickBody", 7);
  ball([0.068, 0.07, 0.085], [0.026, 0.03, 0.026], DOWN_DARK, "chickBody", 7);

  // Head, with tufts.
  ball([0, 0.21, 0.165], [0.058, 0.056, 0.058], DOWN, "chickHead", 10);
  ball([0, 0.258, 0.15], [0.03, 0.03, 0.03], DOWN_TUFT, "chickHead", 7);
  ball([-0.04, 0.245, 0.13], [0.024, 0.024, 0.024], DOWN_DARK, "chickHead", 6);
  ball([0.045, 0.24, 0.135], [0.024, 0.024, 0.024], DOWN_TUFT, "chickHead", 6);
  ball([-0.052, 0.2, 0.17], [0.02, 0.02, 0.02], DOWN_DARK, "chickHead", 6);
  b.spike([0, 0.262, 0.14], [0.25, 1, -0.3], 0.045, 0.009, { color: DOWN_TUFT, bone: "chickHead", name: "tuftA" });
  b.spike([-0.03, 0.258, 0.13], [-0.2, 1, -0.4], 0.04, 0.008, {
    color: DOWN_DARK,
    bone: "chickHead",
    name: "tuftB",
  });

  // Eyes, a short bill, and grey feet.
  ball([0.03, 0.226, 0.218], [0.011, 0.011, 0.011], CHICK_EYE, "chickHead", 6);
  ball([-0.03, 0.226, 0.218], [0.011, 0.011, 0.011], CHICK_EYE, "chickHead", 6);
  b.frustumBox([0, 0.205, 0.2], [0, 0.19, 0.27], [0.02, 0.018], [0.008, 0.008], {
    color: CHICK_BILL,
    bone: "chickHead",
    name: "chickBill",
  });
  ball([0.035, 0.012, 0.19], [0.022, 0.012, 0.035], CHICK_FOOT, "chickBody", 6);
  ball([-0.035, 0.012, 0.19], [0.022, 0.012, 0.035], CHICK_FOOT, "chickBody", 6);

  return b.root;
}
```