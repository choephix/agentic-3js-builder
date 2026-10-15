An analysis of the renders highlights several key areas for improvement:

1. **The Grand Divination Orb is occluded**: In the original build, the solid apex crest sat at $z = 0.16$ while the orb was placed behind it at $z = 0.02$, hiding it from front and three-quarter angles. We will redesign the crown into an **open Gothic Celestial Observatory arch** with carved side pilasters and open tracery, proudly showcasing the floating cyan orb and its orbiting brass gimbal rings.
2. **Candle flames lacked volume**: The 2D SVG flame cards were thin and clipped edge-on. We replace them with **volumetric dual-layer 3D anime flame blooms** (glowing outer amber teardrop with an intense inner white-hot core) and cascading melted wax drips.
3. **Floating holographic spell circle**: Above the open grimoire on the lectern, we add a hovering, self-lit arcane projection circle and orbiting magical starlight motes.
4. **Rich high-fantasy anime palette**: The wood was overly dark and muddy; we brighten it to a warm polished mahogany (`#4d2719` / `#36180d`) with gleaming warm brass moulding (`#e5b658`).
5. **Dais Arcane Rug**: Replace the plain dark stone disc with an intricate **Illuminated Arcane Circle Rug** woven with celestial charts, planetary glyphs, and gold fringe.
6. **Denser, varied shelf curation**: Fill the vertical voids with diverse alchemical apparatus (spiraling retort coil, faceted potion flasks, glowing vials), ornate bookends, clasps, gold corner plates, and unfurled parchment scrolls.

Here is the complete updated module:

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
  // Color Palette & Custom Materials
  // ---------------------------------------------------------------------------
  // Warm, polished anime mahogany with warm undertones
  const WOOD = grain("#4e281a", "#34180e", { size: 0.045, axis: "y" });
  const WOOD_TRIM = grain("#663320", "#452012", { size: 0.035, axis: "x" });
  const WOOD_DARK = "#27120a";

  // Arcane Metallics
  const BRASS = "#e0ad48";
  const BRASS_DARK = "#805822";
  const BRASS_LIGHT = "#fce586";
  const IRON = "#2d2a33";

  // Grimoire Leather Jewel Tones
  const LEATHER_NAVY = "#182c54";
  const LEATHER_RUBY = "#7e1628";
  const LEATHER_VIOLET = "#461c63";
  const LEATHER_EMERALD = "#164d30";
  const LEATHER_AMBER = "#995518";
  const LEATHER_OBSIDIAN = "#1d1c24";
  const LEATHER_TEAL = "#144e52";

  // Paper, Wax, & Alchemical Elements
  const PAPER = "#f5e6c9";
  const WAX = "#f7edd7";
  const WAX_MELT = "#e5d5b7";
  const CORK = "#a67347";

  // Radiant Magical Glows
  const GLOW_CYAN = "#45f4ff";
  const GLOW_MAGENTA = "#ff388e";
  const GLOW_EMERALD = "#36ff86";
  const GLOW_AMBER = "#ffaa33";
  const GLOW_AMETHYST = "#ad47ff";
  const GLOW_GOLD = "#ffe16b";
  const FLAME_OUTER = "#ff7800";
  const FLAME_CORE = "#ffffff";

  // ---------------------------------------------------------------------------
  // High-Resolution SVG Textures
  // ---------------------------------------------------------------------------

  // 1. Arcane Celestial Rug (Floor Dais)
  const MAGIC_RUG_TEXTURE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <circle cx="256" cy="256" r="252" fill="#17172a" stroke="#cca14b" stroke-width="6"/>
      <circle cx="256" cy="256" r="240" fill="#201f3b" stroke="#8c6a28" stroke-width="2"/>
      <circle cx="256" cy="256" r="226" fill="none" stroke="#e0ad48" stroke-width="3" stroke-dasharray="6 8"/>
      <!-- Outer Runic Ring -->
      <circle cx="256" cy="256" r="196" fill="#1b1a32" stroke="#cca14b" stroke-width="4"/>
      <!-- Interlocking 12-Point Star Octagrams -->
      <polygon points="256,66 390,196 390,316 256,446 122,316 122,196" fill="none" stroke="#7e4eb8" stroke-width="2.5"/>
      <polygon points="256,66 390,196 390,316 256,446 122,316 122,196" fill="none" stroke="#4db8c7" stroke-width="2.5" transform="rotate(30 256 256)"/>
      <polygon points="256,66 390,196 390,316 256,446 122,316 122,196" fill="none" stroke="#cca14b" stroke-width="2.5" transform="rotate(60 256 256)"/>
      <!-- Inner Zodiac & Planetary Ring -->
      <circle cx="256" cy="256" r="120" fill="#252445" stroke="#cca14b" stroke-width="3.5"/>
      <circle cx="256" cy="256" r="106" fill="none" stroke="#e8c76b" stroke-width="1.8" stroke-dasharray="4 6"/>
      <!-- Sunburst & Crescent Core -->
      <circle cx="256" cy="256" r="54" fill="#cca14b"/>
      <circle cx="256" cy="256" r="46" fill="#201f3b"/>
      <path d="M256 210 A46 46 0 0 0 256 302 A32 46 0 0 1 256 210" fill="#fce586"/>
      <circle cx="280" cy="242" r="4" fill="#ffffff"/>
      <circle cx="294" cy="256" r="3" fill="#ffffff"/>
      <circle cx="280" cy="270" r="4" fill="#ffffff"/>
      <!-- Compass Radials -->
      <line x1="256" y1="20" x2="256" y2="492" stroke="#cca14b" stroke-width="1.5" stroke-dasharray="8 6"/>
      <line x1="20" y1="256" x2="492" y2="256" stroke="#cca14b" stroke-width="1.5" stroke-dasharray="8 6"/>
    </svg>`,
    { size: 512 }
  );

  // 2. Grimoire Cover A: Midnight Lapis & Celestial Gold
  const BOOK_COVER_A = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 220">
      <rect width="160" height="220" rx="6" fill="#141f36"/>
      <rect x="8" y="8" width="144" height="204" rx="4" fill="none" stroke="#e0ad48" stroke-width="3"/>
      <rect x="14" y="14" width="132" height="192" rx="2" fill="none" stroke="#8c6a28" stroke-width="1.2" stroke-dasharray="3 3"/>
      <!-- Filigree Corner Brackets -->
      <path d="M14 36 Q36 36 36 14" fill="none" stroke="#fce586" stroke-width="2.5"/>
      <path d="M146 36 Q124 36 124 14" fill="none" stroke="#fce586" stroke-width="2.5"/>
      <path d="M14 184 Q36 184 36 206" fill="none" stroke="#fce586" stroke-width="2.5"/>
      <path d="M146 184 Q124 184 124 206" fill="none" stroke="#fce586" stroke-width="2.5"/>
      <!-- Central Arcane Sun & Moon Shield -->
      <circle cx="80" cy="110" r="44" fill="#1a2845" stroke="#e0ad48" stroke-width="2.8"/>
      <circle cx="80" cy="110" r="38" fill="none" stroke="#fce586" stroke-width="1.2"/>
      <circle cx="80" cy="110" r="20" fill="#fce586"/>
      <path d="M80 90 A20 20 0 0 0 80 130 A14 20 0 0 1 80 90" fill="#141f36"/>
      <!-- Radiating Sun Rays -->
      <path d="M80 58 L80 67 M80 153 L80 162 M28 110 L37 110 M123 110 L132 110 M43 73 L50 80 M117 147 L110 140 M43 147 L50 140 M117 73 L110 80" stroke="#fce586" stroke-width="2.2" stroke-linecap="round"/>
    </svg>`,
    { size: 256 }
  );

  // 3. Grimoire Cover B: Crimson Ruby & Transmutation Alchemy
  const BOOK_COVER_B = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 220">
      <rect width="160" height="220" rx="6" fill="#52101e"/>
      <rect x="8" y="8" width="144" height="204" rx="4" fill="none" stroke="#e0ad48" stroke-width="3"/>
      <rect x="13" y="13" width="134" height="194" fill="none" stroke="#8a1f2b" stroke-width="1.5"/>
      <circle cx="80" cy="110" r="46" fill="#3b0914" stroke="#e0ad48" stroke-width="2.5"/>
      <polygon points="80,68 116,132 44,132" fill="none" stroke="#fce586" stroke-width="2"/>
      <polygon points="80,152 116,88 44,88" fill="none" stroke="#fce586" stroke-width="2"/>
      <circle cx="80" cy="110" r="18" fill="none" stroke="#e0ad48" stroke-width="1.5"/>
      <circle cx="80" cy="110" r="7" fill="#fce586"/>
      <circle cx="80" cy="64" r="3.5" fill="#e0ad48"/>
      <circle cx="80" cy="156" r="3.5" fill="#e0ad48"/>
      <circle cx="40" cy="87" r="3.5" fill="#e0ad48"/>
      <circle cx="120" cy="87" r="3.5" fill="#e0ad48"/>
    </svg>`,
    { size: 256 }
  );

  // 4. Grimoire Cover C: Mystic Violet All-Seeing Eye
  const BOOK_COVER_C = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 220">
      <rect width="160" height="220" rx="6" fill="#2b113d"/>
      <rect x="9" y="9" width="142" height="202" rx="4" fill="none" stroke="#e0ad48" stroke-width="2.5"/>
      <polygon points="80,22 140,110 80,198 20,110" fill="#36154d" stroke="#cca14b" stroke-width="1.8"/>
      <path d="M38 110 Q80 76 122 110 Q80 144 38 110Z" fill="#1b0829" stroke="#fce586" stroke-width="3"/>
      <circle cx="80" cy="110" r="16" fill="#cca14b"/>
      <circle cx="80" cy="110" r="8.5" fill="#1b0829"/>
      <circle cx="83" cy="107" r="3" fill="#ffffff"/>
      <path d="M80 72 L80 58 M80 148 L80 162 M42 90 L32 82 M118 90 L128 82 M42 130 L32 138 M118 130 L128 138" stroke="#fce586" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    { size: 256 }
  );

  // 5. Hero Open Grimoire Pages Spread
  const OPEN_BOOK_PAGES = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260">
      <rect width="400" height="260" rx="4" fill="#eedcb7"/>
      <rect x="12" y="10" width="180" height="240" rx="3" fill="#faf0da"/>
      <rect x="208" y="10" width="180" height="240" rx="3" fill="#faf0da"/>
      <rect x="194" y="10" width="12" height="240" fill="#cfb686"/>
      <rect x="20" y="18" width="164" height="224" fill="none" stroke="#caa468" stroke-width="1"/>
      <rect x="216" y="18" width="164" height="224" fill="none" stroke="#caa468" stroke-width="1"/>
      <!-- Left Page: Astrology & Constellations -->
      <circle cx="102" cy="74" r="38" fill="none" stroke="#4a301a" stroke-width="1.4"/>
      <circle cx="102" cy="74" r="30" fill="none" stroke="#b08438" stroke-width="1" stroke-dasharray="3 2"/>
      <circle cx="90" cy="62" r="2.5" fill="#8f281b"/>
      <circle cx="114" cy="66" r="3" fill="#8f281b"/>
      <circle cx="106" cy="88" r="2.5" fill="#8f281b"/>
      <circle cx="84" cy="80" r="2" fill="#8f281b"/>
      <circle cx="120" cy="82" r="2" fill="#8f281b"/>
      <line x1="90" y1="62" x2="114" y2="66" stroke="#8f281b" stroke-width="1"/>
      <line x1="114" y1="66" x2="120" y2="82" stroke="#8f281b" stroke-width="1"/>
      <line x1="114" y1="66" x2="106" y2="88" stroke="#8f281b" stroke-width="1"/>
      <line x1="106" y1="88" x2="84" y2="80" stroke="#8f281b" stroke-width="1"/>
      <line x1="84" y1="80" x2="90" y2="62" stroke="#8f281b" stroke-width="1"/>
      <rect x="28" y="126" width="148" height="3" rx="1.5" fill="#4a301a"/>
      <rect x="28" y="136" width="140" height="2.5" rx="1" fill="#5c3f26"/>
      <rect x="28" y="145" width="144" height="2.5" rx="1" fill="#5c3f26"/>
      <rect x="28" y="154" width="132" height="2.5" rx="1" fill="#5c3f26"/>
      <rect x="28" y="163" width="146" height="2.5" rx="1" fill="#5c3f26"/>
      <rect x="28" y="174" width="68" height="2.5" rx="1" fill="#5c3f26"/>
      <rect x="104" y="174" width="68" height="2.5" rx="1" fill="#5c3f26"/>
      <rect x="28" y="184" width="144" height="2.5" rx="1" fill="#5c3f26"/>
      <rect x="28" y="194" width="138" height="2.5" rx="1" fill="#5c3f26"/>
      <!-- Right Page: Illuminated Drop Cap & Magic Circle -->
      <rect x="224" y="26" width="30" height="30" rx="3" fill="#8f202a" stroke="#caa048" stroke-width="1.5"/>
      <path d="M230 31 L239 51 L248 31" fill="none" stroke="#fce592" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="260" y="28" width="112" height="2.5" rx="1" fill="#4a301a"/>
      <rect x="260" y="37" width="112" height="2.5" rx="1" fill="#5c3f26"/>
      <circle cx="298" cy="122" r="44" fill="#fdf6e6" stroke="#8f202a" stroke-width="2"/>
      <circle cx="298" cy="122" r="38" fill="none" stroke="#caa048" stroke-width="1.4"/>
      <polygon points="298,84 331,142 265,142" fill="none" stroke="#8f202a" stroke-width="1.4"/>
      <polygon points="298,160 331,102 265,102" fill="none" stroke="#8f202a" stroke-width="1.4"/>
      <circle cx="298" cy="122" r="14" fill="none" stroke="#caa048" stroke-width="1.6"/>
      <circle cx="298" cy="122" r="5" fill="#8f202a"/>
      <rect x="224" y="176" width="148" height="2.5" rx="1" fill="#5c3f26"/>
      <rect x="224" y="186" width="142" height="2.5" rx="1" fill="#5c3f26"/>
      <rect x="224" y="196" width="146" height="2.5" rx="1" fill="#5c3f26"/>
    </svg>`,
    { size: 512 }
  );

  // 6. Holographic Arcane Summoning Ring (Hovering above open book)
  const ARCANE_HOLO_RING = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
      <circle cx="128" cy="128" r="120" fill="none" stroke="#45f4ff" stroke-width="3"/>
      <circle cx="128" cy="128" r="108" fill="none" stroke="#ffe16b" stroke-width="1.8" stroke-dasharray="4 6"/>
      <circle cx="128" cy="128" r="94" fill="none" stroke="#45f4ff" stroke-width="2"/>
      <polygon points="128,34 208,128 128,222 48,128" fill="none" stroke="#ffe16b" stroke-width="2"/>
      <polygon points="128,34 208,128 128,222 48,128" fill="none" stroke="#45f4ff" stroke-width="2" transform="rotate(45 128 128)"/>
      <circle cx="128" cy="128" r="64" fill="none" stroke="#ad47ff" stroke-width="2.5"/>
      <circle cx="128" cy="18" r="5" fill="#45f4ff"/>
      <circle cx="128" cy="238" r="5" fill="#45f4ff"/>
      <circle cx="18" cy="128" r="5" fill="#45f4ff"/>
      <circle cx="238" cy="128" r="5" fill="#45f4ff"/>
    </svg>`,
    { size: 256 }
  );

  // 7. Hanging Star Chart
  const STAR_CHART = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300">
      <rect width="200" height="300" rx="4" fill="#eed9b4"/>
      <rect x="8" y="10" width="184" height="280" rx="2" fill="none" stroke="#8c6032" stroke-width="2"/>
      <text x="100" y="30" font-family="serif" font-size="11" font-weight="bold" fill="#3d2411" text-anchor="middle" letter-spacing="2">PLANISPHAERIUM</text>
      <line x1="20" y1="36" x2="180" y2="36" stroke="#caa468" stroke-width="1.2"/>
      <circle cx="100" cy="98" r="52" fill="#f8eed9" stroke="#3d2411" stroke-width="1.6"/>
      <circle cx="100" cy="98" r="42" fill="none" stroke="#caa468" stroke-width="1" stroke-dasharray="3 2"/>
      <path d="M72 80 L88 72 L112 78 L124 94 L114 116 L92 112Z" fill="none" stroke="#1d4575" stroke-width="1.5"/>
      <circle cx="72" cy="80" r="2.5" fill="#b8832a"/>
      <circle cx="88" cy="72" r="3.2" fill="#b8832a"/>
      <circle cx="112" cy="78" r="2.5" fill="#b8832a"/>
      <circle cx="124" cy="94" r="2.5" fill="#b8832a"/>
      <circle cx="114" cy="116" r="3.2" fill="#b8832a"/>
      <circle cx="92" cy="112" r="2.5" fill="#b8832a"/>
      <circle cx="100" cy="204" r="46" fill="#f8eed9" stroke="#3d2411" stroke-width="1.6"/>
      <polygon points="100,164 135,224 65,224" fill="none" stroke="#caa468" stroke-width="1.2"/>
      <polygon points="100,244 135,184 65,184" fill="none" stroke="#caa468" stroke-width="1.2"/>
      <circle cx="100" cy="204" r="20" fill="none" stroke="#9e2819" stroke-width="1.4"/>
    </svg>`,
    { size: 256 }
  );

  // 8. Illuminated Spell Scroll Banner
  const SPELL_SCROLL = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 280">
      <rect width="140" height="280" rx="3" fill="#f2e2c2"/>
      <rect x="6" y="8" width="128" height="264" rx="2" fill="none" stroke="#946d3e" stroke-width="1.8"/>
      <circle cx="70" cy="45" r="26" fill="#faeed4" stroke="#8a1f29" stroke-width="1.8"/>
      <polygon points="70,24 91,56 49,56" fill="none" stroke="#caa468" stroke-width="1.4"/>
      <polygon points="70,66 91,34 49,34" fill="none" stroke="#caa468" stroke-width="1.4"/>
      <rect x="18" y="82" width="104" height="3" rx="1.5" fill="#3d2616"/>
      <rect x="18" y="92" width="96" height="2.5" rx="1" fill="#543720"/>
      <rect x="18" y="100" width="100" height="2.5" rx="1" fill="#543720"/>
      <circle cx="70" cy="148" r="30" fill="none" stroke="#2a456c" stroke-width="1.8"/>
      <circle cx="70" cy="148" r="22" fill="none" stroke="#caa468" stroke-width="1.2" stroke-dasharray="2 2"/>
      <rect x="18" y="190" width="104" height="2.5" rx="1" fill="#543720"/>
      <rect x="18" y="199" width="98" height="2.5" rx="1" fill="#543720"/>
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
  // Helper: Volumetric 3D Anime Candle Flame
  // ---------------------------------------------------------------------------
  function makeAnimeFlame(at: [number, number, number], scale = 1) {
    // Outer glowing flame droplet
    glow(
      b.part(new THREE.ConeGeometry(0.009 * scale, 0.028 * scale, 8), FLAME_OUTER, {
        bone: root,
        at: [at[0], at[1] + 0.012 * scale, at[2]],
      }),
      2.0
    );
    // Inner white-hot glowing core
    glow(
      b.part(new THREE.ConeGeometry(0.0045 * scale, 0.016 * scale, 6), FLAME_CORE, {
        bone: root,
        at: [at[0], at[1] + 0.008 * scale, at[2]],
      }),
      3.0
    );
  }

  // ---------------------------------------------------------------------------
  // STAGED DAIS & ARCANE CARPET BASE (y = 0 to 0.04)
  // ---------------------------------------------------------------------------
  // Octagonal flagstone base plinth
  b.part(new THREE.CylinderGeometry(0.88, 0.92, 0.035, 16), "#2a2833", {
    bone: root,
    at: [0, 0.0175, 0.04],
  });
  // Gilded base border ring
  b.part(new THREE.CylinderGeometry(0.86, 0.86, 0.038, 16), BRASS, {
    bone: root,
    at: [0, 0.019, 0.04],
  });
  // Arcane Woven Magic Circle Carpet (facing up)
  b.part(new THREE.CircleGeometry(0.82, 32), "#ffffff", {
    bone: root,
    at: [0, 0.039, 0.04],
    rotation: [-90, 0, 0],
    texture: MAGIC_RUG_TEXTURE,
    axis: "z",
  });

  // ---------------------------------------------------------------------------
  // BOOKSHELF CARCASS ARCHITECTURE
  // ---------------------------------------------------------------------------
  // Plinth Footing
  b.part(new THREE.BoxGeometry(1.24, 0.08, 0.44), WOOD_DARK, {
    bone: root,
    at: [0, 0.08, 0],
  });
  b.part(new THREE.BoxGeometry(1.26, 0.02, 0.46), BRASS, {
    bone: root,
    at: [0, 0.12, 0],
  });

  // Left & Right Vertical Columns (Uprights)
  const COL_X = 0.54;
  for (const s of [1, -1]) {
    // Main column upright
    b.part(new THREE.BoxGeometry(0.12, 1.82, 0.38), WOOD, {
      bone: root,
      at: [s * COL_X, 1.03, 0],
    });
    // Front fluted pilaster accent
    b.part(new THREE.BoxGeometry(0.04, 1.76, 0.02), WOOD_TRIM, {
      bone: root,
      at: [s * COL_X, 1.03, 0.19],
    });
    // Side fluted trim
    b.part(new THREE.BoxGeometry(0.02, 1.76, 0.04), WOOD_TRIM, {
      bone: root,
      at: [s * (COL_X + 0.05), 1.03, 0],
    });
    // Plinth base capital
    b.part(new THREE.BoxGeometry(0.14, 0.05, 0.40), BRASS_DARK, {
      bone: root,
      at: [s * COL_X, 0.145, 0],
    });
    // Top carved corbel capital
    b.part(new THREE.BoxGeometry(0.15, 0.07, 0.42), BRASS, {
      bone: root,
      at: [s * COL_X, 1.91, 0],
    });
  }

  // Rear Backboard (Dark wood backing)
  b.part(new THREE.BoxGeometry(1.02, 1.80, 0.02), WOOD, {
    bone: root,
    at: [0, 1.04, -0.16],
  });

  // ---------------------------------------------------------------------------
  // 5 INTERIOR SHELVES WITH GILDED EDGE MOULDINGS
  // ---------------------------------------------------------------------------
  // Shelf heights:
  // Shelf 0 (Bottom): y = 0.16
  // Shelf 1 (Lower-Mid Alchemical): y = 0.58
  // Shelf 2 (Middle Hero Lectern): y = 1.00
  // Shelf 3 (Upper Curios): y = 1.46
  // Shelf 4 (Top Header Deck): y = 1.94
  const SHELF_YS = [0.16, 0.58, 1.00, 1.46, 1.94];
  for (let i = 0; i < SHELF_YS.length; i++) {
    const sy = SHELF_YS[i];
    b.part(new THREE.BoxGeometry(1.02, 0.03, 0.35), WOOD, {
      bone: root,
      at: [0, sy, 0],
    });
    // Gilded brass front edge moulding
    b.part(new THREE.BoxGeometry(1.02, 0.018, 0.016), BRASS, {
      bone: root,
      at: [0, sy, 0.18],
    });
    // Left & Right brass corbel brackets under shelf
    for (const s of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.016, 0.045, 0.045), BRASS_DARK, {
        bone: root,
        at: [s * 0.49, sy - 0.028, 0.14],
      });
    }
  }

  // ---------------------------------------------------------------------------
  // OPEN GOTHIC OBSERVATORY APEX (Fully Framing the Divination Orb)
  // ---------------------------------------------------------------------------
  // Top Cornice Moulding
  b.part(new THREE.BoxGeometry(1.26, 0.05, 0.44), WOOD_TRIM, {
    bone: root,
    at: [0, 1.975, 0],
  });
  b.part(new THREE.BoxGeometry(1.28, 0.02, 0.46), BRASS, {
    bone: root,
    at: [0, 2.01, 0],
  });

  // Open Gothic Arched Canopy:
  // Twin front spiral pilasters supporting an open gothic canopy so the orb is 100% visible!
  for (const s of [1, -1]) {
    // Spiral turned colonnettes
    b.part(new THREE.CylinderGeometry(0.028, 0.032, 0.28, 12), BRASS_DARK, {
      bone: root,
      at: [s * 0.38, 2.15, 0.12],
    });
    b.part(new THREE.SphereGeometry(0.036, 10, 8), BRASS, {
      bone: root,
      at: [s * 0.38, 2.30, 0.12],
    });
    // Corner finial spires
    b.part(new THREE.ConeGeometry(0.026, 0.11, 10), BRASS_LIGHT, {
      bone: root,
      at: [s * 0.54, 2.18, 0.14],
    });
    b.part(new THREE.SphereGeometry(0.032, 10, 8), BRASS, {
      bone: root,
      at: [s * 0.54, 2.09, 0.14],
    });
  }

  // Carved Open Gothic Tracery Arch Rib (Extruded open arch crest)
  const openArchRib: [number, number, ...("sharp")[]][] = [
    [-0.42, 0],
    [-0.38, 0.14],
    [-0.20, 0.24],
    [0, 0.32, "sharp"],
    [0.20, 0.24],
    [0.38, 0.14],
    [0.42, 0],
    [0.36, 0],
    [0.32, 0.10],
    [0.16, 0.19],
    [0, 0.25, "sharp"],
    [-0.16, 0.19],
    [-0.32, 0.10],
    [-0.36, 0],
  ];
  b.extrude(openArchRib, {
    bone: root,
    at: [0, 2.02, 0.12],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.04,
    bevel: 0.006,
    color: WOOD_TRIM,
  });

  // Keystone Gilded Sunburst Medallion at Arch Apex
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 16), BRASS, {
    bone: root,
    at: [0, 2.31, 0.145],
    dir: [0, 0, 1],
  });
  b.part(new THREE.SphereGeometry(0.032, 10, 8), BRASS_LIGHT, {
    bone: root,
    at: [0, 2.31, 0.155],
  });

  // ---------------------------------------------------------------------------
  // GRAND CELESTIAL DIVINATION ORB (Prominently Center-Stage at Apex)
  // ---------------------------------------------------------------------------
  // Placed at [0, 2.12, 0.08] so it shines brilliantly through the open arch!
  const ORB_Y = 2.13;
  const ORB_Z = 0.08;

  // Ornate Brass Tripod Plinth
  b.part(new THREE.CylinderGeometry(0.12, 0.14, 0.025, 16), BRASS_DARK, {
    bone: root,
    at: [0, 1.965, ORB_Z],
  });
  b.part(new THREE.CylinderGeometry(0.075, 0.09, 0.035, 12), BRASS, {
    bone: root,
    at: [0, 1.995, ORB_Z],
  });

  // 3 Curved Brass Claw Legs cradling the orb
  for (let a = 0; a < 3; a++) {
    const ang = a * ((Math.PI * 2) / 3);
    const lx = Math.cos(ang) * 0.075;
    const lz = ORB_Z + Math.sin(ang) * 0.075;
    b.part(new THREE.TorusGeometry(0.05, 0.007, 6, 12, Math.PI * 0.7), BRASS_LIGHT, {
      bone: root,
      at: [lx, 2.045, lz],
      rotation: [0, -ang * (180 / Math.PI), 85],
    });
  }

  // The Radiant Divination Sphere (Swirling Starlight Cyan)
  glow(
    b.part(new THREE.SphereGeometry(0.082, 18, 14), GLOW_CYAN, {
      bone: root,
      at: [0, ORB_Y, ORB_Z],
    }),
    2.4
  );

  // Orbiting Brass Gimbal Rings
  b.part(new THREE.TorusGeometry(0.115, 0.0055, 8, 24), BRASS, {
    bone: root,
    at: [0, ORB_Y, ORB_Z],
    rotation: [28, 20, 0],
  });
  b.part(new THREE.TorusGeometry(0.135, 0.0055, 8, 24), BRASS_LIGHT, {
    bone: root,
    at: [0, ORB_Y, ORB_Z],
    rotation: [-36, 45, 25],
  });

  // Horizontal Arcane Rune Circle Aura under the orb
  glow(
    b.part(new THREE.PlaneGeometry(0.28, 0.28), "#ffffff", {
      bone: root,
      at: [0, ORB_Y, ORB_Z],
      rotation: [-90, 0, 0],
      texture: ARCANE_HOLO_RING,
      axis: "z",
    }),
    1.9
  );

  // Floating Starlight Sparkle particles orbiting the Divination Sphere
  const ORB_SPARKS: [number, number, number][] = [
    [-0.13, ORB_Y + 0.06, ORB_Z + 0.05],
    [0.12, ORB_Y - 0.04, ORB_Z + 0.07],
    [0.00, ORB_Y + 0.11, ORB_Z - 0.05],
  ];
  for (const ospos of ORB_SPARKS) {
    glow(
      b.part(new THREE.PlaneGeometry(0.03, 0.03), "#ffffff", {
        bone: root,
        at: ospos,
        texture: MAGIC_SPARKLE,
        axis: "z",
      }),
      2.5
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
    // Back cover (-Z)
    b.part(new THREE.BoxGeometry(opts.w, opts.h, 0.003), opts.color, {
      bone: root,
      at: [opts.at[0], opts.at[1], opts.at[2] - (opts.d / 2 - 0.0015)],
      rotation: [rx, ry, rz],
    });
    // Front cover (+Z)
    b.part(new THREE.BoxGeometry(opts.w, opts.h, 0.003), opts.color, {
      bone: root,
      at: [opts.at[0], opts.at[1], opts.at[2] + (opts.d / 2 - 0.0015)],
      rotation: [rx, ry, rz],
    });
    // Spine (-X)
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

    // Front Cover Decal
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
  // SHELF 0 (Bottom Shelf, surface y = 0.175)
  // Large Ancient Folios, Ledger Tomes, Scroll Cubby, and Leaning Grimoire
  // ---------------------------------------------------------------------------
  // Left: Massive ancient folios with gilded leather covers
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
  b.part(new THREE.BoxGeometry(0.24, 0.055, 0.20), LEATHER_OBSIDIAN, {
    bone: root,
    at: [0, 0.205, 0.02],
  });
  b.part(new THREE.BoxGeometry(0.22, 0.045, 0.18), PAPER, {
    bone: root,
    at: [0.01, 0.205, 0.02],
  });
  b.part(new THREE.BoxGeometry(0.22, 0.050, 0.18), LEATHER_NAVY, {
    bone: root,
    at: [0.01, 0.255, 0.01],
    rotation: [0, 5, 0],
  });
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
  b.part(new THREE.BoxGeometry(0.016, 0.002, 0.08), "#d92638", {
    bone: root,
    at: [0.02, 0.276, 0.12],
    rotation: [15, 5, 0],
  });

  // Center-Right: Wooden Scroll Bin with Rolled Scrolls
  b.part(new THREE.BoxGeometry(0.18, 0.22, 0.24), WOOD_TRIM, {
    bone: root,
    at: [0.18, 0.285, 0.02],
  });
  b.part(new THREE.BoxGeometry(0.15, 0.19, 0.22), WOOD_DARK, {
    bone: root,
    at: [0.18, 0.285, 0.03],
  });

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
    at: [0.44, 0.185, 0.02],
  });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.015, 16), BRASS, {
    bone: root,
    at: [0.44, 0.25, 0.02],
    dir: [1, 0, 0],
  });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 16), WOOD_DARK, {
    bone: root,
    at: [0.44, 0.26, 0.05],
    dir: [1, 0, 0],
  });
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
  placeBook({
    at: [0.40, 0.31, 0.02],
    w: 0.21,
    h: 0.30,
    d: 0.045,
    color: LEATHER_AMBER,
    rotZ: -16,
  });

  // ---------------------------------------------------------------------------
  // SHELF 1 (Lower-Mid Shelf, surface y = 0.595)
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
      at: [bx, 0.73, 0.02],
      w: 0.18,
      h: 0.26,
      d: 0.042,
      color: col,
      coverTex: tex,
    });
  }

  // Alchemical Test Tube Rack with 4 Glowing Mana Vials
  b.part(new THREE.BoxGeometry(0.18, 0.012, 0.045), WOOD_TRIM, {
    bone: root,
    at: [-0.08, 0.601, 0.05],
  });
  b.part(new THREE.BoxGeometry(0.18, 0.010, 0.045), WOOD_TRIM, {
    bone: root,
    at: [-0.08, 0.655, 0.05],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.012, 0.065, 0.045), WOOD_TRIM, {
      bone: root,
      at: [-0.08 + s * 0.08, 0.63, 0.05],
    });
  }
  const VIAL_COLS = [GLOW_CYAN, GLOW_MAGENTA, GLOW_EMERALD, GLOW_AMBER];
  for (let idx = 0; idx < 4; idx++) {
    const vx = -0.135 + idx * 0.038;
    glow(
      b.part(new THREE.CylinderGeometry(0.010, 0.010, 0.055, 10), VIAL_COLS[idx], {
        bone: root,
        at: [vx, 0.635, 0.05],
      }),
      2.0
    );
    b.part(new THREE.CylinderGeometry(0.009, 0.008, 0.012, 8), CORK, {
      bone: root,
      at: [vx, 0.668, 0.05],
    });
  }

  // Large Round-Bottom Boiling Flask with Glowing Amethyst Liquid
  b.part(new THREE.CylinderGeometry(0.03, 0.035, 0.015, 12), BRASS_DARK, {
    bone: root,
    at: [0.06, 0.602, 0.05],
  });
  glow(
    b.part(new THREE.SphereGeometry(0.045, 14, 10), GLOW_AMETHYST, {
      bone: root,
      at: [0.06, 0.65, 0.05],
    }),
    2.2
  );
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.05, 10), BRASS, {
    bone: root,
    at: [0.06, 0.705, 0.05],
  });
  b.part(new THREE.TorusGeometry(0.016, 0.004, 8, 16), BRASS_LIGHT, {
    bone: root,
    at: [0.06, 0.73, 0.05],
    rotation: [90, 0, 0],
  });
  b.part(new THREE.CylinderGeometry(0.012, 0.010, 0.018, 8), CORK, {
    bone: root,
    at: [0.06, 0.738, 0.05],
  });

  // Alchemical Spiral Retort Distillation Coil (Connecting flasks)
  b.part(new THREE.TorusGeometry(0.024, 0.004, 8, 16), "#a2e6f7", {
    bone: root,
    at: [0.12, 0.69, 0.05],
    rotation: [0, 90, 0],
  });
  b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.06, 6), "#a2e6f7", {
    bone: root,
    at: [0.09, 0.71, 0.05],
    rotation: [0, 0, 35],
  });

  // Grand Brass Hourglass with Glowing Golden Sand
  const HG_X = 0.22;
  const HG_Z = 0.04;
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.008, 12), BRASS, {
    bone: root,
    at: [HG_X, 0.60, HG_Z],
  });
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.008, 12), BRASS, {
    bone: root,
    at: [HG_X, 0.72, HG_Z],
  });
  for (let a = 0; a < 3; a++) {
    const ang = a * ((Math.PI * 2) / 3);
    b.part(new THREE.CylinderGeometry(0.003, 0.003, 0.12, 6), BRASS_DARK, {
      bone: root,
      at: [HG_X + Math.cos(ang) * 0.032, 0.66, HG_Z + Math.sin(ang) * 0.032],
    });
  }
  b.part(new THREE.ConeGeometry(0.032, 0.055, 10), "#bce8f5", {
    bone: root,
    at: [HG_X, 0.685, HG_Z],
    rotation: [180, 0, 0],
  });
  b.part(new THREE.ConeGeometry(0.032, 0.055, 10), "#bce8f5", {
    bone: root,
    at: [HG_X, 0.635, HG_Z],
  });
  glow(
    b.part(new THREE.ConeGeometry(0.024, 0.035, 8), GLOW_GOLD, {
      bone: root,
      at: [HG_X, 0.622, HG_Z],
    }),
    1.8
  );

  // Brass Mortar & Pestle with Glowing Emerald Powder
  b.part(new THREE.CylinderGeometry(0.038, 0.025, 0.04, 12), BRASS, {
    bone: root,
    at: [0.35, 0.615, 0.05],
  });
  glow(
    b.part(new THREE.CylinderGeometry(0.030, 0.030, 0.008, 12), GLOW_EMERALD, {
      bone: root,
      at: [0.35, 0.628, 0.05],
    }),
    2.0
  );
  b.part(new THREE.CylinderGeometry(0.007, 0.010, 0.07, 8), BRASS_LIGHT, {
    bone: root,
    at: [0.36, 0.645, 0.05],
    rotation: [15, 0, -25],
  });

  // Small Glowing Healing Draught Flask
  glow(
    b.part(new THREE.SphereGeometry(0.028, 10, 8), GLOW_EMERALD, {
      bone: root,
      at: [0.44, 0.625, 0.06],
    }),
    2.2
  );
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.02, 8), BRASS, {
    bone: root,
    at: [0.44, 0.655, 0.06],
  });
  b.part(new THREE.CylinderGeometry(0.007, 0.006, 0.01, 8), CORK, {
    bone: root,
    at: [0.44, 0.668, 0.06],
  });

  // ---------------------------------------------------------------------------
  // SHELF 2 (Middle Hero Shelf, surface y = 1.015)
  // Lectern with Open Grimoire, Floating Rune Aura, 3-Candle Candelabra, Quill & Ink
  // ---------------------------------------------------------------------------
  const LECTERN_PITCH = 16 * (Math.PI / 180);
  const cosP = Math.cos(LECTERN_PITCH);
  const sinP = Math.sin(LECTERN_PITCH);

  // Wooden bracket under lectern
  b.part(new THREE.BoxGeometry(0.20, 0.12, 0.14), WOOD_TRIM, {
    bone: root,
    at: [0, 0.94, 0.18],
  });
  // Slanted lectern desktop
  b.part(new THREE.BoxGeometry(0.44, 0.022, 0.28), WOOD, {
    bone: root,
    at: [0, 1.045, 0.22],
    rotation: [-16, 0, 0],
  });
  // Retaining brass lip
  b.part(new THREE.BoxGeometry(0.44, 0.032, 0.02), BRASS, {
    bone: root,
    at: [0, 1.01, 0.33],
    rotation: [-16, 0, 0],
  });

  // Open Grimoire Back & Page Wedges
  b.part(new THREE.BoxGeometry(0.38, 0.015, 0.25), LEATHER_RUBY, {
    bone: root,
    at: [0, 1.052, 0.21],
    rotation: [-16, 0, 0],
  });
  b.part(new THREE.BoxGeometry(0.175, 0.022, 0.23), PAPER, {
    bone: root,
    at: [-0.09, 1.064, 0.21],
    rotation: [-16, 0, 3],
  });
  b.part(new THREE.BoxGeometry(0.175, 0.022, 0.23), PAPER, {
    bone: root,
    at: [0.09, 1.064, 0.21],
    rotation: [-16, 0, -3],
  });

  // Illuminated Open Book Spread
  b.part(new THREE.PlaneGeometry(0.36, 0.23), "#ffffff", {
    bone: root,
    at: [0, 1.076, 0.208],
    dir: [0, cosP, sinP],
    axis: "z",
    up: [0, sinP, -cosP],
    texture: OPEN_BOOK_PAGES,
  });

  // Silk bookmark ribbon trailing down
  b.part(new THREE.BoxGeometry(0.016, 0.002, 0.12), "#a61b2b", {
    bone: root,
    at: [0, 1.045, 0.27],
    rotation: [-16, 0, 0],
  });
  b.part(new THREE.BoxGeometry(0.016, 0.045, 0.002), "#a61b2b", {
    bone: root,
    at: [0, 0.995, 0.332],
  });

  // Holographic Arcane Summoning Ring (Hovering above the open book)
  glow(
    b.part(new THREE.PlaneGeometry(0.24, 0.24), "#ffffff", {
      bone: root,
      at: [0, 1.20, 0.20],
      rotation: [-74, 0, 0],
      texture: ARCANE_HOLO_RING,
      axis: "z",
    }),
    2.2
  );

  // Floating Starlight Particles above the book
  const BOOK_SPARKS: [number, number, number][] = [
    [-0.07, 1.25, 0.19],
    [0.08, 1.27, 0.17],
    [0.00, 1.22, 0.24],
  ];
  for (const spos of BOOK_SPARKS) {
    glow(
      b.part(new THREE.PlaneGeometry(0.03, 0.03), "#ffffff", {
        bone: root,
        at: spos,
        texture: MAGIC_SPARKLE,
        axis: "z",
      }),
      2.5
    );
  }

  // To the Right: Three-Candle Ornate Brass Candelabra with 3D Volumetric Flames
  const CANDLE_X = 0.34;
  const CANDLE_Z = 0.06;
  b.part(new THREE.CylinderGeometry(0.045, 0.052, 0.015, 12), BRASS, {
    bone: root,
    at: [CANDLE_X, 1.022, CANDLE_Z],
  });
  b.part(new THREE.CylinderGeometry(0.012, 0.016, 0.08, 10), BRASS_DARK, {
    bone: root,
    at: [CANDLE_X, 1.065, CANDLE_Z],
  });
  b.part(new THREE.SphereGeometry(0.02, 10, 8), BRASS_LIGHT, {
    bone: root,
    at: [CANDLE_X, 1.105, CANDLE_Z],
  });

  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.04, 0.006, 6, 12, Math.PI), BRASS, {
      bone: root,
      at: [CANDLE_X + s * 0.04, 1.105, CANDLE_Z],
      rotation: [0, 0, s > 0 ? 180 : 0],
    });
  }

  const CANDLE_CUPS: [number, number, number][] = [
    [CANDLE_X, 1.12, 0.075],
    [CANDLE_X - 0.075, 1.105, 0.055],
    [CANDLE_X + 0.075, 1.105, 0.045],
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
    // Wax Candle Column
    b.part(new THREE.CylinderGeometry(0.011, 0.011, ch, 10), WAX, {
      bone: root,
      at: [cx, cy + 0.015 + ch / 2, CANDLE_Z],
    });
    // Melting wax drips
    b.part(new THREE.SphereGeometry(0.005, 6, 4), WAX_MELT, {
      bone: root,
      at: [cx + 0.009, cy + ch + 0.005, CANDLE_Z],
    });
    b.part(new THREE.SphereGeometry(0.004, 6, 4), WAX_MELT, {
      bone: root,
      at: [cx - 0.008, cy + ch - 0.01, CANDLE_Z + 0.006],
    });
    // Black Thread Wick
    const wickTopY = cy + 0.015 + ch + 0.007;
    b.part(new THREE.CylinderGeometry(0.0015, 0.0015, 0.008, 4), "#111111", {
      bone: root,
      at: [cx, cy + 0.015 + ch + 0.004, CANDLE_Z],
    });
    // Volumetric 3D Anime Flame
    makeAnimeFlame([cx, wickTopY, CANDLE_Z], 1.0);
  }

  // Inkwell & Feather Quill
  b.part(new THREE.CylinderGeometry(0.022, 0.026, 0.032, 10), "#1c1824", {
    bone: root,
    at: [0.24, 1.031, 0.12],
  });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.010, 8), BRASS, {
    bone: root,
    at: [0.24, 1.052, 0.12],
  });
  b.part(new THREE.CylinderGeometry(0.002, 0.001, 0.16, 6), "#ede6d8", {
    bone: root,
    at: [0.25, 1.105, 0.11],
    rotation: [15, 0, 22],
  });
  b.part(new THREE.BoxGeometry(0.018, 0.08, 0.002), "#ffffff", {
    bone: root,
    at: [0.26, 1.135, 0.10],
    rotation: [15, 0, 22],
  });

  // To the Left: Stacked tomes with brass magnifying glass
  b.part(new THREE.BoxGeometry(0.18, 0.045, 0.22), LEATHER_NAVY, {
    bone: root,
    at: [-0.30, 1.037, 0.04],
  });
  b.part(new THREE.BoxGeometry(0.17, 0.040, 0.20), LEATHER_EMERALD, {
    bone: root,
    at: [-0.29, 1.080, 0.035],
    rotation: [0, 8, 0],
  });
  b.part(new THREE.TorusGeometry(0.032, 0.004, 8, 16), BRASS, {
    bone: root,
    at: [-0.29, 1.105, 0.04],
    rotation: [90, 0, 0],
  });
  b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.065, 8), WOOD_TRIM, {
    bone: root,
    at: [-0.24, 1.105, 0.04],
    rotation: [0, 0, 90],
  });

  // Draped scroll hanging over the shelf edge
  b.part(new THREE.PlaneGeometry(0.12, 0.18), "#ffffff", {
    bone: root,
    at: [-0.42, 1.02, 0.08],
    rotation: [-90, 0, 0],
    texture: SPELL_SCROLL,
    axis: "z",
  });
  b.part(new THREE.PlaneGeometry(0.12, 0.14), "#ffffff", {
    bone: root,
    at: [-0.42, 0.95, 0.171],
    texture: SPELL_SCROLL,
    axis: "z",
  });

  // ---------------------------------------------------------------------------
  // SHELF 3 (Upper Shelf, surface y = 1.475)
  // Brass Armillary Astrolabe, Row of 7 Grimoires, Glowing Amethyst Crystal Cluster
  // ---------------------------------------------------------------------------
  const ASTRO_X = -0.34;
  const ASTRO_Z = 0.02;
  b.part(new THREE.CylinderGeometry(0.04, 0.045, 0.015, 12), BRASS, {
    bone: root,
    at: [ASTRO_X, 1.482, ASTRO_Z],
  });
  b.part(new THREE.CylinderGeometry(0.008, 0.012, 0.06, 8), BRASS_DARK, {
    bone: root,
    at: [ASTRO_X, 1.515, ASTRO_Z],
  });
  b.part(new THREE.TorusGeometry(0.055, 0.004, 8, 20), BRASS, {
    bone: root,
    at: [ASTRO_X, 1.58, ASTRO_Z],
    rotation: [0, 0, 0],
  });
  b.part(new THREE.TorusGeometry(0.055, 0.004, 8, 20), BRASS_LIGHT, {
    bone: root,
    at: [ASTRO_X, 1.58, ASTRO_Z],
    rotation: [90, 0, 0],
  });
  b.part(new THREE.TorusGeometry(0.055, 0.004, 8, 20), BRASS, {
    bone: root,
    at: [ASTRO_X, 1.58, ASTRO_Z],
    rotation: [35, 45, 0],
  });
  glow(
    b.part(new THREE.SphereGeometry(0.018, 10, 8), GLOW_GOLD, {
      bone: root,
      at: [ASTRO_X, 1.58, ASTRO_Z],
    }),
    2.2
  );

  // Center: Densely Packed Row of 7 Grimoires
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
      at: [bx, 1.475 + bh / 2, 0.02],
      w: 0.16,
      h: bh,
      d: 0.038,
      color: col,
      coverTex: tex,
    });
  }

  // Right: Glowing Amethyst Crystal Cluster on Brass Pedestal
  const CRYS_X = 0.24;
  const CRYS_Z = 0.03;
  b.part(new THREE.CylinderGeometry(0.045, 0.05, 0.02, 12), BRASS_DARK, {
    bone: root,
    at: [CRYS_X, 1.485, CRYS_Z],
  });
  b.part(new THREE.CylinderGeometry(0.038, 0.038, 0.01, 12), "#301542", {
    bone: root,
    at: [CRYS_X, 1.498, CRYS_Z],
  });

  const CRYSTAL_SHARDS: [number, number, number, number, number][] = [
    [0, 0.065, 0.017, 0, 0],
    [-0.018, 0.048, 0.012, 12, 10],
    [0.018, 0.052, 0.013, -10, -8],
    [0.005, 0.040, 0.010, 15, -15],
    [-0.012, 0.044, 0.011, -8, 12],
  ];
  for (const [dx, ch, cr, rx, rz] of CRYSTAL_SHARDS) {
    glow(
      b.part(new THREE.ConeGeometry(cr, ch, 6), GLOW_AMETHYST, {
        bone: root,
        at: [CRYS_X + dx, 1.505 + ch / 2, CRYS_Z],
        rotation: [rx, 0, rz],
      }),
      2.0
    );
  }

  // Glazed Ceramic Urn holding rolled scrolls
  b.part(new THREE.CylinderGeometry(0.038, 0.028, 0.08, 12), "#2c2838", {
    bone: root,
    at: [0.38, 1.515, 0.04],
  });
  b.part(new THREE.TorusGeometry(0.038, 0.006, 8, 16), BRASS, {
    bone: root,
    at: [0.38, 1.555, 0.04],
    rotation: [90, 0, 0],
  });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 8), PAPER, {
    bone: root,
    at: [0.37, 1.58, 0.03],
    rotation: [12, 0, -8],
  });
  b.part(new THREE.CylinderGeometry(0.010, 0.010, 0.16, 8), PAPER, {
    bone: root,
    at: [0.39, 1.59, 0.05],
    rotation: [-10, 0, 15],
  });

  // ---------------------------------------------------------------------------
  // SIDE COLUMN ATTACHMENTS
  // ---------------------------------------------------------------------------
  // Left Column (x = -0.605): Hanging Pinned Celestial Star Chart
  b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.20, 8), WOOD_TRIM, {
    bone: root,
    at: [-0.605, 1.68, 0],
    dir: [0, 0, 1],
  });
  b.part(new THREE.SphereGeometry(0.006, 6, 4), BRASS_LIGHT, {
    bone: root,
    at: [-0.612, 1.68, -0.07],
  });
  b.part(new THREE.SphereGeometry(0.006, 6, 4), BRASS_LIGHT, {
    bone: root,
    at: [-0.612, 1.68, 0.07],
  });
  b.part(new THREE.PlaneGeometry(0.18, 0.27), "#ffffff", {
    bone: root,
    at: [-0.612, 1.54, 0],
    dir: [-1, 0, 0],
    texture: STAR_CHART,
    axis: "z",
  });
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

  // Right Column (x = +0.605): Brass Bracket with Faceted Amethyst Pendulum
  b.part(new THREE.BoxGeometry(0.08, 0.015, 0.02), BRASS, {
    bone: root,
    at: [0.635, 1.62, 0],
  });
  b.part(new THREE.SphereGeometry(0.008, 6, 4), BRASS_LIGHT, {
    bone: root,
    at: [0.67, 1.62, 0],
  });
  b.part(new THREE.CylinderGeometry(0.0015, 0.0015, 0.16, 4), BRASS_DARK, {
    bone: root,
    at: [0.67, 1.53, 0],
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.024), GLOW_AMETHYST, {
      bone: root,
      at: [0.67, 1.43, 0],
    }),
    2.0
  );

  // ---------------------------------------------------------------------------
  // FLOOR SURROUNDINGS & ATMOSPHERIC PROPS (On the Arcane Carpet)
  // ---------------------------------------------------------------------------
  // Left Floor: Stack of 3 folios on the carpet
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

  // Unrolled parchment spell scroll on the carpet
  b.part(new THREE.PlaneGeometry(0.14, 0.24), "#ffffff", {
    bone: root,
    at: [-0.22, 0.043, 0.38],
    rotation: [-90, 22, 0],
    texture: SPELL_SCROLL,
    axis: "z",
  });
  b.part(new THREE.OctahedronGeometry(0.018), BRASS, {
    bone: root,
    at: [-0.25, 0.055, 0.32],
  });

  // Melted Wax Puddle with 2 Floor Candles with Volumetric 3D Anime Flames
  const WAX_X = -0.52;
  const WAX_Z = 0.12;
  b.part(new THREE.CylinderGeometry(0.075, 0.085, 0.008, 12), WAX_MELT, {
    bone: root,
    at: [WAX_X, 0.044, WAX_Z],
  });
  b.part(new THREE.CylinderGeometry(0.045, 0.055, 0.006, 10), WAX_MELT, {
    bone: root,
    at: [WAX_X + 0.04, 0.045, WAX_Z - 0.03],
  });

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
    // Volumetric 3D Anime Flame
    makeAnimeFlame([fcx, fcy + fch + 0.007, WAX_Z], 0.9);
  }

  // Right Floor: Iron & Brass Cauldron holding ancient rolled scrolls
  const CAUL_X = 0.44;
  const CAUL_Z = 0.28;
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

  // Large leather folio leaning against the bookcase column base
  b.part(new THREE.BoxGeometry(0.24, 0.32, 0.045), LEATHER_NAVY, {
    bone: root,
    at: [0.38, 0.20, 0.14],
    rotation: [0, -32, 12],
  });
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.005, 12), "#8a1522", {
    bone: root,
    at: [0.36, 0.20, 0.165],
    rotation: [0, -32, 12],
  });

  return b.root;
}
```