import * as THREE from "three";
import { createBuilder, catmull, frame, rng, svg } from "../../../../src/index";

export const meta = {
  name: "Bauhaus Songbird on a Branch",
  description: "A stylized primary-colour songbird perched on a geometric branch, built from faceted primitives.",
};

export default function build() {
  const b = createBuilder({ name: "bauhausSongbird", detail: 1 });

  const BLUE = "#2455d6";
  const RED = "#e4372e";
  const YELLOW = "#f3c623";
  const BLACK = "#171923";
  const WHITE = "#fff8e7";
  const GREEN = "#2d8b57";
  const WOOD = "#8b4a2b";
  const WOOD_DARK = "#5e3020";

  // ---------------------------------------------------------------------------
  // Skeleton first: one compact spine, neck/head, jaw, wings, tail and legs.
  // ---------------------------------------------------------------------------

  const root = b.joint("hips", {
    at: [0, 0.86, 0],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.86, -0.2],
      [0, 0.97, 0.02],
      [0, 1.05, 0.24],
    ]),
    {
      parent: root,
      names: ["spineA", "spineB", "chest"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.05, 0.24],
      [0, 1.16, 0.37],
      [0, 1.27, 0.48],
    ]),
    {
      parent: spine.tip,
      names: ["neck", "neckTip"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.28, 0.49],
    dir: [0, 0.05, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.21, 0.59],
    dir: [0, -0.12, 1],
    role: "jaw",
    group: "head",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.93, -0.22],
      [0, 0.94, -0.43],
      [0, 0.91, -0.68],
      [0, 0.9, -0.91],
    ]),
    {
      parent: root,
      names: ["tail1", "tail2", "tail3"],
      role: "tail",
    },
  );

  const legL = b.chain(
    "legL",
    [
      [0.115, 0.84, -0.02],
      [0.13, 0.68, 0.03],
      [0.14, 0.58, 0.08],
    ],
    {
      parent: root,
      names: ["hipL", "kneeL", "ankleL"],
      role: "leg",
      contact: [0.14, 0.51, 0.08],
    },
  );

  const legR = b.chain(
    "legR",
    [
      [-0.115, 0.84, -0.02],
      [-0.13, 0.68, 0.03],
      [-0.14, 0.58, 0.08],
    ],
    {
      parent: root,
      names: ["hipR", "kneeR", "ankleR"],
      role: "leg",
      contact: [-0.14, 0.51, 0.08],
    },
  );

  const wingL = b.chain(
    "wingL",
    [
      [0.19, 1.08, 0.15],
      [0.32, 1.0, 0.05],
      [0.43, 0.87, -0.1],
    ],
    {
      parent: spine.tip,
      names: ["shoulderL", "wingL", "wingTipL"],
      role: "wing",
      group: "wings",
    },
  );

  const wingR = b.chain(
    "wingR",
    [
      [-0.19, 1.08, 0.15],
      [-0.32, 1.0, 0.05],
      [-0.43, 0.87, -0.1],
    ],
    {
      parent: spine.tip,
      names: ["shoulderR", "wingR", "wingTipR"],
      role: "wing",
      group: "wings",
    },
  );

  // ---------------------------------------------------------------------------
  // The branch: intentionally simple, bold and geometric.
  // ---------------------------------------------------------------------------

  b.sweep(
    catmull([
      [-0.74, 0.52, -0.55],
      [-0.35, 0.49, -0.28],
      [0.05, 0.5, 0.0],
      [0.42, 0.53, 0.28],
      [0.82, 0.57, 0.53],
    ]),
    0.085,
    {
      color: WOOD,
      section: { ngon: 6 },
      sides: 6,
      caps: "round",
      name: "mainBranch",
      group: "scenery",
    },
  );

  b.rod([-0.42, 0.5, -0.28], [-0.66, 0.73, -0.5], 0.045, {
    color: WOOD_DARK,
    section: { ngon: 5 },
    name: "branchForkL",
    group: "scenery",
  });
  b.rod([0.4, 0.53, 0.27], [0.68, 0.78, 0.5], 0.042, {
    color: WOOD_DARK,
    section: { ngon: 5 },
    name: "branchForkR",
    group: "scenery",
  });

  // Small Bauhaus leaf/disc accents, kept subordinate to the bird.
  for (const [x, z, s] of [
    [-0.54, -0.48, 1],
    [0.58, 0.43, -1],
    [-0.18, -0.18, -1],
  ] as const) {
    b.part(new THREE.SphereGeometry(0.075, 6, 4), GREEN, {
      at: [x, 0.69, z],
      scale: [1.35, 0.25, 0.7],
      rotation: [0, s * 0.7, s * 0.25],
      group: "scenery",
      name: "branchLeaf",
    });
  }

  // ---------------------------------------------------------------------------
  // Body and head: chunky, faceted primary-colour geometry.
  // ---------------------------------------------------------------------------

  b.sweep(spine, (t) => 0.235 - 0.035 * t, {
    color: BLUE,
    section: { ngon: 8 },
    sides: 8,
    caps: "round",
    name: "blueBody",
    group: "body",
  });

  b.sweep(neck, [0.16, 0.13], {
    color: BLUE,
    section: { ngon: 8 },
    sides: 8,
    caps: "round",
    name: "blueNeck",
    group: "body",
  });

  b.part(new THREE.SphereGeometry(0.185, 8, 6), BLUE, {
    bone: head,
    at: [0, 1.31, 0.5],
    scale: [1, 1.03, 1.05],
    flat: true,
    name: "head",
    group: "head",
  });

  // Yellow cheek disks and red crown disk make the silhouette unmistakably graphic.
  for (const side of [-1, 1]) {
    b.part(new THREE.CylinderGeometry(0.105, 0.105, 0.035, 8), YELLOW, {
      bone: head,
      at: [side * 0.145, 1.275, 0.565],
      dir: [0, 0, 1],
      axis: "y",
      rotation: [90, 0, 0],
      name: "cheek",
      group: "face",
    });
  }

  b.part(new THREE.SphereGeometry(0.12, 8, 4), RED, {
    bone: head,
    at: [0, 1.43, 0.48],
    scale: [0.72, 0.5, 0.72],
    flat: true,
    name: "redCrown",
    group: "head",
  });

  // Separate openable lower jaw and a bright cubic beak.
  b.part(new THREE.BoxGeometry(0.18, 0.055, 0.17), YELLOW, {
    bone: jaw,
    at: [0, 1.205, 0.67],
    dir: [0, 0, 1],
    axis: "z",
    flat: true,
    name: "lowerJaw",
    group: "jaw",
  });

  b.part(new THREE.ConeGeometry(0.095, 0.25, 4), RED, {
    bone: head,
    at: [0, 1.305, 0.7],
    dir: [0, 0, 1],
    axis: "z",
    rotation: [0, 0, 45],
    flat: true,
    name: "beak",
    group: "face",
  });

  // ---------------------------------------------------------------------------
  // Eyes: white graphic discs with black pupils and tiny yellow highlights.
  // ---------------------------------------------------------------------------

  const eyeTexture = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="29" fill="#fff8e7" stroke="#171923" stroke-width="5"/>
      <circle cx="32" cy="34" r="16" fill="#171923"/>
      <circle cx="38" cy="27" r="5" fill="#f3c623"/>
      <circle cx="26" cy="25" r="4" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );

  for (const side of [-1, 1]) {
    const eyeAt = [side * 0.105, 1.35, 0.64] as [number, number, number];
    b.part(new THREE.CircleGeometry(0.075, 12), WHITE, {
      bone: head,
      at: eyeAt,
      dir: [0, 0.05, 1],
      axis: "z",
      texture: eyeTexture,
      name: side > 0 ? "eyeL" : "eyeR",
      group: "face",
    });
  }

  // Graphic brow bars.
  for (const side of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.13, 0.025, 0.025), BLACK, {
      bone: head,
      at: [side * 0.105, 1.415, 0.64],
      rotation: [0, side * 12, side * -8],
      flat: true,
      name: "brow",
      group: "face",
    });
  }

  // ---------------------------------------------------------------------------
  // Wings: solid yellow shoulder blocks plus blue/red triangular feathers.
  // ---------------------------------------------------------------------------

  b.sweep(wingL, [0.13, 0.065], {
    color: YELLOW,
    section: { ngon: 5 },
    caps: "round",
    name: "yellowWingL",
    group: "wings",
  });
  b.sweep(wingR, [0.13, 0.065], {
    color: YELLOW,
    section: { ngon: 5 },
    caps: "round",
    name: "yellowWingR",
    group: "wings",
  });

  const wingOutline = [
    [0, 0, "sharp"] as [number, number, "sharp"],
    [0.25, 0, "sharp"] as [number, number, "sharp"],
    [0.16, 0.22, "sharp"] as [number, number, "sharp"],
    [0.06, 0.39, "sharp"] as [number, number, "sharp"],
    [-0.02, 0.22, "sharp"] as [number, number, "sharp"],
  ];

  b.extrude(wingOutline, {
    at: [0.31, 0.94, 0.03],
    x: [1, 0, 0],
    y: [0, 0.35, 0.94],
    thickness: 0.035,
    color: RED,
    bone: wingL,
    name: "redWingPanelL",
    group: "wings",
  });

  b.extrude(wingOutline, {
    at: [-0.31, 0.94, 0.03],
    x: [-1, 0, 0],
    y: [0, 0.35, 0.94],
    thickness: 0.035,
    color: RED,
    bone: wingR,
    name: "redWingPanelR",
    group: "wings",
  });

  // Three rigid feather bars on each wing.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const x = side * (0.36 + i * 0.035);
      const z = -0.04 - i * 0.035;
      b.part(new THREE.BoxGeometry(0.035, 0.22, 0.07), BLUE, {
        at: [x, 0.82 - i * 0.025, z],
        rotation: [0.15, side * 0.15, side * 0.28],
        flat: true,
        name: "wingFeather",
        group: "wings",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Tail fan: red, yellow and blue slabs radiating from the tail chain.
  // ---------------------------------------------------------------------------

  for (const [side, color, lean] of [
    [-1, RED, -0.2],
    [0, YELLOW, 0],
    [1, BLUE, 0.2],
  ] as const) {
    b.extrude(
      [
        [0, 0, "sharp"],
        [0.13, 0, "sharp"],
        [0.1, 0.46, "sharp"],
        [0.025, 0.62, "sharp"],
        [-0.035, 0.36, "sharp"],
      ],
      {
        at: [side * 0.075, 0.9, -0.43],
        x: [1, 0, 0],
        y: [lean, 0.55, -0.8],
        thickness: 0.025,
        color,
        bone: tail,
        name: "tailFeather",
        group: "tail",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Legs and graphic toes.
  // ---------------------------------------------------------------------------

  b.sweep(legL, [0.045, 0.032], {
    color: RED,
    section: { ngon: 5 },
    caps: "round",
    name: "legL",
    group: "legs",
  });
  b.sweep(legR, [0.045, 0.032], {
    color: RED,
    section: { ngon: 5 },
    caps: "round",
    name: "legR",
    group: "legs",
  });

  for (const side of [-1, 1]) {
    const ankle = [side * 0.14, 0.58, 0.08] as [number, number, number];
    for (let i = -1; i <= 1; i++) {
      b.rod(
        ankle,
        [side * (0.14 + i * 0.045), 0.555, 0.14 + Math.abs(i) * 0.025],
        0.018,
        {
          color: YELLOW,
          section: { ngon: 5 },
          name: "toe",
          group: "legs",
        },
      );
    }
  }

  // A tiny blue throat medallion gives the bird a strong Bauhaus focal mark.
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.025, 12), BLUE, {
    bone: head,
    at: [0, 1.22, 0.61],
    dir: [0, 0, 1],
    axis: "y",
    rotation: [90, 0, 0],
    name: "throatMedallion",
    group: "face",
  });

  // Slightly open jaw for a readable singing pose.
  b.pose(jaw, { axis: [1, 0, 0], deg: -12 });

  return b.root;
}
