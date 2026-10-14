```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  limb,
  rng,
  gradient,
  mottle,
  scales,
  spots,
  svg,
} from "agentic-3js-builder";

type V3 = [number, number, number];
type Pt = [number, number] | [number, number, "sharp"];

const TEAL = "#2fb5a6";
const TEAL_DEEP = "#17756f";
const BUTTER = "#f5e49a";
const ORANGE = "#f08a2e";
const AMBER = "#f8b449";
const AMBER_DEEP = "#dc7d22";
const BLUSH = "#f48fa0";
const HORN = "#f4ead0";
const TEETH = "#fdfbf3";
const CLAW = "#efe5c8";
const MOUTH = "#6b2231";
const DARK = "#1d1819";
const EGG = "#efe8d0";
const SPECK = "#9a6443";
const SMOKE = "#e6e3dd";

export const meta = {
  name: "Baby dragon",
  description:
    "A teal hatchling sitting proudly beside its speckled egg: buttery belly, orange back spines, amber wing membranes, a spade tail and a smoke wisp from one nostril.",
};

export default function build() {
  const b = createBuilder({ name: "baby-dragon" });
  const rand = rng(11);
  const sides = [1, -1];

  // ---- paints and drawings ----
  const hide = scales(TEAL, TEAL_DEEP, { size: 0.035, seed: 4 });
  const coat = gradient(BUTTER, hide, [0, 0.16, 0.16], [0, 0.3, -0.05]);
  const wingSkin = mottle(AMBER_DEEP, AMBER, { size: 0.1, contrast: 0.5, seed: 9 });
  const shell = spots(EGG, SPECK, { size: 0.02, amount: 0.3, seed: 5 });
  const eyeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="31" fill="#173b37"/>
      <circle cx="32" cy="32" r="27" fill="#f7b43e"/>
      <circle cx="32" cy="32" r="19" fill="#e9801f"/>
      <ellipse cx="32" cy="33" rx="5.5" ry="18" fill="#1a1314"/>
      <circle cx="25" cy="22" r="4.5" fill="#fff9e8"/>
    </svg>`,
    { size: 128 },
  );
  const blushTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40">
      <ellipse cx="32" cy="20" rx="30" ry="17" fill="${BLUSH}"/>
    </svg>`,
    { size: 128 },
  );

  // ---- skeleton: hips, spine, neck, head, jaw ----
  const hips = b.joint("hips", { at: [0, 0.12, -0.04], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.16, -0.02],
      [0, 0.23, 0.02],
      [0, 0.29, 0.07],
      [0, 0.345, 0.115],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.345, 0.115],
      [0, 0.385, 0.16],
      [0, 0.425, 0.2],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2", "neckTip"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.tip!, at: [0, 0.44, 0.22], dir: [0, 0.2, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.375, 0.2], aim: [0, 0.37, 0.38], role: "jaw" });

  // ---- trunk: one loft over hips, spine and neck ----
  const torso = b.loft(
    [
      { at: [0, 0.105, -0.07], w: 0.2, h: 0.2 },
      { at: [0, 0.16, -0.02], w: 0.22, h: 0.22 },
      { at: [0, 0.23, 0.02], w: 0.21, h: 0.21 },
      { at: [0, 0.29, 0.07], w: 0.17, h: 0.17 },
      { at: [0, 0.345, 0.115], w: 0.12, h: 0.12 },
      { at: [0, 0.4, 0.165], w: 0.1, h: 0.1 },
    ],
    { bone: [hips, spine, neck], color: coat },
  );
  // row of soft orange spines down the back (dorsal clock 0 = world up)
  b.along(torso, 8, (at) => b.spike(at, at.dir([0, 1, -0.35]), 0.05, 0.014, { color: ORANGE }), {
    from: 0.14,
    to: 0.9,
  });

  // ---- head: chunky loft with a snout ----
  const headBody = b.loft(
    [
      { at: [0, 0.45, 0.185], w: 0.15, h: 0.14 },
      { at: [0, 0.455, 0.25], w: 0.165, h: 0.15 },
      { at: [0, 0.45, 0.305], w: 0.15, h: 0.13 },
      { at: [0, 0.44, 0.35], w: 0.1, h: 0.09 },
      { at: [0, 0.43, 0.375], w: 0.06, h: 0.06 },
    ],
    { bone: head, color: coat },
  );
  const headSurf = b.surface(headBody);

  // big amber eyes with slit pupils, and cheek blush
  for (const s of sides) {
    b.decal(headBody, eyeTex, { at: [s * 0.072, 0.46, 0.275], dir: [s * 0.45, 0.1, 1], size: [0.07, 0.07] });
    b.decal(headBody, blushTex, { at: [s * 0.078, 0.425, 0.27], dir: [s, 0, 0.5], size: [0.05, 0.03] });
  }

  // upper teeth hang from the front of the head underside
  for (const x of [-0.035, -0.021, -0.007, 0.007, 0.021, 0.035]) {
    b.spike(headSurf.nearest([x, 0.36, 0.345]), [0, -1, 0.05], 0.018, 0.0065, { color: TEETH });
  }

  // one nostril, on the left (+X) side of the snout
  const nos = headSurf.nearest([0.015, 0.44, 0.41]);
  b.stick(new THREE.SphereGeometry(0.008, 6, 4), DARK, nos, { embed: 0.4 });

  // stubby horns on the back of the skull
  for (const s of sides) {
    const hornBase = headSurf.nearest([s * 0.04, 0.56, 0.19]);
    b.spike(hornBase, [s * 0.3, 1, -0.25], 0.05, 0.02, { color: HORN });
  }

  // ---- lower jaw, opened into a grin ----
  const jawBody = b.loft(
    [
      { at: [0, 0.37, 0.19], w: 0.1, h: 0.035 },
      { at: [0, 0.372, 0.28], w: 0.1, h: 0.035 },
      { at: [0, 0.378, 0.345], w: 0.075, h: 0.03 },
    ],
    { bone: jaw, color: BUTTER },
  );
  const jawSurf = b.surface(jawBody);
  for (const x of [-0.0225, -0.0075, 0.0075, 0.0225]) {
    b.spike(jawSurf.nearest([x, 0.42, 0.32]), [0, 1, 0.05], 0.014, 0.0055, { color: TEETH });
  }
  // dark mouth cavity along the jaw line
  b.loft(
    [
      { at: [0, 0.382, 0.2], w: 0.09, h: 0.02 },
      { at: [0, 0.39, 0.33], w: 0.08, h: 0.02 },
    ],
    { bone: head, color: MOUTH },
  );
  b.pose(jaw, { axis: [1, 0, 0], deg: 12 });

  // smoke wisp curling up from the nostril
  const n0: V3 = [nos.at.x, nos.at.y, nos.at.z];
  const smoke = catmull([
    n0,
    [0.03, 0.47, 0.44],
    [0.058, 0.5, 0.455],
    [0.052, 0.535, 0.44],
    [0.03, 0.565, 0.43],
    [0.036, 0.6, 0.45],
  ]);
  b.sweep(smoke, (t) => 0.006 + 0.02 * t, { bone: head, color: SMOKE });
  b.part(new THREE.SphereGeometry(0.013, 6, 4), SMOKE, { bone: head, at: [0.068, 0.64, 0.47] });

  // ---- tail: chubby, tapering, ending in a little spade ----
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.1, -0.12],
      [0, 0.09, -0.24],
      [0.03, 0.085, -0.31],
      [0.12, 0.085, -0.34],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tailTip"], role: "tail" },
  );
  const tailBody = b.sweep(tail, (t) => 0.05 - 0.02 * t, { color: coat });
  b.along(tailBody, 5, (at) => b.spike(at, at.dir([0, 1, -0.3]), 0.035, 0.011, { color: ORANGE }), {
    from: 0.12,
    to: 0.8,
  });
  const spade: Pt[] = [
    [0, 0, "sharp"],
    [0.035, 0.045],
    [0.085, 0.065],
    [0.13, 0.04],
    [0.15, 0],
    [0.13, -0.04],
    [0.085, -0.065],
    [0.035, -0.045],
  ];
  b.extrude(spade, {
    at: [0.12, 0.085, -0.34],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.02,
    bevel: 0.005,
    smoothing: 1,
    color: ORANGE,
    bone: tail.tip!,
  });

  // ---- legs, arms and wings, mirrored ----
  for (const s of sides) {
    const L = s > 0 ? "L" : "R";

    // hind leg: sitting, knee forward, foot flat in front
    const hipP: V3 = [s * 0.08, 0.12, -0.02];
    const ankleP: V3 = [s * 0.1, 0.03, 0.15];
    const legPts = limb(hipP, ankleP, [0.12, 0.11], [[s * 0.3, 0.2, 1]]);
    const leg = b.chain(`leg${L}`, legPts, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`],
      role: "leg",
    });
    b.sweep(leg, (t) => 0.048 - 0.014 * t, { color: coat });
    const fx = s * 0.1;
    const foot = b.loft(
      [
        { at: [fx, 0.03, 0.12], w: 0.07, h: 0.06 },
        { at: [fx, 0.03, 0.16], w: 0.08, h: 0.06 },
        { at: [fx, 0.028, 0.2], w: 0.06, h: 0.05 },
      ],
      { bone: leg.tip!, color: coat },
    );
    const footSurf = b.surface(foot);
    for (const dx of [-0.02, 0, 0.02]) {
      b.spike(footSurf.nearest([fx + dx, 0.022, 0.23]), [0, -0.25, 1], 0.02, 0.0055, { color: CLAW });
    }

    // fore leg: paws planted in front
    const wristP: V3 = [s * 0.085, 0.035, 0.175];
    const arm = b.chain(`arm${L}`, catmull([[s * 0.075, 0.26, 0.06], [s * 0.12, 0.16, 0.11], wristP]), {
      parent: spine.joints[2],
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`],
      role: "arm",
    });
    b.sweep(arm, [0.03, 0.022], { color: coat });
    const paw = b.loft(
      [
        { at: [s * 0.085, 0.03, 0.15], w: 0.055, h: 0.05 },
        { at: [s * 0.085, 0.028, 0.185], w: 0.065, h: 0.05 },
        { at: [s * 0.085, 0.026, 0.215], w: 0.05, h: 0.04 },
      ],
      { bone: arm.tip!, color: coat },
    );
    const pawSurf = b.surface(paw);
    for (const dx of [-0.018, 0, 0.018]) {
      b.spike(pawSurf.nearest([s * 0.085 + dx, 0.022, 0.24]), [0, -0.2, 1], 0.018, 0.005, { color: CLAW });
    }

    // wing: arm, three fingers, amber membranes between them
    const wrP: V3 = [s * 0.33, 0.47, -0.02];
    const wing = b.chain(`wing${L}`, catmull([[s * 0.07, 0.28, 0.05], [s * 0.2, 0.39, 0.03], wrP]), {
      parent: spine.joints[2],
      names: [`wingShoulder${L}`, `wingElbow${L}`, `wingWrist${L}`],
      role: "wing",
    });
    b.sweep(wing, [0.022, 0.012], { color: TEAL_DEEP });
    const tips: V3[] = [
      [s * 0.52, 0.5, 0.07],
      [s * 0.5, 0.36, 0.03],
      [s * 0.36, 0.2, -0.04],
    ];
    const digits = tips.map((tip, i) =>
      b.chain(`wingFinger${L}${i}`, polyline([wrP, tip]), {
        parent: wing.tip!,
        names: [`wingFinger${L}${i}`, `wingFinger${L}${i}Tip`],
        role: "digit",
      }),
    );
    for (const d of digits) {
      b.sweep(d, [0.011, 0.006], { color: TEAL_DEEP });
      b.spike(d.tip!, d.tip!, 0.03, 0.0065, { color: CLAW });
    }
    const flank = catmull([wrP, [s * 0.2, 0.33, 0.03], [s * 0.12, 0.25, 0.02], [s * 0.1, 0.16, -0.02]]);
    b.membrane(wing.path.slice(1, 0), digits[0], { color: wingSkin, thickness: 0.012, scallop: 0.08 });
    b.membrane(digits[0], digits[1], { color: wingSkin, thickness: 0.012, scallop: 0.15 });
    b.membrane(digits[1], digits[2], { color: wingSkin, thickness: 0.012, scallop: 0.15 });
    b.membrane(digits[2], flank, { color: wingSkin, thickness: 0.012 });
  }

  // ---- the broken speckled egg, beside the dragon ----
  const EGG_X = -0.27;
  const EGG_Z = 0.12;
  const eggOutline: Pt[] = [
    [0, 0],
    [0.07, 0],
    [0.11, 0.03],
    [0.125, 0.09],
    [0.12, 0.15],
    [0.105, 0.2, "sharp"],
    [0.095, 0.2, "sharp"],
    [0.11, 0.15],
    [0.116, 0.09],
    [0.1, 0.03],
    [0.06, 0.008],
    [0, 0.008],
  ];
  b.lathe(eggOutline, { at: [EGG_X, 0, EGG_Z], axis: [0, 1, 0], smoothing: 1, color: shell, bone: hips });

  // jagged shell pieces standing on the broken rim
  const rimShard: Pt[] = [
    [-0.025, -0.02],
    [0.025, -0.02],
    [0.018, 0.018],
    [0.004, 0.055, "sharp"],
    [-0.018, 0.012],
  ];
  for (const a of [0.9, 2.5]) {
    const rimAt: V3 = [EGG_X + 0.1 * Math.cos(a), 0.19, EGG_Z + 0.1 * Math.sin(a)];
    b.extrude(rimShard, {
      at: rimAt,
      x: [-Math.sin(a), 0, Math.cos(a)],
      y: [0, 1, 0],
      thickness: 0.007,
      color: shell,
      bone: hips,
    });
  }

  // flat shell fragments lying on the floor behind the egg
  const shard: Pt[] = [
    [-0.03, -0.012],
    [0.02, -0.02],
    [0.035, 0.01],
    [0, 0.026],
    [-0.02, 0.006],
  ];
  for (let i = 0; i < 4; i++) {
    const a = 2.0 + rand() * 2.2;
    const r = 0.17 + rand() * 0.07;
    const ax: V3 = [Math.cos(a), 0, Math.sin(a)];
    const ay: V3 = [-Math.sin(a), 0, Math.cos(a)];
    b.extrude(shard, {
      at: [EGG_X + r * Math.cos(a), 0.003, EGG_Z + r * Math.sin(a)],
      x: ax,
      y: ay,
      thickness: 0.006,
      color: shell,
      bone: hips,
    });
  }

  return b.root;
}
```