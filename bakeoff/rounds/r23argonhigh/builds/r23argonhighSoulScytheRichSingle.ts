import * as THREE from "three";
import { glow } from "../../../../kits/glow";
import { cel } from "../../../../kits/toon";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { offset, rng } from "../../../../src/math";
import type { V3 } from "../../../../src/math";
import { bezier, catmull, polyline } from "../../../../src/path";
import { countershade, gradient, grain, mottle, paint, patches, smoothstep, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A heroic League of Legends dragonbone war-scythe anchored in a ruined obsidian soul-altar, featuring an articulated elder-dragon skull, glowing spectral soul-fire core, runes, and a sweeping wraith-steel crescent blade.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------
// Palette: hand-painted & cel-shaded procedural surfaces + high-contrast accents
// ---------------------------------------------------------------------------

// Ancient weathered dragonbone: warm ivory crest fading to aged ochre-umber in recesses
const DRAGON_BONE = cel(
  countershade(
    mottle("#f0e4cc", "#c8b08a", { size: 0.14, contrast: 1.3, seed: 11 }),
    mottle("#9c8260", "#735b3f", { size: 0.12, contrast: 1.2, seed: 17 }),
    { level: -0.15, soft: 0.45 },
  ),
  "#59432d",
);

// Striated dark dragon horn & keratin ridges
const AGED_HORN = cel(
  grain(
    mottle("#5c4636", "#38281e", { size: 0.1, seed: 23 }),
    "#1f1510",
    { size: 0.022, axis: "y", seed: 29 },
  ),
  "#160e0b",
);

// Shadow Isles / Darkin forged wraith-steel: cold indigo-obsidian metal with mottled sheen
const WRAITH_STEEL = cel(
  countershade(
    mottle("#323c54", "#1e2536", { size: 0.16, contrast: 1.4, seed: 31 }),
    "#121724",
    { level: 0.0, soft: 0.4 },
  ),
  "#0c101a",
);

// Ornate antique League of Legends bronze-gold filigree & bevel trim
const SHADOW_GOLD = cel(
  countershade(
    mottle("#eab957", "#b88228", { size: 0.09, contrast: 1.3, seed: 41 }),
    "#7d5213",
    { level: -0.1, soft: 0.35 },
  ),
  "#54340a",
);

// Crimson-plum wyrm-hide grip bindings
const WYRM_LEATHER = cel(
  stripes("#6b1b32", "#330a18", {
    size: 0.026,
    axis: "y",
    width: 0.36,
    wobble: 0.22,
    seed: 53,
  }),
  "#210610",
);

// Tattered war-banner cloth with vertical ombré
const BANNER_CLOTH = cel(
  gradient(
    mottle("#5c1848", "#3b1033", { size: 0.08, seed: 61 }),
    "#14061a",
    [0, 1.15, 0],
    [0, 0.55, 0],
  ),
  "#0e0412",
);

// Cracked dark basalt altar stone with subtle blue-slate cells
const ALTAR_STONE = cel(
  patches("#111620", ["#222b3b", "#1b2230", "#161c28"], {
    size: 0.1,
    gap: 0.09,
    seed: 71,
  }),
  "#0a0d14",
);

// Custom blade face paint: dark wraith-steel bevel with glowing-tint transition near the inner arc
const BLADE_METAL = paint((p, n) => {
  // Inner curve lies closer to z = 0.38..0.62, y = 0.95..1.65
  const dz = p.z - 0.38;
  const dy = (p.y - 1.32) * 0.75;
  const r = Math.hypot(dz, dy);
  const rim = smoothstep(0.42, 0.58, r);
  const lit = n.x * 0.35 + n.y * 0.65 + n.z * 0.35 > 0.08;
  if (rim > 0.68) return lit ? "#465675" : "#28334a";
  return WRAITH_STEEL.at(p, n);
});

// Flat colours for crisp accents and self-lit `glow()` geometry
const SOUL_CYAN = "#00f5d4";
const SOUL_MINT = "#8affef";
const SOUL_EMERALD = "#00b894";
const SOUL_DEEP = "#075e54";
const CRIMSON_GEM = "#ff2968";
const BONE_IVORY = "#efe3ca";
const DARK_IRON = "#1b2230";
const DEEP_OBSIDIAN = "#0c1018";
const ANTIQUE_BRASS = "#d49b3d";

// ---------------------------------------------------------------------------
// SVG Textures (Runic Sigils, Altar Binding Array, Spectral Soul-Fire Wisps)
// ---------------------------------------------------------------------------

const RUNE_GLYPH_SVG = svg(
  `<svg viewBox="0 0 128 128">
    <polygon points="64,6 106,36 90,94 64,122 38,94 22,36" fill="none" stroke="#00f5d4" stroke-width="6"/>
    <polygon points="64,20 92,44 80,86 64,106 48,86 36,44" fill="#075e54" fill-opacity="0.75" stroke="#8affef" stroke-width="4"/>
    <path d="M64 14 L64 114 M30 48 L98 48 M38 82 L90 82" stroke="#8affef" stroke-width="5" stroke-linecap="round"/>
    <circle cx="64" cy="62" r="14" fill="#8affef"/>
    <circle cx="64" cy="62" r="7" fill="#ffffff"/>
  </svg>`,
  { size: 256 },
);

const ALTAR_SEAL_SVG = svg(
  `<svg viewBox="0 0 256 256">
    <circle cx="128" cy="128" r="118" fill="none" stroke="#00b894" stroke-width="6"/>
    <circle cx="128" cy="128" r="102" fill="none" stroke="#00f5d4" stroke-width="4" stroke-dasharray="18 10"/>
    <polygon points="128,18 223,73 223,183 128,238 33,183 33,73" fill="none" stroke="#00f5d4" stroke-width="5"/>
    <polygon points="128,38 206,173 50,173" fill="none" stroke="#8affef" stroke-width="4"/>
    <polygon points="128,218 206,83 50,83" fill="none" stroke="#8affef" stroke-width="4"/>
    <circle cx="128" cy="128" r="54" fill="#075e54" fill-opacity="0.7" stroke="#8affef" stroke-width="5"/>
    <path d="M128 8 L128 248 M8 128 L248 128 M42 42 L214 214 M214 42 L42 214" stroke="#00f5d4" stroke-width="4"/>
  </svg>`,
  { size: 512 },
);

const SOUL_WISP_SVG = svg(
  `<svg viewBox="0 0 96 192">
    <path d="M48 188 C22 162 12 126 24 88 C34 58 20 34 44 6 C54 28 42 52 58 76 C78 106 76 154 48 188 Z" fill="#00b894"/>
    <path d="M48 182 C30 156 22 124 32 92 C40 66 32 42 46 18 C54 38 46 58 56 80 C70 108 66 150 48 182 Z" fill="#00f5d4"/>
    <path d="M48 172 C38 148 34 120 40 94 C44 74 42 54 48 36 C52 54 48 72 54 90 C60 114 58 146 48 172 Z" fill="#8affef"/>
    <ellipse cx="48" cy="136" rx="8" ry="22" fill="#ffffff"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "soulScythe", detail: 0.8, paintSize: 1024 });
  const rand = rng(404);

  // =========================================================================
  // SKELETON HIERARCHY
  // =========================================================================
  // Root joint in the obsidian altar plinth
  const plinthRoot = b.joint("plinthRoot", {
    at: [0, 0.08, 0],
    dir: [0, 1, 0],
    group: "plinth",
  });

  // Vertebral polearm shaft chain (3 span joints + tip)
  const shaftPath = catmull([
    [0, 0.16, 0.0],
    [0, 0.62, -0.05],
    [0, 1.12, -0.07],
    [0, 1.56, -0.02],
  ]);
  const shaftChain = b.chain("shaft", shaftPath, {
    parent: plinthRoot,
    names: ["shaftBase", "shaftMid", "shaftTop", "shaftCrown"],
    role: "spine",
    group: "shaft",
  });
  const [shaftBase, shaftMid, shaftTop, shaftCrown] = shaftChain.joints;

  // Elder Dragon Skull housing at the top of the shaft
  const skullHead = b.joint("skullHead", {
    parent: shaftCrown,
    at: [0, 1.58, -0.01],
    dir: [0, 0.35, 0.94],
    role: "head",
    group: "skull",
  });

  // Articulated lower dragon mandible
  const dragonJaw = b.joint("dragonJaw", {
    parent: skullHead,
    at: [0, 1.52, 0.03],
    dir: [0, -0.42, 0.91],
    role: "jaw",
    group: "jaw",
  });

  // Sweeping Crescent Soul-Blade hinge mount
  const bladeMount = b.joint("bladeMount", {
    parent: skullHead,
    at: [0, 1.72, 0.15],
    dir: [0, 0.12, 0.99],
    role: "hinge",
    group: "blade",
  });

  // Swept-back lateral dragon horn-wings (readable from top-down camera & flex shots)
  const crestWingL = b.joint("crestWingL", {
    parent: skullHead,
    at: [0.09, 1.68, -0.04],
    dir: [0.55, 0.48, -0.68],
    role: "wing",
    group: "horns",
  });
  const crestWingR = b.joint("crestWingR", {
    parent: skullHead,
    at: [-0.09, 1.68, -0.04],
    dir: [-0.55, 0.48, -0.68],
    role: "wing",
    group: "horns",
  });

  // Rear hanging Soul-Censer chain (from the occipital hook)
  const censerChain = b.chain(
    "censer",
    polyline([
      [0, 1.6, -0.42],
      [0, 1.44, -0.42],
      [0, 1.28, -0.42],
      [0, 1.02, -0.42],
    ]),
    {
      parent: skullHead,
      names: ["censerLink1", "censerLink2", "censerBody"],
      role: "tail",
      group: "censer",
    },
  );
  const [censerLink1, censerLink2, censerBody] = censerChain.joints;

  // Tattered battle-banners hanging from the upper grip guard
  const tasselChain = b.chain(
    "tassel",
    polyline([
      [0, 1.14, -0.11],
      [0, 0.86, -0.15],
      [0, 0.56, -0.18],
    ]),
    {
      parent: shaftMid,
      names: ["tasselUpper", "tasselLower"],
      role: "tail",
      group: "banners",
    },
  );
  const [tasselUpper, tasselLower] = tasselChain.joints;

  // =========================================================================
  // 1. RUINED OBSIDIAN SOUL-ALTAR PLINTH (y = 0.00 to 0.34)
  // =========================================================================
  const plinthOutline: OutlinePoint[] = [
    [0, 0],
    [0.44, 0],
    [0.42, 0.04, "sharp"],
    [0.37, 0.055, "sharp"],
    [0.35, 0.11, "sharp"],
    [0.38, 0.145, "sharp"],
    [0.34, 0.165, "sharp"],
    [0.19, 0.175, "sharp"],
    [0.14, 0.22, "sharp"],
    [0, 0.23],
  ];
  b.lathe(plinthOutline, {
    at: [0, 0, 0],
    segments: 8,
    smoothing: 0,
    color: ALTAR_STONE,
    bone: plinthRoot,
    group: "plinth",
    name: "altarPedestal",
  });

  // Ornate shadow-gold rim collar around the altar table & socket mound
  b.lathe(
    [
      [0.33, 0.135],
      [0.39, 0.142, "sharp"],
      [0.39, 0.158, "sharp"],
      [0.33, 0.168],
    ],
    {
      at: [0, 0, 0],
      segments: 8,
      smoothing: 0,
      color: SHADOW_GOLD,
      bone: plinthRoot,
      group: "plinth",
      name: "altarGoldRim",
    },
  );

  // Glowing arcane seal decal on the top table of the altar
  glow(
    b.part(new THREE.CircleGeometry(0.32, 16), "#ffffff", {
      bone: plinthRoot,
      at: [0, 0.177, 0],
      dir: [0, 1, 0],
      axis: "z",
      texture: ALTAR_SEAL_SVG,
      group: "plinth",
      name: "altarSeal",
    }),
    1.5,
  );

  // 8 Radial Buttresses & Glowing Soul-Fissures around the octagonal plinth
  for (let i = 0; i < 8; i++) {
    const ang = (i * Math.PI) / 4;
    const ca = Math.cos(ang);
    const sa = Math.sin(ang);

    // Stepped obsidian & gold buttress fin resting on y = 0.002
    b.frustumBox(
      [ca * 0.28, 0.002, sa * 0.28],
      [ca * 0.49, 0.002, sa * 0.49],
      [0.09, 0.01],
      [0.055, 0.01],
      {
        bone: plinthRoot,
        color: WRAITH_STEEL,
        up: [0, 1, 0],
        group: "plinth",
      },
    );
    b.frustumBox(
      [ca * 0.28, 0.075, sa * 0.28],
      [ca * 0.48, 0.045, sa * 0.48],
      [0.085, 0.14],
      [0.048, 0.085],
      {
        bone: plinthRoot,
        color: i % 2 === 0 ? SHADOW_GOLD : WRAITH_STEEL,
        up: [0, 1, 0],
        group: "plinth",
      },
    );

    // Glowing soul-fissure vein radiating from center socket to outer rim
    const fissureAng = ang + Math.PI / 8;
    const cf = Math.cos(fissureAng);
    const sf = Math.sin(fissureAng);
    glow(
      b.rod(
        [cf * 0.13, 0.185, sf * 0.13],
        [cf * 0.35, 0.168, sf * 0.35],
        [0.014, 0.008],
        SOUL_CYAN,
        {
          bone: plinthRoot,
          sides: 5,
          group: "plinth",
        },
      ),
      1.6,
    );
  }

  // 4 Curved Dragon-Bone Altar Claws clasping the base of the scythe shaft
  for (let i = 0; i < 4; i++) {
    const ang = (i * Math.PI) / 2 + Math.PI / 4;
    const ca = Math.cos(ang);
    const sa = Math.sin(ang);
    const clawPath = bezier(
      [ca * 0.26, 0.14, sa * 0.26],
      [ca * 0.28, 0.26, sa * 0.28],
      [ca * 0.16, 0.35, sa * 0.16],
      [ca * 0.048, 0.29, sa * 0.048],
    );
    b.sweep(clawPath, [0.042, 0.028, 0.012], {
      bone: plinthRoot,
      section: { ngon: 6 },
      color: DRAGON_BONE,
      caps: { start: "flat", end: "point" },
      group: "plinth",
    });
    // Gold knuckle band on each altar claw
    b.rod(
      [ca * 0.24, 0.15, sa * 0.24],
      [ca * 0.26, 0.21, sa * 0.26],
      [0.046, 0.038],
      SHADOW_GOLD,
      {
        bone: plinthRoot,
        sides: 6,
        group: "plinth",
      },
    );
  }

  // Clustered glowing Soul-Crystal shards erupting from the plinth
  const crystalSpecs: Array<{ pos: V3; dir: V3; len: number; r: number; col: string }> = [
    { pos: [0.27, 0.15, 0.12], dir: [0.35, 0.9, 0.2], len: 0.22, r: 0.036, col: SOUL_CYAN },
    { pos: [0.31, 0.14, 0.04], dir: [0.5, 0.82, 0.05], len: 0.14, r: 0.025, col: SOUL_EMERALD },
    { pos: [-0.26, 0.15, 0.15], dir: [-0.32, 0.9, 0.25], len: 0.2, r: 0.034, col: SOUL_CYAN },
    { pos: [-0.3, 0.14, 0.06], dir: [-0.48, 0.85, 0.12], len: 0.13, r: 0.024, col: SOUL_MINT },
    { pos: [0.18, 0.15, -0.24], dir: [0.25, 0.88, -0.38], len: 0.18, r: 0.03, col: SOUL_EMERALD },
    { pos: [-0.19, 0.15, -0.23], dir: [-0.28, 0.88, -0.35], len: 0.17, r: 0.028, col: SOUL_CYAN },
  ];
  for (const c of crystalSpecs) {
    glow(
      b.spike(c.pos, c.dir, c.len, c.r, c.col, {
        bone: plinthRoot,
        section: { ngon: 6 },
        group: "plinth",
      }),
      1.5,
    );
  }

  // =========================================================================
  // 2. DRAGONBONE VERTEBRAL SHAFT, POMMEL & GRIPS (y = 0.12 to 1.58)
  // =========================================================================
  // Smooth-skinned forged wraith-steel inner shaft core
  b.sweep(
    shaftChain,
    (t) => [0.034 + 0.012 * Math.sin(t * Math.PI), 0.042 + 0.014 * Math.sin(t * Math.PI)],
    {
      section: { ngon: 6 },
      color: WRAITH_STEEL,
      caps: "flat",
      group: "shaft",
      name: "shaftCore",
    },
  );

  // Posterior Dragonbone Spine Ridge running up the back (-Z) of the shaft
  const dorsalShaftPath = catmull([
    [0, 0.22, -0.028],
    [0, 0.62, -0.088],
    [0, 1.12, -0.108],
    [0, 1.56, -0.065],
  ]);
  b.sweep(
    dorsalShaftPath,
    (t) => [0.026 + 0.014 * t, 0.032 + 0.016 * t],
    {
      bone: shaftChain,
      section: { ngon: 6 },
      color: DRAGON_BONE,
      caps: "round",
      group: "shaft",
      name: "shaftBoneSpine",
    },
  );

  // --- Pommel Anchor & Twin Tail-Forks (on shaftBase) ---
  // Central dragon-tail spike plunging deep into the altar socket
  b.spike([0, 0.28, 0.0], [0, -1, 0], 0.2, 0.052, DRAGON_BONE, {
    bone: shaftBase,
    section: { ngon: 6 },
    group: "shaft",
    name: "pommelCenterSpike",
  });
  for (const s of [1, -1]) {
    b.sweep(
      bezier(
        [s * 0.028, 0.3, 0.0],
        [s * 0.095, 0.24, 0.02],
        [s * 0.075, 0.14, 0.03],
      ),
      [0.026, 0.018, 0.004],
      {
        bone: shaftBase,
        section: { ngon: 5 },
        color: AGED_HORN,
        caps: { start: "flat", end: "point" },
        group: "shaft",
      },
    );
  }
  // Pommel Crimson Soul-Gem & Gold Crown Cage
  b.lathe(
    [
      [0, 0.24],
      [0.062, 0.255, "sharp"],
      [0.052, 0.29, "sharp"],
      [0.068, 0.33, "sharp"],
      [0.046, 0.355, "sharp"],
      [0, 0.36],
    ],
    {
      at: [0, 0, 0],
      segments: 6,
      smoothing: 0,
      color: SHADOW_GOLD,
      bone: shaftBase,
      group: "shaft",
      name: "pommelCollar",
    },
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.052, 0), CRIMSON_GEM, {
      bone: shaftBase,
      at: [0, 0.31, 0.035],
      scale: [0.85, 1.25, 0.85],
      group: "shaft",
      name: "pommelBloodGem",
    }),
    1.6,
  );

  // --- Lower & Upper Wyrm-Leather Grip Wraps ---
  const lowerGripPath = catmull([
    [0, 0.35, -0.012],
    [0, 0.5, -0.035],
    [0, 0.65, -0.052],
  ]);
  b.sweep(lowerGripPath, [0.044, 0.048, 0.044], {
    bone: shaftBase,
    sides: 8,
    color: WYRM_LEATHER,
    caps: "flat",
    group: "shaft",
    name: "lowerGripWrap",
  });

  const upperGripPath = catmull([
    [0, 0.86, -0.062],
    [0, 1.0, -0.068],
    [0, 1.15, -0.068],
  ]);
  b.sweep(upperGripPath, [0.045, 0.05, 0.046], {
    bone: shaftMid,
    sides: 8,
    color: WYRM_LEATHER,
    caps: "flat",
    group: "shaft",
    name: "upperGripWrap",
  });

  // --- Mid-Shaft Open Soul-Conduit Lantern Window (y = 0.65 to 0.86) ---
  // Top and bottom shadow-gold ferrules framing the exposed soul-conduit
  for (const [yPos, zPos, owner] of [
    [0.65, -0.052, shaftBase],
    [0.86, -0.062, shaftMid],
    [1.16, -0.066, shaftTop],
    [1.46, -0.032, shaftTop],
  ] as const) {
    b.rod([0, yPos - 0.024, zPos], [0, yPos + 0.024, zPos], [0.058, 0.058], SHADOW_GOLD, {
      bone: owner,
      section: { ngon: 6 },
      group: "shaft",
    });
  }

  // Glowing spectral core column inside the mid-shaft rib cage
  glow(
    b.rod([0, 0.64, -0.052], [0, 0.87, -0.062], [0.028, 0.028], SOUL_CYAN, {
      bone: shaftMid,
      sides: 6,
      group: "shaft",
      name: "shaftSoulCore",
    }),
    1.8,
  );
  // 4 curved dragon-rib bars caging the mid-shaft soul core
  for (const s of [1, -1]) {
    for (const fz of [1, -1]) {
      b.sweep(
        bezier(
          [s * 0.038, 0.65, -0.052 + fz * 0.024],
          [s * 0.072, 0.755, -0.057 + fz * 0.042],
          [s * 0.038, 0.86, -0.062 + fz * 0.024],
        ),
        0.014,
        {
          bone: shaftMid,
          sides: 5,
          color: DRAGON_BONE,
          caps: "round",
          group: "shaft",
        },
      );
    }
  }

  // --- 9 Sculpted Dragon Vertebrae & Rib Spurs along the Shaft ---
  for (let i = 0; i < 9; i++) {
    const t = 0.16 + (i / 8) * 0.76;
    const cp = shaftChain.at(t);
    const p = cp.at;
    const scale = 0.75 + 0.45 * t;

    // Vertebral centrum collar hugging the shaft
    b.frustumBox(
      [p.x, p.y - 0.028 * scale, p.z - 0.01],
      [p.x, p.y + 0.028 * scale, p.z - 0.01],
      [0.095 * scale, 0.105 * scale],
      [0.082 * scale, 0.092 * scale],
      {
        bone: cp.bone,
        color: DRAGON_BONE,
        up: [0, 0, 1],
        group: "shaft",
      },
    );

    // Swept dorsal spinous process jutting backward (-Z) and upward (+Y)
    b.spike(
      [p.x, p.y, p.z - 0.04 * scale],
      [0, 0.45, -0.89],
      0.13 * scale,
      0.026 * scale,
      i % 2 === 0 ? DRAGON_BONE : AGED_HORN,
      {
        bone: cp.bone,
        section: { ngon: 5 },
        group: "shaft",
      },
    );

    // Paired lateral transverse rib-hooks
    for (const s of [1, -1]) {
      b.spike(
        [p.x + s * 0.036 * scale, p.y, p.z - 0.015],
        [s * 0.78, 0.28, -0.55],
        0.075 * scale,
        0.016 * scale,
        AGED_HORN,
        {
          bone: cp.bone,
          sides: 5,
          group: "shaft",
        },
      );
    }

    // Glowing cyan marrow node at every second vertebra
    if (i % 2 === 1) {
      glow(
        b.part(new THREE.OctahedronGeometry(0.018 * scale, 0), SOUL_CYAN, {
          bone: cp.bone,
          at: [p.x, p.y, p.z - 0.056 * scale],
          group: "shaft",
        }),
        1.5,
      );
    }
  }

  // --- Upper Crossguard Talons & Tattered War-Banners (tasselChain) ---
  for (const s of [1, -1]) {
    b.sweep(
      bezier(
        [s * 0.035, 1.16, -0.06],
        [s * 0.14, 1.19, -0.02],
        [s * 0.22, 1.27, 0.05],
      ),
      [0.032, 0.022, 0.005],
      {
        bone: shaftTop,
        section: { ngon: 5 },
        color: SHADOW_GOLD,
        caps: { start: "flat", end: "point" },
        group: "shaft",
      },
    );
  }

  // Banner mounting ring at tasselUpper
  b.rod([0, 1.16, -0.08], [0, 1.12, -0.13], 0.024, SHADOW_GOLD, {
    bone: tasselUpper,
    sides: 6,
    group: "banners",
  });

  // Upper and lower notched battle-ribbon slabs on tasselUpper and tasselLower
  const upperBannerOutline: OutlinePoint[] = [
    [-0.03, 0.85, "sharp"],
    [0.01, 1.15, "sharp"],
    [-0.08, 1.14, "sharp"],
    [-0.12, 0.96, "sharp"],
    [-0.07, 0.89, "sharp"],
  ];
  b.extrude(upperBannerOutline, {
    at: [0, 0, -0.06],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: [0.018, 0.01],
    bevel: 0.003,
    smoothing: 0,
    color: BANNER_CLOTH,
    bone: tasselUpper,
    group: "banners",
    name: "bannerUpper",
  });

  const lowerBannerOutline: OutlinePoint[] = [
    [-0.07, 0.52, "sharp"],
    [-0.03, 0.88, "sharp"],
    [-0.11, 0.88, "sharp"],
    [-0.16, 0.56, "sharp"],
    [-0.11, 0.63, "sharp"],
  ];
  b.extrude(lowerBannerOutline, {
    at: [0, 0, -0.06],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: [0.014, 0.006],
    bevel: 0.002,
    smoothing: 0,
    color: BANNER_CLOTH,
    bone: tasselLower,
    group: "banners",
    name: "bannerLower",
  });

  // Gold weights at banner tips
  b.spike([0, 0.55, -0.15], [0, -1, -0.2], 0.065, 0.016, SHADOW_GOLD, {
    bone: tasselLower,
    sides: 5,
    group: "banners",
  });

  // =========================================================================
  // 3. ANCIENT ELDER DRAGON SKULL & ARTICULATED JAW (`skullHead` & `dragonJaw`)
  // =========================================================================
  // Main Dragon Cranium & Upper Maxilla (sculpted loft from occiput to snout tip)
  b.loft(
    [
      { at: [0, 1.56, -0.16], w: 0.16, h: 0.15 },
      { at: [0, 1.66, -0.04], w: 0.26, h: 0.21 },
      { at: [0, 1.72, 0.1], w: 0.21, h: 0.18 },
      { at: [0, 1.77, 0.24], w: 0.13, h: 0.13 },
      { at: [0, 1.81, 0.34], w: 0.07, h: 0.08 },
    ],
    {
      bone: skullHead,
      section: { ngon: 6 },
      color: DRAGON_BONE,
      caps: "round",
      group: "skull",
      name: "dragonCranium",
    },
  );

  // Dark obsidian interior palate / eye socket recess core
  b.frustumBox([0, 1.62, -0.02], [0, 1.71, 0.21], [0.18, 0.11], [0.11, 0.08], {
    bone: skullHead,
    color: DEEP_OBSIDIAN,
    group: "skull",
    name: "skullSocketCore",
  });

  // Ornate Shadow-Gold Crown Diadem across the dragon forehead
  b.frustumBox([0, 1.73, -0.05], [0, 1.8, 0.08], [0.22, 0.07], [0.15, 0.05], {
    bone: skullHead,
    color: SHADOW_GOLD,
    group: "skull",
    name: "skullCrownDiadem",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.042, 0), SOUL_MINT, {
      bone: skullHead,
      at: [0, 1.81, 0.04],
      scale: [0.75, 1.3, 0.9],
      group: "skull",
      name: "crownSoulGem",
    }),
    1.8,
  );

  // 3 Nasal Horn Spikes along the snout bridge
  const nasalSpikes: Array<{ pos: V3; dir: V3; len: number; r: number }> = [
    { pos: [0, 1.75, 0.14], dir: [0, 0.85, 0.52], len: 0.095, r: 0.022 },
    { pos: [0, 1.78, 0.22], dir: [0, 0.88, 0.48], len: 0.115, r: 0.025 },
    { pos: [0, 1.8, 0.31], dir: [0, 0.76, 0.65], len: 0.14, r: 0.028 },
  ];
  for (const ns of nasalSpikes) {
    b.spike(ns.pos, ns.dir, ns.len, ns.r, AGED_HORN, {
      bone: skullHead,
      section: { ngon: 5 },
      group: "skull",
    });
  }

  // Paired Supraorbital Brow Ridges, Glowing Eye Sockets, Zygomatic Cheek Spikes & Upper Fangs
  for (const s of [1, -1]) {
    // Heavy armoured brow ridge over eye socket
    b.sweep(
      bezier(
        [s * 0.065, 1.74, -0.04],
        [s * 0.135, 1.73, 0.05],
        [s * 0.095, 1.74, 0.15],
      ),
      [0.032, 0.028, 0.02],
      {
        bone: skullHead,
        section: { ngon: 5 },
        color: DRAGON_BONE,
        caps: "round",
        group: "skull",
      },
    );

    // Blazing Spectral Eye inside the orbit
    glow(
      b.part(new THREE.OctahedronGeometry(0.036, 0), SOUL_MINT, {
        bone: skullHead,
        at: [s * 0.105, 1.675, 0.055],
        scale: [0.8, 0.9, 1.35],
        group: "skull",
      }),
      2.0,
    );
    glow(
      b.spike(
        [s * 0.11, 1.68, 0.05],
        [s * 0.55, 0.45, -0.7],
        0.11,
        0.022,
        SOUL_CYAN,
        {
          bone: skullHead,
          sides: 5,
          group: "skull",
        },
      ),
      1.6,
    );

    // Zygomatic cheek flange & jugal horn spur
    b.spike(
      [s * 0.11, 1.62, 0.02],
      [s * 0.78, -0.15, -0.6],
      0.16,
      0.034,
      DRAGON_BONE,
      {
        bone: skullHead,
        section: { ngon: 5 },
        group: "skull",
      },
    );
    b.spike(
      [s * 0.1, 1.64, 0.11],
      [s * 0.82, -0.22, -0.45],
      0.11,
      0.024,
      AGED_HORN,
      {
        bone: skullHead,
        sides: 5,
        group: "skull",
      },
    );

    // 5 Upper Maxillary Dragon Fangs per side
    for (let f = 0; f < 5; f++) {
      const fz = 0.08 + f * 0.052;
      const fy = 1.63 + f * 0.028;
      const fx = s * (0.088 - f * 0.01);
      const fangLen = (f === 1 || f === 3 ? 0.078 : 0.056);
      b.spike([fx, fy, fz], [s * 0.08, -0.96, 0.18], fangLen, 0.014, BONE_IVORY, {
        bone: skullHead,
        sides: 5,
        group: "skull",
      });
    }
  }

  // --- Swept-Back Regal Dragon Horns & Lateral Bone-Wings (`crestWingL`, `crestWingR`) ---
  for (const [s, wingBone] of [
    [1, crestWingL],
    [-1, crestWingR],
  ] as const) {
    // Primary Grand Dragon Horn sweeping out, up, and back
    const mainHornPath = bezier(
      [s * 0.085, 1.69, -0.03],
      [s * 0.25, 1.82, -0.18],
      [s * 0.38, 1.95, -0.34],
      [s * 0.31, 2.08, -0.48],
    );
    b.sweep(mainHornPath, [0.054, 0.042, 0.026, 0.006], {
      bone: wingBone,
      section: { ngon: 6 },
      color: AGED_HORN,
      caps: { start: "flat", end: "point" },
      group: "horns",
    });

    // Secondary lower temporal horn-rib forming a wing-frame with the main horn
    const subHornPath = bezier(
      [s * 0.095, 1.62, -0.05],
      [s * 0.24, 1.64, -0.2],
      [s * 0.34, 1.71, -0.36],
    );
    b.sweep(subHornPath, [0.036, 0.024, 0.005], {
      bone: wingBone,
      section: { ngon: 5 },
      color: DRAGON_BONE,
      caps: { start: "flat", end: "point" },
      group: "horns",
    });

    // Glowing spectral soul-membrane stretched between the primary and secondary horns
    glow(
      b.membrane(mainHornPath.slice(0.12, 0.86), subHornPath.slice(0.12, 0.92), {
        bone: wingBone,
        thickness: 0.012,
        rows: 4,
        cols: 5,
        scallop: 0.16,
        color: SOUL_EMERALD,
        group: "horns",
      }),
      1.3,
    );

    // 2 Ornate Shadow-Gold Ring Cuffs around the base and mid-span of the grand horn
    b.rod(
      [s * 0.09, 1.69, -0.04],
      [s * 0.15, 1.74, -0.09],
      [0.058, 0.052],
      SHADOW_GOLD,
      {
        bone: wingBone,
        section: { ngon: 6 },
        group: "horns",
      },
    );
    b.rod(
      [s * 0.23, 1.8, -0.17],
      [s * 0.28, 1.84, -0.22],
      [0.046, 0.042],
      SHADOW_GOLD,
      {
        bone: wingBone,
        section: { ngon: 6 },
        group: "horns",
      },
    );
  }

  // --- Articulated Lower Dragon Mandible (`dragonJaw`) ---
  for (const s of [1, -1]) {
    const jawBranch = bezier(
      [s * 0.088, 1.54, 0.0],
      [s * 0.082, 1.44, 0.13],
      [s * 0.022, 1.38, 0.27],
    );
    b.sweep(jawBranch, [0.04, 0.034, 0.026], {
      bone: dragonJaw,
      section: { ngon: 6 },
      color: DRAGON_BONE,
      caps: "round",
      group: "jaw",
    });

    // 4 Lower Mandibular Fangs per side
    for (let f = 0; f < 4; f++) {
      const ft = 0.25 + f * 0.2;
      const fp = jawBranch.at(ft);
      b.spike(
        [fp.x, fp.y + 0.018, fp.z],
        [-s * 0.08, 0.94, 0.22],
        f === 3 ? 0.068 : 0.048,
        0.012,
        BONE_IVORY,
        {
          bone: dragonJaw,
          sides: 5,
          group: "jaw",
        },
      );
    }
  }

  // Chin symphysis plate & heavy curved ventral beard-horn on the lower jaw
  b.frustumBox([0, 1.42, 0.16], [0, 1.37, 0.28], [0.11, 0.055], [0.06, 0.045], {
    bone: dragonJaw,
    color: DRAGON_BONE,
    group: "jaw",
    name: "jawChinPlate",
  });
  b.spike([0, 1.36, 0.25], [0, -0.62, 0.78], 0.15, 0.032, AGED_HORN, {
    bone: dragonJaw,
    section: { ngon: 5 },
    group: "jaw",
    name: "jawBeardSpike",
  });
  glow(
    b.rod([0, 1.45, 0.08], [0, 1.39, 0.24], [0.022, 0.014], SOUL_CYAN, {
      bone: dragonJaw,
      sides: 5,
      group: "jaw",
      name: "jawTongueFlame",
    }),
    1.7,
  );

  // --- Captured Soul-Heart Core inside the Dragon Maw (anchored to `skullHead`) ---
  const soulCoreCenter: V3 = [0, 1.56, 0.17];
  glow(
    b.part(new THREE.OctahedronGeometry(0.065, 1), SOUL_MINT, {
      bone: skullHead,
      at: soulCoreCenter,
      group: "skull",
      name: "mawSoulHeart",
    }),
    2.0,
  );
  // 4 Bone & Energy Tendrils physically anchoring the Soul-Heart to the upper skull palate
  for (const s of [1, -1]) {
    for (const fz of [0.1, 0.24]) {
      glow(
        b.rod([s * 0.055, 1.66, fz], soulCoreCenter, [0.014, 0.018], SOUL_CYAN, {
          bone: skullHead,
          sides: 5,
          group: "skull",
        }),
        1.6,
      );
    }
  }

  // =========================================================================
  // 4. COLOSSAL CRESCENT SOUL-SCYTHE BLADE (`bladeMount`)
  // =========================================================================
  // Layer A: Forged Wraith-Steel Primary Blade Body (YZ plane extrude via x=[0,0,1], y=[0,1,0])
  const mainBladeOutline: OutlinePoint[] = [
    [0.14, 1.68, "sharp"],
    [0.24, 1.84, "sharp"],
    [0.44, 1.95, "sharp"],
    [0.68, 1.92, "sharp"],
    [0.88, 1.76, "sharp"],
    [0.98, 1.5, "sharp"],
    [0.96, 1.2, "sharp"],
    [0.84, 0.92, "sharp"],
    [0.64, 0.72, "sharp"],
    [0.73, 0.96, "sharp"],
    [0.77, 1.22, "sharp"],
    [0.72, 1.46, "sharp"],
    [0.58, 1.64, "sharp"],
    [0.38, 1.7, "sharp"],
    [0.22, 1.62, "sharp"],
  ];
  b.extrude(mainBladeOutline, {
    at: [0, 0, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: [0.022, 0.052],
    bevel: 0.008,
    smoothing: 0,
    color: BLADE_METAL,
    bone: bladeMount,
    group: "blade",
    name: "scytheMainBlade",
  });

  // Layer B: Razor Spectral Soul-Edge along the inner concave curve (self-lit)
  const spectralEdgeOutline: OutlinePoint[] = [
    [0.2, 1.63, "sharp"],
    [0.39, 1.71, "sharp"],
    [0.59, 1.65, "sharp"],
    [0.73, 1.47, "sharp"],
    [0.78, 1.22, "sharp"],
    [0.74, 0.95, "sharp"],
    [0.64, 0.72, "sharp"],
    [0.57, 0.82, "sharp"],
    [0.66, 1.0, "sharp"],
    [0.61, 1.05, "sharp"],
    [0.69, 1.22, "sharp"],
    [0.63, 1.28, "sharp"],
    [0.65, 1.44, "sharp"],
    [0.52, 1.56, "sharp"],
    [0.35, 1.61, "sharp"],
  ];
  glow(
    b.extrude(spectralEdgeOutline, {
      at: [0, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: [0.01, 0.026],
      bevel: 0.003,
      smoothing: 0,
      color: SOUL_CYAN,
      bone: bladeMount,
      group: "blade",
      name: "scytheSpectralEdge",
    }),
    1.5,
  );

  // Layer C: Massive Sweeping Dragonbone Dorsal Spine along the outer arc of the blade
  const bladeSpinePath = catmull([
    [0, 1.76, 0.16],
    [0, 1.9, 0.32],
    [0, 1.97, 0.54],
    [0, 1.88, 0.78],
    [0, 1.64, 0.95],
    [0, 1.32, 0.99],
    [0, 0.98, 0.88],
    [0, 0.72, 0.64],
  ]);
  b.sweep(
    bladeSpinePath,
    (t) => [
      0.048 * (1 - 0.72 * t) + 0.006,
      0.056 * (1 - 0.72 * t) + 0.008,
    ],
    {
      bone: bladeMount,
      section: { ngon: 6 },
      color: DRAGON_BONE,
      caps: { start: "round", end: "point" },
      group: "blade",
      name: "bladeDragonSpine",
    },
  );

  // 8 Interlocking Dorsal Bone Knuckles & Saw-Teeth along the outer blade spine
  for (let i = 0; i < 8; i++) {
    const t = 0.08 + (i / 7) * 0.78;
    const p = bladeSpinePath.at(t);
    const tang = bladeSpinePath.tangentAt(t);
    // Outward normal in the YZ plane (pointing away from the crescent center)
    const outDir: V3 = [0, tang.z, -tang.y];
    const barbDir: V3 = [
      0,
      outDir[1] * 0.78 - tang.y * 0.42,
      outDir[2] * 0.78 - tang.z * 0.42,
    ];
    const scale = 1.05 - 0.55 * t;

    // Knuckle collar plate on the spine
    b.frustumBox(
      [p.x, p.y - 0.025 * scale, p.z - 0.025 * scale],
      [p.x, p.y + 0.025 * scale, p.z + 0.025 * scale],
      [0.095 * scale, 0.085 * scale],
      [0.075 * scale, 0.068 * scale],
      {
        bone: bladeMount,
        color: i % 2 === 0 ? DRAGON_BONE : SHADOW_GOLD,
        group: "blade",
      },
    );

    // Aggressive dorsal bone saw-tooth spike
    b.spike(p, barbDir, 0.17 * scale, 0.032 * scale, i % 2 === 0 ? AGED_HORN : DRAGON_BONE, {
      bone: bladeMount,
      section: { ngon: 5 },
      group: "blade",
    });
  }

  // Layer D: Glowing Runic Fuller Veins, Cheek Gusset Plates, Gold Clasps & Sigil Decals (both sides)
  const fullerPathL = catmull([
    [0.024, 1.72, 0.22],
    [0.024, 1.83, 0.48],
    [0.022, 1.72, 0.74],
    [0.019, 1.44, 0.87],
    [0.015, 1.1, 0.82],
    [0.01, 0.82, 0.68],
  ]);
  const fullerPathR = catmull([
    [-0.024, 1.72, 0.22],
    [-0.024, 1.83, 0.48],
    [-0.022, 1.72, 0.74],
    [-0.019, 1.44, 0.87],
    [-0.015, 1.1, 0.82],
    [-0.01, 0.82, 0.68],
  ]);
  for (const fp of [fullerPathL, fullerPathR]) {
    glow(
      b.sweep(fp, [0.015, 0.018, 0.014, 0.005], {
        bone: bladeMount,
        sides: 5,
        color: SOUL_MINT,
        caps: "point",
        group: "blade",
      }),
      1.9,
    );
  }

  // 5 Shadow-Gold Blade Rib-Clasps bridging across the blade fuller
  for (let i = 0; i < 5; i++) {
    const t = 0.14 + i * 0.18;
    const p = bladeSpinePath.at(t);
    const tang = bladeSpinePath.tangentAt(t);
    const inDir: V3 = [0, -tang.z, tang.y];
    const endP = offset(p, inDir, 0.14 * (1 - 0.35 * t));
    b.frustumBox(p, endP, [0.068 * (1 - 0.3 * t), 0.032], [0.052 * (1 - 0.3 * t), 0.024], {
      bone: bladeMount,
      color: SHADOW_GOLD,
      group: "blade",
    });
  }

  // Paired Dimensional Cheek Gusset Blades & Glowing Runic Sigil Decals on both blade faces
  for (const s of [1, -1]) {
    // Winged gold & bone cheek gusset where the blade erupts from the dragon snout
    b.sweep(
      bezier(
        [s * 0.04, 1.72, 0.18],
        [s * 0.11, 1.81, 0.36],
        [s * 0.045, 1.78, 0.56],
      ),
      [0.034, 0.028, 0.01],
      {
        bone: bladeMount,
        section: { ngon: 5 },
        color: SHADOW_GOLD,
        caps: "point",
        group: "blade",
      },
    );

    // 3 Glowing Runic Sigil Planes along each side of the blade face
    const runePlacements: Array<{ y: number; z: number; sz: number; xOff: number }> = [
      { y: 1.76, z: 0.44, sz: 0.12, xOff: 0.029 },
      { y: 1.56, z: 0.72, sz: 0.13, xOff: 0.026 },
      { y: 1.24, z: 0.81, sz: 0.11, xOff: 0.022 },
    ];
    for (const rp of runePlacements) {
      glow(
        b.part(new THREE.PlaneGeometry(rp.sz, rp.sz), "#ffffff", {
          bone: bladeMount,
          at: [s * rp.xOff, rp.y, rp.z],
          dir: [s, 0, 0],
          axis: "z",
          texture: RUNE_GLYPH_SVG,
          group: "blade",
        }),
        1.7,
      );
    }
  }

  // =========================================================================
  // 5. OCCIPITAL COUNTER-HOOK & HANGING SOUL-CENSER (`skullHead` & `censerChain`)
  // =========================================================================
  // Curved dragonbone + gold rear counter-blade / hook arching backward from the skull
  const rearHookPath = bezier(
    [0, 1.64, -0.12],
    [0, 1.76, -0.28],
    [0, 1.71, -0.44],
    [0, 1.54, -0.46],
  );
  b.sweep(rearHookPath, [0.052, 0.04, 0.026, 0.008], {
    bone: skullHead,
    section: { ngon: 6 },
    color: DRAGON_BONE,
    caps: { start: "flat", end: "point" },
    group: "censer",
    name: "occipitalCounterHook",
  });

  // Upper dorsal counter-blade fin on the occipital hook
  const counterFinOutline: OutlinePoint[] = [
    [-0.14, 1.66, "sharp"],
    [-0.28, 1.86, "sharp"],
    [-0.46, 1.78, "sharp"],
    [-0.43, 1.62, "sharp"],
    [-0.26, 1.71, "sharp"],
  ];
  b.extrude(counterFinOutline, {
    at: [0, 0, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: [0.028, 0.008],
    bevel: 0.004,
    smoothing: 0,
    color: SHADOW_GOLD,
    bone: skullHead,
    group: "censer",
    name: "occipitalCounterFin",
  });

  // Heavy forged chain links connecting the counter-hook to the censer
  for (const [idx, linkJoint, yMid] of [
    [0, censerLink1, 1.52],
    [1, censerLink2, 1.36],
  ] as const) {
    const rot = idx % 2 === 0;
    const rx = rot ? 0.028 : 0.008;
    const rz = rot ? 0.008 : 0.028;
    for (const s of [1, -1]) {
      b.rod(
        [s * rx, yMid + 0.065, -0.42 + s * rz],
        [s * rx, yMid - 0.065, -0.42 + s * rz],
        0.011,
        DARK_IRON,
        {
          bone: linkJoint,
          sides: 5,
          group: "censer",
        },
      );
    }
    b.rod(
      [-rx, yMid + 0.065, -0.42 - rz],
      [rx, yMid + 0.065, -0.42 + rz],
      0.012,
      SHADOW_GOLD,
      {
        bone: linkJoint,
        sides: 5,
        group: "censer",
      },
    );
    b.rod(
      [-rx, yMid - 0.065, -0.42 - rz],
      [rx, yMid - 0.065, -0.42 + rz],
      0.012,
      SHADOW_GOLD,
      {
        bone: linkJoint,
        sides: 5,
        group: "censer",
      },
    );
  }

  // --- The Soul-Harvester Censer Lantern (`censerBody` at y = 1.02..1.30, z = -0.42) ---
  // Top pagoda cap of the censer
  b.lathe(
    [
      [0, 1.22],
      [0.095, 1.22, "sharp"],
      [0.068, 1.26, "sharp"],
      [0.032, 1.3, "sharp"],
      [0, 1.31],
    ],
    {
      at: [0, 0, -0.42],
      segments: 6,
      smoothing: 0,
      color: SHADOW_GOLD,
      bone: censerBody,
      group: "censer",
      name: "censerCap",
    },
  );

  // Bottom basin and finial spike of the censer
  b.lathe(
    [
      [0, 0.95],
      [0.022, 1.02, "sharp"],
      [0.065, 1.06, "sharp"],
      [0.085, 1.1, "sharp"],
      [0, 1.1],
    ],
    {
      at: [0, 0, -0.42],
      segments: 6,
      smoothing: 0,
      color: SHADOW_GOLD,
      bone: censerBody,
      group: "censer",
      name: "censerBasin",
    },
  );

  // Glowing captured spirit core inside the censer
  glow(
    b.part(new THREE.OctahedronGeometry(0.058, 1), SOUL_CYAN, {
      bone: censerBody,
      at: [0, 1.16, -0.42],
      scale: [0.9, 1.25, 0.9],
      group: "censer",
      name: "censerSoulCore",
    }),
    2.0,
  );

  // 6 Curved Dragon-Rib Cage Bars enclosing the censer core
  for (let i = 0; i < 6; i++) {
    const ang = (i * Math.PI) / 3;
    const ca = Math.cos(ang);
    const sa = Math.sin(ang);
    b.sweep(
      bezier(
        [ca * 0.072, 1.09, -0.42 + sa * 0.072],
        [ca * 0.105, 1.16, -0.42 + sa * 0.105],
        [ca * 0.078, 1.23, -0.42 + sa * 0.078],
      ),
      0.012,
      {
        bone: censerBody,
        sides: 5,
        color: i % 2 === 0 ? DRAGON_BONE : WRAITH_STEEL,
        caps: "round",
        group: "censer",
      },
    );
  }

  // =========================================================================
  // 6. SPECTRAL SOUL-FIRE WISP CARDS (`b.cards` + `glow`)
  // =========================================================================
  // Rising spectral wisps along the inner blade arc, around the dragon maw, and from the altar plinth
  const bladeWispFrames = [
    frame([0, 1.62, 0.34], [0, 0.65, -0.76]),
    frame([0, 1.54, 0.56], [0, 0.45, -0.89]),
    frame([0, 1.36, 0.68], [0, 0.2, -0.98]),
    frame([0, 1.12, 0.68], [0, 0.35, -0.94]),
    frame([0, 0.88, 0.58], [0, 0.55, -0.83]),
  ];
  glow(
    b.cards(bladeWispFrames, SOUL_WISP_SVG, {
      size: [0.14, 0.26],
      lean: 18,
      bend: 20,
      cross: true,
      vary: 0.18,
      rng: rand,
      bone: bladeMount,
      group: "blade",
      name: "bladeSoulWisps",
    }),
    1.5,
  );

  const plinthWispFrames = [
    frame([0.22, 0.16, 0.18], [0, 1, 0]),
    frame([-0.22, 0.16, 0.18], [0, 1, 0]),
    frame([0.24, 0.16, -0.16], [0, 1, 0]),
    frame([-0.24, 0.16, -0.16], [0, 1, 0]),
  ];
  glow(
    b.cards(plinthWispFrames, SOUL_WISP_SVG, {
      size: [0.12, 0.24],
      lean: 12,
      bend: 15,
      cross: true,
      vary: 0.15,
      rng: rand,
      bone: plinthRoot,
      group: "plinth",
      name: "plinthSoulWisps",
    }),
    1.4,
  );

  // Decorative brass rivet studs along the dragon skull collar and blade collar
  const rivetPositions: Array<{ pos: V3; owner: typeof skullHead }> = [
    { pos: [0.11, 1.71, -0.02], owner: skullHead },
    { pos: [-0.11, 1.71, -0.02], owner: skullHead },
    { pos: [0.08, 1.76, 0.06], owner: skullHead },
    { pos: [-0.08, 1.76, 0.06], owner: skullHead },
    { pos: [0.06, 1.75, 0.22], owner: bladeMount },
    { pos: [-0.06, 1.75, 0.22], owner: bladeMount },
    { pos: [0.05, 1.82, 0.38], owner: bladeMount },
    { pos: [-0.05, 1.82, 0.38], owner: bladeMount },
  ];
  for (const rv of rivetPositions) {
    b.part(new THREE.OctahedronGeometry(0.015, 0), ANTIQUE_BRASS, {
      bone: rv.owner,
      at: rv.pos,
      group: "skull",
    });
  }

  return b.root;
}
