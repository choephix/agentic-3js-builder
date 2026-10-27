import * as THREE from "three";
import {
  createBuilder,
  catmull,
  spiral,
  paint,
  svg,
  frame,
  rng,
} from "../../../../src/index";
import { cel, furEdge, animeEye, INK } from "../../../../kits/toon";

export const meta = {
  name: "Baku — dream-eating tapir spirit",
  description:
    "A chunky ukiyo-e woodblock baku with an indigo-striped body, cream trunk, tusks, broad ears, carved mane, clawed feet, and curling dream wisps.",
};

export default function build() {
  const b = createBuilder({ name: "baku", detail: 1, paintSize: 2048 });

  const INKWOOD = "#21172b";
  const INDIGO = "#243b63";
  const DEEP_INDIGO = "#172847";
  const RUSSET = "#a9583c";
  const RUSSET_DARK = "#713546";
  const CREAM = "#f1dcae";
  const PALE = "#fff0c5";
  const OCHRE = "#d08b45";
  const RED = "#a7353d";
  const BLACK = "#160f1b";
  const CLOUD = "#a9c5c4";
  const CLOUD_DARK = "#5d7890";
  const CLAW = "#332331";

  const coat = furEdge(
    cel(INDIGO, DEEP_INDIGO, { threshold: 0.16 }),
    cel(RUSSET, RUSSET_DARK, { threshold: 0.1 }),
    {
      level: -0.18,
      teeth: 0.18,
      period: 0.075,
      along: [0, 0, 1],
      ink: INKWOOD,
      inkWidth: 0.035,
    },
  );

  const belly = cel(CREAM, "#c28b75", { threshold: 0.2 });
  const nosePaint = cel(CREAM, "#b87568", { threshold: 0.12 });
  const manePaint = cel(RUSSET, RUSSET_DARK, { threshold: 0.12 });
  const darkPaint = cel(DEEP_INDIGO, "#111a32", { threshold: 0.05 });

  const stripePaint = paint((p, n, _s) => {
    const phase = Math.sin(p.z * 21 + p.y * 3.4) * 0.04;
    const stripe = Math.sin(p.z * 18 + phase) > 0.28;
    const upper = n.y > -0.18;
    if (!upper) return belly;
    return stripe ? darkPaint : coat;
  });

  // ---------------------------------------------------------------------------
  // Skeleton: one rooted pelvis, then body, neck, head, jaw, trunk, limbs, tail.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.91, -0.12],
    dir: [0, 0, 1],
    role: "spine",
    group: "body",
  });

  const spinePath = catmull([
    [0, 0.92, -0.52],
    [0, 0.98, -0.26],
    [0, 1.02, 0.06],
    [0, 1.06, 0.34],
    [0, 1.12, 0.54],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    count: 5,
    names: ["spine1", "spine2", "chest", "shoulder", "withers"],
    role: "spine",
    group: "body",
  });

  const neckPath = catmull([
    spine.at(1).at,
    [0, 1.22, 0.61],
    [0, 1.38, 0.68],
    [0, 1.49, 0.72],
  ]);

  const neck = b.chain("neck", neckPath, {
    parent: spine.joints[4],
    count: 3,
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
    group: "head",
  });

  const head = b.joint("head", {
    parent: neck.joints[2],
    at: [0, 1.48, 0.72],
    dir: [0, 0.02, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.34, 0.77],
    dir: [0, -0.22, 1],
    role: "jaw",
    group: "face",
  });

  const trunkPath = catmull([
    [0, 1.41, 0.78],
    [0, 1.39, 0.98],
    [0, 1.33, 1.15],
    [0, 1.19, 1.28],
    [0, 1.09, 1.31],
  ]);

  const trunk = b.chain("trunk", trunkPath, {
    parent: head,
    count: 4,
    names: ["trunk1", "trunk2", "trunk3", "trunkTip"],
    role: "jaw",
    group: "face",
  });

  // Four grounded, sturdy tapir legs.
  const legData = [
    { s: 1, z: -0.35, front: false, names: ["hipL", "kneeL", "ankleL", "footL"] },
    { s: -1, z: -0.35, front: false, names: ["hipR", "kneeR", "ankleR", "footR"] },
    { s: 1, z: 0.39, front: true, names: ["shoulderL", "elbowL", "wristL", "hoofL"] },
    { s: -1, z: 0.39, front: true, names: ["shoulderR", "elbowR", "wristR", "hoofR"] },
  ];

  const legs: { chain: ReturnType<typeof b.chain>; s: number; front: boolean }[] = [];
  for (const d of legData) {
    const root: [number, number, number] = [
      d.s * (d.front ? 0.24 : 0.27),
      d.front ? 1.02 : 0.9,
      d.z,
    ];
    const knee: [number, number, number] = [
      d.s * (d.front ? 0.28 : 0.31),
      d.front ? 0.66 : 0.59,
      d.z + (d.front ? 0.035 : -0.025),
    ];
    const ankle: [number, number, number] = [
      d.s * (d.front ? 0.29 : 0.32),
      0.25,
      d.z + (d.front ? 0.07 : -0.06),
    ];
    const foot: [number, number, number] = [
      d.s * (d.front ? 0.3 : 0.34),
      0.12,
      d.z + (d.front ? 0.13 : -0.12),
    ];
    const chain = b.chain(
      d.front ? `arm${d.s > 0 ? "L" : "R"}` : `leg${d.s > 0 ? "L" : "R"}`,
      [root, knee, ankle, foot],
      {
        parent: d.front ? spine.joints[3] : hips,
        names: d.names,
        role: "leg",
        group: "limbs",
        contact: foot,
      },
    );
    legs.push({ chain, s: d.s, front: d.front });
  }

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.92, -0.54],
      [0, 0.84, -0.72],
      [0, 0.78, -0.91],
      [0, 0.72, -1.02],
    ]),
    {
      parent: hips,
      count: 3,
      names: ["tail1", "tail2", "tail3"],
      role: "tail",
      group: "body",
    },
  );

  // ---------------------------------------------------------------------------
  // Main sculptural masses.
  // ---------------------------------------------------------------------------

  const body = b.sweep(spine, (t) => {
    if (t < 0.22) return 0.27;
    if (t < 0.72) return 0.33;
    return 0.28;
  }, {
    bone: spine,
    color: stripePaint,
    section: { ngon: 8 },
    caps: "round",
    group: "body",
    name: "barrel",
  });

  b.sweep(neck, [0.22, 0.19], {
    bone: neck,
    color: coat,
    section: { ngon: 8 },
    group: "body",
    name: "neckMuscle",
  });

  const skull = b.part(
    new THREE.SphereGeometry(0.275, 12, 8),
    coat,
    {
      bone: head,
      at: [0, 1.48, 0.71],
      scale: [1.0, 0.93, 1.12],
      group: "head",
      name: "skull",
      flat: true,
    },
  );

  b.sweep(trunk, (t) => 0.145 * (1 - t * 0.38), {
    bone: trunk,
    color: nosePaint,
    section: { ngon: 8 },
    caps: "round",
    group: "face",
    name: "longTapirSnout",
  });

  // Lower jaw visibly separated for animation.
  b.sweep(
    catmull([
      [0, 1.32, 0.73],
      [0, 1.24, 0.94],
      [0, 1.19, 1.12],
    ]),
    [0.12, 0.065],
    {
      bone: jaw,
      color: nosePaint,
      section: { ngon: 8 },
      caps: "round",
      group: "face",
      name: "lowerJaw",
    },
  );

  b.sweep(tail, [0.12, 0.035], {
    bone: tail,
    color: stripePaint,
    section: { ngon: 7 },
    caps: "point",
    group: "body",
    name: "shortTail",
  });

  // Legs, with dark lower stockings and broad stylized feet.
  for (const l of legs) {
    b.sweep(l.chain, (t) => (t < 0.58 ? 0.115 : 0.105), {
      bone: l.chain,
      color: stripePaint,
      section: { ngon: 7 },
      caps: "round",
      group: "limbs",
      name: l.front ? "frontLeg" : "hindLeg",
    });

    const p = l.chain.tip!.at;
    b.part(
      new THREE.SphereGeometry(0.115, 8, 5),
      CLAW,
      {
        bone: l.chain.joints[l.chain.joints.length - 1],
        at: [p.x, 0.11, p.z + 0.035],
        scale: [1.05, 0.52, 1.3],
        group: "limbs",
        name: "flatHoof",
        flat: true,
      },
    );

    // Three ivory claws per foot, pointing slightly forward.
    for (let i = -1; i <= 1; i++) {
      const x = p.x + i * 0.046;
      b.spike(
        [x, 0.115, p.z + 0.075],
        [0, -0.02, 1],
        0.07,
        0.018,
        {
          bone: l.chain.joints[l.chain.joints.length - 1],
          color: CREAM,
          group: "limbs",
          name: "hoofClaw",
        },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Ears, mane, forehead crest, tusks, eyes, mouth.
  // ---------------------------------------------------------------------------

  const earOutline: [number, number, "sharp"][] = [
    [0, 0, "sharp"],
    [0.15, 0.02, "sharp"],
    [0.19, 0.17, "sharp"],
    [0.12, 0.31, "sharp"],
    [0.025, 0.2, "sharp"],
  ];

  for (const s of [1, -1]) {
    b.extrude(earOutline, {
      at: [s * 0.18, 1.62, 0.63],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.055,
      bevel: 0.012,
      smoothing: 1,
      color: coat,
      bone: head,
      group: "head",
      name: "pointedEar",
    });

    b.part(
      new THREE.SphereGeometry(0.105, 8, 5),
      RUSSET_DARK,
      {
        bone: head,
        at: [s * 0.185, 1.73, 0.645],
        scale: [0.68, 0.92, 0.2],
        group: "head",
        name: "earInner",
      },
    );
  }

  // A broad, saw-edged mane down the back of the neck and rump.
  const manePath = catmull([
    [0, 1.58, 0.55],
    [0, 1.47, 0.43],
    [0, 1.29, 0.27],
    [0, 1.18, -0.04],
    [0, 1.15, -0.37],
    [0, 1.08, -0.57],
  ]);
  const mane = b.sweep(manePath, [0.12, 0.035], {
    bone: [head, neck, spine],
    color: manePaint,
    section: { ngon: 6 },
    caps: "point",
    group: "mane",
    name: "maneSpine",
  });

  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const at = mane.at(t, 0, 0.01);
    b.spike(
      at,
      [0, 0.35 + 0.1 * Math.sin(t * Math.PI), -0.94],
      0.15 - 0.035 * t,
      0.045 - 0.01 * t,
      {
        bone: head,
        color: RUSSET,
        group: "mane",
        name: "maneTuft",
      },
    );
  }

  // Forehead diamond and cheek ruffs.
  const crest = b.extrude(
    [
      [0, 0],
      [0.13, 0.09],
      [0.08, 0.24],
      [0, 0.31, "sharp"],
      [-0.08, 0.24],
      [-0.13, 0.09],
    ],
    {
      at: [0, 1.59, 0.79],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: [0.04, 0.012],
      bevel: 0.008,
      color: RUSSET,
      bone: head,
      group: "head",
      name: "foreheadCrest",
    },
  );

  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.16, 1.42, 0.71],
        [s * 0.23, 1.36, 0.69],
        [s * 0.21, 1.28, 0.76],
      ]),
      [0.052, 0.012],
      {
        bone: head,
        color: manePaint,
        caps: "point",
        group: "face",
        name: "cheekRuff",
      },
    );
  }

  // Tusks emerging beside the lower trunk.
  for (const s of [1, -1]) {
    b.spike(
      [s * 0.105, 1.305, 0.88],
      [s * 0.16, -0.035, 0.32],
      0.23,
      0.042,
      {
        bone: jaw,
        color: PALE,
        group: "face",
        name: "tusk",
      },
    );
  }

  // Nose pad and nostrils.
  b.part(
    new THREE.SphereGeometry(0.095, 10, 6),
    BLACK,
    {
      bone: trunk.tip,
      at: [0, 1.075, 1.315],
      scale: [1.1, 0.62, 0.33],
      group: "face",
      name: "nosePad",
    },
  );
  for (const s of [1, -1]) {
    b.part(
      new THREE.SphereGeometry(0.019, 7, 5),
      INKWOOD,
      {
        bone: trunk.tip,
        at: [s * 0.052, 1.09, 1.338],
        group: "face",
        name: "nostril",
      },
    );
  }

  // Mouth line and tongue inside the opened jaw.
  b.sweep(
    [
      [-0.085, 1.295, 0.88],
      [0, 1.285, 0.91],
      [0.085, 1.295, 0.88],
    ],
    0.009,
    { bone: jaw, color: INKWOOD, caps: "flat", group: "face", name: "mouthLine" },
  );
  b.part(
    new THREE.SphereGeometry(0.035, 8, 5),
    RED,
    {
      bone: jaw,
      at: [0, 1.255, 0.94],
      scale: [1.2, 0.35, 1.8],
      group: "face",
      name: "tongue",
    },
  );

  // Large graphic woodblock eyes.
  const eyeTexture = animeEye({
    iris: "#d07a36",
    irisLight: "#f6c66a",
    irisDark: "#713546",
    ink: INKWOOD,
    blush: false,
    brow: true,
    size: 384,
  });

  const skullSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSurface.around([0, 1.48, 0.72]).at(s * 38, 4);
    if (hit) {
      b.decal(skullSurface, eyeTexture, {
        at: hit,
        size: [0.105, 0.14],
        dir: [0, 0.02, 1],
        up: [0, 1, 0],
        mirror: s > 0,
        lift: 0.004,
        segments: 8,
        group: "face",
        name: "dreamEye",
      });
    }
  }

  // Small ink brow ridges emphasize the old-spirit expression.
  for (const s of [1, -1]) {
    b.sweep(
      [
        [s * 0.08, 1.6, 0.81],
        [s * 0.15, 1.63, 0.82],
        [s * 0.21, 1.59, 0.8],
      ],
      0.014,
      { bone: head, color: INKWOOD, caps: "round", group: "face", name: "browRidge" },
    );
  }

  // ---------------------------------------------------------------------------
  // Ukiyo-e patterning: bands, shoulder plaques, small carved marks.
  // ---------------------------------------------------------------------------

  for (const t of [0.18, 0.35, 0.52, 0.69, 0.84]) {
    const ring = b.surface(body).loop(spine.at(t), { lift: 0.008 });
    b.sweep(ring, 0.012, {
      bone: spine.at(t).bone,
      color: RUSSET_DARK,
      caps: "round",
      group: "body",
      name: "woodblockBand",
    });
  }

  for (const s of [1, -1]) {
    const plaque = b.part(
      new THREE.BoxGeometry(0.11, 0.16, 0.025),
      OCHRE,
      {
        bone: spine.joints[3],
        at: [s * 0.275, 1.17, 0.39],
        rotation: [0, s * 9, s * 18],
        group: "ornament",
        name: "shoulderPlaque",
        flat: true,
      },
    );
    b.part(
      new THREE.BoxGeometry(0.06, 0.018, 0.008),
      INKWOOD,
      {
        bone: spine.joints[3],
        at: [s * 0.275, 1.21, 0.408],
        rotation: [0, s * 9, s * 18],
        group: "ornament",
        name: "plaqueMark",
      },
    );
  }

  // Three broad woodblock-like stripes across each cheek.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      b.sweep(
        [
          [s * (0.205 - i * 0.012), 1.38 - i * 0.035, 0.79],
          [s * (0.25 - i * 0.012), 1.36 - i * 0.035, 0.82],
        ],
        0.012,
        {
          bone: head,
          color: RUSSET_DARK,
          caps: "flat",
          group: "face",
          name: "cheekStripe",
        },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Dream-eating spirit wisps: curling graphic clouds behind the head and back.
  // ---------------------------------------------------------------------------

  const dreamInk = "#47617d";
  const dreamLight = cel(CLOUD, CLOUD_DARK, { threshold: 0.0 });

  const wispTexture = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 43 C8 29 18 23 28 28 C27 17 37 10 47 17 C58 24 53 38 43 41
               C53 44 53 55 42 58 C28 62 18 53 19 45 C14 49 8 48 8 43Z"
            fill="#a9c5c4" stroke="#47617d" stroke-width="3"/>
      <path d="M17 42 C21 35 29 35 34 39 C39 43 45 41 48 36"
            fill="none" stroke="#dce5d0" stroke-width="3"/>
    </svg>`,
    { size: 128 },
  );

  const cloudFrames = [
    frame([0.25, 1.78, 0.52], [0, 1, 0]),
    frame([-0.28, 1.92, 0.35], [0, 1, 0]),
    frame([0.0, 1.35, -0.68], [0, 1, 0]),
    frame([0.42, 1.12, -0.48], [0, 1, 0]),
  ];

  b.cards(cloudFrames, wispTexture, {
    size: [0.28, 0.28],
    color: CLOUD,
    lean: 12,
    flow: [0, 0, -1],
    bend: 8,
    vary: 0.18,
    rng: rng(22),
    cross: true,
    group: "dream",
  });

  // Three dimensional curling dream ribbons, kept behind the face.
  const dreamPaths = [
    spiral(
      [0.3, 1.58, 0.36],
      [0.3, 1.58, 0.36],
      [0, 1, 0],
      { turns: 1.25, r1: 0.025, pitch: 0.12 },
    ),
    spiral(
      [-0.33, 1.44, 0.2],
      [-0.33, 1.44, 0.2],
      [0, 1, 0],
      { turns: -1.15, r1: 0.02, pitch: 0.1 },
    ),
  ];

  for (let i = 0; i < dreamPaths.length; i++) {
    b.sweep(dreamPaths[i], [0.026, 0.006], {
      bone: head,
      color: i === 0 ? dreamLight : CLOUD_DARK,
      caps: "point",
      group: "dream",
      name: "dreamCurl",
    });
  }

  // Floating little dream beads at the tips of the wisps.
  const dreamBeads = [
    [0.42, 1.85, 0.39],
    [-0.44, 1.58, 0.28],
    [0.08, 1.31, -0.81],
  ];
  for (const p of dreamBeads) {
    b.part(
      new THREE.SphereGeometry(0.045, 7, 5),
      OCHRE,
      {
        bone: head,
        at: p,
        group: "dream",
        name: "dreamBead",
      },
    );
  }

  return b.root;
}
