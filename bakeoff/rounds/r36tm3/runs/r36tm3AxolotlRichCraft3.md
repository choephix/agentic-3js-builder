```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  svg,
} from "agentic-3js-builder";
import {
  animeEye,
  cel,
  furEdge,
  INK,
} from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "Chibi Axolotl",
  description: "A chunky, smiling axolotl with luminous eyes, a soft belly, a paddle tail, and six frilly pink external gills.",
};

export default function build() {
  const b = createBuilder({ name: "chibi-axolotl", detail: 1 });

  const INK_SOFT = "#3a1e42";
  const COAT_LIT = "#d991b7";
  const COAT_SHADOW = "#a94f85";
  const BELLY_LIT = "#fff0df";
  const BELLY_SHADOW = "#f4c5c9";
  const GILL_LIT = "#ff91bd";
  const GILL_SHADOW = "#d94e91";
  const GILL_TIP = "#ffd0e5";
  const MOUTH = "#7f315d";
  const MOUTH_SHADOW = "#4c1e43";
  const BLACK = "#171225";
  const WHITE = "#fffdfc";
  const BLUSH = "#f47d9e";
  const WATER_BLUE = "#8fd7d7";

  const coat = cel(
    furEdge(COAT_LIT, BELLY_LIT, {
      level: -0.05,
      teeth: 0.12,
      period: 0.085,
      along: [0, 0, 1],
      ink: undefined,
    }),
    COAT_SHADOW,
    { threshold: 0.03 },
  );

  const belly = cel(BELLY_LIT, BELLY_SHADOW, {
    threshold: 0.02,
  });

  const gillPaint = cel(GILL_LIT, GILL_SHADOW, {
    threshold: -0.05,
  });

  const gillTipPaint = cel(GILL_TIP, "#f18ab8", {
    threshold: 0,
  });

  const headPink = cel("#e39abb", "#b7578b", {
    threshold: 0.02,
  });

  const eyeTexture = animeEye({
    iris: "#55d9d0",
    irisLight: "#d8fff4",
    irisDark: "#287c9b",
    blush: false,
    brow: false,
    size: 384,
  });

  const cheekTexture = svg(
    `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#7b315e" stroke-width="5" stroke-linecap="round" opacity=".85">
        <path d="M12 37 Q28 27 43 37"/>
        <path d="M85 37 Q100 27 116 37"/>
      </g>
      <g fill="#ffabc4" opacity=".82">
        <circle cx="25" cy="46" r="4"/>
        <circle cx="39" cy="43" r="3"/>
        <circle cx="103" cy="43" r="3"/>
        <circle cx="116" cy="46" r="4"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const gillTexture = svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 124 C27 95 29 65 31 7" fill="none" stroke="#fff0f7" stroke-width="4" opacity=".9"/>
      <path d="M30 88 C17 78 8 79 3 84 M30 72 C16 63 9 63 4 68 M30 55 C18 47 10 48 5 53 M31 39 C20 31 14 32 8 37 M31 23 C23 17 17 18 12 22"
        fill="none" stroke="#ffd8e8" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // Skeleton first: one central body root, a spine, four planted limbs, tail,
  // head, jaw hinge, and six independent gill fans.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.62, 0],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 0.62, -0.62],
    [0, 0.67, -0.28],
    [0, 0.70, 0.12],
    [0, 0.76, 0.48],
    [0, 0.82, 0.70],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spineTail", "spineRear", "spineMid", "spineChest", "spineNeck"],
    role: "spine",
  });

  const tailPath = catmull([
    [0, 0.62, -0.45],
    [0, 0.53, -0.78],
    [0, 0.39, -1.10],
    [0, 0.24, -1.38],
    [0, 0.15, -1.60],
  ]);

  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
    role: "tail",
  });

  const neckBone = spine.tip ?? spine.joints[spine.joints.length - 1];

  const head = b.joint("head", {
    parent: neckBone,
    at: [0, 0.94, 0.82],
    dir: [0, 0.04, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.84, 1.05],
    dir: [0, -0.08, 1],
    role: "jaw",
    group: "head",
  });

  const upperJaw = b.joint("upperJaw", {
    parent: head,
    at: [0, 0.92, 1.08],
    dir: [0, 0, 1],
    role: "hinge",
    group: "head",
  });

  const legData = [
    {
      side: "L",
      x: 0.245,
      z: 0.30,
      target: [0.30, 0.16, 0.43] as [number, number, number],
      names: ["hipL", "kneeL", "ankleL", "footL"],
    },
    {
      side: "R",
      x: -0.245,
      z: 0.30,
      target: [-0.30, 0.16, 0.43] as [number, number, number],
      names: ["hipR", "kneeR", "ankleR", "footR"],
    },
    {
      side: "L",
      x: 0.235,
      z: -0.27,
      target: [0.31, 0.16, -0.42] as [number, number, number],
      names: ["hipBackL", "kneeBackL", "ankleBackL", "footBackL"],
    },
    {
      side: "R",
      x: -0.235,
      z: -0.27,
      target: [-0.31, 0.16, -0.42] as [number, number, number],
      names: ["hipBackR", "kneeBackR", "ankleBackR", "footBackR"],
    },
  ];

  const legs: Array<{
    side: string;
    chain: ReturnType<typeof b.chain>;
    points: THREE.Vector3[];
  }> = [];

  for (const leg of legData) {
    const points = limb(
      [leg.x, 0.59, leg.z],
      leg.target,
      [0.22, 0.19, 0.18],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
      { sole: [0, 1, 0] },
    );

    const chain = b.chain(`leg${leg.names[0]}`, points, {
      parent: hips,
      names: leg.names,
      role: "leg",
      contact: leg.target,
    });

    legs.push({ side: leg.side, chain, points });
  }

  const gillChains: Array<{
    side: number;
    index: number;
    chain: ReturnType<typeof b.chain>;
    points: THREE.Vector3[];
  }> = [];

  for (const side of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const z = 0.78 - i * 0.065;
      const y = 1.06 - i * 0.045;
      const points = catmull([
        [side * 0.285, y, z],
        [side * (0.40 + i * 0.012), y + 0.015, z - 0.025],
        [side * (0.53 + i * 0.018), y + 0.055 - i * 0.01, z - 0.04],
      ]);

      const chain = b.chain(`gill${side > 0 ? "L" : "R"}${i + 1}`, points, {
        parent: head,
        names: [
          `gill${side > 0 ? "L" : "R"}${i + 1}Base`,
          `gill${side > 0 ? "L" : "R"}${i + 1}Mid`,
          `gill${side > 0 ? "L" : "R"}${i + 1}Tip`,
        ],
        role: "fan",
        group: "gills",
      });

      gillChains.push({ side, index: i, chain, points });
    }
  }

  // A slightly open resting smile makes the jaw a readable separate chain.
  b.pose(jaw, { axis: [1, 0, 0], deg: 9 });

  // ---------------------------------------------------------------------------
  // Body and tail.
  // ---------------------------------------------------------------------------

  const body = b.sweep(spine, (t) => 0.235 + 0.035 * Math.sin(t * Math.PI), {
    color: coat,
    section: { ngon: 8 },
    sides: 8,
    caps: "round",
    group: "body",
    name: "soft-body",
  });

  b.sweep(tail, (t) => 0.15 * (1 - t) + 0.035, {
    color: coat,
    section: { ngon: 7 },
    caps: "round",
    group: "tail",
    name: "tapered-tail",
  });

  // Pale belly as a broad low-poly inset volume, rather than a floating patch.
  b.part(
    new THREE.SphereGeometry(1, 12, 8),
    belly,
    {
      bone: hips,
      at: [0, 0.59, 0.18],
      scale: [0.22, 0.18, 0.39],
      group: "belly",
      name: "cream-belly",
    },
  );

  // Vertical tail fin: a chunky silhouette with a pointed paddle end.
  b.extrude(
    [
      [0, 0],
      [0.22, 0.05],
      [0.57, 0.15],
      [0.92, 0.24],
      [1.18, 0.15],
      [1.33, 0.02],
      [1.15, -0.07],
      [0.75, -0.10],
      [0.32, -0.06],
    ],
    {
      at: [0, 0.27, -0.58],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.028,
      bevel: 0.008,
      smoothing: 1,
      color: gillPaint,
      bone: tail.joints[0],
      group: "tail",
      name: "paddle-tail-fin",
    },
  );

  // Tail fin ribs.
  for (let i = 0; i < 5; i++) {
    const z = -0.72 - i * 0.15;
    b.rod(
      [0, 0.29 + i * 0.015, z],
      [0, 0.44 + i * 0.045, z - 0.04],
      0.008,
      {
        color: gillTipPaint,
        bone: tail.joints[Math.min(i, tail.joints.length - 1)],
        group: "tail",
        name: `tail-fin-rib-${i}`,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Four stubby legs and broad little feet.
  // ---------------------------------------------------------------------------

  for (let i = 0; i < legs.length; i++) {
    const entry = legs[i];
    b.sweep(entry.chain, (t) => 0.075 - t * 0.025, {
      color: coat,
      section: { ngon: 6 },
      caps: "round",
      group: "legs",
      name: `leg-tube-${i}`,
    });

    const tip = entry.chain.tip ?? entry.chain.joints[entry.chain.joints.length - 1];
    const p = entry.points[entry.points.length - 1];

    b.part(
      new THREE.SphereGeometry(1, 8, 6),
      coat,
      {
        bone: tip,
        at: p,
        scale: [0.105, 0.055, 0.14],
        group: "feet",
        name: `webbed-foot-${i}`,
      },
    );

    const sign = p.x > 0 ? 1 : -1;
    for (let toe = -1; toe <= 1; toe++) {
      const toeStart: [number, number, number] = [
        p.x + toe * 0.035,
        p.y + 0.005,
        p.z + 0.07,
      ];
      const toeEnd: [number, number, number] = [
        p.x + toe * 0.055 + sign * 0.018,
        0.145,
        p.z + 0.135 + Math.abs(toe) * 0.012,
      ];
      b.rod(toeStart, toeEnd, 0.014, {
        color: belly,
        bone: tip,
        group: "digits",
        name: `toe-${i}-${toe}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Giant chibi head, cheeks, muzzle, eyes, and separate mouth pieces.
  // ---------------------------------------------------------------------------

  const skull = b.part(
    new THREE.SphereGeometry(1, 16, 12),
    headPink,
    {
      bone: head,
      at: [0, 1.00, 0.84],
      scale: [0.405, 0.35, 0.34],
      group: "head",
      name: "round-skull",
    },
  );

  const faceSurface = b.surface(skull);

  for (const side of [1, -1]) {
    const eyePoint = [side * 0.145, 1.055, 1.135] as [number, number, number];

    b.decal(faceSurface, eyeTexture, {
      at: eyePoint,
      dir: [0, 0.02, 1],
      up: [0, 1, 0],
      size: [0.145, 0.19],
      lift: 0.004,
      segments: 8,
      mirror: side > 0,
      bone: head,
      group: "face",
      name: `sparkle-eye-${side > 0 ? "L" : "R"}`,
    });
  }

  // One small cheek graphic keeps the front expressive without adding hard-to-place geometry.
  b.decal(skull, cheekTexture, {
    at: [0, 0.94, 1.164],
    dir: [0, 0, 1],
    up: [0, 1, 0],
    size: [0.31, 0.12],
    lift: 0.003,
    segments: 6,
    bone: head,
    group: "face",
    name: "rosy-cheeks",
  });

  b.part(
    new THREE.SphereGeometry(1, 10, 7),
    belly,
    {
      bone: head,
      at: [0, 0.91, 1.115],
      scale: [0.22, 0.125, 0.12],
      group: "face",
      name: "cream-muzzle",
    },
  );

  b.part(
    new THREE.SphereGeometry(1, 8, 6),
    INK_SOFT,
    {
      bone: upperJaw,
      at: [0, 0.885, 1.214],
      scale: [0.13, 0.027, 0.028],
      group: "mouth",
      name: "upper-smile",
    },
  );

  b.part(
    new THREE.SphereGeometry(1, 8, 6),
    MOUTH,
    {
      bone: jaw,
      at: [0, 0.846, 1.205],
      scale: [0.14, 0.035, 0.048],
      group: "mouth",
      name: "lower-mouth",
    },
  );

  b.part(
    new THREE.SphereGeometry(1, 8, 6),
    "#f8a7c5",
    {
      bone: jaw,
      at: [0, 0.855, 1.238],
      scale: [0.055, 0.017, 0.018],
      group: "mouth",
      name: "tiny-tongue",
    },
  );

  // Two subtle nostrils sit above the muzzle, not in front of the eyes.
  for (const side of [1, -1]) {
    b.part(
      new THREE.SphereGeometry(1, 6, 4),
      INK_SOFT,
      {
        bone: head,
        at: [side * 0.052, 1.035, 1.177],
        scale: [0.014, 0.009, 0.007],
        group: "face",
        name: `nostril-${side > 0 ? "L" : "R"}`,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Frilly pink external gills: each stalk gets a central stem, translucent-ish
  // low-poly blades, branching quills, and a pale patterned face.
  // ---------------------------------------------------------------------------

  for (const gill of gillChains) {
    const side = gill.side;
    const i = gill.index;
    const chain = gill.chain;
    const tip = chain.tip ?? chain.joints[chain.joints.length - 1];
    const end = gill.points[gill.points.length - 1];

    b.sweep(chain, (t) => 0.025 - t * 0.012, {
      color: gillPaint,
      section: { ngon: 6 },
      caps: "round",
      group: "gills",
      name: `gill-stem-${side > 0 ? "L" : "R"}-${i}`,
    });

    const outward = side;
    const base = gill.points[0];

    // Broad central blade, mirrored with the side so the face points outward.
    const bladeWidth = 0.11 - i * 0.012;
    const bladeHeight = 0.19 - i * 0.012;

    const blade = b.extrude(
      [
        [0, 0],
        [outward * bladeWidth * 0.35, bladeHeight * 0.22],
        [outward * bladeWidth, bladeHeight * 0.54],
        [outward * bladeWidth * 0.68, bladeHeight * 0.74],
        [outward * bladeWidth * 0.98, bladeHeight * 0.95],
        [outward * bladeWidth * 0.40, bladeHeight * 0.87],
        [outward * bladeWidth * 0.12, bladeHeight],
        [0, bladeHeight * 0.70],
      ],
      {
        at: [base[0], base[1] - 0.015, base[2]],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.014,
        bevel: 0.004,
        smoothing: 1,
        color: gillPaint,
        bone: head,
        group: "gills",
        name: `frill-blade-${side > 0 ? "L" : "R"}-${i}`,
      },
    );

    // A pale inner face makes the blade read as a feathery fan at a distance.
    b.part(
      new THREE.PlaneGeometry(bladeWidth * 0.72, bladeHeight * 0.56),
      "#fff0f7",
      {
        bone: head,
        at: [base[0] + outward * bladeWidth * 0.34, base[1] + bladeHeight * 0.38, base[2] + 0.009],
        dir: [0, 0, side],
        axis: "z",
        texture: gillTexture,
        scale: [1, 1, 1],
        group: "gills",
        name: `frill-pattern-${side > 0 ? "L" : "R"}-${i}`,
      },
    );

    // Three feathery lateral branches.
    for (let branch = 0; branch < 3; branch++) {
      const t = 0.28 + branch * 0.23;
      const stem = chain.at(t);
      const branchEnd: [number, number, number] = [
        stem.at.x + outward * (0.10 - branch * 0.012),
        stem.at.y + 0.055 + branch * 0.015,
        stem.at.z - 0.015 - branch * 0.018,
      ];

      b.spike(stem, branchEnd, null, 0.012, {
        color: gillTipPaint,
        bone: stem.bone,
        caps: { start: "round", end: "point" },
        group: "gills",
        name: `gill-ray-${side > 0 ? "L" : "R"}-${i}-${branch}`,
      });

      b.part(
        new THREE.SphereGeometry(1, 6, 4),
        gillTipPaint,
        {
          bone: tip,
          at: branchEnd,
          scale: [0.022, 0.022, 0.022],
          group: "gills",
          name: `gill-soft-tip-${side > 0 ? "L" : "R"}-${i}-${branch}`,
        },
      );
    }

    // Small bright cap at the end of each main stalk.
    b.part(
      new THREE.SphereGeometry(1, 7, 5),
      gillTipPaint,
      {
        bone: tip,
        at: end,
        scale: [0.035, 0.035, 0.035],
        group: "gills",
        name: `gill-tip-${side > 0 ? "L" : "R"}-${i}`,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // A few characteristic axolotl freckles and water-colored toe pads.
  // ---------------------------------------------------------------------------

  for (const side of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      b.part(
        new THREE.SphereGeometry(1, 6, 4),
        "#bd5d91",
        {
          bone: head,
          at: [side * (0.25 + i * 0.025), 0.985 + (i % 2) * 0.026, 1.126],
          scale: [0.012, 0.012, 0.008],
          group: "face",
          name: `freckle-${side > 0 ? "L" : "R"}-${i}`,
        },
      );
    }
  }

  for (let i = 0; i < legs.length; i++) {
    const p = legs[i].points[legs[i].points.length - 1];
    b.part(
      new THREE.SphereGeometry(1, 7, 5),
      WATER_BLUE,
      {
        bone: legs[i].chain.tip ?? legs[i].chain.joints[legs[i].chain.joints.length - 1],
        at: [p.x, p.y + 0.006, p.z + 0.095],
        scale: [0.045, 0.012, 0.022],
        group: "feet",
        name: `cool-toe-pad-${i}`,
      },
    );
  }

  return b.root;
}
```