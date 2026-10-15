import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  paint,
  noise,
  smoothstep,
  mix,
  svg,
  frame,
  rng,
} from "../../../../src/index";

export const meta = {
  name: "Warcraft Gray Wolf",
  description:
    "A fierce Frostwolf timber wolf standing alert on a frosted tundra crag, featuring heroic Blizzard-style hand-painted fur, powerful muscular proportions, razor fangs, glowing amber eyes, and tribal clan adornments.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "warcraft_gray_wolf" });
  const rand = rng(1337);

  // ---------------------------------------------------------------------------
  // 1. PALETTE & SHADING
  // ---------------------------------------------------------------------------
  // Blizzard hand-painted style: warm top-light, cool ambient bounce, slate mantle
  const CHARCOAL = "#222630"; // Dorsal spine, mane spikes, claws
  const SLATE_DARK = "#353c4c"; // Upper body mantle
  const MID_GRAY = "#636d80"; // Silver-ash flank tone
  const LIGHT_GRAY = "#9aa4b6"; // Cheek and hip highlight
  const CREAM = "#f3ebdd"; // Bib, throat, underbelly, cheek fluffs
  const IVORY = "#fffbf2"; // Fangs, tooth charms, eye specular
  const NOSE_PAD = "#15171e"; // Leather nose
  const GUM_PINK = "#783042"; // Gums and tongue
  const CLAW_BLACK = "#101116"; // Obsidian claws
  const LEATHER_BROWN = "#3b2519"; // Collar strap
  const IRON = "#6e7582"; // Rivets & buckles
  const BONE = "#eee5d4"; // Mammoth fangs
  const RUNE_CYAN = "#38f0e8"; // Glowing frost rune
  const ROCK_DARK = "#383d47"; // Alterac mountain rock
  const ROCK_LIGHT = "#5b6373"; // Rock highlights
  const SNOW_WHITE = "#edf5fc"; // Fresh alpine snow
  const SNOW_SHADOW = "#bfd4e6"; // Blue snow shadow
  const WOOD_BARK = "#2d231b"; // Frozen pine stump
  const WOOD_CORE = "#544638"; // Heartwood

  const SUN_DIR = new THREE.Vector3(0.35, 0.85, 0.45).normalize();
  const SUN_TINT = [1.0, 0.95, 0.86] as const;
  const SHADE_TINT = [0.14, 0.16, 0.23] as const;

  // Custom Blizzard hand-painted wolf coat
  const WOLF_COAT = paint((p, n) => {
    const fBroad = noise(p, 0.24, 42);
    const fFine = noise(p, 0.05, 99);
    const height = p.y;
    const isBelly = smoothstep(0.12, -0.42, n.y) * 0.72 + smoothstep(0.72, 0.48, height) * 0.28;
    const isMantle = smoothstep(0.2, 0.82, n.y) * smoothstep(0.66, 0.98, height);

    let col = mix(MID_GRAY, SLATE_DARK, isMantle * 0.86 + (fBroad - 0.5) * 0.2);
    col = mix(col, CREAM, isBelly * 0.92);
    col = mix(col, CHARCOAL, (fFine - 0.5) * 0.14);

    const lit = n.dot(SUN_DIR);
    if (lit > 0.1) {
      col = mix(col, SUN_TINT, (lit - 0.1) * 0.32);
    } else {
      col = mix(col, SHADE_TINT, (0.1 - lit) * 0.36);
    }
    return col;
  });

  const WOLF_SNOUT = paint((p, n) => {
    const isTop = smoothstep(0.25, 0.75, n.y);
    let col = mix(MID_GRAY, CHARCOAL, isTop * 0.88);
    const front = smoothstep(1.08, 1.22, p.z);
    col = mix(col, CHARCOAL, front * 0.6);
    return col;
  });

  const ROCK_SURFACE = paint((p, n) => {
    const n1 = noise(p, 0.2, 11);
    const n2 = noise(p, 0.06, 22);
    let c = mix(ROCK_DARK, ROCK_LIGHT, n1 * 0.6 + n2 * 0.4);
    if (n.y > 0.65) {
      c = mix(c, SNOW_SHADOW, (n.y - 0.65) * 1.7);
    }
    return c;
  });

  const SNOW_SURFACE = paint((_p, n) => {
    return mix(SNOW_SHADOW, SNOW_WHITE, smoothstep(-0.1, 0.7, n.y));
  });

  // ---------------------------------------------------------------------------
  // 2. TEXTURES
  // ---------------------------------------------------------------------------
  // Warcraft glowing amber wolf eye with dark eyeliner and radial iris detail
  const EYE_TEX = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M 8 64 Q 64 16 120 64 Q 64 112 8 64 Z" fill="#131119" stroke="#08060c" stroke-width="5"/>
      <radialGradient id="irisGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fff275"/>
        <stop offset="55%" stop-color="#f59e0b"/>
        <stop offset="85%" stop-color="#b45309"/>
        <stop offset="100%" stop-color="#3b1602"/>
      </radialGradient>
      <circle cx="64" cy="64" r="38" fill="url(#irisGrad)"/>
      <circle cx="64" cy="64" r="38" fill="none" stroke="#2b0e01" stroke-width="3"/>
      <path d="M 64 26 L 64 36 M 64 92 L 64 102 M 26 64 L 36 64 M 92 64 L 102 64 M 37 37 L 44 44 M 91 37 L 84 44 M 37 91 L 44 84 M 91 91 L 84 84" stroke="#fef08a" stroke-width="2.5" opacity="0.85"/>
      <ellipse cx="64" cy="64" rx="10" ry="26" fill="#0d0912"/>
      <circle cx="53" cy="50" r="8" fill="#ffffff" opacity="0.95"/>
      <circle cx="75" cy="75" r="4" fill="#ffffff" opacity="0.85"/>
      <path d="M 118 64 Q 126 54 128 42" stroke="#131119" stroke-width="6" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  // Stylized fur fringe card for silhouette accents
  const FUR_CARD_TEX = svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M 6 0 L 22 80 L 32 128 L 42 80 L 58 0 L 40 40 L 32 0 L 24 40 Z" fill="#eee5d3" stroke="#252a36" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M 28 50 L 32 110 L 36 50 Z" fill="#ffffff" opacity="0.7"/>
    </svg>`,
    { size: 128 },
  );

  // Frostwolf clan rune
  const RUNE_TEX = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#20242d" stroke="#38f0e8" stroke-width="2.5"/>
      <path d="M 32 10 L 44 26 L 38 48 L 32 54 L 26 48 L 20 26 Z" fill="none" stroke="#38f0e8" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M 32 20 L 32 44 M 24 32 L 40 32" stroke="#ffffff" stroke-width="2"/>
      <circle cx="32" cy="32" r="4" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------------------
  // 3. SKELETON SETUP
  // ---------------------------------------------------------------------------
  // Quadruped standing alert, ground at y = 0, paws on rock at y ~ 0.08
  const hips = b.joint("hips", { at: [0, 0.74, -0.22] });

  // Spine & Chest
  const spineChain = b.chain(
    "spine",
    catmull([
      [0, 0.74, -0.22],
      [0, 0.8, 0.04],
      [0, 0.9, 0.32],
    ]),
    {
      parent: hips,
      role: "spine",
      names: ["spineBase", "spineMid", "chest"],
    },
  );
  const chest = spineChain.tip!;

  // Neck
  const neckChain = b.chain(
    "neck",
    catmull([
      [0, 0.9, 0.32],
      [0, 1.0, 0.54],
      [0, 1.12, 0.74],
    ]),
    {
      parent: chest,
      role: "neck",
      names: ["neckBase", "neckMid", "neckTop"],
    },
  );
  const neckTop = neckChain.tip!;

  // Head and Jaws
  const head = b.joint("head", {
    parent: neckTop,
    at: [0, 1.18, 0.88],
    dir: [0, -0.04, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.1, 0.92],
    dir: [0, -0.15, 1],
    role: "jaw",
    group: "head",
  });

  // Tail
  const tailChain = b.chain(
    "tail",
    catmull([
      [0, 0.74, -0.24],
      [0, 0.72, -0.44],
      [0, 0.62, -0.66],
      [0, 0.48, -0.84],
      [0, 0.34, -0.98],
    ]),
    {
      parent: hips,
      role: "tail",
      count: 4,
      names: ["tail1", "tail2", "tail3", "tail4"],
    },
  );

  // ---------------------------------------------------------------------------
  // 4. TORSO & NECK GEOMETRY
  // ---------------------------------------------------------------------------
  // Muscular heroic canine body
  b.loft(
    [
      { at: [0, 0.74, -0.22], w: 0.4, h: 0.36 }, // Pelvis / Rump
      { at: [0, 0.77, -0.02], w: 0.34, h: 0.34 }, // Flank tuck
      { at: [0, 0.84, 0.16], w: 0.46, h: 0.5 }, // Mid ribcage
      { at: [0, 0.9, 0.34], w: 0.5, h: 0.56 }, // Deep brisket
      { at: [0, 0.94, 0.5], w: 0.44, h: 0.52 }, // Shoulder withers
    ],
    {
      bone: [hips, spineChain.joints[0], chest],
      color: WOLF_COAT,
      group: "torso",
    },
  );

  // Massive neck ruff
  b.loft(
    [
      { at: [0, 0.94, 0.5], w: 0.44, h: 0.52 },
      { at: [0, 1.02, 0.64], w: 0.38, h: 0.44 },
      { at: [0, 1.12, 0.78], w: 0.28, h: 0.34 },
    ],
    {
      bone: [chest, neckChain.joints[0], neckTop],
      color: WOLF_COAT,
      group: "neck",
    },
  );

  // ---------------------------------------------------------------------------
  // 5. HEAD, JAWS & DETAILS
  // ---------------------------------------------------------------------------
  // Cranium: blocky, angular forehead
  b.frustumBox([0, 1.16, 0.76], [0, 1.19, 0.98], [0.26, 0.22], [0.22, 0.18], {
    bone: head,
    color: WOLF_COAT,
    group: "head",
  });

  // Snout (Upper Jaw)
  b.frustumBox([0, 1.17, 0.96], [0, 1.13, 1.21], [0.18, 0.16], [0.12, 0.12], {
    bone: head,
    color: WOLF_SNOUT,
    group: "head",
  });

  // Wet leather nose pad
  b.part(new THREE.BoxGeometry(0.085, 0.055, 0.045), NOSE_PAD, {
    bone: head,
    at: [0, 1.135, 1.22],
    rotation: [8, 0, 0],
    group: "head",
  });
  // Nostril indentations
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.016, 0.012, 0.02), CHARCOAL, {
      bone: head,
      at: [s * 0.024, 1.13, 1.235],
      group: "head",
    });
  }

  // Upper lip margin
  b.frustumBox([0, 1.09, 0.98], [0, 1.08, 1.2], [0.17, 0.04], [0.11, 0.03], {
    bone: head,
    color: CHARCOAL,
    group: "head",
  });

  // Lower Jaw (on jaw joint)
  b.frustumBox([0, 1.075, 0.95], [0, 1.055, 1.18], [0.14, 0.08], [0.09, 0.055], {
    bone: jaw,
    color: CREAM,
    group: "head",
  });

  // Inside mouth: dark slate-rose tongue and gums
  b.frustumBox([0, 1.07, 0.98], [0, 1.065, 1.14], [0.08, 0.025], [0.06, 0.018], {
    bone: jaw,
    color: GUM_PINK,
    group: "head",
  });

  // Lethal sabre canine fangs (Upper)
  for (const s of [1, -1]) {
    b.spike([s * 0.046, 1.09, 1.14], [0, -1, 0.12], 0.075, 0.015, {
      bone: head,
      color: IVORY,
      group: "head",
    });
    // Secondary upper premolar
    b.spike([s * 0.052, 1.09, 1.08], [0, -1, 0.05], 0.04, 0.01, {
      bone: head,
      color: IVORY,
      group: "head",
    });
  }

  // Lower canine fangs (Upper-pointing)
  for (const s of [1, -1]) {
    b.spike([s * 0.038, 1.07, 1.13], [0, 1, -0.08], 0.06, 0.013, {
      bone: jaw,
      color: IVORY,
      group: "head",
    });
  }

  // Incisors front row
  for (let i = -2; i <= 2; i++) {
    b.spike([i * 0.016, 1.082, 1.185], [0, -1, 0], 0.024, 0.006, {
      bone: head,
      color: IVORY,
      group: "head",
    });
    b.spike([i * 0.014, 1.075, 1.175], [0, 1, 0], 0.022, 0.005, {
      bone: jaw,
      color: IVORY,
      group: "head",
    });
  }

  // Piercing Glowing Eyes & Brows
  for (const s of [1, -1]) {
    // Eye plate
    b.part(new THREE.PlaneGeometry(0.068, 0.055), "#ffffff", {
      bone: head,
      at: [s * 0.088, 1.17, 0.98],
      dir: [s * 0.52, 0.05, 0.85],
      axis: "z",
      texture: EYE_TEX,
      group: "head",
    });

    // Heavy angled brow ridge
    b.extrude(
      [
        [0, 0],
        [0.08, 0.02],
        [0.06, 0.045, "sharp"],
        [0, 0.03],
      ],
      {
        at: [s * 0.04, 1.19, 0.96],
        x: [s * 0.88, 0.05, 0.45],
        y: [0, 1, 0],
        thickness: 0.03,
        bevel: 0.006,
        color: CHARCOAL,
        bone: head,
        group: "head",
      },
    );

    // Cheek Ruffs: thick sweeping fur fluffs
    b.extrude(
      [
        [0, 0],
        [0.15, -0.04],
        [0.09, -0.1],
        [0.18, -0.15, "sharp"],
        [0.08, -0.2],
        [0.14, -0.26, "sharp"],
        [0, -0.24],
      ],
      {
        at: [s * 0.1, 1.16, 0.84],
        x: [s * 0.8, -0.2, -0.55],
        y: [0, 1, 0],
        thickness: 0.045,
        bevel: 0.01,
        color: CREAM,
        bone: head,
        group: "head",
      },
    );

    // Secondary inner cheek tuft
    b.extrude(
      [
        [0, 0],
        [0.1, -0.06],
        [0.06, -0.14, "sharp"],
        [0, -0.12],
      ],
      {
        at: [s * 0.11, 1.13, 0.9],
        x: [s * 0.85, -0.1, -0.5],
        y: [0, 1, 0],
        thickness: 0.03,
        bevel: 0.008,
        color: LIGHT_GRAY,
        bone: head,
        group: "head",
      },
    );
  }

  // Alert wolf ears
  for (const s of [1, -1]) {
    const earJoint = b.joint(s === 1 ? "earL" : "earR", {
      parent: head,
      at: [s * 0.09, 1.25, 0.84],
      dir: [s * 0.35, 0.85, 0.38],
      role: "hinge",
      group: "head",
    });

    // Outer ear shell (Dark charcoal)
    b.extrude(
      [
        [0, 0],
        [0.08, 0],
        [0.055, 0.18, "sharp"],
        [-0.03, 0.14],
      ],
      {
        at: earJoint.at,
        x: [s * 0.7, 0.65, 0.3],
        y: [-0.2, 0.85, -0.48],
        thickness: 0.026,
        bevel: 0.006,
        color: SLATE_DARK,
        bone: earJoint,
        group: "head",
      },
    );

    // Inner ear fur tufts (Cream)
    b.extrude(
      [
        [0.01, 0.02],
        [0.06, 0.02],
        [0.04, 0.13, "sharp"],
        [-0.01, 0.09],
      ],
      {
        at: [s * 0.09, 1.255, 0.85],
        x: [s * 0.7, 0.65, 0.3],
        y: [-0.2, 0.85, -0.48],
        thickness: 0.018,
        bevel: 0.004,
        color: CREAM,
        bone: earJoint,
        group: "head",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // 6. WARCRAFT MANE & SPINE SPIKES
  // ---------------------------------------------------------------------------
  // The Frostwolf mantle: iconic jagged fur crest along the nape and withers
  const maneSpikes = [
    { at: [0, 1.21, 0.72], scale: [0.07, 0.16], bone: neckTop },
    { at: [0, 1.14, 0.58], scale: [0.08, 0.2], bone: neckChain.joints[0] },
    { at: [0, 1.06, 0.42], scale: [0.1, 0.24], bone: chest }, // Peak at withers
    { at: [0, 0.98, 0.26], scale: [0.09, 0.2], bone: chest },
    { at: [0, 0.9, 0.1], scale: [0.08, 0.16], bone: spineChain.joints[0] },
    { at: [0, 0.84, -0.06], scale: [0.07, 0.13], bone: spineChain.joints[0] },
    { at: [0, 0.78, -0.18], scale: [0.06, 0.1], bone: hips },
  ];

  maneSpikes.forEach((sp, idx) => {
    const [w, h] = sp.scale;
    b.extrude(
      [
        [0, 0],
        [w * 0.5, h * 0.45],
        [0, h, "sharp"],
        [-w * 0.5, h * 0.4],
      ],
      {
        at: sp.at,
        x: [0, -0.35, -0.93],
        y: [0, 0.93, -0.35],
        thickness: 0.045 - idx * 0.003,
        bevel: 0.008,
        color: CHARCOAL,
        bone: sp.bone,
        group: "mane",
      },
    );
  });

  // Flanking shoulder mane blades (cascading over the shoulder muscles)
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.08, -0.06],
        [0.05, -0.14, "sharp"],
        [0.1, -0.2, "sharp"],
        [0, -0.18],
      ],
      {
        at: [s * 0.18, 0.98, 0.44],
        x: [s * 0.75, -0.3, -0.58],
        y: [0, 1, 0],
        thickness: 0.035,
        bevel: 0.007,
        color: SLATE_DARK,
        bone: chest,
        group: "mane",
      },
    );

    // Rear hip fur tuft
    b.extrude(
      [
        [0, 0],
        [0.09, -0.05],
        [0.06, -0.16, "sharp"],
        [0, -0.13],
      ],
      {
        at: [s * 0.19, 0.74, -0.16],
        x: [s * 0.6, -0.35, -0.7],
        y: [0, 1, 0],
        thickness: 0.03,
        bevel: 0.006,
        color: SLATE_DARK,
        bone: hips,
        group: "mane",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // 7. FROSTWOLF CLAN HARNESS & TALISMAN
  // ---------------------------------------------------------------------------
  // Rugged leather neck collar around the base of the neck ruff
  const collarLoop = catmull(
    [
      [0, 1.07, 0.46],
      [0.21, 0.96, 0.5],
      [0, 0.78, 0.54],
      [-0.21, 0.96, 0.5],
    ],
    { closed: true },
  );
  b.sweep(collarLoop, 0.02, {
    bone: chest,
    color: LEATHER_BROWN,
    group: "gear",
  });

  // Iron studs on collar
  for (let i = 0; i < 6; i++) {
    const t = i / 6;
    const pt = collarLoop.at(t);
    b.part(new THREE.SphereGeometry(0.016, 6, 4), IRON, {
      at: pt,
      bone: chest,
      group: "gear",
    });
  }

  // Hanging mammoth fangs and carved runic stone charm
  for (const s of [1, -1]) {
    b.spike([s * 0.045, 0.76, 0.57], [s * 0.03, -1, 0.1], 0.085, 0.014, {
      bone: chest,
      color: BONE,
      group: "gear",
    });
  }

  // Carved runic talisman in the center
  b.extrude(
    [
      [0, 0.045],
      [0.035, 0.025],
      [0.035, -0.025],
      [0, -0.045],
      [-0.035, -0.025],
      [-0.035, 0.025],
    ],
    {
      at: [0, 0.72, 0.58],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.02,
      bevel: 0.005,
      color: ROCK_DARK,
      bone: chest,
      group: "gear",
    },
  );

  // Glowing Frostwolf rune disc on the talisman
  b.part(new THREE.PlaneGeometry(0.045, 0.045), "#ffffff", {
    at: [0, 0.72, 0.592],
    dir: [0, 0, 1],
    axis: "z",
    texture: RUNE_TEX,
    bone: chest,
    group: "gear",
  });

  // ---------------------------------------------------------------------------
  // 8. FORELIMBS (LEGS & PAWS)
  // ---------------------------------------------------------------------------
  // Quadruped canine front leg IK: Shoulder -> Elbow (points back) -> Wrist (points forward) -> Paw
  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    const shoulderPt = [s * 0.22, 0.8, 0.3];
    const frontPawTarget = [s * 0.23, 0.085, 0.4];

    // Deltoid muscular shoulder cap
    b.part(new THREE.SphereGeometry(0.12, 8, 6), WOLF_COAT, {
      at: shoulderPt,
      scale: [0.8, 1.2, 1.0],
      bone: chest,
      group: "foreleg",
    });

    const frontPts = limb(
      shoulderPt,
      frontPawTarget,
      [0.36, 0.32, 0.12],
      [[0, 0, -1]],
      { sole: [0, 0, 1] },
    );

    const legChain = b.chain(`legF${side}`, frontPts, {
      parent: chest,
      role: "leg",
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `pawF${side}`],
    });

    // Upper arm (humerus)
    b.sweep(catmull([frontPts[0], frontPts[1]]), (t) => 0.09 - t * 0.02, {
      bone: legChain.joints[0],
      color: WOLF_COAT,
      group: "foreleg",
    });

    // Stylized elbow fur tuft pointing backward
    b.extrude(
      [
        [0, 0],
        [0.08, -0.05],
        [0.04, -0.15, "sharp"],
        [0, -0.1],
      ],
      {
        at: frontPts[1],
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: 0.028,
        bevel: 0.005,
        color: SLATE_DARK,
        bone: legChain.joints[1],
        group: "foreleg",
      },
    );

    // Forearm (radius/ulna)
    b.sweep(catmull([frontPts[1], frontPts[2]]), (t) => 0.07 - t * 0.015, {
      bone: legChain.joints[1],
      color: WOLF_COAT,
      group: "foreleg",
    });

    // Pastern down to foot
    b.sweep(catmull([frontPts[2], frontPts[3]]), 0.055, {
      bone: legChain.joints[2],
      color: WOLF_COAT,
      group: "foreleg",
    });

    // Front Paw: broad, heavy, muscular
    const pawBone = legChain.tip!;
    b.frustumBox(
      [s * 0.23, 0.1, 0.37],
      [s * 0.23, 0.085, 0.44],
      [0.13, 0.06],
      [0.12, 0.05],
      {
        bone: pawBone,
        color: WOLF_COAT,
        group: "paw",
      },
    );

    // 4 Distinct Knuckled Toes with Claws
    const toeOffsets = [
      { x: s * 0.046, z: 0.015 },
      { x: s * 0.016, z: 0.04 },
      { x: -s * 0.016, z: 0.04 },
      { x: -s * 0.046, z: 0.015 },
    ];

    toeOffsets.forEach((to) => {
      const toeStart: [number, number, number] = [s * 0.23 + to.x, 0.085, 0.44 + to.z];
      const toeEnd: [number, number, number] = [s * 0.23 + to.x, 0.082, 0.48 + to.z];
      b.capsule(toeStart, toeEnd, 0.018, {
        bone: pawBone,
        color: WOLF_COAT,
        group: "paw",
      });

      // Heavy curved obsidian claw
      b.spike(toeEnd, [0, -0.015, 0.035], 0.036, 0.007, {
        bone: pawBone,
        color: CLAW_BLACK,
        group: "paw",
      });

      // Black toe pad underneath
      b.part(new THREE.BoxGeometry(0.02, 0.008, 0.02), CLAW_BLACK, {
        at: [toeStart[0], 0.075, toeStart[2]],
        bone: pawBone,
        group: "paw",
      });
    });

    // Central palm pad underneath
    b.part(new THREE.BoxGeometry(0.08, 0.01, 0.06), CLAW_BLACK, {
      at: [s * 0.23, 0.075, 0.4],
      bone: pawBone,
      group: "paw",
    });
  }

  // ---------------------------------------------------------------------------
  // 9. HINDLIMBS (HIPS, LEGS & PAWS)
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    const hipPt = [s * 0.18, 0.72, -0.22];
    const hindPawTarget = [s * 0.21, 0.065, -0.42];

    const hindPts = limb(
      hipPt,
      hindPawTarget,
      [0.34, 0.32, 0.14],
      [[0, 0, 1]],
      { sole: [0, 0, 1] },
    );

    const legChain = b.chain(`legH${side}`, hindPts, {
      parent: hips,
      role: "leg",
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `pawH${side}`],
    });

    // Muscular predatory thigh
    b.part(new THREE.SphereGeometry(0.14, 8, 6), WOLF_COAT, {
      at: [s * 0.19, 0.64, -0.2],
      scale: [0.75, 1.25, 1.1],
      bone: legChain.joints[0],
      group: "hindleg",
    });

    b.sweep(catmull([hindPts[0], hindPts[1]]), (t) => 0.11 - t * 0.03, {
      bone: legChain.joints[0],
      color: WOLF_COAT,
      group: "hindleg",
    });

    // Shank / Crus (Knee to Hock)
    b.sweep(catmull([hindPts[1], hindPts[2]]), (t) => 0.08 - t * 0.02, {
      bone: legChain.joints[1],
      color: WOLF_COAT,
      group: "hindleg",
    });

    // Angular Hock fur tuft pointing back
    b.extrude(
      [
        [0, 0],
        [0.08, -0.04],
        [0.04, -0.14, "sharp"],
        [0, -0.09],
      ],
      {
        at: hindPts[2],
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: 0.026,
        bevel: 0.005,
        color: SLATE_DARK,
        bone: legChain.joints[2],
        group: "hindleg",
      },
    );

    // Rear metatarsus
    b.sweep(catmull([hindPts[2], hindPts[3]]), 0.05, {
      bone: legChain.joints[2],
      color: WOLF_COAT,
      group: "hindleg",
    });

    // Hind Paw
    const pawBone = legChain.tip!;
    b.frustumBox(
      [s * 0.21, 0.08, -0.44],
      [s * 0.21, 0.065, -0.38],
      [0.12, 0.055],
      [0.11, 0.045],
      {
        bone: pawBone,
        color: WOLF_COAT,
        group: "paw",
      },
    );

    // 4 Hind Toes & Claws
    const hindToeOffsets = [
      { x: s * 0.042, z: 0.015 },
      { x: s * 0.015, z: 0.04 },
      { x: -s * 0.015, z: 0.04 },
      { x: -s * 0.042, z: 0.015 },
    ];

    hindToeOffsets.forEach((to) => {
      const toeStart: [number, number, number] = [s * 0.21 + to.x, 0.065, -0.38 + to.z];
      const toeEnd: [number, number, number] = [s * 0.21 + to.x, 0.062, -0.34 + to.z];
      b.capsule(toeStart, toeEnd, 0.017, {
        bone: pawBone,
        color: WOLF_COAT,
        group: "paw",
      });

      b.spike(toeEnd, [0, -0.012, 0.035], 0.034, 0.007, {
        bone: pawBone,
        color: CLAW_BLACK,
        group: "paw",
      });

      b.part(new THREE.BoxGeometry(0.018, 0.007, 0.018), CLAW_BLACK, {
        at: [toeStart[0], 0.055, toeStart[2]],
        bone: pawBone,
        group: "paw",
      });
    });

    b.part(new THREE.BoxGeometry(0.075, 0.009, 0.055), CLAW_BLACK, {
      at: [s * 0.21, 0.055, -0.41],
      bone: pawBone,
      group: "paw",
    });
  }

  // ---------------------------------------------------------------------------
  // 10. TAIL
  // ---------------------------------------------------------------------------
  // Broad, fluffy wolf tail curving back and down
  b.sweep(
    tailChain,
    (t) => {
      const w = Math.sin(t * Math.PI);
      return 0.075 + 0.085 * w;
    },
    {
      bone: [
        hips,
        tailChain.joints[0],
        tailChain.joints[1],
        tailChain.joints[2],
        tailChain.joints[3],
      ],
      color: WOLF_COAT,
      group: "tail",
    },
  );

  // Stylized tail underside fur spikes
  b.along(tailChain, 3, (at) => {
    b.spike(at, [0, -0.8, -0.6], 0.12, 0.032, {
      bone: at.bone,
      color: CHARCOAL,
      group: "tail",
    });
  });

  // Dark brush tip
  b.spike([0, 0.34, -0.98], [0, -0.2, -0.98], 0.14, 0.045, {
    bone: tailChain.joints[3],
    color: CHARCOAL,
    group: "tail",
  });

  // ---------------------------------------------------------------------------
  // 11. SILHOUETTE FUR CARDS
  // ---------------------------------------------------------------------------
  // Hand-painted fur fringe cards placed on key silhouette horizons
  const cardHits = [
    // Throat & chest bib
    frame([0, 0.86, 0.52], [0, 0.3, 0.95]),
    frame([0.08, 0.92, 0.48], [0.5, 0.2, 0.8]),
    frame([-0.08, 0.92, 0.48], [-0.5, 0.2, 0.8]),
    frame([0, 0.8, 0.44], [0, -0.4, 0.9]),
    // Cheek fringes
    frame([0.16, 1.13, 0.86], [0.85, -0.1, -0.5]),
    frame([-0.16, 1.13, 0.86], [-0.85, -0.1, -0.5]),
    // Tail fringes
    frame([0, 0.58, -0.72], [0, -0.9, -0.4]),
    frame([0, 0.42, -0.88], [0, -0.85, -0.5]),
    // Rear thigh fringes
    frame([0.22, 0.68, -0.28], [0.8, -0.4, -0.4]),
    frame([-0.22, 0.68, -0.28], [-0.8, -0.4, -0.4]),
  ];

  b.cards(cardHits, FUR_CARD_TEX, {
    size: [0.09, 0.18],
    lean: 30,
    flow: [0, -0.8, 0.6],
    vary: 0.2,
    rng: rand,
    group: "cards",
  });

  // ---------------------------------------------------------------------------
  // 12. STAGED TUNDRA CRAG BASE & PROPS
  // ---------------------------------------------------------------------------
  // Base bounds: y = 0 to y = 0.085, wolf planted proudly on rock
  // Main foundation slab (touches floor at y = 0)
  b.frustumBox(
    [0, 0.0, -0.05],
    [0, 0.045, -0.05],
    [1.15, 1.55],
    [1.08, 1.48],
    {
      color: ROCK_SURFACE,
      flat: true,
      group: "base",
    },
  );

  // Upper front rock step where front paws are placed
  b.frustumBox(
    [0, 0.045, 0.36],
    [0, 0.082, 0.36],
    [0.76, 0.56],
    [0.68, 0.5],
    {
      color: ROCK_SURFACE,
      flat: true,
      group: "base",
    },
  );

  // Rear rock slope where hind paws are placed
  b.frustumBox(
    [0, 0.04, -0.4],
    [0, 0.062, -0.4],
    [0.78, 0.58],
    [0.72, 0.52],
    {
      color: ROCK_SURFACE,
      flat: true,
      group: "base",
    },
  );

  // Flanking crag teeth (Alterac jagged mountain styling)
  b.extrude(
    [
      [0, 0],
      [0.24, 0],
      [0.16, 0.18, "sharp"],
      [-0.04, 0.12],
    ],
    {
      at: [-0.5, 0.02, 0.08],
      x: [0.95, 0, 0.3],
      y: [0, 1, 0],
      thickness: 0.34,
      bevel: 0.02,
      color: ROCK_SURFACE,
      group: "base",
    },
  );

  b.extrude(
    [
      [0, 0],
      [0.26, 0],
      [0.2, 0.19, "sharp"],
      [0.02, 0.14],
    ],
    {
      at: [0.4, 0.02, -0.16],
      x: [0.92, 0, -0.38],
      y: [0, 1, 0],
      thickness: 0.36,
      bevel: 0.02,
      color: ROCK_SURFACE,
      group: "base",
    },
  );

  // Fresh crisp snow drifts draped on rock steps
  b.frustumBox(
    [0.28, 0.045, 0.16],
    [0.28, 0.075, 0.16],
    [0.32, 0.38],
    [0.24, 0.28],
    {
      color: SNOW_SURFACE,
      flat: true,
      group: "base",
    },
  );

  b.frustumBox(
    [-0.26, 0.04, -0.12],
    [-0.26, 0.068, -0.12],
    [0.36, 0.42],
    [0.26, 0.3],
    {
      color: SNOW_SURFACE,
      flat: true,
      group: "base",
    },
  );

  b.frustumBox(
    [0, 0.045, -0.62],
    [0, 0.07, -0.62],
    [0.65, 0.3],
    [0.55, 0.22],
    {
      color: SNOW_SURFACE,
      flat: true,
      group: "base",
    },
  );

  // Weathered pine stump in background (back-left, leaves wolf front clear)
  b.frustumBox(
    [-0.42, 0.045, -0.58],
    [-0.42, 0.28, -0.58],
    [0.18, 0.18],
    [0.14, 0.14],
    {
      color: WOOD_BARK,
      flat: true,
      group: "prop",
    },
  );
  // Cut top heartwood
  b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.015, 8), WOOD_CORE, {
    at: [-0.42, 0.285, -0.58],
    rotation: [-6, 12, 0],
    group: "prop",
  });
  // Snow cap on stump
  b.part(new THREE.CylinderGeometry(0.05, 0.07, 0.035, 8), SNOW_SURFACE, {
    at: [-0.41, 0.305, -0.57],
    group: "prop",
  });

  // Carved runic boundary marker stone in background (back-right)
  b.frustumBox(
    [0.42, 0.045, -0.52],
    [0.42, 0.34, -0.52],
    [0.16, 0.14],
    [0.08, 0.07],
    {
      color: ROCK_SURFACE,
      flat: true,
      group: "prop",
    },
  );
  // Glowing blue rune on stone marker
  b.part(new THREE.PlaneGeometry(0.06, 0.06), "#ffffff", {
    at: [0.42, 0.24, -0.448],
    dir: [0, 0, 1],
    axis: "z",
    texture: RUNE_TEX,
    group: "prop",
  });

  // Frost snow tufts at marker base
  b.frustumBox(
    [0.42, 0.045, -0.48],
    [0.42, 0.08, -0.48],
    [0.24, 0.2],
    [0.16, 0.12],
    {
      color: SNOW_SURFACE,
      flat: true,
      group: "prop",
    },
  );

  return b.root;
}
