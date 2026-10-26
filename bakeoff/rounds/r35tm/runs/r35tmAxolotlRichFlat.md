```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
} from "agentic-3js-builder";
import { cel, furEdge, INK } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "Chibi Axolotl",
  description: "A squat, friendly axolotl with a huge face, soft pink body, dark button eyes, and magnificent frilly pink external gills.",
};

export default function build() {
  const b = createBuilder({ name: "chibi-axolotl", detail: 1 });

  const BODY = cel("#e99aaa", "#b96883");
  const BELLY = cel("#ffe3d5", "#eeb4b7");
  const PALE = cel("#ffd0cf", "#dc8d9b");
  const GILL = cel("#ff719d", "#b93770");
  const GILL_LIGHT = cel("#ffacc1", "#dc557f");
  const GILL_DARK = cel("#a72c63", "#701a4c");
  const EYE = "#241a31";
  const EYE_HI = "#fff8f3";
  const MOUTH = "#5f244a";
  const SPOT = cel("#c86d91", "#8b456b");
  const CREAM = cel("#fff0de", "#e8b7ae");
  const TOE = "#f49ab0";

  const sphere = (radius = 1, width = 10, height = 7) =>
    new THREE.SphereGeometry(radius, width, height);

  const ellipsoid = (
    at: any,
    scale: [number, number, number],
    color: any,
    bone?: any,
    name?: string,
  ) =>
    b.part(sphere(1, 12, 8), color, {
      at,
      bone,
      scale,
      name,
      flat: true,
    });

  const smallSphere = (
    at: any,
    radius: number,
    color: any,
    bone?: any,
    name?: string,
  ) =>
    b.part(sphere(radius, 8, 6), color, {
      at,
      bone,
      name,
      flat: true,
    });

  // ------------------------------------------------------------------------------------------------
  // Skeleton first: compact salamander spine, four planted limbs, separate jaw, tail, and gill fans.

  const pelvis = b.joint("pelvis", {
    at: [0, 0.37, -0.35],
    dir: [0, 0, 1],
    role: "spine",
    group: "body",
  });

  const spinePath = catmull([
    [0, 0.37, -0.35],
    [0, 0.42, -0.08],
    [0, 0.50, 0.24],
    [0, 0.60, 0.43],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: pelvis,
    names: ["spine1", "spine2", "neck"],
    role: "spine",
    count: 3,
    group: "body",
  });

  const head = b.joint("head", {
    parent: spine.tip,
    at: [0, 0.68, 0.49],
    dir: [0, 0.12, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.57, 0.69],
    dir: [0, -0.16, 1],
    role: "jaw",
    group: "face",
  });

  const tailPath = catmull([
    [0, 0.38, -0.45],
    [0, 0.32, -0.73],
    [0, 0.25, -1.02],
    [0, 0.20, -1.29],
    [0, 0.17, -1.48],
  ]);

  const tail = b.chain("tail", tailPath, {
    parent: pelvis,
    names: ["tail1", "tail2", "tail3", "tail4"],
    role: "tail",
    count: 4,
    group: "tail",
  });

  const legTargets = [
    { s: 1, z: 0.25, name: "frontL", side: "L" },
    { s: -1, z: 0.25, name: "frontR", side: "R" },
    { s: 1, z: -0.30, name: "hindL", side: "L" },
    { s: -1, z: -0.30, name: "hindR", side: "R" },
  ];

  const legs: { side: number; z: number; chain: any }[] = [];

  for (const spec of legTargets) {
    const root = [spec.s * 0.17, 0.38, spec.z] as [number, number, number];
    const target = [spec.s * 0.29, 0.095, spec.z + (spec.z > 0 ? 0.04 : -0.02)] as [
      number,
      number,
      number,
    ];

    const points = limb(
      root,
      target,
      spec.z > 0 ? [0.18, 0.16, 0.11] : [0.20, 0.18, 0.12],
      spec.z > 0
        ? [
            [0, 0, 1],
            [0, 0, -1],
          ]
        : [
            [0, 0, -1],
            [0, 0, 1],
          ],
      { sole: [0, 1, 0] },
    );

    const chain = b.chain(spec.name, points, {
      parent: pelvis,
      names: [
        `${spec.name}Hip`,
        `${spec.name}Knee`,
        `${spec.name}Ankle`,
        `${spec.name}Foot`,
      ],
      role: "leg",
      group: "limbs",
      contact: target,
    });

    legs.push({ side: spec.s, z: spec.z, chain });
  }

  const gillChains: any[] = [];

  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const y = 0.78 + i * 0.055;
      const z = 0.35 - i * 0.075;
      const path = catmull([
        [s * 0.22, y, z],
        [s * (0.32 + i * 0.015), y + 0.045, z - 0.015],
        [s * (0.43 + i * 0.02), y + 0.12 + i * 0.02, z - 0.055],
      ]);
      const gill = b.chain(`gill${s > 0 ? "L" : "R"}${i + 1}`, path, {
        parent: head,
        names: [
          `gill${s > 0 ? "L" : "R"}${i + 1}Base`,
          `gill${s > 0 ? "L" : "R"}${i + 1}Tip`,
        ],
        role: "fan",
        count: 2,
        group: "gills",
      });
      gillChains.push({ s, i, chain: gill });
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Main body and tail: broad, low, soft, with an intentionally oversized chibi head.

  const body = b.sweep(spine, (t: number) => 0.245 - t * 0.035, {
    color: BODY,
    section: { ngon: 8 },
    caps: "round",
    group: "body",
    name: "softBody",
    sectors: [
      [-62, 62, BODY],
      [118, 242, BELLY],
    ],
  });

  b.sweep(tail, (t: number) => 0.13 * (1 - t) + 0.018, {
    color: BODY,
    section: { ngon: 7 },
    caps: { start: "round", end: "point" },
    group: "tail",
    name: "taperedTail",
    sectors: [
      [-65, 65, BODY],
      [120, 240, BELLY],
    ],
  });

  // A pale belly bib follows the front half of the torso.
  const bellyBand = b.sweep(
    catmull([
      [0, 0.42, -0.05],
      [0, 0.49, 0.15],
      [0, 0.58, 0.37],
    ]),
    (t: number) => 0.195 - t * 0.025,
    {
      color: BELLY,
      bone: spine,
      section: { ngon: 7 },
      caps: "flat",
      group: "body",
      name: "bellyBib",
      sectors: [[-80, 80, BELLY]],
    },
  );

  // Head, cheek pads, and a broad lower jaw.
  const skull = ellipsoid(head.at, [0.36, 0.31, 0.35], PALE, head, "largeRoundHead");
  const cheekL = ellipsoid([0.19, 0.65, 0.67], [0.18, 0.17, 0.18], PALE, head, "cheekL");
  const cheekR = ellipsoid([-0.19, 0.65, 0.67], [0.18, 0.17, 0.18], PALE, head, "cheekR");

  const lowerJaw = ellipsoid(
    [0, 0.565, 0.78],
    [0.22, 0.075, 0.19],
    CREAM,
    jaw,
    "lowerJaw",
  );

  // A distinct dark mouth gap makes the two jaws readable even in a neutral pose.
  b.rod([0, 0.625, 0.815], [0, 0.605, 0.91], 0.018, {
    color: MOUTH,
    bone: jaw,
    caps: "round",
    name: "mouthGap",
    group: "face",
  });

  // Soft smile corners.
  for (const s of [1, -1]) {
    b.rod(
      [s * 0.015, 0.625, 0.815],
      [s * 0.11, 0.645, 0.83],
      0.012,
      {
        color: MOUTH,
        bone: jaw,
        caps: "round",
        name: `smile${s > 0 ? "L" : "R"}`,
        group: "face",
      },
    );
  }

  // ------------------------------------------------------------------------------------------------
  // Face first: huge glossy black eyes, pale eye pads, tiny brows, and nostrils.

  for (const s of [1, -1]) {
    ellipsoid(
      [s * 0.135, 0.805, 0.735],
      [0.082, 0.095, 0.052],
      CREAM,
      head,
      `eyeSocket${s > 0 ? "L" : "R"}`,
    );

    ellipsoid(
      [s * 0.145, 0.81, 0.778],
      [0.057, 0.068, 0.032],
      EYE,
      head,
      `shinyEye${s > 0 ? "L" : "R"}`,
    );

    smallSphere(
      [s * 0.126, 0.844, 0.807],
      0.019,
      EYE_HI,
      head,
      `eyeHighlight${s > 0 ? "L" : "R"}`,
    );

    smallSphere(
      [s * 0.164, 0.786, 0.809],
      0.009,
      "#ffffff",
      head,
      `eyePin${s > 0 ? "L" : "R"}`,
    );

    b.rod(
      [s * 0.095, 0.918, 0.765],
      [s * 0.177, 0.925, 0.77],
      0.012,
      {
        color: SPOT,
        bone: head,
        caps: "round",
        name: `brow${s > 0 ? "L" : "R"}`,
        group: "face",
      },
    );
  }

  // Tiny rounded snout and nostrils.
  ellipsoid([0, 0.695, 0.868], [0.15, 0.105, 0.105], CREAM, head, "muzzle");
  for (const s of [1, -1]) {
    smallSphere(
      [s * 0.052, 0.73, 0.946],
      0.014,
      MOUTH,
      head,
      `nostril${s > 0 ? "L" : "R"}`,
    );
  }

  // Blush patches give the face a strongly chibi silhouette.
  for (const s of [1, -1]) {
    ellipsoid(
      [s * 0.235, 0.695, 0.76],
      [0.065, 0.035, 0.018],
      "#f58ea5",
      head,
      `blush${s > 0 ? "L" : "R"}`,
    );
    for (let j = 0; j < 3; j++) {
      b.rod(
        [s * (0.21 + j * 0.022), 0.682 - j * 0.004, 0.778],
        [s * (0.225 + j * 0.022), 0.674 - j * 0.004, 0.789],
        0.004,
        {
          color: "#df627e",
          bone: head,
          caps: "round",
          name: `blushMark${s > 0 ? "L" : "R"}${j}`,
          group: "face",
        },
      );
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Four short, chunky legs and webbed-looking toes.

  for (const legInfo of legs) {
    const { side: s, z, chain } = legInfo;
    b.sweep(chain, [0.075, 0.06], {
      color: BODY,
      section: { ngon: 6 },
      caps: "round",
      group: "limbs",
      name: `${chain.name}Tube`,
    });

    const foot = chain.tip.at;
    ellipsoid(
      [foot.x, 0.095, foot.z],
      [0.105, 0.065, 0.135],
      PALE,
      chain.tip,
      `${chain.name}Paw`,
    );

    const toeZ = z > 0 ? 0.045 : -0.045;
    for (let j = -1; j <= 1; j++) {
      const toeBase = [s * (0.29 + j * 0.035), 0.085, z + j * 0.035] as [
        number,
        number,
        number,
      ];
      const toeTip = [
        s * (0.29 + j * 0.058),
        0.045,
        z + toeZ + j * 0.04,
      ] as [number, number, number];

      b.spike(toeBase, toeTip, null, 0.022, {
        color: TOE,
        bone: chain.tip,
        caps: "round",
        name: `${chain.name}Toe${j + 2}`,
        group: "limbs",
      });
    }
  }

  // Little dorsal spots along the back and tail, placed from the live body surface.
  const bodySurface = b.surface([body, tail]);
  const spots = bodySurface.scatter(18, {
    rng: rng(41),
    minDist: 0.075,
    filter: (h: any) => h.n.y > 0.25 && h.at.y > 0.25,
  });

  for (let i = 0; i < spots.length; i++) {
    b.stick(
      new THREE.SphereGeometry(0.018 + (i % 3) * 0.006, 6, 4),
      SPOT,
      spots[i],
      {
        embed: 0.55,
        name: `backSpot${i}`,
        group: "markings",
      },
    );
  }

  // ------------------------------------------------------------------------------------------------
  // Signature frilly pink gills: three fan-shaped stalks per side, each with repeated featherlets.

  for (const item of gillChains) {
    const { s, i, chain } = item;

    b.sweep(chain, [0.027, 0.014], {
      color: GILL_DARK,
      section: { ngon: 6 },
      caps: { start: "round", end: "point" },
      group: "gills",
      name: `gillStalk${s > 0 ? "L" : "R"}${i + 1}`,
    });

    const base = chain.at(0.45);
    const tip = chain.at(0.94);

    // Broad pink blade behind each stalk.
    const blade = b.extrude(
      [
        [0, 0, "sharp"],
        [0.045, 0.035],
        [0.07, 0.11],
        [0.034, 0.18],
        [0, 0.22, "sharp"],
        [-0.034, 0.18],
        [-0.07, 0.11],
        [-0.045, 0.035],
      ],
      {
        at: tip.at,
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.003,
        smoothing: 0,
        color: GILL_LIGHT,
        bone: tip.bone,
        name: `gillBlade${s > 0 ? "L" : "R"}${i + 1}`,
        group: "gills",
      },
    );

    // Fine dark central rib gives each frill a graphic, readable structure.
    b.rod(
      [tip.at.x, tip.at.y - 0.015, tip.at.z],
      [tip.at.x, tip.at.y + 0.19, tip.at.z - 0.015],
      0.009,
      {
        color: GILL_DARK,
        bone: tip.bone,
        caps: "round",
        name: `gillRib${s > 0 ? "L" : "R"}${i + 1}`,
        group: "gills",
      },
    );

    // Featherlets fan outward from each stalk.
    for (let k = 0; k < 4; k++) {
      const t = 0.18 + k * 0.18;
      const p = chain.at(t).at;
      const rise = 0.055 + k * 0.012;
      const outward = s * (0.045 + k * 0.008);

      const upper = [p.x + outward, p.y + rise, p.z - 0.025] as [
        number,
        number,
        number,
      ];
      const lower = [p.x + outward * 0.86, p.y - rise * 0.55, p.z - 0.035] as [
        number,
        number,
        number,
      ];

      b.spike(p, upper, null, 0.012, {
        color: GILL_LIGHT,
        bone: chain.at(t).bone,
        caps: { start: "round", end: "point" },
        name: `gillFeatherUpper${s > 0 ? "L" : "R"}${i}${k}`,
        group: "gills",
      });

      b.spike(p, lower, null, 0.010, {
        color: GILL,
        bone: chain.at(t).bone,
        caps: { start: "round", end: "point" },
        name: `gillFeatherLower${s > 0 ? "L" : "R"}${i}${k}`,
        group: "gills",
      });

      smallSphere(
        [p.x + outward * 0.68, p.y + rise * 0.15, p.z - 0.02],
        0.014,
        GILL_LIGHT,
        chain.at(t).bone,
        `gillBud${s > 0 ? "L" : "R"}${i}${k}`,
      );
    }
  }

  // Gill attachment collars make the frills appear rooted in the cheeks rather than floating.
  for (const s of [1, -1]) {
    const collar = b.surface(head).around(head.at).at(s * 74, 3);
    if (collar) {
      b.stick(
        new THREE.TorusGeometry(0.062, 0.014, 6, 10),
        GILL_DARK,
        collar,
        {
          embed: 0.45,
          name: `gillCollar${s > 0 ? "L" : "R"}`,
          group: "gills",
        },
      );
    }
  }

  // A few soft tail-side bands, deliberately chunky rather than realistic.
  const bandPath = catmull([
    [0, 0.28, -0.68],
    [0, 0.23, -0.82],
    [0, 0.19, -0.97],
  ]);
  b.sweep(bandPath, [0.132, 0.105], {
    color: PALE,
    bone: tail,
    section: { ngon: 7 },
    caps: "none",
    group: "markings",
    name: "tailPaleBand",
    sectors: [[-60, 60, PALE]],
  });

  // The jaw is slightly open in the rest pose so the separate hinge is visually obvious.
  b.pose(jaw, { axis: [1, 0, 0], deg: -8 });

  return b.root;
}
```