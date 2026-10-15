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
  const rand = rng(77);

  // -------------------------------------------------------------------------------------------------------------
  // PALETTE & PAINTS (Genshin Impact Fantasy Scholar Aesthetic)
  // -------------------------------------------------------------------------------------------------------------
  const WOOD_DESK = grain("#6e3820", "#4c2312", { size: 0.06, seed: 1 });
  const WOOD_LIGHT = grain("#944f2d", "#6a341a", { size: 0.05, seed: 2 });
  const WOOD_DARK = grain("#38170c", "#220c06", { size: 0.06, seed: 3 });
  const STONE_BASE = mottle("#252834", "#161822", { size: 0.14, contrast: 1.2, seed: 5 });

  const GOLD_PAINT = metal("gilt", { polish: 0.7, tarnish: 0.1 });
  const BRASS_PAINT = metal("brass", { polish: 0.5, tarnish: 0.2 });

  // Flat colors for geometry and glowing magical items
  const GOLD = "#f6d15a";
  const BRASS = "#dfa944";
  const DARK_BRASS = "#8a611c";
  const IRON_BLACK = "#1c1b24";
  const WHITE_MARBLE = "#eeebe3";
  const WARM_PARCHMENT = "#f7efd8";
  const LEATHER_NAVY = "#172338";
  const LEATHER_BURGUNDY = "#501520";
  const LEATHER_EMERALD = "#163c26";
  const LEATHER_BROWN = "#5c331a";
  const CORAL_WAX = "#d23636";
  const CLEAR_GLASS = "#d6f7f9";
  const AMBER_GLASS = "#d4a758";

  // Glowing elemental fluids & magical components
  const GLOW_ANEMO = "#2bf5db";
  const GLOW_PYRO = "#ff452b";
  const GLOW_ELECTRO = "#bf48ff";
  const GLOW_DENDRO = "#3df574";
  const GLOW_GEO = "#ffa929";
  const GLOW_STARLIGHT = "#fff188";
  const GLOW_FLAME_BLUE = "#529aff";

  // -------------------------------------------------------------------------------------------------------------
  // SVG TEXTURES (Grimoires, Alchemy Transmutation Circle, Bottle Labels, Herbs)
  // -------------------------------------------------------------------------------------------------------------

  // 1. Alchemical Transmutation Circle on Stone Floor
  const transCircleSvg = svg(
    `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <circle cx="256" cy="256" r="246" fill="none" stroke="#f0ca56" stroke-width="4.5"/>
      <circle cx="256" cy="256" r="234" fill="none" stroke="#d8a72c" stroke-width="1.8"/>
      <circle cx="256" cy="256" r="216" fill="none" stroke="#f0ca56" stroke-width="2.5" stroke-dasharray="8 6"/>
      <!-- 8-Pointed Star -->
      <polygon points="256,42 278,198 434,220 278,242 256,398 234,242 78,220 234,198" fill="none" stroke="#fce586" stroke-width="3"/>
      <polygon points="105,105 210,210 256,70 302,210 407,105 302,256 407,407 256,302 105,407 210,256" fill="none" stroke="#e8bd3e" stroke-width="2"/>
      <!-- Inner Geometric Rings and Glyphs -->
      <circle cx="256" cy="256" r="142" fill="none" stroke="#f0ca56" stroke-width="3"/>
      <circle cx="256" cy="256" r="95" fill="none" stroke="#ffd96b" stroke-width="2"/>
      <polygon points="256,161 338,303 174,303" fill="none" stroke="#f0ca56" stroke-width="2.2"/>
      <polygon points="256,351 174,209 338,209" fill="none" stroke="#f0ca56" stroke-width="2.2"/>
      <!-- Four-pointed Primogem Core -->
      <polygon points="256,206 270,256 256,306 242,256" fill="#fff4a4" stroke="#dfaa2c" stroke-width="1.5"/>
      <polygon points="206,256 256,270 306,256 256,242" fill="#fff4a4" stroke="#dfaa2c" stroke-width="1.5"/>
    </svg>`,
    { size: 512 },
  );

  // 2. Open Grimoire Illustrated Pages Spread
  const openBookSpreadSvg = svg(
    `<svg viewBox="0 0 512 360" xmlns="http://www.w3.org/2000/svg">
      <!-- Left Page: Distillation & Arcane Geometry -->
      <rect x="0" y="0" width="256" height="360" fill="#f8f1de"/>
      <rect x="18" y="16" width="220" height="328" fill="none" stroke="#8e6c3a" stroke-width="1.8"/>
      <rect x="22" y="20" width="212" height="320" fill="none" stroke="#a4844c" stroke-width="0.8"/>
      <text x="128" y="44" font-family="serif" font-size="14" font-weight="bold" fill="#3a2210" text-anchor="middle">DE TRANSMUTATIONE</text>
      <!-- Diagram: Alembic Apparatus -->
      <circle cx="128" cy="116" r="38" fill="none" stroke="#6f4820" stroke-width="1.8"/>
      <ellipse cx="128" cy="116" rx="28" ry="12" fill="none" stroke="#a4753a" stroke-width="1.2"/>
      <path d="M 128 78 Q 155 70 172 105 T 184 150" fill="none" stroke="#6f4820" stroke-width="2"/>
      <circle cx="184" cy="158" r="14" fill="none" stroke="#6f4820" stroke-width="1.5"/>
      <!-- Latin Text lines -->
      <g stroke="#4f331a" stroke-width="1.8" stroke-linecap="round">
        <line x1="32" y1="178" x2="224" y2="178"/>
        <line x1="32" y1="192" x2="224" y2="192"/>
        <line x1="32" y1="206" x2="210" y2="206"/>
        <line x1="32" y1="220" x2="224" y2="220"/>
        <line x1="32" y1="234" x2="195" y2="234"/>
      </g>
      <!-- Arcane seal at bottom left -->
      <circle cx="80" cy="286" r="26" fill="none" stroke="#96672e" stroke-width="1.5"/>
      <polygon points="80,264 98,300 62,300" fill="none" stroke="#96672e" stroke-width="1"/>
      <polygon points="80,308 62,272 98,272" fill="none" stroke="#96672e" stroke-width="1"/>
      <g stroke="#5c3a1a" stroke-width="1.6" stroke-linecap="round">
        <line x1="120" y1="270" x2="224" y2="270"/>
        <line x1="120" y1="284" x2="218" y2="284"/>
        <line x1="120" y1="298" x2="224" y2="298"/>
        <line x1="120" y1="312" x2="180" y2="312"/>
      </g>

      <!-- Page Fold Shadow -->
      <rect x="250" y="0" width="12" height="360" fill="#301808" opacity="0.22"/>

      <!-- Right Page: Botanical Alchemy & Sacred Sigil -->
      <rect x="256" y="0" width="256" height="360" fill="#f8f3e2"/>
      <rect x="274" y="16" width="220" height="328" fill="none" stroke="#8e6c3a" stroke-width="1.8"/>
      <rect x="278" y="20" width="212" height="320" fill="none" stroke="#a4844c" stroke-width="0.8"/>
      <text x="384" y="44" font-family="serif" font-size="14" font-weight="bold" fill="#3a2210" text-anchor="middle">FLORA ARCANUM</text>
      <!-- Botanical Sketch: Magic Flower with Roots -->
      <path d="M 384 140 Q 386 110 384 80" fill="none" stroke="#2d5225" stroke-width="2.5"/>
      <ellipse cx="384" cy="74" rx="7" ry="14" fill="#a8e6cf" stroke="#2d6c38" stroke-width="1.2"/>
      <ellipse cx="372" cy="78" rx="12" ry="7" fill="#cbf3d2" stroke="#2d6c38" stroke-width="1.2" transform="rotate(-30 372 78)"/>
      <ellipse cx="396" cy="78" rx="12" ry="7" fill="#cbf3d2" stroke="#2d6c38" stroke-width="1.2" transform="rotate(30 396 78)"/>
      <circle cx="384" cy="78" r="5" fill="#fce068"/>
      <!-- Roots -->
      <path d="M 384 140 Q 370 152 362 165 M 384 140 Q 394 154 404 162" fill="none" stroke="#5c3f1e" stroke-width="1.5"/>
      <!-- Star circle seal right -->
      <circle cx="384" cy="240" r="42" fill="none" stroke="#b28236" stroke-width="1.8"/>
      <circle cx="384" cy="240" r="34" fill="none" stroke="#d6a246" stroke-width="1" stroke-dasharray="4 3"/>
      <polygon points="384,204 408,240 384,276 360,240" fill="none" stroke="#9e6a22" stroke-width="1.5"/>
      <polygon points="360,216 408,216 384,264" fill="none" stroke="#9e6a22" stroke-width="1.5"/>
      <g stroke="#4f331a" stroke-width="1.8" stroke-linecap="round">
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
      <rect width="256" height="360" fill="#172338"/>
      <rect x="14" y="14" width="228" height="332" fill="none" stroke="#e2b446" stroke-width="3"/>
      <rect x="22" y="22" width="212" height="316" fill="none" stroke="#f2d274" stroke-width="1"/>
      <path d="M 22 50 L 50 22 M 234 50 L 206 22 M 22 310 L 50 338 M 234 310 L 206 338" stroke="#e2b446" stroke-width="2.5"/>
      <circle cx="128" cy="180" r="64" fill="none" stroke="#e2b446" stroke-width="2"/>
      <circle cx="128" cy="180" r="54" fill="none" stroke="#f4da82" stroke-width="1" stroke-dasharray="5 4"/>
      <polygon points="128,124 142,174 192,180 142,186 128,236 114,186 64,180 114,174" fill="#fae69c" stroke="#c6962d" stroke-width="2"/>
      <path d="M 128 135 A 15 15 0 0 0 128 165 A 11 11 0 0 1 128 135" fill="#f8dc80"/>
      <path d="M 128 225 A 15 15 0 0 0 128 195 A 11 11 0 0 1 128 225" fill="#f8dc80"/>
    </svg>`,
    { size: 256 },
  );

  const bookCoverBurgundySvg = svg(
    `<svg viewBox="0 0 256 360" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="360" fill="#48151d"/>
      <rect x="14" y="14" width="228" height="332" fill="none" stroke="#e8ba4f" stroke-width="3"/>
      <polygon points="128,100 188,204 68,204" fill="none" stroke="#f6d77a" stroke-width="2.5"/>
      <polygon points="128,240 68,136 188,136" fill="none" stroke="#f6d77a" stroke-width="2.5"/>
      <circle cx="128" cy="170" r="48" fill="none" stroke="#e8ba4f" stroke-width="2"/>
      <circle cx="128" cy="170" r="14" fill="#fce894"/>
    </svg>`,
    { size: 256 },
  );

  // 4. Potion Bottle Label Decal
  const potionLabelSvg = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="16" width="112" height="96" rx="10" fill="#fbf5e2" stroke="#b28534" stroke-width="3.5"/>
      <rect x="14" y="22" width="100" height="84" rx="6" fill="none" stroke="#8a5f1b" stroke-width="1.2"/>
      <circle cx="64" cy="54" r="22" fill="none" stroke="#b28534" stroke-width="2"/>
      <polygon points="64,36 71,50 86,54 71,58 64,72 57,58 42,54 57,50" fill="#dea040"/>
      <text x="64" y="94" font-family="serif" font-size="11" font-weight="bold" fill="#3a220e" text-anchor="middle">ELIXIR</text>
    </svg>`,
    { size: 128 },
  );

  // 5. Dried Hanging Herb Sprig Cards
  const herbSprigSvg = svg(
    `<svg viewBox="0 0 128 256" xmlns="http://www.w3.org/2000/svg">
      <rect x="52" y="10" width="24" height="14" rx="2" fill="#8e6638"/>
      <path d="M 64 24 Q 61 90 64 160 T 62 245" fill="none" stroke="#4c3d24" stroke-width="3" stroke-linecap="round"/>
      <g stroke="#34542e" stroke-width="2" fill="#547a4a" stroke-linecap="round">
        <path d="M 64 60 Q 42 75 32 68 Q 44 58 64 60 Z"/>
        <path d="M 64 78 Q 88 92 98 84 Q 84 75 64 78 Z"/>
        <path d="M 64 105 Q 38 120 26 112 Q 40 102 64 105 Z"/>
        <path d="M 64 125 Q 92 140 102 130 Q 86 122 64 125 Z"/>
        <path d="M 64 155 Q 42 170 30 162 Q 46 150 64 155 Z"/>
        <path d="M 64 180 Q 85 195 94 186 Q 80 176 64 180 Z"/>
      </g>
      <g fill="#9687c7">
        <circle cx="30" cy="66" r="4.5"/>
        <circle cx="100" cy="82" r="5"/>
        <circle cx="24" cy="110" r="5.5"/>
        <circle cx="104" cy="128" r="5"/>
        <circle cx="28" cy="160" r="4.5"/>
        <circle cx="96" cy="184" r="5"/>
        <circle cx="62" cy="246" r="4"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  // 6. Glowing Small Lamp Grass Herb Card
  const lampGrassSvg = svg(
    `<svg viewBox="0 0 128 256" xmlns="http://www.w3.org/2000/svg">
      <rect x="52" y="10" width="24" height="14" rx="2" fill="#8e6638"/>
      <path d="M 64 24 Q 58 100 64 180 T 60 245" fill="none" stroke="#2a4522" stroke-width="3" stroke-linecap="round"/>
      <g stroke="#245028" stroke-width="2" fill="#387440" stroke-linecap="round">
        <path d="M 64 70 Q 40 85 30 76 Q 44 66 64 70 Z"/>
        <path d="M 64 110 Q 90 125 100 115 Q 85 106 64 110 Z"/>
        <path d="M 64 150 Q 38 165 28 156 Q 42 146 64 150 Z"/>
      </g>
      <!-- Glowing Blue Lamp Bell Flower Heads -->
      <g fill="#42e3ff" stroke="#1685a8" stroke-width="1.5">
        <ellipse cx="32" cy="86" rx="9" ry="12"/>
        <ellipse cx="98" cy="125" rx="10" ry="13"/>
        <ellipse cx="30" cy="166" rx="9" ry="12"/>
        <ellipse cx="62" cy="242" rx="11" ry="15"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  // -------------------------------------------------------------------------------------------------------------
  // 1. FLOOR DAIS / STAGED ALCHEMY BASE (y = 0.00 to 0.05)
  // -------------------------------------------------------------------------------------------------------------
  const DAIS_R = 1.28;
  const DAIS_H = 0.05;

  // Main stepped circular stone dais standing firmly on y = 0
  b.part(new THREE.CylinderGeometry(DAIS_R, DAIS_R + 0.04, DAIS_H, 24), STONE_BASE, {
    bone: root,
    at: [0, DAIS_H / 2, 0],
  });

  // Solid horizontal brass perimeter stepped rim at y = 0.045 to 0.052
  b.part(new THREE.CylinderGeometry(DAIS_R - 0.015, DAIS_R + 0.005, 0.014, 24), BRASS_PAINT, {
    bone: root,
    at: [0, DAIS_H - 0.002, 0],
  });
  b.part(new THREE.CylinderGeometry(DAIS_R - 0.025, DAIS_R - 0.025, 0.016, 24), GOLD, {
    bone: root,
    at: [0, DAIS_H, 0],
  });

  // Alchemical Transmutation Circle floor decal (rests 1.5mm above stone)
  b.part(new THREE.PlaneGeometry(1.96, 1.96), "#ffffff", {
    bone: root,
    at: [0, DAIS_H + 0.0015, 0],
    dir: [0, 1, 0],
    axis: "z",
    texture: transCircleSvg,
  });

  // -------------------------------------------------------------------------------------------------------------
  // 2. THE ALCHEMIST'S WORKBENCH (Tabletop, turned legs, stretchers, drawers)
  // -------------------------------------------------------------------------------------------------------------
  const TABLE_W = 1.52;
  const TABLE_D = 0.74;
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

  // Turned desk legs: solid, continuous geometry from floor dais (y = 0.05) to tabletop (y = 0.775)
  const legX = 0.65;
  const legZ_front = TABLE_Z + TABLE_D / 2 - 0.07;
  const legZ_back = TABLE_Z - TABLE_D / 2 + 0.07;

  function buildTurnedLeg(lx: number, lz: number) {
    // 1. Brass Sabot foot at floor dais (y: 0.05 to 0.13)
    b.part(new THREE.CylinderGeometry(0.038, 0.046, 0.08, 12), BRASS_PAINT, {
      bone: root,
      at: [lx, 0.09, lz],
    });
    // Gold collar ring
    b.part(new THREE.CylinderGeometry(0.046, 0.046, 0.016, 12), GOLD, {
      bone: root,
      at: [lx, 0.13, lz],
    });
    // Ankle spool connecting foot to junction block (y: 0.13 to 0.185)
    b.part(new THREE.CylinderGeometry(0.034, 0.038, 0.06, 12), WOOD_DARK, {
      bone: root,
      at: [lx, 0.16, lz],
    });

    // 2. Lower square junction block (y: 0.175 to 0.265)
    b.part(new THREE.BoxGeometry(0.076, 0.09, 0.076), WOOD_DARK, {
      bone: root,
      at: [lx, 0.22, lz],
    });

    // 3. Main turned baluster column (y: 0.265 to 0.675)
    // Urn neck base
    b.part(new THREE.CylinderGeometry(0.038, 0.034, 0.04, 12), WOOD_DESK, {
      bone: root,
      at: [lx, 0.28, lz],
    });
    // Bulbous urn sphere
    b.part(new THREE.SphereGeometry(0.05, 12, 10), WOOD_DESK, {
      bone: root,
      at: [lx, 0.35, lz],
      scale: [1, 1.2, 1],
    });
    // Brass accent ring
    b.part(new THREE.CylinderGeometry(0.046, 0.046, 0.014, 12), BRASS_PAINT, {
      bone: root,
      at: [lx, 0.405, lz],
    });
    // Slender tapered fluted shaft
    b.part(new THREE.CylinderGeometry(0.032, 0.042, 0.22, 12), WOOD_DESK, {
      bone: root,
      at: [lx, 0.52, lz],
    });
    // Upper flared collar
    b.part(new THREE.CylinderGeometry(0.046, 0.032, 0.05, 12), WOOD_LIGHT, {
      bone: root,
      at: [lx, 0.65, lz],
    });

    // 4. Upper capital block supporting tabletop (y: 0.67 to 0.78)
    b.part(new THREE.BoxGeometry(0.08, 0.11, 0.08), WOOD_DARK, {
      bone: root,
      at: [lx, 0.725, lz],
    });
    // Gold rosette ornament on outer face of upper leg
    b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.008, 8), GOLD, {
      bone: root,
      at: [lx + Math.sign(lx) * 0.042, 0.725, lz],
      dir: [Math.sign(lx), 0, 0],
    });
  }

  buildTurnedLeg(legX, legZ_front);
  buildTurnedLeg(-legX, legZ_front);
  buildTurnedLeg(legX, legZ_back);
  buildTurnedLeg(-legX, legZ_back);

  // Lower shelf platform (y = 0.22, securely embedded in junction blocks)
  const SHELF_LOW_W = 1.34;
  const SHELF_LOW_D = 0.56;
  const SHELF_LOW_Y = 0.22;
  b.part(new THREE.BoxGeometry(SHELF_LOW_W, 0.026, SHELF_LOW_D), WOOD_DARK, {
    bone: root,
    at: [0, SHELF_LOW_Y, TABLE_Z],
  });

  // Lower side stretchers
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.032, 0.045, legZ_front - legZ_back), WOOD_DARK, {
      bone: root,
      at: [s * legX, SHELF_LOW_Y, TABLE_Z],
    });
  }

  // Desk Apron (under tabletop y: 0.68 to 0.775)
  const APRON_Y = 0.725;
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.024, 0.08, TABLE_D - 0.14), WOOD_DESK, {
      bone: root,
      at: [s * (legX - 0.02), APRON_Y, TABLE_Z],
    });
  }
  b.part(new THREE.BoxGeometry(TABLE_W - 0.16, 0.08, 0.024), WOOD_DESK, {
    bone: root,
    at: [0, APRON_Y, legZ_back + 0.02],
  });

  // Front Apron with 3 drawers
  const frontApronZ = legZ_front - 0.02;
  const drawerW = 0.38;
  const drawerH = 0.065;
  for (let i = -1; i <= 1; i++) {
    const dx = i * 0.42;
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
  const HUTCH_W = 1.44;
  const MID_SHELF_Y = 1.16;
  const TOP_SHELF_Y = 1.48;

  // Vertical side panels with elegant Genshin baroque S-curve brackets
  for (const s of [1, -1]) {
    const hx = (s * HUTCH_W) / 2;
    b.part(new THREE.BoxGeometry(0.034, 0.72, 0.24), WOOD_DESK, {
      bone: root,
      at: [hx, 1.18, HUTCH_Z],
    });
    b.sweep(
      catmull([
        [hx, TABLE_TOP_Y, HUTCH_Z + 0.12],
        [hx, 0.98, HUTCH_Z + 0.14],
        [hx, 1.16, HUTCH_Z + 0.12],
        [hx, 1.34, HUTCH_Z + 0.13],
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

  // Wooden backboard paneling
  b.part(new THREE.BoxGeometry(HUTCH_W - 0.04, 0.68, 0.018), WOOD_DARK, {
    bone: root,
    at: [0, 1.16, HUTCH_Z - 0.11],
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
      [-0.45, TOP_SHELF_Y + 0.03, HUTCH_Z],
      [-0.22, TOP_SHELF_Y + 0.11, HUTCH_Z],
      [0, TOP_SHELF_Y + 0.14, HUTCH_Z],
      [0.22, TOP_SHELF_Y + 0.11, HUTCH_Z],
      [0.45, TOP_SHELF_Y + 0.03, HUTCH_Z],
    ]),
    0.018,
    { bone: root, color: WOOD_DESK },
  );
  b.part(new THREE.TorusGeometry(0.034, 0.007, 8, 16, Math.PI * 1.5), GOLD, {
    bone: root,
    at: [0, TOP_SHELF_Y + 0.13, HUTCH_Z + 0.01],
    dir: [0, 0, 1],
    axis: "z",
  });
  b.part(new THREE.SphereGeometry(0.015, 8, 8), GOLD, {
    bone: root,
    at: [0, TOP_SHELF_Y + 0.13, HUTCH_Z + 0.01],
  });

  // Top Shelf Brass Spindle Gallery Railing
  const RAIL_Y = TOP_SHELF_Y + 0.045;
  const railZ = HUTCH_Z + 0.09;
  b.part(new THREE.CylinderGeometry(0.005, 0.005, HUTCH_W - 0.08, 8), GOLD, {
    bone: root,
    at: [0, RAIL_Y, railZ],
    dir: [1, 0, 0],
  });
  for (let rx = -0.62; rx <= 0.62; rx += 0.08) {
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
    const my = TABLE_TOP_Y + 0.08 + m * 0.14;
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
  // Curved brass arm extending forward from left hutch pillar over desk
  const armStartX = -HUTCH_W / 2 + 0.02;
  const armStartY = MID_SHELF_Y - 0.04;
  const armZ = HUTCH_Z;
  b.sweep(
    catmull([
      [armStartX, armStartY, armZ],
      [armStartX + 0.05, armStartY + 0.03, armZ + 0.14],
      [-0.42, armStartY + 0.03, 0.08],
      [-0.15, armStartY + 0.03, 0.08],
    ]),
    0.006,
    { bone: root, color: GOLD_PAINT },
  );

  // 3 hanging herb bundles at prominent forward viewing positions
  const herbDrops = [
    { x: -0.42, z: 0.08, tex: lampGrassSvg, lamp: true },
    { x: -0.28, z: 0.08, tex: herbSprigSvg, lamp: false },
    { x: -0.15, z: 0.08, tex: lampGrassSvg, lamp: true },
  ];
  for (const h of herbDrops) {
    const hy = armStartY + 0.02;
    // Small brass hanging S-hook
    b.part(new THREE.TorusGeometry(0.008, 0.002, 4, 10, Math.PI * 1.5), GOLD, {
      bone: root,
      at: [h.x, hy, h.z],
      dir: [1, 0, 0],
      axis: "z",
    });
    // Twine bind cylinder
    b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.015, 6), LEATHER_BROWN, {
      bone: root,
      at: [h.x, hy - 0.012, h.z],
    });
    // Double cross cards for full 3D hanging volume
    const fCard = frame([h.x, hy - 0.02, h.z], [0, -1, 0]);
    const bundleCards = b.cards([fCard], h.tex, {
      size: [0.065, 0.13],
      cross: true,
      bone: root,
    });
    if (h.lamp) {
      glow(bundleCards, 1.4);
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // 5. BALANCING BRASS SCALES (Hero Alchemy Prop on right tabletop)
  // -------------------------------------------------------------------------------------------------------------
  const SCALE_X = 0.38;
  const SCALE_Z = 0.08;
  const SCALE_BASE_Y = TABLE_TOP_Y;

  // Solid stepped brass base resting directly on tabletop
  b.part(new THREE.CylinderGeometry(0.052, 0.065, 0.024, 14), BRASS_PAINT, {
    bone: root,
    at: [SCALE_X, SCALE_BASE_Y + 0.012, SCALE_Z],
  });
  b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.01, 14), GOLD, {
    bone: root,
    at: [SCALE_X, SCALE_BASE_Y + 0.02, SCALE_Z],
  });

  // Turned central brass pillar (spans y = 0.84 to 1.14)
  b.part(new THREE.CylinderGeometry(0.014, 0.022, 0.28, 10), GOLD_PAINT, {
    bone: root,
    at: [SCALE_X, SCALE_BASE_Y + 0.16, SCALE_Z],
  });
  b.part(new THREE.SphereGeometry(0.022, 10, 8), GOLD, {
    bone: root,
    at: [SCALE_X, SCALE_BASE_Y + 0.29, SCALE_Z],
  });

  // Fulcrum pivot housing with pointer needle & graduated degree arc
  const FULCRUM_Y = SCALE_BASE_Y + 0.31;
  b.part(new THREE.BoxGeometry(0.032, 0.032, 0.024), BRASS_PAINT, {
    bone: root,
    at: [SCALE_X, FULCRUM_Y, SCALE_Z],
  });
  b.part(new THREE.TorusGeometry(0.03, 0.004, 6, 14, Math.PI * 0.6), GOLD, {
    bone: root,
    at: [SCALE_X, FULCRUM_Y - 0.015, SCALE_Z + 0.013],
    dir: [0, 0, 1],
    axis: "z",
  });

  // Tilted balance beam (~3.5 deg tilt: left side heavier with glowing crystals)
  const BEAM_HALF_LEN = 0.17;
  const TILT_ANGLE = 3.5 * DEG;
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
    [0.004, 0.007, 0.004],
    { bone: root, color: GOLD_PAINT },
  );

  // Finial acorn on top of fulcrum
  b.part(new THREE.ConeGeometry(0.012, 0.03, 8), GOLD, {
    bone: root,
    at: [SCALE_X, FULCRUM_Y + 0.025, SCALE_Z],
    dir: [0, 1, 0],
  });

  // Left Scale Pan (Heavier side with glowing Cor Lapis / Electro crystal)
  const panLeftY = beamLeftY - 0.15;
  const PAN_R = 0.048;
  for (let a = 0; a < 3; a++) {
    const ang = a * ((Math.PI * 2) / 3);
    const px = beamLeftX + Math.cos(ang) * (PAN_R - 0.004);
    const pz = SCALE_Z + Math.sin(ang) * (PAN_R - 0.004);
    b.rod([beamLeftX, beamLeftY, SCALE_Z], [px, panLeftY + 0.004, pz], 0.002, GOLD, { bone: root });
  }
  b.part(new THREE.CylinderGeometry(PAN_R, PAN_R - 0.012, 0.01, 14), BRASS_PAINT, {
    bone: root,
    at: [beamLeftX, panLeftY, SCALE_Z],
  });
  // Glow Cor Lapis / Electro crystal cluster in left pan
  const crystalCluster = b.part(new THREE.ConeGeometry(0.018, 0.042, 6), GLOW_GEO, {
    bone: root,
    at: [beamLeftX, panLeftY + 0.02, SCALE_Z],
    dir: [0.2, 1, 0.1],
  });
  glow(crystalCluster, 1.8);
  const crystalSide = b.part(new THREE.ConeGeometry(0.012, 0.028, 5), GLOW_ELECTRO, {
    bone: root,
    at: [beamLeftX + 0.015, panLeftY + 0.014, SCALE_Z - 0.01],
    dir: [0.5, 0.8, -0.2],
  });
  glow(crystalSide, 2.0);

  // Right Scale Pan (Counterweights side)
  const panRightY = beamRightY - 0.15;
  for (let a = 0; a < 3; a++) {
    const ang = a * ((Math.PI * 2) / 3);
    const px = beamRightX + Math.cos(ang) * (PAN_R - 0.004);
    const pz = SCALE_Z + Math.sin(ang) * (PAN_R - 0.004);
    b.rod([beamRightX, beamRightY, SCALE_Z], [px, panRightY + 0.004, pz], 0.002, GOLD, { bone: root });
  }
  b.part(new THREE.CylinderGeometry(PAN_R, PAN_R - 0.012, 0.01, 14), BRASS_PAINT, {
    bone: root,
    at: [beamRightX, panRightY, SCALE_Z],
  });
  // Stacked cylindrical brass weights
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.018, 10), GOLD, {
    bone: root,
    at: [beamRightX - 0.01, panRightY + 0.012, SCALE_Z],
  });
  b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.014, 8), GOLD, {
    bone: root,
    at: [beamRightX + 0.014, panRightY + 0.01, SCALE_Z - 0.01],
  });
  b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.01, 8), GOLD, {
    bone: root,
    at: [beamRightX + 0.005, panRightY + 0.008, SCALE_Z + 0.015],
  });

  // -------------------------------------------------------------------------------------------------------------
  // 6. DISTILLATION RETORT & CONDENSER COIL (Right desk station)
  // -------------------------------------------------------------------------------------------------------------
  const RETORT_X = 0.60;
  const RETORT_Z = -0.06;

  // Brass tripod burner stand
  const TRIPOD_RING_Y = TABLE_TOP_Y + 0.11;
  const TRIPOD_R = 0.048;
  b.part(new THREE.CylinderGeometry(TRIPOD_R, TRIPOD_R, 0.01, 14), BRASS_PAINT, {
    bone: root,
    at: [RETORT_X, TRIPOD_RING_Y, RETORT_Z],
  });
  for (let i = 0; i < 3; i++) {
    const la = i * ((Math.PI * 2) / 3) + 0.4;
    const topX = RETORT_X + Math.cos(la) * TRIPOD_R;
    const topZ = RETORT_Z + Math.sin(la) * TRIPOD_R;
    const botX = RETORT_X + Math.cos(la) * (TRIPOD_R + 0.035);
    const botZ = RETORT_Z + Math.sin(la) * (TRIPOD_R + 0.035);
    b.sweep(
      catmull([
        [topX, TRIPOD_RING_Y, topZ],
        [(topX + botX) * 0.5 + 0.008, TRIPOD_RING_Y - 0.05, (topZ + botZ) * 0.5],
        [botX, TABLE_TOP_Y, botZ],
      ]),
      0.005,
      { bone: root, color: DARK_BRASS },
    );
  }

  // Little brass burner pot with glowing blue magic flame
  b.part(new THREE.CylinderGeometry(0.024, 0.02, 0.022, 10), BRASS_PAINT, {
    bone: root,
    at: [RETORT_X, TABLE_TOP_Y + 0.015, RETORT_Z],
  });
  const magicFlame = b.part(new THREE.ConeGeometry(0.015, 0.045, 8), GLOW_FLAME_BLUE, {
    bone: root,
    at: [RETORT_X, TABLE_TOP_Y + 0.048, RETORT_Z],
    dir: [0, 1, 0],
  });
  glow(magicFlame, 2.0);

  // Spherical glass boiler flask seated in the tripod ring
  const BOILER_Y = TRIPOD_RING_Y + 0.035;
  b.part(new THREE.SphereGeometry(0.046, 12, 10), CLEAR_GLASS, {
    bone: root,
    at: [RETORT_X, BOILER_Y, RETORT_Z],
  });
  const boilingPotion = b.part(new THREE.SphereGeometry(0.038, 10, 8), GLOW_GEO, {
    bone: root,
    at: [RETORT_X, BOILER_Y - 0.008, RETORT_Z],
  });
  glow(boilingPotion, 1.7);
  // Flask neck with brass collar
  b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.035, 10), CLEAR_GLASS, {
    bone: root,
    at: [RETORT_X, BOILER_Y + 0.05, RETORT_Z],
  });
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.008, 10), GOLD, {
    bone: root,
    at: [RETORT_X, BOILER_Y + 0.065, RETORT_Z],
  });

  // Distillation condenser coil apparatus leading to receiver flask
  const RECEIVER_X = 0.65;
  const RECEIVER_Z = 0.16;

  // Cooling jacket cylinder between retort and receiver
  const jacketTop: [number, number, number] = [0.63, TABLE_TOP_Y + 0.16, 0.04];
  const jacketBot: [number, number, number] = [RECEIVER_X, TABLE_TOP_Y + 0.075, RECEIVER_Z];
  b.rod(jacketTop, jacketBot, 0.016, CLEAR_GLASS, { bone: root });
  // Glowing blue vapor coil inside cooling jacket
  b.sweep(coil(jacketTop, jacketBot, 0.01, 4), 0.0028, { bone: root, color: GLOW_ANEMO });

  // Receiver Erlenmeyer flask collecting drops on table
  b.part(new THREE.ConeGeometry(0.042, 0.075, 12), CLEAR_GLASS, {
    bone: root,
    at: [RECEIVER_X, TABLE_TOP_Y + 0.038, RECEIVER_Z],
    dir: [0, 1, 0],
  });
  const distillate = b.part(new THREE.ConeGeometry(0.036, 0.04, 10), GLOW_ANEMO, {
    bone: root,
    at: [RECEIVER_X, TABLE_TOP_Y + 0.022, RECEIVER_Z],
    dir: [0, 1, 0],
  });
  glow(distillate, 1.9);

  // -------------------------------------------------------------------------------------------------------------
  // 7. THE GREAT OPEN GRIMOIRE ON SCHOLAR'S LECTERN (Centerpiece Hero Feature)
  // -------------------------------------------------------------------------------------------------------------
  const BOOK_X = -0.24;
  const BOOK_Z = 0.10;
  const LECTERN_ROT_Y = 12 * DEG;
  const LECTERN_TILT_X = 24 * DEG; // Tilted toward front so pages read clearly
  const BOOK_W = 0.30;
  const BOOK_H = 0.22;

  // Angled Scholar's Lectern / Cradle Stand
  const lecternBaseQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), LECTERN_ROT_Y);
  const lecternTiltQ = lecternBaseQ.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -LECTERN_TILT_X));

  // Wooden lectern wedge support resting on table
  b.part(new THREE.BoxGeometry(BOOK_W + 0.03, 0.03, BOOK_H * 0.7), WOOD_DARK, {
    bone: root,
    at: [BOOK_X, TABLE_TOP_Y + 0.018, BOOK_Z - 0.03],
    quat: lecternBaseQ,
  });
  // Retaining ledge at front of lectern
  b.part(new THREE.BoxGeometry(BOOK_W + 0.04, 0.025, 0.018), GOLD, {
    bone: root,
    at: [BOOK_X, TABLE_TOP_Y + 0.02, BOOK_Z + 0.08],
    quat: lecternBaseQ,
  });

  // Leather book covers tilted on the lectern
  const bookCenter = new THREE.Vector3(BOOK_X, TABLE_TOP_Y + 0.045, BOOK_Z);
  b.part(new THREE.BoxGeometry(BOOK_W + 0.02, 0.022, BOOK_H + 0.02), LEATHER_BURGUNDY, {
    bone: root,
    at: [bookCenter.x, bookCenter.y, bookCenter.z],
    quat: lecternTiltQ,
  });

  // Gold corner brackets on grimoire
  for (const cx of [-BOOK_W / 2 - 0.005, BOOK_W / 2 + 0.005]) {
    for (const cz of [-BOOK_H / 2 - 0.005, BOOK_H / 2 + 0.005]) {
      const pos = new THREE.Vector3(cx, 0.014, cz).applyQuaternion(lecternTiltQ).add(bookCenter);
      b.part(new THREE.BoxGeometry(0.022, 0.024, 0.022), GOLD, {
        bone: root,
        at: [pos.x, pos.y, pos.z],
        quat: lecternTiltQ,
      });
    }
  }

  // Tilted open page block
  b.part(new THREE.BoxGeometry(BOOK_W, 0.018, BOOK_H), WARM_PARCHMENT, {
    bone: root,
    at: [bookCenter.x, bookCenter.y + 0.015, bookCenter.z],
    quat: lecternTiltQ,
  });

  // Illustrated Pages Decal
  b.part(new THREE.PlaneGeometry(BOOK_W, BOOK_H), "#ffffff", {
    bone: root,
    at: [bookCenter.x, bookCenter.y + 0.025, bookCenter.z],
    quat: lecternTiltQ.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2)),
    texture: openBookSpreadSvg,
  });

  // Silk ribbon bookmark draped across pages and spilling down desk
  const ribbonStart = new THREE.Vector3(0, 0.03, -BOOK_H / 2).applyQuaternion(lecternTiltQ).add(bookCenter);
  const ribbonMid = new THREE.Vector3(0.04, 0.03, 0.02).applyQuaternion(lecternTiltQ).add(bookCenter);
  const ribbonHang = new THREE.Vector3(0.06, 0.01, BOOK_H / 2 + 0.06).applyQuaternion(lecternTiltQ).add(bookCenter);
  b.sweep(catmull([ribbonStart, ribbonMid, ribbonHang]), 0.005, {
    bone: root,
    color: GOLD,
  });

  // -------------------------------------------------------------------------------------------------------------
  // 8. GENSHIN CRYSTALFLY SPECIMEN JAR (Upper Shelf Hero Feature)
  // -------------------------------------------------------------------------------------------------------------
  const JAR_X = 0.52;
  const jarZ = HUTCH_Z + 0.03;
  const jarBaseY = TOP_SHELF_Y + 0.012;

  // Brass pedestal base
  b.part(new THREE.CylinderGeometry(0.042, 0.048, 0.015, 12), BRASS_PAINT, {
    bone: root,
    at: [JAR_X, jarBaseY + 0.0075, jarZ],
  });
  // Clear cylindrical bell jar
  b.part(new THREE.CylinderGeometry(0.038, 0.038, 0.09, 14), CLEAR_GLASS, {
    bone: root,
    at: [JAR_X, jarBaseY + 0.06, jarZ],
  });
  b.part(new THREE.SphereGeometry(0.038, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2), CLEAR_GLASS, {
    bone: root,
    at: [JAR_X, jarBaseY + 0.105, jarZ],
  });
  // Brass top finial
  b.part(new THREE.ConeGeometry(0.01, 0.022, 6), GOLD, {
    bone: root,
    at: [JAR_X, jarBaseY + 0.155, jarZ],
    dir: [0, 1, 0],
  });

  // Floating Anemo Crystalfly inside the jar
  const flyCenter = [JAR_X, jarBaseY + 0.065, jarZ] as const;
  const flyCore = b.part(new THREE.SphereGeometry(0.008, 8, 8), GLOW_STARLIGHT, {
    bone: root,
    at: flyCenter,
  });
  glow(flyCore, 2.2);
  // 4 delicate glowing Anemo wings
  const wingAngles = [-40, 40, -140, 140];
  for (const wa of wingAngles) {
    const wAng = wa * DEG;
    const wx = JAR_X + Math.cos(wAng) * 0.018;
    const wy = jarBaseY + 0.065 + (Math.abs(wa) < 90 ? 0.012 : -0.008);
    const wz = jarZ + Math.sin(wAng) * 0.014;
    const wing = b.part(new THREE.ConeGeometry(0.009, 0.024, 3), GLOW_ANEMO, {
      bone: root,
      at: [wx, wy, wz],
      dir: [Math.cos(wAng), (Math.abs(wa) < 90 ? 0.6 : -0.5), Math.sin(wAng)],
    });
    glow(wing, 2.0);
  }

  // -------------------------------------------------------------------------------------------------------------
  // 9. CLOSED BOOKS & STACKS (Tabletop & shelves)
  // -------------------------------------------------------------------------------------------------------------
  // Stack of 3 heavy grimoires on the left tabletop
  const STACK_X = -0.58;
  const STACK_Z = 0.06;

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
  const SHELF_BOOKS_X = -0.32;
  const shelfBooksZ = HUTCH_Z + 0.02;
  const shelfColors = [LEATHER_NAVY, LEATHER_BURGUNDY, LEATHER_EMERALD, LEATHER_BROWN, IRON_BLACK, LEATHER_BURGUNDY];
  let curBx = SHELF_BOOKS_X;
  for (let bIdx = 0; bIdx < 6; bIdx++) {
    const bW = 0.032 + (bIdx % 3) * 0.008;
    const bH = 0.18 + (bIdx % 2) * 0.03;
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
  // 10. GLOWING POTIONS & REAGENT FLASKS (Tabletop & Shelves)
  // -------------------------------------------------------------------------------------------------------------
  // Potion 1: Spherical Pyro Flask (Glow Crimson) on table
  const p1X = -0.04;
  const p1Z = 0.22;
  const p1Base = TABLE_TOP_Y + 0.035;
  b.part(new THREE.SphereGeometry(0.035, 12, 10), CLEAR_GLASS, {
    bone: root,
    at: [p1X, p1Base, p1Z],
  });
  const pyroFluid = b.part(new THREE.SphereGeometry(0.028, 10, 8), GLOW_PYRO, {
    bone: root,
    at: [p1X, p1Base - 0.005, p1Z],
  });
  glow(pyroFluid, 1.8);
  b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.022, 10), CLEAR_GLASS, {
    bone: root,
    at: [p1X, p1Base + 0.04, p1Z],
  });
  b.part(new THREE.CylinderGeometry(0.009, 0.008, 0.014, 8), LEATHER_BROWN, {
    bone: root,
    at: [p1X, p1Base + 0.054, p1Z],
  });
  b.part(new THREE.PlaneGeometry(0.032, 0.032), "#ffffff", {
    bone: root,
    at: [p1X, p1Base, p1Z + 0.036],
    texture: potionLabelSvg,
  });

  // Potion 2: Hexagonal Prism Bottle (Glow Electro Amethyst)
  const p2X = 0.12;
  const p2Z = 0.20;
  const p2H = 0.09;
  b.part(new THREE.CylinderGeometry(0.026, 0.026, p2H, 6), CLEAR_GLASS, {
    bone: root,
    at: [p2X, TABLE_TOP_Y + p2H / 2, p2Z],
  });
  const electroFluid = b.part(new THREE.CylinderGeometry(0.021, 0.021, p2H * 0.75, 6), GLOW_ELECTRO, {
    bone: root,
    at: [p2X, TABLE_TOP_Y + (p2H * 0.75) / 2 + 0.004, p2Z],
  });
  glow(electroFluid, 2.0);
  b.part(new THREE.ConeGeometry(0.028, 0.024, 6), GOLD, {
    bone: root,
    at: [p2X, TABLE_TOP_Y + p2H + 0.01, p2Z],
    dir: [0, 1, 0],
  });
  b.part(new THREE.SphereGeometry(0.01, 8, 6), GOLD, {
    bone: root,
    at: [p2X, TABLE_TOP_Y + p2H + 0.025, p2Z],
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
    (t) => (t < 0.35 ? 0.024 : t < 0.65 ? 0.012 : 0.018),
    { bone: root, color: CLEAR_GLASS },
  );
  const anemoFluid = b.part(new THREE.SphereGeometry(0.018, 10, 8), GLOW_ANEMO, {
    bone: root,
    at: [p3X, TABLE_TOP_Y + 0.028, p3Z],
  });
  glow(anemoFluid, 1.9);

  // Top Shelf Brass Test Tube Rack
  const TUBE_RACK_X = 0.28;
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
    b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.062, 8), CLEAR_GLASS, {
      bone: root,
      at: [tx, tubeRackY + 0.036, tubeRackZ],
    });
    const tGlow = b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.04, 6), tubeGlows[tIdx], {
      bone: root,
      at: [tx, tubeRackY + 0.024, tubeRackZ],
    });
    glow(tGlow, 1.8);
    b.part(new THREE.CylinderGeometry(0.006, 0.005, 0.008, 6), LEATHER_BROWN, {
      bone: root,
      at: [tx, tubeRackY + 0.07, tubeRackZ],
    });
  }

  // Row of 3 Amber Glass Apothecary Jars on top shelf
  const jarStartX = -0.28;
  for (let j = 0; j < 3; j++) {
    const jx = jarStartX + j * 0.07;
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.055, 10), AMBER_GLASS, {
      bone: root,
      at: [jx, TOP_SHELF_Y + 0.04, tubeRackZ],
    });
    b.part(new THREE.CylinderGeometry(0.018, 0.016, 0.014, 8), LEATHER_BROWN, {
      bone: root,
      at: [jx, TOP_SHELF_Y + 0.072, tubeRackZ],
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // 11. HERBS, MORTAR & PESTLE, BOTANICAL SPECIMENS
  // -------------------------------------------------------------------------------------------------------------
  const MORTAR_X = -0.48;
  const MORTAR_Z = 0.16;
  const mortarY = TABLE_TOP_Y + 0.024;

  b.part(new THREE.CylinderGeometry(0.046, 0.028, 0.045, 14), WHITE_MARBLE, {
    bone: root,
    at: [MORTAR_X, mortarY, MORTAR_Z],
  });
  b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.008, 14), GOLD, {
    bone: root,
    at: [MORTAR_X, mortarY + 0.022, MORTAR_Z],
  });
  const herbPaste = b.part(new THREE.CylinderGeometry(0.034, 0.02, 0.012, 10), GLOW_DENDRO, {
    bone: root,
    at: [MORTAR_X, mortarY + 0.008, MORTAR_Z],
  });
  glow(herbPaste, 1.8);
  b.part(new THREE.CylinderGeometry(0.009, 0.014, 0.075, 8), WHITE_MARBLE, {
    bone: root,
    at: [MORTAR_X + 0.018, mortarY + 0.028, MORTAR_Z + 0.012],
    dir: [0.4, 0.85, 0.2],
  });

  // Loose herb leaves on desk
  for (let l = 0; l < 4; l++) {
    const lx = MORTAR_X + 0.045 + (l % 2) * 0.025;
    const lz = MORTAR_Z + (l > 1 ? 0.03 : -0.015);
    b.part(new THREE.PlaneGeometry(0.018, 0.01), "#427a3c", {
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
  b.part(new THREE.CylinderGeometry(0.036, 0.024, 0.05, 10), "#b86438", {
    bone: root,
    at: [POT_X, potY, potZ],
  });
  b.part(new THREE.CylinderGeometry(0.038, 0.038, 0.008, 10), GOLD, {
    bone: root,
    at: [POT_X, potY + 0.025, potZ],
  });
  b.sweep(
    catmull([
      [POT_X, potY + 0.025, potZ],
      [POT_X - 0.01, potY + 0.065, potZ + 0.01],
      [POT_X + 0.01, potY + 0.11, potZ - 0.005],
    ]),
    0.004,
    { bone: root, color: "#366a30" },
  );
  const flowerCore = b.part(new THREE.SphereGeometry(0.012, 8, 8), GLOW_ANEMO, {
    bone: root,
    at: [POT_X + 0.01, potY + 0.115, potZ - 0.005],
  });
  glow(flowerCore, 1.8);
  for (let p = 0; p < 5; p++) {
    const pa = p * ((Math.PI * 2) / 5);
    const px = POT_X + 0.01 + Math.cos(pa) * 0.022;
    const pz = potZ - 0.005 + Math.sin(pa) * 0.022;
    b.part(new THREE.ConeGeometry(0.008, 0.024, 4), "#d2f7ee", {
      bone: root,
      at: [px, potY + 0.115, pz],
      dir: [Math.cos(pa), 0.2, Math.sin(pa)],
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // 12. CELESTIAL ASTROLABE / ARMILLARY SPHERE (Mid-shelf central alcove)
  // -------------------------------------------------------------------------------------------------------------
  const ASTRO_X = 0;
  const ASTRO_Z = HUTCH_Z + 0.03;
  const ASTRO_BASE_Y = MID_SHELF_Y + 0.012;

  b.part(new THREE.CylinderGeometry(0.042, 0.052, 0.016, 12), BRASS_PAINT, {
    bone: root,
    at: [ASTRO_X, ASTRO_BASE_Y + 0.008, ASTRO_Z],
  });
  b.part(new THREE.CylinderGeometry(0.012, 0.018, 0.055, 8), GOLD, {
    bone: root,
    at: [ASTRO_X, ASTRO_BASE_Y + 0.042, ASTRO_Z],
  });

  const ASTRO_C_Y = ASTRO_BASE_Y + 0.115;
  const RING_R = 0.068;
  // Meridian vertical ring
  b.part(new THREE.TorusGeometry(RING_R, 0.0045, 6, 24), GOLD_PAINT, {
    bone: root,
    at: [ASTRO_X, ASTRO_C_Y, ASTRO_Z],
    dir: [1, 0, 0],
    axis: "z",
  });
  // Equator horizontal ring
  b.part(new THREE.TorusGeometry(RING_R, 0.0045, 6, 24), GOLD_PAINT, {
    bone: root,
    at: [ASTRO_X, ASTRO_C_Y, ASTRO_Z],
    dir: [0, 1, 0],
    axis: "z",
  });
  // Inclined Ecliptic band
  b.part(new THREE.TorusGeometry(RING_R - 0.008, 0.005, 6, 24), BRASS_PAINT, {
    bone: root,
    at: [ASTRO_X, ASTRO_C_Y, ASTRO_Z],
    dir: [0.35, 0.85, 0.2],
    axis: "z",
  });
  const astroCore = b.part(new THREE.SphereGeometry(0.02, 10, 8), GLOW_STARLIGHT, {
    bone: root,
    at: [ASTRO_X, ASTRO_C_Y, ASTRO_Z],
  });
  glow(astroCore, 2.0);

  // -------------------------------------------------------------------------------------------------------------
  // 13. SCHOLAR'S DESK ACCESSORIES (Hourglass, Inkwell & Quill, Rolled Scrolls)
  // -------------------------------------------------------------------------------------------------------------
  // Hourglass on tabletop
  const HG_X = -0.34;
  const HG_Z = 0.22;
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
  glow(sand, 1.7);

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

  // Rolled Parchment Scrolls
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
    at: [-0.04, TABLE_TOP_Y + 0.015, 0.30],
    dir: [1, 0, -0.2],
  });
  b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.02, 10), GOLD, {
    bone: root,
    at: [-0.04, TABLE_TOP_Y + 0.015, 0.30],
    dir: [1, 0, -0.2],
  });

  // -------------------------------------------------------------------------------------------------------------
  // 14. LOWER SHELF & SURROUNDING ACCESSORIES (Carboy, Wooden Chest, Scroll Canister)
  // -------------------------------------------------------------------------------------------------------------
  // Large Glass Demi-John / Acid Carboy on lower shelf
  const CARBOY_X = 0.44;
  const CARBOY_Z = TABLE_Z;
  const carboyBaseY = SHELF_LOW_Y + 0.013;

  b.part(new THREE.CylinderGeometry(0.095, 0.08, 0.08, 12), DARK_BRASS, {
    bone: root,
    at: [CARBOY_X, carboyBaseY + 0.04, CARBOY_Z],
  });
  b.part(new THREE.SphereGeometry(0.09, 12, 10), CLEAR_GLASS, {
    bone: root,
    at: [CARBOY_X, carboyBaseY + 0.12, CARBOY_Z],
  });
  const carboyFluid = b.part(new THREE.SphereGeometry(0.082, 10, 8), GLOW_ANEMO, {
    bone: root,
    at: [CARBOY_X, carboyBaseY + 0.11, CARBOY_Z],
  });
  glow(carboyFluid, 1.6);
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
  const CHEST_W = 0.26;
  const CHEST_H = 0.14;
  const CHEST_D = 0.18;

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
  b.part(new THREE.BoxGeometry(0.032, 0.045, 0.01), GOLD, {
    bone: root,
    at: [CHEST_X, chestBaseY + CHEST_H * 0.75, CHEST_Z + CHEST_D / 2 + 0.006],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.018, CHEST_H, 0.01), BRASS_PAINT, {
      bone: root,
      at: [CHEST_X + s * (CHEST_W / 2 - 0.02), chestBaseY + CHEST_H / 2, CHEST_Z + CHEST_D / 2 + 0.005],
    });
  }

  // Cylindrical Brass Map & Blueprint Canister standing on dais floor
  const CANISTER_X = 0.86;
  const CANISTER_Z = 0.08;
  const canBaseY = DAIS_H;
  b.part(new THREE.CylinderGeometry(0.065, 0.075, 0.28, 12), BRASS_PAINT, {
    bone: root,
    at: [CANISTER_X, canBaseY + 0.14, CANISTER_Z],
  });
  b.part(new THREE.CylinderGeometry(0.068, 0.068, 0.012, 12), GOLD, {
    bone: root,
    at: [CANISTER_X, canBaseY + 0.275, CANISTER_Z],
  });
  for (let sIdx = 0; sIdx < 3; sIdx++) {
    const sAng = sIdx * 2.1;
    const sx = CANISTER_X + Math.cos(sAng) * 0.022;
    const sz = CANISTER_Z + Math.sin(sAng) * 0.022;
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.42, 8), WARM_PARCHMENT, {
      bone: root,
      at: [sx, canBaseY + 0.28, sz],
      dir: [Math.cos(sAng) * 0.15, 0.95, Math.sin(sAng) * 0.15],
    });
  }

  return b.root;
}
