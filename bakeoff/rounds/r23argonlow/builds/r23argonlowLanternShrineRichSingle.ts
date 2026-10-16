import * as THREE from "three";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, furEdge, INK, inkLines, zigzag } from "../../../../kits/toon";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { DEG, offset, rng } from "../../../../src/math";
import type { V3 } from "../../../../src/math";
import { grain, mottle, noise, paint, scales } from "../../../../src/paint";
import { bezier, catmull, polyline } from "../../../../src/path";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Roadside Lantern Shrine",
  description:
    "Genshin Impact inspired cel-shaded roadside shrine with a vermilion and violet-gold torii gate, sacred shimenawa rope with paper shide and brass bell, wooden hokora sanctuary with hinged doors, floating elemental lanterns, kitsune guardian statue, stone toro lantern, bamboo purifying basin, ema prayer rack, and offering trays.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "lanternShrine", detail: 1, paintSize: 2048 });

  // ---------------------------------------------------------------------------
  // Cel-shaded Genshin Impact Palette & Surface Paints
  // ---------------------------------------------------------------------------
  const LACQUER_RED = cel(
    grain("#d9322c", "#be2222", { size: 0.09, axis: "y", seed: 11 }),
    "#8e1828",
  );
  const LACQUER_RED_H = cel(
    grain("#df3830", "#c42626", { size: 0.09, axis: "x", seed: 12 }),
    "#911a2a",
  );
  const DARK_WOOD = cel(
    grain("#3c2536", "#2c1928", { size: 0.07, axis: "y", seed: 21 }),
    "#1e101d",
  );
  const WARM_WOOD = cel(
    grain("#9e6440", "#824e30", { size: 0.06, axis: "y", seed: 22 }),
    "#5c3322",
  );
  const LIGHT_WOOD = cel(
    grain("#cfa36e", "#b88954", { size: 0.05, axis: "x", seed: 23 }),
    "#8f643c",
  );

  // Ornate gold filigree & brass trims
  const GOLD = cel("#f7ca54", "#c28624", { threshold: 0.02 });
  const PALE_GOLD = cel("#ffe58f", "#d49b35", { threshold: -0.05 });
  const BRONZE = cel("#6e533b", "#453024");

  // Inazuma / Liyue roof tiles: indigo-violet slate with cel shading & scalloped tile pattern
  const ROOF_SLATE = cel(
    scales(["#2d2846", "#352f52", "#26223d"], "#19152b", {
      size: 0.065,
      width: 0.14,
      seed: 31,
    }),
    "#18142b",
  );
  const ROOF_RIDGE = cel("#3f395e", "#231e3b");

  // Stone with moss countershading
  const STONE_BASE = cel(
    mottle("#8b8e9e", "#76798a", { size: 0.16, seed: 41 }),
    "#56586b",
  );
  const MOSS_TOP = cel(
    mottle("#5ec467", "#3fa352", { size: 0.12, seed: 42 }),
    "#2a7542",
  );
  const MOSSY_STONE = furEdge(MOSS_TOP, STONE_BASE, {
    axis: [0, 1, 0],
    level: 0.58,
    teeth: 0.18,
    period: 0.09,
    along: [1, 0, 1],
    ink: "#254d32",
    inkWidth: 0.04,
  });
  const CARVED_STONE = inkLines(STONE_BASE, {
    levels: [-0.45, 0.45],
    axis: [0, 1, 0],
    width: 0.05,
    ink: "#434457",
  });

  // Earth and stepping stones
  const EARTH_MOSS = cel(
    paint((p) => {
      const r = Math.hypot(p.x, p.z * 1.15);
      const n = noise(p, 0.25, 55);
      if (r + (n - 0.5) * 0.22 > 0.96) return "#6b5548";
      return n > 0.46 ? "#4eb35b" : "#3d944e";
    }),
    "#285c39",
  );

  // Sacred rope (shimenawa) with spiral straw braid
  const ROPE_PAINT = cel(
    paint((_p, _n, s) => {
      const stripe = (((s[1] - 1080 * s[0]) % 90) + 90) % 90;
      if (stripe < 14) return "#9e7339";
      return stripe < 52 ? "#f0cf86" : "#d9b062";
    }),
    "#a87c3d",
  );

  // Ceramic, offerings, bamboo, fabric
  const CERAMIC_WHITE = cel("#f7f4fb", "#cbc3dc");
  const CERAMIC_BLUE = cel("#4373c4", "#29488a");
  const BAMBOO_GREEN = cel(
    grain("#76c758", "#5da844", { size: 0.05, axis: "y", seed: 61 }),
    "#3d7833",
  );
  const RED_CLOTH = cel(
    paint((p) => (zigzag(p.x / 0.04 + p.z / 0.04) > 0.72 ? "#ffd15c" : "#e02f3b")),
    "#96192b",
  );
  const VIOLET_SILK = cel("#7c4dff", "#4b28a8");
  const DANGO_PINK = cel("#ff9ebb", "#d66b8d");
  const DANGO_WHITE = cel("#fff7fa", "#d9cde0");
  const DANGO_GREEN = cel("#8ce077", "#5aa84a");
  const MANDARIN = cel("#ff8819", "#c95308");
  const FOX_STONE = cel(
    furEdge("#ebe7f2", "#cfc8de", {
      level: 0.1,
      teeth: 0.2,
      period: 0.05,
    }),
    "#9c94b3",
  );

  // Flat emissive colours (for glow() — painted surfaces cannot glow)
  const GLOW_AMBER = "#ffaa33";
  const GLOW_GOLD = "#ffe680";
  const GLOW_ELECTRO = "#c57aff";
  const GLOW_ELECTRO_CORE = "#f0d4ff";
  const GLOW_ANEMO = "#5effd8";
  const GLOW_WATER = "#4de8ff";

  // ---------------------------------------------------------------------------
  // SVG Textures & Cards
  // ---------------------------------------------------------------------------
  // 1. Paper lantern facade with gold filigree frame and glowing warm + electro symbol
  const LANTERN_PANEL_TEX = svg(
    `<svg viewBox="0 0 128 192">
      <rect x="0" y="0" width="128" height="192" fill="#ff9e2c"/>
      <rect x="10" y="12" width="108" height="168" rx="8" fill="#ffd269"/>
      <ellipse cx="64" cy="96" rx="42" ry="64" fill="#fff3b8"/>
      <!-- Gold lattice borders -->
      <rect x="6" y="8" width="116" height="176" rx="6" fill="none" stroke="#8c4312" stroke-width="6"/>
      <path d="M6 42 H122 M6 150 H122 M28 8 V184 M100 8 V184" stroke="#a65218" stroke-width="3.5"/>
      <!-- Corner knotwork -->
      <path d="M6 26 H28 M100 26 H122 M6 166 H28 M100 166 H122" stroke="#8c4312" stroke-width="3"/>
      <!-- Sacred Genshin-style four-point star / crest -->
      <path d="M64 48 L73 84 L104 96 L73 108 L64 144 L55 108 L24 96 L55 84 Z" fill="#ff6a1a"/>
      <path d="M64 58 L70 87 L94 96 L70 105 L64 134 L58 105 L34 96 L58 87 Z" fill="#fffbe0"/>
      <circle cx="64" cy="96" r="8" fill="#d94bff"/>
      <circle cx="64" cy="96" r="18" fill="none" stroke="#b84a14" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  // 2. Paper shide (zig-zag lightning paper streamers) with gold trim
  const SHIDE_TEX = svg(
    `<svg viewBox="0 0 64 128">
      <path d="M26 0 H44 L36 30 H52 L38 64 H56 L40 98 H54 L34 128 H18 L32 98 H16 L30 64 H12 L26 30 H14 Z"
            fill="#fcfaff" stroke="#2d1a42" stroke-width="3" stroke-linejoin="round"/>
      <path d="M31 8 L25 26 H41 L29 58 H45 L31 92 H43 L27 120"
            fill="none" stroke="#f5c542" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="33" cy="14" r="3.5" fill="#d94bff"/>
    </svg>`,
    { size: 256 },
  );

  // 3. Ornate golden silk tassel with mystic knot
  const TASSEL_TEX = svg(
    `<svg viewBox="0 0 64 160">
      <!-- Cord -->
      <rect x="29" y="0" width="6" height="26" fill="#d9322c"/>
      <!-- Mystic Pan-Chang Knot -->
      <path d="M32 18 L48 34 L32 50 L16 34 Z" fill="#e62e3a" stroke="#22112f" stroke-width="3"/>
      <path d="M32 24 L42 34 L32 44 L22 34 Z" fill="none" stroke="#ffd257" stroke-width="3"/>
      <circle cx="16" cy="34" r="5" fill="#e62e3a" stroke="#ffd257" stroke-width="2.5"/>
      <circle cx="48" cy="34" r="5" fill="#e62e3a" stroke="#ffd257" stroke-width="2.5"/>
      <!-- Gold cap -->
      <rect x="20" y="50" width="24" height="12" rx="4" fill="#ffd257" stroke="#22112f" stroke-width="3"/>
      <!-- Flowing silk fringe -->
      <path d="M22 62 L14 152 H50 L42 62 Z" fill="#ff3b4b" stroke="#22112f" stroke-width="3"/>
      <path d="M26 62 L21 152 M32 62 V152 M38 62 L43 152" stroke="#ffd257" stroke-width="2.8"/>
      <rect x="15" y="138" width="34" height="7" fill="#ffd257"/>
    </svg>`,
    { size: 256 },
  );

  // 4. Ofuda paper talisman seal
  const OFUDA_TEX = svg(
    `<svg viewBox="0 0 64 160">
      <rect x="6" y="4" width="52" height="152" rx="4" fill="#fff7e6" stroke="#2c1928" stroke-width="4"/>
      <rect x="12" y="10" width="40" height="140" fill="none" stroke="#d9322c" stroke-width="3"/>
      <circle cx="32" cy="34" r="11" fill="#d9322c"/>
      <path d="M32 23 L35 31 L43 34 L35 37 L32 45 L29 37 L21 34 L29 31 Z" fill="#fff7e6"/>
      <path d="M22 58 H42 M32 52 V132 M20 74 Q32 66 44 74 M22 92 L42 104 M42 92 L22 104 M20 120 H44"
            stroke="#2c1928" stroke-width="4.5" stroke-linecap="round"/>
      <circle cx="32" cy="88" r="4" fill="#b76eff"/>
      <circle cx="32" cy="136" r="5" fill="#d9322c"/>
    </svg>`,
    { size: 256 },
  );

  // 5. Ema wooden wishing plaque face
  const EMA_TEX = svg(
    `<svg viewBox="0 0 128 96">
      <path d="M64 6 L120 34 V88 H8 V34 Z" fill="#f2cfa0" stroke="#4a2b18" stroke-width="6" stroke-linejoin="round"/>
      <path d="M64 12 L114 37 V44 L64 19 L14 44 V37 Z" fill="#d9322c"/>
      <circle cx="64" cy="24" r="5" fill="#ffd257"/>
      <!-- Kitsune & blossom motif -->
      <circle cx="88" cy="62" r="14" fill="#ff6b8b"/>
      <circle cx="88" cy="62" r="6" fill="#fff0f5"/>
      <path d="M30 74 Q42 44 58 64 Q46 80 30 74 Z" fill="#ffffff" stroke="#d9322c" stroke-width="3"/>
      <path d="M26 52 L34 64 L42 48" fill="#d9322c"/>
      <path d="M66 50 V78 M56 62 H74" stroke="#3c2218" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  // 6. Glowing elemental shrine seal / crest
  const SEAL_TEX = svg(
    `<svg viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="56" fill="none" stroke="#e2a8ff" stroke-width="5"/>
      <circle cx="64" cy="64" r="44" fill="none" stroke="#b96eff" stroke-width="3" stroke-dasharray="10 6"/>
      <!-- Three-fold electro / mitsudomoe inspired swirl + star -->
      <path d="M64 12 L74 54 L116 64 L74 74 L64 116 L54 74 L12 64 L54 54 Z" fill="#d48aff"/>
      <path d="M64 24 L70 58 L104 64 L70 70 L64 104 L58 70 L24 64 L58 58 Z" fill="#ffffff"/>
      <circle cx="64" cy="64" r="14" fill="#9c42ff"/>
      <circle cx="64" cy="64" r="7" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  // 7. Sakura petal & glowing spirit leaf card
  const SAKURA_BRANCH_TEX = svg(
    `<svg viewBox="0 0 128 128">
      <!-- Twigs -->
      <path d="M64 124 Q60 80 32 42 M62 96 Q84 68 104 48 M52 72 Q36 68 18 76"
            stroke="#4a2533" stroke-width="5" stroke-linecap="round" fill="none"/>
      <!-- Blossoms -->
      <g fill="#ffb0d0" stroke="#d45b88" stroke-width="2.5">
        <circle cx="32" cy="38" r="18"/>
        <circle cx="20" cy="48" r="14"/>
        <circle cx="46" cy="46" r="14"/>
        <circle cx="98" cy="46" r="18"/>
        <circle cx="84" cy="36" r="14"/>
        <circle cx="106" cy="62" r="13"/>
        <circle cx="62" cy="56" r="20"/>
        <circle cx="50" cy="68" r="15"/>
        <circle cx="76" cy="66" r="15"/>
        <circle cx="22" cy="76" r="14"/>
      </g>
      <g fill="#fff0f6">
        <circle cx="32" cy="38" r="7"/>
        <circle cx="98" cy="46" r="7"/>
        <circle cx="62" cy="56" r="8"/>
        <circle cx="22" cy="76" r="5"/>
      </g>
      <g fill="#ffdf70">
        <circle cx="32" cy="38" r="3.5"/>
        <circle cx="98" cy="46" r="3.5"/>
        <circle cx="62" cy="56" r="4"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  // 8. Stylized cel-shaded grass & fern tuft card
  const GRASS_CARD_TEX = svg(
    `<svg viewBox="0 0 96 96">
      <path d="M48 96 Q36 58 14 22 Q38 46 46 96 Z" fill="#3da654" stroke="#1e4d2b" stroke-width="2.5"/>
      <path d="M48 96 Q48 48 44 8 Q56 46 52 96 Z" fill="#68db6e" stroke="#1e4d2b" stroke-width="2.5"/>
      <path d="M50 96 Q64 56 84 20 Q62 48 48 96 Z" fill="#4ec25e" stroke="#1e4d2b" stroke-width="2.5"/>
      <path d="M44 96 Q24 68 6 52 Q28 62 46 96 Z" fill="#2e8746"/>
      <path d="M52 96 Q72 68 90 50 Q68 62 50 96 Z" fill="#68db6e"/>
      <circle cx="44" cy="14" r="3.5" fill="#a8ffcf"/>
      <circle cx="80" cy="24" r="3" fill="#a8ffcf"/>
    </svg>`,
    { size: 256 },
  );

  // 9. Fallen sakura petal / ginkgo leaf card for ground
  const PETAL_CARD_TEX = svg(
    `<svg viewBox="0 0 64 64">
      <path d="M32 58 C12 48 8 24 22 10 C27 6 31 14 32 18 C33 14 37 6 42 10 C56 24 52 48 32 58 Z"
            fill="#ff9ec4" stroke="#c94b7c" stroke-width="3"/>
      <path d="M32 52 V24" stroke="#ffeef5" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );

  // 10. Kitsune anime eye
  const FOX_EYE_TEX = animeEye({
    iris: "#b85cff",
    irisLight: "#f2c4ff",
    irisDark: "#4b187a",
    blush: "#ff7aa6",
  });

  // ---------------------------------------------------------------------------
  // Root & Hinge Skeleton (Prop Group: joints for moving/hanging parts)
  // ---------------------------------------------------------------------------
  const root = b.joint("shrineRoot", { at: [0, 0, 0] });

  // ---------------------------------------------------------------------------
  // 1. Stepped Roadside Stone Plinth, Cobbles & Retaining Curb
  // ---------------------------------------------------------------------------
  // Base earth mound sitting firmly on y = 0
  const baseMound = b.lathe(
    [
      [0, 0],
      [1.26, 0],
      [1.24, 0.055],
      [1.14, 0.11],
      [0, 0.11],
    ],
    {
      at: [0, 0, 0],
      segments: 16,
      color: EARTH_MOSS,
      bone: root,
      group: "plinth",
      name: "earthMound",
    },
  );

  // Outer carved stone border curb ring (14 heavy stone blocks around the perimeter)
  const curbCount = 14;
  for (let i = 0; i < curbCount; i++) {
    const a = (i / curbCount) * Math.PI * 2;
    // Leave front gap for stairs (around angle PI/2 in X-Z where +Z is front)
    const cx = Math.sin(a) * 1.15;
    const cz = Math.cos(a) * 1.02;
    if (cz > 0.72 && Math.abs(cx) < 0.44) continue;
    const w = 0.42 + (i % 2) * 0.05;
    const h = 0.13 + (i % 3) * 0.018;
    b.part(new THREE.BoxGeometry(w, h, 0.18), MOSSY_STONE, {
      bone: root,
      at: [cx, h / 2, cz],
      dir: [cx, 0, cz],
      axis: "z",
      flat: true,
      group: "plinth",
    });
  }

  // Raised Upper Sanctuary Terrace (under Torii and Hokora)
  b.frustumBox([0, 0, -0.14], [0, 0.22, -0.14], [1.92, 1.32], [1.84, 1.24], {
    up: [0, 0, 1],
    color: CARVED_STONE,
    bone: root,
    group: "plinth",
    name: "terraceBase",
  });
  // Top slab lip of terrace with mossy rim
  b.frustumBox([0, 0.21, -0.14], [0, 0.26, -0.14], [1.9, 1.3], [1.88, 1.28], {
    up: [0, 0, 1],
    color: MOSSY_STONE,
    bone: root,
    group: "plinth",
    name: "terraceCap",
  });

  // Three Front Stone Steps leading up from y = 0 at +Z to the terrace
  const stepsData: Array<{ z: number; y: number; w: number; d: number }> = [
    { z: 0.88, y: 0.08, w: 0.88, d: 0.28 },
    { z: 0.69, y: 0.155, w: 0.82, d: 0.26 },
    { z: 0.51, y: 0.23, w: 0.76, d: 0.24 },
  ];
  for (const [idx, st] of stepsData.entries()) {
    b.part(new THREE.BoxGeometry(st.w, st.y, st.d), MOSSY_STONE, {
      bone: root,
      at: [0, st.y / 2, st.z],
      flat: true,
      group: "steps",
      name: `step${idx + 1}`,
    });
  }
  // Stepped side cheek-walls (stone balustrades flanking the steps)
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0, "sharp"],
        [0.64, 0, "sharp"],
        [0.64, 0.14, "sharp"],
        [0.24, 0.31, "sharp"],
        [0, 0.31, "sharp"],
      ],
      {
        at: [s * 0.45, 0, 0.44],
        x: [0, 0, 1],
        thickness: 0.1,
        bevel: 0.015,
        color: CARVED_STONE,
        bone: root,
        group: "steps",
      },
    );
    // Gold-capped stone newel post at the front of each balustrade
    const postX = s * 0.45;
    const postZ = 0.98;
    b.part(new THREE.BoxGeometry(0.13, 0.22, 0.13), CARVED_STONE, {
      bone: root,
      at: [postX, 0.11, postZ],
      flat: true,
      group: "steps",
    });
    b.lathe(
      [
        [0, 0],
        [0.075, 0],
        [0.08, 0.03],
        [0.05, 0.06],
        [0.055, 0.09],
        [0, 0.13],
      ],
      {
        at: [postX, 0.22, postZ],
        segments: 8,
        color: GOLD,
        bone: root,
        group: "steps",
      },
    );
  }

  // Flagstone paving slabs on the terrace and foreground path
  const flagstones: Array<[number, number, number, number, number, number]> = [
    [0, 0.265, 0.24, 0.48, 0.025, 0.28],
    [0, 0.265, -0.08, 0.52, 0.025, 0.3],
    [-0.48, 0.265, 0.16, 0.34, 0.025, 0.26],
    [0.48, 0.265, 0.16, 0.34, 0.025, 0.26],
    [-0.58, 0.265, -0.22, 0.38, 0.025, 0.32],
    [0.58, 0.265, -0.22, 0.38, 0.025, 0.32],
    [0, 0.015, 1.12, 0.56, 0.03, 0.22],
  ];
  for (const [fx, fy, fz, fw, fh, fd] of flagstones) {
    b.part(new THREE.BoxGeometry(fw, fh, fd), STONE_BASE, {
      bone: root,
      at: [fx, fy, fz],
      flat: true,
      group: "plinth",
    });
  }

  // ---------------------------------------------------------------------------
  // 2. Grand Genshin-Style Torii Gate (Spanning the Front of the Terrace)
  // ---------------------------------------------------------------------------
  const toriiZ = 0.22;
  const pillarX = 0.72;
  const baseY = 0.25;
  const pillarTopY = 2.18;

  for (const s of [1, -1]) {
    const px = s * pillarX;
    // Black-bronze & stone carved pedestal base (kamebara)
    b.lathe(
      [
        [0, 0],
        [0.16, 0],
        [0.16, 0.08],
        [0.13, 0.12],
        [0.12, 0.24],
        [0, 0.24],
      ],
      {
        at: [px, baseY, toriiZ],
        segments: 8,
        color: DARK_WOOD,
        bone: root,
        group: "torii",
      },
    );
    // Lower ornate gold collar ring with cloud-scroll flange
    b.lathe(
      [
        [0, 0],
        [0.128, 0],
        [0.135, 0.04],
        [0.115, 0.08],
        [0.115, 0.16],
        [0.125, 0.18],
        [0, 0.18],
      ],
      {
        at: [px, baseY + 0.22, toriiZ],
        segments: 12,
        color: GOLD,
        bone: root,
        group: "torii",
      },
    );

    // Main vermilion pillar (hashira) with subtle inward cant
    const topX = s * (pillarX - 0.04);
    b.rod([px, baseY + 0.2, toriiZ], [topX, pillarTopY, toriiZ], [0.098, 0.084], {
      sides: 12,
      color: LACQUER_RED,
      bone: root,
      group: "torii",
      name: `toriiPillar${s > 0 ? "L" : "R"}`,
    });

    // Mid-pillar gold band & nuki tenon wedge
    const nukiY = 1.68;
    const midX = s * (pillarX - 0.028);
    b.rod([midX, nukiY - 0.12, toriiZ], [midX, nukiY + 0.12, toriiZ], 0.095, {
      sides: 12,
      color: GOLD,
      bone: root,
      group: "torii",
    });
    // Upper capital gold sleeve (daiwa)
    b.lathe(
      [
        [0, 0],
        [0.094, 0],
        [0.112, 0.05],
        [0.112, 0.11],
        [0, 0.11],
      ],
      {
        at: [topX, pillarTopY - 0.12, toriiZ],
        segments: 12,
        color: GOLD,
        bone: root,
        group: "torii",
      },
    );

    // Decorative side corbel brackets under the nuki tie-beam
    b.extrude(
      [
        [0, 0, "sharp"],
        [0.18, 0.02, "sharp"],
        [0.22, 0.11],
        [0.1, 0.14],
        [0, 0.18, "sharp"],
      ],
      {
        at: [midX + s * 0.07, nukiY - 0.16, toriiZ],
        x: [s, 0, 0],
        thickness: 0.06,
        bevel: 0.01,
        smoothing: 1,
        color: GOLD,
        bone: root,
        group: "torii",
      },
    );
  }

  // Lower horizontal tie-beam (Nuki) piercing both pillars
  const nukiY = 1.68;
  b.frustumBox([-1.06, nukiY, toriiZ], [1.06, nukiY, toriiZ], [0.09, 0.12], [0.09, 0.12], {
    up: [0, 1, 0],
    color: LACQUER_RED_H,
    bone: root,
    group: "torii",
    name: "toriiNuki",
  });
  // Gold end-caps on the nuki tips
  for (const s of [1, -1]) {
    b.frustumBox(
      [s * 0.96, nukiY, toriiZ],
      [s * 1.09, nukiY, toriiZ],
      [0.102, 0.132],
      [0.115, 0.148],
      {
        up: [0, 1, 0],
        color: GOLD,
        bone: root,
        group: "torii",
      },
    );
  }

  // Shimaki (secondary beam directly under the curved kasagi lintel)
  const shimakiCurve = bezier(
    [-1.16, 2.22, toriiZ],
    [-0.4, 2.09, toriiZ],
    [0.4, 2.09, toriiZ],
    [1.16, 2.22, toriiZ],
  );
  b.sweep(shimakiCurve, () => [0.068, 0.065], {
    section: "box",
    up: [0, 1, 0],
    caps: "flat",
    color: LACQUER_RED_H,
    bone: root,
    group: "torii",
    name: "toriiShimaki",
  });

  // Main sweeping top lintel (Kasagi) with dramatic upturned wingtips & roof slate cap
  const kasagiCurve = bezier(
    [-1.32, 2.38, toriiZ],
    [-0.45, 2.18, toriiZ],
    [0.45, 2.18, toriiZ],
    [1.32, 2.38, toriiZ],
  );
  b.sweep(
    kasagiCurve,
    (t) => {
      const flare = 1 + 0.38 * Math.pow(Math.abs(t - 0.5) * 2, 2);
      return [0.115 * flare, 0.082 * flare];
    },
    {
      section: "box",
      up: [0, 1, 0],
      caps: "flat",
      color: ROOF_SLATE,
      bone: root,
      group: "torii",
      name: "toriiKasagi",
    },
  );

  // Gold ridge crest running along top of kasagi
  const kasagiRidgeCurve = bezier(
    [-1.34, 2.46, toriiZ],
    [-0.45, 2.25, toriiZ],
    [0.45, 2.25, toriiZ],
    [1.34, 2.46, toriiZ],
  );
  b.sweep(
    kasagiRidgeCurve,
    (t) => {
      const flare = 1 + 0.45 * Math.pow(Math.abs(t - 0.5) * 2, 2.2);
      return [0.055 * flare, 0.032 * flare];
    },
    {
      section: "box",
      up: [0, 1, 0],
      caps: "point",
      color: GOLD,
      bone: root,
      group: "torii",
    },
  );

  // Ornate upturned gold cloud-scroll finials at the kasagi wingtips
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0, "sharp"],
        [0.16, 0.04],
        [0.26, 0.18, "sharp"],
        [0.14, 0.24],
        [0.02, 0.14],
      ],
      {
        at: [s * 1.22, 2.36, toriiZ],
        x: [s, 0, 0],
        thickness: 0.07,
        bevel: 0.015,
        smoothing: 1,
        color: GOLD,
        bone: root,
        group: "torii",
      },
    );
  }

  // Central Gakuzuka plaque (framed tablet between nuki and shimaki)
  const plaqueY = 1.94;
  b.part(new THREE.BoxGeometry(0.32, 0.42, 0.09), GOLD, {
    bone: root,
    at: [0, plaqueY, toriiZ],
    flat: true,
    group: "torii",
  });
  b.part(new THREE.BoxGeometry(0.25, 0.35, 0.105), DARK_WOOD, {
    bone: root,
    at: [0, plaqueY, toriiZ],
    flat: true,
    group: "torii",
  });
  // Glowing Electro emblem on front and back of the torii plaque
  for (const dirZ of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.22, 0.22), "#ffffff", {
        bone: root,
        at: [0, plaqueY, toriiZ + dirZ * 0.056],
        dir: [0, 0, dirZ],
        axis: "z",
        texture: SEAL_TEX,
        group: "torii",
      }),
      1.6,
    );
  }

  // ---------------------------------------------------------------------------
  // 3. Sacred Shimenawa Rope, Suzu Bell (Hinged) & Paper Shide
  // ---------------------------------------------------------------------------
  const ropeY = 1.56;
  const ropeZ = toriiZ + 0.085;
  const shimenawaPath = catmull([
    [-0.86, ropeY + 0.04, ropeZ],
    [-0.46, ropeY - 0.07, ropeZ + 0.02],
    [0, ropeY - 0.11, ropeZ + 0.03],
    [0.46, ropeY - 0.07, ropeZ + 0.02],
    [0.86, ropeY + 0.04, ropeZ],
  ]);
  b.sweep(
    shimenawaPath,
    (t) => {
      const belly = Math.sin(t * Math.PI);
      return 0.024 + 0.048 * belly;
    },
    {
      sides: 10,
      caps: "point",
      color: ROPE_PAINT,
      bone: root,
      group: "shimenawa",
      name: "shimenawaRope",
    },
  );

  // Gold rope bindings along the shimenawa
  for (const rt of [0.18, 0.36, 0.5, 0.64, 0.82]) {
    const pt = shimenawaPath.at(rt);
    const tan = shimenawaPath.tangentAt(rt);
    const r = 0.028 + 0.048 * Math.sin(rt * Math.PI);
    b.rod(offset(pt, tan, -0.018), offset(pt, tan, 0.018), r, {
      sides: 10,
      color: GOLD,
      bone: root,
      group: "shimenawa",
    });
  }

  // Paper shide zig-zag streamers hanging from the shimenawa
  const shideFrames = [0.2, 0.35, 0.65, 0.8].map((rt) => {
    const pt = shimenawaPath.at(rt);
    return frame([pt.x, pt.y - 0.02, pt.z + 0.015], [0, 1, 0]);
  });
  b.cards(shideFrames, SHIDE_TEX, {
    size: [0.13, 0.26],
    lean: 180,
    flow: [0, 0, 1],
    bone: root,
    group: "shimenawa",
    name: "shideCards",
  });

  // Hinged Sacred Suzu Bell hanging at the center of the shimenawa
  const bellJoint = b.joint("suzuBellHinge", {
    parent: root,
    at: [0, ropeY - 0.13, ropeZ + 0.03],
    dir: [0, -1, 0],
    role: "hinge",
    group: "shimenawa",
  });
  b.lathe(
    [
      [0, 0],
      [0.035, 0],
      [0.095, 0.05],
      [0.105, 0.11],
      [0.085, 0.16],
      [0.03, 0.19],
      [0, 0.2],
    ],
    {
      at: [0, ropeY - 0.31, ropeZ + 0.03],
      segments: 12,
      color: GOLD,
      bone: bellJoint,
      group: "shimenawa",
      name: "suzuBell",
    },
  );
  // Equatorial rim on the suzu bell
  b.lathe(
    [
      [0, 0],
      [0.118, 0],
      [0.118, 0.022],
      [0, 0.022],
    ],
    {
      at: [0, ropeY - 0.21, ropeZ + 0.03],
      segments: 12,
      color: BRONZE,
      bone: bellJoint,
      group: "shimenawa",
    },
  );
  // Braided red-and-white bell pull rope hanging below the suzu bell
  const bellPullPath = catmull([
    [0, ropeY - 0.31, ropeZ + 0.03],
    [0.015, ropeY - 0.52, ropeZ + 0.04],
    [-0.01, ropeY - 0.74, ropeZ + 0.02],
  ]);
  b.sweep(bellPullPath, [0.028, 0.016], {
    sides: 8,
    color: RED_CLOTH,
    bone: bellJoint,
    group: "shimenawa",
    name: "suzuPullRope",
  });
  b.cards([frame([-0.01, ropeY - 0.72, ropeZ + 0.02], [0, 1, 0])], TASSEL_TEX, {
    size: [0.09, 0.22],
    lean: 180,
    flow: [0, 0, 1],
    bone: bellJoint,
    group: "shimenawa",
  });

  // ---------------------------------------------------------------------------
  // 4. Two Large Ornate Hanging Torii Lanterns (Hinged Joints + Emissive Glow)
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const lx = s * 0.98;
    const ly = 2.12;
    const lz = toriiZ + 0.04;

    // Gold decorative hook bracket under the kasagi wing
    b.sweep(
      bezier(
        [s * 0.82, 1.98, lz],
        [s * 0.92, 2.14, lz],
        [lx, ly + 0.04, lz],
      ),
      [0.022, 0.012],
      {
        sides: 8,
        color: GOLD,
        bone: root,
        group: `lantern${side}`,
      },
    );

    const lanternHinge = b.joint(`toriiLantern${side}`, {
      parent: root,
      at: [lx, ly, lz],
      dir: [0, -1, 0],
      role: "hinge",
      group: `lantern${side}`,
    });

    // Hanging chain / rod
    b.rod([lx, ly, lz], [lx, ly - 0.16, lz], 0.012, {
      sides: 6,
      color: GOLD,
      bone: lanternHinge,
      group: `lantern${side}`,
    });

    const bodyTopY = ly - 0.16;
    const bodyBotY = ly - 0.56;
    const bodyMidY = (bodyTopY + bodyBotY) / 2;

    // Hexagonal Curved Pagoda Cap of the Lantern
    b.lathe(
      [
        [0, 0],
        [0.24, 0],
        [0.19, 0.035],
        [0.12, 0.09],
        [0.04, 0.14],
        [0, 0.16],
      ],
      {
        at: [lx, bodyTopY - 0.02, lz],
        segments: 6,
        color: ROOF_SLATE,
        bone: lanternHinge,
        group: `lantern${side}`,
      },
    );
    // Gold cap finial & rim
    b.lathe(
      [
        [0, 0],
        [0.248, 0],
        [0.248, 0.018],
        [0, 0.018],
      ],
      {
        at: [lx, bodyTopY - 0.025, lz],
        segments: 6,
        color: GOLD,
        bone: lanternHinge,
        group: `lantern${side}`,
      },
    );

    // Glowing Inner Lantern Core (Textured Box + Emissive Core)
    glow(
      b.part(new THREE.BoxGeometry(0.21, 0.34, 0.21), "#ffffff", {
        bone: lanternHinge,
        at: [lx, bodyMidY, lz],
        texture: LANTERN_PANEL_TEX,
        group: `lantern${side}`,
        name: `toriiLanternCore${side}`,
      }),
      1.7,
    );

    // 4 Corner Wooden/Gold Struts framing the lantern box
    for (const cx of [-1, 1]) {
      for (const cz of [-1, 1]) {
        b.rod(
          [lx + cx * 0.112, bodyBotY, lz + cz * 0.112],
          [lx + cx * 0.112, bodyTopY, lz + cz * 0.112],
          0.014,
          {
            sides: 6,
            color: DARK_WOOD,
            bone: lanternHinge,
            group: `lantern${side}`,
          },
        );
      }
    }

    // Bottom Gold Base Cup of the Lantern
    b.lathe(
      [
        [0, 0],
        [0.05, 0],
        [0.13, 0.04],
        [0.17, 0.08],
        [0, 0.08],
      ],
      {
        at: [lx, bodyBotY - 0.06, lz],
        segments: 6,
        color: GOLD,
        bone: lanternHinge,
        group: `lantern${side}`,
      },
    );

    // Glowing Electro Jewel + Silk Tassel below each hanging lantern
    glow(
      b.part(new THREE.OctahedronGeometry(0.036, 0), GLOW_ELECTRO, {
        bone: lanternHinge,
        at: [lx, bodyBotY - 0.1, lz],
        group: `lantern${side}`,
      }),
      1.8,
    );

    // Crossed tassel cards so the tassel reads from every view angle
    b.cards([frame([lx, bodyBotY - 0.11, lz], [0, 1, 0])], TASSEL_TEX, {
      size: [0.11, 0.28],
      lean: 180,
      flow: [0, 0, 1],
      cross: true,
      bone: lanternHinge,
      group: `lantern${side}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 5. Elevated Wooden Hokora Sanctuary (Rear Center of Terrace)
  // ---------------------------------------------------------------------------
  const hokoraZ = -0.36;
  const hokoraBaseY = 0.26;

  // Stone foundation & carved wood verandah (engawa)
  b.frustumBox(
    [0, hokoraBaseY, hokoraZ],
    [0, hokoraBaseY + 0.24, hokoraZ],
    [0.92, 0.68],
    [0.86, 0.64],
    {
      up: [0, 0, 1],
      color: CARVED_STONE,
      bone: root,
      group: "hokora",
      name: "hokoraStoneFoundation",
    },
  );
  // Red lacquer verandah deck & gold railing
  const deckY = hokoraBaseY + 0.26;
  b.part(new THREE.BoxGeometry(0.98, 0.06, 0.74), LACQUER_RED_H, {
    bone: root,
    at: [0, deckY, hokoraZ],
    flat: true,
    group: "hokora",
  });
  // Verandah balustrade posts with gold giboshi (onion finials)
  for (const s of [1, -1]) {
    for (const pz of [hokoraZ - 0.31, hokoraZ + 0.31]) {
      const px = s * 0.44;
      b.rod([px, deckY + 0.03, pz], [px, deckY + 0.21, pz], 0.022, {
        sides: 8,
        color: LACQUER_RED,
        bone: root,
        group: "hokora",
      });
      b.lathe(
        [
          [0, 0],
          [0.028, 0],
          [0.032, 0.025],
          [0.018, 0.045],
          [0, 0.065],
        ],
        {
          at: [px, deckY + 0.21, pz],
          segments: 8,
          color: GOLD,
          bone: root,
          group: "hokora",
        },
      );
    }
    // Side rail bar
    b.rod([s * 0.44, deckY + 0.16, hokoraZ - 0.33], [s * 0.44, deckY + 0.16, hokoraZ + 0.35], 0.016, {
      sides: 6,
      color: GOLD,
      bone: root,
      group: "hokora",
    });
  }

  // Hokora Sanctuary Chamber Body
  const chamberBotY = deckY + 0.03;
  const chamberTopY = chamberBotY + 0.68;
  b.frustumBox(
    [0, chamberBotY, hokoraZ - 0.02],
    [0, chamberTopY, hokoraZ - 0.02],
    [0.72, 0.52],
    [0.74, 0.54],
    {
      up: [0, 0, 1],
      color: DARK_WOOD,
      bone: root,
      group: "hokora",
      name: "hokoraChamber",
    },
  );

  // 4 Vermilion Corner Pillars of the Hokora
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      b.rod(
        [sx * 0.36, chamberBotY, hokoraZ - 0.02 + sz * 0.26],
        [sx * 0.37, chamberTopY + 0.04, hokoraZ - 0.02 + sz * 0.27],
        0.036,
        {
          sides: 8,
          color: LACQUER_RED,
          bone: root,
          group: "hokora",
        },
      );
    }
  }

  // Glowing Inner Sanctum Niche & Sacred Electro Spirit Mirror (Shintai) visible through open doors
  const sanctumY = (chamberBotY + chamberTopY) / 2;
  const sanctumZ = hokoraZ + 0.245;
  glow(
    b.part(new THREE.BoxGeometry(0.36, 0.48, 0.04), GLOW_ELECTRO, {
      bone: root,
      at: [0, sanctumY, sanctumZ - 0.02],
      group: "hokora",
      name: "sanctumBackdrop",
    }),
    1.2,
  );
  // Sacred Mirror on a Gold Stand inside the niche
  b.lathe(
    [
      [0, 0],
      [0.09, 0],
      [0.06, 0.04],
      [0.03, 0.12],
      [0, 0.12],
    ],
    {
      at: [0, chamberBotY + 0.04, sanctumZ + 0.01],
      segments: 8,
      color: GOLD,
      bone: root,
      group: "hokora",
    },
  );
  b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.022, 16), GOLD, {
    bone: root,
    at: [0, sanctumY + 0.03, sanctumZ + 0.01],
    dir: [0, 0, 1],
    axis: "y",
    group: "hokora",
  });
  glow(
    b.part(new THREE.CircleGeometry(0.12, 16), "#ffffff", {
      bone: root,
      at: [0, sanctumY + 0.03, sanctumZ + 0.024],
      dir: [0, 0, 1],
      axis: "z",
      texture: SEAL_TEX,
      group: "hokora",
      name: "shintaiMirror",
    }),
    2.0,
  );

  // Pair of Hinged Sanctuary Doors (Opened slightly to reveal the glowing sacred mirror)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hingeX = s * 0.21;
    const doorZ = sanctumZ + 0.02;
    const doorJoint = b.joint(`shrineDoor${side}`, {
      parent: root,
      at: [hingeX, sanctumY, doorZ],
      dir: [0, 1, 0],
      role: "hinge",
      group: "hokora",
    });

    const doorCenterX = hingeX - s * 0.095;
    b.part(new THREE.BoxGeometry(0.19, 0.48, 0.028), LACQUER_RED, {
      bone: doorJoint,
      at: [doorCenterX, sanctumY, doorZ],
      flat: true,
      group: "hokora",
      name: `hokoraDoorPanel${side}`,
    });
    // Gold lattice trim & ring handle on each door leaf
    b.part(new THREE.BoxGeometry(0.14, 0.18, 0.036), GOLD, {
      bone: doorJoint,
      at: [doorCenterX, sanctumY + 0.1, doorZ],
      flat: true,
      group: "hokora",
    });
    b.part(new THREE.TorusGeometry(0.024, 0.006, 6, 10), GOLD, {
      bone: doorJoint,
      at: [hingeX - s * 0.15, sanctumY - 0.03, doorZ + 0.018],
      dir: [0, 0, 1],
      axis: "z",
      group: "hokora",
    });

    // Pose doors open outward at an inviting angle
    b.pose(doorJoint, { axis: [0, 1, 0], deg: s * 52 });
  }

  // Sweeping Curved Hokora Roof (Irimoya / Nagare-zukuri style)
  const roofOutline: OutlinePoint[] = [
    [-0.58, 0.02, "sharp"],
    [-0.64, 0.08, "sharp"],
    [-0.36, 0.18],
    [-0.14, 0.36],
    [0, 0.48, "sharp"],
    [0.14, 0.36],
    [0.36, 0.18],
    [0.64, 0.08, "sharp"],
    [0.58, 0.02, "sharp"],
    [0.32, 0.1],
    [0, 0.32, "sharp"],
    [-0.32, 0.1],
  ];
  b.extrude(roofOutline, {
    at: [0, chamberTopY - 0.04, hokoraZ - 0.01],
    x: [1, 0, 0],
    thickness: 0.88,
    bevel: 0.025,
    smoothing: 1,
    color: ROOF_SLATE,
    bone: root,
    group: "hokora",
    name: "hokoraMainRoof",
  });

  // Heavy Roof Ridge Beam (Mune) & Crossed Chigi Finials + Katsuogi Logs
  const ridgeY = chamberTopY + 0.44;
  b.frustumBox(
    [-0.48, ridgeY, hokoraZ - 0.01],
    [0.48, ridgeY, hokoraZ - 0.01],
    [0.12, 0.09],
    [0.12, 0.09],
    {
      up: [0, 1, 0],
      color: ROOF_RIDGE,
      bone: root,
      group: "hokora",
    },
  );
  // Gold ridge-end鬼瓦 (Onigawara) crests
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, -0.04, "sharp"],
        [0.11, 0.02],
        [0.15, 0.16, "sharp"],
        [0.05, 0.19],
        [0, 0.1],
      ],
      {
        at: [s * 0.46, ridgeY, hokoraZ - 0.01],
        x: [s, 0, 0],
        thickness: 0.11,
        bevel: 0.015,
        smoothing: 1,
        color: GOLD,
        bone: root,
        group: "hokora",
      },
    );
    // Crossed Chigi V-horns rising from the gable ends
    for (const fz of [1, -1]) {
      b.frustumBox(
        [s * 0.38, ridgeY - 0.08, hokoraZ - 0.01 + fz * 0.08],
        [s * 0.42, ridgeY + 0.24, hokoraZ - 0.01 - fz * 0.16],
        [0.032, 0.06],
        [0.018, 0.03],
        {
          up: [1, 0, 0],
          color: GOLD,
          bone: root,
          group: "hokora",
        },
      );
    }
  }
  // 3 Katsuogi (gold-capped ceremonial cylinder billets across the roof ridge)
  for (const kx of [-0.22, 0, 0.22]) {
    b.capsule(
      [kx, ridgeY + 0.065, hokoraZ - 0.15],
      [kx, ridgeY + 0.065, hokoraZ + 0.13],
      0.032,
      {
        sides: 8,
        bands: [
          [0.2, GOLD],
          [0.8, LACQUER_RED],
          [1, GOLD],
        ],
        bone: root,
        group: "hokora",
      },
    );
  }

  // Front Karahafu (curved entry canopy gable) over the sanctuary doors
  const canopyCurve = bezier(
    [-0.36, chamberTopY - 0.02, hokoraZ + 0.44],
    [-0.14, chamberTopY + 0.16, hokoraZ + 0.48],
    [0.14, chamberTopY + 0.16, hokoraZ + 0.48],
    [0.36, chamberTopY - 0.02, hokoraZ + 0.44],
  );
  b.sweep(canopyCurve, () => [0.09, 0.038], {
    section: "box",
    up: [0, 1, 0],
    color: GOLD,
    bone: root,
    group: "hokora",
  });

  // ---------------------------------------------------------------------------
  // 6. Kitsune Guardian Fox Statue (Left Side of Shrine, +X)
  // ---------------------------------------------------------------------------
  const foxX = 0.62;
  const foxZ = 0.62;
  const foxPedY = 0.08;

  // Carved Mossy Stone Pedestal for Kitsune
  b.frustumBox([foxX, 0, foxZ], [foxX, 0.26, foxZ], [0.38, 0.38], [0.32, 0.32], {
    up: [0, 0, 1],
    color: MOSSY_STONE,
    bone: root,
    group: "kitsune",
    name: "kitsunePedestal",
  });
  b.part(new THREE.BoxGeometry(0.36, 0.05, 0.36), CARVED_STONE, {
    bone: root,
    at: [foxX, 0.275, foxZ],
    flat: true,
    group: "kitsune",
  });

  const foxBaseY = 0.3;
  // Seated Fox Body Loft
  const foxSpine = [
    { at: [foxX, foxBaseY + 0.04, foxZ - 0.05], w: 0.21, h: 0.19 },
    { at: [foxX, foxBaseY + 0.16, foxZ - 0.02], w: 0.18, h: 0.17 },
    { at: [foxX, foxBaseY + 0.29, foxZ + 0.02], w: 0.15, h: 0.15 },
    { at: [foxX, foxBaseY + 0.38, foxZ + 0.04], w: 0.11, h: 0.11 },
  ];
  b.loft(foxSpine, {
    sides: 10,
    color: FOX_STONE,
    bone: root,
    group: "kitsune",
    name: "kitsuneBody",
  });

  // Festive Red & Gold Bib (Maekake) around the Kitsune's chest
  b.extrude(
    [
      [-0.1, 0.08, "sharp"],
      [0.1, 0.08, "sharp"],
      [0.08, -0.06],
      [0, -0.14, "sharp"],
      [-0.08, -0.06],
    ],
    {
      at: [foxX, foxBaseY + 0.25, foxZ + 0.09],
      x: [1, 0, 0],
      y: [0, 0.94, 0.34],
      thickness: 0.028,
      bevel: 0.008,
      smoothing: 1,
      color: RED_CLOTH,
      bone: root,
      group: "kitsune",
    },
  );
  // Gold bell on the Kitsune's bib
  b.part(new THREE.SphereGeometry(0.026, 8, 6), GOLD, {
    bone: root,
    at: [foxX, foxBaseY + 0.29, foxZ + 0.115],
    group: "kitsune",
  });

  // Seated Front Paws & Hind Haunches
  for (const s of [1, -1]) {
    b.capsule(
      [foxX + s * 0.065, foxBaseY + 0.22, foxZ + 0.05],
      [foxX + s * 0.058, foxBaseY + 0.02, foxZ + 0.09],
      [0.032, 0.026],
      {
        sides: 8,
        color: FOX_STONE,
        bone: root,
        group: "kitsune",
      },
    );
    // Hind leg curl
    b.capsule(
      [foxX + s * 0.09, foxBaseY + 0.1, foxZ - 0.03],
      [foxX + s * 0.085, foxBaseY + 0.02, foxZ + 0.04],
      [0.048, 0.032],
      {
        sides: 8,
        color: FOX_STONE,
        bone: root,
        group: "kitsune",
      },
    );
  }

  // Kitsune Head, Snout & Large Ears with Red/Gold markings
  const headCenter: V3 = [foxX, foxBaseY + 0.43, foxZ + 0.05];
  const foxSkull = b.part(new THREE.SphereGeometry(1, 14, 10), FOX_STONE, {
    bone: root,
    at: headCenter,
    scale: [0.095, 0.088, 0.098],
    group: "kitsune",
    name: "kitsuneHead",
  });
  // Tapered fox snout
  b.spike(
    [foxX, foxBaseY + 0.41, foxZ + 0.1],
    [foxX, foxBaseY + 0.39, foxZ + 0.21],
    null,
    0.052,
    {
      sides: 8,
      bands: [
        [0.82, FOX_STONE],
        [1, INK],
      ],
      bone: root,
      group: "kitsune",
    },
  );
  // Anime eyes on the Kitsune skull
  const foxSkin = b.surface(foxSkull);
  for (const s of [1, -1]) {
    const hit = foxSkin.around(headCenter).at(s * 36, 4);
    if (hit) {
      b.decal(foxSkin, FOX_EYE_TEX, {
        at: hit,
        size: [0.048, 0.062],
        mirror: s > 0,
        bone: root,
        group: "kitsune",
      });
    }
    // Tall pointed Kitsune ears with vermilion tips
    b.spike(
      [foxX + s * 0.055, foxBaseY + 0.49, foxZ + 0.03],
      [foxX + s * 0.095, foxBaseY + 0.65, foxZ + 0.01],
      null,
      0.042,
      {
        sides: 6,
        bands: [
          [0.55, FOX_STONE],
          [0.72, GOLD],
          [1, LACQUER_RED],
        ],
        bone: root,
        group: "kitsune",
      },
    );
  }

  // Swirled Kitsune Tail with Glowing Electro Tip
  const foxTailPath = catmull([
    [foxX, foxBaseY + 0.06, foxZ - 0.11],
    [foxX + 0.04, foxBaseY + 0.18, foxZ - 0.24],
    [foxX + 0.02, foxBaseY + 0.38, foxZ - 0.27],
    [foxX, foxBaseY + 0.52, foxZ - 0.19],
  ]);
  b.sweep(foxTailPath, [0.042, 0.088, 0.072, 0.015], {
    sides: 10,
    bands: [
      [0.7, FOX_STONE],
      [0.82, GOLD],
      [1, VIOLET_SILK],
    ],
    bone: root,
    group: "kitsune",
    name: "kitsuneTail",
  });
  // Glowing Electro Orb held under the Kitsune's right paw
  glow(
    b.part(new THREE.SphereGeometry(0.042, 10, 8), GLOW_ELECTRO, {
      bone: root,
      at: [foxX - 0.06, foxBaseY + 0.045, foxZ + 0.13],
      group: "kitsune",
      name: "kitsuneOrb",
    }),
    1.8,
  );

  // ---------------------------------------------------------------------------
  // 7. Stone Toro Pedestal Lantern & Bamboo Chozuya Water Basin (Right Side, -X)
  // ---------------------------------------------------------------------------
  const toroX = -0.66;
  const toroZ = 0.58;

  // Carved Stone Toro Lantern
  b.lathe(
    [
      [0, 0],
      [0.19, 0],
      [0.17, 0.06],
      [0.12, 0.12],
      [0.085, 0.16],
      [0.08, 0.42],
      [0.15, 0.47],
      [0.18, 0.52],
      [0, 0.52],
    ],
    {
      at: [toroX, 0, toroZ],
      segments: 6,
      color: MOSSY_STONE,
      bone: root,
      group: "toro",
      name: "toroPedestal",
    },
  );
  // Glowing Firebox (Hibukuro) of the Stone Toro
  glow(
    b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.19, 6), GLOW_AMBER, {
      bone: root,
      at: [toroX, 0.61, toroZ],
      group: "toro",
      name: "toroLightBox",
    }),
    1.6,
  );
  // Stone corner bars around the firebox
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    b.rod(
      [toroX + Math.cos(a) * 0.118, 0.51, toroZ + Math.sin(a) * 0.118],
      [toroX + Math.cos(a) * 0.118, 0.71, toroZ + Math.sin(a) * 0.118],
      0.014,
      {
        sides: 5,
        color: STONE_BASE,
        bone: root,
        group: "toro",
      },
    );
  }
  // Hexagonal Pagoda Umbrella Roof (Kasa) &寶珠 (Hoju) Lotus Finial on the Toro
  b.lathe(
    [
      [0, 0],
      [0.27, 0],
      [0.22, 0.05],
      [0.14, 0.12],
      [0.06, 0.18],
      [0.075, 0.21],
      [0.045, 0.26],
      [0, 0.31],
    ],
    {
      at: [toroX, 0.7, toroZ],
      segments: 6,
      color: MOSSY_STONE,
      bone: root,
      group: "toro",
      name: "toroRoof",
    },
  );

  // Purifying Water Basin (Tsukubai / Chozuya) with Bamboo Spout & Ladle
  const basinX = -0.84;
  const basinZ = 0.16;
  const basinY = 0.25;
  b.lathe(
    [
      [0, 0],
      [0.2, 0],
      [0.23, 0.12],
      [0.22, 0.24],
      [0.16, 0.25],
      [0.15, 0.16],
      [0, 0.16],
    ],
    {
      at: [basinX, basinY, basinZ],
      segments: 10,
      color: MOSSY_STONE,
      bone: root,
      group: "chozuya",
      name: "waterBasin",
    },
  );
  // Glowing crystal-clear elemental water surface inside the basin
  glow(
    b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.02, 10), GLOW_WATER, {
      bone: root,
      at: [basinX, basinY + 0.21, basinZ],
      group: "chozuya",
      name: "basinWater",
    }),
    1.1,
  );
  // Vertical bamboo water post & angled spout (kakei)
  b.rod([basinX - 0.14, basinY, basinZ - 0.14], [basinX - 0.14, basinY + 0.52, basinZ - 0.14], 0.034, {
    sides: 8,
    color: BAMBOO_GREEN,
    bone: root,
    group: "chozuya",
  });
  b.rod([basinX - 0.18, basinY + 0.42, basinZ - 0.18], [basinX - 0.02, basinY + 0.34, basinZ - 0.02], 0.024, {
    sides: 8,
    color: BAMBOO_GREEN,
    bone: root,
    group: "chozuya",
  });
  // Glowing water stream pouring from the bamboo spout into the basin
  glow(
    b.sweep(
      bezier(
        [basinX - 0.02, basinY + 0.33, basinZ - 0.02],
        [basinX + 0.02, basinY + 0.29, basinZ + 0.02],
        [basinX + 0.03, basinY + 0.21, basinZ + 0.03],
      ),
      [0.011, 0.016],
      {
        sides: 6,
        color: GLOW_WATER,
        bone: root,
        group: "chozuya",
      },
    ),
    1.4,
  );
  // Wooden water ladle (hishaku) resting across the basin rim
  b.rod([basinX - 0.18, basinY + 0.255, basinZ + 0.08], [basinX + 0.22, basinY + 0.255, basinZ - 0.04], 0.009, {
    sides: 6,
    color: LIGHT_WOOD,
    bone: root,
    group: "chozuya",
  });
  b.lathe(
    [
      [0, 0],
      [0.038, 0],
      [0.042, 0.05],
      [0.032, 0.05],
      [0.03, 0.01],
      [0, 0.01],
    ],
    {
      at: [basinX - 0.12, basinY + 0.24, basinZ + 0.06],
      segments: 8,
      color: LIGHT_WOOD,
      bone: root,
      group: "chozuya",
    },
  );

  // ---------------------------------------------------------------------------
  // 8. Offerings Table, Saisen Coin Box, Sake Jars, Dango & Fruit Trays
  // ---------------------------------------------------------------------------
  // Red & Gold Lacquered Offering Table (Sanbo / Altar) on the terrace between Torii and Hokora
  const altarZ = 0.05;
  const altarY = 0.26;

  // Saisen-bako (Wooden Offering Coin Box with Gold Slatted Top) on the front step-terrace edge
  const saisenZ = 0.35;
  b.frustumBox(
    [0, altarY, saisenZ],
    [0, altarY + 0.24, saisenZ],
    [0.44, 0.26],
    [0.48, 0.28],
    {
      up: [0, 0, 1],
      color: WARM_WOOD,
      bone: root,
      group: "offerings",
      name: "saisenBox",
    },
  );
  // Gold corner brackets and coin bars on top of saisen box
  b.part(new THREE.BoxGeometry(0.5, 0.03, 0.3), GOLD, {
    bone: root,
    at: [0, altarY + 0.24, saisenZ],
    flat: true,
    group: "offerings",
  });
  for (const bz of [-0.08, -0.03, 0.03, 0.08]) {
    b.rod([-0.21, altarY + 0.258, saisenZ + bz], [0.21, altarY + 0.258, saisenZ + bz], 0.008, {
      sides: 6,
      color: DARK_WOOD,
      bone: root,
      group: "offerings",
    });
  }
  // Glowing Mora emblem on the front of the saisen box
  glow(
    b.part(new THREE.CircleGeometry(0.065, 12), "#ffffff", {
      bone: root,
      at: [0, altarY + 0.13, saisenZ + 0.142],
      dir: [0, 0, 1],
      axis: "z",
      texture: SEAL_TEX,
      group: "offerings",
    }),
    1.4,
  );

  // Elevated Sanbo Offering Trays flanking the altar
  for (const s of [1, -1]) {
    const trayX = s * 0.34;
    const trayZ = altarZ + 0.08;
    // Sanbo pedestal stand
    b.frustumBox(
      [trayX, altarY, trayZ],
      [trayX, altarY + 0.12, trayZ],
      [0.16, 0.16],
      [0.14, 0.14],
      {
        up: [0, 0, 1],
        color: LIGHT_WOOD,
        bone: root,
        group: "offerings",
      },
    );
    // Tray dish with red rim
    b.frustumBox(
      [trayX, altarY + 0.12, trayZ],
      [trayX, altarY + 0.155, trayZ],
      [0.24, 0.24],
      [0.27, 0.27],
      {
        up: [0, 0, 1],
        color: LACQUER_RED,
        bone: root,
        group: "offerings",
      },
    );
    // White ritual paper sheet inside the tray
    b.part(new THREE.BoxGeometry(0.22, 0.012, 0.22), CERAMIC_WHITE, {
      bone: root,
      at: [trayX, altarY + 0.158, trayZ],
      flat: true,
      group: "offerings",
    });
  }

  // Left Tray (+X): Tri-colour Sanshoku Dango Skewers & Teacup
  const dangoTrayX = 0.34;
  const dangoTrayY = altarY + 0.175;
  const dangoTrayZ = altarZ + 0.08;
  for (const sk of [-0.045, 0.035]) {
    const startP: V3 = [dangoTrayX - 0.08, dangoTrayY + 0.01, dangoTrayZ + sk];
    const endP: V3 = [dangoTrayX + 0.09, dangoTrayY + 0.055, dangoTrayZ + sk];
    b.rod(startP, endP, 0.005, {
      sides: 5,
      color: LIGHT_WOOD,
      bone: root,
      group: "offerings",
    });
    const colors = [DANGO_GREEN, DANGO_WHITE, DANGO_PINK];
    for (let d = 0; d < 3; d++) {
      const f = 0.28 + d * 0.26;
      b.part(new THREE.SphereGeometry(0.025, 8, 6), colors[d], {
        bone: root,
        at: [
          startP[0] + (endP[0] - startP[0]) * f,
          startP[1] + (endP[1] - startP[1]) * f,
          startP[2],
        ],
        group: "offerings",
      });
    }
  }

  // Right Tray (-X): Pyramid of Sunsettia / Mandarin Oranges & Glowing Mora Coins
  const fruitTrayX = -0.34;
  const fruitTrayY = altarY + 0.185;
  const fruitTrayZ = altarZ + 0.08;
  const oranges: V3[] = [
    [fruitTrayX - 0.04, fruitTrayY, fruitTrayZ - 0.03],
    [fruitTrayX + 0.04, fruitTrayY, fruitTrayZ - 0.03],
    [fruitTrayX, fruitTrayY, fruitTrayZ + 0.04],
    [fruitTrayX, fruitTrayY + 0.048, fruitTrayZ - 0.005],
  ];
  for (const op of oranges) {
    b.part(new THREE.SphereGeometry(0.034, 8, 6), MANDARIN, {
      bone: root,
      at: op,
      scale: [1, 0.85, 1],
      group: "offerings",
    });
  }
  // Little green leaf on top orange
  b.spike(
    [fruitTrayX, fruitTrayY + 0.075, fruitTrayZ - 0.005],
    [fruitTrayX + 0.03, fruitTrayY + 0.095, fruitTrayZ + 0.01],
    null,
    0.012,
    {
      sides: 5,
      color: BAMBOO_GREEN,
      bone: root,
      group: "offerings",
    },
  );

  // Pair of Ceramic Sake Jars (Omiki Dokkuri) with Folded Paper & Gold Cord Stoppers
  for (const s of [1, -1]) {
    const jarX = s * 0.52;
    const jarZ = -0.02;
    b.lathe(
      [
        [0, 0],
        [0.068, 0],
        [0.092, 0.07],
        [0.085, 0.15],
        [0.038, 0.2],
        [0.048, 0.25],
        [0, 0.25],
      ],
      {
        at: [jarX, altarY, jarZ],
        segments: 10,
        color: CERAMIC_WHITE,
        bone: root,
        group: "offerings",
        name: `sakeJar${s > 0 ? "L" : "R"}`,
      },
    );
    // Blue-and-red braided neck cord
    b.lathe(
      [
        [0, 0],
        [0.046, 0],
        [0.046, 0.025],
        [0, 0.025],
      ],
      {
        at: [jarX, altarY + 0.19, jarZ],
        segments: 10,
        color: RED_CLOTH,
        bone: root,
        group: "offerings",
      },
    );
    // Folded gold & white paper (mikiguchi) in top of sake jar
    b.extrude(
      [
        [0, 0, "sharp"],
        [0.055, 0.08, "sharp"],
        [0.02, 0.12, "sharp"],
        [0, 0.07, "sharp"],
        [-0.02, 0.12, "sharp"],
        [-0.055, 0.08, "sharp"],
      ],
      {
        at: [jarX, altarY + 0.24, jarZ],
        x: [1, 0, 0],
        thickness: 0.012,
        color: PALE_GOLD,
        bone: root,
        group: "offerings",
      },
    );
  }

  // Bronze Tripod Incense Burner (Koro) on the front step with rising glowing spirit smoke
  const koroX = 0.28;
  const koroY = 0.155;
  const koroZ = 0.69;
  b.lathe(
    [
      [0, 0.02],
      [0.065, 0.02],
      [0.082, 0.06],
      [0.068, 0.11],
      [0.076, 0.125],
      [0.055, 0.125],
      [0, 0.09],
    ],
    {
      at: [koroX, koroY, koroZ],
      segments: 10,
      color: BRONZE,
      bone: root,
      group: "offerings",
      name: "incenseBurner",
    },
  );
  for (let leg = 0; leg < 3; leg++) {
    const la = (leg / 3) * Math.PI * 2 + 0.4;
    b.rod(
      [koroX + Math.cos(la) * 0.05, koroY + 0.04, koroZ + Math.sin(la) * 0.05],
      [koroX + Math.cos(la) * 0.065, koroY, koroZ + Math.sin(la) * 0.065],
      [0.014, 0.009],
      {
        sides: 6,
        color: GOLD,
        bone: root,
        group: "offerings",
      },
    );
  }
  // Glowing incense embers & curling spirit wisp
  glow(
    b.sweep(
      catmull([
        [koroX, koroY + 0.12, koroZ],
        [koroX + 0.03, koroY + 0.24, koroZ + 0.02],
        [koroX - 0.02, koroY + 0.37, koroZ - 0.01],
        [koroX + 0.02, koroY + 0.49, koroZ + 0.02],
      ]),
      [0.014, 0.022, 0.012, 0],
      {
        sides: 6,
        color: GLOW_ANEMO,
        bone: root,
        group: "offerings",
      },
    ),
    1.5,
  );

  // ---------------------------------------------------------------------------
  // 9. Ema Wishing Plaque Rack (Left Rear Terrace, +X) with Hinged Plaques
  // ---------------------------------------------------------------------------
  const emaRackX = 0.78;
  const emaRackZ = -0.26;
  const emaBaseY = 0.26;

  // Two wooden posts & tiled mini roof over the Ema rack
  for (const sz of [-0.22, 0.22]) {
    b.rod([emaRackX, emaBaseY, emaRackZ + sz], [emaRackX, emaBaseY + 0.86, emaRackZ + sz], 0.026, {
      sides: 8,
      color: LACQUER_RED,
      bone: root,
      group: "emaRack",
    });
  }
  // Mini roof cap on the Ema rack
  b.frustumBox(
    [emaRackX, emaBaseY + 0.84, emaRackZ - 0.29],
    [emaRackX, emaBaseY + 0.84, emaRackZ + 0.29],
    [0.18, 0.05],
    [0.18, 0.05],
    {
      up: [0, 1, 0],
      color: ROOF_SLATE,
      bone: root,
      group: "emaRack",
    },
  );
  // Two horizontal hanging bars
  for (const barY of [emaBaseY + 0.68, emaBaseY + 0.46]) {
    b.rod([emaRackX, barY, emaRackZ - 0.24], [emaRackX, barY, emaRackZ + 0.24], 0.012, {
      sides: 6,
      color: GOLD,
      bone: root,
      group: "emaRack",
    });
  }

  // Hinged Ema wooden wishing plaques hanging on the rack
  const emaRowJoint = b.joint("emaPlaquesHinge", {
    parent: root,
    at: [emaRackX, emaBaseY + 0.68, emaRackZ],
    dir: [0, -1, 0],
    role: "hinge",
    group: "emaRack",
  });
  for (const ry of [emaBaseY + 0.62, emaBaseY + 0.4]) {
    for (const rz of [-0.14, 0, 0.14]) {
      b.part(new THREE.BoxGeometry(0.018, 0.11, 0.14), "#ffffff", {
        bone: emaRowJoint,
        at: [emaRackX, ry, emaRackZ + rz],
        texture: EMA_TEX,
        group: "emaRack",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 10. Gnarled Sacred Sakura Tree, Floating Genshin Lanterns & Foliage
  // ---------------------------------------------------------------------------
  // Gnarled Sakura Tree rising from the rear-left corner of the shrine mound
  const trunkPath = catmull([
    [-0.86, 0.18, -0.46],
    [-0.96, 0.78, -0.52],
    [-0.88, 1.42, -0.44],
    [-0.62, 1.98, -0.32],
    [-0.32, 2.34, -0.22],
  ]);
  b.sweep(trunkPath, [0.16, 0.12, 0.09, 0.06, 0.032], {
    sides: 8,
    color: DARK_WOOD,
    bone: root,
    group: "sakura",
    name: "sakuraTrunk",
  });
  // Secondary lower branch reaching forward over the water basin
  const branchPath = catmull([
    [-0.91, 1.18, -0.48],
    [-1.02, 1.44, -0.18],
    [-0.92, 1.62, 0.14],
  ]);
  b.sweep(branchPath, [0.068, 0.045, 0.022], {
    sides: 7,
    color: DARK_WOOD,
    bone: root,
    group: "sakura",
  });
  // Sacred shimenawa & paper talismans wrapped around the sakura trunk
  b.rod([-0.94, 0.68, -0.51], [-0.96, 0.78, -0.52], 0.132, {
    sides: 8,
    color: ROPE_PAINT,
    bone: root,
    group: "sakura",
  });
  b.cards(
    [
      frame([-0.82, 0.72, -0.46], [0, 1, 0]),
      frame([-0.92, 0.72, -0.38], [0, 1, 0]),
    ],
    OFUDA_TEX,
    {
      size: [0.06, 0.15],
      lean: 180,
      flow: [1, 0, 1],
      bone: root,
      group: "sakura",
    },
  );

  // Lush Stylized Sakura Canopy Clusters + Blossom Cards
  const blossomClusters: Array<{ at: V3; scale: V3 }> = [
    { at: [-0.62, 2.08, -0.32], scale: [0.34, 0.22, 0.3] },
    { at: [-0.32, 2.38, -0.22], scale: [0.38, 0.24, 0.32] },
    { at: [-0.88, 1.82, -0.38], scale: [0.28, 0.2, 0.26] },
    { at: [-0.92, 1.66, 0.14], scale: [0.28, 0.19, 0.26] },
  ];
  const SAKURA_PINK = cel(
    mottle("#ffa8cc", "#ff82b2", { size: 0.12, seed: 88 }),
    "#c94b7c",
  );
  for (const cl of blossomClusters) {
    b.part(new THREE.IcosahedronGeometry(1, 1), SAKURA_PINK, {
      bone: root,
      at: cl.at,
      scale: cl.scale,
      flat: true,
      group: "sakura",
    });
  }
  // Crossed Sakura branch cards around the canopy for airy anime silhouette
  const blossomFrames = blossomClusters.map((cl) =>
    frame([cl.at[0], cl.at[1] - 0.05, cl.at[2] + 0.06], [0, 1, 0.2]),
  );
  b.cards(blossomFrames, SAKURA_BRANCH_TEX, {
    size: [0.42, 0.42],
    lean: 20,
    flow: [0, 0, 1],
    cross: true,
    spin: 35,
    rng: rng(91),
    bone: root,
    group: "sakura",
  });

  // 3 Floating Genshin Xiao / Electro-Rite Paper Sky Lanterns ascending around the shrine
  const skyLanterns: Array<{ pos: V3; color: string; name: string }> = [
    { pos: [-0.92, 1.32, 0.12], color: GLOW_AMBER, name: "floatingLantern1" },
    { pos: [0.88, 1.54, -0.24], color: GLOW_GOLD, name: "floatingLantern2" },
    { pos: [0.36, 2.48, -0.28], color: GLOW_ELECTRO_CORE, name: "floatingLantern3" },
  ];
  for (const sl of skyLanterns) {
    const [sx, sy, sz] = sl.pos;
    // Glowing lotus lantern body
    glow(
      b.lathe(
        [
          [0, 0],
          [0.065, 0],
          [0.105, 0.06],
          [0.095, 0.16],
          [0.055, 0.21],
          [0, 0.22],
        ],
        {
          at: [sx, sy, sz],
          segments: 8,
          color: sl.color,
          bone: root,
          group: "skyLanterns",
          name: sl.name,
        },
      ),
      1.8,
    );
    // Gold filigree collar rings at top and bottom of each floating lantern
    b.lathe(
      [
        [0, 0],
        [0.075, 0],
        [0.075, 0.02],
        [0, 0.02],
      ],
      {
        at: [sx, sy - 0.01, sz],
        segments: 8,
        color: GOLD,
        bone: root,
        group: "skyLanterns",
      },
    );
    b.cards([frame([sx, sy - 0.01, sz], [0, 1, 0])], TASSEL_TEX, {
      size: [0.07, 0.18],
      lean: 180,
      flow: [0, 0, 1],
      cross: true,
      bone: root,
      group: "skyLanterns",
    });
  }

  // Stylized Grass Tufts & Fallen Sakura Petals scattered around the plinth
  const grassPositions: V3[] = [
    [-0.98, 0.08, 0.68],
    [-0.52, 0.08, 0.88],
    [0.54, 0.08, 0.86],
    [0.92, 0.08, 0.56],
    [0.98, 0.08, -0.08],
    [-1.02, 0.08, -0.18],
    [0.72, 0.26, 0.42],
    [-0.72, 0.26, 0.42],
  ];
  b.cards(
    grassPositions.map((gp) => frame(gp, [0, 1, 0])),
    GRASS_CARD_TEX,
    {
      size: [0.22, 0.22],
      lean: 12,
      cross: true,
      vary: 0.25,
      spin: 180,
      rng: rng(104),
      bone: root,
      group: "foliage",
      name: "grassTufts",
    },
  );

  // Fallen Sakura Petals on steps and flagstones
  const petalPositions: V3[] = [
    [0.18, 0.16, 0.68],
    [-0.22, 0.085, 0.88],
    [0.12, 0.278, 0.22],
    [-0.18, 0.278, -0.06],
    [0.58, 0.278, 0.18],
    [-0.56, 0.278, -0.18],
  ];
  b.cards(
    petalPositions.map((pp, idx) =>
      frame(pp, [0, 1, 0]),
    ),
    PETAL_CARD_TEX,
    {
      size: 0.075,
      lean: 90,
      flow: (_f, idx) => [Math.cos(idx * 67 * DEG), 0, Math.sin(idx * 67 * DEG)],
      mirror: true,
      vary: 0.2,
      rng: rng(202),
      bone: root,
      group: "foliage",
      name: "fallenPetals",
    },
  );

  // Small Glowing Electro Crystal Cluster at the base of the Sakura tree
  const crystalBase: V3 = [-0.68, 0.26, -0.44];
  const crystalDirs: Array<{ dir: V3; len: number; r: number }> = [
    { dir: [-0.2, 1, 0.15], len: 0.22, r: 0.042 },
    { dir: [0.25, 0.9, 0.2], len: 0.16, r: 0.032 },
    { dir: [-0.35, 0.8, -0.2], len: 0.14, r: 0.028 },
  ];
  for (const cr of crystalDirs) {
    glow(
      b.spike(crystalBase, cr.dir, cr.len, cr.r, {
        section: { ngon: 6 },
        color: GLOW_ELECTRO,
        bone: root,
        group: "crystals",
      }),
      1.7,
    );
  }

  return b.root;
}
