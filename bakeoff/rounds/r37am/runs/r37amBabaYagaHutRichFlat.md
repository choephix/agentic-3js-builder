```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Baba Yaga's Hut",
  description:
    "A stylized Slavic folk-art diorama of Baba Yaga's crooked hut, perched on two expressive chicken legs with painted logs, shingle roof, glowing windows, carved door, folk ornaments, and a tiny chimney.",
};

export default function build() {
  const b = createBuilder({ name: "baba-yaga-hut", detail: 1 });

  const WOOD = "#70442d";
  const WOOD_LIGHT = "#9b6039";
  const WOOD_DARK = "#3d261e";
  const BARK = "#2b1c18";
  const ROOF = "#552a2e";
  const ROOF_LIGHT = "#87403b";
  const GOLD = "#d99b32";
  const OCHRE = "#b97928";
  const CREAM = "#f0d59a";
  const RED = "#a83b32";
  const RED_LIGHT = "#d65a3d";
  const BLUE = "#315c72";
  const BLUE_LIGHT = "#5f9aa0";
  const GREEN = "#536b3d";
  const MOSS = "#667044";
  const BLACK = "#1a1416";
  const GLASS = "#b9d6b6";
  const GLOW = "#f6c45d";
  const IRON = "#27252b";
  const BONE = "#d6c29a";

  // ---------------------------------------------------------------------------------------------
  // Small construction helpers. All geometry enters the model through the builder.
  // ---------------------------------------------------------------------------------------------

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    opts: {
      bone?: any;
      rotation?: [number, number, number];
      name?: string;
      group?: string;
    } = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone: opts.bone,
      rotation: opts.rotation,
      name: opts.name,
      group: opts.group,
    });

  const cylinder = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    opts: {
      bone?: any;
      rotation?: [number, number, number];
      radialSegments?: number;
      name?: string;
      group?: string;
    } = {},
  ) =>
    b.part(
      new THREE.CylinderGeometry(
        radius,
        radius,
        height,
        opts.radialSegments ?? 8,
        1,
      ),
      color,
      {
        at,
        bone: opts.bone,
        rotation: opts.rotation,
        name: opts.name,
        group: opts.group,
      },
    );

  const sphere = (
    radius: number,
    color: string,
    at: [number, number, number],
    bone?: any,
    name?: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      bone,
      name,
    });

  const rod = (
    a: [number, number, number] | THREE.Vector3,
    c: [number, number, number] | THREE.Vector3,
    radius: number,
    color: string,
    bone?: any,
    name?: string,
  ) => b.rod(a, c, radius, { color, bone, name, section: { ngon: 8 } });

  const folkDiamond = (
    x: number,
    y: number,
    z: number,
    color: string,
    bone?: any,
    scale = 1,
    name = "folkDiamond",
  ) => {
    box([0.075 * scale, 0.014, 0.13 * scale], color, [x, y, z], {
      bone,
      rotation: [0, 45, 0],
      name,
    });
  };

  const roundStud = (
    x: number,
    y: number,
    z: number,
    color: string,
    bone?: any,
    name = "carvedStud",
  ) => sphere(0.027, color, [x, y, z], bone, name);

  // ---------------------------------------------------------------------------------------------
  // Skeleton first: a single root and two stout, readable chicken-leg chains.
  // ---------------------------------------------------------------------------------------------

  const foundation = b.joint("foundation", {
    at: [0, 0.88, 0],
    role: "spine",
  });

  const legLPath = [
    [0.45, 1.08, 0.03],
    [0.52, 0.68, 0.05],
    [0.42, 0.34, 0.16],
    [0.37, 0.17, 0.25],
  ];
  const legRPath = [
    [-0.45, 1.08, 0.03],
    [-0.52, 0.68, 0.05],
    [-0.42, 0.34, 0.16],
    [-0.37, 0.17, 0.25],
  ];

  const legL = b.chain("legL", legLPath, {
    parent: foundation,
    names: ["hipL", "kneeL", "ankleL", "footL"],
    role: "leg",
    contact: [0.37, 0.04, 0.25],
  });
  const legR = b.chain("legR", legRPath, {
    parent: foundation,
    names: ["hipR", "kneeR", "ankleR", "footR"],
    role: "leg",
    contact: [-0.37, 0.04, 0.25],
  });

  // The legs are wood-colored, but their joint articulation and toes make them unmistakably avian.
  b.sweep(legL, (t) => 0.105 - t * 0.025, {
    color: OCHRE,
    section: { ngon: 7 },
    skin: "smooth",
    name: "legL_featherless",
  });
  b.sweep(legR, (t) => 0.105 - t * 0.025, {
    color: OCHRE,
    section: { ngon: 7 },
    skin: "smooth",
    name: "legR_featherless",
  });

  // Knobby knee joints and ankle cuffs.
  for (const s of [1, -1]) {
    sphere(0.13, OCHRE, [s * 0.52, 0.68, 0.05], s > 0 ? legL.joints[1] : legR.joints[1], "roundKnee");
    cylinder(0.13, 0.045, RED, [s * 0.48, 0.43, 0.1], {
      bone: s > 0 ? legL.joints[2] : legR.joints[2],
      radialSegments: 8,
      name: "ankleBand",
    });
  }

  // Three long folk-art toes per foot, fanning toward the viewer.
  for (const s of [1, -1]) {
    const footBone = s > 0 ? legL.tip : legR.tip;
    const x = s * 0.37;
    rod([x, 0.18, 0.25], [x + s * 0.20, 0.10, 0.57], 0.043, OCHRE, footBone, "middleToe");
    rod([x, 0.16, 0.25], [x + s * 0.02, 0.08, 0.64], 0.040, OCHRE, footBone, "frontToe");
    rod([x, 0.17, 0.25], [x - s * 0.19, 0.10, 0.54], 0.041, OCHRE, footBone, "outerToe");

    rod(
      [x + s * 0.20, 0.10, 0.57],
      [x + s * 0.25, 0.08, 0.62],
      0.018,
      BARK,
      footBone,
      "toeClaw",
    );
    rod(
      [x + s * 0.02, 0.08, 0.64],
      [x + s * 0.02, 0.06, 0.69],
      0.018,
      BARK,
      footBone,
      "toeClaw",
    );
    rod(
      [x - s * 0.19, 0.10, 0.54],
      [x - s * 0.25, 0.08, 0.58],
      0.018,
      BARK,
      footBone,
      "toeClaw",
    );
    sphere(0.055, RED, [x, 0.16, 0.28], footBone, "footKnot");
  }

  // ---------------------------------------------------------------------------------------------
  // Quiet octagonal diorama base. It is deliberately smaller and simpler than the hut.
  // ---------------------------------------------------------------------------------------------

  cylinder(1.42, 0.10, "#594735", [0, 0.05, 0], undefined);
  cylinder(1.33, 0.018, MOSS, [0, 0.112, 0], { radialSegments: 10, name: "mossTop" });

  // Little painted stones around the footprint, kept low so the hut remains the hero.
  const stones: [number, number, number][] = [
    [-1.00, 0.15, 0.28],
    [0.92, 0.15, -0.35],
    [-0.78, 0.15, -0.52],
    [0.86, 0.15, 0.48],
  ];
  stones.forEach((p, i) => {
    sphere(0.12, i % 2 ? "#76604a" : "#837054", p, undefined, "dioramaStone");
    sphere(0.045, MOSS, [p[0] + 0.015, p[1] + 0.09, p[2] - 0.01], undefined, "stoneMoss");
  });

  // ---------------------------------------------------------------------------------------------
  // Cabin body: overlapping horizontal logs create the heavy, irregular Slavic silhouette.
  // ---------------------------------------------------------------------------------------------

  const logYs = [1.16, 1.34, 1.52, 1.70, 1.88, 2.06];
  logYs.forEach((y, row) => {
    const logColor = row % 2 ? WOOD : WOOD_LIGHT;
    const offset = row % 2 ? 0.025 : -0.025;

    // Front and back walls.
    rod([-0.96, y, 0.0 + 0.57 + offset], [0.96, y, 0.0 + 0.57 + offset], 0.105, logColor, foundation, "frontWallLog");
    rod([-0.96, y, -0.57 + offset], [0.96, y, -0.57 + offset], 0.105, logColor, foundation, "backWallLog");

    // Side walls, visibly protruding beyond the front and back corners.
    rod([-0.96, y, -0.61], [-0.96, y, 0.61], 0.105, row % 2 ? WOOD_LIGHT : WOOD, foundation, "sideWallLog");
    rod([0.96, y, -0.61], [0.96, y, 0.61], 0.105, row % 2 ? WOOD_LIGHT : WOOD, foundation, "sideWallLog");

    // Dark end-grain discs make the interlocking logs read clearly.
    sphere(0.052, WOOD_DARK, [-1.055, y, 0.61], foundation, "logEnd");
    sphere(0.052, WOOD_DARK, [1.055, y, 0.61], foundation, "logEnd");
  });

  // A dark wall backing visible through gaps and around the door.
  box([1.88, 1.04, 1.08], WOOD_DARK, [0, 1.62, 0], {
    bone: foundation,
    name: "shadowBetweenLogs",
  });

  // Re-layer a few front logs over the backing for a strong facade.
  [1.16, 1.34, 1.52, 1.70, 1.88, 2.06].forEach((y, i) => {
    rod([-0.95, y, 0.59], [0.95, y, 0.59], 0.101, i % 2 ? WOOD_LIGHT : WOOD, foundation, "frontLogOverlay");
  });

  // Corner posts and carved vertical braces.
  for (const s of [1, -1]) {
    box([0.15, 1.10, 0.15], WOOD_DARK, [s * 0.94, 1.61, 0.58], {
      bone: foundation,
      name: "cornerPost",
    });
    box([0.055, 0.96, 0.035], RED, [s * 0.86, 1.62, 0.686], {
      bone: foundation,
      name: "cornerRedTrim",
    });
    for (let j = 0; j < 4; j++) {
      folkDiamond(s * 0.86, 1.27 + j * 0.22, 0.709, GOLD, foundation, 0.66, "cornerDiamond");
    }
  }

  // ---------------------------------------------------------------------------------------------
  // Gabled roof: two thick, deliberately low-poly slabs with rows of contrasting shingles.
  // ---------------------------------------------------------------------------------------------

  const roofFront = box([2.42, 1.03, 0.12], ROOF, [0, 2.38, 0.34], {
    bone: foundation,
    rotation: [-34, 0, 0],
    name: "frontRoofPlane",
  });
  const roofBack = box([2.42, 1.03, 0.12], ROOF, [0, 2.38, -0.34], {
    bone: foundation,
    rotation: [34, 0, 0],
    name: "backRoofPlane",
  });

  // Broad red shingle ribs across each slope.
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const z = 0.05 + t * 0.70;
    const y = 2.33 - t * 0.56;
    box([2.30, 0.06, 0.16], i % 2 ? ROOF_LIGHT : RED, [0, y, z], {
      bone: foundation,
      rotation: [-34, 0, 0],
      name: "frontShingleRow",
    });
    box([2.30, 0.06, 0.16], i % 2 ? ROOF_LIGHT : RED, [0, y, -z], {
      bone: foundation,
      rotation: [34, 0, 0],
      name: "backShingleRow",
    });
  }

  // Ridge beam and bright ridge finials.
  rod([-1.27, 2.58, 0], [1.27, 2.58, 0], 0.075, WOOD_DARK, foundation, "ridgeBeam");
  for (const s of [1, -1]) {
    cylinder(0.07, 0.23, GOLD, [s * 1.18, 2.65, 0], {
      bone: foundation,
      radialSegments: 6,
      name: "ridgeFinial",
    });
    sphere(0.09, RED, [s * 1.18, 2.80, 0], foundation, "ridgeFinialBall");
  }

  // Crooked iron chimney and a colorful smoke-cap.
  rod([0.53, 2.32, -0.10], [0.53, 2.78, -0.10], 0.105, IRON, foundation, "chimney");
  box([0.28, 0.08, 0.26], RED, [0.53, 2.80, -0.10], {
    bone: foundation,
    rotation: [0, 0, -8],
    name: "chimneyCap",
  });
  box([0.20, 0.10, 0.20], GOLD, [0.53, 2.89, -0.10], {
    bone: foundation,
    rotation: [0, 0, 8],
    name: "chimneyCrown",
  });

  // ---------------------------------------------------------------------------------------------
  // Front door: arched-ish layered planks, black iron straps, knob, and folk ornament.
  // ---------------------------------------------------------------------------------------------

  box([0.48, 0.82, 0.075], WOOD_DARK, [0, 1.52, 0.69], {
    bone: foundation,
    name: "doorDarkRecess",
  });
  box([0.39, 0.72, 0.095], WOOD_LIGHT, [0, 1.48, 0.735], {
    bone: foundation,
    name: "doorPlanks",
  });

  // Vertical plank seams.
  [-0.13, 0, 0.13].forEach((x) =>
    box([0.014, 0.68, 0.012], WOOD_DARK, [x, 1.48, 0.79], {
      bone: foundation,
      name: "doorSeam",
    }),
  );

  // Door arch and threshold.
  rod([-0.22, 1.86, 0.78], [0.22, 1.86, 0.78], 0.042, RED, foundation, "doorLintel");
  rod([-0.23, 1.23, 0.78], [0.23, 1.23, 0.78], 0.055, BARK, foundation, "doorThreshold");
  rod([-0.23, 1.25, 0.79], [-0.23, 1.87, 0.79], 0.040, RED, foundation, "doorLeftTrim");
  rod([0.23, 1.25, 0.79], [0.23, 1.87, 0.79], 0.040, RED, foundation, "doorRightTrim");

  // Iron straps and a golden sunburst.
  for (const y of [1.38, 1.63]) {
    box([0.43, 0.035, 0.025], IRON, [0, y, 0.80], {
      bone: foundation,
      name: "doorIronStrap",
    });
  }
  folkDiamond(0, 1.75, 0.802, GOLD, foundation, 1.15, "doorSunDiamond");
  folkDiamond(0, 1.42, 0.802, BLUE_LIGHT, foundation, 0.65, "doorBlueDiamond");
  sphere(0.035, GOLD, [0.14, 1.53, 0.805], foundation, "doorHandle");

  // ---------------------------------------------------------------------------------------------
  // Windows: black recesses, cream frames, four panes, shutters, and hanging folk charms.
  // ---------------------------------------------------------------------------------------------

  const makeWindow = (x: number, y: number, z: number, side: 1 | -1, name: string) => {
    const front = z + 0.03;
    box([0.42, 0.39, 0.06], BLACK, [x, y, front], {
      bone: foundation,
      name: `${name}_recess`,
    });
    box([0.36, 0.33, 0.025], GLASS, [x, y, front + 0.04], {
      bone: foundation,
      name: `${name}_glass`,
    });
    box([0.035, 0.37, 0.035], CREAM, [x - 0.205, y, front + 0.06], {
      bone: foundation,
      name: `${name}_frame`,
    });
    box([0.035, 0.37, 0.035], CREAM, [x + 0.205, y, front + 0.06], {
      bone: foundation,
      name: `${name}_frame`,
    });
    box([0.44, 0.035, 0.035], CREAM, [x, y - 0.19, front + 0.06], {
      bone: foundation,
      name: `${name}_frame`,
    });
    box([0.44, 0.035, 0.035], CREAM, [x, y + 0.19, front + 0.06], {
      bone: foundation,
      name: `${name}_frame`,
    });
    box([0.025, 0.37, 0.025], RED, [x, y, front + 0.075], {
      bone: foundation,
      name: `${name}_mullion`,
    });
    box([0.44, 0.025, 0.025], RED, [x, y, front + 0.076], {
      bone: foundation,
      name: `${name}_mullion`,
    });

    // Shutters sit just outside the windows and are intentionally asymmetrical.
    box([0.15, 0.40, 0.055], BLUE, [x - side * 0.31, y, front + 0.005], {
      bone: foundation,
      rotation: [0, side * 10, 0],
      name: `${name}_shutter`,
    });
    box([0.15, 0.40, 0.055], RED, [x + side * 0.31, y, front + 0.005], {
      bone: foundation,
      rotation: [0, -side * 8, 0],
      name: `${name}_shutter`,
    });

    folkDiamond(x, y, front + 0.095, GOLD, foundation, 0.8, `${name}_sun`);
    roundStud(x - side * 0.31, y, front + 0.045, GOLD, foundation, `${name}_shutterStud`);
  };

  makeWindow(-0.53, 1.72, 0.60, 1, "windowL");
  makeWindow(0.53, 1.72, 0.60, -1, "windowR");

  // Side window on the cabin's left wall, giving the silhouette detail when viewed three-quarter.
  box([0.06, 0.38, 0.43], BLACK, [-1.065, 1.70, -0.16], {
    bone: foundation,
    name: "sideWindowRecess",
  });
  box([0.025, 0.30, 0.35], BLUE_LIGHT, [-1.10, 1.70, -0.16], {
    bone: foundation,
    name: "sideWindowGlass",
  });
  box([0.025, 0.035, 0.40], CREAM, [-1.12, 1.70, -0.16], {
    bone: foundation,
    name: "sideWindowCross",
  });
  box([0.025, 0.33, 0.035], CREAM, [-1.12, 1.70, -0.16], {
    bone: foundation,
    name: "sideWindowCross",
  });

  // ---------------------------------------------------------------------------------------------
  // Folk-art trim, talismans, and a carved bird/skull motif.
  // ---------------------------------------------------------------------------------------------

  // Painted eave stripes.
  for (const z of [0.66, -0.66]) {
    box([2.03, 0.055, 0.045], RED, [0, 2.16, z], {
      bone: foundation,
      name: "eaveRedStripe",
    });
    box([2.03, 0.035, 0.035], GOLD, [0, 2.22, z], {
      bone: foundation,
      name: "eaveGoldStripe",
    });
  }

  // Repeating blue/red diamonds on the facade, like painted embroidery.
  for (let i = 0; i < 7; i++) {
    const x = -0.75 + i * 0.25;
    folkDiamond(x, 2.12, 0.705, i % 2 ? BLUE_LIGHT : RED_LIGHT, foundation, 0.62, "facadeFolkDiamond");
    roundStud(x, 1.08, 0.71, GOLD, foundation, "facadeStud");
  }

  // A stylized carved bird above the door.
  box([0.08, 0.24, 0.025], GOLD, [0, 2.02, 0.735], {
    bone: foundation,
    rotation: [0, 0, 45],
    name: "carvedBirdWing",
  });
  box([0.08, 0.24, 0.025], GOLD, [0, 2.02, 0.735], {
    bone: foundation,
    rotation: [0, 0, -45],
    name: "carvedBirdWing",
  });
  sphere(0.06, RED, [0, 2.11, 0.75], foundation, "carvedBirdHead");
  rod([0, 2.08, 0.76], [0, 1.98, 0.76], 0.022, GOLD, foundation, "carvedBirdBody");

  // A small skull charm under the left eave, echoing Baba Yaga without adding a second character.
  sphere(0.095, BONE, [-0.73, 2.16, 0.70], foundation, "skullCharm");
  sphere(0.027, BLACK, [-0.76, 2.18, 0.785], foundation, "skullEye");
  sphere(0.027, BLACK, [-0.70, 2.18, 0.785], foundation, "skullEye");
  box([0.035, 0.025, 0.025], BLACK, [-0.73, 2.12, 0.79], {
    bone: foundation,
    name: "skullMouth",
  });
  rod([-0.84, 2.26, 0.72], [-0.92, 2.38, 0.72], 0.012, IRON, foundation, "skullHanger");
  rod([-0.62, 2.26, 0.72], [-0.54, 2.38, 0.72], 0.012, IRON, foundation, "skullHanger");

  // Moss tufts on the upper, damp-looking ledges.
  for (const p of [
    [-0.83, 2.18, 0.57],
    [-0.42, 2.18, 0.58],
    [0.32, 2.18, 0.58],
    [0.78, 2.18, 0.58],
    [0.95, 2.14, -0.52],
    [-0.95, 2.13, -0.52],
  ] as [number, number, number][]) {
    sphere(0.055, MOSS, p, foundation, "mossTuft");
    rod([p[0], p[1], p[2]], [p[0] + 0.02, p[1] + 0.07, p[2] - 0.025], 0.012, GREEN, foundation, "mossBlade");
  }

  // ---------------------------------------------------------------------------------------------
  // A tiny broom leaning against the hut, the one accessory that makes the cottage feel inhabited.
  // ---------------------------------------------------------------------------------------------

  rod([-1.02, 0.26, 0.72], [-0.77, 1.39, 0.74], 0.018, WOOD_DARK, foundation, "broomHandle");
  for (let i = -2; i <= 2; i++) {
    rod(
      [-1.02 + i * 0.035, 0.22, 0.72],
      [-1.02 + i * 0.045, 0.05, 0.70],
      0.018,
      OCHRE,
      foundation,
      "broomTwig",
    );
  }
  rod([-1.09, 0.23, 0.73], [-0.95, 0.23, 0.72], 0.028, RED, foundation, "broomBinding");

  // A few rivet-like nail heads at the most visible log joins.
  for (const y of [1.18, 1.54, 1.90, 2.08]) {
    roundStud(-1.06, y, 0.61, GOLD, foundation, "logNail");
    roundStud(1.06, y, 0.61, GOLD, foundation, "logNail");
  }

  // Force a stable deterministic random source into the build contract without introducing visual noise.
  // It is intentionally unused: future kit variations can add deterministic moss scatter without changing the pose.
  rng(17);

  return b.root;
}
```