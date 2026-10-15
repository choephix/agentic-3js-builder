import * as THREE from "three";
import {
  createBuilder,
  frame,
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
    "A legendary League of Legends style frost-forged battle axe wedged into an ancient Freljordian runestone altar, featuring massive sweeping True Ice blades, curling ram horns, winter wolf fur ruff, and a glowing Glacial Heart core.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "frost_forged_battle_axe" });
  const seedRng = rng(42069);

  // ---------------------------------------------------------------------------
  // 1. PALETTE & SHADING
  // ---------------------------------------------------------------------------

  const CYAN_GLOW = "#0df0ff";
  const TRUE_ICE_CYAN = "#2be4ff";
  const GILT_ACCENT = "#e8b448";
  const BRASS_DARK = "#7a521e";
  const SNOW_WHITE = "#eaf5ff";

  // Clockwork base metals
  const BRASS_RUNIC = metal("brass", { tarnish: 0.35, polish: 0.65, verdigris: 0.12, seed: 11 });
  const GILT_GOLD = metal("gilt", { polish: 0.85, tarnish: 0.12, seed: 22 });
  const DARK_IRON = metal("iron", { tarnish: 0.55, polish: 0.25, seed: 33 });

  // Hand-painted League-style Frost Steel: dark blue-charcoal steel with icy edge highlights
  const FROST_STEEL = paint((p, n) => {
    const base = [0.10, 0.14, 0.22] as const;
    const midTone = [0.20, 0.28, 0.40] as const;
    const rimGlint = [0.60, 0.78, 0.92] as const;
    const grain = noise(p, 0.04, 17);
    const nUp = Math.max(0, n.y);
    let col = mix(base, midTone, nUp * 0.5 + grain * 0.35);
    if (nUp > 0.65 || Math.abs(n.x) > 0.82) {
      col = mix(col, rimGlint, 0.42);
    }
    return col;
  });

  // True Ice body paint: deep celestial azure core drifting to bright crystalline cyan
  const TRUE_ICE_PAINT = paint((p, n) => {
    const deepCore = [0.06, 0.30, 0.52] as const;
    const brightIce = [0.18, 0.72, 0.95] as const;
    const rimeEdge = [0.72, 0.96, 1.00] as const;
    const facetNoise = noise(p, 0.07, 44);
    const grain = noise(p, 0.02, 108);
    let col = mix(deepCore, brightIce, facetNoise * 0.7 + grain * 0.3);
    if (Math.abs(n.y) > 0.35 || Math.abs(n.z) > 0.55) {
      col = mix(col, rimeEdge, 0.38);
    }
    return col;
  });

  // Ancient Permafrost Basalt Altar Stone
  const ALTAR_STONE = paint((p, n) => {
    const basaltDark = [0.10, 0.13, 0.17] as const;
    const slateMid = [0.20, 0.25, 0.32] as const;
    const frostRime = [0.68, 0.82, 0.94] as const;
    const rockNoise = noise(p, 0.09, 88);
    let col = mix(basaltDark, slateMid, rockNoise);
    if (n.y > 0.3) {
      const frostPatch = smoothstep(0.3, 0.85, n.y) * smoothstep(0.2, 0.75, noise(p, 0.045, 23));
      col = mix(col, frostRime, frostPatch * 0.75);
    }
    return col;
  });

  // Winter Wolf Fur Ruff
  const FUR_PAINT = paint((p, n) => {
    const shadowFur = [0.48, 0.58, 0.70] as const;
    const litFur = [0.94, 0.97, 1.00] as const;
    const tuft = noise(p, 0.035, 59);
    return mix(shadowFur, litFur, smoothstep(0.15, 0.85, tuft * 0.65 + n.y * 0.35));
  });

  // Worn Oxblood / Deep Brown Leather Grip
  const LEATHER_PAINT = paint((p, n) => {
    const darkLeather = [0.16, 0.09, 0.06] as const;
    const warmTone = [0.32, 0.18, 0.12] as const;
    const highlight = [0.44, 0.26, 0.18] as const;
    const grain = noise(p, 0.025, 11);
    let col = mix(darkLeather, warmTone, grain * 0.7);
    if (n.y > 0.4) col = mix(col, highlight, 0.3);
    return col;
  });

  // ---------------------------------------------------------------------------
  // 2. SVG TEXTURES
  // ---------------------------------------------------------------------------

  // Massive Heroic Blade Fuller Runes
  const runeBladeTex = svg(
    `<svg viewBox="0 0 500 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- Dark drop-shadow trench -->
      <path d="M 25 60 L 95 60 M 60 25 L 60 95 M 35 35 L 85 85 M 35 85 L 85 35" stroke="#040e18" stroke-width="16" stroke-linecap="round"/>
      <path d="M 120 60 L 160 20 L 200 60 L 160 100 Z M 160 10 L 160 110" stroke="#040e18" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 225 35 L 275 60 L 225 85 M 250 20 L 250 100 M 275 35 L 275 85" stroke="#040e18" stroke-width="16" stroke-linecap="round"/>
      <path d="M 310 60 L 350 20 L 390 60 L 350 100 Z M 330 40 L 370 80 M 330 80 L 370 40" stroke="#040e18" stroke-width="16" stroke-linecap="round"/>
      <path d="M 415 30 L 455 60 L 415 90 M 455 30 L 490 60 L 455 90" stroke="#040e18" stroke-width="16" stroke-linecap="round"/>
      <!-- Vibrant Cyan Runic Inlay -->
      <path d="M 25 60 L 95 60 M 60 25 L 60 95 M 35 35 L 85 85 M 35 85 L 85 35" stroke="#0df0ff" stroke-width="8" stroke-linecap="round" filter="url(#glow)"/>
      <path d="M 120 60 L 160 20 L 200 60 L 160 100 Z M 160 10 L 160 110" stroke="#0df0ff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>
      <path d="M 225 35 L 275 60 L 225 85 M 250 20 L 250 100 M 275 35 L 275 85" stroke="#0df0ff" stroke-width="8" stroke-linecap="round" filter="url(#glow)"/>
      <path d="M 310 60 L 350 20 L 390 60 L 350 100 Z M 330 40 L 370 80 M 330 80 L 370 40" stroke="#0df0ff" stroke-width="8" stroke-linecap="round" filter="url(#glow)"/>
      <path d="M 415 30 L 455 60 L 415 90 M 455 30 L 490 60 L 455 90" stroke="#0df0ff" stroke-width="8" stroke-linecap="round" filter="url(#glow)"/>
      <!-- Pure White Supercharged Center -->
      <path d="M 25 60 L 95 60 M 60 25 L 60 95 M 35 35 L 85 85 M 35 85 L 85 35" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 120 60 L 160 20 L 200 60 L 160 100 Z M 160 10 L 160 110" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 225 35 L 275 60 L 225 85 M 250 20 L 250 100 M 275 35 L 275 85" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 310 60 L 350 20 L 390 60 L 350 100 Z M 330 40 L 370 80 M 330 80 L 370 40" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 415 30 L 455 60 L 415 90 M 455 30 L 490 60 L 455 90" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,
    { size: 512 },
  );

  // Concentric Rune Array for Altar Dais
  const altarCircleTex = svg(
    `<svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
      <circle cx="250" cy="250" r="245" fill="#141c24" stroke="#2a3a4c" stroke-width="4"/>
      <circle cx="250" cy="250" r="222" fill="none" stroke="#091420" stroke-width="32"/>
      <circle cx="250" cy="250" r="238" fill="none" stroke="#22364a" stroke-width="3"/>
      <circle cx="250" cy="250" r="206" fill="none" stroke="#22364a" stroke-width="3"/>
      <circle cx="250" cy="250" r="222" fill="none" stroke="#0df0ff" stroke-width="5" stroke-dasharray="14 18"/>
      <circle cx="250" cy="250" r="170" fill="none" stroke="#0f2233" stroke-width="20"/>
      <circle cx="250" cy="250" r="180" fill="none" stroke="#324c64" stroke-width="2"/>
      <circle cx="250" cy="250" r="160" fill="none" stroke="#324c64" stroke-width="2"/>
      <circle cx="250" cy="250" r="170" fill="none" stroke="#38c8ff" stroke-width="4" stroke-dasharray="8 12"/>
      <g transform="translate(250, 250)">
        <path d="M 0 -155 L 0 -40 M 0 40 L 0 155 M -155 0 L -40 0 M 40 0 L 155 0 M -110 -110 L -28 -28 M 28 28 L 110 110 M 110 -110 L 28 -28 M -28 28 L -110 110" stroke="#0a1a28" stroke-width="12" stroke-linecap="round"/>
        <path d="M 0 -155 L 0 -40 M 0 40 L 0 155 M -155 0 L -40 0 M 40 0 L 155 0 M -110 -110 L -28 -28 M 28 28 L 110 110 M 110 -110 L 28 -28 M -28 28 L -110 110" stroke="#0df0ff" stroke-width="6" stroke-linecap="round"/>
        <path d="M 0 -155 L 0 -40 M 0 40 L 0 155 M -155 0 L -40 0 M 40 0 L 155 0 M -110 -110 L -28 -28 M 28 28 L 110 110 M 110 -110 L 28 -28 M -28 28 L -110 110" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
        <polygon points="0,-135 18,-55 60,-55 24,-20 40,30 0,0 -40,30 -24,-20 -60,-55 -18,-55" fill="#0b2034" stroke="#0df0ff" stroke-width="3"/>
        <circle cx="0" cy="0" r="42" fill="#122436" stroke="#0df0ff" stroke-width="3.5"/>
        <circle cx="0" cy="0" r="22" fill="#071622" stroke="#ffffff" stroke-width="2"/>
        <circle cx="0" cy="0" r="8" fill="#d8f8ff"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  // Freljordian Ram Crest for Socket Housing
  const socketCrestTex = svg(
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <polygon points="100,8 188,44 172,148 100,192 28,148 12,44" fill="#121a24" stroke="#d49a34" stroke-width="7"/>
      <polygon points="100,20 172,50 158,138 100,176 42,138 28,50" fill="#182330" stroke="#8a6020" stroke-width="2"/>
      <path d="M 100 65 Q 148 28 168 60 Q 178 92 148 112 Q 126 116 118 96 Q 126 76 146 76 Q 152 65 136 55 Q 116 50 100 65" fill="#e6ad38" stroke="#7a4f15" stroke-width="2.5"/>
      <path d="M 100 65 Q 52 28 32 60 Q 22 92 52 112 Q 74 116 82 96 Q 74 76 54 76 Q 48 65 64 55 Q 84 50 100 65" fill="#e6ad38" stroke="#7a4f15" stroke-width="2.5"/>
      <polygon points="100,48 126,75 120,122 100,148 80,122 74,75" fill="#d2ddeb" stroke="#506680" stroke-width="3"/>
      <polygon points="88,82 98,84 92,90" fill="#0df0ff"/>
      <polygon points="112,82 102,84 108,90" fill="#0df0ff"/>
      <path d="M 94 112 L 100 120 L 106 112 M 100 124 L 100 138" stroke="#223344" stroke-width="3" stroke-linecap="round"/>
      <polygon points="100,152 108,162 100,172 92,162" fill="#0df0ff" stroke="#ffffff" stroke-width="1.5"/>
    </svg>`,
    { size: 256 },
  );

  // Cross-Stitched Heavy Leather Shaft Wrap
  const leatherWrapTex = svg(
    `<svg viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="400" fill="#28160e"/>
      <line x1="0" y1="0" x2="0" y2="400" stroke="#120804" stroke-width="8"/>
      <line x1="100" y1="0" x2="100" y2="400" stroke="#180c06" stroke-width="4"/>
      <line x1="200" y1="0" x2="200" y2="400" stroke="#120804" stroke-width="8"/>
      <g stroke="#160804" stroke-width="20" fill="none">
        <path d="M -50 0 L 250 300 M -50 100 L 250 400 M -50 200 L 250 500 M -50 -100 L 250 200"/>
        <path d="M 250 0 L -50 300 M 250 100 L -50 400 M 250 200 L -50 500 M 250 -100 L -50 200"/>
      </g>
      <g stroke="#8c5830" stroke-width="12" fill="none">
        <path d="M -50 0 L 250 300 M -50 100 L 250 400 M -50 200 L 250 500 M -50 -100 L 250 200"/>
        <path d="M 250 0 L -50 300 M 250 100 L -50 400 M 250 200 L -50 500 M 250 -100 L -50 200"/>
      </g>
      <g stroke="#c28c5a" stroke-width="3" fill="none">
        <path d="M -50 0 L 250 300 M -50 100 L 250 400 M -50 200 L 250 500 M -50 -100 L 250 200"/>
        <path d="M 250 0 L -50 300 M 250 100 L -50 400 M 250 200 L -50 500 M 250 -100 L -50 200"/>
      </g>
      <g fill="#d8a038" stroke="#442a08" stroke-width="2">
        <circle cx="100" cy="50" r="5.5"/>
        <circle cx="100" cy="150" r="5.5"/>
        <circle cx="100" cy="250" r="5.5"/>
        <circle cx="100" cy="350" r="5.5"/>
        <circle cx="0" cy="100" r="5.5"/>
        <circle cx="200" cy="100" r="5.5"/>
        <circle cx="0" cy="200" r="5.5"/>
        <circle cx="200" cy="200" r="5.5"/>
        <circle cx="0" cy="300" r="5.5"/>
        <circle cx="200" cy="300" r="5.5"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  // Stylized League Fur Tuft Card
  const furTuftTex = svg(
    `<svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">
      <path d="M 12 220 C 18 150 8 100 24 35 L 42 85 C 46 45 52 12 68 0 C 68 40 74 80 88 105 L 76 140 C 86 155 96 175 92 220 Z" fill="#182636"/>
      <path d="M 18 215 C 24 155 14 105 28 45 L 44 90 C 48 52 54 24 66 14 C 66 48 72 85 84 108 L 74 142 C 84 158 92 178 88 215 Z" fill="#9ab2cc"/>
      <path d="M 34 135 C 40 80 48 40 64 18 C 62 55 68 95 78 118 L 70 152 Z" fill="#d6e6f5"/>
      <path d="M 44 115 C 50 60 55 32 64 18 C 62 50 66 85 72 108 Z" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  // Floating Frost Sparkle Mote
  const frostStarTex = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,0 55,42 95,50 55,58 50,100 45,58 5,50 45,42" fill="#0df0ff"/>
      <polygon points="50,10 53,45 85,50 53,55 50,90 47,55 15,50 47,45" fill="#f0fbff"/>
      <polygon points="50,28 54,46 72,50 54,54 50,72 46,54 28,50 46,46" fill="#0df0ff"/>
      <polygon points="50,34 52,47 66,50 52,53 50,66 48,53 34,50 48,47" fill="#ffffff"/>
      <circle cx="50" cy="50" r="5" fill="#ffffff"/>
      <polygon points="20,15 24,20 20,25 16,20" fill="#0df0ff"/>
      <polygon points="80,80 83,85 80,90 77,85" fill="#0df0ff"/>
    </svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------------------
  // 3. RIGGING SKELETON
  // ---------------------------------------------------------------------------

  const root = b.joint("root", { at: [0, 0, 0] });
  const altarBone = b.joint("altar", { parent: root, at: [0, 0.12, 0] });
  const haftBase = b.joint("haftBase", { parent: root, at: [0, 0.22, 0], dir: [0, 1, 0] });
  const haftGripLower = b.joint("haftGripLower", { parent: haftBase, at: [0, 0.48, 0], dir: [0, 1, 0] });
  const haftMid = b.joint("haftMid", { parent: haftGripLower, at: [0, 0.84, 0], dir: [0, 1, 0] });
  const haftGripUpper = b.joint("haftGripUpper", { parent: haftMid, at: [0, 1.14, 0], dir: [0, 1, 0] });
  const haftCollar = b.joint("haftCollar", { parent: haftGripUpper, at: [0, 1.34, 0], dir: [0, 1, 0] });
  const axeHead = b.joint("axeHead", { parent: haftCollar, at: [0, 1.48, 0], dir: [0, 1, 0] });
  const bladeMain = b.joint("bladeMain", { parent: axeHead, at: [0.18, 1.48, 0], dir: [1, 0, 0] });
  const bladeBack = b.joint("bladeBack", { parent: axeHead, at: [-0.18, 1.48, 0], dir: [-1, 0, 0] });
  const topSpike = b.joint("topSpike", { parent: axeHead, at: [0, 1.68, 0], dir: [0, 1, 0] });

  // ---------------------------------------------------------------------------
  // 4. FROZEN RUNESTONE ALTAR (DAIS & CRAGGY OUTBURSTS)
  // ---------------------------------------------------------------------------

  // Tier 1: Low Octagonal Foundation Slab (y = 0.0 to 0.07)
  b.part(new THREE.CylinderGeometry(0.66, 0.70, 0.07, 8), ALTAR_STONE, {
    bone: altarBone,
    at: [0, 0.035, 0],
    name: "altar_oct_base",
  });

  // Perimeter Bevel Keystones on 8 corners
  for (let i = 0; i < 8; i++) {
    const ang = (i * Math.PI) / 4 + Math.PI / 8;
    b.part(new THREE.BoxGeometry(0.14, 0.07, 0.12), ALTAR_STONE, {
      bone: altarBone,
      at: [Math.cos(ang) * 0.65, 0.045, Math.sin(ang) * 0.65],
      rotation: [0, -ang, 0],
      name: `altar_curb_${i}`,
    });
    // Snow caps on each keystone
    b.part(new THREE.SphereGeometry(0.045, 6, 4), SNOW_WHITE, {
      bone: altarBone,
      at: [Math.cos(ang) * 0.65, 0.085, Math.sin(ang) * 0.65],
      scale: [1.2, 0.35, 1.1],
      name: `snow_cap_${i}`,
    });
  }

  // Tier 2: Middle Carved Stone Dais
  b.part(new THREE.CylinderGeometry(0.50, 0.53, 0.08, 24), ALTAR_STONE, {
    bone: altarBone,
    at: [0, 0.105, 0],
    name: "altar_dais_mid",
  });

  // Glowing Runic Disc on Top of Dais
  glow(
    b.part(new THREE.CircleGeometry(0.49, 32), "#ffffff", {
      bone: altarBone,
      at: [0, 0.146, 0],
      dir: [0, 1, 0],
      axis: "z",
      texture: altarCircleTex,
      name: "altar_runic_circle",
    }),
    1.2,
  );

  // Central Cracked Cradle Block
  b.part(new THREE.BoxGeometry(0.28, 0.10, 0.24), ALTAR_STONE, {
    bone: altarBone,
    at: [0, 0.18, 0],
    name: "altar_cradle_block",
  });

  // Forged Iron Clamping Corner Brackets on the Cradle
  for (const sx of [1, -1]) {
    for (const sz of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.04, 0.11, 0.04), DARK_IRON, {
        bone: altarBone,
        at: [sx * 0.135, 0.18, sz * 0.115],
        name: `altar_bracket_${sx}_${sz}`,
      });
      b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.008, 6), GILT_GOLD, {
        bone: altarBone,
        at: [sx * 0.135, 0.23, sz * 0.115],
        dir: [0, 1, 0],
        name: `altar_bracket_rivet_${sx}_${sz}`,
      });
    }
  }

  // Heavy Faceted True Ice Crystal Formations (Chunky League Style)
  const crystalAngles = [25, 65, 105, 145, 190, 230, 270, 310, 345];
  const crystalHeights = [0.44, 0.30, 0.52, 0.36, 0.56, 0.32, 0.48, 0.38, 0.26];
  const crystalR0 = [0.065, 0.048, 0.075, 0.052, 0.08, 0.046, 0.07, 0.058, 0.042];
  const crystalDist = [0.36, 0.43, 0.38, 0.44, 0.35, 0.42, 0.37, 0.43, 0.40];

  crystalAngles.forEach((deg, idx) => {
    const rad = (deg * Math.PI) / 180;
    const dist = crystalDist[idx];
    const px = Math.cos(rad) * dist;
    const pz = Math.sin(rad) * dist;
    const h = crystalHeights[idx];
    const r = crystalR0[idx];
    const lean = new THREE.Vector3(Math.cos(rad) * 0.4, 0.92, Math.sin(rad) * 0.4).normalize();

    // Chunky Hexagonal Crystal Monolith
    b.part(new THREE.CylinderGeometry(r * 0.35, r, h, 6), TRUE_ICE_PAINT, {
      bone: altarBone,
      at: [px, 0.14 + h * 0.45, pz],
      dir: lean,
      flat: true,
      name: `crystal_monolith_${idx}`,
    });

    // Faceted Crystal Peak
    const tipPos = new THREE.Vector3(px, 0.14 + h * 0.45, pz).addScaledVector(lean, h * 0.5);
    glow(
      b.part(new THREE.ConeGeometry(r * 0.36, r * 0.9, 6), CYAN_GLOW, {
        bone: altarBone,
        at: tipPos,
        dir: lean,
        flat: true,
        name: `crystal_monolith_cap_${idx}`,
      }),
      1.8,
    );

    // Companion Shard
    const subRad = rad + 0.18;
    const subDist = dist - 0.06;
    glow(
      b.part(new THREE.ConeGeometry(r * 0.5, h * 0.45, 5), TRUE_ICE_CYAN, {
        bone: altarBone,
        at: [Math.cos(subRad) * subDist, 0.14 + h * 0.22, Math.sin(subRad) * subDist],
        dir: [Math.cos(subRad) * 0.5, 0.85, Math.sin(subRad) * 0.5],
        flat: true,
        name: `crystal_shard_${idx}`,
      }),
      1.1,
    );
  });

  // ---------------------------------------------------------------------------
  // 5. POMMEL & LOWER ANCHOR (y = 0.20 to 0.36)
  // ---------------------------------------------------------------------------

  // Ground Wedge Spike (Wedged deep into the stone cradle)
  b.spike([0, 0.21, 0], [0, -1, 0], 0.08, 0.024, {
    bone: haftBase,
    color: DARK_IRON,
    section: { ngon: 6 },
    name: "pommel_ground_spike",
  });

  // Massive Teardrop True Ice Gem at Base of Pommel
  glow(
    b.part(new THREE.OctahedronGeometry(0.035, 0), CYAN_GLOW, {
      bone: haftBase,
      at: [0, 0.23, 0],
      scale: [1.1, 1.6, 1.1],
      name: "pommel_true_ice_gem",
    }),
    2.2,
  );

  // Heavy Octagonal Frost-Steel Pommel Weight
  b.part(new THREE.CylinderGeometry(0.046, 0.056, 0.08, 8), FROST_STEEL, {
    bone: haftBase,
    at: [0, 0.29, 0],
    flat: true,
    name: "pommel_counterweight",
  });

  // Brass Runic Retention Collar
  b.part(new THREE.CylinderGeometry(0.060, 0.060, 0.025, 8), BRASS_RUNIC, {
    bone: haftBase,
    at: [0, 0.32, 0],
    flat: true,
    name: "pommel_retention_ring",
  });

  // 8 Gilt Hex Bolts on Pommel Ring
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.006, 6), GILT_GOLD, {
      bone: haftBase,
      at: [Math.cos(a) * 0.058, 0.32, Math.sin(a) * 0.058],
      dir: [Math.cos(a), 0, Math.sin(a)],
      name: `pommel_bolt_${i}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 6. LOWER HAFT & LEATHER GRIP (y = 0.34 to 0.72)
  // ---------------------------------------------------------------------------

  // Inner Shaft Core
  b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.38, 8), DARK_IRON, {
    bone: haftGripLower,
    at: [0, 0.52, 0],
    name: "haft_lower_core",
  });

  // Cross-Laced Textured Leather Grip Sleeve
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.36, 16), "#ffffff", {
    bone: haftGripLower,
    at: [0, 0.52, 0],
    texture: leatherWrapTex,
    name: "haft_lower_leather_sleeve",
  });

  // Heavy Reinforced Brass Ferrules with Rivets
  for (const fy of [0.36, 0.52, 0.68]) {
    b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.022, 8), BRASS_RUNIC, {
      bone: haftGripLower,
      at: [0, fy, 0],
      name: `haft_lower_band_${fy}`,
    });
    for (let j = 0; j < 4; j++) {
      const ja = (j * Math.PI) / 2;
      b.part(new THREE.SphereGeometry(0.006, 6, 4), GILT_GOLD, {
        bone: haftGripLower,
        at: [Math.cos(ja) * 0.043, fy, Math.sin(ja) * 0.043],
        name: `haft_lower_band_stud_${fy}_${j}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 7. MID HAFT & RUNE EMBOSS (y = 0.72 to 1.10)
  // ---------------------------------------------------------------------------

  // Octagonal Frost-Steel Mid Casing
  b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.40, 8), FROST_STEEL, {
    bone: haftMid,
    at: [0, 0.90, 0],
    flat: true,
    name: "haft_mid_oct_casing",
  });

  // Mid Grip Leather Segment
  b.part(new THREE.CylinderGeometry(0.037, 0.037, 0.22, 16), LEATHER_PAINT, {
    bone: haftMid,
    at: [0, 0.90, 0],
    name: "haft_mid_leather_wrap",
  });

  // 4 Recessed Glowing Frost Rune Channels along Mid Shaft
  for (let r = 0; r < 4; r++) {
    const ra = (r * Math.PI) / 2 + Math.PI / 4;
    glow(
      b.part(new THREE.BoxGeometry(0.008, 0.34, 0.006), CYAN_GLOW, {
        bone: haftMid,
        at: [Math.cos(ra) * 0.035, 0.90, Math.sin(ra) * 0.035],
        rotation: [0, -ra * (180 / Math.PI), 0],
        name: `haft_mid_rune_channel_${r}`,
      }),
      1.8,
    );
  }

  // Clamping Heavy Rings
  for (const cy of [0.72, 1.08]) {
    b.part(new THREE.CylinderGeometry(0.044, 0.044, 0.030, 8), BRASS_RUNIC, {
      bone: haftMid,
      at: [0, cy, 0],
      name: `haft_mid_ring_${cy}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 8. UPPER HAFT & WINTER WOLF FUR RUFF (y = 1.10 to 1.36)
  // ---------------------------------------------------------------------------

  // Upper Shaft Core
  b.part(new THREE.CylinderGeometry(0.034, 0.036, 0.26, 8), DARK_IRON, {
    bone: haftGripUpper,
    at: [0, 1.22, 0],
    name: "haft_upper_core",
  });

  // Volumetric Sculpted Fur Collar (3 Stacked Torus Rings with Organic Widths)
  const furRings = [
    { y: 1.18, maj: 0.062, min: 0.024 },
    { y: 1.25, maj: 0.076, min: 0.030 },
    { y: 1.32, maj: 0.065, min: 0.025 },
  ];
  furRings.forEach((lvl, i) => {
    b.part(new THREE.TorusGeometry(lvl.maj, lvl.min, 8, 16), FUR_PAINT, {
      bone: haftGripUpper,
      at: [0, lvl.y, 0],
      rotation: [90, 0, 0],
      name: `fur_volumetric_tier_${i}`,
    });
  });

  // Stylized Freljord Wolf Fur Tuft Cards (Flared outward dramatically)
  const furFrames: ReturnType<typeof frame>[] = [];
  const furCardCount = 20;
  for (let i = 0; i < furCardCount; i++) {
    const a = (i / furCardCount) * Math.PI * 2;
    const yOff = 1.20 + (i % 2) * 0.06;
    const rad = 0.082;
    furFrames.push(frame([Math.cos(a) * rad, yOff, Math.sin(a) * rad], [Math.cos(a) * 0.9, -0.4, Math.sin(a) * 0.9]));
  }
  b.cards(furFrames, furTuftTex, {
    bone: haftGripUpper,
    size: [0.085, 0.18],
    lean: 36,
    bend: 20,
    vary: 0.25,
    rng: rng(777),
  });

  // Heavy Braided Gilt Torcs Binding the Ruff
  b.part(new THREE.TorusGeometry(0.062, 0.010, 6, 16), GILT_GOLD, {
    bone: haftGripUpper,
    at: [0, 1.14, 0],
    rotation: [90, 0, 0],
    name: "fur_collar_torc_lower",
  });
  b.part(new THREE.TorusGeometry(0.062, 0.010, 6, 16), GILT_GOLD, {
    bone: haftGripUpper,
    at: [0, 1.33, 0],
    rotation: [90, 0, 0],
    name: "fur_collar_torc_upper",
  });

  // Hanging Wolf Fang Talismans around Collar
  for (let f = 0; f < 4; f++) {
    const fa = (f * Math.PI) / 2 + Math.PI / 4;
    const fx = Math.cos(fa) * 0.07;
    const fz = Math.sin(fa) * 0.07;
    b.spike([fx, 1.18, fz], [0, -1, 0], 0.055, 0.009, {
      bone: haftGripUpper,
      color: SNOW_WHITE,
      section: { ngon: 5 },
      name: `collar_fang_${f}`,
    });
    b.part(new THREE.SphereGeometry(0.005, 6, 4), GILT_GOLD, {
      bone: haftGripUpper,
      at: [fx, 1.18, fz],
      name: `collar_fang_bead_${f}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 9. AXE SOCKET & THE GLACIAL HEART POWER CHAMBER (y = 1.34 to 1.62)
  // ---------------------------------------------------------------------------

  // Transition Neck Ferrule
  b.part(new THREE.CylinderGeometry(0.046, 0.038, 0.06, 8), BRASS_RUNIC, {
    bone: haftCollar,
    at: [0, 1.37, 0],
    name: "haft_socket_transition_ferrule",
  });

  // Heavy Octagonal Power Chamber Housing (Faceted Forge Box)
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 8), DARK_IRON, {
    bone: axeHead,
    at: [0, 1.48, 0],
    flat: true,
    name: "socket_oct_housing",
  });

  // Top and Bottom Reinforcement Plates of the Socket
  b.part(new THREE.CylinderGeometry(0.135, 0.135, 0.035, 8), FROST_STEEL, {
    bone: axeHead,
    at: [0, 1.58, 0],
    flat: true,
    name: "socket_plate_top",
  });
  b.part(new THREE.CylinderGeometry(0.135, 0.135, 0.035, 8), FROST_STEEL, {
    bone: axeHead,
    at: [0, 1.38, 0],
    flat: true,
    name: "socket_plate_bottom",
  });

  // Center Viewing Aperture: Massive Glowing Glacial Heart Crystal
  glow(
    b.part(new THREE.OctahedronGeometry(0.065, 0), CYAN_GLOW, {
      bone: axeHead,
      at: [0, 1.48, 0],
      scale: [1.0, 1.45, 1.0],
      name: "glacial_heart_crystal",
    }),
    2.5,
  );

  // Floating Internal Diamond Core
  glow(
    b.part(new THREE.OctahedronGeometry(0.035, 0), "#ffffff", {
      bone: axeHead,
      at: [0, 1.48, 0],
      scale: [0.8, 1.3, 0.8],
      name: "glacial_heart_supercore",
    }),
    3.0,
  );

  // 4 Golden Crystal Retention Claws Clamping the Glacial Heart
  for (const cx of [1, -1]) {
    for (const cy of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.016, 0.045, 0.016), GILT_GOLD, {
        bone: axeHead,
        at: [cx * 0.048, 1.48 + cy * 0.075, 0],
        rotation: [0, 0, cx * cy * 25],
        name: `glacial_heart_claw_${cx}_${cy}`,
      });
    }
  }

  // Socket Front and Back Ram Crest Decals
  glow(
    b.part(new THREE.PlaneGeometry(0.15, 0.15), "#ffffff", {
      bone: axeHead,
      at: [0, 1.48, 0.088],
      dir: [0, 0, 1],
      axis: "z",
      texture: socketCrestTex,
      name: "socket_crest_front",
    }),
    1.2,
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.15, 0.15), "#ffffff", {
      bone: axeHead,
      at: [0, 1.48, -0.088],
      dir: [0, 0, -1],
      axis: "z",
      texture: socketCrestTex,
      name: "socket_crest_back",
    }),
    1.2,
  );

  // Mammoth Gilt Bolt Clusters on Socket Edges
  for (const bx of [0.085, -0.085]) {
    for (const by of [1.41, 1.55]) {
      for (const bz of [0.088, -0.088]) {
        b.part(new THREE.CylinderGeometry(0.010, 0.010, 0.008, 6), GILT_GOLD, {
          bone: axeHead,
          at: [bx, by, bz],
          dir: [0, 0, Math.sign(bz)],
          name: `socket_rivet_${bx}_${by}_${bz}`,
        });
      }
    }
  }

  // Massive Sweeping Freljordian Ram Horns Curving on the Socket Sides
  for (const s of [1, -1]) {
    // Heavy Horn Base Socket Mount
    b.part(new THREE.CylinderGeometry(0.042, 0.050, 0.04, 8), GILT_GOLD, {
      bone: axeHead,
      at: [s * 0.11, 1.48, 0],
      dir: [s, 0, 0],
      name: `ram_horn_base_collar_${s}`,
    });

    const hornPts = [
      [s * 0.12, 1.48, 0.01],
      [s * 0.20, 1.54, 0.08],
      [s * 0.26, 1.50, 0.11],
      [s * 0.24, 1.38, 0.09],
      [s * 0.16, 1.34, 0.04],
      [s * 0.12, 1.37, -0.01],
    ];
    const hornPath = catmull(hornPts);
    b.sweep(hornPath, (t) => 0.035 * (1 - t * 0.70), {
      bone: axeHead,
      color: GILT_GOLD,
      section: { ngon: 6 },
      caps: "round",
    });

    // Flanged Ornamental Rings along the Horns
    for (const hr of [0.25, 0.55, 0.80]) {
      const hpt = hornPath.at(hr);
      const htan = hornPath.tangentAt(hr);
      b.part(new THREE.TorusGeometry(0.035 * (1 - hr * 0.70) * 1.15, 0.005, 6, 12), BRASS_RUNIC, {
        bone: axeHead,
        at: hpt,
        dir: htan,
        name: `ram_horn_ring_${s}_${hr}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 10. PRIMARY BLADE: THE GLACIAL CRESCENT (+X) (MASSIVE LEAGUE SCALE!)
  // ---------------------------------------------------------------------------

  // A. Inner Frost-Steel Spine / Chassis (+X, y = 1.48 center)
  // Height: ~0.70 m, Width: ~0.35 m
  const SPINE_MAIN_OUTLINE: [number, number, ("sharp" | undefined)?][] = [
    [0.10, 0.12],
    [0.22, 0.25],
    [0.38, 0.38, "sharp"],
    [0.35, 0.26],
    [0.28, 0.02],
    [0.25, -0.22],
    [0.20, -0.36, "sharp"],
    [0.10, -0.14],
  ];

  b.extrude(SPINE_MAIN_OUTLINE, {
    bone: bladeMain,
    at: [0, 1.48, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.062,
    bevel: 0.008,
    smoothing: 1,
    color: FROST_STEEL,
    name: "blade_main_spine_iron",
  });

  // B. Large Glowing Runic Fuller Decal Plates (Front and Back)
  glow(
    b.part(new THREE.PlaneGeometry(0.28, 0.07), "#ffffff", {
      bone: bladeMain,
      at: [0.24, 1.50, 0.032],
      dir: [0, 0, 1],
      axis: "z",
      rotation: [0, 0, 24],
      texture: runeBladeTex,
      name: "blade_main_runes_front",
    }),
    2.2,
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.28, 0.07), "#ffffff", {
      bone: bladeMain,
      at: [0.24, 1.50, -0.032],
      dir: [0, 0, -1],
      axis: "z",
      rotation: [0, 0, -24],
      texture: runeBladeTex,
      name: "blade_main_runes_back",
    }),
    2.2,
  );

  // C. Massive True Ice Sweeping Crescent Blade
  // Out to x = 0.74, height from y = 1.48 - 0.58 (-0.58) to y = 1.48 + 0.50 (+0.50) -> 1.08m total blade height!
  const TRUE_ICE_MAIN_OUTLINE: [number, number, ("sharp" | undefined)?][] = [
    [0.38, 0.38, "sharp"],
    [0.58, 0.50, "sharp"], // High recurve horn spike
    [0.68, 0.32],
    [0.74, 0.06], // Widest outer crescent swell
    [0.68, -0.22],
    [0.56, -0.46],
    [0.42, -0.58, "sharp"], // Lower bearded hook tip
    [0.32, -0.40],
    [0.20, -0.36, "sharp"],
    [0.25, -0.22],
    [0.28, 0.02],
    [0.35, 0.26],
  ];

  b.extrude(TRUE_ICE_MAIN_OUTLINE, {
    bone: bladeMain,
    at: [0, 1.48, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.036,
    bevel: 0.007,
    smoothing: 1,
    color: TRUE_ICE_PAINT,
    name: "blade_main_true_ice",
  });

  // Inner Razor Edge Accent of True Ice Blade
  glow(
    b.extrude(TRUE_ICE_MAIN_OUTLINE, {
      bone: bladeMain,
      at: [0, 1.48, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.002,
      smoothing: 1,
      color: CYAN_GLOW,
      name: "blade_main_true_ice_razor_core",
    }),
    2.0,
  );

  // D. Crystalline Spikes along the Upper Blade Spine
  const spineSpikes = [
    { at: [0.24, 1.74, 0], dir: [0.35, 0.90, 0], len: 0.14, r: 0.024 },
    { at: [0.32, 1.82, 0], dir: [0.45, 0.82, 0], len: 0.18, r: 0.028 },
    { at: [0.42, 1.90, 0], dir: [0.55, 0.72, 0], len: 0.15, r: 0.022 },
    { at: [0.52, 1.96, 0], dir: [0.65, 0.62, 0], len: 0.12, r: 0.018 },
  ];
  spineSpikes.forEach((spk, idx) => {
    glow(
      b.spike(spk.at, spk.dir, spk.len, spk.r, {
        bone: bladeMain,
        color: TRUE_ICE_CYAN,
        section: { ngon: 6 },
        name: `spine_spike_${idx}`,
      }),
      1.5,
    );
  });

  // E. Crystalline Icicles Hanging from Bearded Blade Hook
  const icicles = [
    { at: [0.42, 0.88, 0], len: 0.14, r: 0.014 },
    { at: [0.36, 0.96, 0], len: 0.10, r: 0.011 },
    { at: [0.30, 1.04, 0], len: 0.07, r: 0.009 },
  ];
  icicles.forEach((ici, idx) => {
    glow(
      b.spike(ici.at, [0, -1, 0], ici.len, ici.r, {
        bone: bladeMain,
        color: TRUE_ICE_CYAN,
        section: { ngon: 5 },
        name: `icicle_${idx}`,
      }),
      1.4,
    );
  });

  // F. Heavy Golden Clamping Jaws Locking the Blade into the Chassis
  for (const sz of [1, -1]) {
    // Upper Jaw Plate
    b.part(new THREE.BoxGeometry(0.12, 0.038, 0.012), GILT_GOLD, {
      bone: bladeMain,
      at: [0.32, 1.76, sz * 0.034],
      rotation: [0, 0, 30],
      name: `blade_jaw_upper_${sz}`,
    });
    // Upper Jaw Mammoth Rivets
    b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.006, 6), BRASS_RUNIC, {
      bone: bladeMain,
      at: [0.30, 1.74, sz * 0.040],
      dir: [0, 0, sz],
      name: `blade_jaw_rivet_up1_${sz}`,
    });
    b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.006, 6), BRASS_RUNIC, {
      bone: bladeMain,
      at: [0.34, 1.78, sz * 0.040],
      dir: [0, 0, sz],
      name: `blade_jaw_rivet_up2_${sz}`,
    });

    // Lower Jaw Plate
    b.part(new THREE.BoxGeometry(0.11, 0.034, 0.012), GILT_GOLD, {
      bone: bladeMain,
      at: [0.24, 1.24, sz * 0.034],
      rotation: [0, 0, -35],
      name: `blade_jaw_lower_${sz}`,
    });
    // Lower Jaw Rivets
    b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.006, 6), BRASS_RUNIC, {
      bone: bladeMain,
      at: [0.23, 1.26, sz * 0.040],
      dir: [0, 0, sz],
      name: `blade_jaw_rivet_lo1_${sz}`,
    });
    b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.006, 6), BRASS_RUNIC, {
      bone: bladeMain,
      at: [0.26, 1.22, sz * 0.040],
      dir: [0, 0, sz],
      name: `blade_jaw_rivet_lo2_${sz}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 11. SECONDARY BLADE / WAR PICK HOOK (-X)
  // ---------------------------------------------------------------------------

  // A. Inner Frost-Steel Back Spine (-X, y = 1.48 center)
  const SPINE_BACK_OUTLINE: [number, number, ("sharp" | undefined)?][] = [
    [-0.10, 0.12],
    [-0.20, 0.16],
    [-0.30, 0.14, "sharp"],
    [-0.25, -0.02],
    [-0.26, -0.16, "sharp"],
    [-0.10, -0.12],
  ];

  b.extrude(SPINE_BACK_OUTLINE, {
    bone: bladeBack,
    at: [0, 1.48, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.056,
    bevel: 0.007,
    smoothing: 1,
    color: FROST_STEEL,
    name: "blade_back_spine_iron",
  });

  // B. Massive True Ice Armor-Breaker Beak Pick
  // Reaches out to x = -0.58 m!
  const TRUE_ICE_HOOK_OUTLINE: [number, number, ("sharp" | undefined)?][] = [
    [-0.30, 0.14, "sharp"],
    [-0.44, 0.10],
    [-0.58, -0.04, "sharp"], // Piercing Armor-Breaker Hook Tip
    [-0.46, -0.12],
    [-0.34, -0.08],
    [-0.26, -0.16, "sharp"],
    [-0.25, -0.02],
  ];

  b.extrude(TRUE_ICE_HOOK_OUTLINE, {
    bone: bladeBack,
    at: [0, 1.48, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.032,
    bevel: 0.006,
    smoothing: 1,
    color: TRUE_ICE_PAINT,
    name: "blade_back_true_ice",
  });

  // Back Spine Serration Crystals
  glow(
    b.spike([-0.24, 1.64, 0], [-0.45, 0.85, 0], 0.11, 0.020, {
      bone: bladeBack,
      color: TRUE_ICE_CYAN,
      section: { ngon: 5 },
      name: "back_spike_0",
    }),
    1.5,
  );
  glow(
    b.spike([-0.34, 1.60, 0], [-0.65, 0.65, 0], 0.13, 0.022, {
      bone: bladeBack,
      color: TRUE_ICE_CYAN,
      section: { ngon: 5 },
      name: "back_spike_1",
    }),
    1.5,
  );
  glow(
    b.spike([-0.44, 1.54, 0], [-0.80, 0.45, 0], 0.10, 0.018, {
      bone: bladeBack,
      color: TRUE_ICE_CYAN,
      section: { ngon: 5 },
      name: "back_spike_2",
    }),
    1.5,
  );

  // Gilt Clamping Plates on War Pick
  for (const sz of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.10, 0.030, 0.010), GILT_GOLD, {
      bone: bladeBack,
      at: [-0.26, 1.54, sz * 0.030],
      rotation: [0, 0, -20],
      name: `hook_clamp_${sz}`,
    });
    b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.006, 6), BRASS_RUNIC, {
      bone: bladeBack,
      at: [-0.26, 1.54, sz * 0.036],
      dir: [0, 0, sz],
      name: `hook_clamp_bolt_${sz}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 12. TOP SPEARHEAD & CROWN LANCE (+Y) (y = 1.62 to 2.12)
  // ---------------------------------------------------------------------------

  // Heavy Octagonal Gilt Crown Ferrule
  b.part(new THREE.CylinderGeometry(0.040, 0.052, 0.05, 8), BRASS_RUNIC, {
    bone: topSpike,
    at: [0, 1.63, 0],
    name: "spear_collar_base",
  });
  b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.015, 8), GILT_GOLD, {
    bone: topSpike,
    at: [0, 1.65, 0],
    name: "spear_collar_ring",
  });

  // Diamond-Section Heavy Spearhead (Model X-Y Plane)
  const SPEAR_OUTLINE: [number, number, ("sharp" | undefined)?][] = [
    [0.0, 0.0],
    [0.055, 0.07],
    [0.042, 0.18],
    [0.060, 0.25],
    [0.0, 0.38, "sharp"], // Crown Lance Tip (Reaches y = 2.06 m!)
    [-0.060, 0.25],
    [-0.042, 0.18],
    [-0.055, 0.07],
  ];

  b.extrude(SPEAR_OUTLINE, {
    bone: topSpike,
    at: [0, 1.68, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.028,
    bevel: 0.004,
    color: FROST_STEEL,
    name: "spear_blade_main",
  });

  // Cross Flange (Model Z-Y Plane) for 3D Diamond Cross-Section
  const SPEAR_CROSS_OUTLINE: [number, number, ("sharp" | undefined)?][] = [
    [0.0, 0.0],
    [0.038, 0.08],
    [0.025, 0.20],
    [0.0, 0.36, "sharp"],
    [-0.025, 0.20],
    [-0.038, 0.08],
  ];

  b.extrude(SPEAR_CROSS_OUTLINE, {
    bone: topSpike,
    at: [0, 1.68, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.016,
    bevel: 0.003,
    color: TRUE_ICE_PAINT,
    name: "spear_blade_cross",
  });

  // Crown Terminal True Ice Jewel at Spear Tip
  glow(
    b.part(new THREE.OctahedronGeometry(0.025, 0), CYAN_GLOW, {
      bone: topSpike,
      at: [0, 2.05, 0],
      scale: [0.7, 1.8, 0.7],
      name: "spear_terminal_crystal",
    }),
    2.4,
  );

  // ---------------------------------------------------------------------------
  // 13. FLOATING FROST MOTE PARTICLES
  // ---------------------------------------------------------------------------

  const particleFrames: ReturnType<typeof frame>[] = [];
  const particleCount = 24;
  for (let i = 0; i < particleCount; i++) {
    const rx = (seedRng() - 0.5) * 0.9 + 0.15;
    const ry = 1.10 + seedRng() * 0.95;
    const rz = (seedRng() - 0.5) * 0.45;
    particleFrames.push(frame([rx, ry, rz], [0, 0, 1]));
  }

  glow(
    b.cards(particleFrames, frostStarTex, {
      bone: axeHead,
      size: [0.045, 0.045],
      vary: 0.4,
      rng: rng(999),
    }),
    2.2,
  );

  return b.root;
}
