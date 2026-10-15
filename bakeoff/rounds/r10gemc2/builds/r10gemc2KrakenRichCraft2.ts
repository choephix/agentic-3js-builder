import * as THREE from "three";
import {
  aim,
  bezier,
  catmull,
  countershade,
  createBuilder,
  frame,
  gradient,
  mid,
  paint,
  rng,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Kraken Rising",
  description:
    "An oceanic dread-titan erupting from a swirling vortex with eight dynamic tentacles, Overwatch-style segmented tech-chitin carapace, cyclopean glowing optics, and a shattered galleon.",
};

export default function build() {
  const b = createBuilder({ name: "kraken_rising", paintSize: 2048, detail: 1 });
  const seedRng = rng(108);

  // ---------------------------------------------------------------------------
  // COLOR PALETTE (Overwatch Heroic Monster Aesthetic)
  // ---------------------------------------------------------------------------
  const CHITIN_NAVY = "#071224"; // Primary heavy armor plates
  const CHITIN_TEAL = "#0c3b4f"; // Secondary carapace plates
  const CHITIN_EDGE = "#1d6785"; // Beveled plate highlights
  const BELLY_CYAN = "#36b2c2";  // Bioluminescent ventral skin
  const BELLY_PALE = "#78e5f0";  // Inner glow highlight
  const HAZARD_CORAL = "#ff3e24"; // High-visibility Overwatch hazard markings
  const CYAN_ENERGY = "#00f0ff";  // Glowing conduits and optics
  const GOLD_BRASS = "#d89c2c";   // Salvaged nautical hardware
  const WOOD_HULL = "#261912";   // Wreckage timbers
  const WOOD_MAST = "#4a3424";
  const SEA_DARK = "#041c2c";    // Whirlpool depths
  const SEA_FOAM = "#e8faff";    // Cresting waves and froth
  const INK_BLACK = "#03070d";   // Inner beak and crevices

  // Clean, stylized ventral-to-dorsal countershaded skin
  const skinPaint = countershade(CHITIN_TEAL, BELLY_CYAN, { level: -0.05, soft: 0.28 });

  // Carapace paint with subtle upward sheen
  const armorPaint = paint((p, n) => {
    if (n.y > 0.55 && p.y > 1.4) return CHITIN_EDGE;
    if (n.z > 0.55 && p.y > 1.2) return CHITIN_TEAL;
    return CHITIN_NAVY;
  });

  const waterPaint = gradient(SEA_DARK, "#0a3a4d", [0, 0, 0], [0, 0.45, 0]);

  // ---------------------------------------------------------------------------
  // TEXTURES & SVG DECALS
  // ---------------------------------------------------------------------------

  // Primary Cyclopean Predator Eye Reticle (Overwatch Boss HUD style)
  const eyeReticleTex = svg(
    `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="opticGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="25%" stop-color="#00f0ff"/>
          <stop offset="65%" stop-color="#00668a"/>
          <stop offset="100%" stop-color="#031018"/>
        </radialGradient>
      </defs>
      <circle cx="128" cy="128" r="122" fill="#040c17" stroke="#ff3e24" stroke-width="8"/>
      <circle cx="128" cy="128" r="102" fill="url(#opticGlow)"/>
      <circle cx="128" cy="128" r="54" fill="none" stroke="#00f0ff" stroke-width="5" stroke-dasharray="16 10"/>
      <polygon points="128,70 152,128 128,186 104,128" fill="#030810" stroke="#00f0ff" stroke-width="3"/>
      <circle cx="128" cy="128" r="14" fill="#ffffff"/>
      <rect x="124" y="8" width="8" height="28" fill="#ff3e24"/>
      <rect x="124" y="220" width="8" height="28" fill="#ff3e24"/>
      <rect x="8" y="124" width="28" height="8" fill="#ff3e24"/>
      <rect x="220" y="124" width="28" height="8" fill="#ff3e24"/>
    </svg>`,
    { size: 512 },
  );

  // Secondary Sensor Eye Texture
  const sensorEyeTex = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="60" fill="#050d18" stroke="#00f0ff" stroke-width="6"/>
      <circle cx="64" cy="64" r="44" fill="#00f0ff"/>
      <polygon points="64,28 78,64 64,100 50,64" fill="#040910"/>
      <circle cx="58" cy="54" r="8" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  // Titan Trident Crest Decal
  const crestDecalTex = svg(
    `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <path d="M128 14 L170 86 L144 86 L144 200 L128 228 L112 200 L112 86 L86 86 Z" fill="#ff3e24"/>
      <path d="M86 102 L44 148 L64 164 L98 120 Z" fill="#00f0ff"/>
      <path d="M170 102 L212 148 L192 164 L158 120 Z" fill="#00f0ff"/>
      <circle cx="128" cy="66" r="15" fill="#071224"/>
      <polygon points="128,134 140,158 116,158" fill="#ffffff"/>
    </svg>`,
    { size: 512 },
  );

  // Suction Cup Pad Texture (Concentric glowing valves)
  const suctionCupTex = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="60" fill="#1b636f" stroke="#08252c" stroke-width="6"/>
      <circle cx="64" cy="64" r="46" fill="#36a3b2"/>
      <circle cx="64" cy="64" r="26" fill="#051017" stroke="#00f0ff" stroke-width="4"/>
      <circle cx="64" cy="64" r="14" fill="#00f0ff"/>
      <circle cx="64" cy="64" r="6" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  // Water Splash Spray Card Texture
  const splashTex = svg(
    `<svg viewBox="0 0 256 512" xmlns="http://www.w3.org/2000/svg">
      <path d="M128 500 C40 390 15 270 44 175 C66 105 108 55 128 6 C148 55 190 105 212 175 C241 270 216 390 128 500 Z" fill="#e8faff"/>
      <path d="M128 440 C72 360 54 270 76 195 C92 135 114 95 128 42 C142 95 164 135 180 195 C202 270 184 360 128 440 Z" fill="#ffffff"/>
      <path d="M128 350 C100 290 90 230 104 175 C114 135 122 105 128 72 C134 105 142 135 152 175 C166 230 156 290 128 350 Z" fill="#78e5f0"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // SKELETON HIERARCHY
  // ---------------------------------------------------------------------------
  const root = b.joint("root", { at: [0, 0.45, 0], dir: [0, 1, 0] });
  const spine1 = b.joint("spine1", { parent: root, at: [0, 0.9, 0.04], dir: [0, 1, 0.08], role: "spine" });
  const spine2 = b.joint("spine2", { parent: spine1, at: [0, 1.4, 0.08], dir: [0, 1, 0.1], role: "spine" });
  const head = b.joint("head", { parent: spine2, at: [0, 1.85, 0.16], dir: [0, 0.95, 0.2], role: "head" });
  const mantleApex = b.joint("mantleApex", {
    parent: head,
    at: [0, 2.85, -0.22],
    dir: [0, 0.85, -0.4],
    role: "head",
  });
  // Clear vertical drop between eye (1.80) and jaws (1.46 / 1.30)
  const jawUpper = b.joint("jawUpper", {
    parent: head,
    at: [0, 1.46, 0.62],
    dir: [0, -0.25, 0.96],
    role: "jaw",
  });
  const jawLower = b.joint("jawLower", {
    parent: head,
    at: [0, 1.3, 0.58],
    dir: [0, -0.5, 0.86],
    role: "jaw",
  });

  // ---------------------------------------------------------------------------
  // 1. DIORAMA BASE: WHIRLPOOL VORTEX & SHATTERED GALLEON
  // ---------------------------------------------------------------------------

  // Stepped vortex discs resting solidly on y = 0
  b.part(new THREE.CylinderGeometry(1.68, 1.78, 0.08, 24), waterPaint, {
    at: [0, 0.04, 0],
    group: "scenery",
    name: "sea_base_outer",
  });
  b.part(new THREE.CylinderGeometry(1.42, 1.54, 0.09, 24), SEA_DARK, {
    at: [0, 0.1, 0],
    group: "scenery",
    name: "sea_base_mid",
  });
  b.part(new THREE.CylinderGeometry(1.12, 1.28, 0.1, 20), waterPaint, {
    at: [0, 0.16, 0],
    group: "scenery",
    name: "sea_base_inner",
  });

  // Dynamic concentric swirling wave foam rings
  for (let ringIdx = 0; ringIdx < 3; ringIdx++) {
    const r = 1.62 - ringIdx * 0.42;
    const yH = 0.085 + ringIdx * 0.055;
    const pts: THREE.Vector3[] = [];
    const count = 18;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const wave = 0.045 * Math.sin(a * 5 + ringIdx * 1.8);
      pts.push(new THREE.Vector3(Math.cos(a) * (r + wave), yH, Math.sin(a) * (r + wave)));
    }
    b.sweep(catmull(pts, { closed: true }), 0.038 - ringIdx * 0.006, {
      color: SEA_FOAM,
      group: "scenery",
      name: `foam_ripple_${ringIdx}`,
    });
  }

  // Shattered Galleon Wreckage on the Right Flank
  const mastRoot = new THREE.Vector3(-0.95, 0.12, 0.72);
  const mastCrows = new THREE.Vector3(-1.22, 0.98, 0.88);
  const mastTip = new THREE.Vector3(-1.35, 1.36, 0.98);

  // Substantial timber hull block of the sunken ship
  b.part(new THREE.BoxGeometry(0.38, 0.45, 0.85), WOOD_HULL, {
    at: [-1.15, 0.22, 0.78],
    rotation: [18, -25, -12],
    group: "scenery",
    name: "galleon_hull_block",
  });
  // Gilded gunwale rim
  b.part(new THREE.BoxGeometry(0.42, 0.06, 0.88), GOLD_BRASS, {
    at: [-1.15, 0.42, 0.78],
    rotation: [18, -25, -12],
    group: "scenery",
    name: "galleon_gunwale",
  });

  // Broken mast with fracture splinter details
  b.sweep(catmull([mastRoot, mastCrows, mastTip]), [0.075, 0.042], {
    color: WOOD_MAST,
    group: "scenery",
    name: "galleon_mast",
  });

  // Crow's Nest Platform
  b.part(new THREE.CylinderGeometry(0.18, 0.14, 0.15, 10), WOOD_HULL, {
    at: mastCrows,
    aim: [0, 1, 0],
    group: "scenery",
    name: "crows_nest",
  });
  b.part(new THREE.TorusGeometry(0.185, 0.016, 6, 12), GOLD_BRASS, {
    at: mastCrows.clone().add(new THREE.Vector3(0, 0.075, 0)),
    aim: [0, 1, 0],
    group: "scenery",
    name: "crows_nest_brass_ring",
  });

  // Hanging Brass Lantern under Crow's Nest (warm lantern glow)
  const lanternAt = mastCrows.clone().add(new THREE.Vector3(0.08, -0.16, 0.06));
  b.rod(mastCrows, lanternAt, 0.008, { color: GOLD_BRASS, group: "scenery", name: "lantern_chain" });
  b.part(new THREE.BoxGeometry(0.07, 0.1, 0.07), GOLD_BRASS, {
    at: lanternAt,
    group: "scenery",
    name: "lantern_frame",
  });
  glow(
    b.part(new THREE.BoxGeometry(0.054, 0.08, 0.054), "#ffbb33", {
      at: lanternAt,
      group: "scenery",
      name: "lantern_glow_core",
    }),
    2.5,
  );

  // Fractured Hull Ribs & Planking
  for (let rib = 0; rib < 4; rib++) {
    const ang = 2.15 + rib * 0.24;
    const rad = 1.05 + rib * 0.08;
    const baseP = new THREE.Vector3(Math.cos(ang) * rad, 0.06, Math.sin(ang) * rad);
    const topP = new THREE.Vector3(Math.cos(ang) * (rad + 0.16), 0.38 + (rib % 2) * 0.16, Math.sin(ang) * (rad + 0.16));
    b.frustumBox(baseP, topP, [0.09, 0.024], [0.065, 0.018], {
      color: rib % 2 === 0 ? WOOD_HULL : WOOD_MAST,
      group: "scenery",
      name: `hull_plank_${rib}`,
    });
  }

  // Floating Oak Rum Barrels in the Swirl
  const barrelPositions = [
    new THREE.Vector3(-0.62, 0.14, 1.15),
    new THREE.Vector3(-1.38, 0.12, 0.32),
  ];
  barrelPositions.forEach((bPos, idx) => {
    b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.2, 12), WOOD_HULL, {
      at: bPos,
      rotation: [15, idx * 45, 25],
      group: "scenery",
      name: `sea_barrel_${idx}`,
    });
    b.part(new THREE.TorusGeometry(0.088, 0.01, 6, 12), GOLD_BRASS, {
      at: bPos.clone().add(new THREE.Vector3(0, 0.05, 0)),
      rotation: [15, idx * 45, 25],
      group: "scenery",
      name: `barrel_band_top_${idx}`,
    });
    b.part(new THREE.TorusGeometry(0.088, 0.01, 6, 12), GOLD_BRASS, {
      at: bPos.clone().add(new THREE.Vector3(0, -0.05, 0)),
      rotation: [15, idx * 45, 25],
      group: "scenery",
      name: `barrel_band_bot_${idx}`,
    });
  });

  // Dynamic sweeping low-poly splash arcs (curving outward with water momentum)
  for (let sIdx = 0; sIdx < 8; sIdx++) {
    const a = (sIdx / 8) * Math.PI * 2 + 0.15;
    const r0 = 0.82;
    const r1 = 1.08;
    const p0 = new THREE.Vector3(Math.cos(a) * r0, 0.14, Math.sin(a) * r0);
    const pMid = new THREE.Vector3(Math.cos(a + 0.22) * (r0 + 0.18), 0.52 + 0.12 * (sIdx % 2), Math.sin(a + 0.22) * (r0 + 0.18));
    const pTip = new THREE.Vector3(Math.cos(a + 0.42) * r1, 0.22, Math.sin(a + 0.42) * r1);

    b.sweep(bezier(p0, pMid, pTip), [0.065, 0.015], {
      color: SEA_FOAM,
      group: "scenery",
      name: `curving_splash_crest_${sIdx}`,
    });
  }

  // Vertical foam spray cards
  const splashCardPts: THREE.Vector3[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    splashCardPts.push(new THREE.Vector3(Math.cos(a) * 0.92, 0.15, Math.sin(a) * 0.92));
  }
  b.cards(
    splashCardPts.map((p) => frame(p, [0, 1, 0])),
    splashTex,
    {
      size: [0.26, 0.55],
      lean: 25,
      bend: 18,
      vary: 0.22,
      rng: seedRng,
      group: "scenery",
      name: "splash_spray_cards",
    },
  );

  // ---------------------------------------------------------------------------
  // 2. MAIN BODY & TOWERING MANTLE CARAPACE
  // ---------------------------------------------------------------------------

  // Muscular Body Core Loft
  const bodyStations = [
    { at: [0, 0.45, 0], w: 0.88, h: 0.84 },
    { at: [0, 0.85, 0.04], w: 1.06, h: 0.98 },
    { at: [0, 1.35, 0.08], w: 1.14, h: 1.06 },
    { at: [0, 1.85, 0.15], w: 1.04, h: 1.1 },
    { at: [0, 2.35, 0.02], w: 0.78, h: 0.88 },
    { at: [0, 2.8, -0.2], w: 0.36, h: 0.42 },
    { at: [0, 3.0, -0.32], w: 0.08, h: 0.08 },
  ];

  b.loft(bodyStations, {
    bone: [root, spine1, spine2, head, mantleApex],
    color: skinPaint,
    group: "body",
    name: "torso_core",
  });

  // Aerodynamic High Mantle Fin (Overwatch mecha/aquatic crest)
  const dorsalFinOutline: [number, number, "sharp"?][] = [
    [0.0, 0.0, "sharp"],
    [0.0, 1.25, "sharp"],
    [-0.34, 0.98, "sharp"],
    [-0.52, 0.48],
    [-0.24, 0.06, "sharp"],
  ];
  b.extrude(dorsalFinOutline, {
    at: [0, 1.85, -0.24],
    x: [0, 0, -1],
    y: [0, 0.88, -0.32],
    thickness: [0.09, 0.02],
    bevel: 0.015,
    smoothing: 2,
    color: armorPaint,
    bone: mantleApex,
    group: "carapace",
    name: "mantle_rear_crest",
  });

  // Glowing cyan energy spine along rear fin
  glow(
    b.rod([0, 1.95, -0.42], [0, 2.72, -0.48], 0.018, {
      color: CYAN_ENERGY,
      bone: mantleApex,
      group: "carapace",
      name: "mantle_dorsal_energy_line",
    }),
    2.2,
  );

  // Symmetrical Segmented Carapace Armor Plates on Mantle
  // Symmetrical overlapping plates wrapping around the dorsal crown
  for (let plate = 0; plate < 5; plate++) {
    const yH = 1.98 + plate * 0.22;
    const zPos = 0.06 - plate * 0.09;
    const s = 1.0 - plate * 0.15;
    const plateW = 0.62 * s;
    const plateH = 0.18 * s;
    const plateD = 0.38 * s;

    // Left and right symmetrical armor cowls
    for (const side of [1, -1]) {
      b.part(new THREE.BoxGeometry(plateW * 0.52, plateH, plateD), armorPaint, {
        at: [side * (plateW * 0.28), yH, zPos],
        rotation: [-14, side * 18, -side * 10],
        bone: head,
        group: "carapace",
        name: `cowl_plate_${plate}_${side > 0 ? "L" : "R"}`,
      });

      // Coral hazard corner accents
      b.part(new THREE.BoxGeometry(0.06 * s, 0.045 * s, 0.08 * s), HAZARD_CORAL, {
        at: [side * (plateW * 0.48), yH + 0.04 * s, zPos + 0.14 * s],
        rotation: [-14, side * 18, -side * 10],
        bone: head,
        group: "carapace",
        name: `cowl_hazard_${plate}_${side > 0 ? "L" : "R"}`,
      });
    }

    // Central keel keystone plate
    b.part(new THREE.ConeGeometry(0.12 * s, 0.26 * s, 4), CHITIN_NAVY, {
      at: [0, yH + 0.04 * s, zPos + plateD * 0.48],
      aim: [0, 0.35, 0.95],
      bone: head,
      group: "carapace",
      name: `cowl_keystone_${plate}`,
    });

    // Glowing cyan seam running between segments
    glow(
      b.part(new THREE.BoxGeometry(plateW * 0.88, 0.016, 0.04), CYAN_ENERGY, {
        at: [0, yH - 0.08 * s, zPos + plateD * 0.35],
        rotation: [-14, 0, 0],
        bone: head,
        group: "carapace",
        name: `cowl_energy_seam_${plate}`,
      }),
      2.0,
    );
  }

  // Titan Trident Crest Decal on Forehead Carapace
  b.part(new THREE.PlaneGeometry(0.36, 0.36), "#ffffff", {
    at: [0, 2.38, 0.42],
    dir: [0, 0.42, 0.92],
    axis: "z",
    bone: head,
    texture: crestDecalTex,
    group: "carapace",
    name: "titan_crest_decal",
  });

  // Swept Hydrofoil Mantle Fins (Left & Right Stabilizers)
  for (const s of [1, -1]) {
    const finOutline: [number, number, "sharp"?][] = [
      [0.0, 0.0, "sharp"],
      [0.65, -0.22, "sharp"],
      [0.82, -0.48, "sharp"],
      [0.35, -0.32],
      [0.0, -0.15, "sharp"],
    ];
    b.extrude(finOutline, {
      at: [s * 0.48, 2.15, 0.02],
      x: [s * 0.92, -0.25, -0.28],
      y: [0, 0.88, -0.45],
      thickness: [0.045, 0.012],
      bevel: 0.008,
      smoothing: 1,
      color: armorPaint,
      bone: head,
      group: "carapace",
      name: `mantle_wing_${s > 0 ? "L" : "R"}`,
    });
  }

  // Dual Siphon Thrusters (Lateral hydro-jet exhausts)
  for (const s of [1, -1]) {
    const siphonAt = new THREE.Vector3(s * 0.52, 1.28, -0.08);
    const siphonDir = new THREE.Vector3(s * 0.65, -0.22, -0.65).normalize();

    b.sweep(
      bezier(
        siphonAt,
        siphonAt.clone().addScaledVector(siphonDir, 0.16),
        siphonAt.clone().addScaledVector(siphonDir, 0.36),
      ),
      [0.15, 0.095],
      {
        bone: spine2,
        color: CHITIN_NAVY,
        group: "siphons",
        name: `siphon_body_${s > 0 ? "L" : "R"}`,
      },
    );

    // Glowing Cyan Jet Nozzle Rim
    glow(
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.045, 12, 1, true), CYAN_ENERGY, {
        at: siphonAt.clone().addScaledVector(siphonDir, 0.35),
        dir: siphonDir,
        bone: spine2,
        group: "siphons",
        name: `siphon_nozzle_${s > 0 ? "L" : "R"}`,
      }),
      2.2,
    );
  }

  // ---------------------------------------------------------------------------
  // 3. PREDATOR FACE: VISOR BROW, CYCLOPEAN EYE, SENSORS & HOOKED MAW
  // ---------------------------------------------------------------------------

  // Angled Faceted Overwatch Brow Shield (Positioned cleanly above the eye)
  const browCenter = new THREE.Vector3(0, 1.96, 0.68);
  b.part(new THREE.BoxGeometry(0.76, 0.14, 0.28), CHITIN_NAVY, {
    at: browCenter,
    rotation: [-16, 0, 0],
    bone: head,
    group: "head",
    name: "heavy_brow_shield",
  });

  // Coral Hazard Edge Stripe across Brow
  b.part(new THREE.BoxGeometry(0.72, 0.03, 0.035), HAZARD_CORAL, {
    at: browCenter.clone().add(new THREE.Vector3(0, 0.065, 0.12)),
    rotation: [-16, 0, 0],
    bone: head,
    group: "head",
    name: "brow_hazard_trim",
  });

  // Central Cyclopean Boss Optic (Large, fully exposed, hero centerpiece at y = 1.80)
  const eyeCenter = new THREE.Vector3(0, 1.8, 0.72);
  b.part(new THREE.CylinderGeometry(0.23, 0.27, 0.08, 16), CHITIN_NAVY, {
    at: eyeCenter,
    dir: [0, 0.08, 0.99],
    bone: head,
    group: "head",
    name: "cyclopean_eye_housing",
  });
  // Gilded bezel ring around eye
  b.part(new THREE.TorusGeometry(0.235, 0.016, 6, 16), GOLD_BRASS, {
    at: eyeCenter.clone().add(new THREE.Vector3(0, 0.005, 0.038)),
    dir: [0, 0.08, 0.99],
    bone: head,
    group: "head",
    name: "eye_brass_bezel",
  });

  // Glowing Primary Boss Optic Reticle (Completely unobstructed!)
  glow(
    b.part(new THREE.CircleGeometry(0.21, 24), "#ffffff", {
      at: eyeCenter.clone().add(new THREE.Vector3(0, 0.01, 0.045)),
      dir: [0, 0.08, 0.99],
      axis: "z",
      bone: head,
      texture: eyeReticleTex,
      group: "head",
      name: "cyclopean_eye_reticle",
    }),
    2.6,
  );

  // Stacked Lateral Sensor Eyes (2 on each flank)
  for (const s of [1, -1]) {
    // Upper flank eye
    const latTopPt = new THREE.Vector3(s * 0.42, 1.86, 0.58);
    const latTopDir = new THREE.Vector3(s * 0.75, 0.15, 0.64).normalize();
    b.part(new THREE.CylinderGeometry(0.075, 0.09, 0.04, 10), CHITIN_NAVY, {
      at: latTopPt,
      dir: latTopDir,
      bone: head,
      group: "head",
      name: `sensor_eye_top_socket_${s > 0 ? "L" : "R"}`,
    });
    glow(
      b.part(new THREE.CircleGeometry(0.065, 12), "#ffffff", {
        at: latTopPt.clone().addScaledVector(latTopDir, 0.022),
        dir: latTopDir,
        axis: "z",
        bone: head,
        texture: sensorEyeTex,
        group: "head",
        name: `sensor_eye_top_lens_${s > 0 ? "L" : "R"}`,
      }),
      2.0,
    );

    // Lower flank eye
    const latBotPt = new THREE.Vector3(s * 0.48, 1.72, 0.5);
    const latBotDir = new THREE.Vector3(s * 0.85, -0.05, 0.52).normalize();
    b.part(new THREE.CylinderGeometry(0.06, 0.075, 0.035, 10), CHITIN_NAVY, {
      at: latBotPt,
      dir: latBotDir,
      bone: head,
      group: "head",
      name: `sensor_eye_bot_socket_${s > 0 ? "L" : "R"}`,
    });
    glow(
      b.part(new THREE.CircleGeometry(0.05, 12), "#ffffff", {
        at: latBotPt.clone().addScaledVector(latBotDir, 0.02),
        dir: latBotDir,
        axis: "z",
        bone: head,
        texture: sensorEyeTex,
        group: "head",
        name: `sensor_eye_bot_lens_${s > 0 ? "L" : "R"}`,
      }),
      2.0,
    );

    // Angular Cheek Armor Cowl
    b.frustumBox(
      new THREE.Vector3(s * 0.35, 1.58, 0.42),
      new THREE.Vector3(s * 0.54, 1.7, 0.58),
      [0.14, 0.18],
      [0.08, 0.12],
      {
        bone: head,
        color: CHITIN_TEAL,
        group: "head",
        name: `cheek_cowl_${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // HOOKED CALAMARI BEAK & MANDIBLES (Positioned well below the eye)
  // Upper Beak: Powerful hooked black obsidian rostrum curving sharply downward
  const upBeakRoot = new THREE.Vector3(0, 1.5, 0.62);
  const upBeakArch = new THREE.Vector3(0, 1.44, 0.85);
  const upBeakTip = new THREE.Vector3(0, 1.2, 0.94);
  b.sweep(bezier(upBeakRoot, upBeakArch, upBeakTip), [0.14, 0.025], {
    bone: jawUpper,
    color: INK_BLACK,
    group: "mouth",
    name: "upper_beak_rostrum",
  });
  // Upper Beak Armor Shroud
  b.part(new THREE.ConeGeometry(0.14, 0.28, 6), CHITIN_NAVY, {
    at: [0, 1.48, 0.74],
    aim: [0, -0.65, 0.75],
    bone: jawUpper,
    group: "mouth",
    name: "upper_beak_armor_cowl",
  });

  // Lower Beak: Open pincer mandible
  const lowBeakRoot = new THREE.Vector3(0, 1.25, 0.58);
  const lowBeakTip = new THREE.Vector3(0, 1.35, 0.88);
  b.sweep(bezier(lowBeakRoot, mid(lowBeakRoot, lowBeakTip), lowBeakTip), [0.15, 0.03], {
    bone: jawLower,
    color: INK_BLACK,
    group: "mouth",
    name: "lower_beak_mandible",
  });

  // Lateral Serrated Pincer Mandibles
  for (const s of [1, -1]) {
    const mandBase = new THREE.Vector3(s * 0.2, 1.32, 0.62);
    const mandCurve = new THREE.Vector3(s * 0.35, 1.36, 0.82);
    const mandTip = new THREE.Vector3(s * 0.1, 1.35, 0.94);
    b.sweep(catmull([mandBase, mandCurve, mandTip]), (t) => 0.06 * (1 - t * 0.65), {
      bone: jawLower,
      color: HAZARD_CORAL,
      group: "mouth",
      name: `side_pincer_${s > 0 ? "L" : "R"}`,
    });
  }

  // Inner Bioluminescent Plasma Throat
  glow(
    b.part(new THREE.SphereGeometry(0.14, 12, 8), CYAN_ENERGY, {
      at: [0, 1.38, 0.64],
      scale: [0.85, 0.65, 1.3],
      bone: head,
      group: "mouth",
      name: "maw_plasma_core",
    }),
    2.8,
  );

  // ---------------------------------------------------------------------------
  // 4. EIGHT HEROIC ARTICULATED TENTACLES (Dynamic, Expressive, Rich Detail)
  // ---------------------------------------------------------------------------

  type TentacleDef = {
    name: string;
    parent: any;
    path: THREE.Vector3[];
    baseR: number;
    tipR: number;
    suctions: number;
    scutes: number;
  };

  const tentacles: TentacleDef[] = [
    // 1. SKY-REACHER LEFT (ML): Majestic high scythe framing the left silhouette
    {
      name: "tentacleML",
      parent: spine2,
      path: [
        new THREE.Vector3(0.48, 1.35, 0.15),
        new THREE.Vector3(0.85, 1.85, 0.32),
        new THREE.Vector3(1.18, 2.45, 0.38),
        new THREE.Vector3(1.05, 3.05, 0.15),
        new THREE.Vector3(0.72, 3.32, -0.12),
        new THREE.Vector3(0.38, 3.18, -0.25),
      ],
      baseR: 0.175,
      tipR: 0.026,
      suctions: 18,
      scutes: 8,
    },
    // 2. SKY-REACHER RIGHT (MR): Symmetrical high silhouette weapon
    {
      name: "tentacleMR",
      parent: spine2,
      path: [
        new THREE.Vector3(-0.48, 1.35, 0.15),
        new THREE.Vector3(-0.85, 1.82, 0.32),
        new THREE.Vector3(-1.18, 2.42, 0.35),
        new THREE.Vector3(-1.08, 3.02, 0.12),
        new THREE.Vector3(-0.75, 3.28, -0.15),
        new THREE.Vector3(-0.42, 3.12, -0.28),
      ],
      baseR: 0.175,
      tipR: 0.026,
      suctions: 18,
      scutes: 8,
    },
    // 3. WIDE LATERAL CURLER LEFT (SL): Sweeps wide over the water
    {
      name: "tentacleSL",
      parent: spine1,
      path: [
        new THREE.Vector3(0.45, 0.95, 0.05),
        new THREE.Vector3(0.92, 1.15, 0.35),
        new THREE.Vector3(1.48, 1.25, 0.52),
        new THREE.Vector3(1.78, 0.92, 0.35),
        new THREE.Vector3(1.68, 0.45, -0.05),
        new THREE.Vector3(1.35, 0.16, -0.32),
      ],
      baseR: 0.16,
      tipR: 0.025,
      suctions: 16,
      scutes: 7,
    },
    // 4. GALLEON CRUSHER RIGHT (SR): Wraps around the broken mast & wreckage!
    {
      name: "tentacleSR",
      parent: spine1,
      path: [
        new THREE.Vector3(-0.45, 0.92, 0.05),
        new THREE.Vector3(-0.82, 1.05, 0.42),
        new THREE.Vector3(-1.12, 1.15, 0.78),
        new THREE.Vector3(-1.26, 0.82, 0.94), // tightly gripping mast
        new THREE.Vector3(-1.15, 0.42, 0.65),
        new THREE.Vector3(-0.85, 0.16, 0.45),
      ],
      baseR: 0.165,
      tipR: 0.025,
      suctions: 16,
      scutes: 7,
    },
    // 5. LUNGING FORWARD LEFT (FL): Aggressive forward strike toward viewer
    {
      name: "tentacleFL",
      parent: spine1,
      path: [
        new THREE.Vector3(0.35, 0.88, 0.42),
        new THREE.Vector3(0.68, 1.12, 0.85),
        new THREE.Vector3(0.92, 1.25, 1.28),
        new THREE.Vector3(1.08, 0.85, 1.55),
        new THREE.Vector3(0.85, 0.42, 1.62),
        new THREE.Vector3(0.55, 0.16, 1.48),
      ],
      baseR: 0.16,
      tipR: 0.025,
      suctions: 16,
      scutes: 7,
    },
    // 6. POISED FORWARD RIGHT (FR): Counter-striking forward arm
    {
      name: "tentacleFR",
      parent: spine1,
      path: [
        new THREE.Vector3(-0.35, 0.88, 0.42),
        new THREE.Vector3(-0.65, 1.15, 0.82),
        new THREE.Vector3(-0.88, 1.35, 1.22),
        new THREE.Vector3(-1.05, 1.18, 1.52),
        new THREE.Vector3(-0.95, 0.65, 1.58),
        new THREE.Vector3(-0.72, 0.22, 1.42),
      ],
      baseR: 0.16,
      tipR: 0.025,
      suctions: 16,
      scutes: 7,
    },
    // 7. DORSAL REAR LEFT (BL): Arching back over the water
    {
      name: "tentacleBL",
      parent: spine1,
      path: [
        new THREE.Vector3(0.32, 0.85, -0.38),
        new THREE.Vector3(0.68, 1.22, -0.72),
        new THREE.Vector3(0.95, 1.68, -0.98),
        new THREE.Vector3(0.92, 2.12, -1.15),
        new THREE.Vector3(0.68, 2.35, -1.05),
        new THREE.Vector3(0.38, 2.22, -0.88),
      ],
      baseR: 0.155,
      tipR: 0.024,
      suctions: 15,
      scutes: 7,
    },
    // 8. DORSAL REAR RIGHT (BR): Symmetrical rear silhouette balancer
    {
      name: "tentacleBR",
      parent: spine1,
      path: [
        new THREE.Vector3(-0.32, 0.85, -0.38),
        new THREE.Vector3(-0.68, 1.2, -0.75),
        new THREE.Vector3(-0.98, 1.65, -1.02),
        new THREE.Vector3(-0.95, 2.1, -1.18),
        new THREE.Vector3(-0.7, 2.32, -1.08),
        new THREE.Vector3(-0.4, 2.18, -0.92),
      ],
      baseR: 0.155,
      tipR: 0.024,
      suctions: 15,
      scutes: 7,
    },
  ];

  const bodyCenter = new THREE.Vector3(0, 1.2, 0.1);

  tentacles.forEach((cfg) => {
    const curve = catmull(cfg.path);

    // Rigged Joint Chain
    const tentChain = b.chain(cfg.name, curve, {
      parent: cfg.parent,
      count: 5,
      role: "tentacle",
      group: "tentacles",
    });

    // Continuous Organic Muscle Sweep
    b.sweep(
      tentChain,
      (t) => {
        const rad = cfg.baseR * (1 - t * 0.82) + cfg.tipR;
        return [rad * 1.06, rad * 0.94];
      },
      {
        bone: tentChain,
        color: skinPaint,
        group: "tentacles",
        name: `${cfg.name}_sweep`,
      },
    );

    // Dual Bioluminescent Suction Cup Rows along Ventral (Inner) Curve
    for (let s = 1; s < cfg.suctions; s++) {
      const t = s / cfg.suctions;
      const pt = curve.at(t);
      const tan = curve.tangentAt(t);
      const rad = cfg.baseR * (1 - t * 0.82) + cfg.tipR;

      // Robust frame derivation
      const radial = pt.clone().sub(bodyCenter);
      const dorsal = radial.clone().addScaledVector(tan, -radial.dot(tan)).normalize();
      const ventral = dorsal.clone().negate();
      const side = new THREE.Vector3().crossVectors(tan, dorsal).normalize();

      const lateralOffset = (s % 2 === 0 ? 0.35 : -0.35) * rad;
      const padPos = pt
        .clone()
        .addScaledVector(ventral, rad * 0.88)
        .addScaledVector(side, lateralOffset);

      const padScale = (cfg.baseR * 0.38 + 0.015) * (1 - t * 0.58);

      // Fleshy teal suction rim
      b.part(new THREE.CylinderGeometry(padScale, padScale * 1.18, padScale * 0.3, 10), BELLY_CYAN, {
        at: padPos,
        dir: ventral,
        bone: tentChain.jointAt(t),
        group: "tentacles",
        name: `${cfg.name}_suction_rim_${s}`,
      });

      // Glowing Cyan Inner Valve Disc
      glow(
        b.part(new THREE.CircleGeometry(padScale * 0.82, 10), "#ffffff", {
          at: padPos.clone().addScaledVector(ventral, padScale * 0.16),
          dir: ventral,
          axis: "z",
          bone: tentChain.jointAt(t),
          texture: suctionCupTex,
          group: "tentacles",
          name: `${cfg.name}_suction_valve_${s}`,
        }),
        1.7,
      );
    }

    // Articulated, Flush Chitin Armor Scale Plates (Overwatch Mecha-Carapace)
    for (let p = 1; p < cfg.scutes; p++) {
      const t = (p - 0.2) / cfg.scutes;
      if (t > 0.82) continue;
      const pt = curve.at(t);
      const tan = curve.tangentAt(t);
      const rad = cfg.baseR * (1 - t * 0.82) + cfg.tipR;

      const radial = pt.clone().sub(bodyCenter);
      const dorsal = radial.clone().addScaledVector(tan, -radial.dot(tan)).normalize();
      const side = new THREE.Vector3().crossVectors(tan, dorsal).normalize();

      // Positioned cleanly embedded into the dorsal surface
      const platePos = pt.clone().addScaledVector(dorsal, rad * 0.84);
      const plateW = rad * 1.25;
      const plateL = rad * 0.95;
      const plateH = rad * 0.35;

      // Faceted armor plate resting flush on the tentacle skin
      b.frustumBox(
        platePos.clone().addScaledVector(tan, -plateL * 0.5),
        platePos.clone().addScaledVector(tan, plateL * 0.5),
        [plateW, plateH],
        [plateW * 0.72, plateH * 0.45],
        {
          bone: tentChain.jointAt(t),
          color: CHITIN_NAVY,
          group: "tentacles",
          name: `${cfg.name}_armor_plate_${p}`,
        },
      );

      // Swept Hazard Coral Ridge Spine along center of plate
      const thornAim = dorsal.clone().addScaledVector(tan, -0.45).normalize();
      b.spike(platePos.clone().addScaledVector(dorsal, plateH * 0.4), thornAim, rad * 0.55, rad * 0.18, {
        bone: tentChain.jointAt(t),
        color: HAZARD_CORAL,
        group: "tentacles",
        name: `${cfg.name}_armor_spine_${p}`,
      });

      // Glowing Cyan Power Node on plate flank
      glow(
        b.part(new THREE.SphereGeometry(rad * 0.16, 6, 4), CYAN_ENERGY, {
          at: platePos.clone().addScaledVector(side, (p % 2 === 0 ? 1 : -1) * plateW * 0.38),
          bone: tentChain.jointAt(t),
          group: "tentacles",
          name: `${cfg.name}_plate_glow_${p}`,
        }),
        2.2,
      );
    }
  });

  // ---------------------------------------------------------------------------
  // 5. WATER COLLAR BREACH FROTH
  // ---------------------------------------------------------------------------
  // Dynamic churn collar right where the massive torso breaches the water
  const collarPts: THREE.Vector3[] = [];
  const collarN = 18;
  for (let c = 0; c < collarN; c++) {
    const a = (c / collarN) * Math.PI * 2;
    const rW = 0.75 + 0.08 * Math.sin(c * 5);
    collarPts.push(new THREE.Vector3(Math.cos(a) * rW, 0.45 + 0.04 * Math.sin(c * 3), Math.sin(a) * rW));
  }
  b.sweep(catmull(collarPts, { closed: true }), 0.062, {
    color: SEA_FOAM,
    bone: root,
    group: "scenery",
    name: "torso_water_breach_collar",
  });

  return b.root;
}
