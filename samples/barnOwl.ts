// Barn owl. A compact, blocky bird with an extended wing skeleton, heart-shaped facial disk,
// paired jaws, articulated feet, a continuous torso-to-neck tube, and a small fan tail.
import { SphereGeometry, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { offset } from "../src/math";
import { bezier, catmull } from "../src/path";

export const meta = {
  name: "Barn Owl",
  description: "A warm, heart-faced barn owl with spread wings, layered feathers, and articulated talons.",
  builtBy: "GPT-6 Astra",
};

const PLUMAGE = "#b79a78";
const PLUMAGE_DARK = "#765c4c";
const WING = "#80664f";
const WING_DARK = "#59463d";
const FACE = "#ead9bd";
const FACE_SHADOW = "#b99b7d";
const EYE = "#d5963f";
const PUPIL = "#171413";
const BEAK = "#d1a05d";
const FOOT = "#6e5142";
const SPOT = "#5f4a40";
const WHITE = "#f2e8d5";

export default function build() {
  const b = createBuilder({ name: "barnOwl", detail: 0.85 });

  // Skeleton first: a short torso that flows continuously into the rising neck and forward-facing head.
  const hips = b.joint("hips", { at: [0, 0.36, -0.06], role: "spine", group: "body" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.36, -0.16],
      [0, 0.4, 0.0],
      [0, 0.47, 0.16],
      [0, 0.52, 0.28],
    ],
    { parent: hips, role: "spine", group: "body" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.5, 0.25],
      [0, 0.61, 0.34],
      [0, 0.7, 0.4],
      [0, 0.76, 0.44],
    ]),
    { parent: spine.joints[2], count: 3, role: "neck", group: "neck" },
  );
  const torsoNeckStations = [
    { at: [0, 0.36, -0.25] as const, w: 0.2, h: 0.2 },
    { at: [0, 0.39, -0.08] as const, w: 0.34, h: 0.38 },
    { at: [0, 0.46, 0.12] as const, w: 0.31, h: 0.35 },
    { at: [0, 0.5, 0.25] as const, w: 0.26, h: 0.26 },
    { at: [0, 0.61, 0.34] as const, w: 0.24, h: 0.2 },
    { at: [0, 0.7, 0.4] as const, w: 0.22, h: 0.2 },
    { at: [0, 0.76, 0.44] as const, w: 0.2, h: 0.2 },
  ];
  const torsoNeckPath = catmull(torsoNeckStations.map(({ at }) => at));
  const neckStart = torsoNeckPath.knots[3];
  const torsoNeckBone = [spine, hips, neck] as const;
  b.loft(torsoNeckStations, {
    bone: torsoNeckBone,
    color: PLUMAGE,
    sectors: [[125, 235, PLUMAGE_DARK]],
    to: neckStart,
    caps: { end: "none" },
    group: "body",
  });
  b.loft(torsoNeckStations, {
    bone: torsoNeckBone,
    color: PLUMAGE,
    from: neckStart,
    caps: { start: "none" },
    group: "neck",
  });

  const head = b.joint("head", { at: neck.at(1), dir: [0, -0.08, 1], role: "head", group: "head" });
  b.part(new SphereGeometry(1, b.segments(12), b.segments(8)), PLUMAGE, {
    bone: head,
    at: head.local([0, 0.06, 0.02]),
    scale: [0.18, 0.17, 0.2],
    group: "head",
  });

  for (const [forward, width, color] of [
    [0.225, 0.17, FACE_SHADOW],
    [0.24, 0.145, FACE],
  ] as const) {
    b.slab(
      [
        head.local([0, forward, 0.2]),
        head.local([width * 0.62, forward, 0.16]),
        head.local([width, forward, 0.04]),
        head.local([width * 0.86, forward, -0.11]),
        head.local([width * 0.42, forward, -0.22]),
        head.local([0, forward, -0.28]),
        head.local([-width * 0.42, forward, -0.22]),
        head.local([-width * 0.86, forward, -0.11]),
        head.local([-width, forward, 0.04]),
        head.local([-width * 0.62, forward, 0.16]),
      ],
      { thickness: 0.018, color, bone: head, group: "face" },
    );
  }

  // Eyes sit on the disk, with warm irises and inset black pupils.
  for (const s of [1, -1]) {
    const eye = b.part(new SphereGeometry(1, b.segments(10), b.segments(6)), EYE, {
      bone: head,
      at: head.local([s * 0.073, 0.253, 0.075]),
      scale: [0.043, 0.043, 0.02],
      group: "face",
    });
    b.part(new SphereGeometry(1, b.segments(7), b.segments(5)), PUPIL, {
      bone: head,
      at: head.local([s * 0.073, 0.276, 0.075]),
      scale: [0.019, 0.019, 0.009],
      group: "face",
    });
    b.ring(eye, { count: 7, radius: 0.047, fromDeg: -70, toDeg: 70, tilt: 24 }, (lash) =>
      b.spike(lash, lash, 0.018, 0.004, { color: FACE_SHADOW, group: "face" }),
    );
  }

  // Short brow arcs and a central pale blaze break up the otherwise simple head volume.
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        head.local([s * 0.13, 0.251, 0.145]),
        head.local([s * 0.075, 0.261, 0.16]),
        head.local([s * 0.018, 0.258, 0.125]),
      ]),
      [0.012, 0.007],
      { bone: head, color: PLUMAGE_DARK, group: "face" },
    );
  }
  b.sweep(
    catmull([head.local([0, 0.255, 0.17]), head.local([0, 0.264, 0.06]), head.local([0, 0.26, -0.11])]),
    [0.009, 0.004],
    { bone: head, color: WHITE, group: "face" },
  );

  // Upper and lower beaks are on separate bones so the jaw can open cleanly.
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.245, -0.095]),
    dir: head.dir([0, 0.35, -0.18]),
    role: "jaw",
    group: "jaw",
  });
  b.spike(head.local([0, 0.265, -0.03]), head.dir([0, 0.8, -0.18]), 0.085, 0.027, {
    bone: head,
    color: BEAK,
    group: "jaw",
  });
  b.spike(jaw, jaw, 0.065, 0.022, { color: BEAK, group: "jaw" });
  b.pose(jaw, { axis: jaw.dir([1, 0, 0]), deg: -8 });

  // A few crown feathers add a readable silhouette without turning the owl into an eagle.
  const crown = b.ring(
    frame(head.local([0, 0.03, 0.18]), head),
    {
      count: 5,
      radius: 0.015,
      fromDeg: -50,
      toDeg: 50,
      tilt: 16,
      joints: 1,
      name: "crown",
      parent: head,
      role: "fan",
      group: "head",
    },
    (feather) =>
      b.sweep(bezier(feather, feather.moved([0, 0.055, 0.035]), feather.moved([0, 0.11, 0.01])), [0.012, 0.002], {
        color: PLUMAGE_DARK,
        caps: { end: "point" },
        group: "head",
      }),
  );
  if (crown.joints[0]) b.pose(crown.joints[0], { axis: crown.joints[0].dir([1, 0, 0]), deg: -8 });

  // Wings are fully extended in the neutral rest pose. Each has an arm chain and three digit chains.
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const wingName = `wing${side}`;
    const shoulder: [number, number, number] = [s * 0.13, 0.57, 0.16];
    const elbow: [number, number, number] = [s * 0.31, 0.62, 0.1];
    const wrist: [number, number, number] = [s * 0.47, 0.59, -0.01];
    const arm = b.chain(wingName, [shoulder, elbow, wrist], {
      parent: spine.joints[2],
      role: "wing",
      group: wingName,
    });
    b.sweep(arm, [0.055, 0.035], { color: WING_DARK, group: wingName });

    const tips: Array<[number, number, number]> = [
      [s * 0.7, 0.57, -0.1],
      [s * 0.77, 0.49, -0.28],
      [s * 0.68, 0.38, -0.44],
    ];
    const fingers = tips.map((tip, i) => {
      const finger = b.chain(
        `primary${i + 1}${side}`,
        catmull([wrist, [s * 0.58, 0.55 - i * 0.07, -0.09 - i * 0.1], tip]),
        {
          parent: arm.joints[1],
          role: "digit",
          group: wingName,
        },
      );
      b.sweep(finger, [0.022, 0.006], { color: WING_DARK, caps: { end: "point" }, group: wingName });
      return finger;
    });
    for (let i = 0; i < fingers.length - 1; i++)
      b.membrane(fingers[i], fingers[i + 1], { thickness: 0.014, color: WING, scallop: 0.12, group: wingName });
    b.membrane(fingers[2], [wrist, [s * 0.28, 0.48, 0.09], [s * 0.2, 0.45, -0.18]], {
      thickness: 0.016,
      color: WING,
      scallop: 0.08,
      bone: spine.joints[2],
      group: wingName,
    });

    // Layered covert bars are simple curved feathers stuck to the top of each wing.
    for (let i = 0; i < 4; i++) {
      const root: [number, number, number] = [s * (0.21 + i * 0.07), 0.67 - i * 0.02, 0.08 - i * 0.06];
      const tip: [number, number, number] = [s * (0.38 + i * 0.07), 0.66 - i * 0.035, -0.02 - i * 0.08];
      b.sweep(bezier(root, [s * (0.3 + i * 0.07), 0.72 - i * 0.02, 0.02 - i * 0.05], tip), [0.018, 0.004], {
        color: i % 2 ? PLUMAGE_DARK : WHITE,
        caps: { end: "point" },
        group: wingName,
      });
    }
  }

  // Tail fan: seven rigid feathers grouped onto two fan joints to keep the rig compact.
  const tail = b.ring(
    frame([0, 0.4, -0.25], new Vector3(0, 1, 0)),
    {
      count: 7,
      radius: 0.045,
      fromDeg: 205,
      toDeg: 335,
      tilt: -10,
      joints: 2,
      name: "tailFan",
      parent: hips,
      role: "tail",
      group: "tail",
    },
    (feather) => {
      const tip = offset(feather, feather, 0.3);
      const bend = offset(offset(feather, feather, 0.14), [0, -1, 0], 0.035);
      b.sweep(bezier(feather, bend, tip), [0.018, 0.004], {
        color: feather.i % 2 ? FACE : PLUMAGE_DARK,
        caps: { end: "point" },
        group: "tail",
      });
    },
  );
  for (const joint of tail.joints) b.pose(joint, { axis: joint.dir([1, 0, 0]), deg: 12 });

  // Short legs and four toes per foot. Sole pins the last segment to the floor.
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const target: [number, number, number] = [s * 0.105, 0.035, 0.11];
    const leg = b.chain(
      `leg${side}`,
      limb(
        [s * 0.1, 0.38, -0.04],
        target,
        [0.13, 0.13, 0.11, 0.075],
        [
          [0, 0, 1],
          [0, 0, -1],
          [0, 0, 1],
        ],
        {
          sole: [0, 0, 1],
        },
      ),
      {
        parent: hips,
        names: ["thigh", "shin", "ankle", "toe"].map((name) => name + side),
        role: "leg",
        contact: [s * 0.105, 0, 0.11],
        group: `leg${side}`,
      },
    );
    b.sweep(leg, [0.04, 0.016], { color: FOOT, group: `leg${side}` });
    const foot = leg.at(1);
    for (const [dx, dz] of [
      [-0.032, 0.02],
      [0, 0.03],
      [0.032, 0.02],
      [0, -0.03],
    ])
      b.spike(foot.moved([dx, 0, 0]), [s * dx * 1.8, -0.12, dz > 0 ? 1 : -1], 0.075, 0.014, {
        color: FOOT,
        group: `leg${side}`,
      });
  }

  // Deliberate breast mottling: fixed, sparse spots preserve the blocky primitive style.
  const spotPositions: Array<[number, number, number]> = [
    [-0.09, 0.5, 0.3],
    [0.08, 0.52, 0.3],
    [-0.04, 0.43, 0.35],
    [0.04, 0.4, 0.33],
    [-0.12, 0.43, 0.22],
    [0.11, 0.46, 0.2],
    [-0.06, 0.56, 0.24],
    [0.06, 0.57, 0.23],
  ];
  for (const [x, y, z] of spotPositions)
    b.part(new SphereGeometry(1, b.segments(7), b.segments(5)), SPOT, {
      at: [x, y, z],
      scale: [0.012, 0.018, 0.006],
      group: "body",
    });

  return b.root;
}
