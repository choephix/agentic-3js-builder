import * as THREE from "three";
import { createBuilder, catmull, polyline } from "../../../../src/index";
import type { Builder } from "../../../../src/index";

export const PALETTE = {
  woodDark: "#3b1e22",
  wood: "#70402d",
  woodLight: "#a8663f",
  woodGold: "#c58a43",
  roof: "#263c3d",
  roofLight: "#46645b",
  roofPurple: "#56364f",
  gable: "#1d5960",
  gableLight: "#d19b4e",
  legGold: "#b67b36",
  legLight: "#d19a4b",
  legDark: "#693b2c",
  bandRed: "#9d3d3e",
  claw: "#dfc477",
  window: "#182a35",
  windowGlow: "#567f80",
  door: "#2b2228",
  ink: "#211923",
  cream: "#f1d19a",
  teal: "#4f9a91",
  blue: "#477ba0",
  red: "#ae4b45",
  berry: "#7c334d",
  chimney: "#4b4542",
  chimneyLight: "#73655b",
} as const;

export const meta = {
  name: "Baba Yaga's Hut on Chicken Legs",
  description:
    "A stylized Slavic folk-art diorama of a crooked timber hut perched on two expressive chicken legs, with a steep patterned roof, gables, windows, door, chimney, and folk-painted trim.",
};

export const REQUESTS = [
  {
    id: "doorTalisman",
    kind: "add",
    part: "door",
    what: "A large protective Slavic sun talisman on the front door: dark iron outline, warm gold center, eight alternating red and cream rays, and two small hanging bells. Keep it bold and folk-carved.",
    at: [0, 1.56, 0.67],
    normal: [0, 0, 1],
    bone: "hutRoot",
    room: [0.38, 0.42, 0.08],
  },
  {
    id: "leftShutters",
    kind: "add",
    part: "windowLeft",
    what: "A pair of chunky blue-green wooden shutters around the left-side window, each with red diamond paint, black hinges, and a gold crescent clasp.",
    at: [0.74, 1.72, 0.02],
    normal: [1, 0, 0],
    bone: "hutRoot",
    room: [0.16, 0.5, 0.58],
  },
  {
    id: "rightShutters",
    kind: "add",
    part: "windowRight",
    what: "A pair of chunky blue-green wooden shutters around the right-side window, each with red diamond paint, black hinges, and a gold crescent clasp. Mirror the opposite side.",
    at: [-0.74, 1.72, 0.02],
    normal: [-1, 0, 0],
    bone: "hutRoot",
    room: [0.16, 0.5, 0.58],
  },
  {
    id: "roofFinial",
    kind: "add",
    part: "ridgeBeam",
    what: "A carved witch-hut finial at the roof ridge: a little dark wooden pole, a stylized golden sun disk, and two curled red folk-art leaves. It should break the silhouette clearly without covering the chimney.",
    at: [0, 2.68, 0],
    normal: [0, 1, 0],
    bone: "hutRoot",
    room: [0.34, 0.46, 0.28],
  },
  {
    id: "hangingHerbs",
    kind: "add",
    part: "frontEave",
    what: "Three bundles of dried herbs and red berries hanging beneath the front eave on short cords, with green leaves, ochre stems, and small cream seed beads.",
    at: [0.48, 1.98, 0.68],
    normal: [0, -1, 0],
    bone: "hutRoot",
    room: [0.46, 0.42, 0.16],
  },
  {
    id: "boneWindChime",
    kind: "add",
    part: "frontEave",
    what: "A tiny folk bone wind chime under the opposite eave: a dark carved crossbar, three pale bone pieces, red thread, and a little blue bead. Keep it inside the hut silhouette.",
    at: [-0.48, 1.98, 0.68],
    normal: [0, -1, 0],
    bone: "hutRoot",
    room: [0.35, 0.36, 0.16],
  },
  {
    id: "sideBroom",
    kind: "add",
    part: "wallLeft",
    what: "A crooked witch's broom tied against the hut side: bent brown handle, bundled yellow bristles, red binding cord, and a few blue folk-painted bands.",
    at: [0.78, 1.42, -0.34],
    normal: [1, 0, 0],
    bone: "hutRoot",
    room: [0.18, 1.08, 0.26],
  },
  {
    id: "legSpurs",
    kind: "add",
    part: "legTubeL",
    what: "Matching carved wooden ankle spurs on both chicken legs: small ochre side plates, red cords, and two blunt cream spikes per ankle. Follow the existing leg bones and keep the feet planted.",
    at: [0.38, 0.34, 0.03],
    normal: [0, 1, 0],
    bone: "ankleL",
    room: [0.28, 0.28, 0.3],
  },
  {
    id: "roofRunes",
    kind: "texture",
    part: "roofLeft",
    what: "Paint the roof shingles with broad Slavic folk-art chevrons and small sun symbols in ROOF_LIGHT, GABLE_LIGHT, RED, and BERRY. Keep the main roof dark and leave the ridge beam plain.",
  },
  {
    id: "roofRunesMirror",
    kind: "texture",
    part: "roofRight",
    what: "Mirror the hand-painted Slavic chevron and sun-symbol pattern from the opposite roof slope, with slightly uneven brush edges and a few darker weathered shingles.",
  },
  {
    id: "frontFolkBand",
    kind: "texture",
    part: "wallFront",
    what: "Add a wide painted folk border around the front wall in TEAL, CREAM, RED, and WOOD_GOLD: repeating diamonds, little rosettes, and a thin dark outline. Do not cover the door or gable.",
  },
  {
    id: "doorWoodGrain",
    kind: "texture",
    part: "door",
    what: "Paint the door with vertical rough wood grain in WOOD_DARK and WOOD, a faded red border, and three small cream carved marks. Keep the center clear for the talisman.",
  },
  {
    id: "chickenLegPattern",
    kind: "texture",
    part: "legTubeL",
    what: "Paint both chicken legs with chunky alternating LEG_GOLD and LEG_DARK scale bands, a few red folk diamonds around the knees, and pale highlights on the forward-facing facets.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "baba-yaga-hut", detail: 1 });

  const root = b.joint("hutRoot", {
    at: [0, 1.13, 0],
    dir: [0, 1, 0],
    role: "spine",
    group: "hut",
  });

  const legPaths = {
    L: polyline([
      [0.38, 1.23, 0.0],
      [0.45, 0.82, 0.13],
      [0.37, 0.38, -0.01],
      [0.38, 0.13, 0.10],
    ]),
    R: polyline([
      [-0.38, 1.23, 0.0],
      [-0.45, 0.82, 0.13],
      [-0.37, 0.38, -0.01],
      [-0.38, 0.13, 0.10],
    ]),
  };

  const legL = b.chain("legL", legPaths.L, {
    parent: root,
    names: ["hipL", "kneeL", "ankleL", "footL"],
    role: "leg",
    contact: [0.38, 0, 0.10],
    group: "legs",
  });

  const legR = b.chain("legR", legPaths.R, {
    parent: root,
    names: ["hipR", "kneeR", "ankleR", "footR"],
    role: "leg",
    contact: [-0.38, 0, 0.10],
    group: "legs",
  });

  const toeSpecs = [
    {
      name: "inner",
      tipL: [0.15, 0.045, 0.31] as [number, number, number],
      tipR: [-0.15, 0.045, 0.31] as [number, number, number],
      midL: [0.28, 0.08, 0.20] as [number, number, number],
      midR: [-0.28, 0.08, 0.20] as [number, number, number],
    },
    {
      name: "middle",
      tipL: [0.38, 0.04, 0.53] as [number, number, number],
      tipR: [-0.38, 0.04, 0.53] as [number, number, number],
      midL: [0.38, 0.075, 0.25] as [number, number, number],
      midR: [-0.38, 0.075, 0.25] as [number, number, number],
    },
    {
      name: "outer",
      tipL: [0.68, 0.045, 0.27] as [number, number, number],
      tipR: [-0.68, 0.045, 0.27] as [number, number, number],
      midL: [0.51, 0.08, 0.19] as [number, number, number],
      midR: [-0.51, 0.08, 0.19] as [number, number, number],
    },
  ];

  const toeChainsL: ReturnType<typeof b.chain>[] = [];
  const toeChainsR: ReturnType<typeof b.chain>[] = [];

  for (const spec of toeSpecs) {
    const suffix = spec.name[0].toUpperCase() + spec.name.slice(1);

    const toeL = b.chain(
      `toe${suffix}L`,
      polyline([
        legL.tip.at,
        spec.midL,
        spec.tipL,
      ]),
      {
        parent: legL.tip,
        names: [`toe${suffix}L`, `toe${suffix}MidL`, `toe${suffix}TipL`],
        role: "digit",
        group: "feet",
      },
    );

    const toeR = b.chain(
      `toe${suffix}R`,
      polyline([
        legR.tip.at,
        spec.midR,
        spec.tipR,
      ]),
      {
        parent: legR.tip,
        names: [`toe${suffix}R`, `toe${suffix}MidR`, `toe${suffix}TipR`],
        role: "digit",
        group: "feet",
      },
    );

    toeChainsL.push(toeL);
    toeChainsR.push(toeR);
  }

  const addBox = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    name: string,
    rotation?: [number, number, number],
  ) => {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      bone: root,
      at,
      rotation,
      flat: true,
      name,
      group: "hut",
    });
  };

  const addCylinder = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    name: string,
    segments = 8,
    dir?: [number, number, number],
  ) => {
    return b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      bone: root,
      at,
      dir,
      flat: true,
      name,
      group: "hut",
    });
  };

  const addRod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name: string,
    section: { ngon: number } = { ngon: 8 },
  ) => {
    return b.rod(a, c, radius, {
      bone: root,
      color,
      section,
      caps: "round",
      name,
      group: "hut",
    });
  };

  const addTriangle = (
    outline: [number, number][],
    at: [number, number, number],
    color: string,
    name: string,
    thickness = 0.04,
  ) => {
    return b.extrude(outline, {
      bone: root,
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness,
      color,
      name,
      group: "folk",
    });
  };

  // -------------------------------------------------------------------------------------------------------------
  // Chicken legs. These are built before the hut so that every appendage has a clear rigging structure.

  const legRadius = (t: number) => {
    if (t < 0.25) return 0.125;
    if (t < 0.48) return 0.105;
    if (t < 0.73) return 0.072;
    return 0.055;
  };

  b.sweep(legL, legRadius, {
    color: PALETTE.legGold,
    section: { ngon: 6 },
    caps: "round",
    name: "legTubeL",
    group: "legs",
  });

  b.sweep(legR, legRadius, {
    color: PALETTE.legGold,
    section: { ngon: 6 },
    caps: "round",
    name: "legTubeR",
    group: "legs",
  });

  for (const [side, leg] of [
    ["L", legL],
    ["R", legR],
  ] as const) {
    const s = side === "L" ? 1 : -1;

    b.part(new THREE.SphereGeometry(0.135, 8, 6), PALETTE.legDark, {
      bone: leg.joints[0],
      at: leg.joints[0].at,
      scale: [1.05, 0.82, 1.0],
      flat: true,
      name: `thighKnot${side}`,
      group: "legs",
    });

    b.part(new THREE.SphereGeometry(0.105, 8, 6), PALETTE.legGold, {
      bone: leg.joints[1],
      at: leg.joints[1].at,
      scale: [1.08, 0.9, 1.08],
      flat: true,
      name: `kneeKnot${side}`,
      group: "legs",
    });

    b.part(new THREE.SphereGeometry(0.075, 7, 5), PALETTE.legDark, {
      bone: leg.joints[2],
      at: leg.joints[2].at,
      scale: [1.12, 0.82, 1.12],
      flat: true,
      name: `ankleKnot${side}`,
      group: "legs",
    });

    for (const [t, color, name] of [
      [0.31, PALETTE.bandRed, `kneeBand${side}`],
      [0.54, PALETTE.cream, `shinBand${side}`],
      [0.72, PALETTE.bandRed, `ankleBand${side}`],
    ] as const) {
      const at = leg.at(t);
      const radius = legRadius(t) * 1.08;
      const ring = b.ring(at, {
        count: 8,
        radius,
        name,
        role: "fan",
        group: "legs",
      });
      b.sweep(catmull(ring.items, { closed: true }), 0.014, {
        bone: at.bone ?? root,
        color,
        section: { ngon: 6 },
        caps: "none",
        name,
        group: "legs",
      });
    }

    for (let i = 0; i < 3; i++) {
      const toe = toeChainsL[i] ?? toeChainsR[i];
      const actualToe = side === "L" ? toeChainsL[i] : toeChainsR[i];

      b.sweep(actualToe, [0.048, 0.017], {
        color: PALETTE.legLight,
        section: { ngon: 6 },
        caps: "round",
        name: `toeTube${side}${i}`,
        group: "feet",
      });

      b.spike(actualToe.tip!, actualToe.tip!, 0.11, 0.021, {
        color: PALETTE.claw,
        section: { ngon: 6 },
        caps: "point",
        name: `claw${side}${i}`,
        group: "feet",
      });
    }

    b.part(new THREE.SphereGeometry(0.062, 7, 5), PALETTE.legDark, {
      bone: leg.tip!,
      at: leg.tip!.at,
      scale: [1.2, 0.65, 1.25],
      flat: true,
      name: `footPad${side}`,
      group: "feet",
    });

    const featherRoot = leg.at(0.23);
    for (let i = 0; i < 3; i++) {
      const z = 0.02 + i * 0.07;
      b.spike(
        featherRoot,
        [s * (0.16 + i * 0.035), 0.15 + i * 0.025, z],
        0.13 - i * 0.018,
        0.038,
        {
          color: i === 1 ? PALETTE.legLight : PALETTE.legDark,
          section: { ngon: 5 },
          caps: "point",
          name: `thighFeather${side}${i}`,
          group: "legs",
        },
      );
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Main cabin body and four deliberately named surfaces reserved for Stage 2.

  addBox([1.38, 0.80, 1.14], PALETTE.woodDark, [0, 1.66, 0], "cabinCore");

  addBox([1.28, 0.72, 0.055], PALETTE.wood, [0, 1.66, 0.585], "wallFront");
  addBox([1.28, 0.72, 0.055], PALETTE.wood, [0, 1.66, -0.585], "wallBack");
  addBox([0.055, 0.72, 1.04], PALETTE.woodLight, [0.695, 1.66, 0], "wallLeft");
  addBox([0.055, 0.72, 1.04], PALETTE.woodLight, [-0.695, 1.66, 0], "wallRight");

  // Horizontal front and rear logs.
  for (let i = 0; i < 4; i++) {
    const y = 1.34 + i * 0.205;
    addRod([-0.64, y, 0.625], [0.64, y, 0.625], 0.053, i % 2 ? PALETTE.woodLight : PALETTE.woodGold, `frontLog${i}`);
    addRod([-0.64, y, -0.625], [0.64, y, -0.625], 0.053, i % 2 ? PALETTE.woodLight : PALETTE.woodGold, `backLog${i}`);
  }

  // Side logs and their contrasting circular ends.
  for (let i = 0; i < 4; i++) {
    const y = 1.34 + i * 0.205;
    addRod([0.72, y, -0.52], [0.72, y, 0.52], 0.053, i % 2 ? PALETTE.woodGold : PALETTE.woodLight, `leftLog${i}`);
    addRod([-0.72, y, -0.52], [-0.72, y, 0.52], 0.053, i % 2 ? PALETTE.woodGold : PALETTE.woodLight, `rightLog${i}`);

    for (const x of [0.73, -0.73]) {
      addCylinder(0.053, 0.018, PALETTE.woodDark, [x, y, 0.54], `logEndFront${i}${x > 0 ? "L" : "R"}`, 8, [1, 0, 0]);
      addCylinder(0.053, 0.018, PALETTE.woodDark, [x, y, -0.54], `logEndBack${i}${x > 0 ? "L" : "R"}`, 8, [1, 0, 0]);
    }
  }

  // Four corner posts make the silhouette readable even behind the log courses.
  for (const x of [-0.69, 0.69]) {
    for (const z of [-0.57, 0.57]) {
      addRod([x, 1.23, z], [x, 2.08, z], 0.065, PALETTE.woodDark, `cornerPost${x}${z}`);
      addCylinder(0.08, 0.035, PALETTE.woodGold, [x, 1.24, z], `cornerFoot${x}${z}`, 8);
      addCylinder(0.08, 0.035, PALETTE.woodGold, [x, 2.07, z], `cornerCap${x}${z}`, 8);
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Front door and side windows. These are intentionally broad, uncluttered surfaces for Stage 2.

  addBox([0.38, 0.56, 0.065], PALETTE.door, [0, 1.54, 0.655], "door");

  addRod([-0.235, 1.23, 0.695], [-0.235, 1.86, 0.695], 0.042, PALETTE.woodGold, "doorFrameLeft");
  addRod([0.235, 1.23, 0.695], [0.235, 1.86, 0.695], 0.042, PALETTE.woodGold, "doorFrameRight");
  addRod([-0.25, 1.88, 0.695], [0.25, 1.88, 0.695], 0.045, PALETTE.woodGold, "doorFrameTop");
  addCylinder(0.034, 0.035, PALETTE.cream, [0.13, 1.53, 0.705], "doorKnob", 8, [0, 0, 1]);
  addCylinder(0.019, 0.044, PALETTE.ink, [-0.14, 1.56, 0.706], "doorHingeTop", 7, [0, 0, 1]);
  addCylinder(0.019, 0.044, PALETTE.ink, [-0.14, 1.35, 0.706], "doorHingeBottom", 7, [0, 0, 1]);

  for (const [side, x] of [
    ["L", 0.735],
    ["R", -0.735],
  ] as const) {
    addBox([0.06, 0.34, 0.39], PALETTE.window, [x, 1.72, 0.04], `window${side === "L" ? "Left" : "Right"}`);

    addRod([x * 1.025, 1.54, 0.04], [x * 1.025, 1.90, 0.04], 0.025, PALETTE.woodGold, `windowVertical${side}`);
    addRod([x * 1.025, 1.72, -0.20], [x * 1.025, 1.72, 0.28], 0.025, PALETTE.woodGold, `windowHorizontal${side}`);

    addCylinder(0.13, 0.018, PALETTE.windowGlow, [x * 1.04, 1.72, 0.04], `windowGlow${side}`, 10, [1, 0, 0]);
    addCylinder(0.11, 0.021, PALETTE.window, [x * 1.055, 1.72, 0.04], `windowInset${side}`, 10, [1, 0, 0]);

    for (const z of [-0.18, 0.26]) {
      addCylinder(0.028, 0.04, PALETTE.woodDark, [x * 1.07, 1.53, z], `windowHinge${side}${z}`, 7, [1, 0, 0]);
      addCylinder(0.028, 0.04, PALETTE.woodDark, [x * 1.07, 1.91, z], `windowLatch${side}${z}`, 7, [1, 0, 0]);
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Gables and the front folk sun.

  const gableOutline: [number, number][] = [
    [-0.67, 0],
    [0.67, 0],
    [0, 0.56],
  ];

  addTriangle(gableOutline, [0, 2.03, 0.60], PALETTE.gable, "gableFront", 0.055);
  addTriangle(gableOutline, [0, 2.03, -0.60], PALETTE.berry, "gableBack", 0.055);

  addRod([-0.67, 2.04, 0.655], [0, 2.59, 0.655], 0.032, PALETTE.woodGold, "gableBeamLeft");
  addRod([0.67, 2.04, 0.655], [0, 2.59, 0.655], 0.032, PALETTE.woodGold, "gableBeamRight");
  addRod([-0.67, 2.04, 0.655], [0.67, 2.04, 0.655], 0.032, PALETTE.woodGold, "gableBeamBase");

  addCylinder(0.17, 0.025, PALETTE.gableLight, [0, 2.25, 0.665], "frontSunDisk", 12, [0, 0, 1]);
  addCylinder(0.075, 0.032, PALETTE.red, [0, 2.25, 0.684], "frontSunCore", 10, [0, 0, 1]);

  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const x0 = Math.sin(a) * 0.10;
    const y0 = 2.25 + Math.cos(a) * 0.10;
    const x1 = Math.sin(a) * 0.205;
    const y1 = 2.25 + Math.cos(a) * 0.205;
    addRod([x0, y0, 0.695], [x1, y1, 0.695], 0.012, i % 2 ? PALETTE.cream : PALETTE.red, `sunRay${i}`);
  }

  for (const x of [-0.42, 0.42]) {
    addTriangle(
      [
        [-0.10, 0.10],
        [0.10, 0.10],
        [0, -0.10],
      ],
      [x, 1.13, 0.675],
      x > 0 ? PALETTE.red : PALETTE.teal,
      `frontPennant${x}`,
      0.022,
    );
    addRod([x, 1.22, 0.69], [x, 1.06, 0.69], 0.009, PALETTE.cream, `pennantCord${x}`);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Steep roof. The two named slabs remain visible and plain for Stage 2 painted shingle work.

  addBox([1.72, 0.12, 0.88], PALETTE.roof, [0, 2.36, 0.34], "roofLeft", [35, 0, 0]);
  addBox([1.72, 0.12, 0.88], PALETTE.roof, [0, 2.36, -0.34], "roofRight", [-35, 0, 0]);

  addRod([-0.86, 2.09, 0.68], [0.86, 2.09, 0.68], 0.052, PALETTE.woodGold, "frontEave");
  addRod([-0.86, 2.09, -0.68], [0.86, 2.09, -0.68], 0.052, PALETTE.woodGold, "backEave");
  addRod([-0.88, 2.64, 0], [0.88, 2.64, 0], 0.064, PALETTE.woodDark, "ridgeBeam");

  // Broad low-poly shingle blocks establish the roof rhythm without consuming its reserved surfaces.
  for (const side of [1, -1]) {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        const x = -0.64 + col * 0.32 + (row % 2 ? 0.04 : 0);
        const z = side * (0.10 + row * 0.145);
        const y = 2.57 - row * 0.135;
        const color =
          row % 3 === 0
            ? PALETTE.roofLight
            : col % 3 === 0
              ? PALETTE.roofPurple
              : PALETTE.roof;

        addBox(
          [0.285, 0.035, 0.19],
          color,
          [x, y + 0.055, z - side * 0.025],
          `shingle${side > 0 ? "L" : "R"}${row}${col}`,
          [side * 35, 0, 0],
        );
      }
    }
  }

  // Decorative roof corner caps.
  for (const x of [-0.84, 0.84]) {
    addCylinder(0.075, 0.18, PALETTE.woodGold, [x, 2.10, 0.69], `roofCornerFront${x}`, 8, [0, 0, 1]);
    addCylinder(0.075, 0.18, PALETTE.woodGold, [x, 2.10, -0.69], `roofCornerBack${x}`, 8, [0, 0, 1]);
    b.part(new THREE.SphereGeometry(0.075, 8, 5), PALETTE.red, {
      bone: root,
      at: [x, 2.20, 0.69],
      flat: true,
      name: `roofCornerKnob${x}`,
      group: "folk",
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Crooked chimney and its simple brick courses.

  addBox([0.22, 0.43, 0.22], PALETTE.chimney, [0.38, 2.50, -0.12], "chimney");
  addBox([0.29, 0.06, 0.28], PALETTE.chimneyLight, [0.38, 2.74, -0.12], "chimneyCap");

  for (let i = 0; i < 3; i++) {
    addBox(
      [0.235, 0.035, 0.235],
      i % 2 ? PALETTE.red : PALETTE.chimneyLight,
      [0.38, 2.34 + i * 0.13, -0.12],
      `chimneyCourse${i}`,
    );
  }

  addRod([0.29, 2.79, -0.12], [0.51, 2.84, -0.08], 0.018, PALETTE.woodDark, "chimneyCrook");
  b.part(new THREE.SphereGeometry(0.034, 7, 5), PALETTE.cream, {
    bone: root,
    at: [0.52, 2.84, -0.08],
    flat: true,
    name: "chimneyBead",
    group: "folk",
  });

  // Small carved corner motifs in the exposed upper wall.
  for (const x of [-0.51, 0.51]) {
    addCylinder(0.055, 0.025, PALETTE.teal, [x, 1.99, 0.66], `upperRosette${x}`, 10, [0, 0, 1]);
    addCylinder(0.022, 0.03, PALETTE.cream, [x, 1.99, 0.68], `upperRosetteCore${x}`, 8, [0, 0, 1]);
  }

  // A few chunky carved marks flank the door but leave the Stage 2 talisman area open.
  for (const x of [-0.40, 0.40]) {
    addRod([x, 1.29, 0.675], [x + (x > 0 ? -0.045 : 0.045), 1.37, 0.675], 0.014, PALETTE.teal, `doorCarvingA${x}`);
    addRod([x + (x > 0 ? -0.045 : 0.045), 1.37, 0.675], [x, 1.45, 0.675], 0.014, PALETTE.teal, `doorCarvingB${x}`);
  }

  // Finish with the Stage 2 hook so appended builders can use every live handle and surface.
  for (const add of STAGE2) add(b);

  return b.root;
}
