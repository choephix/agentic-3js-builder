import * as THREE from "three";
import { glow } from "../../../../kits/glow";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { bezier, catmull, polyline } from "../../../../src/path";
import { countershade, grain, mix, paint, scales, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Valkyrie-7 Cyborg Medic",
  description:
    "Overwatch-style support-hero cyborg medic with articulated cybernetic limbs, hard-light biotic wings, nanite reservoirs, and a caduceus resonance healing staff.",
  style: "Overwatch",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------
// Palette & Procedural Paints (Overwatch clean sci-fi colour blocking)
// ---------------------------------------------------------------------------

const FLAT_WHITE = "#f2f5fa";
const FLAT_SLATE = "#364152";
const FLAT_DARK = "#1c222d";
const FLAT_CARBON = "#262e3d";
const FLAT_GOLD = "#ebb02d";
const FLAT_BRASS = "#b8821c";
const FLAT_RED = "#e63946";
const FLAT_TEAL = "#1f9fb8";
const FLAT_SKIN_SYNTH = "#d8c6bc";

const GLOW_GOLD = "#ffc83b";
const GLOW_AMBER = "#ff9214";
const GLOW_CYAN = "#3bf0ff";
const GLOW_MINT = "#6bffd8";
const GLOW_RED = "#ff4252";

// Ceramic white hero armor with subtle warm zenith highlight and cool slate shadow
const ARMOR_WHITE = paint((p, n) => {
  const sun = Math.max(0, n.x * 0.25 + n.y * 0.78 + n.z * 0.56);
  const rim = smoothstep(0.65, 0.95, sun);
  const shade = smoothstep(-0.35, 0.25, n.y * 0.7 + n.z * 0.3);
  const base = mix("#b6c4d9", "#f4f7fc", shade);
  const heightTint = mix(base, "#ffffff", smoothstep(0.5, 1.75, p.y) * 0.25);
  return mix(heightTint, "#ffffff", rim * 0.35);
});

// Secondary cool silver-grey armor panelling
const ARMOR_SILVER = countershade("#d5dfed", "#7e8fa6", { level: -0.05, soft: 0.4 });

// Hex-weave carbon-fibre bionic undersuit & prosthetic muscle bundles
const CARBON_HEX = scales(
  ["#232a38", "#283040", "#1f2633"],
  "#121720",
  { size: 0.032, width: 0.18, seed: 11 },
);

// Brushed titanium gunmetal for mechanical joints, pistons, and weapon housing
const TITANIUM_GRAIN = grain("#525f75", "#323b4a", { size: 0.035, axis: "y", seed: 5 });

// Anodized Overwatch gold trim paint
const GOLD_TRIM = paint((_p, n) => {
  const l = n.x * 0.3 + n.y * 0.75 + n.z * 0.5;
  if (l > 0.55) return "#ffe07d";
  if (l > 0.0) return "#ebb02d";
  return "#9e6b12";
});

// Crimson triage accent paint with subtle vertical gradient
const MEDIC_CRIMSON = paint((p, n) => {
  const lit = smoothstep(-0.3, 0.5, n.y * 0.6 + n.z * 0.5);
  const c = mix("#9e1c28", "#e83848", lit);
  return mix(c, "#ff6b78", smoothstep(1.1, 1.6, p.y) * 0.2);
});

// ---------------------------------------------------------------------------
// SVG Textures & Decals (Visor HUD, Triage Emblem, Forearm Hard-Light Shield)
// ---------------------------------------------------------------------------

const VISOR_HUD_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 128">
    <rect width="256" height="128" rx="28" fill="#0d1b2a"/>
    <path d="M16 64 Q128 22 240 64 Q128 104 16 64 Z" fill="#133b54"/>
    <path d="M28 62 Q128 30 228 62 Q128 90 28 62 Z" fill="#2ce8ff"/>
    <path d="M54 58 Q128 38 202 58 Q128 74 54 58 Z" fill="#d4fcff"/>
    <!-- Biometric reticle & HUD ticks -->
    <circle cx="128" cy="60" r="18" fill="none" stroke="#ffffff" stroke-width="3.5"/>
    <path d="M128 34 V46 M128 74 V86 M102 60 H114 M142 60 H154" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M46 42 L68 48 M210 42 L188 48 M46 78 L68 72 M210 78 L188 72" stroke="#ffc83b" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const MEDIC_BADGE_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <circle cx="64" cy="64" r="56" fill="#f4f7fc" stroke="#ebb02d" stroke-width="8"/>
    <circle cx="64" cy="64" r="44" fill="#1c2533"/>
    <!-- Stylized medical cross + wings -->
    <path d="M52 26 H76 V52 H102 V76 H76 V102 H52 V76 H26 V52 H52 Z" fill="#e63946"/>
    <path d="M56 32 H72 V56 H96 V72 H72 V96 H56 V72 H32 V56 H56 Z" fill="#ff5c6a"/>
    <circle cx="64" cy="64" r="10" fill="#ffc83b"/>
  </svg>`,
  { size: 256 },
);

const HOLO_SHIELD_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <!-- Outer hex barrier frame -->
    <polygon points="128,10 232,68 232,188 128,246 24,188 24,68" fill="#12556b" fill-opacity="0.75" stroke="#3bf0ff" stroke-width="10"/>
    <polygon points="128,28 214,78 214,178 128,228 42,178 42,78" fill="none" stroke="#99f8ff" stroke-width="4" stroke-dasharray="18 10"/>
    <!-- Inner medical cross & ECG pulse line -->
    <path d="M112 64 H144 V112 H192 V144 H144 V192 H112 V144 H64 V112 H112 Z" fill="#ffc83b" fill-opacity="0.88"/>
    <path d="M46 128 H88 L102 96 L120 162 L138 84 L154 148 L166 128 H210" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  { size: 256 },
);

const WING_PLUME_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 192">
    <path d="M32 4 L56 42 L48 168 L32 188 L16 168 L8 42 Z" fill="#ffae19"/>
    <path d="M32 14 L46 46 L40 156 L32 176 L24 156 L18 46 Z" fill="#ffe17d"/>
    <path d="M32 24 L37 52 L35 142 L32 160 L29 142 L27 52 Z" fill="#ffffff"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "cyborgMedic", detail: 0.75, paintSize: 1024 });

  // =========================================================================
  // 1. SKELETON (Full humanoid rig + wings + skirt tassets + healing staff)
  // =========================================================================

  const hips = b.joint("hips", { at: [0, 0.96, 0], dir: [0, 1, 0], group: "pelvis", role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.98, -0.01],
      [0, 1.14, -0.02],
      [0, 1.30, -0.01],
      [0, 1.45, -0.01],
    ]),
    {
      parent: hips,
      names: ["spine1", "spine2", "chest"],
      group: "torso",
      role: "spine",
    },
  );
  const spine1 = spine.joints[0];
  const spine2 = spine.joints[1];
  const chest = spine.joints[2];

  const neck = b.joint("neck", {
    parent: chest,
    at: [0, 1.46, -0.01],
    dir: [0, 1, 0.08],
    group: "head",
    role: "neck",
  });

  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.56, 0.01],
    dir: [0, 0.04, 1],
    group: "head",
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.54, 0.03],
    dir: [0, -0.22, 1],
    group: "head",
    role: "jaw",
  });

  // Articulated hip armour tassets & coattails
  const tassetL = b.joint("tassetL", {
    parent: hips,
    at: [0.165, 0.95, 0.01],
    dir: [0.18, -1, 0.05],
    group: "pelvis",
    role: "hinge",
  });
  const tassetR = b.joint("tassetR", {
    parent: hips,
    at: [-0.165, 0.95, 0.01],
    dir: [-0.18, -1, 0.05],
    group: "pelvis",
    role: "hinge",
  });
  const coattailL = b.joint("coattailL", {
    parent: hips,
    at: [0.09, 0.92, -0.11],
    dir: [0.08, -1, -0.18],
    group: "pelvis",
    role: "tail",
  });
  const coattailR = b.joint("coattailR", {
    parent: hips,
    at: [-0.09, 0.92, -0.11],
    dir: [-0.08, -1, -0.18],
    group: "pelvis",
    role: "tail",
  });

  // Legs (all Left joints x > 0, all Right joints x < 0)
  const legChains = ([1, -1] as const).map((s) => {
    const side = s > 0 ? "L" : "R";
    const group = `leg${side}`;
    const chain = b.chain(
      `leg${side}`,
      polyline([
        [s * 0.115, 0.93, 0.0],
        [s * 0.135, 0.52, 0.04],
        [s * 0.145, 0.11, -0.02],
        [s * 0.15, 0.035, 0.08],
        [s * 0.15, 0.03, 0.19],
      ]),
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`, `toe${side}`],
        group,
        role: "leg",
        contact: [s * 0.15, 0, 0.05],
      },
    );
    return { s, side, group, chain };
  });

  // Arms & Articulated Cybernetic Digits (open heroic A-pose)
  const armData = ([1, -1] as const).map((s) => {
    const side = s > 0 ? "L" : "R";
    const group = `arm${side}`;
    const chain = b.chain(
      `arm${side}`,
      polyline([
        [s * 0.19, 1.41, -0.01],
        [s * 0.31, 1.17, 0.02],
        [s * 0.41, 0.95, 0.10],
        [s * 0.44, 0.86, 0.14],
      ]),
      {
        parent: chest,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
        group,
        role: "arm",
      },
    );
    const [shoulder, elbow, wrist, hand] = chain.joints;

    // 5 articulated cybernetic digits per hand
    const thumb = b.joint(`thumb${side}`, {
      parent: hand,
      at: [s * 0.415, 0.885, 0.165],
      dir: [s * 0.15, -0.55, 0.82],
      group,
      role: "digit",
    });
    const fingerSpecs = [
      { tag: "index", dz: 0.032, dy: -0.005, len: 0.062 },
      { tag: "middle", dz: 0.012, dy: -0.008, len: 0.068 },
      { tag: "ring", dz: -0.008, dy: -0.006, len: 0.062 },
      { tag: "pinky", dz: -0.026, dy: -0.002, len: 0.052 },
    ];
    const fingers = fingerSpecs.map((f) =>
      b.joint(`${f.tag}${side}`, {
        parent: hand,
        at: [s * 0.452, 0.855 + f.dy, 0.14 + f.dz],
        dir: [s * 0.22, -0.95, 0.18],
        group,
        role: "digit",
      }),
    );

    return { s, side, group, chain, shoulder, elbow, wrist, hand, thumb, fingers, fingerSpecs };
  });

  // Dorsal Hard-Light Stabilizer Wings (parented to chest)
  const wingData = ([1, -1] as const).map((s) => {
    const side = s > 0 ? "L" : "R";
    const group = `wing${side}`;
    const chain = b.chain(
      `wing${side}`,
      polyline([
        [s * 0.095, 1.37, -0.14],
        [s * 0.30, 1.56, -0.21],
        [s * 0.58, 1.72, -0.27],
        [s * 0.84, 1.81, -0.32],
      ]),
      {
        parent: chest,
        names: [`wingBase${side}`, `wingMid${side}`, `wingTip${side}`],
        group,
        role: "wing",
      },
    );
    return { s, side, group, chain };
  });

  // Caduceus Resonance Healing Staff Joints (parented to right hand `handR`, x = -0.44)
  const handR = armData[1].hand;
  const staffRoot = b.joint("staffRoot", {
    parent: handR,
    at: [-0.44, 0.86, 0.16],
    dir: [0, 1, 0],
    group: "staff",
    role: "hinge",
  });
  const staffHead = b.joint("staffHead", {
    parent: staffRoot,
    at: [-0.44, 1.50, 0.16],
    dir: [0, 1, 0],
    group: "staff",
    role: "hinge",
  });
  const staffSpinner = b.joint("staffSpinner", {
    parent: staffHead,
    at: [-0.44, 1.66, 0.16],
    dir: [0, 1, 0],
    group: "staff",
    role: "hinge",
  });

  // =========================================================================
  // 2. TORSO, PELVIS & BIOTIC CORE GEOMETRY
  // =========================================================================

  // Bionic core spine column & abdominal hex-weave undersuit
  b.loft(
    [
      { at: [0, 0.90, 0.0], w: 0.25, h: 0.18 },
      { at: [0, 1.03, 0.0], w: 0.21, h: 0.16 },
      { at: [0, 1.18, -0.01], w: 0.24, h: 0.18 },
      { at: [0, 1.34, 0.0], w: 0.33, h: 0.22 },
      { at: [0, 1.45, -0.01], w: 0.22, h: 0.16 },
    ],
    { bone: [hips, spine], color: CARBON_HEX, sides: 10, group: "torso", name: "torsoUndersuit" },
  );

  // Sculpted Ceramic Chest Cuirass (Overwatch heroic upper torso shell)
  b.loft(
    [
      { at: [0, 1.14, 0.01], w: 0.23, h: 0.17 },
      { at: [0, 1.24, 0.02], w: 0.30, h: 0.22 },
      { at: [0, 1.35, 0.02], w: 0.36, h: 0.24 },
      { at: [0, 1.43, 0.0], w: 0.28, h: 0.18 },
    ],
    { bone: [spine2, chest], color: ARMOR_WHITE, sides: 10, group: "torso", name: "chestCuirass" },
  );

  // High Tech Gorget / Collar Ring
  b.lathe(
    [
      [0.075, 0.0],
      [0.135, 0.0],
      [0.145, 0.045],
      [0.115, 0.085],
      [0.075, 0.085],
    ],
    {
      at: [0, 1.41, 0.0],
      bone: chest,
      segments: 10,
      color: ARMOR_WHITE,
      group: "torso",
      name: "collarGorget",
    },
  );
  b.lathe(
    [
      [0.11, 0.07],
      [0.148, 0.04],
      [0.148, 0.06],
      [0.112, 0.09],
    ],
    {
      at: [0, 1.41, 0.0],
      bone: chest,
      segments: 10,
      color: GOLD_TRIM,
      group: "torso",
      name: "collarGoldRim",
    },
  );

  // Sternum Biotic Reactor Housing & Glowing Golden Core
  b.frustumBox([0, 1.21, 0.09], [0, 1.38, 0.135], [0.14, 0.05], [0.18, 0.06], {
    bone: chest,
    color: FLAT_DARK,
    group: "torso",
    name: "sternumBezel",
  });
  b.part(new THREE.CylinderGeometry(0.054, 0.062, 0.035, 8), GOLD_TRIM, {
    bone: chest,
    at: [0, 1.31, 0.122],
    dir: [0, 0.15, 1],
    group: "torso",
    name: "reactorRing",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.042, 1), GLOW_GOLD, {
      bone: chest,
      at: [0, 1.31, 0.134],
      scale: [1, 1.15, 0.65],
      group: "torso",
      name: "reactorCoreGlow",
    }),
    1.5,
  );

  // Chest Triage Wing Chevrons & Rib Vent Struts
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.frustumBox(
      [s * 0.065, 1.31, 0.125],
      [s * 0.155, 1.36, 0.085],
      [0.032, 0.025],
      [0.045, 0.028],
      {
        bone: chest,
        color: MEDIC_CRIMSON,
        group: "torso",
        name: `chestChevron${side}`,
      },
    );
    // Gold accent rib bar below chest plate
    b.rod([s * 0.045, 1.22, 0.105], [s * 0.125, 1.25, 0.075], 0.012, GOLD_TRIM, {
      bone: spine2,
      sides: 5,
      group: "torso",
      name: `chestGoldStrut${side}`,
    });
    // Glowing cyan abdominal telemetry strips
    glow(
      b.rod([s * 0.055, 1.04, 0.078], [s * 0.072, 1.17, 0.088], 0.008, GLOW_CYAN, {
        bone: spine1,
        sides: 5,
        group: "torso",
        name: `abTelemetryGlow${side}`,
      }),
      1.3,
    );
    // Bionic oblique hydraulic pistons connecting pelvis to ribcage
    b.rod([s * 0.095, 0.97, 0.03], [s * 0.11, 1.16, 0.03], [0.016, 0.012], TITANIUM_GRAIN, {
      bone: spine1,
      sides: 6,
      group: "torso",
      name: `obliquePiston${side}`,
    });
  }

  // Exposed Cybernetic Vertebrae & Glowing Dorsal Spine Nodes
  for (let i = 0; i < 5; i++) {
    const y = 1.02 + i * 0.075;
    const z = -0.092 - Math.sin((i / 4) * Math.PI) * 0.018;
    const ownerBone = i < 2 ? spine1 : i < 4 ? spine2 : chest;
    b.part(new THREE.BoxGeometry(0.055, 0.042, 0.045), TITANIUM_GRAIN, {
      bone: ownerBone,
      at: [0, y, z],
      group: "torso",
      name: `vertebra${i + 1}`,
    });
    glow(
      b.part(new THREE.BoxGeometry(0.028, 0.016, 0.025), GLOW_CYAN, {
        bone: ownerBone,
        at: [0, y, z - 0.018],
        group: "torso",
        name: `vertebraGlow${i + 1}`,
      }),
      1.3,
    );
  }

  // Pelvis Codpiece, Utility Belt & Medical Nanite Canisters
  b.frustumBox([0, 0.86, 0.0], [0, 0.99, 0.01], [0.22, 0.16], [0.27, 0.19], {
    bone: hips,
    color: ARMOR_WHITE,
    group: "pelvis",
    name: "pelvisCarapace",
  });
  b.frustumBox([0, 0.85, 0.07], [0, 0.98, 0.095], [0.09, 0.06], [0.13, 0.06], {
    bone: hips,
    color: FLAT_SLATE,
    group: "pelvis",
    name: "codpieceFront",
  });
  // Belt buckle with glowing amber core
  b.part(new THREE.BoxGeometry(0.085, 0.055, 0.04), GOLD_TRIM, {
    bone: hips,
    at: [0, 0.975, 0.102],
    group: "pelvis",
    name: "beltBuckle",
  });
  glow(
    b.part(new THREE.BoxGeometry(0.045, 0.024, 0.025), GLOW_GOLD, {
      bone: hips,
      at: [0, 0.975, 0.114],
      group: "pelvis",
      name: "beltBuckleGlow",
    }),
    1.3,
  );

  // Waist Nanite Canisters & Trauma Pouches on Left/Right Hips
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    // Medical pouch on front-side belt
    b.part(new THREE.BoxGeometry(0.055, 0.075, 0.065), MEDIC_CRIMSON, {
      bone: hips,
      at: [s * 0.115, 0.97, 0.085],
      rotation: [0, s * 18, 0],
      group: "pelvis",
      name: `traumaPouch${side}`,
    });
    b.part(new THREE.BoxGeometry(0.058, 0.02, 0.068), FLAT_WHITE, {
      bone: hips,
      at: [s * 0.115, 0.995, 0.085],
      rotation: [0, s * 18, 0],
      group: "pelvis",
      name: `traumaPouchLid${side}`,
    });

    // Rear-hip glowing golden biotic nanite cylinder vial
    const vialX = s * 0.135;
    b.rod([vialX, 0.93, -0.085], [vialX, 1.04, -0.065], 0.024, FLAT_DARK, {
      bone: hips,
      sides: 6,
      group: "pelvis",
      name: `naniteVialCaps${side}`,
    });
    glow(
      b.rod([vialX, 0.945, -0.082], [vialX, 1.025, -0.068], 0.021, s > 0 ? GLOW_GOLD : GLOW_MINT, {
        bone: hips,
        sides: 6,
        group: "pelvis",
        name: `naniteVialFluid${side}`,
      }),
      1.4,
    );
  }

  // Articulated Hip Tasset Plates & Rear Battle-Coat Panels
  const tassetOutline: OutlinePoint[] = [
    [-0.065, 0.02, "sharp"],
    [0.065, 0.02, "sharp"],
    [0.082, -0.14],
    [0.045, -0.29, "sharp"],
    [-0.035, -0.26],
    [-0.075, -0.12],
  ];
  for (const [s, joint, side] of [
    [1, tassetL, "L"],
    [-1, tassetR, "R"],
  ] as const) {
    const plate = b.extrude(tassetOutline, {
      bone: joint,
      at: joint.at,
      x: [0, 0, 1],
      y: [-s * 0.18, 1, 0],
      thickness: 0.024,
      smoothing: 1,
      color: ARMOR_WHITE,
      group: "pelvis",
      name: `tassetPlate${side}`,
    });
    // Gold trim bar & crimson medical stripe on tasset
    b.rod(
      plate.local([0.04, -0.02, s * 0.014]),
      plate.local([0.03, -0.24, s * 0.014]),
      0.011,
      GOLD_TRIM,
      { bone: joint, sides: 5, group: "pelvis", name: `tassetGoldTrim${side}` },
    );
    b.part(new THREE.PlaneGeometry(0.065, 0.065), "#ffffff", {
      bone: joint,
      at: plate.local([0.0, -0.11, s * 0.015]),
      dir: [s * 0.98, 0.18, 0],
      axis: "z",
      texture: MEDIC_BADGE_TEX,
      group: "pelvis",
      name: `tassetBadge${side}`,
    });
  }

  // Rear split coattails (classic Overwatch medic silhouette)
  const coattailOutline: OutlinePoint[] = [
    [-0.055, 0.02, "sharp"],
    [0.055, 0.02, "sharp"],
    [0.085, -0.22],
    [0.055, -0.44, "sharp"],
    [-0.02, -0.40, "sharp"],
    [-0.065, -0.18],
  ];
  for (const [s, joint, side] of [
    [1, coattailL, "L"],
    [-1, coattailR, "R"],
  ] as const) {
    b.extrude(coattailOutline, {
      bone: joint,
      at: joint.at,
      x: [s, 0, 0],
      y: [0, 0.96, -0.25],
      thickness: 0.02,
      smoothing: 1,
      color: ARMOR_WHITE,
      group: "pelvis",
      name: `coattailBanner${side}`,
    });
    b.rod(
      [s * 0.125, 0.89, -0.12],
      [s * 0.145, 0.54, -0.20],
      0.011,
      GOLD_TRIM,
      { bone: joint, sides: 5, group: "pelvis", name: `coattailGoldEdge${side}` },
    );
  }

  // =========================================================================
  // 3. CYBERNETIC HEAD, VALKYRIE HELMET, OPTIC VISOR & HALO CROWN
  // =========================================================================

  // Bionic neck column with twin sternocleidomastoid cables
  b.rod([0, 1.44, -0.01], [0, 1.57, 0.01], [0.052, 0.046], CARBON_HEX, {
    bone: neck,
    sides: 8,
    group: "head",
    name: "neckColumn",
  });
  for (const s of [1, -1] as const) {
    b.rod([s * 0.038, 1.44, 0.015], [s * 0.028, 1.56, 0.035], 0.011, TITANIUM_GRAIN, {
      bone: neck,
      sides: 5,
      group: "head",
      name: `neckTendon${s > 0 ? "L" : "R"}`,
    });
  }

  // Cranium & Synthetic Face Mask
  b.loft(
    [
      { at: [0, 1.55, -0.01], w: 0.135, h: 0.145 },
      { at: [0, 1.63, 0.01], w: 0.165, h: 0.185 },
      { at: [0, 1.71, -0.01], w: 0.155, h: 0.185 },
      { at: [0, 1.76, -0.03], w: 0.10, h: 0.13 },
    ],
    { bone: head, color: ARMOR_WHITE, sides: 10, group: "head", name: "helmetCranium" },
  );

  // Synthetic lower face cheek & bridge under visor
  b.part(new THREE.SphereGeometry(0.068, 8, 6), FLAT_SKIN_SYNTH, {
    bone: head,
    at: [0, 1.605, 0.035],
    scale: [0.95, 1.05, 1.08],
    group: "head",
    name: "synthFacePlate",
  });

  // Articulated Cybernetic Jaw & Respirator Chin Guard (`jaw` bone)
  b.frustumBox([0, 1.535, 0.02], [0, 1.565, 0.098], [0.095, 0.048], [0.062, 0.042], {
    bone: jaw,
    color: ARMOR_SILVER,
    group: "head",
    name: "cyberJaw",
  });
  b.part(new THREE.BoxGeometry(0.048, 0.024, 0.022), FLAT_DARK, {
    bone: jaw,
    at: [0, 1.552, 0.102],
    group: "head",
    name: "respiratorGrille",
  });
  glow(
    b.part(new THREE.BoxGeometry(0.032, 0.01, 0.024), GLOW_CYAN, {
      bone: jaw,
      at: [0, 1.552, 0.104],
      group: "head",
      name: "respiratorLed",
    }),
    1.2,
  );

  // Curved Glowing Optic Visor Shield + HUD Texture
  b.frustumBox([0, 1.635, 0.035], [0, 1.645, 0.112], [0.158, 0.062], [0.115, 0.052], {
    bone: head,
    color: FLAT_DARK,
    group: "head",
    name: "visorHousing",
  });
  glow(
    b.part(new THREE.PlaneGeometry(0.125, 0.052), "#ffffff", {
      bone: head,
      at: [0, 1.642, 0.115],
      dir: [0, 0.05, 1],
      axis: "z",
      texture: VISOR_HUD_TEX,
      group: "head",
      name: "visorHudScreen",
    }),
    1.35,
  );

  // Forehead Valkyrie Diadem Crest (White + Gold + Medical Ruby Gem)
  b.extrude(
    [
      [0, -0.02, "sharp"],
      [0.11, 0.02],
      [0.14, 0.08, "sharp"],
      [0.02, 0.095],
      [-0.05, 0.04],
    ],
    {
      bone: head,
      at: [0, 1.68, 0.095],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.028,
      smoothing: 1,
      color: GOLD_TRIM,
      group: "head",
      name: "helmetCenterCrest",
    },
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.02, 0), GLOW_CYAN, {
      bone: head,
      at: [0, 1.69, 0.105],
      scale: [0.8, 1.3, 0.6],
      group: "head",
      name: "foreheadSensorGem",
    }),
    1.4,
  );

  // Swept-back Valkyrie Winglet Ears & Comms Pods on Helmet Sides
  const earWingOutline: OutlinePoint[] = [
    [0.0, -0.02, "sharp"],
    [0.13, 0.03],
    [0.20, 0.13, "sharp"],
    [0.09, 0.12],
    [-0.02, 0.04],
  ];
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    // Ear comms disk
    b.part(new THREE.CylinderGeometry(0.038, 0.042, 0.028, 8), TITANIUM_GRAIN, {
      bone: head,
      at: [s * 0.082, 1.63, 0.0],
      dir: [s, 0, 0],
      group: "head",
      name: `earCommsHub${side}`,
    });
    // Swept helmet winglet fin
    b.extrude(earWingOutline, {
      bone: head,
      at: [s * 0.086, 1.63, 0.01],
      x: [s * 0.18, 0, -1],
      y: [s * 0.25, 1, 0],
      thickness: 0.018,
      smoothing: 1,
      color: ARMOR_WHITE,
      group: "head",
      name: `helmetWinglet${side}`,
    });
    glow(
      b.rod([s * 0.095, 1.64, -0.01], [s * 0.125, 1.73, -0.14], 0.008, GLOW_GOLD, {
        bone: head,
        sides: 5,
        group: "head",
        name: `helmetWingletGlow${side}`,
      }),
      1.4,
    );
    // Twin neural-link struts connecting occipital skull to the golden Halo Crown
    b.rod([s * 0.042, 1.68, -0.075], [s * 0.065, 1.76, -0.145], 0.011, GOLD_TRIM, {
      bone: head,
      sides: 5,
      group: "head",
      name: `haloMountStrut${side}`,
    });
  }

  // Iconic Overwatch-Style Hard-Light Neural Halo Crown (mounted on the struts behind head)
  const haloPath = catmull(
    [
      [0, 1.89, -0.175],
      [0.125, 1.82, -0.16],
      [0.095, 1.72, -0.135],
      [0, 1.69, -0.125],
      [-0.095, 1.72, -0.135],
      [-0.125, 1.82, -0.16],
    ],
    { closed: true },
  );
  glow(
    b.sweep(haloPath, 0.013, {
      bone: head,
      color: GLOW_GOLD,
      section: { ngon: 6 },
      group: "head",
      name: "neuralHaloRing",
    }),
    1.6,
  );
  // Top halo apex fin
  glow(
    b.spike([0, 1.89, -0.175], [0, 0.9, -0.35], 0.065, 0.018, GLOW_GOLD, {
      bone: head,
      sides: 5,
      group: "head",
      name: "neuralHaloApex",
    }),
    1.6,
  );

  // =========================================================================
  // 4. DORSAL BIOTIC JUMP-PACK & ANGELIC HARD-LIGHT STABILIZER WINGS
  // =========================================================================

  // Central Dorsal Jump-Pack Carapace & Twin Biotic Reservoir Tanks
  b.frustumBox([0, 1.18, -0.08], [0, 1.44, -0.18], [0.22, 0.14], [0.28, 0.18], {
    bone: chest,
    color: ARMOR_WHITE,
    group: "torso",
    name: "jumpPackHousing",
  });
  b.frustumBox([0, 1.21, -0.17], [0, 1.41, -0.22], [0.12, 0.08], [0.16, 0.10], {
    bone: chest,
    color: TITANIUM_GRAIN,
    group: "torso",
    name: "jumpPackSpineCore",
  });
  glow(
    b.rod([0, 1.23, -0.222], [0, 1.39, -0.232], 0.02, GLOW_GOLD, {
      bone: chest,
      sides: 6,
      group: "torso",
      name: "jumpPackCoreGauge",
    }),
    1.5,
  );

  // Twin Angled Thruster Nozzles & Wing Articulation Hubs
  for (const { s, side, group, chain } of wingData) {
    const [wingBase, wingMid, wingTip] = chain.joints;

    // Rotary shoulder wing socket on jump-pack
    b.part(new THREE.CylinderGeometry(0.052, 0.058, 0.065, 8), GOLD_TRIM, {
      bone: wingBase,
      at: [s * 0.095, 1.37, -0.14],
      dir: [0, 0, 1],
      group,
      name: `wingSocketHub${side}`,
    });

    // Lower jump-pack thruster nozzle under wing root
    b.rod([s * 0.085, 1.22, -0.17], [s * 0.115, 1.12, -0.22], [0.038, 0.048], TITANIUM_GRAIN, {
      bone: chest,
      sides: 8,
      group: "torso",
      name: `jumpThrusterBell${side}`,
    });
    glow(
      b.part(new THREE.CylinderGeometry(0.036, 0.024, 0.025, 8), GLOW_CYAN, {
        bone: chest,
        at: [s * 0.115, 1.12, -0.22],
        dir: [s * 0.25, -0.85, -0.45],
        group: "torso",
        name: `jumpThrusterGlow${side}`,
      }),
      1.5,
    );

    // Swept Mechanical Wing Leading-Edge Spar along the 3 wing bones
    b.sweep(chain, [0.038, 0.032, 0.024, 0.012], {
      color: ARMOR_WHITE,
      section: { ngon: 6 },
      caps: { start: "round", end: "point" },
      group,
      name: `wingMainSpar${side}`,
    });

    // Gold Trim Crest along top edge of wing spar
    b.sweep(
      catmull([
        [s * 0.10, 1.395, -0.135],
        [s * 0.30, 1.59, -0.205],
        [s * 0.58, 1.75, -0.265],
        [s * 0.84, 1.83, -0.315],
      ]),
      [0.018, 0.008],
      {
        bone: chain,
        color: GOLD_TRIM,
        section: { ngon: 6 },
        caps: { start: "flat", end: "point" },
        group,
        name: `wingGoldCrest${side}`,
      },
    );

    // Mid-wing mechanical hinge knuckle with cyan status node
    b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.042, 8), TITANIUM_GRAIN, {
      bone: wingMid,
      at: wingMid.at,
      dir: [0, 0, 1],
      group,
      name: `wingElbowHub${side}`,
    });
    glow(
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.046, 6), GLOW_CYAN, {
        bone: wingMid,
        at: wingMid.at,
        dir: [0, 0, 1],
        group,
        name: `wingElbowLed${side}`,
      }),
      1.3,
    );

    // 6 Tiered Hard-Light Energy Feather Blades fanning down from the wing spar
    const bladeOutline: OutlinePoint[] = [
      [0.0, -0.022, "sharp"],
      [0.05, -0.030],
      [0.36, -0.018],
      [0.46, 0.0, "sharp"],
      [0.34, 0.020],
      [0.04, 0.024],
    ];
    const bladeConfigs = [
      { bone: wingBase, root: [s * 0.16, 1.43, -0.165], dir: [s * 0.25, -0.92, -0.22], scale: 0.68 },
      { bone: wingBase, root: [s * 0.24, 1.50, -0.19], dir: [s * 0.32, -0.88, -0.24], scale: 0.82 },
      { bone: wingMid, root: [s * 0.35, 1.59, -0.22], dir: [s * 0.40, -0.84, -0.26], scale: 0.96 },
      { bone: wingMid, root: [s * 0.47, 1.66, -0.245], dir: [s * 0.48, -0.78, -0.28], scale: 1.08 },
      { bone: wingTip, root: [s * 0.60, 1.72, -0.275], dir: [s * 0.58, -0.70, -0.30], scale: 1.15 },
      { bone: wingTip, root: [s * 0.73, 1.77, -0.30], dir: [s * 0.68, -0.58, -0.32], scale: 0.95 },
    ];

    bladeConfigs.forEach((cfg, idx) => {
      // Dark emitter socket on underside of wing spar
      b.rod(
        cfg.root,
        [
          cfg.root[0] + cfg.dir[0] * 0.065,
          cfg.root[1] + cfg.dir[1] * 0.065,
          cfg.root[2] + cfg.dir[2] * 0.065,
        ],
        [0.018, 0.013],
        FLAT_DARK,
        { bone: cfg.bone, sides: 5, group, name: `wingBladeSocket${side}${idx + 1}` },
      );

      // Glowing golden-amber hard-light blade
      const scaledOutline: OutlinePoint[] = bladeOutline.map((pt) =>
        pt.length === 3
          ? [pt[0] * cfg.scale, pt[1] * cfg.scale, "sharp"]
          : [pt[0] * cfg.scale, pt[1] * cfg.scale],
      );
      glow(
        b.extrude(scaledOutline, {
          bone: cfg.bone,
          at: cfg.root,
          x: cfg.dir,
          y: [s * 0.75, 0.45, -0.15],
          thickness: [0.014, 0.004],
          smoothing: 1,
          color: idx % 2 === 0 ? GLOW_GOLD : GLOW_AMBER,
          group,
          name: `wingHardLightBlade${side}${idx + 1}`,
        }),
        1.5,
      );
    });

    // Secondary glowing light-plume feather cards between the primary blades
    const plumeFrames = bladeConfigs.slice(0, 5).map((cfg) =>
      frame(
        [cfg.root[0], cfg.root[1] - 0.02, cfg.root[2] - 0.01],
        cfg.dir,
      ),
    );
    glow(
      b.cards(plumeFrames, WING_PLUME_TEX, {
        size: [0.065, 0.24],
        lean: 8,
        flow: [s * 0.8, 0.2, -0.4],
        bone: wingMid,
        group,
        name: `wingPlumeCards${side}`,
      }),
      1.3,
    );
  }

  // =========================================================================
  // 5. CYBERNETIC PROSTHETIC ARMS, PAULDRONS, FOREARM SHIELD & HANDS
  // =========================================================================

  for (const { s, side, group, chain, shoulder, elbow, wrist, hand, thumb, fingers, fingerSpecs } of armData) {
    // Underlying Bionic Arm Tube (carbon-hex upper arm + titanium forearm)
    b.sweep(chain, [0.048, 0.042, 0.038, 0.030], {
      bands: [
        [0.48, CARBON_HEX],
        [1.0, TITANIUM_GRAIN],
      ],
      sides: 8,
      group,
      name: `bionicArmTube${side}`,
    });

    // Heroic Overwatch Sculpted Shoulder Pauldron
    b.loft(
      [
        { at: [s * 0.16, 1.44, 0.0], w: 0.12, h: 0.11 },
        { at: [s * 0.225, 1.42, 0.0], w: 0.155, h: 0.14 },
        { at: [s * 0.265, 1.33, 0.005], w: 0.135, h: 0.115 },
        { at: [s * 0.275, 1.26, 0.01], w: 0.085, h: 0.075 },
      ],
      { bone: shoulder, color: ARMOR_WHITE, sides: 8, group, name: `shoulderPauldron${side}` },
    );

    // Gold Pauldron Rim & Crimson Triage Cross Emblem Decal
    b.rod([s * 0.17, 1.465, 0.02], [s * 0.265, 1.34, 0.035], 0.015, GOLD_TRIM, {
      bone: shoulder,
      sides: 6,
      group,
      name: `pauldronGoldTrim${side}`,
    });
    b.part(new THREE.PlaneGeometry(0.072, 0.072), "#ffffff", {
      bone: shoulder,
      at: [s * 0.262, 1.365, 0.015],
      dir: [s * 0.94, 0.30, 0.12],
      axis: "z",
      texture: MEDIC_BADGE_TEX,
      group,
      name: `pauldronMedicBadge${side}`,
    });

    // Mechanical Elbow Rotary Servo & Dual Forearm Cuff Shell
    b.part(new THREE.CylinderGeometry(0.044, 0.044, 0.056, 8), TITANIUM_GRAIN, {
      bone: elbow,
      at: elbow.at,
      dir: [0, 0, 1],
      group,
      name: `elbowServo${side}`,
    });
    glow(
      b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.06, 6), GLOW_CYAN, {
        bone: elbow,
        at: elbow.at,
        dir: [0, 0, 1],
        group,
        name: `elbowServoLed${side}`,
      }),
      1.3,
    );

    // Sculpted White Ceramic Forearm Vambrace
    b.frustumBox(
      [s * 0.325, 1.13, 0.035],
      [s * 0.40, 0.97, 0.092],
      [0.095, 0.092],
      [0.078, 0.076],
      {
        bone: elbow,
        color: ARMOR_WHITE,
        group,
        name: `forearmVambrace${side}`,
      },
    );
    // Gold wrist cuff ring
    b.rod([s * 0.395, 0.98, 0.088], [s * 0.415, 0.94, 0.105], 0.044, GOLD_TRIM, {
      bone: wrist,
      sides: 8,
      group,
      name: `wristGoldCuff${side}`,
    });

    // Left Arm Special Equipment: Deployable Hard-Light Triage Barrier & Biometric Scanner
    if (s > 0) {
      b.frustumBox([0.39, 1.07, 0.045], [0.435, 0.98, 0.095], [0.045, 0.055], [0.04, 0.048], {
        bone: elbow,
        color: GOLD_TRIM,
        group,
        name: "shieldProjectorPodL",
      });
      glow(
        b.part(new THREE.CylinderGeometry(0.022, 0.026, 0.024, 6), GLOW_CYAN, {
          bone: elbow,
          at: [0.432, 1.025, 0.082],
          dir: [0.88, -0.35, 0.32],
          group,
          name: "shieldProjectorLensL",
        }),
        1.5,
      );
      // Glowing Hexagonal Hard-Light Medical Shield Plane mounted off the projector
      glow(
        b.part(new THREE.PlaneGeometry(0.24, 0.24), "#ffffff", {
          bone: elbow,
          at: [0.455, 1.02, 0.095],
          dir: [0.88, -0.35, 0.32],
          axis: "z",
          texture: HOLO_SHIELD_TEX,
          group,
          name: "holoTriageShieldL",
        }),
        1.35,
      );
    } else {
      // Right Arm Special Equipment: Twin Biotic Feed Injector Tubes & Power Coupling to Staff
      glow(
        b.rod([-0.365, 1.11, 0.06], [-0.415, 0.99, 0.11], 0.013, GLOW_GOLD, {
          bone: elbow,
          sides: 6,
          group,
          name: "bioticInjectorRailR",
        }),
        1.4,
      );
      // Magnetic Palm Clamp bridging right hand directly into the Healing Staff
      b.rod([-0.425, 0.88, 0.14], [-0.445, 0.88, 0.165], 0.026, GOLD_TRIM, {
        bone: hand,
        sides: 6,
        group,
        name: "staffPalmCouplerR",
      });
    }

    // Cybernetic Hand Carapace & 5 Articulated Fingers
    b.frustumBox(
      [s * 0.415, 0.94, 0.105],
      [s * 0.448, 0.855, 0.142],
      [0.044, 0.068],
      [0.038, 0.062],
      {
        bone: hand,
        color: ARMOR_WHITE,
        group,
        name: `handCarapace${side}`,
      },
    );

    // Thumb geometry
    b.rod(
      thumb.at,
      [s * 0.422, 0.838, 0.212],
      [0.013, 0.009],
      TITANIUM_GRAIN,
      { bone: thumb, sides: 5, group, name: `thumbDigit${side}` },
    );

    // 4 Fingers geometry (crisp 5-sided mechanical phalanges)
    fingers.forEach((fJoint, idx) => {
      const spec = fingerSpecs[idx];
      const tipPos: [number, number, number] = s > 0
        ? [s * (0.452 + 0.015), 0.855 + spec.dy - spec.len, 0.14 + spec.dz + 0.012]
        : [s * 0.435, 0.855 + spec.dy - spec.len * 0.65, 0.165 + spec.dz * 0.6];
      b.rod(fJoint.at, tipPos, [0.011, 0.008], TITANIUM_GRAIN, {
        bone: fJoint,
        sides: 5,
        group,
        name: `${spec.tag}Digit${side}`,
      });
    });
  }

  // =========================================================================
  // 6. BIONIC PROSTHETIC LEGS, SHOCK-ABSORBER GREAVES & JUMP BOOTS (y = 0)
  // =========================================================================

  for (const { s, side, group, chain } of legChains) {
    const [hipJ, kneeJ, ankleJ, toeJ] = chain.joints;

    // Core Bionic Leg Tube (carbon thigh + titanium shin)
    b.sweep(chain, [0.072, 0.056, 0.045, 0.040, 0.032], {
      bands: [
        [0.45, CARBON_HEX],
        [1.0, TITANIUM_GRAIN],
      ],
      sides: 8,
      group,
      name: `bionicLegCore${side}`,
    });

    // Sculpted Ceramic Thigh Cuirass with Crimson & Gold Trim
    b.loft(
      [
        { at: [s * 0.12, 0.89, 0.0], w: 0.155, h: 0.165 },
        { at: [s * 0.13, 0.73, 0.02], w: 0.145, h: 0.155 },
        { at: [s * 0.135, 0.56, 0.035], w: 0.115, h: 0.125 },
      ],
      { bone: hipJ, color: ARMOR_WHITE, sides: 8, group, name: `thighArmor${side}` },
    );
    b.rod([s * 0.195, 0.85, 0.01], [s * 0.188, 0.59, 0.035], 0.013, MEDIC_CRIMSON, {
      bone: hipJ,
      sides: 5,
      group,
      name: `thighStripe${side}`,
    });

    // Articulated Knee Guard & Rotary Servo Drum
    b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.075, 8), TITANIUM_GRAIN, {
      bone: kneeJ,
      at: [s * 0.135, 0.52, 0.04],
      dir: [1, 0, 0],
      group,
      name: `kneeServoDrum${side}`,
    });
    b.frustumBox(
      [s * 0.135, 0.46, 0.085],
      [s * 0.135, 0.58, 0.095],
      [0.078, 0.048],
      [0.092, 0.055],
      {
        bone: kneeJ,
        color: ARMOR_WHITE,
        group,
        name: `kneeCapShield${side}`,
      },
    );
    glow(
      b.part(new THREE.BoxGeometry(0.045, 0.018, 0.025), GLOW_CYAN, {
        bone: kneeJ,
        at: [s * 0.135, 0.52, 0.115],
        group,
        name: `kneeTelemetryGlow${side}`,
      }),
      1.3,
    );

    // Aerodynamic Overwatch Shin Greave & Rear Hydraulic Calf Strut
    b.loft(
      [
        { at: [s * 0.138, 0.47, 0.035], w: 0.115, h: 0.13 },
        { at: [s * 0.142, 0.30, 0.015], w: 0.105, h: 0.125 },
        { at: [s * 0.145, 0.13, -0.01], w: 0.088, h: 0.10 },
      ],
      { bone: kneeJ, color: ARMOR_WHITE, sides: 8, group, name: `shinGreave${side}` },
    );
    // Gold front shin crest
    b.rod([s * 0.14, 0.45, 0.095], [s * 0.145, 0.14, 0.042], 0.014, GOLD_TRIM, {
      bone: kneeJ,
      sides: 5,
      group,
      name: `shinGoldCrest${side}`,
    });
    // Rear calf shock-absorber hydraulic cylinder
    b.rod([s * 0.14, 0.46, -0.04], [s * 0.145, 0.11, -0.065], [0.022, 0.016], GOLD_TRIM, {
      bone: kneeJ,
      sides: 6,
      group,
      name: `calfHydraulicPiston${side}`,
    });
    // Glowing cyan jump-jet vent on outer calf
    glow(
      b.rod([s * 0.195, 0.36, 0.01], [s * 0.192, 0.22, -0.01], 0.010, GLOW_CYAN, {
        bone: kneeJ,
        sides: 5,
        group,
        name: `calfVentGlow${side}`,
      }),
      1.3,
    );

    // Planted Cybernetic Boot & Shock-Absorber Heel on exact y = 0.000
    // Vertical frustumBoxes keep the bottom face strictly flat at y = 0.000!
    b.frustumBox(
      [s * 0.148, 0.0, -0.035],
      [s * 0.148, 0.105, -0.025],
      [0.092, 0.105],
      [0.084, 0.092],
      {
        bone: ankleJ,
        up: [0, 0, 1],
        color: TITANIUM_GRAIN,
        group,
        name: `bootHeelPylon${side}`,
      },
    );
    b.frustumBox(
      [s * 0.15, 0.0, 0.115],
      [s * 0.15, 0.068, 0.095],
      [0.104, 0.175],
      [0.088, 0.145],
      {
        bone: toeJ,
        up: [0, 0, 1],
        color: ARMOR_WHITE,
        group,
        name: `bootForefootShell${side}`,
      },
    );
    // Gold toe-cap bumper
    b.frustumBox(
      [s * 0.15, 0.004, 0.185],
      [s * 0.15, 0.048, 0.175],
      [0.086, 0.048],
      [0.072, 0.042],
      {
        bone: toeJ,
        up: [0, 0, 1],
        color: GOLD_TRIM,
        group,
        name: `bootToeCap${side}`,
      },
    );
    // Ankle malleolus armor disk
    b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.096, 8), GOLD_TRIM, {
      bone: ankleJ,
      at: [s * 0.145, 0.11, -0.02],
      dir: [1, 0, 0],
      group,
      name: `anklePivotBolt${side}`,
    });
  }

  // =========================================================================
  // 7. CADUCEUS RESONANCE HEALING STAFF (Overwatch Hero Support Weapon)
  // =========================================================================

  const sx = -0.44;
  const sz = 0.16;

  // Main Carbon-Titanium Staff Shaft (from y = 0.02 up to y = 1.50)
  b.rod([sx, 0.02, sz], [sx, 1.50, sz], 0.020, TITANIUM_GRAIN, {
    bone: staffRoot,
    sides: 8,
    group: "staff",
    name: "staffMainShaft",
  });

  // Ground-contact Rubber/Gold Shock-Absorber Ferrule touching y = 0.000
  b.rod([sx, 0.0, sz], [sx, 0.10, sz], [0.026, 0.032], GOLD_TRIM, {
    bone: staffRoot,
    sides: 8,
    group: "staff",
    name: "staffBottomFerrule",
  });
  // Lower Biotic Counter-Weight & glowing amber status band
  b.lathe(
    [
      [0.0, 0.0],
      [0.046, 0.03],
      [0.048, 0.11],
      [0.024, 0.16],
      [0.0, 0.16],
    ],
    {
      at: [sx, 0.10, sz],
      bone: staffRoot,
      segments: 8,
      color: ARMOR_WHITE,
      group: "staff",
      name: "staffPommelPod",
    },
  );
  glow(
    b.rod([sx, 0.26, sz], [sx, 0.34, sz], 0.028, GLOW_GOLD, {
      bone: staffRoot,
      sides: 8,
      group: "staff",
      name: "staffLowerGlowBand",
    }),
    1.4,
  );

  // Ergonomic White & Crimson Hand Grip Sleeve & Collars around right hand (y = 0.72..1.16)
  b.rod([sx, 0.72, sz], [sx, 1.16, sz], 0.027, ARMOR_WHITE, {
    bone: staffRoot,
    sides: 8,
    group: "staff",
    name: "staffGripSleeve",
  });
  b.rod([sx, 0.82, sz], [sx, 0.96, sz], 0.030, MEDIC_CRIMSON, {
    bone: staffRoot,
    sides: 8,
    group: "staff",
    name: "staffGripCrimsonWrap",
  });
  for (const gy of [0.71, 0.98, 1.17, 1.38]) {
    b.rod([sx, gy - 0.018, sz], [sx, gy + 0.018, sz], 0.034, GOLD_TRIM, {
      bone: staffRoot,
      sides: 8,
      group: "staff",
      name: `staffGoldCollar_${Math.round(gy * 100)}`,
    });
  }

  // Braided Biotic Power Cable spiralling from dorsal jump-pack / right forearm into staff shaft
  const powerCable = bezier(
    [-0.41, 0.96, 0.10],
    [-0.49, 0.86, 0.06],
    [-0.51, 0.76, 0.12],
    [sx, 0.71, sz],
  );
  glow(
    b.sweep(powerCable, 0.012, {
      bone: staffRoot,
      color: GLOW_GOLD,
      sides: 6,
      group: "staff",
      name: "staffBioticFeedCable",
    }),
    1.4,
  );

  // Upper Emitter Housing & Caduceus Helix Coils (`staffHead` bone, y = 1.38..1.92)
  b.lathe(
    [
      [0.0, 0.0],
      [0.034, 0.0],
      [0.064, 0.06],
      [0.058, 0.15],
      [0.032, 0.19],
      [0.0, 0.19],
    ],
    {
      at: [sx, 1.38, sz],
      bone: staffHead,
      segments: 8,
      color: ARMOR_WHITE,
      group: "staff",
      name: "staffEmitterChalice",
    },
  );
  b.rod([sx, 1.54, sz], [sx, 1.86, sz], [0.022, 0.014], GOLD_TRIM, {
    bone: staffHead,
    sides: 6,
    group: "staff",
    name: "staffCoreAxleSpire",
  });

  // Twin Swept Caduceus Conductor Horns (White Ceramic + Gold Tips + Glowing Inner Rails)
  for (const hs of [1, -1] as const) {
    const hTag = hs > 0 ? "L" : "R";
    const hornCurve = bezier(
      [sx, 1.46, sz],
      [sx, 1.52, sz + hs * 0.18],
      [sx, 1.72, sz + hs * 0.22],
      [sx, 1.88, sz + hs * 0.08],
    );
    b.sweep(hornCurve, [0.032, 0.026, 0.018, 0.010], {
      bone: staffHead,
      color: ARMOR_WHITE,
      section: { ngon: 6 },
      caps: { start: "flat", end: "point" },
      group: "staff",
      name: `staffCaduceusHorn${hTag}`,
    });

    // Inner glowing cyan/gold resonance arc bridging horn to central core
    const innerArc = bezier(
      [sx, 1.52, sz + hs * 0.09],
      [sx, 1.66, sz + hs * 0.14],
      [sx, 1.80, sz + hs * 0.06],
    );
    glow(
      b.sweep(innerArc, 0.011, {
        bone: staffHead,
        color: GLOW_CYAN,
        sides: 5,
        group: "staff",
        name: `staffConductorArc${hTag}`,
      }),
      1.5,
    );

    // Sidewing medical vane fin on emitter chalice
    b.frustumBox(
      [sx, 1.44, sz + hs * 0.04],
      [sx, 1.36, sz + hs * 0.14],
      [0.022, 0.065],
      [0.014, 0.035],
      {
        bone: staffHead,
        color: MEDIC_CRIMSON,
        group: "staff",
        name: `staffEmitterVane${hTag}`,
      },
    );
  }

  // Rotating Gyroscope Resonance Rings & Central Biotic Healing Orb (`staffSpinner` bone)
  const gyroRingOuter = catmull(
    [
      [sx, 1.76, sz],
      [sx, 1.66, sz + 0.10],
      [sx, 1.56, sz],
      [sx, 1.66, sz - 0.10],
    ],
    { closed: true },
  );
  b.sweep(gyroRingOuter, 0.012, {
    bone: staffSpinner,
    color: GOLD_TRIM,
    section: { ngon: 6 },
    group: "staff",
    name: "staffGyroRingOuter",
  });

  const gyroRingInner = catmull(
    [
      [sx + 0.085, 1.66, sz],
      [sx, 1.745, sz],
      [sx - 0.085, 1.66, sz],
      [sx, 1.575, sz],
    ],
    { closed: true },
  );
  glow(
    b.sweep(gyroRingInner, 0.010, {
      bone: staffSpinner,
      color: GLOW_GOLD,
      section: { ngon: 6 },
      group: "staff",
      name: "staffGyroRingInner",
    }),
    1.5,
  );

  // Central Biotic Healing Core Orb & Top Caduceus Finial Crown
  glow(
    b.part(new THREE.OctahedronGeometry(0.052, 1), GLOW_GOLD, {
      bone: staffSpinner,
      at: [sx, 1.66, sz],
      group: "staff",
      name: "staffBioticCoreOrb",
    }),
    1.7,
  );
  glow(
    b.spike([sx, 1.85, sz], [0, 1, 0], 0.09, 0.024, GLOW_CYAN, {
      bone: staffHead,
      sides: 6,
      group: "staff",
      name: "staffApexBeacon",
    }),
    1.6,
  );

  return b.root;
}
