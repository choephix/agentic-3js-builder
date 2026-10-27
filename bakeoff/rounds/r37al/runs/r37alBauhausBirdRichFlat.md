```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  limb,
  rng,
} from "agentic-3js-builder";
import {
  cel,
  animeEye,
  INK,
} from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "bauhaus-songbird-on-branch",
  description:
    "A stylized songbird perched on a geometric branch, built from bold Bauhaus primary-colour primitives.",
};

export default function build() {
  const b = createBuilder({ name: "bauhaus-songbird", detail: 1 });

  const RED = "#d92828";
  const BLUE = "#1455b8";
  const YELLOW = "#f2c230";
  const BLACK = "#17171c";
  const CREAM = "#f4e8c8";
  const WHITE = "#fff8e8";
  const BRANCH = "#6b3f26";
  const BRANCH_LIGHT = "#a86b37";
  const GREEN = "#278052";

  const red = cel(RED, "#851d2e");
  const blue = cel(BLUE, "#102d72");
  const yellow = cel(YELLOW, "#a96e21");
  const cream = cel(CREAM, "#bb896d");
  const branchPaint = cel(BRANCH, "#34201e");
  const branchLight = cel(BRANCH_LIGHT, "#5b3525");

  const box = (
    size: [number, number, number],
    color: any,
    at: THREE.Vector3 | [number, number, number],
    bone?: any,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone,
      rotation,
      flat: true,
    });

  const sphere = (
    radius: number,
    color: any,
    at: THREE.Vector3 | [number, number, number],
    bone?: any,
    scale?: [number, number, number],
  ) =>
    b.part(new THREE.SphereGeometry(radius, 10, 7), color, {
      at,
      bone,
      scale,
      flat: true,
    });

  const cylinder = (
    radius: number,
    length: number,
    color: any,
    at: THREE.Vector3 | [number, number, number],
    dir: [number, number, number],
    bone?: any,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, length, 8), color, {
      at,
      dir,
      bone,
      flat: true,
    });

  // -------------------------------------------------------------------------
  // Branch: one broad angular trunk with two geometric twigs.
  // -------------------------------------------------------------------------

  const branchRoot = b.joint("branchRoot", {
    at: [0, 0.22, -0.1],
    dir: [0, 0.18, 1],
    role: "spine",
  });

  const branchPath = catmull([
    [-0.82, 0.30, -0.54],
    [-0.48, 0.27, -0.25],
    [0.0, 0.29, -0.06],
    [0.5, 0.32, 0.1],
    [0.9, 0.35, 0.34],
  ]);

  const branchChain = b.chain("branch", branchPath, {
    parent: branchRoot,
    count: 5,
    names: ["branchA", "branchB", "branchC", "branchD", "branchTip"],
    role: "spine",
  });

  const trunk = b.sweep(branchChain, (t) => 0.075 - t * 0.025, {
    color: branchPaint,
    section: { ngon: 6 },
    caps: "round",
    name: "angularBranch",
  });

  const twigL = b.sprout(
    "twigL",
    branchChain.at(0.23),
    catmull([
      branchChain.at(0.23).at,
      [-0.68, 0.46, 0.03],
      [-0.84, 0.67, 0.16],
    ]),
    [0.038, 0.016],
    { color: branchLight, role: "fan", count: 1 },
  );

  const twigR = b.sprout(
    "twigR",
    branchChain.at(0.74),
    catmull([
      branchChain.at(0.74).at,
      [0.67, 0.5, 0.18],
      [0.84, 0.7, 0.3],
    ]),
    [0.032, 0.012],
    { color: branchLight, role: "fan", count: 1 },
  );

  // Simple Bauhaus leaf discs at twig ends.
  b.part(
    new THREE.CircleGeometry(0.12, 8),
    GREEN,
    {
      at: [0.84, 0.71, 0.31],
      dir: [0.1, 0.8, 0.2],
      axis: "z",
      rotation: [0.25, 0.2, -0.25],
      flat: true,
      name: "leafRight",
    },
  );
  b.part(
    new THREE.CircleGeometry(0.10, 8),
    GREEN,
    {
      at: [-0.85, 0.68, 0.17],
      dir: [-0.1, 0.8, 0.15],
      axis: "z",
      rotation: [-0.2, -0.2, 0.3],
      flat: true,
      name: "leafLeft",
    },
  );

  // -------------------------------------------------------------------------
  // Bird skeleton: torso, neck, head, open-readable jaw, legs and wings.
  // -------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.70, 0.08],
    dir: [0, 0.12, 1],
    role: "spine",
  });

  const torsoPath = catmull([
    [0, 0.70, 0.08],
    [0, 0.82, 0.18],
    [0, 0.95, 0.29],
    [0, 1.08, 0.38],
  ]);

  const torso = b.chain("torso", torsoPath, {
    parent: hips,
    count: 4,
    names: ["spine", "chest", "shoulder", "neckBase"],
    role: "spine",
  });

  const neck = b.chain(
    catmull([
      [0, 1.08, 0.38],
      [0, 1.18, 0.46],
      [0, 1.28, 0.5],
    ]),
    {
      parent: torso.tip,
      count: 2,
      names: ["neck", "neckTop"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.38, 0.54],
    dir: [0, 0.02, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.33, 0.70],
    dir: [0, -0.14, 0.99],
    role: "jaw",
    group: "head",
  });

  // Legs are deliberately visible, straight and graphic.
  for (const side of [-1, 1]) {
    const x = side * 0.095;
    const legPoints = limb(
      [x, 0.77, 0.19],
      [x, 0.34, 0.12],
      [0.20, 0.22],
      [[0, 0, 1]],
      { sole: [0, 0, 1] },
    );

    const leg = b.chain(`leg${side > 0 ? "L" : "R"}`, legPoints, {
      parent: torso.joints[1],
      names: [
        `hip${side > 0 ? "L" : "R"}`,
        `knee${side > 0 ? "L" : "R"}`,
        `ankle${side > 0 ? "L" : "R"}`,
      ],
      role: "leg",
      contact: [x, 0.30, 0.12],
    });

    b.sweep(leg, [0.027, 0.018], {
      color: yellow,
      section: { ngon: 5 },
      caps: "round",
      name: `goldLeg${side}`,
    });

    const footY = 0.315;
    cylinder(0.018, 0.17, yellow, [x, footY, 0.17], [0, 0, 1], leg.tip);
    cylinder(0.013, 0.10, yellow, [x + side * 0.025, footY, 0.25], [0, 0, 1], leg.tip);
    cylinder(0.013, 0.10, yellow, [x - side * 0.025, footY, 0.25], [0, 0, 1], leg.tip);
  }

  // -------------------------------------------------------------------------
  // Body: a faceted red oval with a yellow geometric belly patch.
  // -------------------------------------------------------------------------

  const body = b.part(
    new THREE.SphereGeometry(0.31, 12, 8),
    red,
    {
      bone: torso.joints[1],
      at: [0, 0.91, 0.27],
      scale: [0.78, 1.12, 1.30],
      flat: true,
      name: "redBody",
    },
  );

  const belly = b.part(
    new THREE.SphereGeometry(0.245, 10, 6),
    yellow,
    {
      bone: torso.joints[1],
      at: [0, 0.91, 0.49],
      scale: [0.72, 0.94, 0.16],
      flat: true,
      name: "goldBelly",
    },
  );

  // Shoulder collar: a thick blue band made from a short polygonal sweep.
  b.sweep(
    catmull([
      [-0.235, 1.07, 0.35],
      [-0.15, 1.13, 0.43],
      [0, 1.15, 0.47],
      [0.15, 1.13, 0.43],
      [0.235, 1.07, 0.35],
    ]),
    0.038,
    {
      color: blue,
      section: { ngon: 6 },
      caps: "round",
      name: "blueShoulderBand",
    },
  );

  // Tail fan, three flat primary-colour feathers.
  const tailOutline: [number, number, "sharp"][] = [
    [0, 0, "sharp"],
    [0.15, 0.02, "sharp"],
    [0.27, 0.28, "sharp"],
    [0.05, 0.19, "sharp"],
    [-0.17, 0.28, "sharp"],
    [-0.12, 0.03, "sharp"],
  ];

  for (const s of [-1, 0, 1]) {
    b.extrude(tailOutline, {
      at: [s * 0.07, 0.82, -0.03],
      x: [1, 0, 0],
      y: [0, 0.5, -0.86],
      thickness: 0.025,
      bevel: 0.004,
      color: s === 0 ? blue : s > 0 ? red : yellow,
      bone: torso.joints[0],
      name: `tailFeather${s}`,
    });
  }

  // -------------------------------------------------------------------------
  // Head and face.
  // -------------------------------------------------------------------------

  const skull = b.part(
    new THREE.SphereGeometry(0.25, 12, 8),
    blue,
    {
      bone: head,
      at: [0, 1.38, 0.55],
      scale: [1.0, 1.02, 1.13],
      flat: true,
      name: "blueHead",
    },
  );

  // Graphic cream face mask, forward-facing.
  b.part(
    new THREE.SphereGeometry(0.17, 10, 6),
    cream,
    {
      bone: head,
      at: [0, 1.37, 0.745],
      scale: [1.05, 0.82, 0.22],
      flat: true,
      name: "creamFace",
    },
  );

  // Red crown disc.
  b.part(
    new THREE.CylinderGeometry(0.13, 0.13, 0.045, 8),
    red,
    {
      bone: head,
      at: [0, 1.58, 0.54],
      dir: [0, 1, 0],
      flat: true,
      name: "redCrown",
    },
  );

  // Eyes: large outlined Bauhaus circles with white highlights.
  const eyeTexture = animeEye({
    iris: "#f2c230",
    irisLight: "#fff2a0",
    irisDark: "#8d381e",
    ink: INK,
    blush: false,
    brow: false,
    size: 256,
  });

  const eyeSurface = b.surface(skull);
  for (const side of [-1, 1]) {
    const hit = eyeSurface.around([0, 1.38, 0.55]).at(side * 42, 6);
    if (hit) {
      b.decal(skull, eyeTexture, {
        at: hit,
        size: [0.12, 0.15],
        lift: 0.006,
        mirror: side > 0,
        name: `goldEye${side}`,
      });
    }
  }

  // Beak is two separate jaw pieces so the mouth reads as open.
  const upperBeak = b.extrude(
    [
      [0, 0, "sharp"],
      [0.12, 0.035, "sharp"],
      [0.0, 0.07, "sharp"],
      [-0.12, 0.035, "sharp"],
    ],
    {
      at: [0, 1.38, 0.79],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: [0.025, 0.012],
      color: yellow,
      bone: head,
      name: "upperBeak",
    },
  );

  const lowerBeak = b.extrude(
    [
      [0, 0, "sharp"],
      [0.085, -0.018, "sharp"],
      [0.0, 0.045, "sharp"],
      [-0.085, -0.018, "sharp"],
    ],
    {
      at: [0, 1.315, 0.80],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: [0.018, 0.008],
      color: RED,
      bone: jaw,
      name: "lowerBeak",
    },
  );

  // Dark mouth gap.
  b.part(
    new THREE.BoxGeometry(0.13, 0.018, 0.012),
    BLACK,
    {
      bone: jaw,
      at: [0, 1.355, 0.805],
      name: "mouthGap",
    },
  );

  // Two cheek circles emphasize the geometric face.
  for (const side of [-1, 1]) {
    b.part(
      new THREE.CircleGeometry(0.052, 8),
      side > 0 ? RED : YELLOW,
      {
        bone: head,
        at: [side * 0.17, 1.34, 0.73],
        dir: [side * 0.35, 0.02, 1],
        axis: "z",
        flat: true,
        name: `cheek${side}`,
      },
    );
  }

  // -------------------------------------------------------------------------
  // Wings: solid angular silhouettes with blue outer panels and yellow bars.
  // -------------------------------------------------------------------------

  for (const side of [-1, 1]) {
    const wing = b.joint(`wing${side > 0 ? "L" : "R"}`, {
      parent: torso.joints[2],
      at: [side * 0.22, 1.10, 0.30],
      dir: [side * 0.72, -0.25, -0.15],
      role: "wing",
      group: "wings",
    });

    const wingShape: [number, number, "sharp"][] = [
      [0, 0, "sharp"],
      [0.12, 0.06, "sharp"],
      [0.34, 0.06, "sharp"],
      [0.48, 0.22, "sharp"],
      [0.18, 0.58, "sharp"],
      [-0.03, 0.40, "sharp"],
    ];

    b.extrude(wingShape, {
      at: [side * 0.18, 1.11, 0.30],
      x: [side, 0, 0],
      y: [0.14, 0.95, -0.08],
      thickness: 0.035,
      bevel: 0.006,
      color: blue,
      bone: wing,
      name: `blueWing${side}`,
    });

    // Yellow graphic stripe inset across each wing.
    b.extrude(
      [
        [0, 0, "sharp"],
        [0.20, 0.02, "sharp"],
        [0.25, 0.075, "sharp"],
        [0.04, 0.06, "sharp"],
      ],
      {
        at: [side * 0.22, 1.30, 0.285],
        x: [side, 0, 0],
        y: [0.14, 0.95, -0.08],
        thickness: 0.043,
        color: yellow,
        bone: wing,
        name: `wingStripe${side}`,
      },
    );

    // Red wing-tip triangle.
    b.extrude(
      [
        [0, 0, "sharp"],
        [0.14, 0.02, "sharp"],
        [0.19, 0.13, "sharp"],
        [0.04, 0.10, "sharp"],
      ],
      {
        at: [side * 0.43, 1.19, 0.235],
        x: [side, 0, 0],
        y: [0.14, 0.95, -0.08],
        thickness: 0.05,
        color: red,
        bone: wing,
        name: `redWingTip${side}`,
      },
    );
  }

  // -------------------------------------------------------------------------
  // Small Bauhaus ornaments: neck button, wing rivets, branch knots.
  // -------------------------------------------------------------------------

  sphere(0.052, WHITE, [0, 1.19, 0.53], neck.joints[0], [1, 1, 0.25]);
  sphere(0.025, BLACK, [0, 1.19, 0.555], neck.joints[0]);

  for (const side of [-1, 1]) {
    sphere(
      0.022,
      CREAM,
      [side * 0.245, 1.04, 0.38],
      torso.joints[2],
      [1, 1, 0.35],
    );
  }

  // Branch end caps and graphic knots.
  sphere(0.055, BRANCH_LIGHT, [-0.82, 0.30, -0.54], branchChain.joints[0]);
  sphere(0.035, YELLOW, [0.51, 0.35, 0.12], branchChain.joints[3]);
  sphere(0.028, RED, [-0.45, 0.29, -0.24], branchChain.joints[1]);

  // Ensure the bird's feet visibly grip the perch with short dark toe pads.
  for (const side of [-1, 1]) {
    const x = side * 0.095;
    cylinder(0.013, 0.09, BLACK, [x, 0.326, 0.18], [0, 0, 1]);
    cylinder(0.011, 0.065, BLACK, [x + side * 0.03, 0.326, 0.20], [0, 0, 1]);
  }

  return b.root;
}
```