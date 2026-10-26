```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  rng,
  type Builder,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

const ROOT = "#24123d";
const ROOT_LIT = "#4b2465";
const STEM = "#183b58";
const STEM_LIT = "#28728a";
const LEAF = "#1c766d";
const LEAF_LIT = "#45c7a4";
const LEAF_DARK = "#12434e";
const PETAL = "#61349b";
const PETAL_LIT = "#a85fe0";
const PETAL_EDGE = "#dd87f3";
const CYAN = "#35f4e4";
const CYAN_DARK = "#168b9a";
const MAGENTA = "#ff4fd8";
const MAGENTA_DARK = "#9b227e";
const AMBER = "#ffd36a";
const INK = "#160c2a";

export const meta = {
  name: "bioluminescent alien plant",
  description:
    "A stylized Avatar-inspired alien night plant with a rooted bulb, branching teal stalk, fan leaves, luminous tendrils, and a radiant crown flower.",
};

export const REQUESTS = [
  {
    id: "crownLightRing",
    kind: "add",
    part: "crownCore",
    what:
      "Add a hovering ring of eight small bioluminescent seed-lamps around the crown core. Alternate CYAN and MAGENTA, each lamp faceted and softly glowing, connected by tiny dark-violet stems.",
    at: [0, 1.98, 0.04],
    normal: [0, 1, 0],
    bone: null,
    room: [0.9, 0.35, 0.9],
  },
  {
    id: "petalVeins",
    kind: "add",
    part: "crownPetals",
    what:
      "Add raised luminous vein ribs down every broad crown petal: thin branching lines in CYAN and PETAL_EDGE, strongest near the petal tips, in a clean alien-organic pattern.",
    at: [0, 2.03, 0.28],
    normal: [0, 0.8, 0.5],
    bone: null,
    room: [1.2, 0.18, 1.2],
  },
  {
    id: "stalkNodes",
    kind: "add",
    part: "mainStalk",
    what:
      "Add a vertical sequence of five glowing turquoise nodes embedded along the front of the main stalk, each surrounded by a small dark teal collar and a four-point star flare.",
    at: [0, 1.12, 0.105],
    normal: [0, 0, 1],
    bone: null,
    room: [0.18, 1.2, 0.12],
  },
  {
    id: "leftLeafLamps",
    kind: "add",
    part: "leafL",
    what:
      "Add three tiny cyan lantern beads along the central vein of the left fan leaf, with short magenta side filaments and a faint pearl-white highlight.",
    at: [-0.53, 1.16, 0.02],
    normal: [0, 0.5, 0.86],
    bone: null,
    room: [0.55, 0.3, 0.18],
  },
  {
    id: "rightLeafLamps",
    kind: "add",
    part: "leafR",
    what:
      "Add three tiny magenta lantern beads along the central vein of the right fan leaf, with short cyan side filaments and a faint pearl-white highlight.",
    at: [0.53, 1.02, 0.02],
    normal: [0, 0.5, 0.86],
    bone: null,
    room: [0.55, 0.3, 0.18],
  },
  {
    id: "rootMycelium",
    kind: "add",
    part: "rootBulb",
    what:
      "Add six short, chunky alien root-fingers radiating across the floor from the root bulb. Use ROOT_LIT with CYAN glowing tips, rounded faceted ends, and small triangular cut marks.",
    at: [0, 0.08, 0],
    normal: [0, 1, 0],
    bone: null,
    room: [1.25, 0.2, 1.05],
  },
  {
    id: "tendrilBeads",
    kind: "add",
    part: "frontTendrils",
    what:
      "Add a string of alternating CYAN and MAGENTA beads along each of the two forward curling tendrils. Beads should be irregular faceted ovals, connected by hair-thin purple cords.",
    at: [0, 1.28, 0.3],
    normal: [0, 0.3, 1],
    bone: null,
    room: [1.1, 0.8, 0.55],
  },
  {
    id: "crownHalo",
    kind: "add",
    part: "crownCore",
    what:
      "Add a thin hovering halo crescent above the flower, made from three nested angular arcs in CYAN, MAGENTA, and AMBER, with three suspended droplets below it.",
    at: [0, 2.28, 0.03],
    normal: [0, 1, 0],
    bone: null,
    room: [0.85, 0.35, 0.22],
  },
  {
    id: "rootGlyph",
    kind: "add",
    part: "rootBulb",
    what:
      "Add a simple three-lobed alien glyph on the front of the root bulb: dark INK outline, bright CYAN interior, and one MAGENTA central dot.",
    at: [0, 0.2, 0.34],
    normal: [0, 0, 1],
    bone: null,
    room: [0.3, 0.28, 0.05],
  },
  {
    id: "leafTexture",
    kind: "texture",
    part: "leafL",
    what:
      "Paint both large fan leaves with a subtle Avatar-like bioluminescent gradient: LEAF_DARK near the lower edges, LEAF through the center, LEAF_LIT along the raised central vein, with sparse tiny CYAN speckles.",
  },
  {
    id: "petalTexture",
    kind: "texture",
    part: "crownPetals",
    what:
      "Paint every crown petal with a saturated violet-to-lilac gradient using PETAL and PETAL_LIT, leaving the outer 15 percent as a crisp PETAL_EDGE rim. Add faint radial bands that point toward the crown core.",
  },
  {
    id: "stalkTexture",
    kind: "texture",
    part: "mainStalk",
    what:
      "Paint the stalk and branches in layered STEM and STEM_LIT bands, with dark indigo undersides and a few narrow cyan bioluminescent streaks following the growth direction.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

function sphere(
  b: Builder,
  color: string,
  at: [number, number, number],
  scale: [number, number, number],
  name: string,
  segments = 10,
) {
  const part = b.part(new THREE.SphereGeometry(1, segments, Math.max(6, segments - 2)), color, {
    at,
    scale,
    name,
  });
  return part;
}

function bead(
  b: Builder,
  at: [number, number, number],
  color: string,
  name: string,
  scale: [number, number, number] = [0.045, 0.06, 0.045],
) {
  return glow(sphere(b, color, at, scale, name, 8), 1.8);
}

function leaf(
  b: Builder,
  points: [number, number, number][],
  color: string,
  name: string,
) {
  return b.slab(points, {
    color,
    thickness: 0.025,
    name,
    group: "leaves",
  });
}

function petal(
  b: Builder,
  points: [number, number, number][],
  name: string,
) {
  return b.slab(points, {
    color: PETAL_LIT,
    thickness: 0.025,
    name,
    group: "crownPetals",
  });
}

function build() {
  const b = createBuilder({ name: "bioluminescent-alien-plant", detail: 1 });

  // Rooted foundation: a broad alien bulb and a faceted collar keep the plant planted at y = 0.
  const rootBulb = sphere(
    b,
    ROOT_LIT,
    [0, 0.2, 0],
    [0.42, 0.2, 0.34],
    "rootBulb",
    12,
  );

  b.part(
    new THREE.TorusGeometry(0.3, 0.055, 6, 14),
    ROOT,
    {
      at: [0, 0.17, 0],
      rotation: [90, 0, 0],
      name: "rootCollar",
      group: "roots",
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.2, 0.3, 0.12, 8),
    ROOT,
    {
      at: [0, 0.1, 0],
      name: "rootPlate",
      group: "roots",
    },
  );

  // Eight chunky roots establish the radial silhouette without becoming scenery.
  const rootDirections: [number, number][] = [
    [0, 0.52],
    [0.38, 0.36],
    [0.5, -0.02],
    [0.31, -0.4],
    [0, -0.5],
    [-0.34, -0.38],
    [-0.5, -0.02],
    [-0.36, 0.36],
  ];
  rootDirections.forEach(([x, z], i) => {
    const base: [number, number, number] = [x * 0.45, 0.11, z * 0.45];
    const tip: [number, number, number] = [x, 0.035, z];
    b.sweep(
      catmull([
        base,
        [x * 0.7, 0.075, z * 0.7],
        tip,
      ]),
      [0.065, 0.018],
      {
        color: ROOT_LIT,
        caps: "round",
        name: `rootFinger${i}`,
        group: "roots",
      },
    );
    bead(b, [x * 0.94, 0.045, z * 0.94], i % 2 ? MAGENTA : CYAN, `rootTip${i}`, [
      0.034,
      0.025,
      0.034,
    ]);
  });

  // Main stalk, kept mostly clear so later node and streak requests have room.
  const stalkPath = catmull([
    [0, 0.25, 0],
    [0.015, 0.68, -0.015],
    [-0.025, 1.13, 0.01],
    [0.04, 1.55, 0.015],
    [0, 1.86, 0.03],
  ]);
  const stalk = b.sweep(stalkPath, (t) => 0.12 - t * 0.045, {
    color: STEM_LIT,
    sides: 8,
    name: "mainStalk",
    group: "stalk",
  });

  // A dark lower sheath gives the trunk a graphic, layered silhouette.
  b.sweep(
    catmull([
      [-0.01, 0.3, -0.005],
      [0, 0.62, -0.01],
      [0.02, 0.92, 0],
    ]),
    [0.14, 0.095],
    {
      color: STEM,
      sides: 7,
      caps: "round",
      name: "lowerSheath",
      group: "stalk",
    },
  );

  // Side branches and broad fan leaves.
  const branchL = b.sweep(
    catmull([
      [-0.015, 0.68, 0],
      [-0.18, 0.8, 0],
      [-0.4, 0.98, 0.015],
      [-0.57, 1.12, 0.02],
    ]),
    [0.055, 0.018],
    { color: STEM_LIT, caps: "round", name: "branchL", group: "stalk" },
  );

  const branchR = b.sweep(
    catmull([
      [0.02, 0.86, 0],
      [0.17, 0.92, -0.005],
      [0.38, 1.0, 0.015],
      [0.58, 1.02, 0.02],
    ]),
    [0.05, 0.016],
    { color: STEM_LIT, caps: "round", name: "branchR", group: "stalk" },
  );

  leaf(
    b,
    [
      [-0.44, 0.98, 0.025],
      [-0.63, 1.12, 0.03],
      [-0.88, 1.34, 0.02],
      [-0.92, 1.53, 0.03],
      [-0.7, 1.46, 0.04],
      [-0.5, 1.25, 0.035],
    ],
    LEAF_LIT,
    "leafL",
  );

  leaf(
    b,
    [
      [0.43, 0.98, 0.025],
      [0.63, 1.0, 0.03],
      [0.88, 1.14, 0.02],
      [0.94, 1.34, 0.03],
      [0.72, 1.31, 0.04],
      [0.5, 1.16, 0.035],
    ],
    LEAF,
    "leafR",
  );

  // Secondary leaves point toward the viewer and behind, giving the plant a layered Avatar silhouette.
  const leafBack = b.sweep(
    catmull([
      [0.01, 1.16, 0],
      [0.12, 1.28, -0.12],
      [0.2, 1.4, -0.32],
    ]),
    [0.035, 0.012],
    { color: STEM, caps: "round", name: "backLeafStem", group: "stalk" },
  );

  leaf(
    b,
    [
      [0.13, 1.3, -0.11],
      [0.2, 1.44, -0.29],
      [0.14, 1.69, -0.43],
      [0.03, 1.57, -0.29],
      [0.04, 1.38, -0.16],
    ],
    LEAF_DARK,
    "backLeaf",
  );

  leaf(
    b,
    [
      [-0.12, 0.67, 0.02],
      [-0.29, 0.73, 0.17],
      [-0.54, 0.82, 0.25],
      [-0.61, 0.99, 0.21],
      [-0.38, 0.91, 0.12],
      [-0.18, 0.79, 0.05],
    ],
    LEAF,
    "lowLeafL",
  );

  leaf(
    b,
    [
      [0.11, 0.76, 0.01],
      [0.29, 0.82, 0.14],
      [0.55, 0.88, 0.18],
      [0.62, 1.04, 0.13],
      [0.39, 0.98, 0.09],
      [0.18, 0.86, 0.03],
    ],
    LEAF_DARK,
    "lowLeafR",
  );

  // Forward tendrils are thin, sweeping, and end in clearly readable luminous buds.
  const tendrilL = b.sweep(
    catmull([
      [-0.03, 1.23, 0.05],
      [-0.22, 1.34, 0.16],
      [-0.42, 1.28, 0.31],
      [-0.55, 1.1, 0.39],
      [-0.7, 1.17, 0.42],
    ]),
    (t) => 0.026 - t * 0.016,
    { color: PETAL, sides: 6, caps: "round", name: "frontTendrilsL", group: "tendrils" },
  );

  const tendrilR = b.sweep(
    catmull([
      [0.03, 1.23, 0.05],
      [0.22, 1.34, 0.16],
      [0.42, 1.3, 0.31],
      [0.55, 1.13, 0.39],
      [0.7, 1.21, 0.43],
    ]),
    (t) => 0.026 - t * 0.016,
    { color: PETAL, sides: 6, caps: "round", name: "frontTendrilsR", group: "tendrils" },
  );

  bead(b, [-0.7, 1.17, 0.42], CYAN, "tendrilBudL", [0.075, 0.06, 0.075]);
  bead(b, [0.7, 1.21, 0.43], MAGENTA, "tendrilBudR", [0.075, 0.06, 0.075]);

  // Crown core and five oversized radial petals.
  const crownCore = bead(b, [0, 1.93, 0.04], AMBER, "crownCore", [0.16, 0.13, 0.16]);
  sphere(b, MAGENTA_DARK, [0, 1.88, 0.035], [0.22, 0.08, 0.22], "crownCup", 10);

  const petalAngles = [0, 72, 144, 216, 288];
  petalAngles.forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    const px = Math.cos(a);
    const pz = -Math.sin(a);
    const base: [number, number, number] = [dx * 0.08, 1.96, 0.04 + dz * 0.08];
    const left: [number, number, number] = [
      dx * 0.42 + px * 0.16,
      2.04,
      0.04 + dz * 0.42 + pz * 0.16,
    ];
    const tip: [number, number, number] = [dx * 0.72, 2.11 + (i % 2) * 0.045, 0.04 + dz * 0.72];
    const right: [number, number, number] = [
      dx * 0.42 - px * 0.16,
      2.04,
      0.04 + dz * 0.42 - pz * 0.16,
    ];
    petal(b, [base, left, tip, right], `crownPetal${i}`);
  });

  // Small crown sepals, visibly darker beneath the luminous petals.
  for (const s of [-1, 1]) {
    b.slab(
      [
        [s * 0.05, 1.92, 0.03],
        [s * 0.22, 1.79, -0.02],
        [s * 0.05, 1.84, 0.12],
      ],
      {
        color: PETAL,
        thickness: 0.022,
        name: `crownSepal${s > 0 ? "L" : "R"}`,
        group: "crownPetals",
      },
    );
  }

  // Three floating side flowers attached by short stalks.
  const flowerData: Array<{
    stem: [number, number, number][];
    center: [number, number, number];
    side: number;
  }> = [
    {
      stem: [
        [0.03, 1.5, 0.02],
        [0.27, 1.58, -0.02],
        [0.46, 1.7, 0.02],
      ],
      center: [0.46, 1.72, 0.02],
      side: 1,
    },
    {
      stem: [
        [-0.02, 1.48, 0],
        [-0.26, 1.56, -0.03],
        [-0.45, 1.7, 0.015],
      ],
      center: [-0.45, 1.72, 0.015],
      side: -1,
    },
    {
      stem: [
        [0, 1.42, -0.02],
        [0.08, 1.57, -0.2],
        [0.1, 1.72, -0.34],
      ],
      center: [0.1, 1.74, -0.34],
      side: 0,
    },
  ];

  flowerData.forEach((flower, fi) => {
    b.sweep(flower.stem, [0.035, 0.014], {
      color: STEM_LIT,
      caps: "round",
      name: `flowerStem${fi}`,
      group: "flowers",
    });

    bead(b, flower.center, fi === 1 ? CYAN : MAGENTA, `flowerCore${fi}`, [
      0.075,
      0.065,
      0.075,
    ]);

    const [cx, cy, cz] = flower.center;
    for (let p = 0; p < 4; p++) {
      const a = ((p * 90 + fi * 15) * Math.PI) / 180;
      const dx = Math.sin(a);
      const dz = Math.cos(a);
      const px = Math.cos(a);
      const pz = -Math.sin(a);
      b.slab(
        [
          [cx + dx * 0.04, cy + 0.01, cz + dz * 0.04],
          [cx + dx * 0.16 + px * 0.07, cy + 0.02, cz + dz * 0.16 + pz * 0.07],
          [cx + dx * 0.29, cy + 0.055, cz + dz * 0.29],
          [cx + dx * 0.16 - px * 0.07, cy + 0.02, cz + dz * 0.16 - pz * 0.07],
        ],
        {
          color: fi % 2 === 0 ? PETAL_LIT : PETAL,
          thickness: 0.018,
          name: `sideFlower${fi}Petal${p}`,
          group: "flowers",
        },
      );
    }
  });

  // A few bright nodes are already present as stage-one silhouette accents.
  bead(b, [0.02, 0.66, 0.115], CYAN, "stalkGlowLower", [0.048, 0.06, 0.025]);
  bead(b, [-0.02, 1.06, 0.105], MAGENTA, "stalkGlowMiddle", [0.045, 0.055, 0.025]);
  bead(b, [0.02, 1.45, 0.09], CYAN, "stalkGlowUpper", [0.04, 0.05, 0.025]);

  // Small dark spikes around the root and crown make the silhouette feel less terrestrial.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const x = Math.sin(a);
    const z = Math.cos(a);
    b.spike(
      [x * 0.26, 0.27, z * 0.26],
      [x * 0.5, 0.45, z * 0.5],
      0.13,
      0.025,
      {
        color: ROOT,
        name: `rootSpine${i}`,
        group: "roots",
      },
    );
  }

  // Hook for the parallel Stage 2 workers.
  for (const add of STAGE2) add(b);

  return b.root;
}

export default build;
```