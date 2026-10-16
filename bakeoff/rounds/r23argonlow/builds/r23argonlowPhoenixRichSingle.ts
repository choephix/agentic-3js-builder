import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame, line } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { lerp, offset, rng, vec } from "../../../../src/math";
import type { V3 } from "../../../../src/math";
import { countershade, gradient, mix, noise, paint, scales, smoothstep, stripes } from "../../../../src/paint";
import { bezier, catmull, polyline } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, furEdge, INK, inkLines, zigzag } from "../../../../kits/toon";

export const meta = {
  name: "Solar Pyro Phoenix",
  description:
    "Genshin Impact style sacred flame phoenix with spread celestial wings, ornate gold filigree regalia, Pyro vision medallions, and trailing fire plumage.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "phoenix", detail: 1, paintSize: 2048 });
  const rand = rng(707);

  // ---------------------------------------------------------------------------
  // PALETTE & GENSHIN CEL-SHADED PAINTS
  // ---------------------------------------------------------------------------
  // Flat emissive / gold / ink strings
  const GOLD_FLAT = "#f6c957";
  const GOLD_PALE = "#fff1a8";
  const GOLD_DARK_HEX = "#9c6218";
  const CRIMSON_HEX = "#c91e28";
  const VERMILION_HEX = "#f24822";
  const ORANGE_HEX = "#ff851b";
  const AMBER_HEX = "#ffbe2e";
  const SOLAR_WHITE = "#fff9dc";
  const RUBY_DARK = "#590d22";
  const EMBER_DARK = "#36111c";
  const PYRO_GLOW = "#ff6d1f";
  const PYRO_CORE = "#ffe869";
  const TEAL_GEM = "#2ee6d6"; // Sacred contrast jewel accent common in Liyue/Inazuma regalia

  // Cel paints
  const GOLD = cel(GOLD_FLAT, "#b5761e");
  const GOLD_BRIGHT = cel(GOLD_PALE, "#d4982a");
  const GOLD_BRONZE = cel("#b87d28", "#6e4310");
  const OBSIDIAN = cel("#2e1824", "#160a12");
  const RUBY = cel("#8c1428", "#470816");

  // Sacred breast & belly cream-gold with warm apricot shadow
  const CREAM_SILK = cel("#fff5d6", "#f2c288");

  // Main body flame coat: vermilion back to luminous gold-cream belly with zig-zag feather edge & ink
  const dorsalCoatBase = paint((p, n) => {
    const wave = zigzag(p.z / 0.045 + Math.abs(p.x) * 4);
    const h = p.y + wave * 0.05;
    if (h > 1.26) return CRIMSON_HEX;
    if (h > 1.05) return VERMILION_HEX;
    return ORANGE_HEX;
  });

  const BODY_PLUMAGE = cel(
    furEdge(dorsalCoatBase, "#fff3cc", {
      level: -0.08,
      teeth: 0.28,
      period: 0.036,
      along: [0, 0, 1],
      ink: INK,
      inkWidth: 0.055,
    }),
  );

  // Neck & Collar transition paint with ornate scalloped layering
  const NECK_PLUMAGE = cel(
     paint((p, n, s) => {
      const ringWave = zigzag((s[1] / 360) * 8);
      const t = s[0] + ringWave * 0.06;
      if (t < 0.28) return "#fff3cc";
      if (t < 0.31) return GOLD_FLAT;
      if (t < 0.68) return VERMILION_HEX;
      if (n.y < -0.15) return "#ffe7a3";
      return CRIMSON_HEX;
    }),
  );

  // Head & Cheek paint: fierce crimson crown with bright golden-white facial mask
  const HEAD_PLUMAGE = cel(
    furEdge(CRIMSON_HEX, "#fff4cf", {
      axis: [0, 0.7, 0.7],
      level: 0.08,
      teeth: 0.22,
      period: 0.025,
      along: [1, 0, 0],
      ink: INK,
      inkWidth: 0.05,
    }),
  );

  // Beak paint: ivory-gold tip to dark obsidian-ruby base with cel ink line
  const BEAK_PAINT = cel(
    inkLines(
      gradient(GOLD_PALE, "#c46c1c", [0, 1.52, 0.62], [0, 1.54, 0.38]),
      { levels: [0.15], axis: [0, 1, 0], width: 0.05 },
    ),
  );

  // Wing leading-edge coverts paint: crimson → vermilion → amber with gold filigree trim band
  const WING_COVERT_PAINT = cel(
    paint((p, _n, s) => {
      const featherTooth = zigzag(s[0] * 14) * 0.08;
      const degNorm = Math.abs(((s[1] + 180) % 360) - 180) / 180; // 0 dorsal, 1 ventral
      if (degNorm + featherTooth < 0.38) return CRIMSON_HEX;
      if (degNorm + featherTooth < 0.42) return GOLD_FLAT;
      if (degNorm + featherTooth < 0.72) return VERMILION_HEX;
      return AMBER_HEX;
    }),
  );

  // Wing membrane paint: layered primary & secondary feather gradient (along = span, across = chord)
  const WING_MEMBRANE_PAINT = cel(
    paint((p, _n, s) => {
      const along = s[0];
      const across = s[1];
      const vanes = zigzag(along * 18) * 0.07;
      const c = across + vanes;
      if (c < 0.22) return CRIMSON_HEX;
      if (c < 0.25) return GOLD_FLAT;
      if (c < 0.56) return VERMILION_HEX;
      if (c < 0.59) return INK;
      if (c < 0.84) return ORANGE_HEX;
      return SOLAR_WHITE;
    }),
  );

  // Extruded primary blade paint (uses outline [x, y] coordinates in meters)
  const PRIMARY_BLADE_PAINT = cel(
    paint((p, _n, s) => {
      const u = s[0]; // along feather length (0..0.85)
      const v = s[1]; // across feather width
      const rachisDist = Math.abs(v - 0.01);
      if (rachisDist < 0.004 && u < 0.75) return GOLD_PALE;
      const barbWave = zigzag(u / 0.035) * 0.05;
      const frac = u / 0.75 + barbWave;
      if (frac < 0.32) return CRIMSON_HEX;
      if (frac < 0.35) return GOLD_FLAT;
      if (frac < 0.68) return VERMILION_HEX;
      if (frac < 0.86) return AMBER_HEX;
      return SOLAR_WHITE;
    }),
  );

  // Secondary feather paint (shorter chord)
  const SECONDARY_BLADE_PAINT = cel(
    paint((_p, _n, s) => {
      const u = s[0];
      const v = s[1];
      if (Math.abs(v) < 0.0035 && u < 0.42) return GOLD_FLAT;
      const barbWave = zigzag(u / 0.028) * 0.05;
      const frac = u / 0.46 + barbWave;
      if (frac < 0.38) return VERMILION_HEX;
      if (frac < 0.42) return GOLD_FLAT;
      if (frac < 0.76) return ORANGE_HEX;
      return GOLD_PALE;
    }),
  );

  // Tail ribbon paint: flowing gradient with cloud-scroll gold bands and peacock-eye flame tips
  const TAIL_RIBBON_PAINT = cel(
    paint((_p, _n, s) => {
      const t = s[0];
      const wave = zigzag((s[1] / 360) * 4) * 0.03;
      const u = t + wave;
      if (u < 0.25) return CRIMSON_HEX;
      if (u < 0.27) return GOLD_FLAT;
      if (u < 0.55) return VERMILION_HEX;
      if (u < 0.57) return GOLD_PALE;
      if (u < 0.80) return ORANGE_HEX;
      if (u < 0.82) return INK;
      return AMBER_HEX;
    }),
  );

  // Scaled golden raptor legs
  const TALON_SCALE_PAINT = cel(
    scales([GOLD_FLAT, "#e3a836", "#f7d56e"], "#8f5410", { size: 0.016, width: 0.16, seed: 19 }),
  );

  // ---------------------------------------------------------------------------
  // SVG TEXTURES (Cards, Decals, Emblems, Eyes)
  // ---------------------------------------------------------------------------
  // Fierce golden-amber anime eye with crimson-violet ink and glowing solar iris
  const EYE_TEX = animeEye({
    iris: "#ff6a00",
    irisLight: "#fff380",
    irisDark: "#7a091e",
    ink: INK,
    blush: "#ff4769",
    brow: true,
    size: 512,
  });

  // Ornate Genshin Pyro Flame Feather Card (layered diamond & gold filigree veins + glowing tip)
  const FLAME_FEATHER_CARD = svg(
    `<svg viewBox="0 0 96 192">
      <path d="M48 188 C22 150 10 102 16 54 C20 26 36 10 48 2 C60 10 76 26 80 54 C86 102 74 150 48 188 Z" fill="${INK}"/>
      <path d="M48 182 C26 146 15 102 20 56 C24 30 38 15 48 7 C58 15 72 30 76 56 C81 102 70 146 48 182 Z" fill="${CRIMSON_HEX}"/>
      <path d="M48 152 C30 120 21 84 25 48 C29 26 40 15 48 8 C56 15 67 26 71 48 C75 84 66 120 48 152 Z" fill="${VERMILION_HEX}"/>
      <path d="M48 112 C34 88 27 62 31 38 C34 22 42 14 48 9 C54 14 62 22 65 38 C69 62 62 88 48 112 Z" fill="${AMBER_HEX}"/>
      <path d="M48 68 C39 52 35 36 38 22 C40 14 45 10 48 7 C51 10 56 14 58 22 C61 36 57 52 48 68 Z" fill="${SOLAR_WHITE}"/>
      <path d="M48 180 L48 12" stroke="${GOLD_PALE}" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M48 140 L26 112 M48 140 L70 112 M48 106 L25 78 M48 106 L71 78 M48 72 L30 48 M48 72 L66 48" stroke="${GOLD_FLAT}" stroke-width="2.5" stroke-linecap="round"/>
      <polygon points="48,146 39,132 48,118 57,132" fill="${GOLD_FLAT}"/>
      <polygon points="48,141 42,132 48,123 54,132" fill="${SOLAR_WHITE}"/>
    </svg>`,
    { size: 256 },
  );

  // Glowing Solar Wisp / Spark Card for wing trailing edges and tail plumes
  const SOLAR_WISP_CARD = svg(
    `<svg viewBox="0 0 64 160">
      <path d="M32 156 C16 126 8 92 18 58 C26 32 22 16 32 4 C42 16 38 32 46 58 C56 92 48 126 32 156 Z" fill="${VERMILION_HEX}"/>
      <path d="M32 142 C20 116 14 88 22 58 C28 36 26 20 32 8 C38 20 36 36 42 58 C50 88 44 116 32 142 Z" fill="${AMBER_HEX}"/>
      <path d="M32 116 C25 96 21 74 26 52 C29 36 29 22 32 12 C35 22 35 36 38 52 C43 74 39 96 32 116 Z" fill="${SOLAR_WHITE}"/>
      <polygon points="32,148 25,134 32,120 39,134" fill="${GOLD_PALE}"/>
    </svg>`,
    { size: 256 },
  );

  // Sacred Tail Ocellus (Phoenix Eye Plume Emblem) for tail feather tips
  const OCELLUS_CARD = svg(
    `<svg viewBox="0 0 128 192">
      <path d="M64 188 C24 152 8 104 14 54 C19 22 42 6 64 2 C86 6 109 22 114 54 C120 104 104 152 64 188 Z" fill="${INK}"/>
      <path d="M64 182 C28 148 14 102 19 56 C24 26 44 12 64 7 C84 12 104 26 109 56 C114 102 100 148 64 182 Z" fill="${CRIMSON_HEX}"/>
      <path d="M64 150 C34 120 22 84 26 48 C30 24 46 13 64 9 C82 13 98 24 102 48 C106 84 94 120 64 150 Z" fill="${VERMILION_HEX}"/>
      <ellipse cx="64" cy="68" rx="32" ry="44" fill="${GOLD_FLAT}" stroke="${INK}" stroke-width="3.5"/>
      <ellipse cx="64" cy="66" rx="24" ry="34" fill="${AMBER_HEX}"/>
      <polygon points="64,24 84,66 64,108 44,66" fill="${CRIMSON_HEX}" stroke="${GOLD_PALE}" stroke-width="3"/>
      <polygon points="64,36 76,66 64,96 52,66" fill="${SOLAR_WHITE}"/>
      <circle cx="64" cy="66" r="7" fill="${TEAL_GEM}"/>
      <path d="M64 184 L64 108" stroke="${GOLD_PALE}" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  // Genshin Pyro Elemental Crest / Chest Sigil Decal
  const PYRO_SIGIL_TEX = svg(
    `<svg viewBox="0 0 128 128">
      <polygon points="64,4 120,64 64,124 8,64" fill="${INK}"/>
      <polygon points="64,10 114,64 64,118 14,64" fill="${GOLD_FLAT}"/>
      <polygon points="64,18 106,64 64,110 22,64" fill="${RUBY_DARK}"/>
      <path d="M64 24 C78 44 92 56 86 78 C82 94 72 102 64 104 C56 102 46 94 42 78 C36 56 50 44 64 24 Z" fill="${VERMILION_HEX}" stroke="${GOLD_PALE}" stroke-width="3"/>
      <path d="M64 38 C73 52 80 62 76 76 C73 86 68 92 64 94 C60 92 55 86 52 76 C48 62 55 52 64 38 Z" fill="${AMBER_HEX}"/>
      <polygon points="64,48 73,68 64,86 55,68" fill="${SOLAR_WHITE}"/>
      <circle cx="64" cy="18" r="5" fill="${SOLAR_WHITE}"/>
      <circle cx="64" cy="110" r="5" fill="${SOLAR_WHITE}"/>
      <circle cx="18" cy="64" r="5" fill="${SOLAR_WHITE}"/>
      <circle cx="110" cy="64" r="5" fill="${SOLAR_WHITE}"/>
    </svg>`,
    { size: 256 },
  );

  // Hanging Silk & Gold Filigree Tassel Card
  const TASSEL_CARD = svg(
    `<svg viewBox="0 0 64 192">
      <polygon points="32,4 50,24 32,44 14,24" fill="${GOLD_FLAT}" stroke="${INK}" stroke-width="3"/>
      <polygon points="32,12 42,24 32,36 22,24" fill="${TEAL_GEM}"/>
      <rect x="24" y="42" width="16" height="14" rx="4" fill="${GOLD_PALE}" stroke="${INK}" stroke-width="2.5"/>
      <path d="M26 56 L14 176 L24 186 L32 172 L40 186 L50 176 L38 56 Z" fill="${CRIMSON_HEX}" stroke="${INK}" stroke-width="3"/>
      <path d="M29 56 L22 168 L32 180 L42 168 L35 56 Z" fill="${VERMILION_HEX}"/>
      <path d="M32 56 L32 176 M26 70 L20 166 M38 70 L44 166" stroke="${GOLD_PALE}" stroke-width="2.5" stroke-linecap="round"/>
      <polygon points="32,96 40,112 32,128 24,112" fill="${GOLD_FLAT}"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // 1. SKELETON (Full Creature Rig per GUIDE.md: Spine, Neck, Head, Jaw, Wings, Digits, Legs, Tail, Fan)
  // ---------------------------------------------------------------------------
  // The phoenix stands nobly on its taloned feet at y = 0 with chest raised and massive wings spread wide in a clean rest pose.
  const pelvis = b.joint("pelvis", { at: [0, 0.80, -0.10], dir: [0, 0.45, 0.89], role: "spine", group: "body" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.80, -0.10],
      [0, 0.90, 0.04],
      [0, 1.03, 0.19],
      [0, 1.16, 0.29],
    ]),
    {
      parent: pelvis,
      names: ["spine1", "spine2", "chest"],
      role: "spine",
      group: "body",
    },
  );
  const chest = spine.joints[2];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.16, 0.29],
      [0, 1.29, 0.34],
      [0, 1.43, 0.33],
      [0, 1.54, 0.36],
    ]),
    {
      parent: chest,
      names: ["neck1", "neck2", "neck3"],
      role: "neck",
      group: "neck",
    },
  );
  const neckTop = neck.joints[2];

  const head = b.joint("head", {
    parent: neckTop,
    at: [0, 1.54, 0.36],
    dir: [0, 0.06, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.49, 0.43],
    dir: [0, -0.22, 0.97],
    role: "jaw",
    group: "head",
  });

  // Crown Crest Joint (hinged royal phoenix diadem)
  const crestJoint = b.joint("crest", {
    parent: head,
    at: [0, 1.63, 0.38],
    dir: [0, 0.55, -0.83],
    role: "hinge",
    group: "head",
  });

  // Bilateral Wings, Wing Feather Digits, and Legs
  type SideRig = {
    s: number;
    side: "L" | "R";
    wing: ReturnType<typeof b.chain>;
    wingDigits: ReturnType<typeof b.chain>[];
    leg: ReturnType<typeof b.chain>;
    toes: ReturnType<typeof b.chain>[];
    sideTail: ReturnType<typeof b.chain>;
  };
  const sides: SideRig[] = [];

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";

    // Spread wing chain: shoulder -> elbow -> wrist -> wingTip (4 joints along 3 spans)
    const wingPts: V3[] = [
      [s * 0.16, 1.14, 0.20],
      [s * 0.52, 1.28, 0.08],
      [s * 0.98, 1.44, 0.16],
      [s * 1.58, 1.64, -0.02],
    ];
    const wing = b.chain(`wing${side}`, catmull(wingPts), {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `wingTip${side}`],
      role: "wing",
      group: `wing${side}`,
    });

    // Three articulated primary/secondary feather-finger rays (`role: "digit"`) fanning behind the wing arm
    const wristJ = wing.joints[2];
    const elbowJ = wing.joints[1];

    const d1 = b.chain(
      `wingDigitA${side}`,
      bezier(
        [s * 1.00, 1.42, 0.12],
        [s * 1.38, 1.48, -0.18],
        [s * 1.82, 1.58, -0.50],
      ),
      {
        parent: wristJ,
        names: [`wingDigitA1_${side}`, `wingDigitA2_${side}`],
        role: "digit",
        group: `wing${side}`,
      },
    );

    const d2 = b.chain(
      `wingDigitB${side}`,
      bezier(
        [s * 0.94, 1.39, 0.08],
        [s * 1.24, 1.34, -0.28],
        [s * 1.54, 1.36, -0.68],
      ),
      {
        parent: wristJ,
        names: [`wingDigitB1_${side}`, `wingDigitB2_${side}`],
        role: "digit",
        group: `wing${side}`,
      },
    );

    const d3 = b.chain(
      `wingDigitC${side}`,
      bezier(
        [s * 0.56, 1.26, 0.04],
        [s * 0.78, 1.18, -0.32],
        [s * 1.02, 1.16, -0.68],
      ),
      {
        parent: elbowJ,
        names: [`wingDigitC1_${side}`, `wingDigitC2_${side}`],
        role: "digit",
        group: `wing${side}`,
      },
    );

    // Avian digitigrade leg solved with `limb()` IK landing cleanly at y = 0.022
    const hipPt: V3 = [s * 0.15, 0.76, -0.02];
    const ankleTarget: V3 = [s * 0.18, 0.024, 0.06];
    const legPts = limb(
      hipPt,
      ankleTarget,
      [0.30, 0.32, 0.24],
      [
        [s * 0.04, 0.2, 1],
        [0, 0.1, -1],
      ],
    );
    const leg = b.chain(`leg${side}`, legPts, {
      parent: pelvis,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
      role: "leg",
      contact: [s * 0.18, 0, 0.14],
      group: `leg${side}`,
    });
    const footJ = leg.joints[3];

    // 4 Taloned toes per foot (3 forward, 1 hallux back) resting flat on y = 0..0.024
    const toeSpecs: Array<{ suffix: string; midPt: V3; tipPt: V3 }> = [
      {
        suffix: "Inner",
        midPt: [s * 0.13, 0.020, 0.15],
        tipPt: [s * 0.10, 0.012, 0.24],
      },
      {
        suffix: "Mid",
        midPt: [s * 0.18, 0.020, 0.17],
        tipPt: [s * 0.18, 0.012, 0.28],
      },
      {
        suffix: "Outer",
        midPt: [s * 0.24, 0.020, 0.15],
        tipPt: [s * 0.27, 0.012, 0.24],
      },
      {
        suffix: "Back",
        midPt: [s * 0.18, 0.020, -0.02],
        tipPt: [s * 0.18, 0.012, -0.10],
      },
    ];
    const toes = toeSpecs.map((ts) =>
      b.chain(`toe${ts.suffix}${side}`, [ankleTarget, ts.midPt, ts.tipPt], {
        parent: footJ,
        names: [`toe${ts.suffix}1_${side}`, `toe${ts.suffix}2_${side}`],
        role: "digit",
        group: `leg${side}`,
      }),
    );

    // Sweeping lateral tail ribbon chains (`role: "tail"`)
    const sideTail = b.chain(
      `tailRibbon${side}`,
      catmull([
        [s * 0.11, 0.78, -0.22],
        [s * 0.26, 0.72, -0.58],
        [s * 0.44, 0.56, -0.98],
        [s * 0.62, 0.36, -1.38],
        [s * 0.76, 0.48, -1.72],
      ]),
      {
        parent: pelvis,
        count: 4,
        names: [`tailRibbon1_${side}`, `tailRibbon2_${side}`, `tailRibbon3_${side}`, `tailRibbon4_${side}`],
        role: "tail",
        group: "tail",
      },
    );

    sides.push({ s, side, wing, wingDigits: [d1, d2, d3], leg, toes, sideTail });
  }

  // Central Royal Tail Plume Chain (`role: "tail"`)
  const mainTail = b.chain(
    "tailMain",
    catmull([
      [0, 0.80, -0.18],
      [0, 0.82, -0.52],
      [0, 0.70, -0.92],
      [0, 0.46, -1.34],
      [0, 0.32, -1.72],
      [0, 0.48, -2.02],
    ]),
    {
      parent: pelvis,
      count: 5,
      names: ["tail1", "tail2", "tail3", "tail4", "tail5"],
      role: "tail",
      group: "tail",
    },
  );

  // Upper Peacock-Phoenix Fan Ring (`role: "fan"`, 5 group joints driving 15 ornate tail plumes)
  const tailFanRing = b.ring(
    frame([0, 0.84, -0.24], [0, 0.38, -0.92]),
    {
      count: 15,
      radius: 0.08,
      fromDeg: -72,
      toDeg: 72,
      tilt: 52,
      joints: 5,
      name: "tailFan",
      parent: pelvis,
      role: "fan",
      group: "tail",
    },
  );

  // ---------------------------------------------------------------------------
  // 2. CORE TORSO, NECK & HEAD VOLUMES
  // ---------------------------------------------------------------------------
  // Continuous blend-skinned body + neck + tail-base loft
  const bodyStations = [
    { at: [0, 0.80, -0.32], w: 0.16, h: 0.15 },
    { at: [0, 0.80, -0.10], w: 0.30, h: 0.28 },
    { at: [0, 0.90, 0.04], w: 0.38, h: 0.36 },
    { at: [0, 1.03, 0.21], w: 0.42, h: 0.40 }, // Proud avian keel chest
    { at: [0, 1.18, 0.30], w: 0.30, h: 0.28 },
    { at: [0, 1.32, 0.34], w: 0.20, h: 0.20 },
    { at: [0, 1.46, 0.34], w: 0.17, h: 0.17 },
    { at: [0, 1.55, 0.36], w: 0.18, h: 0.17 },
  ];
  const bodyLoft = b.loft(bodyStations, {
    bone: [pelvis, spine, neck, head],
    color: BODY_PLUMAGE,
    sides: 12,
    group: "body",
    name: "torsoLoft",
  });

  // Sculpted proud breast keel plume volume in front of chest
  const breastPlume = b.loft(
    [
      { at: [0, 0.84, 0.08], w: 0.22, h: 0.16 },
      { at: [0, 0.98, 0.28], w: 0.32, h: 0.26 },
      { at: [0, 1.14, 0.38], w: 0.28, h: 0.22 },
      { at: [0, 1.26, 0.37], w: 0.16, h: 0.12 },
    ],
    {
      bone: [spine, neck],
      color: CREAM_SILK,
      sides: 10,
      group: "body",
      name: "breastPlume",
    },
  );

  // Ornate Neck Collar Mantle (layered scalloped cape around neck1/chest)
  const collarRing = b.ring(
    frame([0, 1.20, 0.28], [0, 0.94, 0.34]),
    { count: 14, radius: 0.12, fromDeg: 0, toDeg: 334, tilt: -148, group: "neck" },
  );
  const collarFeatherOutline: OutlinePoint[] = [
    [0, -0.022],
    [0.08, -0.036],
    [0.16, -0.020],
    [0.21, 0, "sharp"],
    [0.16, 0.020],
    [0.08, 0.036],
    [0, 0.022],
  ];
  collarRing.items.forEach((item, idx) => {
    const lenScale = 0.85 + 0.25 * Math.cos(((idx / 14) * Math.PI * 2));
    b.extrude(
      collarFeatherOutline.map(([x, y, sh]) => (sh ? [x * lenScale, y, "sharp"] : [x * lenScale, y])),
      {
        at: item.at,
        x: item.axis,
        y: item.dir([0, 0, 1]),
        thickness: [0.016, 0.003],
        bevel: 0.004,
        smoothing: 1,
        color: idx % 2 === 0 ? NECK_PLUMAGE : GOLD,
        bone: chest,
        group: "neck",
      },
    );
  });

  // ---------------------------------------------------------------------------
  // 3. HEAD, BEAK, ANIME EYES, ROYAL DIADEM & CREST PLUMES
  // ---------------------------------------------------------------------------
  const HEAD_CENTER: V3 = [0, 1.56, 0.41];
  const skull = b.part(new THREE.SphereGeometry(1, 14, 12), HEAD_PLUMAGE, {
    bone: head,
    at: HEAD_CENTER,
    scale: [0.105, 0.095, 0.118],
    group: "head",
    name: "skull",
  });

  // Sculpted cheek feather tufts sweeping back from the face
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    for (let k = 0; k < 3; k++) {
      const yOff = 1.55 - k * 0.024;
      const zOff = 0.42 - k * 0.015;
      const len = 0.18 - k * 0.025;
      const cheekPath = bezier(
        [s * 0.085, yOff, zOff],
        [s * (0.15 + k * 0.015), yOff + 0.02, zOff - 0.06],
        [s * (0.19 + k * 0.02), yOff + 0.05, zOff - len],
      );
      b.sweep(cheekPath, (t) => [0.022 * (1 - t * 0.85), 0.010 * (1 - t * 0.85)], {
        bone: head,
        color: k === 1 ? GOLD : HEAD_PLUMAGE,
        caps: { start: "round", end: "point" },
        sides: 6,
        group: "head",
        name: `cheekTuft${k}_${side}`,
      });
    }

    // Fierce sweeping golden brow ridges over the eyes (Genshin divine beast motif)
    const browPath = catmull([
      [s * 0.03, 1.59, 0.50],
      [s * 0.09, 1.62, 0.45],
      [s * 0.15, 1.67, 0.33],
      [s * 0.21, 1.75, 0.16],
    ]);
    b.sweep(browPath, (t) => [0.018 * (1 - 0.7 * t), 0.012 * (1 - 0.7 * t)], {
      bone: head,
      color: GOLD_BRIGHT,
      caps: { start: "round", end: "point" },
      sides: 6,
      group: "head",
      name: `browPlume${side}`,
    });
    // Glowing solar tip on brow ridge
    glow(
      b.spike([s * 0.18, 1.71, 0.24], [s * 0.25, 1.80, 0.08], null, 0.012, SOLAR_WHITE, {
        bone: head,
        sides: 5,
        group: "head",
      }),
      1.6,
    );
  }

  // Conformed Anime Eye Decals on the skull
  const skullSurf = b.surface(skull);
  for (const s of [1, -1] as const) {
    const eyeHit = skullSurf.around(HEAD_CENTER).at(s * 48, 4);
    if (eyeHit) {
      b.decal(skullSurf, EYE_TEX, {
        at: eyeHit,
        size: [0.068, 0.086],
        mirror: s > 0,
        bone: head,
        group: "head",
        name: `eyeDecal${s > 0 ? "L" : "R"}`,
      });
    }
  }

  // Hooked Aquiline Upper Beak (on `head` bone) and Hinged Lower Jaw Beak (on `jaw` bone)
  const upperBeakPath = bezier(
    [0, 1.56, 0.49],
    [0, 1.57, 0.59],
    [0, 1.51, 0.65],
  );
  b.sweep(
    upperBeakPath,
    (t) => [0.044 * (1 - t * 0.92), 0.038 * (1 - t * 0.88)],
    {
      bone: head,
      section: { ngon: 4 },
      color: BEAK_PAINT,
      caps: { start: "round", end: "point" },
      group: "head",
      name: "upperBeak",
    },
  );

  // Ornate Golden Cere / Nasal Bridge Guard with inlaid Pyro Gem
  b.sweep(
    bezier([0, 1.60, 0.46], [0, 1.59, 0.53], [0, 1.56, 0.57]),
    (t) => [0.032 * (1 - 0.5 * t), 0.016 * (1 - 0.5 * t)],
    {
      bone: head,
      color: GOLD,
      sides: 6,
      group: "head",
      name: "beakCereGold",
    },
  );

  // Lower Beak Mandible on `jaw` bone + Glowing Flame Tongue inside mouth
  const lowerBeakPath = bezier(
    [0, 1.51, 0.46],
    [0, 1.49, 0.55],
    [0, 1.49, 0.61],
  );
  b.sweep(
    lowerBeakPath,
    (t) => [0.032 * (1 - t * 0.9), 0.022 * (1 - t * 0.88)],
    {
      bone: jaw,
      section: { ngon: 4 },
      color: BEAK_PAINT,
      caps: { start: "round", end: "point" },
      group: "head",
      name: "lowerBeak",
    },
  );
  // Glowing Pyro Tongue on jaw
  glow(
    b.sweep(
      bezier([0, 1.52, 0.47], [0, 1.51, 0.54], [0, 1.52, 0.58]),
      (t) => [0.016 * (1 - t * 0.85), 0.008 * (1 - t * 0.85)],
      {
        bone: jaw,
        color: PYRO_GLOW,
        caps: { start: "round", end: "point" },
        sides: 5,
        group: "head",
        name: "flameTongue",
      },
    ),
    1.8,
  );
  // Chin beard flame wisp under jaw
  b.extrude(
    [
      [0, -0.015],
      [0.06, -0.026],
      [0.14, 0, "sharp"],
      [0.06, 0.022],
      [0, 0.015],
    ],
    {
      at: [0, 1.48, 0.49],
      x: [0, -0.55, -0.83],
      y: [0, 0.83, -0.55],
      thickness: [0.014, 0.002],
      bevel: 0.003,
      smoothing: 1,
      color: GOLD_BRIGHT,
      bone: jaw,
      group: "head",
      name: "chinWisp",
    },
  );

  // Royal Genshin Filigree Diadem & Five Sweeping Crown Plumes on `crestJoint`
  // Golden Lotus Crown Base
  b.lathe(
    [
      [0, 0],
      [0.048, 0.004],
      [0.054, 0.024],
      [0.038, 0.042],
      [0.046, 0.062],
      [0, 0.068],
    ],
    {
      at: [0, 1.62, 0.39],
      axis: [0, 0.92, -0.38],
      segments: 8,
      color: GOLD,
      bone: crestJoint,
      group: "head",
      name: "crownLotusBase",
    },
  );

  // Forehead Pyro Diamond Jewel in gold bezel
  b.part(new THREE.OctahedronGeometry(0.026, 0), GOLD, {
    bone: head,
    at: [0, 1.62, 0.49],
    scale: [0.85, 1.35, 0.55],
    group: "head",
    name: "foreheadBezel",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.020, 0), PYRO_CORE, {
      bone: head,
      at: [0, 1.62, 0.502],
      scale: [0.75, 1.25, 0.55],
      group: "head",
      name: "foreheadGem",
    }),
    2.0,
  );

  // 5 Sweeping Royal Crown Plumes (central tall solar plume + 2 pairs of flanked crimson-gold plumes)
  const crownSpecs = [
    { x: 0, h: 0.52, back: 0.52, w: 0.042, col: PRIMARY_BLADE_PAINT, glowTip: true },
    { x: 0.032, h: 0.44, back: 0.45, w: 0.034, col: GOLD_BRIGHT, glowTip: false },
    { x: -0.032, h: 0.44, back: 0.45, w: 0.034, col: GOLD_BRIGHT, glowTip: false },
    { x: 0.062, h: 0.35, back: 0.36, w: 0.028, col: SECONDARY_BLADE_PAINT, glowTip: true },
    { x: -0.062, h: 0.35, back: 0.36, w: 0.028, col: SECONDARY_BLADE_PAINT, glowTip: true },
  ];
  crownSpecs.forEach((cs, idx) => {
    const p0: V3 = [cs.x * 0.4, 1.64, 0.38];
    const p1: V3 = [cs.x * 1.1, 1.64 + cs.h * 0.65, 0.38 - cs.back * 0.35];
    const p2: V3 = [cs.x * 1.6, 1.64 + cs.h, 0.38 - cs.back * 0.82];
    const p3: V3 = [cs.x * 1.9, 1.64 + cs.h * 0.92, 0.38 - cs.back];
    const plumeCurve = catmull([p0, p1, p2, p3]);
    b.sweep(
      plumeCurve,
      (t) => {
        const flare = Math.sin(Math.pow(t, 0.7) * Math.PI);
        return [0.006 + 0.008 * (1 - t), cs.w * (0.25 + 0.85 * flare)];
      },
      {
        bone: crestJoint,
        color: cs.col,
        caps: { start: "round", end: "point" },
        sides: 6,
        group: "head",
        name: `crownPlume${idx}`,
      },
    );
    if (cs.glowTip) {
      // Glowing diamond flame finial at tip of crown plume
      glow(
        b.part(new THREE.OctahedronGeometry(0.028, 0), SOLAR_WHITE, {
          bone: crestJoint,
          at: p3,
          dir: plumeCurve.tangentAt(1),
          scale: [0.45, 1.8, 0.8],
          group: "head",
          name: `crownPlumeFinial${idx}`,
        }),
        1.8,
      );
    }
  });

  // ---------------------------------------------------------------------------
  // 4. GENSHIN ORNATE GOLD FILIGREE REGALIA, CHEST PECTORAL & TASSELS
  // ---------------------------------------------------------------------------
  const bodySurf = b.surface(bodyLoft);

  // Sculpted Golden Cloud-Scroll Collar Loop around chest/neck base
  const chestLoop = bodySurf.loop(frame([0, 1.15, 0.25], [0, 0.82, 0.57]), { lift: 0.012 });
  b.sweep(chestLoop, [0.018, 0.018], {
    bone: chest,
    color: GOLD,
    sides: 8,
    group: "regalia",
    name: "goldTorqueCollar",
  });

  // Second inner filigree trim loop
  const lowerChestLoop = bodySurf.loop(frame([0, 1.02, 0.16], [0, 0.75, 0.66]), { lift: 0.010 });
  b.sweep(lowerChestLoop, [0.013, 0.013], {
    bone: spine.joints[1],
    color: GOLD_BRIGHT,
    sides: 6,
    group: "regalia",
    name: "goldLowerCollar",
  });

  // Merged Gold Filigree Studs & Pearl Beads along both collars (1 part on chest bone)
  const collarBeadGeos: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 16; i++) {
    const pt = chestLoop.at(i / 16);
    collarBeadGeos.push(new THREE.OctahedronGeometry(0.018, 0).translate(pt.x, pt.y, pt.z));
  }
  for (let i = 0; i < 14; i++) {
    const pt = lowerChestLoop.at(i / 14);
    collarBeadGeos.push(new THREE.SphereGeometry(0.014, 6, 4).translate(pt.x, pt.y, pt.z));
  }
  b.part(mergeGeometries(collarBeadGeos), GOLD_BRIGHT, {
    bone: chest,
    at: [0, 0, 0],
    group: "regalia",
    name: "collarFiligreeBeads",
  });

  // Central Pyro Vision Pectoral Medallion on the chest keel
  const pectoralOutline: OutlinePoint[] = [
    [0, -0.095, "sharp"],
    [0.055, -0.045],
    [0.085, 0, "sharp"],
    [0.055, 0.055],
    [0, 0.095, "sharp"],
    [-0.055, 0.055],
    [-0.085, 0, "sharp"],
    [-0.055, -0.045],
  ];
  const pectoralFrame = b.extrude(pectoralOutline, {
    at: [0, 1.07, 0.41],
    x: [1, 0, 0],
    y: [0, 0.90, -0.43],
    thickness: 0.022,
    bevel: 0.006,
    smoothing: 1,
    color: GOLD,
    bone: chest,
    group: "regalia",
    name: "pectoralMedallion",
  });

  // Pyro Sigil Decal on the front of the Pectoral Medallion
  b.decal(pectoralFrame, PYRO_SIGIL_TEX, {
    at: [0, 1.07, 0.425],
    dir: [0, 0.43, 0.90],
    size: [0.14, 0.14],
    bone: chest,
    group: "regalia",
    name: "pectoralSigilDecal",
  });

  // Glowing Pyro Vision Core Gem in the center of the chest medallion
  glow(
    b.part(new THREE.OctahedronGeometry(0.034, 1), PYRO_GLOW, {
      bone: chest,
      at: [0, 1.07, 0.422],
      rotation: [25, 0, 0],
      scale: [0.9, 1.25, 0.45],
      group: "regalia",
      name: "chestVisionGem",
    }),
    2.2,
  );

  // Teal Celestial Contrast Gems flanking the chest medallion
  for (const s of [1, -1] as const) {
    glow(
      b.part(new THREE.OctahedronGeometry(0.018, 0), TEAL_GEM, {
        bone: chest,
        at: [s * 0.095, 1.09, 0.39],
        scale: [0.8, 1.3, 0.6],
        group: "regalia",
        name: `chestTealGem${s > 0 ? "L" : "R"}`,
      }),
      1.5,
    );
  }

  // Hanging Genshin Silk & Gold Tassels under the chest pectoral and shoulders
  const tasselFrames = [
    frame([0, 0.99, 0.41], [0, 1, 0]),
    frame([0.11, 1.02, 0.37], [0, 1, 0]),
    frame([-0.11, 1.02, 0.37], [0, 1, 0]),
    frame([0.21, 1.08, 0.25], [0, 1, 0]),
    frame([-0.21, 1.08, 0.25], [0, 1, 0]),
  ];
  b.cards(tasselFrames, TASSEL_CARD, {
    size: [0.065, 0.21],
    lean: 180,
    flow: [0, 0, 1],
    bone: chest,
    group: "regalia",
    name: "chestTassels",
  });

  // Dorsal Gold Filigree Saddle & Floating Sacred Halo Astrolabe above the back
  const dorsalArchOutline: OutlinePoint[] = [
    [0, -0.02],
    [0.14, -0.035],
    [0.26, 0, "sharp"],
    [0.14, 0.045],
    [0, 0.025],
  ];
  for (let i = 0; i < 4; i++) {
    const t = 0.22 + i * 0.20;
    const sp = spine.at(t);
    b.extrude(dorsalArchOutline, {
      at: offset(sp.at, [0, 1, 0], 0.14),
      x: [0, 0.42, -0.91],
      y: [0, 0.91, 0.42],
      thickness: [0.018, 0.004],
      bevel: 0.004,
      smoothing: 1,
      color: i % 2 === 0 ? GOLD : PRIMARY_BLADE_PAINT,
      bone: sp.bone,
      group: "regalia",
      name: `dorsalSpineCrest${i}`,
    });
  }

  // Sacred Celestial Solar Halo Ring floating behind the shoulders (classic Genshin Adeptus/Archon motif)
  const haloCenter: V3 = [0, 1.38, 0.05];
  const haloPts: V3[] = [];
  const haloR = 0.34;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    haloPts.push([
      haloCenter[0] + Math.cos(a) * haloR,
      haloCenter[1] + Math.sin(a) * haloR * 0.92,
      haloCenter[2] - Math.sin(a) * haloR * 0.35,
    ]);
  }
  b.sweep(catmull(haloPts, { closed: true }), 0.012, {
    bone: chest,
    color: GOLD_BRIGHT,
    sides: 6,
    group: "regalia",
    name: "celestialHaloRing",
  });

  // Glowing Solar Ray Spikes around the Celestial Halo (merged into 1 glowing part on chest)
  const haloRayGeos: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const rx = Math.cos(a);
    const ry = Math.sin(a) * 0.92;
    const rz = -Math.sin(a) * 0.35;
    const base = new THREE.Vector3(
      haloCenter[0] + rx * (haloR + 0.01),
      haloCenter[1] + ry * (haloR + 0.01),
      haloCenter[2] + rz * (haloR + 0.01),
    );
    const len = i % 2 === 0 ? 0.095 : 0.055;
    const cone = new THREE.ConeGeometry(0.016, len, 4);
    cone.translate(0, len / 2, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(rx, ry, rz).normalize(),
    );
    cone.applyQuaternion(q);
    cone.translate(base.x, base.y, base.z);
    haloRayGeos.push(cone);
  }
  glow(
    b.part(mergeGeometries(haloRayGeos), SOLAR_WHITE, {
      bone: chest,
      at: [0, 0, 0],
      group: "regalia",
      name: "celestialHaloRays",
    }),
    2.0,
  );

  // ---------------------------------------------------------------------------
  // 5. SPREAD WINGS (Arm Tubes, Membranes, Layered Primary/Secondary Blades, Alula, Gold Spaulders)
  // ---------------------------------------------------------------------------
  // Shared outlines for wing feathers
  const primaryOutline: OutlinePoint[] = [
    [0, -0.024],
    [0.22, -0.048],
    [0.54, -0.042],
    [0.78, -0.016],
    [0.88, 0.004, "sharp"],
    [0.72, 0.032],
    [0.42, 0.042],
    [0.14, 0.030],
    [0, 0.018],
  ];

  const secondaryOutline: OutlinePoint[] = [
    [0, -0.022],
    [0.16, -0.042],
    [0.36, -0.034],
    [0.50, 0, "sharp"],
    [0.36, 0.034],
    [0.16, 0.038],
    [0, 0.020],
  ];

  const covertOutline: OutlinePoint[] = [
    [0, -0.018],
    [0.10, -0.032],
    [0.22, -0.024],
    [0.28, 0, "sharp"],
    [0.22, 0.024],
    [0.10, 0.030],
    [0, 0.018],
  ];

  for (const sr of sides) {
    const { s, side, wing, wingDigits } = sr;
    const [d1, d2, d3] = wingDigits;
    const shoulderJ = wing.joints[0];
    const elbowJ = wing.joints[1];
    const wristJ = wing.joints[2];
    const tipJ = wing.joints[3];

    // Leading-edge wing arm tube (muscular feathered humerus, radius/ulna, and carpometacarpus)
    const wingArmSweep = b.sweep(
      wing,
      (t) => [
        0.075 * (1 - 0.68 * t) + 0.014 * Math.sin(t * Math.PI),
        0.055 * (1 - 0.65 * t),
      ],
      {
        color: WING_COVERT_PAINT,
        caps: { start: "round", end: "point" },
        sides: 8,
        group: `wing${side}`,
        name: `wingArm${side}`,
      },
    );

    // Ornate Gold Filigree Leading-Edge Trim along the front of the wing arm
    b.sweep(
      wingArmSweep.line(s > 0 ? -75 : 75, 0.005).slice(0.04, 0.92),
      (t) => 0.016 * (1 - 0.55 * t),
      {
        bone: wing,
        color: GOLD_BRIGHT,
        sides: 6,
        group: `wing${side}`,
        name: `wingGoldTrim${side}`,
      },
    );

    // Swept feather shafts along the 3 wing digit chains
    wingDigits.forEach((dc, dIdx) => {
      b.sweep(dc, [0.022 - dIdx * 0.003, 0.005], {
        color: GOLD_BRIGHT,
        caps: { start: "round", end: "point" },
        sides: 6,
        group: `wing${side}`,
        name: `wingDigitShaft${dIdx}_${side}`,
      });
    });

    // Continuous Skinned Wing Membranes between wing arm, feather-digits, and torso flank
    b.membrane(wing.path.slice(0.50, 1.0), d1, {
      thickness: 0.016,
      scallop: 0.14,
      color: WING_MEMBRANE_PAINT,
      group: `wing${side}`,
      name: `wingMembraneOuter${side}`,
    });
    b.membrane(d1, d2, {
      thickness: 0.016,
      scallop: 0.16,
      color: WING_MEMBRANE_PAINT,
      group: `wing${side}`,
      name: `wingMembraneMid${side}`,
    });
    b.membrane(d2, d3, {
      thickness: 0.015,
      scallop: 0.16,
      color: WING_MEMBRANE_PAINT,
      group: `wing${side}`,
      name: `wingMembraneInner${side}`,
    });
    b.membrane(
      d3,
      catmull([
        [s * 0.52, 1.24, 0.04],
        [s * 0.30, 1.06, -0.06],
        [s * 0.16, 0.88, -0.18],
      ]),
      {
        thickness: 0.014,
        scallop: 0.12,
        bone: shoulderJ,
        color: WING_MEMBRANE_PAINT,
        group: `wing${side}`,
        name: `wingMembraneTertial${side}`,
      },
    );

    // Ornate Golden Shoulder Spaulder & Wrist Wing-Pin (Genshin armor ornament)
    const spaulderOutline: OutlinePoint[] = [
      [0, -0.045],
      [0.12, -0.065],
      [0.24, -0.035],
      [0.31, 0, "sharp"],
      [0.24, 0.045],
      [0.12, 0.068],
      [0, 0.045],
    ];
    b.extrude(spaulderOutline, {
      at: [s * 0.20, 1.18, 0.20],
      x: [s * 0.86, 0.25, -0.44],
      y: [0, 0.88, 0.48],
      thickness: [0.022, 0.005],
      bevel: 0.006,
      smoothing: 1,
      color: GOLD,
      bone: shoulderJ,
      group: `wing${side}`,
      name: `shoulderSpaulder${side}`,
    });

    // Wrist Filigree Rosette & Glowing Pyro Wing Jewel
    b.part(new THREE.OctahedronGeometry(0.042, 0), GOLD_BRIGHT, {
      bone: wristJ,
      at: [s * 0.98, 1.46, 0.18],
      scale: [1.3, 0.7, 0.9],
      group: `wing${side}`,
      name: `wristRosette${side}`,
    });
    glow(
      b.part(new THREE.OctahedronGeometry(0.028, 0), PYRO_CORE, {
        bone: wristJ,
        at: [s * 0.98, 1.47, 0.20],
        scale: [1.1, 0.65, 0.85],
        group: `wing${side}`,
        name: `wristPyroGem${side}`,
      }),
      2.0,
    );

    // Alula (Bastard Wing) — 3 sculpted golden-crimson blades flaring forward/up at the wrist
    for (let a = 0; a < 3; a++) {
      const aFrac = a / 2;
      const alulaDir: V3 = [
        s * (0.88 + 0.12 * aFrac),
        0.42 - 0.18 * aFrac,
        0.22 - 0.22 * aFrac,
      ];
      const scaleLen = 0.95 - a * 0.16;
      b.extrude(
        covertOutline.map(([x, y, sh]) => (sh ? [x * scaleLen, y * 0.9, "sharp"] : [x * scaleLen, y * 0.9])),
        {
          at: [s * (0.95 + a * 0.06), 1.46 + a * 0.015, 0.17 - a * 0.02],
          x: alulaDir,
          y: [0, 1, 0.15],
          thickness: [0.014, 0.002],
          bevel: 0.004,
          smoothing: 1,
          color: a === 1 ? GOLD_BRIGHT : PRIMARY_BLADE_PAINT,
          bone: wristJ,
          group: `wing${side}`,
          name: `alulaFeather${a}_${side}`,
        },
      );
    }

    // 10 Primary Flight Feathers (`b.extrude`) fanning majestically from outer hand to inner wrist
    const primaryCount = 10;
    for (let p = 0; p < primaryCount; p++) {
      const frac = p / (primaryCount - 1); // 0 = outermost tip, 1 = inner wrist
      const rootT = 0.96 - frac * 0.44; // along wing chain 0.52..0.96
      const wp = wing.at(rootT);
      // Fan direction: outer primaries sweep strongly laterally & slightly back; inner primaries sweep further back & down
      const dirX = s * (0.94 - frac * 0.42);
      const dirY = 0.26 - frac * 0.34;
      const dirZ = -0.22 - frac * 0.72;
      const lenScale = 1.08 - Math.abs(frac - 0.25) * 0.38;
      const widScale = 0.92 + frac * 0.25;
      const ownerBone = frac < 0.32 ? tipJ : frac < 0.72 ? d1.joints[0] : d2.joints[0];

      const scaledPrimary: OutlinePoint[] = primaryOutline.map(([x, y, sh]) =>
        sh ? [x * lenScale, y * widScale, "sharp"] : [x * lenScale, y * widScale],
      );
      const featherPart = b.extrude(scaledPrimary, {
        at: offset(wp.at, [0, -0.01 - (p % 2) * 0.008, -0.02], 1),
        x: [dirX, dirY, dirZ],
        y: [-s * 0.12, 0.95, -0.25],
        thickness: [0.016, 0.002],
        bevel: 0.004,
        smoothing: 1,
        color: PRIMARY_BLADE_PAINT,
        bone: ownerBone,
        group: `wing${side}`,
        name: `primaryFeather${p}_${side}`,
      });

      // Glowing Solar Ember Tip Spear on every outer primary feather
      if (p < 7) {
        const tipWorld = featherPart.local([0.84 * lenScale, 0.004, 0]);
        glow(
          b.part(new THREE.OctahedronGeometry(0.024, 0), p % 2 === 0 ? SOLAR_WHITE : PYRO_GLOW, {
            bone: ownerBone,
            at: tipWorld,
            dir: [dirX, dirY, dirZ],
            scale: [0.45, 2.2, 0.85],
            group: `wing${side}`,
            name: `primaryGlowTip${p}_${side}`,
          }),
          1.8,
        );
      }
    }

    // 9 Secondary Flight Feathers along forearm (elbow -> wrist)
    const secondaryCount = 9;
    for (let sc = 0; sc < secondaryCount; sc++) {
      const frac = sc / (secondaryCount - 1);
      const rootT = 0.52 - frac * 0.44; // along wing chain 0.08..0.52
      const wp = wing.at(rootT);
      const dirX = s * (0.46 - frac * 0.30);
      const dirY = -0.06 - frac * 0.14;
      const dirZ = -0.88 - frac * 0.10;
      const lenScale = 1.05 - frac * 0.25;
      const ownerBone = frac < 0.45 ? elbowJ : frac < 0.80 ? d3.joints[0] : shoulderJ;

      const scaledSec: OutlinePoint[] = secondaryOutline.map(([x, y, sh]) =>
        sh ? [x * lenScale, y, "sharp"] : [x * lenScale, y],
      );
      b.extrude(scaledSec, {
        at: offset(wp.at, [0, -0.015 - (sc % 2) * 0.007, -0.02], 1),
        x: [dirX, dirY, dirZ],
        y: [-s * 0.08, 0.96, -0.22],
        thickness: [0.015, 0.002],
        bevel: 0.004,
        smoothing: 1,
        color: sc % 3 === 1 ? GOLD : SECONDARY_BLADE_PAINT,
        bone: ownerBone,
        group: `wing${side}`,
        name: `secondaryFeather${sc}_${side}`,
      });
    }

    // Upper & Lower Greater Wing Coverts (overlapping armored feather rows on dorsal and ventral wing surfaces)
    for (let row = 0; row < 2; row++) {
      const count = 11 - row * 2;
      for (let c = 0; c < count; c++) {
        const frac = c / (count - 1);
        const rootT = 0.10 + frac * 0.80;
        const wp = wing.at(rootT);
        const covLen = (0.95 - row * 0.25) * (1.0 - frac * 0.22);
        const dirX = s * (0.35 + frac * 0.42);
        const dirY = (row === 0 ? 0.08 : -0.14) + frac * 0.12;
        const dirZ = -0.88 + frac * 0.25;
        const yLift = row === 0 ? 0.026 : -0.024;
        const ownerBone = frac < 0.35 ? shoulderJ : frac < 0.72 ? elbowJ : wristJ;

        b.extrude(
          covertOutline.map(([x, y, sh]) => (sh ? [x * covLen, y * 0.9, "sharp"] : [x * covLen, y * 0.9])),
          {
            at: offset(wp.at, [0, yLift, -0.01], 1),
            x: [dirX, dirY, dirZ],
            y: [0, 1, 0],
            thickness: [0.013, 0.002],
            bevel: 0.003,
            smoothing: 1,
            color: row === 0 ? (c % 2 === 0 ? PRIMARY_BLADE_PAINT : GOLD_BRIGHT) : SECONDARY_BLADE_PAINT,
            bone: ownerBone,
            group: `wing${side}`,
            name: `wingCovertR${row}_${c}_${side}`,
          },
        );
      }
    }

    // Textured Flame Feather Cards & Glowing Solar Wisp Cards along the trailing edge of the wings
    const wingCardFrames = [];
    const wingWispFrames = [];
    for (let k = 0; k < 14; k++) {
      const u = (k + 0.5) / 14;
      const wp = wing.at(0.12 + u * 0.84);
      const backDir = new THREE.Vector3(s * (0.25 + 0.45 * u), 0.08 * u, -0.92).normalize();
      wingCardFrames.push(
        frame(
          offset(wp.at, backDir, 0.12 + u * 0.06),
          [0, 1, 0],
        ),
      );
      if (k % 2 === 0) {
        wingWispFrames.push(
          frame(
            offset(wp.at, backDir, 0.38 + u * 0.22),
            backDir,
          ),
        );
      }
    }
    b.cards(wingCardFrames, FLAME_FEATHER_CARD, {
      size: [0.14, 0.28],
      lean: 78,
      bend: 18,
      flow: [s * 0.35, -0.05, -1],
      vary: 0.18,
      rng: rng(100 + s * 10),
      mirror: s < 0,
      group: `wing${side}`,
      name: `wingPlumeCards${side}`,
    });
    glow(
      b.cards(wingWispFrames, SOLAR_WISP_CARD, {
        size: [0.09, 0.24],
        lean: 12,
        bend: 24,
        flow: [0, 0.4, -1],
        vary: 0.22,
        rng: rng(200 + s * 10),
        group: `wing${side}`,
        name: `wingSolarWisps${side}`,
      }),
      1.6,
    );
  }

  // ---------------------------------------------------------------------------
  // 6. RAPTOR LEGS, FLAME BREECHES, ANKLE ANKLETS & TALONS (Planted on y = 0)
  // ---------------------------------------------------------------------------
  for (const sr of sides) {
    const { s, side, leg, toes } = sr;
    const hipJ = leg.joints[0];
    const kneeJ = leg.joints[1];
    const hockJ = leg.joints[2];
    const footJ = leg.joints[3];

    // Feathered upper thigh & crus, transitioning to golden scales on the tarsometatarsus
    b.sweep(
      leg,
      (t) => {
        if (t < 0.38) return [0.072 * (1 - 0.3 * t), 0.082 * (1 - 0.3 * t)];
        if (t < 0.68) return [0.046 * (1 - 0.35 * (t - 0.38)), 0.052 * (1 - 0.35 * (t - 0.38))];
        return [0.025, 0.027];
      },
      {
        bands: [
          [0.58, BODY_PLUMAGE],
          [0.64, GOLD_BRIGHT],
          [1.0, TALON_SCALE_PAINT],
        ],
        sides: 8,
        group: `leg${side}`,
        name: `legTube${side}`,
      },
    );

    // Flared Flame-Feather Breeches / Cuffs at the knee & hock
    for (let f = 0; f < 4; f++) {
      const angle = (f - 1.5) * 0.42;
      const cuffDir: V3 = [
        s * (0.45 + 0.35 * Math.sin(angle)),
        -0.35,
        -0.82 * Math.cos(angle),
      ];
      b.extrude(
        covertOutline.map(([x, y, sh]) => (sh ? [x * 0.72, y * 0.75, "sharp"] : [x * 0.72, y * 0.75])),
        {
          at: offset(kneeJ.at, [s * 0.03, -0.02, -0.02], 1),
          x: cuffDir,
          y: [0, 1, 0],
          thickness: [0.014, 0.002],
          bevel: 0.003,
          smoothing: 1,
          color: f % 2 === 0 ? PRIMARY_BLADE_PAINT : GOLD,
          bone: kneeJ,
          group: `leg${side}`,
          name: `thighFlair${f}_${side}`,
        },
      );
    }

    // Ornate Golden Cloud Anklet Ring above the foot
    const ankletRing = b.ring(
      frame(lerp(hockJ.at, footJ.at, 0.68), [0, 1, 0]),
      { count: 8, radius: 0.032, group: `leg${side}` },
    );
    b.sweep(catmull(ankletRing.items, { closed: true }), 0.009, {
      bone: hockJ,
      color: GOLD_BRIGHT,
      sides: 6,
      group: `leg${side}`,
      name: `goldAnklet${side}`,
    });

    // Hock Spur (fierce backward golden-crimson spur)
    b.spike(
      lerp(hockJ.at, footJ.at, 0.45),
      [s * 0.18, 0.25, -0.95],
      0.085,
      0.016,
      GOLD_BRIGHT,
      {
        bone: hockJ,
        sides: 5,
        group: `leg${side}`,
        name: `hockSpur${side}`,
      },
    );

    // 4 Articulated Toes + Curved Obsidian-Gold Claws resting at y >= 0
    toes.forEach((toeChain, tIdx) => {
      b.sweep(toeChain, [0.020, 0.012], {
        color: TALON_SCALE_PAINT,
        caps: "round",
        sides: 6,
        group: `leg${side}`,
        name: `toeTube${tIdx}_${side}`,
      });

      const toeTip = toeChain.at(1);
      const tang = toeChain.path.tangentAt(1);
      const clawStart = toeTip.at;
      const clawCtrl = offset(clawStart, [tang.x, 0.08, tang.z], 0.028);
      const clawEnd: V3 = [
        clawStart.x + tang.x * 0.048,
        0.003, // lands cleanly right on the floor plane
        clawStart.z + tang.z * 0.048,
      ];
      b.sweep(bezier(clawStart, clawCtrl, clawEnd), [0.013, 0], {
        bone: toeChain.joints[1],
        color: OBSIDIAN,
        caps: { start: "round", end: "point" },
        sides: 5,
        group: `leg${side}`,
        name: `talonClaw${tIdx}_${side}`,
      });
    });

    // Dorsal foot shield plate in gold
    b.part(new THREE.OctahedronGeometry(0.028, 0), GOLD, {
      bone: footJ,
      at: offset(footJ.at, [0, 0.016, 0.03], 1),
      scale: [0.95, 0.45, 1.35],
      group: `leg${side}`,
      name: `footArmorPlate${side}`,
    });
    // Keep hipJ referenced cleanly
    void hipJ;
  }

  // ---------------------------------------------------------------------------
  // 7. IMPERIAL PHOENIX TAIL TRAIN (Central Sweep, Ribbon Streamers, 15-Plume Fan Ring & Ocellus Finials)
  // ---------------------------------------------------------------------------
  // Central Royal Tail Streamer along `mainTail` chain
  const mainTailSweep = b.sweep(
    mainTail,
    (t) => [
      0.085 * (1 - 0.55 * t) + 0.035 * Math.sin(t * Math.PI * 1.2),
      0.024 * (1 - 0.65 * t),
    ],
    {
      color: TAIL_RIBBON_PAINT,
      caps: { start: "round", end: "point" },
      sides: 8,
      group: "tail",
      name: "mainTailStreamer",
    },
  );

  // Gold Filigree Spine Ridge running down the center of the main tail
  b.sweep(mainTailSweep.line(0, 0.004).slice(0.02, 0.92), (t) => 0.014 * (1 - 0.6 * t), {
    bone: mainTail,
    color: GOLD_BRIGHT,
    sides: 5,
    group: "tail",
    name: "mainTailGoldSpine",
  });

  // Grand Ocellus Finial Blade at the tip of the central tail
  const tailTipPt = mainTail.at(0.92);
  const tailFinialOutline: OutlinePoint[] = [
    [0, -0.025],
    [0.12, -0.085],
    [0.26, -0.065],
    [0.38, 0, "sharp"],
    [0.26, 0.065],
    [0.12, 0.085],
    [0, 0.025],
  ];
  b.extrude(tailFinialOutline, {
    at: tailTipPt.at,
    x: tailTipPt.tangent,
    y: [1, 0, 0],
    thickness: [0.014, 0.003],
    bevel: 0.004,
    smoothing: 1,
    color: PRIMARY_BLADE_PAINT,
    bone: mainTail.joints[4],
    group: "tail",
    name: "mainTailFinialBlade",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.042, 0), SOLAR_WHITE, {
      bone: mainTail.joints[4],
      at: mainTail.at(1).at,
      dir: tailTipPt.tangent,
      scale: [0.85, 2.1, 0.45],
      group: "tail",
      name: "mainTailSolarStar",
    }),
    2.0,
  );

  // Bilateral Long Flowing Tail Ribbons (along `sideTail` chains) + Outer Decorative Streamers
  for (const sr of sides) {
    const { s, side, sideTail } = sr;

    b.sweep(
      sideTail,
      (t) => [
        0.058 * (1 - 0.45 * t) + 0.028 * Math.sin(t * Math.PI),
        0.016 * (1 - 0.6 * t),
      ],
      {
        color: TAIL_RIBBON_PAINT,
        caps: { start: "round", end: "point" },
        sides: 8,
        group: "tail",
        name: `sideTailStreamer${side}`,
      },
    );

    // Outer filigree silk ribbon arcing gracefully beside each tail streamer
    const outerRibbonPath = catmull([
      [s * 0.15, 0.80, -0.20],
      [s * 0.38, 0.82, -0.58],
      [s * 0.64, 0.68, -1.02],
      [s * 0.86, 0.52, -1.44],
    ]);
    b.sweep(
      outerRibbonPath,
      (t) => [0.026 * (1 - 0.5 * t), 0.007 * (1 - 0.5 * t)],
      {
        bone: sideTail,
        color: GOLD_BRIGHT,
        caps: { start: "round", end: "point" },
        sides: 6,
        group: "tail",
        name: `outerGoldRibbon${side}`,
      },
    );

    // Ocellus Plume Card + Glowing Ember Diamond at each side tail tip
    const stEnd = sideTail.at(0.95);
    b.cards([frame(stEnd.at, [0, 1, 0])], OCELLUS_CARD, {
      size: [0.22, 0.34],
      lean: 84,
      flow: stEnd.tangent,
      bone: sideTail.joints[3],
      group: "tail",
      name: `sideTailOcellus${side}`,
    });
    glow(
      b.part(new THREE.OctahedronGeometry(0.032, 0), PYRO_GLOW, {
        bone: sideTail.joints[3],
        at: sideTail.at(1).at,
        dir: stEnd.tangent,
        scale: [0.75, 1.9, 0.45],
        group: "tail",
        name: `sideTailEmberTip${side}`,
      }),
      1.8,
    );
  }

  // 15-Feather Royal Phoenix Fan (`tailFanRing` with 5 group joints)
  const fanFeatherOutline: OutlinePoint[] = [
    [0, -0.018],
    [0.24, -0.038],
    [0.52, -0.048],
    [0.74, -0.026],
    [0.86, 0, "sharp"],
    [0.74, 0.026],
    [0.52, 0.048],
    [0.24, 0.038],
    [0, 0.018],
  ];
  const ocellusFrames = [];
  tailFanRing.items.forEach((item, idx) => {
    const centerBias = 1 - Math.abs(idx - 7) / 8; // taller in center, graduated to sides
    const lenScale = 0.68 + 0.44 * centerBias;
    const widScale = 0.82 + 0.28 * centerBias;
    const scaledFan: OutlinePoint[] = fanFeatherOutline.map(([x, y, sh]) =>
      sh ? [x * lenScale, y * widScale, "sharp"] : [x * lenScale, y * widScale],
    );
    const fanPart = b.extrude(scaledFan, {
      at: item.at,
      x: item.axis,
      y: item.dir([1, 0, 0]),
      thickness: [0.014, 0.002],
      bevel: 0.004,
      smoothing: 1,
      color: idx % 2 === 0 ? PRIMARY_BLADE_PAINT : TAIL_RIBBON_PAINT,
      bone: item.bone,
      group: "tail",
      name: `tailFanPlume${idx}`,
    });

    // Place an Ocellus eye-plume card near the tip of alternating fan feathers
    if (idx % 2 === 0) {
      const tipPos = fanPart.local([0.62 * lenScale, 0, 0.009]);
      ocellusFrames.push(frame(tipPos, [0, 1, 0]).moved(tipPos));
      // Glowing diamond jewel on the ocellus eye
      glow(
        b.part(new THREE.OctahedronGeometry(0.018, 0), idx === 7 ? TEAL_GEM : SOLAR_WHITE, {
          bone: item.bone,
          at: fanPart.local([0.76 * lenScale, 0, 0.006]),
          dir: item.axis,
          scale: [0.7, 1.6, 0.5],
          group: "tail",
          name: `fanPlumeJewel${idx}`,
        }),
        1.7,
      );
    }
  });

  // Upper Tail Covert Rosette (layered golden lotus feathers over the tail root)
  const rumpCovertRing = b.ring(
    frame([0, 0.85, -0.18], [0, 0.65, -0.76]),
    { count: 9, radius: 0.06, fromDeg: -65, toDeg: 65, tilt: 48, group: "tail" },
  );
  rumpCovertRing.items.forEach((item, idx) => {
    b.extrude(
      covertOutline.map(([x, y, sh]) => (sh ? [x * 0.95, y, "sharp"] : [x * 0.95, y])),
      {
        at: item.at,
        x: item.axis,
        y: [1, 0, 0],
        thickness: [0.014, 0.003],
        bevel: 0.003,
        smoothing: 1,
        color: idx % 2 === 0 ? GOLD_BRIGHT : SECONDARY_BLADE_PAINT,
        bone: pelvis,
        group: "tail",
        name: `rumpCovert${idx}`,
      },
    );
  });

  // ---------------------------------------------------------------------------
  // 8. BODY FEATHER COAT CARDS & GLOWING PYRO EMBER WISPS
  // ---------------------------------------------------------------------------
  // Scattered layered flame-plumage cards across dorsal torso and breast
  const dorsalHits = bodySurf.scatter(90, {
    rng: rng(303),
    minDist: 0.042,
    filter: (h) => h.n.y > -0.15 && h.at.y < 1.44,
  });
  b.cards(dorsalHits, FLAME_FEATHER_CARD, {
    size: [0.075, 0.15],
    lean: 74,
    bend: 20,
    flow: [0, -0.15, -1],
    vary: 0.22,
    spin: 10,
    rng: rng(404),
    group: "body",
    name: "bodyPlumeCards",
  });

  // Breast golden-cream down feather cards
  const breastSurf = b.surface(breastPlume);
  const breastHits = breastSurf.scatter(42, {
    rng: rng(505),
    minDist: 0.038,
    filter: (h) => h.n.z > 0.1,
  });
  b.cards(breastHits, SOLAR_WISP_CARD, {
    size: [0.055, 0.11],
    lean: 76,
    bend: 16,
    flow: [0, -0.75, -0.65],
    vary: 0.18,
    rng: rng(606),
    group: "body",
    name: "breastPlumeCards",
  });

  // Glowing Solar Wisp Cards trailing along the main tail and side tail ribbons
  const tailWispFrames = [];
  for (let i = 0; i < 9; i++) {
    const t = 0.15 + (i / 8) * 0.78;
    const tp = mainTail.at(t);
    tailWispFrames.push(frame(offset(tp.at, [0, 0.02, 0], 1), [0, 1, 0]));
  }
  for (const sr of sides) {
    for (let i = 0; i < 6; i++) {
      const t = 0.18 + (i / 5) * 0.74;
      const stp = sr.sideTail.at(t);
      tailWispFrames.push(frame(offset(stp.at, [0, 0.015, 0], 1), [0, 1, 0]));
    }
  }
  glow(
    b.cards(tailWispFrames, [SOLAR_WISP_CARD, OCELLUS_CARD], {
      size: [0.11, 0.25],
      lean: 72,
      bend: 22,
      flow: [0, 0.15, -1],
      vary: 0.25,
      rng: rand,
      group: "tail",
      name: "tailFlameWisps",
    }),
    1.5,
  );

  // Keep unused helper imports clean while ensuring rich paint variety
  void countershade;
  void mix;
  void noise;
  void smoothstep;
  void stripes;
  void line;
  void vec;
  void GOLD_DARK_HEX;
  void GOLD_BRONZE;
  void RUBY;
  void EMBER_DARK;

  return b.root;
}
