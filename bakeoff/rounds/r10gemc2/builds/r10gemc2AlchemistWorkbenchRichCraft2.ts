import * as THREE from "three";
import {
  createBuilder,
  frame,
  aim,
  DEG,
  offset,
  rng,
  catmull,
  grain,
  mottle,
  paint,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { coil, metal } from "../../../../kits/clockwork";

export const meta = {
  name: "Alchemist's Workbench",
  description:
    "Genshin Impact-style scholar workbench loaded with glowing elemental potions, balancing brass scales, an illustrated open grimoire on a lectern, distillation alembic, Crystalfly specimen jar, and hanging herbs.",
};

export default function build() {
  const b = createBuilder({ name: "alchemist_workbench", detail: 1.1 });
  const root = b.joint("root", { at: [0, 0, 0] });

  // -------------------------------------------------------------------------------------------------------------
  // PALETTE & PAINTS (Genshin Impact Fantasy Scholar Aesthetic)
  // -------------------------------------------------------------------------------------------------------------
  const WOOD_DESK = grain("#743d22", "#4a2412", { size: 0.06, seed: 1 });
  const WOOD_LIGHT = grain("#9c542e", "#6e3518", { size: 0.05, seed: 2 });
  const WOOD_DARK = grain("#36170c", "#200b05", { size: 0.06, seed: 3 });
  const STONE_BASE = mottle("#1f2430", "#131620", { size: 0.12, contrast: 1.1, seed: 5 });

  const GOLD_PAINT = metal("gilt", { polish: 0.75, tarnish: 0.08 });
  const BRASS_PAINT = metal("brass", { polish: 0.55, tarnish: 0.18 });

  // Solid flat accents
  const GOLD = "#f8d356";
  const BRASS = "#e0aa42";
  const DARK_BRASS = "#7d5516";
  const IRON_BLACK = "#1a1922";
  const WHITE_MARBLE = "#eeebe2";
  const WARM_PARCHMENT = "#f8f0d8";
  const LEATHER_NAVY = "#162238";
  const LEATHER_BURGUNDY = "#52141f";
  const LEATHER_EMERALD = "#143a24";
  const LEATHER_BROWN = "#583017";
  const EMERALD_FABRIC = "#14462c";
  const GOLD_TRIM = "#ffda6b";
  const CORAL_WAX = "#d63838";
  const CLEAR_GLASS = "#d4f5f8";
  const AMBER_GLASS = "#d8a855";

  // Glowing elemental fluids & magical components
  const GLOW_ANEMO = "#26f7dd";
  const GLOW_PYRO = "#ff4224";
  const GLOW_ELECTRO = "#c446ff";
  const GLOW_DENDRO = "#3cf570";
  const GLOW_GEO = "#ffaa24";
  const GLOW_STARLIGHT = "#fff690";
  const GLOW_FLAME = "#ff9a33";
  const GLOW_FLAME_BLUE = "#479fff";

  // -------------------------------------------------------------------------------------------------------------
  // SVG TEXTURES (Grimoires, Alchemy Transmutation Circle, Bottle Labels, Herbs)
  // -------------------------------------------------------------------------------------------------------------

  // 1. Alchemical Transmutation Circle on Stone Floor (with built-in dark slate circular background)
  const transCircleSvg = svg(
    `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <!-- Dark slate foundation disc -->
      <circle cx="256" cy="256" r="254" fill="#1b202c" stroke="#d4a838" stroke-width="4.5"/>
      <circle cx="256" cy="256" r="242" fill="none" stroke="#26f7dd" stroke-width="1.8" stroke-dasharray="6 4" opacity="0.85"/>
      <circle cx="256" cy="256" r="230" fill="none" stroke="#f2ca54" stroke-width="2.5"/>
      <!-- Concentric Teyvat Runes Ring -->
      <circle cx="256" cy="256" r="206" fill="none" stroke="#e0aa38" stroke-width="2.2" stroke-dasharray="10 7"/>
      <!-- 8-Pointed Star -->
      <polygon points="256,36 280,196 440,220 280,244 256,404 232,244 72,220 232,196" fill="none" stroke="#fce688" stroke-width="3.5"/>
      <polygon points="100,100 210,210 256,66 302,210 412,100 302,256 412,412 256,302 100,412 210,256" fill="none" stroke="#dca832" stroke-width="2.2"/>
      <!-- Inner Geometric Rings and Glyphs -->
      <circle cx="256" cy="256" r="142" fill="none" stroke="#f2ca54" stroke-width="3"/>
      <circle cx="256" cy="256" r="95" fill="none" stroke="#ffd96b" stroke-width="2.2"/>
      <polygon points="256,161 338,303 174,303" fill="none" stroke="#26f7dd" stroke-width="2"/>
      <polygon points="256,351 174,209 338,209" fill="none" stroke="#26f7dd" stroke-width="2"/>
      <!-- Four-pointed Primogem Core -->
      <polygon points="256,202 272,256 256,310 240,256" fill="#fff5a8" stroke="#dfaa2c" stroke-width="2"/>
      <polygon points="202,256 256,272 310,256 256,240" fill="#fff5a8" stroke="#dfaa2c" stroke-width="2"/>
      <circle cx="256" cy="256" r="12" fill="#26f7dd"/>
    </svg>`,
    { size: 512 },
  );

  // 2. Open Grimoire Illustrated Pages Spread (Botanical Alchemy + Transmutation Alembic)
  const openBookSpreadSvg = svg(
    `<svg viewBox="0 0 512 360" xmlns="http://www.w3.org/2000/svg">
      <!-- Left Page: Distillation Apparatus & Elemental Glyphs -->
      <rect x="0" y="0" width="256" height="360" fill="#f8f1df"/>
      <rect x="18" y="16" width="220" height="328" fill="none" stroke="#8e6c3a" stroke-width="2"/>
      <rect x="22" y="20" width="212" height="320" fill="none" stroke="#b08e54" stroke-width="0.8"/>
      <text x="128" y="44" font-family="serif" font-size="14" font-weight="bold" fill="#36200e" text-anchor="middle">DE TRANSMUTATIONE</text>
      <!-- Diagram: Alembic Apparatus -->
      <circle cx="128" cy="116" r="38" fill="#fdf8ec" stroke="#68421b" stroke-width="2.2"/>
      <ellipse cx="128" cy="120" rx="28" ry="14" fill="#fae8c6" stroke="#a4753a" stroke-width="1.2"/>
      <path d="M 128 78 Q 160 70 174 105 T 186 150" fill="none" stroke="#68421b" stroke-width="2.5"/>
      <circle cx="186" cy="158" r="15" fill="#e8f8f9" stroke="#68421b" stroke-width="1.8"/>
      <!-- Arcane Latin Text lines -->
      <g stroke="#4f331a" stroke-width="2" stroke-linecap="round">
        <line x1="32" y1="182" x2="224" y2="182"/>
        <line x1="32" y1="196" x2="224" y2="196"/>
        <line x1="32" y1="210" x2="210" y2="210"/>
        <line x1="32" y1="224" x2="224" y2="224"/>
        <line x1="32" y1="238" x2="192" y2="238"/>
      </g>
      <!-- Seal at bottom left -->
      <circle cx="78" cy="286" r="26" fill="none" stroke="#94652a" stroke-width="1.8"/>
      <polygon points="78,264 96,300 60,300" fill="none" stroke="#94652a" stroke-width="1.2"/>
      <polygon points="78,308 60,272 96,272" fill="none" stroke="#94652a" stroke-width="1.2"/>
      <g stroke="#5c3a1a" stroke-width="1.8" stroke-linecap="round">
        <line x1="118" y1="272" x2="224" y2="272"/>
        <line x1="118" y1="286" x2="218" y2="286"/>
        <line x1="118" y1="300" x2="224" y2="300"/>
        <line x1="118" y1="314" x2="180" y2="314"/>
      </g>

      <!-- Center Fold Shadow -->
      <rect x="249" y="0" width="14" height="360" fill="#2b1506" opacity="0.28"/>

      <!-- Right Page: Botanical Alchemy (Windwheel Aster / Cecilia) -->
      <rect x="256" y="0" width="256" height="360" fill="#f8f3e3"/>
      <rect x="274" y="16" width="220" height="328" fill="none" stroke="#8e6c3a" stroke-width="2"/>
      <rect x="278" y="20" width="212" height="320" fill="none" stroke="#b08e54" stroke-width="0.8"/>
      <text x="384" y="44" font-family="serif" font-size="14" font-weight="bold" fill="#36200e" text-anchor="middle">FLORA ARCANUM</text>
      <!-- Botanical Sketch: Magic Flower with Roots -->
      <path d="M 384 142 Q 386 110 384 80" fill="none" stroke="#2d5225" stroke-width="3"/>
      <ellipse cx="384" cy="74" rx="8" ry="16" fill="#a4f2d8" stroke="#256434" stroke-width="1.5"/>
      <ellipse cx="370" cy="78" rx="14" ry="8" fill="#c4f7ce" stroke="#256434" stroke-width="1.5" transform="rotate(-30 370 78)"/>
      <ellipse cx="398" cy="78" rx="14" ry="8" fill="#c4f7ce" stroke="#256434" stroke-width="1.5" transform="rotate(30 398 78)"/>
      <circle cx="384" cy="78" r="6" fill="#ffde66"/>
      <!-- Roots -->
      <path d="M 384 142 Q 368 155 358 168 M 384 142 Q 396 156 408 165" fill="none" stroke="#5c3f1e" stroke-width="2"/>
      <!-- Star circle seal right -->
      <circle cx="384" cy="238" r="42" fill="none" stroke="#b08032" stroke-width="2"/>
      <circle cx="384" cy="238" r="34" fill="none" stroke="#d4a042" stroke-width="1.2" stroke-dasharray="5 3"/>
      <polygon points="384,200 410,238 384,276 358,238" fill="none" stroke="#9c6820" stroke-width="1.8"/>
      <g stroke="#4f331a" stroke-width="2" stroke-linecap="round">
        <line x1="288" y1="298" x2="480" y2="298"/>
        <line x1="288" y1="312" x2="465" y2="312"/>
        <line x1="288" y1="326" x2="430" y2="326"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  // 3. Grimoire Book Covers (Genshin celestial & alchemy gold-foil embossed)
  const bookCoverNavySvg = svg(
    `<svg viewBox="0 0 256 360" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="360" fill="#142034"/>
      <rect x="14" y="14" width="228" height="332" fill="none" stroke="#e0b242" stroke-width="3"/>
      <rect x="22" y="22" width="212" height="316" fill="none" stroke="#f4d476" stroke-width="1.2"/>
      <circle cx="128" cy="180" r="64" fill="none" stroke="#e0b242" stroke-width="2.2"/>
      <circle cx="128" cy="180" r="54" fill="none" stroke="#f6dc84" stroke-width="1" stroke-dasharray="6 4"/>
      <polygon points="128,122 144,174 196,180 144,186 128,238 112,186 60,180 112,174" fill="#fae89c" stroke="#c6962d" stroke-width="2.2"/>
    </svg>`,
    { size: 256 },
  );

  const bookCoverBurgundySvg = svg(
    `<svg viewBox="0 0 256 360" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="360" fill="#46141c"/>
      <rect x="14" y="14" width="228" height="332" fill="none" stroke="#e8ba4e" stroke-width="3"/>
      <polygon points="128,96 190,204 66,204" fill="none" stroke="#f6d77a" stroke-width="2.5"/>
      <polygon points="128,244 66,136 190,136" fill="none" stroke="#f6d77a" stroke-width="2.5"/>
      <circle cx="128" cy="170" r="48" fill="none" stroke="#e8ba4e" stroke-width="2"/>
      <circle cx="128" cy="170" r="16" fill="#fce894"/>
    </svg>`,
    { size: 256 },
  );

  // 4. Potion Bottle Label Decal
  const potionLabelSvg = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="16" width="112" height="96" rx="10" fill="#fdf8e6" stroke="#b68832" stroke-width="3.5"/>
      <rect x="14" y="22" width="100" height="84" rx="6" fill="none" stroke="#8c6018" stroke-width="1.2"/>
      <circle cx="64" cy="54" r="22" fill="none" stroke="#b68832" stroke-width="2"/>
      <polygon points="64,36 71,50 86,54 71,58 64,72 57,58 42,54 57,50" fill="#dfa240"/>
      <text x="64" y="94" font-family="serif" font-size="11" font-weight="bold" fill="#36200c" text-anchor="middle">ELIXIR</text>
    </svg>`,
    { size: 128 },
  );

  // 5. Dried Hanging Herb Sprig Cards
  const herbSprigSvg = svg(
    `<svg viewBox="0 0 128 256" xmlns="http://www.w3.org/2000/svg">
      <rect x="52" y="10" width="24" height="14" rx="2" fill="#8e6638"/>
      <path d="M 64 24 Q 60 90 64 160 T 62 245" fill="none" stroke="#483a22" stroke-width="3.5" stroke-linecap="round"/>
      <g stroke="#30502a" stroke-width="2" fill="#527848" stroke-linecap="round">
        <path d="M 64 60 Q 38 75 28 68 Q 42 56 64 60 Z"/>
        <path d="M 64 78 Q 90 92 102 84 Q 86 74 64 78 Z"/>
        <path d="M 64 105 Q 36 120 24 112 Q 38 100 64 105 Z"/>
        <path d="M 64 125 Q 94 140 106 130 Q 88 120 64 125 Z"/>
        <path d="M 64 155 Q 40 170 28 162 Q 44 148 64 155 Z"/>
        <path d="M 64 180 Q 86 195 96 186 Q 82 174 64 180 Z"/>
      </g>
      <g fill="#9889cc">
        <circle cx="28" cy="66" r="5.5"/>
        <circle cx="104" cy="82" r="6"/>
        <circle cx="22" cy="110" r="6.5"/>
        <circle cx="108" cy="128" r="6"/>
        <circle cx="26" cy="160" r="5.5"/>
        <circle cx="98" cy="184" r="6"/>
        <circle cx="62" cy="246" r="5"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  // 6. Glowing Small Lamp Grass Herb Card
  const lampGrassSvg = svg(
    `<svg viewBox="0 0 128 256" xmlns="http://www.w3.org/2000/svg">
      <rect x="52" y="10" width="24" height="14" rx="2" fill="#8e6638"/>
      <path d="M 64 24 Q 56 100 64 180 T 60 245" fill="none" stroke="#224220" stroke-width="3.5" stroke-linecap="round"/>
      <g stroke="#204c24" stroke-width="2.5" fill="#326c3a" stroke-linecap="round">
        <path d="M 64 70 Q 36 85 26 76 Q 42 64 64 70 Z"/>
        <path d="M 64 110 Q 92 125 104 115 Q 88 104 64 110 Z"/>
        <path d="M 64 150 Q 34 165 24 156 Q 40 144 64 150 Z"/>
      </g>
      <!-- Glowing Blue Lamp Bell Flower Heads -->
      <g fill="#36ecff" stroke="#0e789a" stroke-width="2">
        <ellipse cx="28" cy="86" rx="11" ry="15"/>
        <ellipse cx="102" cy="125" rx="12" ry="16"/>
        <ellipse cx="26" cy="166" rx="11" ry="15"/>
        <ellipse cx="62" cy="242" rx="13" ry="18"/>
      </g>
      <g fill="#ffffff">
        <circle cx="28" cy="90" r="3.5"/>
        <circle cx="102" cy="129" r="4"/>
        <circle cx="26" cy="170" r="3.5"/>
        <circle cx="62" cy="247" r="4.5"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  // -------------------------------------------------------------------------------------------------------------
  // 1. FLOOR DAIS & ALCHEMY SEAL (y = 0.00 to 0.05)
  // -------------------------------------------------------------------------------------------------------------
  const DAIS_R = 1.30;
  const DAIS_H = 0.05;

  // Main stepped circular stone dais standing firmly on y = 0
  b.part(new THREE.CylinderGeometry(DAIS_R, DAIS_R + 0.04, DAIS_H, 28), STONE_BASE, {
    bone: root,
    at: [0, DAIS_H / 2, 0],
  });

  // Solid perimeter brass stepped rim band
  b.part(new THREE.CylinderGeometry(DAIS_R + 0.005, DAIS_R + 0.005, 0.014, 28), BRASS_PAINT, {
    bone: root,
    at: [0, DAIS_H - 0.007, 0],
  });

  // Alchemical Transmutation Circle floor decal (resting directly on stone)
  b.part(new THREE.PlaneGeometry(2.36, 2.36), "#ffffff", {
    bone: root,
    at: [0, DAIS_H + 0.0018, 0],
    dir: [0, 1, 0],
    axis: "z",
    texture: transCircleSvg,
  });

  // -------------------------------------------------------------------------------------------------------------
  // 2. THE ALCHEMIST'S WORKBENCH (Tabletop, turned legs, stretchers, drawers)
  // -------------------------------------------------------------------------------------------------------------
  const TABLE_W = 1.56;
  const TABLE_D = 0.76;
  const TABLE_TOP_Y = 0.82;
  const TABLE_SLAB_THICK = 0.045;
  const TABLE_Z = -0.02;

  // Main tabletop slab
  b.frustumBox(
    [0, TABLE_TOP_Y - TABLE_SLAB_THICK, TABLE_Z],
    [0, TABLE_TOP_Y, TABLE_Z],
    [TABLE_W, TABLE_D],
    [TABLE_W, TABLE_D],
    { bone: root, color: WOOD_DESK },
  );

  // Decorative beveled rim molding around tabletop
  b.part(new THREE.BoxGeometry(TABLE_W + 0.03, 0.018, TABLE_D + 0.03), WOOD_LIGHT, {
    bone: root,
    at: [0, TABLE_TOP_Y - 0.01, TABLE_Z],
  });

  // Gold decorative corner fittings on the tabletop
  for (const sx of [1, -1]) {
    for (const sz of [1, -1]) {
      const cx = (sx * TABLE_W) / 2;
      const cz = TABLE_Z + (sz * TABLE_D) / 2;
      b.part(new THREE.BoxGeometry(0.045, 0.022, 0.045), GOLD, {
        bone: root,
        at: [cx, TABLE_TOP_Y - 0.005, cz],
      });
      b.part(new THREE.SphereGeometry(0.012, 8, 6), GOLD, {
        bone: root,
        at: [cx, TABLE_TOP_Y + 0.004, cz],
      });
    }
  }

  // Emerald velvet scholar's desk runner draped over the middle of the desk
  const RUNNER_W = 0.68;
  const RUNNER_D = TABLE_D + 0.02;
  b.part(new THREE.BoxGeometry(RUNNER_W, 0.006, RUNNER_D), EMERALD_FABRIC, {
    bone: root,
    at: [0, TABLE_TOP_Y + 0.003, TABLE_Z],
  });
  // Gold embroidered edges along the runner
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.014, 0.008, RUNNER_D), GOLD_TRIM, {
      bone: root,
      at: [s * (RUNNER_W / 2 - 0.01), TABLE_TOP_Y + 0.004, TABLE_Z],
    });
  }
  // Draped front cloth skirt hanging down front apron
  b.part(new THREE.BoxGeometry(RUNNER_W, 0.10, 0.008), EMERALD_FABRIC, {
    bone: root,
    at: [0, TABLE_TOP_Y - 0.05, TABLE_Z + TABLE_D / 2 + 0.01],
  });
  b.part(new THREE.BoxGeometry(RUNNER_W + 0.01, 0.012, 0.01), GOLD_TRIM, {
    bone: root,
    at: [0, TABLE_TOP_Y - 0.10, TABLE_Z + TABLE_D / 2 + 0.011],
  });

  // Turned desk legs: solid, continuous geometry from floor dais (y = 0.05) to tabletop (y = 0.775)
  const legX = 0.66;
  const legZ_front = TABLE_Z + TABLE_D / 2 - 0.08;
  const legZ_back = TABLE_Z - TABLE_D / 2 + 0.08;

  function buildTurnedLeg(lx: number, lz: number) {
    // 1. Brass Sabot foot at floor dais (y: 0.05 to 0.13)
    b.part(new THREE.CylinderGeometry(0.04, 0.048, 0.08, 12), BRASS_PAINT, {
      bone: root,
      at: [lx, 0.09, lz],
    });
    // Gold collar ring
    b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.016, 12), GOLD, {
      bone: root,
      at: [lx, 0.13, lz],
    });
    // Ankle spool connecting foot to junction block
    b.part(new THREE.CylinderGeometry(0.035, 0.04, 0.06, 12), WOOD_DARK, {
      bone: root,
      at: [lx, 0.16, lz],
    });

    // 2. Lower square junction block (y: 0.175 to 0.265)
    b.part(new THREE.BoxGeometry(0.08, 0.09, 0.08), WOOD_DARK, {
      bone: root,
      at: [lx, 0.22, lz],
    });

    // 3. Main turned baluster column (y: 0.265 to 0.675)
    b.part(new THREE.CylinderGeometry(0.04, 0.035, 0.04, 12), WOOD_DESK, {
      bone: root,
      at: [lx, 0.28, lz],
    });
    b.part(new THREE.SphereGeometry(0.052, 12, 10), WOOD_DESK, {
      bone: root,
      at: [lx, 0.35, lz],
      scale: [1, 1.2, 1],
    });
    b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.014, 12), BRASS_PAINT, {
      bone: root,
      at: [lx, 0.405, lz],
    });
    b.part(new THREE.CylinderGeometry(0.034, 0.044, 0.22, 12), WOOD_DESK, {
      bone: root,
      at: [lx, 0.52, lz],
    });
    b.part(new THREE.CylinderGeometry(0.048, 0.034, 0.05, 12), WOOD_LIGHT, {
      bone: root,
      at: [lx, 0.65, lz],
    });

    // 4. Upper capital block supporting tabletop
    b.part(new THREE.BoxGeometry(0.085, 0.11, 0.085), WOOD_DARK, {
      bone: root,
      at: [lx, 0.725, lz],
    });
    // Gold rosette ornament on outer face of upper leg
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.008, 8), GOLD, {
      bone: root,
      at: [lx + Math.sign(lx) * 0.045, 0.725, lz],
      dir: [Math.sign(lx), 0, 0],
    });
  }

  buildTurnedLeg(legX, legZ_front);
  buildTurnedLeg(-legX, legZ_front);
  buildTurnedLeg(legX, legZ_back);
  buildTurnedLeg(-legX, legZ_back);

  // Lower shelf platform (y = 0.22, firmly supported by leg junction blocks)
  const SHELF_LOW_W = 1.36;
  const SHELF_LOW_D = 0.56;
  const SHELF_LOW_Y = 0.22;
  b.part(new THREE.BoxGeometry(SHELF_LOW_W, 0.026, SHELF_LOW_D), WOOD_DARK, {
    bone: root,
    at: [0, SHELF_LOW_Y, TABLE_Z],
  });

  // Lower side stretchers
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.034, 0.045, legZ_front - legZ_back), WOOD_DARK, {
      bone: root,
      at: [s * legX, SHELF_LOW_Y, TABLE_Z],
    });
  }

  // Desk Apron (under tabletop y: 0.68 to 0.775)
  const APRON_Y = 0.725;
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.026, 0.08, TABLE_D - 0.14), WOOD_DESK, {
      bone: root,
      at: [s * (legX - 0.02), APRON_Y, TABLE_Z],
    });
  }
  b.part(new THREE.BoxGeometry(TABLE_W - 0.16, 0.08, 0.026), WOOD_DESK, {
    bone: root,
    at: [0, APRON_Y, legZ_back + 0.02],
  });

  // Front Apron with 3 drawers
  const frontApronZ = legZ_front - 0.02;
  const drawerW = 0.38;
  const drawerH = 0.065;
  for (let i = -1; i <= 1; i++) {
    const dx = i * 0.43;
    b.part(new THREE.BoxGeometry(drawerW, drawerH, 0.016), WOOD_LIGHT, {
      bone: root,
      at: [dx, APRON_Y, frontApronZ + 0.01],
    });
    b.part(new THREE.BoxGeometry(drawerW - 0.02, drawerH - 0.018, 0.02), WOOD_DARK, {
      bone: root,
      at: [dx, APRON_Y, frontApronZ + 0.011],
    });
    // Gold drop-handle
    b.part(new THREE.SphereGeometry(0.008, 8, 6), GOLD, {
      bone: root,
      at: [dx, APRON_Y, frontApronZ + 0.025],
    });
    b.part(new THREE.TorusGeometry(0.012, 0.003, 6, 12), BRASS_PAINT, {
      bone: root,
      at: [dx, APRON_Y - 0.012, frontApronZ + 0.025],
      dir: [0, 0, 1],
      axis: "z",
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // 3. UPPER HUTCH & STORAGE RACKS (Sitting on back of the table)
  // -------------------------------------------------------------------------------------------------------------
  const HUTCH_Z = TABLE_Z - 0.22;
  const HUTCH_W = 1.46;
  const MID_SHELF_Y = 1.18;
  const TOP_SHELF_Y = 1.50;

  // Vertical side panels with elegant Genshin baroque S-curve brackets
  for (const s of [1, -1]) {
    const hx = (s * HUTCH_W) / 2;
    b.part(new THREE.BoxGeometry(0.036, 0.74, 0.24), WOOD_DESK, {
      bone: root,
      at: [hx, 1.19, HUTCH_Z],
    });
    b.sweep(
      catmull([
        [hx, TABLE_TOP_Y, HUTCH_Z + 0.12],
        [hx, 1.00, HUTCH_Z + 0.14],
        [hx, 1.18, HUTCH_Z + 0.12],
        [hx, 1.36, HUTCH_Z + 0.13],
        [hx, TOP_SHELF_Y, HUTCH_Z + 0.12],
      ]),
      0.014,
      { bone: root, color: GOLD_PAINT },
    );
    b.part(new THREE.SphereGeometry(0.02, 10, 8), GOLD, {
      bone: root,
      at: [hx, TOP_SHELF_Y + 0.04, HUTCH_Z + 0.08],
    });
  }

  // Wooden backboard paneling with warm tone so items pop clearly
  b.part(new THREE.BoxGeometry(HUTCH_W - 0.04, 0.70, 0.018), WOOD_LIGHT, {
    bone: root,
    at: [0, 1.17, HUTCH_Z - 0.11],
  });

  // Mid-shelf
  b.part(new THREE.BoxGeometry(HUTCH_W - 0.04, 0.024, 0.22), WOOD_DESK, {
    bone: root,
    at: [0, MID_SHELF_Y, HUTCH_Z],
  });

  // Top-shelf
  b.part(new THREE.BoxGeometry(HUTCH_W - 0.04, 0.024, 0.20), WOOD_DESK, {
    bone: root,
    at: [0, TOP_SHELF_Y, HUTCH_Z],
  });

  // Arched top pediment with Genshin celestial crescent emblem
  b.part(new THREE.BoxGeometry(HUTCH_W, 0.03, 0.06), WOOD_LIGHT, {
    bone: root,
    at: [0, TOP_SHELF_Y + 0.022, HUTCH_Z],
  });
  b.sweep(
    catmull([
      [-0.48, TOP_SHELF_Y + 0.03, HUTCH_Z],
      [-0.24, TOP_SHELF_Y + 0.12, HUTCH_Z],
      [0, TOP_SHELF_Y + 0.15, HUTCH_Z],
      [0.24, TOP_SHELF_Y + 0.12, HUTCH_Z],
      [0.48, TOP_SHELF_Y + 0.03, HUTCH_Z],
    ]),
    0.018,
    { bone: root, color: WOOD_DESK },
  );
  b.part(new THREE.TorusGeometry(0.036, 0.007, 8, 16, Math.PI * 1.5), GOLD, {
    bone: root,
    at: [0, TOP_SHELF_Y + 0.14, HUTCH_Z + 0.01],
    dir: [0, 0, 1],
    axis: "z",
  });
  b.part(new THREE.SphereGeometry(0.016, 8, 8), GOLD, {
    bone: root,
    at: [0, TOP_SHELF_Y + 0.14, HUTCH_Z + 0.01],
  });

  // Top Shelf Brass Spindle Gallery Railing
  const RAIL_Y = TOP_SHELF_Y + 0.045;
  const railZ = HUTCH_Z + 0.09;
  b.part(new THREE.CylinderGeometry(0.005, 0.005, HUTCH_W - 0.08, 8), GOLD, {
    bone: root,
    at: [0, RAIL_Y, railZ],
    dir: [1, 0, 0],
  });
  for (let rx = -0.64; rx <= 0.64; rx += 0.08) {
    b.part(new THREE.CylinderGeometry(0.0035, 0.0045, 0.038, 6), BRASS_PAINT, {
      bone: root,
      at: [rx, TOP_SHELF_Y + 0.022, railZ],
    });
  }

  // Pigeonhole cubbies on the left of mid-shelf
  const CUBBY_X = -0.52;
  b.part(new THREE.BoxGeometry(0.016, MID_SHELF_Y - TABLE_TOP_Y, 0.20), WOOD_DARK, {
    bone: root,
    at: [CUBBY_X, (MID_SHELF_Y + TABLE_TOP_Y) / 2, HUTCH_Z],
  });
  b.part(new THREE.BoxGeometry(0.016, MID_SHELF_Y - TABLE_TOP_Y, 0.20), WOOD_DARK, {
    bone: root,
    at: [CUBBY_X + 0.12, (MID_SHELF_Y + TABLE_TOP_Y) / 2, HUTCH_Z],
  });

  // Mini-drawers on the right of mid-shelf
  const MINI_X = 0.52;
  b.part(new THREE.BoxGeometry(0.016, MID_SHELF_Y - TABLE_TOP_Y, 0.20), WOOD_DARK, {
    bone: root,
    at: [MINI_X - 0.12, (MID_SHELF_Y + TABLE_TOP_Y) / 2, HUTCH_Z],
  });
  for (let m = 0; m < 2; m++) {
    const my = TABLE_TOP_Y + 0.09 + m * 0.14;
    b.part(new THREE.BoxGeometry(0.18, 0.10, 0.016), WOOD_LIGHT, {
      bone: root,
      at: [MINI_X - 0.02, my, HUTCH_Z + 0.10],
    });
    b.part(new THREE.SphereGeometry(0.007, 8, 6), GOLD, {
      bone: root,
      at: [MINI_X - 0.02, my, HUTCH_Z + 0.115],
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // 4. CANTILEVERED HERB RACK WITH GLOWING SMALL LAMP GRASS & DRIED FLORA
  // -------------------------------------------------------------------------------------------------------------
  // Curved brass arm extending forward from hutch pillar over desk
  const armStartX = -HUTCH_W / 2 + 0.02;
  const armStartY = MID_SHELF_Y - 0.04;
  const armZ = HUTCH_Z;
  b.sweep(
    catmull([
      [armStartX, armStartY, armZ],
      [armStartX + 0.06, armStartY + 0.03, armZ + 0.15],
      [-0.42, armStartY + 0.03, 0.09],
      [-0.14, armStartY + 0.03, 0.09],
    ]),
    0.007,
    { bone: root, color: GOLD_PAINT },
  );

  // Hanging herb bundles with generous size and vibrant colors
  const herbDrops = [
    { x: -0.42, z: 0.09, tex: lampGrassSvg, lamp: true },
    { x: -0.28, z: 0.09, tex: herbSprigSvg, lamp: false },
    { x: -0.14, z: 0.09, tex: lampGrassSvg, lamp: true },
  ];
  for (const h of herbDrops) {
    const hy = armStartY + 0.02;
    b.part(new THREE.TorusGeometry(0.01, 0.0025, 4, 12, Math.PI * 1.5), GOLD, {
      bone: root,
      at: [h.x, hy, h.z],
      dir: [1, 0, 0],
      axis: "z",
    });
    b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.018, 6), LEATHER_BROWN, {
      bone: root,
      at: [h.x, hy - 0.014, h.z],
    });
    const fCard = frame([h.x, hy - 0.02, h.z], [0, -1, 0]);
    const bundleCards = b.cards([fCard], h.tex, {
      size: [0.08, 0.16],
      cross: true,
      bone: root,
    });
    if (h.lamp) {
      glow(bundleCards, 1.8);
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // 5. BALANCING BRASS SCALES (Hero Alchemy Prop on right tabletop)
  // -------------------------------------------------------------------------------------------------------------
  const SCALE_X = 0.38;
  const SCALE_Z = 0.08;
  const SCALE_BASE_Y = TABLE_TOP_Y;

  // Solid stepped brass base resting directly on tabletop
  b.part(new THREE.CylinderGeometry(0.054, 0.068, 0.024, 16), BRASS_PAINT, {
    bone: root,
    at: [SCALE_X, SCALE_BASE_Y + 0.012, SCALE_Z],
  });
  b.part(new THREE.CylinderGeometry(0.058, 0.058, 0.01, 16), GOLD, {
    bone: root,
    at: [SCALE_X, SCALE_BASE_Y + 0.02, SCALE_Z],
  });

  // Turned central brass pillar (spans y = 0.84 to 1.14)
  b.part(new THREE.CylinderGeometry(0.014, 0.022, 0.28, 12), GOLD_PAINT, {
    bone: root,
    at: [SCALE_X, SCALE_BASE_Y + 0.16, SCALE_Z],
  });
  b.part(new THREE.SphereGeometry(0.022, 10, 8), GOLD, {
    bone: root,
    at: [SCALE_X, SCALE_BASE_Y + 0.29, SCALE_Z],
  });

  // Fulcrum pivot housing with pointer needle & graduated degree arc
  const FULCRUM_Y = SCALE_BASE_Y + 0.31;
  b.part(new THREE.BoxGeometry(0.034, 0.034, 0.026), BRASS_PAINT, {
    bone: root,
    at: [SCALE_X, FULCRUM_Y, SCALE_Z],
  });
  b.part(new THREE.TorusGeometry(0.032, 0.004, 6, 16, Math.PI * 0.6), GOLD, {
    bone: root,
    at: [SCALE_X, FULCRUM_Y - 0.015, SCALE_Z + 0.014],
    dir: [0, 0, 1],
    axis: "z",
  });

  // Tilted balance beam (~4 deg tilt: left side heavier with glowing crystals)
  const BEAM_HALF_LEN = 0.18;
  const TILT_ANGLE = 4.0 * DEG;
  const beamLeftX = SCALE_X - BEAM_HALF_LEN * Math.cos(TILT_ANGLE);
  const beamLeftY = FULCRUM_Y - BEAM_HALF_LEN * Math.sin(TILT_ANGLE);
  const beamRightX = SCALE_X + BEAM_HALF_LEN * Math.cos(TILT_ANGLE);
  const beamRightY = FULCRUM_Y + BEAM_HALF_LEN * Math.sin(TILT_ANGLE);

  b.sweep(
    catmull([
      [beamLeftX, beamLeftY, SCALE_Z],
      [SCALE_X, FULCRUM_Y, SCALE_Z],
      [beamRightX, beamRightY, SCALE_Z],
    ]),
    [0.0045, 0.008, 0.0045],
    { bone: root, color: GOLD_PAINT },
  );

  // Finial acorn on top of fulcrum
  b.part(new THREE.ConeGeometry(0.012, 0.032, 8), GOLD, {
    bone: root,
    at: [SCALE_X, FULCRUM_Y + 0.026, SCALE_Z],
    dir: [0, 1, 0],
  });

  // Left Scale Pan (Heavier side with glowing Cor Lapis / Electro crystal)
  const panLeftY = beamLeftY - 0.15;
  const PAN_R = 0.052;
  for (let a = 0; a < 3; a++) {
    const ang = a * ((Math.PI * 2) / 3);
    const px = beamLeftX + Math.cos(ang) * (PAN_R - 0.004);
    const pz = SCALE_Z + Math.sin(ang) * (PAN_R - 0.004);
    b.rod([beamLeftX, beamLeftY, SCALE_Z], [px, panLeftY + 0.004, pz], 0.002, GOLD, { bone: root });
  }
  b.part(new THREE.CylinderGeometry(PAN_R, PAN_R - 0.014, 0.012, 16), BRASS_PAINT, {
    bone: root,
    at: [beamLeftX, panLeftY, SCALE_Z],
  });
  // Chunky, bold glowing Cor Lapis crystal cluster in left pan
  const crystalCluster = b.part(new THREE.ConeGeometry(0.024, 0.055, 6), GLOW_GEO, {
    bone: root,
    at: [beamLeftX, panLeftY + 0.026, SCALE_Z],
    dir: [0.2, 1, 0.1],
  });
  glow(crystalCluster, 2.0);
  const crystalSide = b.part(new THREE.ConeGeometry(0.016, 0.038, 5), GLOW_ELECTRO, {
    bone: root,
    at: [beamLeftX + 0.018, panLeftY + 0.018, SCALE_Z - 0.012],
    dir: [0.5, 0.8, -0.2],
  });
  glow(crystalSide, 2.2);

  // Right Scale Pan (Counterweights side)
  const panRightY = beamRightY - 0.15;
  for (let a = 0; a < 3; a++) {
    const ang = a * ((Math.PI * 2) / 3);
    const px = beamRightX + Math.cos(ang) * (PAN_R - 0.004);
    const pz = SCALE_Z + Math.sin(ang) * (PAN_R - 0.004);
    b.rod([beamRightX, beamRightY, SCALE_Z], [px, panRightY + 0.004, pz], 0.002, GOLD, { bone: root });
  }
  b.part(new THREE.CylinderGeometry(PAN_R, PAN_R - 0.014, 0.012, 16), BRASS_PAINT, {
    bone: root,
    at: [beamRightX, panRightY, SCALE_Z],
  });
  // Stacked cylindrical brass weights
  b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.02, 10), GOLD, {
    bone: root,
    at: [beamRightX - 0.012, panRightY + 0.014, SCALE_Z],
  });
  b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.016, 8), GOLD, {
    bone: root,
    at: [beamRightX + 0.016, panRightY + 0.012, SCALE_Z - 0.01],
  });
  b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.012, 8), GOLD, {
    bone: root,
    at: [beamRightX + 0.006, panRightY + 0.01, SCALE_Z + 0.016],
  });

  // -------------------------------------------------------------------------------------------------------------
  // 6. DISTILLATION RETORT & CONDENSER COIL (Right desk station)
  // -------------------------------------------------------------------------------------------------------------
  const RETORT_X = 0.62;
  const RETORT_Z = -0.06;

  // Brass tripod burner stand
  const TRIPOD_RING_Y = TABLE_TOP_Y + 0.11;
  const TRIPOD_R = 0.052;
  b.part(new THREE.CylinderGeometry(TRIPOD_R, TRIPOD_R, 0.012, 16), BRASS_PAINT, {
    bone: root,
    at: [RETORT_X, TRIPOD_RING_Y, RETORT_Z],
  });
  for (let i = 0; i < 3; i++) {
    const la = i * ((Math.PI * 2) / 3) + 0.4;
    const topX = RETORT_X + Math.cos(la) * TRIPOD_R;
    const topZ = RETORT_Z + Math.sin(la) * TRIPOD_R;
    const botX = RETORT_X + Math.cos(la) * (TRIPOD_R + 0.038);
    const botZ = RETORT_Z + Math.sin(la) * (TRIPOD_R + 0.038);
    b.sweep(
      catmull([
        [topX, TRIPOD_RING_Y, topZ],
        [(topX + botX) * 0.5 + 0.008, TRIPOD_RING_Y - 0.05, (topZ + botZ) * 0.5],
        [botX, TABLE_TOP_Y, botZ],
      ]),
      0.006,
      { bone: root, color: DARK_BRASS },
    );
  }

  // Brass burner pot with glowing blue magic flame
  b.part(new THREE.CylinderGeometry(0.026, 0.022, 0.024, 12), BRASS_PAINT, {
    bone: root,
    at: [RETORT_X, TABLE_TOP_Y + 0.015, RETORT_Z],
  });
  const magicFlame = b.part(new THREE.ConeGeometry(0.018, 0.052, 8), GLOW_FLAME_BLUE, {
    bone: root,
    at: [RETORT_X, TABLE_TOP_Y + 0.052, RETORT_Z],
    dir: [0, 1, 0],
  });
  glow(magicFlame, 2.2);

  // Spherical glass boiler flask seated in the tripod ring
  const BOILER_Y = TRIPOD_RING_Y + 0.036;
  b.part(new THREE.SphereGeometry(0.048, 14, 12), CLEAR_GLASS, {
    bone: root,
    at: [RETORT_X, BOILER_Y, RETORT_Z],
  });
  const boilingPotion = b.part(new THREE.SphereGeometry(0.042, 12, 10), GLOW_GEO, {
    bone: root,
    at: [RETORT_X, BOILER_Y - 0.006, RETORT_Z],
  });
  glow(boilingPotion, 1.9);
  // Flask neck with brass collar
  b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.038, 10), CLEAR_GLASS, {
    bone: root,
    at: [RETORT_X, BOILER_Y + 0.052, RETORT_Z],
  });
  b.part(new THREE.CylinderGeometry(0.019, 0.019, 0.009, 10), GOLD, {
    bone: root,
    at: [RETORT_X, BOILER_Y + 0.068, RETORT_Z],
  });

  // Distillation condenser coil apparatus leading to receiver flask
  const RECEIVER_X = 0.65;
  const RECEIVER_Z = 0.16;

  const jacketTop: [number, number, number] = [0.63, TABLE_TOP_Y + 0.165, 0.03];
  const jacketBot: [number, number, number] = [RECEIVER_X, TABLE_TOP_Y + 0.08, RECEIVER_Z];
  b.rod(jacketTop, jacketBot, 0.017, CLEAR_GLASS, { bone: root });
  // Glowing blue vapor coil inside cooling jacket
  b.sweep(coil(jacketTop, jacketBot, 0.011, 4), 0.003, { bone: root, color: GLOW_ANEMO });

  // Receiver Erlenmeyer flask collecting drops on table
  b.part(new THREE.ConeGeometry(0.045, 0.08, 12), CLEAR_GLASS, {
    bone: root,
    at: [RECEIVER_X, TABLE_TOP_Y + 0.04, RECEIVER_Z],
    dir: [0, 1, 0],
  });
  const distillate = b.part(new THREE.ConeGeometry(0.038, 0.045, 10), GLOW_ANEMO, {
    bone: root,
    at: [RECEIVER_X, TABLE_TOP_Y + 0.024, RECEIVER_Z],
    dir: [0, 1, 0],
  });
  glow(distillate, 2.0);

  // -------------------------------------------------------------------------------------------------------------
  // 7. THE GREAT OPEN GRIMOIRE ON SCHOLAR'S LECTERN (Centerpiece Hero Feature)
  // -------------------------------------------------------------------------------------------------------------
  // Positioned proudly on the emerald runner, tilted up at 42° toward camera for stunning readability
  const BOOK_X = -0.06;
  const BOOK_Z = 0.12;
  const LECTERN_ROT_Y = 6 * DEG;
  const LECTERN_TILT_X = 42 * DEG; // Bold forward tilt toward viewer
  const BOOK_W = 0.32;
  const BOOK_H = 0.22;

  const lecternBaseQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), LECTERN_ROT_Y);
  const lecternTiltQ = lecternBaseQ.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -LECTERN_TILT_X));

  // Wooden angled lectern stand
  b.part(new THREE.BoxGeometry(BOOK_W + 0.04, 0.05, BOOK_H * 0.75), WOOD_DARK, {
    bone: root,
    at: [BOOK_X, TABLE_TOP_Y + 0.03, BOOK_Z - 0.03],
    quat: lecternBaseQ,
  });
  // Retaining ledge at front of lectern
  b.part(new THREE.BoxGeometry(BOOK_W + 0.05, 0.03, 0.02), GOLD, {
    bone: root,
    at: [BOOK_X, TABLE_TOP_Y + 0.025, BOOK_Z + 0.08],
    quat: lecternBaseQ,
  });

  // Leather book covers tilted on the lectern
  const bookCenter = new THREE.Vector3(BOOK_X, TABLE_TOP_Y + 0.065, BOOK_Z);
  b.part(new THREE.BoxGeometry(BOOK_W + 0.02, 0.024, BOOK_H + 0.02), LEATHER_BURGUNDY, {
    bone: root,
    at: [bookCenter.x, bookCenter.y, bookCenter.z],
    quat: lecternTiltQ,
  });

  // Gold corner brackets on grimoire
  for (const cx of [-BOOK_W / 2 - 0.006, BOOK_W / 2 + 0.006]) {
    for (const cz of [-BOOK_H / 2 - 0.006, BOOK_H / 2 + 0.006]) {
      const pos = new THREE.Vector3(cx, 0.015, cz).applyQuaternion(lecternTiltQ).add(bookCenter);
      b.part(new THREE.BoxGeometry(0.024, 0.026, 0.024), GOLD, {
        bone: root,
        at: [pos.x, pos.y, pos.z],
        quat: lecternTiltQ,
      });
    }
  }

  // Tilted open page block
  b.part(new THREE.BoxGeometry(BOOK_W, 0.02, BOOK_H), WARM_PARCHMENT, {
    bone: root,
    at: [bookCenter.x, bookCenter.y + 0.016, bookCenter.z],
    quat: lecternTiltQ,
  });

  // Illustrated Pages Decal (clearly facing viewer)
  b.part(new THREE.PlaneGeometry(BOOK_W, BOOK_H), "#ffffff", {
    bone: root,
    at: [bookCenter.x, bookCenter.y + 0.027, bookCenter.z],
    quat: lecternTiltQ.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2)),
    texture: openBookSpreadSvg,
  });

  // Silk ribbon bookmark draped across pages and spilling down desk
  const ribbonStart = new THREE.Vector3(0, 0.035, -BOOK_H / 2).applyQuaternion(lecternTiltQ).add(bookCenter);
  const ribbonMid = new THREE.Vector3(0.04, 0.035, 0.02).applyQuaternion(lecternTiltQ).add(bookCenter);
  const ribbonHang = new THREE.Vector3(0.07, 0.01, BOOK_H / 2 + 0.06).applyQuaternion(lecternTiltQ).add(bookCenter);
  b.sweep(catmull([ribbonStart, ribbonMid, ribbonHang]), 0.005, {
    bone: root,
    color: GOLD,
  });

  // -------------------------------------------------------------------------------------------------------------
  // 8. SCHOLAR'S BRASS CANDELABRA (Left tabletop corner - Atmospheric Lighting)
  // -------------------------------------------------------------------------------------------------------------
  const CANDLE_X = -0.58;
  const CANDLE_Z = -0.06;
  const candBaseY = TABLE_TOP_Y;

  // Stepped brass base
  b.part(new THREE.CylinderGeometry(0.046, 0.056, 0.02, 12), BRASS_PAINT, {
    bone: root,
    at: [CANDLE_X, candBaseY + 0.01, CANDLE_Z],
  });
  // Central turned stem
  b.part(new THREE.CylinderGeometry(0.012, 0.018, 0.22, 10), GOLD_PAINT, {
    bone: root,
    at: [CANDLE_X, candBaseY + 0.12, CANDLE_Z],
  });

  // 3 candle branches (Center, Left, Right)
  const candleHeights = [0.26, 0.22, 0.22];
  const candleOffsets = [0, -0.065, 0.065];
  for (let c = 0; c < 3; c++) {
    const cx = CANDLE_X + candleOffsets[c];
    const cy = candBaseY + candleHeights[c];
    if (c > 0) {
      // Curved brass branch connecting to stem
      b.sweep(
        catmull([
          [CANDLE_X, candBaseY + 0.16, CANDLE_Z],
          [CANDLE_X + candleOffsets[c] * 0.6, candBaseY + 0.14, CANDLE_Z],
          [cx, cy - 0.02, CANDLE_Z],
        ]),
        0.005,
        { bone: root, color: GOLD_PAINT },
      );
    }
    // Drip cup
    b.part(new THREE.CylinderGeometry(0.02, 0.014, 0.01, 10), BRASS_PAINT, {
      bone: root,
      at: [cx, cy, CANDLE_Z],
    });
    // White wax candle column
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 8), "#f7f4ea", {
      bone: root,
      at: [cx, cy + 0.035, CANDLE_Z],
    });
    // Glowing golden candle flame
    const candleFlame = b.part(new THREE.ConeGeometry(0.008, 0.024, 6), GLOW_FLAME, {
      bone: root,
      at: [cx, cy + 0.075, CANDLE_Z],
      dir: [0, 1, 0],
    });
    glow(candleFlame, 2.2);
  }

  // -------------------------------------------------------------------------------------------------------------
  // 9. GENSHIN CRYSTALFLY SPECIMEN JAR (Upper Shelf Hero Feature)
  // -------------------------------------------------------------------------------------------------------------
  const JAR_X = 0.52;
  const jarZ = HUTCH_Z + 0.03;
  const jarBaseY = TOP_SHELF_Y + 0.012;

  // Brass pedestal base
  b.part(new THREE.CylinderGeometry(0.045, 0.052, 0.016, 14), BRASS_PAINT, {
    bone: root,
    at: [JAR_X, jarBaseY + 0.008, jarZ],
  });
  // Clear cylindrical bell jar
  b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.095, 14), CLEAR_GLASS, {
    bone: root,
    at: [JAR_X, jarBaseY + 0.065, jarZ],
  });
  b.part(new THREE.SphereGeometry(0.042, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), CLEAR_GLASS, {
    bone: root,
    at: [JAR_X, jarBaseY + 0.112, jarZ],
  });
  // Brass top finial
  b.part(new THREE.ConeGeometry(0.012, 0.024, 8), GOLD, {
    bone: root,
    at: [JAR_X, jarBaseY + 0.165, jarZ],
    dir: [0, 1, 0],
  });

  // Floating Anemo Crystalfly inside the jar
  const flyCenter = [JAR_X, jarBaseY + 0.07, jarZ] as const;
  const flyCore = b.part(new THREE.SphereGeometry(0.01, 8, 8), GLOW_STARLIGHT, {
    bone: root,
    at: flyCenter,
  });
  glow(flyCore, 2.4);
  // 4 delicate glowing Anemo wings
  const wingAngles = [-40, 40, -140, 140];
  for (const wa of wingAngles) {
    const wAng = wa * DEG;
    const wx = JAR_X + Math.cos(wAng) * 0.022;
    const wy = jarBaseY + 0.07 + (Math.abs(wa) < 90 ? 0.014 : -0.01);
    const wz = jarZ + Math.sin(wAng) * 0.016;
    const wing = b.part(new THREE.ConeGeometry(0.011, 0.028, 4), GLOW_ANEMO, {
      bone: root,
      at: [wx, wy, wz],
      dir: [Math.cos(wAng), (Math.abs(wa) < 90 ? 0.6 : -0.5), Math.sin(wAng)],
    });
    glow(wing, 2.2);
  }

  // -------------------------------------------------------------------------------------------------------------
  // 10. CLOSED BOOKS & STACKS (Tabletop & shelves)
  // -------------------------------------------------------------------------------------------------------------
  // Stack of 3 heavy grimoires on the left tabletop
  const STACK_X = -0.58;
  const STACK_Z = 0.14;

  // Book 1 (Bottom, Large Obsidian Tome)
  b.part(new THREE.BoxGeometry(0.24, 0.042, 0.18), IRON_BLACK, {
    bone: root,
    at: [STACK_X, TABLE_TOP_Y + 0.021, STACK_Z],
  });
  b.part(new THREE.BoxGeometry(0.22, 0.036, 0.16), WARM_PARCHMENT, {
    bone: root,
    at: [STACK_X + 0.005, TABLE_TOP_Y + 0.021, STACK_Z],
  });
  for (let rib = -0.06; rib <= 0.06; rib += 0.04) {
    b.part(new THREE.BoxGeometry(0.012, 0.044, 0.012), GOLD, {
      bone: root,
      at: [STACK_X - 0.118, TABLE_TOP_Y + 0.021, STACK_Z + rib],
    });
  }

  // Book 2 (Middle, Burgundy Tome with Alchemy Seal)
  const book2Q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -8 * DEG);
  b.part(new THREE.BoxGeometry(0.21, 0.036, 0.15), LEATHER_BURGUNDY, {
    bone: root,
    at: [STACK_X, TABLE_TOP_Y + 0.06, STACK_Z],
    quat: book2Q,
  });
  b.part(new THREE.PlaneGeometry(0.20, 0.14), "#ffffff", {
    bone: root,
    at: [STACK_X, TABLE_TOP_Y + 0.079, STACK_Z],
    quat: book2Q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2)),
    texture: bookCoverBurgundySvg,
  });

  // Book 3 (Top, Navy Celestial Tome, slightly askew)
  const book3Q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 16 * DEG);
  b.part(new THREE.BoxGeometry(0.18, 0.032, 0.13), LEATHER_NAVY, {
    bone: root,
    at: [STACK_X - 0.01, TABLE_TOP_Y + 0.095, STACK_Z - 0.01],
    quat: book3Q,
  });
  b.part(new THREE.PlaneGeometry(0.17, 0.12), "#ffffff", {
    bone: root,
    at: [STACK_X - 0.01, TABLE_TOP_Y + 0.112, STACK_Z - 0.01],
    quat: book3Q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2)),
    texture: bookCoverNavySvg,
  });

  // Upright Books Row on the middle shelf
  const SHELF_BOOKS_X = -0.34;
  const shelfBooksZ = HUTCH_Z + 0.02;
  const shelfColors = [LEATHER_NAVY, LEATHER_BURGUNDY, LEATHER_EMERALD, LEATHER_BROWN, IRON_BLACK, LEATHER_BURGUNDY];
  let curBx = SHELF_BOOKS_X;
  for (let bIdx = 0; bIdx < 6; bIdx++) {
    const bW = 0.034 + (bIdx % 3) * 0.008;
    const bH = 0.19 + (bIdx % 2) * 0.03;
    const bD = 0.14;
    b.part(new THREE.BoxGeometry(bW, bH, bD), shelfColors[bIdx], {
      bone: root,
      at: [curBx + bW / 2, MID_SHELF_Y + bH / 2 + 0.012, shelfBooksZ],
    });
    b.part(new THREE.BoxGeometry(bW + 0.004, 0.014, 0.006), GOLD, {
      bone: root,
      at: [curBx + bW / 2, MID_SHELF_Y + bH * 0.75 + 0.012, shelfBooksZ + bD / 2 + 0.002],
    });
    curBx += bW + 0.004;
  }
  b.part(new THREE.ConeGeometry(0.045, 0.12, 3), BRASS_PAINT, {
    bone: root,
    at: [curBx + 0.03, MID_SHELF_Y + 0.06, shelfBooksZ],
    dir: [0, 1, 0],
  });

  // -------------------------------------------------------------------------------------------------------------
  // 11. GLOWING POTIONS & REAGENT FLASKS (Tabletop & Shelves)
  // -------------------------------------------------------------------------------------------------------------
  // Potion 1: Spherical Pyro Flask (Glow Crimson) on table
  const p1X = -0.22;
  const p1Z = 0.24;
  const p1Base = TABLE_TOP_Y + 0.038;
  b.part(new THREE.SphereGeometry(0.038, 12, 10), CLEAR_GLASS, {
    bone: root,
    at: [p1X, p1Base, p1Z],
  });
  const pyroFluid = b.part(new THREE.SphereGeometry(0.030, 10, 8), GLOW_PYRO, {
    bone: root,
    at: [p1X, p1Base - 0.005, p1Z],
  });
  glow(pyroFluid, 2.0);
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.024, 10), CLEAR_GLASS, {
    bone: root,
    at: [p1X, p1Base + 0.042, p1Z],
  });
  b.part(new THREE.CylinderGeometry(0.010, 0.009, 0.015, 8), LEATHER_BROWN, {
    bone: root,
    at: [p1X, p1Base + 0.056, p1Z],
  });
  b.part(new THREE.PlaneGeometry(0.034, 0.034), "#ffffff", {
    bone: root,
    at: [p1X, p1Base, p1Z + 0.039],
    texture: potionLabelSvg,
  });

  // Potion 2: Hexagonal Prism Bottle (Glow Electro Amethyst)
  const p2X = 0.15;
  const p2Z = 0.22;
  const p2H = 0.095;
  b.part(new THREE.CylinderGeometry(0.028, 0.028, p2H, 6), CLEAR_GLASS, {
    bone: root,
    at: [p2X, TABLE_TOP_Y + p2H / 2, p2Z],
  });
  const electroFluid = b.part(new THREE.CylinderGeometry(0.023, 0.023, p2H * 0.75, 6), GLOW_ELECTRO, {
    bone: root,
    at: [p2X, TABLE_TOP_Y + (p2H * 0.75) / 2 + 0.004, p2Z],
  });
  glow(electroFluid, 2.2);
  b.part(new THREE.ConeGeometry(0.03, 0.025, 6), GOLD, {
    bone: root,
    at: [p2X, TABLE_TOP_Y + p2H + 0.01, p2Z],
    dir: [0, 1, 0],
  });
  b.part(new THREE.SphereGeometry(0.011, 8, 6), GOLD, {
    bone: root,
    at: [p2X, TABLE_TOP_Y + p2H + 0.026, p2Z],
  });

  // Potion 3: Pinched Anemo Vial (Glow Cyan) on the desk
  const p3X = -0.42;
  const p3Z = -0.06;
  b.sweep(
    catmull([
      [p3X, TABLE_TOP_Y + 0.01, p3Z],
      [p3X, TABLE_TOP_Y + 0.035, p3Z],
      [p3X, TABLE_TOP_Y + 0.055, p3Z],
      [p3X, TABLE_TOP_Y + 0.08, p3Z],
    ]),
    (t) => (t < 0.35 ? 0.025 : t < 0.65 ? 0.013 : 0.019),
    { bone: root, color: CLEAR_GLASS },
  );
  const anemoFluid = b.part(new THREE.SphereGeometry(0.02, 10, 8), GLOW_ANEMO, {
    bone: root,
    at: [p3X, TABLE_TOP_Y + 0.028, p3Z],
  });
  glow(anemoFluid, 2.0);

  // Top Shelf Brass Test Tube Rack
  const TUBE_RACK_X = 0.24;
  const tubeRackZ = HUTCH_Z + 0.02;
  const tubeRackY = TOP_SHELF_Y + 0.012;
  b.part(new THREE.BoxGeometry(0.18, 0.008, 0.045), BRASS_PAINT, {
    bone: root,
    at: [TUBE_RACK_X, tubeRackY + 0.045, tubeRackZ],
  });
  b.part(new THREE.BoxGeometry(0.18, 0.008, 0.045), BRASS_PAINT, {
    bone: root,
    at: [TUBE_RACK_X, tubeRackY, tubeRackZ],
  });
  const tubeGlows = [GLOW_ANEMO, GLOW_PYRO, GLOW_ELECTRO, GLOW_DENDRO, GLOW_GEO];
  for (let tIdx = 0; tIdx < 5; tIdx++) {
    const tx = TUBE_RACK_X - 0.064 + tIdx * 0.032;
    b.part(new THREE.CylinderGeometry(0.0075, 0.0075, 0.062, 8), CLEAR_GLASS, {
      bone: root,
      at: [tx, tubeRackY + 0.036, tubeRackZ],
    });
    const tGlow = b.part(new THREE.CylinderGeometry(0.0055, 0.0055, 0.042, 6), tubeGlows[tIdx], {
      bone: root,
      at: [tx, tubeRackY + 0.024, tubeRackZ],
    });
    glow(tGlow, 2.0);
    b.part(new THREE.CylinderGeometry(0.0065, 0.0055, 0.009, 6), LEATHER_BROWN, {
      bone: root,
      at: [tx, tubeRackY + 0.07, tubeRackZ],
    });
  }

  // Row of 3 Amber Glass Apothecary Jars on top shelf
  const jarStartX = -0.26;
  for (let j = 0; j < 3; j++) {
    const jx = jarStartX + j * 0.075;
    b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.058, 10), AMBER_GLASS, {
      bone: root,
      at: [jx, TOP_SHELF_Y + 0.042, tubeRackZ],
    });
    b.part(new THREE.CylinderGeometry(0.019, 0.017, 0.015, 8), LEATHER_BROWN, {
      bone: root,
      at: [jx, TOP_SHELF_Y + 0.075, tubeRackZ],
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // 12. HERBS, MORTAR & PESTLE, BOTANICAL SPECIMENS
  // -------------------------------------------------------------------------------------------------------------
  const MORTAR_X = -0.38;
  const MORTAR_Z = 0.20;
  const mortarY = TABLE_TOP_Y + 0.024;

  b.part(new THREE.CylinderGeometry(0.048, 0.03, 0.046, 14), WHITE_MARBLE, {
    bone: root,
    at: [MORTAR_X, mortarY, MORTAR_Z],
  });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.008, 14), GOLD, {
    bone: root,
    at: [MORTAR_X, mortarY + 0.023, MORTAR_Z],
  });
  const herbPaste = b.part(new THREE.CylinderGeometry(0.035, 0.022, 0.012, 10), GLOW_DENDRO, {
    bone: root,
    at: [MORTAR_X, mortarY + 0.009, MORTAR_Z],
  });
  glow(herbPaste, 2.0);
  b.part(new THREE.CylinderGeometry(0.009, 0.015, 0.078, 8), WHITE_MARBLE, {
    bone: root,
    at: [MORTAR_X + 0.018, mortarY + 0.03, MORTAR_Z + 0.012],
    dir: [0.4, 0.85, 0.2],
  });

  // Loose herb leaves on desk
  for (let l = 0; l < 4; l++) {
    const lx = MORTAR_X + 0.048 + (l % 2) * 0.025;
    const lz = MORTAR_Z + (l > 1 ? 0.03 : -0.018);
    b.part(new THREE.PlaneGeometry(0.02, 0.012), "#387834", {
      bone: root,
      at: [lx, TABLE_TOP_Y + 0.002, lz],
      dir: [0, 1, 0],
      axis: "z",
      rotation: [0, l * 45, 0],
    });
  }

  // Potted Alchemical Flora on top shelf (left)
  const POT_X = -0.52;
  const potZ = HUTCH_Z + 0.03;
  const potY = TOP_SHELF_Y + 0.032;
  b.part(new THREE.CylinderGeometry(0.038, 0.026, 0.052, 12), "#ba683a", {
    bone: root,
    at: [POT_X, potY, potZ],
  });
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.008, 12), GOLD, {
    bone: root,
    at: [POT_X, potY + 0.026, potZ],
  });
  b.sweep(
    catmull([
      [POT_X, potY + 0.026, potZ],
      [POT_X - 0.01, potY + 0.068, potZ + 0.01],
      [POT_X + 0.01, potY + 0.115, potZ - 0.005],
    ]),
    0.0045,
    { bone: root, color: "#366a30" },
  );
  const flowerCore = b.part(new THREE.SphereGeometry(0.014, 8, 8), GLOW_ANEMO, {
    bone: root,
    at: [POT_X + 0.01, potY + 0.12, potZ - 0.005],
  });
  glow(flowerCore, 2.0);
  for (let p = 0; p < 5; p++) {
    const pa = p * ((Math.PI * 2) / 5);
    const px = POT_X + 0.01 + Math.cos(pa) * 0.024;
    const pz = potZ - 0.005 + Math.sin(pa) * 0.024;
    b.part(new THREE.ConeGeometry(0.009, 0.026, 4), "#daf8f0", {
      bone: root,
      at: [px, potY + 0.12, pz],
      dir: [Math.cos(pa), 0.2, Math.sin(pa)],
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // 13. CELESTIAL ASTROLABE / ARMILLARY SPHERE (Mid-shelf central alcove)
  // -------------------------------------------------------------------------------------------------------------
  const ASTRO_X = 0;
  const ASTRO_Z = HUTCH_Z + 0.03;
  const ASTRO_BASE_Y = MID_SHELF_Y + 0.012;

  b.part(new THREE.CylinderGeometry(0.044, 0.054, 0.016, 14), BRASS_PAINT, {
    bone: root,
    at: [ASTRO_X, ASTRO_BASE_Y + 0.008, ASTRO_Z],
  });
  b.part(new THREE.CylinderGeometry(0.013, 0.019, 0.058, 8), GOLD, {
    bone: root,
    at: [ASTRO_X, ASTRO_BASE_Y + 0.044, ASTRO_Z],
  });

  const ASTRO_C_Y = ASTRO_BASE_Y + 0.118;
  const RING_R = 0.072;
  // Meridian vertical ring
  b.part(new THREE.TorusGeometry(RING_R, 0.005, 6, 24), GOLD_PAINT, {
    bone: root,
    at: [ASTRO_X, ASTRO_C_Y, ASTRO_Z],
    dir: [1, 0, 0],
    axis: "z",
  });
  // Equator horizontal ring
  b.part(new THREE.TorusGeometry(RING_R, 0.005, 6, 24), GOLD_PAINT, {
    bone: root,
    at: [ASTRO_X, ASTRO_C_Y, ASTRO_Z],
    dir: [0, 1, 0],
    axis: "z",
  });
  // Inclined Ecliptic band
  b.part(new THREE.TorusGeometry(RING_R - 0.008, 0.0055, 6, 24), BRASS_PAINT, {
    bone: root,
    at: [ASTRO_X, ASTRO_C_Y, ASTRO_Z],
    dir: [0.35, 0.85, 0.2],
    axis: "z",
  });
  const astroCore = b.part(new THREE.SphereGeometry(0.022, 10, 8), GLOW_STARLIGHT, {
    bone: root,
    at: [ASTRO_X, ASTRO_C_Y, ASTRO_Z],
  });
  glow(astroCore, 2.2);

  // -------------------------------------------------------------------------------------------------------------
  // 14. SCHOLAR'S DESK ACCESSORIES (Hourglass, Inkwell & Quill, Rolled Scrolls)
  // -------------------------------------------------------------------------------------------------------------
  // Hourglass on tabletop
  const HG_X = -0.32;
  const HG_Z = 0.08;
  const HG_Y = TABLE_TOP_Y;
  b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.006, 10), GOLD, {
    bone: root,
    at: [HG_X, HG_Y + 0.003, HG_Z],
  });
  b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.006, 10), GOLD, {
    bone: root,
    at: [HG_X, HG_Y + 0.078, HG_Z],
  });
  for (let p = 0; p < 3; p++) {
    const pa = p * ((Math.PI * 2) / 3);
    const px = HG_X + Math.cos(pa) * 0.021;
    const pz = HG_Z + Math.sin(pa) * 0.021;
    b.part(new THREE.CylinderGeometry(0.0025, 0.0025, 0.075, 6), BRASS_PAINT, {
      bone: root,
      at: [px, HG_Y + 0.04, pz],
    });
  }
  b.part(new THREE.ConeGeometry(0.022, 0.035, 10), CLEAR_GLASS, {
    bone: root,
    at: [HG_X, HG_Y + 0.024, HG_Z],
    dir: [0, 1, 0],
  });
  b.part(new THREE.ConeGeometry(0.022, 0.035, 10), CLEAR_GLASS, {
    bone: root,
    at: [HG_X, HG_Y + 0.058, HG_Z],
    dir: [0, -1, 0],
  });
  const sand = b.part(new THREE.ConeGeometry(0.016, 0.02, 8), GLOW_STARLIGHT, {
    bone: root,
    at: [HG_X, HG_Y + 0.016, HG_Z],
    dir: [0, 1, 0],
  });
  glow(sand, 1.8);

  // Faceted Glass Inkwell & Feather Quill
  const INK_X = 0.16;
  const INK_Z = 0.06;
  b.part(new THREE.CylinderGeometry(0.02, 0.026, 0.032, 6), IRON_BLACK, {
    bone: root,
    at: [INK_X, TABLE_TOP_Y + 0.016, INK_Z],
  });
  b.part(new THREE.CylinderGeometry(0.015, 0.015, 0.008, 8), GOLD, {
    bone: root,
    at: [INK_X, TABLE_TOP_Y + 0.032, INK_Z],
  });
  b.sweep(
    catmull([
      [INK_X, TABLE_TOP_Y + 0.025, INK_Z],
      [INK_X + 0.03, TABLE_TOP_Y + 0.11, INK_Z - 0.02],
      [INK_X + 0.05, TABLE_TOP_Y + 0.19, INK_Z - 0.04],
      [INK_X + 0.06, TABLE_TOP_Y + 0.24, INK_Z - 0.05],
    ]),
    (t) => (t < 0.15 ? 0.002 : 0.018 * Math.sin(t * Math.PI)),
    { bone: root, color: "#f8f5eb" },
  );

  // Rolled Parchment Scrolls on cubby and desk
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.18, 10), WARM_PARCHMENT, {
    bone: root,
    at: [CUBBY_X + 0.06, TABLE_TOP_Y + 0.09, HUTCH_Z],
    dir: [0, 0, 1],
  });
  b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.19, 10), WARM_PARCHMENT, {
    bone: root,
    at: [CUBBY_X + 0.06, TABLE_TOP_Y + 0.035, HUTCH_Z + 0.01],
    dir: [0, 0, 1],
  });
  b.part(new THREE.CylinderGeometry(0.019, 0.019, 0.018, 10), LEATHER_BURGUNDY, {
    bone: root,
    at: [CUBBY_X + 0.06, TABLE_TOP_Y + 0.09, HUTCH_Z + 0.02],
    dir: [0, 0, 1],
  });
  b.part(new THREE.SphereGeometry(0.006, 6, 6), CORAL_WAX, {
    bone: root,
    at: [CUBBY_X + 0.06, TABLE_TOP_Y + 0.108, HUTCH_Z + 0.02],
  });

  b.part(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 10), WARM_PARCHMENT, {
    bone: root,
    at: [-0.02, TABLE_TOP_Y + 0.015, 0.31],
    dir: [1, 0, -0.2],
  });
  b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.02, 10), GOLD, {
    bone: root,
    at: [-0.02, TABLE_TOP_Y + 0.015, 0.31],
    dir: [1, 0, -0.2],
  });

  // -------------------------------------------------------------------------------------------------------------
  // 15. LOWER SHELF & SURROUNDING ACCESSORIES (Carboy, Wooden Chest, Blueprint Canister)
  // -------------------------------------------------------------------------------------------------------------
  // Large Glass Demi-John / Acid Carboy on lower shelf
  const CARBOY_X = 0.44;
  const CARBOY_Z = TABLE_Z;
  const carboyBaseY = SHELF_LOW_Y + 0.013;

  b.part(new THREE.CylinderGeometry(0.098, 0.082, 0.08, 14), DARK_BRASS, {
    bone: root,
    at: [CARBOY_X, carboyBaseY + 0.04, CARBOY_Z],
  });
  b.part(new THREE.SphereGeometry(0.092, 14, 12), CLEAR_GLASS, {
    bone: root,
    at: [CARBOY_X, carboyBaseY + 0.12, CARBOY_Z],
  });
  const carboyFluid = b.part(new THREE.SphereGeometry(0.084, 12, 10), GLOW_ANEMO, {
    bone: root,
    at: [CARBOY_X, carboyBaseY + 0.11, CARBOY_Z],
  });
  glow(carboyFluid, 1.8);
  b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.05, 10), CLEAR_GLASS, {
    bone: root,
    at: [CARBOY_X, carboyBaseY + 0.21, CARBOY_Z],
  });
  b.part(new THREE.CylinderGeometry(0.022, 0.018, 0.028, 8), LEATHER_BROWN, {
    bone: root,
    at: [CARBOY_X, carboyBaseY + 0.245, CARBOY_Z],
  });

  // Oak Ingredient Chest on lower shelf
  const CHEST_X = -0.38;
  const CHEST_Z = TABLE_Z + 0.02;
  const chestBaseY = SHELF_LOW_Y + 0.013;
  const CHEST_W = 0.28;
  const CHEST_H = 0.15;
  const CHEST_D = 0.19;

  b.part(new THREE.BoxGeometry(CHEST_W, CHEST_H, CHEST_D), WOOD_DARK, {
    bone: root,
    at: [CHEST_X, chestBaseY + CHEST_H / 2, CHEST_Z],
  });
  b.part(new THREE.CylinderGeometry(CHEST_D / 2, CHEST_D / 2, CHEST_W, 12, 1, false, 0, Math.PI), WOOD_LIGHT, {
    bone: root,
    at: [CHEST_X, chestBaseY + CHEST_H, CHEST_Z],
    dir: [1, 0, 0],
    rotation: [0, 0, -90],
  });
  b.part(new THREE.BoxGeometry(0.034, 0.048, 0.01), GOLD, {
    bone: root,
    at: [CHEST_X, chestBaseY + CHEST_H * 0.75, CHEST_Z + CHEST_D / 2 + 0.006],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.018, CHEST_H, 0.01), BRASS_PAINT, {
      bone: root,
      at: [CHEST_X + s * (CHEST_W / 2 - 0.02), chestBaseY + CHEST_H / 2, CHEST_Z + CHEST_D / 2 + 0.005],
    });
  }

  // Cylindrical Brass Map & Blueprint Canister standing firmly on dais floor
  const CANISTER_X = 0.88;
  const CANISTER_Z = 0.08;
  const canBaseY = DAIS_H; // y = 0.05
  b.part(new THREE.CylinderGeometry(0.068, 0.078, 0.28, 14), BRASS_PAINT, {
    bone: root,
    at: [CANISTER_X, canBaseY + 0.14, CANISTER_Z],
  });
  b.part(new THREE.CylinderGeometry(0.072, 0.072, 0.012, 14), GOLD, {
    bone: root,
    at: [CANISTER_X, canBaseY + 0.275, CANISTER_Z],
  });
  // Grounded blueprints and maps leaning out of the canister
  for (let sIdx = 0; sIdx < 3; sIdx++) {
    const sAng = sIdx * 2.1;
    const sx = CANISTER_X + Math.cos(sAng) * 0.022;
    const sz = CANISTER_Z + Math.sin(sAng) * 0.022;
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.38, 8), WARM_PARCHMENT, {
      bone: root,
      at: [sx, canBaseY + 0.21, sz],
      dir: [Math.cos(sAng) * 0.18, 0.95, Math.sin(sAng) * 0.18],
    });
  }

  return b.root;
}
