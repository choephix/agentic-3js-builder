import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { DEG } from "../src/math";
import { catmull } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Space Marine",
  builtBy: "Gemini 3.8 Flash",
  description:
    "A grimdark power-armoured super-soldier in ornate ceramite: towering 2.3 m power armour with massive rounded pauldrons, backpack power plant with stabilizer exhaust spheres, Mk X style helmet with glowing ruby lenses and triangular vox grille, heavy flared armoured boots, ribbed joint cabling, chest Imperial Aquila emblem, purity seals with flowing oath parchment, Chapter heraldry, boxy bolt rifle with optical scope and roaring chainsword with hazard stripes.",
};

export default function build() {
  const b = createBuilder({ name: "spaceMarine" });

  // ---------------------------------------------------------------------------
  // Color Palette & Materials
  // ---------------------------------------------------------------------------
  const ARMOR_BLUE = "#1a3d8f"; // Ultramarine cobalt blue
  const ARMOR_DARK = "#0e2354"; // Deeper shade for recessed plates
  const TRIM_GOLD = "#d8a828"; // Imperial ornate gold trim
  const EAGLE_GOLD = "#ffd700"; // Gleaming Imperial Aquila
  const GUN_BLACK = "#1a1a20"; // Matte black weapon casing
  const GUN_METAL = "#484d56"; // Gunmetal mechanisms and barrels
  const METAL_SILVER = "#8f96a3"; // Polished steel & exhausts
  const JOINT_RUBBER = "#15151a"; // Ribbed flexible undersuit
  const EYE_LENS_RED = "#ff1824"; // Menacing glowing visor lenses
  const LEATHER_BROWN = "#50321a"; // Belt & holster leather
  const POUCH_BROWN = "#3d2514";
  const SEAL_WAX_RED = "#990b16"; // Purity seal red wax badge
  const PARCHMENT = "#e6d7b8"; // Parchment scripture ribbon
  const SKULL_WHITE = "#ded7cb"; // Bleached bone / skull badges
  const CHAIN_TEETH = "#e8eff7"; // Monomolecular razor teeth
  const HAZARD_YELLOW = "#f5b800"; // Hazard warning stripes

  // ---------------------------------------------------------------------------
  // Chapter Heraldry & Decal Textures
  // ---------------------------------------------------------------------------
  // Left Shoulder: Chapter Crest (Ultramarine Omega / Winged Star)
  const CHAPTER_DECAL = svg(
    `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stop-color="#1a3d8f"/>
          <stop offset="95%" stop-color="#0e2354"/>
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill="url(#bg)" stroke="#d8a828" stroke-width="6"/>
      <!-- Inverted Omega / Chapter Crest -->
      <path d="M35 84 L46 84 C46 65 52 45 60 45 C68 45 74 65 74 84 L85 84 C85 60 76 35 60 35 C44 35 35 60 35 84 Z" fill="#ffffff" stroke="#0e2354" stroke-width="2"/>
      <rect x="28" y="78" width="16" height="8" rx="2" fill="#ffffff" stroke="#0e2354" stroke-width="1.5"/>
      <rect x="76" y="78" width="16" height="8" rx="2" fill="#ffffff" stroke="#0e2354" stroke-width="1.5"/>
      <!-- Tiny central gold skull -->
      <circle cx="60" cy="55" r="5" fill="#ffd700"/>
    </svg>`,
    { size: 256 },
  );

  // Right Shoulder: Tactical Arrow / Crux
  const TACTICAL_DECAL = svg(
    `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg2" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stop-color="#1a3d8f"/>
          <stop offset="95%" stop-color="#0e2354"/>
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill="url(#bg2)" stroke="#d8a828" stroke-width="6"/>
      <!-- Tactical Arrow -->
      <path d="M60 22 L86 52 L68 52 L68 98 L52 98 L52 52 L34 52 Z" fill="#ffffff" stroke="#0e2354" stroke-width="2"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // Skeleton Definition (Total height approx 2.30 m)
  // Humanoid rest pose: arms held cleanly away from the massive torso and thighs.
  // ---------------------------------------------------------------------------
  const SIDES = [
    [1, "L"],
    [-1, "R"],
  ] as const;

  // Hips & Spine
  const hips = b.joint("hips", { at: [0, 1.15, 0], role: "spine", group: "torso" });
  const spine = b.chain(
    "spine",
    [
      [0, 1.18, 0],
      [0, 1.35, 0.02],
      [0, 1.55, 0.04],
      [0, 1.76, 0.04],
    ],
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine", group: "torso" },
  );
  const [spine1, spine2, chest] = spine.joints;

  // Neck & Head
  const neck = b.joint("neck", {
    parent: chest,
    at: [0, 1.76, 0.04],
    aim: [0, 1.86, 0.07],
    role: "neck",
    group: "head",
  });
  const head = b.joint("head", { parent: neck, at: [0, 1.86, 0.07], dir: [0, 1, 0], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.82, 0.08], aim: [0, 1.8, 0.22], role: "jaw", group: "head" });

  // Legs (Sturdy, wide power-armoured stance)
  const legs = SIDES.map(([s, side]) =>
    b.chain(
      `leg${side}`,
      [
        [s * 0.23, 1.12, -0.01],
        [s * 0.25, 0.62, 0.05],
        [s * 0.26, 0.22, -0.01],
        [s * 0.26, 0.09, 0.12],
        [s * 0.26, 0.04, 0.26],
      ],
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`, `toe${side}`],
        role: "leg",
        contact: [s * 0.26, 0, 0.16],
        group: `leg${side}`,
      },
    ),
  );

  // Arms (Rest pose: arms angled out ~38 degrees from body, elbows bent, forearms forward)
  const arms = SIDES.map(([s, side]) => {
    const clav = b.joint(`clavicle${side}`, {
      parent: chest,
      at: [s * 0.18, 1.7, 0.02],
      aim: [s * 0.44, 1.68, -0.01],
      role: "arm",
      group: `arm${side}`,
    });

    const shoulderPt: [number, number, number] = [s * 0.44, 1.68, -0.01];
    const elbowPt: [number, number, number] = [s * 0.72, 1.34, -0.04];
    const wristPt: [number, number, number] = [s * 0.94, 1.05, 0.08];
    const handPt: [number, number, number] = [s * 1.05, 0.92, 0.14];

    const chain = b.chain(`arm${side}`, [shoulderPt, elbowPt, wristPt, handPt], {
      parent: clav,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
      group: `arm${side}`,
    });

    return {
      s,
      side,
      shoulder: chain.joints[0],
      elbow: chain.joints[1],
      wrist: chain.joints[2],
    };
  });

  // ---------------------------------------------------------------------------
  // Geometry Construction
  // ---------------------------------------------------------------------------

  // --- 1. CONTINUOUS POWER-ARMOURED TORSO (Loft) ---
  b.loft(
    [
      { at: [0, 1.04, 0.01], w: 0.48, h: 0.32 }, // Lower pelvis
      { at: [0, 1.18, 0.02], w: 0.52, h: 0.35 }, // Waist / Belt level
      { at: [0, 1.35, 0.03], w: 0.56, h: 0.38 }, // Abdomen
      { at: [0, 1.54, 0.05], w: 0.74, h: 0.46 }, // Broad chest
      { at: [0, 1.68, 0.04], w: 0.7, h: 0.42 }, // Upper chest & shoulders
      { at: [0, 1.76, 0.04], w: 0.38, h: 0.32 }, // Neck base
    ],
    {
      bone: [hips, spine],
      color: ARMOR_BLUE,
      sides: 10,
      group: "torso",
      name: "torsoBase",
    },
  );

  // Segmented Abdominal Armor Plates (Lames) over the front
  for (let i = 0; i < 3; i++) {
    const ay = 1.25 + i * 0.075;
    const aw = 0.36 + i * 0.04;
    b.part(new THREE.BoxGeometry(aw, 0.06, 0.08), ARMOR_DARK, {
      bone: i === 0 ? hips : i === 1 ? spine1 : spine2,
      at: [0, ay, 0.2 + i * 0.015],
      rotation: [8 * DEG, 0, 0],
      group: "torso",
    });
    // Gold trim on center abdomen plate
    b.part(new THREE.BoxGeometry(0.08, 0.05, 0.085), TRIM_GOLD, {
      bone: i === 0 ? hips : i === 1 ? spine1 : spine2,
      at: [0, ay, 0.205 + i * 0.015],
      rotation: [8 * DEG, 0, 0],
      group: "torso",
    });
  }

  // Ribbed flexible joint cabling along torso flanks
  for (const [s] of SIDES) {
    for (let i = 0; i < 4; i++) {
      const cy = 1.24 + i * 0.065;
      b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.16, 8), JOINT_RUBBER, {
        bone: spine1,
        at: [s * 0.27, cy, 0.04],
        rotation: [0, 0, s * 20 * DEG],
        group: "torso",
      });
    }
  }

  // Massive Pectoral Armor Slabs
  for (const [s] of SIDES) {
    b.part(new THREE.BoxGeometry(0.32, 0.22, 0.14), ARMOR_BLUE, {
      bone: chest,
      at: [s * 0.18, 1.62, 0.22],
      rotation: [12 * DEG, -s * 15 * DEG, s * 5 * DEG],
      group: "torso",
    });
  }

  // Imperial Gorget (Protective high neck collar)
  b.part(new THREE.CylinderGeometry(0.2, 0.23, 0.1, 16, 1, true, -Math.PI * 0.48, Math.PI * 0.96), ARMOR_BLUE, {
    bone: chest,
    at: [0, 1.76, 0.06],
    group: "torso",
  });
  b.part(new THREE.TorusGeometry(0.2, 0.018, 8, 16, Math.PI * 0.96), TRIM_GOLD, {
    bone: chest,
    at: [0, 1.81, 0.06],
    rotation: [90 * DEG, 0, -Math.PI * 0.98],
    group: "torso",
  });

  // Imperial Aquila / Winged Skull Chest Emblem (Gold)
  // Central Skull
  b.part(new THREE.SphereGeometry(0.042, 12, 10), EAGLE_GOLD, {
    bone: chest,
    at: [0, 1.63, 0.33],
    scale: [0.95, 1.2, 0.85],
    group: "torso",
  });
  b.part(new THREE.BoxGeometry(0.034, 0.028, 0.03), EAGLE_GOLD, {
    bone: chest,
    at: [0, 1.6, 0.33],
    group: "torso",
  });
  // Tiered Aquila Wing Feathers spreading across the chest outwards and upwards
  for (const [s] of SIDES) {
    for (let f = 0; f < 6; f++) {
      const fx = s * (0.055 + f * 0.052);
      const fy = 1.63 + f * 0.024;
      const fz = 0.33 - f * 0.018;
      b.part(new THREE.BoxGeometry(0.075, 0.035 - f * 0.003, 0.032), EAGLE_GOLD, {
        bone: chest,
        at: [fx, fy, fz],
        rotation: [12 * DEG, -s * 15 * DEG, s * (25 + f * 8) * DEG],
        group: "torso",
      });
      // Second lower layer of eagle feathers
      b.part(new THREE.BoxGeometry(0.065, 0.025, 0.028), EAGLE_GOLD, {
        bone: chest,
        at: [fx * 0.9, fy - 0.03, fz],
        rotation: [12 * DEG, -s * 15 * DEG, s * (15 + f * 6) * DEG],
        group: "torso",
      });
    }
  }

  // --- 2. BACKPACK POWER PLANT ---
  // Main reactor housing box
  b.part(new THREE.BoxGeometry(0.52, 0.5, 0.24), ARMOR_BLUE, {
    bone: chest,
    at: [0, 1.64, -0.21],
    group: "torso",
  });
  b.part(new THREE.BoxGeometry(0.53, 0.04, 0.25), TRIM_GOLD, {
    bone: chest,
    at: [0, 1.87, -0.21],
    group: "torso",
  });
  b.part(new THREE.BoxGeometry(0.53, 0.04, 0.25), TRIM_GOLD, {
    bone: chest,
    at: [0, 1.41, -0.21],
    group: "torso",
  });

  // Central nuclear power core spherical dome
  b.part(new THREE.SphereGeometry(0.14, 16, 12), GUN_BLACK, {
    bone: chest,
    at: [0, 1.64, -0.29],
    scale: [1.1, 1.15, 0.9],
    group: "torso",
  });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 12), TRIM_GOLD, {
    bone: chest,
    at: [0, 1.64, -0.38],
    rotation: [90 * DEG, 0, 0],
    group: "torso",
  });
  b.part(new THREE.SphereGeometry(0.025, 8, 6), SKULL_WHITE, {
    bone: chest,
    at: [0, 1.64, -0.4],
    group: "torso",
  });

  // Dual stabilizer exhaust ball nozzles on angled side pylons
  for (const [s] of SIDES) {
    const pylonPath = catmull([
      [s * 0.2, 1.7, -0.19],
      [s * 0.36, 1.84, -0.19],
    ]);
    b.sweep(pylonPath, 0.045, {
      bone: chest,
      color: ARMOR_BLUE,
      group: "torso",
    });

    b.part(new THREE.SphereGeometry(0.09, 14, 12), GUN_METAL, {
      bone: chest,
      at: [s * 0.37, 1.85, -0.19],
      group: "torso",
    });
    b.part(new THREE.CylinderGeometry(0.055, 0.082, 0.08, 14), GUN_BLACK, {
      bone: chest,
      at: [s * 0.39, 1.83, -0.24],
      rotation: [40 * DEG, s * 22 * DEG, 0],
      group: "torso",
    });
    b.part(new THREE.TorusGeometry(0.078, 0.012, 8, 14), TRIM_GOLD, {
      bone: chest,
      at: [s * 0.4, 1.81, -0.26],
      rotation: [40 * DEG, s * 22 * DEG, 0],
      group: "torso",
    });

    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 10), METAL_SILVER, {
      bone: chest,
      at: [s * 0.19, 1.44, -0.26],
      rotation: [15 * DEG, 0, 0],
      group: "torso",
    });
  }

  // --- 3. WAIST, BELT & FAULDS ---
  b.part(new THREE.CylinderGeometry(0.28, 0.29, 0.1, 16), LEATHER_BROWN, {
    bone: hips,
    at: [0, 1.16, 0.02],
    scale: [1.1, 1, 0.9],
    group: "torso",
  });
  b.part(new THREE.BoxGeometry(0.14, 0.11, 0.07), TRIM_GOLD, {
    bone: hips,
    at: [0, 1.16, 0.19],
    group: "torso",
  });
  b.part(new THREE.SphereGeometry(0.028, 8, 6), SKULL_WHITE, {
    bone: hips,
    at: [0, 1.16, 0.23],
    group: "torso",
  });

  for (const [s] of SIDES) {
    b.part(new THREE.BoxGeometry(0.09, 0.12, 0.08), POUCH_BROWN, {
      bone: hips,
      at: [s * 0.29, 1.15, 0.09],
      rotation: [0, -s * 25 * DEG, 0],
      group: "torso",
    });
    b.part(new THREE.BoxGeometry(0.092, 0.04, 0.082), LEATHER_BROWN, {
      bone: hips,
      at: [s * 0.29, 1.19, 0.09],
      rotation: [0, -s * 25 * DEG, 0],
      group: "torso",
    });
  }

  // Tassets / Groin plate
  b.part(new THREE.BoxGeometry(0.2, 0.22, 0.06), ARMOR_BLUE, {
    bone: hips,
    at: [0, 1.02, 0.17],
    rotation: [-10 * DEG, 0, 0],
    group: "torso",
  });
  b.part(new THREE.BoxGeometry(0.16, 0.03, 0.065), TRIM_GOLD, {
    bone: hips,
    at: [0, 0.93, 0.185],
    rotation: [-10 * DEG, 0, 0],
    group: "torso",
  });

  // --- 4. MK X POWER ARMOUR HELMET ---
  b.part(new THREE.SphereGeometry(0.145, 16, 12), ARMOR_BLUE, {
    bone: head,
    at: [0, 1.94, 0.08],
    scale: [1.02, 1.05, 1.15],
    group: "head",
  });
  b.part(new THREE.BoxGeometry(0.24, 0.045, 0.18), TRIM_GOLD, {
    bone: head,
    at: [0, 1.98, 0.13],
    rotation: [-12 * DEG, 0, 0],
    group: "head",
  });
  b.part(new THREE.BoxGeometry(0.04, 0.07, 0.22), ARMOR_DARK, {
    bone: head,
    at: [0, 2.05, 0.07],
    rotation: [-10 * DEG, 0, 0],
    group: "head",
  });

  for (const [s] of SIDES) {
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.045, 12), METAL_SILVER, {
      bone: head,
      at: [s * 0.145, 1.94, 0.07],
      rotation: [0, 0, 90 * DEG],
      group: "head",
    });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.015, 8), TRIM_GOLD, {
      bone: head,
      at: [s * 0.17, 1.94, 0.07],
      rotation: [0, 0, 90 * DEG],
      group: "head",
    });
  }
  // Lower jaw & Vox Grille
  b.part(new THREE.ConeGeometry(0.1, 0.14, 4), ARMOR_BLUE, {
    bone: jaw,
    at: [0, 1.86, 0.16],
    rotation: [-50 * DEG, 45 * DEG, 0],
    group: "head",
  });
  b.part(new THREE.BoxGeometry(0.075, 0.075, 0.06), GUN_BLACK, {
    bone: jaw,
    at: [0, 1.86, 0.21],
    rotation: [-25 * DEG, 0, 0],
    group: "head",
  });
  for (let gy = -0.018; gy <= 0.02; gy += 0.013) {
    b.part(new THREE.BoxGeometry(0.065, 0.005, 0.015), METAL_SILVER, {
      bone: jaw,
      at: [0, 1.86 + gy, 0.24],
      rotation: [-25 * DEG, 0, 0],
      group: "head",
    });
  }
  for (const [s] of SIDES) {
    const tubePath = catmull([
      [s * 0.04, 1.84, 0.19],
      [s * 0.08, 1.8, 0.14],
      [s * 0.085, 1.77, 0.06],
    ]);
    b.sweep(tubePath, 0.014, {
      bone: jaw,
      color: JOINT_RUBBER,
      group: "head",
    });
  }

  // Glowing Ruby Eye Lenses (Positioned boldly on helmet face)
  for (const [s] of SIDES) {
    b.part(new THREE.BoxGeometry(0.052, 0.024, 0.04), EYE_LENS_RED, {
      bone: head,
      at: [s * 0.055, 1.94, 0.22],
      rotation: [6 * DEG, -s * 25 * DEG, s * 12 * DEG],
      group: "head",
    });
  }

  // --- 5. SHOULDERS & MONUMENTAL PAULDRONS ---
  for (const { s, side, shoulder } of arms) {
    b.part(new THREE.SphereGeometry(0.13, 12, 10), JOINT_RUBBER, {
      bone: shoulder,
      at: [s * 0.44, 1.68, -0.01],
      group: `arm${side}`,
    });

    const pCenter: [number, number, number] = [s * 0.48, 1.7, 0.0];
    b.part(new THREE.SphereGeometry(0.24, 18, 14), ARMOR_BLUE, {
      bone: shoulder,
      at: pCenter,
      scale: [1.18, 1.35, 1.32],
      group: `arm${side}`,
    });

    b.part(new THREE.CylinderGeometry(0.27, 0.28, 0.08, 16), TRIM_GOLD, {
      bone: shoulder,
      at: [s * 0.48, 1.58, 0.0],
      scale: [1.16, 1, 1.3],
      group: `arm${side}`,
    });
    b.part(new THREE.CylinderGeometry(0.275, 0.275, 0.04, 16), ARMOR_DARK, {
      bone: shoulder,
      at: [s * 0.48, 1.58, 0.0],
      scale: [1.14, 1, 1.28],
      group: `arm${side}`,
    });

    b.part(new THREE.BoxGeometry(0.05, 0.32, 0.05), TRIM_GOLD, {
      bone: shoulder,
      at: [s * 0.48, 1.74, 0.28],
      rotation: [-25 * DEG, 0, 0],
      group: `arm${side}`,
    });
    b.part(new THREE.BoxGeometry(0.05, 0.32, 0.05), TRIM_GOLD, {
      bone: shoulder,
      at: [s * 0.48, 1.74, -0.28],
      rotation: [25 * DEG, 0, 0],
      group: `arm${side}`,
    });
    // Top rim crest arch removed for clean rounded silhouette

    if (s > 0) {
      b.part(new THREE.CircleGeometry(0.13, 16), "#ffffff", {
        bone: shoulder,
        at: [0.77, 1.7, 0.0],
        dir: [1, 0, 0],
        axis: "z",
        texture: CHAPTER_DECAL,
        group: `arm${side}`,
      });
      b.part(new THREE.CylinderGeometry(0.03, 0.032, 0.018, 12), SEAL_WAX_RED, {
        bone: shoulder,
        at: [0.66, 1.56, 0.16],
        rotation: [45 * DEG, 45 * DEG, 0],
        group: `arm${side}`,
      });
      b.part(new THREE.BoxGeometry(0.042, 0.18, 0.006), PARCHMENT, {
        bone: shoulder,
        at: [0.66, 1.44, 0.18],
        rotation: [10 * DEG, 15 * DEG, -10 * DEG],
        group: `arm${side}`,
      });
      b.part(new THREE.BoxGeometry(0.038, 0.14, 0.006), PARCHMENT, {
        bone: shoulder,
        at: [0.68, 1.46, 0.16],
        rotation: [8 * DEG, 25 * DEG, -5 * DEG],
        group: `arm${side}`,
      });
    } else {
      b.part(new THREE.CircleGeometry(0.13, 16), "#ffffff", {
        bone: shoulder,
        at: [-0.77, 1.7, 0.0],
        dir: [-1, 0, 0],
        axis: "z",
        texture: TACTICAL_DECAL,
        group: `arm${side}`,
      });
    }
  }

  // --- 6. ARMS, GAUNTLETS & CABLING ---
  for (const { s, side, shoulder, elbow, wrist } of arms) {
    const bicepPath = catmull([
      [s * 0.48, 1.63, -0.02],
      [s * 0.6, 1.48, -0.03],
    ]);
    b.sweep(bicepPath, 0.11, {
      bone: shoulder,
      color: ARMOR_BLUE,
      section: { ngon: 8 },
      group: `arm${side}`,
    });

    b.part(new THREE.SphereGeometry(0.09, 12, 8), JOINT_RUBBER, {
      bone: elbow,
      at: [s * 0.72, 1.34, -0.04],
      group: `arm${side}`,
    });
    b.part(new THREE.ConeGeometry(0.065, 0.09, 6), ARMOR_DARK, {
      bone: elbow,
      at: [s * 0.76, 1.35, -0.09],
      rotation: [-45 * DEG, 0, -s * 60 * DEG],
      group: `arm${side}`,
    });

    const forearmPath = catmull([
      [s * 0.74, 1.31, -0.03],
      [s * 0.88, 1.15, 0.04],
      [s * 0.94, 1.05, 0.08],
    ]);
    b.sweep(forearmPath, (t) => 0.1 + 0.035 * t, {
      bone: elbow,
      color: ARMOR_BLUE,
      section: { ngon: 8 },
      group: `arm${side}`,
    });

    b.part(new THREE.TorusGeometry(0.112, 0.018, 8, 12), TRIM_GOLD, {
      bone: wrist,
      at: [s * 0.94, 1.05, 0.08],
      rotation: [45 * DEG, -s * 30 * DEG, 0],
      group: `arm${side}`,
    });

    // Armoured Gauntlet Hand (Boxy fist)
    b.part(new THREE.BoxGeometry(0.12, 0.14, 0.12), ARMOR_BLUE, {
      bone: wrist,
      at: [s * 1.01, 0.97, 0.11],
      rotation: [20 * DEG, -s * 25 * DEG, 0],
      group: `arm${side}`,
    });
    for (let f = 0; f < 4; f++) {
      b.part(new THREE.BoxGeometry(0.026, 0.08, 0.03), GUN_METAL, {
        bone: wrist,
        at: [s * (0.97 + f * 0.025), 0.91, 0.14],
        rotation: [45 * DEG, 0, 0],
        group: `arm${side}`,
      });
    }
    b.part(new THREE.BoxGeometry(0.032, 0.06, 0.03), GUN_METAL, {
      bone: wrist,
      at: [s * 0.94, 0.96, 0.16],
      rotation: [10 * DEG, -s * 40 * DEG, 0],
      group: `arm${side}`,
    });
  }

  // --- 7. LEGS, GREAVES & HEAVY ARMOURED BOOTS ---
  for (const leg of legs) {
    const hipJ = leg.joints[0];
    const kneeJ = leg.joints[1];
    const ankleJ = leg.joints[2];
    const toeJ = leg.joints[3];
    const s = hipJ.at.x > 0 ? 1 : -1;
    const side = s > 0 ? "L" : "R";

    const thighPath = catmull([
      [s * 0.23, 1.1, -0.01],
      [s * 0.24, 0.85, 0.02],
      [s * 0.25, 0.65, 0.05],
    ]);
    b.sweep(thighPath, (t) => 0.15 - 0.02 * t, {
      bone: hipJ,
      color: ARMOR_BLUE,
      section: { ngon: 8 },
      group: `leg${side}`,
    });

    b.part(new THREE.SphereGeometry(0.12, 12, 8), JOINT_RUBBER, {
      bone: kneeJ,
      at: [s * 0.25, 0.62, 0.05],
      group: `leg${side}`,
    });
    b.part(new THREE.BoxGeometry(0.18, 0.16, 0.12), ARMOR_BLUE, {
      bone: kneeJ,
      at: [s * 0.25, 0.64, 0.13],
      rotation: [-15 * DEG, 0, 0],
      group: `leg${side}`,
    });
    b.part(new THREE.BoxGeometry(0.12, 0.1, 0.03), TRIM_GOLD, {
      bone: kneeJ,
      at: [s * 0.25, 0.64, 0.19],
      rotation: [-15 * DEG, 0, 0],
      group: `leg${side}`,
    });
    b.part(new THREE.SphereGeometry(0.022, 8, 6), SKULL_WHITE, {
      bone: kneeJ,
      at: [s * 0.25, 0.64, 0.21],
      group: `leg${side}`,
    });

    const shinPath = catmull([
      [s * 0.25, 0.58, 0.04],
      [s * 0.26, 0.38, 0.01],
      [s * 0.26, 0.22, -0.01],
    ]);
    b.sweep(shinPath, (t) => 0.13 + 0.065 * t, {
      bone: kneeJ,
      color: ARMOR_BLUE,
      section: { ngon: 8 },
      group: `leg${side}`,
    });
    b.part(new THREE.BoxGeometry(0.04, 0.34, 0.06), TRIM_GOLD, {
      bone: kneeJ,
      at: [s * 0.26, 0.38, 0.14],
      rotation: [8 * DEG, 0, 0],
      group: `leg${side}`,
    });

    b.part(new THREE.SphereGeometry(0.1, 10, 8), JOINT_RUBBER, {
      bone: ankleJ,
      at: [s * 0.26, 0.2, 0.0],
      group: `leg${side}`,
    });

    // Massive Armoured Boots (Sabatons)
    b.part(new THREE.BoxGeometry(0.23, 0.18, 0.24), ARMOR_BLUE, {
      bone: ankleJ,
      at: [s * 0.26, 0.1, 0.04],
      group: `leg${side}`,
    });
    b.part(new THREE.BoxGeometry(0.25, 0.11, 0.22), ARMOR_DARK, {
      bone: toeJ,
      at: [s * 0.26, 0.055, 0.21],
      group: `leg${side}`,
    });
    b.part(new THREE.BoxGeometry(0.255, 0.065, 0.08), METAL_SILVER, {
      bone: toeJ,
      at: [s * 0.26, 0.035, 0.3],
      group: `leg${side}`,
    });
    b.part(new THREE.BoxGeometry(0.26, 0.03, 0.44), GUN_BLACK, {
      bone: toeJ,
      at: [s * 0.26, 0.015, 0.15],
      group: `leg${side}`,
    });
  }

  // --- 8. WEAPON: BOXY BOLT RIFLE (Right Hand) ---
  const rightWrist = arms[1].wrist;
  b.part(new THREE.BoxGeometry(0.12, 0.22, 0.58), GUN_BLACK, {
    bone: rightWrist,
    at: [-1.06, 0.9, 0.26],
    rotation: [20 * DEG, 10 * DEG, -5 * DEG],
    group: "armR",
  });
  b.part(new THREE.BoxGeometry(0.126, 0.12, 0.46), SEAL_WAX_RED, {
    bone: rightWrist,
    at: [-1.06, 0.98, 0.24],
    rotation: [20 * DEG, 10 * DEG, -5 * DEG],
    group: "armR",
  });
  b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.16, 12), GUN_METAL, {
    bone: rightWrist,
    at: [-1.04, 0.99, 0.56],
    rotation: [110 * DEG, 10 * DEG, 0],
    group: "armR",
  });
  b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.03, 8), GUN_BLACK, {
    bone: rightWrist,
    at: [-1.04, 1.01, 0.64],
    rotation: [110 * DEG, 10 * DEG, 0],
    group: "armR",
  });
  b.part(new THREE.BoxGeometry(0.08, 0.18, 0.14), GUN_METAL, {
    bone: rightWrist,
    at: [-1.08, 0.72, 0.26],
    rotation: [40 * DEG, 10 * DEG, -5 * DEG],
    group: "armR",
  });
  b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.28, 10), GUN_METAL, {
    bone: rightWrist,
    at: [-1.06, 1.08, 0.25],
    rotation: [110 * DEG, 10 * DEG, 0],
    group: "armR",
  });
  b.part(new THREE.SphereGeometry(0.026, 8, 6), EYE_LENS_RED, {
    bone: rightWrist,
    at: [-1.05, 1.13, 0.38],
    group: "armR",
  });
  b.part(new THREE.BoxGeometry(0.015, 0.04, 0.12), TRIM_GOLD, {
    bone: rightWrist,
    at: [-1.125, 0.98, 0.24],
    rotation: [20 * DEG, 10 * DEG, -5 * DEG],
    group: "armR",
  });

  // --- 9. WEAPON: ROARING CHAINSWORD (Left Hand) ---
  const leftWrist = arms[0].wrist;
  b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.24, 10), GUN_BLACK, {
    bone: leftWrist,
    at: [1.01, 0.94, 0.12],
    rotation: [70 * DEG, 0, 0],
    group: "armL",
  });
  b.part(new THREE.SphereGeometry(0.036, 10, 8), SKULL_WHITE, {
    bone: leftWrist,
    at: [1.01, 0.9, -0.01],
    group: "armL",
  });
  b.part(new THREE.BoxGeometry(0.15, 0.06, 0.1), TRIM_GOLD, {
    bone: leftWrist,
    at: [1.01, 0.98, 0.23],
    rotation: [-20 * DEG, 0, 0],
    group: "armL",
  });
  b.part(new THREE.SphereGeometry(0.02, 8, 6), SKULL_WHITE, {
    bone: leftWrist,
    at: [1.01, 0.98, 0.28],
    group: "armL",
  });

  // Motor chassis
  b.part(new THREE.BoxGeometry(0.1, 0.18, 0.26), ARMOR_BLUE, {
    bone: leftWrist,
    at: [1.01, 1.05, 0.38],
    rotation: [-20 * DEG, 0, 0],
    group: "armL",
  });
  b.part(new THREE.BoxGeometry(0.104, 0.05, 0.22), HAZARD_YELLOW, {
    bone: leftWrist,
    at: [1.01, 1.14, 0.36],
    rotation: [-20 * DEG, 0, 0],
    group: "armL",
  });
  for (const s of [0.03, -0.03]) {
    b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.08, 8), METAL_SILVER, {
      bone: leftWrist,
      at: [1.01 + s, 1.18, 0.32],
      rotation: [20 * DEG, 0, 0],
      group: "armL",
    });
  }

  // Long Chainblade chassis
  b.part(new THREE.BoxGeometry(0.07, 0.15, 0.65), ARMOR_BLUE, {
    bone: leftWrist,
    at: [1.01, 1.2, 0.76],
    rotation: [-20 * DEG, 0, 0],
    group: "armL",
  });
  b.part(new THREE.BoxGeometry(0.068, 0.12, 0.14), GUN_METAL, {
    bone: leftWrist,
    at: [1.01, 1.34, 1.1],
    rotation: [-50 * DEG, 0, 0],
    group: "armL",
  });

  // Monomolecular Chain Teeth along bottom cutting edge
  for (let tooth = 0; tooth < 14; tooth++) {
    const frac = tooth / 14;
    const tz = 0.48 + frac * 0.6;
    const ty = 1.09 + frac * 0.22;
    b.part(new THREE.ConeGeometry(0.024, 0.048, 4), CHAIN_TEETH, {
      bone: leftWrist,
      at: [1.01, ty - 0.085, tz],
      rotation: [160 * DEG, 0, 0],
      group: "armL",
    });
  }

  return b.root;
}
