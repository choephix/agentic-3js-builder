import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { lerp, offset, rng } from "../../../../src/math";
import type { V3 } from "../../../../src/math";
import { countershade, grain, mix, mottle, noise, paint, smoothstep, spots } from "../../../../src/paint";
import { bezier, catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Capybara & Friend",
  description:
    "A whimsical, zen capybara wearing a floral pond-walk scarf and balancing a yuzu, a tiny teacup, and a cheerful chubby yellow songbird on its head.",
  style: "whimsical",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------
// Palette & Storybook Paints
// ---------------------------------------------------------------------------
const FUR_WARM = "#b97a45";
const FUR_GOLDEN = "#d1935b";
const FUR_DORSAL = "#8c5228";
const FUR_BELLY = "#e8c396";
const FUR_MUZZLE = "#6e4226";
const FUR_MUZZLE_TOP = "#56321b";
const FUR_SOCK = "#4c2c18";
const NOSE_DARK = "#361e12";
const NOSE_SHINE = "#5e3b28";
const INNER_EAR = "#e09082";
const EYE_DARK = "#1f120b";
const EYE_SHINE = "#fffdf7";
const BLUSH_PINK = "#eb8c83";
const TOOTH_IVORY = "#fcf4dc";
const WHISKER_CREAM = "#f7ead2";
const HOOF_DARK = "#2d1a10";

// Whimsical accessories palette
const YUZU_ORANGE = "#ffb82e";
const YUZU_DEEP = "#e88915";
const LEAF_GREEN = "#54a847";
const LEAF_DARK = "#36782d";
const FLOWER_WHITE = "#fff9ed";
const FLOWER_PINK = "#ff9bb3";
const SCARF_TEAL = "#3aa69b";
const SCARF_CREAM = "#fff3d6";
const SCARF_GOLD = "#f2b63d";
const TEACUP_PORCELAIN = "#f4f7f5";
const TEACUP_BLUE = "#4c7ea8";
const TEA_GREEN = "#85b858";
const WOOD_WARM = "#78492a";
const BAG_CANVAS = "#e3cfa8";
const BAG_STRAP = "#704225";
const BRASS_GOLD = "#ebb438";

// Bird palette
const BIRD_YELLOW = "#ffd438";
const BIRD_ORANGE = "#f59b23";
const BIRD_CREAM = "#fff7d6";
const BIRD_WING = "#cca93d";
const BIRD_WING_TIP = "#5c4a32";
const BIRD_BEAK = "#ff7726";
const BIRD_CHEEK = "#ff6b6b";
const BIRD_CAP = "#4a7c59";

export default function build() {
  const b = createBuilder({ name: "capybara", detail: 1, paintSize: 1024 });

  // Rich, bristly, sun-dappled capybara fur paint
  const furStreaks = grain(FUR_WARM, FUR_GOLDEN, { size: 0.018, axis: "z", seed: 11 });
  const furMottle = mottle(furStreaks, FUR_DORSAL, { size: 0.14, contrast: 1.3, seed: 23 });
  const dorsalRumpSpots = spots(furMottle, "#9e6234", { size: 0.08, amount: 0.35, seed: 31 });

  const bodyCoat = paint((p, n) => {
    // Soft warm cream belly, golden flanks, rich cinnamon back, darker socks near the ground
    const bellyT = smoothstep(-0.35, 0.25, n.y);
    const dorsalT = smoothstep(0.35, 0.85, n.y) * smoothstep(0.35, -0.35, p.z);
    const base = mix(FUR_BELLY, dorsalRumpSpots.at(p, n), bellyT);
    const withDorsal = mix(base, FUR_DORSAL, dorsalT * 0.65);
    const sockT = smoothstep(0.2, 0.05, p.y);
    return mix(withDorsal, FUR_SOCK, sockT * 0.75);
  });

  const headCoat = paint((p, n) => {
    // Capybaras have a wonderfully velvety dark chocolate-cinnamon bridge and muzzle Pad
    const muzzleForward = smoothstep(0.46, 0.66, p.z);
    const bridgeTop = smoothstep(0.48, 0.64, p.y) * smoothstep(0.34, 0.58, p.z);
    const cheekWarm = smoothstep(0.5, 0.38, p.y) * (1 - muzzleForward * 0.5);
    const grainVal = grain(FUR_WARM, FUR_GOLDEN, { size: 0.014, axis: "z", seed: 19 }).at(p, n);
    let col = mix(grainVal, FUR_BELLY, cheekWarm * 0.45);
    col = mix(col, FUR_MUZZLE, muzzleForward * 0.85);
    col = mix(col, FUR_MUZZLE_TOP, bridgeTop * 0.55);
    return col;
  });

  const scarfPaint = paint((p, n, s) => {
    // Cozy woven stripe & polka-dot kerchief
    const stripe = Math.sin(s[0] * Math.PI * 16) > 0.55 || Math.abs(s[1] - 180) < 18;
    const dotCell = noise(p, 0.025, 77);
    if (stripe) return SCARF_GOLD;
    if (dotCell > 0.72) return SCARF_CREAM;
    return n.y > 0 ? SCARF_TEAL : "#2b8278";
  });

  const yuzuPaint = paint((p, n) => {
    const dimple = noise(p, 0.012, 91);
    const top = smoothstep(-0.4, 0.6, n.y);
    const base = mix(YUZU_DEEP, YUZU_ORANGE, top);
    return dimple > 0.62 ? mix(base, "#ffd65c", 0.35) : base;
  });

  const birdCoat = countershade(
    mottle(BIRD_YELLOW, BIRD_ORANGE, { size: 0.035, seed: 51 }),
    BIRD_CREAM,
    { level: -0.1, soft: 0.35 },
  );

  const birdWingPaint = paint((_p, _n, s) => {
    if (s[0] > 0.72) return BIRD_WING_TIP;
    if (s[0] > 0.45 && s[0] < 0.55) return BIRD_CREAM;
    return BIRD_WING;
  });

  // ---------------------------------------------------------------------------
  // SVG Textures for Cards & Details
  // ---------------------------------------------------------------------------
  const furTuftTex = svg(
    `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 96 C10 62 16 32 22 6 C26 30 27 58 28 96 Z" fill="#ffffff"/>
      <path d="M22 96 C25 54 30 22 34 2 C39 24 41 56 42 96 Z" fill="#f0f0f0"/>
      <path d="M36 96 C40 60 46 34 54 12 C54 40 53 68 56 96 Z" fill="#dcdcdc"/>
    </svg>`,
    { size: 192 },
  );

  const flowerPetalTex = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 60 C14 48 8 28 16 12 C22 4 42 4 48 12 C56 28 50 48 32 60 Z" fill="#fff9ed" stroke="#ffd6e0" stroke-width="3"/>
      <path d="M32 56 C24 42 24 26 32 14 C40 26 40 42 32 56 Z" fill="#ffccd8" opacity="0.5"/>
    </svg>`,
    { size: 128 },
  );

  const birdFeatherTex = svg(
    `<svg viewBox="0 0 48 96" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 94 C10 72 8 34 24 4 C40 34 38 72 24 94 Z" fill="#ffd94a" stroke="#e09419" stroke-width="3"/>
      <path d="M24 90 L24 10" stroke="#fff6c2" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );

  const cheekBlushTex = svg(
    `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="24" rx="28" ry="18" fill="#eb8278" opacity="0.85"/>
      <path d="M16 28 L24 18 M28 30 L36 18 M40 28 L48 18" stroke="#c95b53" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------------------
  // 1. Capybara Skeleton (Full Rig: Spine, Neck, Head, Jaw, Nump Tail, 4 Legs + Toes)
  // Real-world capybara size with whimsical storybook proportions:
  // ~1.08 m long, ~0.64 m tall at the crown of the head (plus yuzu & bird up to ~0.83 m).
  // ---------------------------------------------------------------------------
  const bodyCurve = catmull([
    [0, 0.33, -0.43], // rump
    [0, 0.36, -0.25], // hips
    [0, 0.38, -0.04], // mid belly
    [0, 0.41, 0.18],  // chest
    [0, 0.47, 0.33],  // neck base
  ]);

  const hips = b.joint("hips", { at: [0, 0.36, -0.25], dir: [0, 0.05, 1], role: "spine", group: "torso" });
  const rootT = bodyCurve.closestT(hips.at);

  const spine = b.chain("spine", bodyCurve.slice(rootT, 1), {
    parent: hips,
    names: ["spine1", "chest", "neckBase"],
    role: "spine",
    group: "torso",
  });

  const rumpChain = b.chain("rump", bodyCurve.slice(rootT, 0), {
    parent: hips,
    names: ["pelvis", "rumpTip"],
    role: "tail",
    group: "torso",
  });

  // Cute vestigial capybara tail nub joint
  const tailNub = b.joint("tailNub", {
    parent: rumpChain.tip!,
    at: [0, 0.32, -0.45],
    dir: [0, -0.35, -1],
    role: "tail",
    group: "torso",
  });

  // Neck & big blocky-rounded peaceful head
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.47, 0.33],
      [0, 0.52, 0.39],
      [0, 0.56, 0.44],
    ]),
    {
      parent: spine.tip!,
      names: ["neck", "head"],
      role: "neck",
      group: "head",
    },
  );

  const head = neck.tip!;

  // Snout and articulated lower jaw
  const snoutJoint = b.joint("snout", {
    parent: head,
    at: [0, 0.56, 0.57],
    dir: [0, -0.08, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.45, 0.46],
    dir: [0, -0.12, 1],
    role: "jaw",
    group: "head",
  });

  // Ears (hinged joints so they can twitch!)
  const earJoints: Record<string, ReturnType<typeof b.joint>> = {};
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    earJoints[side] = b.joint(`ear${side}`, {
      parent: head,
      at: [s * 0.115, 0.645, 0.37],
      dir: [s * 0.75, 0.65, -0.35],
      role: "hinge",
      group: `ear${side}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 2. Capybara Body & Head Volumes
  // ---------------------------------------------------------------------------
  // Plump, potato-shaped barrel body lofted smoothly across rump + hips + spine
  const bodyLoft = b.loft(
    [
      { at: [0, 0.31, -0.45], w: 0.18, h: 0.18 },
      { at: [0, 0.35, -0.36], w: 0.35, h: 0.32 },
      { at: [0, 0.36, -0.20], w: 0.41, h: 0.36 },
      { at: [0, 0.37, -0.02], w: 0.43, h: 0.37 },
      { at: [0, 0.39, 0.16], w: 0.39, h: 0.35 },
      { at: [0, 0.44, 0.30], w: 0.33, h: 0.31 },
      { at: [0, 0.49, 0.39], w: 0.28, h: 0.27 },
    ],
    {
      bone: [rumpChain, hips, spine],
      color: bodyCoat,
      caps: "round",
      name: "bodyBarrel",
      group: "torso",
    },
  );

  // Cute round rump cheeks & tiny vestigial tail button
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.115, 12, 10), bodyCoat, {
      bone: rumpChain.joints[0],
      at: [s * 0.085, 0.33, -0.36],
      scale: [0.95, 1.05, 1.15],
      name: `rumpCheek${side}`,
      group: "torso",
    });
  }
  b.capsule([0, 0.325, -0.44], [0, 0.31, -0.475], [0.028, 0.02], FUR_DORSAL, {
    bone: tailNub,
    name: "tailButton",
    group: "torso",
  });

  // Dewlap / cozy neck roll connecting chest to head
  b.capsule([0, 0.42, 0.28], [0, 0.51, 0.44], [0.155, 0.14], bodyCoat, {
    bone: neck.joints[0],
    name: "neckRoll",
    group: "head",
  });

  // Signature Capybara Head: iconic rectangular-yet-plush loaf with flat brow and deep round jowls
  const headLoft = b.loft(
    [
      { at: [0, 0.55, 0.34], w: 0.25, h: 0.23 },
      { at: [0, 0.57, 0.44], w: 0.27, h: 0.25 },
      { at: [0, 0.56, 0.56], w: 0.24, h: 0.23 },
      { at: [0, 0.54, 0.65], w: 0.20, h: 0.19 },
    ],
    {
      bone: [neck.joints[0], head, snoutJoint],
      color: headCoat,
      caps: "round",
      name: "headLoaf",
      group: "head",
    },
  );

  // Plush chubby cheeks on either side of the muzzle
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.085, 12, 10), headCoat, {
      bone: head,
      at: [s * 0.082, 0.505, 0.53],
      scale: [0.85, 0.92, 1.3],
      name: `cheekPouch${side}`,
      group: "head",
    });
  }

  // Broad, flat, velvety upper snout pad (classic capybara blunt nose-shield)
  b.part(new THREE.SphereGeometry(0.095, 14, 12), FUR_MUZZLE, {
    bone: snoutJoint,
    at: [0, 0.545, 0.635],
    scale: [1.05, 0.92, 0.72],
    name: "muzzleShield",
    group: "head",
  });

  // Split upper lip puffs (rodent philtrum)
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.052, 10, 8), FUR_MUZZLE, {
      bone: snoutJoint,
      at: [s * 0.042, 0.495, 0.64],
      scale: [1.05, 0.88, 0.95],
      name: `upperLip${side}`,
      group: "head",
    });
  }

  // Deep philtrum groove line down the middle of the nose
  b.capsule([0, 0.555, 0.698], [0, 0.472, 0.678], 0.007, NOSE_DARK, {
    bone: snoutJoint,
    name: "philtrum",
    group: "head",
  });

  // Widely spaced, comma-shaped nostrils high on the snout
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.022, 10, 8), NOSE_DARK, {
      bone: snoutJoint,
      at: [s * 0.058, 0.575, 0.678],
      rotation: [15, s * 22, s * -25],
      scale: [1.1, 0.75, 0.65],
      name: `nostrilOuter${side}`,
      group: "head",
    });
    b.part(new THREE.SphereGeometry(0.013, 8, 6), "#170b06", {
      bone: snoutJoint,
      at: [s * 0.058, 0.574, 0.686],
      rotation: [15, s * 22, s * -25],
      scale: [0.9, 0.55, 0.5],
      name: `nostrilHole${side}`,
      group: "head",
    });
    b.part(new THREE.SphereGeometry(0.008, 6, 6), NOSE_SHINE, {
      bone: snoutJoint,
      at: [s * 0.054, 0.584, 0.688],
      scale: [1.2, 0.6, 0.5],
      name: `nostrilHighlight${side}`,
      group: "head",
    });
  }

  // Lower jaw & cute chin with a small nibble of grass/clover and buck teeth
  b.capsule([0, 0.46, 0.47], [0, 0.455, 0.595], [0.068, 0.052], FUR_BELLY, {
    bone: jaw,
    name: "lowerJaw",
    group: "head",
  });
  b.part(new THREE.SphereGeometry(0.042, 10, 8), FUR_MUZZLE, {
    bone: jaw,
    at: [0, 0.462, 0.605],
    scale: [1.1, 0.65, 0.95],
    name: "lowerLip",
    group: "head",
  });

  // Tiny peeking rodent incisors (adds storybook charm)
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.frustumBox(
      [s * 0.011, 0.478, 0.638],
      [s * 0.011, 0.461, 0.635],
      [0.016, 0.008],
      [0.014, 0.006],
      {
        bone: snoutJoint,
        color: TOOTH_IVORY,
        name: `incisor${side}`,
        group: "head",
      },
    );
  }

  // A cheerful clover stem held gently in the corner of the capybara's mouth!
  const cloverStem = catmull([
    [0.02, 0.468, 0.635],
    [0.085, 0.462, 0.665],
    [0.145, 0.448, 0.69],
    [0.19, 0.425, 0.705],
  ]);
  b.sweep(cloverStem, [0.005, 0.0035], LEAF_GREEN, {
    bone: jaw,
    name: "cloverStem",
    group: "head",
  });
  const cloverTip = cloverStem.at(1);
  for (let i = 0; i < 4; i++) {
    const ang = (i * 90 + 25) * (Math.PI / 180);
    const dirX = Math.cos(ang) * 0.85;
    const dirY = Math.sin(ang) * 0.5 + 0.25;
    const dirZ = Math.sin(ang) * 0.7;
    b.part(new THREE.SphereGeometry(0.018, 8, 6), i === 0 ? "#6ec45e" : LEAF_GREEN, {
      bone: jaw,
      at: [cloverTip.x + dirX * 0.016, cloverTip.y + dirY * 0.012, cloverTip.z + dirZ * 0.016],
      dir: [dirX, dirY, dirZ],
      scale: [0.85, 1.25, 0.25],
      name: `cloverLeaf${i + 1}`,
      group: "head",
    });
  }

  // ---------------------------------------------------------------------------
  // 3. Expressive Zen Eyes, Brows, Blush & Whiskers
  // Capybaras have high-set, calm, half-lidded eyes near the top/sides of their head
  // ---------------------------------------------------------------------------
  const headSurf = b.surface(headLoft);
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const ex = s * 0.106;
    const ey = 0.602;
    const ez = 0.495;

    // Dark warm eye socket rim
    b.part(new THREE.SphereGeometry(0.027, 10, 8), FUR_MUZZLE_TOP, {
      bone: head,
      at: [ex * 0.96, ey, ez],
      scale: [0.65, 0.9, 1.15],
      name: `eyeSocket${side}`,
      group: "head",
    });

    // Glossy dark eyeball
    b.part(new THREE.SphereGeometry(0.022, 10, 8), EYE_DARK, {
      bone: head,
      at: [ex, ey, ez],
      scale: [0.75, 0.92, 1.05],
      name: `eye${side}`,
      group: "head",
    });

    // Relaxed, sleepy-happy heavy upper eyelid (key to the iconic chill capybara look)
    b.part(new THREE.SphereGeometry(0.025, 10, 8), FUR_DORSAL, {
      bone: head,
      at: [ex * 0.99, ey + 0.008, ez],
      rotation: [8, 0, s * -12],
      scale: [0.82, 0.55, 1.18],
      name: `upperEyelid${side}`,
      group: "head",
    });

    // Happy curved lower eyelid / smile crease
    b.capsule(
      [ex * 1.02, ey - 0.013, ez - 0.018],
      [ex * 1.01, ey - 0.011, ez + 0.018],
      0.0055,
      FUR_MUZZLE_TOP,
      {
        bone: head,
        name: `lowerEyelid${side}`,
        group: "head",
      },
    );

    // Double eye catchlights for whimsical life
    b.part(new THREE.SphereGeometry(0.0065, 6, 6), EYE_SHINE, {
      bone: head,
      at: [ex + s * 0.014, ey + 0.002, ez + 0.011],
      name: `eyeShineBig${side}`,
      group: "head",
    });
    b.part(new THREE.SphereGeometry(0.0038, 6, 6), EYE_SHINE, {
      bone: head,
      at: [ex + s * 0.015, ey - 0.005, ez - 0.007],
      name: `eyeShineSmall${side}`,
      group: "head",
    });

    // Expressive thick brow ridge above each eye
    b.capsule(
      [s * 0.095, ey + 0.026, ez - 0.024],
      [s * 0.102, ey + 0.024, ez + 0.024],
      [0.011, 0.009],
      FUR_MUZZLE_TOP,
      {
        bone: head,
        name: `brow${side}`,
        group: "head",
      },
    );

    // Rosy storybook blush decal on the cheeks
    b.decal(headSurf, cheekBlushTex, {
      at: [s * 0.115, 0.535, 0.535],
      dir: [s * 0.92, -0.05, 0.38],
      size: [0.055, 0.038],
      bone: head,
      name: `cheekBlush${side}`,
      group: "head",
    });

    // Whisker follicles & 5 curved cream whiskers per side
    const whiskerRows: Array<{ y: number; z: number; len: number; drop: number; spread: number }> = [
      { y: 0.535, z: 0.625, len: 0.085, drop: -0.015, spread: -0.01 },
      { y: 0.518, z: 0.642, len: 0.095, drop: -0.022, spread: 0.005 },
      { y: 0.502, z: 0.630, len: 0.090, drop: -0.028, spread: -0.018 },
      { y: 0.525, z: 0.600, len: 0.075, drop: -0.018, spread: -0.025 },
      { y: 0.492, z: 0.612, len: 0.070, drop: -0.026, spread: -0.012 },
    ];
    whiskerRows.forEach((w, idx) => {
      const root: V3 = [s * 0.088, w.y, w.z];
      const midPt: V3 = [s * (0.088 + w.len * 0.55), w.y + w.drop * 0.35, w.z + w.spread * 0.5];
      const tip: V3 = [s * (0.088 + w.len), w.y + w.drop, w.z + w.spread];
      b.part(new THREE.SphereGeometry(0.005, 6, 4), NOSE_DARK, {
        bone: snoutJoint,
        at: root,
        name: `whiskerDot${side}${idx + 1}`,
        group: "head",
      });
      b.sweep(bezier(root, midPt, tip), [0.0028, 0.0008], WHISKER_CREAM, {
        bone: snoutJoint,
        sides: 5,
        caps: { start: "flat", end: "point" },
        name: `whisker${side}${idx + 1}`,
        group: "head",
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 4. Cupped Capybara Ears (High & Back on the Skull)
  // ---------------------------------------------------------------------------
  const earOutline: OutlinePoint[] = [
    [-0.024, 0],
    [-0.034, 0.028],
    [-0.022, 0.062],
    [0, 0.072],
    [0.024, 0.060],
    [0.034, 0.026],
    [0.022, 0],
  ];
  const innerEarOutline: OutlinePoint[] = [
    [-0.015, 0.008],
    [-0.021, 0.028],
    [-0.013, 0.050],
    [0, 0.056],
    [0.014, 0.048],
    [0.020, 0.026],
    [0.014, 0.008],
  ];

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const earJ = earJoints[side];
    b.extrude(earOutline, {
      bone: earJ,
      at: earJ.at,
      x: [s * 0.7, -0.35, 0.62],
      y: [s * 0.55, 0.82, -0.18],
      thickness: [0.022, 0.012],
      bevel: 0.005,
      smoothing: 2,
      color: FUR_MUZZLE,
      name: `earOuter${side}`,
      group: `ear${side}`,
    });
    b.extrude(innerEarOutline, {
      bone: earJ,
      at: offset(earJ.at, [s * 0.35, -0.1, 0.9], 0.006),
      x: [s * 0.7, -0.35, 0.62],
      y: [s * 0.55, 0.82, -0.18],
      thickness: [0.012, 0.006],
      bevel: 0.003,
      smoothing: 2,
      color: INNER_EAR,
      name: `earInner${side}`,
      group: `ear${side}`,
    });
    // Fluffy cream ear-uff tuft inside each ear
    b.capsule(
      offset(earJ.at, [s * 0.2, 0.2, 0.5], 0.008),
      offset(earJ.at, [s * 0.55, 0.45, 0.4], 0.032),
      [0.012, 0.004],
      FUR_BELLY,
      {
        bone: earJ,
        name: `earTuft${side}`,
        group: `ear${side}`,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // 5. Four Sturdy Legs & Semi-Webbed Capybara Feet
  // Capybaras have 4 toes in front and 3 toes in back with blunt hoof-like claws!
  // Every foot rests cleanly at y = 0.
  // ---------------------------------------------------------------------------
  const legSpecs = [
    {
      prefix: "legFL",
      s: 1,
      front: true,
      parent: spine.joints[1], // chest
      hip: [0.135, 0.34, 0.20] as V3,
      foot: [0.145, 0.022, 0.23] as V3,
      lengths: [0.155, 0.135, 0.065],
      bends: [[0.15, 0, -1] as V3, [0.1, 0, 1] as V3],
      radii: [0.082, 0.062, 0.048, 0.044],
      toes: [
        { name: "toeFL1", ang: 28, len: 0.056, r: 0.017 },
        { name: "toeFL2", ang: 8, len: 0.066, r: 0.019 },
        { name: "toeFL3", ang: -12, len: 0.064, r: 0.019 },
        { name: "toeFL4", ang: -32, len: 0.052, r: 0.016 },
      ],
    },
    {
      prefix: "legFR",
      s: -1,
      front: true,
      parent: spine.joints[1], // chest
      hip: [-0.135, 0.34, 0.20] as V3,
      foot: [-0.145, 0.022, 0.23] as V3,
      lengths: [0.155, 0.135, 0.065],
      bends: [[-0.15, 0, -1] as V3, [-0.1, 0, 1] as V3],
      radii: [0.082, 0.062, 0.048, 0.044],
      toes: [
        { name: "toeFR1", ang: -28, len: 0.056, r: 0.017 },
        { name: "toeFR2", ang: -8, len: 0.066, r: 0.019 },
        { name: "toeFR3", ang: 12, len: 0.064, r: 0.019 },
        { name: "toeFR4", ang: 32, len: 0.052, r: 0.016 },
      ],
    },
    {
      prefix: "legBL",
      s: 1,
      front: false,
      parent: hips,
      hip: [0.145, 0.33, -0.24] as V3,
      foot: [0.155, 0.024, -0.21] as V3,
      lengths: [0.165, 0.135, 0.065],
      bends: [[0.18, 0, 1] as V3, [0.1, 0, -1] as V3],
      radii: [0.095, 0.068, 0.052, 0.046],
      toes: [
        { name: "toeBL1", ang: 22, len: 0.062, r: 0.019 },
        { name: "toeBL2", ang: 0, len: 0.072, r: 0.021 },
        { name: "toeBL3", ang: -22, len: 0.062, r: 0.019 },
      ],
    },
    {
      prefix: "legBR",
      s: -1,
      front: false,
      parent: hips,
      hip: [-0.145, 0.33, -0.24] as V3,
      foot: [-0.155, 0.024, -0.21] as V3,
      lengths: [0.165, 0.135, 0.065],
      bends: [[-0.18, 0, 1] as V3, [-0.1, 0, -1] as V3],
      radii: [0.095, 0.068, 0.052, 0.046],
      toes: [
        { name: "toeBR1", ang: -22, len: 0.062, r: 0.019 },
        { name: "toeBR2", ang: 0, len: 0.072, r: 0.021 },
        { name: "toeBR3", ang: 22, len: 0.062, r: 0.019 },
      ],
    },
  ];

  for (const spec of legSpecs) {
    const side = spec.s > 0 ? "L" : "R";
    const tag = spec.front ? `F${side}` : `B${side}`;
    const ikPts = limb(spec.hip, spec.foot, spec.lengths, spec.bends);
    const jointNames = spec.front
      ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `pawF${side}`]
      : [`hip${side}`, `knee${side}`, `ankle${side}`, `pawB${side}`];

    const legChain = b.chain(spec.prefix, ikPts, {
      parent: spec.parent,
      names: jointNames,
      role: "leg",
      contact: [spec.foot[0], 0, spec.foot[2] + 0.03],
      group: spec.prefix,
    });

    b.sweep(legChain, spec.radii, {
      color: bodyCoat,
      name: `${spec.prefix}Tube`,
      group: spec.prefix,
    });

    // Shoulder / thigh muscle pad blending into the torso
    b.part(new THREE.SphereGeometry(spec.front ? 0.088 : 0.102, 10, 8), bodyCoat, {
      bone: legChain.joints[0],
      at: lerp(spec.hip, ikPts[1], 0.25),
      scale: [0.88, 1.15, 1.18],
      name: `${spec.prefix}Muscle`,
      group: spec.prefix,
    });

    // Broad plantigrade/semi-digitigrade paw pad resting at y = 0.02
    const pawBone = legChain.tip!;
    const pawCenter: V3 = [spec.foot[0], 0.022, spec.foot[2] + 0.01];
    b.part(new THREE.SphereGeometry(0.046, 10, 8), FUR_SOCK, {
      bone: pawBone,
      at: pawCenter,
      scale: [1.12, 0.48, 1.25],
      name: `pawPad${tag}`,
      group: spec.prefix,
    });

    // Individual toes with joints (role: "digit"), webbing, and blunt hoof-claws
    const toeTips: V3[] = [];
    for (const tSpec of spec.toes) {
      const rad = (tSpec.ang * Math.PI) / 180;
      const dx = Math.sin(rad);
      const dz = Math.cos(rad);
      const toeRoot: V3 = [
        pawCenter[0] + dx * 0.025,
        0.019,
        pawCenter[2] + dz * 0.022,
      ];
      const toeTip: V3 = [
        pawCenter[0] + dx * (0.025 + tSpec.len),
        0.015,
        pawCenter[2] + dz * (0.022 + tSpec.len),
      ];
      toeTips.push(toeTip);

      const toeJ = b.joint(tSpec.name, {
        parent: pawBone,
        at: toeRoot,
        aim: toeTip,
        role: "digit",
        group: spec.prefix,
      });

      b.capsule(toeRoot, toeTip, [tSpec.r, tSpec.r * 0.82], FUR_SOCK, {
        bone: toeJ,
        name: `${tSpec.name}Mesh`,
        group: spec.prefix,
      });

      // Blunt hoof-like capybara nail at the tip of each toe
      const nailTip: V3 = [
        toeTip[0] + dx * 0.014,
        0.008,
        toeTip[2] + dz * 0.014,
      ];
      b.spike(toeTip, nailTip, null, tSpec.r * 0.78, HOOF_DARK, {
        bone: toeJ,
        name: `${tSpec.name}Nail`,
        group: spec.prefix,
      });
    }

    // Subtle inter-digital webbing slabs (capybaras have partially webbed feet!)
    for (let i = 0; i < toeTips.length - 1; i++) {
      const a = toeTips[i];
      const c = toeTips[i + 1];
      b.slab(
        [
          [pawCenter[0], 0.016, pawCenter[2] + 0.01],
          [lerp(pawCenter, a, 0.78).x, 0.014, lerp(pawCenter, a, 0.78).z],
          [lerp(pawCenter, c, 0.78).x, 0.014, lerp(pawCenter, c, 0.78).z],
        ],
        {
          bone: pawBone,
          thickness: 0.007,
          color: FUR_MUZZLE_TOP,
          name: `webbing${tag}${i + 1}`,
          group: spec.prefix,
        },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // 6. Whimsical Accessories: Cozy Woven Scarf, Herbalist Pouch & Teacup, Yuzu & Blossoms
  // ---------------------------------------------------------------------------
  const bodySurf = b.surface(bodyLoft);

  // Cozy teal-and-gold neck kerchief draped snugly around the neck/shoulders
  const scarfRough = catmull(
    [
      [0, 0.525, 0.25],
      [0.16, 0.45, 0.31],
      [0, 0.34, 0.38],
      [-0.16, 0.45, 0.31],
    ],
    { closed: true },
  );
  const scarfPath = bodySurf.drape(scarfRough, { lift: 0.014 });
  b.sweep(scarfPath, (t) => [0.024, 0.018 + 0.008 * Math.sin(t * Math.PI * 2)], {
    bone: neck.joints[0],
    color: scarfPaint,
    name: "neckScarf",
    group: "accessories",
  });

  // Triangle kerchief bib hanging on the front chest + knot & two fluttering tails
  const kerchiefKnotPos: V3 = [0.065, 0.375, 0.375];
  b.part(new THREE.SphereGeometry(0.028, 10, 8), SCARF_GOLD, {
    bone: spine.joints[1],
    at: kerchiefKnotPos,
    scale: [1.1, 0.95, 0.95],
    name: "scarfKnot",
    group: "accessories",
  });
  for (let i = 0; i < 2; i++) {
    const sign = i === 0 ? 1 : -1;
    const tailCurve = bezier(
      kerchiefKnotPos,
      [0.085 + sign * 0.025, 0.33, 0.395],
      [0.105 + sign * 0.042, 0.275 + i * 0.015, 0.385],
    );
    b.sweep(tailCurve, (t) => [0.018 * (1 - t * 0.35), 0.007], {
      bone: spine.joints[1],
      color: i === 0 ? SCARF_TEAL : SCARF_GOLD,
      caps: { start: "round", end: "flat" },
      name: `scarfTail${i + 1}`,
      group: "accessories",
    });
  }

  // Little wooden lucky charm bell hanging from the front of the scarf
  b.part(new THREE.SphereGeometry(0.020, 10, 8), BRASS_GOLD, {
    bone: spine.joints[1],
    at: [0, 0.325, 0.392],
    name: "collarBell",
    group: "accessories",
  });
  b.part(new THREE.SphereGeometry(0.007, 6, 6), NOSE_DARK, {
    bone: spine.joints[1],
    at: [0, 0.312, 0.402],
    name: "collarBellSlot",
    group: "accessories",
  });

  // Whimsical little leather strap & forage satchel on the capybara's flank, plus a tiny wooden saucer & teacup on its flat back!
  const girthPath = bodySurf.loop(spine.joints[0], { lift: 0.009 });
  b.sweep(girthPath, [0.014, 0.006], BAG_STRAP, {
    bone: spine.joints[0],
    name: "saddleStrap",
    group: "accessories",
  });

  // Brass buckle on top of the strap
  b.frustumBox([-0.025, 0.562, -0.04], [0.025, 0.562, -0.04], [0.036, 0.010], [0.036, 0.010], {
    bone: spine.joints[0],
    color: BRASS_GOLD,
    name: "strapBuckle",
    group: "accessories",
  });

  // Small woven bamboo coaster & steaming green teacup balanced serenely on the flat rump/back!
  const trayPos: V3 = [0, 0.552, -0.15];
  b.lathe(
    [
      [0, 0],
      [0.068, 0],
      [0.074, 0.008],
      [0.070, 0.016],
      [0.056, 0.016],
      [0.052, 0.008],
      [0, 0.008],
    ],
    {
      bone: hips,
      at: trayPos,
      segments: 16,
      color: WOOD_WARM,
      name: "teaSaucer",
      group: "accessories",
    },
  );
  // Porcelain yunomi teacup
  b.lathe(
    [
      [0, 0.008],
      [0.036, 0.008],
      [0.044, 0.025],
      [0.046, 0.058],
      [0.048, 0.072],
      [0.041, 0.072],
      [0.038, 0.048],
      [0, 0.048],
    ],
    {
      bone: hips,
      at: trayPos,
      segments: 16,
      color: paint((_p, _n, s) =>
        s[0] > 0.048 && s[0] < 0.060 ? TEACUP_BLUE : TEACUP_PORCELAIN,
      ),
      name: "teacup",
      group: "accessories",
    },
  );
  // Warm green tea surface inside the cup
  b.part(new THREE.CylinderGeometry(0.039, 0.039, 0.006, 14), TEA_GREEN, {
    bone: hips,
    at: [trayPos[0], trayPos[1] + 0.052, trayPos[2]],
    name: "teaLiquid",
    group: "accessories",
  });

  // Cute round herbalist pouch hanging on the left flank (+X)
  const pouchPos: V3 = [0.215, 0.355, -0.04];
  b.part(new THREE.SphereGeometry(0.058, 12, 10), BAG_CANVAS, {
    bone: spine.joints[0],
    at: pouchPos,
    scale: [0.55, 1.05, 1.18],
    name: "flankPouch",
    group: "accessories",
  });
  b.part(new THREE.SphereGeometry(0.056, 10, 8), BAG_STRAP, {
    bone: spine.joints[0],
    at: [pouchPos[0] + 0.004, pouchPos[1] + 0.025, pouchPos[2]],
    scale: [0.58, 0.55, 1.15],
    name: "pouchFlap",
    group: "accessories",
  });
  b.part(new THREE.SphereGeometry(0.011, 8, 6), BRASS_GOLD, {
    bone: spine.joints[0],
    at: [pouchPos[0] + 0.032, pouchPos[1] + 0.005, pouchPos[2]],
    name: "pouchButton",
    group: "accessories",
  });
  // A tiny rolled scroll & golden yuzu peeking out of the side pouch
  b.capsule(
    [pouchPos[0] + 0.008, pouchPos[1] + 0.035, pouchPos[2] - 0.035],
    [pouchPos[0] + 0.016, pouchPos[1] + 0.068, pouchPos[2] - 0.062],
    0.014,
    SCARF_CREAM,
    {
      bone: spine.joints[0],
      caps: "flat",
      name: "pouchScroll",
      group: "accessories",
    },
  );

  // ---------------------------------------------------------------------------
  // 7. Crown Yuzu Fruit, Leaves & White Orange-Blossoms on the Capybara's Head
  // Serves as the cozy throne for the small bird!
  // ---------------------------------------------------------------------------
  const yuzuBase: V3 = [0, 0.652, 0.455];

  // Small ring of soft green moss/leaves cushioning the yuzu on the flat crown
  for (let i = 0; i < 5; i++) {
    const ang = (i * 72 + 18) * (Math.PI / 180);
    const lx = Math.sin(ang) * 0.048;
    const lz = Math.cos(ang) * 0.048;
    b.part(new THREE.SphereGeometry(0.026, 8, 6), i % 2 === 0 ? LEAF_GREEN : LEAF_DARK, {
      bone: head,
      at: [yuzuBase[0] + lx, yuzuBase[1] + 0.006, yuzuBase[2] + lz],
      dir: [lx, 0.25, lz],
      scale: [0.75, 1.35, 0.22],
      name: `crownCushionLeaf${i + 1}`,
      group: "head",
    });
  }

  // Plump dimpled golden yuzu citrus resting on the capybara's crown
  b.lathe(
    [
      [0, 0],
      [0.032, 0.002],
      [0.054, 0.018],
      [0.058, 0.040],
      [0.050, 0.062],
      [0.028, 0.074],
      [0.012, 0.079],
      [0, 0.076],
    ],
    {
      bone: head,
      at: yuzuBase,
      segments: 16,
      smoothing: 1,
      color: yuzuPaint,
      name: "crownYuzu",
      group: "head",
    },
  );

  // Yuzu stem & two glossy citrus leaves sprouting to the side
  const yuzuTop: V3 = [yuzuBase[0], yuzuBase[1] + 0.076, yuzuBase[2]];
  b.capsule(yuzuTop, [yuzuTop[0] - 0.008, yuzuTop[1] + 0.018, yuzuTop[2] - 0.006], [0.006, 0.004], LEAF_DARK, {
    bone: head,
    name: "yuzuStem",
    group: "head",
  });
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.extrude(
      [
        [0, 0],
        [0.018, 0.014],
        [0.042, 0.016],
        [0.058, 0.002, "sharp"],
        [0.038, -0.012],
        [0.015, -0.010],
      ],
      {
        bone: head,
        at: [yuzuTop[0] + s * 0.012, yuzuTop[1] - 0.004, yuzuTop[2] - 0.008],
        x: [s * 0.88, 0.18, -0.42],
        y: [0, 1, 0.2],
        thickness: [0.006, 0.002],
        bevel: 0.002,
        smoothing: 2,
        color: s > 0 ? LEAF_GREEN : LEAF_DARK,
        name: `yuzuLeaf${side}`,
        group: "head",
      },
    );
  }

  // Two dainty five-petaled citrus blossoms tucked beside the yuzu and left ear
  const flowerSpots: Array<{ pos: V3; up: V3; scale: number; name: string }> = [
    { pos: [0.068, 0.656, 0.435], up: [0.55, 0.82, 0.15], scale: 1.0, name: "blossomL" },
    { pos: [-0.062, 0.652, 0.468], up: [-0.5, 0.84, 0.22], scale: 0.85, name: "blossomR" },
  ];
  for (const fl of flowerSpots) {
    const flFrame = frame(fl.pos, fl.up);
    const petalRing = b.ring(flFrame, { count: 5, radius: 0.006 * fl.scale, tilt: 62 });
    b.cards(petalRing.items, flowerPetalTex, {
      size: [0.022 * fl.scale, 0.026 * fl.scale],
      lean: 72,
      bend: -15,
      bone: head,
      name: `${fl.name}Petals`,
      group: "head",
    });
    b.part(new THREE.SphereGeometry(0.009 * fl.scale, 8, 6), YUZU_ORANGE, {
      bone: head,
      at: fl.pos,
      name: `${fl.name}Center`,
      group: "head",
    });
    b.part(new THREE.SphereGeometry(0.005 * fl.scale, 6, 4), FLOWER_PINK, {
      bone: head,
      at: offset(fl.pos, fl.up, 0.006 * fl.scale),
      name: `${fl.name}Bud`,
      group: "head",
    });
  }

  // ---------------------------------------------------------------------------
  // 8. The Small Bird on the Capybara's Head (Full Mini-Skeleton & Rig!)
  // A plump, round, whimsical golden titmouse / canary perched atop the yuzu
  // ---------------------------------------------------------------------------
  const birdHipPos: V3 = [0, 0.752, 0.448];
  const birdBody = b.joint("birdBody", {
    parent: head,
    at: birdHipPos,
    dir: [0, 0.22, 1],
    role: "spine",
    group: "bird",
  });

  const birdHead = b.joint("birdHead", {
    parent: birdBody,
    at: [0, 0.788, 0.478],
    dir: [0, 0.12, 1],
    role: "head",
    group: "bird",
  });

  const birdBeakLower = b.joint("birdJaw", {
    parent: birdHead,
    at: [0, 0.780, 0.518],
    dir: [0, -0.18, 1],
    role: "jaw",
    group: "bird",
  });

  const birdTail = b.joint("birdTail", {
    parent: birdBody,
    at: [0, 0.754, 0.402],
    dir: [0, 0.48, -1],
    role: "tail",
    group: "bird",
  });

  // Bird wings & tiny feet joints
  const birdWingJoints: Record<string, ReturnType<typeof b.joint>> = {};
  const birdLegJoints: Record<string, ReturnType<typeof b.joint>> = {};
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    birdWingJoints[side] = b.joint(`birdWing${side}`, {
      parent: birdBody,
      at: [s * 0.044, 0.768, 0.456],
      dir: [s * 0.45, -0.25, -0.85],
      role: "wing",
      group: "bird",
    });
    birdLegJoints[side] = b.joint(`birdLeg${side}`, {
      parent: birdBody,
      at: [s * 0.022, 0.734, 0.455],
      dir: [s * 0.12, -1, 0.15],
      role: "leg",
      group: "bird",
    });
  }

  // Plump round borb body + head loft
  b.loft(
    [
      { at: [0, 0.752, 0.402], w: 0.048, h: 0.046 },
      { at: [0, 0.754, 0.438], w: 0.094, h: 0.086 },
      { at: [0, 0.768, 0.472], w: 0.088, h: 0.084 },
      { at: [0, 0.790, 0.494], w: 0.074, h: 0.072 },
    ],
    {
      bone: [birdTail, birdBody, birdHead],
      color: birdCoat,
      caps: "round",
      name: "birdTorso",
      group: "bird",
    },
  );

  // Fluffy cream breast puff on the bird
  b.part(new THREE.SphereGeometry(0.042, 10, 8), BIRD_CREAM, {
    bone: birdBody,
    at: [0, 0.756, 0.476],
    scale: [0.95, 0.88, 0.85],
    name: "birdBreastPuff",
    group: "bird",
  });

  // Cute leaf-beret / mossy cap on the bird's head + bouncy two-feather crest
  b.lathe(
    [
      [0, 0.020],
      [0.016, 0.022],
      [0.032, 0.014],
      [0.036, 0.004],
      [0.028, 0],
      [0, 0.004],
    ],
    {
      bone: birdHead,
      at: [0, 0.814, 0.476],
      axis: [-0.15, 0.96, -0.22],
      segments: 12,
      color: BIRD_CAP,
      name: "birdLeafCap",
      group: "bird",
    },
  );

  // Two perky crest feathers on the bird's crown
  for (let i = 0; i < 2; i++) {
    const crestCurve = bezier(
      [0, 0.822, 0.476 - i * 0.008],
      [0, 0.852 - i * 0.006, 0.472 - i * 0.015],
      [0, 0.858 - i * 0.010, 0.448 - i * 0.018],
    );
    b.sweep(crestCurve, (t) => [0.007 * (1 - t * 0.5) + 0.002, 0.003], {
      bone: birdHead,
      color: i === 0 ? BIRD_ORANGE : BIRD_YELLOW,
      caps: "round",
      name: `birdCrest${i + 1}`,
      group: "bird",
    });
  }

  // Bird upper & lower beak (open in a tiny cheerful chirp)
  b.spike([0, 0.788, 0.514], [0, 0.788, 0.542], null, 0.013, BIRD_BEAK, {
    bone: birdHead,
    name: "birdBeakUpper",
    group: "bird",
  });
  b.spike([0, 0.780, 0.514], [0, 0.775, 0.536], null, 0.010, BIRD_ORANGE, {
    bone: birdBeakLower,
    name: "birdBeakLower",
    group: "bird",
  });

  // Bird shiny bead eyes & rosy round cheeks
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const bx = s * 0.031;
    const by = 0.794;
    const bz = 0.498;
    b.part(new THREE.SphereGeometry(0.0085, 8, 6), EYE_DARK, {
      bone: birdHead,
      at: [bx, by, bz],
      name: `birdEye${side}`,
      group: "bird",
    });
    b.part(new THREE.SphereGeometry(0.0035, 6, 4), EYE_SHINE, {
      bone: birdHead,
      at: [bx + s * 0.005, by + 0.003, bz + 0.005],
      name: `birdEyeShine${side}`,
      group: "bird",
    });
    b.part(new THREE.SphereGeometry(0.010, 8, 6), BIRD_CHEEK, {
      bone: birdHead,
      at: [s * 0.033, 0.782, 0.496],
      scale: [0.55, 0.75, 1.0],
      name: `birdCheek${side}`,
      group: "bird",
    });
  }

  // Sculpted layered wings on the bird
  const wingOutline: OutlinePoint[] = [
    [0, 0],
    [0.028, 0.012],
    [0.058, 0.006],
    [0.072, -0.010, "sharp"],
    [0.052, -0.026],
    [0.020, -0.024],
  ];
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const wJ = birdWingJoints[side];
    b.extrude(wingOutline, {
      bone: wJ,
      at: wJ.at,
      x: [s * 0.22, -0.22, -0.95],
      y: [s * 0.25, 0.94, -0.22],
      thickness: [0.014, 0.005],
      bevel: 0.003,
      smoothing: 2,
      color: birdWingPaint,
      name: `birdWingMesh${side}`,
      group: "bird",
    });
  }

  // Fan of 5 tail feathers on `birdTail`
  for (let i = -2; i <= 2; i++) {
    const spreadX = i * 0.011;
    const fStart: V3 = [spreadX * 0.3, 0.754, 0.405];
    const fEnd: V3 = [spreadX, 0.782 - Math.abs(i) * 0.004, 0.352 + Math.abs(i) * 0.005];
    b.capsule(fStart, fEnd, [0.007, 0.009], i % 2 === 0 ? BIRD_WING : BIRD_YELLOW, {
      bone: birdTail,
      name: `birdTailFeather${i + 3}`,
      group: "bird",
    });
  }

  // Tiny orange bird legs & 3 toes gripping the top of the yuzu
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const legJ = birdLegJoints[side];
    const anklePt: V3 = [s * 0.022, 0.720, 0.458];
    b.capsule(legJ.at, anklePt, 0.0045, BIRD_BEAK, {
      bone: legJ,
      name: `birdShank${side}`,
      group: "bird",
    });
    for (let t = -1; t <= 1; t++) {
      const toeEnd: V3 = [
        anklePt[0] + t * 0.008 + s * 0.003,
        0.713,
        anklePt[2] + 0.018 - Math.abs(t) * 0.004,
      ];
      b.capsule(anklePt, toeEnd, [0.0035, 0.0022], BIRD_BEAK, {
        bone: legJ,
        name: `birdToe${side}${t + 2}`,
        group: "bird",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 9. Rich Bristly Fur Cards & Feather Cards (Surface Detail Pass)
  // ---------------------------------------------------------------------------
  // Capybara coat tuft cards scattered over back, flanks, and cheeks
  const bodyFurHits = bodySurf.scatter(140, {
    rng: rng(101),
    minDist: 0.042,
    filter: (h) => h.n.y > -0.15 && h.at.y > 0.22,
  });
  b.cards(bodyFurHits, furTuftTex, {
    size: [0.032, 0.052],
    lean: 68,
    bend: 22,
    vary: 0.28,
    spin: 18,
    rng: rng(102),
    flow: [0, -0.25, -1],
    color: bodyCoat,
    name: "bodyFurCards",
    group: "torso",
  });

  // Scruffy cheek and neck-crest fur cards for that signature coarse capybara fluff
  const headFurHits = headSurf.scatter(48, {
    rng: rng(202),
    minDist: 0.032,
    filter: (h) => h.at.z < 0.56 && h.n.y > -0.25,
  });
  b.cards(headFurHits, furTuftTex, {
    size: [0.024, 0.038],
    lean: 64,
    bend: 18,
    vary: 0.25,
    spin: 15,
    rng: rng(203),
    flow: [0, -0.2, -1],
    color: headCoat,
    name: "headFurCards",
    group: "head",
  });

  // Soft downy feather cards on the bird's back & flanks
  const birdFlankFrames = [
    frame([0.038, 0.768, 0.445], [0.85, 0.35, -0.35]),
    frame([-0.038, 0.768, 0.445], [-0.85, 0.35, -0.35]),
    frame([0.026, 0.778, 0.430], [0.55, 0.75, -0.35]),
    frame([-0.026, 0.778, 0.430], [-0.55, 0.75, -0.35]),
    frame([0, 0.772, 0.418], [0, 0.85, -0.5]),
  ];
  b.cards(birdFlankFrames, birdFeatherTex, {
    size: [0.018, 0.028],
    lean: 65,
    bend: 15,
    flow: [0, -0.15, -1],
    bone: birdBody,
    name: "birdDownCards",
    group: "bird",
  });

  // Gentle rest-pose adjustments so the capybara & bird feel alive and serene
  b.pose(earJoints.L, { axis: [0, 0, 1], deg: -6 });
  b.pose(earJoints.R, { axis: [0, 0, 1], deg: 6 });
  b.pose(birdHead, { axis: [0, 1, 0], deg: 8 });

  return b.root;
}
