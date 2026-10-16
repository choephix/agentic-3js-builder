import * as THREE from "three";
import { glow } from "../../../../kits/glow";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { lerp, offset } from "../../../../src/math";
import { mix, paint, scales, stripes } from "../../../../src/paint";
import { bezier, catmull, polyline } from "../../../../src/path";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Cyborg Medic",
  description:
    "Overwatch-style support-hero cyborg medic with sleek white ceramic chassis, carbon-fiber undersuit, golden trim, articulated biometric stabilizer wings, and a glowing nanite healing staff.",
  style: "Overwatch",
  commit: "88fc1f0",
};

// -----------------------------------------------------------------------------
// Palette & Overwatch Stylized Sci-Fi Paints
// -----------------------------------------------------------------------------

const CERAMIC = "#f4f6fa";
const CERAMIC_SHADOW = "#d2dae8";
const CERAMIC_WARM = "#ede8e1";
const CARBON = "#202530";
const CARBON_DARK = "#141820";
const GUNMETAL = "#394252";
const STEEL = "#6c788e";
const SILVER = "#b4c0d4";
const GOLD = "#e5a93b";
const GOLD_BRIGHT = "#ffd166";
const GOLD_DARK = "#9e6b18";
const ORANGE = "#ff7b1c"; // Signature Overwatch accent
const TEAL_GLOW = "#28f0d2"; // Biotic healing cyan-teal
const GOLD_GLOW = "#ffe066"; // Biotic golden resonance
const CRIMSON = "#e63946"; // Medical alert / cross accent
const VISOR_DARK = "#0c1624";

// Ceramic armor paint: crisp top-down stylized gradient with recessed panel seams
const armorPaint = paint((p, n, s) => {
  const light = Math.max(0, n.y * 0.55 + n.z * 0.35 + 0.3);
  const base = mix(CERAMIC_SHADOW, CERAMIC, Math.min(1, light));
  // Subtle panel line along sweep t or world Y
  const seamT = Math.abs(((s[0] * 4) % 1) - 0.5);
  const seamY = Math.abs(((p.y * 10) % 1) - 0.5);
  if (seamT < 0.022 || seamY < 0.015) return STEEL;
  if (n.y < -0.45) return CERAMIC_SHADOW;
  return base;
});

// Secondary warm-white armor paint with orange-trimmed panel cut
const warmArmorPaint = paint((_p, n, s) => {
  if (s[0] > 0.78 && s[0] < 0.83) return ORANGE;
  const light = Math.max(0, n.y * 0.5 + n.z * 0.35 + 0.35);
  return mix(CERAMIC_SHADOW, CERAMIC_WARM, Math.min(1, light));
});

// Carbon hex-weave undersuit for cybernetic joints and abdomen
const carbonHexPaint = scales(CARBON, CARBON_DARK, {
  size: 0.026,
  width: 0.16,
  seed: 14,
});

// Ribbed artificial muscle fiber paint
const muscleFiberPaint = stripes(CARBON_DARK, GUNMETAL, {
  size: 0.016,
  axis: "y",
  width: 0.42,
  wobble: 0.04,
  seed: 9,
});

// Anodized gold metallic paint
const goldPaint = paint((_p, n) => {
  const spec = Math.max(0, n.y * 0.65 + n.z * 0.45 + 0.2);
  if (spec > 0.78) return GOLD_BRIGHT;
  if (spec < 0.28) return GOLD_DARK;
  return GOLD;
});

// Gunmetal mechanical chassis paint with subtle edge bevel shading
const mechPaint = paint((_p, n, s) => {
  if (Math.abs(s[0] - 0.5) < 0.025) return CARBON_DARK;
  return n.y > 0.3 ? STEEL : n.y < -0.35 ? CARBON_DARK : GUNMETAL;
});

// -----------------------------------------------------------------------------
// SVG Textures (Decals, Emblems, HUD & Energy Feathers)
// -----------------------------------------------------------------------------

// Medical Caduceus / Overwatch-style Support Emblem
const MED_EMBLEM = svg(
  `<svg viewBox="0 0 128 128">
    <polygon points="64,6 116,36 116,92 64,122 12,92 12,36" fill="${CARBON_DARK}" stroke="${GOLD}" stroke-width="6"/>
    <polygon points="64,16 106,41 106,87 64,112 22,87 22,41" fill="${ORANGE}"/>
    <rect x="54" y="30" width="20" height="68" rx="4" fill="#ffffff"/>
    <rect x="30" y="54" width="68" height="20" rx="4" fill="#ffffff"/>
    <circle cx="64" cy="64" r="7" fill="${TEAL_GLOW}"/>
  </svg>`,
  { size: 256 },
);

// Biotic telemetry HUD screen for chest & forearm
const HUD_TEX = svg(
  `<svg viewBox="0 0 128 64">
    <rect x="2" y="2" width="124" height="60" rx="10" fill="#071821" stroke="${TEAL_GLOW}" stroke-width="4"/>
    <path d="M 10 36 L 30 36 L 38 16 L 47 50 L 56 24 L 64 40 L 74 36 L 118 36" stroke="${TEAL_GLOW}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="98" cy="20" r="6" fill="${GOLD_GLOW}"/>
    <rect x="14" y="12" width="20" height="6" rx="2" fill="${ORANGE}"/>
    <rect x="14" y="48" width="44" height="5" rx="2" fill="${TEAL_GLOW}"/>
  </svg>`,
  { size: 256 },
);

// Cybernetic optical visor graphics
const VISOR_TEX = svg(
  `<svg viewBox="0 0 256 96">
    <rect x="0" y="0" width="256" height="96" rx="24" fill="${VISOR_DARK}"/>
    <path d="M 16 48 Q 128 74 240 48" stroke="${TEAL_GLOW}" stroke-width="7" fill="none"/>
    <path d="M 38 32 Q 128 52 218 32" stroke="${GOLD_GLOW}" stroke-width="4" fill="none"/>
    <polygon points="74,46 92,38 96,52 78,56" fill="#ffffff"/>
    <polygon points="182,46 164,38 160,52 178,56" fill="#ffffff"/>
    <circle cx="128" cy="26" r="6" fill="${ORANGE}"/>
  </svg>`,
  { size: 256 },
);

// Hard-light biotic feather card texture for wings and staff aura
const ENERGY_FEATHER = svg(
  `<svg viewBox="0 0 64 256">
    <polygon points="32,4 58,44 50,216 32,252 14,216 6,44" fill="${GOLD_GLOW}"/>
    <polygon points="32,18 46,52 40,204 32,238 24,204 18,52" fill="#ffffff"/>
    <line x1="32" y1="12" x2="32" y2="242" stroke="${ORANGE}" stroke-width="4"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "cyborgMedic", detail: 1, paintSize: 1024 });

  // ---------------------------------------------------------------------------
  // 1. SKELETON (Full Humanoid + Cybernetic Wings + Coat Tails + Healing Staff)
  // ---------------------------------------------------------------------------
  // Standing about 1.82 m tall (+ halo & wing tips reaching ~2.05 m), feet planted on y = 0

  const pelvis = b.joint("pelvis", {
    at: [0, 0.98, 0],
    dir: [0, 1, 0],
    role: "spine",
    group: "torso",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.98, 0],
      [0, 1.13, -0.015],
      [0, 1.29, 0.01],
      [0, 1.45, 0.0],
    ]),
    {
      parent: pelvis,
      names: ["waist", "chest", "thorax"],
      role: "spine",
      group: "torso",
    },
  );
  const [waist, chest, thorax] = spine.joints;

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.45, 0.0],
      [0, 1.52, 0.012],
      [0, 1.58, 0.02],
    ]),
    {
      parent: thorax,
      names: ["neckBase", "neckTop"],
      role: "neck",
      group: "head",
    },
  );
  const [neckBase, neckTop] = neck.joints;

  const head = b.joint("head", {
    parent: neckTop,
    at: [0, 1.58, 0.02],
    dir: [0, 0.08, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.55, 0.055],
    dir: [0, -0.22, 1],
    role: "jaw",
    group: "head",
  });

  // Articulated cybernetic stabilizer wings on the back
  const wingMountL = b.joint("wingMountL", {
    parent: chest,
    at: [0.09, 1.37, -0.13],
    dir: [0.75, 0.55, -0.35],
    role: "wing",
    group: "wings",
  });
  const wingTipL = b.joint("wingTipL", {
    parent: wingMountL,
    at: [0.34, 1.56, -0.22],
    dir: [0.85, 0.35, -0.25],
    role: "wing",
    group: "wings",
  });

  const wingMountR = b.joint("wingMountR", {
    parent: chest,
    at: [-0.09, 1.37, -0.13],
    dir: [-0.75, 0.55, -0.35],
    role: "wing",
    group: "wings",
  });
  const wingTipR = b.joint("wingTipR", {
    parent: wingMountR,
    at: [-0.34, 1.56, -0.22],
    dir: [-0.85, 0.35, -0.25],
    role: "wing",
    group: "wings",
  });

  // Armored medical coat tails / tassets
  const coatBackL = b.chain(
    "coatL",
    catmull([
      [0.11, 0.96, -0.07],
      [0.16, 0.72, -0.11],
      [0.19, 0.45, -0.14],
    ]),
    {
      parent: pelvis,
      names: ["coatHipL", "coatMidL", "coatTipL"],
      role: "tail",
      group: "coat",
    },
  );
  const coatBackR = b.chain(
    "coatR",
    catmull([
      [-0.11, 0.96, -0.07],
      [-0.16, 0.72, -0.11],
      [-0.19, 0.45, -0.14],
    ]),
    {
      parent: pelvis,
      names: ["coatHipR", "coatMidR", "coatTipR"],
      role: "tail",
      group: "coat",
    },
  );
  const tassetFrontL = b.joint("tassetFrontL", {
    parent: pelvis,
    at: [0.145, 0.96, 0.05],
    dir: [0.22, -1, 0.12],
    role: "hinge",
    group: "coat",
  });
  const tassetFrontR = b.joint("tassetFrontR", {
    parent: pelvis,
    at: [-0.145, 0.96, 0.05],
    dir: [-0.22, -1, 0.12],
    role: "hinge",
    group: "coat",
  });

  // Left and Right Legs via IK (planted cleanly on y = 0)
  const legChains: Record<"L" | "R", ReturnType<typeof b.chain>> = {} as never;
  const toeJoints: Record<"L" | "R", ReturnType<typeof b.joint>> = {} as never;

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const hipPos: [number, number, number] = [s * 0.115, 0.94, 0.0];
    const anklePos: [number, number, number] = [s * 0.145, 0.085, -0.01];
    const pts = limb(hipPos, anklePos, [0.44, 0.43], [s * 0.06, 0, 1]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: pelvis,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.145, 0, 0.05],
      group: `leg${side}`,
    });
    legChains[side] = leg;

    toeJoints[side] = b.joint(`toe${side}`, {
      parent: leg.tip!,
      at: [s * 0.145, 0.032, 0.09],
      dir: [0, 0, 1],
      role: "digit",
      group: `leg${side}`,
    });
  }

  // Left and Right Arms via IK
  // Right arm (s = -1) holds the vertical healing staff planted on the floor at x = -0.38, z = 0.22
  // Left arm (s = +1) extends gracefully to the side in a heroic rest pose with biotic emitter
  const clavicles: Record<"L" | "R", ReturnType<typeof b.joint>> = {} as never;
  const armChains: Record<"L" | "R", ReturnType<typeof b.chain>> = {} as never;
  const fingerJoints: Record<"L" | "R", ReturnType<typeof b.joint>[]> = { L: [], R: [] };

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const clav = b.joint(`clavicle${side}`, {
      parent: thorax,
      at: [s * 0.065, 1.42, 0.0],
      dir: [s, 0.08, 0],
      role: "arm",
      group: `arm${side}`,
    });
    clavicles[side] = clav;

    const shoulderPos: [number, number, number] = [s * 0.185, 1.41, -0.01];
    const wristPos: [number, number, number] =
      s > 0
        ? [0.46, 1.02, 0.15] // Left hand poised out & slightly forward
        : [-0.38, 1.12, 0.22]; // Right hand gripping the planted healing staff

    const bendDir: [number, number, number] = s > 0 ? [0.35, -0.2, -0.9] : [-0.45, -0.25, -0.85];
    const armPts = limb(shoulderPos, wristPos, [0.28, 0.26], bendDir);

    const arm = b.chain(`arm${side}`, armPts, {
      parent: clav,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
      group: `arm${side}`,
    });
    armChains[side] = arm;

    // Articulated cybernetic fingers (thumb + index + middle + ring)
    const wrist = arm.tip!;
    const thumb = b.joint(`thumb${side}`, {
      parent: wrist,
      at: offset(wrist.at, [s * 0.4, -0.2, 0.85], 0.038),
      dir: [s * 0.35, -0.35, 0.85],
      role: "digit",
      group: `arm${side}`,
    });
    const indexF = b.joint(`index${side}`, {
      parent: wrist,
      at: offset(wrist.at, [s * 0.55, -0.7, 0.45], 0.055),
      dir: s > 0 ? [0.45, -0.8, 0.35] : [0.3, -0.2, 0.9],
      role: "digit",
      group: `arm${side}`,
    });
    const middleF = b.joint(`middle${side}`, {
      parent: wrist,
      at: offset(wrist.at, [s * 0.6, -0.75, 0.1], 0.058),
      dir: s > 0 ? [0.45, -0.85, 0.1] : [0.35, -0.2, 0.85],
      role: "digit",
      group: `arm${side}`,
    });
    const ringF = b.joint(`ring${side}`, {
      parent: wrist,
      at: offset(wrist.at, [s * 0.55, -0.75, -0.25], 0.052),
      dir: s > 0 ? [0.4, -0.85, -0.2] : [0.35, -0.2, 0.8],
      role: "digit",
      group: `arm${side}`,
    });
    fingerJoints[side].push(thumb, indexF, middleF, ringF);
  }

  // Healing Staff Joints (parented to right hand wristR, planted on floor y = 0 at [-0.38, 0, 0.22])
  const staffX = -0.38;
  const staffZ = 0.22;
  const staffGrip = b.joint("staffGrip", {
    parent: armChains.R.tip!,
    at: [staffX, 1.12, staffZ],
    dir: [0, 1, 0],
    role: "hinge",
    group: "staff",
  });
  const staffHead = b.joint("staffHead", {
    parent: staffGrip,
    at: [staffX, 1.62, staffZ],
    dir: [0, 1, 0],
    role: "hinge",
    group: "staff",
  });
  const staffCore = b.joint("staffCore", {
    parent: staffHead,
    at: [staffX, 1.77, staffZ],
    dir: [0, 1, 0],
    role: "hinge",
    group: "staff",
  });
  const staffProngL = b.joint("staffProngL", {
    parent: staffHead,
    at: [staffX + 0.045, 1.65, staffZ],
    dir: [0.45, 0.9, 0],
    role: "hinge",
    group: "staff",
  });
  const staffProngR = b.joint("staffProngR", {
    parent: staffHead,
    at: [staffX - 0.045, 1.65, staffZ],
    dir: [-0.45, 0.9, 0],
    role: "hinge",
    group: "staff",
  });

  // ---------------------------------------------------------------------------
  // 2. TORSO, PELVIS & CYBERNETIC SPINE CHASSIS
  // ---------------------------------------------------------------------------

  // Core carbon-fiber abdomen & ribcage loft (smoothly skinned across spine)
  const coreLoft = b.loft(
    [
      { at: [0, 0.92, 0.0], w: 0.25, h: 0.18 },
      { at: [0, 1.03, -0.005], w: 0.21, h: 0.155 },
      { at: [0, 1.16, -0.01], w: 0.195, h: 0.15 },
      { at: [0, 1.31, 0.015], w: 0.29, h: 0.21 },
      { at: [0, 1.44, 0.0], w: 0.31, h: 0.19 },
      { at: [0, 1.49, -0.005], w: 0.15, h: 0.13 },
    ],
    {
      bone: [pelvis, spine],
      color: carbonHexPaint,
      group: "torso",
      name: "coreUndersuit",
    },
  );

  // Pelvis armored codpiece & hip chassis
  b.frustumBox([0, 0.89, 0.01], [0, 1.01, 0.015], [0.22, 0.16], [0.28, 0.2], {
    bone: pelvis,
    color: armorPaint,
    group: "torso",
    name: "pelvisArmor",
  });
  // Front pelvic bevel plate with orange trim
  b.extrude(
    [
      [-0.065, -0.08],
      [0.065, -0.08],
      [0.095, 0.05],
      [0, 0.085, "sharp"],
      [-0.095, 0.05],
    ],
    {
      at: [0, 0.95, 0.095],
      x: [1, 0, 0],
      y: [0, 1, 0.15],
      thickness: 0.035,
      bevel: 0.008,
      smoothing: 1,
      bone: pelvis,
      color: warmArmorPaint,
      group: "torso",
      name: "codpiecePlate",
    },
  );
  // Utility belt around waist
  const waistLoop = b.surface(coreLoft).loop( frame([0, 1.01, 0], [0, 1, 0]), { lift: 0.012 });
  b.sweep(waistLoop, [0.022, 0.016], {
    bone: pelvis,
    color: mechPaint,
    section: "box",
    group: "torso",
    name: "utilityBelt",
  });
  // Glowing belt buckle
  b.part(new THREE.BoxGeometry(0.085, 0.052, 0.032), GOLD, {
    bone: pelvis,
    at: [0, 1.01, 0.102],
    flat: true,
    group: "torso",
    name: "beltBuckleFrame",
  });
  glow(
    b.part(new THREE.BoxGeometry(0.052, 0.026, 0.036), TEAL_GLOW, {
      bone: pelvis,
      at: [0, 1.01, 0.105],
      group: "torso",
      name: "beltBuckleGlow",
    }),
    1.5,
  );

  // Side hip nanite canisters on utility belt
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const canPos: [number, number, number] = [s * 0.155, 0.99, -0.02];
    b.rod(
      [canPos[0], canPos[1] + 0.055, canPos[2] - 0.01],
      [canPos[0], canPos[1] - 0.055, canPos[2] + 0.01],
      0.028,
      {
        bone: pelvis,
        color: GUNMETAL,
        sides: 8,
        group: "torso",
        name: `hipCanisterMount${side}`,
      },
    );
    glow(
      b.rod(
        [canPos[0] + s * 0.006, canPos[1] + 0.04, canPos[2] - 0.005],
        [canPos[0] + s * 0.006, canPos[1] - 0.04, canPos[2] + 0.005],
        0.024,
        {
          bone: pelvis,
          color: s > 0 ? TEAL_GLOW : GOLD_GLOW,
          sides: 8,
          group: "torso",
          name: `hipCanisterVial${side}`,
        },
      ),
      1.4,
    );
  }

  // Exposed cybernetic abdominal hydraulic pistons (left and right of waist)
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.rod([s * 0.088, 1.03, 0.04], [s * 0.105, 1.24, 0.055], 0.014, {
      bone: waist,
      color: SILVER,
      sides: 6,
      group: "torso",
      name: `abPistonUpper${side}`,
    });
    b.rod([s * 0.088, 1.02, 0.04], [s * 0.096, 1.13, 0.048], 0.02, {
      bone: waist,
      color: GUNMETAL,
      sides: 6,
      group: "torso",
      name: `abPistonSleeve${side}`,
    });
    // Ribcage glowing gill vents
    for (let r = 0; r < 3; r++) {
      const ry = 1.09 + r * 0.042;
      glow(
        b.rod([s * 0.045, ry, 0.075], [s * 0.095, ry + 0.012, 0.052], 0.006, {
          bone: waist,
          color: TEAL_GLOW,
          sides: 5,
          group: "torso",
          name: `ribVent${side}${r}`,
        }),
        1.3,
      );
    }
  }

  // Heroic Overwatch Chest Cuirass (sculpted multi-panel ceramic plates)
  b.frustumBox([0, 1.21, 0.015], [0, 1.43, 0.025], [0.25, 0.18], [0.34, 0.24], {
    bone: chest,
    color: armorPaint,
    group: "torso",
    name: "chestMainBlock",
  });

  // Left and Right angled breastplate wings
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.extrude(
      [
        [0.02, -0.09],
        [0.165, -0.05],
        [0.185, 0.08],
        [0.09, 0.125],
        [0.015, 0.09],
      ],
      {
        at: [0, 1.33, 0.105],
        x: [s, 0, -0.22],
        y: [0, 1, -0.12],
        thickness: 0.042,
        bevel: 0.01,
        smoothing: 1,
        bone: chest,
        color: warmArmorPaint,
        group: "torso",
        name: `chestPlate${side}`,
      },
    );
    // Golden collar clavicular trim
    b.sweep(
      bezier(
        [s * 0.03, 1.42, 0.11],
        [s * 0.1, 1.45, 0.08],
        [s * 0.17, 1.44, 0.0],
      ),
      0.014,
      {
        bone: thorax,
        color: goldPaint,
        sides: 6,
        group: "torso",
        name: `collarGoldTrim${side}`,
      },
    );
  }

  // Central Sternum Arc-Reactor / Biotic Heart Core
  b.lathe(
    [
      [0, 0],
      [0.056, 0],
      [0.062, 0.018],
      [0.046, 0.032],
      [0.032, 0.032],
      [0.032, 0.01],
      [0, 0.01],
    ],
    {
      at: [0, 1.33, 0.115],
      axis: [0, 0.12, 1],
      segments: 12,
      bone: chest,
      color: goldPaint,
      group: "torso",
      name: "sternumReactorBezel",
    },
  );
  glow(
    b.part(new THREE.SphereGeometry(0.033, 10, 8), TEAL_GLOW, {
      bone: chest,
      at: [0, 1.332, 0.132],
      scale: [1, 1, 0.55],
      group: "torso",
      name: "sternumReactorCore",
    }),
    1.8,
  );

  // Chest medical telemetry HUD plate below reactor
  b.part(new THREE.PlaneGeometry(0.086, 0.042), "#ffffff", {
    bone: chest,
    at: [0, 1.24, 0.122],
    dir: [0, -0.15, 1],
    axis: "z",
    texture: HUD_TEX,
    group: "torso",
    name: "chestHudScreen",
  });

  // High Armored Tech Collar around neck
  const collarPath = arc([0, 1.47, -0.005], [0.105, 1.47, 0.04], [0, 1, 0], 230);
  b.sweep(collarPath, [0.022, 0.042], {
    bone: thorax,
    color: armorPaint,
    section: "box",
    group: "torso",
    name: "highCollar",
  });

  // Cybernetic Dorsal Spine Vertebrae & Backpack Biotic Generator
  b.along(
    catmull([
      [0, 0.98, -0.095],
      [0, 1.15, -0.105],
      [0, 1.32, -0.12],
      [0, 1.46, -0.095],
    ]),
    7,
    (pt) => {
      b.part(new THREE.BoxGeometry(0.052, 0.034, 0.042), GUNMETAL, {
        frame: pt,
        flat: true,
        group: "torso",
      });
      glow(
        b.part(new THREE.BoxGeometry(0.024, 0.012, 0.048), TEAL_GLOW, {
          frame: pt.moved([0, 0.005, 0]),
          group: "torso",
        }),
        1.4,
      );
    },
  );

  // Dorsal Biotic Jetpack / Wing Hub
  b.frustumBox([0, 1.26, -0.15], [0, 1.44, -0.12], [0.16, 0.12], [0.22, 0.14], {
    bone: chest,
    color: armorPaint,
    group: "torso",
    name: "backpackHub",
  });
  // Twin vertical nanite reservoirs on backpack
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.capsule([s * 0.068, 1.22, -0.165], [s * 0.075, 1.42, -0.16], 0.028, {
      bone: chest,
      color: GUNMETAL,
      sides: 8,
      group: "torso",
      name: `backTankCap${side}`,
    });
    glow(
      b.rod([s * 0.068, 1.25, -0.168], [s * 0.075, 1.39, -0.163], 0.023, {
        bone: chest,
        color: GOLD_GLOW,
        sides: 8,
        group: "torso",
        name: `backTankCore${side}`,
      }),
      1.5,
    );
  }

  // ---------------------------------------------------------------------------
  // 3. ARTICULATED BIOTIC STABILIZER WINGS (Dorsal Hero Silhouette)
  // ---------------------------------------------------------------------------

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const wMount = s > 0 ? wingMountL : wingMountR;
    const wTip = s > 0 ? wingTipL : wingTipR;

    // Wing root mechanical hinge drum
    b.part(new THREE.CylinderGeometry(0.038, 0.038, 0.048, 10), goldPaint, {
      bone: wMount,
      at: wMount.at,
      dir: [0, 0, 1],
      group: "wings",
      name: `wingHinge${side}`,
    });

    // Primary upper wing spar
    b.sweep(
      bezier(
        wMount.at,
        [s * 0.21, 1.5, -0.18],
        wTip.at,
      ),
      [0.032, 0.02],
      {
        bone: wMount,
        color: armorPaint,
        section: "box",
        group: "wings",
        name: `wingUpperSpar${side}`,
      },
    );

    // Outer wing blade housing on wingTip joint
    const tipEnd: [number, number, number] = [s * 0.62, 1.72, -0.3];
    b.sweep(
      bezier(
        wTip.at,
        [s * 0.48, 1.66, -0.26],
        tipEnd,
      ),
      [0.026, 0.012],
      {
        bone: wTip,
        color: warmArmorPaint,
        section: "box",
        group: "wings",
        name: `wingOuterSpar${side}`,
      },
    );

    // Golden leading-edge trim along wing
    b.rod(wMount.at, wTip.at, 0.011, {
      bone: wMount,
      color: goldPaint,
      sides: 6,
      group: "wings",
      name: `wingGoldEdgeInner${side}`,
    });
    b.rod(wTip.at, tipEnd, 0.009, {
      bone: wTip,
      color: goldPaint,
      sides: 6,
      group: "wings",
      name: `wingGoldEdgeOuter${side}`,
    });

    // Glowing Hard-Light Biotic Feathers (5 individual sculpted blades fanning down)
    const featherOrigins = [
      lerp(wMount.at, wTip.at, 0.45),
      lerp(wMount.at, wTip.at, 0.82),
      lerp(wTip.at, tipEnd, 0.25),
      lerp(wTip.at, tipEnd, 0.58),
      lerp(wTip.at, tipEnd, 0.9),
    ];
    featherOrigins.forEach((orig, idx) => {
      const fLen = 0.28 + idx * 0.035 - (idx === 4 ? 0.06 : 0);
      const fDir: [number, number, number] = [
        s * (0.28 + idx * 0.12),
        -0.88 + idx * 0.08,
        -0.25,
      ];
      const fTip = offset(orig, fDir, fLen);
      const ownerBone = idx < 2 ? wMount : wTip;

      // Emitter socket
      b.rod(orig, offset(orig, fDir, 0.045), [0.014, 0.01], {
        bone: ownerBone,
        color: GUNMETAL,
        sides: 6,
        group: "wings",
        name: `wingFeatherSocket${side}${idx}`,
      });
      // Glowing golden-cyan hard-light blade
      glow(
        b.sweep([offset(orig, fDir, 0.035), fTip], (t) => [0.006 * (1 - t * 0.6), 0.026 * Math.sin(t * Math.PI * 0.85 + 0.2)], {
          bone: ownerBone,
          color: idx % 2 === 0 ? GOLD_GLOW : TEAL_GLOW,
          section: { ngon: 4 },
          caps: "point",
          group: "wings",
          name: `wingEnergyBlade${side}${idx}`,
        }),
        1.6,
      );
    });
  }

  // ---------------------------------------------------------------------------
  // 4. ARMORED MEDICAL COAT TAILS & TASSETS
  // ---------------------------------------------------------------------------

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const coatChain = s > 0 ? coatBackL : coatBackR;
    const tassetJ = s > 0 ? tassetFrontL : tassetFrontR;

    // Swept multi-bone back coat tail (white ceramic exterior with orange hem & gold trim)
    b.sweep(
      coatChain,
      (t) => [0.085 + 0.035 * t, 0.014 * (1 - 0.3 * t)],
      {
        color: warmArmorPaint,
        section: "box",
        up: [s * 0.25, 0, -1],
        group: "coat",
        name: `coatPanel${side}`,
      },
    );
    // Gold edge piping on coat tail
    b.sweep(
      coatChain,
      0.008,
      {
        color: goldPaint,
        sides: 6,
        shift: [s * 0.095, 0],
        group: "coat",
        name: `coatGoldTrim${side}`,
      },
    );

    // Front hip armor tasset plate with medical emblem decal
    const tassetPlate = b.extrude(
      [
        [-0.055, 0.02],
        [0.055, 0.02],
        [0.07, -0.18],
        [0, -0.25, "sharp"],
        [-0.07, -0.18],
      ],
      {
        at: tassetJ.at,
        x: [0.85, 0, -s * 0.5],
        y: [s * 0.18, 0.96, 0.12],
        thickness: 0.022,
        bevel: 0.006,
        smoothing: 1,
        bone: tassetJ,
        color: armorPaint,
        group: "coat",
        name: `tassetPlate${side}`,
      },
    );
    b.decal(tassetPlate, MED_EMBLEM, {
      at: [s * 0.175, 0.85, 0.08],
      dir: [s * 0.5, 0.1, 0.85],
      size: [0.075, 0.075],
      bone: tassetJ,
      group: "coat",
      name: `tassetEmblem${side}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 5. CYBERNETIC HEAD, VISOR, ANTENNAE & BIOTIC HALO
  // ---------------------------------------------------------------------------

  // Sculpted cybernetic neck column with artificial muscle cables
  b.sweep(neck, [0.052, 0.046], {
    color: muscleFiberPaint,
    sides: 10,
    group: "head",
    name: "neckColumn",
  });
  for (const s of [1, -1] as const) {
    b.rod(
      [s * 0.036, 1.45, 0.02],
      [s * 0.028, 1.57, 0.038],
      0.009,
      {
        bone: neckBase,
        color: SILVER,
        sides: 6,
        group: "head",
        name: `neckTendon${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // Cranium dome (sleek white ceramic helmet shell)
  const skull = b.part(new THREE.SphereGeometry(0.105, 14, 12), armorPaint, {
    bone: head,
    at: [0, 1.665, 0.015],
    scale: [0.92, 1.06, 1.08],
    group: "head",
    name: "craniumDome",
  });

  // Lower faceplate & articulated jaw chin guard
  b.extrude(
    [
      [-0.056, 0.028],
      [0.056, 0.028],
      [0.042, -0.038],
      [0, -0.052, "sharp"],
      [-0.042, -0.038],
    ],
    {
      at: [0, 1.59, 0.095],
      x: [1, 0, 0],
      y: [0, 0.96, 0.28],
      thickness: 0.048,
      bevel: 0.009,
      smoothing: 1,
      bone: jaw,
      color: CERAMIC_WARM,
      group: "head",
      name: "jawFaceplate",
    },
  );
  // Metallic chin respirator grille
  b.part(new THREE.BoxGeometry(0.036, 0.022, 0.025), GUNMETAL, {
    bone: jaw,
    at: [0, 1.552, 0.112],
    flat: true,
    group: "head",
    name: "chinVent",
  });

  // Curved wrap-around panoramic visor
  const visorArc = arc([0, 1.655, 0.02], [0.088, 1.655, 0.062], [0, 1, 0], -104);
  b.sweep(visorArc, [0.016, 0.03], {
    bone: head,
    color: VISOR_DARK,
    section: "box",
    group: "head",
    name: "visorShield",
  });
  // Glowing visor telemetry decal on cranium/visor front
  glow(
    b.decal(skull, VISOR_TEX, {
      at: [0, 1.655, 0.125],
      dir: [0, 0, 1],
      size: [0.15, 0.056],
      bone: head,
      group: "head",
      name: "visorHudDecal",
    }),
    1.6,
  );

  // Forehead golden Valkyrie / Medic diadem crest
  b.extrude(
    [
      [-0.055, -0.015],
      [0, 0.012, "sharp"],
      [0.055, -0.015],
      [0.072, 0.032],
      [0, 0.075, "sharp"],
      [-0.072, 0.032],
    ],
    {
      at: [0, 1.705, 0.105],
      x: [1, 0, 0],
      y: [0, 0.88, -0.45],
      thickness: 0.02,
      bevel: 0.005,
      smoothing: 1,
      bone: head,
      color: goldPaint,
      group: "head",
      name: "foreheadCrest",
    },
  );
  // Glowing forehead jewel
  glow(
    b.part(new THREE.OctahedronGeometry(0.016, 0), TEAL_GLOW, {
      bone: head,
      at: [0, 1.72, 0.112],
      scale: [0.8, 1.3, 0.6],
      group: "head",
      name: "foreheadGem",
    }),
    1.8,
  );

  // Side ear comms pods & swept-back Valkyrie sensor fins
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const earPos: [number, number, number] = [s * 0.095, 1.65, 0.005];
    b.part(new THREE.CylinderGeometry(0.032, 0.028, 0.024, 10), GUNMETAL, {
      bone: head,
      at: earPos,
      dir: [s, 0, 0],
      group: "head",
      name: `earPod${side}`,
    });
    glow(
      b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.028, 8), TEAL_GLOW, {
        bone: head,
        at: earPos,
        dir: [s, 0, 0],
        group: "head",
        name: `earNode${side}`,
      }),
      1.5,
    );
    // Swept-back ear antenna winglet
    b.extrude(
      [
        [0, -0.02],
        [0.13, 0.04],
        [0.16, 0.095, "sharp"],
        [0.03, 0.055],
      ],
      {
        at: [s * 0.098, 1.655, 0.01],
        x: [s * 0.15, 0.25, -0.95],
        y: [s * 0.2, 0.96, 0.2],
        thickness: 0.012,
        bevel: 0.004,
        smoothing: 1,
        bone: head,
        color: warmArmorPaint,
        group: "head",
        name: `headWinglet${side}`,
      },
    );
  }

  // Floating/Mounted Biotic Halo Crown behind head
  b.rod([0, 1.72, -0.075], [0, 1.81, -0.105], 0.009, {
    bone: head,
    color: goldPaint,
    sides: 6,
    group: "head",
    name: "haloSupportPost",
  });
  const haloLoop = arc(
    [0, 1.83, -0.03],
    [0, 1.81, -0.125],
    [0, 0.92, 0.38],
    360,
  );
  glow(
    b.sweep(haloLoop, [0.011, 0.006], {
      bone: head,
      color: GOLD_GLOW,
      section: { ngon: 4 },
      group: "head",
      name: "bioticHaloRing",
    }),
    1.8,
  );

  // ---------------------------------------------------------------------------
  // 6. CYBERNETIC ARMS, PAULDRONS & GAUNTLETS
  // ---------------------------------------------------------------------------

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const arm = armChains[side];
    const [shoulder, elbow, wrist] = arm.joints;

    // Underlying carbon-fiber arm conduit
    b.sweep(arm, (t) => 0.042 * (1 - 0.22 * t), {
      color: carbonHexPaint,
      sides: 8,
      group: `arm${side}`,
      name: `armConduit${side}`,
    });

    //Layered Overwatch Shoulder Pauldron
    const pauldronPos = offset(shoulder.at, [s * 0.6, 0.65, 0], 0.025);
    b.extrude(
      [
        [-0.075, -0.055],
        [0.075, -0.055],
        [0.095, 0.04],
        [0, 0.085, "sharp"],
        [-0.095, 0.04],
      ],
      {
        at: pauldronPos,
        x: [0, 0, 1],
        y: [s * 0.68, 0.73, 0],
        thickness: 0.048,
        bevel: 0.012,
        smoothing: 1,
        bone: shoulder,
        color: warmArmorPaint,
        group: `arm${side}`,
        name: `pauldronMain${side}`,
      },
    );
    // Gold pauldron rim & medical cross decal
    b.part(new THREE.SphereGeometry(0.062, 10, 8), goldPaint, {
      bone: shoulder,
      at: offset(shoulder.at, [s * 0.8, 0.3, 0], 0.015),
      scale: [1.1, 0.85, 1.15],
      group: `arm${side}`,
      name: `pauldronInnerCup${side}`,
    });

    // Sculpted Bicep Armor Shell
    const bicepStart = lerp(shoulder.at, elbow.at, 0.18);
    const bicepEnd = lerp(shoulder.at, elbow.at, 0.84);
    b.capsule(bicepStart, bicepEnd, [0.054, 0.046], {
      bone: shoulder,
      color: armorPaint,
      sides: 8,
      group: `arm${side}`,
      name: `bicepArmor${side}`,
    });

    // Mechanical Elbow Rotary Servo
    b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.056, 10), GUNMETAL, {
      bone: elbow,
      at: elbow.at,
      dir: [1, 0, 0.3],
      group: `arm${side}`,
      name: `elbowServo${side}`,
    });
    glow(
      b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.062, 8), TEAL_GLOW, {
        bone: elbow,
        at: elbow.at,
        dir: [1, 0, 0.3],
        group: `arm${side}`,
        name: `elbowNode${side}`,
      }),
      1.4,
    );

    // Sleek Forearm Vambrace / Gauntlet
    const foreStart = lerp(elbow.at, wrist.at, 0.14);
    const foreEnd = lerp(elbow.at, wrist.at, 0.92);
    b.frustumBox(foreStart, foreEnd, [0.095, 0.088], [0.072, 0.068], {
      bone: elbow,
      color: armorPaint,
      group: `arm${side}`,
      name: `forearmGauntlet${side}`,
    });
    // Forearm golden dorsal fin & biotic vial
    const gauntletMid = lerp(elbow.at, wrist.at, 0.54);
    glow(
      b.capsule(
        offset(foreStart, [s * 0.9, 0.3, 0], 0.044),
        offset(foreEnd, [s * 0.9, 0.3, 0], 0.036),
        0.012,
        {
          bone: elbow,
          color: s > 0 ? TEAL_GLOW : GOLD_GLOW,
          sides: 6,
          group: `arm${side}`,
          name: `gauntletTube${side}`,
        },
      ),
      1.6,
    );

    // Left forearm gets a holographic projector emitter
    if (s > 0) {
      b.part(new THREE.CylinderGeometry(0.026, 0.032, 0.022, 8), goldPaint, {
        bone: elbow,
        at: offset(gauntletMid, [0.4, 0.8, 0.4], 0.048),
        dir: [0.4, 0.8, 0.4],
        group: "armL",
        name: "holoEmitterBaseL",
      });
      glow(
        b.part(new THREE.OctahedronGeometry(0.024, 0), TEAL_GLOW, {
          bone: elbow,
          at: offset(gauntletMid, [0.4, 0.8, 0.4], 0.082),
          group: "armL",
          name: "holoEmitterCrystalL",
        }),
        1.8,
      );
    }

    // Cybernetic Hand Palm & Articulated Fingers
    const palmCenter = offset(wrist.at, [s * 0.35, -0.7, 0.25], 0.028);
    b.part(new THREE.BoxGeometry(0.036, 0.058, 0.052), CERAMIC, {
      bone: wrist,
      at: palmCenter,
      dir: [s * 0.4, -0.8, 0.25],
      flat: true,
      group: `arm${side}`,
      name: `handPalm${side}`,
    });
    glow(
      b.part(new THREE.SphereGeometry(0.014, 6, 6), TEAL_GLOW, {
        bone: wrist,
        at: offset(palmCenter, [-s * 0.8, -0.2, 0.5], 0.016),
        group: `arm${side}`,
        name: `palmEmitter${side}`,
      }),
      1.5,
    );

    fingerJoints[side].forEach((fJoint, fIdx) => {
      const fLen = fIdx === 0 ? 0.038 : 0.048;
      const tip = offset(fJoint.at, fJoint.axis, fLen);
      b.capsule(fJoint.at, tip, [0.009, 0.0065], {
        bone: fJoint,
        color: fIdx === 0 ? goldPaint : GUNMETAL,
        sides: 6,
        group: `arm${side}`,
        name: `fingerSeg${side}${fIdx}`,
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 7. CYBERNETIC LEGS, THIGH PLATES, KNEE SERVOS & JUMP-JET BOOTS
  // ---------------------------------------------------------------------------

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const leg = legChains[side];
    const [hip, knee, ankle] = leg.joints;
    const toe = toeJoints[side];

    // Underlying carbon-fiber leg frame
    b.sweep(leg, (t) => 0.062 * (1 - 0.3 * t), {
      color: carbonHexPaint,
      sides: 10,
      group: `leg${side}`,
      name: `legCore${side}`,
    });

    // Sculpted Upper Thigh Armor Cuirass (Overwatch silhouette: tapered top-heavy thigh)
    const thighTop = lerp(hip.at, knee.at, 0.08);
    const thighBot = lerp(hip.at, knee.at, 0.85);
    b.frustumBox(thighBot, thighTop, [0.115, 0.125], [0.155, 0.165], {
      bone: hip,
      color: armorPaint,
      group: `leg${side}`,
      name: `thighArmor${side}`,
    });
    // Outer thigh orange/gold accent fin
    b.extrude(
      [
        [-0.04, -0.14],
        [0.04, -0.12],
        [0.055, 0.12],
        [-0.035, 0.15],
      ],
      {
        at: offset(lerp(hip.at, knee.at, 0.45), [s, 0, 0.15], 0.072),
        x: [0, 0, 1],
        y: [-s * 0.08, 1, 0],
        thickness: 0.024,
        bevel: 0.006,
        smoothing: 1,
        bone: hip,
        color: warmArmorPaint,
        group: `leg${side}`,
        name: `thighSidePlate${side}`,
      },
    );

    // Articulated Knee Guard & Hydraulic Drum
    b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.078, 10), GUNMETAL, {
      bone: knee,
      at: knee.at,
      dir: [1, 0, 0],
      group: `leg${side}`,
      name: `kneeDrum${side}`,
    });
    b.extrude(
      [
        [-0.048, -0.055],
        [0.048, -0.055],
        [0.06, 0.035],
        [0, 0.078, "sharp"],
        [-0.06, 0.035],
      ],
      {
        at: offset(knee.at, [0, 0.1, 1], 0.062),
        x: [1, 0, 0],
        y: [0, 0.96, -0.25],
        thickness: 0.032,
        bevel: 0.008,
        smoothing: 1,
        bone: knee,
        color: goldPaint,
        group: `leg${side}`,
        name: `kneeCapShield${side}`,
      },
    );
    glow(
      b.part(new THREE.SphereGeometry(0.016, 8, 6), TEAL_GLOW, {
        bone: knee,
        at: offset(knee.at, [0, 0.15, 1], 0.078),
        group: `leg${side}`,
        name: `kneeGlowNode${side}`,
      }),
      1.5,
    );

    // Lower Leg / Greave Chassis (sleek aerodynamic shin blade + calf thruster)
    const shinTop = lerp(knee.at, ankle.at, 0.12);
    const shinBot = lerp(knee.at, ankle.at, 0.92);
    b.frustumBox(shinBot, shinTop, [0.088, 0.105], [0.118, 0.135], {
      bone: knee,
      color: warmArmorPaint,
      group: `leg${side}`,
      name: `shinGreave${side}`,
    });
    // Calf jump-jet nozzle & glowing thruster core
    const calfPos = offset(lerp(knee.at, ankle.at, 0.42), [0, 0, -1], 0.068);
    b.rod(calfPos, offset(calfPos, [0, -0.85, -0.5], 0.075), [0.032, 0.024], {
      bone: knee,
      color: GUNMETAL,
      sides: 8,
      group: `leg${side}`,
      name: `calfThruster${side}`,
    });
    glow(
      b.part(new THREE.SphereGeometry(0.019, 8, 6), TEAL_GLOW, {
        bone: knee,
        at: offset(calfPos, [0, -0.85, -0.5], 0.075),
        group: `leg${side}`,
        name: `calfThrusterGlow${side}`,
      }),
      1.7,
    );
    // Achilles hydraulic piston rod
    b.rod(
      offset(lerp(knee.at, ankle.at, 0.55), [0, 0, -1], 0.048),
      offset(ankle.at, [0, 0.2, -1], 0.042),
      0.012,
      {
        bone: knee,
        color: SILVER,
        sides: 6,
        group: `leg${side}`,
        name: `achillesPiston${side}`,
      },
    );

    // Cybernetic Foot & Split-Toe Boot planted flat on y = 0
    const footX = s * 0.145;
    // Heel block resting at y = 0..0.075
    b.frustumBox(
      [footX, 0.0, -0.055],
      [footX, 0.078, -0.03],
      [0.082, 0.072],
      [0.074, 0.068],
      {
        bone: ankle,
        color: GUNMETAL,
        group: `leg${side}`,
        name: `bootHeel${side}`,
      },
    );
    // Instep arch bridge
    b.frustumBox(
      [footX, 0.032, -0.01],
      [footX, 0.085, 0.04],
      [0.084, 0.058],
      [0.078, 0.065],
      {
        bone: ankle,
        color: armorPaint,
        group: `leg${side}`,
        name: `bootInstep${side}`,
      },
    );
    // Forefoot / Toe plate planted at y = 0..0.052
    b.frustumBox(
      [footX, 0.0, 0.095],
      [footX, 0.052, 0.08],
      [0.092, 0.125],
      [0.078, 0.095],
      {
        bone: toe,
        color: warmArmorPaint,
        group: `leg${side}`,
        name: `bootToeBox${side}`,
      },
    );
    // Golden ankle cuff & glowing sole stabilizer strip
    b.part(new THREE.CylinderGeometry(0.048, 0.052, 0.028, 10), goldPaint, {
      bone: ankle,
      at: [footX, 0.095, -0.005],
      group: `leg${side}`,
      name: `ankleGoldRing${side}`,
    });
    glow(
      b.rod([footX + s * 0.046, 0.018, -0.04], [footX + s * 0.046, 0.018, 0.12], 0.006, {
        bone: toe,
        color: TEAL_GLOW,
        sides: 5,
        group: `leg${side}`,
        name: `bootSoleGlow${side}`,
      }),
      1.4,
    );
  }

  // ---------------------------------------------------------------------------
  // 8. CADUCEUS BIOTIC HEALING STAFF (Planted at [-0.38, 0, 0.22] to y = 2.02)
  // ---------------------------------------------------------------------------

  // Staff bottom pommel resting on y = 0
  b.lathe(
    [
      [0, 0],
      [0.022, 0],
      [0.034, 0.035],
      [0.026, 0.085],
      [0.032, 0.11],
      [0.018, 0.13],
      [0, 0.13],
    ],
    {
      at: [staffX, 0.0, staffZ],
      segments: 10,
      bone: staffGrip,
      color: goldPaint,
      group: "staff",
      name: "staffBottomPommel",
    },
  );
  glow(
    b.rod([staffX, 0.04, staffZ], [staffX, 0.09, staffZ], 0.028, {
      bone: staffGrip,
      color: TEAL_GLOW,
      sides: 8,
      group: "staff",
      name: "staffPommelGlow",
    }),
    1.5,
  );

  // Main Carbon & Ceramic Shaft (y = 0.12 to 1.62)
  b.rod([staffX, 0.12, staffZ], [staffX, 1.62, staffZ], 0.018, {
    bone: staffGrip,
    color: CARBON,
    sides: 8,
    group: "staff",
    name: "staffMainShaft",
  });
  // White ceramic grip sleeves & golden rings
  b.rod([staffX, 0.42, staffZ], [staffX, 0.88, staffZ], 0.022, {
    bone: staffGrip,
    color: armorPaint,
    sides: 8,
    group: "staff",
    name: "staffLowerSleeve",
  });
  b.rod([staffX, 1.02, staffZ], [staffX, 1.38, staffZ], 0.023, {
    bone: staffGrip,
    color: warmArmorPaint,
    sides: 8,
    group: "staff",
    name: "staffGripSleeve",
  });
  for (const ry of [0.42, 0.88, 1.02, 1.22, 1.38, 1.54]) {
    b.part(new THREE.CylinderGeometry(0.027, 0.027, 0.022, 10), goldPaint, {
      bone: staffGrip,
      at: [staffX, ry, staffZ],
      group: "staff",
      name: `staffGoldCollar_${Math.round(ry * 100)}`,
    });
  }

  // Twin Helical Biotic Conduit Tubes spiraling up the upper shaft
  for (const s of [1, -1] as const) {
    const helixPts: [number, number, number][] = [];
    for (let i = 0; i <= 8; i++) {
      const u = i / 8;
      const ang = u * Math.PI * 2 + (s > 0 ? 0 : Math.PI);
      const r = 0.028 + 0.01 * Math.sin(u * Math.PI);
      helixPts.push([
        staffX + Math.cos(ang) * r,
        1.18 + u * 0.44,
        staffZ + Math.sin(ang) * r,
      ]);
    }
    glow(
      b.sweep(catmull(helixPts), 0.0065, {
        bone: staffGrip,
        color: s > 0 ? TEAL_GLOW : GOLD_GLOW,
        sides: 6,
        group: "staff",
        name: `staffHelixConduit${s > 0 ? "L" : "R"}`,
      }),
      1.6,
    );
  }

  // Flexible Biotic Power Hose connecting right gauntlet to staff shaft
  glow(
    b.sweep(
      bezier(
        [-0.36, 1.18, 0.14],
        [-0.45, 1.05, 0.12],
        [staffX, 0.95, staffZ],
      ),
      0.008,
      {
        bone: staffGrip,
        color: TEAL_GLOW,
        sides: 6,
        group: "staff",
        name: "staffFeedCable",
      },
    ),
    1.4,
  );

  // Staff Head Emitter Crown (at y = 1.62)
  b.lathe(
    [
      [0, 0],
      [0.032, 0],
      [0.058, 0.04],
      [0.048, 0.08],
      [0.024, 0.095],
      [0, 0.095],
    ],
    {
      at: [staffX, 1.58, staffZ],
      segments: 12,
      bone: staffHead,
      color: armorPaint,
      group: "staff",
      name: "staffEmitterChalice",
    },
  );

  // Articulated Caduceus Caliper Prongs (staffProngL / staffProngR)
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const prongJ = s > 0 ? staffProngL : staffProngR;

    const prongCurve = bezier(
      prongJ.at,
      [staffX + s * 0.16, 1.76, staffZ],
      [staffX + s * 0.13, 1.92, staffZ],
      [staffX + s * 0.045, 1.99, staffZ],
    );
    b.sweep(prongCurve, (t) => [0.022 * (1 - 0.55 * t), 0.014 * (1 - 0.4 * t)], {
      bone: prongJ,
      color: armorPaint,
      section: "box",
      group: "staff",
      name: `staffProngArm${side}`,
    });
    // Inner glowing energy rail along each prong
    const innerCurve = bezier(
      [staffX + s * 0.038, 1.67, staffZ],
      [staffX + s * 0.115, 1.77, staffZ],
      [staffX + s * 0.095, 1.89, staffZ],
      [staffX + s * 0.035, 1.96, staffZ],
    );
    glow(
      b.sweep(innerCurve, 0.007, {
        bone: prongJ,
        color: GOLD_GLOW,
        sides: 6,
        group: "staff",
        name: `staffProngBlade${side}`,
      }),
      1.7,
    );
    // Swept Valkyrie winglet on outside of staff head
    b.extrude(
      [
        [0, -0.04],
        [0.14, 0.02],
        [0.18, 0.11, "sharp"],
        [0.04, 0.06],
      ],
      {
        at: [staffX + s * 0.075, 1.74, staffZ],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.014,
        bevel: 0.004,
        smoothing: 1,
        bone: prongJ,
        color: goldPaint,
        group: "staff",
        name: `staffWinglet${side}`,
      },
    );
  }

  // Suspended Rotating Biotic Core & Gyroscopic Rings (on staffCore joint at y = 1.77)
  const corePos: [number, number, number] = [staffX, 1.81, staffZ];
  glow(
    b.part(new THREE.OctahedronGeometry(0.048, 1), TEAL_GLOW, {
      bone: staffCore,
      at: corePos,
      scale: [0.85, 1.35, 0.85],
      flat: true,
      group: "staff",
      name: "staffBioticCrystal",
    }),
    2.0,
  );
  // Outer golden gyroscopic ring around crystal
  const gyroRing1 = arc(corePos, [staffX + 0.082, 1.81, staffZ], [0, 0.25, 1], 360);
  b.sweep(gyroRing1, [0.008, 0.005], {
    bone: staffCore,
    color: goldPaint,
    section: "box",
    group: "staff",
    name: "staffGyroRingOuter",
  });
  // Inner glowing medical cross halo ring
  const gyroRing2 = arc(corePos, [staffX, 1.81, staffZ + 0.068], [1, 0.3, 0], 360);
  glow(
    b.sweep(gyroRing2, 0.0055, {
      bone: staffCore,
      color: GOLD_GLOW,
      sides: 6,
      group: "staff",
      name: "staffGyroRingInner",
    }),
    1.8,
  );

  // Floating hard-light energy feather cards radiating from staff head & dorsal wings
  const cardFrames = [
    frame([staffX + 0.11, 1.78, staffZ], [0.85, 0.4, 0]),
    frame([staffX - 0.11, 1.78, staffZ], [-0.85, 0.4, 0]),
    frame([0.28, 1.48, -0.2], [0.7, -0.6, -0.3]),
    frame([-0.28, 1.48, -0.2], [-0.7, -0.6, -0.3]),
  ];
  glow(
    b.cards(cardFrames, ENERGY_FEATHER, {
      size: [0.055, 0.18],
      lean: 15,
      flow: [0, 1, 0],
      bone: chest,
      group: "wings",
      name: "bioticAuraCards",
    }),
    1.5,
  );

  // Small crimson medical alert status pips on shoulders and staff chalice
  for (const pipPos of [
    [0.21, 1.42, 0.045],
    [-0.21, 1.42, 0.045],
    [staffX, 1.63, staffZ + 0.054],
  ] as const) {
    glow(
      b.part(new THREE.SphereGeometry(0.009, 6, 6), CRIMSON, {
        at: pipPos,
        group: "torso",
      }),
      1.4,
    );
  }

  // Subtle heroic head turn & posture adjustment via b.pose
  b.pose(head, { axis: [0, 1, 0], deg: -6 });

  return b.root;
}
