import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Chain } from "../src/skeleton";
import { spots } from "../src/paint";
import { catmull } from "../src/path";

const SKIN = "#68b89b";
const SKIN_LIGHT = "#9ed9b5";
const SKIN_DARK = "#3f806e";
const COAT = spots(SKIN, [SKIN_LIGHT, SKIN_DARK], { size: 0.18, amount: 0.16, rosette: true, seed: 17 });
const BELLY = "#ffe0a3";
const BELLY_SHADOW = "#f0b86f";
const HORN = "#d98b63";
const WING = "#f5a4b8";
const WING_DARK = "#c96d91";
const EYE = "#fff5cf";
const IRIS = "#4b91a3";
const PUPIL = "#2c3b46";
const MOUTH = "#693c51";
const SPARK = "#ffd45f";

export const meta = {
  name: "Pocket Dragon",
  description: "A tiny chubby storybook dragon sitting proudly with rosy wings and a curling tail.",
  style: "whimsical",
  commit: "9555ebf",
};

export default function build() {
  const b = createBuilder({ name: "pocketDragon", detail: 1 });

  // Skeleton first: one compact spine, broad seated legs, outstretched wings and a readable tail.
  const hips = b.joint("hips", { at: [0, 0.58, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.58, 0],
      [0, 0.78, -0.01],
      [0, 1.01, 0.02],
    ]),
    { parent: hips, names: ["spineBase", "spineChest", "spineTip"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.01, 0.02],
      [0, 1.17, 0.05],
      [0, 1.29, 0.12],
    ]),
    { parent: spine.tip!, names: ["neckBase", "neckTip", "neckTop"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.tip!, at: [0, 1.35, 0.14], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.27, 0.28], aim: [0, 1.24, 0.48], role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.59, -0.18],
      [0, 0.49, -0.43],
      [0.04, 0.42, -0.72],
      [0.16, 0.48, -0.98],
      [0.30, 0.63, -1.12],
    ]),
    { parent: hips, names: ["tailBase", "tailMid", "tailBend", "tailCurl", "tailTip"], role: "tail" },
  );

  const legs: Array<{ side: 1 | -1; chain: Chain }> = [];
  for (const side of [1, -1] as const) {
    const leg = b.chain(
      side === 1 ? "legL" : "legR",
      catmull([
        [side * 0.23, 0.57, 0.01],
        [side * 0.36, 0.35, 0.14],
        [side * 0.34, 0.14, 0.28],
        [side * 0.27, 0.055, 0.43],
      ]),
      {
        parent: hips,
        names: side === 1 ? ["hipL", "kneeL", "ankleL", "footL"] : ["hipR", "kneeR", "ankleR", "footR"],
        role: "leg",
        contact: [side * 0.27, 0.055, 0.43],
      },
    );
    legs.push({ side, chain: leg });

    for (let toe = 0; toe < 3; toe += 1) {
      const x = side * (0.27 + (toe - 1) * 0.065);
      const toeChain = b.chain(
        `${side === 1 ? "toeL" : "toeR"}${toe + 1}`,
        catmull([
          [x, 0.050, 0.43],
          [x + side * (toe - 1) * 0.035, 0.018, 0.54 + toe * 0.018],
        ]),
        {
          parent: leg.tip!,
          names: side === 1 ? [`toeL${toe + 1}`, `toeL${toe + 1}Tip`] : [`toeR${toe + 1}`, `toeR${toe + 1}Tip`],
          role: "digit",
        },
      );
      b.sweep(toeChain, [0.027, 0.012], { color: HORN, section: { ngon: 6 }, caps: "round", name: `${side === 1 ? "toeL" : "toeR"}${toe + 1}Claw` });
    }
  }

  const arms: Array<{ side: 1 | -1; chain: Chain }> = [];
  for (const side of [1, -1] as const) {
    const arm = b.chain(
      side === 1 ? "armL" : "armR",
      catmull([
        [side * 0.28, 0.98, 0.02],
        [side * 0.43, 0.88, 0.15],
        [side * 0.52, 0.72, 0.29],
        [side * 0.49, 0.68, 0.38],
      ]),
      { parent: spine.joints[1], names: side === 1 ? ["shoulderL", "elbowL", "wristL", "handL"] : ["shoulderR", "elbowR", "wristR", "handR"], role: "arm" },
    );
    arms.push({ side, chain: arm });

    for (let finger = 0; finger < 3; finger += 1) {
      const spread = (finger - 1) * 0.055;
      const fingerChain = b.chain(
        `${side === 1 ? "fingerL" : "fingerR"}${finger + 1}`,
        [
          [side * 0.49 + spread, 0.68, 0.38],
          [side * 0.53 + spread * 1.4, 0.65 - Math.abs(spread) * 0.25, 0.48 + Math.abs(spread) * 0.25],
        ],
        {
          parent: arm.tip!,
          names: side === 1 ? [`fingerL${finger + 1}`, `fingerL${finger + 1}Tip`] : [`fingerR${finger + 1}`, `fingerR${finger + 1}Tip`],
          role: "digit",
        },
      );
      b.sweep(fingerChain, [0.019, 0.008], { color: HORN, section: { ngon: 6 }, caps: "round", name: `${side === 1 ? "fingerL" : "fingerR"}${finger + 1}Claw` });
    }
  }

  const wings: Array<{ side: 1 | -1; chain: Chain }> = [];
  for (const side of [1, -1] as const) {
    const wing = b.chain(
      side === 1 ? "wingL" : "wingR",
      catmull([
        [side * 0.23, 0.99, -0.10],
        [side * 0.43, 1.12, -0.20],
        [side * 0.68, 1.20, -0.09],
        [side * 0.78, 1.08, 0.06],
      ]),
      { parent: spine.joints[1], names: side === 1 ? ["wingShoulderL", "wingElbowL", "wingPalmL", "wingTipL"] : ["wingShoulderR", "wingElbowR", "wingPalmR", "wingTipR"], role: "wing" },
    );
    wings.push({ side, chain: wing });
  }

  // Rounded masses and soft colour blocking.
  const body = b.sweep(spine, [0.31, 0.22], { color: COAT, section: { ngon: 8 }, caps: "round", name: "bodyTube" });
  b.part(new THREE.SphereGeometry(1, 14, 10), COAT, { bone: hips, at: [0, 0.72, 0], scale: [0.40, 0.46, 0.40], name: "roundBelly" });
  b.part(new THREE.SphereGeometry(1, 12, 8), SKIN_LIGHT, { bone: spine.joints[1], at: [0, 0.97, 0.02], scale: [0.33, 0.30, 0.31], name: "chest" });
  b.sweep(neck, [0.20, 0.15], { color: SKIN, section: { ngon: 8 }, caps: "round", name: "neckTube" });
  b.sweep(tail, (t) => 0.14 * (1 - t) + 0.025, {
    color: SKIN_DARK,
    bands: [[0.45, SKIN], [0.80, SKIN_LIGHT]],
    section: { ngon: 8 },
    caps: { start: "round", end: "point" },
    name: "curlingTail",
  });

  const belly = b.part(new THREE.SphereGeometry(1, 14, 10), BELLY, { bone: hips, at: [0, 0.73, 0.34], scale: [0.29, 0.34, 0.075], name: "bellyPatch" });
  for (let i = 0; i < 4; i += 1) {
    b.part(new THREE.SphereGeometry(1, 10, 6), i % 2 === 0 ? BELLY_SHADOW : BELLY, {
      bone: hips,
      at: [0, 0.52 + i * 0.105, 0.402 - i * 0.01],
      scale: [0.18 - i * 0.018, 0.075 - i * 0.009, 0.018],
      name: `bellyScale${i + 1}`,
    });
  }

  const headMass = b.part(new THREE.SphereGeometry(1, 14, 10), SKIN_LIGHT, { bone: head, at: [0, 1.37, 0.16], scale: [0.30, 0.28, 0.31], name: "roundHead" });
  b.part(new THREE.SphereGeometry(1, 12, 8), BELLY, { bone: head, at: [0, 1.29, 0.38], scale: [0.23, 0.16, 0.18], name: "muzzle" });
  b.part(new THREE.SphereGeometry(1, 10, 6), MOUTH, { bone: jaw, at: [0, 1.255, 0.44], scale: [0.17, 0.025, 0.055], name: "smilingMouth" });
  b.part(new THREE.SphereGeometry(1, 8, 6), MOUTH, { bone: jaw, at: [0, 1.285, 0.47], scale: [0.12, 0.012, 0.014], name: "lowerLip" });
  for (const side of [1, -1] as const) {
    b.part(new THREE.SphereGeometry(1, 8, 6), PUPIL, { bone: head, at: [side * 0.07, 1.345, 0.525], scale: [0.022, 0.016, 0.010], name: `nostril${side === 1 ? "L" : "R"}` });
    b.spike([side * 0.075, 1.245, 0.475], [0, -1, 0], 0.035, 0.010, { bone: jaw, color: EYE, caps: "point", name: `tooth${side === 1 ? "L" : "R"}` });
  }

  // Big friendly eyes, blush, and expressive brow-spikes.
  for (const side of [1, -1] as const) {
    b.part(new THREE.SphereGeometry(1, 12, 8), EYE, { bone: head, at: [side * 0.145, 1.44, 0.35], scale: [0.095, 0.105, 0.055], name: `eyeWhite${side === 1 ? "L" : "R"}` });
    b.part(new THREE.SphereGeometry(1, 10, 7), IRIS, { bone: head, at: [side * 0.145, 1.44, 0.398], scale: [0.057, 0.064, 0.025], name: `iris${side === 1 ? "L" : "R"}` });
    b.part(new THREE.SphereGeometry(1, 8, 6), PUPIL, { bone: head, at: [side * 0.145, 1.44, 0.421], scale: [0.022, 0.036, 0.012], name: `pupil${side === 1 ? "L" : "R"}` });
    b.part(new THREE.SphereGeometry(1, 8, 6), WING, { bone: head, at: [side * 0.235, 1.315, 0.355], scale: [0.055, 0.035, 0.018], name: `cheek${side === 1 ? "L" : "R"}` });
    b.spike([side * 0.20, 1.56, 0.12], [side * 0.12, 0.15, 0.04], 0.16, 0.042, { bone: head, color: HORN, caps: "point", name: `browHorn${side === 1 ? "L" : "R"}` });
    b.spike([side * 0.14, 1.54, 0.03], [side * 0.03, 0.18, -0.01], 0.15, 0.035, { bone: head, color: HORN, caps: "point", name: `crownHorn${side === 1 ? "L" : "R"}` });
  }
  b.part(new THREE.SphereGeometry(1, 8, 6), SPARK, { bone: head, at: [0, 1.40, 0.47], scale: [0.022, 0.022, 0.012], name: "noseSpark" });

  // Soft fins on the cheeks and a little row of dorsal storybook spines.
  for (const side of [1, -1] as const) {
    b.extrude(
      [[0, 0], [0.10, 0.04], [0.14, 0.13], [0.04, 0.09]],
      { at: [side * 0.25, 1.42, 0.14], x: [side, 0, 0], thickness: 0.018, bevel: 0.008, smoothing: 1, color: WING, bone: head, name: `cheekFin${side === 1 ? "L" : "R"}` },
    );
  }
  b.along(body, 5, (at) => {
    b.spike(at, at, 0.10, 0.028, { color: HORN, caps: "point", name: "backSpine" });
  });

  // Wing bones and scalloped membranes, each side kept independently riggable.
  for (const { side, chain: wing } of wings) {
    b.sweep(wing, [0.075, 0.03], { color: HORN, section: { ngon: 6 }, caps: "round", name: `wingFinger${side === 1 ? "L" : "R"}` });
    b.membrane(
      wing,
      [
        [side * 0.22, 0.96, -0.11],
        [side * 0.39, 0.82, -0.16],
        [side * 0.59, 0.88, -0.10],
        [side * 0.76, 1.03, 0.04],
      ],
      { color: WING, thickness: 0.012, rows: 3, scallop: 0.16, name: `wingMembrane${side === 1 ? "L" : "R"}` },
    );
    for (let i = 0; i < 3; i += 1) {
      b.spike(wing.at(0.30 + i * 0.20), wing.at(0.30 + i * 0.20), 0.045, 0.012, { color: WING_DARK, caps: "point", name: `wingRib${side === 1 ? "L" : "R"}${i + 1}` });
    }
  }

  // Three warm toe tips on each foot make the grounded seated silhouette readable.
  for (const { side, chain: leg } of legs) {
    b.sweep(leg, [0.115, 0.072], { color: SKIN_DARK, section: { ngon: 8 }, caps: "round", name: `leg${side === 1 ? "L" : "R"}` });
  }
  for (const { side, chain: arm } of arms) {
    b.sweep(arm, [0.07, 0.035], { color: SKIN_DARK, section: { ngon: 8 }, caps: "round", name: `arm${side === 1 ? "L" : "R"}` });
  }

  // Tiny golden scale studs on the shoulders.
  for (const { side } of wings) {
    b.part(new THREE.SphereGeometry(1, 8, 6), SPARK, { bone: spine.joints[1], at: [side * 0.30, 1.08, 0.09], scale: [0.035, 0.035, 0.018], name: `shoulderStud${side === 1 ? "L" : "R"}` });
  }

  // Keep handles live in the build so every major appendage is represented in the skeleton.
  void headMass;
  void belly;
  return b.root;
}
