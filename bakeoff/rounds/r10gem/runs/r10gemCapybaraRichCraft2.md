```ts
import * as THREE from "three";
import {
  createBuilder,
  bezier,
  catmull,
  mix,
  noise,
  paint,
  rng,
  smoothstep,
  svg,
} from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Whimsical Capybara and Songbird",
  description:
    "A peaceful, zen-like capybara lounging on a flowery riverbank while a cheerful little songbird nests happily atop its flat head holding a blossom.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "capybara_and_bird" });
  const rand = rng(108);

  // ---------------------------------------------------------------------------
  // 1. PALETTE & PROCEDURAL PAINTS
  // ---------------------------------------------------------------------------

  // Primary Capybara Coat: warm cinnamon-chestnut fur with subtle grain,
  // soft sunlit back, and warm biscuit/cream countershading under the belly.
  const CAPY_COAT = paint((p, n) => {
    const baseDark = [0.44, 0.27, 0.16] as const; // #704529
    const baseLight = [0.58, 0.38, 0.23] as const; // #94613b
    const bellyWheat = [0.86, 0.74, 0.56] as const; // #dcc08f
    const muzzleDark = [0.32, 0.18, 0.11] as const; // #522e1c

    // Fur grain texture
    const g = noise(p, 0.07, 42);
    const fine = noise(p, 0.02, 108);
    let col = mix(baseDark, baseLight, g * 0.7 + fine * 0.3);

    // Warm belly countershading
    const bellyFactor = smoothstep(0.15, -0.55, n.y) * smoothstep(0.55, 0.22, p.y);
    col = mix(col, bellyWheat, bellyFactor * 0.88);

    // Subtle sun-kissed warmth on top
    const topFactor = smoothstep(0.4, 0.95, n.y) * smoothstep(0.42, 0.58, p.y);
    col = mix(col, [0.66, 0.45, 0.28], topFactor * 0.35);

    // Muzzle front gradient
    if (p.z > 0.65) {
      const muzzleFactor = smoothstep(0.65, 0.84, p.z);
      col = mix(col, muzzleDark, muzzleFactor * 0.42);
    }

    // Gentle dark gradient at paw tips
    if (p.y < 0.12) {
      const sockFactor = smoothstep(0.12, 0.04, p.y);
      col = mix(col, [0.26, 0.15, 0.09], sockFactor * 0.65);
    }

    return col;
  });

  // Snout top & cheek pad paint
  const CAPY_SNOUT = paint((p) => {
    const muzzleBrown = [0.36, 0.21, 0.13] as const;
    const muzzleWarm = [0.46, 0.28, 0.18] as const;
    const nFactor = noise(p, 0.04, 77);
    return mix(muzzleBrown, muzzleWarm, nFactor);
  });

  // Chin and bib cream
  const CAPY_BELLY = paint((p) => {
    const wheat = [0.88, 0.76, 0.58] as const;
    const warm = [0.80, 0.66, 0.48] as const;
    return mix(warm, wheat, noise(p, 0.06, 91));
  });

  // Whimsical Songbird Plumage: sunny yellow front, bright turquoise-teal mantle
  const BIRD_COAT = paint((p, n) => {
    const yellowBelly = [1.0, 0.82, 0.18] as const; // #ffd12e
    const tealBack = [0.10, 0.72, 0.64] as const; // #1ab8a3
    const cobaltTip = [0.08, 0.32, 0.58] as const; // #145294

    const backFactor = smoothstep(-0.1, 0.5, n.y);
    let c = mix(yellowBelly, tealBack, backFactor);

    if (p.z < 0.58) {
      const tailFactor = smoothstep(0.58, 0.50, p.z);
      c = mix(c, cobaltTip, tailFactor * 0.68);
    }
    return c;
  });

  // Lush Riverbank Grass
  const GRASS_PAINT = paint((p) => {
    const deepGreen = [0.24, 0.48, 0.16] as const;
    const springGreen = [0.42, 0.68, 0.22] as const;
    const mossGolden = [0.52, 0.65, 0.20] as const;
    const n1 = noise(p, 0.14, 12);
    const n2 = noise(p, 0.04, 55);
    let c = mix(deepGreen, springGreen, n1);
    return mix(c, mossGolden, n2 * 0.4);
  });

  // River Pebbles Paint
  const STONE_PAINT = paint((p) => {
    const greyDark = [0.44, 0.45, 0.43] as const;
    const greyLight = [0.65, 0.66, 0.62] as const;
    const warmTint = [0.56, 0.53, 0.46] as const;
    const n1 = noise(p, 0.07, 88);
    const n2 = noise(p, 0.025, 99);
    let c = mix(greyDark, greyLight, n1);
    return mix(c, warmTint, n2 * 0.35);
  });

  // Serene Pond Water
  const WATER_PAINT = paint((p) => {
    const waterDeep = [0.18, 0.54, 0.70] as const;
    const waterShallow = [0.32, 0.70, 0.84] as const;
    const n1 = noise(p, 0.18, 33);
    return mix(waterDeep, waterShallow, n1 * 0.6 + 0.2);
  });

  // Flat accent colours
  const C_NOSE_DARK = "#25160e";
  const C_NOSE_HOLE = "#160c07";
  const C_EAR_INNER = "#e89a88";
  const C_EAR_FLUFF = "#f4debe";
  const C_WHISKER = "#28170d";
  const C_CLAW = "#22130c";
  const C_BIRD_BEAK = "#ff8418";
  const C_BIRD_LEGS = "#ff7b12";
  const C_BIRD_CHEEK = "#ff7296";
  const C_FLOWER_PINK = "#ffaec5";
  const C_FLOWER_GOLD = "#ffcc22";
  const C_STEM_GREEN = "#3ea42f";
  const C_YUZU_ORANGE = "#ff9a12";
  const C_YUZU_LEAF = "#44a62a";

  // ---------------------------------------------------------------------------
  // 2. SVG DRAWINGS & TEXTURES
  // ---------------------------------------------------------------------------

  // Peaceful, smiling closed capybara eye with warm cheek blush
  const CAPY_EYE_TEX = svg(
    `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="86" rx="36" ry="18" fill="#e87a6c" opacity="0.6"/>
      <path d="M 20 54 Q 60 76 100 54" stroke="#482b18" stroke-width="8" stroke-linecap="round" fill="none"/>
      <path d="M 22 54 Q 60 78 98 54" stroke="#221208" stroke-width="6" stroke-linecap="round" fill="none"/>
      <path d="M 88 55 Q 98 47 106 49" stroke="#221208" stroke-width="4.5" stroke-linecap="round" fill="none"/>
      <path d="M 75 62 Q 83 52 89 54" stroke="#221208" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <path d="M 32 55 Q 24 49 16 51" stroke="#221208" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <circle cx="60" cy="38" r="3.5" fill="#ffd599" opacity="0.85"/>
    </svg>`,
    { size: 256 },
  );

  // Wide, curious cartoon bird eye
  const BIRD_EYE_TEX = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="82" rx="30" ry="14" fill="#ff7a98" opacity="0.75"/>
      <circle cx="50" cy="46" r="30" fill="#ffffff" stroke="#162432" stroke-width="4"/>
      <circle cx="52" cy="46" r="23" fill="#1899a8"/>
      <circle cx="54" cy="46" r="16" fill="#0c1722"/>
      <circle cx="45" cy="38" r="8" fill="#ffffff"/>
      <circle cx="62" cy="54" r="4" fill="#ffffff"/>
      <path d="M 32 20 Q 52 14 72 24" stroke="#162432" stroke-width="5" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  // Stylized scalloped wing feathers
  const BIRD_WING_TEX = svg(
    `<svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#22beac"/>
          <stop offset="55%" stop-color="#16859a"/>
          <stop offset="100%" stop-color="#123d60"/>
        </linearGradient>
      </defs>
      <path d="M 20 20 Q 82 15 106 50 Q 115 110 50 152 Q 15 120 20 20 Z" fill="url(#wg)" stroke="#0e2840" stroke-width="3.5"/>
      <path d="M 25 55 Q 60 70 95 60" stroke="#f6d352" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M 22 90 Q 60 105 90 92" stroke="#f6d352" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <path d="M 35 120 Q 55 136 75 120" stroke="#ffd966" stroke-width="3" stroke-linecap="round" fill="none"/>
      <circle cx="60" cy="38" r="5" fill="#ffd966" opacity="0.9"/>
    </svg>`,
    { size: 256 },
  );

  // Water Lily Pad
  const LILY_PAD_TEX = svg(
    `<svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <path d="M 70 70 L 132 50 A 65 65 0 1 0 132 90 Z" fill="#2d7c38" stroke="#1c5224" stroke-width="4"/>
      <path d="M 128 53 A 61 61 0 1 0 128 87" fill="none" stroke="#46a654" stroke-width="3"/>
      <path d="M 70 70 L 25 35 M 70 70 L 18 70 M 70 70 L 28 108 M 70 70 L 65 132 M 70 70 L 102 125 M 70 70 L 65 10 M 70 70 L 105 18" stroke="#3da04d" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="85" cy="82" r="5" fill="#aee8f8" opacity="0.85"/>
      <circle cx="83" cy="80" r="1.5" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  // Sliced Yuzu / Citrus
  const CITRUS_SLICE_TEX = svg(
    `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="56" fill="#ff8c00" stroke="#ce6400" stroke-width="3"/>
      <circle cx="60" cy="60" r="50" fill="#fff5d6"/>
      <circle cx="60" cy="60" r="44" fill="#ffa71a"/>
      <g fill="#ffc233" stroke="#fff8e0" stroke-width="2.5">
        <path d="M 60 60 L 52 24 A 38 38 0 0 1 68 24 Z"/>
        <path d="M 60 60 L 24 52 A 38 38 0 0 1 24 68 Z"/>
        <path d="M 60 60 L 52 96 A 38 38 0 0 0 68 96 Z"/>
        <path d="M 60 60 L 96 52 A 38 38 0 0 0 96 68 Z"/>
        <path d="M 60 60 L 34 34 A 38 38 0 0 1 46 26 Z"/>
        <path d="M 60 60 L 74 26 A 38 38 0 0 1 86 34 Z"/>
        <path d="M 60 60 L 26 74 A 38 38 0 0 0 34 86 Z"/>
        <path d="M 60 60 L 86 86 A 38 38 0 0 0 74 94 Z"/>
      </g>
      <circle cx="60" cy="60" r="6" fill="#fff8e0"/>
    </svg>`,
    { size: 256 },
  );

  // Concentric water ripples
  const WATER_RIPPLE_TEX = svg(
    `<svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <circle cx="70" cy="70" r="64" fill="none" stroke="#dff6fd" stroke-width="3.5" opacity="0.6"/>
      <circle cx="70" cy="70" r="45" fill="none" stroke="#e6f9ff" stroke-width="4.5" opacity="0.75"/>
      <circle cx="70" cy="70" r="26" fill="none" stroke="#ffffff" stroke-width="5" opacity="0.9"/>
      <circle cx="70" cy="70" r="9" fill="#ffffff" opacity="0.95"/>
    </svg>`,
    { size: 256 },
  );

  // Whimsical 5-petal wildflower
  const FLOWER_TEX = svg(
    `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <g fill="#ffa8c5" stroke="#de6686" stroke-width="2.5">
        <ellipse cx="60" cy="28" rx="16" ry="22"/>
        <ellipse cx="90" cy="50" rx="22" ry="16" transform="rotate(20 90 50)"/>
        <ellipse cx="78" cy="88" rx="18" ry="22" transform="rotate(-15 78 88)"/>
        <ellipse cx="42" cy="88" rx="18" ry="22" transform="rotate(15 42 88)"/>
        <ellipse cx="30" cy="50" rx="22" ry="16" transform="rotate(-20 30 50)"/>
      </g>
      <circle cx="60" cy="60" r="16" fill="#ffd230" stroke="#dfa610" stroke-width="2"/>
      <circle cx="56" cy="56" r="4" fill="#ffffff" opacity="0.65"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // 3. SKELETON (CAPYBARA & PERCHED BIRD)
  // ---------------------------------------------------------------------------

  // Capybara Spine & Head
  const hips = b.joint("hips", { at: [0, 0.44, -0.16], role: "spine" });
  const spine1 = b.joint("spine1", { parent: hips, at: [0, 0.46, 0.08], role: "spine" });
  const spine2 = b.joint("spine2", { parent: spine1, at: [0, 0.48, 0.28], role: "spine" });
  const neck = b.joint("neck", { parent: spine2, at: [0, 0.52, 0.44], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.58, 0.58], dir: [0, 0.08, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.48, 0.62], aim: [0, 0.49, 0.78], role: "jaw" });
  const tail1 = b.joint("tail1", { parent: hips, at: [0, 0.43, -0.38], dir: [0, -0.3, -1], role: "tail" });

  // Capybara Legs: Left (+X) & Right (-X)
  // Hind limbs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipPt: [number, number, number] = [s * 0.17, 0.42, -0.20];
    const kneePt: [number, number, number] = [s * 0.18, 0.26, -0.16];
    const hockPt: [number, number, number] = [s * 0.18, 0.14, -0.22];
    const anklePt: [number, number, number] = [s * 0.18, 0.05, -0.18];

    b.chain(`legH${side}`, [hipPt, kneePt, hockPt, anklePt], {
      parent: hips,
      role: "leg",
      names: [`hipH${side}`, `kneeH${side}`, `hockH${side}`, `ankleH${side}`],
      contact: anklePt,
    });
  }

  // Fore limbs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulderPt: [number, number, number] = [s * 0.16, 0.44, 0.22];
    const elbowPt: [number, number, number] = [s * 0.16, 0.28, 0.18];
    const wristPt: [number, number, number] = [s * 0.16, 0.14, 0.22];
    const pawPt: [number, number, number] = [s * 0.16, 0.05, 0.25];

    b.chain(`legF${side}`, [shoulderPt, elbowPt, wristPt, pawPt], {
      parent: spine2,
      role: "leg",
      names: [`shoulderF${side}`, `elbowF${side}`, `wristF${side}`, `ankleF${side}`],
      contact: pawPt,
    });
  }

  // Perched Songbird: Parented securely to the capybara's head!
  const birdRoot = b.joint("birdRoot", { parent: head, at: [0, 0.70, 0.60], role: "spine" });
  const birdHead = b.joint("birdHead", { parent: birdRoot, at: [0, 0.77, 0.65], dir: [0, 0.18, 1], role: "head" });
  b.joint("birdWingL", { parent: birdRoot, at: [0.042, 0.725, 0.59], role: "wing" });
  b.joint("birdWingR", { parent: birdRoot, at: [-0.042, 0.725, 0.59], role: "wing" });
  b.joint("birdTail", { parent: birdRoot, at: [0, 0.71, 0.52], dir: [0, 0.25, -1], role: "tail" });

  // ---------------------------------------------------------------------------
  // 4. CAPYBARA BODY & POSTURE (CHUBBY POTATO LOAF)
  // ---------------------------------------------------------------------------

  // Continuous main torso loft
  b.loft(
    [
      { at: [0, 0.42, -0.37], w: 0.36, h: 0.36 }, // rounded rump start
      { at: [0, 0.45, -0.22], w: 0.46, h: 0.44 }, // hind hips width
      { at: [0, 0.42, -0.02], w: 0.48, h: 0.46 }, // relaxed hanging belly
      { at: [0, 0.46, 0.18], w: 0.44, h: 0.44 }, // sturdy chest
      { at: [0, 0.50, 0.36], w: 0.36, h: 0.38 }, // neck shoulder base
    ],
    { bone: [hips, spine1, spine2], color: CAPY_COAT, caps: "round", name: "bodyLoft" },
  );

  // Smooth neck loft connecting shoulders to skull
  b.loft(
    [
      { at: [0, 0.50, 0.36], w: 0.36, h: 0.38 },
      { at: [0, 0.54, 0.46], w: 0.31, h: 0.34 },
      { at: [0, 0.57, 0.55], w: 0.27, h: 0.30 },
    ],
    { bone: [spine2, neck, head], color: CAPY_COAT, caps: "none", name: "neckLoft" },
  );

  // Vestigial cute nub tail
  b.capsule([0, 0.43, -0.37], [0, 0.41, -0.40], [0.024, 0.016], {
    bone: tail1,
    color: CAPY_COAT,
    name: "tailNub",
  });

  // Warm chest ruff
  b.part(new THREE.SphereGeometry(0.12, 10, 8), CAPY_BELLY, {
    bone: spine2,
    at: [0, 0.40, 0.28],
    scale: [1.2, 0.7, 1.1],
    name: "chestBib",
  });

  // ---------------------------------------------------------------------------
  // 5. CAPYBARA HEAD, SNOUT & EXPRESSION
  // ---------------------------------------------------------------------------

  // Upper Cranium (flat topped for perching!)
  b.frustumBox(
    [0, 0.58, 0.52],
    [0, 0.58, 0.68],
    [0.26, 0.22],
    [0.24, 0.21],
    { bone: head, color: CAPY_COAT, name: "cranium" },
  );

  // Snout (deep, boxy, quintessential capybara muzzle)
  b.frustumBox(
    [0, 0.55, 0.67],
    [0, 0.53, 0.84],
    [0.23, 0.20],
    [0.19, 0.18],
    { bone: head, color: CAPY_SNOUT, name: "snout" },
  );

  // Nose tip leather block
  b.frustumBox(
    [0, 0.53, 0.83],
    [0, 0.53, 0.865],
    [0.18, 0.16],
    [0.15, 0.13],
    { bone: head, color: C_NOSE_DARK, name: "noseLeather" },
  );

  // Lower Jaw on hinged joint
  b.frustumBox(
    [0, 0.465, 0.64],
    [0, 0.465, 0.81],
    [0.18, 0.08],
    [0.14, 0.07],
    { bone: jaw, color: CAPY_BELLY, name: "lowerJaw" },
  );

  // Rounded chin pad
  b.part(new THREE.SphereGeometry(0.065, 12, 10), CAPY_BELLY, {
    bone: jaw,
    at: [0, 0.465, 0.74],
    scale: [1.15, 0.7, 1.2],
    name: "chin",
  });

  // Chubby cheek muscles
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.08, 12, 10), CAPY_COAT, {
      bone: head,
      at: [s * 0.105, 0.53, 0.68],
      scale: [0.75, 1.0, 1.2],
      name: `cheek${side}`,
    });
  }

  // Flared nostrils on nose front
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.CylinderGeometry(0.015, 0.012, 0.018, 8), C_NOSE_HOLE, {
      bone: head,
      at: [s * 0.038, 0.545, 0.866],
      dir: [0, 0.35, 1],
      name: `nostril${side}`,
    });
  }

  // Philtrum vertical groove
  b.rod([0, 0.53, 0.868], [0, 0.485, 0.864], 0.007, C_NOSE_HOLE, {
    bone: head,
    name: "philtrum",
  });

  // Gentle serene mouth smile line
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.sweep(
      bezier([0, 0.485, 0.862], [s * 0.05, 0.482, 0.84], [s * 0.085, 0.495, 0.78]),
      0.006,
      { bone: head, color: C_NOSE_HOLE, name: `lipLine${side}` },
    );
  }

  // Zen Sleepy Eyes (decals on curved cheek/skull)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // Soft outer orbital mound
    b.part(new THREE.SphereGeometry(0.032, 10, 8), CAPY_COAT, {
      bone: head,
      at: [s * 0.12, 0.60, 0.68],
      scale: [0.6, 1.0, 1.2],
      name: `eyeMound${side}`,
    });

    // Eye Decal with happy lashes & cheek blush
    b.part(new THREE.PlaneGeometry(0.065, 0.065), "#ffffff", {
      bone: head,
      at: [s * 0.128, 0.60, 0.68],
      dir: [s * 0.9, 0.1, 0.35],
      axis: "z",
      texture: CAPY_EYE_TEX,
      name: `eyeDecal${side}`,
    });

    // Calm curved upper brow ridge
    b.sweep(
      bezier([s * 0.11, 0.628, 0.65], [s * 0.126, 0.635, 0.68], [s * 0.11, 0.625, 0.71]),
      0.0065,
      { bone: head, color: "#422818", name: `brow${side}` },
    );
  }

  // Ears: small, rounded, cup-shaped
  const EAR_OUTLINE: OutlinePoint[] = [
    [0, 0],
    [0.028, 0.01],
    [0.042, 0.038, "sharp"],
    [0.034, 0.062],
    [0.014, 0.066],
    [-0.01, 0.048],
    [-0.014, 0.02],
  ];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // Ear shell
    b.extrude(EAR_OUTLINE, {
      bone: head,
      at: [s * 0.122, 0.635, 0.55],
      x: [s * 0.6, 0.2, 0.77],
      y: [s * 0.2, 0.95, -0.2],
      thickness: 0.016,
      bevel: 0.004,
      smoothing: 2,
      color: CAPY_COAT,
      name: `earShell${side}`,
    });

    // Ear peach interior inset
    b.extrude(EAR_OUTLINE, {
      bone: head,
      at: [s * 0.124, 0.636, 0.553],
      x: [s * 0.58, 0.2, 0.77],
      y: [s * 0.18, 0.95, -0.2],
      thickness: 0.008,
      bevel: 0.002,
      smoothing: 2,
      color: C_EAR_INNER,
      name: `earInner${side}`,
    });

    // Cozy ear fluff tuft
    b.part(new THREE.SphereGeometry(0.014, 8, 6), C_EAR_FLUFF, {
      bone: head,
      at: [s * 0.126, 0.645, 0.56],
      scale: [1, 1.4, 0.8],
      name: `earFluff${side}`,
    });
  }

  // Graceful curving whiskers
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const whiskerConfigs = [
      { from: [s * 0.095, 0.54, 0.80], to: [s * 0.21, 0.52, 0.76] },
      { from: [s * 0.095, 0.52, 0.81], to: [s * 0.23, 0.48, 0.77] },
      { from: [s * 0.095, 0.50, 0.80], to: [s * 0.20, 0.44, 0.75] },
      { from: [s * 0.088, 0.53, 0.83], to: [s * 0.18, 0.50, 0.83] },
    ];

    whiskerConfigs.forEach((w, i) => {
      const ctrl: [number, number, number] = [
        (w.from[0] + w.to[0]) * 0.5 + s * 0.018,
        (w.from[1] + w.to[1]) * 0.5 + 0.008,
        (w.from[2] + w.to[2]) * 0.5,
      ];
      b.sweep(bezier(w.from, ctrl, w.to), [0.0035, 0.001], {
        bone: head,
        color: C_WHISKER,
        caps: { start: "round", end: "point" },
        name: `whisker${side}_${i}`,
      });
    });
  }

  // Tactile low-poly fur tufts on spine & cheeks
  const dorsalPoints = [
    [0, 0.54, 0.42],
    [0, 0.51, 0.28],
    [0, 0.49, 0.14],
    [0, 0.47, 0.00],
    [0, 0.48, -0.12],
    [0, 0.46, -0.24],
  ];

  dorsalPoints.forEach((p, idx) => {
    b.spike(p, [0, 0.8, -0.3], 0.035, 0.018, {
      bone: idx < 2 ? spine2 : idx < 4 ? spine1 : hips,
      color: idx % 2 === 0 ? "#5a341e" : "#805230",
      name: `dorsalTuft_${idx}`,
    });
  });

  // Cheek fur ruffs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.spike([s * 0.11, 0.49, 0.65], [s * 0.8, -0.2, 0.2], 0.038, 0.018, {
      bone: head,
      color: "#805230",
      name: `cheekTuft${side}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 6. CAPYBARA STURDY LEGS, PAWS & TOES
  // ---------------------------------------------------------------------------

  // Hind legs (3 toes with dark blunt claws)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const socket: [number, number, number] = [s * 0.17, 0.42, -0.20];
    const knee: [number, number, number] = [s * 0.18, 0.26, -0.16];
    const hock: [number, number, number] = [s * 0.18, 0.14, -0.22];
    const ankle: [number, number, number] = [s * 0.18, 0.06, -0.18];

    // Limb segments
    b.capsule(socket, knee, [0.088, 0.07], { bone: `hipH${side}`, color: CAPY_COAT, name: `thighH${side}` });
    b.capsule(knee, hock, [0.07, 0.055], { bone: `kneeH${side}`, color: CAPY_COAT, name: `shinH${side}` });
    b.capsule(hock, ankle, [0.055, 0.045], { bone: `hockH${side}`, color: CAPY_COAT, name: `cannonH${side}` });

    // Sturdy foot pad block
    b.part(new THREE.BoxGeometry(0.09, 0.035, 0.08), CAPY_COAT, {
      bone: `ankleH${side}`,
      at: [s * 0.18, 0.045, -0.17],
      name: `footH${side}`,
    });

    // 3 Spreading Hind Toes
    [-22, 0, 22].forEach((deg, ti) => {
      const rad = deg * (Math.PI / 180);
      const toeBase: [number, number, number] = [s * 0.18 + Math.sin(rad) * 0.026, 0.042, -0.17 + Math.cos(rad) * 0.034];
      const toeTip: [number, number, number] = [s * 0.18 + Math.sin(rad) * 0.046, 0.040, -0.17 + Math.cos(rad) * 0.064];
      b.capsule(toeBase, toeTip, [0.014, 0.012], { bone: `ankleH${side}`, color: CAPY_COAT, name: `toeH${side}_${ti}` });

      // Claw
      const clawDir: [number, number, number] = [Math.sin(rad) * 0.2, -0.1, Math.cos(rad)];
      b.spike(toeTip, clawDir, 0.014, 0.006, { bone: `ankleH${side}`, color: C_CLAW, name: `clawH${side}_${ti}` });
    });
  }

  // Fore legs (4 toes with webbed connectors & claws)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulder: [number, number, number] = [s * 0.16, 0.44, 0.22];
    const elbow: [number, number, number] = [s * 0.16, 0.28, 0.18];
    const wrist: [number, number, number] = [s * 0.16, 0.14, 0.22];
    const ankle: [number, number, number] = [s * 0.16, 0.06, 0.25];

    // Limb segments
    b.capsule(shoulder, elbow, [0.078, 0.062], { bone: `shoulderF${side}`, color: CAPY_COAT, name: `armF${side}` });
    b.capsule(elbow, wrist, [0.062, 0.05], { bone: `elbowF${side}`, color: CAPY_COAT, name: `forearmF${side}` });
    b.capsule(wrist, ankle, [0.05, 0.042], { bone: `wristF${side}`, color: CAPY_COAT, name: `wristSegF${side}` });

    // Fore foot pad block
    b.part(new THREE.BoxGeometry(0.086, 0.035, 0.08), CAPY_COAT, {
      bone: `ankleF${side}`,
      at: [s * 0.16, 0.045, 0.25],
      name: `footF${side}`,
    });

    // 4 Spreading Front Toes
    [-30, -10, 10, 30].forEach((deg, ti) => {
      const rad = deg * (Math.PI / 180);
      const toeBase: [number, number, number] = [s * 0.16 + Math.sin(rad) * 0.024, 0.042, 0.25 + Math.cos(rad) * 0.032];
      const toeTip: [number, number, number] = [s * 0.16 + Math.sin(rad) * 0.045, 0.040, 0.25 + Math.cos(rad) * 0.062];
      b.capsule(toeBase, toeTip, [0.012, 0.010], { bone: `ankleF${side}`, color: CAPY_COAT, name: `toeF${side}_${ti}` });

      // Claw
      const clawDir: [number, number, number] = [Math.sin(rad) * 0.2, -0.1, Math.cos(rad)];
      b.spike(toeTip, clawDir, 0.013, 0.0055, { bone: `ankleF${side}`, color: C_CLAW, name: `clawF${side}_${ti}` });
    });
  }

  // ---------------------------------------------------------------------------
  // 7. THE HERO ACCESSORY: WHIMSICAL SONGBIRD PERCHED ON HEAD
  // ---------------------------------------------------------------------------

  // Songbird Plump Body
  b.loft(
    [
      { at: [0, 0.705, 0.54], w: 0.06, h: 0.055 },
      { at: [0, 0.725, 0.60], w: 0.078, h: 0.076 },
      { at: [0, 0.75, 0.65], w: 0.065, h: 0.068 },
    ],
    { bone: birdRoot, color: BIRD_COAT, caps: "round", name: "birdBody" },
  );

  // Plump Round Bird Head
  b.part(new THREE.SphereGeometry(0.038, 12, 10), BIRD_COAT, {
    bone: birdHead,
    at: [0, 0.78, 0.65],
    scale: [0.95, 1.0, 1.05],
    name: "birdHeadSphere",
  });

  // Soft peach blush cheeks on the bird
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.012, 8, 6), C_BIRD_CHEEK, {
      bone: birdHead,
      at: [s * 0.032, 0.768, 0.665],
      scale: [0.6, 1.0, 1.0],
      name: `birdCheek${side}`,
    });
  }

  // Shiny Bird Eyes
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.PlaneGeometry(0.034, 0.034), "#ffffff", {
      bone: birdHead,
      at: [s * 0.036, 0.782, 0.662],
      dir: [s * 0.85, 0.1, 0.45],
      axis: "z",
      texture: BIRD_EYE_TEX,
      name: `birdEye${side}`,
    });
  }

  // Cute conical orange beak holding the flower
  b.spike([0, 0.776, 0.686], [0, 0.05, 1], 0.024, 0.009, {
    bone: birdHead,
    color: C_BIRD_BEAK,
    name: "birdBeakUpper",
  });
  b.spike([0, 0.772, 0.686], [0, -0.05, 1], 0.018, 0.007, {
    bone: birdHead,
    color: C_BIRD_BEAK,
    name: "birdBeakLower",
  });

  // Jaunty 3-feather crown / crest on top of the bird's head
  b.sweep(
    bezier([0, 0.812, 0.65], [0, 0.84, 0.64], [0, 0.855, 0.61]),
    [0.007, 0.001],
    { bone: birdHead, color: "#16b8a2", caps: "point", name: "birdCrestMid" },
  );
  b.part(new THREE.SphereGeometry(0.004, 6, 4), C_FLOWER_GOLD, {
    bone: birdHead,
    at: [0, 0.855, 0.61],
    name: "crestGemMid",
  });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.sweep(
      bezier([s * 0.012, 0.808, 0.65], [s * 0.022, 0.835, 0.64], [s * 0.026, 0.845, 0.615]),
      [0.0055, 0.001],
      { bone: birdHead, color: "#16b8a2", caps: "point", name: `birdCrest${side}` },
    );
    b.part(new THREE.SphereGeometry(0.0035, 6, 4), C_FLOWER_GOLD, {
      bone: birdHead,
      at: [s * 0.026, 0.845, 0.615],
      name: `crestGem${side}`,
    });
  }

  // Bird Wings with patterned feather decal
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.PlaneGeometry(0.055, 0.075), "#ffffff", {
      bone: birdRoot,
      at: [s * 0.044, 0.725, 0.59],
      dir: [s, 0.1, -0.2],
      axis: "z",
      texture: BIRD_WING_TEX,
      name: `birdWingDecal${side}`,
    });

    // Substantial wing blade underneath
    b.capsule([s * 0.038, 0.74, 0.62], [s * 0.04, 0.71, 0.54], [0.016, 0.008], {
      bone: birdRoot,
      color: "#16869a",
      name: `birdWingCore${side}`,
    });
  }

  // Fanned jaunty bird tail
  [-16, 0, 16].forEach((deg, i) => {
    const rad = deg * (Math.PI / 180);
    const tip: [number, number, number] = [Math.sin(rad) * 0.028, 0.73, 0.475];
    b.sweep(
      bezier([0, 0.71, 0.53], [Math.sin(rad) * 0.015, 0.72, 0.50], tip),
      [0.012, 0.003],
      { bone: birdRoot, color: i === 1 ? "#123d60" : "#16859a", caps: "point", name: `birdTailFeather_${i}` },
    );
  });

  // Tiny bird legs & spread claws resting on the capybara's skull
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // Thigh fluff
    b.part(new THREE.SphereGeometry(0.009, 6, 6), C_FLOWER_GOLD, {
      bone: birdRoot,
      at: [s * 0.022, 0.70, 0.61],
      scale: [1, 1.4, 1],
      name: `birdThigh${side}`,
    });

    // Leg rod
    b.rod([s * 0.022, 0.695, 0.61], [s * 0.022, 0.678, 0.61], 0.003, C_BIRD_LEGS, {
      bone: birdRoot,
      name: `birdLegRod${side}`,
    });

    // 3 Tiny front toes gripping head fur
    [-25, 0, 25].forEach((deg, ti) => {
      const rad = deg * (Math.PI / 180);
      const tEnd: [number, number, number] = [
        s * 0.022 + Math.sin(rad) * 0.011,
        0.676,
        0.61 + Math.cos(rad) * 0.012,
      ];
      b.rod([s * 0.022, 0.678, 0.61], tEnd, 0.002, C_BIRD_LEGS, {
        bone: birdRoot,
        name: `birdToe${side}_${ti}`,
      });
    });
  }

  // FLOWER IN THE BIRD'S BEAK: Whimsical storytelling centerpiece!
  // Gentle curving green stem held in the beak
  b.sweep(
    bezier([0, 0.774, 0.705], [0.025, 0.755, 0.715], [0.045, 0.732, 0.695]),
    0.0026,
    { bone: birdHead, color: C_STEM_GREEN, caps: "round", name: "flowerStem" },
  );

  // Little green stem leaf
  b.part(new THREE.SphereGeometry(0.007, 6, 4), C_STEM_GREEN, {
    bone: birdHead,
    at: [0.028, 0.748, 0.71],
    scale: [0.4, 0.7, 1.4],
    dir: [0.6, 0.2, 0.8],
    name: "stemLeaf",
  });

  // Flower blossom facing happily outward
  b.part(new THREE.PlaneGeometry(0.045, 0.045), "#ffffff", {
    bone: birdHead,
    at: [0.048, 0.73, 0.695],
    dir: [0.55, 0.25, 0.8],
    axis: "z",
    texture: FLOWER_TEX,
    name: "heldFlower",
  });

  // Back petals for double-sided readability
  b.part(new THREE.PlaneGeometry(0.045, 0.045), "#ffffff", {
    bone: birdHead,
    at: [0.047, 0.73, 0.694],
    dir: [-0.55, -0.25, -0.8],
    axis: "z",
    texture: FLOWER_TEX,
    name: "heldFlowerBack",
  });

  // ---------------------------------------------------------------------------
  // 8. STAGED DIORAMA BASE: FLOWERY RIVERBANK SANCTUARY
  // ---------------------------------------------------------------------------

  // Ground Island Outline: Organic rounded bank resting directly on y = 0
  const BASE_OUTLINE: OutlinePoint[] = [
    [-0.56, -0.62],
    [0.10, -0.66],
    [0.55, -0.52],
    [0.65, -0.10],
    [0.62, 0.40],
    [0.45, 0.76],
    [0.10, 0.94],
    [-0.35, 0.90],
    [-0.58, 0.60],
    [-0.62, 0.10],
    [-0.60, -0.30],
  ];

  // Base grass mound slab (from y = 0.0 to 0.04)
  b.extrude(BASE_OUTLINE, {
    at: [0, 0.02, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.04,
    bevel: 0.008,
    smoothing: 2,
    color: GRASS_PAINT,
    name: "baseMound",
  });

  // Recessed Water Pool on the creature's left (+X side)
  const POOL_OUTLINE: OutlinePoint[] = [
    [0.16, -0.42],
    [0.48, -0.44],
    [0.62, -0.15],
    [0.58, 0.26],
    [0.38, 0.44],
    [0.22, 0.20],
    [0.15, -0.10],
  ];

  b.extrude(POOL_OUTLINE, {
    at: [0, 0.038, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.004,
    bevel: 0.002,
    smoothing: 2,
    color: WATER_PAINT,
    name: "waterSurface",
  });

  // Water Ripple Rings under floating props
  b.part(new THREE.PlaneGeometry(0.18, 0.18), "#ffffff", {
    at: [0.38, 0.041, 0.15],
    dir: [0, 1, 0],
    axis: "z",
    texture: WATER_RIPPLE_TEX,
    name: "ripple1",
  });

  b.part(new THREE.PlaneGeometry(0.14, 0.14), "#ffffff", {
    at: [0.44, 0.041, -0.18],
    dir: [0, 1, 0],
    axis: "z",
    texture: WATER_RIPPLE_TEX,
    name: "ripple2",
  });

  // Floating Yuzu Citrus #1: Whole plump fruit with leaf
  b.part(new THREE.SphereGeometry(0.034, 12, 10), C_YUZU_ORANGE, {
    at: [0.38, 0.052, 0.15],
    scale: [1, 0.95, 1],
    name: "yuzuWhole",
  });
  // Stem
  b.rod([0.38, 0.082, 0.15], [0.38, 0.094, 0.145], 0.0025, "#523214", {
    name: "yuzuStem",
  });
  // Perky green leaf
  b.part(new THREE.SphereGeometry(0.012, 8, 4), C_YUZU_LEAF, {
    at: [0.392, 0.092, 0.145],
    scale: [1.6, 0.3, 0.8],
    dir: [0.8, 0.3, 0],
    name: "yuzuLeaf",
  });

  // Floating Yuzu Citrus #2: Fresh sliced half showing juicy star segments
  b.part(new THREE.CylinderGeometry(0.028, 0.027, 0.014, 14), C_YUZU_ORANGE, {
    at: [0.32, 0.044, -0.02],
    name: "yuzuSliceBody",
  });
  b.part(new THREE.CircleGeometry(0.0275, 14), "#ffffff", {
    at: [0.32, 0.0515, -0.02],
    dir: [0, 1, 0],
    axis: "z",
    texture: CITRUS_SLICE_TEX,
    name: "yuzuSliceFace",
  });

  // Lily Pads floating in the stream
  b.part(new THREE.PlaneGeometry(0.12, 0.12), "#ffffff", {
    at: [0.46, 0.042, 0.04],
    dir: [0, 1, 0],
    axis: "z",
    texture: LILY_PAD_TEX,
    name: "lilyPad1",
  });

  b.part(new THREE.PlaneGeometry(0.10, 0.10), "#ffffff", {
    at: [0.26, 0.042, -0.25],
    dir: [0, 1, 0],
    axis: "z",
    texture: LILY_PAD_TEX,
    name: "lilyPad2",
  });

  // Lotus Flower on the water
  const lotusCenter = [0.44, 0.052, -0.18] as const;
  // Golden stamen center
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.008, 10), C_FLOWER_GOLD, {
    at: lotusCenter,
    name: "lotusStamen",
  });

  // Upright pink lotus petals
  [0, 60, 120, 180, 240, 300].forEach((deg, pi) => {
    const rad = deg * (Math.PI / 180);
    const pPos: [number, number, number] = [
      lotusCenter[0] + Math.sin(rad) * 0.018,
      lotusCenter[1] + 0.006,
      lotusCenter[2] + Math.cos(rad) * 0.018,
    ];
    b.part(new THREE.SphereGeometry(0.012, 8, 6), pi % 2 === 0 ? "#ffd0de" : C_FLOWER_PINK, {
      at: pPos,
      scale: [0.7, 1.4, 0.5],
      dir: [Math.sin(rad) * 0.6, 0.8, Math.cos(rad) * 0.6],
      name: `lotusPetal_${pi}`,
    });
  });

  // Outer spreading white petals
  [30, 90, 150, 210, 270, 330].forEach((deg, pi) => {
    const rad = deg * (Math.PI / 180);
    const pPos: [number, number, number] = [
      lotusCenter[0] + Math.sin(rad) * 0.026,
      lotusCenter[1] + 0.002,
      lotusCenter[2] + Math.cos(rad) * 0.026,
    ];
    b.part(new THREE.SphereGeometry(0.014, 8, 6), "#fff2f6", {
      at: pPos,
      scale: [0.8, 0.4, 1.6],
      dir: [Math.sin(rad), 0.3, Math.cos(rad)],
      name: `lotusOuterPetal_${pi}`,
    });
  });

  // Smooth River Stones along the shoreline
  const pebbleConfigs = [
    { at: [0.22, 0.046, -0.32], s: [0.042, 0.022, 0.052] },
    { at: [0.24, 0.050, -0.14], s: [0.055, 0.026, 0.045] },
    { at: [0.26, 0.052, 0.06], s: [0.062, 0.030, 0.056] },
    { at: [0.23, 0.046, 0.26], s: [0.048, 0.024, 0.042] },
    { at: [0.20, 0.042, 0.42], s: [0.050, 0.022, 0.058] },
    { at: [-0.34, 0.044, -0.12], s: [0.060, 0.028, 0.048] },
    { at: [-0.28, 0.048, 0.16], s: [0.046, 0.024, 0.054] },
    { at: [-0.42, 0.042, 0.34], s: [0.052, 0.025, 0.044] },
  ];

  pebbleConfigs.forEach((peb, i) => {
    b.part(new THREE.SphereGeometry(1, 10, 8), STONE_PAINT, {
      at: peb.at as [number, number, number],
      scale: peb.s as [number, number, number],
      name: `riverStone_${i}`,
    });
  });

  // Cheerful Wildflowers & Grass Tufts on the Bank
  const flowerPositions = [
    [-0.32, 0.045, -0.30],
    [-0.22, 0.045, -0.42],
    [-0.40, 0.045, 0.05],
    [-0.36, 0.045, 0.48],
    [-0.14, 0.045, 0.65],
    [0.08, 0.045, 0.68],
    [0.34, 0.045, 0.52],
  ];

  flowerPositions.forEach((pos, fi) => {
    // Flower face
    b.part(new THREE.PlaneGeometry(0.04, 0.04), "#ffffff", {
      at: [pos[0], pos[1] + 0.025, pos[2]],
      dir: [0.1, 0.95, 0.2],
      axis: "z",
      texture: FLOWER_TEX,
      name: `wildflower_${fi}`,
    });

    // Little stem
    b.rod([pos[0], pos[1], pos[2]], [pos[0], pos[1] + 0.024, pos[2]], 0.0025, C_STEM_GREEN, {
      name: `flowerStem_${fi}`,
    });

    // 2-3 Grass blades around it
    [-0.015, 0.015].forEach((dx, gi) => {
      b.spike(
        [pos[0] + dx, pos[1], pos[2] + 0.01],
        [dx * 15, 0.8, rand() * 0.2 - 0.1],
        0.038,
        0.004,
        { color: "#489e24", name: `grassBlade_${fi}_${gi}` },
      );
    });
  });

  // Additional lush grass tufts around capybara feet
  const bankTuftLocations = [
    [-0.05, 0.04, 0.38],
    [0.06, 0.04, 0.36],
    [-0.04, 0.04, -0.06],
    [0.05, 0.04, -0.08],
    [-0.25, 0.04, -0.22],
    [0.10, 0.04, -0.32],
  ];

  bankTuftLocations.forEach((loc, ti) => {
    for (let j = 0; j < 3; j++) {
      const ang = (j * 120 + ti * 30) * (Math.PI / 180);
      b.spike(
        [loc[0] + Math.sin(ang) * 0.012, loc[1], loc[2] + Math.cos(ang) * 0.012],
        [Math.sin(ang) * 0.3, 0.9, Math.cos(ang) * 0.3],
        0.042 + (ti % 3) * 0.008,
        0.0045,
        { color: (ti + j) % 2 === 0 ? "#4aa626" : "#68be34", name: `bankTuft_${ti}_${j}` },
      );
    }
  });

  return b.root;
}
```