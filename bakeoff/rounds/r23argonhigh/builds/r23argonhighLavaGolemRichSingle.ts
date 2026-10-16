import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { offset, rng, vec } from "../../../../src/math";
import type { V3 } from "../../../../src/math";
import { cells, gradient, mix, mottle, noise, paint, scales, smoothstep } from "../../../../src/paint";
import { bezier, catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel, furEdge, INK, inkLines, zigzag } from "../../../../kits/toon";

export const meta = {
  name: "Pyroclast Archon Golem",
  description:
    "Genshin Impact-style volcanic basalt golem with molten Pyro-Geo seams, cel-shaded hexagonal columnar armor plates, ornate gold filigree, sacred elemental sigil halo, and glowing magma core.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------
// Palette: flat colors (used on self-lit glow parts, ink accents, and trims)
// ---------------------------------------------------------------------------
const LAVA_WHITE = "#fff7c2";
const LAVA_GOLD = "#ffc938";
const LAVA_ORANGE = "#ff6a14";
const LAVA_CRIMSON = "#dc2412";
const OBSIDIAN_FLAT = "#181224";
const BASALT_FLAT = "#2d253b";
const GOLD_FLAT = "#ebb746";
const GOLD_DEEP_FLAT = "#a86e1e";
const CRIMSON_SILK = "#b82228";

// ---------------------------------------------------------------------------
// Procedural Cel-Shaded Paints (baked into the shared 2048px paint sheet)
// ---------------------------------------------------------------------------

// Cracked volcanic magma body: blazing Pyro fissures between cel-shaded obsidian crust cells
const MAGMA_BODY_PAINT = paint((p, n) => {
  const w = new THREE.Vector3(
    p.x + 0.035 * (noise(p, 0.18, 5) - 0.5),
    p.y + 0.035 * (noise(p, 0.18, 17) - 0.5),
    p.z + 0.035 * (noise(p, 0.18, 29) - 0.5),
  );
  const c = cells(w, 0.17, 41);
  const border = c.d2 - c.d1;
  if (border < 0.042) return LAVA_WHITE;
  if (border < 0.095) return mix(LAVA_GOLD, LAVA_ORANGE, smoothstep(0.042, 0.095, border));
  if (border < 0.155) return mix(LAVA_ORANGE, LAVA_CRIMSON, smoothstep(0.095, 0.155, border));
  const crustLit = border < 0.22 ? "#4d1e28" : "#2f263d";
  const crustShade = border < 0.22 ? "#33121c" : "#1c1528";
  const keyDot = n.x * 0.35 + n.y * 0.8 + n.z * 0.5;
  return keyDot > 0.08 ? crustLit : crustShade;
});

// Heavy hexagonal basalt armor paint with cel shading, warm under-glow, and ink contour rims
const BASALT_RAW = scales(["#3c334d", "#332b43", "#453b57", "#2e263c"], "#1c1526", {
  size: 0.19,
  width: 0.1,
  seed: 19,
});

const BASALT_SHADED = cel(
  paint((p, n) => {
    const base = BASALT_RAW.at(p, n);
    if (n.y < -0.28) return mix(base, "#7a2c1e", smoothstep(-0.28, -0.75, n.y) * 0.55);
    if (n.y > 0.62) return mix(base, "#635878", smoothstep(0.62, 0.95, n.y) * 0.38);
    return base;
  }),
  "#1e172b",
  { threshold: 0.08 },
);

const BASALT_ARMOR = inkLines(BASALT_SHADED, {
  levels: [-0.74],
  axis: [0, 0, 1],
  width: 0.045,
  ink: INK,
});

// Darker obsidian-slate cel paint for inner joints, skull base, and phalanges
const BASALT_DARK_PAINT = cel(
  mottle("#282036", "#1d1628", { size: 0.15, contrast: 1.4, seed: 73 }),
  "#120d1c",
  { threshold: 0.06 },
);

// Genshin-style antique gold filigree cel paint
const GOLD_TRIM_PAINT = cel(
  gradient("#ffe48a", "#d99926", [0, 3.3, 0], [0, 0.3, 0]),
  "#8c5315",
  { threshold: 0.02 },
);

// Warm bronze secondary ornament cel paint
const BRONZE_TRIM_PAINT = cel("#bf8234", "#6e4114", { threshold: 0.1 });

// Curved grand horn paint: ribbed obsidian base transitioning via zig-zag flames to blazing magma tip
const HORN_MAGMA_PAINT = paint((p, n, s) => {
  const t = s[0];
  const wave = 0.07 * zigzag(s[1] / 45);
  if (t + wave < 0.42) return BASALT_DARK_PAINT.at(p, n);
  if (t + wave < 0.64) return LAVA_CRIMSON;
  if (t + wave < 0.82) return LAVA_ORANGE;
  return LAVA_GOLD;
});

// Ceremonial waist tasset paint with zig-zag gold border
const TASSET_PAINT = furEdge(BASALT_ARMOR, GOLD_TRIM_PAINT, {
  by: "position",
  axis: [0, 1, 0],
  level: 0.96,
  teeth: 0.045,
  period: 0.075,
  along: [1, 0, 0],
  ink: INK,
  inkWidth: 0.006,
});

// ---------------------------------------------------------------------------
// SVG Textures (shared across decals, rune plaques, flame plumes, and tassels)
// ---------------------------------------------------------------------------

// Sacred Pyro-Geo Mandala Sigil (used on chest core, belt buckle, and dorsal halo)
const PYRO_GEO_CREST = svg(
  `<svg viewBox="0 0 128 128">
    <polygon points="64,4 124,64 64,124 4,64" fill="#241529" stroke="#ffd866" stroke-width="5"/>
    <polygon points="64,16 112,64 64,112 16,64" fill="none" stroke="#ff6a14" stroke-width="3.5"/>
    <polygon points="64,10 82,46 118,64 82,82 64,118 46,82 10,64 46,46" fill="#dc2412" stroke="#ffd866" stroke-width="3"/>
    <polygon points="64,22 76,52 106,64 76,76 64,106 52,76 22,64 52,52" fill="#ff7b19"/>
    <polygon points="64,34 72,56 94,64 72,72 64,94 56,72 34,64 56,56" fill="#ffd24c"/>
    <circle cx="64" cy="64" r="12" fill="#fff8c8" stroke="#ff5500" stroke-width="3"/>
    <circle cx="64" cy="24" r="4.5" fill="#fff4b8"/>
    <circle cx="64" cy="104" r="4.5" fill="#fff4b8"/>
    <circle cx="24" cy="64" r="4.5" fill="#fff4b8"/>
    <circle cx="104" cy="64" r="4.5" fill="#fff4b8"/>
  </svg>`,
  { size: 256 },
);

// Glowing Teyvat construct rune plaque texture (used on pauldrons, gauntlets, and greaves)
const RUNE_PLATE_TEX = svg(
  `<svg viewBox="0 0 96 128">
    <polygon points="48,4 90,28 90,100 48,124 6,100 6,28" fill="#1e152a" stroke="#eab84b" stroke-width="5"/>
    <polygon points="48,14 80,33 80,95 48,114 16,95 16,33" fill="none" stroke="#ff6a14" stroke-width="2.5"/>
    <path d="M48 22 L48 106 M26 44 L48 30 L70 44 M26 84 L48 98 L70 84 M30 64 L66 64" stroke="#ffc938" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <polygon points="48,46 62,64 48,82 34,64" fill="#fff6c2" stroke="#ff4500" stroke-width="3"/>
  </svg>`,
  { size: 256 },
);

// Stylized cel-shaded elemental flame plume for b.cards()
const FLAME_WISP_TEX = svg(
  `<svg viewBox="0 0 64 128">
    <path d="M32 126 C12 122 6 98 14 72 C18 58 10 44 20 26 C26 38 28 30 32 4 C40 24 44 36 48 24 C56 44 48 62 52 78 C58 100 50 122 32 126 Z" fill="#dc2412" stroke="#22112f" stroke-width="3"/>
    <path d="M32 122 C18 118 14 96 20 74 C24 58 22 42 32 18 C40 42 40 58 44 76 C48 98 44 118 32 122 Z" fill="#ff7b19"/>
    <path d="M32 118 C24 114 22 96 26 78 C29 66 30 52 32 38 C35 52 36 66 38 78 C42 96 40 114 32 118 Z" fill="#ffd24c"/>
    <ellipse cx="32" cy="96" rx="6" ry="16" fill="#fff8c8"/>
  </svg>`,
  { size: 256 },
);

// Ceremonial Genshin crimson-and-gold silk tassel for hanging cards (lean: 180)
const TASSEL_TEX = svg(
  `<svg viewBox="0 0 64 128">
    <polygon points="32,2 48,18 32,34 16,18" fill="#eab84b" stroke="#22112f" stroke-width="3"/>
    <polygon points="32,9 41,18 32,27 23,18" fill="#ff6a14"/>
    <rect x="20" y="34" width="24" height="10" rx="3" fill="#d99926" stroke="#22112f" stroke-width="2.5"/>
    <path d="M18 44 L10 122 L21 116 L26 62 L30 124 L34 124 L38 62 L43 116 L54 122 L46 44 Z" fill="${CRIMSON_SILK}" stroke="#22112f" stroke-width="2.5"/>
    <path d="M22 48 L16 114 M32 48 L32 118 M42 48 L48 114" stroke="#ffd866" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

// Fierce glowing anime construct eye decal texture
const GOLEM_EYE_TEX = svg(
  `<svg viewBox="0 0 96 64">
    <polygon points="6,36 28,12 68,10 90,28 72,52 26,54" fill="#22112f"/>
    <polygon points="14,35 31,17 65,15 82,29 68,47 29,48" fill="#dc2412"/>
    <polygon points="22,34 35,21 62,19 74,30 63,43 33,44" fill="#ff7b19"/>
    <polygon points="34,32 48,18 62,32 48,46" fill="#ffd84d"/>
    <polygon points="44,20 52,32 44,44 38,32" fill="#fff9d2"/>
    <circle cx="36" cy="26" r="4.5" fill="#ffffff"/>
    <path d="M8 24 L32 6 L78 4" stroke="#eab84b" stroke-width="5" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------
// Reusable Outlines for Extrude & Lathe (all simple, non-self-intersecting)
// ---------------------------------------------------------------------------
const HEX_PLATE_OUTLINE: OutlinePoint[] = [
  [-0.22, -0.18],
  [0.22, -0.18],
  [0.3, 0.0],
  [0.18, 0.22],
  [-0.18, 0.22],
  [-0.3, 0.0],
];

const CHEST_PLATE_OUTLINE: OutlinePoint[] = [
  [0.0, -0.22],
  [0.34, -0.18],
  [0.42, 0.04],
  [0.28, 0.24],
  [-0.04, 0.22],
  [-0.12, 0.02],
];

const PAULDRON_SLAB_OUTLINE: OutlinePoint[] = [
  [-0.26, -0.18],
  [0.26, -0.18],
  [0.34, 0.04],
  [0.16, 0.26],
  [-0.16, 0.26],
  [-0.34, 0.04],
];

const HALO_FIN_OUTLINE: OutlinePoint[] = [
  [-0.055, 0.0],
  [0.055, 0.0],
  [0.085, 0.16],
  [0.0, 0.42],
  [-0.085, 0.16],
];

const TASSET_OUTLINE: OutlinePoint[] = [
  [-0.15, 0.0],
  [0.15, 0.0],
  [0.19, -0.26],
  [0.12, -0.48],
  [0.0, -0.58],
  [-0.12, -0.48],
  [-0.19, -0.26],
];

const DORSAL_CHEVRON_OUTLINE: OutlinePoint[] = [
  [-0.14, -0.06],
  [0.14, -0.06],
  [0.2, 0.06],
  [0.0, 0.22],
  [-0.2, 0.06],
];

const KNEE_GUARD_OUTLINE: OutlinePoint[] = [
  [-0.14, -0.18],
  [0.14, -0.18],
  [0.21, 0.02],
  [0.12, 0.24],
  [0.0, 0.32],
  [-0.12, 0.24],
  [-0.21, 0.02],
];

export default function build() {
  const b = createBuilder({ name: "lavaGolem", detail: 0.85, paintSize: 2048 });

  // =========================================================================
  // 1. SKELETON (55 joints, full rig roles & rigger names, standing on y = 0)
  // =========================================================================
  const hips = b.joint("hips", {
    at: [0, 1.38, -0.02],
    dir: [0, 1, 0.04],
    role: "spine",
    group: "torso",
  });

  const spine = b.chain(
    "spine",
    [
      [0, 1.62, 0.01],
      [0, 1.98, 0.05],
      [0, 2.34, 0.03],
      [0, 2.52, 0.01],
    ],
    {
      parent: hips,
      names: ["spine1", "chest", "upperChest", "shoulderBase"],
      role: "spine",
      group: "torso",
    },
  );
  const spine1 = spine.joints[0];
  const chest = spine.joints[1];
  const upperChest = spine.joints[2];
  const shoulderBase = spine.joints[3];

  const neck = b.chain(
    "neck",
    [
      [0, 2.52, 0.02],
      [0, 2.66, 0.1],
      [0, 2.78, 0.16],
    ],
    {
      parent: shoulderBase,
      names: ["neck1", "neck2"],
      role: "neck",
      group: "head",
    },
  );

  const head = b.joint("head", {
    parent: neck,
    at: [0, 2.78, 0.16],
    dir: [0, 0.04, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 2.67, 0.24],
    dir: [0, -0.32, 1],
    role: "jaw",
    group: "head",
  });

  // Heavy counter-balancing volcanic tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.32, -0.18],
      [0, 1.12, -0.54],
      [0, 0.92, -0.92],
      [0, 0.76, -1.3],
      [0, 0.72, -1.64],
      [0, 0.84, -1.94],
    ]),
    {
      parent: hips,
      count: 5,
      names: ["tail1", "tail2", "tail3", "tail4", "tail5"],
      role: "tail",
      group: "tail",
    },
  );

  // Sacred floating dorsal mandala halo joint
  const haloRing = b.joint("haloRing", {
    parent: upperChest,
    at: [0, 2.68, -0.46],
    dir: [0, 0, -1],
    role: "hinge",
    group: "halo",
  });

  // Per-side limb, pauldron, tasset, digit, and toe handles
  const sides = [1, -1] as const;
  for (const s of sides) {
    const side = s > 0 ? "L" : "R";

    // Hinged shoulder pauldron joint
    const pauldron = b.joint(`pauldron${side}`, {
      parent: upperChest,
      at: [s * 0.68, 2.48, 0.02],
      dir: [s * 0.85, 0.5, 0],
      role: "hinge",
      group: `arm${side}`,
    });

    // Hinged waist tassets (front and side)
    const tassetFront = b.joint(`tassetFront${side}`, {
      parent: hips,
      at: [s * 0.22, 1.3, 0.28],
      dir: [s * 0.1, -1, 0.18],
      role: "hinge",
      group: "waist",
    });
    const tassetSide = b.joint(`tassetSide${side}`, {
      parent: hips,
      at: [s * 0.42, 1.32, 0.0],
      dir: [s * 0.25, -1, 0],
      role: "hinge",
      group: "waist",
    });

    // Heroic arm chain in clean rigging rest pose
    const arm = b.chain(
      `arm${side}`,
      [
        [s * 0.62, 2.34, 0.02],
        [s * 1.02, 1.98, 0.06],
        [s * 1.34, 1.54, 0.2],
        [s * 1.44, 1.38, 0.26],
      ],
      {
        parent: upperChest,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
        role: "arm",
        group: `arm${side}`,
      },
    );
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];
    const wrist = arm.joints[2];

    // 4 well-separated articulated clawed digits per hand
    const digitSpecs: Array<{
      baseName: string;
      pts: V3[];
    }> = [
      {
        baseName: "thumb",
        pts: [
          [s * 1.27, 1.45, 0.34],
          [s * 1.19, 1.32, 0.44],
          [s * 1.15, 1.19, 0.5],
        ],
      },
      {
        baseName: "index",
        pts: [
          [s * 1.39, 1.37, 0.37],
          [s * 1.46, 1.2, 0.45],
          [s * 1.48, 1.04, 0.5],
        ],
      },
      {
        baseName: "middle",
        pts: [
          [s * 1.45, 1.35, 0.24],
          [s * 1.54, 1.17, 0.27],
          [s * 1.57, 0.99, 0.29],
        ],
      },
      {
        baseName: "outer",
        pts: [
          [s * 1.41, 1.37, 0.11],
          [s * 1.48, 1.2, 0.1],
          [s * 1.5, 1.04, 0.09],
        ],
      },
    ];

    const digitChains = digitSpecs.map((spec) =>
      b.chain(`${spec.baseName}${side}`, spec.pts, {
        parent: wrist,
        names: [`${spec.baseName}1${side}`, `${spec.baseName}2${side}`],
        role: "digit",
        group: `hand${side}`,
      }),
    );

    // Sturdy IK-solved leg chain landing ankle at y = 0.24 above planted sabaton on y = 0
    const legPts = limb(
      [s * 0.44, 1.38, -0.02],
      [s * 0.52, 0.24, 0.04],
      [0.64, 0.58],
      [s * 0.18, 0, 1],
    );
    const leg = b.chain(`leg${side}`, legPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.52, 0, 0.08],
      group: `leg${side}`,
    });
    const hip = leg.joints[0];
    const knee = leg.joints[1];
    const ankle = leg.joints[2];

    // 3 separated articulated toes per foot resting on y = 0
    const toeSpecs: Array<{ name: string; p0: V3; p1: V3 }> = [
      {
        name: `toeInner${side}`,
        p0: [s * 0.39, 0.09, 0.26],
        p1: [s * 0.34, 0.045, 0.44],
      },
      {
        name: `toeMid${side}`,
        p0: [s * 0.52, 0.09, 0.29],
        p1: [s * 0.52, 0.045, 0.49],
      },
      {
        name: `toeOuter${side}`,
        p0: [s * 0.65, 0.09, 0.25],
        p1: [s * 0.7, 0.045, 0.43],
      },
    ];
    const toeChains = toeSpecs.map((ts) =>
      b.chain(ts.name, [ts.p0, ts.p1], {
        parent: ankle,
        names: [ts.name],
        role: "digit",
        group: `foot${side}`,
      }),
    );

    // =======================================================================
    // 2. LIMB VOLUMES, GAUNTLETS, PAULDRONS, GREAVES, SABATONS & DIGITS
    // =======================================================================

    // Cracked-magma arm core sweep
    const armSweep = b.sweep(arm, [0.22, 0.2, 0.28, 0.22], {
      color: MAGMA_BODY_PAINT,
      sides: 6,
      smooth: false,
      group: `arm${side}`,
      name: `armCore${side}`,
    });

    // Glowing molten magma seam lines along the arm
    for (const deg of [0, 120, 240]) {
      glow(
        b.sweep(armSweep.line(deg, -0.004), 0.018, LAVA_ORANGE, {
          sides: 4,
          detail: 0.4,
          group: `arm${side}`,
        }),
        1.5,
      );
    }

    // Upper arm basalt plate + antique gold bicep band
    b.extrude(HEX_PLATE_OUTLINE, {
      at: shoulder.local([s * -0.14, 0.22, 0.04]),
      x: [0, 0, 1],
      y: [s * 0.35, -1, 0],
      thickness: [0.06, 0.03],
      bevel: 0.012,
      detail: 0.4,
      smoothing: 0,
      color: BASALT_ARMOR,
      bone: shoulder,
      group: `arm${side}`,
    });

    const bicepLoop = b.ring(
      frame(shoulder.local([0, 0.26, 0]), shoulder.dir([0, 1, 0])),
      { count: 6, radius: 0.21, group: `arm${side}` },
    );
    b.sweep(catmull(bicepLoop.items, { closed: true }), 0.026, {
      color: GOLD_TRIM_PAINT,
      bone: shoulder,
      sides: 5,
      smooth: false,
      group: `arm${side}`,
    });

    // Glowing magma elbow crystal node + basalt elbow spur
    glow(
      b.part(new THREE.OctahedronGeometry(0.085, 0), LAVA_GOLD, {
        bone: elbow,
        at: elbow.local([s * -0.12, 0.0, -0.12]),
        group: `arm${side}`,
      }),
      1.7,
    );
    b.spike(
      elbow.local([s * -0.08, 0.02, -0.08]),
      [s * 0.4, 0.2, -1],
      0.26,
      0.08,
      BASALT_ARMOR,
      {
        bone: elbow,
        sides: 5,
        smooth: false,
        group: `arm${side}`,
      },
    );

    // Massive 4-plated hexagonal basalt forearm gauntlet around elbow->wrist
    const forearmMid = lerpPoint(elbow.at, wrist.at, 0.48);
    const forearmAxis = vec(wrist.at).sub(elbow.at).normalize();
    b.ring(
      frame(forearmMid, forearmAxis),
      { count: 4, radius: 0.24, group: `arm${side}` },
      (plateFrame) => {
        b.frustumBox(
          plateFrame.local([0, -0.04, -0.22]),
          plateFrame.local([0, 0.04, 0.22]),
          [0.2, 0.08],
          [0.24, 0.09],
          {
            bone: elbow,
            color: BASALT_ARMOR,
            group: `arm${side}`,
          },
        );
      },
    );

    // Twin antique gold gauntlet cuffs (upper and lower forearm)
    for (const cuffT of [0.18, 0.82]) {
      const cuffCenter = lerpPoint(elbow.at, wrist.at, cuffT);
      const cuffRing = b.ring(frame(cuffCenter, forearmAxis), {
        count: 6,
        radius: 0.27,
        group: `arm${side}`,
      });
      b.sweep(catmull(cuffRing.items, { closed: true }), 0.03, {
        color: GOLD_TRIM_PAINT,
        bone: elbow,
        sides: 5,
        smooth: false,
        group: `arm${side}`,
      });
    }

    // Outer gauntlet shield crest, glowing rune plaque, and 3 erupting magma-tipped basalt spikes
    const outerGauntletPos = offset(forearmMid, [s, 0.15, 0.25], 0.27);
    b.extrude(HEX_PLATE_OUTLINE, {
      at: outerGauntletPos,
      x: [0, 0, 1],
      y: forearmAxis,
      thickness: 0.055,
      bevel: 0.01,
      detail: 0.4,
      smoothing: 0,
      color: GOLD_TRIM_PAINT,
      bone: elbow,
      group: `arm${side}`,
    });

    glow(
      b.part(new THREE.PlaneGeometry(0.18, 0.24), "#ffffff", {
        bone: elbow,
        at: offset(outerGauntletPos, [s, 0.15, 0.25], 0.034),
        dir: [s, 0.15, 0.25],
        up: forearmAxis,
        axis: "z",
        texture: RUNE_PLATE_TEX,
        group: `arm${side}`,
      }),
      1.5,
    );

    for (let k = 0; k < 3; k++) {
      const kt = 0.24 + k * 0.26;
      const basePt = offset(lerpPoint(elbow.at, wrist.at, kt), [s, 0.1, -0.35], 0.22);
      const tipDir: V3 = [s * 0.85, 0.35 - k * 0.12, -0.45];
      b.rod(basePt, offset(basePt, tipDir, 0.16), [0.065, 0.048], BASALT_ARMOR, {
        bone: elbow,
        sides: 6,
        smooth: false,
        group: `arm${side}`,
      });
      glow(
        b.spike(offset(basePt, tipDir, 0.14), tipDir, 0.13, 0.046, LAVA_ORANGE, {
          bone: elbow,
          sides: 5,
          smooth: false,
          group: `arm${side}`,
        }),
        1.7,
      );
    }

    // Armored hand block on wrist + 4 blazing knuckle crystals
    b.frustumBox(
      wrist.local([0, -0.04, 0]),
      wrist.local([0, 0.18, 0]),
      [0.28, 0.2],
      [0.32, 0.22],
      {
        bone: wrist,
        color: BASALT_ARMOR,
        group: `hand${side}`,
      },
    );
    b.rod(
      wrist.local([-0.14, 0.08, 0.09]),
      wrist.local([0.14, 0.08, 0.09]),
      0.032,
      GOLD_TRIM_PAINT,
      {
        bone: wrist,
        sides: 5,
        smooth: false,
        group: `hand${side}`,
      },
    );

    // Build each of the 4 finger chains + knuckle gems + glowing magma claws
    digitChains.forEach((dChain, idx) => {
      b.sweep(dChain, [0.056, 0.046, 0.034], {
        color: BASALT_DARK_PAINT,
        sides: 6,
        smooth: false,
        group: `hand${side}`,
      });
      const j0 = dChain.joints[0];
      const j1 = dChain.joints[1];
      // Gold knuckle ring on first phalanx
      b.part(new THREE.OctahedronGeometry(0.052, 0), GOLD_TRIM_PAINT, {
        bone: j0,
        at: j0.at,
        group: `hand${side}`,
      });
      // Glowing magma knuckle crystal on dorsal hand
      glow(
        b.spike(
          offset(j0.at, [s * 0.6, 0.5, 0.2], 0.02),
          [s * 0.7, 0.55, 0.15 + (idx - 1.5) * 0.15],
          0.09,
          0.036,
          LAVA_GOLD,
          {
            bone: wrist,
            sides: 4,
            smooth: false,
            group: `hand${side}`,
          },
        ),
        1.7,
      );
      // Blazing curved magma claw on distal phalanx
      const tipEnd = dChain.at(1);
      glow(
        b.spike(tipEnd.at, tipEnd.tangent, 0.12, 0.038, LAVA_ORANGE, {
          bone: j1,
          sides: 4,
          smooth: false,
          group: `hand${side}`,
        }),
        1.6,
      );
    });

    // =======================================================================
    // Towering Columnar Basalt Pauldron (on pauldronL / pauldronR)
    // =======================================================================
    for (let tier = 0; tier < 3; tier++) {
      const tierLift = tier * 0.09;
      b.extrude(PAULDRON_SLAB_OUTLINE, {
        at: [s * (0.66 + tier * 0.07), 2.42 + tierLift, 0.03],
        x: [0, 0, 1],
        y: [s * 0.45, 0.88, 0],
        thickness: [0.08, 0.045],
        bevel: 0.014,
        detail: 0.4,
        smoothing: 0,
        color: tier === 1 ? GOLD_TRIM_PAINT : BASALT_ARMOR,
        bone: pauldron,
        group: `arm${side}`,
      });
    }

    // Glowing rune plaque on the outer shoulder pauldron
    glow(
      b.part(new THREE.PlaneGeometry(0.2, 0.26), "#ffffff", {
        bone: pauldron,
        at: [s * 0.88, 2.52, 0.04],
        dir: [s * 0.9, 0.42, 0.08],
        axis: "z",
        texture: RUNE_PLATE_TEX,
        group: `arm${side}`,
      }),
      1.5,
    );

    // 3 erupting hexagonal basalt columns + glowing magma crystal tips on each shoulder
    const colSpecs: Array<{ base: V3; dir: V3; len: number; r: number }> = [
      { base: [s * 0.62, 2.54, -0.02], dir: [s * 0.48, 0.88, -0.12], len: 0.34, r: 0.095 },
      { base: [s * 0.76, 2.52, 0.06], dir: [s * 0.72, 0.68, 0.08], len: 0.38, r: 0.105 },
      { base: [s * 0.68, 2.48, -0.14], dir: [s * 0.58, 0.74, -0.34], len: 0.3, r: 0.082 },
    ];
    for (const cs of colSpecs) {
      const colTop = offset(cs.base, cs.dir, cs.len);
      b.rod(cs.base, colTop, [cs.r, cs.r * 0.82], BASALT_ARMOR, {
        bone: pauldron,
        sides: 6,
        smooth: false,
        group: `arm${side}`,
      });
      // Gold collar band around column top
      b.rod(
        offset(colTop, cs.dir, -0.05),
        colTop,
        cs.r * 0.9,
        GOLD_TRIM_PAINT,
        {
          bone: pauldron,
          sides: 6,
          smooth: false,
          group: `arm${side}`,
        },
      );
      // Blazing magma crystal tip erupting out of the hexagonal basalt column
      glow(
        b.spike(offset(colTop, cs.dir, -0.02), cs.dir, 0.2, cs.r * 0.76, LAVA_ORANGE, {
          bone: pauldron,
          sides: 6,
          smooth: false,
          group: `arm${side}`,
        }),
        1.8,
      );
      glow(
        b.spike(offset(colTop, cs.dir, 0.06), cs.dir, 0.14, cs.r * 0.48, LAVA_WHITE, {
          bone: pauldron,
          sides: 4,
          smooth: false,
          group: `arm${side}`,
        }),
        2.0,
      );
    }

    // Hanging crimson-and-gold silk tassels under the shoulder pauldron
    b.cards(
      [
        frame([s * 0.78, 2.32, 0.2], [0, 1, 0]),
        frame([s * 0.78, 2.32, -0.14], [0, 1, 0]),
      ],
      TASSEL_TEX,
      {
        size: [0.11, 0.24],
        lean: 180,
        flow: [s, 0, 0.2],
        bone: pauldron,
        group: `arm${side}`,
      },
    );

    // =======================================================================
    // Hinged Waist Tassets (Front & Side)
    // =======================================================================
    b.extrude(TASSET_OUTLINE, {
      at: tassetFront.at,
      x: [1, 0, s * -0.25],
      y: [0, 1, 0.12],
      thickness: 0.045,
      bevel: 0.008,
      detail: 0.4,
      smoothing: 0,
      color: TASSET_PAINT,
      bone: tassetFront,
      group: "waist",
    });
    glow(
      b.part(new THREE.OctahedronGeometry(0.048, 0), LAVA_GOLD, {
        bone: tassetFront,
        at: [s * 0.22, 1.08, 0.33],
        group: "waist",
      }),
      1.6,
    );
    b.cards([frame([s * 0.22, 0.82, 0.34], [0, 1, 0])], TASSEL_TEX, {
      size: [0.11, 0.24],
      lean: 180,
      flow: [0, 0, 1],
      bone: tassetFront,
      group: "waist",
    });

    b.extrude(TASSET_OUTLINE, {
      at: tassetSide.at,
      x: [0, 0, 1],
      y: [s * 0.18, 1, 0],
      thickness: 0.05,
      bevel: 0.008,
      detail: 0.4,
      smoothing: 0,
      color: TASSET_PAINT,
      bone: tassetSide,
      group: "waist",
    });
    b.cards([frame([s * 0.48, 0.82, 0.0], [0, 1, 0])], TASSEL_TEX, {
      size: [0.12, 0.25],
      lean: 180,
      flow: [s, 0, 0],
      bone: tassetSide,
      group: "waist",
    });

    // =======================================================================
    // Pillar Legs, Greaves, Knee Guards & Planted Sabatons (y = 0)
    // =======================================================================
    const legSweep = b.sweep(leg, [0.3, 0.26, 0.28, 0.23], {
      color: MAGMA_BODY_PAINT,
      sides: 6,
      smooth: false,
      group: `leg${side}`,
      name: `legCore${side}`,
    });

    for (const deg of [0, 110, 250]) {
      glow(
        b.sweep(legSweep.line(deg, -0.004), 0.019, LAVA_ORANGE, {
          sides: 4,
          detail: 0.4,
          group: `leg${side}`,
        }),
        1.5,
      );
    }

    // Heavy thigh basalt cuisse plate + gold trim bar
    const thighMid = lerpPoint(hip.at, knee.at, 0.48);
    b.extrude(HEX_PLATE_OUTLINE, {
      at: offset(thighMid, [s * 0.65, 0.1, 0.75], 0.22),
      x: [s * -0.5, 0, 0.86],
      y: [0, 1, 0],
      thickness: 0.065,
      bevel: 0.012,
      detail: 0.4,
      smoothing: 0,
      color: BASALT_ARMOR,
      bone: hip,
      group: `leg${side}`,
    });
    b.rod(
      offset(hip.at, [s * 0.7, -0.1, 0.7], 0.26),
      offset(knee.at, [s * 0.7, 0.2, 0.7], 0.24),
      0.032,
      GOLD_TRIM_PAINT,
      {
        bone: hip,
        sides: 5,
        smooth: false,
        group: `leg${side}`,
      },
    );

    // Ornate Genshin construct knee-guard + golden cheek-horns + glowing knee gem
    const kneeFront = offset(knee.at, [s * 0.15, 0.05, 1], 0.26);
    b.extrude(KNEE_GUARD_OUTLINE, {
      at: kneeFront,
      x: [1, 0, s * -0.15],
      y: [0, 1, 0.1],
      thickness: [0.06, 0.035],
      bevel: 0.01,
      detail: 0.4,
      smoothing: 0,
      color: BASALT_ARMOR,
      bone: knee,
      group: `leg${side}`,
    });
    b.extrude(KNEE_GUARD_OUTLINE, {
      at: offset(kneeFront, [0, 0.04, 1], 0.025),
      x: [0.78, 0, s * -0.12],
      y: [0, 0.78, 0.08],
      thickness: 0.03,
      smoothing: 0,
      color: GOLD_TRIM_PAINT,
      bone: knee,
      group: `leg${side}`,
    });
    glow(
      b.part(new THREE.OctahedronGeometry(0.065, 0), LAVA_GOLD, {
        bone: knee,
        at: offset(kneeFront, [0, 0.02, 1], 0.055),
        group: `leg${side}`,
      }),
      1.8,
    );

    // Lower leg hexagonal basalt greaves + upper/lower gold greave rings + rune plaque
    const shinMid = lerpPoint(knee.at, ankle.at, 0.5);
    const shinAxis = vec(ankle.at).sub(knee.at).normalize();
    b.ring(
      frame(shinMid, shinAxis),
      { count: 4, radius: 0.23, group: `leg${side}` },
      (shinPlate) => {
        b.frustumBox(
          shinPlate.local([0, -0.03, -0.22]),
          shinPlate.local([0, 0.03, 0.22]),
          [0.2, 0.08],
          [0.24, 0.09],
          {
            bone: knee,
            color: BASALT_ARMOR,
            group: `leg${side}`,
          },
        );
      },
    );

    for (const gt of [0.22, 0.8]) {
      const gPt = lerpPoint(knee.at, ankle.at, gt);
      const gLoop = b.ring(frame(gPt, shinAxis), {
        count: 6,
        radius: 0.26,
        group: `leg${side}`,
      });
      b.sweep(catmull(gLoop.items, { closed: true }), 0.028, {
        color: GOLD_TRIM_PAINT,
        bone: knee,
        sides: 5,
        smooth: false,
        group: `leg${side}`,
      });
    }

    glow(
      b.part(new THREE.PlaneGeometry(0.16, 0.22), "#ffffff", {
        bone: knee,
        at: offset(shinMid, [s * 0.25, 0, 1], 0.27),
        dir: [s * 0.25, 0, 1],
        axis: "z",
        texture: RUNE_PLATE_TEX,
        group: `leg${side}`,
      }),
      1.4,
    );

    // Planted Basalt Pillar Sabaton on ankle: strictly vertical frustumBox landing flat at y = 0.0!
    b.frustumBox(
      [s * 0.52, 0.26, 0.05],
      [s * 0.52, 0.0, 0.05],
      [0.34, 0.36],
      [0.44, 0.44],
      {
        bone: ankle,
        color: BASALT_ARMOR,
        group: `foot${side}`,
        name: `sabatonBase${side}`,
      },
    );

    // Golden sabaton rim sitting flat from y = 0.08 to y = 0.002
    b.frustumBox(
      [s * 0.52, 0.085, 0.06],
      [s * 0.52, 0.002, 0.06],
      [0.45, 0.45],
      [0.47, 0.47],
      {
        bone: ankle,
        color: GOLD_TRIM_PAINT,
        group: `foot${side}`,
      },
    );

    // Rear heel spur + glowing heel vent (staying safely above y = 0.01)
    b.spike(
      [s * 0.52, 0.11, -0.14],
      [0, -0.18, -1],
      0.2,
      0.08,
      BASALT_DARK_PAINT,
      {
        bone: ankle,
        sides: 5,
        smooth: false,
        group: `foot${side}`,
      },
    );
    glow(
      b.part(new THREE.OctahedronGeometry(0.055, 0), LAVA_ORANGE, {
        bone: ankle,
        at: [s * 0.52, 0.16, -0.16],
        group: `foot${side}`,
      }),
      1.6,
    );

    // 3 articulated front/side toes per foot with flat-bottomed basalt toe-blocks on y = 0 and glowing magma claws
    toeChains.forEach((tChain, tIdx) => {
      const toeJoint = tChain.joints[0];
      const p0 = toeSpecs[tIdx].p0;
      const p1 = toeSpecs[tIdx].p1;
      const midX = (p0[0] + p1[0]) * 0.5;
      const midZ = (p0[2] + p1[2]) * 0.5;

      // Vertical toe armor block resting cleanly on y = 0.0
      b.frustumBox(
        [midX, 0.13, midZ],
        [midX, 0.0, midZ],
        [0.11, 0.18],
        [0.13, 0.22],
        {
          bone: toeJoint,
          color: BASALT_DARK_PAINT,
          group: `foot${side}`,
        },
      );
      // Gold toe knuckle cap
      b.part(new THREE.OctahedronGeometry(0.048, 0), GOLD_TRIM_PAINT, {
        bone: toeJoint,
        at: [p0[0], 0.14, p0[2] + 0.03],
        group: `foot${side}`,
      });
      // Blazing magma toe-claw aimed horizontally forward so tip stays at y = 0.045m
      const clawDir: V3 = [p1[0] - p0[0], -0.02, p1[2] - p0[2]];
      glow(
        b.spike([p1[0], 0.055, p1[2] - 0.02], clawDir, 0.13, 0.048, LAVA_ORANGE, {
          bone: toeJoint,
          sides: 4,
          smooth: false,
          group: `foot${side}`,
        }),
        1.6,
      );
    });
  }

  // =========================================================================
  // 3. TORSO CORE, MOLTEN SEAMS, PYRO-GEO FURNACE CORE & THORACIC ARMOR
  // =========================================================================
  const torsoLoft = b.loft(
    [
      { at: [0, 1.24, -0.04], w: 0.72, h: 0.54 },
      { at: [0, 1.56, 0.0], w: 0.64, h: 0.5 },
      { at: [0, 1.88, 0.05], w: 0.96, h: 0.68 },
      { at: [0, 2.22, 0.07], w: 1.24, h: 0.78 },
      { at: [0, 2.52, 0.02], w: 1.02, h: 0.62 },
    ],
    {
      bone: [hips, spine],
      color: MAGMA_BODY_PAINT,
      sides: 8,
      group: "torso",
      name: "torsoCore",
    },
  );

  // Glowing molten magma rivers coursing up the torso
  for (const deg of [0, 42, -42, 135, -135, 180]) {
    glow(
      b.sweep(torsoLoft.line(deg, -0.004), 0.022, LAVA_ORANGE, {
        bone: [hips, spine],
        sides: 4,
        detail: 0.4,
        group: "torso",
      }),
      1.6,
    );
  }

  // Central Chest Elemental Core ("Heart of Pyro-Geo") on chest bone
  const coreCenter: V3 = [0, 2.12, 0.44];
  // Outer octagonal gold filigree housing
  b.lathe(
    [
      [0.0, -0.05],
      [0.25, -0.05],
      [0.28, 0.02],
      [0.21, 0.07],
      [0.14, 0.07],
      [0.14, -0.02],
      [0.0, -0.02],
    ],
    {
      at: coreCenter,
      axis: [0, 0.12, 1],
      segments: 8,
      smoothing: 0,
      color: GOLD_TRIM_PAINT,
      bone: chest,
      group: "torso",
    },
  );

  // Blazing multi-crystal Pyro heart inside the furnace housing
  glow(
    b.part(new THREE.OctahedronGeometry(0.13, 0), LAVA_WHITE, {
      bone: chest,
      at: [0, 2.12, 0.47],
      scale: [0.9, 1.25, 0.75],
      group: "torso",
    }),
    2.0,
  );
  b.ring(
    frame([0, 2.12, 0.46], [0, 0.12, 1]),
    { count: 4, radius: 0.16, group: "torso" },
    (shardFrame) => {
      glow(
        b.spike(shardFrame, shardFrame, 0.1, 0.042, LAVA_ORANGE, {
          bone: chest,
          sides: 4,
          smooth: false,
          group: "torso",
        }),
        1.7,
      );
    },
  );
  // Sacred Pyro-Geo sigil crest plane over the core
  glow(
    b.part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", {
      bone: chest,
      at: [0, 2.12, 0.54],
      dir: [0, 0.12, 1],
      axis: "z",
      texture: PYRO_GEO_CREST,
      group: "torso",
    }),
    1.5,
  );

  // Paired Pectoral, Ribcage & Back Basalt Armor Plates + Glowing Inter-Rib Vents
  for (const s of sides) {
    // Heavy hexagonal pectoral basalt slab framing the chest core
    b.extrude(CHEST_PLATE_OUTLINE, {
      at: [s * 0.24, 2.18, 0.39],
      x: [s, 0, -0.28],
      y: [0, 1, -0.14],
      thickness: [0.09, 0.05],
      bevel: 0.015,
      detail: 0.4,
      smoothing: 0,
      color: BASALT_ARMOR,
      bone: chest,
      group: "torso",
    });

    // Golden pectoral rim bar
    b.rod(
      [s * 0.18, 1.98, 0.45],
      [s * 0.56, 2.14, 0.32],
      0.028,
      GOLD_TRIM_PAINT,
      {
        bone: chest,
        sides: 5,
        smooth: false,
        group: "torso",
      },
    );

    // 3 tiers of overlapping abdominal & lower-rib basalt plates + glowing lava rib-vents
    for (let r = 0; r < 3; r++) {
      const ry = 1.54 + r * 0.16;
      const rz = 0.26 + r * 0.04;
      const rw = 0.22 + r * 0.05;
      const ribBone = r === 0 ? spine1 : chest;
      b.frustumBox(
        [s * 0.09, ry, rz + 0.04],
        [s * (0.18 + rw), ry + 0.05, rz - 0.1],
        [0.09, 0.1],
        [0.11, 0.12],
        {
          bone: ribBone,
          color: BASALT_ARMOR,
          group: "torso",
        },
      );
      glow(
        b.rod(
          [s * 0.1, ry - 0.055, rz + 0.03],
          [s * (0.14 + rw * 0.85), ry - 0.015, rz - 0.08],
          0.02,
          LAVA_GOLD,
          {
            bone: ribBone,
            sides: 4,
            detail: 0.4,
            group: "torso",
          },
        ),
        1.7,
      );
    }

    // Massive dorsal scapula basalt slab on upper back
    b.extrude(HEX_PLATE_OUTLINE, {
      at: [s * 0.3, 2.18, -0.35],
      x: [s, 0, 0.25],
      y: [0, 1, 0.12],
      thickness: 0.08,
      bevel: 0.014,
      detail: 0.4,
      smoothing: 0,
      color: BASALT_ARMOR,
      bone: upperChest,
      group: "torso",
    });

    // 3 erupting dorsal hexagonal basalt columns per side on upper back with glowing magma tips
    for (let d = 0; d < 3; d++) {
      const colBase: V3 = [s * (0.22 + d * 0.12), 1.94 + d * 0.22, -0.32 - d * 0.03];
      const colDir: V3 = [s * 0.32, 0.72, -0.62];
      const colLen = 0.26 + d * 0.06;
      const colR = 0.072 + d * 0.012;
      const colBone = d === 0 ? chest : upperChest;
      const colEnd = offset(colBase, colDir, colLen);

      b.rod(colBase, colEnd, [colR, colR * 0.82], BASALT_ARMOR, {
        bone: colBone,
        sides: 6,
        smooth: false,
        group: "torso",
      });
      b.rod(offset(colEnd, colDir, -0.045), colEnd, colR * 0.9, GOLD_TRIM_PAINT, {
        bone: colBone,
        sides: 6,
        smooth: false,
        group: "torso",
      });
      glow(
        b.spike(offset(colEnd, colDir, -0.01), colDir, 0.17, colR * 0.74, LAVA_ORANGE, {
          bone: colBone,
          sides: 6,
          smooth: false,
          group: "torso",
        }),
        1.8,
      );
    }
  }

  // Ornate Thoracic Collar / Gorget around shoulderBase
  b.lathe(
    [
      [0.0, -0.06],
      [0.42, -0.06],
      [0.48, 0.06],
      [0.36, 0.16],
      [0.24, 0.14],
      [0.0, 0.08],
    ],
    {
      at: [0, 2.48, 0.06],
      axis: [0, 1, 0.22],
      segments: 8,
      smoothing: 0,
      color: GOLD_TRIM_PAINT,
      bone: shoulderBase,
      group: "torso",
    },
  );

  // Heavy Waist War-Belt & Geo-Pyro Seal Buckle around hips
  b.lathe(
    [
      [0.0, -0.12],
      [0.44, -0.12],
      [0.48, 0.0],
      [0.45, 0.12],
      [0.0, 0.12],
    ],
    {
      at: [0, 1.38, -0.01],
      axis: [0, 1, 0],
      segments: 8,
      smoothing: 0,
      color: BASALT_ARMOR,
      bone: hips,
      group: "waist",
    },
  );
  b.lathe(
    [
      [0.0, -0.05],
      [0.49, -0.05],
      [0.51, 0.0],
      [0.49, 0.05],
      [0.0, 0.05],
    ],
    {
      at: [0, 1.38, -0.01],
      axis: [0, 1, 0],
      segments: 8,
      smoothing: 0,
      color: GOLD_TRIM_PAINT,
      bone: hips,
      group: "waist",
    },
  );
  // Central waist buckle plaque + glowing Pyro-Geo seal
  b.part(new THREE.OctahedronGeometry(0.16, 0), GOLD_TRIM_PAINT, {
    bone: hips,
    at: [0, 1.38, 0.44],
    scale: [1.1, 1.1, 0.45],
    group: "waist",
  });
  glow(
    b.part(new THREE.PlaneGeometry(0.28, 0.28), "#ffffff", {
      bone: hips,
      at: [0, 1.38, 0.51],
      dir: [0, 0, 1],
      axis: "z",
      texture: PYRO_GEO_CREST,
      group: "waist",
    }),
    1.5,
  );

  // =========================================================================
  // 4. SACRED FLOATING PYRO-GEO MANDALA HALO (connected to upperChest)
  // =========================================================================
  // Twin curved gold-and-basalt dorsal mounting pylons connecting upperChest to haloRing (no loose parts!)
  for (const s of sides) {
    const mountPath = bezier(
      [s * 0.22, 2.32, -0.26],
      [s * 0.36, 2.48, -0.42],
      [s * 0.44, 2.64, -0.46],
    );
    b.sweep(mountPath, [0.052, 0.038], {
      bone: upperChest,
      color: GOLD_TRIM_PAINT,
      sides: 5,
      smooth: false,
      group: "halo",
    });
  }

  // Outer octagonal golden mandala ring + inner blazing magma ring
  const outerHaloPts = b.ring(haloRing, { count: 8, radius: 0.62, group: "halo" }).items;
  b.sweep(catmull(outerHaloPts, { closed: true }), 0.038, {
    bone: haloRing,
    color: GOLD_TRIM_PAINT,
    sides: 6,
    smooth: false,
    group: "halo",
  });

  const innerHaloPts = b.ring(haloRing, { count: 8, radius: 0.5, group: "halo" }).items;
  glow(
    b.sweep(catmull(innerHaloPts, { closed: true }), 0.026, LAVA_ORANGE, {
      bone: haloRing,
      sides: 4,
      detail: 0.4,
      group: "halo",
    }),
    1.7,
  );

  // 8 radiating Genshin-style Pyro-Geo diamond blades & magma spikes around haloRing
  b.ring(haloRing, { count: 8, radius: 0.56, group: "halo" }, (spoke) => {
    const isCardinal = spoke.i % 2 === 0;
    // Bridge bar between inner and outer rings
    b.rod(
      spoke.local([0, -0.08, 0]),
      spoke.local([0, 0.1, 0]),
      0.032,
      BASALT_ARMOR,
      {
        bone: haloRing,
        sides: 5,
        smooth: false,
        group: "halo",
      },
    );
    // Ornate golden spear-fin radiating outward
    b.extrude(HALO_FIN_OUTLINE, {
      at: spoke.local([0, 0.04, 0]),
      x: spoke.dir([1, 0, 0]),
      y: spoke.axis,
      thickness: isCardinal ? 0.04 : 0.03,
      smoothing: 0,
      color: isCardinal ? GOLD_TRIM_PAINT : BRONZE_TRIM_PAINT,
      bone: haloRing,
      group: "halo",
    });
    // Blazing magma crystal spear tip on each halo point
    glow(
      b.spike(
        spoke.local([0, 0.34, 0]),
        spoke.axis,
        isCardinal ? 0.24 : 0.16,
        isCardinal ? 0.052 : 0.038,
        isCardinal ? LAVA_GOLD : LAVA_ORANGE,
        {
          bone: haloRing,
          sides: 4,
          smooth: false,
          group: "halo",
        },
      ),
      1.9,
    );
  });

  // =========================================================================
  // 5. HEAD, FIERCE ANIME CONSTRUCT VISAGE, GRAND HORNS & ARTICULATED JAW
  // =========================================================================
  b.sweep(neck, [0.24, 0.2], {
    color: MAGMA_BODY_PAINT,
    sides: 6,
    smooth: false,
    group: "head",
  });

  // Upper basalt skull & armored snout
  const upperSkull = b.frustumBox(
    [0, 2.72, 0.02],
    [0, 2.82, 0.42],
    [0.44, 0.32],
    [0.32, 0.24],
    {
      bone: head,
      color: BASALT_ARMOR,
      group: "head",
      name: "upperSkull",
    },
  );

  // Basalt cranial crown dome
  b.lathe(
    [
      [0.0, 0.0],
      [0.24, 0.0],
      [0.26, 0.08],
      [0.18, 0.18],
      [0.0, 0.22],
    ],
    {
      at: [0, 2.86, 0.16],
      axis: [0, 1, -0.15],
      segments: 6,
      smoothing: 0,
      color: BASALT_ARMOR,
      bone: head,
      group: "head",
    },
  );

  // Ornate golden war-crest V-brow and forehead Pyro diamond crystal
  const BROW_CREST_OUTLINE: OutlinePoint[] = [
    [0.0, -0.06],
    [0.12, 0.04],
    [0.28, 0.14],
    [0.24, 0.22],
    [0.07, 0.12],
    [0.0, 0.24],
    [-0.07, 0.12],
    [-0.24, 0.22],
    [-0.28, 0.14],
    [-0.12, 0.04],
  ];
  b.extrude(BROW_CREST_OUTLINE, {
    at: [0, 2.85, 0.4],
    x: [1, 0, 0],
    y: [0, 1, -0.25],
    thickness: 0.05,
    bevel: 0.008,
    detail: 0.4,
    smoothing: 0,
    color: GOLD_TRIM_PAINT,
    bone: head,
    group: "head",
  });

  glow(
    b.part(new THREE.OctahedronGeometry(0.068, 0), LAVA_WHITE, {
      bone: head,
      at: [0, 2.94, 0.41],
      scale: [0.75, 1.35, 0.75],
      group: "head",
    }),
    2.0,
  );

  // Fierce anime construct eyes (decal + glowing magma eye-slits), cheek plates, upper fangs & grand horns
  const skullSurface = b.surface(upperSkull);
  for (const s of sides) {
    // Conformed anime construct eye decal on angled skull side-front
    b.decal(skullSurface, GOLEM_EYE_TEX, {
      at: [s * 0.15, 2.8, 0.35],
      dir: [s * 0.52, 0.08, 0.85],
      size: [0.16, 0.11],
      mirror: s > 0,
      bone: head,
      group: "head",
    });

    // Self-lit glowing magma eye slit bar
    glow(
      b.rod(
        [s * 0.09, 2.79, 0.41],
        [s * 0.2, 2.82, 0.32],
        0.022,
        LAVA_GOLD,
        {
          bone: head,
          sides: 4,
          smooth: false,
          group: "head",
        },
      ),
      1.9,
    );

    // Swept-back golden temple wing
    b.spike(
      [s * 0.21, 2.84, 0.26],
      [s * 0.65, 0.35, -0.7],
      0.24,
      0.048,
      GOLD_TRIM_PAINT,
      {
        bone: head,
        sides: 4,
        smooth: false,
        group: "head",
      },
    );

    // Sweeping Segmented Volcanic Grand Horn (reaching y = 3.34m)
    const hornCurve = bezier(
      [s * 0.16, 2.92, 0.16],
      [s * 0.44, 3.04, 0.02],
      [s * 0.56, 3.2, -0.18],
      [s * 0.46, 3.36, -0.06],
    );
    b.sweep(hornCurve, [0.092, 0.072, 0.05, 0.018], {
      bone: head,
      color: HORN_MAGMA_PAINT,
      sides: 6,
      smooth: false,
      group: "head",
    });

    // 3 antique gold collar rings along the grand horn
    for (const ht of [0.16, 0.42, 0.68]) {
      const hPt = hornCurve.at(ht);
      const hTan = hornCurve.tangentAt(ht);
      b.rod(
        offset(hPt, hTan, -0.02),
        offset(hPt, hTan, 0.02),
        0.088 * (1 - ht * 0.42),
        GOLD_TRIM_PAINT,
        {
          bone: head,
          sides: 6,
          smooth: false,
          group: "head",
        },
      );
    }

    // Blazing self-lit magma crystal spear-tip on the grand horn
    const hornTipPt = hornCurve.at(0.84);
    const hornTipDir = hornCurve.tangentAt(0.92);
    glow(
      b.spike(hornTipPt, hornTipDir, 0.18, 0.044, LAVA_GOLD, {
        bone: head,
        sides: 5,
        smooth: false,
        group: "head",
      }),
      1.9,
    );

    // Secondary cheek/zygomatic basalt horn
    b.spike(
      [s * 0.22, 2.74, 0.2],
      [s * 0.85, -0.1, -0.5],
      0.2,
      0.052,
      BASALT_ARMOR,
      {
        bone: head,
        sides: 5,
        smooth: false,
        group: "head",
      },
    );

    // 3 upper jaw fangs per side (obsidian & gold)
    for (let f = 0; f < 3; f++) {
      const fx = s * (0.045 + f * 0.05);
      const fz = 0.41 - f * 0.05;
      b.spike(
        [fx, 2.71, fz],
        [0, -1, 0.15],
        f === 1 ? 0.085 : 0.062,
        0.024,
        f === 1 ? GOLD_TRIM_PAINT : BASALT_DARK_PAINT,
        {
          bone: head,
          sides: 4,
          smooth: false,
          group: "head",
        },
      );
    }
  }

  // Articulated Lower Jaw (`jaw` bone): craggy basalt mandible, golden beard spike, lower fangs & glowing magma maw
  b.frustumBox(
    jaw.local([0, 0.0, -0.05]),
    jaw.local([0, 0.24, -0.02]),
    [0.34, 0.14],
    [0.24, 0.11],
    {
      bone: jaw,
      color: BASALT_ARMOR,
      group: "head",
      name: "lowerJawPlate",
    },
  );

  // Glowing molten magma mouth interior & tongue riding on the lower jaw
  glow(
    b.frustumBox(
      jaw.local([0, 0.02, 0.03]),
      jaw.local([0, 0.2, 0.03]),
      [0.22, 0.06],
      [0.16, 0.05],
      {
        bone: jaw,
        color: LAVA_ORANGE,
        group: "head",
      },
    ),
    1.8,
  );
  glow(
    b.rod(
      jaw.local([0, 0.04, 0.05]),
      jaw.local([0, 0.18, 0.05]),
      [0.06, 0.038],
      LAVA_WHITE,
      {
        bone: jaw,
        sides: 5,
        smooth: false,
        group: "head",
      },
    ),
    2.0,
  );

  // Golden chin-beard spike under the lower jaw
  b.spike(
    jaw.local([0, 0.22, -0.04]),
    jaw.dir([0, 0.7, -0.7]),
    0.16,
    0.052,
    GOLD_TRIM_PAINT,
    {
      bone: jaw,
      sides: 5,
      smooth: false,
      group: "head",
    },
  );

  // 6 upward-pointing lower jaw fangs
  for (const s of sides) {
    for (let f = 0; f < 3; f++) {
      const lx = s * (0.04 + f * 0.042);
      const ly = 0.21 - f * 0.05;
      b.spike(
        jaw.local([lx, ly, 0.03]),
        jaw.dir([0, 0.2, 1]),
        f === 0 ? 0.075 : 0.058,
        0.022,
        f === 0 ? GOLD_TRIM_PAINT : BASALT_DARK_PAINT,
        {
          bone: jaw,
          sides: 4,
          smooth: false,
          group: "head",
        },
      );
    }
  }

  // =========================================================================
  // 6. SEGMENTED VOLCANIC TAIL & BLAZING MAGMA MACE TIP (tail1..tail5)
  // =========================================================================
  const tailSweep = b.sweep(tail, [0.26, 0.21, 0.16, 0.12, 0.085, 0.05], {
    color: MAGMA_BODY_PAINT,
    sides: 6,
    smooth: false,
    group: "tail",
    name: "tailCore",
  });

  // Glowing dorsal and lateral magma veins along the tail
  for (const deg of [0, 120, 240]) {
    glow(
      b.sweep(tailSweep.line(deg, -0.003), 0.016, LAVA_ORANGE, {
        bone: tail,
        sides: 4,
        detail: 0.4,
        group: "tail",
      }),
      1.5,
    );
  }

  // Segmented basalt chevron plates and glowing ventral magma nodes along tail1..tail4
  b.along(
    tail,
    5,
    (pt) => {
      b.extrude(DORSAL_CHEVRON_OUTLINE, {
        at: offset(pt.at, pt.normal, 0.11),
        x: pt.binormal,
        y: pt.normal,
        thickness: 0.06,
        smoothing: 0,
        color: BASALT_ARMOR,
        bone: pt.bone,
        group: "tail",
      });
      b.rod(
        offset(pt.at, pt.binormal, -0.15),
        offset(pt.at, pt.binormal, 0.15),
        0.028,
        GOLD_TRIM_PAINT,
        {
          bone: pt.bone,
          sides: 5,
          smooth: false,
          group: "tail",
        },
      );
    },
    { from: 0.08, to: 0.84 },
  );

  // Blazing Pyro-Geo Tail Mace / Thagomizer at tail5
  const tailTipJoint = tail.joints[4];
  const tailEnd = tail.at(1);
  b.lathe(
    [
      [0.0, -0.08],
      [0.16, -0.04],
      [0.19, 0.06],
      [0.12, 0.16],
      [0.0, 0.18],
    ],
    {
      at: tailEnd.at,
      axis: tailEnd.tangent,
      segments: 6,
      smoothing: 0,
      color: GOLD_TRIM_PAINT,
      bone: tailTipJoint,
      group: "tail",
    },
  );
  glow(
    b.spike(
      offset(tailEnd.at, tailEnd.tangent, 0.06),
      tailEnd.tangent,
      0.28,
      0.11,
      LAVA_GOLD,
      {
        bone: tailTipJoint,
        sides: 4,
        smooth: false,
        group: "tail",
      },
    ),
    1.9,
  );

  // =========================================================================
  // 7. ELEMENTAL PYRO FLAME PLUME CARDS (self-lit rising magma wisps)
  // =========================================================================
  const flameFrames = [
    frame([0.72, 2.74, 0.04], [0.25, 1, -0.1]),
    frame([-0.72, 2.74, 0.04], [-0.25, 1, -0.1]),
    frame([0.34, 2.48, -0.38], [0.15, 1, -0.25]),
    frame([-0.34, 2.48, -0.38], [-0.15, 1, -0.25]),
    frame([0, 2.98, 0.16], [0, 1, -0.2]),
    frame([0, 0.94, -1.96], [0, 1, -0.3]),
  ];
  glow(
    b.cards(flameFrames, FLAME_WISP_TEX, {
      size: [0.18, 0.36],
      lean: 10,
      flow: [0, 0.4, -1],
      cross: true,
      vary: 0.2,
      rng: rng(77),
      color: "#ffffff",
      group: "flames",
    }),
    1.6,
  );

  // Ensure helper palette constants stay referenced cleanly
  void OBSIDIAN_FLAT;
  void BASALT_FLAT;
  void GOLD_FLAT;
  void GOLD_DEEP_FLAT;

  return b.root;
}

function lerpPoint(a: V3, b: V3, t: number): V3 {
  const va = vec(a);
  const vb = vec(b);
  return [
    va.x + (vb.x - va.x) * t,
    va.y + (vb.y - va.y) * t,
    va.z + (vb.z - va.z) * t,
  ];
}
