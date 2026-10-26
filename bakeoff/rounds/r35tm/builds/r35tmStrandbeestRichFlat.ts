import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  rng,
} from "../../../../src/index";

export const meta = {
  name: "Wind-Walking Beach Creature",
  description:
    "A stylized Theo Jansen-inspired beach walker assembled from faceted ivory tubes, articulated blue joints, orange crank rods, and wind-catching sail fins.",
};

export default function build() {
  const b = createBuilder({ name: "wind-walking-beach-creature", detail: 1 });

  const IVORY = "#e8dfc8";
  const IVORY_LIGHT = "#fff5dc";
  const IVORY_DARK = "#b9ad91";
  const JOINT = "#185b69";
  const JOINT_LIGHT = "#2e92a0";
  const ROD = "#d87539";
  const ROD_DARK = "#914326";
  const RUBBER = "#282e32";
  const SAND = "#d7bd83";
  const SAIL = "#73c6c7";
  const SAIL_DARK = "#287f8c";
  const WARNING = "#e8a23a";
  const INK = "#172b31";

  const tube = (path: any, radius: number | number[], color = IVORY, options: any = {}) =>
    b.sweep(path, radius, {
      color,
      sides: options.sides ?? 8,
      smooth: false,
      caps: options.caps ?? "round",
      ...options,
    });

  const sphere = (
    at: any,
    radius: number,
    color: string,
    bone?: any,
    name?: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      bone,
      flat: true,
      name,
    });

  const cylinder = (
    at: any,
    radius: number,
    length: number,
    color: string,
    dir: any,
    bone?: any,
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, length, 8), color, {
      at,
      dir,
      bone,
      flat: true,
      name,
    });

  // ------------------------------------------------------------------------------------------------
  // Skeleton first: one long central thorax, four paired articulated walking legs, and two sail masts.

  const hips = b.joint("hips", {
    at: [0, 0.84, -0.72],
    dir: [0, 0, 1],
    role: "spine",
    group: "thorax",
  });

  const thoraxPath = catmull([
    [0, 0.84, -0.72],
    [0, 0.88, -0.28],
    [0, 0.9, 0.18],
    [0, 0.86, 0.62],
    [0, 0.82, 0.94],
  ]);

  const thorax = b.chain("thorax", thoraxPath, {
    parent: hips,
    names: ["thoraxRear", "thoraxMidA", "thoraxMidB", "thoraxFront", "thoraxTip"],
    role: "spine",
    group: "thorax",
  });

  const legChains: any[] = [];
  const legSpecs = [
    { side: 1, z: -0.58, phase: 1 },
    { side: -1, z: -0.58, phase: -1 },
    { side: 1, z: -0.13, phase: -1 },
    { side: -1, z: -0.13, phase: 1 },
    { side: 1, z: 0.32, phase: 1 },
    { side: -1, z: 0.32, phase: -1 },
    { side: 1, z: 0.72, phase: -1 },
    { side: -1, z: 0.72, phase: 1 },
  ];

  for (let i = 0; i < legSpecs.length; i++) {
    const spec = legSpecs[i];
    const s = spec.side;
    const rearward = spec.phase;

    const root = [s * 0.105, 0.84, spec.z] as [number, number, number];
    const knee = [s * 0.29, 0.56, spec.z + rearward * 0.13] as [
      number,
      number,
      number,
    ];
    const ankle = [s * 0.55, 0.22, spec.z - rearward * 0.1] as [
      number,
      number,
      number,
    ];
    const foot = [s * 0.72, 0.065, spec.z + rearward * 0.16] as [
      number,
      number,
      number,
    ];

    const points = [root, knee, ankle, foot];
    const sideName = s > 0 ? "L" : "R";
    const chain = b.chain(`leg${sideName}${i + 1}`, points, {
      parent: thorax.nearestJoint ? thorax.nearestJoint(root) : thorax.joints[Math.min(i, thorax.joints.length - 1)],
      names: [
        `hip${sideName}${i + 1}`,
        `knee${sideName}${i + 1}`,
        `ankle${sideName}${i + 1}`,
        `foot${sideName}${i + 1}`,
      ],
      role: "leg",
      group: "walking-legs",
      contact: foot,
    });

    legChains.push({
      chain,
      side: s,
      sideName,
      index: i,
      root,
      knee,
      ankle,
      foot,
      phase: rearward,
      z: spec.z,
    });
  }

  const mastRear = b.chain(
    "mastRear",
    [
      [0, 0.91, -0.26],
      [0, 1.24, -0.2],
      [0, 1.54, -0.13],
    ],
    {
      parent: thorax.joints[1],
      names: ["mastRear", "mastRearHinge", "mastRearTip"],
      role: "fan",
      group: "wind-sails",
    },
  );

  const mastFront = b.chain(
    "mastFront",
    [
      [0, 0.9, 0.4],
      [0, 1.2, 0.42],
      [0, 1.46, 0.5],
    ],
    {
      parent: thorax.joints[3],
      names: ["mastFront", "mastFrontHinge", "mastFrontTip"],
      role: "fan",
      group: "wind-sails",
    },
  );

  // ------------------------------------------------------------------------------------------------
  // Main tubular body.

  const body = tube(thorax, [0.145, 0.16], IVORY_LIGHT, {
    name: "faceted-thorax",
    group: "body",
    section: "circle",
    sides: 8,
    sectors: [
      [-55, 55, IVORY_LIGHT],
      [125, 235, IVORY_DARK],
    ],
  });

  // Slightly raised dorsal spine and lower belly rail.
  tube(
    catmull([
      [0, 0.94, -0.62],
      [0, 1.03, -0.15],
      [0, 1.05, 0.38],
      [0, 0.98, 0.86],
    ]),
    [0.035, 0.025],
    IVORY_DARK,
    { bone: thorax.joints[1], name: "dorsal-rail", group: "body-detail" },
  );

  tube(
    catmull([
      [0, 0.72, -0.58],
      [0, 0.69, -0.12],
      [0, 0.7, 0.36],
      [0, 0.71, 0.8],
    ]),
    [0.035, 0.026],
    JOINT,
    { bone: thorax.joints[1], name: "belly-rail", group: "body-detail" },
  );

  // Cross-axles, visible through the side frames.
  for (let i = 0; i < 5; i++) {
    const z = -0.58 + i * 0.36;
    cylinder(
      [0, 0.82 + (i % 2) * 0.018, z],
      0.046,
      0.62,
      JOINT,
      [1, 0, 0],
      thorax.joints[Math.min(i, thorax.joints.length - 1)],
      `cross-axle-${i}`,
    );
    cylinder(
      [0, 0.82 + (i % 2) * 0.018, z],
      0.067,
      0.018,
      JOINT_LIGHT,
      [1, 0, 0],
      thorax.joints[Math.min(i, thorax.joints.length - 1)],
      `axle-collar-${i}`,
    );
  }

  // ------------------------------------------------------------------------------------------------
  // Eight mechanical legs. Each leg is a continuous skin tube plus contrasting crank stays.

  for (const leg of legChains) {
    const { chain, side, sideName, index, knee, ankle, foot, root, phase } = leg;
    const parentBone = chain.joints[0];

    tube(chain, [0.058, 0.048], IVORY, {
      name: `leg-tube-${sideName}-${index}`,
      group: "walking-legs",
      sides: 7,
      section: "circle",
    });

    // Dark sleeve at the knee and ankle gives the silhouette a constructed, riveted quality.
    sphere(knee, 0.078, JOINT, chain.joints[1], `knee-hub-${sideName}-${index}`);
    sphere(ankle, 0.065, JOINT_LIGHT, chain.joints[2], `ankle-hub-${sideName}-${index}`);

    cylinder(
      knee,
      0.027,
      0.16,
      ROD_DARK,
      [1, 0, 0],
      chain.joints[1],
      `knee-pin-${sideName}-${index}`,
    );
    cylinder(
      ankle,
      0.024,
      0.14,
      ROD_DARK,
      [1, 0, 0],
      chain.joints[2],
      `ankle-pin-${sideName}-${index}`,
    );

    // Long orange diagonal tension rod, offset from the ivory leg so it reads clearly.
    tube(
      catmull([
        [side * 0.16, 0.82, root[2]],
        [side * 0.32, 0.56, knee[2] - phase * 0.025],
        [side * 0.57, 0.22, ankle[2] + phase * 0.025],
      ]),
      [0.018, 0.014],
      ROD,
      {
        bone: parentBone,
        name: `orange-tension-${sideName}-${index}`,
        group: "crank-rods",
        caps: "flat",
        sides: 6,
      },
    );

    // A second, opposing stay makes each leg look like a real kinetic linkage.
    tube(
      catmull([
        [side * 0.125, 0.81, root[2] + phase * 0.025],
        [side * 0.26, 0.58, knee[2] + phase * 0.08],
        [side * 0.52, 0.25, ankle[2] - phase * 0.04],
      ]),
      [0.014, 0.012],
      ROD_DARK,
      {
        bone: parentBone,
        name: `dark-return-stay-${sideName}-${index}`,
        group: "crank-rods",
        caps: "flat",
        sides: 6,
      },
    );

    // Foot pads sink only a couple of millimetres into the sand plane.
    b.part(
      new THREE.BoxGeometry(0.16, 0.045, 0.24),
      RUBBER,
      {
        at: foot,
        bone: chain.tip ?? chain.joints[chain.joints.length - 1],
        scale: [1, 1, 1],
        name: `rubber-foot-${sideName}-${index}`,
        group: "contacts",
      },
    );

    b.part(
      new THREE.BoxGeometry(0.11, 0.014, 0.16),
      SAND,
      {
        at: [foot[0], 0.087, foot[2]],
        bone: chain.tip ?? chain.joints[chain.joints.length - 1],
        name: `sand-colored-sole-${sideName}-${index}`,
        group: "contacts",
      },
    );

    // Small ivory collars along each leg break up the long tubes.
    const legFrames = b.along(chain, 3, (at: any) => {
      b.part(new THREE.CylinderGeometry(0.067, 0.067, 0.022, 7), IVORY_LIGHT, {
        frame: at,
        bone: at.bone,
        name: `leg-collar-${sideName}-${index}`,
        group: "walking-legs",
      });
    });
    void legFrames;
  }

  // ------------------------------------------------------------------------------------------------
  // Exposed crank discs and little axle caps on both sides.

  for (const side of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const z = -0.58 + i * 0.44;
      const x = side * 0.18;

      cylinder(
        [x, 0.84, z],
        0.105,
        0.026,
        ROD,
        [1, 0, 0],
        thorax.joints[Math.min(i + 1, thorax.joints.length - 1)],
        `side-crank-disc-${side}-${i}`,
      );

      sphere(
        [side * 0.205, 0.84, z],
        0.029,
        WARNING,
        thorax.joints[Math.min(i + 1, thorax.joints.length - 1)],
        `crank-rivet-${side}-${i}`,
      );

      tube(
        [
          [side * 0.21, 0.84, z],
          [side * 0.34, 0.66, z + (i % 2 ? 0.11 : -0.11)],
        ],
        [0.015, 0.012],
        ROD_DARK,
        {
          bone: thorax.joints[Math.min(i + 1, thorax.joints.length - 1)],
          name: `crank-arm-${side}-${i}`,
          group: "crank-rods",
          caps: "flat",
          sides: 6,
        },
      );
    }
  }

  // Front bumper / probe: the creature has no face, but this asymmetrical nose establishes direction.
  tube(
    catmull([
      [0, 0.84, 0.82],
      [0, 0.84, 1.0],
      [0, 0.79, 1.14],
    ]),
    [0.075, 0.025],
    IVORY_LIGHT,
    {
      bone: thorax.tip,
      name: "front-probe",
      group: "body-detail",
      caps: { start: "round", end: "point" },
    },
  );
  sphere([0, 0.78, 1.14], 0.052, WARNING, thorax.tip, "front-warning-beacon");

  // ------------------------------------------------------------------------------------------------
  // Wind-catching sails: broad flat primitives edged with tubes, held above the walking machine.

  const rearSail = b.extrude(
    [
      [-0.35, 0.02],
      [0.3, 0.02],
      [0.25, 0.3],
      [0.08, 0.57],
      [-0.14, 0.68],
      [-0.27, 0.35],
    ],
    {
      at: [0, 0.99, -0.25],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      color: SAIL,
      bone: mastRear.joints[0],
      name: "rear-wind-sail",
      group: "wind-sails",
    },
  );

  const frontSail = b.extrude(
    [
      [-0.3, 0.01],
      [0.34, 0.01],
      [0.24, 0.28],
      [0.12, 0.52],
      [-0.08, 0.62],
      [-0.25, 0.29],
    ],
    {
      at: [0, 0.98, 0.39],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      color: SAIL_DARK,
      bone: mastFront.joints[0],
      name: "front-wind-sail",
      group: "wind-sails",
    },
  );

  // Sail ribs use the same tube language as the legs.
  tube(
    [
      [0, 1.0, -0.25],
      [0, 1.3, -0.22],
      [0, 1.66, -0.13],
    ],
    [0.027, 0.022],
    IVORY_LIGHT,
    { bone: mastRear.joints[0], name: "rear-sail-mast", group: "wind-sails" },
  );

  tube(
    [
      [0, 1.0, 0.39],
      [0, 1.24, 0.43],
      [0, 1.56, 0.5],
    ],
    [0.027, 0.022],
    IVORY_LIGHT,
    { bone: mastFront.joints[0], name: "front-sail-mast", group: "wind-sails" },
  );

  // Contrasting diagonal sail spars.
  tube(
    [
      [-0.3, 1.01, -0.25],
      [0.08, 1.67, -0.13],
    ],
    [0.014, 0.011],
    WARNING,
    { bone: mastRear.joints[0], name: "rear-sail-spar-a", group: "wind-sails" },
  );

  tube(
    [
      [0.3, 1.01, -0.25],
      [-0.14, 1.67, -0.13],
    ],
    [0.014, 0.011],
    WARNING,
    { bone: mastRear.joints[0], name: "rear-sail-spar-b", group: "wind-sails" },
  );

  tube(
    [
      [-0.28, 1.0, 0.39],
      [0.12, 1.57, 0.5],
    ],
    [0.014, 0.011],
    WARNING,
    { bone: mastFront.joints[0], name: "front-sail-spar-a", group: "wind-sails" },
  );

  tube(
    [
      [0.3, 1.0, 0.39],
      [-0.08, 1.57, 0.5],
    ],
    [0.014, 0.011],
    WARNING,
    { bone: mastFront.joints[0], name: "front-sail-spar-b", group: "wind-sails" },
  );

  // Small top caps make the masts feel like assembled beach hardware.
  sphere([0, 1.66, -0.13], 0.036, JOINT_LIGHT, mastRear.tip, "rear-mast-cap");
  sphere([0, 1.56, 0.5], 0.036, JOINT_LIGHT, mastFront.tip, "front-mast-cap");

  // A pair of short side outriggers keeps the silhouette broad and machine-like.
  for (const side of [1, -1]) {
    tube(
      [
        [side * 0.08, 0.9, -0.3],
        [side * 0.34, 0.92, -0.28],
        [side * 0.51, 0.83, -0.17],
      ],
      [0.032, 0.022],
      IVORY_DARK,
      {
        bone: thorax.joints[1],
        name: `side-outrigger-${side}`,
        group: "body-detail",
        caps: "flat",
      },
    );
    sphere([side * 0.51, 0.83, -0.17], 0.045, JOINT, thorax.joints[1], `outrigger-end-${side}`);
  }

  // Three decorative rivets on the front face of the thorax, placed as explicit primitive details.
  for (let i = 0; i < 3; i++) {
    sphere(
      [0.09 - i * 0.09, 0.93 + (i % 2) * 0.035, 0.93],
      0.018,
      WARNING,
      thorax.tip,
      `front-rivet-${i}`,
    );
  }

  // A little sand-colored keel under the rear gives the creature a beach-tool character without adding scenery.
  b.part(
    new THREE.BoxGeometry(0.18, 0.06, 0.3),
    SAND,
    {
      at: [0, 0.7, -0.62],
      bone: thorax.joints[0],
      name: "rear-keel",
      group: "body-detail",
    },
  );

  // Keep the model deterministic if future detail additions use stochastic placement.
  void rng(17);
  void rearSail;
  void frontSail;
  void frame;

  return b.root;
}
