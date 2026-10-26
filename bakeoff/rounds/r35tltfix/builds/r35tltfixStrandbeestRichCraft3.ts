import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  rng,
  paint,
  countershade,
} from "../../../../src/index";

export const meta = {
  name: "Wind-Walking Beach Creature",
  description:
    "A stylized Theo Jansen-inspired kinetic beach creature assembled from faceted tubes, articulated walking legs, wind sails, cranks, and bright beach-found colors.",
};

export default function build() {
  const b = createBuilder({ name: "windWalkingBeachCreature", detail: 1 });

  const INK = "#18232a";
  const IVORY = "#e6d4a6";
  const SAND = "#c98b54";
  const RUST = "#a94d32";
  const TURQUOISE = "#2bb7ad";
  const SUN = "#f1b943";
  const CORAL = "#e86650";
  const BLUE = "#2b6f91";
  const DARK = "#26343a";

  const paintedIvory = countershade(IVORY, "#8d745b", { level: -0.15, soft: 0.28 });
  const paintedTurquoise = countershade(TURQUOISE, "#12666d", {
    level: -0.05,
    soft: 0.25,
  });
  const stripedRust = paint((p, n) => {
    const band = Math.sin(p.z * 20 + p.y * 5) > 0.42;
    return band ? (n.y > 0.15 ? "#ed7a4f" : RUST) : "#6f332b";
  });

  // The single root gives the whole kinetic creature a recognisable rig.
  const pelvis = b.joint("pelvis", {
    at: [0, 0.92, -0.05],
    dir: [0, 0, 1],
    role: "spine",
    group: "body",
  });

  const spinePath = catmull([
    [0, 0.92, -1.62],
    [0, 0.94, -0.92],
    [0, 0.96, 0],
    [0, 0.98, 0.9],
    [0, 1.0, 1.7],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: pelvis,
    names: ["spineRear", "spineMidRear", "spineCore", "spineMidFront", "spineFront"],
    role: "spine",
    count: 5,
  });

  const body = b.sweep(spine, (t) => 0.17 - t * 0.035, {
    bone: spine,
    color: paintedIvory,
    section: "box",
    sides: 6,
    caps: "round",
    group: "body",
    name: "continuousBodyTube",
  });

  // A second elevated tube makes the characteristic open-frame Jansen silhouette.
  const upperPath = catmull([
    [0, 1.08, -1.35],
    [0, 1.18, -0.55],
    [0, 1.2, 0.35],
    [0, 1.23, 1.2],
    [0, 1.18, 1.68],
  ]);
  b.sweep(upperPath, [0.065, 0.045], {
    bone: spine,
    color: TURQUOISE,
    section: { ngon: 6 },
    caps: "round",
    group: "body",
    name: "upperWindRail",
  });

  // Front and rear cross-members.
  for (const z of [-1.42, -0.6, 0.25, 1.08, 1.58]) {
    b.rod([-0.48, 0.96, z], [0.48, 0.96, z], 0.035, {
      bone: pelvis,
      color: RUST,
      section: { ngon: 6 },
      name: `crossbar${z}`,
      group: "frame",
    });
  }

  // Boxy bearing blocks at every walking-leg socket.
  for (const z of [-1.28, -0.82, -0.36, 0.12, 0.6, 1.08, 1.48]) {
    for (const side of [-1, 1]) {
      b.part(
        new THREE.BoxGeometry(0.13, 0.13, 0.18),
        DARK,
        {
          at: [side * 0.16, 0.95, z],
          bone: pelvis,
          rotation: [0, 0, 0],
          name: `bearing_${side}_${z}`,
          group: "bearings",
        },
      );
      b.part(
        new THREE.CylinderGeometry(0.045, 0.045, 0.2, 8),
        SUN,
        {
          at: [side * 0.24, 0.95, z],
          dir: [1, 0, 0],
          bone: pelvis,
          name: `axle_${side}_${z}`,
          group: "bearings",
        },
      );
    }
  }

  // Each leg is an angular, readable chain: hip, knee, hock, ankle, and broad beach foot.
  const legSpecs = [
    { z: -1.3, phase: -1 },
    { z: -0.87, phase: 1 },
    { z: -0.43, phase: -1 },
    { z: 0.03, phase: 1 },
    { z: 0.49, phase: -1 },
    { z: 0.95, phase: 1 },
    { z: 1.4, phase: -1 },
  ];

  for (let i = 0; i < legSpecs.length; i++) {
    const { z, phase } = legSpecs[i];

    for (const side of [-1, 1]) {
      const x = side * 0.18;
      const outward = side * 0.82;
      const forward = phase * 0.18;

      const hip = [x, 0.95, z] as [number, number, number];
      const knee = [outward * 0.56, 0.55, z + forward] as [
        number,
        number,
        number,
      ];
      const hock = [outward * 0.88, 0.29, z - forward * 0.65] as [
        number,
        number,
        number,
      ];
      const ankle = [outward * 1.02, 0.12, z + forward * 0.35] as [
        number,
        number,
        number,
      ];
      const toe = [outward * 1.07, 0.075, z + phase * 0.38] as [
        number,
        number,
        number,
      ];

      const name = `leg${i}${side > 0 ? "L" : "R"}`;
      const chain = b.chain(
        name,
        polyline([hip, knee, hock, ankle, toe]),
        {
          parent: pelvis,
          names: [
            `${name}_hip`,
            `${name}_knee`,
            `${name}_hock`,
            `${name}_ankle`,
            `${name}_toe`,
          ],
          role: "leg",
          contact: [toe[0], 0, toe[2]],
          count: 5,
        },
      );

      b.sweep(chain, (t) => (t < 0.28 ? 0.065 : t < 0.62 ? 0.052 : 0.035), {
        bone: chain,
        color: t => (t > 0.68 ? paintedTurquoise : stripedRust),
        section: { ngon: 6 },
        caps: "round",
        group: "legs",
        name: `${name}_tube`,
      });

      // Flat, slightly oversized feet grip the sand like spatulas.
      b.frustumBox(
        [outward * 0.98, 0.055, z + phase * 0.26],
        [outward * 1.1, 0.055, z + phase * 0.5],
        [0.105, 0.055],
        [0.125, 0.045],
        {
          bone: chain,
          color: SAND,
          section: { ngon: 4 },
          name: `${name}_beachFoot`,
          group: "feet",
        },
      );

      // Small colored hinge collars make the mechanism readable at a distance.
      for (const p of [knee, hock, ankle]) {
        b.part(
          new THREE.SphereGeometry(0.075, 8, 6),
          SUN,
          {
            at: p,
            bone: chain.nearestJoint(p),
            scale: [1, 0.72, 1],
            name: `${name}_hinge`,
            group: "joints",
          },
        );
      }

      // A parallel brace gives every leg the unmistakable open triangulated sculpture look.
      b.rod(
        [outward * 0.2, 0.91, z],
        [outward * 0.92, 0.29, z - forward * 0.65],
        0.018,
        {
          bone: chain.joints[0],
          color: BLUE,
          section: { ngon: 5 },
          name: `${name}_diagonalBrace`,
          group: "braces",
        },
      );
    }
  }

  // Wind rotor axle across the upper frame.
  const rotor = b.joint("windRotor", {
    parent: spine.joints[3],
    at: [0, 1.25, 0.78],
    dir: [1, 0, 0],
    role: "hinge",
    group: "wind",
  });

  b.rod([-0.72, 1.25, 0.78], [0.72, 1.25, 0.78], 0.035, {
    bone: rotor,
    color: INK,
    section: { ngon: 8 },
    name: "windAxle",
    group: "wind",
  });

  // Three broad triangular wind blades, mirrored in color and slightly offset.
  const sailColors = [CORAL, SUN, TURQUOISE];
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    const cx = 0;
    const cy = 1.25;
    const cz = 0.78;
    const r = 0.67;
    const p0 = [cx, cy, cz] as [number, number, number];
    const p1 = [
      cx,
      cy + Math.cos(a) * r,
      cz + Math.sin(a) * r,
    ] as [number, number, number];
    const p2 = [
      cx,
      cy + Math.cos(a + 0.62) * r * 0.78,
      cz + Math.sin(a + 0.62) * r * 0.78,
    ] as [number, number, number];

    b.slab([p0, p1, p2], {
      bone: rotor,
      color: sailColors[i],
      thickness: 0.025,
      name: `windSail${i}`,
      group: "wind",
    });

    b.rod(p0, p1, 0.018, {
      bone: rotor,
      color: INK,
      section: { ngon: 5 },
      name: `sailRib${i}`,
      group: "wind",
    });
    b.rod(p1, p2, 0.012, {
      bone: rotor,
      color: INK,
      section: { ngon: 5 },
      name: `sailEdge${i}`,
      group: "wind",
    });
  }

  // Decorative crank wheels on the near side, with offset crank pins.
  for (const z of [-0.7, 0.55]) {
    const wheel = b.part(
      new THREE.CylinderGeometry(0.18, 0.18, 0.035, 12),
      paintedTurquoise,
      {
        at: [0.33, 0.95, z],
        dir: [1, 0, 0],
        bone: pelvis,
        name: `crankWheel${z}`,
        group: "drive",
      },
    );
    b.part(
      new THREE.CylinderGeometry(0.045, 0.045, 0.055, 8),
      CORAL,
      {
        at: [0.37, 0.95 + 0.105, z + 0.06],
        dir: [1, 0, 0],
        bone: pelvis,
        name: `crankPin${z}`,
        group: "drive",
      },
    );
    b.rod([0.38, 0.95, z], [0.39, 0.95 + 0.105, z + 0.06], 0.014, {
      bone: pelvis,
      color: IVORY,
      section: { ngon: 5 },
      name: `crankLink${z}`,
      group: "drive",
    });
  }

  // A small pointed prow establishes the forward-facing end without becoming an animal face.
  const prow = b.sprout(
    "prow",
    spine.at(1),
    catmull([
      spine.at(1).at,
      [0, 1.02, 1.92],
      [0, 1.0, 2.22],
    ]),
    [0.11, 0.025],
    {
      parent: spine.tip,
      count: 2,
      names: ["prowBase", "prowTip"],
      role: "fan",
      color: paintedIvory,
      caps: { start: "round", end: "point" },
      group: "body",
    },
  );

  // Tiny signal pennants on the upper rail.
  for (const z of [-0.95, 0.05, 1.05]) {
    b.rod([0, 1.18, z], [0, 1.48, z], 0.012, {
      bone: spine.joints[2],
      color: INK,
      section: { ngon: 5 },
      name: `flagPole${z}`,
      group: "ornament",
    });
    b.extrude(
      [
        [0, 0],
        [0.16, 0.04],
        [0.11, 0.12],
        [0, 0.17],
      ] as [number, number][],
      {
        at: [0, 1.47, z],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.003,
        color: z < 0 ? CORAL : SUN,
        bone: spine.joints[2],
        name: `signalFlag${z}`,
        group: "ornament",
      },
    );
  }

  return b.root;
}
