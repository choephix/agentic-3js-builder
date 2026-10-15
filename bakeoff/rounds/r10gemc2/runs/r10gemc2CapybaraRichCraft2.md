Here is a summary of the improvements:

1. **Capybara Proportions & Silhouette:**
   - Transformed the elongated, tapir-like profile into the classic chunky, loaf-of-bread / potato silhouette capybaras are celebrated for: a plump high rounded rump, deep barrel belly, and smooth transition from shoulders to neck.
   - Replaced the stiff, spindly legs with thick, sturdy columnar legs and broad webbed paws with dark claws firmly planted on the turf.

2. **Head, Snout & Facial Expression:**
   - Eliminated the awkward protruding rectangular jaw block and oversized dark swollen cheek spheres.
   - Built a unified, noble "shoebox" capybara head with a flat crown, broad blunt muzzle pad, soft cleft philtrum, and teardrop nostrils.
   - Redesigned the eyes into peaceful, sleepy smiling crescents with fluttering lashes, gentle brow highlights, and soft rosy peach cheek blush.
   - Sculpted cozy cupped ears with peach inner flaps and fluffy cream tufts, properly positioned at the top-back corners of the crown.

3. **The Songbird Hero Accessory:**
   - Rebuilt the songbird into an irresistibly plump, cheerful companion resting in a floral wreath on the capybara's head.
   - Redesigned its crest with a swept-back jaunty feather tuft, sparkling cartoon eyes, and brilliant kingfisher turquoise & canary yellow plumage.
   - Enhanced the flower held in its beak into a clear, charming pink blossom with green leaves.

4. **Environment & Diorama Details:**
   - Cleaned up the riverbank base with lush grass, smooth river pebbles, cattails with arching blade leaves, and blooming water lilies.
   - Added floating onsen yuzu fruits (both whole with a leaf and sliced showing juicy segments) in the gentle water ripples to enrich the whimsy and storytelling.

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
    "A peaceful, plump capybara relaxing on a flowery riverbank while a cheerful songbird nests atop its head, holding a fresh blossom.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "capybara_and_bird" });
  const rand = rng(42);

  // ---------------------------------------------------------------------------
  // 1. PROCEDURAL PAINTS & PALETTE
  // ---------------------------------------------------------------------------

  // Primary Capybara Fur: warm golden chestnut with soft straw grain and creamy underside
  const CAPY_FUR = paint((p, n) => {
    const deepCocoa = [0.42, 0.25, 0.15] as const;
    const warmAmber = [0.62, 0.42, 0.24] as const;
    const goldenHoney = [0.72, 0.52, 0.32] as const;
    const bellyCream = [0.86, 0.74, 0.56] as const;

    const grain = noise(p, 0.035, 12);
    const soft = noise(p, 0.12, 77);
    let col = mix(deepCocoa, warmAmber, grain * 0.6 + soft * 0.4);

    // Warm sunlit highlight across upper spine and crown
    const topGlint = smoothstep(0.4, 0.9, n.y) * smoothstep(0.35, 0.55, p.y);
    col = mix(col, goldenHoney, topGlint * 0.45);

    // Creamy biscuit countershading on underbelly & throat
    const belly = smoothstep(0.1, -0.65, n.y) * smoothstep(0.50, 0.22, p.y);
    col = mix(col, bellyCream, belly * 0.85);

    // Subtle darker stockings on the lower legs
    if (p.y < 0.14) {
      const sock = smoothstep(0.14, 0.04, p.y);
      col = mix(col, [0.28, 0.17, 0.10], sock * 0.75);
    }
    return col;
  });

  // Snout & Chin Muzzle Pad
  const CAPY_MUZZLE = paint((p) => {
    const darkMuzzle = [0.48, 0.32, 0.20] as const;
    const warmMuzzle = [0.58, 0.40, 0.26] as const;
    return mix(darkMuzzle, warmMuzzle, noise(p, 0.05, 33));
  });

  // Songbird Plumage: radiant canary yellow belly and vibrant turquoise back
  const BIRD_COAT = paint((p, n) => {
    const yellowBelly = [1.0, 0.84, 0.18] as const;
    const tealBack = [0.12, 0.74, 0.68] as const;
    const deepAzure = [0.08, 0.38, 0.62] as const;

    const backFactor = smoothstep(-0.15, 0.45, n.y);
    let c = mix(yellowBelly, tealBack, backFactor);
    if (p.z < 0.60) {
      const tailFactor = smoothstep(0.60, 0.48, p.z);
      c = mix(c, deepAzure, tailFactor * 0.8);
    }
    return c;
  });

  // Riverbank Grassland
  const GRASS_PAINT = paint((p) => {
    const deepGreen = [0.28, 0.54, 0.18] as const;
    const brightGreen = [0.48, 0.74, 0.24] as const;
    const goldenMoss = [0.60, 0.72, 0.22] as const;
    const n1 = noise(p, 0.18, 14);
    const n2 = noise(p, 0.05, 83);
    let c = mix(deepGreen, brightGreen, n1);
    return mix(c, goldenMoss, n2 * 0.35);
  });

  // Water Pool Paint
  const WATER_PAINT = paint((p) => {
    const waterDeep = [0.18, 0.56, 0.78] as const;
    const waterLight = [0.35, 0.76, 0.90] as const;
    return mix(waterDeep, waterLight, noise(p, 0.12, 59) * 0.5 + 0.25);
  });

  // River Stone Paint
  const STONE_PAINT = paint((p) => {
    const stoneDark = [0.44, 0.46, 0.44] as const;
    const stoneLight = [0.68, 0.70, 0.66] as const;
    const stoneTan = [0.58, 0.54, 0.46] as const;
    let c = mix(stoneDark, stoneLight, noise(p, 0.08, 91));
    return mix(c, stoneTan, noise(p, 0.03, 19) * 0.35);
  });

  // Accent Colors
  const C_NOSE_LEATHER = "#2c170d";
  const C_NOSTRIL = "#140a05";
  const C_EAR_INNER = "#e89686";
  const C_EAR_FLUFF = "#f6e4cc";
  const C_WHISKER = "#341d0e";
  const C_CLAW = "#221208";
  const C_BIRD_BEAK = "#ff7e12";
  const C_BIRD_LEGS = "#ff7210";
  const C_BIRD_CHEEK = "#ff6a8c";
  const C_FLOWER_PINK = "#ffa8c2";
  const C_FLOWER_GOLD = "#ffcc22";
  const C_STEM_GREEN = "#3ea42f";
  const C_YUZU_ORANGE = "#ff9a12";
  const C_YUZU_LEAF = "#3ea82a";
  const C_CATTAIL_BROWN = "#442212";

  // ---------------------------------------------------------------------------
  // 2. TEXTURES & SVG GRAPHICS
  // ---------------------------------------------------------------------------

  // Peaceful smiling closed capybara eye with blushing cheeks & fluttering lashes
  const CAPY_EYE_TEX = svg(
    `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="85" rx="36" ry="18" fill="#e87262" opacity="0.65"/>
      <path d="M 18 52 Q 60 78 102 52" stroke="#482816" stroke-width="8" stroke-linecap="round" fill="none"/>
      <path d="M 20 52 Q 60 80 100 52" stroke="#221108" stroke-width="6" stroke-linecap="round" fill="none"/>
      <path d="M 90 53 Q 102 44 110 47" stroke="#221108" stroke-width="4.5" stroke-linecap="round" fill="none"/>
      <path d="M 76 60 Q 85 48 92 50" stroke="#221108" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <path d="M 30 53 Q 20 46 12 49" stroke="#221108" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <circle cx="60" cy="36" r="3.5" fill="#ffe0a8" opacity="0.85"/>
    </svg>`,
    { size: 256 },
  );

  // Big, curious sparkling cartoon bird eye
  const BIRD_EYE_TEX = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="82" rx="30" ry="14" fill="#ff7090" opacity="0.75"/>
      <circle cx="50" cy="46" r="30" fill="#ffffff" stroke="#14202e" stroke-width="4"/>
      <circle cx="52" cy="46" r="23" fill="#1498aa"/>
      <circle cx="54" cy="46" r="16" fill="#0c1620"/>
      <circle cx="45" cy="38" r="8" fill="#ffffff"/>
      <circle cx="62" cy="54" r="4" fill="#ffffff"/>
      <path d="M 30 20 Q 50 13 70 23" stroke="#14202e" stroke-width="5" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  // Stylized scalloped wing feathers
  const BIRD_WING_TEX = svg(
    `<svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#28cfbe"/>
          <stop offset="55%" stop-color="#1690a6"/>
          <stop offset="100%" stop-color="#103c62"/>
        </linearGradient>
      </defs>
      <path d="M 20 20 Q 85 15 108 50 Q 115 110 50 152 Q 15 120 20 20 Z" fill="url(#wg)" stroke="#0e263e" stroke-width="3.5"/>
      <path d="M 25 55 Q 60 70 95 60" stroke="#f6d352" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M 22 90 Q 60 105 90 92" stroke="#f6d352" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <path d="M 35 120 Q 55 136 75 120" stroke="#ffd966" stroke-width="3" stroke-linecap="round" fill="none"/>
      <circle cx="60" cy="38" r="5" fill="#ffd966" opacity="0.9"/>
    </svg>`,
    { size: 256 },
  );

  // Water Lily Pad with cut notch and veins
  const LILY_PAD_TEX = svg(
    `<svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <path d="M 70 70 L 132 50 A 65 65 0 1 0 132 90 Z" fill="#2a7a36" stroke="#184e20" stroke-width="4"/>
      <path d="M 128 53 A 61 61 0 1 0 128 87" fill="none" stroke="#42a250" stroke-width="3"/>
      <path d="M 70 70 L 25 35 M 70 70 L 18 70 M 70 70 L 28 108 M 70 70 L 65 132 M 70 70 L 102 125 M 70 70 L 65 10 M 70 70 L 105 18" stroke="#3ca04c" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="85" cy="82" r="5" fill="#aee8f8" opacity="0.85"/>
      <circle cx="83" cy="80" r="1.5" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  // Sliced Yuzu Citrus Wheel
  const CITRUS_SLICE_TEX = svg(
    `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="56" fill="#ff8c00" stroke="#cc6200" stroke-width="3"/>
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

  // Water Ripple Rings
  const WATER_RIPPLE_TEX = svg(
    `<svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <circle cx="70" cy="70" r="64" fill="none" stroke="#dcf4fd" stroke-width="3.5" opacity="0.6"/>
      <circle cx="70" cy="70" r="45" fill="none" stroke="#e4f8ff" stroke-width="4.5" opacity="0.75"/>
      <circle cx="70" cy="70" r="26" fill="none" stroke="#ffffff" stroke-width="5" opacity="0.9"/>
      <circle cx="70" cy="70" r="9" fill="#ffffff" opacity="0.95"/>
    </svg>`,
    { size: 256 },
  );

  // Whimsical Wildflower
  const FLOWER_TEX = svg(
    `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <g fill="#ffa8c5" stroke="#dc6484" stroke-width="2.5">
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
  // 3. SKELETON
  // ---------------------------------------------------------------------------

  // Sturdy, compact capybara spine: chunky loaf proportions
  const hips = b.joint("hips", { at: [0, 0.42, -0.16], role: "spine" });
  const spine1 = b.joint("spine1", { parent: hips, at: [0, 0.44, 0.06], role: "spine" });
  const spine2 = b.joint("spine2", { parent: spine1, at: [0, 0.45, 0.24], role: "spine" });
  const neck = b.joint("neck", { parent: spine2, at: [0, 0.47, 0.38], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.50, 0.48], dir: [0, 0.02, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.41, 0.54], aim: [0, 0.41, 0.74], role: "jaw" });
  const tail1 = b.joint("tail1", { parent: hips, at: [0, 0.39, -0.38], dir: [0, -0.4, -1], role: "tail" });

  // Short, sturdy capybara limbs with planted feet
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipPt: [number, number, number] = [s * 0.17, 0.39, -0.16];
    const kneePt: [number, number, number] = [s * 0.18, 0.25, -0.13];
    const hockPt: [number, number, number] = [s * 0.18, 0.13, -0.17];
    const anklePt: [number, number, number] = [s * 0.18, 0.045, -0.14];

    b.chain(`legH${side}`, [hipPt, kneePt, hockPt, anklePt], {
      parent: hips,
      role: "leg",
      names: [`hipH${side}`, `kneeH${side}`, `hockH${side}`, `ankleH${side}`],
      contact: anklePt,
    });

    const shoulderPt: [number, number, number] = [s * 0.16, 0.40, 0.20];
    const elbowPt: [number, number, number] = [s * 0.16, 0.26, 0.18];
    const wristPt: [number, number, number] = [s * 0.16, 0.13, 0.21];
    const pawPt: [number, number, number] = [s * 0.16, 0.045, 0.24];

    b.chain(`legF${side}`, [shoulderPt, elbowPt, wristPt, pawPt], {
      parent: spine2,
      role: "leg",
      names: [`shoulderF${side}`, `elbowF${side}`, `wristF${side}`, `ankleF${side}`],
      contact: pawPt,
    });
  }

  // Bird Skeleton anchored squarely on the flat capybara skull crown
  const birdRoot = b.joint("birdRoot", { parent: head, at: [0, 0.62, 0.52], role: "spine" });
  const birdHead = b.joint("birdHead", { parent: birdRoot, at: [0, 0.69, 0.57], dir: [0, 0.15, 1], role: "head" });
  b.joint("birdWingL", { parent: birdRoot, at: [0.042, 0.63, 0.51], role: "wing" });
  b.joint("birdWingR", { parent: birdRoot, at: [-0.042, 0.63, 0.51], role: "wing" });
  b.joint("birdTail", { parent: birdRoot, at: [0, 0.62, 0.45], dir: [0, 0.25, -1], role: "tail" });

  // ---------------------------------------------------------------------------
  // 4. CHUNKY CAPYBARA BODY (CLASSIC BARREL LOAF)
  // ---------------------------------------------------------------------------

  // Continuous Main Body Loft: high round rump, deep rounded belly, broad shoulders
  b.loft(
    [
      { at: [0, 0.38, -0.38], w: 0.38, h: 0.36 }, // rounded back rump
      { at: [0, 0.43, -0.22], w: 0.52, h: 0.46 }, // high hind hips
      { at: [0, 0.41, -0.02], w: 0.56, h: 0.50 }, // plump hanging belly
      { at: [0, 0.43, 0.18], w: 0.50, h: 0.47 },  // chest
      { at: [0, 0.46, 0.34], w: 0.44, h: 0.42 },  // shoulder collar
    ],
    { bone: [hips, spine1, spine2], color: CAPY_FUR, caps: "round", name: "bodyLoft" },
  );

  // Seamless Neck Loft joining chest directly to the skull
  b.loft(
    [
      { at: [0, 0.46, 0.34], w: 0.44, h: 0.42 },
      { at: [0, 0.48, 0.42], w: 0.38, h: 0.38 },
      { at: [0, 0.50, 0.48], w: 0.33, h: 0.34 },
    ],
    { bone: [spine2, neck, head], color: CAPY_FUR, caps: "none", name: "neckLoft" },
  );

  // Soft throat bib
  b.part(new THREE.SphereGeometry(0.12, 10, 8), CAPY_MUZZLE, {
    bone: spine2,
    at: [0, 0.37, 0.26],
    scale: [1.1, 0.65, 1.1],
    name: "throatBib",
  });

  // Tiny cute capybara nub tail
  b.capsule([0, 0.38, -0.38], [0, 0.36, -0.41], [0.022, 0.012], {
    bone: tail1,
    color: CAPY_FUR,
    name: "tailNub",
  });

  // ---------------------------------------------------------------------------
  // 5. ICONIC CAPYBARA HEAD (FLAT-TOPPED "SHOEBOX" SNOUT)
  // ---------------------------------------------------------------------------

  // Unified Organic Head Loft: broad, flat on top for the bird, blunt snout front
  b.loft(
    [
      { at: [0, 0.51, 0.48], w: 0.31, h: 0.25 }, // back crown & skull
      { at: [0, 0.51, 0.56], w: 0.28, h: 0.24 }, // mid crown (flat bird perch)
      { at: [0, 0.49, 0.65], w: 0.25, h: 0.23 }, // eyes & brow line
      { at: [0, 0.46, 0.74], w: 0.22, h: 0.21 }, // muzzle bridge
      { at: [0, 0.44, 0.81], w: 0.18, h: 0.18 }, // blunt snout front
    ],
    { bone: head, color: CAPY_FUR, caps: "round", name: "headLoft" },
  );

  // Integrated lower jaw & chin (smooth and cozy, no disconnected block)
  b.loft(
    [
      { at: [0, 0.40, 0.54], w: 0.22, h: 0.12 },
      { at: [0, 0.40, 0.65], w: 0.19, h: 0.11 },
      { at: [0, 0.41, 0.74], w: 0.16, h: 0.10 },
    ],
    { bone: jaw, color: CAPY_MUZZLE, caps: "round", name: "lowerJawLoft" },
  );

  // Dark leather nose pad at snout tip
  b.part(new THREE.SphereGeometry(0.065, 12, 10), C_NOSE_LEATHER, {
    bone: head,
    at: [0, 0.445, 0.815],
    scale: [1.1, 0.85, 0.6],
    name: "noseLeather",
  });

  // Prominent flared teardrop nostrils
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.CylinderGeometry(0.012, 0.010, 0.018, 8), C_NOSTRIL, {
      bone: head,
      at: [s * 0.034, 0.46, 0.835],
      dir: [s * 0.15, 0.3, 0.9],
      name: `nostril${side}`,
    });
  }

  // Cleft vertical philtrum
  b.rod([0, 0.445, 0.84], [0, 0.415, 0.83], 0.0055, C_NOSTRIL, {
    bone: head,
    name: "philtrum",
  });

  // Serene smiling mouth line curving upward at the sides
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.sweep(
      bezier([0, 0.415, 0.83], [s * 0.05, 0.412, 0.79], [s * 0.082, 0.428, 0.73]),
      0.0055,
      { bone: head, color: C_NOSTRIL, name: `smileLine${side}` },
    );
  }

  // Subtle, sweet rosy cheek blush (discreet and blended, not dark bulging spheres)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.038, 8, 6), "#e87a6c", {
      bone: head,
      at: [s * 0.118, 0.46, 0.68],
      scale: [0.35, 0.75, 0.95],
      name: `blushPad${side}`,
    });
  }

  // Peaceful Closed Zen Eyes (high on the sides of the flat head)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // Gentle brow orbital cushion
    b.part(new THREE.SphereGeometry(0.030, 8, 6), CAPY_MUZZLE, {
      bone: head,
      at: [s * 0.115, 0.525, 0.63],
      scale: [0.7, 0.9, 1.2],
      name: `eyeCushion${side}`,
    });

    // Eye Decal (clean closed smiling arc)
    b.part(new THREE.PlaneGeometry(0.070, 0.070), "#ffffff", {
      bone: head,
      at: [s * 0.130, 0.525, 0.63],
      dir: [s * 0.95, 0.1, 0.26],
      axis: "z",
      texture: CAPY_EYE_TEX,
      name: `eyeDecal${side}`,
    });

    // Dark eyelid rim
    b.sweep(
      bezier([s * 0.098, 0.552, 0.60], [s * 0.122, 0.558, 0.63], [s * 0.108, 0.550, 0.66]),
      0.006,
      { bone: head, color: "#321a0c", name: `eyelidArch${side}` },
    );
  }

  // Rounded cup-shaped ears placed high at back corners of crown
  const EAR_OUTLINE: OutlinePoint[] = [
    [0, 0],
    [0.024, 0.01],
    [0.035, 0.034, "sharp"],
    [0.028, 0.054],
    [0.010, 0.058],
    [-0.01, 0.042],
    [-0.012, 0.016],
  ];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // Outer shell
    b.extrude(EAR_OUTLINE, {
      bone: head,
      at: [s * 0.118, 0.56, 0.50],
      x: [s * 0.65, 0.2, 0.73],
      y: [s * 0.15, 0.95, -0.2],
      thickness: 0.015,
      bevel: 0.003,
      smoothing: 2,
      color: CAPY_FUR,
      name: `earShell${side}`,
    });

    // Peach inner flap
    b.extrude(EAR_OUTLINE, {
      bone: head,
      at: [s * 0.120, 0.561, 0.503],
      x: [s * 0.62, 0.2, 0.73],
      y: [s * 0.14, 0.95, -0.2],
      thickness: 0.007,
      bevel: 0.002,
      smoothing: 2,
      color: C_EAR_INNER,
      name: `earInner${side}`,
    });

    // Cozy fluffy tuft inside ear
    b.part(new THREE.SphereGeometry(0.013, 8, 6), C_EAR_FLUFF, {
      bone: head,
      at: [s * 0.124, 0.57, 0.51],
      scale: [1, 1.2, 0.8],
      name: `earFluff${side}`,
    });
  }

  // Graceful, delicate arched whiskers
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const whiskers = [
      { from: [s * 0.082, 0.455, 0.76], to: [s * 0.18, 0.43, 0.72] },
      { from: [s * 0.082, 0.440, 0.77], to: [s * 0.19, 0.40, 0.73] },
      { from: [s * 0.082, 0.425, 0.76], to: [s * 0.17, 0.37, 0.71] },
      { from: [s * 0.076, 0.450, 0.79], to: [s * 0.16, 0.42, 0.78] },
    ];

    whiskers.forEach((w, i) => {
      const ctrl: [number, number, number] = [
        (w.from[0] + w.to[0]) * 0.5 + s * 0.012,
        (w.from[1] + w.to[1]) * 0.5 - 0.006,
        (w.from[2] + w.to[2]) * 0.5,
      ];
      b.sweep(bezier(w.from, ctrl, w.to), [0.0028, 0.0008], {
        bone: head,
        color: C_WHISKER,
        caps: { start: "round", end: "point" },
        name: `whisker${side}_${i}`,
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 6. SHORT, STURDY CAPYBARA LIMBS & WEBBED FEET
  // ---------------------------------------------------------------------------

  // Hind limbs: thick muscular thighs, distinct hocks, 3 webbed toes
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip: [number, number, number] = [s * 0.17, 0.39, -0.16];
    const knee: [number, number, number] = [s * 0.18, 0.25, -0.13];
    const hock: [number, number, number] = [s * 0.18, 0.13, -0.17];
    const ankle: [number, number, number] = [s * 0.18, 0.05, -0.14];

    b.capsule(hip, knee, [0.088, 0.072], { bone: `hipH${side}`, color: CAPY_FUR, name: `thighH${side}` });
    b.capsule(knee, hock, [0.072, 0.058], { bone: `kneeH${side}`, color: CAPY_FUR, name: `shinH${side}` });
    b.capsule(hock, ankle, [0.058, 0.048], { bone: `hockH${side}`, color: CAPY_FUR, name: `cannonH${side}` });

    // Wide foot base planted on ground
    b.part(new THREE.BoxGeometry(0.095, 0.034, 0.085), CAPY_FUR, {
      bone: `ankleH${side}`,
      at: [s * 0.18, 0.045, -0.13],
      name: `footH${side}`,
    });

    // 3 Toes
    [-22, 0, 22].forEach((deg, ti) => {
      const rad = deg * (Math.PI / 180);
      const toeBase: [number, number, number] = [s * 0.18 + Math.sin(rad) * 0.026, 0.042, -0.13 + Math.cos(rad) * 0.034];
      const toeTip: [number, number, number] = [s * 0.18 + Math.sin(rad) * 0.046, 0.040, -0.13 + Math.cos(rad) * 0.062];
      b.capsule(toeBase, toeTip, [0.014, 0.012], { bone: `ankleH${side}`, color: CAPY_FUR, name: `toeH${side}_${ti}` });

      const clawDir: [number, number, number] = [Math.sin(rad) * 0.2, -0.1, Math.cos(rad)];
      b.spike(toeTip, clawDir, 0.013, 0.0055, { bone: `ankleH${side}`, color: C_CLAW, name: `clawH${side}_${ti}` });
    });
  }

  // Fore limbs: sturdy forelegs, 4 webbed toes
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulder: [number, number, number] = [s * 0.16, 0.40, 0.20];
    const elbow: [number, number, number] = [s * 0.16, 0.26, 0.18];
    const wrist: [number, number, number] = [s * 0.16, 0.13, 0.21];
    const ankle: [number, number, number] = [s * 0.16, 0.05, 0.24];

    b.capsule(shoulder, elbow, [0.082, 0.066], { bone: `shoulderF${side}`, color: CAPY_FUR, name: `armF${side}` });
    b.capsule(elbow, wrist, [0.066, 0.054], { bone: `elbowF${side}`, color: CAPY_FUR, name: `forearmF${side}` });
    b.capsule(wrist, ankle, [0.054, 0.046], { bone: `wristF${side}`, color: CAPY_FUR, name: `wristSegF${side}` });

    // Fore foot base
    b.part(new THREE.BoxGeometry(0.092, 0.034, 0.085), CAPY_FUR, {
      bone: `ankleF${side}`,
      at: [s * 0.16, 0.045, 0.24],
      name: `footF${side}`,
    });

    // 4 Toes
    [-30, -10, 10, 30].forEach((deg, ti) => {
      const rad = deg * (Math.PI / 180);
      const toeBase: [number, number, number] = [s * 0.16 + Math.sin(rad) * 0.024, 0.042, 0.24 + Math.cos(rad) * 0.032];
      const toeTip: [number, number, number] = [s * 0.16 + Math.sin(rad) * 0.044, 0.040, 0.24 + Math.cos(rad) * 0.060];
      b.capsule(toeBase, toeTip, [0.012, 0.010], { bone: `ankleF${side}`, color: CAPY_FUR, name: `toeF${side}_${ti}` });

      const clawDir: [number, number, number] = [Math.sin(rad) * 0.2, -0.1, Math.cos(rad)];
      b.spike(toeTip, clawDir, 0.012, 0.005, { bone: `ankleF${side}`, color: C_CLAW, name: `clawF${side}_${ti}` });
    });
  }

  // ---------------------------------------------------------------------------
  // 7. HERO ACCESSORY: CHUBBY SONGBIRD & FLOWER NEST ON HEAD
  // ---------------------------------------------------------------------------

  // Sweet Flower & Twig Wreath Nest securely resting on the capybara's flat crown
  const nestCenter: [number, number, number] = [0, 0.605, 0.52];
  b.sweep(
    catmull(
      [
        [0.054, 0.605, 0.52],
        [0.038, 0.605, 0.57],
        [-0.038, 0.605, 0.57],
        [-0.054, 0.605, 0.52],
        [-0.038, 0.605, 0.47],
        [0.038, 0.605, 0.47],
      ],
      { closed: true },
    ),
    0.008,
    { bone: head, color: C_STEM_GREEN, name: "nestRing" },
  );

  // Little pink & yellow blossoms ringing the nest
  [0, 60, 120, 180, 240, 300].forEach((deg, i) => {
    const rad = deg * (Math.PI / 180);
    const fx = Math.sin(rad) * 0.052;
    const fz = 0.52 + Math.cos(rad) * 0.052;
    b.part(new THREE.PlaneGeometry(0.024, 0.024), "#ffffff", {
      bone: head,
      at: [fx, 0.615, fz],
      dir: [fx * 4, 1, (fz - 0.52) * 4],
      axis: "z",
      texture: FLOWER_TEX,
      name: `nestFlower_${i}`,
    });
  });

  // Chubby Plump Songbird Body (egg-shaped and cheerful)
  b.loft(
    [
      { at: [0, 0.62, 0.45], w: 0.068, h: 0.062 }, // plump rump
      { at: [0, 0.64, 0.51], w: 0.096, h: 0.092 }, // belly
      { at: [0, 0.67, 0.57], w: 0.080, h: 0.082 }, // chest
    ],
    { bone: birdRoot, color: BIRD_COAT, caps: "round", name: "birdBody" },
  );

  // Round Bird Head with cute tilt
  b.part(new THREE.SphereGeometry(0.046, 14, 12), BIRD_COAT, {
    bone: birdHead,
    at: [0, 0.70, 0.58],
    scale: [0.98, 1.02, 1.05],
    name: "birdHeadSphere",
  });

  // Soft rosy cheeks
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.015, 8, 6), C_BIRD_CHEEK, {
      bone: birdHead,
      at: [s * 0.038, 0.686, 0.60],
      scale: [0.6, 1.0, 1.0],
      name: `birdCheek${side}`,
    });
  }

  // Sparkling animated cartoon bird eyes
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.PlaneGeometry(0.042, 0.042), "#ffffff", {
      bone: birdHead,
      at: [s * 0.042, 0.702, 0.595],
      dir: [s * 0.88, 0.1, 0.42],
      axis: "z",
      texture: BIRD_EYE_TEX,
      name: `birdEye${side}`,
    });
  }

  // Cute conical orange beak
  b.spike([0, 0.696, 0.625], [0, 0.05, 1], 0.028, 0.011, {
    bone: birdHead,
    color: C_BIRD_BEAK,
    name: "birdBeakUpper",
  });
  b.spike([0, 0.692, 0.625], [0, -0.05, 1], 0.022, 0.009, {
    bone: birdHead,
    color: C_BIRD_BEAK,
    name: "birdBeakLower",
  });

  // Swept-back feather crest (dynamic and jaunty, not stiff antennas)
  b.sweep(
    bezier([0, 0.738, 0.58], [0, 0.770, 0.55], [0, 0.785, 0.51]),
    [0.008, 0.001],
    { bone: birdHead, color: "#16b8a2", caps: "point", name: "birdCrestMid" },
  );
  b.part(new THREE.SphereGeometry(0.005, 6, 4), C_FLOWER_GOLD, {
    bone: birdHead,
    at: [0, 0.785, 0.51],
    name: "crestGemMid",
  });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.sweep(
      bezier([s * 0.014, 0.735, 0.58], [s * 0.024, 0.765, 0.55], [s * 0.028, 0.776, 0.515]),
      [0.006, 0.001],
      { bone: birdHead, color: "#16b8a2", caps: "point", name: `birdCrest${side}` },
    );
    b.part(new THREE.SphereGeometry(0.004, 6, 4), C_FLOWER_GOLD, {
      bone: birdHead,
      at: [s * 0.028, 0.776, 0.515],
      name: `crestGem${side}`,
    });
  }

  // Scalloped feather wings
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.PlaneGeometry(0.065, 0.088), "#ffffff", {
      bone: birdRoot,
      at: [s * 0.052, 0.64, 0.50],
      dir: [s * 0.95, 0.1, -0.24],
      axis: "z",
      texture: BIRD_WING_TEX,
      name: `birdWingDecal${side}`,
    });

    b.capsule([s * 0.042, 0.65, 0.54], [s * 0.045, 0.62, 0.45], [0.018, 0.009], {
      bone: birdRoot,
      color: "#16869a",
      name: `birdWingCore${side}`,
    });
  }

  // Fanned bird tail feathers
  [-18, 0, 18].forEach((deg, i) => {
    const rad = deg * (Math.PI / 180);
    const tip: [number, number, number] = [Math.sin(rad) * 0.034, 0.65, 0.37];
    b.sweep(
      bezier([0, 0.62, 0.44], [Math.sin(rad) * 0.018, 0.635, 0.405], tip),
      [0.014, 0.003],
      { bone: birdRoot, color: i === 1 ? "#123d60" : "#16859a", caps: "point", name: `birdTail_${i}` },
    );
  });

  // Tiny orange bird legs gripping the nest
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.010, 6, 6), C_FLOWER_GOLD, {
      bone: birdRoot,
      at: [s * 0.024, 0.615, 0.52],
      scale: [1, 1.3, 1],
      name: `birdThigh${side}`,
    });

    b.rod([s * 0.024, 0.612, 0.52], [s * 0.024, 0.596, 0.52], 0.0030, C_BIRD_LEGS, {
      bone: birdRoot,
      name: `birdLeg${side}`,
    });

    [-25, 0, 25].forEach((deg, ti) => {
      const rad = deg * (Math.PI / 180);
      const tEnd: [number, number, number] = [
        s * 0.024 + Math.sin(rad) * 0.012,
        0.592,
        0.52 + Math.cos(rad) * 0.013,
      ];
      b.rod([s * 0.024, 0.596, 0.52], tEnd, 0.0022, C_BIRD_LEGS, {
        bone: birdRoot,
        name: `birdToe${side}_${ti}`,
      });
    });
  }

  // FRESH BLOSSOM PRESENTED IN THE BIRD'S BEAK
  b.sweep(
    bezier([0, 0.694, 0.65], [0.032, 0.675, 0.66], [0.055, 0.650, 0.64]),
    0.0032,
    { bone: birdHead, color: C_STEM_GREEN, caps: "round", name: "heldStem" },
  );

  b.part(new THREE.SphereGeometry(0.008, 6, 4), C_STEM_GREEN, {
    bone: birdHead,
    at: [0.034, 0.668, 0.655],
    scale: [0.4, 0.8, 1.4],
    dir: [0.6, 0.2, 0.8],
    name: "heldStemLeaf",
  });

  b.part(new THREE.PlaneGeometry(0.052, 0.052), "#ffffff", {
    bone: birdHead,
    at: [0.058, 0.648, 0.64],
    dir: [0.55, 0.25, 0.8],
    axis: "z",
    texture: FLOWER_TEX,
    name: "heldFlowerFront",
  });

  b.part(new THREE.PlaneGeometry(0.052, 0.052), "#ffffff", {
    bone: birdHead,
    at: [0.057, 0.648, 0.639],
    dir: [-0.55, -0.25, -0.8],
    axis: "z",
    texture: FLOWER_TEX,
    name: "heldFlowerBack",
  });

  // ---------------------------------------------------------------------------
  // 8. FLOWERY RIVERBANK DIORAMA BASE
  // ---------------------------------------------------------------------------

  // Island Base: Smooth rounded boundary resting on y = 0
  const BASE_OUTLINE: OutlinePoint[] = [
    [-0.56, -0.60],
    [0.10, -0.64],
    [0.54, -0.50],
    [0.64, -0.10],
    [0.62, 0.36],
    [0.44, 0.72],
    [0.10, 0.88],
    [-0.34, 0.84],
    [-0.58, 0.56],
    [-0.62, 0.10],
    [-0.60, -0.28],
  ];

  // Base grass meadow (thickness 0.04, from y = 0.0 to 0.04)
  b.extrude(BASE_OUTLINE, {
    at: [0, 0.02, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.04,
    bevel: 0.008,
    smoothing: 2,
    color: GRASS_PAINT,
    name: "grassIsland",
  });

  // Smooth, recessed River Pool
  const POOL_OUTLINE: OutlinePoint[] = [
    [0.16, -0.42],
    [0.48, -0.44],
    [0.60, -0.15],
    [0.56, 0.24],
    [0.36, 0.42],
    [0.22, 0.18],
    [0.15, -0.10],
  ];

  b.extrude(POOL_OUTLINE, {
    at: [0, 0.038, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.006,
    bevel: 0.003,
    smoothing: 2,
    color: WATER_PAINT,
    name: "riverPool",
  });

  // Water Ripple Rings
  b.part(new THREE.PlaneGeometry(0.18, 0.18), "#ffffff", {
    at: [0.38, 0.042, 0.15],
    dir: [0, 1, 0],
    axis: "z",
    texture: WATER_RIPPLE_TEX,
    name: "ripple1",
  });

  b.part(new THREE.PlaneGeometry(0.14, 0.14), "#ffffff", {
    at: [0.44, 0.042, -0.18],
    dir: [0, 1, 0],
    axis: "z",
    texture: WATER_RIPPLE_TEX,
    name: "ripple2",
  });

  // Floating Yuzu Citrus #1: Whole plump fruit with leaf
  b.part(new THREE.SphereGeometry(0.035, 12, 10), C_YUZU_ORANGE, {
    at: [0.38, 0.054, 0.15],
    scale: [1, 0.95, 1],
    name: "yuzuWhole",
  });
  b.rod([0.38, 0.084, 0.15], [0.38, 0.096, 0.145], 0.0028, "#523214", {
    name: "yuzuStem",
  });
  b.part(new THREE.SphereGeometry(0.013, 8, 4), C_YUZU_LEAF, {
    at: [0.394, 0.094, 0.145],
    scale: [1.6, 0.3, 0.8],
    dir: [0.8, 0.3, 0],
    name: "yuzuLeaf",
  });

  // Floating Yuzu Citrus #2: Sliced juicy wheel
  b.part(new THREE.CylinderGeometry(0.029, 0.028, 0.014, 14), C_YUZU_ORANGE, {
    at: [0.32, 0.046, -0.02],
    name: "yuzuSliceBody",
  });
  b.part(new THREE.CircleGeometry(0.0285, 14), "#ffffff", {
    at: [0.32, 0.0535, -0.02],
    dir: [0, 1, 0],
    axis: "z",
    texture: CITRUS_SLICE_TEX,
    name: "yuzuSliceFace",
  });

  // Floating Lily Pads
  b.part(new THREE.PlaneGeometry(0.13, 0.13), "#ffffff", {
    at: [0.46, 0.043, 0.04],
    dir: [0, 1, 0],
    axis: "z",
    texture: LILY_PAD_TEX,
    name: "lilyPad1",
  });

  b.part(new THREE.PlaneGeometry(0.10, 0.10), "#ffffff", {
    at: [0.26, 0.043, -0.25],
    dir: [0, 1, 0],
    axis: "z",
    texture: LILY_PAD_TEX,
    name: "lilyPad2",
  });

  // Blooming Lotus Flower
  const lotusCenter = [0.44, 0.054, -0.18] as const;
  b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.008, 10), C_FLOWER_GOLD, {
    at: lotusCenter,
    name: "lotusCenter",
  });

  [0, 60, 120, 180, 240, 300].forEach((deg, pi) => {
    const rad = deg * (Math.PI / 180);
    const pPos: [number, number, number] = [
      lotusCenter[0] + Math.sin(rad) * 0.019,
      lotusCenter[1] + 0.006,
      lotusCenter[2] + Math.cos(rad) * 0.019,
    ];
    b.part(new THREE.SphereGeometry(0.013, 8, 6), pi % 2 === 0 ? "#ffd4e2" : C_FLOWER_PINK, {
      at: pPos,
      scale: [0.7, 1.4, 0.5],
      dir: [Math.sin(rad) * 0.6, 0.8, Math.cos(rad) * 0.6],
      name: `lotusInner_${pi}`,
    });
  });

  [30, 90, 150, 210, 270, 330].forEach((deg, pi) => {
    const rad = deg * (Math.PI / 180);
    const pPos: [number, number, number] = [
      lotusCenter[0] + Math.sin(rad) * 0.027,
      lotusCenter[1] + 0.002,
      lotusCenter[2] + Math.cos(rad) * 0.027,
    ];
    b.part(new THREE.SphereGeometry(0.015, 8, 6), "#fff0f5", {
      at: pPos,
      scale: [0.8, 0.4, 1.6],
      dir: [Math.sin(rad), 0.3, Math.cos(rad)],
      name: `lotusOuter_${pi}`,
    });
  });

  // Cattails and Arching Reeds framing the stream
  const cattailPositions = [
    [0.52, 0.04, -0.36],
    [0.56, 0.04, -0.28],
    [0.48, 0.04, 0.32],
    [0.42, 0.04, 0.38],
  ];

  cattailPositions.forEach((cp, ci) => {
    const stalkH = 0.26 + (ci % 2) * 0.06;
    b.rod([cp[0], cp[1], cp[2]], [cp[0], cp[1] + stalkH, cp[2]], 0.0034, C_STEM_GREEN, {
      name: `cattailStalk_${ci}`,
    });

    b.capsule(
      [cp[0], cp[1] + stalkH - 0.075, cp[2]],
      [cp[0], cp[1] + stalkH - 0.01, cp[2]],
      0.0075,
      { color: C_CATTAIL_BROWN, name: `cattailHead_${ci}` },
    );

    b.spike([cp[0], cp[1] + stalkH - 0.01, cp[2]], [0, 1, 0], 0.016, 0.0015, {
      color: "#6b4226",
      name: `cattailTip_${ci}`,
    });

    for (const ls of [1, -1]) {
      const leafTip: [number, number, number] = [
        cp[0] + ls * 0.038,
        cp[1] + stalkH * 0.65,
        cp[2] + ls * 0.028,
      ];
      b.sweep(
        bezier([cp[0], cp[1], cp[2]], [cp[0] + ls * 0.045, cp[1] + stalkH * 0.45, cp[2]], leafTip),
        [0.0038, 0.001],
        { color: "#369024", caps: "point", name: `cattailLeaf_${ci}_${ls}` },
      );
    }
  });

  // Smooth River Pebbles nestled along water boundary
  const pebbles = [
    { at: [0.22, 0.048, -0.32], s: [0.042, 0.022, 0.052] },
    { at: [0.24, 0.052, -0.14], s: [0.055, 0.026, 0.045] },
    { at: [0.26, 0.054, 0.06], s: [0.062, 0.030, 0.056] },
    { at: [0.23, 0.048, 0.26], s: [0.048, 0.024, 0.042] },
    { at: [0.20, 0.044, 0.42], s: [0.050, 0.022, 0.058] },
    { at: [-0.34, 0.046, -0.12], s: [0.060, 0.028, 0.048] },
    { at: [-0.28, 0.050, 0.16], s: [0.046, 0.024, 0.054] },
    { at: [-0.42, 0.044, 0.34], s: [0.052, 0.025, 0.044] },
  ];

  pebbles.forEach((peb, i) => {
    b.part(new THREE.SphereGeometry(1, 10, 8), STONE_PAINT, {
      at: peb.at as [number, number, number],
      scale: peb.s as [number, number, number],
      name: `riverStone_${i}`,
    });
  });

  // Cheerful Wildflowers & Grasses on the Bank
  const flowerPositions = [
    [-0.32, 0.045, -0.30],
    [-0.22, 0.045, -0.42],
    [-0.40, 0.045, 0.05],
    [-0.36, 0.045, 0.48],
    [-0.14, 0.045, 0.62],
    [0.08, 0.045, 0.65],
    [0.32, 0.045, 0.50],
  ];

  flowerPositions.forEach((pos, fi) => {
    b.part(new THREE.PlaneGeometry(0.042, 0.042), "#ffffff", {
      at: [pos[0], pos[1] + 0.026, pos[2]],
      dir: [0.1, 0.95, 0.2],
      axis: "z",
      texture: FLOWER_TEX,
      name: `wildflower_${fi}`,
    });

    b.rod([pos[0], pos[1], pos[2]], [pos[0], pos[1] + 0.025, pos[2]], 0.0026, C_STEM_GREEN, {
      name: `flowerStem_${fi}`,
    });

    [-0.015, 0.015].forEach((dx, gi) => {
      b.spike(
        [pos[0] + dx, pos[1], pos[2] + 0.01],
        [dx * 15, 0.85, rand() * 0.2 - 0.1],
        0.038,
        0.004,
        { color: "#489e24", name: `grassBlade_${fi}_${gi}` },
      );
    });
  });

  // Vibrantly clustered grass tufts around the feet
  const bankTuftLocations = [
    [-0.05, 0.04, 0.36],
    [0.06, 0.04, 0.34],
    [-0.04, 0.04, -0.06],
    [0.05, 0.04, -0.08],
    [-0.25, 0.04, -0.20],
    [0.10, 0.04, -0.30],
  ];

  bankTuftLocations.forEach((loc, ti) => {
    for (let j = 0; j < 3; j++) {
      const ang = (j * 120 + ti * 30) * (Math.PI / 180);
      b.spike(
        [loc[0] + Math.sin(ang) * 0.012, loc[1], loc[2] + Math.cos(ang) * 0.012],
        [Math.sin(ang) * 0.3, 0.9, Math.cos(ang) * 0.3],
        0.040 + (ti % 3) * 0.007,
        0.0042,
        { color: (ti + j) % 2 === 0 ? "#4aa626" : "#68be34", name: `bankTuft_${ti}_${j}` },
      );
    }
  });

  return b.root;
}
```