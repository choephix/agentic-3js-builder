Here is what I am improving:

1. **Capybara Head & Face Sculpting**: Replaced the harsh disconnected cardboard boxes and protruding cheek balls with an organic, loaf-shaped head loft that maintains the iconic flat crown while curving smoothly into soft cheeks, sculpted nostrils, and a hinged lower jaw.
2. **Zen Capybara Expression & Eyes**: Fixed the hidden/clipping eyes with prominent, high-set sleepy smiling eyes, serene dark lashes, upper lids, and soft rosy blushing cheek pads.
3. **Ears & Whiskers**: Scaled and repositioned the ears high on the crown with peach cup interiors and fluffy tufts; curved the whiskers gracefully downward along the muzzle.
4. **Hero Bird & Storytelling Accessory**: Enlarged and reshaped the songbird into an adorable, chubby, colorful finch nestled in a little daisy-and-clover garland on the capybara's head, holding a fresh blossom in its beak.
5. **Leg Proportions & Anatomy**: Thickened the limbs into sturdy, chunky legs with natural hock angles and cute spread toes with dark blunt claws.
6. **Riverbank Diorama & Setting**: Eliminated water z-fighting artifacts with a smoothly beveled river pool, floating yuzu fruits (a whimsical nod to onsen capybaras), blooming water lilies, river pebbles, and tall cattail reeds framing the background.

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
    "A peaceful, zen-like capybara lounging on a flowery riverbank while a cheerful little songbird nests happily atop its head holding a blossom.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "capybara_and_bird" });
  const rand = rng(2024);

  // ---------------------------------------------------------------------------
  // 1. PROCEDURAL PAINTS & COLOR PALETTE
  // ---------------------------------------------------------------------------

  // Primary Capybara Coat: warm chestnut-amber fur with soft countershading
  const CAPY_COAT = paint((p, n) => {
    const baseDark = [0.46, 0.28, 0.17] as const; // rich cocoa
    const baseLight = [0.60, 0.40, 0.25] as const; // warm amber
    const bellyCream = [0.88, 0.76, 0.58] as const; // biscuit cream

    const g = noise(p, 0.08, 37);
    const fine = noise(p, 0.02, 101);
    let col = mix(baseDark, baseLight, g * 0.7 + fine * 0.3);

    // Warm belly countershading
    const bellyFactor = smoothstep(0.1, -0.6, n.y) * smoothstep(0.55, 0.24, p.y);
    col = mix(col, bellyCream, bellyFactor * 0.85);

    // Warm golden sunlight on the back
    const topFactor = smoothstep(0.4, 0.95, n.y) * smoothstep(0.38, 0.58, p.y);
    col = mix(col, [0.70, 0.48, 0.30], topFactor * 0.35);

    // Darker stockings at paws
    if (p.y < 0.13) {
      const sock = smoothstep(0.13, 0.04, p.y);
      col = mix(col, [0.26, 0.15, 0.09], sock * 0.7);
    }
    return col;
  });

  // Snout & Cheek Pad Paint: soft velvety warm brown
  const CAPY_SNOUT = paint((p) => {
    const darkMuzzle = [0.34, 0.20, 0.12] as const;
    const warmMuzzle = [0.46, 0.29, 0.18] as const;
    return mix(darkMuzzle, warmMuzzle, noise(p, 0.05, 52));
  });

  // Chin and throat cream
  const CAPY_CHIN = paint((p) => {
    const creamLight = [0.88, 0.78, 0.62] as const;
    const creamDark = [0.78, 0.66, 0.50] as const;
    return mix(creamDark, creamLight, noise(p, 0.06, 88));
  });

  // Songbird Plumage: radiant canary yellow belly and vibrant turquoise-teal mantle
  const BIRD_COAT = paint((p, n) => {
    const yellowBelly = [1.0, 0.82, 0.16] as const;
    const tealBack = [0.12, 0.72, 0.64] as const;
    const cobaltTip = [0.08, 0.34, 0.60] as const;

    const backFactor = smoothstep(-0.1, 0.5, n.y);
    let c = mix(yellowBelly, tealBack, backFactor);
    if (p.z < 0.58) {
      const tailFactor = smoothstep(0.58, 0.48, p.z);
      c = mix(c, cobaltTip, tailFactor * 0.75);
    }
    return c;
  });

  // Grass riverbank paint
  const GRASS_PAINT = paint((p) => {
    const deepGreen = [0.26, 0.50, 0.18] as const;
    const brightGreen = [0.44, 0.70, 0.24] as const;
    const mossGold = [0.55, 0.68, 0.22] as const;
    const n1 = noise(p, 0.16, 19);
    const n2 = noise(p, 0.04, 73);
    let c = mix(deepGreen, brightGreen, n1);
    return mix(c, mossGold, n2 * 0.35);
  });

  // River water paint
  const WATER_PAINT = paint((p) => {
    const waterDeep = [0.16, 0.52, 0.72] as const;
    const waterLight = [0.32, 0.72, 0.86] as const;
    return mix(waterDeep, waterLight, noise(p, 0.14, 44) * 0.5 + 0.25);
  });

  // River stone paint
  const STONE_PAINT = paint((p) => {
    const stoneDark = [0.46, 0.47, 0.45] as const;
    const stoneLight = [0.66, 0.67, 0.63] as const;
    const stoneWarm = [0.58, 0.55, 0.48] as const;
    let c = mix(stoneDark, stoneLight, noise(p, 0.08, 92));
    return mix(c, stoneWarm, noise(p, 0.03, 15) * 0.3);
  });

  // Flat accent colours
  const C_NOSE_DARK = "#28170e";
  const C_NOSE_NOSTRIL = "#140a05";
  const C_EAR_INNER = "#e89988";
  const C_EAR_FLUFF = "#f4debe";
  const C_WHISKER = "#321d10";
  const C_CLAW = "#22130c";
  const C_BIRD_BEAK = "#ff8014";
  const C_BIRD_LEGS = "#ff7210";
  const C_BIRD_CHEEK = "#ff6a90";
  const C_FLOWER_PINK = "#ffaec5";
  const C_FLOWER_GOLD = "#ffcc22";
  const C_STEM_GREEN = "#3ea42f";
  const C_YUZU_ORANGE = "#ff9910";
  const C_YUZU_LEAF = "#3ea82a";
  const C_CATTAIL_BROWN = "#442414";

  // ---------------------------------------------------------------------------
  // 2. TEXTURES & SVG GRAPHICS
  // ---------------------------------------------------------------------------

  // Peaceful smiling closed capybara eye with blush and fluttering lashes
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
          <stop offset="0%" stop-color="#24c4b2"/>
          <stop offset="55%" stop-color="#14869c"/>
          <stop offset="100%" stop-color="#103a5e"/>
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

  // Water Lily Pad
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

  // Sliced Yuzu / Citrus
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

  // Concentric water ripples
  const WATER_RIPPLE_TEX = svg(
    `<svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <circle cx="70" cy="70" r="64" fill="none" stroke="#dcf4fd" stroke-width="3.5" opacity="0.6"/>
      <circle cx="70" cy="70" r="45" fill="none" stroke="#e4f8ff" stroke-width="4.5" opacity="0.75"/>
      <circle cx="70" cy="70" r="26" fill="none" stroke="#ffffff" stroke-width="5" opacity="0.9"/>
      <circle cx="70" cy="70" r="9" fill="#ffffff" opacity="0.95"/>
    </svg>`,
    { size: 256 },
  );

  // Whimsical 5-petal wildflower
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

  // Capybara Spine & Head
  const hips = b.joint("hips", { at: [0, 0.45, -0.18], role: "spine" });
  const spine1 = b.joint("spine1", { parent: hips, at: [0, 0.47, 0.06], role: "spine" });
  const spine2 = b.joint("spine2", { parent: spine1, at: [0, 0.49, 0.26], role: "spine" });
  const neck = b.joint("neck", { parent: spine2, at: [0, 0.52, 0.42], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.57, 0.54], dir: [0, 0.05, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.48, 0.60], aim: [0, 0.49, 0.76], role: "jaw" });
  const tail1 = b.joint("tail1", { parent: hips, at: [0, 0.43, -0.40], dir: [0, -0.3, -1], role: "tail" });

  // Capybara Legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipPt: [number, number, number] = [s * 0.17, 0.43, -0.20];
    const kneePt: [number, number, number] = [s * 0.18, 0.28, -0.16];
    const hockPt: [number, number, number] = [s * 0.18, 0.15, -0.22];
    const anklePt: [number, number, number] = [s * 0.18, 0.05, -0.18];

    b.chain(`legH${side}`, [hipPt, kneePt, hockPt, anklePt], {
      parent: hips,
      role: "leg",
      names: [`hipH${side}`, `kneeH${side}`, `hockH${side}`, `ankleH${side}`],
      contact: anklePt,
    });

    const shoulderPt: [number, number, number] = [s * 0.16, 0.45, 0.22];
    const elbowPt: [number, number, number] = [s * 0.16, 0.30, 0.18];
    const wristPt: [number, number, number] = [s * 0.16, 0.15, 0.22];
    const pawPt: [number, number, number] = [s * 0.16, 0.05, 0.25];

    b.chain(`legF${side}`, [shoulderPt, elbowPt, wristPt, pawPt], {
      parent: spine2,
      role: "leg",
      names: [`shoulderF${side}`, `elbowF${side}`, `wristF${side}`, `ankleF${side}`],
      contact: pawPt,
    });
  }

  // Perched Bird Root (anchored firmly to capybara skull)
  const birdRoot = b.joint("birdRoot", { parent: head, at: [0, 0.69, 0.58], role: "spine" });
  const birdHead = b.joint("birdHead", { parent: birdRoot, at: [0, 0.77, 0.64], dir: [0, 0.15, 1], role: "head" });
  b.joint("birdWingL", { parent: birdRoot, at: [0.046, 0.71, 0.57], role: "wing" });
  b.joint("birdWingR", { parent: birdRoot, at: [-0.046, 0.71, 0.57], role: "wing" });
  b.joint("birdTail", { parent: birdRoot, at: [0, 0.70, 0.50], dir: [0, 0.25, -1], role: "tail" });

  // ---------------------------------------------------------------------------
  // 4. CAPYBARA BODY (CHUBBY LOAF OF BREAD)
  // ---------------------------------------------------------------------------

  // Continuous Main Body Loft: plump rump, hanging belly, sturdy chest
  b.loft(
    [
      { at: [0, 0.43, -0.40], w: 0.34, h: 0.35 }, // rounded rump
      { at: [0, 0.47, -0.24], w: 0.47, h: 0.44 }, // hind hips
      { at: [0, 0.44, -0.04], w: 0.50, h: 0.48 }, // hanging belly
      { at: [0, 0.47, 0.16], w: 0.46, h: 0.45 }, // chest
      { at: [0, 0.51, 0.34], w: 0.38, h: 0.40 }, // shoulder collar
    ],
    { bone: [hips, spine1, spine2], color: CAPY_COAT, caps: "round", name: "bodyLoft" },
  );

  // Smooth Neck Loft seamlessly bridging shoulders to head
  b.loft(
    [
      { at: [0, 0.51, 0.34], w: 0.38, h: 0.40 },
      { at: [0, 0.54, 0.44], w: 0.32, h: 0.36 },
      { at: [0, 0.56, 0.53], w: 0.28, h: 0.32 },
    ],
    { bone: [spine2, neck, head], color: CAPY_COAT, caps: "none", name: "neckLoft" },
  );

  // Cute tiny nub tail
  b.capsule([0, 0.43, -0.40], [0, 0.41, -0.43], [0.024, 0.014], {
    bone: tail1,
    color: CAPY_COAT,
    name: "tailNub",
  });

  // Soft throat bib
  b.part(new THREE.SphereGeometry(0.13, 10, 8), CAPY_CHIN, {
    bone: spine2,
    at: [0, 0.43, 0.28],
    scale: [1.1, 0.7, 1.1],
    name: "chestBib",
  });

  // ---------------------------------------------------------------------------
  // 5. SCULPTED CAPYBARA HEAD, SNOUT & EXPRESSION
  // ---------------------------------------------------------------------------

  // Continuous organic head loft: flat on top for the bird, tapering into a blocky rounded snout
  b.loft(
    [
      { at: [0, 0.58, 0.52], w: 0.27, h: 0.23 }, // back skull
      { at: [0, 0.58, 0.62], w: 0.25, h: 0.22 }, // crown mid (where bird sits)
      { at: [0, 0.56, 0.72], w: 0.23, h: 0.21 }, // forehead & eyes
      { at: [0, 0.53, 0.81], w: 0.20, h: 0.19 }, // bridge & muzzle
      { at: [0, 0.52, 0.86], w: 0.17, h: 0.16 }, // snout tip
    ],
    { bone: head, color: CAPY_COAT, caps: "round", name: "headLoft" },
  );

  // Nose tip leather block (sculpted rounded pad)
  b.part(new THREE.SphereGeometry(0.075, 12, 10), C_NOSE_DARK, {
    bone: head,
    at: [0, 0.52, 0.855],
    scale: [1.05, 0.85, 0.65],
    name: "nosePad",
  });

  // Flared dark nostrils
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.CylinderGeometry(0.014, 0.012, 0.02, 8), C_NOSE_NOSTRIL, {
      bone: head,
      at: [s * 0.038, 0.54, 0.885],
      dir: [s * 0.15, 0.35, 0.9],
      name: `nostril${side}`,
    });
  }

  // Philtrum vertical groove
  b.rod([0, 0.52, 0.89], [0, 0.485, 0.88], 0.006, C_NOSE_NOSTRIL, {
    bone: head,
    name: "philtrum",
  });

  // Lower Jaw on hinged joint with cream chin
  b.frustumBox(
    [0, 0.47, 0.64],
    [0, 0.47, 0.82],
    [0.17, 0.08],
    [0.14, 0.07],
    { bone: jaw, color: CAPY_CHIN, name: "lowerJaw" },
  );

  b.part(new THREE.SphereGeometry(0.065, 12, 10), CAPY_CHIN, {
    bone: jaw,
    at: [0, 0.47, 0.77],
    scale: [1.1, 0.7, 1.1],
    name: "chinPad",
  });

  // Gentle serene smile line
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.sweep(
      bezier([0, 0.485, 0.88], [s * 0.05, 0.482, 0.84], [s * 0.09, 0.495, 0.78]),
      0.0065,
      { bone: head, color: C_NOSE_NOSTRIL, name: `smileLine${side}` },
    );
  }

  // Chubby Cheeks with gentle pink blush
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.072, 12, 10), CAPY_SNOUT, {
      bone: head,
      at: [s * 0.095, 0.52, 0.70],
      scale: [0.75, 0.9, 1.15],
      name: `cheek${side}`,
    });

    // Rosy cheek glow
    b.part(new THREE.SphereGeometry(0.038, 8, 6), "#e87a6c", {
      bone: head,
      at: [s * 0.125, 0.53, 0.72],
      scale: [0.4, 0.8, 1.0],
      name: `cheekBlush${side}`,
    });
  }

  // High-set, Zen Sleepy Eyes (clear, prominent, adorable)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // Orbital brow ridge
    b.part(new THREE.SphereGeometry(0.034, 10, 8), CAPY_COAT, {
      bone: head,
      at: [s * 0.118, 0.605, 0.67],
      scale: [0.7, 1.0, 1.2],
      name: `eyeMound${side}`,
    });

    // Eye Decal (lifted slightly so it never clips or z-fights)
    b.part(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", {
      bone: head,
      at: [s * 0.134, 0.605, 0.67],
      dir: [s * 0.95, 0.1, 0.28],
      axis: "z",
      texture: CAPY_EYE_TEX,
      name: `eyeDecal${side}`,
    });

    // Serene dark upper eyelid crease
    b.sweep(
      bezier([s * 0.10, 0.635, 0.64], [s * 0.126, 0.642, 0.67], [s * 0.11, 0.632, 0.70]),
      0.007,
      { bone: head, color: "#3a2012", name: `eyelid${side}` },
    );
  }

  // Rounded cup-shaped ears placed high on crown
  const EAR_OUTLINE: OutlinePoint[] = [
    [0, 0],
    [0.026, 0.01],
    [0.038, 0.036, "sharp"],
    [0.030, 0.058],
    [0.012, 0.062],
    [-0.01, 0.046],
    [-0.012, 0.018],
  ];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // Outer ear shell
    b.extrude(EAR_OUTLINE, {
      bone: head,
      at: [s * 0.115, 0.64, 0.54],
      x: [s * 0.6, 0.2, 0.77],
      y: [s * 0.2, 0.95, -0.2],
      thickness: 0.016,
      bevel: 0.004,
      smoothing: 2,
      color: CAPY_COAT,
      name: `earShell${side}`,
    });

    // Peach inner ear
    b.extrude(EAR_OUTLINE, {
      bone: head,
      at: [s * 0.117, 0.641, 0.543],
      x: [s * 0.58, 0.2, 0.77],
      y: [s * 0.18, 0.95, -0.2],
      thickness: 0.008,
      bevel: 0.002,
      smoothing: 2,
      color: C_EAR_INNER,
      name: `earInner${side}`,
    });

    // Cozy fluffy tuft inside ear
    b.part(new THREE.SphereGeometry(0.014, 8, 6), C_EAR_FLUFF, {
      bone: head,
      at: [s * 0.122, 0.65, 0.55],
      scale: [1, 1.3, 0.8],
      name: `earFluff${side}`,
    });
  }

  // Gracefully curving whiskers
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const whiskerList = [
      { from: [s * 0.088, 0.53, 0.81], to: [s * 0.20, 0.50, 0.76] },
      { from: [s * 0.088, 0.51, 0.82], to: [s * 0.21, 0.46, 0.77] },
      { from: [s * 0.088, 0.49, 0.81], to: [s * 0.19, 0.42, 0.75] },
      { from: [s * 0.082, 0.52, 0.84], to: [s * 0.17, 0.48, 0.83] },
    ];

    whiskerList.forEach((w, i) => {
      const ctrl: [number, number, number] = [
        (w.from[0] + w.to[0]) * 0.5 + s * 0.015,
        (w.from[1] + w.to[1]) * 0.5 - 0.008,
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

  // Soft tactile dorsal fur ridge tufts
  const dorsalPoints = [
    [0, 0.55, 0.40],
    [0, 0.52, 0.26],
    [0, 0.50, 0.12],
    [0, 0.48, -0.02],
    [0, 0.49, -0.16],
    [0, 0.47, -0.28],
  ];

  dorsalPoints.forEach((p, idx) => {
    b.spike(p, [0, 0.85, -0.2], 0.036, 0.018, {
      bone: idx < 2 ? spine2 : idx < 4 ? spine1 : hips,
      color: idx % 2 === 0 ? "#5a341e" : "#805230",
      name: `dorsalTuft_${idx}`,
    });
  });

  // ---------------------------------------------------------------------------
  // 6. CAPYBARA LEGS, ANKLES & FEET
  // ---------------------------------------------------------------------------

  // Hind limbs (3 toes with blunt claws)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip: [number, number, number] = [s * 0.17, 0.43, -0.20];
    const knee: [number, number, number] = [s * 0.18, 0.28, -0.16];
    const hock: [number, number, number] = [s * 0.18, 0.15, -0.22];
    const ankle: [number, number, number] = [s * 0.18, 0.06, -0.18];

    b.capsule(hip, knee, [0.09, 0.072], { bone: `hipH${side}`, color: CAPY_COAT, name: `thighH${side}` });
    b.capsule(knee, hock, [0.072, 0.058], { bone: `kneeH${side}`, color: CAPY_COAT, name: `shinH${side}` });
    b.capsule(hock, ankle, [0.058, 0.046], { bone: `hockH${side}`, color: CAPY_COAT, name: `cannonH${side}` });

    // Foot base
    b.part(new THREE.BoxGeometry(0.092, 0.035, 0.082), CAPY_COAT, {
      bone: `ankleH${side}`,
      at: [s * 0.18, 0.045, -0.17],
      name: `footH${side}`,
    });

    // 3 Toes
    [-22, 0, 22].forEach((deg, ti) => {
      const rad = deg * (Math.PI / 180);
      const toeBase: [number, number, number] = [s * 0.18 + Math.sin(rad) * 0.026, 0.042, -0.17 + Math.cos(rad) * 0.034];
      const toeTip: [number, number, number] = [s * 0.18 + Math.sin(rad) * 0.046, 0.040, -0.17 + Math.cos(rad) * 0.064];
      b.capsule(toeBase, toeTip, [0.014, 0.012], { bone: `ankleH${side}`, color: CAPY_COAT, name: `toeH${side}_${ti}` });

      const clawDir: [number, number, number] = [Math.sin(rad) * 0.2, -0.1, Math.cos(rad)];
      b.spike(toeTip, clawDir, 0.014, 0.006, { bone: `ankleH${side}`, color: C_CLAW, name: `clawH${side}_${ti}` });
    });
  }

  // Fore limbs (4 toes with webbed connectors & blunt claws)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulder: [number, number, number] = [s * 0.16, 0.45, 0.22];
    const elbow: [number, number, number] = [s * 0.16, 0.30, 0.18];
    const wrist: [number, number, number] = [s * 0.16, 0.15, 0.22];
    const ankle: [number, number, number] = [s * 0.16, 0.06, 0.25];

    b.capsule(shoulder, elbow, [0.082, 0.065], { bone: `shoulderF${side}`, color: CAPY_COAT, name: `armF${side}` });
    b.capsule(elbow, wrist, [0.065, 0.052], { bone: `elbowF${side}`, color: CAPY_COAT, name: `forearmF${side}` });
    b.capsule(wrist, ankle, [0.052, 0.044], { bone: `wristF${side}`, color: CAPY_COAT, name: `wristSegF${side}` });

    // Fore foot base
    b.part(new THREE.BoxGeometry(0.088, 0.035, 0.082), CAPY_COAT, {
      bone: `ankleF${side}`,
      at: [s * 0.16, 0.045, 0.25],
      name: `footF${side}`,
    });

    // 4 Toes
    [-30, -10, 10, 30].forEach((deg, ti) => {
      const rad = deg * (Math.PI / 180);
      const toeBase: [number, number, number] = [s * 0.16 + Math.sin(rad) * 0.024, 0.042, 0.25 + Math.cos(rad) * 0.032];
      const toeTip: [number, number, number] = [s * 0.16 + Math.sin(rad) * 0.045, 0.040, 0.25 + Math.cos(rad) * 0.062];
      b.capsule(toeBase, toeTip, [0.012, 0.010], { bone: `ankleF${side}`, color: CAPY_COAT, name: `toeF${side}_${ti}` });

      const clawDir: [number, number, number] = [Math.sin(rad) * 0.2, -0.1, Math.cos(rad)];
      b.spike(toeTip, clawDir, 0.013, 0.0055, { bone: `ankleF${side}`, color: C_CLAW, name: `clawF${side}_${ti}` });
    });
  }

  // ---------------------------------------------------------------------------
  // 7. HERO ACCESSORY: CHUBBY SONGBIRD & FLOWER NEST ON HEAD
  // ---------------------------------------------------------------------------

  // Sweet Flower & Clover Perch Garland on Capybara Crown
  const NEST_CENTER = [0, 0.69, 0.58] as const;
  b.sweep(
    catmull(
      [
        [0.055, 0.695, 0.58],
        [0.038, 0.695, 0.63],
        [-0.038, 0.695, 0.63],
        [-0.055, 0.695, 0.58],
        [-0.038, 0.695, 0.53],
        [0.038, 0.695, 0.53],
      ],
      { closed: true },
    ),
    0.008,
    { bone: head, color: C_STEM_GREEN, name: "nestRing" },
  );

  // Tiny blossoms ringing the bird perch
  [0, 60, 120, 180, 240, 300].forEach((deg, i) => {
    const rad = deg * (Math.PI / 180);
    const fx = Math.sin(rad) * 0.052;
    const fz = 0.58 + Math.cos(rad) * 0.052;
    b.part(new THREE.PlaneGeometry(0.024, 0.024), "#ffffff", {
      bone: head,
      at: [fx, 0.702, fz],
      dir: [fx * 4, 1, (fz - 0.58) * 4],
      axis: "z",
      texture: FLOWER_TEX,
      name: `nestFlower_${i}`,
    });
  });

  // Chubby Plump Songbird Body
  b.loft(
    [
      { at: [0, 0.705, 0.51], w: 0.065, h: 0.060 }, // rump
      { at: [0, 0.725, 0.57], w: 0.092, h: 0.088 }, // plump round belly
      { at: [0, 0.755, 0.63], w: 0.076, h: 0.078 }, // chest/neck
    ],
    { bone: birdRoot, color: BIRD_COAT, caps: "round", name: "birdBody" },
  );

  // Round Bird Head
  b.part(new THREE.SphereGeometry(0.045, 14, 12), BIRD_COAT, {
    bone: birdHead,
    at: [0, 0.785, 0.64],
    scale: [0.98, 1.02, 1.05],
    name: "birdHeadSphere",
  });

  // Soft rosy cheeks
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.015, 8, 6), C_BIRD_CHEEK, {
      bone: birdHead,
      at: [s * 0.038, 0.772, 0.66],
      scale: [0.6, 1.0, 1.0],
      name: `birdCheek${side}`,
    });
  }

  // Sparkling bird eyes
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.PlaneGeometry(0.040, 0.040), "#ffffff", {
      bone: birdHead,
      at: [s * 0.042, 0.788, 0.655],
      dir: [s * 0.88, 0.1, 0.42],
      axis: "z",
      texture: BIRD_EYE_TEX,
      name: `birdEye${side}`,
    });
  }

  // Cute conical orange beak
  b.spike([0, 0.782, 0.685], [0, 0.06, 1], 0.028, 0.011, {
    bone: birdHead,
    color: C_BIRD_BEAK,
    name: "birdBeakUpper",
  });
  b.spike([0, 0.778, 0.685], [0, -0.06, 1], 0.022, 0.009, {
    bone: birdHead,
    color: C_BIRD_BEAK,
    name: "birdBeakLower",
  });

  // Jaunty 3-feather crown crest
  b.sweep(
    bezier([0, 0.825, 0.64], [0, 0.855, 0.63], [0, 0.875, 0.60]),
    [0.008, 0.001],
    { bone: birdHead, color: "#16b8a2", caps: "point", name: "birdCrestMid" },
  );
  b.part(new THREE.SphereGeometry(0.005, 6, 4), C_FLOWER_GOLD, {
    bone: birdHead,
    at: [0, 0.875, 0.60],
    name: "crestGemMid",
  });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.sweep(
      bezier([s * 0.014, 0.820, 0.64], [s * 0.025, 0.850, 0.63], [s * 0.030, 0.865, 0.605]),
      [0.006, 0.001],
      { bone: birdHead, color: "#16b8a2", caps: "point", name: `birdCrest${side}` },
    );
    b.part(new THREE.SphereGeometry(0.004, 6, 4), C_FLOWER_GOLD, {
      bone: birdHead,
      at: [s * 0.030, 0.865, 0.605],
      name: `crestGem${side}`,
    });
  }

  // Patterned feather wings
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.PlaneGeometry(0.062, 0.085), "#ffffff", {
      bone: birdRoot,
      at: [s * 0.052, 0.725, 0.56],
      dir: [s * 0.95, 0.1, -0.25],
      axis: "z",
      texture: BIRD_WING_TEX,
      name: `birdWingDecal${side}`,
    });

    b.capsule([s * 0.042, 0.74, 0.60], [s * 0.045, 0.71, 0.51], [0.018, 0.009], {
      bone: birdRoot,
      color: "#16869a",
      name: `birdWingCore${side}`,
    });
  }

  // Fanned bird tail feathers
  [-18, 0, 18].forEach((deg, i) => {
    const rad = deg * (Math.PI / 180);
    const tip: [number, number, number] = [Math.sin(rad) * 0.034, 0.74, 0.43];
    b.sweep(
      bezier([0, 0.71, 0.50], [Math.sin(rad) * 0.018, 0.725, 0.465], tip),
      [0.014, 0.003],
      { bone: birdRoot, color: i === 1 ? "#123d60" : "#16859a", caps: "point", name: `birdTail_${i}` },
    );
  });

  // Tiny orange bird legs gripping the perch
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.010, 6, 6), C_FLOWER_GOLD, {
      bone: birdRoot,
      at: [s * 0.024, 0.70, 0.58],
      scale: [1, 1.3, 1],
      name: `birdThigh${side}`,
    });

    b.rod([s * 0.024, 0.695, 0.58], [s * 0.024, 0.678, 0.58], 0.0032, C_BIRD_LEGS, {
      bone: birdRoot,
      name: `birdLeg${side}`,
    });

    [-25, 0, 25].forEach((deg, ti) => {
      const rad = deg * (Math.PI / 180);
      const tEnd: [number, number, number] = [
        s * 0.024 + Math.sin(rad) * 0.012,
        0.675,
        0.58 + Math.cos(rad) * 0.013,
      ];
      b.rod([s * 0.024, 0.678, 0.58], tEnd, 0.0022, C_BIRD_LEGS, {
        bone: birdRoot,
        name: `birdToe${side}_${ti}`,
      });
    });
  }

  // FLOWER HELD IN THE BIRD'S BEAK: Whimsical storytelling gesture
  b.sweep(
    bezier([0, 0.780, 0.71], [0.030, 0.760, 0.72], [0.052, 0.735, 0.70]),
    0.003,
    { bone: birdHead, color: C_STEM_GREEN, caps: "round", name: "heldStem" },
  );

  b.part(new THREE.SphereGeometry(0.008, 6, 4), C_STEM_GREEN, {
    bone: birdHead,
    at: [0.032, 0.752, 0.715],
    scale: [0.4, 0.8, 1.4],
    dir: [0.6, 0.2, 0.8],
    name: "heldStemLeaf",
  });

  b.part(new THREE.PlaneGeometry(0.050, 0.050), "#ffffff", {
    bone: birdHead,
    at: [0.055, 0.732, 0.70],
    dir: [0.55, 0.25, 0.8],
    axis: "z",
    texture: FLOWER_TEX,
    name: "heldFlowerFront",
  });

  b.part(new THREE.PlaneGeometry(0.050, 0.050), "#ffffff", {
    bone: birdHead,
    at: [0.054, 0.732, 0.699],
    dir: [-0.55, -0.25, -0.8],
    axis: "z",
    texture: FLOWER_TEX,
    name: "heldFlowerBack",
  });

  // ---------------------------------------------------------------------------
  // 8. FLOWERY RIVERBANK DIORAMA BASE
  // ---------------------------------------------------------------------------

  // Island Base: Clean organic boundary resting on y = 0
  const BASE_OUTLINE: OutlinePoint[] = [
    [-0.58, -0.62],
    [0.10, -0.66],
    [0.56, -0.52],
    [0.66, -0.10],
    [0.64, 0.38],
    [0.46, 0.76],
    [0.10, 0.94],
    [-0.36, 0.90],
    [-0.60, 0.60],
    [-0.64, 0.10],
    [-0.62, -0.30],
  ];

  // Base grass mound (thickness 0.04, from y = 0.0 to 0.04)
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

  // Smooth, recessed River Pool (clean contour, no z-fighting!)
  const POOL_OUTLINE: OutlinePoint[] = [
    [0.16, -0.42],
    [0.48, -0.44],
    [0.62, -0.15],
    [0.58, 0.24],
    [0.38, 0.42],
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

  // Floating Yuzu Citrus #1: Whole plump fruit with leaf (traditional capybara onsen bath)
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

  // Floating Yuzu Citrus #2: Fresh sliced half showing juicy star pattern
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

  // Blooming Lotus on the stream
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

  // River Reeds & Cattails framing the bank
  const cattailPositions = [
    [0.52, 0.04, -0.36],
    [0.56, 0.04, -0.28],
    [0.48, 0.04, 0.32],
    [0.42, 0.04, 0.38],
  ];

  cattailPositions.forEach((cp, ci) => {
    const stalkH = 0.28 + (ci % 2) * 0.08;
    // Green stalk
    b.rod([cp[0], cp[1], cp[2]], [cp[0], cp[1] + stalkH, cp[2]], 0.0035, C_STEM_GREEN, {
      name: `cattailStalk_${ci}`,
    });

    // Velvety brown cattail head
    b.capsule(
      [cp[0], cp[1] + stalkH - 0.08, cp[2]],
      [cp[0], cp[1] + stalkH - 0.01, cp[2]],
      0.008,
      { color: C_CATTAIL_BROWN, name: `cattailHead_${ci}` },
    );

    // Tip whisker
    b.spike([cp[0], cp[1] + stalkH - 0.01, cp[2]], [0, 1, 0], 0.018, 0.0015, {
      color: "#6b4226",
      name: `cattailTip_${ci}`,
    });

    // Arching leaves
    for (const ls of [1, -1]) {
      const leafTip: [number, number, number] = [
        cp[0] + ls * 0.04,
        cp[1] + stalkH * 0.65,
        cp[2] + ls * 0.03,
      ];
      b.sweep(
        bezier([cp[0], cp[1], cp[2]], [cp[0] + ls * 0.05, cp[1] + stalkH * 0.45, cp[2]], leafTip),
        [0.004, 0.001],
        { color: "#369024", caps: "point", name: `cattailLeaf_${ci}_${ls}` },
      );
    }
  });

  // Smooth River Pebbles along water edge
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
    [-0.14, 0.045, 0.65],
    [0.08, 0.045, 0.68],
    [0.34, 0.045, 0.52],
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
        0.040,
        0.004,
        { color: "#489e24", name: `grassBlade_${fi}_${gi}` },
      );
    });
  });

  // Additional vibrant grass tufts around feet
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