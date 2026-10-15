import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { lerp } from "../../../../src/index";
import { bezier, catmull } from "../../../../src/index";
import { mix, noise, paint, smoothstep } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Genshin Pyro Phoenix Sovereign",
  description:
    "An imperial Genshin Impact-style Pyro Phoenix with blazing tiered flame wings, royal crest plumes, an ornate winged Pyro Vision torc, feathered breeches, and calligraphy tail streamers perched on a volcanic alchemical dais.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "genshin_pyro_phoenix", detail: 1.0 });

  // ---------------------------------------------------------------------------
  // 1. Color Palette & Anime Cel Paints (Vibrant Genshin Pyro Aesthetic)
  // ---------------------------------------------------------------------------
  const GOLD_BRIGHT = "#fbd148";
  const GOLD_DEEP = "#9b5a0e";
  const GOLD_LIGHT = "#fff4b8";
  const CRIMSON_PURE = "#e61f24";
  const FLAME_ORANGE = "#ff6a0d";
  const SOLAR_YELLOW = "#ffb818";
  const WINE_DEEP = "#4c0618";
  const PEACH_CREAM = "#fff0dc";
  const OBSIDIAN_DARK = "#171320";
  const OBSIDIAN_PLUM = "#2a1e38";

  // Glowing flat emissives
  const GLOW_CORE = "#fffda8";
  const GLOW_AMBER = "#ffa81e";
  const GLOW_FIRE = "#ff4600";
  const GLOW_RUBY = "#ff1b38";

  // Rich cel-shaded feather paint: blends from vermilion to fiery orange and gold tips
  const FEATHER_CEL = paint((p, n) => {
    const light = n.dot(new THREE.Vector3(0.35, 0.8, 0.45));
    const lit = smoothstep(-0.15, 0.75, light);
    const grad = smoothstep(0.4, 1.9, p.y);
    const baseCol = mix(WINE_DEEP, CRIMSON_PURE, lit * 0.85 + 0.15);
    const midCol = mix(baseCol, FLAME_ORANGE, lit * 0.9);
    return mix(midCol, SOLAR_YELLOW, smoothstep(0.45, 0.98, lit * 0.6 + grad * 0.5));
  });

  // Body countershading: warm creamy breast merging into fiery scarlet flank
  const BODY_CEL = paint((p, n) => {
    const isFront = smoothstep(0.0, 0.85, n.z) * smoothstep(0.8, 1.5, p.y);
    const dorsalLight = smoothstep(-0.2, 0.8, n.y);
    const dorsal = mix(WINE_DEEP, CRIMSON_PURE, dorsalLight);
    const ventral = mix(FLAME_ORANGE, PEACH_CREAM, isFront);
    return mix(dorsal, ventral, isFront * 0.9);
  });

  // Lustrous Genshin gold metal paint
  const GOLD_CEL = paint((p, n) => {
    const key = n.dot(new THREE.Vector3(0.4, 0.82, 0.42));
    const glint = smoothstep(0.3, 0.95, key);
    return mix(GOLD_DEEP, mix(GOLD_BRIGHT, GOLD_LIGHT, glint * 0.75), glint);
  });

  // Dais obsidian stone paint
  const DAIS_CEL = paint((p, n) => {
    const grain = noise(p, 0.15, 23);
    const stone = mix(OBSIDIAN_DARK, OBSIDIAN_PLUM, grain);
    const topLight = smoothstep(0.2, 0.95, n.y);
    return mix(stone, "#3e3252", topLight * 0.45);
  });

  // ---------------------------------------------------------------------------
  // 2. High-Impact Genshin Textures
  // ---------------------------------------------------------------------------
  // Sharp, expressive raptor eye with anime highlight arcs & fiery iris
  const PHOENIX_EYE_TEX = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="irisGrad" cx="45%" cy="45%" r="55%">
          <stop offset="0%" stop-color="#fffde0"/>
          <stop offset="28%" stop-color="#ffbe1e"/>
          <stop offset="65%" stop-color="#e83610"/>
          <stop offset="100%" stop-color="#600412"/>
        </radialGradient>
      </defs>
      <path d="M2 64 Q64 4 126 64 Q64 124 2 64 Z" fill="#140612" stroke="#ffc024" stroke-width="4.5"/>
      <ellipse cx="64" cy="64" rx="46" ry="50" fill="url(#irisGrad)"/>
      <circle cx="64" cy="64" r="36" fill="none" stroke="#fff480" stroke-width="2.5" stroke-dasharray="5 4"/>
      <polygon points="64,28 72,64 64,100 56,64" fill="#12040c"/>
      <ellipse cx="50" cy="46" rx="9" ry="14" fill="#ffffff" opacity="0.96"/>
      <circle cx="80" cy="76" r="5" fill="#ffffff" opacity="0.88"/>
      <path d="M106 52 Q122 42 126 28" stroke="#ffb81e" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M100 68 Q120 74 126 88" stroke="#ffb81e" stroke-width="3" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  // Official Genshin-style Pyro Vision medallion
  const PYRO_VISION_TEX = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="gemGlow" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stop-color="#fffde2"/>
          <stop offset="25%" stop-color="#ffcc24"/>
          <stop offset="60%" stop-color="#f03c0e"/>
          <stop offset="100%" stop-color="#5a0410"/>
        </radialGradient>
      </defs>
      <circle cx="64" cy="64" r="62" fill="#fabc30" stroke="#7e4a06" stroke-width="3.5"/>
      <circle cx="64" cy="64" r="53" fill="#d2901c"/>
      <circle cx="64" cy="64" r="48" fill="#1a080d"/>
      <circle cx="64" cy="64" r="44" fill="url(#gemGlow)"/>
      <!-- Pyro Element Flame Glyph -->
      <path d="M64 22 C78 40 90 52 90 70 C90 86 78 98 64 100 C50 98 38 86 38 70 C38 52 50 40 64 22 Z" fill="#fffbe0" opacity="0.95"/>
      <path d="M64 36 C74 50 82 58 82 72 C82 82 74 90 64 92 C54 90 46 82 46 72 C46 58 54 50 64 36 Z" fill="#ff7012"/>
      <path d="M64 50 C69 60 74 66 74 74 C74 78 70 84 64 86 C58 84 54 78 54 74 C54 66 59 60 64 50 Z" fill="#fffde0"/>
    </svg>`,
    { size: 256 },
  );

  // Staged volcanic dais alchemical runes
  const DAIS_RUNES_TEX = svg(
    `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="altarGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ff881a" stop-opacity="0.95"/>
          <stop offset="65%" stop-color="#d62214" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="#4e0810" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="128" cy="128" r="126" fill="#14101a"/>
      <circle cx="128" cy="128" r="120" fill="url(#altarGlow)"/>
      <circle cx="128" cy="128" r="114" fill="none" stroke="#f6bf3c" stroke-width="3"/>
      <circle cx="128" cy="128" r="106" fill="none" stroke="#f6bf3c" stroke-width="1.5" stroke-dasharray="4 4"/>
      <circle cx="128" cy="128" r="88" fill="none" stroke="#f6bf3c" stroke-width="2"/>
      <polygon points="128,20 156,76 214,46 184,104 238,128 184,152 214,210 156,180 128,236 100,180 42,210 72,152 18,128 72,104 42,46 100,76" fill="none" stroke="#ffaa20" stroke-width="2.2"/>
      <circle cx="128" cy="128" r="62" fill="none" stroke="#ff5014" stroke-width="3"/>
      <circle cx="128" cy="128" r="38" fill="#200a12" stroke="#f6bf3c" stroke-width="2.5"/>
      <circle cx="128" cy="128" r="22" fill="#ff7618"/>
      <circle cx="128" cy="128" r="9" fill="#fffde2"/>
    </svg>`,
    { size: 256 },
  );

  // Flame ember particle card texture
  const EMBER_TEX = svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="embGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#6a0410" stop-opacity="0"/>
          <stop offset="25%" stop-color="#e22214" stop-opacity="0.9"/>
          <stop offset="60%" stop-color="#ff7614" stop-opacity="0.98"/>
          <stop offset="88%" stop-color="#ffd024" stop-opacity="1"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="1"/>
        </linearGradient>
      </defs>
      <path d="M32 126 C16 98 6 68 14 38 C18 24 26 12 32 2 C38 12 46 24 50 38 C58 68 48 98 32 126 Z" fill="url(#embGrad)"/>
      <path d="M32 110 C22 86 18 64 24 40 C28 30 30 18 32 8 C34 18 36 30 40 40 C46 64 42 86 32 110 Z" fill="#fffde0" opacity="0.75"/>
    </svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------------------
  // 3. Skeleton Hierarchy (Auto-Rigger Answer Key Compliant)
  // ---------------------------------------------------------------------------
  // Pelvis / Hips (Root Joint)
  const hips = b.joint("hips", { at: [0, 0.94, -0.06], role: "spine" });

  // Spine & Thorax
  const spine1 = b.joint("spine1", { parent: hips, at: [0, 1.10, 0.02], role: "spine" });
  const chest = b.joint("chest", { parent: spine1, at: [0, 1.28, 0.08], role: "spine" });

  // Neck joints (gracefully curved)
  const neck1 = b.joint("neck1", { parent: chest, at: [0, 1.45, 0.16], role: "neck" });
  const neck2 = b.joint("neck2", { parent: neck1, at: [0, 1.58, 0.22], role: "neck" });

  // Head joint
  const head = b.joint("head", {
    parent: neck2,
    at: [0, 1.70, 0.26],
    dir: [0, 0.06, 0.99],
    role: "head",
    group: "head",
  });

  // Jaw hinge (can open!)
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.66, 0.31],
    dir: [0, -0.15, 0.98],
    role: "jaw",
    group: "head",
  });

  // Tail base joint
  const tailBase = b.joint("tailBase", { parent: hips, at: [0, 0.90, -0.22], role: "tail", group: "tail" });

  // ---------------------------------------------------------------------------
  // 4. Staged Altar Dais Base (Solidly at y = 0, no gaps, majestic setting)
  // ---------------------------------------------------------------------------
  // Tier 1: Polygonal foundation (y = 0 to 0.08)
  b.part(new THREE.CylinderGeometry(0.56, 0.60, 0.08, 8), DAIS_CEL, {
    at: [0, 0.04, 0],
    group: "base",
    name: "daisBaseTier1",
  });

  // Tier 2: Stepped plinth (y = 0.08 to 0.20)
  b.part(new THREE.CylinderGeometry(0.48, 0.52, 0.12, 8), DAIS_CEL, {
    at: [0, 0.14, 0],
    group: "base",
    name: "daisBaseTier2",
  });
  // Tier 2 Gold Chamfer Rim
  b.part(new THREE.CylinderGeometry(0.49, 0.49, 0.018, 8), GOLD_CEL, {
    at: [0, 0.20, 0],
    group: "base",
  });

  // Tier 3: Dais Pillar column (y = 0.20 to 0.35)
  b.part(new THREE.CylinderGeometry(0.36, 0.42, 0.15, 8), DAIS_CEL, {
    at: [0, 0.275, 0],
    group: "base",
    name: "daisPillar",
  });

  // 8 Gold vertical armature brackets supporting the altar platform
  for (let i = 0; i < 8; i++) {
    const ang = (i * Math.PI) / 4;
    const rx = Math.sin(ang) * 0.40;
    const rz = Math.cos(ang) * 0.40;
    b.rod([rx, 0.20, rz], [rx * 0.90, 0.35, rz * 0.90], 0.014, GOLD_CEL, { group: "base" });
  }

  // Top Surface with glowing alchemy runes (at y = 0.352)
  const runesDisc = b.part(new THREE.CircleGeometry(0.35, 32), "#ffffff", {
    at: [0, 0.352, 0],
    dir: [0, 1, 0],
    axis: "z",
    texture: DAIS_RUNES_TEX,
    group: "base",
    name: "daisRunes",
  });
  glow(runesDisc, 1.4);

  // Faceted volcanic Pyro crystals rooted on the base tiers
  const crystalDefs = [
    { ang: 0.38, r: 0.44, h: 0.26, rad: 0.034, col: GLOW_AMBER },
    { ang: 1.40, r: 0.46, h: 0.32, rad: 0.038, col: GLOW_FIRE },
    { ang: 2.65, r: 0.43, h: 0.24, rad: 0.032, col: GLOW_RUBY },
    { ang: 3.55, r: 0.45, h: 0.29, rad: 0.036, col: GLOW_AMBER },
    { ang: 4.80, r: 0.44, h: 0.34, rad: 0.040, col: GLOW_FIRE },
    { ang: 5.75, r: 0.46, h: 0.27, rad: 0.033, col: GLOW_CORE },
  ];
  crystalDefs.forEach((cr, idx) => {
    const cx = Math.sin(cr.ang) * cr.r;
    const cz = Math.cos(cr.ang) * cr.r;
    const tip = [cx + Math.sin(cr.ang) * 0.07, 0.12 + cr.h, cz + Math.cos(cr.ang) * 0.07];
    const cMesh = b.spike([cx, 0.12, cz], tip, null, cr.rad, {
      sides: 6,
      color: cr.col,
      group: "base",
      name: `pyroCrystal_${idx}`,
    });
    glow(cMesh, 1.9);
  });

  // Flanking Altar Fire Cauldrons
  for (const s of [1, -1]) {
    const bx = s * 0.46;
    const bz = 0.20;
    b.part(new THREE.CylinderGeometry(0.065, 0.048, 0.16, 6), DAIS_CEL, {
      at: [bx, 0.16, bz],
      group: "base",
    });
    b.part(new THREE.CylinderGeometry(0.08, 0.06, 0.04, 6), GOLD_CEL, {
      at: [bx, 0.23, bz],
      group: "base",
    });
    const flameCore = b.part(new THREE.SphereGeometry(0.042, 8, 6), GLOW_FIRE, {
      at: [bx, 0.26, bz],
      group: "base",
    });
    glow(flameCore, 2.2);
    const flameTongue = b.spike([bx, 0.26, bz], [bx, 0.36, bz], null, 0.018, {
      color: GLOW_CORE,
      group: "base",
    });
    glow(flameTongue, 2.4);
  }

  // ---------------------------------------------------------------------------
  // 5. Powerful Raptor Limbs: Feathered Breeches & Armored Talons
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipJ = b.joint(`hip${side}`, { parent: hips, at: [s * 0.14, 0.92, -0.05], role: "leg" });
    const kneeJ = b.joint(`knee${side}`, { parent: hipJ, at: [s * 0.16, 0.70, -0.06], role: "leg" });
    const hockJ = b.joint(`hock${side}`, { parent: kneeJ, at: [s * 0.14, 0.52, -0.10], role: "leg" });
    const footJ = b.joint(`foot${side}`, { parent: hockJ, at: [s * 0.13, 0.36, 0.06], role: "leg" });

    // Voluminous feathered thighs ("plumage breeches")
    b.sweep(bezier(hipJ.at, [s * 0.16, 0.80, -0.05], kneeJ.at), [0.095, 0.065], {
      bone: hipJ,
      color: BODY_CEL,
      group: "leg",
    });

    // Layered flame tuft spikes cascading from knee
    b.spike([s * 0.16, 0.70, -0.08], [s * 0.19, 0.58, -0.17], null, 0.032, {
      bone: hipJ,
      color: FEATHER_CEL,
      group: "leg",
    });
    b.spike([s * 0.14, 0.68, -0.04], [s * 0.18, 0.59, -0.11], null, 0.026, {
      bone: hipJ,
      color: FEATHER_CEL,
      group: "leg",
    });

    // Golden knee poleyn armor cup
    b.part(new THREE.ConeGeometry(0.046, 0.08, 6), GOLD_CEL, {
      bone: kneeJ,
      at: [kneeJ.at.x, kneeJ.at.y + 0.015, kneeJ.at.z + 0.026],
      dir: [0, 0.28, 0.96],
      group: "leg",
    });

    // Golden Crus / Tarsus cannon bones (legs firmly planted on dais at y = 0.35)
    b.sweep(catmull([kneeJ.at, hockJ.at]), (t) => 0.034 * (1 - t * 0.22), {
      bone: kneeJ,
      color: GOLD_CEL,
      sides: 8,
      group: "leg",
    });

    b.sweep(catmull([hockJ.at, [s * 0.135, 0.43, -0.02], footJ.at]), (t) => 0.030 * (1 - t * 0.2), {
      bone: hockJ,
      color: GOLD_CEL,
      sides: 8,
      group: "leg",
    });

    // Obsidian rear calcaneal spur
    b.spike(hockJ.at, [s * 0.14, 0.53, -0.16], null, 0.014, {
      bone: hockJ,
      color: OBSIDIAN_DARK,
      group: "leg",
    });

    // Foot pad on dais surface
    b.part(new THREE.SphereGeometry(0.042, 8, 6), GOLD_CEL, {
      bone: footJ,
      at: footJ.at,
      scale: [1, 0.5, 1.3],
      group: "leg",
    });

    // 4 Formidable grasping talons gripping the altar surface
    const claws = [
      { end: [s * 0.13, 0.355, 0.17], tip: [s * 0.13, 0.33, 0.21] },
      { end: [s * 0.065, 0.355, 0.14], tip: [s * 0.035, 0.33, 0.18] },
      { end: [s * 0.195, 0.355, 0.13], tip: [s * 0.23, 0.33, 0.17] },
      { end: [s * 0.13, 0.355, -0.02], tip: [s * 0.13, 0.33, -0.06] },
    ];
    claws.forEach((cl) => {
      b.rod(footJ.at, cl.end, 0.014, GOLD_CEL, { bone: footJ, group: "leg" });
      b.spike(cl.end, cl.tip, null, 0.013, {
        bone: footJ,
        color: OBSIDIAN_DARK,
        group: "leg",
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 6. Proud Breast, Body & Winged Pyro Vision Brooch
  // ---------------------------------------------------------------------------
  // Main torso loft (proud, puffed bird-of-prey chest)
  const bodyPath = catmull([
    [0, 0.88, -0.18],
    [0, 0.96, -0.06],
    [0, 1.12, 0.04],
    [0, 1.28, 0.10],
    [0, 1.42, 0.14],
  ]);
  b.sweep(
    bodyPath,
    (t) => {
      const rx = 0.15 + Math.sin(t * Math.PI) * 0.10;
      const ry = 0.14 + Math.sin(t * Math.PI) * 0.12;
      return [rx, ry];
    },
    {
      bone: [hips, spine1, chest],
      color: BODY_CEL,
      group: "torso",
    },
  );

  // Layered feather ruffs on upper chest (soft overlapping flame crescents)
  for (let r = 0; r < 3; r++) {
    const yL = 1.16 + r * 0.07;
    const zL = 0.23 + r * 0.035;
    for (const s of [1, -1]) {
      b.sweep(
        bezier([0, yL - 0.02, zL + 0.02], [s * 0.11, yL, zL], [s * 0.18, yL - 0.03, zL - 0.04]),
        [0.028, 0.008],
        { bone: chest, color: FEATHER_CEL, group: "torso" },
      );
    }
  }

  // Ceremonial Golden Phoenix Wing-Torc (Collar Assembly)
  const torcPath = catmull(
    [
      [0.15, 1.39, 0.20],
      [0, 1.35, 0.32],
      [-0.15, 1.39, 0.20],
      [-0.12, 1.47, 0.07],
      [0, 1.49, 0.04],
      [0.12, 1.47, 0.07],
    ],
    { closed: true },
  );
  b.sweep(torcPath, 0.016, { bone: chest, color: GOLD_CEL, group: "torso" });

  // Hero Centerpiece: Genshin Pyro Vision Medallion with stylized golden wings
  // Central golden housing
  b.part(new THREE.CylinderGeometry(0.068, 0.068, 0.02, 16), GOLD_CEL, {
    bone: chest,
    at: [0, 1.32, 0.33],
    dir: [0, 0.22, 0.97],
    group: "torso",
    name: "visionMount",
  });
  // Radiant glowing Pyro Vision core
  const visionGem = b.part(new THREE.SphereGeometry(0.058, 16, 12), "#ffffff", {
    bone: chest,
    at: [0, 1.32, 0.342],
    scale: [1, 1, 0.32],
    dir: [0, 0.22, 0.97],
    texture: PYRO_VISION_TEX,
    group: "torso",
    name: "pyroVisionGem",
  });
  glow(visionGem, 2.2);

  // Ornate sculpted gold wings flanking the Vision
  for (const s of [1, -1]) {
    const vWingPath = bezier(
      [s * 0.05, 1.32, 0.33],
      [s * 0.13, 1.37, 0.33],
      [s * 0.18, 1.33, 0.31],
    );
    b.sweep(vWingPath, (t) => [0.035 * (1 - t * 0.5), 0.01], {
      bone: chest,
      color: GOLD_CEL,
      caps: { end: "point" },
      group: "torso",
    });
    // Golden filigree rays
    b.spike([s * 0.055, 1.36, 0.33], [s * 0.10, 1.44, 0.33], null, 0.012, {
      bone: chest,
      color: GOLD_CEL,
      group: "torso",
    });
  }

  // Dangling gold chains and teardrop ruby pendant
  b.rod([0, 1.25, 0.33], [0, 1.15, 0.30], 0.007, GOLD_CEL, { bone: chest, group: "torso" });
  const pendantRuby = b.spike([0, 1.15, 0.30], [0, 1.05, 0.27], null, 0.022, {
    bone: chest,
    color: GLOW_RUBY,
    group: "torso",
  });
  glow(pendantRuby, 2.2);

  // ---------------------------------------------------------------------------
  // 7. Refined Head, Fierce Anime Raptor Mask & Royal Crest Plumes
  // ---------------------------------------------------------------------------
  // S-curved neck tube
  const neckPath = catmull([
    [0, 1.40, 0.14],
    [0, 1.50, 0.18],
    [0, 1.60, 0.22],
    [0, 1.70, 0.26],
  ]);
  b.sweep(neckPath, (t) => 0.115 * (1 - t * 0.36) + 0.02, {
    bone: [chest, neck1, neck2, head],
    color: BODY_CEL,
    group: "neck",
  });

  // Flaming dorsal neck mane (tiered stylized flame spikes)
  const maneSpines = [
    { at: [0, 1.46, 0.06], tip: [0, 1.54, -0.09], r: 0.028 },
    { at: [0, 1.54, 0.10], tip: [0, 1.65, -0.06], r: 0.030 },
    { at: [0, 1.62, 0.14], tip: [0, 1.75, -0.02], r: 0.032 },
    { at: [0, 1.70, 0.18], tip: [0, 1.84, 0.03], r: 0.034 },
    { at: [0, 1.76, 0.22], tip: [0, 1.89, 0.10], r: 0.028 },
  ];
  maneSpines.forEach((sp, i) => {
    b.spike(sp.at, sp.tip, null, sp.r, {
      bone: neck2,
      color: FEATHER_CEL,
      group: "neck",
      name: `maneSpine_${i}`,
    });
    // Glowing incandescent tips
    const mid = lerp(sp.at, sp.tip, 0.65);
    const gTip = b.spike(mid, sp.tip, null, sp.r * 0.65, {
      bone: neck2,
      color: GLOW_CORE,
      group: "neck",
    });
    glow(gTip, 2.0);
  });

  // Cranium: sleek, regal raptor skull
  b.part(new THREE.SphereGeometry(0.092, 14, 10), FEATHER_CEL, {
    bone: head,
    at: head.at,
    scale: [0.92, 0.95, 1.25],
    group: "head",
    name: "cranium",
  });

  // Sleek golden raptor beak (falcon curvature with obsidian cutting tip)
  const beakUpperPath = bezier([0, 1.72, 0.33], [0, 1.71, 0.44], [0, 1.61, 0.49]);
  b.sweep(beakUpperPath, (t) => [0.036 * (1 - t) + 0.005, 0.040 * (1 - t * 0.65) + 0.005], {
    bone: head,
    color: GOLD_CEL,
    caps: { start: "flat", end: "point" },
    group: "head",
    name: "beakUpper",
  });
  // Obsidian lethal beak tip
  b.spike([0, 1.64, 0.46], [0, 1.59, 0.50], null, 0.014, {
    bone: head,
    color: OBSIDIAN_DARK,
    group: "head",
  });

  // Lower beak on jaw joint (hinged so creature can open mouth!)
  const beakLowerPath = bezier([0, 1.66, 0.32], [0, 1.65, 0.41], [0, 1.62, 0.45]);
  b.sweep(beakLowerPath, (t) => [0.028 * (1 - t) + 0.004, 0.022 * (1 - t) + 0.004], {
    bone: jaw,
    color: GOLD_CEL,
    caps: { start: "flat", end: "point" },
    group: "head",
    name: "beakLower",
  });

  // Flaming tongue inside beak
  const tongue = b.spike([0, 1.665, 0.33], [0, 1.64, 0.43], null, 0.016, {
    bone: jaw,
    color: GLOW_CORE,
    group: "head",
  });
  glow(tongue, 2.2);

  // Raptor eyes with bold anime eyeliner decals
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const eyeAt = [s * 0.082, 1.71, 0.32];
    const eyeDir = [s * 0.70, 0.08, 0.70];

    b.part(new THREE.PlaneGeometry(0.062, 0.062), "#ffffff", {
      bone: head,
      at: eyeAt,
      dir: eyeDir,
      axis: "z",
      texture: PHOENIX_EYE_TEX,
      group: "head",
      name: `eye_${side}`,
    });

    // Sharp arched gold brow crest
    b.sweep(
      bezier([s * 0.055, 1.74, 0.36], [s * 0.098, 1.77, 0.32], [s * 0.13, 1.73, 0.24]),
      [0.016, 0.006],
      { bone: head, color: GOLD_CEL, group: "head" },
    );

    // Cheek flame tufts
    b.spike([s * 0.08, 1.66, 0.29], [s * 0.18, 1.62, 0.20], null, 0.026, {
      bone: head,
      color: FEATHER_CEL,
      group: "head",
    });
  }

  // Royal Forehead Crownlet & Star Ruby
  b.part(new THREE.CylinderGeometry(0.055, 0.068, 0.022, 6), GOLD_CEL, {
    bone: head,
    at: [0, 1.78, 0.27],
    rotation: [24, 0, 0],
    group: "head",
  });
  const crownRuby = b.part(new THREE.OctahedronGeometry(0.022), GLOW_RUBY, {
    bone: head,
    at: [0, 1.80, 0.305],
    group: "head",
  });
  glow(crownRuby, 2.4);

  // 5-Tiered Imperial Fenghuang Crest Plumes (Sweeping gracefully back and up)
  // Center plume
  const cPlumePath = catmull([
    [0, 1.80, 0.27],
    [0, 1.98, 0.23],
    [0, 2.06, 0.05],
    [0, 1.96, -0.14],
  ]);
  b.sweep(cPlumePath, (t) => [Math.sin(t * Math.PI) * 0.06 + 0.008, 0.01], {
    bone: head,
    color: FEATHER_CEL,
    caps: { start: "flat", end: "point" },
    group: "head",
    name: "crestCenter",
  });
  const cPlumeGlow = b.spike([0, 2.04, 0.08], [0, 1.98, -0.16], null, 0.02, {
    bone: head,
    color: GLOW_CORE,
    group: "head",
  });
  glow(cPlumeGlow, 2.4);

  // Intermediate & Lateral plumes
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const midPlumePath = catmull([
      [s * 0.04, 1.79, 0.26],
      [s * 0.18, 1.96, 0.17],
      [s * 0.26, 1.90, -0.02],
      [s * 0.20, 1.80, -0.16],
    ]);
    b.sweep(midPlumePath, (t) => [Math.sin(t * Math.PI) * 0.046 + 0.006, 0.008], {
      bone: head,
      color: FEATHER_CEL,
      caps: { start: "flat", end: "point" },
      group: "head",
      name: `crestMid_${side}`,
    });
    const mPlumeGlow = b.spike([s * 0.24, 1.92, 0.03], [s * 0.21, 1.82, -0.18], null, 0.016, {
      bone: head,
      color: GLOW_AMBER,
      group: "head",
    });
    glow(mPlumeGlow, 2.0);

    const lowPlumePath = catmull([
      [s * 0.05, 1.75, 0.23],
      [s * 0.20, 1.84, 0.11],
      [s * 0.27, 1.74, -0.05],
    ]);
    b.sweep(lowPlumePath, (t) => [Math.sin(t * Math.PI) * 0.038 + 0.005, 0.006], {
      bone: head,
      color: FEATHER_CEL,
      caps: { start: "flat", end: "point" },
      group: "head",
      name: `crestLow_${side}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 8. Majestic Tiered Flame Wings (Aerodynamic, Layered, Truly Genshin)
  // ---------------------------------------------------------------------------
  // Wingspan ~2.8m across
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Wing arm bones
    const shoulderJ = b.joint(`shoulder${side}`, {
      parent: chest,
      at: [s * 0.18, 1.27, 0.04],
      role: "arm",
      group: "wing",
    });
    const elbowJ = b.joint(`elbow${side}`, {
      parent: shoulderJ,
      at: [s * 0.54, 1.42, -0.06],
      role: "arm",
      group: "wing",
    });
    const wristJ = b.joint(`wrist${side}`, {
      parent: elbowJ,
      at: [s * 0.98, 1.62, 0.06],
      role: "arm",
      group: "wing",
    });
    const wingTipJ = b.joint(`wingTip${side}`, {
      parent: wristJ,
      at: [s * 1.40, 1.84, 0.22],
      role: "wing",
      group: "wing",
    });

    // Sleek sculpted shoulder pauldron with ruby gem
    b.part(new THREE.ConeGeometry(0.09, 0.16, 6), GOLD_CEL, {
      bone: shoulderJ,
      at: shoulderJ.at,
      rotation: [30, -s * 25, s * 40],
      group: "wing",
      name: `pauldron_${side}`,
    });
    const pGem = b.part(new THREE.OctahedronGeometry(0.026), GLOW_RUBY, {
      bone: shoulderJ,
      at: [shoulderJ.at.x + s * 0.04, shoulderJ.at.y + 0.06, shoulderJ.at.z + 0.04],
      group: "wing",
    });
    glow(pGem, 2.2);

    // Continuous leading edge wing spars
    b.sweep(catmull([shoulderJ.at, elbowJ.at]), (t) => 0.055 * (1 - t * 0.25), {
      bone: shoulderJ,
      color: WINE_DEEP,
      group: "wing",
    });
    b.sweep(catmull([elbowJ.at, wristJ.at]), (t) => 0.045 * (1 - t * 0.25), {
      bone: elbowJ,
      color: WINE_DEEP,
      group: "wing",
    });
    b.sweep(catmull([wristJ.at, wingTipJ.at]), (t) => 0.035 * (1 - t * 0.6) + 0.006, {
      bone: wristJ,
      color: GOLD_CEL,
      caps: { end: "point" },
      group: "wing",
    });

    // Sleek gold chevron armatures along the wing spar (REPLACED THE BLOCKY BOXES!)
    for (let g = 0; g < 4; g++) {
      const u = (g + 0.5) / 4;
      const pt = lerp(elbowJ.at, wristJ.at, u);
      b.sweep(
        bezier(
          [pt.x, pt.y - 0.02, pt.z + 0.01],
          [pt.x + s * 0.02, pt.y + 0.04, pt.z],
          [pt.x, pt.y + 0.02, pt.z - 0.04],
        ),
        0.010,
        { bone: elbowJ, color: GOLD_CEL, group: "wing" },
      );
    }

    // Wrist guard & alula blade
    b.part(new THREE.BoxGeometry(0.06, 0.08, 0.08), GOLD_CEL, {
      bone: wristJ,
      at: wristJ.at,
      group: "wing",
    });
    b.spike(wristJ.at, [s * 1.02, 1.72, 0.18], null, 0.022, {
      bone: wristJ,
      color: GOLD_CEL,
      group: "wing",
    });

    // Solid aerodynamic wing web membrane
    const leadingEdge = catmull([shoulderJ.at, elbowJ.at, wristJ.at, wingTipJ.at]);
    const trailingEdge = catmull([
      [s * 0.24, 1.06, -0.15],
      [s * 0.55, 1.14, -0.18],
      [s * 0.95, 1.28, -0.10],
      [s * 1.35, 1.66, 0.08],
    ]);
    b.membrane(leadingEdge, trailingEdge, {
      thickness: 0.016,
      color: FEATHER_CEL,
      bone: elbowJ,
      group: "wing",
      name: `wingMembrane_${side}`,
    });

    // Tier 1: 8 Primary Flight Flame Blades (Grand, broad, curved scythes)
    const primaryCount = 8;
    for (let k = 0; k < primaryCount; k++) {
      const u = k / (primaryCount - 1);
      const root = lerp(wristJ.at, wingTipJ.at, u * 0.88);

      const tipX = s * (1.40 - u * 0.44);
      const tipY = 1.84 - u * 0.60;
      const tipZ = 0.22 - u * 0.45;

      const midPt = [
        s * (0.86 + (1.40 - u * 0.44 - 0.86) * 0.55),
        1.68 - u * 0.32,
        0.14 - u * 0.22,
      ];

      const fPath = bezier(root, midPt, [tipX, tipY, tipZ]);
      const bladeW = 0.08 + (1 - u) * 0.035;

      b.sweep(fPath, (t) => [Math.sin(t * Math.PI) * bladeW + 0.006, 0.009], {
        bone: wristJ,
        color: FEATHER_CEL,
        caps: { start: "flat", end: "point" },
        group: "wing",
        name: `primary_${side}_${k}`,
      });

      // Gold central quill rod
      b.rod(root, [tipX, tipY, tipZ], 0.004, GOLD_CEL, { bone: wristJ, group: "wing" });

      // Outermost 4 primaries ignite with blazing flame spikes
      if (k < 4) {
        const glowTip = b.spike(
          [tipX - s * 0.06, tipY - 0.06, tipZ],
          [tipX + s * 0.10, tipY + 0.10, tipZ + 0.05],
          null,
          0.02,
          { bone: wristJ, color: GLOW_AMBER, group: "wing" },
        );
        glow(glowTip, 2.0);
      }
    }

    // Tier 2: 6 Secondary Flight Flame Feathers
    const secondaryCount = 6;
    for (let k = 0; k < secondaryCount; k++) {
      const u = k / (secondaryCount - 1);
      const root = lerp(elbowJ.at, wristJ.at, u);

      const tipX = s * (0.52 + u * 0.42);
      const tipY = 1.04 + u * 0.22;
      const tipZ = -0.18 - (1 - u) * 0.12;
      const midPt = [s * (0.50 + u * 0.40), 1.22 + u * 0.18, -0.14];

      const secPath = bezier(root, midPt, [tipX, tipY, tipZ]);
      b.sweep(secPath, (t) => [Math.sin(t * Math.PI) * 0.075 + 0.006, 0.008], {
        bone: elbowJ,
        color: FEATHER_CEL,
        caps: { start: "flat", end: "point" },
        group: "wing",
        name: `secondary_${side}_${k}`,
      });
      b.rod(root, [tipX, tipY, tipZ], 0.0035, GOLD_CEL, { bone: elbowJ, group: "wing" });
    }

    // Tier 3: Wing Coverts (Streamlined flame leaf scales along upper wing)
    for (let c = 0; c < 5; c++) {
      const u = c / 4;
      const cvRoot = lerp(shoulderJ.at, wristJ.at, u);
      b.sweep(
        bezier(
          [cvRoot.x, cvRoot.y + 0.02, cvRoot.z],
          [cvRoot.x + s * 0.04, cvRoot.y, cvRoot.z - 0.06],
          [cvRoot.x + s * 0.02, cvRoot.y - 0.08, cvRoot.z - 0.12],
        ),
        [0.035, 0.006],
        { bone: shoulderJ, color: FEATHER_CEL, caps: { end: "point" }, group: "wing" },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // 9. Imperial Fenghuang Calligraphy Tail Ribbons
  // ---------------------------------------------------------------------------
  // Rump fan coverts
  const rumpCoverts = [
    { at: [0, 0.90, -0.32], rot: [35, 0, 0] },
    { at: [0.10, 0.88, -0.30], rot: [32, -18, 15] },
    { at: [-0.10, 0.88, -0.30], rot: [32, 18, -15] },
    { at: [0.18, 0.85, -0.27], rot: [28, -32, 25] },
    { at: [-0.18, 0.85, -0.27], rot: [28, 32, -25] },
  ];
  rumpCoverts.forEach((rc, i) => {
    b.sweep(
      bezier(
        [rc.at[0], rc.at[1], rc.at[2]],
        [rc.at[0] * 1.3, rc.at[1] - 0.08, rc.at[2] - 0.12],
        [rc.at[0] * 1.5, rc.at[1] - 0.18, rc.at[2] - 0.22],
      ),
      [0.045, 0.008],
      { bone: tailBase, color: FEATHER_CEL, caps: { end: "point" }, group: "tail", name: `rumpCovert_${i}` },
    );
  });

  // Central Grand Streamer Ribbon (sweeping back, down, and coiling forward)
  const tailC_1 = b.joint("tailC_1", { parent: tailBase, at: [0, 0.74, -0.42], role: "tail", group: "tail" });
  const tailC_2 = b.joint("tailC_2", { parent: tailC_1, at: [0, 0.50, -0.52], role: "tail", group: "tail" });
  const tailC_3 = b.joint("tailC_3", { parent: tailC_2, at: [0, 0.26, -0.48], role: "tail", group: "tail" });
  const tailC_4 = b.joint("tailC_4", { parent: tailC_3, at: [0, 0.12, -0.32], role: "tail", group: "tail" });

  const cRibbonPath = catmull([tailBase.at, tailC_1.at, tailC_2.at, tailC_3.at, tailC_4.at, [0, 0.06, -0.15]]);
  b.sweep(cRibbonPath, (t) => [0.05 + t * 0.055, 0.008], {
    bone: [tailBase, tailC_1, tailC_2, tailC_3, tailC_4],
    color: FEATHER_CEL,
    group: "tail",
    name: "centerRibbon",
  });

  // Golden eyelets with glowing Pyro jewels along Center Ribbon
  [0.22, 0.52, 0.82].forEach((tVal) => {
    const pt = cRibbonPath.at(tVal);
    b.part(new THREE.TorusGeometry(0.048, 0.01, 8, 16), GOLD_CEL, {
      bone: tailC_2,
      at: [pt.x, pt.y, pt.z],
      dir: [0, 0.3, 0.95],
      group: "tail",
    });
    const jewel = b.part(new THREE.SphereGeometry(0.026, 8, 8), GLOW_RUBY, {
      bone: tailC_2,
      at: [pt.x, pt.y, pt.z],
      group: "tail",
    });
    glow(jewel, 2.2);
  });

  // Terminal swallowtail flame blossom at center ribbon tip
  const cTipPt = [0, 0.06, -0.15];
  const cBlossom = b.spike(cTipPt, [0, 0.06, 0.04], null, 0.045, {
    bone: tailC_4,
    color: GLOW_CORE,
    group: "tail",
    name: "centerBlossom",
  });
  glow(cBlossom, 2.4);
  for (const s of [1, -1]) {
    const fork = b.spike(cTipPt, [s * 0.14, 0.07, -0.04], null, 0.028, {
      bone: tailC_4,
      color: FLAME_ORANGE,
      group: "tail",
    });
    glow(fork, 2.0);
  }

  // Lateral Streamer Ribbons (Sweeping outward to frame the creature in 3/4 & front views!)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const tailL_1 = b.joint(`tail${side}_1`, {
      parent: tailBase,
      at: [s * 0.26, 0.68, -0.38],
      role: "tail",
      group: "tail",
    });
    const tailL_2 = b.joint(`tail${side}_2`, {
      parent: tailL_1,
      at: [s * 0.44, 0.42, -0.36],
      role: "tail",
      group: "tail",
    });
    const tailL_3 = b.joint(`tail${side}_3`, {
      parent: tailL_2,
      at: [s * 0.38, 0.18, -0.20],
      role: "tail",
      group: "tail",
    });

    const latPath = catmull([
      [s * 0.10, 0.88, -0.22],
      tailL_1.at,
      tailL_2.at,
      tailL_3.at,
      [s * 0.25, 0.06, -0.04],
    ]);
    b.sweep(latPath, (t) => [0.045 + t * 0.042, 0.007], {
      bone: [tailBase, tailL_1, tailL_2, tailL_3],
      color: FEATHER_CEL,
      group: "tail",
      name: `latRibbon_${side}`,
    });

    // Eyelets on lateral ribbons
    [0.32, 0.72].forEach((tVal) => {
      const pt = latPath.at(tVal);
      b.part(new THREE.TorusGeometry(0.04, 0.009, 8, 14), GOLD_CEL, {
        bone: tailL_2,
        at: [pt.x, pt.y, pt.z],
        dir: [s * 0.4, 0.3, 0.87],
        group: "tail",
      });
      const sJewel = b.part(new THREE.SphereGeometry(0.023, 8, 8), GLOW_AMBER, {
        bone: tailL_2,
        at: [pt.x, pt.y, pt.z],
        group: "tail",
      });
      glow(sJewel, 2.0);
    });

    // Terminal fan on lateral ribbon tip
    const sTipPt = [s * 0.25, 0.06, -0.04];
    const sBlossom = b.spike(sTipPt, [s * 0.32, 0.06, 0.08], null, 0.035, {
      bone: tailL_3,
      color: GLOW_FIRE,
      group: "tail",
    });
    glow(sBlossom, 2.0);
  }

  // ---------------------------------------------------------------------------
  // 10. Floating Elemental Pyro Embers & Ambient Wisps
  // ---------------------------------------------------------------------------
  const emberSlots = [
    { at: [0.72, 1.86, 0.15], rot: [10, 20, 30] },
    { at: [-0.72, 1.86, 0.15], rot: [10, -20, -30] },
    { at: [1.28, 1.68, 0.12], rot: [15, 45, 10] },
    { at: [-1.28, 1.68, 0.12], rot: [15, -45, -10] },
    { at: [0.22, 1.98, 0.06], rot: [-20, 15, 40] },
    { at: [-0.22, 1.98, 0.06], rot: [-20, -15, -40] },
    { at: [0.42, 0.58, -0.42], rot: [30, 25, 15] },
    { at: [-0.42, 0.58, -0.42], rot: [30, -25, -15] },
  ];

  emberSlots.forEach((emb, i) => {
    const card = b.part(new THREE.PlaneGeometry(0.048, 0.096), "#ffffff", {
      at: emb.at as [number, number, number],
      rotation: emb.rot as [number, number, number],
      texture: EMBER_TEX,
      group: "particles",
      name: `pyroEmber_${i}`,
    });
    glow(card, 2.2);
  });

  return b.root;
}
