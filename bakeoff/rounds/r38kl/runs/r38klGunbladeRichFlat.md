```ts
import * as THREE from "three";
import { createBuilder, bezier, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Lionheart Gunblade",
  description:
    "A Final Fantasy-inspired revolver gunblade with a broad rune-inlaid blade, six-shot drum, winged guard, and ornate royal-blue grip.",
};

export default function build() {
  const b = createBuilder({ name: "lionheart-gunblade", detail: 1 });
  const rand = rng(8);

  const C = {
    ink: "#080d15",
    bore: "#05080d",
    gunmetal: "#202b38",
    gunmetalLight: "#344657",
    steelDark: "#405367",
    steel: "#73899c",
    steelLight: "#b8c8d2",
    edge: "#edf6f4",
    edgeShade: "#9fb5c1",
    goldDark: "#69451d",
    gold: "#bd8738",
    goldLight: "#f0cd73",
    grip: "#101a29",
    gripLight: "#263a51",
    gripEdge: "#3c536b",
    cyanDark: "#177d8c",
    cyan: "#6ff7ec",
    cyanWhite: "#c9fff7",
    red: "#833b36",
  };

  type P2 = [number, number];
  type P3 = [number, number, number];

  const mirror = (outline: P2[], s: number): P2[] =>
    outline.map(([x, y]) => [x * s, y]);

  const plate = (
    outline: P2[],
    color: string,
    thickness: number,
    z = 0,
    group = "blade",
    bevel = 0,
  ) =>
    b.extrude(outline, {
      at: [0, 0, z],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness,
      bevel,
      color,
      group,
    });

  const box = (
    size: P3,
    at: P3,
    color: string,
    group: string,
    rotation?: P3,
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      rotation,
      group,
    });

  const cylinder = (
    radius: number,
    depth: number,
    at: P3,
    color: string,
    group: string,
    axis: "x" | "y" | "z" = "z",
    segments = 12,
  ) =>
    b.part(
      new THREE.CylinderGeometry(radius, radius, depth, segments),
      color,
      {
        at,
        dir:
          axis === "z"
            ? [0, 0, 1]
            : axis === "x"
              ? [1, 0, 0]
              : [0, 1, 0],
        group,
        flat: true,
      },
    );

  const gem = (at: P3, radius: number, group: string) =>
    glow(
      b.part(new THREE.OctahedronGeometry(radius, 0), C.cyan, {
        at,
        scale: [1, 1, 0.48],
        group,
      }),
      1.45,
    );

  const screw = (x: number, y: number, z: number, radius = 0.006) => {
    const side = Math.sign(z) || 1;
    cylinder(radius * 1.35, 0.003, [x, y, z], C.goldDark, "fasteners");
    cylinder(
      radius,
      0.004,
      [x, y, z + side * 0.002],
      rand() > 0.45 ? C.goldLight : C.gold,
      "fasteners",
      "z",
      8,
    );
    b.rod(
      [x - radius * 0.62, y, z + side * 0.0045],
      [x + radius * 0.62, y, z + side * 0.0045],
      radius * 0.12,
      { color: C.ink, group: "fasteners", sides: 4 },
    );
  };

  // ---------------------------------------------------------------------------
  // Blade silhouette: dark core, bright single edge, inset face plates.
  // ---------------------------------------------------------------------------

  const bladeOutline: P2[] = [
    [-0.052, 0.435],
    [-0.071, 0.57],
    [-0.073, 1.16],
    [-0.058, 1.3],
    [0.012, 1.465],
    [0.087, 1.315],
    [0.096, 1.17],
    [0.079, 0.64],
    [0.054, 0.455],
    [0.006, 0.425],
  ];

  const cuttingEdge: P2[] = [
    [0.006, 0.425],
    [0.054, 0.455],
    [0.079, 0.64],
    [0.096, 1.17],
    [0.087, 1.315],
    [0.012, 1.465],
    [0.012, 1.405],
    [0.052, 1.275],
    [0.062, 1.165],
    [0.049, 0.65],
    [0.032, 0.52],
    [0.005, 0.48],
  ];

  const spineBevel: P2[] = [
    [-0.052, 0.435],
    [-0.071, 0.57],
    [-0.073, 1.16],
    [-0.058, 1.3],
    [0.012, 1.465],
    [-0.002, 1.39],
    [-0.039, 1.275],
    [-0.052, 1.155],
    [-0.05, 0.59],
    [-0.034, 0.5],
  ];

  const facePlate: P2[] = [
    [-0.034, 0.5],
    [-0.05, 0.59],
    [-0.052, 1.155],
    [-0.039, 1.275],
    [-0.002, 1.39],
    [0.012, 1.405],
    [0.052, 1.275],
    [0.062, 1.165],
    [0.049, 0.65],
    [0.032, 0.52],
    [0.005, 0.48],
  ];

  plate(bladeOutline, C.gunmetal, 0.034, 0, "blade-core", 0.002);
  plate(cuttingEdge, C.edge, 0.038, 0, "cutting-edge", 0.0015);
  plate(spineBevel, C.steelDark, 0.036, 0, "spine-bevel", 0.001);

  for (const side of [1, -1]) {
    plate(facePlate, C.steel, 0.0035, side * 0.0185, "blade-face");

    plate(
      [
        [-0.034, 0.52],
        [-0.043, 0.62],
        [-0.044, 1.14],
        [-0.032, 1.26],
        [-0.003, 1.36],
        [-0.009, 1.19],
        [-0.01, 0.68],
      ],
      C.steelDark,
      0.002,
      side * 0.021,
      "blade-facets",
    );

    plate(
      [
        [0.008, 0.51],
        [0.027, 0.555],
        [0.041, 0.67],
        [0.052, 1.16],
        [0.043, 1.26],
        [0.013, 1.365],
        [0.018, 1.19],
        [0.022, 0.7],
      ],
      C.steelLight,
      0.0018,
      side * 0.0212,
      "blade-facets",
    );

    plate(
      [
        [-0.011, 0.56],
        [-0.019, 0.67],
        [-0.017, 1.18],
        [-0.009, 1.29],
        [0.004, 1.36],
        [0.009, 1.25],
        [0.012, 0.68],
        [0.006, 0.56],
      ],
      C.gunmetal,
      0.0024,
      side * 0.0225,
      "fuller",
    );

    b.rod(
      [-0.022, 0.665, side * 0.0242],
      [-0.02, 1.175, side * 0.0242],
      0.0017,
      { color: C.gold, group: "fuller-trim", sides: 5 },
    );
    b.rod(
      [0.016, 0.68, side * 0.0242],
      [0.013, 1.205, side * 0.0242],
      0.0015,
      { color: C.goldLight, group: "fuller-trim", sides: 5 },
    );

    plate(
      [
        [-0.006, 1.315],
        [0.004, 1.405],
        [0.012, 1.43],
        [0.011, 1.385],
        [0.004, 1.325],
      ],
      C.edgeShade,
      0.002,
      side * 0.024,
      "tip-inlay",
    );

    b.rod(
      [0.031, 1.275, side * 0.0235],
      [0.013, 1.36, side * 0.0235],
      0.0017,
      { color: C.edge, group: "tip-engraving", sides: 5 },
    );
    b.rod(
      [0.044, 1.245, side * 0.0235],
      [0.029, 1.29, side * 0.0235],
      0.0014,
      { color: C.gunmetalLight, group: "tip-engraving", sides: 5 },
    );
  }

  // ---------------------------------------------------------------------------
  // Luminous geometry runes, seated in the dark fuller on both faces.
  // ---------------------------------------------------------------------------

  const runePatterns: P2[][][] = [
    [
      [
        [0, -0.45],
        [0, 0.45],
      ],
      [
        [-0.42, 0.12],
        [0, 0.45],
        [0.42, 0.12],
      ],
      [
        [-0.32, -0.18],
        [0.32, -0.18],
      ],
    ],
    [
      [
        [0, 0.48],
        [0.4, 0],
        [0, -0.48],
        [-0.4, 0],
        [0, 0.48],
      ],
      [
        [-0.34, -0.34],
        [0.34, 0.34],
      ],
    ],
    [
      [
        [0, -0.48],
        [0, 0.12],
      ],
      [
        [-0.42, 0.45],
        [0, 0.12],
        [0.42, 0.45],
      ],
      [
        [-0.32, -0.16],
        [0.32, -0.16],
      ],
    ],
    [
      [
        [-0.34, 0.42],
        [0.34, 0.42],
      ],
      [
        [-0.34, -0.42],
        [0.34, -0.42],
      ],
      [
        [-0.28, -0.4],
        [0.28, 0.4],
      ],
      [
        [0, -0.12],
        [0, 0.12],
      ],
    ],
    [
      [
        [-0.42, 0],
        [0.42, 0],
      ],
      [
        [0, -0.48],
        [0, 0.48],
      ],
      [
        [-0.3, -0.34],
        [0.3, 0.34],
      ],
      [
        [-0.3, 0.34],
        [0.3, -0.34],
      ],
    ],
    [
      [
        [-0.38, 0.35],
        [0, 0.48],
        [0.38, 0.35],
      ],
      [
        [0, 0.48],
        [0, -0.45],
      ],
      [
        [-0.34, -0.12],
        [0, -0.45],
        [0.34, -0.12],
      ],
    ],
  ];

  const runeHeights = [0.725, 0.814, 0.903, 0.992, 1.081, 1.17];

  runeHeights.forEach((y, i) => {
    for (const side of [1, -1]) {
      const z = side * 0.0252;
      for (const stroke of runePatterns[i]) {
        for (let j = 0; j < stroke.length - 1; j++) {
          const a = stroke[j];
          const c = stroke[j + 1];
          glow(
            b.rod(
              [-0.002 + a[0] * 0.021, y + a[1] * 0.047, z],
              [-0.002 + c[0] * 0.021, y + c[1] * 0.047, z],
              0.0019,
              {
                color: i === 5 ? C.cyanWhite : C.cyan,
                group: "runes",
                sides: 5,
              },
            ),
            i === 5 ? 1.8 : 1.35,
          );
        }
      }
    }

    if (i < runeHeights.length - 1) {
      for (const side of [1, -1]) {
        cylinder(
          0.0027,
          0.002,
          [-0.002, y + 0.0445, side * 0.025],
          C.goldLight,
          "rune-dividers",
          "z",
          6,
        );
      }
    }
  });

  // ---------------------------------------------------------------------------
  // Integrated barrel and ribbed shroud along the blade's spine.
  // ---------------------------------------------------------------------------

  box([0.052, 0.48, 0.074], [-0.096, 0.775, 0], C.gunmetal, "barrel");
  box(
    [0.018, 0.41, 0.08],
    [-0.074, 0.77, 0],
    C.steelDark,
    "barrel-lock",
  );

  for (const side of [1, -1]) {
    box(
      [0.037, 0.342, 0.004],
      [-0.099, 0.785, side * 0.039],
      C.steel,
      "barrel-plates",
    );
    box(
      [0.021, 0.26, 0.003],
      [-0.099, 0.79, side * 0.042],
      C.gunmetalLight,
      "barrel-plates",
    );

    for (const y of [0.665, 0.735, 0.805, 0.875]) {
      box(
        [0.026, 0.008, 0.003],
        [-0.099, y, side * 0.044],
        C.edgeShade,
        "barrel-slots",
      );
    }

    screw(-0.099, 0.62, side * 0.044, 0.0045);
    screw(-0.099, 0.945, side * 0.044, 0.0045);
  }

  for (const y of [0.555, 0.65, 0.79, 0.93, 1.002]) {
    box([0.061, 0.015, 0.085], [-0.096, y, 0], C.goldDark, "barrel-bands");
    box(
      [0.063, 0.005, 0.087],
      [-0.096, y + 0.005, 0],
      C.goldLight,
      "barrel-bands",
    );
  }

  cylinder(0.03, 0.048, [-0.096, 1.032, 0], C.steelDark, "muzzle", "y", 12);
  cylinder(0.032, 0.012, [-0.096, 1.057, 0], C.gold, "muzzle", "y", 12);
  cylinder(0.021, 0.004, [-0.096, 1.065, 0], C.bore, "muzzle", "y", 12);
  cylinder(0.011, 0.0045, [-0.096, 1.067, 0], C.ink, "muzzle", "y", 10);

  box(
    [0.014, 0.035, 0.024],
    [-0.123, 1.029, 0],
    C.gunmetal,
    "front-sight",
  );
  box(
    [0.017, 0.008, 0.027],
    [-0.123, 1.048, 0],
    C.goldLight,
    "front-sight",
  );

  // ---------------------------------------------------------------------------
  // Six-shot revolver drum. Chamber bores and ratchet teeth are real geometry.
  // ---------------------------------------------------------------------------

  const drumX = -0.012;
  const drumY = 0.465;

  cylinder(drumX === 0 ? 0.084 : 0.084, 0.112, [drumX, drumY, 0], C.steelDark, "drum", "z", 16);
  cylinder(0.086, 0.018, [drumX, drumY, 0], C.goldDark, "drum-band", "z", 16);

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    box(
      [0.016, 0.015, 0.114],
      [drumX + Math.cos(a) * 0.084, drumY + Math.sin(a) * 0.084, 0],
      i % 2 ? C.gunmetal : C.steel,
      "ratchet-teeth",
      [0, 0, (a * 180) / Math.PI],
    );
  }

  for (const side of [1, -1]) {
    cylinder(
      0.083,
      0.012,
      [drumX, drumY, side * 0.06],
      C.steelLight,
      "drum-rims",
      "z",
      16,
    );
    cylinder(
      0.071,
      0.014,
      [drumX, drumY, side * 0.067],
      C.gunmetal,
      "drum-faces",
      "z",
      16,
    );
    cylinder(
      0.061,
      0.003,
      [drumX, drumY, side * 0.075],
      C.steelDark,
      "drum-faces",
      "z",
      16,
    );

    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      const x = drumX + Math.cos(a) * 0.045;
      const y = drumY + Math.sin(a) * 0.045;

      cylinder(0.017, 0.006, [x, y, side * 0.078], C.gold, "chambers", "z", 10);
      cylinder(
        0.0125,
        0.004,
        [x, y, side * 0.082],
        C.bore,
        "chambers",
        "z",
        10,
      );
      cylinder(
        0.0065,
        0.0015,
        [x, y, side * 0.0845],
        C.ink,
        "chambers",
        "z",
        8,
      );
    }

    cylinder(
      0.019,
      0.009,
      [drumX, drumY, side * 0.082],
      C.goldDark,
      "drum-axle",
      "z",
      10,
    );
    cylinder(
      0.012,
      0.012,
      [drumX, drumY, side * 0.087],
      C.goldLight,
      "drum-axle",
      "z",
      8,
    );
    box(
      [0.012, 0.003, 0.002],
      [drumX, drumY, side * 0.094],
      C.ink,
      "drum-axle",
    );
  }

  // Cylinder release and side plate.
  for (const side of [1, -1]) {
    box(
      [0.035, 0.06, 0.009],
      [0.066, 0.462, side * 0.035],
      C.gunmetal,
      "cylinder-release",
      [0, 0, -0.12],
    );
    box(
      [0.022, 0.032, 0.004],
      [0.068, 0.468, side * 0.042],
      C.goldDark,
      "cylinder-release",
    );
    for (const y of [0.458, 0.468, 0.478]) {
      box(
        [0.018, 0.0025, 0.002],
        [0.068, y, side * 0.045],
        C.goldLight,
        "cylinder-release",
      );
    }
  }

  // Cocked hammer and its thumb ridges.
  plate(
    [
      [0.035, 0.395],
      [0.061, 0.43],
      [0.091, 0.423],
      [0.101, 0.398],
      [0.075, 0.373],
      [0.052, 0.349],
      [0.032, 0.361],
    ],
    C.gunmetal,
    0.047,
    0,
    "hammer",
    0.001,
  );
  plate(
    [
      [0.059, 0.418],
      [0.091, 0.418],
      [0.103, 0.403],
      [0.073, 0.394],
    ],
    C.steelLight,
    0.051,
    0,
    "hammer",
  );
  for (let i = 0; i < 4; i++) {
    box(
      [0.003, 0.018, 0.054],
      [0.077 + i * 0.006, 0.414 - i * 0.002, 0],
      C.gunmetalLight,
      "hammer-ridges",
      [0, 0, -0.35],
    );
  }

  // ---------------------------------------------------------------------------
  // Winged crossguard: dark gold foundation, bright layered feather plates.
  // ---------------------------------------------------------------------------

  const guardCenter: P2[] = [
    [-0.065, 0.375],
    [-0.047, 0.409],
    [0, 0.42],
    [0.047, 0.409],
    [0.065, 0.375],
    [0.048, 0.322],
    [0, 0.307],
    [-0.048, 0.322],
  ];
  plate(guardCenter, C.goldDark, 0.068, 0, "guard", 0.002);
  plate(
    [
      [-0.044, 0.374],
      [-0.029, 0.398],
      [0, 0.405],
      [0.029, 0.398],
      [0.044, 0.374],
      [0.029, 0.337],
      [0, 0.326],
      [-0.029, 0.337],
    ],
    C.steelDark,
    0.073,
    0,
    "guard",
  );

  const wing: P2[] = [
    [0.025, 0.374],
    [0.084, 0.404],
    [0.157, 0.391],
    [0.177, 0.365],
    [0.132, 0.326],
    [0.071, 0.303],
    [0.025, 0.323],
  ];

  const wingInset: P2[] = [
    [0.041, 0.368],
    [0.086, 0.389],
    [0.145, 0.379],
    [0.154, 0.365],
    [0.119, 0.341],
    [0.071, 0.321],
    [0.041, 0.337],
  ];

  for (const s of [1, -1]) {
    plate(mirror(wing, s), C.gold, 0.047, 0, "guard-wings", 0.0015);

    for (const side of [1, -1]) {
      plate(
        mirror(wingInset, s),
        C.steelLight,
        0.003,
        side * 0.025,
        "guard-wings",
      );

      const feathers: P2[][] = [
        [
          [0.063, 0.365],
          [0.145, 0.382],
          [0.118, 0.354],
          [0.071, 0.343],
        ],
        [
          [0.055, 0.35],
          [0.125, 0.35],
          [0.101, 0.328],
          [0.06, 0.329],
        ],
        [
          [0.037, 0.372],
          [0.092, 0.392],
          [0.074, 0.365],
        ],
      ];

      feathers.forEach((f, i) =>
        plate(
          mirror(f, s),
          i === 2 ? C.goldLight : C.goldDark,
          0.002,
          side * 0.027,
          "guard-feathers",
        ),
      );

      screw(s * 0.052, 0.357, side * 0.03, 0.004);
    }

    b.spike(
      [s * 0.151, 0.366, 0],
      [s * 0.194, 0.371, 0],
      null,
      0.012,
      { color: C.goldLight, group: "guard-tips", sides: 6 },
    );
  }

  // Central guard jewel, above the grip.
  for (const side of [1, -1]) {
    cylinder(0.025, 0.006, [0, 0.366, side * 0.039], C.gold, "guard-jewel", "z", 10);
    cylinder(
      0.018,
      0.007,
      [0, 0.366, side * 0.043],
      C.gunmetal,
      "guard-jewel",
      "z",
      8,
    );
    gem([0, 0.366, side * 0.049], 0.014, "guard-jewel");
  }

  // ---------------------------------------------------------------------------
  // Open trigger guard and curved trigger.
  // ---------------------------------------------------------------------------

  b.sweep(
    bezier(
      [0.052, 0.352, 0],
      [0.133, 0.324, 0],
      [0.122, 0.188, 0],
      [0.015, 0.177, 0],
    ),
    0.0085,
    { color: C.gold, group: "trigger-guard", sides: 8 },
  );
  b.sweep(
    bezier(
      [0.015, 0.177, 0],
      [-0.003, 0.181, 0],
      [-0.005, 0.202, 0],
      [-0.008, 0.221, 0],
    ),
    0.0085,
    { color: C.goldDark, group: "trigger-guard", sides: 8 },
  );
  b.sweep(
    bezier(
      [0.035, 0.326, 0],
      [0.073, 0.285, 0],
      [0.063, 0.242, 0],
      [0.034, 0.231, 0],
    ),
    0.0055,
    { color: C.gunmetalLight, group: "trigger", sides: 7 },
  );
  cylinder(0.009, 0.066, [0.034, 0.326, 0], C.steelLight, "trigger-pin", "z", 8);

  // ---------------------------------------------------------------------------
  // Slanted royal-blue grip, steel tang, wrapped scales, and pommel.
  // ---------------------------------------------------------------------------

  const gripOutline: P2[] = [
    [-0.037, 0.327],
    [0.036, 0.326],
    [0.031, 0.261],
    [0.009, 0.153],
    [-0.003, 0.074],
    [-0.025, 0.039],
    [-0.079, 0.037],
    [-0.105, 0.066],
    [-0.096, 0.121],
    [-0.065, 0.239],
  ];

  plate(gripOutline, C.gunmetal, 0.061, 0, "grip-core", 0.002);

  const gripScale: P2[] = [
    [-0.029, 0.303],
    [0.018, 0.303],
    [0.014, 0.257],
    [-0.008, 0.151],
    [-0.017, 0.079],
    [-0.035, 0.058],
    [-0.071, 0.058],
    [-0.085, 0.076],
    [-0.076, 0.121],
    [-0.05, 0.238],
  ];

  for (const side of [1, -1]) {
    plate(gripScale, C.grip, 0.004, side * 0.032, "grip-scales", 0.001);

    b.rod(
      [-0.032, 0.298, side * 0.035],
      [-0.071, 0.084, side * 0.035],
      0.0022,
      { color: C.gold, group: "grip-trim", sides: 5 },
    );
    b.rod(
      [0.014, 0.291, side * 0.035],
      [-0.02, 0.083, side * 0.035],
      0.0017,
      { color: C.gripEdge, group: "grip-trim", sides: 5 },
    );

    const wraps = [
      { y: 0.092, x: -0.052, w: 0.052 },
      { y: 0.127, x: -0.047, w: 0.056 },
      { y: 0.163, x: -0.038, w: 0.058 },
      { y: 0.2, x: -0.028, w: 0.058 },
      { y: 0.237, x: -0.017, w: 0.057 },
      { y: 0.274, x: -0.006, w: 0.052 },
    ];

    wraps.forEach(({ x, y, w }, i) => {
      box(
        [w, 0.011, 0.0035],
        [x, y, side * 0.036],
        i % 2 ? C.gripLight : C.gripEdge,
        "grip-wrap",
        [0, 0, -0.19],
      );
      box(
        [w * 0.91, 0.002, 0.002],
        [x + 0.002, y + 0.004, side * 0.038],
        C.steelDark,
        "grip-wrap-stitch",
        [0, 0, -0.19],
      );
    });

    screw(-0.006, 0.294, side * 0.039, 0.005);
    screw(-0.054, 0.074, side * 0.039, 0.005);
  }

  // Back-strap and front-strap make the grip read as a metal-framed pistol hilt.
  b.sweep(
    bezier(
      [-0.037, 0.325, 0],
      [-0.083, 0.227, 0],
      [-0.117, 0.105, 0],
      [-0.079, 0.044, 0],
    ),
    [0.007, 0.006],
    { color: C.steelLight, group: "grip-straps", sides: 6 },
  );
  b.sweep(
    bezier(
      [0.032, 0.318, 0],
      [0.035, 0.227, 0],
      [0.005, 0.105, 0],
      [-0.022, 0.046, 0],
    ),
    [0.006, 0.005],
    { color: C.goldDark, group: "grip-straps", sides: 6 },
  );

  const pommel: P2[] = [
    [-0.108, 0.071],
    [-0.096, 0.022],
    [-0.073, 0.007],
    [-0.055, 0],
    [-0.034, 0.008],
    [-0.012, 0.029],
    [0.001, 0.071],
    [-0.022, 0.091],
    [-0.085, 0.091],
  ];
  plate(pommel, C.goldDark, 0.069, 0, "pommel", 0.0015);
  plate(
    [
      [-0.091, 0.071],
      [-0.081, 0.032],
      [-0.055, 0.015],
      [-0.029, 0.033],
      [-0.014, 0.071],
      [-0.03, 0.079],
      [-0.075, 0.079],
    ],
    C.steelDark,
    0.073,
    0,
    "pommel",
  );

  for (const side of [1, -1]) {
    plate(
      [
        [-0.083, 0.069],
        [-0.055, 0.027],
        [-0.027, 0.069],
        [-0.055, 0.057],
      ],
      C.gold,
      0.0025,
      side * 0.038,
      "pommel-inlay",
    );
    cylinder(
      0.017,
      0.004,
      [-0.055, 0.057, side * 0.04],
      C.goldLight,
      "pommel-jewel",
      "z",
      8,
    );
    gem([-0.055, 0.057, side * 0.044], 0.012, "pommel-jewel");
  }

  // Small pommel claws, all ending above the single floor contact at y = 0.
  for (const s of [1, -1]) {
    b.spike(
      [-0.055 + s * 0.036, 0.032, 0],
      [-0.055 + s * 0.049, 0.011, 0],
      null,
      0.009,
      { color: C.goldLight, group: "pommel-claws", sides: 6 },
    );
  }

  // ---------------------------------------------------------------------------
  // Winged lionheart crest on the blade forte.
  // ---------------------------------------------------------------------------

  for (const side of [1, -1]) {
    const z = side * 0.028;

    cylinder(0.03, 0.006, [-0.002, 0.602, z], C.goldDark, "lionheart", "z", 12);
    cylinder(
      0.024,
      0.007,
      [-0.002, 0.602, side * 0.032],
      C.goldLight,
      "lionheart",
      "z",
      10,
    );
    cylinder(
      0.017,
      0.007,
      [-0.002, 0.602, side * 0.036],
      C.gunmetal,
      "lionheart",
      "z",
      8,
    );
    gem([-0.002, 0.602, side * 0.042], 0.0125, "lionheart");

    for (const s of [1, -1]) {
      const crestFeathers: P2[][] = [
        [
          [0.018, 0.614],
          [0.061, 0.648],
          [0.051, 0.617],
          [0.022, 0.6],
        ],
        [
          [0.022, 0.596],
          [0.065, 0.607],
          [0.051, 0.585],
          [0.018, 0.584],
        ],
        [
          [0.016, 0.581],
          [0.047, 0.569],
          [0.026, 0.56],
          [0.009, 0.574],
        ],
      ];

      crestFeathers.forEach((f, i) =>
        plate(
          mirror(f, s),
          i === 1 ? C.steelLight : C.gold,
          0.003,
          side * 0.03,
          "lionheart-wings",
        ),
      );
    }

    // Crown over the central stone.
    plate(
      [
        [-0.019, 0.625],
        [-0.023, 0.653],
        [-0.009, 0.64],
        [-0.002, 0.66],
        [0.006, 0.64],
        [0.02, 0.653],
        [0.016, 0.625],
      ],
      C.goldLight,
      0.003,
      side * 0.032,
      "lionheart-crown",
    );

    for (const x of [-0.044, 0.04]) {
      screw(x, 0.548, side * 0.027, 0.0038);
    }
  }

  // Forte collar ties blade, barrel, and drum into one readable assembly.
  box([0.137, 0.022, 0.055], [-0.003, 0.552, 0], C.gunmetal, "forte-collar");
  for (const side of [1, -1]) {
    box(
      [0.143, 0.007, 0.004],
      [-0.003, 0.556, side * 0.029],
      C.goldLight,
      "forte-collar",
    );
    box(
      [0.123, 0.004, 0.003],
      [-0.003, 0.545, side * 0.029],
      C.steelLight,
      "forte-collar",
    );
  }

  // A final sequence of small gold certifications on the blade's lower face.
  for (const side of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const x = 0.028 + i * 0.009;
      box(
        [0.004, 0.013 - i * 0.002, 0.002],
        [x, 0.581 + i * 0.006, side * 0.025],
        i === 1 ? C.goldLight : C.gold,
        "blade-marks",
        [0, 0, -0.28],
      );
    }

    plate(
      [
        [0.034, 0.626],
        [0.043, 0.641],
        [0.038, 0.657],
        [0.029, 0.642],
      ],
      C.goldDark,
      0.002,
      side * 0.025,
      "blade-marks",
    );
  }

  return b.root;
}
```