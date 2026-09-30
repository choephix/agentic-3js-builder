import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { DEG } from "../src/math";
import { catmull } from "../src/path";
import { paint } from "../src/paint";
import type { Chain } from "../src/skeleton";

export const meta = {
  name: "Jetpack Penguin Mercenary",
  description:
    "A stocky rockhopper-style penguin mercenary standing 1.2 m tall in upright rest pose: spiky yellow brow crests, heavy beak with separate articulated lower jaw, scarred cyborg eye under rugged aviator goggles, tactical olive-drab harness with ammo pouches, dual-thruster dieselpunk jetpack, flippers extended with a heavy oversized plasma blaster rifle mounted on its own weapon bone, and thick webbed orange feet firmly planted on the floor.",
  builtBy: "Gemini 3.8 Flash",
};

// =============================================================================
// PALETTE
// =============================================================================
const PENGUIN_BLACK = "#15181e"; // Tuxedo feathers / back
const PENGUIN_WHITE = "#f0f2f5"; // Belly white plumage
const CREST_YELLOW = "#fbc02d"; // Vibrant rockhopper spiky crests
const BEAK_ORANGE = "#d84315"; // Heavy bill keratin
const BEAK_PALE = "#ff7043"; // Beak highlight / plate edge
const EYE_SCAR = "#b71c1c"; // Battle scar around right eye
const EYE_CYBORG = "#00e676"; // Glowing cybernetic right lens
const EYE_REAL = "#1a120b"; // Normal brown eye
const EYE_HIGHLIGHT = "#ffffff";

// Gear & Tactical vest
const VEST_OLIVE = "#333d29"; // Military canvas / cordura
const VEST_DARK = "#252e1c"; // Straps and webbing
const VEST_TRIM = "#414833"; // Collar and harness lining
const POUCH_CAMO = "#435032"; // Ammo pouches
const POUCH_BUCKLE = "#c2a649"; // Brass buckles
const HOLSTER_LEATHER = "#4a3525";

// Aviator Goggles
const GOGGLE_LEATHER = "#2d2015"; // Headband strap
const GOGGLE_BRASS = "#d4af37"; // Chunky brass rims
const GOGGLE_GLASS = "#80deea"; // Tinted glass

// Jetpack
const JET_STEEL = "#2b2f38"; // Industrial gunmetal tank & mount
const JET_PLATE = "#3e4451"; // Armored outer shell
const JET_COPPER = "#b87333"; // Manifold pipes & turbine rings
const JET_HAZARD = "#f9a825"; // Hazard stripes
const JET_NOZZLE = "#1c1f24"; // Heat-treated exhaust cones
const JET_GLOW = "#ff3d00"; // Thruster interior heat glow

// Weapon
const GUN_HOUSING = "#1a1c23"; // Heavy matte composite frame
const GUN_METAL = "#4b5366"; // Machined barrel & receiver
const GUN_COIL = "#00e5ff"; // Glowing plasma accelerator coils
const GUN_BRASS = "#c59b27"; // Warning plates & heat vents
const GUN_GRIP = "#2c2621"; // Stippled grip panels

// Feet & Skin
const FOOT_ORANGE = "#e65100"; // Thick scaled penguin feet
const FOOT_PALE = "#f57c00"; // Webbing skin
const CLAW_BLACK = "#101012"; // Heavy talons

export default function build() {
  const b = createBuilder({ name: "jetpackPenguinMerc", detail: 0.95 });

  // ---------------------------------------------------------------------------
  // SKELETON
  // ---------------------------------------------------------------------------
  // Total height: 1.20 m.
  // Feet rest on y = 0.
  // Hips at y = 0.32 m.
  const hips = b.joint("hips", { at: [0, 0.32, -0.02], role: "spine", group: "body" });

  const spineStations = [
    [0, 0.32, -0.02],
    [0, 0.52, 0.01],
    [0, 0.72, 0.02],
    [0, 0.88, -0.01],
  ] as const;

  const spine = b.chain("spine", spineStations, {
    parent: hips,
    role: "spine",
    names: ["lumbar", "chest", "shoulders"],
    group: "body",
  });

  const chestJoint = spine.joints[1];
  const shouldersJoint = spine.joints[2];

  const neckStations = [
    [0, 0.88, -0.01],
    [0, 0.98, 0.0],
    [0, 1.06, 0.02],
  ] as const;

  const neck = b.chain("neck", catmull(neckStations), {
    parent: shouldersJoint,
    role: "neck",
    names: ["neckLower", "neckUpper"],
    group: "neck",
  });

  const headJoint = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 1.06, 0.02],
    dir: [0, 0.02, 1.0],
    role: "head",
    group: "head",
  });

  // Separate articulated lower beak/jaw
  const jaw = b.joint("jaw", {
    parent: headJoint,
    at: headJoint.local([0, 0.06, -0.03]),
    dir: headJoint.dir([0, 0.98, -0.15]),
    role: "jaw",
    group: "head",
  });

  // Short muscular retroverted penguin tail wedge
  const tailChain = b.chain(
    "tail",
    catmull([
      [0, 0.3, -0.16],
      [0, 0.22, -0.27],
      [0, 0.12, -0.38],
    ]),
    {
      parent: hips,
      role: "tail",
      names: ["tailBase", "tailTip"],
      group: "tail",
    },
  );

  // ---------------------------------------------------------------------------
  // FLIPPER SKELETON (Arms) & WEAPON ATTACHMENT BONE
  // ---------------------------------------------------------------------------
  // Rockhopper flippers are abducted out from body in combat-ready posture.
  // Left flipper free; Right flipper holds the oversized blaster.
  type ArmJoints = { shoulder: any; elbow: any; wrist: any };
  const arms: Record<"L" | "R", ArmJoints> = {} as any;

  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const shoulderPt: [number, number, number] = [s * 0.22, 0.84, -0.01];
    const elbowPt: [number, number, number] = [s * 0.4, 0.74, 0.04];
    const wristPt: [number, number, number] = [s * 0.54, 0.6, 0.1];
    const tipPt: [number, number, number] = [s * 0.66, 0.44, 0.16];

    const armChain = b.chain(`arm${side}`, [shoulderPt, elbowPt, wristPt, tipPt], {
      parent: shouldersJoint,
      role: "arm",
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      group: `flipper${side}`,
    });

    arms[side] = {
      shoulder: armChain.joints[0],
      elbow: armChain.joints[1],
      wrist: armChain.joints[2],
    };
  }

  // Swappable weapon bone attached to the right flipper's wrist
  const weaponBone = b.joint("weaponMountR", {
    parent: arms.R.wrist,
    at: arms.R.wrist.local([0, 0.08, 0]),
    dir: [0, 0.05, 0.99],
    role: "hinge",
    group: "weapon",
  });

  // Swappable jetpack equipment bone attached to the shoulders/chest
  const jetpackBone = b.joint("jetpackMount", {
    parent: shouldersJoint,
    at: [0, 0.76, -0.21],
    dir: [0, 0.98, -0.15],
    role: "hinge",
    group: "gear",
  });

  // ---------------------------------------------------------------------------
  // LEGS & FEET SKELETON
  // ---------------------------------------------------------------------------
  const footBaseY = 0.024;
  const toeR = 0.024;

  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const hipPt: [number, number, number] = [s * 0.16, 0.3, -0.03];
    const kneePt: [number, number, number] = [s * 0.16, 0.18, 0.03];
    const footTarget: [number, number, number] = [s * 0.16, footBaseY, 0.08];

    // Thigh fleshy mass on hips
    b.capsule(hipPt, kneePt, [0.09, 0.06], {
      bone: hips,
      color: PENGUIN_BLACK,
      group: "body",
    });

    const legChain = b.chain(
      `leg${side}`,
      limb(
        kneePt,
        footTarget,
        [0.09, 0.08],
        [
          [0, 0, 1], // knee forward
          [0, 0, -1], // ankle back
        ],
        { sole: [0, 1, 0] },
      ),
      {
        parent: hips,
        role: "leg",
        names: [`knee${side}`, `ankle${side}`],
        contact: [s * 0.16, 0.0, 0.15],
        group: `leg${side}`,
      },
    );

    // Thick scaly tarsus
    b.sweep(legChain, [0.038, 0.032], {
      color: FOOT_ORANGE,
      group: `leg${side}`,
    });

    const ankleJoint = legChain.joints[1];
    const footBasePt: [number, number, number] = [s * 0.16, footBaseY, 0.08];

    // Three heavy weight-bearing front toes + webbings
    const toeAngles = [-24, 0, 24];
    const toeLengths = [0.13, 0.16, 0.13];
    const toeChains: Chain[] = [];

    for (let i = 0; i < 3; i++) {
      const angleRad = (toeAngles[i] * Math.PI) / 180;
      const toeLen = toeLengths[i];
      const toeEndPt: [number, number, number] = [
        s * 0.16 + Math.sin(angleRad) * toeLen * s,
        toeR,
        0.08 + Math.cos(angleRad) * toeLen,
      ];

      const toe = b.chain(`toe${side}${i + 1}`, [footBasePt, toeEndPt], {
        parent: ankleJoint,
        role: "digit",
        names: [`toe${side}${i + 1}`],
        contact: [toeEndPt[0], 0.0, toeEndPt[2]],
        group: `leg${side}`,
      });
      toeChains.push(toe);

      // Toe pad tube
      b.sweep(toe, toeR, {
        color: FOOT_ORANGE,
        sides: 8,
        group: `leg${side}`,
      });

      // Sharp heavy black mercenary talon
      b.spike(toe.at(1), [s * Math.sin(angleRad) * 0.35, -0.05, 0.95], 0.036, 0.01, {
        bone: toe.joints[0],
        color: CLAW_BLACK,
        group: `leg${side}`,
      });
    }

    // Heavy leather webbings between toes
    for (let i = 0; i < 2; i++) {
      b.membrane(toeChains[i], toeChains[i + 1], {
        thickness: 0.008,
        rows: 2,
        cols: 4,
        color: FOOT_PALE,
        group: `leg${side}`,
      });
    }

    // Hind spur / rear digit
    b.spike(footBasePt, [0, 0.05, -0.9], 0.026, 0.009, {
      bone: ankleJoint,
      color: CLAW_BLACK,
      group: `leg${side}`,
    });
  }

  // ---------------------------------------------------------------------------
  // PENGUIN BODY & TORSO
  // ---------------------------------------------------------------------------
  // Stocky, barrel-chested rockhopper mercenary silhouette
  const bodyStations = [
    { at: [0, 0.24, -0.05] as const, w: 0.44, h: 0.42 }, // Lower abdomen
    { at: [0, 0.38, -0.02] as const, w: 0.52, h: 0.5 }, // Maximum belly girth
    { at: [0, 0.56, 0.02] as const, w: 0.5, h: 0.49 }, // Mid chest
    { at: [0, 0.74, 0.03] as const, w: 0.46, h: 0.46 }, // Upper pectoral chest
    { at: [0, 0.88, -0.01] as const, w: 0.38, h: 0.38 }, // Broad mercenary shoulders
    { at: [0, 0.98, 0.0] as const, w: 0.28, h: 0.28 }, // Muscular neck
    { at: [0, 1.06, 0.02] as const, w: 0.2, h: 0.2 }, // Base of skull
  ];

  // Classic tuxedo countershading: pure white front abdomen, jet black back & sides
  const bodyPlumage = paint((p, n) => {
    const isFront = n.z > 0.15;
    const isBelly = p.y >= 0.24 && p.y <= 0.86;
    const midX = Math.abs(p.x) < 0.2;
    if (isFront && isBelly && midX) {
      return PENGUIN_WHITE;
    }
    return PENGUIN_BLACK;
  });

  b.loft(bodyStations, {
    bone: [tailChain, hips, spine, neck],
    color: bodyPlumage,
    group: "body",
  });

  // Stiff tail wedge
  b.sweep(tailChain, (t) => 0.09 * (1 - 0.7 * t), {
    color: PENGUIN_BLACK,
    group: "tail",
  });

  // ---------------------------------------------------------------------------
  // FLIPPERS (Rigid hydrofoil combat wings)
  // ---------------------------------------------------------------------------
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const shoulderPt: [number, number, number] = [s * 0.22, 0.84, -0.01];
    const elbowPt: [number, number, number] = [s * 0.4, 0.74, 0.04];
    const wristPt: [number, number, number] = [s * 0.54, 0.6, 0.1];
    const tipPt: [number, number, number] = [s * 0.66, 0.44, 0.16];

    const flipperPath = catmull([shoulderPt, elbowPt, wristPt, tipPt]);
    const flipperJoints = [arms[side].shoulder, arms[side].elbow, arms[side].wrist];

    // Flipper main hydrofoil blade
    b.sweep(flipperPath, (t) => [0.08 * (1 - 0.5 * t), 0.024 * (1 - 0.6 * t)], {
      bone: flipperJoints,
      color: PENGUIN_BLACK,
      caps: "round",
      group: `flipper${side}`,
    });

    // White ventral under-flipper lining
    b.sweep(flipperPath, (t) => [0.075 * (1 - 0.5 * t), 0.01], {
      bone: flipperJoints,
      color: PENGUIN_WHITE,
      shift: [0, -0.01],
      caps: "round",
      group: `flipper${side}`,
    });
  }

  // ---------------------------------------------------------------------------
  // HEAD, BEAK, SCAR & ROCKHOPPER CRESTS
  // ---------------------------------------------------------------------------
  // Robust skull with rockhopper brow ridge
  b.part(new THREE.SphereGeometry(0.12, 16, 12), PENGUIN_BLACK, {
    bone: headJoint,
    at: [0, 1.08, 0.04],
    scale: [1.02, 1.06, 1.12],
    group: "head",
  });

  // Upper Beak: heavy, hooked mercenary bill
  const upperBeakPath = catmull([
    [0, 1.05, 0.12],
    [0, 1.04, 0.23],
    [0, 0.99, 0.31], // Hooked down at tip
  ]);

  b.sweep(upperBeakPath, (t) => [0.046 * (1 - 0.6 * t), 0.04 * (1 - 0.5 * t)], {
    bone: headJoint,
    color: BEAK_ORANGE,
    caps: { start: "flat", end: "point" },
    group: "head",
  });

  // Beak pale keratin side plates
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.008, 0.024, 0.11), BEAK_PALE, {
      bone: headJoint,
      at: [s * 0.038, 1.035, 0.2],
      rotation: [0, s * 8 * DEG, 0],
      group: "head",
    });
  }

  // Lower Beak (separate articulated jaw)
  const lowerBeakPath = catmull([
    [0, 1.01, 0.11],
    [0, 1.005, 0.21],
    [0, 0.985, 0.28],
  ]);

  b.sweep(lowerBeakPath, (t) => [0.038 * (1 - 0.65 * t), 0.028 * (1 - 0.6 * t)], {
    bone: jaw,
    color: BEAK_ORANGE,
    caps: { start: "flat", end: "point" },
    group: "head",
  });

  // Yellow Rockhopper Brow Crests (Spiky, fierce plumes flowing backward from brow)
  for (const s of [1, -1]) {
    const crestBase: [number, number, number] = [s * 0.062, 1.1, 0.12];

    // Fan of 5 spiky golden quills per side spreading dynamically
    const crestSpikes = [
      { dir: [s * 0.35, 0.28, -0.88], len: 0.26, r: 0.015 },
      { dir: [s * 0.52, 0.16, -0.85], len: 0.28, r: 0.016 },
      { dir: [s * 0.62, 0.02, -0.78], len: 0.27, r: 0.015 },
      { dir: [s * 0.46, -0.1, -0.88], len: 0.23, r: 0.014 },
      { dir: [s * 0.26, 0.38, -0.88], len: 0.22, r: 0.013 },
    ];

    for (const spike of crestSpikes) {
      b.spike(crestBase, spike.dir, spike.len, spike.r, {
        bone: headJoint,
        color: CREST_YELLOW,
        group: "head",
      });
    }

    // Black crest base feathers underneath
    b.spike([s * 0.055, 1.11, 0.08], [s * 0.2, 0.35, -0.9], 0.14, 0.018, {
      bone: headJoint,
      color: PENGUIN_BLACK,
      group: "head",
    });
  }

  // Left Eye: Normal gritty battle-hardened eye visible clearly on face
  b.part(new THREE.SphereGeometry(0.026, 10, 8), EYE_REAL, {
    bone: headJoint,
    at: [0.068, 1.075, 0.13],
    group: "head",
  });
  b.part(new THREE.SphereGeometry(0.008, 6, 6), EYE_HIGHLIGHT, {
    bone: headJoint,
    at: [0.078, 1.082, 0.148],
    group: "head",
  });

  // Right Eye: Scarred battle eye with glowing cyborg lens under goggle
  // Crimson jagged battle scar cutting across right face and eye socket
  b.part(new THREE.BoxGeometry(0.016, 0.105, 0.04), EYE_SCAR, {
    bone: headJoint,
    at: [-0.068, 1.075, 0.132],
    rotation: [12 * DEG, 0, 24 * DEG],
    group: "head",
  });
  b.part(new THREE.BoxGeometry(0.014, 0.055, 0.035), EYE_SCAR, {
    bone: headJoint,
    at: [-0.054, 1.045, 0.142],
    rotation: [-15 * DEG, 0, -35 * DEG],
    group: "head",
  });
  b.part(new THREE.SphereGeometry(0.025, 10, 8), EYE_CYBORG, {
    bone: headJoint,
    at: [-0.068, 1.075, 0.13],
    group: "head",
  });
  // Glowing reticle ring on cyborg eye
  b.part(new THREE.TorusGeometry(0.014, 0.003, 6, 10), "#ffffff", {
    bone: headJoint,
    at: [-0.074, 1.075, 0.148],
    dir: [0.2, 0.1, 0.97],
    group: "head",
  });

  // ---------------------------------------------------------------------------
  // AVIATOR GOGGLES (Rugged aviator goggles on forehead / brow)
  // ---------------------------------------------------------------------------
  // Thick leather headband wrapping around the crown
  const goggleStrapPath = catmull([
    [0.11, 1.11, 0.06],
    [0.09, 1.11, -0.07],
    [0.0, 1.11, -0.1],
    [-0.09, 1.11, -0.07],
    [-0.11, 1.11, 0.06],
  ]);
  b.sweep(goggleStrapPath, [0.022, 0.012], {
    bone: headJoint,
    color: GOGGLE_LEATHER,
    section: "box",
    group: "gear",
  });

  // Twin chunky brass aviator goggle eyecups perched securely on the forehead
  for (const s of [1, -1]) {
    const cupCenter: [number, number, number] = [s * 0.052, 1.135, 0.105];

    // Outer brass frame bevel
    b.part(new THREE.CylinderGeometry(0.04, 0.044, 0.032, 14), GOGGLE_BRASS, {
      bone: headJoint,
      at: cupCenter,
      dir: [s * 0.15, 0.45, 0.88],
      group: "gear",
    });

    // Tinted aviator glass lens
    b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.01, 14), GOGGLE_GLASS, {
      bone: headJoint,
      at: [cupCenter[0] + s * 0.004, cupCenter[1] + 0.012, cupCenter[2] + 0.022],
      dir: [s * 0.15, 0.45, 0.88],
      group: "gear",
    });

    // Lens brass retaining ring
    b.part(new THREE.TorusGeometry(0.036, 0.005, 6, 12), GOGGLE_BRASS, {
      bone: headJoint,
      at: [cupCenter[0] + s * 0.005, cupCenter[1] + 0.016, cupCenter[2] + 0.028],
      dir: [s * 0.15, 0.45, 0.88],
      group: "gear",
    });
  }

  // Heavy brass bridge connecting the aviator lenses
  b.capsule([0.024, 1.14, 0.125], [-0.024, 1.14, 0.125], 0.008, {
    bone: headJoint,
    color: GOGGLE_BRASS,
    group: "gear",
  });
  // ---------------------------------------------------------------------------
  // TACTICAL VEST & AMMO POUCHES
  // ---------------------------------------------------------------------------
  // Armored military canvas vest hugging the stocky torso
  // Scaled cleanly to leave belly white visible below and penguin collar visible above
  const vestStations = [
    { at: [0, 0.58, 0.01] as const, w: 0.51, h: 0.5 }, // Lower vest hem
    { at: [0, 0.72, 0.02] as const, w: 0.49, h: 0.48 }, // Mid torso
    { at: [0, 0.85, 0.0] as const, w: 0.42, h: 0.42 }, // Yoke & shoulder harness
  ];

  b.loft(vestStations, {
    bone: spine,
    color: VEST_OLIVE,
    group: "gear",
  });

  // Heavy padded collar
  b.part(new THREE.TorusGeometry(0.18, 0.022, 8, 16), VEST_TRIM, {
    bone: chestJoint,
    at: [0, 0.86, 0.0],
    rotation: [85 * DEG, 0, 0],
    group: "gear",
  });

  // Webbing harness straps across chest & waist
  b.part(new THREE.BoxGeometry(0.48, 0.035, 0.48), VEST_DARK, {
    bone: chestJoint,
    at: [0, 0.6, 0.02],
    group: "gear",
  });
  b.part(new THREE.BoxGeometry(0.46, 0.035, 0.46), VEST_DARK, {
    bone: chestJoint,
    at: [0, 0.74, 0.02],
    group: "gear",
  });
  // Heavy tactical ammo pouches attached to front chest
  const pouchPositions = [
    [-0.12, 0.66, 0.245],
    [-0.04, 0.66, 0.255],
    [0.04, 0.66, 0.255],
    [0.12, 0.66, 0.245],
  ] as const;

  for (const pos of pouchPositions) {
    // Pouch body
    b.part(new THREE.BoxGeometry(0.065, 0.085, 0.045), POUCH_CAMO, {
      bone: chestJoint,
      at: pos,
      rotation: [-6 * DEG, pos[0] * 20 * DEG, 0],
      group: "gear",
    });
    // Flap
    b.part(new THREE.BoxGeometry(0.067, 0.032, 0.048), VEST_DARK, {
      bone: chestJoint,
      at: [pos[0], pos[1] + 0.032, pos[2] + 0.003],
      rotation: [-6 * DEG, pos[0] * 20 * DEG, 0],
      group: "gear",
    });
    // Buckle
    b.part(new THREE.BoxGeometry(0.018, 0.014, 0.008), POUCH_BUCKLE, {
      bone: chestJoint,
      at: [pos[0], pos[1] + 0.015, pos[2] + 0.028],
      rotation: [-6 * DEG, pos[0] * 20 * DEG, 0],
      group: "gear",
    });
  }

  // Side holster / utility canister on left hip
  b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.14, 10), HOLSTER_LEATHER, {
    bone: hips,
    at: [0.24, 0.44, 0.04],
    rotation: [12 * DEG, 0, -18 * DEG],
    group: "gear",
  });
  b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.04, 8), JET_COPPER, {
    bone: hips,
    at: [0.24, 0.52, 0.04],
    rotation: [12 * DEG, 0, -18 * DEG],
    group: "gear",
  });

  // ---------------------------------------------------------------------------
  // TWIN-THRUSTER JETPACK
  // ---------------------------------------------------------------------------
  // Swappable equipment mounted firmly on jetpackBone
  // Main mounting backplate
  b.part(new THREE.BoxGeometry(0.32, 0.36, 0.07), JET_STEEL, {
    bone: jetpackBone,
    at: [0, 0.74, -0.22],
    rotation: [10 * DEG, 0, 0],
    group: "gear",
  });

  // Central fuel core / turbine sphere
  b.part(new THREE.SphereGeometry(0.08, 14, 10), JET_PLATE, {
    bone: jetpackBone,
    at: [0, 0.74, -0.25],
    scale: [1.1, 1.2, 0.9],
    group: "gear",
  });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.08, 12), JET_COPPER, {
    bone: jetpackBone,
    at: [0, 0.74, -0.29],
    rotation: [90 * DEG, 0, 0],
    group: "gear",
  });

  // Twin vertical thruster rocket tubes (Left and Right)
  for (const s of [1, -1]) {
    const thrusterX = s * 0.14;

    // Main rocket cylinder tank
    b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.42, 14), JET_STEEL, {
      bone: jetpackBone,
      at: [thrusterX, 0.75, -0.24],
      rotation: [12 * DEG, 0, 0],
      group: "gear",
    });

    // Armored cap on top
    b.part(new THREE.ConeGeometry(0.068, 0.09, 14), JET_PLATE, {
      bone: jetpackBone,
      at: [thrusterX, 0.97, -0.27],
      rotation: [12 * DEG, 0, 0],
      group: "gear",
    });

    // Yellow hazard reinforcement bands
    b.part(new THREE.CylinderGeometry(0.068, 0.068, 0.035, 14), JET_HAZARD, {
      bone: jetpackBone,
      at: [thrusterX, 0.85, -0.25],
      rotation: [12 * DEG, 0, 0],
      group: "gear",
    });
    b.part(new THREE.CylinderGeometry(0.068, 0.068, 0.035, 14), JET_HAZARD, {
      bone: jetpackBone,
      at: [thrusterX, 0.65, -0.21],
      rotation: [12 * DEG, 0, 0],
      group: "gear",
    });

    // Exhaust nozzle cone (flared out at bottom)
    b.part(new THREE.CylinderGeometry(0.055, 0.085, 0.12, 14), JET_NOZZLE, {
      bone: jetpackBone,
      at: [thrusterX, 0.5, -0.19],
      rotation: [12 * DEG, 0, 0],
      group: "gear",
    });

    // Interior fiery glow element
    b.part(new THREE.ConeGeometry(0.045, 0.08, 12), JET_GLOW, {
      bone: jetpackBone,
      at: [thrusterX, 0.5, -0.19],
      rotation: [192 * DEG, 0, 0],
      group: "gear",
    });

    // High-pressure copper piping feeding into the engines
    const pipePath = catmull([
      [0, 0.74, -0.27],
      [s * 0.07, 0.72, -0.28],
      [s * 0.12, 0.66, -0.25],
    ]);
    b.sweep(pipePath, 0.012, {
      bone: jetpackBone,
      color: JET_COPPER,
      group: "gear",
    });
  }

  // ---------------------------------------------------------------------------
  // OVERSIZED PLASMA BLASTER RIFLE (Equipped on right flipper)
  // ---------------------------------------------------------------------------
  // Mounted directly on weaponBone
  // The weapon is angled forward ready to fire.
  const gunCenter = weaponBone.at;

  // Main heavy receiver chassis
  b.part(new THREE.BoxGeometry(0.085, 0.14, 0.44), GUN_HOUSING, {
    bone: weaponBone,
    at: [gunCenter.x, gunCenter.y, gunCenter.z + 0.12],
    rotation: [0, 0, 0],
    group: "weapon",
  });

  // Top carry handle & tactical reflex optic rail
  b.part(new THREE.BoxGeometry(0.045, 0.05, 0.28), GUN_METAL, {
    bone: weaponBone,
    at: [gunCenter.x, gunCenter.y + 0.095, gunCenter.z + 0.1],
    rotation: [0, 0, 0],
    group: "weapon",
  });
  // Reflex optic lens (facing forward along Z)
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.06, 8), EYE_CYBORG, {
    bone: weaponBone,
    at: [gunCenter.x, gunCenter.y + 0.125, gunCenter.z + 0.1],
    dir: [0, 0, 1],
    group: "weapon",
  });

  // Dual plasma accelerator coils (Glowing cyan channels running forward along Z)
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.26, 12), GUN_COIL, {
      bone: weaponBone,
      at: [gunCenter.x + s * 0.045, gunCenter.y + 0.01, gunCenter.z + 0.18],
      dir: [0, 0, 1],
      group: "weapon",
    });

    // Heat sink vents / protective copper cage around coils
    for (let c = 0; c < 4; c++) {
      b.part(new THREE.TorusGeometry(0.028, 0.005, 6, 10), GUN_BRASS, {
        bone: weaponBone,
        at: [gunCenter.x + s * 0.045, gunCenter.y + 0.01, gunCenter.z + 0.08 + c * 0.06],
        dir: [0, 0, 1],
        group: "weapon",
      });
    }
  }

  // Oversized heavy industrial muzzle brake / barrel shroud
  b.part(new THREE.BoxGeometry(0.11, 0.12, 0.14), GUN_METAL, {
    bone: weaponBone,
    at: [gunCenter.x, gunCenter.y, gunCenter.z + 0.4],
    dir: [0, 0, 1],
    group: "weapon",
  });
  // Massive main bore barrel
  b.part(new THREE.CylinderGeometry(0.042, 0.045, 0.16, 14), GUN_HOUSING, {
    bone: weaponBone,
    at: [gunCenter.x, gunCenter.y, gunCenter.z + 0.46],
    dir: [0, 0, 1],
    group: "weapon",
  });
  // Glowing interior muzzle flash chamber
  b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.02, 10), GUN_COIL, {
    bone: weaponBone,
    at: [gunCenter.x, gunCenter.y, gunCenter.z + 0.53],
    dir: [0, 0, 1],
    group: "weapon",
  });

  // Underslung curved drum magazine / battery pack
  b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.09, 12), GUN_BRASS, {
    bone: weaponBone,
    at: [gunCenter.x, gunCenter.y - 0.11, gunCenter.z + 0.08],
    rotation: [0, 0, 90 * DEG],
    group: "weapon",
  });

  // Ergonomic flipper clamp / tactical foregrip
  b.part(new THREE.BoxGeometry(0.055, 0.1, 0.06), GUN_GRIP, {
    bone: weaponBone,
    at: [gunCenter.x, gunCenter.y - 0.08, gunCenter.z - 0.04],
    rotation: [-18 * DEG, 0, 0],
    group: "weapon",
  });

  return b.root;
}
