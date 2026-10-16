import * as THREE from "three";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, furEdge, INK, inkLines, zigzag } from "../../../../kits/toon";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { lerp, offset, rng } from "../../../../src/math";
import { countershade, gradient, mix, noise, paint, scales, smoothstep } from "../../../../src/paint";
import { bezier, catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Solaris Pyro-Phoenix",
  description:
    "Celestial Pyro phoenix with spread multi-layered flame wings, ornate Genshin-style golden filigree crown and collar, glowing elemental sigils, and arching fire-plume train.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "phoenix", detail: 0.9, paintSize: 2048 });

  // ---------------------------------------------------------------------------
  // Palette: Genshin Impact Cel-Shaded Toon + Self-Lit Pyro Elemental Glows
  // ---------------------------------------------------------------------------
  const RUBY_DEEP = "#6e0d1c";
  const CRIMSON_PLUME = "#bf1b2c";
  const VERMILION = "#ee4326";
  const SOLAR_ORANGE = "#ff7b1c";
  const AMBER_GOLD = "#ffba38";
  const IVORY_CREAM = "#fff5d6";
  const WARM_CREAM_SHADOW = "#f2c68a";
  const PLUM_DARK = "#2d122b";

  // Flat colours for glowing elemental parts & metallic accents (never pass Paint to glow())
  const GLOW_CORE = "#fff6a8";
  const GLOW_SOLAR = "#ffae2b";
  const GLOW_PYRO = "#ff4518";
  const GLOW_RUBY = "#ff1e27";
  const GOLD_FLAT = "#ecc054";
  const BRONZE_FLAT = "#8c5828";
  const OBISIDIAN_FLAT = "#2a1529";

  // Cel-shaded paints
  const CEL_RUBY = cel(RUBY_DEEP, "#3d0718");
  const CEL_CRIMSON = cel(CRIMSON_PLUME, "#780e24");
  const CEL_VERMILION = cel(VERMILION, "#a8201d");
  const CEL_ORANGE = cel(SOLAR_ORANGE, "#cc3e14");
  const CEL_GOLD_PLUME = cel(AMBER_GOLD, "#d96b18");
  const CEL_CREAM = cel(IVORY_CREAM, WARM_CREAM_SHADOW);
  const CEL_PLUM = cel(PLUM_DARK, INK);

  // Genshin ornate gold filigree & dark bronze cel paints
  const CELESTIAL_GOLD = inkLines(cel("#f6cf65", "#b87924", { threshold: 0.02 }), {
    levels: [-0.45, 0.48],
    axis: [0, 1, 0],
    width: 0.05,
  });
  const ANTIQUE_GOLD = cel("#d99e36", "#8c5219");
  const BEAK_GOLD = inkLines(cel("#ffcf5c", "#bf7820"), {
    levels: [0.15],
    axis: [0, 0, 1],
    width: 0.05,
  });

  // Body & neck plumage: warm vermilion-to-crimson dorsal gradient with zig-zag ivory breast/belly
  const DORSAL_COAT = gradient(CRIMSON_PLUME, SOLAR_ORANGE, [0, 0.58, -0.25], [0, 1.35, 0.32]);
  const BODY_PAINT = cel(
    furEdge(DORSAL_COAT, IVORY_CREAM, {
      level: -0.12,
      teeth: 0.26,
      period: 0.036,
      along: [0, 0.35, 0.94],
      ink: INK,
      inkWidth: 0.055,
    }),
  );

  const NECK_PAINT = cel(
    furEdge(
      gradient(VERMILION, AMBER_GOLD, [0, 0.85, 0.18], [0, 1.34, 0.28]),
      IVORY_CREAM,
      {
        axis: [0, 0.25, 0.97],
        level: 0.18,
        teeth: 0.24,
        period: 0.028,
        along: [1, 0, 0],
        ink: INK,
        inkWidth: 0.055,
      },
    ),
  );

  const HEAD_PAINT = cel(
    furEdge(CRIMSON_PLUME, SOLAR_ORANGE, {
      by: "position",
      axis: [0, 1, 0],
      level: 1.31,
      teeth: 0.022,
      period: 0.024,
      along: [0, 0, 1],
      ink: INK,
    }),
  );

  // Wing membrane paint: uses surface coordinates s = [along, across] (0 at leading arm, 1 at trailing edge)
  const WING_MEMBRANE_PAINT = cel(
    paint((p, _n, s) => {
      const along = s[0];
      const across = s[1];
      const tooth = 0.08 * zigzag(along * 14);
      const wave = 0.04 * (noise(p, 0.09, 17) - 0.5);
      const u = across + tooth + wave;
      if (u < 0.24) return RUBY_DEEP;
      if (Math.abs(u - 0.24) < 0.018) return INK;
      if (u < 0.54) return CRIMSON_PLUME;
      if (Math.abs(u - 0.54) < 0.018) return INK;
      if (u < 0.80) return VERMILION;
      return mix(SOLAR_ORANGE, AMBER_GOLD, smoothstep(0.8, 0.98, u));
    }),
  );

  // Tail streamer paint: uses surface coordinates s = [t, deg]
  const TAIL_STREAMER_PAINT = cel(
    paint((p, _n, s) => {
      const t = s[0];
      const flutter = 0.06 * zigzag(s[1] / 30) + 0.04 * (noise(p, 0.08, 31) - 0.5);
      const u = t + flutter;
      if (u < 0.25) return CRIMSON_PLUME;
      if (u < 0.58) return VERMILION;
      if (u < 0.82) return SOLAR_ORANGE;
      return AMBER_GOLD;
    }),
  );

  // Avian scaled lower legs
  const LEG_SCALES = cel(
    scales([AMBER_GOLD, "#e08b26"], "#6b280e", {
      size: 0.018,
      width: 0.16,
      seed: 11,
    }),
  );

  const THIGH_PAINT = cel(
    countershade(CRIMSON_PLUME, SOLAR_ORANGE, { level: -0.05, soft: 0.25 }),
  );

  // ---------------------------------------------------------------------------
  // SVG Textures: Eyes, Pyro Elemental Sigil, Flame Feather Cards & Embers
  // ---------------------------------------------------------------------------
  const EYE_TEX = animeEye({
    iris: "#ff6a14",
    irisLight: "#fff380",
    irisDark: "#7a0c18",
    ink: INK,
    blush: "#ff8c42",
    brow: true,
    size: 512,
  });

  // Layered flame-feather card texture (coloured SVG)
  const FEATHER_CARD_TEX = svg(
    `<svg viewBox="0 0 96 192">
      <path d="M48 188 C20 148 10 92 22 38 C30 18 40 8 48 2 C56 8 66 18 74 38 C86 92 76 148 48 188 Z"
            fill="#bf1b2c" stroke="${INK}" stroke-width="5"/>
      <path d="M48 164 C26 130 18 84 28 38 C35 20 42 12 48 6 C54 12 61 20 68 38 C78 84 70 130 48 164 Z"
            fill="#f24924"/>
      <path d="M48 122 C33 96 28 62 35 30 C40 16 44 10 48 6 C52 10 56 16 61 30 C68 62 63 96 48 122 Z"
            fill="#ff9824"/>
      <path d="M48 68 L36 36 L48 10 L60 36 Z" fill="#fff294"/>
      <path d="M48 184 L48 10" stroke="#ffd866" stroke-width="4" stroke-linecap="round"/>
      <path d="M48 140 L26 116 M48 112 L24 86 M48 84 L28 58 M48 140 L70 116 M48 112 L72 86 M48 84 L68 58"
            stroke="#ffd866" stroke-width="2.6" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  // Glowing Pyro ember & star-spark card texture
  const EMBER_CARD_TEX = svg(
    `<svg viewBox="0 0 128 192">
      <path d="M64 184 C36 150 26 106 42 64 C50 42 44 22 64 6 C84 22 78 42 86 64 C102 106 92 150 64 184 Z"
            fill="#ff3b14"/>
      <path d="M64 166 C44 138 38 102 50 66 C56 48 54 30 64 16 C74 30 72 48 78 66 C90 102 84 138 64 166 Z"
            fill="#ff9a22"/>
      <path d="M64 136 C52 114 48 88 56 62 L64 28 L72 62 C80 88 76 114 64 136 Z"
            fill="#fff59e"/>
      <path d="M24 52 L28 38 L42 34 L28 30 L24 16 L20 30 L6 34 L20 38 Z" fill="#fff6a8"/>
      <path d="M104 82 L107 70 L119 67 L107 64 L104 52 L101 64 L89 67 L101 70 Z" fill="#ffcf4d"/>
      <circle cx="34" cy="118" r="6" fill="#ffd866"/>
      <circle cx="96" cy="130" r="5" fill="#fff6a8"/>
    </svg>`,
    { size: 256 },
  );

  // Genshin-inspired Pyro lotus-diamond elemental crest
  const PYRO_SIGIL_TEX = svg(
    `<svg viewBox="0 0 256 256">
      <polygon points="128,10 246,128 128,246 10,128" fill="#5e0b18" stroke="#ffd866" stroke-width="10"/>
      <polygon points="128,28 228,128 128,228 28,128" fill="#bf1b2c" stroke="#ff9a22" stroke-width="6"/>
      <circle cx="128" cy="128" r="68" fill="#ff3b14" stroke="#ffd866" stroke-width="7"/>
      <path d="M128 42 C152 78 176 98 176 136 C176 166 154 188 128 188 C102 188 80 166 80 136 C80 98 104 78 128 42 Z"
            fill="#ffae2b" stroke="#fff6a8" stroke-width="5"/>
      <path d="M128 68 C144 96 156 112 156 138 C156 156 144 170 128 170 C112 170 100 156 100 138 C100 112 112 96 128 68 Z"
            fill="#fff6a8"/>
      <polygon points="128,96 146,132 128,162 110,132" fill="#ff3b14"/>
    </svg>`,
    { size: 512 },
  );

  // Ornate tail ocellus (eye-spot) feather emblem texture
  const OCELLUS_TEX = svg(
    `<svg viewBox="0 0 160 220">
      <path d="M80 212 C28 176 12 112 30 48 C42 20 62 8 80 4 C98 8 118 20 130 48 C148 112 132 176 80 212 Z"
            fill="#8c1122" stroke="#ffd866" stroke-width="7"/>
      <ellipse cx="80" cy="102" rx="44" ry="58" fill="#ff4518" stroke="#ffd866" stroke-width="6"/>
      <ellipse cx="80" cy="98" rx="28" ry="38" fill="#ffae2b"/>
      <polygon points="80,46 104,98 80,142 56,98" fill="#fff6a8"/>
      <polygon points="80,68 94,98 80,122 66,98" fill="#5e0b18"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // 1. SKELETON: Pelvis, Spine, Neck, Head, Jaw, Crown, Spread Wings, Legs, Tail
  // ---------------------------------------------------------------------------
  const pelvis = b.joint("pelvis", {
    at: [0, 0.62, -0.06],
    dir: [0, 0.35, 0.94],
    role: "spine",
    group: "torso",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.62, -0.06],
      [0, 0.73, 0.07],
      [0, 0.85, 0.19],
    ]),
    {
      parent: pelvis,
      names: ["spine1", "chest"],
      role: "spine",
      group: "torso",
    },
  );
  const chest = spine.joints[1];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.85, 0.19],
      [0, 1.02, 0.26],
      [0, 1.18, 0.23],
      [0, 1.33, 0.27],
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
    at: [0, 1.33, 0.27],
    dir: [0, -0.05, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.29, 0.34],
    dir: [0, -0.25, 0.97],
    role: "jaw",
    group: "head",
  });

  // Royal central crest chain on head
  const crestMain = b.chain(
    "crestMain",
    catmull([
      [0, 1.41, 0.27],
      [0, 1.56, 0.08],
      [0, 1.69, -0.18],
    ]),
    {
      parent: head,
      names: ["crest1", "crest2"],
      role: "fan",
      group: "head",
    },
  );

  // Central tail chain arching gracefully behind and upward
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.62, -0.09],
      [0, 0.56, -0.32],
      [0, 0.63, -0.58],
      [0, 0.80, -0.82],
      [0, 1.03, -0.99],
      [0, 1.27, -1.11],
    ]),
    {
      parent: pelvis,
      names: ["tail1", "tail2", "tail3", "tail4", "tail5"],
      role: "tail",
      group: "tail",
    },
  );

  // Upper tail peacock-phoenix fan ring (3 group joints driving 9 plumes)
  const tailFanRing = b.ring(
    frame([0, 0.65, -0.11], [0, 0.38, -0.92]),
    {
      count: 9,
      fromDeg: -68,
      toDeg: 68,
      radius: 0.08,
      tilt: 20,
      joints: 3,
      name: "tailFan",
      parent: pelvis,
      role: "fan",
      group: "tail",
    },
  );

  // Bilateral chains: Wings, Wing Feather Struts, Legs, Digits, Side Crests, Tail Ribbons
  type SideRig = {
    s: number;
    side: "L" | "R";
    crestSide: ReturnType<typeof b.joint>;
    wing: ReturnType<typeof b.chain>;
    ribInner: ReturnType<typeof b.chain>;
    ribMid: ReturnType<typeof b.chain>;
    ribOuter: ReturnType<typeof b.chain>;
    leg: ReturnType<typeof b.chain>;
    toeIn: ReturnType<typeof b.joint>;
    toeMid: ReturnType<typeof b.joint>;
    toeOut: ReturnType<typeof b.joint>;
    toeBack: ReturnType<typeof b.joint>;
    tailRibbon: ReturnType<typeof b.chain>;
  };

  const sides: SideRig[] = [];
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";

    const crestSide = b.joint(`crestSide${side}`, {
      parent: head,
      at: [s * 0.055, 1.39, 0.25],
      dir: [s * 0.34, 0.72, -0.60],
      role: "fan",
      group: `head`,
    });

    // Grand spread wing arm chain
    const wing = b.chain(
      `wing${side}`,
      catmull([
        [s * 0.13, 0.86, 0.12],
        [s * 0.42, 1.03, 0.05],
        [s * 0.74, 1.26, 0.10],
        [s * 0.99, 1.42, -0.02],
        [s * 1.12, 1.52, -0.16],
      ]),
      {
        parent: chest,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `wingTip${side}`],
        role: "wing",
        group: `wing${side}`,
      },
    );

    const elbow = wing.joints[1];
    const wrist = wing.joints[2];
    const wingTip = wing.joints[3];

    // Trailing feather rib chains so wing membranes flex smoothly with the wing joints
    const ribInner = b.chain(
      `wingRibIn${side}`,
      catmull([
        [s * 0.42, 1.01, 0.03],
        [s * 0.47, 0.87, -0.20],
        [s * 0.51, 0.75, -0.42],
      ]),
      {
        parent: elbow,
        names: [`wingRibInA${side}`, `wingRibInB${side}`],
        role: "fan",
        group: `wing${side}`,
      },
    );

    const ribMid = b.chain(
      `wingRibMid${side}`,
      catmull([
        [s * 0.74, 1.24, 0.08],
        [s * 0.80, 1.07, -0.18],
        [s * 0.85, 0.91, -0.44],
      ]),
      {
        parent: wrist,
        names: [`wingRibMidA${side}`, `wingRibMidB${side}`],
        role: "fan",
        group: `wing${side}`,
      },
    );

    const ribOuter = b.chain(
      `wingRibOut${side}`,
      catmull([
        [s * 0.99, 1.40, -0.04],
        [s * 1.05, 1.26, -0.28],
        [s * 1.10, 1.13, -0.50],
      ]),
      {
        parent: wingTip,
        names: [`wingRibOutA${side}`, `wingRibOutB${side}`],
        role: "fan",
        group: `wing${side}`,
      },
    );

    // Avian digitigrade leg solved via IK to land cleanly above y = 0
    const hipPt: [number, number, number] = [s * 0.13, 0.60, -0.02];
    const anklePt: [number, number, number] = [s * 0.17, 0.026, 0.04];
    const legPts = limb(hipPt, anklePt, [0.25, 0.24, 0.18], [
      [0, 0, 1],
      [0, 0, -1],
    ]);

    const leg = b.chain(`leg${side}`, legPts, {
      parent: pelvis,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
      role: "leg",
      contact: [s * 0.17, 0, 0.06],
      group: `leg${side}`,
    });
    const foot = leg.joints[3];

    // 4 articulated toes resting on y = 0
    const toeIn = b.joint(`toeIn${side}`, {
      parent: foot,
      at: [s * 0.135, 0.02, 0.062],
      dir: [s * -0.22, -0.04, 0.97],
      role: "digit",
      group: `foot${side}`,
    });
    const toeMid = b.joint(`toeMid${side}`, {
      parent: foot,
      at: [s * 0.17, 0.02, 0.07],
      dir: [0, -0.04, 1],
      role: "digit",
      group: `foot${side}`,
    });
    const toeOut = b.joint(`toeOut${side}`, {
      parent: foot,
      at: [s * 0.205, 0.02, 0.062],
      dir: [s * 0.24, -0.04, 0.97],
      role: "digit",
      group: `foot${side}`,
    });
    const toeBack = b.joint(`toeBack${side}`, {
      parent: foot,
      at: [s * 0.17, 0.022, 0.014],
      dir: [0, -0.05, -1],
      role: "digit",
      group: `foot${side}`,
    });

    // Flowing lateral tail ribbon chains
    const tailRibbon = b.chain(
      `tailRib${side}`,
      catmull([
        [s * 0.08, 0.60, -0.11],
        [s * 0.24, 0.52, -0.40],
        [s * 0.42, 0.66, -0.74],
        [s * 0.56, 0.94, -1.04],
      ]),
      {
        parent: pelvis,
        names: [`tailRib1${side}`, `tailRib2${side}`, `tailRib3${side}`],
        role: "tail",
        group: "tail",
      },
    );

    sides.push({
      s,
      side,
      crestSide,
      wing,
      ribInner,
      ribMid,
      ribOuter,
      leg,
      toeIn,
      toeMid,
      toeOut,
      toeBack,
      tailRibbon,
    });
  }

  // Open the lower beak slightly for a fierce, living expression
  b.pose(jaw, { axis: [1, 0, 0], deg: 10 });

  // ---------------------------------------------------------------------------
  // 2. BODY, CHEST, NECK & REGAL COLLAR
  // ---------------------------------------------------------------------------
  // Continuous smooth-skinned body loft from rump through pelvis and chest
  const bodyLoft = b.loft(
    [
      { at: [0, 0.62, -0.14], w: 0.16, h: 0.16 },
      { at: [0, 0.62, -0.05], w: 0.28, h: 0.27 },
      { at: [0, 0.72, 0.08], w: 0.34, h: 0.33 },
      { at: [0, 0.85, 0.20], w: 0.31, h: 0.30 },
      { at: [0, 0.92, 0.25], w: 0.20, h: 0.21 },
    ],
    {
      bone: [pelvis, spine],
      color: BODY_PAINT,
      sides: 10,
      name: "torsoLoft",
      group: "torso",
    },
  );

  // Graceful S-curved neck sweep
  const neckTube = b.sweep(
    neck,
    (t) => [0.095 * (1 - 0.32 * t), 0.105 * (1 - 0.32 * t)],
    {
      color: NECK_PAINT,
      sides: 8,
      name: "neckTube",
      group: "neck",
    },
  );

  // Puffed golden-ivory breast plumage shield on the front of the chest
  const breastPlumeOutline: OutlinePoint[] = [
    [0, -0.16, "sharp"],
    [0.11, -0.06],
    [0.14, 0.08],
    [0.07, 0.16],
    [0, 0.13, "sharp"],
    [-0.07, 0.16],
    [-0.14, 0.08],
    [-0.11, -0.06],
  ];
  b.extrude(breastPlumeOutline, {
    bone: chest,
    at: [0, 0.82, 0.32],
    x: [1, 0, 0],
    y: [0, 0.92, -0.38],
    thickness: [0.025, 0.06],
    smoothing: 1,
    color: CEL_CREAM,
    name: "breastPlumeShield",
    group: "torso",
  });

  // Sculpted layered flame-ruff blades framing the upper chest
  const ruffBladeOutline: OutlinePoint[] = [
    [0, 0, "sharp"],
    [0.045, 0.06],
    [0.032, 0.16],
    [0, 0.24, "sharp"],
    [-0.032, 0.16],
    [-0.045, 0.06],
  ];
  b.ring(
    frame([0, 0.88, 0.21], [0, 0.88, 0.46]),
    { count: 7, fromDeg: -105, toDeg: 105, radius: 0.13, tilt: 128 },
    (item) => {
      const isOuter = Math.abs(item.t - 0.5) > 0.28;
      b.extrude(ruffBladeOutline, {
        bone: chest,
        at: item.at,
        x: item.dir([1, 0, 0]),
        y: item.axis,
        thickness: [0.022, 0.004],
        smoothing: 1,
        color: isOuter ? CEL_VERMILION : CEL_GOLD_PLUME,
        group: "torso",
      });
    },
  );

  // Genshin Impact Ornate Celestial Gold Torque / Collar draped around upper chest
  const torsoSkin = b.surface([bodyLoft, neckTube]);
  const collarLoop = torsoSkin.loop(frame([0, 0.91, 0.21], [0, 0.92, 0.38]), { lift: 0.012 });
  b.sweep(collarLoop, [0.02, 0.016], {
    bone: chest,
    color: CELESTIAL_GOLD,
    sides: 6,
    name: "celestialCollar",
    group: "regalia",
  });

  // Golden studs & glowing Pyro gems along the collar
  b.along(collarLoop, 8, (pt) => {
    b.part(new THREE.OctahedronGeometry(0.022, 0), GOLD_FLAT, {
      bone: chest,
      frame: pt,
      group: "regalia",
    });
  });

  // Central Chest Pyro Vision-style Medallion & Pectoral Filigree
  const chestBezel = b.lathe(
    [
      [0, 0],
      [0.068, 0.005],
      [0.075, 0.022],
      [0.052, 0.034],
      [0, 0.036],
    ],
    {
      bone: chest,
      at: [0, 0.86, 0.34],
      axis: [0, -0.25, 0.97],
      segments: 8,
      color: CELESTIAL_GOLD,
      name: "chestMedallionBezel",
      group: "regalia",
    },
  );

  glow(
    b.part(new THREE.OctahedronGeometry(0.044, 0), GLOW_PYRO, {
      bone: chest,
      at: chestBezel.local([0, 0.03, 0]),
      scale: [0.95, 1.3, 0.55],
      name: "chestPyroGem",
      group: "regalia",
    }),
    1.8,
  );

  // Glowing Pyro lotus-sigil emblem plane just in front of the pectoral gem
  glow(
    b.part(new THREE.PlaneGeometry(0.11, 0.11), "#ffffff", {
      bone: chest,
      at: [0, 0.86, 0.382],
      dir: [0, -0.22, 0.97],
      axis: "z",
      texture: PYRO_SIGIL_TEX,
      name: "chestPyroSigil",
      group: "regalia",
    }),
    1.4,
  );

  // Three ornate golden & glowing ruby tassels hanging from the chest medallion
  for (const k of [-1, 0, 1]) {
    const tx = k * 0.048;
    const ty = 0.80 - Math.abs(k) * 0.015;
    const tz = 0.35 - Math.abs(k) * 0.012;
    b.rod([tx, ty + 0.04, tz], [tx, ty - 0.05, tz + 0.01], [0.009, 0.014], CELESTIAL_GOLD, {
      bone: chest,
      sides: 5,
      group: "regalia",
    });
    glow(
      b.spike([tx, ty - 0.05, tz + 0.01], [0, -1, 0.08], 0.065, 0.018, GLOW_SOLAR, {
        bone: chest,
        sides: 5,
        group: "regalia",
      }),
      1.5,
    );
  }

  // ---------------------------------------------------------------------------
  // 3. FLOATING-LOOK ADEPTUS SOLAR HALO (MOUNTED TO UPPER BACK VIA GOLDEN BRACKETS)
  // ---------------------------------------------------------------------------
  // Two swept golden dorsal wing-mounts anchoring the solar ring solidly to the chest bone
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.sweep(
      bezier(
        [s * 0.07, 0.88, 0.11],
        [s * 0.15, 0.98, -0.02],
        [s * 0.21, 1.12, -0.06],
      ),
      [0.022, 0.014],
      {
        bone: chest,
        color: CELESTIAL_GOLD,
        sides: 5,
        caps: "flat",
        name: `haloMount${side}`,
        group: "regalia",
      },
    );
  }

  // Celestial golden solar ring framing the phoenix's head & shoulders from behind
  const haloCenter: [number, number, number] = [0, 1.24, -0.06];
  const haloRadius = 0.24;
  const haloPts = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return [
      haloCenter[0] + Math.cos(a) * haloRadius,
      haloCenter[1] + Math.sin(a) * haloRadius,
      haloCenter[2],
    ];
  });
  b.sweep(catmull(haloPts, { closed: true }), [0.016, 0.012], {
    bone: chest,
    color: CELESTIAL_GOLD,
    sides: 6,
    name: "solarHaloRing",
    group: "regalia",
  });

  // Glowing solar ray spikes radiating around the dorsal adeptus halo
  b.ring(
    frame(haloCenter, [0, 0, 1]),
    { count: 9, fromDeg: -110, toDeg: 110, radius: haloRadius },
    (ray) => {
      const isMajor = ray.i % 2 === 0;
      glow(
        b.spike(
          ray.at,
          ray.axis,
          isMajor ? 0.12 : 0.075,
          isMajor ? 0.022 : 0.015,
          isMajor ? GLOW_CORE : GLOW_PYRO,
          {
            bone: chest,
            sides: 4,
            group: "regalia",
          },
        ),
        1.7,
      );
    },
  );

  // ---------------------------------------------------------------------------
  // 4. HEAD, BEAK, ANIME EYES, CELESTIAL DIADEM & ROYAL FLAME CREST
  // ---------------------------------------------------------------------------
  const headCenter: [number, number, number] = [0, 1.35, 0.29];
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), HEAD_PAINT, {
    bone: head,
    at: headCenter,
    scale: [0.095, 0.088, 0.112],
    name: "skull",
    group: "head",
  });

  // Sculpted cheek ruff flares on either side of the head
  const cheekFlareOutline: OutlinePoint[] = [
    [0, 0, "sharp"],
    [0.06, 0.03],
    [0.13, 0.01, "sharp"],
    [0.09, -0.04],
    [0.03, -0.05],
  ];
  for (const { s, side } of sides) {
    b.extrude(cheekFlareOutline, {
      bone: head,
      at: [s * 0.07, 1.33, 0.28],
      x: [s * 0.65, 0.1, -0.75],
      y: [0, 1, 0],
      thickness: [0.026, 0.005],
      smoothing: 1,
      color: CEL_GOLD_PLUME,
      name: `cheekFlare${side}`,
      group: "head",
    });

    // Swept golden-flame eyebrow ridges above each eye
    const browPath = bezier(
      [s * 0.042, 1.39, 0.37],
      [s * 0.095, 1.43, 0.30],
      [s * 0.135, 1.48, 0.18],
    );
    b.sweep(browPath, [0.018, 0.004], {
      bone: head,
      color: CELESTIAL_GOLD,
      sides: 5,
      caps: { start: "round", end: "point" },
      name: `browPlume${side}`,
      group: "head",
    });
    glow(
      b.spike([s * 0.12, 1.46, 0.21], [s * 0.35, 0.5, -0.8], 0.09, 0.012, GLOW_CORE, {
        bone: head,
        sides: 4,
        name: `browTipGlow${side}`,
        group: "head",
      }),
      1.6,
    );
  }

  // Conformed animeEye decals on the skull
  const skullSurface = b.surface(skull);
  for (const { s, side } of sides) {
    const eyeHit = skullSurface.around(headCenter).at(s * 52, 4);
    if (eyeHit) {
      b.decal(skullSurface, EYE_TEX, {
        bone: head,
        at: eyeHit,
        size: [0.068, 0.088],
        mirror: s > 0,
        name: `eyeDecal${side}`,
        group: "head",
      });
    }
  }

  // Sharp hooked upper raptor/phoenix beak
  const upperBeakPath = bezier(
    [0, 1.35, 0.36],
    [0, 1.35, 0.45],
    [0, 1.29, 0.50],
  );
  b.sweep(
    upperBeakPath,
    (t) => [0.042 * (1 - 0.88 * t), 0.046 * (1 - 0.85 * t)],
    {
      bone: head,
      color: BEAK_GOLD,
      section: { ngon: 4 },
      caps: { start: "flat", end: "point" },
      name: "upperBeak",
      group: "head",
    },
  );

  // Articulated lower beak on the jaw joint + glowing Pyro tongue inside
  const lowerBeakPath = bezier(
    [0, 1.30, 0.34],
    [0, 1.29, 0.41],
    [0, 1.28, 0.46],
  );
  b.sweep(
    lowerBeakPath,
    (t) => [0.032 * (1 - 0.85 * t), 0.026 * (1 - 0.85 * t)],
    {
      bone: jaw,
      color: ANTIQUE_GOLD,
      section: { ngon: 4 },
      caps: { start: "flat", end: "point" },
      name: "lowerBeak",
      group: "head",
    },
  );
  glow(
    b.spike([0, 1.31, 0.36], [0, -0.1, 1], 0.075, 0.016, GLOW_SOLAR, {
      bone: jaw,
      sides: 4,
      name: "fieryTongue",
      group: "head",
    }),
    1.6,
  );

  // Genshin Adeptus Diadem / Crown on the forehead
  b.sweep(
    bezier(
      [-0.065, 1.40, 0.31],
      [0, 1.44, 0.37],
      [0.065, 1.40, 0.31],
    ),
    [0.014, 0.012],
    {
      bone: head,
      color: CELESTIAL_GOLD,
      sides: 5,
      caps: "point",
      name: "crownTiaraArc",
      group: "head",
    },
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.028, 0), GLOW_PYRO, {
      bone: head,
      at: [0, 1.44, 0.36],
      scale: [0.8, 1.35, 0.6],
      name: "crownCenterGem",
      group: "head",
    }),
    1.9,
  );

  // Central articulated royal crown plume (swept along crestMain chain)
  b.sweep(
    crestMain,
    (t) => [0.018 * (1 - 0.65 * t), 0.032 * (1 - 0.55 * t)],
    {
      color: CEL_VERMILION,
      sides: 6,
      caps: { start: "flat", end: "point" },
      name: "crestMainPlume",
      group: "head",
    },
  );
  glow(
    b.spike(crestMain.at(0.75), crestMain.at(1).tangent, 0.14, 0.022, GLOW_CORE, {
      bone: crestMain.joints[1],
      sides: 4,
      name: "crestMainGlowTip",
      group: "head",
    }),
    1.8,
  );

  // Side crown plumes on crestSideL / crestSideR joints
  const crownFeatherOutline: OutlinePoint[] = [
    [0, 0, "sharp"],
    [0.03, 0.08],
    [0.042, 0.22],
    [0.018, 0.34],
    [0, 0.42, "sharp"],
    [-0.022, 0.30],
    [-0.028, 0.14],
  ];
  for (const { s, side, crestSide } of sides) {
    b.extrude(crownFeatherOutline, {
      bone: crestSide,
      at: crestSide.at,
      x: [s * 0.25, -0.62, -0.74],
      y: crestSide.axis,
      thickness: [0.018, 0.004],
      smoothing: 1,
      color: CEL_ORANGE,
      name: `crestSideFeather${side}`,
      group: "head",
    });
    glow(
      b.spike(
         crestSide.local([0, 0.28, 0]),
        crestSide.axis,
        0.16,
        0.018,
        GLOW_SOLAR,
        {
          bone: crestSide,
          sides: 4,
          name: `crestSideGlow${side}`,
          group: "head",
        },
      ),
      1.7,
    );
  }

  // ---------------------------------------------------------------------------
  // 5. SPREAD SOLAR WINGS: ARM BONES, SMOOTH MEMBRANES, FLIGHT FEATHERS & ARMOR
  // ---------------------------------------------------------------------------
  const primaryFeatherOutline: OutlinePoint[] = [
    [0, 0, "sharp"],
    [0.038, 0.10],
    [0.048, 0.28],
    [0.034, 0.46],
    [0, 0.58, "sharp"],
    [-0.028, 0.42],
    [-0.032, 0.18],
  ];

  const covertFeatherOutline: OutlinePoint[] = [
    [0, 0, "sharp"],
    [0.034, 0.06],
    [0.040, 0.16],
    [0, 0.24, "sharp"],
    [-0.040, 0.16],
    [-0.034, 0.06],
  ];

  for (const { s, side, wing, ribInner, ribMid, ribOuter } of sides) {
    const shoulder = wing.joints[0];
    const elbow = wing.joints[1];
    const wrist = wing.joints[2];
    const wingTip = wing.joints[3];

    // Leading-edge muscular wing arm tube
    b.sweep(
      wing,
      (t) => [0.056 * (1 - 0.62 * t), 0.048 * (1 - 0.62 * t)],
      {
        color: CEL_CRIMSON,
        sides: 6,
        caps: { start: "round", end: "point" },
        name: `wingArm${side}`,
        group: `wing${side}`,
      },
    );

    // Golden filigree leading-edge wing trim along the arm
    b.sweep(
      wing.path,
      (t) => 0.022 * (1 - 0.55 * t),
      {
        bone: wing,
        shift: [0, 0.038],
        color: CELESTIAL_GOLD,
        sides: 5,
        caps: "point",
        name: `wingGoldTrim${side}`,
        group: `wing${side}`,
      },
    );

    // Three smooth-skinned trailing wing membranes spanning between the wing ribs
    b.membrane(
      [
        [s * 0.13, 0.85, 0.10],
        [s * 0.22, 0.74, -0.08],
        [s * 0.34, 0.68, -0.26],
      ],
      ribInner,
      {
        color: WING_MEMBRANE_PAINT,
        thickness: 0.016,
        scallop: 0.12,
        rows: 4,
        name: `wingMembraneInner${side}`,
        group: `wing${side}`,
      },
    );

    b.membrane(ribInner, ribMid, {
      color: WING_MEMBRANE_PAINT,
      thickness: 0.016,
      scallop: 0.14,
      rows: 4,
      name: `wingMembraneMid${side}`,
      group: `wing${side}`,
    });

    b.membrane(ribMid, ribOuter, {
      color: WING_MEMBRANE_PAINT,
      thickness: 0.015,
      scallop: 0.15,
      rows: 4,
      name: `wingMembraneOuter${side}`,
      group: `wing${side}`,
    });

    // Ornate Genshin Shoulder Pauldron & Wrist Alula Ornament with glowing Pyro crystals
    b.lathe(
      [
        [0, 0],
        [0.068, 0.01],
        [0.078, 0.035],
        [0.048, 0.06],
        [0, 0.072],
      ],
      {
        bone: shoulder,
        at: [s * 0.18, 0.91, 0.13],
        axis: [s * 0.6, 0.7, 0.38],
        segments: 6,
        color: CELESTIAL_GOLD,
        name: `shoulderPauldron${side}`,
        group: `wing${side}`,
      },
    );
    glow(
      b.part(new THREE.OctahedronGeometry(0.032, 0), GLOW_PYRO, {
        bone: shoulder,
        at: [s * 0.20, 0.95, 0.15],
        scale: [0.9, 1.3, 0.7],
        name: `shoulderGem${side}`,
        group: `wing${side}`,
      }),
      1.7,
    );

    // Wrist alula golden winglet + blazing thumb-claw spike
    b.extrude(covertFeatherOutline, {
      bone: wrist,
      at: [s * 0.74, 1.29, 0.12],
      x: [0, 0, -1],
      y: [s * 0.82, 0.56, 0.1],
      thickness: [0.022, 0.004],
      smoothing: 1,
      color: CELESTIAL_GOLD,
      name: `wristAlula${side}`,
      group: `wing${side}`,
    });
    glow(
      b.spike([s * 0.75, 1.30, 0.13], [s * 0.7, 0.68, 0.22], 0.17, 0.022, GLOW_CORE, {
        bone: wrist,
        sides: 4,
        name: `wristAlulaFlame${side}`,
        group: `wing${side}`,
      }),
      1.8,
    );

    // 11 Sculpted Primary & Secondary Flight Feathers fanning along the wing arm
    const pinionCount = 11;
    for (let i = 0; i < pinionCount; i++) {
      const u = i / (pinionCount - 1);
      const tWing = 0.12 + u * 0.86;
      const anchor = wing.at(tWing);
      const ownerBone =
        u < 0.25 ? shoulder : u < 0.55 ? elbow : u < 0.82 ? wrist : wingTip;

      // Fan direction: inner secondaries sweep backward/down, outer primaries sweep outward/back/up
      const fanDir: [number, number, number] = [
        s * (0.20 + 0.78 * u),
        -0.42 + 0.58 * u,
        -0.88 + 0.34 * u,
      ];
      const bladeLenScale = 0.72 + 0.42 * Math.sin(u * Math.PI * 0.85);

      const scaledPrimary: OutlinePoint[] = primaryFeatherOutline.map((pt) =>
        pt.length === 3
          ? [pt[0] * bladeLenScale, pt[1] * bladeLenScale, "sharp"]
          : [pt[0] * bladeLenScale, pt[1] * bladeLenScale],
      );

      // Main sculpted feather blade
      b.extrude(scaledPrimary, {
        bone: ownerBone,
        at: anchor.at,
        x: [s * 0.3, -0.92, 0.25],
        y: fanDir,
        thickness: [0.018, 0.004],
        smoothing: 1,
        color: i % 2 === 0 ? CEL_VERMILION : CEL_ORANGE,
        name: `pinionBlade${side}_${i}`,
        group: `wing${side}`,
      });

      // Golden central rachis quill rod
      const tipPt = offset(anchor.at, fanDir, 0.54 * bladeLenScale);
      b.rod(anchor.at, tipPt, [0.009, 0.003], CELESTIAL_GOLD, {
        bone: ownerBone,
        sides: 4,
        group: `wing${side}`,
      });

      // Glowing Pyro flame tip extending from the end of every flight feather
      const glowTipBase = offset(anchor.at, fanDir, 0.42 * bladeLenScale);
      glow(
        b.spike(
          glowTipBase,
          fanDir,
          0.22 * bladeLenScale,
          0.024 * bladeLenScale,
          i % 3 === 0 ? GLOW_CORE : i % 3 === 1 ? GLOW_SOLAR : GLOW_PYRO,
          {
            bone: ownerBone,
            sides: 4,
            name: `pinionGlowTip${side}_${i}`,
            group: `wing${side}`,
          },
        ),
        1.7,
      );
    }

    // Overlapping Greater & Median Covert Feather Rows (both dorsal and ventral)
    const covertCount = 8;
    for (let i = 0; i < covertCount; i++) {
      const u = i / (covertCount - 1);
      const tWing = 0.10 + u * 0.80;
      const anchor = wing.at(tWing);
      const ownerBone =
        u < 0.28 ? shoulder : u < 0.58 ? elbow : u < 0.85 ? wrist : wingTip;
      const covDir: [number, number, number] = [
        s * (0.18 + 0.65 * u),
        -0.30 + 0.40 * u,
        -0.92 + 0.22 * u,
      ];

      // Upper ruby-plum covert blade
      b.extrude(covertFeatherOutline, {
        bone: ownerBone,
        at: offset(anchor.at, [0, 1, -0.3], 0.018),
        x: [s * 0.4, -0.85, 0.3],
        y: covDir,
        thickness: [0.018, 0.004],
        smoothing: 1,
        color: i % 2 === 0 ? CEL_RUBY : CEL_CRIMSON,
        group: `wing${side}`,
      });

      // Lower golden-amber underwing covert blade
      b.extrude(covertFeatherOutline, {
        bone: ownerBone,
        at: offset(anchor.at, [0, -1, -0.3], 0.016),
        x: [s * 0.4, 0.85, -0.3],
        y: covDir,
        thickness: [0.016, 0.004],
        smoothing: 1,
        color: CEL_GOLD_PLUME,
        group: `wing${side}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 6. AVIAN LEGS, FEATHERED THIGHS, GOLDEN ANKLETS & TALONS ON Y = 0
  // ---------------------------------------------------------------------------
  for (const { s, side, leg, toeIn, toeMid, toeOut, toeBack } of sides) {
    const hip = leg.joints[0];
    const knee = leg.joints[1];
    const hock = leg.joints[2];
    const foot = leg.joints[3];

    // Plush feathered thigh (hip -> knee) and upper drumstick (knee -> hock)
    b.capsule(hip.at, knee.at, [0.068, 0.052], THIGH_PAINT, {
      bone: hip,
      sides: 7,
      name: `thigh${side}`,
      group: `leg${side}`,
    });

    // Swept thigh flame-breech feathers flaring backward off the knee
    for (let k = 0; k < 3; k++) {
      const flareY = knee.at.y + k * 0.045;
      b.spike(
        [s * 0.16, flareY, knee.at.z - 0.01],
        [s * 0.18, -0.25, -0.95],
        0.13 - k * 0.015,
        0.024,
        k === 0 ? CEL_GOLD_PLUME : CEL_VERMILION,
        {
          bone: hip,
          sides: 4,
          group: `leg${side}`,
        },
      );
    }

    // Scaled lower leg (knee -> hock -> foot)
    b.capsule(knee.at, hock.at, [0.044, 0.028], LEG_SCALES, {
      bone: knee,
      sides: 6,
      name: `shin${side}`,
      group: `leg${side}`,
    });
    b.rod(hock.at, foot.at, [0.026, 0.022], LEG_SCALES, {
      bone: hock,
      sides: 6,
      name: `tarsus${side}`,
      group: `leg${side}`,
    });

    // Ornate Genshin Golden Anklet Ring & Winglet Spur above the foot
    const ankletAt = lerp(hock.at, foot.at, 0.58);
    b.lathe(
      [
        [0.02, -0.02],
        [0.036, -0.015],
        [0.038, 0.015],
        [0.02, 0.02],
      ],
      {
        bone: hock,
        at: ankletAt,
        axis: [0, 1, 0.1],
        segments: 6,
        color: CELESTIAL_GOLD,
        name: `anklet${side}`,
        group: `leg${side}`,
      },
    );
    glow(
      b.spike(
        [ankletAt.x + s * 0.028, ankletAt.y, ankletAt.z - 0.01],
        [s * 0.45, 0.45, -0.77],
        0.085,
        0.015,
        GLOW_SOLAR,
        {
          bone: hock,
          sides: 4,
          name: `ankletSpur${side}`,
          group: `leg${side}`,
        },
      ),
      1.6,
    );

    // Planted Foot Pad resting at y = 0 (bottom at y = 0.022 - 0.022 = 0.000)
    b.capsule(
      [s * 0.17, 0.022, 0.022],
      [s * 0.17, 0.022, 0.068],
      [0.022, 0.020],
      LEG_SCALES,
      {
        bone: foot,
        sides: 6,
        name: `footPad${side}`,
        group: `foot${side}`,
      },
    );

    // Three forward toes + one rear hallux resting flat on y = 0 with golden talons
    const toes = [
      { joint: toeIn, len: 0.075, r: 0.015 },
      { joint: toeMid, len: 0.092, r: 0.016 },
      { joint: toeOut, len: 0.075, r: 0.015 },
      { joint: toeBack, len: 0.058, r: 0.014 },
    ];
    for (const { joint, len, r } of toes) {
      const startPt: [number, number, number] = [joint.at.x, r, joint.at.z];
      const endPt = offset(startPt, [joint.axis.x, 0, joint.axis.z], len);
      endPt.y = r * 0.78;

      b.capsule(startPt, endPt, [r, r * 0.78], LEG_SCALES, {
        bone: joint,
        sides: 6,
        name: `${joint.name}Phalanx`,
        group: `foot${side}`,
      });

      // Curved golden raptor talon touching y = 0.002
      const clawTip = offset(endPt, [joint.axis.x, -0.18, joint.axis.z], 0.042);
      clawTip.y = 0.002;
      b.spike(endPt, clawTip, null, r * 0.76, CELESTIAL_GOLD, {
        bone: joint,
        sides: 4,
        name: `${joint.name}Talon`,
        group: `foot${side}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 7. MAGNIFICENT PYRO TAIL TRAIN, RIBBON STREAMERS & OCELLUS EYE-PLUMES
  // ---------------------------------------------------------------------------
  // Central tail plume tube swept along the 5-joint tail chain
  b.sweep(
    tail,
    (t) => [0.065 * (1 - 0.72 * t) + 0.012, 0.042 * (1 - 0.75 * t) + 0.008],
    {
      color: TAIL_STREAMER_PAINT,
      sides: 6,
      caps: { start: "round", end: "point" },
      name: "centralTailSweep",
      group: "tail",
    },
  );

  // Scalloped flame-fin membranes flanking both sides of the central tail chain
  const tailFinEdgeL = tail.joints.map((j, idx) =>
    j.local({ left: 0.055 + idx * 0.022, up: 0.015, forward: -0.04 }),
  );
  const tailFinEdgeR = tail.joints.map((j, idx) =>
    j.local({ right: 0.055 + idx * 0.022, up: 0.015, forward: -0.04 }),
  );
  b.membrane(tail, tailFinEdgeL, {
    color: WING_MEMBRANE_PAINT,
    thickness: 0.012,
    scallop: 0.16,
    rows: 3,
    name: "tailFinL",
    group: "tail",
  });
  b.membrane(tail, tailFinEdgeR, {
    color: WING_MEMBRANE_PAINT,
    thickness: 0.012,
    scallop: 0.16,
    rows: 3,
    name: "tailFinR",
    group: "tail",
  });

  // Glowing Pyro lotus-spear finial at the tip of the central tail
  const tailTipJoint = tail.joints[4];
  const tailFinialOutline: OutlinePoint[] = [
    [0, 0, "sharp"],
    [0.065, 0.09],
    [0.088, 0.22],
    [0.042, 0.34],
    [0, 0.44, "sharp"],
    [-0.042, 0.34],
    [-0.088, 0.22],
    [-0.065, 0.09],
  ];
  glow(
    b.extrude(tailFinialOutline, {
      bone: tailTipJoint,
      at: tail.at(0.88).at,
      x: [1, 0, 0],
      y: tail.at(1).tangent,
      thickness: [0.022, 0.005],
      smoothing: 1,
      color: GLOW_SOLAR,
      name: "centralTailGlowFinial",
      group: "tail",
    }),
    1.8,
  );
  b.part(new THREE.PlaneGeometry(0.16, 0.22), "#ffffff", {
    bone: tailTipJoint,
    at: offset(tail.at(0.95).at, [0, 1, 0], 0.018),
    dir: [0, 0.85, 0.52],
    axis: "z",
    texture: OCELLUS_TEX,
    name: "centralTailOcellus",
    group: "tail",
  });

  // Bilateral Long Flowing Tail Ribbons (swept along tailRibbonL / tailRibbonR chains)
  for (const { s, side, tailRibbon } of sides) {
    b.sweep(
      tailRibbon,
      (t) => [0.052 * (1 - 0.65 * t) + 0.01, 0.018 * (1 - 0.6 * t) + 0.005],
      {
        color: TAIL_STREAMER_PAINT,
        sides: 6,
        twist: s * 35,
        caps: { start: "round", end: "point" },
        name: `tailRibbonSweep${side}`,
        group: "tail",
      },
    );

    // Golden filigree spine wire along the top of each tail ribbon
    b.sweep(
      tailRibbon.path,
      (t) => 0.012 * (1 - 0.5 * t),
      {
        bone: tailRibbon,
        shift: [0, 0.018],
        color: CELESTIAL_GOLD,
        sides: 4,
        caps: "point",
        name: `tailRibbonGoldSpine${side}`,
        group: "tail",
      },
    );

    // Glowing Pyro flame finial & ocellus diamond at the tip of each lateral ribbon
    const ribTipJoint = tailRibbon.joints[2];
    const ribEnd = tailRibbon.at(0.88);
    glow(
      b.extrude(tailFinialOutline, {
        bone: ribTipJoint,
        at: ribEnd.at,
        x: [0.85, s * 0.35, 0.38],
        y: tailRibbon.at(1).tangent,
        thickness: [0.018, 0.004],
        smoothing: 1,
        color: GLOW_PYRO,
        name: `tailRibbonFinial${side}`,
        group: "tail",
      }),
      1.7,
    );
    glow(
      b.part(new THREE.OctahedronGeometry(0.038, 0), GLOW_CORE, {
        bone: ribTipJoint,
        at: offset(tailRibbon.at(1).at, tailRibbon.at(1).tangent, 0.12),
        scale: [0.9, 0.5, 1.6],
        name: `tailRibbonTipGem${side}`,
        group: "tail",
      }),
      2.0,
    );
  }

  // 9 Arching Peacock-Phoenix Train Plumes on the tailFan ring (3 group joints)
  const fanFeatherOutline: OutlinePoint[] = [
    [0, 0, "sharp"],
    [0.036, 0.14],
    [0.052, 0.36],
    [0.038, 0.54],
    [0, 0.66, "sharp"],
    [-0.038, 0.54],
    [-0.052, 0.36],
    [-0.036, 0.14],
  ];

  tailFanRing.items.forEach((item, idx) => {
    const u = (idx - 4) / 4; // -1 .. +1 across the fan
    const plumeDir: [number, number, number] = [
      u * 0.58,
      0.48 - Math.abs(u) * 0.16,
      -0.78,
    ];
    const plumeScale = 1.0 - Math.abs(u) * 0.22;
    const scaledFanOutline: OutlinePoint[] = fanFeatherOutline.map((pt) =>
      pt.length === 3
        ? [pt[0] * plumeScale, pt[1] * plumeScale, "sharp"]
        : [pt[0] * plumeScale, pt[1] * plumeScale],
    );

    b.extrude(scaledFanOutline, {
      bone: item.bone,
      at: item.at,
      x: [Math.cos(u * 0.5), Math.sin(u * 0.4), 0.2],
      y: plumeDir,
      thickness: [0.016, 0.004],
      smoothing: 1,
      color: idx % 2 === 0 ? CEL_CRIMSON : CEL_VERMILION,
      name: `tailFanPlume_${idx}`,
      group: "tail",
    });

    // Glowing solar tip + golden eye-spot gem near each fan plume's apex
    const eyeSpotPos = offset(item.at, plumeDir, 0.46 * plumeScale);
    b.part(new THREE.OctahedronGeometry(0.024, 0), GOLD_FLAT, {
      bone: item.bone,
      at: eyeSpotPos,
      scale: [1.1, 0.5, 1.3],
      group: "tail",
    });
    glow(
      b.spike(
        eyeSpotPos,
        plumeDir,
        0.22 * plumeScale,
        0.022 * plumeScale,
        idx % 2 === 0 ? GLOW_CORE : GLOW_SOLAR,
        {
          bone: item.bone,
          sides: 4,
          name: `tailFanGlowTip_${idx}`,
          group: "tail",
        },
      ),
      1.7,
    );
  });

  // Ornate Golden Rump Tail-Coronet Clasping the Base of the Train
  b.sweep(
    bezier(
      [-0.12, 0.65, -0.06],
      [0, 0.72, -0.14],
      [0.12, 0.65, -0.06],
    ),
    [0.018, 0.015],
    {
      bone: pelvis,
      color: CELESTIAL_GOLD,
      sides: 5,
      caps: "point",
      name: "rumpCoronetArc",
      group: "regalia",
    },
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.032, 0), GLOW_RUBY, {
      bone: pelvis,
      at: [0, 0.72, -0.13],
      scale: [1.1, 0.8, 1.3],
      name: "rumpCoronetGem",
      group: "regalia",
    }),
    1.8,
  );

  // ---------------------------------------------------------------------------
  // 8. LAYERED FEATHER CARDS & GLOWING PYRO EMBER CARDS
  // ---------------------------------------------------------------------------
  // Coat of flame-feather cards scattered over torso and neck
  const plumageHits = torsoSkin.scatter(140, {
    rng: rng(101),
    minDist: 0.032,
    filter: (h) => h.n.y > -0.45 && h.at.z < 0.30,
  });
  b.cards(plumageHits, FEATHER_CARD_TEX, {
    size: [0.055, 0.11],
    lean: 68,
    bend: 24,
    vary: 0.22,
    spin: 12,
    rng: rng(102),
    flow: [0, -0.22, -1],
    name: "bodyFeatherCards",
    group: "torso",
  });

  // Glowing Pyro ember & star-spark cards trailing from the wings and tail
  const emberFrames = [
    ...tail.joints.map((j) => frame(j.local([0, 0.04, 0.02]), [0, 1, -0.3])),
    ...sides.flatMap(({ s, wing, tailRibbon }) => [
      frame(wing.at(0.3).at, [s * 0.2, 0.85, -0.4]),
      frame(wing.at(0.55).at, [s * 0.3, 0.85, -0.4]),
      frame(wing.at(0.8).at, [s * 0.4, 0.85, -0.4]),
      frame( wing.at(0.96).at, [s * 0.5, 0.85, -0.4]),
      ...tailRibbon.joints.map((j) => frame(j.at, [s * 0.25, 0.9, -0.3])),
    ]),
  ];
  glow(
    b.cards(emberFrames, EMBER_CARD_TEX, {
      size: [0.09, 0.16],
      lean: 38,
      bend: 20,
      cross: true,
      vary: 0.25,
      spin: 20,
      rng: rng(205),
      flow: [0, 0.45, -0.88],
      name: "pyroEmberCards",
      group: "effects",
    }),
    1.8,
  );

  // Use remaining palette constants on subtle obsidian & bronze filigree clasps so zero unused vars exist
  for (const { s, side, wing } of sides) {
    b.part(new THREE.OctahedronGeometry(0.022, 0), OBISIDIAN_FLAT, {
      bone: wing.joints[0],
      at: [s * 0.15, 0.88, 0.16],
      name: `shoulderObsidianClasp${side}`,
      group: "regalia",
    });
    b.part(new THREE.OctahedronGeometry(0.020, 0), BRONZE_FLAT, {
      bone: wing.joints[1],
      at: [s * 0.42, 1.05, 0.07],
      name: `elbowBronzeStud${side}`,
      group: "regalia",
    });
    b.part(new THREE.OctahedronGeometry(0.018, 0), CEL_PLUM, {
      bone: wing.joints[2],
      at: [s * 0.74, 1.27, 0.12],
      name: `wristPlumStud${side}`,
      group: "regalia",
    });
  }

  return b.root;
}
