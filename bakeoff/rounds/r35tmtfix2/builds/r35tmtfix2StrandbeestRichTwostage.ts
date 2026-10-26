import * as THREE from "three";
import { type Builder, type JointRef, createBuilder, catmull, limb, noise, paint, rng } from "../../../../src/index";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

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

const BODY_PAINT = paint((p, n) => {
  const warmth = noise(p, 0.42, 17);
  if (n.y < -0.28) return warmth > 0.5 ? "#bca982" : "#a9936d";
  return warmth > 0.68 ? "#fff0cf" : warmth > 0.36 ? "#e9dfc4" : "#d8c9a8";
});

const LEG_PAINT = paint((_p, _n, s) => {
  const t = s[0];
  if (t > 0.78) return TURQUOISE;
  return Math.floor(t * 4) % 2 === 0 ? IVORY : PALE_SAND;
});

const SAIL_PAINT = paint((_p, n, s) => {
  const t = s[0];
  if (n.y > 0.62) return n.z > -0.25 ? "#fff2d2" : "#e6d8b8";
  const jointBand = Math.min(
    Math.abs(t - 0.18),
    Math.abs(t - 0.47),
    Math.abs(t - 0.76),
    Math.abs(t - 0.94),
  );
  if (jointBand < 0.025) return CORAL;
  if (t < 0.34 && n.y < -0.18) return DARK;
  return IVORY;
});

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
    color: BODY_PAINT,
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
      color: leg.index === 0 && leg.side > 0 ? LEG_PAINT : mainColor,
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
    color: SAIL_PAINT,
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
  const fasteners: [number, number, number][] = [
    [-0.64, 1.72, 0.45],
    [0.64, 1.72, 0.45],
    [-0.44, 2.12, 0.82],
    [0.44, 2.12, 0.82],
    [0, 2.34, 0.96],
  ];

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

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addWindSailRibbons(b: Builder) {
  const SAIL_YELLOW = "#e6b84f";
  const SAIL_CORAL = "#d9654d";
  const SAIL_BLUE = "#5da9bd";
  const DARK = "#272b2b";
  const CREAM = "#fff1c7";
  const TURQUOISE = "#2bb6ad";

  const bone = "hips";

  type V = [number, number, number];

  const addSail = (
    name: string,
    at: V,
    color: string,
    outline: [number, number][],
    thickness = 0.012,
  ) => {
    const sail = b.extrude(outline, {
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness,
      bevel: 0.006,
      smoothing: 1,
      color,
      bone,
      group: "windSails",
      name,
    });

    // Cream piping along the upper edge gives each otherwise-simple ribbon a
    // crisp, hand-built flag silhouette.
    const topA: V = [at[0] + outline[0][0], at[1] + outline[0][1], at[2] + 0.012];
    const topB: V = [
      at[0] + outline[1][0],
      at[1] + outline[1][1],
      at[2] + 0.012,
    ];
    b.rod(topA, topB, 0.009, {
      color: CREAM,
      section: { ngon: 6 },
      caps: "round",
      bone,
      name: `${name}TopTrim`,
      group: "windSails",
    });

    return sail;
  };

  const tie = (p: V, r = 0.024, color = DARK) => {
    b.part(new THREE.SphereGeometry(r, 8, 6), color, {
      at: p,
      bone,
      name: "sailTie",
      group: "windSails",
    });
  };

  const eyelet = (p: V, spin = 0) => {
    b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.018, 10), DARK, {
      at: p,
      dir: [0, 0, 1],
      axis: "y",
      rotation: [0, 0, spin],
      bone,
      name: "sailEyelet",
      group: "windSails",
    });
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.021, 10), TURQUOISE, {
      at: [p[0], p[1], p[2] + 0.004],
      dir: [0, 0, 1],
      axis: "y",
      rotation: [0, 0, spin],
      bone,
      name: "eyeletInsert",
      group: "windSails",
    });
  };

  // The three panels occupy the clear cage between the lower and upper rails.
  // They are offset a few millimetres in depth so the graphic colours remain
  // readable instead of z-fighting.
  const left = addSail(
    "sailRibbonL",
    [-0.43, 1.75, 0.505],
    SAIL_YELLOW,
    [
      [-0.19, -0.02],
      [0.09, 0.02],
      [0.14, 0.19],
      [-0.13, 0.23],
      [-0.2, 0.12],
    ],
  );

  const middle = addSail(
    "sailRibbonC",
    [-0.02, 1.76, 0.515],
    SAIL_CORAL,
    [
      [-0.17, -0.01],
      [0.15, 0.015],
      [0.18, 0.20],
      [-0.08, 0.24],
      [-0.18, 0.11],
    ],
  );

  const right = addSail(
    "sailRibbonR",
    [0.37, 1.77, 0.525],
    SAIL_BLUE,
    [
      [-0.13, -0.015],
      [0.19, 0.015],
      [0.17, 0.18],
      [-0.09, 0.22],
      [-0.16, 0.10],
    ],
  );

  // Lower hems read as stitched tubular battens and also visually tie the
  // three independent flags into one wind-catching assembly.
  b.rod(
    [-0.62, 1.75, 0.532],
    [-0.25, 1.74, 0.532],
    0.010,
    { color: DARK, caps: "round", section: { ngon: 6 }, bone, name: "sailHemL" },
  );
  b.rod(
    [-0.19, 1.76, 0.542],
    [0.16, 1.755, 0.542],
    0.010,
    { color: DARK, caps: "round", section: { ngon: 6 }, bone, name: "sailHemC" },
  );
  b.rod(
    [0.22, 1.77, 0.552],
    [0.58, 1.765, 0.552],
    0.010,
    { color: DARK, caps: "round", section: { ngon: 6 }, bone, name: "sailHemR" },
  );

  // Dark corner ties visibly wrap the rails.
  const ties: V[] = [
    [-0.62, 1.75, 0.54],
    [-0.34, 1.98, 0.54],
    [-0.25, 1.74, 0.55],
    [0.13, 2.00, 0.55],
    [0.22, 1.77, 0.56],
    [0.54, 1.97, 0.56],
  ];
  for (const p of ties) tie(p);

  // Small eyelets and short diagonal lashings add construction detail without
  // obscuring the three bold sail colours.
  eyelet([-0.54, 1.79, 0.546], 12);
  eyelet([-0.30, 1.94, 0.546], -10);
  eyelet([-0.11, 1.80, 0.556], 8);
  eyelet([0.10, 1.96, 0.556], -12);
  eyelet([0.29, 1.81, 0.566], 10);
  eyelet([0.51, 1.94, 0.566], -8);

  b.rod(
    [-0.54, 1.79, 0.56],
    [-0.32, 1.94, 0.56],
    0.006,
    { color: DARK, caps: "round", section: { ngon: 5 }, bone, name: "sailLashingL" },
  );
  b.rod(
    [-0.11, 1.80, 0.57],
    [0.10, 1.96, 0.57],
    0.006,
    { color: DARK, caps: "round", section: { ngon: 5 }, bone, name: "sailLashingC" },
  );
  b.rod(
    [0.29, 1.81, 0.58],
    [0.51, 1.94, 0.58],
    0.006,
    { color: DARK, caps: "round", section: { ngon: 5 }, bone, name: "sailLashingR" },
  );

  // Three narrow vertical seam strips make the panels feel like assembled
  // beach-fabric ribbons rather than opaque geometric plates.
  for (const [x, z] of [
    [-0.43, 0.548],
    [-0.02, 0.558],
    [0.37, 0.568],
  ] as [number, number][]) {
    b.rod(
      [x, 1.79, z],
      [x, 1.98, z],
      0.004,
      {
        color: CREAM,
        caps: "flat",
        section: { ngon: 5 },
        bone,
        name: "sailSeam",
        group: "windSails",
      },
    );
  }

  // Tiny edge knots at the panel bottoms complete the staged attachment points.
  for (const p of [
    [-0.43, 1.75, 0.57],
    [-0.02, 1.76, 0.58],
    [0.37, 1.77, 0.59],
  ] as V[]) {
    tie(p, 0.018, TURQUOISE);
  }
}
    return addWindSailRibbons;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addNosePennant(b: Builder) {
  const mastTip: [number, number, number] = [0, 2.42, 1.28];
  const bone = "frontMastTop";

  // A crisp triangular pennant, hanging from the upper mast.
  const flag = b.extrude(
    [
      [0, -0.13],
      [0, 0.14],
      [0.40, 0.015],
    ],
    {
      at: mastTip,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.003,
      smoothing: 1,
      color: CORAL,
      bone,
      group: "wind",
      name: "nosePennant",
    },
  );

  // The yellow hem follows the three sides and slightly overlaps the flag.
  const hem = 0.012;
  const z = 0.010;
  const p0 = new THREE.Vector3(0, 2.29, 1.28 + z);
  const p1 = new THREE.Vector3(0, 2.56, 1.28 + z);
  const p2 = new THREE.Vector3(0.40, 2.435, 1.28 + z);

  b.rod(p0, p1, hem, {
    color: SUN_YELLOW,
    caps: "round",
    sides: 6,
    bone,
    group: "wind",
    name: "pennantHoistTrim",
  });
  b.rod(p1, p2, hem, {
    color: SUN_YELLOW,
    caps: "round",
    sides: 6,
    bone,
    group: "wind",
    name: "pennantTopTrim",
  });
  b.rod(p2, p0, hem * 0.82, {
    color: SUN_YELLOW,
    caps: "round",
    sides: 6,
    bone,
    group: "wind",
    name: "pennantTrailingTrim",
  });

  // Two dark lashing knots make the attachment read as a physical tied flag.
  for (const y of [2.305, 2.545]) {
    b.part(
      new THREE.SphereGeometry(0.026, 7, 5),
      DARK,
      {
        at: [0, y, 1.28 + 0.016],
        scale: [1.15, 0.8, 0.8],
        bone,
        group: "wind",
        name: "pennantTie",
      },
    );
  }

  // Tiny coral knot tails hang below the two lash points.
  b.rod(
    [0.018, 2.298, 1.28 + 0.018],
    [-0.012, 2.255, 1.28 + 0.018],
    0.009,
    {
      color: DARK,
      caps: "round",
      sides: 5,
      bone,
      group: "wind",
      name: "pennantTieTail",
    },
  );
  b.rod(
    [0.018, 2.298, 1.28 + 0.018],
    [0.043, 2.264, 1.28 + 0.018],
    0.008,
    {
      color: CORAL,
      caps: "round",
      sides: 5,
      bone,
      group: "wind",
      name: "pennantTieTail",
    },
  );
  b.rod(
    [0.018, 2.538, 1.28 + 0.018],
    [-0.014, 2.495, 1.28 + 0.018],
    0.009,
    {
      color: DARK,
      caps: "round",
      sides: 5,
      bone,
      group: "wind",
      name: "pennantTieTail",
    },
  );

  return flag;
}
    return addNosePennant;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addLegJointCaps(b: Builder) {
  const legColor = TURQUOISE;
  const boltColor = DARK;
  const highlightColor = CREAM;
  const shoeColor = SUN_YELLOW;
  const heelColor = CORAL;

  const pivots = (side: number, index: number) => {
    const z = [-0.92, -0.18, 0.58][index];
    const root = new THREE.Vector3(side * 0.27, 1.22, z);
    const knee = new THREE.Vector3(
      side * (0.64 + (index === 1 ? 0.07 : 0)),
      0.77 + (index === 1 ? 0.08 : 0),
      z + (index === 0 ? -0.1 : index === 2 ? 0.1 : 0),
    );
    const ankle = new THREE.Vector3(
      side * 0.91,
      0.34,
      z + (index === 0 ? 0.18 : index === 2 ? -0.18 : 0),
    );
    const foot = new THREE.Vector3(
      side * 1.06,
      0.11,
      z + (index === 0 ? 0.34 : index === 2 ? -0.28 : 0.02),
    );
    return [root, knee, ankle, foot];
  };

  const pivotNames = ["hip", "knee", "ankle", "foot"];

  // Chunky faceted caps, dark axle heads, and tiny cream glints.
  for (const side of [-1, 1]) {
    const sideName = side > 0 ? "L" : "R";

    for (let index = 0; index < 3; index++) {
      const points = pivots(side, index);

      for (let j = 0; j < 3; j++) {
        const p = points[j];
        const bone = `${pivotNames[j]}${sideName}${index}`;

        b.part(
          new THREE.CylinderGeometry(0.091, 0.091, 0.052, 10, 1),
          legColor,
          {
            at: p,
            dir: [1, 0, 0],
            bone,
            name: `s23_cap_${sideName}${index}_${j}`,
            group: "legJoints",
          },
        );

        b.part(
          new THREE.CylinderGeometry(0.043, 0.043, 0.064, 8, 1),
          boltColor,
          {
            at: [p.x + side * 0.012, p.y, p.z],
            dir: [1, 0, 0],
            bone,
            name: `s23_bolt_${sideName}${index}_${j}`,
            group: "legJoints",
          },
        );

        b.part(
          new THREE.SphereGeometry(0.014, 6, 4),
          highlightColor,
          {
            at: [p.x + side * 0.049, p.y + 0.041, p.z - 0.018],
            bone,
            name: `s23_glint_${sideName}${index}_${j}`,
            group: "legJoints",
          },
        );
      }
    }
  }

  // Low, broad beach shoes with one merged tread assembly per foot.
  for (const side of [-1, 1]) {
    const sideName = side > 0 ? "L" : "R";

    for (let index = 0; index < 3; index++) {
      const foot = pivots(side, index)[3];
      const bone = `foot${sideName}${index}`;

      b.part(
        new THREE.BoxGeometry(0.27, 0.105, 0.39),
        shoeColor,
        {
          at: [foot.x, 0.075, foot.z],
          bone,
          name: `s23_beachShoe_${sideName}${index}`,
          group: "feet",
        },
      );

      const treadPieces: THREE.BufferGeometry[] = [];
      for (let k = -1; k <= 1; k++) {
        const tread = new THREE.BoxGeometry(0.17, 0.018, 0.043);
        tread.translate(foot.x, 0.132, foot.z + k * 0.105);
        treadPieces.push(tread);
      }

      b.part(
        mergeGeometries(treadPieces, false)!,
        DARK,
        {
          at: [0, 0, 0],
          bone,
          name: `s23_treads_${sideName}${index}`,
          group: "feet",
        },
      );

      b.part(
        new THREE.BoxGeometry(0.09, 0.115, 0.055),
        heelColor,
        {
          at: [foot.x, 0.082, foot.z - 0.155],
          bone,
          name: `s23_heelTab_${sideName}${index}`,
          group: "feet",
        },
      );
    }
  }
}
    return addLegJointCaps;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addBodyMedallion(b: Builder) {
  const MEDAL_CREAM = "#fff1c7";
  const MEDAL_CORAL = "#d9654d";
  const MEDAL_DARK = "#272b2b";
  const MEDAL_TURQUOISE = "#2bb6ad";
  const MEDAL_BRASS = "#b77a3e";

  const bone = "bodyFront";
  const cx = 0;
  const cy = 1.28;
  const surfaceZ = 1.36;

  // The main low-poly maker's plate.  The cylinder's local +Y is aimed along
  // +Z, so its front face sits proud of the body tube.
  b.part(
    new THREE.CylinderGeometry(0.225, 0.225, 0.034, 24, 1, false),
    MEDAL_CREAM,
    {
      at: [cx, cy, surfaceZ + 0.012],
      dir: [0, 0, 1],
      bone,
      name: "bodyMedallion",
      group: "ornament",
      flat: true,
    },
  );

  // Coral inset face gives the medallion a thick, toy-like enamel border.
  b.part(
    new THREE.CylinderGeometry(0.188, 0.188, 0.009, 24, 1, false),
    MEDAL_CORAL,
    {
      at: [cx, cy, surfaceZ + 0.034],
      dir: [0, 0, 1],
      bone,
      name: "medallionInset",
      group: "ornament",
      flat: true,
    },
  );

  // Raised cream centre disc.
  b.part(
    new THREE.CylinderGeometry(0.164, 0.164, 0.008, 24, 1, false),
    MEDAL_CREAM,
    {
      at: [cx, cy, surfaceZ + 0.044],
      dir: [0, 0, 1],
      bone,
      name: "medallionFace",
      group: "ornament",
      flat: true,
    },
  );

  // Dark outer and inner engraved rings.
  const outerRing = b.part(
    new THREE.TorusGeometry(0.207, 0.009, 6, 24),
    MEDAL_DARK,
    {
      at: [cx, cy, surfaceZ + 0.052],
      bone,
      name: "medallionOuterRing",
      group: "ornament",
    },
  );
  outerRing.mesh.rotation.x = 0;

  b.part(
    new THREE.TorusGeometry(0.164, 0.006, 6, 24),
    MEDAL_CORAL,
    {
      at: [cx, cy, surfaceZ + 0.054],
      bone,
      name: "medallionInnerRing",
      group: "ornament",
    },
  );

  // Six-spoke wind rose.  The rose is built from chunky dark rods so it reads
  // even at a distance and remains unmistakably mechanical rather than printed.
  const frontZ = surfaceZ + 0.059;
  const centre = new THREE.Vector3(cx, cy, frontZ);

  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 + Math.PI / 6;
    const short = i % 2 === 0;
    const length = short ? 0.105 : 0.142;

    const start = centre.clone();
    const end = new THREE.Vector3(
      cx + Math.sin(angle) * length,
      cy + Math.cos(angle) * length,
      frontZ,
    );

    b.rod(start, end, 0.012, {
      color: MEDAL_DARK,
      caps: "flat",
      section: { ngon: 6 },
      bone,
      name: "windRoseSpoke",
      group: "ornament",
    });

    // Arrow-like terminal collars make each spoke feel like a little
    // directional vane instead of a plain star.
    b.part(
      new THREE.CylinderGeometry(0.021, 0.016, 0.012, 6),
      MEDAL_DARK,
      {
        at: end,
        dir: [0, 0, 1],
        bone,
        name: "windRoseTip",
        group: "ornament",
        flat: true,
      },
    );

    // Coral pin at every spoke root.
    const root = new THREE.Vector3(
      cx + Math.sin(angle) * 0.035,
      cy + Math.cos(angle) * 0.035,
      frontZ + 0.006,
    );
    b.part(
      new THREE.SphereGeometry(0.014, 8, 5),
      MEDAL_CORAL,
      {
        at: root,
        bone,
        name: "windRoseRoot",
        group: "ornament",
      },
    );
  }

  // Small six-bolt ring between the wind rose and the inner rim.
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const p: [number, number, number] = [
      cx + Math.sin(angle) * 0.137,
      cy + Math.cos(angle) * 0.137,
      frontZ + 0.008,
    ];

    b.part(
      new THREE.CylinderGeometry(0.012, 0.012, 0.012, 8),
      MEDAL_BRASS,
      {
        at: p,
        dir: [0, 0, 1],
        bone,
        name: "medallionBolt",
        group: "ornament",
        flat: true,
      },
    );

    b.part(
      new THREE.SphereGeometry(0.0045, 6, 4),
      MEDAL_CREAM,
      {
        at: [p[0] - 0.003, p[1] + 0.004, p[2] + 0.008],
        bone,
        name: "medallionBoltHighlight",
        group: "ornament",
      },
    );
  }

  // Turquoise central axle cap, with a dark hexagonal pin visible at its centre.
  b.part(
    new THREE.CylinderGeometry(0.039, 0.039, 0.018, 10),
    MEDAL_TURQUOISE,
    {
      at: [cx, cy, frontZ + 0.014],
      dir: [0, 0, 1],
      bone,
      name: "windRoseHub",
      group: "ornament",
      flat: true,
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.014, 0.014, 0.022, 6),
    MEDAL_DARK,
    {
      at: [cx, cy, frontZ + 0.026],
      dir: [0, 0, 1],
      bone,
      name: "windRoseAxle",
      group: "ornament",
      flat: true,
    },
  );

  // A tiny cream highlight on the turquoise hub gives the otherwise flat
  // emblem a painted, hand-finished quality.
  b.part(
    new THREE.SphereGeometry(0.007, 6, 4),
    MEDAL_CREAM,
    {
      at: [-0.011, cy + 0.012, frontZ + 0.041],
      bone,
      name: "windRoseHubHighlight",
      group: "ornament",
    },
  );
}
    return addBodyMedallion;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addRearWhistle(b: Builder) {
  const brass = typeof BRASS !== "undefined" ? BRASS : "#b77a3e";
  const dark = typeof DARK !== "undefined" ? DARK : "#272b2b";
  const ivory = typeof IVORY !== "undefined" ? IVORY : "#e9dfc4";
  const coral = typeof CORAL !== "undefined" ? CORAL : "#d9654d";

  const axis: [number, number, number] = [0, 0, 1];
  const rearAxis: [number, number, number] = [0, 0, -1];
  const base = new THREE.Vector3(0, 1.32, -1.5);

  // Main six-sided whistle barrel, projecting rearward from the counterweight.
  b.capsule(
    [0, 1.32, -1.60],
    [0, 1.32, -1.40],
    0.067,
    {
      color: brass,
      sides: 8,
      caps: "round",
      name: "rearWhistleBarrel",
      group: "whistle",
    },
  );

  // Narrow dark collars make the barrel read as assembled rather than a single tube.
  for (const z of [-1.575, -1.435]) {
    b.part(
      new THREE.TorusGeometry(0.071, 0.010, 6, 12),
      dark,
      {
        at: [0, 1.32, z],
        dir: axis,
        name: "rearWhistleSeam",
        group: "whistle",
      },
    );
  }

  // Flared acoustic mouth at the rearmost end. The cone widens toward -Z.
  b.part(
    new THREE.ConeGeometry(0.098, 0.105, 8, 1, false),
    brass,
    {
      at: [0, 1.32, -1.665],
      dir: axis,
      name: "rearWhistleFlare",
      group: "whistle",
    },
  );

  // Black recessed opening, slightly behind the brass lip.
  b.part(
    new THREE.CircleGeometry(0.066, 12),
    dark,
    {
      at: [0, 1.32, -1.719],
      dir: rearAxis,
      axis: "z",
      name: "rearWhistleMouth",
      group: "whistle",
    },
  );

  // Raised lip around the opening.
  b.part(
    new THREE.TorusGeometry(0.075, 0.012, 6, 14),
    coral,
    {
      at: [0, 1.32, -1.721],
      dir: axis,
      name: "rearWhistleLip",
      group: "whistle",
    },
  );

  // Small upper wind block and its dark slit: a recognizable whistle mechanism.
  b.part(
    new THREE.BoxGeometry(0.052, 0.035, 0.095),
    ivory,
    {
      at: [0, 1.394, -1.515],
      dir: axis,
      name: "rearWhistleWindBlock",
      group: "whistle",
    },
  );

  b.part(
    new THREE.BoxGeometry(0.030, 0.006, 0.052),
    dark,
    {
      at: [0, 1.414, -1.515],
      dir: axis,
      name: "rearWhistleWindSlot",
      group: "whistle",
    },
  );

  // A tiny brass lever sits on the wind block, aligned with the creature's
  // longitudinal axis and kept inside the reserved attachment room.
  b.rod(
    [0, 1.414, -1.505],
    [0, 1.414, -1.435],
    0.009,
    {
      color: brass,
      section: { ngon: 6 },
      caps: "round",
      name: "rearWhistleLever",
      group: "whistle",
    },
  );

  b.part(
    new THREE.SphereGeometry(0.018, 8, 6),
    coral,
    {
      at: [0, 1.414, -1.425],
      name: "rearWhistleLeverCap",
      group: "whistle",
    },
  );

  // Two small side vents and a lower drain nub add asymmetrical mechanical detail.
  for (const side of [-1, 1]) {
    b.part(
      new THREE.BoxGeometry(0.012, 0.026, 0.052),
      dark,
      {
        at: [side * 0.066, 1.32, -1.505],
        dir: axis,
        name: "rearWhistleVent",
        group: "whistle",
      },
    );
  }

  b.part(
    new THREE.CylinderGeometry(0.014, 0.014, 0.042, 6),
    dark,
    {
      at: [0, 1.252, -1.505],
      dir: [0, -1, 0],
      name: "rearWhistleDrain",
      group: "whistle",
    },
  );

  // A small rear mounting saddle visually seats the instrument against the body.
  b.part(
    new THREE.SphereGeometry(0.078, 8, 5),
    brass,
    {
      at: base,
      scale: [1.05, 0.78, 0.58],
      name: "rearWhistleMount",
      group: "whistle",
    },
  );
}
    return addRearWhistle;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addCableBundle(b: Builder) {
  const CERAMIC = "#f4e8c6";
  const CABLE_BLACK = "#202b2b";
  const CABLE_BLUE = "#24595b";
  const VANE_CORAL = "#d9654d";
  const VANE_TURQUOISE = "#2bb6ad";

  const rod = (
    a: THREE.Vector3 | [number, number, number],
    c: THREE.Vector3 | [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) =>
    b.rod(a, c, radius, {
      color,
      section: { ngon: 6 },
      caps: "round",
      name,
      group: "stage2",
    });

  const cablePoints = [
    [
      [0.485, 1.405, -1.12],
      [0.485, 1.435, -0.7],
      [0.485, 1.535, -0.1],
      [0.485, 1.655, 0.38],
      [0.485, 1.76, 0.68],
    ],
    [
      [0.515, 1.425, -1.12],
      [0.515, 1.455, -0.7],
      [0.515, 1.555, -0.1],
      [0.515, 1.675, 0.38],
      [0.515, 1.78, 0.68],
    ],
    [
      [0.545, 1.455, -1.12],
      [0.545, 1.475, -0.7],
      [0.545, 1.575, -0.1],
      [0.545, 1.695, 0.38],
      [0.545, 1.80, 0.68],
    ],
    [
      [0.575, 1.485, -1.12],
      [0.575, 1.505, -0.7],
      [0.575, 1.595, -0.1],
      [0.575, 1.715, 0.38],
      [0.575, 1.82, 0.68],
    ],
  ] as [number, number, number][][];

  // Four subtly separated cables follow the left-side rail in a shallow,
  // deliberately visible bundle.
  for (let i = 0; i < cablePoints.length; i++) {
    const path = catmull(cablePoints[i]);
    b.sweep(path, 0.0085, {
      color: i % 2 === 0 ? CABLE_BLACK : CABLE_BLUE,
      section: { ngon: 6 },
      caps: "round",
      name: `cable${i}`,
      group: "stage2",
    });
  }

  // Ceramic collars are toroidal clips around each cable.  The small dark
  // rivet on each collar makes the attachment read as engineered rather than
  // merely decorative.
  const clipAt = (
    p: [number, number, number],
    cableIndex: number,
    label: string,
  ) => {
    b.part(
      new THREE.TorusGeometry(0.024, 0.006, 6, 10),
      CERAMIC,
      {
        at: p,
        dir: [0, 0, 1],
        name: `${label}Ceramic`,
        group: "stage2",
      },
    );
    b.part(
      new THREE.CylinderGeometry(0.006, 0.006, 0.009, 6),
      cableIndex % 2 === 0 ? DARK : CABLE_BLUE,
      {
        at: [p[0] + 0.011, p[1] + 0.004, p[2]],
        dir: [1, 0, 0],
        name: `${label}Bolt`,
        group: "stage2",
      },
    );
  };

  for (let i = 0; i < cablePoints.length; i++) {
    const pts = cablePoints[i];
    clipAt(pts[0], i, `cable${i}RearClip`);
    clipAt(pts[2], i, `cable${i}MidClip`);
    clipAt(pts[4], i, `cable${i}SailClip`);
  }

  // A narrow transverse guide bar gathers the bundle at its midpoint.
  b.part(
    new THREE.BoxGeometry(0.125, 0.045, 0.045),
    CERAMIC,
    {
      at: [0.53, 1.585, -0.1],
      name: "cableGuideBar",
      group: "stage2",
    },
  );
  for (let i = 0; i < 4; i++) {
    b.part(
      new THREE.CylinderGeometry(0.012, 0.012, 0.055, 6),
      DARK,
      {
        at: [0.485 + i * 0.03, 1.585, -0.1],
        dir: [0, 1, 0],
        name: "cableGuideHole",
        group: "stage2",
      },
    );
  }

  // -------------------------------------------------------------------------
  // Four-fin wind vane, mounted just above and slightly forward of the sail
  // frame.  The axle runs along Z, keeping the colored vane visible from the
  // creature's front and preserving the requested compact room.
  // -------------------------------------------------------------------------

  const vaneCenter: [number, number, number] = [0, 2.45, 1.275];

  rod(
    [0, 2.45, 1.205],
    [0, 2.45, 1.345],
    0.012,
    DARK,
    "vaneAxle",
  );

  b.part(
    new THREE.SphereGeometry(0.036, 8, 6),
    BRASS,
    {
      at: vaneCenter,
      name: "vaneHub",
      group: "stage2",
    },
  );

  b.part(
    new THREE.TorusGeometry(0.044, 0.006, 6, 12),
    CREAM,
    {
      at: vaneCenter,
      dir: [0, 0, 1],
      name: "vaneHubRing",
      group: "stage2",
    },
  );

  const bladeOutline: [number, number][] = [
    [0.025, -0.018],
    [0.155, -0.032],
    [0.19, 0],
    [0.155, 0.032],
    [0.025, 0.018],
  ];

  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + Math.PI / 4;
    const radial: [number, number, number] = [
      Math.cos(angle),
      Math.sin(angle),
      0,
    ];
    const tangent: [number, number, number] = [
      -Math.sin(angle),
      Math.cos(angle),
      0,
    ];

    b.extrude(bladeOutline, {
      at: vaneCenter,
      x: radial,
      y: tangent,
      thickness: 0.012,
      bevel: 0.004,
      smoothing: 1,
      color: i % 2 === 0 ? VANE_TURQUOISE : VANE_CORAL,
      name: `vaneBlade${i}`,
      group: "stage2",
    });

    const tip: [number, number, number] = [
      Math.cos(angle) * 0.178,
      2.45 + Math.sin(angle) * 0.178,
      1.275,
    ];

    b.part(
      new THREE.SphereGeometry(0.014, 6, 4),
      CERAMIC,
      {
        at: tip,
        name: `vaneTip${i}`,
        group: "stage2",
      },
    );

    // A slim dark rib follows the leading edge of every vane.
    const edgeA: [number, number, number] = [
      vaneCenter[0] + Math.cos(angle) * 0.035 - Math.sin(angle) * 0.018,
      vaneCenter[1] + Math.sin(angle) * 0.035 + Math.cos(angle) * 0.018,
      vaneCenter[2],
    ];
    const edgeB: [number, number, number] = [
      vaneCenter[0] + Math.cos(angle) * 0.16 - Math.sin(angle) * 0.032,
      vaneCenter[1] + Math.sin(angle) * 0.16 + Math.cos(angle) * 0.032,
      vaneCenter[2],
    ];
    rod(edgeA, edgeB, 0.0045, DARK, `vaneLeadingRib${i}`);
  }

  // Twin washers on the exposed axle ends complete the small kinetic assembly.
  for (const z of [1.205, 1.345]) {
    b.part(
      new THREE.CylinderGeometry(0.027, 0.027, 0.009, 8),
      BRASS,
      {
        at: [0, 2.45, z],
        dir: [0, 0, 1],
        name: "vaneAxleWasher",
        group: "stage2",
      },
    );
    b.part(
      new THREE.SphereGeometry(0.009, 6, 4),
      DARK,
      {
        at: [0, 2.45, z + (z < 1.25 ? -0.006 : 0.006)],
        name: "vaneAxlePin",
        group: "stage2",
      },
    );
  }
}
    return addCableBundle;
  })(),
);
