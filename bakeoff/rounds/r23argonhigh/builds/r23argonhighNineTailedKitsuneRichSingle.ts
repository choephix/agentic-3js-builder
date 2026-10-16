import * as THREE from "three";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, furEdge, INK, inkLines, shadowOf, zigzag } from "../../../../kits/toon";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { aim, DEG, offset, rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { gradient, mix, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description:
    "Celestial nine-tailed kitsune fox with ornate gold shrine regalia, cel-shaded kabuki coat markings, and floating cyan-violet spirit flames.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "nineTailedKitsune", paintSize: 1024 });
  const rand = rng(909);

  // ---------------------------------------------------------------------------
  // High-fantasy anime cel-shaded palette & procedural paints
  // ---------------------------------------------------------------------------
  const CREAM_LIT = "#fff7eb";
  const CREAM_SHADE = "#d8c4e8"; // cool anime lavender-cream shadow
  const SCARLET_LIT = "#e63229";
  const SCARLET_SHADE = "#991528";
  const PLUM_LIT = "#2e1a42";
  const PLUM_SHADE = "#160a24";
  const GOLD_LIT = "#f7c548";
  const GOLD_SHADE = "#b8741a";
  const JADE_LIT = "#27dccb";
  const JADE_SHADE = "#15858a";
  const SAKURA_LIT = "#ff94b8";
  const SAKURA_SHADE = "#c95682";

  const CREAM = cel(CREAM_LIT, CREAM_SHADE);
  const SCARLET = cel(SCARLET_LIT, SCARLET_SHADE);
  const PLUM = cel(PLUM_LIT, PLUM_SHADE);
  const GOLD = cel(GOLD_LIT, GOLD_SHADE);
  const GOLD_ORNATE = inkLines(GOLD, { levels: [-0.45, 0.45], axis: [0, 1, 0], width: 0.07 });
  const JADE = cel(JADE_LIT, JADE_SHADE);
  const SAKURA = cel(SAKURA_LIT, SAKURA_SHADE);
  const ROPE_PAINT = cel(
    paint((p) => {
      const stripe = Math.sin((p.x * 18 + p.y * 22 + p.z * 18) * Math.PI);
      return stripe > 0.15 ? GOLD_LIT : SCARLET_LIT;
    }),
  );

  // Torso coat: cream fur with scarlet dorsal saddle-markings and inked zig-zag fur edges
  const TORSO_COAT = cel(
    paint((p, n) => {
      const wave = zigzag(p.z / 0.045) * 0.16;
      const dorsal = n.y - (0.42 + wave);
      if (Math.abs(dorsal) < 0.035) return INK;
      if (dorsal >= 0) {
        const spineCrest = Math.abs(p.x) - (0.048 + 0.022 * Math.sin(p.z * 14) + 0.015 * zigzag(p.z / 0.035));
        if (Math.abs(spineCrest) < 0.005) return INK;
        return spineCrest < 0 ? SCARLET_LIT : CREAM_LIT;
      }
      const bellyEdge = n.y - (-0.28 + zigzag(p.z / 0.04) * 0.14);
      if (Math.abs(bellyEdge) < 0.03) return INK;
      return CREAM_LIT;
    }),
  );

  // Head coat: cream cheeks/muzzle with scarlet crown blaze and inked zig-zag transition
  const HEAD_COAT = cel(
    paint((p, n) => {
      const crownWave = 0.805 + 0.018 * zigzag(p.x / 0.025) - 0.08 * Math.max(0, p.z - 0.43);
      const d = p.y - crownWave;
      if (Math.abs(d) < 0.0035 && n.y > 0) return INK;
      if (d > 0 && n.y > 0.15) return SCARLET_LIT;
      return CREAM_LIT;
    }),
  );

  // Leg coat: cream upper leg, scarlet flame transition, dark plum stockings on lower leg
  const LEG_COAT = cel(
    paint((p) => {
      const teeth = 0.038 * zigzag((p.x + p.z) / 0.028);
      const h = p.y - teeth;
      if (Math.abs(h - 0.19) < 0.004 || Math.abs(h - 0.245) < 0.004) return INK;
      if (h < 0.19) return PLUM_LIT;
      if (h < 0.245) return SCARLET_LIT;
      return CREAM_LIT;
    }),
  );

  // Ear coat: cream base, scarlet middle band, plum-black tip with zig-zag fur edges
  const EAR_COAT = cel(
    paint((p) => {
      const teeth = 0.018 * zigzag((p.x + p.z) / 0.022);
      const h = p.y - teeth;
      if (Math.abs(h - 0.945) < 0.0035 || Math.abs(h - 0.985) < 0.0035) return INK;
      if (h > 0.985) return PLUM_LIT;
      if (h > 0.945) return SCARLET_LIT;
      return CREAM_LIT;
    }),
  );

  // Tail coat: keyed to sweep surface coordinates s = [t, deg] so markings follow every bend and curl
  const TAIL_COAT = cel(
    paint((_p, _n, s) => {
      const [t, deg] = s;
      const zAngle = zigzag(deg / 45) * 0.045;
      const rootEdge = t - (0.13 + zAngle * 0.6);
      const bandStart = t - (0.66 + zAngle);
      const tipStart = t - (0.82 + zAngle);
      if (Math.abs(rootEdge) < 0.012 || Math.abs(bandStart) < 0.012 || Math.abs(tipStart) < 0.012) return INK;
      if (t < 0.13 + zAngle * 0.6) return SCARLET_LIT;
      if (t >= 0.82 + zAngle) return "#ffffff";
      if (t >= 0.66 + zAngle) return SCARLET_LIT;
      // Dorsal crimson flame stripe running up the back of each tail
      const dorsalDist = Math.min(deg, 360 - deg);
      const stripeEdge = dorsalDist - (32 + 12 * zigzag(t / 0.08));
      if (Math.abs(stripeEdge) < 3.5 && t < 0.66) return INK;
      if (stripeEdge < 0 && t < 0.66) return SCARLET_LIT;
      return CREAM_LIT;
    }),
  );

  const MANE_COAT = cel(
    furEdge(CREAM_LIT, "#ffe6f2", {
      by: "position",
      axis: [0, 1, 0],
      along: [1, 0, 0],
      level: 0.44,
      teeth: 0.035,
      period: 0.032,
      ink: INK,
    }),
  );

  // Flat self-lit colours for glow() parts (never pass Paint to glow!)
  const FLAME_CORE = "#eaffff";
  const FLAME_CYAN = "#24f0ff";
  const FLAME_AZURE = "#00a6ff";
  const FLAME_VIOLET = "#b95cff";
  const FLAME_GOLD = "#ffe680";

  // ---------------------------------------------------------------------------
  // SVG Textures (Eyes, Fur Locks, Sacred Shide Streamers, Spirit Flames)
  // ---------------------------------------------------------------------------
  const EYE_TEX = animeEye({
    iris: "#00d8ff",
    irisLight: "#b8ffff",
    irisDark: "#14387a",
    blush: "#ff6b96",
    brow: true,
    size: 512,
  });

  const CREAM_TUFT_TEX = svg(
    `<svg viewBox="0 0 64 128">
      <path d="M10 124 Q6 68 20 26 Q28 8 32 2 Q38 14 44 34 Q58 72 52 124 Z" fill="${CREAM_SHADE}"/>
      <path d="M14 124 Q12 70 23 28 Q29 10 32 4 Q36 16 41 36 Q52 74 48 124 Z" fill="${CREAM_LIT}"/>
      <path d="M22 42 Q28 20 32 5 Q36 20 40 44 Q35 32 32 24 Q28 32 22 42 Z" fill="${SCARLET_LIT}"/>
      <path d="M10 124 Q6 68 20 26 Q28 8 32 2 Q38 14 44 34 Q58 72 52 124" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
      <path d="M32 18 L32 96" stroke="${CREAM_SHADE}" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const SCARLET_TUFT_TEX = svg(
    `<svg viewBox="0 0 64 128">
      <path d="M8 124 Q4 66 20 24 Q28 6 32 2 Q38 12 46 32 Q60 70 54 124 Z" fill="${SCARLET_SHADE}"/>
      <path d="M13 124 Q10 68 23 26 Q29 9 32 4 Q36 14 42 34 Q54 72 49 124 Z" fill="${SCARLET_LIT}"/>
      <path d="M21 48 Q28 22 32 4 Q36 22 43 48 Q36 34 32 24 Q28 34 21 48 Z" fill="${GOLD_LIT}"/>
      <path d="M8 124 Q4 66 20 24 Q28 6 32 2 Q38 12 46 32 Q60 70 54 124" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const SHIDE_TEX = svg(
    `<svg viewBox="0 0 64 160">
      <polygon points="24,156 42,156 48,116 20,116 44,78 16,78 42,40 14,40 36,4 20,4 6,46 32,46 8,84 34,84 10,122 36,122"
        fill="#fffaf0" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
      <polyline points="28,144 36,122 20,104 34,84 18,66 32,46 22,20"
        fill="none" stroke="${GOLD_LIT}" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="28" cy="136" r="4.5" fill="${SCARLET_LIT}"/>
      <circle cx="26" cy="96" r="4.5" fill="${SCARLET_LIT}"/>
      <circle cx="25" cy="56" r="4.5" fill="${SCARLET_LIT}"/>
    </svg>`,
    { size: 256 },
  );

  const SPIRIT_FLAME_TEX = svg(
    `<svg viewBox="0 0 128 192">
      <path d="M64 184 C22 184 10 138 24 96 C34 66 20 42 38 18 C44 38 52 30 64 4 C76 30 84 38 90 18 C108 42 94 66 104 96 C118 138 106 184 64 184 Z"
        fill="${FLAME_VIOLET}"/>
      <path d="M64 176 C30 176 20 136 32 98 C40 72 34 50 48 28 C54 44 58 36 64 14 C70 36 74 44 80 28 C94 50 88 72 96 98 C108 136 98 176 64 176 Z"
        fill="${FLAME_AZURE}"/>
      <path d="M64 168 C38 168 32 134 42 102 C48 80 48 60 64 28 C80 60 80 80 86 102 C96 134 90 168 64 168 Z"
        fill="${FLAME_CYAN}"/>
      <ellipse cx="64" cy="134" rx="18" ry="26" fill="${FLAME_CORE}"/>
      <circle cx="64" cy="138" r="10" fill="#ffffff"/>
      <circle cx="26" cy="68" r="5" fill="${FLAME_GOLD}"/>
      <circle cx="102" cy="74" r="4.5" fill="${FLAME_GOLD}"/>
      <circle cx="64" cy="18" r="4" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // 1. SKELETON: Root, Spine, Pelvis, Neck, Head, Jaw, Ears, 4 Legs, 9 Tails
  // ---------------------------------------------------------------------------
  const bodyCurve = catmull([
    [0, 0.47, -0.32],
    [0, 0.48, -0.16],
    [0, 0.46, 0.0],
    [0, 0.475, 0.14],
    [0, 0.52, 0.31],
  ]);

  const core = b.joint("core", {
    at: [0, 0.46, 0.0],
    dir: [0, 0.08, 1],
    role: "spine",
    group: "torso",
  });

  const rootT = bodyCurve.closestT(core.at);
  const frontSpine = b.chain("spine", bodyCurve.slice(rootT, 1), {
    parent: core,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
    group: "torso",
  });
  const backPelvis = b.chain("pelvis", bodyCurve.slice(rootT, 0), {
    parent: core,
    names: ["pelvis", "rump"],
    role: "spine",
    group: "torso",
  });

  const chestJoint = frontSpine.joints[frontSpine.joints.length - 1];
  const rumpJoint = backPelvis.joints[backPelvis.joints.length - 1];

  const neckPath = catmull([
    [0, 0.52, 0.31],
    [0, 0.61, 0.36],
    [0, 0.70, 0.39],
    [0, 0.78, 0.41],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: chestJoint,
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
    group: "neck",
  });

  const head = b.joint("head", {
    parent: neck,
    at: neck.at(1),
    dir: [0, -0.06, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.74, 0.455],
    dir: [0, -0.22, 1],
    role: "jaw",
    group: "head",
  });

  const earJoints = {
    L: b.joint("earL", {
      parent: head,
      at: [0.064, 0.855, 0.405],
      dir: [0.44, 0.86, -0.18],
      role: "hinge",
      group: "head",
    }),
    R: b.joint("earR", {
      parent: head,
      at: [-0.064, 0.855, 0.405],
      dir: [-0.44, 0.86, -0.18],
      role: "hinge",
      group: "head",
    }),
  };

  // Collar tassel joints
  const bellJoint = b.joint("chestBell", {
    parent: chestJoint,
    at: [0, 0.43, 0.43],
    dir: [0, -1, 0.15],
    role: "hinge",
    group: "regalia",
  });

  // Four legs solved with IK to plant paws squarely on y = 0
  const legChains = {
    FL: null as ReturnType<typeof b.chain> | null,
    FR: null as ReturnType<typeof b.chain> | null,
    HL: null as ReturnType<typeof b.chain> | null,
    HR: null as ReturnType<typeof b.chain> | null,
  };
  const toeJoints: Record<string, ReturnType<typeof b.joint>[]> = {
    FL: [],
    FR: [],
    HL: [],
    HR: [],
  };

  for (const side of ["L", "R"] as const) {
    const s = side === "L" ? 1 : -1;

    // Front leg (digitigrade: elbow back, wrist forward)
    const fRoot: [number, number, number] = [s * 0.12, 0.46, 0.27];
    const fFoot: [number, number, number] = [s * 0.132, 0.032, 0.285];
    const fPts = limb(fRoot, fFoot, [0.185, 0.17, 0.115], [
      [0, 0, -1],
      [0, 0, 1],
    ]);
    const legF = b.chain(`legF${side}`, fPts, {
      parent: chestJoint,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `pawF${side}`],
      role: "leg",
      contact: [s * 0.132, 0, 0.295],
      group: `legF${side}`,
    });
    legChains[`F${side}`] = legF;

    for (let ti = 0; ti < 3; ti++) {
      const spread = (ti - 1) * 0.022;
      const tj = b.joint(`toeF${side}${ti + 1}`, {
        parent: legF.tip!,
        at: [s * 0.132 + spread, 0.02, 0.305],
        dir: [spread * 1.4, -0.05, 1],
        role: "digit",
        group: `legF${side}`,
      });
      toeJoints[`F${side}`].push(tj);
    }

    // Hind leg (digitigrade: knee/stifle forward, hock back)
    const hRoot: [number, number, number] = [s * 0.128, 0.455, -0.245];
    const hFoot: [number, number, number] = [s * 0.142, 0.032, -0.275];
    const hPts = limb(hRoot, hFoot, [0.195, 0.185, 0.125], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const legH = b.chain(`legH${side}`, hPts, {
      parent: rumpJoint,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `pawH${side}`],
      role: "leg",
      contact: [s * 0.142, 0, -0.265],
      group: `legH${side}`,
    });
    legChains[`H${side}`] = legH;

    for (let ti = 0; ti < 3; ti++) {
      const spread = (ti - 1) * 0.022;
      const tj = b.joint(`toeH${side}${ti + 1}`, {
        parent: legH.tip!,
        at: [s * 0.142 + spread, 0.02, -0.255],
        dir: [spread * 1.4, -0.05, 1],
        role: "digit",
        group: `legH${side}`,
      });
      toeJoints[`H${side}`].push(tj);
    }
  }

  // Nine articulated tails (tail1 center, tail2..9 alternating L and R in a royal 2-tier fan)
  type TailSpec = {
    index: number;
    pts: [number, number, number][];
    flameColor: string;
  };

  const tailSpecs: TailSpec[] = [
    // Tail 1: Sovereign central tail rising highest along x = 0
    {
      index: 1,
      pts: [
        [0, 0.485, -0.33],
        [0, 0.64, -0.62],
        [0, 0.98, -0.84],
        [0, 1.32, -0.74],
      ],
      flameColor: FLAME_CYAN,
    },
  ];

  // 4 symmetrical pairs of flanking tails (indices 2..9)
  const fanConfigs = [
    // Inner-upper pair (tail2 L, tail3 R)
    {
      x0: 0.026,
      y0: 0.482,
      z0: -0.335,
      x1: 0.15,
      y1: 0.62,
      z1: -0.63,
      x2: 0.31,
      y2: 0.94,
      z2: -0.84,
      x3: 0.26,
      y3: 1.26,
      z3: -0.73,
      color: FLAME_VIOLET,
    },
    // Mid-upper pair (tail4 L, tail5 R)
    {
      x0: 0.044,
      y0: 0.475,
      z0: -0.34,
      x1: 0.27,
      y1: 0.56,
      z1: -0.62,
      x2: 0.52,
      y2: 0.83,
      z2: -0.81,
      x3: 0.50,
      y3: 1.13,
      z3: -0.69,
      color: FLAME_CYAN,
    },
    // Mid-outer pair (tail6 L, tail7 R)
    {
      x0: 0.060,
      y0: 0.466,
      z0: -0.335,
      x1: 0.36,
      y1: 0.47,
      z1: -0.58,
      x2: 0.66,
      y2: 0.67,
      z2: -0.74,
      x3: 0.68,
      y3: 0.94,
      z3: -0.62,
      color: FLAME_VIOLET,
    },
    // Lower-outer pair (tail8 L, tail9 R)
    {
      x0: 0.074,
      y0: 0.455,
      z0: -0.325,
      x1: 0.40,
      y1: 0.37,
      z1: -0.52,
      x2: 0.72,
      y2: 0.48,
      z2: -0.65,
      x3: 0.78,
      y3: 0.70,
      z3: -0.52,
      color: FLAME_CYAN,
    },
  ];

  fanConfigs.forEach((cfg, pairIdx) => {
    for (const [offsetIdx, s] of [
      [0, 1],
      [1, -1],
    ] as const) {
      const tailNum = 2 + pairIdx * 2 + offsetIdx;
      tailSpecs.push({
        index: tailNum,
        pts: [
          [s * cfg.x0, cfg.y0, cfg.z0],
          [s * cfg.x1, cfg.y1, cfg.z1],
          [s * cfg.x2, cfg.y2, cfg.z2],
          [s * cfg.x3, cfg.y3, cfg.z3],
        ],
        flameColor: cfg.color,
      });
    }
  });

  const tailChains = tailSpecs.map((spec) => {
    const k = spec.index;
    const path = catmull(spec.pts);
    return {
      spec,
      path,
      chain: b.chain(`tail${k}`, path, {
        parent: rumpJoint,
        names: [`tail${k}_1`, `tail${k}_2`, `tail${k}_3`, `tail${k}_4`],
        role: "tail",
        group: `tail${k}`,
      }),
    };
  });

  // ---------------------------------------------------------------------------
  // 2. TORSO, NECK & CHEST MANE VOLUMES
  // ---------------------------------------------------------------------------
  // Smooth-skinned fox torso lofted from rump to chest over [backPelvis, core, frontSpine]
  const bodyLoft = b.loft(
    [
      { at: [0, 0.47, -0.32], w: 0.17, h: 0.18 },
      { at: [0, 0.48, -0.17], w: 0.21, h: 0.22 },
      { at: [0, 0.46, 0.0], w: 0.19, h: 0.23 },
      { at: [0, 0.48, 0.15], w: 0.24, h: 0.26 },
      { at: [0, 0.52, 0.31], w: 0.23, h: 0.25 },
    ],
    {
      bone: [backPelvis, core, frontSpine],
      color: TORSO_COAT,
      shift: (t) => [0, -0.015 * Math.sin(t * Math.PI)],
      name: "torsoBody",
      group: "torso",
    },
  );

  // Sleek arched fox neck
  const neckSweep = b.sweep(
    neck,
    (t) => [0.105 * (1 - 0.28 * t), 0.115 * (1 - 0.26 * t)],
    {
      color: TORSO_COAT,
      name: "neckTube",
      group: "neck",
    },
  );

  // Voluminous anime chest ruff / celestial fur mane
  const chestManeCenter = b.sweep(
    bezier([0, 0.62, 0.41], [0, 0.49, 0.50], [0, 0.34, 0.45], [0, 0.24, 0.36]),
    [0.095, 0.115, 0.075, 0.008],
    {
      bone: chestJoint,
      color: MANE_COAT,
      caps: { start: "round", end: "point" },
      sides: 7,
      name: "chestManeCenter",
      group: "torso",
    },
  );

  for (const s of [1, -1] as const) {
    const sideTag = s > 0 ? "L" : "R";
    // Upper and lower sculpted mane locks flanking the sternum
    b.sweep(
      bezier(
        [s * 0.055, 0.60, 0.39],
        [s * 0.13, 0.50, 0.46],
        [s * 0.15, 0.39, 0.42],
        [s * 0.11, 0.29, 0.35],
      ),
      [0.07, 0.085, 0.055, 0.006],
      {
        bone: chestJoint,
        color: MANE_COAT,
        caps: { start: "round", end: "point" },
        sides: 6,
        name: `chestManeSide${sideTag}`,
        group: "torso",
      },
    );

    b.sweep(
      bezier(
        [s * 0.08, 0.64, 0.35],
        [s * 0.16, 0.58, 0.34],
        [s * 0.19, 0.50, 0.26],
      ),
      [0.055, 0.065, 0.006],
      {
        bone: chestJoint,
        color: CREAM,
        caps: { start: "round", end: "point" },
        sides: 6,
        name: `shoulderMane${sideTag}`,
        group: "torso",
      },
    );
  }

  // Fur lock cards scattered on the chest mane and neck for lush anime silhouette
  const maneHits = b
    .surface([chestManeCenter, neckSweep])
    .scatter(28, { rng: rand, minDist: 0.04, filter: (h) => h.n.y > -0.35 });
  b.cards(maneHits, CREAM_TUFT_TEX, {
    size: [0.055, 0.11],
    lean: 52,
    bend: 25,
    vary: 0.22,
    rng: rand,
    name: "maneFurCards",
    group: "torso",
  });

  // ---------------------------------------------------------------------------
  // 3. HEAD, MUZZLE, JAW, ANIME EYES, KABUKI MARKINGS, EARS & CROWN
  // ---------------------------------------------------------------------------
  const headCenter: [number, number, number] = [0, 0.79, 0.435];

  // Cranium dome
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), HEAD_COAT, {
    bone: head,
    at: headCenter,
    scale: [0.092, 0.082, 0.096],
    name: "skull",
    group: "head",
  });

  // Tapered fox upper muzzle
  b.sweep(
    bezier([0, 0.785, 0.47], [0, 0.775, 0.54], [0, 0.768, 0.605]),
    (t) => [0.062 * (1 - 0.56 * t), 0.048 * (1 - 0.52 * t)],
    {
      bone: head,
      color: furEdge(SCARLET, CREAM, {
        by: "normal",
        axis: [0, 1, 0],
        level: 0.35,
        teeth: 0.22,
        period: 0.025,
        ink: INK,
      }),
      caps: { start: "round", end: "round" },
      sides: 8,
      name: "upperMuzzle",
      group: "head",
    },
  );

  // Fox nose button at tip of snout
  b.part(new THREE.OctahedronGeometry(0.018, 0), PLUM, {
    bone: head,
    at: [0, 0.776, 0.622],
    scale: [1.15, 0.85, 1.0],
    flat: true,
    name: "noseTip",
    group: "head",
  });

  // Upper canine fangs
  for (const s of [1, -1] as const) {
    const sideTag = s > 0 ? "L" : "R";
    b.spike([s * 0.022, 0.756, 0.575], [0, -1, 0.12], 0.026, 0.008, {
      bone: head,
      color: CREAM,
      sides: 4,
      name: `upperFang${sideTag}`,
      group: "head",
    });
  }

  // Articulated lower jaw, tongue, and lower fangs
  b.sweep(
    bezier([0, 0.742, 0.455], [0, 0.734, 0.525], [0, 0.736, 0.585]),
    (t) => [0.046 * (1 - 0.58 * t), 0.026 * (1 - 0.52 * t)],
    {
      bone: jaw,
      color: inkLines(CREAM, { levels: [0.35], axis: [0, 1, 0], width: 0.08 }),
      caps: { start: "round", end: "round" },
      sides: 6,
      name: "lowerJaw",
      group: "head",
    },
  );

  b.sweep(
    bezier([0, 0.746, 0.485], [0, 0.744, 0.535], [0, 0.745, 0.572]),
    (t) => [0.026 * (1 - 0.4 * t), 0.011 * (1 - 0.35 * t)],
    {
      bone: jaw,
      color: SAKURA,
      caps: { start: "flat", end: "round" },
      sides: 6,
      name: "tongue",
      group: "head",
    },
  );

  // Pose jaw slightly open in a spirited expression
  b.pose(jaw, { axis: [1, 0, 0], deg: 8 });

  // Anime eyes (decal on skull) + 3D cel-shaded cheek ruffs & kabuki eye markings
  const skullSurface = b.surface(skull);
  for (const s of [1, -1] as const) {
    const sideTag = s > 0 ? "L" : "R";
    const eyeHit = skullSurface.around(headCenter).at(s * 36, 4);
    if (eyeHit) {
      b.decal(skullSurface, EYE_TEX, {
        at: eyeHit,
        size: [0.056, 0.072],
        mirror: s > 0,
        bone: head,
        name: `animeEye${sideTag}`,
        group: "head",
      });
    }

    // 3D sculpted anime upper eyelash wing & crimson kabuki eye-blaze
    b.sweep(
      bezier(
        [s * 0.036, 0.808, 0.508],
        [s * 0.068, 0.818, 0.482],
        [s * 0.095, 0.835, 0.442],
      ),
      [0.008, 0.013, 0.002],
      {
        bone: head,
        color: SCARLET,
        caps: { start: "point", end: "point" },
        sides: 4,
        name: `kabukiEyeWing${sideTag}`,
        group: "head",
      },
    );

    // Cheek stripe marking
    b.sweep(
      bezier(
        [s * 0.048, 0.772, 0.515],
        [s * 0.082, 0.766, 0.475],
        [s * 0.115, 0.775, 0.425],
      ),
      [0.007, 0.012, 0.002],
      {
        bone: head,
        color: SCARLET,
        caps: { start: "point", end: "point" },
        sides: 4,
        name: `kabukiCheekStripe${sideTag}`,
        group: "head",
      },
    );

    // 3-tier sculpted anime fox cheek ruffs flaring out sideways and back
    for (let ri = 0; ri < 3; ri++) {
      const yOff = 0.785 - ri * 0.024;
      const xReach = 0.155 - ri * 0.012;
      const zEnd = 0.365 - ri * 0.015;
      b.sweep(
        bezier(
          [s * 0.065, yOff, 0.445],
          [s * (xReach * 0.78), yOff - 0.008, 0.41],
          [s * xReach, yOff + 0.006, zEnd],
        ),
        [0.028 - ri * 0.004, 0.022 - ri * 0.003, 0.003],
        {
          bone: head,
          color: ri === 0 ? furEdge(SCARLET, CREAM, { level: 0.1, teeth: 0.25, period: 0.025, ink: INK }) : CREAM,
          caps: { start: "round", end: "point" },
          sides: 5,
          name: `cheekRuff${sideTag}${ri + 1}`,
          group: "head",
        },
      );
    }
  }

  // Celestial Forehead Crown / Shrine Tiara (Hitai-ate) & Glowing Third-Eye Spirit Gem
  b.extrude(
    [
      [0, -0.024, "sharp"],
      [0.046, 0.016, "sharp"],
      [0.026, 0.048],
      [0, 0.022, "sharp"],
      [-0.026, 0.048],
      [-0.046, 0.016, "sharp"],
    ],
    {
      at: [0, 0.836, 0.506],
      x: [1, 0, 0],
      y: [0, 0.88, -0.46],
      thickness: [0.014, 0.006],
      bevel: 0.003,
      smoothing: 1,
      bone: head,
      color: GOLD_ORNATE,
      name: "crownTiara",
      group: "head",
    },
  );

  // Glowing forehead spirit crystal
  glow(
    b.part(new THREE.OctahedronGeometry(0.019, 0), FLAME_CYAN, {
      bone: head,
      at: [0, 0.842, 0.516],
      scale: [0.75, 1.35, 0.65],
      flat: true,
      name: "foreheadSpiritGem",
      group: "head",
    }),
    1.6,
  );

  // Twin sweeping golden celestial crown horns
  for (const s of [1, -1] as const) {
    const sideTag = s > 0 ? "L" : "R";
    b.sweep(
      bezier(
        [s * 0.022, 0.852, 0.492],
        [s * 0.048, 0.915, 0.445],
        [s * 0.062, 0.985, 0.375],
      ),
      [0.015, 0.011, 0.002],
      {
        bone: head,
        color: GOLD_ORNATE,
        caps: { start: "flat", end: "point" },
        sides: 5,
        name: `crownHorn${sideTag}`,
        group: "head",
      },
    );
  }

  // Long sculpted kitsune ears with inner fluff cards & hanging shrine ear tassels
  for (const side of ["L", "R"] as const) {
    const s = side === "L" ? 1 : -1;
    const earJoint = earJoints[side];
    const earBase: [number, number, number] = [s * 0.064, 0.855, 0.405];
    const earMid: [number, number, number] = [s * 0.118, 0.945, 0.382];
    const earTip: [number, number, number] = [s * 0.165, 1.045, 0.348];

    // Outer ear shell
    b.sweep(
      bezier(earBase, earMid, earTip),
      (t) => [0.042 * (1 - 0.82 * t), 0.024 * (1 - 0.78 * t)],
      {
        bone: earJoint,
        color: EAR_COAT,
        caps: { start: "round", end: "point" },
        sides: 6,
        name: `earOuter${side}`,
        group: "head",
      },
    );

    // Inner pink ear hollow
    b.sweep(
      bezier(
        [s * 0.068, 0.86, 0.418],
        [s * 0.114, 0.94, 0.396],
        [s * 0.152, 1.015, 0.365],
      ),
      (t) => [0.024 * (1 - 0.85 * t), 0.01 * (1 - 0.8 * t)],
      {
        bone: earJoint,
        color: SAKURA,
        caps: { start: "round", end: "point" },
        sides: 5,
        name: `earInner${side}`,
        group: "head",
      },
    );

    // Inner ear fluff card
    b.cards(
      [frame([s * 0.082, 0.878, 0.418], [s * 0.35, 0.65, 0.65])],
      CREAM_TUFT_TEX,
      {
        size: [0.042, 0.078],
        lean: 22,
        flow: [s * 0.5, 0.8, -0.2],
        bone: earJoint,
        mirror: s < 0,
        name: `earFluffCard${side}`,
        group: "head",
      },
    );

    // Golden ear cuff ring + hanging jade spirit-bead tassel
    const cuffPos: [number, number, number] = [s * 0.108, 0.892, 0.382];
    b.part(new THREE.TorusGeometry(0.02, 0.006, 5, 8), GOLD_ORNATE, {
      bone: earJoint,
      at: cuffPos,
      dir: [s * 0.45, 0.85, -0.2],
      name: `earCuff${side}`,
      group: "head",
    });

    b.rod(cuffPos, [s * 0.118, 0.815, 0.378], [0.006, 0.005], SCARLET, {
      bone: earJoint,
      sides: 4,
      name: `earTasselCord${side}`,
      group: "head",
    });

    glow(
      b.part(new THREE.OctahedronGeometry(0.018, 0), FLAME_CYAN, {
        bone: earJoint,
        at: [s * 0.118, 0.802, 0.378],
        scale: [0.85, 1.35, 0.85],
        flat: true,
        name: `earSpiritDrop${side}`,
        group: "head",
      }),
      1.3,
    );
  }

  // ---------------------------------------------------------------------------
  // 4. ORNATE SHRINE REGALIA: Shimenawa Rope, Cloud Collar, Bell, Magatama, Halo
  // ---------------------------------------------------------------------------
  // Ceremonial crimson & gold cloud collar mantle draped over the shoulders
  const collarLoop = catmull(
    [
      [0, 0.56, 0.425],
      [0.145, 0.555, 0.33],
      [0.155, 0.565, 0.18],
      [0, 0.59, 0.12],
      [-0.155, 0.565, 0.18],
      [-0.145, 0.555, 0.33],
    ],
    { closed: true },
  );

  b.sweep(collarLoop, [0.032, 0.018], {
    bone: chestJoint,
    color: SCARLET,
    sides: 7,
    name: "shrineCollarMantle",
    group: "regalia",
  });

  // Heavy braided Shimenawa sacred rope around neck/chest
  const ropeLoop = catmull(
    [
      [0, 0.535, 0.44],
      [0.158, 0.54, 0.335],
      [0.165, 0.555, 0.195],
      [0, 0.58, 0.14],
      [-0.165, 0.555, 0.195],
      [-0.158, 0.54, 0.335],
    ],
    { closed: true },
  );

  b.sweep(ropeLoop, (t) => 0.022 + 0.005 * Math.sin(t * Math.PI * 12), {
    bone: chestJoint,
    color: ROPE_PAINT,
    sides: 6,
    name: "shimenawaRope",
    group: "regalia",
  });

  // Golden Kagura Suzu (Shrine Bell) on chest front
  b.lathe(
    [
      [0, 0],
      [0.034, 0.008],
      [0.044, 0.036],
      [0.038, 0.066],
      [0.016, 0.082],
      [0, 0.085],
    ],
    {
      at: [0, 0.415, 0.435],
      axis: [0, 1, 0],
      segments: 10,
      smoothing: 1,
      bone: bellJoint,
      color: GOLD_ORNATE,
      name: "kaguraBell",
      group: "regalia",
    },
  );

  // Bell waist rim & glowing core slit
  b.part(new THREE.TorusGeometry(0.043, 0.007, 5, 10), GOLD, {
    bone: bellJoint,
    at: [0, 0.452, 0.435],
    dir: [0, 1, 0],
    name: "kaguraBellRim",
    group: "regalia",
  });

  glow(
    b.part(new THREE.OctahedronGeometry(0.018, 0), FLAME_GOLD, {
      bone: bellJoint,
      at: [0, 0.412, 0.435],
      flat: true,
      name: "kaguraBellCore",
      group: "regalia",
    }),
    1.4,
  );

  // Twin curved Magatama soul jewels & Shide paper streamers flanking the chest bell
  for (const s of [1, -1] as const) {
    const sideTag = s > 0 ? "L" : "R";
    // Curved comma-shaped glowing Magatama jewel
    const magatama = b.sweep(
      bezier(
        [s * 0.085, 0.495, 0.415],
        [s * 0.115, 0.465, 0.435],
        [s * 0.095, 0.432, 0.425],
        [s * 0.068, 0.442, 0.408],
      ),
      [0.022, 0.019, 0.011, 0.002],
      {
        bone: chestJoint,
        color: JADE_LIT,
        caps: { start: "round", end: "point" },
        sides: 6,
        name: `chestMagatama${sideTag}`,
        group: "regalia",
      },
    );
    glow(magatama, 1.25);

    // Hanging Shide sacred zigzag paper streamer cards
    b.cards(
      [
        frame([s * 0.062, 0.515, 0.425], [0, 1, 0]),
        frame([s * 0.145, 0.525, 0.305], [0, 1, 0]),
      ],
      SHIDE_TEX,
      {
        size: [0.048, 0.125],
        lean: 172,
        flow: [s * 0.45, 0, 0.88],
        bone: chestJoint,
        mirror: s < 0,
        name: `shideStreamers${sideTag}`,
        group: "regalia",
      },
    );

    // Ornate golden shoulder cloud-scroll filigrees
    b.sweep(
      bezier(
        [s * 0.115, 0.535, 0.28],
        [s * 0.165, 0.515, 0.21],
        [s * 0.155, 0.485, 0.11],
        [s * 0.115, 0.51, 0.07],
      ),
      [0.016, 0.022, 0.014, 0.003],
      {
        bone: chestJoint,
        color: GOLD_ORNATE,
        caps: { start: "round", end: "point" },
        sides: 5,
        name: `shoulderCloudScroll${sideTag}`,
        group: "regalia",
      },
    );
  }

  // Celestial Shrine Halo Ring (Kōhai) hovering above the shoulders, anchored by twin golden dorsal struts
  const haloCenter: [number, number, number] = [0, 0.82, 0.14];
  const haloRadius = 0.235;

  for (const s of [1, -1] as const) {
    const sideTag = s > 0 ? "L" : "R";
    b.sweep(
      bezier(
        [s * 0.065, 0.575, 0.16],
        [s * 0.145, 0.65, 0.15],
        [s * 0.195, 0.72, 0.14],
      ),
      [0.016, 0.012, 0.009],
      {
        bone: chestJoint,
        color: GOLD_ORNATE,
        caps: "round",
        sides: 5,
        name: `haloSupportStrut${sideTag}`,
        group: "regalia",
      },
    );
  }

  // Main golden halo torus ring
  const haloPoints: [number, number, number][] = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return [
      haloCenter[0] + Math.cos(a) * haloRadius,
      haloCenter[1] + Math.sin(a) * haloRadius,
      haloCenter[2] - 0.02 * Math.sin(a),
    ];
  });
  b.sweep(catmull(haloPoints, { closed: true }), [0.014, 0.01], {
    bone: chestJoint,
    color: GOLD_ORNATE,
    sides: 6,
    name: "celestialHaloRing",
    group: "regalia",
  });

  // Glowing inner cyan energy ring inside the golden halo
  const innerHaloPoints: [number, number, number][] = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2;
    return [
      haloCenter[0] + Math.cos(a) * (haloRadius - 0.024),
      haloCenter[1] + Math.sin(a) * (haloRadius - 0.024),
      haloCenter[2] - 0.02 * Math.sin(a),
    ];
  });
  glow(
    b.sweep(catmull(innerHaloPoints, { closed: true }), 0.006, {
      bone: chestJoint,
      color: FLAME_CYAN,
      sides: 4,
      name: "celestialHaloInnerGlow",
      group: "regalia",
    }),
    1.5,
  );

  // Radial flame-lotus spikes around the upper arc of the halo
  for (let i = 0; i < 7; i++) {
    const deg = -60 + i * 20;
    const rad = (90 + deg) * DEG;
    const rimPt: [number, number, number] = [
      haloCenter[0] + Math.cos(rad) * haloRadius,
      haloCenter[1] + Math.sin(rad) * haloRadius,
      haloCenter[2] - 0.02 * Math.sin(rad),
    ];
    const dirVec: [number, number, number] = [Math.cos(rad), Math.sin(rad), -0.08];
    const spikeLen = i % 2 === 0 ? 0.072 : 0.048;
    b.spike(rimPt, dirVec, spikeLen, 0.014, {
      bone: chestJoint,
      color: i % 2 === 0 ? GOLD_ORNATE : SCARLET,
      sides: 4,
      name: `haloSunRay${i + 1}`,
      group: "regalia",
    });
  }

  // Sacred Hip Saddle-Crest / Lotus Apron over the pelvis where the 9 tails blossom
  b.extrude(
    [
      [0, 0.085, "sharp"],
      [0.135, 0.045],
      [0.165, -0.035, "sharp"],
      [0.095, -0.095],
      [0, -0.125, "sharp"],
      [-0.095, -0.095],
      [-0.165, -0.035, "sharp"],
      [-0.135, 0.045],
    ],
    {
      at: [0, 0.565, -0.255],
      x: [1, 0, 0],
      y: [0, 0.25, -0.96],
      thickness: [0.022, 0.012],
      bevel: 0.005,
      smoothing: 1,
      bone: rumpJoint,
      color: inkLines(SCARLET, { levels: [-0.35, 0.35], axis: [0, 1, 0], width: 0.08, ink: GOLD_LIT }),
      name: "hipLotusCrest",
      group: "regalia",
    },
  );

  // Golden lotus Bosses on the hip crest
  b.part(new THREE.OctahedronGeometry(0.032, 0), GOLD_ORNATE, {
    bone: rumpJoint,
    at: [0, 0.578, -0.255],
    scale: [1.3, 0.55, 1.3],
    flat: true,
    name: "hipCrestMedallion",
    group: "regalia",
  });

  // ---------------------------------------------------------------------------
  // 5. FOUR LEGS, PAWS, GOLDEN ANKLETS & GLOWING CLAWS
  // ---------------------------------------------------------------------------
  for (const key of ["FL", "FR", "HL", "HR"] as const) {
    const isFront = key.startsWith("F");
    const side = key.endsWith("L") ? "L" : "R";
    const s = side === "L" ? 1 : -1;
    const chain = legChains[key]!;
    const pawJoint = chain.tip!;
    const wristJoint = chain.joints[2];

    // Leg muscular sweep
    b.sweep(
      chain,
      (t) => {
        const rBase = isFront ? 0.068 : 0.082;
        const rMid = isFront ? 0.044 : 0.052;
        const rWrist = 0.032;
        const r = t < 0.5 ? rBase + (rMid - rBase) * (t * 2) : rMid + (rWrist - rMid) * ((t - 0.5) * 2);
        return [r * 0.92, r * 1.08];
      },
      {
        color: LEG_COAT,
        caps: "round",
        sides: 7,
        name: `legTube_${key}`,
        group: `leg${key}`,
      },
    );

    // Feathered anime leg-fur tuft sweeping back from the elbow/hock
    const jointMid = chain.joints[1].at;
    b.sweep(
      bezier(
        [jointMid.x, jointMid.y + 0.03, jointMid.z - 0.01],
        [jointMid.x + s * 0.015, jointMid.y + 0.01, jointMid.z - 0.075],
        [jointMid.x + s * 0.02, jointMid.y - 0.035, jointMid.z - 0.125],
      ),
      [0.026, 0.02, 0.003],
      {
        bone: chain.joints[1],
        color: SCARLET,
        caps: { start: "round", end: "point" },
        sides: 5,
        name: `legFeather_${key}`,
        group: `leg${key}`,
      },
    );

    // Ornate golden shrine anklet cuff above each paw
    const ankletAt = chain.at(0.78).at;
    b.part(new THREE.TorusGeometry(0.038, 0.009, 5, 8), GOLD_ORNATE, {
      bone: wristJoint,
      at: [ankletAt.x, ankletAt.y, ankletAt.z],
      dir: [0, 1, 0],
      name: `goldAnklet_${key}`,
      group: `leg${key}`,
    });

    // Glowing cyan spirit-flame wisp rising from each golden anklet
    glow(
      b.sweep(
        bezier(
          [ankletAt.x + s * 0.035, ankletAt.y, ankletAt.z],
          [ankletAt.x + s * 0.058, ankletAt.y + 0.045, ankletAt.z - 0.035],
          [ankletAt.x + s * 0.048, ankletAt.y + 0.105, ankletAt.z - 0.075],
        ),
        [0.012, 0.009, 0.002],
        {
          bone: wristJoint,
          color: FLAME_CYAN,
          caps: { start: "round", end: "point" },
          sides: 4,
          name: `ankletFlameWisp_${key}`,
          group: `leg${key}`,
        },
      ),
      1.35,
    );

    // Paw base cushion resting right on y = 0 (at y = 0.022, half-height 0.022 -> bottom at y = 0.000)
    const pawX = s * (isFront ? 0.132 : 0.142);
    const pawZ = isFront ? 0.292 : -0.268;
    b.part(new THREE.CylinderGeometry(0.038, 0.044, 0.044, 7, 1), PLUM, {
      bone: pawJoint,
      at: [pawX, 0.022, pawZ],
      scale: [1.0, 1.0, 1.18],
      flat: true,
      name: `pawPadBase_${key}`,
      group: `leg${key}`,
    });

    // Articulated 3 digit toes per paw + glowing golden-cyan claws
    toeJoints[key].forEach((tj, ti) => {
      const spread = (ti - 1) * 0.022;
      const midToeBoost = ti === 1 ? 0.008 : 0;
      const toeStart: [number, number, number] = [pawX + spread, 0.019, pawZ + 0.015];
      const toeEnd: [number, number, number] = [
        pawX + spread * 1.25,
        0.016,
        pawZ + 0.054 + midToeBoost,
      ];

      b.capsule(toeStart, toeEnd, [0.019, 0.015], CREAM, {
        bone: tj,
        sides: 5,
        name: `toeDigit_${key}_${ti + 1}`,
        group: `leg${key}`,
      });

      // Glowing celestial claw tip
      glow(
        b.spike(
          toeEnd,
          [spread * 0.4, -0.18, 1],
          0.024,
          0.008,
          {
            bone: tj,
            color: FLAME_GOLD,
            sides: 4,
            name: `claw_${key}_${ti + 1}`,
            group: `leg${key}`,
          },
        ),
        1.2,
      );
    });
  }

  // ---------------------------------------------------------------------------
  // 6. NINE ARTICULATED TAILS, FUR CARDS & KITSUNEBI SPIRIT FLAMES
  // ---------------------------------------------------------------------------
  /**
   * Helper to build a multi-layered glowing Kitsunebi (fox-fire spirit flame) anchored to a bone
   * with a curling cyan/violet flame body, inner white soul core, and double-sided flame aura card.
   */
  const buildSpiritFlame = (
    namePrefix: string,
    anchorPt: [number, number, number],
    flamePos: [number, number, number],
    bone: ReturnType<typeof b.joint>,
    primaryColor: string,
    scale = 1.0,
    group = "spiritFlames",
  ) => {
    const [ax, ay, az] = anchorPt;
    const [fx, fy, fz] = flamePos;
    const s = fx >= 0 ? 1 : -1;

    // Tether wisp curling from anchor point (tail tip or halo) into the spirit flame orb
    glow(
      b.sweep(
        bezier(
          [ax, ay, az],
          [(ax + fx) * 0.5 + s * 0.03 * scale, (ay + fy) * 0.5 - 0.02 * scale, (az + fz) * 0.5],
          [fx, fy + 0.03 * scale, fz],
        ),
        [0.011 * scale, 0.016 * scale, 0.004 * scale],
        {
          bone,
          color: primaryColor,
          caps: { start: "round", end: "point" },
          sides: 4,
          name: `${namePrefix}_tetherWisp`,
          group,
        },
      ),
      1.35,
    );

    // Outer swirling flame tongue A
    glow(
      b.sweep(
        bezier(
          [fx, fy - 0.035 * scale, fz],
          [fx + s * 0.038 * scale, fy + 0.025 * scale, fz + 0.02 * scale],
          [fx - s * 0.018 * scale, fy + 0.095 * scale, fz - 0.01 * scale],
          [fx + s * 0.01 * scale, fy + 0.155 * scale, fz + 0.015 * scale],
        ),
        [0.028 * scale, 0.036 * scale, 0.018 * scale, 0.002],
        {
          bone,
          color: primaryColor,
          caps: { start: "round", end: "point" },
          sides: 5,
          name: `${namePrefix}_outerTongue`,
          group,
        },
      ),
      1.45,
    );

    // Secondary contrasting violet/cyan curling flame tongue B
    const secondaryColor = primaryColor === FLAME_CYAN ? FLAME_VIOLET : FLAME_CYAN;
    glow(
      b.sweep(
        bezier(
          [fx - s * 0.015 * scale, fy - 0.02 * scale, fz - 0.015 * scale],
          [fx - s * 0.036 * scale, fy + 0.035 * scale, fz - 0.025 * scale],
          [fx + s * 0.016 * scale, fy + 0.09 * scale, fz + 0.01 * scale],
        ),
        [0.02 * scale, 0.024 * scale, 0.002],
        {
          bone,
          color: secondaryColor,
          caps: { start: "round", end: "point" },
          sides: 4,
          name: `${namePrefix}_curlTongue`,
          group,
        },
      ),
      1.35,
    );

    // Brilliant white-cyan inner soul core
    glow(
      b.part(new THREE.OctahedronGeometry(0.026 * scale, 0), FLAME_CORE, {
        bone,
        at: [fx, fy + 0.012 * scale, fz],
        scale: [0.9, 1.35, 0.9],
        flat: true,
        name: `${namePrefix}_coreGem`,
        group,
      }),
      1.8,
    );

    // Crossed glowing spirit-flame SVG cards for lush anime fire silhouette from every camera angle
    glow(
      b.cards([frame([fx, fy - 0.045 * scale, fz], [0, 1, 0])], SPIRIT_FLAME_TEX, {
        size: [0.11 * scale, 0.165 * scale],
        lean: 0,
        flow: [0, 0, 1],
        cross: true,
        bone,
        name: `${namePrefix}_flameCard`,
        group,
      }),
      1.4,
    );
  };

  // Build all 9 tails, their golden base clasps, fur lock cards, and tip spirit flames
  for (const { spec, path, chain } of tailChains) {
    const k = spec.index;
    const group = `tail${k}`;
    const s = spec.pts[3][0] >= 0 ? 1 : -1;

    // Main plush fox tail sweep with swelling mid-brush and pointed calligraphic tip
    const tailSweep = b.sweep(
      chain,
      (t) => {
        const swell = Math.sin(Math.pow(t, 0.72) * Math.PI);
        const r = 0.034 * (1 - t) + 0.088 * swell + 0.004;
        return [r * 0.88, r * 1.08];
      },
      {
        color: TAIL_COAT,
        caps: { start: "round", end: "point" },
        sides: 8,
        name: `tailBrush${k}`,
        group,
      },
    );

    // Ornate golden lotus ring clasp at the root of each tail
    const rootFrame = chain.at(0.08);
    b.part(new THREE.TorusGeometry(0.044, 0.009, 5, 8), GOLD_ORNATE, {
      bone: chain.joints[0],
      at: rootFrame.at,
      dir: rootFrame.tangent,
      name: `tailBaseClasp${k}`,
      group,
    });

    // Swept sculpted fur lock fins along the outer curve of each tail
    for (const [lockIdx, tPos] of [0.36, 0.58, 0.76].entries()) {
      const sp = tailSweep.at(tPos, s * 65);
      const lockDir = sp.n.clone().multiplyScalar(0.45).addScaledVector(sp.tangent, 0.88).normalize();
      const midPt = offset(sp.at, lockDir, 0.055);
      const endPt = offset(sp.at, sp.tangent, 0.115).addScaledVector(sp.n, 0.032);
      b.sweep(
        bezier(sp.at, midPt, endPt),
        [0.022, 0.016, 0.002],
        {
          bone: sp.bone ?? chain.joints[Math.min(lockIdx + 1, 2)],
          color: lockIdx === 2 ? SCARLET : CREAM,
          caps: { start: "round", end: "point" },
          sides: 4,
          name: `tailSculptLock${k}_${lockIdx + 1}`,
          group,
        },
      );
    }

    // Feathery anime fur cards along the dorsal and lateral ridges of each tail
    const cardFrames = [0.26, 0.44, 0.62, 0.78].flatMap((tPos) => [
      tailSweep.at(tPos, 35),
      tailSweep.at(tPos, -35),
    ]);
    b.cards(cardFrames, k % 2 === 0 ? SCARLET_TUFT_TEX : CREAM_TUFT_TEX, {
      size: [0.058, 0.12],
      lean: 58,
      bend: 24,
      flow: (f) => path.tangentAt(path.closestT(f.at)),
      vary: 0.18,
      rng: rand,
      name: `tailFurCards${k}`,
      group,
    });

    // Kitsunebi Spirit Flame hovering at the tip of each of the 9 tails!
    const tipPt = spec.pts[3];
    const tipTangent = path.tangentAt(1).normalize();
    const flameCenter: [number, number, number] = [
      tipPt[0] + tipTangent.x * 0.055 + (k === 1 ? 0 : s * 0.02),
      tipPt[1] + Math.max(0.04, tipTangent.y * 0.065),
      tipPt[2] + tipTangent.z * 0.055,
    ];
    buildSpiritFlame(
      `tailFlame${k}`,
      tipPt,
      flameCenter,
      chain.tip!,
      spec.flameColor,
      k === 1 ? 1.15 : 0.92,
      group,
    );
  }

  // Two additional grand sentinel Kitsunebi Spirit Flames flanking the shoulder halo
  for (const s of [1, -1] as const) {
    const sideTag = s > 0 ? "L" : "R";
    const haloAnchor: [number, number, number] = [
      haloCenter[0] + s * haloRadius,
      haloCenter[1] + 0.02,
      haloCenter[2],
    ];
    const sentinelFlamePos: [number, number, number] = [
      s * 0.34,
      0.86,
      0.16,
    ];
    buildSpiritFlame(
      `haloSentinelFlame${sideTag}`,
      haloAnchor,
      sentinelFlamePos,
      chestJoint,
      s > 0 ? FLAME_CYAN : FLAME_VIOLET,
      1.05,
      "spiritFlames",
    );
  }

  // Silence unused helper warnings if any
  void gradient;
  void mix;
  void shadowOf;
  void bodyLoft;

  return b.root;
}
