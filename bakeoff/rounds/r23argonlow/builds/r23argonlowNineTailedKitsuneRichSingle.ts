import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { DEG, offset, rng, vec } from "../../../../src/math";
import { paint, smoothstep } from "../../../../src/paint";
import { bezier, catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, furEdge, INK, inkLines, zigzag } from "../../../../kits/toon";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description:
    "A mystical nine-tailed celestial kitsune fox in high-fantasy anime style, adorned with an ornate gold-trimmed shrine collar, shimenawa rope, magatama beads, crimson markings, and nine sweeping tails crowned in glowing cyan-violet foxfire.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "nineTailedKitsune", detail: 1, paintSize: 1024 });

  // ---------------------------------------------------------------------------
  // Palette (High-Fantasy Anime Cel-Shaded + Glowing Spirit Fire)
  // ---------------------------------------------------------------------------
  const IVORY_HEX = "#fff9f0";
  const IVORY_SHAD = "#dfd2ea";
  const CREAM_HEX = "#f5ead8";
  const CREAM_SHAD = "#d1c1dc";
  const SAKURA_HEX = "#ffd4df";
  const SAKURA_SHAD = "#dc9eb5";
  const CRIMSON_HEX = "#d92148";
  const CRIMSON_SHAD = "#8f113b";
  const DARK_CRIMSON_HEX = "#7d0e2b";
  const GOLD_HEX = "#ffca45";
  const GOLD_SHAD = "#c77d1a";
  const GOLD_BRIGHT = "#ffe885";
  const OBSIDIAN_HEX = "#28193d";
  const OBSIDIAN_SHAD = "#150b24";
  const JADE_HEX = "#2be8c8";
  const JADE_SHAD = "#149994";

  // Glowing Foxfire colors (flat strings for glow() compatibility)
  const FIRE_CORE = "#e6ffff";
  const FIRE_CYAN = "#38f6ff";
  const FIRE_TEAL = "#19c8e6";
  const FIRE_VIOLET = "#9d5cff";
  const FIRE_GOLD = "#ffe270";

  const IVORY = cel(IVORY_HEX, IVORY_SHAD);
  const CREAM = cel(CREAM_HEX, CREAM_SHAD);
  const SAKURA = cel(SAKURA_HEX, SAKURA_SHAD);
  const CRIMSON = cel(CRIMSON_HEX, CRIMSON_SHAD);
  const DARK_CRIMSON = cel(DARK_CRIMSON_HEX, "#4a061c");
  const GOLD = cel(GOLD_HEX, GOLD_SHAD);
  const GOLD_TRIM = inkLines(GOLD, { levels: [-0.45, 0.45], axis: [0, 1, 0], width: 0.07 });
  const OBSIDIAN = cel(OBSIDIAN_HEX, OBSIDIAN_SHAD);
  const JADE = cel(JADE_HEX, JADE_SHAD);

  // Body coat: ivory upper with warm cream belly and subtle crimson spirit-swirl saddle accents
  const BODY_RAW = paint((p, n, s) => {
    // Belly zigzag edge
    const bellyEdge = -0.22 + 0.16 * zigzag(p.z / 0.045);
    if (n.y < bellyEdge) return CREAM_HEX;
    // Ornate dorsal kitsune spirit markings along back and shoulders
    const backDist = Math.abs(p.x);
    const wave = 0.032 * Math.sin(p.z * 11.5) + 0.015 * Math.cos(p.z * 23);
    const shoulderCrest =
      p.z > 0.08 && p.z < 0.36
        ? Math.abs(backDist - (0.045 + (p.z - 0.08) * 0.28 + wave * 0.5)) < 0.014 && n.y > 0.15
        : false;
    const spineLine = p.z > -0.28 && p.z < 0.42 && backDist < 0.016 + 0.008 * zigzag(p.z / 0.05) && n.y > 0.45;
    const hipSwirl =
      p.z > -0.32 && p.z < -0.04
        ? Math.abs(Math.hypot(backDist - 0.085, p.z + 0.18) - 0.055) < 0.013 && n.y > 0.05
        : false;
    if (spineLine || shoulderCrest || hipSwirl) return CRIMSON_HEX;
    // Subtle sakura warmth near haunches and chest
    if (s[0] > 0.72 && n.y > 0.1) return SAKURA_HEX;
    return IVORY_HEX;
  });
  const BODY_PAINT = cel(BODY_RAW);

  // Head coat: ivory crown, crimson kabuki kitsune eye/brow/cheek markings, sakura-cream muzzle
  const HEAD_RAW = paint((p, n) => {
    const ax = Math.abs(p.x);
    // Lower muzzle & jaw cream
    if (p.y < 0.875 + 0.012 * zigzag(p.x / 0.025) && p.z > 0.45) return IVORY_HEX;
    // Forehead diamond / flame crest
    const dz = p.z - 0.49;
    const dy = p.y - 0.965;
    if (dz > -0.04 && dz < 0.06 && dy > -0.04 && ax < 0.024 * (1 - Math.abs(dy) / 0.055) && n.y > 0.2) {
      return ax < 0.008 ? GOLD_HEX : CRIMSON_HEX;
    }
    // Sweeping cheek tear-blaze markings
    const cheekSweep = Math.abs(p.y - (0.885 + (0.52 - p.z) * 0.35)) < 0.013 && ax > 0.055 && p.z > 0.42 && p.z < 0.56;
    if (cheekSweep) return CRIMSON_HEX;
    return IVORY_HEX;
  });
  const HEAD_PAINT = cel(HEAD_RAW);

  // Tail coat: ivory base, sakura transition, crimson flame-toothed mid-band, glowing-bright tip transition
  const TAIL_PAINT = cel(
    paint((_p, _n, s) => {
      const t = s[0];
      const deg = s[1];
      const tooth = 0.07 * zigzag(deg / 40);
      const rootTooth = 0.05 * zigzag(deg / 60);
      if (t < 0.16 + rootTooth) return SAKURA_HEX;
      if (t > 0.84 + tooth * 0.6) return "#d8f8ff";
      if (t > 0.72 + tooth) return CRIMSON_HEX;
      if (t > 0.66 + tooth && t <= 0.72 + tooth) return GOLD_HEX;
      return IVORY_HEX;
    }),
  );

  // Leg coat: ivory upper, crimson flame-ring cuff, obsidian-plum lower stockings, gold ankle ring
  const LEG_PAINT = cel(
    furEdge(
      IVORY_HEX,
      furEdge(CRIMSON_HEX, OBSIDIAN_HEX, {
        by: "position",
        axis: [0, 1, 0],
        level: 0.24,
        teeth: 0.032,
        period: 0.024,
        along: [0, 0, 1],
      }),
      {
        by: "position",
        axis: [0, 1, 0],
        level: 0.285,
        teeth: 0.035,
        period: 0.024,
        along: [0, 0, 1],
        ink: GOLD_HEX,
        inkWidth: 0.008,
      },
    ),
  );

  // ---------------------------------------------------------------------------
  // SVG Textures (Eyes, Fur Tuft Cards, Spirit Flame Cards, Ofuda Talismans)
  // ---------------------------------------------------------------------------
  const EYE_TEX = animeEye({
    iris: "#ff2a55",
    irisLight: "#ffcf54",
    irisDark: "#6b0629",
    blush: "#ff85a6",
    brow: true,
    size: 512,
  });

  const FUR_CARD_TEX = svg(
    `<svg viewBox="0 0 64 128">
      <path d="M8 126 C10 86, 18 44, 32 4 C46 44, 54 86, 56 126 Z" fill="#fff9f0" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M22 68 C25 46, 29 26, 32 10 C35 26, 39 46, 42 68 C36 56, 28 56, 22 68 Z" fill="#ffd4df"/>
      <path d="M32 10 L32 86" stroke="#e5d5e8" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const CRIMSON_TUFT_TEX = svg(
    `<svg viewBox="0 0 64 128">
      <path d="M6 126 C8 82, 16 38, 32 4 C48 38, 56 82, 58 126 Z" fill="#fff9f0" stroke="${INK}" stroke-width="4"/>
      <path d="M15 62 C20 38, 26 18, 32 4 C38 18, 44 38, 49 62 C40 48, 24 48, 15 62 Z" fill="#d92148"/>
      <path d="M24 34 C27 22, 30 12, 32 4 C34 12, 37 22, 40 34 Z" fill="#ffca45"/>
    </svg>`,
    { size: 256 },
  );

  const SPIRIT_FLAME_TEX = svg(
    `<svg viewBox="0 0 96 160">
      <path d="M48 6 C22 44, 8 82, 18 124 C24 146, 36 156, 48 156 C60 156, 72 146, 78 124 C88 82, 74 44, 48 6 Z" fill="#9d5cff"/>
      <path d="M48 18 C28 52, 16 86, 24 122 C29 140, 38 150, 48 150 C58 150, 67 140, 72 122 C80 86, 68 52, 48 18 Z" fill="#38f6ff"/>
      <path d="M48 42 C34 68, 28 94, 34 122 C38 136, 43 144, 48 144 C53 144, 58 136, 62 122 C68 94, 62 68, 48 42 Z" fill="#e6ffff"/>
      <circle cx="48" cy="116" r="14" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  const SHIDE_TEX = svg(
    `<svg viewBox="0 0 64 160">
      <polygon points="22,0 44,0 38,38 54,38 42,78 58,78 44,120 60,120 34,158 18,120 34,120 20,78 36,78 22,38 36,38"
        fill="#fff9f0" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
      <line x1="33" y1="6" x2="36" y2="142" stroke="#ffca45" stroke-width="3"/>
      <circle cx="33" cy="22" r="4.5" fill="#d92148"/>
      <circle cx="37" cy="60" r="4.5" fill="#d92148"/>
      <circle cx="38" cy="98" r="4.5" fill="#d92148"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // 1. Skeleton — Spine, Neck, Head, Jaw, Ears, 4 Legs + Digits, 9 Tails
  // ---------------------------------------------------------------------------
  // Real-world / fantasy kitsune stature: ~1.25 m tall at ear/tail crown, ~0.72 m shoulder height
  const bodyCurve = catmull([
    [0, 0.63, -0.35], // rump / tail root
    [0, 0.61, -0.22], // hips (root)
    [0, 0.60, -0.05], // mid-belly / waist
    [0, 0.63, 0.14],  // ribcage
    [0, 0.67, 0.30],  // chest / shoulders
    [0, 0.77, 0.39],  // neck base
    [0, 0.89, 0.44],  // neck top / skull base
  ]);

  const hips = b.joint("hips", { at: [0, 0.61, -0.22], dir: [0, 0, 1], role: "spine", group: "torso" });
  const rump = b.joint("rump", { parent: hips, at: [0, 0.63, -0.35], dir: [0, 0.1, -1], role: "spine", group: "torso" });

  const spineT = bodyCurve.closestT(hips.at);
  const neckStartT = bodyCurve.closestT([0, 0.67, 0.30]);

  const spine = b.chain("spine", bodyCurve.slice(spineT, neckStartT), {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
    group: "torso",
  });

  const neck = b.chain("neck", bodyCurve.slice(neckStartT, 1), {
    parent: spine,
    names: ["neck1", "neck2"],
    role: "neck",
    group: "neck",
  });

  const head = b.joint("head", {
    parent: neck,
    at: [0, 0.90, 0.45],
    dir: [0, -0.06, 1],
    role: "head",
    group: "head",
  });

  const snout = b.joint("snout", {
    parent: head,
    at: head.local([0, 0.085, -0.01]),
    dir: head.dir([0, 1, -0.08]),
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.035, -0.042]),
    aim: head.local([0, 0.165, -0.058]),
    role: "jaw",
    group: "head",
  });

  // Slightly open the jaw so fangs and tongue read clearly in close-up & flex
  b.pose(jaw, { axis: [1, 0, 0], deg: 9 });

  // Long expressive anime fox ears (2-bone chains on each side)
  const earChains = ([1, -1] as const).map((s) => {
    const side = s > 0 ? "L" : "R";
    const earRoot = head.local([s * 0.058, -0.01, 0.055]);
    const earMid = head.local([s * 0.125, -0.035, 0.165]);
    const earTip = head.local([s * 0.175, -0.055, 0.285]);
    return {
      s,
      side,
      chain: b.chain(`ear${side}`, catmull([earRoot, earMid, earTip]), {
        parent: head,
        names: [`earBase${side}`, `earMid${side}`, `earTip${side}`],
        role: "hinge",
        group: `ear${side}`,
      }),
    };
  });

  // ---------------------------------------------------------------------------
  // 2. Torso, Neck & Chest Loft / Sweeps
  // ---------------------------------------------------------------------------
  const torsoStations = [
    { at: [0, 0.63, -0.36], w: 0.18, h: 0.19 },
    { at: [0, 0.61, -0.22], w: 0.22, h: 0.23 },
    { at: [0, 0.59, -0.05], w: 0.19, h: 0.21 },
    { at: [0, 0.62, 0.14], w: 0.24, h: 0.26 },
    { at: [0, 0.67, 0.30], w: 0.25, h: 0.27 },
    { at: [0, 0.77, 0.39], w: 0.18, h: 0.19 },
    { at: [0, 0.89, 0.44], w: 0.15, h: 0.16 },
  ];

  const bodyTube = b.loft(torsoStations, {
    bone: [rump, hips, spine, neck],
    color: BODY_PAINT,
    sides: 12,
    name: "bodyMesh",
    group: "torso",
  });

  // Voluminous anime chest ruff (mane) — layered sculpted fur sweeps and extruded plumes
  const chestJoint = spine.joints[spine.joints.length - 1];
  const neckBaseJoint = neck.joints[0];

  // Central regal chest plume sweeping down between forelegs
  const chestPlumePath = bezier(
    [0, 0.74, 0.39],
    [0, 0.65, 0.52],
    [0, 0.52, 0.50],
    [0, 0.43, 0.42],
  );
  b.sweep(chestPlumePath, (t) => [0.11 * (1 - 0.65 * t * t), 0.075 * (1 - 0.6 * t)], {
    bone: [chestJoint, neckBaseJoint],
    color: IVORY,
    caps: { start: "round", end: "point" },
    sides: 10,
    name: "chestManeCenter",
    group: "mane",
  });

  // Layered side mane flares (3 tiers per side + dorsal neck crest)
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const upperMane = bezier(
      [s * 0.05, 0.82, 0.42],
      [s * 0.15, 0.78, 0.43],
      [s * 0.20, 0.71, 0.35],
      [s * 0.17, 0.66, 0.25],
    );
    b.sweep(upperMane, (t) => [0.055 * (1 - 0.7 * t), 0.042 * (1 - 0.65 * t)], {
      bone: neckBaseJoint,
      color: IVORY,
      bands: [
        [0.75, IVORY],
        [1, SAKURA],
      ],
      caps: { start: "round", end: "point" },
      sides: 8,
      name: `maneUpper${side}`,
      group: "mane",
    });

    const midMane = bezier(
      [s * 0.06, 0.73, 0.42],
      [s * 0.17, 0.67, 0.45],
      [s * 0.21, 0.58, 0.37],
      [s * 0.16, 0.51, 0.29],
    );
    b.sweep(midMane, (t) => [0.062 * (1 - 0.72 * t), 0.045 * (1 - 0.7 * t)], {
      bone: chestJoint,
      color: IVORY,
      bands: [
        [0.72, IVORY],
        [0.86, GOLD],
        [1, CRIMSON],
      ],
      caps: { start: "round", end: "point" },
      sides: 8,
      name: `maneMid${side}`,
      group: "mane",
    });

    const lowerMane = bezier(
      [s * 0.03, 0.62, 0.44],
      [s * 0.11, 0.54, 0.47],
      [s * 0.12, 0.46, 0.42],
      [s * 0.08, 0.40, 0.36],
    );
    b.sweep(lowerMane, (t) => [0.048 * (1 - 0.75 * t), 0.036 * (1 - 0.75 * t)], {
      bone: chestJoint,
      color: CREAM,
      caps: { start: "round", end: "point" },
      sides: 8,
      name: `maneLower${side}`,
      group: "mane",
    });
  }

  // ---------------------------------------------------------------------------
  // 3. Shrine Collar (Shimenawa Rope, Gold Bell, Jade Magatama, Ofuda Shide)
  // ---------------------------------------------------------------------------
  const bodySurf = b.surface(bodyTube);
  const collarLoop = bodySurf.loop(neckBaseJoint.moved([0, -0.03, 0]), {
    dir: [0, 0.72, 0.69],
    lift: 0.012,
  });

  // Braided crimson & gold sacred rope collar
  const SHIMENAWA_PAINT = cel(
    paint((_p, _n, s) => {
      const stripe = (((s[1] - 1080 * s[0]) % 90) + 90) % 90;
      if (stripe < 16) return GOLD_HEX;
      if (stripe < 55) return CRIMSON_HEX;
      return DARK_CRIMSON_HEX;
    }),
  );
  b.sweep(collarLoop, 0.022, {
    bone: [chestJoint, neckBaseJoint],
    color: SHIMENAWA_PAINT,
    sides: 8,
    name: "shimenawaCollar",
    group: "collar",
  });

  // Second thinner gold torque ring just below the shimenawa
  const goldTorqueLoop = bodySurf.loop(chestJoint.moved([0, 0.04, 0.04]), {
    dir: [0, 0.65, 0.76],
    lift: 0.008,
  });
  b.sweep(goldTorqueLoop, 0.009, {
    bone: chestJoint,
    color: GOLD_TRIM,
    sides: 8,
    name: "goldCollarTorque",
    group: "collar",
  });

  // Ornate Sacred Suzu Bell at the front of the collar (with hinge joint)
  const bellRoot = b.joint("bellHinge", {
    parent: chestJoint,
    at: [0, 0.67, 0.455],
    dir: [0, -1, 0.15],
    role: "hinge",
    group: "collar",
  });

  // Bell body via lathe
  const bellProfile: OutlinePoint[] = [
    [0, 0],
    [0.018, 0.002],
    [0.038, 0.016],
    [0.044, 0.036],
    [0.040, 0.052, "sharp"],
    [0.046, 0.056, "sharp"],
    [0.040, 0.060, "sharp"],
    [0.034, 0.076],
    [0.016, 0.090],
    [0, 0.094],
  ];
  b.lathe(bellProfile, {
    at: bellRoot.local([0, 0.005, 0]),
    axis: bellRoot.dir([0, 1, 0]),
    bone: bellRoot,
    segments: 12,
    smoothing: 1,
    color: GOLD_TRIM,
    name: "suzuBell",
    group: "collar",
  });

  // Glowing spirit pearl clapper inside/bottom of bell + dark resonating slot
  glow(
    b.part(new THREE.SphereGeometry(0.015, 8, 6), FIRE_CYAN, {
      bone: bellRoot,
      at: bellRoot.local([0, 0.088, 0]),
      name: "bellSpiritCore",
      group: "collar",
    }),
    1.6,
  );
  b.rod(bellRoot.local([-0.036, 0.072, 0.012]), bellRoot.local([0.036, 0.072, 0.012]), 0.006, OBSIDIAN, {
    bone: bellRoot,
    sides: 6,
    name: "bellSlit",
    group: "collar",
  });

  // Two braided crimson tassel cords hanging below the bell
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const tasselCurve = bezier(
      bellRoot.local([s * 0.012, 0.085, -0.005]),
      bellRoot.local([s * 0.038, 0.13, 0.01]),
      bellRoot.local([s * 0.052, 0.19, -0.01]),
      bellRoot.local([s * 0.045, 0.24, -0.025]),
    );
    b.sweep(tasselCurve, (t) => (t < 0.65 ? 0.007 : 0.016 * (1 - (t - 0.65) * 1.8)), {
      bone: bellRoot,
      bands: [
        [0.62, CRIMSON],
        [0.72, GOLD],
        [1, CRIMSON],
      ],
      caps: { start: "round", end: "point" },
      sides: 6,
      name: `bellTassel${side}`,
      group: "collar",
    });
  }

  // Sacred Jade Magatama (comma jewels) & Gold Beads along the collar
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    for (let i = 0; i < 3; i++) {
      const ang = (32 + i * 38) * DEG;
      const mx = s * Math.sin(ang) * 0.135;
      const my = 0.69 + i * 0.038;
      const mz = 0.31 + Math.cos(ang) * 0.135;

      // Gold mounting bead
      b.part(new THREE.SphereGeometry(0.014, 8, 6), GOLD, {
        bone: chestJoint,
        at: [mx, my, mz],
        name: `collarBead${side}${i + 1}`,
        group: "collar",
      });

      // Curved comma magatama jewel
      const magCurve = bezier(
        [mx, my - 0.012, mz + 0.008],
        [mx + s * 0.018, my - 0.032, mz + 0.018],
        [mx + s * 0.012, my - 0.055, mz + 0.008],
        [mx - s * 0.005, my - 0.062, mz - 0.002],
      );
      const magSweep = b.sweep(magCurve, (t) => 0.015 * Math.sin(Math.acos(1 - 2 * Math.min(t * 0.92 + 0.04, 0.99))) * (1 - 0.55 * t), {
        bone: chestJoint,
        color: i === 1 ? FIRE_CYAN : JADE,
        caps: { start: "round", end: "point" },
        sides: 8,
        name: `magatama${side}${i + 1}`,
        group: "collar",
      });
      if (i === 1) glow(magSweep, 1.3);
    }
  }

  // Hanging paper Shide (zig-zag shrine streamers) around collar
  const shideFrames = ([-1, 1] as const).flatMap((s) => [
    frame([s * 0.095, 0.68, 0.41], [0, 1, 0]),
    frame([s * 0.145, 0.72, 0.31], [0, 1, 0]),
  ]);
  b.cards(shideFrames, SHIDE_TEX, {
    bone: chestJoint,
    size: [0.048, 0.125],
    lean: 168,
    flow: (f) => [f.at.x * 2, 0, 1],
    bend: 14,
    name: "collarShideCards",
    group: "collar",
  });

  // Ornate Dorsal Shrine Saddle / Capelet Ribbon over back and haunches
  const backRibbonLoop = catmull(
    [
      [0, 0.74, 0.24],
      [0.125, 0.66, 0.08],
      [0.115, 0.65, -0.18],
      [0, 0.73, -0.32],
      [-0.115, 0.65, -0.18],
      [-0.125, 0.66, 0.08],
    ],
    { closed: true },
  );
  b.sweep(bodySurf.drape(backRibbonLoop, { lift: 0.007 }), 0.011, {
    bone: [hips, spine],
    color: GOLD_TRIM,
    sides: 6,
    name: "dorsalGoldCord",
    group: "collar",
  });

  // ---------------------------------------------------------------------------
  // 4. Head, Snout, Jaw, Anime Eyes, Whiskers, Horns/Crest & Ears
  // ---------------------------------------------------------------------------
  // Sculpted fox cranium
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), HEAD_PAINT, {
    bone: head,
    at: head.local([0, 0.02, 0.012]),
    dir: head.dir([0, 1, 0]),
    scale: [0.096, 0.092, 0.084],
    name: "skull",
    group: "head",
  });

  // Cheekbone ruffs (4 pointed cheek tufts per side for sharp anime fox silhouette)
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    for (let k = 0; k < 3; k++) {
      const yOff = 0.018 - k * 0.022;
      const zOff = 0.005 - k * 0.015;
      const len = 0.095 - k * 0.015;
      const cheekCurve = bezier(
        head.local([s * 0.062, zOff, yOff]),
        head.local([s * (0.095 + len * 0.5), zOff - 0.015, yOff - 0.005]),
        head.local([s * (0.085 + len), zOff - 0.048, yOff - 0.018]),
      );
      b.sweep(cheekCurve, (t) => [0.028 * (1 - 0.85 * t), 0.018 * (1 - 0.85 * t)], {
        bone: head,
        bands:
          k === 0
            ? [
                [0.68, IVORY],
                [1, CRIMSON],
              ]
            : [[1, IVORY]],
        caps: { start: "round", end: "point" },
        sides: 6,
        name: `cheekTuft${side}${k + 1}`,
        group: "head",
      });
    }
  }

  // Tapered Fox Upper Snout / Muzzle Bridge
  const snoutPath = catmull([
    head.local([0, 0.042, 0.008]),
    head.local([0, 0.115, -0.004]),
    head.local([0, 0.178, -0.014]),
  ]);
  b.sweep(
    snoutPath,
    (t) => [0.056 * (1 - 0.54 * t), 0.044 * (1 - 0.52 * t)],
    {
      bone: snout,
      color: HEAD_PAINT,
      sectors: [[-42, 42, CRIMSON, 0, 0.65]],
      caps: { start: "round", end: "round" },
      sides: 10,
      name: "upperSnout",
      group: "head",
    },
  );

  // Delicate dark nose button at tip of snout
  const noseTip = head.local([0, 0.194, -0.01]);
  b.part(new THREE.SphereGeometry(0.016, 8, 6), OBSIDIAN, {
    bone: snout,
    at: noseTip,
    scale: [1.15, 0.78, 0.9],
    name: "nose",
    group: "head",
  });

  // Upper fangs peeking beneath the snout
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.spike(
      head.local([s * 0.022, 0.145, -0.028]),
      head.dir([0, 0.1, -1]),
      0.022,
      0.0055,
      IVORY,
      { bone: snout, sides: 6, name: `upperFang${side}`, group: "head" },
    );
  }

  // Mystical Whisker Streamers (long flowing gold-tipped spirit whiskers from muzzle)
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const whiskerCurve = bezier(
      head.local([s * 0.028, 0.155, -0.016]),
      head.local([s * 0.095, 0.135, -0.025]),
      head.local([s * 0.155, 0.045, -0.045]),
      head.local([s * 0.195, -0.055, -0.02]),
    );
    b.sweep(whiskerCurve, [0.006, 0.0015], {
      bone: snout,
      bands: [
        [0.55, CRIMSON],
        [0.82, GOLD],
        [1, FIRE_CYAN],
      ],
      caps: { start: "round", end: "point" },
      sides: 6,
      name: `spiritWhisker${side}`,
      group: "head",
    });
  }

  // Lower Jaw, Pink Tongue & Lower Fangs
  const jawPath = catmull([
    jaw.local([0, 0.005, 0]),
    jaw.local([0, 0.068, 0.002]),
    jaw.local([0, 0.125, 0.006]),
  ]);
  b.sweep(
    jawPath,
    (t) => [0.042 * (1 - 0.56 * t), 0.024 * (1 - 0.52 * t)],
    {
      bone: jaw,
      color: CREAM,
      sectors: [[-65, 65, SAKURA, 0.1, 0.9]],
      caps: { start: "round", end: "round" },
      sides: 8,
      name: "lowerJaw",
      group: "head",
    },
  );

  // Tongue inside lower jaw
  b.capsule(jaw.local([0, 0.035, 0.012]), jaw.local([0, 0.108, 0.014]), [0.018, 0.012], CRIMSON, {
    bone: jaw,
    sides: 8,
    name: "tongue",
    group: "head",
  });

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.spike(
      jaw.local([s * 0.016, 0.105, 0.014]),
      jaw.dir([0, 0.15, 1]),
      0.016,
      0.0045,
      IVORY,
      { bone: jaw, sides: 6, name: `lowerFang${side}`, group: "head" },
    );
  }

  // Big Shiny Anime Eyes conformed onto skull with b.decal + Sculpted Kabuki Flame Brows
  const skullSurf = b.surface(skull);
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const eyeHit = skullSurf.around(skull.at).at(s * 42, 8);
    if (eyeHit) {
      b.decal(skullSurf, EYE_TEX, {
        at: eyeHit,
        size: [0.068, 0.088],
        mirror: s > 0,
        bone: head,
        name: `animeEye${side}`,
        group: "head",
      });
    }

    // Sweeping sculpted crimson & gold kabuki spirit brow ridge above each eye
    const browCurve = bezier(
      head.local([s * 0.022, 0.058, 0.056]),
      head.local([s * 0.062, 0.045, 0.082]),
      head.local([s * 0.105, 0.008, 0.095]),
      head.local([s * 0.135, -0.045, 0.118]),
    );
    b.sweep(browCurve, (t) => [0.013 * (1 - 0.65 * t), 0.009 * (1 - 0.65 * t)], {
      bone: head,
      bands: [
        [0.65, CRIMSON],
        [1, GOLD],
      ],
      caps: { start: "round", end: "point" },
      sides: 6,
      name: `kabukiBrow${side}`,
      group: "head",
    });
  }

  // Celestial Golden Forehead Diadem & Glowing Third-Eye Jewel
  const diademArc = catmull([
    head.local([0.065, 0.025, 0.068]),
    head.local([0.032, 0.052, 0.072]),
    head.local([0, 0.062, 0.064]),
    head.local([-0.032, 0.052, 0.072]),
    head.local([-0.065, 0.025, 0.068]),
  ]);
  b.sweep(diademArc, [0.005, 0.008, 0.005], {
    bone: head,
    color: GOLD_TRIM,
    sides: 6,
    name: "foreheadDiadem",
    group: "head",
  });

  // Central forehead crescent horn & glowing cyan spirit gem
  glow(
    b.part(new THREE.OctahedronGeometry(0.016, 0), FIRE_CYAN, {
      bone: head,
      at: head.local([0, 0.066, 0.074]),
      scale: [0.75, 1.35, 0.55],
      flat: true,
      name: "foreheadSpiritGem",
      group: "head",
    }),
    1.8,
  );

  // Crown hair tuft between the ears
  for (const offsetX of [-0.018, 0, 0.018]) {
    const tuftCurve = bezier(
      head.local([offsetX, -0.01, 0.078]),
      head.local([offsetX * 1.4, -0.045, 0.135]),
      head.local([offsetX * 1.8, -0.095, 0.155]),
    );
    b.sweep(tuftCurve, [0.016, 0.002], {
      bone: head,
      bands: [
        [0.7, IVORY],
        [1, CRIMSON],
      ],
      caps: { start: "round", end: "point" },
      sides: 6,
      name: `crownTuft_${offsetX}`,
      group: "head",
    });
  }

  // Sculpted Fox Ears (outer shell, sakura inner hollow, crimson-black tips, gold ear cuffs & bells)
  const EAR_PAINT = cel(
    paint((_p, _n, s) => {
      const t = s[0];
      const deg = s[1];
      if (t > 0.72 + 0.06 * zigzag(deg / 45)) return OBSIDIAN_HEX;
      if (t > 0.54 + 0.06 * zigzag(deg / 45)) return CRIMSON_HEX;
      // Front concave inner ear
      if (deg > 115 && deg < 245 && t > 0.08 && t < 0.78) return SAKURA_HEX;
      return IVORY_HEX;
    }),
  );

  for (const { s, side, chain } of earChains) {
    b.sweep(
      chain,
      (t) => [0.046 * Math.sin(Math.min(1, t * 1.45) * Math.PI * 0.65) * (1 - 0.55 * t) + 0.006, 0.022 * (1 - 0.65 * t) + 0.004],
      {
        color: EAR_PAINT,
        caps: { start: "round", end: "point" },
        sides: 8,
        name: `earMesh${side}`,
        group: `ear${side}`,
      },
    );

    // Inner ear fluff spikes emerging from ear base
    const earBase = chain.joints[0];
    const earMid = chain.joints[1];
    b.spike(
      earBase.local([0, 0.02, 0.015]),
      earBase.dir([s * 0.15, 0.85, 0.45]),
      0.085,
      0.016,
      CREAM,
      { bone: earBase, sides: 6, name: `earFluff${side}`, group: `ear${side}` },
    );

    // Ornate Gold Shrine Ear Cuff & Dangling Crimson Tassel on each ear
    const cuffCenter = earMid.at;
    const cuffRing = b.ring(earMid, { count: 8, radius: 0.028 });
    b.sweep(catmull(cuffRing.items, { closed: true }), 0.0055, {
      bone: earMid,
      color: GOLD_TRIM,
      sides: 6,
      name: `earGoldCuff${side}`,
      group: `ear${side}`,
    });

    // Hanging glowing spirit droplet from ear cuff
    const dropPos = offset(cuffCenter, [s * 0.35, -1, 0], 0.042);
    glow(
      b.spike(
        offset(cuffCenter, [s * 0.35, -0.3, 0], 0.022),
        dropPos,
        null,
        0.009,
        FIRE_CYAN,
        { bone: earMid, sides: 6, name: `earSpiritDrop${side}`, group: `ear${side}` },
      ),
      1.5,
    );
  }

  // ---------------------------------------------------------------------------
  // 5. Four Legs (IK Digitigrade Anatomy, 3 Toes per Foot, Spirit Fetlocks & Anklets)
  // ---------------------------------------------------------------------------
  const pawR = 0.026;

  // Front legs (shoulder -> elbow -> wrist -> frontPaw)
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const shoulderAt: [number, number, number] = [s * 0.105, 0.62, 0.28];
    const pawTarget: [number, number, number] = [s * 0.115, pawR, 0.31];
    const frontPts = limb(
      shoulderAt,
      pawTarget,
      [0.23, 0.22, 0.17],
      [
        [0, 0, -1], // elbow bends back
        [0, 0, 1],  // wrist bends forward
      ],
    );

    const legF = b.chain(`legF${side}`, frontPts, {
      parent: chestJoint,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `pawF${side}`],
      role: "leg",
      contact: [pawTarget[0], 0, pawTarget[2]],
      group: `legF${side}`,
    });

    b.sweep(
      legF,
      (t) => {
        const w = 0.056 * (1 - 0.52 * t) + 0.009 * Math.sin(t * Math.PI * 2);
        return [w * 0.92, w * 1.08];
      },
      {
        color: LEG_PAINT,
        caps: { start: "round", end: "round" },
        sides: 10,
        name: `legFMesh${side}`,
        group: `legF${side}`,
      },
    );

    // Elbow & wrist flame-shaped fetlock feathering
    const elbowJ = legF.joints[1];
    const wristJ = legF.joints[2];
    const pawJ = legF.joints[3];

    for (let f = 0; f < 3; f++) {
      const fCurve = bezier(
        elbowJ.local([0, 0.02 + f * 0.04, -0.022]),
        elbowJ.local([s * 0.015, 0.05 + f * 0.04, -0.075]),
        elbowJ.local([s * 0.02, 0.09 + f * 0.035, -0.115]),
      );
      b.sweep(fCurve, [0.016, 0.002], {
        bone: elbowJ,
        bands: [
          [0.6, IVORY],
          [0.85, CRIMSON],
          [1, GOLD],
        ],
        caps: { start: "round", end: "point" },
        sides: 6,
        name: `fetlockF${side}${f + 1}`,
        group: `legF${side}`,
      });
    }

    // Golden shrine anklet ring around wrist
    const ankletRing = b.ring(wristJ.moved([0, 0.06, 0]), { count: 10, radius: 0.034 });
    b.sweep(catmull(ankletRing.items, { closed: true }), 0.007, {
      bone: wristJ,
      color: GOLD_TRIM,
      sides: 6,
      name: `ankletF${side}`,
      group: `legF${side}`,
    });

    // 3 articulated digit joints + sculpted toes + gold claws on front paw
    for (let d = -1; d <= 1; d++) {
      const toeName = `toeF${side}${d + 2}`;
      const yaw = d * 20 * DEG;
      const dx = Math.sin(yaw) * 0.046;
      const dz = Math.cos(yaw) * 0.052;
      const toeStart: [number, number, number] = [pawTarget[0] + dx * 0.45, pawR * 0.95, pawTarget[2] + dz * 0.35];
      const toeEnd: [number, number, number] = [pawTarget[0] + dx, pawR * 0.72, pawTarget[2] + dz];

      const toeJ = b.joint(toeName, {
        parent: pawJ,
        at: toeStart,
        aim: toeEnd,
        role: "digit",
        group: `legF${side}`,
      });

      b.capsule(toeStart, toeEnd, [0.017, 0.014], OBSIDIAN, {
        bone: toeJ,
        sides: 6,
        name: `${toeName}Mesh`,
        group: `legF${side}`,
      });

      b.spike(
        toeEnd,
        [Math.sin(yaw) * 0.5, -0.15, Math.cos(yaw)],
        0.022,
        0.006,
        GOLD,
        { bone: toeJ, sides: 5, name: `${toeName}Claw`, group: `legF${side}` },
      );
    }
  }

  // Hind legs (hip -> knee -> hock -> hindPaw)
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const hipAt: [number, number, number] = [s * 0.102, 0.59, -0.23];
    const pawTarget: [number, number, number] = [s * 0.122, pawR, -0.25];
    const hindPts = limb(
      hipAt,
      pawTarget,
      [0.24, 0.23, 0.19],
      [
        [0, 0, 1],  // knee bends forward
        [0, 0, -1], // hock bends backward (classic fox digitigrade)
      ],
    );

    const legH = b.chain(`legH${side}`, hindPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `pawH${side}`],
      role: "leg",
      contact: [pawTarget[0], 0, pawTarget[2]],
      group: `legH${side}`,
    });

    b.sweep(
      legH,
      (t) => {
        const w = 0.068 * (1 - 0.58 * t) + 0.012 * Math.sin(t * Math.PI);
        return [w * 0.88, w * 1.15];
      },
      {
        color: LEG_PAINT,
        caps: { start: "round", end: "round" },
        sides: 10,
        name: `legHMesh${side}`,
        group: `legH${side}`,
      },
    );

    const thighJ = legH.joints[0];
    const hockJ = legH.joints[2];
    const pawJ = legH.joints[3];

    // Haunch / hock sweeping fur flares
    for (let f = 0; f < 3; f++) {
      const fCurve = bezier(
        thighJ.local([s * 0.025, 0.08 + f * 0.045, -0.025]),
        thighJ.local([s * 0.055, 0.12 + f * 0.045, -0.085]),
        thighJ.local([s * 0.045, 0.17 + f * 0.04, -0.135]),
      );
      b.sweep(fCurve, [0.022, 0.003], {
        bone: thighJ,
        bands: [
          [0.62, IVORY],
          [0.86, CRIMSON],
          [1, GOLD],
        ],
        caps: { start: "round", end: "point" },
        sides: 6,
        name: `haunchTuft${side}${f + 1}`,
        group: `legH${side}`,
      });
    }

    // Golden shrine anklet ring around hock cannon
    const ankletRing = b.ring(hockJ.moved([0, 0.07, 0]), { count: 10, radius: 0.032 });
    b.sweep(catmull(ankletRing.items, { closed: true }), 0.007, {
      bone: hockJ,
      color: GOLD_TRIM,
      sides: 6,
      name: `ankletH${side}`,
      group: `legH${side}`,
    });

    // 3 articulated digit joints + sculpted toes + gold claws on hind paw
    for (let d = -1; d <= 1; d++) {
      const toeName = `toeH${side}${d + 2}`;
      const yaw = d * 20 * DEG;
      const dx = Math.sin(yaw) * 0.046;
      const dz = Math.cos(yaw) * 0.052;
      const toeStart: [number, number, number] = [pawTarget[0] + dx * 0.45, pawR * 0.95, pawTarget[2] + dz * 0.35];
      const toeEnd: [number, number, number] = [pawTarget[0] + dx, pawR * 0.72, pawTarget[2] + dz];

      const toeJ = b.joint(toeName, {
        parent: pawJ,
        at: toeStart,
        aim: toeEnd,
        role: "digit",
        group: `legH${side}`,
      });

      b.capsule(toeStart, toeEnd, [0.017, 0.014], OBSIDIAN, {
        bone: toeJ,
        sides: 6,
        name: `${toeName}Mesh`,
        group: `legH${side}`,
      });

      b.spike(
        toeEnd,
        [Math.sin(yaw) * 0.5, -0.15, Math.cos(yaw)],
        0.022,
        0.006,
        GOLD,
        { bone: toeJ, sides: 5, name: `${toeName}Claw`, group: `legH${side}` },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // 6. Nine Celestial Tails + Spirit Flames & Gold Tail Rings
  // ---------------------------------------------------------------------------
  // Arranged in an iconic, radiant high-fantasy anime peacock fan behind the rump:
  // Every tail has 4 articulated joints, dramatic S-curve flow, ornate gold base ring,
  // crimson-and-gold tip bands, and a multi-layered glowing cyan/violet foxfire crown at the tip.
  type TailSpec = {
    idx: number;
    sideSign: number; // +1 left, -1 right, 0 center
    azDeg: number;    // fan spread angle around rump
    elevDeg: number;  // vertical lift angle
    len: number;      // arc length scale
    maxR: number;     // plush fox tail thickness
    curlX: number;
    curlY: number;
  };

  const tailSpecs: TailSpec[] = [
    // Center Sovereign Tail (highest, longest)
    { idx: 1, sideSign: 0, azDeg: 0, elevDeg: 64, len: 0.96, maxR: 0.118, curlX: 0.0, curlY: 0.22 },
    // Inner Upper Pair
    { idx: 2, sideSign: 1, azDeg: 24, elevDeg: 54, len: 0.92, maxR: 0.110, curlX: 0.08, curlY: 0.18 },
    { idx: 3, sideSign: -1, azDeg: -24, elevDeg: 54, len: 0.92, maxR: 0.110, curlX: -0.08, curlY: 0.18 },
    // Mid Fan Pair
    { idx: 4, sideSign: 1, azDeg: 48, elevDeg: 40, len: 0.88, maxR: 0.105, curlX: 0.14, curlY: 0.15 },
    { idx: 5, sideSign: -1, azDeg: -48, elevDeg: 40, len: 0.88, maxR: 0.105, curlX: -0.14, curlY: 0.15 },
    // Outer Sweeping Pair
    { idx: 6, sideSign: 1, azDeg: 72, elevDeg: 24, len: 0.84, maxR: 0.100, curlX: 0.18, curlY: 0.14 },
    { idx: 7, sideSign: -1, azDeg: -72, elevDeg: 24, len: 0.84, maxR: 0.100, curlX: -0.18, curlY: 0.14 },
    // Low Flanking Pair (kept well clear of y = 0 floor, sweeping out and curling skyward)
    { idx: 8, sideSign: 1, azDeg: 94, elevDeg: 8, len: 0.78, maxR: 0.094, curlX: 0.16, curlY: 0.20 },
    { idx: 9, sideSign: -1, azDeg: -94, elevDeg: 8, len: 0.78, maxR: 0.094, curlX: -0.16, curlY: 0.20 },
  ];

  // Decorative Sacred Tail-Root Lotus / Gold Shrine Clasp on the rump
  const rumpRosette = b.ring(frame([0, 0.65, -0.37], [0, 0.35, -1]), { count: 9, radius: 0.068 });
  for (const item of rumpRosette.items) {
    b.spike(item, item, 0.075, 0.024, GOLD_TRIM, {
      bone: rump,
      sides: 6,
      group: "tailCrown",
    });
  }

  const flameTipFrames: ReturnType<typeof frame>[] = [];

  for (const spec of tailSpecs) {
    const az = spec.azDeg * DEG;
    const el = spec.elevDeg * DEG;

    // Ensure strict left/right x separation for side derivation ("L", "R", "C")
    const rootX = spec.sideSign * (0.018 + Math.abs(Math.sin(az)) * 0.055);
    const rootY = 0.63 + Math.sin(el) * 0.035;
    const rootZ = -0.36 - Math.cos(az) * 0.025;

    const dirX = Math.sin(az) * Math.cos(el);
    const dirY = Math.sin(el);
    const dirZ = -Math.cos(az) * Math.cos(el);

    const p0: [number, number, number] = [rootX, rootY, rootZ];
    const p1: [number, number, number] = [
      rootX + dirX * spec.len * 0.30,
      rootY + dirY * spec.len * 0.26 - 0.02,
      rootZ + dirZ * spec.len * 0.30,
    ];
    const p2: [number, number, number] = [
      rootX + dirX * spec.len * 0.64 + spec.curlX * 0.45,
      Math.max(0.32, rootY + dirY * spec.len * 0.56 + spec.curlY * 0.45),
      rootZ + dirZ * spec.len * 0.62,
    ];
    const p3: [number, number, number] = [
      rootX + dirX * spec.len * 0.90 + spec.curlX * 0.85,
      Math.max(0.42, rootY + dirY * spec.len * 0.84 + spec.curlY * 0.95),
      rootZ + dirZ * spec.len * 0.82 + 0.05,
    ];
    const p4: [number, number, number] = [
      rootX + dirX * spec.len * 1.02 + spec.curlX,
      Math.max(0.50, rootY + dirY * spec.len * 1.0 + spec.curlY * 1.35),
      rootZ + dirZ * spec.len * 0.90 + 0.12,
    ];

    const tName = `tail${spec.idx}`;
    const tailChain = b.chain(tName, catmull([p0, p1, p2, p3, p4]), {
      parent: rump,
      names: [`${tName}_1`, `${tName}_2`, `${tName}_3`, `${tName}_4`],
      role: "tail",
      group: tName,
    });

    // Plush teardrop tail profile: narrow root -> plump mid-belly -> pointed flame-wick tip
    const tailSweep = b.sweep(
      tailChain,
      (t) => {
        const envelope = Math.sin(Math.pow(t, 0.68) * Math.PI);
        const r = spec.maxR * envelope + 0.024 * (1 - t);
        return [r * 0.92, r * 1.08];
      },
      {
        color: TAIL_PAINT,
        caps: { start: "round", end: "point" },
        sides: 10,
        name: `${tName}Mesh`,
        group: tName,
      },
    );

    // Ornate Gold Shrine Ring clasping the base of every tail
    const baseRing = b.ring(tailChain.at(0.10), { count: 8, radius: spec.maxR * 0.44 });
    b.sweep(catmull(baseRing.items, { closed: true }), 0.0085, {
      bone: tailChain.joints[0],
      color: GOLD_TRIM,
      sides: 6,
      name: `${tName}GoldRing`,
      group: tName,
    });

    // Sculpted side fur barbs along the mid-outer curve of each tail for anime silhouette richness
    for (const barbT of [0.42, 0.64]) {
      const surfPt = tailSweep.at(barbT, spec.sideSign >= 0 ? 75 : -75, -0.006);
      const barbCurve = bezier(
        surfPt.at,
        offset(surfPt.at, surfPt.tangent, 0.065).addScaledVector(surfPt.n, 0.032),
        offset(surfPt.at, surfPt.tangent, 0.135).addScaledVector(surfPt.n, 0.018),
      );
      b.sweep(barbCurve, [0.022, 0.002], {
        bone: surfPt.bone,
        bands: [
          [0.65, IVORY],
          [1, CRIMSON],
        ],
        caps: { start: "round", end: "point" },
        sides: 6,
        name: `${tName}Barb_${Math.round(barbT * 100)}`,
        group: tName,
      });
    }

    // Glowing Spirit Flame Crown (Foxfire / Kitsunebi) igniting from the tip of each tail
    const tipJoint = tailChain.joints[tailChain.joints.length - 1];
    const tipEnd = tailChain.at(1);
    const tang = tipEnd.tangent.clone().normalize();
    const flameTip = offset(tipEnd.at, [tang.x * 0.6, Math.max(0.55, tang.y + 0.5), tang.z * 0.6], 0.16);

    // Outer violet-cyan spirit flame tongue
    const outerFlameCurve = bezier(
      offset(tipEnd.at, tang, -0.04),
      offset(tipEnd.at, tang, 0.05),
      lerpVec(tipEnd.at, flameTip, 0.65),
      flameTip,
    );
    glow(
      b.sweep(
        outerFlameCurve,
        (t) => 0.042 * Math.sin(Math.pow(t, 0.6) * Math.PI) + 0.012 * (1 - t),
        {
          bone: tipJoint,
          bands: [
            [0.35, FIRE_VIOLET],
            [0.78, FIRE_CYAN],
            [1, FIRE_CORE],
          ],
          caps: { start: "round", end: "point" },
          sides: 8,
          name: `${tName}SpiritFlame`,
          group: tName,
        },
      ),
      1.7,
    );

    // Two curling secondary flame wisps around the tail tip
    for (const wSign of [1, -1] as const) {
      const wispStart = offset(tipEnd.at, tang, -0.02);
      const wispEnd = offset(flameTip, [wSign * 0.045, 0.03, 0.02 * wSign], 1);
      const wispCurve = bezier(
        wispStart,
        offset(wispStart, [wSign * 0.055, 0.04, 0], 1),
        wispEnd,
      );
      glow(
        b.sweep(wispCurve, [0.018, 0.002], {
          bone: tipJoint,
          color: wSign > 0 ? FIRE_CYAN : FIRE_GOLD,
          caps: { start: "round", end: "point" },
          sides: 6,
          name: `${tName}FlameWisp_${wSign > 0 ? "A" : "B"}`,
          group: tName,
        }),
        1.5,
      );
    }

    flameTipFrames.push(frame(tipEnd.at, [0, 1, 0]));
  }

  // Crossed spirit-flame aura cards on each tail tip
  glow(
    b.cards(flameTipFrames, SPIRIT_FLAME_TEX, {
      size: [0.09, 0.15],
      lean: 12,
      flow: [0, 1, -0.2],
      cross: true,
      sink: 0.25,
      name: "tailFlameCards",
      group: "foxfire",
    }),
    1.5,
  );

  // ---------------------------------------------------------------------------
  // 7. Orbiting Kitsunebi Spirit Orbs (Sculpted Swirling Will-o'-Wisps)
  // ---------------------------------------------------------------------------
  // 6 celestial foxfire orbs orbiting the kitsune's shoulders and nine-tailed halo,
  // attached to their nearest torso/tail bones so they move naturally in flex shots.
  const orbConfigs: Array<{
    name: string;
    bone: typeof chestJoint;
    pos: [number, number, number];
    scale: number;
    coreColor: string;
    tailColor: string;
  }> = [
    {
      name: "kitsunebiShoulderL",
      bone: chestJoint,
      pos: [0.26, 0.84, 0.28],
      scale: 1.05,
      coreColor: FIRE_CORE,
      tailColor: FIRE_CYAN,
    },
    {
      name: "kitsunebiShoulderR",
      bone: chestJoint,
      pos: [-0.26, 0.84, 0.28],
      scale: 1.05,
      coreColor: FIRE_CORE,
      tailColor: FIRE_CYAN,
    },
    {
      name: "kitsunebiFlankL",
      bone: hips,
      pos: [0.29, 0.76, -0.06],
      scale: 0.9,
      coreColor: FIRE_GOLD,
      tailColor: FIRE_VIOLET,
    },
    {
      name: "kitsunebiFlankR",
      bone: hips,
      pos: [-0.29, 0.76, -0.06],
      scale: 0.9,
      coreColor: FIRE_GOLD,
      tailColor: FIRE_VIOLET,
    },
    {
      name: "kitsunebiCrownL",
      bone: rump,
      pos: [0.22, 1.12, -0.32],
      scale: 1.15,
      coreColor: FIRE_CORE,
      tailColor: FIRE_TEAL,
    },
    {
      name: "kitsunebiCrownR",
      bone: rump,
      pos: [-0.22, 1.12, -0.32],
      scale: 1.15,
      coreColor: FIRE_CORE,
      tailColor: FIRE_TEAL,
    },
  ];

  for (const orb of orbConfigs) {
    const [ox, oy, oz] = orb.pos;
    const r = 0.032 * orb.scale;

    // Bright glowing spirit core sphere
    glow(
      b.part(new THREE.SphereGeometry(r, 10, 8), orb.coreColor, {
        bone: orb.bone,
        at: [ox, oy, oz],
        name: `${orb.name}Core`,
        group: "foxfire",
      }),
      2.0,
    );

    // Swirling teardrop flame tongue rising from the orb
    const mainFlame = bezier(
      [ox, oy - r * 0.4, oz],
      [ox + (ox > 0 ? 0.025 : -0.025), oy + r * 1.4, oz - 0.015],
      [ox - (ox > 0 ? 0.018 : -0.018), oy + r * 3.1, oz + 0.01],
      [ox, oy + r * 4.4, oz - 0.01],
    );
    glow(
      b.sweep(
        mainFlame,
        (t) => r * 1.18 * (1 - t * 0.88) * Math.sin(Math.min(1, t * 2.2) * Math.PI * 0.5 + 0.3),
        {
          bone: orb.bone,
          bands: [
            [0.45, orb.tailColor],
            [0.82, FIRE_VIOLET],
            [1, FIRE_CORE],
          ],
          caps: { start: "round", end: "point" },
          sides: 8,
          name: `${orb.name}Plume`,
          group: "foxfire",
        },
      ),
      1.6,
    );

    // Spiralling gold-cyan energy ribbon coiling around the orb
    const coilPts: [number, number, number][] = [];
    for (let k = 0; k <= 8; k++) {
      const u = k / 8;
      const a = u * Math.PI * 2.4 + (ox > 0 ? 0 : Math.PI);
      const rad = r * (1.35 * (1 - 0.55 * u));
      coilPts.push([
        ox + Math.cos(a) * rad,
        oy - r * 0.6 + u * r * 3.6,
        oz + Math.sin(a) * rad,
      ]);
    }
    glow(
      b.sweep(catmull(coilPts), [0.0065, 0.0015], {
        bone: orb.bone,
        color: FIRE_GOLD,
        caps: { start: "round", end: "point" },
        sides: 6,
        name: `${orb.name}Ribbon`,
        group: "foxfire",
      }),
      1.8,
    );
  }

  // ---------------------------------------------------------------------------
  // 8. Layered Fur Tuft Cards Across Neck, Shoulders, Haunches & Tail Bases
  // ---------------------------------------------------------------------------
  const furHits = bodySurf.scatter(95, {
    rng: rng(42),
    minDist: 0.038,
    filter: (h) => h.n.y > -0.15 && h.at.y > 0.54,
  });
  b.cards(furHits, [FUR_CARD_TEX, FUR_CARD_TEX, CRIMSON_TUFT_TEX], {
    size: [0.036, 0.078],
    lean: 68,
    bend: 24,
    vary: 0.25,
    spin: 16,
    rng: rng(108),
    flow: [0, -0.15, -1],
    name: "bodyFurCards",
    group: "furCards",
  });

  return b.root;
}

function lerpVec(a: THREE.Vector3 | readonly number[], b: THREE.Vector3 | readonly number[], t: number): THREE.Vector3 {
  const va = vec(a);
  const vb = vec(b);
  return new THREE.Vector3(
    va.x + (vb.x - va.x) * t,
    va.y + (vb.y - va.y) * t,
    va.z + (vb.z - va.z) * t,
  );
}
