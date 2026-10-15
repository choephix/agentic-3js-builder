import * as THREE from "three";
import {
  aim,
  bezier,
  catmull,
  countershade,
  createBuilder,
  gradient,
  mottle,
  paint,
  rng,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Kraken Rising",
  description:
    "A colossal oceanic dread-titan erupting from churning waters with eight dynamic tentacles, segmented Overwatch-style tech-chitin carapace, and glowing bioluminescent vents.",
};

export default function build() {
  const b = createBuilder({ name: "kraken_rising", paintSize: 2048, detail: 1 });
  const seedRng = rng(1042);

  // ---------------------------------------------------------------------------
  // COLOR PALETTE & PAINTS (Overwatch Heroic Ocean Monster Palette)
  // ---------------------------------------------------------------------------
  const NAVY_DEEP = "#0a1324"; // Heavy abyss armor plate
  const TEAL_CHITIN = "#123c4f"; // Main carapace tone
  const TEAL_LIGHT = "#1e5b74"; // Carapace highlight rim
  const BELLY_FLESH = "#76c2c9"; // Ventral soft muscular skin
  const FLESH_SHADOW = "#43828d"; // Underside fleshy crease
  const CORAL_ACCENT = "#ff4d36"; // High-visibility Overwatch hazard orange
  const GOLD_BRASS = "#d99f36"; // Salvaged nautical hardware
  const WOOD_DARK = "#2d2019"; // Wreckage timber
  const WOOD_LIGHT = "#4a3528";
  const SEA_DEEP = "#073b4c"; // Swirling vortex water
  const SEA_SURFACE = "#0b6680";
  const SEA_FOAM = "#e1f8ff"; // Breaking wave froth
  const CYAN_PULSE = "#00f0ff"; // Bioluminescent conduits and optics
  const CYAN_DEEP = "#00a3cc";
  const INK_DARK = "#05080f"; // Inner beak and crevices

  // Custom organic skin paint: soft bioluminescent countershading with subtle mottle
  const krakenSkin = countershade(
    mottle(TEAL_CHITIN, NAVY_DEEP, { size: 0.22, seed: 44 }),
    mottle(BELLY_FLESH, FLESH_SHADOW, { size: 0.18, seed: 77 }),
    { level: 0.05, soft: 0.28 },
  );

  // Armored carapace paint with gradient sheen and warm directional hue
  const carapacePaint = paint((p, n) => {
    const upward = Math.max(0, n.y);
    const forward = Math.max(0, n.z);
    if (upward > 0.65 && p.y > 1.8) return TEAL_LIGHT;
    if (forward > 0.7 && p.y > 1.5) return TEAL_CHITIN;
    return upward > 0.2 ? TEAL_CHITIN : NAVY_DEEP;
  });

  // Sea water vortex swirling paint
  const vortexPaint = gradient(SEA_SURFACE, SEA_DEEP, [0, 0.4, 0], [0, 0, 0]);

  // ---------------------------------------------------------------------------
  // TEXTURES & SVG DECALS
  // ---------------------------------------------------------------------------

  // Primary Cyclopean Boss Optic (Overwatch stylized predator reticle)
  const eyeReticleTex = svg(
    `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="35%" stop-color="#00f0ff"/>
          <stop offset="70%" stop-color="#0080a8"/>
          <stop offset="100%" stop-color="#071b26"/>
        </radialGradient>
      </defs>
      <circle cx="128" cy="128" r="124" fill="#050a12" stroke="#ff4d36" stroke-width="6"/>
      <circle cx="128" cy="128" r="108" fill="url(#eyeGlow)"/>
      <circle cx="128" cy="128" r="54" fill="#04080e" stroke="#00f0ff" stroke-width="4"/>
      <!-- Crosshair / Aperture blades -->
      <path d="M128 10 L128 60 M128 196 L128 246 M10 128 L60 128 M196 128 L246 128" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
      <polygon points="128,88 152,128 128,168 104,128" fill="#00f0ff" opacity="0.9"/>
      <circle cx="128" cy="128" r="12" fill="#ffffff"/>
      <!-- Warning Chevrons -->
      <polygon points="128,32 138,44 118,44" fill="#ff4d36"/>
      <polygon points="128,224 138,212 118,212" fill="#ff4d36"/>
    </svg>`,
    { size: 512 },
  );

  // Secondary Lateral Sensor Eye Texture
  const smallEyeTex = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="60" fill="#07111c" stroke="#00f0ff" stroke-width="5"/>
      <circle cx="64" cy="64" r="44" fill="#00f0ff"/>
      <ellipse cx="64" cy="64" rx="14" ry="34" fill="#050a12"/>
      <circle cx="56" cy="52" r="8" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  // Overwatch-Style Titan Crest Decal (Stylized Oceanic Kraken Trident Emblem)
  const crestDecalTex = svg(
    `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <path d="M128 16 L174 92 L146 92 L146 196 L128 220 L110 196 L110 92 L82 92 Z" fill="#ff4d36"/>
      <path d="M82 108 L46 150 L64 164 L96 124 Z" fill="#00f0ff"/>
      <path d="M174 108 L210 150 L192 164 L160 124 Z" fill="#00f0ff"/>
      <circle cx="128" cy="74" r="16" fill="#0a1324"/>
      <polygon points="128,140 138,158 118,158" fill="#ffffff"/>
    </svg>`,
    { size: 512 },
  );

  // Suction Cup Pad Texture (Concentric bio-valves with cyan core)
  const suctionCupTex = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="62" fill="#366b75" stroke="#16343b" stroke-width="4"/>
      <circle cx="64" cy="64" r="48" fill="#589ea8"/>
      <circle cx="64" cy="64" r="32" fill="#0a1a24" stroke="#00f0ff" stroke-width="4"/>
      <circle cx="64" cy="64" r="16" fill="#00f0ff"/>
      <circle cx="64" cy="64" r="7" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  // Stylized Oceanic Foam Swirl (For water splash cards)
  const foamSwirlTex = svg(
    `<svg viewBox="0 0 256 512" xmlns="http://www.w3.org/2000/svg">
      <path d="M128 500 C40 420 20 300 48 200 C68 130 110 80 128 12 C146 80 188 130 208 200 C236 300 216 420 128 500 Z" fill="#e1f8ff"/>
      <path d="M128 460 C70 390 56 300 78 220 C94 160 116 120 128 60 C140 120 162 160 178 220 C200 300 186 390 128 460 Z" fill="#ffffff"/>
      <path d="M128 380 C98 320 88 260 102 200 C112 160 122 130 128 90 C134 130 144 160 154 200 C168 260 158 320 128 380 Z" fill="#88e4ff"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // 1. STAGED ENVIRONMENT: THE CHURNING OCEAN VORTEX & WRECKAGE
  // ---------------------------------------------------------------------------

  // Stepped vortex base (rests precisely on y = 0)
  const baseOuter = b.part(new THREE.CylinderGeometry(1.65, 1.75, 0.08, 24), vortexPaint, {
    at: [0, 0.04, 0],
    group: "scenery",
    name: "sea_base_outer",
  });
  b.part(new THREE.CylinderGeometry(1.4, 1.5, 0.1, 24), SEA_DEEP, {
    at: [0, 0.09, 0],
    group: "scenery",
    name: "sea_base_mid",
  });
  b.part(new THREE.CylinderGeometry(1.1, 1.25, 0.12, 20), vortexPaint, {
    at: [0, 0.15, 0],
    group: "scenery",
    name: "sea_base_inner",
  });

  // Froth & foam rims spinning in the vortex
  for (let ringIdx = 0; ringIdx < 3; ringIdx++) {
    const r = 1.6 - ringIdx * 0.38;
    const yH = 0.08 + ringIdx * 0.06;
    const ringSegments = 16;
    const wavePoints: THREE.Vector3[] = [];
    for (let i = 0; i < ringSegments; i++) {
      const angle = (i / ringSegments) * Math.PI * 2;
      const waveWobble = 0.04 * Math.sin(angle * 6 + ringIdx * 2);
      wavePoints.push(new THREE.Vector3(Math.cos(angle) * (r + waveWobble), yH, Math.sin(angle) * (r + waveWobble)));
    }
    b.sweep(catmull(wavePoints, { closed: true }), 0.035 - ringIdx * 0.005, {
      color: SEA_FOAM,
      group: "scenery",
      name: `foam_crest_${ringIdx}`,
    });
  }

  // Crushed Galleon Wreckage (Establishes the colossal scale of the Kraken)
  const mastBase = new THREE.Vector3(-0.95, 0.08, 0.75);
  const mastTip = new THREE.Vector3(-1.3, 0.82, 0.95);
  b.sweep(bezier(mastBase, mid(mastBase, mastTip), mastTip), [0.06, 0.04], {
    color: WOOD_DARK,
    group: "scenery",
    name: "galleon_mast",
  });

  // Broken crossbeam on mast
  const crossA = new THREE.Vector3(-1.42, 0.65, 0.72);
  const crossB = new THREE.Vector3(-1.08, 0.58, 1.15);
  b.rod(crossA, crossB, 0.032, { color: WOOD_LIGHT, group: "scenery", name: "crossbeam" });

  // Brass reinforcements on broken mast
  b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.04, 10), GOLD_BRASS, {
    at: mid(mastBase, mastTip),
    aim: mastTip,
    group: "scenery",
    name: "mast_brass_band",
  });

  // Broken hull planking emerging from water
  for (let pIdx = 0; pIdx < 4; pIdx++) {
    const angle = 2.1 + pIdx * 0.28;
    const dist = 1.05 + pIdx * 0.08;
    const plankBottom = new THREE.Vector3(Math.cos(angle) * dist, 0.05, Math.sin(angle) * dist);
    const plankTop = new THREE.Vector3(
      Math.cos(angle) * (dist + 0.15),
      0.35 + (pIdx % 2) * 0.15,
      Math.sin(angle) * (dist + 0.15),
    );
    b.frustumBox(plankBottom, plankTop, [0.08, 0.02], [0.06, 0.015], {
      color: pIdx % 2 === 0 ? WOOD_DARK : WOOD_LIGHT,
      group: "scenery",
      name: `wreck_plank_${pIdx}`,
    });
  }

  // Vertical Water Splash Blades (Rising dread effect)
  const splashFrames: THREE.Vector3[] = [];
  for (let sIdx = 0; sIdx < 12; sIdx++) {
    const a = (sIdx / 12) * Math.PI * 2 + 0.2;
    const r = 0.75 + 0.35 * Math.sin(sIdx * 3);
    const splashPt = new THREE.Vector3(Math.cos(a) * r, 0.15, Math.sin(a) * r);
    splashFrames.push(splashPt);
  }

  b.cards(
    splashFrames.map((pt) => {
      const normal = pt.clone().setY(0).normalize();
      return {
        at: pt,
        axis: new THREE.Vector3(0, 1, 0),
        quat: aim(new THREE.Vector3(0, 1, 0), normal),
        weights: [],
        bone: null,
        local: (p: any) => pt.clone().add(p),
        dir: (v: any) => v,
        moved: (p: any) => p,
      } as any;
    }),
    foamSwirlTex,
    {
      size: [0.24, 0.55],
      lean: 22,
      bend: 15,
      vary: 0.3,
      rng: seedRng,
      group: "scenery",
      name: "splash_froth_cards",
    },
  );

  // ---------------------------------------------------------------------------
  // 2. SKELETON HIERARCHY
  // ---------------------------------------------------------------------------

  // Single root joint rising from ocean center
  const root = b.joint("root", { at: [0, 0.42, 0], dir: [0, 1, 0] });

  // Spine rising through torso and neck
  const spine1 = b.joint("spine1", { parent: root, at: [0, 0.85, 0.02], dir: [0, 1, 0.1], role: "spine" });
  const spine2 = b.joint("spine2", { parent: spine1, at: [0, 1.35, 0.08], dir: [0, 1, 0.15], role: "spine" });

  // Head / Mantle Core
  const head = b.joint("head", { parent: spine2, at: [0, 1.85, 0.18], dir: [0, 0.95, 0.25], role: "head" });

  // Top of the towering mantle
  const mantleApex = b.joint("mantleApex", {
    parent: head,
    at: [0, 2.75, -0.15],
    dir: [0, 0.8, -0.4],
    role: "head",
  });

  // Jaw structure (Beak & Mandibles)
  const jawUpper = b.joint("jawUpper", {
    parent: head,
    at: [0, 1.55, 0.42],
    dir: [0, 0.2, 0.98],
    role: "jaw",
  });
  const jawLower = b.joint("jawLower", {
    parent: head,
    at: [0, 1.38, 0.38],
    dir: [0, -0.35, 0.92],
    role: "jaw",
  });

  // Left & Right Siphons (Hydro-propulsion exhausts)
  const siphonL = b.joint("siphonL", { parent: spine2, at: [0.42, 1.25, -0.05], dir: [0.6, -0.2, -0.75] });
  const siphonR = b.joint("siphonR", { parent: spine2, at: [-0.42, 1.25, -0.05], dir: [-0.6, -0.2, -0.75] });

  // ---------------------------------------------------------------------------
  // 3. MAIN BODY & TOWERING MANTLE (Overwatch Stylized Sculpt)
  // ---------------------------------------------------------------------------

  // Primary Muscular Torso Loft
  const torsoStations = [
    { at: [0, 0.45, 0], w: 0.85, h: 0.82 },
    { at: [0, 0.85, 0.02], w: 1.05, h: 0.98 },
    { at: [0, 1.35, 0.08], w: 1.15, h: 1.08 },
    { at: [0, 1.85, 0.18], w: 1.08, h: 1.18 },
    { at: [0, 2.35, 0.05], w: 0.82, h: 0.92 },
    { at: [0, 2.75, -0.15], w: 0.38, h: 0.45 },
    { at: [0, 2.98, -0.28], w: 0.08, h: 0.08 },
  ];

  const mainBody = b.loft(torsoStations, {
    bone: [root, spine1, spine2, head, mantleApex],
    color: krakenSkin,
    group: "body",
    name: "torso_mantle",
  });

  // Aerodynamic Cowl Crest (Overwatch Carapace Fin along rear mantle)
  const mantleFinOutline: [number, number, "sharp"?][] = [
    [0.0, 0.0, "sharp"],
    [0.0, 1.2, "sharp"],
    [-0.32, 0.95],
    [-0.48, 0.45],
    [-0.25, 0.05, "sharp"],
  ];
  b.extrude(mantleFinOutline, {
    at: [0, 1.85, -0.22],
    x: [0, 0, -1],
    y: [0, 0.9, -0.3],
    thickness: [0.08, 0.02],
    bevel: 0.015,
    smoothing: 2,
    color: carapacePaint,
    bone: mantleApex,
    group: "carapace",
    name: "mantle_rear_crest",
  });

  // Layered Overlapping Chitin Armor Plates on the Mantle Crown
  for (let plate = 0; plate < 3; plate++) {
    const yPos = 1.95 + plate * 0.32;
    const zPos = 0.02 - plate * 0.08;
    const scaleFactor = 1.0 - plate * 0.18;
    const plateWidth = 0.58 * scaleFactor;
    const plateHeight = 0.34 * scaleFactor;
    const plateDepth = 0.42 * scaleFactor;

    // Segmented carapace shield
    b.part(
      new THREE.CylinderGeometry(plateWidth * 0.9, plateWidth, plateHeight, 8, 1, false, 0, Math.PI),
      carapacePaint,
      {
        at: [0, yPos, zPos],
        bone: head,
        dir: [0, 0.85, -0.4],
        scale: [1.1, 1, 1.3],
        group: "carapace",
        name: `mantle_plate_${plate}`,
      },
    );

    // Glowing cyan energy seams between plates
    glow(
      b.part(new THREE.TorusGeometry(plateWidth * 0.92, 0.018, 6, 16, Math.PI), CYAN_PULSE, {
        at: [0, yPos - plateHeight * 0.45, zPos - 0.02],
        bone: head,
        dir: [0, 0.85, -0.4],
        group: "carapace",
        name: `carapace_energy_seam_${plate}`,
      }),
      1.8,
    );
  }

  // Side Siphon Exhausts (Water-jet boosters)
  for (const s of [1, -1]) {
    const siphonBone = s === 1 ? siphonL : siphonR;
    const sAt = new THREE.Vector3(s * 0.48, 1.22, -0.06);
    const sDir = new THREE.Vector3(s * 0.65, -0.25, -0.65).normalize();

    // Siphon housing
    b.sweep(bezier(sAt, sAt.clone().addScaledVector(sDir, 0.15), sAt.clone().addScaledVector(sDir, 0.32)), [0.14, 0.09], {
      bone: siphonBone,
      color: NAVY_DEEP,
      group: "siphons",
      name: `siphon_housing_${s > 0 ? "L" : "R"}`,
    });

    // Glowing cyan exhaust nozzle rim
    glow(
      b.part(new THREE.CylinderGeometry(0.095, 0.095, 0.04, 12, 1, true), CYAN_PULSE, {
        at: sAt.clone().addScaledVector(sDir, 0.31),
        dir: sDir,
        bone: siphonBone,
        group: "siphons",
        name: `siphon_nozzle_${s > 0 ? "L" : "R"}`,
      }),
      2.0,
    );

    // Coral hazard accents on siphon cowl
    b.part(new THREE.BoxGeometry(0.04, 0.06, 0.16), CORAL_ACCENT, {
      at: sAt.clone().add(new THREE.Vector3(s * 0.06, 0.08, 0)),
      aim: sDir,
      bone: siphonBone,
      group: "siphons",
      name: `siphon_hazard_${s > 0 ? "L" : "R"}`,
    });
  }

  // Decal on forehead/crown: Boss Titan Emblem
  b.part(new THREE.PlaneGeometry(0.32, 0.32), "#ffffff", {
    at: [0, 2.38, 0.44],
    dir: [0, 0.4, 0.9],
    axis: "z",
    bone: head,
    texture: crestDecalTex,
    group: "carapace",
    name: "titan_crest_decal",
  });

  // ---------------------------------------------------------------------------
  // 4. PREDATOR FACE, OCULAR VISOR & BEAK MANDIBLES
  // ---------------------------------------------------------------------------

  // Forward Visor Brow Ridge (Overwatch angled brow)
  const browA = new THREE.Vector3(-0.35, 1.88, 0.52);
  const browMid = new THREE.Vector3(0, 1.95, 0.62);
  const browB = new THREE.Vector3(0.35, 1.88, 0.52);
  b.sweep(bezier(browA, browMid, browB), 0.055, {
    bone: head,
    color: NAVY_DEEP,
    group: "head",
    name: "ocular_brow_ridge",
  });

  // Central Eye Cluster Housing
  const centralEyeFrame = new THREE.Vector3(0, 1.82, 0.64);
  b.part(new THREE.CylinderGeometry(0.18, 0.22, 0.08, 16), NAVY_DEEP, {
    at: centralEyeFrame,
    dir: [0, 0.15, 0.98],
    bone: head,
    group: "head",
    name: "central_eye_socket",
  });

  // Glowing Primary Boss Optic
  glow(
    b.part(new THREE.CircleGeometry(0.16, 24), "#ffffff", {
      at: centralEyeFrame.clone().add(new THREE.Vector3(0, 0.015, 0.042)),
      dir: [0, 0.15, 0.98],
      axis: "z",
      bone: head,
      texture: eyeReticleTex,
      group: "head",
      name: "central_eye_reticle",
    }),
    2.2,
  );

  // Lateral Predator Sensor Eyes (2 on left, 2 on right)
  for (const s of [1, -1]) {
    // Upper lateral eye
    const eyeTopPt = new THREE.Vector3(s * 0.32, 1.86, 0.46);
    const eyeTopDir = new THREE.Vector3(s * 0.72, 0.18, 0.66).normalize();
    b.part(new THREE.CylinderGeometry(0.065, 0.08, 0.04, 10), NAVY_DEEP, {
      at: eyeTopPt,
      dir: eyeTopDir,
      bone: head,
      group: "head",
      name: `eye_lat_top_socket_${s > 0 ? "L" : "R"}`,
    });
    glow(
      b.part(new THREE.CircleGeometry(0.055, 12), "#ffffff", {
        at: eyeTopPt.clone().addScaledVector(eyeTopDir, 0.022),
        dir: eyeTopDir,
        axis: "z",
        bone: head,
        texture: smallEyeTex,
        group: "head",
        name: `eye_lat_top_lens_${s > 0 ? "L" : "R"}`,
      }),
      1.8,
    );

    // Lower lateral eye
    const eyeBotPt = new THREE.Vector3(s * 0.38, 1.72, 0.42);
    const eyeBotDir = new THREE.Vector3(s * 0.8, -0.05, 0.58).normalize();
    b.part(new THREE.CylinderGeometry(0.05, 0.065, 0.035, 10), NAVY_DEEP, {
      at: eyeBotPt,
      dir: eyeBotDir,
      bone: head,
      group: "head",
      name: `eye_lat_bot_socket_${s > 0 ? "L" : "R"}`,
    });
    glow(
      b.part(new THREE.CircleGeometry(0.042, 12), "#ffffff", {
        at: eyeBotPt.clone().addScaledVector(eyeBotDir, 0.02),
        dir: eyeBotDir,
        axis: "z",
        bone: head,
        texture: smallEyeTex,
        group: "head",
        name: `eye_lat_bot_lens_${s > 0 ? "L" : "R"}`,
      }),
      1.8,
    );
  }

  // Upper Beak / Hooked Calamari Rostrum (Attached to jawUpper)
  const upperBeakBase = new THREE.Vector3(0, 1.62, 0.48);
  const upperBeakMid = new THREE.Vector3(0, 1.58, 0.68);
  const upperBeakTip = new THREE.Vector3(0, 1.36, 0.76);
  b.sweep(bezier(upperBeakBase, upperBeakMid, upperBeakTip), [0.12, 0.015], {
    bone: jawUpper,
    color: INK_DARK,
    group: "mouth",
    name: "upper_beak_hook",
  });

  // Upper Beak Chitin Plating with Coral Edge
  b.part(new THREE.ConeGeometry(0.11, 0.24, 6), TEAL_CHITIN, {
    at: [0, 1.58, 0.62],
    aim: [0, -0.6, 0.8],
    bone: jawUpper,
    group: "mouth",
    name: "upper_beak_armor",
  });

  // Lower Jaw / Interlocking Calamari Pincers (Attached to jawLower)
  const lowerBeakBase = new THREE.Vector3(0, 1.34, 0.42);
  const lowerBeakTip = new THREE.Vector3(0, 1.48, 0.72);
  b.sweep(bezier(lowerBeakBase, mid(lowerBeakBase, lowerBeakTip), lowerBeakTip), [0.14, 0.02], {
    bone: jawLower,
    color: INK_DARK,
    group: "mouth",
    name: "lower_beak_core",
  });

  // Left & Right Mandible Pincers
  for (const s of [1, -1]) {
    const mandBase = new THREE.Vector3(s * 0.16, 1.38, 0.46);
    const mandCurve = new THREE.Vector3(s * 0.28, 1.44, 0.62);
    const mandTip = new THREE.Vector3(s * 0.06, 1.46, 0.74);
    b.sweep(catmull([mandBase, mandCurve, mandTip]), (t) => 0.055 * (1 - t * 0.75), {
      bone: jawLower,
      color: s > 0 ? CORAL_ACCENT : CORAL_ACCENT,
      group: "mouth",
      name: `mandible_${s > 0 ? "L" : "R"}`,
    });
  }

  // Bioluminescent Mouth Furnace Core
  glow(
    b.part(new THREE.SphereGeometry(0.12, 12, 8), CYAN_PULSE, {
      at: [0, 1.48, 0.52],
      scale: [0.8, 0.6, 1.2],
      bone: head,
      group: "mouth",
      name: "mouth_plasma_core",
    }),
    2.5,
  );

  // ---------------------------------------------------------------------------
  // 5. EIGHT DYNAMIC ARTICULATED TENTACLES (Signature Feature)
  // ---------------------------------------------------------------------------

  // Helper definition for creating tentacles with rich details
  type TentacleConfig = {
    name: string;
    parent: any;
    path: THREE.Vector3[];
    baseRadius: number;
    tipRadius: number;
    jointCount: number;
    suctionCount: number;
    spineCount: number;
  };

  const tentacleConfigs: TentacleConfig[] = [
    // 1. FRONT LEFT (FL): Lunging forward, striking curve across water
    {
      name: "tentacleFL",
      parent: spine1,
      path: [
        new THREE.Vector3(0.38, 0.95, 0.35),
        new THREE.Vector3(0.72, 1.15, 0.75),
        new THREE.Vector3(0.98, 1.35, 1.15),
        new THREE.Vector3(1.15, 0.92, 1.48),
        new THREE.Vector3(0.95, 0.45, 1.62),
        new THREE.Vector3(0.75, 0.18, 1.55),
      ],
      baseRadius: 0.16,
      tipRadius: 0.025,
      jointCount: 5,
      suctionCount: 16,
      spineCount: 9,
    },
    // 2. FRONT RIGHT (FR): Asymmetrical counter-strike curling high forward
    {
      name: "tentacleFR",
      parent: spine1,
      path: [
        new THREE.Vector3(-0.38, 0.95, 0.35),
        new THREE.Vector3(-0.68, 1.2, 0.72),
        new THREE.Vector3(-0.92, 1.55, 1.05),
        new THREE.Vector3(-1.18, 1.42, 1.38),
        new THREE.Vector3(-1.28, 0.95, 1.42),
        new THREE.Vector3(-1.08, 0.42, 1.35),
      ],
      baseRadius: 0.16,
      tipRadius: 0.025,
      jointCount: 5,
      suctionCount: 16,
      spineCount: 9,
    },
    // 3. MID-HIGH LEFT (ML): Massive towering sky-reacher (Heroic Pose)
    {
      name: "tentacleML",
      parent: spine2,
      path: [
        new THREE.Vector3(0.48, 1.35, 0.12),
        new THREE.Vector3(0.85, 1.85, 0.35),
        new THREE.Vector3(1.15, 2.45, 0.42),
        new THREE.Vector3(1.08, 2.95, 0.18),
        new THREE.Vector3(0.78, 3.22, -0.08),
        new THREE.Vector3(0.48, 3.12, -0.22),
      ],
      baseRadius: 0.17,
      tipRadius: 0.022,
      jointCount: 5,
      suctionCount: 18,
      spineCount: 11,
    },
    // 4. MID-HIGH RIGHT (MR): Grasping dread-tentacle framing the head
    {
      name: "tentacleMR",
      parent: spine2,
      path: [
        new THREE.Vector3(-0.48, 1.35, 0.12),
        new THREE.Vector3(-0.88, 1.82, 0.32),
        new THREE.Vector3(-1.22, 2.38, 0.35),
        new THREE.Vector3(-1.15, 2.88, 0.12),
        new THREE.Vector3(-0.85, 3.15, -0.12),
        new THREE.Vector3(-0.55, 3.02, -0.25),
      ],
      baseRadius: 0.17,
      tipRadius: 0.022,
      jointCount: 5,
      suctionCount: 18,
      spineCount: 11,
    },
    // 5. SIDE WATER SLAP LEFT (SL): Thrashing water, churning the vortex
    {
      name: "tentacleSL",
      parent: spine1,
      path: [
        new THREE.Vector3(0.42, 0.78, -0.15),
        new THREE.Vector3(0.85, 0.65, 0.08),
        new THREE.Vector3(1.32, 0.48, 0.25),
        new THREE.Vector3(1.68, 0.32, 0.08),
        new THREE.Vector3(1.82, 0.18, -0.28),
        new THREE.Vector3(1.62, 0.08, -0.55),
      ],
      baseRadius: 0.15,
      tipRadius: 0.025,
      jointCount: 5,
      suctionCount: 15,
      spineCount: 8,
    },
    // 6. SIDE WATER SLAP RIGHT (SR): Smashing the galleon wreckage!
    {
      name: "tentacleSR",
      parent: spine1,
      path: [
        new THREE.Vector3(-0.42, 0.78, -0.15),
        new THREE.Vector3(-0.85, 0.62, 0.12),
        new THREE.Vector3(-1.25, 0.45, 0.38),
        new THREE.Vector3(-1.58, 0.28, 0.22),
        new THREE.Vector3(-1.65, 0.16, -0.15),
        new THREE.Vector3(-1.42, 0.08, -0.48),
      ],
      baseRadius: 0.15,
      tipRadius: 0.025,
      jointCount: 5,
      suctionCount: 15,
      spineCount: 8,
    },
    // 7. BACK LEFT (BL): Arching rear dorsal tentacle
    {
      name: "tentacleBL",
      parent: spine1,
      path: [
        new THREE.Vector3(0.32, 0.88, -0.42),
        new THREE.Vector3(0.68, 1.25, -0.75),
        new THREE.Vector3(0.92, 1.72, -0.98),
        new THREE.Vector3(0.88, 2.18, -1.15),
        new THREE.Vector3(0.62, 2.38, -1.08),
        new THREE.Vector3(0.38, 2.25, -0.92),
      ],
      baseRadius: 0.15,
      tipRadius: 0.022,
      jointCount: 5,
      suctionCount: 15,
      spineCount: 9,
    },
    // 8. BACK RIGHT (BR): Arching rear dorsal tentacle
    {
      name: "tentacleBR",
      parent: spine1,
      path: [
        new THREE.Vector3(-0.32, 0.88, -0.42),
        new THREE.Vector3(-0.68, 1.22, -0.78),
        new THREE.Vector3(-0.95, 1.68, -1.02),
        new THREE.Vector3(-0.92, 2.15, -1.18),
        new THREE.Vector3(-0.65, 2.35, -1.12),
        new THREE.Vector3(-0.42, 2.22, -0.95),
      ],
      baseRadius: 0.15,
      tipRadius: 0.022,
      jointCount: 5,
      suctionCount: 15,
      spineCount: 9,
    },
  ];

  // Build each tentacle with smooth chains, articulated tubes, suction cups, and armor
  tentacleConfigs.forEach((cfg) => {
    const tentCurve = catmull(cfg.path);

    // 1. Rigged Joint Chain
    const tentChain = b.chain(cfg.name, tentCurve, {
      parent: cfg.parent,
      count: cfg.jointCount,
      role: "tentacle",
      group: "tentacles",
    });

    // 2. Continuous Organic Skin Sweep
    const tentSweep = b.sweep(
      tentChain,
      (t) => {
        const rad = cfg.baseRadius * (1 - t * 0.85) + cfg.tipRadius;
        return [rad * 1.05, rad * 0.95];
      },
      {
        bone: tentChain,
        color: krakenSkin,
        group: "tentacles",
        name: `${cfg.name}_sweep`,
      },
    );

    // 3. Ventral Suction Cups (Row of bio-luminescent suction discs)
    // We sample along the ventral side of the tentacle curve
    for (let sIdx = 1; sIdx < cfg.suctionCount; sIdx++) {
      const t = sIdx / cfg.suctionCount;
      const pt = tentCurve.at(t);
      const tangent = tentCurve.tangentAt(t);
      const rad = cfg.baseRadius * (1 - t * 0.85) + cfg.tipRadius;

      // Calculate ventral normal (oriented away from head or towards inner curl)
      const approxUp = new THREE.Vector3(0, 1, 0);
      const side = new THREE.Vector3().crossVectors(tangent, approxUp).normalize();
      const ventral = new THREE.Vector3().crossVectors(side, tangent).normalize();

      // Position suction pad on surface
      const padAt = pt.clone().addScaledVector(ventral, -rad * 0.88);
      const padSize = (cfg.baseRadius * 0.38 + 0.02) * (1 - t * 0.65);

      // Suction pad rim base
      b.part(new THREE.CylinderGeometry(padSize, padSize * 1.15, padSize * 0.35, 10), BELLY_FLESH, {
        at: padAt,
        dir: ventral.clone().negate(),
        bone: tentChain.jointAt(t),
        group: "tentacles",
        name: `${cfg.name}_suction_${sIdx}`,
      });

      // Bioluminescent suction valve center
      glow(
        b.part(new THREE.CircleGeometry(padSize * 0.78, 10), "#ffffff", {
          at: padAt.clone().addScaledVector(ventral, -padSize * 0.18),
          dir: ventral.clone().negate(),
          axis: "z",
          bone: tentChain.jointAt(t),
          texture: suctionCupTex,
          group: "tentacles",
          name: `${cfg.name}_suction_valve_${sIdx}`,
        }),
        1.6,
      );
    }

    // 4. Dorsal Armored Spine Ridges (Overwatch mechanical/chitin carapace plates)
    for (let pIdx = 1; pIdx < cfg.spineCount; pIdx++) {
      const t = (pIdx - 0.2) / cfg.spineCount;
      if (t > 0.88) continue;
      const pt = tentCurve.at(t);
      const tangent = tentCurve.tangentAt(t);
      const rad = cfg.baseRadius * (1 - t * 0.85) + cfg.tipRadius;

      const approxUp = new THREE.Vector3(0, 1, 0);
      const side = new THREE.Vector3().crossVectors(tangent, approxUp).normalize();
      const dorsal = new THREE.Vector3().crossVectors(tangent, side).normalize();

      const spineAt = pt.clone().addScaledVector(dorsal, rad * 0.92);
      const spineLen = (cfg.baseRadius * 0.85 + 0.04) * (1 - t * 0.5);
      const spineWidth = 0.035 * (1 - t * 0.4);

      // Angled dorsal thorn plate
      b.spike(spineAt, dorsal.clone().addScaledVector(tangent, -0.45).normalize(), spineLen, spineWidth, {
        bone: tentChain.jointAt(t),
        color: pIdx % 2 === 0 ? TEAL_CHITIN : CORAL_ACCENT,
        group: "tentacles",
        name: `${cfg.name}_dorsal_spine_${pIdx}`,
      });

      // Small glowing node on dorsal ridge
      if (pIdx % 2 === 1) {
        glow(
          b.part(new THREE.SphereGeometry(spineWidth * 0.9, 6, 4), CYAN_PULSE, {
            at: spineAt.clone().addScaledVector(dorsal, 0.015),
            bone: tentChain.jointAt(t),
            group: "tentacles",
            name: `${cfg.name}_dorsal_glow_${pIdx}`,
          }),
          2.0,
        );
      }
    }
  });

  // ---------------------------------------------------------------------------
  // 6. WATER ERUPTION FOAM RING AROUND RISING KRAKEN BODY
  // ---------------------------------------------------------------------------
  // Where the Kraken's massive body breaches the surface (around y = 0.45)
  const collarFoamPoints: THREE.Vector3[] = [];
  const collarSegments = 16;
  for (let c = 0; c < collarSegments; c++) {
    const a = (c / collarSegments) * Math.PI * 2;
    const radWobble = 0.72 + 0.08 * Math.sin(c * 4);
    collarFoamPoints.push(new THREE.Vector3(Math.cos(a) * radWobble, 0.46 + 0.04 * Math.cos(c * 3), Math.sin(a) * radWobble));
  }
  b.sweep(catmull(collarFoamPoints, { closed: true }), 0.065, {
    color: SEA_FOAM,
    bone: root,
    group: "scenery",
    name: "torso_water_collar",
  });

  return b.root;
}
