// Peacock. A 24-feather train ringed around a vertical line behind the rump on 6 group joints, built
// lying back and then raised into display by posing those 6 joints; the body and neck are one smooth-skinned tube
// over the spine and neck chains; a 7-feather crest ringed around the head's forward line on 2 joints; bird legs
// from `limb`; rig roles on every part of the skeleton; `detail` sets the tessellation budget in one place. Feather
// geometry never names a bone: each item carries its group joint.
import { SphereGeometry, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { aim, offset } from "../src/math";
import { bezier, catmull } from "../src/path";
import { interpolate } from "../src/sweep";

export const meta = {
  name: "Peacock",
  description: "24-feather train on 6 group joints, raised into display by posing them.",
  builtBy: "SDK author (Claude Opus 5.5)",
};

const BLUE = "#1f4fa8";
const TEAL = "#1b8a7a";
const GREEN = "#2f7d3a";
const GOLD = "#d8a631";
const EYE = "#16264f";
const BEAK = "#c9b98f";
const LEG = "#8f8579";
const WING = "#8a6a45";

export default function build() {
  // detail 0.8: every default side count, ring spacing and b.segments() scales down: 6.3k triangles (10.7k at 1).
  const b = createBuilder({ name: "peacock", detail: 0.8 });

  const bodyStations = [
    { at: [0, 0.6, -0.34], w: 0.16, h: 0.16 },
    { at: [0, 0.62, -0.1], w: 0.34, h: 0.36 },
    { at: [0, 0.68, 0.12], w: 0.3, h: 0.34 },
    { at: [0, 0.76, 0.28], w: 0.16, h: 0.18 },
  ] as const;
  const bodyCurve = catmull(bodyStations.map((station) => station.at));
  const neckCurve = catmull([
    [0, 0.74, 0.28],
    [0, 0.9, 0.36],
    [0, 1.04, 0.37],
    [0, 1.12, 0.42],
  ]);
  const fullCurve = bodyCurve.concat(neckCurve);
  const bodyT = bodyCurve.length / fullCurve.length;

  const hips = b.joint("hips", { at: [0, 0.62, -0.1], role: "spine" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.62, -0.1],
      [0, 0.66, 0.12],
      [0, 0.74, 0.28],
    ],
    { parent: hips, role: "spine", group: "body" },
  );
  const neck = b.chain("neck", neckCurve, {
    parent: spine.joints[1],
    count: 3,
    role: "neck",
    group: "neck",
  });

  const bodyRadius = (t: number): [number, number] => [
    interpolate(
      bodyCurve.knots,
      bodyStations.map((station) => station.w / 2),
      t,
    ),
    interpolate(
      bodyCurve.knots,
      bodyStations.map((station) => station.h / 2),
      t,
    ),
  ];
  b.sweep(fullCurve, bodyRadius, {
    from: 0,
    to: bodyT,
    bone: [spine, neck],
    color: BLUE,
    sectors: [[125, 235, TEAL]],
    caps: { end: "none" },
    group: "body",
  });
  b.sweep(fullCurve, (t) => [0.08 - 0.035 * t, 0.09 - 0.045 * t], {
    from: bodyT,
    to: 1,
    bone: [spine, neck],
    color: BLUE,
    caps: { start: "none" },
    group: "neck",
  });

  const head = b.joint("head", {
    at: neck.at(1),
    dir: [0, -0.1, 1],
    role: "head",
    group: "head",
  });
  b.capsule(head, head.local([0, 0.08, 0]), [0.055, 0.04], { color: BLUE, group: "head" });
  b.spike(head.local([0, 0.08, 0.005]), head.dir([0, 1, -0.1]), 0.07, 0.018, {
    bone: head,
    color: BEAK,
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.07, -0.01]),
    dir: head.dir([0, 1, -0.3]),
    role: "jaw",
  });
  b.spike(jaw, jaw, 0.06, 0.012, { color: BEAK, group: "jaw" });
  for (const s of [1, -1])
    b.part(new SphereGeometry(0.012, b.segments(8), b.segments(6)), "#101010", {
      bone: head,
      at: head.local([s * 0.042, 0.05, 0.015]),
      group: "head",
    });

  // Crest: 7 feathers on 2 joints, spread 60° over the top of the head around its forward line, leaning forward.
  b.ring(
    frame(head.local([0, 0.03, 0.04]), head),
    { count: 7, radius: 0, fromDeg: -30, toDeg: 30, tilt: 14, joints: 2, name: "crest", parent: head, group: "head" },
    (feather) => {
      b.rod(feather, feather.moved([0, 0.12, 0]), 0.004, { color: BLUE });
      b.part(new SphereGeometry(0.012, b.segments(8), b.segments(6)), TEAL, { at: feather.moved([0, 0.12, 0]) });
    },
  );

  // Train: 24 feathers on 6 joints (4 per joint), fanned 110° behind the rump around a made-up vertical line and
  // tilted slightly down.
  const up = new Vector3(0, 1, 0);
  const train = b.ring(
    frame([0, 0.62, -0.3], up),
    {
      count: 24,
      fromDeg: 125,
      toDeg: 235,
      tilt: -8.5,
      joints: 6,
      name: "train",
      parent: hips,
      role: "tail",
      group: "train",
    },
    (feather) => {
      const tip = offset(feather, feather, 1.05);
      const bend = offset(offset(feather, feather, 0.5), up, 0.05);
      b.sweep(bezier(feather, bend, tip), [0.012, 0.005], { color: GREEN, caps: { end: "point" } });
      const eye = feather.moved([0, 0.93, 0]);
      b.part(new SphereGeometry(1, b.segments(10), b.segments(6)), GOLD, {
        at: eye,
        quat: aim(up, feather),
        scale: [0.055, 0.01, 0.075],
      });
      b.part(new SphereGeometry(1, b.segments(10), b.segments(6)), EYE, {
        frame: eye,
        at: offset(eye, up, 0.004),
        quat: aim(up, feather),
        scale: [0.028, 0.01, 0.036],
      });
    },
  );

  // Legs: thigh, shin, tarsus and a toe flat on the floor. The rig answer key records the floor contact.
  const toeR = 0.02;
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const target: [number, number, number] = [s * 0.11, toeR, 0.12];
    const leg = b.chain(
      `leg${side}`,
      limb(
        [s * 0.09, 0.56, -0.08],
        target,
        [0.2, 0.24, 0.16, 0.08],
        [
          [0, 0, 1],
          [0, 0, -1],
          [0, 0, 1],
        ],
        { sole: [0, 0, 1] },
      ),
      {
        parent: hips,
        names: ["thigh", "shin", "tarsus", "toe"].map((n) => n + side),
        role: "leg",
        contact: [s * 0.11, 0, 0.1],
        group: `leg${side}`,
      },
    );
    b.sweep(leg, [0.05, 0.02], { color: LEG });
    for (const dx of [-0.025, 0, 0.025])
      b.spike(leg.at(1).moved([dx, 0, 0]), [0, -0.2, 1], 0.05, 0.012, { color: LEG });

    // Folded wing along the flank: a wing chain with a membrane down to a line on the flank.
    const wing = b.chain(
      `wing${side}`,
      [
        [s * 0.16, 0.74, 0.16],
        [s * 0.19, 0.7, -0.06],
        [s * 0.15, 0.66, -0.28],
      ],
      { parent: spine.joints[1], role: "wing", group: `wing${side}` },
    );
    b.sweep(wing, [0.025, 0.015], { color: WING });
    b.membrane(
      wing,
      [
        [s * 0.15, 0.62, 0.14],
        [s * 0.18, 0.58, -0.06],
        [s * 0.15, 0.66, -0.28],
      ],
      { thickness: 0.015, color: WING, group: `wing${side}` },
    );
  }

  // Display: raise the train by posing its 6 group joints. +deg about a joint's local X lifts its run up.
  for (const joint of train.joints) b.pose(joint, { axis: joint.dir([1, 0, 0]), deg: 72 });

  return b.root;
}
