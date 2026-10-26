import * as THREE from "three";
import { type Builder, createBuilder, catmull, noise, paint, polyline, type ColorInput, svg, grain } from "../../../../src/index";

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

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const fract = (x: number) => x - Math.floor(x);

const ROOF_LEFT_PAINT = paint((p, n, s) => {
  if (n.y < 0.25) return PALETTE.roof;
  const slope = clamp01((p.y - 2.06) / 0.46);
  const x = p.x;
  const row = Math.floor(Math.abs(p.z) / 0.145);
  const edge = Math.abs(fract((x + 0.86) / 0.34) - 0.5);
  const diagonal = Math.abs(fract((x + 0.86) / 0.32 + slope * 1.65) - 0.5);
  const sunColumn = Math.abs(fract((x + 0.86) / 0.55) - 0.5);
  const sunBand = Math.abs(slope - 0.70);

  if (noise(p, 0.18, 41) < 0.10) return PALETTE.ink;
  if (Math.abs(fract(Math.abs(p.z) / 0.145) - 0.04) < 0.025) return PALETTE.ink;
  if (sunColumn < 0.055 && sunBand < 0.075) {
    if (Math.abs(sunBand) < 0.025) return PALETTE.gableLight;
    if (Math.abs(sunColumn) < 0.025) return PALETTE.red;
  }
  if (diagonal < 0.075) return row % 2 ? PALETTE.red : PALETTE.gableLight;
  if (edge < 0.055 && row % 2 === 0) return PALETTE.roofLight;
  if (s[1] > 0.2 && row === 2 && noise(p, 0.09, 55) > 0.78) return PALETTE.roofPurple;
  return PALETTE.roof;
});

const ROOF_RIGHT_PAINT = paint((p, n, s) => {
  if (n.y < 0.25) return PALETTE.roof;
  const slope = clamp01((p.y - 2.06) / 0.46);
  const x = -p.x;
  const row = Math.floor(Math.abs(p.z) / 0.145);
  const edge = Math.abs(fract((x + 0.86) / 0.34) - 0.5);
  const diagonal = Math.abs(fract((x + 0.86) / 0.32 + slope * 1.65) - 0.5);
  const sunColumn = Math.abs(fract((x + 0.86) / 0.55) - 0.5);
  const sunBand = Math.abs(slope - 0.70);

  if (noise(p, 0.18, 42) < 0.10) return PALETTE.ink;
  if (Math.abs(fract(Math.abs(p.z) / 0.145) - 0.04) < 0.025) return PALETTE.ink;
  if (sunColumn < 0.055 && sunBand < 0.075) {
    if (Math.abs(sunBand) < 0.025) return PALETTE.gableLight;
    if (Math.abs(sunColumn) < 0.025) return PALETTE.red;
  }
  if (diagonal < 0.075) return row % 2 ? PALETTE.red : PALETTE.gableLight;
  if (edge < 0.055 && row % 2 === 0) return PALETTE.roofLight;
  if (s[1] > 0.2 && row === 2 && noise(p, 0.09, 56) > 0.78) return PALETTE.roofPurple;
  return PALETTE.roof;
});

const FRONT_FOLK_PAINT = paint((p, n) => {
  if (n.z < 0.55) return p.y < 1.5 ? PALETTE.woodDark : PALETTE.wood;
  const x = p.x;
  const y = p.y;
  const inDoorOpening = Math.abs(x) < 0.275 && y > 1.27 && y < 1.93;
  if (inDoorOpening) return PALETTE.wood;
  const border = y < 1.39 || y > 1.88 || Math.abs(x) > 0.54;
  if (!border) return y < 1.55 ? PALETTE.woodLight : PALETTE.wood;
  if (Math.abs(y - 1.39) < 0.018 || Math.abs(y - 1.88) < 0.018 || Math.abs(Math.abs(x) - 0.54) < 0.018)
    return PALETTE.ink;

  const u = (x + 0.70) / 0.18;
  const v = y / 0.11;
  const diamond = Math.abs(fract(u) - 0.5) + Math.abs(fract(v) - 0.5);
  if (diamond < 0.28) return Math.floor(u + v) % 2 ? PALETTE.red : PALETTE.cream;
  if (diamond < 0.43) return PALETTE.teal;

  const rosette = Math.abs(Math.sin(x * 48) * Math.cos(y * 42));
  if (rosette > 0.91) return PALETTE.woodGold;
  return PALETTE.teal;
});

const DOOR_PAINT = paint((p, n) => {
  if (n.z < 0.5) return PALETTE.door;
  const x = p.x;
  const y = p.y;
  const border = Math.abs(x) > 0.17 || y < 1.285 || y > 1.80;
  if (border) {
    if (Math.abs(Math.abs(x) - 0.19) < 0.018 || Math.abs(y - 1.80) < 0.018) return PALETTE.ink;
    return PALETTE.red;
  }

  const grainNoise = noise(p, 0.055, 71);
  const grain = Math.sin(y * 67 + x * 13 + grainNoise * 4.5);
  let color = grain > 0.12 ? PALETTE.wood : PALETTE.woodDark;

  const markA = Math.abs(x + 0.115) < 0.018 && Math.abs(y - 1.39) < 0.042;
  const markB = Math.abs(x - 0.115) < 0.018 && Math.abs(y - 1.70) < 0.042;
  const markC = Math.abs(x + 0.12) < 0.018 && Math.abs(y - 1.73) < 0.042;
  if (markA || markB || markC) color = PALETTE.cream;

  if (Math.abs(x) < 0.075 && y > 1.39 && y < 1.72) color = PALETTE.wood;
  return color;
});

const CHICKEN_LEG_PAINT = paint((p, n, s) => {
  const t = clamp01(s[0]);
  const band = Math.floor(t * 9);
  let color = band % 2 === 0 ? PALETTE.legGold : PALETTE.legDark;

  const angle = ((s[1] % 360) + 360) % 360;
  const diamondPhase = fract(angle / 72 + t * 3.5);
  if (t > 0.23 && t < 0.48 && diamondPhase > 0.37 && diamondPhase < 0.63) {
    color = PALETTE.red;
  }

  if (n.z > 0.35 && n.y > -0.3) color = PALETTE.cream;
  if (noise(p, 0.07, 83) < 0.08) color = PALETTE.legDark;
  return color;
});

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
      polyline([legL.tip!.at, spec.midL, spec.tipL]),
      {
        parent: legL.tip!,
        names: [`toe${suffix}L`, `toe${suffix}MidL`, `toe${suffix}TipL`],
        role: "digit",
        group: "feet",
      },
    );

    const toeR = b.chain(
      `toe${suffix}R`,
      polyline([legR.tip!.at, spec.midR, spec.tipR]),
      {
        parent: legR.tip!,
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
    color: Fill,
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
    color: Fill,
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
    color: Fill,
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
    color: Fill,
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

  const legRadius = (t: number) => {
    if (t < 0.25) return 0.125;
    if (t < 0.48) return 0.105;
    if (t < 0.73) return 0.072;
    return 0.055;
  };

  b.sweep(legL, legRadius, {
    color: CHICKEN_LEG_PAINT,
    section: { ngon: 6 },
    caps: "round",
    name: "legTubeL",
    group: "legs",
  });

  b.sweep(legR, legRadius, {
    color: CHICKEN_LEG_PAINT,
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
      const actualToe = side === "L" ? toeChainsL[i] : toeChainsR[i];

      b.sweep(actualToe, [0.048, 0.017], {
        color: PALETTE.legLight,
        section: { ngon: 6 },
        caps: "round",
        name: `toeTube${side}${i}`,
        group: "feet",
      });

      b.spike(actualToe.tip, actualToe.tip, 0.11, 0.021, {
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

  addBox([1.38, 0.80, 1.14], PALETTE.woodDark, [0, 1.66, 0], "cabinCore");

  addBox([1.28, 0.72, 0.055], FRONT_FOLK_PAINT, [0, 1.66, 0.585], "wallFront");
  addBox([1.28, 0.72, 0.055], PALETTE.wood, [0, 1.66, -0.585], "wallBack");
  addBox([0.055, 0.72, 1.04], PALETTE.woodLight, [0.695, 1.66, 0], "wallLeft");
  addBox([0.055, 0.72, 1.04], PALETTE.woodLight, [-0.695, 1.66, 0], "wallRight");

  for (let i = 0; i < 4; i++) {
    const y = 1.34 + i * 0.205;
    addRod([-0.64, y, 0.625], [0.64, y, 0.625], 0.053, i % 2 ? PALETTE.woodLight : PALETTE.woodGold, `frontLog${i}`);
    addRod([-0.64, y, -0.625], [0.64, y, -0.625], 0.053, i % 2 ? PALETTE.woodLight : PALETTE.woodGold, `backLog${i}`);
  }

  for (let i = 0; i < 4; i++) {
    const y = 1.34 + i * 0.205;
    addRod([0.72, y, -0.52], [0.72, y, 0.52], 0.053, i % 2 ? PALETTE.woodGold : PALETTE.woodLight, `leftLog${i}`);
    addRod([-0.72, y, -0.52], [-0.72, y, 0.52], 0.053, i % 2 ? PALETTE.woodGold : PALETTE.woodLight, `rightLog${i}`);

    for (const x of [0.73, -0.73]) {
      addCylinder(0.053, 0.018, PALETTE.woodDark, [x, y, 0.54], `logEndFront${i}${x > 0 ? "L" : "R"}`, 8, [1, 0, 0]);
      addCylinder(0.053, 0.018, PALETTE.woodDark, [x, y, -0.54], `logEndBack${i}${x > 0 ? "L" : "R"}`, 8, [1, 0, 0]);
    }
  }

  for (const x of [-0.69, 0.69]) {
    for (const z of [-0.57, 0.57]) {
      addRod([x, 1.23, z], [x, 2.08, z], 0.065, PALETTE.woodDark, `cornerPost${x}${z}`);
      addCylinder(0.08, 0.035, PALETTE.woodGold, [x, 1.24, z], `cornerFoot${x}${z}`, 8);
      addCylinder(0.08, 0.035, PALETTE.woodGold, [x, 2.07, z], `cornerCap${x}${z}`, 8);
    }
  }

  addBox([0.38, 0.56, 0.065], DOOR_PAINT, [0, 1.54, 0.655], "door");

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

  addBox([1.72, 0.12, 0.88], ROOF_LEFT_PAINT, [0, 2.36, 0.34], "roofLeft", [35, 0, 0]);
  addBox([1.72, 0.12, 0.88], ROOF_RIGHT_PAINT, [0, 2.36, -0.34], "roofRight", [-35, 0, 0]);

  addRod([-0.86, 2.09, 0.68], [0.86, 2.09, 0.68], 0.052, PALETTE.woodGold, "frontEave");
  addRod([-0.86, 2.09, -0.68], [0.86, 2.09, -0.68], 0.052, PALETTE.woodGold, "backEave");
  addRod([-0.88, 2.64, 0], [0.88, 2.64, 0], 0.064, PALETTE.woodDark, "ridgeBeam");

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

  for (const x of [-0.51, 0.51]) {
    addCylinder(0.055, 0.025, PALETTE.teal, [x, 1.99, 0.66], `upperRosette${x}`, 10, [0, 0, 1]);
    addCylinder(0.022, 0.03, PALETTE.cream, [x, 1.99, 0.68], `upperRosetteCore${x}`, 8, [0, 0, 1]);
  }

  for (const x of [-0.40, 0.40]) {
    addRod([x, 1.29, 0.675], [x + (x > 0 ? -0.045 : 0.045), 1.37, 0.675], 0.014, PALETTE.teal, `doorCarvingA${x}`);
    addRod([x + (x > 0 ? -0.045 : 0.045), 1.37, 0.675], [x, 1.45, 0.675], 0.014, PALETTE.teal, `doorCarvingB${x}`);
  }

  for (const add of STAGE2) add(b);

  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addDoorTalisman(b: Builder) {
  const IRON = "#292936";
  const GOLD = PALETTE.woodGold;
  const RED = PALETTE.red;
  const CREAM = PALETTE.cream;
  const bone = "hutRoot";
  const cx = 0;
  const cy = 1.56;
  const faceZ = 0.698;

  const point = (r: number, angle: number, z = faceZ): [number, number, number] => [
    cx + Math.sin(angle) * r,
    cy + Math.cos(angle) * r,
    z,
  ];

  const disk = (
    radius: number,
    depth: number,
    color: string,
    z: number,
    name: string,
    segments = 16,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, {
      bone,
      at: [cx, cy, z],
      dir: [0, 0, 1],
      flat: true,
      name,
      group: "folk-talisman",
    });

  const bead = (
    radius: number,
    at: [number, number, number],
    color: string,
    name: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 5), color, {
      bone,
      at,
      flat: true,
      name,
      group: "folk-talisman",
    });

  // A dark carved backing plate sinks slightly into the door and gives the ornament a strong silhouette.
  disk(0.118, 0.014, IRON, 0.692, "s21TalismanBacking", 16);

  // Eight broad pointed rays, alternating the warm folk colours.
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const base = point(0.061, angle, 0.700);
    const tip = point(0.137, angle, 0.700);
    b.spike(base, tip, null, 0.014, {
      bone,
      color: i % 2 === 0 ? RED : CREAM,
      section: { ngon: 6 },
      caps: "point",
      name: `s21SunRay${i}`,
      group: "folk-talisman",
    });

    // Small carved studs sit just inside the iron rim.
    bead(
      0.0085,
      point(0.112, angle, 0.707),
      i % 2 === 0 ? CREAM : RED,
      `s21RimStud${i}`,
    );
  }

  // Heavy iron outline around the sun.
  b.part(new THREE.TorusGeometry(0.111, 0.007, 6, 20), IRON, {
    bone,
    at: [cx, cy, 0.704],
    dir: [0, 0, 1],
    flat: true,
    name: "s21IronSunOutline",
    group: "folk-talisman",
  });

  // Gold center, with a raised red inner ring and a cream carved hub.
  disk(0.082, 0.016, GOLD, 0.704, "s21GoldSunCenter", 16);

  b.part(new THREE.TorusGeometry(0.070, 0.005, 6, 16), RED, {
    bone,
    at: [cx, cy, 0.714],
    dir: [0, 0, 1],
    flat: true,
    name: "s21RedInnerRing",
    group: "folk-talisman",
  });

  for (let i = 0; i < 4; i++) {
    const angle = Math.PI / 4 + i * (Math.PI / 2);
    b.rod(point(0.017, angle, 0.716), point(0.056, angle, 0.716), 0.0048, {
      bone,
      color: i % 2 === 0 ? RED : CREAM,
      section: { ngon: 6 },
      caps: "round",
      name: `s21CarvedSpoke${i}`,
      group: "folk-talisman",
    });
  }

  bead(0.018, [cx, cy, 0.721], CREAM, "s21SunHub");
  bead(0.008, [cx, cy, 0.732], IRON, "s21SunHubPeg");

  // Two hanging cords emerge from the lower edge of the talisman.
  for (const side of [-1, 1]) {
    const x = side * 0.052;
    const cordTop: [number, number, number] = [x, 1.445, 0.705];
    const cordBottom: [number, number, number] = [x, 1.399, 0.705];

    b.rod(cordTop, cordBottom, 0.0055, {
      bone,
      color: RED,
      section: { ngon: 5 },
      caps: "round",
      name: `s21BellCord${side > 0 ? "L" : "R"}`,
      group: "folk-talisman",
    });

    bead(0.012, cordTop, GOLD, `s21BellTopBead${side > 0 ? "L" : "R"}`);

    // Low-poly bell body: a small ochre cone with a dark iron mouth.
    b.part(new THREE.ConeGeometry(0.027, 0.046, 8), GOLD, {
      bone,
      at: [x, 1.378, 0.705],
      flat: true,
      name: `s21BellBody${side > 0 ? "L" : "R"}`,
      group: "folk-talisman",
    });

    b.part(new THREE.TorusGeometry(0.022, 0.005, 5, 12), IRON, {
      bone,
      at: [x, 1.356, 0.705],
      flat: true,
      name: `s21BellMouth${side > 0 ? "L" : "R"}`,
      group: "folk-talisman",
    });

    bead(0.009, [x, 1.345, 0.705], RED, `s21BellClapper${side > 0 ? "L" : "R"}`);

    // A tiny cream bead below each bell makes the hanging ornament read at a distance.
    bead(0.006, [x, 1.329, 0.705], CREAM, `s21BellDrop${side > 0 ? "L" : "R"}`);
  }
}
    return addDoorTalisman;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addLeftShutters(b: Builder) {
  const bone = "hutRoot";
  const group = "stage2-left-shutters";

  const shutterCenters = [
    { id: "A", z: -0.22, outerZ: -0.30, innerZ: -0.145 },
    { id: "B", z: 0.30, outerZ: 0.38, innerZ: 0.225 },
  ] as const;

  const panelX = 0.775;
  const faceX = 0.802;
  const ornamentX = 0.807;
  const claspX = 0.812;
  const midY = 1.72;

  const crescentTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 96">
      <path
        d="M43 9
           C24 13 14 28 14 48
           C14 68 25 83 43 87
           C34 78 30 66 30 48
           C30 30 35 17 43 9Z"
        fill="${PALETTE.gableLight}"
        stroke="${PALETTE.ink}"
        stroke-width="3"
        stroke-linejoin="round"/>
      <circle cx="20" cy="21" r="3.4" fill="${PALETTE.cream}"/>
      <circle cx="18" cy="75" r="2.5" fill="${PALETTE.red}"/>
    </svg>`,
    { size: 128 },
  );

  const diamond: [number, number][] = [
    [-0.052, 0],
    [0, 0.068],
    [0.052, 0],
    [0, -0.068],
  ];

  const smallDiamond: [number, number][] = [
    [-0.025, 0],
    [0, 0.033],
    [0.025, 0],
    [0, -0.033],
  ];

  const addBox = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    name: string,
  ) => {
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      bone,
      at,
      flat: true,
      name,
      group,
    });
  };

  const addRod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) => {
    b.rod(a, c, radius, {
      bone,
      color,
      section: { ngon: 6 },
      caps: "round",
      name,
      group,
    });
  };

  const addDisc = (
    radius: number,
    depth: number,
    color: string,
    at: [number, number, number],
    name: string,
    segments = 8,
  ) => {
    b.part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, {
      bone,
      at,
      dir: [1, 0, 0],
      flat: true,
      name,
      group,
    });
  };

  for (const shutter of shutterCenters) {
    const z = shutter.z;

    // Chunky shutter board, recessed inset, and a raised folk-art face panel.
    addBox([0.048, 0.405, 0.15], PALETTE.teal, [panelX, midY, z], `s22_shutterBoard${shutter.id}`);
    addBox([0.014, 0.318, 0.108], PALETTE.blue, [0.799, midY, z], `s22_shutterInset${shutter.id}`);

    // Gold rails make each shutter read as a carved wooden assembly.
    addRod(
      [faceX, 1.525, z - 0.065],
      [faceX, 1.915, z - 0.065],
      0.014,
      PALETTE.gableLight,
      `s22_shutterRailInner${shutter.id}`,
    );
    addRod(
      [faceX, 1.525, z + 0.065],
      [faceX, 1.915, z + 0.065],
      0.014,
      PALETTE.gableLight,
      `s22_shutterRailOuter${shutter.id}`,
    );
    addRod(
      [faceX, 1.535, z - 0.073],
      [faceX, 1.535, z + 0.073],
      0.014,
      PALETTE.gableLight,
      `s22_shutterRailBottom${shutter.id}`,
    );
    addRod(
      [faceX, 1.905, z - 0.073],
      [faceX, 1.905, z + 0.073],
      0.014,
      PALETTE.gableLight,
      `s22_shutterRailTop${shutter.id}`,
    );

    // A red carved diamond is raised from the face rather than merely painted flat.
    b.extrude(diamond, {
      bone,
      at: [ornamentX, 1.635, z],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.003,
      color: PALETTE.red,
      name: `s22_redDiamond${shutter.id}`,
      group,
    });

    // Tiny cream diamond below it gives the shutter a repeated Slavic motif.
    b.extrude(smallDiamond, {
      bone,
      at: [ornamentX, 1.825, z],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.009,
      bevel: 0.002,
      color: PALETTE.cream,
      name: `s22_smallDiamond${shutter.id}`,
      group,
    });

    // A transparent textured plane carries the distinctive gold crescent clasp.
    b.part(new THREE.PlaneGeometry(0.076, 0.112), PALETTE.cream, {
      bone,
      at: [claspX, 1.745, z],
      dir: [1, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      texture: crescentTexture,
      name: `s22_crescentClasp${shutter.id}`,
      group,
    });

    // Black iron hinges sit on the outer edge, with gold pin heads.
    for (const y of [1.57, 1.87]) {
      addDisc(
        0.027,
        0.024,
        PALETTE.ink,
        [0.803, y, shutter.outerZ],
        `s22_blackHinge${shutter.id}${y}`,
        8,
      );
      addDisc(
        0.010,
        0.030,
        PALETTE.gableLight,
        [0.818, y, shutter.outerZ],
        `s22_hingePin${shutter.id}${y}`,
        7,
      );
    }

    // Four small corner studs and two blue-green side stitches add handmade construction detail.
    for (const y of [1.56, 1.88]) {
      for (const zz of [z - 0.058, z + 0.058]) {
        b.part(new THREE.SphereGeometry(0.014, 7, 5), PALETTE.cream, {
          bone,
          at: [0.817, y, zz],
          flat: true,
          name: `s22_cornerStud${shutter.id}${y}${zz}`,
          group,
        });
      }
    }

    addRod(
      [0.812, 1.69, z - 0.048],
      [0.812, 1.69, z + 0.048],
      0.006,
      PALETTE.berry,
      `s22_shutterStitchLower${shutter.id}`,
    );
    addRod(
      [0.812, 1.755, z - 0.048],
      [0.812, 1.755, z + 0.048],
      0.006,
      PALETTE.berry,
      `s22_shutterStitchUpper${shutter.id}`,
    );
  }

  // A short dark bridge and two gold catch plates imply the pair can be latched together.
  addRod(
    [0.814, 1.695, -0.145],
    [0.814, 1.695, 0.225],
    0.008,
    PALETTE.ink,
    "s22_shutterLatchBridge",
  );

  for (const z of [-0.145, 0.225]) {
    addDisc(0.022, 0.018, PALETTE.gableLight, [0.823, 1.695, z], `s22_shutterLatchPlate${z}`, 8);
    b.part(new THREE.SphereGeometry(0.009, 6, 4), PALETTE.red, {
      bone,
      at: [0.835, 1.695, z],
      flat: true,
      name: `s22_shutterLatchDot${z}`,
      group,
    });
  }
}
    return addLeftShutters;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addRightShutters(b: Builder) {
  const BONE = "hutRoot";
  const GROUP = "stage2-right-shutters-finial";

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    name: string,
    options: Partial<{
      dir: [number, number, number];
      rotation: [number, number, number];
      scale: [number, number, number];
    }> = {},
  ) =>
    b.part(geometry, color, {
      bone: BONE,
      at,
      name,
      group: GROUP,
      ...options,
    });

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    name: string,
  ) => part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, at, name);

  const cylinder = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    name: string,
    segments = 8,
    dir: [number, number, number] = [0, 1, 0],
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, height, segments),
      color,
      at,
      name,
      { dir },
    );

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) =>
    b.rod(a, c, radius, {
      bone: BONE,
      color,
      section: { ngon: 6 },
      caps: "round",
      name,
      group: GROUP,
    });

  const extrude = (
    outline: [number, number][],
    at: [number, number, number],
    color: string,
    name: string,
    thickness: number,
    x: [number, number, number],
    y: [number, number, number] = [0, 1, 0],
  ) =>
    b.extrude(outline, {
      bone: BONE,
      at,
      x,
      y,
      thickness,
      bevel: thickness * 0.22,
      smoothing: 0,
      color,
      name,
      group: GROUP,
    });

  // -------------------------------------------------------------------------------------------------------------
  // Right-side shutters. The hut's right side is model-space -X, so their decorated faces point toward -X.

  const shutterX = -0.785;
  const faceX = -0.822;
  const shutterY = 1.72;
  const shutters = [
    { id: "back", z: -0.185, outerZ: -0.265 },
    { id: "front", z: 0.255, outerZ: 0.335 },
  ] as const;

  for (const shutter of shutters) {
    const z = shutter.z;

    box(
      [0.068, 0.305, 0.145],
      PALETTE.teal,
      [shutterX, shutterY, z],
      `s23RightShutterPanel_${shutter.id}`,
    );

    // Chunky ochre frame, inset slightly into the painted blue-green plank.
    const trimX = -0.824;
    const z0 = z - 0.067;
    const z1 = z + 0.067;
    const y0 = shutterY - 0.142;
    const y1 = shutterY + 0.142;

    rod([trimX, y0, z0], [trimX, y1, z0], 0.010, PALETTE.woodGold, `s23ShutterTrimOuter_${shutter.id}`);
    rod([trimX, y0, z1], [trimX, y1, z1], 0.010, PALETTE.woodGold, `s23ShutterTrimInner_${shutter.id}`);
    rod([trimX, y0, z0], [trimX, y0, z1], 0.010, PALETTE.woodGold, `s23ShutterTrimBottom_${shutter.id}`);
    rod([trimX, y1, z0], [trimX, y1, z1], 0.010, PALETTE.woodGold, `s23ShutterTrimTop_${shutter.id}`);

    // A broad folk-art diamond, deliberately oversized so it reads in the diorama.
    extrude(
      [
        [-0.047, 0],
        [0, 0.063],
        [0.047, 0],
        [0, -0.063],
      ],
      [faceX, shutterY, z],
      PALETTE.red,
      `s23ShutterDiamond_${shutter.id}`,
      0.012,
      [0, 0, 1],
    );

    // Cream diamond seed and four tiny dark nail heads.
    cylinder(
      0.014,
      0.018,
      PALETTE.cream,
      [faceX - 0.009, shutterY, z],
      `s23ShutterDiamondSeed_${shutter.id}`,
      7,
      [-1, 0, 0],
    );

    for (const [dy, dz, suffix] of [
      [0.112, -0.052, "a"],
      [0.112, 0.052, "b"],
      [-0.112, -0.052, "c"],
      [-0.112, 0.052, "d"],
    ] as const) {
      cylinder(
        0.010,
        0.017,
        PALETTE.ink,
        [faceX - 0.011, shutterY + dy, z + dz],
        `s23ShutterNail_${shutter.id}_${suffix}`,
        6,
        [-1, 0, 0],
      );
    }

    // Two visible black hinge barrels on the outside edge of each shutter.
    for (const [y, suffix] of [
      [shutterY - 0.105, "low"],
      [shutterY + 0.105, "high"],
    ] as const) {
      cylinder(
        0.021,
        0.070,
        PALETTE.ink,
        [faceX - 0.014, y, shutter.outerZ],
        `s23ShutterHinge_${shutter.id}_${suffix}`,
        7,
        [0, 1, 0],
      );
      cylinder(
        0.010,
        0.078,
        PALETTE.woodGold,
        [faceX - 0.027, y, shutter.outerZ],
        `s23ShutterHingePin_${shutter.id}_${suffix}`,
        6,
        [0, 1, 0],
      );
    }
  }

  // A single gold crescent clasp sits over the meeting gap between the two shutters.
  extrude(
    [
      [-0.052, -0.062],
      [0.005, -0.062],
      [0.049, -0.035],
      [0.065, 0],
      [0.049, 0.035],
      [0.005, 0.062],
      [-0.052, 0.062],
      [-0.020, 0.034],
      [0.012, 0],
      [-0.020, -0.034],
    ],
    [faceX - 0.020, shutterY, 0.035],
    PALETTE.woodGold,
    "s23ShutterCrescentClasp",
    0.016,
    [0, 0, 1],
  );

  cylinder(
    0.018,
    0.024,
    PALETTE.cream,
    [faceX - 0.031, shutterY, 0.035],
    "s23ShutterClaspPin",
    8,
    [-1, 0, 0],
  );

  // -------------------------------------------------------------------------------------------------------------
  // Ridge finial: carved pole, golden sun, red curled leaves, and small painted rays.

  rod(
    [0, 2.625, 0.005],
    [0, 2.925, 0.005],
    0.018,
    PALETTE.woodDark,
    "s23FinialPole",
  );

  cylinder(
    0.092,
    0.022,
    PALETTE.woodGold,
    [0, 2.825, 0.045],
    "s23FinialSunDisk",
    12,
    [0, 0, 1],
  );

  cylinder(
    0.039,
    0.026,
    PALETTE.red,
    [0, 2.825, 0.061],
    "s23FinialSunCore",
    10,
    [0, 0, 1],
  );

  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const x0 = Math.sin(angle) * 0.046;
    const y0 = 2.825 + Math.cos(angle) * 0.046;
    const x1 = Math.sin(angle) * 0.126;
    const y1 = 2.825 + Math.cos(angle) * 0.126;

    rod(
      [x0, y0, 0.078],
      [x1, y1, 0.078],
      0.007,
      i % 2 === 0 ? PALETTE.cream : PALETTE.red,
      `s23FinialSunRay_${i}`,
    );
  }

  // Two opposing curls grow from the pole behind the sun and hook outward.
  const curlL = catmull([
    [-0.025, 2.735, 0.035],
    [-0.095, 2.705, 0.035],
    [-0.155, 2.755, 0.035],
    [-0.122, 2.835, 0.035],
    [-0.082, 2.858, 0.035],
  ]);

  const curlR = catmull([
    [0.025, 2.735, 0.035],
    [0.095, 2.705, 0.035],
    [0.155, 2.755, 0.035],
    [0.122, 2.835, 0.035],
    [0.082, 2.858, 0.035],
  ]);

  b.sweep(curlL, [0.014, 0.003], {
    bone: BONE,
    color: PALETTE.red,
    section: { ngon: 6 },
    caps: { start: "round", end: "point" },
    name: "s23FinialCurlL",
    group: GROUP,
  });

  b.sweep(curlR, [0.014, 0.003], {
    bone: BONE,
    color: PALETTE.red,
    section: { ngon: 6 },
    caps: { start: "round", end: "point" },
    name: "s23FinialCurlR",
    group: GROUP,
  });

  // Pointed red leaves cap the curls. Their cream veins make the silhouette legible rather than merely blobby.
  const leafOutline: [number, number][] = [
    [0, 0],
    [0.040, 0.006],
    [0.095, 0.057],
    [0.043, 0.050],
    [-0.016, 0.024],
  ];

  extrude(
    leafOutline,
    [-0.082, 2.858, 0.040],
    PALETTE.red,
    "s23FinialLeafL",
    0.014,
    [-1, 0, 0],
  );

  extrude(
    leafOutline,
    [0.082, 2.858, 0.040],
    PALETTE.red,
    "s23FinialLeafR",
    0.014,
    [1, 0, 0],
  );

  rod(
    [-0.082, 2.858, 0.038],
    [-0.148, 2.900, 0.038],
    0.006,
    PALETTE.cream,
    "s23FinialLeafVeinL",
  );

  rod(
    [0.082, 2.858, 0.038],
    [0.148, 2.900, 0.038],
    0.006,
    PALETTE.cream,
    "s23FinialLeafVeinR",
  );

  // Tiny gold cap at the pole tip, tucked between the two leaves.
  cylinder(
    0.026,
    0.035,
    PALETTE.woodGold,
    [0, 2.925, 0.005],
    "s23FinialPoleCap",
    8,
    [0, 1, 0],
  );
}
    return addRightShutters;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addHangingHerbs(b: Builder) {
  const BONE = "hutRoot";
  const LEAF_DARK = "#3b6945";
  const LEAF_LIGHT = "#719b50";
  const STEM = "#b5793c";
  const RIBBON = "#8f343b";
  const SEED = "#f0d39a";

  const p = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) =>
    b.rod(a, c, radius, {
      bone: BONE,
      color,
      section: { ngon: 6 },
      caps: "round",
      flat: true,
      name,
      group: "hanging-herbs",
    });

  const bead = (
    at: [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 7, 5), color, {
      bone: BONE,
      at,
      flat: true,
      name,
      group: "hanging-herbs",
    });

  const leaf = (
    base: [number, number, number],
    side: 1 | -1,
    height: number,
    width: number,
    color: string,
    name: string,
  ) => {
    const outline: [number, number][] = [
      [0, 0],
      [side * width * 0.72, -height * 0.23],
      [side * width * 0.60, -height * 0.58],
      [0, -height],
      [-side * width * 0.50, -height * 0.60],
      [-side * width * 0.72, -height * 0.25],
    ];

    b.extrude(outline, {
      bone: BONE,
      at: base,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.006,
      bevel: 0.002,
      color,
      name,
      group: "herb-leaves",
    });

    rod(
      p(base[0], base[1] - 0.006, base[2] + 0.006),
      p(base[0], base[1] - height * 0.88, base[2] + 0.006),
      0.0025,
      PALETTE.woodGold,
      `${name}Vein`,
    );
  };

  const bundle = (
    index: number,
    x: number,
    z: number,
    phase: number,
  ) => {
    const tag = `Herb${index}`;

    // Short loop over the eave and a small dark wooden hanging peg.
    rod(
      p(x - 0.025, 2.095, z),
      p(x, 2.145, z - 0.006),
      0.006,
      PALETTE.woodDark,
      `${tag}CordLeft`,
    );
    rod(
      p(x, 2.145, z - 0.006),
      p(x + 0.025, 2.095, z),
      0.006,
      PALETTE.woodDark,
      `${tag}CordRight`,
    );
    bead(p(x, 2.095, z), 0.018, PALETTE.woodGold, `${tag}Peg`);

    const offsets = [-0.038, -0.013, 0.014, 0.040];
    const depths = [-0.018, 0.013, 0.026, -0.004];
    const lengths = [0.185, 0.215, 0.195, 0.165];

    for (let i = 0; i < offsets.length; i++) {
      const dx = offsets[i];
      const dz = depths[i];
      const sway = Math.sin(phase + i * 1.7) * 0.012;
      const top = p(x + dx * 0.72, 2.035, z + dz);
      const bottom = p(x + dx + sway, 1.835 + (i % 2) * 0.012, z + dz + 0.012);

      rod(top, bottom, 0.0055, STEM, `${tag}Stem${i}`);

      // A pair of leaves on each stalk, with alternating folk-art greens.
      const leafY = 1.955 - (i % 2) * 0.035;
      const leafX = x + dx * 0.56 + sway * 0.32;
      const leafZ = z + dz + 0.008;
      leaf(
        p(leafX, leafY, leafZ),
        i % 2 === 0 ? 1 : -1,
        0.067 + (i % 2) * 0.009,
        0.033,
        i % 2 === 0 ? LEAF_LIGHT : LEAF_DARK,
        `${tag}LeafA${i}`,
      );
      leaf(
        p(leafX + (i % 2 === 0 ? -0.008 : 0.008), leafY - 0.055, leafZ + 0.004),
        i % 2 === 0 ? -1 : 1,
        0.055,
        0.027,
        i % 2 === 0 ? LEAF_DARK : LEAF_LIGHT,
        `${tag}LeafB${i}`,
      );
    }

    // A broad red binding makes the herb bundle read as tied rather than merely hanging.
    rod(
      p(x - 0.060, 1.982, z - 0.024),
      p(x + 0.060, 1.982, z - 0.024),
      0.010,
      RIBBON,
      `${tag}Binding`,
    );
    rod(
      p(x - 0.052, 1.985, z - 0.023),
      p(x - 0.073, 1.905, z - 0.020),
      0.005,
      RIBBON,
      `${tag}RibbonLeft`,
    );
    rod(
      p(x + 0.052, 1.985, z - 0.023),
      p(x + 0.075, 1.915, z - 0.018),
      0.005,
      RIBBON,
      `${tag}RibbonRight`,
    );
    bead(p(x - 0.073, 1.900, z - 0.020), 0.009, SEED, `${tag}RibbonBeadL`);
    bead(p(x + 0.075, 1.910, z - 0.018), 0.009, SEED, `${tag}RibbonBeadR`);

    // Red berries sit low in each bunch, each with a tiny cream seed bead below it.
    const berries = [
      [-0.042, 1.855, 0.025],
      [0.005, 1.825, -0.004],
      [0.044, 1.872, 0.016],
    ] as const;

    berries.forEach(([bx, by, bz], i) => {
      const berry = p(x + bx, by, z + bz);
      bead(berry, 0.014, PALETTE.red, `${tag}Berry${i}`);
      bead(p(berry[0] + (i - 1) * 0.006, by - 0.025, berry[2] + 0.003), 0.007, SEED, `${tag}Seed${i}`);
      rod(
        p(berry[0], by + 0.018, berry[2]),
        p(berry[0], by + 0.035, berry[2]),
        0.0025,
        PALETTE.woodGold,
        `${tag}BerryStem${i}`,
      );
    });
  };

  // Three bunches fill the reserved eave space while preserving a little air between them.
  bundle(0, 0.335, 0.700, 0.2);
  bundle(1, 0.480, 0.708, 2.0);
  bundle(2, 0.625, 0.696, 3.8);
}
    return addHangingHerbs;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addBoneWindChime(b: Builder) {
  const bone = "hutRoot";
  const group = "stage2-bone-wind-chime";

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    name: string,
    options: Record<string, unknown> = {},
  ) =>
    b.part(geometry, color, {
      bone,
      at,
      flat: true,
      group,
      name,
      ...options,
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) =>
    b.rod(a, c, radius, {
      bone,
      color,
      caps: "round",
      section: { ngon: 6 },
      group,
      name,
    });

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: string,
    name: string,
    scale?: [number, number, number],
  ) =>
    part(new THREE.SphereGeometry(radius, 8, 6), color, at, name, {
      scale,
    });

  // The attachment cord is seated directly at the requested underside point.
  rod(
    [-0.48, 1.982, 0.705],
    [-0.48, 1.946, 0.705],
    0.006,
    PALETTE.bandRed,
    "s25ChimeMainCord",
  );

  sphere(
    0.014,
    [-0.48, 1.977, 0.705],
    PALETTE.blue,
    "s25ChimeTopBead",
  );

  // Dark carved crossbar, with faceted golden end plugs and red painted binding.
  part(
    new THREE.CylinderGeometry(0.018, 0.018, 0.285, 8),
    PALETTE.ink,
    [-0.48, 1.941, 0.707],
    "s25ChimeCrossbar",
    { dir: [1, 0, 0] },
  );

  for (const [x, name] of [
    [-0.625, "Left"],
    [-0.335, "Right"],
  ] as const) {
    sphere(0.027, [x, 1.941, 0.707], PALETTE.woodGold, `s25ChimeEndCap${name}`, [
      0.72,
      1,
      0.72,
    ]);
    part(
      new THREE.CylinderGeometry(0.024, 0.024, 0.012, 8),
      PALETTE.red,
      [x, 1.941, 0.707],
      `s25ChimeEndPaint${name}`,
      { dir: [1, 0, 0] },
    );
  }

  for (const [x, color, name] of [
    [-0.565, PALETTE.red, "Left"],
    [-0.48, PALETTE.cream, "Middle"],
    [-0.395, PALETTE.red, "Right"],
  ] as const) {
    part(
      new THREE.CylinderGeometry(0.022, 0.022, 0.012, 8),
      color,
      [x, 1.941, 0.707],
      `s25ChimeCrossbarBand${name}`,
      { dir: [1, 0, 0] },
    );
  }

  // A tiny painted eight-point folk rosette on the face of the crossbar.
  const rosette = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" fill="#211923"/>
      <path d="M32 5 L38 24 L58 14 L41 30 L59 42 L38 38 L32 59 L26 39 L6 50 L23 33 L5 22 L26 26 Z"
        fill="#d19b4e" stroke="#9d3d3e" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="32" cy="32" r="8" fill="#4f9a91" stroke="#f1d19a" stroke-width="3"/>
      <circle cx="32" cy="32" r="3.5" fill="#ae4b45"/>
    </svg>`,
    { size: 96 },
  );

  part(
    new THREE.PlaneGeometry(0.045, 0.045),
    "#ffffff",
    [-0.48, 1.941, 0.728],
    "s25ChimeFolkRosette",
    {
      dir: [0, 0, 1],
      axis: "z",
      texture: rosette,
    },
  );

  type ChimeSpec = {
    x: number;
    top: number;
    length: number;
    width: number;
    side: "left" | "middle" | "right";
  };

  const chimes: ChimeSpec[] = [
    { x: -0.566, top: 1.907, length: 0.083, width: 0.015, side: "left" },
    { x: -0.48, top: 1.902, length: 0.102, width: 0.016, side: "middle" },
    { x: -0.394, top: 1.908, length: 0.076, width: 0.014, side: "right" },
  ];

  for (const chime of chimes) {
    const bottom = chime.top - chime.length;
    const center = chime.top - chime.length / 2;
    const tag = chime.side[0].toUpperCase() + chime.side.slice(1);

    // Red thread and a small tied knot at each suspension point.
    rod(
      [chime.x, 1.927, 0.708],
      [chime.x, chime.top + 0.006, 0.708],
      0.0045,
      PALETTE.bandRed,
      `s25ChimeThread${tag}`,
    );
    sphere(0.010, [chime.x, chime.top + 0.004, 0.708], PALETTE.bandRed, `s25ChimeKnot${tag}`, [
      0.85,
      1.15,
      0.85,
    ]);

    // Faceted bone shaft.
    part(
      new THREE.CylinderGeometry(chime.width, chime.width * 0.82, chime.length - 0.022, 7),
      PALETTE.cream,
      [chime.x, center, 0.708],
      `s25BoneChimeShaft${tag}`,
    );

    // Uneven flared ends make the three pieces read as carved bone rather than plain tubes.
    part(
      new THREE.ConeGeometry(chime.width * 1.12, 0.018, 7),
      PALETTE.claw,
      [chime.x, chime.top - 0.009, 0.708],
      `s25BoneChimeTop${tag}`,
    );
    part(
      new THREE.ConeGeometry(chime.width * 0.98, 0.018, 7),
      PALETTE.claw,
      [chime.x, bottom + 0.009, 0.708],
      `s25BoneChimeBottom${tag}`,
    );

    // Painted red and blue folk bands on the shafts.
    part(
      new THREE.CylinderGeometry(chime.width * 1.08, chime.width * 1.08, 0.008, 7),
      tag === "Middle" ? PALETTE.blue : PALETTE.red,
      [chime.x, chime.top - 0.027, 0.708],
      `s25BoneChimeUpperBand${tag}`,
    );
    part(
      new THREE.CylinderGeometry(chime.width * 1.02, chime.width * 1.02, 0.007, 7),
      tag === "Middle" ? PALETTE.red : PALETTE.blue,
      [chime.x, bottom + 0.027, 0.708],
      `s25BoneChimeLowerBand${tag}`,
    );

    // Dark openings on the lower ends give each bone a little carved identity.
    sphere(0.0055, [chime.x, bottom - 0.001, 0.724], PALETTE.ink, `s25BoneChimeMouth${tag}`, [
      1,
      0.55,
      0.4,
    ]);
  }

  // Central clapper: a red cord, a blue faceted bead, and a short dark crosspiece.
  rod(
    [-0.48, 1.93, 0.709],
    [-0.48, 1.829, 0.709],
    0.004,
    PALETTE.bandRed,
    "s25ChimeClapperCord",
  );

  sphere(0.021, [-0.48, 1.824, 0.709], PALETTE.blue, "s25ChimeBlueBead", [
    0.9,
    1.12,
    0.9,
  ]);
  sphere(0.008, [-0.48, 1.846, 0.709], PALETTE.woodGold, "s25ChimeBeadCap", [
    0.85,
    0.65,
    0.85,
  ]);

  rod(
    [-0.535, 1.817, 0.709],
    [-0.425, 1.817, 0.709],
    0.007,
    PALETTE.ink,
    "s25ChimeClapperBar",
  );

  // Three short red tassel threads below the blue bead.
  for (const [dx, dz, i] of [
    [-0.012, 0.0, 0],
    [0, 0.006, 1],
    [0.012, 0.0, 2],
  ] as const) {
    rod(
      [-0.48, 1.809, 0.709],
      [-0.48 + dx, 1.802, 0.709 + dz],
      0.0032,
      PALETTE.bandRed,
      `s25ChimeTasselThread${i}`,
    );
    sphere(
      0.0055,
      [-0.48 + dx, 1.800, 0.709 + dz],
      i === 1 ? PALETTE.cream : PALETTE.red,
      `s25ChimeTasselTip${i}`,
      [0.8, 1.2, 0.8],
    );
  }

  // Small ochre hanging loops at the two outside positions make the assembly feel hand-tied.
  for (const [x, name] of [
    [-0.625, "Left"],
    [-0.335, "Right"],
  ] as const) {
    rod(
      [x, 1.935, 0.709],
      [x, 1.913, 0.709],
      0.0035,
      PALETTE.woodGold,
      `s25ChimeEndLoop${name}`,
    );
    sphere(0.009, [x, 1.909, 0.709], PALETTE.woodGold, `s25ChimeEndKnot${name}`);
  }
}
    return addBoneWindChime;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addSideBroom(b: Builder) {
  const hutBone = "hutRoot";
  const woodGrain = grain(PALETTE.woodDark, PALETTE.woodLight, {
    size: 0.045,
    axis: [0, 1, 0],
    seed: 2601,
  });
  const plateGrain = grain(PALETTE.woodGold, PALETTE.cream, {
    size: 0.028,
    axis: [0, 1, 0],
    seed: 2602,
  });

  const ring = (
    center: [number, number, number],
    radii: [number, number],
    tube: number,
    color: string,
    name: string,
    bone: string,
    count = 8,
  ) => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      pts.push([
        center[0] + Math.cos(a) * radii[0],
        center[1],
        center[2] + Math.sin(a) * radii[1],
      ]);
    }
    return b.sweep(polyline(pts, { closed: true }), tube, {
      bone,
      color,
      caps: "none",
      section: { ngon: 6 },
      name,
      group: "stage2",
    });
  };

  // -------------------------------------------------------------------------------------------------------------
  // Crooked witch's broom against the positive-X wall.

  const handlePath = catmull([
    [0.795, 1.105, -0.405],
    [0.815, 1.28, -0.395],
    [0.785, 1.49, -0.365],
    [0.825, 1.70, -0.315],
    [0.785, 1.92, -0.265],
  ]);

  b.sweep(handlePath, (t) => 0.031 - t * 0.006, {
    bone: hutBone,
    color: woodGrain,
    caps: "round",
    section: { ngon: 7 },
    name: "s26_broomHandle",
    group: "stage2",
  });

  // A carved cap and bead make the handle read as a folk-art object rather than a plain rod.
  b.part(new THREE.SphereGeometry(0.044, 8, 5), PALETTE.woodGold, {
    bone: hutBone,
    at: [0.785, 1.94, -0.265],
    flat: true,
    name: "s26_broomHandleCap",
    group: "stage2",
  });

  b.part(new THREE.SphereGeometry(0.018, 7, 5), PALETTE.red, {
    bone: hutBone,
    at: [0.785, 1.985, -0.265],
    flat: true,
    name: "s26_broomTopBead",
    group: "stage2",
  });

  // Blue and red painted bands follow the crooked handle.
  ring([0.802, 1.34, -0.385], [0.039, 0.031], 0.008, PALETTE.blue, "s26_broomBlueBandA", hutBone);
  ring([0.801, 1.375, -0.378], [0.040, 0.032], 0.008, PALETTE.red, "s26_broomRedBand", hutBone);
  ring([0.805, 1.705, -0.313], [0.037, 0.029], 0.008, PALETTE.blue, "s26_broomBlueBandB", hutBone);

  // Broad inner bundle gives the bristles a strong silhouette.
  b.sweep(
    catmull([
      [0.798, 1.135, -0.405],
      [0.796, 1.035, -0.425],
      [0.785, 0.905, -0.445],
    ]),
    [0.064, 0.038],
    {
      bone: hutBone,
      color: PALETTE.legGold,
      section: { ngon: 6 },
      caps: "round",
      name: "s26_broomBristleBundle",
      group: "stage2",
    },
  );

  // Individual stiff straw bundles make the lower edge irregular and hand-made.
  for (let i = -4; i <= 4; i++) {
    const u = i / 4;
    const top: [number, number, number] = [
      0.798 + u * 0.017,
      1.145 + Math.abs(u) * 0.008,
      -0.405 + u * 0.012,
    ];
    const bottom: [number, number, number] = [
      0.785 + u * 0.052,
      0.888 + (i % 2 === 0 ? 0.012 : -0.004),
      -0.447 + u * 0.038,
    ];
    b.rod(top, bottom, 0.014 - Math.abs(u) * 0.0015, {
      bone: hutBone,
      color: i % 3 === 0 ? PALETTE.cream : PALETTE.legLight,
      section: { ngon: 5 },
      caps: "round",
      name: `s26_broomStraw${i + 4}`,
      group: "stage2",
    });
  }

  // Darker end strokes and little blue-painted straw marks.
  for (let i = -2; i <= 2; i++) {
    const x = 0.785 + i * 0.025;
    const z = -0.452 + i * 0.019;
    b.rod(
      [x, 0.895, z],
      [x + i * 0.004, 0.925, z + 0.008],
      0.009,
      {
        bone: hutBone,
        color: i === 0 ? PALETTE.woodDark : PALETTE.legDark,
        section: { ngon: 5 },
        caps: "round",
        name: `s26_broomDarkTip${i + 2}`,
        group: "stage2",
      },
    );
  }

  // Twine tying the broom head together.
  ring([0.798, 1.115, -0.408], [0.072, 0.057], 0.009, PALETTE.red, "s26_broomBindingLower", hutBone);
  ring([0.798, 1.145, -0.405], [0.060, 0.048], 0.008, PALETTE.red, "s26_broomBindingUpper", hutBone);

  for (const [i, z] of [-1, 0, 1].map((v, i) => [i, -0.405 + v * 0.025] as const)) {
    b.rod(
      [0.735, 1.125 + i * 0.012, z],
      [0.707, 1.095 + i * 0.012, z - 0.008],
      0.006,
      {
        bone: hutBone,
        color: PALETTE.cream,
        section: { ngon: 5 },
        caps: "round",
        name: `s26_broomTieFiber${i}`,
        group: "stage2",
      },
    );
  }

  // A pair of tiny carved beads hangs from the binding.
  b.part(new THREE.SphereGeometry(0.017, 7, 5), PALETTE.cream, {
    bone: hutBone,
    at: [0.725, 1.075, -0.447],
    flat: true,
    name: "s26_broomTieBeadA",
    group: "stage2",
  });
  b.part(new THREE.SphereGeometry(0.014, 7, 5), PALETTE.blue, {
    bone: hutBone,
    at: [0.715, 1.065, -0.425],
    flat: true,
    name: "s26_broomTieBeadB",
    group: "stage2",
  });

  // -------------------------------------------------------------------------------------------------------------
  // Matching carved ankle spurs on both chicken legs.

  const spurForSide = (side: 1 | -1, label: "L" | "R", bone: string) => {
    const ankleX = side * 0.38;
    const y = 0.335;
    const z = 0.02;
    const outerX = side * 0.448;

    // Chunky ochre wooden plate, with a dark backing sunk toward the leg.
    b.part(new THREE.BoxGeometry(0.042, 0.132, 0.158), plateGrain, {
      bone,
      at: [outerX, y, z],
      flat: true,
      name: `s26_spurPlate${label}`,
      group: "stage2",
    });

    b.part(new THREE.BoxGeometry(0.018, 0.106, 0.132), PALETTE.woodDark, {
      bone,
      at: [side * 0.423, y, z],
      flat: true,
      name: `s26_spurBacking${label}`,
      group: "stage2",
    });

    // Red folk diamond on the outward face.
    b.extrude(
      [
        [-0.043, 0],
        [0, 0.050],
        [0.043, 0],
        [0, -0.050],
      ],
      {
        bone,
        at: [side * 0.472, y, z],
        x: [0, 0, -side],
        y: [0, 1, 0],
        thickness: 0.008,
        bevel: 0.003,
        color: PALETTE.red,
        name: `s26_spurDiamond${label}`,
        group: "stage2",
      },
    );

    // A narrow cream chevron crossing the carved diamond.
    b.rod(
      [side * 0.477, y - 0.031, z - 0.036],
      [side * 0.477, y + 0.031, z + 0.036],
      0.006,
      {
        bone,
        color: PALETTE.cream,
        section: { ngon: 5 },
        caps: "round",
        name: `s26_spurCarvingA${label}`,
        group: "stage2",
      },
    );
    b.rod(
      [side * 0.477, y - 0.031, z + 0.036],
      [side * 0.477, y + 0.031, z - 0.036],
      0.006,
      {
        bone,
        color: PALETTE.cream,
        section: { ngon: 5 },
        caps: "round",
        name: `s26_spurCarvingB${label}`,
        group: "stage2",
      },
    );

    // Two red cords wrap around the ankle above and below the plate.
    ring([ankleX, 0.278, z], [0.067, 0.064], 0.009, PALETTE.bandRed, `s26_spurCordLower${label}`, bone);
    ring([ankleX, 0.397, z], [0.067, 0.064], 0.009, PALETTE.bandRed, `s26_spurCordUpper${label}`, bone);

    // Blunt cream spurs project from the side plate.
    for (const [i, dz] of [-0.041, 0.041].entries()) {
      b.rod(
        [side * 0.467, y + (i === 0 ? -0.034 : 0.034), z + dz],
        [side * 0.515, y + (i === 0 ? -0.034 : 0.034), z + dz],
        0.017,
        {
          bone,
          color: PALETTE.claw,
          section: { ngon: 6 },
          caps: "round",
          name: `s26_spurSpike${label}${i}`,
          group: "stage2",
        },
      );
    }

    // Small ochre rivets hold the carved plate to its red cords.
    for (const dy of [-0.050, 0.050]) {
      b.part(new THREE.SphereGeometry(0.012, 7, 5), PALETTE.woodGold, {
        bone,
        at: [side * 0.478, y + dy, z],
        flat: true,
        name: `s26_spurRivet${label}${dy < 0 ? "A" : "B"}`,
        group: "stage2",
      });
    }
  };

  spurForSide(1, "L", "ankleL");
  spurForSide(-1, "R", "ankleR");
}
    return addSideBroom;
  })(),
);
