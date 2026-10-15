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
} from "../../../../src/index";
import type { Frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

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
    <path d="M64 124 Q62 70 64 8" stroke="#1a0e05" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path d="M64 82 Q42 70 24 68" stroke="#1a0e05" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    <path d="M64 56 Q86 46 104 44" stroke="#1a0e05" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    <!-- Leaf 1 (Left lower) -->
    <path d="M60 84 Q28 92 10 68 Q24 44 58 72 Z" fill="#143d0d" stroke="#0a1f06" stroke-width="4"/>
    <path d="M56 82 Q30 88 14 68 Q26 48 54 72 Z" fill="#2f7a16"/>
    <path d="M50 80 Q32 82 20 70" stroke="#6cd627" stroke-width="3" stroke-linecap="round" fill="none"/>
    <!-- Leaf 2 (Right middle) -->
    <path d="M66 58 Q102 68 118 46 Q104 22 66 48 Z" fill="#143d0d" stroke="#0a1f06" stroke-width="4"/>
    <path d="M68 56 Q100 64 114 46 Q102 26 68 50 Z" fill="#3c911e"/>
    <path d="M72 54 Q94 56 108 46" stroke="#7be631" stroke-width="3" stroke-linecap="round" fill="none"/>
    <!-- Leaf 3 (Left upper) -->
    <path d="M62 42 Q30 46 18 24 Q36 6 62 32 Z" fill="#143d0d" stroke="#0a1f06" stroke-width="4"/>
    <path d="M60 40 Q32 44 22 24 Q38 10 60 32 Z" fill="#44a61f"/>
    <path d="M56 38 Q38 38 26 24" stroke="#8bf23a" stroke-width="3" stroke-linecap="round" fill="none"/>
    <!-- Leaf 4 (Top terminal) -->
    <path d="M64 32 Q44 16 64 4 Q84 16 64 32 Z" fill="#143d0d" stroke="#0a1f06" stroke-width="4"/>
    <path d="M64 30 Q46 16 64 6 Q82 16 64 30 Z" fill="#58cc2a"/>
    <path d="M64 28 L64 8" stroke="#aeff4e" stroke-width="3.5" stroke-linecap="round"/>
  </svg>`;
  const LEAF_TEX = svg(LEAF_SVG, { size: 256 });

  // Hanging Spanish moss / wild vine tendril
  const VINE_SVG = `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 0 Q18 32 36 64 Q50 96 26 128" stroke="#122e0c" stroke-width="6.5" fill="none" stroke-linecap="round"/>
    <path d="M32 0 Q18 32 36 64 Q50 96 26 128" stroke="#2c691a" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M26 36 Q10 46 16 64" stroke="#2c691a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M36 76 Q50 88 44 104" stroke="#2c691a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <circle cx="16" cy="64" r="5" fill="#58b52e"/>
    <circle cx="44" cy="104" r="5" fill="#58b52e"/>
    <circle cx="26" cy="126" r="5.5" fill="#84f04d"/>
    <circle cx="28" cy="42" r="4.5" fill="#469e20"/>
    <circle cx="40" cy="88" r="5" fill="#469e20"/>
  </svg>`;
  const VINE_TEX = svg(VINE_SVG, { size: 256 });

  // Druidic sacred glowing rune disc
  const RUNE_SVG = `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="60" fill="#0d1e16" stroke="#163828" stroke-width="5"/>
    <path d="M64 14 A50 50 0 1 1 24 96 A42 42 0 1 0 54 24 A48 48 0 0 1 64 14 Z" fill="#13825a"/>
    <path d="M64 18 A46 46 0 1 1 28 92 A38 38 0 1 0 56 28 A44 44 0 0 1 64 18 Z" fill="#2dd9a0"/>
    <path d="M64 64 A12 12 0 0 1 76 52 A20 20 0 0 1 84 72 A28 28 0 0 1 56 92 A36 36 0 0 1 28 64" fill="none" stroke="#7affcc" stroke-width="6.5" stroke-linecap="round"/>
    <circle cx="64" cy="64" r="8.5" fill="#f0fff9"/>
    <circle cx="36" cy="44" r="4.5" fill="#2dd9a0"/>
    <circle cx="92" cy="78" r="4.5" fill="#2dd9a0"/>
  </svg>`;
  const RUNE_TEX = svg(RUNE_SVG, { size: 256 });

  // Glowing Druid Spirit Eye
  const EYE_SVG = `<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
    <circle cx="48" cy="48" r="46" fill="#05140e"/>
    <circle cx="48" cy="48" r="38" fill="#09422a"/>
    <circle cx="48" cy="48" r="28" fill="#129c64"/>
    <circle cx="48" cy="48" r="18" fill="#3ef59c"/>
    <circle cx="48" cy="48" r="8" fill="#f5fffa"/>
    <path d="M48 6 L48 90 M6 48 L90 48" stroke="#94ffd0" stroke-width="3.5" stroke-linecap="round"/>
  </svg>`;
  const EYE_TEX = svg(EYE_SVG, { size: 128 });

  // Lantern lattice glass window
  const LANTERN_GLASS_SVG = `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <rect width="128" height="128" fill="#ffb833"/>
    <rect x="8" y="8" width="112" height="112" fill="#ffe285"/>
    <circle cx="64" cy="64" r="38" fill="#fff9db"/>
    <path d="M64 8 L64 120 M8 64 L120 64 M24 24 L104 104 M24 104 L104 24" stroke="#2b1a0d" stroke-width="6"/>
    <rect x="4" y="4" width="120" height="120" fill="none" stroke="#2b1a0d" stroke-width="8"/>
  </svg>`;
  const LANTERN_GLASS_TEX = svg(LANTERN_GLASS_SVG, { size: 128 });

  // ---------------------------------------------------------------------------
  // 2. Custom Hand-Painted Shaders (Paints)
  // ---------------------------------------------------------------------------

  const BARK_DEEP = "#1e1107";
  const BARK_MID = "#482b16";
  const BARK_LIGHT = "#7a4c28";
  const MOSS_DEEP = "#183b12";
  const MOSS_MID = "#36751c";
  const MOSS_LIGHT = "#74b82e";

  // Warcraft Treant Bark: sculptural deep grain + amber wood facets + lush moss on top surfaces
  const barkPaint = paint((p, n) => {
    const grainCoord = new THREE.Vector3(p.x * 4.5, p.y * 11.0, p.z * 4.5);
    const g = noise(grainCoord, 0.32, 17);
    const roughCoord = new THREE.Vector3(p.x * 7.0, p.y * 2.8, p.z * 7.0);
    const r = noise(roughCoord, 0.18, 59);

    let c = mix(BARK_DEEP, BARK_MID, smoothstep(0.18, 0.72, g));
    c = mix(c, BARK_LIGHT, smoothstep(0.48, 0.86, r) * 0.65);

    // Warm top-down sunlit lighting
    const sun = smoothstep(-0.35, 0.85, n.y);
    c = [c[0] * (0.65 + 0.45 * sun), c[1] * (0.65 + 0.45 * sun), c[2] * (0.6 + 0.4 * sun)];

    // Vibrant moss growth on upward facing burls, shoulders and limbs
    const mNoise = noise(new THREE.Vector3(p.x * 3.5, p.y * 3.5, p.z * 3.5), 0.2, 103);
    const mossCoverage = smoothstep(0.20, 0.70, n.y + (mNoise - 0.5) * 0.75);
    if (mossCoverage > 0.02) {
      const mossColor = mix(MOSS_DEEP, mix(MOSS_MID, MOSS_LIGHT, mNoise), smoothstep(0.3, 0.85, n.y));
      c = mix(c, mossColor, mossCoverage * 0.94);
    }
    return c;
  });

  // Ancient weathered Granite stone
  const STONE_DARK = "#2e3236";
  const STONE_MID = "#4c5259";
  const STONE_LIGHT = "#727982";
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
  const SOIL_DARK = "#1a130c";
  const SOIL_MID = "#2e2014";
  const TURF_GREEN = "#234a13";
  const TURF_LIGHT = "#4a821e";
  const groundPaint = paint((p, n) => {
    const gNoise = noise(new THREE.Vector3(p.x * 2.2, 0, p.z * 2.2), 0.45, 88);
    const patchNoise = noise(new THREE.Vector3(p.x * 5.0, 0, p.z * 5.0), 0.16, 142);
    let c = mix(SOIL_DARK, SOIL_MID, gNoise);
    const grassFactor = smoothstep(0.35, 0.65, patchNoise + 0.2 * n.y);
    c = mix(c, mix(TURF_GREEN, TURF_LIGHT, gNoise), grassFactor);
    return c;
  });

  // Flat accent colours
  const DARK_WOOD = "#140b05";
  const HEARTWOOD = "#8f5728";
  const SHROOM_ORANGE = "#ba4e1c";
  const SHROOM_CREAM = "#faebd2";
  const GLOW_GREEN = "#2effa8";
  const GLOW_EMERALD = "#16e094";
  const GLOW_GOLD = "#ffba33";
  const MOONWELL_WATER = "#1ae6b8";

  // ---------------------------------------------------------------------------
  // 3. Skeleton Hierarchy (Rest Pose for Warcraft Treant)
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", { at: [0, 1.45, -0.05], role: "spine" });
  const spine1 = b.joint("spine1", { parent: hips, at: [0, 1.82, -0.06], role: "spine" });
  const spine2 = b.joint("spine2", { parent: spine1, at: [0, 2.22, -0.04], role: "spine" });
  const chest = b.joint("chest", { parent: spine2, at: [0, 2.62, 0.02], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 2.95, 0.10], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 3.20, 0.16], role: "head" });
  // Jaw joint hinged to swing open
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.90, 0.25], aim: [0, 2.65, 0.52], role: "jaw" });

  // Antler crown roots on head
  const antlerL1 = b.joint("antlerL1", { parent: head, at: [0.32, 3.46, 0.10], dir: [0.4, 0.8, -0.15], role: "fan" });
  const antlerL2 = b.joint("antlerL2", { parent: antlerL1, at: [0.60, 3.88, 0.02], dir: [0.45, 0.6, 0.15], role: "fan" });
  const antlerR1 = b.joint("antlerR1", { parent: head, at: [-0.32, 3.46, 0.10], dir: [-0.4, 0.8, -0.15], role: "fan" });
  const antlerR2 = b.joint("antlerR2", { parent: antlerR1, at: [-0.60, 3.88, 0.02], dir: [-0.45, 0.6, 0.15], role: "fan" });

  // Left Arm (+X)
  const shoulderL = b.joint("shoulderL", { parent: chest, at: [0.85, 2.68, 0.02], role: "arm" });
  const elbowL = b.joint("elbowL", { parent: shoulderL, at: [1.35, 2.05, -0.05], role: "arm" });
  const wristL = b.joint("wristL", { parent: elbowL, at: [1.60, 1.30, 0.14], role: "arm" });

  // Left Fingers
  const thumbL1 = b.joint("thumbL1", { parent: wristL, at: [1.50, 1.20, 0.26], role: "digit" });
  const thumbL2 = b.joint("thumbL2", { parent: thumbL1, at: [1.44, 1.05, 0.35], role: "digit" });
  const indexL1 = b.joint("indexL1", { parent: wristL, at: [1.64, 1.16, 0.26], role: "digit" });
  const indexL2 = b.joint("indexL2", { parent: indexL1, at: [1.68, 0.98, 0.33], role: "digit" });
  const midL1 = b.joint("midL1", { parent: wristL, at: [1.72, 1.14, 0.14], role: "digit" });
  const midL2 = b.joint("midL2", { parent: midL1, at: [1.78, 0.94, 0.18], role: "digit" });
  const ringL1 = b.joint("ringL1", { parent: wristL, at: [1.70, 1.16, -0.02], role: "digit" });
  const ringL2 = b.joint("ringL2", { parent: ringL1, at: [1.74, 0.98, -0.05], role: "digit" });

  // Right Arm (-X)
  const shoulderR = b.joint("shoulderR", { parent: chest, at: [-0.85, 2.68, 0.02], role: "arm" });
  const elbowR = b.joint("elbowR", { parent: shoulderR, at: [-1.35, 2.05, -0.05], role: "arm" });
  const wristR = b.joint("wristR", { parent: elbowR, at: [-1.60, 1.30, 0.14], role: "arm" });

  // Right Fingers
  const thumbR1 = b.joint("thumbR1", { parent: wristR, at: [-1.50, 1.20, 0.26], role: "digit" });
  const thumbR2 = b.joint("thumbR2", { parent: thumbR1, at: [-1.44, 1.05, 0.35], role: "digit" });
  const indexR1 = b.joint("indexR1", { parent: wristR, at: [-1.64, 1.16, 0.26], role: "digit" });
  const indexR2 = b.joint("indexR2", { parent: indexR1, at: [-1.68, 0.98, 0.33], role: "digit" });
  const midR1 = b.joint("midR1", { parent: wristR, at: [-1.72, 1.14, 0.14], role: "digit" });
  const midR2 = b.joint("midR2", { parent: midR1, at: [-1.78, 0.94, 0.18], role: "digit" });
  const ringR1 = b.joint("ringR1", { parent: wristR, at: [-1.70, 1.16, -0.02], role: "digit" });
  const ringR2 = b.joint("ringR2", { parent: ringR1, at: [-1.74, 0.98, -0.05], role: "digit" });

  // Legs: Massive root boles splitting at ground into sprawling buttress roots
  // Left Leg (+X)
  const hipL = b.joint("hipL", { parent: hips, at: [0.55, 1.40, -0.04], role: "leg" });
  const kneeL = b.joint("kneeL", { parent: hipL, at: [0.65, 0.82, -0.07], role: "leg" });
  const ankleL = b.joint("ankleL", { parent: kneeL, at: [0.72, 0.34, 0.04], role: "leg" });

  // Right Leg (-X)
  const hipR = b.joint("hipR", { parent: hips, at: [-0.55, 1.40, -0.04], role: "leg" });
  const kneeR = b.joint("kneeR", { parent: hipR, at: [-0.65, 0.82, -0.07], role: "leg" });
  const ankleR = b.joint("ankleR", { parent: kneeR, at: [-0.72, 0.34, 0.04], role: "leg" });

  // ---------------------------------------------------------------------------
  // 4. Trunk Torso & Open Druidic Heartwood Sanctuary
  // ---------------------------------------------------------------------------

  // Torso Loft with front setback between y=2.0 and y=2.7 so the hollow is proud & visible
  b.loft(
    [
      { at: [0, 1.45, -0.06], w: 1.24, h: 1.05 },
      { at: [0, 1.82, -0.08], w: 1.12, h: 0.94 },
      { at: [0, 2.22, -0.10], w: 1.34, h: 0.88 }, // recessed front at chest level
      { at: [0, 2.65, -0.05], w: 1.54, h: 0.98 },
      { at: [0, 2.95, 0.08], w: 0.98, h: 0.84 },
    ],
    {
      bone: [hips, spine1, spine2, chest, neck],
      color: barkPaint,
      name: "trunk_torso",
    },
  );

  // Deep dark chest cavern cavity (Heartwood Sanctuary)
  b.part(
    new THREE.CylinderGeometry(0.36, 0.30, 0.65, 12, 1, false, 0, Math.PI),
    DARK_WOOD,
    { bone: chest, at: [0, 2.36, 0.28], rotation: [0, 90, 0], name: "heart_cavern" },
  );

  // The Living Heartwood: Radiant cluster of sacred druidic spirit crystals
  const coreCrystal = b.part(
    new THREE.DodecahedronGeometry(0.16, 0),
    GLOW_GREEN,
    { bone: chest, at: [0, 2.36, 0.36], name: "spirit_core" },
  );
  glow(coreCrystal, 3.0);

  const satCrystal1 = b.part(
    new THREE.OctahedronGeometry(0.10, 0),
    GLOW_GREEN,
    { bone: chest, at: [0.12, 2.48, 0.40], rotation: [20, 30, 0], name: "spirit_sat1" },
  );
  glow(satCrystal1, 2.6);

  const satCrystal2 = b.part(
    new THREE.OctahedronGeometry(0.09, 0),
    GLOW_GREEN,
    { bone: chest, at: [-0.11, 2.25, 0.39], rotation: [-15, 45, 10], name: "spirit_sat2" },
  );
  glow(satCrystal2, 2.6);

  const satCrystal3 = b.part(
    new THREE.OctahedronGeometry(0.08, 0),
    GLOW_EMERALD,
    { bone: chest, at: [0.0, 2.18, 0.42], rotation: [45, 0, 25], name: "spirit_sat3" },
  );
  glow(satCrystal3, 2.4);

  // Arched wooden rib-bars framing the heartwood opening
  for (const s of [1, -1]) {
    for (let r = 0; r < 4; r++) {
      const y0 = 2.12 + r * 0.16;
      const ribCurve = bezier(
        [s * 0.54, y0, 0.32],
        [s * 0.42, y0 + 0.05, 0.56],
        [s * 0.18, y0 - 0.02, 0.52],
      );
      b.sweep(ribCurve, [0.065, 0.038], {
        bone: chest,
        color: barkPaint,
        caps: "round",
        name: `chest_rib_${s}_${r}`,
      });
    }
  }

  // Large ancient druidic rune medallion right above chest hollow
  b.part(
    new THREE.CylinderGeometry(0.25, 0.25, 0.05, 16),
    stonePaint,
    { bone: chest, at: [0, 2.76, 0.48], rotation: [74, 0, 0], name: "chest_rune_backing" },
  );
  const runePlate = b.part(
    new THREE.CircleGeometry(0.22, 16),
    "#ffffff",
    {
      bone: chest,
      at: [0, 2.765, 0.51],
      rotation: [74, 0, 0],
      texture: RUNE_TEX,
      name: "chest_rune_glow",
    },
  );
  glow(runePlate, 2.2);

  // Bracket mushrooms (shelf fungi) cascading down the right flank
  for (let m = 0; m < 5; m++) {
    const y = 1.85 + m * 0.16;
    const rad = 0.20 - m * 0.025;
    b.part(
      new THREE.CylinderGeometry(rad, rad * 0.85, 0.032, 8, 1, false, 0, Math.PI),
      SHROOM_ORANGE,
      {
        bone: spine2,
        at: [-0.62, y, 0.14 + m * 0.04],
        rotation: [15, -45, 10],
        name: `shelf_shroom_${m}`,
      },
    );
    b.part(
      new THREE.TorusGeometry(rad, 0.014, 6, 8, Math.PI),
      SHROOM_CREAM,
      {
        bone: spine2,
        at: [-0.62, y + 0.007, 0.14 + m * 0.04],
        rotation: [15, -45, 10],
        name: `shelf_shroom_rim_${m}`,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // 5. Head, Sculpted Face & Grand Root Beard
  // ---------------------------------------------------------------------------

  // Cranium trunk block
  b.frustumBox(
    [0, 3.00, 0.12],
    [0, 3.48, 0.20],
    [0.92, 0.76],
    [0.72, 0.60],
    { bone: head, color: barkPaint, name: "head_block" },
  );

  // Prominent moss-capped wooden brow shelf
  b.frustumBox(
    [0, 3.32, 0.26],
    [0, 3.44, 0.56],
    [0.96, 0.36],
    [0.86, 0.28],
    { bone: head, color: barkPaint, name: "brow_shelf" },
  );

  // Deep carved eye sockets with glowing wisp eyes
  for (const s of [1, -1]) {
    // Dark hollow socket
    b.part(
      new THREE.SphereGeometry(0.14, 8, 8),
      DARK_WOOD,
      {
        bone: head,
        at: [s * 0.24, 3.22, 0.44],
        scale: [1.1, 0.8, 0.6],
        name: `eye_socket_${s}`,
      },
    );

    // Inner glowing wisp orb
    const eyeOrb = b.part(
      new THREE.SphereGeometry(0.08, 10, 8),
      GLOW_EMERALD,
      { bone: head, at: [s * 0.24, 3.22, 0.47], name: `eye_orb_${s}` },
    );
    glow(eyeOrb, 3.0);

    // Front lens with rune eye detail
    b.part(
      new THREE.PlaneGeometry(0.16, 0.16),
      "#ffffff",
      {
        bone: head,
        at: [s * 0.24, 3.22, 0.52],
        texture: EYE_TEX,
        name: `eye_lens_${s}`,
      },
    );

    // Sculpted woody cheek burl
    b.part(
      new THREE.SphereGeometry(0.15, 8, 8),
      barkPaint,
      {
        bone: head,
        at: [s * 0.38, 3.06, 0.42],
        scale: [1.0, 0.8, 1.1],
        name: `cheek_burl_${s}`,
      },
    );
  }

  // Knotted wooden nose bridge & bulb
  const noseCurve = bezier([0, 3.32, 0.56], [0, 3.10, 0.68], [0, 2.92, 0.58]);
  b.sweep(noseCurve, [0.095, 0.065], {
    bone: head,
    color: barkPaint,
    caps: "round",
    name: "nose_ridge",
  });
  b.part(
    new THREE.SphereGeometry(0.10, 8, 8),
    barkPaint,
    { bone: head, at: [0, 2.94, 0.59], scale: [1.2, 0.9, 1.0], name: "nose_bulb" },
  );

  // Distinct Articulated Jaw Block
  b.frustumBox(
    [0, 2.90, 0.28],
    [0, 2.68, 0.48],
    [0.64, 0.44],
    [0.48, 0.34],
    { bone: jaw, color: barkPaint, name: "jaw_base" },
  );

  // Mouth cavity hollow
  b.part(
    new THREE.BoxGeometry(0.38, 0.14, 0.28),
    DARK_WOOD,
    { bone: jaw, at: [0, 2.88, 0.38], name: "mouth_cavity" },
  );

  // Luminescent spirit glow inside mouth
  const mouthGlow = b.part(
    new THREE.SphereGeometry(0.10, 6, 4),
    GLOW_EMERALD,
    { bone: jaw, at: [0, 2.88, 0.36], scale: [1.8, 0.4, 1.0], name: "mouth_glow" },
  );
  glow(mouthGlow, 2.0);

  // Magnificent Grand Root Beard cascading from the jaw over the upper chest
  const beardTendrilConfigs = [
    [0.0, 2.68, 0.52, 0.85, 0.055],
    [0.10, 2.70, 0.50, 0.75, 0.050],
    [-0.10, 2.70, 0.50, 0.75, 0.050],
    [0.20, 2.72, 0.46, 0.62, 0.046],
    [-0.20, 2.72, 0.46, 0.62, 0.046],
    [0.28, 2.76, 0.40, 0.50, 0.042],
    [-0.28, 2.76, 0.40, 0.50, 0.042],
    [0.05, 2.65, 0.48, 0.78, 0.048],
    [-0.05, 2.65, 0.48, 0.78, 0.048],
  ];
  for (let i = 0; i < beardTendrilConfigs.length; i++) {
    const [bx, by, bz, len, r] = beardTendrilConfigs[i];
    const tendril = bezier(
      [bx, by, bz],
      [bx * 1.18 + (i % 2 === 0 ? 0.04 : -0.04), by - len * 0.5, bz + 0.06],
      [bx * 0.85, by - len, bz + 0.02],
    );
    b.sweep(tendril, [r, 0.010], {
      bone: jaw,
      color: barkPaint,
      caps: { start: "round", end: "point" },
      name: `beard_root_${i}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 6. Crown Antlers, Canopy Foliage & Back Boughs
  // ---------------------------------------------------------------------------

  // Left Great Antler Bough
  const antlerPathL = catmull([
    [0.28, 3.42, 0.16],
    [0.46, 3.75, 0.08],
    [0.68, 4.05, -0.04],
    [0.85, 4.35, -0.16],
  ]);
  b.sweep(antlerPathL, [0.14, 0.045], { bone: antlerL1, color: barkPaint, caps: "point", name: "antler_main_L" });

  // Left Antler Forks
  const forkL1 = bezier([0.46, 3.75, 0.08], [0.60, 3.96, 0.24], [0.68, 4.18, 0.30]);
  b.sweep(forkL1, [0.075, 0.022], { bone: antlerL2, color: barkPaint, caps: "point", name: "antler_forkL1" });

  const forkL2 = bezier([0.58, 3.90, 0.02], [0.84, 4.02, 0.08], [1.02, 4.15, 0.02]);
  b.sweep(forkL2, [0.065, 0.02], { bone: antlerL2, color: barkPaint, caps: "point", name: "antler_forkL2" });

  const forkL3 = bezier([0.68, 4.05, -0.04], [0.78, 4.22, -0.24], [0.84, 4.42, -0.35]);
  b.sweep(forkL3, [0.06, 0.02], { bone: antlerL2, color: barkPaint, caps: "point", name: "antler_forkL3" });

  // Right Great Antler Bough
  const antlerPathR = catmull([
    [-0.28, 3.42, 0.16],
    [-0.46, 3.75, 0.08],
    [-0.68, 4.05, -0.04],
    [-0.85, 4.35, -0.16],
  ]);
  b.sweep(antlerPathR, [0.14, 0.045], { bone: antlerR1, color: barkPaint, caps: "point", name: "antler_main_R" });

  // Right Antler Forks
  const forkR1 = bezier([-0.46, 3.75, 0.08], [-0.60, 3.96, 0.24], [-0.68, 4.18, 0.30]);
  b.sweep(forkR1, [0.075, 0.022], { bone: antlerR2, color: barkPaint, caps: "point", name: "antler_forkR1" });

  const forkR2 = bezier([-0.58, 3.90, 0.02], [-0.84, 4.02, 0.08], [-1.02, 4.15, 0.02]);
  b.sweep(forkR2, [0.065, 0.02], { bone: antlerR2, color: barkPaint, caps: "point", name: "antler_forkR2" });

  const forkR3 = bezier([-0.68, 4.05, -0.04], [-0.78, 4.22, -0.24], [-0.84, 4.42, -0.35]);
  b.sweep(forkR3, [0.06, 0.02], { bone: antlerR2, color: barkPaint, caps: "point", name: "antler_forkR3" });

  // Crane branch jutting forward from Right Antler Fork to suspend the lantern
  const craneBranch = bezier([-0.84, 4.02, 0.08], [-1.00, 4.08, 0.25], [-1.08, 4.10, 0.38]);
  b.sweep(craneBranch, [0.055, 0.025], { bone: antlerR2, color: barkPaint, caps: "round", name: "lantern_crane" });

  // Back Canopy Sturdy Boughs
  const backBranch1 = bezier([0, 2.80, -0.44], [0, 3.20, -0.78], [0, 3.58, -1.02]);
  b.sweep(backBranch1, [0.13, 0.04], { bone: chest, color: barkPaint, caps: "point", name: "back_branch1" });

  const backBranch2 = bezier([0.38, 2.76, -0.40], [0.60, 3.12, -0.68], [0.78, 3.42, -0.88]);
  b.sweep(backBranch2, [0.10, 0.035], { bone: chest, color: barkPaint, caps: "point", name: "back_branch2" });

  const backBranch3 = bezier([-0.38, 2.76, -0.40], [-0.60, 3.12, -0.68], [-0.78, 3.42, -0.88]);
  b.sweep(backBranch3, [0.10, 0.035], { bone: chest, color: barkPaint, caps: "point", name: "back_branch3" });

  // Rich Leaf Canopy Cards across antler tips and branches
  const leafFrames: Frame[] = [
    // Left antler foliage
    frame([0.85, 4.35, -0.16], [0, 1, 0]),
    frame([0.68, 4.18, 0.30], [0.3, 0.8, 0.5]),
    frame([1.02, 4.15, 0.02], [0.8, 0.5, 0]),
    frame([0.84, 4.42, -0.35], [0, 0.6, -0.8]),
    frame([0.56, 3.92, 0.14], [0.2, 0.9, 0]),
    frame([0.72, 4.22, 0.08], [0.4, 0.8, 0.2]),
    // Right antler foliage
    frame([-0.85, 4.35, -0.16], [0, 1, 0]),
    frame([-0.68, 4.18, 0.30], [-0.3, 0.8, 0.5]),
    frame([-1.02, 4.15, 0.02], [-0.8, 0.5, 0]),
    frame([-0.84, 4.42, -0.35], [0, 0.6, -0.8]),
    frame([-0.56, 3.92, 0.14], [-0.2, 0.9, 0]),
    frame([-0.72, 4.22, 0.08], [-0.4, 0.8, 0.2]),
    // Back branches foliage
    frame([0, 3.58, -1.02], [0, 0.7, -0.7]),
    frame([0.78, 3.42, -0.88], [0.5, 0.7, -0.5]),
    frame([-0.78, 3.42, -0.88], [-0.5, 0.7, -0.5]),
    frame([0.40, 3.28, -0.76], [0.2, 0.9, -0.3]),
    frame([-0.40, 3.28, -0.76], [-0.2, 0.9, -0.3]),
    frame([0.0, 3.35, -0.82], [0, 1, -0.2]),
  ];
  b.cards(leafFrames, LEAF_TEX, {
    size: [0.48, 0.56],
    bend: 28,
    vary: 0.25,
    cross: true,
    rng: rng(42),
    name: "canopy_leaves",
  });

  // Hanging Willow / Spanish Moss Vines
  const vineFrames: Frame[] = [
    frame([0.60, 3.96, 0.04], [0, 1, 0]),
    frame([0.88, 4.05, 0.06], [0, 1, 0]),
    frame([-0.60, 3.96, 0.04], [0, 1, 0]),
    frame([-0.88, 4.05, 0.06], [0, 1, 0]),
    frame([0.50, 3.10, -0.60], [0, 1, 0]),
    frame([-0.50, 3.10, -0.60], [0, 1, 0]),
    frame([0.0, 3.30, -0.90], [0, 1, 0]),
    frame([0.18, 2.70, 0.42], [0, 1, 0]),
    frame([-0.18, 2.70, 0.42], [0, 1, 0]),
  ];
  b.cards(vineFrames, VINE_TEX, {
    size: [0.20, 0.68],
    lean: 180, // Hangs straight down
    flow: [0, 0, 1],
    vary: 0.22,
    rng: rng(88),
    name: "hanging_vines",
  });

  // ---------------------------------------------------------------------------
  // 7. Hanging Spirit Lantern (Securely Hanging from Crane Branch)
  // ---------------------------------------------------------------------------

  const lanternX = -1.08;
  const lanternZ = 0.38;

  // Interlocked Iron Ring Chain
  for (let c = 0; c < 5; c++) {
    const yLink = 4.02 - c * 0.09;
    b.part(
      new THREE.TorusGeometry(0.025, 0.007, 6, 8),
      DARK_WOOD,
      {
        bone: antlerR2,
        at: [lanternX, yLink, lanternZ],
        rotation: [0, c % 2 === 0 ? 0 : 90, 0],
        name: `lantern_chain_${c}`,
      },
    );
  }

  // Lantern Hexagonal Carved Wooden Cap
  b.part(
    new THREE.ConeGeometry(0.14, 0.10, 6),
    DARK_WOOD,
    { bone: antlerR2, at: [lanternX, 3.52, lanternZ], rotation: [0, 0, 0], name: "lantern_cap" },
  );

  // Lantern Hexagonal Base
  b.part(
    new THREE.ConeGeometry(0.13, 0.08, 6),
    DARK_WOOD,
    { bone: antlerR2, at: [lanternX, 3.28, lanternZ], rotation: [180, 0, 0], name: "lantern_base" },
  );

  // 6 Wooden Struts
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const sx = lanternX + 0.10 * Math.cos(a);
    const sz = lanternZ + 0.10 * Math.sin(a);
    b.rod(
      [sx, 3.52, sz],
      [sx, 3.28, sz],
      0.012,
      { bone: antlerR2, color: DARK_WOOD, name: `lantern_strut_${i}` },
    );
  }

  // Glowing Spirit Glass Cylinder
  const lanternGlass = b.part(
    new THREE.CylinderGeometry(0.09, 0.09, 0.22, 6, 1, true),
    "#ffffff",
    {
      bone: antlerR2,
      at: [lanternX, 3.40, lanternZ],
      texture: LANTERN_GLASS_TEX,
      name: "lantern_glass",
    },
  );
  glow(lanternGlass, 2.2);

  // Radiant Golden Forest Wisp inside lantern
  const lanternWisp = b.part(
    new THREE.SphereGeometry(0.06, 8, 8),
    GLOW_GOLD,
    { bone: antlerR2, at: [lanternX, 3.40, lanternZ], name: "lantern_wisp" },
  );
  glow(lanternWisp, 3.0);

  // ---------------------------------------------------------------------------
  // 8. Massive Wooden Arms, Claws & Shoulder Dolmen Runestones
  // ---------------------------------------------------------------------------

  // Left Arm (+X)
  // Massive Shoulder burl node
  b.part(
    new THREE.SphereGeometry(0.32, 10, 8),
    barkPaint,
    { bone: shoulderL, at: [0.85, 2.68, 0.02], scale: [1.15, 1.0, 1.25], name: "shoulder_node_L" },
  );

  // Ancient Druid Rune Dolmen strapped to Left Shoulder
  b.frustumBox(
    [0.72, 2.82, 0.00],
    [1.06, 2.96, 0.05],
    [0.38, 0.20],
    [0.30, 0.16],
    { bone: shoulderL, color: stonePaint, name: "shoulder_monolith_L" },
  );
  const shoulderRuneL = b.part(
    new THREE.PlaneGeometry(0.20, 0.20),
    "#ffffff",
    {
      bone: shoulderL,
      at: [0.89, 2.98, 0.08],
      rotation: [-60, 40, -10],
      texture: RUNE_TEX,
      name: "shoulder_rune_L",
    },
  );
  glow(shoulderRuneL, 2.2);

  // Left Upper Arm sweep
  const upperArmL = catmull([
    [0.85, 2.68, 0.02],
    [1.12, 2.38, -0.02],
    [1.35, 2.05, -0.05],
  ]);
  b.sweep(upperArmL, [0.26, 0.21], { bone: shoulderL, color: barkPaint, name: "upper_arm_L" });

  // Elbow burl node
  b.part(
    new THREE.SphereGeometry(0.24, 8, 8),
    barkPaint,
    { bone: elbowL, at: [1.35, 2.05, -0.05], name: "elbow_node_L" },
  );

  // Left Forearm sweep (widening heavily towards wrist)
  const foreArmL = catmull([
    [1.35, 2.05, -0.05],
    [1.48, 1.68, 0.05],
    [1.60, 1.30, 0.14],
  ]);
  b.sweep(foreArmL, (t) => 0.21 + 0.09 * t, { bone: elbowL, color: barkPaint, name: "forearm_L" });

  // Wrist heavy bark collar
  b.part(
    new THREE.CylinderGeometry(0.28, 0.30, 0.14, 10),
    barkPaint,
    { bone: wristL, at: [1.60, 1.30, 0.14], dir: [0.2, -0.9, 0.2], name: "wrist_collar_L" },
  );

  // Hand knuckle palm block
  b.frustumBox(
    [1.60, 1.30, 0.14],
    [1.66, 1.10, 0.20],
    [0.40, 0.22],
    [0.34, 0.18],
    { bone: wristL, color: barkPaint, name: "palm_L" },
  );

  // Left Fingers & Thumb (Chunky wooden branch digits with leaf sprouts)
  // Thumb
  b.capsule([1.50, 1.20, 0.26], [1.44, 1.05, 0.35], 0.065, { bone: thumbL1, color: barkPaint, name: "thumb_p_L" });
  b.spike([1.44, 1.05, 0.35], [1.38, 0.90, 0.42], 0.18, 0.055, { bone: thumbL2, color: HEARTWOOD, name: "thumb_d_L" });
  // Index
  b.capsule([1.64, 1.16, 0.26], [1.68, 0.98, 0.33], 0.065, { bone: indexL1, color: barkPaint, name: "index_p_L" });
  b.spike([1.68, 0.98, 0.33], [1.72, 0.82, 0.38], 0.20, 0.055, { bone: indexL2, color: HEARTWOOD, name: "index_d_L" });
  // Middle
  b.capsule([1.72, 1.14, 0.14], [1.78, 0.94, 0.18], 0.068, { bone: midL1, color: barkPaint, name: "mid_p_L" });
  b.spike([1.78, 0.94, 0.18], [1.84, 0.78, 0.22], 0.22, 0.058, { bone: midL2, color: HEARTWOOD, name: "mid_d_L" });
  // Ring
  b.capsule([1.70, 1.16, -0.02], [1.74, 0.98, -0.05], 0.062, { bone: ringL1, color: barkPaint, name: "ring_p_L" });
  b.spike([1.74, 0.98, -0.05], [1.78, 0.84, -0.08], 0.19, 0.052, { bone: ringL2, color: HEARTWOOD, name: "ring_d_L" });

  // Right Arm (-X)
  // Shoulder burl node
  b.part(
    new THREE.SphereGeometry(0.32, 10, 8),
    barkPaint,
    { bone: shoulderR, at: [-0.85, 2.68, 0.02], scale: [1.15, 1.0, 1.25], name: "shoulder_node_R" },
  );

  // Ancient Druid Rune Dolmen strapped to Right Shoulder
  b.frustumBox(
    [-0.72, 2.82, 0.00],
    [-1.06, 2.96, 0.05],
    [0.38, 0.20],
    [0.30, 0.16],
    { bone: shoulderR, color: stonePaint, name: "shoulder_monolith_R" },
  );
  const shoulderRuneR = b.part(
    new THREE.PlaneGeometry(0.20, 0.20),
    "#ffffff",
    {
      bone: shoulderR,
      at: [-0.89, 2.98, 0.08],
      rotation: [-60, -40, 10],
      texture: RUNE_TEX,
      name: "shoulder_rune_R",
    },
  );
  glow(shoulderRuneR, 2.2);

  // Right Upper Arm sweep
  const upperArmR = catmull([
    [-0.85, 2.68, 0.02],
    [-1.12, 2.38, -0.02],
    [-1.35, 2.05, -0.05],
  ]);
  b.sweep(upperArmR, [0.26, 0.21], { bone: shoulderR, color: barkPaint, name: "upper_arm_R" });

  // Elbow burl node
  b.part(
    new THREE.SphereGeometry(0.24, 8, 8),
    barkPaint,
    { bone: elbowR, at: [-1.35, 2.05, -0.05], name: "elbow_node_R" },
  );

  // Right Forearm sweep
  const foreArmR = catmull([
    [-1.35, 2.05, -0.05],
    [-1.48, 1.68, 0.05],
    [-1.60, 1.30, 0.14],
  ]);
  b.sweep(foreArmR, (t) => 0.21 + 0.09 * t, { bone: elbowR, color: barkPaint, name: "forearm_R" });

  // Wrist heavy bark collar
  b.part(
    new THREE.CylinderGeometry(0.28, 0.30, 0.14, 10),
    barkPaint,
    { bone: wristR, at: [-1.60, 1.30, 0.14], dir: [-0.2, -0.9, 0.2], name: "wrist_collar_R" },
  );

  // Hand knuckle palm block
  b.frustumBox(
    [-1.60, 1.30, 0.14],
    [-1.66, 1.10, 0.20],
    [0.40, 0.22],
    [0.34, 0.18],
    { bone: wristR, color: barkPaint, name: "palm_R" },
  );

  // Right Fingers & Thumb
  // Thumb
  b.capsule([-1.50, 1.20, 0.26], [-1.44, 1.05, 0.35], 0.065, { bone: thumbR1, color: barkPaint, name: "thumb_p_R" });
  b.spike([-1.44, 1.05, 0.35], [-1.38, 0.90, 0.42], 0.18, 0.055, { bone: thumbR2, color: HEARTWOOD, name: "thumb_d_R" });
  // Index
  b.capsule([-1.64, 1.16, 0.26], [-1.68, 0.98, 0.33], 0.065, { bone: indexR1, color: barkPaint, name: "index_p_R" });
  b.spike([-1.68, 0.98, 0.33], [-1.72, 0.82, 0.38], 0.20, 0.055, { bone: indexR2, color: HEARTWOOD, name: "index_d_R" });
  // Middle
  b.capsule([-1.72, 1.14, 0.14], [-1.78, 0.94, 0.18], 0.068, { bone: midR1, color: barkPaint, name: "mid_p_R" });
  b.spike([-1.78, 0.94, 0.18], [-1.84, 0.78, 0.22], 0.22, 0.058, { bone: midR2, color: HEARTWOOD, name: "mid_d_R" });
  // Ring
  b.capsule([-1.70, 1.16, -0.02], [-1.74, 0.98, -0.05], 0.062, { bone: ringR1, color: barkPaint, name: "ring_p_R" });
  b.spike([-1.74, 0.98, -0.05], [-1.78, 0.84, -0.08], 0.19, 0.052, { bone: ringR2, color: HEARTWOOD, name: "ring_d_R" });

  // ---------------------------------------------------------------------------
  // 9. Massive Trunk Legs & Sprawling Buttress Root Feet (Touching y = 0)
  // ---------------------------------------------------------------------------

  // Left Leg (+X)
  const thighL = catmull([
    [0.55, 1.40, -0.04],
    [0.60, 1.10, -0.06],
    [0.65, 0.82, -0.07],
  ]);
  b.sweep(thighL, [0.32, 0.28], { bone: hipL, color: barkPaint, name: "thigh_L" });

  b.part(
    new THREE.SphereGeometry(0.28, 8, 8),
    barkPaint,
    { bone: kneeL, at: [0.65, 0.82, -0.07], name: "knee_node_L" },
  );

  const shinL = catmull([
    [0.65, 0.82, -0.07],
    [0.68, 0.58, -0.02],
    [0.72, 0.34, 0.04],
  ]);
  b.sweep(shinL, [0.28, 0.38], { bone: kneeL, color: barkPaint, name: "shin_L" });

  // 4 Giant Sprawling Buttress Roots anchoring Left Foot firmly to y = 0.02
  const rootL1 = bezier([0.72, 0.34, 0.04], [0.90, 0.14, 0.32], [1.08, 0.02, 0.56]);
  b.sweep(rootL1, [0.18, 0.06], { bone: ankleL, color: barkPaint, caps: "round", name: "rootL_front_out" });

  const rootL2 = bezier([0.72, 0.34, 0.04], [0.55, 0.14, 0.38], [0.42, 0.02, 0.62]);
  b.sweep(rootL2, [0.17, 0.055], { bone: ankleL, color: barkPaint, caps: "round", name: "rootL_front_in" });

  const rootL3 = bezier([0.72, 0.34, 0.04], [0.88, 0.12, -0.26], [1.05, 0.02, -0.46]);
  b.sweep(rootL3, [0.19, 0.06], { bone: ankleL, color: barkPaint, caps: "round", name: "rootL_rear_brace" });

  const rootL4 = bezier([0.72, 0.34, 0.04], [1.04, 0.12, -0.02], [1.30, 0.02, -0.06]);
  b.sweep(rootL4, [0.17, 0.055], { bone: ankleL, color: barkPaint, caps: "round", name: "rootL_side_anchor" });

  // Right Leg (-X)
  const thighR = catmull([
    [-0.55, 1.40, -0.04],
    [-0.60, 1.10, -0.06],
    [-0.65, 0.82, -0.07],
  ]);
  b.sweep(thighR, [0.32, 0.28], { bone: hipR, color: barkPaint, name: "thigh_R" });

  b.part(
    new THREE.SphereGeometry(0.28, 8, 8),
    barkPaint,
    { bone: kneeR, at: [-0.65, 0.82, -0.07], name: "knee_node_R" },
  );

  const shinR = catmull([
    [-0.65, 0.82, -0.07],
    [-0.68, 0.58, -0.02],
    [-0.72, 0.34, 0.04],
  ]);
  b.sweep(shinR, [0.28, 0.38], { bone: kneeR, color: barkPaint, name: "shin_R" });

  // 4 Giant Sprawling Buttress Roots anchoring Right Foot firmly to y = 0.02
  const rootR1 = bezier([-0.72, 0.34, 0.04], [-0.90, 0.14, 0.32], [-1.08, 0.02, 0.56]);
  b.sweep(rootR1, [0.18, 0.06], { bone: ankleR, color: barkPaint, caps: "round", name: "rootR_front_out" });

  const rootR2 = bezier([-0.72, 0.34, 0.04], [-0.55, 0.14, 0.38], [-0.42, 0.02, 0.62]);
  b.sweep(rootR2, [0.17, 0.055], { bone: ankleR, color: barkPaint, caps: "round", name: "rootR_front_in" });

  const rootR3 = bezier([-0.72, 0.34, 0.04], [-0.88, 0.12, -0.26], [-1.05, 0.02, -0.46]);
  b.sweep(rootR3, [0.19, 0.06], { bone: ankleR, color: barkPaint, caps: "round", name: "rootR_rear_brace" });

  const rootR4 = bezier([-0.72, 0.34, 0.04], [-1.04, 0.12, -0.02], [-1.30, 0.02, -0.06]);
  b.sweep(rootR4, [0.17, 0.055], { bone: ankleR, color: barkPaint, caps: "round", name: "rootR_side_anchor" });

  // ---------------------------------------------------------------------------
  // 10. Sacred Grove Staged Base & Scenery (Resting on y = 0)
  // ---------------------------------------------------------------------------

  // Circular Forest Grove Ground Mound: bottom resting exactly at y = 0.0
  b.lathe(
    [
      [0, 0.0],
      [2.25, 0.0],
      [2.20, 0.025],
      [1.75, 0.055],
      [0, 0.07],
    ],
    { at: [0, 0, 0], segments: 24, color: groundPaint, name: "sacred_grove_base" },
  );

  // Sacred Moonwell pool embedded in the grove
  b.part(
    new THREE.CylinderGeometry(0.55, 0.55, 0.02, 16),
    stonePaint,
    { at: [0.0, 0.055, 1.15], name: "moonwell_basin" },
  );
  const moonwellPool = b.part(
    new THREE.CircleGeometry(0.48, 16),
    MOONWELL_WATER,
    { at: [0.0, 0.068, 1.15], rotation: [-90, 0, 0], name: "moonwell_water" },
  );
  glow(moonwellPool, 2.2);

  // Weathered Druidic Standing Monolith (set behind to frame the silhouette)
  b.frustumBox(
    [0.0, 0.02, -1.55],
    [0.0, 1.35, -1.65],
    [0.55, 0.36],
    [0.32, 0.20],
    { color: stonePaint, name: "standing_monolith" },
  );

  // Carved glowing rune banner on the standing stone
  const monolithRune = b.part(
    new THREE.PlaneGeometry(0.28, 0.60),
    "#ffffff",
    {
      at: [0.0, 0.74, -1.36],
      rotation: [0, 0, 0],
      texture: RUNE_TEX,
      name: "monolith_rune",
    },
  );
  glow(monolithRune, 2.4);

  // Weathered stepping flagstones embedded in the mossy grove floor
  const stonePaving = [
    [-1.02, 0.04, 0.85, 0.42],
    [1.08, 0.04, 0.80, 0.46],
    [-1.20, 0.03, -0.68, 0.38],
    [0.95, 0.03, -0.84, 0.40],
    [0.0, 0.04, -0.75, 0.48],
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
    [0.60, 0.04, 0.65],
    [0.52, 0.04, 0.72],
    [0.68, 0.04, 0.58],
    [-0.60, 0.04, 0.65],
    [-0.52, 0.04, 0.72],
    [-0.68, 0.04, 0.58],
    [-1.10, 0.04, 0.12],
    [1.10, 0.04, 0.12],
  ];
  for (let p = 0; p < shroomPositions.length; p++) {
    const [px, py, pz] = shroomPositions[p];
    // Stem
    b.rod([px, py, pz], [px, py + 0.075, pz], 0.014, { color: SHROOM_CREAM, name: `spirit_stem_${p}` });
    // Glowing cap
    const cap = b.part(
      new THREE.ConeGeometry(0.05, 0.045, 8),
      GLOW_GREEN,
      { at: [px, py + 0.09, pz], rotation: [0, 0, 0], name: `spirit_cap_${p}` },
    );
    glow(cap, 2.5);
  }

  return b.root;
}
