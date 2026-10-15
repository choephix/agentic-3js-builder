Here is the breakdown of improvements made to elevate the model:

1. **Vulpine Head & Face Sculpture**: Replaced the abrupt sphere-and-box head with a continuous, beautifully sculpted loft that flows seamlessly from cranium to snout. Re-aligned the anime eye decals to sit cleanly on the 3/4 cheek planes without distortion or clipping.
2. **Alert Anime Fox Ears**: Completely redesigned the ears to stand tall, proud, and forward-angled with crisp geometric extrusions, crimson tips, soft inner linings, and fluffy ear tufts, eliminating the backward-facing dark stubs.
3. **Sacred Celestial Inari Scroll (Makimono)**: The kitsune now proudly holds a sacred vermilion-and-gold scroll tied with red cords in its jaws—an iconic element of Inari folklore that gives purpose and dignity to the mouth.
4. **Volumetric 3D Tail Fan**: Reworked the 9 tails from a flat vertical wall into dynamic, billowing 3D S-curves with varied heights and depths. Outer tails sweep forward around the flanks while inner plumes billow high and curl at the tips, creating a luscious silhouette from every angle.
5. **Anime Vermilion Paw Socks & Leg Rings**: Added graphic crimson anime stockings with golden border rings to all four digitigrade legs, creating striking contrast against the celestial white coat.
6. **Heroic Torii Gate Framing**: Raised the torii gate's height to 1.86 m and widened its pillars, so it towers majestically over the tails and frames the entire creature like a shrine gate portal.
7. **Refined Kitsune-bi & Scenery**: Crafted luminous multi-layered spirit flames with glowing cores, flame spindles, and orbiting embers, along with a sacred sake offering set and scattered autumn leaves on the mossy stone dais.

```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  aim,
  lerp,
  mid,
  offset,
  rng,
  arc,
  bezier,
  catmull,
  polyline,
  spiral,
  limb,
  paint,
  countershade,
  gradient,
  mottle,
  mix,
  smoothstep,
  noise,
  rgb,
  svg,
} from "agentic-3js-builder";
import { animeEye, cel, furEdge, INK, shadowOf, zigzag } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description:
    "A celestial nine-tailed fox standing proudly upon a sacred mossy stone shrine dais, framed by a vermilion torii gate, glowing stone toro lanterns, swirling kitsune-bi spirit flames, and sacred ofuda talismans.",
};

// ---------------------------------------------------------------------------------------------------------------
// Textures & SVG artwork
// ---------------------------------------------------------------------------------------------------------------

/** Big, sparkling high-fantasy anime fox eye with ruby/amber iris and winged eyeliner. */
const EYE_TEXTURE = animeEye({
  iris: "#ff7a00",
  irisLight: "#ffe853",
  irisDark: "#780b06",
  ink: "#230b3b",
  blush: "#ff5078",
  brow: true,
  size: 512,
});

/** Sacred vermilion kitsune forehead crest (flame jewel / Inari divine rune). */
const KITSUNE_MARK = svg(
  `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 4 C42 26 18 50 18 74 C18 96 32 112 50 112 C68 112 82 96 82 74 C82 50 58 26 50 4 Z" fill="#e82436"/>
    <path d="M50 22 C44 38 32 56 32 74 C32 88 40 98 50 98 C60 98 68 88 68 74 C68 56 56 38 50 22 Z" fill="#ffd13b"/>
    <circle cx="50" cy="74" r="8" fill="#ffffff"/>
    <path d="M26 62 Q12 70 8 84 Q18 82 28 72 Z" fill="#e82436"/>
    <path d="M74 62 Q88 70 92 84 Q82 82 72 72 Z" fill="#e82436"/>
    <circle cx="50" cy="110" r="3.5" fill="#ffd13b"/>
  </svg>`,
  { size: 256 },
);

/** Sacred paper talisman (Ofuda) with crimson stamps and black calligraphy runes. */
const OFUDA_TEXTURE = svg(
  `<svg viewBox="0 0 60 140" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="56" height="136" rx="3" fill="#faf4e6" stroke="#af8b54" stroke-width="2"/>
    <rect x="6" y="6" width="48" height="128" fill="none" stroke="#d63031" stroke-width="1.5" stroke-dasharray="4 2"/>
    <rect x="18" y="14" width="24" height="24" rx="2" fill="#d63031"/>
    <circle cx="30" cy="26" r="8" fill="none" stroke="#faf4e6" stroke-width="2"/>
    <path d="M30 44 L30 58 M22 50 L38 50" stroke="#1f1424" stroke-width="3" stroke-linecap="round"/>
    <path d="M24 64 L36 64 M30 64 L30 82 M22 74 L38 74" stroke="#1f1424" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M22 88 Q30 92 38 88 Q30 104 26 114 Q32 110 38 116" fill="none" stroke="#1f1424" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="30" cy="126" r="5" fill="#d63031"/>
  </svg>`,
  { size: 256 },
);

/** Ethereal anime spirit flame card (Kitsune-bi) with brilliant core and outer aura. */
const SPIRIT_FLAME_TEXTURE = svg(
  `<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="cg" cx="50%" cy="65%" r="50%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="35%" stop-color="#55ffff"/>
        <stop offset="70%" stop-color="#0984e3"/>
        <stop offset="100%" stop-color="#6c5ce7" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="eg" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#00cec9"/>
        <stop offset="65%" stop-color="#e84393"/>
        <stop offset="100%" stop-color="#fd79a8"/>
      </linearGradient>
    </defs>
    <path d="M50 4 C34 30 14 65 14 95 C14 122 30 136 50 136 C70 136 86 122 86 95 C86 65 66 30 50 4 Z" fill="url(#eg)" opacity="0.9"/>
    <path d="M50 16 C38 40 24 70 24 95 C24 116 36 128 50 128 C64 128 76 116 76 95 C76 70 62 40 50 16 Z" fill="url(#cg)"/>
    <ellipse cx="50" cy="95" rx="14" ry="20" fill="#ffffff" opacity="0.95"/>
    <path d="M50 18 Q62 38 56 62 Q48 48 50 18 Z" fill="#ffffff"/>
  </svg>`,
  { size: 256 },
);

/** Zig-zag folded sacred shrine paper streamer (Shide). */
const SHIDE_TEXTURE = svg(
  `<svg viewBox="0 0 60 120" xmlns="http://www.w3.org/2000/svg">
    <polygon points="10,0 50,0 50,30 30,30 30,60 50,60 50,90 20,90 20,120 10,120 10,75 30,75 30,45 10,45" fill="#fcfcfc" stroke="#cfd6e8" stroke-width="2"/>
    <path d="M50,0 L50,30 L30,30 L30,60 L50,60 L50,90" fill="none" stroke="#e82436" stroke-width="2.5"/>
  </svg>`,
  { size: 256 },
);

/** Stone lantern window screen with warm washi paper and wooden lattice. */
const LANTERN_WINDOW_TEXTURE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="100" height="100" fill="#fff3b8"/>
    <circle cx="50" cy="50" r="34" fill="#ffd566" opacity="0.85"/>
    <path d="M50 20 C42 35 32 50 32 65 C32 78 40 85 50 85 C60 85 68 78 68 65 C68 50 58 35 50 20 Z" fill="#ff7f1a" opacity="0.75"/>
    <rect x="0" y="0" width="100" height="100" fill="none" stroke="#2d1a10" stroke-width="8"/>
    <line x1="50" y1="0" x2="50" y2="100" stroke="#2d1a10" stroke-width="6"/>
    <line x1="0" y1="50" x2="100" y2="50" stroke="#2d1a10" stroke-width="6"/>
    <line x1="25" y1="0" x2="25" y2="100" stroke="#2d1a10" stroke-width="4"/>
    <line x1="75" y1="0" x2="75" y2="100" stroke="#2d1a10" stroke-width="4"/>
    <line x1="0" y1="25" x2="100" y2="25" stroke="#2d1a10" stroke-width="4"/>
    <line x1="0" y1="75" x2="100" y2="75" stroke="#2d1a10" stroke-width="4"/>
  </svg>`,
  { size: 256 },
);

/** Stylized autumn maple leaf for the shrine ground scatter. */
const MAPLE_LEAF_TEXTURE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 6 L53 32 L68 18 L64 38 L84 28 L74 48 L96 52 L76 64 L86 78 L65 72 L60 92 L50 78 L40 92 L35 72 L14 78 L24 64 L4 52 L26 48 L16 28 L36 38 L32 18 L47 32 Z" fill="#e83424"/>
    <path d="M50 16 L52 35 L64 24 L60 40 L76 33 L68 49 L85 52 L69 62 L77 72 L60 67 L56 82 L50 72 L44 82 L40 67 L23 72 L31 62 L15 52 L32 49 L24 33 L40 40 L36 24 L48 35 Z" fill="#ff7014"/>
    <line x1="50" y1="6" x2="50" y2="94" stroke="#8a1208" stroke-width="2.5"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
// Cel Paints & Color Palette
// ---------------------------------------------------------------------------------------------------------------

const FUR_WHITE = cel("#ffffff", "#d5dfed");
const CRIMSON = cel("#e82436", "#8a101d");
const GOLD_METAL = cel("#ffd13b", "#b28518");
const ROPE_STRAW = cel("#edd7a2", "#9e844c");
const DARK_PLUM = cel("#281432", "#15081c");
const LACQUER_RED = cel("#c62220", "#76100e");
const STONE_BASE = mottle("#6c7380", "#484f5c", { size: 0.18 });
const MOSS_STONE = mottle("#647462", "#3a4a35", { size: 0.14 });
const SPIRIT_CYAN = "#45f4ff";
const SPIRIT_MAGENTA = "#ff4da6";

// ---------------------------------------------------------------------------------------------------------------
// Main Builder Function
// ---------------------------------------------------------------------------------------------------------------

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "kitsune", detail: 1 });
  const seeded = rng(888);

  // -------------------------------------------------------------------------------------------------------------
  // 1. SKELETON: Core Spine, Neck, Head & Jaw
  // -------------------------------------------------------------------------------------------------------------

  const pawFloorY = 0.055; // Paws firmly seated on upper stone terrace

  // Hips root at y = 0.50m
  const hips = b.joint("hips", { at: [0, 0.5, -0.06], role: "spine" });
  const spine = b.joint("spine", { parent: hips, at: [0, 0.54, 0.12], role: "spine" });
  const chest = b.joint("chest", { parent: spine, at: [0, 0.58, 0.32], role: "spine" });

  // Sleek, proud neck curving forward and upward
  const neckChain = b.chain("neck", catmull([[0, 0.58, 0.35], [0, 0.69, 0.44], [0, 0.79, 0.52]]), {
    parent: chest,
    count: 2,
    role: "neck",
    names: ["neck1", "neck2"],
  });

  // Alert, forward-facing fox head (facing +Z with slight dignified tilt)
  const head = b.joint("head", {
    parent: neckChain.joints[1],
    at: [0, 0.81, 0.55],
    dir: [0, 0.06, 0.998],
    up: [0, 1, 0],
    role: "head",
  });

  // Articulated lower jaw
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.02, up: -0.038 }),
    aim: head.local({ forward: 0.15, up: -0.045 }),
    role: "jaw",
  });

  // -------------------------------------------------------------------------------------------------------------
  // 2. SKELETON: Vulpine Digitigrade Limbs (IK Chains)
  // -------------------------------------------------------------------------------------------------------------

  const legChains: Record<string, any> = {};

  for (const side of ["L", "R"] as const) {
    const s = side === "L" ? 1 : -1;

    // Hind Leg IK
    const hipPos: [number, number, number] = [s * 0.13, 0.48, -0.08];
    const hindFootTarget: [number, number, number] = [s * 0.14, pawFloorY, -0.15];
    const hindLengths = [0.21, 0.2, 0.08];
    const hindBends: [number, number, number][] = [
      [0, 0, 1], // knee forward
      [0, 0, -1], // hock back
    ];
    const hindPts = limb(hipPos, hindFootTarget, hindLengths, hindBends);
    legChains["H" + side] = b.chain("legH" + side, hindPts, {
      parent: hips,
      role: "leg",
      names: ["hipH" + side, "kneeH" + side, "hockH" + side, "footH" + side],
      contact: [s * 0.14, pawFloorY, -0.15],
    });

    // Front Leg IK
    const shoulderPos: [number, number, number] = [s * 0.12, 0.56, 0.33];
    const frontPawTarget: [number, number, number] = [s * 0.13, pawFloorY, 0.38];
    const frontLengths = [0.25, 0.23, 0.07];
    const frontBends: [number, number, number][] = [
      [0, 0, -1], // elbow back
      [0, 0, 1], // wrist forward
    ];
    const frontPts = limb(shoulderPos, frontPawTarget, frontLengths, frontBends);
    legChains["F" + side] = b.chain("legF" + side, frontPts, {
      parent: chest,
      role: "leg",
      names: ["shoulder" + side, "elbow" + side, "wrist" + side, "pawF" + side],
      contact: [s * 0.13, pawFloorY, 0.38],
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // 3. SKELETON: The Nine Divine Tails (Volumetric 3D Fan Arc)
  // -------------------------------------------------------------------------------------------------------------

  const tailChains = [];
  for (let i = 0; i < 9; i++) {
    const spread = (4 - i) / 4; // 1 (far left) to -1 (far right), 0 at center
    const phi = spread * 1.15; // horizontal fanning
    const sinP = Math.sin(phi);
    const cosP = Math.cos(phi);
    const lat = Math.abs(spread); // 0 at center, 1 at flanks

    // Varied 3D heights and depths: center tail arches high; flank tails sweep forward around sides!
    const p0 = new THREE.Vector3(sinP * 0.06, 0.49, -0.14);
    const p1 = new THREE.Vector3(sinP * 0.28, 0.68 + (1 - lat) * 0.14, -0.26 - (1 - lat) * 0.15);
    const p2 = new THREE.Vector3(sinP * 0.54, 0.95 + (1 - lat) * 0.28, -0.22 - (1 - lat) * 0.24 + lat * 0.12);
    const p3 = new THREE.Vector3(sinP * 0.64, 1.18 + (1 - lat) * 0.32, -0.12 - (1 - lat) * 0.22 + lat * 0.24);
    const p4 = new THREE.Vector3(sinP * 0.52, 1.34 + (1 - lat) * 0.26, 0.02 - (1 - lat) * 0.16 + lat * 0.32);

    const tailPath = catmull([p0, p1, p2, p3, p4]);
    const tc = b.chain(`tail${i + 1}`, tailPath, {
      parent: hips,
      count: 4,
      role: "tail",
    });
    tailChains.push(tc);
  }

  // -------------------------------------------------------------------------------------------------------------
  // 4. GEOMETRY: Torso, Neck & Plush Chest Fluff
  // -------------------------------------------------------------------------------------------------------------

  // Sleek vulpine torso loft
  b.loft(
    [
      { at: [0, 0.48, -0.15], w: 0.21, h: 0.2 }, // Rump
      { at: [0, 0.5, -0.05], w: 0.23, h: 0.22 }, // Pelvis
      { at: [0, 0.53, 0.12], w: 0.18, h: 0.19 }, // Waist tuck
      { at: [0, 0.57, 0.28], w: 0.25, h: 0.27 }, // Ribcage
      { at: [0, 0.58, 0.35], w: 0.21, h: 0.22 }, // Throat base
    ],
    { bone: [hips, spine, chest], color: FUR_WHITE, name: "torso" },
  );

  // Smooth-swept neck
  b.sweep(neckChain, (t) => 0.095 * (1 - 0.22 * t), {
    color: FUR_WHITE,
    bone: [chest, neckChain.joints[0], neckChain.joints[1]],
    name: "neckSweep",
  });

  // Grand anime chest mane / bib extending forward
  const bibPath = catmull([
    [0, 0.62, 0.41],
    [0, 0.54, 0.47],
    [0, 0.43, 0.42],
    [0, 0.34, 0.31],
  ]);
  b.sweep(bibPath, (t) => 0.09 * (1 - t * 0.72), {
    color: FUR_WHITE,
    bone: chest,
    name: "chestBib",
  });

  // Layered chest spikes (sharp anime fur tufts on flanks of the bib)
  for (const s of [1, -1]) {
    b.spike([s * 0.065, 0.53, 0.43], [s * 0.7, 0.15, 0.7], 0.09, 0.03, { color: FUR_WHITE, bone: chest });
    b.spike([s * 0.08, 0.46, 0.4], [s * 0.8, -0.1, 0.6], 0.08, 0.026, { color: FUR_WHITE, bone: chest });
    b.spike([s * 0.06, 0.38, 0.34], [s * 0.6, -0.35, 0.5], 0.07, 0.022, { color: FUR_WHITE, bone: chest });
  }

  // -------------------------------------------------------------------------------------------------------------
  // 5. GEOMETRY: Sculpted Vulpine Head, Snout, Muzzle & Sacred Markings
  // -------------------------------------------------------------------------------------------------------------

  // Seamless sculpted head loft: cranium, brow, sleek muzzle, and tapered snout tip
  const headLoft = b.loft(
    [
      { at: head.local({ forward: -0.05, up: 0.025 }), w: 0.14, h: 0.13 }, // Occiput
      { at: head.local({ forward: 0.02, up: 0.02 }), w: 0.15, h: 0.125 }, // Brow / Skull center
      { at: head.local({ forward: 0.08, up: 0.01 }), w: 0.1, h: 0.09 }, // Muzzle base
      { at: head.local({ forward: 0.14, up: -0.005 }), w: 0.055, h: 0.05 }, // Mid snout
      { at: head.local({ forward: 0.185, up: -0.015 }), w: 0.026, h: 0.022 }, // Snout tip
    ],
    { bone: head, color: FUR_WHITE, name: "headLoft" },
  );

  // Black button fox nose
  b.part(new THREE.ConeGeometry(0.012, 0.018, 6), DARK_PLUM, {
    bone: head,
    at: head.local({ forward: 0.188, up: -0.01 }),
    dir: head.dir([0, 0.3, 0.95]),
    name: "nose",
  });

  // Lower jaw
  b.frustumBox(
    jaw.local({ forward: 0.02, up: -0.005 }),
    jaw.local({ forward: 0.14, up: -0.008 }),
    [0.065, 0.026],
    [0.022, 0.015],
    { bone: jaw, color: FUR_WHITE, name: "lowerJaw" },
  );

  // Tiny sharp upper fangs
  for (const s of [1, -1]) {
    b.spike(head.local({ forward: 0.142, up: -0.024, left: s * 0.022 }), head.dir([0, -1, 0.1]), 0.018, 0.0045, {
      color: "#ffffff",
      bone: head,
    });
  }

  // Cheek fur tufts (3 layered, sharp anime blades jutting back and outward)
  for (const s of [1, -1]) {
    // Upper cheek blade
    b.spike(
      head.local({ forward: 0.03, up: 0.015, left: s * 0.068 }),
      head.dir([s * 0.85, 0.1, -0.5]),
      0.11,
      0.026,
      { color: FUR_WHITE, bone: head, name: `cheekTuftTop${s > 0 ? "L" : "R"}` },
    );
    // Mid cheek blade (longest)
    b.spike(
      head.local({ forward: 0.01, up: -0.01, left: s * 0.076 }),
      head.dir([s * 0.9, -0.1, -0.4]),
      0.14,
      0.03,
      { color: FUR_WHITE, bone: head, name: `cheekTuftMid${s > 0 ? "L" : "R"}` },
    );
    // Lower cheek blade
    b.spike(
      head.local({ forward: -0.01, up: -0.035, left: s * 0.066 }),
      head.dir([s * 0.75, -0.3, -0.5]),
      0.1,
      0.022,
      { color: FUR_WHITE, bone: head, name: `cheekTuftBot${s > 0 ? "L" : "R"}` },
    );

    // Whiskers sweeping gracefully back
    b.sweep(
      catmull([
        head.local({ forward: 0.13, up: -0.005, left: s * 0.032 }),
        head.local({ forward: 0.13, up: 0.005, left: s * 0.1 }),
        head.local({ forward: 0.09, up: 0.015, left: s * 0.16 }),
      ]),
      0.0015,
      { color: DARK_PLUM, bone: head },
    );
  }

  // Sacred Kitsune Forehead Mark
  b.decal(headLoft, KITSUNE_MARK, {
    at: head.local({ forward: 0.065, up: 0.062 }),
    dir: head.dir([0, 0.65, 0.76]),
    size: [0.06, 0.072],
    bone: head,
    name: "foreheadMark",
  });

  // Anime Eyes seated cleanly on the cheek planes
  for (const s of [1, -1]) {
    b.decal(headLoft, EYE_TEXTURE, {
      at: head.local({ forward: 0.068, up: 0.026, left: s * 0.052 }),
      dir: head.dir([s * 0.6, 0.1, 0.79]),
      size: [0.048, 0.064],
      mirror: s > 0, // Left eye mirrored for outer lash flicks
      bone: head,
      name: `eye${s > 0 ? "L" : "R"}`,
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // 6. GEOMETRY: Proud Fox Ears with Crimson Tips & Inner Fluff
  // -------------------------------------------------------------------------------------------------------------

  for (const s of [1, -1]) {
    // Outer white ear shell (standing tall and alert, pointing +Y and slightly +X & -Z)
    b.extrude(
      [
        [0, 0],
        [0.065, 0],
        [0.05, 0.14, "sharp"],
        [0.015, 0.18, "sharp"], // Crisp ear tip
        [-0.018, 0.08],
        [-0.01, 0],
      ],
      {
        at: head.local({ forward: -0.01, up: 0.065, left: s * 0.045 }),
        x: head.dir([s * 0.78, 0.18, 0.58]),
        y: head.dir([s * 0.18, 0.96, -0.22]),
        thickness: 0.014,
        bevel: 0.0025,
        color: FUR_WHITE,
        bone: head,
        name: `earShell${s > 0 ? "L" : "R"}`,
      },
    );

    // Crimson ear tip cap
    b.extrude(
      [
        [0.025, 0.12],
        [0.05, 0.14, "sharp"],
        [0.015, 0.18, "sharp"],
        [-0.008, 0.13],
      ],
      {
        at: head.local({ forward: -0.01, up: 0.065, left: s * 0.045 }),
        x: head.dir([s * 0.78, 0.18, 0.58]),
        y: head.dir([s * 0.18, 0.96, -0.22]),
        thickness: 0.015,
        bevel: 0.002,
        color: CRIMSON,
        bone: head,
        name: `earCrimson${s > 0 ? "L" : "R"}`,
      },
    );

    // Soft dark inner ear lining
    b.extrude(
      [
        [0.01, 0.01],
        [0.052, 0.01],
        [0.038, 0.12],
        [0.015, 0.14, "sharp"],
        [-0.005, 0.07],
      ],
      {
        at: head.local({ forward: -0.008, up: 0.068, left: s * 0.045 }),
        x: head.dir([s * 0.78, 0.18, 0.58]),
        y: head.dir([s * 0.18, 0.96, -0.22]),
        thickness: 0.011,
        color: DARK_PLUM,
        bone: head,
        name: `earInner${s > 0 ? "L" : "R"}`,
      },
    );

    // Inner ear white hair tufts
    b.spike(head.local({ forward: 0.005, up: 0.082, left: s * 0.04 }), head.dir([s * 0.4, 0.75, 0.5]), 0.07, 0.015, {
      color: FUR_WHITE,
      bone: head,
    });
    b.spike(head.local({ forward: 0.002, up: 0.092, left: s * 0.048 }), head.dir([s * 0.5, 0.8, 0.35]), 0.08, 0.016, {
      color: FUR_WHITE,
      bone: head,
    });
  }

  // Left ear ceremonial red silk cord and golden bell ornament
  b.sweep(
    arc(
      head.local({ forward: -0.01, up: 0.065, left: 0.048 }),
      head.local({ forward: -0.01, up: 0.065, left: 0.035 }),
      head.dir([0.78, 0.18, 0.58]),
      360,
    ),
    0.0035,
    { color: CRIMSON, bone: head },
  );
  b.part(new THREE.SphereGeometry(0.011, 8, 6), GOLD_METAL, {
    bone: head,
    at: head.local({ forward: -0.005, up: 0.052, left: 0.076 }),
    name: "earGoldBell",
  });
  b.rod(
    head.local({ forward: -0.005, up: 0.052, left: 0.076 }),
    head.local({ forward: -0.01, up: 0.02, left: 0.084 }),
    0.0025,
    CRIMSON,
    { bone: head },
  );

  // -------------------------------------------------------------------------------------------------------------
  // 7. SACRED INARI SCROLL (Makimono held gracefully in jaws)
  // -------------------------------------------------------------------------------------------------------------

  // Golden scroll rod core
  b.rod(
    jaw.local({ forward: 0.125, up: 0.005, left: -0.11 }),
    jaw.local({ forward: 0.125, up: 0.005, left: 0.11 }),
    0.006,
    GOLD_METAL,
    { bone: jaw, name: "scrollRod" },
  );

  // Red lacquered scroll paper cylinder
  b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.17, 14), LACQUER_RED, {
    bone: jaw,
    at: jaw.local({ forward: 0.125, up: 0.005 }),
    dir: jaw.dir([1, 0, 0]),
    name: "scrollBody",
  });

  // White parchment paper wrapping
  b.part(new THREE.CylinderGeometry(0.0175, 0.0175, 0.09, 14), "#faf4e6", {
    bone: jaw,
    at: jaw.local({ forward: 0.125, up: 0.005 }),
    dir: jaw.dir([1, 0, 0]),
    name: "scrollPaper",
  });

  // Golden ornamental scroll end-caps
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.012, 12), GOLD_METAL, {
      bone: jaw,
      at: jaw.local({ forward: 0.125, up: 0.005, left: s * 0.088 }),
      dir: jaw.dir([1, 0, 0]),
      name: `scrollCap${s > 0 ? "L" : "R"}`,
    });
  }

  // Trailing red silk cord tied around scroll
  b.sweep(
    catmull([
      jaw.local({ forward: 0.11, up: 0.005, left: 0.02 }),
      jaw.local({ forward: 0.08, up: -0.05, left: 0.035 }),
      jaw.local({ forward: 0.05, up: -0.11, left: 0.045 }),
    ]),
    0.003,
    { color: CRIMSON, bone: jaw, name: "scrollRibbonL" },
  );
  b.sweep(
    catmull([
      jaw.local({ forward: 0.11, up: 0.005, left: -0.02 }),
      jaw.local({ forward: 0.08, up: -0.05, left: -0.035 }),
      jaw.local({ forward: 0.05, up: -0.11, left: -0.045 }),
    ]),
    0.003,
    { color: CRIMSON, bone: jaw, name: "scrollRibbonR" },
  );

  // -------------------------------------------------------------------------------------------------------------
  // 8. GEOMETRY: Sacred Shimenawa Necklace, Shide & Magatama
  // -------------------------------------------------------------------------------------------------------------

  // Thick sacred braided straw rope around the neck
  const shimenawaLoop = catmull(
    [
      [0, 0.61, 0.51],
      [0.12, 0.63, 0.44],
      [0.08, 0.68, 0.34],
      [0, 0.69, 0.31],
      [-0.08, 0.68, 0.34],
      [-0.12, 0.63, 0.44],
    ],
    { closed: true },
  );
  b.sweep(shimenawaLoop, 0.022, { color: ROPE_STRAW, bone: chest, name: "shimenawaRope" });

  // Gold cord binding rings on the rope
  b.along(shimenawaLoop, 6, (at) => {
    b.part(new THREE.TorusGeometry(0.026, 0.004, 6, 12), GOLD_METAL, { at, bone: chest });
  });

  // Hanging sacred Shide paper streamers (hanging DOWN with lean: 180)
  const shideFrames = [
    frame([-0.07, 0.61, 0.49], [0, 1, 0]),
    frame([0.0, 0.6, 0.51], [0, 1, 0]),
    frame([0.07, 0.61, 0.49], [0, 1, 0]),
  ];
  b.cards(shideFrames, SHIDE_TEXTURE, {
    size: [0.065, 0.13],
    lean: 180, // Hangs gracefully down
    flow: [0, 0, 1],
    color: "#ffffff",
    bone: chest,
  });

  // Central golden Magatama (comma-shaped sacred jewel) amulet
  const magatamaOutline: [number, number, ("sharp" | undefined)?][] = [
    [0, 0],
    [0.016, -0.012],
    [0.026, 0.008],
    [0.022, 0.036, "sharp"],
    [0.006, 0.046],
    [-0.014, 0.036],
    [-0.024, 0.008],
    [-0.014, -0.022, "sharp"],
    [-0.004, -0.044, "sharp"],
  ];
  const magatamaJewel = b.extrude(magatamaOutline, {
    at: [0, 0.53, 0.52],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.002,
    color: "#ffd13b",
    bone: chest,
    name: "magatamaJewel",
  });
  glow(magatamaJewel, 1.5);

  // -------------------------------------------------------------------------------------------------------------
  // 9. GEOMETRY: Seamless Digitigrade Legs, Crimson Anime Socks & Fox Paws
  // -------------------------------------------------------------------------------------------------------------

  for (const side of ["L", "R"] as const) {
    const s = side === "L" ? 1 : -1;

    // Smooth-skinned hind leg with stylish crimson socks
    b.sweep(
      legChains["H" + side],
      (t) => 0.066 * (1 - 0.58 * t),
      {
        bands: [
          [0.72, FUR_WHITE],
          [1.0, CRIMSON],
        ],
        skin: "smooth",
        name: "legHSweep" + side,
      },
    );

    // Smooth-skinned front leg with stylish crimson socks
    b.sweep(
      legChains["F" + side],
      (t) => 0.056 * (1 - 0.54 * t),
      {
        bands: [
          [0.68, FUR_WHITE],
          [1.0, CRIMSON],
        ],
        skin: "smooth",
        name: "legFSweep" + side,
      },
    );

    // Golden ring above the crimson paw socks
    const wristJoint = b.root.getObjectByName("wrist" + side)!;
    b.part(new THREE.TorusGeometry(0.034, 0.004, 6, 12), GOLD_METAL, {
      bone: wristJoint,
      at: [s * 0.13, 0.165, 0.38],
      name: "goldLegRingF" + side,
    });

    const hockJoint = b.root.getObjectByName("hockH" + side)!;
    b.part(new THREE.TorusGeometry(0.038, 0.004, 6, 12), GOLD_METAL, {
      bone: hockJoint,
      at: [s * 0.14, 0.17, -0.15],
      name: "goldLegRingH" + side,
    });

    // Spiky anime carpal tuft jutting back from the wrist
    b.spike([s * 0.13, 0.15, 0.33], [0, -0.3, -0.8], 0.055, 0.018, {
      color: FUR_WHITE,
      bone: wristJoint,
    });

    // Paws (Front and Hind) planted on the upper stone dais
    const footHJoint = b.root.getObjectByName("footH" + side)!;
    const paws = [
      { at: [s * 0.13, pawFloorY, 0.38], bone: wristJoint, name: "pawF" + side },
      { at: [s * 0.14, pawFloorY, -0.15], bone: footHJoint, name: "pawH" + side },
    ];

    for (const p of paws) {
      const pawPad = new THREE.SphereGeometry(0.036, 8, 6);
      pawPad.scale(1, 0.55, 1.25);
      b.part(pawPad, CRIMSON, {
        bone: p.bone,
        at: [p.at[0], p.at[1] + 0.018, p.at[2]],
        name: p.name,
      });

      // 4 rounded little toes with golden divine claws
      for (let t = 0; t < 4; t++) {
        const toeAngle = -0.45 + (t / 3) * 0.9;
        const tx = p.at[0] + Math.sin(toeAngle) * 0.028;
        const tz = p.at[2] + Math.cos(toeAngle) * 0.042;
        b.part(new THREE.SphereGeometry(0.013, 6, 4), CRIMSON, {
          bone: p.bone,
          at: [tx, p.at[1] + 0.012, tz],
        });
        b.spike([tx, p.at[1] + 0.01, tz + 0.008], [Math.sin(toeAngle) * 0.3, -0.2, 0.9], 0.014, 0.0035, {
          color: GOLD_METAL,
          bone: p.bone,
        });
      }
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // 10. GEOMETRY: Swept Cloud-Plume Tails with Tri-Tone Flame Bands & Spiky Tufts
  // -------------------------------------------------------------------------------------------------------------

  tailChains.forEach((tc, idx) => {
    // Billowing fox tail: starts sleek (0.038m), swells into a huge cloud (0.125m), tapers to pointed tip
    b.sweep(
      tc,
      (t) => (0.038 + 0.088 * Math.sin(t * Math.PI)) * (1 - 0.72 * t * t),
      {
        bone: [tc.joints[0], tc.joints[1], tc.joints[2], tc.joints[3]],
        bands: [
          [0.65, FUR_WHITE], // Pearl white body and billowing plume
          [0.85, CRIMSON], // Sacred celestial vermilion transition
          [1.0, GOLD_METAL], // Radiant gold flame tip
        ],
        caps: { start: "flat", end: "point" },
        name: `tailSweep${idx + 1}`,
      },
    );

    // Spiky anime fur blades along the tail curves
    const midPoint = tc.at(0.56);
    b.spike(midPoint.at, midPoint.normal, 0.09, 0.026, {
      color: FUR_WHITE,
      bone: midPoint.bone,
    });

    const crimsonPoint = tc.at(0.78);
    b.spike(crimsonPoint.at, crimsonPoint.normal, 0.078, 0.022, {
      color: CRIMSON,
      bone: crimsonPoint.bone,
    });
  });

  // -------------------------------------------------------------------------------------------------------------
  // 11. GEOMETRY: Kitsune-bi Spirit Flames & Celestial Hoshinotama Star Pearl
  // -------------------------------------------------------------------------------------------------------------

  // Central floating Hoshinotama (sacred star pearl holding the kitsune's soul power)
  const starBallPos: [number, number, number] = [0, 0.68, 0.68];
  const starBall = b.part(new THREE.SphereGeometry(0.046, 14, 12), "#ffffff", {
    at: starBallPos,
    bone: chest,
    name: "hoshinotama",
  });
  glow(starBall, 2.6);

  // Concentric gyroscopic celestial rings spinning around the star ball
  const ringA = b.part(new THREE.TorusGeometry(0.065, 0.004, 6, 24), "#ffd13b", {
    at: starBallPos,
    dir: [0, 1, 0],
    axis: "z",
    bone: chest,
    name: "hoshinotamaRingA",
  });
  glow(ringA, 1.6);

  const ringB = b.part(new THREE.TorusGeometry(0.076, 0.0035, 6, 24), SPIRIT_CYAN, {
    at: starBallPos,
    dir: [0.8, 0.5, 0.3],
    axis: "z",
    bone: chest,
    name: "hoshinotamaRingB",
  });
  glow(ringB, 2.0);

  // 7 Hovering Kitsune-bi spirit flame wisps
  const spiritFlamesData: [number, number, number][] = [
    [0.34, 0.94, 0.28], // Above left shoulder
    [-0.34, 0.94, 0.28], // Above right shoulder
    [0.0, 1.48, -0.32], // Floating above central tail crest
    [0.66, 1.15, -0.28], // Floating off left tail plume
    [-0.66, 1.15, -0.28], // Floating off right tail plume
    [0.46, 0.56, 0.12], // Floating low by left flank
    [-0.46, 0.56, 0.12], // Floating low by right flank
  ];

  spiritFlamesData.forEach((fpos, i) => {
    // Radiant core sphere
    const core = b.part(new THREE.IcosahedronGeometry(0.034, 1), SPIRIT_CYAN, {
      at: fpos,
      bone: hips,
      name: `flameCore${i + 1}`,
    });
    glow(core, 2.6);

    // Ethereal flame card cross (facing UP with lean: 0 so it stands upright)
    const flameCards = b.cards([frame(fpos, [0, 1, 0])], SPIRIT_FLAME_TEXTURE, {
      size: [0.11, 0.15],
      cross: true,
      lean: 0,
      flow: [0, 0, 1],
      color: "#ffffff",
      bone: hips,
    });
    glow(flameCards, 1.8);

    // Swirling spiral wisp trailing around the core
    const wispPath = spiral(fpos, offset(fpos, [0.05, 0, 0], 0.048), [0, 1, 0], {
      turns: 1.4,
      pitch: 0.035,
    });
    const wisp = b.sweep(wispPath, 0.0032, {
      color: SPIRIT_MAGENTA,
      caps: "point",
      bone: hips,
      name: `flameWisp${i + 1}`,
    });
    glow(wisp, 2.2);

    // Tiny orbiting ember spark
    const spark = b.part(new THREE.SphereGeometry(0.007, 4, 4), "#ffffff", {
      at: [fpos[0] + 0.045, fpos[1] + 0.03, fpos[2] + 0.02],
      bone: hips,
    });
    glow(spark, 3.0);
  });

  // -------------------------------------------------------------------------------------------------------------
  // 12. GEOMETRY: Floating Ofuda Paper Talismans (Fluttering Ward)
  // -------------------------------------------------------------------------------------------------------------

  const ofudaFrames = [
    frame([0.38, 0.82, 0.38], [0, 1, 0], [0.3, 0, 0.95]),
    frame([-0.38, 0.84, 0.36], [0, 1, 0], [-0.3, 0, 0.95]),
    frame([0.52, 1.05, -0.05], [0, 1, 0], [0.4, 0, 0.9]),
    frame([-0.52, 1.02, -0.08], [0, 1, 0], [-0.4, 0, 0.9]),
  ];

  b.cards(ofudaFrames, OFUDA_TEXTURE, {
    size: [0.065, 0.14],
    lean: 15, // Slight natural tilt like fluttering paper in wind
    flow: [0, 0, 1],
    color: "#ffffff",
    bone: hips,
  });

  // -------------------------------------------------------------------------------------------------------------
  // 13. SCENERY: Sacred Stone Shrine Dais, Vermilion Torii Gate & Toro Lanterns
  // -------------------------------------------------------------------------------------------------------------

  // Lower Stone Plinth (firmly touches y = 0, no negative Y!)
  b.part(new THREE.CylinderGeometry(0.96, 0.98, 0.028, 32), STONE_BASE, {
    at: [0, 0.014, 0],
    name: "stonePlinthLower",
  });

  // Upper Terrace Dais (stands from y = 0.028 to 0.055m; top surface at y = 0.055m)
  b.part(new THREE.CylinderGeometry(0.82, 0.84, 0.027, 32), MOSS_STONE, {
    at: [0, 0.0415, 0],
    name: "stoneDaisUpper",
  });

  // Chiseled stone curb step ring
  b.part(new THREE.CylinderGeometry(0.85, 0.85, 0.012, 32), STONE_BASE, {
    at: [0, 0.048, 0],
    name: "stoneStepRing",
  });

  // Sacred Shinto Sake Offering Set (Omiki) at the front left of the shrine dais
  const offeringX = -0.32;
  const offeringZ = 0.58;
  // Small lacquered wooden offering stand (sanbo)
  b.part(new THREE.BoxGeometry(0.12, 0.035, 0.12), DARK_PLUM, {
    at: [offeringX, 0.072, offeringZ],
    name: "sanboStand",
  });
  // Pair of white ceramic sake bottles (heishi) with gold crests
  for (const s of [0.03, -0.03]) {
    b.part(new THREE.CylinderGeometry(0.014, 0.022, 0.06, 12), "#ffffff", {
      at: [offeringX + s, 0.12, offeringZ],
    });
    b.part(new THREE.SphereGeometry(0.014, 8, 6), "#ffffff", {
      at: [offeringX + s, 0.145, offeringZ],
    });
    b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.015, 8), "#ffffff", {
      at: [offeringX + s, 0.16, offeringZ],
    });
    b.part(new THREE.TorusGeometry(0.018, 0.0025, 4, 10), GOLD_METAL, {
      at: [offeringX + s, 0.115, offeringZ],
      dir: [0, 1, 0],
      axis: "z",
    });
  }

  // Two Stone Toro Lanterns (framing the front corners of the shrine dais)
  const lanternPositions: [number, number, number][] = [
    [-0.64, 0.055, 0.35],
    [0.64, 0.055, 0.35],
  ];

  lanternPositions.forEach((lpos, idx) => {
    const lx = lpos[0];
    const lz = lpos[2];

    // Stepped plinth base (kiso)
    b.part(new THREE.CylinderGeometry(0.09, 0.11, 0.04, 8), STONE_BASE, {
      at: [lx, 0.075, lz],
      name: `lanternBase${idx + 1}`,
    });

    // Octagonal pillar (sao)
    b.part(new THREE.CylinderGeometry(0.045, 0.048, 0.22, 8), STONE_BASE, {
      at: [lx, 0.205, lz],
      name: `lanternPillar${idx + 1}`,
    });
    b.part(new THREE.CylinderGeometry(0.056, 0.056, 0.015, 8), STONE_BASE, {
      at: [lx, 0.205, lz],
    });

    // Flared middle tray (chubodai)
    b.part(new THREE.CylinderGeometry(0.125, 0.055, 0.05, 8), STONE_BASE, {
      at: [lx, 0.34, lz],
      name: `lanternTray${idx + 1}`,
    });

    // Glowing washi paper light chamber (hibukuro)
    const lightBox = b.part(new THREE.BoxGeometry(0.13, 0.13, 0.13), "#ffffff", {
      at: [lx, 0.43, lz],
      texture: LANTERN_WINDOW_TEXTURE,
      name: `lanternLight${idx + 1}`,
    });
    glow(lightBox, 2.5);

    // 4 Corner stone pillars on the light chamber
    for (const sx of [0.065, -0.065]) {
      for (const sz of [0.065, -0.065]) {
        b.part(new THREE.BoxGeometry(0.016, 0.13, 0.016), STONE_BASE, {
          at: [lx + sx, 0.43, lz + sz],
        });
      }
    }

    // Pagoda roof (kasa) with flared eaves
    b.part(new THREE.CylinderGeometry(0.05, 0.18, 0.07, 8), STONE_BASE, {
      at: [lx, 0.53, lz],
      name: `lanternRoof${idx + 1}`,
    });

    // Lotus finial and pointed jewel teardrop (hoshu)
    b.part(new THREE.SphereGeometry(0.024, 8, 6), STONE_BASE, {
      at: [lx, 0.58, lz],
    });
    b.spike([lx, 0.59, lz], [0, 1, 0], 0.038, 0.016, {
      color: STONE_BASE,
      name: `lanternFinial${idx + 1}`,
    });
  });

  // -------------------------------------------------------------------------------------------------------------
  // 14. SCENERY: Majestic Vermilion Torii Gate (Framing high behind the tails)
  // -------------------------------------------------------------------------------------------------------------

  const toriiZ = -0.78;
  const toriiColX = [-0.82, 0.82];

  toriiColX.forEach((px, i) => {
    // Black lacquered plinth sleeve (nemaki)
    b.part(new THREE.CylinderGeometry(0.042, 0.048, 0.1, 12), DARK_PLUM, {
      at: [px, 0.105, toriiZ],
    });
    // Tall vermilion cedar pillar (hashira) extending to 1.75m
    b.part(new THREE.CylinderGeometry(0.036, 0.04, 1.62, 12), LACQUER_RED, {
      at: [px, 0.96, toriiZ],
      name: `toriiPillar${i + 1}`,
    });
    // Golden metal cap rings (kanagu)
    b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.024, 12), GOLD_METAL, {
      at: [px, 1.74, toriiZ],
    });
  });

  // Lower straight crossbeam (nuki) at y = 1.45m
  b.frustumBox([-0.96, 1.45, toriiZ], [0.96, 1.45, toriiZ], [0.036, 0.058], [0.036, 0.058], {
    color: LACQUER_RED,
    name: "toriiNuki",
  });

  // Upper curved lintel (kasagi & shimaki) towering at y = 1.82 - 1.88m
  const kasagiPath = catmull([
    [-1.06, 1.88, toriiZ],
    [-0.82, 1.84, toriiZ],
    [0.0, 1.82, toriiZ],
    [0.82, 1.84, toriiZ],
    [1.06, 1.88, toriiZ],
  ]);
  b.sweep(kasagiPath, 0.036, { color: LACQUER_RED, name: "toriiKasagi" });

  // Top black roof cap along kasagi
  const roofCapPath = catmull([
    [-1.08, 1.9, toriiZ],
    [0.0, 1.84, toriiZ],
    [1.08, 1.9, toriiZ],
  ]);
  b.sweep(roofCapPath, 0.018, { color: DARK_PLUM, name: "toriiRoofCap" });

  // Central shrine plaque (gakuzuka)
  b.part(new THREE.BoxGeometry(0.12, 0.18, 0.026), DARK_PLUM, {
    at: [0, 1.62, toriiZ],
    name: "toriiPlaque",
  });
  b.part(new THREE.BoxGeometry(0.09, 0.15, 0.028), GOLD_METAL, {
    at: [0, 1.62, toriiZ],
  });

  // Sacred Shimenawa barrier rope draped across the torii gate nuki beam
  const toriiRope = catmull([
    [-0.82, 1.44, toriiZ + 0.02],
    [-0.42, 1.36, toriiZ + 0.03],
    [0.0, 1.33, toriiZ + 0.03],
    [0.42, 1.36, toriiZ + 0.03],
    [0.82, 1.44, toriiZ + 0.02],
  ]);
  b.sweep(toriiRope, 0.014, { color: ROPE_STRAW, name: "toriiRope" });

  // 4 Hanging shide papers on the torii rope
  const toriiShideX = [-0.5, -0.2, 0.2, 0.5];
  toriiShideX.forEach((rx) => {
    b.cards([frame([rx, 1.38, toriiZ + 0.03], [0, 1, 0])], SHIDE_TEXTURE, {
      size: [0.065, 0.13],
      lean: 180,
      flow: [0, 0, 1],
      color: "#ffffff",
    });
  });

  // -------------------------------------------------------------------------------------------------------------
  // 15. SCENERY: Scattered Autumn Japanese Maple Leaves
  // -------------------------------------------------------------------------------------------------------------

  const leafFrames = [];
  const leafCount = 32;
  for (let l = 0; l < leafCount; l++) {
    const angle = seeded() * Math.PI * 2;
    const dist = 0.22 + seeded() * 0.55;
    const lx = Math.cos(angle) * dist;
    const lz = Math.sin(angle) * dist;

    // Avoid placing leaves directly inside paw cushions
    const nearPaw =
      Math.hypot(lx - 0.13, lz - 0.38) < 0.07 ||
      Math.hypot(lx + 0.13, lz - 0.38) < 0.07 ||
      Math.hypot(lx - 0.14, lz + 0.15) < 0.07 ||
      Math.hypot(lx + 0.14, lz + 0.15) < 0.07;

    if (!nearPaw) {
      const rot = seeded() * Math.PI * 2;
      leafFrames.push(frame([lx, 0.056, lz], [0, 1, 0], [Math.cos(rot), 0, Math.sin(rot)]));
    }
  }

  b.cards(leafFrames, MAPLE_LEAF_TEXTURE, {
    size: [0.068, 0.068],
    lean: 90, // Lying flat on the stone, lit from above
    mirror: true,
    vary: 0.35,
    rng: seeded,
    color: "#ffffff",
  });

  return b.root;
}
```