import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { DEG, rng, vec } from "../../../../src/math";
import { grain, paint } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { bezier, catmull, polyline } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel, INK, inkLines } from "../../../../kits/toon";

export const meta = {
  name: "Wizard's Bookshelf",
  description:
    "An ornate high-fantasy anime wizard's bookshelf with a Gothic pointed arch, starry backing, gold filigree, magical tomes, scroll cubbies, glowing crystal orbs, astrolabe, potions, and flickering candles.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "wizardBookshelf", detail: 0.75, paintSize: 2048 });
  const rand = rng(4217);

  // ---------------------------------------------------------------------------
  // Palette (High-Fantasy Anime Cel-Shaded + Glowing Accents)
  // ---------------------------------------------------------------------------
  const WOOD_DARK = cel(grain("#3b234a", "#2b1738", { size: 0.04, axis: "y", seed: 11 }), "#1d0e29");
  const WOOD_MID = cel(grain("#583568", "#442654", { size: 0.05, axis: "y", seed: 23 }), "#2c173b");
  const WOOD_TRIM = cel("#704682", "#472859");
  const WOOD_CARVED = inkLines(WOOD_TRIM, { levels: [-0.45, 0.45], axis: [0, 0, 1], width: 0.07 });

  const GOLD = cel("#ffd659", "#c9831e");
  const GOLD_BRIGHT = cel("#ffea8a", "#d99826");
  const GOLD_DARK = cel("#d49b2a", "#8c5611");
  const BRASS_INKED = inkLines(GOLD, { levels: [0.0], axis: [0, 1, 0], width: 0.06 });

  const PARCHMENT = cel("#fff5d6", "#dec496");
  const PARCHMENT_AGED = cel("#f5e2b3", "#c9aa75");
  const WAX_CANDLE = cel("#fff8e3", "#ebd1a7");
  const WAX_SEAL_RED = cel("#e82c4f", "#991130");
  const WAX_SEAL_VIOLET = cel("#9b3be8", "#5b1999");

  const VELVET_INDIGO = cel("#251b4d", "#140d30");
  const VELVET_CRIMSON = cel("#9e1c40", "#5e0c27");

  // Book cover cel paints
  const TOME_CRIMSON = cel("#c9244b", "#7a1130");
  const TOME_SAPPHIRE = cel("#245cc9", "#13327a");
  const TOME_EMERALD = cel("#1ca86e", "#0e6142");
  const TOME_AMETHYST = cel("#7c2ae8", "#471494");
  const TOME_TEAL = cel("#1ca3b8", "#0f596b");
  const TOME_AMBER = cel("#e07a1b", "#8c410a");
  const TOME_PLUM = cel("#632161", "#380f3b");
  const TOME_NAVY = cel("#1d2f6f", "#0e1740");
  const TOME_ROSE = cel("#d4467a", "#821f48");
  const TOME_JADE = cel("#2e8f5e", "#184f35");

  const TOME_PALETTE: Paint[] = [
    TOME_CRIMSON,
    TOME_SAPPHIRE,
    TOME_EMERALD,
    TOME_AMETHYST,
    TOME_TEAL,
    TOME_AMBER,
    TOME_PLUM,
    TOME_NAVY,
    TOME_ROSE,
    TOME_JADE,
  ];

  // Starry night backing panel paint with golden constellations and anime moon motif
  const STARRY_BACK = paint((p, n) => {
    const u = p.x;
    const v = p.y - 1.15;
    const r = Math.hypot(u, v - 0.32);
    // Golden concentric astral rings in the upper arch
    if (Math.abs(r - 0.34) < 0.007 || Math.abs(r - 0.52) < 0.006 || Math.abs(r - 0.18) < 0.006) {
      return "#ffd659";
    }
    // Diagonal astral rays
    if (r > 0.19 && r < 0.52) {
      const ang = ((Math.atan2(v - 0.32, u) / DEG + 360) % 45);
      if (ang < 1.8 || ang > 43.2) return "#b88a32";
    }
    // Subtle diamond star grid
    const gx = Math.abs(((p.x * 9) % 1 + 1) % 1 - 0.5);
    const gy = Math.abs(((p.y * 9) % 1 + 1) % 1 - 0.5);
    if (gx + gy < 0.055 && ((Math.floor(p.x * 9) + Math.floor(p.y * 9)) & 1) === 0) {
      return "#ffe885";
    }
    // Vertical gradient from deep midnight blue to royal violet
    const t = Math.max(0, Math.min(1, (p.y - 0.2) / 1.9));
    const lit = n.z > 0;
    if (t > 0.65) return lit ? "#221a52" : "#17113b";
    if (t > 0.32) return lit ? "#1b1442" : "#120d2e";
    return lit ? "#140e33" : "#0d0924";
  });

  // Flat glowing colors (used with glow())
  const GLOW_CYAN = "#45f7ff";
  const GLOW_GOLD = "#ffe066";
  const GLOW_MAGENTA = "#ff5cf4";
  const GLOW_VIOLET = "#b56bff";
  const GLOW_EMERALD = "#4aff9e";
  const GLOW_FLAME = "#ffaa33";
  const GLOW_FLAME_CORE = "#fff6b8";

  // ---------------------------------------------------------------------------
  // SVG Textures (Pages, Rune Circles, Scroll Seals, Tassels, Labels, Flame)
  // ---------------------------------------------------------------------------
  const RUNE_CIRCLE_TEX = svg(
    `<svg viewBox="0 0 256 256">
      <circle cx="128" cy="128" r="118" fill="none" stroke="#45f7ff" stroke-width="5"/>
      <circle cx="128" cy="128" r="104" fill="none" stroke="#ffe066" stroke-width="3" stroke-dasharray="12 8"/>
      <circle cx="128" cy="128" r="78" fill="none" stroke="#45f7ff" stroke-width="4"/>
      <polygon points="128,16 225,184 31,184" fill="none" stroke="#ffe066" stroke-width="4"/>
      <polygon points="128,240 225,72 31,72" fill="none" stroke="#45f7ff" stroke-width="4"/>
      <circle cx="128" cy="128" r="36" fill="#1b1442" stroke="#ffe066" stroke-width="5"/>
      <path d="M128,96 L138,118 L160,128 L138,138 L128,160 L118,138 L96,128 L118,118 Z" fill="#45f7ff"/>
    </svg>`,
    { size: 512 },
  );

  const OPEN_PAGES_TEX = svg(
    `<svg viewBox="0 0 256 256">
      <rect x="6" y="6" width="244" height="244" rx="10" fill="#fff5d6" stroke="#d49b2a" stroke-width="8"/>
      <rect x="18" y="18" width="220" height="220" fill="none" stroke="#9e1c40" stroke-width="3"/>
      <circle cx="128" cy="92" r="46" fill="none" stroke="#7c2ae8" stroke-width="5"/>
      <polygon points="128,50 164,114 92,114" fill="none" stroke="#d49b2a" stroke-width="4"/>
      <polygon points="128,134 164,70 92,70" fill="none" stroke="#245cc9" stroke-width="4"/>
      <circle cx="128" cy="92" r="12" fill="#e82c4f"/>
      <line x1="36" y1="162" x2="220" y2="162" stroke="#3b234a" stroke-width="5" stroke-linecap="round"/>
      <line x1="36" y1="182" x2="200" y2="182" stroke="#3b234a" stroke-width="5" stroke-linecap="round"/>
      <line x1="36" y1="202" x2="212" y2="202" stroke="#3b234a" stroke-width="5" stroke-linecap="round"/>
      <line x1="36" y1="222" x2="170" y2="222" stroke="#9e1c40" stroke-width="5" stroke-linecap="round"/>
    </svg>`,
    { size: 512 },
  );

  const HANGING_BANNER_TEX = svg(
    `<svg viewBox="0 0 128 256">
      <polygon points="12,4 116,4 116,196 64,248 12,196" fill="#251b4d" stroke="#ffd659" stroke-width="8"/>
      <polygon points="22,14 106,14 106,190 64,232 22,190" fill="none" stroke="#ffd659" stroke-width="3"/>
      <circle cx="64" cy="92" r="32" fill="none" stroke="#45f7ff" stroke-width="5"/>
      <path d="M64,50 L75,81 L106,92 L75,103 L64,134 L53,103 L22,92 L53,81 Z" fill="#ffd659"/>
      <circle cx="64" cy="168" r="10" fill="#45f7ff"/>
    </svg>`,
    { size: 256 },
  );

  const BOOKMARK_RIBBON_TEX = svg(
    `<svg viewBox="0 0 64 192">
      <polygon points="12,0 52,0 56,176 32,148 8,176" fill="#c9244b" stroke="#ffd659" stroke-width="5"/>
      <circle cx="32" cy="96" r="10" fill="#ffd659"/>
    </svg>`,
    { size: 256 },
  );

  const LEAF_SPRIG_TEX = svg(
    `<svg viewBox="0 0 128 192">
      <path d="M64,186 Q60,100 64,16" fill="none" stroke="#184f35" stroke-width="7" stroke-linecap="round"/>
      <path d="M64,140 Q18,125 22,92 Q54,100 64,140 Z" fill="#2ee68a" stroke="#123d28" stroke-width="4"/>
      <path d="M64,120 Q110,105 106,72 Q74,80 64,120 Z" fill="#1ca86e" stroke="#123d28" stroke-width="4"/>
      <path d="M64,82 Q20,66 26,34 Q56,44 64,82 Z" fill="#2ee68a" stroke="#123d28" stroke-width="4"/>
      <path d="M64,22 Q44,6 64,2 Q84,6 64,22 Z" fill="#4aff9e" stroke="#123d28" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // Skeleton (Root + Hinge joints for moving doors, drawers, book covers, rings)
  // ---------------------------------------------------------------------------
  const root = b.joint("root", { at: [0, 0, 0] });

  // Lower cabinet double doors (hinged at outer vertical edges)
  const doorL = b.joint("cabinetDoorL", {
    parent: root,
    at: [0.64, 0.37, 0.25],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    role: "hinge",
    group: "cabinet",
  });
  const doorR = b.joint("cabinetDoorR", {
    parent: root,
    at: [-0.64, 0.37, 0.25],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    role: "hinge",
    group: "cabinet",
  });

  // Lectern reading stand & articulated grimoire on shelf 1
  const lecternJoint = b.joint("lectern", {
    parent: root,
    at: [0.0, 0.68, 0.2],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    role: "hinge",
    group: "lectern",
  });
  const grimoireCoverL = b.joint("grimoireCoverL", {
    parent: lecternJoint,
    at: [0.015, 0.78, 0.21],
    dir: [0, 0.82, -0.57],
    up: [0, 0.57, 0.82],
    role: "hinge",
    group: "lectern",
  });
  const grimoireCoverR = b.joint("grimoireCoverR", {
    parent: lecternJoint,
    at: [-0.015, 0.78, 0.21],
    dir: [0, 0.82, -0.57],
    up: [0, 0.57, 0.82],
    role: "hinge",
    group: "lectern",
  });

  // Levitating spellbook on shelf 2 (left)
  const floatingBook = b.joint("floatingBook", {
    parent: root,
    at: [0.38, 1.38, 0.14],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    role: "hinge",
    group: "floatingBook",
  });

  // Astrolabe celestial sphere on shelf 2 (right)
  const astrolabeRingOuter = b.joint("astrolabeOuter", {
    parent: root,
    at: [-0.36, 1.35, 0.03],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    role: "hinge",
    group: "astrolabe",
  });
  const astrolabeRingInner = b.joint("astrolabeInner", {
    parent: astrolabeRingOuter,
    at: [-0.36, 1.35, 0.03],
    dir: [1, 0, 0],
    up: [0, 1, 0],
    role: "hinge",
    group: "astrolabe",
  });

  // Hanging censer lantern from right upper arch scroll bracket
  const lanternChain = b.joint("hangingLantern", {
    parent: root,
    at: [-0.88, 1.88, 0.18],
    dir: [0, -1, 0],
    up: [0, 0, 1],
    role: "hinge",
    group: "lantern",
  });

  // ---------------------------------------------------------------------------
  // 1. Stepped Plinth, Claw Feet & Arcane Floor Rug Trim
  // ---------------------------------------------------------------------------
  // Velvet arcane runner pad at the base
  b.frustumBox([0, 0.0, 0.06], [0, 0.016, 0.06], [1.74, 0.72], [1.7, 0.68], {
    bone: root,
    color: VELVET_INDIGO,
    up: [0, 0, 1],
    group: "base",
    name: "arcaneMat",
  });
  b.frustumBox([0, 0.016, 0.06], [0, 0.022, 0.06], [1.64, 0.62], [1.62, 0.6], {
    bone: root,
    color: GOLD_DARK,
    up: [0, 0, 1],
    group: "base",
    name: "arcaneMatGoldBorder",
  });

  // Ornate lion-paw / dragon-scroll corner feet touching y = 0
  for (const sx of [1, -1]) {
    for (const sz of [1, -1]) {
      const fx = sx * 0.71;
      const fz = sz * 0.25;
      b.lathe(
        [
          [0, 0],
          [0.068, 0],
          [0.075, 0.025],
          [0.052, 0.055],
          [0.064, 0.085],
          [0, 0.085],
        ],
        {
          at: [fx, 0, fz],
          bone: root,
          segments: 8,
          color: GOLD,
          group: "base",
          name: `foot_${sx > 0 ? "L" : "R"}_${sz > 0 ? "F" : "B"}`,
        },
      );
      // Forward claw scroll on front feet
      if (sz > 0) {
        b.sweep(
          bezier([fx, 0.06, fz + 0.03], [fx + sx * 0.02, 0.03, fz + 0.085], [fx + sx * 0.01, 0.008, fz + 0.095]),
          [0.022, 0.008],
          { bone: root, color: GOLD_BRIGHT, sides: 6, group: "base" },
        );
      }
    }
  }

  // Lower plinth molding (y = 0.04 to 0.14)
  b.frustumBox([0, 0.035, 0], [0, 0.085, 0], [1.54, 0.58], [1.5, 0.55], {
    bone: root,
    color: WOOD_DARK,
    up: [0, 0, 1],
    group: "carcass",
    name: "plinthBase",
  });
  b.frustumBox([0, 0.085, 0], [0, 0.115, 0], [1.52, 0.56], [1.46, 0.52], {
    bone: root,
    color: GOLD,
    up: [0, 0, 1],
    group: "carcass",
    name: "plinthGoldTrim",
  });
  b.frustumBox([0, 0.115, 0], [0, 0.14, 0], [1.48, 0.53], [1.44, 0.5], {
    bone: root,
    color: WOOD_MID,
    up: [0, 0, 1],
    group: "carcass",
    name: "plinthTop",
  });

  // ---------------------------------------------------------------------------
  // 2. Main Bookshelf Carcass, Gothic Pointed Arch & Starry Back Panel
  // ---------------------------------------------------------------------------
  // Starry backing board (extruded Gothic pointed arch silhouette)
  const backOutline: OutlinePoint[] = [
    [-0.68, 0.12],
    [0.68, 0.12],
    [0.68, 1.72, "sharp"],
    [0.56, 2.02],
    [0.28, 2.26],
    [0.0, 2.38, "sharp"],
    [-0.28, 2.26],
    [-0.56, 2.02],
    [-0.68, 1.72, "sharp"],
  ];
  b.extrude(backOutline, {
    at: [0, 0, -0.21],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.04,
    bevel: 0.008,
    smoothing: 1,
    color: STARRY_BACK,
    bone: root,
    group: "carcass",
    name: "starryBackPanel",
  });

  // Side walls (left & right carved mahogany panels with stepped upper flare)
  for (const s of [1, -1]) {
    const sideTag = s > 0 ? "L" : "R";
    const xC = s * 0.67;
    // Lower cabinet side wall
    b.frustumBox([xC, 0.14, 0], [xC, 0.64, 0], [0.06, 0.48], [0.06, 0.48], {
      bone: root,
      color: WOOD_DARK,
      up: [0, 0, 1],
      group: "carcass",
      name: `sideLower_${sideTag}`,
    });
    // Upper bookcase side wall
    b.frustumBox([xC, 0.64, -0.02], [xC, 1.74, -0.02], [0.055, 0.42], [0.062, 0.44], {
      bone: root,
      color: WOOD_MID,
      up: [0, 0, 1],
      group: "carcass",
      name: `sideUpper_${sideTag}`,
    });

    // Fluted front pilaster columns with turned gold bases and capitals
    const pilasterX = s * 0.67;
    const pilasterZ = 0.21;
    b.lathe(
      [
        [0, 0],
        [0.048, 0],
        [0.052, 0.03],
        [0.038, 0.07],
        [0.044, 0.1],
        [0, 0.1],
      ],
      {
        at: [pilasterX, 0.14, pilasterZ],
        bone: root,
        segments: 8,
        color: GOLD,
        group: "carcass",
        name: `pilasterBase_${sideTag}`,
      },
    );
    b.rod([pilasterX, 0.24, pilasterZ], [pilasterX, 1.66, pilasterZ], 0.034, {
      bone: root,
      color: WOOD_CARVED,
      sides: 8,
      group: "carcass",
      name: `pilasterShaft_${sideTag}`,
    });
    // Gold ring bands along pilaster shaft
    for (const ringY of [0.64, 1.1, 1.52]) {
      b.lathe(
        [
          [0, -0.018],
          [0.045, -0.018],
          [0.05, 0],
          [0.045, 0.018],
          [0, 0.018],
        ],
        {
          at: [pilasterX, ringY, pilasterZ],
          bone: root,
          segments: 8,
          color: GOLD_BRIGHT,
          group: "carcass",
        },
      );
    }
    // Pilaster Corinthian/anime capital
    b.lathe(
      [
        [0, 0],
        [0.038, 0],
        [0.054, 0.04],
        [0.062, 0.08],
        [0.056, 0.1],
        [0, 0.1],
      ],
      {
        at: [pilasterX, 1.66, pilasterZ],
        bone: root,
        segments: 8,
        color: GOLD,
        group: "carcass",
        name: `pilasterCap_${sideTag}`,
      },
    );

    // Ornate exterior side scroll brackets (anime silhouette wings)
    const wingScroll = bezier(
      [s * 0.7, 1.54, 0.04],
      [s * 0.88, 1.66, 0.08],
      [s * 0.92, 1.86, 0.14],
      [s * 0.74, 1.92, 0.12],
    );
    b.sweep(wingScroll, [0.024, 0.012], {
      bone: root,
      color: GOLD,
      section: "box",
      group: "carcass",
      name: `sideWingScroll_${sideTag}`,
    });
    // Lower counter-scroll
    const lowScroll = bezier(
      [s * 0.7, 0.66, 0.08],
      [s * 0.83, 0.76, 0.1],
      [s * 0.81, 0.92, 0.08],
      [s * 0.7, 0.96, 0.06],
    );
    b.sweep(lowScroll, [0.02, 0.01], {
      bone: root,
      color: GOLD_DARK,
      section: "box",
      group: "carcass",
    });
  }

  // ---------------------------------------------------------------------------
  // 3. Shelves & Vertical Dividers
  // ---------------------------------------------------------------------------
  const shelfSpecs = [
    { y: 0.64, h: 0.042, depth: 0.5, width: 1.44, name: "shelfCounter" }, // Countertop above lower cabinet
    { y: 1.1, h: 0.034, depth: 0.43, width: 1.38, name: "shelfMid1" }, // Middle shelf 1
    { y: 1.52, h: 0.034, depth: 0.43, width: 1.38, name: "shelfMid2" }, // Middle shelf 2
    { y: 1.88, h: 0.032, depth: 0.41, width: 1.26, name: "shelfTop" }, // Upper arch shelf
  ];

  for (const sh of shelfSpecs) {
    const zOff = (sh.depth - 0.44) * 0.5;
    b.frustumBox([0, sh.y - sh.h / 2, zOff], [0, sh.y + sh.h / 2, zOff], [sh.width, sh.depth], [sh.width + 0.02, sh.depth + 0.015], {
      bone: root,
      color: WOOD_DARK,
      up: [0, 0, 1],
      group: "shelves",
      name: sh.name,
    });
    // Gold front inlay strip on every shelf edge
    b.rod(
      [-sh.width * 0.49, sh.y, zOff + sh.depth * 0.5 + 0.004],
      [sh.width * 0.49, sh.y, zOff + sh.depth * 0.5 + 0.004],
      0.009,
      {
        bone: root,
        color: GOLD_BRIGHT,
        section: "box",
        group: "shelves",
      },
    );
  }

  // Vertical partitions creating cubbies & asymmetrical wizard compartments
  // Shelf 1 (y: 0.66 -> 1.08): Left cubby (x = 0.24) and Right cubby (x = -0.24), leaving center bay for the lectern
  for (const px of [0.24, -0.24]) {
    b.frustumBox([px, 0.66, -0.02], [px, 1.08, -0.02], [0.028, 0.39], [0.028, 0.39], {
      bone: root,
      color: WOOD_MID,
      up: [0, 0, 1],
      group: "shelves",
    });
    b.rod([px, 0.66, 0.18], [px, 1.08, 0.18], 0.01, {
      bone: root,
      color: GOLD,
      sides: 6,
      group: "shelves",
    });
  }

  // Shelf 2 (y: 1.12 -> 1.50): Scroll lattice cubbies in the center (x = -0.11 to +0.11)
  for (const px of [0.11, -0.11]) {
    b.frustumBox([px, 1.12, -0.02], [px, 1.5, -0.02], [0.024, 0.39], [0.024, 0.39], {
      bone: root,
      color: WOOD_MID,
      up: [0, 0, 1],
      group: "shelves",
    });
  }
  // Horizontal mini-dividers inside the scroll cubby creating a 2x3 pigeonhole rack
  for (const hy of [1.24, 1.37]) {
    b.frustumBox([0, hy - 0.008, -0.02], [0, hy + 0.008, -0.02], [0.22, 0.38], [0.22, 0.38], {
      bone: root,
      color: GOLD_DARK,
      up: [0, 0, 1],
      group: "shelves",
    });
  }
  // Vertical mid-split in scroll cubby
  b.frustumBox([0, 1.12, -0.02], [0, 1.5, -0.02], [0.014, 0.38], [0.014, 0.38], {
    bone: root,
    color: GOLD_DARK,
    up: [0, 0, 1],
    group: "shelves",
  });

  // ---------------------------------------------------------------------------
  // 4. Gothic Pointed Arch Crown, Filigree Tracery & Celestial Finial
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const sideTag = s > 0 ? "L" : "R";
    // Heavy carved wood arch rib
    const archCurve = bezier(
      [s * 0.69, 1.74, 0.0],
      [s * 0.66, 2.08, 0.02],
      [s * 0.35, 2.32, 0.04],
      [0, 2.43, 0.05],
    );
    b.sweep(archCurve, [0.048, 0.036], {
      bone: root,
      color: WOOD_DARK,
      section: "box",
      group: "crown",
      name: `archRibWood_${sideTag}`,
    });

    // Sweeping gold cornice molding along front of arch
    const goldArchFront = bezier(
      [s * 0.71, 1.74, 0.21],
      [s * 0.67, 2.09, 0.22],
      [s * 0.36, 2.34, 0.23],
      [0, 2.45, 0.24],
    );
    b.sweep(goldArchFront, [0.032, 0.022], {
      bone: root,
      color: GOLD_BRIGHT,
      sides: 6,
      group: "crown",
      name: `archRimGold_${sideTag}`,
    });

    // Inner gothic trefoil / filigree tracery hanging inside the upper arch
    const traceryCurve = bezier(
      [s * 0.61, 1.88, 0.18],
      [s * 0.48, 2.12, 0.19],
      [s * 0.22, 2.26, 0.2],
      [0, 2.32, 0.2],
    );
    b.sweep(traceryCurve, 0.014, {
      bone: root,
      color: GOLD,
      sides: 6,
      group: "crown",
    });

    // Cusp spikes along arch inner edge
    for (const u of [0.28, 0.58, 0.82]) {
      const pt = traceryCurve.at(u);
      b.spike(pt, [s * -0.4, -0.9, 0.1], 0.055, 0.014, {
        bone: root,
        color: GOLD_BRIGHT,
        sides: 4,
        group: "crown",
      });
    }
  }

  // Apex celestial sun/moon crest & spire finial (reaches ~2.68 m)
  const crestCenter: [number, number, number] = [0, 2.45, 0.24];
  b.lathe(
    [
      [0, 0],
      [0.055, 0],
      [0.04, 0.05],
      [0.065, 0.09],
      [0.025, 0.14],
      [0.012, 0.21],
      [0, 0.24],
    ],
    {
      at: [0, 2.43, 0.14],
      bone: root,
      segments: 8,
      color: GOLD_BRIGHT,
      group: "crown",
      name: "apexSpireFinial",
    },
  );

  // Crescent moon cradle at the arch crest
  const crescentPts = catmull([
    [0.14, 2.52, 0.24],
    [0.09, 2.41, 0.24],
    [0.0, 2.37, 0.24],
    [-0.09, 2.41, 0.24],
    [-0.14, 2.52, 0.24],
  ]);
  b.sweep(crescentPts, [0.008, 0.028, 0.036, 0.028, 0.008], {
    bone: root,
    color: GOLD_BRIGHT,
    sides: 8,
    caps: "point",
    group: "crown",
    name: "crestCrescent",
  });

  // Glowing star gem suspended inside the apex crescent
  glow(
    b.part(new THREE.OctahedronGeometry(0.052, 0), GLOW_CYAN, {
      bone: root,
      at: [0, 2.47, 0.24],
      scale: [0.85, 1.25, 0.55],
      flat: true,
      group: "crown",
      name: "crestStarGem",
    }),
    1.8,
  );
  // Radiating gold rays around crest gem
  b.ring(
    frame(crestCenter, [0, 0, 1]),
    { count: 8, radius: 0.06, group: "crown" },
    (ray) => {
      b.spike(ray, ray, 0.055, 0.01, { color: GOLD, sides: 4, group: "crown" });
    },
  );

  // ---------------------------------------------------------------------------
  // 5. Lower Cabinet Doors & Center Apothecary Drawers
  // ---------------------------------------------------------------------------
  // Left & Right Hinged Cabinet Doors (x: ±0.25 to ±0.64, y: 0.16 to 0.61)
  for (const [s, dJoint] of [
    [1, doorL],
    [-1, doorR],
  ] as const) {
    const sideTag = s > 0 ? "L" : "R";
    const doorCenter: [number, number, number] = [s * 0.445, 0.385, 0.24];
    // Main door slab
    b.frustumBox(
      [doorCenter[0], 0.16, 0.235],
      [doorCenter[0], 0.61, 0.235],
      [0.38, 0.032],
      [0.38, 0.032],
      {
        bone: dJoint,
        color: WOOD_MID,
        up: [0, 0, 1],
        group: "cabinet",
        name: `doorPanel_${sideTag}`,
      },
    );
    // Recessed velvet/dark inset panel
    b.frustumBox(
      [doorCenter[0], 0.21, 0.246],
      [doorCenter[0], 0.56, 0.246],
      [0.29, 0.018],
      [0.29, 0.018],
      {
        bone: dJoint,
        color: VELVET_INDIGO,
        up: [0, 0, 1],
        group: "cabinet",
      },
    );
    // Gold diamond frame & corner filigree studs on door face
    const diamondLoop = polyline(
      [
        [doorCenter[0], 0.53, 0.258],
        [doorCenter[0] + 0.11, 0.385, 0.258],
        [doorCenter[0], 0.24, 0.258],
        [doorCenter[0] - 0.11, 0.385, 0.258],
      ],
      { closed: true },
    );
    b.sweep(diamondLoop, 0.008, {
      bone: dJoint,
      color: GOLD,
      sides: 6,
      group: "cabinet",
    });
    // Glowing arcane cabochon gem in center of door diamond
    glow(
      b.part(new THREE.OctahedronGeometry(0.028, 1), s > 0 ? GLOW_CYAN : GLOW_MAGENTA, {
        bone: dJoint,
        at: [doorCenter[0], 0.385, 0.262],
        scale: [0.8, 1.2, 0.45],
        flat: true,
        group: "cabinet",
      }),
      1.4,
    );
    // Ornate gold handle ring near inner edge of door
    const handleX = s * 0.29;
    b.lathe(
      [
        [0, 0],
        [0.022, 0],
        [0.016, 0.018],
        [0, 0.022],
      ],
      {
        at: [handleX, 0.385, 0.252],
        axis: [0, 0, 1],
        bone: dJoint,
        segments: 8,
        color: GOLD_BRIGHT,
        group: "cabinet",
      },
    );
  }

  // Slightly ajar left door for lively storytelling
  b.pose(doorL, { axis: [0, 1, 0], deg: 14 });
  // Inside left cabinet peek: glowing emerald potion bottle & gold ingot stack
  glow(
    b.part(new THREE.SphereGeometry(0.055, 8, 6), GLOW_EMERALD, {
      bone: root,
      at: [0.42, 0.22, 0.08],
      flat: true,
      group: "cabinet",
      name: "hiddenCabinetPotion",
    }),
    1.5,
  );

  // Center column of 3 apothecary drawers between the doors (x: -0.23 to +0.23, y: 0.16 to 0.61)
  for (let di = 0; di < 3; di++) {
    const dy = 0.22 + di * 0.145;
    const pullOut = di === 1 ? 0.045 : 0; // Middle drawer slightly pulled out!
    b.frustumBox(
      [0, dy - 0.06, 0.23 + pullOut],
      [0, dy + 0.06, 0.23 + pullOut],
      [0.44, 0.04],
      [0.44, 0.04],
      {
        bone: root,
        color: WOOD_CARVED,
        up: [0, 0, 1],
        group: "cabinet",
        name: `centerDrawer_${di}`,
      },
    );
    // Gold label frame & pull knob
    b.frustumBox(
      [0, dy - 0.022, 0.252 + pullOut],
      [0, dy + 0.022, 0.252 + pullOut],
      [0.14, 0.01],
      [0.14, 0.01],
      {
        bone: root,
        color: GOLD,
        up: [0, 0, 1],
        group: "cabinet",
      },
    );
    b.part(new THREE.SphereGeometry(0.016, 6, 5), GOLD_BRIGHT, {
      bone: root,
      at: [0, dy, 0.266 + pullOut],
      flat: true,
      group: "cabinet",
    });
  }

  // ---------------------------------------------------------------------------
  // Helper: Build a Detailed Wizard Tome (Spine ribs, gold corners, page block, optional gem)
  // ---------------------------------------------------------------------------
  function buildTome(opts: {
    at: [number, number, number]; // Center of bottom of book (or center if flat)
    h: number; // Height of book (along Y when standing)
    d: number; // Depth of book (fore-edge to spine, along Z)
    thick: number; // Thickness of book (along X)
    tiltDeg?: number; // Lean around Z axis (positive leans right/-X, negative leans left/+X)
    yawDeg?: number; // Rotation around Y
    flatOnShelf?: boolean; // Lying flat on shelf
    color: Paint;
    gemColor?: string;
    group: string;
    bone?: typeof root;
  }) {
    const {
      at,
      h,
      d,
      thick,
      tiltDeg = 0,
      yawDeg = 0,
      flatOnShelf = false,
      color,
      gemColor,
      group,
      bone = root,
    } = opts;

    const rot: [number, number, number] = flatOnShelf
      ? [0, yawDeg, 90]
      : [0, yawDeg, tiltDeg];

    const center: [number, number, number] = flatOnShelf
      ? [at[0], at[1] + thick * 0.5, at[2]]
      : [
          at[0] - Math.sin(tiltDeg * DEG) * (h * 0.5),
          at[1] + Math.cos(tiltDeg * DEG) * (h * 0.5),
          at[2],
        ];

    // Outer leather cover + spine block
    const coverGeo = new THREE.BoxGeometry(thick, h, d);
    const coverPart = b.part(coverGeo, color, {
      bone,
      at: center,
      rotation: rot,
      group,
    });

    // Recessed cream page block (slightly smaller in height and depth, shifted slightly back from spine)
    const pageGeo = new THREE.BoxGeometry(thick * 0.78, h * 0.92, d * 0.92);
    b.part(pageGeo, PARCHMENT, {
      bone,
      at: coverPart.local([0, 0, -d * 0.04]),
      rotation: rot,
      group,
    });

    // Gold spine ribs (3 raised horizontal bands across the front spine +Z face)
    for (const ry of [-0.32, 0.0, 0.32]) {
      const ribGeo = new THREE.BoxGeometry(thick * 1.08, h * 0.045, 0.014);
      b.part(ribGeo, GOLD, {
        bone,
        at: coverPart.local([0, ry * h, d * 0.49]),
        rotation: rot,
        group,
      });
    }

    // Gold top/bottom spine corner caps
    for (const cy of [-0.46, 0.46]) {
      const capGeo = new THREE.BoxGeometry(thick * 1.06, h * 0.06, d * 0.22);
      b.part(capGeo, GOLD_DARK, {
        bone,
        at: coverPart.local([0, cy * h, d * 0.41]),
        rotation: rot,
        group,
      });
    }

    // Optional glowing spine jewel or cover emblem
    if (gemColor) {
      glow(
        b.part(new THREE.OctahedronGeometry(Math.min(thick * 0.34, 0.018), 0), gemColor, {
          bone,
          at: coverPart.local([0, h * 0.16, d * 0.51]),
          rotation: rot,
          flat: true,
          group,
        }),
        1.5,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Helper: Build a Rolled Arcane Scroll (Parchment tube, dark core, ribbon & wax seal)
  // ---------------------------------------------------------------------------
  function buildScroll(opts: {
    a: [number, number, number];
    bPt: [number, number, number];
    r?: number;
    sealColor?: Paint;
    hasHangingSeal?: boolean;
    group: string;
  }) {
    const { a, bPt, r = 0.024, sealColor = WAX_SEAL_RED, hasHangingSeal = true, group } = opts;
    // Main parchment roll
    b.rod(a, bPt, r, {
      bone: root,
      color: PARCHMENT,
      sides: 8,
      group,
    });
    // Spiral inner end caps (aged parchment core)
    const dir = vec(bPt).sub(vec(a)).normalize();
    const endA = vec(a).addScaledVector(dir, -0.004);
    const endB = vec(bPt).addScaledVector(dir, 0.004);
    b.rod(endA, vec(a).addScaledVector(dir, 0.015), r * 0.65, {
      bone: root,
      color: WOOD_DARK,
      sides: 6,
      group,
    });
    b.rod( vec(bPt).addScaledVector(dir, -0.015), endB, r * 0.65, {
      bone: root,
      color: WOOD_DARK,
      sides: 6,
      group,
    });

    // Gold/crimson binding ribbon around midpoint
    const midPt = vec(a).lerp(vec(bPt), 0.55);
    b.rod(
      midPt.clone().addScaledVector(dir, -0.016),
      midPt.clone().addScaledVector(dir, 0.016),
      r * 1.12,
      {
        bone: root,
        color: VELVET_CRIMSON,
        sides: 8,
        group,
      },
    );

    if (hasHangingSeal) {
      const sealPos = midPt.clone().add(new THREE.Vector3(0, -r * 0.9, r * 0.85));
      b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.008, 8), sealColor, {
        bone: root,
        at: sealPos,
        dir: [0, -0.3, 1],
        group,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Helper: Build a Dripping Wizard Candle with Glowing Teardrop Flame
  // ---------------------------------------------------------------------------
  function buildCandle(opts: {
    at: [number, number, number];
    h: number;
    r?: number;
    withHolder?: boolean;
    flameColor?: string;
    group: string;
    bone?: typeof root;
  }) {
    const {
      at,
      h,
      r = 0.022,
      withHolder = false,
      flameColor = GLOW_FLAME,
      group,
      bone = root,
    } = opts;
    let baseY = at[1];

    if (withHolder) {
      b.lathe(
        [
          [0, 0],
          [r * 2.1, 0],
          [r * 2.3, 0.012],
          [r * 0.9, 0.022],
          [r * 0.7, 0.045],
          [r * 1.7, 0.06],
          [r * 1.5, 0.07],
          [0, 0.065],
        ],
        {
          at: [at[0], baseY, at[2]],
          bone,
          segments: 8,
          color: GOLD,
          group,
        },
      );
      baseY += 0.062;
    }

    // Main wax shaft
    b.rod([at[0], baseY, at[2]], [at[0], baseY + h, at[2]], [r * 1.04, r * 0.92], {
      bone,
      color: WAX_CANDLE,
      sides: 8,
      caps: "round",
      group,
    });

    // 3 organic wax drips down the sides of the candle
    for (let k = 0; k < 3; k++) {
      const ang = (k * 125 + 25) * DEG;
      const dx = Math.cos(ang) * r * 0.92;
      const dz = Math.sin(ang) * r * 0.92;
      const dripLen = h * (0.35 + 0.25 * (k % 2));
      b.capsule(
        [at[0] + dx, baseY + h - 0.008, at[2] + dz],
        [at[0] + dx * 1.08, baseY + h - dripLen, at[2] + dz * 1.08],
        [0.006, 0.009],
        {
          bone,
          color: WAX_CANDLE,
          sides: 5,
          group,
        },
      );
    }

    // Wick
    const topY = baseY + h;
    b.rod([at[0], topY, at[2]], [at[0], topY + 0.014, at[2]], 0.0025, {
      bone,
      color: INK,
      sides: 4,
      group,
    });

    // Glowing outer teardrop flame
    glow(
      b.spike([at[0], topY + 0.016, at[2]], [0.04, 1, 0.02], 0.052, r * 0.65, {
        bone,
        color: flameColor,
        sides: 6,
        caps: { start: "round", end: "point" },
        group,
      }),
      2.0,
    );
    // Bright white-gold inner core
    glow(
      b.part(new THREE.SphereGeometry(r * 0.36, 6, 5), GLOW_FLAME_CORE, {
        bone,
        at: [at[0], topY + 0.024, at[2] + 0.004],
        scale: [0.8, 1.5, 0.8],
        group,
      }),
      2.5,
    );
  }

  // ---------------------------------------------------------------------------
  // 6. Populate Shelf 1 (y = 0.66 to 1.08): Heavy Grimoires, Center Open Lectern & Orb
  // ---------------------------------------------------------------------------
  // Left Bay (x: 0.27 to 0.62): Row of 6 tall encyclopedic wizard tomes + 1 leaning tome
  const shelf1LeftBooks = [
    { x: 0.6, h: 0.36, d: 0.28, thick: 0.052, col: TOME_CRIMSON, gem: GLOW_GOLD },
    { x: 0.544, h: 0.39, d: 0.3, thick: 0.056, col: TOME_SAPPHIRE, gem: GLOW_CYAN },
    { x: 0.486, h: 0.35, d: 0.27, thick: 0.048, col: TOME_EMERALD },
    { x: 0.434, h: 0.38, d: 0.29, thick: 0.052, col: TOME_AMETHYST, gem: GLOW_MAGENTA },
    { x: 0.38, h: 0.34, d: 0.27, thick: 0.048, col: TOME_AMBER },
    { x: 0.315, h: 0.36, d: 0.28, thick: 0.05, col: TOME_NAVY, tilt: -14, gem: GLOW_CYAN },
  ];
  for (const bk of shelf1LeftBooks) {
    buildTome({
      at: [bk.x, 0.66, 0.02],
      h: bk.h,
      d: bk.d,
      thick: bk.thick,
      tiltDeg: bk.tilt ?? 0,
      color: bk.col,
      gemColor: bk.gem,
      group: "shelf1Books",
    });
  }

  // Center Bay (x: -0.22 to +0.22): Ornate Gold Lectern & Open Spell Grimoire
  // Lectern pedestal base
  b.lathe(
    [
      [0, 0],
      [0.085, 0],
      [0.09, 0.018],
      [0.032, 0.045],
      [0.028, 0.1],
      [0.055, 0.12],
      [0, 0.12],
    ],
    {
      at: [0, 0.66, 0.14],
      bone: lecternJoint,
      segments: 8,
      color: GOLD,
      group: "lectern",
      name: "lecternPedestal",
    },
  );
  // Open grimoire left and right wings on hinged joints
  for (const [s, cJoint] of [
    [1, grimoireCoverL],
    [-1, grimoireCoverR],
  ] as const) {
    // Leather cover wing
    b.part(new THREE.BoxGeometry(0.17, 0.018, 0.24), TOME_CRIMSON, {
      bone: cJoint,
      at: [s * 0.09, 0.79, 0.18],
      rotation: [32, 0, -s * 16],
      group: "lectern",
    });
    // Thick fanned cream page stack
    const pageWing = b.part(new THREE.BoxGeometry(0.155, 0.028, 0.22), PARCHMENT, {
      bone: cJoint,
      at: [s * 0.085, 0.806, 0.185],
      rotation: [32, 0, -s * 16],
      group: "lectern",
    });
    // Illustrated magic spell page decal on top of each open page
    b.part(new THREE.PlaneGeometry(0.14, 0.2), "#ffffff", {
      bone: cJoint,
      at: pageWing.local([0, 0.016, 0]),
      quat: pageWing.quat,
      rotation: [32 - 90, 0, -s * 16],
      texture: OPEN_PAGES_TEX,
      group: "lectern",
    });
  }
  // Glowing holographic magic circle hovering just above the open grimoire!
  glow(
    b.part(new THREE.PlaneGeometry(0.24, 0.24), "#ffffff", {
      bone: lecternJoint,
      at: [0, 0.91, 0.2],
      dir: [0, 0.82, 0.57],
      axis: "z",
      texture: RUNE_CIRCLE_TEX,
      group: "lectern",
      name: "grimoireHoloCircle",
    }),
    1.8,
  );
  // Hanging silk bookmark ribbon from open grimoire over front edge of shelf 1
  b.cards([frame([0.02, 0.75, 0.29], [0, 1, 0])], BOOKMARK_RIBBON_TEX, {
    size: [0.055, 0.18],
    lean: 172,
    bend: 18,
    flow: [0, 0, 1],
    bone: lecternJoint,
    group: "lectern",
    name: "grimoireBookmark",
  });

  // Right Bay on Shelf 1 (x: -0.27 to -0.62): Grand Scrying Crystal Orb on Claw Tripod + Stacked Tomes
  const orbCenter: [number, number, number] = [-0.46, 0.85, 0.05];
  // Ornate gold base & 3 dragon-claw prongs cradling the orb
  b.lathe(
    [
      [0, 0],
      [0.095, 0],
      [0.102, 0.02],
      [0.065, 0.045],
      [0.045, 0.085],
      [0.075, 0.11],
      [0, 0.095],
    ],
    {
      at: [orbCenter[0], 0.66, orbCenter[2]],
      bone: root,
      segments: 8,
      color: GOLD,
      group: "orbs",
      name: "grandOrbStand",
    },
  );
  b.ring(
    frame([orbCenter[0], 0.75, orbCenter[2]], [0, 1, 0]),
    { count: 3, radius: 0.055, group: "orbs" },
    (claw) => {
      const p0 = claw.at;
      const outDir = claw.axis;
      const p1 = p0.clone().addScaledVector(outDir, 0.055).add(new THREE.Vector3(0, 0.07, 0));
      const p2 = p0.clone().addScaledVector(outDir, 0.038).add(new THREE.Vector3(0, 0.14, 0));
      b.sweep(bezier(p0, p1, p2), [0.016, 0.005], {
        bone: root,
        color: GOLD_BRIGHT,
        sides: 5,
        caps: "point",
        group: "orbs",
      });
    },
  );
  // The Grand Scrying Orb (cel-shaded deep violet shell with a glowing cyan/magenta nebula core + Saturn rune ring)
  b.part(new THREE.SphereGeometry(0.096, 14, 10), cel("#3268ff", "#1a2885"), {
    bone: root,
    at: orbCenter,
    group: "orbs",
    name: "grandScryingOrb",
  });
  // Glowing equatorial star band & floating orbital ring around the grand orb
  const orbRingPath = catmull(
    b
      .ring(frame(orbCenter, [0.25, 0.92, 0.28]), { count: 12, radius: 0.135 })
      .items.map((it) => it.at),
    { closed: true },
  );
  b.sweep(orbRingPath, 0.009, {
    bone: root,
    color: GOLD_BRIGHT,
    sides: 6,
    group: "orbs",
    name: "grandOrbRing",
  });
  // 4 glowing rune motes orbiting the grand orb ring
  for (let m = 0; m < 4; m++) {
    const mp = orbRingPath.at(m * 0.25);
    glow(
      b.part(new THREE.OctahedronGeometry(0.018, 0), m % 2 === 0 ? GLOW_CYAN : GLOW_GOLD, {
        bone: root,
        at: mp,
        flat: true,
        group: "orbs",
      }),
      1.8,
    );
  }

  // Two horizontal stacked tomes next to the grand orb in right bay
  buildTome({
    at: [-0.31, 0.66, -0.04],
    h: 0.24,
    d: 0.19,
    thick: 0.046,
    flatOnShelf: true,
    yawDeg: 12,
    color: TOME_PLUM,
    group: "shelf1Books",
  });
  buildTome({
    at: [-0.31, 0.706, -0.04],
    h: 0.22,
    d: 0.18,
    thick: 0.042,
    flatOnShelf: true,
    yawDeg: -8,
    color: TOME_TEAL,
    gemColor: GLOW_GOLD,
    group: "shelf1Books",
  });

  // ---------------------------------------------------------------------------
  // 7. Populate Shelf 2 (y = 1.12 to 1.50): Books, Levitating Tome, Scroll Cubbies & Astrolabe
  // ---------------------------------------------------------------------------
  // Left section (x: 0.14 to 0.62): Cluster of books on far left + Levitating Spellbook in center-left
  const shelf2LeftBooks = [
    { x: 0.6, h: 0.31, d: 0.25, thick: 0.046, col: TOME_SAPPHIRE },
    { x: 0.55, h: 0.34, d: 0.27, thick: 0.05, col: TOME_ROSE, gem: GLOW_GOLD },
    { x: 0.498, h: 0.29, d: 0.24, thick: 0.044, col: TOME_JADE },
    { x: 0.16, h: 0.32, d: 0.26, thick: 0.048, col: TOME_AMETHYST, gem: GLOW_CYAN },
    { x: 0.212, h: 0.28, d: 0.24, thick: 0.042, col: TOME_AMBER, tilt: 12 },
  ];
  for (const bk of shelf2LeftBooks) {
    buildTome({
      at: [bk.x, 1.12, 0.01],
      h: bk.h,
      d: bk.d,
      thick: bk.thick,
      tiltDeg: bk.tilt ?? 0,
      color: bk.col,
      gemColor: bk.gem,
      group: "shelf2Books",
    });
  }

  // Levitating Enchanted Tome (on floatingBook joint at [0.36, 1.34, 0.10]) with arcane energy tether
  buildTome({
    at: [0.36, 1.29, 0.08],
    h: 0.22,
    d: 0.17,
    thick: 0.044,
    tiltDeg: 24,
    yawDeg: -18,
    color: TOME_CRIMSON,
    gemColor: GLOW_CYAN,
    group: "floatingBook",
    bone: floatingBook,
  });
  // Glowing swirl stream connecting the floating book to the shelf below
  const swirlPath = catmull([
    [0.36, 1.13, 0.06],
    [0.41, 1.2, 0.12],
    [0.32, 1.26, 0.04],
    [0.36, 1.32, 0.09],
  ]);
  glow(
    b.sweep(swirlPath, [0.014, 0.005], {
      bone: floatingBook,
      color: GLOW_CYAN,
      sides: 5,
      caps: "point",
      group: "floatingBook",
      name: "magicSwirlStream",
    }),
    1.8,
  );

  // Center Scroll Pigeonholes (x: -0.10 to +0.10, 3 tiers x 2 columns = 6 cubbies + extra stacked scrolls)
  const scrollSlots: Array<[number, number, number]> = [
    [0.052, 1.16, 0.02],
    [-0.052, 1.16, 0.03],
    [0.052, 1.29, 0.04],
    [-0.052, 1.29, 0.01],
    [0.052, 1.42, 0.03],
    [-0.052, 1.42, 0.05],
  ];
  scrollSlots.forEach(([sx, sy, sz], idx) => {
    buildScroll({
      a: [sx, sy, sz - 0.16],
      bPt: [sx + (idx % 2 === 0 ? 0.008 : -0.008), sy + 0.006, sz + 0.17],
      r: 0.022 + (idx % 3) * 0.003,
      sealColor: idx % 2 === 0 ? WAX_SEAL_RED : WAX_SEAL_VIOLET,
      hasHangingSeal: idx >= 2,
      group: "scrolls",
    });
  });

  // Right section on Shelf 2 (x: -0.14 to -0.62): Celestial Armillary Sphere / Astrolabe + Books
  const astroPos: [number, number, number] = [-0.36, 1.35, 0.03];
  // Astrolabe pedestal
  b.lathe(
    [
      [0, 0],
      [0.078, 0],
      [0.082, 0.016],
      [0.028, 0.045],
      [0.022, 0.095],
      [0.038, 0.115],
      [0, 0.115],
    ],
    {
      at: [astroPos[0], 1.12, astroPos[2]],
      bone: root,
      segments: 8,
      color: GOLD,
      group: "astrolabe",
      name: "astrolabePedestal",
    },
  );
  // Outer meridian ring
  const outerLoop = catmull(
    b.ring(frame(astroPos, [0, 0, 1]), { count: 12, radius: 0.115 }).items.map((it) => it.at),
    { closed: true },
  );
  b.sweep(outerLoop, 0.01, {
    bone: astrolabeRingOuter,
    color: GOLD_BRIGHT,
    sides: 6,
    group: "astrolabe",
    name: "astrolabeOuterRing",
  });
  // Tilted ecliptic inner ring
  const innerLoop = catmull(
    b.ring(frame(astroPos, [0.45, 0.75, 0.48]), { count: 12, radius: 0.088 }).items.map((it) => it.at),
    { closed: true },
  );
  b.sweep(innerLoop, 0.008, {
    bone: astrolabeRingInner,
    color: GOLD,
    sides: 6,
    group: "astrolabe",
    name: "astrolabeInnerRing",
  });
  // Glowing sun core inside the astrolabe
  glow(
    b.part(new THREE.SphereGeometry(0.038, 8, 6), GLOW_GOLD, {
      bone: astrolabeRingInner,
      at: astroPos,
      flat: true,
      group: "astrolabe",
      name: "astrolabeSunCore",
    }),
    2.0,
  );

  // Flanking books on far right of Shelf 2
  const shelf2RightBooks = [
    { x: -0.6, h: 0.33, d: 0.26, thick: 0.05, col: TOME_CRIMSON, gem: GLOW_GOLD },
    { x: -0.546, h: 0.3, d: 0.25, thick: 0.046, col: TOME_TEAL },
    { x: -0.495, h: 0.28, d: 0.24, thick: 0.044, col: TOME_NAVY, tilt: 10 },
  ];
  for (const bk of shelf2RightBooks) {
    buildTome({
      at: [bk.x, 1.12, 0.01],
      h: bk.h,
      d: bk.d,
      thick: bk.thick,
      tiltDeg: bk.tilt ?? 0,
      color: bk.col,
      gemColor: bk.gem,
      group: "shelf2Books",
    });
  }

  // ---------------------------------------------------------------------------
  // 8. Populate Shelf 3 (y = 1.54 to 1.86): Potions, Feather Quill Inkwell, Orbs & Tomes
  // ---------------------------------------------------------------------------
  // Left side: Row of 5 vibrant anime spell tomes + Golden Owl Bookend
  const shelf3LeftBooks = [
    { x: 0.59, h: 0.27, d: 0.23, thick: 0.044, col: TOME_EMERALD },
    { x: 0.542, h: 0.29, d: 0.24, thick: 0.048, col: TOME_AMETHYST, gem: GLOW_MAGENTA },
    { x: 0.49, h: 0.26, d: 0.22, thick: 0.042, col: TOME_AMBER },
    { x: 0.442, h: 0.3, d: 0.25, thick: 0.048, col: TOME_SAPPHIRE, gem: GLOW_CYAN },
    { x: 0.39, h: 0.25, d: 0.22, thick: 0.042, col: TOME_CRIMSON },
  ];
  for (const bk of shelf3LeftBooks) {
    buildTome({
      at: [bk.x, 1.54, 0.0],
      h: bk.h,
      d: bk.d,
      thick: bk.thick,
      color: bk.col,
      gemColor: bk.gem,
      group: "shelf3Books",
    });
  }
  // Golden Crystalline Bookend supporting the row at x = 0.33
  b.spike([0.32, 1.54, 0.04], [-0.15, 1, 0.1], 0.21, 0.048, {
    bone: root,
    color: GOLD_BRIGHT,
    sides: 5,
    group: "shelf3Props",
    name: "crystalBookend",
  });
  glow(
    b.spike([0.29, 1.54, 0.07], [0.2, 1, 0.2], 0.16, 0.032, {
      bone: root,
      color: GLOW_VIOLET,
      sides: 5,
      group: "shelf3Props",
    }),
    1.5,
  );

  // Center of Shelf 3: Trio of Glowing Alchemy Potion Flasks + Inkwell with Giant Anime Feather Quill
  // Flask 1: Round bulbous magenta mana potion
  const flask1Pos: [number, number, number] = [0.14, 1.54, 0.06];
  b.lathe(
    [
      [0, 0],
      [0.045, 0],
      [0.068, 0.055],
      [0.062, 0.11],
      [0.022, 0.145],
      [0.028, 0.185],
      [0.034, 0.195],
      [0, 0.195],
    ],
    {
      at: flask1Pos,
      bone: root,
      segments: 10,
      color: cel("#ff4fe8", "#a8189c"),
      group: "potions",
      name: "potionFlaskMagenta",
    },
  );
  glow(
    b.part(new THREE.SphereGeometry(0.054, 8, 6), GLOW_MAGENTA, {
      bone: root,
      at: [flask1Pos[0], flask1Pos[1] + 0.065, flask1Pos[2]],
      flat: true,
      group: "potions",
    }),
    1.5,
  );
  // Cork stopper
  b.rod([flask1Pos[0], flask1Pos[1] + 0.19, flask1Pos[2]], [flask1Pos[0], flask1Pos[1] + 0.22, flask1Pos[2]], [0.02, 0.025], {
    bone: root,
    color: GOLD_DARK,
    sides: 6,
    group: "potions",
  });

  // Flask 2: Tall diamond/conical emerald elixir
  const flask2Pos: [number, number, number] = [0.0, 1.54, -0.02];
  b.lathe(
    [
      [0, 0],
      [0.052, 0],
      [0.075, 0.08],
      [0.02, 0.18],
      [0.026, 0.23],
      [0, 0.23],
    ],
    {
      at: flask2Pos,
      bone: root,
      segments: 6,
      color: cel("#2ee68a", "#148752"),
      group: "potions",
      name: "potionFlaskEmerald",
    },
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.055, 0), GLOW_EMERALD, {
      bone: root,
      at: [flask2Pos[0], flask2Pos[1] + 0.08, flask2Pos[2]],
      flat: true,
      group: "potions",
    }),
    1.6,
  );

  // Brass Inkwell + Sweeping White-Gold Feather Quill at x = -0.14
  const inkPos: [number, number, number] = [-0.14, 1.54, 0.08];
  b.lathe(
    [
      [0, 0],
      [0.042, 0],
      [0.048, 0.025],
      [0.032, 0.055],
      [0.036, 0.068],
      [0, 0.068],
    ],
    {
      at: inkPos,
      bone: root,
      segments: 8,
      color: GOLD,
      group: "shelf3Props",
      name: "inkwell",
    },
  );
  const quillSpine = bezier(
    [inkPos[0], inkPos[1] + 0.05, inkPos[2]],
    [inkPos[0] - 0.04, inkPos[1] + 0.16, inkPos[2] + 0.02],
    [inkPos[0] - 0.11, inkPos[1] + 0.25, inkPos[2] - 0.01],
    [inkPos[0] - 0.16, inkPos[1] + 0.3, inkPos[2] - 0.03],
  );
  b.sweep(quillSpine, [0.006, 0.018, 0.014, 0.002], {
    bone: root,
    color: PARCHMENT,
    sides: 6,
    caps: "point",
    group: "shelf3Props",
    name: "quillFeather",
  });

  // Right side of Shelf 3: Twin Divination Orbs on cushions + Book stack + Candle
  // Velvet cushion & glowing cyan/gold twin orbs
  b.frustumBox([-0.32, 1.54, 0.03], [-0.32, 1.572, 0.03], [0.16, 0.16], [0.14, 0.14], {
    bone: root,
    color: VELVET_CRIMSON,
    up: [0, 0, 1],
    group: "orbs",
  });
  glow(
    b.part(new THREE.SphereGeometry(0.062, 12, 8), GLOW_CYAN, {
      bone: root,
      at: [-0.32, 1.63, 0.03],
      group: "orbs",
      name: "shelf3CyanOrb",
    }),
    1.5,
  );
  // Smaller companion moon orb on brass tripod
  b.lathe(
    [
      [0, 0],
      [0.045, 0],
      [0.02, 0.04],
      [0.04, 0.055],
      [0, 0.05],
    ],
    {
      at: [-0.47, 1.54, 0.07],
      bone: root,
      segments: 6,
      color: GOLD,
      group: "orbs",
    },
  );
  glow(
    b.part(new THREE.SphereGeometry(0.042, 10, 8), GLOW_GOLD, {
      bone: root,
      at: [-0.47, 1.625, 0.07],
      group: "orbs",
      name: "shelf3GoldOrb",
    }),
    1.6,
  );

  // Far right of Shelf 3: 3 leaning tomes
  buildTome({
    at: [-0.59, 1.54, 0.0],
    h: 0.28,
    d: 0.23,
    thick: 0.046,
    color: TOME_PLUM,
    gemColor: GLOW_CYAN,
    group: "shelf3Books",
  });
  buildTome({
    at: [-0.54, 1.54, 0.0],
    h: 0.25,
    d: 0.21,
    thick: 0.042,
    tiltDeg: 8,
    color: TOME_EMERALD,
    group: "shelf3Books",
  });

  // ---------------------------------------------------------------------------
  // 9. Populate Top Arch Shelf (y = 1.90 to 2.32): Hourglass, Crown Orbs, Scrolls & Candelabra
  // ---------------------------------------------------------------------------
  // Centerpiece on Top Shelf: Grand Celestial Hourglass in Gold Frame (x = 0, y = 1.90)
  const hgBase: [number, number, number] = [0, 1.9, 0.02];
  // Bottom & Top hexagonal gold plates
  for (const py of [1.9, 2.22]) {
    b.lathe(
      [
        [0, 0],
        [0.088, 0],
        [0.092, 0.018],
        [0, 0.018],
      ],
      {
        at: [0, py, 0.02],
        bone: root,
        segments: 6,
        color: GOLD_BRIGHT,
        group: "topShelf",
      },
    );
  }
  // 3 slender gold pillars around hourglass
  b.ring(frame([0, 1.91, 0.02], [0, 1, 0]), { count: 3, radius: 0.074, group: "topShelf" }, (pil) => {
    b.rod(pil.at, pil.at.clone().add(new THREE.Vector3(0, 0.31, 0)), 0.008, {
      bone: root,
      color: GOLD,
      sides: 5,
      group: "topShelf",
    });
  });
  // Double-bulb hourglass glass & glowing time sand
  b.lathe(
    [
      [0, 0],
      [0.058, 0.02],
      [0.064, 0.08],
      [0.012, 0.15],
      [0.064, 0.22],
      [0.058, 0.28],
      [0, 0.3],
    ],
    {
      at: [hgBase[0], 1.918, hgBase[2]],
      bone: root,
      segments: 10,
      color: cel("#66e3ff", "#2a7ab0"),
      group: "topShelf",
      name: "arcaneHourglass",
    },
  );
  glow(
    b.spike([0, 1.925, 0.02], [0, 1, 0], 0.11, 0.05, {
      bone: root,
      color: GLOW_GOLD,
      sides: 8,
      group: "topShelf",
    }),
    1.6,
  );

  // Left of Hourglass on Top Shelf: Rolled Scroll Bundle + Stacked Ancient Tomes
  buildScroll({
    a: [0.22, 1.922, -0.09],
    bPt: [0.42, 1.922, 0.09],
    r: 0.025,
    sealColor: WAX_SEAL_RED,
    group: "scrolls",
  });
  buildScroll({
    a: [0.25, 1.922, 0.06],
    bPt: [0.44, 1.922, -0.06],
    r: 0.023,
    sealColor: WAX_SEAL_VIOLET,
    group: "scrolls",
  });
  buildScroll({
    a: [0.24, 1.964, -0.02],
    bPt: [0.43, 1.964, 0.03],
    r: 0.024,
    sealColor: WAX_SEAL_RED,
    group: "scrolls",
  });

  // Right of Hourglass on Top Shelf: Star-Chart Scroll Tube + Arcane Tome Stack
  buildTome({
    at: [-0.28, 1.9, 0.0],
    h: 0.22,
    d: 0.18,
    thick: 0.044,
    flatOnShelf: true,
    yawDeg: 8,
    color: TOME_SAPPHIRE,
    gemColor: GLOW_CYAN,
    group: "topShelf",
  });
  buildTome({
    at: [-0.28, 1.944, 0.0],
    h: 0.2,
    d: 0.16,
    thick: 0.04,
    flatOnShelf: true,
    yawDeg: -10,
    color: TOME_CRIMSON,
    gemColor: GLOW_GOLD,
    group: "topShelf",
  });

  // ---------------------------------------------------------------------------
  // 10. Candles & Candelabras (Warm Magical Lighting Clusters)
  // ---------------------------------------------------------------------------
  // Cluster 1: Top-left arch ledge trio of candles
  buildCandle({ at: [0.5, 1.9, 0.08], h: 0.16, r: 0.024, withHolder: true, group: "candles" });
  buildCandle({ at: [0.56, 1.9, 0.01], h: 0.11, r: 0.02, withHolder: false, group: "candles" });
  buildCandle({ at: [0.44, 1.9, -0.02], h: 0.09, r: 0.019, withHolder: false, group: "candles" });

  // Cluster 2: Top-right arch ledge candles (one cyan soul-flame, one gold flame)
  buildCandle({
    at: [-0.46, 1.9, 0.07],
    h: 0.15,
    r: 0.023,
    withHolder: true,
    flameColor: GLOW_CYAN,
    group: "candles",
  });
  buildCandle({ at: [-0.53, 1.9, 0.0], h: 0.1, r: 0.02, withHolder: false, group: "candles" });

  // Cluster 3: Shelf 1 countertop front-left & front-right reading candles
  buildCandle({ at: [0.2, 0.66, 0.17], h: 0.13, r: 0.021, withHolder: true, group: "candles" });
  buildCandle({ at: [-0.21, 0.66, 0.16], h: 0.1, r: 0.019, withHolder: true, group: "candles" });

  // Cluster 4: Shelf 2 right edge candle beside astrolabe
  buildCandle({ at: [-0.18, 1.12, 0.14], h: 0.12, r: 0.02, withHolder: true, group: "candles" });

  // ---------------------------------------------------------------------------
  // 11. Hanging Censer Lantern, Side Pennant Banner & Botanical Ivy Cards
  // ---------------------------------------------------------------------------
  // Hanging Star Lantern on right side bracket (joint `lanternChain` at [-0.88, 1.88, 0.18])
  b.rod([-0.88, 1.88, 0.18], [-0.88, 1.66, 0.18], 0.007, {
    bone: lanternChain,
    color: GOLD,
    sides: 5,
    group: "lantern",
    name: "lanternChainRod",
  });
  // Lantern gold cap & bottom finial
  b.lathe(
    [
      [0, 0],
      [0.075, 0],
      [0.05, 0.035],
      [0.018, 0.07],
      [0, 0.07],
    ],
    {
      at: [-0.88, 1.6, 0.18],
      bone: lanternChain,
      segments: 6,
      color: GOLD_BRIGHT,
      group: "lantern",
    },
  );
  // Glowing star core of the lantern
  glow(
    b.part(new THREE.OctahedronGeometry(0.068, 0), GLOW_GOLD, {
      bone: lanternChain,
      at: [-0.88, 1.54, 0.18],
      scale: [0.85, 1.25, 0.85],
      flat: true,
      group: "lantern",
      name: "lanternGlowCore",
    }),
    2.0,
  );
  b.spike([-0.88, 1.47, 0.18], [0, -1, 0], 0.07, 0.032, {
    bone: lanternChain,
    color: GOLD,
    sides: 6,
    group: "lantern",
  });

  // Left side ornate hanging mage pennant banner + scrolls
  b.rod([0.7, 1.68, 0.22], [0.92, 1.68, 0.22], 0.01, {
    bone: root,
    color: GOLD_BRIGHT,
    sides: 6,
    caps: "round",
    group: "banners",
  });
  b.cards([frame([0.81, 1.67, 0.22], [0, 1, 0])], HANGING_BANNER_TEX, {
    size: [0.16, 0.34],
    lean: 180,
    flow: [0, 0, 1],
    bone: root,
    group: "banners",
    name: "mageSideBanner",
  });

  // Draped parchment scroll hanging over front edge of Shelf 2 (x = 0.05)
  const drapedScrollPath = bezier(
    [0.05, 1.13, -0.02],
    [0.05, 1.13, 0.18],
    [0.05, 1.07, 0.24],
    [0.05, 0.96, 0.23],
  );
  b.sweep(drapedScrollPath, (t) => [0.048, 0.005 + (t > 0.85 ? 0.012 : 0)], {
    bone: root,
    color: PARCHMENT_AGED,
    section: "box",
    group: "scrolls",
    name: "unrolledShelfScroll",
  });

  // Botanical herbalist ivy sprigs tucked along the upper left arch & shelf corners
  const leafFrames = [
    frame([0.66, 1.88, 0.22], [0.4, 0.2, 0.9]),
    frame([0.69, 1.78, 0.21], [0.5, -0.1, 0.85]),
    frame([-0.66, 1.52, 0.21], [-0.4, 0.2, 0.9]),
    frame([0.64, 1.1, 0.21], [0.4, 0.1, 0.9]),
  ];
  b.cards(leafFrames, LEAF_SPRIG_TEX, {
    size: [0.11, 0.16],
    lean: 35,
    bend: 20,
    vary: 0.15,
    spin: 18,
    rng: rand,
    bone: root,
    group: "foliage",
    name: "herbSprigs",
  });

  // ---------------------------------------------------------------------------
  // 12. Floor Side Clutter: Stacked Overflow Tomes, Scroll Basket & Extra Orb
  // ---------------------------------------------------------------------------
  // Right floor stack of oversized ancient atlases resting at y = 0.022 (on arcane mat)
  buildTome({
    at: [-0.74, 0.022, 0.18],
    h: 0.28,
    d: 0.22,
    thick: 0.055,
    flatOnShelf: true,
    yawDeg: 22,
    color: TOME_NAVY,
    gemColor: GLOW_CYAN,
    group: "floorProps",
  });
  buildTome({
    at: [-0.74, 0.077, 0.18],
    h: 0.25,
    d: 0.2,
    thick: 0.048,
    flatOnShelf: true,
    yawDeg: -14,
    color: TOME_CRIMSON,
    gemColor: GLOW_GOLD,
    group: "floorProps",
  });
  // Small glowing orb perched atop the floor book stack
  glow(
    b.part(new THREE.SphereGeometry(0.046, 10, 8), GLOW_VIOLET, {
      bone: root,
      at: [-0.74, 0.17, 0.18],
      group: "floorProps",
      name: "floorStackOrb",
    }),
    1.6,
  );

  // Left floor brass scroll cylinder overflowing with rolled maps
  const basketPos: [number, number, number] = [0.76, 0.022, 0.16];
  b.lathe(
    [
      [0, 0],
      [0.085, 0],
      [0.095, 0.12],
      [0.11, 0.24],
      [0.098, 0.24],
      [0.082, 0.02],
      [0, 0.02],
    ],
    {
      at: basketPos,
      bone: root,
      segments: 10,
      color: BRASS_INKED,
      group: "floorProps",
      name: "scrollCylinderStand",
    },
  );
  // 3 tall map scrolls sticking out of the brass floor cylinder
  buildScroll({
    a: [basketPos[0] - 0.02, 0.05, basketPos[2] - 0.01],
    bPt: [basketPos[0] - 0.05, 0.38, basketPos[2] - 0.04],
    r: 0.026,
    sealColor: WAX_SEAL_RED,
    group: "floorProps",
  });
  buildScroll({
    a: [basketPos[0] + 0.02, 0.05, basketPos[2] + 0.01],
    bPt: [basketPos[0] + 0.06, 0.35, basketPos[2] + 0.05],
    r: 0.024,
    sealColor: WAX_SEAL_VIOLET,
    group: "floorProps",
  });
  buildScroll({
    a: [basketPos[0], 0.05, basketPos[2] + 0.02],
    bPt: [basketPos[0] + 0.01, 0.41, basketPos[2] + 0.07],
    r: 0.025,
    sealColor: WAX_SEAL_RED,
    group: "floorProps",
  });

  // Extra scattered mystical tome spines using TOME_PALETTE on Shelf 3 right bay to fill out richness
  for (let i = 0; i < 3; i++) {
    const col = TOME_PALETTE[(i + 4) % TOME_PALETTE.length];
    buildTome({
      at: [-0.19 - i * 0.042, 1.54, -0.05],
      h: 0.23 + (i % 2) * 0.03,
      d: 0.19,
      thick: 0.038,
      color: col,
      group: "shelf3Books",
    });
  }

  return b.root;
}
