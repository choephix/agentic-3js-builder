import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame, line } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { aim, lerp, offset, rng, vec } from "../../../../src/math";
import { countershade, gradient, mix, noise, paint, scales, smoothstep } from "../../../../src/paint";
import { bezier, catmull, polyline, spiral } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, furEdge, INK, inkLines, zigzag } from "../../../../kits/toon";

export const meta = {
  name: "Celestial Qilin",
  description:
    "A sacred high-fantasy anime qilin with cel-shaded jade-teal dragon scales, gilded branching antlers, swirling celestial cloud mane, fetlock flames, and golden ribbon regalia.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "qilin", detail: 1, paintSize: 2048 });

  // ---------------------------------------------------------------------------
  // Palette (High-Fantasy Anime Cel-Shaded)
  // ---------------------------------------------------------------------------
  const JADE_LIGHT = "#3de0c8";
  const JADE_MID = "#1db5a6";
  const JADE_DEEP = "#117a7a";
  const JADE_SHADOW = "#0c4a5e";

  const CREAM_LIT = "#fff9ec";
  const CREAM_SHAD = "#dfCEe8";
  const CLOUD_LIT = "#f5fcff";
  const CLOUD_MIST = "#a8e6f0";
  const CLOUD_SHAD = "#72b2d8";

  const GOLD_LIT = "#ffd866";
  const GOLD_MID = "#eab038";
  const GOLD_SHAD = "#a86420";
  const BRONZE_LIT = "#d68938";
  const BRONZE_SHAD = "#7c3f1c";

  const CORAL_RED = "#e84a5f";
  const CORAL_SHAD = "#962444";
  const SPIRIT_CYAN = "#7afff0";
  const SPIRIT_GOLD = "#ffe885";
  const HOOF_DARK = "#241938";

  // Cel materials & procedural paints
  const GOLD = cel(GOLD_LIT, GOLD_SHAD);
  const GOLD_BRIGHT = cel("#ffe694", GOLD_MID);
  const BRONZE = cel(BRONZE_LIT, BRONZE_SHAD);
  const CORAL = cel(CORAL_RED, CORAL_SHAD);
  const CREAM = cel(CREAM_LIT, CREAM_SHAD);
  const HOOF_PAINT = cel("#35264d", "#180f29");

  // Sacred dragon-scale coat on the upper body & flanks
  const jadeScalesBase = scales([JADE_LIGHT, JADE_MID, "#2bc7b5", "#52ebd9"], JADE_DEEP, {
    size: 0.052,
    width: 0.16,
    seed: 19,
  });

  // Add subtle golden celestial flecks and dorsal ridge darkening to the scale coat
  const dorsalJade = paint((p, n) => {
    const dorsalT = smoothstep(0.35, 0.88, n.y);
    const scaleCol = jadeScalesBase.at(p, n);
    const deep = mix(scaleCol, JADE_DEEP, dorsalT * 0.48);
    // Occasional golden sacred scale shimmer on the upper flanks
    const shimmer = noise(p, 0.09, 77);
    if (n.y > 0.05 && shimmer > 0.76) {
      return mix(deep, GOLD_LIT, 0.55);
    }
    return deep;
  });

  // Fur-edged transition between scaled back and plated cream belly
  const bodyCoat = cel(
    furEdge(dorsalJade, CREAM_LIT, {
      level: -0.22,
      teeth: 0.18,
      period: 0.045,
      along: [0, 0, 1],
      ink: INK,
      inkWidth: 0.045,
    }),
  );

  // Segmented dragon-belly scutes paint for neck & chest underside
  const bellyScutes = cel(
    paint((p, _n, s) => {
      const band = Math.sin((s[0] * 38 + p.z * 14) * Math.PI);
      if (Math.abs(band) < 0.14) return "#c7b2d6";
      return s[1] > 140 && s[1] < 220 ? CREAM_LIT : "#f2e5d5";
    }),
  );

  // Neck paint combining dorsal scales and ventral scutes with an ink line border
  const neckCoat = cel(
    furEdge(dorsalJade, bellyScutes, {
      axis: [0, 0.85, -0.52],
      level: -0.12,
      teeth: 0.15,
      period: 0.038,
      along: [0, 1, 0.3],
      ink: INK,
      inkWidth: 0.045,
    }),
  );

  // Leg gradient: jade scales at upper thigh/shoulder transitioning into dark celestial sock and golden fetlock trim
  const legCoat = cel(
    paint((p, n) => {
      if (p.y < 0.24) {
        const goldWave = 0.21 + 0.025 * zigzag(p.x / 0.03 + p.z / 0.03);
        if (Math.abs(p.y - goldWave) < 0.012) return GOLD_LIT;
        return "#1f1838";
      }
      const t = smoothstep(0.24, 0.58, p.y);
      const upper = dorsalJade.at(p, n);
      return mix("#253559", upper, t);
    }),
  );

  // Cloud mane paint: pearlescent white-to-cyan gradient with cel ink contour accents
  const cloudPaint = inkLines(
    cel(
      countershade(CLOUD_LIT, CLOUD_MIST, { level: -0.1, soft: 0.45 }),
      CLOUD_SHAD,
    ),
    { levels: [-0.68], axis: [0, 1, 0], width: 0.05, ink: "#3a6e9c" },
  );

  const antlerPaint = cel(
    gradient(GOLD_LIT, "#fff5cc", [0, 1.55, 0.5], [0, 2.15, 0.15]),
    GOLD_SHAD,
  );

  // ---------------------------------------------------------------------------
  // SVG Textures (Anime Eye, Cloud Tuft Cards, Sacred Scale Cards, Talismans)
  // ---------------------------------------------------------------------------
  const EYE_TEX = animeEye({
    iris: "#ffae2b",
    irisLight: "#fff6a8",
    irisDark: "#8c271e",
    blush: "#ff85a2",
    brow: true,
    size: 512,
  });

  // Swirling high-fantasy anime cloud lock card
  const CLOUD_CARD_TEX = svg(
    `<svg viewBox="0 0 128 192">
      <path d="M58 188 C26 162 14 120 22 76 C28 42 54 14 88 10 C110 8 122 26 114 48 C106 68 84 68 78 52 C74 42 82 32 90 34 C74 28 52 46 48 76 C44 104 64 114 86 106 C106 98 118 116 108 136 C98 156 76 168 68 188 Z"
        fill="#f2fdff" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M52 170 C36 140 32 102 40 68 C46 42 66 24 88 20"
        fill="none" stroke="#8cebf5" stroke-width="6" stroke-linecap="round"/>
      <path d="M68 148 C82 144 96 132 96 120 C96 112 86 110 80 116"
        fill="none" stroke="#ffd866" stroke-width="4.5" stroke-linecap="round"/>
      <circle cx="92" cy="40" r="5" fill="#ffd866"/>
    </svg>`,
    { size: 256 },
  );

  // Feathered celestial scale-plume card for flanks and fetlocks
  const SCALE_PLUME_TEX = svg(
    `<svg viewBox="0 0 96 128">
      <path d="M48 124 C20 100 10 62 24 26 C32 10 42 4 48 4 C54 4 64 10 72 26 C86 62 76 100 48 124 Z"
        fill="#39dec8" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M48 110 C30 90 24 60 34 32 C40 18 45 14 48 14 C51 14 56 18 62 32 C72 60 66 90 48 110 Z"
        fill="#7afff0"/>
      <path d="M48 116 L48 16 M48 44 L32 28 M48 44 L64 28 M48 72 L28 54 M48 72 L68 54"
        stroke="#ffd866" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  // Forehead sacred golden lotus / sun crest decal
  const CREST_TEX = svg(
    `<svg viewBox="0 0 128 128">
      <path d="M64 8 L78 44 L114 34 L88 64 L114 94 L78 84 L64 120 L50 84 L14 94 L40 64 L14 34 L50 44 Z"
        fill="#ffd866" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <circle cx="64" cy="64" r="22" fill="#e84a5f" stroke="${INK}" stroke-width="4"/>
      <circle cx="64" cy="64" r="11" fill="#7afff0"/>
      <circle cx="59" cy="59" r="4" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  // Hanging paper/silk talisman tag with golden kanji-style geometric seal
  const TALISMAN_TEX = svg(
    `<svg viewBox="0 0 64 160">
      <rect x="6" y="6" width="52" height="148" rx="6" fill="#e84a5f" stroke="${INK}" stroke-width="4"/>
      <rect x="12" y="12" width="40" height="136" rx="3" fill="none" stroke="#ffd866" stroke-width="3"/>
      <circle cx="32" cy="40" r="11" fill="none" stroke="#ffd866" stroke-width="3.5"/>
      <path d="M32 29 L32 51 M21 40 L43 40 M22 70 L42 70 M32 70 L32 126 M20 92 L44 92 M24 114 L40 114"
        stroke="#ffd866" stroke-width="4" stroke-linecap="round"/>
      <circle cx="32" cy="136" r="4" fill="#7afff0"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // 1. Skeleton (Hips root, Spine, Neck, Head, Jaw, 4 IK Legs, Tail, Ribbons)
  // ---------------------------------------------------------------------------
  // Real-world / lore size: Noble stag/horse-sized celestial beast (~1.95 m tall to antler tips, ~1.18 m at withers)
  const hips = b.joint("hips", { at: [0, 0.96, -0.44], dir: [0, 0.04, 1], role: "spine", group: "torso" });

  const spinePath = catmull([
    [0, 0.96, -0.44],
    [0, 0.94, -0.14],
    [0, 0.97, 0.16],
    [0, 1.05, 0.44],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
    group: "torso",
  });
  const chest = spine.joints[2];

  // Graceful S-curved dragon-stag neck
  const neckPath = catmull([
    [0, 1.05, 0.44],
    [0, 1.20, 0.56],
    [0, 1.38, 0.61],
    [0, 1.53, 0.68],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: chest,
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
    group: "neck",
  });

  // Head & articulated lower jaw
  const head = b.joint("head", {
    parent: neck.joints[2],
    at: [0, 1.53, 0.68],
    dir: [0, -0.14, 0.99],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.04, -0.055]),
    dir: [0, -0.28, 0.96],
    role: "jaw",
    group: "head",
  });

  // Flowing S-curve lion-dragon tail
  const tailPath = catmull([
    [0, 0.98, -0.48],
    [0, 1.06, -0.72],
    [0, 1.24, -0.94],
    [0, 1.46, -1.08],
    [0, 1.62, -1.26],
    [0, 1.56, -1.44],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"],
    role: "tail",
    group: "tail",
  });

  // Celestial floating silk ribbon chains (left and right) rooted at chest/withers
  const ribbonChains: Record<string, ReturnType<typeof b.chain>> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const rPath = catmull([
      [s * 0.20, 1.12, 0.36],
      [s * 0.34, 1.28, 0.14],
      [s * 0.38, 1.36, -0.22],
      [s * 0.30, 1.24, -0.62],
      [s * 0.36, 1.34, -0.98],
    ]);
    ribbonChains[side] = b.chain(`ribbon${side}`, rPath, {
      parent: chest,
      names: [`ribbon1${side}`, `ribbon2${side}`, `ribbon3${side}`, `ribbon4${side}`],
      role: "tentacle",
      group: `ribbon${side}`,
    });
  }

  // Four ungulate legs via IK, landing cloven hooves squarely on y = 0
  const hoofAnkleY = 0.065;
  const frontLegs: Array<{ side: string; s: number; chain: ReturnType<typeof b.chain>; contact: [number, number, number] }> = [];
  const hindLegs: Array<{ side: string; s: number; chain: ReturnType<typeof b.chain>; contact: [number, number, number] }> = [];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const zOff = s > 0 ? 0.03 : -0.03; // subtle natural stance stagger

    // Front leg (shoulder -> elbow -> wrist/carpus -> fetlock -> hoof)
    const shoulderAt: [number, number, number] = [s * 0.165, 0.95, 0.42 + zOff];
    const footF: [number, number, number] = [s * 0.175, hoofAnkleY, 0.45 + zOff];
    const fPts = limb(
      shoulderAt,
      footF,
      [0.33, 0.32, 0.27],
      [
        [0, 0, -1], // elbow bends back
        [0, 0, 1],  // carpus/fetlock bends forward
      ],
    );
    const fChain = b.chain(`legF${side}`, fPts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hoofF${side}`],
      role: "leg",
      contact: [footF[0], 0, footF[2] + 0.03],
      group: `legF${side}`,
    });
    frontLegs.push({ side, s, chain: fChain, contact: [footF[0], 0, footF[2]] });

    // Hind leg (hip -> stifle/knee -> hock -> fetlock -> hoof)
    const hipAt: [number, number, number] = [s * 0.17, 0.93, -0.42 - zOff];
    const footB: [number, number, number] = [s * 0.18, hoofAnkleY, -0.45 - zOff];
    const bPts = limb(
      hipAt,
      footB,
      [0.35, 0.35, 0.27],
      [
        [0, 0, 1],  // stifle bends forward
        [0, 0, -1], // hock bends backward
      ],
    );
    const bChain = b.chain(`legB${side}`, bPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `hoofB${side}`],
      role: "leg",
      contact: [footB[0], 0, footB[2] + 0.03],
      group: `legB${side}`,
    });
    hindLegs.push({ side, s, chain: bChain, contact: [footB[0], 0, footB[2]] });
  }

  // ---------------------------------------------------------------------------
  // 2. Torso, Neck & Tail Base Volumes (Continuous Skinned Lofts & Sweeps)
  // ---------------------------------------------------------------------------
  // Torso loft from rump through waist, ribcage, and proud chest
  const bodyStations = [
    { at: [0, 0.97, -0.56], w: 0.22, h: 0.24 },
    { at: [0, 0.98, -0.40], w: 0.36, h: 0.38 },
    { at: [0, 0.95, -0.14], w: 0.31, h: 0.35 },
    { at: [0, 0.99, 0.18], w: 0.38, h: 0.44 },
    { at: [0, 1.05, 0.44], w: 0.36, h: 0.42 },
    { at: [0, 1.11, 0.54], w: 0.25, h: 0.30 },
  ];
  const torsoLoft = b.loft(bodyStations, {
    bone: [hips, spine],
    color: bodyCoat,
    shift: (t) => [0, -0.025 * Math.sin(t * Math.PI)],
    name: "torsoLoft",
    group: "torso",
  });

  // Neck sweep with graceful taper from muscular chest base to skull attachment
  const neckRadii: Array<[number, number]> = [
    [0.145, 0.165],
    [0.12, 0.14],
    [0.105, 0.12],
    [0.095, 0.105],
  ];
  const neckSweep = b.sweep(
    neck,
    (t) => {
      const idx = t * (neckRadii.length - 1);
      const i = Math.min(Math.floor(idx), neckRadii.length - 2);
      const f = idx - i;
      return [
        neckRadii[i][0] + (neckRadii[i + 1][0] - neckRadii[i][0]) * f,
        neckRadii[i][1] + (neckRadii[i + 1][1] - neckRadii[i][1]) * f,
      ];
    },
    {
      color: neckCoat,
      caps: { start: "round", end: "round" },
      name: "neckTube",
      group: "neck",
    },
  );

  // Tail sweep (scaled jade base tapering to a golden tip before the great cloud brush)
  const tailSweep = b.sweep(
    tail,
    [0.075, 0.06, 0.048, 0.038, 0.03, 0.018],
    {
      color: bodyCoat,
      caps: { start: "round", end: "point" },
      name: "tailTube",
      group: "tail",
    },
  );

  // ---------------------------------------------------------------------------
  // 3. Dragon-Deer Head, Jaw, Whiskers, Ears, Eyes & Branching Antlers
  // ---------------------------------------------------------------------------
  // Cranium and sculpted dragon-stag snout
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), dorsalJade, {
    bone: head,
    at: head.local([0, 0.055, 0.015]),
    dir: head.dir([0, 1, 0.1]),
    scale: [0.115, 0.125, 0.105],
    name: "skull",
    group: "head",
  });

  // Upper muzzle bridge (tapered box-oval snout with dragon nasal ridge)
  const snout = b.sweep(
    catmull([
      head.local([0, 0.04, 0.01]),
      head.local([0, 0.15, -0.005]),
      head.local([0, 0.255, -0.015]),
    ]),
    (t) => [0.092 * (1 - 0.38 * t), 0.072 * (1 - 0.32 * t)],
    {
      bone: head,
      color: bodyCoat,
      caps: { start: "round", end: "round" },
      name: "snout",
      group: "head",
    },
  );

  // Sculpted golden nasal bridge plate running up the snout to the forehead
  b.sweep(
    catmull([
      head.local([0, 0.26, 0.032]),
      head.local([0, 0.15, 0.062]),
      head.local([0, 0.03, 0.105]),
    ]),
    [0.022, 0.028, 0.034],
    {
      bone: head,
      section: { ngon: 6 },
      color: GOLD,
      name: "nasalBridge",
      group: "head",
    },
  );

  // Flared dragon nostrils & upper lip curls
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.024, 8, 6), dorsalJade, {
      bone: head,
      at: head.local([s * 0.044, 0.245, 0.015]),
      scale: [1, 1.3, 0.85],
      name: `nostrilFlare${side}`,
      group: "head",
    });
    b.part(new THREE.SphereGeometry(0.012, 6, 5), INK, {
      bone: head,
      at: head.local([s * 0.048, 0.258, 0.015]),
      name: `nostrilPit${side}`,
      group: "head",
    });
    // Upper canine fang peeking out
    b.spike(
      head.local([s * 0.042, 0.20, -0.042]),
      head.dir([0, 0.15, -1]),
      0.036,
      0.01,
      {
        bone: head,
        color: CREAM,
        sides: 6,
        name: `fang${side}`,
        group: "head",
      },
    );
  }

  // Lower jaw & chin beard
  b.sweep(
    catmull([
      jaw.local([0, 0.0, 0]),
      jaw.local([0, 0.11, 0.005]),
      jaw.local([0, 0.195, 0.012]),
    ]),
    (t) => [0.068 * (1 - 0.42 * t), 0.038 * (1 - 0.35 * t)],
    {
      bone: jaw,
      color: CREAM,
      caps: { start: "round", end: "round" },
      name: "lowerJaw",
      group: "head",
    },
  );

  // Tongue inside mouth
  b.part(new THREE.SphereGeometry(0.035, 8, 6), CORAL, {
    bone: jaw,
    at: jaw.local([0, 0.11, 0.028]),
    scale: [0.85, 1.7, 0.4],
    name: "tongue",
    group: "head",
  });

  // Flowing imperial cloud-scroll beard under the chin
  for (let i = 0; i < 3; i++) {
    const spread = (i - 1) * 0.028;
    const len = i === 1 ? 0.22 : 0.16;
    b.sweep(
      catmull([
        jaw.local([spread, 0.16 - Math.abs(spread), -0.018]),
        jaw.local([spread * 1.4, 0.12, -0.09 - len * 0.35]),
        jaw.local([spread * 1.6, 0.03, -0.11 - len * 0.65]),
        jaw.local([spread * 1.2, 0.08, -0.07 - len * 0.82]),
      ]),
      [0.026, 0.034, 0.022, 0.004],
      {
        bone: jaw,
        color: cloudPaint,
        caps: { start: "round", end: "point" },
        name: `chinBeard${i + 1}`,
        group: "head",
      },
    );
  }

  // Slight rest-pose jaw opening so the fangs and tongue read clearly
  b.pose(jaw, { axis: [1, 0, 0], deg: 8 });

  // Big shiny anime eyes conformed onto the head surface via decal
  const headSkin = b.surface([skull, snout]);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const eyeCenter = head.local([s * 0.088, 0.085, 0.025]);
    b.decal(headSkin, EYE_TEX, {
      bone: head,
      at: eyeCenter,
      dir: head.dir([s * 0.88, 0.42, 0.18]),
      up: head.dir([0, 0.15, 1]),
      size: [0.095, 0.125],
      mirror: s > 0, // s = 1 is +X (creature's left eye)
      name: `eyeDecal${side}`,
      group: "head",
    });

    // Dramatic sweeping golden-cloud eyebrow ridges above eyes (classic anime qilin feature)
    const browPath = catmull([
      head.local([s * 0.038, 0.12, 0.082]),
      head.local([s * 0.095, 0.095, 0.105]),
      head.local([s * 0.145, 0.02, 0.135]),
      head.local([s * 0.185, -0.08, 0.185]),
      head.local([s * 0.165, -0.14, 0.225]),
    ]);
    b.sweep(browPath, [0.018, 0.028, 0.024, 0.014, 0.002], {
      bone: head,
      color: GOLD_BRIGHT,
      caps: { start: "round", end: "point" },
      name: `browPlume${side}`,
      group: "head",
    });

    // Long flowing dragon whiskers curving from the upper muzzle
    const whiskerPath = catmull([
      head.local([s * 0.068, 0.21, -0.005]),
      head.local([s * 0.16, 0.22, -0.02]),
      head.local([s * 0.25, 0.12, -0.06]),
      head.local([s * 0.31, -0.02, -0.09]),
      head.local([s * 0.35, -0.14, -0.04]),
    ]);
    b.sweep(whiskerPath, [0.013, 0.011, 0.009, 0.006, 0.001], {
      bone: head,
      color: GOLD_BRIGHT,
      sides: 6,
      caps: { start: "round", end: "point" },
      name: `whisker${side}`,
      group: "head",
    });

    // Cheek scale-fin frills (3 fanned dragon cheek spikes per side)
    for (let k = 0; k < 3; k++) {
      const angle = -15 + k * 22;
      const base = head.local([s * 0.102, 0.01 - k * 0.028, -0.01 + k * 0.022]);
      const tip = head.local([
        s * (0.185 + k * 0.012),
        -0.06 - k * 0.025,
        -0.02 + k * 0.035 + Math.sin(angle * 0.02) * 0.02,
      ]);
      b.sweep(bezier(base, lerp(base, tip, 0.5), tip), [0.02, 0.014, 0.002], {
        bone: head,
        color: k === 1 ? GOLD : cloudPaint,
        caps: { start: "round", end: "point" },
        sides: 6,
        name: `cheekFrill${side}${k + 1}`,
        group: "head",
      });
    }

    // Long stylized anime deer/elf ears with inner coral-pink fur and golden tips
    const earOutline: OutlinePoint[] = [
      [0, 0, "sharp"],
      [0.06, -0.028],
      [0.16, -0.022],
      [0.24, 0.012, "sharp"],
      [0.15, 0.038],
      [0.05, 0.026],
    ];
    b.extrude(earOutline, {
      bone: head,
      at: head.local([s * 0.095, -0.01, 0.055]),
      x: head.dir([s * 0.82, -0.42, 0.38]),
      y: head.dir([0, 0.35, 0.94]),
      thickness: [0.024, 0.004],
      bevel: 0.005,
      smoothing: 2,
      color: bodyCoat,
      name: `ear${side}`,
      group: "head",
    });
    // Inner ear accent
    b.extrude(
      [
        [0.02, 0, "sharp"],
        [0.08, -0.014],
        [0.18, 0.006, "sharp"],
        [0.08, 0.018],
      ],
      {
        bone: head,
        at: head.local([s * 0.10, 0.0, 0.052]),
        x: head.dir([s * 0.82, -0.42, 0.38]),
        y: head.dir([0, 0.35, 0.94]),
        thickness: 0.012,
        smoothing: 1,
        color: CORAL,
        name: `earInner${side}`,
        group: "head",
      },
    );
  }

  // Forehead sacred third-eye / lotus crest decal + glowing jewel centerpiece
  b.decal(headSkin, CREST_TEX, {
    bone: head,
    at: head.local([0, 0.045, 0.115]),
    dir: head.dir([0, 0.55, 0.84]),
    up: head.dir([0, -0.84, 0.55]),
    size: [0.085, 0.085],
    name: "foreheadCrest",
    group: "head",
  });

  // Central crystalline Qilin horn (single sacred horn between the antlers, ringed with gold)
  const centerHornBase = head.local([0, 0.01, 0.108]);
  const centerHornTip = head.local([0, -0.19, 0.36]);
  b.part(new THREE.CylinderGeometry(0.032, 0.042, 0.028, 8), GOLD, {
    bone: head,
    at: centerHornBase,
    dir: head.dir([0, -0.5, 0.86]),
    name: "centerHornCollar",
    group: "head",
  });
  glow(
    b.sweep(
      bezier(
        centerHornBase,
        head.local([0, -0.05, 0.22]),
        head.local([0, -0.14, 0.29]),
        centerHornTip,
      ),
      [0.028, 0.022, 0.014, 0.002],
      {
        bone: head,
        section: { ngon: 6 },
        color: SPIRIT_CYAN,
        caps: { start: "flat", end: "point" },
        name: "sacredCenterHorn",
        group: "head",
      },
    ),
    1.3,
  );

  // Grand branching golden coral-stag antlers (Left and Right)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pedicleAt = head.local([s * 0.058, -0.025, 0.095]);

    // Ornate golden rosette base at skull
    b.part(new THREE.CylinderGeometry(0.034, 0.042, 0.026, 8), BRONZE, {
      bone: head,
      at: pedicleAt,
      dir: head.dir([s * 0.35, -0.65, 0.68]),
      name: `antlerRosette${side}`,
      group: "head",
    });

    // Main sweeping antler beam
    const mainBeam = catmull([
      pedicleAt,
      head.local([s * 0.11, -0.13, 0.19]),
      head.local([s * 0.19, -0.28, 0.27]),
      head.local([s * 0.22, -0.44, 0.38]),
      head.local([s * 0.15, -0.56, 0.50]),
    ]);
    b.sweep(mainBeam, [0.028, 0.024, 0.019, 0.014, 0.003], {
      bone: head,
      section: { ngon: 7 },
      color: antlerPaint,
      caps: { start: "flat", end: "point" },
      name: `antlerMain${side}`,
      group: "head",
    });

    // Brow tine (sweeps forward and up)
    const browTine = bezier(
       mainBeam.at(0.22),
      head.local([s * 0.14, -0.05, 0.28]),
      head.local([s * 0.11, 0.04, 0.35]),
    );
    b.sweep(browTine, [0.018, 0.012, 0.002], {
      bone: head,
      section: { ngon: 6 },
      color: antlerPaint,
      caps: { start: "round", end: "point" },
      name: `antlerBrowTine${side}`,
      group: "head",
    });

    // Outer royal tine (sweeps wide and up)
    const outerTine = bezier(
      mainBeam.at(0.50),
      head.local([s * 0.28, -0.26, 0.35]),
      head.local([s * 0.31, -0.22, 0.46]),
    );
    b.sweep(outerTine, [0.017, 0.011, 0.002], {
      bone: head,
      section: { ngon: 6 },
      color: antlerPaint,
      caps: { start: "round", end: "point" },
      name: `antlerOuterTine${side}`,
      group: "head",
    });

    // Inner celestial crown tine (curves inward toward the center above the head)
    const crownTine = bezier(
      mainBeam.at(0.74),
      head.local([s * 0.14, -0.40, 0.44]),
      head.local([s * 0.065, -0.38, 0.52]),
    );
    b.sweep(crownTine, [0.015, 0.010, 0.002], {
      bone: head,
      section: { ngon: 6 },
      color: antlerPaint,
      caps: { start: "round", end: "point" },
      name: `antlerCrownTine${side}`,
      group: "head",
    });

    // Glowing spirit-orb suspended between the crown tines and main tips
    const orbPos = head.local([s * 0.11, -0.47, 0.48]);
    glow(
      b.part(new THREE.OctahedronGeometry(0.024, 0), SPIRIT_GOLD, {
        bone: head,
        at: orbPos,
        name: `antlerSpiritGem${side}`,
        group: "head",
      }),
      1.5,
    );
  }

  // ---------------------------------------------------------------------------
  // 4. Sculpted Cloud Mane, Dorsal Cloud Crest & Tail Brush
  // ---------------------------------------------------------------------------
  // Voluminous swirling cloud locks along the back and sides of the neck and withers
  const neckCloudLocks: Array<{ t: number; deg: number; len: number; r: number; curl: number; lift: number }> = [
    { t: 0.92, deg: 0, len: 0.32, r: 0.068, curl: 0.14, lift: 0.08 },
    { t: 0.82, deg: 28, len: 0.28, r: 0.062, curl: 0.12, lift: 0.05 },
    { t: 0.82, deg: -28, len: 0.28, r: 0.062, curl: 0.12, lift: 0.05 },
    { t: 0.68, deg: 0, len: 0.36, r: 0.075, curl: 0.16, lift: 0.09 },
    { t: 0.62, deg: 42, len: 0.30, r: 0.065, curl: 0.13, lift: 0.03 },
    { t: 0.62, deg: -42, len: 0.30, r: 0.065, curl: 0.13, lift: 0.03 },
    { t: 0.45, deg: 0, len: 0.38, r: 0.082, curl: 0.18, lift: 0.10 },
    { t: 0.40, deg: 50, len: 0.32, r: 0.068, curl: 0.14, lift: 0.02 },
    { t: 0.40, deg: -50, len: 0.32, r: 0.068, curl: 0.14, lift: 0.02 },
    { t: 0.22, deg: 0, len: 0.42, r: 0.088, curl: 0.20, lift: 0.12 },
    { t: 0.18, deg: 58, len: 0.34, r: 0.074, curl: 0.15, lift: 0.01 },
    { t: 0.18, deg: -58, len: 0.34, r: 0.074, curl: 0.15, lift: 0.01 },
    { t: 0.04, deg: 0, len: 0.44, r: 0.095, curl: 0.22, lift: 0.12 },
  ];

  neckCloudLocks.forEach((lock, idx) => {
    const anchor = neckSweep.at(lock.t, lock.deg, -0.015);
    const rootPt = anchor.at;
    const sideSign = Math.sign(lock.deg);
    const midPt = offset(rootPt, [sideSign * 0.08, 0.22 + lock.lift, -0.65], lock.len * 0.55);
    const tipPt = offset(midPt, [sideSign * 0.05, 0.38, -0.52], lock.len * 0.48);
    const scrollHook = offset(tipPt, [-sideSign * 0.04, 0.65, 0.45], lock.curl);

    b.sweep(
      catmull([rootPt, midPt, tipPt, scrollHook]),
      [lock.r * 0.72, lock.r, lock.r * 0.68, lock.r * 0.28, 0.005],
      {
        bone: anchor.bone,
        color: cloudPaint,
        caps: { start: "round", end: "point" },
        name: `maneCloudLock${idx + 1}`,
        group: "mane",
      },
    );

    // Sculpted cloud-volute puff ball at the curl apex for unmistakable anime cloud silhouette
    b.part(new THREE.SphereGeometry(lock.r * 0.58, 10, 8), cloudPaint, {
      bone: anchor.bone,
      at: tipPt,
      scale: [0.9, 1.05, 1.15],
      name: `maneCloudPuff${idx + 1}`,
      group: "mane",
    });
  });

  // Grand chest & throat cloud ruff (billowing cloud plumes across the front of the chest)
  for (let i = -2; i <= 2; i++) {
    const s = i * 0.062;
    const drop = Math.abs(i) * 0.025;
    const start = [s, 1.08 - drop, 0.54 - Math.abs(i) * 0.03];
    const mid1 = [s * 1.35, 0.96 - drop, 0.65 - Math.abs(i) * 0.03];
    const mid2 = [s * 1.5, 0.82 - drop, 0.60 - Math.abs(i) * 0.02];
    const tip = [s * 1.25, 0.85 - drop, 0.68 - Math.abs(i) * 0.02];
    const r = i === 0 ? 0.082 : 0.065;
    b.sweep(catmull([start, mid1, mid2, tip]), [r * 0.8, r, r * 0.72, 0.008], {
      bone: chest,
      color: cloudPaint,
      caps: { start: "round", end: "point" },
      name: `chestRuff${i + 3}`,
      group: "mane",
    });
  }

  // Dorsal spine ridge: alternating golden dragon-fin plates and cloud-flame tufts from withers to rump
  b.along(torsoLoft, 8, (at, i) => {
    const finLen = 0.085 + 0.025 * Math.sin((i / 7) * Math.PI);
    const finDir = vec([0, 0.68, -0.73]).normalize();
    b.spike(at.moved([0, -0.01, 0]), finDir, finLen, 0.024, {
      color: i % 2 === 0 ? GOLD : cloudPaint,
      sides: 6,
      name: `dorsalSpine${i + 1}`,
      group: "torso",
    });
  }, { from: 0.1, to: 0.88 });

  // Great multi-plume Imperial Cloud-Flame Tail Brush on the tail tip
  const tailBrushPlumes: Array<{ dx: number; dy: number; len: number; r: number; color: "cloud" | "gold" | "spirit" }> = [
    { dx: 0, dy: 0.04, len: 0.46, r: 0.095, color: "cloud" },
    { dx: 0.055, dy: 0.01, len: 0.38, r: 0.072, color: "cloud" },
    { dx: -0.055, dy: 0.01, len: 0.38, r: 0.072, color: "cloud" },
    { dx: 0, dy: -0.045, len: 0.36, r: 0.068, color: "cloud" },
    { dx: 0.035, dy: 0.055, len: 0.32, r: 0.045, color: "gold" },
    { dx: -0.035, dy: 0.055, len: 0.32, r: 0.045, color: "gold" },
    { dx: 0, dy: 0.085, len: 0.28, r: 0.034, color: "spirit" },
  ];

  const tailTipJoint = tail.joints[4];
  tailBrushPlumes.forEach((plume, idx) => {
    const p0 = tail.at(0.66).at;
    const p1 = offset(tail.at(0.84).at, [plume.dx * 0.8, plume.dy * 0.8, -0.04], 1);
    const p2 = offset(tail.at(1).at, [plume.dx * 1.5, plume.dy * 1.4 + 0.06, -plume.len * 0.45], 1);
    const p3 = offset(p2, [-plume.dx * 0.4, 0.14, -plume.len * 0.42], 1);
    const p4 = offset(p3, [0, 0.10, 0.06], 1); // upward spiral hook at tip

    const col = plume.color === "gold" ? GOLD_BRIGHT : plume.color === "spirit" ? SPIRIT_CYAN : cloudPaint;
    const s = b.sweep(
      catmull([p0, p1, p2, p3, p4]),
      [plume.r * 0.45, plume.r * 0.9, plume.r, plume.r * 0.55, 0.004],
      {
        bone: tailTipJoint,
        color: col,
        caps: { start: "round", end: "point" },
        name: `tailPlume${idx + 1}`,
        group: "tail",
      },
    );
    if (plume.color === "spirit") glow(s, 1.2);
  });

  // ---------------------------------------------------------------------------
  // 5. Four Legs, Cloven Hooves, Shoulder/Hip Cloud Scrolls & Fetlock Flames
  // ---------------------------------------------------------------------------
  const allLegs = [
    ...frontLegs.map((l) => ({ ...l, isFront: true })),
    ...hindLegs.map((l) => ({ ...l, isFront: false })),
  ];

  for (const leg of allLegs) {
    const { side, s, chain: lChain, isFront, contact } = leg;
    const tag = `${isFront ? "F" : "B"}${side}`;

    // Muscular leg sweep from upper joint to ankle
    const radii = isFront ? [0.105, 0.078, 0.054, 0.044] : [0.125, 0.088, 0.058, 0.046];
    b.sweep(lChain, radii, {
      color: legCoat,
      caps: { start: "round", end: "round" },
      name: `legTube${tag}`,
      group: `leg${tag}`,
    });

    // Golden knee/hock armor-scale cap on middle joint
    const midJoint = lChain.joints[1];
    b.part(new THREE.OctahedronGeometry(0.045, 1), GOLD, {
      bone: midJoint,
      at: offset(midJoint.at, [0, 0.02, isFront ? 0.045 : -0.045], 1),
      scale: [0.85, 1.35, 0.7],
      flat: true,
      name: `kneeGuard${tag}`,
      group: `leg${tag}`,
    });

    // Iconic Qilin cloud-flame fetlock plumes sweeping backward from the wrist/hock and ankle
    const ankleJoint = lChain.joints[2];
    for (let pIdx = 0; pIdx < 3; pIdx++) {
      const hFrac = 0.25 + pIdx * 0.28;
      const basePt = lerp(midJoint.at, lChain.joints[3].at, hFrac);
      const flareSide = (pIdx - 1) * 0.025 + s * 0.018;
      const flameLen = 0.22 - pIdx * 0.03;
      const fCurve = catmull([
        [basePt.x, basePt.y, basePt.z - 0.02],
        [basePt.x + flareSide, basePt.y + 0.03, basePt.z - flameLen * 0.55],
        [basePt.x + flareSide * 1.4, basePt.y + 0.11, basePt.z - flameLen],
        [basePt.x + flareSide * 1.1, basePt.y + 0.16, basePt.z - flameLen * 0.82],
      ]);
      b.sweep(fCurve, [0.028, 0.036, 0.022, 0.003], {
        bone: ankleJoint,
        color: pIdx === 1 ? GOLD_BRIGHT : cloudPaint,
        caps: { start: "round", end: "point" },
        name: `fetlockFlame${tag}${pIdx + 1}`,
        group: `leg${tag}`,
      });
    }

    // Golden ankle bangle above the cloven hoof
    const hoofJoint = lChain.joints[3];
    const [cx, , cz] = contact;
    b.part(new THREE.TorusGeometry(0.048, 0.011, 8, 14), GOLD, {
      bone: hoofJoint,
      at: [cx, 0.082, cz + 0.005],
      rotation: [82, 0, 0],
      name: `ankleRing${tag}`,
      group: `leg${tag}`,
    });

    // Cloven hoof: two sculpted symmetrical halves resting squarely on y = 0, plus golden dewclaws
    const toeOutline: OutlinePoint[] = [
      [0.004, -0.048, "sharp"],
      [0.048, -0.042],
      [0.056, 0.015],
      [0.038, 0.068],
      [0.005, 0.074, "sharp"],
      [0.004, 0.01],
    ];
    for (const hs of [1, -1]) {
      const hSide = hs > 0 ? "In" : "Out";
      b.extrude(toeOutline, {
        bone: hoofJoint,
        at: [cx, 0.034, cz + 0.01],
        x: [hs, 0, 0],
        y: [0, 0, 1],
        thickness: [0.068, 0.042], // 0.034 +/- 0.034 puts bottom face right at y = 0.000
        bevel: 0.008,
        smoothing: 1,
        color: HOOF_PAINT,
        name: `hoofToe${tag}${hSide}`,
        group: `leg${tag}`,
      });
    }

    // Golden coronet trim & back dewclaw spur
    b.spike([cx, 0.095, cz - 0.038], [0, -0.35, -1], 0.055, 0.016, {
      bone: hoofJoint,
      color: GOLD,
      sides: 6,
      name: `dewclaw${tag}`,
      group: `leg${tag}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 6. Ornate High-Fantasy Anime Regalia, Cloud Scrolls & Floating Silk Ribbons
  // ---------------------------------------------------------------------------
  const torsoSkin = b.surface(torsoLoft);

  // Sacred golden chest collar / breastplate harness draped over the shoulders and chest
  const collarRough = catmull(
    [
      [0, 1.24, 0.44],
      [0.21, 1.08, 0.48],
      [0, 0.88, 0.62],
      [-0.21, 1.08, 0.48],
    ],
    { closed: true },
  );
  const collarPath = torsoSkin.drape(collarRough, { lift: 0.012 });
  b.sweep(collarPath, 0.022, {
    bone: chest,
    color: GOLD,
    name: "goldenCollar",
    group: "regalia",
  });
  b.sweep( torsoSkin.drape(collarRough, { lift: 0.018 }), 0.011, {
    bone: chest,
    color: CORAL,
    name: "coralCollarCord",
    group: "regalia",
  });

  // Studs and sacred bronze bells along the chest collar
  b.along(collarPath, 10, (pt, i) => {
    b.part(new THREE.SphereGeometry(0.016, 8, 6), GOLD_BRIGHT, {
      bone: chest,
      at: pt.at,
      name: `collarStud${i + 1}`,
      group: "regalia",
    });
  });

  // Large ornate Spirit Bell + Glowing Jade Core + Talisman hanging at the center of the chest
  const bellCenter: [number, number, number] = [0, 0.84, 0.64];
  b.lathe(
    [
      [0, 0],
      [0.052, 0.005],
      [0.056, 0.022],
      [0.044, 0.055],
      [0.048, 0.078],
      [0.025, 0.095],
      [0, 0.10],
    ],
    {
      bone: chest,
      at: [bellCenter[0], bellCenter[1] - 0.04, bellCenter[2]],
      axis: [0, 1, 0],
      segments: 12,
      smoothing: 1,
      color: GOLD,
      name: "chestSpiritBell",
      group: "regalia",
    },
  );
  glow(
    b.part(new THREE.SphereGeometry(0.028, 8, 6), SPIRIT_CYAN, {
      bone: chest,
      at: [bellCenter[0], bellCenter[1] - 0.04, bellCenter[2]],
      name: "bellSpiritCore",
      group: "regalia",
    }),
    1.5,
  );

  // Hanging red & gold paper talismans under the chest bell and at both hips
  const talismanFrames = [
    frame([0, 0.80, 0.65], [0, 1, 0], [0, 0, 1]),
    frame([0.21, 0.90, -0.38], [0, 1, 0], [1, 0, 0]),
    frame([-0.21, 0.90, -0.38], [0, 1, 0], [-1, 0, 0]),
  ];
  b.cards(talismanFrames, TALISMAN_TEX, {
    bone: chest,
    size: [0.055, 0.14],
    lean: 180,
    flow: [0, 0, 1],
    name: "sacredTalismans",
    group: "regalia",
  });

  // Sculpted Golden Cloud-Scroll Armor Pauldrons on Shoulders & Hips (auspicious ruyi-cloud reliefs)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Shoulder ruyi-cloud scroll spiral
    const shCenter: [number, number, number] = [s * 0.205, 1.03, 0.38];
    const shSpiral = spiral(
      shCenter,
      [s * 0.21, 1.14, 0.48],
      [s, 0, 0],
      { turns: -s * 1.35, r1: 0.022, pitch: s * 0.012 },
    );
    b.sweep(shSpiral, [0.028, 0.022, 0.016, 0.010], {
      bone: chest,
      color: GOLD,
      caps: { start: "round", end: "round" },
      name: `shoulderCloudScroll${side}`,
      group: "regalia",
    });

    // Glowing jade cabochon gem set in the center of the shoulder cloud scroll
    glow(
      b.part(new THREE.OctahedronGeometry(0.028, 1), SPIRIT_CYAN, {
        bone: chest,
        at: [s * 0.225, 1.03, 0.38],
        scale: [0.55, 1.1, 1.1],
        flat: true,
        name: `shoulderGem${side}`,
        group: "regalia",
      }),
      1.3,
    );

    // Hip auspicious cloud scroll + coral silk cord over the hindquarters
    const hipCenter: [number, number, number] = [s * 0.195, 0.98, -0.40];
    const hipSpiral = spiral(
      hipCenter,
      [s * 0.20, 1.08, -0.30],
      [s, 0, 0],
      { turns: s * 1.25, r1: 0.02, pitch: s * 0.01 },
    );
    b.sweep(hipSpiral, [0.025, 0.020, 0.014, 0.008], {
      bone: hips,
      color: GOLD,
      caps: { start: "round", end: "round" },
      name: `hipCloudScroll${side}`,
      group: "regalia",
    });

    // Flowing Celestial Silk Ribbon (tennyo hagoromo scarf) along the rigged ribbon chains
    const rChain = ribbonChains[side];
    const edgeA = rChain.path;
    const edgeB = catmull(
      [0, 0.25, 0.5, 0.75, 1].map((t) => {
        const pt = rChain.at(t).at;
        const w = 0.055 * Math.sin(t * Math.PI) + 0.022;
        return [pt.x + s * w * 0.35, pt.y + w, pt.z];
      }),
    );
    b.membrane(edgeA, edgeB, {
      bone: rChain,
      thickness: 0.008,
      color: cel(
        paint((_p, _n, uv) =>
          uv[1] < 0.16 || uv[1] > 0.84 || uv[0] > 0.9 ? GOLD_LIT : CORAL_RED,
        ),
        CORAL_SHAD,
      ),
      name: `celestialRibbon${side}`,
      group: `ribbon${side}`,
    });

    // Golden lotus finial on the end of each floating ribbon
    b.part(new THREE.OctahedronGeometry(0.026, 0), GOLD_BRIGHT, {
      bone: rChain.joints[3],
      at: rChain.at(1).at,
      scale: [0.6, 1.4, 0.6],
      name: `ribbonFinial${side}`,
      group: `ribbon${side}`,
    });
  }

  // Draped croup harness loop across the lower back & rump
  const croupLoop = catmull([
    [0, 1.04, -0.18],
    [0.19, 0.95, -0.36],
    [0, 1.01, -0.54],
    [-0.19, 0.95, -0.36],
  ], { closed: true });
  b.sweep(torsoSkin.drape(croupLoop, { lift: 0.01 }), 0.014, {
    bone: hips,
    color: BRONZE,
    name: "croupHarness",
    group: "regalia",
  });

  // ---------------------------------------------------------------------------
  // 7. Layered Feather-Scale & Cloud Tuft Cards for Rich Surface Silhouette
  // ---------------------------------------------------------------------------
  // Scattered shimmering dragon-scale feather cards along the upper flanks and haunches
  const bodyNeckSkin = b.surface([torsoLoft, neckSweep]);
  const flankHits = bodyNeckSkin.scatter(64, {
    rng: rng(42),
    minDist: 0.068,
    filter: (h) => h.n.y > -0.15 && h.n.y < 0.78 && Math.abs(h.n.x) > 0.45 && h.at.z < 0.52,
  });
  b.cards(flankHits, SCALE_PLUME_TEX, {
    size: [0.065, 0.095],
    lean: 74,
    bend: 18,
    flow: [0, -0.18, -1],
    vary: 0.22,
    spin: 8,
    rng: rng(43),
    name: "flankScaleCards",
    group: "torso",
  });

  // Swirling cloud-mane card tufts layered along the neck crest, withers, and tail base
  const maneHits = bodyNeckSkin.scatter(42, {
    rng: rng(108),
    minDist: 0.055,
    filter: (h) => (h.at.z > 0.25 && h.n.y > 0.25) || (h.at.y > 1.15 && Math.abs(h.n.x) > 0.3),
  });
  b.cards(maneHits, CLOUD_CARD_TEX, {
    size: [0.095, 0.145],
    lean: 48,
    bend: 28,
    flow: [0, 0.25, -1],
    vary: 0.25,
    spin: 14,
    rng: rng(109),
    name: "maneCloudCards",
    group: "mane",
  });

  // Raised relief golden scale-studs along the spine and brow
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (let i = 0; i < 5; i++) {
      const hit = torsoSkin.around([0, 0.98, 0.32 - i * 0.17]).at(s * 34, 52);
      if (hit) {
        b.stick(new THREE.OctahedronGeometry(0.018, 0), GOLD, hit, {
          embed: 0.4,
          scale: [0.8, 0.5, 1.4],
          flow: [0, 0, -1],
          flat: true,
          name: `dorsalGoldScale${side}${i + 1}`,
          group: "torso",
        });
      }
    }
  }

  return b.root;
}
