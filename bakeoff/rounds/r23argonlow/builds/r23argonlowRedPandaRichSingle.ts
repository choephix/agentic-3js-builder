import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame, line } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { offset, rng, vec } from "../../../../src/math";
import { mottle, noise, paint, smoothstep } from "../../../../src/paint";
import { bezier, catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, furEdge, INK, inkLines, zigzag } from "../../../../kits/toon";

export const meta = {
  name: "Adeptal Red Panda",
  description:
    "Genshin Impact-styled cel-shaded red panda balancing atop an ancient mossy adeptus stone with golden filigree collar, jade bell, silk tassels, bamboo shoots, and glowing Dendro-emerald runes.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "redPanda", detail: 1, paintSize: 2048 });

  // ---------------------------------------------------------------------------
  // Genshin Impact Cel-Shaded Palette & Procedural Paints
  // ---------------------------------------------------------------------------
  const RUST_HEX = "#e85325";
  const ORANGE_HEX = "#ff7d3b";
  const CREAM_HEX = "#fff6e3";
  const CHOC_HEX = "#311819";
  const ROUGE_HEX = "#a3281d";
  const GOLD_HEX = "#f5c54b";
  const GOLD_DARK_HEX = "#b87f1e";
  const JADE_HEX = "#3cf2b5";
  const JADE_DEEP_HEX = "#14876e";
  const RED_SILK_HEX = "#d92b38";
  const BAMBOO_HEX = "#68b849";
  const STONE_LIT_HEX = "#7d8896";
  const STONE_SHAD_HEX = "#4b5466";
  const MOSS_A_HEX = "#5cc94b";
  const MOSS_B_HEX = "#29853b";

  const RUST = cel(RUST_HEX, "#a62b1c");
  const ORANGE = cel(ORANGE_HEX, "#c74420");
  const CREAM = cel(CREAM_HEX, "#e8c59e");
  const CHOC = cel(CHOC_HEX, "#1c0b12");
  const ROUGE = cel(ROUGE_HEX, "#691414");
  const GOLD = cel(GOLD_HEX, GOLD_DARK_HEX);
  const GOLD_DEEP = cel("#d4992a", "#855210");
  const JADE_CEL = cel("#2cd49c", JADE_DEEP_HEX);
  const SILK_RED = cel(RED_SILK_HEX, "#8c1428");
  const BAMBOO_CEL = cel(BAMBOO_HEX, "#397a2c");
  const BAMBOO_PALE = cel("#b4e386", "#74ab49");
  const CLAW_IVORY = cel("#fff5dc", "#cfa97e");
  const PAW_PAD = cel("#4a252b", INK);
  const NOSE_PAINT = inkLines(cel("#2b1522", INK), {
    levels: [0.22],
    axis: [0, 0, 1],
    width: 0.08,
  });

  // Ancient Liyue-inspired stone & emerald moss paints
  const STONE_BASE = cel(
    mottle(STONE_LIT_HEX, "#687382", { size: 0.14, contrast: 1.4, seed: 11 }),
    STONE_SHAD_HEX,
  );
  const MOSS_COAT = cel(
    mottle(MOSS_A_HEX, MOSS_B_HEX, { size: 0.08, contrast: 1.6, seed: 23 }),
    "#1b592c",
  );
  const MOSSY_BOULDER = furEdge(MOSS_COAT, STONE_BASE, {
    axis: [0, 1, 0],
    by: "normal",
    level: 0.34,
    teeth: 0.24,
    period: 0.055,
    along: [0.6, 0, 0.8],
    ink: "#1a3b22",
    inkWidth: 0.045,
  });
  const STEP_STONE = furEdge(MOSS_COAT, STONE_BASE, {
    axis: [0, 1, 0],
    by: "normal",
    level: 0.45,
    teeth: 0.2,
    period: 0.045,
    along: [1, 0, 0.3],
    ink: "#1a3b22",
    inkWidth: 0.04,
  });

  // Red panda torso & neck coat: vibrant rust-orange back with dark chocolate belly & chest,
  // warm dorsal saddle stripe, and crisp cel-shaded zig-zag fur edges.
  const DORSAL_COAT = paint((p, n) => {
    const saddle =
      n.y > 0.38 && Math.abs(p.x) < 0.028 + 0.014 * zigzag(p.z / 0.036);
    const flankWarmth =
      n.y > -0.05 && n.y <= 0.42 && Math.abs(p.x) > 0.045;
    const baseHex = saddle ? ROUGE_HEX : flankWarmth ? ORANGE_HEX : RUST_HEX;
    return cel(baseHex, saddle ? "#6b1512" : "#a82d1b").at(p, n);
  });

  const BODY_PAINT = furEdge(DORSAL_COAT, CHOC, {
    axis: [0, 1, 0],
    by: "normal",
    level: -0.22,
    teeth: 0.24,
    period: 0.028,
    along: [0, 0, 1],
    ink: INK,
    inkWidth: 0.05,
  });

  // Characteristic red panda face paint: rust crown, cream cheek patches, rust tear-tracks
  // descending from inner eyes to mouth corners, and cream ear-rim framing.
  const HEAD_PAINT = paint((p, n) => {
    const dx = Math.abs(p.x);
    const dy = p.y - 0.565;
    const dz = p.z - 0.235;
    const zTeeth = 0.008 * zigzag(p.x / 0.018);

    // Dark rust tear-stripe running from inner eye down across cheek to mouth corner
    const tearTrack =
      dz > 0.015 &&
      dy < 0.015 &&
      dy > -0.065 &&
      Math.abs(dx - (0.026 + (0.015 - dy) * 0.42)) < 0.014 + 0.004 * zigzag(p.y / 0.016);
    if (tearTrack) return ROUGE.at(p, n);

    // Outer white/cream cheek flares & side-whisker pads
    const outerCheek =
      dz > -0.015 &&
      dy < 0.022 + zTeeth &&
      dy > -0.068 &&
      dx > 0.036 &&
      dx < 0.115;
    if (outerCheek) return CREAM.at(p, n);

    // Forehead cream eyebrow spots are built as geometry, plus soft cream halo in paint
    const browSpot =
      dz > 0.035 &&
      dy > 0.022 &&
      dy < 0.058 &&
      dx > 0.016 &&
      dx < 0.048;
    if (browSpot) return CREAM.at(p, n);

    // Chin/throat underside
    if (n.y < -0.55 && dz < 0.03) return CHOC.at(p, n);

    return DORSAL_COAT.at(p, n);
  });

  const SNOUT_PAINT = inkLines(
    furEdge(CREAM, ROUGE, {
      axis: [0, 0, 1],
      by: "normal",
      level: 0.15,
      teeth: 0.2,
      period: 0.018,
      along: [1, 0, 0],
    }),
    { levels: [0.08], axis: [0, 0, 1], width: 0.055 },
  );

  // Iconic ringed tail paint: 6 alternating bands of rich rust-orange, dark chocolate-auburn,
  // and cream highlights with zig-zag fur tooth transitions and a dark plush tip.
  const TAIL_PAINT = paint((p, n, s) => {
    const t = s[0];
    const deg = s[1];
    const tooth = 0.016 * zigzag(deg / 24);
    const u = t + tooth;
    if (u > 0.87) return CHOC.at(p, n);
    const cycle = (u * 6.2) % 1;
    let col = RUST;
    if (cycle < 0.16) col = CREAM;
    else if (cycle < 0.62) col = RUST;
    else col = ROUGE;
    // Slightly paler underside of tail in lit bands
    if (Math.abs(deg - 180) < 52 && cycle < 0.62) {
      return CREAM.at(p, n);
    }
    return col.at(p, n);
  });

  // Leg paint: warm rust upper shoulder/thigh transitioning via zig-zag edge into glossy dark chocolate-black socks
  const LEG_PAINT = paint((p, n, s) => {
    const t = s[0];
    const tooth = 0.06 * zigzag((p.x + p.z) / 0.024);
    if (t + tooth < 0.28) return DORSAL_COAT.at(p, n);
    return CHOC.at(p, n);
  });

  // ---------------------------------------------------------------------------
  // SVG Textures: Eyes, Fur Cards, Glowing Runes, Tassels & Foliage
  // ---------------------------------------------------------------------------
  const EYE_TEX = animeEye({
    iris: "#2ad4a3",
    irisLight: "#9effdf",
    irisDark: "#0c4f47",
    blush: "#ff7a8a",
    brow: true,
    size: 512,
  });

  // Cream & rust layered fur tuft card
  const FUR_CARD_CREAM = svg(
    `<svg viewBox="0 0 64 96">
      <path d="M8 94 C10 58 18 28 22 6 C26 26 28 46 30 58 C32 34 36 14 40 2 C44 24 46 48 46 62 C50 40 54 22 58 12 C58 46 56 74 54 94 Z"
        fill="#fff6e3" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M18 94 C20 68 26 44 32 24 C38 44 42 68 46 94 Z" fill="#f2d5b3"/>
    </svg>`,
    { size: 256 },
  );

  const FUR_CARD_RUST = svg(
    `<svg viewBox="0 0 64 96">
      <path d="M6 94 C10 56 16 26 22 8 C26 28 28 48 30 56 C33 30 37 12 41 3 C45 26 47 48 47 60 C51 38 55 20 59 14 C59 48 56 74 54 94 Z"
        fill="#e85325" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M18 94 C22 64 28 42 33 22 C39 42 43 66 47 94 Z" fill="#ff8947"/>
    </svg>`,
    { size: 256 },
  );

  // Genshin-style ornate gold & crimson silk tassel card
  const TASSEL_TEX = svg(
    `<svg viewBox="0 0 64 128">
      <polygon points="32,4 50,22 32,40 14,22" fill="#f5c54b" stroke="${INK}" stroke-width="3.5"/>
      <polygon points="32,11 43,22 32,33 21,22" fill="#3cf2b5" stroke="${INK}" stroke-width="2.5"/>
      <rect x="20" y="38" width="24" height="10" rx="3" fill="#f5c54b" stroke="${INK}" stroke-width="3"/>
      <path d="M16 48 L10 118 L22 124 L27 52 L32 125 L37 52 L42 124 L54 118 L48 48 Z"
        fill="#d92b38" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M22 50 L18 116 M32 50 L32 120 M42 50 L46 116" stroke="#f5c54b" stroke-width="2.8" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  // Glowing Adeptal / Dendro sigil decal for the mossy stone
  const RUNE_TEX = svg(
    `<svg viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="54" fill="none" stroke="#3cf2b5" stroke-width="4.5" stroke-dasharray="16 8"/>
      <polygon points="64,12 78,48 116,64 78,80 64,116 50,80 12,64 50,48" fill="none" stroke="#6bffd3" stroke-width="4.5"/>
      <path d="M64 26 C82 44 82 84 64 102 C46 84 46 44 64 26 Z" fill="#3cf2b5" fill-opacity="0.35" stroke="#a8ffea" stroke-width="4"/>
      <circle cx="64" cy="64" r="10" fill="#ffffff"/>
      <circle cx="64" cy="22" r="5" fill="#6bffd3"/>
      <circle cx="64" cy="106" r="5" fill="#6bffd3"/>
      <circle cx="22" cy="64" r="5" fill="#6bffd3"/>
      <circle cx="106" cy="64" r="5" fill="#6bffd3"/>
    </svg>`,
    { size: 256 },
  );

  // Stylized cel-shaded fern & spirit-grass card
  const FERN_TEX = svg(
    `<svg viewBox="0 0 64 96">
      <path d="M32 94 Q30 50 34 6" stroke="#1e5928" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <path d="M32 76 Q12 68 8 56 Q22 58 32 66 Z" fill="#5cc94b" stroke="${INK}" stroke-width="2.8"/>
      <path d="M32 72 Q52 64 56 52 Q42 54 32 62 Z" fill="#5cc94b" stroke="${INK}" stroke-width="2.8"/>
      <path d="M32 54 Q14 46 10 34 Q24 36 32 46 Z" fill="#6ee05a" stroke="${INK}" stroke-width="2.8"/>
      <path d="M33 50 Q50 42 54 30 Q40 32 33 42 Z" fill="#6ee05a" stroke="${INK}" stroke-width="2.8"/>
      <path d="M33 32 Q18 24 16 14 Q26 16 33 24 Z" fill="#8df279" stroke="${INK}" stroke-width="2.8"/>
      <path d="M34 28 Q48 20 50 10 Q38 14 34 22 Z" fill="#8df279" stroke="${INK}" stroke-width="2.8"/>
      <ellipse cx="34" cy="8" rx="5" ry="7" fill="#a8ffea" stroke="${INK}" stroke-width="2.5"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // 1. Skeleton First: Root Pelvis, Spine, Neck, Head, Jaw, Ears, Tail & 4 Legs
  // ---------------------------------------------------------------------------
  // Real-world red panda scale: body ~0.58 m, tail ~0.48 m, perched atop a ~0.34 m mossy boulder.
  const hips = b.joint("hips", {
    at: [0, 0.505, -0.155],
    dir: [0, 0.04, 1],
    role: "spine",
    group: "body",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.505, -0.155],
      [0, 0.535, -0.055],
      [0, 0.525, 0.045],
      [0, 0.505, 0.135],
    ]),
    {
      parent: hips,
      names: ["spine1", "spine2", "chest"],
      role: "spine",
      group: "body",
    },
  );
  const chest = spine.joints[2];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.505, 0.135],
      [0, 0.535, 0.19],
      [0, 0.565, 0.235],
    ]),
    {
      parent: chest,
      names: ["neck1", "neck2"],
      role: "neck",
      group: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.565, 0.235],
    dir: [0, -0.06, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.032, down: 0.032 }),
    dir: [0, -0.22, 1],
    role: "jaw",
    group: "head",
  });

  // Expressive large triangular ears with joints
  const earJoints: Record<number, ReturnType<typeof b.joint>> = {};
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    earJoints[s] = b.joint(`ear${side}`, {
      parent: head,
      at: head.local([s * 0.068, 0.005, 0.058]),
      dir: [s * 0.68, 0.72, 0.12],
      role: "fan",
      group: `ear${side}`,
    });
  }

  // Long, counter-balancing bushy ringed tail sweeping gracefully behind in an S-arch
  const tailPath = catmull([
    [0, 0.505, -0.155],
    [0, 0.52, -0.255],
    [0.015, 0.565, -0.365],
    [0.028, 0.625, -0.475],
    [0.018, 0.665, -0.585],
    [-0.01, 0.645, -0.685],
    [-0.025, 0.59, -0.755],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    count: 6,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6"],
    role: "tail",
    group: "tail",
  });

  // Four legs balanced on the irregular mossy boulder peaks (separated, readable rest pose)
  // Front limbs (shoulder -> elbow -> wrist -> front paw)
  const frontTargets: Record<number, [number, number, number]> = {
    1: [0.088, 0.332, 0.155], // front left on higher mossy crest
    [-1]: [-0.092, 0.308, 0.125], // front right stepped onto forward ledge
  };
  const frontChains: Record<number, ReturnType<typeof b.chain>> = {};
  const frontToeJoints: Record<number, ReturnType<typeof b.joint>[]> = { 1: [], [-1]: [] };

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const shoulderPt: [number, number, number] = [s * 0.068, 0.478, 0.125];
    const targetPt = frontTargets[s];
    const ikPts = limb(
      shoulderPt,
      targetPt,
      [0.105, 0.095],
      [[s * 0.18, 0, -1]],
    );
    const chain = b.chain(`arm${side}`, ikPts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
      contact: [targetPt[0], targetPt[1] - 0.018, targetPt[2] + 0.015],
      group: `arm${side}`,
    });
    frontChains[s] = chain;

    // 3 separated digit joints per front paw
    const wrist = chain.tip!;
    for (const [ti, angle] of ([-26, 0, 26] as const).entries()) {
      const rad = (angle * Math.PI) / 180;
      const dx = Math.sin(rad) * 0.024 + s * 0.003;
      const dz = Math.cos(rad) * 0.032;
      const dj = b.joint(`finger${side}${ti + 1}`, {
        parent: wrist,
        at: [targetPt[0] + dx * 0.65, targetPt[1] - 0.004, targetPt[2] + dz * 0.65],
        dir: [dx, -0.006, dz],
        role: "digit",
        group: `arm${side}`,
      });
      frontToeJoints[s].push(dj);
    }
  }

  // Hind limbs (hip -> knee -> hock -> hind paw)
  const hindTargets: Record<number, [number, number, number]> = {
    1: [0.094, 0.312, -0.145],
    [-1]: [-0.092, 0.326, -0.172],
  };
  const hindChains: Record<number, ReturnType<typeof b.chain>> = {};
  const hindToeJoints: Record<number, ReturnType<typeof b.joint>[]> = { 1: [], [-1]: [] };

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const hipPt: [number, number, number] = [s * 0.072, 0.488, -0.145];
    const targetPt = hindTargets[s];
    const ikPts = limb(
      hipPt,
      targetPt,
      [0.092, 0.088, 0.068],
      [
        [s * 0.15, 0, 1],
        [s * 0.1, 0, -1],
      ],
    );
    const chain = b.chain(`leg${side}`, ikPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `ankle${side}`],
      role: "leg",
      contact: [targetPt[0], targetPt[1] - 0.018, targetPt[2] + 0.018],
      group: `leg${side}`,
    });
    hindChains[s] = chain;

    // 3 separated digit joints per hind paw
    const ankle = chain.tip!;
    for (const [ti, angle] of ([-26, 0, 26] as const).entries()) {
      const rad = (angle * Math.PI) / 180;
      const dx = Math.sin(rad) * 0.025 + s * 0.003;
      const dz = Math.cos(rad) * 0.034;
      const dj = b.joint(`toe${side}${ti + 1}`, {
        parent: ankle,
        at: [targetPt[0] + dx * 0.65, targetPt[1] - 0.004, targetPt[2] + dz * 0.65],
        dir: [dx, -0.006, dz],
        role: "digit",
        group: `leg${side}`,
      });
      hindToeJoints[s].push(dj);
    }
  }

  // Collar Jade Bell hinge joint so the bell can swing dynamically
  const bellJoint = b.joint("collarBell", {
    parent: neck.joints[0],
    at: [0, 0.442, 0.208],
    dir: [0, -1, 0.15],
    role: "hinge",
    group: "accessories",
  });

  // ---------------------------------------------------------------------------
  // 2. Mossy Adeptus Stone Base (Resting cleanly on y = 0)
  // ---------------------------------------------------------------------------
  // Primary tiered boulder carved in Liyue style, planted firmly on y = 0
  const mainBoulderOutline: OutlinePoint[] = [
    [-0.26, -0.25],
    [-0.08, -0.30, "sharp"],
    [0.14, -0.28],
    [0.27, -0.16, "sharp"],
    [0.29, 0.05],
    [0.22, 0.24, "sharp"],
    [0.04, 0.30],
    [-0.16, 0.27, "sharp"],
    [-0.28, 0.12],
    [-0.30, -0.08, "sharp"],
  ];

  // Lower foundational plinth slab on y = 0
  b.extrude(mainBoulderOutline, {
    at: [0, 0.075, -0.01],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: [0.15, 0.12],
    bevel: 0.025,
    smoothing: 1,
    color: STEP_STONE,
    bone: hips,
    group: "stone",
    name: "stoneFoundation",
  });

  // Central sculpted boulder spire where the red panda balances
  const coreRockStations = [
    { at: [0, 0.01, -0.015], w: 0.52, h: 0.54 },
    { at: [0.005, 0.12, -0.01], w: 0.48, h: 0.50 },
    { at: [-0.005, 0.24, 0.0], w: 0.39, h: 0.46 },
    { at: [0.004, 0.315, -0.005], w: 0.28, h: 0.39 },
    { at: [0, 0.34, 0.02], w: 0.18, h: 0.24 },
  ];
  const coreBoulder = b.loft(coreRockStations, {
    sides: 10,
    smooth: false,
    caps: { start: "flat", end: "round" },
    color: MOSSY_BOULDER,
    bone: hips,
    group: "stone",
    name: "coreBoulder",
  });

  // Four stepped paw-perch stone ledges directly beneath each paw so every foot makes solid contact
  const perchConfigs: Array<{
    name: string;
    at: [number, number, number];
    w: number;
    d: number;
    h: number;
  }> = [
    {
      name: "perchFL",
      at: [0.088, 0.158, 0.155],
      w: 0.145,
      d: 0.155,
      h: 0.316,
    },
    {
      name: "perchFR",
      at: [-0.092, 0.146, 0.125],
      w: 0.145,
      d: 0.155,
      h: 0.292,
    },
    {
      name: "perchHL",
      at: [0.094, 0.148, -0.145],
      w: 0.15,
      d: 0.16,
      h: 0.296,
    },
    {
      name: "perchHR",
      at: [-0.092, 0.155, -0.172],
      w: 0.15,
      d: 0.16,
      h: 0.31,
    },
  ];

  for (const pc of perchConfigs) {
    b.rod(
      [pc.at[0], 0.005, pc.at[2]],
      [pc.at[0], pc.h, pc.at[2]],
      [pc.w * 0.56, pc.w * 0.48],
      {
        section: { ngon: 7 },
        caps: { start: "flat", end: "round" },
        color: MOSSY_BOULDER,
        bone: hips,
        group: "stone",
        name: pc.name,
      },
    );
  }

  // Surrounding smaller accent boulders resting on y = 0
  const sideRocks: Array<{
    name: string;
    a: [number, number, number];
    b: [number, number, number];
    r: [number, number];
  }> = [
    {
      name: "sideRockFront",
      a: [0.02, 0.004, 0.265],
      b: [0.01, 0.14, 0.24],
      r: [0.11, 0.075],
    },
    {
      name: "sideRockLeft",
      a: [0.235, 0.004, -0.02],
      b: [0.20, 0.165, -0.01],
      r: [0.105, 0.07],
    },
    {
      name: "sideRockRight",
      a: [-0.23, 0.004, 0.01],
      b: [-0.195, 0.15, 0.01],
      r: [0.10, 0.068],
    },
    {
      name: "sideRockBack",
      a: [-0.02, 0.004, -0.27],
      b: [-0.01, 0.15, -0.24],
      r: [0.115, 0.08],
    },
  ];
  for (const sr of sideRocks) {
    b.rod(sr.a, sr.b, sr.r, {
      section: { ngon: 6 },
      caps: { start: "flat", end: "round" },
      color: STEP_STONE,
      bone: hips,
      group: "stone",
      name: sr.name,
    });
  }

  // Plush 3D moss cushions capping the stone crevices
  const mossPuffs: Array<[number, number, number, number, number, number]> = [
    [0.0, 0.325, 0.01, 0.11, 0.032, 0.13],
    [0.14, 0.21, 0.04, 0.075, 0.028, 0.085],
    [-0.14, 0.20, -0.03, 0.08, 0.028, 0.08],
    [0.02, 0.145, 0.24, 0.065, 0.024, 0.055],
    [-0.01, 0.155, -0.24, 0.07, 0.025, 0.06],
    [0.21, 0.03, 0.16, 0.06, 0.022, 0.055],
    [-0.21, 0.03, -0.17, 0.065, 0.022, 0.06],
  ];
  for (const [i, [mx, my, mz, sx, sy, sz]] of mossPuffs.entries()) {
    b.part(new THREE.SphereGeometry(1, 8, 6), MOSS_COAT, {
      at: [mx, my, mz],
      scale: [sx, sy, sz],
      flat: true,
      bone: hips,
      group: "moss",
      name: `mossCushion${i + 1}`,
    });
  }

  // Glowing Dendro/Adeptus jade rune decals & carved amber-gold stone trim
  const boulderSurf = b.surface(coreBoulder);
  glow(
    b.decal(boulderSurf, RUNE_TEX, {
      at: [0.01, 0.18, 0.26],
      dir: [0.05, 0.2, 1],
      size: [0.13, 0.13],
      bone: hips,
      group: "runes",
      name: "runeFront",
    }),
    1.6,
  );
  glow(
    b.decal(boulderSurf, RUNE_TEX, {
      at: [0.24, 0.18, -0.02],
      dir: [1, 0.25, -0.05],
      size: [0.11, 0.11],
      bone: hips,
      group: "runes",
      name: "runeLeft",
    }),
    1.5,
  );
  glow(
    b.decal(boulderSurf, RUNE_TEX, {
      at: [-0.23, 0.17, 0.02],
      dir: [-1, 0.25, 0.05],
      size: [0.11, 0.11],
      bone: hips,
      group: "runes",
      name: "runeRight",
    }),
    1.5,
  );

  // Glowing jade crystal clusters sprouting from the mossy base
  const crystalSpecs: Array<{
    base: [number, number, number];
    dir: [number, number, number];
    len: number;
    r: number;
  }> = [
    { base: [0.22, 0.12, 0.12], dir: [0.45, 0.88, 0.25], len: 0.095, r: 0.024 },
    { base: [0.24, 0.10, 0.15], dir: [0.65, 0.68, 0.35], len: 0.068, r: 0.018 },
    { base: [-0.21, 0.11, -0.14], dir: [-0.48, 0.85, -0.22], len: 0.088, r: 0.022 },
    { base: [-0.23, 0.09, -0.11], dir: [-0.68, 0.65, -0.15], len: 0.062, r: 0.016 },
    { base: [0.08, 0.11, -0.25], dir: [0.2, 0.82, -0.52], len: 0.075, r: 0.019 },
  ];
  for (const [ci, cr] of crystalSpecs.entries()) {
    glow(
      b.spike(cr.base, cr.dir, cr.len, cr.r, {
        section: { ngon: 5 },
        color: JADE_HEX,
        bone: hips,
        group: "crystals",
        name: `jadeCrystal${ci + 1}`,
      }),
      1.35,
    );
  }

  // Stylized bamboo shoots & leaves growing beside the stone (classic red panda motif)
  const bambooStalks: Array<{
    x: number;
    z: number;
    leanX: number;
    leanZ: number;
    h: number;
    r: number;
  }> = [
    { x: -0.225, z: -0.06, leanX: -0.04, leanZ: -0.02, h: 0.38, r: 0.016 },
    { x: -0.245, z: -0.01, leanX: -0.06, leanZ: 0.03, h: 0.27, r: 0.013 },
    { x: 0.235, z: -0.12, leanX: 0.045, leanZ: -0.03, h: 0.31, r: 0.014 },
  ];

  const leafOutline: OutlinePoint[] = [
    [0, 0, "sharp"],
    [0.025, 0.014],
    [0.065, 0.011],
    [0.095, 0, "sharp"],
    [0.065, -0.011],
    [0.025, -0.014],
  ];

  for (const [bi, bs] of bambooStalks.entries()) {
    const p0: [number, number, number] = [bs.x, 0.08, bs.z];
    const p1: [number, number, number] = [
      bs.x + bs.leanX * 0.45,
      0.08 + bs.h * 0.5,
      bs.z + bs.leanZ * 0.45,
    ];
    const p2: [number, number, number] = [
      bs.x + bs.leanX,
      0.08 + bs.h,
      bs.z + bs.leanZ,
    ];
    const stalkCurve = bezier(p0, p1, p2);
    b.sweep(stalkCurve, [bs.r, bs.r * 0.72], {
      sides: 6,
      caps: { start: "flat", end: "round" },
      color: BAMBOO_CEL,
      bone: hips,
      group: "bamboo",
      name: `bambooStalk${bi + 1}`,
    });

    // Bamboo node rings
    for (const nt of [0.32, 0.68]) {
      const nodePt = stalkCurve.at(nt);
      const nodeTan = stalkCurve.tangentAt(nt);
      b.part(new THREE.TorusGeometry(bs.r * 1.05, 0.0035, 5, 8), BAMBOO_PALE, {
        at: nodePt,
        dir: nodeTan,
        axis: "z",
        bone: hips,
        group: "bamboo",
        name: `bambooNode${bi + 1}_${Math.round(nt * 10)}`,
      });
    }

    // Extruded cel-shaded bamboo leaves at the tip
    for (const [li, dirVec] of (
      [
        [Math.sign(bs.x) * 0.85, 0.35, 0.35],
        [Math.sign(bs.x) * 0.55, 0.55, -0.55],
      ] as const
    ).entries()) {
      b.extrude(leafOutline, {
        at: p2,
        x: [dirVec[0], dirVec[1], dirVec[2]],
        y: [0, 1, 0],
        thickness: [0.004, 0.001],
        smoothing: 1,
        color: li === 0 ? BAMBOO_CEL : BAMBOO_PALE,
        bone: hips,
        group: "bamboo",
        name: `bambooLeaf${bi + 1}_${li + 1}`,
      });
    }
  }

  // Scattered fern & glowing spirit-sprout cards on the mossy stone
  const stoneCards = boulderSurf.scatter(16, {
    rng: rng(108),
    minDist: 0.075,
    filter: (h) => h.n.y > 0.45 && h.at.y < 0.27 && Math.abs(h.at.x) > 0.08,
  });
  b.cards(stoneCards, FERN_TEX, {
    size: [0.048, 0.068],
    lean: 20,
    bend: 18,
    vary: 0.22,
    spin: 45,
    cross: true,
    rng: rng(109),
    bone: hips,
    group: "moss",
    name: "mossFerns",
  });

  // ---------------------------------------------------------------------------
  // 3. Red Panda Body, Neck & Fluffy Chest Ruff
  // ---------------------------------------------------------------------------
  const bodyStations = [
    { at: [0, 0.505, -0.175], w: 0.145, h: 0.14 },
    { at: [0, 0.528, -0.095], w: 0.185, h: 0.175 },
    { at: [0, 0.525, 0.0], w: 0.195, h: 0.182 },
    { at: [0, 0.508, 0.105], w: 0.182, h: 0.172 },
    { at: [0, 0.525, 0.175], w: 0.15, h: 0.148 },
    { at: [0, 0.562, 0.232], w: 0.128, h: 0.125 },
  ];

  const bodyLoft = b.loft(bodyStations, {
    bone: [hips, spine, neck],
    sides: 12,
    shift: (t) => [0, -0.014 * Math.sin(t * Math.PI)],
    caps: { start: "round", end: "round" },
    color: BODY_PAINT,
    group: "body",
    name: "torsoLoft",
  });

  // Plush cream-and-rust chest ruff tufts framing the front of the neck
  const chestFront = frame([0, 0.485, 0.185], [0, -0.25, 1]);
  b.ring(
    chestFront,
    {
      count: 5,
      radius: 0.048,
      fromDeg: 115,
      toDeg: 245,
      tilt: 38,
      parent: chest,
      group: "body",
    },
    (tuft) => {
      b.spike(tuft, tuft, 0.048, 0.024, {
        sides: 6,
        color: tuft.i % 2 === 0 ? CREAM : ORANGE,
        bone: chest,
        group: "body",
        name: `chestTuft${tuft.i + 1}`,
      });
    },
  );

  // ---------------------------------------------------------------------------
  // 4. Genshin Impact Ornate Gold Filigree Collar, Jade Vision Gem & Silk Tassels
  // ---------------------------------------------------------------------------
  const collarCenter = [0, 0.52, 0.182] as const;
  const collarRingPts = b.ring(
    frame(collarCenter, [0, 0.62, 0.78]),
    { count: 12, radius: 0.082 },
  ).items;
  const collarCurve = catmull(collarRingPts, { closed: true });

  b.sweep(collarCurve, [0.015, 0.011], {
    sides: 8,
    color: GOLD,
    bone: neck.joints[0],
    group: "accessories",
    name: "goldCollarBand",
  });

  // Crimson silk cord trim coiled just above the gold collar
  const cordRingPts = b.ring(
    frame([0, 0.53, 0.188], [0, 0.62, 0.78]),
    { count: 12, radius: 0.079 },
  ).items;
  b.sweep(catmull(cordRingPts, { closed: true }), 0.0065, {
    sides: 6,
    color: SILK_RED,
    bone: neck.joints[0],
    group: "accessories",
    name: "silkCollarCord",
  });

  // Gold filigree cloud studs along the collar
  b.along(collarCurve, 8, (pt) => {
    b.part(new THREE.OctahedronGeometry(0.011, 0), GOLD_DEEP, {
      at: pt,
      bone: neck.joints[0],
      flat: true,
      group: "accessories",
    });
  });

  // Ornate Adeptal Bell & Glowing Jade Core on `bellJoint` (hinge role)
  b.lathe(
    [
      [0, 0],
      [0.024, 0.003],
      [0.028, 0.016],
      [0.025, 0.032],
      [0.014, 0.044],
      [0, 0.048],
    ],
    {
      at: bellJoint.local([0, 0, 0]),
      axis: [0, 1, 0],
      segments: 10,
      smoothing: 1,
      color: GOLD,
      bone: bellJoint,
      group: "accessories",
      name: "adeptusBell",
    },
  );

  // Glowing Dendro-jade clapper sphere inside the bell mouth
  glow(
    b.part(new THREE.SphereGeometry(0.013, 8, 6), JADE_HEX, {
      at: bellJoint.local([0, 0.004, 0]),
      bone: bellJoint,
      group: "accessories",
      name: "bellJadeCore",
    }),
    1.8,
  );

  // Dorsal gold cloud-knot & glowing jade diamond brooch on the upper back of the collar
  const backBroochAt: [number, number, number] = [0, 0.588, 0.145];
  b.part(new THREE.OctahedronGeometry(0.024, 0), GOLD, {
    at: backBroochAt,
    scale: [1.2, 0.55, 1.35],
    flat: true,
    bone: neck.joints[0],
    group: "accessories",
    name: "dorsalBroochFrame",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.016, 0), JADE_HEX, {
      at: [0, 0.596, 0.145],
      scale: [1.0, 0.6, 1.2],
      flat: true,
      bone: neck.joints[0],
      group: "accessories",
      name: "dorsalVisionGem",
    }),
    1.7,
  );

  // Hanging Genshin silk tassels on left, right, and under the bell
  const tasselFrames = [
    frame([0.078, 0.502, 0.185], [0.25, 1, 0.15]),
    frame([-0.078, 0.502, 0.185], [-0.25, 1, 0.15]),
    frame([0, 0.432, 0.212], [0, 1, 0.2]),
  ];
  b.cards(tasselFrames, TASSEL_TEX, {
    size: [0.038, 0.088],
    lean: 175,
    flow: [0, 0, 1],
    cross: true,
    bone: bellJoint,
    group: "accessories",
    name: "collarTassels",
  });

  // ---------------------------------------------------------------------------
  // 5. Head, Cheek Tufts, Muzzle, Jaw, Anime Eyes, Brows & Ears
  // ---------------------------------------------------------------------------
  const headCenter = head.local({ forward: 0.022, up: 0.008 });

  // Broad, appealing apple-cheeked red panda cranium
  const cranium = b.part(new THREE.SphereGeometry(1, 16, 14), HEAD_PAINT, {
    bone: head,
    at: headCenter,
    scale: [0.104, 0.088, 0.094],
    group: "head",
    name: "cranium",
  });

  // Sculpted fluffy cheek ruffs sweeping out on both sides (signature red panda silhouette)
  const cheekOutline: OutlinePoint[] = [
    [0, -0.028],
    [0.042, -0.036, "sharp"],
    [0.032, -0.012],
    [0.056, 0.004, "sharp"],
    [0.036, 0.022],
    [0.048, 0.042, "sharp"],
    [0.012, 0.044],
    [-0.012, 0.015],
  ];

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.extrude(cheekOutline, {
      at: head.local([s * 0.068, 0.018, -0.012]),
      x: [s, 0, -0.22],
      y: [0, 1, 0.1],
      thickness: [0.036, 0.008],
      bevel: 0.006,
      smoothing: 1,
      color: CREAM,
      bone: head,
      group: "head",
      name: `cheekRuff${side}`,
    });
  }

  // Crown fur tuft atop the head
  for (const [ti, offsetX] of ([-0.016, 0, 0.016] as const).entries()) {
    b.spike(
      head.local([offsetX, 0.012, 0.078]),
      [offsetX * 2.2, 0.85, -0.45],
      0.038 - Math.abs(offsetX) * 0.4,
      0.014,
      {
        sides: 5,
        color: ti === 1 ? ORANGE : RUST,
        bone: head,
        group: "head",
        name: `crownTuft${ti + 1}`,
      },
    );
  }

  // Short tapered cream muzzle & cute button nose
  const snoutBase = head.local({ forward: 0.068, down: 0.014 });
  const snoutTip = head.local({ forward: 0.116, down: 0.02 });
  b.capsule(snoutBase, snoutTip, [0.046, 0.028], {
    sides: 10,
    color: SNOUT_PAINT,
    bone: head,
    group: "head",
    name: "muzzle",
  });

  // Glossy dark plum-black nose button
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE_PAINT, {
    bone: head,
    at: head.local({ forward: 0.126, down: 0.012 }),
    scale: [0.018, 0.013, 0.014],
    group: "head",
    name: "noseButton",
  });

  // Separate articulated lower jaw & cute pink tongue
  const jawTip = jaw.local([0, 0.058, 0.004]);
  b.capsule(jaw.at, jawTip, [0.032, 0.02], {
    sides: 8,
    color: CREAM,
    bone: jaw,
    group: "head",
    name: "lowerJaw",
  });

  b.part(new THREE.SphereGeometry(1, 8, 6), cel("#ff7b93", "#c43b5a"), {
    bone: jaw,
    at: jaw.local([0, 0.042, 0.014]),
    scale: [0.016, 0.006, 0.022],
    group: "head",
    name: "tongue",
  });

  // Tiny white upper fang tips for anime charm
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.spike(
      head.local([s * 0.018, 0.098, -0.028]),
      [0, -1, 0.15],
      0.011,
      0.004,
      {
        sides: 4,
        color: CLAW_IVORY,
        bone: head,
        group: "head",
        name: `fang${side}`,
      },
    );
  }

  // Plump teardrop cream eyebrow puffs (classic red panda facial marking)
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, {
      bone: head,
      at: head.local([s * 0.034, 0.082, 0.044]),
      rotation: [12, s * -18, s * 24],
      scale: [0.022, 0.015, 0.012],
      group: "head",
      name: `browPuff${side}`,
    });
  }

  // Big shiny Genshin anime eyes conformed onto the cranium via `b.decal`
  const headSurf = b.surface(cranium);
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const eyeHit = headSurf.around(headCenter).at(s * 34, 4);
    if (eyeHit) {
      b.decal(headSurf, EYE_TEX, {
        at: eyeHit,
        size: [0.056, 0.072],
        mirror: s > 0,
        bone: head,
        group: "head",
        name: `animeEye${side}`,
      });
    }
  }

  // Expressive whiskers sweeping from the muzzle
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    for (const [wi, wy] of ([0.004, -0.006] as const).entries()) {
      const wStart = head.local([s * 0.036, 0.092, -0.018 + wy]);
      const wMid = head.local([s * 0.078, 0.086, -0.014 + wy * 1.3]);
      const wEnd = head.local([s * 0.115, 0.068, -0.022 + wy * 2.0]);
      b.sweep(bezier(wStart, wMid, wEnd), [0.0024, 0.0006], {
        sides: 4,
        color: CREAM_HEX,
        bone: head,
        group: "head",
        name: `whisker${side}${wi + 1}`,
      });
    }
  }

  // Large fluffy triangular ears with rust backs, thick white-cream rims, and inner ear tufts
  const earOuterOutline: OutlinePoint[] = [
    [-0.038, 0],
    [-0.044, 0.042],
    [0, 0.096, "sharp"],
    [0.044, 0.042],
    [0.038, 0],
  ];
  const earInnerOutline: OutlinePoint[] = [
    [-0.024, 0.006],
    [-0.027, 0.038],
    [0, 0.074, "sharp"],
    [0.027, 0.038],
    [0.024, 0.006],
  ];

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const ej = earJoints[s];

    // Cream outer plush ear shell
    b.extrude(earOuterOutline, {
      at: ej.at,
      x: ej.dir([1, 0, 0]),
      y: ej.dir([0, 1, 0]),
      thickness: [0.024, 0.008],
      bevel: 0.005,
      smoothing: 1,
      color: furEdge(CREAM, RUST, {
        axis: [0, 0, 1],
        by: "normal",
        level: -0.05,
        teeth: 0.25,
        period: 0.02,
      }),
      bone: ej,
      group: `ear${side}`,
      name: `earShell${side}`,
    });

    // Dark chocolate-rose inner ear hollow
    b.extrude(earInnerOutline, {
      at: ej.local([0, 0.004, 0.008]),
      x: ej.dir([1, 0, 0]),
      y: ej.dir([0, 1, 0]),
      thickness: [0.012, 0.004],
      smoothing: 1,
      color: cel("#4a202a", INK),
      bone: ej,
      group: `ear${side}`,
      name: `earHollow${side}`,
    });

    // Fluffy white ear-canal fur spikes bursting out of the ear base
    for (const [fi, fAngle] of ([-18, 8] as const).entries()) {
      b.spike(
        ej.local([s * -0.006, 0.018 + fi * 0.014, 0.012]),
        ej.dir([s * -0.55, 0.55 + fAngle * 0.01, 0.62]),
        0.044,
        0.015,
        {
          sides: 5,
          color: CREAM,
          bone: ej,
          group: `ear${side}`,
          name: `earTuft${side}${fi + 1}`,
        },
      );
    }
  }

  // Slight playful head tilt & open mouth expression via `b.pose`
  b.pose(head, { axis: [0, 0, 1], deg: -5 });
  b.pose(jaw, { axis: [1, 0, 0], deg: 10 });

  // ---------------------------------------------------------------------------
  // 6. Plush Ringed Tail + Layered Stylized Fur Ruff Rings
  // ---------------------------------------------------------------------------
  const tailSweep = b.sweep(
    tail,
    (t) => {
      // Thick, extra-fluffy red panda tail profile
      const profile = Math.sin(Math.min(t * 1.15, 1) * Math.PI);
      const r = 0.048 + 0.042 * profile - 0.015 * t;
      return [r * 1.06, r * 0.96];
    },
    {
      sides: 12,
      caps: { start: "round", end: "round" },
      color: TAIL_PAINT,
      group: "tail",
      name: "tailPlume",
    },
  );

  // Sculpted zig-zag fur flare spikes ringed around the tail bands for dynamic anime silhouette
  for (const [ri, rt] of ([0.24, 0.48, 0.72] as const).entries()) {
    const centerPt = tail.at(rt);
    b.ring(
      line(centerPt.at, offset(centerPt.at, centerPt.tangent, -0.04)),
      {
        count: 6,
        radius: 0.056 - ri * 0.005,
        tilt: 24,
        parent: centerPt.bone,
        group: "tail",
      },
      (item) => {
        b.spike(item, item, 0.045, 0.018, {
          sides: 5,
          color: ri % 2 === 0 ? RUST : CREAM,
          bone: centerPt.bone,
          group: "tail",
          name: `tailFlare_${ri + 1}_${item.i + 1}`,
        });
      },
    );
  }

  // ---------------------------------------------------------------------------
  // 7. Four Chunky Stocky Legs, Paws, Toe Beans & Curved Ivory Claws
  // ---------------------------------------------------------------------------
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";

    // Front leg sweep
    const fChain = frontChains[s];
    b.sweep(
      fChain,
      (t) => {
        const r = 0.054 * (1 - 0.32 * t) + 0.008 * Math.sin(t * Math.PI);
        return [r, r * 1.05];
      },
      {
        sides: 10,
        caps: { start: "round", end: "round" },
        color: LEG_PAINT,
        group: `arm${side}`,
        name: `armTube${side}`,
      },
    );

    // Front paw cushion, articulated toes, claws & pink/plum toe beans
    const fTarget = frontTargets[s];
    const wrist = fChain.tip!;
    b.part(new THREE.SphereGeometry(1, 10, 8), CHOC, {
      bone: wrist,
      at: [fTarget[0], fTarget[1] - 0.002, fTarget[2] + 0.008],
      scale: [0.038, 0.022, 0.042],
      group: `arm${side}`,
      name: `frontPaw${side}`,
    });

    // Golden ankle cuff bangle (Genshin motif)
    b.part(new THREE.TorusGeometry(0.039, 0.0055, 6, 10), GOLD, {
      bone: wrist,
      at: [fTarget[0], fTarget[1] + 0.026, fTarget[2] - 0.002],
      dir: [0, 1, 0.15],
      axis: "z",
      group: `arm${side}`,
      name: `ankleCuffF${side}`,
    });

    for (const [ti, dj] of frontToeJoints[s].entries()) {
      const toeTip = dj.local([0, 0.022, 0]);
      b.capsule(dj.at, toeTip, [0.014, 0.011], {
        sides: 6,
        color: CHOC,
        bone: dj,
        group: `arm${side}`,
        name: `fingerDigital${side}${ti + 1}`,
      });
      b.spike(toeTip, dj.dir([0, 0.9, -0.35]), 0.016, 0.0055, {
        sides: 5,
        color: CLAW_IVORY,
        bone: dj,
        group: `arm${side}`,
        name: `frontClaw${side}${ti + 1}`,
      });
    }

    // Hind leg sweep
    const hChain = hindChains[s];
    b.sweep(
      hChain,
      (t) => {
        const r = 0.062 * (1 - 0.38 * t) + 0.01 * Math.sin(t * Math.PI);
        return [r * 0.98, r * 1.08];
      },
      {
        sides: 10,
        caps: { start: "round", end: "round" },
        color: LEG_PAINT,
        group: `leg${side}`,
        name: `legTube${side}`,
      },
    );

    // Hind paw cushion, articulated toes & ivory claws
    const hTarget = hindTargets[s];
    const ankle = hChain.tip!;
    b.part(new THREE.SphereGeometry(1, 10, 8), CHOC, {
      bone: ankle,
      at: [hTarget[0], hTarget[1] - 0.002, hTarget[2] + 0.01],
      scale: [0.04, 0.022, 0.046],
      group: `leg${side}`,
      name: `hindPaw${side}`,
    });

    for (const [ti, dj] of hindToeJoints[s].entries()) {
      const toeTip = dj.local([0, 0.024, 0]);
      b.capsule(dj.at, toeTip, [0.014, 0.011], {
        sides: 6,
        color: CHOC,
        bone: dj,
        group: `leg${side}`,
        name: `toeDigital${side}${ti + 1}`,
      });
      b.spike(toeTip, dj.dir([0, 0.9, -0.35]), 0.017, 0.0055, {
        sides: 5,
        color: CLAW_IVORY,
        bone: dj,
        group: `leg${side}`,
        name: `hindClaw${side}${ti + 1}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 8. Soft Layered Fur Cards Across Body & Tail
  // ---------------------------------------------------------------------------
  const bodyHits = b.surface(bodyLoft).scatter(42, {
    rng: rng(301),
    minDist: 0.038,
    filter: (h) => h.n.y > -0.15,
  });
  b.cards(bodyHits, FUR_CARD_RUST, {
    size: [0.028, 0.048],
    lean: 68,
    bend: 22,
    vary: 0.25,
    spin: 18,
    flow: [0, -0.2, -1],
    rng: rng(302),
    group: "fur",
    name: "bodyFurCards",
  });

  const tailHits = b.surface(tailSweep).scatter(48, {
    rng: rng(303),
    minDist: 0.042,
  });
  b.cards(tailHits, [FUR_CARD_RUST, FUR_CARD_CREAM], {
    size: [0.032, 0.056],
    lean: 62,
    bend: 24,
    vary: 0.28,
    spin: 22,
    flow: (f) => f.dir([0, 0, 1]),
    rng: rng(304),
    group: "fur",
    name: "tailFurCards",
  });

  // Prevent unused import errors by referencing noise/smoothstep in a helper check if needed
  void noise;
  void smoothstep;

  return b.root;
}
