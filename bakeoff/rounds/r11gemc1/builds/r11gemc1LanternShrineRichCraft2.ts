import * as THREE from "three";
import {
  createBuilder,
  catmull,
  countershade,
  mottle,
  grain,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Inazuma Roadside Shrine",
  description:
    "A Genshin Impact-style Inazuma roadside shrine featuring a vermilion torii gate draped with a braided shimenawa rope and brass suzu bell, a seated stone kitsune guardian with a ceremonial red bib, an elevated wooden hokora sanctuary beneath a sacred sakura tree, glowing stone and paper lanterns, a chozubachi water basin, and traditional offerings including tricolor dango, saké, and ema prayer plaques.",
};

export default function build() {
  const b = createBuilder({ name: "inazuma_shrine", paintSize: 1024 });

  // ---------------------------------------------------------------------------
  // Color Palette & Paints
  // ---------------------------------------------------------------------------
  const VERMILION = "#dc3422"; // Inazuma sacred vermilion lacquer
  const VERMILION_DARK = "#a82215"; // Deep vermilion shadow
  const BLACK_LACQUER = "#19151c"; // Dark polished lacquer
  const GOLD = "#e5b142"; // Chased brass / gold leaf fittings
  const GOLD_BRIGHT = "#f6cd60"; // Bright polished gold
  const WHITE_WASHI = "#f9f7f0"; // Natural washi paper / shide
  const STRAW = "#d4b36a"; // Braided rice straw shimenawa
  const STRAW_DARK = "#a88742"; // Straw tassel shadow
  const CRIMSON_CORD = "#b51d24"; // Silk tassels & cords
  const ROOF_TEAL = "#1c4038"; // Inazuma weathered copper-teal roof
  const ROOF_TEAL_LIGHT = "#28574c"; // Eave highlight

  // Sakura Blossom Palette
  const SAKURA_DEEP = "#e06c92";
  const SAKURA_MID = "#f895b6";
  const SAKURA_LIGHT = "#ffc0d7";
  const SAKURA_CREAM = "#ffeaf2";
  const PLUM_BARK = grain("#38232b", "#24141a", { size: 0.04, axis: "y" });

  // Wood & Timber paints
  const DARK_TIMBER = grain("#3a2b22", "#291d17", { size: 0.04, axis: "y" });
  const HINOKI_WOOD = grain("#dbbe93", "#c7a574", { size: 0.03, axis: "y" });

  // Stone paint with moss gathering on upward surfaces
  const STONE_BASE = mottle("#646b73", "#525860", { size: 0.16 });
  const STONE_PAINT = countershade(
    mottle("#4b5c3e", STONE_BASE, { size: 0.14, contrast: 1.2 }),
    STONE_BASE,
    { level: 0.45, soft: 0.25 }
  );

  // ---------------------------------------------------------------------------
  // SVG Textures
  // ---------------------------------------------------------------------------

  // 1. Torii Framed Plaque (Gaku) with Inazuma Electro Mitsudomoe Crest
  const TORII_GAKU_TEX = svg(
    `<svg viewBox="0 0 90 130" xmlns="http://www.w3.org/2000/svg">
      <rect width="90" height="130" fill="#18151c"/>
      <rect x="5" y="5" width="80" height="120" rx="3" fill="none" stroke="#e5b142" stroke-width="4.5"/>
      <rect x="10" y="10" width="70" height="110" fill="none" stroke="#b88a2a" stroke-width="1.5"/>
      <g transform="translate(45, 46) scale(1.2)">
        <circle cx="0" cy="0" r="18" fill="none" stroke="#e5b142" stroke-width="2.5"/>
        <path d="M0 -12 A7 7 0 0 1 7 -5 A12 12 0 0 1 0 12 A4 4 0 0 0 2 -3 A7 7 0 0 0 0 -12" fill="#e5b142"/>
        <g transform="rotate(120)">
          <path d="M0 -12 A7 7 0 0 1 7 -5 A12 12 0 0 1 0 12 A4 4 0 0 0 2 -3 A7 7 0 0 0 0 -12" fill="#e5b142"/>
        </g>
        <g transform="rotate(240)">
          <path d="M0 -12 A7 7 0 0 1 7 -5 A12 12 0 0 1 0 12 A4 4 0 0 0 2 -3 A7 7 0 0 0 0 -12" fill="#e5b142"/>
        </g>
      </g>
      <g fill="#e5b142" transform="translate(45, 96)">
        <rect x="-10" y="-14" width="20" height="3" rx="1.5"/>
        <rect x="-1.5" y="-14" width="3" height="18" rx="1.5"/>
        <path d="M-12 6 L12 6 M-8 -2 L-1 3 M8 -2 L1 3 M-9 16 L9 16" stroke="#e5b142" stroke-width="2.5" stroke-linecap="round"/>
      </g>
    </svg>`,
    { size: 256 }
  );

  // 2. Washi Paper Lantern Window with Kumiko Lattice & Sakura Silhouette
  const LANTERN_WINDOW_TEX = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fffce8"/>
          <stop offset="55%" stop-color="#ffdc82"/>
          <stop offset="100%" stop-color="#f59c38"/>
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#glowGrad)"/>
      <rect x="4" y="4" width="92" height="92" fill="none" stroke="#3d2618" stroke-width="7"/>
      <line x1="50" y1="4" x2="50" y2="96" stroke="#3d2618" stroke-width="5"/>
      <line x1="4" y1="50" x2="96" y2="50" stroke="#3d2618" stroke-width="5"/>
      <path d="M50 16 L84 50 L50 84 L16 50 Z" fill="none" stroke="#543622" stroke-width="3"/>
      <g transform="translate(50, 50) scale(0.65)" fill="#783424" opacity="0.85">
        <circle cx="0" cy="0" r="4.5" fill="#ffe082"/>
        <ellipse cx="0" cy="-14" rx="5" ry="9"/>
        <ellipse cx="13" cy="-4" rx="9" ry="5"/>
        <ellipse cx="8" cy="11" rx="6" ry="8"/>
        <ellipse cx="-8" cy="11" rx="6" ry="8"/>
        <ellipse cx="-13" cy="-4" rx="9" ry="5"/>
      </g>
    </svg>`,
    { size: 256 }
  );

  // 3. Shide Zigzag Paper Streamers
  const SHIDE_PAPER_TEX = svg(
    `<svg viewBox="0 0 60 120" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0 L36 0 L36 24 L52 24 L52 58 L34 58 L34 94 L46 94 L46 120 L26 120 L26 86 L10 86 L10 50 L26 50 L26 14 L15 14 Z" fill="#fcfbf7" stroke="#ded8c8" stroke-width="1.8" stroke-linejoin="round"/>
      <line x1="26" y1="14" x2="26" y2="50" stroke="#d6cebe" stroke-width="1.6"/>
      <line x1="34" y1="58" x2="34" y2="94" stroke="#d6cebe" stroke-width="1.6"/>
      <rect x="22" y="0" width="7" height="9" rx="2" fill="#c92a2a"/>
    </svg>`,
    { size: 256 }
  );

  // 4. Kitsune Ceremonial Embroidered Red Bib
  const KITSUNE_BIB_TEX = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 12 Q50 38 82 12 L92 36 Q96 76 50 96 Q4 76 8 36 Z" fill="#c9252c" stroke="#801016" stroke-width="2.5"/>
      <path d="M24 18 Q50 42 76 18 L84 38 Q87 70 50 88 Q13 70 16 38 Z" fill="none" stroke="#e8b446" stroke-width="2"/>
      <path d="M36 52 Q45 44 55 52 Q65 46 68 58 Q60 66 50 60 Q40 66 36 52" fill="none" stroke="#f2ca68" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="50" cy="42" r="4.5" fill="#f2ca68"/>
      <path d="M18 12 Q8 4 0 0 M82 12 Q92 4 100 0" stroke="#fcfbf7" stroke-width="3" fill="none"/>
    </svg>`,
    { size: 256 }
  );

  // 5. Wooden Ema Prayer Plaque
  const EMA_TEX = svg(
    `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="90" fill="#dfbe91"/>
      <path d="M0 22 Q60 27 120 20 M0 52 Q60 47 120 54 M0 76 Q60 81 120 74" stroke="#cb9f6d" stroke-width="2" fill="none"/>
      <rect x="6" y="6" width="108" height="78" rx="4" fill="none" stroke="#b3261e" stroke-width="3"/>
      <g transform="translate(60, 42) scale(0.72)">
        <circle cx="0" cy="0" r="28" fill="#8c3329"/>
        <circle cx="0" cy="0" r="24" fill="#dfbe91"/>
        <path d="M-16 -12 L-6 12 L0 6 L6 12 L16 -12 L6 -4 L0 -14 L-6 -4 Z" fill="#b3261e"/>
        <ellipse cx="-5" cy="0" rx="2" ry="3.5" fill="#dfbe91"/>
        <ellipse cx="5" cy="0" rx="2" ry="3.5" fill="#dfbe91"/>
        <circle cx="0" cy="-6" r="3" fill="#e5b142"/>
      </g>
      <path d="M22 24 L22 40 M26 30 L18 36 M96 24 L96 44 M91 32 L101 32" stroke="#22112f" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="60" cy="7" r="3" fill="#301f14"/>
    </svg>`,
    { size: 256 }
  );

  // 6. Sacred Ofuda Paper Talisman
  const OFUDA_TEX = svg(
    `<svg viewBox="0 0 50 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="50" height="120" fill="#fcfaf2"/>
      <rect x="3" y="3" width="44" height="114" fill="none" stroke="#c92a2a" stroke-width="2"/>
      <polygon points="25,10 38,23 25,36 12,23" fill="#c92a2a"/>
      <circle cx="25" cy="23" r="5" fill="#fcfaf2"/>
      <path d="M25 44 L25 80 M18 54 L32 54 M16 66 L34 66 M20 92 L30 92 M25 84 L25 108" stroke="#1f1826" stroke-width="3" stroke-linecap="round"/>
      <circle cx="25" cy="113" r="3" fill="#c92a2a"/>
    </svg>`,
    { size: 256 }
  );

  // 7. Shrine Nobori Banner
  const BANNER_TEX = svg(
    `<svg viewBox="0 0 60 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="60" height="200" fill="#f8f5ee"/>
      <rect x="0" y="0" width="60" height="32" fill="#b82622"/>
      <circle cx="30" cy="16" r="8.5" fill="none" stroke="#f0c858" stroke-width="2"/>
      <g fill="#201a24" font-family="serif" font-weight="bold" font-size="16" text-anchor="middle">
        <text x="30" y="68">鳴</text>
        <text x="30" y="100">神</text>
        <text x="30" y="132">大</text>
        <text x="30" y="164">社</text>
      </g>
      <rect x="0" y="180" width="60" height="20" fill="#b82622"/>
      <line x1="20" y1="180" x2="20" y2="200" stroke="#f8f5ee" stroke-width="2.5"/>
      <line x1="40" y1="180" x2="40" y2="200" stroke="#f8f5ee" stroke-width="2.5"/>
    </svg>`,
    { size: 256 }
  );

  // ---------------------------------------------------------------------------
  // Scene Skeleton (Rig Structure)
  // ---------------------------------------------------------------------------
  const root = b.joint("root", { at: [0, 0, 0] });
  const bellHinge = b.joint("bell", {
    parent: root,
    at: [0, 1.48, 0.28],
    role: "hinge",
  });
  const bannerHinge = b.joint("banner", {
    parent: root,
    at: [1.14, 0.12, 0.1],
    role: "hinge",
  });
  const emaHinge1 = b.joint("ema1", {
    parent: root,
    at: [-0.88, 0.88, -0.42],
    role: "hinge",
  });
  const emaHinge2 = b.joint("ema2", {
    parent: root,
    at: [-1.0, 0.86, -0.42],
    role: "hinge",
  });
  const kitsuneJoint = b.joint("kitsune", {
    parent: root,
    at: [-0.76, 0.04, 0.5],
    role: "hinge",
  });

  // ---------------------------------------------------------------------------
  // 1. Ground, Stone Terraces & Sando Steps (Anchored strictly >= 0.00m)
  // ---------------------------------------------------------------------------

  // Primary circular terrain dais (grounded at y = 0.00 to 0.06m)
  b.part(new THREE.CylinderGeometry(1.48, 1.54, 0.06, 18), STONE_PAINT, {
    bone: root,
    at: [0, 0.03, -0.05],
  });

  // Raised stone sanctuary terrace (back section)
  b.part(new THREE.BoxGeometry(1.36, 0.12, 1.15), STONE_PAINT, {
    bone: root,
    at: [0, 0.12, -0.65],
  });
  b.part(new THREE.BoxGeometry(1.2, 0.12, 1.0), STONE_PAINT, {
    bone: root,
    at: [0, 0.24, -0.65],
  });

  // Sando approach flagstones (wide stone steps leading up)
  const stepZ = [0.95, 0.72, 0.48, 0.25, 0.02, -0.2];
  const stepW = [0.72, 0.76, 0.8, 0.82, 0.76, 0.7];
  stepZ.forEach((z, i) => {
    const yHeight = 0.05 + i * 0.035;
    b.part(new THREE.BoxGeometry(stepW[i], 0.04, 0.2), STONE_PAINT, {
      bone: root,
      at: [0, yHeight, z],
    });
    // Natural flagstone curb stones
    const side = i % 2 === 0 ? 0.49 : -0.49;
    b.part(new THREE.CylinderGeometry(0.13, 0.15, 0.035, 7), STONE_PAINT, {
      bone: root,
      at: [side, yHeight - 0.01, z + 0.02],
    });
  });

  // Roadside mossy boulders (placed with bases firmly above y = 0.00)
  const rocks = [
    { at: [-1.15, 0.15, 0.65], r: 0.26, scale: [1.2, 0.6, 1.1] },
    { at: [1.12, 0.16, 0.62], r: 0.28, scale: [1.2, 0.6, 1.0] },
    { at: [-1.16, 0.2, -0.15], r: 0.32, scale: [1.1, 0.65, 1.1] },
    { at: [1.18, 0.2, -0.52], r: 0.34, scale: [1.1, 0.65, 1.1] },
    { at: [-0.48, 0.18, -1.05], r: 0.28, scale: [1.2, 0.65, 1.1] },
    { at: [0.46, 0.2, -1.06], r: 0.32, scale: [1.1, 0.65, 1.2] },
  ];
  rocks.forEach((r, idx) => {
    b.part(new THREE.DodecahedronGeometry(r.r, 0), STONE_PAINT, {
      bone: root,
      at: r.at,
      scale: r.scale,
      rotation: [0, idx * 55, 0],
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Chozubachi (Sacred Stone Water Purification Basin)
  // ---------------------------------------------------------------------------
  const BASIN_X = -0.84;
  const BASIN_Z = 0.05;
  const BASIN_Y = 0.06;

  // Rough stone pedestal
  b.part(new THREE.CylinderGeometry(0.24, 0.28, 0.16, 8), STONE_PAINT, {
    bone: root,
    at: [BASIN_X, BASIN_Y + 0.08, BASIN_Z],
  });
  // Hollowed stone basin rim
  b.part(new THREE.CylinderGeometry(0.22, 0.23, 0.16, 10), STONE_PAINT, {
    bone: root,
    at: [BASIN_X, BASIN_Y + 0.24, BASIN_Z],
  });
  // Still crystal water surface
  const waterPlane = b.part(
    new THREE.CircleGeometry(0.18, 12),
    "#46a5b8",
    {
      bone: root,
      at: [BASIN_X, BASIN_Y + 0.3, BASIN_Z],
      rotation: [-90, 0, 0],
    }
  );
  glow(waterPlane, 0.85);

  // Bamboo water spout (Kakehi) feeding the basin
  b.rod(
    [BASIN_X - 0.22, 0.1, BASIN_Z - 0.1],
    [BASIN_X - 0.22, BASIN_Y + 0.44, BASIN_Z - 0.1],
    0.016,
    "#7e9458",
    { bone: root }
  );
  b.rod(
    [BASIN_X - 0.22, BASIN_Y + 0.4, BASIN_Z - 0.1],
    [BASIN_X - 0.06, BASIN_Y + 0.36, BASIN_Z - 0.02],
    0.012,
    "#7e9458",
    { bone: root }
  );

  // Bamboo ladle (Hishaku) resting across the stone rim
  b.rod(
    [BASIN_X - 0.12, BASIN_Y + 0.33, BASIN_Z + 0.14],
    [BASIN_X + 0.14, BASIN_Y + 0.33, BASIN_Z - 0.12],
    0.004,
    "#dfc596",
    { bone: root }
  );
  // Ladle cup
  b.part(new THREE.CylinderGeometry(0.024, 0.022, 0.03, 8), "#dfc596", {
    bone: root,
    at: [BASIN_X - 0.12, BASIN_Y + 0.34, BASIN_Z + 0.14],
  });

  // ---------------------------------------------------------------------------
  // 3. Torii Gate (Vermilion Lacquer, Black Trim, Gold Fittings)
  // ---------------------------------------------------------------------------
  const TORII_Z = 0.28;
  const HASHIRA_X = 0.74;

  // Pillars (Hashira): pair with slight inward tilt
  for (const s of [1, -1]) {
    const posX = s * HASHIRA_X;

    // Kamebara (black lacquer & stone plinth base)
    b.part(new THREE.CylinderGeometry(0.13, 0.15, 0.1, 12), BLACK_LACQUER, {
      bone: root,
      at: [posX * 1.02, 0.08, TORII_Z],
    });
    b.part(new THREE.TorusGeometry(0.13, 0.018, 8, 16), GOLD, {
      bone: root,
      at: [posX * 1.02, 0.13, TORII_Z],
      rotation: [90, 0, 0],
    });

    // Main column: tapering vermilion timber
    b.rod(
      [posX * 1.02, 0.13, TORII_Z],
      [posX * 0.98, 2.16, TORII_Z],
      [0.088, 0.08],
      VERMILION,
      { bone: root }
    );

    // Upper gold collar (Nemaki / Kanagu)
    b.part(new THREE.CylinderGeometry(0.086, 0.086, 0.06, 12), GOLD, {
      bone: root,
      at: [posX * 0.985, 2.05, TORII_Z],
    });

    // Kusabi wedges piercing the pillars at the Nuki tie-beam
    b.part(new THREE.BoxGeometry(0.03, 0.16, 0.09), BLACK_LACQUER, {
      bone: root,
      at: [s * (HASHIRA_X + 0.1), 1.7, TORII_Z],
    });
  }

  // Nuki (Lower Horizontal Crossbeam)
  b.part(new THREE.BoxGeometry(1.94, 0.12, 0.075), VERMILION, {
    bone: root,
    at: [0, 1.7, TORII_Z],
  });
  // Nuki black end caps with gold collar
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.05, 0.125, 0.08), BLACK_LACQUER, {
      bone: root,
      at: [s * 0.95, 1.7, TORII_Z],
    });
    b.part(new THREE.BoxGeometry(0.025, 0.13, 0.085), GOLD, {
      bone: root,
      at: [s * 0.91, 1.7, TORII_Z],
    });
  }

  // Shimaki (Secondary Sub-beam beneath Kasagi)
  const shimakiPath = catmull([
    [-1.18, 2.22, TORII_Z],
    [-0.6, 2.16, TORII_Z],
    [0, 2.14, TORII_Z],
    [0.6, 2.16, TORII_Z],
    [1.18, 2.22, TORII_Z],
  ]);
  b.sweep(shimakiPath, 0.055, {
    bone: root,
    section: "box",
    color: VERMILION,
  });

  // Kasagi (Top Main Beam with graceful upward curve / sori)
  const kasagiPath = catmull([
    [-1.34, 2.34, TORII_Z],
    [-0.7, 2.22, TORII_Z],
    [0, 2.2, TORII_Z],
    [0.7, 2.22, TORII_Z],
    [1.34, 2.34, TORII_Z],
  ]);
  b.sweep(kasagiPath, 0.065, {
    bone: root,
    section: "box",
    color: VERMILION,
  });

  // Black Lacquer Roof Cap (Kashiragi) atop Kasagi
  const capPath = catmull([
    [-1.36, 2.38, TORII_Z],
    [-0.7, 2.26, TORII_Z],
    [0, 2.24, TORII_Z],
    [0.7, 2.26, TORII_Z],
    [1.36, 2.38, TORII_Z],
  ]);
  b.sweep(capPath, 0.04, {
    bone: root,
    section: "box",
    color: BLACK_LACQUER,
  });

  // Gold Kasagi End Caps (Kiguchi Kanagu)
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.06, 0.14, 0.14), GOLD, {
      bone: root,
      at: [s * 1.34, 2.34, TORII_Z],
      rotation: [0, 0, s * -12],
    });
  }

  // Central Strut (Gakuzuka) & Framed Shrine Plaque (Gaku)
  b.part(new THREE.BoxGeometry(0.08, 0.38, 0.065), VERMILION_DARK, {
    bone: root,
    at: [0, 1.94, TORII_Z],
  });

  // Torii Gaku plaque
  b.part(new THREE.BoxGeometry(0.24, 0.34, 0.035), BLACK_LACQUER, {
    bone: root,
    at: [0, 1.94, TORII_Z + 0.04],
  });
  b.part(new THREE.PlaneGeometry(0.22, 0.32), "#ffffff", {
    bone: root,
    at: [0, 1.94, TORII_Z + 0.059],
    dir: [0, 0, 1],
    axis: "z",
    texture: TORII_GAKU_TEX,
  });
  // Clean continuous gold frame around plaque
  b.part(new THREE.BoxGeometry(0.26, 0.016, 0.04), GOLD, {
    bone: root,
    at: [0, 2.11, TORII_Z + 0.042],
  });
  b.part(new THREE.BoxGeometry(0.26, 0.016, 0.04), GOLD, {
    bone: root,
    at: [0, 1.77, TORII_Z + 0.042],
  });
  b.part(new THREE.BoxGeometry(0.016, 0.34, 0.04), GOLD, {
    bone: root,
    at: [-0.122, 1.94, TORII_Z + 0.042],
  });
  b.part(new THREE.BoxGeometry(0.016, 0.34, 0.04), GOLD, {
    bone: root,
    at: [0.122, 1.94, TORII_Z + 0.042],
  });

  // ---------------------------------------------------------------------------
  // 4. Sacred Shimenawa Rope, Tassels, Shide & Suzu Bell
  // ---------------------------------------------------------------------------

  // Braided straw rope hanging in a graceful arc
  const shimenawaPath = catmull([
    [-0.68, 1.68, TORII_Z],
    [-0.34, 1.54, TORII_Z + 0.02],
    [0, 1.48, TORII_Z + 0.03],
    [0.34, 1.54, TORII_Z + 0.02],
    [0.68, 1.68, TORII_Z],
  ]);
  b.sweep(shimenawaPath, (t) => 0.045 - Math.abs(t - 0.5) * 0.035, {
    bone: root,
    color: STRAW,
  });

  // Three downward-pointing braided straw tassels (Fusae)
  const tasselX = [-0.28, 0, 0.28];
  tasselX.forEach((tx) => {
    const ty = 1.48 + Math.abs(tx) * 0.16;
    // Red binding ring
    b.part(new THREE.TorusGeometry(0.032, 0.008, 6, 12), CRIMSON_CORD, {
      bone: root,
      at: [tx, ty - 0.01, TORII_Z + 0.025],
      rotation: [90, 0, 0],
    });
    // Tapering straw pendant
    b.part(new THREE.ConeGeometry(0.028, 0.13, 8), STRAW, {
      bone: root,
      at: [tx, ty - 0.08, TORII_Z + 0.025],
      rotation: [180, 0, 0],
    });
  });

  // White zigzag paper Shide streamers
  const shideOffsets = [-0.44, -0.15, 0.15, 0.44];
  shideOffsets.forEach((x, idx) => {
    const yVal = 1.52 + Math.abs(x) * 0.2;
    b.part(new THREE.PlaneGeometry(0.08, 0.18), "#ffffff", {
      bone: root,
      at: [x, yVal - 0.1, TORII_Z + 0.04],
      dir: [0, 0, 1],
      axis: "z",
      rotation: [0, idx % 2 ? 6 : -6, idx % 2 ? -4 : 4],
      texture: SHIDE_PAPER_TEX,
    });
  });

  // Sacred Suzu Shrine Bell
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.06, 8), CRIMSON_CORD, {
    bone: bellHinge,
    at: [0, 1.48, TORII_Z + 0.03],
  });
  b.part(new THREE.SphereGeometry(0.044, 12, 10), GOLD, {
    bone: bellHinge,
    at: [0, 1.42, TORII_Z + 0.03],
  });
  b.part(new THREE.TorusGeometry(0.042, 0.008, 8, 16), GOLD_BRIGHT, {
    bone: bellHinge,
    at: [0, 1.4, TORII_Z + 0.03],
    rotation: [90, 0, 0],
  });
  b.part(new THREE.BoxGeometry(0.055, 0.01, 0.01), BLACK_LACQUER, {
    bone: bellHinge,
    at: [0, 1.39, TORII_Z + 0.05],
  });
  // Long braided crimson & white bell-pull cord (Suzu-no-o)
  b.rod(
    [0, 1.38, TORII_Z + 0.03],
    [0.02, 0.88, TORII_Z + 0.04],
    0.012,
    CRIMSON_CORD,
    { bone: bellHinge }
  );
  b.rod(
    [0.02, 0.88, TORII_Z + 0.04],
    [-0.01, 0.72, TORII_Z + 0.05],
    0.01,
    WHITE_WASHI,
    { bone: bellHinge }
  );
  // Bottom tassel
  b.part(new THREE.ConeGeometry(0.022, 0.08, 8), CRIMSON_CORD, {
    bone: bellHinge,
    at: [-0.01, 0.68, TORII_Z + 0.05],
    rotation: [180, 0, 0],
  });

  // ---------------------------------------------------------------------------
  // 5. Roadside Shrine Sanctuary (Hokora / Yashiro)
  // ---------------------------------------------------------------------------
  const SHRINE_Z = -0.66;
  const DECK_Y = 0.38;

  // Foundation stilts & joists
  for (const sx of [-0.34, 0.34]) {
    for (const sz of [-0.3, 0.3]) {
      b.rod(
        [sx, 0.24, SHRINE_Z + sz],
        [sx, DECK_Y, SHRINE_Z + sz],
        0.028,
        DARK_TIMBER,
        { bone: root }
      );
    }
  }

  // Veranda deck slab (Engawa)
  b.part(new THREE.BoxGeometry(0.86, 0.045, 0.76), HINOKI_WOOD, {
    bone: root,
    at: [0, DECK_Y, SHRINE_Z],
  });

  // Veranda handrails & balustrade
  const railPosts = [
    [-0.41, SHRINE_Z + 0.36],
    [-0.41, SHRINE_Z],
    [-0.41, SHRINE_Z - 0.36],
    [0.41, SHRINE_Z + 0.36],
    [0.41, SHRINE_Z],
    [0.41, SHRINE_Z - 0.36],
    [-0.2, SHRINE_Z - 0.36],
    [0.2, SHRINE_Z - 0.36],
  ];
  railPosts.forEach(([rx, rz]) => {
    b.rod([rx, DECK_Y, rz], [rx, DECK_Y + 0.16, rz], 0.012, VERMILION, {
      bone: root,
    });
    b.part(new THREE.SphereGeometry(0.016, 6, 6), GOLD, {
      bone: root,
      at: [rx, DECK_Y + 0.17, rz],
    });
  });
  // Top horizontal rails
  b.part(new THREE.BoxGeometry(0.02, 0.02, 0.74), VERMILION, {
    bone: root,
    at: [-0.41, DECK_Y + 0.15, SHRINE_Z],
  });
  b.part(new THREE.BoxGeometry(0.02, 0.02, 0.74), VERMILION, {
    bone: root,
    at: [0.41, DECK_Y + 0.15, SHRINE_Z],
  });
  b.part(new THREE.BoxGeometry(0.82, 0.02, 0.02), VERMILION, {
    bone: root,
    at: [0, DECK_Y + 0.15, SHRINE_Z - 0.36],
  });

  // Shrine Sanctum Body (Moya)
  b.part(new THREE.BoxGeometry(0.62, 0.54, 0.52), DARK_TIMBER, {
    bone: root,
    at: [0, DECK_Y + 0.28, SHRINE_Z - 0.04],
  });

  // Front sliding lattice doors (Vermilion framed panels)
  b.part(new THREE.BoxGeometry(0.26, 0.44, 0.02), VERMILION_DARK, {
    bone: root,
    at: [-0.14, DECK_Y + 0.25, SHRINE_Z + 0.225],
  });
  b.part(new THREE.BoxGeometry(0.26, 0.44, 0.02), VERMILION_DARK, {
    bone: root,
    at: [0.14, DECK_Y + 0.25, SHRINE_Z + 0.225],
  });
  // Horizontal lattice battens
  for (let dy = 0.1; dy <= 0.4; dy += 0.075) {
    b.part(new THREE.BoxGeometry(0.5, 0.012, 0.025), BLACK_LACQUER, {
      bone: root,
      at: [0, DECK_Y + dy, SHRINE_Z + 0.23],
    });
  }
  // Door ring pulls
  b.part(new THREE.TorusGeometry(0.018, 0.005, 6, 12), GOLD, {
    bone: root,
    at: [-0.04, DECK_Y + 0.24, SHRINE_Z + 0.24],
  });
  b.part(new THREE.TorusGeometry(0.018, 0.005, 6, 12), GOLD, {
    bone: root,
    at: [0.04, DECK_Y + 0.24, SHRINE_Z + 0.24],
  });

  // Sacred Bronze Mirror (Shinkyo) on carved wood stand
  b.part(new THREE.BoxGeometry(0.08, 0.06, 0.04), HINOKI_WOOD, {
    bone: root,
    at: [0, DECK_Y + 0.05, SHRINE_Z + 0.25],
  });
  const mirrorDisc = b.part(
    new THREE.CylinderGeometry(0.048, 0.048, 0.01, 16),
    GOLD,
    {
      bone: root,
      at: [0, DECK_Y + 0.12, SHRINE_Z + 0.26],
      rotation: [85, 0, 0],
    }
  );
  glow(mirrorDisc, 1.4);

  // Veranda corner andon lanterns (warm evening glow)
  for (const sx of [-0.32, 0.32]) {
    const vLantern = b.part(
      new THREE.BoxGeometry(0.08, 0.12, 0.08),
      "#ffaa38",
      {
        bone: root,
        at: [sx, DECK_Y + 0.08, SHRINE_Z + 0.28],
      }
    );
    glow(vLantern, 1.6);
    b.part(new THREE.BoxGeometry(0.09, 0.015, 0.09), BLACK_LACQUER, {
      bone: root,
      at: [sx, DECK_Y + 0.145, SHRINE_Z + 0.28],
    });
    b.part(new THREE.BoxGeometry(0.09, 0.015, 0.09), BLACK_LACQUER, {
      bone: root,
      at: [sx, DECK_Y + 0.015, SHRINE_Z + 0.28],
    });
  }

  // Wooden steps (Kizahashi) leading up to veranda
  for (let s = 1; s <= 3; s++) {
    b.part(new THREE.BoxGeometry(0.32, 0.04, 0.09), HINOKI_WOOD, {
      bone: root,
      at: [0, 0.24 + (s - 1) * 0.045, SHRINE_Z + 0.38 + s * 0.075],
    });
  }

  // ---------------------------------------------------------------------------
  // 6. Shrine Swept Roof (Irimoya-zukuri with Chigi & Katsuogi)
  // ---------------------------------------------------------------------------

  // Under-eave bracket complex (Kumimono) & rafter extensions (Taruki)
  b.part(new THREE.BoxGeometry(0.72, 0.05, 0.62), VERMILION, {
    bone: root,
    at: [0, DECK_Y + 0.53, SHRINE_Z - 0.04],
  });
  for (let rx = -0.32; rx <= 0.32; rx += 0.08) {
    b.part(new THREE.BoxGeometry(0.03, 0.03, 0.74), DARK_TIMBER, {
      bone: root,
      at: [rx, DECK_Y + 0.55, SHRINE_Z - 0.04],
    });
    // Gold capped rafter ends
    b.part(new THREE.BoxGeometry(0.032, 0.032, 0.02), GOLD, {
      bone: root,
      at: [rx, DECK_Y + 0.55, SHRINE_Z + 0.33],
    });
    b.part(new THREE.BoxGeometry(0.032, 0.032, 0.02), GOLD, {
      bone: root,
      at: [rx, DECK_Y + 0.55, SHRINE_Z - 0.41],
    });
  }

  // Main curved roof ridgepole
  const roofRidge = catmull([
    [0, DECK_Y + 0.85, SHRINE_Z + 0.44],
    [0, DECK_Y + 0.83, SHRINE_Z],
    [0, DECK_Y + 0.85, SHRINE_Z - 0.52],
  ]);
  b.sweep(roofRidge, 0.05, {
    bone: root,
    section: "box",
    color: BLACK_LACQUER,
  });

  // Sweeping flared eaves in weathered copper-teal
  b.part(new THREE.BoxGeometry(1.06, 0.06, 0.9), ROOF_TEAL, {
    bone: root,
    at: [0, DECK_Y + 0.58, SHRINE_Z - 0.04],
  });
  b.part(new THREE.BoxGeometry(0.94, 0.08, 0.78), ROOF_TEAL, {
    bone: root,
    at: [0, DECK_Y + 0.63, SHRINE_Z - 0.04],
  });
  b.part(new THREE.BoxGeometry(0.78, 0.08, 0.66), ROOF_TEAL_LIGHT, {
    bone: root,
    at: [0, DECK_Y + 0.68, SHRINE_Z - 0.04],
  });

  // Flared eave corner ornaments
  for (const sx of [-0.52, 0.52]) {
    for (const sz of [0.39, -0.47]) {
      b.part(new THREE.ConeGeometry(0.03, 0.08, 4), GOLD, {
        bone: root,
        at: [sx, DECK_Y + 0.61, SHRINE_Z - 0.04 + sz],
        rotation: [0, 45, sx > 0 ? -30 : 30],
      });
    }
  }

  // Chigi: crossed ceremonial roof finials
  for (const rz of [SHRINE_Z + 0.38, SHRINE_Z - 0.46]) {
    b.part(new THREE.BoxGeometry(0.04, 0.34, 0.04), VERMILION, {
      bone: root,
      at: [-0.06, DECK_Y + 0.88, rz],
      rotation: [0, 0, -38],
    });
    b.part(new THREE.BoxGeometry(0.044, 0.09, 0.044), GOLD, {
      bone: root,
      at: [-0.15, DECK_Y + 0.98, rz],
      rotation: [0, 0, -38],
    });

    b.part(new THREE.BoxGeometry(0.04, 0.34, 0.04), VERMILION, {
      bone: root,
      at: [0.06, DECK_Y + 0.88, rz],
      rotation: [0, 0, 38],
    });
    b.part(new THREE.BoxGeometry(0.044, 0.09, 0.044), GOLD, {
      bone: root,
      at: [0.15, DECK_Y + 0.98, rz],
      rotation: [0, 0, 38],
    });
  }

  // Katsuogi: cylindrical transverse log weights along the ridge
  const katsuogiZ = [SHRINE_Z + 0.18, SHRINE_Z - 0.04, SHRINE_Z - 0.26];
  katsuogiZ.forEach((kz) => {
    b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.28, 10), BLACK_LACQUER, {
      bone: root,
      at: [0, DECK_Y + 0.83, kz],
      rotation: [0, 0, 90],
    });
    // Gold center & end bands
    b.part(new THREE.CylinderGeometry(0.046, 0.046, 0.04, 10), GOLD, {
      bone: root,
      at: [0, DECK_Y + 0.83, kz],
      rotation: [0, 0, 90],
    });
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 10), GOLD, {
      bone: root,
      at: [-0.12, DECK_Y + 0.83, kz],
      rotation: [0, 0, 90],
    });
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 10), GOLD, {
      bone: root,
      at: [0.12, DECK_Y + 0.83, kz],
      rotation: [0, 0, 90],
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Stone Kitsune (Fox Guardian Statue - Foreground Left Staging)
  // ---------------------------------------------------------------------------
  const FOX_X = -0.76;
  const FOX_Z = 0.5;

  // Carved double stone plinth (anchored securely on ground)
  b.part(new THREE.BoxGeometry(0.42, 0.12, 0.44), STONE_PAINT, {
    bone: kitsuneJoint,
    at: [FOX_X, 0.1, FOX_Z],
  });
  b.part(new THREE.BoxGeometry(0.34, 0.1, 0.36), STONE_PAINT, {
    bone: kitsuneJoint,
    at: [FOX_X, 0.21, FOX_Z],
  });

  // Fox seated body: haunches & planted forelegs
  b.part(new THREE.CylinderGeometry(0.12, 0.16, 0.24, 8), STONE_PAINT, {
    bone: kitsuneJoint,
    at: [FOX_X, 0.37, FOX_Z - 0.04],
  });
  // Upright chest and shoulders
  b.part(new THREE.ConeGeometry(0.13, 0.32, 8), STONE_PAINT, {
    bone: kitsuneJoint,
    at: [FOX_X, 0.56, FOX_Z + 0.02],
    rotation: [-8, 0, 0],
  });
  // Front legs
  for (const s of [1, -1]) {
    b.rod(
      [FOX_X + s * 0.065, 0.53, FOX_Z + 0.09],
      [FOX_X + s * 0.065, 0.27, FOX_Z + 0.1],
      0.028,
      STONE_PAINT,
      { bone: kitsuneJoint }
    );
    // Paws
    b.part(new THREE.BoxGeometry(0.045, 0.03, 0.06), STONE_PAINT, {
      bone: kitsuneJoint,
      at: [FOX_X + s * 0.065, 0.275, FOX_Z + 0.12],
    });
  }

  // Fox Head: alert, slender muzzle, upright ears
  b.part(new THREE.SphereGeometry(0.08, 8, 8), STONE_PAINT, {
    bone: kitsuneJoint,
    at: [FOX_X, 0.75, FOX_Z + 0.05],
    scale: [0.9, 1, 1.1],
  });
  // Snout
  b.part(new THREE.ConeGeometry(0.045, 0.11, 6), STONE_PAINT, {
    bone: kitsuneJoint,
    at: [FOX_X, 0.73, FOX_Z + 0.15],
    rotation: [82, 0, 0],
  });
  // Nose tip
  b.part(new THREE.SphereGeometry(0.014, 6, 6), BLACK_LACQUER, {
    bone: kitsuneJoint,
    at: [FOX_X, 0.745, FOX_Z + 0.21],
  });
  // Fox Ears
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.035, 0.1, 4), STONE_PAINT, {
      bone: kitsuneJoint,
      at: [FOX_X + s * 0.05, 0.84, FOX_Z + 0.03],
      rotation: [12, s * -15, s * -18],
    });
  }

  // Upward-sweeping elegant fox tail
  const tailPath = catmull([
    [FOX_X, 0.33, FOX_Z - 0.14],
    [FOX_X + 0.05, 0.49, FOX_Z - 0.18],
    [FOX_X + 0.08, 0.65, FOX_Z - 0.12],
    [FOX_X + 0.05, 0.79, FOX_Z - 0.04],
    [FOX_X, 0.85, FOX_Z],
  ]);
  b.sweep(tailPath, (t) => 0.03 + Math.sin(t * Math.PI) * 0.04, {
    bone: kitsuneJoint,
    color: STONE_PAINT,
  });

  // Fox Ceremonial Red Bib (Maekake) with embroidered texture
  b.part(new THREE.PlaneGeometry(0.18, 0.22), "#ffffff", {
    bone: kitsuneJoint,
    at: [FOX_X, 0.54, FOX_Z + 0.12],
    dir: [0, 0.2, 1],
    axis: "z",
    rotation: [-14, 0, 0],
    texture: KITSUNE_BIB_TEX,
  });

  // Sacred Scroll (Makimono) held crosswise in jaws
  b.rod(
    [FOX_X - 0.1, 0.72, FOX_Z + 0.14],
    [FOX_X + 0.1, 0.72, FOX_Z + 0.14],
    0.016,
    WHITE_WASHI,
    { bone: kitsuneJoint }
  );
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 8), GOLD, {
    bone: kitsuneJoint,
    at: [FOX_X - 0.1, 0.72, FOX_Z + 0.14],
    rotation: [0, 0, 90],
  });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 8), GOLD, {
    bone: kitsuneJoint,
    at: [FOX_X + 0.1, 0.72, FOX_Z + 0.14],
    rotation: [0, 0, 90],
  });

  // ---------------------------------------------------------------------------
  // 8. Stone Toro Lanterns (Warm Golden Emissive Core)
  // ---------------------------------------------------------------------------

  function makeStoneLantern(x: number, z: number, scale = 1.0) {
    const s = scale;
    // Kiso (Stone base plinth)
    b.part(new THREE.CylinderGeometry(0.22 * s, 0.25 * s, 0.1 * s, 8), STONE_PAINT, {
      bone: root,
      at: [x, 0.08 * s, z],
    });
    // Sao (Column post)
    b.rod([x, 0.13 * s, z], [x, 0.58 * s, z], 0.075 * s, STONE_PAINT, {
      bone: root,
    });
    b.part(new THREE.TorusGeometry(0.08 * s, 0.02 * s, 6, 12), STONE_PAINT, {
      bone: root,
      at: [x, 0.35 * s, z],
      rotation: [90, 0, 0],
    });
    // Chudai (Middle flared shelf)
    b.part(new THREE.CylinderGeometry(0.25 * s, 0.14 * s, 0.08 * s, 6), STONE_PAINT, {
      bone: root,
      at: [x, 0.62 * s, z],
    });

    // Hibukuro (Fire chamber with glowing core)
    const fireboxCore = b.part(
      new THREE.CylinderGeometry(0.13 * s, 0.13 * s, 0.22 * s, 6),
      "#ffa638",
      {
        bone: root,
        at: [x, 0.77 * s, z],
      }
    );
    glow(fireboxCore, 1.9);

    // Stone chamber corner posts
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const px = x + Math.cos(angle) * 0.145 * s;
      const pz = z + Math.sin(angle) * 0.145 * s;
      b.rod([px, 0.66 * s, pz], [px, 0.88 * s, pz], 0.018 * s, STONE_PAINT, {
        bone: root,
      });
    }

    // Kasa (Umbrella stone roof)
    b.part(new THREE.ConeGeometry(0.32 * s, 0.16 * s, 6), STONE_PAINT, {
      bone: root,
      at: [x, 0.96 * s, z],
    });
    // Warabite flared corner tips
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const rx = x + Math.cos(angle) * 0.3 * s;
      const rz = z + Math.sin(angle) * 0.3 * s;
      b.part(new THREE.BoxGeometry(0.04 * s, 0.03 * s, 0.04 * s), STONE_PAINT, {
        bone: root,
        at: [rx, 0.89 * s, rz],
        rotation: [0, i * 60, 20],
      });
    }

    // Hoju (Lotus base & sacred jewel finial)
    b.part(new THREE.CylinderGeometry(0.08 * s, 0.04 * s, 0.05 * s, 8), STONE_PAINT, {
      bone: root,
      at: [x, 1.06 * s, z],
    });
    b.part(new THREE.SphereGeometry(0.06 * s, 8, 8), STONE_PAINT, {
      bone: root,
      at: [x, 1.12 * s, z],
      scale: [1, 1.3, 1],
    });
  }

  // Front right lantern (Primary greeting landmark)
  makeStoneLantern(0.78, 0.5, 1.0);
  // Rear shrine terrace lantern (Secondary intimate light)
  makeStoneLantern(0.68, -0.42, 0.78);

  // ---------------------------------------------------------------------------
  // 9. Hanging Andon Paper Lantern (Suspended from Torii Nuki)
  // ---------------------------------------------------------------------------
  const ANDON_X = 0.56;
  const ANDON_Y = 1.38;
  const ANDON_Z = TORII_Z + 0.1;

  // Suspension chain & bracket from Torii
  b.rod([ANDON_X, 1.7, TORII_Z], [ANDON_X, ANDON_Y + 0.18, ANDON_Z], 0.008, BLACK_LACQUER, {
    bone: root,
  });
  b.part(new THREE.TorusGeometry(0.024, 0.006, 6, 12), GOLD, {
    bone: root,
    at: [ANDON_X, ANDON_Y + 0.17, ANDON_Z],
  });

  // Lantern wooden roof cap
  b.part(new THREE.ConeGeometry(0.14, 0.06, 4), BLACK_LACQUER, {
    bone: root,
    at: [ANDON_X, ANDON_Y + 0.14, ANDON_Z],
    rotation: [0, 45, 0],
  });

  // Glowing paper lantern body
  const andonCore = b.part(
    new THREE.BoxGeometry(0.15, 0.2, 0.15),
    "#ffaa38",
    {
      bone: root,
      at: [ANDON_X, ANDON_Y, ANDON_Z],
    }
  );
  glow(andonCore, 2.0);

  // Washi windows with Kumiko pattern
  for (const [dx, dz, rotY] of [
    [0, 0.078, 0],
    [0, -0.078, 180],
    [0.078, 0, 90],
    [-0.078, 0, -90],
  ]) {
    const win = b.part(new THREE.PlaneGeometry(0.14, 0.19), "#ffffff", {
      bone: root,
      at: [ANDON_X + dx, ANDON_Y, ANDON_Z + dz],
      dir: [dx, 0, dz],
      axis: "z",
      rotation: [0, rotY, 0],
      texture: LANTERN_WINDOW_TEX,
    });
    glow(win, 1.6);
  }

  // Black lacquer bottom frame & red silk tassel
  b.part(new THREE.BoxGeometry(0.16, 0.02, 0.16), BLACK_LACQUER, {
    bone: root,
    at: [ANDON_X, ANDON_Y - 0.11, ANDON_Z],
  });
  b.rod(
    [ANDON_X, ANDON_Y - 0.12, ANDON_Z],
    [ANDON_X, ANDON_Y - 0.22, ANDON_Z],
    0.008,
    CRIMSON_CORD,
    { bone: root }
  );
  b.part(new THREE.ConeGeometry(0.02, 0.07, 8), CRIMSON_CORD, {
    bone: root,
    at: [ANDON_X, ANDON_Y - 0.25, ANDON_Z],
    rotation: [180, 0, 0],
  });

  // ---------------------------------------------------------------------------
  // 10. Ritual Offerings: Sanbo, Tricolor Dango, Saké & Saisenbako
  // ---------------------------------------------------------------------------
  const TABLE_X = 0.0;
  const TABLE_Y = 0.28;
  const TABLE_Z = -0.22;

  // Altar Table (Hinoki wood low offering stand)
  b.part(new THREE.BoxGeometry(0.52, 0.04, 0.26), HINOKI_WOOD, {
    bone: root,
    at: [TABLE_X, TABLE_Y, TABLE_Z],
  });
  // Table legs
  for (const sx of [-0.22, 0.22]) {
    for (const sz of [-0.09, 0.09]) {
      b.rod(
        [TABLE_X + sx, 0.16, TABLE_Z + sz],
        [TABLE_X + sx, TABLE_Y, TABLE_Z + sz],
        0.016,
        HINOKI_WOOD,
        { bone: root }
      );
    }
  }

  // Sanbo (Ceremonial Square Offering Stand)
  const SANBO_Y = TABLE_Y + 0.02;
  b.part(new THREE.BoxGeometry(0.18, 0.02, 0.18), HINOKI_WOOD, {
    bone: root,
    at: [TABLE_X - 0.1, SANBO_Y + 0.07, TABLE_Z],
  });
  b.part(new THREE.BoxGeometry(0.12, 0.06, 0.12), HINOKI_WOOD, {
    bone: root,
    at: [TABLE_X - 0.1, SANBO_Y + 0.03, TABLE_Z],
  });
  // Sanbo rim lips
  b.part(new THREE.BoxGeometry(0.18, 0.025, 0.012), HINOKI_WOOD, {
    bone: root,
    at: [TABLE_X - 0.1, SANBO_Y + 0.085, TABLE_Z + 0.085],
  });
  b.part(new THREE.BoxGeometry(0.18, 0.025, 0.012), HINOKI_WOOD, {
    bone: root,
    at: [TABLE_X - 0.1, SANBO_Y + 0.085, TABLE_Z - 0.085],
  });
  b.part(new THREE.BoxGeometry(0.012, 0.025, 0.18), HINOKI_WOOD, {
    bone: root,
    at: [TABLE_X - 0.19, SANBO_Y + 0.085, TABLE_Z],
  });
  b.part(new THREE.BoxGeometry(0.012, 0.025, 0.18), HINOKI_WOOD, {
    bone: root,
    at: [TABLE_X - 0.01, SANBO_Y + 0.085, TABLE_Z],
  });

  // Hanami Dango (Tricolor Rice Dumplings on Bamboo Skewers)
  const DANGO_PINK = "#f59aa6";
  const DANGO_WHITE = "#faf7f2";
  const DANGO_GREEN = "#78a85a";

  for (let sk = 0; sk < 2; sk++) {
    const dZ = TABLE_Z - 0.03 + sk * 0.055;
    b.rod(
      [TABLE_X - 0.17, SANBO_Y + 0.1, dZ],
      [TABLE_X - 0.03, SANBO_Y + 0.1, dZ],
      0.0035,
      "#d9be8b",
      { bone: root }
    );
    b.part(new THREE.SphereGeometry(0.016, 8, 8), DANGO_GREEN, {
      bone: root,
      at: [TABLE_X - 0.14, SANBO_Y + 0.1, dZ],
    });
    b.part(new THREE.SphereGeometry(0.016, 8, 8), DANGO_WHITE, {
      bone: root,
      at: [TABLE_X - 0.1, SANBO_Y + 0.1, dZ],
    });
    b.part(new THREE.SphereGeometry(0.016, 8, 8), DANGO_PINK, {
      bone: root,
      at: [TABLE_X - 0.06, SANBO_Y + 0.1, dZ],
    });
  }

  // White porcelain Saké Tokkuri (Flask) & Ochoko (Cup)
  const CERAMIC_WHITE = "#f0ede6";
  const COBALT_BLUE = "#244d7a";

  b.part(new THREE.CylinderGeometry(0.022, 0.032, 0.07, 10), CERAMIC_WHITE, {
    bone: root,
    at: [TABLE_X + 0.08, TABLE_Y + 0.055, TABLE_Z - 0.04],
  });
  b.part(new THREE.CylinderGeometry(0.012, 0.018, 0.03, 10), CERAMIC_WHITE, {
    bone: root,
    at: [TABLE_X + 0.08, TABLE_Y + 0.1, TABLE_Z - 0.04],
  });
  b.part(new THREE.TorusGeometry(0.026, 0.004, 6, 12), COBALT_BLUE, {
    bone: root,
    at: [TABLE_X + 0.08, TABLE_Y + 0.06, TABLE_Z - 0.04],
    rotation: [90, 0, 0],
  });
  b.part(new THREE.CylinderGeometry(0.016, 0.01, 0.022, 8), CERAMIC_WHITE, {
    bone: root,
    at: [TABLE_X + 0.07, TABLE_Y + 0.031, TABLE_Z + 0.04],
  });

  // Persimmon offering
  b.part(new THREE.SphereGeometry(0.022, 8, 8), "#f26822", {
    bone: root,
    at: [TABLE_X + 0.16, TABLE_Y + 0.04, TABLE_Z - 0.02],
    scale: [1, 0.85, 1],
  });
  b.part(new THREE.ConeGeometry(0.008, 0.014, 4), "#486e2e", {
    bone: root,
    at: [TABLE_X + 0.16, TABLE_Y + 0.06, TABLE_Z - 0.02],
  });

  // Saisenbako (Coin Offering Box) positioned near front threshold
  const BOX_X = 0.36;
  const BOX_Y = 0.18;
  const BOX_Z = 0.05;

  b.part(new THREE.BoxGeometry(0.24, 0.14, 0.18), DARK_TIMBER, {
    bone: root,
    at: [BOX_X, BOX_Y, BOX_Z],
  });
  for (let gx = -0.09; gx <= 0.09; gx += 0.036) {
    b.part(new THREE.BoxGeometry(0.014, 0.015, 0.16), BLACK_LACQUER, {
      bone: root,
      at: [BOX_X + gx, BOX_Y + 0.072, BOX_Z],
    });
  }
  for (const sx of [-0.115, 0.115]) {
    for (const sz of [-0.085, 0.085]) {
      b.part(new THREE.BoxGeometry(0.025, 0.04, 0.025), GOLD, {
        bone: root,
        at: [BOX_X + sx, BOX_Y + 0.055, BOX_Z + sz],
      });
    }
  }
  // Front crest plate
  b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.008, 12), GOLD, {
    bone: root,
    at: [BOX_X, BOX_Y, BOX_Z + 0.092],
    rotation: [90, 0, 0],
  });
  // Mora coins
  b.part(new THREE.CylinderGeometry(0.015, 0.015, 0.004, 8), GOLD_BRIGHT, {
    bone: root,
    at: [BOX_X - 0.03, BOX_Y + 0.085, BOX_Z + 0.02],
    rotation: [12, 25, 0],
  });
  b.part(new THREE.CylinderGeometry(0.015, 0.015, 0.004, 8), GOLD_BRIGHT, {
    bone: root,
    at: [BOX_X + 0.02, BOX_Y + 0.085, BOX_Z - 0.03],
    rotation: [-8, -40, 0],
  });

  // ---------------------------------------------------------------------------
  // 11. Ema Prayer Plaque Rack & Fluttering Talismans
  // ---------------------------------------------------------------------------
  const EMA_RACK_X = -0.92;
  const EMA_RACK_Z = -0.42;

  // Rustic cedar post and crossbar rack
  b.rod(
    [EMA_RACK_X - 0.18, 0.12, EMA_RACK_Z],
    [EMA_RACK_X - 0.18, 1.05, EMA_RACK_Z],
    0.022,
    DARK_TIMBER,
    { bone: root }
  );
  b.rod(
    [EMA_RACK_X + 0.18, 0.12, EMA_RACK_Z],
    [EMA_RACK_X + 0.18, 1.05, EMA_RACK_Z],
    0.022,
    DARK_TIMBER,
    { bone: root }
  );
  b.rod(
    [EMA_RACK_X - 0.22, 0.95, EMA_RACK_Z],
    [EMA_RACK_X + 0.22, 0.95, EMA_RACK_Z],
    0.016,
    DARK_TIMBER,
    { bone: root }
  );
  b.rod(
    [EMA_RACK_X - 0.22, 0.75, EMA_RACK_Z],
    [EMA_RACK_X + 0.22, 0.75, EMA_RACK_Z],
    0.016,
    DARK_TIMBER,
    { bone: root }
  );

  // Hanging Ema plaques
  b.part(new THREE.PlaneGeometry(0.12, 0.09), "#ffffff", {
    bone: emaHinge1,
    at: [EMA_RACK_X - 0.08, 0.88, EMA_RACK_Z + 0.02],
    dir: [0, 0, 1],
    axis: "z",
    rotation: [4, 8, -6],
    texture: EMA_TEX,
  });
  b.rod(
    [EMA_RACK_X - 0.08, 0.95, EMA_RACK_Z],
    [EMA_RACK_X - 0.08, 0.92, EMA_RACK_Z + 0.02],
    0.003,
    CRIMSON_CORD,
    { bone: emaHinge1 }
  );

  b.part(new THREE.PlaneGeometry(0.12, 0.09), "#ffffff", {
    bone: emaHinge2,
    at: [EMA_RACK_X + 0.08, 0.86, EMA_RACK_Z + 0.02],
    dir: [0, 0, 1],
    axis: "z",
    rotation: [-3, -6, 8],
    texture: EMA_TEX,
  });
  b.rod(
    [EMA_RACK_X + 0.08, 0.95, EMA_RACK_Z],
    [EMA_RACK_X + 0.08, 0.9, EMA_RACK_Z + 0.02],
    0.003,
    CRIMSON_CORD,
    { bone: emaHinge2 }
  );

  // Sacred Ofuda paper talismans on torii pillar and rock
  b.part(new THREE.PlaneGeometry(0.06, 0.14), "#ffffff", {
    bone: root,
    at: [-0.68, 0.95, TORII_Z + 0.085],
    dir: [0, 0, 1],
    axis: "z",
    rotation: [0, 0, -3],
    texture: OFUDA_TEX,
  });
  b.part(new THREE.PlaneGeometry(0.06, 0.14), "#ffffff", {
    bone: root,
    at: [1.14, 0.28, 0.72],
    dir: [-0.2, 0.1, 1],
    axis: "z",
    rotation: [-10, -22, 8],
    texture: OFUDA_TEX,
  });

  // ---------------------------------------------------------------------------
  // 12. Shrine Nobori Banner (Right Border Landmark)
  // ---------------------------------------------------------------------------
  const BANNER_X = 1.14;
  const BANNER_Z = 0.1;

  // Carved stone plinth securing the banner
  b.part(new THREE.BoxGeometry(0.18, 0.12, 0.18), STONE_PAINT, {
    bone: bannerHinge,
    at: [BANNER_X, 0.06, BANNER_Z],
  });

  // Tall green bamboo mast pole
  b.rod(
    [BANNER_X, 0.06, BANNER_Z],
    [BANNER_X, 2.15, BANNER_Z],
    0.024,
    "#7e9458",
    { bone: bannerHinge }
  );
  // Bamboo segments
  for (let by = 0.45; by <= 2.0; by += 0.35) {
    b.part(new THREE.TorusGeometry(0.026, 0.005, 6, 12), "#586e38", {
      bone: bannerHinge,
      at: [BANNER_X, by, BANNER_Z],
      rotation: [90, 0, 0],
    });
  }
  // Top cross arm
  b.rod(
    [BANNER_X, 2.05, BANNER_Z],
    [BANNER_X - 0.28, 2.05, BANNER_Z],
    0.012,
    "#586e38",
    { bone: bannerHinge }
  );

  // Vertical cloth banner
  b.part(new THREE.PlaneGeometry(0.24, 0.8), "#ffffff", {
    bone: bannerHinge,
    at: [BANNER_X - 0.13, 1.62, BANNER_Z + 0.01],
    dir: [0, 0, 1],
    axis: "z",
    rotation: [2, -6, 1],
    texture: BANNER_TEX,
  });

  // ---------------------------------------------------------------------------
  // 13. Sacred Inazuma Sakura Tree (Cherry Blossom Canopy)
  // ---------------------------------------------------------------------------
  const TREE_X = 0.82;
  const TREE_Z = -0.78;

  // Gnarled, twisting plum-cedar trunk rising behind the shrine
  const sakuraTrunk = catmull([
    [TREE_X + 0.06, 0.12, TREE_Z - 0.06],
    [TREE_X, 0.68, TREE_Z],
    [TREE_X - 0.1, 1.3, TREE_Z + 0.05],
    [TREE_X - 0.22, 1.82, TREE_Z + 0.1],
    [TREE_X - 0.36, 2.22, TREE_Z + 0.14],
  ]);
  b.sweep(sakuraTrunk, (t) => 0.12 * (1 - t * 0.52), {
    bone: root,
    color: PLUM_BARK,
  });

  // Arching boughs extending across the shrine roof
  const bough1 = catmull([
    [TREE_X - 0.22, 1.82, TREE_Z + 0.1],
    [TREE_X - 0.5, 2.02, TREE_Z + 0.18],
    [TREE_X - 0.78, 2.12, TREE_Z + 0.14],
  ]);
  b.sweep(bough1, (t) => 0.06 * (1 - t * 0.48), {
    bone: root,
    color: PLUM_BARK,
  });

  const bough2 = catmull([
    [TREE_X - 0.1, 1.3, TREE_Z + 0.05],
    [TREE_X + 0.2, 1.6, TREE_Z + 0.02],
    [TREE_X + 0.42, 1.76, TREE_Z - 0.06],
  ]);
  b.sweep(bough2, (t) => 0.052 * (1 - t * 0.5), {
    bone: root,
    color: PLUM_BARK,
  });

  // Tiered Sakura blossom foliage clouds in vibrant anime tones
  const sakuraClumps = [
    { at: [TREE_X - 0.8, 2.16, TREE_Z + 0.14], r: 0.35, scale: [1.25, 0.6, 1.15] },
    { at: [TREE_X - 0.4, 2.3, TREE_Z + 0.16], r: 0.4, scale: [1.3, 0.65, 1.2] },
    { at: [TREE_X - 0.06, 2.38, TREE_Z + 0.06], r: 0.34, scale: [1.15, 0.55, 1.05] },
    { at: [TREE_X + 0.42, 1.82, TREE_Z - 0.06], r: 0.3, scale: [1.2, 0.55, 1.1] },
    { at: [TREE_X + 0.16, 1.68, TREE_Z - 0.03], r: 0.28, scale: [1.1, 0.5, 1.05] },
    { at: [TREE_X - 0.56, 1.94, TREE_Z + 0.22], r: 0.3, scale: [1.2, 0.55, 1.1] },
  ];

  sakuraClumps.forEach((sc, idx) => {
    // Deep magenta/pink core cloud
    b.part(new THREE.DodecahedronGeometry(sc.r, 1), SAKURA_DEEP, {
      bone: root,
      at: sc.at,
      scale: sc.scale,
      rotation: [idx * 15, idx * 30, 0],
    });
    // Lighter mid-pink middle volume
    b.part(new THREE.DodecahedronGeometry(sc.r * 0.9, 1), SAKURA_MID, {
      bone: root,
      at: [sc.at[0], sc.at[1] + 0.03, sc.at[2]],
      scale: [sc.scale[0] * 0.95, sc.scale[1] * 0.9, sc.scale[2] * 0.95],
      rotation: [idx * 25, idx * 40, 0],
    });
    // Soft illuminated highlight top dome
    b.part(new THREE.DodecahedronGeometry(sc.r * 0.75, 1), SAKURA_LIGHT, {
      bone: root,
      at: [sc.at[0], sc.at[1] + 0.06, sc.at[2]],
      scale: [sc.scale[0] * 0.9, sc.scale[1] * 0.8, sc.scale[2] * 0.9],
      rotation: [idx * 35, idx * 50, 0],
    });
  });

  // Tied white Omikuji fortune papers on the lower sakura branch
  for (let ok = 0; ok < 3; ok++) {
    b.rod(
      [TREE_X + 0.1 + ok * 0.08, 1.55 - ok * 0.04, TREE_Z + 0.02],
      [TREE_X + 0.1 + ok * 0.08, 1.48 - ok * 0.04, TREE_Z + 0.03],
      0.006,
      WHITE_WASHI,
      { bone: root }
    );
  }

  // ---------------------------------------------------------------------------
  // 14. Drifting Sakura Blossom Petals & Sacred Bamboo Grass
  // ---------------------------------------------------------------------------

  const petalCoords = [
    [0.12, 0.09, 0.92],
    [-0.15, 0.13, 0.7],
    [0.08, 0.16, 0.46],
    [-0.05, 0.19, 0.24],
    [0.14, 0.23, 0.01],
    [-0.18, 0.26, -0.19],
    [-0.72, 0.32, 0.58],
    [-0.8, 0.32, 0.44],
    [0.34, 0.29, -0.22],
    [0.76, 0.19, 0.5],
    [-0.32, 0.39, -0.62],
  ];

  petalCoords.forEach(([px, py, pz], i) => {
    b.part(new THREE.CircleGeometry(0.018, 5), SAKURA_LIGHT, {
      bone: root,
      at: [px, py + 0.003, pz],
      rotation: [-90, 0, i * 37],
    });
  });

  // Sasa bamboo grass tufts around rock bases
  const BAMBOO_GREEN = "#557d38";
  const grassLocs = [
    [-1.12, 0.06, 0.52],
    [-1.2, 0.06, 0.78],
    [1.18, 0.06, 0.48],
    [1.25, 0.06, 0.75],
    [-1.22, 0.06, -0.28],
    [1.02, 0.06, -0.68],
  ];

  grassLocs.forEach(([gx, gy, gz], idx) => {
    for (let blade = 0; blade < 4; blade++) {
      const bAngle = (blade * 90 + idx * 35) * (Math.PI / 180);
      b.part(new THREE.ConeGeometry(0.018, 0.14, 3), BAMBOO_GREEN, {
        bone: root,
        at: [gx + Math.cos(bAngle) * 0.04, gy + 0.06, gz + Math.sin(bAngle) * 0.04],
        rotation: [Math.sin(bAngle) * 22, blade * 45, -Math.cos(bAngle) * 22],
      });
    }
  });

  return b.root;
}
