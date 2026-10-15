Here is the breakdown of improvements to achieve the bold, iconic Blizzard/Warcraft aesthetic and resolve all render issues:

1. **Fixed Grounding & Plinth Depth**: Rebuilt the Alterac mountain crag using clean stepped bedrock geometry grounded precisely at $y = 0$, eliminating the $-47\text{ mm}$ subsurface overhang.
2. **Fixed Detached Ear Geometry**: Removed the misaligned floating spikes and sculpted sleek, alert wolf ears with integrated dark rims and cream inner fur tufts directly attached to the ear joints.
3. **Athletic Canine Posture & Limb Anatomy**: Replaced the stiff vertical legs with dynamic, digitigrade limbs featuring elbows tucked back against the deep chest, sprung pasterns, powerful forward-thrusting stifles (knees), and high hocks in a ready-to-pounce alert stance.
4. **Heroic Facial Sculpt & Razor-Fanged Snarl**: Redesigned the head with an aggressive snarling snout, furrowed brow ridges, curled upper lips exposing deep crimson gums, massive sabre-curved ivory tusks/canines, and intensely glowing amber eyes visible from both front and three-quarter angles.
5. **Flowing Dorsal Crest & Layered Mantle**: Replaced isolated spine triangles with a cohesive, multi-tiered fur crest running from the cranium over the high withers down to the bushy, tufted timber wolf tail.
6. **Bold Tribal Adornments**: Fitted a heavy studded leather war harness with mammoth tusk charms and a radiant Frostwolf clan talisman glowing with glacial cyan magic.
7. **Thematic Alterac Setting**: Staged the wolf on a snow-dusted basalt crag flanked by carved Horde clan totems and glowing ice spires.

Here is the complete updated module:

```ts
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
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Warcraft Gray Wolf",
  description:
    "An alert Frostwolf timber wolf standing proud on a snow-dusted Alterac mountain crag, featuring heroic Blizzard-style hand-painted fur, powerful muscular shoulders, piercing glowing amber eyes, a sculpted razor-fanged snarl, layered mane ruffs, and tribal clan adornments.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "warcraft_gray_wolf" });
  const rand = rng(777);

  // ---------------------------------------------------------------------------
  // 1. PALETTE & SHADING
  // ---------------------------------------------------------------------------
  // Blizzard hand-painted palette: warm golden key-light, rich cool blue-slate shadow
  const CHARCOAL = "#181a22"; // Dorsal spine, muzzle bridge, claw obsidian
  const SLATE_DARK = "#2d3342"; // Upper mantle & outer ear shell
  const SLATE_MID = "#485366"; // Flanks, shoulder muscles
  const SILVER_ASH = "#798599"; // Mid-coat highlight
  const CREAM = "#f4ebd8"; // Cheek ruffs, neck bib, underbelly, inner ears
  const PALE_IVORY = "#fffbf0"; // Fangs, tooth charms, eye glints
  const NOSE_LEATHER = "#101216"; // Textured nose pad
  const GUM_DARK = "#4a1622"; // Deep mouth cavity
  const TONGUE_ROSE = "#8a3245"; // Tongue
  const CLAW_BLACK = "#0a0b10"; // Polished black talons
  const LEATHER_WARM = "#3d2416"; // Collar & harness straps
  const BRONZE_IRON = "#847565"; // Weathered iron/bronze studs & rings
  const BONE_TUSK = "#e8dec8"; // Mammoth tusks
  const FROST_CYAN = "#2ef0ea"; // Glowing Frostwolf rune
  const ICE_GLOW = "#70f7ff"; // Pure glacial ice crystal
  const ROCK_DEEP = "#242730"; // Alterac mountain basalt
  const ROCK_MID = "#424857"; // Chiseled rock facet
  const ROCK_LGT = "#666f82"; // Rock edge highlight
  const SNOW_WHITE = "#f2f7fc"; // Fresh alpine snow
  const SNOW_SHADE = "#b0c5dc"; // Cool blue snow shadow
  const WOOD_TIMBER = "#2e2017"; // Clan totem cedar post

  const SUN_DIR = new THREE.Vector3(0.38, 0.85, 0.36).normalize();
  const SUN_GOLD = [1.0, 0.95, 0.84] as const;
  const SHADE_VIOLET = [0.16, 0.18, 0.26] as const;

  // Hand-painted fur material with dynamic value ramps
  const WOLF_COAT = paint((p, n) => {
    const fCoarse = noise(p, 0.26, 42);
    const fFine = noise(p, 0.05, 99);
    const height = p.y;

    const isBelly = smoothstep(0.2, -0.4, n.y) * 0.75 + smoothstep(0.85, 0.55, height) * 0.25;
    const isMantle = smoothstep(0.25, 0.85, n.y) * smoothstep(0.75, 1.15, height);

    let col = mix(SLATE_MID, SLATE_DARK, isMantle * 0.85 + (fCoarse - 0.5) * 0.2);
    col = mix(col, SILVER_ASH, smoothstep(0.55, 0.9, fCoarse) * 0.35);
    col = mix(col, CREAM, isBelly * 0.95);
    col = mix(col, CHARCOAL, (fFine - 0.5) * 0.18);

    const lit = n.dot(SUN_DIR);
    if (lit > 0.08) {
      col = mix(col, SUN_GOLD, (lit - 0.08) * 0.26);
    } else {
      col = mix(col, SHADE_VIOLET, (0.08 - lit) * 0.32);
    }
    return col;
  });

  const SNOUT_COAT = paint((p, n) => {
    const isTop = smoothstep(0.15, 0.7, n.y);
    let col = mix(SLATE_MID, CHARCOAL, isTop * 0.9);
    const fZ = smoothstep(1.05, 1.25, p.z);
    col = mix(col, CHARCOAL, fZ * 0.5);
    col = mix(col, CREAM, smoothstep(-0.1, -0.6, n.y) * 0.85);
    return col;
  });

  const ROCK_PAINT = paint((p, n) => {
    const n1 = noise(p, 0.24, 17);
    const n2 = noise(p, 0.06, 83);
    let c = mix(ROCK_DEEP, ROCK_MID, n1 * 0.7 + n2 * 0.3);
    if (n.y > 0.6) {
      c = mix(c, ROCK_LGT, 0.35);
      c = mix(c, SNOW_SHADE, (n.y - 0.6) * 1.6);
    }
    return c;
  });

  const SNOW_PAINT = paint((_p, n) => {
    return mix(SNOW_SHADE, SNOW_WHITE, smoothstep(-0.15, 0.65, n.y));
  });

  // ---------------------------------------------------------------------------
  // 2. TEXTURES
  // ---------------------------------------------------------------------------
  // Piercing glowing amber eye with feline/canine slit and fiery iris
  const EYE_TEX = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="64" cy="64" rx="60" ry="46" fill="#0b0a10"/>
      <radialGradient id="amberIris" cx="48%" cy="48%" r="52%">
        <stop offset="0%" stop-color="#fff885"/>
        <stop offset="30%" stop-color="#fbbf24"/>
        <stop offset="68%" stop-color="#d97706"/>
        <stop offset="92%" stop-color="#78350f"/>
        <stop offset="100%" stop-color="#1e0c03"/>
      </radialGradient>
      <circle cx="64" cy="64" r="42" fill="url(#amberIris)"/>
      <circle cx="64" cy="64" r="42" fill="none" stroke="#3b1602" stroke-width="3"/>
      <path d="M 64 24 L 64 34 M 64 94 L 64 104 M 24 64 L 34 64 M 94 64 L 104 64 M 36 36 L 44 44 M 92 36 L 84 44 M 36 92 L 44 84 M 92 92 L 84 84" stroke="#fef08a" stroke-width="2.8" opacity="0.9"/>
      <ellipse cx="64" cy="64" rx="11" ry="30" fill="#0c0712"/>
      <circle cx="53" cy="50" r="9" fill="#ffffff" opacity="0.98"/>
      <circle cx="75" cy="74" r="4.5" fill="#ffffff" opacity="0.88"/>
      <path d="M 8 64 Q 64 16 120 64" stroke="#181320" stroke-width="8" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  // Frostwolf clan carved emblem
  const RUNE_TEX = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <polygon points="64,8 116,38 116,98 64,124 12,98 12,38" fill="#1b2029" stroke="#2ef0ea" stroke-width="6"/>
      <polygon points="64,20 102,44 102,90 64,110 26,90 26,44" fill="#0f131a" stroke="#127878" stroke-width="3"/>
      <path d="M 64 28 L 74 46 L 90 52 L 78 66 L 84 86 L 64 76 L 44 86 L 50 66 L 38 52 L 54 46 Z" fill="#2ef0ea" stroke="#ffffff" stroke-width="2.5"/>
      <circle cx="64" cy="56" r="5" fill="#ffffff"/>
      <path d="M 64 76 L 64 102 M 48 90 L 80 90" stroke="#70f7ff" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // 3. SKELETON SETUP (DYNAMIC ALERT STANCE)
  // ---------------------------------------------------------------------------
  // Alert predator stance: raised proud withers, deep chest, spring in the hocks
  const hips = b.joint("hips", { at: [0, 0.86, -0.28] });

  const spineChain = b.chain(
    "spine",
    catmull([
      [0, 0.86, -0.28],
      [0, 0.92, 0.02],
      [0, 1.06, 0.34],
    ]),
    {
      parent: hips,
      role: "spine",
      names: ["spineBase", "spineMid", "chest"],
    },
  );
  const chest = spineChain.tip!;

  // Muscular neck rising with alert tension
  const neckChain = b.chain(
    "neck",
    catmull([
      [0, 1.06, 0.34],
      [0, 1.18, 0.58],
      [0, 1.3, 0.78],
    ]),
    {
      parent: chest,
      role: "neck",
      names: ["neckBase", "neckMid", "neckTop"],
    },
  );
  const neckTop = neckChain.tip!;

  // Head held high, looking slightly up and forward
  const head = b.joint("head", {
    parent: neckTop,
    at: [0, 1.34, 0.9],
    dir: [0, 0.08, 0.996],
    role: "head",
    group: "head",
  });

  // Jaw hinged open in a snarl
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.25, 0.96],
    dir: [0, -0.15, 0.988],
    role: "jaw",
    group: "head",
  });

  // Bushy curved wolf tail
  const tailChain = b.chain(
    "tail",
    catmull([
      [0, 0.86, -0.3],
      [0, 0.84, -0.52],
      [0, 0.72, -0.76],
      [0, 0.54, -0.96],
      [0, 0.36, -1.08],
    ]),
    {
      parent: hips,
      role: "tail",
      count: 4,
      names: ["tail1", "tail2", "tail3", "tail4"],
    },
  );

  // ---------------------------------------------------------------------------
  // 4. TORSO, SHOULDERS & NECK RUFF
  // ---------------------------------------------------------------------------
  // Muscular torso loft: lean pelvis, tuck at waist, massive deep chest
  b.loft(
    [
      { at: [0, 0.86, -0.28], w: 0.42, h: 0.38 }, // Pelvis / Rump
      { at: [0, 0.89, -0.04], w: 0.38, h: 0.38 }, // Flank tuck
      { at: [0, 0.98, 0.18], w: 0.54, h: 0.56 }, // Ribcage
      { at: [0, 1.06, 0.38], w: 0.58, h: 0.64 }, // Deep proud chest
      { at: [0, 1.12, 0.52], w: 0.5, h: 0.58 }, // High withers
    ],
    {
      bone: [hips, spineChain.joints[0], chest],
      color: WOLF_COAT,
      group: "torso",
    },
  );

  // Voluminous muscular neck ruff
  b.loft(
    [
      { at: [0, 1.12, 0.52], w: 0.5, h: 0.58 },
      { at: [0, 1.2, 0.68], w: 0.44, h: 0.5 },
      { at: [0, 1.28, 0.82], w: 0.34, h: 0.4 },
    ],
    {
      bone: [chest, neckChain.joints[0], neckTop],
      color: WOLF_COAT,
      group: "neck",
    },
  );

  // Forward chest bib - deep cream fur projection down the brisket
  b.frustumBox([0, 1.0, 0.52], [0, 0.88, 0.66], [0.38, 0.42], [0.24, 0.28], {
    bone: chest,
    color: CREAM,
    group: "neck",
  });

  // ---------------------------------------------------------------------------
  // 5. HEAD, SNOUT & EXPRESSIVE FACE
  // ---------------------------------------------------------------------------
  // Cranium: wide zygomatic wedge tapering toward brow
  b.frustumBox([0, 1.32, 0.78], [0, 1.35, 1.0], [0.32, 0.24], [0.26, 0.2], {
    bone: head,
    color: WOLF_COAT,
    group: "head",
  });

  // Furrowed brow ridge (fierce V-shape hooded over the eyes)
  b.frustumBox([0, 1.37, 0.94], [0, 1.34, 1.08], [0.26, 0.09], [0.22, 0.08], {
    bone: head,
    color: CHARCOAL,
    group: "head",
  });

  // Upper Snout (Tapered, sculpted bridge with charcoal dorsal stripe)
  b.frustumBox([0, 1.32, 1.02], [0, 1.27, 1.28], [0.18, 0.16], [0.12, 0.12], {
    bone: head,
    color: SNOUT_COAT,
    group: "head",
  });

  // Snarl wrinkles along bridge of nose
  for (let i = 0; i < 3; i++) {
    const zPos = 1.08 + i * 0.06;
    b.part(new THREE.BoxGeometry(0.14 - i * 0.02, 0.016, 0.024), CHARCOAL, {
      bone: head,
      at: [0, 1.32 - i * 0.018, zPos],
      rotation: [-10, 0, 0],
      group: "head",
    });
  }

  // Large wet leather nose pad with nostrils
  b.part(new THREE.BoxGeometry(0.09, 0.065, 0.05), NOSE_LEATHER, {
    bone: head,
    at: [0, 1.275, 1.29],
    rotation: [12, 0, 0],
    group: "head",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.018, 0.014, 0.02), "#050608", {
      bone: head,
      at: [s * 0.025, 1.27, 1.31],
      group: "head",
    });
  }

  // Upper lip jowls snarling, revealing gums
  b.frustumBox([0, 1.24, 1.02], [0, 1.22, 1.25], [0.18, 0.06], [0.12, 0.05], {
    bone: head,
    color: CHARCOAL,
    group: "head",
  });

  // Lower Jaw (Hinged downward)
  b.frustumBox([0, 1.22, 0.98], [0, 1.18, 1.24], [0.15, 0.08], [0.09, 0.06], {
    bone: jaw,
    color: CREAM,
    group: "head",
  });

  // Mouth Interior: dark red gums and tongue
  b.frustumBox([0, 1.23, 1.02], [0, 1.21, 1.19], [0.11, 0.04], [0.07, 0.025], {
    bone: jaw,
    color: GUM_DARK,
    group: "head",
  });
  b.capsule([0, 1.22, 1.04], [0, 1.2, 1.2], 0.022, {
    bone: jaw,
    color: TONGUE_ROSE,
    group: "head",
  });

  // Gigantic Warcraft Sabre Canines (Upper)
  for (const s of [1, -1]) {
    b.spike([s * 0.052, 1.23, 1.19], [s * 0.05, -1, 0.15], 0.09, 0.018, {
      bone: head,
      color: PALE_IVORY,
      group: "head",
    });
    // Upper secondary fangs
    b.spike([s * 0.058, 1.23, 1.12], [s * 0.04, -1, 0.05], 0.055, 0.013, {
      bone: head,
      color: PALE_IVORY,
      group: "head",
    });
  }

  // Lower tusk fangs (pointing up, interlocking outside upper jaw)
  for (const s of [1, -1]) {
    b.spike([s * 0.042, 1.21, 1.18], [s * 0.04, 1, -0.1], 0.075, 0.016, {
      bone: jaw,
      color: PALE_IVORY,
      group: "head",
    });
  }

  // Front incisors
  for (let i = -2; i <= 2; i++) {
    b.spike([i * 0.016, 1.23, 1.24], [0, -1, 0.02], 0.03, 0.006, {
      bone: head,
      color: PALE_IVORY,
      group: "head",
    });
    b.spike([i * 0.014, 1.21, 1.23], [0, 1, -0.02], 0.026, 0.005, {
      bone: jaw,
      color: PALE_IVORY,
      group: "head",
    });
  }

  // Piercing Glowing Eyes (Emissive, angled for strong 3/4 readability)
  for (const s of [1, -1]) {
    // Angular eye socket housing
    b.part(new THREE.BoxGeometry(0.045, 0.045, 0.045), CHARCOAL, {
      bone: head,
      at: [s * 0.105, 1.34, 1.05],
      rotation: [0, s * 22, 0],
      group: "head",
    });

    // Radiant glowing eye decal plate
    const eyeMesh = b.part(new THREE.PlaneGeometry(0.08, 0.065), "#ffffff", {
      bone: head,
      at: [s * 0.11, 1.345, 1.055],
      dir: [s * 0.42, 0.06, 0.9],
      axis: "z",
      texture: EYE_TEX,
      group: "head",
    });
    glow(eyeMesh, 1.8);

    // Arched brow furrow over eye
    b.extrude(
      [
        [0, 0],
        [0.1, 0.03],
        [0.08, 0.06, "sharp"],
        [0, 0.04],
      ],
      {
        at: [s * 0.05, 1.365, 1.01],
        x: [s * 0.85, 0.08, 0.52],
        y: [0, 1, 0],
        thickness: 0.035,
        bevel: 0.006,
        color: CHARCOAL,
        bone: head,
        group: "head",
      },
    );
  }

  // Multi-Tiered Sculpted Cheek Ruffs (Sweeping backward-downward in jagged blades)
  for (const s of [1, -1]) {
    // Top cheek blade (Cream highlight)
    b.extrude(
      [
        [0, 0],
        [0.18, -0.05],
        [0.12, -0.14, "sharp"],
        [0.22, -0.18, "sharp"],
        [0.09, -0.25],
        [0.18, -0.3, "sharp"],
        [0, -0.26],
      ],
      {
        at: [s * 0.12, 1.31, 0.92],
        x: [s * 0.72, -0.3, -0.63],
        y: [0, 0.9, -0.44],
        thickness: 0.055,
        bevel: 0.012,
        color: CREAM,
        bone: head,
        group: "head",
      },
    );

    // Mid cheek blade (Silver slate)
    b.extrude(
      [
        [0, 0],
        [0.14, -0.06],
        [0.08, -0.16, "sharp"],
        [0.15, -0.22, "sharp"],
        [0, -0.18],
      ],
      {
        at: [s * 0.14, 1.28, 0.98],
        x: [s * 0.75, -0.26, -0.6],
        y: [0, 0.9, -0.44],
        thickness: 0.042,
        bevel: 0.009,
        color: SILVER_ASH,
        bone: head,
        group: "head",
      },
    );

    // Bottom cheek blade (Dark slate)
    b.extrude(
      [
        [0, 0],
        [0.12, -0.05],
        [0.07, -0.13, "sharp"],
        [0.13, -0.18, "sharp"],
        [0, -0.15],
      ],
      {
        at: [s * 0.13, 1.24, 0.88],
        x: [s * 0.75, -0.25, -0.6],
        y: [0, 0.9, -0.44],
        thickness: 0.038,
        bevel: 0.008,
        color: SLATE_DARK,
        bone: head,
        group: "head",
      },
    );
  }

  // Alert Wolf Ears (Sculpted, cupped, well-attached without floating geometry)
  for (const s of [1, -1]) {
    const earJoint = b.joint(s === 1 ? "earL" : "earR", {
      parent: head,
      at: [s * 0.11, 1.42, 0.86],
      dir: [s * 0.28, 0.88, 0.38],
      role: "hinge",
      group: "head",
    });

    // Outer dark shell
    b.extrude(
      [
        [0, 0],
        [0.11, 0],
        [0.075, 0.24, "sharp"],
        [-0.035, 0.18],
      ],
      {
        at: earJoint.at,
        x: [s * 0.7, 0.65, 0.3],
        y: [-0.2, 0.88, -0.43],
        thickness: 0.035,
        bevel: 0.008,
        color: SLATE_DARK,
        bone: earJoint,
        group: "head",
      },
    );

    // Inner ear warm cream fur tufts
    b.extrude(
      [
        [0.015, 0.025],
        [0.085, 0.025],
        [0.055, 0.18, "sharp"],
        [-0.015, 0.13],
      ],
      {
        at: [s * 0.11, 1.425, 0.87],
        x: [s * 0.7, 0.65, 0.3],
        y: [-0.2, 0.88, -0.43],
        thickness: 0.022,
        bevel: 0.005,
        color: CREAM,
        bone: earJoint,
        group: "head",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // 6. CONTINUOUS DORSAL CREST & SHOULDER MANTLE
  // ---------------------------------------------------------------------------
  // Layered, flowing fur blades along the spine
  const maneBlades = [
    { at: [0, 1.4, 0.78], w: 0.18, h: 0.2, bone: neckTop, col: CHARCOAL },
    { at: [0, 1.32, 0.64], w: 0.22, h: 0.26, bone: neckChain.joints[0], col: CHARCOAL },
    { at: [0, 1.22, 0.48], w: 0.26, h: 0.3, bone: chest, col: CHARCOAL }, // Peak of withers
    { at: [0, 1.13, 0.32], w: 0.24, h: 0.26, bone: chest, col: CHARCOAL },
    { at: [0, 1.04, 0.14], w: 0.2, h: 0.22, bone: spineChain.joints[0], col: SLATE_DARK },
    { at: [0, 0.96, -0.06], w: 0.18, h: 0.18, bone: spineChain.joints[0], col: SLATE_DARK },
    { at: [0, 0.9, -0.22], w: 0.16, h: 0.14, bone: hips, col: SLATE_DARK },
  ];

  maneBlades.forEach((mb) => {
    b.extrude(
      [
        [0, 0],
        [mb.w * 0.5, mb.h * 0.45],
        [0, mb.h, "sharp"],
        [-mb.w * 0.5, mb.h * 0.45],
      ],
      {
        at: mb.at,
        x: [0, -0.32, -0.95],
        y: [0, 0.95, -0.32],
        thickness: 0.068,
        bevel: 0.012,
        color: mb.col,
        bone: mb.bone,
        group: "mane",
      },
    );
  });

  // Heavy shoulder fur drape cascading down both sides
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.16, -0.08],
        [0.09, -0.21, "sharp"],
        [0.2, -0.29, "sharp"],
        [0, -0.25],
      ],
      {
        at: [s * 0.22, 1.14, 0.46],
        x: [s * 0.72, -0.35, -0.6],
        y: [0, 0.9, -0.44],
        thickness: 0.055,
        bevel: 0.01,
        color: SLATE_DARK,
        bone: chest,
        group: "mane",
      },
    );

    b.extrude(
      [
        [0, 0],
        [0.14, -0.06],
        [0.08, -0.17, "sharp"],
        [0.14, -0.23, "sharp"],
        [0, -0.19],
      ],
      {
        at: [s * 0.24, 1.02, 0.3],
        x: [s * 0.78, -0.28, -0.56],
        y: [0, 0.9, -0.44],
        thickness: 0.045,
        bevel: 0.008,
        color: SILVER_ASH,
        bone: chest,
        group: "mane",
      },
    );

    // Haunch hip fur flare
    b.extrude(
      [
        [0, 0],
        [0.15, -0.06],
        [0.09, -0.19, "sharp"],
        [0, -0.15],
      ],
      {
        at: [s * 0.22, 0.86, -0.2],
        x: [s * 0.65, -0.3, -0.7],
        y: [0, 0.92, -0.4],
        thickness: 0.045,
        bevel: 0.008,
        color: SLATE_DARK,
        bone: hips,
        group: "mane",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // 7. FROSTWOLF WAR HARNESS & GLOWING TALISMAN
  // ---------------------------------------------------------------------------
  // Studded leather war collar wrapping the base of the neck
  const collarPath = catmull(
    [
      [0, 1.25, 0.56],
      [0.26, 1.12, 0.6],
      [0, 0.95, 0.72],
      [-0.26, 1.12, 0.6],
    ],
    { closed: true },
  );
  b.sweep(collarPath, 0.028, {
    bone: chest,
    color: LEATHER_WARM,
    group: "gear",
  });

  // Heavy bronze studs along collar
  for (let i = 0; i < 8; i++) {
    const t = i / 8;
    const pt = collarPath.at(t);
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.016, 6), BRONZE_IRON, {
      at: pt,
      bone: chest,
      group: "gear",
    });
  }

  // Hanging mammoth fangs mounted on bronze rings
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.025, 0.006, 6, 12), BRONZE_IRON, {
      at: [s * 0.09, 1.01, 0.7],
      bone: chest,
      group: "gear",
    });
    b.spike([s * 0.09, 0.99, 0.7], [s * 0.04, -1, 0.15], 0.13, 0.022, {
      bone: chest,
      color: BONE_TUSK,
      group: "gear",
    });
  }

  // Central Frostwolf Runic Talisman (Large, high on brisket, facing camera)
  b.extrude(
    [
      [0, 0.065],
      [0.055, 0.032],
      [0.055, -0.032],
      [0, -0.065],
      [-0.055, -0.032],
      [-0.055, 0.032],
    ],
    {
      at: [0, 0.92, 0.76],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.026,
      bevel: 0.006,
      color: ROCK_DEEP,
      bone: chest,
      group: "gear",
    },
  );

  // Glowing Frostwolf Rune on Talisman
  const runePlate = b.part(new THREE.PlaneGeometry(0.08, 0.08), "#ffffff", {
    at: [0, 0.92, 0.778],
    dir: [0, 0.12, 0.99],
    axis: "z",
    texture: RUNE_TEX,
    bone: chest,
    group: "gear",
  });
  glow(runePlate, 2.0);

  // ---------------------------------------------------------------------------
  // 8. FORELIMBS (NATURAL CANINE JOINTS & PAWS)
  // ---------------------------------------------------------------------------
  // Realistic canine IK: Shoulder -> Elbow (tucked back) -> Carpus (wrist) -> Pastern -> Paw
  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    const shoulderPt: [number, number, number] = [s * 0.24, 0.98, 0.36];
    const pawTarget: [number, number, number] = [s * 0.24, 0.15, 0.46];

    // Deltoid muscular shoulder dome
    b.part(new THREE.SphereGeometry(0.15, 8, 6), WOLF_COAT, {
      at: shoulderPt,
      scale: [0.85, 1.25, 1.1],
      bone: chest,
      group: "foreleg",
    });

    const frontPts = limb(
      shoulderPt,
      pawTarget,
      [0.4, 0.36, 0.16],
      [[0, 0, -1]], // Elbow points BACK
      { sole: [0, 0, 1] },
    );

    const legChain = b.chain(`legF${side}`, frontPts, {
      parent: chest,
      role: "leg",
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `pawF${side}`],
    });

    // Upper arm (humerus)
    b.sweep(catmull([frontPts[0], frontPts[1]]), (t) => 0.105 - t * 0.025, {
      bone: legChain.joints[0],
      color: WOLF_COAT,
      group: "foreleg",
    });

    // Elbow back-flange fur tuft
    b.extrude(
      [
        [0, 0],
        [0.1, -0.05],
        [0.05, -0.17, "sharp"],
        [0, -0.12],
      ],
      {
        at: frontPts[1],
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: 0.035,
        bevel: 0.006,
        color: SLATE_DARK,
        bone: legChain.joints[1],
        group: "foreleg",
      },
    );

    // Forearm (radius/ulna)
    b.sweep(catmull([frontPts[1], frontPts[2]]), (t) => 0.082 - t * 0.02, {
      bone: legChain.joints[1],
      color: WOLF_COAT,
      group: "foreleg",
    });

    // Pastern down to foot (angled slightly forward)
    b.sweep(catmull([frontPts[2], frontPts[3]]), 0.062, {
      bone: legChain.joints[2],
      color: WOLF_COAT,
      group: "foreleg",
    });

    // Front Paw (Broad, heavy, low-poly wolf foot)
    const pawBone = legChain.tip!;
    b.frustumBox(
      [s * 0.24, 0.165, 0.42],
      [s * 0.24, 0.145, 0.5],
      [0.15, 0.075],
      [0.14, 0.065],
      {
        bone: pawBone,
        color: WOLF_COAT,
        group: "paw",
      },
    );

    // 4 Articulated Toes with Obsidian Claws
    const frontToeDefs = [
      { x: s * 0.05, z: 0.015 },
      { x: s * 0.018, z: 0.048 },
      { x: -s * 0.018, z: 0.048 },
      { x: -s * 0.05, z: 0.015 },
    ];

    frontToeDefs.forEach((to) => {
      const tStart: [number, number, number] = [s * 0.24 + to.x, 0.145, 0.5 + to.z];
      const tEnd: [number, number, number] = [s * 0.24 + to.x, 0.14, 0.55 + to.z];

      b.capsule(tStart, tEnd, 0.022, {
        bone: pawBone,
        color: WOLF_COAT,
        group: "paw",
      });

      // Curved black claw
      b.spike(tEnd, [0, -0.018, 0.04], 0.045, 0.009, {
        bone: pawBone,
        color: CLAW_BLACK,
        group: "paw",
      });

      // Underside toe pad
      b.part(new THREE.BoxGeometry(0.024, 0.008, 0.024), NOSE_LEATHER, {
        at: [tStart[0], 0.132, tStart[2]],
        bone: pawBone,
        group: "paw",
      });
    });

    // Central metacarpal palm pad
    b.part(new THREE.BoxGeometry(0.095, 0.012, 0.075), NOSE_LEATHER, {
      at: [s * 0.24, 0.132, 0.46],
      bone: pawBone,
      group: "paw",
    });
  }

  // ---------------------------------------------------------------------------
  // 9. HINDLIMBS (POWERFUL CROUCH & HOCKS)
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    const hipPt: [number, number, number] = [s * 0.2, 0.84, -0.28];
    const hindPawTarget: [number, number, number] = [s * 0.22, 0.125, -0.38];

    // Muscular haunch globe
    b.part(new THREE.SphereGeometry(0.17, 8, 6), WOLF_COAT, {
      at: [s * 0.21, 0.76, -0.26],
      scale: [0.82, 1.32, 1.18],
      bone: hips,
      group: "hindleg",
    });

    const hindPts = limb(
      hipPt,
      hindPawTarget,
      [0.38, 0.36, 0.16],
      [[0, 0, 1]], // Stifle (knee) points FORWARD
      { sole: [0, 0, 1] },
    );

    const legChain = b.chain(`legH${side}`, hindPts, {
      parent: hips,
      role: "leg",
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `pawH${side}`],
    });

    // Thigh (Femur)
    b.sweep(catmull([hindPts[0], hindPts[1]]), (t) => 0.125 - t * 0.035, {
      bone: legChain.joints[0],
      color: WOLF_COAT,
      group: "hindleg",
    });

    // Shank / Crus (Knee to Hock)
    b.sweep(catmull([hindPts[1], hindPts[2]]), (t) => 0.09 - t * 0.024, {
      bone: legChain.joints[1],
      color: WOLF_COAT,
      group: "hindleg",
    });

    // Hock fur tuft pointing backward
    b.extrude(
      [
        [0, 0],
        [0.1, -0.04],
        [0.05, -0.16, "sharp"],
        [0, -0.11],
      ],
      {
        at: hindPts[2],
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: 0.032,
        bevel: 0.006,
        color: SLATE_DARK,
        bone: legChain.joints[2],
        group: "hindleg",
      },
    );

    // Rear metatarsus
    b.sweep(catmull([hindPts[2], hindPts[3]]), 0.058, {
      bone: legChain.joints[2],
      color: WOLF_COAT,
      group: "hindleg",
    });

    // Hind Paw
    const pawBone = legChain.tip!;
    b.frustumBox(
      [s * 0.22, 0.14, -0.4],
      [s * 0.22, 0.12, -0.33],
      [0.14, 0.07],
      [0.13, 0.06],
      {
        bone: pawBone,
        color: WOLF_COAT,
        group: "paw",
      },
    );

    // 4 Hind Toes & Claws
    const hindToeDefs = [
      { x: s * 0.046, z: 0.015 },
      { x: s * 0.017, z: 0.048 },
      { x: -s * 0.017, z: 0.048 },
      { x: -s * 0.046, z: 0.015 },
    ];

    hindToeDefs.forEach((to) => {
      const tStart: [number, number, number] = [s * 0.22 + to.x, 0.12, -0.33 + to.z];
      const tEnd: [number, number, number] = [s * 0.22 + to.x, 0.115, -0.28 + to.z];

      b.capsule(tStart, tEnd, 0.02, {
        bone: pawBone,
        color: WOLF_COAT,
        group: "paw",
      });

      b.spike(tEnd, [0, -0.015, 0.04], 0.04, 0.008, {
        bone: pawBone,
        color: CLAW_BLACK,
        group: "paw",
      });

      b.part(new THREE.BoxGeometry(0.022, 0.008, 0.022), NOSE_LEATHER, {
        at: [tStart[0], 0.108, tStart[2]],
        bone: pawBone,
        group: "paw",
      });
    });

    b.part(new THREE.BoxGeometry(0.085, 0.01, 0.065), NOSE_LEATHER, {
      at: [s * 0.22, 0.108, -0.36],
      bone: pawBone,
      group: "paw",
    });
  }

  // ---------------------------------------------------------------------------
  // 10. PLUMED WOLF TAIL
  // ---------------------------------------------------------------------------
  b.sweep(
    tailChain,
    (t) => {
      const bell = Math.sin(t * Math.PI);
      return 0.09 + 0.1 * bell;
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

  // Underside hanging fur tufts along tail curve
  b.along(tailChain, 3, (at) => {
    b.spike(at, [0, -0.85, -0.52], 0.15, 0.038, {
      bone: at.bone,
      color: CHARCOAL,
      group: "tail",
    });
  });

  // Dark brush tip
  b.spike([0, 0.36, -1.08], [0, -0.25, -0.96], 0.18, 0.055, {
    bone: tailChain.joints[3],
    color: CHARCOAL,
    group: "tail",
  });

  // ---------------------------------------------------------------------------
  // 11. ALTERAC MOUNTAIN CRAG & CLAN TOTEM SCENERY
  // ---------------------------------------------------------------------------
  // Guaranteed lowest point: Solid foundation block strictly seated at y = 0.0 to 0.06
  b.part(new THREE.BoxGeometry(1.3, 0.06, 1.7), ROCK_PAINT, {
    at: [0, 0.03, -0.02],
    flat: true,
    group: "base",
  });

  // Upper crag tier
  b.part(new THREE.BoxGeometry(0.96, 0.05, 1.35), ROCK_PAINT, {
    at: [0, 0.085, 0.05],
    flat: true,
    group: "base",
  });

  // Elevated rock slab for front paws
  b.part(new THREE.BoxGeometry(0.74, 0.05, 0.46), ROCK_PAINT, {
    at: [0, 0.135, 0.46],
    flat: true,
    group: "base",
  });

  // Elevated rock slab for hind paws
  b.part(new THREE.BoxGeometry(0.74, 0.04, 0.42), ROCK_PAINT, {
    at: [0, 0.11, -0.34],
    flat: true,
    group: "base",
  });

  // Flanking chiseled rock boulders (seated safely at y >= 0.06)
  b.extrude(
    [
      [0, 0],
      [0.26, 0],
      [0.2, 0.2, "sharp"],
      [-0.04, 0.15],
    ],
    {
      at: [-0.52, 0.06, 0.14],
      x: [0.92, 0, 0.38],
      y: [0, 1, 0],
      thickness: 0.36,
      bevel: 0.02,
      color: ROCK_PAINT,
      group: "base",
    },
  );

  b.extrude(
    [
      [0, 0],
      [0.28, 0],
      [0.22, 0.22, "sharp"],
      [0.02, 0.16],
    ],
    {
      at: [0.42, 0.06, -0.1],
      x: [0.88, 0, -0.47],
      y: [0, 1, 0],
      thickness: 0.38,
      bevel: 0.02,
      color: ROCK_PAINT,
      group: "base",
    },
  );

  // Stylized alpine snow crusts settled on ledges
  b.part(new THREE.BoxGeometry(0.36, 0.04, 0.38), SNOW_PAINT, {
    at: [0.32, 0.09, 0.22],
    flat: true,
    group: "base",
  });

  b.part(new THREE.BoxGeometry(0.38, 0.04, 0.4), SNOW_PAINT, {
    at: [-0.34, 0.085, -0.08],
    flat: true,
    group: "base",
  });

  b.part(new THREE.BoxGeometry(0.68, 0.035, 0.3), SNOW_PAINT, {
    at: [0, 0.085, -0.64],
    flat: true,
    group: "base",
  });

  // Frostwolf Clan Boundary Totem Post (Back-right background prop)
  b.part(new THREE.BoxGeometry(0.12, 0.44, 0.12), WOOD_TIMBER, {
    at: [0.46, 0.28, -0.58],
    flat: true,
    group: "prop",
  });

  // Leather binding on totem post
  b.sweep(
    catmull([
      [0.4, 0.28, -0.58],
      [0.46, 0.28, -0.52],
      [0.52, 0.28, -0.58],
      [0.46, 0.28, -0.64],
    ], { closed: true }),
    0.016,
    { color: LEATHER_WARM, group: "prop" },
  );

  // Carved skull/horn ornament atop totem
  b.spike([0.46, 0.5, -0.58], [0, 1, 0], 0.09, 0.042, {
    color: BONE_TUSK,
    group: "prop",
  });
  for (const s of [1, -1]) {
    b.spike([0.46, 0.52, -0.58], [s * 0.7, 0.4, -0.2], 0.12, 0.018, {
      color: BONE_TUSK,
      group: "prop",
    });
  }

  // Glowing Frostwolf Rune Plaque on totem
  const totemRune = b.part(new THREE.PlaneGeometry(0.085, 0.085), "#ffffff", {
    at: [0.46, 0.36, -0.518],
    dir: [0, 0, 1],
    axis: "z",
    texture: RUNE_TEX,
    group: "prop",
  });
  glow(totemRune, 1.8);

  // Mystical Glacial Frost Ice Spire (Back-left background prop)
  const crystalSpire = b.spike([-0.45, 0.06, -0.55], [-0.1, 1, 0.05], 0.36, 0.058, {
    color: ICE_GLOW,
    flat: true,
    group: "prop",
  });
  glow(crystalSpire, 1.3);

  // Secondary small ice shard
  const crystalShard = b.spike([-0.51, 0.06, -0.47], [-0.25, 1, 0.2], 0.2, 0.038, {
    color: ICE_GLOW,
    flat: true,
    group: "prop",
  });
  glow(crystalShard, 1.3);

  // Snow drift around crystals
  b.part(new THREE.BoxGeometry(0.24, 0.045, 0.22), SNOW_PAINT, {
    at: [-0.46, 0.08, -0.52],
    flat: true,
    group: "prop",
  });

  return b.root;
}
```