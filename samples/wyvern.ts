// Wyvern. Neck and tail chains swept as one continuous tube, curved horns and neck spikes from
// bezier sweeps, bat wings as membranes between finger chains, closed triangular brow rings, and bird-like
// four-segment legs from `limb` with the toe segment flat on the floor. The eyes are parts that face their gaze:
// lashes ring each gaze (inheriting the head bone), struts run from each eye to a crest joint, and the crest is
// posed about a made-up hinge line through both eyes.
import { SphereGeometry } from "three";
import { createBuilder } from "../src/builder";
import { line } from "../src/frame";
import { limb } from "../src/ik";
import { mid, offset } from "../src/math";
import { bezier, catmull, polyline } from "../src/path";

export const meta = {
  name: "Wyvern",
  description: "Bat-winged wyvern with bird legs, lashed eyes and a crest hinged on the line through its eyes.",
};

const SCALE = "#5f7f3a";
const BELLY = "#c9b27a";
const WING = "#7a3b3b";
const BONE = "#e8e0c8";
const DARK = "#2a2a2a";

export default function build() {
  const b = createBuilder({ name: "wyvern" });

  const hips = b.joint("hips", { at: [0, 1.0, -0.1] });
  const spine = b.chain(
    "spine",
    [
      [0, 1.0, -0.1],
      [0, 1.08, 0.25],
      [0, 1.15, 0.55],
    ],
    { parent: hips, role: "spine", group: "body" },
  );
  b.sweep(spine, [0.26, 0.3, 0.22], { color: SCALE, group: "body" });

  // Neck: a catmull chain, swept as one tube; spikes follow the tube surface.
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.15, 0.55],
      [0, 1.4, 0.8],
      [0, 1.7, 0.85],
      [0, 1.85, 1.0],
    ]),
    {
      parent: spine.joints[1],
      count: 4,
      role: "neck",
      group: "neck",
    },
  );
  const neckTube = b.sweep(neck, [0.18, 0.1], { color: SCALE, caps: { start: "round", end: "round" } });
  // Each spike stands on a tube point (a frame facing out) and inherits that point's neck joint.
  b.along(neckTube, 5, (at) => b.spike(at, at, 0.12, 0.035, { color: BONE }), { from: 0.1, to: 0.9 });

  // Head and jaw. The head joint sits on the neck's end point and takes that point's joint as parent.
  const head = b.joint("head", { at: neck.at(1), dir: [0, -0.15, 1], role: "head", group: "head" });
  b.capsule(head, head.local([0, 0.32, 0]), [0.13, 0.08], { color: SCALE, group: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.02, -0.06]),
    aim: head.local([0, 0.3, -0.1]),
    role: "jaw",
    group: "jaw",
  });
  b.capsule(jaw.at, jaw.local([0, 0.28, 0]), [0.08, 0.05], { bone: jaw, color: BELLY, group: "jaw" });
  const eyes = [1, -1].map((s) => {
    // The eye faces its gaze (out, forward and a little up), so the part itself is a Line along the gaze.
    const eye = b.part(new SphereGeometry(0.035, 10, 8), DARK, {
      bone: head,
      at: head.local([s * 0.09, 0.07, 0.12]),
      dir: head.dir([s * 0.8, 0.5, 0.3]),
      group: "head",
    });
    // Lashes: seven spikes on the upper half of a ring around the gaze, leaning forward; bone inherited (head).
    b.ring(eye, { count: 7, radius: 0.03, fromDeg: -75, toDeg: 75, tilt: 35 }, (lash) =>
      b.spike(lash, lash, 0.045, 0.006, { color: BONE }),
    );
    return eye;
  });
  for (const s of [1, -1]) {
    // Brow ring: a closed polyline; its corners are rounded, and the seam corner gets round-capped ends.
    const brow = [
      [0.07, 0.14],
      [0.02, 0.07],
      [0.1, 0.07],
    ].map(([y, z]) => head.local([s * 0.11, y, z]));
    b.sweep(polyline(brow, { closed: true }), 0.012, { bone: head, color: BONE, group: "head" });
    // Curved horn: bezier sweep tapering to a point.
    const base = head.local([s * 0.07, 0.02, 0.1]);
    b.sweep(bezier(base, offset(base, [s * 0.1, 0.15, -0.1], 0.18), head.local([s * 0.2, -0.35, 0.12])), [0.045, 0], {
      bone: head,
      color: BONE,
      caps: { start: "flat", end: "point" },
      group: "head",
    });
  }

  // Crest: a hinge joint above the back of the head holding a fin swept back (its +Z points back-down here). Pose it back about the line through both eyes
  // (a hinge that is not a bone), then run a strut from each eye to where the crest joint ended up.
  const crest = b.joint("crest", {
    parent: head,
    at: head.local([0, -0.02, 0.2]),
    dir: head.dir([0, -0.3, 1]),
    role: "hinge",
  });
  b.slab([crest.local([0, 0, 0]), crest.local([0, 0.2, 0.12]), crest.local([0, 0.02, 0.1])], {
    thickness: 0.015,
    color: WING,
    bone: crest,
    group: "head",
  });
  b.pose(crest, { about: line(eyes[1], eyes[0]), deg: -25 });
  for (const eye of eyes) b.rod(eye, crest, [0.014, 0.008], { color: BONE, group: "head" });

  // Tail: chain + one continuous tapering sweep, smooth-skinned over its six joints.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.0, -0.1],
      [0, 0.95, -0.55],
      [0, 0.95, -1.0],
      [0, 1.1, -1.45],
      [0, 1.3, -1.7],
    ]),
    {
      parent: hips,
      count: 6,
      role: "tail",
      group: "tail",
    },
  );
  b.sweep(tail, (t) => 0.2 * (1 - t) + 0.025, {
    color: SCALE,
    bands: [
      [0.8, SCALE],
      [1, BONE],
    ],
    group: "tail",
  });

  // Wings: arm chain, three finger chains from the wrist, membranes between consecutive fingers and the flank.
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const shoulder: [number, number, number] = [s * 0.2, 1.25, 0.4];
    const elbow: [number, number, number] = [s * 0.65, 1.55, 0.3];
    const wrist: [number, number, number] = [s * 1.1, 1.75, 0.2];
    const arm = b.chain(`arm${side}`, [shoulder, elbow, wrist], {
      parent: spine.joints[1],
      role: "wing",
      group: `wing${side}`,
    });
    b.sweep(arm, [0.06, 0.04], { color: SCALE });
    const fingerTips: Array<[number, number, number]> = [
      [s * 2.0, 1.9, -0.05],
      [s * 1.85, 1.6, -0.6],
      [s * 1.35, 1.25, -0.85],
    ];
    const fingers = fingerTips.map((tip, i) =>
      b.chain(`finger${i + 1}${side}`, polyline([wrist, offset(mid(wrist, tip), [0, 1, 0], 0.08), tip]), {
        parent: arm.joints[1],
        role: "digit",
        group: `wing${side}`,
      }),
    );
    for (const finger of fingers) b.sweep(finger, [0.03, 0.012], { color: BONE });
    for (let i = 0; i < fingers.length - 1; i++)
      b.membrane(fingers[i], fingers[i + 1], { thickness: 0.02, color: WING, scallop: 0.18, group: `wing${side}` });
    b.membrane(fingers[2], [wrist, [s * 0.28, 1.2, 0.25], [s * 0.25, 1.1, -0.25]], {
      thickness: 0.02,
      color: WING,
      scallop: 0.12,
      bone: spine.joints[0],
      group: `wing${side}`,
    });

    // Bird legs: thigh, shin, tarsus and a toe lying flat on the floor (`sole`), knee forward, ankle back.
    const toeR = 0.05;
    const leg = b.chain(
      `leg${side}`,
      limb(
        [s * 0.2, 0.95, -0.05],
        [s * 0.28, toeR, 0.32],
        [0.34, 0.36, 0.3, 0.16],
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
        group: `leg${side}`,
      },
    );
    const ankle = leg.ts[3];
    b.sweep(leg, (t) => Math.max(toeR, 0.11 - (0.06 * t) / ankle), { color: SCALE });
    const toeTip = leg.at(1);
    for (const dx of [-0.05, 0, 0.05]) b.spike(toeTip.moved([dx, 0, 0]), [0, -0.3, 1], 0.08, 0.025, { color: BONE });
  }

  return b.root;
}
