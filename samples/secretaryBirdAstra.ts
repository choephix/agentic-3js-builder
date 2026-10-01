// Secretary Bird · Astra
// A stylised secretary bird standing in a neutral rest pose: long bare legs,
// black thigh feathers, half-open wings, paired tail streamers, and a fan of crest quills.

import { SphereGeometry } from "three";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import type { V3 } from "../src/math";
import { catmull } from "../src/path";

export const meta = {
  name: "Secretary Bird · Astra",
  description:
    "A stylised secretary bird with long black-feathered thighs, bare scaly legs, outspread flight feathers, paired tail streamers, an orange-red face, hooked beak, and fanned crest quills.",
};

const BODY = "#8a9294";
const BODY_DARK = "#596164";
const BELLY = "#b6b7ad";
const THIGH = "#1b2024";
const FLIGHT = "#242a2f";
const FLIGHT_HIGHLIGHT = "#384149";
const BLACK = "#111619";
const SCALE = "#ad6a52";
const FACE = "#ce563b";
const BEAK = "#687278";
const BEAK_DARK = "#3e474c";
const EYE = "#111111";
const TOE = "#5e4540";

export default function build() {
  const b = createBuilder({ name: "secretaryBirdAstra" });

  // ---------------------------------------------------------------------------
  // Skeleton and torso. The bird is 1.3 m tall from the floor to the crest.
  // ---------------------------------------------------------------------------
  const root = b.joint("root", { at: [0, 0.74, -0.18], role: "spine", group: "body" });
  const pelvis = b.joint("pelvis", {
    parent: root,
    at: [0, 0.74, -0.42],
    role: "spine",
    group: "body",
  });
  const bodyStations = [
    { at: [0, 0.73, -0.46], w: 0.20, h: 0.22 },
    { at: [0, 0.75, -0.28], w: 0.28, h: 0.30 },
    { at: [0, 0.77, -0.04], w: 0.31, h: 0.33 },
    { at: [0, 0.80, 0.17], w: 0.29, h: 0.31 },
    { at: [0, 0.85, 0.34], w: 0.21, h: 0.25 },
  ] as const;
  const bodyCurve = catmull(bodyStations.map((s) => s.at));
  const spine = b.chain("spine", bodyCurve.slice(bodyCurve.knots[1], 1), {
    parent: root,
    names: ["spine1", "spine2", "chest", "neckBase"],
    role: "spine",
    group: "body",
  });
  b.loft(bodyStations, {
    bone: [pelvis, root, spine],
    color: BODY,
    sectors: [
      [-65, 65, BODY_DARK],
      [125, 235, BELLY],
    ],
  });

  const neck = b.joint("neck", {
    parent: spine.tip!,
    at: [0, 0.93, 0.39],
    dir: [0, 0.15, 1],
    role: "neck",
    group: "body",
  });
  b.sweep(
    catmull([
      neck.at,
      [0, 1.00, 0.42],
      [0, 1.07, 0.43],
    ]),
    [0.13, 0.10],
    { bone: neck, color: BODY, sectors: [[-70, 70, BODY_DARK], [120, 240, BELLY]] },
  );

  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.06, 0.43],
    dir: [0, 0.18, 1],
    role: "head",
    group: "head",
  });
  b.loft(
    [
      { at: head.local([0, -0.06, 0]), w: 0.14, h: 0.15 },
      { at: head.local([0, 0.05, 0.01]), w: 0.15, h: 0.16 },
      { at: head.local([0, 0.17, 0.00]), w: 0.11, h: 0.12 },
    ],
    { bone: head, color: BODY },
  );

  // Bare facial skin and small dark eyes on either side of the skull.
  b.part(new SphereGeometry(1, b.segments(8), b.segments(6)), FACE, {
    bone: head,
    at: head.local([0, 0.095, 0.015]),
    scale: [0.105, 0.065, 0.10],
  });
  for (const s of [1, -1]) {
    b.part(new SphereGeometry(0.022, b.segments(7), b.segments(5)), EYE, {
      bone: head,
      at: head.local([s * 0.105, 0.08, 0.055]),
      scale: [0.85, 0.65, 1.05],
    });
  }

  // Upper hooked beak and an independently articulated lower beak.
  const upperBeak = catmull([
    head.local([0, 0.13, 0.015]),
    head.local([0, 0.24, 0.015]),
    head.local([0, 0.33, -0.01]),
    head.local([0, 0.30, -0.075]),
  ]);
  b.sweep(upperBeak, (t: number) => 0.045 * (1 - 0.82 * t), {
    bone: head,
    color: BEAK,
    caps: { start: "flat", end: "point" },
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.03, -0.07]),
    dir: head.dir([0, 0.9, -0.18]),
    role: "jaw",
    group: "head",
  });
  b.sweep(
    catmull([jaw.at, jaw.local([0, 0.14, 0]), jaw.local([0, 0.26, -0.02])]),
    [0.032, 0.012],
    { bone: jaw, color: BEAK_DARK, caps: { start: "flat", end: "point" } },
  );

  // ---------------------------------------------------------------------------
  // Long legs: feathered black thighs, then exposed warm scaly shanks.
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const hip: V3 = [s * 0.14, 0.72, -0.23];
    const foot: V3 = [s * 0.15, 0.052, 0.11];
    const hipJoint = b.joint(`hip${s > 0 ? "L" : "R"}`, {
      parent: pelvis,
      at: hip,
      role: "leg",
      group: "legs",
    });
    const points = limb(hip, foot, [0.30, 0.31, 0.25], [[0, 0, 1], [0, 0, -1]]);
    const leg = b.chain(`leg${s > 0 ? "L" : "R"}`, points, {
      parent: hipJoint,
      names: [
        `knee${s > 0 ? "L" : "R"}`,
        `ankle${s > 0 ? "L" : "R"}`,
        `shin${s > 0 ? "L" : "R"}`,
        `foot${s > 0 ? "L" : "R"}`,
      ],
      role: "leg",
      group: "legs",
    });
    b.sweep(points, (t: number) => {
      if (t < 0.34) return 0.075 * (1 - 0.16 * t);
      return 0.034 * (1 - 0.35 * t);
    }, {
      bone: leg,
      color: (t: number) => (t < 0.34 ? THIGH : SCALE),
      smooth: true,
    });
    // A few pointed thigh coverts make the black upper leg read as feathers.
    const knee = points[1];
    for (const d of [-1, 0, 1]) {
      b.spike(
        [knee.x + d * 0.022, knee.y + 0.025, knee.z - 0.015],
        [0, -0.25, -1],
        0.075,
        0.018,
        { bone: leg.joints[0], color: THIGH, caps: "point" },
      );
    }
    // Three short forward toes plus a small rear toe, planted just above y=0.
    const toeEnds: V3[] = [
      [foot[0] - s * 0.035, 0.014, 0.235],
      [foot[0], 0.012, 0.255],
      [foot[0] + s * 0.035, 0.014, 0.225],
      [foot[0], 0.014, 0.005],
    ];
    for (const end of toeEnds) {
      b.rod(foot, end, 0.012, { bone: leg.tip!, color: TOE, caps: "round" });
      b.spike(end, [0, -0.12, 1], 0.024, 0.009, { bone: leg.tip!, color: TOE });
    }
  }

  // ---------------------------------------------------------------------------
  // Wings held slightly away from the body, with a fan of separate flight feathers.
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const shoulder: V3 = [s * 0.22, 0.84, 0.20];
    const shoulderJoint = b.joint(`shoulder${s > 0 ? "L" : "R"}`, {
      parent: spine.joints[2],
      at: shoulder,
      dir: [s * 0.5, -0.12, -0.35],
      role: "wing",
      group: "wings",
    });
    const wingPath = catmull([
      shoulder,
      [s * 0.33, 0.84, 0.10],
      [s * 0.40, 0.78, -0.10],
    ]);
    const wing = b.chain(`wing${s > 0 ? "L" : "R"}`, wingPath, {
      parent: shoulderJoint,
      names: [`wingArm${s > 0 ? "L" : "R"}`, `wingTip${s > 0 ? "L" : "R"}`],
      role: "wing",
      group: "wings",
    });
    b.sweep(wing, [0.105, 0.045], {
      color: FLIGHT_HIGHLIGHT,
      sectors: [[-70, 65, FLIGHT], [110, 240, BLACK]],
    });
    for (let i = 0; i < 6; i++) {
      const rootP: V3 = [s * (0.27 + i * 0.018), 0.82 - i * 0.008, 0.10 - i * 0.018];
      const tipP: V3 = [s * (0.43 + i * 0.022), 0.76 - i * 0.018, -0.08 - i * 0.085];
      const featherPath = catmull([rootP, [s * (0.36 + i * 0.02), 0.80 - i * 0.01, -0.01 - i * 0.035], tipP]);
      b.sweep(featherPath, (t: number) => 0.028 * (1 - 0.84 * t), {
        bone: wing,
        color: i % 2 === 0 ? FLIGHT : BLACK,
        caps: { start: "round", end: "point" },
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Tail shaft and two long central streamers.
  // ---------------------------------------------------------------------------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.76, -0.43],
      [0, 0.77, -0.62],
      [0, 0.75, -0.80],
    ]),
    { parent: pelvis, names: ["tail1", "tail2"], role: "tail", group: "tail" },
  );
  b.sweep(tail, [0.035, 0.015], { color: BODY_DARK, caps: "round" });
  for (const s of [1, -1]) {
    const featherPath = catmull([
      [s * 0.018, 0.76, -0.58],
      [s * 0.026, 0.75, -0.80],
      [s * 0.033, 0.75, -1.02],
    ]);
    b.sweep(featherPath, (t: number) => 0.028 * (1 - t), {
      bone: tail,
      color: BLACK,
      caps: { start: "flat", end: "point" },
    });
  }

  // ---------------------------------------------------------------------------
  // Crest: long black-tipped quills fanning behind the head.
  // ---------------------------------------------------------------------------
  const crestOffsets = [-0.105, -0.07, -0.035, 0, 0.035, 0.07, 0.105];
  crestOffsets.forEach((x, i) => {
    const spread = x * 0.55;
    const top = 0.19 + (1 - Math.abs(x) / 0.105) * 0.05;
    const crestPath = catmull([
      head.local([x, -0.015, 0.055]),
      head.local([x + spread * 0.25, -0.06, 0.13]),
      head.local([x + spread, -0.10, top]),
    ]);
    b.sweep(crestPath, (t: number) => 0.014 * (1 - 0.60 * t), {
      bone: head,
      color: BODY_DARK,
      bands: [[0.66, BLACK], [1, BLACK]],
      caps: { start: "round", end: "point" },
    });
    if (i === 3) {
      // A second central streamer accentuates the characteristic secretary-bird crown.
      b.sweep(
        catmull([head.local([0, -0.02, 0.06]), head.local([0, -0.10, 0.18]), head.local([0, -0.15, 0.27])]),
        (t: number) => 0.012 * (1 - 0.65 * t),
        { bone: head, color: BLACK, caps: { start: "round", end: "point" } },
      );
    }
  });

  return b.root;
}
