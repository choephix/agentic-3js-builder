Here is the revised Kraken model.

### Key Changes
1. **Hero Face & Cyclopean Visor Visibility**: Moved the ocular cluster and visor forward by over 0.25 m to prevent it from clipping inside the mantle loft. Added an aggressive Overwatch-style brow cowl, 4 stacked lateral sensor eyes, and a glowing cyan aperture reticle.
2. **Monstrous Beak & Maw**: Enlarged and extended the hooked chitin rostrum and serrated mandibles open in a roar, revealing an inner bio-plasma furnace throat with cyan emissive glow.
3. **Overwatch Carapace & Armor Plating**: Replaced the splotchy mottle paint with clean, bold Blizzard-style color blocking: deep naval chitin plates with bright cyan energy vents, hazard-orange warning chevrons, and luminous aquamarine ventral skin.
4. **Stable, Dynamic Tentacle Kinematics**: Fixed tentacle normal/dorsal vector calculations so spines and suction cups no longer flip or degenerate near vertical spans. Suction cups now sit on the inner curve facing the viewer, while sharp angular armor scutes line the dorsal ridge.
5. **Silhouette & Composition ("Tentacles Spread")**: Posed the 8 tentacles with distinct heroic silhouettes: 2 scythe-like sky-reachers, 2 wide lateral curlers framing the character, 2 lunging forward tentacles, and 2 water-slapping tentacles coiling around the environment.
6. **Heroic Galleon Wreckage & Churning Vortex Base**: Upgraded the water stage into an erupting vortex with spiraling foam crests, angular splash crowns, floating sea barrels, and a detailed shattered galleon mast with crow's nest and brass lantern being actively crushed by the Kraken.

```ts
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
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Kraken Rising",
  description:
    "An oceanic dread-titan erupting from a swirling vortex with eight dynamic tentacles, Overwatch-style segmented tech-chitin carapace, cyclopean glowing optics, and a shattered galleon.",
};

export default function build() {
  const b = createBuilder({ name: "kraken_rising", paintSize: 2048, detail: 1 });
  const seedRng = rng(421);

  // ---------------------------------------------------------------------------
  // COLOR PALETTE (Overwatch Heroic Monster Aesthetic)
  // ---------------------------------------------------------------------------
  const CHITIN_NAVY = "#081326"; // Primary heavy armor plates
  const CHITIN_TEAL = "#0e3a4d"; // Secondary carapace plates
  const CHITIN_EDGE = "#1c607a"; // Beveled plate highlights
  const BELLY_CYAN = "#38b6c4"; // Bioluminescent ventral skin
  const BELLY_PALE = "#6fe3ed"; // Inner glow highlight
  const HAZARD_CORAL = "#ff3b20"; // High-visibility Overwatch hazard markings
  const CYAN_ENERGY = "#00f0ff"; // Glowing conduits and optics
  const CYAN_WHITE = "#d8ffff";
  const GOLD_BRASS = "#d49b28"; // Salvaged nautical hardware
  const WOOD_HULL = "#2a1c14"; // Wreckage timbers
  const WOOD_MAST = "#483222";
  const SEA_DARK = "#052233"; // Whirlpool depths
  const SEA_FOAM = "#e6faff"; // Cresting waves and froth
  const INK_BLACK = "#03060a"; // Inner beak and crevices

  // Clean, stylized ventral-to-dorsal countershaded skin
  const skinPaint = countershade(CHITIN_TEAL, BELLY_CYAN, { level: -0.1, soft: 0.25 });

  // Directed carapace paint with subtle upward sheen
  const armorPaint = paint((p, n) => {
    if (n.y > 0.55 && p.y > 1.4) return CHITIN_EDGE;
    if (n.z > 0.6 && p.y > 1.2) return CHITIN_TEAL;
    return CHITIN_NAVY;
  });

  const waterPaint = gradient(SEA_DARK, "#094254", [0, 0, 0], [0, 0.45, 0]);

  // ---------------------------------------------------------------------------
  // TEXTURES & SVG DECALS
  // ---------------------------------------------------------------------------

  // Primary Cyclopean Predator Eye Reticle (Overwatch Boss HUD style)
  const eyeReticleTex = svg(
    `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="opticGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="30%" stop-color="#00f0ff"/>
          <stop offset="70%" stop-color="#006b8f"/>
          <stop offset="100%" stop-color="#04121a"/>
        </radialGradient>
      </defs>
      <circle cx="128" cy="128" r="122" fill="#040c17" stroke="#ff3b20" stroke-width="8"/>
      <circle cx="128" cy="128" r="104" fill="url(#opticGlow)"/>
      <!-- Aperture Target Rings -->
      <circle cx="128" cy="128" r="56" fill="none" stroke="#00f0ff" stroke-width="5" stroke-dasharray="18 10"/>
      <polygon points="128,76 148,128 128,180 108,128" fill="#030810" stroke="#00f0ff" stroke-width="3"/>
      <circle cx="128" cy="128" r="14" fill="#ffffff"/>
      <!-- Cardinal Hazard Marks -->
      <rect x="124" y="10" width="8" height="28" fill="#ff3b20"/>
      <rect x="124" y="218" width="8" height="28" fill="#ff3b20"/>
      <rect x="10" y="124" width="28" height="8" fill="#ff3b20"/>
      <rect x="218" y="124" width="28" height="8" fill="#ff3b20"/>
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
      <path d="M128 12 L172 88 L144 88 L144 200 L128 226 L112 200 L112 88 L84 88 Z" fill="#ff3b20"/>
      <path d="M84 104 L44 148 L64 164 L96 122 Z" fill="#00f0ff"/>
      <path d="M172 104 L212 148 L192 164 L160 122 Z" fill="#00f0ff"/>
      <circle cx="128" cy="68" r="16" fill="#081326"/>
      <polygon points="128,136 140,158 116,158" fill="#ffffff"/>
    </svg>`,
    { size: 512 },
  );

  // Suction Cup Pad Texture (Concentric glowing valves)
  const suctionCupTex = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="60" fill="#247885" stroke="#0f343b" stroke-width="6"/>
      <circle cx="64" cy="64" r="46" fill="#42aab8"/>
      <circle cx="64" cy="64" r="28" fill="#06121a" stroke="#00f0ff" stroke-width="4"/>
      <circle cx="64" cy="64" r="15" fill="#00f0ff"/>
      <circle cx="64" cy="64" r="6" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  // Water Splash Spray Card Texture
  const splashTex = svg(
    `<svg viewBox="0 0 256 512" xmlns="http://www.w3.org/2000/svg">
      <path d="M128 500 C40 400 15 280 44 180 C66 110 108 60 128 8 C148 60 190 110 212 180 C241 280 216 400 128 500 Z" fill="#e6faff"/>
      <path d="M128 450 C72 370 54 280 76 200 C92 140 114 100 128 45 C142 100 164 140 180 200 C202 280 184 370 128 450 Z" fill="#ffffff"/>
      <path d="M128 360 C100 300 90 240 104 180 C114 140 122 110 128 75 C134 110 142 140 152 180 C166 240 156 300 128 360 Z" fill="#6fe3ed"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // SKELETON HIERARCHY
  // ---------------------------------------------------------------------------
  const root = b.joint("root", { at: [0, 0.4, 0], dir: [0, 1, 0] });
  const spine1 = b.joint("spine1", { parent: root, at: [0, 0.85, 0.05], dir: [0, 1, 0.1], role: "spine" });
  const spine2 = b.joint("spine2", { parent: spine1, at: [0, 1.35, 0.1], dir: [0, 1, 0.12], role: "spine" });
  const head = b.joint("head", { parent: spine2, at: [0, 1.8, 0.22], dir: [0, 0.95, 0.22], role: "head" });
  const mantleApex = b.joint("mantleApex", {
    parent: head,
    at: [0, 2.75, -0.2],
    dir: [0, 0.85, -0.4],
    role: "head",
  });
  const jawUpper = b.joint("jawUpper", {
    parent: head,
    at: [0, 1.55, 0.55],
    dir: [0, 0.1, 0.98],
    role: "jaw",
  });
  const jawLower = b.joint("jawLower", {
    parent: head,
    at: [0, 1.35, 0.52],
    dir: [0, -0.3, 0.95],
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
  const mastCrows = new THREE.Vector3(-1.25, 0.95, 0.88);
  const mastTip = new THREE.Vector3(-1.38, 1.35, 0.98);

  // Main broken mast
  b.sweep(catmull([mastRoot, mastCrows, mastTip]), [0.065, 0.035], {
    color: WOOD_MAST,
    group: "scenery",
    name: "galleon_mast",
  });

  // Crow's Nest Platform
  b.part(new THREE.CylinderGeometry(0.16, 0.12, 0.14, 10), WOOD_HULL, {
    at: mastCrows,
    aim: [0, 1, 0],
    group: "scenery",
    name: "crows_nest",
  });
  b.part(new THREE.TorusGeometry(0.165, 0.016, 6, 12), GOLD_BRASS, {
    at: mastCrows.clone().add(new THREE.Vector3(0, 0.07, 0)),
    aim: [0, 1, 0],
    group: "scenery",
    name: "crows_nest_brass_ring",
  });

  // Hanging Brass Lantern under Crow's Nest
  const lanternAt = mastCrows.clone().add(new THREE.Vector3(0.08, -0.15, 0.06));
  b.rod(mastCrows, lanternAt, 0.008, { color: GOLD_BRASS, group: "scenery", name: "lantern_chain" });
  b.part(new THREE.BoxGeometry(0.06, 0.09, 0.06), GOLD_BRASS, {
    at: lanternAt,
    group: "scenery",
    name: "lantern_frame",
  });
  glow(
    b.part(new THREE.BoxGeometry(0.046, 0.07, 0.046), "#ffcc44", {
      at: lanternAt,
      group: "scenery",
      name: "lantern_glow_core",
    }),
    2.2,
  );

  // Fractured Hull Ribs & Planking
  for (let rib = 0; rib < 4; rib++) {
    const ang = 2.1 + rib * 0.26;
    const rad = 1.05 + rib * 0.08;
    const baseP = new THREE.Vector3(Math.cos(ang) * rad, 0.06, Math.sin(ang) * rad);
    const topP = new THREE.Vector3(Math.cos(ang) * (rad + 0.18), 0.38 + (rib % 2) * 0.18, Math.sin(ang) * (rad + 0.18));
    b.frustumBox(baseP, topP, [0.09, 0.024], [0.065, 0.018], {
      color: rib % 2 === 0 ? WOOD_HULL : WOOD_MAST,
      group: "scenery",
      name: `hull_plank_${rib}`,
    });
  }

  // Floating Oak Rum Barrels in the Swirl
  const barrelPositions = [
    new THREE.Vector3(-0.62, 0.14, 1.15),
    new THREE.Vector3(-1.35, 0.12, 0.32),
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

  // Water Eruption Splashes (Low-poly stylized splash crowns)
  for (let sIdx = 0; sIdx < 10; sIdx++) {
    const a = (sIdx / 10) * Math.PI * 2 + 0.2;
    const r = 0.85 + 0.25 * Math.sin(sIdx * 3.5);
    const splashBase = new THREE.Vector3(Math.cos(a) * r, 0.12, Math.sin(a) * r);
    const splashPeak = new THREE.Vector3(Math.cos(a) * (r + 0.22), 0.52 + 0.18 * (sIdx % 3), Math.sin(a) * (r + 0.22));

    b.spike(splashBase, splashPeak, null, 0.07, {
      color: SEA_FOAM,
      group: "scenery",
      name: `water_splash_spike_${sIdx}`,
    });
  }

  // Vertical foam cards around eruption
  const splashCardPts: THREE.Vector3[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    splashCardPts.push(new THREE.Vector3(Math.cos(a) * 0.92, 0.15, Math.sin(a) * 0.92));
  }
  b.cards(
    splashCardPts.map((p) => frame(p, [0, 1, 0])),
    splashTex,
    {
      size: [0.26, 0.6],
      lean: 25,
      bend: 18,
      vary: 0.25,
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
    { at: [0, 0.45, 0], w: 0.86, h: 0.82 },
    { at: [0, 0.85, 0.04], w: 1.04, h: 0.96 },
    { at: [0, 1.35, 0.08], w: 1.12, h: 1.04 },
    { at: [0, 1.8, 0.15], w: 1.02, h: 1.08 },
    { at: [0, 2.3, 0.02], w: 0.78, h: 0.88 },
    { at: [0, 2.75, -0.2], w: 0.36, h: 0.42 },
    { at: [0, 2.96, -0.32], w: 0.08, h: 0.08 },
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
    b.rod([0, 1.95, -0.42], [0, 2.68, -0.48], 0.018, {
      color: CYAN_ENERGY,
      bone: mantleApex,
      group: "carapace",
      name: "mantle_dorsal_energy_line",
    }),
    2.2,
  );

  // Segmented Overlapping Carapace Armor Cowls (Crown Plates)
  for (let plate = 0; plate < 4; plate++) {
    const yH = 1.95 + plate * 0.28;
    const zPos = 0.05 - plate * 0.09;
    const s = 1.0 - plate * 0.16;

    // Outer Armor Shell
    b.part(
      new THREE.CylinderGeometry(0.54 * s, 0.6 * s, 0.26 * s, 8, 1, false, 0, Math.PI),
      armorPaint,
      {
        at: [0, yH, zPos],
        bone: head,
        dir: [0, 0.85, -0.35],
        scale: [1.08, 1, 1.22],
        group: "carapace",
        name: `crown_armor_shell_${plate}`,
      },
    );

    // Glowing Neon Cyan Power Conduit Seams
    glow(
      b.part(new THREE.TorusGeometry(0.56 * s, 0.016, 6, 16, Math.PI), CYAN_ENERGY, {
        at: [0, yH - 0.11 * s, zPos - 0.015],
        bone: head,
        dir: [0, 0.85, -0.35],
        group: "carapace",
        name: `carapace_energy_seam_${plate}`,
      }),
      2.0,
    );

    // Hazard Coral Chevrons on Armor Plates
    b.part(new THREE.BoxGeometry(0.08 * s, 0.14 * s, 0.03), HAZARD_CORAL, {
      at: [0, yH + 0.02 * s, zPos + 0.48 * s],
      aim: [0, 0.35, 0.95],
      bone: head,
      group: "carapace",
      name: `carapace_hazard_mark_${plate}`,
    });
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

  // Prominent Heavy Overwatch Brow Shield (Anchored well forward at z = 0.72)
  const browCenter = new THREE.Vector3(0, 1.88, 0.72);
  b.part(new THREE.BoxGeometry(0.72, 0.16, 0.28), CHITIN_NAVY, {
    at: browCenter,
    rotation: [-18, 0, 0],
    bone: head,
    group: "head",
    name: "heavy_brow_shield",
  });

  // Coral Hazard Edge Stripe across Brow
  b.part(new THREE.BoxGeometry(0.68, 0.035, 0.04), HAZARD_CORAL, {
    at: browCenter.clone().add(new THREE.Vector3(0, 0.075, 0.12)),
    rotation: [-18, 0, 0],
    bone: head,
    group: "head",
    name: "brow_hazard_trim",
  });

  // Central Cyclopean Boss Optic (Large, fully exposed, hero centerpiece)
  const eyeCenter = new THREE.Vector3(0, 1.74, 0.76);
  b.part(new THREE.CylinderGeometry(0.22, 0.26, 0.09, 16), CHITIN_NAVY, {
    at: eyeCenter,
    dir: [0, 0.12, 0.98],
    bone: head,
    group: "head",
    name: "cyclopean_eye_housing",
  });

  // Glowing Primary Boss Optic Reticle
  glow(
    b.part(new THREE.CircleGeometry(0.2, 24), "#ffffff", {
      at: eyeCenter.clone().add(new THREE.Vector3(0, 0.012, 0.048)),
      dir: [0, 0.12, 0.98],
      axis: "z",
      bone: head,
      texture: eyeReticleTex,
      group: "head",
      name: "cyclopean_eye_reticle",
    }),
    2.5,
  );

  // Stacked Lateral Sensor Eyes (2 on each flank, visible from sides and front)
  for (const s of [1, -1]) {
    // Upper flank eye
    const latTopPt = new THREE.Vector3(s * 0.38, 1.82, 0.62);
    const latTopDir = new THREE.Vector3(s * 0.72, 0.15, 0.65).normalize();
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
    const latBotPt = new THREE.Vector3(s * 0.44, 1.68, 0.54);
    const latBotDir = new THREE.Vector3(s * 0.82, -0.05, 0.55).normalize();
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
      new THREE.Vector3(s * 0.32, 1.55, 0.45),
      new THREE.Vector3(s * 0.52, 1.68, 0.62),
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

  // MASSIVE HOOKED CALAMARI BEAK (Fully articulated on jawUpper & jawLower)
  // Upper Beak: Powerful hooked black obsidian rostrum
  const upBeakRoot = new THREE.Vector3(0, 1.62, 0.62);
  const upBeakArch = new THREE.Vector3(0, 1.58, 0.88);
  const upBeakTip = new THREE.Vector3(0, 1.32, 0.98);
  b.sweep(bezier(upBeakRoot, upBeakArch, upBeakTip), [0.15, 0.025], {
    bone: jawUpper,
    color: INK_BLACK,
    group: "mouth",
    name: "upper_beak_rostrum",
  });
  // Upper Beak Armor Shroud
  b.part(new THREE.ConeGeometry(0.14, 0.3, 6), CHITIN_NAVY, {
    at: [0, 1.58, 0.78],
    aim: [0, -0.65, 0.75],
    bone: jawUpper,
    group: "mouth",
    name: "upper_beak_armor_cowl",
  });

  // Lower Beak: Open pincer mandible
  const lowBeakRoot = new THREE.Vector3(0, 1.28, 0.58);
  const lowBeakTip = new THREE.Vector3(0, 1.42, 0.92);
  b.sweep(bezier(lowBeakRoot, mid(lowBeakRoot, lowBeakTip), lowBeakTip), [0.16, 0.03], {
    bone: jawLower,
    color: INK_BLACK,
    group: "mouth",
    name: "lower_beak_mandible",
  });

  // Lateral Serrated Pincer Mandibles
  for (const s of [1, -1]) {
    const mandBase = new THREE.Vector3(s * 0.18, 1.34, 0.62);
    const mandCurve = new THREE.Vector3(s * 0.32, 1.42, 0.82);
    const mandTip = new THREE.Vector3(s * 0.08, 1.44, 0.96);
    b.sweep(catmull([mandBase, mandCurve, mandTip]), (t) => 0.065 * (1 - t * 0.7), {
      bone: jawLower,
      color: HAZARD_CORAL,
      group: "mouth",
      name: `side_pincer_${s > 0 ? "L" : "R"}`,
    });
  }

  // Inner Bioluminescent Plasma Throat (Emits menacing cyan maw glow)
  glow(
    b.part(new THREE.SphereGeometry(0.15, 12, 8), CYAN_ENERGY, {
      at: [0, 1.45, 0.66],
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
      scutes: 10,
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
      scutes: 10,
    },
    // 3. WIDE LATERAL CURLER LEFT (SL): Sweeps wide over the water, curling inward
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
      scutes: 9,
    },
    // 4. GALLEON CRUSHER RIGHT (SR): Wraps around the broken mast & wreckage!
    {
      name: "tentacleSR",
      parent: spine1,
      path: [
        new THREE.Vector3(-0.45, 0.92, 0.05),
        new THREE.Vector3(-0.82, 1.05, 0.42),
        new THREE.Vector3(-1.12, 1.15, 0.78),
        new THREE.Vector3(-1.28, 0.82, 0.95), // coiled around mast
        new THREE.Vector3(-1.15, 0.42, 0.65),
        new THREE.Vector3(-0.85, 0.16, 0.45),
      ],
      baseR: 0.165,
      tipR: 0.025,
      suctions: 16,
      scutes: 9,
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
      scutes: 8,
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
      scutes: 8,
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
      scutes: 8,
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
      scutes: 8,
    },
  ];

  // Origin point of body center for radial alignment
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

      // Radial vector pointing away from body center
      const radial = pt.clone().sub(bodyCenter);
      // Dorsal faces away from body; Ventral faces toward inner curl / body
      const dorsal = radial.clone().addScaledVector(tan, -radial.dot(tan)).normalize();
      const ventral = dorsal.clone().negate();
      const side = new THREE.Vector3().crossVectors(tan, dorsal).normalize();

      // Staggered dual suction pads
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

    // Sculpted Angular Dorsal Armor Scutes (Overwatch Carapace Ridge)
    for (let p = 1; p < cfg.scutes; p++) {
      const t = (p - 0.25) / cfg.scutes;
      if (t > 0.88) continue;
      const pt = curve.at(t);
      const tan = curve.tangentAt(t);
      const rad = cfg.baseR * (1 - t * 0.82) + cfg.tipR;

      const radial = pt.clone().sub(bodyCenter);
      const dorsal = radial.clone().addScaledVector(tan, -radial.dot(tan)).normalize();

      const scutePos = pt.clone().addScaledVector(dorsal, rad * 0.94);
      const scuteLen = (cfg.baseR * 0.85 + 0.05) * (1 - t * 0.45);
      const scuteW = 0.045 * (1 - t * 0.4);

      // Angled shark-fin chitin thorn
      const thornAim = dorsal.clone().addScaledVector(tan, -0.42).normalize();
      b.spike(scutePos, thornAim, scuteLen, scuteW, {
        bone: tentChain.jointAt(t),
        color: p % 2 === 0 ? CHITIN_NAVY : HAZARD_CORAL,
        group: "tentacles",
        name: `${cfg.name}_armor_scute_${p}`,
      });

      // Embedded Glowing Cyan Node on Alternate Armor Scutes
      if (p % 2 === 1) {
        glow(
          b.part(new THREE.SphereGeometry(scuteW * 0.95, 6, 4), CYAN_ENERGY, {
            at: scutePos.clone().addScaledVector(dorsal, 0.02),
            bone: tentChain.jointAt(t),
            group: "tentacles",
            name: `${cfg.name}_scute_glow_${p}`,
          }),
          2.2,
        );
      }
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
    const rW = 0.74 + 0.09 * Math.sin(c * 5);
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
```