import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { offset, rng, vec } from "../../../../src/math";
import type { V3 } from "../../../../src/math";
import { bezier, catmull, polyline } from "../../../../src/path";
import { gradient, grain, mix, noise, paint, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, INK, inkLines, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Sylvan Starbow Ranger",
  description:
    "High-fantasy anime elven ranger archer in emerald and moon-silver regalia with a winged tiara, flowing twin-panel cape, leaf pauldrons, gilded quiver, and celestial greatbow.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "elvenArcher", detail: 0.75, paintSize: 2048 });
  const rand = rng(4207);

  // ---------------------------------------------------------------------------
  // High-fantasy anime cel-shaded palette & procedural surface paints
  // ---------------------------------------------------------------------------
  const SKIN_LIT = "#ffe7d6";
  const SKIN_SHADE = "#e8b49e";
  const SKIN = cel(SKIN_LIT, SKIN_SHADE);
  const SKIN_BLUSH = cel(
    paint((p) => {
      const cheek = smoothstep(0.045, 0.01, Math.hypot(Math.abs(p.x) - 0.042, p.y - 1.615, p.z - 0.075));
      return mix(SKIN_LIT, "#ff96b0", cheek * 0.45);
    }),
    SKIN_SHADE,
  );

  const HAIR_BASE = grain("#f7f1e3", "#e2d9ee", { size: 0.018, axis: "y", seed: 11 });
  const HAIR = cel(
    paint((p, n) => {
      const halo = smoothstep(0.12, 0.28, Math.abs(n.y - 0.35) < 0.14 ? 0.25 : 0);
      const tip = smoothstep(1.15, 0.76, p.y);
      const base = mix(HAIR_BASE.at(p, n), "#98e8dc", tip * 0.35);
      return mix(base, "#ffffff", halo * 0.35);
    }),
    "#b5aed2",
  );

  const EMERALD_DAMASK = paint((p, n, s) => {
    const motif = noise(p, 0.055, 23);
    const wave = zigzag(p.x / 0.032 + p.z / 0.032);
    const rich = mix("#17684f", "#248f6c", smoothstep(0.35, 0.72, motif));
    const goldEdge = s[0] > 0.86 || (Math.abs(p.y - 0.86) < 0.014 + 0.01 * wave && p.y < 0.92);
    return goldEdge ? "#f2c350" : n.y > 0.35 ? mix(rich, "#39b589", 0.25) : rich;
  });
  const EMERALD = cel(EMERALD_DAMASK, "#0d3e35");

  const CAPE_PAINT = cel(
    paint((p, _n, s) => {
      const along = s[0];
      const across = Math.abs(s[1] - 0.5) * 2;
      const body = mix("#145947", "#0b2838", smoothstep(0.15, 0.92, along));
      const inner = mix(body, "#259676", smoothstep(0.75, 0.98, across) * 0.5);
      const trim =
        along > 0.91 ||
        across > 0.91 ||
        (along > 0.83 && along < 0.865 && zigzag(across * 9) > 0.35);
      return trim ? "#f4c85b" : inner;
    }),
    "#081d29",
  );

  const SILK_IVORY = cel(
    furEdge("#fbf6ec", "#e2d6c5", {
      by: "position",
      axis: [0, 1, 0],
      level: 1.24,
      teeth: 0.018,
      period: 0.028,
      along: [1, 0, 0],
      ink: "#d4a64a",
      inkWidth: 0.005,
    }),
    "#c8b8d8",
  );

  const CORSET_PAINT = cel(
    paint((p) => {
      const lace = Math.abs(p.x) < 0.022 && p.z > 0.04 && zigzag((p.y - 0.98) / 0.026) < 0.22;
      const rib = Math.abs(((p.x + 1) % 0.035) - 0.0175) < 0.0035;
      if (lace) return "#f3c759";
      return rib ? "#2c1916" : "#442822";
    }),
    "#211112",
  );

  const LEATHER_DARK = cel(grain("#4a2d24", "#382019", { size: 0.03, axis: "y", seed: 5 }), "#231214");
  const LEATHER_WARM = cel(grain("#6e4332", "#543123", { size: 0.025, axis: "y", seed: 9 }), "#361c18");
  const BOOT_PAINT = cel(
    paint((p) => {
      const goldTrim = Math.abs(p.y - 0.52 - 0.025 * Math.abs(p.x)) < 0.012;
      const shinLace = p.z > 0.02 && p.y > 0.14 && p.y < 0.44 && Math.abs(Math.abs(p.x) - 0.128) < 0.016 && zigzag(p.y / 0.032) < 0.2;
      if (goldTrim || shinLace) return "#f2c452";
      return p.y > 0.47 ? "#19664e" : "#3d241d";
    }),
    "#1f1112",
  );

  const LEGGING_PAINT = cel(
    gradient("#f5efe2", "#262033", [0, 0.85, 0], [0, 0.5, 0]),
    "#b8aec8",
  );

  const GOLD = cel(
    inkLines("#f6ca56", { levels: [-0.55, 0.65], axis: [0, 1, 0], width: 0.07, ink: "#fff2b2" }),
    "#b87924",
  );
  const MOON_SILVER = cel("#e8f0f8", "#96abc8");
  const BOW_WOOD = cel(grain("#e8bd58", "#b37928", { size: 0.03, axis: "y", seed: 19 }), "#6e4218");

  // Flat colors for self-lit mana gems, strings, ink, and metallic accents (keeps flat color count well under 64)
  const MANA_CYAN = "#5efaff";
  const MANA_MINT = "#88ffda";
  const MANA_GOLD = "#ffe680";
  const GOLD_FLAT = "#f2c350";
  const SILVER_FLAT = "#dde8f4";
  const EMERALD_FLAT = "#1c7558";
  const CORAL_LIP = "#e87a88";

  // ---------------------------------------------------------------------------
  // SVG Textures (Anime Eyes, Sylvan Crest, Feather/Leaf Cards, Silk Tassels, Rune)
  // ---------------------------------------------------------------------------
  const EYE_TEX = animeEye({
    iris: "#14c8b0",
    irisLight: "#8afff0",
    irisDark: "#09424d",
    blush: "#ff86a8",
    size: 512,
  });

  const CREST_TEX = svg(
    `<svg viewBox="0 0 128 160">
      <path d="M64 8 L84 46 L118 54 L88 84 L96 148 L64 118 L32 148 L40 84 L10 54 L44 46 Z"
        fill="#145846" stroke="#f5cb5c" stroke-width="5" stroke-linejoin="round"/>
      <path d="M64 22 C78 52 78 96 64 134 C50 96 50 52 64 22 Z"
        fill="#279b78" stroke="#f5cb5c" stroke-width="4"/>
      <circle cx="64" cy="72" r="14" fill="#63faff" stroke="#ffffff" stroke-width="3"/>
      <path d="M64 46 L70 66 L90 72 L70 78 L64 98 L58 78 L38 72 L58 66 Z" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  const FEATHER_TEX = svg(
    `<svg viewBox="0 0 64 160">
      <path d="M32 156 C10 118 8 54 32 4 C56 54 54 118 32 156 Z"
        fill="#228c6e" stroke="#f4c858" stroke-width="4"/>
      <path d="M32 140 C20 106 18 58 32 14 C46 58 44 106 32 140 Z" fill="#64f7df"/>
      <line x1="32" y1="8" x2="32" y2="154" stroke="#fff6c8" stroke-width="4" stroke-linecap="round"/>
      <path d="M32 40 L16 26 M32 68 L14 52 M32 96 L16 82 M32 40 L48 26 M32 68 L50 52 M32 96 L48 82"
        stroke="#134e3e" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const HAIR_LOCK_TEX = svg(
    `<svg viewBox="0 0 64 160">
      <path d="M32 156 C14 114 12 52 32 4 C52 52 50 114 32 156 Z"
        fill="#f6efe2" stroke="#b9b1d4" stroke-width="4"/>
      <path d="M32 142 C24 100 24 48 32 12" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 192 },
  );

  const TASSEL_TEX = svg(
    `<svg viewBox="0 0 64 160">
      <circle cx="32" cy="18" r="12" fill="#f5c956" stroke="#22112f" stroke-width="3"/>
      <path d="M20 30 L44 30 L52 148 L12 148 Z" fill="#186850" stroke="#f5c956" stroke-width="4"/>
      <line x1="24" y1="36" x2="20" y2="146" stroke="#f5c956" stroke-width="3"/>
      <line x1="32" y1="36" x2="32" y2="146" stroke="#62faff" stroke-width="3"/>
      <line x1="40" y1="36" x2="44" y2="146" stroke="#f5c956" stroke-width="3"/>
    </svg>`,
    { size: 192 },
  );

  const RUNE_TEX = svg(
    `<svg viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="54" fill="none" stroke="#62faff" stroke-width="6"/>
      <circle cx="64" cy="64" r="38" fill="none" stroke="#a6ffea" stroke-width="4" stroke-dasharray="12 8"/>
      <path d="M64 8 L76 48 L118 64 L76 80 L64 120 L52 80 L10 64 L52 48 Z"
        fill="#62faff" stroke="#ffffff" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // 1. Skeleton (Rooted at hips, full articulated hierarchy & roles)
  // ---------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.96, 0], dir: [0, 1, 0], role: "spine", group: "torso" });

  const spinePath = catmull([
    [0, 0.96, 0],
    [0, 1.11, 0.012],
    [0, 1.27, -0.006],
    [0, 1.43, 0],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["waist", "chest", "upperChest", "thorax"],
    role: "spine",
    group: "torso",
  });
  const thorax = spine.tip!;

  const neck = b.chain(
    "neck",
    polyline([
      [0, 1.43, 0],
      [0, 1.495, 0.005],
      [0, 1.555, 0.01],
    ]),
    {
      parent: thorax,
      names: ["neckBase", "neckTop"],
      role: "neck",
      group: "head",
    },
  );

  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.555, 0.01],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ up: -0.012, forward: 0.025 }),
    dir: [0, -0.22, 1],
    role: "jaw",
    group: "head",
  });

  const earJoints = new Map<number, ReturnType<typeof b.joint>>();
  const bangJoints = new Map<number, ReturnType<typeof b.joint>>();
  const hairSideChains = new Map<number, ReturnType<typeof b.chain>>();

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    earJoints.set(
      s,
      b.joint(`ear${side}`, {
        parent: head,
        at: head.local({ left: s * 0.074, up: 0.055, forward: 0.005 }),
        dir: [s * 0.84, 0.34, -0.42],
        role: "hinge",
        group: "head",
      }),
    );

    bangJoints.set(
      s,
      b.joint(`bang${side}`, {
        parent: head,
        at: head.local({ left: s * 0.052, up: 0.115, forward: 0.072 }),
        dir: [s * 0.25, -0.94, 0.22],
        role: "hinge",
        group: "hair",
      }),
    );

    hairSideChains.set(
      s,
      b.chain(
        `hairSide${side}`,
        catmull([
          [s * 0.072, 1.58, 0.025],
          [s * 0.11, 1.45, 0.068],
          [s * 0.12, 1.29, 0.108],
          [s * 0.105, 1.13, 0.095],
        ]),
        {
          parent: head,
          names: [`hairSide${side}1`, `hairSide${side}2`, `hairSide${side}3`],
          role: "tentacle",
          group: "hair",
        },
      ),
    );
  }

  const hairBack = b.chain(
    "hairBack",
    catmull([
      [0, 1.64, -0.075],
      [0, 1.48, -0.155],
      [0, 1.24, -0.205],
      [0, 0.98, -0.225],
      [0, 0.74, -0.195],
    ]),
    {
      parent: head,
      names: ["hairBack1", "hairBack2", "hairBack3", "hairBack4"],
      role: "tail",
      group: "hair",
    },
  );

  // Flowing two-wing sylvan cape chains
  const capeC = b.chain(
    "capeC",
    catmull([
      [0, 1.41, -0.082],
      [0, 1.15, -0.145],
      [0, 0.82, -0.195],
      [0, 0.46, -0.235],
    ]),
    {
      parent: thorax,
      names: ["capeC1", "capeC2", "capeC3"],
      role: "tail",
      group: "cape",
    },
  );
  const capeL = b.chain(
    "capeL",
    catmull([
      [0.115, 1.41, -0.072],
      [0.215, 1.15, -0.125],
      [0.295, 0.82, -0.165],
      [0.355, 0.47, -0.195],
    ]),
    {
      parent: thorax,
      names: ["capeL1", "capeL2", "capeL3"],
      role: "wing",
      group: "cape",
    },
  );
  const capeR = b.chain(
    "capeR",
    catmull([
      [-0.115, 1.41, -0.072],
      [-0.215, 1.15, -0.125],
      [-0.295, 0.82, -0.165],
      [-0.355, 0.47, -0.195],
    ]),
    {
      parent: thorax,
      names: ["capeR1", "capeR2", "capeR3"],
      role: "wing",
      group: "cape",
    },
  );

  // Hip tassets & front/back ranger tabards
  const tassetL = b.joint("tassetL", {
    parent: hips,
    at: [0.125, 0.94, 0],
    dir: [0.26, -0.96, 0],
    role: "hinge",
    group: "torso",
  });
  const tassetR = b.joint("tassetR", {
    parent: hips,
    at: [-0.125, 0.94, 0],
    dir: [-0.26, -0.96, 0],
    role: "hinge",
    group: "torso",
  });
  const tabardF = b.joint("tabardF", {
    parent: hips,
    at: [0, 0.93, 0.092],
    dir: [0, -0.98, 0.16],
    role: "hinge",
    group: "torso",
  });
  const tabardB = b.joint("tabardB", {
    parent: hips,
    at: [0, 0.93, -0.092],
    dir: [0, -0.98, -0.16],
    role: "hinge",
    group: "torso",
  });

  // Legs (all left joints x > 0.09, all right joints x < -0.09)
  const legChains = new Map<number, ReturnType<typeof b.chain>>();
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipPt: V3 = [s * 0.096, 0.95, 0];
    const anklePt: V3 = [s * 0.128, 0.082, 0.005];
    const ikPts = limb(hipPt, anklePt, [0.445, 0.435], [s * 0.04, 0, 1]);
    const footTip: V3 = [s * 0.134, 0.028, 0.12];
    const leg = b.chain(`leg${side}`, [...ikPts, vec(footTip)], {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
      role: "leg",
      contact: [s * 0.128, 0, 0.055],
      group: `leg${side}`,
    });
    legChains.set(s, leg);
  }

  // Arms, Pauldrons & 5 Fingers per Hand
  const armChains = new Map<number, ReturnType<typeof b.chain>>();
  const pauldronJoints = new Map<number, ReturnType<typeof b.joint>>();
  const fingerChains = new Map<string, ReturnType<typeof b.chain>>();

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const clavicle = b.joint(`clavicle${side}`, {
      parent: thorax,
      at: [s * 0.045, 1.415, 0],
      dir: [s, 0.04, -0.04],
      role: "arm",
      group: `arm${side}`,
    });
    const pauldron = b.joint(`pauldron${side}`, {
      parent: clavicle,
      at: [s * 0.145, 1.445, 0],
      dir: [s * 0.92, 0.36, 0],
      role: "hinge",
      group: `arm${side}`,
    });
    pauldronJoints.set(s, pauldron);

    const shoulderPt: V3 = [s * 0.155, 1.405, -0.005];
    const elbowPt: V3 = [s * 0.355, 1.285, -0.028];
    const wristPt: V3 = [s * 0.545, 1.18, 0.035];
    const handPt: V3 = [s * 0.615, 1.14, 0.062];

    const arm = b.chain(`arm${side}`, [shoulderPt, elbowPt, wristPt, handPt], {
      parent: clavicle,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      role: "arm",
      group: `arm${side}`,
    });
    armChains.set(s, arm);
    const hand = arm.tip!;

    // 5 articulated digits per hand, clearly separated for rigging & flex
    const fingerSpecs: ReadonlyArray<{
      tag: string;
      base: V3;
      mid: V3;
      tip: V3;
    }> = [
      {
        tag: "thumb",
        base: [s * 0.608, 1.148, 0.088],
        mid: [s * 0.628, 1.142, 0.118],
        tip: [s * 0.642, 1.135, 0.142],
      },
      {
        tag: "index",
        base: [s * 0.635, 1.136, 0.092],
        mid: [s * 0.668, 1.118, 0.118],
        tip: [s * 0.695, 1.102, 0.138],
      },
      {
        tag: "middle",
        base: [s * 0.64, 1.128, 0.072],
        mid: [s * 0.676, 1.108, 0.085],
        tip: [s * 0.706, 1.09, 0.095],
      },
      {
        tag: "ring",
        base: [s * 0.636, 1.124, 0.052],
        mid: [s * 0.669, 1.105, 0.056],
        tip: [s * 0.695, 1.088, 0.059],
      },
      {
        tag: "pinky",
        base: [s * 0.628, 1.12, 0.034],
        mid: [s * 0.654, 1.103, 0.032],
        tip: [s * 0.675, 1.088, 0.03],
      },
    ];

    for (const f of fingerSpecs) {
      const fChain = b.chain(`${f.tag}${side}`, [f.base, f.mid, f.tip], {
        parent: hand,
        names: [`${f.tag}${side}1`, `${f.tag}${side}2`],
        role: "digit",
        group: `arm${side}`,
      });
      fingerChains.set(`${f.tag}${side}`, fChain);
    }
  }

  // Equipment joints: Back Quiver, Greatbow in Left Hand, Starlight Arrow in Right Hand
  const quiverJoint = b.joint("quiver", {
    parent: thorax,
    at: [-0.075, 1.31, -0.11],
    dir: [-0.34, 0.92, -0.14],
    role: "hinge",
    group: "quiver",
  });

  const handL = armChains.get(1)!.tip!;
  const bowGrip = b.joint("bowGrip", {
    parent: handL,
    at: [0.645, 1.135, 0.075],
    dir: [0.12, 0.05, 0.99],
    role: "hinge",
    group: "bow",
  });
  const bowLimbU = b.joint("bowLimbU", {
    parent: bowGrip,
    at: [0.655, 1.24, 0.09],
    dir: [0.08, 0.96, -0.26],
    role: "hinge",
    group: "bow",
  });
  const bowLimbD = b.joint("bowLimbD", {
    parent: bowGrip,
    at: [0.635, 1.03, 0.06],
    dir: [0.08, -0.96, -0.26],
    role: "hinge",
    group: "bow",
  });

  const handR = armChains.get(-1)!.tip!;
  const arrowHeld = b.joint("arrowHeld", {
    parent: handR,
    at: [-0.635, 1.135, 0.068],
    dir: [0.18, -0.12, 0.97],
    role: "hinge",
    group: "arrow",
  });

  // ---------------------------------------------------------------------------
  // 2. Torso, Tunic, Corset, Collar & Draped Straps
  // ---------------------------------------------------------------------------
  const torsoLoft = b.loft(
    [
      { at: [0, 0.92, 0], w: 0.255, h: 0.185 },
      { at: [0, 1.03, 0.008], w: 0.195, h: 0.148 },
      { at: [0, 1.15, 0.015], w: 0.21, h: 0.158 },
      { at: [0, 1.29, 0.018], w: 0.265, h: 0.195 },
      { at: [0, 1.42, 0], w: 0.245, h: 0.16 },
    ],
    {
      bone: [hips, spine],
      color: (t) => (t < 0.42 ? CORSET_PAINT : t < 0.78 ? EMERALD : SILK_IVORY),
      sides: 10,
      group: "torso",
      name: "torsoBody",
    },
  );

  // Sculpted anime bust & chest armor cups
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.064, 8, 6), EMERALD, {
      bone: spine.joints[2],
      at: [s * 0.056, 1.295, 0.068],
      scale: [0.95, 0.88, 0.85],
      group: "torso",
    });
    // Gold filigree under-bust arc
    b.sweep(
      arcCurve([s * 0.012, 1.26, 0.118], [s * 0.058, 1.242, 0.105], [s * 0.105, 1.275, 0.065]),
      0.007,
      GOLD,
      { bone: spine.joints[2], sides: 4, caps: "point", group: "torso" },
    );
  }

  // High elven standing collar & cravat
  const collarLoop = catmull(
    [
      [0, 1.445, 0.072],
      [0.075, 1.47, 0.01],
      [0, 1.505, -0.075],
      [-0.075, 1.47, 0.01],
    ],
    { closed: true },
  );
  b.sweep(collarLoop, [0.016, 0.016], GOLD, {
    bone: thorax,
    sides: 5,
    group: "torso",
    name: "collarRim",
  });

  // Silk cravat & glowing starlight throat brooch
  const cravatOutline: OutlinePoint[] = [
    [-0.032, 0],
    [0.032, 0],
    [0.044, -0.095],
    [0, -0.155, "sharp"],
    [-0.044, -0.095],
  ];
  b.extrude(cravatOutline, {
    bone: thorax,
    at: [0, 1.43, 0.088],
    x: [1, 0, 0],
    y: [0, 0.96, 0.28],
    thickness: [0.01, 0.018],
    smoothing: 1,
    color: SILK_IVORY,
    group: "torso",
    name: "cravat",
  });
  b.part(new THREE.OctahedronGeometry(0.022, 0), GOLD, {
    bone: thorax,
    at: [0, 1.415, 0.102],
    scale: [1.1, 1.3, 0.55],
    group: "torso",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.015, 0), MANA_CYAN, {
      bone: thorax,
      at: [0, 1.415, 0.108],
      scale: [0.9, 1.2, 0.5],
      group: "torso",
      name: "throatGem",
    }),
    1.6,
  );

  // Draped chest bandolier & sculpted waist belt
  const torsoSurf = b.surface(torsoLoft);
  const bandolierRaw = catmull(
    [
      [-0.105, 1.425, 0.02],
      [-0.02, 1.29, 0.115],
      [0.095, 1.13, 0.085],
      [0.115, 1.09, -0.02],
      [0.02, 1.25, -0.105],
      [-0.095, 1.40, -0.06],
    ],
    { closed: true },
  );
  const bandolierPath = torsoSurf.drape(bandolierRaw, { lift: 0.008 });
  b.sweep(bandolierPath, 0.012, LEATHER_WARM, {
    bone: spine.joints[2],
    sides: 4,
    group: "torso",
    name: "bandolier",
  });
  b.along(bandolierPath, 8, (pt) => {
    b.part(new THREE.OctahedronGeometry(0.011, 0), GOLD_FLAT, {
      frame: pt,
      bone: spine.joints[2],
      group: "torso",
    });
  });

  // Ornate V-shaped elven waist belt & glowing centerpiece buckle
  const beltLoop = catmull(
    [
      [0, 0.945, 0.105],
      [0.122, 0.975, 0.04],
      [0.132, 0.985, -0.035],
      [0, 0.975, -0.102],
      [-0.132, 0.985, -0.035],
      [-0.122, 0.975, 0.04],
    ],
    { closed: true },
  );
  b.sweep(beltLoop, 0.016, GOLD, {
    bone: hips,
    sides: 5,
    group: "torso",
    name: "waistBelt",
  });
  b.part(new THREE.OctahedronGeometry(0.032, 0), GOLD, {
    bone: hips,
    at: [0, 0.945, 0.112],
    scale: [1.3, 1.1, 0.45],
    group: "torso",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.019, 0), MANA_MINT, {
      bone: hips,
      at: [0, 0.945, 0.12],
      scale: [1.0, 0.9, 0.45],
      group: "torso",
      name: "beltGem",
    }),
    1.5,
  );

  // Belt side pouches & potion vials
  b.frustumBox([0.135, 0.88, 0.035], [0.142, 0.955, 0.035], [0.042, 0.055], [0.036, 0.048], {
    bone: hips,
    color: LEATHER_WARM,
    group: "torso",
    name: "beltPouchL",
  });
  b.rod([0.14, 0.92, 0.062], [0.14, 0.955, 0.062], 0.008, GOLD, {
    bone: hips,
    sides: 4,
    group: "torso",
  });
  // Glowing mana vials on right hip
  for (let i = 0; i < 2; i++) {
    const vx = -0.132 - i * 0.012;
    const vz = 0.045 - i * 0.032;
    glow(
      b.capsule([vx, 0.895, vz], [vx, 0.945, vz], 0.012, i === 0 ? MANA_CYAN : MANA_MINT, {
        bone: hips,
        sides: 5,
        group: "torso",
      }),
      1.4,
    );
    b.rod([vx, 0.945, vz], [vx, 0.962, vz], 0.009, GOLD, {
      bone: hips,
      sides: 5,
      group: "torso",
    });
  }

  // ---------------------------------------------------------------------------
  // 3. Hip Tassets, Embroidered Tabards & Hanging Silk Tassels
  // ---------------------------------------------------------------------------
  const leafTassetOutline: OutlinePoint[] = [
    [-0.075, 0],
    [0.075, 0],
    [0.095, -0.11],
    [0.065, -0.23],
    [0, -0.32, "sharp"],
    [-0.065, -0.23],
    [-0.095, -0.11],
  ];
  for (const s of [1, -1]) {
    const tJoint = s > 0 ? tassetL : tassetR;
    // Outer emerald leaf skirt panel
    b.extrude(leafTassetOutline, {
      bone: tJoint,
      at: [s * 0.125, 0.95, 0],
      x: [0, 0, 1],
      y: [s * 0.25, -0.96, 0],
      thickness: [0.008, 0.016],
      smoothing: 1,
      color: EMERALD,
      group: "torso",
      name: `tassetPanel${s > 0 ? "L" : "R"}`,
    });
    // Overlapping golden leaf scale on top of hip tasset
    const upperLeaf: OutlinePoint[] = [
      [-0.055, 0],
      [0.055, 0],
      [0.068, -0.085],
      [0, -0.175, "sharp"],
      [-0.068, -0.085],
    ];
    b.extrude(upperLeaf, {
      bone: tJoint,
      at: [s * 0.136, 0.955, 0],
      x: [0, 0, 1],
      y: [s * 0.28, -0.96, 0],
      thickness: 0.012,
      smoothing: 1,
      color: GOLD,
      group: "torso",
    });
  }

  // Front and Back Tabards with Sylvan Crest Decal
  const tabardOutline: OutlinePoint[] = [
    [-0.062, 0],
    [0.062, 0],
    [0.074, -0.18],
    [0.048, -0.31],
    [0, -0.39, "sharp"],
    [-0.048, -0.31],
    [-0.074, -0.18],
  ];
  const frontTabardPart = b.extrude(tabardOutline, {
    bone: tabardF,
    at: [0, 0.94, 0.096],
    x: [1, 0, 0],
    y: [0, -0.985, 0.16],
    thickness: [0.008, 0.014],
    smoothing: 1,
    color: SILK_IVORY,
    group: "torso",
    name: "tabardFront",
  });
  b.decal(frontTabardPart, CREST_TEX, {
    bone: tabardF,
    at: [0, 0.77, 0.13],
    dir: [0, 0.16, 0.985],
    size: [0.095, 0.12],
    group: "torso",
    name: "tabardCrest",
  });

  b.extrude(tabardOutline, {
    bone: tabardB,
    at: [0, 0.94, -0.096],
    x: [-1, 0, 0],
    y: [0, -0.985, -0.16],
    thickness: [0.008, 0.014],
    smoothing: 1,
    color: EMERALD,
    group: "torso",
    name: "tabardBack",
  });

  // Hanging silk tassels from tabard & tasset tips
  b.cards([frame([0, 0.56, 0.155], [0, 1, 0], [0, 0, 1])], TASSEL_TEX, {
    bone: tabardF,
    size: [0.038, 0.095],
    lean: 180,
    flow: [0, 0, 1],
    group: "torso",
    name: "tabardTasselF",
  });
  for (const s of [1, -1]) {
    const tJoint = s > 0 ? tassetL : tassetR;
    b.cards([frame([s * 0.205, 0.64, 0], [0, 1, 0], [s, 0, 0])], TASSEL_TEX, {
      bone: tJoint,
      size: [0.034, 0.085],
      lean: 180,
      flow: [s, 0, 0],
      group: "torso",
    });
  }

  // ---------------------------------------------------------------------------
  // 4. Flowing Twin-Wing Sylvan Cape & Mantle
  // ---------------------------------------------------------------------------
  b.membrane(capeL, capeC, {
    color: CAPE_PAINT,
    thickness: 0.01,
    scallop: 0.1,
    rows: 6,
    cols: 5,
    group: "cape",
    name: "capeWingL",
  });
  b.membrane(capeC, capeR, {
    color: CAPE_PAINT,
    thickness: 0.01,
    scallop: 0.1,
    rows: 6,
    cols: 5,
    group: "cape",
    name: "capeWingR",
  });
  // Golden braided trim along the outer edges and central spine of the cape
  b.sweep(capeL, [0.012, 0.005], GOLD, { sides: 4, caps: "point", group: "cape" });
  b.sweep(capeR, [0.012, 0.005], GOLD, { sides: 4, caps: "point", group: "cape" });
  b.sweep(capeC, [0.011, 0.005], GOLD, { sides: 4, caps: "point", group: "cape" });

  // Cape clasps at upper shoulders
  for (const s of [1, -1]) {
    b.part(new THREE.OctahedronGeometry(0.024, 0), GOLD, {
      bone: thorax,
      at: [s * 0.1, 1.425, -0.068],
      scale: [1.1, 1.1, 0.6],
      group: "cape",
    });
    glow(
      b.part(new THREE.OctahedronGeometry(0.014, 0), MANA_CYAN, {
        bone: thorax,
        at: [s * 0.1, 1.425, -0.076],
        scale: [0.9, 0.9, 0.5],
        group: "cape",
      }),
      1.4,
    );
  }

  // ---------------------------------------------------------------------------
  // 5. Head, Sculpted Face, Anime Eyes, Pointed Ears, Winged Tiara & Hair
  // ---------------------------------------------------------------------------
  const neckTube = b.sweep(neck, [0.044, 0.039], SKIN, {
    sides: 8,
    group: "head",
    name: "neckSkin",
  });
  // Golden choker around neck
  b.sweep(
    catmull(
      [
        [0, 1.505, 0.046],
        [0.044, 1.508, 0.005],
        [0, 1.512, -0.038],
        [-0.044, 1.508, 0.005],
      ],
      { closed: true },
    ),
    0.007,
    GOLD,
    { bone: neckTube.bone, sides: 4, group: "head", name: "neckChoker" },
  );

  // Cranium & sculpted upper face
  const HEAD_CENTER = head.local({ up: 0.075, forward: 0.005 });
  const skull = b.part(new THREE.SphereGeometry(1, 14, 12), SKIN_BLUSH, {
    bone: head,
    at: HEAD_CENTER,
    scale: [0.082, 0.092, 0.088],
    group: "head",
    name: "cranium",
  });

  // Articulated lower face / jaw & delicate anime chin
  b.loft(
    [
      { at: head.local({ up: 0.032, forward: -0.01 }), w: 0.132, h: 0.095 },
      { at: head.local({ up: 0.005, forward: 0.032 }), w: 0.105, h: 0.078 },
      { at: head.local({ up: -0.022, forward: 0.068 }), w: 0.048, h: 0.042 },
    ],
    {
      bone: jaw,
      color: SKIN_BLUSH,
      sides: 8,
      caps: "round",
      group: "head",
      name: "jawChin",
    },
  );

  // Subtle coral anime lip & dainty nose bridge
  b.capsule(
    head.local({ left: -0.012, up: -0.002, forward: 0.079 }),
    head.local({ left: 0.012, up: -0.002, forward: 0.079 }),
    0.0045,
    CORAL_LIP,
    { bone: jaw, sides: 4, group: "head", name: "lip" },
  );
  b.spike(
    head.local({ up: 0.034, forward: 0.076 }),
    head.local({ up: 0.024, forward: 0.098 }),
    null,
    0.012,
    SKIN,
    { bone: head, sides: 4, group: "head", name: "nose" },
  );

  // Big shiny anime eyes conformed onto the face with b.decal
  const skullSurf = b.surface(skull);
  for (const s of [1, -1]) {
    const eyeHit = skullSurf.around(HEAD_CENTER).at(s * 29, -8);
    if (eyeHit) {
      b.decal(skullSurf, EYE_TEX, {
        bone: head,
        at: eyeHit,
        dir: [s * 0.22, -0.05, 0.97],
        size: [0.048, 0.064],
        mirror: s > 0,
        group: "head",
        name: `eye${s > 0 ? "L" : "R"}`,
      });
    }
  }

  // Long swept-back Elven Ears with gold ear-cuffs and glowing starlight drop earrings
  const earOutline: OutlinePoint[] = [
    [0, -0.018],
    [0.065, -0.024],
    [0.165, 0.012, "sharp"],
    [0.075, 0.026],
    [0, 0.016],
  ];
  for (const s of [1, -1]) {
    const earJ = earJoints.get(s)!;
    b.extrude(earOutline, {
      bone: earJ,
      at: earJ.at,
      x: [s * 0.84, 0.34, -0.42],
      y: [0, 0.92, 0.38],
      thickness: [0.014, 0.005],
      smoothing: 1,
      color: SKIN_BLUSH,
      group: "head",
      name: `earBlade${s > 0 ? "L" : "R"}`,
    });
    // Gold elven ear-cuff mid-ear
    const cuffAt = offset(earJ.at, [s * 0.84, 0.34, -0.42], 0.075);
    b.part(new THREE.OctahedronGeometry(0.013, 0), GOLD, {
      bone: earJ,
      at: cuffAt,
      scale: [0.8, 1.3, 0.8],
      group: "head",
    });
    // Dangling starlight drop earring near lobe
    const lobeAt = offset(earJ.at, [s * 0.84, -0.35, -0.2], 0.024);
    b.rod(lobeAt, offset(lobeAt, [0, -1, 0], 0.022), 0.004, GOLD_FLAT, {
      bone: earJ,
      sides: 4,
      group: "head",
    });
    glow(
      b.part(new THREE.OctahedronGeometry(0.011, 0), MANA_CYAN, {
        bone: earJ,
        at: offset(lobeAt, [0, -1, 0], 0.03),
        scale: [0.75, 1.4, 0.75],
        group: "head",
      }),
      1.5,
    );
  }

  // Volumetric Anime Hair: Crown dome, parted bangs, twin side-locks, and cascading ponytail
  b.part(new THREE.SphereGeometry(1, 12, 10), HAIR, {
    bone: head,
    at: head.local({ up: 0.092, forward: -0.008 }),
    scale: [0.092, 0.096, 0.096],
    group: "hair",
    name: "hairCrown",
  });

  // Central swept forelock between the eyes
  b.sweep(
    bezier(
      head.local({ up: 0.145, forward: 0.055 }),
      head.local({ left: 0.008, up: 0.115, forward: 0.098 }),
      head.local({ left: -0.005, up: 0.055, forward: 0.102 }),
    ),
    [0.022, 0.003],
    HAIR,
    { bone: head, sides: 5, caps: "point", group: "hair", name: "forelockCenter" },
  );

  // Left and Right framing bangs (sweeping past the temples so the eyes remain completely clear)
  for (const s of [1, -1]) {
    const bJoint = bangJoints.get(s)!;
    b.sweep(
      bezier(
        head.local({ left: s * 0.015, up: 0.148, forward: 0.055 }),
        head.local({ left: s * 0.068, up: 0.118, forward: 0.088 }),
        head.local({ left: s * 0.086, up: 0.035, forward: 0.062 }),
        head.local({ left: s * 0.078, up: -0.025, forward: 0.042 }),
      ),
      [0.028, 0.005],
      HAIR,
      { bone: bJoint, sides: 5, caps: "point", group: "hair", name: `bangMain${s > 0 ? "L" : "R"}` },
    );
    b.sweep(
      bezier(
        head.local({ left: s * 0.045, up: 0.138, forward: 0.04 }),
        head.local({ left: s * 0.094, up: 0.095, forward: 0.048 }),
        head.local({ left: s * 0.096, up: 0.015, forward: 0.025 }),
      ),
      [0.022, 0.004],
      HAIR,
      { bone: bJoint, sides: 5, caps: "point", group: "hair" },
    );

    // Braided front side-locks draping over shoulders
    const sideChain = hairSideChains.get(s)!;
    b.sweep(sideChain, [0.026, 0.022, 0.016, 0.005], HAIR, {
      sides: 6,
      caps: "point",
      group: "hair",
      name: `hairSideLock${s > 0 ? "L" : "R"}`,
    });
    // Gold hair-cuffs on the side braids
    for (const t of [0.35, 0.72]) {
      const pt = sideChain.at(t);
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.014, 6, 1), GOLD, {
        frame: pt,
        group: "hair",
      });
    }
  }

  // High cascading ponytail / back hair plume + flanking ribbons of hair
  b.part(new THREE.OctahedronGeometry(0.034, 0), GOLD, {
    bone: head,
    at: [0, 1.645, -0.075],
    scale: [1.2, 0.85, 1.0],
    group: "hair",
    name: "ponytailCrownCuff",
  });
  b.sweep(hairBack, [0.055, 0.078, 0.068, 0.042, 0.01], HAIR, {
    sides: 7,
    caps: "point",
    group: "hair",
    name: "hairPonytailMain",
  });
  for (const s of [1, -1]) {
    const flankHair = catmull([
      [s * 0.035, 1.63, -0.075],
      [s * 0.075, 1.46, -0.155],
      [s * 0.095, 1.22, -0.205],
      [s * 0.075, 0.96, -0.22],
      [s * 0.035, 0.76, -0.185],
    ]);
    b.sweep(flankHair, [0.032, 0.042, 0.034, 0.006], HAIR, {
      bone: hairBack,
      sides: 5,
      caps: "point",
      group: "hair",
    });
  }
  // Layered anime hair-lock cards along the ponytail for feathered silhouette
  const hairCardFrames = b.along(hairBack, 6);
  b.cards(hairCardFrames, HAIR_LOCK_TEX, {
    size: [0.065, 0.16],
    lean: 65,
    flow: [0, -0.85, -0.5],
    vary: 0.2,
    spin: 18,
    rng: rand,
    group: "hair",
    name: "hairFeatherCards",
  });

  // Winged Moon-Gold Tiara & Glowing Starlight Brow Gem
  const tiaraArc = catmull([
    [-0.078, 1.645, 0.015],
    [-0.048, 1.662, 0.068],
    [0, 1.652, 0.092],
    [0.048, 1.662, 0.068],
    [0.078, 1.645, 0.015],
  ]);
  b.sweep(tiaraArc, [0.008, 0.012, 0.008], GOLD, {
    bone: head,
    sides: 5,
    caps: "point",
    group: "head",
    name: "tiaraBand",
  });
  b.part(new THREE.OctahedronGeometry(0.022, 0), GOLD, {
    bone: head,
    at: [0, 1.662, 0.094],
    scale: [0.85, 1.35, 0.55],
    group: "head",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.014, 0), MANA_CYAN, {
      bone: head,
      at: [0, 1.662, 0.101],
      scale: [0.75, 1.25, 0.5],
      group: "head",
      name: "tiaraStarGem",
    }),
    1.8,
  );

  // Tiara Valkyrie/Sylvan temple wings
  const tiaraWingOutline: OutlinePoint[] = [
    [0, 0],
    [0.065, 0.025],
    [0.145, 0.095, "sharp"],
    [0.095, 0.092],
    [0.125, 0.135, "sharp"],
    [0.045, 0.088],
    [0, 0.038],
  ];
  for (const s of [1, -1]) {
    b.extrude(tiaraWingOutline, {
      bone: head,
      at: [s * 0.068, 1.652, 0.032],
      x: [s * 0.42, 0.35, -0.84],
      y: [s * 0.25, 0.94, 0.22],
      thickness: [0.008, 0.003],
      smoothing: 1,
      color: GOLD,
      group: "head",
      name: `tiaraWing${s > 0 ? "L" : "R"}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 6. Ornate Leaf-Wing Pauldrons, Arms, Elven Vane Bracers & Hands
  // ---------------------------------------------------------------------------
  const pauldronLeafOutline: OutlinePoint[] = [
    [-0.065, 0],
    [0.065, 0],
    [0.088, 0.055],
    [0.055, 0.125],
    [0, 0.175, "sharp"],
    [-0.055, 0.125],
    [-0.088, 0.055],
  ];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pJoint = pauldronJoints.get(s)!;
    const arm = armChains.get(s)!;

    // Layered shoulder pauldron (lower emerald leaf + upper gold filigree crest + mana gem)
    b.extrude(pauldronLeafOutline, {
      bone: pJoint,
      at: [s * 0.125, 1.425, 0],
      x: [0, 0, 1],
      y: [s * 0.88, 0.46, 0],
      thickness: [0.014, 0.006],
      smoothing: 1,
      color: EMERALD,
      group: `arm${side}`,
      name: `pauldronBase${side}`,
    });
    b.extrude(
      [
        [-0.045, 0],
        [0.045, 0],
        [0.062, 0.055],
        [0, 0.135, "sharp"],
        [-0.062, 0.055],
      ],
      {
        bone: pJoint,
        at: [s * 0.135, 1.442, 0],
        x: [0, 0, 1],
        y: [s * 0.82, 0.56, 0],
        thickness: 0.012,
        smoothing: 1,
        color: GOLD,
        group: `arm${side}`,
        name: `pauldronGold${side}`,
      },
    );
    glow(
      b.part(new THREE.OctahedronGeometry(0.015, 0), MANA_CYAN, {
        bone: pJoint,
        at: [s * 0.175, 1.472, 0],
        scale: [1.2, 0.8, 0.8],
        group: `arm${side}`,
      }),
      1.5,
    );

    // Arm skin, detached silk upper sleeve & ornate archer bracer
    b.sweep(arm, [0.042, 0.036, 0.029, 0.024], {
      bands: [
        [0.18, SKIN],
        [0.52, SILK_IVORY],
        [0.92, LEATHER_DARK],
        [1.0, EMERALD],
      ],
      sides: 8,
      group: `arm${side}`,
      name: `armTube${side}`,
    });

    // Gold upper-arm cuff & elbow guard
    const upperCuffPt = arm.at(0.2);
    b.part(new THREE.CylinderGeometry(0.043, 0.043, 0.018, 7, 1), GOLD, {
      frame: upperCuffPt,
      group: `arm${side}`,
    });
    const elbowPt = arm.at(0.5);
    b.part(new THREE.OctahedronGeometry(0.028, 0), GOLD, {
      bone: arm.joints[1],
      at: offset(elbowPt.at, [s * 0.3, -0.2, -0.9], 0.028),
      scale: [0.9, 1.3, 0.7],
      group: `arm${side}`,
    });

    // Sweeping Elven Forearm Vane Fin (larger shield-vane on bow-arm L)
    const vaneScale = s > 0 ? 1.18 : 0.9;
    const vaneOutline: OutlinePoint[] = [
      [0, -0.012],
      [0.14 * vaneScale, -0.016],
      [0.21 * vaneScale, 0.032, "sharp"],
      [0.08 * vaneScale, 0.038],
      [0, 0.018],
    ];
    const forearmFrame = arm.at(0.66);
    b.extrude(vaneOutline, {
      bone: arm.joints[1],
      at: offset(forearmFrame.at, [s * 0.4, 0.5, -0.7], 0.026),
      x: [-s * 0.82, 0.42, -0.38],
      y: [s * 0.35, 0.88, -0.3],
      thickness: [0.012, 0.004],
      smoothing: 1,
      color: s > 0 ? MOON_SILVER : GOLD,
      group: `arm${side}`,
      name: `bracerVane${side}`,
    });

    // Sculpted palm & 5 articulated fingers
    const hand = arm.tip!;
    b.frustumBox(
      [s * 0.555, 1.175, 0.038],
      [s * 0.625, 1.135, 0.064],
      [0.056, 0.028],
      [0.062, 0.024],
      {
        bone: hand,
        color: EMERALD,
        group: `arm${side}`,
        name: `palm${side}`,
      },
    );
    b.part(new THREE.OctahedronGeometry(0.016, 0), GOLD, {
      bone: hand,
      at: [s * 0.595, 1.162, 0.052],
      scale: [1.2, 0.6, 1.1],
      group: `arm${side}`,
    });

    for (const tag of ["thumb", "index", "middle", "ring", "pinky"]) {
      const fChain = fingerChains.get(`${tag}${side}`)!;
      b.sweep(fChain, [0.0095, 0.0075, 0.0045], {
        bands: [
          [0.45, LEATHER_DARK],
          [1.0, SKIN],
        ],
        sides: 4,
        caps: "point",
        group: `arm${side}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 7. Legs, Thigh Straps, Strapped Dagger & Thigh-High Sylvan Boots (y = 0)
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = legChains.get(s)!;
    const hipJ = leg.joints[0];
    const kneeJ = leg.joints[1];
    const ankleJ = leg.joints[2];

    // Main leg sweep (leggings above knee, cuffed thigh-high boots below)
    b.sweep(
      leg,
      (t) => {
        if (t < 0.25) return [0.072, 0.076];
        if (t < 0.48) return [0.054, 0.056];
        if (t < 0.72) return [0.056, 0.058];
        if (t < 0.88) return [0.042, 0.045];
        return [0.036, 0.028];
      },
      {
        color: (t) => (t < 0.44 ? LEGGING_PAINT : BOOT_PAINT),
        sides: 8,
        group: `leg${side}`,
        name: `legTube${side}`,
      },
    );

    // Flared leaf-cuff at top of thigh-high boot + winged golden knee rondel
    const kneePt = kneeJ.at;
    const bootCuffOutline: OutlinePoint[] = [
      [-0.058, 0],
      [0.058, 0],
      [0.072, 0.055],
      [0, 0.115, "sharp"],
      [-0.072, 0.055],
    ];
    b.extrude(bootCuffOutline, {
      bone: kneeJ,
      at: [kneePt.x, kneePt.y - 0.02, kneePt.z + 0.048],
      x: [1, 0, 0],
      y: [0, 0.94, 0.34],
      thickness: [0.012, 0.005],
      smoothing: 1,
      color: EMERALD,
      group: `leg${side}`,
      name: `bootCuff${side}`,
    });
    b.part(new THREE.OctahedronGeometry(0.028, 0), GOLD, {
      bone: kneeJ,
      at: [kneePt.x, kneePt.y + 0.02, kneePt.z + 0.062],
      scale: [1.0, 1.45, 0.55],
      group: `leg${side}`,
      name: `kneeGuard${side}`,
    });
    glow(
      b.part(new THREE.OctahedronGeometry(0.013, 0), MANA_MINT, {
        bone: kneeJ,
        at: [kneePt.x, kneePt.y + 0.02, kneePt.z + 0.072],
        scale: [0.8, 1.2, 0.45],
        group: `leg${side}`,
      }),
      1.3,
    );

    // Gold ankle spur & leaf wing at ankle
    const anklePt = ankleJ.at;
    b.extrude(
      [
        [0, -0.012],
        [0.065, -0.008],
        [0.11, 0.042, "sharp"],
        [0.045, 0.045],
        [0, 0.018],
      ],
      {
        bone: ankleJ,
        at: [anklePt.x + s * 0.036, anklePt.y + 0.025, anklePt.z - 0.01],
        x: [0, 0, -1],
        y: [s * 0.32, 0.94, 0],
        thickness: [0.01, 0.004],
        smoothing: 1,
        color: GOLD,
        group: `leg${side}`,
      },
    );

    // Planted Ranger Boot Foot & Flat Grounded Sole + Heel at exact y = 0.000
    b.frustumBox(
      [s * 0.128, 0.0, 0.068],
      [s * 0.128, 0.026, 0.068],
      [0.078, 0.145],
      [0.072, 0.138],
      {
        bone: ankleJ,
        up: [0, 0, 1],
        color: LEATHER_DARK,
        group: `leg${side}`,
        name: `bootSole${side}`,
      },
    );
    b.frustumBox(
      [s * 0.126, 0.0, -0.012],
      [s * 0.126, 0.046, -0.012],
      [0.068, 0.062],
      [0.064, 0.058],
      {
        bone: ankleJ,
        up: [0, 0, 1],
        color: LEATHER_DARK,
        group: `leg${side}`,
        name: `bootHeel${side}`,
      },
    );
    // Upturned armored elven toe tip (above y = 0.012)
    b.spike([s * 0.132, 0.026, 0.115], [s * 0.134, 0.048, 0.168], null, 0.028, GOLD, {
      bone: ankleJ,
      sides: 5,
      group: `leg${side}`,
      name: `bootToeTip${side}`,
    });

    // Left thigh belt & strapped Elven Leaf Dagger in Gilded Scabbard
    if (s > 0) {
      const thighMid = leg.at(0.24);
      b.part(new THREE.CylinderGeometry(0.068, 0.065, 0.022, 8, 1), LEATHER_WARM, {
        frame: thighMid,
        bone: hipJ,
        group: `leg${side}`,
        name: "thighStrapL",
      });
      const scabbardTop: V3 = [0.168, 0.81, 0.032];
      const scabbardTip: V3 = [0.182, 0.61, -0.018];
      b.sweep([scabbardTop, scabbardTip], [0.018, 0.004], EMERALD, {
        bone: hipJ,
        sides: 4,
        caps: "point",
        group: `leg${side}`,
        name: "daggerScabbard",
      });
      b.rod(scabbardTop, [0.162, 0.885, 0.048], [0.011, 0.008], GOLD, {
        bone: hipJ,
        sides: 4,
        group: `leg${side}`,
        name: "daggerHilt",
      });
      b.rod([0.165, 0.815, 0.002], [0.165, 0.815, 0.062], 0.008, GOLD, {
        bone: hipJ,
        sides: 4,
        group: `leg${side}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 8. Ornate Elven Back Quiver & Feathered Arrows
  // ---------------------------------------------------------------------------
  const qBase = quiverJoint.local([0, -0.22, 0]);
  const qTop = quiverJoint.local([0, 0.24, 0]);
  b.sweep([qBase, qTop], [0.032, 0.048], {
    bone: quiverJoint,
    bands: [
      [0.18, GOLD],
      [0.82, LEATHER_WARM],
      [1.0, GOLD],
    ],
    sides: 7,
    caps: "flat",
    group: "quiver",
    name: "quiverBody",
  });

  // Decorative leaf fin along quiver outer edge
  b.extrude(
    [
      [0, 0],
      [0.042, 0.06],
      [0.055, 0.22, "sharp"],
      [0.025, 0.34],
      [0, 0.38],
    ],
    {
      bone: quiverJoint,
      at: quiverJoint.local([-0.035, -0.16, 0]),
      x: quiverJoint.dir([-1, 0, 0]),
      y: quiverJoint.dir([0, 1, 0]),
      thickness: [0.01, 0.004],
      smoothing: 1,
      color: EMERALD,
      group: "quiver",
      name: "quiverFin",
    },
  );

  // Fan of 5 feathered starlight arrows emerging from quiver mouth
  const fletchFrames: ReturnType<typeof frame>[] = [];
  for (let i = -2; i <= 2; i++) {
    const aStart = quiverJoint.local([i * 0.011, 0.16, (i % 2) * 0.008]);
    const aEnd = quiverJoint.local([i * 0.022, 0.42 + Math.abs(i) * 0.012, (i % 2) * 0.014]);
    b.rod(aStart, aEnd, 0.0045, GOLD_FLAT, {
      bone: quiverJoint,
      sides: 4,
      group: "quiver",
    });
    glow(
      b.part(new THREE.OctahedronGeometry(0.009, 0), MANA_CYAN, {
        bone: quiverJoint,
        at: aEnd,
        group: "quiver",
      }),
      1.4,
    );
    fletchFrames.push(frame(lerpPt(aStart, aEnd, 0.58), quiverJoint.dir([1, 0.2, 0]), quiverJoint.dir([0, 1, 0])));
  }
  b.cards(fletchFrames, FEATHER_TEX, {
    bone: quiverJoint,
    size: [0.028, 0.075],
    lean: 15,
    flow: quiverJoint.dir([0, 1, 0]),
    cross: true,
    group: "quiver",
    name: "quiverFletchings",
  });

  // ---------------------------------------------------------------------------
  // 9. Celestial Sylvan Greatbow (in Left Hand) & Starlight Spirit Arrow (in Right Hand)
  // ---------------------------------------------------------------------------
  const gripCenter: V3 = [0.648, 1.135, 0.078];
  const riserTop: V3 = [0.658, 1.255, 0.095];
  const riserBot: V3 = [0.638, 1.015, 0.061];
  const upperMid: V3 = [0.695, 1.52, 0.065];
  const upperNock: V3 = [0.675, 1.73, -0.085];
  const lowerMid: V3 = [0.665, 0.75, 0.015];
  const lowerNock: V3 = [0.645, 0.53, -0.125];

  // Central sculpted riser with emerald grip & glowing starlight rune-core
  b.sweep([riserBot, gripCenter, riserTop], [0.022, 0.018, 0.022], {
    bone: bowGrip,
    bands: [
      [0.25, GOLD],
      [0.75, EMERALD],
      [1.0, GOLD],
    ],
    sides: 6,
    group: "bow",
    name: "bowRiser",
  });

  // Upper & lower recurve limbs (skinned to bowLimbU and bowLimbD)
  const upperLimbPath = bezier(riserTop, [0.685, 1.38, 0.145], upperMid, upperNock);
  const lowerLimbPath = bezier(riserBot, [0.665, 0.89, 0.105], lowerMid, lowerNock);

  b.sweep(upperLimbPath, [0.022, 0.026, 0.016, 0.006], BOW_WOOD, {
    bone: bowLimbU,
    sides: 5,
    caps: "point",
    group: "bow",
    name: "bowLimbUpper",
  });
  b.sweep(lowerLimbPath, [0.022, 0.026, 0.016, 0.006], BOW_WOOD, {
    bone: bowLimbD,
    sides: 5,
    caps: "point",
    group: "bow",
    name: "bowLimbLower",
  });

  // Ornate Moon-Silver & Emerald Wing Blades along the outer bow limbs
  const bowBladeOutline: OutlinePoint[] = [
    [0, 0],
    [0.065, 0.08],
    [0.092, 0.24, "sharp"],
    [0.048, 0.36],
    [0.068, 0.44, "sharp"],
    [0, 0.38],
  ];
  b.extrude(bowBladeOutline, {
    bone: bowLimbU,
    at: riserTop,
    x: [0.15, 0.12, 0.98],
    y: [0.05, 0.98, -0.18],
    thickness: [0.014, 0.004],
    smoothing: 1,
    color: MOON_SILVER,
    group: "bow",
    name: "bowWingBladeU",
  });
  b.extrude(bowBladeOutline, {
    bone: bowLimbD,
    at: riserBot,
    x: [0.15, -0.12, 0.98],
    y: [0.05, -0.98, -0.18],
    thickness: [0.014, 0.004],
    smoothing: 1,
    color: MOON_SILVER,
    group: "bow",
    name: "bowWingBladeD",
  });

  // Glowing mana crystals at bow riser & limb nocks + glowing celestial rune ring
  for (const [pt, jnt, sc] of [
    [[0.668, 1.135, 0.118] as V3, bowGrip, 0.022],
    [upperNock, bowLimbU, 0.018],
    [lowerNock, bowLimbD, 0.018],
  ] as const) {
    glow(
      b.part(new THREE.OctahedronGeometry(sc, 0), MANA_CYAN, {
        bone: jnt,
        at: pt,
        scale: [0.85, 1.35, 0.85],
        group: "bow",
      }),
      1.8,
    );
  }

  // Self-lit celestial rune ring floating in front of the bow riser
  glow(
    b.part(new THREE.PlaneGeometry(0.16, 0.16), "#ffffff", {
      bone: bowGrip,
      at: [0.675, 1.135, 0.135],
      dir: [1, 0, 0.15],
      axis: "z",
      texture: RUNE_TEX,
      group: "bow",
      name: "bowRuneHalo",
    }),
    1.8,
  );

  // Hanging silk tassel & leaf plume on the bow riser
  b.cards([frame([0.642, 1.01, 0.06], [0, 1, 0], [0, 0, 1])], TASSEL_TEX, {
    bone: bowGrip,
    size: [0.036, 0.11],
    lean: 180,
    flow: [0, 0, 1],
    group: "bow",
    name: "bowTassel",
  });

  // Taut Glowing Starlight Energy Bowstring (skinned across bowLimbU -> bowGrip -> bowLimbD)
  const stringMid: V3 = [0.652, 1.13, -0.105];
  glow(
    b.sweep(polyline([upperNock, stringMid, lowerNock]), 0.004, MANA_CYAN, {
      bone: [bowLimbU, bowGrip, bowLimbD],
      sides: 4,
      caps: "flat",
      group: "bow",
      name: "bowString",
    }),
    2.0,
  );

  // Starlight Spirit Arrow held in Right Hand
  const arrowTail = arrowHeld.local([0, -0.34, 0]);
  const arrowTip = arrowHeld.local([0, 0.44, 0]);
  b.rod(arrowTail, arrowTip, 0.0055, GOLD_FLAT, {
    bone: arrowHeld,
    sides: 4,
    group: "arrow",
    name: "heldArrowShaft",
  });
  // Glowing star-blade arrowhead
  const arrowHeadOutline: OutlinePoint[] = [
    [0, -0.025],
    [0.026, -0.042, "sharp"],
    [0.014, 0.015],
    [0, 0.085, "sharp"],
    [-0.014, 0.015],
    [-0.026, -0.042, "sharp"],
  ];
  glow(
    b.extrude(arrowHeadOutline, {
      bone: arrowHeld,
      at: arrowTip,
      x: arrowHeld.dir([1, 0, 0]),
      y: arrowHeld.dir([0, 1, 0]),
      thickness: [0.008, 0.002],
      smoothing: 0,
      color: MANA_CYAN,
      group: "arrow",
      name: "heldArrowHead",
    }),
    1.9,
  );
  // Iridescent fletching cards on the held arrow
  b.cards([frame(arrowHeld.local([0, -0.26, 0]), arrowHeld.dir([1, 0, 0]), arrowHeld.dir([0, 1, 0]))], FEATHER_TEX, {
    bone: arrowHeld,
    size: [0.032, 0.095],
    lean: 12,
    flow: arrowHeld.dir([0, -1, 0]),
    cross: true,
    group: "arrow",
    name: "heldArrowFletch",
  });

  // Unused import guard for INK & MANA_GOLD & SILVER_FLAT & EMERALD_FLAT via subtle collar/quiver details
  b.part(new THREE.OctahedronGeometry(0.014, 0), SILVER_FLAT, {
    bone: quiverJoint,
    at: quiverJoint.local([0, 0.04, 0.042]),
    group: "quiver",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.011, 0), MANA_GOLD, {
      bone: quiverJoint,
      at: quiverJoint.local([0, 0.04, 0.05]),
      group: "quiver",
    }),
    1.5,
  );
  b.rod([0, 1.38, 0.098], [0, 1.32, 0.105], 0.004, EMERALD_FLAT, {
    bone: thorax,
    sides: 4,
    group: "torso",
  });
  b.rod([0, 1.31, 0.106], [0, 1.26, 0.106], 0.0035, INK, {
    bone: thorax,
    sides: 4,
    group: "torso",
  });

  return b.root;
}

function arcCurve(a: V3, m: V3, c: V3) {
  return bezier(a, m, c);
}

function lerpPt(a: V3, b: V3, t: number): V3 {
  const va = vec(a);
  const vb = vec(b);
  return va.lerp(vb, t);
}
