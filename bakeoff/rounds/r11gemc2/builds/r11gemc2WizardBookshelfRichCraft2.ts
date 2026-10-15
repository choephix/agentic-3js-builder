import * as THREE from "three";
import {
  createBuilder,
  grain,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Wizard's Bookshelf",
  description:
    "A high-fantasy anime wizard's bookshelf laden with ancient grimoires, illuminated spell scrolls, glowing divination orbs, potion vials, dripping candles, and a sleeping celestial familiar.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "wizards_bookshelf" });
  const root = b.joint("root", { at: [0, 0, 0] });

  // ---------------------------------------------------------------------------
  // Materials & Shaders
  // ---------------------------------------------------------------------------
  // Warm, lustrous polished anime mahogany
  const WOOD = grain("#4a2416", "#32160d", { size: 0.04, axis: "y" });
  const WOOD_TRIM = grain("#63301c", "#411d10", { size: 0.03, axis: "x" });
  const WOOD_DARK = "#241008";
  const WOOD_INLAY = "#5c2b18";

  // Arcane Gilded Metallics
  const BRASS = "#e2b246";
  const BRASS_DARK = "#7a541e";
  const BRASS_LIGHT = "#fae88a";
  const IRON = "#282530";

  // Grimoire Jewel Leather Tones
  const LEATHER_NAVY = "#16284d";
  const LEATHER_RUBY = "#7a1426";
  const LEATHER_VIOLET = "#431861";
  const LEATHER_EMERALD = "#144a2e";
  const LEATHER_AMBER = "#945116";
  const LEATHER_OBSIDIAN = "#1c1a24";
  const LEATHER_TEAL = "#12494d";

  // Alchemical & Natural Elements
  const PAPER = "#f5e7cc";
  const WAX = "#fbf1db";
  const WAX_MELT = "#e6d7b9";
  const CORK = "#a67347";
  const HERB_GREEN = "#3d5c38";
  const HERB_FLOWER = "#8a529e";
  const VELVET_PLUM = "#3a133b";

  // Radiant Glowing Magic
  const GLOW_CYAN = "#42f5ff";
  const GLOW_MAGENTA = "#ff3b94";
  const GLOW_EMERALD = "#38ff8b";
  const GLOW_AMBER = "#ffaa33";
  const GLOW_AMETHYST = "#b14dff";
  const GLOW_GOLD = "#ffe16b";
  const FLAME_OUTER = "#ff7200";
  const FLAME_CORE = "#ffffff";

  // ---------------------------------------------------------------------------
  // High-Resolution SVG Textures
  // ---------------------------------------------------------------------------

  // 1. Arcane Celestial Rug (Floor Dais)
  const MAGIC_RUG_TEXTURE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <circle cx="256" cy="256" r="252" fill="#141426" stroke="#d4a344" stroke-width="6"/>
      <circle cx="256" cy="256" r="240" fill="#1e1c38" stroke="#876324" stroke-width="2"/>
      <circle cx="256" cy="256" r="226" fill="none" stroke="#e5b448" stroke-width="3" stroke-dasharray="6 8"/>
      <circle cx="256" cy="256" r="196" fill="#181730" stroke="#d4a344" stroke-width="4"/>
      <!-- Interlocking 12-Point Star Octagrams -->
      <polygon points="256,66 390,196 390,316 256,446 122,316 122,196" fill="none" stroke="#7e4eb8" stroke-width="2.5"/>
      <polygon points="256,66 390,196 390,316 256,446 122,316 122,196" fill="none" stroke="#42f5ff" stroke-width="2.5" transform="rotate(30 256 256)"/>
      <polygon points="256,66 390,196 390,316 256,446 122,316 122,196" fill="none" stroke="#e5b448" stroke-width="2.5" transform="rotate(60 256 256)"/>
      <!-- Zodiac Ring -->
      <circle cx="256" cy="256" r="122" fill="#242142" stroke="#d4a344" stroke-width="3.5"/>
      <circle cx="256" cy="256" r="108" fill="none" stroke="#fae88a" stroke-width="1.8" stroke-dasharray="4 6"/>
      <!-- Sunburst & Crescent Core -->
      <circle cx="256" cy="256" r="54" fill="#d4a344"/>
      <circle cx="256" cy="256" r="46" fill="#1e1c38"/>
      <path d="M256 210 A46 46 0 0 0 256 302 A32 46 0 0 1 256 210" fill="#fae88a"/>
      <circle cx="280" cy="242" r="4" fill="#ffffff"/>
      <circle cx="294" cy="256" r="3" fill="#ffffff"/>
      <circle cx="280" cy="270" r="4" fill="#ffffff"/>
      <line x1="256" y1="20" x2="256" y2="492" stroke="#d4a344" stroke-width="1.5" stroke-dasharray="8 6"/>
      <line x1="20" y1="256" x2="492" y2="256" stroke="#d4a344" stroke-width="1.5" stroke-dasharray="8 6"/>
    </svg>`,
    { size: 512 }
  );

  // 2. Grimoire Cover A: Celestial Moon & Stars
  const BOOK_COVER_A = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 220">
      <rect width="160" height="220" rx="6" fill="#141f36"/>
      <rect x="8" y="8" width="144" height="204" rx="4" fill="none" stroke="#e2b246" stroke-width="3"/>
      <rect x="14" y="14" width="132" height="192" rx="2" fill="none" stroke="#876324" stroke-width="1.2" stroke-dasharray="3 3"/>
      <path d="M14 36 Q36 36 36 14" fill="none" stroke="#fae88a" stroke-width="2.5"/>
      <path d="M146 36 Q124 36 124 14" fill="none" stroke="#fae88a" stroke-width="2.5"/>
      <path d="M14 184 Q36 184 36 206" fill="none" stroke="#fae88a" stroke-width="2.5"/>
      <path d="M146 184 Q124 184 124 206" fill="none" stroke="#fae88a" stroke-width="2.5"/>
      <circle cx="80" cy="110" r="44" fill="#1a2845" stroke="#e2b246" stroke-width="2.8"/>
      <circle cx="80" cy="110" r="20" fill="#fae88a"/>
      <path d="M80 90 A20 20 0 0 0 80 130 A14 20 0 0 1 80 90" fill="#141f36"/>
      <path d="M80 58 L80 67 M80 153 L80 162 M28 110 L37 110 M123 110 L132 110" stroke="#fae88a" stroke-width="2.2" stroke-linecap="round"/>
    </svg>`,
    { size: 256 }
  );

  // 3. Grimoire Cover B: Transmutation Alchemy
  const BOOK_COVER_B = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 220">
      <rect width="160" height="220" rx="6" fill="#52101e"/>
      <rect x="8" y="8" width="144" height="204" rx="4" fill="none" stroke="#e2b246" stroke-width="3"/>
      <rect x="13" y="13" width="134" height="194" fill="none" stroke="#8a1f2b" stroke-width="1.5"/>
      <circle cx="80" cy="110" r="46" fill="#3b0914" stroke="#e2b246" stroke-width="2.5"/>
      <polygon points="80,68 116,132 44,132" fill="none" stroke="#fae88a" stroke-width="2"/>
      <polygon points="80,152 116,88 44,88" fill="none" stroke="#fae88a" stroke-width="2"/>
      <circle cx="80" cy="110" r="18" fill="none" stroke="#e2b246" stroke-width="1.5"/>
      <circle cx="80" cy="110" r="7" fill="#fae88a"/>
    </svg>`,
    { size: 256 }
  );

  // 4. Grimoire Cover C: Mystic All-Seeing Eye
  const BOOK_COVER_C = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 220">
      <rect width="160" height="220" rx="6" fill="#2b113d"/>
      <rect x="9" y="9" width="142" height="202" rx="4" fill="none" stroke="#e2b246" stroke-width="2.5"/>
      <polygon points="80,22 140,110 80,198 20,110" fill="#36154d" stroke="#d4a344" stroke-width="1.8"/>
      <path d="M38 110 Q80 76 122 110 Q80 144 38 110Z" fill="#1b0829" stroke="#fae88a" stroke-width="3"/>
      <circle cx="80" cy="110" r="16" fill="#d4a344"/>
      <circle cx="80" cy="110" r="8.5" fill="#1b0829"/>
      <circle cx="83" cy="107" r="3" fill="#ffffff"/>
    </svg>`,
    { size: 256 }
  );

  // 5. Open Grimoire Pages Spread
  const OPEN_BOOK_PAGES = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260">
      <rect width="400" height="260" rx="4" fill="#eddcb9"/>
      <rect x="12" y="10" width="180" height="240" rx="3" fill="#faf1dc"/>
      <rect x="208" y="10" width="180" height="240" rx="3" fill="#faf1dc"/>
      <rect x="194" y="10" width="12" height="240" fill="#ceb587"/>
      <rect x="20" y="18" width="164" height="224" fill="none" stroke="#caa268" stroke-width="1"/>
      <rect x="216" y="18" width="164" height="224" fill="none" stroke="#caa268" stroke-width="1"/>
      <!-- Left Page: Astrology -->
      <circle cx="102" cy="74" r="38" fill="none" stroke="#482e18" stroke-width="1.4"/>
      <circle cx="102" cy="74" r="30" fill="none" stroke="#b08438" stroke-width="1" stroke-dasharray="3 2"/>
      <circle cx="90" cy="62" r="2.5" fill="#8f281b"/>
      <circle cx="114" cy="66" r="3" fill="#8f281b"/>
      <circle cx="106" cy="88" r="2.5" fill="#8f281b"/>
      <line x1="90" y1="62" x2="114" y2="66" stroke="#8f281b" stroke-width="1"/>
      <line x1="114" y1="66" x2="106" y2="88" stroke="#8f281b" stroke-width="1"/>
      <rect x="28" y="126" width="148" height="3" rx="1.5" fill="#482e18"/>
      <rect x="28" y="136" width="140" height="2.5" rx="1" fill="#583c24"/>
      <rect x="28" y="145" width="144" height="2.5" rx="1" fill="#583c24"/>
      <rect x="28" y="154" width="132" height="2.5" rx="1" fill="#583c24"/>
      <!-- Right Page: Magic Circle & Drop Cap -->
      <rect x="224" y="26" width="30" height="30" rx="3" fill="#8f202a" stroke="#caa268" stroke-width="1.5"/>
      <path d="M230 31 L239 51 L248 31" fill="none" stroke="#fae88a" stroke-width="3" stroke-linecap="round"/>
      <rect x="260" y="28" width="112" height="2.5" rx="1" fill="#482e18"/>
      <rect x="260" y="37" width="112" height="2.5" rx="1" fill="#583c24"/>
      <circle cx="298" cy="122" r="44" fill="#fdf7e8" stroke="#8f202a" stroke-width="2"/>
      <circle cx="298" cy="122" r="38" fill="none" stroke="#caa268" stroke-width="1.4"/>
      <polygon points="298,84 331,142 265,142" fill="none" stroke="#8f202a" stroke-width="1.4"/>
      <polygon points="298,160 331,102 265,102" fill="none" stroke="#8f202a" stroke-width="1.4"/>
      <circle cx="298" cy="122" r="14" fill="none" stroke="#caa268" stroke-width="1.6"/>
      <circle cx="298" cy="122" r="5" fill="#8f202a"/>
      <rect x="224" y="176" width="148" height="2.5" rx="1" fill="#583c24"/>
      <rect x="224" y="186" width="142" height="2.5" rx="1" fill="#583c24"/>
    </svg>`,
    { size: 512 }
  );

  // 6. Holographic Arcane Summoning Ring
  const ARCANE_HOLO_RING = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
      <circle cx="128" cy="128" r="120" fill="none" stroke="#42f5ff" stroke-width="3.5"/>
      <circle cx="128" cy="128" r="108" fill="none" stroke="#ffe16b" stroke-width="2" stroke-dasharray="5 7"/>
      <circle cx="128" cy="128" r="94" fill="none" stroke="#42f5ff" stroke-width="2.5"/>
      <polygon points="128,34 208,128 128,222 48,128" fill="none" stroke="#ffe16b" stroke-width="2.5"/>
      <polygon points="128,34 208,128 128,222 48,128" fill="none" stroke="#42f5ff" stroke-width="2.5" transform="rotate(45 128 128)"/>
      <circle cx="128" cy="128" r="64" fill="none" stroke="#b14dff" stroke-width="3"/>
      <circle cx="128" cy="18" r="5" fill="#42f5ff"/>
      <circle cx="128" cy="238" r="5" fill="#42f5ff"/>
      <circle cx="18" cy="128" r="5" fill="#42f5ff"/>
      <circle cx="238" cy="128" r="5" fill="#42f5ff"/>
    </svg>`,
    { size: 256 }
  );

  // 7. Hanging Astronomical Star Chart
  const STAR_CHART = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300">
      <rect width="200" height="300" rx="4" fill="#edd9b4"/>
      <rect x="8" y="10" width="184" height="280" rx="2" fill="none" stroke="#875e32" stroke-width="2"/>
      <text x="100" y="30" font-family="serif" font-size="11" font-weight="bold" fill="#3b2310" text-anchor="middle" letter-spacing="2">PLANISPHAERIUM</text>
      <circle cx="100" cy="98" r="52" fill="#f8eed9" stroke="#3b2310" stroke-width="1.6"/>
      <path d="M72 80 L88 72 L112 78 L124 94 L114 116 L92 112Z" fill="none" stroke="#1d4575" stroke-width="1.5"/>
      <circle cx="72" cy="80" r="2.5" fill="#b8832a"/>
      <circle cx="88" cy="72" r="3.2" fill="#b8832a"/>
      <circle cx="112" cy="78" r="2.5" fill="#b8832a"/>
      <circle cx="100" cy="204" r="46" fill="#f8eed9" stroke="#3b2310" stroke-width="1.6"/>
      <polygon points="100,164 135,224 65,224" fill="none" stroke="#caa268" stroke-width="1.2"/>
      <polygon points="100,244 135,184 65,184" fill="none" stroke="#caa268" stroke-width="1.2"/>
    </svg>`,
    { size: 256 }
  );

  // 8. Spell Scroll Banner
  const SPELL_SCROLL = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 280">
      <rect width="140" height="280" rx="3" fill="#f2e2c2"/>
      <rect x="6" y="8" width="128" height="264" rx="2" fill="none" stroke="#946d3e" stroke-width="1.8"/>
      <circle cx="70" cy="45" r="26" fill="#faeed4" stroke="#8a1f29" stroke-width="1.8"/>
      <polygon points="70,24 91,56 49,56" fill="none" stroke="#caa268" stroke-width="1.4"/>
      <polygon points="70,66 91,34 49,34" fill="none" stroke="#caa268" stroke-width="1.4"/>
      <rect x="18" y="82" width="104" height="3" rx="1.5" fill="#3b2515"/>
      <rect x="18" y="92" width="96" height="2.5" rx="1" fill="#523520"/>
      <circle cx="70" cy="148" r="28" fill="none" stroke="#284368" stroke-width="1.8"/>
      <circle cx="70" cy="245" r="16" fill="#8f1925" stroke="#5a0e16" stroke-width="1.5"/>
    </svg>`,
    { size: 256 }
  );

  // 9. Floating Magic Sparkle Card
  const MAGIC_SPARKLE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M32 2 Q32 32 2 32 Q32 32 32 62 Q32 32 62 32 Q32 32 32 2Z" fill="#ffffff"/>
      <path d="M32 14 Q32 32 14 32 Q32 32 32 50 Q32 32 50 32 Q32 32 32 14Z" fill="#54f2ff"/>
      <circle cx="32" cy="32" r="3.5" fill="#ffffff"/>
    </svg>`,
    { size: 64 }
  );

  // ---------------------------------------------------------------------------
  // Helper: Stylized 3D Anime Candle Flame
  // ---------------------------------------------------------------------------
  function makeAnimeFlame(at: [number, number, number], scale = 1) {
    // Outer glowing flame droplet
    glow(
      b.part(new THREE.ConeGeometry(0.012 * scale, 0.038 * scale, 8), FLAME_OUTER, {
        bone: root,
        at: [at[0], at[1] + 0.016 * scale, at[2]],
      }),
      2.2
    );
    // Inner white-hot glowing core
    glow(
      b.part(new THREE.ConeGeometry(0.006 * scale, 0.022 * scale, 6), FLAME_CORE, {
        bone: root,
        at: [at[0], at[1] + 0.010 * scale, at[2]],
      }),
      3.2
    );
  }

  // ---------------------------------------------------------------------------
  // 1. STAGED DAIS & ARCANE CARPET BASE (y = 0 to 0.04)
  // ---------------------------------------------------------------------------
  b.part(new THREE.CylinderGeometry(0.88, 0.92, 0.035, 16), "#262430", {
    bone: root,
    at: [0, 0.0175, 0.02],
  });
  b.part(new THREE.CylinderGeometry(0.86, 0.86, 0.038, 16), BRASS, {
    bone: root,
    at: [0, 0.019, 0.02],
  });
  b.part(new THREE.CircleGeometry(0.82, 32), "#ffffff", {
    bone: root,
    at: [0, 0.039, 0.02],
    rotation: [-90, 0, 0],
    texture: MAGIC_RUG_TEXTURE,
    axis: "z",
  });

  // ---------------------------------------------------------------------------
  // 2. BOOKSHELF ARCHITECTURE (Optimized Proportions: 0.34m depth)
  // ---------------------------------------------------------------------------
  // Plinth Footing
  b.part(new THREE.BoxGeometry(1.24, 0.08, 0.36), WOOD_DARK, {
    bone: root,
    at: [0, 0.08, 0],
  });
  b.part(new THREE.BoxGeometry(1.26, 0.02, 0.38), BRASS, {
    bone: root,
    at: [0, 0.12, 0],
  });

  // Left & Right Vertical Columns (Uprights) with Carved Recessed Lancet Arches
  const COL_X = 0.54;
  for (const s of [1, -1]) {
    // Main column upright
    b.part(new THREE.BoxGeometry(0.12, 1.84, 0.34), WOOD, {
      bone: root,
      at: [s * COL_X, 1.04, 0],
    });
    // Front fluted pilaster accent
    b.part(new THREE.BoxGeometry(0.04, 1.78, 0.02), WOOD_TRIM, {
      bone: root,
      at: [s * COL_X, 1.04, 0.17],
    });
    // Recessed arch panel on exterior flanks (+X and -X faces)
    b.part(new THREE.BoxGeometry(0.015, 1.48, 0.22), WOOD_INLAY, {
      bone: root,
      at: [s * (COL_X + 0.055), 1.04, 0],
    });
    // Plinth base capital
    b.part(new THREE.BoxGeometry(0.14, 0.05, 0.36), BRASS_DARK, {
      bone: root,
      at: [s * COL_X, 0.145, 0],
    });
    // Top carved corbel capital
    b.part(new THREE.BoxGeometry(0.15, 0.07, 0.38), BRASS, {
      bone: root,
      at: [s * COL_X, 1.93, 0],
    });
  }

  // Rear Backboard
  b.part(new THREE.BoxGeometry(1.02, 1.82, 0.02), WOOD, {
    bone: root,
    at: [0, 1.05, -0.13],
  });

  // ---------------------------------------------------------------------------
  // 3. INTERIOR SHELVES WITH GILDED MOULDINGS
  // ---------------------------------------------------------------------------
  // Shelf heights:
  // Shelf 0: y = 0.16
  // Shelf 1: y = 0.60
  // Shelf 2: y = 1.05 (Hero Middle Shelf)
  // Shelf 3: y = 1.50
  // Shelf 4: y = 1.95 (Top Cornice Header)
  const SHELF_YS = [0.16, 0.60, 1.05, 1.50, 1.95];
  for (let i = 0; i < SHELF_YS.length; i++) {
    const sy = SHELF_YS[i];
    b.part(new THREE.BoxGeometry(1.02, 0.03, 0.30), WOOD, {
      bone: root,
      at: [0, sy, 0.01],
    });
    // Gilded brass front edge moulding
    b.part(new THREE.BoxGeometry(1.02, 0.018, 0.016), BRASS, {
      bone: root,
      at: [0, sy, 0.165],
    });
    // Under-shelf corbels
    for (const s of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.016, 0.045, 0.045), BRASS_DARK, {
        bone: root,
        at: [s * 0.49, sy - 0.028, 0.12],
      });
    }
  }

  // Top Cornice Moulding
  b.part(new THREE.BoxGeometry(1.26, 0.05, 0.38), WOOD_TRIM, {
    bone: root,
    at: [0, 1.985, 0],
  });
  b.part(new THREE.BoxGeometry(1.28, 0.02, 0.40), BRASS, {
    bone: root,
    at: [0, 2.02, 0],
  });

  // ---------------------------------------------------------------------------
  // 4. GOTHIC OBSERVATORY APEX & DIVINATION ORB
  // ---------------------------------------------------------------------------
  // Corner Spire Posts firmly seated on the cornice
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.035, 0.038, 0.08, 12), BRASS_DARK, {
      bone: root,
      at: [s * 0.54, 2.07, 0.08],
    });
    b.part(new THREE.SphereGeometry(0.032, 10, 8), BRASS, {
      bone: root,
      at: [s * 0.54, 2.12, 0.08],
    });
    b.part(new THREE.ConeGeometry(0.024, 0.12, 10), BRASS_LIGHT, {
      bone: root,
      at: [s * 0.54, 2.20, 0.08],
    });

    // Inner Turned Columns supporting the arch
    b.part(new THREE.CylinderGeometry(0.026, 0.030, 0.28, 12), BRASS_DARK, {
      bone: root,
      at: [s * 0.36, 2.17, 0.06],
    });
    b.part(new THREE.SphereGeometry(0.032, 10, 8), BRASS, {
      bone: root,
      at: [s * 0.36, 2.32, 0.06],
    });
  }

  // Carved Open Gothic Tracery Arch Rib
  const openArchRib: [number, number, ...("sharp")[]][] = [
    [-0.38, 0],
    [-0.34, 0.14],
    [-0.18, 0.24],
    [0, 0.32, "sharp"],
    [0.18, 0.24],
    [0.34, 0.14],
    [0.38, 0],
    [0.32, 0],
    [0.28, 0.10],
    [0.15, 0.19],
    [0, 0.25, "sharp"],
    [-0.15, 0.19],
    [-0.28, 0.10],
    [-0.32, 0],
  ];
  b.extrude(openArchRib, {
    bone: root,
    at: [0, 2.03, 0.06],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.04,
    bevel: 0.006,
    color: WOOD_TRIM,
  });

  // Keystone Gilded Sunburst Medallion
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 16), BRASS, {
    bone: root,
    at: [0, 2.32, 0.085],
    dir: [0, 0, 1],
  });
  b.part(new THREE.SphereGeometry(0.032, 10, 8), BRASS_LIGHT, {
    bone: root,
    at: [0, 2.32, 0.095],
  });

  // THE DIVINATION ORB (Center-Stage in the Archway)
  const ORB_Y = 2.16;
  const ORB_Z = 0.05;

  // Ornate Brass Plinth & Claw Cradle
  b.part(new THREE.CylinderGeometry(0.11, 0.13, 0.025, 16), BRASS_DARK, {
    bone: root,
    at: [0, 2.02, ORB_Z],
  });
  b.part(new THREE.CylinderGeometry(0.075, 0.09, 0.035, 12), BRASS, {
    bone: root,
    at: [0, 2.045, ORB_Z],
  });
  for (let a = 0; a < 3; a++) {
    const ang = a * ((Math.PI * 2) / 3);
    const lx = Math.cos(ang) * 0.075;
    const lz = ORB_Z + Math.sin(ang) * 0.075;
    b.part(new THREE.TorusGeometry(0.05, 0.007, 6, 12, Math.PI * 0.7), BRASS_LIGHT, {
      bone: root,
      at: [lx, 2.09, lz],
      rotation: [0, -ang * (180 / Math.PI), 85],
    });
  }

  // Radiant Divination Sphere
  glow(
    b.part(new THREE.SphereGeometry(0.085, 18, 14), GLOW_CYAN, {
      bone: root,
      at: [0, ORB_Y, ORB_Z],
    }),
    2.5
  );

  // Orbiting Armillary Rings
  b.part(new THREE.TorusGeometry(0.12, 0.006, 8, 24), BRASS, {
    bone: root,
    at: [0, ORB_Y, ORB_Z],
    rotation: [25, 20, 0],
  });
  b.part(new THREE.TorusGeometry(0.14, 0.006, 8, 24), BRASS_LIGHT, {
    bone: root,
    at: [0, ORB_Y, ORB_Z],
    rotation: [-35, 45, 20],
  });

  // Tilted Arcane Rune Circle Aura (Faces the camera dramatically!)
  glow(
    b.part(new THREE.PlaneGeometry(0.28, 0.28), "#ffffff", {
      bone: root,
      at: [0, ORB_Y, ORB_Z - 0.02],
      rotation: [-20, 0, 0],
      texture: ARCANE_HOLO_RING,
      axis: "z",
    }),
    2.2
  );

  // Floating Starlight Sparkles
  const ORB_SPARKS: [number, number, number][] = [
    [-0.14, ORB_Y + 0.07, ORB_Z + 0.04],
    [0.13, ORB_Y - 0.05, ORB_Z + 0.06],
    [0.00, ORB_Y + 0.12, ORB_Z - 0.04],
  ];
  for (const ospos of ORB_SPARKS) {
    glow(
      b.part(new THREE.PlaneGeometry(0.035, 0.035), "#ffffff", {
        bone: root,
        at: ospos,
        texture: MAGIC_SPARKLE,
        axis: "z",
      }),
      2.6
    );
  }

  // ---------------------------------------------------------------------------
  // Helper: Place a Detailed Grimoire
  // ---------------------------------------------------------------------------
  type BookOpts = {
    at: [number, number, number];
    w: number;
    h: number;
    d: number;
    color: string;
    coverTex?: THREE.Texture;
    rotX?: number;
    rotY?: number;
    rotZ?: number;
    ribbon?: string;
  };

  function placeBook(opts: BookOpts) {
    const rx = opts.rotX ?? 0;
    const ry = opts.rotY ?? 0;
    const rz = opts.rotZ ?? 0;

    // Pages paper block
    b.part(new THREE.BoxGeometry(opts.w - 0.008, opts.h - 0.012, opts.d - 0.004), PAPER, {
      bone: root,
      at: opts.at,
      rotation: [rx, ry, rz],
    });

    // Leather covers & spine
    b.part(new THREE.BoxGeometry(opts.w, opts.h, 0.003), opts.color, {
      bone: root,
      at: [opts.at[0], opts.at[1], opts.at[2] - (opts.d / 2 - 0.0015)],
      rotation: [rx, ry, rz],
    });
    b.part(new THREE.BoxGeometry(opts.w, opts.h, 0.003), opts.color, {
      bone: root,
      at: [opts.at[0], opts.at[1], opts.at[2] + (opts.d / 2 - 0.0015)],
      rotation: [rx, ry, rz],
    });
    b.part(new THREE.BoxGeometry(0.004, opts.h, opts.d), opts.color, {
      bone: root,
      at: [opts.at[0] - opts.w / 2, opts.at[1], opts.at[2]],
      rotation: [rx, ry, rz],
    });
    // Gilded spine ribs
    for (const dy of [-opts.h * 0.28, 0, opts.h * 0.28]) {
      b.part(new THREE.BoxGeometry(0.006, 0.007, opts.d + 0.003), BRASS, {
        bone: root,
        at: [opts.at[0] - opts.w / 2, opts.at[1] + dy, opts.at[2]],
        rotation: [rx, ry, rz],
      });
    }

    // Cover Decal
    if (opts.coverTex) {
      b.part(new THREE.PlaneGeometry(opts.w * 0.94, opts.h * 0.94), "#ffffff", {
        bone: root,
        at: [opts.at[0], opts.at[1], opts.at[2] + (opts.d / 2 + 0.002)],
        rotation: [rx, ry, rz],
        texture: opts.coverTex,
        axis: "z",
      });
    }

    // Silk bookmark ribbon
    if (opts.ribbon) {
      b.part(new THREE.BoxGeometry(0.014, 0.07, 0.0015), opts.ribbon, {
        bone: root,
        at: [opts.at[0] + 0.02, opts.at[1] - opts.h / 2 - 0.02, opts.at[2]],
        rotation: [rx, ry, rz],
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 5. SHELF 0 (Bottom Shelf, surface y = 0.175)
  // Large Ancient Folios, Ledger Tomes, Scroll Bin, and Leaning Grimoire
  // ---------------------------------------------------------------------------
  // Left: Massive ancient folios with gilded leather covers
  placeBook({
    at: [-0.44, 0.36, 0.05],
    w: 0.24,
    h: 0.36,
    d: 0.065,
    color: LEATHER_NAVY,
    coverTex: BOOK_COVER_A,
    ribbon: "#ff3344",
  });
  placeBook({
    at: [-0.37, 0.34, 0.05],
    w: 0.22,
    h: 0.33,
    d: 0.055,
    color: LEATHER_OBSIDIAN,
  });
  placeBook({
    at: [-0.305, 0.365, 0.05],
    w: 0.25,
    h: 0.37,
    d: 0.070,
    color: LEATHER_RUBY,
    coverTex: BOOK_COVER_B,
  });
  placeBook({
    at: [-0.245, 0.33, 0.05],
    w: 0.21,
    h: 0.31,
    d: 0.045,
    color: LEATHER_EMERALD,
  });
  placeBook({
    at: [-0.19, 0.35, 0.05],
    w: 0.23,
    h: 0.34,
    d: 0.055,
    color: LEATHER_AMBER,
  });

  // Center: Stack of 3 horizontal ledger tomes
  b.part(new THREE.BoxGeometry(0.24, 0.055, 0.20), LEATHER_OBSIDIAN, {
    bone: root,
    at: [0, 0.205, 0.05],
  });
  b.part(new THREE.BoxGeometry(0.22, 0.045, 0.18), PAPER, {
    bone: root,
    at: [0.01, 0.205, 0.05],
  });
  b.part(new THREE.BoxGeometry(0.22, 0.050, 0.18), LEATHER_NAVY, {
    bone: root,
    at: [0.01, 0.255, 0.04],
    rotation: [0, 5, 0],
  });
  b.part(new THREE.BoxGeometry(0.20, 0.045, 0.16), LEATHER_RUBY, {
    bone: root,
    at: [-0.01, 0.30, 0.045],
    rotation: [0, -7, 0],
  });
  b.part(new THREE.PlaneGeometry(0.18, 0.14), "#ffffff", {
    bone: root,
    at: [-0.01, 0.324, 0.045],
    rotation: [-90, -7, 0],
    texture: BOOK_COVER_B,
    axis: "z",
  });
  // Silk bookmark ribbon
  b.part(new THREE.BoxGeometry(0.016, 0.002, 0.08), "#d92638", {
    bone: root,
    at: [0.02, 0.276, 0.15],
    rotation: [15, 5, 0],
  });

  // Center-Right: Wooden Scroll Bin with Rolled Scrolls
  b.part(new THREE.BoxGeometry(0.18, 0.22, 0.22), WOOD_TRIM, {
    bone: root,
    at: [0.18, 0.285, 0.05],
  });
  b.part(new THREE.BoxGeometry(0.15, 0.19, 0.20), WOOD_DARK, {
    bone: root,
    at: [0.18, 0.285, 0.06],
  });

  const SCROLL_SLOTS: [number, number, number, number][] = [
    [0.14, 0.24, 0.06, 12],
    [0.17, 0.26, 0.08, -8],
    [0.21, 0.23, 0.05, 15],
    [0.15, 0.30, 0.07, -5],
    [0.19, 0.32, 0.08, 10],
    [0.22, 0.29, 0.06, -12],
  ];
  for (let idx = 0; idx < SCROLL_SLOTS.length; idx++) {
    const [sx, sy, sz, rotZ] = SCROLL_SLOTS[idx];
    b.part(new THREE.CylinderGeometry(0.015, 0.015, 0.18, 10), PAPER, {
      bone: root,
      at: [sx, sy, sz],
      rotation: [20, 0, rotZ],
    });
    const ribCol = idx % 2 === 0 ? "#8a1f29" : "#1a3b5c";
    b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.02, 10), ribCol, {
      bone: root,
      at: [sx, sy, sz],
      rotation: [20, 0, rotZ],
    });
  }

  // Right: Crescent Moon Brass Bookend & Leaning Grimoire
  b.part(new THREE.BoxGeometry(0.08, 0.02, 0.16), BRASS_DARK, {
    bone: root,
    at: [0.44, 0.185, 0.05],
  });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.015, 16), BRASS, {
    bone: root,
    at: [0.44, 0.25, 0.05],
    dir: [1, 0, 0],
  });
  placeBook({
    at: [0.31, 0.33, 0.05],
    w: 0.22,
    h: 0.31,
    d: 0.045,
    color: LEATHER_TEAL,
  });
  placeBook({
    at: [0.355, 0.34, 0.05],
    w: 0.23,
    h: 0.32,
    d: 0.045,
    color: LEATHER_VIOLET,
    coverTex: BOOK_COVER_C,
  });
  placeBook({
    at: [0.40, 0.31, 0.05],
    w: 0.21,
    h: 0.30,
    d: 0.045,
    color: LEATHER_AMBER,
    rotZ: -16,
  });

  // ---------------------------------------------------------------------------
  // 6. SHELF 1 (Lower-Mid Shelf, surface y = 0.615)
  // Alchemical Laboratory: Test Tube Rack, Boiling Flasks, Spiral Retort & Hourglass
  // ---------------------------------------------------------------------------
  // Left: Row of 5 colorful spellbooks
  const S1_BOOKS: [number, string, THREE.Texture | undefined][] = [
    [-0.43, LEATHER_RUBY, BOOK_COVER_B],
    [-0.38, LEATHER_NAVY, undefined],
    [-0.335, LEATHER_EMERALD, undefined],
    [-0.29, LEATHER_VIOLET, BOOK_COVER_C],
    [-0.245, LEATHER_AMBER, undefined],
  ];
  for (let idx = 0; idx < S1_BOOKS.length; idx++) {
    const [bx, col, tex] = S1_BOOKS[idx];
    placeBook({
      at: [bx, 0.76, 0.06],
      w: 0.18,
      h: 0.28,
      d: 0.042,
      color: col,
      coverTex: tex,
    });
  }

  // Alchemical Test Tube Rack with 4 Glowing Mana Vials
  b.part(new THREE.BoxGeometry(0.18, 0.012, 0.045), WOOD_TRIM, {
    bone: root,
    at: [-0.08, 0.621, 0.08],
  });
  b.part(new THREE.BoxGeometry(0.18, 0.010, 0.045), WOOD_TRIM, {
    bone: root,
    at: [-0.08, 0.675, 0.08],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.012, 0.065, 0.045), WOOD_TRIM, {
      bone: root,
      at: [-0.08 + s * 0.08, 0.65, 0.08],
    });
  }
  const VIAL_COLS = [GLOW_CYAN, GLOW_MAGENTA, GLOW_EMERALD, GLOW_AMBER];
  for (let idx = 0; idx < 4; idx++) {
    const vx = -0.135 + idx * 0.038;
    glow(
      b.part(new THREE.CylinderGeometry(0.010, 0.010, 0.055, 10), VIAL_COLS[idx], {
        bone: root,
        at: [vx, 0.655, 0.08],
      }),
      2.2
    );
    b.part(new THREE.CylinderGeometry(0.009, 0.008, 0.012, 8), CORK, {
      bone: root,
      at: [vx, 0.688, 0.08],
    });
  }

  // Boiling Flask with Glowing Amethyst Liquid
  b.part(new THREE.CylinderGeometry(0.03, 0.035, 0.015, 12), BRASS_DARK, {
    bone: root,
    at: [0.06, 0.622, 0.08],
  });
  glow(
    b.part(new THREE.SphereGeometry(0.045, 14, 10), GLOW_AMETHYST, {
      bone: root,
      at: [0.06, 0.67, 0.08],
    }),
    2.4
  );
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.05, 10), BRASS, {
    bone: root,
    at: [0.06, 0.725, 0.08],
  });
  b.part(new THREE.TorusGeometry(0.016, 0.004, 8, 16), BRASS_LIGHT, {
    bone: root,
    at: [0.06, 0.75, 0.08],
    rotation: [90, 0, 0],
  });
  b.part(new THREE.CylinderGeometry(0.012, 0.010, 0.018, 8), CORK, {
    bone: root,
    at: [0.06, 0.758, 0.08],
  });

  // Alchemical Spiral Retort Coil
  b.part(new THREE.TorusGeometry(0.024, 0.004, 8, 16), "#a2e6f7", {
    bone: root,
    at: [0.12, 0.71, 0.08],
    rotation: [0, 90, 0],
  });
  b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.06, 6), "#a2e6f7", {
    bone: root,
    at: [0.09, 0.73, 0.08],
    rotation: [0, 0, 35],
  });

  // Brass Hourglass with Glowing Golden Sand
  const HG_X = 0.22;
  const HG_Z = 0.07;
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.008, 12), BRASS, {
    bone: root,
    at: [HG_X, 0.62, HG_Z],
  });
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.008, 12), BRASS, {
    bone: root,
    at: [HG_X, 0.74, HG_Z],
  });
  for (let a = 0; a < 3; a++) {
    const ang = a * ((Math.PI * 2) / 3);
    b.part(new THREE.CylinderGeometry(0.003, 0.003, 0.12, 6), BRASS_DARK, {
      bone: root,
      at: [HG_X + Math.cos(ang) * 0.032, 0.68, HG_Z + Math.sin(ang) * 0.032],
    });
  }
  b.part(new THREE.ConeGeometry(0.032, 0.055, 10), "#bce8f5", {
    bone: root,
    at: [HG_X, 0.705, HG_Z],
    rotation: [180, 0, 0],
  });
  b.part(new THREE.ConeGeometry(0.032, 0.055, 10), "#bce8f5", {
    bone: root,
    at: [HG_X, 0.655, HG_Z],
  });
  glow(
    b.part(new THREE.ConeGeometry(0.024, 0.035, 8), GLOW_GOLD, {
      bone: root,
      at: [HG_X, 0.642, HG_Z],
    }),
    2.0
  );

  // Mortar & Pestle with Glowing Emerald Powder
  b.part(new THREE.CylinderGeometry(0.038, 0.025, 0.04, 12), BRASS, {
    bone: root,
    at: [0.35, 0.635, 0.08],
  });
  glow(
    b.part(new THREE.CylinderGeometry(0.030, 0.030, 0.008, 12), GLOW_EMERALD, {
      bone: root,
      at: [0.35, 0.648, 0.08],
    }),
    2.2
  );
  b.part(new THREE.CylinderGeometry(0.007, 0.010, 0.07, 8), BRASS_LIGHT, {
    bone: root,
    at: [0.36, 0.665, 0.08],
    rotation: [15, 0, -25],
  });

  // Healing Draught Flask
  glow(
    b.part(new THREE.SphereGeometry(0.028, 10, 8), GLOW_EMERALD, {
      bone: root,
      at: [0.44, 0.645, 0.09],
    }),
    2.4
  );
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.02, 8), BRASS, {
    bone: root,
    at: [0.44, 0.675, 0.09],
  });
  b.part(new THREE.CylinderGeometry(0.007, 0.006, 0.01, 8), CORK, {
    bone: root,
    at: [0.44, 0.688, 0.09],
  });

  // ---------------------------------------------------------------------------
  // 7. SHELF 2 (Middle Hero Shelf, surface y = 1.065)
  // Grand Lectern, Open Grimoire, Floating Runes, Candelabra, Quill, Curio Rod
  // ---------------------------------------------------------------------------
  // Under-shelf Suspended Brass Curio Rod (Under Shelf 3 at y = 1.48)
  b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.94, 8), BRASS, {
    bone: root,
    at: [0, 1.47, 0.08],
    dir: [1, 0, 0],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.012, 0.03, 0.03), BRASS_DARK, {
      bone: root,
      at: [s * 0.46, 1.48, 0.08],
    });
  }

  // Hanging Dried Herb & Flower Bundles
  const HERB_X = [-0.36, -0.24, 0.24, 0.36];
  for (let idx = 0; idx < HERB_X.length; idx++) {
    const hx = HERB_X[idx];
    b.part(new THREE.CylinderGeometry(0.001, 0.001, 0.03, 4), "#875e32", {
      bone: root,
      at: [hx, 1.45, 0.08],
    });
    const col = idx % 2 === 0 ? HERB_GREEN : HERB_FLOWER;
    b.part(new THREE.ConeGeometry(0.022, 0.08, 6), col, {
      bone: root,
      at: [hx, 1.40, 0.08],
      rotation: [180, 0, (idx % 2 === 0 ? 5 : -5)],
    });
  }

  // Hanging Glowing Vial Charms
  for (const s of [1, -1]) {
    const cx = s * 0.12;
    b.part(new THREE.CylinderGeometry(0.001, 0.001, 0.04, 4), BRASS_LIGHT, {
      bone: root,
      at: [cx, 1.445, 0.08],
    });
    glow(
      b.part(new THREE.OctahedronGeometry(0.014), s > 0 ? GLOW_CYAN : GLOW_MAGENTA, {
        bone: root,
        at: [cx, 1.415, 0.08],
      }),
      2.4
    );
  }

  // The Grand Lectern Desktop
  const LECTERN_PITCH = 18 * (Math.PI / 180);
  const cosP = Math.cos(LECTERN_PITCH);
  const sinP = Math.sin(LECTERN_PITCH);

  b.part(new THREE.BoxGeometry(0.22, 0.14, 0.14), WOOD_TRIM, {
    bone: root,
    at: [0, 0.99, 0.18],
  });
  // Winged Dragon Brass Supporting Brackets
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.018, 0.12, 0.12), BRASS, {
      bone: root,
      at: [s * 0.15, 1.02, 0.18],
    });
  }
  // Slanted desktop
  b.part(new THREE.BoxGeometry(0.46, 0.022, 0.30), WOOD, {
    bone: root,
    at: [0, 1.095, 0.22],
    rotation: [-18, 0, 0],
  });
  // Retaining brass lip
  b.part(new THREE.BoxGeometry(0.46, 0.032, 0.02), BRASS, {
    bone: root,
    at: [0, 1.06, 0.34],
    rotation: [-18, 0, 0],
  });

  // Open Grimoire Back & Page Wedges
  b.part(new THREE.BoxGeometry(0.40, 0.015, 0.26), LEATHER_RUBY, {
    bone: root,
    at: [0, 1.102, 0.21],
    rotation: [-18, 0, 0],
  });
  b.part(new THREE.BoxGeometry(0.185, 0.024, 0.24), PAPER, {
    bone: root,
    at: [-0.095, 1.114, 0.21],
    rotation: [-18, 0, 3],
  });
  b.part(new THREE.BoxGeometry(0.185, 0.024, 0.24), PAPER, {
    bone: root,
    at: [0.095, 1.114, 0.21],
    rotation: [-18, 0, -3],
  });

  // Illuminated Open Book Spread Decal
  b.part(new THREE.PlaneGeometry(0.38, 0.24), "#ffffff", {
    bone: root,
    at: [0, 1.127, 0.208],
    dir: [0, cosP, sinP],
    axis: "z",
    up: [0, sinP, -cosP],
    texture: OPEN_BOOK_PAGES,
  });

  // Silk bookmark ribbon
  b.part(new THREE.BoxGeometry(0.016, 0.002, 0.12), "#a61b2b", {
    bone: root,
    at: [0, 1.095, 0.27],
    rotation: [-18, 0, 0],
  });
  b.part(new THREE.BoxGeometry(0.016, 0.05, 0.002), "#a61b2b", {
    bone: root,
    at: [0, 1.045, 0.342],
  });

  // Glowing Holographic Arcane Summoning Ring (Tilted towards camera!)
  glow(
    b.part(new THREE.PlaneGeometry(0.26, 0.26), "#ffffff", {
      bone: root,
      at: [0, 1.28, 0.20],
      rotation: [-35, 0, 0],
      texture: ARCANE_HOLO_RING,
      axis: "z",
    }),
    2.5
  );

  // Floating Starlight Particles above the book
  const BOOK_SPARKS: [number, number, number][] = [
    [-0.08, 1.33, 0.19],
    [0.09, 1.35, 0.17],
    [0.00, 1.30, 0.24],
  ];
  for (const spos of BOOK_SPARKS) {
    glow(
      b.part(new THREE.PlaneGeometry(0.035, 0.035), "#ffffff", {
        bone: root,
        at: spos,
        texture: MAGIC_SPARKLE,
        axis: "z",
      }),
      2.8
    );
  }

  // To the Right: Three-Candle Ornate Brass Candelabra with 3D Anime Flames
  const CANDLE_X = 0.34;
  const CANDLE_Z = 0.09;
  b.part(new THREE.CylinderGeometry(0.045, 0.052, 0.015, 12), BRASS, {
    bone: root,
    at: [CANDLE_X, 1.072, CANDLE_Z],
  });
  b.part(new THREE.CylinderGeometry(0.012, 0.016, 0.08, 10), BRASS_DARK, {
    bone: root,
    at: [CANDLE_X, 1.115, CANDLE_Z],
  });
  b.part(new THREE.SphereGeometry(0.02, 10, 8), BRASS_LIGHT, {
    bone: root,
    at: [CANDLE_X, 1.155, CANDLE_Z],
  });

  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.04, 0.006, 6, 12, Math.PI), BRASS, {
      bone: root,
      at: [CANDLE_X + s * 0.04, 1.155, CANDLE_Z],
      rotation: [0, 0, s > 0 ? 180 : 0],
    });
  }

  const CANDLE_CUPS: [number, number, number][] = [
    [CANDLE_X, 1.17, 0.075],
    [CANDLE_X - 0.075, 1.155, 0.055],
    [CANDLE_X + 0.075, 1.155, 0.045],
  ];
  for (let idx = 0; idx < CANDLE_CUPS.length; idx++) {
    const [cx, cy, ch] = CANDLE_CUPS[idx];
    b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.005, 10), BRASS, {
      bone: root,
      at: [cx, cy, CANDLE_Z],
    });
    b.part(new THREE.CylinderGeometry(0.015, 0.012, 0.014, 10), BRASS_DARK, {
      bone: root,
      at: [cx, cy + 0.008, CANDLE_Z],
    });
    // Chunky wax column
    b.part(new THREE.CylinderGeometry(0.012, 0.013, ch, 10), WAX, {
      bone: root,
      at: [cx, cy + 0.015 + ch / 2, CANDLE_Z],
    });
    // Melted wax drip
    b.part(new THREE.SphereGeometry(0.006, 6, 4), WAX_MELT, {
      bone: root,
      at: [cx + 0.010, cy + ch + 0.005, CANDLE_Z],
    });
    // Wick
    const wickTopY = cy + 0.015 + ch + 0.007;
    b.part(new THREE.CylinderGeometry(0.0015, 0.0015, 0.008, 4), "#111111", {
      bone: root,
      at: [cx, cy + 0.015 + ch + 0.004, CANDLE_Z],
    });
    // Volumetric 3D Anime Flame
    makeAnimeFlame([cx, wickTopY, CANDLE_Z], 1.1);
  }

  // Inkwell & Feather Quill
  b.part(new THREE.CylinderGeometry(0.022, 0.026, 0.032, 10), "#1a1622", {
    bone: root,
    at: [0.24, 1.081, 0.15],
  });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.010, 8), BRASS, {
    bone: root,
    at: [0.24, 1.102, 0.15],
  });
  b.part(new THREE.CylinderGeometry(0.002, 0.001, 0.16, 6), "#ede6d8", {
    bone: root,
    at: [0.25, 1.155, 0.14],
    rotation: [15, 0, 22],
  });
  b.part(new THREE.BoxGeometry(0.018, 0.08, 0.002), "#ffffff", {
    bone: root,
    at: [0.26, 1.185, 0.13],
    rotation: [15, 0, 22],
  });

  // To the Left: Stacked tomes with brass magnifying glass
  b.part(new THREE.BoxGeometry(0.18, 0.045, 0.22), LEATHER_NAVY, {
    bone: root,
    at: [-0.30, 1.087, 0.07],
  });
  b.part(new THREE.BoxGeometry(0.17, 0.040, 0.20), LEATHER_EMERALD, {
    bone: root,
    at: [-0.29, 1.130, 0.065],
    rotation: [0, 8, 0],
  });
  b.part(new THREE.TorusGeometry(0.032, 0.004, 8, 16), BRASS, {
    bone: root,
    at: [-0.29, 1.155, 0.07],
    rotation: [90, 0, 0],
  });
  b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.065, 8), WOOD_TRIM, {
    bone: root,
    at: [-0.24, 1.155, 0.07],
    rotation: [0, 0, 90],
  });

  // Draped parchment scroll hanging over the shelf edge
  b.part(new THREE.PlaneGeometry(0.12, 0.18), "#ffffff", {
    bone: root,
    at: [-0.42, 1.07, 0.10],
    rotation: [-90, 0, 0],
    texture: SPELL_SCROLL,
    axis: "z",
  });
  b.part(new THREE.PlaneGeometry(0.12, 0.14), "#ffffff", {
    bone: root,
    at: [-0.42, 1.00, 0.161],
    texture: SPELL_SCROLL,
    axis: "z",
  });

  // ---------------------------------------------------------------------------
  // 8. SHELF 3 (Upper Shelf, surface y = 1.515)
  // Armillary Astrolabe, 7 Grimoires, Bell Jar Fairy Wisp, Crystal Geode
  // ---------------------------------------------------------------------------
  // Brass Armillary Astrolabe
  const ASTRO_X = -0.36;
  const ASTRO_Z = 0.06;
  b.part(new THREE.CylinderGeometry(0.04, 0.045, 0.015, 12), BRASS, {
    bone: root,
    at: [ASTRO_X, 1.522, ASTRO_Z],
  });
  b.part(new THREE.CylinderGeometry(0.008, 0.012, 0.06, 8), BRASS_DARK, {
    bone: root,
    at: [ASTRO_X, 1.555, ASTRO_Z],
  });
  b.part(new THREE.TorusGeometry(0.055, 0.004, 8, 20), BRASS, {
    bone: root,
    at: [ASTRO_X, 1.62, ASTRO_Z],
    rotation: [0, 0, 0],
  });
  b.part(new THREE.TorusGeometry(0.055, 0.004, 8, 20), BRASS_LIGHT, {
    bone: root,
    at: [ASTRO_X, 1.62, ASTRO_Z],
    rotation: [90, 0, 0],
  });
  b.part(new THREE.TorusGeometry(0.055, 0.004, 8, 20), BRASS, {
    bone: root,
    at: [ASTRO_X, 1.62, ASTRO_Z],
    rotation: [35, 45, 0],
  });
  glow(
    b.part(new THREE.SphereGeometry(0.018, 10, 8), GLOW_GOLD, {
      bone: root,
      at: [ASTRO_X, 1.62, ASTRO_Z],
    }),
    2.4
  );

  // Center: Densely Packed Row of 7 Grimoires
  const S3_BOOKS: [number, string, number, THREE.Texture | undefined][] = [
    [-0.22, LEATHER_OBSIDIAN, 0.22, undefined],
    [-0.17, LEATHER_RUBY, 0.25, BOOK_COVER_B],
    [-0.125, LEATHER_TEAL, 0.21, undefined],
    [-0.08, LEATHER_VIOLET, 0.26, BOOK_COVER_C],
    [-0.035, LEATHER_AMBER, 0.22, undefined],
    [0.01, LEATHER_NAVY, 0.27, BOOK_COVER_A],
    [0.055, LEATHER_EMERALD, 0.23, undefined],
  ];
  for (let idx = 0; idx < S3_BOOKS.length; idx++) {
    const [bx, col, bh, tex] = S3_BOOKS[idx];
    placeBook({
      at: [bx, 1.515 + bh / 2, 0.06],
      w: 0.16,
      h: bh,
      d: 0.038,
      color: col,
      coverTex: tex,
    });
  }

  // Bell Jar containing a Glowing Captured Fairy Fire Wisp
  const JAR_X = 0.18;
  const JAR_Z = 0.07;
  b.part(new THREE.CylinderGeometry(0.045, 0.048, 0.015, 12), WOOD_TRIM, {
    bone: root,
    at: [JAR_X, 1.522, JAR_Z],
  });
  b.part(new THREE.CylinderGeometry(0.040, 0.040, 0.07, 12, 1, true), "#bdeeff", {
    bone: root,
    at: [JAR_X, 1.565, JAR_Z],
  });
  b.part(new THREE.SphereGeometry(0.040, 12, 8), "#bdeeff", {
    bone: root,
    at: [JAR_X, 1.60, JAR_Z],
  });
  b.part(new THREE.SphereGeometry(0.008, 6, 4), BRASS, {
    bone: root,
    at: [JAR_X, 1.642, JAR_Z],
  });
  // Inner floating magical wisp
  glow(
    b.part(new THREE.SphereGeometry(0.016, 10, 8), GLOW_CYAN, {
      bone: root,
      at: [JAR_X, 1.57, JAR_Z],
    }),
    2.8
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.02, 0.02), "#ffffff", {
      bone: root,
      at: [JAR_X + 0.01, 1.58, JAR_Z + 0.01],
      texture: MAGIC_SPARKLE,
      axis: "z",
    }),
    2.5
  );

  // Glowing Amethyst Geode Cluster
  const CRYS_X = 0.32;
  const CRYS_Z = 0.07;
  b.part(new THREE.CylinderGeometry(0.045, 0.05, 0.02, 12), BRASS_DARK, {
    bone: root,
    at: [CRYS_X, 1.525, CRYS_Z],
  });
  b.part(new THREE.CylinderGeometry(0.038, 0.038, 0.01, 12), "#301542", {
    bone: root,
    at: [CRYS_X, 1.538, CRYS_Z],
  });

  const CRYSTAL_SHARDS: [number, number, number, number, number][] = [
    [0, 0.07, 0.018, 0, 0],
    [-0.018, 0.05, 0.013, 12, 10],
    [0.018, 0.055, 0.014, -10, -8],
    [0.005, 0.042, 0.011, 15, -15],
    [-0.012, 0.046, 0.012, -8, 12],
  ];
  for (const [dx, ch, cr, rx, rz] of CRYSTAL_SHARDS) {
    glow(
      b.part(new THREE.ConeGeometry(cr, ch, 6), GLOW_AMETHYST, {
        bone: root,
        at: [CRYS_X + dx, 1.545 + ch / 2, CRYS_Z],
        rotation: [rx, 0, rz],
      }),
      2.2
    );
  }

  // Glazed Ceramic Urn with Scrolls
  b.part(new THREE.CylinderGeometry(0.038, 0.028, 0.08, 12), "#2a2636", {
    bone: root,
    at: [0.43, 1.555, 0.07],
  });
  b.part(new THREE.TorusGeometry(0.038, 0.006, 8, 16), BRASS, {
    bone: root,
    at: [0.43, 1.595, 0.07],
    rotation: [90, 0, 0],
  });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 8), PAPER, {
    bone: root,
    at: [0.42, 1.62, 0.06],
    rotation: [12, 0, -8],
  });
  b.part(new THREE.CylinderGeometry(0.010, 0.010, 0.16, 8), PAPER, {
    bone: root,
    at: [0.44, 1.63, 0.08],
    rotation: [-10, 0, 15],
  });

  // ---------------------------------------------------------------------------
  // 9. SIDE COLUMN ACCESSORIES
  // ---------------------------------------------------------------------------
  // Left Column: Astronomical Star Chart with Brass Rollers
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.22, 8), WOOD_TRIM, {
    bone: root,
    at: [-0.605, 1.68, 0],
    dir: [0, 0, 1],
  });
  b.part(new THREE.SphereGeometry(0.012, 8, 6), BRASS_LIGHT, {
    bone: root,
    at: [-0.605, 1.68, -0.11],
  });
  b.part(new THREE.SphereGeometry(0.012, 8, 6), BRASS_LIGHT, {
    bone: root,
    at: [-0.605, 1.68, 0.11],
  });
  b.part(new THREE.PlaneGeometry(0.18, 0.27), "#ffffff", {
    bone: root,
    at: [-0.608, 1.54, 0],
    dir: [-1, 0, 0],
    texture: STAR_CHART,
    axis: "z",
  });
  b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.20, 8), WOOD_TRIM, {
    bone: root,
    at: [-0.605, 1.40, 0],
    dir: [0, 0, 1],
  });
  b.part(new THREE.SphereGeometry(0.010, 8, 6), BRASS, {
    bone: root,
    at: [-0.605, 1.40, -0.10],
  });
  b.part(new THREE.SphereGeometry(0.010, 8, 6), BRASS, {
    bone: root,
    at: [-0.605, 1.40, 0.10],
  });

  // Right Column: Brass Scroll Holster & Glowing Pendulum
  b.part(new THREE.BoxGeometry(0.06, 0.16, 0.12), BRASS_DARK, {
    bone: root,
    at: [0.63, 1.58, 0],
  });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.22, 8), PAPER, {
    bone: root,
    at: [0.63, 1.62, -0.02],
    rotation: [8, 0, 5],
  });
  b.part(new THREE.CylinderGeometry(0.015, 0.015, 0.02, 8), "#8a1522", {
    bone: root,
    at: [0.63, 1.63, -0.02],
    rotation: [8, 0, 5],
  });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.20, 8), PAPER, {
    bone: root,
    at: [0.63, 1.60, 0.03],
    rotation: [-6, 0, 8],
  });

  // Hanging Brass Chain & Faceted Amethyst Pendulum
  b.part(new THREE.BoxGeometry(0.08, 0.015, 0.02), BRASS, {
    bone: root,
    at: [0.635, 1.74, 0],
  });
  b.part(new THREE.SphereGeometry(0.008, 6, 4), BRASS_LIGHT, {
    bone: root,
    at: [0.67, 1.74, 0],
  });
  b.part(new THREE.CylinderGeometry(0.0015, 0.0015, 0.18, 4), BRASS_DARK, {
    bone: root,
    at: [0.67, 1.64, 0],
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.024), GLOW_AMETHYST, {
      bone: root,
      at: [0.67, 1.53, 0],
    }),
    2.4
  );

  // ---------------------------------------------------------------------------
  // 10. FLOOR SCENERY: FAMILIAR, WIZARD'S STAFF, MELTED WAX & CAULDRON
  // ---------------------------------------------------------------------------
  // Left Floor: Stack of 3 Folios
  const FL_X = -0.42;
  const FL_Z = 0.28;
  b.part(new THREE.BoxGeometry(0.24, 0.05, 0.18), LEATHER_RUBY, {
    bone: root,
    at: [FL_X, 0.065, FL_Z],
    rotation: [0, 18, 0],
  });
  b.part(new THREE.BoxGeometry(0.22, 0.045, 0.16), LEATHER_NAVY, {
    bone: root,
    at: [FL_X + 0.01, 0.11, FL_Z],
    rotation: [0, 5, 0],
  });
  b.part(new THREE.BoxGeometry(0.20, 0.040, 0.15), LEATHER_OBSIDIAN, {
    bone: root,
    at: [FL_X - 0.01, 0.15, FL_Z + 0.01],
    rotation: [0, -12, 0],
  });
  b.part(new THREE.PlaneGeometry(0.18, 0.13), "#ffffff", {
    bone: root,
    at: [FL_X - 0.01, 0.171, FL_Z + 0.01],
    rotation: [-90, -12, 0],
    texture: BOOK_COVER_A,
    axis: "z",
  });

  // Melted Wax Puddle & Floor Candles with Anime Flames
  const WAX_X = -0.54;
  const WAX_Z = 0.14;
  b.part(new THREE.CylinderGeometry(0.075, 0.085, 0.008, 12), WAX_MELT, {
    bone: root,
    at: [WAX_X, 0.044, WAX_Z],
  });
  b.part(new THREE.CylinderGeometry(0.045, 0.055, 0.006, 10), WAX_MELT, {
    bone: root,
    at: [WAX_X + 0.04, 0.045, WAX_Z - 0.03],
  });

  const FLOOR_CANDLES: [number, number, number][] = [
    [WAX_X - 0.02, 0.048, 0.075],
    [WAX_X + 0.02, 0.048, 0.045],
  ];
  for (const [fcx, fcy, fch] of FLOOR_CANDLES) {
    b.part(new THREE.CylinderGeometry(0.014, 0.016, fch, 10), WAX, {
      bone: root,
      at: [fcx, fcy + fch / 2, WAX_Z],
    });
    // Wick
    b.part(new THREE.CylinderGeometry(0.0015, 0.0015, 0.008, 4), "#111111", {
      bone: root,
      at: [fcx, fcy + fch + 0.004, WAX_Z],
    });
    // Volumetric 3D Anime Flame
    makeAnimeFlame([fcx, fcy + fch + 0.008, WAX_Z], 1.0);
  }

  // ADORABLE SLEEPING CELESTIAL FAMILIAR (Cat on Velvet Cushion)
  const CAT_X = -0.16;
  const CAT_Z = 0.38;
  // Plush velvet cushion
  b.part(new THREE.CylinderGeometry(0.12, 0.13, 0.035, 14), VELVET_PLUM, {
    bone: root,
    at: [CAT_X, 0.056, CAT_Z],
  });
  b.part(new THREE.TorusGeometry(0.12, 0.008, 6, 16), BRASS_LIGHT, {
    bone: root,
    at: [CAT_X, 0.065, CAT_Z],
    rotation: [90, 0, 0],
  });

  // Cat Curled Body
  const CAT_FUR = "#1b1932";
  b.part(new THREE.SphereGeometry(0.065, 12, 10), CAT_FUR, {
    bone: root,
    at: [CAT_X, 0.105, CAT_Z],
    scale: [1.2, 0.75, 1.0],
  });
  // Cat Head
  b.part(new THREE.SphereGeometry(0.042, 12, 10), CAT_FUR, {
    bone: root,
    at: [CAT_X + 0.04, 0.115, CAT_Z + 0.02],
  });
  // Cat Ears
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.014, 0.024, 4), CAT_FUR, {
      bone: root,
      at: [CAT_X + 0.04 + s * 0.022, 0.15, CAT_Z + 0.02],
      rotation: [0, 0, s * -20],
    });
    b.part(new THREE.ConeGeometry(0.008, 0.016, 4), "#ff9ebb", {
      bone: root,
      at: [CAT_X + 0.04 + s * 0.022, 0.15, CAT_Z + 0.026],
      rotation: [0, 0, s * -20],
    });
  }
  // Curled Tail with Glowing Star Tip
  b.part(new THREE.TorusGeometry(0.05, 0.012, 6, 12, Math.PI * 1.1), CAT_FUR, {
    bone: root,
    at: [CAT_X - 0.03, 0.085, CAT_Z - 0.01],
    rotation: [90, 20, 0],
  });
  glow(
    b.part(new THREE.SphereGeometry(0.014, 8, 6), GLOW_CYAN, {
      bone: root,
      at: [CAT_X - 0.08, 0.09, CAT_Z + 0.02],
    }),
    2.5
  );

  // Tiny Wizard Hat on Cat
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.004, 10), "#3b134d", {
    bone: root,
    at: [CAT_X + 0.03, 0.152, CAT_Z],
    rotation: [-15, 0, 10],
  });
  b.part(new THREE.ConeGeometry(0.022, 0.065, 8), "#3b134d", {
    bone: root,
    at: [CAT_X + 0.025, 0.185, CAT_Z - 0.005],
    rotation: [-15, 0, 10],
  });
  b.part(new THREE.CylinderGeometry(0.023, 0.023, 0.008, 8), BRASS, {
    bone: root,
    at: [CAT_X + 0.028, 0.158, CAT_Z - 0.002],
    rotation: [-15, 0, 10],
  });

  // Right Floor: Iron Potion Cauldron with Scrolls
  const CAUL_X = 0.44;
  const CAUL_Z = 0.26;
  b.part(new THREE.SphereGeometry(0.09, 14, 10), IRON, {
    bone: root,
    at: [CAUL_X, 0.11, CAUL_Z],
  });
  b.part(new THREE.TorusGeometry(0.075, 0.010, 8, 16), BRASS, {
    bone: root,
    at: [CAUL_X, 0.17, CAUL_Z],
    rotation: [90, 0, 0],
  });
  for (let a = 0; a < 3; a++) {
    const ang = a * ((Math.PI * 2) / 3);
    b.part(new THREE.CylinderGeometry(0.010, 0.014, 0.05, 6), IRON, {
      bone: root,
      at: [CAUL_X + Math.cos(ang) * 0.065, 0.045, CAUL_Z + Math.sin(ang) * 0.065],
      rotation: [15, -ang * (180 / Math.PI), 0],
    });
  }

  const CAUL_SCROLLS: [number, number, number, number][] = [
    [-0.02, 0.03, 14, 12],
    [0.03, -0.01, -18, -10],
    [0.01, 0.03, 8, 22],
    [-0.03, -0.02, -12, 16],
  ];
  for (const [cdx, cdz, rx, rz] of CAUL_SCROLLS) {
    b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.24, 10), PAPER, {
      bone: root,
      at: [CAUL_X + cdx, 0.21, CAUL_Z + cdz],
      rotation: [rx, 0, rz],
    });
    b.part(new THREE.CylinderGeometry(0.017, 0.017, 0.025, 10), "#591c3e", {
      bone: root,
      at: [CAUL_X + cdx, 0.23, CAUL_Z + cdz],
      rotation: [rx, 0, rz],
    });
  }

  // WIZARD'S STAFF LEANING ON BOOKSHELF COLUMN
  const STAFF_X = 0.51;
  const STAFF_Z = 0.22;
  // Gnarled polished staff shaft
  b.part(new THREE.CylinderGeometry(0.012, 0.016, 1.45, 10), WOOD_DARK, {
    bone: root,
    at: [STAFF_X, 0.74, STAFF_Z],
    rotation: [10, 0, -12],
  });
  // Gilded spiral wrap rings
  b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.04, 10), BRASS, {
    bone: root,
    at: [STAFF_X - 0.08, 1.15, STAFF_Z - 0.07],
    rotation: [10, 0, -12],
  });
  // Crescent Moon Dragon Head mounting
  b.part(new THREE.TorusGeometry(0.065, 0.010, 8, 16, Math.PI * 1.3), BRASS_LIGHT, {
    bone: root,
    at: [STAFF_X - 0.14, 1.44, STAFF_Z - 0.12],
    rotation: [0, 45, 30],
  });
  // Staff Celestial Crystal Orb
  glow(
    b.part(new THREE.SphereGeometry(0.038, 12, 10), GLOW_AMETHYST, {
      bone: root,
      at: [STAFF_X - 0.14, 1.44, STAFF_Z - 0.12],
    }),
    2.6
  );

  return b.root;
}
