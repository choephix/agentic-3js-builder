import * as THREE from "three";
import {
  createBuilder,
  frame,
  lerp,
  rng,
  catmull,
  paint,
  mix,
  noise,
  smoothstep,
  svg,
} from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "frost-forged-battle-axe",
  description:
    "A monumental League of Legends style frost-forged battle axe wedged into an ancient Freljordian runestone altar, featuring sweeping True Ice blades, curling ram horns, winter wolf fur ruff, and a glowing Glacial Heart core.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "frost_forged_battle_axe" });
  const seedRng = rng(1337);

  // ---------------------------------------------------------------------------
  // 1. PALETTE & CUSTOM PAINTS
  // ---------------------------------------------------------------------------

  const CYAN_GLOW = "#0df0ff";
  const DEEP_AZURE = "#0b2640";
  const BRASS_GOLD = "#d8a038";
  const SNOW_WHITE = "#eaf5ff";

  // Clockwork kit base metals with customized cold weathering
  const BRASS_RUNIC = metal("brass", { tarnish: 0.35, polish: 0.65, verdigris: 0.12, seed: 1 });
  const GILT_GOLD = metal("gilt", { polish: 0.8, tarnish: 0.15, seed: 2 });
  const DARK_IRON = metal("iron", { tarnish: 0.5, polish: 0.25, seed: 3 });

  // Tempered Frost Steel: deep blue-grey steel with icy highlights on top edges
  const FROST_STEEL = paint((p, n) => {
    const base = [0.12, 0.16, 0.24] as const;
    const midTone = [0.22, 0.30, 0.42] as const;
    const highlight = [0.52, 0.68, 0.82] as const;
    const grain = noise(p, 0.05, 17);
    const nUp = Math.max(0, n.y);
    let col = mix(base, midTone, nUp * 0.45 + grain * 0.3);
    if (nUp > 0.65 || Math.abs(n.x) > 0.85) {
      col = mix(col, highlight, 0.4);
    }
    return col;
  });

  // True Ice: luminous glacial cyan flat colour for glowing crystal elements
  const TRUE_ICE = "#2be4ff";

  // Ancient Permafrost Stone: dark slate with frosty rime gathering on upward faces
  const ALTAR_STONE = paint((p, n) => {
    const basaltDark = [0.11, 0.14, 0.18] as const;
    const slateMid = [0.22, 0.27, 0.34] as const;
    const frostRime = [0.65, 0.78, 0.90] as const;
    const rockNoise = noise(p, 0.08, 91);
    let col = mix(basaltDark, slateMid, rockNoise);
    if (n.y > 0.35) {
      const frostPatch = smoothstep(0.35, 0.85, n.y) * smoothstep(0.25, 0.7, noise(p, 0.04, 23));
      col = mix(col, frostRime, frostPatch * 0.72);
    }
    return col;
  });

  // Winter Wolf Fur: soft multi-tone fur with frosty tips
  const FUR_PAINT = paint((p, n) => {
    const furShadow = [0.55, 0.66, 0.78] as const;
    const furLit = [0.92, 0.96, 0.99] as const;
    const tuft = noise(p, 0.035, 59);
    return mix(furShadow, furLit, smoothstep(0.2, 0.8, tuft * 0.6 + n.y * 0.4));
  });

  // Worn Oxblood / Deep Brown Grip Leather
  const LEATHER_PAINT = paint((p, n) => {
    const darkLeather = [0.18, 0.10, 0.07] as const;
    const warmTone = [0.34, 0.20, 0.14] as const;
    const creased = [0.46, 0.28, 0.20] as const;
    const grain = noise(p, 0.025, 11);
    let col = mix(darkLeather, warmTone, grain * 0.7);
    if (n.y > 0.4) col = mix(col, creased, 0.28);
    return col;
  });

  // ---------------------------------------------------------------------------
  // 2. SVG TEXTURES
  // ---------------------------------------------------------------------------

  // Ancient Freljordian Runes for Blade Fuller
  const runeBladeTex = svg(
    `<svg viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="runeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#0df0ff"/>
          <stop offset="50%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#0df0ff"/>
        </linearGradient>
      </defs>
      <!-- Dark backing strokes -->
      <path d="M 20 50 L 80 50 M 50 20 L 50 80 M 30 30 L 70 70 M 30 70 L 70 30" stroke="#061220" stroke-width="12" stroke-linecap="round"/>
      <path d="M 100 50 L 130 20 L 160 50 L 130 80 Z M 130 10 L 130 90" stroke="#061220" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 180 30 L 220 50 L 180 70 M 200 20 L 200 80 M 220 30 L 220 70" stroke="#061220" stroke-width="12" stroke-linecap="round"/>
      <path d="M 250 50 L 280 20 L 310 50 L 280 80 Z M 265 35 L 295 65 M 265 65 L 295 35" stroke="#061220" stroke-width="12" stroke-linecap="round"/>
      <path d="M 330 25 L 360 50 L 330 75 M 360 25 L 390 50 L 360 75" stroke="#061220" stroke-width="12" stroke-linecap="round"/>
      <!-- Vibrant glowing cyan strokes -->
      <path d="M 20 50 L 80 50 M 50 20 L 50 80 M 30 30 L 70 70 M 30 70 L 70 30" stroke="#0df0ff" stroke-width="6" stroke-linecap="round"/>
      <path d="M 100 50 L 130 20 L 160 50 L 130 80 Z M 130 10 L 130 90" stroke="#0df0ff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 180 30 L 220 50 L 180 70 M 200 20 L 200 80 M 220 30 L 220 70" stroke="#0df0ff" stroke-width="6" stroke-linecap="round"/>
      <path d="M 250 50 L 280 20 L 310 50 L 280 80 Z M 265 35 L 295 65 M 265 65 L 295 35" stroke="#0df0ff" stroke-width="6" stroke-linecap="round"/>
      <path d="M 330 25 L 360 50 L 330 75 M 360 25 L 390 50 L 360 75" stroke="#0df0ff" stroke-width="6" stroke-linecap="round"/>
      <!-- Core white lightning -->
      <path d="M 20 50 L 80 50 M 50 20 L 50 80 M 30 30 L 70 70 M 30 70 L 70 30" stroke="#f0ffff" stroke-width="2" stroke-linecap="round"/>
      <path d="M 100 50 L 130 20 L 160 50 L 130 80 Z M 130 10 L 130 90" stroke="#f0ffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 180 30 L 220 50 L 180 70 M 200 20 L 200 80 M 220 30 L 220 70" stroke="#f0ffff" stroke-width="2" stroke-linecap="round"/>
      <path d="M 250 50 L 280 20 L 310 50 L 280 80 Z M 265 35 L 295 65 M 265 65 L 295 35" stroke="#f0ffff" stroke-width="2" stroke-linecap="round"/>
      <path d="M 330 25 L 360 50 L 330 75 M 360 25 L 390 50 L 360 75" stroke="#f0ffff" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    { size: 512 },
  );

  // Concentric Rune Circle for Altar Dais
  const altarCircleTex = svg(
    `<svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
      <circle cx="250" cy="250" r="246" fill="#18202a" stroke="#2c3a4a" stroke-width="4"/>
      <circle cx="250" cy="250" r="225" fill="none" stroke="#0b1622" stroke-width="30"/>
      <circle cx="250" cy="250" r="240" fill="none" stroke="#25384c" stroke-width="3"/>
      <circle cx="250" cy="250" r="210" fill="none" stroke="#25384c" stroke-width="3"/>
      <circle cx="250" cy="250" r="225" fill="none" stroke="#0df0ff" stroke-width="4.5" stroke-dasharray="14 18"/>
      <circle cx="250" cy="250" r="175" fill="none" stroke="#122536" stroke-width="18"/>
      <circle cx="250" cy="250" r="184" fill="none" stroke="#36506a" stroke-width="2"/>
      <circle cx="250" cy="250" r="166" fill="none" stroke="#36506a" stroke-width="2"/>
      <circle cx="250" cy="250" r="175" fill="none" stroke="#38c8ff" stroke-width="3.5" stroke-dasharray="8 12"/>
      <g transform="translate(250, 250)">
        <path d="M 0 -160 L 0 -40 M 0 40 L 0 160 M -160 0 L -40 0 M 40 0 L 160 0 M -113 -113 L -28 -28 M 28 28 L 113 113 M 113 -113 L 28 -28 M -28 28 L -113 113" stroke="#0a1a28" stroke-width="10" stroke-linecap="round"/>
        <path d="M 0 -160 L 0 -40 M 0 40 L 0 160 M -160 0 L -40 0 M 40 0 L 160 0 M -113 -113 L -28 -28 M 28 28 L 113 113 M 113 -113 L 28 -28 M -28 28 L -113 113" stroke="#0df0ff" stroke-width="5" stroke-linecap="round"/>
        <path d="M 0 -160 L 0 -40 M 0 40 L 0 160 M -160 0 L -40 0 M 40 0 L 160 0 M -113 -113 L -28 -28 M 28 28 L 113 113 M 113 -113 L 28 -28 M -28 28 L -113 113" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>
        <polygon points="0,-140 16,-60 60,-60 24,-24 40,30 0,0 -40,30 -24,-24 -60,-60 -16,-60" fill="#0c2236" stroke="#0df0ff" stroke-width="3"/>
        <circle cx="0" cy="0" r="42" fill="#142638" stroke="#0df0ff" stroke-width="3"/>
        <circle cx="0" cy="0" r="24" fill="#081824" stroke="#ffffff" stroke-width="2"/>
        <circle cx="0" cy="0" r="8" fill="#e0f8ff"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  // Horned Frost Beast / Ram Socket Emblem
  const socketCrestTex = svg(
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <polygon points="100,10 185,45 170,145 100,190 30,145 15,45" fill="#141c26" stroke="#d49a34" stroke-width="6"/>
      <polygon points="100,22 170,52 156,136 100,175 44,136 30,52" fill="#1a2533" stroke="#8a6020" stroke-width="2"/>
      <path d="M 100 65 Q 145 30 165 60 Q 175 90 145 110 Q 125 115 118 95 Q 125 75 145 75 Q 150 65 135 55 Q 115 50 100 65" fill="#e6ad38" stroke="#7a4f15" stroke-width="2.5"/>
      <path d="M 100 65 Q 55 30 35 60 Q 25 90 55 110 Q 75 115 82 95 Q 75 75 55 75 Q 50 65 65 55 Q 85 50 100 65" fill="#e6ad38" stroke="#7a4f15" stroke-width="2.5"/>
      <polygon points="100,50 125,75 120,120 100,145 80,120 75,75" fill="#d2ddeb" stroke="#506680" stroke-width="3"/>
      <polygon points="90,82 98,84 92,90" fill="#0df0ff"/>
      <polygon points="110,82 102,84 108,90" fill="#0df0ff"/>
      <path d="M 95 110 L 100 118 L 105 110 M 100 122 L 100 135" stroke="#253545" stroke-width="3" stroke-linecap="round"/>
      <polygon points="100,150 108,160 100,170 92,160" fill="#0df0ff" stroke="#ffffff" stroke-width="1.5"/>
    </svg>`,
    { size: 256 },
  );

  // Diamond Cross-Stitched Leather Wrap Texture
  const leatherWrapTex = svg(
    `<svg viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="400" fill="#2d1a12"/>
      <line x1="0" y1="0" x2="0" y2="400" stroke="#160b06" stroke-width="8"/>
      <line x1="100" y1="0" x2="100" y2="400" stroke="#1c0f08" stroke-width="4"/>
      <line x1="200" y1="0" x2="200" y2="400" stroke="#160b06" stroke-width="8"/>
      <g stroke="#1a0c06" stroke-width="18" fill="none">
        <path d="M -50 0 L 250 300 M -50 100 L 250 400 M -50 200 L 250 500 M -50 -100 L 250 200"/>
        <path d="M 250 0 L -50 300 M 250 100 L -50 400 M 250 200 L -50 500 M 250 -100 L -50 200"/>
      </g>
      <g stroke="#8a5c36" stroke-width="12" fill="none">
        <path d="M -50 0 L 250 300 M -50 100 L 250 400 M -50 200 L 250 500 M -50 -100 L 250 200"/>
        <path d="M 250 0 L -50 300 M 250 100 L -50 400 M 250 200 L -50 500 M 250 -100 L -50 200"/>
      </g>
      <g stroke="#b88454" stroke-width="3" fill="none">
        <path d="M -50 0 L 250 300 M -50 100 L 250 400 M -50 200 L 250 500 M -50 -100 L 250 200"/>
        <path d="M 250 0 L -50 300 M 250 100 L -50 400 M 250 200 L -50 500 M 250 -100 L -50 200"/>
      </g>
      <g fill="#d49b38" stroke="#4a300a" stroke-width="2">
        <circle cx="100" cy="50" r="5"/>
        <circle cx="100" cy="150" r="5"/>
        <circle cx="100" cy="250" r="5"/>
        <circle cx="100" cy="350" r="5"/>
        <circle cx="0" cy="100" r="5"/>
        <circle cx="200" cy="100" r="5"/>
        <circle cx="0" cy="200" r="5"/>
        <circle cx="200" cy="200" r="5"/>
        <circle cx="0" cy="300" r="5"/>
        <circle cx="200" cy="300" r="5"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  // Stylized Winter Beast Fur Clump Card
  const furTuftTex = svg(
    `<svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M 15 200 C 20 140 10 90 25 30 L 40 75 C 45 40 50 10 65 0 C 65 35 70 70 85 95 L 75 125 C 85 140 95 160 90 200 Z" fill="#1c2c3e"/>
      <path d="M 20 195 C 25 145 16 95 30 40 L 42 80 C 47 48 52 22 64 12 C 64 42 70 75 82 98 L 73 126 C 82 142 90 162 86 195 Z" fill="#a4bcd4"/>
      <path d="M 35 120 C 40 70 48 35 63 15 C 60 50 65 85 75 105 L 68 135 Z" fill="#dce9f5"/>
      <path d="M 45 100 C 50 50 54 28 62 16 C 60 45 64 75 70 95 Z" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  // Radiant Frost Particle Star
  const frostStarTex = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,0 55,42 95,50 55,58 50,100 45,58 5,50 45,42" fill="#0df0ff"/>
      <polygon points="50,10 53,45 85,50 53,55 50,90 47,55 15,50 47,45" fill="#f0fbff"/>
      <polygon points="50,28 54,46 72,50 54,54 50,72 46,54 28,50 46,46" fill="#0df0ff"/>
      <polygon points="50,34 52,47 66,50 52,53 50,66 48,53 34,50 48,47" fill="#ffffff"/>
      <circle cx="50" cy="50" r="5" fill="#ffffff"/>
      <polygon points="20,15 24,20 20,25 16,20" fill="#0df0ff"/>
      <polygon points="80,80 83,85 80,90 77,85" fill="#0df0ff"/>
      <polygon points="82,20 85,24 82,28 79,24" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------------------
  // 3. SKELETON HIERARCHY
  // ---------------------------------------------------------------------------

  const root = b.joint("root", { at: [0, 0, 0] });
  const altarBone = b.joint("altar", { parent: root, at: [0, 0.12, 0] });
  const haftBase = b.joint("haftBase", { parent: root, at: [0, 0.28, 0], dir: [0, 1, 0] });
  const haftGripLower = b.joint("haftGripLower", { parent: haftBase, at: [0, 0.54, 0], dir: [0, 1, 0] });
  const haftMid = b.joint("haftMid", { parent: haftGripLower, at: [0, 0.94, 0], dir: [0, 1, 0] });
  const haftGripUpper = b.joint("haftGripUpper", { parent: haftMid, at: [0, 1.24, 0], dir: [0, 1, 0] });
  const haftCollar = b.joint("haftCollar", { parent: haftGripUpper, at: [0, 1.45, 0], dir: [0, 1, 0] });
  const axeHead = b.joint("axeHead", { parent: haftCollar, at: [0, 1.58, 0], dir: [0, 1, 0] });
  const bladeMain = b.joint("bladeMain", { parent: axeHead, at: [0.15, 1.58, 0], dir: [1, 0, 0] });
  const bladeBack = b.joint("bladeBack", { parent: axeHead, at: [-0.15, 1.58, 0], dir: [-1, 0, 0] });
  const topSpike = b.joint("topSpike", { parent: axeHead, at: [0, 1.72, 0], dir: [0, 1, 0] });

  // ---------------------------------------------------------------------------
  // 4. THE FROZEN RUNESTONE ALTAR (BASE)
  // ---------------------------------------------------------------------------

  // Tier 1: Lower Octagonal Base Slab (Touches y = 0.0)
  b.part(new THREE.CylinderGeometry(0.62, 0.65, 0.08, 8), ALTAR_STONE, {
    bone: altarBone,
    at: [0, 0.04, 0],
    name: "altar_oct_base",
  });

  // Perimeter bevel blocks on the 8 corners of the base
  for (let i = 0; i < 8; i++) {
    const ang = (i * Math.PI) / 4 + Math.PI / 8;
    const px = Math.cos(ang) * 0.61;
    const pz = Math.sin(ang) * 0.61;
    b.part(new THREE.BoxGeometry(0.12, 0.06, 0.1), ALTAR_STONE, {
      bone: altarBone,
      at: [px, 0.06, pz],
      rotation: [0, -ang, 0],
      name: `altar_curb_${i}`,
    });
  }

  // Tier 2: Middle Circular Carved Stone Dais
  b.part(new THREE.CylinderGeometry(0.47, 0.49, 0.09, 24), ALTAR_STONE, {
    bone: altarBone,
    at: [0, 0.125, 0],
    name: "altar_dais_mid",
  });

  // Top Runic Disc Decal
  glow(
    b.part(new THREE.CircleGeometry(0.46, 32), "#ffffff", {
      bone: altarBone,
      at: [0, 0.171, 0],
      dir: [0, 1, 0],
      axis: "z",
      texture: altarCircleTex,
      name: "altar_runic_circle",
    }),
    0.85,
  );

  // Tier 3: Central Weapon Anchor Cradle Block
  b.part(new THREE.BoxGeometry(0.24, 0.1, 0.2), ALTAR_STONE, {
    bone: altarBone,
    at: [0, 0.22, 0],
    name: "altar_cradle_stone",
  });

  // Forged Iron Clamping Corner Brackets on the Stone Cradle
  for (const sx of [1, -1]) {
    for (const sz of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.035, 0.11, 0.035), DARK_IRON, {
        bone: altarBone,
        at: [sx * 0.115, 0.22, sz * 0.095],
        name: `altar_bracket_${sx}_${sz}`,
      });
      b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.006, 6), BRASS_RUNIC, {
        bone: altarBone,
        at: [sx * 0.115, 0.26, sz * 0.095],
        dir: [0, 1, 0],
        name: `altar_bolt_${sx}_${sz}`,
      });
    }
  }

  // Erupting True Ice Crystal Spires on the Altar Dais
  const crystalAngles = [20, 55, 90, 125, 160, 200, 235, 275, 310, 345];
  const crystalHeights = [0.36, 0.24, 0.42, 0.28, 0.46, 0.26, 0.4, 0.3, 0.38, 0.22];
  const crystalRadii = [0.036, 0.026, 0.042, 0.03, 0.044, 0.028, 0.04, 0.032, 0.038, 0.024];
  const crystalDist = [0.35, 0.41, 0.37, 0.42, 0.34, 0.4, 0.36, 0.41, 0.35, 0.39];

  crystalAngles.forEach((deg, idx) => {
    const rad = (deg * Math.PI) / 180;
    const dist = crystalDist[idx];
    const px = Math.cos(rad) * dist;
    const pz = Math.sin(rad) * dist;
    const h = crystalHeights[idx];
    const r = crystalRadii[idx];
    const lean = new THREE.Vector3(Math.cos(rad) * 0.35, 1.0, Math.sin(rad) * 0.35).normalize();

    // Primary crystal spire
    glow(
      b.part(new THREE.ConeGeometry(r, h, 6), TRUE_ICE, {
        bone: altarBone,
        at: [px, 0.17 + h * 0.45, pz],
        dir: lean,
        flat: true,
        name: `crystal_spire_${idx}`,
      }),
      1.1,
    );

    // Small satellite shard
    const subRad = rad + 0.15;
    const subX = Math.cos(subRad) * (dist - 0.04);
    const subZ = Math.sin(subRad) * (dist - 0.04);
    glow(
      b.part(new THREE.ConeGeometry(r * 0.55, h * 0.45, 5), TRUE_ICE, {
        bone: altarBone,
        at: [subX, 0.17 + h * 0.2, subZ],
        dir: [Math.cos(subRad) * 0.5, 0.9, Math.sin(subRad) * 0.5],
        flat: true,
        name: `crystal_sub_${idx}`,
      }),
      1.0,
    );
  });

  // Fallen Snow Clumps on the Altar Edge
  for (let s = 0; s < 12; s++) {
    const sAng = (s * Math.PI) / 6 + 0.2;
    const sDist = 0.54 + (s % 3) * 0.03;
    b.part(new THREE.SphereGeometry(0.04, 7, 5), SNOW_WHITE, {
      bone: altarBone,
      at: [Math.cos(sAng) * sDist, 0.08, Math.sin(sAng) * sDist],
      scale: [1.3, 0.4, 1.1],
      name: `snow_clump_${s}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 5. AXE POMMEL & TERMINAL COUNTERWEIGHT (y = 0.24 to 0.38)
  // ---------------------------------------------------------------------------

  // Ground-Anchor Spike (Plunges into the stone cradle)
  b.spike([0, 0.26, 0], [0, -1, 0], 0.07, 0.018, {
    bone: haftBase,
    color: DARK_IRON,
    section: { ngon: 6 },
    name: "pommel_ground_spike",
  });

  // Terminal True Ice Jewel at Pommel Base
  glow(
    b.part(new THREE.OctahedronGeometry(0.024, 0), CYAN_GLOW, {
      bone: haftBase,
      at: [0, 0.26, 0],
      scale: [1, 1.3, 1],
      name: "pommel_ice_gem",
    }),
    2.0,
  );

  // Main Octagonal Faceted Pommel Weight
  b.part(new THREE.CylinderGeometry(0.036, 0.044, 0.07, 8), FROST_STEEL, {
    bone: haftBase,
    at: [0, 0.31, 0],
    flat: true,
    name: "pommel_body",
  });

  // Brass Runic Retention Collar
  b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.02, 8), BRASS_RUNIC, {
    bone: haftBase,
    at: [0, 0.33, 0],
    flat: true,
    name: "pommel_ring_brass",
  });

  // 8 Perimeter Brass Studs around Pommel Ring
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    b.part(new THREE.SphereGeometry(0.005, 6, 4), GILT_GOLD, {
      bone: haftBase,
      at: [Math.cos(a) * 0.047, 0.33, Math.sin(a) * 0.047],
      name: `pommel_stud_${i}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 6. LOWER HAFT & LEATHER GRIP (y = 0.36 to 0.74)
  // ---------------------------------------------------------------------------

  // Internal Core Shaft
  b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.36, 8), DARK_IRON, {
    bone: haftGripLower,
    at: [0, 0.54, 0],
    name: "haft_lower_core",
  });

  // Textured Leather Grip Wrap Sleeve
  b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.34, 16), "#ffffff", {
    bone: haftGripLower,
    at: [0, 0.54, 0],
    texture: leatherWrapTex,
    name: "haft_lower_wrap",
  });

  // Decorative Retention Ferrules and Studs
  for (const fy of [0.4, 0.54, 0.68]) {
    b.part(new THREE.CylinderGeometry(0.031, 0.031, 0.016, 8), BRASS_RUNIC, {
      bone: haftGripLower,
      at: [0, fy, 0],
      name: `haft_lower_ferrule_${fy}`,
    });
    for (let j = 0; j < 4; j++) {
      const ja = (j * Math.PI) / 2;
      b.part(new THREE.SphereGeometry(0.0045, 6, 4), GILT_GOLD, {
        bone: haftGripLower,
        at: [Math.cos(ja) * 0.032, fy, Math.sin(ja) * 0.032],
        name: `haft_lower_ferrule_rivet_${fy}_${j}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 7. MID HAFT & RUNE EMBOSS (y = 0.74 to 1.18)
  // ---------------------------------------------------------------------------

  // Octagonal Frost-Steel Mid Shaft
  b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.44, 8), FROST_STEEL, {
    bone: haftMid,
    at: [0, 0.96, 0],
    name: "haft_mid_shaft",
  });

  // Mid Grip Leather Segment
  b.part(new THREE.CylinderGeometry(0.0275, 0.0275, 0.22, 16), LEATHER_PAINT, {
    bone: haftMid,
    at: [0, 0.96, 0],
    name: "haft_mid_leather",
  });

  // 4 Recessed Glowing Frost Rune Channels along Mid Shaft
  for (let r = 0; r < 4; r++) {
    const ra = (r * Math.PI) / 2 + Math.PI / 4;
    glow(
      b.part(new THREE.BoxGeometry(0.006, 0.32, 0.004), CYAN_GLOW, {
        bone: haftMid,
        at: [Math.cos(ra) * 0.026, 0.96, Math.sin(ra) * 0.026],
        rotation: [0, -ra, 0],
        name: `haft_mid_rune_channel_${r}`,
      }),
      1.5,
    );
  }

  // Brass Clamping Collars
  for (const cy of [0.77, 1.15]) {
    b.part(new THREE.CylinderGeometry(0.033, 0.033, 0.024, 8), BRASS_RUNIC, {
      bone: haftMid,
      at: [0, cy, 0],
      name: `haft_mid_band_${cy}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 8. UPPER HAFT & WINTER WOLF FUR RUFF (y = 1.18 to 1.48)
  // ---------------------------------------------------------------------------

  // Upper Shaft Core
  b.part(new THREE.CylinderGeometry(0.025, 0.027, 0.28, 8), DARK_IRON, {
    bone: haftGripUpper,
    at: [0, 1.32, 0],
    name: "haft_upper_core",
  });

  // Volumetric Sculpted Fur Mantle (3 Stacked Rings)
  const furRingLevels = [
    { y: 1.28, maj: 0.048, min: 0.018 },
    { y: 1.34, maj: 0.056, min: 0.022 },
    { y: 1.4, maj: 0.048, min: 0.018 },
  ];
  furRingLevels.forEach((lvl, i) => {
    b.part(new THREE.TorusGeometry(lvl.maj, lvl.min, 7, 14), FUR_PAINT, {
      bone: haftGripUpper,
      at: [0, lvl.y, 0],
      rotation: [Math.PI / 2, 0, 0],
      name: `fur_volumetric_ring_${i}`,
    });
  });

  // Stylized League-style Fur Tuft Cards
  const furFrames: ReturnType<typeof frame>[] = [];
  const furCardCount = 18;
  for (let i = 0; i < furCardCount; i++) {
    const a = (i / furCardCount) * Math.PI * 2;
    const yOff = 1.31 + (i % 2) * 0.05;
    const rad = 0.06;
    const px = Math.cos(a) * rad;
    const pz = Math.sin(a) * rad;
    furFrames.push(frame([px, yOff, pz], [Math.cos(a), -0.4, Math.sin(a)]));
  }
  b.cards(furFrames, furTuftTex, {
    bone: haftGripUpper,
    size: [0.06, 0.14],
    lean: 32,
    bend: 16,
    vary: 0.2,
    rng: rng(77),
  });

  // Fur Mantle Brass Torcs / Clasps
  b.part(new THREE.TorusGeometry(0.046, 0.008, 6, 16), GILT_GOLD, {
    bone: haftGripUpper,
    at: [0, 1.25, 0],
    rotation: [Math.PI / 2, 0, 0],
    name: "fur_clasp_lower",
  });
  b.part(new THREE.TorusGeometry(0.046, 0.008, 6, 16), GILT_GOLD, {
    bone: haftGripUpper,
    at: [0, 1.43, 0],
    rotation: [Math.PI / 2, 0, 0],
    name: "fur_clasp_upper",
  });

  // Front Clasp Buckle
  b.part(new THREE.BoxGeometry(0.024, 0.03, 0.014), BRASS_RUNIC, {
    bone: haftGripUpper,
    at: [0, 1.43, 0.052],
    name: "fur_buckle_front",
  });

  // ---------------------------------------------------------------------------
  // 9. AXE SOCKET & THE GLACIAL HEART (y = 1.48 to 1.70)
  // ---------------------------------------------------------------------------

  // Transition Neck Collar
  b.part(new THREE.CylinderGeometry(0.032, 0.028, 0.06, 8), BRASS_RUNIC, {
    bone: haftCollar,
    at: [0, 1.48, 0],
    name: "haft_collar_ferrule",
  });

  // Socket Cage: Top and Bottom Plates
  b.part(new THREE.BoxGeometry(0.16, 0.04, 0.13), FROST_STEEL, {
    bone: axeHead,
    at: [0, 1.68, 0],
    name: "socket_cage_top",
  });
  b.part(new THREE.BoxGeometry(0.16, 0.04, 0.13), FROST_STEEL, {
    bone: axeHead,
    at: [0, 1.5, 0],
    name: "socket_cage_bottom",
  });

  // Socket Cage: Left and Right Vertical Pillars
  b.part(new THREE.BoxGeometry(0.04, 0.14, 0.12), FROST_STEEL, {
    bone: axeHead,
    at: [0.065, 1.59, 0],
    name: "socket_pillar_right",
  });
  b.part(new THREE.BoxGeometry(0.04, 0.14, 0.12), FROST_STEEL, {
    bone: axeHead,
    at: [-0.065, 1.59, 0],
    name: "socket_pillar_left",
  });

  // Center Chamber: The Glacial Heart (Floating True Ice Power Crystal)
  glow(
    b.part(new THREE.OctahedronGeometry(0.044, 0), CYAN_GLOW, {
      bone: axeHead,
      at: [0, 1.59, 0],
      scale: [0.95, 1.35, 0.95],
      name: "glacial_heart_crystal",
    }),
    2.2,
  );

  // 4 Brass Retention Claws for the Crystal
  for (const cx of [1, -1]) {
    for (const cy of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.01, 0.032, 0.01), GILT_GOLD, {
        bone: axeHead,
        at: [cx * 0.032, 1.59 + cy * 0.05, 0],
        rotation: [0, 0, cx * cy * 0.4],
        name: `crystal_claw_${cx}_${cy}`,
      });
    }
  }

  // Socket Front and Back Crest Decals
  glow(
    b.part(new THREE.PlaneGeometry(0.11, 0.11), "#ffffff", {
      bone: axeHead,
      at: [0, 1.59, 0.066],
      dir: [0, 0, 1],
      axis: "z",
      texture: socketCrestTex,
      name: "socket_crest_front",
    }),
    1.1,
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.11, 0.11), "#ffffff", {
      bone: axeHead,
      at: [0, 1.59, -0.066],
      dir: [0, 0, -1],
      axis: "z",
      texture: socketCrestTex,
      name: "socket_crest_back",
    }),
    1.1,
  );

  // Heavy Socket Hex Bolt Heads
  for (const bx of [0.065, -0.065]) {
    for (const by of [1.53, 1.65]) {
      for (const bz of [0.066, -0.066]) {
        b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.005, 6), BRASS_RUNIC, {
          bone: axeHead,
          at: [bx, by, bz],
          dir: [0, 0, Math.sign(bz)],
          name: `socket_bolt_${bx}_${by}_${bz}`,
        });
      }
    }
  }

  // Freljordian Ram Horns Curving on the Socket Sides
  for (const s of [1, -1]) {
    const hornPts = [
      [s * 0.08, 1.62, 0.02],
      [s * 0.13, 1.65, 0.07],
      [s * 0.17, 1.61, 0.09],
      [s * 0.15, 1.52, 0.07],
      [s * 0.1, 1.5, 0.03],
      [s * 0.08, 1.52, -0.01],
    ];
    const hornPath = catmull(hornPts);
    b.sweep(hornPath, (t) => 0.02 * (1 - t * 0.72), {
      bone: axeHead,
      color: GILT_GOLD,
      section: { ngon: 6 },
      caps: "round",
    });

    // Decorative Flanged Rings along the Ram Horns
    for (const hr of [0.2, 0.45, 0.7]) {
      const hpt = hornPath.at(hr);
      const htan = hornPath.tangentAt(hr);
      b.part(new THREE.TorusGeometry(0.02 * (1 - hr * 0.72) * 1.1, 0.003, 6, 12), BRASS_RUNIC, {
        bone: axeHead,
        at: hpt,
        dir: htan,
        name: `horn_ring_${s}_${hr}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 10. PRIMARY BLADE (THE FROST CRESCENT, +X)
  // ---------------------------------------------------------------------------

  // A. Inner Frost-Steel Spine
  const SPINE_MAIN_OUTLINE: [number, number, ("sharp" | undefined)?][] = [
    [0.08, 0.09],
    [0.16, 0.16],
    [0.28, 0.26, "sharp"],
    [0.26, 0.18],
    [0.21, 0.02],
    [0.18, -0.14],
    [0.15, -0.24, "sharp"],
    [0.08, -0.1],
  ];

  b.extrude(SPINE_MAIN_OUTLINE, {
    bone: bladeMain,
    at: [0, 1.59, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.042,
    bevel: 0.005,
    smoothing: 1,
    color: FROST_STEEL,
    name: "blade_main_spine_iron",
  });

  // B. Runic Blade Fuller Decal Plates (Front and Back)
  glow(
    b.part(new THREE.PlaneGeometry(0.18, 0.05), "#ffffff", {
      bone: bladeMain,
      at: [0.18, 1.6, 0.022],
      dir: [0, 0, 1],
      axis: "z",
      rotation: [0, 0, 22],
      texture: runeBladeTex,
      name: "blade_main_runes_front",
    }),
    1.8,
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.18, 0.05), "#ffffff", {
      bone: bladeMain,
      at: [0.18, 1.6, -0.022],
      dir: [0, 0, -1],
      axis: "z",
      rotation: [0, 0, -22],
      texture: runeBladeTex,
      name: "blade_main_runes_back",
    }),
    1.8,
  );

  // C. Massive True Ice Sweeping Crescent Blade
  const TRUE_ICE_MAIN_OUTLINE: [number, number, ("sharp" | undefined)?][] = [
    [0.28, 0.26, "sharp"],
    [0.45, 0.35, "sharp"], // High recurve horn tip
    [0.53, 0.22],
    [0.56, 0.04], // Widest outer crescent swell
    [0.51, -0.16],
    [0.42, -0.34],
    [0.32, -0.43, "sharp"], // Lower bearded hook tip
    [0.24, -0.28],
    [0.15, -0.24, "sharp"],
    [0.18, -0.14],
    [0.21, 0.02],
    [0.26, 0.18],
  ];

  glow(
    b.extrude(TRUE_ICE_MAIN_OUTLINE, {
      bone: bladeMain,
      at: [0, 1.59, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.024,
      bevel: 0.004,
      smoothing: 1,
      color: TRUE_ICE,
      name: "blade_main_true_ice",
    }),
    1.25,
  );

  // D. Crystalline Spikes Jutting from the Blade Spine
  const spineSpikes = [
    { at: [0.16, 1.76, 0], dir: [0.32, 0.92, 0], len: 0.09, r: 0.016 },
    { at: [0.22, 1.81, 0], dir: [0.44, 0.82, 0], len: 0.11, r: 0.018 },
    { at: [0.28, 1.86, 0], dir: [0.55, 0.72, 0], len: 0.08, r: 0.014 },
  ];
  spineSpikes.forEach((spk, idx) => {
    glow(
      b.spike(spk.at, spk.dir, spk.len, spk.r, {
        bone: bladeMain,
        color: TRUE_ICE,
        section: { ngon: 5 },
        name: `spine_spike_${idx}`,
      }),
      1.3,
    );
  });

  // E. Crystalline Icicles Hanging from Bearded Blade Hook
  const icicles = [
    { at: [0.32, 1.15, 0], len: 0.09, r: 0.009 },
    { at: [0.28, 1.2, 0], len: 0.065, r: 0.007 },
    { at: [0.24, 1.25, 0], len: 0.045, r: 0.006 },
  ];
  icicles.forEach((ici, idx) => {
    glow(
      b.spike(ici.at, [0, -1, 0], ici.len, ici.r, {
        bone: bladeMain,
        color: TRUE_ICE,
        section: { ngon: 5 },
        name: `icicle_${idx}`,
      }),
      1.2,
    );
  });

  // F. Brass Retention Jaws / Clamping Brackets
  for (const sz of [1, -1]) {
    // Upper jaw
    b.part(new THREE.BoxGeometry(0.08, 0.024, 0.008), GILT_GOLD, {
      bone: bladeMain,
      at: [0.24, 1.78, sz * 0.022],
      rotation: [0, 0, 0.5],
      name: `blade_jaw_upper_${sz}`,
    });
    // Lower jaw
    b.part(new THREE.BoxGeometry(0.07, 0.022, 0.008), GILT_GOLD, {
      bone: bladeMain,
      at: [0.18, 1.43, sz * 0.022],
      rotation: [0, 0, -0.6],
      name: `blade_jaw_lower_${sz}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 11. SECONDARY BLADE / WAR HOOK (-X)
  // ---------------------------------------------------------------------------

  // A. Inner Frost-Steel Back Spine
  const SPINE_BACK_OUTLINE: [number, number, ("sharp" | undefined)?][] = [
    [-0.08, 0.08],
    [-0.15, 0.11],
    [-0.22, 0.09, "sharp"],
    [-0.18, -0.01],
    [-0.19, -0.1, "sharp"],
    [-0.08, -0.08],
  ];

  b.extrude(SPINE_BACK_OUTLINE, {
    bone: bladeBack,
    at: [0, 1.59, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.038,
    bevel: 0.005,
    smoothing: 1,
    color: FROST_STEEL,
    name: "blade_back_spine_iron",
  });

  // B. True Ice Armor-Breaker Pick Hook
  const TRUE_ICE_HOOK_OUTLINE: [number, number, ("sharp" | undefined)?][] = [
    [-0.22, 0.09, "sharp"],
    [-0.32, 0.06],
    [-0.43, -0.02, "sharp"], // Deadly armor-breaker beak tip
    [-0.34, -0.08],
    [-0.25, -0.05],
    [-0.19, -0.1, "sharp"],
    [-0.18, -0.01],
  ];

  glow(
    b.extrude(TRUE_ICE_HOOK_OUTLINE, {
      bone: bladeBack,
      at: [0, 1.59, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.022,
      bevel: 0.004,
      smoothing: 1,
      color: TRUE_ICE,
      name: "blade_back_true_ice",
    }),
    1.25,
  );

  // C. Back Hook Ice Spikes
  glow(
    b.spike([-0.18, 1.7, 0], [-0.5, 0.8, 0], 0.075, 0.014, {
      bone: bladeBack,
      color: TRUE_ICE,
      section: { ngon: 5 },
      name: "back_spike_0",
    }),
    1.3,
  );
  glow(
    b.spike([-0.25, 1.66, 0], [-0.7, 0.6, 0], 0.09, 0.016, {
      bone: bladeBack,
      color: TRUE_ICE,
      section: { ngon: 5 },
      name: "back_spike_1",
    }),
    1.3,
  );

  // D. Brass Clamping Plate on Hook
  for (const sz of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.065, 0.02, 0.007), GILT_GOLD, {
      bone: bladeBack,
      at: [-0.18, 1.62, sz * 0.02],
      rotation: [0, 0, -0.3],
      name: `hook_clamp_${sz}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 12. TOP SPEARHEAD & CROWN SPIKE (+Y)
  // ---------------------------------------------------------------------------

  // Tiered Octagonal Brass Collar
  b.part(new THREE.CylinderGeometry(0.028, 0.036, 0.04, 8), BRASS_RUNIC, {
    bone: topSpike,
    at: [0, 1.71, 0],
    name: "spear_collar",
  });

  // Diamond-Section Spearhead Blade (Model X-Y Plane)
  const SPEAR_OUTLINE: [number, number, ("sharp" | undefined)?][] = [
    [0.0, 0.0],
    [0.038, 0.05],
    [0.03, 0.13],
    [0.042, 0.18],
    [0.0, 0.26, "sharp"], // Crown lance tip
    [-0.042, 0.18],
    [-0.03, 0.13],
    [-0.038, 0.05],
  ];

  b.extrude(SPEAR_OUTLINE, {
    bone: topSpike,
    at: [0, 1.73, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.02,
    bevel: 0.003,
    color: FROST_STEEL,
    name: "spear_blade_main",
  });

  // Cross Flange (Model Z-Y Plane) for 3D Diamond Cross-Section
  const SPEAR_CROSS_OUTLINE: [number, number, ("sharp" | undefined)?][] = [
    [0.0, 0.0],
    [0.026, 0.06],
    [0.018, 0.14],
    [0.0, 0.25, "sharp"],
    [-0.018, 0.14],
    [-0.026, 0.06],
  ];

  glow(
    b.extrude(SPEAR_CROSS_OUTLINE, {
      bone: topSpike,
      at: [0, 1.73, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.002,
      color: TRUE_ICE,
      name: "spear_blade_cross",
    }),
    1.2,
  );

  // Crown Terminal True Ice Crystal Tip
  glow(
    b.part(new THREE.OctahedronGeometry(0.018, 0), CYAN_GLOW, {
      bone: topSpike,
      at: [0, 1.96, 0],
      scale: [0.6, 1.6, 0.6],
      name: "spear_terminal_crystal",
    }),
    2.2,
  );

  // ---------------------------------------------------------------------------
  // 13. FLOATING FROST PARTICLES & RUNIC SPARKLES
  // ---------------------------------------------------------------------------

  const particleFrames: ReturnType<typeof frame>[] = [];
  const particleCount = 20;
  for (let i = 0; i < particleCount; i++) {
    const rx = (seedRng() - 0.5) * 0.7 + 0.15;
    const ry = 1.25 + seedRng() * 0.7;
    const rz = (seedRng() - 0.5) * 0.35;
    particleFrames.push(frame([rx, ry, rz], [0, 0, 1]));
  }

  glow(
    b.cards(particleFrames, frostStarTex, {
      bone: axeHead,
      size: [0.038, 0.038],
      vary: 0.35,
      rng: rng(99),
    }),
    2.0,
  );

  return b.root;
}
