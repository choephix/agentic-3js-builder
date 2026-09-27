// Example 4: a peacock. A 24-feather train on 6 fan banks, built lying back and then raised into display by posing
// the banks; a 7-feather crest fan (cone-tilted); bird legs from `limb`; rig roles on every part of the skeleton;
// `detail` sets the tessellation budget in one place.
import { SphereGeometry, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { aim, offset } from "../src/math";
import { bezier, catmull } from "../src/path";

export const meta = { name: "SDK smoke: peacock" };

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
  b.loft(
    [
      { at: [0, 0.6, -0.34], w: 0.16, h: 0.16 },
      { at: [0, 0.62, -0.1], w: 0.34, h: 0.36 },
      { at: [0, 0.68, 0.12], w: 0.3, h: 0.34 },
      { at: [0, 0.76, 0.28], w: 0.16, h: 0.18 },
    ],
    { bone: spine, color: BLUE, sectors: [[125, 235, TEAL]], group: "body" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.74, 0.28],
      [0, 0.9, 0.36],
      [0, 1.04, 0.37],
      [0, 1.12, 0.42],
    ]),
    { parent: spine.joints[1], count: 3, role: "neck", group: "neck" },
  );
  b.sweep(neck, [0.075, 0.045], { color: BLUE });

  const head = b.joint("head", {
    parent: neck.joints[2],
    at: neck.at(1).p,
    dir: [0, -0.1, 1],
    role: "head",
    group: "head",
  });
  b.capsule(head.at, head.local([0, 0.08, 0]), [0.055, 0.04], { bone: head, color: BLUE, group: "head" });
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
  b.spike(jaw.at, jaw.dir([0, 1, 0]), 0.06, 0.012, { bone: jaw, color: BEAK, group: "jaw" });
  for (const s of [1, -1])
    b.part(new SphereGeometry(0.012, b.segments(8), b.segments(6)), "#101010", {
      bone: head,
      at: head.local([s * 0.042, 0.05, 0.015]),
      group: "head",
    });

  // Crest: 7 feathers on 2 banks, spread 60° across the top of the head (a fan about the head's forward axis).
  const forward = head.dir([0, 1, 0]);
  b.fan(
    "crest",
    {
      parent: head,
      at: head.local([0, 0.03, 0.04]),
      axis: forward,
      from: head.dir([0, 0.25, 1]).applyAxisAngle(forward, (-30 * Math.PI) / 180),
      angleDeg: 60,
      count: 7,
      banks: 2,
      group: "head",
    },
    (item) => {
      const tip = offset(item.p, item.dir, 0.12);
      b.rod(item.p, tip, 0.004, { bone: item.joint, color: BLUE });
      b.part(new SphereGeometry(0.012, b.segments(8), b.segments(6)), TEAL, { bone: item.joint, at: tip });
    },
  );

  // Train: 24 feathers on 6 banks (4 per bank), fanned 110° behind the rump and tilted slightly down.
  const up = new Vector3(0, 1, 0);
  const train = b.fan(
    "train",
    {
      parent: hips,
      at: [0, 0.62, -0.3],
      axis: up,
      from: new Vector3(0, -0.15, -1).normalize().applyAxisAngle(up, (-55 * Math.PI) / 180),
      angleDeg: 110,
      count: 24,
      banks: 6,
      role: "tail",
      group: "train",
    },
    (item) => {
      const tip = offset(item.p, item.dir, 1.05);
      const bend = offset(offset(item.p, item.dir, 0.5), up, 0.05);
      b.sweep(bezier(item.p, bend, tip), [0.012, 0.005], { bone: item.joint, color: GREEN, caps: { end: "point" } });
      const eye = offset(item.p, item.dir, 0.93);
      b.part(new SphereGeometry(1, b.segments(10), b.segments(6)), GOLD, {
        bone: item.joint,
        at: eye,
        quat: aim(up, item.dir),
        scale: [0.055, 0.01, 0.075],
      });
      b.part(new SphereGeometry(1, b.segments(10), b.segments(6)), EYE, {
        bone: item.joint,
        at: offset(eye, up, 0.004),
        quat: aim(up, item.dir),
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
      b.spike(leg.at(1).p.add(new Vector3(dx, 0, 0)), [0, -0.2, 1], 0.05, 0.012, { bone: leg.joints[3], color: LEG });

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
      { thickness: 0.015, color: WING, split: "a", group: `wing${side}` },
    );
  }

  // Display: raise the train by posing its 6 banks. +deg about a bank's local X lifts it out of the fan plane.
  for (const bank of train.banks) b.pose(bank, { axis: bank.dir([1, 0, 0]), deg: 72 });

  return b.root;
}
