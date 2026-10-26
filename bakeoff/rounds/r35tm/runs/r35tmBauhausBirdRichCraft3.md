```ts
import * as THREE from "three";
import { createBuilder, catmull, limb, rng } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Bauhaus Songbird on a Branch",
  description:
    "A stylized low-poly songbird perched on a geometric branch, assembled from bold primary-colour primitives.",
};

export default function build() {
  const b = createBuilder({ name: "bauhaus-songbird", detail: 1 });

  const RED = "#d92828";
  const BLUE = "#1457b8";
  const YELLOW = "#f4c62d";
  const BLACK = "#17191f";
  const WHITE = "#f7f4e8";
  const ORANGE = "#ed7a20";
  const BROWN = "#704229";
  const DARK_BROWN = "#3d261d";
  const PALE_BLUE = "#6fa5dd";
  const GREEN = "#34734b";

  const root = b.joint("hips", { at: [0, 1.12, -0.08], role: "spine" });

  const body = b.chain(
    "spine",
    catmull([
      [0, 1.12, -0.32],
      [0, 1.2, -0.12],
      [0, 1.3, 0.12],
      [0, 1.34, 0.28],
    ]),
    {
      parent: root,
      names: ["spine1", "spine2", "chest"],
      role: "spine",
      count: 4,
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.32, 0.25],
      [0, 1.48, 0.34],
      [0, 1.59, 0.43],
    ]),
    {
      parent: body.tip,
      names: ["neck1", "neck2", "neckTip"],
      role: "neck",
      count: 3,
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.62, 0.45],
    dir: [0, 0.05, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.57, 0.56],
    dir: [0, -0.08, 1],
    role: "jaw",
    group: "head",
  });

  const legChains: ReturnType<typeof b.chain>[] = [];
  const wingChains: ReturnType<typeof b.chain>[] = [];

  for (const s of [1, -1]) {
    const legPoints = [
      [s * 0.12, 1.16, -0.02],
      [s * 0.14, 0.83, 0.045],
      [s * 0.11, 0.47, 0.02],
      [s * 0.11, 0.24, 0.08],
    ] as number[][];

    const leg = b.chain(`leg${s > 0 ? "L" : "R"}`, legPoints, {
      parent: root,
      names: [
        `hip${s > 0 ? "L" : "R"}`,
        `knee${s > 0 ? "L" : "R"}`,
        `ankle${s > 0 ? "L" : "R"}`,
        `foot${s > 0 ? "L" : "R"}`,
      ],
      role: "leg",
      count: 4,
      contact: [s * 0.11, 0.2, 0.08],
    });
    legChains.push(leg);

    const wing = b.chain(
      `wing${s > 0 ? "L" : "R"}`,
      catmull([
        [s * 0.15, 1.37, 0.12],
        [s * 0.32, 1.34, 0.02],
        [s * 0.48, 1.21, -0.15],
      ]),
      {
        parent: body.joints[2],
        names: [
          `shoulder${s > 0 ? "L" : "R"}`,
          `elbow${s > 0 ? "L" : "R"}`,
          `wingTip${s > 0 ? "L" : "R"}`,
        ],
        role: "wing",
        count: 3,
      },
    );
    wingChains.push(wing);
  }

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.18, -0.3],
      [0, 1.13, -0.52],
      [0, 1.16, -0.78],
      [0, 1.25, -1.02],
    ]),
    {
      parent: root,
      names: ["tail1", "tail2", "tail3", "tailTip"],
      role: "tail",
      count: 4,
    },
  );

  const toeChains: ReturnType<typeof b.chain>[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ankle = [s * 0.11, 0.47, 0.02] as number[];

    const toeTargets = [
      [s * 0.27, 0.2, 0.18],
      [s * 0.23, 0.2, 0.02],
      [s * 0.2, 0.2, -0.12],
    ];

    toeTargets.forEach((target, i) => {
      const points = limb(
        ankle,
        target,
        [0.16, 0.18],
        [[s * 0.1, 0, 1]],
        { sole: [0, 0, 1] },
      );
      const toe = b.chain(`toe${side}${i + 1}`, points, {
        parent: legChains[s > 0 ? 0 : 1].joints[2],
        names: [`toe${side}${i + 1}`, `toeTip${side}${i + 1}`],
        role: "digit",
        count: 2,
      });
      toeChains.push(toe);
    });
  }

  // Branch and its small upward twig.
  const branchPath = catmull([
    [-0.95, 0.14, -0.42],
    [-0.52, 0.16, -0.18],
    [0, 0.17, 0.02],
    [0.55, 0.15, 0.17],
    [1.05, 0.16, 0.34],
  ]);
  const branch = b.sweep(branchPath, 0.085, {
    color: BROWN,
    section: { ngon: 6 },
    caps: "round",
    sides: 6,
    name: "branch",
    group: "scenery",
  });

  const twigPath = catmull([
    [0.58, 0.17, 0.18],
    [0.7, 0.28, 0.27],
    [0.76, 0.42, 0.31],
  ]);
  b.sweep(twigPath, [0.05, 0.025], {
    color: DARK_BROWN,
    section: { ngon: 6 },
    caps: "round",
    name: "twig",
    group: "scenery",
  });

  const smallTwigPath = catmull([
    [-0.52, 0.16, -0.18],
    [-0.62, 0.27, -0.27],
    [-0.66, 0.38, -0.3],
  ]);
  b.sweep(smallTwigPath, [0.038, 0.018], {
    color: DARK_BROWN,
    section: { ngon: 6 },
    caps: "round",
    name: "smallTwig",
    group: "scenery",
  });

  // Body: a faceted blue oval with a yellow geometric breast.
  b.sweep(body, (t) => 0.19 + 0.045 * Math.sin(Math.PI * t), {
    color: BLUE,
    section: { ngon: 8 },
    caps: "round",
    name: "blueBody",
    group: "body",
  });

  b.part(
    new THREE.SphereGeometry(1, 12, 8),
    YELLOW,
    {
      bone: body.joints[2],
      at: [0, 1.31, 0.285],
      scale: [0.145, 0.18, 0.07],
      name: "goldenBreast",
      group: "body",
      flat: true,
    },
  );

  b.part(
    new THREE.BoxGeometry(0.22, 0.055, 0.22),
    RED,
    {
      bone: body.joints[1],
      at: [0, 1.28, -0.08],
      rotation: [0, 0, 0],
      name: "redSaddle",
      group: "body",
      flat: true,
    },
  );

  // Neck and head, settled before facial details.
  b.sweep(neck, [0.14, 0.16], {
    color: RED,
    section: { ngon: 8 },
    caps: "round",
    name: "redNeck",
    group: "head",
  });

  b.part(
    new THREE.SphereGeometry(1, 12, 8),
    RED,
    {
      bone: head,
      at: [0, 1.63, 0.46],
      scale: [0.205, 0.205, 0.2],
      name: "head",
      group: "head",
      flat: true,
    },
  );

  // Cream cheek discs create a graphic Bauhaus mask.
  for (const s of [1, -1]) {
    b.part(
      new THREE.SphereGeometry(1, 10, 6),
      YELLOW,
      {
        bone: head,
        at: [s * 0.115, 1.575, 0.61],
        scale: [0.095, 0.085, 0.035],
        name: `cheek${s > 0 ? "L" : "R"}`,
        group: "face",
        flat: true,
      },
    );
  }

  // Large white eyes, black pupils, and tiny white glints.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(
      new THREE.SphereGeometry(1, 10, 8),
      WHITE,
      {
        bone: head,
        at: [s * 0.102, 1.69, 0.625],
        scale: [0.067, 0.083, 0.045],
        name: `eyeWhite${side}`,
        group: "face",
        flat: true,
      },
    );

    b.part(
      new THREE.SphereGeometry(1, 8, 6),
      BLACK,
      {
        bone: head,
        at: [s * 0.102, 1.69, 0.667],
        scale: [0.031, 0.047, 0.018],
        name: `pupil${side}`,
        group: "face",
        flat: true,
      },
    );

    b.part(
      new THREE.SphereGeometry(1, 6, 4),
      WHITE,
      {
        bone: head,
        at: [s * 0.091, 1.715, 0.685],
        scale: [0.012, 0.016, 0.008],
        name: `eyeGlint${side}`,
        group: "face",
        flat: true,
      },
    );

    b.part(
      new THREE.BoxGeometry(0.105, 0.018, 0.025),
      BLACK,
      {
        bone: head,
        at: [s * 0.105, 1.775, 0.642],
        rotation: [0, 0, s * -0.18],
        name: `brow${side}`,
        group: "face",
        flat: true,
      },
    );
  }

  // Two-piece orange beak, upper and lower jaw.
  b.spike(
    [0, 1.625, 0.645],
    [0, 0.015, 1],
    0.19,
    0.075,
    {
      color: ORANGE,
      bone: head,
      caps: "point",
      name: "upperBeak",
      group: "face",
    },
  );

  b.spike(
    [0, 1.585, 0.635],
    [0, -0.035, 1],
    0.145,
    0.06,
    {
      color: YELLOW,
      bone: jaw,
      caps: "point",
      name: "lowerBeak",
      group: "face",
    },
  );

  // Angular crown feathers.
  for (const s of [1, -1]) {
    b.spike(
      [s * 0.08, 1.79, 0.42],
      [s * 0.05, 0.1, -0.02],
      0.13,
      0.045,
      {
        color: YELLOW,
        bone: head,
        caps: "point",
        name: `crownFeather${s > 0 ? "L" : "R"}`,
        group: "head",
      },
    );
  }
  b.spike([0, 1.79, 0.39], [0, 0.12, -0.04], 0.15, 0.05, {
    color: RED,
    bone: head,
    caps: "point",
    name: "crownCenter",
    group: "head",
  });

  // Legs and feet.
  for (let i = 0; i < legChains.length; i++) {
    const s = i === 0 ? 1 : -1;
    b.sweep(legChains[i], [0.045, 0.032], {
      color: ORANGE,
      section: { ngon: 6 },
      caps: "round",
      name: `leg${s > 0 ? "L" : "R"}Tube`,
      group: "legs",
    });
  }

  for (let i = 0; i < toeChains.length; i++) {
    b.sweep(toeChains[i], [0.022, 0.007], {
      color: ORANGE,
      section: { ngon: 6 },
      caps: "round",
      name: `toe${i + 1}`,
      group: "legs",
    });
  }

  // Wings: bold blue slabs with red trailing blocks and yellow feather bars.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    b.sweep(wingChains[s > 0 ? 0 : 1], [0.075, 0.035], {
      color: BLUE,
      section: { ngon: 6 },
      caps: "round",
      name: `wingArm${side}`,
      group: "wings",
    });

    b.extrude(
      [
        [0, 0, "sharp"],
        [0.17, -0.02, "sharp"],
        [0.27, -0.22, "sharp"],
        [0.21, -0.45, "sharp"],
        [0.06, -0.35, "sharp"],
        [-0.035, -0.1, "sharp"],
      ],
      {
        at: [s * 0.27, 1.34, -0.01],
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: 0.055,
        bevel: 0.008,
        color: BLUE,
        bone: wingChains[s > 0 ? 0 : 1].joints[1],
        name: `wingPanel${side}`,
        group: "wings",
      },
    );

    b.extrude(
      [
        [0, 0, "sharp"],
        [0.18, -0.02, "sharp"],
        [0.25, -0.11, "sharp"],
        [0.1, -0.2, "sharp"],
        [-0.02, -0.08, "sharp"],
      ],
      {
        at: [s * 0.29, 1.27, -0.13],
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: 0.062,
        bevel: 0.006,
        color: RED,
        bone: wingChains[s > 0 ? 0 : 1].joints[1],
        name: `wingRedTip${side}`,
        group: "wings",
      },
    );

    for (let j = 0; j < 3; j++) {
      b.rod(
        [s * (0.34 + j * 0.025), 1.28 - j * 0.05, -0.12 - j * 0.08],
        [s * (0.48 + j * 0.02), 1.17 - j * 0.04, -0.32 - j * 0.07],
        0.014,
        {
          color: YELLOW,
          bone: wingChains[s > 0 ? 0 : 1].joints[2],
          name: `wingBar${side}${j}`,
          group: "wings",
        },
      );
    }
  }

  // Tail: three primary-colour geometric feathers.
  for (const [s, color, spread] of [
    [0, RED, 0],
    [1, YELLOW, 0.12],
    [-1, BLUE, -0.12],
  ] as const) {
    b.extrude(
      [
        [-0.08, 0, "sharp"],
        [0.08, 0, "sharp"],
        [0.16, -0.58, "sharp"],
        [0, -0.77, "sharp"],
        [-0.16, -0.58, "sharp"],
      ],
      {
        at: [s * 0.075, 1.17, -0.43 + spread],
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: 0.035,
        bevel: 0.004,
        color,
        bone: tail.joints[1],
        name: `tailFeather${s === 0 ? "C" : s > 0 ? "L" : "R"}`,
        group: "tail",
      },
    );
  }

  // A few graphic branch bands and buds.
  b.sweep(
    catmull([
      [-0.45, 0.17, -0.19],
      [-0.36, 0.18, -0.12],
      [-0.27, 0.18, -0.07],
    ]),
    0.092,
    {
      color: GREEN,
      section: { ngon: 6 },
      caps: "flat",
      name: "branchBand",
      group: "scenery",
    },
  );

  for (const p of [
    [-0.79, 0.17, -0.35],
    [0.87, 0.17, 0.28],
    [0.72, 0.43, 0.31],
  ] as number[][]) {
    b.part(new THREE.SphereGeometry(0.045, 7, 5), GREEN, {
      at: p,
      name: "leafBud",
      group: "scenery",
      flat: true,
    });
  }

  // Small graphic ring behind the neck, reinforcing the Bauhaus palette.
  const collar = b.part(
    new THREE.CylinderGeometry(0.155, 0.155, 0.045, 10),
    YELLOW,
    {
      bone: neck.joints[1],
      at: [0, 1.49, 0.35],
      dir: [0, 0, 1],
      name: "neckCollar",
      group: "head",
      flat: true,
    },
  );

  // A tiny musical-note emblem on the breast.
  const noteTexture = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="45" r="8" fill="#17191f"/>
      <path d="M31 43V14h6v29M34 14h17v6H34z" fill="#17191f"/>
    </svg>`,
    { size: 128 },
  );

  const emblem = b.part(
    new THREE.PlaneGeometry(0.075, 0.075),
    WHITE,
    {
      bone: body.joints[2],
      at: [0, 1.35, 0.355],
      dir: [0, 0, 1],
      axis: "z",
      texture: noteTexture,
      name: "songEmblem",
      group: "body",
    },
  );
  glow(emblem, 0.12);

  return b.root;
}
```