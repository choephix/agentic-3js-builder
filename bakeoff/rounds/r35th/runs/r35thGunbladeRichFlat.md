```ts
import * as THREE from "three";
import { createBuilder, catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Gunblade",
  description:
    "A stylized Final Fantasy-inspired gunblade with a broad silver blade, integrated firearm receiver, ornate gold guard, glowing blue chamber, engraved runes, and layered mechanical detailing.",
};

export default function build() {
  const b = createBuilder({ name: "gunblade", detail: 1 });

  const INK = "#171923";
  const BLACK_STEEL = "#252b38";
  const STEEL = "#657181";
  const SILVER = "#c9d4df";
  const HIGHLIGHT = "#f1f6fb";
  const BLUE_STEEL = "#354c70";
  const DEEP_BLUE = "#172746";
  const CYAN = "#62e9ff";
  const CYAN_DARK = "#167caa";
  const GOLD = "#b77a28";
  const GOLD_LIGHT = "#f2c762";
  const GOLD_DARK = "#68451b";
  const RED = "#a83242";
  const LEATHER = "#4b2725";
  const LEATHER_LIGHT = "#8b4d37";
  const GRIP = "#20212c";
  const PURPLE = "#6c4d9d";

  type P = [number, number, number];

  function partBox(
    size: [number, number, number],
    at: P,
    color: string,
    options: {
      rotation?: [number, number, number];
      name?: string;
      scale?: [number, number, number];
    } = {},
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      rotation: options.rotation,
      scale: options.scale,
      name: options.name,
    });
  }

  function sphere(
    radius: number,
    at: P,
    color: string,
    segments = 10,
    name?: string,
  ) {
    return b.part(
      new THREE.SphereGeometry(radius, segments, Math.max(5, Math.floor(segments * 0.7))),
      color,
      { at, name },
    );
  }

  function cylinder(
    radius: number,
    height: number,
    at: P,
    color: string,
    dir: P = [0, 1, 0],
    segments = 10,
    name?: string,
  ) {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, height, segments, 1, false),
      color,
      { at, dir, name },
    );
  }

  function disc(
    radius: number,
    depth: number,
    at: P,
    color: string,
    segments = 16,
    name?: string,
  ) {
    return cylinder(radius, depth, at, color, [0, 0, 1], segments, name);
  }

  function rod(
    a: P,
    c: P,
    radius: number,
    color: string,
    options: { caps?: "round" | "flat" | "point"; name?: string } = {},
  ) {
    return b.rod(a, c, radius, {
      color,
      caps: options.caps ?? "round",
      name: options.name,
      sides: 8,
    });
  }

  function capsule(a: P, c: P, radius: number, color: string, name?: string) {
    return b.capsule(a, c, radius, {
      color,
      name,
      sides: 8,
    });
  }

  function plate(
    outline: [number, number][],
    at: P,
    thickness: number,
    color: string,
    options: {
      bevel?: number;
      x?: P;
      y?: P;
      name?: string;
    } = {},
  ) {
    return b.extrude(outline, {
      at,
      x: options.x ?? [1, 0, 0],
      y: options.y ?? [0, 1, 0],
      thickness,
      bevel: options.bevel ?? Math.min(thickness * 0.35, 0.008),
      color,
      name: options.name,
    });
  }

  function torus(
    radius: number,
    tube: number,
    at: P,
    color: string,
    rotation: [number, number, number] = [0, 0, 0],
    name?: string,
  ) {
    return b.part(
      new THREE.TorusGeometry(radius, tube, 6, 16),
      color,
      { at, rotation, name },
    );
  }

  function diamond(
    x: number,
    y: number,
    width: number,
    height: number,
    z: number,
    color: string,
    name?: string,
  ) {
    return plate(
      [
        [0, height * 0.5],
        [width * 0.5, 0],
        [0, -height * 0.5],
        [-width * 0.5, 0],
      ],
      [x, y, z],
      0.014,
      color,
      { bevel: 0.003, name },
    );
  }

  function frontBar(
    x: number,
    y: number,
    width: number,
    height: number,
    z: number,
    color: string,
    name?: string,
  ) {
    return partBox([width, height, 0.014], [x, y, z], color, { name });
  }

  function stud(x: number, y: number, z: number, radius: number, color: string, name?: string) {
    return sphere(radius, [x, y, z], color, 8, name);
  }

  // ---------------------------------------------------------------------------
  // Pommel, grip, and lower handle
  // ---------------------------------------------------------------------------

  const pommel = b.lathe(
    [
      [0, 0],
      [0.082, 0],
      [0.118, 0.018],
      [0.125, 0.052],
      [0.095, 0.083],
      [0.093, 0.135],
      [0.055, 0.17],
      [0, 0.17],
    ],
    {
      at: [0, 0.006, 0],
      axis: [0, 1, 0],
      segments: 10,
      color: GOLD_DARK,
      name: "pommel.core",
    },
  );

  const pommelCap = b.lathe(
    [
      [0, 0],
      [0.07, 0],
      [0.09, 0.018],
      [0.074, 0.041],
      [0, 0.041],
    ],
    {
      at: [0, 0.008, 0.065],
      axis: [0, 1, 0],
      segments: 10,
      color: GOLD,
      name: "pommel.cap",
    },
  );

  const pommelGem = glow(
    disc(0.042, 0.012, [0, 0.054, 0.091], CYAN, 12, "pommel.gem"),
    1.8,
  );

  capsule([0, 0.135, 0], [0, 0.548, 0], 0.078, GRIP, "grip.body");

  cylinder(0.096, 0.048, [0, 0.14, 0], GOLD_DARK, [0, 1, 0], 10, "grip.lowerCollar");
  cylinder(0.091, 0.025, [0, 0.148, 0], GOLD_LIGHT, [0, 1, 0], 10, "grip.lowerTrim");
  cylinder(0.096, 0.05, [0, 0.555, 0], GOLD_DARK, [0, 1, 0], 10, "grip.upperCollar");
  cylinder(0.091, 0.023, [0, 0.558, 0], GOLD_LIGHT, [0, 1, 0], 10, "grip.upperTrim");

  for (const y of [0.205, 0.278, 0.351, 0.424, 0.497]) {
    torus(0.079, 0.009, [0, y, 0], LEATHER_LIGHT, [90, 0, 0], `grip.wrap.${y}`);
  }

  frontBar(0, 0.345, 0.038, 0.255, 0.082, BLUE_STEEL, "grip.frontSpine");
  frontBar(0, 0.345, 0.012, 0.21, 0.097, CYAN_DARK, "grip.energyLine");
  diamond(0, 0.345, 0.054, 0.075, 0.108, GOLD_LIGHT, "grip.rune");
  glow(
    disc(0.016, 0.012, [0, 0.345, 0.118], CYAN, 10, "grip.runeCore"),
    1.6,
  );

  for (const s of [-1, 1]) {
    rod(
      [s * 0.065, 0.205, 0.074],
      [s * 0.084, 0.255, 0.074],
      0.006,
      GOLD,
      { name: `grip.diagonal.${s}.a` },
    );
    rod(
      [s * 0.084, 0.335, 0.074],
      [s * 0.065, 0.385, 0.074],
      0.006,
      GOLD,
      { name: `grip.diagonal.${s}.b` },
    );
    rod(
      [s * 0.065, 0.455, 0.074],
      [s * 0.084, 0.505, 0.074],
      0.006,
      GOLD,
      { name: `grip.diagonal.${s}.c` },
    );
  }

  // ---------------------------------------------------------------------------
  // Ornate crossguard
  // ---------------------------------------------------------------------------

  const guardWing = [
    [0, -0.048],
    [0.13, -0.072],
    [0.30, -0.062],
    [0.45, -0.012],
    [0.48, 0.032],
    [0.39, 0.083],
    [0.23, 0.105],
    [0.075, 0.077],
    [0, 0.043],
  ] as [number, number][];

  const guardInset = [
    [0, -0.018],
    [0.14, -0.044],
    [0.29, -0.036],
    [0.40, 0.002],
    [0.36, 0.047],
    [0.22, 0.068],
    [0.075, 0.052],
    [0, 0.029],
  ] as [number, number][];

  for (const s of [-1, 1]) {
    plate(
      guardWing,
      [0, 0.625, 0.005],
      0.095,
      BLACK_STEEL,
      {
        x: [s, 0, 0],
        bevel: 0.008,
        name: `guard.wing.${s}.dark`,
      },
    );

    plate(
      guardInset,
      [0, 0.625, 0.061],
      0.026,
      GOLD,
      {
        x: [s, 0, 0],
        bevel: 0.004,
        name: `guard.wing.${s}.gold`,
      },
    );

    rod(
      [s * 0.08, 0.625, 0.083],
      [s * 0.385, 0.635, 0.083],
      0.009,
      GOLD_LIGHT,
      { name: `guard.wing.${s}.ridge` },
    );

    stud(s * 0.405, 0.636, 0.087, 0.035, GOLD_LIGHT, `guard.wing.${s}.stud`);
    glow(
      disc(0.022, 0.013, [s * 0.405, 0.636, 0.119], CYAN, 10, `guard.wing.${s}.gem`),
      1.7,
    );
  }

  cylinder(0.116, 0.13, [0, 0.628, 0], GOLD_DARK, [0, 0, 1], 12, "guard.centerSleeve");
  torus(0.105, 0.012, [0, 0.628, 0.078], GOLD_LIGHT, [0, 0, 0], "guard.centerRing");
  glow(
    disc(0.073, 0.018, [0, 0.628, 0.115], CYAN_DARK, 14, "guard.centerCrystal"),
    1.25,
  );
  glow(
    disc(0.041, 0.02, [0, 0.628, 0.13], CYAN, 12, "guard.centerCrystalCore"),
    2.1,
  );

  // ---------------------------------------------------------------------------
  // Integrated firearm receiver
  // ---------------------------------------------------------------------------

  partBox([0.62, 0.205, 0.20], [-0.02, 0.765, -0.035], BLACK_STEEL, {
    name: "receiver.main",
  });
  partBox([0.46, 0.145, 0.025], [-0.075, 0.775, 0.092], STEEL, {
    name: "receiver.frontPlate",
  });
  partBox([0.40, 0.105, 0.018], [-0.08, 0.775, 0.112], BLUE_STEEL, {
    name: "receiver.bluePlate",
  });

  plate(
    [
      [-0.26, -0.07],
      [0.19, -0.07],
      [0.24, 0.01],
      [0.16, 0.09],
      [-0.22, 0.082],
      [-0.29, 0.02],
    ],
    [-0.03, 0.765, 0.115],
    0.018,
    GOLD_DARK,
    { bevel: 0.004, name: "receiver.goldFrame" },
  );

  frontBar(-0.075, 0.705, 0.36, 0.018, 0.132, GOLD_LIGHT, "receiver.topRail");
  frontBar(-0.075, 0.842, 0.36, 0.016, 0.132, GOLD, "receiver.bottomRail");

  for (const x of [-0.235, -0.12, 0.0, 0.115]) {
    stud(x, 0.775, 0.133, 0.012, GOLD_LIGHT, `receiver.rivet.${x}`);
  }

  const chamber = cylinder(0.125, 0.092, [-0.195, 0.775, 0.118], STEEL, [0, 0, 1], 12, "receiver.chamber");
  torus(0.106, 0.014, [-0.195, 0.775, 0.169], GOLD, [0, 0, 0], "receiver.chamberRing");
  torus(0.073, 0.009, [-0.195, 0.775, 0.183], GOLD_LIGHT, [0, 0, 0], "receiver.chamberInnerRing");

  const chamberCore = glow(
    disc(0.061, 0.016, [-0.195, 0.775, 0.189], CYAN_DARK, 12, "receiver.chamberCore"),
    1.4,
  );
  const chamberSpark = glow(
    disc(0.026, 0.018, [-0.195, 0.775, 0.202], HIGHLIGHT, 10, "receiver.chamberSpark"),
    2.5,
  );

  for (const a of [0, 60, 120, 180, 240, 300]) {
    const r = 0.088;
    const rad = (a * Math.PI) / 180;
    stud(
      -0.195 + Math.sin(rad) * r,
      0.775 + Math.cos(rad) * r,
      0.197,
      0.008,
      GOLD_LIGHT,
      `receiver.chamberBolt.${a}`,
    );
  }

  rod([-0.02, 0.725, 0.155], [0.22, 0.725, 0.155], 0.014, GOLD, {
    name: "receiver.upperFillet",
  });
  rod([-0.02, 0.815, 0.155], [0.20, 0.815, 0.155], 0.012, GOLD_DARK, {
    name: "receiver.lowerFillet",
  });

  // Barrel and muzzle
  rod([0.16, 0.78, -0.02], [0.64, 0.78, -0.02], 0.062, BLACK_STEEL, {
    caps: "flat",
    name: "barrel.outer",
  });
  rod([0.23, 0.78, 0.045], [0.66, 0.78, 0.045], 0.027, STEEL, {
    caps: "flat",
    name: "barrel.upperRail",
  });
  rod([0.28, 0.78, 0.083], [0.62, 0.78, 0.083], 0.009, CYAN_DARK, {
    caps: "flat",
    name: "barrel.energyGroove",
  });

  cylinder(0.087, 0.082, [0.65, 0.78, -0.02], BLACK_STEEL, [1, 0, 0], 10, "muzzle.collar");
  cylinder(0.073, 0.094, [0.70, 0.78, -0.02], STEEL, [1, 0, 0], 10, "muzzle.sleeve");
  cylinder(0.046, 0.105, [0.755, 0.78, -0.02], INK, [1, 0, 0], 10, "muzzle.bore");
  torus(0.078, 0.011, [0.678, 0.78, -0.02], GOLD, [0, 90, 0], "muzzle.goldBand");

  for (const x of [0.30, 0.42, 0.54]) {
    cylinder(0.019, 0.035, [x, 0.78, 0.076], DEEP_BLUE, [0, 0, 1], 8, `barrel.vent.${x}`);
  }

  // Trigger guard and trigger
  const triggerPath = catmull([
    [0.085, 0.687, 0.126],
    [0.19, 0.665, 0.126],
    [0.22, 0.59, 0.126],
    [0.14, 0.545, 0.126],
    [0.035, 0.56, 0.126],
  ]);
  b.sweep(triggerPath, 0.014, {
    color: GOLD,
    caps: "round",
    sides: 7,
    name: "trigger.guard",
  });

  rod([0.11, 0.66, 0.15], [0.15, 0.595, 0.15], 0.012, RED, {
    name: "trigger",
  });
  sphere(0.019, [0.15, 0.59, 0.15], GOLD_LIGHT, 8, "trigger.tip");

  // Rear firearm counterweight / stock plate
  plate(
    [
      [-0.36, -0.075],
      [-0.23, -0.105],
      [-0.16, -0.05],
      [-0.18, 0.07],
      [-0.28, 0.11],
      [-0.39, 0.04],
    ],
    [-0.04, 0.765, -0.13],
    0.13,
    BLUE_STEEL,
    { bevel: 0.008, name: "receiver.rearStock" },
  );
  plate(
    [
      [-0.30, -0.045],
      [-0.22, -0.065],
      [-0.20, 0.055],
      [-0.29, 0.075],
    ],
    [-0.04, 0.765, -0.205],
    0.018,
    GOLD,
    { bevel: 0.004, name: "receiver.stockInset" },
  );

  // ---------------------------------------------------------------------------
  // Main blade
  // ---------------------------------------------------------------------------

  const bladeOuter = [
    [-0.19, 0.0],
    [0.18, 0.0],
    [0.19, 0.16],
    [0.145, 0.43],
    [0.115, 0.84],
    [0.078, 1.22],
    [0.043, 1.54],
    [0.0, 1.73],
    [-0.043, 1.54],
    [-0.078, 1.22],
    [-0.115, 0.84],
    [-0.16, 0.43],
    [-0.20, 0.16],
  ] as [number, number][];

  const bladeInner = [
    [-0.135, 0.025],
    [0.12, 0.025],
    [0.135, 0.17],
    [0.102, 0.45],
    [0.083, 0.84],
    [0.061, 1.21],
    [0.034, 1.48],
    [0.0, 1.62],
    [-0.034, 1.48],
    [-0.061, 1.21],
    [-0.083, 0.84],
    [-0.115, 0.45],
    [-0.145, 0.17],
  ] as [number, number][];

  plate(
    bladeOuter,
    [0, 0.68, 0],
    0.11,
    BLACK_STEEL,
    { bevel: 0.012, name: "blade.darkSilhouette" },
  );

  plate(
    bladeInner,
    [0, 0.68, 0.06],
    0.034,
    SILVER,
    { bevel: 0.006, name: "blade.silverFace" },
  );

  const bladeFuller = [
    [-0.026, 0.12],
    [0.026, 0.12],
    [0.031, 0.56],
    [0.025, 1.06],
    [0.016, 1.43],
    [0.0, 1.57],
    [-0.016, 1.43],
    [-0.025, 1.06],
    [-0.031, 0.56],
  ] as [number, number][];

  plate(
    bladeFuller,
    [0, 0.68, 0.085],
    0.016,
    BLUE_STEEL,
    { bevel: 0.002, name: "blade.centralFuller" },
  );

  const bladeEnergy = [
    [-0.008, 0.18],
    [0.008, 0.18],
    [0.011, 0.62],
    [0.008, 1.10],
    [0.0, 1.43],
    [-0.008, 1.10],
    [-0.011, 0.62],
  ] as [number, number][];

  glow(
    plate(
      bladeEnergy,
      [0, 0.68, 0.099],
      0.009,
      CYAN,
      { bevel: 0.0015, name: "blade.energySpine" },
    ),
    1.8,
  );

  // Blade edge facets
  rod([-0.16, 0.86, 0.091], [-0.105, 1.49, 0.091], 0.009, HIGHLIGHT, {
    name: "blade.leftEdgeHighlight",
  });
  rod([0.16, 0.86, 0.091], [0.105, 1.49, 0.091], 0.009, HIGHLIGHT, {
    name: "blade.rightEdgeHighlight",
  });
  rod([-0.105, 1.49, 0.091], [0, 1.69, 0.091], 0.008, SILVER, {
    name: "blade.leftTipFacet",
  });
  rod([0.105, 1.49, 0.091], [0, 1.69, 0.091], 0.008, SILVER, {
    name: "blade.rightTipFacet",
  });

  // Blade root ricasso
  plate(
    [
      [-0.16, -0.03],
      [0.16, -0.03],
      [0.145, 0.19],
      [0.10, 0.25],
      [-0.10, 0.25],
      [-0.145, 0.19],
    ],
    [0, 0.69, 0.098],
    0.02,
    GOLD_DARK,
    { bevel: 0.004, name: "blade.ricasso" },
  );
  frontBar(0, 0.76, 0.21, 0.024, 0.116, GOLD_LIGHT, "blade.ricassoTop");
  frontBar(-0.11, 0.805, 0.025, 0.095, 0.116, GOLD, "blade.ricassoLeft");
  frontBar(0.11, 0.805, 0.025, 0.095, 0.116, GOLD, "blade.ricassoRight");

  // Blade runes and inset ornaments
  diamond(0, 1.035, 0.10, 0.15, 0.112, GOLD_DARK, "blade.runeFrame1");
  diamond(0, 1.035, 0.061, 0.095, 0.124, CYAN_DARK, "blade.runeBlue1");
  glow(
    disc(0.019, 0.012, [0, 1.035, 0.138], CYAN, 10, "blade.runeCore1"),
    1.8,
  );

  diamond(0, 1.30, 0.082, 0.13, 0.112, GOLD, "blade.runeFrame2");
  diamond(0, 1.30, 0.045, 0.076, 0.124, PURPLE, "blade.runePurple2");

  diamond(0, 1.51, 0.066, 0.10, 0.112, GOLD_LIGHT, "blade.runeFrame3");
  glow(
    disc(0.014, 0.012, [0, 1.51, 0.136], CYAN, 9, "blade.runeCore3"),
    1.7,
  );

  for (const s of [-1, 1]) {
    rod(
      [s * 0.068, 0.92, 0.113],
      [s * 0.097, 1.11, 0.113],
      0.006,
      GOLD,
      { name: `blade.filigree.${s}.lower` },
    );
    rod(
      [s * 0.097, 1.11, 0.113],
      [s * 0.073, 1.26, 0.113],
      0.006,
      GOLD,
      { name: `blade.filigree.${s}.middle` },
    );
    rod(
      [s * 0.073, 1.39, 0.113],
      [s * 0.047, 1.55, 0.113],
      0.005,
      GOLD_LIGHT,
      { name: `blade.filigree.${s}.upper` },
    );
  }

  // Small side vents cut into the blade face
  for (const s of [-1, 1]) {
    for (const y of [0.91, 1.12, 1.33]) {
      frontBar(s * 0.115, y, 0.028, 0.055, 0.116, DEEP_BLUE, `blade.vent.${s}.${y}`);
      stud(s * 0.115, y, 0.132, 0.009, GOLD_LIGHT, `blade.ventRivet.${s}.${y}`);
    }
  }

  // A broad angular crest just under the tip
  plate(
    [
      [0, -0.02],
      [0.075, 0.07],
      [0.052, 0.17],
      [0.018, 0.10],
      [0, 0.23],
      [-0.018, 0.10],
      [-0.052, 0.17],
      [-0.075, 0.07],
    ],
    [0, 1.99, 0.088],
    0.018,
    GOLD_DARK,
    { bevel: 0.003, name: "blade.tipCrest" },
  );
  plate(
    [
      [0, 0],
      [0.038, 0.075],
      [0, 0.17],
      [-0.038, 0.075],
    ],
    [0, 1.99, 0.103],
    0.012,
    GOLD_LIGHT,
    { bevel: 0.002, name: "blade.tipCrestHighlight" },
  );
  glow(
    disc(0.022, 0.014, [0, 2.045, 0.12], CYAN, 10, "blade.tipGem"),
    1.8,
  );

  // Blade shoulder fins at the junction with the receiver
  const shoulder = [
    [0, -0.04],
    [0.115, -0.02],
    [0.175, 0.045],
    [0.15, 0.125],
    [0.07, 0.10],
    [0, 0.045],
  ] as [number, number][];

  for (const s of [-1, 1]) {
    plate(
      shoulder,
      [0, 0.84, 0.09],
      0.025,
      STEEL,
      {
        x: [s, 0, 0],
        bevel: 0.004,
        name: `blade.shoulder.${s}.steel`,
      },
    );
    plate(
      [
        [0, -0.008],
        [0.10, 0.01],
        [0.145, 0.048],
        [0.10, 0.073],
        [0.025, 0.043],
      ],
      [0, 0.84, 0.112],
      0.012,
      GOLD,
      {
        x: [s, 0, 0],
        bevel: 0.002,
        name: `blade.shoulder.${s}.gold`,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Extra mechanical details around the hilt
  // ---------------------------------------------------------------------------

  cylinder(0.062, 0.18, [-0.36, 0.755, -0.02], BLUE_STEEL, [0, 0, 1], 8, "rear.axle");
  torus(0.058, 0.009, [-0.36, 0.755, 0.087], GOLD_LIGHT, [0, 0, 0], "rear.axleRing");
  disc(0.038, 0.018, [-0.36, 0.755, 0.103], INK, 10, "rear.axleCap");
  stud(-0.36, 0.755, 0.116, 0.014, RED, "rear.axlePin");

  for (const s of [-1, 1]) {
    rod(
      [s * 0.22, 0.88, 0.105],
      [s * 0.30, 0.95, 0.105],
      0.008,
      GOLD,
      { name: `hilt.brace.${s}.upper` },
    );
    rod(
      [s * 0.30, 0.95, 0.105],
      [s * 0.34, 1.04, 0.105],
      0.006,
      GOLD_LIGHT,
      { name: `hilt.brace.${s}.tip` },
    );
  }

  // Six small bolts make the receiver read as assembled metal rather than a block.
  const bolts: P[] = [
    [-0.285, 0.69, 0.142],
    [-0.285, 0.85, 0.142],
    [-0.12, 0.68, 0.142],
    [-0.12, 0.87, 0.142],
    [0.10, 0.69, 0.142],
    [0.10, 0.85, 0.142],
  ];
  bolts.forEach((p, i) => stud(p[0], p[1], p[2], 0.011, GOLD_LIGHT, `receiver.bolt.${i}`));

  // A tiny red status crystal on the upper receiver gives the weapon a dangerous focal accent.
  const statusCrystal = glow(
    b.part(
      new THREE.OctahedronGeometry(0.028, 0),
      RED,
      { at: [-0.015, 0.884, 0.153], name: "receiver.statusCrystal" },
    ),
    1.5,
  );

  // Thin blue energy rails visually connect the chamber to the blade.
  glow(
    rod(
      [-0.005, 0.87, 0.151],
      [-0.005, 1.55, 0.151],
      0.006,
      CYAN,
      { caps: "flat", name: "energy.rail.center" },
    ),
    1.4,
  );

  for (const s of [-1, 1]) {
    glow(
      rod(
        [s * 0.048, 0.885, 0.146],
        [s * 0.035, 1.18, 0.146],
        0.004,
        CYAN_DARK,
        { caps: "flat", name: `energy.rail.${s}` },
      ),
      1.1,
    );
  }

  // A few intentionally chunky silver facets on the blade's back add a low-poly silhouette.
  plate(
    [
      [-0.20, 0],
      [-0.145, 0.04],
      [-0.125, 0.26],
      [-0.18, 0.20],
    ],
    [0, 0.69, -0.065],
    0.028,
    STEEL,
    { bevel: 0.003, name: "blade.backFacet.left" },
  );
  plate(
    [
      [0.20, 0],
      [0.145, 0.04],
      [0.125, 0.26],
      [0.18, 0.20],
    ],
    [0, 0.69, -0.065],
    0.028,
    STEEL,
    { bevel: 0.003, name: "blade.backFacet.right" },
  );

  // Final small accent below the guard, locking the guard and handle together.
  frontBar(0, 0.594, 0.17, 0.018, 0.118, GOLD_LIGHT, "hilt.neckTrim");
  stud(-0.078, 0.594, 0.13, 0.012, CYAN, "hilt.neckGem.left");
  stud(0.078, 0.594, 0.13, 0.012, CYAN, "hilt.neckGem.right");

  return b.root;
}
```