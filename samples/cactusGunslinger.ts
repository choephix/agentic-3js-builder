// Cactus Gunslinger: A living saguaro cactus outlaw about 2.2 m tall.
// Wild-west enemy elite: ribbed spiny saguaro trunk, branching arms holding revolvers,
// carved grim face with articulated lower jaw, battered cowboy hat, dusty bandana,
// bullet-studded gun belt with holsters, blooming desert flower on its crown,
// and stubby root legs clad in worn leather cowboy boots with spinning brass spurs.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { V3 } from "../src/math";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { mix, mottle, paint, smoothstep, spots } from "../src/paint";

export const meta = {
  name: "Cactus Gunslinger",
  description:
    "A 2.2m tall saguaro cactus outlaw with dual revolvers, carved face and jaw, cowboy hat, bandana, gun belt, blooming head flower, and spurred boots.",
  builtBy: "Gemini 3.8 Flash",
};

// -----------------------------------------------------------------------------
// Colour Palette
// -----------------------------------------------------------------------------
const CACTUS_BASE = "#2f6b32";
const CACTUS_DARK = "#1a401c";
const CACTUS_LIGHT = "#4e8c47";
const CACTUS_GROOVE = "#143016";
const SPINE_COLOR = "#f0eed6";

const HAT_FELT = "#423021";
const HAT_DARK = "#281b12";
const HAT_BAND = "#87241b";

const BANDANA_RED = "#b52820";
const BANDANA_SHADOW = "#6e1510";
const BANDANA_DOT = "#fff4e6";

const LEATHER_DARK = "#2e190b";
const BRASS_GOLD = "#d9a532";
const BULLET_LEAD = "#6c727d";
const GUN_STEEL = "#2b2e36";
const GUN_STEEL_LIGHT = "#484f5c";
const GUN_GRIP = "#5c2a16";

const BOOT_LEATHER = "#382012";
const BOOT_SOLE = "#181009";
const SPUR_BRASS = "#deb13e";

const FLOWER_PINK = "#e6397d";
const FLOWER_MAGENTA = "#ad1552";
const FLOWER_CENTER = "#fed43f";
const FLOWER_STEM = "#3e6e2b";

const MOUTH_INTERIOR = "#0d140e";
const EYE_GLOW = "#ffb733";

export default function build() {
  const b = createBuilder({ name: "cactusGunslinger" });

  // ---------------------------------------------------------------------------
  // Procedural Textures & Paints
  // ---------------------------------------------------------------------------
  const cactusSkin = paint((p, _n, _s) => {
    // Saguaro fluted ribs: 14 distinct radial ridges
    const angle = Math.atan2(p.x, p.z);
    const rib = Math.cos(angle * 14);
    const ribFactor = smoothstep(-0.4, 0.7, rib);
    const baseCol = mix(CACTUS_GROOVE, CACTUS_BASE, ribFactor);
    // Weathered mottled desert dust
    return mottle(baseCol, CACTUS_LIGHT, { size: 0.07, contrast: 0.3 });
  });

  const hatFeltPaint = mottle(HAT_FELT, HAT_DARK, { size: 0.06, contrast: 0.35 });
  const bootLeatherPaint = mottle(BOOT_LEATHER, BOOT_SOLE, { size: 0.04, contrast: 0.3 });

  // Outlaw bandana paisley / polka-dot print
  const bandanaPaint = spots(BANDANA_RED, BANDANA_DOT, { size: 0.02, amount: 0.45, rosette: true, seed: 1881 });

  // ---------------------------------------------------------------------------
  // Skeleton Rig
  // Humanoid rest pose with saguaro arms angled outward and forearms holding revolvers forward.
  // ---------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.74, 0], role: "spine", group: "body" });

  const spine = b.chain(
    "spine",
    [
      [0, 0.74, 0],
      [0, 0.98, 0.01],
      [0, 1.25, 0.015],
      [0, 1.55, 0.01],
    ],
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine", group: "body" },
  );
  const chest = spine.joints[2];

  // Head and carved jaw
  const neck = b.joint("neck", { parent: chest, at: [0, 1.55, 0.01], aim: [0, 1.72, 0.01], role: "neck", group: "head" });
  const head = b.joint("head", { parent: neck, at: [0, 1.72, 0.01], dir: [0, 1, 0], role: "head", group: "head" });

  // Carved lower jaw hinged to the head
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.63, 0.14],
    aim: [0, 1.60, 0.28],
    role: "jaw",
    group: "head",
  });

  // Dual cactus arms: shoulder -> elbow -> wrist -> weapon mount
  const SIDES = [
    [1, "L"],
    [-1, "R"],
  ] as const;

  const arms = SIDES.map(([s, side]) => {
    const clav = b.joint(`clavicle${side}`, {
      parent: chest,
      at: [s * 0.22, 1.50, 0.01],
      aim: [s * 0.44, 1.48, 0.02],
      role: "arm",
      group: `arm${side}`,
    });

    // Natural western outlaw gun-ready rest pose:
    // Arms branch out and curve forward, hands holding revolvers distinctly in front
    const shoulderPt: V3 = [s * 0.44, 1.48, 0.02];
    const elbowPt: V3 = [s * 0.64, 1.40, 0.18];
    const wristPt: V3 = [s * 0.60, 1.40, 0.48];
    const handPt: V3 = [s * 0.58, 1.40, 0.62];

    const chain = b.chain(`arm${side}`, [shoulderPt, elbowPt, wristPt, handPt], {
      parent: clav,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
      group: `arm${side}`,
    });

    // Weapon mount bone for the heavy revolver
    const weaponBone = b.joint(`revolver${side}`, {
      parent: chain.joints[2], // wrist
      at: handPt,
      aim: [handPt[0], handPt[1], handPt[2] + 0.3],
      role: "arm",
      group: `weapon${side}`,
    });

    return {
      s,
      side,
      clav,
      chain,
      shoulder: chain.joints[0],
      elbow: chain.joints[1],
      wrist: chain.joints[2],
      weaponBone,
      shoulderPt,
      elbowPt,
      wristPt,
      handPt,
    };
  });

  // Stubby root legs in cowboy boots
  const legs = SIDES.map(([s, side]) => {
    const hipPt: V3 = [s * 0.18, 0.72, 0];
    const kneePt: V3 = [s * 0.18, 0.44, 0.02];
    const anklePt: V3 = [s * 0.18, 0.16, -0.01];
    const toePt: V3 = [s * 0.18, 0.04, 0.12];

    const chain = b.chain(`leg${side}`, [hipPt, kneePt, anklePt, toePt], {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.18, 0, 0.08],
      group: `leg${side}`,
    });

    return {
      s,
      side,
      chain,
      hip: chain.joints[0],
      knee: chain.joints[1],
      ankle: chain.joints[2],
    };
  });

  // ---------------------------------------------------------------------------
  // Geometry 1: Saguaro Trunk (Continuous lofted cactus body)
  // ---------------------------------------------------------------------------
  b.loft(
    [
      { at: [0, 0.64, 0], w: 0.38, h: 0.38 }, // Below belt
      { at: [0, 0.88, 0.005], w: 0.44, h: 0.44 }, // Waist/hip
      { at: [0, 1.18, 0.01], w: 0.48, h: 0.48 }, // Torso
      { at: [0, 1.48, 0.015], w: 0.46, h: 0.46 }, // Chest
      { at: [0, 1.70, 0.01], w: 0.44, h: 0.44 }, // Head/face
      { at: [0, 1.88, 0.0], w: 0.40, h: 0.40 }, // Forehead
      { at: [0, 1.96, 0.0], w: 0.22, h: 0.22 }, // Crown dome
    ],
    {
      bone: [hips, spine.joints[0], spine.joints[1], chest, neck, head],
      color: cactusSkin,
      group: "body",
      sides: 16,
      caps: "round",
    },
  );

  // ---------------------------------------------------------------------------
  // Geometry 2: Carved Face & Articulated Lower Jaw
  // ---------------------------------------------------------------------------
  for (const [s] of SIDES) {
    // Outer dark carved eye recess
    b.part(
      new THREE.BoxGeometry(0.08, 0.045, 0.04),
      MOUTH_INTERIOR,
      {
        bone: head,
        at: [s * 0.10, 1.74, 0.21],
        rotation: [-5, s * 14, s * -12],
        group: "head",
      },
    );

    // Glowing intense outlaw squint
    b.part(
      new THREE.BoxGeometry(0.05, 0.02, 0.03),
      EYE_GLOW,
      {
        bone: head,
        at: [s * 0.10, 1.74, 0.22],
        rotation: [-5, s * 14, s * -12],
        group: "head",
      },
    );

    // Overhanging carved wooden cactus brow ridge
    b.part(
      new THREE.CylinderGeometry(0.018, 0.014, 0.11, 6),
      CACTUS_DARK,
      {
        bone: head,
        at: [s * 0.10, 1.775, 0.225],
        rotation: [0, 0, s * -25],
        group: "head",
      },
    );
  }

  // Upper mouth carved wooden lintel
  b.part(
    new THREE.BoxGeometry(0.20, 0.035, 0.06),
    MOUTH_INTERIOR,
    {
      bone: head,
      at: [0, 1.66, 0.205],
      group: "head",
    },
  );

  // Upper jaw teeth
  for (let i = -2; i <= 2; i++) {
    b.part(
      new THREE.ConeGeometry(0.012, 0.032, 5),
      SPINE_COLOR,
      {
        bone: head,
        at: [i * 0.038, 1.645, 0.22],
        rotation: [180, 0, 0],
        group: "head",
      },
    );
  }

  // Lower Jaw: articulates with the `jaw` joint
  // Recessed dark interior of the mouth cavity
  b.part(
    new THREE.BoxGeometry(0.18, 0.04, 0.06),
    MOUTH_INTERIOR,
    {
      bone: jaw,
      at: [0, 1.625, 0.20],
      group: "jaw",
    },
  );

  // Lower Jaw chin & jawline body
  b.part(
    new THREE.BoxGeometry(0.22, 0.065, 0.10),
    CACTUS_BASE,
    {
      bone: jaw,
      at: [0, 1.585, 0.19],
      group: "jaw",
    },
  );

  // Lower jaw jagged teeth
  for (let i = -2; i <= 2; i++) {
    b.part(
      new THREE.ConeGeometry(0.011, 0.030, 5),
      SPINE_COLOR,
      {
        bone: jaw,
        at: [i * 0.036 + (i < 0 ? -0.005 : 0.005), 1.625, 0.22],
        rotation: [0, 0, 0],
        group: "jaw",
      },
    );
  }

  // Rugged carved chin protrusion
  b.part(
    new THREE.CylinderGeometry(0.08, 0.06, 0.07, 10),
    CACTUS_DARK,
    {
      bone: jaw,
      at: [0, 1.545, 0.18],
      group: "jaw",
    },
  );

  // ---------------------------------------------------------------------------
  // Geometry 3: Saguaro Arms (Branched cactus limbs)
  // ---------------------------------------------------------------------------
  for (const arm of arms) {
    const s = arm.s;
    const side = arm.side;

    // Swept branching saguaro limb: ends right before the hand/grip
    const branchCurve = catmull([
      [s * 0.22, 1.50, 0.01],
      arm.shoulderPt,
      arm.elbowPt,
      arm.wristPt,
      [arm.handPt[0], arm.handPt[1], arm.handPt[2] - 0.04],
    ]);

    b.sweep(branchCurve, (t) => 0.11 - 0.02 * t, {
      bone: [arm.shoulder, arm.elbow, arm.wrist],
      color: cactusSkin,
      group: `arm${side}`,
      sides: 12,
      caps: "round",
    });

    // 4 thick cactus root fingers wrapped tightly around the revolver grip
    const handJoint = arm.wrist;
    // Thumb over top of grip
    b.part(
      new THREE.CapsuleGeometry(0.016, 0.05, 4, 8),
      CACTUS_LIGHT,
      {
        bone: handJoint,
        at: [arm.handPt[0] - s * 0.025, arm.handPt[1] + 0.02, arm.handPt[2]],
        rotation: [0, s * 40, s * -40],
        group: `arm${side}`,
      },
    );
    // Three fingers wrapping around grip
    for (let f = -1; f <= 1; f++) {
      b.part(
        new THREE.CapsuleGeometry(0.017, 0.065, 4, 8),
        CACTUS_LIGHT,
        {
          bone: handJoint,
          at: [arm.handPt[0] + s * 0.01, arm.handPt[1] + f * 0.025 - 0.01, arm.handPt[2] + 0.01],
          rotation: [30, s * 25, 0],
          group: `arm${side}`,
        },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Geometry 4: Dual Heavy Revolvers (held on weapon bones)
  // ---------------------------------------------------------------------------
  for (const arm of arms) {
    const side = arm.side;
    const wBone = arm.weaponBone;
    const hPt = arm.handPt;

    // Revolver Grip
    b.part(
      new THREE.BoxGeometry(0.034, 0.11, 0.05),
      GUN_GRIP,
      {
        bone: wBone,
        at: [hPt[0], hPt[1] - 0.02, hPt[2]],
        rotation: [-18, 0, 0],
        group: `weapon${side}`,
      },
    );

    // Brass grip bottom plate
    b.part(
      new THREE.CylinderGeometry(0.018, 0.018, 0.036, 8),
      BRASS_GOLD,
      {
        bone: wBone,
        at: [hPt[0], hPt[1] - 0.075, hPt[2] - 0.016],
        rotation: [0, 0, 90],
        group: `weapon${side}`,
      },
    );

    // Heavy revolving cylinder
    b.part(
      new THREE.CylinderGeometry(0.034, 0.034, 0.08, 12),
      GUN_STEEL_LIGHT,
      {
        bone: wBone,
        at: [hPt[0], hPt[1] + 0.032, hPt[2] + 0.05],
        rotation: [90, 0, 0],
        group: `weapon${side}`,
      },
    );

    // Frame body housing
    b.part(
      new THREE.BoxGeometry(0.038, 0.07, 0.10),
      GUN_STEEL,
      {
        bone: wBone,
        at: [hPt[0], hPt[1] + 0.03, hPt[2] + 0.045],
        group: `weapon${side}`,
      },
    );

    // Long octagonal heavy barrel
    b.part(
      new THREE.CylinderGeometry(0.024, 0.024, 0.28, 8),
      GUN_STEEL,
      {
        bone: wBone,
        at: [hPt[0], hPt[1] + 0.04, hPt[2] + 0.23],
        rotation: [90, 0, 0],
        group: `weapon${side}`,
      },
    );

    // Solid barrel top rib
    b.part(
      new THREE.BoxGeometry(0.016, 0.018, 0.26),
      GUN_STEEL,
      {
        bone: wBone,
        at: [hPt[0], hPt[1] + 0.063, hPt[2] + 0.22],
        group: `weapon${side}`,
      },
    );

    // Brass blade front sight
    b.part(
      new THREE.ConeGeometry(0.009, 0.022, 4),
      BRASS_GOLD,
      {
        bone: wBone,
        at: [hPt[0], hPt[1] + 0.08, hPt[2] + 0.35],
        group: `weapon${side}`,
      },
    );

    // Hammer & trigger guard
    b.part(
      new THREE.TorusGeometry(0.026, 0.006, 4, 12, Math.PI),
      GUN_STEEL,
      {
        bone: wBone,
        at: [hPt[0], hPt[1] - 0.005, hPt[2] + 0.045],
        rotation: [0, 0, 180],
        group: `weapon${side}`,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Geometry 5: Battered Cowboy Hat
  // ---------------------------------------------------------------------------
  const hatOrigin: V3 = [0, 1.94, -0.01];
  const hatAxis: V3 = [0, 0.98, -0.15]; // Outlaw cocked angle

  b.lathe(
    [
      [0, 0.01],
      [0.34, -0.02], // Wide brim edge
      [0.36, -0.015, "sharp"],
      [0.35, 0.005, "sharp"],
      [0.19, 0.02],
      [0.18, 0.13],
      [0.15, 0.17],
      [0, 0.16], // Crown crease dip
    ],
    {
      at: hatOrigin,
      axis: hatAxis,
      smoothing: 1,
      segments: 18,
      bone: head,
      color: hatFeltPaint,
      group: "head",
    },
  );

  // Hat leather band
  b.lathe(
    [
      [0.182, 0.022],
      [0.194, 0.022],
      [0.190, 0.052],
      [0.178, 0.052],
    ],
    {
      at: hatOrigin,
      axis: hatAxis,
      segments: 16,
      bone: head,
      color: HAT_BAND,
      group: "head",
    },
  );

  // Brass skull / star concho on hat band
  b.part(
    new THREE.CylinderGeometry(0.016, 0.016, 0.008, 6),
    BRASS_GOLD,
    {
      bone: head,
      at: [0, 1.97, 0.18],
      rotation: [80, 0, 0],
      group: "head",
    },
  );

  // ---------------------------------------------------------------------------
  // Geometry 6: Blooming Head Flower (tucked on crown beside hat)
  // ---------------------------------------------------------------------------
  const flowerStemPt: V3 = [0.12, 1.95, 0.08];
  // Flower stem
  b.rod(flowerStemPt, [0.16, 2.03, 0.11], 0.014, {
    bone: head,
    color: FLOWER_STEM,
    group: "head",
  });

  // Flower center
  b.part(
    new THREE.SphereGeometry(0.032, 8, 8),
    FLOWER_CENTER,
    {
      bone: head,
      at: [0.16, 2.04, 0.11],
      group: "head",
    },
  );

  // 10 radiating petals in two contrasting desert pink/magenta layers
  const petalGeo = new THREE.ConeGeometry(0.026, 0.09, 5);
  petalGeo.rotateX(Math.PI / 2);
  for (let p = 0; p < 10; p++) {
    const angle = (p / 10) * Math.PI * 2;
    b.part(
      petalGeo,
      p % 2 === 0 ? FLOWER_PINK : FLOWER_MAGENTA,
      {
        bone: head,
        at: [0.16, 2.04, 0.11],
        rotation: [Math.sin(angle) * 35, Math.cos(angle) * 35, (angle * 180) / Math.PI],
        group: "head",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Geometry 7: Outlaw Bandana
  // ---------------------------------------------------------------------------
  // Draped collar ring around neck
  b.lathe(
    [
      [0.17, -0.06],
      [0.24, -0.04],
      [0.25, 0.02],
      [0.20, 0.06],
      [0.16, 0.04],
    ],
    {
      at: [0, 1.54, 0.01],
      segments: 16,
      bone: neck,
      color: bandanaPaint,
      group: "head",
    },
  );

  // Triangular draped handkerchief hanging down front of chest
  b.slab(
    [
      [-0.14, 1.52, 0.22],
      [0.14, 1.52, 0.22],
      [0, 1.34, 0.25],
    ],
    {
      thickness: 0.012,
      bone: chest,
      color: bandanaPaint,
      group: "head",
    },
  );

  // Bandana back knot
  b.part(
    new THREE.SphereGeometry(0.035, 6, 6),
    BANDANA_SHADOW,
    {
      bone: neck,
      at: [0, 1.55, -0.19],
      group: "head",
    },
  );

  // ---------------------------------------------------------------------------
  // Geometry 8: Gun Belt, Bullet Loops & Holsters
  // ---------------------------------------------------------------------------
  // Diagonal heavy gun belt over hips
  const beltTorus = new THREE.TorusGeometry(0.24, 0.032, 8, 20);
  beltTorus.scale(1.0, 1.0, 0.85); // match oval torso
  b.part(
    beltTorus,
    bootLeatherPaint,
    {
      bone: hips,
      at: [0, 0.74, 0],
      rotation: [8, 0, -6], // classic slung gunslinger angle
      group: "body",
    },
  );

  // Large brass belt buckle
  b.part(
    new THREE.BoxGeometry(0.08, 0.07, 0.024),
    BRASS_GOLD,
    {
      bone: hips,
      at: [0, 0.73, 0.22],
      rotation: [8, 0, -6],
      group: "body",
    },
  );

  // Buckle inner hole
  b.part(
    new THREE.BoxGeometry(0.04, 0.04, 0.028),
    LEATHER_DARK,
    {
      bone: hips,
      at: [0, 0.73, 0.222],
      rotation: [8, 0, -6],
      group: "body",
    },
  );

  // Brass bullet cartridges lining the belt
  for (let bIdx = -4; bIdx <= 4; bIdx++) {
    if (Math.abs(bIdx) < 2) continue; // Leave front clear for buckle
    const angle = (bIdx / 10) * Math.PI;
    const bx = Math.sin(angle) * 0.245;
    const bz = Math.cos(angle) * 0.21;
    const by = 0.74 - bx * 0.1;

    // Bullet casing
    b.part(
      new THREE.CylinderGeometry(0.010, 0.010, 0.036, 6),
      BRASS_GOLD,
      {
        bone: hips,
        at: [bx, by, bz],
        rotation: [15, 0, (-angle * 180) / Math.PI],
        group: "body",
      },
    );
    // Lead bullet tip
    b.part(
      new THREE.ConeGeometry(0.009, 0.015, 6),
      BULLET_LEAD,
      {
        bone: hips,
        at: [bx, by + 0.022, bz],
        rotation: [15, 0, (-angle * 180) / Math.PI],
        group: "body",
      },
    );
  }

  // Dual side holsters hanging from the belt
  for (const [s, side] of SIDES) {
    // Holster leather body
    b.part(
      new THREE.BoxGeometry(0.065, 0.22, 0.08),
      bootLeatherPaint,
      {
        bone: hips,
        at: [s * 0.26, 0.60, 0.04],
        rotation: [10, 0, s * -12],
        group: `leg${side}`,
      },
    );

    // Holster thigh tie-down strap
    b.part(
      new THREE.TorusGeometry(0.12, 0.012, 6, 14),
      LEATHER_DARK,
      {
        bone: hips,
        at: [s * 0.22, 0.52, 0.03],
        rotation: [90, 0, 0],
        group: `leg${side}`,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Geometry 9: Stubby Root Legs & Cowboy Boots with Spurs
  // ---------------------------------------------------------------------------
  for (const leg of legs) {
    const s = leg.s;
    const side = leg.side;

    // Stubby gnarled cactus root thigh/knee
    const rootLegCurve = catmull([
      [s * 0.18, 0.72, 0],
      [s * 0.18, 0.44, 0.02],
      [s * 0.18, 0.24, -0.01],
    ]);

    b.sweep(rootLegCurve, (t) => 0.13 - 0.02 * t, {
      bone: [leg.hip, leg.knee],
      color: cactusSkin,
      group: `leg${side}`,
      sides: 10,
      caps: "round",
    });

    // Leather Cowboy Boot (Shaft, Vamp, Pointed upturned toe, Stacked heel)
    // Boot shaft (calf)
    b.part(
      new THREE.CylinderGeometry(0.105, 0.095, 0.18, 12),
      bootLeatherPaint,
      {
        bone: leg.ankle,
        at: [s * 0.18, 0.18, 0.01],
        group: `leg${side}`,
      },
    );

    // Boot collar fancy scalloped trim
    b.part(
      new THREE.TorusGeometry(0.102, 0.015, 6, 14),
      HAT_BAND,
      {
        bone: leg.ankle,
        at: [s * 0.18, 0.26, 0.01],
        rotation: [90, 0, 0],
        group: `leg${side}`,
      },
    );

    // Boot lower foot & pointed upturned cowboy toe
    b.loft(
      [
        { at: [s * 0.18, 0.09, -0.08], w: 0.12, h: 0.10 }, // Heel cup
        { at: [s * 0.18, 0.08, 0.02], w: 0.13, h: 0.11 }, // Mid foot arch
        { at: [s * 0.18, 0.07, 0.12], w: 0.11, h: 0.09 }, // Ball of foot
        { at: [s * 0.18, 0.065, 0.20], w: 0.06, h: 0.05 }, // Upturned pointed toe
      ],
      {
        bone: leg.ankle,
        color: bootLeatherPaint,
        group: `leg${side}`,
        sides: 10,
        caps: "round",
      },
    );

    // Thick black boot sole resting flush on y = 0
    b.part(
      new THREE.BoxGeometry(0.13, 0.024, 0.30),
      BOOT_SOLE,
      {
        bone: leg.ankle,
        at: [s * 0.18, 0.012, 0.06],
        group: `leg${side}`,
      },
    );

    // Stacked cowboy boot heel
    b.part(
      new THREE.BoxGeometry(0.11, 0.038, 0.10),
      BOOT_SOLE,
      {
        bone: leg.ankle,
        at: [s * 0.18, 0.019, -0.05],
        group: `leg${side}`,
      },
    );

    // Brass Spur (heel band, shank, and star rowel)
    // Spur heel band
    b.part(
      new THREE.TorusGeometry(0.068, 0.009, 6, 12, Math.PI),
      SPUR_BRASS,
      {
        bone: leg.ankle,
        at: [s * 0.18, 0.08, -0.06],
        rotation: [0, 0, 180],
        group: `leg${side}`,
      },
    );

    // Spur shank
    b.part(
      new THREE.CylinderGeometry(0.007, 0.007, 0.04, 6),
      SPUR_BRASS,
      {
        bone: leg.ankle,
        at: [s * 0.18, 0.08, -0.14],
        rotation: [90, 0, 0],
        group: `leg${side}`,
      },
    );

    // 8-pointed star rowel (spur wheel)
    const rowelCenter: V3 = [s * 0.18, 0.08, -0.165];
    const rowelSpikeGeo = new THREE.ConeGeometry(0.006, 0.032, 4);
    rowelSpikeGeo.rotateX(Math.PI / 2);
    for (let sp = 0; sp < 8; sp++) {
      const ang = (sp / 8) * Math.PI * 2;
      b.part(
        rowelSpikeGeo,
        SPUR_BRASS,
        {
          bone: leg.ankle,
          at: rowelCenter,
          rotation: [(ang * 180) / Math.PI, 0, 0],
          group: `leg${side}`,
        },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Geometry 10: Cactus Spines (Needles clustered in aeroles along trunk & arms)
  // ---------------------------------------------------------------------------
  // Merged spines per bone to keep part count lean
  const spineRng = rng(1881);
  const spineCone = new THREE.ConeGeometry(0.006, 0.055, 4);

  // Distribute spines among spine/torso bones so they deform cleanly in flex tests
  const trunkSpineChests: THREE.BufferGeometry[] = [];
  const trunkSpineHips: THREE.BufferGeometry[] = [];

  for (let yLevel = 0.85; yLevel <= 1.85; yLevel += 0.12) {
    for (let rIdx = 0; rIdx < 8; rIdx++) {
      const ang = (rIdx / 8) * Math.PI * 2 + (yLevel * 0.5);
      const rad = 0.225;
      const sx = Math.sin(ang) * rad;
      const sz = Math.cos(ang) * rad;

      // Skip face area (front of head)
      if (yLevel > 1.55 && sz > 0.12) continue;

      for (let n = 0; n < 3; n++) {
        const needle = spineCone.clone();
        const tiltX = (spineRng() - 0.5) * 0.4;
        const tiltY = (spineRng() - 0.5) * 0.4;
        needle.rotateX(tiltX + Math.sin(ang) * 0.8);
        needle.rotateZ(tiltY - Math.cos(ang) * 0.8);
        needle.translate(sx, yLevel, sz);

        if (yLevel < 1.35) {
          trunkSpineHips.push(needle);
        } else {
          trunkSpineChests.push(needle);
        }
      }
    }
  }

  if (trunkSpineHips.length > 0) {
    const merged = mergeGeometries(trunkSpineHips);
    if (merged) {
      b.part(merged, SPINE_COLOR, {
        bone: hips,
        at: [0, 0, 0],
        group: "body",
      });
    }
  }

  if (trunkSpineChests.length > 0) {
    const merged = mergeGeometries(trunkSpineChests);
    if (merged) {
      b.part(merged, SPINE_COLOR, {
        bone: chest,
        at: [0, 0, 0],
        group: "body",
      });
    }
  }

  // Arm spines distributed between shoulder and elbow
  for (const arm of arms) {
    const s = arm.s;
    const shoulderSpines: THREE.BufferGeometry[] = [];
    const elbowSpines: THREE.BufferGeometry[] = [];

    // Spines along upper arm (shoulder)
    for (let step = 0; step < 4; step++) {
      const t = 0.2 + (step / 4) * 0.7;
      const px = arm.shoulderPt[0] + (arm.elbowPt[0] - arm.shoulderPt[0]) * t;
      const py = arm.shoulderPt[1] + (arm.elbowPt[1] - arm.shoulderPt[1]) * t;
      const pz = arm.shoulderPt[2] + (arm.elbowPt[2] - arm.shoulderPt[2]) * t;

      for (let n = 0; n < 2; n++) {
        const needle = spineCone.clone();
        needle.rotateY(s * Math.PI / 2);
        needle.rotateZ((spineRng() - 0.5) * 0.6);
        needle.translate(px, py + (n === 0 ? 0.07 : -0.07), pz);
        shoulderSpines.push(needle);
      }
    }

    // Spines along forearm (elbow)
    for (let step = 0; step < 4; step++) {
      const t = 0.2 + (step / 4) * 0.6;
      const px = arm.elbowPt[0] + (arm.wristPt[0] - arm.elbowPt[0]) * t;
      const py = arm.elbowPt[1] + (arm.wristPt[1] - arm.elbowPt[1]) * t;
      const pz = arm.elbowPt[2] + (arm.wristPt[2] - arm.elbowPt[2]) * t;

      for (let n = 0; n < 2; n++) {
        const needle = spineCone.clone();
        needle.rotateX(Math.PI / 2);
        needle.rotateZ((spineRng() - 0.5) * 0.6);
        needle.translate(px + (n === 0 ? 0.07 * s : -0.07 * s), py, pz);
        elbowSpines.push(needle);
      }
    }

    if (shoulderSpines.length > 0) {
      const merged = mergeGeometries(shoulderSpines);
      if (merged) {
        b.part(merged, SPINE_COLOR, {
          bone: arm.shoulder,
          at: [0, 0, 0],
          group: `arm${arm.side}`,
        });
      }
    }

    if (elbowSpines.length > 0) {
      const merged = mergeGeometries(elbowSpines);
      if (merged) {
        b.part(merged, SPINE_COLOR, {
          bone: arm.elbow,
          at: [0, 0, 0],
          group: `arm${arm.side}`,
        });
      }
    }
  }

  return b.root;
}
