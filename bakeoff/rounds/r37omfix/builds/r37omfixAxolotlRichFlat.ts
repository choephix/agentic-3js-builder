import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
} from "../../../../src/index";
import { cel, animeEye, INK } from "../../../../kits/toon";

export const meta = {
  name: "chibi axolotl",
  description: "A cute low-poly axolotl with a huge rounded head, soft turquoise body, expressive eyes, four little feet, and elaborate frilly pink external gills.",
};

export default function build() {
  const b = createBuilder({ name: "chibi-axolotl", detail: 1 });

  const AQUA = cel("#79d8d0", "#368f9a");
  const AQUA_DARK = cel("#3fabb1", "#246875");
  const BELLY = cel("#d7f2df", "#91c9c6");
  const PINK = cel("#ff8caf", "#c85583");
  const PINK_LIGHT = cel("#ffc0d1", "#ee6d99");
  const PINK_DARK = cel("#d74d79", "#8d315a");
  const CREAM = cel("#fff1d2", "#e3b98e");
  const DARK = INK;
  const WHITE = "#fffdf5";
  const BLACK = "#17152b";
  const BLUE_IRIS = "#4e9fc1";
  const PALE_BLUE = "#a9ecdf";
  const GOLD = "#f8c75d";

  const sphere = (radius: number, w = 12, h = 8) =>
    new THREE.SphereGeometry(radius, w, h);

  const box = (x: number, y: number, z: number) =>
    new THREE.BoxGeometry(x, y, z);

  const cyl = (r: number, height: number, sides = 8) =>
    new THREE.CylinderGeometry(r, r, height, sides);

  const roundedCapsule = (
    a: THREE.Vector3 | [number, number, number],
    c: THREE.Vector3 | [number, number, number],
    r: number,
    color: any,
    bone?: any,
    name?: string,
  ) => b.capsule(a, c, r, { color, bone, name });

  // ------------------------------------------------------------------------------------------------
  // Skeleton first. The animal is resting low to the floor with its limbs extended in a readable pose.

  const hips = b.joint("hips", {
    at: [0, 0.42, -0.35],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 0.42, -0.72],
    [0, 0.43, -0.38],
    [0, 0.47, 0.02],
    [0, 0.51, 0.36],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });

  const tailPath = catmull([
    [0, 0.43, -0.58],
    [0, 0.38, -0.92],
    [0, 0.29, -1.28],
    [0, 0.20, -1.61],
    [0, 0.15, -1.91],
  ]);

  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5"],
    role: "tail",
  });

  const head = b.joint("head", {
    parent: spine.joints[spine.joints.length - 1],
    at: [0, 0.59, 0.43],
    dir: [0, 0.05, 1],
    role: "head",
    group: "head",
  });

  const upperJaw = b.joint("upperJaw", {
    parent: head,
    at: [0, 0.53, 0.65],
    dir: [0, 0, 1],
    role: "jaw",
    group: "face",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.47, 0.63],
    dir: [0, -0.08, 1],
    role: "jaw",
    group: "face",
  });

  const legData = [
    {
      side: 1,
      name: "frontL",
      root: [0.16, 0.43, 0.28] as [number, number, number],
      target: [0.31, 0.115, 0.53] as [number, number, number],
      bend: [0, 0, 1] as [number, number, number],
    },
    {
      side: -1,
      name: "frontR",
      root: [-0.16, 0.43, 0.28] as [number, number, number],
      target: [-0.31, 0.115, 0.53] as [number, number, number],
      bend: [0, 0, 1] as [number, number, number],
    },
    {
      side: 1,
      name: "hindL",
      root: [0.18, 0.39, -0.36] as [number, number, number],
      target: [0.36, 0.115, -0.61] as [number, number, number],
      bend: [0, 0, -1] as [number, number, number],
    },
    {
      side: -1,
      name: "hindR",
      root: [-0.18, 0.39, -0.36] as [number, number, number],
      target: [-0.36, 0.115, -0.61] as [number, number, number],
      bend: [0, 0, -1] as [number, number, number],
    },
  ];

  const legs: any[] = [];

  for (const leg of legData) {
    const points = limb(
      leg.root,
      leg.target,
      [0.18, 0.16],
      leg.bend,
      { sole: [0, 0, 1] },
    );

    const chain = b.chain(leg.name, points, {
      parent: hips,
      names: [`hip${leg.name.endsWith("L") ? "L" : "R"}`, `knee${leg.name.endsWith("L") ? "L" : "R"}`, `ankle${leg.name.endsWith("L") ? "L" : "R"}`],
      role: "leg",
      contact: leg.target,
    });

    legs.push({ ...leg, chain, points });
  }

  // Three separate feathery gill stalks on each side.
  const gillChains: any[] = [];
  for (const side of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const rootX = side * (0.235 + i * 0.018);
      const rootY = 0.63 + i * 0.035;
      const rootZ = 0.40 - i * 0.035;
      const tipX = side * (0.48 + i * 0.025);
      const tipY = 0.79 + i * 0.095;
      const tipZ = 0.34 - i * 0.045;

      const path = catmull([
        [rootX, rootY, rootZ],
        [side * 0.34, rootY + 0.045, rootZ + 0.015],
        [side * 0.42, tipY - 0.07, tipZ],
        [tipX, tipY, tipZ],
      ]);

      const chain = b.chain(`gill${side > 0 ? "L" : "R"}${i + 1}`, path, {
        parent: head,
        names: [
          `gill${side > 0 ? "L" : "R"}${i + 1}Root`,
          `gill${side > 0 ? "L" : "R"}${i + 1}Mid`,
          `gill${side > 0 ? "L" : "R"}${i + 1}Tip`,
        ],
        role: "fan",
        group: "gills",
      });
      gillChains.push({ side, index: i, chain, path });
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Main body: a chunky low-poly tube with a cream counter-shaded belly.

  const body = b.sweep(spine, (t: number) => {
    const profile = Math.sin(Math.PI * t);
    return 0.235 + profile * 0.065;
  }, {
    color: AQUA,
    section: { ngon: 8 },
    sides: 8,
    sectors: [
      [125, 235, BELLY],
      [235, 305, AQUA_DARK],
    ],
    name: "soft rounded body",
    group: "body",
  });

  // Plump tapering tail, with a pale underside and a broad low-poly silhouette.
  const tailTube = b.sweep(tail, (t: number) => 0.16 * (1 - t) + 0.018, {
    color: AQUA_DARK,
    section: { ngon: 7 },
    sides: 7,
    sectors: [
      [112, 248, BELLY],
      [248, 305, AQUA],
    ],
    caps: "round",
    name: "tapered tail",
    group: "body",
  });

  // Tail fin membranes give the tail the unmistakable axolotl paddle shape.
  const tailTop = catmull([
    [0, 0.50, -0.64],
    [0, 0.60, -0.94],
    [0, 0.56, -1.28],
    [0, 0.43, -1.62],
    [0, 0.25, -1.91],
  ]);
  const tailBottom = catmull([
    [0, 0.31, -0.64],
    [0, 0.20, -0.94],
    [0, 0.12, -1.28],
    [0, 0.08, -1.62],
    [0, 0.14, -1.91],
  ]);

  b.membrane(tailTop, tailBottom, {
    color: cel("#69c7c5", "#397e91"),
    thickness: 0.014,
    rows: 5,
    cols: 14,
    scallop: 0.10,
    name: "tail fin",
    group: "fins",
  });

  // Small upright dorsal fin ridge.
  b.extrude(
    [
      [0, 0],
      [0.07, 0.06],
      [0.14, 0.18],
      [0.23, 0.28],
      [0.34, 0.18],
      [0.48, 0.04],
      [0.58, 0],
    ],
    {
      at: [0, 0.60, -0.72],
      x: [1, 0, 0],
      y: [0, 0, -1],
      thickness: 0.018,
      bevel: 0.006,
      color: cel("#68c9c6", "#3a818f"),
      bone: spine.joints[0],
      name: "dorsal tail fin",
      group: "fins",
    },
  );

  // ------------------------------------------------------------------------------------------------
  // Huge chibi head and cheeks.

  const skull = b.part(
    sphere(1, 16, 10),
    AQUA,
    {
      bone: head,
      at: [0, 0.60, 0.57],
      scale: [0.43, 0.34, 0.39],
      flat: true,
      name: "large rounded skull",
      group: "head",
    },
  );

  // A pale lower face / belly-colored throat patch.
  b.part(
    sphere(1, 12, 8),
    BELLY,
    {
      bone: head,
      at: [0, 0.49, 0.78],
      scale: [0.28, 0.19, 0.13],
      flat: true,
      name: "soft throat",
      group: "face",
    },
  );

  // Side cheek pads exaggerate the cute broad-headed silhouette.
  for (const side of [1, -1]) {
    b.part(
      sphere(0.17, 10, 7),
      AQUA,
      {
        bone: head,
        at: [side * 0.29, 0.52, 0.64],
        scale: [1, 0.8, 1.18],
        flat: true,
        name: `cheek ${side > 0 ? "L" : "R"}`,
        group: "face",
      },
    );
  }

  // Upper and lower jaws are separate, with a slightly open friendly smile.
  b.part(
    sphere(1, 12, 7),
    CREAM,
    {
      bone: upperJaw,
      at: [0, 0.535, 0.84],
      scale: [0.23, 0.085, 0.14],
      flat: true,
      name: "upper muzzle",
      group: "jaw",
    },
  );

  b.part(
    sphere(1, 12, 7),
    PINK_LIGHT,
    {
      bone: jaw,
      at: [0, 0.448, 0.84],
      scale: [0.20, 0.055, 0.105],
      flat: true,
      name: "lower jaw",
      group: "jaw",
    },
  );

  // Dark smiling mouth seam.
  b.sweep(
    catmull([
      [-0.17, 0.485, 0.935],
      [-0.08, 0.475, 0.952],
      [0, 0.472, 0.956],
      [0.08, 0.475, 0.952],
      [0.17, 0.485, 0.935],
    ]),
    0.009,
    {
      color: DARK,
      caps: "round",
      name: "smiling mouth",
      group: "face",
    },
  );

  // Tiny mouth corner dimples.
  for (const side of [1, -1]) {
    b.part(
      sphere(0.018, 7, 5),
      PINK_DARK,
      {
        bone: jaw,
        at: [side * 0.18, 0.485, 0.936],
        name: `mouth dimple ${side > 0 ? "L" : "R"}`,
        group: "face",
      },
    );
  }

  // Nose freckles / nostrils on top of the muzzle.
  for (const side of [1, -1]) {
    b.part(
      sphere(0.018, 7, 5),
      DARK,
      {
        bone: upperJaw,
        at: [side * 0.064, 0.566, 0.948],
        scale: [1.25, 0.65, 0.55],
        name: `nostril ${side > 0 ? "L" : "R"}`,
        group: "face",
      },
    );
  }

  // ------------------------------------------------------------------------------------------------
  // Huge expressive anime eyes, placed before the gills and other head ornaments.

  const eyeTexture = animeEye({
    iris: BLUE_IRIS,
    irisLight: PALE_BLUE,
    irisDark: "#24566d",
    ink: BLACK,
    blush: "#f38ba4",
    brow: true,
    size: 256,
  });

  for (const side of [1, -1]) {
    const eyeAt: [number, number, number] = [side * 0.155, 0.665, 0.885];
    b.decal(skull, eyeTexture, {
      at: eyeAt,
      dir: [0, 0.06, 1],
      up: [0, 1, 0],
      size: [0.145, 0.19],
      segments: 7,
      lift: 0.006,
      mirror: side > 0,
      name: `shiny eye ${side > 0 ? "L" : "R"}`,
      group: "face",
    });
  }

  // Tiny brow/forehead spots make the face more amphibian.
  for (const side of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      b.part(
        sphere(0.012 + i * 0.002, 6, 4),
        AQUA_DARK,
        {
          bone: head,
          at: [side * (0.24 - i * 0.045), 0.80 + i * 0.012, 0.78 + i * 0.015],
          name: `forehead spot ${side > 0 ? "L" : "R"}${i}`,
          group: "face",
        },
      );
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Frilly pink external gills. Each stalk is a thick root with a branching feather silhouette.

  for (const item of gillChains) {
    const { side, index, chain } = item;

    b.sweep(chain, (t: number) => 0.027 * (1 - t) + 0.009, {
      color: PINK_DARK,
      section: { ngon: 6 },
      sides: 6,
      caps: "round",
      name: `gill stalk ${side > 0 ? "L" : "R"}${index + 1}`,
      group: "gills",
    });

    const frames = b.along(chain, 6, () => {});
    for (let i = 0; i < frames.length; i++) {
      const f = frames[i];
      const t = i / Math.max(1, frames.length - 1);
      const width = 0.055 * (1 - t * 0.6);
      const lift = 0.025 + width * 0.4;

      // Alternating combs make a clearly frilled, feather-like edge.
      const upTip: [number, number, number] = [
        side * (0.05 + width * 0.65),
        0.055 + lift,
        0.01,
      ];
      const downTip: [number, number, number] = [
        side * (0.05 + width * 0.75),
        -0.035 - lift * 0.4,
        0.008,
      ];

      b.spike(f.at, f.at, 0.026 + width * 0.22, 0.011, {
        color: PINK_LIGHT,
        name: `gill upper fringe ${side > 0 ? "L" : "R"}${index + 1}-${i}`,
        group: "gills",
      });
      b.sweep(
        catmull([
          f.at,
          [f.at.x + side * width * 0.25, f.at.y + lift * 0.35, f.at.z],
          [f.at.x + side * width * 0.68, f.at.y + lift, f.at.z + 0.005],
          [f.at.x + upTip[0], f.at.y + upTip[1], f.at.z + upTip[2]],
        ]),
        0.009,
        {
          color: i % 2 === 0 ? PINK_LIGHT : PINK,
          caps: { start: "round", end: "point" },
          name: `gill frill upper ${side > 0 ? "L" : "R"}${index + 1}-${i}`,
          group: "gills",
        },
      );
      b.sweep(
        catmull([
          f.at,
          [f.at.x + side * width * 0.28, f.at.y - lift * 0.28, f.at.z],
          [f.at.x + side * width * 0.66, f.at.y - lift * 0.65, f.at.z - 0.006],
          [f.at.x + downTip[0], f.at.y + downTip[1], f.at.z + downTip[2]],
        ]),
        0.007,
        {
          color: PINK,
          caps: { start: "round", end: "point" },
          name: `gill frill lower ${side > 0 ? "L" : "R"}${index + 1}-${i}`,
          group: "gills",
        },
      );
    }

    // A small darker root bead visually anchors every gill to the skull.
    b.part(
      sphere(0.045, 8, 6),
      PINK_DARK,
      {
        bone: head,
        at: [side * (0.235 + index * 0.018), 0.63 + index * 0.035, 0.41 - index * 0.035],
        name: `gill root bead ${side > 0 ? "L" : "R"}${index + 1}`,
        group: "gills",
      },
    );
  }

  // ------------------------------------------------------------------------------------------------
  // Four short, chunky amphibian legs and wide little feet.

  for (const leg of legs) {
    const sideName = leg.side > 0 ? "L" : "R";
    const limbColor = leg.name.startsWith("front") ? AQUA : AQUA_DARK;

    b.sweep(leg.chain, (t: number) => 0.065 * (1 - t) + 0.045, {
      color: limbColor,
      section: { ngon: 6 },
      sides: 6,
      caps: "round",
      name: `${leg.name} leg`,
      group: "legs",
    });

    const ankle = leg.points[leg.points.length - 1];

    // Flat four-lobed foot.
    b.part(
      sphere(1, 10, 6),
      limbColor,
      {
        bone: leg.chain.joints[leg.chain.joints.length - 1],
        at: [ankle[0], 0.105, ankle[2] + 0.018],
        scale: [0.105, 0.055, 0.145],
        flat: true,
        name: `${leg.name} palm`,
        group: "feet",
      },
    );

    // Three spread toes per foot.
    const toeOffsets = [-1, 0, 1];
    for (let i = 0; i < toeOffsets.length; i++) {
      const spread = toeOffsets[i] * 0.052;
      const toeStart: [number, number, number] = [
        ankle[0] + spread * 0.25,
        0.115,
        ankle[2] + 0.045,
      ];
      const toeEnd: [number, number, number] = [
        ankle[0] + spread,
        0.075,
        ankle[2] + 0.145 + Math.abs(toeOffsets[i]) * 0.018,
      ];

      b.capsule(toeStart, toeEnd, 0.022, {
        color: limbColor,
        section: { ngon: 5 },
        caps: "round",
        name: `${leg.name} toe ${i + 1}`,
        group: "feet",
      });

      b.part(
        sphere(0.023, 7, 5),
        PINK_LIGHT,
        {
          at: toeEnd,
          scale: [1.15, 0.5, 0.85],
          name: `${leg.name} toe pad ${i + 1}`,
          group: "feet",
        },
      );
    }
  }

  // Soft side freckles, placed after the body exists so they sit on its skin.
  const bodySurface = b.surface([body, tailTube]);
  const freckles = bodySurface.scatter(24, {
    rng: rng(17),
    minDist: 0.075,
    filter: (hit: any) =>
      hit.at.y > 0.30 &&
      hit.at.y < 0.60 &&
      Math.abs(hit.at.x) > 0.10 &&
      hit.at.z < 0.35,
  });

  for (let i = 0; i < freckles.length; i++) {
    const hit = freckles[i];
    b.stick(
      sphere(i % 3 === 0 ? 0.018 : 0.012, 6, 4),
      i % 2 === 0 ? AQUA_DARK : PINK_DARK,
      hit,
      {
        embed: 0.46,
        name: `skin freckle ${i}`,
        group: "markings",
      },
    );
  }

  // Belly buttons / gill-line marks beneath the head.
  for (let i = 0; i < 5; i++) {
    b.part(
      sphere(0.012, 6, 4),
      PINK_DARK,
      {
        bone: spine.joints[Math.min(i, spine.joints.length - 1)],
        at: [0, 0.235, 0.12 - i * 0.11],
        scale: [1.7, 0.45, 0.7],
        name: `belly mark ${i}`,
        group: "markings",
      },
    );
  }

  // Small rounded side fins behind the head, like tiny aquatic ears.
  for (const side of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.10, 0.015],
        [0.15, 0.10],
        [0.12, 0.20],
        [0.045, 0.14],
      ],
      {
        at: [side * 0.31, 0.48, 0.25],
        x: [side, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.004,
        color: AQUA_DARK,
        bone: spine.tip,
        name: `side fin ${side > 0 ? "L" : "R"}`,
        group: "fins",
      },
    );
  }

  // A few pale gill freckles at the front of each cheek.
  for (const side of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      b.part(
        sphere(0.009, 6, 4),
        PINK_LIGHT,
        {
          bone: head,
          at: [side * (0.265 + i * 0.025), 0.57 + i * 0.028, 0.77 + i * 0.012],
          name: `cheek gill freckle ${side > 0 ? "L" : "R"}${i}`,
          group: "gills",
        },
      );
    }
  }

  return b.root;
}
