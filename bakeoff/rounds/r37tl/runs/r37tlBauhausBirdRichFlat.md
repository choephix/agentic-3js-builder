```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  line,
  rng,
} from "agentic-3js-builder";

export const meta = {
  name: "Bauhaus Songbird on a Branch",
  description:
    "A stylized low-poly songbird perched on a dark branch, assembled from bold primary-colour geometric primitives.",
};

const RED = "#e53935";
const BLUE = "#1557c0";
const YELLOW = "#f5c542";
const BLACK = "#17191f";
const CREAM = "#f5ead0";
const WHITE = "#fffaf0";
const ORANGE = "#ee7b22";
const GREEN = "#2d7848";
const BROWN = "#513522";
const DARK_BROWN = "#281a18";
const PALE_BLUE = "#74b9df";

function sphere(
  b: ReturnType<typeof createBuilder>,
  at: any,
  radius: number,
  color: string,
  bone?: any,
  scale?: [number, number, number],
  name?: string,
) {
  return b.part(new THREE.SphereGeometry(radius, 10, 7), color, {
    at,
    bone,
    scale,
    name,
    flat: true,
  });
}

function cube(
  b: ReturnType<typeof createBuilder>,
  at: any,
  size: [number, number, number],
  color: string,
  bone?: any,
  name?: string,
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    bone,
    name,
    flat: true,
  });
}

function cylinder(
  b: ReturnType<typeof createBuilder>,
  at: any,
  radius: number,
  length: number,
  color: string,
  dir: any,
  bone?: any,
  name?: string,
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, length, 8, 1), color, {
    at,
    dir,
    bone,
    name,
    flat: true,
  });
}

function build() {
  const b = createBuilder({ name: "bauhaus-songbird", detail: 1 });

  // ------------------------------------------------------------------------------------------------
  // Skeleton: one root, a compact spine/neck, two legs, tail, wings, and a hinged jaw.

  const root = b.joint("pelvis", {
    at: [0, 0.72, -0.08],
    dir: [0, 0.05, 1],
    role: "spine",
    group: "bird",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.72, -0.08],
      [0, 0.79, 0.04],
      [0, 0.91, 0.18],
      [0, 1.05, 0.29],
    ]),
    {
      parent: root,
      count: 4,
      names: ["spine1", "chest", "shoulders", "neckBase"],
      role: "spine",
      group: "bird",
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.05, 0.29],
      [0, 1.16, 0.39],
      [0, 1.27, 0.47],
    ]),
    {
      parent: spine.tip,
      count: 2,
      names: ["neck", "headPivot"],
      role: "neck",
      group: "bird",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.29, 0.49],
    dir: [0, 0.03, 1],
    role: "head",
    group: "bird",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.235, 0.535],
    dir: [0, -0.12, 1],
    role: "jaw",
    group: "face",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.82, -0.19],
      [0, 0.78, -0.39],
      [0, 0.76, -0.61],
      [0, 0.78, -0.88],
    ]),
    {
      parent: root,
      count: 4,
      names: ["tail1", "tail2", "tail3", "tailTip"],
      role: "tail",
      group: "bird",
    },
  );

  const legPoints: Record<string, any> = {};
  const legs: Record<string, any> = {};

  for (const side of [1, -1]) {
    const tag = side > 0 ? "L" : "R";
    const hip = [side * 0.105, 0.77, 0.04] as [number, number, number];
    const ankle = [side * 0.12, 0.405, 0.10] as [number, number, number];

    const points = limb(
      hip,
      ankle,
      [0.16, 0.19, 0.16],
      [
        [side * 0.3, 0, 1],
        [side * -0.15, 0, -1],
      ],
      { sole: [0, 0, 1] },
    );

    legPoints[tag] = points;
    legs[tag] = b.chain(`leg${tag}`, points, {
      parent: root,
      names: [`hip${tag}`, `knee${tag}`, `ankle${tag}`],
      role: "leg",
      contact: ankle,
      group: "bird",
    });
  }

  const wings: Record<string, any> = {};
  for (const side of [1, -1]) {
    const tag = side > 0 ? "L" : "R";
    wings[tag] = b.joint(`wing${tag}`, {
      parent: spine.joints[2],
      at: [side * 0.185, 1.00, 0.16],
      dir: [side * 0.72, -0.08, -0.12],
      role: "wing",
      group: "wings",
    });
  }

  // ------------------------------------------------------------------------------------------------
  // Branch: a simple, chunky Bauhaus stage for the bird.

  const branchPath = catmull([
    [-0.82, 0.30, -0.30],
    [-0.50, 0.34, -0.15],
    [-0.18, 0.36, -0.06],
    [0.18, 0.35, 0.02],
    [0.52, 0.39, 0.18],
    [0.86, 0.43, 0.35],
  ]);

  const branch = b.sweep(branchPath, (t) => 0.085 - t * 0.018, {
    color: DARK_BROWN,
    sides: 7,
    caps: "round",
    name: "mainBranch",
    group: "perch",
  });

  const branchTip = branchPath.at(0.12);
  const forkA = b.sweep(
    catmull([
      [-0.46, 0.34, -0.15],
      [-0.63, 0.55, 0.05],
      [-0.74, 0.78, 0.20],
    ]),
    [0.055, 0.022],
    {
      color: BROWN,
      sides: 6,
      caps: "round",
      name: "forkLeft",
      group: "perch",
    },
  );

  const forkB = b.sweep(
    catmull([
      [0.48, 0.39, 0.16],
      [0.63, 0.60, 0.32],
      [0.75, 0.79, 0.47],
    ]),
    [0.045, 0.018],
    {
      color: BROWN,
      sides: 6,
      caps: "round",
      name: "forkRight",
      group: "perch",
    },
  );

  // Geometric branch rings and small red/blue Bauhaus accent blocks.
  for (const p of [
    [-0.48, 0.36, -0.13],
    [-0.18, 0.36, -0.06],
    [0.20, 0.35, 0.03],
    [0.51, 0.39, 0.18],
  ]) {
    b.ring(line(p, [p[0], p[1] + 0.06, p[2]]), {
      count: 8,
      radius: 0.087,
      fromDeg: 0,
      toDeg: 360,
      name: "branchRing",
      role: "fan",
      group: "perch",
    }, (item) => {
      if (item.i % 3 === 0) {
        b.part(new THREE.BoxGeometry(0.018, 0.012, 0.035), YELLOW, {
          frame: item,
          name: "branchMark",
          group: "perch",
        });
      }
    });
  }

  // ------------------------------------------------------------------------------------------------
  // Body: a large yellow ovoid with a blue chest block and red rump.

  const body = b.loft(
    [
      { at: spine.at(0), w: 0.34, h: 0.36 },
      { at: spine.at(0.32), w: 0.42, h: 0.43 },
      { at: spine.at(0.67), w: 0.35, h: 0.39 },
      { at: spine.at(1), w: 0.24, h: 0.29 },
    ],
    {
      bone: spine,
      color: YELLOW,
      section: "circle",
      detail: 1,
      name: "goldenBody",
      group: "body",
    },
  );

  b.sweep(
    catmull([
      [-0.01, 0.73, -0.23],
      [-0.01, 0.79, -0.10],
      [-0.01, 0.84, 0.05],
    ]),
    [0.16, 0.10],
    {
      bone: root,
      color: RED,
      sides: 8,
      caps: "round",
      name: "redRump",
      group: "body",
    },
  );

  b.sweep(
    catmull([
      [0, 0.79, 0.12],
      [0, 0.90, 0.23],
      [0, 1.04, 0.30],
    ]),
    [0.16, 0.10],
    {
      bone: spine.joints[1],
      color: BLUE,
      sides: 8,
      caps: "round",
      name: "blueChest",
      group: "body",
    },
  );

  // Chest collar and geometric breast badge.
  b.sweep(
    catmull([
      [-0.14, 1.00, 0.29],
      [0, 1.06, 0.34],
      [0.14, 1.00, 0.29],
    ]),
    0.018,
    {
      bone: spine.joints[2],
      color: BLACK,
      caps: "round",
      name: "chestCollar",
      group: "trim",
    },
  );

  cube(b, [0, 1.005, 0.385], [0.105, 0.105, 0.018], RED, spine.joints[2], "chestSquare");
  b.part(new THREE.CylinderGeometry(0.044, 0.044, 0.022, 6), YELLOW, {
    bone: spine.joints[2],
    at: [0, 1.005, 0.402],
    dir: [0, 0, 1],
    name: "chestMedallion",
    group: "trim",
  });

  // ------------------------------------------------------------------------------------------------
  // Head and face.

  sphere(
    b,
    head.at,
    0.205,
    YELLOW,
    head,
    [1.0, 0.92, 1.08],
    "roundHead",
  );

  // Blue cap-like crown and red cheek blocks.
  b.part(new THREE.SphereGeometry(0.16, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.45), BLUE, {
    bone: head,
    at: [0, 1.375, 0.49],
    scale: [1.0, 0.7, 1.0],
    name: "blueCrown",
    group: "head",
  });

  for (const side of [1, -1]) {
    sphere(b, [side * 0.135, 1.245, 0.535], 0.067, RED, head, [1, 0.8, 0.65], `cheek${side > 0 ? "L" : "R"}`);
  }

  // White geometric eye plates, black pupils, yellow highlights.
  for (const side of [1, -1]) {
    const tag = side > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.064, 8, 6), WHITE, {
      bone: head,
      at: [side * 0.082, 1.335, 0.665],
      scale: [1.0, 1.12, 0.48],
      name: `eyeWhite${tag}`,
      group: "face",
    });
    sphere(b, [side * 0.082, 1.337, 0.695], 0.035, BLACK, head, [0.72, 1.15, 0.30], `pupil${tag}`);
    sphere(b, [side * 0.069, 1.358, 0.710], 0.010, WHITE, head, undefined, `eyeGlint${tag}`);
    cube(b, [side * 0.085, 1.405, 0.669], [0.105, 0.019, 0.022], BLACK, head, `brow${tag}`);
  }

  // Separate upper and lower beak/jaw, facing +Z.
  b.part(new THREE.ConeGeometry(0.085, 0.19, 4), ORANGE, {
    bone: head,
    at: [0, 1.295, 0.725],
    dir: [0, 0, 1],
    axis: "z",
    scale: [1, 1, 0.9],
    name: "upperBeak",
    group: "face",
  });

  b.part(new THREE.ConeGeometry(0.065, 0.13, 4), BLACK, {
    bone: jaw,
    at: [0, 1.255, 0.735],
    dir: [0, -0.10, 1],
    axis: "z",
    name: "lowerBeak",
    group: "face",
  });

  // Tiny red throat patch.
  b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.018, 8), RED, {
    bone: head,
    at: [0, 1.185, 0.60],
    dir: [0, 1, 0],
    name: "throatPatch",
    group: "face",
  });

  // Crown fin / crest: a flat Bauhaus triangle.
  b.extrude(
    [
      [0, 0],
      [0.10, 0.035],
      [0.075, 0.13],
      [0.015, 0.19],
      [-0.04, 0.10],
    ],
    {
      at: [0, 1.43, 0.48],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.006,
      color: RED,
      bone: head,
      name: "redCrest",
      group: "head",
    },
  );

  // ------------------------------------------------------------------------------------------------
  // Wings: large side slabs with blue outer silhouette and yellow inset feathers.

  for (const side of [1, -1]) {
    const tag = side > 0 ? "L" : "R";
    const wing = wings[tag];

    b.slab(
      [
        [side * 0.19, 1.08, 0.22],
        [side * 0.37, 1.04, 0.18],
        [side * 0.49, 0.84, 0.02],
        [side * 0.35, 0.75, -0.05],
        [side * 0.20, 0.84, 0.06],
      ],
      {
        color: BLUE,
        thickness: 0.035,
        bone: wing,
        name: `blueWing${tag}`,
        group: "wings",
      },
    );

    b.slab(
      [
        [side * 0.225, 1.03, 0.245],
        [side * 0.34, 0.99, 0.20],
        [side * 0.41, 0.86, 0.09],
        [side * 0.32, 0.82, 0.04],
        [side * 0.235, 0.88, 0.10],
      ],
      {
        color: YELLOW,
        thickness: 0.043,
        bone: wing,
        name: `yellowWingPanel${tag}`,
        group: "wings",
      },
    );

    // Three rigid red feather bars make the wing read instantly.
    for (let i = 0; i < 3; i++) {
      const a = [side * (0.28 + i * 0.045), 0.96 - i * 0.055, 0.26 - i * 0.07];
      const z = [side * (0.38 + i * 0.035), 0.84 - i * 0.045, 0.08 - i * 0.04];
      b.rod(a, z, 0.014, {
        bone: wing,
        color: RED,
        caps: "round",
        name: `redFlight${tag}${i}`,
        group: "wings",
      });
    }

    // Circular blue wing rivet.
    sphere(b, [side * 0.245, 0.965, 0.275], 0.027, CREAM, wing, undefined, `wingRivet${tag}`);
  }

  // ------------------------------------------------------------------------------------------------
  // Tail fan: three crisp primary-colour feathers.

  for (const side of [-1, 0, 1]) {
    const x = side * 0.085;
    const col = side === 0 ? BLUE : RED;
    b.extrude(
      [
        [0, 0],
        [0.065, 0.025],
        [0.10, 0.34],
        [0.02, 0.48],
        [-0.045, 0.25],
      ],
      {
        at: [x, 0.76, -0.38],
        x: [side === 0 ? 1 : side, 0, 0],
        y: [0, 0, -1],
        thickness: 0.026,
        bevel: 0.004,
        color: col,
        bone: tail.joints[Math.min(2, Math.max(0, side + 1))],
        name: `tailFeather${side}`,
        group: "tail",
      },
    );
  }

  // Tail yellow shaft and dark tips.
  for (const side of [-1, 0, 1]) {
    b.rod(
      [side * 0.04, 0.78, -0.29],
      [side * 0.08, 0.77, -0.68],
      0.012,
      {
        bone: tail.joints[1],
        color: YELLOW,
        name: `tailShaft${side}`,
        group: "tail",
      },
    );
  }

  // ------------------------------------------------------------------------------------------------
  // Legs, feet, and toes. Feet remain just above the branch.

  for (const side of [1, -1]) {
    const tag = side > 0 ? "L" : "R";
    const chain = legs[tag];
    const pts = legPoints[tag];

    b.sweep(chain, [0.035, 0.025], {
      bone: chain,
      color: ORANGE,
      sides: 6,
      caps: "round",
      name: `orangeLeg${tag}`,
      group: "legs",
    });

    sphere(b, pts[pts.length - 1], 0.040, ORANGE, chain.tip, [1.1, 0.65, 1.4], `foot${tag}`);

    const ankle = pts[pts.length - 1];
    for (let i = -1; i <= 1; i++) {
      const toeStart = [ankle[0] + i * 0.012, ankle[1] + 0.005, ankle[2] + 0.02] as [number, number, number];
      const toeEnd = [ankle[0] + i * 0.027, 0.355, ankle[2] + 0.085 + Math.abs(i) * 0.01] as [number, number, number];
      b.rod(toeStart, toeEnd, 0.010, {
        bone: chain.tip,
        color: BLACK,
        caps: "round",
        name: `toe${tag}${i}`,
        group: "legs",
      });
    }
  }

  // A small yellow perch-contact band below each foot.
  for (const side of [1, -1]) {
    const tag = side > 0 ? "L" : "R";
    b.part(new THREE.TorusGeometry(0.048, 0.009, 5, 8), YELLOW, {
      bone: legs[tag].tip,
      at: [side * 0.12, 0.385, 0.10],
      rotation: [90, 0, 0],
      name: `footBand${tag}`,
      group: "legs",
    });
  }

  // ------------------------------------------------------------------------------------------------
  // A few graphic marks: black wing seams, yellow neck buttons, and a blue branch-side accent.

  for (let i = 0; i < 3; i++) {
    b.part(new THREE.BoxGeometry(0.018, 0.055, 0.012), BLACK, {
      bone: spine.joints[2],
      at: [-0.11 + i * 0.11, 1.105, 0.32],
      name: `neckMark${i}`,
      group: "trim",
    });
  }

  b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.014, 8), BLUE, {
    at: [0.63, 0.48, 0.31],
    dir: [0, 1, 0],
    name: "branchBlueDot",
    group: "perch",
  });

  // Keep the lower branch touching the floor without adding scenery.
  b.part(new THREE.BoxGeometry(0.18, 0.10, 0.22), DARK_BROWN, {
    at: [-0.78, 0.05, -0.30],
    rotation: [0, 0, -9],
    name: "branchRootBlock",
    group: "perch",
  });

  return b.root;
}

export default build;
```