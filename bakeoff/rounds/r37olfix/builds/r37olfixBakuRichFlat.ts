import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  limb,
  frame,
  rng,
} from "../../../../src/index";

export const meta = {
  name: "baku-ukiyo-e",
  description:
    "A stylized ukiyo-e woodblock baku, the dream-eating tapir spirit, with indigo-black fur, cream markings, a long expressive snout, broad ears, cloud-like dream wisps, and carved-print ornament.",
};

export default function build() {
  const b = createBuilder({ name: "baku-ukiyo-e", detail: 1 });

  const INK = "#241b28";
  const NIGHT = "#182c42";
  const INDIGO = "#294d69";
  const BLUE = "#3e7185";
  const CREAM = "#e8d2a0";
  const PALE = "#f4e8c2";
  const OCHRE = "#b8793b";
  const RED = "#a84c43";
  const GOLD = "#d6a34d";
  const CLOUD = "#d9c6a0";
  const CLOUD_DARK = "#8b6f69";
  const EYE = "#f0bb58";

  const V = (x: number, y: number, z: number) => [x, y, z] as [number, number, number];

  // ---------------------------------------------------------------------------
  // Skeleton: a low, heavy spirit with a raised head and sturdy planted legs.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.72, -0.18],
    dir: [0, 0.05, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [-0.02, 0.78, -0.62],
      [0, 0.82, -0.28],
      [0, 0.88, 0.08],
      [0, 0.96, 0.38],
    ]),
    {
      parent: hips,
      names: ["spineRear", "spineMid", "spineFront", "shoulders"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.96, 0.38],
      [0, 1.08, 0.54],
      [0, 1.23, 0.67],
      [0, 1.34, 0.76],
    ]),
    {
      parent: spine.tip!,
      names: ["neckBase", "neckMid", "neckTop", "headRoot"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 1.34, 0.76],
    dir: [0, -0.03, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.27, 0.83],
    dir: [0, -0.22, 1],
    role: "jaw",
    group: "face",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.78, -0.62],
      [0, 0.76, -0.84],
      [0, 0.72, -1.04],
      [0, 0.68, -1.22],
      [0, 0.69, -1.37],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
      role: "tail",
    },
  );

  const legData = [
    { s: 1, name: "legL", front: false, hip: [0.25, 0.77, -0.34], foot: [0.25, 0.16, -0.39] },
    { s: -1, name: "legR", front: false, hip: [-0.25, 0.77, -0.34], foot: [-0.25, 0.16, -0.39] },
    { s: 1, name: "legFL", front: true, hip: [0.24, 0.88, 0.29], foot: [0.24, 0.16, 0.31] },
    { s: -1, name: "legFR", front: true, hip: [-0.24, 0.88, 0.29], foot: [-0.24, 0.16, 0.31] },
  ] as const;

  const legs: { chain: ReturnType<typeof b.chain>; side: number; front: boolean }[] = [];

  for (const data of legData) {
    const points = limb(
      data.hip,
      data.foot,
      [0.27, 0.25, 0.19],
      [
        [0, 0, data.front ? 1 : -1],
        [0, 0, data.front ? -1 : 1],
      ],
      { sole: [0, 1, 0] },
    );
    const chain = b.chain(data.name, points, {
      parent: data.front ? spine.joints[2] : spine.joints[0],
      names: [
        `${data.name}_hip`,
        `${data.name}_knee`,
        `${data.name}_ankle`,
        `${data.name}_hoof`,
      ],
      role: "leg",
      contact: data.foot,
    });
    legs.push({ chain, side: data.s, front: data.front });
  }

  // ---------------------------------------------------------------------------
  // Main body: angular, broad, and slightly flattened like a carved print block.
  // ---------------------------------------------------------------------------

  const body = b.sweep(spine, (t) => 0.28 - 0.045 * t, {
    color: INDIGO,
    sides: 8,
    section: "circle",
    name: "heavy_indigo_body",
    group: "body",
  });

  // Belly and shoulder color blocks, using broad sectors rather than smooth fur.
  b.sweep(spine, (t) => 0.28 - 0.045 * t, {
    color: CREAM,
    sides: 8,
    section: "circle",
    sectors: [[112, 248, CREAM, 0.0, 0.82]],
    name: "cream_belly",
    group: "markings",
  });

  // Black-blue neck rising from the body.
  const neckTube = b.sweep(neck, [0.22, 0.16], {
    color: NIGHT,
    sides: 8,
    section: "circle",
    name: "dark_neck",
    group: "body",
  });

  // Legs are chunky, with pale lower socks and dark upper limbs.
  for (const leg of legs) {
    b.sweep(leg.chain, (t) => (t > 0.55 ? 0.105 : 0.145), {
      color: NIGHT,
      sides: 6,
      section: "circle",
      name: leg.chain.name + "_dark",
      role: "leg",
    });
    b.sweep(leg.chain, (t) => (t > 0.48 ? 0.105 : 0.001), {
      color: CREAM,
      sides: 6,
      section: "circle",
      from: 0.48,
      name: leg.chain.name + "_cream_sock",
      role: "leg",
    });

    const foot = leg.chain.at(1);
    b.part(new THREE.BoxGeometry(0.20, 0.09, 0.25), INK, {
      at: foot.at,
      bone: leg.chain.tip!,
      name: leg.chain.name + "_hoof",
      group: "feet",
    });
  }

  // Broad cream shoulder patches, deliberately simple like stamped wood shapes.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.19, 8, 5), CREAM, {
      at: [s * 0.22, 0.94, 0.31],
      bone: spine.joints[2],
      scale: [0.72, 0.9, 0.48],
      name: `shoulder_patch_${s}`,
      group: "markings",
    });
  }

  // ---------------------------------------------------------------------------
  // Head and face: the identity cue is the long, soft, tapir-like snout.
  // ---------------------------------------------------------------------------

  const skull = b.part(new THREE.SphereGeometry(0.27, 10, 7), NIGHT, {
    at: [0, 1.34, 0.79],
    bone: head,
    scale: [1.02, 0.91, 1.08],
    name: "round_spirit_skull",
    group: "head",
  });

  const forehead = b.part(new THREE.SphereGeometry(0.23, 8, 6), INDIGO, {
    at: [0, 1.40, 0.91],
    bone: head,
    scale: [1.12, 0.86, 1.20],
    name: "blue_forehead",
    group: "head",
  });

  const upperSnout = b.sweep(
    catmull([
      [0, 1.31, 0.91],
      [0, 1.27, 1.08],
      [0, 1.22, 1.28],
      [0, 1.18, 1.45],
    ]),
    [0.18, 0.12],
    {
      color: CREAM,
      sides: 8,
      section: "circle",
      bone: head,
      name: "long_cream_muzzle",
      group: "face",
    },
  );

  const lowerSnout = b.sweep(
    catmull([
      [0, 1.25, 0.94],
      [0, 1.20, 1.12],
      [0, 1.15, 1.29],
      [0, 1.12, 1.40],
    ]),
    [0.15, 0.095],
    {
      color: PALE,
      sides: 8,
      section: "circle",
      bone: jaw,
      name: "lower_jaw",
      group: "jaw",
    },
  );

  // Nose, nostrils, and a carved red mouth line.
  b.part(new THREE.SphereGeometry(0.105, 8, 5), INK, {
    at: [0, 1.17, 1.48],
    bone: jaw,
    scale: [1.18, 0.72, 0.65],
    name: "soft_black_nose",
    group: "face",
  });

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.026, 6, 4), PALE, {
      at: [s * 0.045, 1.18, 1.548],
      bone: jaw,
      name: `nostril_${s}`,
      group: "face",
    });
  }

  b.sweep(
    polyline([
      [-0.11, 1.12, 1.43],
      [0, 1.095, 1.46],
      [0.11, 1.12, 1.43],
    ]),
    0.012,
    {
      color: RED,
      sides: 5,
      section: "circle",
      bone: jaw,
      name: "painted_mouth",
      group: "face",
    },
  );

  // Eyes with strong dark sockets and warm amber inset.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.082, 8, 5), INK, {
      at: [s * 0.145, 1.39, 1.00],
      bone: head,
      scale: [1, 0.90, 0.50],
      name: `eye_socket_${s}`,
      group: "face",
    });
    b.part(new THREE.SphereGeometry(0.050, 8, 5), EYE, {
      at: [s * 0.145, 1.39, 1.035],
      bone: head,
      scale: [0.82, 1.0, 0.38],
      name: `amber_eye_${s}`,
      group: "face",
    });
    b.part(new THREE.SphereGeometry(0.018, 6, 4), INK, {
      at: [s * 0.145, 1.39, 1.062],
      bone: head,
      scale: [0.55, 1.25, 0.4],
      name: `eye_pupil_${s}`,
      group: "face",
    });
    b.part(new THREE.SphereGeometry(0.012, 5, 3), PALE, {
      at: [s * 0.128, 1.42, 1.079],
      bone: head,
      name: `eye_glint_${s}`,
      group: "face",
    });
  }

  // Ears: broad pointed slabs, cream inner faces and dark outer rims.
  const earOutline: [number, number, "sharp"][] = [
    [-0.15, -0.08, "sharp"],
    [-0.13, 0.14, "sharp"],
    [-0.01, 0.34, "sharp"],
    [0.12, 0.12, "sharp"],
    [0.15, -0.10, "sharp"],
  ];

  for (const s of [1, -1]) {
    const ear = b.extrude(earOutline, {
      at: [s * 0.19, 1.54, 0.72],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.065,
      bevel: 0.012,
      color: INK,
      bone: head,
      name: `pointed_ear_${s}`,
      group: "head",
    });

    b.extrude(
      [
        [-0.09, -0.035, "sharp"],
        [-0.075, 0.105, "sharp"],
        [-0.005, 0.23, "sharp"],
        [0.075, 0.09, "sharp"],
        [0.09, -0.04, "sharp"],
      ],
      {
        at: [s * 0.19, 1.54, 0.754],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        bevel: 0.004,
        color: OCHRE,
        bone: head,
        name: `ochre_inner_ear_${s}`,
        group: "markings",
      },
    );

    // A small dark ear-tip wedge, a graphic woodblock accent.
    b.part(new THREE.ConeGeometry(0.065, 0.14, 5), NIGHT, {
      at: [s * 0.19, 1.81, 0.72],
      bone: head,
      name: `ear_tip_${s}`,
      group: "head",
    });
  }

  // Angular cheek ruffs make the spirit silhouette more mythic.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0, "sharp"],
        [0.16, 0.03, "sharp"],
        [0.23, 0.15, "sharp"],
        [0.17, 0.22, "sharp"],
        [0.03, 0.18, "sharp"],
      ],
      {
        at: [s * 0.18, 1.30, 0.82],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.035,
        bevel: 0.005,
        color: BLUE,
        bone: head,
        name: `cheek_ruff_${s}`,
        group: "head",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Tail: short, tapered, with an ink-dark tip.
  // ---------------------------------------------------------------------------

  b.sweep(tail, (t) => 0.105 * (1 - t) + 0.025, {
    color: INDIGO,
    sides: 7,
    section: "circle",
    bands: [
      [0.72, INK],
      [1, INK],
    ],
    name: "tapered_tail",
    role: "tail",
  });

  // ---------------------------------------------------------------------------
  // Mane and dorsal crest: overlapping carved blades instead of fine fur.
  // ---------------------------------------------------------------------------

  const manePath = catmull([
    [0, 1.05, 0.35],
    [0, 1.18, 0.45],
    [0, 1.35, 0.58],
    [0, 1.48, 0.70],
    [0, 1.58, 0.79],
  ]);

  b.sweep(manePath, [0.105, 0.025], {
    color: INK,
    sides: 6,
    section: "circle",
    bone: neck.joints[1],
    name: "black_mane_ridge",
    group: "mane",
  });

  const crestOutline: [number, number, "sharp"][] = [
    [0, 0, "sharp"],
    [0.13, 0.02, "sharp"],
    [0.10, 0.18, "sharp"],
    [0.02, 0.37, "sharp"],
    [-0.06, 0.18, "sharp"],
  ];

  for (let i = 0; i < 5; i++) {
    const p = [0, 1.02 + i * 0.105, 0.40 + i * 0.09] as [number, number, number];
    b.extrude(crestOutline, {
      at: p,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.004,
      color: i % 2 ? BLUE : NIGHT,
      bone: neck.joints[Math.min(3, Math.floor(i * 0.8))],
      name: `mane_blade_${i}`,
      group: "mane",
    });
  }

  // ---------------------------------------------------------------------------
  // Ukiyo-e ornament: saddle-like cloud markings and a forehead crest.
  // ---------------------------------------------------------------------------

  const cloudMark = (s: number, z: number, y: number, scale: number, name: string) => {
    b.sweep(
      catmull([
        [s * 0.24, y, z - 0.13 * scale],
        [s * 0.36, y + 0.07 * scale, z],
        [s * 0.25, y + 0.12 * scale, z + 0.13 * scale],
        [s * 0.08, y + 0.07 * scale, z + 0.08 * scale],
        [s * 0.12, y, z - 0.04 * scale],
      ]),
      0.018 * scale,
      {
        color: GOLD,
        sides: 6,
        section: "circle",
        bone: spine.joints[1],
        name,
        group: "ornament",
      },
    );
  };

  cloudMark(1, -0.20, 0.95, 1, "left_cloud_mark");
  cloudMark(-1, -0.20, 0.95, 1, "right_cloud_mark");
  cloudMark(1, 0.08, 1.00, 0.72, "left_cloud_mark_small");
  cloudMark(-1, 0.08, 1.00, 0.72, "right_cloud_mark_small");

  // Forehead jewel / dream seal.
  b.extrude(
    [
      [0, 0, "sharp"],
      [0.07, 0.07, "sharp"],
      [0, 0.16, "sharp"],
      [-0.07, 0.07, "sharp"],
    ],
    {
      at: [0, 1.49, 1.015],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.004,
      color: RED,
      bone: head,
      name: "dream_seal",
      group: "ornament",
    },
  );

  // Golden neck collar, made as a small faceted ring around the raised neck.
  const collarPath = b.surface(neckTube).loop(neck.joints[1], { lift: 0.008 });
  b.sweep(collarPath, 0.018, {
    color: GOLD,
    sides: 6,
    section: "circle",
    name: "golden_neck_collar",
    group: "ornament",
  });

  // ---------------------------------------------------------------------------
  // Dream wisps: staged close to the body, so they frame the baku without
  // becoming unrelated scenery.
  // ---------------------------------------------------------------------------

  const wisp = (side: number, y: number, z: number, size: number, n: string) => {
    const path = catmull([
      [side * 0.27, y, z],
      [side * 0.42, y + 0.04 * size, z + 0.05 * size],
      [side * 0.48, y + 0.15 * size, z + 0.18 * size],
      [side * 0.36, y + 0.25 * size, z + 0.28 * size],
      [side * 0.19, y + 0.21 * size, z + 0.35 * size],
      [side * 0.15, y + 0.10 * size, z + 0.27 * size],
    ]);
    b.sweep(path, [0.035 * size, 0.008], {
      color: CLOUD,
      sides: 6,
      section: "circle",
      caps: { start: "round", end: "point" },
      name: n,
      group: "dream",
    });
    b.sweep(path.slice(0.35, 0.8), [0.013 * size, 0.004], {
      color: CLOUD_DARK,
      sides: 5,
      section: "circle",
      caps: "point",
      name: n + "_ink",
      group: "dream",
    });
  };

  wisp(1, 0.72, 0.16, 1.0, "dream_wisp_left");
  wisp(-1, 0.72, 0.16, 1.0, "dream_wisp_right");
  wisp(1, 0.50, -0.35, 0.72, "dream_wisp_low_left");
  wisp(-1, 0.50, -0.35, 0.72, "dream_wisp_low_right");

  // Small floating dream motes, kept near the spirit's silhouette.
  const motePoints = [
    [0.43, 1.05, 0.72],
    [-0.43, 1.10, 0.67],
    [0.40, 0.68, 0.06],
    [-0.40, 0.68, 0.06],
    [0.20, 1.68, 0.44],
    [-0.20, 1.68, 0.44],
  ] as const;

  for (let i = 0; i < motePoints.length; i++) {
    const p = motePoints[i];
    b.part(new THREE.OctahedronGeometry(0.035 + (i % 2) * 0.012, 0), i % 2 ? GOLD : PALE, {
      at: p,
      name: `dream_mote_${i}`,
      group: "dream",
    });
  }

  // A few carved bands on the feet make the grounded silhouette read clearly.
  for (const leg of legs) {
    const ankle = leg.chain.at(0.62);
    b.ring(
      frame(ankle.at, ankle.tangent),
      { count: 6, radius: 0.103, fromDeg: 0, toDeg: 360 },
      (item) =>
        b.part(new THREE.BoxGeometry(0.025, 0.028, 0.012), GOLD, {
          frame: item,
          bone: ankle.bone,
          name: leg.chain.name + "_ankle_rune",
          group: "ornament",
        }),
    );
  }

  // A tiny open jaw pose gives the dream-eater a readable, welcoming expression.
  b.pose(jaw, { axis: [1, 0, 0], deg: -7 });

  return b.root;
}
