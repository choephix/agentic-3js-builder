```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  limb,
  rng,
} from "agentic-3js-builder";

export const meta = {
  name: "wind-walking tube beach creature",
  description:
    "A stylized Theo Jansen-inspired kinetic beach walker built from faceted tubes, crankshafts, articulated legs, sails, wind vanes, and bright mechanical joints.",
};

export default function build() {
  const b = createBuilder({ name: "windWalker", detail: 1 });

  const IVORY = "#e8dfc5";
  const IVORY_LIGHT = "#fff4d5";
  const IVORY_DARK = "#a99c7a";
  const SAND = "#d4c6a2";
  const JOINT = "#d96d36";
  const JOINT_DARK = "#743621";
  const STEEL = "#3b4543";
  const STEEL_LIGHT = "#75817a";
  const BLACK = "#171b1a";
  const SAIL = "#d77943";
  const SAIL_LIGHT = "#f0a15e";
  const SAIL_DARK = "#74352c";
  const BLUE = "#315f67";
  const WHITE = "#fff8e8";

  const root = b.joint("pelvis", {
    at: [0, 0.98, 0],
    dir: [0, 0, 1],
    role: "spine",
    group: "frame",
  });

  // Main thorax: a low, slightly bowed tube frame.
  const spinePath = catmull([
    [0, 0.98, -1.18],
    [0, 1.02, -0.72],
    [0, 1.05, 0],
    [0, 1.02, 0.72],
    [0, 0.98, 1.18],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: root,
    names: ["spineRear", "spineMidRear", "spineCenter", "spineMidFront", "spineFront"],
    role: "spine",
    count: 5,
    up: [0, 1, 0],
  });
  const body = b.sweep(spine, (t) => 0.105 + 0.025 * Math.sin(t * Math.PI), {
    color: IVORY,
    sides: 8,
    caps: "round",
    group: "body",
  });

  // Upper and lower longitudinal rails make the sculpture read as an open kinetic frame.
  const upperRail = b.sweep(
    catmull([
      [0, 1.16, -1.05],
      [0, 1.19, -0.5],
      [0, 1.2, 0],
      [0, 1.18, 0.52],
      [0, 1.12, 1.06],
    ]),
    0.026,
    { color: IVORY_LIGHT, sides: 6, group: "bodyRails" },
  );
  const lowerRail = b.sweep(
    catmull([
      [0, 0.8, -1.04],
      [0, 0.77, -0.5],
      [0, 0.76, 0],
      [0, 0.77, 0.52],
      [0, 0.82, 1.06],
    ]),
    0.028,
    { color: IVORY_DARK, sides: 6, group: "bodyRails" },
  );

  // Vertical ribs between the rails.
  for (const z of [-0.88, -0.44, 0, 0.44, 0.88]) {
    b.rod([0, 0.81, z], [0, 1.16, z], 0.021, {
      color: IVORY_LIGHT,
      sides: 6,
      group: "bodyRibs",
    });
    b.part(new THREE.SphereGeometry(0.047, 8, 5), JOINT, {
      at: [0, 0.81, z],
      bone: spine.nearestJoint([0, 1, z]),
      group: "bodyRibs",
    });
    b.part(new THREE.SphereGeometry(0.047, 8, 5), JOINT, {
      at: [0, 1.16, z],
      bone: spine.nearestJoint([0, 1, z]),
      group: "bodyRibs",
    });
  }

  // Six articulated walking legs, arranged in three pairs.
  const legStations = [
    { z: -0.82, phase: -1 },
    { z: -0.42, phase: 1 },
    { z: 0.0, phase: -1 },
    { z: 0.42, phase: 1 },
    { z: 0.82, phase: -1 },
  ];

  for (let i = 0; i < legStations.length; i++) {
    const station = legStations[i];
    for (const side of [-1, 1]) {
      const sideName = side > 0 ? "L" : "R";
      const hip: [number, number, number] = [side * 0.085, 0.98, station.z];

      // Alternating feet make the rest pose read as a walking gait without being exaggerated.
      const forward = station.phase * (side > 0 ? 0.12 : -0.07);
      const foot: [number, number, number] = [
        side * (0.78 + (i % 2) * 0.035),
        0.105,
        station.z + forward,
      ];

      const points = limb(
        hip,
        foot,
        [0.26, 0.32, 0.38],
        [
          [side * 0.2, -0.05, side * 0.7],
          [side * -0.28, 0.03, side * -0.75],
        ],
        { sole: [0, 1, 0] },
      );

      const chain = b.chain(`leg${sideName}${i + 1}`, points, {
        parent: spine.nearestJoint(hip),
        names: [`hip${sideName}${i + 1}`, `knee${sideName}${i + 1}`, `ankle${sideName}${i + 1}`],
        role: "leg",
        contact: foot,
        up: [0, 1, 0],
      });

      b.sweep(chain, [0.052, 0.045, 0.032], {
        color: IVORY,
        sides: 6,
        caps: "round",
        group: "legs",
      });

      // Orange axle collars at each mechanical joint.
      for (let j = 0; j < chain.joints.length; j++) {
        const p = chain.joints[j];
        b.part(new THREE.CylinderGeometry(0.072, 0.072, 0.045, 8), JOINT, {
          bone: p,
          at: p.at,
          dir: [1, 0, 0],
          axis: "y",
          group: "legJoints",
        });
        b.part(new THREE.CylinderGeometry(0.037, 0.037, 0.07, 8), BLACK, {
          bone: p,
          at: p.at,
          dir: [1, 0, 0],
          axis: "y",
          group: "legAxles",
        });
      }

      // Broad beach feet, each made from a heel tube and a flat paddle.
      const ankle = chain.tip;
      const heel = b.rod(
        ankle,
        [side * 0.82, 0.105, station.z + forward + 0.025],
        0.042,
        { color: STEEL, sides: 6, caps: "flat", group: "feet" },
      );
      b.part(new THREE.BoxGeometry(0.18, 0.045, 0.23), BLACK, {
        bone: ankle,
        at: [side * 0.82, 0.045, station.z + forward + 0.025],
        group: "feet",
        name: `sandFoot${sideName}${i + 1}`,
      });
      b.part(new THREE.BoxGeometry(0.13, 0.018, 0.16), STEEL_LIGHT, {
        bone: ankle,
        at: [side * 0.82, 0.076, station.z + forward + 0.025],
        group: "feet",
      });

      // Small diagonal braces from the knee toward the body, like a real strandbeest linkage.
      const knee = chain.joints[1];
      b.rod(
        knee,
        [0, 1.2, station.z + side * 0.1],
        0.018,
        { color: STEEL, sides: 5, group: "linkages" },
      );
    }
  }

  // Long axle through the creature's body.
  const axle = b.rod(
    [-0.98, 0.93, -1.22],
    [-0.98, 0.93, 1.22],
    0.032,
    { color: STEEL, sides: 8, group: "driveAxle" },
  );
  const axle2 = b.rod(
    [0.98, 0.93, -1.22],
    [0.98, 0.93, 1.22],
    0.032,
    { color: STEEL, sides: 8, group: "driveAxle" },
  );

  // Offset crank disks along both sides of the chassis.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const z = -0.88 + i * 0.44;
      const crank = b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.035, 12), JOINT_DARK, {
        at: [side * 0.125, 0.94, z],
        dir: [1, 0, 0],
        axis: "y",
        group: "cranks",
      });
      b.part(new THREE.CylinderGeometry(0.082, 0.082, 0.042, 10), JOINT, {
        at: [side * 0.15, 0.94, z],
        dir: [1, 0, 0],
        axis: "y",
        group: "cranks",
      });
      const crankPin: [number, number, number] = [
        side * 0.175,
        0.94 + 0.105 * Math.cos(i * 1.35 + side),
        z + 0.105 * Math.sin(i * 1.35 + side),
      ];
      b.part(new THREE.SphereGeometry(0.035, 8, 5), STEEL_LIGHT, {
        at: crankPin,
        group: "cranks",
      });
      b.rod(
        [side * 0.175, 0.94, z],
        crankPin,
        0.014,
        { color: STEEL_LIGHT, sides: 5, group: "cranks" },
      );
    }
  }

  // Three tall wind-catching sails mounted on the spine.
  const mastZ = [-0.72, 0, 0.72];
  for (let i = 0; i < mastZ.length; i++) {
    const z = mastZ[i];
    const mast = b.rod(
      [0, 1.12, z],
      [0, 1.82, z],
      0.031,
      { color: STEEL, sides: 6, group: "sails" },
    );

    // Alternating triangular sail direction creates a lively profile.
    const sign = i % 2 === 0 ? 1 : -1;
    const sail = b.extrude(
      [
        [0, 0],
        [0.31, 0.05],
        [0.5, 0.57],
        [0.12, 0.68],
        [-0.18, 0.28],
      ],
      {
        at: [sign * 0.02, 1.17, z],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.022,
        bevel: 0.006,
        smoothing: 0,
        color: i === 1 ? SAIL_LIGHT : SAIL,
        bone: spine.nearestJoint([0, 1.2, z]),
        group: "sails",
        name: `windSail${i + 1}`,
      },
    );

    // Sail ribs.
    b.rod(
      [sign * 0.02, 1.19, z],
      [sign * 0.5, 1.74, z],
      0.012,
      { color: SAIL_DARK, sides: 5, group: "sailRibs" },
    );
    b.rod(
      [sign * 0.03, 1.2, z],
      [sign * 0.31, 1.25, z],
      0.012,
      { color: SAIL_DARK, sides: 5, group: "sailRibs" },
    );

    // Pale cap at the top of every mast.
    b.part(new THREE.SphereGeometry(0.052, 8, 5), WHITE, {
      at: [0, 1.84, z],
      bone: spine.nearestJoint([0, 1.2, z]),
      group: "sails",
    });
  }

  // Front-facing wind rotor: a small four-bladed kinetic propeller.
  const rotorCenter: [number, number, number] = [0, 1.49, 1.23];
  b.rod([0, 1.49, 1.08], [0, 1.49, 1.34], 0.026, {
    color: STEEL,
    sides: 6,
    group: "windRotor",
  });
  b.part(new THREE.CylinderGeometry(0.078, 0.078, 0.06, 10), JOINT, {
    at: rotorCenter,
    dir: [0, 0, 1],
    axis: "y",
    group: "windRotor",
  });

  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + Math.PI / 4;
    const x = 0.24 * Math.sin(a);
    const y = 0.24 * Math.cos(a);
    b.extrude(
      [
        [0, -0.025],
        [0.3, -0.04],
        [0.4, 0.03],
        [0.12, 0.07],
      ],
      {
        at: [x * 0.03, rotorCenter[1] + y * 0.03, rotorCenter[2] + 0.05],
        x: [Math.cos(a), 0, -Math.sin(a)],
        y: [Math.sin(a), Math.cos(a), 0],
        thickness: 0.018,
        bevel: 0.003,
        color: i % 2 ? BLUE : SAIL_LIGHT,
        bone: spine.tip,
        group: "windRotor",
        name: `rotorBlade${i + 1}`,
      },
    );
  }

  // Small tail pennant and counterweight behind the frame.
  b.rod([0, 1.03, -1.16], [0, 1.33, -1.48], 0.024, {
    color: STEEL,
    sides: 6,
    group: "tail",
  });
  b.extrude(
    [
      [0, 0],
      [0.3, 0.04],
      [0.16, 0.23],
      [-0.05, 0.28],
    ],
    {
      at: [0, 1.28, -1.48],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.016,
      bevel: 0.003,
      color: BLUE,
      bone: spine.joints[0],
      group: "tail",
    },
  );
  b.part(new THREE.SphereGeometry(0.09, 8, 5), JOINT_DARK, {
    at: [0, 0.94, -1.43],
    bone: spine.joints[0],
    group: "tail",
  });

  // Repeated tiny rivets give the primitive tubes a crafted mechanical language.
  for (const z of [-1.08, -0.54, 0, 0.54, 1.08]) {
    for (const side of [-1, 1]) {
      b.part(new THREE.SphereGeometry(0.018, 6, 4), WHITE, {
        at: [side * 0.108, 1.09, z],
        bone: spine.nearestJoint([0, 1, z]),
        group: "rivets",
      });
      b.part(new THREE.SphereGeometry(0.018, 6, 4), WHITE, {
        at: [side * 0.108, 0.87, z],
        bone: spine.nearestJoint([0, 1, z]),
        group: "rivets",
      });
    }
  }

  return b.root;
}
```