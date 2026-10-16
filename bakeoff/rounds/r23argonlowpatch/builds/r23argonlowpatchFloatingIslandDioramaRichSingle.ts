import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import type { Frame } from "../../../../src/frame";
import { lerp, offset, rng } from "../../../../src/math";
import type { V3 } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { cells, countershade, gradient, grain, mix, mottle, noise, paint, scales, smoothstep, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, furEdge, INK, inkLines } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Floating Island Diorama",
  description:
    "Genshin Impact inspired cel-shaded floating sky sanctuary with ancient marble ruins, gilded astrolabe, golden spirit-trees, glowing Anemo and Geo crystal veins, and a twin-tiered waterfall cascading into an abyssal cloud vortex.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "floatingIslandDiorama", detail: 0.9, paintSize: 2048 });
  const rand = rng(20250928);

  // ============================================================================
  // PALETTE & CEL PAINTS (Genshin Impact: crisp cel shading, warm marble,
  // ornate gold filigree, sunlit teal-emerald turf, sunset ginkgo & sakura,
  // elemental Anemo teal & Geo amber glows)
  // ============================================================================

  // Flat colors (specifically used for glowing parts or crisp accents)
  const ANEMO_GLOW = "#45f7df";
  const ANEMO_PALE = "#bbfcf2";
  const GEO_GLOW = "#ffbe3b";
  const GEO_PALE = "#fff0a8";
  const HYDRO_GLOW = "#5ce1ff";
  const HYDRO_FOAM = "#e6fbff";
  const ELECTRO_VIOLET = "#b97aff";
  const GOLD_FLAT = "#e8b948";
  const GOLD_BRIGHT = "#ffe27a";
  const DARK_BRONZE = "#463529";
  const CRIMSON_CORD = "#d93b48";
  const MARBLE_FLAT = "#f5efe2";
  const SLATE_FLAT = "#424c63";

  // Rich procedural + cel-shaded paints
  const ABYSS_STONE = cel(
    paint((p) => {
      const c = cells(p, 0.24, 11);
      const crack = smoothstep(0.02, 0.09, c.d2 - c.d1);
      const base = mix("#1d2336", "#2f3852", noise(p, 0.35, 12));
      return mix("#43e8d8", base, crack);
    }),
    "#121624",
  );

  const CLIFF_STRATA = cel(
    paint((p, n) => {
      const band = stripes("#6d778c", "#545d73", {
        size: 0.16,
        axis: "y",
        width: 0.42,
        wobble: 0.35,
        seed: 21,
      }).at(p, n);
      const warm = mottle(band, "#847c74", { size: 0.28, seed: 23 }).at(p, n);
      const rim = smoothstep(0.55, 1.35, p.y);
      return mix("#394157", warm, rim);
    }),
    "#353d54",
  );

  const MOSSY_ROCK = cel(
    countershade(
      mottle("#49b878", "#78db70", { size: 0.18, seed: 31 }),
      CLIFF_STRATA,
      { level: 0.28, soft: 0.22 },
    ),
  );

  const TURF_GRASS = cel(
    furEdge(
      mottle("#52cc7a", "#8ce368", { size: 0.24, contrast: 1.3, seed: 41 }),
      CLIFF_STRATA,
      {
        axis: [0, 1, 0],
        by: "normal",
        level: 0.18,
        teeth: 0.26,
        period: 0.08,
        along: [1, 0, 1],
        ink: "#285948",
        inkWidth: 0.05,
      },
    ),
  );

  const GOLDEN_TURF = cel(
    mottle("#7bd96c", "#e8c84b", { size: 0.22, contrast: 1.4, seed: 45 }),
    "#478f59",
  );

  const MARBLE_RUIN = cel(
    paint((p, n) => {
      const tiles = scales(["#f7f3e8", "#efe8d8", "#e5decb"], "#c7beaa", {
        size: 0.19,
        width: 0.09,
        seed: 51,
      }).at(p, n);
      const weather = smoothstep(0.65, 0.95, noise(p, 0.25, 53));
      return mix(tiles, "#76a878", weather * Math.max(0, n.y) * 0.55);
    }),
    "#c4bcce",
  );

  const MARBLE_CARVED = cel(
    inkLines(
      mottle("#fbf8f0", "#ebe3d2", { size: 0.25, seed: 61 }),
      { levels: [-0.45, 0.45], axis: [0, 1, 0], width: 0.05, ink: "#b8ad99" },
    ),
    "#c2bad1",
  );

  const GOLD_TRIM = cel(
    gradient("#ffe48a", "#cf962b", [0, 2.5, 0], [0, 0.6, 0]),
    "#9c661c",
  );

  const BRONZE_ORNATE = cel(
    mottle("#574538", "#3d2f28", { size: 0.14, seed: 71 }),
    "#241b18",
  );

  const SPIRIT_BARK = cel(
    grain("#6e5347", "#4f3931", { size: 0.07, axis: "y", seed: 81 }),
    "#362523",
  );

  const PALE_BARK = cel(
    grain("#cfc2b4", "#a8988a", { size: 0.06, axis: "y", seed: 83 }),
    "#7d6e67",
  );

  const GINKGO_CANOPY = cel(
    countershade(
      mottle("#ffd84a", "#ff9e2c", { size: 0.16, contrast: 1.3, seed: 91 }),
      "#d96b27",
      { level: -0.1, soft: 0.35 },
    ),
    "#bf5624",
  );

  const SAKURA_CANOPY = cel(
    countershade(
      mottle("#ffb5d0", "#ff7da8", { size: 0.15, contrast: 1.2, seed: 95 }),
      "#d95b8a",
      { level: -0.1, soft: 0.35 },
    ),
    "#b04373",
  );

  const TEAL_BUSH = cel(
    mottle("#36b888", "#6be385", { size: 0.12, contrast: 1.3, seed: 99 }),
    "#1f7363",
  );

  const CLOUD_PAINT = cel(
    countershade("#ffffff", "#cfe0f5", { level: -0.15, soft: 0.4 }),
    "#b8cde8",
  );

  const WATER_SURFACE = cel(
    paint((p) => {
      const wave = Math.sin(p.x * 18 + p.z * 14 + noise(p, 0.14, 105) * 5);
      const foam = smoothstep(0.65, 0.92, wave);
      const depth = smoothstep(0.15, 0.55, Math.hypot(p.x - 0.05, p.z - 0.1));
      const aqua = mix("#2be8d8", "#1a88c7", depth);
      return mix(aqua, "#e8ffff", foam * 0.75);
    }),
    "#166da3",
  );

  const WATERFALL_STREAM = cel(
    paint((p, _n, s) => {
      const streak = Math.sin(s[1] * 0.35 + noise(p, 0.09, 111) * 6);
      const edgeFoam = smoothstep(0.75, 0.98, Math.abs(Math.sin(s[0] * 14 + noise(p, 0.12, 113) * 4)));
      const base = mix("#35d6f2", "#8af5ff", smoothstep(-0.3, 0.6, streak));
      return mix(base, "#ffffff", edgeFoam * 0.85);
    }),
    "#209ac4",
  );

  // ============================================================================
  // SVG TEXTURES & CARDS (Runes, Filigree, Foliage, Grass, Tassels, Ripples)
  // ============================================================================

  // 1. Golden Astrolabe / Celestial Rune Circle (for temple plaza & hovering seal)
  const RUNE_SEAL_TEX = svg(
    `<svg viewBox="0 0 256 256">
      <circle cx="128" cy="128" r="118" fill="none" stroke="#ffe680" stroke-width="5"/>
      <circle cx="128" cy="128" r="104" fill="none" stroke="#45f7df" stroke-width="3" stroke-dasharray="14 8"/>
      <circle cx="128" cy="128" r="78" fill="none" stroke="#ffe680" stroke-width="4"/>
      <polygon points="128,16 158,98 240,128 158,158 128,240 98,158 16,128 98,98" fill="none" stroke="#ffe680" stroke-width="4"/>
      <polygon points="49,49 148,108 207,207 108,148" fill="none" stroke="#45f7df" stroke-width="3.5"/>
      <polygon points="207,49 148,148 49,207 108,108" fill="none" stroke="#45f7df" stroke-width="3.5"/>
      <circle cx="128" cy="128" r="38" fill="#45f7df" fill-opacity="0.28" stroke="#ffffff" stroke-width="4"/>
      <circle cx="128" cy="128" r="16" fill="#ffffff"/>
      <circle cx="128" cy="28" r="7" fill="#ffe680"/>
      <circle cx="128" cy="228" r="7" fill="#ffe680"/>
      <circle cx="28" cy="128" r="7" fill="#ffe680"/>
      <circle cx="228" cy="128" r="7" fill="#ffe680"/>
    </svg>`,
    { size: 512 },
  );

  // 2. Glowing Anemo / Celestial Pillar Carving Decal
  const PILLAR_RUNE_TEX = svg(
    `<svg viewBox="0 0 64 192">
      <rect x="8" y="8" width="48" height="176" rx="6" fill="none" stroke="#d4af37" stroke-width="4"/>
      <path d="M32 22 L48 46 L32 70 L16 46 Z" fill="#45f7df" stroke="#ffffff" stroke-width="3"/>
      <circle cx="32" cy="46" r="6" fill="#ffffff"/>
      <path d="M32 76 L32 168 M18 96 Q32 82 46 96 M18 126 Q32 112 46 126 M22 152 L32 168 L42 152" stroke="#45f7df" stroke-width="4.5" stroke-linecap="round" fill="none"/>
      <circle cx="32" cy="108" r="5" fill="#ffe680"/>
      <circle cx="32" cy="138" r="5" fill="#ffe680"/>
    </svg>`,
    { size: 256 },
  );

  // 3. Golden Ginkgo & Spirit Leaf Cluster Card
  const GINKGO_CARD_TEX = svg(
    `<svg viewBox="0 0 128 128">
      <path d="M64 120 L64 78" stroke="#5c3a28" stroke-width="5" stroke-linecap="round"/>
      <path d="M64 84 C26 78 8 44 22 20 C34 28 46 22 54 12 C62 24 68 24 76 12 C84 22 96 28 108 20 C120 44 102 78 64 84 Z" fill="#ffb82e" stroke="#6b3710" stroke-width="3.5"/>
      <path d="M64 74 C38 68 24 44 34 26 C46 32 56 26 64 18 C72 26 82 32 94 26 C104 44 90 68 64 74 Z" fill="#ffe359"/>
      <path d="M64 80 L44 36 M64 80 L64 30 M64 80 L84 36" stroke="#d97b16" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  // 4. Sakura / Cecilia Blossom & Grass Tuft Card
  const GRASS_FLOWER_CARD_TEX = svg(
    `<svg viewBox="0 0 128 128">
      <path d="M26 124 Q18 76 8 34 Q28 68 38 124 Z" fill="#32a86c"/>
      <path d="M48 124 Q44 64 34 18 Q58 62 62 124 Z" fill="#5ce07c"/>
      <path d="M68 124 Q74 58 92 14 Q84 68 80 124 Z" fill="#46c972"/>
      <path d="M88 124 Q102 78 118 42 Q104 86 98 124 Z" fill="#2d9660"/>
      <circle cx="36" cy="24" r="12" fill="#ffffff" stroke="#5ce1ff" stroke-width="3"/>
      <circle cx="36" cy="24" r="5" fill="#ffe46b"/>
      <circle cx="90" cy="22" r="11" fill="#ffdbf0" stroke="#ff7aa8" stroke-width="3"/>
      <circle cx="90" cy="22" r="4.5" fill="#ffe46b"/>
    </svg>`,
    { size: 256 },
  );

  // 5. Hanging Temple Silk Banner / Golden Tassel Card
  const TASSEL_CARD_TEX = svg(
    `<svg viewBox="0 0 64 160">
      <path d="M16 4 L48 4 L54 112 L32 148 L10 112 Z" fill="#d9384a" stroke="#ffd86b" stroke-width="4"/>
      <path d="M22 14 L42 14 L45 104 L32 128 L19 104 Z" fill="#242b4a" stroke="#ffd86b" stroke-width="2.5"/>
      <circle cx="32" cy="46" r="10" fill="#45f7df" stroke="#ffffff" stroke-width="2.5"/>
      <path d="M32 64 L40 82 L32 100 L24 82 Z" fill="#ffd86b"/>
      <path d="M24 134 L22 156 M32 142 L32 158 M40 134 L42 156" stroke="#ffd86b" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  // 6. Hanging Ancient Ivy Vine Card
  const VINE_CARD_TEX = svg(
    `<svg viewBox="0 0 64 160">
      <path d="M32 0 Q18 40 34 80 Q46 118 28 156" stroke="#2c7a52" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M28 24 C10 18 8 36 26 38 Z" fill="#5ce07c" stroke="#1f593c" stroke-width="2.5"/>
      <path d="M34 52 C54 46 56 64 36 66 Z" fill="#46c972" stroke="#1f593c" stroke-width="2.5"/>
      <path d="M30 82 C10 78 10 96 28 96 Z" fill="#7be874" stroke="#1f593c" stroke-width="2.5"/>
      <path d="M36 110 C54 106 54 124 36 124 Z" fill="#46c972" stroke="#1f593c" stroke-width="2.5"/>
      <circle cx="28" cy="148" r="6" fill="#45f7df"/>
    </svg>`,
    { size: 256 },
  );

  // ============================================================================
  // SKELETON & MOVING JOINTS (Diorama category: root + hinge joints for moving
  // parts like the celestial astrolabe rings, hovering waypoint core, lantern)
  // ============================================================================

  const root = b.joint("root", { at: [0, 0, 0] });

  // Moving hinge joints for animated/articulated diorama elements
  const islandCore = b.joint("islandCore", {
    parent: root,
    at: [0, 1.05, 0],
    dir: [0, 1, 0],
    role: "hinge",
  });

  const astrolabeOuter = b.joint("astrolabeOuter", {
    parent: islandCore,
    at: [-0.22, 2.08, -0.25],
    dir: [0, 1, 0],
    role: "hinge",
  });

  const astrolabeInner = b.joint("astrolabeInner", {
    parent: astrolabeOuter,
    at: [-0.22, 2.08, -0.25],
    dir: [0.35, 0.9, 0.25],
    role: "hinge",
  });

  const waypointCore = b.joint("waypointCore", {
    parent: islandCore,
    at: [0.58, 1.62, 0.18],
    dir: [0, 1, 0],
    role: "hinge",
  });

  const bridgeLanternL = b.joint("bridgeLanternL", {
    parent: islandCore,
    at: [-0.36, 1.38, 0.56],
    dir: [0, -1, 0],
    role: "hinge",
  });

  const bridgeLanternR = b.joint("bridgeLanternR", {
    parent: islandCore,
    at: [0.22, 1.38, 0.56],
    dir: [0, -1, 0],
    role: "hinge",
  });

  const satelliteWest = b.joint("satelliteWest", {
    parent: root,
    at: [-1.06, 1.26, 0.14],
    dir: [0, 1, 0],
    role: "hinge",
  });

  const satelliteEast = b.joint("satelliteEast", {
    parent: root,
    at: [1.02, 0.96, -0.18],
    dir: [0, 1, 0],
    role: "hinge",
  });

  // ============================================================================
  // 1. GROUND CLOUD VORTEX, ABYSSAL PEDESTAL & SPLASH POOL (y = 0.0 to 0.42 m)
  // Grounds the diorama cleanly on y = 0 while making the sky island truly float
  // above a swirling sea of cel-shaded clouds and elemental updrafts.
  // ============================================================================

  // Main carved abyssal cloud-altar base sitting flat on y = 0
  const basePedestalProfile: OutlinePoint[] = [
    [0, 0],
    [1.18, 0, "sharp"],
    [1.22, 0.05, "sharp"],
    [1.14, 0.11, "sharp"],
    [1.02, 0.14, "sharp"],
    [0.96, 0.21, "sharp"],
    [0.84, 0.24, "sharp"],
    [0, 0.24],
  ];
  b.lathe(basePedestalProfile, {
    at: [0, 0, 0],
    segments: 16,
    color: ABYSS_STONE,
    bone: root,
    group: "base",
    name: "abyssPedestal",
  });

  // Ornate golden trim ring around the pedestal step
  const pedestalGoldProfile: OutlinePoint[] = [
    [0.98, 0.12, "sharp"],
    [1.06, 0.12, "sharp"],
    [1.07, 0.16, "sharp"],
    [0.98, 0.17, "sharp"],
  ];
  b.lathe(pedestalGoldProfile, {
    at: [0, 0, 0],
    segments: 16,
    color: GOLD_TRIM,
    bone: root,
    group: "base",
    name: "pedestalGoldRing",
  });

  // Eight carved stone compass lugs around the base perimeter resting at y = 0
  for (let i = 0; i < 8; i++) {
    const ang = (i * Math.PI * 2) / 8 + Math.PI / 8;
    const cx = Math.cos(ang) * 1.15;
    const cz = Math.sin(ang) * 1.15;
    b.frustumBox([cx, 0, cz], [cx * 0.94, 0.16, cz * 0.94], [0.22, 0.24], [0.16, 0.18], {
      up: [Math.cos(ang), 0, Math.sin(ang)],
      color: MARBLE_RUIN,
      bone: root,
      group: "base",
    });
    // Glowing elemental gem inlaid in each compass lug
    glow(
      b.part(new THREE.OctahedronGeometry(0.038, 0), i % 2 === 0 ? ANEMO_GLOW : GEO_GLOW, {
        at: [cx * 1.03, 0.09, cz * 1.03],
        bone: root,
        group: "base",
      }),
      1.3,
    );
  }

  // Lower catch-basin lagoon on top of the pedestal where the waterfall lands
  const lowerPoolProfile: OutlinePoint[] = [
    [0, 0.22],
    [0.82, 0.22, "sharp"],
    [0.82, 0.265, "sharp"],
    [0, 0.265],
  ];
  b.lathe(lowerPoolProfile, {
    at: [0, 0, 0.06],
    segments: 18,
    color: WATER_SURFACE,
    bone: root,
    group: "basePool",
    name: "lowerLagoon",
  });

  // Billowing stylized cloud ring hugging the pedestal & waterfall base (touching y = 0)
  const cloudPuffs: Array<{ pos: V3; scale: V3 }> = [
    // Outer low cloud bank (sits right on y = 0)
    { pos: [-0.92, 0.12, 0.58], scale: [0.28, 0.12, 0.22] },
    { pos: [-0.68, 0.16, 0.78], scale: [0.32, 0.16, 0.25] },
    { pos: [-0.36, 0.14, 0.92], scale: [0.28, 0.14, 0.22] },
    { pos: [0.38, 0.15, 0.90], scale: [0.30, 0.15, 0.24] },
    { pos: [0.72, 0.17, 0.72], scale: [0.34, 0.17, 0.26] },
    { pos: [0.95, 0.13, 0.42], scale: [0.27, 0.13, 0.22] },
    { pos: [0.98, 0.14, -0.35], scale: [0.29, 0.14, 0.24] },
    { pos: [0.74, 0.18, -0.72], scale: [0.35, 0.18, 0.28] },
    { pos: [0.32, 0.15, -0.94], scale: [0.30, 0.15, 0.24] },
    { pos: [-0.28, 0.16, -0.92], scale: [0.32, 0.16, 0.26] },
    { pos: [-0.72, 0.18, -0.74], scale: [0.34, 0.18, 0.26] },
    { pos: [-0.98, 0.14, -0.32], scale: [0.28, 0.14, 0.22] },
    // Mid-height swirling cloud puffs around the island underbelly
    { pos: [-0.52, 0.34, 0.48], scale: [0.24, 0.13, 0.20] },
    { pos: [0.54, 0.36, 0.44], scale: [0.25, 0.14, 0.21] },
    { pos: [0.58, 0.38, -0.46], scale: [0.26, 0.14, 0.22] },
    { pos: [-0.56, 0.36, -0.48], scale: [0.25, 0.14, 0.21] },
    { pos: [0.0, 0.32, -0.64], scale: [0.28, 0.15, 0.22] },
  ];
  for (const puff of cloudPuffs) {
    b.part(new THREE.SphereGeometry(1, 10, 8), CLOUD_PAINT, {
      at: puff.pos,
      scale: puff.scale,
      bone: root,
      group: "clouds",
    });
  }

  // Swirling C-shaped cloud ribbon trails curling around the base
  for (const s of [1, -1]) {
    const ribbonPath = catmull([
      [s * 1.12, 0.18, 0.45],
      [s * 0.92, 0.28, 0.88],
      [s * 0.38, 0.36, 1.02],
      [-s * 0.12, 0.42, 0.86],
    ]);
    b.sweep(
      ribbonPath,
      (t) => [0.075 * Math.sin(t * Math.PI) + 0.012, 0.032 * Math.sin(t * Math.PI) + 0.008],
      {
        color: CLOUD_PAINT,
        bone: root,
        group: "clouds",
      },
    );
  }

  // ============================================================================
  // 2. FLOATING SKY ISLAND MASS (Craggy inverted-cone rock spire + upper tiers)
  // ============================================================================

  // Central inverted-cone craggy spire (y = 0.36 up to y = 1.24)
  const mainSpireProfile: OutlinePoint[] = [
    [0, 0.36, "sharp"],
    [0.09, 0.46, "sharp"],
    [0.19, 0.62, "sharp"],
    [0.36, 0.76, "sharp"],
    [0.54, 0.90, "sharp"],
    [0.78, 1.04, "sharp"],
    [0.92, 1.15, "sharp"],
    [0.88, 1.22, "sharp"],
    [0, 1.22],
  ];
  b.lathe(mainSpireProfile, {
    at: [0, 0, 0],
    segments: 9,
    spin: 18,
    color: CLIFF_STRATA,
    bone: islandCore,
    group: "islandRock",
    name: "mainRockSpire",
  });

  // Faceted rock buttresses jutting around the main island underside to break symmetry
  const buttressSpecs: Array<{
    ang: number;
    dist: number;
    topY: number;
    botY: number;
    wTop: number;
    dTop: number;
    lean: number;
  }> = [
    { ang: 15, dist: 0.62, topY: 1.22, botY: 0.56, wTop: 0.46, dTop: 0.42, lean: 0.18 },
    { ang: 62, dist: 0.68, topY: 1.25, botY: 0.58, wTop: 0.52, dTop: 0.44, lean: 0.22 },
    { ang: 112, dist: 0.72, topY: 1.32, botY: 0.62, wTop: 0.56, dTop: 0.48, lean: 0.24 },
    { ang: 158, dist: 0.76, topY: 1.46, botY: 0.66, wTop: 0.62, dTop: 0.52, lean: 0.26 },
    { ang: 205, dist: 0.78, topY: 1.48, botY: 0.64, wTop: 0.64, dTop: 0.54, lean: 0.25 },
    { ang: 252, dist: 0.70, topY: 1.34, botY: 0.58, wTop: 0.54, dTop: 0.46, lean: 0.22 },
    { ang: 302, dist: 0.64, topY: 1.24, botY: 0.54, wTop: 0.48, dTop: 0.42, lean: 0.20 },
    { ang: 342, dist: 0.58, topY: 1.18, botY: 0.58, wTop: 0.42, dTop: 0.38, lean: 0.16 },
  ];

  for (const spec of buttressSpecs) {
    const rad = (spec.ang * Math.PI) / 180;
    const tx = Math.cos(rad) * spec.dist;
    const tz = Math.sin(rad) * spec.dist;
    const bx = Math.cos(rad) * (spec.dist * spec.lean);
    const bz = Math.sin(rad) * (spec.dist * spec.lean);
    b.frustumBox(
      [bx, spec.botY, bz],
      [tx, spec.topY, tz],
      [0.08, 0.08],
      [spec.wTop, spec.dTop],
      {
        up: [Math.cos(rad), 0, Math.sin(rad)],
        color: MOSSY_ROCK,
        bone: islandCore,
        group: "islandRock",
      },
    );
  }

  // Hanging stalactite rock spikes beneath the island
  const stalactites: Array<{ pos: V3; len: number; r: number }> = [
    { pos: [0.0, 0.44, 0.0], len: 0.22, r: 0.09 },
    { pos: [-0.26, 0.62, -0.18], len: 0.24, r: 0.08 },
    { pos: [0.28, 0.64, -0.22], len: 0.22, r: 0.075 },
    { pos: [-0.38, 0.74, 0.24], len: 0.20, r: 0.07 },
    { pos: [0.36, 0.72, 0.26], len: 0.19, r: 0.068 },
    { pos: [0.04, 0.68, -0.44], len: 0.25, r: 0.082 },
    { pos: [-0.48, 0.82, -0.34], len: 0.18, r: 0.065 },
    { pos: [0.46, 0.80, -0.36], len: 0.18, r: 0.065 },
  ];
  for (const st of stalactites) {
    b.spike(st.pos, [0, -1, 0], st.len, st.r, {
      section: { ngon: 5 },
      color: CLIFF_STRATA,
      bone: islandCore,
      group: "islandRock",
    });
  }

  // Main lush meadow terrace (Tier 1, y = 1.14 to 1.28)
  const mainTerraceOutline: OutlinePoint[] = [
    [-0.92, -0.15],
    [-0.78, -0.68],
    [-0.28, -0.92],
    [0.36, -0.88],
    [0.84, -0.56],
    [0.94, 0.06],
    [0.76, 0.62],
    [0.34, 0.84],
    [0.14, 0.72, "sharp"], // waterfall notch right
    [-0.08, 0.68, "sharp"], // waterfall notch back
    [-0.26, 0.76, "sharp"], // waterfall notch left
    [-0.68, 0.68],
    [-0.94, 0.28],
  ];
  const mainMeadow = b.extrude(mainTerraceOutline, {
    at: [0, 1.21, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.14,
    bevel: 0.035,
    smoothing: 1,
    color: TURF_GRASS,
    bone: islandCore,
    group: "islandTurf",
    name: "mainMeadowTerrace",
  });

  // Upper Sanctuary Plateau (Tier 2, back-left & center-back, y = 1.26 to 1.54)
  const upperSanctuaryOutline: OutlinePoint[] = [
    [-0.82, -0.18],
    [-0.72, -0.66],
    [-0.25, -0.88],
    [0.28, -0.82],
    [0.48, -0.42],
    [0.32, -0.05],
    [-0.18, 0.08],
    [-0.62, 0.04],
  ];
  const upperPlateau = b.extrude(upperSanctuaryOutline, {
    at: [-0.08, 1.40, -0.06],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.28,
    bevel: 0.04,
    smoothing: 1,
    color: GOLDEN_TURF,
    bone: islandCore,
    group: "islandTurf",
    name: "upperSanctuaryPlateau",
  });

  // Eastern Blossom Knoll (Tier 1.5, right side, y = 1.24 to 1.42)
  const eastKnollOutline: OutlinePoint[] = [
    [0.26, -0.32],
    [0.68, -0.42],
    [0.88, -0.08],
    [0.78, 0.38],
    [0.42, 0.46],
    [0.24, 0.12],
  ];
  const eastKnoll = b.extrude(eastKnollOutline, {
    at: [0.04, 1.33, 0.04],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.18,
    bevel: 0.035,
    smoothing: 1,
    color: TURF_GRASS,
    bone: islandCore,
    group: "islandTurf",
    name: "eastBlossomKnoll",
  });

  // ============================================================================
  // 3. ORBITING SATELLITE FLOATING ROCKS & SUSPENSION BRIDGES
  // ============================================================================

  // West Satellite Isle (higher, carries a mini shrine lantern & glowing ore)
  const westIsleProfile: OutlinePoint[] = [
    [0, -0.34, "sharp"],
    [0.08, -0.18, "sharp"],
    [0.22, -0.04, "sharp"],
    [0.26, 0.05, "sharp"],
    [0, 0.06],
  ];
  b.lathe(westIsleProfile, {
    at: [-1.06, 1.26, 0.14],
    segments: 7,
    color: MOSSY_ROCK,
    bone: satelliteWest,
    group: "satelliteWest",
  });
  b.part(new THREE.CylinderGeometry(0.24, 0.22, 0.06, 7), GOLDEN_TURF, {
    at: [-1.06, 1.32, 0.14],
    bone: satelliteWest,
    group: "satelliteWest",
  });

  // East Satellite Isle (mid height, carries a twisted bonsai & Geo crystal)
  const eastIsleProfile: OutlinePoint[] = [
    [0, -0.30, "sharp"],
    [0.07, -0.16, "sharp"],
    [0.19, -0.03, "sharp"],
    [0.23, 0.05, "sharp"],
    [0, 0.05],
  ];
  b.lathe(eastIsleProfile, {
    at: [1.02, 0.96, -0.18],
    segments: 7,
    color: MOSSY_ROCK,
    bone: satelliteEast,
    group: "satelliteEast",
  });
  b.part(new THREE.CylinderGeometry(0.21, 0.19, 0.055, 7), TURF_GRASS, {
    at: [1.02, 1.01, -0.18],
    bone: satelliteEast,
    group: "satelliteEast",
  });

  // Two smaller levitating stepping-stones spiraling around the island
  const steppingStones: Array<{ pos: V3; r: number; h: number }> = [
    { pos: [-0.94, 0.88, -0.58], r: 0.14, h: 0.22 },
    { pos: [0.88, 0.76, 0.56], r: 0.13, h: 0.20 },
    { pos: [-0.66, 1.72, -0.78], r: 0.11, h: 0.18 },
  ];
  for (const st of steppingStones) {
    b.spike([st.pos[0], st.pos[1] + 0.03, st.pos[2]], [0, -1, 0], st.h, st.r, {
      section: { ngon: 6 },
      color: MOSSY_ROCK,
      bone: islandCore,
      group: "steppingStones",
    });
    b.part(new THREE.CylinderGeometry(st.r * 0.95, st.r * 0.85, 0.04, 6), TURF_GRASS, {
      at: [st.pos[0], st.pos[1] + 0.04, st.pos[2]],
      bone: islandCore,
      group: "steppingStones",
    });
  }

  // Glowing golden energy tether chains connecting West Satellite Isle to the main island
  for (const zOff of [-0.08, 0.08]) {
    const chainCurve = bezier(
      [-0.84, 1.31, 0.14 + zOff],
      [-0.78, 1.24, 0.14 + zOff],
      [-0.72, 1.25, 0.14 + zOff],
    );
    glow(
      b.sweep(chainCurve, 0.012, {
        color: GOLD_BRIGHT,
        bone: islandCore,
        group: "satelliteWest",
      }),
      1.2,
    );
  }
  // Wooden stepping planks on the energy bridge to West Satellite Isle
  for (let i = 0; i < 4; i++) {
    const t = (i + 0.5) / 4;
    const px = -0.84 + t * 0.14;
    const py = 1.28 - Math.sin(t * Math.PI) * 0.03;
    b.part(new THREE.BoxGeometry(0.032, 0.016, 0.20), SPIRIT_BARK, {
      at: [px, py, 0.14],
      bone: islandCore,
      group: "satelliteWest",
    });
  }

  // ============================================================================
  // 4. CELESTIAL MARBLE RUINS, COLONNADE, ARCHWAY & ROTATING ASTROLABE
  // ============================================================================

  // Upper Sanctuary Circular Paved Plaza (centered around [-0.22, 1.55, -0.25])
  const PLAZA_C: V3 = [-0.22, 1.55, -0.25];

  b.lathe(
    [
      [0, 0],
      [0.52, 0, "sharp"],
      [0.54, 0.04, "sharp"],
      [0.49, 0.08, "sharp"],
      [0, 0.08],
    ],
    {
      at: [PLAZA_C[0], PLAZA_C[1] - 0.02, PLAZA_C[2]],
      segments: 16,
      color: MARBLE_RUIN,
      bone: islandCore,
      group: "ruins",
      name: "sanctuaryPlaza",
    },
  );

  // Ornate golden ring inlaid in the sanctuary plaza floor
  b.lathe(
    [
      [0.42, 0.06, "sharp"],
      [0.47, 0.06, "sharp"],
      [0.47, 0.088, "sharp"],
      [0.42, 0.088, "sharp"],
    ],
    {
      at: [PLAZA_C[0], PLAZA_C[1] - 0.02, PLAZA_C[2]],
      segments: 16,
      color: GOLD_TRIM,
      bone: islandCore,
      group: "ruins",
    },
  );

  // Glowing Astrolabe Rune Seal on the Sanctuary Plaza Floor
  glow(
    b.part(new THREE.CircleGeometry(0.41, 20), "#ffffff", {
      at: [PLAZA_C[0], PLAZA_C[1] + 0.068, PLAZA_C[2]],
      dir: [0, 1, 0],
      up: [0, 0, 1],
      axis: "z",
      texture: RUNE_SEAL_TEX,
      bone: islandCore,
      group: "ruins",
      name: "plazaRuneSeal",
    }),
    1.35,
  );

  // Stepped marble staircase leading from Tier 1 meadow up to Tier 2 Sanctuary Plaza
  for (let step = 0; step < 6; step++) {
    const t = step / 5;
    const sx = lerp([0.08, 1.28, 0.24], [PLAZA_C[0] + 0.16, 1.56, PLAZA_C[2] + 0.36], t);
    const w = 0.28 - step * 0.012;
    b.part(new THREE.BoxGeometry(w, 0.048, 0.11), MARBLE_RUIN, {
      at: sx,
      rotation: [0, -24, 0],
      bone: islandCore,
      group: "ruins",
    });
    // Gold step nosing strip
    b.part(new THREE.BoxGeometry(w - 0.02, 0.016, 0.022), GOLD_TRIM, {
      at: [sx.x + 0.018, sx.y + 0.02, sx.z + 0.042],
      rotation: [0, -24, 0],
      bone: islandCore,
      group: "ruins",
    });
  }

  // Staircase side balustrades with golden finials
  for (const s of [-1, 1]) {
    const railStart: V3 = [0.08 + s * 0.16, 1.32, 0.26 - s * 0.06];
    const railEnd: V3 = [PLAZA_C[0] + 0.16 + s * 0.14, 1.60, PLAZA_C[2] + 0.36 - s * 0.06];
    b.rod(railStart, railEnd, 0.024, MARBLE_CARVED, {
      section: "box",
      bone: islandCore,
      group: "ruins",
    });
    for (const postPos of [railStart, railEnd]) {
      b.part(new THREE.BoxGeometry(0.065, 0.14, 0.065), MARBLE_CARVED, {
        at: [postPos[0], postPos[1] + 0.03, postPos[2]],
        bone: islandCore,
        group: "ruins",
      });
      b.part(new THREE.OctahedronGeometry(0.032, 0), GOLD_TRIM, {
        at: [postPos[0], postPos[1] + 0.12, postPos[2]],
        bone: islandCore,
        group: "ruins",
      });
    }
  }

  // Helper to build fluted celestial columns (intact or broken)
  const buildColumn = (pos: V3, height: number, broken: boolean, tilt: V3 = [0, 0, 0]) => {
    // Plinth & molded base
    b.part(new THREE.BoxGeometry(0.16, 0.05, 0.16), MARBLE_CARVED, {
      at: [pos[0], pos[1] + 0.025, pos[2]],
      rotation: tilt,
      bone: islandCore,
      group: "ruins",
    });
    b.lathe(
      [
        [0, 0],
        [0.075, 0, "sharp"],
        [0.068, 0.03, "sharp"],
        [0.056, 0.05, "sharp"],
        [0, 0.05],
      ],
      {
        at: [pos[0], pos[1] + 0.05, pos[2]],
        segments: 8,
        color: GOLD_TRIM,
        bone: islandCore,
        group: "ruins",
      },
    );
    // Shaft
    const topPos: V3 = [
      pos[0] + Math.sin(tilt[2] * (Math.PI / 180)) * height,
      pos[1] + 0.09 + height,
      pos[2] + Math.sin(tilt[0] * (Math.PI / 180)) * height,
    ];
    b.rod([pos[0], pos[1] + 0.09, pos[2]], topPos, [0.054, broken ? 0.050 : 0.048], MARBLE_RUIN, {
      sides: 8,
      smooth: false,
      bone: islandCore,
      group: "ruins",
    });
    // Golden band partway up the shaft
    const midPos = lerp([pos[0], pos[1] + 0.09, pos[2]], topPos, 0.55);
    b.part(new THREE.CylinderGeometry(0.058, 0.058, 0.035, 8), GOLD_TRIM, {
      at: midPos,
      rotation: tilt,
      bone: islandCore,
      group: "ruins",
    });
    // Glowing rune tablet on the front of taller columns
    if (height >= 0.45) {
      const runePos = lerp([pos[0], pos[1] + 0.09, pos[2]], topPos, 0.35);
      glow(
        b.part(new THREE.PlaneGeometry(0.055, 0.16), "#ffffff", {
          at: [runePos.x + 0.015, runePos.y, runePos.z + 0.056],
          dir: [0.25, 0, 1],
          axis: "z",
          texture: PILLAR_RUNE_TEX,
          bone: islandCore,
          group: "ruins",
        }),
        1.25,
      );
    }
    if (!broken) {
      // Ornate capital + golden abacus
      b.lathe(
        [
          [0, 0],
          [0.05, 0, "sharp"],
          [0.072, 0.04, "sharp"],
          [0.082, 0.07, "sharp"],
          [0, 0.07],
        ],
        {
          at: topPos,
          segments: 8,
          color: GOLD_TRIM,
          bone: islandCore,
          group: "ruins",
        },
      );
      b.part(new THREE.BoxGeometry(0.17, 0.045, 0.17), MARBLE_CARVED, {
        at: [topPos[0], topPos[1] + 0.085, topPos[2]],
        bone: islandCore,
        group: "ruins",
      });
    } else {
      // Jagged fractured cap
      b.part(new THREE.DodecahedronGeometry(0.052, 0), MARBLE_RUIN, {
        at: topPos,
        scale: [1.0, 0.55, 1.0],
        rotation: [22, 35, -18],
        bone: islandCore,
        group: "ruins",
      });
    }
  };

  // Colonnade pillars around the back/left of the Sanctuary Plaza
  const colPos1: V3 = [-0.62, 1.60, -0.34];
  const colPos2: V3 = [-0.46, 1.60, -0.62];
  const colPos3: V3 = [-0.10, 1.60, -0.68];
  const colPos4: V3 = [0.20, 1.60, -0.52];

  buildColumn(colPos1, 0.64, false);
  buildColumn(colPos2, 0.64, false);
  buildColumn(colPos3, 0.64, false);
  buildColumn(colPos4, 0.38, true, [4, 0, -6]); // Dramatically broken right-end column

  // Fallen broken column drum lying on the eastern meadow
  b.rod([0.34, 1.33, -0.32], [0.54, 1.31, -0.20], 0.048, MARBLE_RUIN, {
    sides: 8,
    smooth: false,
    bone: islandCore,
    group: "ruins",
  });
  b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 8), GOLD_TRIM, {
    at: [0.44, 1.32, -0.26],
    dir: [0.20, -0.02, 0.12],
    bone: islandCore,
    group: "ruins",
  });

  // Grand Curved Celestial Archablature spanning columns 1 -> 2 -> 3
  const archPath = catmull([
    [colPos1[0], 2.34, colPos1[2]],
    [-0.56, 2.42, -0.50],
    [colPos2[0], 2.46, colPos2[2]],
    [-0.28, 2.52, -0.68],
    [colPos3[0], 2.34, colPos3[2]],
  ]);
  b.sweep(archPath, [0.065, 0.055], {
    section: "box",
    color: MARBLE_CARVED,
    bone: islandCore,
    group: "ruins",
    name: "celestialArchBeam",
  });

  // Golden crest rail atop the curved architrave
  const archGoldPath = catmull([
    [colPos1[0], 2.41, colPos1[2]],
    [-0.56, 2.49, -0.50],
    [colPos2[0], 2.53, colPos2[2]],
    [-0.28, 2.59, -0.68],
    [colPos3[0], 2.41, colPos3[2]],
  ]);
  b.sweep(archGoldPath, [0.032, 0.028], {
    section: "box",
    color: GOLD_TRIM,
    bone: islandCore,
    group: "ruins",
  });

  // Ornate winged golden finials along the top of the arch
  b.along(archGoldPath, 5, (pt) => {
    b.spike(pt.at, [0, 1, 0], 0.11, 0.028, {
      section: { ngon: 4 },
      color: GOLD_TRIM,
      bone: islandCore,
      group: "ruins",
    });
    glow(
      b.part(new THREE.OctahedronGeometry(0.024, 0), ANEMO_GLOW, {
        at: [pt.at.x, pt.at.y + 0.12, pt.at.z],
        bone: islandCore,
        group: "ruins",
      }),
      1.3,
    );
  });

  // Hanging crimson & gold silk temple banners suspended under the archways
  const bannerFrames: Frame[] = [
    frame([-0.54, 2.28, -0.48], [0, 1, 0]),
    frame([-0.28, 2.32, -0.65], [0, 1, 0]),
  ];
  b.cards(bannerFrames, TASSEL_CARD_TEX, {
    size: [0.14, 0.34],
    lean: 180,
    flow: [0.4, 0, 0.9],
    bone: islandCore,
    group: "ruins",
    name: "templeBanners",
  });

  // Hanging ivy vines draped from the broken arch & columns
  const archVineFrames: Frame[] = [
    frame([-0.60, 2.26, -0.36], [0, 1, 0]),
    frame([-0.42, 2.34, -0.60], [0, 1, 0]),
    frame([-0.12, 2.26, -0.66], [0, 1, 0]),
    frame([0.20, 1.98, -0.50], [0, 1, 0]),
  ];
  b.cards(archVineFrames, VINE_CARD_TEX, {
    size: [0.12, 0.32],
    lean: 180,
    flow: [0.3, 0, 1],
    vary: 0.15,
    rng: rng(404),
    bone: islandCore,
    group: "ruins",
    name: "archVines",
  });

  // ============================================================================
  // 5. ROTATING CELESTIAL ASTROLABE & ANEMO CORE (on hinge joints!)
  // ============================================================================

  const ASTRO_C: V3 = [-0.22, 2.08, -0.25];

  // Outer golden armillary ring (rides `astrolabeOuter` hinge joint)
  const makeCirclePts = (center: V3, r: number, axis: "xy" | "yz" | "xz", count = 16): V3[] => {
    return Array.from({ length: count }, (_, i) => {
      const a = (i * Math.PI * 2) / count;
      if (axis === "xy") return [center[0] + Math.cos(a) * r, center[1] + Math.sin(a) * r, center[2]];
      if (axis === "yz") return [center[0], center[1] + Math.cos(a) * r, center[2] + Math.sin(a) * r];
      return [center[0] + Math.cos(a) * r, center[1], center[2] + Math.sin(a) * r];
    });
  };

  b.sweep(catmull(makeCirclePts(ASTRO_C, 0.24, "xy"), { closed: true }), [0.022, 0.014], {
    section: "box",
    color: GOLD_TRIM,
    bone: astrolabeOuter,
    group: "astrolabe",
    name: "astrolabeOuterRing",
  });

  // Four cardinal pointer spikes on the outer astrolabe ring
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    const px = ASTRO_C[0] + Math.cos(a) * 0.25;
    const py = ASTRO_C[1] + Math.sin(a) * 0.25;
    b.spike([px, py, ASTRO_C[2]], [Math.cos(a), Math.sin(a), 0], 0.07, 0.022, {
      section: { ngon: 4 },
      color: GOLD_TRIM,
      bone: astrolabeOuter,
      group: "astrolabe",
    });
  }

  // Inner tilted armillary ring + glowing Anemo Celestia Core (rides `astrolabeInner` hinge joint)
  b.sweep(catmull(makeCirclePts(ASTRO_C, 0.16, "yz"), { closed: true }), [0.018, 0.012], {
    section: "box",
    color: GOLD_TRIM,
    bone: astrolabeInner,
    group: "astrolabe",
    name: "astrolabeInnerRing",
  });

  b.sweep(catmull(makeCirclePts(ASTRO_C, 0.19, "xz"), { closed: true }), 0.010, {
    color: BRONZE_ORNATE,
    bone: astrolabeInner,
    group: "astrolabe",
  });

  // Radiant central Anemo star crystal inside the astrolabe
  glow(
    b.part(new THREE.OctahedronGeometry(0.075, 0), ANEMO_GLOW, {
      at: ASTRO_C,
      scale: [0.85, 1.35, 0.85],
      bone: astrolabeInner,
      group: "astrolabe",
      name: "astrolabeCoreCrystal",
    }),
    1.8,
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.095, 0), ANEMO_PALE, {
      at: ASTRO_C,
      scale: [1.3, 0.45, 0.45],
      bone: astrolabeInner,
      group: "astrolabe",
    }),
    1.4,
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.095, 0), ANEMO_PALE, {
      at: ASTRO_C,
      scale: [0.45, 0.45, 1.3],
      bone: astrolabeInner,
      group: "astrolabe",
    }),
    1.4,
  );

  // ============================================================================
  // 6. TELEPORT WAYPOINT SHRINE (on Eastern Knoll, rides `waypointCore` hinge)
  // ============================================================================

  const WP_BASE: V3 = [0.58, 1.42, 0.18];

  // Carved stone & gold waypoint pedestal
  b.lathe(
    [
      [0, 0],
      [0.14, 0, "sharp"],
      [0.12, 0.04, "sharp"],
      [0.08, 0.09, "sharp"],
      [0.10, 0.12, "sharp"],
      [0, 0.12],
    ],
    {
      at: WP_BASE,
      segments: 6,
      color: MARBLE_CARVED,
      bone: islandCore,
      group: "waypoint",
    },
  );

  // Three curved golden claw prongs cradling the floating waypoint crystal
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3 + 0.3;
    const c1: V3 = [WP_BASE[0] + Math.cos(a) * 0.09, WP_BASE[1] + 0.08, WP_BASE[2] + Math.sin(a) * 0.09];
    const c2: V3 = [WP_BASE[0] + Math.cos(a) * 0.14, WP_BASE[1] + 0.22, WP_BASE[2] + Math.sin(a) * 0.14];
    const c3: V3 = [WP_BASE[0] + Math.cos(a) * 0.07, WP_BASE[1] + 0.36, WP_BASE[2] + Math.sin(a) * 0.07];
    b.sweep(bezier(c1, c2, c3), [0.022, 0.008], {
      section: { ngon: 4 },
      color: GOLD_TRIM,
      bone: islandCore,
      group: "waypoint",
    });
  }

  // Hovering glowing Waypoint Diamond + fin crown (rides `waypointCore` hinge joint)
  glow(
    b.part(new THREE.OctahedronGeometry(0.065, 0), ANEMO_GLOW, {
      at: [0.58, 1.65, 0.18],
      scale: [0.75, 1.6, 0.75],
      bone: waypointCore,
      group: "waypoint",
      name: "waypointCrystal",
    }),
    1.7,
  );
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    b.part(new THREE.BoxGeometry(0.018, 0.09, 0.032), GOLD_TRIM, {
      at: [0.58 + Math.cos(a) * 0.075, 1.66, 0.18 + Math.sin(a) * 0.075],
      rotation: [0, (-a * 180) / Math.PI, 12],
      bone: waypointCore,
      group: "waypoint",
    });
  }

  // ============================================================================
  // 7. TWIN-TIERED WATERFALL, SPRING GROTTO, ARCHED BRIDGE & HANGING LANTERNS
  // ============================================================================

  // Sacred Spring Rock Grotto at the edge of the Upper Sanctuary (around [0.08, 1.54, -0.18])
  const grottoRocks: Array<{ pos: V3; r: number; scale: V3 }> = [
    { pos: [-0.08, 1.60, -0.22], r: 0.14, scale: [1.2, 0.9, 1.0] },
    { pos: [0.22, 1.58, -0.20], r: 0.13, scale: [1.1, 0.85, 1.1] },
    { pos: [0.08, 1.65, -0.32], r: 0.15, scale: [1.3, 1.0, 0.9] },
  ];
  for (const gr of grottoRocks) {
    b.part(new THREE.DodecahedronGeometry(gr.r, 0), MOSSY_ROCK, {
      at: gr.pos,
      scale: gr.scale,
      flat: true,
      bone: islandCore,
      group: "waterfall",
    });
  }

  // Glowing Hydro Spirit Stone inside the spring mouth
  glow(
    b.part(new THREE.OctahedronGeometry(0.055, 0), HYDRO_GLOW, {
      at: [0.07, 1.58, -0.22],
      scale: [0.9, 1.4, 0.9],
      bone: islandCore,
      group: "waterfall",
    }),
    1.5,
  );

  // Upper Spring Basin & Middle River Pool on the main meadow terrace
  b.part(new THREE.CylinderGeometry(0.28, 0.26, 0.03, 12), WATER_SURFACE, {
    at: [0.02, 1.28, 0.12],
    scale: [0.85, 1, 1.55],
    bone: islandCore,
    group: "waterfall",
    name: "midRiverPool",
  });

  // Upper Waterfall Cascade (from Upper Sanctuary grotto down to Middle River Pool)
  const upperFallPath = bezier(
    [0.06, 1.55, -0.16],
    [0.05, 1.50, -0.02],
    [0.03, 1.38, 0.02],
    [0.02, 1.28, 0.04],
  );
  b.sweep(upperFallPath, (t) => [0.11 + 0.03 * t, 0.025], {
    color: WATERFALL_STREAM,
    bone: islandCore,
    group: "waterfall",
    name: "upperWaterfall",
  });

  // Main Grand Waterfall Cascade (plunging from the front lip of the floating island at z = 0.52
  // all the way down into the lower pedestal lagoon at y = 0.25!)
  const mainFallCenter = bezier(
    [-0.04, 1.27, 0.42],
    [-0.05, 1.24, 0.66],
    [-0.05, 0.78, 0.72],
    [-0.04, 0.25, 0.64],
  );
  b.sweep(
    mainFallCenter,
    (t) => [0.14 + 0.06 * Math.sin(t * Math.PI) + 0.04 * t, 0.032 * (1 - 0.2 * t)],
    {
      color: WATERFALL_STREAM,
      bone: root,
      group: "waterfall",
      name: "mainWaterfallCenter",
    },
  );

  // Flanking glowing foam & mist streams on both sides of the main waterfall
  for (const s of [-1, 1]) {
    const sideRibbon = bezier(
      [-0.04 + s * 0.11, 1.27, 0.44],
      [-0.05 + s * 0.14, 1.22, 0.68],
      [-0.05 + s * 0.16, 0.76, 0.75],
      [-0.04 + s * 0.18, 0.25, 0.66],
    );
    glow(
      b.sweep(sideRibbon, (t) => [0.036 * (1 + 0.3 * t), 0.018], {
        color: HYDRO_FOAM,
        bone: root,
        group: "waterfall",
      }),
      1.15,
    );
  }

  // Waterfall crest foam puffs (at the lip where water tips over the cliff) & base splash plumes
  for (let i = -2; i <= 2; i++) {
    // Lip foam
    glow(
      b.part(new THREE.SphereGeometry(0.042, 8, 6), HYDRO_FOAM, {
        at: [-0.04 + i * 0.055, 1.27, 0.56 + (i % 2) * 0.02],
        scale: [1.2, 0.7, 1.1],
        bone: islandCore,
        group: "waterfall",
      }),
      1.1,
    );
  }
  // Base splash ring & mist spheres where the waterfall hits the lower pool
  for (let i = 0; i < 9; i++) {
    const ang = (i * Math.PI * 2) / 9;
    const r = 0.20 + (i % 2) * 0.06;
    const sx = -0.04 + Math.cos(ang) * r;
    const sz = 0.64 + Math.sin(ang) * (r * 0.75);
    glow(
      b.part(new THREE.SphereGeometry(0.065, 8, 6), i % 2 === 0 ? HYDRO_FOAM : HYDRO_GLOW, {
        at: [sx, 0.27 + (i % 3) * 0.02, sz],
        scale: [1.3, 0.75, 1.2],
        bone: root,
        group: "waterfall",
      }),
      1.2,
    );
  }

  // Ornate Arched Stone & Gold Bridge crossing the river just behind the waterfall lip
  const bridgeArch = bezier([-0.34, 1.27, 0.36], [-0.06, 1.42, 0.36], [0.22, 1.27, 0.36]);
  b.sweep(bridgeArch, [0.11, 0.028], {
    section: "box",
    up: [0, 1, 0],
    color: MARBLE_CARVED,
    bone: islandCore,
    group: "bridge",
    name: "riverBridgeDeck",
  });

  // Bridge side parapets & golden posts
  for (const zSide of [-0.095, 0.095]) {
    const railCurve = bezier(
      [-0.34, 1.33, 0.36 + zSide],
      [-0.06, 1.48, 0.36 + zSide],
      [0.22, 1.33, 0.36 + zSide],
    );
    b.sweep(railCurve, [0.016, 0.018], {
      section: "box",
      up: [0, 1, 0],
      color: GOLD_TRIM,
      bone: islandCore,
      group: "bridge",
    });
    for (const u of [0, 0.5, 1]) {
      const pt = railCurve.at(u);
      b.part(new THREE.BoxGeometry(0.036, 0.09, 0.036), MARBLE_CARVED, {
        at: [pt.x, pt.y - 0.02, pt.z],
        bone: islandCore,
        group: "bridge",
      });
      b.part(new THREE.SphereGeometry(0.022, 6, 6), GOLD_TRIM, {
        at: [pt.x, pt.y + 0.035, pt.z],
        bone: islandCore,
        group: "bridge",
      });
    }
  }

  // Two Hanging Celestial Lanterns at the front cliff corners flanking the waterfall (on hinge joints!)
  const lanternSpec = [
    { joint: bridgeLanternL, base: [-0.36, 1.28, 0.56] as V3 },
    { joint: bridgeLanternR, base: [0.22, 1.28, 0.56] as V3 },
  ];
  for (const lan of lanternSpec) {
    // Curved bronze & gold lamp post anchored on the cliff edge
    const postCurve = bezier(
      lan.base,
      [lan.base[0], lan.base[1] + 0.22, lan.base[2] + 0.04],
      [lan.base[0], lan.base[1] + 0.24, lan.base[2] + 0.14],
    );
    b.sweep(postCurve, [0.022, 0.012], {
      section: { ngon: 6 },
      color: BRONZE_ORNATE,
      bone: islandCore,
      group: "lanterns",
    });
    // Hanging lantern body on the hinge joint
    const lp = [lan.base[0], lan.base[1] + 0.10, lan.base[2] + 0.14] as V3;
    b.part(new THREE.ConeGeometry(0.055, 0.04, 6), GOLD_TRIM, {
      at: [lp[0], lp[1] + 0.05, lp[2]],
      bone: lan.joint,
      group: "lanterns",
    });
    glow(
      b.part(new THREE.OctahedronGeometry(0.038, 0), GEO_GLOW, {
        at: lp,
        scale: [0.85, 1.3, 0.85],
        bone: lan.joint,
        group: "lanterns",
      }),
      1.8,
    );
    b.spike([lp[0], lp[1] - 0.04, lp[2]], [0, -1, 0], 0.05, 0.02, {
      section: { ngon: 4 },
      color: CRIMSON_CORD,
      bone: lan.joint,
      group: "lanterns",
    });
  }

  // ============================================================================
  // 8. ANCIENT GOLDEN GINKGO SPIRIT TREE & SAKURA BLOSSOM TREE
  // ============================================================================

  // A. Hero Golden Ginkgo Spirit Tree on the Upper Sanctuary (back-right of the plaza)
  const TREE_ROOT: V3 = [0.24, 1.52, -0.36];

  // Sweeping gnarled roots gripping the cliff and sanctuary stones
  const rootPaths: V3[][] = [
    [
      [0.24, 1.56, -0.36],
      [0.12, 1.54, -0.24],
      [-0.02, 1.53, -0.18],
    ],
    [
      [0.24, 1.56, -0.36],
      [0.38, 1.50, -0.28],
      [0.48, 1.42, -0.18],
    ],
    [
      [0.24, 1.56, -0.36],
      [0.34, 1.52, -0.52],
      [0.42, 1.38, -0.68],
    ],
    [
      [0.24, 1.56, -0.36],
      [0.14, 1.54, -0.50],
      [0.02, 1.54, -0.60],
    ],
  ];
  for (const rp of rootPaths) {
    b.sweep(catmull(rp), [0.065, 0.016], {
      section: { ngon: 6 },
      color: SPIRIT_BARK,
      caps: { start: "round", end: "point" },
      bone: islandCore,
      group: "spiritTree",
    });
  }

  // Main sinuous trunk curving gracefully over the sanctuary
  const mainTrunkPath = catmull([
    TREE_ROOT,
    [0.28, 1.78, -0.38],
    [0.20, 2.06, -0.32],
    [0.08, 2.34, -0.24],
    [-0.02, 2.54, -0.18],
  ]);
  b.sweep(mainTrunkPath, [0.115, 0.088, 0.068, 0.048, 0.032], {
    section: { ngon: 7 },
    color: SPIRIT_BARK,
    bone: islandCore,
    group: "spiritTree",
    name: "spiritTreeTrunk",
  });

  // Secondary boughs branching out to hold the layered golden canopies
  const boughSpecs: Array<{ pts: V3[]; r0: number; r1: number }> = [
    {
      pts: [
        [0.24, 1.94, -0.35],
        [0.44, 2.12, -0.26],
        [0.58, 2.24, -0.16],
      ],
      r0: 0.058,
      r1: 0.024,
    },
    {
      pts: [
        [0.16, 2.14, -0.30],
        [0.28, 2.36, -0.48],
        [0.36, 2.48, -0.58],
      ],
      r0: 0.050,
      r1: 0.022,
    },
    {
      pts: [
        [0.10, 2.28, -0.26],
        [-0.12, 2.44, -0.36],
        [-0.28, 2.54, -0.42],
      ],
      r0: 0.046,
      r1: 0.020,
    },
    {
      pts: [
        [0.04, 2.40, -0.21],
        [0.18, 2.58, -0.06],
        [0.26, 2.66, 0.04],
      ],
      r0: 0.040,
      r1: 0.018,
    },
  ];
  for (const bg of boughSpecs) {
    b.sweep(catmull(bg.pts), [bg.r0, bg.r1], {
      section: { ngon: 6 },
      color: SPIRIT_BARK,
      bone: islandCore,
      group: "spiritTree",
    });
  }

  // Sacred crimson rope (shimenawa-style) with gold talismans wrapped around the spirit tree trunk
  const ropeLoop = catmull(
    makeCirclePts([0.25, 1.84, -0.36], 0.092, "xz", 12),
    { closed: true },
  );
  b.sweep(ropeLoop, 0.018, {
    color: CRIMSON_CORD,
    bone: islandCore,
    group: "spiritTree",
  });

  // Layered cloud-like stylized golden ginkgo canopy cushions
  const ginkgoCanopyLobes: Array<{ pos: V3; r: number; scale: V3 }> = [
    { pos: [-0.02, 2.60, -0.18], r: 0.34, scale: [1.35, 0.58, 1.25] },
    { pos: [0.56, 2.28, -0.16], r: 0.28, scale: [1.30, 0.55, 1.20] },
    { pos: [0.36, 2.52, -0.56], r: 0.30, scale: [1.28, 0.56, 1.22] },
    { pos: [-0.26, 2.58, -0.42], r: 0.27, scale: [1.30, 0.54, 1.18] },
    { pos: [0.24, 2.70, 0.02], r: 0.26, scale: [1.25, 0.55, 1.20] },
    { pos: [0.18, 2.46, -0.28], r: 0.32, scale: [1.35, 0.52, 1.30] },
  ];
  const ginkgoCanopyParts = ginkgoCanopyLobes.map((lobe) =>
    b.part(new THREE.IcosahedronGeometry(lobe.r, 1), GINKGO_CANOPY, {
      at: lobe.pos,
      scale: lobe.scale,
      flat: true,
      bone: islandCore,
      group: "spiritTree",
    }),
  );

  // Scatter golden ginkgo leaf cards across the spirit tree canopy for lush anime silhouette richness
  const ginkgoSurface = b.surface(ginkgoCanopyParts);
  const ginkgoHits = ginkgoSurface.scatter(85, {
    rng: rng(808),
    minDist: 0.08,
    filter: (h) => h.n.y > -0.25,
  });
  b.cards(ginkgoHits, GINKGO_CARD_TEX, {
    size: [0.14, 0.14],
    lean: 38,
    vary: 0.28,
    spin: 45,
    rng: rng(809),
    bone: islandCore,
    group: "spiritTree",
    name: "ginkgoLeafCards",
  });

  // Glowing golden spirit orbs / Geo fireflies hanging under the spirit tree boughs
  const treeOrbs: V3[] = [
    [0.48, 2.08, -0.14],
    [-0.18, 2.38, -0.38],
    [0.22, 2.48, 0.06],
    [0.34, 2.28, -0.52],
  ];
  for (const orbPos of treeOrbs) {
    b.rod([orbPos[0], orbPos[1] + 0.14, orbPos[2]], orbPos, 0.004, GOLD_FLAT, {
      bone: islandCore,
      group: "spiritTree",
    });
    glow(
      b.part(new THREE.OctahedronGeometry(0.028, 0), GEO_PALE, {
        at: orbPos,
        scale: [0.8, 1.3, 0.8],
        bone: islandCore,
        group: "spiritTree",
      }),
      1.6,
    );
  }

  // B. Graceful Pink Sakura / Wind-Blossom Tree on the West Cliff Edge (around [-0.72, 1.28, 0.22])
  const sakuraTrunk = catmull([
    [-0.70, 1.26, 0.22],
    [-0.78, 1.46, 0.28],
    [-0.72, 1.68, 0.34],
    [-0.62, 1.84, 0.38],
  ]);
  b.sweep(sakuraTrunk, [0.068, 0.048, 0.034, 0.022], {
    section: { ngon: 6 },
    color: PALE_BARK,
    bone: islandCore,
    group: "sakuraTree",
    name: "sakuraTreeTrunk",
  });
  const sakuraBranch = catmull([
    [-0.75, 1.54, 0.30],
    [-0.92, 1.66, 0.22],
    [-1.02, 1.74, 0.16],
  ]);
  b.sweep(sakuraBranch, [0.036, 0.016], {
    section: { ngon: 6 },
    color: PALE_BARK,
    bone: islandCore,
    group: "sakuraTree",
  });

  const sakuraLobes: Array<{ pos: V3; r: number; scale: V3 }> = [
    { pos: [-0.60, 1.90, 0.38], r: 0.24, scale: [1.3, 0.56, 1.2] },
    { pos: [-0.80, 1.82, 0.30], r: 0.22, scale: [1.25, 0.54, 1.15] },
    { pos: [-1.02, 1.78, 0.16], r: 0.20, scale: [1.25, 0.52, 1.15] },
  ];
  for (const sl of sakuraLobes) {
    b.part(new THREE.IcosahedronGeometry(sl.r, 1), SAKURA_CANOPY, {
      at: sl.pos,
      scale: sl.scale,
      flat: true,
      bone: islandCore,
      group: "sakuraTree",
    });
  }

  // C. Mini Bonsai Spirit Tree on the East Satellite Isle
  const bonsaiTrunk = catmull([
    [1.02, 1.03, -0.18],
    [1.08, 1.16, -0.22],
    [0.98, 1.28, -0.16],
  ]);
  b.sweep(bonsaiTrunk, [0.035, 0.016], {
    section: { ngon: 5 },
    color: SPIRIT_BARK,
    bone: satelliteEast,
    group: "satelliteEast",
  });
  b.part(new THREE.IcosahedronGeometry(0.15, 1), GINKGO_CANOPY, {
    at: [0.98, 1.32, -0.16],
    scale: [1.3, 0.55, 1.2],
    flat: true,
    bone: satelliteEast,
    group: "satelliteEast",
  });

  // ============================================================================
  // 9. GLOWING ELEMENTAL CRYSTALS (Anemo Teal & Geo Amber Clusters)
  // ============================================================================

  const buildCrystalCluster = (
    origin: V3,
    mainDir: V3,
    colorMain: string,
    colorTip: string,
    scale = 1,
    targetBone = islandCore,
  ) => {
    const shards: Array<{ off: V3; dir: V3; len: number; r: number; col: string }> = [
      { off: [0, 0, 0], dir: mainDir, len: 0.28 * scale, r: 0.055 * scale, col: colorMain },
      {
        off: [0.04 * scale, -0.02 * scale, 0.03 * scale],
        dir: [mainDir[0] + 0.35, mainDir[1] + 0.1, mainDir[2] + 0.25],
        len: 0.20 * scale,
        r: 0.042 * scale,
        col: colorTip,
      },
      {
        off: [-0.04 * scale, -0.01 * scale, -0.03 * scale],
        dir: [mainDir[0] - 0.3, mainDir[1] + 0.15, mainDir[2] - 0.25],
        len: 0.18 * scale,
        r: 0.038 * scale,
        col: colorMain,
      },
      {
        off: [0.02 * scale, -0.03 * scale, -0.04 * scale],
        dir: [mainDir[0] + 0.15, mainDir[1] - 0.2, mainDir[2] - 0.35],
        len: 0.14 * scale,
        r: 0.032 * scale,
        col: colorTip,
      },
    ];
    for (const sh of shards) {
      const start: V3 = [origin[0] + sh.off[0], origin[1] + sh.off[1], origin[2] + sh.off[2]];
      glow(
        b.spike(start, sh.dir, sh.len, sh.r, {
          section: { ngon: 5 },
          color: sh.col,
          bone: targetBone,
          group: "crystals",
        }),
        1.5,
      );
    }
  };

  // Large Geo Amber Crystal veins erupting from the underside and flanks of the island
  buildCrystalCluster([-0.68, 0.92, -0.36], [-0.7, -0.5, -0.4], GEO_GLOW, GEO_PALE, 1.15);
  buildCrystalCluster([0.66, 0.88, 0.38], [0.7, -0.45, 0.45], GEO_GLOW, GEO_PALE, 1.05);
  buildCrystalCluster([0.52, 1.28, -0.58], [0.5, 0.75, -0.45], GEO_GLOW, GEO_PALE, 0.95);

  // Anemo Teal Crystal clusters near the waterfall grotto, ruins, and West Satellite Isle
  buildCrystalCluster([-0.32, 1.30, 0.18], [-0.35, 0.85, 0.25], ANEMO_GLOW, ANEMO_PALE, 0.90);
  buildCrystalCluster([-1.08, 1.34, 0.12], [-0.25, 0.90, 0.15], ANEMO_GLOW, ANEMO_PALE, 0.85, satelliteWest);
  buildCrystalCluster([0.18, 0.62, 0.42], [0.3, -0.65, 0.6], HYDRO_GLOW, ANEMO_PALE, 0.95);

  // ============================================================================
  // 10. LUSH FLORA, SHRUBS, STEPPING STONES, REEDS, VINES & WIND CURRENTS
  // ============================================================================

  // Rounded cel-shaded foliage bushes tucked around ruins, rocks, and trees
  const bushPlacements: Array<{ pos: V3; r: number; scale: V3 }> = [
    { pos: [-0.52, 1.32, 0.48], r: 0.12, scale: [1.3, 0.8, 1.1] },
    { pos: [-0.42, 1.30, 0.54], r: 0.09, scale: [1.2, 0.75, 1.1] },
    { pos: [0.36, 1.30, 0.52], r: 0.11, scale: [1.25, 0.8, 1.15] },
    { pos: [0.68, 1.44, -0.14], r: 0.13, scale: [1.3, 0.85, 1.2] },
    { pos: [0.46, 1.56, -0.42], r: 0.12, scale: [1.2, 0.8, 1.1] },
    { pos: [-0.66, 1.58, -0.16], r: 0.13, scale: [1.25, 0.85, 1.2] },
    { pos: [-0.36, 1.58, -0.74], r: 0.11, scale: [1.3, 0.75, 1.1] },
    { pos: [0.16, 1.30, -0.08], r: 0.10, scale: [1.2, 0.75, 1.2] },
  ];
  for (const bp of bushPlacements) {
    b.part(new THREE.DodecahedronGeometry(bp.r, 1), TEAL_BUSH, {
      at: bp.pos,
      scale: bp.scale,
      flat: true,
      bone: islandCore,
      group: "flora",
    });
  }

  // Cobblestone garden path stepping stones from the river bridge to the staircase & waypoint
  const pathStones: V3[] = [
    [-0.08, 1.285, 0.22],
    [0.02, 1.285, 0.24],
    [0.18, 1.29, 0.22],
    [0.32, 1.34, 0.20],
    [0.44, 1.39, 0.19],
    [-0.48, 1.285, 0.34],
    [-0.60, 1.285, 0.28],
  ];
  for (const ps of pathStones) {
    b.part(new THREE.CylinderGeometry(0.065, 0.072, 0.024, 7), MARBLE_RUIN, {
      at: ps,
      scale: [1.2, 1, 0.9],
      rotation: [0, rand() * 90, 0],
      bone: islandCore,
      group: "flora",
    });
  }

  // Scatter wildflower & grass tuft cards across the meadows and plateaus
  const turfSurface = b.surface([mainMeadow, upperPlateau, eastKnoll]);
  const grassHits = turfSurface.scatter(95, {
    rng: rng(909),
    minDist: 0.10,
    filter: (h) => h.n.y > 0.65 && Math.hypot(h.at.x - PLAZA_C[0], h.at.z - PLAZA_C[2]) > 0.46,
  });
  b.cards(grassHits, GRASS_FLOWER_CARD_TEX, {
    size: [0.13, 0.12],
    lean: 12,
    cross: true,
    vary: 0.3,
    spin: 180,
    rng: rng(910),
    bone: islandCore,
    group: "flora",
    name: "meadowGrassCards",
  });

  // Hanging cliff-edge ivy vine cards around the island rim
  const rimVineFrames: Frame[] = [
    frame([-0.82, 1.20, 0.36], [0, 1, 0]),
    frame([-0.58, 1.18, 0.68], [0, 1, 0]),
    frame([0.48, 1.18, 0.66], [0, 1, 0]),
    frame([0.82, 1.22, 0.32], [0, 1, 0]),
    frame([0.78, 1.20, -0.48], [0, 1, 0]),
    frame([-0.76, 1.24, -0.52], [0, 1, 0]),
  ];
  b.cards(rimVineFrames, VINE_CARD_TEX, {
    size: [0.14, 0.38],
    lean: 180,
    flow: (f) => [f.at.x, 0, f.at.z],
    vary: 0.2,
    rng: rng(911),
    bone: islandCore,
    group: "flora",
    name: "cliffEdgeVines",
  });

  // Glowing Anemo Wind-Current Ribbons spiraling upward around the floating island
  const windCurrent1 = catmull([
    [-0.86, 0.42, 0.56],
    [-1.12, 0.86, 0.04],
    [-0.92, 1.48, -0.58],
    [-0.36, 2.15, -0.82],
    [0.24, 2.68, -0.42],
  ]);
  glow(
    b.sweep(
      windCurrent1,
      (t) => [0.026 * Math.sin(t * Math.PI) + 0.004, 0.006],
      {
        color: ANEMO_PALE,
        bone: root,
        group: "windCurrents",
        name: "anemoWindRibbonWest",
      },
    ),
    1.5,
  );

  const windCurrent2 = catmull([
    [0.78, 0.38, -0.52],
    [1.14, 0.84, 0.08],
    [0.92, 1.42, 0.58],
    [0.44, 1.98, 0.42],
  ]);
  glow(
    b.sweep(
      windCurrent2,
      (t) => [0.024 * Math.sin(t * Math.PI) + 0.004, 0.006],
      {
        color: ANEMO_GLOW,
        bone: root,
        group: "windCurrents",
        name: "anemoWindRibbonEast",
      },
    ),
    1.5,
  );

  // Subtle rest pose tilt on the astrolabe rings & waypoint crystal so their silhouette is dynamic from all angles
  b.pose(astrolabeOuter, { axis: [0, 1, 0], deg: 22 });
  b.pose(astrolabeInner, { axis: [1, 0, 1], deg: -28 });
  b.pose(waypointCore, { axis: [0, 1, 0], deg: 35 });

  return b.root;
}
