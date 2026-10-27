import * as THREE from "three";
import { createBuilder, catmull, rng } from "../../../../src/index";

export const meta = {
  name: "Baba Yaga's Hut on Chicken Legs",
  description:
    "A stylized Slavic folk-art diorama of a crooked log hut perched on articulated chicken legs, with carved trim, a tiny window, door, roof, moss, and expressive claws.",
};

export default function build() {
  const b = createBuilder({ name: "baba-yaga-hut", detail: 1 });

  const WOOD_DARK = "#4a2418";
  const WOOD = "#7e4025";
  const WOOD_LIGHT = "#a96435";
  const BARK = "#c4874b";
  const ROOF = "#472d3c";
  const ROOF_LIGHT = "#704457";
  const RED = "#a93732";
  const BLUE = "#315b78";
  const BLUE_LIGHT = "#6e9bb0";
  const GOLD = "#d3a044";
  const BLACK = "#1b1518";
  const GLASS = "#213e4d";
  const LEG = "#d88931";
  const LEG_DARK = "#9b4c23";
  const CLAW = "#3c2117";
  const CREAM = "#e5c17c";
  const MOSS = "#66733b";
  const WHITE = "#ead9ad";

  const Y = new THREE.Vector3(0, 1, 0);

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    options: Record<string, unknown> = {},
  ) => {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      ...options,
    });
  };

  const cylinder = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    options: Record<string, unknown> = {},
  ) => {
    return b.part(new THREE.CylinderGeometry(radius, radius, height, 8), color, {
      at,
      ...options,
    });
  };

  const sphere = (
    radius: number,
    color: string,
    at: [number, number, number],
    options: Record<string, unknown> = {},
  ) => {
    return b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      ...options,
    });
  };

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    options: Record<string, unknown> = {},
  ) => b.rod(a, c, radius, { color, sides: 8, ...options });

  const spike = (
    base: [number, number, number],
    tip: [number, number, number],
    radius: number,
    color: string,
    options: Record<string, unknown> = {},
  ) => b.spike(base, tip, null, radius, { color, ...options });

  // Skeleton first: the hut has a central body root and two recognizable chicken-leg chains.
  const bodyRoot = b.joint("hutBody", {
    at: [0, 1.03, 0],
    dir: [0, 1, 0],
    role: "spine",
    group: "hut",
  });

  const legLPath = catmull([
    [0.29, 1.02, 0.02],
    [0.31, 0.76, 0.02],
    [0.24, 0.40, 0.08],
    [0.20, 0.16, 0.10],
  ]);

  const legRPath = catmull([
    [-0.29, 1.02, 0.02],
    [-0.33, 0.77, 0.00],
    [-0.25, 0.39, 0.08],
    [-0.19, 0.16, 0.10],
  ]);

  const legL = b.chain("legL", legLPath, {
    parent: bodyRoot,
    names: ["hipL", "kneeL", "ankleL", "footL"],
    role: "leg",
    contact: [0.20, 0, 0.10],
    group: "chicken-legs",
  });

  const legR = b.chain("legR", legRPath, {
    parent: bodyRoot,
    names: ["hipR", "kneeR", "ankleR", "footR"],
    role: "leg",
    contact: [-0.19, 0, 0.10],
    group: "chicken-legs",
  });

  const legPaint = (t: number) => (t < 0.56 ? LEG : LEG_DARK);

  b.sweep(legL, (t) => 0.065 - t * 0.018, {
    color: legPaint,
    section: { ngon: 6 },
    caps: "round",
    group: "chicken-legs",
  });

  b.sweep(legR, (t) => 0.065 - t * 0.018, {
    color: legPaint,
    section: { ngon: 6 },
    caps: "round",
    group: "chicken-legs",
  });

  const leftFoot: [number, number, number] = [0.20, 0.16, 0.10];
  const rightFoot: [number, number, number] = [-0.19, 0.16, 0.10];

  // The two feet are broad, graphic chicken feet with three long toes and a rear spur.
  const makeFoot = (
    foot: [number, number, number],
    side: number,
    bone: unknown,
  ) => {
    const [x, y, z] = foot;

    const toes: Array<[[number, number, number], [number, number, number], number]> = [
      [[x, y, z], [x + side * 0.16, 0.045, z + 0.18], 0.028],
      [[x, y, z], [x + side * 0.035, 0.035, z + 0.24], 0.025],
      [[x, y, z], [x - side * 0.13, 0.045, z + 0.17], 0.026],
    ];

    for (const [a, c, r] of toes) {
      rod(a, c, r, CLAW, { bone, caps: "round" });
      spike(c, [c[0] + side * 0.018, 0.04, c[2] + 0.045], r * 0.55, CLAW, {
        bone,
      });
    }

    rod(
      [x, y + 0.01, z - 0.015],
      [x - side * 0.13, 0.055, z - 0.15],
      0.023,
      CLAW,
      { bone },
    );

    sphere(0.072, LEG, [x, y, z], { bone });
    sphere(0.047, LEG_DARK, [x + side * 0.025, y + 0.005, z + 0.045], {
      bone,
    });
  };

  makeFoot(leftFoot, 1, legL.tip);
  makeFoot(rightFoot, -1, legR.tip);

  // Small raised spurs and joint collars make the legs read as puppet-like articulated limbs.
  for (const side of [1, -1]) {
    const hip: [number, number, number] = [side * 0.30, 0.98, 0.02];
    const knee: [number, number, number] = [side * 0.30, 0.73, 0.03];
    const ankle: [number, number, number] = [side * 0.235, 0.39, 0.08];

    cylinder(0.082, 0.025, GOLD, hip, {
      rotation: [0, 0, 90],
      bone: side > 0 ? legL.joints[0] : legR.joints[0],
    });
    cylinder(0.061, 0.022, GOLD, knee, {
      rotation: [0, 0, 90],
      bone: side > 0 ? legL.joints[1] : legR.joints[1],
    });
    cylinder(0.052, 0.021, GOLD, ankle, {
      rotation: [0, 0, 90],
      bone: side > 0 ? legL.joints[2] : legR.joints[2],
    });

    spike(
      [side * 0.30, 0.64, 0.02],
      [side * 0.30, 0.68, -0.12],
      0.025,
      LEG_DARK,
      { bone: side > 0 ? legL.joints[1] : legR.joints[1] },
    );
  }

  // Dark interior block gives the round log walls a convincing cabin volume.
  box([1.16, 0.62, 0.82], WOOD_DARK, [0, 1.42, 0], {
    bone: bodyRoot,
    name: "dark-cabin-core",
    group: "hut",
  });

  // Main horizontal wall logs. The alternating warm colours create a folk-art striped silhouette.
  const wallYs = [1.12, 1.25, 1.38, 1.51, 1.64, 1.77];
  wallYs.forEach((y, i) => {
    const c = i % 2 === 0 ? WOOD : WOOD_LIGHT;

    rod([-0.68, y, 0.40], [0.68, y, 0.40], 0.065, c, {
      bone: bodyRoot,
      group: "front-logs",
    });
    rod([-0.68, y, -0.40], [0.68, y, -0.40], 0.065, c, {
      bone: bodyRoot,
      group: "back-logs",
    });
    rod([-0.60, y, -0.40], [-0.60, y, 0.40], 0.06, c, {
      bone: bodyRoot,
      group: "side-logs",
    });
    rod([0.60, y, -0.40], [0.60, y, 0.40], 0.06, c, {
      bone: bodyRoot,
      group: "side-logs",
    });
  });

  // Projecting log ends at the four corners.
  for (const x of [-0.68, 0.68]) {
    for (const z of [-0.40, 0.40]) {
      for (let i = 0; i < wallYs.length; i += 2) {
        cylinder(0.068, 0.11, BARK, [x, wallYs[i], z], {
          rotation: [90, 0, 0],
          bone: bodyRoot,
          group: "log-ends",
        });
        sphere(0.047, WOOD_DARK, [x, wallYs[i], z + (z > 0 ? 0.058 : -0.058)], {
          bone: bodyRoot,
          group: "log-ends",
        });
      }
    }
  }

  // Crooked lower sill and dark foundation shadow.
  box([1.30, 0.075, 0.88], WOOD_DARK, [0, 1.04, 0], {
    bone: bodyRoot,
    group: "hut",
  });
  rod([-0.65, 1.05, 0.45], [0.65, 1.05, 0.45], 0.055, GOLD, {
    bone: bodyRoot,
    group: "trim",
  });

  // Gable face on the front, like a painted folk-art triangle.
  b.extrude(
    [
      [-0.66, 1.75, "sharp"],
      [0, 2.16, "sharp"],
      [0.66, 1.75, "sharp"],
    ],
    {
      at: [0, 0, 0.405],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.065,
      bevel: 0.012,
      color: WOOD_LIGHT,
      bone: bodyRoot,
      group: "gable",
      name: "front-gable",
    },
  );

  // Roof planes: broad, chunky slabs rather than smooth realistic roofing.
  const roofFront = [
    [0, 0],
    [1.42, 0],
    [1.42, 0.69],
    [0, 0.69],
  ] as [number, number][];

  const roofBack = [
    [0, 0],
    [1.42, 0],
    [1.42, 0.69],
    [0, 0.69],
  ] as [number, number][];

  b.extrude(roofFront, {
    at: [-0.71, 1.76, 0.53],
    x: [1, 0, 0],
    y: [0, 0.55, -0.83],
    thickness: 0.07,
    bevel: 0.018,
    color: ROOF,
    bone: bodyRoot,
    group: "roof",
    name: "front-roof-slope",
  });

  b.extrude(roofBack, {
    at: [-0.71, 1.76, -0.53],
    x: [1, 0, 0],
    y: [0, 0.55, 0.83],
    thickness: 0.07,
    bevel: 0.018,
    color: ROOF_LIGHT,
    bone: bodyRoot,
    group: "roof",
    name: "back-roof-slope",
  });

  // Ridge beam and painted roof-end caps.
  rod([-0.75, 2.17, 0], [0.75, 2.17, 0], 0.065, WOOD_DARK, {
    bone: bodyRoot,
    group: "roof-trim",
  });
  rod([-0.76, 1.76, 0.55], [0.76, 1.76, 0.55], 0.035, RED, {
    bone: bodyRoot,
    group: "roof-trim",
  });
  rod([-0.76, 1.76, -0.55], [0.76, 1.76, -0.55], 0.035, BLUE, {
    bone: bodyRoot,
    group: "roof-trim",
  });

  // Roof shingles as repeated bright folk-art bars.
  for (let i = 0; i < 7; i++) {
    const z = 0.49 - i * 0.077;
    const y = 1.79 + i * 0.061;
    rod([-0.69, y, z], [0.69, y, z], 0.014, i % 2 ? BLUE : RED, {
      bone: bodyRoot,
      group: "roof-shingles",
    });
    rod([-0.69, y, -z], [0.69, y, -z], 0.014, i % 2 ? RED : BLUE, {
      bone: bodyRoot,
      group: "roof-shingles",
    });
  }

  // Chimney made from square, slightly leaning blocks.
  box([0.16, 0.36, 0.16], WOOD_DARK, [0.35, 2.19, -0.12], {
    rotation: [0, 0, -5],
    bone: bodyRoot,
    group: "chimney",
  });
  box([0.22, 0.05, 0.22], RED, [0.35, 2.38, -0.12], {
    rotation: [0, 0, -5],
    bone: bodyRoot,
    group: "chimney",
  });
  rod([0.27, 2.40, -0.21], [0.43, 2.40, -0.21], 0.018, GOLD, {
    bone: bodyRoot,
    group: "chimney",
  });

  // Front door, deliberately narrow and crooked.
  box([0.28, 0.49, 0.035], WOOD_DARK, [0, 1.36, 0.455], {
    rotation: [0, 0, -3],
    bone: bodyRoot,
    group: "door",
  });
  for (let i = 0; i < 4; i++) {
    rod(
      [-0.115, 1.15 + i * 0.12, 0.482],
      [0.115, 1.15 + i * 0.12, 0.482],
      0.012,
      WOOD_LIGHT,
      { bone: bodyRoot, group: "door-planks" },
    );
  }
  rod([-0.13, 1.12, 0.49], [-0.13, 1.60, 0.49], 0.016, RED, {
    bone: bodyRoot,
    group: "door-trim",
  });
  rod([0.13, 1.12, 0.49], [0.13, 1.60, 0.49], 0.016, RED, {
    bone: bodyRoot,
    group: "door-trim",
  });
  cylinder(0.025, 0.025, GOLD, [0.09, 1.38, 0.50], {
    rotation: [90, 0, 0],
    bone: bodyRoot,
    group: "door-handle",
  });
  box([0.16, 0.045, 0.018], GOLD, [0, 1.66, 0.49], {
    rotation: [0, 0, -3],
    bone: bodyRoot,
    group: "door-trim",
  });

  // Front window with a strongly graphic blue frame and diagonal folk ornament.
  box([0.30, 0.27, 0.035], WOOD_DARK, [0.34, 1.47, 0.448], {
    bone: bodyRoot,
    group: "window",
  });
  box([0.245, 0.215, 0.018], GLASS, [0.34, 1.47, 0.472], {
    bone: bodyRoot,
    group: "window-glass",
  });
  box([0.025, 0.24, 0.026], BLUE_LIGHT, [0.34, 1.47, 0.49], {
    bone: bodyRoot,
    group: "window-cross",
  });
  box([0.28, 0.025, 0.026], BLUE_LIGHT, [0.34, 1.47, 0.49], {
    bone: bodyRoot,
    group: "window-cross",
  });
  for (const side of [-1, 1]) {
    rod(
      [0.34 + side * 0.18, 1.31, 0.50],
      [0.34 + side * 0.13, 1.67, 0.50],
      0.018,
      RED,
      { bone: bodyRoot, group: "window-ornament" },
    );
  }
  box([0.39, 0.045, 0.06], GOLD, [0.34, 1.64, 0.505], {
    bone: bodyRoot,
    group: "window-trim",
  });

  // A second tiny side window keeps the hut readable in three-quarter view.
  box([0.035, 0.25, 0.29], WOOD_DARK, [-0.615, 1.48, -0.10], {
    bone: bodyRoot,
    group: "side-window",
  });
  box([0.02, 0.19, 0.225], BLUE, [-0.64, 1.48, -0.10], {
    bone: bodyRoot,
    group: "side-window-glass",
  });
  box([0.03, 0.19, 0.025], GOLD, [-0.655, 1.48, -0.10], {
    bone: bodyRoot,
    group: "side-window-cross",
  });
  box([0.03, 0.025, 0.22], GOLD, [-0.655, 1.48, -0.10], {
    bone: bodyRoot,
    group: "side-window-cross",
  });

  // Decorative carved sunburst above the door.
  sphere(0.07, RED, [0, 1.84, 0.49], { bone: bodyRoot, group: "carving" });
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    rod(
      [Math.sin(a) * 0.065, 1.84 + Math.cos(a) * 0.065, 0.50],
      [Math.sin(a) * 0.13, 1.84 + Math.cos(a) * 0.13, 0.50],
      0.012,
      GOLD,
      { bone: bodyRoot, group: "carving" },
    );
  }

  // Mossy tufts hang from the upward roof edge and corners.
  for (const x of [-0.53, -0.26, 0, 0.28, 0.55]) {
    const y = 1.78 + Math.abs(x) * 0.56;
    const z = 0.53 - Math.abs(x) * 0.82;
    rod([x, y + 0.025, z], [x + 0.015, y - 0.055, z + 0.012], 0.022, MOSS, {
      bone: bodyRoot,
      group: "moss",
    });
  }

  // Stylized carved supports under the hut, hiding the leg sockets and enriching the silhouette.
  for (const side of [-1, 1]) {
    box([0.19, 0.13, 0.20], WOOD_DARK, [side * 0.30, 1.02, 0.02], {
      rotation: [0, 0, side * 8],
      bone: bodyRoot,
      group: "leg-sockets",
    });
    sphere(0.09, RED, [side * 0.30, 1.00, 0.13], {
      bone: bodyRoot,
      group: "leg-sockets",
    });
  }

  // Tiny carved marks on the front logs: simple diamonds in the palette of Slavic embroidery.
  for (const x of [-0.51, -0.34, 0.32, 0.50]) {
    const y = 1.20 + (Math.abs(x) > 0.4 ? 0.18 : 0);
    box([0.045, 0.045, 0.012], x > 0 ? BLUE : RED, [x, y, 0.475], {
      rotation: [0, 0, 45],
      bone: bodyRoot,
      group: "folk-marks",
    });
  }

  // A few low-poly ground stones anchor the diorama without competing with the hut.
  const stonePositions: Array<[[number, number, number], [number, number, number], string]> = [
    [[-0.53, 0.045, -0.12], [0.22, 0.09, 0.18], "#6e6254"],
    [[0.56, 0.05, -0.17], [0.19, 0.10, 0.15], "#81705b"],
    [[-0.43, 0.04, 0.34], [0.15, 0.08, 0.13], "#5d574f"],
    [[0.48, 0.035, 0.35], [0.18, 0.07, 0.11], "#756758"],
  ];

  for (const [at, size, color] of stonePositions) {
    box(size, color, at, {
      rotation: [0, 0, (at[0] + at[2]) * 20],
      group: "ground-stones",
    });
  }

  // Ground-level painted grass blades around the feet.
  const grassRng = rng(23);
  for (let i = 0; i < 22; i++) {
    const x = -0.72 + grassRng() * 1.44;
    const z = -0.47 + grassRng() * 0.94;
    const h = 0.035 + grassRng() * 0.07;
    rod(
      [x, 0.015, z],
      [x + (grassRng() - 0.5) * 0.045, h, z + (grassRng() - 0.5) * 0.045],
      0.008,
      grassRng() > 0.5 ? MOSS : "#87904b",
      { group: "grass" },
    );
  }

  // A small folk-art crescent sign on the rear-facing side hints at Baba Yaga's magic.
  b.extrude(
    [
      [0.0, 0.0],
      [0.09, 0.03],
      [0.12, 0.12],
      [0.06, 0.18],
      [-0.02, 0.16],
      [-0.07, 0.08],
    ],
    {
      at: [0.43, 1.49, -0.44],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      color: GOLD,
      bone: bodyRoot,
      group: "magic-sign",
      name: "golden-crescent",
    },
  );

  return b.root;
}
