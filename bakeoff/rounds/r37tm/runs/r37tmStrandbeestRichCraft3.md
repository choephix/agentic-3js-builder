```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  limb,
  rng,
  svg,
} from "agentic-3js-builder";
import { countershade, stripes } from "agentic-3js-builder";

export const meta = {
  name: "Wind-Walking Strandbeest",
  description:
    "An abstract Theo Jansen-inspired beach creature assembled from ivory tubes, articulated walking legs, crank rods, and a striped wind rotor.",
};

export default function build() {
  const b = createBuilder({ name: "wind-walking-strandbeest", detail: 0.85 });

  const IVORY = "#ded3b7";
  const IVORY_LIGHT = "#fff1c8";
  const SHADOW = "#8b7861";
  const JOINT = "#332d2a";
  const RUST = "#a84b2d";
  const RUST_DARK = "#5b2921";
  const BRASS = "#d29a43";
  const BLUE = "#4c8790";
  const BLACK = "#17191b";
  const SAIL = "#e7bd61";

  const TUBE = countershade(
    stripes(IVORY, [IVORY_LIGHT, "#b9aa91"], {
      size: 0.18,
      width: 0.12,
      wobble: 0.18,
      seed: 11,
    }),
    SHADOW,
    { level: -0.15, soft: 0.28 },
  );

  const ROD = countershade(IVORY_LIGHT, SHADOW, { level: -0.05, soft: 0.2 });

  // ---------------------------------------------------------------------------
  // Skeleton first: a long central body with a short forward neck and a rotor
  // hinge. The creature faces +Z.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 1.02, -0.78],
    dir: [0, 0, 1],
    role: "spine",
    group: "body",
  });

  const spinePath = catmull([
    hips.at,
    [0, 1.08, -0.34],
    [0, 1.11, 0.12],
    [0, 1.08, 0.58],
    [0, 1.04, 0.88],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "spine4", "spineTip"],
    role: "spine",
    group: "body",
  });

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.08, 0.78],
      [0, 1.14, 0.99],
      [0, 1.23, 1.12],
    ]),
    {
      parent: spine.tip,
      names: ["neck", "neckTip"],
      role: "neck",
      group: "body",
    },
  );

  const rotor = b.joint("windRotor", {
    parent: neck.tip,
    at: [0, 1.28, 1.17],
    dir: [0, 0, 1],
    role: "fan",
    group: "rotor",
  });

  // ---------------------------------------------------------------------------
  // Main tubes: low-poly, thick, slightly warm plastic / bone-colored pipes.
  // ---------------------------------------------------------------------------

  const body = b.sweep(spine, (t) => 0.12 + 0.025 * Math.sin(t * Math.PI), {
    color: TUBE,
    sides: 8,
    section: "circle",
    caps: "round",
    group: "body",
    name: "bodyTube",
  });

  b.sweep(neck, [0.11, 0.075], {
    color: TUBE,
    sides: 8,
    caps: "round",
    group: "body",
    name: "neckTube",
  });

  // Rear and front end collars give the silhouette a constructed, modular feel.
  for (const t of [0.045, 0.16, 0.84, 0.955]) {
    const p = spine.at(t);
    const collar = b.ring(p, {
      count: 8,
      radius: 0.132,
      fromDeg: 0,
      toDeg: 360,
      group: "body",
      role: "fan",
    });
    for (const item of collar.items) {
      b.part(new THREE.SphereGeometry(0.014, 6, 4), RUST, {
        frame: item,
        group: "body",
        name: "collarRivet",
      });
    }
  }

  // Vertical little body struts echo the original Strandbeest's rib cage.
  for (const z of [-0.58, -0.28, 0.02, 0.32, 0.62]) {
    b.rod(
      [0, 0.97, z],
      [0, 1.17, z],
      0.018,
      BRASS,
      { bone: spine.nearestJoint([0, 1.05, z]), group: "body" },
    );
  }

  // ---------------------------------------------------------------------------
  // Ten articulated legs. Each is a separate named chain with a broad foot.
  // ---------------------------------------------------------------------------

  const legZ = [-0.62, -0.31, 0.0, 0.31, 0.62];

  for (let i = 0; i < legZ.length; i++) {
    const z = legZ[i];

    for (const side of [1, -1] as const) {
      const sideName = side > 0 ? "L" : "R";
      const root: [number, number, number] = [side * 0.13, 1.05, z];
      const target: [number, number, number] = [
        side * 0.57,
        0.075,
        z + (i % 2 === 0 ? 0.055 : -0.055),
      ];

      const bends =
        side > 0
          ? [
              [side * 0.1, 0, 1],
              [side * 0.1, 0, -1],
            ]
          : [
              [side * 0.1, 0, -1],
              [side * 0.1, 0, 1],
            ];

      const points = limb(root, target, [0.27, 0.43, 0.36], bends);
      const chain = b.chain(
        `leg${sideName}${i + 1}`,
        points,
        {
          parent: spine.nearestJoint(root),
          names: [
            `hip${sideName}${i + 1}`,
            `knee${sideName}${i + 1}`,
            `ankle${sideName}${i + 1}`,
            `foot${sideName}${i + 1}`,
          ],
          role: "leg",
          group: "legs",
          contact: target,
        },
      );

      b.sweep(
        chain,
        (t) => (t < 0.38 ? 0.055 : t < 0.75 ? 0.043 : 0.032),
        {
          color: TUBE,
          sides: 6,
          caps: "round",
          group: "legs",
          name: `legTube${sideName}${i + 1}`,
        },
      );

      const knee = chain.at(0.38);
      const ankle = chain.at(0.77);
      const foot = chain.at(1);

      b.part(new THREE.SphereGeometry(0.068, 8, 5), JOINT, {
        at: knee.at,
        bone: knee.bone,
        group: "joints",
        name: `kneeCap${sideName}${i + 1}`,
      });

      b.part(new THREE.SphereGeometry(0.054, 8, 5), RUST_DARK, {
        at: ankle.at,
        bone: ankle.bone,
        group: "joints",
        name: `ankleCap${sideName}${i + 1}`,
      });

      // Flat, elongated beach foot. It is deliberately just above the floor.
      b.part(
        new THREE.BoxGeometry(0.16, 0.065, 0.13),
        ROD,
        {
          at: [side * 0.59, 0.045, target[2]],
          bone: chain.tip,
          group: "feet",
          name: `sandFoot${sideName}${i + 1}`,
          rotation: [0, side * 7, side * 5],
        },
      );

      // A small dark toe at the leading edge makes each leg easier to read.
      b.part(
        new THREE.SphereGeometry(0.027, 7, 4),
        BLACK,
        {
          at: [side * 0.66, 0.055, target[2] + 0.045],
          bone: chain.tip,
          group: "feet",
          name: `toe${sideName}${i + 1}`,
        },
      );

      // Long external crank rods, one on each side, linking the knees.
      if (i < legZ.length - 1) {
        const nextZ = legZ[i + 1];
        b.rod(
          [side * 0.22, 0.76, z],
          [side * 0.22, 0.76, nextZ],
          0.014,
          RUST,
          { bone: spine.nearestJoint([0, 1.05, z]), group: "mechanism" },
        );
      }
    }
  }

  // Cross braces under the belly, visible between the legs.
  for (const z of [-0.45, -0.15, 0.15, 0.45]) {
    b.rod(
      [-0.25, 0.84, z],
      [0.25, 0.84, z],
      0.018,
      RUST_DARK,
      { bone: spine.nearestJoint([0, 1.05, z]), group: "mechanism" },
    );
  }

  // Thin diagonal motion links make the legs look mechanically coupled.
  for (let i = 0; i < legZ.length - 1; i++) {
    const za = legZ[i];
    const zb = legZ[i + 1];
    b.rod(
      [0.26, 0.57, za],
      [0.45, 0.30, zb],
      0.011,
      BRASS,
      { bone: spine.nearestJoint([0, 1.05, za]), group: "mechanism" },
    );
    b.rod(
      [-0.26, 0.57, za],
      [-0.45, 0.30, zb],
      0.011,
      BRASS,
      { bone: spine.nearestJoint([0, 1.05, za]), group: "mechanism" },
    );
  }

  // ---------------------------------------------------------------------------
  // Front wind rotor: axle, six broad slatted blades, and a graphic sail mark.
  // ---------------------------------------------------------------------------

  b.part(
    new THREE.CylinderGeometry(0.105, 0.105, 0.16, 10),
    JOINT,
    {
      bone: rotor,
      at: rotor.at,
      dir: [0, 0, 1],
      group: "rotor",
      name: "rotorHub",
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.052, 0.052, 0.28, 8),
    BRASS,
    {
      bone: rotor,
      at: [0, 1.28, 1.17],
      dir: [0, 0, 1],
      group: "rotor",
      name: "rotorAxle",
    },
  );

  const sailMark = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" fill="#e7bd61"/>
      <path d="M8 53 L32 8 L56 53 L45 47 L32 28 L19 47 Z" fill="#332d2a"/>
      <circle cx="32" cy="31" r="5" fill="#d29a43"/>
    </svg>`,
    { size: 128 },
  );

  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI * 2) / 6 + Math.PI / 6;
    const radial: [number, number, number] = [Math.cos(a), Math.sin(a), 0];
    const tangent: [number, number, number] = [
      -Math.sin(a),
      Math.cos(a),
      0,
    ];

    // Hub spoke.
    b.rod(
      rotor.at,
      [radial[0] * 0.47, 1.28 + radial[1] * 0.47, 1.18],
      0.018,
      BRASS,
      { bone: rotor, group: "rotor", name: "rotorSpoke" },
    );

    const bladeAt: [number, number, number] = [
      radial[0] * 0.67,
      1.28 + radial[1] * 0.67,
      1.18,
    ];

    const blade = b.extrude(
      [
        [0.0, -0.07],
        [0.44, -0.055],
        [0.58, 0.0],
        [0.44, 0.055],
        [0.0, 0.07],
      ],
      {
        at: bladeAt,
        x: radial,
        y: tangent,
        thickness: 0.024,
        bevel: 0.006,
        smoothing: 0,
        color: SAIL,
        bone: rotor,
        group: "sails",
        name: `windSail${i + 1}`,
      },
    );

    // A small printed emblem on alternating blades.
    if (i % 2 === 0) {
      b.part(
        new THREE.PlaneGeometry(0.18, 0.18),
        "#ffffff",
        {
          bone: rotor,
          at: [
            radial[0] * 0.41,
            1.28 + radial[1] * 0.41,
            1.197,
          ],
          dir: [0, 0, 1],
          axis: "z",
          texture: sailMark,
          rotation: [0, 0, -a],
          group: "sails",
          name: `sailEmblem${i + 1}`,
        },
      );
    }
  }

  // Front bumper / prow, like an abstract head without a face.
  b.sweep(
    catmull([
      [0, 1.23, 0.92],
      [0, 1.27, 1.1],
      [0, 1.25, 1.34],
    ]),
    [0.09, 0.045],
    {
      color: RUST,
      bone: neck.tip,
      caps: { start: "round", end: "point" },
      sides: 7,
      group: "prow",
      name: "prowTube",
    },
  );

  b.part(
    new THREE.SphereGeometry(0.075, 8, 5),
    BRASS,
    {
      bone: neck.tip,
      at: [0, 1.25, 1.37],
      group: "prow",
      name: "prowNose",
    },
  );

  // Small hanging counterweights beneath the body reinforce the kinetic-machine theme.
  for (const z of [-0.72, -0.36, 0, 0.36, 0.72]) {
    b.rod(
      [0, 0.98, z],
      [0, 0.68, z],
      0.012,
      BLACK,
      { bone: spine.nearestJoint([0, 1.05, z]), group: "weights" },
    );
    b.part(
      new THREE.SphereGeometry(0.042, 7, 5),
      RUST_DARK,
      {
        at: [0, 0.62, z],
        bone: spine.nearestJoint([0, 1.05, z]),
        group: "weights",
        name: "counterweight",
      },
    );
  }

  // Rest pose: the rotor is slightly cocked, giving the still sculpture a sense
  // of stored motion without lifting any feet from the beach.
  b.pose(rotor, { axis: [0, 0, 1], deg: 8 });

  return b.root;
}
```