<!-- call: stage1 -->

```ts
import * as THREE from "three";
import { createBuilder, catmull, polyline } from "agentic-3js-builder";
import type { Builder, Joint } from "agentic-3js-builder";

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
```

<!-- call: texture -->

bodyWeathering — Paint the body with ivory polymer, sand-lit upper facets, blue-grey underside facets, and three restrained teal maintenance bands around the crank stations.  
sailWeathering — Paint the sail with cream and muted straw panels plus sparse orange perimeter seam strips, leaving the centre visually open.  
linkagePalette — Paint `legTubeL0` with pale polymer, blue-grey lower links, an orange crank section, and dark underside facets while retaining the hard faceted look.

<<<<<<< SEARCH
import { createBuilder, catmull, polyline } from "agentic-3js-builder";
=======
import { createBuilder, catmull, paint, polyline } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  const b = createBuilder({
    name: "windwalker-strandbeest",
    detail: 1,
  });

  // -------------------------------------------------------------------------------------------------------------
=======
  const b = createBuilder({
    name: "windwalker-strandbeest",
    detail: 1,
  });

  const BODY_WEATHERING = paint((_p, n, s) => {
    const t = s[0];
    const maintenanceBand =
      Math.abs(t - 0.22) < 0.035 ||
      Math.abs(t - 0.50) < 0.035 ||
      Math.abs(t - 0.78) < 0.035;
    if (maintenanceBand) return DEEP_TEAL;
    if (n.y > 0.42) return SAND;
    if (n.y < -0.24) return BLUE_GREY;
    return POLYMER;
  });

  const SAIL_WEATHERING = paint((_p, _n, s) => {
    const x = s[0];
    const y = s[1];
    const orangeSeam =
      (y < 0.035 || y > 0.745) && Math.abs(x) > 0.18;
    if (orangeSeam) return BEACH_ORANGE;
    if ((x < -0.34 || x > 0.34) && y > 0.10) return SAND;
    return POLYMER_HIGHLIGHT;
  });

  const LINKAGE_PALETTE = paint((_p, n, s) => {
    const t = s[0];
    if (n.y < -0.28) return RUBBER;
    if (t > 0.16 && t < 0.29) return BEACH_ORANGE;
    if (t > 0.52) return BLUE_GREY;
    return POLYMER_HIGHLIGHT;
  });

  // -------------------------------------------------------------------------------------------------------------
>>>>>>> REPLACE

<<<<<<< SEARCH
  const bodyTube = b.sweep(spine, 0.17, {
    color: POLYMER,
    name: "bodyTube",
=======
  const bodyTube = b.sweep(spine, 0.17, {
    color: BODY_WEATHERING,
    name: "bodyTube",
>>>>>>> REPLACE

<<<<<<< SEARCH
      color: POLYMER,
      bone: mast.joints[1],
      name: "sailPanel",
=======
      color: SAIL_WEATHERING,
      bone: mast.joints[1],
      name: "sailPanel",
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(leg.chain, [0.060, 0.056], {
      color: POLYMER,
      name: `legTube${prefix}${i}`,
=======
    b.sweep(leg.chain, [0.060, 0.056], {
      color: side > 0 && i === 0 ? LINKAGE_PALETTE : POLYMER,
      name: `legTube${prefix}${i}`,
>>>>>>> REPLACE

<!-- call: add1 -->

```ts
import * as THREE from "three";
import { polyline, type Builder } from "agentic-3js-builder";

export function addSailWindMarks(b: Builder) {
  const sailSurface = b.surface(b.root);

  // Query the actual stage-one sail instead of guessing its front offset.
  const sailPoint = (x: number, y: number, lift: number) => {
    const hit = sailSurface.nearest([x, y, 0.35]);
    return hit.moved([0, lift, 0]).at.clone();
  };

  type Chevron = {
    x: number;
    y: number;
    scale: number;
    color: string;
  };

  const chevrons: Chevron[] = [
    { x: -0.27, y: 1.91, scale: 1.0, color: BEACH_ORANGE },
    { x: -0.045, y: 2.055, scale: 0.92, color: DEEP_TEAL },
    { x: 0.095, y: 2.205, scale: 0.72, color: BEACH_ORANGE },
  ];

  const arrowOutline = (scale: number): [number, number, "sharp"][] => [
    [-0.16 * scale, -0.085 * scale, "sharp"],
    [-0.102 * scale, -0.085 * scale, "sharp"],
    [0.13 * scale, 0, "sharp"],
    [-0.102 * scale, 0.085 * scale, "sharp"],
    [-0.16 * scale, 0.085 * scale, "sharp"],
    [-0.012 * scale, 0, "sharp"],
  ];

  // Precompute every surface point before adding any markings, so later queries
  // cannot accidentally land on an earlier decal.
  const markPlacements = chevrons.map((mark) => ({
    mark,
    dark: sailPoint(mark.x, mark.y, 0.006),
    color: sailPoint(mark.x, mark.y, 0.014),
    highlight: sailPoint(mark.x - 0.068 * mark.scale, mark.y + 0.052 * mark.scale, 0.019),
    rivets: [
      sailPoint(mark.x - 0.122 * mark.scale, mark.y, 0.022),
      sailPoint(mark.x + 0.108 * mark.scale, mark.y, 0.022),
    ],
  }));

  // Two fine curved wind trails sit behind the broad painted chevrons.
  const trailA = [
    sailPoint(-0.56, 1.82, 0.007),
    sailPoint(-0.45, 1.825, 0.007),
    sailPoint(-0.34, 1.845, 0.007),
    sailPoint(-0.235, 1.885, 0.007),
  ];
  const trailB = [
    sailPoint(-0.005, 2.005, 0.007),
    sailPoint(0.13, 2.025, 0.007),
    sailPoint(0.285, 2.012, 0.007),
    sailPoint(0.425, 1.965, 0.007),
  ];

  // A framed spiral emblem occupies the open upper-right portion of the sail.
  const emblemX = 0.315;
  const emblemY = 2.285;
  const spiralCount = 28;
  const darkSpiral: THREE.Vector3[] = [];
  const orangeSpiral: THREE.Vector3[] = [];

  for (let i = 0; i < spiralCount; i++) {
    const t = i / (spiralCount - 1);
    const angle = t * Math.PI * 4.6;
    const radius = 0.069 * (1 - t) + 0.006;
    const x = emblemX + Math.cos(angle) * radius;
    const y = emblemY + Math.sin(angle) * radius;
    darkSpiral.push(sailPoint(x, y, 0.014));

    const innerRadius = radius * 0.48;
    orangeSpiral.push(
      sailPoint(
        emblemX + Math.cos(angle) * innerRadius,
        emblemY + Math.sin(angle) * innerRadius,
        0.022,
      ),
    );
  }

  const emblemFrame = sailPoint(emblemX, emblemY, 0.009);
  const emblemCentre = sailPoint(emblemX, emblemY, 0.026);

  // Dark under-print gives each symbol a crisp mechanical outline.
  for (const { mark, dark, color, highlight } of markPlacements) {
    b.extrude(arrowOutline(mark.scale * 1.19), {
      at: dark,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.010,
      bevel: 0.0015,
      color: DARK_INK,
      bone: "mastMid",
      name: `s21_chevronOutline_${mark.y.toFixed(2)}`,
      group: "sail-wind-marks",
    });

    b.extrude(arrowOutline(mark.scale), {
      at: color,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.010,
      bevel: 0.001,
      color: mark.color,
      bone: "mastMid",
      name: `s21_chevron_${mark.y.toFixed(2)}`,
      group: "sail-wind-marks",
    });

    // Small pale facet on the upper arm makes the painted mark read as a
    // raised, sunlit polymer applique rather than a flat sticker.
    b.extrude(
      [
        [-0.045 * mark.scale, -0.009 * mark.scale, "sharp"],
        [0.055 * mark.scale, -0.009 * mark.scale, "sharp"],
        [0.072 * mark.scale, 0.002 * mark.scale, "sharp"],
        [-0.041 * mark.scale, 0.014 * mark.scale, "sharp"],
      ],
      {
        at: highlight,
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.006,
        bevel: 0.001,
        color: POLYMER_HIGHLIGHT,
        bone: "mastMid",
        name: `s21_chevronHighlight_${mark.y.toFixed(2)}`,
        group: "sail-wind-marks",
      },
    );
  }

  b.sweep(polyline(trailA), 0.008, {
    color: DEEP_TEAL,
    bone: "mastMid",
    caps: "round",
    section: { ngon: 6 },
    name: "s21_windTrailLower",
    group: "sail-wind-marks",
  });

  b.sweep(polyline(trailB), 0.006, {
    color: BEACH_ORANGE,
    bone: "mastMid",
    caps: "round",
    section: { ngon: 6 },
    name: "s21_windTrailUpper",
    group: "sail-wind-marks",
  });

  for (const { rivets } of markPlacements) {
    for (let i = 0; i < rivets.length; i++) {
      b.part(
        new THREE.CylinderGeometry(0.014, 0.014, 0.010, 8),
        i === 0 ? DEEP_TEAL : BEACH_ORANGE,
        {
          at: rivets[i],
          dir: [0, 0, 1],
          bone: "mastMid",
          flat: true,
          name: `s21_chevronRivet_${i}_${rivets[i].y.toFixed(2)}`,
          group: "sail-wind-marks",
        },
      );
    }
  }

  b.part(new THREE.TorusGeometry(0.073, 0.0065, 6, 20), DARK_INK, {
    at: emblemFrame,
    dir: [0, 0, 1],
    axis: "z",
    bone: "mastMid",
    flat: true,
    name: "s21_spiralFrame",
    group: "sail-wind-marks",
  });

  b.sweep(polyline(darkSpiral), 0.010, {
    color: DARK_INK,
    bone: "mastMid",
    caps: "round",
    section: { ngon: 6 },
    name: "s21_spiralOutline",
    group: "sail-wind-marks",
  });

  b.sweep(polyline(orangeSpiral), 0.0055, {
    color: BEACH_ORANGE,
    bone: "mastMid",
    caps: "round",
    section: { ngon: 6 },
    name: "s21_spiralFill",
    group: "sail-wind-marks",
  });

  b.part(new THREE.SphereGeometry(0.017, 8, 5), SUN_YELLOW, {
    at: emblemCentre,
    bone: "mastMid",
    flat: true,
    name: "s21_spiralCentre",
    group: "sail-wind-marks",
  });
}
```

<!-- call: add2 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addMastPennant(b: Builder) {
  const group = "stage2-wind-details";

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name: string,
    bone: any,
  ) =>
    b.rod(a, c, radius, {
      color,
      bone,
      name,
      group,
      caps: "round",
      section: { ngon: 6 },
    });

  const cylinder = (
    at: [number, number, number],
    radius: number,
    length: number,
    color: string,
    name: string,
    dir: [number, number, number],
    bone: any,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, length, 8), color, {
      at,
      dir,
      bone,
      name,
      group,
      flat: true,
    });

  const panel = (
    outline: any[],
    at: [number, number, number],
    color: string,
    name: string,
    bone: any,
    x: [number, number, number] = [1, 0, 0],
    y: [number, number, number] = [0, 1, 0],
    thickness = 0.012,
  ) =>
    b.extrude(outline, {
      at,
      x,
      y,
      thickness,
      bevel: 0.002,
      smoothing: 0,
      color,
      bone,
      name,
      group,
    });

  // -------------------------------------------------------------------------------------------------------------
  // Pennant: four alternating canvas wedges, a dark hem, a crown cap, and a small hanging ribbon.

  const pennantBone = "mastTop";
  const flagOrigin: [number, number, number] = [0, 2.38, 0.335];
  const flagWidth = 0.36;
  const stripeWidth = flagWidth / 4;

  const lower = (x: number) => 0.12 * (x / flagWidth);
  const upper = (x: number) => 0.24 - 0.12 * (x / flagWidth);

  for (let i = 0; i < 4; i++) {
    const x0 = i * stripeWidth;
    const x1 = (i + 1) * stripeWidth;
    panel(
      [
        [x0, lower(x0), "sharp"],
        [x1, lower(x1), "sharp"],
        [x1, upper(x1), "sharp"],
        [x0, upper(x0), "sharp"],
      ],
      flagOrigin,
      i % 2 === 0 ? BEACH_ORANGE : SUN_YELLOW,
      `s22PennantStripe${i}`,
      pennantBone,
      [1, 0, 0],
      [0, 1, 0],
      0.014,
    );
  }

  // Slim dark perimeter members make the cloth read clearly against the pale mast.
  rod(
    [0, 2.38, 0.35],
    [0.36, 2.50, 0.35],
    0.008,
    DARK_INK,
    "s22PennantLowerHem",
    pennantBone,
  );
  rod(
    [0, 2.62, 0.35],
    [0.36, 2.50, 0.35],
    0.008,
    DARK_INK,
    "s22PennantUpperHem",
    pennantBone,
  );
  for (let i = 1; i < 4; i++) {
    const x = i * stripeWidth;
    rod(
      [x, 2.38 + lower(x), 0.35],
      [x, 2.38 + upper(x), 0.35],
      0.0045,
      DARK_INK,
      `s22PennantSeam${i}`,
      pennantBone,
    );
  }

  // Tiny orange seam rivets at the mast-side edge.
  for (const y of [2.405, 2.595]) {
    b.part(new THREE.SphereGeometry(0.014, 6, 4), BEACH_ORANGE, {
      at: [0.012, y, 0.353],
      bone: pennantBone,
      name: `s22PennantRivet${y}`,
      group,
      flat: true,
    });
  }

  // A short dark cap sits over the existing orange mast bead.
  cylinder(
    [0, 2.615, 0.30],
    0.078,
    0.045,
    DARK_INK,
    "s22PennantDarkCap",
    [0, 1, 0],
    pennantBone,
  );
  cylinder(
    [0, 2.642, 0.30],
    0.046,
    0.018,
    BEACH_ORANGE,
    "s22PennantCapBand",
    [0, 1, 0],
    pennantBone,
  );

  // A narrow wind ribbon hangs below the mast-side corner of the pennant.
  panel(
    [
      [0, 0, "sharp"],
      [0.024, 0, "sharp"],
      [0.018, -0.029, "sharp"],
      [0.031, -0.061, "sharp"],
      [0.007, -0.070, "sharp"],
      [-0.006, -0.045, "sharp"],
    ],
    [0.025, 2.455, 0.348],
    BEACH_ORANGE,
    "s22PennantWindRibbon",
    pennantBone,
    [1, 0, 0],
    [0, 1, 0],
    0.009,
  );
  rod(
    [0.024, 2.455, 0.354],
    [0.024, 2.390, 0.354],
    0.0035,
    SUN_YELLOW,
    "s22PennantRibbonEdge",
    pennantBone,
  );

  // -------------------------------------------------------------------------------------------------------------
  // Front nose vane: a child hinge joint makes the little wind rotor an explicit articulated mechanism.

  const vaneCentre: [number, number, number] = [0, 1.48, 1.242];
  const vane = b.joint("s22noseVane", {
    parent: "spine3",
    at: vaneCentre,
    dir: [1, 0, 0],
    role: "hinge",
    group,
  });

  // Axle and layered side washers.
  cylinder(
    vaneCentre,
    0.026,
    0.47,
    IRON,
    "s22VaneAxle",
    [1, 0, 0],
    vane,
  );
  cylinder(
    [-0.238, 1.48, 1.242],
    0.050,
    0.025,
    DEEP_TEAL,
    "s22VaneBackWasher",
    [1, 0, 0],
    vane,
  );
  cylinder(
    [0.238, 1.48, 1.242],
    0.050,
    0.025,
    DEEP_TEAL,
    "s22VaneFrontWasher",
    [1, 0, 0],
    vane,
  );

  const bladeA: [number, number, "sharp"][] = [
    [-0.012, 0.000, "sharp"],
    [0.014, 0.010, "sharp"],
    [0.078, 0.103, "sharp"],
    [0.066, 0.132, "sharp"],
    [0.036, 0.119, "sharp"],
    [-0.024, 0.025, "sharp"],
  ];
  const bladeB: [number, number, "sharp"][] = bladeA.map(([x, y]) => [
    -x,
    -y,
    "sharp",
  ]);

  // In these panels local x is world +Z and local y is world +Y, so the vane spins about world X.
  panel(
    bladeA,
    vaneCentre,
    BEACH_ORANGE,
    "s22VaneBladeA",
    vane,
    [0, 0, 1],
    [0, 1, 0],
    0.016,
  );
  panel(
    bladeB,
    vaneCentre,
    SUN_YELLOW,
    "s22VaneBladeB",
    vane,
    [0, 0, 1],
    [0, 1, 0],
    0.016,
  );

  // Dark blade spines and contrasting outer caps add a machined, replaceable-paddle character.
  rod(
    [0, 1.48, 1.242],
    [0, 1.612, 1.320],
    0.009,
    DARK_INK,
    "s22VaneBladeSpineA",
    vane,
  );
  rod(
    [0, 1.48, 1.242],
    [0, 1.348, 1.164],
    0.009,
    DARK_INK,
    "s22VaneBladeSpineB",
    vane,
  );

  cylinder(
    [0, 1.612, 1.320],
    0.023,
    0.022,
    DEEP_TEAL,
    "s22VaneTipA",
    [1, 0, 0],
    vane,
  );
  cylinder(
    [0, 1.348, 1.164],
    0.023,
    0.022,
    DEEP_TEAL,
    "s22VaneTipB",
    [1, 0, 0],
    vane,
  );

  // Layered orange hub, cream face washer, and a tiny dark centre pin.
  b.part(new THREE.SphereGeometry(0.056, 8, 5), BEACH_ORANGE, {
    at: vaneCentre,
    bone: vane,
    name: "s22VaneOrangeHub",
    group,
    flat: true,
  });
  cylinder(
    [0.050, 1.48, 1.242],
    0.041,
    0.018,
    POLYMER_HIGHLIGHT,
    "s22VaneFaceWasher",
    [1, 0, 0],
    vane,
  );
  cylinder(
    [0.064, 1.48, 1.242],
    0.017,
    0.022,
    DARK_INK,
    "s22VaneCentrePin",
    [1, 0, 0],
    vane,
  );

  // Four tiny pale service studs on the visible paddle faces.
  for (const [x, y, name] of [
    [0.050, 1.545, "A"],
    [0.060, 1.575, "B"],
    [-0.050, 1.415, "C"],
    [-0.060, 1.385, "D"],
  ] as const) {
    b.part(new THREE.SphereGeometry(0.010, 6, 4), POLYMER_HIGHLIGHT, {
      at: [0.012, y, 1.242 + x],
      bone: vane,
      name: `s22VaneStud${name}`,
      group,
      flat: true,
    });
  }
}
```

<!-- call: add3 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addCrankHubCaps(b: Builder) {
  const stations = [-0.72, 0, 0.72];
  const tau = Math.PI * 2;
  const crankPhases = [2.72, 3.18, 2.52];

  const disc = (
    at: [number, number, number],
    radius: number,
    length: number,
    color: string,
    dir: [number, number, number],
    name: string,
    bone: string,
    segments = 12,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, length, segments), color, {
      at,
      dir,
      bone,
      name,
      group: "stage2-crank-hubs",
      flat: true,
    });

  const bead = (
    at: [number, number, number],
    radius: number,
    color: string,
    name: string,
    bone: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 6, 4), color, {
      at,
      bone,
      name,
      group: "stage2-crank-hubs",
      flat: true,
    });

  for (let station = 0; station < stations.length; station++) {
    const z = stations[station];
    const stationBone = `spine${station + 1}`;

    for (const side of [1, -1]) {
      const sideName = side > 0 ? "L" : "R";
      const dir: [number, number, number] = [side, 0, 0];
      const wheelX = side * 0.69;

      // The wheel body ends at x = ±0.722. The cap begins just inside that
      // boundary and projects outward, so no visible gap appears when posed.
      const capX = side * 0.733;
      disc(
        [capX, 1.42, z],
        0.108,
        0.024,
        DEEP_TEAL,
        dir,
        `s23_cap_${sideName}${station}`,
        stationBone,
        12,
      );

      // A shallow grey-blue shoulder makes the cap read as a separate bearing
      // rather than a flat colour painted over the original wheel.
      disc(
        [side * 0.749, 1.42, z],
        0.081,
        0.010,
        BLUE_GREY,
        dir,
        `s23_shoulder_${sideName}${station}`,
        stationBone,
        12,
      );

      // Cream washer, deliberately smaller than the original wheel face so the
      // dark teal cap remains visible as a broad ring.
      disc(
        [side * 0.758, 1.42, z],
        0.064,
        0.014,
        POLYMER_HIGHLIGHT,
        dir,
        `s23_washer_${sideName}${station}`,
        stationBone,
        12,
      );

      const mirroredPhase = side > 0 ? crankPhases[station] : -crankPhases[station];
      const pinRadius = 0.056;
      const pinY = 1.42 + Math.cos(mirroredPhase) * pinRadius;
      const pinZ = z + Math.sin(mirroredPhase) * pinRadius;

      // Dark socket under the orange crank pin.
      disc(
        [side * 0.769, pinY, pinZ],
        0.030,
        0.012,
        DARK_INK,
        dir,
        `s23_pinSocket_${sideName}${station}`,
        stationBone,
        8,
      );

      // Offset pin barrel and rounded head.
      disc(
        [side * 0.780, pinY, pinZ],
        0.019,
        0.023,
        BEACH_ORANGE,
        dir,
        `s23_crankPin_${sideName}${station}`,
        stationBone,
        8,
      );
      bead(
        [side * 0.794, pinY, pinZ],
        0.024,
        BEACH_ORANGE,
        `s23_crankPinHead_${sideName}${station}`,
        stationBone,
      );

      // Three tiny cream rivets around each cap. They are spaced away from the
      // offset pin and make the otherwise simple cap feel manufactured.
      const rivetStart = mirroredPhase + Math.PI * 0.72;
      for (let r = 0; r < 3; r++) {
        const a = rivetStart + (r * tau) / 3;
        const rivetRadius = 0.084;
        bead(
          [
            side * 0.771,
            1.42 + Math.cos(a) * rivetRadius,
            z + Math.sin(a) * rivetRadius,
          ],
          0.010,
          POLYMER_HIGHLIGHT,
          `s23_rivet_${sideName}${station}_${r}`,
          stationBone,
        );
      }

      // A slim orange witness mark on the outer rim reinforces the crank phase
      // without filling the wheel face.
      const markA = mirroredPhase + 0.12;
      const markB = mirroredPhase - 0.12;
      const markRadius = 0.101;
      b.rod(
        [
          side * 0.771,
          1.42 + Math.cos(markA) * markRadius,
          z + Math.sin(markA) * markRadius,
        ],
        [
          side * 0.771,
          1.42 + Math.cos(markB) * markRadius,
          z + Math.sin(markB) * markRadius,
        ],
        0.006,
        {
          color: BEACH_ORANGE,
          bone: stationBone,
          name: `s23_phaseMark_${sideName}${station}`,
          group: "stage2-crank-hubs",
          caps: "round",
          section: { ngon: 6 },
        },
      );
    }
  }
}
```

<!-- call: add4 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addFootSandPaddles(b: Builder) {
  const stations = [-0.72, 0, 0.72];

  const addCylinder = (
    at: [number, number, number],
    radius: number,
    depth: number,
    color: string,
    bone: string,
    name: string,
    dir: [number, number, number],
  ) => {
    b.part(new THREE.CylinderGeometry(radius, radius, depth, 8, 1), color, {
      at,
      bone,
      dir,
      name,
      flat: true,
    });
  };

  const addBox = (
    at: [number, number, number],
    size: [number, number, number],
    color: string,
    bone: string,
    name: string,
  ) => {
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      name,
      flat: true,
    });
  };

  // Broad orange sand paddles, heel bands, studs, and one raised toe tread per foot.
  for (const side of [1, -1]) {
    const prefix = side > 0 ? "L" : "R";

    for (let i = 0; i < stations.length; i++) {
      const z = stations[i] + 0.1;
      const x = side * 1.12;
      const bone = `foot${prefix}${i}`;

      b.extrude(
        [
          [-0.12, -0.20],
          [-0.105, -0.23],
          [0.105, -0.23],
          [0.12, -0.20],
          [0.12, 0.20],
          [0.105, 0.23],
          [-0.105, 0.23],
          [-0.12, 0.20],
        ],
        {
          at: [x, 0.047, z],
          x: [1, 0, 0],
          y: [0, 0, 1],
          thickness: 0.042,
          bevel: 0.009,
          smoothing: 1,
          color: BEACH_ORANGE,
          bone,
          name: `s24_paddle${prefix}${i}`,
          group: "sand-paddles",
        },
      );

      const heelZ = z - 0.145;
      addBox(
        [x, 0.077, heelZ],
        [0.232, 0.014, 0.064],
        DEEP_TEAL,
        bone,
        `s24_heelBand${prefix}${i}`,
      );

      // Two cream studs sit across the heel band.
      for (const sx of [-0.068, 0.068]) {
        addCylinder(
          [x + sx, 0.091, heelZ],
          0.018,
          0.014,
          POLYMER_HIGHLIGHT,
          bone,
          `s24_paddleStud${prefix}${i}_${sx < 0 ? "A" : "B"}`,
          [0, 1, 0],
        );
      }

      // A single raised toe rib gives the paddle a practical, carved tread silhouette.
      addBox(
        [x, 0.076, z + 0.185],
        [0.205, 0.014, 0.026],
        DEEP_TEAL,
        bone,
        `s24_toeRib${prefix}${i}`,
      );
    }
  }

  // Layered side-facing washers on every knee and ankle, mirrored for both sides.
  for (const side of [1, -1]) {
    const prefix = side > 0 ? "L" : "R";

    for (let i = 0; i < stations.length; i++) {
      const station = stations[i];

      const joints = [
        {
          kind: "knee",
          name: `knee${prefix}${i}`,
          at: [side * 0.91, 0.91, station + 0.17] as [number, number, number],
        },
        {
          kind: "ankle",
          name: `ankle${prefix}${i}`,
          at: [side * 1.08, 0.27, station - 0.13] as [number, number, number],
        },
      ];

      for (const joint of joints) {
        const [jx, jy, jz] = joint.at;
        const outward = (distance: number): [number, number, number] => [
          jx + side * distance,
          jy,
          jz,
        ];

        // Two dark backing discs create the deep, mechanical washer stack.
        addCylinder(
          outward(0.055),
          0.078,
          0.014,
          DARK_INK,
          joint.name,
          `s24_${joint.kind}WasherDarkA_${prefix}${i}`,
          [side, 0, 0],
        );
        addCylinder(
          outward(0.079),
          0.070,
          0.014,
          RUBBER,
          joint.name,
          `s24_${joint.kind}WasherDarkB_${prefix}${i}`,
          [side, 0, 0],
        );

        // A low-poly torus leaves the dark centre visible as a real layered ring.
        b.part(
          new THREE.TorusGeometry(0.064, 0.011, 6, 10),
          POLYMER_HIGHLIGHT,
          {
            at: outward(0.098),
            bone: joint.name,
            dir: [side, 0, 0],
            axis: "z",
            name: `s24_${joint.kind}WasherRing_${prefix}${i}`,
            flat: true,
            group: "leg-washers",
          },
        );

        // Orange centre pin, slightly proud of the pale ring.
        addCylinder(
          outward(0.115),
          0.024,
          0.024,
          BEACH_ORANGE,
          joint.name,
          `s24_${joint.kind}WasherPin_${prefix}${i}`,
          [side, 0, 0],
        );
      }
    }
  }
}
```

<!-- call: add5 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addBodySideCables(b: Builder) {
  const bone = "spine2";
  const sides = [1, -1] as const;
  const zEnds = [-0.89, 0.89] as const;
  const cableX = 0.372;
  const highY = 1.61;
  const lowY = 1.29;

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) => {
    b.rod(a, c, radius, {
      bone,
      color,
      name,
      caps: "flat",
      section: { ngon: 6 },
    });
  };

  const sleeve = (
    side: number,
    y: number,
    z: number,
    name: string,
  ) => {
    // A short ivory sleeve sits over the cable where it meets the end hoop.
    b.part(
      new THREE.CylinderGeometry(0.034, 0.034, 0.105, 8, 1, false),
      POLYMER_HIGHLIGHT,
      {
        bone,
        at: [side * cableX, y, z],
        dir: [0, 0, 1],
        name: `${name}_sleeve`,
        flat: true,
      },
    );

    // Two narrow dark lips keep the collar from reading as a loose floating bead.
    for (const dz of [-0.034, 0.034]) {
      b.part(
        new THREE.TorusGeometry(0.034, 0.006, 6, 8),
        DARK_INK,
        {
          bone,
          at: [side * cableX, y, z + dz],
          dir: [0, 0, 1],
          name: `${name}_lip${dz < 0 ? "A" : "B"}`,
          flat: true,
        },
      );
    }

    // A small outward-facing rivet identifies the fastener on each side of the machine.
    b.part(
      new THREE.SphereGeometry(0.014, 7, 4),
      BEACH_ORANGE,
      {
        bone,
        at: [side * (cableX + 0.035), y, z],
        name: `${name}_rivet`,
        flat: true,
      },
    );
  };

  for (const side of sides) {
    const prefix = side > 0 ? "L" : "R";

    // The two nearly parallel cables are deliberately offset just outside the existing
    // ivory side rail, so they remain legible against the body frame.
    rod(
      [side * cableX, highY, zEnds[0]],
      [side * cableX, highY, zEnds[1]],
      0.013,
      DARK_INK,
      `s25_sideCable${prefix}_high`,
    );
    rod(
      [side * cableX, lowY, zEnds[0]],
      [side * cableX, lowY, zEnds[1]],
      0.013,
      DARK_INK,
      `s25_sideCable${prefix}_low`,
    );

    // Short end posts connect the upper and lower cables into a compact, taut terminal
    // assembly. They also echo the vertical frame members already present in stage one.
    for (const z of zEnds) {
      rod(
        [side * cableX, lowY, z],
        [side * cableX, highY, z],
        0.014,
        BLUE_GREY,
        `s25_cableEndPost${prefix}_${z < 0 ? "rear" : "front"}`,
      );

      sleeve(
        side,
        highY,
        z,
        `s25_anchor${prefix}_high_${z < 0 ? "rear" : "front"}`,
      );
      sleeve(
        side,
        lowY,
        z,
        `s25_anchor${prefix}_low_${z < 0 ? "rear" : "front"}`,
      );
    }

    // Tiny diagonal tie-backs visually seat the cable assemblies against the end hoops
    // rather than leaving their collars as isolated rings.
    for (const z of zEnds) {
      const hoopZ = z < 0 ? -1.045 : 1.045;
      rod(
        [side * cableX, highY, z],
        [side * 0.405, highY + 0.015, hoopZ],
        0.009,
        DEEP_TEAL,
        `s25_highTie${prefix}_${z < 0 ? "rear" : "front"}`,
      );
      rod(
        [side * cableX, lowY, z],
        [side * 0.405, lowY - 0.015, hoopZ],
        0.009,
        DEEP_TEAL,
        `s25_lowTie${prefix}_${z < 0 ? "rear" : "front"}`,
      );
    }
  }
}
```

<!-- call: add6 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addSailRivets(b: Builder) {
  const MAST_BONE = "mastMid";
  const BODY_BONE = "spine3";

  // -------------------------------------------------------------------------------------------------------------
  // Sail rivets: use live surface hits so every little head is seated on the existing edge tubes and inherits
  // the correct local surface orientation. The upper and lower bars get restrained rows; two extra pairs climb
  // the sloping side rails to make the sail frame read as one manufactured panel.

  const sailSurface = b.surface(b.root);

  const addRivet = (x: number, y: number, z: number, name: string, radius = 0.022) => {
    const hit = sailSurface.nearest([x, y, z]);
    b.stick(
      new THREE.SphereGeometry(radius, 8, 5),
      BEACH_ORANGE,
      hit,
      {
        bone: MAST_BONE,
        embed: 0.18,
        name,
        group: "stage2-sail-rivets",
      },
    );

    // A tiny dark backing washer is mostly hidden in the tube, but gives the orange head a crisp silhouette.
    const washerHit = sailSurface.nearest([x, y, z - 0.006]);
    b.stick(
      new THREE.CylinderGeometry(radius * 1.18, radius * 1.18, 0.009, 8),
      DEEP_TEAL,
      washerHit,
      {
        bone: MAST_BONE,
        embed: 0.62,
        name: `${name}_washer`,
        group: "stage2-sail-rivets",
      },
    );
  };

  // Lower edge, kept close to the supplied request location and its clear room.
  for (let i = 0; i < 7; i++) {
    const u = -0.57 + i * 0.19;
    addRivet(u, 1.765, 0.342, `sailRivetLower${i}`);
  }

  // Upper edge of the triangular sail.
  for (let i = 0; i < 5; i++) {
    const u = -0.40 + i * 0.20;
    addRivet(u, 2.425, 0.342, `sailRivetUpper${i}`, 0.020);
  }

  // Two sparse rivets on each rising edge, following the frame rather than filling the sail centre.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 2; i++) {
      const t = i === 0 ? 0.28 : 0.70;
      const x = side * (0.68 - 0.20 * t);
      const y = 1.765 + 0.66 * t;
      addRivet(x, y, 0.341, `sailRivetSlope${side > 0 ? "L" : "R"}${i}`, 0.019);
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Forward identification plate. Its local X axis runs across the body; its local Y axis is tangent to the
  // forward-upper body surface. X × Y is the supplied outward normal, so every layered mark sits on the same face.

  const normal = new THREE.Vector3(0, 0.65, 0.75).normalize();
  const plateX = new THREE.Vector3(1, 0, 0);
  const plateY = new THREE.Vector3(0, 0.75, -0.65).normalize();
  const plateAt = new THREE.Vector3(0, 1.59, 0.72).addScaledVector(normal, 0.012);

  const platePoint = (u: number, v: number, lift = 0) =>
    plateAt
      .clone()
      .addScaledVector(plateX, u)
      .addScaledVector(plateY, v)
      .addScaledVector(normal, lift);

  const rectangularOutline = (halfWidth: number, halfHeight: number) => [
    [-halfWidth, -halfHeight, "sharp"] as [number, number, "sharp"],
    [halfWidth, -halfHeight, "sharp"] as [number, number, "sharp"],
    [halfWidth, halfHeight, "sharp"] as [number, number, "sharp"],
    [-halfWidth, halfHeight, "sharp"] as [number, number, "sharp"],
  ];

  // Broad dark-teal mounting frame.
  b.extrude(rectangularOutline(0.178, 0.066), {
    at: plateAt,
    x: plateX,
    y: plateY,
    thickness: 0.024,
    bevel: 0.006,
    color: DEEP_TEAL,
    bone: BODY_BONE,
    name: "bodyIdentificationPlate_frame",
    group: "stage2-identification",
  });

  // Slightly inset cream enamel face, raised just enough to catch a separate highlight.
  b.extrude(rectangularOutline(0.148, 0.049), {
    at: platePoint(0, 0, 0.017),
    x: plateX,
    y: plateY,
    thickness: 0.012,
    bevel: 0.004,
    color: POLYMER_HIGHLIGHT,
    bone: BODY_BONE,
    name: "bodyIdentificationPlate_enamel",
    group: "stage2-identification",
  });

  // Three-line orange maker mark, built as small flat bars rather than a texture so it stays legible at any zoom.
  const markBar = (
    index: number,
    centreU: number,
    centreV: number,
    halfWidth: number,
    halfHeight: number,
  ) => {
    b.extrude(rectangularOutline(halfWidth, halfHeight), {
      at: platePoint(centreU, centreV, 0.026),
      x: plateX,
      y: plateY,
      thickness: 0.007,
      bevel: 0.0015,
      color: BEACH_ORANGE,
      bone: BODY_BONE,
      name: `bodyIdentificationPlate_mark${index}`,
      group: "stage2-identification",
    });
  };

  markBar(0, -0.018, 0.024, 0.055, 0.0055);
  markBar(1, 0.018, 0.000, 0.083, 0.0055);
  markBar(2, -0.032, -0.024, 0.040, 0.0055);

  // Four tiny orange corner fasteners tie the flat plate back into the riveted language of the sculpture.
  for (const [i, [u, v]] of [
    [-0.132, -0.039],
    [0.132, -0.039],
    [0.132, 0.039],
    [-0.132, 0.039],
  ].entries()) {
    b.part(
      new THREE.SphereGeometry(0.009, 6, 4),
      BEACH_ORANGE,
      {
        at: platePoint(u, v, 0.030),
        bone: BODY_BONE,
        name: `bodyIdentificationPlate_bolt${i}`,
        group: "stage2-identification",
        flat: true,
      },
    );
  }

  // A small central dark mark below the three bars makes the plate read as an intentional identification badge.
  b.part(
    new THREE.CylinderGeometry(0.010, 0.010, 0.008, 8),
    DARK_INK,
    {
      at: platePoint(0.060, -0.024, 0.031),
      dir: normal,
      bone: BODY_BONE,
      name: "bodyIdentificationPlate_badgeDot",
      group: "stage2-identification",
      flat: true,
    },
  );
}
```