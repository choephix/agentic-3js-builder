```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  svg,
  rng,
} from "agentic-3js-builder";

export const meta = {
  name: "Bauhaus Songbird on a Branch",
  description:
    "A stylized primary-colour songbird perched on a simple angular branch, with a round blue body, yellow head, red wing geometry, graphic eyes, beak, tail and tiny gripping feet.",
};

export default function build() {
  const b = createBuilder({ name: "bauhaus-songbird", detail: 0.8 });

  const BLUE = "#1769aa";
  const LIGHT_BLUE = "#2d8fc4";
  const YELLOW = "#f4c430";
  const GOLD = "#ffd84a";
  const RED = "#d9363e";
  const DARK_RED = "#a92732";
  const ORANGE = "#ef792f";
  const BLACK = "#16161b";
  const WHITE = "#fff7dc";
  const BRANCH = "#6f432d";
  const BRANCH_LIGHT = "#9a6339";
  const LEAF_GREEN = "#4f8f46";

  // The perch is deliberately simple and graphic: one strong diagonal fork,
  // plus three cut branch knobs.
  const branchPath = catmull([
    [-0.78, 0.13, -0.08],
    [-0.42, 0.16, 0.02],
    [0.0, 0.15, 0.0],
    [0.42, 0.17, 0.03],
    [0.82, 0.14, -0.02],
  ]);
  const branch = b.sweep(branchPath, 0.085, {
    color: BRANCH,
    sides: 6,
    caps: "round",
    name: "mainBranch",
    group: "perch",
  });

  b.sweep(
    polyline([
      [-0.28, 0.16, 0.0],
      [-0.46, 0.39, -0.02],
      [-0.58, 0.62, -0.02],
    ]),
    [0.065, 0.025],
    { color: BRANCH_LIGHT, sides: 6, caps: "round", name: "forkL", group: "perch" },
  );
  b.sweep(
    polyline([
      [0.36, 0.16, 0.03],
      [0.57, 0.38, 0.02],
      [0.72, 0.57, 0.02],
    ]),
    [0.06, 0.022],
    { color: BRANCH_LIGHT, sides: 6, caps: "round", name: "forkR", group: "perch" },
  );

  for (const [x, z, r] of [
    [-0.66, -0.02, 0.045],
    [0.52, 0.03, 0.042],
    [0.02, 0.02, 0.038],
  ] as const) {
    b.part(new THREE.SphereGeometry(r, 7, 5), BRANCH_LIGHT, {
      at: [x, 0.19, z],
      name: "branchBud",
      group: "perch",
    });
  }

  // Skeleton first: a compact upright bird, facing +Z.
  const hips = b.joint("hips", {
    at: [0, 0.76, -0.01],
    dir: [0, 0.12, 1],
    role: "spine",
    group: "bird",
  });

  const torso = b.chain(
    "spine",
    catmull([
      [0, 0.76, -0.02],
      [0, 0.9, 0.02],
      [0, 1.04, 0.09],
      [0, 1.15, 0.13],
    ]),
    {
      parent: hips,
      count: 3,
      names: ["spine1", "spine2", "chest"],
      role: "spine",
      group: "bird",
    },
  );

  const neck = b.chain(
    "neck",
    polyline([
      [0, 1.13, 0.14],
      [0, 1.27, 0.18],
    ]),
    {
      parent: torso.tip,
      names: ["neck", "neckTip"],
      role: "neck",
      group: "bird",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.31, 0.19],
    dir: [0, 0.05, 1],
    role: "head",
    group: "bird",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.255, 0.34],
    dir: [0, -0.02, 1],
    role: "jaw",
    group: "face",
  });

  // Torso: a faceted blue oval with a yellow chest patch layered forward.
  const body = b.sweep(torso, (t) => 0.22 + 0.045 * t, {
    color: BLUE,
    sides: 8,
    caps: "round",
    name: "blueBody",
    group: "body",
  });

  b.part(new THREE.SphereGeometry(0.17, 8, 6), YELLOW, {
    bone: torso.tip,
    at: [0, 1.02, 0.215],
    scale: [0.8, 1.15, 0.3],
    name: "goldenBreast",
    group: "body",
  });

  b.part(new THREE.SphereGeometry(0.225, 10, 7), YELLOW, {
    bone: head,
    at: [0, 1.31, 0.19],
    scale: [1, 0.96, 0.95],
    name: "yellowHead",
    group: "head",
  });

  // Graphic eyes: white circular discs with black pupils and small gold highlights.
  const eyeDisk = new THREE.CircleGeometry(0.067, 12);
  const pupil = new THREE.CircleGeometry(0.034, 10);
  const glint = new THREE.CircleGeometry(0.009, 8);

  for (const s of [-1, 1]) {
    const eyeAt = [s * 0.092, 1.345, 0.378] as [number, number, number];
    b.part(eyeDisk, WHITE, {
      bone: head,
      at: eyeAt,
      dir: [0, 0, 1],
      axis: "z",
      name: s < 0 ? "eyeR" : "eyeL",
      group: "face",
    });
    b.part(pupil, BLACK, {
      bone: head,
      at: [s * 0.092, 1.345, 0.389],
      dir: [0, 0, 1],
      axis: "z",
      name: s < 0 ? "pupilR" : "pupilL",
      group: "face",
    });
    b.part(glint, WHITE, {
      bone: head,
      at: [s * 0.103, 1.365, 0.397],
      dir: [0, 0, 1],
      axis: "z",
      name: "eyeGlint",
      group: "face",
    });
  }

  // A strong orange wedge beak, split into upper and lower pieces so the jaw is readable.
  b.part(new THREE.ConeGeometry(0.085, 0.22, 4), ORANGE, {
    bone: head,
    at: [0, 1.31, 0.46],
    dir: [0, 0, 1],
    axis: "y",
    rotation: [0, 0, 0],
    name: "upperBeak",
    group: "face",
  });
  b.part(new THREE.ConeGeometry(0.062, 0.13, 4), DARK_RED, {
    bone: jaw,
    at: [0, 1.265, 0.45],
    dir: [0, 0, 1],
    axis: "y",
    name: "lowerBeak",
    group: "face",
  });

  // Crown crest: three upright Bauhaus triangles.
  const crest = [
    [
      [0, 1.46, 0.17],
      [0.10, 1.46, 0.17],
      [0.05, 1.67, 0.17],
    ],
    [
      [-0.1, 1.45, 0.17],
      [0, 1.46, 0.17],
      [-0.045, 1.65, 0.17],
    ],
    [
      [-0.02, 1.46, 0.17],
      [0.08, 1.46, 0.17],
      [0.035, 1.61, 0.17],
    ],
  ];
  for (const points of crest) {
    b.slab(points, {
      color: RED,
      thickness: 0.022,
      bone: head,
      name: "redCrest",
      group: "head",
    });
  }

  // Broad red wings: low-poly extruded silhouettes, mirrored.
  const wingOutline: [number, number, "sharp"?][] = [
    [0, 0],
    [0.16, -0.03],
    [0.29, 0.06],
    [0.37, 0.22],
    [0.32, 0.42],
    [0.20, 0.54],
    [0.08, 0.38],
    [0, 0.12],
  ];

  for (const s of [-1, 1]) {
    const wing = b.extrude(wingOutline, {
      at: [s * 0.16, 1.06, 0.05],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: [0.045, 0.025],
      bevel: 0.012,
      smoothing: 0,
      color: RED,
      bone: torso.joints[1],
      name: s < 0 ? "wingR" : "wingL",
      group: "wing",
    });

    // A yellow geometric stripe on each wing.
    b.extrude(
      [
        [0.015, 0.08],
        [0.075, 0.06],
        [0.23, 0.39],
        [0.17, 0.43],
      ],
      {
        at: wing.local([s * 0.005, 0, 0.028]),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        color: GOLD,
        bone: torso.joints[1],
        name: "wingStripe",
        group: "wing",
      },
    );
  }

  // Three blue tail feathers fan backwards, each a separate bold slab.
  for (const [s, y, z] of [
    [-1, 0.91, -0.18],
    [0, 0.89, -0.24],
    [1, 0.91, -0.18],
  ] as const) {
    b.extrude(
      [
        [0, 0],
        [0.12, 0.02],
        [0.16, 0.13],
        [0.07, 0.34],
        [0, 0.27],
      ],
      {
        at: [s * 0.07, y, z],
        x: [s || 1, 0, 0],
        y: [0, 0.25, -1],
        thickness: 0.028,
        bevel: 0.008,
        color: s === 0 ? LIGHT_BLUE : BLUE,
        bone: hips,
        name: "tailFeather",
        group: "tail",
      },
    );
  }

  // Two yellow legs descend to the branch. The short chains have recognisable rig names.
  for (const s of [-1, 1]) {
    const leg = b.chain(
      s < 0 ? "legR" : "legL",
      polyline([
        [s * 0.105, 0.82, 0.0],
        [s * 0.12, 0.56, 0.035],
        [s * 0.105, 0.245, 0.03],
      ]),
      {
        parent: torso.joints[0],
        names: s < 0 ? ["hipR", "kneeR", "ankleR"] : ["hipL", "kneeL", "ankleL"],
        role: "leg",
        contact: [s * 0.105, 0.13, 0.03],
        group: "feet",
      },
    );
    b.sweep(leg, [0.026, 0.018], {
      color: GOLD,
      sides: 6,
      caps: "round",
      name: "yellowLeg",
      group: "feet",
    });

    // Three toes point along the branch, giving the bird a clear perch.
    const ankle = leg.tip;
    for (const [dx, dz] of [
      [-0.06, 0.035],
      [0, 0.07],
      [0.06, 0.035],
    ] as const) {
      b.rod(
        [s * 0.105, 0.245, 0.03],
        [s * 0.105 + dx, 0.19, 0.03 + dz],
        0.012,
        {
          color: ORANGE,
          bone: ankle,
          caps: "round",
          name: "toe",
          group: "feet",
        },
      );
    }
  }

  // A small back toe on each foot grips behind the branch.
  for (const s of [-1, 1]) {
    b.rod(
      [s * 0.105, 0.245, 0.03],
      [s * 0.105, 0.18, -0.08],
      0.012,
      { color: ORANGE, bone: s < 0 ? undefined : undefined, caps: "round", name: "rearToe", group: "feet" },
    );
  }

  // A few flat red/orange circle accents make the Bauhaus language intentional.
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.018, 10), ORANGE, {
    at: [-0.205, 1.06, 0.19],
    dir: [0, 0, 1],
    name: "wingButtonR",
    group: "body",
  });
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.018, 10), ORANGE, {
    at: [0.205, 1.06, 0.19],
    dir: [0, 0, 1],
    name: "wingButtonL",
    group: "body",
  });

  return b.root;
}
```