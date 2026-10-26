import * as THREE from "three";
import { createBuilder, catmull, polyline } from "../../../../src/index";
import type { Builder, Joint } from "../../../../src/index";

export const meta = {
  name: "Windwalker Strandbeest",
  description:
    "A stylized Theo Jansen beach creature assembled from faceted polymer tubes, articulated linkage legs, crank axles, bulkhead hoops, and a tall wind-catching sail.",
};

export const REQUESTS = [
  {
    id: "sailWindMarks",
    kind: "add",
    part: "sailPanel",
    what: "Add three broad wind-direction chevrons and a small spiral emblem to the plain cream sail panel. Use BEACH_ORANGE, DEEP_TEAL, and DARK_INK, with crisp flat geometry that follows the sail surface.",
    at: [0, 2.12, 0.35],
    normal: [0, 0, 1],
    bone: "mastMid",
    room: [1.15, 0.55, 0.04],
  },
  {
    id: "mastPennant",
    kind: "add",
    part: "mastTop",
    what: "Add a narrow triangular beach pennant at the mast crown, striped alternately in BEACH_ORANGE and SUN_YELLOW, with a short dark cap and a tiny dangling wind ribbon.",
    at: [0, 2.52, 0.3],
    normal: [0, 1, 0],
    bone: "mastTop",
    room: [0.42, 0.28, 0.12],
  },
  {
    id: "frontNoseVane",
    kind: "add",
    part: "frontHoop",
    what: "Add a small rotating wind vane on the front bulkhead: a horizontal axle, two opposing paddle blades, and a little orange central hub.",
    at: [0, 1.48, 1.22],
    normal: [0, 0, 1],
    bone: "spine3",
    room: [0.65, 0.32, 0.18],
  },
  {
    id: "crankHubCaps",
    kind: "add",
    part: "crankWheel",
    what: "At every visible crank wheel, add a dark teal outer cap, a cream washer, and a small orange offset crank pin. Keep the linkage joints readable and leave the wheel faces mostly clear.",
    at: [0.78, 1.43, 0.08],
    normal: [1, 0, 0],
    bone: "spine2",
    room: [0.18, 0.28, 0.22],
  },
  {
    id: "footSandPaddles",
    kind: "add",
    part: "soleL0",
    what: "Add broad, low-profile sand paddles beneath each of the six feet. They should be rounded rectangular plates in BEACH_ORANGE with dark teal heel bands and two small cream studs per paddle.",
    at: [1.08, 0.035, 0.12],
    normal: [0, 1, 0],
    bone: "footL0",
    room: [0.3, 0.08, 0.48],
  },
  {
    id: "legJointWashers",
    kind: "add",
    part: "legTubeL1",
    what: "Repeat the signature layered joint washers on every knee and ankle: two thin dark discs, one pale outer ring, and a small orange centre pin. Match the same detail on both sides.",
    at: [0.96, 0.92, 0.18],
    normal: [1, 0, 0],
    bone: "kneeL1",
    room: [0.24, 0.22, 0.22],
  },
  {
    id: "bodySideCables",
    kind: "add",
    part: "sideRailL",
    what: "Add two taut dark cables along each side rail, one high and one low, with small cream anchor collars at the front and rear hoops. The cables should visually tie the long body together.",
    at: [0.34, 1.55, 0],
    normal: [1, 0, 0],
    bone: "spine2",
    room: [0.12, 0.24, 1.8],
  },
  {
    id: "sailRivets",
    kind: "add",
    part: "sailPanel",
    what: "Place a sparse row of small orange rivet heads along the sail's upper and lower tube edges, following the triangular outline without cluttering the central sail.",
    at: [-0.54, 1.73, 0.37],
    normal: [0, 0, 1],
    bone: "mastMid",
    room: [1.0, 0.08, 0.05],
  },
  {
    id: "bodyIdentificationPlate",
    kind: "add",
    part: "bodyTube",
    what: "Add a small cream identification plate on the forward upper side of the body, framed in dark teal and marked with a simple three-line orange symbol.",
    at: [0, 1.59, 0.72],
    normal: [0, 0.65, 0.75],
    bone: "spine3",
    room: [0.42, 0.16, 0.18],
  },
  {
    id: "bodyWeathering",
    kind: "texture",
    part: "bodyTube",
    what: "Paint the long body tube with a restrained beach-weathered pattern: warm ivory as the base, pale sand on upward-facing facets, muted blue-grey on the underside, and occasional broad teal maintenance bands near the three crank stations.",
  },
  {
    id: "sailWeathering",
    kind: "texture",
    part: "sailPanel",
    what: "Paint the sail as sun-bleached canvas: cream and muted straw panels with a few flat BEACH_ORANGE seam strips, keeping the centre visually open for the wind marks.",
  },
  {
    id: "linkagePalette",
    kind: "texture",
    part: "legTubeL0",
    what: "Use the same restrained material language on the articulated legs: pale polymer primary tubes, blue-grey shadow links, orange crank accents, and darker underside sections. Preserve the hard faceted Theo Jansen look.",
  },
] as const;

export const STAGE2: ((b: Builder) => void)[] = [];

// Flat stage-one palette. Stage two builders can use these names in their briefs.
const POLYMER = "#f0ead7";
const POLYMER_HIGHLIGHT = "#fff8e8";
const POLYMER_SHADE = "#b7c1bd";
const BLUE_GREY = "#647b80";
const DEEP_TEAL = "#1f6268";
const TEAL = "#2d9998";
const BEACH_ORANGE = "#d87945";
const SUN_YELLOW = "#e7bc67";
const SAND = "#cda875";
const DARK_INK = "#1c292d";
const IRON = "#39484c";
const RUBBER = "#263437";

function point(x: number, y: number, z: number) {
  return new THREE.Vector3(x, y, z);
}

function shifted(p: THREE.Vector3, x: number, y: number, z: number) {
  return new THREE.Vector3(p.x + x, p.y + y, p.z + z);
}

function tube(
  b: Builder,
  a: any,
  c: any,
  radius: number,
  color: string,
  name: string,
  bone?: Joint,
) {
  return b.rod(a, c, radius, {
    color,
    bone,
    name,
    caps: "round",
    section: { ngon: 6 },
  });
}

function flatTube(
  b: Builder,
  a: any,
  c: any,
  radius: number,
  color: string,
  name: string,
  bone?: Joint,
) {
  return b.rod(a, c, radius, {
    color,
    bone,
    name,
    caps: "flat",
    section: { ngon: 6 },
  });
}

function cylinder(
  b: Builder,
  at: any,
  radius: number,
  length: number,
  color: string,
  name: string,
  dir: [number, number, number] = [1, 0, 0],
  bone?: Joint,
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, length, 8), color, {
    at,
    dir,
    bone,
    name,
    flat: true,
  });
}

function box(
  b: Builder,
  at: any,
  size: [number, number, number],
  color: string,
  name: string,
  bone?: Joint,
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    bone,
    name,
    flat: true,
  });
}

function sphere(
  b: Builder,
  at: any,
  radius: number,
  color: string,
  name: string,
  bone?: Joint,
) {
  return b.part(new THREE.SphereGeometry(radius, 8, 5), color, {
    at,
    bone,
    name,
    flat: true,
  });
}

function axlePin(
  b: Builder,
  joint: Joint,
  name: string,
  accent = BEACH_ORANGE,
) {
  const p = joint.at;
  cylinder(b, p, 0.071, 0.22, IRON, `${name}_pin`, [1, 0, 0], joint);
  cylinder(
    b,
    shifted(p, -0.12, 0, 0),
    0.095,
    0.018,
    POLYMER_HIGHLIGHT,
    `${name}_washerR`,
    [1, 0, 0],
    joint,
  );
  cylinder(
    b,
    shifted(p, 0.12, 0, 0),
    0.095,
    0.018,
    POLYMER_HIGHLIGHT,
    `${name}_washerL`,
    [1, 0, 0],
    joint,
  );
  cylinder(
    b,
    shifted(p, -0.135, 0, 0),
    0.039,
    0.025,
    accent,
    `${name}_capR`,
    [1, 0, 0],
    joint,
  );
  cylinder(
    b,
    shifted(p, 0.135, 0, 0),
    0.039,
    0.025,
    accent,
    `${name}_capL`,
    [1, 0, 0],
    joint,
  );
}

function bodyCollar(
  b: Builder,
  spine: any,
  t: number,
  index: number,
) {
  const centre = spine.at(t);
  const ring = b.ring(centre, {
    count: 10,
    radius: 0.178,
    fromDeg: 0,
    toDeg: 360,
    name: `bodyCollar${index}`,
    role: "fan",
  });
  b.sweep(polyline(ring.items, { closed: true }), 0.014, {
    color: DEEP_TEAL,
    name: `bodyCollar${index}_tube`,
    section: { ngon: 6 },
    caps: "flat",
  });
  for (const item of ring.items) {
    b.part(new THREE.SphereGeometry(0.022, 6, 4), BEACH_ORANGE, {
      frame: item,
      name: `bodyCollar${index}_stud${item.i}`,
      flat: true,
    });
  }
}

function linkageDetails(
  b: Builder,
  joints: readonly Joint[],
  side: number,
  legIndex: number,
) {
  const prefix = side > 0 ? "L" : "R";
  for (let i = 0; i < joints.length; i++) {
    const j = joints[i];
    const accent = i === 1 || i === 3 ? BEACH_ORANGE : DEEP_TEAL;
    axlePin(b, j, `leg${prefix}${legIndex}_${i}`, accent);
  }

  const foot = joints[4].at;
  box(
    b,
    point(foot.x, 0.042, foot.z + 0.09),
    [0.18, 0.045, 0.39],
    RUBBER,
    `sole${prefix}${legIndex}`,
    joints[4],
  );
  box(
    b,
    point(foot.x, 0.071, foot.z + 0.09),
    [0.155, 0.018, 0.30],
    SAND,
    `sole${prefix}${legIndex}_top`,
    joints[4],
  );
  cylinder(
    b,
    point(foot.x, 0.09, foot.z - 0.02),
    0.027,
    0.025,
    BEACH_ORANGE,
    `sole${prefix}${legIndex}_studA`,
    [0, 1, 0],
    joints[4],
  );
  cylinder(
    b,
    point(foot.x, 0.09, foot.z + 0.20),
    0.027,
    0.025,
    BEACH_ORANGE,
    `sole${prefix}${legIndex}_studB`,
    [0, 1, 0],
    joints[4],
  );
}

export default function build() {
  const b = createBuilder({
    name: "windwalker-strandbeest",
    detail: 1,
  });

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton first: one root, one long body chain, six articulated leg chains, and a wind-sail mast chain.

  const core = b.joint("core", {
    at: [0, 1.38, -1.15],
    dir: [0, 0, 1],
    role: "spine",
    group: "body",
  });

  const spinePath = catmull([
    [0, 1.38, -1.15],
    [0, 1.42, -0.62],
    [0, 1.44, 0],
    [0, 1.42, 0.62],
    [0, 1.38, 1.15],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: core,
    names: ["spine0", "spine1", "spine2", "spine3", "spine4"],
    role: "spine",
    group: "body",
  });

  const stationZ = [-0.72, 0, 0.72];
  const legs: {
    side: number;
    index: number;
    chain: any;
    points: THREE.Vector3[];
  }[] = [];

  for (const side of [1, -1]) {
    const prefix = side > 0 ? "L" : "R";
    for (let i = 0; i < stationZ.length; i++) {
      const z = stationZ[i];
      const hip = point(side * 0.56, 1.38, z);
      const crank = point(side * 0.72, 1.13, z + (side > 0 ? 0.10 : -0.10));
      const knee = point(side * 0.91, 0.91, z + 0.17);
      const ankle = point(side * 1.08, 0.27, z - 0.13);
      const foot = point(side * 1.12, 0.065, z + 0.10);

      const points = [hip, crank, knee, ankle, foot];
      const chain = b.chain(`leg${prefix}${i}`, polyline(points), {
        parent: spine.joints[i + 1],
        names: [
          `hip${prefix}${i}`,
          `crank${prefix}${i}`,
          `knee${prefix}${i}`,
          `ankle${prefix}${i}`,
          `foot${prefix}${i}`,
        ],
        role: "leg",
        group: "walking-linkage",
        contact: [foot.x, 0, foot.z],
      });

      legs.push({ side, index: i, chain, points });
    }
  }

  const mastPath = catmull([
    [0, 1.44, 0.24],
    [0, 1.83, 0.27],
    [0, 2.22, 0.29],
    [0, 2.52, 0.30],
  ]);

  const mast = b.chain("mast", mastPath, {
    parent: spine.joints[2],
    names: ["mastBase", "mastMid", "mastUpper", "mastTop"],
    role: "fan",
    group: "wind-sail",
  });

  // -------------------------------------------------------------------------------------------------------------
  // Main body tube and its longitudinal framing.

  const bodyTube = b.sweep(spine, 0.17, {
    color: POLYMER,
    name: "bodyTube",
    group: "body",
    sides: 8,
    caps: "round",
  });

  tube(
    b,
    [-0.34, 1.57, -1.08],
    [-0.34, 1.57, 1.08],
    0.037,
    POLYMER_HIGHLIGHT,
    "sideRailL",
    spine.joints[0],
  );
  tube(
    b,
    [0.34, 1.57, -1.08],
    [0.34, 1.57, 1.08],
    0.037,
    POLYMER_HIGHLIGHT,
    "sideRailR",
    spine.joints[0],
  );
  tube(
    b,
    [-0.34, 1.26, -1.02],
    [-0.34, 1.26, 1.02],
    0.026,
    BLUE_GREY,
    "lowRailL",
    spine.joints[0],
  );
  tube(
    b,
    [0.34, 1.26, -1.02],
    [0.34, 1.26, 1.02],
    0.026,
    BLUE_GREY,
    "lowRailR",
    spine.joints[0],
  );

  tube(
    b,
    [-0.34, 1.57, -1.08],
    [0, 1.44, -1.15],
    0.032,
    DEEP_TEAL,
    "rearBraceL",
    spine.joints[0],
  );
  tube(
    b,
    [0.34, 1.57, -1.08],
    [0, 1.44, -1.15],
    0.032,
    DEEP_TEAL,
    "rearBraceR",
    spine.joints[0],
  );
  tube(
    b,
    [-0.34, 1.57, 1.08],
    [0, 1.44, 1.15],
    0.032,
    DEEP_TEAL,
    "frontBraceL",
    spine.joints[3],
  );
  tube(
    b,
    [0.34, 1.57, 1.08],
    [0, 1.44, 1.15],
    0.032,
    DEEP_TEAL,
    "frontBraceR",
    spine.joints[3],
  );

  bodyCollar(b, spine, 0.14, 0);
  bodyCollar(b, spine, 0.37, 1);
  bodyCollar(b, spine, 0.63, 2);
  bodyCollar(b, spine, 0.86, 3);

  // Two polygonal bulkhead hoops make the body read as a lightweight beach machine rather than an animal torso.
  const rearHoopPath = polyline(
    [
      [-0.50, 1.20, -1.15],
      [-0.50, 1.65, -1.15],
      [0, 1.78, -1.15],
      [0.50, 1.65, -1.15],
      [0.50, 1.20, -1.15],
      [0, 1.09, -1.15],
    ],
    { closed: true },
  );
  b.sweep(rearHoopPath, 0.035, {
    color: BLUE_GREY,
    name: "rearHoop",
    bone: spine.joints[0],
    section: { ngon: 6 },
    caps: "flat",
  });

  const frontHoopPath = polyline(
    [
      [-0.50, 1.20, 1.15],
      [-0.50, 1.65, 1.15],
      [0, 1.78, 1.15],
      [0.50, 1.65, 1.15],
      [0.50, 1.20, 1.15],
      [0, 1.09, 1.15],
    ],
    { closed: true },
  );
  b.sweep(frontHoopPath, 0.035, {
    color: BLUE_GREY,
    name: "frontHoop",
    bone: spine.joints[3],
    section: { ngon: 6 },
    caps: "flat",
  });

  // -------------------------------------------------------------------------------------------------------------
  // Three transverse crank axles, each with visible wheel, hub, and offset crank arm.

  for (let i = 0; i < stationZ.length; i++) {
    const z = stationZ[i];
    const stationBone = spine.joints[i + 1];

    tube(
      b,
      [-0.73, 1.42, z],
      [0.73, 1.42, z],
      0.047,
      POLYMER,
      `crossbar${i}`,
      stationBone,
    );

    for (const side of [1, -1]) {
      const prefix = side > 0 ? "L" : "R";
      const wheelAt = point(side * 0.69, 1.42, z);
      cylinder(
        b,
        wheelAt,
        0.125,
        0.064,
        DEEP_TEAL,
        `crankWheel${prefix}${i}`,
        [1, 0, 0],
        stationBone,
      );
      cylinder(
        b,
        shifted(wheelAt, side * 0.038, 0, 0),
        0.082,
        0.075,
        POLYMER_HIGHLIGHT,
        `crankWheel${prefix}${i}_face`,
        [1, 0, 0],
        stationBone,
      );
      cylinder(
        b,
        shifted(wheelAt, side * 0.082, 0, 0),
        0.035,
        0.025,
        BEACH_ORANGE,
        `crankWheel${prefix}${i}_hub`,
        [1, 0, 0],
        stationBone,
      );

      const crankPin = point(
        side * 0.74,
        1.14,
        z + (side > 0 ? 0.10 : -0.10),
      );
      tube(
        b,
        shifted(wheelAt, side * 0.07, 0, 0),
        crankPin,
        0.027,
        BEACH_ORANGE,
        `crankArm${prefix}${i}`,
        stationBone,
      );
      sphere(
        b,
        crankPin,
        0.043,
        POLYMER_HIGHLIGHT,
        `crankPin${prefix}${i}`,
        stationBone,
      );
    }

    tube(
      b,
      [-0.34, 1.57, z],
      [-0.34, 1.27, z],
      0.028,
      TEAL,
      `verticalFrameL${i}`,
      stationBone,
    );
    tube(
      b,
      [0.34, 1.57, z],
      [0.34, 1.27, z],
      0.028,
      TEAL,
      `verticalFrameR${i}`,
      stationBone,
    );
  }

  // Small vertical body fins and capped top rail keep the silhouette airy and mechanical.
  tube(
    b,
    [-0.31, 1.61, -1.02],
    [-0.31, 1.61, 1.02],
    0.022,
    SAND,
    "upperRailL",
    spine.joints[0],
  );
  tube(
    b,
    [0.31, 1.61, -1.02],
    [0.31, 1.61, 1.02],
    0.022,
    SAND,
    "upperRailR",
    spine.joints[0],
  );

  // -------------------------------------------------------------------------------------------------------------
  // The six Jansen-style articulated leg assemblies.

  for (const leg of legs) {
    const side = leg.side;
    const i = leg.index;
    const prefix = side > 0 ? "L" : "R";
    const joints = leg.chain.joints as Joint[];
    const [hip, crank, knee, ankle, foot] = joints;

    b.sweep(leg.chain, [0.060, 0.056], {
      color: POLYMER,
      name: `legTube${prefix}${i}`,
      group: "walking-linkage",
      skin: "rigid",
      section: { ngon: 6 },
      caps: "round",
    });

    // The long upper and lower struts form the characteristic triangular walking profile.
    tube(
      b,
      hip,
      knee,
      0.047,
      POLYMER_HIGHLIGHT,
      `upperStrut${prefix}${i}`,
      hip,
    );
    tube(
      b,
      knee,
      foot,
      0.048,
      POLYMER,
      `lowerStrut${prefix}${i}`,
      knee,
    );

    // Rear diagonal and crank follower are deliberately darker to expose the linkage graph.
    tube(
      b,
      hip,
      ankle,
      0.039,
      BLUE_GREY,
      `rearStrut${prefix}${i}`,
      hip,
    );
    tube(
      b,
      crank,
      ankle,
      0.040,
      DEEP_TEAL,
      `followerStrut${prefix}${i}`,
      crank,
    );
    tube(
      b,
      crank,
      foot,
      0.034,
      BEACH_ORANGE,
      `toeLink${prefix}${i}`,
      crank,
    );

    // A separate broad foot tube gives each leg a clear contact line and a slight forward/backward sweep.
    tube(
      b,
      point(foot.at.x, 0.078, foot.at.z - 0.19),
      point(foot.at.x, 0.078, foot.at.z + 0.34),
      0.050,
      POLYMER_HIGHLIGHT,
      `footTube${prefix}${i}`,
      foot,
    );
    linkageDetails(b, joints, side, i);

    // Orange bands are placed as small collars on the two visually important linkage rods.
    const upperBandA = shifted(hip.at, (knee.at.x - hip.at.x) * 0.42, (knee.at.y - hip.at.y) * 0.42, (knee.at.z - hip.at.z) * 0.42);
    const upperBandB = shifted(hip.at, (knee.at.x - hip.at.x) * 0.50, (knee.at.y - hip.at.y) * 0.50, (knee.at.z - hip.at.z) * 0.50);
    flatTube(
      b,
      upperBandA,
      upperBandB,
      0.060,
      BEACH_ORANGE,
      `upperBand${prefix}${i}`,
      hip,
    );

    const lowerBandA = shifted(knee.at, (foot.at.x - knee.at.x) * 0.57, (foot.at.y - knee.at.y) * 0.57, (foot.at.z - knee.at.z) * 0.57);
    const lowerBandB = shifted(knee.at, (foot.at.x - knee.at.x) * 0.64, (foot.at.y - knee.at.y) * 0.64, (foot.at.z - knee.at.z) * 0.64);
    flatTube(
      b,
      lowerBandA,
      lowerBandB,
      0.060,
      DEEP_TEAL,
      `lowerBand${prefix}${i}`,
      knee,
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Wind mast and sail frame.

  b.sweep(mast, [0.060, 0.038], {
    color: POLYMER_HIGHLIGHT,
    name: "mastTube",
    group: "wind-sail",
    section: { ngon: 6 },
    caps: "round",
  });

  tube(
    b,
    [-0.68, 1.76, 0.28],
    [0.68, 1.76, 0.28],
    0.034,
    DEEP_TEAL,
    "sailLowerBar",
    mast.joints[1],
  );
  tube(
    b,
    [-0.48, 2.42, 0.30],
    [0.48, 2.42, 0.30],
    0.032,
    DEEP_TEAL,
    "sailUpperBar",
    mast.joints[2],
  );
  tube(
    b,
    [-0.68, 1.76, 0.28],
    [-0.48, 2.42, 0.30],
    0.027,
    BLUE_GREY,
    "sailEdgeL",
    mast.joints[1],
  );
  tube(
    b,
    [0.68, 1.76, 0.28],
    [0.48, 2.42, 0.30],
    0.027,
    BLUE_GREY,
    "sailEdgeR",
    mast.joints[1],
  );

  tube(
    b,
    [-0.30, 1.76, 0.29],
    [-0.23, 2.42, 0.30],
    0.020,
    POLYMER,
    "sailRibL",
    mast.joints[1],
  );
  tube(
    b,
    [0.30, 1.76, 0.29],
    [0.23, 2.42, 0.30],
    0.020,
    POLYMER,
    "sailRibR",
    mast.joints[1],
  );
  tube(
    b,
    [0, 1.76, 0.30],
    [0, 2.52, 0.30],
    0.024,
    POLYMER_HIGHLIGHT,
    "sailCentreRib",
    mast.joints[2],
  );

  const sailPanel = b.extrude(
    [
      [-0.63, 0, "sharp"],
      [0.63, 0, "sharp"],
      [0.43, 0.55, "sharp"],
      [0.14, 0.78, "sharp"],
      [-0.20, 0.78, "sharp"],
      [-0.52, 0.52, "sharp"],
    ],
    {
      at: [0, 1.77, 0.315],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.020,
      bevel: 0.003,
      color: POLYMER_HIGHLIGHT,
      bone: mast.joints[1],
      name: "sailPanel",
      group: "wind-sail",
    },
  );

  // A darker back edge makes the thin sail readable from the side without adding scenery.
  tube(
    b,
    [-0.63, 1.77, 0.30],
    [0.63, 1.77, 0.30],
    0.018,
    SAND,
    "sailBottomEdge",
    mast.joints[1],
  );

  // Mast foot braces echo the diagonal tubes used in the legs.
  tube(
    b,
    [-0.07, 1.46, 0.24],
    [-0.48, 1.78, 0.28],
    0.030,
    BLUE_GREY,
    "mastBraceL",
    spine.joints[2],
  );
  tube(
    b,
    [0.07, 1.46, 0.24],
    [0.48, 1.78, 0.28],
    0.030,
    BLUE_GREY,
    "mastBraceR",
    spine.joints[2],
  );

  // Crown cap and a small faceted bead reserve the mast top for the later pennant.
  cylinder(
    b,
    mast.joints[3],
    0.072,
    0.17,
    DEEP_TEAL,
    "mastCrownCap",
    [0, 1, 0],
    mast.joints[3],
  );
  sphere(
    b,
    shifted(mast.joints[3].at, 0, 0.11, 0),
    0.075,
    BEACH_ORANGE,
    "mastCrownBead",
    mast.joints[3],
  );

  // -------------------------------------------------------------------------------------------------------------
  // Extra mechanical language: small body studs, bearing blocks, and repeated axle braces.

  for (let i = 0; i < 5; i++) {
    const p = spine.joints[i].at;
    for (const side of [1, -1]) {
      const prefix = side > 0 ? "L" : "R";
      cylinder(
        b,
        [side * 0.205, p.y + 0.005, p.z],
        0.032,
        0.022,
        BEACH_ORANGE,
        `bodyBearing${prefix}${i}`,
        [1, 0, 0],
        spine.joints[i],
      );
    }
  }

  for (const z of [-0.95, -0.48, 0.48, 0.95]) {
    tube(
      b,
      [-0.40, 1.48, z],
      [0.40, 1.48, z],
      0.018,
      SAND,
      `bodyLash${z < 0 ? "B" : "F"}${Math.round(Math.abs(z) * 100)}`,
      spine.joints[2],
    );
  }

  // A small pair of rear skids prevents the lowest rear frame from visually floating above the sand.
  tube(
    b,
    [-0.42, 0.20, -1.13],
    [-0.42, 0.075, -0.93],
    0.030,
    BLUE_GREY,
    "rearSkidL",
    spine.joints[0],
  );
  tube(
    b,
    [0.42, 0.20, -1.13],
    [0.42, 0.075, -0.93],
    0.030,
    BLUE_GREY,
    "rearSkidR",
    spine.joints[0],
  );

  for (const side of [1, -1]) {
    const prefix = side > 0 ? "L" : "R";
    tube(
      b,
      [side * 0.39, 1.67, -0.98],
      [side * 0.39, 1.67, -0.52],
      0.022,
      TEAL,
      `sideUpright${prefix}0`,
      spine.joints[0],
    );
    tube(
      b,
      [side * 0.39, 1.67, 0.52],
      [side * 0.39, 1.67, 0.98],
      0.022,
      TEAL,
      `sideUpright${prefix}1`,
      spine.joints[3],
    );
  }

  // A few broad, separate flat facets give the otherwise tubular machine a memorable painted silhouette.
  box(
    b,
    [0, 1.56, -0.78],
    [0.36, 0.11, 0.18],
    SAND,
    "rearServiceBlock",
    spine.joints[1],
  );
  box(
    b,
    [0, 1.56, 0.78],
    [0.36, 0.11, 0.18],
    SAND,
    "frontServiceBlock",
    spine.joints[3],
  );
  box(
    b,
    [0, 1.58, 0.04],
    [0.25, 0.13, 0.16],
    DEEP_TEAL,
    "centralServiceBlock",
    spine.joints[2],
  );

  // Stage 2 may append geometry and textures here.
  for (const add of STAGE2) add(b);

  return b.root;
}
