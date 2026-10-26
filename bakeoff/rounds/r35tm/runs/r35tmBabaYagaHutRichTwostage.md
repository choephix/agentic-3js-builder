<!-- call: stage1 -->

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

<!-- call: texture -->

Paint `cabin` with alternating hand-painted timber courses, cream diamonds, and darker corner shading.  
Paint both roof planes with repeating red, cream, and highlight zigzag bands.  
Paint `door` with vertical grain and three cream folk stripes, leaving its center clear.

```ts
<<<<<<< SEARCH
import {
  createBuilder,
  catmull,
  type Builder,
  type V3,
} from "agentic-3js-builder";
=======
import {
  createBuilder,
  catmull,
  noise,
  paint,
  type Builder,
  type V3,
} from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
} as const;

export const REQUESTS = [
=======
} as const;

const CABIN_PAINT = paint((p, n) => {
  const course = Math.floor((p.y - 1.02) / 0.19);
  let color = course % 2 === 0 ? PALETTE.WOOD : PALETTE.WOOD_LIGHT;

  const corner = Math.max(Math.abs(p.x) - 0.68, Math.abs(p.z) - 0.53);
  if (corner > 0.025) color = PALETTE.WOOD_DARK;

  const frontOrBack = Math.abs(n.z) > 0.55;
  const side = Math.abs(n.x) > 0.55;
  const u = frontOrBack ? p.x : p.z;
  const v = p.y;
  const diamondPhase = ((u + 1.2) / 0.34 + (v - 1.02) / 0.19) % 2;
  const diamond = Math.abs(diamondPhase - 1) < 0.16;
  if ((frontOrBack || side) && diamond && n.y > -0.8) color = PALETTE.CREAM;

  const brush = noise(
    new THREE.Vector3(p.x * 0.7, p.y * 1.4, p.z * 0.7),
    0.16,
    17,
  );
  if (brush > 0.72 && color === PALETTE.WOOD_LIGHT) color = PALETTE.CREAM;
  return color;
});

const ROOF_PAINT = paint((p, n) => {
  const run = p.z * 5.2 + p.x * 2.6;
  const wave = Math.abs(((run % 1) + 1) % 1 - 0.5);
  const band = Math.floor((p.z + 1.2) / 0.31);
  if (wave < 0.12) return PALETTE.CREAM;
  if (wave < 0.22) return band % 2 ? PALETTE.ROOF_HIGHLIGHT : PALETTE.ROOF_RED;
  if (n.y > 0.45 && noise(p, 0.22, 23) > 0.63) return PALETTE.ROOF_HIGHLIGHT;
  return PALETTE.ROOF;
});

const DOOR_PAINT = paint((p, n) => {
  const grain =
    noise(new THREE.Vector3(p.x * 2.4, p.y * 0.65, p.z * 3), 0.12, 31);
  let color = grain > 0.57 ? PALETTE.WOOD_LIGHT : PALETTE.WOOD_DARK;

  const stripeA = Math.abs(p.x + 0.145) < 0.035;
  const stripeB = Math.abs(p.x - 0.145) < 0.035;
  const stripeC = Math.abs(p.x + 0.21) < 0.022;
  const outsideCenter = Math.abs(p.x) > 0.055;
  if (n.z > 0.5 && outsideCenter && (stripeA || stripeB || stripeC)) {
    color = PALETTE.CREAM;
  }
  return color;
});

export const REQUESTS = [
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(b, [1.72, 0.9, 1.34], PALETTE.WOOD, [0, 1.48, 0], "cabin");
=======
  box(b, [1.72, 0.9, 1.34], CABIN_PAINT, [0, 1.48, 0], "cabin");
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(b, [0.46, 0.76, 0.085], PALETTE.WOOD_DARK, [0, 1.38, 0.704], "door");
=======
  box(b, [0.46, 0.76, 0.085], DOOR_PAINT, [0, 1.38, 0.704], "door");
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(b, [0.98, 0.13, 1.56], PALETTE.ROOF, [-0.43, 2.12, 0], "roofL", [0, 0, -35]);
  box(b, [0.98, 0.13, 1.56], PALETTE.ROOF_RED, [0.43, 2.12, 0], "roofR", [0, 0, 35]);
=======
  box(b, [0.98, 0.13, 1.56], ROOF_PAINT, [-0.43, 2.12, 0], "roofL", [0, 0, -35]);
  box(b, [0.98, 0.13, 1.56], ROOF_PAINT, [0.43, 2.12, 0], "roofR", [0, 0, 35]);
>>>>>>> REPLACE
```

<!-- call: add1 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addRoofFinial(b: Builder) {
  const base = new THREE.Vector3(0, 2.61, 0.05);

  // Broad carved socket that visually grows out of the ridge beam.
  b.part(
    new THREE.CylinderGeometry(0.095, 0.12, 0.055, 8),
    PALETTE.WOOD_DARK,
    {
      at: [base.x, base.y, base.z],
      name: "s21FinialSocket",
      flat: true,
    },
  );

  // Tall carved wooden stem, with a slightly flared foot and pointed cap.
  b.part(
    new THREE.CylinderGeometry(0.034, 0.052, 0.25, 7),
    PALETTE.WOOD_DARK,
    {
      at: [0, 2.735, 0.05],
      name: "s21FinialStem",
      flat: true,
    },
  );

  b.part(
    new THREE.ConeGeometry(0.065, 0.105, 8),
    PALETTE.WOOD_DARK,
    {
      at: [0, 2.875, 0.05],
      name: "s21FinialPoint",
      flat: true,
    },
  );

  // Red onion-shaped carved crown: two overlapping chunky lobes make it
  // read as folk-carved rather than a plain sphere.
  b.part(
    new THREE.SphereGeometry(0.105, 8, 6),
    PALETTE.RED,
    {
      at: [0, 2.69, 0.05],
      scale: [0.78, 0.9, 0.78],
      name: "s21RedOnionLower",
      flat: true,
    },
  );

  b.part(
    new THREE.SphereGeometry(0.078, 8, 6),
    PALETTE.RED,
    {
      at: [0, 2.77, 0.05],
      scale: [0.7, 0.9, 0.7],
      name: "s21RedOnionUpper",
      flat: true,
    },
  );

  // Gold collar and crosswise carved bands.
  b.part(
    new THREE.CylinderGeometry(0.11, 0.11, 0.022, 8),
    PALETTE.GOLD,
    {
      at: [0, 2.625, 0.05],
      name: "s21GoldBaseRing",
      flat: true,
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.086, 0.086, 0.024, 8),
    PALETTE.GOLD,
    {
      at: [0, 2.755, 0.05],
      name: "s21GoldCrownRing",
      flat: true,
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.045, 0.045, 0.025, 8),
    PALETTE.GOLD,
    {
      at: [0, 2.865, 0.05],
      name: "s21GoldTipRing",
      flat: true,
    },
  );

  // Two small wooden pegs flank the crown, like stylized carved rays.
  for (const side of [-1, 1]) {
    b.part(
      new THREE.CylinderGeometry(0.022, 0.029, 0.105, 6),
      PALETTE.WOOD_DARK,
      {
        at: [side * 0.105, 2.705, 0.05],
        rotation: [0, 0, side * 28],
        name: `s21WoodPeg${side > 0 ? "L" : "R"}`,
        flat: true,
      },
    );

    b.part(
      new THREE.SphereGeometry(0.027, 6, 4),
      PALETTE.GOLD,
      {
        at: [side * 0.13, 2.748, 0.05],
        name: `s21PegCap${side > 0 ? "L" : "R"}`,
        flat: true,
      },
    );
  }

  // Iron crescent on the front of the finial. A partial torus gives a
  // readable low-poly crescent while keeping the silhouette compact.
  const crescent = new THREE.Mesh(
    new THREE.TorusGeometry(0.075, 0.018, 6, 12, Math.PI * 1.42),
  );
  crescent.rotation.z = Math.PI * 0.18;
  b.part(crescent.geometry, PALETTE.IRON, {
    at: [0, 2.835, 0.118],
    rotation: [0, 0, 18],
    name: "s21IronCrescent",
    flat: true,
  });

  // Tiny red-and-gold terminal bead makes the very top feel deliberately
  // crafted and prevents the finial from ending as a blunt pole.
  b.part(
    new THREE.SphereGeometry(0.038, 7, 5),
    PALETTE.RED,
    {
      at: [0, 2.925, 0.05],
      name: "s21TerminalBead",
      flat: true,
    },
  );

  b.part(
    new THREE.SphereGeometry(0.018, 6, 4),
    PALETTE.GOLD,
    {
      at: [0, 2.958, 0.05],
      name: "s21TerminalGold",
      flat: true,
    },
  );
}
```

<!-- call: add2 -->

```ts
import * as THREE from "three";
import { type Builder, catmull, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addChimneySmoke(b: Builder) {
  const VIOLET = "#66528f";
  const VIOLET_DARK = "#382d61";
  const MOON = "#eadbb5";
  const EMBER = "#ff9f32";
  const rngSmoke = rng(2207);

  const base: [number, number, number] = [0.32, 2.67, -0.28];

  // A narrow faceted stem makes the individual smoke puffs feel like one
  // curling, hand-carved plume rather than a stack of unrelated balls.
  const stemPath = catmull([
    base,
    [0.32, 2.76, -0.30],
    [0.39, 2.86, -0.36],
    [0.34, 2.95, -0.43],
    [0.22, 3.03, -0.45],
    [0.13, 3.09, -0.37],
  ]);

  b.sweep(stemPath, (t) => 0.072 - t * 0.026, {
    color: VIOLET_DARK,
    sides: 6,
    caps: "round",
    name: "s22SmokeStem",
  });

  const puffs: Array<{
    at: [number, number, number];
    r: number;
    color: string;
    scale: [number, number, number];
  }> = [
    { at: [0.32, 2.73, -0.29], r: 0.145, color: VIOLET, scale: [1.0, 0.82, 0.92] },
    { at: [0.36, 2.83, -0.34], r: 0.135, color: MOON, scale: [0.9, 1.05, 0.88] },
    { at: [0.38, 2.92, -0.41], r: 0.145, color: VIOLET_DARK, scale: [1.02, 0.9, 0.84] },
    { at: [0.30, 3.00, -0.46], r: 0.135, color: VIOLET, scale: [0.96, 1.0, 0.9] },
    { at: [0.20, 3.07, -0.44], r: 0.125, color: MOON, scale: [1.0, 0.86, 0.92] },
    { at: [0.12, 3.12, -0.36], r: 0.105, color: VIOLET, scale: [0.92, 0.9, 1.0] },
  ];

  for (let i = 0; i < puffs.length; i++) {
    const puff = puffs[i];
    const part = b.part(
      new THREE.IcosahedronGeometry(puff.r, 1),
      puff.color,
      {
        at: puff.at,
        scale: puff.scale,
        name: `s22SmokePuff${i}`,
        flat: true,
      },
    );

    // Tiny inset facets give the smoke a folk-paper, layered look without
    // making the silhouette too smooth.
    if (i === 1 || i === 3 || i === 4) {
      const inset = b.part(
        new THREE.IcosahedronGeometry(puff.r * 0.48, 1),
        i === 4 ? VIOLET_DARK : MOON,
        {
          at: [
            puff.at[0] - 0.025,
            puff.at[1] + 0.018,
            puff.at[2] + 0.045,
          ],
          scale: [0.9, 0.7, 0.55],
          name: `s22SmokeFacet${i}`,
          flat: true,
        },
      );
      void inset;
    }
    void part;
  }

  // A few angular wisps peel off the curl, keeping the plume lively from
  // three-quarter views while staying inside the reserved box.
  const wisps = [
    [[0.34, 2.84, -0.38], [0.48, 2.88, -0.42], [0.47, 2.95, -0.49]] as [number, number, number][],
    [[0.25, 2.98, -0.45], [0.15, 3.02, -0.51], [0.08, 3.00, -0.48]] as [number, number, number][],
  ];

  wisps.forEach((points, i) => {
    b.sweep(catmull(points), [0.032, 0.008], {
      color: i === 0 ? MOON : VIOLET_DARK,
      sides: 5,
      caps: { start: "round", end: "point" },
      name: `s22SmokeWisp${i}`,
    });
  });

  // Warm ember nested in the lowest puff. It is deliberately small but
  // emissive so it reads as the hut's magical hearth from a distance.
  const ember = b.part(
    new THREE.IcosahedronGeometry(0.035, 1),
    EMBER,
    {
      at: [0.31, 2.72, -0.20],
      name: "s22ChimneyEmber",
      flat: true,
    },
  );
  glow(ember, 2.2);

  // Three pinprick sparks orbit the plume's outside edge.
  const sparks: [number, number, number][] = [
    [0.49, 2.88, -0.31],
    [0.22, 3.04, -0.56],
    [0.04, 3.15, -0.31],
  ];

  sparks.forEach((at, i) => {
    const spark = b.part(
      new THREE.OctahedronGeometry(0.018 + rngSmoke() * 0.008, 0),
      i === 1 ? MOON : EMBER,
      {
        at,
        name: `s22SmokeSpark${i}`,
        flat: true,
      },
    );
    glow(spark, 1.7);
  });
}
```

<!-- call: add3 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addDoorCharm(b: Builder) {
  const P = PALETTE;

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    name: string,
    rotation?: [number, number, number],
  ) =>
    b.part(geometry, color, {
      at,
      rotation,
      name,
      flat: true,
    });

  const frontCylinder = (
    radius: number,
    depth: number,
    color: string,
    at: [number, number, number],
    name: string,
    segments = 10,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, {
      at,
      dir: [0, 0, 1],
      axis: "z",
      name,
      flat: true,
    });

  const frontBox = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    name: string,
    angle = 0,
  ) =>
    part(
      new THREE.BoxGeometry(size[0], size[1], size[2]),
      color,
      at,
      name,
      angle ? [0, 0, angle] : undefined,
    );

  const diamond = (
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
    name: string,
    z = 0.805,
  ) =>
    b.extrude(
      [
        [0, h * 0.5],
        [w * 0.5, 0],
        [0, -h * 0.5],
        [-w * 0.5, 0],
      ],
      {
        at: [x, y, z],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        bevel: 0.004,
        color,
        name,
      },
    );

  // -------------------------------------------------------------------------
  // Door charm: a layered eight-rayed protective sun, seated just above the
  // door inset. The dark disk makes the motif readable against the wood.
  // -------------------------------------------------------------------------
  const cx = 0;
  const cy = 1.48;
  const cz = 0.795;

  frontCylinder(0.145, 0.026, P.WOOD_DARK, [cx, cy, cz], "s23DoorSunOutline", 12);

  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const r = 0.127;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    frontBox(
      [0.034, 0.105, 0.026],
      P.GOLD,
      [x, y, cz + 0.004],
      `s23DoorSunRay${i}`,
      a - Math.PI / 2,
    );
    frontBox(
      [0.012, 0.073, 0.031],
      P.CREAM,
      [
        cx + Math.cos(a) * (r + 0.004),
        cy + Math.sin(a) * (r + 0.004),
        cz + 0.009,
      ],
      `s23DoorSunRayHighlight${i}`,
      a - Math.PI / 2,
    );
  }

  frontCylinder(0.101, 0.034, P.GOLD, [cx, cy, cz + 0.018], "s23DoorSunGold", 12);
  frontCylinder(0.077, 0.039, P.RED, [cx, cy, cz + 0.032], "s23DoorSunRed", 12);
  frontCylinder(0.026, 0.043, P.CREAM, [cx, cy, cz + 0.048], "s23DoorSunCore", 10);

  // Four small cardinal notches give the medallion a carved, rather than
  // purely geometric, folk-art edge.
  for (const [x, y, i] of [
    [0.0, cy + 0.082, 0],
    [0.0, cy - 0.082, 1],
    [0.082, cy, 2],
    [-0.082, cy, 3],
  ] as [number, number, number][]) {
    frontCylinder(0.010, 0.047, P.WOOD_DARK, [x, y, cz + 0.052], `s23DoorSunNotch${i}`, 6);
  }

  // Two hanging beads and their tiny cords.
  for (const x of [-0.058, 0.058]) {
    frontBox([0.009, 0.052, 0.012], P.WOOD_DARK, [x, cy - 0.158, cz + 0.01], "s23DoorCharmCord");
    frontCylinder(0.018, 0.025, P.RED, [x, cy - 0.19, cz + 0.015], "s23DoorCharmBead", 8);
    frontCylinder(0.009, 0.029, P.GOLD, [x, cy - 0.217, cz + 0.02], "s23DoorCharmBeadTip", 7);
  }

  // -------------------------------------------------------------------------
  // Shutters: each window receives two asymmetrical carved boards. Blue and
  // red alternate from side to side, with cream diamonds and iron hinges.
  // -------------------------------------------------------------------------
  const windows = [-0.57, 0.57];

  windows.forEach((wx, wi) => {
    const left = wx - 0.225;
    const right = wx + 0.225;
    const y = 1.58;
    const z = 0.785;

    // Dark backing rails behind each pair.
    frontBox([0.105, 0.405, 0.052], P.WOOD_DARK, [left, y, z - 0.006], `s23ShutterBackL${wi}`);
    frontBox([0.105, 0.405, 0.052], P.WOOD_DARK, [right, y, z - 0.006], `s23ShutterBackR${wi}`);

    frontBox(
      [0.085, 0.36, 0.064],
      wi % 2 === 0 ? P.BLUE : P.RED,
      [left, y, z],
      `s23ShutterL${wi}`,
      wi % 2 === 0 ? -0.035 : 0.035,
    );
    frontBox(
      [0.085, 0.36, 0.064],
      wi % 2 === 0 ? P.RED : P.BLUE,
      [right, y, z],
      `s23ShutterR${wi}`,
      wi % 2 === 0 ? 0.035 : -0.035,
    );

    // Raised edge strips and central carved motifs.
    frontBox([0.018, 0.33, 0.018], P.CREAM, [left, y, z + 0.037], `s23ShutterEdgeL${wi}`);
    frontBox([0.018, 0.33, 0.018], P.CREAM, [right, y, z + 0.037], `s23ShutterEdgeR${wi}`);

    diamond(left, y + 0.055, 0.053, 0.09, P.CREAM, `s23ShutterDiamondL${wi}`);
    diamond(right, y - 0.045, 0.053, 0.09, P.CREAM, `s23ShutterDiamondR${wi}`);

    // Small dark lower diamonds make the inlays feel layered.
    diamond(left, y - 0.105, 0.027, 0.044, P.GOLD, `s23ShutterSmallL${wi}`, 0.817);
    diamond(right, y + 0.115, 0.027, 0.044, P.GOLD, `s23ShutterSmallR${wi}`, 0.817);

    // Three chunky hinges on the outer side of each shutter.
    for (let j = 0; j < 3; j++) {
      const hy = y - 0.13 + j * 0.13;
      frontBox([0.13, 0.027, 0.075], P.IRON, [left - 0.018, hy, z + 0.037], `s23HingeOuterL${wi}`);
      frontBox([0.13, 0.027, 0.075], P.IRON, [right + 0.018, hy, z + 0.037], `s23HingeOuterR${wi}`);
      frontCylinder(0.015, 0.086, P.GOLD, [left - 0.077, hy, z + 0.055], `s23HingePinL${wi}`, 7);
      frontCylinder(0.015, 0.086, P.GOLD, [right + 0.077, hy, z + 0.055], `s23HingePinR${wi}`, 7);
    }

    // Triangular pediment over each window, with a tiny gold finial.
    b.extrude(
      [
        [-0.27, 0],
        [0.27, 0],
        [0, 0.19],
      ],
      {
        at: [wx, 1.805, 0.785],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.072,
        bevel: 0.006,
        color: P.WOOD_DARK,
        name: `s23WindowPediment${wi}`,
      },
    );

    b.extrude(
      [
        [-0.21, 0],
        [0.21, 0],
        [0, 0.135],
      ],
      {
        at: [wx, 1.812, 0.825],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.022,
        bevel: 0.003,
        color: wi % 2 === 0 ? P.RED : P.BLUE,
        name: `s23WindowPedimentPaint${wi}`,
      },
    );

    frontCylinder(0.026, 0.045, P.GOLD, [wx, 1.953, 0.85], `s23WindowPedimentFinial${wi}`, 8);
    frontCylinder(0.010, 0.055, P.CREAM, [wx, 1.987, 0.855], `s23WindowPedimentTip${wi}`, 7);
  });

  // A pair of tiny painted rosettes at the inner corners ties the shutters
  // visually to the door sun without cluttering the windows.
  for (const x of [-0.32, 0.32]) {
    frontCylinder(0.028, 0.028, P.CREAM, [x, 1.82, 0.815], "s23WindowCornerRosette", 8);
    frontCylinder(0.013, 0.034, P.RED, [x, 1.82, 0.833], "s23WindowCornerCenter", 8);
  }
}
```

<!-- call: add4 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addLegAnklets(b: Builder) {
  const RED = PALETTE.RED;
  const GOLD = PALETTE.GOLD;
  const BLUE = PALETTE.BLUE;
  const WOOD = PALETTE.WOOD_DARK;
  const BEAD = PALETTE.WOOD_LIGHT;

  type Leg = {
    name: string;
    side: 1 | -1;
    front: 1 | -1;
    x: number;
    z: number;
  };

  const legs: Leg[] = [
    { name: "legFL", side: 1, front: 1, x: 0.58, z: 0.38 },
    { name: "legFR", side: -1, front: 1, x: -0.58, z: 0.38 },
    { name: "legBL", side: 1, front: -1, x: 0.58, z: -0.38 },
    { name: "legBR", side: -1, front: -1, x: -0.58, z: -0.38 },
  ];

  const torus = (major: number, minor: number) =>
    new THREE.TorusGeometry(major, minor, 5, 10);

  const beadGeometry = new THREE.SphereGeometry(0.027, 6, 4);
  const pegGeometry = new THREE.ConeGeometry(0.018, 0.055, 5);

  for (const leg of legs) {
    const ankle: [number, number, number] = [
      leg.x - leg.side * 0.08,
      0.205,
      leg.z + leg.front * 0.01,
    ];

    // The ankle is slightly swept in the same direction as the lower
    // chicken leg, so the toroidal bands sit squarely on the shank.
    const axis: [number, number, number] = [
      -leg.side * 0.055,
      -0.99,
      leg.front * 0.025,
    ];

    const bone = `${leg.name}Foot`;

    // Three shallow carved bands, with small gaps so the color rhythm reads
    // clearly even at thumbnail scale.
    const bands = [
      { y: 0.052, color: RED, major: 0.083 },
      { y: 0.105, color: GOLD, major: 0.086 },
      { y: 0.158, color: BLUE, major: 0.083 },
    ];

    bands.forEach((band, i) => {
      const at: [number, number, number] = [
        ankle[0] + leg.side * 0.002,
        ankle[1] + band.y,
        ankle[2] + leg.front * 0.002,
      ];

      b.part(torus(band.major, 0.012), band.color, {
        at,
        dir: axis,
        bone,
        flat: true,
        name: `${leg.name}Anklet${i}`,
        group: "legAnklets",
      });

      // A thin dark wooden groove immediately above each painted ring gives
      // the bands the appearance of carved, assembled folk jewelry.
      const grooveAt: [number, number, number] = [
        at[0],
        at[1] + 0.018,
        at[2],
      ];
      b.part(torus(band.major + 0.004, 0.0045), WOOD, {
        at: grooveAt,
        dir: axis,
        bone,
        flat: true,
        name: `${leg.name}AnkletGroove${i}`,
        group: "legAnklets",
      });
    });

    // Two tiny bead cords hang from the outer and front sides of each band.
    // They stop well above the floor and are angled away from the toes.
    const charms = [
      {
        x: leg.x + leg.side * 0.095,
        z: leg.z + leg.front * 0.015,
        y: 0.075,
        color: BEAD,
      },
      {
        x: leg.x - leg.side * 0.025,
        z: leg.z + leg.front * 0.105,
        y: 0.09,
        color: GOLD,
      },
    ];

    charms.forEach((charm, i) => {
      const cordTop: [number, number, number] = [
        charm.x,
        0.18,
        charm.z,
      ];
      const beadAt: [number, number, number] = [
        charm.x,
        charm.y,
        charm.z,
      ];

      b.rod(cordTop, [beadAt[0], beadAt[1] + 0.025, beadAt[2]], 0.006, {
        color: WOOD,
        bone,
        name: `${leg.name}CharmCord${i}`,
        group: "legAnklets",
        sides: 5,
      });

      b.part(beadGeometry, charm.color, {
        at: beadAt,
        bone,
        flat: true,
        name: `${leg.name}AnkleBead${i}`,
        group: "legAnklets",
      });

      // A minute pointed wooden cap makes each bead read as a tied charm,
      // rather than a floating sphere.
      b.part(pegGeometry, WOOD, {
        at: [beadAt[0], beadAt[1] + 0.034, beadAt[2]],
        dir: [0, 1, 0],
        bone,
        flat: true,
        name: `${leg.name}BeadCap${i}`,
        group: "legAnklets",
      });
    });
  }
}
```

<!-- call: add5 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addUnderbodyTalismans(b: Builder) {
  const wood = "#7a3d24";
  const woodDark = "#351b19";
  const red = "#b8322d";
  const cream = "#f3d895";
  const gold = "#e5b64d";

  const diamond = [
    [0, 0.09, "sharp"] as [number, number, "sharp"],
    [0.085, 0, "sharp"] as [number, number, "sharp"],
    [0, -0.09, "sharp"] as [number, number, "sharp"],
    [-0.085, 0, "sharp"] as [number, number, "sharp"],
  ];

  const smallDiamond = [
    [0, 0.052, "sharp"] as [number, number, "sharp"],
    [0.05, 0, "sharp"] as [number, number, "sharp"],
    [0, -0.052, "sharp"] as [number, number, "sharp"],
    [-0.05, 0, "sharp"] as [number, number, "sharp"],
  ];

  const ray = [
    [0, 0.047, "sharp"] as [number, number, "sharp"],
    [0.018, 0.018, "sharp"] as [number, number, "sharp"],
    [0.008, 0.018, "sharp"] as [number, number, "sharp"],
    [0, 0.008, "sharp"] as [number, number, "sharp"],
  ];

  const talismans = [
    { x: -0.31, y: 0.715, z: 0.105, main: red, inset: cream },
    { x: 0, y: 0.68, z: 0.115, main: cream, inset: red },
    { x: 0.31, y: 0.715, z: 0.105, main: red, inset: cream },
  ];

  for (let i = 0; i < talismans.length; i++) {
    const t = talismans[i];

    // Short leather cord, buried into the underside beam.
    b.rod(
      [t.x, 0.91, t.z],
      [t.x, 0.805, t.z],
      0.012,
      {
        color: woodDark,
        sides: 6,
        caps: "round",
        name: `s25TalismanCord${i}`,
      },
    );

    // A small wooden bead at the end of the cord.
    b.part(new THREE.SphereGeometry(0.027, 7, 5), gold, {
      at: [t.x, 0.79, t.z],
      name: `s25TalismanBead${i}`,
      flat: true,
    });

    // Broad, deliberately angular carved talisman.
    b.extrude(diamond, {
      at: [t.x, t.y, t.z],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.006,
      color: wood,
      name: `s25TalismanWood${i}`,
    });

    // Raised inset diamond on the front face.
    b.extrude(smallDiamond, {
      at: [t.x, t.y, t.z + 0.022],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.003,
      color: t.main,
      name: `s25TalismanInset${i}`,
    });

    // Four little rays make the charm read as a protective folk sun.
    const rays = [
      { at: [t.x, t.y + 0.075, t.z + 0.032] as [number, number, number], rot: 0 },
      { at: [t.x + 0.075, t.y, t.z + 0.032] as [number, number, number], rot: 90 },
      { at: [t.x, t.y - 0.075, t.z + 0.032] as [number, number, number], rot: 180 },
      { at: [t.x - 0.075, t.y, t.z + 0.032] as [number, number, number], rot: 270 },
    ];

    for (let r = 0; r < rays.length; r++) {
      const q = rays[r];
      const part = b.extrude(ray, {
        at: q.at,
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.009,
        color: gold,
        name: `s25TalismanRay${i}_${r}`,
      });
      if (q.rot) part.mesh.rotation.z = (q.rot * Math.PI) / 180;
    }

    // Central carved boss, standing proud of the painted inset.
    b.part(new THREE.CylinderGeometry(0.027, 0.027, 0.018, 8), gold, {
      at: [t.x, t.y, t.z + 0.046],
      dir: [0, 0, 1],
      name: `s25TalismanBoss${i}`,
      flat: true,
    });

    // Tiny lower tassel: three short painted strands.
    for (let k = -1; k <= 1; k++) {
      const endX = t.x + k * 0.018;
      b.rod(
        [t.x + k * 0.014, t.y - 0.075, t.z - 0.005],
        [endX, t.y - 0.125 - (k === 0 ? 0.012 : 0), t.z - 0.006],
        0.006,
        {
          color: k === 0 ? red : cream,
          sides: 5,
          caps: "round",
          name: `s25TalismanTassel${i}_${k + 1}`,
        },
      );
    }

    // A small rear-side bead gives the ornaments a handmade, layered silhouette.
    b.part(new THREE.SphereGeometry(0.014, 6, 4), red, {
      at: [t.x, t.y - 0.105, t.z - 0.025],
      name: `s25TalismanLowerBead${i}`,
      flat: true,
    });
  }

  // A shared short cross-cord visually ties the three charms together beneath the beam.
  b.rod(
    [-0.38, 0.875, 0.095],
    [0.38, 0.875, 0.095],
    0.008,
    {
      color: cream,
      sides: 5,
      caps: "round",
      name: "s25TalismanConnectingCord",
    },
  );

  // Two end knots on the connecting cord.
  for (const x of [-0.38, 0.38]) {
    b.part(new THREE.SphereGeometry(0.018, 6, 4), red, {
      at: [x, 0.875, 0.095],
      name: `s25TalismanCordKnot${x < 0 ? "L" : "R"}`,
      flat: true,
    });
  }
}
```

<!-- call: add6 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addGableCarving(b: Builder) {
  const P = PALETTE;

  const front = 0.755;
  const ornament = [0, 2.12, front] as [number, number, number];

  const plate = (outline: [number, number][], at: [number, number, number], color: string, name: string, thickness = 0.025) =>
    b.extrude(outline, {
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness,
      bevel: Math.min(thickness * 0.35, 0.008),
      color,
      name,
    });

  // Dark carved backing: the broad silhouette makes the ornament read even at a distance.
  b.part(new THREE.CylinderGeometry(0.185, 0.185, 0.035, 12), P.WOOD_DARK, {
    at: [ornament[0], ornament[1], front],
    dir: [0, 0, 1],
    axis: "z",
    name: "s26GableCarvingOutline",
    flat: true,
  });

  // Eight deliberately chunky golden rays.
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const radial: [number, number] = [Math.cos(a), Math.sin(a)];
    const tangent: [number, number] = [-Math.sin(a), Math.cos(a)];
    const base = 0.135;
    const tip = 0.255;
    const width = 0.035;
    const cx = radial[0] * base;
    const cy = radial[1] * base;
    const outline: [number, number][] = [
      [cx - tangent[0] * width, cy - tangent[1] * width],
      [radial[0] * tip, radial[1] * tip],
      [cx + tangent[0] * width, cy + tangent[1] * width],
    ];
    plate(
      outline,
      [ornament[0], ornament[1], front + 0.024],
      i % 2 ? P.GOLD : P.CREAM,
      `s26GableRay${i}`,
      0.025,
    );
  }

  // Raised red sun disk and a small gold inner boss.
  b.part(new THREE.CylinderGeometry(0.118, 0.118, 0.045, 12), P.RED, {
    at: [0, 2.12, front + 0.044],
    dir: [0, 0, 1],
    axis: "z",
    name: "s26GableSun",
    flat: true,
  });
  b.part(new THREE.TorusGeometry(0.118, 0.012, 5, 16), P.GOLD, {
    at: [0, 2.12, front + 0.069],
    rotation: [Math.PI / 2, 0, 0],
    name: "s26GableSunRim",
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.052, 8), P.CREAM, {
    at: [0, 2.12, front + 0.073],
    dir: [0, 0, 1],
    axis: "z",
    name: "s26GableSunBoss",
    flat: true,
  });

  // A stylized red bird sits across the lower half of the sun.
  const birdOutline: [number, number][] = [
    [-0.16, -0.035],
    [-0.07, 0.005],
    [-0.025, 0.055],
    [0.005, 0.025],
    [0.065, 0.075],
    [0.145, 0.035],
    [0.092, -0.01],
    [0.17, -0.075],
    [0.07, -0.06],
    [0.015, -0.11],
    [-0.055, -0.075],
    [-0.135, -0.09],
  ];
  plate(birdOutline, [0, 2.075, front + 0.09], P.WOOD_DARK, "s26GableBirdOutline", 0.027);
  const birdInner: [number, number][] = birdOutline.map(([x, y]) => [x * 0.82, y * 0.76]);
  plate(birdInner, [0, 2.078, front + 0.112], P.RED, "s26GableBird", 0.026);

  // Blue eyes/dots and a gold beak give the bird a folk-cutout face.
  for (const x of [-0.035, 0.045]) {
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.032, 7), P.BLUE, {
      at: [x, 2.12, front + 0.14],
      dir: [0, 0, 1],
      axis: "z",
      name: "s26GableBirdDot",
      flat: true,
    });
  }
  plate(
    [
      [0.115, 0.04],
      [0.19, 0.025],
      [0.115, 0.0],
    ],
    [0, 2.12, front + 0.13],
    P.GOLD,
    "s26GableBirdBeak",
    0.022,
  );

  // Four sparse feather fans around the upper legs. The triangles are paper-cut
  // shapes, backed by a dark edge and seated just above the leg surfaces.
  const legs = [
    { x: 0.58, z: 0.38, side: 1, front: 1, bone: "legFLHip" },
    { x: -0.58, z: 0.38, side: -1, front: 1, bone: "legFRHip" },
    { x: 0.58, z: -0.38, side: 1, front: -1, bone: "legBLHip" },
    { x: -0.58, z: -0.38, side: -1, front: -1, bone: "legBRHip" },
  ];

  const featherColors = [P.LEG, P.CREAM, P.RED];
  for (const [li, leg] of legs.entries()) {
    for (let i = 0; i < 3; i++) {
      const spread = (i - 1) * 0.065;
      const lean = (i - 1) * 0.055;
      const rootX = leg.x + leg.side * (0.055 + Math.abs(spread) * 0.24);
      const rootY = 0.77 + Math.abs(i - 1) * 0.018;
      const rootZ = leg.z + leg.front * 0.045;

      const feather: [number, number][] = [
        [0, 0],
        [0.035, 0.025],
        [0.055 + lean, 0.125],
        [0.012 + lean, 0.215],
        [-0.038, 0.135],
      ];
      const backing: [number, number][] = feather.map(([x, y]) => [
        x * 1.18 - 0.008,
        y * 1.08 - 0.008,
      ]);

      plate(
        backing.map(([x, y]) => [leg.side * x, y]),
        [rootX, rootY, rootZ - 0.012],
        P.LEG_DARK,
        `s26FeatherBack${li}_${i}`,
        0.018,
      );
      plate(
        feather.map(([x, y]) => [leg.side * x, y]),
        [rootX, rootY, rootZ],
        featherColors[(li + i) % featherColors.length],
        `s26Feather${li}_${i}`,
        0.022,
      );

      // A short painted quill divides the fan and adds a handmade carved line.
      b.rod(
        [rootX, rootY + 0.015, rootZ + 0.014],
        [
          rootX + leg.side * (0.012 + lean * 0.25),
          rootY + 0.175,
          rootZ + 0.018,
        ],
        0.008,
        {
          color: P.GOLD,
          name: `s26FeatherQuill${li}_${i}`,
          sides: 5,
        },
      );
    }

    // Small cream collar at the feather roots ties each fan into the leg.
    b.part(new THREE.TorusGeometry(0.112, 0.012, 5, 10), P.CREAM, {
      at: [leg.x, 0.775, leg.z],
      rotation: [0, 0, Math.PI / 2],
      name: `s26FeatherCollar${li}`,
      flat: true,
    });
  }
}
```