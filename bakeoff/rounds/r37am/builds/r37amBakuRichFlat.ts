import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
} from "../../../../src/index";

export const meta = {
  name: "baku",
  description:
    "A stout dream-eating baku tapir spirit in an ukiyo-e woodblock style, with an indigo mane, curling trunk, patterned hide, talisman, and curling dream wisps.",
};

export default function build() {
  const b = createBuilder({ name: "baku", detail: 1 });

  const INK = "#211c2b";
  const NIGHT = "#263b65";
  const INDIGO = "#304d83";
  const BLUE = "#5378a7";
  const PALE = "#ead8b0";
  const BELLY = "#f1e7c5";
  const OCHRE = "#bd8650";
  const RUST = "#a94d3f";
  const VERMILION = "#c54e42";
  const GOLD = "#d9a94e";
  const TURQUOISE = "#5a9a91";
  const DREAM = "#9a78b5";
  const WHITE = "#fff5d1";

  const R = (geometry: THREE.BufferGeometry, color: string, at: any, bone?: any, scale?: any) =>
    b.part(geometry, color, {
      at,
      bone,
      scale,
      flat: true,
    });

  const bead = (at: any, color: string, radius: number, bone?: any) =>
    R(new THREE.SphereGeometry(radius, 8, 5), color, at, bone);

  const disk = (
    at: any,
    color: string,
    radius: number,
    depth: number,
    bone?: any,
    dir: [number, number, number] = [0, 0, 1],
  ) =>
    b.part(
      new THREE.CylinderGeometry(radius, radius, depth, 10),
      color,
      { at, bone, dir, flat: true },
    );

  const mark = (
    at: any,
    color: string,
    width: number,
    height: number,
    bone?: any,
    dir: [number, number, number] = [0, 0, 1],
  ) =>
    b.part(new THREE.BoxGeometry(width, height, 0.012), color, {
      at,
      bone,
      dir,
      flat: true,
    });

  // ---------------------------------------------------------------------------
  // Skeleton first: hips, spine, head, jaw, legs, tail, and trunk.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.88, -0.45],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 0.88, -0.65],
    [0, 0.98, -0.28],
    [0, 1.03, 0.12],
    [0, 1.08, 0.43],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "chest"],
    role: "spine",
  });

  const neckPath = catmull([
    [0, 1.08, 0.38],
    [0, 1.2, 0.55],
    [0, 1.35, 0.67],
  ]);

  const neck = b.chain("neck", neckPath, {
    parent: spine.tip,
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
  });

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.38, 0.72],
    dir: [0, 0.04, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.27, 0.86],
    dir: [0, -0.18, 1],
    role: "jaw",
    group: "head",
  });

  const trunkPath = catmull([
    [0, 1.39, 0.87],
    [0, 1.36, 1.08],
    [0, 1.27, 1.28],
    [0, 1.12, 1.39],
    [0, 1.02, 1.34],
  ]);

  const trunk = b.chain("trunk", trunkPath, {
    parent: head,
    names: ["trunk1", "trunk2", "trunk3", "trunk4", "trunkTip"],
    role: "tentacle",
  });

  const tailPath = catmull([
    [0, 0.96, -0.7],
    [0, 1.0, -0.92],
    [0.03, 1.06, -1.12],
    [0.12, 1.18, -1.25],
  ]);

  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tailTip"],
    role: "tail",
  });

  const legTargets = [
    { s: 1, z: -0.5, name: "hindL", x: 0.26 },
    { s: -1, z: -0.5, name: "hindR", x: -0.26 },
    { s: 1, z: 0.35, name: "frontL", x: 0.24 },
    { s: -1, z: 0.35, name: "frontR", x: -0.24 },
  ];

  const legs: Array<{ side: number; chain: any; name: string }> = [];

  for (const leg of legTargets) {
    const root = [leg.x, 0.92, leg.z] as [number, number, number];
    const foot = [leg.x * 1.08, 0.16, leg.z + 0.08] as [number, number, number];
    const points = limb(
      root,
      foot,
      leg.name.startsWith("hind") ? [0.31, 0.3, 0.2] : [0.28, 0.28, 0.2],
      [
        [0, 0, leg.name.startsWith("hind") ? -1 : 1],
        [0, 0, leg.name.startsWith("hind") ? 1 : -1],
      ],
      { sole: [0, 0, 1] },
    );

    const chain = b.chain(leg.name, points, {
      parent: hips,
      names: [
        `${leg.name}Hip`,
        `${leg.name}Knee`,
        `${leg.name}Ankle`,
        `${leg.name}Hoof`,
      ],
      role: "leg",
      contact: foot,
    });

    legs.push({
      side: leg.s,
      chain,
      name: leg.name,
    });
  }

  // ---------------------------------------------------------------------------
  // Main body: broad, low-poly, cream belly and indigo back.
  // ---------------------------------------------------------------------------

  const body = b.sweep(spine, (t: number) => {
    if (t < 0.22) return 0.27;
    if (t < 0.7) return 0.34;
    return 0.31;
  }, {
    color: INDIGO,
    section: { ngon: 8 },
    sides: 8,
    sectors: [
      [-62, 62, NIGHT],
      [112, 248, BELLY],
    ],
    caps: "round",
    group: "body",
    name: "bakuBody",
  });

  const neckTube = b.sweep(neck, [0.25, 0.2], {
    color: INDIGO,
    section: { ngon: 8 },
    caps: "round",
    group: "body",
    name: "bakuNeck",
  });

  const bellyPatch = b.sweep(
    catmull([
      [0, 0.81, -0.48],
      [0, 0.76, -0.12],
      [0, 0.78, 0.25],
      [0, 0.86, 0.52],
    ]),
    [0.2, 0.22],
    {
      color: BELLY,
      bone: spine.joints[0],
      section: { ngon: 6 },
      caps: "round",
      group: "belly",
      name: "creamBelly",
    },
  );

  for (const leg of legs) {
    const darkLeg = b.sweep(leg.chain, (t: number) => 0.105 - t * 0.025, {
      color: NIGHT,
      section: { ngon: 7 },
      caps: "round",
      group: "legs",
      name: `${leg.name}Dark`,
    });

    b.sweep(
      catmull([
        leg.chain.at(0.38).at,
        leg.chain.at(0.62).at,
        leg.chain.at(0.82).at,
      ]),
      [0.095, 0.06],
      {
        color: OCHRE,
        bone: leg.chain.joints[1],
        section: { ngon: 7 },
        caps: "round",
        group: "legs",
        name: `${leg.name}Ochre`,
      },
    );

    const hoof = leg.chain.at(1).at;
    R(new THREE.BoxGeometry(0.18, 0.1, 0.23), INK, hoof, leg.chain.tip);
    R(
      new THREE.BoxGeometry(0.14, 0.07, 0.18),
      PALE,
      [hoof[0], hoof[1] + 0.025, hoof[2] + 0.015],
      leg.chain.tip,
    );
  }

  b.sweep(tail, (t: number) => 0.12 - t * 0.09, {
    color: NIGHT,
    section: { ngon: 7 },
    caps: { start: "round", end: "point" },
    group: "tail",
    name: "taperedTail",
  });

  // Tail tassel.
  for (let i = 0; i < 5; i++) {
    const p = [0.12 + (i - 2) * 0.018, 1.16 + Math.abs(i - 2) * 0.006, -1.26] as [
      number,
      number,
      number,
    ];
    b.spike(p, [0.05 * (i - 2), 0.08, -0.18], 0.19, 0.025, {
      color: RUST,
      bone: tail.tip,
      group: "tail",
      name: `tailTassel${i}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Head, muzzle, ears, eyes, and expressive face.
  // ---------------------------------------------------------------------------

  const skull = R(
    new THREE.SphereGeometry(1, 14, 10),
    INDIGO,
    head.at,
    head,
    [0.39, 0.38, 0.36],
  );

  const cheekL = R(
    new THREE.SphereGeometry(1, 10, 8),
    PALE,
    head.local([0.18, -0.03, 0.16]),
    head,
    [0.18, 0.21, 0.19],
  );
  const cheekR = R(
    new THREE.SphereGeometry(1, 10, 8),
    PALE,
    head.local([-0.18, -0.03, 0.16]),
    head,
    [0.18, 0.21, 0.19],
  );

  const lowerJaw = b.sweep(
    catmull([
      [0, 1.27, 0.8],
      [0, 1.22, 1.02],
      [0, 1.15, 1.2],
    ]),
    [0.18, 0.1],
    {
      bone: jaw,
      color: PALE,
      section: { ngon: 7 },
      caps: "round",
      group: "jaw",
      name: "lowerJaw",
    },
  );

  // Mouth line and red inner mouth, separated from the lower jaw.
  b.rod([0, 1.21, 1.18], [0, 1.17, 1.38], 0.018, {
    color: INK,
    bone: jaw,
    group: "face",
    name: "mouthLine",
  });
  b.rod([0, 1.17, 1.35], [0, 1.14, 1.42], 0.035, {
    color: RUST,
    bone: jaw,
    group: "face",
    name: "mouthInterior",
  });

  // Broad tapir ears, built as block-print silhouettes.
  const earOutline: [number, number, "sharp"][] = [
    [-0.12, -0.08, "sharp"],
    [-0.2, 0.18, "sharp"],
    [-0.16, 0.42, "sharp"],
    [0.02, 0.5, "sharp"],
    [0.13, 0.2, "sharp"],
    [0.1, -0.08, "sharp"],
  ];

  for (const s of [1, -1]) {
    const ear = b.extrude(earOutline, {
      at: head.local([s * 0.28, 0.08, -0.03]),
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.065,
      bevel: 0.01,
      color: INK,
      bone: head,
      group: "ears",
      name: `earOutline${s}`,
    });

    b.extrude(
      [
        [-0.08, -0.03],
        [-0.14, 0.17],
        [-0.1, 0.34],
        [0.01, 0.39],
        [0.08, 0.15],
        [0.06, -0.03],
      ],
      {
        at: head.local([s * 0.28, 0.08, -0.066]),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        color: RUST,
        bone: head,
        group: "ears",
        name: `earInner${s}`,
      },
    );

    b.rod(
      head.local([s * 0.27, 0.03, -0.04]),
      head.local([s * 0.27, 0.37, -0.03]),
      0.012,
      {
        color: PALE,
        bone: head,
        group: "ears",
        name: `earHighlight${s}`,
      },
    );
  }

  // Eyes: dark carved sockets, cream whites, indigo pupils, gold glints.
  for (const s of [1, -1]) {
    const eyeAt = head.local([s * 0.16, 0.08, 0.31]);
    bead(eyeAt, INK, 0.092, head);
    bead(head.local([s * 0.16, 0.08, 0.333]), PALE, 0.067, head);
    bead(head.local([s * 0.16, 0.075, 0.382]), NIGHT, 0.042, head);
    bead(head.local([s * 0.14, 0.105, 0.409]), WHITE, 0.014, head);

    b.rod(
      head.local([s * 0.22, 0.17, 0.33]),
      head.local([s * 0.1, 0.21, 0.37]),
      0.018,
      {
        color: INK,
        bone: head,
        group: "face",
        name: `brow${s}`,
      },
    );

    // Small vermilion cheek mark, a characteristic printed accent.
    disk(
      head.local([s * 0.25, -0.035, 0.3]),
      VERMILION,
      0.035,
      0.012,
      head,
      [0, 0, 1],
    );
  }

  // Nose pad and nostrils.
  R(
    new THREE.SphereGeometry(1, 10, 6),
    INK,
    trunk.tip.at,
    trunk.tip,
    [0.13, 0.09, 0.1],
  );
  for (const s of [1, -1]) {
    bead(
      [trunk.tip.at[0] + s * 0.045, trunk.tip.at[1] + 0.035, trunk.tip.at[2] + 0.065],
      RUST,
      0.018,
      trunk.tip,
    );
  }

  // Little gold tusk-like dream hooks at the mouth corners.
  for (const s of [1, -1]) {
    b.spike(
      [s * 0.12, 1.18, 1.2],
      [s * 0.03, -0.16, 0.08],
      0.11,
      0.026,
      {
        color: GOLD,
        bone: jaw,
        group: "jaw",
        name: `dreamHook${s}`,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Indigo mane: a bold row of broad, carved spikes from crown to rump.
  // ---------------------------------------------------------------------------

  const manePoints: [number, number, number][] = [
    [0, 1.65, 0.47],
    [0, 1.63, 0.25],
    [0, 1.61, 0.02],
    [0, 1.57, -0.22],
    [0, 1.5, -0.45],
    [0, 1.42, -0.66],
  ];

  for (let i = 0; i < manePoints.length; i++) {
    const p = manePoints[i];
    const h = 0.16 + (i === 1 ? 0.08 : 0);
    b.spike(
      [p[0], p[1] - 0.03, p[2]],
      [0, 1, -0.22],
      h,
      0.075 - i * 0.006,
      {
        color: INK,
        bone: spine.nearestJoint(p),
        group: "mane",
        name: `maneOutline${i}`,
      },
    );
    b.spike(
      [p[0], p[1] - 0.025, p[2] + 0.012],
      [0, 1, -0.18],
      h * 0.82,
      0.055 - i * 0.005,
      {
        color: INDIGO,
        bone: spine.nearestJoint(p),
        group: "mane",
        name: `maneBlue${i}`,
      },
    );
  }

  // Neck ruff, a row of alternating cream and rust triangles.
  for (let i = 0; i < 7; i++) {
    const z = 0.4 - i * 0.075;
    const y = 1.42 + Math.sin(i * 0.55) * 0.025;
    const s = i % 2 === 0 ? 1 : -1;
    b.spike([s * 0.16, y, z], [s * 0.08, 0.16, -0.02], 0.13, 0.04, {
      color: i % 3 === 0 ? RUST : PALE,
      bone: neck.nearestJoint([s * 0.16, y, z]),
      group: "ruff",
      name: `ruff${i}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Ukiyo-e patterning: bands, seal, rosettes, and carved-looking marks.
  // ---------------------------------------------------------------------------

  // Shoulder and rump bands are thin rods seated on the body silhouette.
  for (const z of [-0.46, -0.31, 0.18, 0.32]) {
    b.sweep(
      catmull([
        [-0.23, 1.03, z],
        [0, 1.23, z],
        [0.23, 1.03, z],
      ]),
      0.014,
      {
        color: RUST,
        bone: spine.nearestJoint([0, 1.03, z]),
        caps: "flat",
        group: "bodyMarks",
        name: `bodyBand${z}`,
      },
    );
  }

  // A large gold dream seal on the left flank.
  const sealCenter = [0.315, 1.02, -0.05] as [number, number, number];
  disk(sealCenter, INK, 0.145, 0.018, spine.joints[1], [1, 0, 0]);
  disk([0.323, 1.02, -0.05], GOLD, 0.118, 0.02, spine.joints[1], [1, 0, 0]);
  disk([0.337, 1.02, -0.05], RUST, 0.076, 0.023, spine.joints[1], [1, 0, 0]);
  b.rod(
    [0.338, 0.94, -0.05],
    [0.338, 1.1, -0.05],
    0.012,
    { color: PALE, bone: spine.joints[1], group: "seal", name: "sealStrokeV" },
  );
  b.rod(
    [0.338, 1.02, -0.13],
    [0.338, 1.02, 0.03],
    0.012,
    { color: PALE, bone: spine.joints[1], group: "seal", name: "sealStrokeH" },
  );

  // Repeated small rosettes along the belly flank.
  const rosettes = [
    [0.3, 0.86, -0.42],
    [0.31, 0.82, -0.22],
    [0.31, 0.83, 0.03],
    [0.3, 0.89, 0.28],
  ] as [number, number, number][];

  for (let i = 0; i < rosettes.length; i++) {
    const p = rosettes[i];
    disk(p, RUST, 0.045, 0.012, spine.joints[1], [1, 0, 0]);
    disk([p[0] + 0.009, p[1], p[2]], GOLD, 0.018, 0.016, spine.joints[1], [1, 0, 0]);
  }

  // Harness-like red cords over the shoulders.
  for (const s of [1, -1]) {
    b.rod(
      [s * 0.2, 1.27, 0.38],
      [s * 0.3, 0.9, 0.18],
      0.018,
      {
        color: VERMILION,
        bone: spine.tip,
        group: "ornament",
        name: `shoulderCord${s}`,
      },
    );
    bead([s * 0.3, 0.9, 0.18], GOLD, 0.035, spine.tip);
  }

  // A hanging paper talisman below the neck.
  R(
    new THREE.BoxGeometry(0.16, 0.25, 0.018),
    PALE,
    [0.18, 1.0, 0.64],
    neck.joints[1],
  );
  R(
    new THREE.BoxGeometry(0.13, 0.2, 0.024),
    VERMILION,
    [0.18, 1.0, 0.65],
    neck.joints[1],
  );
  R(
    new THREE.BoxGeometry(0.095, 0.16, 0.028),
    PALE,
    [0.18, 1.0, 0.666],
    neck.joints[1],
  );
  b.rod(
    [0.18, 0.93, 0.684],
    [0.18, 1.08, 0.684],
    0.009,
    { color: INK, bone: neck.joints[1], group: "talisman", name: "talismanGlyph" },
  );
  b.rod(
    [0.14, 1.0, 0.684],
    [0.22, 1.0, 0.684],
    0.009,
    { color: INK, bone: neck.joints[1], group: "talisman", name: "talismanGlyphCross" },
  );

  // Gold collar beads.
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const p = [
      Math.cos(a) * 0.2,
      1.28 + Math.sin(a) * 0.09,
      0.55 + Math.cos(a) * 0.08,
    ] as [number, number, number];
    bead(p, i % 3 === 0 ? VERMILION : GOLD, 0.025, neck.joints[1]);
  }

  // ---------------------------------------------------------------------------
  // Dream vapour: three curling, ribbon-like wisps around the spirit.
  // ---------------------------------------------------------------------------

  const dreamPaths = [
    catmull([
      [0.34, 1.2, 0.72],
      [0.58, 1.42, 0.72],
      [0.62, 1.68, 0.48],
      [0.45, 1.82, 0.25],
      [0.2, 1.76, 0.16],
    ]),
    catmull([
      [-0.32, 1.04, 0.45],
      [-0.58, 1.2, 0.54],
      [-0.7, 1.44, 0.4],
      [-0.62, 1.62, 0.16],
      [-0.42, 1.65, 0.03],
    ]),
    catmull([
      [0.22, 0.78, -0.2],
      [0.55, 0.62, -0.28],
      [0.7, 0.72, -0.52],
      [0.58, 0.94, -0.7],
      [0.38, 1.04, -0.73],
    ]),
  ];

  const dreamColors = [DREAM, TURQUOISE, RUST];

  for (let i = 0; i < dreamPaths.length; i++) {
    const wisp = b.sweep(dreamPaths[i], [0.018, 0.004], {
      color: dreamColors[i],
      caps: { start: "round", end: "point" },
      group: "dream",
      name: `dreamWisp${i}`,
    });

    for (let j = 0; j < 3; j++) {
      const t = 0.2 + j * 0.28;
      const q = wisp.at(t);
      bead(q.at, i === 1 ? PALE : GOLD, 0.025 - j * 0.004, q.bone);
    }
  }

  // Floating dream motes, kept close to the silhouette.
  const motePositions = [
    [0.48, 1.86, 0.35],
    [0.66, 1.58, 0.08],
    [-0.67, 1.72, 0.3],
    [-0.74, 1.38, 0.5],
    [0.62, 0.54, -0.68],
    [-0.6, 0.72, -0.7],
    [0.34, 1.93, 0.1],
  ] as [number, number, number][];

  for (let i = 0; i < motePositions.length; i++) {
    const p = motePositions[i];
    bead(p, i % 2 ? GOLD : PALE, 0.026 + (i % 3) * 0.006);
    b.spike(p, [0, 1, 0], 0.075, 0.011, {
      color: i % 2 ? RUST : DREAM,
      group: "dream",
      name: `moteRay${i}`,
    });
    b.spike(p, [1, 0, 0], 0.075, 0.011, {
      color: i % 2 ? RUST : DREAM,
      group: "dream",
      name: `moteRayCross${i}`,
    });
  }

  // A few carved contour ticks on the legs and trunk.
  for (const leg of legs) {
    for (let i = 0; i < 3; i++) {
      const p = leg.chain.at(0.42 + i * 0.13).at;
      b.rod(
        [p[0] - leg.side * 0.07, p[1], p[2] + 0.03],
        [p[0] + leg.side * 0.07, p[1], p[2] + 0.03],
        0.009,
        {
          color: RUST,
          bone: leg.chain.nearestJoint(p),
          group: "legMarks",
          name: `${leg.name}Stripe${i}`,
        },
      );
    }
  }

  for (let i = 0; i < 4; i++) {
    const q = trunk.at(0.22 + i * 0.18);
    b.ring(q, {
      count: 1,
      radius: 0.0,
      name: `trunkRing${i}`,
      role: "fan",
    }, (item: any) => {
      b.spike(item, item, 0.045, 0.011, {
        color: i % 2 ? RUST : GOLD,
        group: "trunkMarks",
        name: `trunkMark${i}`,
      });
    });
  }

  // Slight open-jaw rest pose: readable mouth, still neutral and riggable.
  b.pose(jaw, { axis: [1, 0, 0], deg: -8 });

  // Small block-print corner accents attached to the spirit's rear silhouette.
  for (const s of [1, -1]) {
    b.spike(
      [s * 0.22, 1.12, -0.82],
      [s * 0.15, 0.25, -0.1],
      0.16,
      0.035,
      {
        color: GOLD,
        bone: spine.joints[0],
        group: "silhouette",
        name: `rumpAccent${s}`,
      },
    );
  }

  return b.root;
}
