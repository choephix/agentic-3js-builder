import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { bezier, catmull, polyline } from "../../../../src/path";
import { countershade, grain, mix, mottle, paint, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Alchemist's Workbench",
  description:
    "Genshin Impact cel-shaded alchemist's crafting bench and astrolabe arch with elemental potions, open grimoires, brass precision scales, mortar and pestle, hanging drying herbs, and glowing transmutation circles.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "alchemistWorkbench", detail: 1, paintSize: 2048 });

  // ---------------------------------------------------------------------------
  // PALETTE & PAINTS (Genshin Impact: cel-shaded anime, bright clean palette,
  // ornate gold filigree, cobalt/teal/ivory accents, elemental glow motifs)
  // ---------------------------------------------------------------------------

  // Wood tones (warm walnut, rich mahogany, lighter birch shelves)
  const WOOD_DARK_BASE = grain("#4a2d22", "#351e16", { size: 0.04, axis: "x", seed: 11 });
  const WOOD_DARK = cel(WOOD_DARK_BASE, "#281510");

  const WOOD_MID_BASE = grain("#724733", "#593424", { size: 0.05, axis: "x", seed: 23 });
  const WOOD_MID = cel(WOOD_MID_BASE, "#422418");

  const WOOD_V_BASE = grain("#633b2a", "#4b2b1d", { size: 0.04, axis: "y", seed: 31 });
  const WOOD_V = cel(WOOD_V_BASE, "#331b11");

  const WOOD_LIGHT_BASE = grain("#9e6b49", "#835437", { size: 0.045, axis: "x", seed: 47 });
  const WOOD_LIGHT = cel(WOOD_LIGHT_BASE, "#613b25");

  // Ornate Gold & Brass (Genshin signature warm gold trim & filigree)
  const GOLD_LIT = "#f4c762";
  const GOLD_SHADE = "#b87b28";
  const GOLD = cel(
    paint((p, n) => {
      const sheen = smoothstep(-0.2, 0.75, n.y * 0.65 + n.z * 0.35 + 0.12 * Math.sin(p.x * 16 + p.y * 12));
      return mix("#d99e38", "#ffe494", sheen);
    }),
    GOLD_SHADE,
  );
  const GOLD_DARK = cel("#b8822e", "#7a4e16");
  const BRASS_FLAT = "#eab854";

  // Stone & Marble (inlaid transmutation slab, mortar, plinth feet)
  const MARBLE_WHITE = cel(
    mottle("#f2efe6", "#ded8c8", { size: 0.14, contrast: 1.2, seed: 61 }),
    "#b8b0a2",
  );
  const SLATE_BLUE = cel(
    mottle("#29354d", "#1e273a", { size: 0.12, contrast: 1.3, seed: 73 }),
    "#141a29",
  );
  const STONE_MORTAR = cel(
    mottle("#6e7785", "#555d6b", { size: 0.06, contrast: 1.4, seed: 89 }),
    "#3d4352",
  );

  // Cloth, Leather, Parchment & Ceramics
  const COBALT_CLOTH = cel(
    countershade("#24427a", "#192e59", { level: 0, soft: 0.4 }),
    "#111f40",
  );
  const TEAL_SILK = cel(
    countershade("#1f7d82", "#155a61", { level: 0, soft: 0.4 }),
    "#0e3d45",
  );
  const CRIMSON_VELVET = cel("#9e2835", "#661421");
  const PARCHMENT = cel(
    mottle("#fbf3dc", "#eddcb4", { size: 0.08, contrast: 1.1, seed: 103 }),
    "#cfb68a",
  );
  const LEATHER_BROWN = cel("#5e3221", "#3b1c11");
  const LEATHER_NAVY = cel("#223052", "#131b33");
  const LEATHER_TEAL = cel("#1b5c58", "#0f3836");
  const LEATHER_BURGUNDY = cel("#6e222e", "#42111a");
  const CORK = cel("#b88658", "#875c36");
  const WAX_RED = cel("#c92a2a", "#851616");
  const WAX_CREAM = cel("#f7eed7", "#d1bfa1");
  const GLASS_TINT = cel("#cceef7", "#89bfd4");
  const PORCELAIN = cel("#f5f7fa", "#c5d1e0");

  // Botanicals
  const HERB_SAGE = cel("#4d9460", "#2f633d");
  const HERB_MINT = cel("#4fc497", "#2d8563");
  const HERB_LAVENDER = cel("#8c65c9", "#593a8f");
  const HERB_GOLD = cel("#e8a838", "#a86e18");
  const STEM_GREEN = cel("#3d6e38", "#254722");

  // Elemental Glow Flats (cannot be Paint; passed to glow())
  const GLOW_ANEMO = "#4df7d0";
  const GLOW_HYDRO = "#38b6ff";
  const GLOW_ELECTRO = "#c266ff";
  const GLOW_PYRO = "#ff6b35";
  const GLOW_DENDRO = "#70f556";
  const GLOW_GEO = "#ffcf40";
  const GLOW_CELESTIAL = "#fff0b3";

  // ---------------------------------------------------------------------------
  // SVG TEXTURES (Alchemy Circle, Grimoire Pages, Potion Labels, Herb Cards, Tassels)
  // ---------------------------------------------------------------------------

  const TEX_ALCHEMY_CIRCLE = svg(
    `<svg viewBox="0 0 256 256">
      <circle cx="128" cy="128" r="120" fill="none" stroke="#ffe58f" stroke-width="5"/>
      <circle cx="128" cy="128" r="110" fill="none" stroke="#4df7d0" stroke-width="2.5" stroke-dasharray="10 6"/>
      <circle cx="128" cy="128" r="88" fill="none" stroke="#ffe58f" stroke-width="3.5"/>
      <polygon points="128,16 225,184 31,184" fill="none" stroke="#ffe58f" stroke-width="3.5"/>
      <polygon points="128,240 225,72 31,72" fill="none" stroke="#ffe58f" stroke-width="3.5"/>
      <rect x="66" y="66" width="124" height="124" fill="none" stroke="#4df7d0" stroke-width="3" transform="rotate(45 128 128)"/>
      <circle cx="128" cy="128" r="52" fill="#1b2a47" stroke="#ffe58f" stroke-width="4"/>
      <circle cx="128" cy="128" r="42" fill="none" stroke="#4df7d0" stroke-width="2.5"/>
      <path d="M128 76 L140 116 L180 128 L140 140 L128 180 L116 140 L76 128 L116 116 Z" fill="#ffe58f"/>
      <circle cx="128" cy="128" r="12" fill="#4df7d0"/>
      <circle cx="128" cy="16" r="8" fill="#4df7d0" stroke="#ffe58f" stroke-width="3"/>
      <circle cx="128" cy="240" r="8" fill="#4df7d0" stroke="#ffe58f" stroke-width="3"/>
      <circle cx="31" cy="72" r="7" fill="#ffe58f"/>
      <circle cx="225" cy="72" r="7" fill="#ffe58f"/>
      <circle cx="31" cy="184" r="7" fill="#ffe58f"/>
      <circle cx="225" cy="184" r="7" fill="#ffe58f"/>
    </svg>`,
    { size: 512 },
  );

  const TEX_GRIMOIRE_PAGE_L = svg(
    `<svg viewBox="0 0 128 160">
      <rect x="2" y="2" width="124" height="156" rx="4" fill="#fbf2d9" stroke="#d4b475" stroke-width="4"/>
      <rect x="10" y="10" width="108" height="140" fill="none" stroke="#c99b42" stroke-width="2"/>
      <circle cx="64" cy="52" r="28" fill="#233659" stroke="#d49e36" stroke-width="3"/>
      <polygon points="64,26 86,65 42,65" fill="none" stroke="#4df7d0" stroke-width="2.5"/>
      <polygon points="64,78 86,39 42,39" fill="none" stroke="#ffe082" stroke-width="2.5"/>
      <circle cx="64" cy="52" r="8" fill="#4df7d0"/>
      <path d="M20 96 H108 M20 108 H102 M20 120 H108 M20 132 H88" stroke="#4a3222" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="24" cy="24" r="5" fill="#d49e36"/>
      <circle cx="104" cy="24" r="5" fill="#d49e36"/>
    </svg>`,
    { size: 256 },
  );

  const TEX_GRIMOIRE_PAGE_R = svg(
    `<svg viewBox="0 0 128 160">
      <rect x="2" y="2" width="124" height="156" rx="4" fill="#fbf2d9" stroke="#d4b475" stroke-width="4"/>
      <rect x="10" y="10" width="108" height="140" fill="none" stroke="#c99b42" stroke-width="2"/>
      <path d="M20 26 H96 M20 38 H108 M20 50 H86" stroke="#4a3222" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M36 118 C36 90 56 80 64 68 C72 80 92 90 92 118 Z" fill="#38b6ff" stroke="#223052" stroke-width="3"/>
      <path d="M54 68 V56 H74 V68" fill="#d4b475" stroke="#223052" stroke-width="3"/>
      <circle cx="64" cy="102" r="10" fill="#ffe58f"/>
      <path d="M20 134 H108" stroke="#c99b42" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const TEX_SCROLL_CHART = svg(
    `<svg viewBox="0 0 128 192">
      <rect x="4" y="4" width="120" height="184" fill="#f7ebd2" stroke="#c99b42" stroke-width="5"/>
      <rect x="12" y="12" width="104" height="168" fill="#1e2d4f" stroke="#e5b955" stroke-width="2.5"/>
      <circle cx="64" cy="68" r="36" fill="none" stroke="#ffe58f" stroke-width="2.5"/>
      <circle cx="64" cy="68" r="22" fill="none" stroke="#4df7d0" stroke-width="2" stroke-dasharray="6 4"/>
      <path d="M64 24 L72 58 L106 68 L72 78 L64 112 L56 78 L22 68 L56 58 Z" fill="#ffe58f"/>
      <circle cx="64" cy="68" r="7" fill="#4df7d0"/>
      <path d="M28 128 L52 142 L82 124 L100 148" fill="none" stroke="#ffe58f" stroke-width="2.5"/>
      <circle cx="28" cy="128" r="5" fill="#4df7d0"/>
      <circle cx="52" cy="142" r="4" fill="#ffe58f"/>
      <circle cx="82" cy="124" r="5" fill="#c266ff"/>
      <circle cx="100" cy="148" r="4" fill="#38b6ff"/>
      <path d="M26 164 H102" stroke="#e5b955" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  const TEX_BANNER = svg(
    `<svg viewBox="0 0 96 160">
      <polygon points="6,4 90,4 90,118 48,154 6,118" fill="#1f3a6e" stroke="#f0c35b" stroke-width="6"/>
      <polygon points="14,12 82,12 82,113 48,142 14,113" fill="none" stroke="#f0c35b" stroke-width="2.5"/>
      <circle cx="48" cy="64" r="24" fill="none" stroke="#f0c35b" stroke-width="3"/>
      <path d="M48 30 L56 56 L82 64 L56 72 L48 98 L40 72 L14 64 L40 56 Z" fill="#f0c35b"/>
      <circle cx="48" cy="64" r="8" fill="#4df7d0"/>
      <circle cx="48" cy="116" r="6" fill="#f0c35b"/>
    </svg>`,
    { size: 256 },
  );

  const TEX_HERB_LEAF = svg(
    `<svg viewBox="0 0 64 128">
      <path d="M32 124 C32 88 32 40 32 8" stroke="#2d5928" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path d="M32 18 C12 28 6 58 32 88 C58 58 52 28 32 18 Z" fill="#52b778" stroke="#244d29" stroke-width="3"/>
      <path d="M32 32 L18 46 M32 48 L46 62 M32 64 L20 76" stroke="#a3f2be" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="32" cy="14" r="6" fill="#9cfce0"/>
    </svg>`,
    { size: 256 },
  );

  const TEX_GLOW_HERB = svg(
    `<svg viewBox="0 0 64 128">
      <path d="M32 124 C32 85 32 45 32 12" stroke="#397a5c" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path d="M32 10 C8 26 8 64 32 92 C56 64 56 26 32 10 Z" fill="#3be8c8" stroke="#186b5e" stroke-width="3"/>
      <path d="M32 24 C20 38 20 60 32 76 C44 60 44 38 32 24 Z" fill="#b8fff0"/>
    </svg>`,
    { size: 256 },
  );

  const TEX_TASSEL = svg(
    `<svg viewBox="0 0 48 128">
      <rect x="20" y="2" width="8" height="24" fill="#d99e38"/>
      <circle cx="24" cy="28" r="10" fill="#f4c762" stroke="#8c5818" stroke-width="3"/>
      <path d="M14 36 L8 120 H40 L34 36 Z" fill="#e03a3a" stroke="#851616" stroke-width="3"/>
      <rect x="12" y="34" width="24" height="10" rx="3" fill="#f4c762" stroke="#8c5818" stroke-width="2.5"/>
      <path d="M18 46 L15 118 M24 46 V118 M30 46 L33 118" stroke="#ff9e80" stroke-width="2.5"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // SKELETON & JOINTS (Root + Hinges for moving parts per Prop Group contract)
  // ---------------------------------------------------------------------------

  const root = b.joint("workbenchRoot", { at: [0, 0, 0] });

  // Moving parts get joints with role: "hinge"
  const drawerLJoint = b.joint("drawerL", {
    parent: root,
    at: [0.46, 0.675, 0.36],
    dir: [0, 0, 1],
    role: "hinge",
  });
  const drawerRJoint = b.joint("drawerR", {
    parent: root,
    at: [-0.46, 0.675, 0.36],
    dir: [0, 0, 1],
    role: "hinge",
  });
  const cabinetDoorJoint = b.joint("cabinetDoorL", {
    parent: root,
    at: [0.81, 0.38, -0.25],
    dir: [0, 1, 0],
    role: "hinge",
  });

  // Precision balance scale hinges (central beam + two suspended pans)
  const scaleBeamJoint = b.joint("scaleBeam", {
    parent: root,
    at: [-0.34, 1.19, 0.04],
    dir: [0, 1, 0],
    role: "hinge",
  });
  const scalePanLJoint = b.joint("scalePanL", {
    parent: scaleBeamJoint,
    at: [-0.16, 1.19, 0.04],
    dir: [0, -1, 0],
    role: "hinge",
  });
  const scalePanRJoint = b.joint("scalePanR", {
    parent: scaleBeamJoint,
    at: [-0.52, 1.19, 0.04],
    dir: [0, -1, 0],
    role: "hinge",
  });

  // Hanging censer & astrolabe ring hinges
  const censerJoint = b.joint("hangingCenser", {
    parent: root,
    at: [0.56, 1.72, -0.10],
    dir: [0, -1, 0],
    role: "hinge",
  });
  const astrolabeOuterJoint = b.joint("astrolabeOuter", {
    parent: root,
    at: [0, 1.72, -0.26],
    dir: [0, 1, 0],
    role: "hinge",
  });
  const astrolabeInnerJoint = b.joint("astrolabeInner", {
    parent: astrolabeOuterJoint,
    at: [0, 1.72, -0.26],
    dir: [1, 0, 0],
    role: "hinge",
  });
  const chestLidJoint = b.joint("herbChestLid", {
    parent: root,
    at: [-0.46, 0.27, 0.14],
    dir: [0, 1, 0],
    role: "hinge",
  });

  // ---------------------------------------------------------------------------
  // 1. WORKBENCH LEGS, GOLD PAW FEET & LOWER STRETCHER FRAME
  // ---------------------------------------------------------------------------

  const legX = 0.72;
  const legZ = 0.34;

  const legProfile: OutlinePoint[] = [
    [0, 0],
    [0.068, 0, "sharp"],
    [0.072, 0.035, "sharp"],
    [0.052, 0.055, "sharp"],
    [0.046, 0.11],
    [0.062, 0.16],
    [0.044, 0.22, "sharp"],
    [0.048, 0.42],
    [0.064, 0.50],
    [0.046, 0.56, "sharp"],
    [0.058, 0.62, "sharp"],
    [0.058, 0.74, "sharp"],
    [0, 0.74, "sharp"],
  ];

  const footCollarProfile: OutlinePoint[] = [
    [0, 0],
    [0.074, 0, "sharp"],
    [0.076, 0.032, "sharp"],
    [0.058, 0.06, "sharp"],
    [0.065, 0.15],
    [0.048, 0.18, "sharp"],
    [0, 0.18, "sharp"],
  ];

  for (const sx of [1, -1]) {
    for (const sz of [1, -1]) {
      const lx = sx * legX;
      const lz = sz * legZ;

      // Turned wooden leg resting solidly on y = 0
      b.lathe(legProfile, {
        at: [lx, 0, lz],
        segments: 12,
        smoothing: 1,
        color: WOOD_V,
        bone: root,
        group: "tableBase",
      });

      // Ornate gold foot boot & mid-leg brass ring
      b.lathe(footCollarProfile, {
        at: [lx, 0, lz],
        segments: 12,
        smoothing: 1,
        color: GOLD,
        bone: root,
        group: "tableBase",
      });

      b.part(new THREE.CylinderGeometry(0.066, 0.066, 0.028, 12), GOLD, {
        at: [lx, 0.50, lz],
        bone: root,
        group: "tableBase",
      });

      // Gold claw/scroll toe cap facing outward on each foot
      b.spike([lx + sx * 0.045, 0.035, lz + sz * 0.045], [sx * 0.7, -0.25, sz * 0.7], 0.055, 0.026, {
        sides: 6,
        color: GOLD,
        bone: root,
        group: "tableBase",
      });

      // Upper corner gold capital bracket
      b.part(new THREE.BoxGeometry(0.13, 0.14, 0.13), GOLD, {
        at: [lx, 0.68, lz],
        bone: root,
        group: "tableBase",
      });
    }
  }

  // Lower stretcher rails & bottom storage shelf (y = 0.16..0.20)
  for (const sx of [1, -1]) {
    b.frustumBox([sx * legX, 0.17, -legZ], [sx * legX, 0.17, legZ], [0.06, 0.05], [0.06, 0.05], {
      color: WOOD_DARK,
      bone: root,
      group: "tableBase",
    });
  }
  for (const sz of [1, -1]) {
    b.frustumBox([-legX, 0.17, sz * legZ], [legX, 0.17, sz * legZ], [0.06, 0.05], [0.06, 0.05], {
      color: WOOD_DARK,
      bone: root,
      group: "tableBase",
    });
  }

  // Slatted lower wooden shelf planks
  for (let i = -2; i <= 2; i++) {
    const plankZ = i * 0.125;
    b.part(new THREE.BoxGeometry(1.38, 0.028, 0.105), WOOD_MID, {
      at: [0, 0.19, plankZ],
      bone: root,
      group: "tableBase",
    });
  }
  // Gold center trim on front lower stretcher
  b.part(new THREE.BoxGeometry(0.28, 0.06, 0.065), GOLD, {
    at: [0, 0.17, legZ],
    bone: root,
    group: "tableBase",
  });

  // ---------------------------------------------------------------------------
  // 2. WORKBENCH APRON, DRAWERS, SIDE CABINET & MAIN TABLETOP
  // ---------------------------------------------------------------------------

  // Main apron box housing the drawers
  b.part(new THREE.BoxGeometry(1.50, 0.15, 0.72), WOOD_DARK, {
    at: [0, 0.675, 0],
    bone: root,
    group: "tableTop",
  });

  // Center apron keystone emblem with glowing Geo diamond
  b.part(new THREE.BoxGeometry(0.18, 0.16, 0.04), GOLD, {
    at: [0, 0.675, 0.365],
    bone: root,
    group: "tableTop",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.038, 0), GLOW_GEO, {
      at: [0, 0.675, 0.39],
      scale: [1, 1.3, 0.5],
      bone: root,
      group: "tableTop",
    }),
    1.5,
  );

  // Hanging front decorative Cobalt & Gold alchemist banner under center apron
  b.part(new THREE.PlaneGeometry(0.24, 0.38), "#ffffff", {
    at: [0, 0.44, 0.375],
    dir: [0, 0, 1],
    axis: "z",
    texture: TEX_BANNER,
    bone: root,
    group: "tableTop",
  });
  b.rod([-0.14, 0.61, 0.38], [0.14, 0.61, 0.38], 0.012, GOLD, {
    sides: 8,
    bone: root,
    group: "tableTop",
  });

  // Two front drawers (Left slightly pulled out with glowing scroll & crystals inside; Right closed)
  const buildDrawer = (joint: ReturnType<typeof b.joint>, pullOut: number, hasContents: boolean) => {
    const zOff = pullOut;
    // Drawer face
    b.part(new THREE.BoxGeometry(0.48, 0.115, 0.028), WOOD_LIGHT, {
      at: [joint.at.x, joint.at.y, joint.at.z + zOff],
      bone: joint,
      group: "drawers",
    });
    // Gold framing trim on drawer face
    b.part(new THREE.BoxGeometry(0.50, 0.13, 0.018), GOLD, {
      at: [joint.at.x, joint.at.y, joint.at.z + zOff - 0.006],
      bone: joint,
      group: "drawers",
    });
    // Gold drop-ring handle
    b.part(new THREE.SphereGeometry(0.018, 8, 6), GOLD, {
      at: [joint.at.x, joint.at.y + 0.01, joint.at.z + zOff + 0.02],
      bone: joint,
      group: "drawers",
    });
    const ringPts = catmull(
      [
        [joint.at.x - 0.032, joint.at.y, joint.at.z + zOff + 0.024],
        [joint.at.x, joint.at.y - 0.038, joint.at.z + zOff + 0.028],
        [joint.at.x + 0.032, joint.at.y, joint.at.z + zOff + 0.024],
        [joint.at.x, joint.at.y + 0.018, joint.at.z + zOff + 0.022],
      ],
      { closed: true },
    );
    b.sweep(ringPts, 0.006, GOLD, { sides: 6, bone: joint, group: "drawers" });

    if (hasContents) {
      // Drawer tray box
      b.part(new THREE.BoxGeometry(0.45, 0.09, 0.24), WOOD_DARK, {
        at: [joint.at.x, joint.at.y - 0.01, joint.at.z + zOff - 0.12],
        bone: joint,
        group: "drawers",
      });
      // Velvet lining inside pulled-out drawer
      b.part(new THREE.BoxGeometry(0.42, 0.02, 0.21), CRIMSON_VELVET, {
        at: [joint.at.x, joint.at.y + 0.028, joint.at.z + zOff - 0.11],
        bone: joint,
        group: "drawers",
      });
      // Glowing crystal shards & rolled scroll inside open drawer
      glow(
        b.spike(
          [joint.at.x - 0.08, joint.at.y + 0.04, joint.at.z + zOff - 0.06],
          [0.3, 0.45, 0.8],
          0.11,
          0.022,
          { sides: 5, color: GLOW_ANEMO, bone: joint, group: "drawers" },
        ),
        1.4,
      );
      glow(
        b.spike(
          [joint.at.x - 0.03, joint.at.y + 0.04, joint.at.z + zOff - 0.05],
          [-0.2, 0.5, 0.8],
          0.09,
          0.018,
          { sides: 5, color: GLOW_HYDRO, bone: joint, group: "drawers" },
        ),
        1.4,
      );
      b.rod(
        [joint.at.x + 0.02, joint.at.y + 0.05, joint.at.z + zOff - 0.06],
        [joint.at.x + 0.17, joint.at.y + 0.05, joint.at.z + zOff - 0.04],
        0.02,
        PARCHMENT,
        { sides: 8, bone: joint, group: "drawers" },
      );
    }
  };

  buildDrawer(drawerLJoint, 0.13, true);
  buildDrawer(drawerRJoint, 0.01, false);

  // Main Workbench Tabletop Slab (y = 0.74 to 0.82)
  b.part(new THREE.BoxGeometry(1.68, 0.075, 0.88), WOOD_MID, {
    at: [0, 0.778, 0],
    bone: root,
    group: "tableTop",
  });
  // Stepped bevel upper wood surface (top at y = 0.82)
  b.part(new THREE.BoxGeometry(1.62, 0.025, 0.82), WOOD_LIGHT, {
    at: [0, 0.812, 0],
    bone: root,
    group: "tableTop",
  });

  // Ornate Gold Perimeter Rails & Corner Bumpers around Tabletop
  for (const sz of [1, -1]) {
    b.frustumBox([-0.84, 0.785, sz * 0.445], [0.84, 0.785, sz * 0.445], [0.028, 0.055], [0.028, 0.055], {
      color: GOLD,
      bone: root,
      group: "tableTop",
    });
  }
  for (const sx of [1, -1]) {
    b.frustumBox([sx * 0.845, 0.785, -0.44], [sx * 0.845, 0.785, 0.44], [0.028, 0.055], [0.028, 0.055], {
      color: GOLD,
      bone: root,
      group: "tableTop",
    });
    for (const sz of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.09, 0.088, 0.09), GOLD, {
        at: [sx * 0.82, 0.782, sz * 0.42],
        bone: root,
        group: "tableTop",
      });
      // Corner gold finial stud
      b.part(new THREE.SphereGeometry(0.022, 8, 6), GOLD, {
        at: [sx * 0.82, 0.835, sz * 0.42],
        bone: root,
        group: "tableTop",
      });
    }
  }

  // Asymmetric Cobalt & Gold Alchemist Table Runner Cloth draped across center-right
  const runnerTop = [
    [0.06, 0.826, -0.42],
    [0.42, 0.826, -0.42],
    [0.42, 0.826, 0.44],
    [0.06, 0.826, 0.44],
  ];
  b.slab(runnerTop, { thickness: 0.008, color: COBALT_CLOTH, bone: root, group: "tableTop" });
  // Front overhanging cloth banner flap with gold trim and tassel
  const runnerFrontOutline: OutlinePoint[] = [
    [-0.18, 0, "sharp"],
    [0.18, 0, "sharp"],
    [0.16, -0.22, "sharp"],
    [0, -0.34, "sharp"],
    [-0.16, -0.22, "sharp"],
  ];
  b.extrude(runnerFrontOutline, {
    at: [0.24, 0.822, 0.452],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.003,
    color: COBALT_CLOTH,
    bone: root,
    group: "tableTop",
  });
  b.rod([0.08, 0.60, 0.458], [0.24, 0.48, 0.458], 0.008, GOLD, { sides: 6, bone: root, group: "tableTop" });
  b.rod([0.24, 0.48, 0.458], [0.40, 0.60, 0.458], 0.008, GOLD, { sides: 6, bone: root, group: "tableTop" });
  b.cards([frame([0.24, 0.49, 0.46], [0, 1, 0])], TEX_TASSEL, {
    size: [0.05, 0.13],
    lean: 180,
    flow: [0, 0, 1],
    bone: root,
    group: "tableTop",
  });

  // Inlaid Elemental Transmutation Circle on the Center Tabletop
  b.part(new THREE.CylinderGeometry(0.25, 0.26, 0.016, 24), GOLD, {
    at: [0.02, 0.826, 0.04],
    bone: root,
    group: "transmutationCircle",
  });
  b.part(new THREE.CylinderGeometry(0.23, 0.23, 0.019, 24), SLATE_BLUE, {
    at: [0.02, 0.827, 0.04],
    bone: root,
    group: "transmutationCircle",
  });
  // Glowing alchemy circle surface
  glow(
    b.part(new THREE.CircleGeometry(0.22, 24), "#ffffff", {
      at: [0.02, 0.838, 0.04],
      dir: [0, 1, 0],
      up: [0, 0, -1],
      axis: "z",
      texture: TEX_ALCHEMY_CIRCLE,
      bone: root,
      group: "transmutationCircle",
    }),
    1.5,
  );
  // 6 Gold & Glowing Elemental Nodes around the Transmutation Circle Rim
  const nodeColors = [GLOW_ANEMO, GLOW_HYDRO, GLOW_ELECTRO, GLOW_PYRO, GLOW_DENDRO, GLOW_GEO];
  for (let i = 0; i < 6; i++) {
    const ang = (i * Math.PI) / 3;
    const nx = 0.02 + Math.cos(ang) * 0.242;
    const nz = 0.04 + Math.sin(ang) * 0.242;
    b.part(new THREE.CylinderGeometry(0.022, 0.025, 0.022, 8), GOLD, {
      at: [nx, 0.83, nz],
      bone: root,
      group: "transmutationCircle",
    });
    glow(
      b.part(new THREE.SphereGeometry(0.014, 8, 6), nodeColors[i], {
        at: [nx, 0.844, nz],
        bone: root,
        group: "transmutationCircle",
      }),
      1.6,
    );
  }

  // ---------------------------------------------------------------------------
  // 3. ORNATE HUTCH SUPERSTRUCTURE, CELESTIAL ARCH & ASTROLABE
  // ---------------------------------------------------------------------------

  // Left and Right curved hutch side pillars rising from the back of the table
  for (const sx of [1, -1]) {
    const px = sx * 0.72;
    // Main back pillar
    b.frustumBox([px, 0.82, -0.34], [px, 1.70, -0.32], [0.075, 0.085], [0.065, 0.075], {
      color: WOOD_V,
      bone: root,
      group: "hutch",
    });
    // Gold pillar bases, mid-bands, and capitals
    for (const py of [0.85, 1.24, 1.66]) {
      b.part(new THREE.BoxGeometry(0.092, 0.045, 0.10), GOLD, {
        at: [px, py, -0.33],
        bone: root,
        group: "hutch",
      });
    }
    // Sweeping forward support buttress with gold scroll trim
    const buttressCurve = bezier(
      [px, 0.82, -0.10],
      [px, 1.02, -0.14],
      [px, 1.20, -0.24],
      [px, 1.48, -0.30],
    );
    b.sweep(buttressCurve, [0.028, 0.02], WOOD_MID, {
      section: "box",
      bone: root,
      group: "hutch",
    });
    b.sweep(
      bezier([px, 0.83, -0.07], [px, 1.04, -0.11], [px, 1.22, -0.21], [px, 1.48, -0.28]),
      0.012,
      GOLD,
      { sides: 6, bone: root, group: "hutch" },
    );
    // Tall ornate gold spire finial atop each pillar
    b.lathe(
      [
        [0, 0],
        [0.046, 0, "sharp"],
        [0.032, 0.04],
        [0.042, 0.08],
        [0.018, 0.14],
        [0.026, 0.18],
        [0, 0.27, "sharp"],
      ],
      {
        at: [px, 1.70, -0.32],
        segments: 8,
        smoothing: 1,
        color: GOLD,
        bone: root,
        group: "hutch",
      },
    );
  }

  // Sweeping Genshin Arch Crown spanning between the two pillars (y = 1.68..1.98)
  const archCurve = bezier([-0.74, 1.68, -0.32], [-0.38, 1.98, -0.30], [0.38, 1.98, -0.30], [0.74, 1.68, -0.32]);
  b.sweep(archCurve, (t) => [0.038, 0.042 + 0.022 * Math.sin(t * Math.PI)], WOOD_DARK, {
    section: "box",
    bone: root,
    group: "hutch",
  });
  const archGoldTrim = bezier([-0.74, 1.71, -0.28], [-0.38, 2.01, -0.26], [0.38, 2.01, -0.26], [0.74, 1.71, -0.28]);
  b.sweep(archGoldTrim, 0.016, GOLD, { sides: 8, bone: root, group: "hutch" });

  // Central Star Crest at the apex of the arch (y = 1.95)
  const crestOutline: OutlinePoint[] = [
    [0, -0.11, "sharp"],
    [0.04, -0.04],
    [0.13, 0, "sharp"],
    [0.04, 0.04],
    [0, 0.14, "sharp"],
    [-0.04, 0.04],
    [-0.13, 0, "sharp"],
    [-0.04, -0.04],
  ];
  b.extrude(crestOutline, {
    at: [0, 1.92, -0.27],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.028,
    bevel: 0.006,
    color: GOLD,
    bone: root,
    group: "hutch",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.036, 0), GLOW_ANEMO, {
      at: [0, 1.92, -0.25],
      scale: [0.9, 1.3, 0.5],
      bone: root,
      group: "hutch",
    }),
    1.8,
  );

  // Two Hutch Shelves: Lower Shelf (y = 1.16) & Upper Shelf (y = 1.46)
  for (const [sy, depth, zCenter] of [
    [1.16, 0.24, -0.26],
    [1.46, 0.20, -0.28],
  ] as const) {
    b.part(new THREE.BoxGeometry(1.42, 0.032, depth), WOOD_LIGHT, {
      at: [0, sy, zCenter],
      bone: root,
      group: "hutch",
    });
    // Gold front lip rail
    b.rod([-0.70, sy + 0.028, zCenter + depth / 2 - 0.015], [0.70, sy + 0.028, zCenter + depth / 2 - 0.015], 0.007, GOLD, {
      sides: 6,
      bone: root,
      group: "hutch",
    });
    // Backboard panel strip behind shelf
    b.part(new THREE.BoxGeometry(1.40, 0.24, 0.022), WOOD_DARK, {
      at: [0, sy - 0.12, -0.35],
      bone: root,
      group: "hutch",
    });
  }

  // Hanging Celestial Astrolabe suspended under the arch apex (at [0, 1.72, -0.26])
  b.rod([0, 1.88, -0.26], [0, 1.82, -0.26], 0.007, GOLD, { sides: 6, bone: root, group: "astrolabe" });
  const astroCircle1 = catmull(
    Array.from({ length: 12 }, (_, i) => {
      const a = (i * Math.PI * 2) / 12;
      return [Math.cos(a) * 0.105, 1.72 + Math.sin(a) * 0.105, -0.26];
    }),
    { closed: true },
  );
  b.sweep(astroCircle1, 0.008, GOLD, { sides: 6, bone: astrolabeOuterJoint, group: "astrolabe" });

  const astroCircle2 = catmull(
    Array.from({ length: 12 }, (_, i) => {
      const a = (i * Math.PI * 2) / 12;
      return [Math.cos(a) * 0.078, 1.72 + Math.sin(a) * 0.055, -0.26 + Math.sin(a) * 0.055];
    }),
    { closed: true },
  );
  b.sweep(astroCircle2, 0.006, GOLD_DARK, { sides: 6, bone: astrolabeInnerJoint, group: "astrolabe" });
  glow(
    b.part(new THREE.OctahedronGeometry(0.028, 0), GLOW_CELESTIAL, {
      at: [0, 1.72, -0.26],
      bone: astrolabeInnerJoint,
      group: "astrolabe",
    }),
    2.0,
  );

  // Unrolled Constellation Parchment Scroll hanging on the Backboard (x = -0.32, y = 1.02, z = -0.33)
  b.rod([-0.46, 1.12, -0.32], [-0.18, 1.12, -0.32], 0.012, GOLD, { sides: 8, bone: root, group: "hutch" });
  b.rod([-0.46, 0.86, -0.32], [-0.18, 0.86, -0.32], 0.012, GOLD, { sides: 8, bone: root, group: "hutch" });
  b.part(new THREE.PlaneGeometry(0.24, 0.26), "#ffffff", {
    at: [-0.32, 0.99, -0.325],
    dir: [0, 0, 1],
    axis: "z",
    texture: TEX_SCROLL_CHART,
    bone: root,
    group: "hutch",
  });

  // ---------------------------------------------------------------------------
  // 4. POTIONS, ELIXIRS & ALEMBIC DISTILLATION APPARATUS (Rich variety of silhouettes)
  // ---------------------------------------------------------------------------

  // Helper for ornate Genshin potion bottles with inner glowing liquid
  const buildPotionBottle = (
    pos: [number, number, number],
    kind: "gourd" | "octagonal" | "teardrop" | "star" | "tallVial",
    glowColor: string,
    scale = 1,
    group = "potions",
  ) => {
    const [x, y, z] = pos;
    const s = scale;

    if (kind === "gourd") {
      // Bulbous double-bulb gourd flask
      const glassProfile: OutlinePoint[] = [
        [0, 0],
        [0.048 * s, 0, "sharp"],
        [0.068 * s, 0.045 * s],
        [0.058 * s, 0.095 * s],
        [0.032 * s, 0.125 * s],
        [0.046 * s, 0.16 * s],
        [0.022 * s, 0.20 * s, "sharp"],
        [0.028 * s, 0.23 * s, "sharp"],
        [0, 0.23 * s, "sharp"],
      ];
      b.lathe(glassProfile, { at: [x, y, z], segments: 12, smoothing: 1, color: GLASS_TINT, bone: root, group });
      // Inner glowing elemental elixir
      glow(
        b.part(new THREE.SphereGeometry(0.056 * s, 10, 8), glowColor, {
          at: [x, y + 0.052 * s, z],
          scale: [1, 0.82, 1],
          bone: root,
          group,
        }),
        1.6,
      );
      // Gold collar & winged shoulders
      b.part(new THREE.CylinderGeometry(0.036 * s, 0.036 * s, 0.022 * s, 10), GOLD, {
        at: [x, y + 0.125 * s, z],
        bone: root,
        group,
      });
      for (const side of [1, -1]) {
        const wingOutline: OutlinePoint[] = [
          [0, 0, "sharp"],
          [0.042 * s, 0.025 * s, "sharp"],
          [0.028 * s, -0.025 * s],
          [0, -0.015 * s, "sharp"],
        ];
        b.extrude(wingOutline, {
          at: [x + side * 0.028 * s, y + 0.13 * s, z],
          x: [side, 0, 0],
          y: [0, 1, 0],
          thickness: 0.008 * s,
          color: GOLD,
          bone: root,
          group,
        });
      }
      // Cork & glowing crystal topper
      b.part(new THREE.CylinderGeometry(0.018 * s, 0.015 * s, 0.03 * s, 8), CORK, {
        at: [x, y + 0.24 * s, z],
        bone: root,
        group,
      });
      glow(
        b.part(new THREE.OctahedronGeometry(0.018 * s, 0), glowColor, {
          at: [x, y + 0.268 * s, z],
          scale: [0.8, 1.4, 0.8],
          bone: root,
          group,
        }),
        1.8,
      );
    } else if (kind === "octagonal") {
      // Faceted hexagonal/octagonal alchemy flask
      const octProfile: OutlinePoint[] = [
        [0, 0],
        [0.052 * s, 0, "sharp"],
        [0.062 * s, 0.05 * s, "sharp"],
        [0.052 * s, 0.11 * s, "sharp"],
        [0.022 * s, 0.145 * s, "sharp"],
        [0.022 * s, 0.19 * s, "sharp"],
        [0.030 * s, 0.205 * s, "sharp"],
        [0, 0.205 * s, "sharp"],
      ];
      b.lathe(octProfile, { at: [x, y, z], segments: 8, smoothing: 0, color: GLASS_TINT, bone: root, group });
      glow(
        b.part(new THREE.CylinderGeometry(0.048 * s, 0.042 * s, 0.085 * s, 8), glowColor, {
          at: [x, y + 0.055 * s, z],
          bone: root,
          group,
        }),
        1.5,
      );
      // Gold base & neck cage bands
      b.part(new THREE.CylinderGeometry(0.056 * s, 0.056 * s, 0.018 * s, 8), GOLD, {
        at: [x, y + 0.01 * s, z],
        bone: root,
        group,
      });
      b.part(new THREE.CylinderGeometry(0.028 * s, 0.032 * s, 0.02 * s, 8), GOLD, {
        at: [x, y + 0.15 * s, z],
        bone: root,
        group,
      });
      // Red wax seal & cork
      b.part(new THREE.CylinderGeometry(0.022 * s, 0.018 * s, 0.028 * s, 8), WAX_RED, {
        at: [x, y + 0.215 * s, z],
        bone: root,
        group,
      });
    } else if (kind === "teardrop") {
      // Elegant long-necked teardrop amphora on a gold tripod ring
      const tearProfile: OutlinePoint[] = [
        [0, 0.015 * s],
        [0.035 * s, 0.02 * s],
        [0.062 * s, 0.065 * s],
        [0.045 * s, 0.12 * s],
        [0.018 * s, 0.18 * s],
        [0.016 * s, 0.24 * s, "sharp"],
        [0.026 * s, 0.255 * s, "sharp"],
        [0, 0.255 * s, "sharp"],
      ];
      b.lathe(tearProfile, { at: [x, y, z], segments: 12, smoothing: 1, color: GLASS_TINT, bone: root, group });
      glow(
        b.part(new THREE.SphereGeometry(0.052 * s, 10, 8), glowColor, {
          at: [x, y + 0.068 * s, z],
          bone: root,
          group,
        }),
        1.6,
      );
      // Gold tripod stand ring
      b.part(new THREE.CylinderGeometry(0.048 * s, 0.054 * s, 0.022 * s, 8), GOLD, {
        at: [x, y + 0.011 * s, z],
        bone: root,
        group,
      });
      b.part(new THREE.CylinderGeometry(0.024 * s, 0.024 * s, 0.018 * s, 8), GOLD, {
        at: [x, y + 0.19 * s, z],
        bone: root,
        group,
      });
      b.part(new THREE.SphereGeometry(0.02 * s, 8, 6), GOLD, {
        at: [x, y + 0.27 * s, z],
        bone: root,
        group,
      });
    } else if (kind === "star") {
      // Genshin star-shaped perfume/essence phial
      const starProfile: OutlinePoint[] = [
        [0, 0],
        [0.045 * s, 0, "sharp"],
        [0.068 * s, 0.055 * s, "sharp"],
        [0.038 * s, 0.11 * s, "sharp"],
        [0.018 * s, 0.135 * s, "sharp"],
        [0.024 * s, 0.165 * s, "sharp"],
        [0, 0.165 * s, "sharp"],
      ];
      b.lathe(starProfile, { at: [x, y, z], segments: 6, smoothing: 0, color: GLASS_TINT, bone: root, group });
      glow(
        b.part(new THREE.OctahedronGeometry(0.05 * s, 0), glowColor, {
          at: [x, y + 0.058 * s, z],
          scale: [1, 0.9, 1],
          bone: root,
          group,
        }),
        1.7,
      );
      b.part(new THREE.CylinderGeometry(0.024 * s, 0.024 * s, 0.018 * s, 6), GOLD, {
        at: [x, y + 0.138 * s, z],
        bone: root,
        group,
      });
      b.spike([x, y + 0.165 * s, z], [0, 1, 0], 0.045 * s, 0.016 * s, {
        sides: 6,
        color: GOLD,
        bone: root,
        group,
      });
    } else {
      // Tall cylindrical reagent vial with cork
      b.part(new THREE.CylinderGeometry(0.022 * s, 0.022 * s, 0.14 * s, 8), GLASS_TINT, {
        at: [x, y + 0.07 * s, z],
        bone: root,
        group,
      });
      glow(
        b.part(new THREE.CylinderGeometry(0.017 * s, 0.017 * s, 0.095 * s, 8), glowColor, {
          at: [x, y + 0.052 * s, z],
          bone: root,
          group,
        }),
        1.5,
      );
      b.part(new THREE.CylinderGeometry(0.025 * s, 0.025 * s, 0.014 * s, 8), GOLD, {
        at: [x, y + 0.008 * s, z],
        bone: root,
        group,
      });
      b.part(new THREE.CylinderGeometry(0.019 * s, 0.015 * s, 0.026 * s, 8), CORK, {
        at: [x, y + 0.148 * s, z],
        bone: root,
        group,
      });
    }
  };

  // Grand Alembic Distillation Apparatus on the Right Side of the Tabletop (x = 0.44, z = -0.02)
  const alembicX = 0.48;
  const alembicZ = -0.04;
  // Brass burner base & 3 curved legs
  b.lathe(
    [
      [0, 0],
      [0.095, 0, "sharp"],
      [0.105, 0.025, "sharp"],
      [0.075, 0.045],
      [0.088, 0.11, "sharp"],
      [0.068, 0.12, "sharp"],
      [0, 0.12, "sharp"],
    ],
    { at: [alembicX, 0.82, alembicZ], segments: 12, smoothing: 1, color: GOLD, bone: root, group: "alembic" },
  );
  // Glowing Pyro/Anemo burner core inside the stand
  glow(
    b.part(new THREE.SphereGeometry(0.048, 8, 6), GLOW_PYRO, {
      at: [alembicX, 0.875, alembicZ],
      scale: [1, 0.7, 1],
      bone: root,
      group: "alembic",
    }),
    1.8,
  );
  // Large spherical glass boiling retort above burner
  b.part(new THREE.SphereGeometry(0.095, 14, 10), GLASS_TINT, {
    at: [alembicX, 1.02, alembicZ],
    bone: root,
    group: "alembic",
  });
  glow(
    b.part(new THREE.SphereGeometry(0.078, 12, 8), GLOW_ANEMO, {
      at: [alembicX, 1.005, alembicZ],
      scale: [1, 0.78, 1],
      bone: root,
      group: "alembic",
    }),
    1.6,
  );
  // Gold equatorial harness & neck dome on the retort
  b.part(new THREE.CylinderGeometry(0.098, 0.098, 0.022, 12), GOLD, {
    at: [alembicX, 1.02, alembicZ],
    bone: root,
    group: "alembic",
  });
  b.lathe(
    [
      [0, 0],
      [0.062, 0, "sharp"],
      [0.048, 0.05],
      [0.026, 0.09, "sharp"],
      [0, 0.09, "sharp"],
    ],
    { at: [alembicX, 1.095, alembicZ], segments: 10, smoothing: 1, color: GOLD, bone: root, group: "alembic" },
  );

  // Spiraling Copper/Gold Condenser Coil Tube leading to a receiving flask
  const recvX = 0.28;
  const recvZ = -0.14;
  const coilPath = catmull([
    [alembicX, 1.18, alembicZ],
    [alembicX - 0.03, 1.24, alembicZ - 0.03],
    [alembicX - 0.09, 1.19, alembicZ - 0.08],
    [alembicX - 0.13, 1.11, alembicZ - 0.04],
    [alembicX - 0.16, 1.05, alembicZ - 0.10],
    [recvX, 1.02, recvZ],
  ]);
  b.sweep(coilPath, [0.016, 0.011], GOLD, { sides: 8, bone: root, group: "alembic" });

  // Receiving flask at the end of the condenser coil
  buildPotionBottle([recvX, 0.82, recvZ], "teardrop", GLOW_ANEMO, 0.85, "alembic");

  // Clustered Potions on Tabletop (Right front & Left back)
  buildPotionBottle([0.62, 0.82, 0.20], "gourd", GLOW_HYDRO, 1.05, "potionsTable");
  buildPotionBottle([0.46, 0.82, 0.26], "star", GLOW_ELECTRO, 0.95, "potionsTable");
  buildPotionBottle([0.66, 0.82, 0.02], "octagonal", GLOW_DENDRO, 0.88, "potionsTable");

  // Wooden Test-Tube Rack on Left-Back of Tabletop with 4 Glowing Elemental Vials
  const rackX = -0.58;
  const rackZ = -0.14;
  b.part(new THREE.BoxGeometry(0.26, 0.02, 0.08), WOOD_DARK, {
    at: [rackX, 0.83, rackZ],
    bone: root,
    group: "vialRack",
  });
  b.part(new THREE.BoxGeometry(0.26, 0.02, 0.08), WOOD_DARK, {
    at: [rackX, 0.93, rackZ],
    bone: root,
    group: "vialRack",
  });
  for (const sx of [-1, 1]) {
    b.rod([rackX + sx * 0.11, 0.83, rackZ], [rackX + sx * 0.11, 0.96, rackZ], 0.012, GOLD, {
      sides: 6,
      bone: root,
      group: "vialRack",
    });
  }
  const vialColors = [GLOW_PYRO, GLOW_HYDRO, GLOW_ANEMO, GLOW_ELECTRO];
  for (let i = 0; i < 4; i++) {
    const vx = rackX - 0.075 + i * 0.05;
    buildPotionBottle([vx, 0.84, rackZ], "tallVial", vialColors[i], 0.95, "vialRack");
  }

  // Potions arrayed along the Lower & Upper Hutch Shelves
  buildPotionBottle([-0.54, 1.176, -0.25], "gourd", GLOW_PYRO, 0.92, "potionsShelf");
  buildPotionBottle([-0.38, 1.176, -0.26], "octagonal", GLOW_HYDRO, 0.85, "potionsShelf");
  buildPotionBottle([0.38, 1.176, -0.25], "star", GLOW_GEO, 0.95, "potionsShelf");
  buildPotionBottle([0.55, 1.176, -0.26], "teardrop", GLOW_ELECTRO, 0.88, "potionsShelf");

  buildPotionBottle([-0.48, 1.476, -0.27], "star", GLOW_ANEMO, 0.85, "potionsShelf");
  buildPotionBottle([0.46, 1.476, -0.27], "gourd", GLOW_DENDRO, 0.82, "potionsShelf");
  buildPotionBottle([0.32, 1.476, -0.28], "tallVial", GLOW_HYDRO, 0.9, "potionsShelf");

  // ---------------------------------------------------------------------------
  // 5. PRECISION BRASS BALANCE SCALES (Left-Center Tabletop, x = -0.34, z = 0.04)
  // ---------------------------------------------------------------------------

  const scX = -0.34;
  const scZ = 0.04;

  // Stepped ornate gold pedestal base
  b.lathe(
    [
      [0, 0],
      [0.088, 0, "sharp"],
      [0.082, 0.02, "sharp"],
      [0.058, 0.038],
      [0.032, 0.07],
      [0.022, 0.14],
      [0.034, 0.18],
      [0.018, 0.24],
      [0.028, 0.34, "sharp"],
      [0.016, 0.39, "sharp"],
      [0, 0.42, "sharp"],
    ],
    { at: [scX, 0.82, scZ], segments: 12, smoothing: 1, color: GOLD, bone: root, group: "scales" },
  );

  // Dial plate & pointer needle at top of pillar
  b.part(new THREE.CylinderGeometry(0.038, 0.038, 0.014, 12), SLATE_BLUE, {
    at: [scX, 1.19, scZ],
    dir: [0, 0, 1],
    axis: "y",
    bone: root,
    group: "scales",
  });
  b.spike([scX, 1.19, scZ + 0.012], [0, 1, 0], 0.065, 0.009, {
    sides: 4,
    color: GOLD,
    bone: scaleBeamJoint,
    group: "scales",
  });

  // Curved Ornate Balance Beam with swan-neck tips
  const beamPath = catmull([
    [scX + 0.18, 1.19, scZ],
    [scX + 0.11, 1.215, scZ],
    [scX, 1.19, scZ],
    [scX - 0.11, 1.215, scZ],
    [scX - 0.18, 1.19, scZ],
  ]);
  b.sweep(beamPath, (t) => 0.015 - 0.006 * Math.abs(t - 0.5) * 2, GOLD, {
    sides: 8,
    bone: scaleBeamJoint,
    group: "scales",
  });

  // Two Suspended Brass Weighing Pans (Left Pan holds glowing crystal; Right Pan holds brass weights & herbs)
  const buildScalePan = (panJoint: ReturnType<typeof b.joint>, isCrystalSide: boolean) => {
    const px = panJoint.at.x;
    const py = panJoint.at.y;
    const pz = panJoint.at.z;
    const panY = py - 0.19;

    // Top swivel loop
    b.part(new THREE.SphereGeometry(0.014, 8, 6), GOLD, {
      at: [px, py, pz],
      bone: panJoint,
      group: "scales",
    });

    // 3 suspension chains/rods from beam tip down to pan rim
    for (let k = 0; k < 3; k++) {
      const a = (k * Math.PI * 2) / 3 + Math.PI / 6;
      const rx = px + Math.cos(a) * 0.068;
      const rz = pz + Math.sin(a) * 0.068;
      b.rod([px, py, pz], [rx, panY + 0.012, rz], 0.0035, GOLD_DARK, {
        sides: 5,
        bone: panJoint,
        group: "scales",
      });
    }

    // Shallow brass dish
    b.lathe(
      [
        [0, 0],
        [0.055, 0.004],
        [0.074, 0.020, "sharp"],
        [0.066, 0.022, "sharp"],
        [0.048, 0.009],
        [0, 0.008],
      ],
      { at: [px, panY, pz], segments: 12, smoothing: 1, color: GOLD, bone: panJoint, group: "scales" },
    );

    if (isCrystalSide) {
      // Glowing Electro/Hydro crystal cluster being weighed
      glow(
        b.spike([px - 0.01, panY + 0.01, pz], [0.15, 1, 0.1], 0.075, 0.022, {
          sides: 5,
          color: GLOW_ELECTRO,
          bone: panJoint,
          group: "scales",
        }),
        1.7,
      );
      glow(
        b.spike([px + 0.015, panY + 0.01, pz + 0.01], [-0.25, 0.9, 0.15], 0.055, 0.016, {
          sides: 5,
          color: GLOW_HYDRO,
          bone: panJoint,
          group: "scales",
        }),
        1.7,
      );
    } else {
      // Calibrated brass counterweights & a sprig of golden herb on the other pan
      b.part(new THREE.CylinderGeometry(0.018, 0.021, 0.032, 8), GOLD, {
        at: [px - 0.018, panY + 0.024, pz - 0.008],
        bone: panJoint,
        group: "scales",
      });
      b.part(new THREE.CylinderGeometry(0.013, 0.015, 0.022, 8), GOLD_DARK, {
        at: [px + 0.016, panY + 0.019, pz + 0.012],
        bone: panJoint,
        group: "scales",
      });
      b.part(new THREE.SphereGeometry(0.016, 8, 6), HERB_SAGE, {
        at: [px + 0.005, panY + 0.02, pz - 0.02],
        scale: [1.3, 0.6, 1],
        bone: panJoint,
        group: "scales",
      });
    }
  };

  buildScalePan(scalePanLJoint, true);
  buildScalePan(scalePanRJoint, false);
  // Slight natural tilt on the balance beam and counter-pose on the pans so they hang vertically
  b.pose(scaleBeamJoint, { axis: [0, 0, 1], deg: 5 });
  b.pose(scalePanLJoint, { axis: [0, 0, 1], deg: -5 });
  b.pose(scalePanRJoint, { axis: [0, 0, 1], deg: -5 });

  // Small row of graduated brass calibration weights sitting at the base of the scale
  for (let i = 0; i < 3; i++) {
    const r = 0.016 - i * 0.003;
    const h = 0.028 - i * 0.005;
    b.part(new THREE.CylinderGeometry(r * 0.85, r, h, 8), GOLD, {
      at: [scX - 0.11 + i * 0.042, 0.82 + h / 2, scZ + 0.09],
      bone: root,
      group: "scales",
    });
  }

  // ---------------------------------------------------------------------------
  // 6. OPEN GRIMOIRE ON LECTERN, STACKED TOMES, INKWELL & QUILL
  // ---------------------------------------------------------------------------

  // Angled Wooden Book Lectern on Front-Right Tabletop (x = 0.25, z = 0.24)
  const lecX = 0.25;
  const lecZ = 0.23;
  const lecFrame = frame([lecX, 0.87, lecZ], [0, 0.88, 0.47], [0, -0.47, 0.88]);

  // Lectern base wedge
  b.frustumBox([lecX, 0.82, lecZ - 0.08], [lecX, 0.89, lecZ - 0.08], [0.28, 0.14], [0.24, 0.04], {
    color: WOOD_DARK,
    bone: root,
    group: "books",
  });
  // Slanted lectern reading board
  b.part(new THREE.BoxGeometry(0.36, 0.018, 0.25), WOOD_MID, {
    frame: lecFrame,
    bone: root,
    group: "books",
  });
  // Open Grimoire Leather Cover (Cobalt Blue with Gold corner bosses)
  b.part(new THREE.BoxGeometry(0.34, 0.016, 0.23), LEATHER_NAVY, {
    at: lecFrame.local([0, 0.015, 0]),
    quat: lecFrame.quat,
    bone: root,
    group: "books",
  });
  // Spine ridge
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.235, 8), GOLD, {
    at: lecFrame.local([0, 0.016, 0]),
    dir: lecFrame.dir([0, 0, 1]),
    bone: root,
    group: "books",
  });
  // Left and Right Thick Parchment Page Blocks
  for (const side of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.152, 0.024, 0.21), PARCHMENT, {
      at: lecFrame.local([side * 0.082, 0.028, 0]),
      quat: lecFrame.quat,
      bone: root,
      group: "books",
    });
    // Illustrated Alchemy Diagram Page Decal on top of each page block
    b.part(new THREE.PlaneGeometry(0.144, 0.198), "#ffffff", {
      at: lecFrame.local([side * 0.082, 0.042, 0]),
      dir: lecFrame.dir([0, 1, 0]),
      up: lecFrame.dir([0, 0, -1]),
      axis: "z",
      texture: side < 0 ? TEX_GRIMOIRE_PAGE_L : TEX_GRIMOIRE_PAGE_R,
      bone: root,
      group: "books",
    });
  }
  // Gold bookmark ribbon & dangling tassel hanging from the open grimoire
  const ribbonCurve = bezier(
    lecFrame.local([0, 0.03, 0.10]),
    [lecX + 0.02, 0.83, lecZ + 0.15],
    [lecX + 0.04, 0.76, lecZ + 0.22],
    [lecX + 0.03, 0.69, lecZ + 0.23],
  );
  b.sweep(ribbonCurve, 0.007, CRIMSON_VELVET, { sides: 6, bone: root, group: "books" });

  // Helper to build closed ornate alchemy tomes with spine ribs and gold corners
  const buildClosedBook = (
    at: [number, number, number],
    size: [number, number, number],
    rotYDeg: number,
    coverPaint: ReturnType<typeof cel>,
    group = "books",
  ) => {
    const [w, h, d] = size;
    // Page block
    b.part(new THREE.BoxGeometry(w * 0.94, h * 0.78, d * 0.94), PARCHMENT, {
      at,
      rotation: [0, rotYDeg, 0],
      bone: root,
      group,
    });
    // Top and bottom covers
    for (const sy of [-1, 1]) {
      b.part(new THREE.BoxGeometry(w, h * 0.14, d), coverPaint, {
        at: [at[0], at[1] + sy * (h * 0.43), at[2]],
        rotation: [0, rotYDeg, 0],
        bone: root,
        group,
      });
    }
    // Spine back & gold clasp
    const rad = rotYDeg * (Math.PI / 180);
    const spineX = at[0] - Math.cos(rad) * (w * 0.48);
    const spineZ = at[2] + Math.sin(rad) * (w * 0.48);
    b.part(new THREE.BoxGeometry(h * 0.22, h, d), coverPaint, {
      at: [spineX, at[1], spineZ],
      rotation: [0, rotYDeg, 0],
      bone: root,
      group,
    });
    b.part(new THREE.BoxGeometry(0.024, h * 0.85, 0.032), GOLD, {
      at: [at[0] + Math.cos(rad) * (w * 0.48), at[1], at[2] - Math.sin(rad) * (w * 0.48)],
      rotation: [0, rotYDeg, 0],
      bone: root,
      group,
    });
  };

  // Stack of 3 Heavy Tomes on Front-Left Tabletop (x = -0.60, z = 0.22)
  buildClosedBook([-0.60, 0.848, 0.22], [0.24, 0.055, 0.18], 14, LEATHER_BURGUNDY, "booksTable");
  buildClosedBook([-0.59, 0.900, 0.21], [0.22, 0.048, 0.165], -8, LEATHER_TEAL, "booksTable");
  buildClosedBook([-0.61, 0.944, 0.22], [0.19, 0.040, 0.145], 22, LEATHER_NAVY, "booksTable");

  // Row of Upright & Leaning Books on the Hutch Shelves
  const shelfBooks = [
    { x: -0.18, z: -0.26, h: 0.21, d: 0.16, col: LEATHER_NAVY, tilt: 0 },
    { x: -0.13, z: -0.26, h: 0.23, d: 0.17, col: LEATHER_BURGUNDY, tilt: 0 },
    { x: -0.08, z: -0.26, h: 0.19, d: 0.15, col: LEATHER_TEAL, tilt: 0 },
    { x: -0.03, z: -0.26, h: 0.22, d: 0.16, col: LEATHER_BROWN, tilt: 0 },
    { x: 0.04, z: -0.26, h: 0.21, d: 0.16, col: LEATHER_NAVY, tilt: 16 },
  ];
  for (const sb of shelfBooks) {
    b.part(new THREE.BoxGeometry(0.044, sb.h, sb.d), sb.col, {
      at: [sb.x, 1.176 + sb.h / 2, sb.z],
      rotation: [0, 0, sb.tilt],
      bone: root,
      group: "booksShelf",
    });
    b.part(new THREE.BoxGeometry(0.048, 0.025, sb.d + 0.006), GOLD, {
      at: [sb.x, 1.176 + sb.h * 0.78, sb.z],
      rotation: [0, 0, sb.tilt],
      bone: root,
      group: "booksShelf",
    });
  }

  // Inkwell & Feather Quill beside the Grimoire Lectern (x = 0.02, z = 0.32)
  const inkX = 0.01;
  const inkZ = 0.33;
  b.lathe(
    [
      [0, 0],
      [0.032, 0, "sharp"],
      [0.038, 0.022],
      [0.022, 0.045, "sharp"],
      [0.026, 0.058, "sharp"],
      [0, 0.058, "sharp"],
    ],
    { at: [inkX, 0.82, inkZ], segments: 8, smoothing: 1, color: GOLD, bone: root, group: "books" },
  );
  // Feather quill shaft & plume
  const quillSpine = bezier(
    [inkX, 0.86, inkZ],
    [inkX - 0.03, 0.94, inkZ + 0.02],
    [inkX - 0.07, 1.01, inkZ + 0.05],
    [inkX - 0.11, 1.06, inkZ + 0.07],
  );
  b.sweep(quillSpine, [0.005, 0.002], GOLD, { sides: 6, bone: root, group: "books" });
  const plumeOutline: OutlinePoint[] = [
    [0, 0, "sharp"],
    [0.08, 0.025],
    [0.14, 0.018, "sharp"],
    [0.09, -0.022],
    [0.02, -0.015],
  ];
  b.extrude(plumeOutline, {
    at: [inkX - 0.03, 0.94, inkZ + 0.02],
    x: [-0.55, 0.72, 0.42],
    y: [0.6, 0.65, -0.45],
    thickness: 0.006,
    smoothing: 1,
    color: TEAL_SILK,
    bone: root,
    group: "books",
  });

  // ---------------------------------------------------------------------------
  // 7. MORTAR & PESTLE, HERBS, BOTANICAL JARS & HANGING DRYING BUNDLES
  // ---------------------------------------------------------------------------

  // Carved Stone & Gold Mortar and Pestle on Front-Left-Center Tabletop (x = -0.25, z = 0.28)
  const morX = -0.24;
  const morZ = 0.28;
  const mortarProfile: OutlinePoint[] = [
    [0, 0],
    [0.058, 0, "sharp"],
    [0.052, 0.022, "sharp"],
    [0.078, 0.055],
    [0.086, 0.098, "sharp"],
    [0.094, 0.112, "sharp"],
    [0.072, 0.112, "sharp"],
    [0.058, 0.048],
    [0, 0.038],
  ];
  b.lathe(mortarProfile, {
    at: [morX, 0.82, morZ],
    segments: 12,
    smoothing: 1,
    color: STONE_MORTAR,
    bone: root,
    group: "herbs",
  });
  // Gold rim band & 4 lug handles on the mortar
  b.part(new THREE.CylinderGeometry(0.091, 0.086, 0.018, 12), GOLD, {
    at: [morX, 0.915, morZ],
    bone: root,
    group: "herbs",
  });
  // Crushed glowing luminescent herb paste inside mortar bowl
  glow(
    b.part(new THREE.SphereGeometry(0.062, 10, 8), GLOW_DENDRO, {
      at: [morX, 0.875, morZ],
      scale: [1, 0.45, 1],
      bone: root,
      group: "herbs",
    }),
    1.3,
  );
  // Pestle resting diagonally out of the mortar
  b.capsule([morX - 0.01, 0.87, morZ - 0.01], [morX + 0.065, 0.985, morZ - 0.045], [0.024, 0.015], MARBLE_WHITE, {
    sides: 8,
    bone: root,
    group: "herbs",
  });
  b.part(new THREE.SphereGeometry(0.019, 8, 6), GOLD, {
    at: [morX + 0.068, 0.99, morZ - 0.047],
    bone: root,
    group: "herbs",
  });

  // Wooden Herb Cutting Tray with Fresh Sprigs & Berries beside Mortar (x = -0.42, z = 0.31)
  b.part(new THREE.BoxGeometry(0.18, 0.014, 0.13), WOOD_LIGHT, {
    at: [-0.43, 0.827, 0.32],
    rotation: [0, -12, 0],
    bone: root,
    group: "herbs",
  });
  // Small glowing berries and herb leaves on the cutting board
  for (const [bx, bz, col] of [
    [-0.45, 0.31, GLOW_GEO],
    [-0.42, 0.33, GLOW_GEO],
    [-0.44, 0.34, GLOW_ANEMO],
  ] as const) {
    glow(
      b.part(new THREE.SphereGeometry(0.013, 8, 6), col, {
        at: [bx, 0.844, bz],
        bone: root,
        group: "herbs",
      }),
      1.4,
    );
  }
  b.cards(
    [
      frame([-0.40, 0.838, 0.30], [0, 1, 0]),
      frame([-0.46, 0.838, 0.32], [0, 1, 0]),
    ],
    TEX_HERB_LEAF,
    {
      size: [0.045, 0.08],
      lean: 82,
      flow: [0.8, 0, 0.5],
      spin: 25,
      rng: rng(19),
      bone: root,
      group: "herbs",
    },
  );

  // Hanging Drying Herb Bundles under the Hutch Shelves & Arch
  const buildHerbBundle = (attachPos: [number, number, number], leafColor: ReturnType<typeof cel>, flowerGlow: string) => {
    const [hx, hy, hz] = attachPos;
    // Twine tie cord
    b.rod([hx, hy, hz], [hx, hy - 0.05, hz], 0.005, GOLD_DARK, {
      sides: 6,
      bone: root,
      group: "herbs",
    });
    // Knot collar
    b.part(new THREE.CylinderGeometry(0.018, 0.022, 0.022, 8), CORK, {
      at: [hx, hy - 0.055, hz],
      bone: root,
      group: "herbs",
    });
    // Clustered downward stems & leaves
    for (let k = 0; k < 5; k++) {
      const a = (k * Math.PI * 2) / 5;
      const sx = hx + Math.cos(a) * 0.026;
      const sz = hz + Math.sin(a) * 0.026;
      b.spike([hx, hy - 0.055, hz], [sx - hx, -0.14, sz - hz], 0.14, 0.016, {
        sides: 6,
        color: leafColor,
        bone: root,
        group: "herbs",
      });
    }
    // Glowing elemental blossom tips at bottom of bundle
    glow(
      b.part(new THREE.SphereGeometry(0.022, 8, 6), flowerGlow, {
        at: [hx, hy - 0.18, hz],
        scale: [1.2, 0.8, 1.2],
        bone: root,
        group: "herbs",
      }),
      1.4,
    );
    // Textured botanical leaf cards fanning around bundle
    b.cards([frame([hx, hy - 0.05, hz], [0, 1, 0])], TEX_HERB_LEAF, {
      size: [0.07, 0.14],
      lean: 175,
      flow: [0, 0, 1],
      cross: true,
      bone: root,
      group: "herbs",
    });
  };

  buildHerbBundle([-0.60, 1.45, -0.22], HERB_SAGE, GLOW_DENDRO);
  buildHerbBundle([0.60, 1.45, -0.22], HERB_LAVENDER, GLOW_ELECTRO);
  buildHerbBundle([-0.24, 1.45, -0.22], HERB_MINT, GLOW_ANEMO);
  buildHerbBundle([0.24, 1.45, -0.22], HERB_GOLD, GLOW_GEO);

  // Potted Glowing Cecilia / Mist Flower Planter on Top Shelf Left (x = -0.22, y = 1.476, z = -0.27)
  const potX = -0.22;
  const potY = 1.476;
  const potZ = -0.27;
  b.lathe(
    [
      [0, 0],
      [0.042, 0, "sharp"],
      [0.058, 0.055],
      [0.064, 0.085, "sharp"],
      [0.052, 0.085, "sharp"],
      [0, 0.072],
    ],
    { at: [potX, potY, potZ], segments: 10, smoothing: 1, color: PORCELAIN, bone: root, group: "herbs" },
  );
  b.part(new THREE.CylinderGeometry(0.066, 0.062, 0.016, 10), GOLD, {
    at: [potX, potY + 0.078, potZ],
    bone: root,
    group: "herbs",
  });
  // Lush leaf cards & glowing blossom in the planter
  const plantFrames = Array.from({ length: 6 }, (_, i) => {
    const a = (i * Math.PI * 2) / 6;
    return frame([potX + Math.cos(a) * 0.025, potY + 0.08, potZ + Math.sin(a) * 0.025], [Math.cos(a) * 0.5, 1, Math.sin(a) * 0.5]);
  });
  b.cards(plantFrames, TEX_GLOW_HERB, {
    size: [0.055, 0.11],
    lean: 35,
    bend: 25,
    vary: 0.15,
    rng: rng(55),
    bone: root,
    group: "herbs",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.032, 0), GLOW_ANEMO, {
      at: [potX, potY + 0.16, potZ],
      bone: root,
      group: "herbs",
    }),
    1.8,
  );

  // ---------------------------------------------------------------------------
  // 8. HANGING INCENSE CENSER, CANDELABRA & LOWER SHELF STORAGE PROPS
  // ---------------------------------------------------------------------------

  // Ornate Hanging Alchemy Censer on Right Hutch Arm (joint at [0.56, 1.72, -0.10])
  b.sweep(
    bezier([0.72, 1.62, -0.28], [0.68, 1.74, -0.20], [0.61, 1.75, -0.14], [0.56, 1.72, -0.10]),
    [0.018, 0.010],
    GOLD,
    { sides: 8, bone: root, group: "censer" },
  );
  // Censer chain & spherical pierced gold burner on censerJoint
  b.rod([0.56, 1.72, -0.10], [0.56, 1.56, -0.10], 0.005, GOLD, {
    sides: 6,
    bone: censerJoint,
    group: "censer",
  });
  b.lathe(
    [
      [0, 0],
      [0.022, 0.02],
      [0.058, 0.06],
      [0.064, 0.09, "sharp"],
      [0.048, 0.12],
      [0.018, 0.15, "sharp"],
      [0, 0.16],
    ],
    { at: [0.56, 1.42, -0.10], segments: 10, smoothing: 1, color: GOLD, bone: censerJoint, group: "censer" },
  );
  glow(
    b.part(new THREE.SphereGeometry(0.042, 8, 6), GLOW_ANEMO, {
      at: [0.56, 1.50, -0.10],
      bone: censerJoint,
      group: "censer",
    }),
    1.7,
  );
  b.cards([frame([0.56, 1.43, -0.10], [0, 1, 0])], TEX_TASSEL, {
    size: [0.04, 0.11],
    lean: 180,
    flow: [0, 0, 1],
    bone: censerJoint,
    group: "censer",
  });

  // melted Wax Candles with Glowing Flames on Left Pillar Corner (x = -0.70, z = 0.06)
  for (const [cx, cz, ch] of [
    [-0.71, 0.02, 0.11],
    [-0.66, 0.07, 0.075],
  ] as const) {
    b.part(new THREE.CylinderGeometry(0.026, 0.032, 0.016, 8), GOLD, {
      at: [cx, 0.828, cz],
      bone: root,
      group: "candles",
    });
    b.part(new THREE.CylinderGeometry(0.018, 0.020, ch, 8), WAX_CREAM, {
      at: [cx, 0.836 + ch / 2, cz],
      bone: root,
      group: "candles",
    });
    glow(
      b.spike([cx, 0.836 + ch, cz], [0, 1, 0], 0.036, 0.011, {
        sides: 6,
        color: GLOW_PYRO,
        bone: root,
        group: "candles",
      }),
      2.0,
    );
  }

  // Lower Stretcher Shelf Props (y = 0.204): Herb Chest with Hinged Lid, Ceramic Demijohn Jug, Scroll Basket & Geode
  // 1) Wooden Herb Chest on Lower Left (x = -0.46, y = 0.204, z = 0.02)
  b.part(new THREE.BoxGeometry(0.34, 0.14, 0.24), WOOD_DARK, {
    at: [-0.46, 0.274, 0.02],
    bone: root,
    group: "lowerShelfProps",
  });
  b.part(new THREE.BoxGeometry(0.35, 0.025, 0.25), GOLD, {
    at: [-0.46, 0.218, 0.02],
    bone: root,
    group: "lowerShelfProps",
  });
  // Hinged Chest Lid
  b.part(new THREE.BoxGeometry(0.35, 0.05, 0.25), WOOD_LIGHT, {
    at: [-0.46, 0.365, 0.02],
    bone: chestLidJoint,
    group: "lowerShelfProps",
  });
  b.part(new THREE.BoxGeometry(0.06, 0.06, 0.025), GOLD, {
    at: [-0.46, 0.345, 0.148],
    bone: chestLidJoint,
    group: "lowerShelfProps",
  });

  // 2) Large Braided Ceramic Alchemist Carboy / Demijohn on Lower Center (x = 0.02, y = 0.204, z = -0.02)
  b.lathe(
    [
      [0, 0],
      [0.09, 0, "sharp"],
      [0.135, 0.09],
      [0.125, 0.20],
      [0.055, 0.27],
      [0.038, 0.32, "sharp"],
      [0.048, 0.34, "sharp"],
      [0, 0.34, "sharp"],
    ],
    { at: [0.02, 0.204, -0.02], segments: 12, smoothing: 1, color: TEAL_SILK, bone: root, group: "lowerShelfProps" },
  );
  b.part(new THREE.CylinderGeometry(0.132, 0.128, 0.035, 12), GOLD, {
    at: [0.02, 0.35, -0.02],
    bone: root,
    group: "lowerShelfProps",
  });
  b.part(new THREE.CylinderGeometry(0.035, 0.028, 0.04, 8), CORK, {
    at: [0.02, 0.555, -0.02],
    bone: root,
    group: "lowerShelfProps",
  });

  // 3) Glowing Raw Elemental Geode Cluster & Scroll Cylinder on Lower Right (x = 0.44, y = 0.204, z = 0.04)
  b.part(new THREE.CylinderGeometry(0.11, 0.13, 0.05, 8), STONE_MORTAR, {
    at: [0.44, 0.229, 0.04],
    bone: root,
    group: "lowerShelfProps",
  });
  for (const [dx, dz, dir, len, r, col] of [
    [0, 0, [0.1, 1, 0.15], 0.22, 0.042, GLOW_ANEMO],
    [-0.04, 0.02, [-0.35, 0.9, 0.2], 0.17, 0.034, GLOW_HYDRO],
    [0.04, -0.02, [0.35, 0.85, -0.2], 0.16, 0.032, GLOW_ANEMO],
    [0.02, 0.04, [0.15, 0.75, 0.45], 0.13, 0.026, GLOW_CELESTIAL],
  ] as const) {
    glow(
      b.spike([0.44 + dx, 0.24, 0.04 + dz], dir, len, r, {
        sides: 6,
        color: col,
        bone: root,
        group: "lowerShelfProps",
      }),
      1.6,
    );
  }

  // Side Herb & Scroll Rack attached to Right Leg Frame (on cabinetDoorJoint at x = 0.81, y = 0.38, z = 0)
  b.part(new THREE.BoxGeometry(0.12, 0.26, 0.42), WOOD_MID, {
    at: [0.79, 0.38, 0],
    bone: cabinetDoorJoint,
    group: "sideRack",
  });
  b.part(new THREE.BoxGeometry(0.02, 0.22, 0.36), GOLD, {
    at: [0.855, 0.38, 0],
    bone: cabinetDoorJoint,
    group: "sideRack",
  });
  // Rolled scrolls sticking out of the side rack
  for (const [sz, sh] of [
    [-0.09, 0.18],
    [0.0, 0.21],
    [0.09, 0.16],
  ] as const) {
    b.rod([0.79, 0.48, sz], [0.83, 0.48 + sh, sz + 0.02], 0.022, PARCHMENT, {
      sides: 8,
      bone: cabinetDoorJoint,
      group: "sideRack",
    });
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.016, 8), GOLD, {
      at: [0.81, 0.48 + sh * 0.5, sz + 0.01],
      bone: cabinetDoorJoint,
      group: "sideRack",
    });
  }

  return b.root;
}
