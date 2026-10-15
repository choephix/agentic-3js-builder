```ts
import * as THREE from "three";
import {
  createBuilder,
  grain,
  mottle,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Wizard's Bookshelf",
  description:
    "A high-fantasy anime wizard's bookshelf laden with ancient grimoires, illuminated spell scrolls, glowing divination orbs, potion vials, and dripping candles.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "wizards_bookshelf" });
  const root = b.joint("root", { at: [0, 0, 0] });

  // ---------------------------------------------------------------------------
  // Color Palette & Custom Paints
  // ---------------------------------------------------------------------------
  const WOOD = grain("#341e16", "#22120d", { size: 0.04, axis: "y" });
  const WOOD_TRIM = grain("#502a1c", "#381c12", { size: 0.03, axis: "x" });
  const STONE = mottle("#383742", "#262530", { size: 0.08, contrast: 1.2 });
  const STONE_RIM = "#22212b";
  const BRASS = "#d9a54c";
  const BRASS_DARK = "#7d5520";
  const BRASS_LIGHT = "#fae18c";
  const IRON = "#2d2a33";

  // Book Leather Jewel Tones
  const LEATHER_NAVY = "#162544";
  const LEATHER_RUBY = "#6e1525";
  const LEATHER_VIOLET = "#38174d";
  const LEATHER_EMERALD = "#16452d";
  const LEATHER_AMBER = "#8c4d16";
  const LEATHER_OBSIDIAN = "#1a1920";
  const LEATHER_TEAL = "#144547";

  // Paper & Wax
  const PAPER = "#f0dfbd";
  const WAX = "#eee3ce";
  const WAX_MELT = "#decfae";
  const CORK = "#a3734c";

  // Glowing Mana Elixirs & Magic
  const GLOW_CYAN = "#42f2ff";
  const GLOW_MAGENTA = "#ff3388";
  const GLOW_EMERALD = "#38ff84";
  const GLOW_AMBER = "#ffb03b";
  const GLOW_AMETHYST = "#9b42f5";
  const GLOW_GOLD = "#ffe16b";
  const FLAME_CORE = "#ffffff";

  // ---------------------------------------------------------------------------
  // High-Resolution SVG Textures
  // ---------------------------------------------------------------------------

  // 1. Midnight Navy & Celestial Gold Grimoire Cover
  const BOOK_COVER_A = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 220">
      <rect width="160" height="220" rx="6" fill="#131b2e"/>
      <rect x="8" y="8" width="144" height="204" rx="4" fill="none" stroke="#dcb15b" stroke-width="2.5"/>
      <rect x="14" y="14" width="132" height="192" rx="2" fill="none" stroke="#a67c30" stroke-width="1" stroke-dasharray="3 3"/>
      <path d="M14 34 Q34 34 34 14" fill="none" stroke="#dcb15b" stroke-width="2"/>
      <path d="M146 34 Q126 34 126 14" fill="none" stroke="#dcb15b" stroke-width="2"/>
      <path d="M14 186 Q34 186 34 206" fill="none" stroke="#dcb15b" stroke-width="2"/>
      <path d="M146 186 Q126 186 126 206" fill="none" stroke="#dcb15b" stroke-width="2"/>
      <circle cx="80" cy="110" r="42" fill="#1a253d" stroke="#dcb15b" stroke-width="2.5"/>
      <circle cx="80" cy="110" r="36" fill="none" stroke="#f5d77f" stroke-width="1.2"/>
      <circle cx="80" cy="110" r="18" fill="#f5d77f"/>
      <path d="M80 92 A18 18 0 0 0 80 128 A13 13 0 0 1 80 92" fill="#131b2e"/>
      <path d="M80 62 L80 70 M80 150 L80 158 M32 110 L40 110 M120 110 L128 110 M46 76 L52 82 M114 144 L108 138 M46 144 L52 138 M114 76 L108 82" stroke="#dcb15b" stroke-width="2" stroke-linecap="round"/>
      <circle cx="65" cy="50" r="2.2" fill="#f5d77f"/>
      <circle cx="95" cy="50" r="2.2" fill="#f5d77f"/>
      <circle cx="80" cy="44" r="2.8" fill="#f5d77f"/>
      <line x1="65" y1="50" x2="80" y2="44" stroke="#dcb15b" stroke-width="0.8"/>
      <line x1="95" y1="50" x2="80" y2="44" stroke="#dcb15b" stroke-width="0.8"/>
    </svg>`,
    { size: 256 }
  );

  // 2. Crimson & Transmutation Alchemy Grimoire Cover
  const BOOK_COVER_B = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 220">
      <rect width="160" height="220" rx="6" fill="#4a0f1a"/>
      <rect x="8" y="8" width="144" height="204" rx="4" fill="none" stroke="#dcb15b" stroke-width="2"/>
      <rect x="13" y="13" width="134" height="194" fill="none" stroke="#8a2030" stroke-width="1.5"/>
      <circle cx="80" cy="110" r="44" fill="#3a0912" stroke="#dcb15b" stroke-width="2"/>
      <polygon points="80,70 115,130 45,130" fill="none" stroke="#f5d77f" stroke-width="1.5"/>
      <polygon points="80,150 115,90 45,90" fill="none" stroke="#f5d77f" stroke-width="1.5"/>
      <circle cx="80" cy="110" r="18" fill="none" stroke="#dcb15b" stroke-width="1.5"/>
      <circle cx="80" cy="110" r="6" fill="#f5d77f"/>
      <circle cx="80" cy="66" r="3" fill="#dcb15b"/>
      <circle cx="80" cy="154" r="3" fill="#dcb15b"/>
      <circle cx="41" cy="88" r="3" fill="#dcb15b"/>
      <circle cx="119" cy="88" r="3" fill="#dcb15b"/>
      <path d="M40 32 L120 32 M50 26 L110 26" stroke="#dcb15b" stroke-width="1.5"/>
      <path d="M40 188 L120 188 M50 194 L110 194" stroke="#dcb15b" stroke-width="1.5"/>
    </svg>`,
    { size: 256 }
  );

  // 3. Arcane Violet & Mystic Eye Grimoire Cover
  const BOOK_COVER_C = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 220">
      <rect width="160" height="220" rx="6" fill="#241033"/>
      <rect x="9" y="9" width="142" height="202" rx="4" fill="none" stroke="#e0b865" stroke-width="2"/>
      <polygon points="80,24 138,110 80,196 22,110" fill="#2e1542" stroke="#caa048" stroke-width="1.5"/>
      <path d="M42 110 Q80 80 118 110 Q80 140 42 110Z" fill="#180a24" stroke="#fce592" stroke-width="2.5"/>
      <circle cx="80" cy="110" r="15" fill="#caa048"/>
      <circle cx="80" cy="110" r="8" fill="#180a24"/>
      <circle cx="83" cy="107" r="3" fill="#ffffff"/>
      <path d="M80 75 L80 62 M80 145 L80 158 M45 92 L35 84 M115 92 L125 84 M45 128 L35 136 M115 128 L125 136" stroke="#fce592" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,
    { size: 256 }
  );

  // 4. Hero Open Grimoire Pages Spread
  const OPEN_BOOK_PAGES = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260">
      <rect width="400" height="260" rx="4" fill="#eedcb7"/>
      <rect x="12" y="10" width="180" height="240" rx="3" fill="#f5e8cc"/>
      <rect x="208" y="10" width="180" height="240" rx="3" fill="#f5e8cc"/>
      <rect x="194" y="10" width="12" height="240" fill="#cfb686"/>
      <rect x="20" y="18" width="164" height="224" fill="none" stroke="#caa468" stroke-width="1"/>
      <rect x="216" y="18" width="164" height="224" fill="none" stroke="#caa468" stroke-width="1"/>
      <!-- Left Page: Astrology & Constellations -->
      <circle cx="102" cy="74" r="36" fill="none" stroke="#4a301a" stroke-width="1.2"/>
      <circle cx="102" cy="74" r="28" fill="none" stroke="#b08438" stroke-width="0.8" stroke-dasharray="2 2"/>
      <circle cx="102" cy="74" r="18" fill="none" stroke="#4a301a" stroke-width="0.8"/>
      <circle cx="90" cy="62" r="2" fill="#8f281b"/>
      <circle cx="114" cy="66" r="2.5" fill="#8f281b"/>
      <circle cx="106" cy="88" r="2" fill="#8f281b"/>
      <circle cx="84" cy="80" r="1.8" fill="#8f281b"/>
      <circle cx="120" cy="82" r="1.8" fill="#8f281b"/>
      <line x1="90" y1="62" x2="114" y2="66" stroke="#8f281b" stroke-width="0.8"/>
      <line x1="114" y1="66" x2="120" y2="82" stroke="#8f281b" stroke-width="0.8"/>
      <line x1="114" y1="66" x2="106" y2="88" stroke="#8f281b" stroke-width="0.8"/>
      <line x1="106" y1="88" x2="84" y2="80" stroke="#8f281b" stroke-width="0.8"/>
      <line x1="84" y1="80" x2="90" y2="62" stroke="#8f281b" stroke-width="0.8"/>
      <rect x="28" y="126" width="148" height="3" rx="1.5" fill="#4a301a"/>
      <rect x="28" y="136" width="140" height="2.5" rx="1" fill="#5c3f26"/>
      <rect x="28" y="145" width="144" height="2.5" rx="1" fill="#5c3f26"/>
      <rect x="28" y="154" width="132" height="2.5" rx="1" fill="#5c3f26"/>
      <rect x="28" y="163" width="146" height="2.5" rx="1" fill="#5c3f26"/>
      <rect x="28" y="174" width="68" height="2.5" rx="1" fill="#5c3f26"/>
      <rect x="104" y="174" width="68" height="2.5" rx="1" fill="#5c3f26"/>
      <rect x="28" y="184" width="144" height="2.5" rx="1" fill="#5c3f26"/>
      <rect x="28" y="194" width="138" height="2.5" rx="1" fill="#5c3f26"/>
      <rect x="28" y="204" width="90" height="2.5" rx="1" fill="#5c3f26"/>
      <!-- Right Page: Illuminated Drop Cap & Magic Circle -->
      <rect x="224" y="26" width="30" height="30" rx="3" fill="#8f202a" stroke="#caa048" stroke-width="1.5"/>
      <path d="M230 31 L239 51 L248 31" fill="none" stroke="#fce592" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="260" y="28" width="112" height="2.5" rx="1" fill="#4a301a"/>
      <rect x="260" y="37" width="112" height="2.5" rx="1" fill="#5c3f26"/>
      <rect x="260" y="46" width="104" height="2.5" rx="1" fill="#5c3f26"/>
      <circle cx="298" cy="122" r="42" fill="#fdf6e6" stroke="#8f202a" stroke-width="1.8"/>
      <circle cx="298" cy="122" r="36" fill="none" stroke="#caa048" stroke-width="1.2"/>
      <polygon points="298,86 329,140 267,140" fill="none" stroke="#8f202a" stroke-width="1.2"/>
      <polygon points="298,158 329,104 267,104" fill="none" stroke="#8f202a" stroke-width="1.2"/>
      <circle cx="298" cy="122" r="14" fill="none" stroke="#caa048" stroke-width="1.5"/>
      <circle cx="298" cy="122" r="4" fill="#8f202a"/>
      <rect x="224" y="176" width="148" height="2.5" rx="1" fill="#5c3f26"/>
      <rect x="224" y="186" width="142" height="2.5" rx="1" fill="#5c3f26"/>
      <rect x="224" y="196" width="146" height="2.5" rx="1" fill="#5c3f26"/>
      <rect x="224" y="206" width="110" height="2.5" rx="1" fill="#5c3f26"/>
    </svg>`,
    { size: 512 }
  );

  // 5. Hanging Star Chart (Celestial Map)
  const STAR_CHART = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300">
      <rect width="200" height="300" rx="4" fill="#edd9b4"/>
      <rect x="8" y="12" width="184" height="276" rx="2" fill="none" stroke="#8c6032" stroke-width="1.8"/>
      <rect x="12" y="16" width="176" height="268" rx="2" fill="none" stroke="#caa468" stroke-width="0.8"/>
      <text x="100" y="32" font-family="serif" font-size="11" font-weight="bold" fill="#3d2411" text-anchor="middle" letter-spacing="2">COELUM STELLATUM</text>
      <line x1="24" y1="38" x2="176" y2="38" stroke="#caa468" stroke-width="1"/>
      <circle cx="100" cy="98" r="50" fill="#f8eed9" stroke="#3d2411" stroke-width="1.5"/>
      <circle cx="100" cy="98" r="42" fill="none" stroke="#caa468" stroke-width="0.8" stroke-dasharray="3 2"/>
      <circle cx="100" cy="98" r="28" fill="none" stroke="#3d2411" stroke-width="0.8"/>
      <path d="M72 80 L88 72 L112 78 L124 94 L114 116 L92 112Z" fill="none" stroke="#1d4575" stroke-width="1.2"/>
      <circle cx="72" cy="80" r="2.2" fill="#b8832a"/>
      <circle cx="88" cy="72" r="2.8" fill="#b8832a"/>
      <circle cx="112" cy="78" r="2.2" fill="#b8832a"/>
      <circle cx="124" cy="94" r="2.2" fill="#b8832a"/>
      <circle cx="114" cy="116" r="2.8" fill="#b8832a"/>
      <circle cx="92" cy="112" r="2.2" fill="#b8832a"/>
      <circle cx="100" cy="98" r="3.2" fill="#9e2819"/>
      <circle cx="100" cy="204" r="44" fill="#f8eed9" stroke="#3d2411" stroke-width="1.5"/>
      <polygon points="100,166 133,223 67,223" fill="none" stroke="#caa468" stroke-width="1"/>
      <polygon points="100,242 133,185 67,185" fill="none" stroke="#caa468" stroke-width="1"/>
      <circle cx="100" cy="204" r="20" fill="none" stroke="#9e2819" stroke-width="1.2"/>
      <circle cx="50" cy="268" r="6" fill="#3d2411"/>
      <circle cx="75" cy="268" r="6" fill="#eeddb6" stroke="#3d2411" stroke-width="1"/>
      <path d="M75 262 A6 6 0 0 1 75 274 A3.5 6 0 0 0 75 262" fill="#3d2411"/>
      <circle cx="100" cy="268" r="6" fill="#fcf6e8" stroke="#3d2411" stroke-width="1"/>
      <circle cx="125" cy="268" r="6" fill="#3d2411"/>
      <path d="M125 262 A6 6 0 0 0 125 274 A3.5 6 0 0 1 125 262" fill="#fcf6e8"/>
      <circle cx="150" cy="268" r="6" fill="#3d2411"/>
    </svg>`,
    { size: 256 }
  );

  // 6. Illuminated Spell Scroll Banner
  const SPELL_SCROLL = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 280">
      <rect width="140" height="280" rx="3" fill="#f0dfbd"/>
      <rect x="6" y="8" width="128" height="264" rx="2" fill="none" stroke="#946d3e" stroke-width="1.5"/>
      <circle cx="70" cy="45" r="24" fill="#faeed4" stroke="#8a1f29" stroke-width="1.5"/>
      <polygon points="70,26 89,55 51,55" fill="none" stroke="#caa468" stroke-width="1.2"/>
      <polygon points="70,64 89,35 51,35" fill="none" stroke="#caa468" stroke-width="1.2"/>
      <circle cx="70" cy="45" r="8" fill="none" stroke="#8a1f29" stroke-width="1"/>
      <rect x="18" y="82" width="104" height="3" rx="1.5" fill="#3d2616"/>
      <rect x="18" y="92" width="96" height="2.5" rx="1" fill="#543720"/>
      <rect x="18" y="100" width="100" height="2.5" rx="1" fill="#543720"/>
      <circle cx="70" cy="145" r="28" fill="none" stroke="#2a456c" stroke-width="1.5"/>
      <circle cx="70" cy="145" r="20" fill="none" stroke="#caa468" stroke-width="1" stroke-dasharray="2 2"/>
      <circle cx="70" cy="145" r="6" fill="#8a1f29"/>
      <rect x="18" y="186" width="104" height="2.5" rx="1" fill="#543720"/>
      <rect x="18" y="195" width="98" height="2.5" rx="1" fill="#543720"/>
      <rect x="18" y="204" width="102" height="2.5" rx="1" fill="#543720"/>
      <circle cx="70" cy="245" r="16" fill="#8f1925" stroke="#5a0e16" stroke-width="1.5"/>
      <circle cx="70" cy="245" r="11" fill="none" stroke="#caa468" stroke-width="1"/>
      <polygon points="70,237 77,249 63,249" fill="#caa468"/>
    </svg>`,
    { size: 256 }
  );

  // 7. Arcane Runic Ring (Orb Aura)
  const ARCANE_RING = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
      <circle cx="128" cy="128" r="118" fill="none" stroke="#54ebff" stroke-width="3"/>
      <circle cx="128" cy="128" r="106" fill="none" stroke="#fcd96d" stroke-width="1.5" stroke-dasharray="4 6"/>
      <circle cx="128" cy="128" r="92" fill="none" stroke="#54ebff" stroke-width="2"/>
      <polygon points="128,40 190,128 128,216 66,128" fill="none" stroke="#fcd96d" stroke-width="1.5"/>
      <polygon points="128,40 190,128 128,216 66,128" fill="none" stroke="#54ebff" stroke-width="1.5" transform="rotate(45 128 128)"/>
      <circle cx="128" cy="128" r="64" fill="none" stroke="#b362ff" stroke-width="2"/>
      <circle cx="128" cy="22" r="4" fill="#54ebff"/>
      <circle cx="128" cy="234" r="4" fill="#54ebff"/>
      <circle cx="22" cy="128" r="4" fill="#54ebff"/>
      <circle cx="234" cy="128" r="4" fill="#54ebff"/>
      <circle cx="53" cy="53" r="3" fill="#fcd96d"/>
      <circle cx="203" cy="53" r="3" fill="#fcd96d"/>
      <circle cx="53" cy="203" r="3" fill="#fcd96d"/>
      <circle cx="203" cy="203" r="3" fill="#fcd96d"/>
    </svg>`,
    { size: 256 }
  );

  // 8. Anime Stylized Candle Flame
  const CANDLE_FLAME = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 96">
      <path d="M32 6 Q52 46 44 76 Q32 94 32 94 Q32 94 20 76 Q12 46 32 6Z" fill="#ff7300" opacity="0.9"/>
      <path d="M32 18 Q46 48 40 74 Q32 88 32 88 Q32 88 24 74 Q18 48 32 18Z" fill="#ffcc00"/>
      <path d="M32 36 Q40 56 37 72 Q32 82 32 82 Q32 82 27 72 Q24 56 32 36Z" fill="#ffffff"/>
      <circle cx="32" cy="8" r="2.5" fill="#fff2aa"/>
    </svg>`,
    { size: 128 }
  );

  // 9. Crimson Wax Seal Stamp
  const WAX_SEAL = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="30" fill="#8f1825"/>
      <circle cx="32" cy="32" r="26" fill="#a82230" stroke="#6b101a" stroke-width="1.5"/>
      <circle cx="32" cy="32" r="20" fill="none" stroke="#dcb15b" stroke-width="1.8"/>
      <polygon points="32,16 42,38 22,38" fill="none" stroke="#dcb15b" stroke-width="1.4"/>
      <polygon points="32,48 42,26 22,26" fill="none" stroke="#dcb15b" stroke-width="1.4"/>
      <circle cx="32" cy="32" r="4" fill="#fce592"/>
    </svg>`,
    { size: 128 }
  );

  // 10. Floating Magic Sparkle Card
  const MAGIC_SPARKLE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M32 2 Q32 32 2 32 Q32 32 32 62 Q32 32 62 32 Q32 32 32 2Z" fill="#ffffff"/>
      <path d="M32 14 Q32 32 14 32 Q32 32 32 50 Q32 32 50 32 Q32 32 32 14Z" fill="#6df2ff"/>
      <circle cx="32" cy="32" r="3.5" fill="#ffffff"/>
    </svg>`,
    { size: 64 }
  );

  // ---------------------------------------------------------------------------
  // Staged Floor Dais (Platform)
  // ---------------------------------------------------------------------------
  // Octagonal flagstone base (y = 0 to 0.04)
  b.part(new THREE.CylinderGeometry(0.86, 0.90, 0.04, 16), STONE, {
    bone: root,
    at: [0, 0.02, 0.04],
  });
  // Dark stone rim band
  b.part(new THREE.CylinderGeometry(0.88, 0.90, 0.015, 16), STONE_RIM, {
    bone: root,
    at: [0, 0.0075, 0.04],
  });
  // Inlaid brass arcane perimeter ring
  b.part(new THREE.CylinderGeometry(0.78, 0.78, 0.042, 16), BRASS_DARK, {
    bone: root,
    at: [0, 0.021, 0.04],
  });
  b.part(new THREE.CylinderGeometry(0.76, 0.76, 0.043, 16), STONE, {
    bone: root,
    at: [0, 0.022, 0.04],
  });

  // ---------------------------------------------------------------------------
  // Bookshelf Main Carcass Architecture
  // ---------------------------------------------------------------------------
  // Base plinth
  b.part(new THREE.BoxGeometry(1.22, 0.08, 0.42), WOOD, {
    bone: root,
    at: [0, 0.08, 0],
  });
  b.part(new THREE.BoxGeometry(1.24, 0.02, 0.44), WOOD_TRIM, {
    bone: root,
    at: [0, 0.11, 0],
  });

  // Left & Right Vertical Columns (Uprights)
  const COL_X = 0.54;
  for (const s of [1, -1]) {
    // Main column body
    b.part(new THREE.BoxGeometry(0.12, 1.80, 0.38), WOOD, {
      bone: root,
      at: [s * COL_X, 1.02, 0],
    });
    // Front fluted pilaster trim
    b.part(new THREE.BoxGeometry(0.04, 1.76, 0.02), WOOD_TRIM, {
      bone: root,
      at: [s * COL_X, 1.02, 0.19],
    });
    // Side fluted trim
    b.part(new THREE.BoxGeometry(0.02, 1.76, 0.04), WOOD_TRIM, {
      bone: root,
      at: [s * (COL_X + 0.05), 1.02, 0],
    });
    // Base capital block
    b.part(new THREE.BoxGeometry(0.14, 0.05, 0.40), BRASS_DARK, {
      bone: root,
      at: [s * COL_X, 0.145, 0],
    });
    // Top carved corbel capital
    b.part(new THREE.BoxGeometry(0.15, 0.08, 0.42), BRASS, {
      bone: root,
      at: [s * COL_X, 1.88, 0],
    });
    // Side corbel scrollwork bracket
    b.part(new THREE.BoxGeometry(0.04, 0.12, 0.14), WOOD_TRIM, {
      bone: root,
      at: [s * (COL_X - 0.04), 1.78, 0.10],
    });
  }

  // Rear Backboard (Dark stained wood backing)
  b.part(new THREE.BoxGeometry(1.02, 1.76, 0.02), WOOD, {
    bone: root,
    at: [0, 1.02, -0.16],
  });
  // Backboard center decorative brass starburst
  b.part(new THREE.SphereGeometry(0.025, 8, 6), BRASS, {
    bone: root,
    at: [0, 1.25, -0.145],
  });

  // Shelves:
  // Shelf 0 (Bottom): y = 0.16, top = 0.175
  // Shelf 1 (Lower-Mid): y = 0.60, top = 0.615
  // Shelf 2 (Middle Hero): y = 1.04, top = 1.055
  // Shelf 3 (Upper): y = 1.48, top = 1.495
  // Shelf 4 (Top Header Deck): y = 1.92, top = 1.935
  const SHELF_YS = [0.16, 0.60, 1.04, 1.48, 1.92];
  for (let i = 0; i < SHELF_YS.length; i++) {
    const sy = SHELF_YS[i];
    // Wooden shelf board
    b.part(new THREE.BoxGeometry(1.02, 0.03, 0.34), WOOD, {
      bone: root,
      at: [0, sy, 0],
    });
    // Gilded brass front edge moulding
    b.part(new THREE.BoxGeometry(1.02, 0.016, 0.014), BRASS, {
      bone: root,
      at: [0, sy, 0.175],
    });
    // Brass shelf corner bracket braces (left and right)
    for (const s of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.015, 0.04, 0.04), BRASS_DARK, {
        bone: root,
        at: [s * 0.49, sy - 0.025, 0.14],
      });
    }
  }

  // Top Header Cornice & Gothic Arched Crest (y = 1.94 to 2.22)
  b.part(new THREE.BoxGeometry(1.26, 0.05, 0.44), WOOD_TRIM, {
    bone: root,
    at: [0, 1.96, 0],
  });
  b.part(new THREE.BoxGeometry(1.22, 0.02, 0.42), BRASS, {
    bone: root,
    at: [0, 1.99, 0],
  });

  // Gothic Pointed Arch Extruded Silhouette
  const archOutline: [number, number, ...("sharp")[]][] = [
    [-0.56, 0],
    [-0.56, 0.08],
    [-0.38, 0.15],
    [-0.16, 0.24],
    [0, 0.30, "sharp"],
    [0.16, 0.24],
    [0.38, 0.15],
    [0.56, 0.08],
    [0.56, 0],
  ];
  b.extrude(archOutline, {
    bone: root,
    at: [0, 2.00, 0.16],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.04,
    bevel: 0.005,
    color: WOOD,
  });

  // Central Carved Gilded Sunburst Medallion on Arch
  b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.02, 16), BRASS, {
    bone: root,
    at: [0, 2.14, 0.185],
    dir: [0, 0, 1],
  });
  b.part(new THREE.SphereGeometry(0.035, 10, 8), BRASS_LIGHT, {
    bone: root,
    at: [0, 2.14, 0.195],
  });

  // Corner Gilded Spire Finials
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.035, 0.04, 0.04, 10), BRASS_DARK, {
      bone: root,
      at: [s * 0.54, 2.03, 0.16],
    });
    b.part(new THREE.SphereGeometry(0.03, 10, 8), BRASS, {
      bone: root,
      at: [s * 0.54, 2.08, 0.16],
    });
    b.part(new THREE.ConeGeometry(0.025, 0.09, 10), BRASS_LIGHT, {
      bone: root,
      at: [s * 0.54, 2.15, 0.16],
    });
  }

  // ---------------------------------------------------------------------------
  // Reading Lectern Extension (Projecting from Shelf 2)
  // ---------------------------------------------------------------------------
  // Sloping wooden reading stand in center (y = 1.055 to 1.13)
  const LECTERN_PITCH = 16 * (Math.PI / 180);
  const cosP = Math.cos(LECTERN_PITCH);
  const sinP = Math.sin(LECTERN_PITCH);

  // Wooden support bracket beneath lectern
  b.part(new THREE.BoxGeometry(0.18, 0.12, 0.12), WOOD_TRIM, {
    bone: root,
    at: [0, 0.98, 0.18],
  });
  // Slanted lectern board
  b.part(new THREE.BoxGeometry(0.42, 0.02, 0.28), WOOD, {
    bone: root,
    at: [0, 1.085, 0.22],
    rotation: [-16, 0, 0],
  });
  // Bottom retaining lip to hold open book
  b.part(new THREE.BoxGeometry(0.42, 0.03, 0.02), BRASS, {
    bone: root,
    at: [0, 1.05, 0.33],
    rotation: [-16, 0, 0],
  });

  // ---------------------------------------------------------------------------
  // Helper: Place a Detailed Grimoire
  // ---------------------------------------------------------------------------
  type BookOpts = {
    at: [number, number, number];
    w: number; // width of cover
    h: number; // height along spine
    d: number; // depth/thickness of pages
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

    // Pages paper block (slightly inset from covers)
    b.part(new THREE.BoxGeometry(opts.w - 0.008, opts.h - 0.012, opts.d - 0.004), PAPER, {
      bone: root,
      at: opts.at,
      rotation: [rx, ry, rz],
    });

    // Leather covers & spine
    // Left/back cover
    b.part(new THREE.BoxGeometry(opts.w, opts.h, 0.0025), opts.color, {
      bone: root,
      at: [opts.at[0], opts.at[1], opts.at[2] - (opts.d / 2 - 0.001)],
      rotation: [rx, ry, rz],
    });
    // Right/front cover
    b.part(new THREE.BoxGeometry(opts.w, opts.h, 0.0025), opts.color, {
      bone: root,
      at: [opts.at[0], opts.at[1], opts.at[2] + (opts.d / 2 - 0.001)],
      rotation: [rx, ry, rz],
    });
    // Spine band
    b.part(new THREE.BoxGeometry(0.003, opts.h, opts.d), opts.color, {
      bone: root,
      at: [opts.at[0] - opts.w / 2, opts.at[1], opts.at[2]],
      rotation: [rx, ry, rz],
    });
    // 3 Gilded spine ribs
    for (const dy of [-opts.h * 0.28, 0, opts.h * 0.28]) {
      b.part(new THREE.BoxGeometry(0.005, 0.006, opts.d + 0.003), BRASS, {
        bone: root,
        at: [opts.at[0] - opts.w / 2, opts.at[1] + dy, opts.at[2]],
        rotation: [rx, ry, rz],
      });
    }

    // Front Cover Texture Decal (if provided)
    if (opts.coverTex) {
      b.part(new THREE.PlaneGeometry(opts.w * 0.94, opts.h * 0.94), "#ffffff", {
        bone: root,
        at: [opts.at[0], opts.at[1], opts.at[2] + (opts.d / 2 + 0.0015)],
        rotation: [rx, ry, rz],
        texture: opts.coverTex,
        axis: "z",
      });
    }

    // Bookmark Ribbon
    if (opts.ribbon) {
      b.part(new THREE.BoxGeometry(0.014, 0.07, 0.001), opts.ribbon, {
        bone: root,
        at: [opts.at[0] + 0.02, opts.at[1] - opts.h / 2 - 0.02, opts.at[2]],
        rotation: [rx, ry, rz],
      });
    }
  }

  // ---------------------------------------------------------------------------
  // SHELF 0 (Bottom Shelf, surface y = 0.175)
  // Large ancient folios, ledger tomes, scroll cubby, and leaning books
  // ---------------------------------------------------------------------------
  // Left side: Row of 5 massive ancient grimoires
  placeBook({
    at: [-0.44, 0.36, 0.02],
    w: 0.24,
    h: 0.36,
    d: 0.065,
    color: LEATHER_NAVY,
    coverTex: BOOK_COVER_A,
    ribbon: "#ff3344",
  });
  placeBook({
    at: [-0.37, 0.34, 0.02],
    w: 0.22,
    h: 0.33,
    d: 0.055,
    color: LEATHER_OBSIDIAN,
  });
  placeBook({
    at: [-0.305, 0.365, 0.02],
    w: 0.25,
    h: 0.37,
    d: 0.070,
    color: LEATHER_RUBY,
    coverTex: BOOK_COVER_B,
  });
  placeBook({
    at: [-0.245, 0.33, 0.02],
    w: 0.21,
    h: 0.31,
    d: 0.045,
    color: LEATHER_EMERALD,
  });
  placeBook({
    at: [-0.19, 0.35, 0.02],
    w: 0.23,
    h: 0.34,
    d: 0.055,
    color: LEATHER_AMBER,
  });

  // Center: Stack of 3 horizontal ledger tomes
  // Bottom tome
  b.part(new THREE.BoxGeometry(0.24, 0.055, 0.20), LEATHER_OBSIDIAN, {
    bone: root,
    at: [0, 0.205, 0.02],
  });
  b.part(new THREE.BoxGeometry(0.22, 0.045, 0.18), PAPER, {
    bone: root,
    at: [0.01, 0.205, 0.02],
  });
  // Middle tome
  b.part(new THREE.BoxGeometry(0.22, 0.050, 0.18), LEATHER_NAVY, {
    bone: root,
    at: [0.01, 0.255, 0.01],
    rotation: [0, 5, 0],
  });
  // Top tome with cover texture facing up
  b.part(new THREE.BoxGeometry(0.20, 0.045, 0.16), LEATHER_RUBY, {
    bone: root,
    at: [-0.01, 0.30, 0.015],
    rotation: [0, -7, 0],
  });
  b.part(new THREE.PlaneGeometry(0.18, 0.14), "#ffffff", {
    bone: root,
    at: [-0.01, 0.324, 0.015],
    rotation: [-90, -7, 0],
    texture: BOOK_COVER_B,
    axis: "z",
  });
  // Silk bookmark trailing out of stack
  b.part(new THREE.BoxGeometry(0.016, 0.001, 0.08), "#d92638", {
    bone: root,
    at: [0.02, 0.276, 0.12],
    rotation: [15, 5, 0],
  });

  // Center-Right: Wooden Scroll Cubby / Bin with Rolled Scrolls
  b.part(new THREE.BoxGeometry(0.18, 0.22, 0.24), WOOD_TRIM, {
    bone: root,
    at: [0.18, 0.285, 0.02],
  });
  // Hollow interior illusion (dark recess)
  b.part(new THREE.BoxGeometry(0.15, 0.19, 0.22), "#1a120c", {
    bone: root,
    at: [0.18, 0.285, 0.03],
  });

  // Rolled scrolls inside cubby
  const SCROLL_SLOTS: [number, number, number, number][] = [
    [0.14, 0.24, 0.04, 12],
    [0.17, 0.26, 0.06, -8],
    [0.21, 0.23, 0.03, 15],
    [0.15, 0.30, 0.05, -5],
    [0.19, 0.32, 0.06, 10],
    [0.22, 0.29, 0.04, -12],
  ];
  for (let idx = 0; idx < SCROLL_SLOTS.length; idx++) {
    const [sx, sy, sz, rotZ] = SCROLL_SLOTS[idx];
    b.part(new THREE.CylinderGeometry(0.015, 0.015, 0.18, 10), PAPER, {
      bone: root,
      at: [sx, sy, sz],
      rotation: [20, 0, rotZ],
    });
    // Ribbon tie
    const ribCol = idx % 2 === 0 ? "#8a1f29" : "#1a3b5c";
    b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.02, 10), ribCol, {
      bone: root,
      at: [sx, sy, sz],
      rotation: [20, 0, rotZ],
    });
  }

  // Right Side: Leaning Book against Crescent Moon Bookend
  b.part(new THREE.BoxGeometry(0.08, 0.02, 0.16), BRASS_DARK, {
    bone: root,
    at: [0.44, 0.185, 0.02],
  });
  // Crescent moon bookend
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.015, 16), BRASS, {
    bone: root,
    at: [0.44, 0.25, 0.02],
    dir: [1, 0, 0],
  });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 16), "#2c1b18", {
    bone: root,
    at: [0.44, 0.26, 0.05],
    dir: [1, 0, 0],
  });
  // 2 Upright books
  placeBook({
    at: [0.31, 0.33, 0.02],
    w: 0.22,
    h: 0.31,
    d: 0.045,
    color: LEATHER_TEAL,
  });
  placeBook({
    at: [0.355, 0.34, 0.02],
    w: 0.23,
    h: 0.32,
    d: 0.045,
    color: LEATHER_VIOLET,
    coverTex: BOOK_COVER_C,
  });
  // Leaning book at 18 degrees
  placeBook({
    at: [0.40, 0.31, 0.02],
    w: 0.21,
    h: 0.30,
    d: 0.045,
    color: LEATHER_AMBER,
    rotZ: -16,
  });

  // ---------------------------------------------------------------------------
  // SHELF 1 (Lower-Mid Shelf, surface y = 0.615)
  // Alchemical laboratory: test tube vial rack, potion flasks, and hourglass
  // ---------------------------------------------------------------------------
  // Left side: Row of 6 colourful grimoires
  const S1_BOOKS: [number, string, THREE.Texture | undefined][] = [
    [-0.43, LEATHER_RUBY, BOOK_COVER_B],
    [-0.38, LEATHER_NAVY, undefined],
    [-0.335, LEATHER_EMERALD, undefined],
    [-0.29, LEATHER_VIOLET, BOOK_COVER_C],
    [-0.245, LEATHER_AMBER, undefined],
    [-0.20, LEATHER_OBSIDIAN, BOOK_COVER_A],
  ];
  for (let idx = 0; idx < S1_BOOKS.length; idx++) {
    const [bx, col, tex] = S1_BOOKS[idx];
    placeBook({
      at: [bx, 0.74, 0.02],
      w: 0.18,
      h: 0.25,
      d: 0.042,
      color: col,
      coverTex: tex,
    });
  }

  // Center: Alchemical Potion Rack with 4 Glowing Test Tubes
  // Wooden rack frame
  b.part(new THREE.BoxGeometry(0.18, 0.012, 0.045), WOOD_TRIM, {
    bone: root,
    at: [-0.02, 0.621, 0.05],
  });
  b.part(new THREE.BoxGeometry(0.18, 0.010, 0.045), WOOD_TRIM, {
    bone: root,
    at: [-0.02, 0.675, 0.05],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.012, 0.07, 0.045), WOOD_TRIM, {
      bone: root,
      at: [-0.02 + s * 0.08, 0.65, 0.05],
    });
  }
  // 4 Glowing Test Tube Vials
  const VIAL_COLS = [GLOW_CYAN, GLOW_MAGENTA, GLOW_EMERALD, GLOW_AMBER];
  for (let idx = 0; idx < 4; idx++) {
    const vx = -0.075 + idx * 0.038;
    // Glowing liquid inside tube
    glow(
      b.part(new THREE.CylinderGeometry(0.010, 0.010, 0.055, 10), VIAL_COLS[idx], {
        bone: root,
        at: [vx, 0.655, 0.05],
      }),
      1.8
    );
    // Cork stopper
    b.part(new THREE.CylinderGeometry(0.009, 0.008, 0.012, 8), CORK, {
      bone: root,
      at: [vx, 0.688, 0.05],
    });
  }

  // Large Round-Bottom Boiling Flask with Glowing Amethyst Liquid
  b.part(new THREE.CylinderGeometry(0.03, 0.035, 0.015, 12), BRASS_DARK, {
    bone: root,
    at: [0.13, 0.622, 0.05],
  });
  // Glass bulb with glowing elixir
  glow(
    b.part(new THREE.SphereGeometry(0.045, 14, 10), GLOW_AMETHYST, {
      bone: root,
      at: [0.13, 0.67, 0.05],
    }),
    2.0
  );
  // Cylindrical neck & brass lip
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.05, 10), BRASS, {
    bone: root,
    at: [0.13, 0.725, 0.05],
  });
  b.part(new THREE.TorusGeometry(0.016, 0.004, 8, 16), BRASS_LIGHT, {
    bone: root,
    at: [0.13, 0.75, 0.05],
    rotation: [90, 0, 0],
  });
  // Cork in boiling flask
  b.part(new THREE.CylinderGeometry(0.012, 0.010, 0.018, 8), CORK, {
    bone: root,
    at: [0.13, 0.758, 0.05],
  });

  // Right Side: Grand Brass Hourglass
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.008, 12), BRASS, {
    bone: root,
    at: [0.26, 0.62, 0.03],
  });
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.008, 12), BRASS, {
    bone: root,
    at: [0.26, 0.74, 0.03],
  });
  // 3 Vertical brass rods
  for (let a = 0; a < 3; a++) {
    const ang = a * ((Math.PI * 2) / 3);
    b.part(new THREE.CylinderGeometry(0.003, 0.003, 0.12, 6), BRASS_DARK, {
      bone: root,
      at: [0.26 + Math.cos(ang) * 0.032, 0.68, 0.03 + Math.sin(ang) * 0.032],
    });
  }
  // Glass bulbs (two cones tip-to-tip)
  b.part(new THREE.ConeGeometry(0.032, 0.055, 10), "#bce8f5", {
    bone: root,
    at: [0.26, 0.705, 0.03],
    rotation: [180, 0, 0],
  });
  b.part(new THREE.ConeGeometry(0.032, 0.055, 10), "#bce8f5", {
    bone: root,
    at: [0.26, 0.655, 0.03],
  });
  // Glowing golden sand inside bottom bulb
  glow(
    b.part(new THREE.ConeGeometry(0.024, 0.035, 8), GLOW_GOLD, {
      bone: root,
      at: [0.26, 0.642, 0.03],
    }),
    1.6
  );

  // Brass Mortar & Pestle with Glowing Blue Mana Powder
  b.part(new THREE.CylinderGeometry(0.038, 0.025, 0.04, 12), BRASS, {
    bone: root,
    at: [0.38, 0.635, 0.04],
  });
  // Glowing powder in mortar
  glow(
    b.part(new THREE.CylinderGeometry(0.030, 0.030, 0.008, 12), GLOW_CYAN, {
      bone: root,
      at: [0.38, 0.648, 0.04],
    }),
    1.8
  );
  // Pestle angled in mortar
  b.part(new THREE.CylinderGeometry(0.007, 0.010, 0.07, 8), BRASS_LIGHT, {
    bone: root,
    at: [0.39, 0.665, 0.04],
    rotation: [15, 0, -25],
  });

  // ---------------------------------------------------------------------------
  // SHELF 2 (Middle Hero Shelf, surface y = 1.055)
  // The Hero Open Grimoire on Lectern, 3-Candle Candelabra, Quill & Ink
  // ---------------------------------------------------------------------------

  // The Hero Open Grimoire:
  // Positioned on the sloping lectern at x = 0, y = 1.09, z = 0.22, tilted 16° backward
  // Open book wooden / leather back
  b.part(new THREE.BoxGeometry(0.36, 0.015, 0.24), LEATHER_RUBY, {
    bone: root,
    at: [0, 1.092, 0.21],
    rotation: [-16, 0, 0],
  });
  // Left page block wedge
  b.part(new THREE.BoxGeometry(0.165, 0.020, 0.22), PAPER, {
    bone: root,
    at: [-0.086, 1.103, 0.21],
    rotation: [-16, 0, 3],
  });
  // Right page block wedge
  b.part(new THREE.BoxGeometry(0.165, 0.020, 0.22), PAPER, {
    bone: root,
    at: [0.086, 1.103, 0.21],
    rotation: [-16, 0, -3],
  });

  // Open Book Illuminated Texture Plane
  // Facing normal matches lectern angle: normal = [0, cosP, sinP], up = [0, -sinP, cosP]
  b.part(new THREE.PlaneGeometry(0.34, 0.22), "#ffffff", {
    bone: root,
    at: [0, 1.115, 0.208],
    dir: [0, cosP, sinP],
    axis: "z",
    up: [0, sinP, -cosP],
    texture: OPEN_BOOK_PAGES,
  });

  // Bookmark silk ribbon trailing down the center and over the lectern lip
  b.part(new THREE.BoxGeometry(0.016, 0.002, 0.12), "#a61b2b", {
    bone: root,
    at: [0, 1.085, 0.27],
    rotation: [-16, 0, 0],
  });
  b.part(new THREE.BoxGeometry(0.016, 0.04, 0.002), "#a61b2b", {
    bone: root,
    at: [0, 1.035, 0.332],
  });

  // Floating Arcane Magic Sparkles above Open Grimoire
  const SPARKLE_POS: [number, number, number][] = [
    [-0.04, 1.25, 0.20],
    [0.05, 1.28, 0.18],
    [0.00, 1.22, 0.23],
  ];
  for (const spos of SPARKLE_POS) {
    glow(
      b.part(new THREE.PlaneGeometry(0.028, 0.028), "#ffffff", {
        bone: root,
        at: spos,
        texture: MAGIC_SPARKLE,
        axis: "z",
      }),
      2.2
    );
    glow(
      b.part(new THREE.PlaneGeometry(0.028, 0.028), "#ffffff", {
        bone: root,
        at: spos,
        dir: [1, 0, 0],
        texture: MAGIC_SPARKLE,
        axis: "z",
      }),
      2.2
    );
  }

  // To the Right: Three-Candle Brass Candelabra
  const CANDLE_X = 0.34;
  const CANDLE_Z = 0.06;
  // Candelabra base
  b.part(new THREE.CylinderGeometry(0.045, 0.052, 0.015, 12), BRASS, {
    bone: root,
    at: [CANDLE_X, 1.062, CANDLE_Z],
  });
  // Center turned baluster stem
  b.part(new THREE.CylinderGeometry(0.012, 0.016, 0.08, 10), BRASS_DARK, {
    bone: root,
    at: [CANDLE_X, 1.105, CANDLE_Z],
  });
  b.part(new THREE.SphereGeometry(0.02, 10, 8), BRASS_LIGHT, {
    bone: root,
    at: [CANDLE_X, 1.145, CANDLE_Z],
  });

  // Left & Right curved brass arms
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.04, 0.006, 6, 12, Math.PI), BRASS, {
      bone: root,
      at: [CANDLE_X + s * 0.04, 1.145, CANDLE_Z],
      rotation: [0, 0, s > 0 ? 180 : 0],
    });
  }

  // 3 Candle Cups, Wax Candles, Dripping Wax & Lit Anime Flames
  const CANDLE_CUPS: [number, number, number][] = [
    [CANDLE_X, 1.16, 0.075],          // Center: taller candle
    [CANDLE_X - 0.075, 1.145, 0.055], // Left: medium candle
    [CANDLE_X + 0.075, 1.145, 0.045], // Right: shorter candle
  ];

  for (let idx = 0; idx < CANDLE_CUPS.length; idx++) {
    const [cx, cy, ch] = CANDLE_CUPS[idx];
    // Drip pan saucer
    b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.005, 10), BRASS, {
      bone: root,
      at: [cx, cy, CANDLE_Z],
    });
    // Candle cup
    b.part(new THREE.CylinderGeometry(0.015, 0.012, 0.014, 10), BRASS_DARK, {
      bone: root,
      at: [cx, cy + 0.008, CANDLE_Z],
    });
    // Ivory wax candle body
    b.part(new THREE.CylinderGeometry(0.011, 0.011, ch, 10), WAX, {
      bone: root,
      at: [cx, cy + 0.015 + ch / 2, CANDLE_Z],
    });
    // Melted wax drip ridges
    b.part(new THREE.SphereGeometry(0.005, 6, 4), WAX_MELT, {
      bone: root,
      at: [cx + 0.009, cy + ch + 0.005, CANDLE_Z],
    });
    b.part(new THREE.SphereGeometry(0.004, 6, 4), WAX_MELT, {
      bone: root,
      at: [cx - 0.008, cy + ch - 0.01, CANDLE_Z + 0.006],
    });

    // Black thread wick
    const wickTopY = cy + 0.015 + ch + 0.007;
    b.part(new THREE.CylinderGeometry(0.0015, 0.0015, 0.008, 4), "#111111", {
      bone: root,
      at: [cx, cy + 0.015 + ch + 0.004, CANDLE_Z],
    });

    // Crossed Anime Flame Cards (illuminated with glow)
    const flameAt: [number, number, number] = [cx, wickTopY + 0.020, CANDLE_Z];
    glow(
      b.part(new THREE.PlaneGeometry(0.024, 0.038), FLAME_CORE, {
        bone: root,
        at: flameAt,
        texture: CANDLE_FLAME,
        axis: "z",
      }),
      2.2
    );
    glow(
      b.part(new THREE.PlaneGeometry(0.024, 0.038), FLAME_CORE, {
        bone: root,
        at: flameAt,
        dir: [1, 0, 0],
        texture: CANDLE_FLAME,
        axis: "z",
      }),
      2.2
    );
  }

  // Inkwell & Feather Quill (beside candelabra)
  b.part(new THREE.CylinderGeometry(0.022, 0.026, 0.032, 10), "#1c1824", {
    bone: root,
    at: [0.24, 1.071, 0.12],
  });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.010, 8), BRASS, {
    bone: root,
    at: [0.24, 1.092, 0.12],
  });
  // Iridescent White Feather Quill leaning in inkwell
  b.part(new THREE.CylinderGeometry(0.002, 0.001, 0.16, 6), "#ede6d8", {
    bone: root,
    at: [0.25, 1.145, 0.11],
    rotation: [15, 0, 22],
  });
  b.part(new THREE.BoxGeometry(0.018, 0.08, 0.002), "#ffffff", {
    bone: root,
    at: [0.26, 1.175, 0.10],
    rotation: [15, 0, 22],
  });

  // To the Left: Stacked tomes with brass magnifying glass
  b.part(new THREE.BoxGeometry(0.18, 0.045, 0.22), LEATHER_NAVY, {
    bone: root,
    at: [-0.30, 1.077, 0.04],
  });
  b.part(new THREE.BoxGeometry(0.17, 0.040, 0.20), LEATHER_EMERALD, {
    bone: root,
    at: [-0.29, 1.120, 0.035],
    rotation: [0, 8, 0],
  });
  // Brass magnifying glass resting on top of stack
  b.part(new THREE.TorusGeometry(0.032, 0.004, 8, 16), BRASS, {
    bone: root,
    at: [-0.29, 1.145, 0.04],
    rotation: [90, 0, 0],
  });
  b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.065, 8), WOOD_TRIM, {
    bone: root,
    at: [-0.24, 1.145, 0.04],
    rotation: [0, 0, 90],
  });

  // Draped parchment scroll hanging forward over the shelf edge
  b.part(new THREE.PlaneGeometry(0.12, 0.18), "#ffffff", {
    bone: root,
    at: [-0.42, 1.06, 0.08],
    rotation: [-90, 0, 0],
    texture: SPELL_SCROLL,
    axis: "z",
  });
  b.part(new THREE.PlaneGeometry(0.12, 0.14), "#ffffff", {
    bone: root,
    at: [-0.42, 0.99, 0.171],
    texture: SPELL_SCROLL,
    axis: "z",
  });

  // ---------------------------------------------------------------------------
  // SHELF 3 (Upper Shelf, surface y = 1.495)
  // Armillary sphere, pocket grimoires, and glowing amethyst crystal cluster
  // ---------------------------------------------------------------------------

  // Left Side: Mini Armillary Sphere (Astrolabe)
  const ASTRO_X = -0.34;
  const ASTRO_Z = 0.02;
  b.part(new THREE.CylinderGeometry(0.04, 0.045, 0.015, 12), BRASS, {
    bone: root,
    at: [ASTRO_X, 1.502, ASTRO_Z],
  });
  b.part(new THREE.CylinderGeometry(0.008, 0.012, 0.06, 8), BRASS_DARK, {
    bone: root,
    at: [ASTRO_X, 1.535, ASTRO_Z],
  });
  // Concentric brass rings
  b.part(new THREE.TorusGeometry(0.055, 0.004, 8, 20), BRASS, {
    bone: root,
    at: [ASTRO_X, 1.60, ASTRO_Z],
    rotation: [0, 0, 0],
  });
  b.part(new THREE.TorusGeometry(0.055, 0.004, 8, 20), BRASS_LIGHT, {
    bone: root,
    at: [ASTRO_X, 1.60, ASTRO_Z],
    rotation: [90, 0, 0],
  });
  b.part(new THREE.TorusGeometry(0.055, 0.004, 8, 20), BRASS, {
    bone: root,
    at: [ASTRO_X, 1.60, ASTRO_Z],
    rotation: [35, 45, 0],
  });
  // Inner glowing star pearl
  glow(
    b.part(new THREE.SphereGeometry(0.018, 10, 8), GLOW_GOLD, {
      bone: root,
      at: [ASTRO_X, 1.60, ASTRO_Z],
    }),
    2.0
  );

  // Center: Row of 7 Pocket Grimoires
  const S3_BOOKS: [number, string, number, THREE.Texture | undefined][] = [
    [-0.20, LEATHER_OBSIDIAN, 0.22, undefined],
    [-0.15, LEATHER_RUBY, 0.24, BOOK_COVER_B],
    [-0.105, LEATHER_TEAL, 0.20, undefined],
    [-0.06, LEATHER_VIOLET, 0.25, BOOK_COVER_C],
    [-0.015, LEATHER_AMBER, 0.21, undefined],
    [0.03, LEATHER_NAVY, 0.26, BOOK_COVER_A],
    [0.075, LEATHER_EMERALD, 0.22, undefined],
  ];
  for (let idx = 0; idx < S3_BOOKS.length; idx++) {
    const [bx, col, bh, tex] = S3_BOOKS[idx];
    placeBook({
      at: [bx, 1.495 + bh / 2, 0.02],
      w: 0.16,
      h: bh,
      d: 0.038,
      color: col,
      coverTex: tex,
    });
  }

  // Right Side: Amethyst Crystal Cluster on Brass Pedestal
  const CRYS_X = 0.24;
  const CRYS_Z = 0.03;
  b.part(new THREE.CylinderGeometry(0.045, 0.05, 0.02, 12), BRASS_DARK, {
    bone: root,
    at: [CRYS_X, 1.505, CRYS_Z],
  });
  b.part(new THREE.CylinderGeometry(0.038, 0.038, 0.01, 12), "#301542", {
    bone: root,
    at: [CRYS_X, 1.518, CRYS_Z],
  });

  // 5 Faceted crystal shards growing upward
  const CRYSTAL_SHARDS: [number, number, number, number, number][] = [
    [0, 0.06, 0.016, 0, 0],
    [-0.018, 0.045, 0.012, 12, 10],
    [0.018, 0.05, 0.013, -10, -8],
    [0.005, 0.038, 0.010, 15, -15],
    [-0.012, 0.042, 0.011, -8, 12],
  ];
  for (const [dx, ch, cr, rx, rz] of CRYSTAL_SHARDS) {
    glow(
      b.part(new THREE.ConeGeometry(cr, ch, 6), GLOW_AMETHYST, {
        bone: root,
        at: [CRYS_X + dx, 1.525 + ch / 2, CRYS_Z],
        rotation: [rx, 0, rz],
      }),
      1.8
    );
  }

  // Glazed Ceramic Arcane Urn holding rolled scrolls
  b.part(new THREE.CylinderGeometry(0.038, 0.028, 0.08, 12), "#2c2838", {
    bone: root,
    at: [0.38, 1.535, 0.04],
  });
  b.part(new THREE.TorusGeometry(0.038, 0.006, 8, 16), BRASS, {
    bone: root,
    at: [0.38, 1.575, 0.04],
    rotation: [90, 0, 0],
  });
  // Rolled scrolls sticking out of urn
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 8), PAPER, {
    bone: root,
    at: [0.37, 1.60, 0.03],
    rotation: [12, 0, -8],
  });
  b.part(new THREE.CylinderGeometry(0.010, 0.010, 0.16, 8), PAPER, {
    bone: root,
    at: [0.39, 1.61, 0.05],
    rotation: [-10, 0, 15],
  });

  // ---------------------------------------------------------------------------
  // SHELF 4 & ROOF APEX (Top Deck & Divination Orb, y = 1.94 to 2.28)
  // Grand Divination Orb, Orbiting Brass Gimbal Rings, and Arcane Aura
  // ---------------------------------------------------------------------------

  // Central Ornate Brass Tripod Plinth
  b.part(new THREE.CylinderGeometry(0.11, 0.13, 0.025, 16), BRASS_DARK, {
    bone: root,
    at: [0, 1.97, 0.02],
  });
  b.part(new THREE.CylinderGeometry(0.07, 0.08, 0.035, 12), BRASS, {
    bone: root,
    at: [0, 2.00, 0.02],
  });

  // 3 Curved Brass Claw Legs cradling the orb
  for (let a = 0; a < 3; a++) {
    const ang = a * ((Math.PI * 2) / 3);
    const lx = Math.cos(ang) * 0.065;
    const lz = 0.02 + Math.sin(ang) * 0.065;
    b.part(new THREE.TorusGeometry(0.045, 0.006, 6, 12, Math.PI * 0.7), BRASS_LIGHT, {
      bone: root,
      at: [lx, 2.04, lz],
      rotation: [0, -ang * (180 / Math.PI), 85],
    });
  }

  // The Grand Divination Sphere (Floating Celestial Orb)
  const ORB_Y = 2.12;
  const ORB_Z = 0.02;
  glow(
    b.part(new THREE.SphereGeometry(0.075, 18, 14), GLOW_CYAN, {
      bone: root,
      at: [0, ORB_Y, ORB_Z],
    }),
    2.2
  );

  // Orbiting Brass Gimbal Rings
  b.part(new THREE.TorusGeometry(0.105, 0.005, 8, 24), BRASS, {
    bone: root,
    at: [0, ORB_Y, ORB_Z],
    rotation: [28, 15, 0],
  });
  b.part(new THREE.TorusGeometry(0.125, 0.005, 8, 24), BRASS_LIGHT, {
    bone: root,
    at: [0, ORB_Y, ORB_Z],
    rotation: [-38, 45, 20],
  });

  // Glowing Horizontal Arcane Rune Circle Aura
  glow(
    b.part(new THREE.PlaneGeometry(0.25, 0.25), "#ffffff", {
      bone: root,
      at: [0, ORB_Y, ORB_Z],
      rotation: [-90, 0, 0],
      texture: ARCANE_RING,
      axis: "z",
    }),
    1.8
  );

  // Floating Starlight Sparkles orbiting the Divination Sphere
  const ORB_SPARKS: [number, number, number][] = [
    [-0.11, ORB_Y + 0.05, ORB_Z + 0.04],
    [0.10, ORB_Y - 0.04, ORB_Z + 0.06],
    [0.00, ORB_Y + 0.09, ORB_Z - 0.05],
  ];
  for (const ospos of ORB_SPARKS) {
    glow(
      b.part(new THREE.PlaneGeometry(0.025, 0.025), "#ffffff", {
        bone: root,
        at: ospos,
        texture: MAGIC_SPARKLE,
        axis: "z",
      }),
      2.2
    );
  }

  // ---------------------------------------------------------------------------
  // Bookshelf Column Side Attachments
  // ---------------------------------------------------------------------------

  // Left Outer Column Face (x = -0.605): Hanging Pinned Celestial Star Chart
  // Wooden top suspension rod
  b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.20, 8), WOOD_TRIM, {
    bone: root,
    at: [-0.605, 1.68, 0],
    dir: [0, 0, 1],
  });
  // 2 Brass tacks
  b.part(new THREE.SphereGeometry(0.005, 6, 4), BRASS_LIGHT, {
    bone: root,
    at: [-0.612, 1.68, -0.07],
  });
  b.part(new THREE.SphereGeometry(0.005, 6, 4), BRASS_LIGHT, {
    bone: root,
    at: [-0.612, 1.68, 0.07],
  });
  // Hanging parchment star chart (facing -X)
  b.part(new THREE.PlaneGeometry(0.18, 0.27), "#ffffff", {
    bone: root,
    at: [-0.612, 1.54, 0],
    dir: [-1, 0, 0],
    texture: STAR_CHART,
    axis: "z",
  });
  // Bottom wooden weight rod with brass finials
  b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.19, 8), WOOD_TRIM, {
    bone: root,
    at: [-0.605, 1.40, 0],
    dir: [0, 0, 1],
  });
  b.part(new THREE.SphereGeometry(0.007, 6, 4), BRASS, {
    bone: root,
    at: [-0.605, 1.40, -0.10],
  });
  b.part(new THREE.SphereGeometry(0.007, 6, 4), BRASS, {
    bone: root,
    at: [-0.605, 1.40, 0.10],
  });

  // Right Outer Column Face (x = +0.605): Brass Bracket with Amethyst Pendulum
  // Brass wall bracket arm
  b.part(new THREE.BoxGeometry(0.08, 0.015, 0.02), BRASS, {
    bone: root,
    at: [0.635, 1.62, 0],
  });
  b.part(new THREE.SphereGeometry(0.008, 6, 4), BRASS_LIGHT, {
    bone: root,
    at: [0.67, 1.62, 0],
  });
  // Brass chain links hanging down
  b.part(new THREE.CylinderGeometry(0.0015, 0.0015, 0.16, 4), BRASS_DARK, {
    bone: root,
    at: [0.67, 1.53, 0],
  });
  // Faceted Amethyst Crystal Pendulum Bob
  glow(
    b.part(new THREE.OctahedronGeometry(0.022), GLOW_AMETHYST, {
      bone: root,
      at: [0.67, 1.43, 0],
    }),
    1.8
  );

  // ---------------------------------------------------------------------------
  // Floor Dais Surroundings (Props on the Stone Floor)
  // ---------------------------------------------------------------------------

  // Left Floor: Stack of 3 Folios on the Stone Floor
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
  // Cover texture on top floor book
  b.part(new THREE.PlaneGeometry(0.18, 0.13), "#ffffff", {
    bone: root,
    at: [FL_X - 0.01, 0.171, FL_Z + 0.01],
    rotation: [-90, -12, 0],
    texture: BOOK_COVER_A,
    axis: "z",
  });

  // Unrolled Parchment Scroll curling across the floor
  b.part(new THREE.PlaneGeometry(0.14, 0.24), "#ffffff", {
    bone: root,
    at: [-0.22, 0.042, 0.38],
    rotation: [-90, 22, 0],
    texture: SPELL_SCROLL,
    axis: "z",
  });
  // Brass paperweight holding the scroll open
  b.part(new THREE.OctahedronGeometry(0.018), BRASS, {
    bone: root,
    at: [-0.25, 0.055, 0.32],
  });

  // Spilled Wax Puddle with 2 Lit Stump Candles on the Floor
  const WAX_X = -0.52;
  const WAX_Z = 0.12;
  // Irregular wax spill puddle
  b.part(new THREE.CylinderGeometry(0.075, 0.085, 0.008, 12), WAX_MELT, {
    bone: root,
    at: [WAX_X, 0.044, WAX_Z],
  });
  b.part(new THREE.CylinderGeometry(0.045, 0.055, 0.006, 10), WAX_MELT, {
    bone: root,
    at: [WAX_X + 0.04, 0.045, WAX_Z - 0.03],
  });

  // 2 Floor Candles (one taller, one short melted stump)
  const FLOOR_CANDLES: [number, number, number][] = [
    [WAX_X - 0.02, 0.048, 0.065],
    [WAX_X + 0.02, 0.048, 0.035],
  ];
  for (const [fcx, fcy, fch] of FLOOR_CANDLES) {
    b.part(new THREE.CylinderGeometry(0.014, 0.015, fch, 10), WAX, {
      bone: root,
      at: [fcx, fcy + fch / 2, WAX_Z],
    });
    // Wick
    b.part(new THREE.CylinderGeometry(0.0015, 0.0015, 0.008, 4), "#111111", {
      bone: root,
      at: [fcx, fcy + fch + 0.004, WAX_Z],
    });
    // Anime flame card
    const fFlameAt: [number, number, number] = [fcx, fcy + fch + 0.022, WAX_Z];
    glow(
      b.part(new THREE.PlaneGeometry(0.024, 0.038), FLAME_CORE, {
        bone: root,
        at: fFlameAt,
        texture: CANDLE_FLAME,
        axis: "z",
      }),
      2.2
    );
    glow(
      b.part(new THREE.PlaneGeometry(0.024, 0.038), FLAME_CORE, {
        bone: root,
        at: fFlameAt,
        dir: [1, 0, 0],
        texture: CANDLE_FLAME,
        axis: "z",
      }),
      2.2
    );
  }

  // Right Floor: Heavy Iron & Brass Cauldron filled with Rolled Scrolls
  const CAUL_X = 0.44;
  const CAUL_Z = 0.28;
  // Cauldron belly
  b.part(new THREE.SphereGeometry(0.09, 14, 10), IRON, {
    bone: root,
    at: [CAUL_X, 0.11, CAUL_Z],
  });
  // Top lip rim
  b.part(new THREE.TorusGeometry(0.075, 0.010, 8, 16), BRASS, {
    bone: root,
    at: [CAUL_X, 0.17, CAUL_Z],
    rotation: [90, 0, 0],
  });
  // 3 Tripod claw feet
  for (let a = 0; a < 3; a++) {
    const ang = a * ((Math.PI * 2) / 3);
    b.part(new THREE.CylinderGeometry(0.010, 0.014, 0.05, 6), IRON, {
      bone: root,
      at: [CAUL_X + Math.cos(ang) * 0.065, 0.045, CAUL_Z + Math.sin(ang) * 0.065],
      rotation: [15, -ang * (180 / Math.PI), 0],
    });
  }

  // Rolled parchment scrolls protruding from cauldron
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
    // Purple / crimson silk ribbon wrap
    b.part(new THREE.CylinderGeometry(0.017, 0.017, 0.025, 10), "#591c3e", {
      bone: root,
      at: [CAUL_X + cdx, 0.23, CAUL_Z + cdz],
      rotation: [rx, 0, rz],
    });
  }

  // Large leather folio leaning against the bookcase column base
  b.part(new THREE.BoxGeometry(0.24, 0.32, 0.045), LEATHER_NAVY, {
    bone: root,
    at: [0.38, 0.20, 0.14],
    rotation: [0, -32, 12],
  });
  // Wax seal on leaning portfolio
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.005, 12), "#8a1522", {
    bone: root,
    at: [0.36, 0.20, 0.165],
    rotation: [0, -32, 12],
  });
  b.part(new THREE.PlaneGeometry(0.032, 0.032), "#ffffff", {
    bone: root,
    at: [0.36, 0.20, 0.169],
    rotation: [0, -32, 12],
    texture: WAX_SEAL,
    axis: "z",
  });

  return b.root;
}
```