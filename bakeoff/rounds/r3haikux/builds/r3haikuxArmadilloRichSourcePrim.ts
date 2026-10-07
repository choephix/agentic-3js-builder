import * as THREE from "three";
import {
  catmull,
  createBuilder,
  limb,
  mix,
  mottle,
  paint,
  resolve,
  rng,
  scales,
  smoothstep,
} from "../../../../src/index";
import type { Builder, Joint } from "../../../../src/index";

export const meta = {
  name: "Nine-banded armadillo",
  description:
    "A trotting nine-banded armadillo: a dusty pinkish-tan banded shell, tall leathery ears, beady eyes, clawed feet, a long tapering armoured tail and a sprinkle of coarse pale hairs.",
};

// Palette (sRGB).
const SHELL = "#c69d8d";
const SHELL_DEEP = "#a9796b";
const SHELL_LIGHT = "#dcbcab";
const GROOVE = "#6b4840";
const BELLY = "#e9d6cb";
const LEG = "#b48777";
const PAW = "#94675a";
const EAR = "#c39284";
const EAR_INNER = "#e5c6b8";
const NOSE = "#4a302d";
const EYE = "#17100e";
const GLINT = "#ffffff";
const CLAW = "#eee2cf";
const HAIR = "#f1e6d4";

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// Shell bands: nine transverse plates between a scute shield in front and a mosaic behind.
const BANDS = 9;
const BAND_TOP = 0.12;
const BAND_PITCH = 0.0165;
const BAND_BOTTOM = BAND_TOP - BANDS * BAND_PITCH;

/** How far a point on the banded shield sits across its plate: 0 at the leading edge, near 1 at the groove. */
function across(z: number) {
  const x = (BAND_TOP - z) / BAND_PITCH;
  return x - Math.floor(x);
}

// Feet: ankle to toes, and the way the claws point (forward and down).
const FOOT = v(0, -0.016, 0.046);
const CLAW_DIR = v(0, -0.48, 0.88).normalize();
/** The ankle height that puts the claw tips of a foot on the floor, for claws of length `len`. */
const planted = (len: number) => -FOOT.y - CLAW_DIR.y * len;

// Tall, thin, leathery ear: an outline pushed into a tapering slab.
const EAR_OUTLINE: Array<[number, number]> = [
  [-0.024, 0],
  [0.024, 0],
  [0.029, 0.034],
  [0.019, 0.07],
  [0, 0.086],
  [-0.019, 0.068],
  [-0.029, 0.032],
];

// Paints: banded plates with dark overlapping grooves, scutes front and rear, a pale belly,
// a pebbled head shield, bands down the tail and a soft mottle for the ears.
const dusk = mottle(SHELL, SHELL_DEEP, { size: 0.045, seed: 4, contrast: 1.4 });
const plates = paint((p, n) => {
  const f = across(p.z);
  const plate = mix(SHELL_LIGHT, resolve(dusk, p, n), smoothstep(0.05, 0.7, f));
  return mix(plate, GROOVE, smoothstep(0.8, 0.96, f));
});
const scutes = scales([SHELL, SHELL_DEEP, SHELL_LIGHT], GROOVE, { size: 0.02, width: 0.16, seed: 9 });
const shellPaint = paint((p, n) => {
  const surface = p.z > BAND_TOP || p.z < BAND_BOTTOM ? scutes : plates;
  return mix(resolve(surface, p, n), BELLY, smoothstep(-0.15, -0.5, n.y));
});
const headScutes = scales([SHELL, SHELL_LIGHT], GROOVE, { size: 0.014, width: 0.2, seed: 21 });
const headPaint = paint((p, n) => mix(resolve(headScutes, p, n), BELLY, smoothstep(-0.2, -0.6, n.y)));
const tailPaint = paint((_p, _n, s) => {
  const x = s[0] * 13;
  const f = x - Math.floor(x);
  const plate = mix(SHELL_LIGHT, SHELL_DEEP, smoothstep(0.05, 0.7, f));
  return mix(plate, GROOVE, smoothstep(0.8, 0.96, f));
});
const earPaint = mottle(EAR, EAR_INNER, { size: 0.02, seed: 2, contrast: 0.8 });

type LegPlan = {
  side: "FL" | "FR" | "HL" | "HR";
  parent: Joint;
  root: THREE.Vector3;
  foot: THREE.Vector3;
  bend: [number, number, number];
  lengths: [number, number];
  radii: [number, number];
  names: [string, string, string, string];
  claws: number;
  clawLen: number;
};

/** One leg: a two-bone limb solved onto its foot, capsule segments, a foot pad and curved-down claws. */
function buildLeg(b: Builder, plan: LegPlan) {
  const [root, knee, ankle] = limb(plan.root, plan.foot, plan.lengths, plan.bend);
  const toe = ankle.clone().add(FOOT);
  const chain = b.chain(`leg${plan.side}`, [root, knee, ankle, toe], {
    parent: plan.parent,
    names: plan.names,
    role: "leg",
  });
  const [hip, elbow, wrist, toes] = chain.joints;

  const segment = (from: THREE.Vector3, to: THREE.Vector3, r: number, bone: Joint, name: string) =>
    b.part(new THREE.CapsuleGeometry(r, Math.max(from.distanceTo(to) - 2 * r, 0.004), 3, 8), LEG, {
      at: from.clone().lerp(to, 0.5),
      aim: to,
      bone,
      name: `${name}${plan.side}`,
    });
  segment(root, knee, plan.radii[0], hip, "upper");
  segment(knee, ankle, plan.radii[1], elbow, "lower");

  b.part(new THREE.SphereGeometry(1, 10, 8), PAW, {
    at: ankle.clone().lerp(toe, 0.5),
    aim: toe,
    axis: "z",
    scale: [0.024, 0.015, 0.031],
    bone: wrist,
    name: `paw${plan.side}`,
  });

  for (let i = 0; i < plan.claws; i++) {
    const offset = (i - (plan.claws - 1) / 2) * 0.0105;
    const dir = v(offset * 4, CLAW_DIR.y, CLAW_DIR.z).normalize();
    b.spike(toe.clone().add(v(offset, 0, -0.002)), dir, plan.clawLen, 0.0042, {
      color: CLAW,
      bone: toes,
      name: "claw",
    });
  }
}

export default function armadillo() {
  const b = createBuilder({ name: "nine-banded armadillo", paintSize: 1024 });

  // Skeleton: root, spine (rump to neck), tail, head with jaw, four legs in a trot.
  const root = b.joint("root", { at: [0, 0.17, -0.02], dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.17, -0.22],
      [0, 0.17, -0.15],
      [0, 0.17, -0.02],
      [0, 0.17, 0.09],
      [0, 0.155, 0.17],
    ],
    { parent: root, names: ["rump", "hips", "back", "shoulder", "neck"], role: "spine" },
  );
  const [rump, hips, , shoulder, neck] = spine.joints;

  // Long armoured tail, tapering to a point.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.17, -0.22],
      [0, 0.163, -0.3],
      [0, 0.147, -0.39],
      [0, 0.122, -0.47],
      [0, 0.09, -0.55],
    ]),
    { parent: rump, names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail" },
  );
  b.sweep(tail, (t: number) => 0.036 * (1 - t) ** 0.8 + 0.003, {
    color: tailPaint,
    caps: { start: "round", end: "point" },
    sides: 10,
    name: "tail",
  });

  // Shell: a smooth banded body that bends with the spine.
  const body = b.loft(
    [
      { at: [0, 0.17, -0.23], w: 0.1, h: 0.1 },
      { at: [0, 0.17, -0.16], w: 0.16, h: 0.13 },
      { at: [0, 0.17, -0.02], w: 0.19, h: 0.14 },
      { at: [0, 0.17, 0.09], w: 0.18, h: 0.14 },
      { at: [0, 0.165, 0.16], w: 0.14, h: 0.12 },
    ],
    { color: shellPaint, bone: spine, sides: 12, name: "shell" },
  );

  // Head: tapering snout with a pointy tip, on the neck joint.
  const headJoint = b.joint("head", {
    parent: neck,
    at: [0, 0.155, 0.17],
    dir: [0, -0.12, 1],
    role: "head",
  });
  b.loft(
    [
      { at: [0, 0.16, 0.135], w: 0.13, h: 0.12 },
      { at: [0, 0.155, 0.21], w: 0.1, h: 0.095 },
      { at: [0, 0.14, 0.275], w: 0.064, h: 0.06 },
      { at: [0, 0.128, 0.325], w: 0.03, h: 0.028 },
      { at: [0, 0.122, 0.345], w: 0.008, h: 0.008 },
    ],
    { color: headPaint, bone: headJoint, sides: 12, name: "head" },
  );

  // Tall leathery ears, leaning back, on each side of the skull.
  for (const side of [1, -1]) {
    b.extrude(EAR_OUTLINE, {
      color: earPaint,
      at: [side * 0.04, 0.2, 0.15],
      bone: headJoint,
      x: [0, 0.25, 1],
      thickness: [0.013, 0.004],
      bevel: 0.003,
      smoothing: 1,
      name: side > 0 ? "ear.L" : "ear.R",
    });
  }

  // Small beady eyes with a glint, a dark nose at the snout tip.
  for (const side of [1, -1]) {
    const eye = v(side * 0.046, 0.166, 0.225);
    b.part(new THREE.SphereGeometry(0.0085, 8, 6), EYE, { at: eye, bone: headJoint, name: "eye" });
    const glint = eye.clone().addScaledVector(v(side * 0.5, 0.6, 0.7).normalize(), 0.0068);
    b.part(new THREE.SphereGeometry(0.0027, 6, 4), GLINT, { at: glint, bone: headJoint, name: "glint" });
  }
  b.part(new THREE.SphereGeometry(0.0085, 8, 6), NOSE, {
    at: [0, 0.122, 0.344],
    bone: headJoint,
    scale: [1.2, 0.9, 1],
    name: "nose",
  });

  // Separate lower jaw, so the mouth can open.
  const jaw = b.joint("jaw", { parent: headJoint, at: [0, 0.1, 0.27], dir: [0, 0, 1], role: "jaw" });
  b.part(new THREE.CapsuleGeometry(0.0085, 0.05, 3, 6), SHELL_DEEP, {
    at: [0, 0.1, 0.3],
    aim: [0, 0.1, 0.36],
    bone: jaw,
    name: "jaw",
  });

  // Trot: front left and hind right planted (claws on the floor), front right and hind left lifted and reaching.
  const legs: LegPlan[] = [
    {
      side: "FL",
      parent: shoulder,
      root: v(0.095, 0.14, 0.095),
      foot: v(0.1, planted(0.026), 0.125),
      bend: [0, 0, -1],
      lengths: [0.07, 0.065],
      radii: [0.026, 0.02],
      names: ["shoulderFL", "elbowFL", "wristFL", "toesFL"],
      claws: 4,
      clawLen: 0.026,
    },
    {
      side: "FR",
      parent: shoulder,
      root: v(-0.095, 0.14, 0.095),
      foot: v(-0.105, 0.085, 0.18),
      bend: [0, 0, -1],
      lengths: [0.07, 0.065],
      radii: [0.026, 0.02],
      names: ["shoulderFR", "elbowFR", "wristFR", "toesFR"],
      claws: 4,
      clawLen: 0.026,
    },
    {
      side: "HL",
      parent: hips,
      root: v(0.095, 0.145, -0.15),
      foot: v(0.1, 0.1, -0.07),
      bend: [0, 0, 1],
      lengths: [0.075, 0.07],
      radii: [0.03, 0.022],
      names: ["hipHL", "kneeHL", "ankleHL", "toesHL"],
      claws: 5,
      clawLen: 0.019,
    },
    {
      side: "HR",
      parent: hips,
      root: v(-0.095, 0.145, -0.15),
      foot: v(-0.1, planted(0.019), -0.1),
      bend: [0, 0, 1],
      lengths: [0.075, 0.07],
      radii: [0.03, 0.022],
      names: ["hipHR", "kneeHR", "ankleHR", "toesHR"],
      claws: 5,
      clawLen: 0.019,
    },
  ];
  for (const leg of legs) buildLeg(b, leg);

  // A sprinkle of coarse pale hairs poking out of the grooves between the bands, leaning back.
  const coat = b.surface(body);
  const random = rng(11);
  const LEAN = v(0, 0.25, -1).normalize();
  const hairs = coat.scatter(110, {
    rng: random,
    minDist: 0.011,
    filter: (hit) =>
      hit.n.y > -0.25 && hit.at.z < BAND_TOP && hit.at.z > BAND_BOTTOM && across(hit.at.z) > 0.7,
  });
  for (const hit of hairs) {
    const dir = hit.n.clone().addScaledVector(LEAN, 0.9).normalize();
    b.spike(hit, dir, 0.02 + 0.014 * random(), 0.0019, { color: HAIR, name: "hair" });
  }

  return b.root;
}
