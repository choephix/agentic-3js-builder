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
  name: "genshin_sky_island_diorama",
  description:
    "Genshin Impact floating sky island diorama: Celestia temple colonnade, Windrise great tree, cascading two-tier sacred waterfall, glowing Anemo Oculus, Seelie spirit, Anemo crystalflies, and a precious treasure chest amidst a sea of clouds.",
};

// ---------------------------------------------------------------------------------------------------------------
// Stylized SVG Textures

const ANEMO_CREST = svg(
  `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <circle cx="128" cy="128" r="122" fill="#113338" stroke="#f2c842" stroke-width="4.5"/>
    <circle cx="128" cy="128" r="111" fill="none" stroke="#22e5c8" stroke-width="2.5" stroke-dasharray="6,4"/>
    <circle cx="128" cy="128" r="90" fill="#0d282c" stroke="#f2c842" stroke-width="3"/>
    <!-- 8-pointed Celestia Star -->
    <path d="M128 32 L138 106 L212 116 L148 138 L170 212 L128 152 L86 212 L108 138 L44 116 L118 106 Z" fill="#f2c842" opacity="0.95"/>
    <path d="M128 50 L135 112 L194 120 L142 134 L158 194 L128 146 L98 194 L114 134 L62 120 L121 112 Z" fill="#2fe9cf"/>
    <!-- Center Anemo Triquetra knot -->
    <circle cx="128" cy="128" r="32" fill="#113338" stroke="#f2c842" stroke-width="3.2"/>
    <circle cx="128" cy="128" r="21" fill="#2fe9cf"/>
    <circle cx="128" cy="128" r="9" fill="#ffffff"/>
  </svg>`,
  { size: 256 },
);

const WATER_CAUSTIC = svg(
  `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <rect width="256" height="256" fill="#14a3ba"/>
    <path d="M20 40 Q70 10 120 45 T220 30 Q250 80 220 130 T130 150 Q50 170 30 110 Z" fill="none" stroke="#92f8ff" stroke-width="7" opacity="0.8"/>
    <path d="M60 80 Q110 60 160 90 T240 100 Q230 170 180 200 T70 210 Q20 180 40 130 Z" fill="none" stroke="#ffffff" stroke-width="5" opacity="0.85"/>
    <path d="M90 30 Q150 20 190 60 T180 140 Q130 180 90 140 T50 70 Z" fill="none" stroke="#bbf9ff" stroke-width="6" opacity="0.7"/>
    <circle cx="70" cy="80" r="14" fill="#ffffff" opacity="0.75"/>
    <circle cx="170" cy="130" r="16" fill="#ffffff" opacity="0.75"/>
    <circle cx="120" cy="190" r="12" fill="#ffffff" opacity="0.75"/>
  </svg>`,
  { size: 256 },
);

const WATERFALL_VEIL = svg(
  `<svg viewBox="0 0 128 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="wv" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
        <stop offset="25%" stop-color="#4be3f7" stop-opacity="0.8"/>
        <stop offset="70%" stop-color="#1eb5d4" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.95"/>
      </linearGradient>
    </defs>
    <rect width="128" height="512" fill="url(#wv)"/>
    <path d="M18 0 L22 512 M46 0 L42 512 M78 0 L82 512 M110 0 L106 512" stroke="#ffffff" stroke-width="5.5" opacity="0.85"/>
    <path d="M30 20 Q35 140 28 260 T35 500 M94 30 Q90 160 96 300 T90 512" stroke="#ffffff" stroke-width="6.5" opacity="0.9"/>
    <!-- Crest & bottom scalloped foam -->
    <path d="M0 0 Q32 28 64 0 Q96 28 128 0 L128 22 Q96 48 64 22 Q32 48 0 22 Z" fill="#ffffff"/>
    <path d="M0 488 Q32 512 64 488 Q96 512 128 488 L128 512 L0 512 Z" fill="#ffffff"/>
  </svg>`,
  { size: 256 },
);

const GOLD_FRIEZE = svg(
  `<svg viewBox="0 0 256 64" xmlns="http://www.w3.org/2000/svg">
    <rect width="256" height="64" fill="#201a14"/>
    <rect x="0" y="4" width="256" height="56" fill="#f0c242" stroke="#fff4a0" stroke-width="2"/>
    <path d="M0 32 L16 12 L32 32 L48 12 L64 32 L80 12 L96 32 L112 12 L128 32 L144 12 L160 32 L176 12 L192 32 L208 12 L224 32 L240 12 L256 32 L240 52 L224 32 L208 52 L192 32 L176 52 L160 32 L144 52 L128 32 L112 52 L96 32 L80 52 L64 32 L48 52 L32 32 L16 52 Z" fill="#7a5310"/>
    <circle cx="32" cy="32" r="6" fill="#28ebcf"/>
    <circle cx="96" cy="32" r="6" fill="#28ebcf"/>
    <circle cx="160" cy="32" r="6" fill="#28ebcf"/>
    <circle cx="224" cy="32" r="6" fill="#28ebcf"/>
  </svg>`,
  { size: 256 },
);

const ANEMO_RUNE = svg(
  `<svg viewBox="0 0 128 256" xmlns="http://www.w3.org/2000/svg">
    <path d="M64 22 L86 52 L64 82 L42 52 Z" fill="#28ebcf" stroke="#ffffff" stroke-width="3"/>
    <circle cx="64" cy="52" r="6" fill="#ffffff"/>
    <path d="M34 112 Q64 92 94 112 T34 154" fill="none" stroke="#28ebcf" stroke-width="6.5" stroke-linecap="round"/>
    <path d="M64 168 L82 192 L64 216 L46 192 Z" fill="none" stroke="#28ebcf" stroke-width="4.5"/>
    <circle cx="64" cy="192" r="5" fill="#ffffff"/>
    <path d="M42 238 L86 238" stroke="#28ebcf" stroke-width="5.5" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const CECILIA_FLOWER = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <path d="M64 64 C40 38 40 8 64 6 C88 8 88 38 64 64 Z" fill="#ffffff" stroke="#a6ece3" stroke-width="2.5"/>
    <path d="M64 64 C40 90 40 120 64 122 C88 120 88 90 64 64 Z" fill="#ffffff" stroke="#a6ece3" stroke-width="2.5"/>
    <path d="M64 64 C38 40 8 40 6 64 C8 88 38 88 64 64 Z" fill="#ffffff" stroke="#a6ece3" stroke-width="2.5"/>
    <path d="M64 64 C90 40 120 40 122 64 C120 88 90 88 64 64 Z" fill="#ffffff" stroke="#a6ece3" stroke-width="2.5"/>
    <circle cx="64" cy="64" r="16" fill="#2ce2ca"/>
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
      <circle cx="0" cy="0" r="12" fill="#ffd438" stroke="#8a1c12" stroke-width="2.2"/>
    </g>
  </svg>`,
  { size: 128 },
);

const CRYSTALFLY_WING = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 64 C20 18 80 8 116 22 C124 50 82 72 50 68 C80 80 110 108 92 122 C60 128 26 98 12 64 Z" fill="#38f0d8" fill-opacity="0.82" stroke="#ffffff" stroke-width="3"/>
    <path d="M30 64 C48 38 82 32 102 38" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.9"/>
    <path d="M34 68 C52 82 78 98 84 110" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.9"/>
  </svg>`,
  { size: 128 },
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
    <ellipse cx="49" cy="50" rx="4.5" ry="7.5" fill="#063e36"/>
    <ellipse cx="79" cy="50" rx="4.5" ry="7.5" fill="#063e36"/>
    <circle cx="50" cy="48" r="2.2" fill="#ffffff"/>
    <circle cx="80" cy="48" r="2.2" fill="#ffffff"/>
    <path d="M20 54 Q8 38 18 28 Q28 38 24 54 Z" fill="#6dfce7"/>
    <path d="M108 54 Q120 38 110 28 Q100 38 104 54 Z" fill="#6dfce7"/>
  </svg>`,
  { size: 128 },
);

const CHEST_FRONT = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <rect x="18" y="18" width="92" height="92" rx="14" fill="#e5b842" stroke="#fff4a2" stroke-width="3.5"/>
    <circle cx="64" cy="64" r="28" fill="#7a4f12" stroke="#e5b842" stroke-width="3.5"/>
    <path d="M64 42 L80 64 L64 86 L48 64 Z" fill="#28e5cb" stroke="#ffffff" stroke-width="2.5"/>
    <circle cx="64" cy="64" r="6" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

const LEAF_TUFT = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <path d="M64 116 C40 80 16 60 20 34 C24 12 50 16 64 38 C78 16 104 12 108 34 C112 60 88 80 64 116 Z" fill="#28d8b4" stroke="#10866f" stroke-width="3"/>
    <path d="M64 100 C50 72 36 56 40 38 C43 24 58 26 64 45 C70 26 85 24 88 38 C92 56 78 72 64 100 Z" fill="#76fae0"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
// Cel Paints & Color Palettes

const MARBLE = cel("#f2eee6", "#9a9386");
const GOLD = cel("#f2c444", "#996b14");
const WOOD_PAINT = cel("#725f50", "#40342a");
const FOLIAGE_TEAL = cel("#22cfac", "#0e7661");
const FOLIAGE_MINT = cel("#5ef0d2", "#189a81");
const FOLIAGE_CYAN = cel("#26e2db", "#11827d");
const FOLIAGE_AMBER = cel("#f59e2e", "#a84e0c");
const CLOUD_PAINT = cel("#f8faff", "#c6d3eb", { light: [0.35, 0.9, 0.4], threshold: -0.15 });
const WATER_PAINT = cel("#32daef", "#128ea6");

const CLIFF_ROCK = paint((p, n) => {
  const band = smoothstep(0.2, 1.2, p.y);
  const nse = noise(p, 0.22, 42);
  const base = mix("#382b22", "#6e5d4e", band * 0.7 + nse * 0.3);
  const moss = smoothstep(0.35, 0.75, n.y) * smoothstep(0.7, 1.3, p.y);
  return mix(base, "#4c6e2b", moss * 0.65);
});

const GRASS_PAINT = paint((p, n) => {
  const nse = noise(p, 0.22, 11);
  const lit = mix("#76c335", "#a4e644", nse);
  const shd = mix("#367218", "#519224", nse);
  return n.y > 0.2 ? lit : shd;
});

// ---------------------------------------------------------------------------------------------------------------
// Main Builder

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "genshin_sky_island", detail: 1.0 });

  // 1. Rig Skeleton
  const root = b.joint("islandRoot", { at: [0, 1.2, 0] });
  const oculusJoint = b.joint("anemoOculus", { parent: root, at: [0.08, 2.12, 0.05] });
  const seelieJoint = b.joint("seelie", { parent: root, at: [0.36, 1.48, -0.22] });
  const treeJoint = b.joint("windriseTree", { parent: root, at: [-0.62, 1.45, -0.32] });
  const satellite1 = b.joint("isletChest", { parent: root, at: [1.14, 1.02, -0.32] });
  const satellite2 = b.joint("isletDandelion", { parent: root, at: [-1.08, 0.88, 0.42] });
  const monolith1 = b.joint("floatingMonolith1", { parent: root, at: [-0.98, 1.84, 0.16] });
  const monolith2 = b.joint("floatingMonolith2", { parent: root, at: [0.68, 1.76, -0.45] });

  // -------------------------------------------------------------------------------------------------------------
  // 2. Base Clouds & Mist Sea (Grounds the diorama at y = 0.0)

  // Every puff's position (x, y=r, z) guarantees its lowest point y - r = 0.00!
  const cloudPuffs: [number, number, number, number, number][] = [
    // [x, z, radius, scaleX, scaleZ]
    [0.0, 0.0, 0.25, 1.25, 1.2],
    [0.55, 0.22, 0.24, 1.2, 1.15],
    [-0.52, 0.28, 0.24, 1.22, 1.18],
    [0.28, -0.58, 0.23, 1.15, 1.2],
    [-0.42, -0.52, 0.23, 1.2, 1.15],
    [0.82, -0.18, 0.25, 1.25, 1.2],
    [-0.82, -0.12, 0.24, 1.2, 1.18],
    [0.12, 0.72, 0.26, 1.3, 1.25],
    [-0.22, -0.78, 0.25, 1.22, 1.22],
    [0.68, 0.68, 0.27, 1.3, 1.3], // Underneath waterfall plunge splash
    [-0.68, 0.52, 0.23, 1.2, 1.15],
    [0.94, 0.35, 0.23, 1.18, 1.18],
    [-0.95, 0.25, 0.22, 1.15, 1.15],
    [0.36, 0.45, 0.26, 1.25, 1.2],
    [-0.32, 0.62, 0.24, 1.2, 1.18],
    [0.0, -0.45, 0.26, 1.25, 1.2],
  ];

  for (let i = 0; i < cloudPuffs.length; i++) {
    const [cx, cz, cr, sx, sz] = cloudPuffs[i];
    b.part(new THREE.SphereGeometry(cr, 12, 8), CLOUD_PAINT, {
      bone: root,
      at: [cx, cr, cz],
      scale: [sx, 0.85, sz],
      group: "baseClouds",
    });
  }

  // Upper secondary tier cloud wisps for depth
  const upperPuffs: [number, number, number, number][] = [
    [0.45, 0.34, -0.32, 0.16],
    [-0.48, 0.36, 0.35, 0.17],
    [0.62, 0.38, 0.42, 0.18],
    [-0.25, 0.35, -0.55, 0.16],
  ];

  for (let i = 0; i < upperPuffs.length; i++) {
    const [ux, uy, uz, ur] = upperPuffs[i];
    b.part(new THREE.SphereGeometry(ur, 10, 8), CLOUD_PAINT, {
      bone: root,
      at: [ux, uy, uz],
      scale: [1.2, 0.75, 1.15],
      group: "upperCloudWisps",
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
  // 3. Natural Floating Island Rock Hull & Underside Spikes

  const hullStations = [
    { at: [0.0, 0.24, 0.0], w: 0.18, h: 0.18 },
    { at: [0.02, 0.44, 0.01], w: 0.54, h: 0.48 },
    { at: [-0.03, 0.68, -0.02], w: 0.98, h: 0.88 },
    { at: [0.01, 0.92, 0.02], w: 1.52, h: 1.32 },
    { at: [0.0, 1.12, -0.01], w: 1.96, h: 1.68 },
    { at: [0.0, 1.24, 0.0], w: 2.18, h: 1.86 },
  ];

  b.loft(hullStations, {
    color: CLIFF_ROCK,
    bone: root,
    caps: "flat",
    group: "islandHull",
  });

  // Hanging craggy rock stalactites
  const rockSpikes: [number, number, number, number, number, number][] = [
    [0.0, 0.24, 0.0, 0.0, -1, 0.0],
    [0.26, 0.58, 0.22, 0.15, -0.85, 0.1],
    [-0.3, 0.62, -0.18, -0.2, -0.8, -0.1],
    [0.48, 0.84, -0.26, 0.25, -0.75, -0.15],
    [-0.52, 0.88, 0.32, -0.3, -0.7, 0.2],
    [0.68, 1.08, 0.16, 0.35, -0.65, 0.1],
    [-0.7, 1.05, -0.32, -0.35, -0.65, -0.2],
    [0.16, 0.78, -0.46, 0.1, -0.8, -0.3],
    [-0.16, 0.74, 0.5, -0.1, -0.8, 0.3],
  ];

  for (let i = 0; i < rockSpikes.length; i++) {
    const [sx, sy, sz, dx, dy, dz] = rockSpikes[i];
    b.spike([sx, sy, sz], [dx, dy, dz], 0.26, 0.055, {
      color: CLIFF_ROCK,
      bone: root,
      group: "islandSpikes",
    });
  }

  // Glowing Anemo leyline crystals beneath the island
  const crystalSpikes: [number, number, number, number, number, number, number][] = [
    [0.02, 0.28, 0.01, 0.08, -0.95, 0.04, 0.22],
    [-0.06, 0.38, -0.04, -0.3, -0.88, -0.18, 0.17],
    [0.08, 0.4, 0.05, 0.35, -0.85, 0.2, 0.16],
    [-0.03, 0.46, 0.08, -0.15, -0.9, 0.35, 0.14],
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
  // 4. Terraced Grassy Plateau, Temple Dais & Riverbed

  // Main natural grassy plateau
  b.frustumBox([0, 1.23, 0], [0, 1.28, 0], [2.2, 1.88], [2.14, 1.82], {
    color: GRASS_PAINT,
    bone: root,
    group: "islandGrass",
  });

  // Sculpted rim cliffs and rock lips around the grass edge
  const rimStones: [number, number, number, number, number][] = [
    [-0.92, 1.28, -0.2, 0.18, 0.12],
    [-0.78, 1.28, 0.55, 0.22, 0.14],
    [-0.32, 1.28, 0.78, 0.24, 0.15],
    [0.25, 1.28, 0.82, 0.22, 0.14],
    [0.85, 1.28, -0.42, 0.25, 0.16],
    [0.55, 1.28, -0.75, 0.24, 0.15],
    [-0.35, 1.28, -0.78, 0.22, 0.14],
  ];

  for (let i = 0; i < rimStones.length; i++) {
    const [rx, ry, rz, rw, rd] = rimStones[i];
    b.part(new THREE.DodecahedronGeometry(0.12, 0), CLIFF_ROCK, {
      bone: root,
      at: [rx, ry, rz],
      scale: [rw / 0.12, 0.7, rd / 0.12],
      group: "rimStones",
    });
  }

  // Raised Temple Terrace at the back-left (y = 1.28 to 1.44)
  b.frustumBox([-0.48, 1.28, -0.36], [-0.48, 1.44, -0.36], [1.28, 1.08], [1.16, 0.96], {
    color: GRASS_PAINT,
    bone: root,
    group: "upperTerrace",
  });

  // Marble temple dais on the terrace
  b.frustumBox([-0.44, 1.44, -0.38], [-0.44, 1.48, -0.38], [0.92, 0.82], [0.88, 0.78], {
    color: MARBLE,
    bone: root,
    group: "shrineDais",
  });

  // Circular Anemo seal on the temple dais
  b.part(new THREE.PlaneGeometry(0.76, 0.76), "#ffffff", {
    bone: root,
    at: [-0.44, 1.483, -0.38],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    axis: "z",
    texture: ANEMO_CREST,
    group: "anemoSeal",
  });

  // Winding stone steps connecting upper terrace to lower plaza
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.BoxGeometry(0.46 - i * 0.04, 0.045, 0.18), MARBLE, {
      bone: root,
      at: [-0.14 - i * 0.06, 1.29 + i * 0.04, 0.02 - i * 0.08],
      dir: [0.2, 0, 0.98],
      group: "ruinSteps",
    });
  }

  // Natural Riverbed & Sacred Spring Basin
  const springBasin: [number, number, number] = [0.38, 1.34, -0.05];
  // Carved stone basin
  b.part(new THREE.CylinderGeometry(0.24, 0.18, 0.12, 12), MARBLE, {
    bone: root,
    at: [springBasin[0], springBasin[1] + 0.06, springBasin[2]],
    group: "springBasin",
  });
  // Water surface inside basin
  b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 16), "#ffffff", {
    bone: root,
    at: [springBasin[0], springBasin[1] + 0.11, springBasin[2]],
    texture: WATER_CAUSTIC,
    group: "basinWater",
  });

  // Ancient fountain column in basin center
  b.part(new THREE.CylinderGeometry(0.04, 0.05, 0.16, 8), MARBLE, {
    bone: root,
    at: [springBasin[0], springBasin[1] + 0.15, springBasin[2]],
    group: "fountainColumn",
  });
  glow(
    b.part(new THREE.SphereGeometry(0.038, 12, 8), "#22e8cf", {
      bone: root,
      at: [springBasin[0], springBasin[1] + 0.24, springBasin[2]],
      group: "fountainGem",
    }),
    1.8,
  );

  // Flowing riverbed curving from spring basin to cliff edge
  const riverPath = catmull([
    [0.38, 1.285, 0.08],
    [0.48, 1.28, 0.2],
    [0.64, 1.275, 0.32],
  ]);

  b.sweep(riverPath, [0.12, 0.15], {
    color: WATER_PAINT,
    bone: root,
    caps: "round",
    group: "riverStream",
  });

  // Riverbed cobblestone margins
  const riverStones: [number, number, number][] = [
    [0.3, 1.285, 0.12],
    [0.46, 1.285, 0.08],
    [0.42, 1.285, 0.26],
    [0.56, 1.285, 0.18],
    [0.58, 1.285, 0.38],
    [0.72, 1.285, 0.26],
  ];

  for (let i = 0; i < riverStones.length; i++) {
    b.part(new THREE.DodecahedronGeometry(0.038, 0), MARBLE, {
      bone: root,
      at: riverStones[i],
      scale: [1.2, 0.6, 1.0],
      group: "riverPebbles",
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // 5. Cascading Two-Tier Sacred Waterfall

  // Carved stone weir lip at cliff edge
  b.part(new THREE.BoxGeometry(0.24, 0.06, 0.16), MARBLE, {
    bone: root,
    at: [0.68, 1.265, 0.35],
    rotation: [0, -25, 0],
    group: "weirLip",
  });

  // Upper Waterfall Cascade (Cliff lip to floating splash shelf)
  const wfUpperCurve = catmull([
    [0.68, 1.26, 0.38],
    [0.76, 1.15, 0.48],
    [0.82, 0.94, 0.54],
  ]);

  b.sweep(wfUpperCurve, (t) => [0.14 * (1 - 0.15 * t), 0.024], {
    color: WATER_PAINT,
    bone: root,
    caps: "round",
    group: "wfUpperStream",
  });

  // Upper cascade foam overlay
  b.sweep(wfUpperCurve, (t) => [0.12 * (1 - 0.15 * t), 0.012], {
    color: "#ffffff",
    bone: root,
    caps: "round",
    group: "wfUpperFoam",
  });

  // Floating mid-air splash shelf crag
  b.part(new THREE.DodecahedronGeometry(0.11, 0), CLIFF_ROCK, {
    bone: root,
    at: [0.83, 0.92, 0.55],
    scale: [1.35, 0.75, 1.25],
    group: "splashCrag",
  });

  // Dynamic foaming splash crown on the shelf
  b.part(new THREE.RingGeometry(0.05, 0.15, 16), "#ffffff", {
    bone: root,
    at: [0.83, 0.97, 0.55],
    dir: [0, 1, 0],
    axis: "z",
    texture: WATER_CAUSTIC,
    group: "splashCrown",
  });

  // Lower Waterfall Plunge (from shelf down into the cloud sea)
  const wfLowerCurve = catmull([
    [0.83, 0.9, 0.56],
    [0.86, 0.65, 0.62],
    [0.88, 0.4, 0.66],
    [0.89, 0.16, 0.69],
  ]);

  b.sweep(wfLowerCurve, (t) => [0.18 * (1 - 0.2 * t), 0.028], {
    color: WATER_PAINT,
    bone: root,
    caps: "round",
    group: "wfLowerStream",
  });

  // Stylized vertical waterfall foam ribbon
  const foamRibbon = catmull([
    [0.83, 0.91, 0.57],
    [0.86, 0.65, 0.63],
    [0.88, 0.4, 0.67],
    [0.89, 0.17, 0.7],
  ]);

  b.sweep(foamRibbon, (t) => [0.15 * (1 - 0.2 * t), 0.014], {
    color: "#ffffff",
    bone: root,
    caps: "round",
    group: "wfLowerFoam",
  });

  // Dynamic water splash droplets
  const dropletCoords: [number, number, number][] = [
    [0.85, 0.99, 0.5],
    [0.78, 0.98, 0.58],
    [0.87, 0.97, 0.59],
    [0.84, 0.66, 0.65],
    [0.88, 0.64, 0.58],
    [0.91, 0.38, 0.71],
    [0.86, 0.4, 0.62],
  ];

  for (let i = 0; i < dropletCoords.length; i++) {
    b.part(new THREE.SphereGeometry(0.019, 6, 6), "#ffffff", {
      bone: root,
      at: dropletCoords[i],
      group: "waterDroplets",
    });
  }

  // Bottom splash mist puffs where waterfall plunges into cloud sea
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.085, 8, 6), CLOUD_PAINT, {
      bone: root,
      at: [0.89 + Math.cos(a) * 0.13, 0.17, 0.69 + Math.sin(a) * 0.13],
      scale: [1.2, 0.75, 1.2],
      group: "waterfallBottomMist",
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // 6. Ancient Celestia Ruins (Colonnade, Architrave & Floating Fragments)

  function buildPillar(
    at: [number, number, number],
    height: number,
    broken = false,
  ): void {
    const [px, py, pz] = at;
    // Stepped square plinth
    b.part(new THREE.BoxGeometry(0.15, 0.04, 0.15), MARBLE, {
      bone: root,
      at: [px, py + 0.02, pz],
      group: "pillarBase",
    });
    b.part(new THREE.BoxGeometry(0.13, 0.03, 0.13), GOLD, {
      bone: root,
      at: [px, py + 0.05, pz],
      group: "pillarBaseGold",
    });

    // Fluted shaft
    b.part(new THREE.CylinderGeometry(0.045, 0.05, height, 12), MARBLE, {
      bone: root,
      at: [px, py + 0.065 + height / 2, pz],
      group: "pillarShaft",
    });

    if (!broken) {
      // Golden astragal ring and capital
      b.part(new THREE.CylinderGeometry(0.056, 0.048, 0.03, 12), GOLD, {
        bone: root,
        at: [px, py + 0.065 + height - 0.02, pz],
        group: "pillarNeck",
      });
      b.part(new THREE.BoxGeometry(0.14, 0.05, 0.14), MARBLE, {
        bone: root,
        at: [px, py + 0.065 + height + 0.025, pz],
        group: "pillarCapital",
      });
      b.part(new THREE.BoxGeometry(0.16, 0.025, 0.16), GOLD, {
        bone: root,
        at: [px, py + 0.065 + height + 0.055, pz],
        group: "pillarAbacus",
      });
    } else {
      // Broken sheared top stump
      b.part(new THREE.ConeGeometry(0.046, 0.06, 8), MARBLE, {
        bone: root,
        at: [px, py + 0.065 + height + 0.02, pz],
        dir: [0.2, 0.9, -0.1],
        group: "brokenStump",
      });

      // Levitating fractured capital piece
      b.part(new THREE.BoxGeometry(0.14, 0.05, 0.14), MARBLE, {
        bone: root,
        at: [px + 0.03, py + 0.065 + height + 0.16, pz - 0.02],
        dir: [0.22, 0.96, 0.1],
        group: "floatingCapital",
      });
      // Leyline energy spark between the fracture
      glow(
        b.part(new THREE.SphereGeometry(0.022, 8, 6), "#2ce2ca", {
          bone: root,
          at: [px + 0.015, py + 0.065 + height + 0.08, pz - 0.01],
          group: "fractureSpark",
        }),
        1.8,
      );
    }
  }

  // Colonnade Pillars flanking the temple dais
  buildPillar([-0.22, 1.48, -0.72], 0.78, false); // Pillar 1 (Archway Right)
  buildPillar([-0.66, 1.48, -0.72], 0.78, false); // Pillar 2 (Archway Left)

  // Architrave lintel spanning Pillar 1 and 2
  b.part(new THREE.BoxGeometry(0.68, 0.09, 0.16), MARBLE, {
    bone: root,
    at: [-0.44, 2.42, -0.72],
    group: "architrave",
  });
  // Gold frieze trim on the lintel face
  b.part(new THREE.PlaneGeometry(0.66, 0.075), "#ffffff", {
    bone: root,
    at: [-0.44, 2.42, -0.638],
    dir: [0, 0, 1],
    axis: "z",
    texture: GOLD_FRIEZE,
    group: "friezeTrim",
  });

  // Celestia triangular pediment gable atop the lintel
  b.part(new THREE.ConeGeometry(0.26, 0.18, 4), MARBLE, {
    bone: root,
    at: [-0.44, 2.55, -0.72],
    rotation: [0, 45, 0],
    group: "pedimentGable",
  });
  glow(
    b.part(new THREE.SphereGeometry(0.034, 10, 8), "#22eed5", {
      bone: root,
      at: [-0.44, 2.53, -0.64],
      group: "pedimentGem",
    }),
    1.8,
  );

  // Pillar 3: Broken column beside the tree
  buildPillar([-0.84, 1.46, -0.22], 0.54, true);

  // Pillar 4: Shorter broken column near the ruin steps
  buildPillar([0.05, 1.28, -0.42], 0.42, true);

  // Pillar 5: Solitary standing column overlooking the plaza
  buildPillar([0.58, 1.28, -0.25], 0.68, false);

  // Fallen column segment half-sunk in the meadow grass
  b.part(new THREE.CylinderGeometry(0.046, 0.046, 0.44, 10), MARBLE, {
    bone: root,
    at: [0.12, 1.29, -0.2],
    dir: [0.92, 0.08, -0.36],
    group: "fallenColumn",
  });

  // Balustrade railings along cliff pathways
  const balustrades: [number, number, number, number][] = [
    [-0.15, 1.28, 0.65, 12],
    [0.18, 1.28, 0.72, -10],
    [-0.75, 1.28, 0.32, 65],
  ];

  for (let i = 0; i < balustrades.length; i++) {
    const [bx, by, bz, ry] = balustrades[i];
    // Base rail
    b.part(new THREE.BoxGeometry(0.34, 0.03, 0.06), MARBLE, {
      bone: root,
      at: [bx, by + 0.015, bz],
      rotation: [0, ry, 0],
      group: "balBase",
    });
    // Top handrail
    b.part(new THREE.BoxGeometry(0.36, 0.035, 0.08), GOLD, {
      bone: root,
      at: [bx, by + 0.17, bz],
      rotation: [0, ry, 0],
      group: "balTop",
    });
    // Baluster posts
    for (const off of [-0.12, 0.0, 0.12]) {
      const postRot = new THREE.Euler(0, ry * DEG, 0);
      const postOffset = new THREE.Vector3(off, 0.09, 0).applyEuler(postRot);
      b.part(new THREE.CylinderGeometry(0.019, 0.019, 0.13, 8), MARBLE, {
        bone: root,
        at: [bx + postOffset.x, by + postOffset.y, bz + postOffset.z],
        group: "balPost",
      });
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // 7. Hero Windrise Anemo Tree (Great Tree of Mondstadt)

  // Sculptural gnarled trunk sweeping outward
  const trunkPath = catmull([
    [-0.62, 1.45, -0.32],
    [-0.66, 1.68, -0.28],
    [-0.58, 1.94, -0.24],
    [-0.52, 2.18, -0.2],
  ]);

  b.sweep(trunkPath, [0.095, 0.062], {
    color: WOOD_PAINT,
    bone: treeJoint,
    group: "treeTrunk",
  });

  // Sculpted roots clutching the temple stone terrace
  const rootClaws: [number, number, number, number, number, number][] = [
    [-0.62, 1.45, -0.32, -0.46, 1.42, -0.18],
    [-0.62, 1.45, -0.32, -0.78, 1.43, -0.22],
    [-0.62, 1.45, -0.32, -0.66, 1.44, -0.48],
  ];

  for (let i = 0; i < rootClaws.length; i++) {
    const [rx1, ry1, rz1, rx2, ry2, rz2] = rootClaws[i];
    b.sweep(
      catmull([
        [rx1, ry1, rz1],
        [(rx1 + rx2) / 2, (ry1 + ry2) / 2 + 0.035, (rz1 + rz2) / 2],
        [rx2, ry2, rz2],
      ]),
      [0.05, 0.02],
      {
        color: WOOD_PAINT,
        bone: treeJoint,
        group: "treeRoots",
      },
    );
  }

  // Graceful spreading boughs
  const bough1 = catmull([
    [-0.52, 2.18, -0.2],
    [-0.36, 2.34, -0.08],
    [-0.18, 2.44, 0.04],
  ]);
  const bough2 = catmull([
    [-0.52, 2.18, -0.2],
    [-0.68, 2.35, -0.32],
    [-0.86, 2.48, -0.38],
  ]);
  const bough3 = catmull([
    [-0.52, 2.18, -0.2],
    [-0.48, 2.42, -0.38],
    [-0.42, 2.58, -0.48],
  ]);

  b.sweep(bough1, [0.052, 0.028], { color: WOOD_PAINT, bone: treeJoint, group: "bough1" });
  b.sweep(bough2, [0.05, 0.026], { color: WOOD_PAINT, bone: treeJoint, group: "bough2" });
  b.sweep(bough3, [0.048, 0.024], { color: WOOD_PAINT, bone: treeJoint, group: "bough3" });

  // Puffy Cel-Shaded Foliage Clumps in layered shades of Genshin Teal, Mint & Cyan
  const foliageClumps: [number, number, number, number, "teal" | "mint" | "cyan"][] = [
    // [x, y, z, radius, palette]
    [-0.38, 2.58, -0.22, 0.3, "teal"], // Central hero crown
    [-0.14, 2.46, 0.05, 0.25, "mint"], // Forward reaching bough
    [0.02, 2.32, 0.16, 0.2, "cyan"], // Drooping forward collar
    [-0.85, 2.52, -0.36, 0.26, "mint"], // Left bough
    [-0.46, 2.66, -0.48, 0.24, "teal"], // Back canopy
    [-0.48, 2.82, -0.24, 0.22, "mint"], // Top high apex
    [-0.58, 2.24, -0.16, 0.19, "teal"], // Lower collar
    [-0.26, 2.62, -0.36, 0.22, "cyan"], // Mid filler
    [-0.7, 2.4, -0.15, 0.18, "teal"],
  ];

  for (let i = 0; i < foliageClumps.length; i++) {
    const [fx, fy, fz, fr, clr] = foliageClumps[i];
    const mat = clr === "mint" ? FOLIAGE_MINT : clr === "cyan" ? FOLIAGE_CYAN : FOLIAGE_TEAL;
    b.part(new THREE.DodecahedronGeometry(fr, 1), mat, {
      bone: treeJoint,
      at: [fx, fy, fz],
      scale: [1.18, 0.9, 1.12],
      group: "treeFoliage",
    });
  }

  // Stylized leaf tuft cards around canopy perimeter
  const leafPositions: [number, number, number, number, number, number][] = [
    [-0.34, 2.64, 0.0, 0, 0.8, 0.6],
    [-0.1, 2.52, 0.16, 0.5, 0.7, 0.5],
    [-0.92, 2.56, -0.3, -0.7, 0.7, 0.2],
    [-0.48, 2.92, -0.22, 0, 1, 0],
    [-0.58, 2.7, -0.52, -0.3, 0.8, -0.5],
    [-0.22, 2.42, -0.06, 0.2, 0.5, 0.8],
    [0.06, 2.38, 0.22, 0.8, 0.4, 0.4],
    [-0.98, 2.45, -0.42, -0.8, 0.5, -0.3],
    [-0.38, 2.84, -0.38, -0.2, 0.9, -0.3],
    [-0.16, 2.62, 0.12, 0.4, 0.8, 0.4],
  ];

  const leafFrames = leafPositions.map(([lx, ly, lz, dx, dy, dz]) =>
    frame([lx, ly, lz], [dx, dy, dz], [0, 1, 0]),
  );

  b.cards(leafFrames, LEAF_TUFT, {
    size: [0.13, 0.17],
    lean: 25,
    bend: 20,
    bone: treeJoint,
    group: "leafCards",
  });

  // Hanging Wind Prayer Ribbons (Omamori charms) dangling from boughs
  const ribbonSpots: [number, number, number][] = [
    [-0.24, 2.32, 0.0],
    [-0.72, 2.38, -0.32],
    [-0.42, 2.46, -0.42],
  ];

  for (let i = 0; i < ribbonSpots.length; i++) {
    const [rx, ry, rz] = ribbonSpots[i];
    // Braided gold cord
    b.rod([rx, ry, rz], [rx, ry - 0.13, rz], 0.004, GOLD, {
      bone: treeJoint,
      group: "prayerCord",
    });
    // Red prayer cloth tag
    b.part(new THREE.BoxGeometry(0.038, 0.095, 0.005), "#d83828", {
      bone: treeJoint,
      at: [rx, ry - 0.18, rz],
      dir: [0.1, -1, 0.05],
      group: "prayerTag",
    });
    // Golden brass bell
    glow(
      b.part(new THREE.SphereGeometry(0.016, 8, 6), "#fcd34d", {
        bone: treeJoint,
        at: [rx, ry - 0.24, rz],
        group: "prayerBell",
      }),
      1.6,
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // 8. Secondary Golden Autumn Shrub (Warm complementary accent near river)

  const shrubPos: [number, number, number] = [0.72, 1.28, 0.08];
  b.sweep(
    catmull([
      [shrubPos[0], shrubPos[1], shrubPos[2]],
      [shrubPos[0] + 0.04, shrubPos[1] + 0.14, shrubPos[2] - 0.02],
      [shrubPos[0] + 0.08, shrubPos[1] + 0.26, shrubPos[2] + 0.02],
    ]),
    [0.038, 0.019],
    {
      color: WOOD_PAINT,
      bone: root,
      group: "shrubTrunk",
    },
  );

  const autumnPuffs: [number, number, number, number, string][] = [
    [0.78, 1.56, 0.08, 0.17, "#f59e2e"],
    [0.86, 1.5, -0.02, 0.14, "#fbbf24"],
    [0.72, 1.48, 0.16, 0.13, "#e65100"],
    [0.82, 1.64, 0.06, 0.12, "#ffd043"],
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
  // 9. Interactive Genshin Hero Elements (Oculus, Seelie, Chest, Crystalflies)

  // A. HERO ANEMO OCULUS (Floating prominently in open sky aperture)
  const oculusPos: [number, number, number] = [0.08, 2.12, 0.05];

  // Glowing turquoise core sphere
  glow(
    b.part(new THREE.SphereGeometry(0.048, 16, 12), "#1ee2c8", {
      bone: oculusJoint,
      at: oculusPos,
      group: "oculusCore",
    }),
    2.5,
  );
  // Inner super-bright white-hot nucleus
  glow(
    b.part(new THREE.SphereGeometry(0.025, 10, 8), "#ffffff", {
      bone: oculusJoint,
      at: oculusPos,
      group: "oculusNucleus",
    }),
    3.0,
  );

  // 4 Celestial Golden Wings framing the Oculus
  const wingDirs: [number, number, number][] = [
    [0, 1, 0], // Top
    [0, -1, 0], // Bottom
    [1, 0, 0], // Left
    [-1, 0, 0], // Right
  ];

  for (let i = 0; i < wingDirs.length; i++) {
    const [wx, wy, wz] = wingDirs[i];
    b.spike(
      [oculusPos[0] + wx * 0.065, oculusPos[1] + wy * 0.065, oculusPos[2] + wz * 0.065],
      [wx, wy, wz],
      0.08,
      0.019,
      {
        color: GOLD,
        bone: oculusJoint,
        group: `oculusWing${i}`,
      },
    );
  }

  // Dual spinning thin gold orbit rings around the Oculus
  b.part(new THREE.TorusGeometry(0.086, 0.0042, 8, 24), GOLD, {
    bone: oculusJoint,
    at: oculusPos,
    rotation: [35, 20, 0],
    group: "oculusRing1",
  });
  b.part(new THREE.TorusGeometry(0.076, 0.0036, 8, 24), GOLD, {
    bone: oculusJoint,
    at: oculusPos,
    rotation: [-45, 60, 0],
    group: "oculusRing2",
  });

  // Tiny orbiting leyline diamonds around Oculus
  const orbitDiamonds: [number, number, number][] = [
    [0.12, 0.08, 0.05],
    [-0.11, -0.07, 0.06],
    [0.05, -0.1, -0.08],
  ];

  for (let i = 0; i < orbitDiamonds.length; i++) {
    const [dx, dy, dz] = orbitDiamonds[i];
    glow(
      b.part(new THREE.OctahedronGeometry(0.016, 0), "#38f5de", {
        bone: oculusJoint,
        at: [oculusPos[0] + dx, oculusPos[1] + dy, oculusPos[2] + dz],
        group: "oculusDiamond",
      }),
      2.0,
    );
  }

  // B. ANEMO SEELIE & SEELIE COURT
  const courtPos: [number, number, number] = [0.36, 1.28, -0.26];
  // Carved stone Seelie Court plinth
  b.part(new THREE.CylinderGeometry(0.048, 0.065, 0.15, 8), MARBLE, {
    bone: root,
    at: [courtPos[0], courtPos[1] + 0.075, courtPos[2]],
    group: "courtBase",
  });
  b.part(new THREE.CylinderGeometry(0.085, 0.035, 0.045, 10), MARBLE, {
    bone: root,
    at: [courtPos[0], courtPos[1] + 0.165, courtPos[2]],
    group: "courtBowl",
  });

  // Floating Seelie Spirit
  const seeliePos: [number, number, number] = [0.36, 1.48, -0.22];
  glow(
    b.part(new THREE.SphereGeometry(0.044, 14, 10), "#28f5da", {
      bone: seelieJoint,
      at: seeliePos,
      scale: [0.95, 1.25, 0.95],
      group: "seelieBody",
    }),
    2.2,
  );
  b.part(new THREE.PlaneGeometry(0.065, 0.065), "#ffffff", {
    bone: seelieJoint,
    at: [seeliePos[0], seeliePos[1], seeliePos[2] + 0.044],
    dir: [0, 0, 1],
    axis: "z",
    texture: SEELIE_TEX,
    group: "seelieFace",
  });
  glow(
    b.sweep(
      catmull([
        [seeliePos[0], seeliePos[1] - 0.04, seeliePos[2]],
        [seeliePos[0] + 0.02, seeliePos[1] - 0.085, seeliePos[2] - 0.02],
        [seeliePos[0] - 0.02, seeliePos[1] - 0.14, seeliePos[2] - 0.04],
      ]),
      [0.019, 0.004],
      {
        color: "#28f5da",
        bone: seelieJoint,
        group: "seelieTail",
      },
    ),
    2.0,
  );

  // C. FLOATING STEPPING STONES & PRECIOUS TREASURE CHEST ISLET
  // Stepping stones bridging main island to chest islet
  const stepStones: [number, number, number, number][] = [
    [0.82, 1.18, -0.16, 0.14],
    [0.98, 1.1, -0.25, 0.15],
  ];

  for (let i = 0; i < stepStones.length; i++) {
    const [sx, sy, sz, sr] = stepStones[i];
    b.part(new THREE.CylinderGeometry(sr, sr * 0.85, 0.06, 8), MARBLE, {
      bone: root,
      at: [sx, sy, sz],
      group: "steppingStone",
    });
  }

  // Satellite Islet 1 (Chest Islet)
  const islet1Pos: [number, number, number] = [1.14, 1.02, -0.32];
  b.spike([islet1Pos[0], islet1Pos[1] + 0.08, islet1Pos[2]], [0, -1, 0], 0.3, 0.24, {
    color: CLIFF_ROCK,
    bone: satellite1,
    group: "islet1Rock",
  });
  b.part(new THREE.CylinderGeometry(0.24, 0.26, 0.05, 10), GRASS_PAINT, {
    bone: satellite1,
    at: [islet1Pos[0], islet1Pos[1] + 0.09, islet1Pos[2]],
    group: "islet1Grass",
  });

  // Precious Treasure Chest
  const chestPos: [number, number, number] = [islet1Pos[0], islet1Pos[1] + 0.18, islet1Pos[2]];
  b.part(new THREE.BoxGeometry(0.19, 0.13, 0.15), WOOD_PAINT, {
    bone: satellite1,
    at: chestPos,
    group: "chestBody",
  });
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.19, 10, 1, false, 0, Math.PI), WOOD_PAINT, {
    bone: satellite1,
    at: [chestPos[0], chestPos[1] + 0.065, chestPos[2]],
    dir: [1, 0, 0],
    group: "chestLid",
  });
  b.part(new THREE.BoxGeometry(0.194, 0.022, 0.154), GOLD, {
    bone: satellite1,
    at: [chestPos[0], chestPos[1] + 0.055, chestPos[2]],
    group: "chestRimGold",
  });
  b.part(new THREE.PlaneGeometry(0.07, 0.07), "#ffffff", {
    bone: satellite1,
    at: [chestPos[0], chestPos[1] + 0.015, chestPos[2] + 0.078],
    dir: [0, 0, 1],
    axis: "z",
    texture: CHEST_FRONT,
    group: "chestEscutcheon",
  });
  // Golden loot sparkle ray above the chest
  glow(
    b.part(new THREE.OctahedronGeometry(0.026, 0), "#ffd84a", {
      bone: satellite1,
      at: [chestPos[0], chestPos[1] + 0.22, chestPos[2]],
      group: "chestSparkle",
    }),
    2.2,
  );

  // D. SATELLITE ISLET 2 (Dandelion & Cecilia Meadow)
  const islet2Pos: [number, number, number] = [-1.08, 0.88, 0.42];
  b.spike([islet2Pos[0], islet2Pos[1] + 0.06, islet2Pos[2]], [0, -1, 0], 0.25, 0.19, {
    color: CLIFF_ROCK,
    bone: satellite2,
    group: "islet2Rock",
  });
  b.part(new THREE.CylinderGeometry(0.19, 0.21, 0.04, 10), GRASS_PAINT, {
    bone: satellite2,
    at: [islet2Pos[0], islet2Pos[1] + 0.07, islet2Pos[2]],
    group: "islet2Grass",
  });

  // Fluffy dandelion seed puff
  b.rod([islet2Pos[0], islet2Pos[1] + 0.08, islet2Pos[2]], [islet2Pos[0], islet2Pos[1] + 0.26, islet2Pos[2]], 0.005, "#6ea33e", {
    bone: satellite2,
    group: "dandelionStem",
  });
  b.part(new THREE.SphereGeometry(0.046, 10, 8), "#f6fcff", {
    bone: satellite2,
    at: [islet2Pos[0], islet2Pos[1] + 0.28, islet2Pos[2]],
    group: "dandelionPuff",
  });

  // E. FLOATING CELESTIA MONOLITHS & ANEMO UPDRAFT RINGS
  const mono1Pos: [number, number, number] = [-0.98, 1.84, 0.16];
  b.spike([mono1Pos[0], mono1Pos[1] + 0.18, mono1Pos[2]], [0, -1, 0], 0.36, 0.088, {
    color: MARBLE,
    bone: monolith1,
    group: "monolith1",
  });
  b.part(new THREE.PlaneGeometry(0.06, 0.22), "#ffffff", {
    bone: monolith1,
    at: [mono1Pos[0], mono1Pos[1] - 0.02, mono1Pos[2] + 0.046],
    dir: [0, 0, 1],
    axis: "z",
    texture: ANEMO_RUNE,
    group: "monolith1Rune",
  });

  const mono2Pos: [number, number, number] = [0.68, 1.76, -0.45];
  b.spike([mono2Pos[0], mono2Pos[1] + 0.16, mono2Pos[2]], [0, -1, 0], 0.32, 0.078, {
    color: MARBLE,
    bone: monolith2,
    group: "monolith2",
  });

  // Floating Anemo Updraft Wind Rings (Genshin gliding rings)
  const windRing1: [number, number, number] = [-0.65, 1.88, 0.45];
  glow(
    b.part(new THREE.TorusGeometry(0.12, 0.01, 8, 20), "#2ee8cf", {
      bone: root,
      at: windRing1,
      dir: [0, 1, 0],
      group: "updraftRing1",
    }),
    1.8,
  );

  const windRing2: [number, number, number] = [0.42, 1.92, 0.42];
  glow(
    b.part(new THREE.TorusGeometry(0.12, 0.01, 8, 20), "#2ee8cf", {
      bone: root,
      at: windRing2,
      dir: [0, 1, 0],
      group: "updraftRing2",
    }),
    1.8,
  );

  // F. ANEMO CRYSTALFLIES (Fluttering around the great tree)
  const crystalfly1Pos: [number, number, number] = [-0.28, 2.38, 0.15];
  glow(
    b.part(new THREE.SphereGeometry(0.015, 8, 6), "#36fae4", {
      bone: treeJoint,
      at: crystalfly1Pos,
      scale: [0.7, 1.6, 0.7],
      group: "fly1Core",
    }),
    2.5,
  );
  b.part(new THREE.PlaneGeometry(0.08, 0.08), "#ffffff", {
    bone: treeJoint,
    at: crystalfly1Pos,
    dir: [0, 1, 0],
    up: [0, 0, 1],
    axis: "z",
    texture: CRYSTALFLY_WING,
    group: "fly1Wing",
  });

  const crystalfly2Pos: [number, number, number] = [-0.75, 2.32, -0.1];
  glow(
    b.part(new THREE.SphereGeometry(0.014, 8, 6), "#36fae4", {
      bone: treeJoint,
      at: crystalfly2Pos,
      scale: [0.7, 1.6, 0.7],
      group: "fly2Core",
    }),
    2.5,
  );
  b.part(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", {
    bone: treeJoint,
    at: crystalfly2Pos,
    dir: [0.3, 0.9, 0.3],
    up: [0, 0, 1],
    axis: "z",
    texture: CRYSTALFLY_WING,
    group: "fly2Wing",
  });

  // -------------------------------------------------------------------------------------------------------------
  // 10. Flower Cards & Wild Meadow Plants

  // Sacred Cecilia Flowers (White Mondstadt specialty flowers)
  const ceciliaSpots: [number, number, number][] = [
    [-0.22, 1.3, 0.22],
    [-0.26, 1.3, 0.26],
    [-0.16, 1.29, 0.3],
    [-0.34, 1.45, -0.02],
    [-0.3, 1.45, 0.04],
    [islet2Pos[0] + 0.06, islet2Pos[1] + 0.1, islet2Pos[2] - 0.04],
    [islet2Pos[0] - 0.05, islet2Pos[1] + 0.1, islet2Pos[2] + 0.05],
  ];

  const ceciliaFrames = ceciliaSpots.map(([cx, cy, cz]) =>
    frame([cx, cy, cz], [0, 1, 0], [0, 0, 1]),
  );

  b.cards(ceciliaFrames, CECILIA_FLOWER, {
    size: [0.08, 0.08],
    lean: 90,
    mirror: true,
    bone: root,
    group: "ceciliaFlowers",
  });

  // Windwheel Asters (Red windmill flowers spinning near the great tree)
  const asterSpots: [number, number, number][] = [
    [-0.45, 1.45, -0.12],
    [-0.68, 1.45, -0.36],
    [-0.72, 1.45, -0.12],
    [-0.38, 1.45, -0.22],
  ];

  const asterFrames = asterSpots.map(([ax, ay, az]) =>
    frame([ax, ay, az], [0, 1, 0], [0, 0, 1]),
  );

  b.cards(asterFrames, WINDWHEEL_ASTER, {
    size: [0.085, 0.085],
    lean: 90,
    mirror: true,
    bone: root,
    group: "windwheelAsters",
  });

  // Wild sweet mushrooms by the root claws
  for (const [mx, my, mz] of [
    [-0.52, 1.45, -0.38],
    [-0.56, 1.45, -0.42],
  ] as [number, number, number][]) {
    b.rod([mx, my, mz], [mx, my + 0.04, mz], 0.008, "#f2eedf", { bone: root, group: "mushroomStem" });
    b.part(new THREE.ConeGeometry(0.024, 0.026, 8), "#d44522", {
      bone: root,
      at: [mx, my + 0.052, mz],
      group: "mushroomCap",
    });
  }

  return b.root;
}
