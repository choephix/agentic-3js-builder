import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, catmull, polyline, frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Stormpeak Forge-Master",
  "description": "A stocky Warcraft-style dwarf blacksmith stands hammer raised over an anvil on its stump, beside a coal-glowing forge on a stone workshop ring."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  skin: "#b56a3e",
  skinShadow: "#8a4c2c",
  beard: "#c9762f",
  beardDark: "#9a5520",
  helmSteel: "#8b93a6",
  steelDark: "#4e5464",
  steelEdge: "#c9cfd9",
  gold: "#d9a521",
  tunic: "#39557a",
  tunicDark: "#273d59",
  apron: "#6b4426",
  apronDark: "#452c18",
  leather: "#4a3320",
  iron: "#3a3d46",
  ironDark: "#23252c",
  ember: "#ff7a1a",
  emberHot: "#ffc94a",
  stone: "#716f66",
  stoneDark: "#4d4b45",
  moss: "#5f7c35",
  wood: "#7a5230",
  woodDark: "#57381f",
  water: "#3f6d7c",
  ink: "#1d1a24",
};
const M = {
  groundDwarf: [0, 0, -0.15] as [number, number, number],
  groundForge: [0, 0, -1.05] as [number, number, number],
  groundAnvil: [0.6, 0, 0.6] as [number, number, number],
  neckTop: [0, 1.3, -0.14] as [number, number, number],
  shoulderL: [0.34, 1.22, -0.15] as [number, number, number],
  shoulderR: [-0.34, 1.22, -0.15] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // groundBase
  (() => {
function buildGroundBase({ b, J, P, M }: Ctx) {
  const stone = P.stone;
  const stoneDark = P.stoneDark;
  const moss = P.moss;
  const ironDark = P.ironDark;
  const ember = P.ember;
  const emberHot = P.emberHot;
  const ink = P.ink;

  const rand = rng(24017);
  const radius = 0.82;
  const stones = 12;

  // Packed, nearly black workshop floor inside the ring.
  b.part(
    new THREE.CylinderGeometry(0.79, 0.82, 0.035, 20),
    ironDark,
    {
      at: [0, 0.0175, -0.28],
      name: "groundBasePackedFloor",
      group: "groundBase",
    },
  );

  // A dark foundation strip under the visible stone courses makes the ring read
  // as a continuous, heavy workshop platform.
  b.part(
    new THREE.CylinderGeometry(0.99, 1.01, 0.055, 12),
    stoneDark,
    {
      at: [0, 0.0275, -0.28],
      name: "groundBaseRingFoundation",
      group: "groundBase",
    },
  );

  // Chunky radial slabs. Each has a dark body and a separate, slightly irregular
  // light top so the cracks remain graphic from the front.
  for (let i = 0; i < stones; i++) {
    const a = (i / stones) * Math.PI * 2;
    const wobble = (rand() - 0.5) * 0.045;
    const r = radius + wobble;
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r - 0.28;
    const h = 0.115 + rand() * 0.035;
    const tangential = 0.48 + rand() * 0.045;
    const radial = 0.31 + rand() * 0.035;
    const yaw = a * 180 / Math.PI;

    b.part(
      new THREE.BoxGeometry(tangential, h, radial),
      stoneDark,
      {
        at: [x, h / 2, z],
        rotation: [0, yaw, 0],
        name: `groundBaseSlabBody${i}`,
        group: "groundBase",
      },
    );

    const top = new THREE.BoxGeometry(
      tangential * 0.94,
      0.026,
      radial * 0.9,
    );
    b.part(top, stone, {
      at: [x, h + 0.013, z],
      rotation: [0, yaw + (rand() - 0.5) * 3, 0],
      name: `groundBaseSlabTop${i}`,
      group: "groundBase",
    });

    // Small dark seam plates deepen the radial cracks between neighboring blocks.
    const seamA = a + Math.PI / stones;
    const sx = Math.sin(seamA) * (r + 0.015);
    const sz = Math.cos(seamA) * (r + 0.015) - 0.28;
    b.part(
      new THREE.BoxGeometry(0.038, 0.012, 0.17),
      stoneDark,
      {
        at: [sx, h + 0.022, sz],
        rotation: [0, seamA * 180 / Math.PI, 0],
        name: `groundBaseCrack${i}`,
        group: "groundBase",
      },
    );
  }

  // Moss tufts and flat moss tongues seated into selected slab joints.
  const mossSpots = [
    [0.39, 0.151, 0.43, 18, 0.16, 0.035],
    [-0.45, 0.151, -0.02, -28, 0.18, 0.03],
    [0.08, 0.151, -1.04, 8, 0.15, 0.035],
    [-0.83, 0.151, -0.53, 65, 0.13, 0.032],
  ] as const;

  for (let i = 0; i < mossSpots.length; i++) {
    const [x, y, z, yaw, w, d] = mossSpots[i];
    b.part(
      new THREE.BoxGeometry(w, 0.009, d),
      moss,
      {
        at: [x, y, z],
        rotation: [0, yaw, 0],
        name: `groundBaseMossPatch${i}`,
        group: "groundBase",
      },
    );

    // Two low angular blades per patch keep the moss readable without making
    // the ground visually busier than the dwarf.
    for (let j = 0; j < 2; j++) {
      const tuft = new THREE.ConeGeometry(0.012, 0.045 + rand() * 0.018, 5);
      b.part(tuft, moss, {
        at: [
          x + (rand() - 0.5) * w * 0.65,
          0.176,
          z + (rand() - 0.5) * d * 1.5,
        ],
        rotation: [
          (rand() - 0.5) * 28,
          rand() * 360,
          (rand() - 0.5) * 28,
        ],
        name: `groundBaseMossTuft${i}_${j}`,
        group: "groundBase",
      });
    }
  }

  // Scorch mark between the dwarf and forge, kept almost flush with the floor.
  b.part(
    new THREE.CylinderGeometry(0.17, 0.19, 0.004, 16),
    ink,
    {
      at: [0, 0.040, -0.66],
      rotation: [0, 0, 0],
      scale: [1, 0.42, 1],
      name: "groundBaseScorchMark",
      group: "groundBase",
    },
  );

  // Scattered embers cluster toward the forge side but remain inside the ring.
  const emberPoints = [
    [-0.34, -0.77],
    [-0.15, -0.88],
    [0.14, -0.82],
    [0.32, -0.68],
    [-0.46, -0.58],
    [0.46, -0.88],
    [-0.06, -0.57],
    [0.24, -0.99],
  ] as const;

  for (let i = 0; i < emberPoints.length; i++) {
    const [x, z] = emberPoints[i];
    const hot = i === 1 || i === 5;
    const piece = b.part(
      new THREE.OctahedronGeometry(hot ? 0.022 : 0.016, 0),
      hot ? emberHot : ember,
      {
        at: [x, 0.067 + rand() * 0.012, z],
        rotation: [rand() * 40, rand() * 90, rand() * 40],
        name: `groundBaseEmber${i}`,
        group: "groundBase",
      },
    );
    glow(piece, hot ? 1.8 : 1.25);
  }

  // Two fallen coal chunks near the forge.
  for (let i = 0; i < 2; i++) {
    b.part(
      new THREE.DodecahedronGeometry(0.042 + i * 0.008, 0),
      ironDark,
      {
        at: [
          -0.42 + i * 0.42,
          0.043,
          -0.91 + (rand() - 0.5) * 0.08,
        ],
        rotation: [18, i * 37, -12],
        name: `groundBaseFallenCoal${i}`,
        group: "groundBase",
      },
    );
  }
}
    return buildGroundBase;
  })(),
  // forge
  (() => {
function buildForge({ b, J, P, M }: Ctx) {
  const R = rng(4817);
  const forgeZ = -1.05;
  const frontZ = -0.655;
  const backZ = -1.43;

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      rotation,
      name,
      group: "forge",
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    name: string,
    dir: [number, number, number] = [0, 1, 0],
    segments = 8,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      dir,
      name,
      group: "forge",
    });

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: string,
    name: string,
    scale?: [number, number, number],
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 5), color, {
      at,
      scale,
      name,
      group: "forge",
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) => b.rod(a, c, radius, { color, name, group: "forge", caps: "round" });

  const STONE = P.stone;
  const STONE_DARK = P.stoneDark;
  const IRON = P.iron;
  const IRON_DARK = P.ironDark;
  const WOOD = P.wood;
  const WOOD_DARK = P.woodDark;
  const LEATHER = P.leather;
  const GOLD = P.gold;
  const EMBER = P.ember;
  const HOT = P.emberHot;
  const WATER = P.water;

  // -----------------------------------------------------------------------------------------------
  // Foundation shadow and a dark packed hearth floor.

  box([0.98, 0.035, 0.78], [0, 0.018, forgeZ], IRON_DARK, "forgePackedFloor");
  box([0.78, 0.028, 0.14], [0, 0.035, -0.82], STONE_DARK, "forgeFrontFooting");

  // -----------------------------------------------------------------------------------------------
  // Furnace body: three staggered courses of broad, chunky blocks.
  // Each block is deliberately separate so the mortar seams remain readable.

  const courses = [
    { y: 0.18, h: 0.34, z: forgeZ, shift: 0 },
    { y: 0.51, h: 0.32, z: forgeZ + 0.008, shift: 0.045 },
    { y: 0.83, h: 0.32, z: forgeZ - 0.012, shift: -0.035 },
  ];

  courses.forEach((course, row) => {
    const widths = row === 1 ? [0.31, 0.28, 0.31] : [0.28, 0.34, 0.28];
    let x = -0.45 + course.shift;
    widths.forEach((w, i) => {
      const depth = row === 0 ? 0.72 : 0.70;
      const shade = (row + i) % 3 === 0 ? STONE : row === 1 && i === 1 ? STONE_DARK : STONE;
      box(
        [w - 0.012, course.h - 0.018, depth],
        [x + w / 2, course.y, course.z],
        shade,
        `furnaceBlock${row}_${i}`,
      );
      x += w;
    });
  });

  // Dark horizontal mortar lines and a few vertical inset seams.
  for (const y of [0.345, 0.675, 0.995]) {
    box([0.88, 0.018, 0.012], [0, y, frontZ - 0.012], STONE_DARK, `frontMortar${y}`);
    box([0.86, 0.014, 0.014], [0, y, backZ + 0.015], STONE_DARK, `backMortar${y}`);
  }
  for (const y of [0.18, 0.51, 0.83]) {
    const seamX = y === 0.51 ? -0.12 : 0.16;
    box([0.014, 0.28, 0.012], [seamX, y, frontZ - 0.014], STONE_DARK, `frontJoint${y}`);
  }

  // Corner quoins: slightly proud stones give the furnace a Warcraft silhouette.
  for (const y of [0.17, 0.5, 0.83]) {
    box([0.11, 0.25, 0.08], [-0.44, y, frontZ + 0.025], STONE, `leftQuoin${y}`);
    box([0.11, 0.25, 0.08], [0.44, y, frontZ + 0.025], STONE_DARK, `rightQuoin${y}`);
  }

  // -----------------------------------------------------------------------------------------------
  // Hearth mouth: a deep arched opening, rimmed with dark stone and gold trim.

  const archOutline: [number, number][] = [
    [-0.31, 0],
    [0.31, 0],
    [0.31, 0.26],
    [0.27, 0.38],
    [0.18, 0.49],
    [0, 0.55],
    [-0.18, 0.49],
    [-0.27, 0.38],
    [-0.31, 0.26],
  ];

  b.extrude(archOutline, {
    at: [-0.0, 0.27, frontZ - 0.026],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.035,
    bevel: 0.008,
    smoothing: 1,
    color: IRON_DARK,
    name: "hearthMouth",
    group: "forge",
  });

  // Inner ember shelf and a black lintel behind the arch.
  box([0.56, 0.07, 0.18], [0, 0.235, frontZ + 0.035], IRON, "hearthLip");
  box([0.62, 0.075, 0.055], [0, 0.71, frontZ + 0.015], STONE_DARK, "hearthLintel");

  // Gold band follows the top of the arch in bold segmented trim.
  rod([-0.285, 0.60, frontZ - 0.055], [-0.18, 0.72, frontZ - 0.055], 0.018, GOLD, "archGoldL");
  rod([-0.18, 0.72, frontZ - 0.055], [0.18, 0.72, frontZ - 0.055], 0.018, GOLD, "archGoldTop");
  rod([0.18, 0.72, frontZ - 0.055], [0.285, 0.60, frontZ - 0.055], 0.018, GOLD, "archGoldR");
  rod([-0.305, 0.27, frontZ - 0.055], [-0.305, 0.49, frontZ - 0.055], 0.015, GOLD, "archGoldSideL");
  rod([0.305, 0.27, frontZ - 0.055], [0.305, 0.49, frontZ - 0.055], 0.015, GOLD, "archGoldSideR");

  // Rivets on the trim.
  for (const p of [
    [-0.295, 0.32, frontZ - 0.07],
    [-0.255, 0.54, frontZ - 0.07],
    [-0.12, 0.705, frontZ - 0.07],
    [0.12, 0.705, frontZ - 0.07],
    [0.255, 0.54, frontZ - 0.07],
    [0.295, 0.32, frontZ - 0.07],
  ] as [number, number, number][]) {
    sphere(0.018, p, GOLD, "archRivet", [1, 0.65, 0.65]);
  }

  // -----------------------------------------------------------------------------------------------
  // Coal bed and individual glowing coals.

  sphere(0.21, [0, 0.30, -0.585], IRON_DARK, "coalBed", [1.35, 0.32, 0.7]);
  const coalPts: [number, number, number][] = [
    [-0.18, 0.34, -0.61],
    [-0.10, 0.38, -0.56],
    [0.0, 0.35, -0.59],
    [0.10, 0.39, -0.57],
    [0.19, 0.34, -0.60],
    [-0.03, 0.43, -0.58],
    [0.10, 0.45, -0.62],
  ];
  coalPts.forEach((p, i) => {
    const coal = sphere(0.055, p, i % 3 === 0 ? HOT : EMBER, `glowingCoal${i}`, [1.15, 0.7, 0.85]);
    glow(coal, i % 3 === 0 ? 2.3 : 1.65);
    if (i === 1 || i === 4) {
      const core = sphere(0.022, [p[0], p[1] + 0.028, p[2] + 0.012], HOT, `coalCore${i}`);
      glow(core, 2.7);
    }
  });

  // Tiny ember motes inside the mouth.
  for (let i = 0; i < 8; i++) {
    const x = -0.25 + R() * 0.5;
    const y = 0.33 + R() * 0.23;
    const z = -0.69 + R() * 0.06;
    const mote = sphere(0.012 + R() * 0.009, [x, y, z], HOT, `hearthMote${i}`, [1, 1.4, 0.7]);
    glow(mote, 2.5);
  }

  // -----------------------------------------------------------------------------------------------
  // Three-stage tapering chimney, with block courses and dark seams.

  const chimneyStages = [
    { y: 1.18, h: 0.30, w: 0.59, d: 0.50, z: backZ + 0.11 },
    { y: 1.49, h: 0.31, w: 0.46, d: 0.40, z: backZ + 0.10 },
    { y: 1.82, h: 0.35, w: 0.34, d: 0.31, z: backZ + 0.09 },
  ];

  chimneyStages.forEach((s, i) => {
    box([s.w, s.h - 0.018, s.d], [0, s.y, s.z], i === 1 ? STONE_DARK : STONE, `chimneyStage${i}`);
    box([s.w + 0.012, 0.018, 0.025], [0, s.y - s.h / 2 + 0.012, s.z + s.d / 2], STONE_DARK, `chimneyFrontSeam${i}`);
    box([s.w + 0.012, 0.018, 0.025], [0, s.y + s.h / 2 - 0.012, s.z + s.d / 2], STONE_DARK, `chimneyFrontCap${i}`);
    box([0.018, s.h * 0.68, 0.018], [-s.w * 0.18, s.y, s.z + s.d / 2 + 0.014], STONE_DARK, `chimneyJointL${i}`);
    box([0.018, s.h * 0.68, 0.018], [s.w * 0.22, s.y, s.z + s.d / 2 + 0.014], STONE_DARK, `chimneyJointR${i}`);
  });

  // Slightly flared shoulder under the chimney.
  box([0.70, 0.10, 0.58], [0, 1.04, backZ + 0.13], STONE_DARK, "chimneyShoulder");
  box([0.64, 0.045, 0.53], [0, 1.105, backZ + 0.13], GOLD, "chimneyShoulderTrim");

  // Brass cap and square flue.
  box([0.43, 0.065, 0.39], [0, 2.015, backZ + 0.08], GOLD, "chimneyBrassCap");
  box([0.30, 0.15, 0.25], [0, 2.12, backZ + 0.08], GOLD, "chimneyFlue");
  box([0.35, 0.035, 0.30], [0, 2.205, backZ + 0.08], GOLD, "chimneyFlueLip");

  const flueGlow = box([0.27, 0.018, 0.22], [0, 2.045, backZ + 0.08], HOT, "flueGlowRim");
  glow(flueGlow, 2.2);

  // Small brass corner rivets on chimney cap.
  for (const x of [-0.17, 0.17]) {
    for (const z of [backZ - 0.095, backZ + 0.255]) {
      sphere(0.018, [x, 2.045, z], GOLD, "chimneyRivet");
    }
  }

  // -----------------------------------------------------------------------------------------------
  // Heavy bellows on the furnace's -X side.

  // Pivot mount and large iron hinge.
  cyl(0.045, 0.32, [-0.51, 0.70, -1.04], IRON_DARK, "bellowsPivot", [1, 0, 0], 8);
  sphere(0.065, [-0.56, 0.70, -1.04], GOLD, "bellowsPivotCap");

  const bellowsAxis: [number, number, number] = [0.34, -0.18, 0.18];
  const bellowsA: [number, number, number] = [-0.68, 0.88, -1.10];
  const bellowsB: [number, number, number] = [-0.84, 0.39, -0.86];

  const boardA = b.part(new THREE.BoxGeometry(0.16, 0.055, 0.42), WOOD, {
    at: bellowsA,
    dir: bellowsAxis,
    name: "bellowsUpperBoard",
    group: "forge",
  });
  const boardB = b.part(new THREE.BoxGeometry(0.18, 0.06, 0.42), WOOD_DARK, {
    at: bellowsB,
    dir: bellowsAxis,
    name: "bellowsLowerBoard",
    group: "forge",
  });

  // Leather spine and side ribs between the boards.
  b.frustumBox(bellowsA, bellowsB, [0.13, 0.13], [0.15, 0.15], {
    color: LEATHER,
    name: "bellowsLeatherBody",
    group: "forge",
    section: "box",
  });
  rod([-0.70, 0.83, -1.02], [-0.80, 0.45, -0.82], 0.014, IRON, "bellowsRibL");
  rod([-0.62, 0.83, -1.15], [-0.72, 0.45, -0.95], 0.014, IRON, "bellowsRibR");

  // Nozzle aimed into the hearth.
  rod([-0.84, 0.40, -0.86], [-0.64, 0.38, -0.70], 0.035, IRON, "bellowsNozzle");
  cyl(0.052, 0.06, [-0.64, 0.38, -0.70], GOLD, "bellowsNozzleCollar", [0.78, 0, 0.63], 8);

  // Wooden grip cap and decorative bands.
  rod([-0.88, 0.36, -0.88], [-0.91, 0.28, -0.94], 0.035, WOOD_DARK, "bellowsGrip");
  for (const t of [0.30, 0.43, 0.56]) {
    const x = -0.84 + (t - 0.39) * 0.18;
    const y = 0.39 + (t - 0.39) * -0.18;
    const z = -0.86 + (t - 0.39) * 0.18;
    cyl(0.012, 0.17, [x, y, z], IRON, `bellowsBand${t}`, bellowsAxis, 6);
  }

  // -----------------------------------------------------------------------------------------------
  // Front tool beam, hooks, poker and shovel.

  box([0.72, 0.075, 0.09], [0, 0.72, frontZ - 0.07], WOOD, "frontToolBeam");
  box([0.76, 0.025, 0.025], [0, 0.77, frontZ - 0.12], WOOD_DARK, "toolBeamTopEdge");
  for (const x of [-0.29, 0.29]) {
    cyl(0.025, 0.10, [x, 0.70, frontZ - 0.11], IRON, `toolHook${x}`, [0, 0, 1], 6);
    sphere(0.029, [x, 0.70, frontZ - 0.17], GOLD, `toolHookRivet${x}`);
  }

  // Poker: dark wooden grip, iron shaft, hooked tip.
  rod([-0.29, 0.68, frontZ - 0.16], [-0.30, 0.29, frontZ - 0.18], 0.014, IRON, "pokerShaft");
  rod([-0.30, 0.29, frontZ - 0.18], [-0.31, 0.20, frontZ - 0.13], 0.016, IRON, "pokerHook");
  cyl(0.027, 0.17, [-0.29, 0.80, frontZ - 0.16], WOOD_DARK, "pokerHandle", [0, 1, 0], 7);
  cyl(0.034, 0.035, [-0.29, 0.70, frontZ - 0.16], GOLD, "pokerHandleBand", [0, 0, 1], 7);

  // Shovel: handle, neck, broad blade.
  rod([0.29, 0.78, frontZ - 0.16], [0.34, 0.31, frontZ - 0.17], 0.016, WOOD_DARK, "shovelHandle");
  rod([0.34, 0.31, frontZ - 0.17], [0.34, 0.23, frontZ - 0.17], 0.025, IRON, "shovelNeck");
  b.extrude(
    [
      [-0.12, 0],
      [0.12, 0],
      [0.15, 0.12],
      [0.08, 0.25],
      [-0.08, 0.25],
      [-0.15, 0.12],
    ],
    {
      at: [0.34, 0.04, frontZ - 0.18],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.028,
      bevel: 0.006,
      smoothing: 1,
      color: IRON,
      name: "shovelBlade",
      group: "forge",
    },
  );
  cyl(0.03, 0.035, [0.29, 0.78, frontZ - 0.16], GOLD, "shovelGripBand", [0, 1, 0], 7);

  // A few square stone chips and warm reflected rivets at the base.
  for (let i = 0; i < 6; i++) {
    const x = -0.42 + R() * 0.84;
    const z = -1.48 + R() * 0.22;
    const chip = box(
      [0.035 + R() * 0.025, 0.018, 0.028 + R() * 0.02],
      [x, 0.045, z],
      i % 2 ? STONE_DARK : STONE,
      `forgeChip${i}`,
      [0, R() * 0.5, R() * 0.6],
    );
    void chip;
  }
}
    return buildForge;
  })(),
  // anvilStation
  (() => {
function buildAnvilStation({ b, J, P, M }: Ctx) {
  const wood = P.wood;
  const woodDark = P.woodDark;
  const iron = P.iron;
  const ironDark = P.ironDark;
  const steel = P.helmSteel;
  const steelEdge = P.steelEdge;
  const gold = P.gold;
  const ember = P.ember;
  const emberHot = P.emberHot;
  const water = P.water;
  const ink = P.ink;

  const V = (p: readonly number[]) => new THREE.Vector3(p[0], p[1], p[2]);

  const box = (
    size: [number, number, number],
    color: string,
    at: readonly number[],
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      rotation,
      flat: true,
    });

  const cyl = (
    radius: number,
    height: number,
    color: string,
    at: readonly number[],
    segments = 10,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      rotation,
      flat: true,
    });

  const cone = (
    radius: number,
    height: number,
    color: string,
    at: readonly number[],
    segments = 8,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.ConeGeometry(radius, height, segments), color, {
      at,
      rotation,
      flat: true,
    });

  const sphere = (radius: number, color: string, at: readonly number[], seg = 8) =>
    b.part(new THREE.SphereGeometry(radius, seg, Math.max(5, Math.floor(seg * 0.7))), color, {
      at,
      flat: true,
    });

  const torus = (
    major: number,
    minor: number,
    color: string,
    at: readonly number[],
    radial = 10,
    tubular = 5,
  ) =>
    b.part(
      new THREE.TorusGeometry(major, minor, tubular, radial),
      color,
      {
        at,
        rotation: [90, 0, 0],
        flat: true,
      },
    );

  const rod = (a: readonly number[], c: readonly number[], radius: number, color: string) =>
    b.rod(a, c, radius, { color, section: { ngon: 6 }, caps: "round" });

  const stump = V(M.groundAnvil);
  stump.y = 0;

  // ---------------------------------------------------------------------------
  // Faceted oak stump, with a broad foot and carved growth rings.
  // ---------------------------------------------------------------------------

  cyl(0.215, 0.42, wood, [stump.x, 0.215, stump.z], 10);
  cyl(0.235, 0.055, woodDark, [stump.x, 0.035, stump.z], 10);
  cyl(0.225, 0.035, wood, [stump.x, 0.445, stump.z], 10);

  // Vertical bark facets and dark split marks.
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const x = stump.x + Math.cos(a) * 0.215;
    const z = stump.z + Math.sin(a) * 0.215;
    box(
      [0.018, 0.34 + (i % 3) * 0.025, 0.012],
      i % 3 === 0 ? woodDark : wood,
      [x, 0.22, z],
      [0, -a * 180 / Math.PI, 0],
    );
  }

  // Growth ridges, slightly irregular in radius.
  for (let i = 0; i < 3; i++) {
    torus(0.205 + i * 0.006, 0.009, i === 1 ? woodDark : wood, [
      stump.x,
      0.095 + i * 0.15,
      stump.z,
    ], 12, 4);
  }

  // A few chunky wedge-shaped bark chips at the foot.
  for (const [dx, dz, rot] of [
    [-0.16, -0.08, -22],
    [0.17, 0.03, 31],
    [-0.05, 0.19, 8],
  ] as const) {
    box([0.055, 0.12, 0.035], woodDark, [stump.x + dx, 0.075, stump.z + dz], [0, rot, 0]);
  }

  // ---------------------------------------------------------------------------
  // Anvil base: flared feet, waist, shoulders, face plate.
  // ---------------------------------------------------------------------------

  const ax = stump.x;
  const az = stump.z;

  // Four splayed feet, giving the silhouette a heavy forged base.
  box([0.18, 0.11, 0.22], ironDark, [ax - 0.18, 0.515, az - 0.14], [0, -8, 0]);
  box([0.18, 0.11, 0.22], ironDark, [ax + 0.18, 0.515, az - 0.14], [0, 8, 0]);
  box([0.18, 0.11, 0.22], ironDark, [ax - 0.18, 0.515, az + 0.14], [0, 8, 0]);
  box([0.18, 0.11, 0.22], ironDark, [ax + 0.18, 0.515, az + 0.14], [0, -8, 0]);

  box([0.55, 0.105, 0.42], ironDark, [ax, 0.575, az]);
  box([0.40, 0.16, 0.34], iron, [ax, 0.675, az]);
  box([0.285, 0.22, 0.27], ironDark, [ax, 0.80, az]);

  // Shoulder shelf beneath the face, broad at both ends.
  box([0.56, 0.12, 0.48], iron, [ax, 0.875, az], [0, -15, 0]);
  box([0.60, 0.055, 0.50], steel, [ax, 0.952, az], [0, -15, 0]);
  box([0.56, 0.018, 0.46], steelEdge, [ax, 0.985, az], [0, -15, 0]);

  // Bright side rails around the face plate.
  box([0.035, 0.026, 0.47], steelEdge, [ax - 0.285, 0.985, az], [0, -15, 0]);
  box([0.035, 0.026, 0.47], steelEdge, [ax + 0.285, 0.985, az], [0, -15, 0]);

  // Forged horn projecting toward +X, with a small collar at its root.
  cyl(0.075, 0.09, steelDarkColor(P, iron), [ax + 0.31, 0.91, az], 8, [0, 0, 90]);
  const horn = b.sweep(
    [
      [ax + 0.32, 0.94, az],
      [ax + 0.45, 0.95, az],
      [ax + 0.62, 0.965, az],
      [ax + 0.78, 0.97, az],
    ],
    (t: number) => 0.075 * (1 - t) + 0.008,
    {
      color: steel,
      caps: { start: "flat", end: "point" },
      section: { ngon: 8 },
    },
  );
  void horn;
  torus(0.078, 0.012, steelEdge, [ax + 0.335, 0.94, az], 10, 4);

  // Hardie hole: dark square inset in the heel of the top plate.
  box([0.075, 0.012, 0.075], ironDark, [ax - 0.19, 0.995, az - 0.11], [0, -15, 0]);
  box([0.052, 0.014, 0.052], ink, [ax - 0.19, 1.004, az - 0.11], [0, -15, 0]);

  // Four tiny face rivets.
  for (const [dx, dz] of [
    [-0.235, -0.185],
    [-0.235, 0.185],
    [0.22, -0.18],
    [0.22, 0.18],
  ] as const) {
    cyl(0.012, 0.012, gold, [ax + dx, 1.01, az + dz], 7);
  }

  // ---------------------------------------------------------------------------
  // Glowing hot strip and bent red-hot bar on the face.
  // ---------------------------------------------------------------------------

  const hotStrip = box([0.21, 0.012, 0.035], emberHot, [ax + 0.13, 1.015, az + 0.03], [0, -15, 0]);
  glow(hotStrip, 1.8);

  const hotBarA = [ax + 0.04, 1.035, az + 0.015] as const;
  const hotBarB = [ax + 0.19, 1.05, az + 0.045] as const;
  const hotBarC = [ax + 0.29, 1.055, az + 0.12] as const;
  const bar1 = rod(hotBarA, hotBarB, 0.018, ember);
  const bar2 = rod(hotBarB, hotBarC, 0.017, emberHot);
  glow(bar1, 1.5);
  glow(bar2, 1.8);
  sphere(0.022, emberHot, hotBarB, 7);

  // ---------------------------------------------------------------------------
  // Quench bucket, half a metre toward +Z.
  // ---------------------------------------------------------------------------

  const bx = ax + 0.02;
  const bz = az + 0.49;
  cyl(0.145, 0.28, wood, [bx, 0.16, bz], 10);
  cyl(0.125, 0.035, woodDark, [bx, 0.31, bz], 10);
  cyl(0.115, 0.035, woodDark, [bx, 0.025, bz], 10);

  torus(0.145, 0.014, iron, [bx, 0.045, bz], 12, 5);
  torus(0.148, 0.014, iron, [bx, 0.29, bz], 12, 5);
  torus(0.135, 0.009, steelEdge, [bx, 0.30, bz], 12, 4);

  cyl(0.117, 0.012, water, [bx, 0.305, bz], 16);
  // Bail handle, two dark pivots and a faceted arch.
  sphere(0.018, ironDark, [bx - 0.132, 0.28, bz], 7);
  sphere(0.018, ironDark, [bx + 0.132, 0.28, bz], 7);
  rod([bx - 0.132, 0.28, bz], [bx, 0.48, bz], 0.009, iron);
  rod([bx, 0.48, bz], [bx + 0.132, 0.28, bz], 0.009, iron);

  // Steam puffs, deliberately sparse and cool-colored.
  sphere(0.037, water, [bx - 0.045, 0.39, bz + 0.015], 7);
  sphere(0.029, water, [bx + 0.025, 0.47, bz + 0.02], 7);
  sphere(0.021, water, [bx + 0.075, 0.54, bz + 0.015], 7);

  // ---------------------------------------------------------------------------
  // Tongs leaning against the rear (-Z) side of the stump.
  // ---------------------------------------------------------------------------

  const tx = ax - 0.055;
  const tz = az - 0.285;
  const pivot = [tx, 0.43, tz] as const;
  const leftTip = [tx - 0.13, 0.82, tz - 0.03] as const;
  const rightTip = [tx + 0.10, 0.78, tz - 0.01] as const;

  rod(pivot, leftTip, 0.014, iron);
  rod(pivot, rightTip, 0.014, iron);
  rod([tx - 0.012, 0.42, tz], [tx - 0.16, 0.16, tz - 0.01], 0.017, ironDark);
  rod([tx + 0.012, 0.42, tz], [tx + 0.15, 0.16, tz + 0.01], 0.017, ironDark);
  sphere(0.028, gold, pivot, 8);
  sphere(0.019, steelEdge, leftTip, 7);
  sphere(0.019, steelEdge, rightTip, 7);

  // A few small gold ferrules and a leather-like dark grip wrap.
  torus(0.021, 0.006, gold, [tx - 0.11, 0.255, tz], 8, 4);
  torus(0.021, 0.006, gold, [tx + 0.10, 0.255, tz], 8, 4);

  // Loose coal lumps tucked behind the anvil.
  sphere(0.045, ironDark, [ax - 0.30, 0.06, az - 0.24], 7);
  sphere(0.032, ironDark, [ax - 0.36, 0.045, az - 0.18], 7);
  sphere(0.026, ember, [ax - 0.28, 0.075, az - 0.21], 7);

  function steelDarkColor(palette: any, fallback: string) {
    return palette.steelDark ?? fallback;
  }
}
    return buildAnvilStation;
  })(),
  // dwarfBody
  (() => {
function buildDwarfBody({ b, J, P, M }: Ctx) {
  const tunic = P.tunic;
  const tunicDark = P.tunicDark;
  const leather = P.leather;
  const apron = P.apron;
  const apronDark = P.apronDark;
  const steel = P.helmSteel;
  const steelDark = P.steelDark;
  const steelEdge = P.steelEdge;
  const gold = P.gold;
  const beardDark = P.beardDark;
  const wood = P.wood;
  const woodDark = P.woodDark;
  const iron = P.iron;
  const ink = P.ink;

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    bone: any,
    name: string,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      rotation,
      flat: true,
      name,
      group: "dwarfBody",
    });

  const sphere = (
    radius: number,
    at: [number, number, number],
    scale: [number, number, number],
    color: string,
    bone: any,
    name: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      scale,
      bone,
      flat: true,
      name,
      group: "dwarfBody",
    });

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    bone: any,
    name: string,
    segments = 8,
    dir?: [number, number, number],
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      bone,
      dir,
      flat: true,
      name,
      group: "dwarfBody",
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    bone: any,
    name: string,
  ) => b.rod(a, c, radius, { color, bone, name, group: "dwarfBody" });

  // ---------------------------------------------------------------------------
  // Short, massively planted legs. The sweeps ride the supplied leg skeleton.
  // ---------------------------------------------------------------------------

  for (const side of [1, -1]) {
    const suffix = side > 0 ? "L" : "R";
    const hip = J[`hip${suffix}`];
    const knee = J[`knee${suffix}`];
    const ankle = J[`ankle${suffix}`];

    b.sweep(
      catmull([hip.at, knee.at, ankle.at]),
      (t: number) => 0.145 - t * 0.025,
      {
        bone: [hip, knee, ankle],
        color: tunicDark,
        section: "box",
        sides: 8,
        caps: "round",
        name: `dwarfBodyLeg${suffix}`,
        group: "dwarfBody",
      },
    );

    const x = side * 0.24;

    // Broad squared boot with a long forward toe.
    box([0.29, 0.18, 0.42], [x, 0.105, 0.045], leather, ankle, `dwarfBodyBoot${suffix}`);
    box([0.31, 0.035, 0.44], [x, 0.018, 0.055], woodDark, ankle, `dwarfBodySole${suffix}`);

    // Turned-up toe cap and ankle cuff.
    box([0.30, 0.075, 0.16], [x, 0.145, 0.18], leather, ankle, `dwarfBodyToe${suffix}`);
    b.sweep(
      polyline([
        [x - 0.145, 0.18, -0.04],
        [x + 0.145, 0.18, -0.04],
        [x + 0.145, 0.18, 0.10],
        [x - 0.145, 0.18, 0.10],
      ], { closed: true }),
      0.018,
      {
        bone: ankle,
        color: woodDark,
        section: { ngon: 6 },
        caps: "none",
        name: `dwarfBodyBootTrim${suffix}`,
        group: "dwarfBody",
      },
    );

    // Gold ankle buckle and two dark strap bars.
    box([0.10, 0.065, 0.018], [side * 0.16, 0.18, 0.105], gold, ankle, `dwarfBodyBuckle${suffix}`);
    box([0.31, 0.025, 0.025], [x, 0.20, 0.035], apronDark, ankle, `dwarfBodyBootStrapA${suffix}`);
    box([0.31, 0.025, 0.025], [x, 0.20, 0.105], apronDark, ankle, `dwarfBodyBootStrapB${suffix}`);
    cylinder(0.018, 0.022, [side * 0.205, 0.18, 0.105], steelEdge, ankle, `dwarfBodyBootStud${suffix}`, 6, [1, 0, 0]);
  }

  // ---------------------------------------------------------------------------
  // Barrel torso: a faceted, slightly tapered vertical tube following the spine.
  // ---------------------------------------------------------------------------

  const torsoPath = catmull([
    J.hips.at,
    J.spine.at,
    J.chest.at,
    [0, 1.27, -0.14],
  ]);

  const torso = b.sweep(torsoPath, (t: number) => {
    if (t < 0.18) return 0.43;
    if (t < 0.62) return 0.53;
    return 0.47;
  }, {
    bone: [J.hips, J.spine, J.chest],
    color: tunic,
    section: { ngon: 8 },
    caps: "round",
    shift: () => [0, -0.02],
    name: "dwarfBodyBarrelTorso",
    group: "dwarfBody",
  });

  // Dark lower hem gives the tunic a strong silhouette above the belt.
  b.sweep(
    polyline([
      [-0.43, 0.60, -0.15],
      [0.43, 0.60, -0.15],
      [0.49, 0.60, 0.10],
      [0.28, 0.60, 0.29],
      [-0.28, 0.60, 0.29],
      [-0.49, 0.60, 0.10],
    ], { closed: true }),
    0.034,
    {
      bone: J.hips,
      color: tunicDark,
      section: { ngon: 6 },
      caps: "none",
      name: "dwarfBodyTunicHem",
      group: "dwarfBody",
    },
  );

  // ---------------------------------------------------------------------------
  // Apron bib, with a jagged lower edge and a darker raised border.
  // ---------------------------------------------------------------------------

  const apronOutline: [number, number, "sharp"][] = [
    [-0.46, 0.00, "sharp"],
    [0.46, 0.00, "sharp"],
    [0.43, 0.09, "sharp"],
    [0.32, 0.06, "sharp"],
    [0.21, 0.10, "sharp"],
    [0.09, 0.055, "sharp"],
    [0.00, 0.10, "sharp"],
    [-0.10, 0.055, "sharp"],
    [-0.22, 0.10, "sharp"],
    [-0.33, 0.06, "sharp"],
    [-0.46, 0.09, "sharp"],
  ];

  b.extrude(apronOutline, {
    at: [0, 0.60, 0.305],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.025,
    bevel: 0.008,
    bone: J.chest,
    color: apron,
    name: "dwarfBodyApronBib",
    group: "dwarfBody",
  });

  const apronBorder: [number, number, "sharp"][] = [
    [-0.49, 0.00, "sharp"],
    [0.49, 0.00, "sharp"],
    [0.45, 0.085, "sharp"],
    [0.34, 0.055, "sharp"],
    [0.22, 0.095, "sharp"],
    [0.10, 0.05, "sharp"],
    [0.00, 0.095, "sharp"],
    [-0.11, 0.05, "sharp"],
    [-0.23, 0.095, "sharp"],
    [-0.35, 0.055, "sharp"],
    [-0.49, 0.085, "sharp"],
  ];

  b.extrude(apronBorder, {
    at: [0, 0.595, 0.323],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.003,
    bone: J.chest,
    color: apronDark,
    name: "dwarfBodyApronLowerEdge",
    group: "dwarfBody",
  });

  // Neck strap and heavy side straps.
  rod([-0.39, 1.22, 0.27], [0, 1.30, 0.28], 0.025, leather, J.chest, "dwarfBodyApronNeckStrapL");
  rod([0.39, 1.22, 0.27], [0, 1.30, 0.28], 0.025, leather, J.chest, "dwarfBodyApronNeckStrapR");
  rod([-0.43, 0.64, 0.335], [-0.43, 1.20, 0.335], 0.019, apronDark, J.chest, "dwarfBodyApronSideL");
  rod([0.43, 0.64, 0.335], [0.43, 1.20, 0.335], 0.019, apronDark, J.chest, "dwarfBodyApronSideR");

  // Apron scuffs and stitched chest marks.
  box([0.13, 0.075, 0.012], [-0.23, 0.83, 0.342], apronDark, J.chest, "dwarfBodyApronScuffL", [0.05, 0.0, -0.12]);
  box([0.09, 0.11, 0.012], [0.22, 0.97, 0.342], apronDark, J.chest, "dwarfBodyApronScuffR", [-0.12, 0.0, 0.08]);
  box([0.025, 0.30, 0.014], [-0.12, 1.04, 0.345], leather, J.chest, "dwarfBodyApronStitchL", [0.0, 0.0, -0.18]);
  box([0.025, 0.30, 0.014], [0.12, 1.04, 0.345], leather, J.chest, "dwarfBodyApronStitchR", [0.0, 0.0, 0.18]);

  // ---------------------------------------------------------------------------
  // Belt, buckle, tool loops, and a small mallet carried behind the left hip.
  // ---------------------------------------------------------------------------

  const beltLoop = polyline([
    [0.47, 0.66, -0.15],
    [0.34, 0.66, 0.22],
    [0.00, 0.66, 0.31],
    [-0.34, 0.66, 0.22],
    [-0.47, 0.66, -0.15],
    [-0.34, 0.66, -0.49],
    [0.00, 0.66, -0.56],
    [0.34, 0.66, -0.49],
  ], { closed: true });

  b.sweep(beltLoop, 0.043, {
    bone: J.hips,
    color: leather,
    section: { ngon: 6 },
    caps: "none",
    name: "dwarfBodyWideBelt",
    group: "dwarfBody",
  });

  box([0.19, 0.17, 0.035], [0, 0.70, 0.345], gold, J.hips, "dwarfBodyBigBuckle", [0, 0, 0]);
  box([0.125, 0.10, 0.018], [0, 0.70, 0.366], steelDark, J.hips, "dwarfBodyBuckleInset");
  cylinder(0.018, 0.022, [-0.085, 0.70, 0.375], steelEdge, J.hips, "dwarfBodyBucklePinL", 6, [0, 0, 1]);
  cylinder(0.018, 0.022, [0.085, 0.70, 0.375], steelEdge, J.hips, "dwarfBodyBucklePinR", 6, [0, 0, 1]);

  for (const [i, x] of [-0.28, 0.28, 0.40].entries()) {
    rod([x, 0.66, 0.28], [x, 0.82, 0.28], 0.014, apronDark, J.hips, `dwarfBodyToolLoop${i}`);
    cylinder(0.018, 0.022, [x, 0.80, 0.295], gold, J.hips, `dwarfBodyToolLoopStud${i}`, 6, [0, 0, 1]);
  }

  // Hanging mallet at the rear-left hip.
  rod([0.35, 0.61, -0.46], [0.35, 0.24, -0.48], 0.026, wood, J.hips, "dwarfBodyMalletHandle");
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.20, 8), iron, {
    at: [0.35, 0.22, -0.48],
    bone: J.hips,
    dir: [1, 0, 0],
    flat: true,
    name: "dwarfBodyMalletHead",
    group: "dwarfBody",
  });
  box([0.025, 0.19, 0.025], [0.35, 0.61, -0.46], woodDark, J.hips, "dwarfBodyMalletGrip");

  // ---------------------------------------------------------------------------
  // Chest panel, crossed lacing, and a suggestion of chain shirt at the neck.
  // ---------------------------------------------------------------------------

  b.extrude([
    [-0.25, 0.00, "sharp"],
    [0.25, 0.00, "sharp"],
    [0.22, 0.31, "sharp"],
    [0.00, 0.40, "sharp"],
    [-0.22, 0.31, "sharp"],
  ], {
    at: [0, 0.91, 0.285],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.016,
    bevel: 0.004,
    bone: J.chest,
    color: tunicDark,
    name: "dwarfBodyChestPanel",
    group: "dwarfBody",
  });

  rod([-0.19, 1.20, 0.313], [0.18, 0.96, 0.320], 0.012, leather, J.chest, "dwarfBodyCrossLaceA");
  rod([0.19, 1.20, 0.313], [-0.18, 0.96, 0.320], 0.012, leather, J.chest, "dwarfBodyCrossLaceB");
  for (let i = 0; i < 4; i++) {
    const y = 0.99 + i * 0.055;
    cylinder(0.014, 0.018, [-0.10 + i * 0.065, y, 0.334], gold, J.chest, `dwarfBodyLaceRivet${i}`, 6, [0, 0, 1]);
  }

  // Small overlapping discs read as a chain shirt beneath the beard.
  for (let i = 0; i < 7; i++) {
    const x = -0.18 + (i % 4) * 0.12;
    const y = 1.245 - Math.floor(i / 4) * 0.045;
    cylinder(0.027, 0.012, [x, y, 0.255], beardDark, J.chest, `dwarfBodyChain${i}`, 6, [0, 0, 1]);
  }

  // ---------------------------------------------------------------------------
  // Huge shoulder pauldrons: faceted domes, rims, and gold studs.
  // ---------------------------------------------------------------------------

  for (const side of [1, -1]) {
    const suffix = side > 0 ? "L" : "R";
    const x = side * 0.40;

    sphere(1, [x, 1.225, -0.145], [0.23, 0.16, 0.22], steel, J.chest, `dwarfBodyPauldron${suffix}`);

    // Rim torus is turned so its hole is vertical.
    b.part(new THREE.TorusGeometry(0.18, 0.018, 6, 10), steelEdge, {
      at: [x, 1.205, -0.145],
      bone: J.chest,
      rotation: [Math.PI / 2, 0, 0],
      flat: true,
      name: `dwarfBodyPauldronRim${suffix}`,
      group: "dwarfBody",
    });

    box([0.055, 0.13, 0.025], [x - side * 0.11, 1.24, 0.075], gold, J.chest, `dwarfBodyPauldronTrim${suffix}`, [0.0, 0.0, side * 0.3]);

    for (let i = 0; i < 3; i++) {
      const a = -0.75 + i * 0.75;
      const px = x + Math.cos(a) * 0.145;
      const py = 1.225 + Math.sin(a) * 0.105;
      sphere(0.018, [px, py, 0.045], [1, 1, 1], gold, J.chest, `dwarfBodyPauldronStud${suffix}${i}`);
    }
  }

  // ---------------------------------------------------------------------------
  // Thick collar at neckTop, built as a broad ring with layered leather/fur.
  // ---------------------------------------------------------------------------

  const collarPath = polyline([
    [-0.18, 1.255, -0.14],
    [-0.13, 1.255, 0.03],
    [0.00, 1.255, 0.10],
    [0.15, 1.255, 0.03],
    [0.18, 1.255, -0.14],
    [0.13, 1.255, -0.31],
    [0.00, 1.255, -0.37],
    [-0.14, 1.255, -0.31],
  ], { closed: true });

  b.sweep(collarPath, 0.052, {
    bone: J.chest,
    color: beardDark,
    section: { ngon: 6 },
    caps: "none",
    name: "dwarfBodyFurCollar",
    group: "dwarfBody",
  });

  const collarTrim = polyline([
    [-0.205, 1.28, -0.14],
    [-0.15, 1.28, 0.05],
    [0.00, 1.28, 0.12],
    [0.16, 1.28, 0.05],
    [0.205, 1.28, -0.14],
    [0.15, 1.28, -0.32],
    [0.00, 1.28, -0.40],
    [-0.15, 1.28, -0.32],
  ], { closed: true });

  b.sweep(collarTrim, 0.014, {
    bone: J.chest,
    color: leather,
    section: { ngon: 6 },
    caps: "none",
    name: "dwarfBodyCollarTrim",
    group: "dwarfBody",
  });

  // A few upward-facing collar tufts.
  for (let i = 0; i < 5; i++) {
    const x = -0.16 + i * 0.08;
    b.spike([x, 1.28, 0.025], [0, 1, 0.12], 0.075, 0.025, {
      color: beardDark,
      bone: J.chest,
      name: `dwarfBodyCollarTuft${i}`,
      group: "dwarfBody",
    });
  }

  // A final row of gold belt rivets gives the lower silhouette a crafted finish.
  for (let i = 0; i < 7; i++) {
    const a = -1.15 + i * 0.38;
    const x = Math.sin(a) * 0.48;
    const z = -0.15 + Math.cos(a) * 0.50;
    sphere(0.014, [x, 0.69, z], [1, 1, 1], gold, J.hips, `dwarfBodyBeltRivet${i}`);
  }
}
    return buildDwarfBody;
  })(),
  // dwarfHead
  (() => {
function buildDwarfHead({ b, J, P, M }: Ctx) {
  const head = J.head;
  const jaw = J.jaw;
  const neck = J.neck;

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    bone: any = head,
    scale?: [number, number, number],
  ) =>
    b.part(geometry, color, {
      at,
      bone,
      ...(scale ? { scale } : {}),
    });

  const sphere = (
    color: string,
    at: [number, number, number],
    scale: [number, number, number],
    bone: any = head,
    seg = 10,
  ) => part(new THREE.SphereGeometry(1, seg, Math.max(6, Math.floor(seg * 0.75))), color, at, bone, scale);

  const box = (
    color: string,
    at: [number, number, number],
    scale: [number, number, number],
    bone: any = head,
  ) => part(new THREE.BoxGeometry(1, 1, 1), color, at, bone, scale);

  const tube = (
    color: string,
    a: [number, number, number],
    c: [number, number, number],
    radius: number | [number, number],
    bone: any = head,
  ) => b.capsule(a, c, radius, { bone, color, sides: 7 });

  const spike = (
    color: string,
    a: [number, number, number],
    tip: [number, number, number],
    radius: number,
    bone: any = head,
  ) => b.spike(a, tip, null, radius, { bone, color, sides: 7 });

  const torusY = (color: string, at: [number, number, number], major: number, minor: number, bone: any = head) => {
    const g = new THREE.TorusGeometry(major, minor, 6, 12);
    g.rotateX(Math.PI / 2);
    return part(g, color, at, bone);
  };

  const dark = P.ink;
  const skin = P.skin;
  const skinShadow = P.skinShadow;
  const beard = P.beard;
  const beardDark = P.beardDark;
  const steel = P.helmSteel;
  const steelDark = P.steelDark;
  const edge = P.steelEdge;
  const gold = P.gold;

  // ---------------------------------------------------------------------------
  // Skull and ears: broad, heavy, exaggerated Warcraft proportions.
  // ---------------------------------------------------------------------------

  sphere(skin, [0, 1.585, -0.105], [0.315, 0.315, 0.275], head, 14);

  // Lower cheek planes add a squarer dwarf silhouette beneath the round skull.
  sphere(skinShadow, [0, 1.455, -0.005], [0.245, 0.18, 0.215], jaw, 10);
  sphere(skin, [0, 1.425, 0.055], [0.19, 0.12, 0.17], jaw, 9);

  for (const s of [-1, 1]) {
    sphere(skin, [s * 0.295, 1.59, -0.095], [0.075, 0.095, 0.045], head, 9);
    sphere(skinShadow, [s * 0.31, 1.59, -0.065], [0.042, 0.057, 0.018], head, 8);
  }

  // ---------------------------------------------------------------------------
  // Nose, eyes, pupils, brows and cheek stubble.
  // ---------------------------------------------------------------------------

  sphere(skin, [0, 1.565, 0.172], [0.105, 0.095, 0.105], head, 9);
  sphere(skinShadow, [0, 1.535, 0.226], [0.068, 0.047, 0.045], head, 8);

  for (const s of [-1, 1]) {
    sphere(dark, [s * 0.041, 1.545, 0.264], [0.017, 0.012, 0.008], head, 7);
    sphere("#f1dcc1", [s * 0.105, 1.635, 0.155], [0.058, 0.038, 0.018], head, 8);
    sphere(dark, [s * 0.105, 1.635, 0.174], [0.026, 0.029, 0.012], head, 8);

    // Heavy, angry brows.
    tube(
      beardDark,
      [s * 0.17, 1.705, 0.16],
      [s * 0.045, 1.68, 0.205],
      [0.029, 0.022],
      head,
    );

    // Orange sideburn spikes, fanning down the cheeks.
    for (let i = 0; i < 4; i++) {
      const y = 1.64 - i * 0.055;
      const x = s * (0.255 - i * 0.012);
      spike(beardDark, [x, y, 0.12], [s * (0.31 - i * 0.008), y - 0.045, 0.13], 0.018, head);
    }
  }

  // Small mouth slit and a separate lower lip on the jaw bone.
  tube(dark, [-0.065, 1.445, 0.205], [0.065, 1.445, 0.205], 0.009, jaw);
  sphere(skinShadow, [0, 1.415, 0.192], [0.075, 0.026, 0.026], jaw, 8);

  // ---------------------------------------------------------------------------
  // Beard silhouette and two large braided locks.
  // ---------------------------------------------------------------------------

  // Broad beard bib tucked into the collar and ending above the chest panel.
  sphere(beard, [0, 1.38, 0.135], [0.235, 0.23, 0.12], head, 10);
  sphere(beard, [0, 1.285, 0.105], [0.205, 0.19, 0.105], neck, 9);
  sphere(beardDark, [0, 1.235, 0.075], [0.16, 0.055, 0.07], neck, 8);

  // Central pointed beard lock.
  spike(beard, [0, 1.42, 0.13], [0, 1.235, 0.12], 0.085, jaw);
  tube(beardDark, [-0.12, 1.29, 0.17], [0.12, 1.29, 0.17], 0.014, neck);

  // Braids are deliberately chunky and segmented, with dark gaps and gold end rings.
  const braidY = [1.43, 1.365, 1.30, 1.245, 1.205];
  for (const s of [-1, 1]) {
    for (let i = 0; i < braidY.length; i++) {
      const y = braidY[i];
      const x = s * (0.105 + i * 0.006);
      const z = 0.19 + i * 0.012;
      const r = 0.064 - i * 0.008;
      sphere(beard, [x, y, z], [r, r * 0.72, r * 0.78], jaw, 8);
      if (i < braidY.length - 1) {
        torusY(beardDark, [x, y - 0.032, z + 0.004], r * 0.72, 0.012, jaw);
      }
    }
    torusY(gold, [s * 0.112, 1.17, 0.205], 0.043, 0.012, jaw);
    tube(gold, [s * 0.112, 1.155, 0.205], [s * 0.112, 1.185, 0.205], 0.012, jaw);
    spike(beard, [s * 0.112, 1.17, 0.205], [s * 0.112, 1.095, 0.225], 0.037, jaw);
  }

  // Strong chevron moustache over the upper lip.
  tube(beard, [0, 1.505, 0.235], [0.095, 1.485, 0.245], [0.045, 0.028], jaw);
  tube(beard, [0, 1.505, 0.235], [-0.095, 1.485, 0.245], [0.045, 0.028], jaw);
  tube(beardDark, [-0.205, 1.38, 0.16], [0.205, 1.38, 0.16], [0.014, 0.01], jaw);

  // ---------------------------------------------------------------------------
  // Steel helm, brow guard, nose guard, gold trim and rivets.
  // ---------------------------------------------------------------------------

  sphere(steel, [0, 1.755, -0.115], [0.335, 0.23, 0.285], head, 12);

  // Dark underside makes the cap read as a separate shell.
  torusY(steelDark, [0, 1.665, -0.115], 0.275, 0.027, head);
  torusY(edge, [0, 1.695, 0.115], 0.275, 0.018, head);

  // Gold brow band follows the front of the helmet.
  tube(gold, [-0.23, 1.695, 0.115], [0.23, 1.695, 0.115], 0.018, head);
  tube(edge, [-0.19, 1.715, 0.145], [0.19, 1.715, 0.145], 0.012, head);

  // Nose guard and its bright edge.
  box(steel, [0, 1.675, 0.19], [0.052, 0.19, 0.045], head);
  box(edge, [0, 1.58, 0.218], [0.022, 0.12, 0.014], head);
  box(gold, [0, 1.755, 0.205], [0.17, 0.022, 0.018], head);

  // Forehead emblem.
  sphere(gold, [0, 1.79, 0.198], [0.047, 0.047, 0.012], head, 8);
  box(steelDark, [0, 1.79, 0.213], [0.014, 0.032, 0.008], head);
  box(steelDark, [0, 1.79, 0.213], [0.032, 0.014, 0.008], head);

  // Helm rim rivets.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const x = s * (0.12 + i * 0.052);
      sphere(gold, [x, 1.705 + Math.abs(x) * 0.025, 0.14], [0.012, 0.012, 0.012], head, 6);
    }
  }

  // ---------------------------------------------------------------------------
  // Curved brass horns, rising beside and above the brows.
  // ---------------------------------------------------------------------------

  for (const s of [-1, 1]) {
    const hornPath = catmull([
      [s * 0.235, 1.78, -0.075],
      [s * 0.305, 1.82, -0.07],
      [s * 0.365, 1.885, -0.065],
      [s * 0.34, 1.935, -0.06],
      [s * 0.29, 1.955, -0.055],
    ]);
    b.sweep(hornPath, [0.043, 0.008], {
      bone: head,
      color: gold,
      caps: { start: "round", end: "point" },
      sides: 7,
    });

    // Dark horn-root collar.
    torusY(steelDark, [s * 0.245, 1.785, -0.07], 0.045, 0.012, head);
  }

  // A few tiny beard-bristle spikes at the jaw corners.
  const r = rng(71);
  for (let i = 0; i < 8; i++) {
    const s = i % 2 ? 1 : -1;
    const x = s * (0.16 + r() * 0.07);
    const y = 1.36 - r() * 0.13;
    spike(beardDark, [x, y, 0.155], [x + s * 0.035, y - 0.02, 0.16], 0.009, jaw);
  }
}
    return buildDwarfHead;
  })(),
  // armsAndHammer
  (() => {
function buildArmsAndHammer({ b, J, P, M }: Ctx) {
  const V = (p: any) => new THREE.Vector3(p[0], p[1], p[2]);
  const mid = (a: THREE.Vector3, c: THREE.Vector3) => a.clone().add(c).multiplyScalar(0.5);
  const dir = (a: THREE.Vector3, c: THREE.Vector3) => c.clone().sub(a).normalize();

  const skin = P.skin;
  const skinShadow = P.skinShadow;
  const tunic = P.tunic;
  const tunicDark = P.tunicDark;
  const leather = P.leather;
  const gold = P.gold;
  const iron = P.iron;
  const ironDark = P.ironDark;
  const steel = P.steelEdge;
  const steelDark = P.steelDark;
  const wood = P.wood;
  const woodDark = P.woodDark;

  const shoulderR = V(J.shoulderR.at);
  const elbowR = V(J.elbowR.at);
  const handR = V(J.handR.at);
  const shoulderL = V(J.shoulderL.at);
  const elbowL = V(J.elbowL.at);
  const handL = V(J.handL.at);

  const box = (
    size: [number, number, number],
    at: THREE.Vector3,
    color: string,
    bone: any,
    aim?: THREE.Vector3,
    name?: string,
  ) => {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      dir: aim,
      name,
      flat: true,
    });
  };

  const cyl = (
    radius: number,
    length: number,
    at: THREE.Vector3,
    color: string,
    bone: any,
    aim?: THREE.Vector3,
    name?: string,
  ) => {
    return b.part(new THREE.CylinderGeometry(radius, radius, length, 8, 1), color, {
      at,
      bone,
      dir: aim,
      name,
      flat: true,
    });
  };

  const rod = (
    a: THREE.Vector3,
    c: THREE.Vector3,
    radius: number,
    color: string,
    bone: any,
    name?: string,
  ) => b.capsule(a, c, radius, { color, bone, name, section: { ngon: 8 } });

  const plate = (
    size: [number, number, number],
    at: THREE.Vector3,
    color: string,
    bone: any,
    aim: THREE.Vector3,
    name?: string,
  ) => box(size, at, color, bone, aim, name);

  // ---------------------------------------------------------------------------
  // Right raised arm: a chunky flesh upper arm, sleeve socket and plated bracer.
  // ---------------------------------------------------------------------------

  b.sweep([shoulderR, elbowR], [0.115, 0.095], {
    color: skin,
    bone: [J.shoulderR, J.elbowR],
    section: { ngon: 8 },
    name: "rightUpperArm",
  });

  b.sweep([elbowR, handR], [0.09, 0.075], {
    color: skinShadow,
    bone: [J.elbowR, J.handR],
    section: { ngon: 8 },
    name: "rightForearm",
  });

  const rUpper = mid(shoulderR, elbowR);
  const rFore = mid(elbowR, handR);

  // Rolled blue sleeve cap buried beneath the pauldron.
  b.sweep(
    [
      shoulderR.clone().add(new THREE.Vector3(0.015, 0.015, 0)),
      shoulderR.clone().add(new THREE.Vector3(-0.08, 0.01, 0.005)),
    ],
    [0.145, 0.125],
    {
      color: tunic,
      bone: J.shoulderR,
      section: { ngon: 8 },
      caps: "round",
      name: "rightRolledSleeve",
    },
  );

  cyl(0.128, 0.018, rUpper.clone().add(new THREE.Vector3(-0.015, 0.015, 0.015)), tunicDark, J.shoulderR, dir(shoulderR, elbowR), "rightSleeveRim");

  // Broad leather bracer, aligned with the raised forearm.
  const rBrace = rFore.clone().add(new THREE.Vector3(-0.01, 0.005, 0.005));
  plate([0.19, 0.18, 0.16], rBrace, leather, J.elbowR, dir(elbowR, handR), "rightBracer");
  cyl(0.105, 0.018, rBrace.clone().addScaledVector(dir(elbowR, handR), -0.085), gold, J.elbowR, dir(elbowR, handR), "rightBracerTop");
  cyl(0.105, 0.018, rBrace.clone().addScaledVector(dir(elbowR, handR), 0.085), leather, J.elbowR, dir(elbowR, handR), "rightBracerBottom");
  box([0.045, 0.07, 0.018], rBrace.clone().add(new THREE.Vector3(-0.08, 0.02, 0.07)), gold, J.elbowR, dir(elbowR, handR), "rightBracerBuckle");

  // Elbow cap and a tiny steel hinge plate.
  b.part(new THREE.SphereGeometry(0.105, 8, 6), steelDark, {
    at: elbowR.clone().add(new THREE.Vector3(0, 0.015, 0)),
    bone: J.elbowR,
    scale: [1.1, 0.75, 1.05],
    name: "rightElbowCap",
    flat: true,
  });
  plate([0.095, 0.075, 0.025], elbowR.clone().add(new THREE.Vector3(0, 0.055, 0.055)), steel, J.elbowR, [0, 0, 1], "rightElbowPlate");

  // ---------------------------------------------------------------------------
  // Right fist and the fingers wrapped around the hammer shaft.
  // ---------------------------------------------------------------------------

  const fistR = handR.clone().add(new THREE.Vector3(0, 0.005, 0.015));
  b.part(new THREE.DodecahedronGeometry(0.105, 0), iron, {
    at: fistR,
    bone: J.handR,
    scale: [1.05, 0.9, 1.15],
    name: "rightGauntlet",
    flat: true,
  });

  const fingerAxisR = dir(elbowR, handR);
  const frontR = fistR.clone().add(new THREE.Vector3(0, 0.025, 0.09));
  for (let i = 0; i < 4; i++) {
    const x = -0.065 + i * 0.043;
    const f = frontR.clone().add(new THREE.Vector3(x, 0.015 - Math.abs(i - 1.5) * 0.006, 0));
    plate([0.035, 0.07, 0.045], f, ironDark, J.handR, fingerAxisR, `rightFinger${i}`);
    b.part(new THREE.SphereGeometry(0.018, 6, 4), steel, {
      at: f.clone().add(new THREE.Vector3(0, 0.03, 0.026)),
      bone: J.handR,
      name: `rightKnuckle${i}`,
      flat: true,
    });
  }
  plate(
    [0.055, 0.1, 0.045],
    fistR.clone().add(new THREE.Vector3(-0.085, -0.005, 0.02)),
    ironDark,
    J.handR,
    [0, 1, 0],
    "rightThumb",
  );
  cyl(0.025, 0.05, fistR.clone().add(new THREE.Vector3(0, 0.01, -0.08)), steel, J.handR, [0, 0, 1], "rightGauntletRivet");

  // ---------------------------------------------------------------------------
  // Left arm reaching down and forward to brace on the anvil.
  // ---------------------------------------------------------------------------

  b.sweep([shoulderL, elbowL], [0.115, 0.095], {
    color: skin,
    bone: [J.shoulderL, J.elbowL],
    section: { ngon: 8 },
    name: "leftUpperArm",
  });
  b.sweep([elbowL, handL], [0.092, 0.072], {
    color: skinShadow,
    bone: [J.elbowL, J.handL],
    section: { ngon: 8 },
    name: "leftForearm",
  });

  const lUpper = mid(shoulderL, elbowL);
  const lFore = mid(elbowL, handL);

  b.sweep(
    [
      shoulderL.clone().add(new THREE.Vector3(0.01, 0.01, 0)),
      shoulderL.clone().add(new THREE.Vector3(0.08, 0.0, 0.015)),
    ],
    [0.145, 0.12],
    {
      color: tunic,
      bone: J.shoulderL,
      section: { ngon: 8 },
      caps: "round",
      name: "leftRolledSleeve",
    },
  );
  cyl(0.128, 0.018, lUpper.clone().add(new THREE.Vector3(0.015, 0.015, 0.015)), tunicDark, J.shoulderL, dir(shoulderL, elbowL), "leftSleeveRim");

  plate([0.19, 0.18, 0.16], lFore, leather, J.elbowL, dir(elbowL, handL), "leftBracer");
  cyl(0.105, 0.018, lFore.clone().addScaledVector(dir(elbowL, handL), -0.085), gold, J.elbowL, dir(elbowL, handL), "leftBracerTop");
  cyl(0.105, 0.018, lFore.clone().addScaledVector(dir(elbowL, handL), 0.085), leather, J.elbowL, dir(elbowL, handL), "leftBracerBottom");
  box([0.045, 0.07, 0.018], lFore.clone().add(new THREE.Vector3(0.08, 0.02, 0.07)), gold, J.elbowL, dir(elbowL, handL), "leftBracerBuckle");

  b.part(new THREE.SphereGeometry(0.105, 8, 6), steelDark, {
    at: elbowL.clone().add(new THREE.Vector3(0, 0.015, 0)),
    bone: J.elbowL,
    scale: [1.1, 0.75, 1.05],
    name: "leftElbowCap",
    flat: true,
  });
  plate([0.095, 0.075, 0.025], elbowL.clone().add(new THREE.Vector3(0, 0.055, 0.055)), steel, J.elbowL, [0, 0, 1], "leftElbowPlate");

  // Left gauntlet is broad and flattened against the anvil face.
  const fistL = handL.clone().add(new THREE.Vector3(0, 0.015, 0.025));
  b.part(new THREE.DodecahedronGeometry(0.105, 0), iron, {
    at: fistL,
    bone: J.handL,
    scale: [1.08, 0.82, 1.2],
    name: "leftGauntlet",
    flat: true,
  });

  const frontL = fistL.clone().add(new THREE.Vector3(0, 0.03, 0.085));
  for (let i = 0; i < 4; i++) {
    const x = -0.065 + i * 0.043;
    const f = frontL.clone().add(new THREE.Vector3(x, -0.01 + Math.abs(i - 1.5) * 0.006, 0));
    plate([0.035, 0.07, 0.045], f, ironDark, J.handL, [0, 0, 1], `leftFinger${i}`);
    b.part(new THREE.SphereGeometry(0.018, 6, 4), steel, {
      at: f.clone().add(new THREE.Vector3(0, 0.03, 0.026)),
      bone: J.handL,
      name: `leftKnuckle${i}`,
      flat: true,
    });
  }
  plate([0.055, 0.1, 0.045], fistL.clone().add(new THREE.Vector3(0.085, -0.005, 0.02)), ironDark, J.handL, [0, 1, 0], "leftThumb");
  cyl(0.025, 0.05, fistL.clone().add(new THREE.Vector3(0, 0.01, -0.08)), steel, J.handL, [0, 0, 1], "leftGauntletRivet");

  // ---------------------------------------------------------------------------
  // The raised smith hammer. It is deliberately oversized and reads above the
  // shoulder silhouette without exceeding the supplied 1.9 m part box.
  // ---------------------------------------------------------------------------

  const shaftBottom = handR.clone().add(new THREE.Vector3(0.015, -0.18, -0.01));
  const shaftTop = new THREE.Vector3(-0.715, 1.775, 0.205);
  rod(shaftBottom, shaftTop, 0.032, wood, J.handR, "hammerHandle");

  // Grip wrap: three dark leather bands around the lower handle.
  for (let i = 0; i < 3; i++) {
    const p = shaftBottom.clone().lerp(shaftTop, 0.12 + i * 0.1);
    cyl(0.042, 0.018, p, woodDark, J.handR, fingerAxisR, `hammerGripWrap${i}`);
  }

  // Hammer head, with a central iron body, steel striking faces and gold collar.
  const headCenter = new THREE.Vector3(-0.715, 1.805, 0.205);
  box([0.29, 0.15, 0.19], headCenter, iron, J.handR, [1, 0, 0], "hammerHead");
  box([0.035, 0.13, 0.205], headCenter.clone().add(new THREE.Vector3(-0.165, 0, 0)), steelDark, J.handR, [1, 0, 0], "hammerStrikeLeft");
  box([0.035, 0.13, 0.205], headCenter.clone().add(new THREE.Vector3(0.165, 0, 0)), steel, J.handR, [1, 0, 0], "hammerStrikeRight");
  box([0.31, 0.025, 0.205], headCenter.clone().add(new THREE.Vector3(0, 0.078, 0)), steel, J.handR, [1, 0, 0], "hammerTopBevel");
  box([0.31, 0.025, 0.205], headCenter.clone().add(new THREE.Vector3(0, -0.078, 0)), steelDark, J.handR, [1, 0, 0], "hammerBottomBevel");

  // Gold neck band and a pair of side rivets.
  cyl(0.052, 0.035, new THREE.Vector3(-0.715, 1.70, 0.205), gold, J.handR, [0, 1, 0], "hammerGoldCollar");
  b.part(new THREE.SphereGeometry(0.022, 6, 4), gold, {
    at: headCenter.clone().add(new THREE.Vector3(-0.02, 0.082, 0)),
    bone: J.handR,
    name: "hammerRivetFront",
    flat: true,
  });
  b.part(new THREE.SphereGeometry(0.022, 6, 4), gold, {
    at: headCenter.clone().add(new THREE.Vector3(0.02, 0.082, 0)),
    bone: J.handR,
    name: "hammerRivetFront2",
    flat: true,
  });

  // Small leather thong below the hammer grip, adding a readable silhouette break.
  rod(
    shaftBottom.clone().add(new THREE.Vector3(0.045, -0.02, 0)),
    shaftBottom.clone().add(new THREE.Vector3(0.07, -0.08, 0.015)),
    0.012,
    leather,
    J.handR,
    "hammerThong",
  );
  b.part(new THREE.SphereGeometry(0.019, 6, 4), gold, {
    at: shaftBottom.clone().add(new THREE.Vector3(0.07, -0.085, 0.015)),
    bone: J.handR,
    name: "hammerThongStud",
    flat: true,
  });

  // A few exposed gold fasteners on each bracer and elbow make both arms read
  // as one coordinated blacksmith kit from the front.
  for (const [side, p, bone] of [
    ["R", rBrace, J.elbowR],
    ["L", lFore, J.elbowL],
  ] as const) {
    for (let i = 0; i < 2; i++) {
      b.part(new THREE.SphereGeometry(0.014, 6, 4), gold, {
        at: p.clone().add(new THREE.Vector3(side === "R" ? -0.075 : 0.075, -0.035 + i * 0.07, 0.085)),
        bone,
        name: `${side}BracerStud${i}`,
        flat: true,
      });
    }
  }
}
    return buildArmsAndHammer;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "dwarfBlacksmithAnvil" });
  const J: Record<string, Joint> = {};
  J["hips"] = b.joint("hips", { at: [0,0.58,-0.15], dir: [0,1,0], role: "spine" });
  J["spine"] = b.joint("spine", { parent: J["hips"], at: [0,0.8,-0.15], dir: [0,1,0], role: "spine" });
  J["chest"] = b.joint("chest", { parent: J["spine"], at: [0,1.02,-0.15], dir: [0,1,0], role: "spine" });
  J["neck"] = b.joint("neck", { parent: J["chest"], at: [0,1.28,-0.14], dir: [0,1,0], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,1.4,-0.12], dir: [0,0.15,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,1.36,-0.01], dir: [0,-0.35,1], role: "jaw" });
  J["shoulderR"] = b.joint("shoulderR", { parent: J["chest"], at: [-0.34,1.22,-0.15], dir: [-1,-0.2,0], role: "arm" });
  J["elbowR"] = b.joint("elbowR", { parent: J["shoulderR"], at: [-0.62,1.32,0.02], dir: [-0.45,0.85,0.25], role: "arm" });
  J["handR"] = b.joint("handR", { parent: J["elbowR"], at: [-0.72,1.72,0.2], dir: [-0.25,0.9,0.35], role: "arm" });
  J["shoulderL"] = b.joint("shoulderL", { parent: J["chest"], at: [0.34,1.22,-0.15], dir: [1,-0.25,0.1], role: "arm" });
  J["elbowL"] = b.joint("elbowL", { parent: J["shoulderL"], at: [0.62,1.06,0.12], dir: [0.45,-0.45,0.75], role: "arm" });
  J["handL"] = b.joint("handL", { parent: J["elbowL"], at: [0.88,0.92,0.5], dir: [0.3,-0.35,0.9], role: "arm" });
  J["hipL"] = b.joint("hipL", { parent: J["hips"], at: [0.19,0.56,-0.15], dir: [1,-1,0], role: "leg" });
  J["kneeL"] = b.joint("kneeL", { parent: J["hipL"], at: [0.23,0.3,-0.12], dir: [0.1,-1,0.2], role: "leg" });
  J["ankleL"] = b.joint("ankleL", { parent: J["kneeL"], at: [0.24,0.09,-0.04], dir: [0,0,1], role: "leg" });
  J["hipR"] = b.joint("hipR", { parent: J["hips"], at: [-0.19,0.56,-0.15], dir: [-1,-1,0], role: "leg" });
  J["kneeR"] = b.joint("kneeR", { parent: J["hipR"], at: [-0.23,0.3,-0.12], dir: [-0.1,-1,0.2], role: "leg" });
  J["ankleR"] = b.joint("ankleR", { parent: J["kneeR"], at: [-0.24,0.09,-0.04], dir: [0,0,1], role: "leg" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
