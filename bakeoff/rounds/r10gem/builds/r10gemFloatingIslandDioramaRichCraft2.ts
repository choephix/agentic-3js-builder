import * as THREE from "three";
import {
  createBuilder,
  frame,
  line,
  aim,
  lerp,
  mid,
  offset,
  rng,
  DEG,
  vec,
  arc,
  bezier,
  catmull,
  polyline,
  spiral,
  paint,
  mix,
  smoothstep,
  noise,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { cel, INK, KEY_LIGHT, furEdge } from "../../../../kits/toon";

export const meta = {
  name: "floating_sky_island",
  description:
    "Genshin Impact styled floating sky island diorama featuring ancient Celestia ruins, cascading sacred waterfall, great Windrise anemo tree, glowing Anemo Oculus, Seelie spirit, and a precious treasure chest.",
};

// ---------------------------------------------------------------------------------------------------------------
// Textures (Stylized Genshin Impact SVGs)

const ANEMO_CREST = svg(
  `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <circle cx="128" cy="128" r="124" fill="#14373d" stroke="#f0c242" stroke-width="4"/>
    <circle cx="128" cy="128" r="114" fill="none" stroke="#24dec2" stroke-width="2.5" stroke-dasharray="6,4"/>
    <circle cx="128" cy="128" r="92" fill="#0f292e" stroke="#f0c242" stroke-width="3"/>
    <!-- 8-pointed Celestia star -->
    <path d="M128 36 L138 108 L210 118 L148 138 L168 210 L128 152 L88 210 L108 138 L46 118 L118 108 Z" fill="#f0c242" opacity="0.9"/>
    <path d="M128 54 L134 114 L192 122 L142 134 L156 192 L128 146 L100 192 L114 134 L64 122 L122 114 Z" fill="#2fead0"/>
    <!-- Center Anemo Triquetra knot -->
    <circle cx="128" cy="128" r="32" fill="#14373d" stroke="#f0c242" stroke-width="3"/>
    <circle cx="128" cy="128" r="22" fill="#2fead0"/>
    <circle cx="128" cy="128" r="10" fill="#ffffff"/>
    <path d="M128 102 C146 102 154 118 154 128 C154 138 146 154 128 154 C110 154 102 138 102 128 C102 118 110 102 128 102 Z" fill="none" stroke="#ffffff" stroke-width="2.5"/>
  </svg>`,
  { size: 256 },
);

const WATER_CAUSTIC = svg(
  `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <rect width="256" height="256" fill="#17a4bc"/>
    <path d="M20 40 Q70 10 120 45 T220 30 Q250 80 220 130 T130 150 Q50 170 30 110 Z" fill="none" stroke="#8cf6ff" stroke-width="7" opacity="0.7"/>
    <path d="M60 80 Q110 60 160 90 T240 100 Q230 170 180 200 T70 210 Q20 180 40 130 Z" fill="none" stroke="#ffffff" stroke-width="5" opacity="0.8"/>
    <path d="M90 30 Q150 20 190 60 T180 140 Q130 180 90 140 T50 70 Z" fill="none" stroke="#b2f9ff" stroke-width="6" opacity="0.6"/>
    <circle cx="70" cy="80" r="14" fill="#ffffff" opacity="0.65"/>
    <circle cx="170" cy="130" r="16" fill="#ffffff" opacity="0.65"/>
    <circle cx="120" cy="190" r="12" fill="#ffffff" opacity="0.65"/>
  </svg>`,
  { size: 256 },
);

const WATERFALL_FOAM = svg(
  `<svg viewBox="0 0 128 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="wf" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
        <stop offset="30%" stop-color="#4be3f7" stop-opacity="0.8"/>
        <stop offset="75%" stop-color="#1eb5d4" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="#f5ffff" stop-opacity="0.95"/>
      </linearGradient>
    </defs>
    <rect width="128" height="512" fill="url(#wf)"/>
    <path d="M16 0 L20 512 M48 0 L44 512 M80 0 L84 512 M112 0 L108 512" stroke="#ffffff" stroke-width="5" opacity="0.75"/>
    <path d="M32 20 Q36 120 30 240 T36 480 M96 30 Q92 150 98 280 T92 500" stroke="#ffffff" stroke-width="6" opacity="0.85"/>
    <path d="M0 0 Q64 30 128 0 L128 25 Q64 55 0 25 Z" fill="#ffffff"/>
    <path d="M0 480 Q64 510 128 480 L128 512 L0 512 Z" fill="#ffffff"/>
  </svg>`,
  { size: 256 },
);

const CECILIA_FLOWER = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <path d="M64 64 C40 40 40 10 64 8 C88 10 88 40 64 64 Z" fill="#ffffff" stroke="#b2ede8" stroke-width="2.5"/>
    <path d="M64 64 C40 88 40 118 64 120 C88 118 88 88 64 64 Z" fill="#ffffff" stroke="#b2ede8" stroke-width="2.5"/>
    <path d="M64 64 C40 40 10 40 8 64 C10 88 40 88 64 64 Z" fill="#ffffff" stroke="#b2ede8" stroke-width="2.5"/>
    <path d="M64 64 C88 40 118 40 120 64 C118 88 88 88 64 64 Z" fill="#ffffff" stroke="#b2ede8" stroke-width="2.5"/>
    <circle cx="64" cy="64" r="15" fill="#2ce2ca"/>
    <circle cx="64" cy="64" r="7" fill="#ffd858"/>
  </svg>`,
  { size: 128 },
);

const WINDWHEEL_ASTER = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(64,64)">
      <path d="M0 0 L18 -48 L32 -32 Z" fill="#e84534" stroke="#ffa24a" stroke-width="2"/>
      <path d="M0 0 L48 -18 L48 4 Z" fill="#dc3626" stroke="#ffa24a" stroke-width="2"/>
      <path d="M0 0 L32 36 L12 48 Z" fill="#e84534" stroke="#ffa24a" stroke-width="2"/>
      <path d="M0 0 L-18 48 L-32 32 Z" fill="#dc3626" stroke="#ffa24a" stroke-width="2"/>
      <path d="M0 0 L-48 18 L-48 -4 Z" fill="#e84534" stroke="#ffa24a" stroke-width="2"/>
      <path d="M0 0 L-32 -36 L-12 -48 Z" fill="#dc3626" stroke="#ffa24a" stroke-width="2"/>
      <circle cx="0" cy="0" r="12" fill="#ffd438" stroke="#8a1c12" stroke-width="2"/>
    </g>
  </svg>`,
  { size: 128 },
);

const LEAF_TUFT = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <path d="M64 116 C40 80 18 60 22 34 C26 12 50 16 64 38 C78 16 102 12 106 34 C110 60 88 80 64 116 Z" fill="#2ddbb8" stroke="#128b74" stroke-width="3"/>
    <path d="M64 100 C50 72 36 56 40 38 C43 24 58 26 64 45 C70 26 85 24 88 38 C92 56 78 72 64 100 Z" fill="#7ffbe2"/>
  </svg>`,
  { size: 128 },
);

const GOLD_TRIM = svg(
  `<svg viewBox="0 0 256 64" xmlns="http://www.w3.org/2000/svg">
    <rect width="256" height="64" fill="#201c18"/>
    <rect x="0" y="4" width="256" height="56" fill="#f0c242" stroke="#fff194" stroke-width="2"/>
    <path d="M0 32 L16 12 L32 32 L48 12 L64 32 L80 12 L96 32 L112 12 L128 32 L144 12 L160 32 L176 12 L192 32 L208 12 L224 32 L240 12 L256 32 L240 52 L224 32 L208 52 L192 32 L176 52 L160 32 L144 52 L128 32 L112 52 L96 32 L80 52 L64 32 L48 52 L32 32 L16 52 Z" fill="#8c6114"/>
    <circle cx="32" cy="32" r="5" fill="#2ce6c8"/>
    <circle cx="96" cy="32" r="5" fill="#2ce6c8"/>
    <circle cx="160" cy="32" r="5" fill="#2ce6c8"/>
    <circle cx="224" cy="32" r="5" fill="#2ce6c8"/>
  </svg>`,
  { size: 256 },
);

const ANEMO_RUNE = svg(
  `<svg viewBox="0 0 128 256" xmlns="http://www.w3.org/2000/svg">
    <path d="M64 20 L84 50 L64 80 L44 50 Z" fill="#2ce6c8" stroke="#ffffff" stroke-width="3"/>
    <circle cx="64" cy="50" r="6" fill="#ffffff"/>
    <path d="M34 110 Q64 90 94 110 T34 150" fill="none" stroke="#2ce6c8" stroke-width="6" stroke-linecap="round"/>
    <path d="M64 165 L80 190 L64 215 L48 190 Z" fill="none" stroke="#2ce6c8" stroke-width="4"/>
    <circle cx="64" cy="190" r="4" fill="#ffffff"/>
    <path d="M44 235 L84 235" stroke="#2ce6c8" stroke-width="5" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const SEELIE_TEX = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="sg" cx="0.5" cy="0.4" r="0.5">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="45%" stop-color="#55fae2"/>
        <stop offset="85%" stop-color="#1bc7af"/>
        <stop offset="100%" stop-color="#0a7c6c" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="64" cy="54" r="48" fill="url(#sg)"/>
    <ellipse cx="50" cy="50" rx="4" ry="7" fill="#06423a"/>
    <ellipse cx="78" cy="50" rx="4" ry="7" fill="#06423a"/>
    <circle cx="51" cy="48" r="2" fill="#ffffff"/>
    <circle cx="79" cy="48" r="2" fill="#ffffff"/>
    <path d="M20 54 Q8 40 18 30 Q28 40 24 54 Z" fill="#6dfce7"/>
    <path d="M108 54 Q120 40 110 30 Q100 40 104 54 Z" fill="#6dfce7"/>
  </svg>`,
  { size: 128 },
);

const CHEST_FRONT = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="20" width="88" height="88" rx="12" fill="#e5b842" stroke="#fff29c" stroke-width="3"/>
    <circle cx="64" cy="64" r="26" fill="#805615" stroke="#e5b842" stroke-width="3"/>
    <path d="M64 44 L78 64 L64 84 L50 64 Z" fill="#28e5cb" stroke="#ffffff" stroke-width="2"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
// Paints

const MARBLE = cel("#f0ebe1", "#9c9485");
const GOLD = cel("#f2c444", "#9e7018");
const WOOD_PAINT = cel("#766759", "#433a32");
const FOLIAGE_TEAL = cel("#28d8b6", "#0f7e68");
const FOLIAGE_MINT = cel("#66f2d5", "#1ea88e");
const FOLIAGE_AMBER = cel("#f59e2e", "#a84e0c");
const CLOUD_PAINT = cel("#f7f9fe", "#cbd5ea", { light: [0.3, 0.9, 0.4], threshold: -0.15 });
const WATER_PAINT = cel("#32d7ed", "#148fa8");

const CLIFF_ROCK = paint((p, n) => {
  const band = smoothstep(0.3, 1.15, p.y);
  const nse = noise(p, 0.22, 42);
  const base = mix("#362a22", "#6e5d4e", band * 0.7 + nse * 0.3);
  const moss = smoothstep(0.4, 0.8, n.y) * smoothstep(0.75, 1.25, p.y);
  return mix(base, "#527530", moss * 0.65);
});

const GRASS_PAINT = paint((p, n) => {
  const nse = noise(p, 0.22, 11);
  const lit = mix("#76c335", "#a2e244", nse);
  const shd = mix("#38741b", "#539626", nse);
  return n.y > 0.25 ? lit : shd;
});

// ---------------------------------------------------------------------------------------------------------------
// Main Builder

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "genshin_sky_island", detail: 1.0 });

  // 1. Rig Skeleton
  const root = b.joint("islandRoot", { at: [0, 1.25, 0] });
  const oculusJoint = b.joint("anemoOculus", { parent: root, at: [-0.35, 2.22, 0.08] });
  const seelieJoint = b.joint("seelie", { parent: root, at: [0.38, 1.52, -0.24] });
  const treeJoint = b.joint("windriseTree", { parent: root, at: [-0.52, 1.43, -0.22] });
  const satellite1 = b.joint("isletChest", { parent: root, at: [1.12, 1.05, -0.35] });
  const satellite2 = b.joint("isletDandelion", { parent: root, at: [-1.08, 0.88, 0.42] });
  const monolith1 = b.joint("floatingMonolith1", { parent: root, at: [-0.95, 1.82, 0.18] });
  const monolith2 = b.joint("floatingMonolith2", { parent: root, at: [0.65, 1.78, -0.48] });

  // -------------------------------------------------------------------------------------------------------------
  // 2. Base Clouds & Mist Sea (Grounds the diorama at y = 0.0)

  const cloudPuffs: [number, number, number, number][] = [
    // [x, z, radius, y-offset]
    [0.0, 0.0, 0.24, 0.24],
    [0.55, 0.22, 0.22, 0.22],
    [-0.52, 0.28, 0.23, 0.23],
    [0.28, -0.58, 0.21, 0.21],
    [-0.42, -0.52, 0.22, 0.22],
    [0.82, -0.18, 0.24, 0.24],
    [-0.82, -0.12, 0.23, 0.23],
    [0.12, 0.72, 0.25, 0.25],
    [-0.22, -0.78, 0.24, 0.24],
    [0.65, 0.65, 0.26, 0.26], // underneath the waterfall splash
    [-0.68, 0.52, 0.22, 0.22],
    [0.92, 0.35, 0.22, 0.22],
    [-0.95, 0.25, 0.21, 0.21],
    [0.35, 0.45, 0.25, 0.25],
    [-0.32, 0.62, 0.23, 0.23],
    [0.0, -0.45, 0.25, 0.25],
  ];

  for (let i = 0; i < cloudPuffs.length; i++) {
    const [cx, cz, cr, cy] = cloudPuffs[i];
    // Each puff sits at y = cy so lowest point cy - cr = 0.00!
    b.part(new THREE.SphereGeometry(cr, 12, 8), CLOUD_PAINT, {
      bone: root,
      at: [cx, cy, cz],
      scale: [1.2, 0.85, 1.15],
      group: "baseClouds",
    });
  }

  // Floating wind streamers circling the base clouds
  const baseWindSpiral = spiral([0, 0.28, 0], [0.85, 0.18, 0], [0, 1, 0], { turns: 1.4, pitch: 0.12 });
  glow(
    b.sweep(baseWindSpiral, 0.018, {
      color: "#35f0d4",
      bone: root,
      caps: "round",
      group: "baseWind",
    }),
    1.4,
  );

  // -------------------------------------------------------------------------------------------------------------
  // 3. Floating Island Rock Hull & Hanging Stalactites

  const hullStations = [
    { at: [0.0, 0.22, 0.0], w: 0.16, h: 0.16 },
    { at: [0.02, 0.42, 0.01], w: 0.48, h: 0.42 },
    { at: [-0.03, 0.68, -0.02], w: 0.92, h: 0.82 },
    { at: [0.01, 0.92, 0.02], w: 1.44, h: 1.24 },
    { at: [0.0, 1.12, -0.01], w: 1.86, h: 1.58 },
    { at: [0.0, 1.24, 0.0], w: 2.08, h: 1.76 },
  ];

  b.loft(hullStations, {
    color: CLIFF_ROCK,
    bone: root,
    caps: "flat",
    group: "islandHull",
  });

  // Hanging craggy rock spikes from the hull
  const rockSpikes: [number, number, number, number, number, number][] = [
    [0.0, 0.22, 0.0, 0.0, -1, 0.0],
    [0.25, 0.55, 0.2, 0.15, -0.85, 0.1],
    [-0.28, 0.6, -0.15, -0.2, -0.8, -0.1],
    [0.45, 0.82, -0.25, 0.25, -0.75, -0.15],
    [-0.5, 0.85, 0.3, -0.3, -0.7, 0.2],
    [0.65, 1.05, 0.15, 0.35, -0.65, 0.1],
    [-0.68, 1.02, -0.3, -0.35, -0.65, -0.2],
    [0.15, 0.75, -0.45, 0.1, -0.8, -0.3],
    [-0.15, 0.72, 0.48, -0.1, -0.8, 0.3],
  ];

  for (let i = 0; i < rockSpikes.length; i++) {
    const [sx, sy, sz, dx, dy, dz] = rockSpikes[i];
    b.spike([sx, sy, sz], [dx, dy, dz], 0.25, 0.055, {
      color: CLIFF_ROCK,
      bone: root,
      group: "islandSpikes",
    });
  }

  // Glowing Anemo crystals powering the levitation beneath the island
  const crystalSpikes: [number, number, number, number, number, number, number][] = [
    [0.02, 0.26, 0.01, 0.08, -0.95, 0.04, 0.22],
    [-0.06, 0.36, -0.04, -0.3, -0.88, -0.18, 0.17],
    [0.08, 0.38, 0.05, 0.35, -0.85, 0.2, 0.16],
    [-0.03, 0.45, 0.08, -0.15, -0.9, 0.35, 0.14],
  ];

  for (let i = 0; i < crystalSpikes.length; i++) {
    const [cx, cy, cz, cdx, cdy, cdz, clen] = crystalSpikes[i];
    glow(
      b.spike([cx, cy, cz], [cdx, cdy, cdz], clen, 0.034, {
        color: "#28f0d5",
        bone: root,
        group: "levitationCrystals",
      }),
      1.8,
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // 4. Terraced Grassy Plateau & Sacred Spring Pool

  // Main grassy ground layer
  b.frustumBox([0, 1.23, 0], [0, 1.28, 0], [2.12, 1.8], [2.06, 1.74], {
    color: GRASS_PAINT,
    bone: root,
    group: "islandGrass",
  });

  // Raised hill terrace on the back-left (for the ruins and hero tree)
  b.frustumBox([-0.42, 1.27, -0.32], [-0.42, 1.42, -0.32], [1.24, 1.04], [1.12, 0.92], {
    color: GRASS_PAINT,
    bone: root,
    group: "upperTerrace",
  });

  // Ancient shrine stone dais on the upper terrace
  b.frustumBox([-0.4, 1.41, -0.35], [-0.4, 1.45, -0.35], [0.88, 0.78], [0.84, 0.74], {
    color: MARBLE,
    bone: root,
    group: "shrineDais",
  });

  // Circular Anemo seal on the dais
  b.part(new THREE.PlaneGeometry(0.72, 0.72), "#ffffff", {
    bone: root,
    at: [-0.4, 1.453, -0.35],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    axis: "z",
    texture: ANEMO_CREST,
    group: "anemoSeal",
  });

  // Sunken sacred spring pool on the front-right
  const poolPos: [number, number, number] = [0.42, 1.265, 0.18];
  // Water surface
  b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.02, 18), "#ffffff", {
    bone: root,
    at: poolPos,
    texture: WATER_CAUSTIC,
    group: "poolWater",
  });

  // Cobblestone border around the pool
  const poolRing = b.ring(frame([poolPos[0], poolPos[1] + 0.015, poolPos[2]], [0, 1, 0]), {
    count: 14,
    radius: 0.29,
  });
  for (const it of poolRing.items) {
    b.part(new THREE.DodecahedronGeometry(0.045, 0), MARBLE, {
      bone: root,
      at: it.at,
      scale: [1.2, 0.65, 1.0],
      group: "poolStones",
    });
  }

  // Fountain pillar / sundial in the center of the pool
  b.part(new THREE.CylinderGeometry(0.04, 0.05, 0.12, 8), MARBLE, {
    bone: root,
    at: [poolPos[0], poolPos[1] + 0.06, poolPos[2]],
    group: "poolFountain",
  });
  glow(
    b.part(new THREE.SphereGeometry(0.035, 10, 8), "#22e8cf", {
      bone: root,
      at: [poolPos[0], poolPos[1] + 0.14, poolPos[2]],
      group: "poolGem",
    }),
    1.6,
  );

  // -------------------------------------------------------------------------------------------------------------
  // 5. Cascading Sacred Waterfall

  // Spillway trough
  b.part(new THREE.BoxGeometry(0.18, 0.05, 0.22), MARBLE, {
    bone: root,
    at: [0.66, 1.265, 0.32],
    group: "spillway",
  });

  // Waterfall Upper Arc (Spillway to intermediate ledge)
  const wfUpperPath = catmull([
    [0.66, 1.25, 0.35],
    [0.74, 1.15, 0.44],
    [0.79, 0.96, 0.51],
  ]);

  b.sweep(wfUpperPath, (t) => [0.12 * (1 - 0.2 * t), 0.018], {
    color: WATER_PAINT,
    bone: root,
    caps: "round",
    group: "wfUpperStream",
  });

  // Intermediate splash rock ledge
  b.part(new THREE.DodecahedronGeometry(0.09, 0), CLIFF_ROCK, {
    bone: root,
    at: [0.8, 0.94, 0.52],
    scale: [1.3, 0.7, 1.2],
    group: "splashLedge",
  });

  // Splash ring on the ledge
  b.part(new THREE.RingGeometry(0.04, 0.12, 12), "#ffffff", {
    bone: root,
    at: [0.8, 0.985, 0.52],
    dir: [0, 1, 0],
    axis: "z",
    texture: WATERFALL_FOAM,
    group: "splashRingUpper",
  });

  // Waterfall Lower Plunge (from ledge straight down into cloud sea)
  const wfLowerPath = catmull([
    [0.8, 0.92, 0.53],
    [0.84, 0.68, 0.58],
    [0.87, 0.42, 0.63],
    [0.89, 0.16, 0.67],
  ]);

  b.sweep(wfLowerPath, (t) => [0.15 * (1 - 0.25 * t), 0.022], {
    color: WATER_PAINT,
    bone: root,
    caps: "round",
    group: "wfLowerStream",
  });

  // Waterfall textured foam ribbon
  const foamPath = catmull([
    [0.8, 0.93, 0.54],
    [0.84, 0.68, 0.59],
    [0.87, 0.42, 0.64],
    [0.89, 0.17, 0.68],
  ]);

  b.sweep(foamPath, (t) => [0.13 * (1 - 0.2 * t), 0.012], {
    color: "#ffffff",
    bone: root,
    caps: "round",
    group: "wfFoamRibbon",
  });

  // Water splash droplets
  const dropletPoints: [number, number, number][] = [
    [0.82, 0.98, 0.48],
    [0.76, 0.97, 0.55],
    [0.84, 0.96, 0.56],
    [0.82, 0.65, 0.62],
    [0.86, 0.62, 0.54],
    [0.91, 0.35, 0.68],
    [0.85, 0.38, 0.58],
  ];

  for (let i = 0; i < dropletPoints.length; i++) {
    b.part(new THREE.SphereGeometry(0.018, 6, 6), "#ffffff", {
      bone: root,
      at: dropletPoints[i],
      group: "waterDroplets",
    });
  }

  // Bottom splash mist puffs where waterfall meets cloud sea
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.08, 8, 6), CLOUD_PAINT, {
      bone: root,
      at: [0.89 + Math.cos(a) * 0.12, 0.16, 0.67 + Math.sin(a) * 0.12],
      scale: [1.2, 0.7, 1.2],
      group: "waterfallBottomMist",
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // 6. Ancient Celestia Ruins (Pillars, Architrave & Floating Fragments)

  function buildPillar(
    at: [number, number, number],
    height: number,
    broken = false,
  ): void {
    const [px, py, pz] = at;
    // Stepped plinth
    b.part(new THREE.BoxGeometry(0.14, 0.04, 0.14), MARBLE, {
      bone: root,
      at: [px, py + 0.02, pz],
      group: "pillarBase",
    });
    b.part(new THREE.BoxGeometry(0.12, 0.03, 0.12), GOLD, {
      bone: root,
      at: [px, py + 0.05, pz],
      group: "pillarBaseGold",
    });

    // Fluted shaft
    b.part(new THREE.CylinderGeometry(0.042, 0.046, height, 12), MARBLE, {
      bone: root,
      at: [px, py + 0.065 + height / 2, pz],
      group: "pillarShaft",
    });

    if (!broken) {
      // Golden astragal ring and capital
      b.part(new THREE.CylinderGeometry(0.052, 0.044, 0.03, 12), GOLD, {
        bone: root,
        at: [px, py + 0.065 + height - 0.02, pz],
        group: "pillarNeck",
      });
      b.part(new THREE.BoxGeometry(0.13, 0.05, 0.13), MARBLE, {
        bone: root,
        at: [px, py + 0.065 + height + 0.025, pz],
        group: "pillarCapital",
      });
      b.part(new THREE.BoxGeometry(0.15, 0.025, 0.15), GOLD, {
        bone: root,
        at: [px, py + 0.065 + height + 0.055, pz],
        group: "pillarAbacus",
      });
    } else {
      // Broken sheared top
      b.part(new THREE.ConeGeometry(0.042, 0.06, 8), MARBLE, {
        bone: root,
        at: [px, py + 0.065 + height + 0.02, pz],
        dir: [0.2, 0.9, -0.1],
        group: "brokenStump",
      });

      // Levitating fractured capital
      b.part(new THREE.BoxGeometry(0.13, 0.05, 0.13), MARBLE, {
        bone: root,
        at: [px + 0.03, py + 0.065 + height + 0.18, pz - 0.02],
        dir: [0.25, 0.95, 0.1],
        group: "floatingCapital",
      });
      // Energy spark between fracture
      glow(
        b.part(new THREE.SphereGeometry(0.02, 6, 6), "#2ce2ca", {
          bone: root,
          at: [px + 0.015, py + 0.065 + height + 0.09, pz - 0.01],
          group: "fractureSpark",
        }),
        1.7,
      );
    }
  }

  // Pillar 1 & 2: Archway portico on the upper terrace
  buildPillar([-0.18, 1.45, -0.65], 0.76, false);
  buildPillar([-0.62, 1.45, -0.65], 0.76, false);

  // Architrave lintel spanning Pillar 1 and 2
  b.part(new THREE.BoxGeometry(0.66, 0.09, 0.15), MARBLE, {
    bone: root,
    at: [-0.4, 2.37, -0.65],
    group: "architrave",
  });
  // Gold frieze trim on the lintel
  b.part(new THREE.PlaneGeometry(0.64, 0.07), "#ffffff", {
    bone: root,
    at: [-0.4, 2.37, -0.573],
    dir: [0, 0, 1],
    axis: "z",
    texture: GOLD_TRIM,
    group: "friezeTrim",
  });

  // Triangular pediment fragment atop the lintel
  b.part(new THREE.ConeGeometry(0.24, 0.16, 4), MARBLE, {
    bone: root,
    at: [-0.4, 2.49, -0.65],
    rotation: [0, 45, 0],
    group: "pedimentGable",
  });
  glow(
    b.part(new THREE.SphereGeometry(0.032, 10, 8), "#22eed5", {
      bone: root,
      at: [-0.4, 2.47, -0.58],
      group: "pedimentGem",
    }),
    1.8,
  );

  // Pillar 3: Broken column beside the tree
  buildPillar([-0.78, 1.43, -0.2], 0.52, true);

  // Pillar 4: Shorter broken column near the steps
  buildPillar([0.06, 1.28, -0.38], 0.38, true);

  // Pillar 5: Solitary column near the cliff edge
  buildPillar([0.62, 1.28, -0.18], 0.65, false);

  // Fallen column segment half-buried in grass
  b.part(new THREE.CylinderGeometry(0.044, 0.044, 0.42, 10), MARBLE, {
    bone: root,
    at: [0.12, 1.29, -0.18],
    dir: [0.92, 0.1, -0.35],
    group: "fallenColumn",
  });

  // Ancient ruin steps linking lower terrace to upper shrine dais
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.BoxGeometry(0.48 - i * 0.04, 0.045, 0.18), MARBLE, {
      bone: root,
      at: [-0.15 - i * 0.06, 1.29 + i * 0.04, 0.02 - i * 0.08],
      dir: [0.2, 0, 0.98],
      group: "ruinSteps",
    });
  }

  // Curved cliff balustrade railing segments
  const balustradeCenters: [number, number, number, number][] = [
    [-0.15, 1.28, 0.62, 15],
    [0.15, 1.28, 0.68, -10],
    [-0.72, 1.28, 0.28, 65],
  ];

  for (let i = 0; i < balustradeCenters.length; i++) {
    const [bx, by, bz, ry] = balustradeCenters[i];
    // Base rail
    b.part(new THREE.BoxGeometry(0.32, 0.03, 0.06), MARBLE, {
      bone: root,
      at: [bx, by + 0.015, bz],
      rotation: [0, ry, 0],
      group: "balBase",
    });
    // Top handrail
    b.part(new THREE.BoxGeometry(0.34, 0.035, 0.08), GOLD, {
      bone: root,
      at: [bx, by + 0.16, bz],
      rotation: [0, ry, 0],
      group: "balTop",
    });
    // Baluster posts
    for (const off of [-0.11, 0.0, 0.11]) {
      const postRot = new THREE.Euler(0, ry * DEG, 0);
      const postOffset = new THREE.Vector3(off, 0.085, 0).applyEuler(postRot);
      b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.12, 8), MARBLE, {
        bone: root,
        at: [bx + postOffset.x, by + postOffset.y, bz + postOffset.z],
        group: "balPost",
      });
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // 7. Hero Anemo Tree (Windrise-inspired Great Tree)

  // Gnarled trunk
  const trunkPath = catmull([
    [-0.52, 1.43, -0.22],
    [-0.56, 1.64, -0.2],
    [-0.5, 1.84, -0.16],
    [-0.46, 2.02, -0.14],
  ]);

  b.sweep(trunkPath, [0.085, 0.055], {
    color: WOOD_PAINT,
    bone: treeJoint,
    group: "treeTrunk",
  });

  // Exposed roots gripping the stones
  const rootClaws: [number, number, number, number, number, number][] = [
    [-0.52, 1.43, -0.22, -0.38, 1.39, -0.12],
    [-0.52, 1.43, -0.22, -0.66, 1.41, -0.15],
    [-0.52, 1.43, -0.22, -0.56, 1.42, -0.36],
  ];

  for (let i = 0; i < rootClaws.length; i++) {
    const [rx1, ry1, rz1, rx2, ry2, rz2] = rootClaws[i];
    b.sweep(
      catmull([
        [rx1, ry1, rz1],
        [(rx1 + rx2) / 2, (ry1 + ry2) / 2 + 0.03, (rz1 + rz2) / 2],
        [rx2, ry2, rz2],
      ]),
      [0.045, 0.018],
      {
        color: WOOD_PAINT,
        bone: treeJoint,
        group: "treeRoots",
      },
    );
  }

  // Main Boughs
  const bough1 = catmull([
    [-0.46, 2.02, -0.14],
    [-0.32, 2.16, -0.04],
    [-0.14, 2.25, 0.06],
  ]);
  const bough2 = catmull([
    [-0.46, 2.02, -0.14],
    [-0.62, 2.18, -0.24],
    [-0.78, 2.3, -0.3],
  ]);
  const bough3 = catmull([
    [-0.46, 2.02, -0.14],
    [-0.42, 2.22, -0.32],
    [-0.36, 2.38, -0.42],
  ]);

  b.sweep(bough1, [0.05, 0.026], { color: WOOD_PAINT, bone: treeJoint, group: "bough1" });
  b.sweep(bough2, [0.048, 0.024], { color: WOOD_PAINT, bone: treeJoint, group: "bough2" });
  b.sweep(bough3, [0.046, 0.022], { color: WOOD_PAINT, bone: treeJoint, group: "bough3" });

  // Puffy Cel-Shaded Foliage Clumps
  const foliageClumps: [number, number, number, number, boolean][] = [
    // [x, y, z, radius, mint?]
    [-0.35, 2.42, -0.18, 0.28, false], // central hero crown
    [-0.12, 2.28, 0.08, 0.24, true], // forward bough
    [0.02, 2.16, 0.18, 0.19, false], // drooping lower forward
    [-0.78, 2.34, -0.28, 0.25, true], // left bough
    [-0.42, 2.48, -0.44, 0.22, false], // back bough
    [-0.44, 2.65, -0.2, 0.21, true], // high peak crown
    [-0.52, 2.08, -0.12, 0.18, false], // lower collar
    [-0.22, 2.45, -0.32, 0.2, false],
  ];

  for (let i = 0; i < foliageClumps.length; i++) {
    const [fx, fy, fz, fr, isMint] = foliageClumps[i];
    b.part(new THREE.DodecahedronGeometry(fr, 1), isMint ? FOLIAGE_MINT : FOLIAGE_TEAL, {
      bone: treeJoint,
      at: [fx, fy, fz],
      scale: [1.15, 0.9, 1.1],
      group: "treeFoliage",
    });
  }

  // Leaf tuft cards scattered around the tree canopy perimeter
  const leafCardPositions: [number, number, number, number, number, number][] = [
    [-0.32, 2.48, 0.02, 0, 0.8, 0.6],
    [-0.08, 2.36, 0.18, 0.5, 0.7, 0.5],
    [-0.85, 2.4, -0.22, -0.7, 0.7, 0.2],
    [-0.45, 2.74, -0.18, 0, 1, 0],
    [-0.55, 2.52, -0.48, -0.3, 0.8, -0.5],
    [-0.2, 2.25, -0.05, 0.2, 0.5, 0.8],
    [0.08, 2.22, 0.24, 0.8, 0.4, 0.4],
    [-0.92, 2.28, -0.34, -0.8, 0.5, -0.3],
    [-0.35, 2.68, -0.35, -0.2, 0.9, -0.3],
    [-0.15, 2.45, 0.15, 0.4, 0.8, 0.4],
  ];

  const leafFrames = leafCardPositions.map(([lx, ly, lz, dx, dy, dz]) =>
    frame([lx, ly, lz], [dx, dy, dz], [0, 1, 0]),
  );

  b.cards(leafFrames, LEAF_TUFT, {
    size: [0.12, 0.16],
    lean: 25,
    bend: 20,
    bone: treeJoint,
    group: "leafCards",
  });

  // Hanging wind prayer ribbons (omamori) suspended from the boughs
  const ribbonSpots: [number, number, number][] = [
    [-0.22, 2.18, 0.02],
    [-0.68, 2.22, -0.26],
    [-0.38, 2.3, -0.36],
  ];

  for (let i = 0; i < ribbonSpots.length; i++) {
    const [rx, ry, rz] = ribbonSpots[i];
    // Hanging cord
    b.rod([rx, ry, rz], [rx, ry - 0.12, rz], 0.004, GOLD, {
      bone: treeJoint,
      group: "prayerCord",
    });
    // Red prayer cloth tag
    b.part(new THREE.BoxGeometry(0.035, 0.09, 0.005), "#d83828", {
      bone: treeJoint,
      at: [rx, ry - 0.17, rz],
      dir: [0.1, -1, 0.05],
      group: "prayerTag",
    });
    // Golden bell/charm
    glow(
      b.part(new THREE.SphereGeometry(0.015, 8, 6), "#fcd34d", {
        bone: treeJoint,
        at: [rx, ry - 0.22, rz],
        group: "prayerBell",
      }),
      1.5,
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // 8. Secondary Golden Autumn Shrub (Warm complementary accent near waterfall)

  const shrubRoot: [number, number, number] = [0.72, 1.28, 0.08];
  // Twisted trunk
  b.sweep(
    catmull([
      [shrubRoot[0], shrubRoot[1], shrubRoot[2]],
      [shrubRoot[0] + 0.04, shrubRoot[1] + 0.14, shrubRoot[2] - 0.02],
      [shrubRoot[0] + 0.08, shrubRoot[1] + 0.25, shrubRoot[2] + 0.02],
    ]),
    [0.035, 0.018],
    {
      color: WOOD_PAINT,
      bone: root,
      group: "shrubTrunk",
    },
  );

  // Autumn foliage clumps
  const autumnPuffs: [number, number, number, number, string][] = [
    [0.78, 1.54, 0.08, 0.16, "#f59e2e"],
    [0.86, 1.48, -0.02, 0.13, "#fbbf24"],
    [0.72, 1.46, 0.16, 0.12, "#e65100"],
    [0.82, 1.62, 0.06, 0.11, "#ffd043"],
  ];

  for (let i = 0; i < autumnPuffs.length; i++) {
    const [ax, ay, az, ar, ac] = autumnPuffs[i];
    b.part(new THREE.DodecahedronGeometry(ar, 1), cel(ac, FOLIAGE_AMBER), {
      bone: root,
      at: [ax, ay, az],
      group: "autumnShrub",
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // 9. Interactive Hero Highlights (Anemo Oculus, Seelie, Chest, Monoliths)

  // A. THE ANEMO OCULUS (Floating above the plaza)
  const oculusPos: [number, number, number] = [-0.35, 2.22, 0.08];

  // Glowing turquoise core sphere
  glow(
    b.part(new THREE.SphereGeometry(0.046, 16, 12), "#1ee0c8", {
      bone: oculusJoint,
      at: oculusPos,
      group: "oculusCore",
    }),
    2.4,
  );
  // Inner super-bright white-hot nucleus
  glow(
    b.part(new THREE.SphereGeometry(0.024, 10, 8), "#ffffff", {
      bone: oculusJoint,
      at: oculusPos,
      group: "oculusNucleus",
    }),
    3.0,
  );

  // 4 Celestial Golden Wings framing the Oculus
  const wingDirs: [number, number, number, number][] = [
    [0, 1, 0, 0], // Top
    [0, -1, 0, 180], // Bottom
    [1, 0, 0, 90], // Left
    [-1, 0, 0, -90], // Right
  ];

  for (let i = 0; i < wingDirs.length; i++) {
    const [wx, wy, wz, rotZ] = wingDirs[i];
    const wingFrame = frame(
      [oculusPos[0] + wx * 0.065, oculusPos[1] + wy * 0.065, oculusPos[2] + wz * 0.065],
      [wx, wy, wz],
      [0, 0, 1],
    );
    b.spike(wingFrame.at, [wx, wy, wz], 0.075, 0.018, {
      color: GOLD,
      bone: oculusJoint,
      group: `oculusWing${i}`,
    });
  }

  // Dual spinning thin gold orbit rings around the Oculus
  b.part(new THREE.TorusGeometry(0.082, 0.004, 8, 24), GOLD, {
    bone: oculusJoint,
    at: oculusPos,
    rotation: [35, 20, 0],
    group: "oculusRing1",
  });
  b.part(new THREE.TorusGeometry(0.074, 0.0035, 8, 24), GOLD, {
    bone: oculusJoint,
    at: oculusPos,
    rotation: [-45, 60, 0],
    group: "oculusRing2",
  });

  // B. FRIENDLY ANEMO SEELIE & SEELIE COURT
  // Stone birdbath-like Seelie Court on a rocky ledge
  const courtPos: [number, number, number] = [0.36, 1.28, -0.26];
  b.part(new THREE.CylinderGeometry(0.045, 0.06, 0.14, 8), MARBLE, {
    bone: root,
    at: [courtPos[0], courtPos[1] + 0.07, courtPos[2]],
    group: "courtBase",
  });
  b.part(new THREE.CylinderGeometry(0.08, 0.03, 0.04, 10), MARBLE, {
    bone: root,
    at: [courtPos[0], courtPos[1] + 0.15, courtPos[2]],
    group: "courtBowl",
  });

  // The Seelie Spirit hovering cheerfully nearby
  const seeliePos: [number, number, number] = [0.38, 1.52, -0.24];
  // Wispy glowing body
  glow(
    b.part(new THREE.SphereGeometry(0.042, 14, 10), "#28f5da", {
      bone: seelieJoint,
      at: seeliePos,
      scale: [0.95, 1.25, 0.95],
      group: "seelieBody",
    }),
    2.2,
  );
  // Seelie cute face decal
  b.part(new THREE.PlaneGeometry(0.06, 0.06), "#ffffff", {
    bone: seelieJoint,
    at: [seeliePos[0], seeliePos[1], seeliePos[2] + 0.042],
    dir: [0, 0, 1],
    axis: "z",
    texture: SEELIE_TEX,
    group: "seelieFace",
  });
  // Seelie swirl tail
  glow(
    b.sweep(
      catmull([
        [seeliePos[0], seeliePos[1] - 0.04, seeliePos[2]],
        [seeliePos[0] + 0.02, seeliePos[1] - 0.08, seeliePos[2] - 0.02],
        [seeliePos[0] - 0.02, seeliePos[1] - 0.13, seeliePos[2] - 0.04],
      ]),
      [0.018, 0.004],
      {
        color: "#28f5da",
        bone: seelieJoint,
        group: "seelieTail",
      },
    ),
    2.0,
  );

  // C. SATELLITE ISLET 1 WITH PRECIOUS TREASURE CHEST
  const islet1Pos: [number, number, number] = [1.12, 1.05, -0.35];
  // Inverted rock hull
  b.spike([islet1Pos[0], islet1Pos[1] + 0.08, islet1Pos[2]], [0, -1, 0], 0.28, 0.22, {
    color: CLIFF_ROCK,
    bone: satellite1,
    group: "islet1Rock",
  });
  // Grass top
  b.part(new THREE.CylinderGeometry(0.22, 0.24, 0.05, 10), GRASS_PAINT, {
    bone: satellite1,
    at: [islet1Pos[0], islet1Pos[1] + 0.09, islet1Pos[2]],
    group: "islet1Grass",
  });

  // Precious Chest
  const chestPos: [number, number, number] = [islet1Pos[0], islet1Pos[1] + 0.18, islet1Pos[2]];
  // Chest body (rich wood)
  b.part(new THREE.BoxGeometry(0.18, 0.12, 0.14), WOOD_PAINT, {
    bone: satellite1,
    at: chestPos,
    group: "chestBody",
  });
  // Arched lid
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.18, 10, 1, false, 0, Math.PI), WOOD_PAINT, {
    bone: satellite1,
    at: [chestPos[0], chestPos[1] + 0.06, chestPos[2]],
    dir: [1, 0, 0],
    group: "chestLid",
  });
  // Golden straps & reinforcement trim
  b.part(new THREE.BoxGeometry(0.184, 0.02, 0.144), GOLD, {
    bone: satellite1,
    at: [chestPos[0], chestPos[1] + 0.05, chestPos[2]],
    group: "chestRimGold",
  });
  // Golden escutcheon plate with jewel
  b.part(new THREE.PlaneGeometry(0.065, 0.065), "#ffffff", {
    bone: satellite1,
    at: [chestPos[0], chestPos[1] + 0.01, chestPos[2] + 0.072],
    dir: [0, 0, 1],
    axis: "z",
    texture: CHEST_FRONT,
    group: "chestEscutcheon",
  });

  // D. SATELLITE ISLET 2 WITH CECILIAS & DANDELION
  const islet2Pos: [number, number, number] = [-1.08, 0.88, 0.42];
  b.spike([islet2Pos[0], islet2Pos[1] + 0.06, islet2Pos[2]], [0, -1, 0], 0.24, 0.18, {
    color: CLIFF_ROCK,
    bone: satellite2,
    group: "islet2Rock",
  });
  b.part(new THREE.CylinderGeometry(0.18, 0.2, 0.04, 10), GRASS_PAINT, {
    bone: satellite2,
    at: [islet2Pos[0], islet2Pos[1] + 0.07, islet2Pos[2]],
    group: "islet2Grass",
  });

  // Fluffy dandelion seed puff
  b.rod([islet2Pos[0], islet2Pos[1] + 0.08, islet2Pos[2]], [islet2Pos[0], islet2Pos[1] + 0.26, islet2Pos[2]], 0.005, "#6ea33e", {
    bone: satellite2,
    group: "dandelionStem",
  });
  b.part(new THREE.SphereGeometry(0.045, 10, 8), "#f5fbff", {
    bone: satellite2,
    at: [islet2Pos[0], islet2Pos[1] + 0.28, islet2Pos[2]],
    group: "dandelionPuff",
  });

  // E. FLOATING CELESTIA MONOLITHS (Inverted triangular ruin obelisks)
  const mono1Pos: [number, number, number] = [-0.95, 1.82, 0.18];
  b.spike([mono1Pos[0], mono1Pos[1] + 0.18, mono1Pos[2]], [0, -1, 0], 0.36, 0.085, {
    color: MARBLE,
    bone: monolith1,
    group: "monolith1",
  });
  // Glowing runic strip on monolith 1
  b.part(new THREE.PlaneGeometry(0.06, 0.22), "#ffffff", {
    bone: monolith1,
    at: [mono1Pos[0], mono1Pos[1] - 0.02, mono1Pos[2] + 0.045],
    dir: [0, 0, 1],
    axis: "z",
    texture: ANEMO_RUNE,
    group: "monolith1Rune",
  });

  const mono2Pos: [number, number, number] = [0.65, 1.78, -0.48];
  b.spike([mono2Pos[0], mono2Pos[1] + 0.16, mono2Pos[2]], [0, -1, 0], 0.32, 0.075, {
    color: MARBLE,
    bone: monolith2,
    group: "monolith2",
  });

  // Levitating ruin cube fragment
  b.part(new THREE.BoxGeometry(0.09, 0.09, 0.09), MARBLE, {
    bone: root,
    at: [0.24, 1.72, 0.58],
    rotation: [25, 40, 15],
    group: "levitatingCube",
  });

  // -------------------------------------------------------------------------------------------------------------
  // 10. Flower Clusters & Wild Meadow Plants

  // Cecilia Flowers (Sacred Mondstadt flower, white with cyan core)
  const ceciliaSpots: [number, number, number][] = [
    [-0.24, 1.3, 0.18],
    [-0.28, 1.3, 0.22],
    [-0.18, 1.29, 0.26],
    [-0.32, 1.43, -0.04],
    [-0.28, 1.43, 0.02],
    [islet2Pos[0] + 0.06, islet2Pos[1] + 0.1, islet2Pos[2] - 0.04],
    [islet2Pos[0] - 0.05, islet2Pos[1] + 0.1, islet2Pos[2] + 0.05],
  ];

  const ceciliaFrames = ceciliaSpots.map(([cx, cy, cz]) =>
    frame([cx, cy, cz], [0, 1, 0], [0, 0, 1]),
  );

  b.cards(ceciliaFrames, CECILIA_FLOWER, {
    size: [0.075, 0.075],
    lean: 90,
    mirror: true,
    bone: root,
    group: "ceciliaFlowers",
  });

  // Windwheel Asters (Red/orange windmill flower near the tree base)
  const asterSpots: [number, number, number][] = [
    [-0.42, 1.43, -0.1],
    [-0.64, 1.43, -0.32],
    [-0.68, 1.43, -0.1],
    [-0.36, 1.43, -0.2],
  ];

  const asterFrames = asterSpots.map(([ax, ay, az]) =>
    frame([ax, ay, az], [0, 1, 0], [0, 0, 1]),
  );

  b.cards(asterFrames, WINDWHEEL_ASTER, {
    size: [0.08, 0.08],
    lean: 90,
    mirror: true,
    bone: root,
    group: "windwheelAsters",
  });

  // Stylized wild sweet mushrooms beside the tree roots
  for (const [mx, my, mz] of [
    [-0.46, 1.43, -0.36],
    [-0.49, 1.43, -0.39],
  ] as [number, number, number][]) {
    b.rod([mx, my, mz], [mx, my + 0.04, mz], 0.008, "#f2eedf", { bone: root, group: "mushroomStem" });
    b.part(new THREE.ConeGeometry(0.022, 0.025, 8), "#d44522", {
      bone: root,
      at: [mx, my + 0.05, mz],
      group: "mushroomCap",
    });
  }

  return b.root;
}
