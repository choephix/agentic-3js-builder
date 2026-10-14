import * as THREE from "three";
import { createBuilder, bezier, catmull, grain, limb, paint } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

// Palette (sRGB)
const BLACK = "#15120f";
const WHITE = "#f4f1e8";
const BILL = "#f8a51b";
const BILL_TIP = "#17110d";
const EYE_BLUE = "#2b9fe0";
const PUPIL = "#0d0b0a";
const SHINE = "#ffffff";
const LEG = "#4d4a45";
const CLAW = "#1e1a17";
const RED = "#d93a2c";
const WING = "#262c36";
const BARK = "#71462a";
const BARK_DARK = "#43260f";
const WOOD = "#e0ab6e";
const LEAF = "#3d9b4c";
const LEAF_LIGHT = "#72c35c";

// Smooth piecewise profile over t in [0, 1], keyed evenly.
function profile(keys: number[]) {
  return (t: number): number => {
    const x = Math.min(1, Math.max(0, t)) * (keys.length - 1);
    const i = Math.min(keys.length - 2, Math.floor(x));
    const f = x - i;
    const s = f * f * (3 - 2 * f);
    return keys[i] + (keys[i + 1] - keys[i]) * s;
  };
}

export const meta = {
  name: "toucan",
  description:
    "A toco toucan perched on a bark stump beside two leaves: black plumage, white throat, orange bill with a black tip, red undertail.",
};

// Folded wing lying on the flank (outline in x = forward, y = up).
const wingOutline: OutlinePoint[] = [
  [0.1, 0.07],
  [0, 0.085],
  [-0.08, 0.07],
  [-0.15, 0, "sharp"],
  [-0.1, -0.045],
  [-0.02, -0.055],
  [0.06, -0.04],
  [0.11, -0.005],
];

// Leaf outline for the stump props.
const leafOutline: OutlinePoint[] = [
  [0, 0, "sharp"],
  [0.05, 0.03],
  [0.11, 0.024],
  [0.15, 0, "sharp"],
  [0.11, -0.022],
  [0.05, -0.028],
];

export default function build() {
  const b = createBuilder({ name: "toucan" });

  // ---- skeleton ----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.24, -0.06], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.25, -0.01],
      [0, 0.272, 0.04],
      [0, 0.305, 0.1],
    ]),
    { parent: hips, names: ["spine1", "chest"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.305, 0.1],
      [0, 0.34, 0.15],
      [0, 0.37, 0.19],
    ]),
    { parent: spine.joints[1], names: ["neck1", "neck2"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.382, 0.2],
    dir: [0, 0.25, 1],
    role: "head",
  });

  // Lower mandible hinges at the back of the bill.
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0, up: -0.02 }),
    aim: head.local({ forward: 0.2, up: -0.04 }),
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.25, -0.03],
      [0, 0.215, -0.12],
      [0, 0.165, -0.21],
    ]),
    { parent: hips, names: ["tail1", "tail2"], role: "tail" },
  );

  // ---- plumage -----------------------------------------------------------
  const plumage = paint((p, n) => (p.z > 0.03 && n.z > 0 && n.y < 0.4 ? WHITE : BLACK));

  const bodyRx = profile([0.04, 0.07, 0.074, 0.066, 0.05]);
  const bodyRy = profile([0.05, 0.078, 0.084, 0.07, 0.055]);
  b.sweep(spine, (t: number): [number, number] => [bodyRx(t), bodyRy(t)], {
    sides: 10,
    smooth: false,
    color: plumage,
    name: "body",
  });

  b.sweep(neck, (t: number): [number, number] => [0.046 + 0.004 * t, 0.05], {
    sides: 10,
    smooth: false,
    color: plumage,
    name: "neck",
  });

  // Tail: flat blocky feather fan with a red undertail.
  const tailPaint = paint((_p, n) => (n.y < -0.35 ? RED : BLACK));
  b.sweep(tail, (t: number): [number, number] => [0.036 - 0.008 * t, 0.012 - 0.003 * t], {
    section: "box",
    color: tailPaint,
    name: "tail",
  });

  // ---- head --------------------------------------------------------------
  const headPaint = paint((p, n) => (n.y < -0.3 && p.z > 0.2 ? WHITE : BLACK));
  b.part(new THREE.SphereGeometry(0.068, 12, 8).scale(1, 1, 1.12), headPaint, {
    bone: head,
    at: head.at,
    flat: true,
    name: "head",
  });

  for (const k of [1, -1]) {
    const tag = k > 0 ? "L" : "R";
    // Blue orbital ring, dark pupil and a catchlight.
    b.part(new THREE.TorusGeometry(0.02, 0.008, 6, 10), EYE_BLUE, {
      bone: head,
      at: head.local({ left: k * 0.06, up: 0.012, forward: 0.036 }),
      dir: [k, 0.15, 0.4],
      axis: "z",
      flat: true,
      name: `eyeRing${tag}`,
    });
    b.part(new THREE.SphereGeometry(0.011, 8, 6), PUPIL, {
      bone: head,
      at: head.local({ left: k * 0.066, up: 0.012, forward: 0.04 }),
      flat: true,
      name: `pupil${tag}`,
    });
    b.part(new THREE.SphereGeometry(0.0045, 6, 4), SHINE, {
      bone: head,
      at: head.local({ left: k * 0.072, up: 0.024, forward: 0.036 }),
      name: `shine${tag}`,
    });
  }

  // ---- bill: separate upper and lower mandible --------------------------
  const billPaint = paint((p) => (p.z > 0.36 ? BILL_TIP : BILL));

  const upperPath = bezier(
    head.local({ forward: 0.02, up: 0.014 }),
    head.local({ forward: 0.09, up: 0.02 }),
    head.local({ forward: 0.17, up: 0.006 }),
    head.local({ forward: 0.23, up: -0.012 }),
  );
  b.sweep(
    upperPath,
    (t: number): [number, number] => {
      const k = 1 - t;
      return [0.012 + 0.024 * k ** 1.4, 0.009 + 0.028 * k ** 1.2];
    },
    {
      bone: head,
      sides: 10,
      smooth: false,
      caps: { start: "round", end: "point" },
      color: billPaint,
      name: "billUpper",
    },
  );

  const lowerPath = bezier(
    head.local({ forward: 0, up: -0.02 }),
    head.local({ forward: 0.07, up: -0.026 }),
    head.local({ forward: 0.15, up: -0.034 }),
    head.local({ forward: 0.2, up: -0.04 }),
  );
  b.sweep(
    lowerPath,
    (t: number): [number, number] => {
      const k = 1 - t;
      return [0.01 + 0.024 * k ** 1.4, 0.007 + 0.011 * k ** 1.2];
    },
    {
      bone: jaw,
      sides: 10,
      smooth: false,
      caps: { start: "round", end: "point" },
      color: billPaint,
      name: "billLower",
    },
  );

  // ---- wings, legs and feet ---------------------------------------------
  for (const k of [1, -1]) {
    const tag = k > 0 ? "L" : "R";

    // Wing chain for the rig; the folded wing is a flat slab on its flank.
    const wing = b.chain(
      `wing${tag}`,
      catmull([
        [k * 0.07, 0.31, 0.07],
        [k * 0.08, 0.27, -0.03],
        [k * 0.07, 0.22, -0.13],
      ]),
      { parent: spine.joints[1], names: [`shoulder${tag}`, `wrist${tag}`], role: "wing" },
    );
    b.extrude(wingOutline, {
      at: [k * 0.078, 0.262, -0.02],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: [0.011, 0.008],
      bevel: 0.003,
      smoothing: 1,
      color: WING,
      bone: wing.joints[0],
      name: `wing${tag}`,
    });

    // Leg: hip, knee forward, ankle on the perch.
    const hipPt = [k * 0.03, 0.2, -0.01];
    const foot = [k * 0.03, 0.128, 0];
    const leg = b.chain(`leg${tag}`, limb(hipPt, foot, [0.05, 0.07], [[0, 0, 1]]), {
      parent: hips,
      names: [`hip${tag}`, `knee${tag}`, `ankle${tag}`],
      role: "leg",
    });
    const ankle = leg.tip!;
    b.sweep(leg, [0.013, 0.009], { color: LEG, name: `leg${tag}` });

    // Zygodactyl foot: two toes forward, two back, each with a claw.
    const toes: [number, number, number][] = [
      [k * 0.05, 0.128, 0.04],
      [k * 0.015, 0.128, 0.05],
      [k * 0.05, 0.128, -0.03],
      [k * 0.012, 0.128, -0.036],
    ];
    toes.forEach((end, i) => {
      const forward = i < 2;
      b.capsule(foot, end, 0.008, { bone: ankle, color: LEG, name: `toe${tag}${i}` });
      b.spike(end, [0, -0.3, forward ? 1 : -1], 0.016, 0.0045, {
        bone: ankle,
        color: CLAW,
        name: `claw${tag}${i}`,
      });
    });
  }

  // ---- perch and leaves --------------------------------------------------
  const bark = grain(BARK, BARK_DARK, { size: 0.03, axis: "y", seed: 4 });
  const stumpPaint = paint((_p, n) => (n.y > 0.8 ? WOOD : bark));
  b.part(new THREE.CylinderGeometry(0.1, 0.115, 0.12, 10), stumpPaint, {
    bone: hips,
    at: [0, 0.06, 0],
    flat: true,
    name: "stump",
  });

  b.extrude(leafOutline, {
    at: [0.085, 0.085, 0],
    x: [0.7, 0.7, 0],
    y: [0, 0, 1],
    thickness: 0.006,
    bevel: 0.002,
    smoothing: 2,
    color: LEAF,
    bone: hips,
    name: "leafA",
  });
  b.extrude(leafOutline, {
    at: [-0.09, 0.08, -0.05],
    x: [-0.75, 0.66, 0],
    y: [0, 0, 1],
    thickness: 0.006,
    bevel: 0.002,
    smoothing: 2,
    color: LEAF_LIGHT,
    bone: hips,
    name: "leafB",
  });

  return b.root;
}
