import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { catmull, polyline } from "../src/path";
import type { Chain } from "../src/skeleton";
import { svg } from "../src/texture";

export const meta = {
  name: "Siege Snail",
  description:
    "A 3 m rideable war mount: an armoured snail with eye stalks and an articulated jaw, an iron-banded shell carrying a rotating wooden cannon turret, a front saddle with reins, side banners and shields, and a goblin driver.",
  builtBy: "Gemini 3.8 Flash",
};

// -----------------------------------------------------------------------------
// Colour Palette
// -----------------------------------------------------------------------------
const SNAIL_FLESH = "#829958";
const SNAIL_BELLY = "#b2c58b";

const SNAIL_LIP = "#4d6030";
const SNAIL_TONGUE = "#c26372";
const EYE_CORNEA = "#eef0d8";
const EYE_PUPIL = "#1a1c14";

const SHELL_MAIN = "#5c4033";
const SHELL_LIGHT = "#7a5943";
const SHELL_DARK = "#3d281e";

const IRON_BAND = "#4a4e54";
const IRON_DARK = "#2e3236";
const IRON_RIVET = "#6a7078";
const BRASS_GOLD = "#c49a38";

const WOOD_PLANK = "#8a582d";
const WOOD_DARK = "#5c3818";
const WOOD_LIGHT = "#b07842";

const LEATHER_SADDLE = "#69381e";
const LEATHER_STRAP = "#4a2411";


const GOBLIN_SKIN = "#68a342";
const GOBLIN_SKIN_DARK = "#487a27";
const GOBLIN_EAR_INNER = "#996252";
const GOBLIN_CLOTH = "#783e28";
const GOBLIN_CLOTH_ALT = "#3a4f66";

const SHIELD_WOOD = "#6e4827";
const SHIELD_RIM = "#3b3e42";

// -----------------------------------------------------------------------------
// Textures (Shield heraldry, Goblin face, Cannon runes/insignia)
// -----------------------------------------------------------------------------
function goblinFaceTex() {
  return svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <!-- Glow eyes -->
      <polygon points="28,46 48,40 56,48 42,56" fill="#f0c030"/>
      <polygon points="36,46 46,43 48,48 40,50" fill="#cc2211"/>
      <circle cx="43" cy="46" r="2.5" fill="#111111"/>

      <polygon points="100,46 80,40 72,48 86,56" fill="#f0c030"/>
      <polygon points="92,46 82,43 80,48 88,50" fill="#cc2211"/>
      <circle cx="85" cy="46" r="2.5" fill="#111111"/>

      <!-- Pointy nose nostrils -->
      <polygon points="64,62 56,76 72,76" fill="#4d7522"/>
      <ellipse cx="60" cy="74" rx="2" ry="3" fill="#243810"/>
      <ellipse cx="68" cy="74" rx="2" ry="3" fill="#243810"/>

      <!-- Wicked grin & sharp needle teeth -->
      <path d="M 32,88 Q 64,112 96,88 Q 64,96 32,88 Z" fill="#241512"/>
      <!-- Lower and upper fangs -->
      <polygon points="40,89 44,97 48,90" fill="#fffbe8"/>
      <polygon points="52,91 56,99 60,92" fill="#fffbe8"/>
      <polygon points="68,92 72,99 76,91" fill="#fffbe8"/>
      <polygon points="80,90 84,97 88,89" fill="#fffbe8"/>
      <polygon points="46,101 50,93 54,102" fill="#fffbe8"/>
      <polygon points="74,102 78,93 82,101" fill="#fffbe8"/>

      <!-- Wrinkles / warpaint -->
      <line x1="26" y1="38" x2="52" y2="36" stroke="#3d631d" stroke-width="3" stroke-linecap="round"/>
      <line x1="102" y1="38" x2="76" y2="36" stroke="#3d631d" stroke-width="3" stroke-linecap="round"/>
      <line x1="28" y1="62" x2="48" y2="68" stroke="#8c231b" stroke-width="4" stroke-linecap="round"/>
      <line x1="100" y1="62" x2="80" y2="68" stroke="#8c231b" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
}

function bannerEmblemTex() {
  return svg(
    `<svg viewBox="0 0 128 256" xmlns="http://www.w3.org/2000/svg">
      <!-- Deep crimson background cloth -->
      <polygon points="6,6 122,6 122,250 64,220 6,250" fill="#9e2a2b"/>
      <!-- Ornate border -->
      <polygon points="10,10 118,10 118,240 64,212 10,240" fill="none" stroke="#d4af37" stroke-width="4"/>
      <line x1="14" y1="16" x2="114" y2="16" stroke="#d4af37" stroke-width="2"/>
      <circle cx="64" cy="90" r="32" fill="#d4af37"/>
      <circle cx="64" cy="90" r="26" fill="#9e2a2b"/>
      <!-- Snail shell spiral icon -->
      <path d="M 64,72 A 18,18 0 0,1 82,90 A 14,14 0 0,1 68,104 A 10,10 0 0,1 58,94 A 6,6 0 0,1 64,88" fill="none" stroke="#d4af37" stroke-width="4" stroke-linecap="round"/>
      <!-- Crossed cannons / spikes -->
      <line x1="36" y1="160" x2="92" y2="130" stroke="#d4af37" stroke-width="5" stroke-linecap="round"/>
      <line x1="92" y1="160" x2="36" y2="130" stroke="#d4af37" stroke-width="5" stroke-linecap="round"/>
      <!-- Banner swallowtail cutouts at bottom -->
      <polygon points="12,230 64,210 116,230 116,246 64,226 12,246" fill="#d4af37"/>
    </svg>`,
    { size: 256 },
  );
}

function shieldEmblemTex() {
  return svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="58" fill="#54381e" stroke="#2b2d30" stroke-width="8"/>
      <!-- Iron boss in center with brass rim -->
      <circle cx="64" cy="64" r="26" fill="#42464d" stroke="#c49a38" stroke-width="4"/>
      <circle cx="64" cy="64" r="12" fill="#2b2d30"/>
      <!-- Spikes / Rivets around boss -->
      <circle cx="64" cy="24" r="4" fill="#a0a6b0"/>
      <circle cx="64" cy="104" r="4" fill="#a0a6b0"/>
      <circle cx="24" cy="64" r="4" fill="#a0a6b0"/>
      <circle cx="104" cy="64" r="4" fill="#a0a6b0"/>
      <circle cx="36" cy="36" r="3.5" fill="#a0a6b0"/>
      <circle cx="92" cy="36" r="3.5" fill="#a0a6b0"/>
      <circle cx="36" cy="92" r="3.5" fill="#a0a6b0"/>
      <circle cx="92" cy="92" r="3.5" fill="#a0a6b0"/>
      <!-- Goblin red slash warpaint across shield -->
      <polygon points="28,24 40,20 108,100 96,104" fill="#9e2a2b"/>
    </svg>`,
    { size: 256 },
  );
}

// -----------------------------------------------------------------------------
// Main Builder
// -----------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "siegeSnail", detail: 0.9 });


  // ===========================================================================
  // 1. SKELETON
  // ===========================================================================
  // Dimensions: Snail ~3.0m long, resting flat on y = 0.
  // Foot bottom touches y = 0.
  // Root joint at hips / mantle center: [0, 0.45, -0.1]
  const hips = b.joint("hips", {
    at: [0, 0.45, -0.1],
    dir: [0, 0, 1],
    role: "spine",
    group: "body",
  });

  // Spine forward toward neck and head
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.45, -0.1],
      [0, 0.42, 0.4],
      [0, 0.48, 0.85],
    ]),
    {
      parent: hips,
      count: 2,
      names: ["spine1", "chest"],
      role: "spine",
      group: "body",
    },
  );
  const chest = spine.joints[1];

  // Neck rising upward toward head
  const neck = b.chain(
    "neck",
    polyline([
      [0, 0.48, 0.85],
      [0, 0.62, 1.15],
      [0, 0.85, 1.35],
    ]),
    {
      parent: chest,
      count: 2,
      names: ["neck1", "neck2"],
      role: "neck",
      group: "neck",
    },
  );

  // Snail Head
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.95, 1.45],
    dir: [0, 0.2, 1],
    role: "head",
    group: "head",
  });

  // Snail Lower Jaw (mouth opening): hinge located at posterior underside of head
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.72, 1.35],
    aim: [0, 0.68, 1.68],
    role: "jaw",
    group: "jaw",
  });
  // Eye stalks (tentacles): Left and Right
  // Each eye stalk is a 2-bone tentacle chain rising from the head
  const eyeStalks: Record<string, Chain> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const basePt = [s * 0.16, 1.05, 1.48] as const;
    const midPt = [s * 0.26, 1.35, 1.55] as const;
    const tipPt = [s * 0.32, 1.58, 1.62] as const;

    const stalkChain = b.chain(
      `eyeStalk${side}`,
      catmull([basePt, midPt, tipPt]),
      {
        parent: head,
        count: 2,
        names: [`eyeStalk1${side}`, `eyeStalk2${side}`],
        role: "tentacle",
        group: "head",
      },
    );
    eyeStalks[side] = stalkChain;
  }

  // Sensory lower tentacles / feelers (labial tentacles)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const feelerBase = [s * 0.14, 0.9, 1.62] as const;
    const feelerTip = [s * 0.22, 0.78, 1.82] as const;
    b.chain(
      `feeler${side}`,
      polyline([feelerBase, feelerTip]),
      {
        parent: head,
        count: 1,
        names: [`feeler${side}`],
        role: "tentacle",
        group: "head",
      },
    );
  }

  // Tail (posterior foot)
  const tail = b.chain(
    "tail",
    polyline([
      [0, 0.45, -0.1],
      [0, 0.35, -0.65],
      [0, 0.22, -1.15],
      [0, 0.08, -1.45],
    ]),
    {
      parent: hips,
      count: 3,
      names: ["tail1", "tail2", "tail3"],
      role: "tail",
      group: "tail",
    },
  );

  // Turret Mount Joint on Shell (Rotatable base for the cannon!)
  // Placed high on the shell
  const turretBase = b.joint("turretBase", {
    parent: hips,
    at: [0, 1.72, -0.22],
    dir: [0, 0, 1],
    role: "hinge",
    group: "turret",
  });

  // Cannon Pitch Joint (aims elevation up/down)
  const cannonElevation = b.joint("cannon", {
    parent: turretBase,
    at: [0, 1.95, -0.12],
    aim: [0, 2.05, 0.95],
    role: "hinge",
    group: "turret",
  });

  // Goblin Driver Rig (Seated in front of the shell, attached to saddle/chest)
  const goblinPelvis = b.joint("goblinPelvis", {
    parent: chest,
    at: [0, 1.05, 0.62],
    dir: [0, 1, 0.2],
    role: "spine",
    group: "goblin",
  });

  const goblinChest = b.joint("goblinChest", {
    parent: goblinPelvis,
    at: [0, 1.25, 0.65],
    dir: [0, 1, 0.15],
    role: "spine",
    group: "goblin",
  });

  const goblinHead = b.joint("goblinHead", {
    parent: goblinChest,
    at: [0, 1.45, 0.68],
    dir: [0, 0.1, 1],
    role: "head",
    group: "goblin",
  });
  const goblinArms: Record<string, Chain> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulderPt = [s * 0.14, 1.28, 0.66] as const;
    const elbowPt = [s * 0.22, 1.15, 0.8] as const;
    const wristPt = [s * 0.16, 1.08, 0.96] as const; // Reaching forward holding reins

    const armChain = b.chain(
      `goblinArm${side}`,
      catmull([shoulderPt, elbowPt, wristPt]),
      {
        parent: goblinChest,
        count: 2,
        names: [`goblinShoulder${side}`, `goblinWrist${side}`],
        role: "arm",
        group: "goblin",
      },
    );
    goblinArms[side] = armChain;

    // Goblin Legs bent in saddle stirrups
    const hipPt = [s * 0.11, 1.03, 0.6] as const;
    const kneePt = [s * 0.18, 0.96, 0.74] as const;
    const footPt = [s * 0.16, 0.8, 0.68] as const;
    b.chain(`goblinLeg${side}`, catmull([hipPt, kneePt, footPt]), {
      parent: goblinPelvis,
      count: 2,
      names: [`goblinHip${side}`, `goblinFoot${side}`],
      role: "leg",
      group: "goblin",
    });
  }

  // ===========================================================================
  // 2. GEOMETRY: SNAIL SOFT BODY (FOOT, NECK, HEAD, MOUTH)
  // ===========================================================================
  // Snail body centreline from posterior tail to anterior head
  // ry is 0.18 everywhere along this horizontal path at height 0.18,
  // with sides: 8 (even count, top and bottom flat faces at exact radius).
  // So bottom face sits exactly at y = 0.18 - 0.18 = 0.000 m!
  const footPath = catmull([
    [0, 0.18, -1.45],
    [0, 0.18, -1.0],
    [0, 0.18, -0.4],
    [0, 0.18, 0.2],
    [0, 0.18, 0.75],
    [0, 0.18, 1.25],
    [0, 0.18, 1.55], // Front lip of foot
  ]);

  // Wide flat crawling sole (rests on y = 0)
  b.sweep(
    footPath,
    (t) => {
      const rx = 0.35 + 0.32 * Math.sin(t * 2.8);
      return [rx, 0.18];
    },
    {
      bone: [tail, hips, spine],
      color: SNAIL_BELLY,
      sides: 8,
      smooth: true,
      caps: "round",
      group: "body",
      name: "snailFootSole",
    },
  );

  // Upper fleshy body loft/sweep connecting into neck and head
  const upperBodyPath = catmull([
    [0, 0.38, -1.1],
    [0, 0.48, -0.4],
    [0, 0.55, 0.2],
    [0, 0.65, 0.8],
    [0, 0.82, 1.15],
    [0, 0.98, 1.42], // Snout / head apex
  ]);

  b.sweep(
    upperBodyPath,
    (t) => {
      const rx = 0.24 + 0.28 * Math.sin(t * 2.6);
      const ry = 0.22 + 0.22 * Math.sin(t * 2.6);
      return [rx, ry];
    },
    {
      bone: [tail, hips, spine, neck, head],
      color: SNAIL_FLESH,
      sides: 12,
      smooth: true,
      caps: "round",
      group: "body",
      name: "snailUpperBody",
    },
  );

  // Head details: upper head dome & arched snout
  b.part(
    new THREE.SphereGeometry(0.24, 10, 8),
    SNAIL_FLESH,
    {
      bone: head,
      at: [0, 0.98, 1.44],
      scale: [1.1, 0.85, 1.15],
      group: "head",
      name: "headSnout",
    },
  );

  // Upper beak/lip arch on head
  b.part(
    new THREE.CylinderGeometry(0.18, 0.22, 0.16, 8),
    SNAIL_LIP,
    {
      bone: head,
      at: [0, 0.86, 1.58],
      rotation: [45, 0, 0],
      group: "head",
      name: "upperMouth",
    },
  );

  // Lower Jaw: scoop chin and radula floor
  b.part(
    new THREE.BoxGeometry(0.32, 0.12, 0.32),
    SNAIL_LIP,
    {
      bone: jaw,
      at: [0, 0.68, 1.54],
      rotation: [-10, 0, 0],
      group: "jaw",
      name: "lowerJawPlate",
    },
  );

  // Fleshy tongue nestled inside open lower jaw
  b.part(
    new THREE.CylinderGeometry(0.09, 0.12, 0.22, 8),
    SNAIL_TONGUE,
    {
      bone: jaw,
      at: [0, 0.74, 1.52],
      rotation: [60, 0, 0],
      group: "jaw",
      name: "tongue",
    },
  );

  // Eye Stalks & Eyeballs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const stalk = eyeStalks[side];

    // Articulated tentacle sweep
    b.sweep(
      stalk,
      (t) => 0.045 * (1 - 0.35 * t),
      {
        color: SNAIL_FLESH,
        sides: 8,
        smooth: true,
        group: "head",
        name: `eyeStalkTube${side}`,
      },
    );

    // Tip eyeball bulb
    const stalkEnd = stalk.joints[1];
    b.part(
      new THREE.SphereGeometry(0.085, 10, 8),
      EYE_CORNEA,
      {
        bone: stalkEnd,
        at: [s * 0.33, 1.62, 1.66],
        group: "head",
        name: `eyeball${side}`,
      },
    );

    // Dark glossy pupil (flattened cylinder disk)
    b.part(
      new THREE.CylinderGeometry(0.045, 0.045, 0.02, 8),
      EYE_PUPIL,
      {
        bone: stalkEnd,
        at: [s * 0.34, 1.63, 1.73],
        rotation: [90, 0, 0],
        group: "head",
        name: `pupil${side}`,
      },
    );

    // Lower sensory feeler sweeps
    const feelerBase = [s * 0.14, 0.9, 1.62] as const;
    const feelerMid = [s * 0.2, 0.82, 1.74] as const;
    const feelerTip = [s * 0.26, 0.74, 1.84] as const;
    b.sweep(
      catmull([feelerBase, feelerMid, feelerTip]),
      (t) => 0.026 * (1 - 0.7 * t),
      {
        bone: head,
        color: SNAIL_LIP,
        sides: 6,
        smooth: true,
        caps: "point",
        group: "head",
        name: `feelerTube${side}`,
      },
    );
  }

  // ===========================================================================
  // 3. THE GIANT ARMOURED SHELL WITH IRON BANDS
  // ===========================================================================
  // The shell sits over the hips/spine (x: 0, y: 1.15, z: -0.25)
  // Large coiled whorl shell constructed using spiral & segmented torus/cylinders


  // Massive main shell bulb (whorl body)
  b.part(
    new THREE.SphereGeometry(0.88, 14, 10),
    SHELL_MAIN,
    {
      bone: hips,
      at: [0, 1.25, -0.25],
      scale: [0.92, 1.05, 1.12],
      group: "shell",
      name: "shellMainWhorl",
    },
  );

  // Secondary spiral whorl behind it
  b.part(
    new THREE.SphereGeometry(0.68, 12, 8),
    SHELL_DARK,
    {
      bone: hips,
      at: [0, 1.28, -0.72],
      scale: [0.82, 0.95, 0.98],
      group: "shell",
      name: "shellRearWhorl",
    },
  );

  // Tertiary apex spiral whorl at the back
  b.part(
    new THREE.SphereGeometry(0.46, 10, 8),
    SHELL_LIGHT,
    {
      bone: hips,
      at: [0, 1.32, -1.08],
      scale: [0.72, 0.85, 0.85],
      group: "shell",
      name: "shellApexWhorl",
    },
  );

  // Shell mouth aperture rim (flaring collar where the snail body emerges)
  b.part(
    new THREE.TorusGeometry(0.68, 0.12, 8, 16),
    SHELL_DARK,
    {
      bone: hips,
      at: [0, 1.08, 0.38],
      rotation: [25, 0, 0],
      group: "shell",
      name: "shellCollar",
    },
  );

  // Heavy Iron Armor Bands reinforcing the shell
  // Longitudinal and hoop bands with iron rivets
  const bandHoops = [
    { z: -0.85, r: 0.62, thick: 0.08, w: 0.12, rotX: 12 },
    { z: -0.42, r: 0.86, thick: 0.09, w: 0.14, rotX: 5 },
    { z: 0.02, r: 0.84, thick: 0.09, w: 0.14, rotX: -8 },
    { z: 0.36, r: 0.72, thick: 0.08, w: 0.13, rotX: -20 },
  ];

  for (let i = 0; i < bandHoops.length; i++) {
    const hoop = bandHoops[i];
    b.part(
      new THREE.CylinderGeometry(hoop.r + hoop.thick, hoop.r + hoop.thick, hoop.w, 16, 1, true),
      IRON_BAND,
      {
        bone: hips,
        at: [0, 1.25, hoop.z],
        rotation: [90 + hoop.rotX, 0, 0],
        group: "shellArmor",
        name: `ironHoopBand${i + 1}`,
      },
    );

    // Spikes / Rivets placed around the iron hoop
    const rivetCount = 8;
    for (let j = 0; j < rivetCount; j++) {
      const ang = (j / rivetCount) * Math.PI * 2;
      // Skip underside near snail belly and very top under turret
      if (Math.sin(ang) < -0.25 || Math.sin(ang) > 0.88) continue;
      const cosA = Math.cos(ang);
      const sinA = Math.sin(ang);
      const rad = hoop.r + hoop.thick;
      const rx = cosA * rad;
      const localY = sinA * rad;
      // Rotate by hoop tilt about X axis:
      const rotRad = (hoop.rotX * Math.PI) / 180;
      const ry = 1.25 + localY * Math.cos(rotRad);
      const rz = hoop.z - localY * Math.sin(rotRad);

      b.part(
        new THREE.ConeGeometry(0.045, 0.08, 5),
        IRON_RIVET,
        {
          bone: hips,
          at: [rx, ry, rz],
          dir: [cosA, sinA * Math.cos(rotRad), -sinA * Math.sin(rotRad)],
          group: "shellArmor",
          name: `shellSpike_${i}_${j}`,
        },
      );
    }
  }

  // Longitudinal iron spine crest running down top of shell
  const spinePlates = 5;
  for (let k = 0; k < spinePlates; k++) {
    const t = k / (spinePlates - 1);
    const pz = 0.35 + (-1.05 - 0.35) * t;
    const py = 1.25 + 0.88 * Math.cos((t - 0.4) * 1.8);
    b.part(
      new THREE.BoxGeometry(0.18, 0.12, 0.28),
      IRON_DARK,
      {
        bone: hips,
        at: [0, py, pz],
        rotation: [-15 + t * 30, 0, 0],
        group: "shellArmor",
        name: `spineArmorPlate${k + 1}`,
      },
    );
  }

  // ===========================================================================
  // 4. ROTATING WOODEN TURRET & CANNON PLATFORM
  // ===========================================================================
  // Turret base ring on top of shell
  b.part(
    new THREE.CylinderGeometry(0.62, 0.66, 0.14, 12),
    WOOD_DARK,
    {
      bone: hips,
      at: [0, 1.84, -0.22],
      group: "turret",
      name: "turretMountRing",
    },
  );

  // Iron bearing track ring
  b.part(
    new THREE.TorusGeometry(0.58, 0.045, 8, 16),
    IRON_BAND,
    {
      bone: hips,
      at: [0, 1.9, -0.22],
      rotation: [90, 0, 0],
      group: "turret",
      name: "turretBearingRing",
    },
  );

  // Rotating Turret Platform (Rides turretBase joint!)
  b.part(
    new THREE.CylinderGeometry(0.55, 0.55, 0.12, 10),
    WOOD_PLANK,
    {
      bone: turretBase,
      at: [0, 1.96, -0.22],
      group: "turret",
      name: "turretFloorPlanks",
    },
  );

  // Wooden parapet / palisade battlements around the turret platform
  const postCount = 7;
  for (let p = 0; p < postCount; p++) {
    const ang = (p / postCount) * Math.PI * 1.6 + 0.65; // open in front for cannon traversal
    const cosA = Math.cos(ang);
    const sinA = Math.sin(ang);
    const px = cosA * 0.48;
    const pz = -0.22 + sinA * 0.48;

    // Upright wooden post
    b.part(
      new THREE.BoxGeometry(0.1, 0.38, 0.1),
      WOOD_DARK,
      {
        bone: turretBase,
        at: [px, 2.15, pz],
        group: "turret",
        name: `parapetPost${p + 1}`,
      },
    );

    // Plank shield siding
    if (p < postCount - 1) {
      const nextAng = ((p + 1) / postCount) * Math.PI * 1.6 + 0.65;
      const midAng = (ang + nextAng) / 2;
      b.part(
        new THREE.BoxGeometry(0.24, 0.28, 0.05),
        WOOD_LIGHT,
        {
          bone: turretBase,
          at: [Math.cos(midAng) * 0.48, 2.16, -0.22 + Math.sin(midAng) * 0.48],
          rotation: [0, (-midAng * 180) / Math.PI + 90, 0],
          group: "turret",
          name: `parapetPlank${p + 1}`,
        },
      );
    }
  }

  // Cannon Trunnion carriage cheeks (Mounted on turretBase)
  for (const s of [1, -1]) {
    b.part(
      new THREE.BoxGeometry(0.12, 0.38, 0.42),
      WOOD_DARK,
      {
        bone: turretBase,
        at: [s * 0.22, 2.14, -0.16],
        group: "turret",
        name: `carriageCheek${s > 0 ? "L" : "R"}`,
      },
    );
    // Iron reinforcement brackets on cheeks
    b.part(
      new THREE.BoxGeometry(0.14, 0.08, 0.44),
      IRON_BAND,
      {
        bone: turretBase,
        at: [s * 0.22, 2.12, -0.16],
        group: "turret",
        name: `cheekIronPlate${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // The Cannon (rides cannonElevation joint for swiveling & aiming!)
  // Heavy cast-iron bombard / cannon barrel
  // 1. Rear breech button & cascabel
  b.part(
    new THREE.SphereGeometry(0.14, 10, 8),
    IRON_DARK,
    {
      bone: cannonElevation,
      at: [0, 2.14, -0.44],
      group: "weapon",
      name: "cannonCascabel",
    },
  );

  // 2. Main barrel cylinder (tapered)
  b.part(
    new THREE.CylinderGeometry(0.13, 0.17, 0.95, 10),
    IRON_BAND,
    {
      bone: cannonElevation,
      at: [0, 2.15, 0.06],
      rotation: [78, 0, 0], // elevated slightly upward
      group: "weapon",
      name: "cannonBarrel",
    },
  );

  // 3. Muzzle ring / bell flare
  b.part(
    new THREE.CylinderGeometry(0.17, 0.14, 0.12, 10),
    BRASS_GOLD,
    {
      bone: cannonElevation,
      at: [0, 2.24, 0.54],
      rotation: [78, 0, 0],
      group: "weapon",
      name: "cannonMuzzleRing",
    },
  );

  // 4. Dark hollow bore
  b.part(
    new THREE.CylinderGeometry(0.09, 0.09, 0.15, 8),
    "#111114",
    {
      bone: cannonElevation,
      at: [0, 2.25, 0.56],
      rotation: [78, 0, 0],
      group: "weapon",
      name: "cannonBore",
    },
  );

  // 5. Brass reinforce rings around the barrel
  for (const bz of [-0.22, 0.05, 0.32]) {
    b.part(
      new THREE.TorusGeometry(0.16, 0.024, 6, 12),
      BRASS_GOLD,
      {
        bone: cannonElevation,
        at: [0, 2.14 + (bz + 0.1) * 0.2, bz],
        rotation: [78, 0, 0],
        group: "weapon",
        name: `cannonBrassRing_${bz}`,
      },
    );
  }

  // ===========================================================================
  // 5. SADDLE, REINS & GOBLIN DRIVER
  // ===========================================================================
  // Saddle mounted in front of shell on the neck/chest hump
  b.part(
    new THREE.BoxGeometry(0.48, 0.16, 0.44),
    LEATHER_SADDLE,
    {
      bone: chest,
      at: [0, 0.98, 0.62],
      rotation: [12, 0, 0],
      group: "saddle",
      name: "saddleSeat",
    },
  );

  // High cantle behind goblin and pommel in front
  b.part(
    new THREE.BoxGeometry(0.42, 0.22, 0.1),
    LEATHER_STRAP,
    {
      bone: chest,
      at: [0, 1.12, 0.44],
      rotation: [-15, 0, 0],
      group: "saddle",
      name: "saddleCantle",
    },
  );
  b.part(
    new THREE.BoxGeometry(0.34, 0.18, 0.1),
    BRASS_GOLD,
    {
      bone: chest,
      at: [0, 1.08, 0.82],
      rotation: [22, 0, 0],
      group: "saddle",
      name: "saddlePommel",
    },
  );

  // Saddle Girth Straps wrapping under snail body
  for (const s of [1, -1]) {
    b.part(
      new THREE.BoxGeometry(0.08, 0.52, 0.1),
      LEATHER_STRAP,
      {
        bone: chest,
        at: [s * 0.28, 0.76, 0.62],
        rotation: [0, 0, s * 22],
        group: "saddle",
        name: `saddleGirth${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // Reins from driver's hands down to snail head/harness
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const handPt = [s * 0.16, 1.08, 0.96] as const;
    const bitPt = [s * 0.18, 0.92, 1.48] as const;
    const reinsMid = [s * 0.22, 0.98, 1.22] as const;

    b.sweep(
      catmull([handPt, reinsMid, bitPt]),
      0.015,
      {
        bone: chest,
        color: LEATHER_STRAP,
        sides: 5,
        group: "saddle",
        name: `reins${side}`,
      },
    );

    // Bridle straps on snail head
    b.part(
      new THREE.TorusGeometry(0.24, 0.02, 6, 12),
      LEATHER_STRAP,
      {
        bone: head,
        at: [0, 0.94, 1.45],
        rotation: [65, 0, 0],
        group: "head",
        name: `bridleLoop${side}`,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // GOBLIN DRIVER BODY
  // ---------------------------------------------------------------------------
  // Torso / Tunic
  b.part(
    new THREE.CylinderGeometry(0.14, 0.17, 0.32, 8),
    GOBLIN_CLOTH,
    {
      bone: goblinChest,
      at: [0, 1.22, 0.66],
      rotation: [12, 0, 0],
      group: "goblin",
      name: "goblinTorso",
    },
  );

  // Belt with pouches & brass buckle
  b.part(
    new THREE.BoxGeometry(0.32, 0.08, 0.28),
    LEATHER_STRAP,
    {
      bone: goblinPelvis,
      at: [0, 1.08, 0.64],
      group: "goblin",
      name: "goblinBelt",
    },
  );
  b.part(
    new THREE.BoxGeometry(0.08, 0.09, 0.04),
    BRASS_GOLD,
    {
      bone: goblinPelvis,
      at: [0, 1.08, 0.78],
      group: "goblin",
      name: "goblinBuckle",
    },
  );
  b.part(
    new THREE.BoxGeometry(0.08, 0.1, 0.08),
    LEATHER_SADDLE,
    {
      bone: goblinPelvis,
      at: [0.15, 1.07, 0.68],
      group: "goblin",
      name: "goblinPouchR",
    },
  );

  // Goblin Legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // Thigh
    b.part(
      new THREE.CylinderGeometry(0.07, 0.06, 0.22, 6),
      GOBLIN_CLOTH_ALT,
      {
        bone: goblinPelvis,
        at: [s * 0.15, 1.0, 0.66],
        rotation: [55, 0, s * 22],
        group: "goblin",
        name: `goblinThigh${side}`,
      },
    );
    // Shin & Boot in stirrups
    b.part(
      new THREE.CylinderGeometry(0.06, 0.05, 0.22, 6),
      LEATHER_STRAP,
      {
        bone: goblinPelvis,
        at: [s * 0.18, 0.88, 0.72],
        rotation: [-15, 0, 0],
        group: "goblin",
        name: `goblinBoot${side}`,
      },
    );
  }

  // Goblin Arms & Hands (holding reins)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = goblinArms[side];
    b.sweep(
      arm,
      (t) => 0.05 * (1 - 0.25 * t),
      {
        color: GOBLIN_SKIN,
        sides: 6,
        smooth: true,
        group: "goblin",
        name: `goblinArmTube${side}`,
      },
    );
    // Green goblin fist clutching reins (hexagonal faceted box-fist)
    b.part(
      new THREE.BoxGeometry(0.09, 0.08, 0.1),
      GOBLIN_SKIN_DARK,
      {
        bone: arm.joints[1],
        at: [s * 0.16, 1.08, 0.96],
        group: "goblin",
        name: `goblinFist${side}`,
      },
    );
  }

  // Goblin Head
  b.part(
    new THREE.SphereGeometry(0.15, 10, 8),
    GOBLIN_SKIN,
    {
      bone: goblinHead,
      at: [0, 1.48, 0.68],
      scale: [1.1, 0.95, 1.0],
      group: "goblin",
      name: "goblinSkull",
    },
  );

  // Textured face plane on goblin face
  b.part(
    new THREE.PlaneGeometry(0.24, 0.24),
    "#ffffff",
    {
      bone: goblinHead,
      at: [0, 1.48, 0.83],
      dir: [0, 0, 1],
      axis: "z",
      texture: goblinFaceTex(),
      group: "goblin",
      name: "goblinFacePlate",
    },
  );

  // Big pointed Goblin Ears extending sideways
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const earBase = [s * 0.14, 1.5, 0.66] as const;
    const earMid = [s * 0.26, 1.54, 0.6] as const;
    const earTip = [s * 0.38, 1.58, 0.52] as const;

    b.sweep(
      polyline([earBase, earMid, earTip]),
      (t) => [0.06 * (1 - t) + 0.005, 0.018 * (1 - t) + 0.003],
      {
        bone: goblinHead,
        color: GOBLIN_SKIN,
        sides: 6,
        smooth: true,
        caps: "point",
        group: "goblin",
        name: `goblinEar${side}`,
      },
    );

    // Inner ear pinkish flare
    b.part(
      new THREE.SphereGeometry(0.04, 6, 4),
      GOBLIN_EAR_INNER,
      {
        bone: goblinHead,
        at: [s * 0.22, 1.52, 0.62],
        scale: [1, 0.5, 0.5],
        group: "goblin",
        name: `goblinInnerEar${side}`,
      },
    );
  }

  // Goblin leather aviator cap / helmet with bronze goggles
  b.part(
    new THREE.SphereGeometry(0.155, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
    LEATHER_STRAP,
    {
      bone: goblinHead,
      at: [0, 1.49, 0.67],
      scale: [1.12, 1.0, 1.05],
      group: "goblin",
      name: "goblinHelmet",
    },
  );
  // Goggles pushed up on brow (clean low-poly rings)
  for (const s of [1, -1]) {
    b.part(
      new THREE.CylinderGeometry(0.046, 0.046, 0.025, 8, 1, true),
      BRASS_GOLD,
      {
        bone: goblinHead,
        at: [s * 0.06, 1.57, 0.77],
        rotation: [70, 0, 0],
        group: "goblin",
        name: `goggleRim${s > 0 ? "L" : "R"}`,
      },
    );
    b.part(
      new THREE.CircleGeometry(0.044, 8),
      "#628a9e",
      {
        bone: goblinHead,
        at: [s * 0.06, 1.57, 0.775],
        rotation: [-20, 0, 0],
        group: "goblin",
        name: `goggleLens${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // ===========================================================================
  // 6. WAR BANNERS & HUNG SHIELDS
  // ===========================================================================
  const bannerTex = bannerEmblemTex();
  const shieldTex = shieldEmblemTex();

  // Banners streaming from the turret / shell rear
  // Two tall banner poles mounted to turret rear sides
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Wooden pole
    b.part(
      new THREE.CylinderGeometry(0.024, 0.028, 1.2, 6),
      WOOD_DARK,
      {
        bone: turretBase,
        at: [s * 0.48, 2.58, -0.43],
        rotation: [-6, 0, s * 4],
        group: "banners",
        name: `bannerPole${side}`,
      },
    );

    // Brass spearhead finial on pole
    b.part(
      new THREE.ConeGeometry(0.045, 0.16, 5),
      BRASS_GOLD,
      {
        bone: turretBase,
        at: [s * 0.52, 3.22, -0.49],
        group: "banners",
        name: `bannerSpearhead${side}`,
      },
    );

    // Hanging fabric banner (cards with lean: 180 and flow: [0, 0, -1])
    b.cards(
      [frame([s * 0.52, 3.12, -0.49], [0, 1, 0])],
      bannerTex,
      {
        size: [0.42, 0.95],
        lean: 180,
        flow: [0, 0, -1],
        bone: turretBase,
        group: "banners",
        name: `warBannerCloth${side}`,
      },
    );
  }

  // War Shields hung along both sides of the shell (3 per side)
  const shieldPositions = [
    { z: -0.65, y: 1.05, rx: 0.84, rotY: -25 },
    { z: -0.15, y: 1.12, rx: 0.94, rotY: 0 },
    { z: 0.32, y: 1.02, rx: 0.82, rotY: 28 },
  ];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (let i = 0; i < shieldPositions.length; i++) {
      const pos = shieldPositions[i];
      const sx = s * pos.rx;

      // Wooden shield boss backing
      b.part(
        new THREE.CylinderGeometry(0.24, 0.24, 0.04, 10),
        SHIELD_WOOD,
        {
          bone: hips,
          at: [sx, pos.y, pos.z],
          dir: [s, 0, 0],
          rotation: [0, s * (90 + pos.rotY), 0],
          group: "shields",
          name: `shieldBody_${side}_${i + 1}`,
        },
      );

      // Iron rim
      b.part(
        new THREE.TorusGeometry(0.24, 0.025, 6, 12),
        SHIELD_RIM,
        {
          bone: hips,
          at: [sx + s * 0.02, pos.y, pos.z],
          rotation: [0, s * (90 + pos.rotY), 0],
          group: "shields",
          name: `shieldRim_${side}_${i + 1}`,
        },
      );

      // Textured shield face emblem
      b.part(
        new THREE.CircleGeometry(0.23, 10),
        "#ffffff",
        {
          bone: hips,
          at: [sx + s * 0.025, pos.y, pos.z],
          rotation: [0, s > 0 ? 90 + pos.rotY : -90 - pos.rotY, 0],
          texture: shieldTex,
          group: "shields",
          name: `shieldEmblem_${side}_${i + 1}`,
        },
      );

      // Hanging leather strap connecting shield to shell iron hoop
      b.part(
        new THREE.BoxGeometry(0.04, 0.22, 0.02),
        LEATHER_STRAP,
        {
          bone: hips,
          at: [sx - s * 0.02, pos.y + 0.18, pos.z],
          rotation: [0, s * (90 + pos.rotY), 0],
          group: "shields",
          name: `shieldStrap_${side}_${i + 1}`,
        },
      );
    }
  }

  // ===========================================================================
  // 7. REST POSE / ARTICULATION TWEAKS
  // ===========================================================================
  // Open the mouth noticeably so the jaw and tongue read clearly apart from upper head
  b.pose(jaw, { axis: [1, 0, 0], deg: 22 });
  // Angle eye stalks alertly
  b.pose(eyeStalks.L.joints[0], { axis: [0, 0, 1], deg: -10 });
  b.pose(eyeStalks.R.joints[0], { axis: [0, 0, 1], deg: 10 });

  // Aim cannon slightly elevated
  b.pose(cannonElevation, { axis: [1, 0, 0], deg: 6 });

  return b.root;
}
