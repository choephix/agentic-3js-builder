```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  type Builder,
  type V3,
} from "agentic-3js-builder";

export const PALETTE = {
  WOOD: "#6b321f",
  WOOD_DARK: "#3b1d18",
  WOOD_LIGHT: "#a95d32",
  ROOF: "#4b2527",
  ROOF_RED: "#8d302c",
  ROOF_HIGHLIGHT: "#c45b37",
  STRAW: "#d6a94d",
  CREAM: "#f3d895",
  RED: "#b8322d",
  BLUE: "#315b72",
  TEAL: "#3e8580",
  GOLD: "#e5b64d",
  IRON: "#29252a",
  BLACK: "#17151a",
  LEG: "#a9793b",
  LEG_DARK: "#654024",
  CLAW: "#d0a94e",
  GLASS: "#6cb6a1",
  SHADOW: "#24151a",
} as const;

export const meta = {
  name: "Baba Yaga's Hut on Chicken Legs",
  description:
    "A stylized Slavic folk-art diorama of a crooked timber hut perched on four expressive chicken legs.",
};

export const REQUESTS = [
  {
    id: "roofFinial",
    kind: "add",
    part: "roofL",
    what:
      "A tall Slavic folk-art roof finial at the ridge: carved red and gold onion shapes, a small iron crescent, and two wooden pegs. Use RED, GOLD, WOOD_DARK and IRON. Keep it chunky and primitive.",
    at: [0, 2.62, 0.05],
    normal: [0, 1, 0],
    bone: null,
    room: [0.34, 0.42, 0.34],
  },
  {
    id: "chimneySmoke",
    kind: "add",
    part: "chimney",
    what:
      "A curling magical smoke plume rising from the chimney, made from 5 to 7 faceted blue-violet and pale cream puffs, with a tiny amber ember inside. It should curl backward and stay within the diorama silhouette.",
    at: [0.32, 2.73, -0.22],
    normal: [0, 1, 0],
    bone: null,
    room: [0.5, 0.9, 0.5],
  },
  {
    id: "doorCharm",
    kind: "add",
    part: "door",
    what:
      "A large protective Slavic sun charm on the front door: dark outline, eight golden rays, a red central disk, and two little hanging beads. Make it sit flush on the door.",
    at: [0, 1.48, 0.765],
    normal: [0, 0, 1],
    bone: null,
    room: [0.36, 0.38, 0.08],
  },
  {
    id: "windowShutters",
    kind: "add",
    part: "windowPair",
    what:
      "Two carved folk-art shutters, one around each front window, painted BLUE and RED with cream diamond inlays. Add chunky hinges and a small triangular pediment over each window.",
    at: [-0.58, 1.57, 0.74],
    normal: [0, 0, 1],
    bone: null,
    room: [1.55, 0.55, 0.13],
  },
  {
    id: "legAnklets",
    kind: "add",
    part: "legs",
    what:
      "Four decorative ankle bands where the chicken legs meet their feet: alternating RED, GOLD and BLUE carved rings, with tiny hanging wooden beads. Follow each leg's angle and do not obscure the toes.",
    at: [0.48, 0.18, 0.38],
    normal: [0, 1, 0],
    bone: null,
    room: [1.25, 0.32, 1.05],
  },
  {
    id: "underbodyTalismans",
    kind: "add",
    part: "underbody",
    what:
      "A row of three dangling protective talismans beneath the hut, each a small carved wooden diamond with red and cream paint and a short cord. Hang between the legs.",
    at: [0, 0.89, 0.1],
    normal: [0, -1, 0],
    bone: null,
    room: [0.9, 0.38, 0.18],
  },
  {
    id: "gableCarving",
    kind: "add",
    part: "gable",
    what:
      "A bold carved sun-and-bird ornament centered on the front gable. Use a dark wood outline, GOLD rays, a RED bird silhouette and two BLUE dots. It is the main folk-art emblem.",
    at: [0, 2.12, 0.69],
    normal: [0, 0, 1],
    bone: null,
    room: [0.8, 0.55, 0.12],
  },
  {
    id: "chickenFeathers",
    kind: "add",
    part: "legs",
    what:
      "Small overlapping fan-shaped feather tufts around the four upper chicken legs, in LEG_LIGHT, CREAM and RED, pointing outward like stylized folk-paper feathers. Keep them sparse and graphic.",
    at: [0.58, 0.78, 0.38],
    normal: [0, 0, 1],
    bone: null,
    room: [1.5, 0.45, 1.1],
  },
  {
    id: "cabinPaint",
    kind: "texture",
    part: "cabin",
    what:
      "Paint the timber cabin with broad hand-painted Slavic folk motifs: alternating WOOD_LIGHT and WOOD, simple cream diamond marks on the horizontal logs, and slightly darker corners. Keep the door and windows readable.",
  },
  {
    id: "roofPattern",
    kind: "texture",
    part: "roofL",
    what:
      "Paint the two roof planes with repeating bold red-and-cream zigzag bands, following the roof slope. Use ROOF, ROOF_RED, ROOF_HIGHLIGHT and CREAM, with a handmade uneven rhythm.",
  },
  {
    id: "doorGrain",
    kind: "texture",
    part: "door",
    what:
      "Add vertical painted wood grain and three broad cream folk stripes to the door, using WOOD_DARK, WOOD_LIGHT and CREAM. Leave the center clear for the sun charm.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

function box(
  b: Builder,
  size: [number, number, number],
  color: string,
  at: V3,
  name: string,
  rotation?: [number, number, number],
) {
  return b.part(new THREE.BoxGeometry(...size), color, {
    at,
    rotation,
    name,
    flat: true,
  });
}

function cylinder(
  b: Builder,
  radius: number,
  height: number,
  color: string,
  at: V3,
  name: string,
  segments = 8,
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
    at,
    name,
    flat: true,
  });
}

function build() {
  const b = createBuilder({ name: meta.name, detail: 1 });

  // A single root keeps the static architecture and the four articulated legs
  // in one coherent rig.
  const root = b.joint("hips", {
    at: [0, 0.98, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  // Main raised timber cabin.
  box(b, [1.72, 0.9, 1.34], PALETTE.WOOD, [0, 1.48, 0], "cabin");

  // Heavy corner posts make the silhouette read as hand-built timber.
  for (const x of [-0.78, 0.78]) {
    for (const z of [-0.57, 0.57]) {
      box(b, [0.16, 1.02, 0.16], PALETTE.WOOD_DARK, [x, 1.48, z], "cornerPost");
      cylinder(b, 0.09, 1.02, PALETTE.WOOD_LIGHT, [x, 1.48, z + (z > 0 ? 0.085 : -0.085)], "postHighlight", 6);
    }
  }

  // Horizontal log courses, kept broad and graphic.
  for (let i = 0; i < 5; i++) {
    const y = 1.12 + i * 0.19;
    box(b, [1.78, 0.075, 1.39], i % 2 ? PALETTE.WOOD_LIGHT : PALETTE.WOOD, [0, y, 0], "cabinLog");
  }

  // Front door and its plain central surface for the stage-two charm.
  box(b, [0.46, 0.76, 0.085], PALETTE.WOOD_DARK, [0, 1.38, 0.704], "door");
  box(b, [0.38, 0.68, 0.025], PALETTE.WOOD_LIGHT, [0, 1.38, 0.752], "doorInset");
  box(b, [0.035, 0.62, 0.035], PALETTE.IRON, [-0.17, 1.38, 0.775], "doorHinge");
  cylinder(b, 0.035, 0.1, PALETTE.GOLD, [0.15, 1.4, 0.79], "doorHandle", 8);

  // Two front windows with broad empty panes.
  for (const x of [-0.57, 0.57]) {
    box(b, [0.38, 0.34, 0.07], PALETTE.WOOD_DARK, [x, 1.58, 0.704], "windowPair");
    box(b, [0.29, 0.25, 0.025], PALETTE.GLASS, [x, 1.58, 0.748], "windowPane");
    box(b, [0.035, 0.29, 0.035], PALETTE.CREAM, [x, 1.58, 0.77], "windowMullion");
    box(b, [0.31, 0.035, 0.035], PALETTE.CREAM, [x, 1.58, 0.77], "windowMullion");
    box(b, [0.46, 0.055, 0.09], PALETTE.WOOD_DARK, [x, 1.785, 0.70], "windowLintel");
  }

  // Rear-side little window adds asymmetry without stealing the front read.
  box(b, [0.34, 0.3, 0.06], PALETTE.WOOD_DARK, [0.72, 1.48, -0.69], "sideWindow");
  box(b, [0.24, 0.2, 0.025], PALETTE.BLUE, [0.72, 1.48, -0.73], "sidePane");

  // Gabled roof: two chunky painted slabs, with exaggerated folk-art eaves.
  box(b, [0.98, 0.13, 1.56], PALETTE.ROOF, [-0.43, 2.12, 0], "roofL", [0, 0, -35]);
  box(b, [0.98, 0.13, 1.56], PALETTE.ROOF_RED, [0.43, 2.12, 0], "roofR", [0, 0, 35]);
  box(b, [0.12, 0.16, 1.62], PALETTE.ROOF_HIGHLIGHT, [0, 2.58, 0], "ridgeBeam");
  box(b, [1.98, 0.1, 1.48], PALETTE.WOOD_DARK, [0, 1.98, 0], "roofEave");
  box(b, [1.9, 0.07, 0.1], PALETTE.GOLD, [0, 2.0, 0.73], "frontEaveTrim");

  // Front triangular gable panel, deliberately plain for the emblem request.
  const gable = b.extrude(
    [
      [-0.78, 0],
      [0.78, 0],
      [0, 0.62],
    ],
    {
      at: [-0, 1.93, 0.69],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.075,
      color: PALETTE.WOOD_LIGHT,
      name: "gable",
    },
  );

  // Short crooked chimney, behind the ridge.
  box(b, [0.25, 0.5, 0.27], PALETTE.WOOD_DARK, [0.3, 2.33, -0.28], "chimney");
  box(b, [0.36, 0.08, 0.36], PALETTE.ROOF_RED, [0.3, 2.6, -0.28], "chimneyCap");

  // Underbody beam and four chicken leg chains.
  box(b, [1.5, 0.18, 1.05], PALETTE.WOOD_DARK, [0, 0.95, 0], "underbody");

  const legSpecs = [
    { side: 1, front: 1, name: "legFL", x: 0.58, z: 0.38 },
    { side: -1, front: 1, name: "legFR", x: -0.58, z: 0.38 },
    { side: 1, front: -1, name: "legBL", x: 0.58, z: -0.38 },
    { side: -1, front: -1, name: "legBR", x: -0.58, z: -0.38 },
  ];

  for (const spec of legSpecs) {
    const x = spec.x;
    const z = spec.z;
    const ankleZ = z + (spec.front > 0 ? 0.05 : -0.04);
    const legPath = catmull([
      [x, 0.94, z],
      [x + spec.side * 0.045, 0.68, z + spec.front * 0.02],
      [x - spec.side * 0.12, 0.35, ankleZ],
      [x - spec.side * 0.08, 0.14, ankleZ + spec.front * 0.01],
    ]);
    const leg = b.chain(spec.name, legPath, {
      parent: root,
      names: [`${spec.name}Hip`, `${spec.name}Knee`, `${spec.name}Ankle`, `${spec.name}Foot`],
      role: "leg",
      contact: [x - spec.side * 0.08, 0, ankleZ + spec.front * 0.01],
    });

    b.sweep(leg, (t) => 0.105 - t * 0.025, {
      color: t < 0.45 ? PALETTE.LEG : PALETTE.LEG_DARK,
      sides: 7,
      name: `${spec.name}Shaft`,
    });

    // Three splayed toes on every foot, all resting just above the floor.
    const foot = leg.at(1);
    const toeBase = foot.at;
    const toeDirs = [
      [-0.15 * spec.side, 0.02, 0.18 * spec.front],
      [0, 0.01, 0.23 * spec.front],
      [0.15 * spec.side, 0.02, 0.16 * spec.front],
    ];
    toeDirs.forEach((d, i) => {
      const end: [number, number, number] = [
        toeBase.x + d[0],
        Math.max(0.075, toeBase.y + d[1]),
        toeBase.z + d[2],
      ];
      b.rod(toeBase, end, 0.035, {
        color: PALETTE.CLAW,
        sides: 6,
        name: `${spec.name}Toe${i}`,
      });
      b.spike(end, [0, 0, spec.front * 0.08], 0.09, 0.028, {
        color: PALETTE.CLAW,
        name: `${spec.name}Claw${i}`,
      });
    });

    // A dark joint knob gives each leg a puppet-like articulated knee.
    cylinder(b, 0.12, 0.11, PALETTE.LEG_DARK, leg.at(0.48).at, `${spec.name}KneeKnob`, 8);
  }

  // Small painted disks on the cabin corners establish the folk palette before Stage 2.
  for (const x of [-0.82, 0.82]) {
    cylinder(b, 0.065, 0.035, PALETTE.RED, [x, 1.82, 0.68], "cornerRosette", 8);
    cylinder(b, 0.032, 0.04, PALETTE.GOLD, [x, 1.82, 0.705], "cornerRosetteCenter", 8);
  }

  // Plain eave diamonds reserve visible surfaces for later carving.
  for (const x of [-0.7, -0.35, 0, 0.35, 0.7]) {
    const diamond = b.extrude(
      [
        [0, 0.065],
        [0.065, 0],
        [0, -0.065],
        [-0.065, 0],
      ],
      {
        at: [x, 1.99, 0.755],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.025,
        color: x === 0 ? PALETTE.GOLD : PALETTE.CREAM,
        name: "eaveDiamond",
      },
    );
    void diamond;
  }

  for (const add of STAGE2) add(b);
  return b.root;
}

export default build;
```