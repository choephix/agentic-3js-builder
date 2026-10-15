Here is what was improved to elevate the model to Genshin Impact art direction:

1. **Connected Leg & Talon Perch**: Fixed the severe floating air gap between the hocks and the dais. The leg is now structured as an authentic raptor digitigrade limb—feathered muscular thigh (`hip` $\rightarrow$ `knee`), golden poleyn knee guard, swept tarsus (`knee` $\rightarrow$ `hock` $\rightarrow$ `foot pad`), firmly landing the foot pad on the dais at $y = 0.36\,\text{m}$ with 4 golden talons and obsidian claws gripping the stone.
2. **Proud Breast, Torc & Hero Pyro Vision**: The chest armor and Pyro Vision were previously submerged inside the torso sweep volume. Relocated the breastplate assembly, golden ceremonial torc, and glowing winged Pyro Vision medallion forward onto the surface ($z = 0.34\text{--}0.37\,\text{m}$), complete with filigree wing prongs and dangling ruby tear gems.
3. **Majestic Layered Flame Wings**: Replaced the sparse, comb-like wing slats with grand, layered Genshin-style flame wings:
   - Ornate golden leading-edge wing spars with shoulder pauldron and wrist carpal guards.
   - Solid swept wing aerofoil base so the wing reads as a powerful aerial surface.
   - Tiered coverts with gold-trimmed flame chevrons.
   - 8 broad, overlapping primary flame scythe blades and 6 secondary flight feathers sweeping back and upward with radiant glowing tips.
4. **Regal Head, Eyes & Blazing Imperial Crest**:
   - Reshaped the head into a sharp, proud raptor profile with crisp hooked beak and parted lower jaw exposing an inner flame tongue.
   - Enlarged and re-angled the anime raptor eyes with bold golden eyeliner brows that read clearly from front and three-quarter angles.
   - Built a 5-tiered royal flame crest rising from a gold forehead tiara with an embedded star ruby, curling dramatically upward and back.
5. **Flowing Imperial Tail Streamers**: Enhanced the triple Fenghuang tail ribbons with undulating S-curves cascading over the dais, accented by golden filigree cartouche eyelets with glowing ruby cores and flared swallowtail blossom tips.

```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { lerp } from "agentic-3js-builder";
import { bezier, catmull } from "agentic-3js-builder";
import { mix, noise, paint, smoothstep } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

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
  const OBSIDIAN_BASE = "#181420";
  const OBSIDIAN_PURPLE = "#2a2238";

  // Glowing elemental colors (flat colors for glow kit)
  const EMISSIVE_FLAME = "#ff5500";
  const EMISSIVE_CORE = "#fff47a";
  const EMISSIVE_AMBER = "#ffaa14";
  const EMISSIVE_RUBY = "#ff2032";

  // Custom Genshin cel-shaded paints
  const FLAME_PLUMAGE = paint((p, n) => {
    const h = smoothstep(0.4, 1.9, p.y);
    const facing = smoothstep(-0.2, 0.8, n.y * 0.7 + n.z * 0.3);
    const baseCol = mix(WINE_SHADOW, CRIMSON, h * 0.8 + 0.2);
    const midCol = mix(baseCol, SOLAR_ORANGE, facing * 0.75);
    return mix(midCol, AMBER_GLOW, smoothstep(0.5, 0.95, facing * 0.6 + h * 0.5));
  });

  const BODY_FEATHER = paint((p, n) => {
    const isChest = smoothstep(0.1, 0.8, n.z) * smoothstep(0.85, 1.45, p.y);
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
      <path d="M4 64 Q64 8 124 64 Q64 120 4 64Z" fill="#180c1a" stroke="#ffb820" stroke-width="4"/>
      <ellipse cx="64" cy="64" rx="42" ry="46" fill="url(#irisGrad)"/>
      <circle cx="64" cy="64" r="34" fill="none" stroke="#fff480" stroke-width="2.5" stroke-dasharray="4 4"/>
      <ellipse cx="64" cy="64" rx="10" ry="28" fill="#12040e"/>
      <ellipse cx="52" cy="48" rx="8" ry="11" fill="#ffffff" opacity="0.95"/>
      <circle cx="78" cy="76" r="4.5" fill="#ffffff" opacity="0.85"/>
      <path d="M110 56 Q124 46 126 32" stroke="#ffaa20" stroke-width="4.5" stroke-linecap="round" fill="none"/>
      <path d="M104 68 Q122 74 126 86" stroke="#ffaa20" stroke-width="3.5" stroke-linecap="round" fill="none"/>
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
      <path d="M64 24 C76 42 88 52 88 68 C88 84 76 96 64 98 C52 96 40 84 40 68 C40 52 52 42 64 24 Z" fill="#fffbe0" opacity="0.92"/>
      <path d="M64 38 C72 52 80 58 80 70 C80 80 72 88 64 90 C56 88 48 80 48 70 C48 58 56 52 64 38 Z" fill="#ff7a18"/>
      <path d="M64 52 C68 62 74 66 74 72 C74 76 70 82 64 84 C58 82 54 76 54 72 C54 66 60 62 64 52 Z" fill="#fffbe0"/>
    </svg>`,
    { size: 256 },
  );

  const DAIS_RUNES_TEX = svg(
    `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="runeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ff7b1a" stop-opacity="0.85"/>
          <stop offset="70%" stop-color="#d12316" stop-opacity="0.45"/>
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
  // 1. Creature Skeleton (Phoenix Rig Architecture)
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
    at: [0, 1.64, 0.29],
    dir: [0, -0.15, 0.98],
    role: "jaw",
    group: "head",
  });

  // Tail root joint
  const tailBase = b.joint("tailBase", { parent: hips, at: [0, 0.88, -0.22], role: "tail", group: "tail" });

  // ---------------------------------------------------------------------------
  // 2. Staged Pedestal / Altar Dais Base (stands firmly on y = 0)
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
  // 3. Legs and Talons (Firmly Perched on Dais at y = 0.35)
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipJ = b.joint(`hip${side}`, { parent: hips, at: [s * 0.14, 0.90, -0.05], role: "leg" });
    const kneeJ = b.joint(`knee${side}`, { parent: hipJ, at: [s * 0.16, 0.68, -0.06], role: "leg" });
    const hockJ = b.joint(`hock${side}`, { parent: kneeJ, at: [s * 0.14, 0.50, -0.10], role: "leg" });
    const footJ = b.joint(`foot${side}`, { parent: hockJ, at: [s * 0.13, 0.36, 0.06], role: "leg" });

    // Upper thigh: sleek feathered plumage sweep
    b.sweep(bezier(hipJ.at, [s * 0.15, 0.78, -0.05], kneeJ.at), [0.08, 0.055], {
      bone: hipJ,
      color: BODY_FEATHER,
      group: "leg",
    });

    // Flared knee feather cuff
    b.sweep(catmull([kneeJ.at, [s * 0.17, 0.64, -0.12], [s * 0.19, 0.58, -0.16]]), [0.05, 0.01], {
      bone: hipJ,
      color: FLAME_PLUMAGE,
      caps: { end: "point" },
      group: "leg",
    });

    // Golden poleyn knee armor
    b.part(new THREE.ConeGeometry(0.045, 0.08, 6), GOLD_METAL, {
      bone: kneeJ,
      at: [kneeJ.at.x, kneeJ.at.y + 0.01, kneeJ.at.z + 0.025],
      dir: [0, 0.25, 0.97],
      group: "leg",
    });

    // Shank: knee down and back to hock
    b.sweep(catmull([kneeJ.at, hockJ.at]), (t) => 0.034 * (1 - t * 0.2), {
      bone: kneeJ,
      color: GOLD_METAL,
      sides: 8,
      group: "leg",
    });

    // Tarsus: hock forward and down to foot pad on the dais (NO AIR GAP!)
    b.sweep(catmull([hockJ.at, [s * 0.135, 0.42, -0.02], footJ.at]), (t) => 0.028 * (1 - t * 0.15), {
      bone: hockJ,
      color: GOLD_METAL,
      sides: 8,
      group: "leg",
    });

    // Rear calcaneal spur at hock
    b.spike(hockJ.at, [s * 0.14, 0.51, -0.16], null, 0.014, {
      bone: hockJ,
      color: OBSIDIAN_BASE,
      group: "leg",
    });

    // Foot pad resting solidly on dais surface
    b.part(new THREE.SphereGeometry(0.038, 8, 6), GOLD_METAL, {
      bone: footJ,
      at: footJ.at,
      scale: [1, 0.55, 1.3],
      group: "leg",
    });

    // 3 Front Grasping Talons + 1 Rear Hallux Talon gripping the stone rim
    const toes = [
      { end: [s * 0.13, 0.355, 0.16], claw: [s * 0.13, 0.33, 0.20] },
      { end: [s * 0.07, 0.355, 0.14], claw: [s * 0.04, 0.33, 0.17] },
      { end: [s * 0.19, 0.355, 0.13], claw: [s * 0.22, 0.33, 0.16] },
      { end: [s * 0.13, 0.355, -0.02], claw: [s * 0.13, 0.33, -0.05] },
    ];

    toes.forEach((toe) => {
      // Golden digit
      b.rod(footJ.at, toe.end, 0.013, GOLD_METAL, { bone: footJ, group: "leg" });
      // Curved obsidian talon gripping downward
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

  // Layered pectoral chevron breast plates (Genshin costume armor properly placed at chest surface z ~ 0.31-0.34)
  const breastPlates = [
    { at: [0, 1.14, 0.26], size: [0.18, 0.05, 0.025], rot: 25 },
    { at: [0, 1.22, 0.30], size: [0.22, 0.055, 0.028], rot: 20 },
    { at: [0, 1.30, 0.33], size: [0.24, 0.06, 0.03], rot: 15 },
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
    b.part(new THREE.BoxGeometry(pl.size[0] * 1.04, pl.size[1] * 0.25, pl.size[2] * 1.1), GOLD_METAL, {
      bone: chest,
      at: [pl.at[0], pl.at[1] + 0.018, pl.at[2] + 0.008],
      rotation: [pl.rot, 0, 0],
      group: "torso",
    });
  });

  // Ceremonial Golden Torc around the collar
  const torcPath = catmull(
    [
      [0.14, 1.37, 0.20],
      [0, 1.33, 0.34],
      [-0.14, 1.37, 0.20],
      [-0.11, 1.45, 0.08],
      [0, 1.47, 0.05],
      [0.11, 1.45, 0.08],
    ],
    { closed: true },
  );
  b.sweep(torcPath, 0.016, { bone: chest, color: GOLD_METAL, group: "torso" });

  // Center Pectoral Pyro Vision Talisman (Hero Focal Detail)
  // Bezel casing standing proudly on the breast at z = 0.355
  b.part(new THREE.CylinderGeometry(0.062, 0.062, 0.016, 16), GOLD_METAL, {
    bone: chest,
    at: [0, 1.30, 0.35],
    dir: [0, 0.22, 0.97],
    group: "torso",
    name: "visionBezel",
  });
  // The Glowing Pyro Vision Gem
  const visionGem = b.part(new THREE.SphereGeometry(0.052, 16, 12), "#ffffff", {
    bone: chest,
    at: [0, 1.30, 0.36],
    scale: [1, 1, 0.35],
    dir: [0, 0.22, 0.97],
    texture: PYRO_VISION_TEX,
    group: "torso",
    name: "pyroVision",
  });
  glow(visionGem, 2.0);

  // 4 Golden filigree wing prongs clasping the Vision
  for (let a = 0; a < 4; a++) {
    const ang = (a * Math.PI) / 2 + Math.PI / 4;
    const px = Math.sin(ang) * 0.062;
    const py = Math.cos(ang) * 0.062;
    b.spike([px, 1.30 + py, 0.35], [px * 1.35, 1.30 + py * 1.35, 0.365], null, 0.012, {
      bone: chest,
      color: GOLD_METAL,
      group: "torso",
    });
  }

  // Dangling gold chains and ruby pendant from the Vision
  b.rod([0, 1.23, 0.35], [0, 1.13, 0.32], 0.006, GOLD_METAL, { bone: chest, group: "torso" });
  const pendantRuby = b.spike([0, 1.13, 0.32], [0, 1.05, 0.30], null, 0.02, {
    bone: chest,
    color: EMISSIVE_RUBY,
    group: "torso",
  });
  glow(pendantRuby, 2.2);

  // ---------------------------------------------------------------------------
  // 5. Neck, Head, Beak & Royal Crest
  // ---------------------------------------------------------------------------
  // S-curve neck tube
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
    { at: [0, 1.44, 0.06], dir: [0, 0.3, -0.95], len: 0.15, r: 0.028 },
    { at: [0, 1.52, 0.10], dir: [0, 0.45, -0.9], len: 0.18, r: 0.03 },
    { at: [0, 1.60, 0.14], dir: [0, 0.6, -0.8], len: 0.20, r: 0.032 },
    { at: [0, 1.68, 0.18], dir: [0, 0.75, -0.66], len: 0.22, r: 0.034 },
    { at: [0, 1.74, 0.21], dir: [0, 0.88, -0.47], len: 0.19, r: 0.028 },
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
        sp.at[0] + sp.dir[0] * sp.len * 0.7,
        sp.at[1] + sp.dir[1] * sp.len * 0.7,
        sp.at[2] + sp.dir[2] * sp.len * 0.7,
      ],
      tipPt,
      null,
      sp.r * 0.6,
      { bone: neck2, color: EMISSIVE_CORE, group: "neck" },
    );
    glow(glowTip, 1.8);
  });

  // Raptor cranium
  b.part(new THREE.SphereGeometry(0.09, 14, 10), FLAME_PLUMAGE, {
    bone: head,
    at: head.at,
    scale: [0.95, 0.95, 1.25],
    group: "head",
    name: "cranium",
  });

  // Upper beak: sharp curved royal raptor hook
  const beakUpperPath = bezier([0, 1.71, 0.32], [0, 1.70, 0.42], [0, 1.60, 0.47]);
  b.sweep(beakUpperPath, (t) => [0.038 * (1 - t) + 0.005, 0.042 * (1 - t * 0.65) + 0.005], {
    bone: head,
    color: GOLD_METAL,
    caps: { start: "flat", end: "point" },
    group: "head",
    name: "beakUpper",
  });
  // Obsidian cutting edge on beak tip
  b.spike([0, 1.64, 0.44], [0, 1.58, 0.48], null, 0.014, {
    bone: head,
    color: OBSIDIAN_BASE,
    group: "head",
  });
  // Gold nostril cere shield plate
  b.part(new THREE.BoxGeometry(0.05, 0.026, 0.06), GOLD_METAL, {
    bone: head,
    at: [0, 1.71, 0.33],
    rotation: [15, 0, 0],
    group: "head",
  });

  // Lower beak (on jaw joint so it can open!)
  const beakLowerPath = bezier([0, 1.65, 0.31], [0, 1.64, 0.39], [0, 1.61, 0.43]);
  b.sweep(beakLowerPath, (t) => [0.03 * (1 - t) + 0.004, 0.024 * (1 - t) + 0.004], {
    bone: jaw,
    color: GOLD_METAL,
    caps: { start: "flat", end: "point" },
    group: "head",
    name: "beakLower",
  });

  // Glowing flaming tongue inside the mouth
  const flameTongue = b.spike([0, 1.655, 0.32], [0, 1.63, 0.41], null, 0.016, {
    bone: jaw,
    color: EMISSIVE_CORE,
    group: "head",
    name: "tongue",
  });
  glow(flameTongue, 2.2);

  // Anime Raptor Eyes (Left & Right) - larger, well-angled and clearly readable!
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const eyeAt = [s * 0.076, 1.70, 0.31];
    const eyeDir = [s * 0.72, 0.08, 0.68];

    b.part(new THREE.PlaneGeometry(0.058, 0.058), "#ffffff", {
      bone: head,
      at: eyeAt,
      dir: eyeDir,
      axis: "z",
      texture: PHOENIX_EYE_TEX,
      group: "head",
      name: `eye_${side}`,
    });

    // Dramatic golden arched brow crest framing eye
    b.sweep(
      bezier(
        [s * 0.055, 1.73, 0.35],
        [s * 0.095, 1.76, 0.31],
        [s * 0.12, 1.72, 0.24],
      ),
      [0.014, 0.006],
      { bone: head, color: GOLD_METAL, group: "head" },
    );

    // Cheek flame tufts
    b.spike([s * 0.08, 1.65, 0.28], [s * 0.18, 1.61, 0.19], null, 0.024, {
      bone: head,
      color: FLAME_PLUMAGE,
      group: "head",
    });
  }

  // Golden Royal Tiara / Crownlet on Forehead
  b.part(new THREE.CylinderGeometry(0.055, 0.065, 0.022, 6), GOLD_METAL, {
    bone: head,
    at: [0, 1.77, 0.26],
    rotation: [22, 0, 0],
    group: "head",
  });
  // Center Crown Star Ruby
  const crownRuby = b.part(new THREE.OctahedronGeometry(0.022), EMISSIVE_RUBY, {
    bone: head,
    at: [0, 1.79, 0.295],
    group: "head",
  });
  glow(crownRuby, 2.2);

  // 5-Tiered Royal Flame Crest Plumes
  // 1. Center Plume (grandest, sweeps high and arcs backward to y = 2.05m)
  const centerPlumePath = catmull([
    [0, 1.79, 0.26],
    [0, 1.96, 0.22],
    [0, 2.05, 0.04],
    [0, 1.94, -0.14],
  ]);
  b.sweep(centerPlumePath, (t) => [Math.sin(t * Math.PI) * 0.055 + 0.008, 0.01], {
    bone: head,
    color: FLAME_PLUMAGE,
    caps: { start: "flat", end: "point" },
    group: "head",
    name: "crestCenter",
  });
  const crestCore = b.spike([0, 2.02, 0.10], [0, 1.96, -0.16], null, 0.018, {
    bone: head,
    color: EMISSIVE_CORE,
    group: "head",
  });
  glow(crestCore, 2.2);

  // 2 & 3. Intermediate Plumes (Left & Right)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const midPlumePath = catmull([
      [s * 0.04, 1.78, 0.25],
      [s * 0.16, 1.94, 0.16],
      [s * 0.24, 1.88, -0.02],
      [s * 0.19, 1.78, -0.15],
    ]);
    b.sweep(midPlumePath, (t) => [Math.sin(t * Math.PI) * 0.042 + 0.006, 0.008], {
      bone: head,
      color: FLAME_PLUMAGE,
      caps: { start: "flat", end: "point" },
      group: "head",
      name: `crestMid_${side}`,
    });
    const midGlow = b.spike([s * 0.22, 1.90, 0.04], [s * 0.20, 1.80, -0.16], null, 0.014, {
      bone: head,
      color: EMISSIVE_AMBER,
      group: "head",
    });
    glow(midGlow, 1.9);

    // 4 & 5. Lower Lateral Flared Plumes
    const lowPlumePath = catmull([
      [s * 0.05, 1.74, 0.22],
      [s * 0.18, 1.82, 0.10],
      [s * 0.25, 1.72, -0.05],
    ]);
    b.sweep(lowPlumePath, (t) => [Math.sin(t * Math.PI) * 0.035 + 0.005, 0.006], {
      bone: head,
      color: FLAME_PLUMAGE,
      caps: { start: "flat", end: "point" },
      group: "head",
      name: `crestLow_${side}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 6. Wings Spread in Full Majestic Flight (True Genshin Flame Aerofoil)
  // ---------------------------------------------------------------------------
  // Arched majestic wingspan ~2.8m across
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
      at: [s * 0.54, 1.40, -0.06],
      role: "arm",
      group: "wing",
    });
    const wristJ = b.joint(`wrist${side}`, {
      parent: elbowJ,
      at: [s * 0.96, 1.60, 0.06],
      role: "arm",
      group: "wing",
    });
    const wingTipJ = b.joint(`wingTip${side}`, {
      parent: wristJ,
      at: [s * 1.38, 1.82, 0.22],
      role: "wing",
      group: "wing",
    });

    // Shoulder Pauldron (Genshin wing armor plate with ruby gem)
    b.part(new THREE.BoxGeometry(0.14, 0.16, 0.11), GOLD_METAL, {
      bone: shoulderJ,
      at: shoulderJ.at,
      rotation: [0, -s * 20, s * 25],
      group: "wing",
      name: `pauldron_${side}`,
    });
    const pauldronRuby = b.part(new THREE.OctahedronGeometry(0.024), EMISSIVE_RUBY, {
      bone: shoulderJ,
      at: [shoulderJ.at.x + s * 0.04, shoulderJ.at.y + 0.06, shoulderJ.at.z + 0.04],
      group: "wing",
    });
    glow(pauldronRuby, 2.0);

    // Wing leading edge armor spars (smooth continuous gold & wine armatures)
    b.sweep(catmull([shoulderJ.at, elbowJ.at]), (t) => 0.055 * (1 - t * 0.25), {
      bone: shoulderJ,
      color: WINE_SHADOW,
      group: "wing",
    });
    b.sweep(catmull([elbowJ.at, wristJ.at]), (t) => 0.045 * (1 - t * 0.25), {
      bone: elbowJ,
      color: WINE_SHADOW,
      group: "wing",
    });
    b.sweep(catmull([wristJ.at, wingTipJ.at]), (t) => 0.035 * (1 - t * 0.6) + 0.006, {
      bone: wristJ,
      color: GOLD_METAL,
      caps: { end: "point" },
      group: "wing",
    });

    // Wrist carpal guard & alula blade
    b.part(new THREE.BoxGeometry(0.06, 0.08, 0.08), GOLD_METAL, {
      bone: wristJ,
      at: wristJ.at,
      group: "wing",
    });
    b.spike(wristJ.at, [s * 0.98, 1.70, 0.18], null, 0.02, {
      bone: wristJ,
      color: GOLD_METAL,
      group: "wing",
    });

    // SOLID WING FLAME WEB MEMBRANE (Connects wing spars into a cohesive, grand aerofoil)
    const leadingEdge = catmull([shoulderJ.at, elbowJ.at, wristJ.at, wingTipJ.at]);
    const trailingEdge = catmull([
      [s * 0.24, 1.05, -0.15],
      [s * 0.55, 1.12, -0.18],
      [s * 0.95, 1.25, -0.10],
      [s * 1.34, 1.65, 0.08],
    ]);
    b.membrane(leadingEdge, trailingEdge, {
      thickness: 0.016,
      color: FLAME_PLUMAGE,
      bone: elbowJ,
      group: "wing",
      name: `wingWeb_${side}`,
    });

    // 8 Grand Primary Flight Feathers (Overlapping broad flame scythe blades)
    const primaryCount = 8;
    for (let k = 0; k < primaryCount; k++) {
      const u = k / (primaryCount - 1);
      const root = lerp(wristJ.at, wingTipJ.at, u * 0.88);

      const tipX = s * (1.38 - u * 0.44);
      const tipY = 1.82 - u * 0.60;
      const tipZ = 0.22 - u * 0.45;

      const midX = s * (0.85 + (1.38 - u * 0.44 - 0.85) * 0.55);
      const midY = 1.66 - u * 0.32;
      const midZ = 0.14 - u * 0.22;

      const featherPath = bezier(root, [midX, midY, midZ], [tipX, tipY, tipZ]);
      const bladeW = 0.075 + (1 - u) * 0.03;

      // Broad flame blade
      b.sweep(featherPath, (t) => [Math.sin(t * Math.PI) * bladeW + 0.005, 0.008], {
        bone: wristJ,
        color: FLAME_PLUMAGE,
        caps: { start: "flat", end: "point" },
        group: "wing",
        name: `primary_${side}_${k}`,
      });

      // Gold filigree spine quill
      b.rod(root, [tipX, tipY, tipZ], 0.004, GOLD_METAL, { bone: wristJ, group: "wing" });

      // Outermost 3 primaries carry blazing elemental flame spikes
      if (k < 3) {
        const glowTip = b.spike(
          [tipX - s * 0.06, tipY - 0.06, tipZ],
          [tipX + s * 0.09, tipY + 0.09, tipZ + 0.05],
          null,
          0.018,
          { bone: wristJ, color: EMISSIVE_AMBER, group: "wing" },
        );
        glow(glowTip, 1.9);
      }
    }

    // 6 Secondary Flight Feathers (along forearm)
    const secondaryCount = 6;
    for (let k = 0; k < secondaryCount; k++) {
      const u = k / (secondaryCount - 1);
      const root = lerp(elbowJ.at, wristJ.at, u);

      const tipX = s * (0.50 + u * 0.42);
      const tipY = 1.02 + u * 0.20;
      const tipZ = -0.18 - (1 - u) * 0.12;

      const midPt = [s * (0.48 + u * 0.40), 1.20 + u * 0.16, -0.14];

      const secPath = bezier(root, midPt, [tipX, tipY, tipZ]);
      b.sweep(secPath, (t) => [Math.sin(t * Math.PI) * 0.07 + 0.005, 0.008], {
        bone: elbowJ,
        color: FLAME_PLUMAGE,
        caps: { start: "flat", end: "point" },
        group: "wing",
        name: `secondary_${side}_${k}`,
      });
      b.rod(root, [tipX, tipY, tipZ], 0.0035, GOLD_METAL, { bone: elbowJ, group: "wing" });
    }

    // Wing Covert Scales (Layered flame armor plates along leading edge)
    for (let c = 0; c < 5; c++) {
      const u = c / 4;
      const cvRoot = lerp(shoulderJ.at, wristJ.at, u);
      b.part(new THREE.BoxGeometry(0.08, 0.11, 0.024), FLAME_PLUMAGE, {
        bone: shoulderJ,
        at: [cvRoot.x, cvRoot.y + 0.02, cvRoot.z - 0.02],
        rotation: [-15, -s * 25, s * 15],
        group: "wing",
      });
      b.part(new THREE.BoxGeometry(0.086, 0.025, 0.028), GOLD_METAL, {
        bone: shoulderJ,
        at: [cvRoot.x, cvRoot.y + 0.055, cvRoot.z - 0.015],
        rotation: [-15, -s * 25, s * 15],
        group: "wing",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 7. Imperial Fenghuang Triple Tail Ribbons
  // ---------------------------------------------------------------------------
  // Rump covert fan of 5 broad flame spades
  const rumpCoverts = [
    { at: [0, 0.89, -0.32], rot: [35, 0, 0] },
    { at: [0.10, 0.87, -0.30], rot: [32, -18, 15] },
    { at: [-0.10, 0.87, -0.30], rot: [32, 18, -15] },
    { at: [0.18, 0.84, -0.27], rot: [28, -32, 25] },
    { at: [-0.18, 0.84, -0.27], rot: [28, 32, -25] },
  ];
  rumpCoverts.forEach((rc, i) => {
    b.part(new THREE.BoxGeometry(0.10, 0.18, 0.018), FLAME_PLUMAGE, {
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
  b.sweep(centerRibbonPath, (t) => [0.05 + t * 0.05, 0.007], {
    bone: [tailBase, tailC_1, tailC_2, tailC_3, tailC_4],
    color: FLAME_PLUMAGE,
    group: "tail",
    name: "centerRibbon",
  });

  // 3 Golden Eyelets with embedded glowing Pyro jewels on Center Ribbon
  const eyeletT = [0.22, 0.52, 0.82];
  eyeletT.forEach((tVal) => {
    const pt = centerRibbonPath.at(tVal);
    // Gold filigree torus
    b.part(new THREE.TorusGeometry(0.046, 0.01, 8, 16), GOLD_METAL, {
      bone: tailC_2,
      at: [pt.x, pt.y, pt.z],
      dir: [0, 0.3, 0.95],
      group: "tail",
    });
    // Embedded glowing jewel
    const jewel = b.part(new THREE.SphereGeometry(0.026, 8, 8), EMISSIVE_RUBY, {
      bone: tailC_2,
      at: [pt.x, pt.y, pt.z],
      group: "tail",
    });
    glow(jewel, 1.9);
  });

  // Terminal swallowtail flame blossom at center ribbon tip
  const centerTipPt = [0, 0.06, -0.15];
  const centerBlossom = b.spike(centerTipPt, [0, 0.06, 0.02], null, 0.042, {
    bone: tailC_4,
    color: EMISSIVE_CORE,
    group: "tail",
    name: "centerBlossom",
  });
  glow(centerBlossom, 2.2);
  for (const s of [1, -1]) {
    const forkTip = b.spike(centerTipPt, [s * 0.13, 0.07, -0.05], null, 0.026, {
      bone: tailC_4,
      color: SOLAR_ORANGE,
      group: "tail",
    });
    glow(forkTip, 1.9);
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
    b.sweep(latRibbonPath, (t) => [0.042 + t * 0.038, 0.006], {
      bone: [tailBase, tailL_1, tailL_2, tailL_3],
      color: FLAME_PLUMAGE,
      group: "tail",
      name: `latRibbon_${side}`,
    });

    // 2 Eyelet jewels on each lateral ribbon
    [0.32, 0.72].forEach((tVal) => {
      const pt = latRibbonPath.at(tVal);
      b.part(new THREE.TorusGeometry(0.038, 0.009, 8, 14), GOLD_METAL, {
        bone: tailL_2,
        at: [pt.x, pt.y, pt.z],
        dir: [s * 0.4, 0.3, 0.87],
        group: "tail",
      });
      const sideJewel = b.part(new THREE.SphereGeometry(0.022, 8, 8), EMISSIVE_AMBER, {
        bone: tailL_2,
        at: [pt.x, pt.y, pt.z],
        group: "tail",
      });
      glow(sideJewel, 1.9);
    });

    // Terminal flared flame fan at lateral ribbon tip
    const sideTipPt = [s * 0.20, 0.06, -0.08];
    const sideBlossom = b.spike(sideTipPt, [s * 0.25, 0.06, 0.04], null, 0.032, {
      bone: tailL_3,
      color: EMISSIVE_FLAME,
      group: "tail",
    });
    glow(sideBlossom, 1.9);
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
    { at: [0.0, 1.35, 0.38], rot: [0, 0, 0] },
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