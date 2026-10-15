```ts
import * as THREE from "three";
import { createBuilder, frame, line } from "agentic-3js-builder";
import { aim, DEG, lerp, mid, offset, rng, vec } from "agentic-3js-builder";
import { bezier, catmull, polyline } from "agentic-3js-builder";
import { countershade, gradient, mix, noise, paint, rgb, smoothstep } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { cel, INK, shadowOf } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "Genshin Pyro Phoenix",
  description:
    "A majestic Genshin Impact-style Pyro sovereign phoenix with blazing tiered flame plumage, arched wings spread wide, imperial streamer tail ribbons, gold filigree armor torc and Pyro Vision, proudly perched on an ancient volcanic alchemy dais.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "genshin_pyro_phoenix", detail: 1.0 });

  // ---------------------------------------------------------------------------
  // Color Palette & Materials (Genshin Impact Pyro Aesthetic)
  // ---------------------------------------------------------------------------
  const GOLD_BRIGHT = "#f6c344";
  const GOLD_DEEP = "#8e570a";
  const GOLD_LIGHT = "#fff0a8";
  const CRIMSON = "#d61c24";
  const WINE_SHADOW = "#58081c";
  const SOLAR_ORANGE = "#ff7214";
  const AMBER_GLOW = "#ffb024";
  const CORE_WHITE = "#fffbe4";
  const OBSIDIAN_BASE = "#181420";
  const OBSIDIAN_PURPLE = "#2a2238";
  const RUBY_GEM = "#e01828";

  // Glowing elemental colors (flat colors for glow kit)
  const EMISSIVE_FLAME = "#ff5500";
  const EMISSIVE_CORE = "#fff47a";
  const EMISSIVE_AMBER = "#ffaa14";
  const EMISSIVE_RUBY = "#ff2032";

  // Custom Genshin cel-shaded paints
  const FLAME_PLUMAGE = paint((p, n, _s) => {
    const h = smoothstep(0.4, 1.9, p.y);
    const facing = smoothstep(-0.2, 0.8, n.y * 0.7 + n.z * 0.3);
    const baseCol = mix(WINE_SHADOW, CRIMSON, h * 0.8 + 0.2);
    const midCol = mix(baseCol, SOLAR_ORANGE, facing * 0.75);
    const tipCol = mix(midCol, AMBER_GLOW, smoothstep(0.5, 0.95, facing * 0.6 + h * 0.5));
    return tipCol;
  });

  const BODY_FEATHER = paint((p, n) => {
    const isChest = smoothstep(-0.1, 0.6, n.z) * smoothstep(0.85, 1.45, p.y);
    const under = mix("#ffdcc0", "#fff7ec", isChest);
    const dorsal = mix(WINE_SHADOW, CRIMSON, smoothstep(-0.2, 0.8, n.y));
    return mix(dorsal, under, isChest * 0.85);
  });

  const GOLD_METAL = paint((p, n) => {
    const key = n.dot(new THREE.Vector3(0.35, 0.8, 0.5));
    const glint = smoothstep(0.25, 0.9, key);
    return mix(GOLD_DEEP, mix(GOLD_BRIGHT, GOLD_LIGHT, glint * 0.7), glint);
  });

  const DAIS_STONE = paint((p, n) => {
    const grain = noise(p, 0.12, 17);
    const stone = mix(OBSIDIAN_BASE, OBSIDIAN_PURPLE, grain);
    const topLight = smoothstep(0.2, 0.95, n.y);
    return mix(stone, "#38304a", topLight * 0.4);
  });

  // ---------------------------------------------------------------------------
  // Textures (Anime raptor eyes, Pyro Vision, alchemy runes, flame cards)
  // ---------------------------------------------------------------------------
  const PHOENIX_EYE_TEX = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="irisGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fff8d0"/>
          <stop offset="35%" stop-color="#ffb820"/>
          <stop offset="70%" stop-color="#e63c10"/>
          <stop offset="100%" stop-color="#7a0a18"/>
        </radialGradient>
      </defs>
      <path d="M6 64 Q64 12 122 64 Q64 116 6 64Z" fill="#180c1a" stroke="#ffaa20" stroke-width="3"/>
      <ellipse cx="64" cy="64" rx="38" ry="42" fill="url(#irisGrad)"/>
      <circle cx="64" cy="64" r="32" fill="none" stroke="#fff480" stroke-width="2" stroke-dasharray="3 4"/>
      <ellipse cx="64" cy="64" rx="9" ry="26" fill="#12040e"/>
      <ellipse cx="54" cy="50" rx="7" ry="9" fill="#ffffff" opacity="0.95"/>
      <circle cx="76" cy="74" r="4" fill="#ffffff" opacity="0.85"/>
      <path d="M112 60 Q124 50 126 38" stroke="#ffaa20" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M106 68 Q122 72 124 82" stroke="#ffaa20" stroke-width="3" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  const PYRO_VISION_TEX = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="pyroCore" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stop-color="#fffce0"/>
          <stop offset="25%" stop-color="#ffc830"/>
          <stop offset="60%" stop-color="#ee3812"/>
          <stop offset="100%" stop-color="#600810"/>
        </radialGradient>
      </defs>
      <circle cx="64" cy="64" r="60" fill="#f5be38" stroke="#7e4a06" stroke-width="3"/>
      <circle cx="64" cy="64" r="52" fill="#d49520"/>
      <circle cx="64" cy="64" r="48" fill="#180a0e"/>
      <circle cx="64" cy="64" r="44" fill="url(#pyroCore)"/>
      <path d="M64 28 C74 44 86 52 86 68 C86 82 76 94 64 96 C52 94 42 82 42 68 C42 52 54 44 64 28 Z" fill="#fffbe0" opacity="0.9"/>
      <path d="M64 42 C70 54 78 60 78 70 C78 78 72 86 64 88 C56 86 50 78 50 70 C50 60 58 54 64 42 Z" fill="#ff7a18"/>
      <path d="M64 54 C67 62 72 66 72 72 C72 76 68 80 64 82 C60 80 56 76 56 72 C56 66 61 62 64 54 Z" fill="#fffbe0"/>
    </svg>`,
    { size: 256 },
  );

  const DAIS_RUNES_TEX = svg(
    `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="runeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ff7b1a" stop-opacity="0.8"/>
          <stop offset="70%" stop-color="#d12316" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#6b0d12" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="128" cy="128" r="126" fill="#141118"/>
      <circle cx="128" cy="128" r="120" fill="url(#runeGlow)"/>
      <circle cx="128" cy="128" r="114" fill="none" stroke="#f6bf3c" stroke-width="3"/>
      <circle cx="128" cy="128" r="106" fill="none" stroke="#f6bf3c" stroke-width="1.5" stroke-dasharray="4 4"/>
      <circle cx="128" cy="128" r="88" fill="none" stroke="#f6bf3c" stroke-width="2"/>
      <polygon points="128,22 154,74 210,46 182,102 234,128 182,154 210,210 154,182 128,234 102,182 46,210 74,154 22,128 74,102 46,46 102,74" fill="none" stroke="#ffaa22" stroke-width="2"/>
      <circle cx="128" cy="128" r="64" fill="none" stroke="#ff4a10" stroke-width="3"/>
      <circle cx="128" cy="128" r="38" fill="#240c14" stroke="#f6bf3c" stroke-width="2"/>
      <circle cx="128" cy="128" r="24" fill="#ff7a1a"/>
      <circle cx="128" cy="128" r="10" fill="#fffbe0"/>
    </svg>`,
    { size: 256 },
  );

  const FLAME_CARD_TEX = svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="flameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#700818" stop-opacity="0"/>
          <stop offset="20%" stop-color="#d61a22" stop-opacity="0.85"/>
          <stop offset="55%" stop-color="#ff7214" stop-opacity="0.95"/>
          <stop offset="85%" stop-color="#ffc820" stop-opacity="1"/>
          <stop offset="100%" stop-color="#fffce0" stop-opacity="1"/>
        </linearGradient>
      </defs>
      <path d="M32 124 C18 100 8 72 16 42 C20 28 26 14 32 4 C38 14 44 28 48 42 C56 72 46 100 32 124 Z" fill="url(#flameGrad)"/>
      <path d="M32 110 C24 88 20 66 26 44 C28 34 30 20 32 10 C34 20 36 34 38 44 C44 66 40 88 32 110 Z" fill="#fffbe0" opacity="0.65"/>
    </svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------------------
  // 1. Staged Pedestal / Altar Dais Base (stands firmly on y = 0)
  // ---------------------------------------------------------------------------
  // Tier 1: Plinth bottom at y = 0 to 0.08
  b.part(new THREE.CylinderGeometry(0.55, 0.58, 0.08, 8), DAIS_STONE, {
    at: [0, 0.04, 0],
    group: "base",
    name: "plinthTier1",
  });

  // Tier 2: Stepped pedestal from y = 0.08 to 0.20
  b.part(new THREE.CylinderGeometry(0.46, 0.50, 0.12, 8), DAIS_STONE, {
    at: [0, 0.14, 0],
    group: "base",
    name: "plinthTier2",
  });
  // Gold trim ring around Tier 2 rim
  b.part(new THREE.CylinderGeometry(0.47, 0.47, 0.016, 8), GOLD_METAL, {
    at: [0, 0.20, 0],
    group: "base",
    name: "tier2GoldRim",
  });

  // Tier 3: Dais Pillar perch from y = 0.20 to 0.35
  b.part(new THREE.CylinderGeometry(0.35, 0.40, 0.15, 8), DAIS_STONE, {
    at: [0, 0.275, 0],
    group: "base",
    name: "daisPillar",
  });

  // Gold vertical bracket ribs around dais pillar
  for (let i = 0; i < 8; i++) {
    const ang = (i * Math.PI) / 4;
    const rx = Math.sin(ang) * 0.38;
    const rz = Math.cos(ang) * 0.38;
    b.rod([rx, 0.20, rz], [rx * 0.92, 0.35, rz * 0.92], 0.012, GOLD_METAL, { group: "base" });
  }

  // Dais Top Surface with glowing alchemy runes (at y = 0.352)
  const runesDisc = b.part(new THREE.CircleGeometry(0.34, 32), "#ffffff", {
    at: [0, 0.352, 0],
    dir: [0, 1, 0],
    axis: "z",
    texture: DAIS_RUNES_TEX,
    group: "base",
    name: "daisRunes",
  });
  glow(runesDisc, 1.25);

  // Volcanic Pyro Crystal Clusters growing around the pedestal
  const crystalAngles = [0.35, 1.45, 2.7, 3.5, 4.8, 5.7];
  crystalAngles.forEach((ang, idx) => {
    const rad = 0.44 + (idx % 2) * 0.05;
    const cx = Math.sin(ang) * rad;
    const cz = Math.cos(ang) * rad;
    const spikeTip = [cx + Math.sin(ang) * 0.08, 0.32 + (idx % 3) * 0.06, cz + Math.cos(ang) * 0.08];
    const crystal = b.spike([cx, 0.14, cz], spikeTip, null, 0.024, {
      color: EMISSIVE_AMBER,
      group: "base",
      name: `crystal_${idx}`,
    });
    glow(crystal, 1.8);
  });

  // Two ceremonial stone braziers flanking the pedestal
  for (const s of [1, -1]) {
    const bx = s * 0.46;
    const bz = 0.22;
    b.part(new THREE.CylinderGeometry(0.06, 0.045, 0.16, 6), DAIS_STONE, {
      at: [bx, 0.16, bz],
      group: "base",
    });
    b.part(new THREE.CylinderGeometry(0.075, 0.055, 0.04, 6), GOLD_METAL, {
      at: [bx, 0.23, bz],
      group: "base",
    });
    const ember = b.part(new THREE.SphereGeometry(0.038, 8, 6), EMISSIVE_FLAME, {
      at: [bx, 0.25, bz],
      group: "base",
    });
    glow(ember, 2.0);
    const emberTip = b.spike([bx, 0.25, bz], [bx, 0.34, bz], null, 0.016, {
      color: EMISSIVE_CORE,
      group: "base",
    });
    glow(emberTip, 2.2);
  }

  // ---------------------------------------------------------------------------
  // 2. Creature Skeleton (Phoenix Rig Architecture)
  // ---------------------------------------------------------------------------
  // Root Joint: Hips / Pelvis
  const hips = b.joint("hips", { at: [0, 0.92, -0.06], role: "spine" });

  // Spine joints
  const spine1 = b.joint("spine1", { parent: hips, at: [0, 1.08, 0.02], role: "spine" });
  const chest = b.joint("chest", { parent: spine1, at: [0, 1.26, 0.08], role: "spine" });

  // Neck joints (graceful S-curve)
  const neck1 = b.joint("neck1", { parent: chest, at: [0, 1.42, 0.15], role: "neck" });
  const neck2 = b.joint("neck2", { parent: neck1, at: [0, 1.56, 0.20], role: "neck" });

  // Head joint
  const head = b.joint("head", {
    parent: neck2,
    at: [0, 1.68, 0.25],
    dir: [0, 0.08, 0.99],
    role: "head",
    group: "head",
  });

  // Jaw joint (hinge so the beak can open!)
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.65, 0.29],
    dir: [0, -0.15, 0.98],
    role: "jaw",
    group: "head",
  });

  // Tail root joint
  const tailBase = b.joint("tailBase", { parent: hips, at: [0, 0.88, -0.22], role: "tail", group: "tail" });

  // ---------------------------------------------------------------------------
  // 3. Legs and Talons (Firmly Perched on Dais at y = 0.35)
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipJ = b.joint(`hip${side}`, { parent: hips, at: [s * 0.14, 0.90, -0.05], role: "leg" });
    const kneeJ = b.joint(`knee${side}`, { parent: hipJ, at: [s * 0.16, 0.68, -0.12], role: "leg" });
    const ankleJ = b.joint(`ankle${side}`, { parent: kneeJ, at: [s * 0.14, 0.48, 0.02], role: "leg" });
    const footJ = b.joint(`foot${side}`, { parent: ankleJ, at: [s * 0.13, 0.37, 0.08], role: "leg" });

    // Upper thigh: sleek feathered plumage sweep
    b.sweep(bezier(hipJ.at, [s * 0.15, 0.78, -0.09], kneeJ.at), [0.075, 0.05], {
      bone: hipJ,
      color: BODY_FEATHER,
      group: "leg",
    });
    // Flared knee feather cuff
    b.sweep(catmull([kneeJ.at, [s * 0.17, 0.65, -0.16], [s * 0.19, 0.60, -0.20]]), [0.055, 0.01], {
      bone: hipJ,
      color: FLAME_PLUMAGE,
      caps: { end: "point" },
      group: "leg",
    });

    // Lower leg (tarsus): armored golden scales
    b.sweep(bezier(kneeJ.at, [s * 0.15, 0.58, -0.05], ankleJ.at), [0.032, 0.024], {
      bone: kneeJ,
      color: GOLD_METAL,
      sides: 8,
      group: "leg",
    });

    // Golden knee guard
    b.part(new THREE.ConeGeometry(0.04, 0.08, 6), GOLD_METAL, {
      bone: kneeJ,
      at: kneeJ.local({ forward: 0.02, up: 0.01 }),
      dir: [0, 0.3, 0.95],
      group: "leg",
    });

    // Ankle backward spur
    b.spike(ankleJ.at, [s * 0.14, 0.45, -0.06], null, 0.016, {
      bone: ankleJ,
      color: GOLD_METAL,
      group: "leg",
    });

    // Foot pad
    b.part(new THREE.SphereGeometry(0.034, 8, 6), GOLD_METAL, {
      bone: footJ,
      at: footJ.at,
      scale: [1, 0.65, 1.2],
      group: "leg",
    });

    // 3 Front Grasping Talons + 1 Rear Hallux Talon gripping the stone rim
    const toes = [
      { name: "Mid", end: [s * 0.13, 0.35, 0.18], claw: [s * 0.13, 0.31, 0.21] },
      { name: "In", end: [s * 0.07, 0.35, 0.16], claw: [s * 0.04, 0.31, 0.19] },
      { name: "Out", end: [s * 0.19, 0.35, 0.15], claw: [s * 0.22, 0.31, 0.18] },
      { name: "Back", end: [s * 0.13, 0.35, -0.01], claw: [s * 0.13, 0.31, -0.04] },
    ];

    toes.forEach((toe) => {
      // Toe digit
      b.rod(footJ.at, toe.end, 0.014, GOLD_METAL, { bone: footJ, group: "leg" });
      // Sharp obsidian/gold curved talon
      b.spike(toe.end, toe.claw, null, 0.012, {
        bone: footJ,
        color: OBSIDIAN_BASE,
        group: "leg",
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 4. Torso, Proud Breast & Genshin Pectoral Torc
  // ---------------------------------------------------------------------------
  // Main body loft from rump through chest to throat
  const bodyPath = catmull([
    [0, 0.88, -0.18],
    [0, 0.94, -0.06],
    [0, 1.08, 0.04],
    [0, 1.25, 0.10],
    [0, 1.40, 0.14],
  ]);
  b.sweep(
    bodyPath,
    (t) => {
      // Elegant raptor torso radii [rx, ry]
      const rx = 0.14 + Math.sin(t * Math.PI) * 0.09;
      const ry = 0.13 + Math.sin(t * Math.PI) * 0.11;
      return [rx, ry];
    },
    {
      bone: [hips, spine1, chest],
      color: BODY_FEATHER,
      group: "torso",
    },
  );

  // Layered pectoral chevron breast plates (Genshin costume / ceremonial feather armor)
  const breastPlates = [
    { at: [0, 1.12, 0.17], size: [0.18, 0.045, 0.025], rot: 25 },
    { at: [0, 1.20, 0.20], size: [0.22, 0.05, 0.028], rot: 20 },
    { at: [0, 1.28, 0.22], size: [0.24, 0.055, 0.03], rot: 15 },
  ];
  breastPlates.forEach((pl, i) => {
    b.part(new THREE.BoxGeometry(pl.size[0], pl.size[1], pl.size[2]), FLAME_PLUMAGE, {
      bone: chest,
      at: pl.at,
      rotation: [pl.rot, 0, 0],
      group: "torso",
      name: `breastPlate_${i}`,
    });
    // Golden filigree rim on each plate
    b.part(new THREE.BoxGeometry(pl.size[0] * 1.04, pl.size[1] * 0.25, pl.size[2] * 1.08), GOLD_METAL, {
      bone: chest,
      at: [pl.at[0], pl.at[1] + 0.015, pl.at[2] + 0.005],
      rotation: [pl.rot, 0, 0],
      group: "torso",
    });
  });

  // Ceremonial Golden Torc around the neck/collar
  const torcPath = catmull(
    [
      [0.14, 1.35, 0.10],
      [0, 1.30, 0.22],
      [-0.14, 1.35, 0.10],
      [-0.10, 1.43, 0.04],
      [0, 1.45, 0.02],
      [0.10, 1.43, 0.04],
    ],
    { closed: true },
  );
  b.sweep(torcPath, 0.016, { bone: chest, color: GOLD_METAL, group: "torso" });

  // Center Pectoral Pyro Vision Talisman (Hero Focal Detail)
  // Bezel casing
  b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.014, 16), GOLD_METAL, {
    bone: chest,
    at: [0, 1.29, 0.23],
    dir: [0, 0.18, 0.98],
    group: "torso",
  });
  // The Glowing Pyro Vision Gem
  const visionGem = b.part(new THREE.SphereGeometry(0.044, 16, 12), "#ffffff", {
    bone: chest,
    at: [0, 1.29, 0.235],
    scale: [1, 1, 0.35],
    dir: [0, 0.18, 0.98],
    texture: PYRO_VISION_TEX,
    group: "torso",
    name: "pyroVision",
  });
  glow(visionGem, 1.8);

  // 4 Golden filigree wing prongs clasping the Vision
  for (let a = 0; a < 4; a++) {
    const ang = (a * Math.PI) / 2 + Math.PI / 4;
    const px = Math.sin(ang) * 0.052;
    const py = Math.cos(ang) * 0.052;
    b.spike([px, 1.29 + py, 0.23], [px * 1.25, 1.29 + py * 1.25, 0.24], null, 0.01, {
      bone: chest,
      color: GOLD_METAL,
      group: "torso",
    });
  }

  // Dangling gold chains and ruby pendant from the Vision
  b.rod([0, 1.24, 0.23], [0, 1.15, 0.21], 0.005, GOLD_METAL, { bone: chest, group: "torso" });
  const pendantRuby = b.spike([0, 1.15, 0.21], [0, 1.08, 0.20], null, 0.016, {
    bone: chest,
    color: EMISSIVE_RUBY,
    group: "torso",
  });
  glow(pendantRuby, 1.8);

  // ---------------------------------------------------------------------------
  // 5. Neck, Head, Beak & Royal Crest
  // ---------------------------------------------------------------------------
  // Graceful S-curve neck tube
  const neckPath = catmull([
    [0, 1.38, 0.13],
    [0, 1.48, 0.17],
    [0, 1.58, 0.21],
    [0, 1.68, 0.25],
  ]);
  b.sweep(neckPath, (t) => 0.11 * (1 - t * 0.35) + 0.02, {
    bone: [chest, neck1, neck2, head],
    color: BODY_FEATHER,
    group: "neck",
  });

  // Flaming dorsal neck mane (5 stylized flickering flame spines)
  const maneSpines = [
    { at: [0, 1.44, 0.06], dir: [0, 0.3, -0.95], len: 0.14, r: 0.025 },
    { at: [0, 1.52, 0.10], dir: [0, 0.45, -0.9], len: 0.17, r: 0.028 },
    { at: [0, 1.60, 0.14], dir: [0, 0.6, -0.8], len: 0.19, r: 0.03 },
    { at: [0, 1.68, 0.18], dir: [0, 0.75, -0.66], len: 0.21, r: 0.032 },
    { at: [0, 1.74, 0.21], dir: [0, 0.88, -0.47], len: 0.18, r: 0.026 },
  ];
  maneSpines.forEach((sp, i) => {
    b.spike(sp.at, sp.dir, sp.len, sp.r, {
      bone: neck2,
      color: FLAME_PLUMAGE,
      group: "neck",
      name: `maneSpine_${i}`,
    });
    // Glowing incandescent tip on each mane spine
    const tipPt = [sp.at[0] + sp.dir[0] * sp.len, sp.at[1] + sp.dir[1] * sp.len, sp.at[2] + sp.dir[2] * sp.len];
    const glowTip = b.spike(
      [
        sp.at[0] + sp.dir[0] * sp.len * 0.75,
        sp.at[1] + sp.dir[1] * sp.len * 0.75,
        sp.at[2] + sp.dir[2] * sp.len * 0.75,
      ],
      tipPt,
      null,
      sp.r * 0.55,
      { bone: neck2, color: EMISSIVE_CORE, group: "neck" },
    );
    glow(glowTip, 1.8);
  });

  // Aerodynamic raptor cranium
  b.part(new THREE.SphereGeometry(0.082, 14, 10), FLAME_PLUMAGE, {
    bone: head,
    at: head.at,
    scale: [0.95, 0.95, 1.25],
    group: "head",
    name: "cranium",
  });

  // Upper beak: sharp curved royal raptor hook
  const beakUpperPath = bezier([0, 1.71, 0.32], [0, 1.70, 0.40], [0, 1.62, 0.45]);
  b.sweep(beakUpperPath, (t) => [0.034 * (1 - t) + 0.004, 0.038 * (1 - t * 0.7) + 0.004], {
    bone: head,
    color: GOLD_METAL,
    caps: { start: "flat", end: "point" },
    group: "head",
    name: "beakUpper",
  });
  // Obsidian cutting edge on beak tip
  b.spike([0, 1.65, 0.42], [0, 1.60, 0.46], null, 0.012, {
    bone: head,
    color: OBSIDIAN_BASE,
    group: "head",
  });
  // Gold nostril cere shield plate
  b.part(new THREE.BoxGeometry(0.045, 0.024, 0.05), GOLD_METAL, {
    bone: head,
    at: [0, 1.71, 0.33],
    rotation: [15, 0, 0],
    group: "head",
  });

  // Lower beak (on jaw joint so it can open!)
  const beakLowerPath = bezier([0, 1.66, 0.31], [0, 1.65, 0.38], [0, 1.63, 0.42]);
  b.sweep(beakLowerPath, (t) => [0.026 * (1 - t) + 0.003, 0.022 * (1 - t) + 0.003], {
    bone: jaw,
    color: GOLD_METAL,
    caps: { start: "flat", end: "point" },
    group: "head",
    name: "beakLower",
  });

  // Glowing flaming tongue inside the mouth (rides the jaw!)
  const flameTongue = b.spike([0, 1.665, 0.32], [0, 1.65, 0.40], null, 0.014, {
    bone: jaw,
    color: EMISSIVE_CORE,
    group: "head",
    name: "tongue",
  });
  glow(flameTongue, 2.0);

  // Anime Raptor Eyes (Left & Right)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const eyeAt = [s * 0.068, 1.70, 0.29];
    const eyeDir = [s * 0.82, 0.08, 0.57];

    b.part(new THREE.PlaneGeometry(0.046, 0.046), "#ffffff", {
      bone: head,
      at: eyeAt,
      dir: eyeDir,
      axis: "z",
      texture: PHOENIX_EYE_TEX,
      group: "head",
      name: `eye_${side}`,
    });

    // Golden sharp brow crest above the eye
    b.spike(eyeAt, [s * 0.095, 1.76, 0.25], null, 0.015, {
      bone: head,
      color: GOLD_METAL,
      group: "head",
    });

    // Cheek flame tufts
    b.spike([s * 0.075, 1.66, 0.26], [s * 0.16, 1.63, 0.18], null, 0.022, {
      bone: head,
      color: FLAME_PLUMAGE,
      group: "head",
    });
  }

  // Golden Royal Tiara / Crownlet on Forehead
  b.part(new THREE.CylinderGeometry(0.05, 0.06, 0.02, 6), GOLD_METAL, {
    bone: head,
    at: [0, 1.76, 0.26],
    rotation: [22, 0, 0],
    group: "head",
  });
  // Center Crown Star Ruby
  const crownRuby = b.part(new THREE.OctahedronGeometry(0.018), EMISSIVE_RUBY, {
    bone: head,
    at: [0, 1.78, 0.29],
    group: "head",
  });
  glow(crownRuby, 2.0);

  // Triple Royal Flame Crest Plumes
  // Center Plume (tallest, sweeping back & up)
  const centerPlumePath = catmull([
    [0, 1.78, 0.25],
    [0, 1.92, 0.20],
    [0, 1.96, 0.05],
    [0, 1.88, -0.10],
  ]);
  b.sweep(centerPlumePath, (t) => [Math.sin(t * Math.PI) * 0.045 + 0.006, 0.008], {
    bone: head,
    color: FLAME_PLUMAGE,
    caps: { start: "flat", end: "point" },
    group: "head",
    name: "crestCenter",
  });
  // Center Plume glowing incandescent core
  const crestCore = b.spike([0, 1.94, 0.10], [0, 1.90, -0.12], null, 0.016, {
    bone: head,
    color: EMISSIVE_CORE,
    group: "head",
  });
  glow(crestCore, 2.0);

  // Lateral Plumes (Left & Right)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const latPlumePath = catmull([
      [s * 0.04, 1.76, 0.24],
      [s * 0.16, 1.88, 0.14],
      [s * 0.22, 1.82, -0.02],
      [s * 0.18, 1.74, -0.12],
    ]);
    b.sweep(latPlumePath, (t) => [Math.sin(t * Math.PI) * 0.038 + 0.005, 0.006], {
      bone: head,
      color: FLAME_PLUMAGE,
      caps: { start: "flat", end: "point" },
      group: "head",
      name: `crest_${side}`,
    });
    const latGlow = b.spike([s * 0.20, 1.84, 0.02], [s * 0.19, 1.75, -0.14], null, 0.012, {
      bone: head,
      color: EMISSIVE_AMBER,
      group: "head",
    });
    glow(latGlow, 1.8);
  }

  // ---------------------------------------------------------------------------
  // 6. Wings Spread in Full Majestic Flight
  // ---------------------------------------------------------------------------
  // Total wingspan: ~2.7m across (+X to -X), arched upward & slightly forward
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Wing arm bones
    const shoulderJ = b.joint(`shoulder${side}`, {
      parent: chest,
      at: [s * 0.18, 1.25, 0.04],
      role: "arm",
      group: "wing",
    });
    const elbowJ = b.joint(`elbow${side}`, {
      parent: shoulderJ,
      at: [s * 0.54, 1.38, -0.06],
      role: "arm",
      group: "wing",
    });
    const wristJ = b.joint(`wrist${side}`, {
      parent: elbowJ,
      at: [s * 0.94, 1.56, 0.05],
      role: "arm",
      group: "wing",
    });
    const wingTipJ = b.joint(`wingTip${side}`, {
      parent: wristJ,
      at: [s * 1.35, 1.78, 0.20],
      role: "wing",
      group: "wing",
    });

    // Shoulder Pauldron (Genshin wing armor plate)
    b.part(new THREE.BoxGeometry(0.12, 0.14, 0.10), GOLD_METAL, {
      bone: shoulderJ,
      at: shoulderJ.at,
      rotation: [0, -s * 20, s * 25],
      group: "wing",
      name: `pauldron_${side}`,
    });
    b.spike(shoulderJ.at, [s * 0.28, 1.34, 0.02], null, 0.028, {
      bone: shoulderJ,
      color: CRIMSON,
      group: "wing",
    });

    // Wing bow spars (upper arm & forearm leading edge)
    b.sweep(catmull([shoulderJ.at, elbowJ.at]), (t) => 0.055 * (1 - t * 0.3), {
      bone: shoulderJ,
      color: WINE_SHADOW,
      group: "wing",
    });
    b.sweep(catmull([elbowJ.at, wristJ.at]), (t) => 0.045 * (1 - t * 0.3), {
      bone: elbowJ,
      color: WINE_SHADOW,
      group: "wing",
    });
    b.sweep(catmull([wristJ.at, wingTipJ.at]), (t) => 0.035 * (1 - t * 0.6) + 0.005, {
      bone: wristJ,
      color: GOLD_METAL,
      caps: { end: "point" },
      group: "wing",
    });

    // Alula thumb claw at the wrist joint
    b.spike(wristJ.at, [s * 0.95, 1.66, 0.15], null, 0.018, {
      bone: wristJ,
      color: GOLD_METAL,
      group: "wing",
    });

    // 7 Greater Primary Flight Feathers (sweeping outward to wingtips)
    const primaryCount = 7;
    for (let k = 0; k < primaryCount; k++) {
      const u = k / (primaryCount - 1);
      // Root interpolated along hand bone
      const root = lerp(wristJ.at, wingTipJ.at, u * 0.85);

      // Feather tip coordinates: fan out dynamically
      const tipX = s * (1.35 - u * 0.40);
      const tipY = 1.78 - u * 0.55;
      const tipZ = 0.20 - u * 0.42;

      const midX = s * (0.80 + (1.35 - u * 0.40 - 0.80) * 0.55);
      const midY = 1.62 - u * 0.30;
      const midZ = 0.12 - u * 0.20;

      const featherPath = bezier(root, [midX, midY, midZ], [tipX, tipY, tipZ]);
      const bladeW = 0.058 + (1 - u) * 0.024;

      // Feather blade
      b.sweep(featherPath, (t) => [Math.sin(t * Math.PI) * bladeW + 0.004, 0.006], {
        bone: wristJ,
        color: FLAME_PLUMAGE,
        caps: { start: "flat", end: "point" },
        group: "wing",
        name: `primary_${side}_${k}`,
      });

      // Feather golden spine quill
      b.rod(root, [tipX, tipY, tipZ], 0.0035, GOLD_METAL, { bone: wristJ, group: "wing" });

      // Outermost 3 primaries carry glowing elemental flame wisps
      if (k < 3) {
        const glowTip = b.spike(
          [tipX - s * 0.06, tipY - 0.06, tipZ],
          [tipX + s * 0.08, tipY + 0.08, tipZ + 0.04],
          null,
          0.015,
          { bone: wristJ, color: EMISSIVE_AMBER, group: "wing" },
        );
        glow(glowTip, 1.8);
      }
    }

    // 6 Secondary Flight Feathers (along forearm / elbow)
    const secondaryCount = 6;
    for (let k = 0; k < secondaryCount; k++) {
      const u = k / (secondaryCount - 1);
      const root = lerp(elbowJ.at, wristJ.at, u);

      const tipX = s * (0.50 + u * 0.40);
      const tipY = 1.05 + u * 0.18;
      const tipZ = -0.16 - (1 - u) * 0.10;

      const midPt = [s * (0.48 + u * 0.38), 1.22 + u * 0.15, -0.12];

      const secPath = bezier(root, midPt, [tipX, tipY, tipZ]);
      b.sweep(secPath, (t) => [Math.sin(t * Math.PI) * 0.062 + 0.004, 0.006], {
        bone: elbowJ,
        color: FLAME_PLUMAGE,
        caps: { start: "flat", end: "point" },
        group: "wing",
        name: `secondary_${side}_${k}`,
      });
      b.rod(root, [tipX, tipY, tipZ], 0.003, GOLD_METAL, { bone: elbowJ, group: "wing" });
    }

    // Wing Covert Scales (2 layered rows along leading edge)
    for (let c = 0; c < 5; c++) {
      const u = c / 4;
      const cvRoot = lerp(shoulderJ.at, wristJ.at, u);
      b.part(new THREE.BoxGeometry(0.06, 0.09, 0.02), FLAME_PLUMAGE, {
        bone: shoulderJ,
        at: [cvRoot.x, cvRoot.y + 0.02, cvRoot.z - 0.02],
        rotation: [-15, -s * 25, s * 15],
        group: "wing",
      });
      b.part(new THREE.BoxGeometry(0.065, 0.02, 0.024), GOLD_METAL, {
        bone: shoulderJ,
        at: [cvRoot.x, cvRoot.y + 0.05, cvRoot.z - 0.015],
        rotation: [-15, -s * 25, s * 15],
        group: "wing",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 7. Imperial Fenghuang Triple Tail Ribbons
  // ---------------------------------------------------------------------------
  // Rump covert feathers (fan of 5 broad flame spades)
  const rumpCoverts = [
    { at: [0, 0.89, -0.32], rot: [35, 0, 0] },
    { at: [0.10, 0.87, -0.30], rot: [32, -18, 15] },
    { at: [-0.10, 0.87, -0.30], rot: [32, 18, -15] },
    { at: [0.18, 0.84, -0.27], rot: [28, -32, 25] },
    { at: [-0.18, 0.84, -0.27], rot: [28, 32, -25] },
  ];
  rumpCoverts.forEach((rc, i) => {
    b.part(new THREE.BoxGeometry(0.09, 0.16, 0.016), FLAME_PLUMAGE, {
      bone: tailBase,
      at: rc.at,
      rotation: rc.rot as [number, number, number],
      group: "tail",
      name: `rumpCovert_${i}`,
    });
  });

  // Central Imperial Streamer Ribbon (cascading down & curling around base)
  const tailC_1 = b.joint("tailC_1", { parent: tailBase, at: [0, 0.72, -0.42], role: "tail", group: "tail" });
  const tailC_2 = b.joint("tailC_2", { parent: tailC_1, at: [0, 0.48, -0.52], role: "tail", group: "tail" });
  const tailC_3 = b.joint("tailC_3", { parent: tailC_2, at: [0, 0.25, -0.46], role: "tail", group: "tail" });
  const tailC_4 = b.joint("tailC_4", { parent: tailC_3, at: [0, 0.12, -0.32], role: "tail", group: "tail" });

  const centerRibbonPath = catmull([tailBase.at, tailC_1.at, tailC_2.at, tailC_3.at, tailC_4.at, [0, 0.06, -0.15]]);
  b.sweep(centerRibbonPath, (t) => [0.045 + t * 0.045, 0.006], {
    bone: [tailBase, tailC_1, tailC_2, tailC_3, tailC_4],
    color: FLAME_PLUMAGE,
    group: "tail",
    name: "centerRibbon",
  });

  // 3 Golden Eyelets with embedded glowing Pyro jewels on Center Ribbon
  const eyeletT = [0.22, 0.52, 0.82];
  eyeletT.forEach((tVal, idx) => {
    const pt = centerRibbonPath.at(tVal);
    // Gold filigree torus
    b.part(new THREE.TorusGeometry(0.042, 0.009, 8, 16), GOLD_METAL, {
      bone: tailC_2,
      at: [pt.x, pt.y, pt.z],
      dir: [0, 0.3, 0.95],
      group: "tail",
    });
    // Embedded glowing jewel
    const jewel = b.part(new THREE.SphereGeometry(0.024, 8, 8), EMISSIVE_RUBY, {
      bone: tailC_2,
      at: [pt.x, pt.y, pt.z],
      group: "tail",
    });
    glow(jewel, 1.8);
  });

  // Terminal swallowtail flame blossom at center ribbon tip
  const centerTipPt = [0, 0.06, -0.15];
  const centerBlossom = b.spike(centerTipPt, [0, 0.06, 0.02], null, 0.038, {
    bone: tailC_4,
    color: EMISSIVE_CORE,
    group: "tail",
    name: "centerBlossom",
  });
  glow(centerBlossom, 2.0);
  for (const s of [1, -1]) {
    const forkTip = b.spike(centerTipPt, [s * 0.12, 0.07, -0.05], null, 0.024, {
      bone: tailC_4,
      color: SOLAR_ORANGE,
      group: "tail",
    });
    glow(forkTip, 1.8);
  }

  // Lateral Streamer Ribbons (Left & Right)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const tailL_1 = b.joint(`tail${side}_1`, {
      parent: tailBase,
      at: [s * 0.22, 0.66, -0.38],
      role: "tail",
      group: "tail",
    });
    const tailL_2 = b.joint(`tail${side}_2`, {
      parent: tailL_1,
      at: [s * 0.36, 0.40, -0.38],
      role: "tail",
      group: "tail",
    });
    const tailL_3 = b.joint(`tail${side}_3`, {
      parent: tailL_2,
      at: [s * 0.30, 0.16, -0.24],
      role: "tail",
      group: "tail",
    });

    const latRibbonPath = catmull([
      [s * 0.08, 0.86, -0.20],
      tailL_1.at,
      tailL_2.at,
      tailL_3.at,
      [s * 0.20, 0.06, -0.08],
    ]);
    b.sweep(latRibbonPath, (t) => [0.038 + t * 0.035, 0.005], {
      bone: [tailBase, tailL_1, tailL_2, tailL_3],
      color: FLAME_PLUMAGE,
      group: "tail",
      name: `latRibbon_${side}`,
    });

    // 2 Eyelet jewels on each lateral ribbon
    [0.32, 0.72].forEach((tVal) => {
      const pt = latRibbonPath.at(tVal);
      b.part(new THREE.TorusGeometry(0.035, 0.008, 8, 14), GOLD_METAL, {
        bone: tailL_2,
        at: [pt.x, pt.y, pt.z],
        dir: [s * 0.4, 0.3, 0.87],
        group: "tail",
      });
      const sideJewel = b.part(new THREE.SphereGeometry(0.02, 8, 8), EMISSIVE_AMBER, {
        bone: tailL_2,
        at: [pt.x, pt.y, pt.z],
        group: "tail",
      });
      glow(sideJewel, 1.8);
    });

    // Terminal flared flame fan at lateral ribbon tip
    const sideTipPt = [s * 0.20, 0.06, -0.08];
    const sideBlossom = b.spike(sideTipPt, [s * 0.24, 0.06, 0.04], null, 0.03, {
      bone: tailL_3,
      color: EMISSIVE_FLAME,
      group: "tail",
    });
    glow(sideBlossom, 1.8);
  }

  // ---------------------------------------------------------------------------
  // 8. Floating Elemental Pyro Embers & Particle Wisps (Staged Ambience)
  // ---------------------------------------------------------------------------
  const emberPositions = [
    { at: [0.75, 1.85, 0.15], rot: [10, 20, 30] },
    { at: [-0.75, 1.85, 0.15], rot: [10, -20, -30] },
    { at: [1.25, 1.65, 0.10], rot: [15, 45, 10] },
    { at: [-1.25, 1.65, 0.10], rot: [15, -45, -10] },
    { at: [0.25, 1.95, 0.05], rot: [-20, 15, 40] },
    { at: [-0.25, 1.95, 0.05], rot: [-20, -15, -40] },
    { at: [0.38, 0.55, -0.45], rot: [30, 25, 15] },
    { at: [-0.38, 0.55, -0.45], rot: [30, -25, -15] },
    { at: [0.0, 1.35, 0.32], rot: [0, 0, 0] },
    { at: [0.15, 0.85, 0.22], rot: [15, 10, -20] },
  ];

  emberPositions.forEach((emb, i) => {
    const emberCard = b.part(new THREE.PlaneGeometry(0.045, 0.09), "#ffffff", {
      at: emb.at as [number, number, number],
      rotation: emb.rot as [number, number, number],
      texture: FLAME_CARD_TEX,
      group: "particles",
      name: `emberCard_${i}`,
    });
    glow(emberCard, 2.0);
  });

  return b.root;
}
```