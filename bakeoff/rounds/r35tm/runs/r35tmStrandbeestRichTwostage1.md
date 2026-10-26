```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
} from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";

export const meta = {
  name: "wind-walking beach creature",
  description:
    "A stylized Theo Jansen-inspired beach walker assembled from faceted ivory tubes, articulated triangular legs, a high wind-sail cage, and exposed mechanical cross-bracing.",
};

export const REQUESTS = [
  {
    id: "windSailRibbons",
    kind: "add",
    part: "sailFrame",
    what: "Add three broad translucent-looking flat ribbon sails inside the upper wind frame, alternating SUN_YELLOW, CORAL, and SKY_BLUE, with dark tube ties at their corners. Keep the ribbons planar and graphic, like beach wind flags.",
    at: [0, 2.18, -0.25],
    normal: [0, 1, 0],
    bone: null,
    room: [1.5, 0.9, 2.3],
  },
  {
    id: "nosePennant",
    kind: "add",
    part: "frontMast",
    what: "Add a small triangular beach pennant at the forward mast tip in CORAL with a SUN_YELLOW edge and two tiny dark ties.",
    at: [0, 2.42, 1.28],
    normal: [0, 1, 0],
    bone: null,
    room: [0.5, 0.42, 0.12],
  },
  {
    id: "legJointCaps",
    kind: "add",
    part: "legJoints",
    what: "At every visible leg pivot, add chunky round turquoise joint caps with a dark central bolt and one tiny cream highlight. Match the toy-like but engineered Theo Jansen sculpture language.",
    at: [0.76, 1.05, 0.0],
    normal: [1, 0, 0],
    bone: null,
    room: [0.28, 0.28, 0.28],
  },
  {
    id: "footSails",
    kind: "add",
    part: "feet",
    what: "Add flat rounded beach shoes under each foot in SUN_YELLOW, with three dark tread slots on each sole and a small coral heel tab. Keep the shoes low and broad so all contacts remain grounded.",
    at: [0.95, 0.08, 0.35],
    normal: [0, 1, 0],
    bone: null,
    room: [0.34, 0.13, 0.48],
  },
  {
    id: "bodyMedallion",
    kind: "add",
    part: "bodyFront",
    what: "Add a large circular cream-and-coral maker medallion on the front of the central body tube, with a dark six-spoke wind-rose emblem and a tiny turquoise centre.",
    at: [0, 1.28, 1.36],
    normal: [0, 0, 1],
    bone: null,
    room: [0.55, 0.55, 0.08],
  },
  {
    id: "rearWhistle",
    kind: "add",
    part: "rearBody",
    what: "Add a short brass-colored wind whistle on the rear of the body: a small barrel, flared mouth, and two dark seam rings, aligned with the creature's forward axis.",
    at: [0, 1.32, -1.5],
    normal: [0, 0, -1],
    bone: null,
    room: [0.28, 0.28, 0.42],
  },
  {
    id: "cableBundle",
    kind: "add",
    part: "cableRail",
    what: "Add a tidy bundle of four thin dark cables running along the left side from the body rear to the sail frame, with pale ceramic clips at both ends and one midpoint clip.",
    at: [0.54, 1.46, -0.45],
    normal: [1, 0, 0],
    bone: null,
    room: [0.18, 0.22, 1.45],
  },
  {
    id: "mastWindVane",
    kind: "add",
    part: "frontMast",
    what: "Add a small four-fin wind vane at the top of the front mast, alternating TURQUOISE and CORAL blades around a dark axle, visibly offset from the sail.",
    at: [0, 2.45, 1.18],
    normal: [0, 1, 0],
    bone: null,
    room: [0.42, 0.42, 0.16],
  },
  {
    id: "tubePalette",
    kind: "texture",
    part: "bodyCore",
    what: "Paint the main ivory body tubes with subtle broad sun-warmed cream variation while preserving the flat low-poly facets. Keep the underside slightly sand-tan.",
  },
  {
    id: "legPalette",
    kind: "texture",
    part: "legL0",
    what: "Paint all articulated leg tubes in alternating IVORY and PALE_SAND segments, with a restrained turquoise accent only on the outermost link.",
  },
  {
    id: "sailFramePalette",
    kind: "texture",
    part: "sailFrame",
    what: "Add hand-painted beach wear: pale salt streaks on upward tubes, small coral marker bands at the frame joints, and a few dark scuff marks near the lower braces.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

const IVORY = "#e9dfc4";
const PALE_SAND = "#cdbb91";
const SAND_DARK = "#8d7650";
const TURQUOISE = "#2bb6ad";
const TURQUOISE_DARK = "#146f70";
const CORAL = "#d9654d";
const SUN_YELLOW = "#e6b84f";
const SKY_BLUE = "#5da9bd";
const BRASS = "#b77a3e";
const DARK = "#272b2b";
const CHARCOAL = "#3c4744";
const CREAM = "#fff1c7";

function tube(
  b: Builder,
  a: THREE.Vector3 | [number, number, number],
  c: THREE.Vector3 | [number, number, number],
  radius: number,
  color: string,
  options: Record<string, unknown> = {},
) {
  return b.rod(a, c, radius, {
    color,
    section: { ngon: 6 },
    caps: "flat",
    ...options,
  });
}

function capsule(
  b: Builder,
  a: THREE.Vector3 | [number, number, number],
  c: THREE.Vector3 | [number, number, number],
  radius: number,
  color: string,
  options: Record<string, unknown> = {},
) {
  return b.capsule(a, c, radius, {
    color,
    sides: 8,
    ...options,
  });
}

function ring(
  b: Builder,
  p: THREE.Vector3 | [number, number, number],
  axis: [number, number, number],
  radius: number,
  thickness: number,
  color: string,
  bone?: unknown,
) {
  return b.part(
    new THREE.TorusGeometry(radius, thickness, 6, 12),
    color,
    {
      at: p,
      dir: axis,
      bone,
      name: "jointRing",
    },
  );
}

function bolt(
  b: Builder,
  p: THREE.Vector3 | [number, number, number],
  radius: number,
  color: string,
  bone?: unknown,
) {
  return b.part(
    new THREE.SphereGeometry(radius, 8, 6),
    color,
    { at: p, bone, name: "pivotBolt" },
  );
}

export default function build() {
  const b = createBuilder({ name: "wind-walking-beach-creature", detail: 1 });

  // ---------------------------------------------------------------------------
  // Skeleton first: one central root, a long spine, six articulated legs per side,
  // and a light upper mast system.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 1.18, 0],
    dir: [0, 0, 1],
    role: "spine",
  });

  const bodyPath = catmull([
    [0, 1.18, -1.42],
    [0, 1.2, -0.9],
    [0, 1.18, -0.32],
    [0, 1.2, 0.34],
    [0, 1.23, 0.95],
    [0, 1.27, 1.42],
  ]);

  const bodyChain = b.chain("body", bodyPath, {
    parent: hips,
    names: ["bodyRear", "bodyMidA", "bodyMidB", "bodyFrontA", "bodyFront"],
    role: "spine",
    count: 5,
  });

  const mastPath = catmull([
    [0, 1.28, 0.25],
    [0, 1.62, 0.38],
    [0, 1.94, 0.62],
    [0, 2.34, 0.96],
  ]);

  const mastChain = b.chain("mast", mastPath, {
    parent: hips,
    names: ["mastBase", "mastMid", "mastTop"],
    role: "fan",
    count: 3,
  });

  const frontMastPath = catmull([
    [0, 1.25, 1.0],
    [0, 1.62, 1.12],
    [0, 2.04, 1.2],
    [0, 2.42, 1.22],
  ]);

  const frontMast = b.chain("frontMast", frontMastPath, {
    parent: hips,
    names: ["frontMastBase", "frontMastMid", "frontMastTop"],
    role: "fan",
    count: 3,
  });

  type LegRecord = {
    side: number;
    index: number;
    points: THREE.Vector3[];
    chain: ReturnType<Builder["chain"]>;
  };

  const legs: LegRecord[] = [];
  const zStations = [-0.92, -0.18, 0.58];

  for (const side of [-1, 1]) {
    for (let i = 0; i < zStations.length; i++) {
      const z = zStations[i];
      const root = new THREE.Vector3(side * 0.27, 1.22, z);

      const knee = new THREE.Vector3(
        side * (0.64 + (i === 1 ? 0.07 : 0)),
        0.77 + (i === 1 ? 0.08 : 0),
        z + (i === 0 ? -0.1 : i === 2 ? 0.1 : 0),
      );

      const ankle = new THREE.Vector3(
        side * 0.91,
        0.34,
        z + (i === 0 ? 0.18 : i === 2 ? -0.18 : 0),
      );

      const foot = new THREE.Vector3(
        side * 1.06,
        0.11,
        z + (i === 0 ? 0.34 : i === 2 ? -0.28 : 0.02),
      );

      const solved = limb(
        root,
        foot,
        [0.57, 0.63, 0.49],
        [
          [side, 0, 0.15],
          [side, 0, -0.85],
        ],
        { sole: [0, 0, 1] },
      );

      solved[1].set(knee.x, knee.y, knee.z);
      solved[2].set(ankle.x, ankle.y, ankle.z);
      solved[3].set(foot.x, foot.y, foot.z);

      const sideName = side > 0 ? "L" : "R";
      const names = [
        `hip${sideName}${i}`,
        `knee${sideName}${i}`,
        `ankle${sideName}${i}`,
        `foot${sideName}${i}`,
      ];

      const chain = b.chain(`leg${sideName}${i}`, solved, {
        parent: hips,
        names,
        role: "leg",
        contact: [foot.x, 0, foot.z],
      });

      legs.push({ side, index: i, points: solved, chain });
    }
  }

  // ---------------------------------------------------------------------------
  // Main body and wind-frame tubing.
  // ---------------------------------------------------------------------------

  b.sweep(bodyChain, (t: number) => 0.14 + 0.025 * Math.sin(t * Math.PI), {
    color: IVORY,
    sides: 8,
    section: "circle",
    caps: "round",
    name: "bodyCore",
    group: "body",
  });

  // Slight belly and upper rail create the characteristic skeletal chassis.
  tube(b, [-0.02, 1.02, -1.38], [-0.02, 1.02, 1.38], 0.055, PALE_SAND, {
    bone: hips,
    name: "bodyBellyRail",
  });
  tube(b, [0, 1.43, -1.25], [0, 1.47, 1.28], 0.05, CREAM, {
    bone: hips,
    name: "bodyUpperRail",
  });

  for (const side of [-1, 1]) {
    tube(
      b,
      [side * 0.21, 1.26, -1.18],
      [side * 0.21, 1.26, 1.18],
      0.045,
      PALE_SAND,
      { bone: hips, name: "sideLongRail" },
    );

    for (let i = 0; i < 5; i++) {
      const z = -1.05 + i * 0.52;
      tube(
        b,
        [side * 0.2, 1.12, z],
        [side * 0.2, 1.43, z + 0.04],
        0.034,
        CREAM,
        { bone: hips, name: "bodyRib" },
      );
    }
  }

  // Leg tubes: a continuous smooth tube for each articulated leg, plus the
  // unmistakable triangular diagonal braces of Strandbeest mechanisms.
  for (const leg of legs) {
    const sideName = leg.side > 0 ? "L" : "R";
    const mainColor = leg.index === 1 ? IVORY : PALE_SAND;

    b.sweep(leg.chain, (t: number) => 0.052 - t * 0.012, {
      color: mainColor,
      sides: 7,
      section: "circle",
      caps: "round",
      name: `leg${sideName}${leg.index}`,
      group: "legs",
    });

    const [p0, p1, p2, p3] = leg.points;

    tube(b, p0, p2, 0.028, DARK, {
      bone: leg.chain.joints[0],
      name: "legDiagonalFront",
    });
    tube(b, p1, p3, 0.032, IVORY, {
      bone: leg.chain.joints[1],
      name: "legDiagonalRear",
    });
    tube(b, p0, p3, 0.025, TURQUOISE_DARK, {
      bone: leg.chain.joints[0],
      name: "legLongTie",
    });

    // Small parallel foot rail, kept above the floor so the later shoe request
    // has a clean, planar attachment surface.
    const footRailA = new THREE.Vector3(p2.x, 0.13, p2.z - 0.16);
    const footRailB = new THREE.Vector3(p3.x, 0.13, p3.z + 0.17);
    tube(b, footRailA, footRailB, 0.036, IVORY, {
      bone: leg.chain.tip,
      name: "feet",
    });

    // Distinct pivots already exist in the flat stage, leaving the cap request
    // a clear target without making the stage-1 model visually noisy.
    for (let j = 0; j < 3; j++) {
      bolt(b, leg.points[j], 0.067, DARK, leg.chain.joints[Math.min(j, leg.chain.joints.length - 1)]);
      ring(
        b,
        leg.points[j],
        [0, 0, 1],
        0.078,
        0.014,
        leg.index === 1 ? TURQUOISE : BRASS,
        leg.chain.joints[Math.min(j, leg.chain.joints.length - 1)],
      );
    }
  }

  // Cross shafts through the body, like visible axles in a kinetic sculpture.
  for (const z of zStations) {
    tube(
      b,
      [-0.57, 1.2, z],
      [0.57, 1.2, z],
      0.043,
      DARK,
      { bone: hips, name: "crossAxle" },
    );
    for (const side of [-1, 1]) {
      bolt(b, [side * 0.32, 1.2, z], 0.065, BRASS, hips);
    }
  }

  // ---------------------------------------------------------------------------
  // Upper wind-catching frame: a tall, open, triangular cage.
  // ---------------------------------------------------------------------------

  b.sweep(mastChain, [0.065, 0.036], {
    color: IVORY,
    sides: 7,
    caps: "round",
    name: "sailFrame",
    group: "wind",
  });

  b.sweep(frontMast, [0.06, 0.03], {
    color: CREAM,
    sides: 7,
    caps: "round",
    name: "frontMast",
    group: "wind",
  });

  tube(
    b,
    mastPath.at(1),
    frontMastPath.at(1),
    0.043,
    CORAL,
    { bone: hips, name: "sailCrossbar" },
  );
  tube(
    b,
    mastPath.at(1),
    frontMastPath.at(3),
    0.034,
    PALE_SAND,
    { bone: hips, name: "sailDiagonalLeft" },
  );
  tube(
    b,
    [0, 1.62, 0.38],
    [0, 2.42, 1.22],
    0.032,
    PALE_SAND,
    { bone: hips, name: "sailDiagonalRight" },
  );

  // Two broad horizontal rails frame the future graphic sails.
  tube(
    b,
    [-0.64, 1.72, 0.45],
    [0.64, 1.72, 0.45],
    0.034,
    IVORY,
    { bone: hips, name: "sailLowerRail" },
  );
  tube(
    b,
    [-0.44, 2.12, 0.82],
    [0.44, 2.12, 0.82],
    0.032,
    CREAM,
    { bone: hips, name: "sailUpperRail" },
  );

  // Rear stabilizer fork and front nose ring.
  tube(b, [-0.44, 1.72, 0.45], [0, 2.34, 0.96], 0.029, TURQUOISE, {
    bone: hips,
    name: "sailBrace",
  });
  tube(b, [0.44, 1.72, 0.45], [0, 2.34, 0.96], 0.029, TURQUOISE, {
    bone: hips,
    name: "sailBrace",
  });

  const noseRing = b.part(
    new THREE.TorusGeometry(0.16, 0.028, 6, 12),
    BRASS,
    {
      at: [0, 1.45, 1.44],
      dir: [0, 0, 1],
      bone: hips,
      name: "bodyFront",
    },
  );
  bolt(b, [0, 1.45, 1.44], 0.035, DARK, hips);

  // A rear counterweight makes the profile more balanced and reads as a
  // deliberately engineered wind machine rather than a random tube bundle.
  b.part(
    new THREE.SphereGeometry(0.17, 8, 6),
    PALE_SAND,
    {
      at: [0, 1.2, -1.5],
      bone: hips,
      name: "rearBody",
    },
  );
  tube(b, [-0.22, 1.2, -1.48], [0.22, 1.2, -1.48], 0.032, DARK, {
    bone: hips,
    name: "rearAxle",
  });

  // Small exposed side cable rail, intentionally plain for the later cable
  // bundle request.
  tube(b, [0.52, 1.42, -1.1], [0.52, 1.48, 0.82], 0.018, CHARCOAL, {
    bone: hips,
    name: "cableRail",
  });
  tube(b, [0.56, 1.38, -1.1], [0.56, 1.44, 0.82], 0.012, TURQUOISE_DARK, {
    bone: hips,
    name: "cableRail",
  });

  // A few broad, flat mounting plates are part of the sculpture's silhouette,
  // but are kept deliberately empty for Stage 2 emblems and painted marks.
  for (const side of [-1, 1]) {
    b.part(
      new THREE.BoxGeometry(0.07, 0.34, 0.52),
      CREAM,
      {
        at: [side * 0.31, 1.23, 0.34],
        bone: hips,
        name: side > 0 ? "hullSideL" : "hullSideR",
      },
    );
  }

  // Readable low-poly fasteners around the upper cage.
  const fasteners = [
    [-0.64, 1.72, 0.45],
    [0.64, 1.72, 0.45],
    [-0.44, 2.12, 0.82],
    [0.44, 2.12, 0.82],
    [0, 2.34, 0.96],
  ] as const;

  for (const p of fasteners) {
    bolt(b, p, 0.045, CORAL, hips);
  }

  // A small underbody keel keeps the centre visually grounded between the legs.
  tube(b, [0, 1.02, -0.74], [0, 0.92, 0.74], 0.045, SAND_DARK, {
    bone: hips,
    name: "underKeel",
  });
  tube(b, [-0.12, 0.96, -0.5], [0.12, 0.96, -0.5], 0.027, BRASS, {
    bone: hips,
    name: "keelCrossbar",
  });
  tube(b, [-0.12, 0.96, 0.5], [0.12, 0.96, 0.5], 0.027, BRASS, {
    bone: hips,
    name: "keelCrossbar",
  });

  // Stage 2 additions are intentionally called only after the complete flat
  // stage has been authored, allowing appended builders to use all handles and
  // names above.
  for (const add of STAGE2) add(b);

  return b.root;
}
```