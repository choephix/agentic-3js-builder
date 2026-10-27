import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Aeolian Strandbeast",
  description:
    "A stylized Theo Jansen-inspired wind-walking beach creature assembled from ivory tubes, crankshafts, articulated legs, sails, and colorful kinetic joints.",
};

export default function build() {
  const b = createBuilder({ name: "aeolian-strandbeast", detail: 0.82 });

  const IVORY = "#e7dfc7";
  const IVORY_DARK = "#b7ad95";
  const SHADOW = "#403c38";
  const BLUE = "#176b82";
  const BLUE_DARK = "#0e3f51";
  const ORANGE = "#e66b32";
  const YELLOW = "#f2b84b";
  const SAND = "#d6c79f";
  const GLASS = "#83c8c4";

  const tube = (
    a: THREE.Vector3 | [number, number, number],
    c: THREE.Vector3 | [number, number, number],
    radius: number,
    color: string,
    bone?: any,
  ) => b.rod(a, c, radius, {
    color,
    bone,
    section: { ngon: 6 },
    caps: "flat",
  });

  const collar = (at: any, radius: number, depth: number, color = BLUE) =>
    b.part(
      new THREE.CylinderGeometry(radius, radius, depth, 8),
      color,
      { at, dir: [1, 0, 0], axis: "y" },
    );

  const hub = (at: any, radius = 0.07, color = BLUE) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, { at });

  const bolt = (at: any, radius = 0.018, color = YELLOW) =>
    b.part(new THREE.SphereGeometry(radius, 6, 4), color, { at });

  // ---------------------------------------------------------------------------
  // Skeleton first: a long thorax, a small rear spine, and a forward head joint.
  // ---------------------------------------------------------------------------

  const pelvis = b.joint("pelvis", {
    at: [0, 1.18, -0.88],
    dir: [0, 0, 1],
    role: "spine",
    group: "body",
  });

  const thorax = b.chain(
    "thorax",
    catmull([
      [0, 1.18, -0.88],
      [0, 1.23, -0.42],
      [0, 1.25, 0.12],
      [0, 1.27, 0.66],
      [0, 1.29, 1.02],
    ]),
    {
      parent: pelvis,
      names: ["spineRear", "spine2", "spine3", "spine4", "spineFront"],
      role: "spine",
      group: "body",
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.29, 0.88],
      [0, 1.42, 1.18],
      [0, 1.67, 1.43],
    ]),
    {
      parent: thorax.tip,
      names: ["neckBase", "neckMid", "neckTip"],
      role: "neck",
      group: "body",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.69, 1.47],
    dir: [0, 0.03, 1],
    role: "head",
    group: "head",
  });

  // Main body: a continuous, slightly flattened low-poly tube.
  const body = b.sweep(thorax, (t) => 0.18 + 0.025 * Math.sin(t * Math.PI), {
    bone: thorax,
    color: IVORY,
    section: { ngon: 8 },
    caps: "round",
    name: "thoraxTube",
    group: "body",
  });

  b.sweep(neck, [0.13, 0.09], {
    bone: neck,
    color: IVORY_DARK,
    section: { ngon: 7 },
    caps: "round",
    name: "neckTube",
    group: "body",
  });

  // Six pairs of characteristic Strandbeest legs.
  const legStations = [-0.72, -0.34, 0.06, 0.45, 0.78, 1.0];
  const legs: any[] = [];

  for (let i = 0; i < legStations.length; i++) {
    const z = legStations[i];

    for (const side of [1, -1]) {
      const sideName = side > 0 ? "L" : "R";
      const hip: [number, number, number] = [side * 0.16, 1.25, z];
      const foot: [number, number, number] = [
        side * (0.86 + (i % 2) * 0.07),
        0.085,
        z + (i % 2 === 0 ? -0.11 : 0.14),
      ];

      const points = limb(
        hip,
        foot,
        [0.39, 0.54, 0.49],
        [
          [0, 0, side > 0 ? 1 : 1],
          [0, 0, side > 0 ? -1 : -1],
        ],
        { sole: [0, 1, 0] },
      );

      const leg = b.chain(
        `leg${sideName}${i + 1}`,
        points,
        {
          parent: thorax.nearestJoint(hip)!,
          names: [
            `hip${sideName}${i + 1}`,
            `knee${sideName}${i + 1}`,
            `ankle${sideName}${i + 1}`,
            `foot${sideName}${i + 1}`,
          ],
          role: "leg",
          group: "legs",
          contact: foot,
        },
      );

      b.sweep(
        leg,
        (t) => (t < 0.28 ? 0.065 : t < 0.66 ? 0.047 : 0.035),
        {
          bone: leg,
          color: IVORY,
          section: { ngon: 6 },
          caps: "round",
          name: `legTube${sideName}${i + 1}`,
          group: "legs",
        },
      );

      // Foot paddle, kept chunky and close to the sand.
      tube(
        points[points.length - 2],
        points[points.length - 1],
        0.055,
        SHADOW,
        leg.tip,
      );

      for (const j of leg.joints.slice(0, 3)) {
        hub(j.at, j === leg.joints[0] ? 0.082 : 0.06, BLUE);
        collar(j.at, j === leg.joints[0] ? 0.095 : 0.068, 0.065, BLUE_DARK);
        bolt(j.at.clone().add(new THREE.Vector3(side * 0.075, 0, 0)), 0.018);
      }

      legs.push({ side, z, points, leg });
    }
  }

  // ---------------------------------------------------------------------------
  // Axles and kinetic linkages: transverse cranks tie the legs into one machine.
  // ---------------------------------------------------------------------------

  for (let i = 0; i < legStations.length; i++) {
    const z = legStations[i];
    const axleA = new THREE.Vector3(-0.28, 1.255, z);
    const axleB = new THREE.Vector3(0.28, 1.255, z);

    tube(axleA, axleB, 0.032, BLUE_DARK, thorax.joints[Math.min(i, thorax.joints.length - 1)]);
    hub(axleA, 0.078, ORANGE);
    hub(axleB, 0.078, ORANGE);

    // Offset crank pins alternate fore and aft, producing the walking rhythm.
    const phase = i % 2 === 0 ? 1 : -1;
    const pinL = new THREE.Vector3(-0.34, 1.255 + phase * 0.10, z + phase * 0.075);
    const pinR = new THREE.Vector3(0.34, 1.255 - phase * 0.10, z - phase * 0.075);

    tube(axleA, pinL, 0.022, ORANGE);
    tube(axleB, pinR, 0.022, ORANGE);
    bolt(pinL, 0.027, YELLOW);
    bolt(pinR, 0.027, YELLOW);

    const leftLeg = legs.find((x) => x.side === 1 && x.z === z);
    const rightLeg = legs.find((x) => x.side === -1 && x.z === z);

    if (leftLeg && rightLeg) {
      tube(pinL, leftLeg.points[1], 0.021, IVORY_DARK);
      tube(pinR, rightLeg.points[1], 0.021, IVORY_DARK);

      // A diagonal cross-link exaggerates the recognizable mechanical gait.
      tube(leftLeg.points[1], rightLeg.points[2], 0.016, BLUE);
      tube(rightLeg.points[1], leftLeg.points[2], 0.016, BLUE);
    }
  }

  // Long side rails and repeated orange bearing blocks.
  tube(
    [-0.27, 1.39, -0.98],
    [-0.27, 1.39, 1.04],
    0.035,
    BLUE,
    thorax.joints[0],
  );
  tube(
    [0.27, 1.39, -0.98],
    [0.27, 1.39, 1.04],
    0.035,
    BLUE,
    thorax.joints[0],
  );

  for (const z of legStations) {
    const left = new THREE.Vector3(-0.27, 1.39, z);
    const right = new THREE.Vector3(0.27, 1.39, z);
    collar(left, 0.06, 0.075, ORANGE);
    collar(right, 0.06, 0.075, ORANGE);
    bolt(left.clone().add(new THREE.Vector3(-0.05, 0.035, 0)), 0.014, YELLOW);
    bolt(right.clone().add(new THREE.Vector3(0.05, 0.035, 0)), 0.014, YELLOW);
  }

  // ---------------------------------------------------------------------------
  // Wind apparatus: mast, triangular sail, ribs, and a forward nose scoop.
  // ---------------------------------------------------------------------------

  const mast = b.chain(
    "windMast",
    catmull([
      [0, 1.30, -0.44],
      [0, 1.72, -0.38],
      [0, 2.18, -0.30],
      [0, 2.49, -0.18],
    ]),
    {
      parent: thorax.joints[1],
      names: ["mastBase", "mastMid", "mastTop"],
      role: "fan",
      group: "sail",
    },
  );

  b.sweep(mast, [0.055, 0.027], {
    bone: mast,
    color: BLUE_DARK,
    section: { ngon: 6 },
    caps: "flat",
    name: "mastTube",
    group: "sail",
  });

  const sail = b.extrude(
    [
      [-0.06, 0],
      [0.52, 0.18],
      [0.42, 0.66],
      [0.08, 1.10],
      [-0.31, 0.74],
      [-0.42, 0.22],
    ],
    {
      at: [0, 1.42, -0.35],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.028,
      bevel: 0.008,
      smoothing: 1,
      color: GLASS,
      bone: mast.joints[0],
      name: "windSail",
      group: "sail",
    },
  );

  // Bright diagonal sail braces.
  tube([0, 1.45, -0.35], [0.43, 2.02, -0.35], 0.022, ORANGE, mast.joints[0]);
  tube([0, 1.45, -0.35], [-0.34, 1.86, -0.35], 0.022, ORANGE, mast.joints[0]);
  tube([0, 2.05, -0.35], [0, 2.45, -0.22], 0.022, ORANGE, mast.joints[1]);

  // A second small rear vane gives the silhouette a lively, asymmetric wind profile.
  const rearVane = b.extrude(
    [
      [0, 0],
      [0.26, 0.06],
      [0.19, 0.48],
      [-0.04, 0.72],
      [-0.16, 0.28],
    ],
    {
      at: [0.02, 1.34, -0.90],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.022,
      bevel: 0.006,
      color: ORANGE,
      bone: thorax.joints[0],
      name: "rearVane",
      group: "sail",
    },
  );

  // Front fork and open intake: a tube-built abstract head rather than an animal face.
  tube([0, 1.66, 1.43], [-0.26, 1.82, 1.82], 0.038, IVORY_DARK, head);
  tube([0, 1.66, 1.43], [0.26, 1.82, 1.82], 0.038, IVORY_DARK, head);
  tube([-0.26, 1.82, 1.82], [0.26, 1.82, 1.82], 0.038, BLUE, head);
  hub([-0.26, 1.82, 1.82], 0.062, ORANGE);
  hub([0.26, 1.82, 1.82], 0.062, ORANGE);

  // Small perforated wind-drum plates, a signature bit of visual detail.
  const emblem = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="57" fill="#f2b84b" stroke="#176b82" stroke-width="8"/>
      <circle cx="64" cy="64" r="10" fill="#403c38"/>
      <path d="M64 18 L71 55 L104 43 L77 65 L101 91 L70 73 L57 108 L57 72 L25 85 L51 63 L26 37 L57 54 Z"
        fill="#e66b32" stroke="#403c38" stroke-width="3" stroke-linejoin="round"/>
    </svg>`,
    { size: 128 },
  );

  for (const side of [-1, 1]) {
    const plateAt = new THREE.Vector3(side * 0.285, 1.39, 0.53);
    b.part(
      new THREE.CylinderGeometry(0.17, 0.17, 0.028, 12),
      YELLOW,
      {
        at: plateAt,
        dir: [side, 0, 0],
        axis: "y",
        bone: thorax.joints[3],
        name: `windDrum${side > 0 ? "L" : "R"}`,
        group: "ornament",
      },
    );
    b.part(
      new THREE.CircleGeometry(0.145, 16),
      "#ffffff",
      {
        at: plateAt.clone().add(new THREE.Vector3(side * 0.018, 0, 0)),
        dir: [side, 0, 0],
        axis: "z",
        texture: emblem,
        bone: thorax.joints[3],
        name: `windDrumFace${side > 0 ? "L" : "R"}`,
        group: "ornament",
      },
    );
  }

  // A few bright fasteners finish the puppet-like construction language.
  for (const p of [
    [-0.18, 1.47, -0.83],
    [0.18, 1.47, -0.83],
    [-0.18, 1.47, 0.88],
    [0.18, 1.47, 0.88],
    [0, 1.48, 0.20],
    [0, 1.48, 0.62],
  ] as [number, number, number][]) {
    bolt(p, 0.025, YELLOW);
  }

  return b.root;
}
