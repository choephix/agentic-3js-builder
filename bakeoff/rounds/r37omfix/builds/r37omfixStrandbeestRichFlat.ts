import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  rng,
} from "../../../../src/index";

export const meta = {
  name: "wind-walking beach creature",
  description:
    "A stylized Theo Jansen-inspired beach walker assembled from faceted tubes, crank hubs, articulated legs, bracing rods, and a tall wind-sail rotor.",
};

export default function build() {
  const b = createBuilder({ name: "wind-walking-beach-creature", detail: 1 });

  const IVORY = "#d9d1b8";
  const IVORY_LIGHT = "#f0e8cf";
  const IVORY_DARK = "#9c927c";
  const GRAPHITE = "#252832";
  const GRAPHITE_LIGHT = "#444955";
  const RUST = "#b95132";
  const ORANGE = "#e47a3f";
  const SAND = "#d8b879";
  const SAIL = "#d97842";
  const SAIL_LIGHT = "#edb268";
  const BLACK = "#17191d";
  const BLUE = "#4e7d88";

  const root = b.joint("pelvis", {
    at: [0, 1.02, 0],
    dir: [0, 0, 1],
    role: "spine",
    group: "chassis",
  });

  // ------------------------------------------------------------------------------------------------
  // Skeleton first: a long central spine and twelve splayed, resting walking legs.

  const spinePath = catmull([
    [0, 1.03, -1.42],
    [0, 1.08, -0.82],
    [0, 1.1, 0],
    [0, 1.08, 0.82],
    [0, 1.03, 1.42],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: root,
    names: ["spineRear", "spineMidRear", "spineCore", "spineMidFront", "spineFront"],
    role: "spine",
    count: 5,
  });

  type Leg = {
    side: number;
    index: number;
    z: number;
    points: number[][];
    chain: ReturnType<typeof b.chain>;
  };

  const legs: Leg[] = [];
  const zStations = [-1.08, -0.55, 0, 0.55, 1.08];

  // Alternating leg geometry creates the characteristic repeating zig-zag silhouette.
  for (const side of [-1, 1]) {
    for (let i = 0; i < zStations.length; i++) {
      const z = zStations[i];
      const phase = (i + (side > 0 ? 1 : 0)) % 2;
      const forward = phase === 0 ? 0.27 : -0.27;
      const kneeZ = z + forward;
      const ankleZ = z - forward * 0.55;
      const toeZ = z + (phase === 0 ? 0.34 : -0.34);

      const pts = [
        [side * 0.22, 1.04, z],
        [side * 0.58, 0.62, kneeZ],
        [side * 0.72, 0.17, ankleZ],
        [side * 0.54, 0.06, toeZ],
      ];

      const parentIndex = Math.max(0, Math.min(spine.joints.length - 1, i));
      const names = [
        `hip${side > 0 ? "L" : "R"}${i + 1}`,
        `knee${side > 0 ? "L" : "R"}${i + 1}`,
        `ankle${side > 0 ? "L" : "R"}${i + 1}`,
        `foot${side > 0 ? "L" : "R"}${i + 1}`,
      ];

      const chain = b.chain(
        `leg${side > 0 ? "L" : "R"}${i + 1}`,
        polyline(pts),
        {
          parent: spine.joints[parentIndex],
          names,
          role: "leg",
          count: 4,
          contact: [pts[3][0], 0, pts[3][2]],
        },
      );

      legs.push({ side, index: i, z, points: pts, chain });
    }
  }

  // Two upper support masts for the sail assembly.
  const mastLeft = b.joint("mastL", {
    parent: spine.joints[2],
    at: [-0.16, 1.14, 0.05],
    dir: [-0.05, 1, 0.02],
    role: "fan",
    group: "windSails",
  });
  const mastRight = b.joint("mastR", {
    parent: spine.joints[2],
    at: [0.16, 1.14, 0.05],
    dir: [0.05, 1, 0.02],
    role: "fan",
    group: "windSails",
  });
  const sailTop = b.joint("sailTop", {
    parent: mastLeft,
    at: [0, 2.18, 0.08],
    dir: [0, 0, 1],
    role: "fan",
    group: "windSails",
  });

  // ------------------------------------------------------------------------------------------------
  // Chassis: layered tubes with a broad, open mechanical body.

  b.sweep(spine, (t) => 0.14 - 0.025 * Math.abs(t - 0.5), {
    color: IVORY,
    sides: 8,
    section: "box",
    caps: "round",
    group: "chassis",
    name: "mainBodyTube",
  });

  const upperRail = catmull([
    [-0.12, 1.22, -1.2],
    [-0.12, 1.25, -0.6],
    [-0.12, 1.27, 0],
    [-0.12, 1.25, 0.6],
    [-0.12, 1.22, 1.2],
  ]);
  const lowerRail = catmull([
    [0.12, 0.89, -1.2],
    [0.12, 0.87, -0.6],
    [0.12, 0.86, 0],
    [0.12, 0.87, 0.6],
    [0.12, 0.89, 1.2],
  ]);

  b.sweep(upperRail, 0.045, {
    bone: spine,
    color: IVORY_LIGHT,
    sides: 7,
    group: "chassis",
    name: "upperRail",
  });
  b.sweep(lowerRail, 0.042, {
    bone: spine,
    color: IVORY_DARK,
    sides: 7,
    group: "chassis",
    name: "lowerRail",
  });

  // Cross braces in the open body.
  for (const z of [-0.92, -0.46, 0, 0.46, 0.92]) {
    b.rod(
      [-0.13, 1.2, z - 0.08],
      [0.13, 0.9, z + 0.08],
      0.022,
      GRAPHITE_LIGHT,
      { bone: spine.joints[2], group: "bracing", name: `crossBraceA${z}` },
    );
    b.rod(
      [0.13, 1.2, z - 0.08],
      [-0.13, 0.9, z + 0.08],
      0.022,
      GRAPHITE,
      { bone: spine.joints[2], group: "bracing", name: `crossBraceB${z}` },
    );
  }

  // Nose and rear bumper-like tubes make the creature read clearly from the side.
  b.rod(
    [0, 1.08, -1.45],
    [0, 1.08, -1.68],
    0.09,
    GRAPHITE,
    { bone: spine.joints[0], group: "chassis", name: "rearNoseCap" },
  );
  b.rod(
    [0, 1.08, 1.45],
    [0, 1.08, 1.68],
    0.09,
    GRAPHITE,
    { bone: spine.joints[4], group: "chassis", name: "frontNoseCap" },
  );

  // ------------------------------------------------------------------------------------------------
  // Articulated tubes and large foot paddles.

  for (const leg of legs) {
    const { side, index, chain } = leg;

    b.sweep(chain, (t) => {
      if (t < 0.34) return 0.047;
      if (t < 0.7) return 0.039;
      return 0.032;
    }, {
      color: (t: number) => (t > 0.7 ? IVORY_LIGHT : IVORY),
      sides: 7,
      caps: "round",
      group: "legs",
      name: `legTube${side > 0 ? "L" : "R"}${index + 1}`,
    });

    const p = leg.points;
    const kneeColor = index % 2 === 0 ? RUST : GRAPHITE;
    const axleColor = index % 2 === 0 ? GRAPHITE : RUST;

    // Knee block.
    b.part(
      new THREE.SphereGeometry(0.075, 8, 6),
      kneeColor,
      {
        bone: chain.joints[1],
        at: p[1],
        scale: [1.1, 0.9, 1.1],
        group: "joints",
        name: `kneeBlock${side > 0 ? "L" : "R"}${index + 1}`,
      },
    );

    // Flat wheel-like joint caps, axle running across the walking plane.
    for (const s of [-1, 1]) {
      b.part(
        new THREE.CylinderGeometry(0.095, 0.095, 0.035, 10),
        axleColor,
        {
          bone: chain.joints[1],
          at: [p[1][0] + s * 0.035, p[1][1], p[1][2]],
          dir: [1, 0, 0],
          group: "joints",
          name: `kneeCap${side > 0 ? "L" : "R"}${index + 1}_${s}`,
        },
      );
    }

    // A dark ankle collar.
    b.part(
      new THREE.CylinderGeometry(0.06, 0.06, 0.075, 8),
      GRAPHITE,
      {
        bone: chain.joints[2],
        at: p[2],
        dir: [1, 0, 0],
        group: "joints",
        name: `ankleCollar${side > 0 ? "L" : "R"}${index + 1}`,
      },
    );

    // Broad, flat beach-foot paddle, slightly longer in the walking direction.
    b.part(
      new THREE.BoxGeometry(0.16, 0.045, 0.34),
      IVORY_DARK,
      {
        bone: chain.joints[chain.joints.length - 1],
        at: [p[3][0], 0.045, p[3][2]],
        rotation: [0, side > 0 ? -0.11 : 0.11, 0],
        group: "feet",
        name: `sandShoe${side > 0 ? "L" : "R"}${index + 1}`,
      },
    );

    // Toe-colored leading strip.
    b.part(
      new THREE.BoxGeometry(0.17, 0.018, 0.055),
      SAND,
      {
        bone: chain.joints[chain.joints.length - 1],
        at: [p[3][0], 0.072, p[3][2] + (index % 2 === 0 ? 0.13 : -0.13)],
        group: "feet",
        name: `footStripe${side > 0 ? "L" : "R"}${index + 1}`,
      },
    );
  }

  // Side-to-side diagonal stabilizers, like the visible rods of a Jansen leg mechanism.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const a = legs.find((l) => l.side === side && l.index === i)!;
      const c = legs.find((l) => l.side === side && l.index === i + 1)!;
      b.rod(
        a.points[1],
        c.points[2],
        0.018,
        i % 2 ? GRAPHITE : BLUE,
        {
          bone: spine.joints[Math.min(i + 1, spine.joints.length - 1)],
          group: "bracing",
          name: `sideLink${side > 0 ? "L" : "R"}${i}`,
        },
      );
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Crank discs, eccentric pins, and central axle details.

  for (let i = 0; i < zStations.length; i++) {
    const z = zStations[i];

    for (const side of [-1, 1]) {
      const socket = [side * 0.265, 1.055, z] as [number, number, number];

      b.part(
        new THREE.CylinderGeometry(0.105, 0.105, 0.065, 12),
        GRAPHITE,
        {
          bone: spine.joints[Math.min(i, spine.joints.length - 1)],
          at: socket,
          dir: [1, 0, 0],
          group: "cranks",
          name: `crankDisc${side > 0 ? "L" : "R"}${i + 1}`,
        },
      );

      b.part(
        new THREE.TorusGeometry(0.082, 0.012, 5, 12),
        RUST,
        {
          bone: spine.joints[Math.min(i, spine.joints.length - 1)],
          at: [side * 0.305, 1.055, z],
          dir: [1, 0, 0],
          group: "cranks",
          name: `crankRim${side > 0 ? "L" : "R"}${i + 1}`,
        },
      );

      const pinZ = z + (i % 2 === 0 ? 0.065 : -0.065);
      b.part(
        new THREE.SphereGeometry(0.028, 7, 5),
        ORANGE,
        {
          bone: spine.joints[Math.min(i, spine.joints.length - 1)],
          at: [side * 0.35, 1.055, pinZ],
          group: "cranks",
          name: `eccentricPin${side > 0 ? "L" : "R"}${i + 1}`,
        },
      );

      // Short link from the crank eccentric to the nearest upper leg section.
      const leg = legs.find((l) => l.side === side && l.index === i);
      if (leg) {
        b.rod(
          [side * 0.35, 1.055, pinZ],
          leg.points[1],
          0.014,
          ORANGE,
          {
            bone: spine.joints[Math.min(i, spine.joints.length - 1)],
            group: "cranks",
            name: `eccentricLink${side > 0 ? "L" : "R"}${i + 1}`,
          },
        );
      }
    }
  }

  // Long axle through the heart of the machine.
  b.rod(
    [0, 1.07, -1.55],
    [0, 1.07, 1.55],
    0.032,
    GRAPHITE,
    {
      bone: spine.joints[2],
      group: "axles",
      name: "centralCrankshaft",
    },
  );

  // Small bright axle caps at both ends.
  for (const z of [-1.57, 1.57]) {
    b.part(
      new THREE.CylinderGeometry(0.075, 0.075, 0.05, 10),
      ORANGE,
      {
        bone: spine.joints[z < 0 ? 0 : 4],
        at: [0, 1.07, z],
        dir: [0, 0, 1],
        group: "axles",
        name: z < 0 ? "rearAxleCap" : "frontAxleCap",
      },
    );
  }

  // ------------------------------------------------------------------------------------------------
  // Wind apparatus: twin masts, crossbars, and three triangular beach sails.

  b.rod(
    [-0.16, 1.13, 0.05],
    [-0.16, 2.18, 0.08],
    0.032,
    GRAPHITE,
    { bone: mastLeft, group: "windSails", name: "mastLeftTube" },
  );
  b.rod(
    [0.16, 1.13, 0.05],
    [0.16, 2.18, 0.08],
    0.032,
    GRAPHITE,
    { bone: mastRight, group: "windSails", name: "mastRightTube" },
  );
  b.rod(
    [-0.25, 1.38, 0.05],
    [0.25, 1.38, 0.05],
    0.025,
    RUST,
    { bone: spine.joints[2], group: "windSails", name: "sailLowerBar" },
  );
  b.rod(
    [-0.2, 1.82, 0.07],
    [0.2, 1.82, 0.07],
    0.025,
    RUST,
    { bone: mastLeft, group: "windSails", name: "sailUpperBar" },
  );
  b.rod(
    [-0.16, 2.18, 0.08],
    [0.16, 2.18, 0.08],
    0.028,
    GRAPHITE,
    { bone: sailTop, group: "windSails", name: "sailTopBar" },
  );

  const sailOutlines: [number, number][] = [
    [0, 0],
    [0.34, 0],
    [0.23, 0.43],
    [0.06, 0.83],
    [0, 0.83],
  ];

  const sailPositions = [-0.62, 0.02, 0.66];
  for (let i = 0; i < sailPositions.length; i++) {
    const z = sailPositions[i];
    const side = i === 1 ? -1 : 1;
    const sail = b.extrude(sailOutlines, {
      at: [-0.02, 1.36, z],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      color: i === 1 ? SAIL_LIGHT : SAIL,
      bone: spine.joints[2],
      group: "windSails",
      name: `triangularWindSail${i + 1}`,
    });

    // Bright diagonal sail seam.
    b.rod(
      [-0.005, 1.39, z],
      [0.29, 2.17, z],
      0.009,
      IVORY_LIGHT,
      {
        bone: spine.joints[2],
        group: "windSails",
        name: `sailSeam${i + 1}`,
      },
    );

    // Small triangular corner reinforcement.
    b.part(
      new THREE.CylinderGeometry(0.035, 0.035, 0.025, 6),
      ORANGE,
      {
        bone: spine.joints[2],
        at: [0.03, 2.19, z],
        dir: [0, 0, 1],
        group: "windSails",
        name: `sailCorner${i + 1}`,
      },
    );

    // Outer vertical edge gives each sail a crisp, puppet-like frame.
    b.rod(
      [-0.01, 1.38, z],
      [-0.01, 2.18, z],
      0.012,
      GRAPHITE_LIGHT,
      {
        bone: spine.joints[2],
        group: "windSails",
        name: `sailEdge${i + 1}`,
      },
    );

    // A small colored pennant makes the wind direction legible.
    if (i === 1) {
      b.extrude(
        [
          [0, 0],
          [0.22, 0.04],
          [0.05, 0.13],
          [0, 0.13],
        ],
        {
          at: [0.16, 2.18, z],
          x: [0, 0, 1],
          y: [0, 1, 0],
          thickness: 0.012,
          color: ORANGE,
          bone: sailTop,
          group: "windSails",
          name: "windPennant",
        },
      );
    }
  }

  // Wind-rotor axle and four little spokes above the sails.
  b.rod(
    [-0.42, 2.28, 0.1],
    [0.42, 2.28, 0.1],
    0.025,
    GRAPHITE,
    { bone: sailTop, group: "windSails", name: "rotorAxle" },
  );

  const rotorCenter: [number, number, number] = [0, 2.28, 0.1];
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    const end: [number, number, number] = [
      Math.cos(a) * 0.36,
      2.28 + Math.sin(a) * 0.36,
      0.1,
    ];
    b.rod(rotorCenter, end, 0.015, RUST, {
      bone: sailTop,
      group: "windSails",
      name: `rotorSpoke${i + 1}`,
    });
    b.part(
      new THREE.BoxGeometry(0.055, 0.15, 0.025),
      SAND,
      {
        bone: sailTop,
        at: [end[0], end[1], end[2]],
        rotation: [0, 0, a],
        group: "windSails",
        name: `rotorBlade${i + 1}`,
      },
    );
  }

  b.part(
    new THREE.CylinderGeometry(0.055, 0.055, 0.09, 10),
    ORANGE,
    {
      bone: sailTop,
      at: rotorCenter,
      dir: [1, 0, 0],
      group: "windSails",
      name: "rotorHub",
    },
  );

  // ------------------------------------------------------------------------------------------------
  // Repeated rivets and visual punctuation on the chassis.

  const rivetRng = rng(42);
  for (let i = 0; i < 18; i++) {
    const z = -1.25 + (i % 9) * 0.31;
    const side = i < 9 ? -1 : 1;
    b.part(
      new THREE.SphereGeometry(0.018 + rivetRng() * 0.006, 6, 4),
      RUST,
      {
        bone: spine.joints[Math.min(4, Math.floor((i % 9) / 2))],
        at: [side * 0.145, 1.17, z],
        group: "rivets",
        name: `bodyRivet${i + 1}`,
      },
    );
  }

  // A compact rear counterweight, deliberately simpler than the walking mechanism.
  b.part(
    new THREE.BoxGeometry(0.24, 0.16, 0.22),
    GRAPHITE_LIGHT,
    {
      bone: spine.joints[0],
      at: [0, 1.03, -1.48],
      rotation: [0, 0.18, 0],
      group: "chassis",
      name: "rearCounterweight",
    },
  );
  b.part(
    new THREE.BoxGeometry(0.16, 0.07, 0.25),
    ORANGE,
    {
      bone: spine.joints[0],
      at: [0, 1.15, -1.53],
      group: "chassis",
      name: "rearCounterweightStripe",
    },
  );

  return b.root;
}
