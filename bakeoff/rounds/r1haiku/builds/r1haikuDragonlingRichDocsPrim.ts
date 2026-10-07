import * as THREE from "three";
import { createBuilder, bezier, catmull, countershade, mottle, polyline, spots } from "../../../../src/index";

const TEAL = "#2fb5a6";
const DEEP = "#15776f";
const BUTTER = "#f4e08e";
const ORANGE = "#ff8a3d";
const AMBER = "#ffb02e";
const EYE = "#ffa61a";
const PUPIL = "#1d1510";
const BONE = "#f5efe0";
const HORN = "#e9dcb8";
const SMOKE = "#d9dee3";
const EGG = "#f2e7cb";
const SPECK = "#7a5536";

export const meta = {
  name: "baby-dragon",
  description: "A proud teal baby dragon sitting beside its broken speckled egg shell.",
};

export default function build() {
  const b = createBuilder({ name: "baby-dragon" });

  const skin = countershade(mottle(TEAL, DEEP, { size: 0.09, seed: 4 }), BUTTER, { level: -0.1 });
  const eggPaint = spots(EGG, SPECK, { size: 0.03, amount: 0.4, seed: 2 });

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.12, -0.04], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.12, -0.04],
      [0, 0.2, 0.0],
      [0, 0.3, 0.06],
      [0, 0.38, 0.1],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.38, 0.1],
      [0, 0.46, 0.16],
      [0, 0.54, 0.22],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.56, 0.25],
    aim: [0, 0.66, 0.42],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.05, up: -0.035 }),
    aim: head.local({ forward: 0.2, up: -0.07 }),
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.12, -0.03],
      [0, 0.07, -0.2],
      [0, 0.06, -0.34],
      [0, 0.075, -0.44],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tailTip"], role: "tail" },
  );
  const tailTip = tail.tip ?? tail.joints[tail.joints.length - 1];

  // Body, neck, tail tubes
  const torso = b.sweep(spine, (t: number) => 0.09 + 0.03 * Math.sin(Math.PI * t), { color: skin });
  b.sweep(neck, (t: number) => 0.05 - 0.012 * t, { color: skin });
  b.sweep(tail, (t: number) => 0.075 - 0.04 * t, { color: skin });

  // Soft orange spines down the back
  b.along(
    torso,
    7,
    (at) => {
      b.spike(at, at, 0.05, 0.018, { color: ORANGE });
    },
    { from: 0.12, to: 0.92 },
  );

  // Spade at the end of the tail
  b.extrude(
    [
      [-0.02, 0],
      [0.02, 0],
      [0.035, 0.05],
      [0.015, 0.095],
      [0, 0.12, "sharp"],
      [-0.015, 0.095],
      [-0.035, 0.05],
    ],
    {
      at: [0, 0.075, -0.44],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      smoothing: 1,
      color: AMBER,
      bone: tailTip,
    },
  );

  // Legs, feet and arms, mirrored
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    const leg = b.chain(
      `leg${side}`,
      polyline([
        [s * 0.075, 0.12, 0.0],
        [s * 0.13, 0.06, 0.1],
        [s * 0.1, 0.03, 0.2],
      ]),
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg" },
    );
    const legTip = leg.tip ?? leg.joints[leg.joints.length - 1];
    b.sweep(leg, (t: number) => 0.04 - 0.012 * t, { color: skin });
    b.part(new THREE.SphereGeometry(0.06, 10, 8), skin, {
      bone: hips,
      at: [s * 0.08, 0.12, 0.0],
      scale: [0.9, 0.9, 1.15],
    });
    b.part(new THREE.SphereGeometry(0.04, 8, 6), DEEP, {
      bone: legTip,
      at: [s * 0.1, 0.02, 0.23],
      scale: [1, 0.55, 1.5],
    });
    for (const d of [-0.018, 0, 0.018]) {
      b.part(new THREE.SphereGeometry(0.011, 6, 4), BONE, {
        bone: legTip,
        at: [s * (0.1 + d), 0.012, 0.285],
      });
    }

    const arm = b.chain(
      `arm${side}`,
      polyline([
        [s * 0.07, 0.3, 0.06],
        [s * 0.12, 0.2, 0.12],
        [s * 0.1, 0.22, 0.2],
      ]),
      { parent: spine.joints[2], names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm" },
    );
    const armTip = arm.tip ?? arm.joints[arm.joints.length - 1];
    b.sweep(arm, (t: number) => 0.03 - 0.008 * t, { color: skin });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), skin, {
      bone: armTip,
      at: [s * 0.1, 0.22, 0.22],
      scale: [1, 0.9, 1.2],
    });
    for (const d of [-0.012, 0, 0.012]) {
      b.spike([s * (0.1 + d), 0.22, 0.245], [0, 0, 1], 0.018, 0.006, { color: BONE, bone: armTip });
    }

    // Oversized wing with translucent amber membrane
    const wing = b.chain(
      `wing${side}`,
      polyline([
        [s * 0.08, 0.34, 0.07],
        [s * 0.2, 0.44, 0.02],
        [s * 0.34, 0.5, -0.1],
      ]),
      {
        parent: spine.joints[2],
        names: [`wingShoulder${side}`, `wingElbow${side}`, `wingWrist${side}`],
        role: "wing",
      },
    );
    const wrist = wing.tip ?? wing.joints[wing.joints.length - 1];
    b.sweep(wing, (t: number) => 0.024 - 0.008 * t, { color: skin });

    const f1 = [s * 0.6, 0.5, 0.0];
    const f2 = [s * 0.54, 0.5, -0.2];
    const f3 = [s * 0.38, 0.4, -0.32];
    for (const f of [f1, f2, f3]) {
      b.capsule(wrist, f, [0.016, 0.008], { bone: wrist, color: skin });
    }
    b.membrane([wrist.at, f1], [wrist.at, f2], { color: AMBER, thickness: 0.012, bone: wrist, scallop: 0.15 });
    b.membrane([wrist.at, f2], [wrist.at, f3], { color: AMBER, thickness: 0.012, bone: wrist, scallop: 0.15 });

    // Eyes and horns
    const eyeAt = head.local({ left: s * 0.075, forward: 0.05, up: 0.035 });
    const pupilAt = head.local({ left: s * 0.092, forward: 0.062, up: 0.035 });
    b.part(new THREE.SphereGeometry(0.032, 10, 8), EYE, { bone: head, at: eyeAt });
    b.part(new THREE.SphereGeometry(0.015, 8, 6), PUPIL, { bone: head, at: pupilAt });

    b.spike(head.local({ left: s * 0.045, forward: -0.01, up: 0.07 }), [s * 0.25, 1, -0.25], 0.05, 0.018, {
      color: HORN,
      bone: head,
    });
  }

  // Head: cranium, snout, jaw
  b.part(new THREE.SphereGeometry(0.095, 12, 9), skin, {
    bone: head,
    at: head.local({ up: 0.03 }),
    scale: [1, 0.92, 1.05],
  });
  b.part(new THREE.BoxGeometry(0.075, 0.05, 0.11), skin, {
    bone: head,
    at: head.local({ forward: 0.12, up: 0.0 }),
  });
  b.part(new THREE.BoxGeometry(0.068, 0.03, 0.1), BUTTER, {
    bone: jaw,
    at: head.local({ forward: 0.1, up: -0.05 }),
  });

  // Toothy grin
  for (const x of [-0.028, -0.014, 0, 0.014, 0.028]) {
    b.spike(head.local({ left: x, forward: 0.1, up: -0.025 }), [0, -1, 0], 0.018, 0.006, {
      color: BONE,
      bone: head,
    });
  }
  for (const x of [-0.024, -0.008, 0.008, 0.024]) {
    b.spike(head.local({ left: x, forward: 0.1, up: -0.035 }), [0, 1, 0], 0.014, 0.005, {
      color: BONE,
      bone: jaw,
    });
  }

  // Wisp of smoke from the right nostril
  const n0 = head.local({ right: 0.02, forward: 0.165, up: 0.03 });
  const smoke = bezier(
    n0,
    [n0.x + 0.02, n0.y + 0.05, n0.z + 0.03],
    [n0.x - 0.02, n0.y + 0.1, n0.z + 0.06],
    [n0.x - 0.05, n0.y + 0.17, n0.z + 0.03],
  );
  for (let i = 0; i < 6; i++) {
    b.part(new THREE.SphereGeometry(0.008 + 0.003 * i, 6, 4), SMOKE, {
      bone: head,
      at: smoke.at(i / 5),
    });
  }

  // Broken speckled egg shell beside the dragon
  b.lathe(
    [
      [0, 0],
      [0.07, 0.012],
      [0.08, 0.06],
      [0.077, 0.1],
      [0.071, 0.14, "sharp"],
      [0.066, 0.118, "sharp"],
      [0.06, 0.145, "sharp"],
      [0.056, 0.11],
      [0.064, 0.07],
      [0.06, 0.02],
      [0, 0.004],
    ],
    { at: [-0.34, 0, 0.1], segments: 14, smoothing: 0, color: eggPaint },
  );
  b.part(new THREE.DodecahedronGeometry(0.02, 0), eggPaint, {
    at: [-0.22, 0.008, 0.12],
    scale: [1, 0.4, 1.3],
  });
  b.part(new THREE.DodecahedronGeometry(0.016, 0), eggPaint, {
    at: [-0.46, 0.006, -0.06],
    scale: [1, 0.35, 1],
  });

  return b.root;
}
