import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { lerp, offset, rng } from "../../../../src/math";
import { mix, noise, paint, resolve, smoothstep } from "../../../../src/paint";
import { bezier, catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { furEdge, zigzag } from "../../../../kits/toon";

export const meta = {
  name: "Gray Wolf",
  description:
    "Heroic Warcraft-styled alpha gray wolf standing alert with thick hand-painted silver-slate pelt, oversized paws, glowing amber eyes, scarred muzzle, and a spiked iron-and-leather war collar.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "grayWolf", detail: 1, paintSize: 2048 });

  // ---------------------------------------------------------------------------
  // Hand-painted Warcraft Palette & Procedural Brushwork Paints
  // ---------------------------------------------------------------------------
  const KEY = new THREE.Vector3(0.35, 0.82, 0.45).normalize();

  // Base flat colors
  const IRON_DARK = "#272d38";
  const IRON_RIM = "#6c7a8e";
  const BRASS_GOLD = "#d69c36";
  const BRASS_DARK = "#7c5216";
  const LEATHER_WARM = "#4f2a18";
  const LEATHER_EDGE = "#7d462b";
  const CLAW_BONE = "#dcd3be";
  const CLAW_BASE = "#3a332d";
  const TOOTH_IVORY = "#f2ebd9";
  const GUM_PINK = "#7c3238";
  const TONGUE_RED = "#9e3b42";
  const NOSE_CHARCOAL = "#1a1820";
  const SCAR_PINK = "#9c5e63";
  const EYE_GOLD = "#ffae19";
  const EYE_CORE = "#fff3a1";
  const RUNE_CYAN = "#45e6ff";
  const INK_DARK = "#171821";

  // Helper for hand-painted Warcraft lighting + brush-stroke grain
  const handPainted = (litHex: string, midHex: string, shadowHex: string, grainScale = 0.055, seed = 11) =>
    paint((p, n) => {
      const nl = n.dot(KEY);
      const stroke =
        0.5 +
        0.5 *
          Math.sin(
            (p.z * 26 + p.y * 14) +
              noise(p, grainScale, seed) * 5.2 +
              noise(p, grainScale * 0.45, seed + 19) * 2.4,
          );
      const mottled = noise(p, grainScale * 1.8, seed + 7);
      const baseMix = mix(midHex, litHex, smoothstep(-0.05, 0.58, nl + (stroke - 0.5) * 0.25));
      const shaded = mix(shadowHex, baseMix, smoothstep(-0.55, 0.12, nl + (mottled - 0.5) * 0.22));
      // Subtle top-down ambient gradient (darker paws/underside, brighter dorsal ridge)
      const verticalAO = smoothstep(0.03, 0.65, p.y);
      return mix(mix(shadowHex, "#12131a", 0.35), shaded, 0.32 + 0.68 * verticalAO);
    });

  const DORSAL_DARK = handPainted("#485266", "#2f3646", "#1a1e29", 0.05, 101);
  const SLATE_MID = handPainted("#828fa6", "#5b667a", "#353c4b", 0.055, 202);
  const SILVER_HIGH = handPainted("#d5deec", "#a5b2c6", "#647085", 0.05, 303);
  const CREAM_BELLY = handPainted("#ece6da", "#cdc4b5", "#857d73", 0.055, 404);
  const CHARCOAL_SOCK = handPainted("#383e4c", "#242834", "#14161f", 0.045, 505);
  const EAR_INNER_PAINT = handPainted("#b5767b", "#8a5258", "#522d33", 0.035, 606);

  // Full wolf body coat with stylized jagged Warcraft fur transitions
  const WOLF_COAT = paint((p, n) => {
    const toothLarge = zigzag(p.z / 0.055 + p.x / 0.09) * 0.18;
    const toothSmall = zigzag(p.z / 0.026 - p.x / 0.05) * 0.08;
    const furNoise = (noise(p, 0.07, 77) - 0.5) * 0.16;

    // Dorsal dark cape along spine, neck, and shoulders
    const shoulderCape = p.z > 0.02 && p.z < 0.42 ? 0.16 * Math.exp(-((p.z - 0.22) / 0.18) ** 2) : 0;
    const dorsalMetric = n.y + (p.y - 0.52) * 0.9 + shoulderCape - toothLarge - toothSmall + furNoise;

    if (dorsalMetric > 0.46) return resolve(DORSAL_DARK, p, n);
    if (dorsalMetric > 0.39) return resolve(INK_DARK, p, n); // Crisp dark painted fur-lock border

    // Silver-white shoulder ruff / cheek / haunch highlight band
    const ruffBoost = p.z > 0.16 && p.z < 0.52 ? 0.22 : 0;
    if (dorsalMetric > 0.18 - ruffBoost * 0.4 && n.y > -0.15 && p.z > 0.12 && p.z < 0.48) {
      return resolve(SILVER_HIGH, p, n);
    }

    // Pale cream belly, chest bib, and inner thighs
    const chestBib = p.z > 0.26 && n.z > 0.15 ? 0.32 : 0;
    const bellyMetric = -n.y * 0.65 + (0.48 - p.y) * 0.85 + chestBib - toothLarge * 0.85 + furNoise;
    if (bellyMetric > 0.42 && p.y > 0.24) {
      return resolve(CREAM_BELLY, p, n);
    }

    // Dark smoky lower leg markings grading down to silver-tipped paws
    if (p.y < 0.29) {
      const sockWave = p.y + zigzag(Math.atan2(p.x, p.z) * 1.8) * 0.035;
      if (sockWave < 0.075) return resolve(SILVER_HIGH, p, n); // bright Warcraft paw knuckles
      if (sockWave < 0.24) return resolve(CHARCOAL_SOCK, p, n);
    }

    return resolve(SLATE_MID, p, n);
  });

  // Facial mask paint: dark nasal bridge & eye mask, silver-white cheek ruff & lower muzzle
  const FACE_COAT = paint((p, n) => {
    const tooth = zigzag(p.x / 0.024 + p.y / 0.03) * 0.022;
    // Dark widow's peak & nasal bridge stripe
    if (n.y > 0.32 && Math.abs(p.x) < 0.048 + tooth && p.z > 0.48) {
      return resolve(DORSAL_DARK, p, n);
    }
    // White-silver cheek ruff & upper lip mask
    if (p.y < 0.72 + tooth || Math.abs(p.x) > 0.075 - tooth * 0.5) {
      return resolve(CREAM_BELLY, p, n);
    }
    return resolve(SLATE_MID, p, n);
  });

  // Tail coat: dark dorsal stripe, silver mid, pale underside, charcoal-black tip with white apex hairs
  const TAIL_COAT = furEdge(DORSAL_DARK, CREAM_BELLY, {
    level: -0.08,
    teeth: 0.26,
    period: 0.038,
    ink: INK_DARK,
    inkWidth: 0.045,
  });

  const IRON_PAINT = handPainted(IRON_RIM, "#3d4657", IRON_DARK, 0.04, 701);
  const BRASS_PAINT = handPainted("#ffd269", BRASS_GOLD, BRASS_DARK, 0.035, 702);
  const LEATHER_PAINT = handPainted(LEATHER_EDGE, LEATHER_WARM, "#29140a", 0.04, 703);

  // ---------------------------------------------------------------------------
  // SVG Textures for Layered Fur Cards & Engraved Details
  // ---------------------------------------------------------------------------
  const FUR_TUFT_LIGHT = svg(
    `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 96 C8 64 14 30 22 6 C25 24 27 42 28 56 C30 32 33 12 36 2 C39 18 42 38 43 56 C46 36 50 18 54 10 C56 38 58 68 58 96 Z" fill="#8b98b0"/>
      <path d="M12 96 C14 66 19 36 23 14 C26 32 28 48 29 64 C31 40 34 20 36 8 C38 24 40 44 41 62 C44 44 48 26 51 18 C53 44 54 70 54 96 Z" fill="#ced7e8"/>
      <path d="M20 96 C22 72 28 40 35 16 C39 42 42 70 44 96 Z" fill="#f0f4fa"/>
      <path d="M6 96 C8 64 14 30 22 6 M28 56 C30 32 33 12 36 2 M43 56 C46 36 50 18 54 10" stroke="#222734" stroke-width="3.2" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  const FUR_TUFT_DARK = svg(
    `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 96 C8 60 14 26 20 4 C24 24 26 44 28 58 C30 30 33 10 35 1 C38 20 41 42 42 60 C46 38 50 18 55 8 C58 36 60 66 60 96 Z" fill="#232834"/>
      <path d="M11 96 C14 64 18 34 21 12 C24 30 27 48 28 64 C31 38 33 18 35 7 C37 24 39 44 40 62 C44 44 47 26 51 16 C53 42 54 68 54 96 Z" fill="#465064"/>
      <path d="M21 96 C24 68 29 38 35 15 C38 42 41 68 43 96 Z" fill="#707d94"/>
      <path d="M4 96 C8 60 14 26 20 4 M28 58 C30 30 33 10 35 1" stroke="#12151d" stroke-width="3.2" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // 1. Skeleton — Heroic Warcraft Wolf Proportions (Shoulder ~0.82m, Head ~1.02m)
  // ---------------------------------------------------------------------------
  const spineCurve = catmull([
    [0, 0.56, -0.50], // 0: rump / tail root
    [0, 0.62, -0.34], // 1: pelvis / hips
    [0, 0.59, -0.10], // 2: muscular waist / loin
    [0, 0.67, 0.16],  // 3: deep ribcage
    [0, 0.74, 0.34],  // 4: massive heroic withers / shoulders
    [0, 0.80, 0.47],  // 5: thick neck base
    [0, 0.85, 0.56],  // 6: upper neck / skull pivot
  ]);

  const hips = b.joint("hips", { at: [0, 0.62, -0.34], dir: [0, -0.06, 1], role: "spine", group: "torso" });
  const rootT = spineCurve.closestT(hips.at);

  const spine = b.chain("spine", spineCurve.slice(rootT, 0.73), {
    parent: hips,
    names: ["spine1", "chest", "shoulders"],
    role: "spine",
    group: "torso",
  });

  const neck = b.chain("neck", spineCurve.slice(0.73, 1), {
    parent: spine,
    names: ["neck1", "neck2"],
    role: "neck",
    group: "neck",
  });

  const head = b.joint("head", {
    parent: neck,
    at: [0, 0.85, 0.56],
    dir: [0, -0.14, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ down: 0.065, forward: 0.055 }),
    dir: [0, -0.26, 1],
    role: "jaw",
    group: "head",
  });

  const ears: Record<string, ReturnType<typeof b.joint>> = {};
  for (const [side, s] of [
    ["R", 1],
    ["L", -1],
  ] as const) {
    ears[side] = b.joint(`ear${side}`, {
      parent: head,
      at: head.local([s * 0.082, 0.015, 0.078]),
      dir: [-s * 0.32, 0.92, -0.12],
      role: "hinge",
      group: `ear${side}`,
    });
  }

  // Sweeping S-curve bushy tail held alert behind the wolf
  const tailCurve = catmull([
    [0, 0.56, -0.50],
    [0, 0.52, -0.68],
    [0, 0.43, -0.88],
    [0, 0.39, -1.07],
    [0, 0.46, -1.25],
    [0, 0.55, -1.36],
  ]);
  const tail = b.chain("tail", tailCurve, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5"],
    role: "tail",
    group: "tail",
  });

  // Digitigrade Front & Hind Limbs (planted solidly on y = 0, separated for clean rigging)
  const pawR = 0.046;
  const frontLegs: Array<{ side: "R" | "L"; s: number; chain: ReturnType<typeof b.chain>; footAt: THREE.Vector3 }> = [];
  const hindLegs: Array<{ side: "R" | "L"; s: number; chain: ReturnType<typeof b.chain>; footAt: THREE.Vector3 }> = [];

  for (const [side, s] of [
    ["R", 1],
    ["L", -1],
  ] as const) {
    const xSign = -s; // s=1 -> right (-X), s=-1 -> left (+X)

    // Front leg: scapula -> elbow (back) -> carpal wrist (forward) -> paw (planted)
    const shoulderAt: [number, number, number] = [xSign * 0.145, 0.64, 0.31];
    const frontFootAt = new THREE.Vector3(xSign * 0.155, pawR, 0.34);
    const frontPts = limb(
      shoulderAt,
      frontFootAt,
      [0.24, 0.23, 0.17],
      [
        [xSign * 0.06, 0, -1], // elbow points back
        [0, 0, 1],             // wrist bows slightly forward
      ],
    );
    const legF = b.chain(`legF${side}`, frontPts, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `pawF${side}`],
      role: "leg",
      contact: [frontFootAt.x, 0, frontFootAt.z + 0.03],
      group: `legF${side}`,
    });
    frontLegs.push({ side, s, chain: legF, footAt: frontFootAt });

    // Hind leg: hip -> stifle knee (forward) -> hock ankle (back) -> paw (planted)
    const hipAt: [number, number, number] = [xSign * 0.135, 0.58, -0.35];
    const hindFootAt = new THREE.Vector3(xSign * 0.15, pawR, -0.37);
    const hindPts = limb(
      hipAt,
      hindFootAt,
      [0.25, 0.24, 0.19],
      [
        [xSign * 0.08, 0, 1],  // knee points forward
        [0, 0, -1],            // hock points sharply backward
      ],
    );
    const legH = b.chain(`legH${side}`, hindPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `pawH${side}`],
      role: "leg",
      contact: [hindFootAt.x, 0, hindFootAt.z + 0.03],
      group: `legH${side}`,
    });
    hindLegs.push({ side, s, chain: legH, footAt: hindFootAt });
  }

  // ---------------------------------------------------------------------------
  // 2. Torso, Chest, Shoulder Ruff & Bushy Tail Volumes
  // ---------------------------------------------------------------------------
  // Main torso loft with heroic deep barrel chest and tucked muscular waist
  const bodyLoft = b.loft(
    [
      { at: [0, 0.56, -0.52], w: 0.16, h: 0.17 }, // rump / tail junction
      { at: [0, 0.60, -0.34], w: 0.27, h: 0.27 }, // muscular pelvis
      { at: [0, 0.57, -0.10], w: 0.23, h: 0.25 }, // athletic tucked loin
      { at: [0, 0.60, 0.16],  w: 0.35, h: 0.39 }, // deep barrel ribcage
      { at: [0, 0.67, 0.34],  w: 0.39, h: 0.42 }, // massive Warcraft shoulder hump
      { at: [0, 0.77, 0.47],  w: 0.30, h: 0.33 }, // thick muscular neck
      { at: [0, 0.84, 0.57],  w: 0.23, h: 0.24 }, // skull base
    ],
    {
      bone: [hips, spine, neck],
      color: WOLF_COAT,
      name: "bodyLoft",
      group: "torso",
    },
  );

  // Proud forward breastbone / sternum keel
  b.sweep(
    catmull([
      [0, 0.42, 0.08],
      [0, 0.46, 0.28],
      [0, 0.58, 0.43],
      [0, 0.74, 0.52],
    ]),
    (t) => [0.115 * (1 - 0.35 * t), 0.095 * (1 - 0.3 * t)],
    {
      bone: [spine, neck],
      color: CREAM_BELLY,
      name: "sternumKeel",
      group: "torso",
    },
  );

  // Heroic layered Warcraft shoulder & neck mane volumes (sculpted chunky fur masses)
  const maneRings = [
    { z: 0.47, y: 0.78, rx: 0.165, ry: 0.175, len: 0.15, tilt: 0.25, count: 9, bone: neck.joints[0] },
    { z: 0.35, y: 0.71, rx: 0.205, ry: 0.215, len: 0.19, tilt: 0.20, count: 11, bone: spine.joints[2] },
    { z: 0.21, y: 0.66, rx: 0.195, ry: 0.205, len: 0.17, tilt: 0.16, count: 9, bone: spine.joints[1] },
  ];

  for (const [rIdx, ringCfg] of maneRings.entries()) {
    for (let i = 0; i < ringCfg.count; i++) {
      const u = i / (ringCfg.count - 1); // 0 to 1 around top & sides
      const angle = (u * 2 - 1) * 128 * (Math.PI / 180); // -128 deg to +128 deg from dorsal top
      const sx = Math.sin(angle);
      const sy = Math.cos(angle);
      const basePt: [number, number, number] = [
        sx * ringCfg.rx * 0.86,
        ringCfg.y + sy * ringCfg.ry * 0.84,
        ringCfg.z,
      ];
      const midPt: [number, number, number] = [
        sx * (ringCfg.rx + 0.045),
        ringCfg.y + sy * (ringCfg.ry + 0.042) + 0.015,
        ringCfg.z - ringCfg.len * 0.48,
      ];
      const tipPt: [number, number, number] = [
        sx * (ringCfg.rx + 0.025),
        ringCfg.y + sy * (ringCfg.ry + 0.022) - 0.01,
        ringCfg.z - ringCfg.len,
      ];
      const isDorsal = Math.abs(angle) < 0.65;
      const isVentral = Math.abs(angle) > 1.55;
      const tuftColor = isDorsal ? DORSAL_DARK : isVentral ? CREAM_BELLY : SILVER_HIGH;
      b.sweep(
        bezier(basePt, midPt, tipPt),
        (t) => [0.048 * (1 - 0.85 * t * t), 0.034 * (1 - 0.88 * t)],
        {
          bone: ringCfg.bone,
          color: tuftColor,
          section: { ngon: 5 },
          caps: { start: "round", end: "point" },
          up: [sx * 0.5, Math.max(0.2, sy), 0],
          name: `maneLock_${rIdx}_${i}`,
          group: "mane",
        },
      );
    }
  }

  // Prominent dorsal hackles along the spine & withers
  const hackleSpecs = [
    { z: 0.52, y: 0.94, h: 0.085, len: 0.12, w: 0.036, bone: neck.joints[1] },
    { z: 0.43, y: 0.92, h: 0.105, len: 0.14, w: 0.042, bone: neck.joints[0] },
    { z: 0.32, y: 0.88, h: 0.115, len: 0.16, w: 0.046, bone: spine.joints[2] },
    { z: 0.19, y: 0.85, h: 0.095, len: 0.15, w: 0.042, bone: spine.joints[1] },
    { z: 0.05, y: 0.80, h: 0.075, len: 0.13, w: 0.036, bone: spine.joints[1] },
    { z: -0.10, y: 0.72, h: 0.060, len: 0.11, w: 0.032, bone: spine.joints[0] },
    { z: -0.26, y: 0.74, h: 0.065, len: 0.11, w: 0.032, bone: hips },
  ];
  for (const [idx, hk] of hackleSpecs.entries()) {
    b.sweep(
      bezier(
        [0, hk.y - 0.03, hk.z],
        [0, hk.y + hk.h * 0.75, hk.z - hk.len * 0.45],
        [0, hk.y + hk.h * 0.35, hk.z - hk.len],
      ),
      (t) => [hk.w * (1 - 0.85 * t), hk.w * 1.25 * (1 - 0.85 * t)],
      {
        bone: hk.bone,
        color: DORSAL_DARK,
        section: { ngon: 4 },
        caps: { start: "round", end: "point" },
        name: `hackle_${idx}`,
        group: "mane",
      },
    );
  }

  // Forward chest bib locks (chunky white-silver fur spikes on the chest)
  for (const [idx, [xOff, yOff, zOff, len]] of [
    [0, 0.58, 0.49, 0.13],
    [-0.055, 0.56, 0.47, 0.11],
    [0.055, 0.56, 0.47, 0.11],
    [0, 0.49, 0.44, 0.12],
    [-0.065, 0.48, 0.42, 0.10],
    [0.065, 0.48, 0.42, 0.10],
  ].entries()) {
    b.sweep(
      bezier(
        [xOff, yOff, zOff - 0.03],
        [xOff * 1.15, yOff - 0.04, zOff + len * 0.45],
        [xOff * 1.05, yOff - 0.09, zOff + len * 0.25],
      ),
      (t) => [0.038 * (1 - 0.85 * t), 0.028 * (1 - 0.85 * t)],
      {
        bone: spine.joints[2],
        color: CREAM_BELLY,
        section: { ngon: 5 },
        caps: { start: "round", end: "point" },
        name: `chestTuft_${idx}`,
        group: "mane",
      },
    );
  }

  // Bushy wolf tail sweep + sculpted lateral/ventral feathering locks
  const tailSweep = b.sweep(
    tail,
    (t) => {
      const Plume = Math.sin(Math.pow(t, 0.72) * Math.PI);
      const rx = 0.055 * (1 - t) + 0.095 * Plume + 0.012;
      const ry = 0.062 * (1 - t) + 0.112 * Plume + 0.014;
      return [rx, ry];
    },
    {
      color: TAIL_COAT,
      caps: { start: "round", end: "point" },
      name: "tailMain",
      group: "tail",
    },
  );

  // Sculpted plumed tail locks along the tail so the silhouette has jagged Warcraft volume
  for (const [idx, tVal] of [0.18, 0.34, 0.50, 0.66, 0.80].entries()) {
    const pt = tail.at(tVal);
    for (const deg of [135, 180, 225, 75, 285]) {
      const sp = tailSweep.at(tVal, deg, -0.008);
      const isBottom = deg >= 135 && deg <= 225;
      const lockLen = isBottom ? 0.15 : 0.11;
      const tip = sp.at
        .clone()
        .addScaledVector(pt.tangent, lockLen * 0.88)
        .addScaledVector(sp.n, lockLen * 0.36);
      const midCtrl = sp.at
        .clone()
        .addScaledVector(pt.tangent, lockLen * 0.42)
        .addScaledVector(sp.n, lockLen * 0.45);
      b.sweep(
        bezier(sp.at, midCtrl, tip),
        (t) => [0.032 * (1 - 0.88 * t), 0.024 * (1 - 0.88 * t)],
        {
          bone: pt.bone,
          color: tVal > 0.7 ? DORSAL_DARK : isBottom ? CREAM_BELLY : SLATE_MID,
          section: { ngon: 4 },
          caps: { start: "round", end: "point" },
          name: `tailLock_${idx}_${deg}`,
          group: "tail",
        },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // 3. Ornate Warcraft War-Wolf Collar (Thick Leather, Iron Plates, Spikes & Rune)
  // ---------------------------------------------------------------------------
  const collarJoint = neck.joints[0];
  const bodySkin = b.surface(bodyLoft);
  const collarPath = bodySkin.loop(collarJoint.local({ forward: 0.02 }), {
    dir: [0, 0.52, 0.85],
    lift: 0.008,
  });

  // Wide heavy leather under-strap
  b.sweep(collarPath, [0.026, 0.015], {
    bone: collarJoint,
    color: LEATHER_PAINT,
    section: "box",
    name: "collarLeather",
    group: "collar",
  });

  // Forged dark-iron reinforcing band
  const ironBandPath = bodySkin.loop(collarJoint.local({ forward: 0.02 }), {
    dir: [0, 0.52, 0.85],
    lift: 0.016,
  });
  b.sweep(ironBandPath, [0.016, 0.012], {
    bone: collarJoint,
    color: IRON_PAINT,
    section: { ngon: 6 },
    name: "collarIronBand",
    group: "collar",
  });

  // Brass rivets & fierce iron war-spikes along the upper/side arc of the collar
  b.along(ironBandPath, 12, (pt) => {
    const outDir = pt.at.clone().sub(collarJoint.at).normalize();
    // Brass stud rivet at every station
    b.part(new THREE.CylinderGeometry(0.011, 0.013, 0.012, 6), BRASS_PAINT, {
      bone: collarJoint,
      at: pt.at,
      dir: outDir,
      flat: true,
      group: "collar",
    });
    // Heavy iron spike on top and sides (skip throat underside so chest tag sits cleanly)
    if (outDir.y > -0.25) {
      b.spike(offset(pt.at, outDir, 0.004), outDir, 0.062, 0.017, {
        bone: collarJoint,
        color: IRON_PAINT,
        section: { ngon: 5 },
        group: "collar",
      });
      b.part(new THREE.CylinderGeometry(0.019, 0.021, 0.01, 6), BRASS_PAINT, {
        bone: collarJoint,
        at: offset(pt.at, outDir, 0.003),
        dir: outDir,
        flat: true,
        group: "collar",
      });
    }
  });

  // Throat emblem: brass war-ring + glowing frost-blue rune gem on the chest
  const throatHit = bodySkin.nearest(collarJoint.local({ down: 0.16, forward: 0.04 }));
  const medalCenter = throatHit.moved([0, 0.018, 0]);
  b.part(new THREE.CylinderGeometry(0.036, 0.032, 0.016, 8), BRASS_PAINT, {
    bone: collarJoint,
    at: medalCenter,
    dir: throatHit.n,
    flat: true,
    name: "collarMedallion",
    group: "collar",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.022, 0), RUNE_CYAN, {
      bone: collarJoint,
      at: offset(medalCenter, throatHit.n, 0.01),
      dir: throatHit.n,
      scale: [0.85, 0.6, 1.25],
      flat: true,
      name: "collarRuneGem",
      group: "collar",
    }),
    1.35,
  );

  // ---------------------------------------------------------------------------
  // 4. Sculpted Head, Snout, Snarling Fangs, Glowing Amber Eyes, Scars & Ears
  // ---------------------------------------------------------------------------
  // Cranium dome
  b.loft(
    [
      { at: head.local([0, -0.02, -0.02]), w: 0.21, h: 0.19 },
      { at: head.local([0, 0.04, 0.01]),  w: 0.22, h: 0.20 },
      { at: head.local([0, 0.11, 0.01]),  w: 0.19, h: 0.17 },
      { at: head.local([0, 0.16, -0.01]), w: 0.14, h: 0.13 },
    ],
    {
      bone: head,
      color: FACE_COAT,
      name: "cranium",
      group: "head",
    },
  );

  // Boxy tapered Warcraft wolf muzzle / upper snout
  b.loft(
    [
      { at: head.local([0, 0.11, 0.00]),  w: 0.155, h: 0.115 },
      { at: head.local([0, 0.19, -0.01]), w: 0.118, h: 0.096 },
      { at: head.local([0, 0.285, -0.015]), w: 0.096, h: 0.082 },
      { at: head.local([0, 0.33, -0.018]), w: 0.072, h: 0.064 },
    ],
    {
      bone: head,
      color: FACE_COAT,
      section: { ngon: 6 },
      name: "muzzleUpper",
      group: "head",
    },
  );

  // Snout bridge wrinkle ridges (fierce alert expression)
  for (const [idx, yPos] of [0.16, 0.20, 0.24].entries()) {
    b.capsule(
      head.local([-0.036, yPos, 0.036 - idx * 0.004]),
      head.local([0.036, yPos, 0.036 - idx * 0.004]),
      0.011,
      DORSAL_DARK,
      { bone: head, name: `snoutRidge_${idx}`, group: "head" },
    );
  }

  // Wet black canine nose leather + flared nostrils
  const nosePos = head.local([0, 0.34, 0.002]);
  b.part(new THREE.DodecahedronGeometry(0.032, 0), NOSE_CHARCOAL, {
    bone: head,
    at: nosePos,
    dir: head.dir([0, 1, 0.15]),
    scale: [1.22, 0.85, 0.95],
    flat: true,
    name: "nosePad",
    group: "head",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.009, 6, 4), INK_DARK, {
      bone: head,
      at: head.local([s * 0.018, 0.348, 0.004]),
      scale: [0.8, 1.2, 0.6],
      flat: true,
      group: "head",
    });
  }

  // Upper flews / dark lip rims
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        head.local([s * 0.025, 0.325, -0.038]),
        head.local([s * 0.046, 0.24, -0.045]),
        head.local([s * 0.058, 0.14, -0.042]),
      ]),
      [0.014, 0.011],
      {
        bone: head,
        color: NOSE_CHARCOAL,
        name: `upperLip_${s > 0 ? "R" : "L"}`,
        group: "head",
      },
    );
  }

  // Heavy Warcraft brow ridges & glowing amber eyes
  for (const [side, s] of [
    ["R", 1],
    ["L", -1],
  ] as const) {
    // Fierce scowling supraorbital brow arch
    b.sweep(
      catmull([
        head.local([s * 0.022, 0.155, 0.055]),
        head.local([s * 0.068, 0.135, 0.062]),
        head.local([s * 0.095, 0.085, 0.038]),
      ]),
      [0.018, 0.024, 0.015],
      {
        bone: head,
        color: DORSAL_DARK,
        section: { ngon: 5 },
        name: `browRidge_${side}`,
        group: "head",
      },
    );

    // Zygomatic cheek bone arch under the eye
    b.sweep(
      catmull([
        head.local([s * 0.052, 0.15, -0.002]),
        head.local([s * 0.092, 0.095, -0.008]),
        head.local([s * 0.105, 0.02, -0.012]),
      ]),
      [0.016, 0.022, 0.018],
      {
        bone: head,
        color: SILVER_HIGH,
        name: `cheekArch_${side}`,
        group: "head",
      },
    );

    // Dark eye socket liner
    const eyeAt = head.local([s * 0.064, 0.125, 0.028]);
    const eyeDir = head.dir([s * 0.48, 0.84, 0.18]);
    b.part(new THREE.SphereGeometry(0.024, 8, 6), INK_DARK, {
      bone: head,
      at: eyeAt,
      dir: eyeDir,
      scale: [1.05, 1.25, 0.78],
      flat: true,
      name: `eyeSocket_${side}`,
      group: "head",
    });

    // Self-lit glowing golden-amber wolf eye + bright pupil slit
    glow(
      b.part(new THREE.SphereGeometry(0.021, 8, 6), EYE_GOLD, {
        bone: head,
        at: offset(eyeAt, eyeDir, 0.005),
        dir: eyeDir,
        scale: [0.95, 1.15, 0.76],
        flat: true,
        name: `eyeGlow_${side}`,
        group: "head",
      }),
      1.4,
    );
    glow(
      b.part(new THREE.BoxGeometry(0.007, 0.018, 0.008), EYE_CORE, {
        bone: head,
        at: offset(eyeAt, eyeDir, 0.018),
        dir: eyeDir,
        axis: "z",
        flat: true,
        name: `eyeCore_${side}`,
        group: "head",
      }),
      1.8,
    );

    // Signature Warcraft sweeping mutton-chop cheek ruff flares (3 layered spikes per side)
    for (const [fIdx, [yLocal, zLocal, flareLen, flareDrop]] of [
      [0.04, 0.005, 0.135, 0.01],
      [0.01, -0.028, 0.155, -0.025],
      [-0.02, -0.055, 0.130, -0.055],
    ].entries()) {
      const start = head.local([s * 0.088, yLocal, zLocal]);
      const midPt = head.local([s * (0.088 + flareLen * 0.62), yLocal - flareLen * 0.35, zLocal + flareDrop * 0.5]);
      const tipPt = head.local([s * (0.088 + flareLen), yLocal - flareLen * 0.78, zLocal + flareDrop]);
      b.sweep(
        bezier(start, midPt, tipPt),
        (t) => [0.032 * (1 - 0.88 * t), 0.022 * (1 - 0.88 * t)],
        {
          bone: head,
          color: CREAM_BELLY,
          section: { ngon: 4 },
          caps: { start: "round", end: "point" },
          name: `cheekRuff_${side}_${fIdx}`,
          group: "head",
        },
      );
    }
  }

  // Battle scars across the left eye and snout bridge (classic Warcraft veteran wolf detail)
  b.sweep(
    catmull([
      head.local([-0.015, 0.25, 0.044]),
      head.local([0.012, 0.20, 0.050]),
      head.local([0.035, 0.15, 0.052]),
    ]),
    [0.0035, 0.005, 0.0035],
    { bone: head, color: SCAR_PINK, name: "muzzleScar", group: "head" },
  );
  b.sweep(
    catmull([
      head.local([-0.062, 0.145, 0.072]),
      head.local([-0.078, 0.115, 0.022]),
      head.local([-0.084, 0.082, -0.018]),
    ]),
    [0.0035, 0.005, 0.0035],
    { bone: head, color: SCAR_PINK, name: "eyeScarL", group: "head" },
  );

  // Upper jaw gums, oversized Warcraft canine fangs, and upper incisors
  b.part(new THREE.BoxGeometry(0.068, 0.14, 0.018), GUM_PINK, {
    bone: head,
    at: head.local([0, 0.24, -0.042]),
    quat: head.quat,
    flat: true,
    name: "upperGum",
    group: "head",
  });
  for (const [side, s] of [
    ["R", 1],
    ["L", -1],
  ] as const) {
    // Oversized upper sabre-like wolf canine fang
    b.sweep(
      bezier(
        head.local([s * 0.035, 0.275, -0.035]),
        head.local([s * 0.038, 0.282, -0.068]),
        head.local([s * 0.033, 0.268, -0.092]),
      ),
      [0.012, 0],
      {
        bone: head,
        color: TOOTH_IVORY,
        section: { ngon: 5 },
        caps: { start: "flat", end: "point" },
        name: `upperFang_${side}`,
        group: "head",
      },
    );
    // Upper premolar teeth
    for (const [tIdx, yPos] of [0.23, 0.195].entries()) {
      b.spike(
        head.local([s * 0.036, yPos, -0.038]),
        head.dir([0, -0.1, -1]),
        0.024,
        0.008,
        TOOTH_IVORY,
        { bone: head, section: { ngon: 4 }, name: `upperMolar_${side}_${tIdx}`, group: "head" },
      );
    }
  }
  // Upper row of incisors
  for (const xOff of [-0.018, -0.006, 0.006, 0.018]) {
    b.spike(
      head.local([xOff, 0.308, -0.036]),
      head.dir([0, -0.1, -1]),
      0.018,
      0.0055,
      TOOTH_IVORY,
      { bone: head, section: { ngon: 4 }, group: "head" },
    );
  }

  // Articulated Lower Jaw, Chin Tuft, Tongue & Lower Fangs
  b.loft(
    [
      { at: jaw.local([0, 0.00, 0.00]),  w: 0.115, h: 0.058 },
      { at: jaw.local([0, 0.10, 0.005]), w: 0.088, h: 0.050 },
      { at: jaw.local([0, 0.20, 0.008]), w: 0.068, h: 0.042 },
      { at: jaw.local([0, 0.245, 0.01]), w: 0.052, h: 0.034 },
    ],
    {
      bone: jaw,
      color: CREAM_BELLY,
      section: { ngon: 6 },
      name: "lowerJaw",
      group: "head",
    },
  );

  // Dark lower lip rim + pink tongue
  b.capsule(jaw.local([-0.025, 0.21, 0.022]), jaw.local([0.025, 0.21, 0.022]), 0.012, GUM_PINK, {
    bone: jaw,
    name: "lowerGum",
    group: "head",
  });
  b.sweep(
    catmull([
      jaw.local([0, 0.06, 0.022]),
      jaw.local([0, 0.14, 0.028]),
      jaw.local([0, 0.21, 0.024]),
    ]),
    (t) => [0.024 * (1 - 0.35 * t), 0.011 * (1 - 0.4 * t)],
    {
      bone: jaw,
      color: TONGUE_RED,
      name: "tongue",
      group: "head",
    },
  );

  // Lower upward-jutting Warcraft canine tusks/fangs + chin beard spike
  for (const [side, s] of [
    ["R", 1],
    ["L", -1],
  ] as const) {
    b.sweep(
      bezier(
        jaw.local([s * 0.029, 0.215, 0.015]),
        jaw.local([s * 0.033, 0.228, 0.042]),
        jaw.local([s * 0.028, 0.222, 0.062]),
      ),
      [0.010, 0],
      {
        bone: jaw,
        color: TOOTH_IVORY,
        section: { ngon: 5 },
        caps: { start: "flat", end: "point" },
        name: `lowerFang_${side}`,
        group: "head",
      },
    );
  }
  b.sweep(
    bezier(
      jaw.local([0, 0.18, -0.018]),
      jaw.local([0, 0.13, -0.052]),
      jaw.local([0, 0.07, -0.075]),
    ),
    [0.024, 0],
    {
      bone: jaw,
      color: CREAM_BELLY,
      section: { ngon: 4 },
      caps: { start: "round", end: "point" },
      name: "chinBeard",
      group: "head",
    },
  );

  // Pose jaw slightly open in an alert, fierce snarl
  b.pose(jaw, { axis: [1, 0, 0], deg: 11 });

  // Pointed Pricked Wolf Ears (outer dark slate shell, recessed pink concha, pale inner ear tuft)
  for (const [side, s] of [
    ["R", 1],
    ["L", -1],
  ] as const) {
    const earJ = ears[side];
    // Outer ear pinna
    b.loft(
      [
        { at: earJ.local([0, 0.00, 0.00]),   w: 0.068, h: 0.048 },
        { at: earJ.local([0, 0.055, -0.005]), w: 0.074, h: 0.042 },
        { at: earJ.local([0, 0.125, -0.012]), w: 0.044, h: 0.026 },
        { at: earJ.local([0, 0.175, -0.018]), w: 0.010, h: 0.010 },
      ],
      {
        bone: earJ,
        color: DORSAL_DARK,
        section: { ngon: 5 },
        caps: { start: "round", end: "point" },
        name: `earOuter_${side}`,
        group: `ear${side}`,
      },
    );
    // Inner pink ear hollow (facing forward)
    b.loft(
      [
        { at: earJ.local([0, 0.018, -0.014]), w: 0.042, h: 0.018 },
        { at: earJ.local([0, 0.065, -0.018]), w: 0.046, h: 0.016 },
        { at: earJ.local([0, 0.125, -0.020]), w: 0.022, h: 0.010 },
      ],
      {
        bone: earJ,
        color: EAR_INNER_PAINT,
        section: { ngon: 4 },
        name: `earInner_${side}`,
        group: `ear${side}`,
      },
    );
    // Fluffy white ear-base hair tuft
    b.spike(
      earJ.local([s * 0.012, 0.022, -0.022]),
      earJ.dir([s * 0.25, 0.78, -0.55]),
      0.068,
      0.021,
      CREAM_BELLY,
      {
        bone: earJ,
        section: { ngon: 4 },
        name: `earTuft_${side}`,
        group: `ear${side}`,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // 5. Muscular Warcraft Limbs, Elbow/Hock Feathering & Oversized Paws
  // ---------------------------------------------------------------------------
  const buildPaw = (
    pawBone: ReturnType<typeof b.joint>,
    footAt: THREE.Vector3,
    s: number,
    prefix: string,
    groupName: string,
  ) => {
    const xSign = -s;
    // Heavy metacarpal/metatarsal paw bridge
    b.part(new THREE.BoxGeometry(0.115, 0.062, 0.115), SILVER_HIGH, {
      bone: pawBone,
      at: [footAt.x, 0.036, footAt.z + 0.018],
      dir: [0, 0, 1],
      axis: "z",
      flat: true,
      name: `${prefix}_bridge`,
      group: groupName,
    });

    // Dark tough heel pad resting right on y = 0
    b.part(new THREE.CylinderGeometry(0.044, 0.048, 0.024, 7), NOSE_CHARCOAL, {
      bone: pawBone,
      at: [footAt.x, 0.012, footAt.z + 0.005],
      flat: true,
      name: `${prefix}_pad`,
      group: groupName,
    });

    // 4 chunky articulated-looking Warcraft wolf toes with arched knuckles & heavy curved claws
    const toeSpecs = [
      { idx: 0, dx: xSign * -0.038, dz: 0.056, yaw: xSign * -0.22, scale: 0.92 },
      { idx: 1, dx: xSign * -0.013, dz: 0.070, yaw: xSign * -0.06, scale: 1.05 },
      { idx: 2, dx: xSign * 0.014,  dz: 0.070, yaw: xSign * 0.06,  scale: 1.05 },
      { idx: 3, dx: xSign * 0.040,  dz: 0.054, yaw: xSign * 0.24,  scale: 0.92 },
    ];

    for (const toe of toeSpecs) {
      const toeBase = new THREE.Vector3(footAt.x + toe.dx, 0.022 * toe.scale, footAt.z + toe.dz - 0.022);
      const toeTip = new THREE.Vector3(
        footAt.x + toe.dx + toe.yaw * 0.028,
        0.019 * toe.scale,
        footAt.z + toe.dz + 0.026 * toe.scale,
      );
      const knuckle = new THREE.Vector3(
        (toeBase.x + toeTip.x) * 0.5,
        0.044 * toe.scale,
        (toeBase.z + toeTip.z) * 0.5,
      );

      // Arched digit knuckle
      b.sweep(
        bezier(toeBase, knuckle, toeTip),
        [0.021 * toe.scale, 0.018 * toe.scale],
        {
          bone: pawBone,
          color: SILVER_HIGH,
          section: { ngon: 5 },
          name: `${prefix}_toe_${toe.idx}`,
          group: groupName,
        },
      );

      // Dark claw sheath ring
      b.part(new THREE.CylinderGeometry(0.013 * toe.scale, 0.015 * toe.scale, 0.014, 5), CLAW_BASE, {
        bone: pawBone,
        at: toeTip,
        dir: [toe.yaw, -0.25, 1],
        flat: true,
        group: groupName,
      });

      // Hooked bone-ivory Warcraft claw resting on the ground plane (y >= 0.003)
      const clawEnd = new THREE.Vector3(
        toeTip.x + toe.yaw * 0.025,
        0.005,
        toeTip.z + 0.036 * toe.scale,
      );
      const clawMid = new THREE.Vector3(
        (toeTip.x + clawEnd.x) * 0.5,
        0.020 * toe.scale,
        (toeTip.z + clawEnd.z) * 0.5 + 0.006,
      );
      b.sweep(
        bezier(toeTip, clawMid, clawEnd),
        [0.011 * toe.scale, 0],
        {
          bone: pawBone,
          color: CLAW_BONE,
          section: { ngon: 4 },
          caps: { start: "flat", end: "point" },
          name: `${prefix}_claw_${toe.idx}`,
          group: groupName,
        },
      );
    }

    // Inner dewclaw on the medial side of the wrist
    const dewAt = new THREE.Vector3(footAt.x - xSign * 0.048, 0.085, footAt.z - 0.01);
    b.spike(dewAt, [-xSign * 0.4, -0.55, 0.65], 0.026, 0.008, CLAW_BONE, {
      bone: pawBone,
      section: { ngon: 4 },
      name: `${prefix}_dewclaw`,
      group: groupName,
    });
  };

  // Build Front Legs
  for (const { side, s, chain: legF, footAt } of frontLegs) {
    const xSign = -s;
    const grp = `legF${side}`;

    // Continuous smooth-skinned muscular foreleg sweep
    b.sweep(
      legF,
      (t) => {
        if (t < 0.36) return [0.088 - t * 0.055, 0.105 - t * 0.065]; // powerful deltoid / triceps
        if (t < 0.72) return [0.064 - (t - 0.36) * 0.035, 0.072 - (t - 0.36) * 0.04]; // thick forearm
        return [0.052 + (t - 0.72) * 0.025, 0.054 + (t - 0.72) * 0.02]; // heavy wrist flare
      },
      {
        color: WOLF_COAT,
        name: `forelegSweep_${side}`,
        group: grp,
      },
    );

    // Sculpted deltoid / scapula muscle cap
    const shPos = legF.joints[0].at;
    const elbPos = legF.joints[1].at;
    b.capsule(
      [shPos.x + xSign * 0.02, shPos.y + 0.04, shPos.z + 0.02],
      lerp(shPos, elbPos, 0.68),
      [0.078, 0.052],
      WOLF_COAT,
      { bone: legF.joints[0], name: `deltoid_${side}`, group: grp },
    );

    // Swept-back Warcraft fur spikes on the back of the elbow and forearm
    for (const [fIdx, [frac, len, r0]] of [
      [0.85, 0.115, 0.028],
      [1.00, 0.135, 0.032],
    ].entries()) {
      const rootPt = lerp(shPos, elbPos, frac);
      b.sweep(
        bezier(
          rootPt,
          [rootPt.x + xSign * 0.015, rootPt.y - 0.01, rootPt.z - len * 0.55],
          [rootPt.x + xSign * 0.01, rootPt.y - 0.035, rootPt.z - len],
        ),
        [r0, 0],
        {
          bone: legF.joints[0],
          color: SILVER_HIGH,
          section: { ngon: 4 },
          caps: { start: "round", end: "point" },
          name: `elbowTuft_${side}_${fIdx}`,
          group: grp,
        },
      );
    }

    // Forearm back feathering tufts
    const wristPos = legF.joints[2].at;
    for (const [fIdx, frac] of [0.35, 0.68].entries()) {
      const rootPt = lerp(elbPos, wristPos, frac);
      b.spike(rootPt, [xSign * 0.1, -0.35, -1], 0.085, 0.022, CHARCOAL_SOCK, {
        bone: legF.joints[1],
        section: { ngon: 4 },
        name: `forearmTuft_${side}_${fIdx}`,
        group: grp,
      });
    }

    buildPaw(legF.tip!, footAt, s, `pawF_${side}`, grp);
  }

  // Build Hind Legs
  for (const { side, s, chain: legH, footAt } of hindLegs) {
    const xSign = -s;
    const grp = `legH${side}`;

    // Continuous smooth-skinned hind leg sweep (massive thigh -> muscular crus -> sturdy hock)
    b.sweep(
      legH,
      (t) => {
        if (t < 0.36) return [0.096 - t * 0.07, 0.122 - t * 0.09]; // massive haunch / thigh
        if (t < 0.72) return [0.066 - (t - 0.36) * 0.04, 0.078 - (t - 0.36) * 0.05]; // gastrocnemius / crus
        return [0.048 + (t - 0.72) * 0.02, 0.052 + (t - 0.72) * 0.015]; // metatarsal cannon
      },
      {
        color: WOLF_COAT,
        name: `hindlegSweep_${side}`,
        group: grp,
      },
    );

    // Extra haunch / biceps femoris muscle volume
    const hipPos = legH.joints[0].at;
    const kneePos = legH.joints[1].at;
    const hockPos = legH.joints[2].at;
    b.capsule(
      [hipPos.x + xSign * 0.025, hipPos.y + 0.04, hipPos.z - 0.02],
      lerp(hipPos, kneePos, 0.75),
      [0.088, 0.058],
      WOLF_COAT,
      { bone: legH.joints[0], name: `haunchMuscle_${side}`, group: grp },
    );

    // Breeching fur spikes on the rear of the thigh and hock joint
    for (const [fIdx, [frac, len]] of [
      [0.45, 0.11],
      [0.78, 0.125],
    ].entries()) {
      const rootPt = lerp(hipPos, kneePos, frac);
      b.sweep(
        bezier(
          [rootPt.x + xSign * 0.02, rootPt.y, rootPt.z - 0.04],
          [rootPt.x + xSign * 0.03, rootPt.y - 0.02, rootPt.z - 0.04 - len * 0.55],
          [rootPt.x + xSign * 0.02, rootPt.y - 0.05, rootPt.z - 0.04 - len],
        ),
        [0.030, 0],
        {
          bone: legH.joints[0],
          color: SILVER_HIGH,
          section: { ngon: 4 },
          caps: { start: "round", end: "point" },
          name: `thighTuft_${side}_${fIdx}`,
          group: grp,
        },
      );
    }

    // Sharp hock heel tuft
    b.spike(hockPos, [xSign * 0.08, -0.25, -1], 0.095, 0.025, CHARCOAL_SOCK, {
      bone: legH.joints[1],
      section: { ngon: 4 },
      name: `hockTuft_${side}`,
      group: grp,
    });

    buildPaw(legH.tip!, footAt, s, `pawH_${side}`, grp);
  }

  // ---------------------------------------------------------------------------
  // 6. Layered Surface Fur Cards (Neck Ruff, Withers, Haunches & Tail Plume)
  // ---------------------------------------------------------------------------
  const coatHits = bodySkin.scatter(220, {
    rng: rng(42),
    minDist: 0.042,
    filter: (h) => h.n.y > -0.22 && h.at.y > 0.36,
  });

  const dorsalHits = coatHits.filter((h) => h.n.y > 0.45 || h.at.z > 0.22);
  const flankHits = coatHits.filter((h) => h.n.y <= 0.45 && h.at.z <= 0.22);

  if (dorsalHits.length) {
    b.cards(dorsalHits, [FUR_TUFT_DARK, FUR_TUFT_LIGHT], {
      size: [0.058, 0.115],
      lean: 58,
      bend: 28,
      vary: 0.25,
      spin: 14,
      rng: rng(105),
      color: WOLF_COAT,
      flow: (f) => [f.at.x * 0.35, -0.18, -1],
      name: "dorsalFurCards",
      group: "furCards",
    });
  }

  if (flankHits.length) {
    b.cards(flankHits, FUR_TUFT_LIGHT, {
      size: [0.052, 0.095],
      lean: 66,
      bend: 24,
      vary: 0.22,
      spin: 12,
      rng: rng(205),
      color: WOLF_COAT,
      flow: (f) => [f.at.x * 0.25, -0.32, -1],
      name: "flankFurCards",
      group: "furCards",
    });
  }

  // Extra dense ruff cards around the neck & cheek perimeter
  const ruffRing = b.ring(frame(neck.joints[0].at, [0, 0.35, 1]), {
    count: 14,
    radius: 0.155,
    fromDeg: -135,
    toDeg: 135,
    tilt: -32,
  });
  b.cards(
    ruffRing.items.map((item) => frame(item.at, item.outward)),
    FUR_TUFT_LIGHT,
    {
      bone: neck.joints[0],
      size: [0.068, 0.135],
      lean: 48,
      bend: 26,
      vary: 0.2,
      rng: rng(305),
      color: SILVER_HIGH,
      flow: [0, -0.15, -1],
      name: "neckRuffCards",
      group: "furCards",
    },
  );

  // Tail plume cards for extra volume
  const tailSkin = b.surface(tailSweep);
  const tailHits = tailSkin.scatter(85, {
    rng: rng(88),
    minDist: 0.036,
  });
  if (tailHits.length) {
    b.cards(tailHits, [FUR_TUFT_LIGHT, FUR_TUFT_DARK], {
      size: [0.054, 0.115],
      lean: 56,
      bend: 30,
      vary: 0.25,
      spin: 16,
      rng: rng(405),
      color: TAIL_COAT,
      flow: [0, -0.25, -1],
      name: "tailFurCards",
      group: "furCards",
    });
  }

  return b.root;
}
