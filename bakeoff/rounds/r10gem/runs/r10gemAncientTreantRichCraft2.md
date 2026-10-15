```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  bezier,
  catmull,
  paint,
  noise,
  mix,
  smoothstep,
  svg,
} from "agentic-3js-builder";
import type { Frame } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Ancient Treant",
  description:
    "Towering ancient tree guardian in the Blizzard/Warcraft style, with a glowing druidic heartwood hollow, gnarled branch antlers, moss-capped bark plates, rune-carved stones, and a hanging spirit lantern.",
};

export default function build() {
  const b = createBuilder({ name: "ancient_treant", paintSize: 2048 });

  // ---------------------------------------------------------------------------
  // 1. Textures & Stylized SVGs
  // ---------------------------------------------------------------------------

  // Hand-painted Warcraft oak/ancient leaf cluster card
  const LEAF_SVG = `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <path d="M64 124 Q62 70 64 8" stroke="#251408" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path d="M64 82 Q42 70 24 68" stroke="#251408" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M64 56 Q86 46 104 44" stroke="#251408" stroke-width="4" stroke-linecap="round" fill="none"/>
    <!-- Leaf 1 (Left lower) -->
    <path d="M60 84 Q28 92 10 68 Q24 44 58 72 Z" fill="#1d4d12" stroke="#0e2608" stroke-width="3.5"/>
    <path d="M56 82 Q30 88 14 68 Q26 48 54 72 Z" fill="#3c8a1e"/>
    <path d="M50 80 Q32 82 20 70" stroke="#7ce633" stroke-width="3" stroke-linecap="round" fill="none"/>
    <!-- Leaf 2 (Right middle) -->
    <path d="M66 58 Q102 68 118 46 Q104 22 66 48 Z" fill="#1d4d12" stroke="#0e2608" stroke-width="3.5"/>
    <path d="M68 56 Q100 64 114 46 Q102 26 68 50 Z" fill="#3c8a1e"/>
    <path d="M72 54 Q94 56 108 46" stroke="#7ce633" stroke-width="3" stroke-linecap="round" fill="none"/>
    <!-- Leaf 3 (Left upper) -->
    <path d="M62 42 Q30 46 18 24 Q36 6 62 32 Z" fill="#1d4d12" stroke="#0e2608" stroke-width="3.5"/>
    <path d="M60 40 Q32 44 22 24 Q38 10 60 32 Z" fill="#449e22"/>
    <path d="M56 38 Q38 38 26 24" stroke="#8cf040" stroke-width="3" stroke-linecap="round" fill="none"/>
    <!-- Leaf 4 (Top terminal) -->
    <path d="M64 32 Q44 16 64 4 Q84 16 64 32 Z" fill="#1d4d12" stroke="#0e2608" stroke-width="3.5"/>
    <path d="M64 30 Q46 16 64 6 Q82 16 64 30 Z" fill="#52bd2a"/>
    <path d="M64 28 L64 8" stroke="#aaff4a" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
  const LEAF_TEX = svg(LEAF_SVG, { size: 256 });

  // Hanging Spanish moss / wild vine tendril
  const VINE_SVG = `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 0 Q18 32 36 64 Q50 96 26 128" stroke="#16380f" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M32 0 Q18 32 36 64 Q50 96 26 128" stroke="#357822" stroke-width="3.8" fill="none" stroke-linecap="round"/>
    <path d="M26 36 Q10 46 16 64" stroke="#357822" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M36 76 Q50 88 44 104" stroke="#357822" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="16" cy="64" r="4.5" fill="#65c738"/>
    <circle cx="44" cy="104" r="4.5" fill="#65c738"/>
    <circle cx="26" cy="126" r="5" fill="#8ff558"/>
    <circle cx="28" cy="42" r="4" fill="#52ad28"/>
    <circle cx="40" cy="88" r="4.5" fill="#52ad28"/>
  </svg>`;
  const VINE_TEX = svg(VINE_SVG, { size: 256 });

  // Night Elf / Druidic sacred glowing rune disc
  const RUNE_SVG = `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="58" fill="#10261c" stroke="#1d4a36" stroke-width="5"/>
    <path d="M64 14 A50 50 0 1 1 24 96 A42 42 0 1 0 54 24 A48 48 0 0 1 64 14 Z" fill="#18996b"/>
    <path d="M64 18 A46 46 0 1 1 28 92 A38 38 0 1 0 56 28 A44 44 0 0 1 64 18 Z" fill="#34ebb2"/>
    <path d="M64 64 A12 12 0 0 1 76 52 A20 20 0 0 1 84 72 A28 28 0 0 1 56 92 A36 36 0 0 1 28 64" fill="none" stroke="#8affd8" stroke-width="6" stroke-linecap="round"/>
    <circle cx="64" cy="64" r="8" fill="#ebfffa"/>
    <circle cx="36" cy="44" r="4" fill="#34ebb2"/>
    <circle cx="92" cy="78" r="4" fill="#34ebb2"/>
  </svg>`;
  const RUNE_TEX = svg(RUNE_SVG, { size: 256 });

  // Glowing Druid Spirit Eye
  const EYE_SVG = `<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
    <circle cx="48" cy="48" r="46" fill="#081a12"/>
    <circle cx="48" cy="48" r="38" fill="#0c4f34"/>
    <circle cx="48" cy="48" r="28" fill="#16b576"/>
    <circle cx="48" cy="48" r="18" fill="#4dffa6"/>
    <circle cx="48" cy="48" r="8" fill="#e8fffa"/>
    <path d="M48 8 L48 88 M8 48 L88 48" stroke="#a3ffdb" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
  const EYE_TEX = svg(EYE_SVG, { size: 128 });

  // ---------------------------------------------------------------------------
  // 2. Custom Hand-Painted Shaders (Paints)
  // ---------------------------------------------------------------------------

  const BARK_DEEP = "#221309";
  const BARK_MID = "#482b16";
  const BARK_LIGHT = "#744624";
  const MOSS_DEEP = "#1b4215";
  const MOSS_MID = "#3a7a20";
  const MOSS_LIGHT = "#78ba32";

  // Ancient Treant Bark: deep woody grain + sunlit ridges + vibrant emerald moss on top surfaces
  const barkPaint = paint((p, n) => {
    const grainCoord = new THREE.Vector3(p.x * 4.0, p.y * 12.0, p.z * 4.0);
    const g = noise(grainCoord, 0.32, 17);
    const roughCoord = new THREE.Vector3(p.x * 7.5, p.y * 2.5, p.z * 7.5);
    const r = noise(roughCoord, 0.18, 59);

    let c = mix(BARK_DEEP, BARK_MID, smoothstep(0.18, 0.72, g));
    c = mix(c, BARK_LIGHT, smoothstep(0.48, 0.86, r) * 0.65);

    // Warm top-down lighting
    const sun = smoothstep(-0.35, 0.85, n.y);
    c = [c[0] * (0.65 + 0.45 * sun), c[1] * (0.65 + 0.45 * sun), c[2] * (0.6 + 0.4 * sun)];

    // Lush moss growth on upward facing burls, shoulders and limbs
    const mNoise = noise(new THREE.Vector3(p.x * 3.5, p.y * 3.5, p.z * 3.5), 0.2, 103);
    const mossCoverage = smoothstep(0.18, 0.68, n.y + (mNoise - 0.5) * 0.75);
    if (mossCoverage > 0.02) {
      const mossColor = mix(MOSS_DEEP, mix(MOSS_MID, MOSS_LIGHT, mNoise), smoothstep(0.3, 0.85, n.y));
      c = mix(c, mossColor, mossCoverage * 0.94);
    }
    return c;
  });

  // Ancient weathered Granite stone
  const STONE_DARK = "#35393d";
  const STONE_MID = "#545961";
  const STONE_LIGHT = "#7c828c";
  const stonePaint = paint((p, n) => {
    const sNoise = noise(new THREE.Vector3(p.x * 4.0, p.y * 4.0, p.z * 4.0), 0.25, 231);
    let c = mix(STONE_DARK, STONE_MID, sNoise);
    c = mix(c, STONE_LIGHT, smoothstep(0.55, 0.85, sNoise) * 0.45);
    if (n.y > 0.25) {
      c = mix(c, MOSS_MID, smoothstep(0.25, 0.8, n.y) * 0.75);
    }
    return c;
  });

  // Forest Grove Turf Base
  const SOIL_DARK = "#1c150e";
  const SOIL_MID = "#332417";
  const TURF_GREEN = "#274f16";
  const TURF_LIGHT = "#4f8722";
  const groundPaint = paint((p, n) => {
    const gNoise = noise(new THREE.Vector3(p.x * 2.2, 0, p.z * 2.2), 0.45, 88);
    const patchNoise = noise(new THREE.Vector3(p.x * 5.0, 0, p.z * 5.0), 0.16, 142);
    let c = mix(SOIL_DARK, SOIL_MID, gNoise);
    const grassFactor = smoothstep(0.35, 0.65, patchNoise + 0.2 * n.y);
    c = mix(c, mix(TURF_GREEN, TURF_LIGHT, gNoise), grassFactor);
    return c;
  });

  // Flat accent colours
  const DARK_WOOD = "#180e07";
  const HEARTWOOD = "#8f5728";
  const SHROOM_ORANGE = "#ba4e1c";
  const SHROOM_CREAM = "#faebd2";
  const GLOW_GREEN = "#36ffb2";
  const GLOW_EMERALD = "#1ae89a";
  const GLOW_GOLD = "#ffb833";

  // ---------------------------------------------------------------------------
  // 3. Skeleton Hierarchy (Rest Pose for Warcraft Treant)
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", { at: [0, 1.45, -0.02], role: "spine" });
  const spine1 = b.joint("spine1", { parent: hips, at: [0, 1.82, -0.04], role: "spine" });
  const spine2 = b.joint("spine2", { parent: spine1, at: [0, 2.22, -0.02], role: "spine" });
  const chest = b.joint("chest", { parent: spine2, at: [0, 2.62, 0.04], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 2.92, 0.12], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 3.16, 0.18], role: "head" });
  // Jaw joint hinged to swing open
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.86, 0.26], aim: [0, 2.65, 0.52], role: "jaw" });

  // Antler joints on head
  const antlerL1 = b.joint("antlerL1", { parent: head, at: [0.28, 3.42, 0.12], dir: [0.35, 0.8, -0.2], role: "fan" });
  const antlerL2 = b.joint("antlerL2", { parent: antlerL1, at: [0.55, 3.82, 0.02], dir: [0.4, 0.6, 0.1], role: "fan" });
  const antlerR1 = b.joint("antlerR1", { parent: head, at: [-0.28, 3.42, 0.12], dir: [-0.35, 0.8, -0.2], role: "fan" });
  const antlerR2 = b.joint("antlerR2", { parent: antlerR1, at: [-0.55, 3.82, 0.02], dir: [-0.4, 0.6, 0.1], role: "fan" });

  // Arms: Heavy, authoritative tree-bough A/T-pose
  // Left Arm (+X)
  const shoulderL = b.joint("shoulderL", { parent: chest, at: [0.72, 2.62, 0.04], role: "arm" });
  const elbowL = b.joint("elbowL", { parent: shoulderL, at: [1.22, 1.95, -0.04], role: "arm" });
  const wristL = b.joint("wristL", { parent: elbowL, at: [1.48, 1.25, 0.12], role: "arm" });

  // Left Fingers
  const thumbL1 = b.joint("thumbL1", { parent: wristL, at: [1.38, 1.15, 0.24], role: "digit" });
  const thumbL2 = b.joint("thumbL2", { parent: thumbL1, at: [1.32, 1.02, 0.32], role: "digit" });
  const indexL1 = b.joint("indexL1", { parent: wristL, at: [1.52, 1.12, 0.24], role: "digit" });
  const indexL2 = b.joint("indexL2", { parent: indexL1, at: [1.56, 0.95, 0.30], role: "digit" });
  const midL1 = b.joint("midL1", { parent: wristL, at: [1.60, 1.10, 0.12], role: "digit" });
  const midL2 = b.joint("midL2", { parent: midL1, at: [1.66, 0.92, 0.15], role: "digit" });
  const ringL1 = b.joint("ringL1", { parent: wristL, at: [1.58, 1.12, -0.02], role: "digit" });
  const ringL2 = b.joint("ringL2", { parent: ringL1, at: [1.62, 0.96, -0.05], role: "digit" });

  // Right Arm (-X)
  const shoulderR = b.joint("shoulderR", { parent: chest, at: [-0.72, 2.62, 0.04], role: "arm" });
  const elbowR = b.joint("elbowR", { parent: shoulderR, at: [-1.22, 1.95, -0.04], role: "arm" });
  const wristR = b.joint("wristR", { parent: elbowR, at: [-1.48, 1.25, 0.12], role: "arm" });

  // Right Fingers
  const thumbR1 = b.joint("thumbR1", { parent: wristR, at: [-1.38, 1.15, 0.24], role: "digit" });
  const thumbR2 = b.joint("thumbR2", { parent: thumbR1, at: [-1.32, 1.02, 0.32], role: "digit" });
  const indexR1 = b.joint("indexR1", { parent: wristR, at: [-1.52, 1.12, 0.24], role: "digit" });
  const indexR2 = b.joint("indexR2", { parent: indexR1, at: [-1.56, 0.95, 0.30], role: "digit" });
  const midR1 = b.joint("midR1", { parent: wristR, at: [-1.60, 1.10, 0.12], role: "digit" });
  const midR2 = b.joint("midR2", { parent: midR1, at: [-1.66, 0.92, 0.15], role: "digit" });
  const ringR1 = b.joint("ringR1", { parent: wristR, at: [-1.58, 1.12, -0.02], role: "digit" });
  const ringR2 = b.joint("ringR2", { parent: ringR1, at: [-1.62, 0.96, -0.05], role: "digit" });

  // Legs: Sturdy trunk boles splitting into roots at floor
  // Left Leg (+X)
  const hipL = b.joint("hipL", { parent: hips, at: [0.46, 1.35, -0.02], role: "leg" });
  const kneeL = b.joint("kneeL", { parent: hipL, at: [0.54, 0.76, -0.06], role: "leg" });
  const ankleL = b.joint("ankleL", { parent: kneeL, at: [0.58, 0.28, 0.04], role: "leg" });

  // Right Leg (-X)
  const hipR = b.joint("hipR", { parent: hips, at: [-0.46, 1.35, -0.02], role: "leg" });
  const kneeR = b.joint("kneeR", { parent: hipR, at: [-0.54, 0.76, -0.06], role: "leg" });
  const ankleR = b.joint("ankleR", { parent: kneeR, at: [-0.58, 0.28, 0.04], role: "leg" });

  // ---------------------------------------------------------------------------
  // 4. Trunk Torso & The Druidic Heartwood Hollow
  // ---------------------------------------------------------------------------

  // Massive main trunk loft over spine
  b.loft(
    [
      { at: [0, 1.45, -0.02], w: 1.18, h: 1.08 },
      { at: [0, 1.82, -0.04], w: 1.06, h: 0.98 },
      { at: [0, 2.22, -0.02], w: 1.28, h: 1.12 },
      { at: [0, 2.62, 0.04], w: 1.46, h: 1.20 },
      { at: [0, 2.92, 0.12], w: 0.92, h: 0.86 },
    ],
    {
      bone: [hips, spine1, spine2, chest, neck],
      color: barkPaint,
      name: "trunk_torso",
    },
  );

  // Deep dark chest cavern cavity where ancient magic dwells
  b.part(
    new THREE.CylinderGeometry(0.30, 0.24, 0.52, 12, 1, false, 0, Math.PI),
    DARK_WOOD,
    { bone: chest, at: [0, 2.38, 0.18], rotation: [0, 90, 0], name: "heart_cavern" },
  );

  // The Living Heartwood: Radiant cluster of sacred druidic spirit crystals
  const coreCrystal = b.part(
    new THREE.DodecahedronGeometry(0.13, 0),
    GLOW_GREEN,
    { bone: chest, at: [0, 2.38, 0.24], name: "spirit_core" },
  );
  glow(coreCrystal, 2.8);

  const satCrystal1 = b.part(
    new THREE.OctahedronGeometry(0.08, 0),
    GLOW_GREEN,
    { bone: chest, at: [0.09, 2.47, 0.28], rotation: [20, 30, 0], name: "spirit_sat1" },
  );
  glow(satCrystal1, 2.4);

  const satCrystal2 = b.part(
    new THREE.OctahedronGeometry(0.07, 0),
    GLOW_GREEN,
    { bone: chest, at: [-0.08, 2.29, 0.27], rotation: [-15, 45, 10], name: "spirit_sat2" },
  );
  glow(satCrystal2, 2.4);

  // Living wooden rib-cages wrapping protectively over the hollow
  for (const s of [1, -1]) {
    for (let r = 0; r < 4; r++) {
      const y0 = 2.15 + r * 0.13;
      const ribCurve = bezier(
        [s * 0.52, y0, 0.30],
        [s * 0.38, y0 + 0.04, 0.52],
        [s * 0.14, y0 - 0.02, 0.44],
      );
      b.sweep(ribCurve, [0.055, 0.032], {
        bone: chest,
        color: barkPaint,
        caps: "round",
        name: `chest_rib_${s}_${r}`,
      });
    }
  }

  // Large ancient druidic rune medallion above chest hollow
  b.part(
    new THREE.CylinderGeometry(0.23, 0.23, 0.04, 16),
    stonePaint,
    { bone: chest, at: [0, 2.70, 0.48], rotation: [74, 0, 0], name: "chest_rune_backing" },
  );
  const runePlate = b.part(
    new THREE.CircleGeometry(0.20, 16),
    "#ffffff",
    {
      bone: chest,
      at: [0, 2.705, 0.50],
      rotation: [74, 0, 0],
      texture: RUNE_TEX,
      name: "chest_rune_glow",
    },
  );
  glow(runePlate, 2.0);

  // Bracket mushrooms (shelf fungi) cascading down the right flank
  for (let m = 0; m < 4; m++) {
    const y = 1.90 + m * 0.16;
    const rad = 0.18 - m * 0.025;
    b.part(
      new THREE.CylinderGeometry(rad, rad * 0.85, 0.028, 8, 1, false, 0, Math.PI),
      SHROOM_ORANGE,
      {
        bone: spine2,
        at: [-0.58, y, 0.10 + m * 0.04],
        rotation: [15, -45, 10],
        name: `shelf_shroom_${m}`,
      },
    );
    b.part(
      new THREE.TorusGeometry(rad, 0.012, 6, 8, Math.PI),
      SHROOM_CREAM,
      {
        bone: spine2,
        at: [-0.58, y + 0.006, 0.10 + m * 0.04],
        rotation: [15, -45, 10],
        name: `shelf_shroom_rim_${m}`,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // 5. Head, Wise Tree Face & Articulated Jaw
  // ---------------------------------------------------------------------------

  // Cranium / upper head trunk block
  b.frustumBox(
    [0, 2.98, 0.12],
    [0, 3.42, 0.20],
    [0.84, 0.72],
    [0.66, 0.58],
    { bone: head, color: barkPaint, name: "head_block" },
  );

  // Deep carved eye sockets with glowing wisp eyes
  for (const s of [1, -1]) {
    // Dark hollow socket
    b.part(
      new THREE.SphereGeometry(0.12, 8, 8),
      DARK_WOOD,
      {
        bone: head,
        at: [s * 0.22, 3.22, 0.42],
        scale: [1.0, 0.75, 0.5],
        name: `eye_socket_${s}`,
      },
    );

    // Inner glowing wisp orb
    const eyeOrb = b.part(
      new THREE.SphereGeometry(0.065, 10, 8),
      GLOW_EMERALD,
      { bone: head, at: [s * 0.22, 3.22, 0.44], name: `eye_orb_${s}` },
    );
    glow(eyeOrb, 2.6);

    // Front aperture lens with rune eye detail
    b.part(
      new THREE.PlaneGeometry(0.13, 0.13),
      "#ffffff",
      {
        bone: head,
        at: [s * 0.22, 3.22, 0.49],
        texture: EYE_TEX,
        name: `eye_lens_${s}`,
      },
    );
  }

  // Heavy gnarled timber brow ridge arching over both eyes
  const browCurve = catmull([
    [-0.40, 3.26, 0.36],
    [-0.22, 3.36, 0.53],
    [0.0, 3.32, 0.55],
    [0.22, 3.36, 0.53],
    [0.40, 3.26, 0.36],
  ]);
  b.sweep(browCurve, (t) => 0.075 + 0.04 * Math.sin(t * Math.PI), {
    bone: head,
    color: barkPaint,
    caps: "round",
    name: "brow_ridge",
  });

  // Gnarled wooden nose ridge bridge
  const noseCurve = bezier([0, 3.32, 0.54], [0, 3.12, 0.63], [0, 2.94, 0.53]);
  b.sweep(noseCurve, [0.085, 0.055], {
    bone: head,
    color: barkPaint,
    caps: "round",
    name: "nose_ridge",
  });

  // Distinct Articulated Jaw Block
  b.frustumBox(
    [0, 2.88, 0.28],
    [0, 2.68, 0.46],
    [0.58, 0.42],
    [0.44, 0.32],
    { bone: jaw, color: barkPaint, name: "jaw_base" },
  );

  // Mouth cavity hollow
  b.part(
    new THREE.BoxGeometry(0.34, 0.12, 0.25),
    DARK_WOOD,
    { bone: jaw, at: [0, 2.87, 0.36], name: "mouth_cavity" },
  );

  // Faint luminescent spirit glow inside mouth
  const mouthGlow = b.part(
    new THREE.SphereGeometry(0.08, 6, 4),
    GLOW_EMERALD,
    { bone: jaw, at: [0, 2.87, 0.34], scale: [1.8, 0.4, 1.0], name: "mouth_glow" },
  );
  glow(mouthGlow, 1.8);

  // Wooden root stalactite beard cascading down from the jaw
  const beardTendrilConfigs = [
    [0.0, 2.68, 0.48, 0.68],
    [0.09, 2.70, 0.46, 0.56],
    [-0.09, 2.70, 0.46, 0.56],
    [0.18, 2.72, 0.42, 0.48],
    [-0.18, 2.72, 0.42, 0.48],
    [0.26, 2.75, 0.36, 0.38],
    [-0.26, 2.75, 0.36, 0.38],
    [0.05, 2.65, 0.44, 0.60],
    [-0.05, 2.65, 0.44, 0.60],
  ];
  for (let i = 0; i < beardTendrilConfigs.length; i++) {
    const [bx, by, bz, len] = beardTendrilConfigs[i];
    const tendril = bezier(
      [bx, by, bz],
      [bx * 1.15 + (i % 2 === 0 ? 0.03 : -0.03), by - len * 0.5, bz + 0.04],
      [bx * 0.85, by - len, bz + 0.01],
    );
    b.sweep(tendril, [0.048, 0.008], {
      bone: jaw,
      color: barkPaint,
      caps: { start: "round", end: "point" },
      name: `beard_root_${i}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 6. Crown Antlers, Back Branches & Canopy Foliage
  // ---------------------------------------------------------------------------

  // Left Great Antler Bough
  const antlerPathL = catmull([
    [0.24, 3.35, 0.16],
    [0.40, 3.65, 0.08],
    [0.60, 3.92, -0.04],
    [0.74, 4.16, -0.16],
  ]);
  b.sweep(antlerPathL, [0.12, 0.04], { bone: antlerL1, color: barkPaint, caps: "point", name: "antler_main_L" });

  // Left Antler Forks
  const forkL1 = bezier([0.40, 3.65, 0.08], [0.52, 3.82, 0.22], [0.58, 4.02, 0.28]);
  b.sweep(forkL1, [0.065, 0.02], { bone: antlerL2, color: barkPaint, caps: "point", name: "antler_forkL1" });

  const forkL2 = bezier([0.50, 3.78, 0.02], [0.74, 3.86, 0.08], [0.90, 3.96, 0.02]);
  b.sweep(forkL2, [0.055, 0.018], { bone: antlerL2, color: barkPaint, caps: "point", name: "antler_forkL2" });

  const forkL3 = bezier([0.60, 3.92, -0.04], [0.68, 4.06, -0.22], [0.72, 4.22, -0.32]);
  b.sweep(forkL3, [0.05, 0.018], { bone: antlerL2, color: barkPaint, caps: "point", name: "antler_forkL3" });

  // Right Great Antler Bough
  const antlerPathR = catmull([
    [-0.24, 3.35, 0.16],
    [-0.40, 3.65, 0.08],
    [-0.60, 3.92, -0.04],
    [-0.74, 4.16, -0.16],
  ]);
  b.sweep(antlerPathR, [0.12, 0.04], { bone: antlerR1, color: barkPaint, caps: "point", name: "antler_main_R" });

  // Right Antler Forks
  const forkR1 = bezier([-0.40, 3.65, 0.08], [-0.52, 3.82, 0.22], [-0.58, 4.02, 0.28]);
  b.sweep(forkR1, [0.065, 0.02], { bone: antlerR2, color: barkPaint, caps: "point", name: "antler_forkR1" });

  const forkR2 = bezier([-0.50, 3.78, 0.02], [-0.74, 3.86, 0.08], [-0.90, 3.96, 0.02]);
  b.sweep(forkR2, [0.055, 0.018], { bone: antlerR2, color: barkPaint, caps: "point", name: "antler_forkR2" });

  const forkR3 = bezier([-0.60, 3.92, -0.04], [-0.68, 4.06, -0.22], [-0.72, 4.22, -0.32]);
  b.sweep(forkR3, [0.05, 0.018], { bone: antlerR2, color: barkPaint, caps: "point", name: "antler_forkR3" });

  // Back Canopy Sturdy Boughs
  const backBranch1 = bezier([0, 2.75, -0.42], [0, 3.10, -0.72], [0, 3.44, -0.95]);
  b.sweep(backBranch1, [0.11, 0.035], { bone: chest, color: barkPaint, caps: "point", name: "back_branch1" });

  const backBranch2 = bezier([0.35, 2.72, -0.38], [0.55, 3.05, -0.62], [0.70, 3.32, -0.80]);
  b.sweep(backBranch2, [0.09, 0.03], { bone: chest, color: barkPaint, caps: "point", name: "back_branch2" });

  const backBranch3 = bezier([-0.35, 2.72, -0.38], [-0.55, 3.05, -0.62], [-0.70, 3.32, -0.80]);
  b.sweep(backBranch3, [0.09, 0.03], { bone: chest, color: barkPaint, caps: "point", name: "back_branch3" });

  // Lush Leaf Canopy Cards
  const leafFrames: Frame[] = [
    // Left antler leaf nodes
    frame([0.74, 4.16, -0.16], [0, 1, 0]),
    frame([0.58, 4.02, 0.28], [0.3, 0.8, 0.5]),
    frame([0.90, 3.96, 0.02], [0.8, 0.5, 0]),
    frame([0.72, 4.22, -0.32], [0, 0.6, -0.8]),
    frame([0.50, 3.80, 0.12], [0.2, 0.9, 0]),
    // Right antler leaf nodes
    frame([-0.74, 4.16, -0.16], [0, 1, 0]),
    frame([-0.58, 4.02, 0.28], [-0.3, 0.8, 0.5]),
    frame([-0.90, 3.96, 0.02], [-0.8, 0.5, 0]),
    frame([-0.72, 4.22, -0.32], [0, 0.6, -0.8]),
    frame([-0.50, 3.80, 0.12], [-0.2, 0.9, 0]),
    // Back branch leaf nodes
    frame([0, 3.44, -0.95], [0, 0.7, -0.7]),
    frame([0.70, 3.32, -0.80], [0.5, 0.7, -0.5]),
    frame([-0.70, 3.32, -0.80], [-0.5, 0.7, -0.5]),
    frame([0.35, 3.20, -0.70], [0.2, 0.9, -0.3]),
    frame([-0.35, 3.20, -0.70], [-0.2, 0.9, -0.3]),
  ];
  b.cards(leafFrames, LEAF_TEX, {
    size: [0.42, 0.48],
    bend: 25,
    vary: 0.25,
    cross: true,
    rng: rng(42),
    name: "canopy_leaves",
  });

  // Hanging Willow / Spanish Moss Vines
  const vineFrames: Frame[] = [
    frame([0.55, 3.80, 0.0], [0, 1, 0]),
    frame([0.80, 3.90, 0.05], [0, 1, 0]),
    frame([-0.55, 3.80, 0.0], [0, 1, 0]),
    frame([-0.80, 3.90, 0.05], [0, 1, 0]),
    frame([0.45, 3.00, -0.55], [0, 1, 0]),
    frame([-0.45, 3.00, -0.55], [0, 1, 0]),
    frame([0.0, 3.20, -0.85], [0, 1, 0]),
    frame([0.15, 2.65, 0.38], [0, 1, 0]),
    frame([-0.15, 2.65, 0.38], [0, 1, 0]),
  ];
  b.cards(vineFrames, VINE_TEX, {
    size: [0.18, 0.62],
    lean: 180, // Hangs straight down
    flow: [0, 0, 1],
    vary: 0.22,
    rng: rng(88),
    name: "hanging_vines",
  });

  // ---------------------------------------------------------------------------
  // 7. Hanging Spirit Lantern (Swaying from Right Antler Fork)
  // ---------------------------------------------------------------------------

  const lanternAttach = new THREE.Vector3(-0.90, 3.96, 0.02);
  const lanternBodyPos = new THREE.Vector3(-0.90, 3.32, 0.02);

  // Chains connecting branch to lantern cap
  for (let c = 0; c < 4; c++) {
    const yLink = 3.90 - c * 0.12;
    b.part(
      new THREE.TorusGeometry(0.024, 0.007, 6, 8),
      DARK_WOOD,
      { bone: antlerR2, at: [-0.90, yLink, 0.02], rotation: [0, c % 2 === 0 ? 0 : 90, 0], name: `lantern_chain_${c}` },
    );
  }

  // Lantern Hexagonal Wooden Cap
  b.part(
    new THREE.ConeGeometry(0.13, 0.09, 6),
    DARK_WOOD,
    { bone: antlerR2, at: [-0.90, 3.42, 0.02], rotation: [0, 0, 0], name: "lantern_cap" },
  );

  // Lantern Hexagonal Wooden Base
  b.part(
    new THREE.ConeGeometry(0.12, 0.07, 6),
    DARK_WOOD,
    { bone: antlerR2, at: [-0.90, 3.22, 0.02], rotation: [180, 0, 0], name: "lantern_base" },
  );

  // 6 Wooden Struts forming the cage
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const sx = -0.90 + 0.09 * Math.cos(a);
    const sz = 0.02 + 0.09 * Math.sin(a);
    b.rod(
      [sx, 3.42, sz],
      [sx, 3.22, sz],
      0.012,
      { bone: antlerR2, color: DARK_WOOD, name: `lantern_strut_${i}` },
    );
  }

  // Radiant Golden Forest Wisp trapped inside the lantern
  const lanternWisp = b.part(
    new THREE.SphereGeometry(0.055, 8, 8),
    GLOW_GOLD,
    { bone: antlerR2, at: [-0.90, 3.32, 0.02], name: "lantern_wisp" },
  );
  glow(lanternWisp, 2.8);

  // ---------------------------------------------------------------------------
  // 8. Massive Wooden Arms, Claws & Shoulder Monoliths
  // ---------------------------------------------------------------------------

  // Left Arm (+X)
  // Massive Shoulder burl node
  b.part(
    new THREE.SphereGeometry(0.26, 10, 8),
    barkPaint,
    { bone: shoulderL, at: [0.72, 2.62, 0.04], scale: [1.1, 1.0, 1.2], name: "shoulder_node_L" },
  );

  // Ancient Druid Rune Monolith strapped to Left Shoulder
  b.frustumBox(
    [0.64, 2.74, 0.02],
    [0.90, 2.86, 0.06],
    [0.32, 0.16],
    [0.26, 0.14],
    { bone: shoulderL, color: stonePaint, name: "shoulder_monolith_L" },
  );
  const shoulderRuneL = b.part(
    new THREE.PlaneGeometry(0.16, 0.16),
    "#ffffff",
    {
      bone: shoulderL,
      at: [0.77, 2.88, 0.08],
      rotation: [-60, 40, -10],
      texture: RUNE_TEX,
      name: "shoulder_rune_L",
    },
  );
  glow(shoulderRuneL, 2.0);

  // Left Upper Arm sweep
  const upperArmL = catmull([
    [0.72, 2.62, 0.04],
    [0.98, 2.30, 0.00],
    [1.22, 1.95, -0.04],
  ]);
  b.sweep(upperArmL, [0.22, 0.18], { bone: shoulderL, color: barkPaint, name: "upper_arm_L" });

  // Elbow burl
  b.part(
    new THREE.SphereGeometry(0.20, 8, 8),
    barkPaint,
    { bone: elbowL, at: [1.22, 1.95, -0.04], name: "elbow_node_L" },
  );

  // Left Forearm sweep (widening towards the wrist)
  const foreArmL = catmull([
    [1.22, 1.95, -0.04],
    [1.36, 1.60, 0.04],
    [1.48, 1.25, 0.12],
  ]);
  b.sweep(foreArmL, (t) => 0.18 + 0.06 * t, { bone: elbowL, color: barkPaint, name: "forearm_L" });

  // Wrist heavy bark collar
  b.part(
    new THREE.CylinderGeometry(0.24, 0.25, 0.12, 10),
    barkPaint,
    { bone: wristL, at: [1.48, 1.25, 0.12], dir: [0.2, -0.9, 0.2], name: "wrist_collar_L" },
  );

  // Hand knuckle palm block
  b.frustumBox(
    [1.48, 1.25, 0.12],
    [1.54, 1.08, 0.18],
    [0.34, 0.18],
    [0.30, 0.16],
    { bone: wristL, color: barkPaint, name: "palm_L" },
  );

  // Left Fingers & Thumb
  // Thumb
  b.capsule([1.38, 1.15, 0.24], [1.32, 1.02, 0.32], 0.055, { bone: thumbL1, color: barkPaint, name: "thumb_p_L" });
  b.spike([1.32, 1.02, 0.32], [1.28, 0.90, 0.38], 0.16, 0.048, { bone: thumbL2, color: HEARTWOOD, name: "thumb_d_L" });
  // Index
  b.capsule([1.52, 1.12, 0.24], [1.56, 0.95, 0.30], 0.055, { bone: indexL1, color: barkPaint, name: "index_p_L" });
  b.spike([1.56, 0.95, 0.30], [1.60, 0.82, 0.34], 0.18, 0.048, { bone: indexL2, color: HEARTWOOD, name: "index_d_L" });
  // Middle
  b.capsule([1.60, 1.10, 0.12], [1.66, 0.92, 0.15], 0.058, { bone: midL1, color: barkPaint, name: "mid_p_L" });
  b.spike([1.66, 0.92, 0.15], [1.72, 0.78, 0.18], 0.19, 0.050, { bone: midL2, color: HEARTWOOD, name: "mid_d_L" });
  // Ring
  b.capsule([1.58, 1.12, -0.02], [1.62, 0.96, -0.05], 0.052, { bone: ringL1, color: barkPaint, name: "ring_p_L" });
  b.spike([1.62, 0.96, -0.05], [1.66, 0.84, -0.08], 0.17, 0.045, { bone: ringL2, color: HEARTWOOD, name: "ring_d_L" });

  // Right Arm (-X)
  // Shoulder burl node
  b.part(
    new THREE.SphereGeometry(0.26, 10, 8),
    barkPaint,
    { bone: shoulderR, at: [-0.72, 2.62, 0.04], scale: [1.1, 1.0, 1.2], name: "shoulder_node_R" },
  );

  // Ancient Druid Rune Monolith strapped to Right Shoulder
  b.frustumBox(
    [-0.64, 2.74, 0.02],
    [-0.90, 2.86, 0.06],
    [0.32, 0.16],
    [0.26, 0.14],
    { bone: shoulderR, color: stonePaint, name: "shoulder_monolith_R" },
  );
  const shoulderRuneR = b.part(
    new THREE.PlaneGeometry(0.16, 0.16),
    "#ffffff",
    {
      bone: shoulderR,
      at: [-0.77, 2.88, 0.08],
      rotation: [-60, -40, 10],
      texture: RUNE_TEX,
      name: "shoulder_rune_R",
    },
  );
  glow(shoulderRuneR, 2.0);

  // Right Upper Arm sweep
  const upperArmR = catmull([
    [-0.72, 2.62, 0.04],
    [-0.98, 2.30, 0.00],
    [-1.22, 1.95, -0.04],
  ]);
  b.sweep(upperArmR, [0.22, 0.18], { bone: shoulderR, color: barkPaint, name: "upper_arm_R" });

  // Elbow burl
  b.part(
    new THREE.SphereGeometry(0.20, 8, 8),
    barkPaint,
    { bone: elbowR, at: [-1.22, 1.95, -0.04], name: "elbow_node_R" },
  );

  // Right Forearm sweep
  const foreArmR = catmull([
    [-1.22, 1.95, -0.04],
    [-1.36, 1.60, 0.04],
    [-1.48, 1.25, 0.12],
  ]);
  b.sweep(foreArmR, (t) => 0.18 + 0.06 * t, { bone: elbowR, color: barkPaint, name: "forearm_R" });

  // Wrist heavy bark collar
  b.part(
    new THREE.CylinderGeometry(0.24, 0.25, 0.12, 10),
    barkPaint,
    { bone: wristR, at: [-1.48, 1.25, 0.12], dir: [-0.2, -0.9, 0.2], name: "wrist_collar_R" },
  );

  // Hand knuckle palm block
  b.frustumBox(
    [-1.48, 1.25, 0.12],
    [-1.54, 1.08, 0.18],
    [0.34, 0.18],
    [0.30, 0.16],
    { bone: wristR, color: barkPaint, name: "palm_R" },
  );

  // Right Fingers & Thumb
  // Thumb
  b.capsule([-1.38, 1.15, 0.24], [-1.32, 1.02, 0.32], 0.055, { bone: thumbR1, color: barkPaint, name: "thumb_p_R" });
  b.spike([-1.32, 1.02, 0.32], [-1.28, 0.90, 0.38], 0.16, 0.048, { bone: thumbR2, color: HEARTWOOD, name: "thumb_d_R" });
  // Index
  b.capsule([-1.52, 1.12, 0.24], [-1.56, 0.95, 0.30], 0.055, { bone: indexR1, color: barkPaint, name: "index_p_R" });
  b.spike([-1.56, 0.95, 0.30], [-1.60, 0.82, 0.34], 0.18, 0.048, { bone: indexR2, color: HEARTWOOD, name: "index_d_R" });
  // Middle
  b.capsule([-1.60, 1.10, 0.12], [-1.66, 0.92, 0.15], 0.058, { bone: midR1, color: barkPaint, name: "mid_p_R" });
  b.spike([-1.66, 0.92, 0.15], [-1.72, 0.78, 0.18], 0.19, 0.050, { bone: midR2, color: HEARTWOOD, name: "mid_d_R" });
  // Ring
  b.capsule([-1.58, 1.12, -0.02], [-1.62, 0.96, -0.05], 0.052, { bone: ringR1, color: barkPaint, name: "ring_p_R" });
  b.spike([-1.62, 0.96, -0.05], [-1.66, 0.84, -0.08], 0.17, 0.045, { bone: ringR2, color: HEARTWOOD, name: "ring_d_R" });

  // ---------------------------------------------------------------------------
  // 9. Stump Legs & Root Feet Grounded at y = 0
  // ---------------------------------------------------------------------------

  // Left Leg (+X)
  const thighL = catmull([
    [0.46, 1.35, -0.02],
    [0.50, 1.05, -0.04],
    [0.54, 0.76, -0.06],
  ]);
  b.sweep(thighL, [0.28, 0.24], { bone: hipL, color: barkPaint, name: "thigh_L" });

  b.part(
    new THREE.SphereGeometry(0.24, 8, 8),
    barkPaint,
    { bone: kneeL, at: [0.54, 0.76, -0.06], name: "knee_node_L" },
  );

  const shinL = catmull([
    [0.54, 0.76, -0.06],
    [0.56, 0.52, -0.01],
    [0.58, 0.28, 0.04],
  ]);
  b.sweep(shinL, [0.24, 0.32], { bone: kneeL, color: barkPaint, name: "shin_L" });

  // 4 Sprawling Roots Anchoring Left Foot to Floor (landing on y = 0.02)
  const rootL1 = bezier([0.58, 0.28, 0.04], [0.72, 0.12, 0.24], [0.85, 0.02, 0.42]);
  b.sweep(rootL1, [0.15, 0.05], { bone: ankleL, color: barkPaint, caps: "round", name: "rootL_front_out" });

  const rootL2 = bezier([0.58, 0.28, 0.04], [0.45, 0.12, 0.28], [0.34, 0.02, 0.48]);
  b.sweep(rootL2, [0.14, 0.045], { bone: ankleL, color: barkPaint, caps: "round", name: "rootL_front_in" });

  const rootL3 = bezier([0.58, 0.28, 0.04], [0.70, 0.10, -0.22], [0.82, 0.02, -0.38]);
  b.sweep(rootL3, [0.16, 0.05], { bone: ankleL, color: barkPaint, caps: "round", name: "rootL_rear_brace" });

  const rootL4 = bezier([0.58, 0.28, 0.04], [0.82, 0.10, -0.02], [1.02, 0.02, -0.06]);
  b.sweep(rootL4, [0.14, 0.045], { bone: ankleL, color: barkPaint, caps: "round", name: "rootL_side_anchor" });

  // Right Leg (-X)
  const thighR = catmull([
    [-0.46, 1.35, -0.02],
    [-0.50, 1.05, -0.04],
    [-0.54, 0.76, -0.06],
  ]);
  b.sweep(thighR, [0.28, 0.24], { bone: hipR, color: barkPaint, name: "thigh_R" });

  b.part(
    new THREE.SphereGeometry(0.24, 8, 8),
    barkPaint,
    { bone: kneeR, at: [-0.54, 0.76, -0.06], name: "knee_node_R" },
  );

  const shinR = catmull([
    [-0.54, 0.76, -0.06],
    [-0.56, 0.52, -0.01],
    [-0.58, 0.28, 0.04],
  ]);
  b.sweep(shinR, [0.24, 0.32], { bone: kneeR, color: barkPaint, name: "shin_R" });

  // 4 Sprawling Roots Anchoring Right Foot to Floor (landing on y = 0.02)
  const rootR1 = bezier([-0.58, 0.28, 0.04], [-0.72, 0.12, 0.24], [-0.85, 0.02, 0.42]);
  b.sweep(rootR1, [0.15, 0.05], { bone: ankleR, color: barkPaint, caps: "round", name: "rootR_front_out" });

  const rootR2 = bezier([-0.58, 0.28, 0.04], [-0.45, 0.12, 0.28], [-0.34, 0.02, 0.48]);
  b.sweep(rootR2, [0.14, 0.045], { bone: ankleR, color: barkPaint, caps: "round", name: "rootR_front_in" });

  const rootR3 = bezier([-0.58, 0.28, 0.04], [-0.70, 0.10, -0.22], [-0.82, 0.02, -0.38]);
  b.sweep(rootR3, [0.16, 0.05], { bone: ankleR, color: barkPaint, caps: "round", name: "rootR_rear_brace" });

  const rootR4 = bezier([-0.58, 0.28, 0.04], [-0.82, 0.10, -0.02], [-1.02, 0.02, -0.06]);
  b.sweep(rootR4, [0.14, 0.045], { bone: ankleR, color: barkPaint, caps: "round", name: "rootR_side_anchor" });

  // ---------------------------------------------------------------------------
  // 10. Sacred Grove Staged Base & Scenery (Lowest Point Touches y = 0)
  // ---------------------------------------------------------------------------

  // Circular Forest Grove Ground Mound: bottom resting exactly at y = 0.0
  b.lathe(
    [
      [0, 0.0],
      [2.15, 0.0],
      [2.10, 0.025],
      [1.65, 0.055],
      [0, 0.07],
    ],
    { at: [0, 0, 0], segments: 24, color: groundPaint, name: "sacred_grove_base" },
  );

  // Weathered Druidic Standing Monolith (set behind the Treant to frame without obscuring)
  b.frustumBox(
    [0.0, 0.02, -1.45],
    [0.0, 1.25, -1.55],
    [0.48, 0.32],
    [0.28, 0.18],
    { color: stonePaint, name: "standing_monolith" },
  );

  // Carved glowing rune banner on the standing stone
  const monolithRune = b.part(
    new THREE.PlaneGeometry(0.24, 0.52),
    "#ffffff",
    {
      at: [0.0, 0.68, -1.28],
      rotation: [0, 0, 0],
      texture: RUNE_TEX,
      name: "monolith_rune",
    },
  );
  glow(monolithRune, 2.0);

  // Weathered stepping flagstones embedded in the mossy grove floor
  const stonePaving = [
    [-0.92, 0.04, 0.75, 0.38],
    [0.98, 0.04, 0.70, 0.42],
    [0.0, 0.05, 1.05, 0.45],
    [-1.08, 0.03, -0.62, 0.34],
    [0.85, 0.03, -0.78, 0.36],
  ];
  for (let s = 0; s < stonePaving.length; s++) {
    const [sx, sy, sz, sr] = stonePaving[s];
    b.part(
      new THREE.CylinderGeometry(sr, sr * 1.08, 0.03, 7),
      stonePaint,
      { at: [sx, sy, sz], rotation: [0, s * 45, 0], name: `flagstone_${s}` },
    );
  }

  // Luminescent Forest Spirit Mushrooms sprouting around the ancient roots
  const shroomPositions = [
    [0.55, 0.04, 0.58],
    [0.48, 0.04, 0.64],
    [0.62, 0.04, 0.52],
    [-0.55, 0.04, 0.58],
    [-0.48, 0.04, 0.64],
    [-0.62, 0.04, 0.52],
    [-0.96, 0.04, 0.05],
    [0.96, 0.04, 0.05],
  ];
  for (let p = 0; p < shroomPositions.length; p++) {
    const [px, py, pz] = shroomPositions[p];
    // Stem
    b.rod([px, py, pz], [px, py + 0.065, pz], 0.012, { color: SHROOM_CREAM, name: `spirit_stem_${p}` });
    // Glowing cap
    const cap = b.part(
      new THREE.ConeGeometry(0.045, 0.04, 8),
      GLOW_GREEN,
      { at: [px, py + 0.08, pz], rotation: [0, 0, 0], name: `spirit_cap_${p}` },
    );
    glow(cap, 2.2);
  }

  return b.root;
}
```