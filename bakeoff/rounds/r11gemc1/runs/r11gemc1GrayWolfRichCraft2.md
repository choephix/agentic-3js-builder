An inspection of the renders shows several critical weaknesses in silhouette, anatomy, and Warcraft styling:

1. **Stiff, columnar limbs**: The front legs are completely straight vertical poles without natural canine joints, making the wolf look like a toy table. Real alert wolves (especially stylized Warcraft timber wolves) have shoulders slung low-and-wide, elbows angled back, wrists flexing forward, and deep crouching hocks.
2. **Snout and cheek ruffs**: The muzzle is an overly wide, flat, pitch-black box. The cheek ruffs stick out horizontally at 90° like rigid cardboard wings rather than sweeping diagonally backward along the jawline.
3. **Muted, invisible face**: The eyes and mouth are lost in dark shadow. The eyes must pierce through with glowing amber warmth, defined brows, and sculpted snarl features.
4. **Mane & Mantle**: The dorsal spine currently has 7 isolated triangular plates resembling a stegosaurus rather than the iconic, flowing, tiered fur mantle of a Frostwolf mount.
5. **Hidden accessories**: The clan harness and talisman are buried invisibly underneath the brisket. They should sit proudly across the neck and chest with mammoth tusks and a radiant frost rune.
6. **Setting**: The plinth is boxy and sterile. It needs sharp, angular mountain crags, thick snow banks, and a Frostwolf clan marker post with glowing frost crystals.

Here is the complete overhaul:

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
  const rand = rng(2024);

  // ---------------------------------------------------------------------------
  // 1. PALETTE & SHADING
  // ---------------------------------------------------------------------------
  // Warcraft hand-painted palette: warm top-light, rich cool blue-slate shadow
  const CHARCOAL = "#1c1f28"; // Dorsal spine, muzzle bridge, claw obsidian
  const SLATE_DARK = "#2e3444"; // Upper mantle & outer ear shell
  const SLATE_MID = "#4d576a"; // Flanks, shoulder muscles
  const SILVER_ASH = "#7d889c"; // Mid-coat highlight
  const CREAM = "#f4ebd9"; // Cheek ruffs, neck bib, underbelly, inner ears
  const PALE_IVORY = "#fffbf0"; // Fangs, tooth charms, eye glints
  const NOSE_LEATHER = "#12141a"; // Textured nose pad
  const GUM_DARK = "#58202e"; // Mouth cavity
  const TONGUE_ROSE = "#93384e"; // Tongue
  const CLAW_BLACK = "#0f1015"; // Polished black talons
  const LEATHER_WARM = "#422818"; // Collar & harness straps
  const BRONZE_IRON = "#847565"; // Weathered iron/bronze studs & rings
  const BONE_TUSK = "#e8dec8"; // Mammoth tusks
  const FROST_CYAN = "#2ef0ea"; // Glowing Frostwolf rune
  const ICE_GLOW = "#70f7ff"; // Pure glacial ice crystal
  const ROCK_DEEP = "#282c35"; // Alterac mountain basalt
  const ROCK_MID = "#484f5f"; // Chiseled rock facet
  const ROCK_LGT = "#6b7487"; // Rock edge highlight
  const SNOW_WHITE = "#f2f7fc"; // Fresh alpine snow
  const SNOW_SHADE = "#b0c5dc"; // Cool blue snow shadow
  const WOOD_TIMBER = "#33241b"; // Clan totem cedar post

  const SUN_DIR = new THREE.Vector3(0.4, 0.82, 0.42).normalize();
  const SUN_GOLD = [1.0, 0.94, 0.82] as const;
  const SHADE_VIOLET = [0.18, 0.2, 0.28] as const;

  // Hand-painted fur material with dynamic value ramps
  const WOLF_COAT = paint((p, n) => {
    const fCoarse = noise(p, 0.28, 42);
    const fFine = noise(p, 0.06, 99);
    const height = p.y;

    const isBelly = smoothstep(0.18, -0.45, n.y) * 0.7 + smoothstep(0.8, 0.52, height) * 0.3;
    const isMantle = smoothstep(0.2, 0.8, n.y) * smoothstep(0.72, 1.08, height);

    let col = mix(SLATE_MID, SLATE_DARK, isMantle * 0.85 + (fCoarse - 0.5) * 0.2);
    col = mix(col, SILVER_ASH, smoothstep(0.55, 0.9, fCoarse) * 0.3);
    col = mix(col, CREAM, isBelly * 0.94);
    col = mix(col, CHARCOAL, (fFine - 0.5) * 0.15);

    const lit = n.dot(SUN_DIR);
    if (lit > 0.08) {
      col = mix(col, SUN_GOLD, (lit - 0.08) * 0.28);
    } else {
      col = mix(col, SHADE_VIOLET, (0.08 - lit) * 0.35);
    }
    return col;
  });

  const SNOUT_COAT = paint((p, n) => {
    const isTop = smoothstep(0.2, 0.7, n.y);
    let col = mix(SLATE_MID, CHARCOAL, isTop * 0.88);
    const fZ = smoothstep(1.05, 1.25, p.z);
    col = mix(col, CHARCOAL, fZ * 0.55);
    return col;
  });

  const ROCK_PAINT = paint((p, n) => {
    const n1 = noise(p, 0.22, 17);
    const n2 = noise(p, 0.05, 83);
    let c = mix(ROCK_DEEP, ROCK_MID, n1 * 0.65 + n2 * 0.35);
    if (n.y > 0.62) {
      c = mix(c, ROCK_LGT, 0.35);
      c = mix(c, SNOW_SHADE, (n.y - 0.62) * 1.8);
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
        <stop offset="35%" stop-color="#fbbf24"/>
        <stop offset="70%" stop-color="#d97706"/>
        <stop offset="95%" stop-color="#78350f"/>
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
      <!-- Frostwolf Head Icon -->
      <path d="M 64 28 L 74 46 L 90 52 L 78 66 L 84 86 L 64 76 L 44 86 L 50 66 L 38 52 L 54 46 Z" fill="#2ef0ea" stroke="#ffffff" stroke-width="2.5"/>
      <circle cx="64" cy="56" r="5" fill="#ffffff"/>
      <path d="M 64 76 L 64 102 M 48 90 L 80 90" stroke="#70f7ff" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  // Stylized fur fringe silhouette card
  const FUR_TUFT_TEX = svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M 4 0 L 22 75 L 32 128 L 42 75 L 60 0 L 38 42 L 32 0 L 26 42 Z" fill="#f4ebd9" stroke="#2a3040" stroke-width="3" stroke-linejoin="round"/>
      <path d="M 28 48 L 32 112 L 36 48 Z" fill="#ffffff" opacity="0.6"/>
    </svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------------------
  // 3. SKELETON SETUP (DYNAMIC ALERT STANCE)
  // ---------------------------------------------------------------------------
  // Alert posture: muscular crouch, withers proud, chest deep, head held high
  const hips = b.joint("hips", { at: [0, 0.78, -0.3] });

  const spineChain = b.chain(
    "spine",
    catmull([
      [0, 0.78, -0.3],
      [0, 0.85, -0.02],
      [0, 0.98, 0.28],
    ]),
    {
      parent: hips,
      role: "spine",
      names: ["spineBase", "spineMid", "chest"],
    },
  );
  const chest = spineChain.tip!;

  // Neck rising with alert muscular tension
  const neckChain = b.chain(
    "neck",
    catmull([
      [0, 0.98, 0.28],
      [0, 1.1, 0.52],
      [0, 1.22, 0.72],
    ]),
    {
      parent: chest,
      role: "neck",
      names: ["neckBase", "neckMid", "neckTop"],
    },
  );
  const neckTop = neckChain.tip!;

  // Head held proudly alert, facing +Z with slight upward tilt
  const head = b.joint("head", {
    parent: neckTop,
    at: [0, 1.28, 0.86],
    dir: [0, 0.05, 0.998],
    role: "head",
    group: "head",
  });

  // Jaw hinged slightly open in a fierce warning snarl
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.19, 0.92],
    dir: [0, -0.16, 0.98],
    role: "jaw",
    group: "head",
  });

  // Alert curved tail
  const tailChain = b.chain(
    "tail",
    catmull([
      [0, 0.78, -0.32],
      [0, 0.76, -0.52],
      [0, 0.65, -0.76],
      [0, 0.48, -0.96],
      [0, 0.32, -1.08],
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
  // Heroic, muscular ribcage and flank
  b.loft(
    [
      { at: [0, 0.78, -0.3], w: 0.42, h: 0.38 }, // Pelvis / Rump
      { at: [0, 0.81, -0.06], w: 0.36, h: 0.36 }, // Flank waist tuck
      { at: [0, 0.9, 0.16], w: 0.52, h: 0.54 }, // Mid ribcage
      { at: [0, 0.98, 0.34], w: 0.56, h: 0.62 }, // Deep proud chest
      { at: [0, 1.04, 0.5], w: 0.48, h: 0.56 }, // High withers
    ],
    {
      bone: [hips, spineChain.joints[0], chest],
      color: WOLF_COAT,
      group: "torso",
    },
  );

  // Massive, thick neck ruff with muscular bulk
  b.loft(
    [
      { at: [0, 1.04, 0.5], w: 0.48, h: 0.56 },
      { at: [0, 1.12, 0.64], w: 0.42, h: 0.48 },
      { at: [0, 1.22, 0.78], w: 0.32, h: 0.38 },
    ],
    {
      bone: [chest, neckChain.joints[0], neckTop],
      color: WOLF_COAT,
      group: "neck",
    },
  );

  // Forward chest bib - deep cream fur projection
  b.frustumBox([0, 0.92, 0.48], [0, 0.82, 0.62], [0.36, 0.4], [0.22, 0.28], {
    bone: chest,
    color: CREAM,
    group: "neck",
  });

  // ---------------------------------------------------------------------------
  // 5. HEAD, SNOUT & EXPRESSIVE FACE
  // ---------------------------------------------------------------------------
  // Main Cranium: chiseled wedge with strong temporal arches
  b.frustumBox([0, 1.26, 0.74], [0, 1.29, 0.96], [0.28, 0.22], [0.24, 0.18], {
    bone: head,
    color: WOLF_COAT,
    group: "head",
  });

  // Brow Ridge furrow - V-shape over eyes
  b.frustumBox([0, 1.3, 0.9], [0, 1.28, 1.04], [0.24, 0.08], [0.2, 0.07], {
    bone: head,
    color: CHARCOAL,
    group: "head",
  });

  // Upper Snout (Tapered bridge)
  b.frustumBox([0, 1.26, 0.98], [0, 1.21, 1.25], [0.18, 0.15], [0.11, 0.11], {
    bone: head,
    color: SNOUT_COAT,
    group: "head",
  });

  // Snarl wrinkles along bridge of nose
  for (let i = 0; i < 3; i++) {
    const zPos = 1.05 + i * 0.06;
    b.part(new THREE.BoxGeometry(0.14 - i * 0.02, 0.015, 0.025), CHARCOAL, {
      bone: head,
      at: [0, 1.265 - i * 0.018, zPos],
      rotation: [-10, 0, 0],
      group: "head",
    });
  }

  // Large wet leather nose pad with nostrils
  b.part(new THREE.BoxGeometry(0.085, 0.06, 0.05), NOSE_LEATHER, {
    bone: head,
    at: [0, 1.215, 1.26],
    rotation: [12, 0, 0],
    group: "head",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.018, 0.014, 0.02), "#050608", {
      bone: head,
      at: [s * 0.024, 1.21, 1.28],
      group: "head",
    });
  }

  // Upper lip jowls with ivory fangs showing
  b.frustumBox([0, 1.18, 0.98], [0, 1.16, 1.22], [0.18, 0.05], [0.11, 0.04], {
    bone: head,
    color: CHARCOAL,
    group: "head",
  });

  // Lower Jaw (Mounted on jaw joint, angled down)
  b.frustumBox([0, 1.16, 0.94], [0, 1.13, 1.21], [0.15, 0.08], [0.09, 0.06], {
    bone: jaw,
    color: CREAM,
    group: "head",
  });

  // Mouth Interior: dark gums and tongue
  b.frustumBox([0, 1.17, 0.98], [0, 1.155, 1.16], [0.11, 0.04], [0.07, 0.025], {
    bone: jaw,
    color: GUM_DARK,
    group: "head",
  });
  b.capsule([0, 1.16, 1.0], [0, 1.145, 1.17], 0.022, {
    bone: jaw,
    color: TONGUE_ROSE,
    group: "head",
  });

  // Lethal sabre canine fangs (Upper)
  for (const s of [1, -1]) {
    b.spike([s * 0.048, 1.17, 1.16], [s * 0.05, -1, 0.15], 0.082, 0.016, {
      bone: head,
      color: PALE_IVORY,
      group: "head",
    });
    // Upper secondary fangs
    b.spike([s * 0.054, 1.17, 1.09], [s * 0.04, -1, 0.05], 0.048, 0.012, {
      bone: head,
      color: PALE_IVORY,
      group: "head",
    });
  }

  // Lower canine fangs (Upper-pointing)
  for (const s of [1, -1]) {
    b.spike([s * 0.038, 1.15, 1.15], [s * 0.04, 1, -0.1], 0.068, 0.015, {
      bone: jaw,
      color: PALE_IVORY,
      group: "head",
    });
  }

  // Incisors front teeth
  for (let i = -2; i <= 2; i++) {
    b.spike([i * 0.016, 1.17, 1.21], [0, -1, 0.02], 0.028, 0.006, {
      bone: head,
      color: PALE_IVORY,
      group: "head",
    });
    b.spike([i * 0.014, 1.155, 1.2], [0, 1, -0.02], 0.024, 0.005, {
      bone: jaw,
      color: PALE_IVORY,
      group: "head",
    });
  }

  // Piercing Glowing Eyes (Emissive, angled for direct front and 3/4 readability)
  for (const s of [1, -1]) {
    // Angled eye socket wedge
    b.part(new THREE.BoxGeometry(0.04, 0.04, 0.04), CHARCOAL, {
      bone: head,
      at: [s * 0.092, 1.275, 1.02],
      rotation: [0, s * 24, 0],
      group: "head",
    });

    // Radiant glowing eye plate
    const eyeMesh = b.part(new THREE.PlaneGeometry(0.072, 0.058), "#ffffff", {
      bone: head,
      at: [s * 0.096, 1.28, 1.025],
      dir: [s * 0.45, 0.08, 0.89],
      axis: "z",
      texture: EYE_TEX,
      group: "head",
    });
    glow(eyeMesh, 1.4);

    // Brow crest above eye
    b.extrude(
      [
        [0, 0],
        [0.09, 0.025],
        [0.07, 0.055, "sharp"],
        [0, 0.035],
      ],
      {
        at: [s * 0.045, 1.3, 0.98],
        x: [s * 0.86, 0.08, 0.5],
        y: [0, 1, 0],
        thickness: 0.035,
        bevel: 0.006,
        color: CHARCOAL,
        bone: head,
        group: "head",
      },
    );
  }

  // Sculpted Cheek Ruffs (Sweeping backward-downward at dynamic 45° angle)
  for (const s of [1, -1]) {
    // Upper cheek flare (Light silver/cream)
    b.extrude(
      [
        [0, 0],
        [0.16, -0.05],
        [0.1, -0.12, "sharp"],
        [0.2, -0.16, "sharp"],
        [0.08, -0.22],
        [0.16, -0.28, "sharp"],
        [0, -0.24],
      ],
      {
        at: [s * 0.1, 1.25, 0.88],
        x: [s * 0.65, -0.4, -0.65],
        y: [0, 0.85, -0.52],
        thickness: 0.05,
        bevel: 0.012,
        color: CREAM,
        bone: head,
        group: "head",
      },
    );

    // Deep secondary cheek tuft (Mid slate tone, layered underneath)
    b.extrude(
      [
        [0, 0],
        [0.12, -0.06],
        [0.07, -0.15, "sharp"],
        [0.14, -0.22, "sharp"],
        [0, -0.18],
      ],
      {
        at: [s * 0.12, 1.23, 0.94],
        x: [s * 0.7, -0.35, -0.62],
        y: [0, 0.85, -0.52],
        thickness: 0.038,
        bevel: 0.009,
        color: SILVER_ASH,
        bone: head,
        group: "head",
      },
    );
  }

  // Cupped, Alert Wolf Ears
  for (const s of [1, -1]) {
    const earJoint = b.joint(s === 1 ? "earL" : "earR", {
      parent: head,
      at: [s * 0.095, 1.36, 0.84],
      dir: [s * 0.32, 0.86, 0.38],
      role: "hinge",
      group: "head",
    });

    // Outer dark shell (thick bevelled shape)
    b.extrude(
      [
        [0, 0],
        [0.09, 0],
        [0.065, 0.22, "sharp"],
        [-0.035, 0.17],
      ],
      {
        at: earJoint.at,
        x: [s * 0.68, 0.68, 0.26],
        y: [-0.2, 0.86, -0.47],
        thickness: 0.032,
        bevel: 0.008,
        color: SLATE_DARK,
        bone: earJoint,
        group: "head",
      },
    );

    // Ear tip dark accent
    b.spike(
      [s * 0.14, 1.54, 0.89],
      [s * 0.3, 0.9, 0.2],
      0.06,
      0.02,
      {
        bone: earJoint,
        color: CHARCOAL,
        group: "head",
      },
    );

    // Inner ear warm cream fur tufts
    b.extrude(
      [
        [0.015, 0.025],
        [0.075, 0.025],
        [0.05, 0.16, "sharp"],
        [-0.015, 0.11],
      ],
      {
        at: [s * 0.095, 1.365, 0.85],
        x: [s * 0.68, 0.68, 0.26],
        y: [-0.2, 0.86, -0.47],
        thickness: 0.02,
        bevel: 0.005,
        color: CREAM,
        bone: earJoint,
        group: "head",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // 6. LAYERED MANE & SHOULDER FUR MANTLE
  // ---------------------------------------------------------------------------
  // Broad, overlapping fur blades forming a continuous heroic ridge
  const maneBlades = [
    { at: [0, 1.34, 0.74], w: 0.16, h: 0.18, bone: neckTop, col: CHARCOAL },
    { at: [0, 1.25, 0.6], w: 0.2, h: 0.24, bone: neckChain.joints[0], col: CHARCOAL },
    { at: [0, 1.15, 0.44], w: 0.24, h: 0.28, bone: chest, col: CHARCOAL }, // Withers peak
    { at: [0, 1.05, 0.28], w: 0.22, h: 0.24, bone: chest, col: CHARCOAL },
    { at: [0, 0.96, 0.1], w: 0.18, h: 0.2, bone: spineChain.joints[0], col: SLATE_DARK },
    { at: [0, 0.88, -0.08], w: 0.16, h: 0.16, bone: spineChain.joints[0], col: SLATE_DARK },
    { at: [0, 0.82, -0.22], w: 0.14, h: 0.12, bone: hips, col: SLATE_DARK },
  ];

  maneBlades.forEach((mb) => {
    b.extrude(
      [
        [0, 0],
        [mb.w * 0.5, mb.h * 0.4],
        [0, mb.h, "sharp"],
        [-mb.w * 0.5, mb.h * 0.4],
      ],
      {
        at: mb.at,
        x: [0, -0.32, -0.95],
        y: [0, 0.95, -0.32],
        thickness: 0.065,
        bevel: 0.012,
        color: mb.col,
        bone: mb.bone,
        group: "mane",
      },
    );
  });

  // Shoulder Cape: heavy angled fur clumps draping down both sides
  for (const s of [1, -1]) {
    // Upper shoulder drape
    b.extrude(
      [
        [0, 0],
        [0.15, -0.08],
        [0.08, -0.2, "sharp"],
        [0.18, -0.28, "sharp"],
        [0, -0.24],
      ],
      {
        at: [s * 0.2, 1.06, 0.42],
        x: [s * 0.72, -0.35, -0.6],
        y: [0, 0.9, -0.44],
        thickness: 0.05,
        bevel: 0.01,
        color: SLATE_DARK,
        bone: chest,
        group: "mane",
      },
    );

    // Mid shoulder tuft
    b.extrude(
      [
        [0, 0],
        [0.12, -0.06],
        [0.06, -0.16, "sharp"],
        [0.12, -0.22, "sharp"],
        [0, -0.18],
      ],
      {
        at: [s * 0.22, 0.94, 0.26],
        x: [s * 0.78, -0.28, -0.56],
        y: [0, 0.9, -0.44],
        thickness: 0.04,
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
        [0.14, -0.06],
        [0.08, -0.18, "sharp"],
        [0, -0.14],
      ],
      {
        at: [s * 0.21, 0.78, -0.22],
        x: [s * 0.65, -0.3, -0.7],
        y: [0, 0.92, -0.4],
        thickness: 0.04,
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
  // Proudly visible war collar wrapping the base of the neck ruff
  const collarPath = catmull(
    [
      [0, 1.18, 0.52],
      [0.24, 1.05, 0.56],
      [0, 0.88, 0.68],
      [-0.24, 1.05, 0.56],
    ],
    { closed: true },
  );
  b.sweep(collarPath, 0.026, {
    bone: chest,
    color: LEATHER_WARM,
    group: "gear",
  });

  // Heavy bronze studs along collar
  for (let i = 0; i < 8; i++) {
    const t = i / 8;
    const pt = collarPath.at(t);
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.014, 6), BRONZE_IRON, {
      at: pt,
      bone: chest,
      group: "gear",
    });
  }

  // Hanging mammoth fangs mounted on iron rings
  for (const s of [1, -1]) {
    // Iron ring
    b.part(new THREE.TorusGeometry(0.024, 0.006, 6, 12), BRONZE_IRON, {
      at: [s * 0.08, 0.94, 0.66],
      rotation: [0, 0, 0],
      bone: chest,
      group: "gear",
    });
    // Curved ivory tusk
    b.spike([s * 0.08, 0.92, 0.66], [s * 0.04, -1, 0.15], 0.12, 0.02, {
      bone: chest,
      color: BONE_TUSK,
      group: "gear",
    });
  }

  // Central Frostwolf Runic Talisman (Large, high on brisket, facing camera)
  const talismanHex = b.extrude(
    [
      [0, 0.06],
      [0.05, 0.03],
      [0.05, -0.03],
      [0, -0.06],
      [-0.05, -0.03],
      [-0.05, 0.03],
    ],
    {
      at: [0, 0.85, 0.72],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.006,
      color: ROCK_DEEP,
      bone: chest,
      group: "gear",
    },
  );

  // Glowing Frostwolf Rune on Talisman
  const runePlate = b.part(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", {
    at: [0, 0.85, 0.736],
    dir: [0, 0.12, 0.99],
    axis: "z",
    texture: RUNE_TEX,
    bone: chest,
    group: "gear",
  });
  glow(runePlate, 1.8);

  // ---------------------------------------------------------------------------
  // 8. FORELIMBS (NATURAL CANINE JOINTS & CLAWED PAWS)
  // ---------------------------------------------------------------------------
  // Shoulder angled forward-wide, elbow tucking back, wrist flexed, pastern forward
  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    const shoulderPt: [number, number, number] = [s * 0.24, 0.92, 0.32];
    const pawTarget: [number, number, number] = [s * 0.24, 0.12, 0.44];

    // Deltoid muscular shoulder dome
    b.part(new THREE.SphereGeometry(0.14, 8, 6), WOLF_COAT, {
      at: shoulderPt,
      scale: [0.85, 1.25, 1.1],
      bone: chest,
      group: "foreleg",
    });

    // Canine limb IK: Shoulder -> Elbow (points back) -> Wrist -> Paw
    const frontPts = limb(
      shoulderPt,
      pawTarget,
      [0.38, 0.34, 0.14],
      [[0, 0, -1]],
      { sole: [0, 0, 1] },
    );

    const legChain = b.chain(`legF${side}`, frontPts, {
      parent: chest,
      role: "leg",
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `pawF${side}`],
    });

    // Upper arm (humerus)
    b.sweep(catmull([frontPts[0], frontPts[1]]), (t) => 0.1 - t * 0.025, {
      bone: legChain.joints[0],
      color: WOLF_COAT,
      group: "foreleg",
    });

    // Elbow joint back-flange fur tuft
    b.extrude(
      [
        [0, 0],
        [0.09, -0.05],
        [0.05, -0.16, "sharp"],
        [0, -0.11],
      ],
      {
        at: frontPts[1],
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: 0.032,
        bevel: 0.006,
        color: SLATE_DARK,
        bone: legChain.joints[1],
        group: "foreleg",
      },
    );

    // Forearm (radius/ulna) - sculpted extensor taper
    b.sweep(catmull([frontPts[1], frontPts[2]]), (t) => 0.078 - t * 0.018, {
      bone: legChain.joints[1],
      color: WOLF_COAT,
      group: "foreleg",
    });

    // Pastern down to foot (angled slightly forward for alert spring)
    b.sweep(catmull([frontPts[2], frontPts[3]]), 0.06, {
      bone: legChain.joints[2],
      color: WOLF_COAT,
      group: "foreleg",
    });

    // Front Paw (Broad, heavy, low-poly wolf foot)
    const pawBone = legChain.tip!;
    b.frustumBox(
      [s * 0.24, 0.13, 0.4],
      [s * 0.24, 0.11, 0.48],
      [0.14, 0.07],
      [0.13, 0.06],
      {
        bone: pawBone,
        color: WOLF_COAT,
        group: "paw",
      },
    );

    // 4 Articulated Toes with Obsidian Claws
    const frontToeDefs = [
      { x: s * 0.048, z: 0.015 },
      { x: s * 0.018, z: 0.045 },
      { x: -s * 0.018, z: 0.045 },
      { x: -s * 0.048, z: 0.015 },
    ];

    frontToeDefs.forEach((to) => {
      const tStart: [number, number, number] = [s * 0.24 + to.x, 0.11, 0.48 + to.z];
      const tEnd: [number, number, number] = [s * 0.24 + to.x, 0.105, 0.53 + to.z];

      b.capsule(tStart, tEnd, 0.02, {
        bone: pawBone,
        color: WOLF_COAT,
        group: "paw",
      });

      // Wicked curved black claw
      b.spike(tEnd, [0, -0.018, 0.04], 0.042, 0.008, {
        bone: pawBone,
        color: CLAW_BLACK,
        group: "paw",
      });

      // Underside toe pad
      b.part(new THREE.BoxGeometry(0.022, 0.008, 0.022), NOSE_LEATHER, {
        at: [tStart[0], 0.096, tStart[2]],
        bone: pawBone,
        group: "paw",
      });
    });

    // Central metacarpal palm pad
    b.part(new THREE.BoxGeometry(0.09, 0.012, 0.07), NOSE_LEATHER, {
      at: [s * 0.24, 0.096, 0.44],
      bone: pawBone,
      group: "paw",
    });
  }

  // ---------------------------------------------------------------------------
  // 9. HINDLIMBS (POWERFUL CROUCH & HOCKS)
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    const hipPt: [number, number, number] = [s * 0.2, 0.76, -0.3];
    const hindPawTarget: [number, number, number] = [s * 0.22, 0.08, -0.4];

    // Muscular haunch globe
    b.part(new THREE.SphereGeometry(0.16, 8, 6), WOLF_COAT, {
      at: [s * 0.21, 0.68, -0.28],
      scale: [0.8, 1.3, 1.15],
      bone: hips,
      group: "hindleg",
    });

    const hindPts = limb(
      hipPt,
      hindPawTarget,
      [0.36, 0.34, 0.15],
      [[0, 0, 1]],
      { sole: [0, 0, 1] },
    );

    const legChain = b.chain(`legH${side}`, hindPts, {
      parent: hips,
      role: "leg",
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `pawH${side}`],
    });

    // Thigh (Femur)
    b.sweep(catmull([hindPts[0], hindPts[1]]), (t) => 0.12 - t * 0.035, {
      bone: legChain.joints[0],
      color: WOLF_COAT,
      group: "hindleg",
    });

    // Shank / Crus (Knee to Hock)
    b.sweep(catmull([hindPts[1], hindPts[2]]), (t) => 0.088 - t * 0.022, {
      bone: legChain.joints[1],
      color: WOLF_COAT,
      group: "hindleg",
    });

    // Hock fur tuft pointing backward
    b.extrude(
      [
        [0, 0],
        [0.09, -0.04],
        [0.05, -0.15, "sharp"],
        [0, -0.1],
      ],
      {
        at: hindPts[2],
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: 0.03,
        bevel: 0.006,
        color: SLATE_DARK,
        bone: legChain.joints[2],
        group: "hindleg",
      },
    );

    // Rear metatarsus
    b.sweep(catmull([hindPts[2], hindPts[3]]), 0.055, {
      bone: legChain.joints[2],
      color: WOLF_COAT,
      group: "hindleg",
    });

    // Hind Paw
    const pawBone = legChain.tip!;
    b.frustumBox(
      [s * 0.22, 0.1, -0.42],
      [s * 0.22, 0.08, -0.35],
      [0.13, 0.065],
      [0.12, 0.055],
      {
        bone: pawBone,
        color: WOLF_COAT,
        group: "paw",
      },
    );

    // 4 Hind Toes & Claws
    const hindToeDefs = [
      { x: s * 0.044, z: 0.015 },
      { x: s * 0.016, z: 0.045 },
      { x: -s * 0.016, z: 0.045 },
      { x: -s * 0.044, z: 0.015 },
    ];

    hindToeDefs.forEach((to) => {
      const tStart: [number, number, number] = [s * 0.22 + to.x, 0.08, -0.35 + to.z];
      const tEnd: [number, number, number] = [s * 0.22 + to.x, 0.076, -0.3 + to.z];

      b.capsule(tStart, tEnd, 0.019, {
        bone: pawBone,
        color: WOLF_COAT,
        group: "paw",
      });

      b.spike(tEnd, [0, -0.015, 0.04], 0.038, 0.007, {
        bone: pawBone,
        color: CLAW_BLACK,
        group: "paw",
      });

      b.part(new THREE.BoxGeometry(0.02, 0.008, 0.02), NOSE_LEATHER, {
        at: [tStart[0], 0.068, tStart[2]],
        bone: pawBone,
        group: "paw",
      });
    });

    b.part(new THREE.BoxGeometry(0.08, 0.01, 0.06), NOSE_LEATHER, {
      at: [s * 0.22, 0.068, -0.38],
      bone: pawBone,
      group: "paw",
    });
  }

  // ---------------------------------------------------------------------------
  // 10. PLUMED WOLF TAIL
  // ---------------------------------------------------------------------------
  // Fluffy, muscular timber wolf tail
  b.sweep(
    tailChain,
    (t) => {
      const bell = Math.sin(t * Math.PI);
      return 0.085 + 0.095 * bell;
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
    b.spike(at, [0, -0.85, -0.52], 0.14, 0.036, {
      bone: at.bone,
      color: CHARCOAL,
      group: "tail",
    });
  });

  // Dark brush tip
  b.spike([0, 0.32, -1.08], [0, -0.25, -0.96], 0.16, 0.05, {
    bone: tailChain.joints[3],
    color: CHARCOAL,
    group: "tail",
  });

  // ---------------------------------------------------------------------------
  // 11. SILHOUETTE FUR FRINGE CARDS
  // ---------------------------------------------------------------------------
  const tuftFrames = [
    // Throat ruff
    frame([0, 0.96, 0.56], [0, 0.3, 0.95]),
    frame([0.1, 1.0, 0.52], [0.55, 0.2, 0.82]),
    frame([-0.1, 1.0, 0.52], [-0.55, 0.2, 0.82]),
    // Cheek flares
    frame([0.18, 1.22, 0.9], [0.82, -0.2, -0.54]),
    frame([-0.18, 1.22, 0.9], [-0.82, -0.2, -0.54]),
    // Tail fringes
    frame([0, 0.62, -0.82], [0, -0.88, -0.46]),
    frame([0, 0.44, -1.02], [0, -0.82, -0.58]),
    // Rear thigh fringes
    frame([0.24, 0.72, -0.34], [0.82, -0.35, -0.45]),
    frame([-0.24, 0.72, -0.34], [-0.82, -0.35, -0.45]),
  ];

  b.cards(tuftFrames, FUR_TUFT_TEX, {
    size: [0.1, 0.2],
    lean: 28,
    flow: [0, -0.75, 0.65],
    vary: 0.25,
    rng: rand,
    group: "cards",
  });

  // ---------------------------------------------------------------------------
  // 12. ALTERAC MOUNTAIN CRAG & CLAN TOTEM SCENERY
  // ---------------------------------------------------------------------------
  // Staged mountain crag: wolf paws rest on elevated rock slabs at y = 0.07 - 0.12,
  // lowest foundation base touches y = 0.
  // Base slab 1 (lowest bedrock foundation)
  b.frustumBox(
    [0, 0.0, -0.02],
    [0, 0.045, -0.02],
    [1.25, 1.6],
    [1.18, 1.52],
    {
      color: ROCK_PAINT,
      flat: true,
      group: "base",
    },
  );

  // Upper front crag rock where front paws rest firmly
  b.frustumBox(
    [0, 0.045, 0.4],
    [0, 0.1, 0.4],
    [0.78, 0.58],
    [0.7, 0.5],
    {
      color: ROCK_PAINT,
      flat: true,
      group: "base",
    },
  );

  // Rear crag ledge where hind paws rest
  b.frustumBox(
    [0, 0.04, -0.36],
    [0, 0.075, -0.36],
    [0.82, 0.62],
    [0.74, 0.54],
    {
      color: ROCK_PAINT,
      flat: true,
      group: "base",
    },
  );

  // Chiseled angular crag boulders flanking the plinth (Warcraft stylized rocks)
  b.extrude(
    [
      [0, 0],
      [0.28, 0],
      [0.22, 0.22, "sharp"],
      [-0.05, 0.16],
    ],
    {
      at: [-0.54, 0.02, 0.12],
      x: [0.92, 0, 0.38],
      y: [0, 1, 0],
      thickness: 0.38,
      bevel: 0.025,
      color: ROCK_PAINT,
      group: "base",
    },
  );

  b.extrude(
    [
      [0, 0],
      [0.3, 0],
      [0.24, 0.24, "sharp"],
      [0.02, 0.18],
    ],
    {
      at: [0.44, 0.02, -0.12],
      x: [0.88, 0, -0.47],
      y: [0, 1, 0],
      thickness: 0.42,
      bevel: 0.025,
      color: ROCK_PAINT,
      group: "base",
    },
  );

  // Thick, stylized alpine snow drifts settled on ledges
  b.frustumBox(
    [0.3, 0.045, 0.2],
    [0.3, 0.088, 0.2],
    [0.38, 0.42],
    [0.28, 0.32],
    {
      color: SNOW_PAINT,
      flat: true,
      group: "base",
    },
  );

  b.frustumBox(
    [-0.32, 0.04, -0.1],
    [-0.32, 0.082, -0.1],
    [0.42, 0.46],
    [0.3, 0.34],
    {
      color: SNOW_PAINT,
      flat: true,
      group: "base",
    },
  );

  b.frustumBox(
    [0, 0.045, -0.66],
    [0, 0.08, -0.66],
    [0.72, 0.32],
    [0.6, 0.24],
    {
      color: SNOW_PAINT,
      flat: true,
      group: "base",
    },
  );

  // Frostwolf Clan Boundary Totem Post (Back-right background prop)
  const totemPost = b.frustumBox(
    [0.46, 0.045, -0.58],
    [0.46, 0.46, -0.58],
    [0.12, 0.12],
    [0.09, 0.09],
    {
      color: WOOD_TIMBER,
      flat: true,
      group: "prop",
    },
  );

  // Leather binding on totem post
  b.sweep(
    catmull([
      [0.4, 0.26, -0.58],
      [0.46, 0.26, -0.52],
      [0.52, 0.26, -0.58],
      [0.46, 0.26, -0.64],
    ], { closed: true }),
    0.015,
    { color: LEATHER_WARM, group: "prop" },
  );

  // Carved skull/horn ornament atop totem
  b.spike([0.46, 0.46, -0.58], [0, 1, 0], 0.08, 0.04, {
    color: BONE_TUSK,
    group: "prop",
  });
  for (const s of [1, -1]) {
    b.spike([0.46, 0.48, -0.58], [s * 0.7, 0.4, -0.2], 0.11, 0.016, {
      color: BONE_TUSK,
      group: "prop",
    });
  }

  // Glowing Frostwolf Rune Plaque on totem
  const totemRune = b.part(new THREE.PlaneGeometry(0.08, 0.08), "#ffffff", {
    at: [0.46, 0.34, -0.518],
    dir: [0, 0, 1],
    axis: "z",
    texture: RUNE_TEX,
    group: "prop",
  });
  glow(totemRune, 1.6);

  // Mystical Frost Ice Spire Crystal (Back-left background prop)
  const crystalSpire = b.spike([-0.45, 0.045, -0.55], [-0.1, 1, 0.05], 0.34, 0.055, {
    color: ICE_GLOW,
    flat: true,
    group: "prop",
  });
  glow(crystalSpire, 1.2);

  // Secondary small ice shard
  const crystalShard = b.spike([-0.51, 0.045, -0.47], [-0.25, 1, 0.2], 0.18, 0.035, {
    color: ICE_GLOW,
    flat: true,
    group: "prop",
  });
  glow(crystalShard, 1.2);

  // Snow drift around crystals
  b.frustumBox(
    [-0.46, 0.045, -0.52],
    [-0.46, 0.09, -0.52],
    [0.26, 0.24],
    [0.18, 0.16],
    {
      color: SNOW_PAINT,
      flat: true,
      group: "prop",
    },
  );

  return b.root;
}
```