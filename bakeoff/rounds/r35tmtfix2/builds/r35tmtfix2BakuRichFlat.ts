import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  polyline,
  limb,
  rng,
  frame,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "baku",
  description:
    "A stylized ukiyo-e woodblock baku, the dream-eating tapir spirit, with indigo ink contours, curled trunk, striped body, carved ears, mane, dream wisps, and a sun emblem.",
};

export default function build() {
  const b = createBuilder({ name: "baku", detail: 1 });

  // Ukiyo-e palette: dark indigo keylines, warm paper, vermilion seals, and mineral blue.
  const INK = "#171b35";
  const DEEP = "#20294c";
  const INDIGO = "#334b78";
  const BLUE = "#597aa0";
  const PAPER = "#ead9ad";
  const CREAM = "#f5e8c4";
  const BELLY = "#d8c18d";
  const RUST = "#a94535";
  const VERMILION = "#c75b3e";
  const GOLD = "#d5a64c";
  const MOSS = "#66734b";
  const SMOKE = "#a9c5ca";
  const SMOKE_DARK = "#648d9a";
  const BLACK = "#101322";
  const WHITE = "#fff5d8";

  const modelRng = rng(27);

  // ---------------------------------------------------------------------------
  // Skeleton first: a broad spirit body, four planted legs, neck, head, jaw,
  // curled trunk, tail, and small ear hinges.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.9, 0],
    dir: [0, 0, 1],
    role: "spine",
    group: "body",
  });

  const spinePath = catmull([
    [0, 0.91, -0.48],
    [0, 0.99, -0.2],
    [0, 1.03, 0.12],
    [0, 1.12, 0.36],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "shoulders"],
    role: "spine",
    group: "body",
  });

  const neckPath = catmull([
    [0, 1.12, 0.34],
    [0, 1.2, 0.48],
    [0, 1.34, 0.56],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: spine.joints[spine.joints.length - 1],
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
    group: "body",
  });

  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 1.42, 0.62],
    dir: [0, 0.18, 1],
    role: "head",
    group: "face",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.09, down: 0.08 }),
    dir: [0, 0.32, -0.06],
    role: "jaw",
    group: "face",
  });

  const trunkPath = catmull([
    head.local({ forward: 0.14, down: 0.02 }),
    head.local({ forward: 0.34, down: 0.04 }),
    head.local({ forward: 0.52, down: 0.13 }),
    head.local({ forward: 0.62, down: 0.3 }),
    head.local({ forward: 0.55, down: 0.43 }),
  ]);
  const trunk = b.chain("trunk", trunkPath, {
    parent: head,
    names: ["trunk1", "trunk2", "trunk3", "trunk4", "trunkTip"],
    role: "tentacle",
    group: "face",
  });

  const tailPath = catmull([
    [0, 0.97, -0.48],
    [0, 1.0, -0.7],
    [0.02, 1.08, -0.91],
    [0.08, 1.18, -1.08],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tailTip"],
    role: "tail",
    group: "body",
  });

  const legSpecs = [
    { side: 1, z: 0.27, key: "frontL", x: 0.24 },
    { side: -1, z: 0.27, key: "frontR", x: -0.24 },
    { side: 1, z: -0.3, key: "hindL", x: 0.25 },
    { side: -1, z: -0.3, key: "hindR", x: -0.25 },
  ] as const;

  const legs: Record<string, ReturnType<typeof b.chain>> = {};
  for (const leg of legSpecs) {
    const root: [number, number, number] = [leg.x, 0.88, leg.z];
    const target: [number, number, number] = [
      leg.x + leg.side * 0.025,
      0.13,
      leg.z + (leg.z > 0 ? 0.07 : -0.04),
    ];
    const points = limb(
      root,
      target,
      leg.z > 0 ? [0.3, 0.3, 0.28] : [0.34, 0.31, 0.25],
      [
        [0, 0, leg.z > 0 ? 1 : -1],
        [0, 0, leg.z > 0 ? -1 : 1],
      ],
      { sole: [0, 0, 1] },
    );
    legs[leg.key] = b.chain(leg.key, points, {
      parent: hips,
      names: [
        `${leg.key}Hip`,
        `${leg.key}Knee`,
        `${leg.key}Ankle`,
        `${leg.key}Paw`,
      ],
      role: "leg",
      group: "legs",
      contact: target,
    });
  }

  const earL = b.joint("earL", {
    parent: head,
    at: head.local([0.15, 0.01, 0.12]),
    dir: [0.08, 0, 0.5],
    role: "hinge",
    group: "ears",
  });
  const earR = b.joint("earR", {
    parent: head,
    at: head.local([-0.15, 0.01, 0.12]),
    dir: [-0.08, 0, 0.5],
    role: "hinge",
    group: "ears",
  });

  // ---------------------------------------------------------------------------
  // Body volumes. Dark indigo underpainting acts as the carved woodblock outline.
  // The warm body is slightly smaller, giving every silhouette a graphic contour.
  // ---------------------------------------------------------------------------

  const bodyOutline = b.sweep(spine, (t) => 0.27 + 0.045 * Math.sin(t * Math.PI), {
    bone: spine,
    color: INK,
    section: { ngon: 8 },
    caps: "round",
    name: "bodyInk",
    group: "outline",
  });

  const body = b.sweep(spine, (t) => 0.235 + 0.04 * Math.sin(t * Math.PI), {
    bone: spine,
    color: INDIGO,
    section: { ngon: 8 },
    caps: "round",
    sectors: [[115, 245, BELLY]],
    name: "body",
    group: "body",
  });

  const neckOutline = b.sweep(neck, [0.19, 0.16], {
    bone: neck,
    color: INK,
    section: { ngon: 8 },
    name: "neckInk",
    group: "outline",
  });
  const neckSkin = b.sweep(neck, [0.165, 0.14], {
    bone: neck,
    color: BLUE,
    section: { ngon: 8 },
    sectors: [[112, 248, BELLY]],
    name: "neck",
    group: "body",
  });

  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), INK, {
    bone: head,
    at: head.at,
    scale: [0.255, 0.22, 0.265],
    group: "outline",
    name: "skullInk",
  });
  const face = b.part(new THREE.SphereGeometry(1, 12, 8), BLUE, {
    bone: head,
    at: head.at,
    scale: [0.225, 0.195, 0.24],
    group: "face",
    name: "skull",
  });

  // Pale cheek and muzzle planes make the tapir read instantly from the front.
  b.part(new THREE.SphereGeometry(1, 10, 6), CREAM, {
    bone: head,
    at: head.local({ forward: 0.11, down: 0.025 }),
    scale: [0.18, 0.13, 0.13],
    group: "face",
    name: "muzzle",
  });

  const lowerJaw = b.sweep(
    catmull([
      jaw.at,
      jaw.local({ forward: 0.18, down: 0.015 }),
      jaw.local({ forward: 0.34, down: 0.025 }),
    ]),
    [0.13, 0.08],
    {
      bone: jaw,
      color: CREAM,
      section: { ngon: 6 },
      caps: "round",
      name: "lowerJaw",
      group: "jaw",
    },
  );

  // Small dark mouth seam and a vermilion tongue.
  b.sweep(
    bezier(
      jaw.local({ forward: 0.04, down: 0.01 }),
      jaw.local({ forward: 0.17, down: 0.03 }),
      jaw.local({ forward: 0.3, down: 0.035 }),
    ),
    0.012,
    { bone: jaw, color: INK, caps: "flat", name: "mouthSeam", group: "face" },
  );
  b.part(new THREE.SphereGeometry(1, 8, 5), VERMILION, {
    bone: jaw,
    at: jaw.local({ forward: 0.22, down: 0.055 }),
    scale: [0.055, 0.085, 0.018],
    group: "face",
    name: "tongue",
  });

  // The long tapir nose, dark at the end, with a squared nostril block.
  b.sweep(trunk, [0.11, 0.045], {
    bone: trunk,
    color: INK,
    section: { ngon: 7 },
    caps: "round",
    name: "trunkInk",
    group: "outline",
  });
  const trunkSkin = b.sweep(trunk, [0.092, 0.035], {
    bone: trunk,
    color: CREAM,
    section: { ngon: 7 },
    caps: "round",
    name: "trunk",
    group: "face",
  });
  b.part(new THREE.SphereGeometry(1, 8, 5), BLACK, {
    bone: trunk.tip!,
    at: trunk.tip!.at,
    scale: [0.09, 0.06, 0.075],
    group: "face",
    name: "nose",
  });
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(1, 7, 5), INK, {
      bone: trunk.tip!,
      at: trunk.tip!.local([s * 0.045, 0.018, 0.035]),
      scale: [0.016, 0.018, 0.012],
      group: "face",
      name: `nostril${s > 0 ? "L" : "R"}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Eyes, brows, ears, and face markings.
  // ---------------------------------------------------------------------------

  const eyeWhite = new THREE.SphereGeometry(1, 8, 6);
  for (const s of [-1, 1]) {
    const eye = b.part(eyeWhite, WHITE, {
      bone: head,
      at: head.local([s * 0.095, 0.142, 0.045]),
      scale: [0.055, 0.035, 0.065],
      group: "face",
      name: `eye${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.SphereGeometry(1, 7, 5), BLACK, {
      bone: head,
      at: head.local([s * 0.096, 0.174, 0.045]),
      scale: [0.026, 0.012, 0.039],
      group: "face",
      name: `pupil${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.SphereGeometry(1, 6, 4), WHITE, {
      bone: head,
      at: head.local([s * 0.085, 0.184, 0.068]),
      scale: [0.009, 0.006, 0.012],
      group: "face",
      name: `eyeGlint${s > 0 ? "L" : "R"}`,
    });
    b.sweep(
      polyline([
        head.local([s * 0.15, 0.145, 0.092]),
        head.local([s * 0.095, 0.17, 0.105]),
        head.local([s * 0.035, 0.145, 0.098]),
      ]),
      0.009,
      { bone: head, color: INK, caps: "flat", name: `brow${s > 0 ? "L" : "R"}`, group: "face" },
    );
  }

  // Tapir ears: broad, leaf-like woodblock silhouettes with rust interiors.
  const earOutline = [
    [0, 0, "sharp"] as [number, number, "sharp"],
    [0.15, 0.025, "sharp"] as [number, number, "sharp"],
    [0.19, 0.2, "sharp"] as [number, number, "sharp"],
    [0.11, 0.34, "sharp"] as [number, number, "sharp"],
    [0.025, 0.24, "sharp"] as [number, number, "sharp"],
  ];
  const earInner = [
    [0.025, 0.04, "sharp"] as [number, number, "sharp"],
    [0.12, 0.06, "sharp"] as [number, number, "sharp"],
    [0.145, 0.18, "sharp"] as [number, number, "sharp"],
    [0.09, 0.27, "sharp"] as [number, number, "sharp"],
    [0.04, 0.21, "sharp"] as [number, number, "sharp"],
  ];
  for (const s of [-1, 1]) {
    const e = s > 0 ? earL : earR;
    const outer = b.extrude(earOutline, {
      at: e.at,
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.008,
      bone: e,
      color: INK,
      name: `earInk${s > 0 ? "L" : "R"}`,
      group: "ears",
    });
    b.extrude(earInner, {
      at: e.local({ left: s * 0.018, down: 0.005 }),
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.052,
      bevel: 0.004,
      bone: e,
      color: RUST,
      name: `earInner${s > 0 ? "L" : "R"}`,
      group: "ears",
    });
  }

  // A painted dark forehead stripe and cheek hash marks.
  b.sweep(
    polyline([
      head.local({ forward: 0.2, up: 0.13 }),
      head.local({ forward: 0.212, up: 0.04 }),
      head.local({ forward: 0.2, down: 0.035 }),
    ]),
    0.018,
    { bone: head, color: INK, caps: "flat", name: "foreheadStripe", group: "face" },
  );
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      b.rod(
        head.local([s * (0.18 + i * 0.018), 0.09, -0.02 - i * 0.012]),
        head.local([s * (0.21 + i * 0.018), 0.105, -0.01 - i * 0.012]),
        0.007,
        { bone: head, color: INK, name: `cheekMark${s}_${i}`, group: "face" },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Legs and feet: chunky dark contour, blue lower limb, cream sole, three claws.
  // ---------------------------------------------------------------------------

  for (const leg of legSpecs) {
    const chain = legs[leg.key];
    b.sweep(chain, [0.105, 0.075], {
      bone: chain,
      color: INK,
      section: { ngon: 6 },
      name: `${leg.key}Ink`,
      group: "outline",
    });
    b.sweep(chain, [0.082, 0.058], {
      bone: chain,
      color: BLUE,
      section: { ngon: 6 },
      name: leg.key,
      group: "legs",
    });
    const paw = chain.tip!;
    b.part(new THREE.BoxGeometry(0.19, 0.09, 0.24), INK, {
      bone: paw,
      at: paw.at,
      scale: [1, 1, 1],
      group: "outline",
      name: `${leg.key}PawInk`,
    });
    b.part(new THREE.BoxGeometry(0.155, 0.065, 0.2), CREAM, {
      bone: paw,
      at: paw.local({ down: 0.015 }),
      group: "legs",
      name: `${leg.key}Paw`,
    });
    for (const toe of [-1, 0, 1]) {
      b.spike(
        paw.local([toe * 0.045, -0.035, 0.08]),
        [0, 0, 1],
        0.065,
        0.014,
        { bone: paw, color: BLACK, name: `${leg.key}Claw${toe}`, group: "legs" },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Back mane: repeated carved triangular tufts following the spine.
  // ---------------------------------------------------------------------------

  b.along(body, 11, (at) =>
    b.spike(at, [0, 1, 0], 0.105, 0.036, {
      color: INK,
      name: "mane",
      group: "mane",
    }),
  );

  // Tail tip is a small pale brush with a red woodblock band.
  b.sweep(tail, [0.085, 0.025], {
    bone: tail,
    color: INK,
    name: "tailInk",
    group: "outline",
  });
  b.sweep(tail, [0.06, 0.014], {
    bone: tail,
    color: BLUE,
    bands: [[0.72, RUST], [1, CREAM]],
    name: "tail",
    group: "body",
  });

  // ---------------------------------------------------------------------------
  // Ukiyo-e emblem: a sun / dream seal on the visible left flank.
  // ---------------------------------------------------------------------------

  const flankCenter = body.at(0.37, 90);
  const seal = b.part(new THREE.CylinderGeometry(0.105, 0.105, 0.025, 12), RUST, {
    at: flankCenter.moved([0, 0.012, 0]),
    dir: flankCenter.axis,
    bone: flankCenter.bone ?? spine.joints[1],
    group: "emblem",
    name: "dreamSeal",
  });
  const sealSurface = b.surface(seal);
  const sealHit = sealSurface.around(flankCenter.at).at(0, 0);
  if (sealHit) {
    b.part(new THREE.CylinderGeometry(0.064, 0.064, 0.03, 10), GOLD, {
      at: sealHit.moved([0, 0.006, 0]),
      dir: sealHit.axis,
      bone: sealHit.bone ?? spine.joints[1],
      group: "emblem",
      name: "sealSun",
    });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const p0 = sealHit.moved([
        Math.cos(a) * 0.067,
        0.009,
        Math.sin(a) * 0.067,
      ]);
      const p1 = sealHit.moved([
        Math.cos(a) * 0.094,
        0.009,
        Math.sin(a) * 0.094,
      ]);
      b.rod(p0, p1, 0.009, {
        bone: sealHit.bone ?? spine.joints[1],
        color: GOLD,
        name: `sealRay${i}`,
        group: "emblem",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Dream-eating magic: two rising, blocky vapor ribbons from the brow and trunk.
  // They remain attached at their roots and terminate in pointed wisps.
  // ---------------------------------------------------------------------------

  const dreamRoot = head.local({ forward: 0.12, up: 0.16 });
  const wispA = b.sweep(
    bezier(
      dreamRoot,
      [0.18, 1.68, 0.66],
      [-0.14, 1.79, 0.78],
      [0.1, 1.92, 0.58],
    ),
    [0.036, 0.008],
    {
      bone: head,
      color: SMOKE_DARK,
      caps: { start: "round", end: "point" },
      name: "dreamWispA",
      group: "magic",
    },
  );
  const wispB = b.sweep(
    bezier(
      head.local({ forward: 0.39, up: 0.02 }),
      [0.34, 1.57, 0.83],
      [0.48, 1.7, 0.58],
      [0.3, 1.81, 0.86],
    ),
    [0.027, 0.006],
    {
      bone: head,
      color: SMOKE,
      caps: { start: "round", end: "point" },
      name: "dreamWispB",
      group: "magic",
    },
  );

  // Flat cloud beads make the vapor read as carved clouds rather than tentacles.
  const dreamClouds: [number, number, number][] = [
    [0.1, 1.69, 0.7],
    [-0.03, 1.8, 0.76],
    [0.22, 1.83, 0.65],
    [0.37, 1.6, 0.75],
    [0.39, 1.73, 0.68],
  ];
  dreamClouds.forEach((p, i) => {
    b.part(new THREE.SphereGeometry(1, 8, 5), i % 2 ? SMOKE : CREAM, {
      at: p,
      scale: [0.055, 0.045, 0.055],
      group: "magic",
      name: `dreamCloud${i}`,
    });
  });

  // A tiny three-pronged dream glyph above the brow.
  const glyphBase = head.local({ forward: 0.19, up: 0.18 });
  for (const s of [-1, 0, 1]) {
    b.spike(
      glyphBase,
      [s * 0.35, 0.8, 0.1],
      0.09,
      0.012,
      { bone: head, color: GOLD, name: `glyph${s}`, group: "magic" },
    );
  }

  // Add a few deliberate ink seams along the belly and shoulder, like carved register lines.
  for (const z of [-0.22, 0.0, 0.22]) {
    b.sweep(
      polyline([
        [0.19, 0.9, z - 0.08],
        [0.255, 0.95, z],
        [0.19, 1.0, z + 0.08],
      ]),
      0.008,
      { bone: spine.joints[1], color: INK, caps: "flat", name: `bellySeam${z}`, group: "markings" },
    );
  }

  // Ensure all visual choices are deterministic even if the SDK later samples geometry.
  void modelRng;

  return b.root;
}
