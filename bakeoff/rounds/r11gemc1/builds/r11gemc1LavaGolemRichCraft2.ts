import * as THREE from "three";
import {
  createBuilder,
  frame,
  aim,
  lerp,
  offset,
  rng,
  catmull,
  paint,
  noise,
  mix,
  smoothstep,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Genshin Lava Golem",
  description:
    "A colossal Genshin Impact-styled Pyro elemental lava golem forged from chiseled basalt plates, radiant molten seams, ancient Natlan bronze filigree, and an incandescent crucible heart.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "genshin_lava_golem", paintSize: 2048 });
  const random = rng(888);

  // ---------------------------------------------------------------------------
  // COLOR PALETTE (Vibrant Genshin Pyro / Volcanic Natlan)
  // ---------------------------------------------------------------------------
  const BASALT_DARK = "#151219"; // Deepest obsidian shadows & crevasses
  const BASALT_MID = "#2c2634"; // Primary chiseled volcanic plate
  const BASALT_LIGHT = "#453d52"; // Chiseled highlights on bevels
  const STONE_WARM = "#4d3d34"; // Scorched rock crust
  const BRONZE_DARK = "#663e12"; // Deep antique bronze shadow
  const BRONZE_MID = "#b87c24"; // Saturated Natlan forge gold-bronze
  const BRONZE_LIGHT = "#f5c358"; // Polished elemental filigree & clips
  const LAVA_DEEP = "#c41800"; // Deep burning crimson magma
  const LAVA_HOT = "#ff5d00"; // Blazing Pyro orange
  const LAVA_BRIGHT = "#ffb700"; // Thermal yellow river
  const LAVA_CORE = "#fffde0"; // Incandescent white-gold core
  const OBSIDIAN_GLASS = "#100d14"; // Razor-sharp volcanic glass

  // ---------------------------------------------------------------------------
  // TEXTURES (Genshin elemental motifs & runic craft)
  // ---------------------------------------------------------------------------

  // 1. Natlan Pyro Medallion (Chest Gorget & Belt Buckle)
  const PYRO_EMBLEM_TEX = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="flameGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fffde0"/>
          <stop offset="30%" stop-color="#ffb700"/>
          <stop offset="70%" stop-color="#ff4400"/>
          <stop offset="100%" stop-color="#7a0d00"/>
        </radialGradient>
      </defs>
      <polygon points="64,4 124,64 64,124 4,64" fill="#18141f" stroke="#f5c358" stroke-width="6"/>
      <polygon points="64,16 112,64 64,112 16,64" fill="none" stroke="#995818" stroke-width="3"/>
      <path d="M64 24 C78 46 102 56 102 80 C102 98 84 108 64 108 C44 108 26 98 26 80 C26 56 50 46 64 24 Z" fill="url(#flameGrad)"/>
      <path d="M64 44 C72 56 86 66 86 82 C86 92 76 98 64 98 C52 98 42 92 42 82 C42 66 56 56 64 44 Z" fill="#fff9b8"/>
      <polygon points="64,60 74,74 64,88 54,74" fill="#ff1800"/>
      <polygon points="64,66 69,74 64,82 59,74" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  // 2. Cyclopean Optical Eye Core (Genshin Ruin Machina Eye)
  const GOLEM_EYE_TEX = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="opticG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="25%" stop-color="#fff599"/>
          <stop offset="60%" stop-color="#ff6600"/>
          <stop offset="100%" stop-color="#991100"/>
        </radialGradient>
      </defs>
      <rect width="128" height="128" fill="#141118"/>
      <circle cx="64" cy="64" r="58" fill="none" stroke="#f5c358" stroke-width="5"/>
      <circle cx="64" cy="64" r="48" fill="none" stroke="#ff8800" stroke-width="3" stroke-dasharray="10 6"/>
      <circle cx="64" cy="64" r="40" fill="url(#opticG)"/>
      <polygon points="64,24 72,56 104,64 72,72 64,104 56,72 24,64 56,56" fill="#ffffff"/>
      <circle cx="64" cy="64" r="7" fill="#ff1a00"/>
    </svg>`,
    { size: 256 },
  );

  // 3. Ancient Natlan Border Trim (Armor Plate Filigree)
  const RUNIC_TRIM_TEX = svg(
    `<svg viewBox="0 0 256 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="64" fill="#1c1824"/>
      <line x1="0" y1="4" x2="256" y2="4" stroke="#f5c358" stroke-width="4"/>
      <line x1="0" y1="60" x2="256" y2="60" stroke="#f5c358" stroke-width="4"/>
      <g fill="none" stroke="#fcd877" stroke-width="3.5" stroke-linecap="square">
        <path d="M16 20 L30 12 L44 20 L44 44 L30 52 L16 44 Z M30 20 L30 44"/>
        <polygon points="60,32 72,16 84,32 72,48"/>
        <path d="M100 16 L118 16 L126 28 L118 40 L100 40 M108 28 L134 28"/>
        <path d="M150 20 L164 12 L178 20 L178 44 L164 52 L150 44 Z M164 20 L164 44"/>
        <polygon points="194,32 206,16 218,32 206,48"/>
        <path d="M234 16 L252 16"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  // 4. Stylized Floating Ember Quad
  const EMBER_TEX = svg(
    `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sparkG" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#ff2200"/>
          <stop offset="40%" stop-color="#ff8800"/>
          <stop offset="85%" stop-color="#ffea66"/>
          <stop offset="100%" stop-color="#ffffff"/>
        </linearGradient>
      </defs>
      <polygon points="16,2 26,18 30,32 16,46 2,32 6,18" fill="url(#sparkG)"/>
      <polygon points="16,10 22,22 24,30 16,38 8,30 10,22" fill="#ffffff" opacity="0.9"/>
    </svg>`,
    { size: 64 },
  );

  // ---------------------------------------------------------------------------
  // PROCEDURAL PAINTS
  // ---------------------------------------------------------------------------
  const basaltPaint = paint((p, n) => {
    const v = noise(p, 0.22, 55);
    const fine = noise(p, 0.06, 120);
    const up = smoothstep(0.1, 0.85, n.y);
    const stone = mix(BASALT_MID, BASALT_DARK, smoothstep(0.3, 0.7, v));
    const dusty = mix(stone, STONE_WARM, fine * 0.28);
    return mix(dusty, BASALT_LIGHT, up * 0.42);
  });

  const bronzePaint = paint((p, n) => {
    const v = noise(p, 0.12, 101);
    const highlight = smoothstep(0.25, 0.9, n.y);
    const baseMetal = mix(BRONZE_DARK, BRONZE_MID, smoothstep(0.2, 0.65, v));
    return mix(baseMetal, BRONZE_LIGHT, highlight * 0.5);
  });

  // ---------------------------------------------------------------------------
  // SKELETON (Rigid power stance with forward-cocked arms and wide braced legs)
  // ---------------------------------------------------------------------------
  // Root Pelvis (slightly lowered for a braced, heavy center of gravity)
  const hips = b.joint("hips", { at: [0, 1.16, -0.04] });

  // Spine & Forward-Thrust Hunched Chest
  const spine1 = b.joint("spine1", { parent: hips, at: [0, 1.38, 0.0], role: "spine" });
  const chest = b.joint("chest", { parent: spine1, at: [0, 1.66, 0.08], role: "spine" });

  // Neck, Head & Low Jaw
  const neck = b.joint("neck", { parent: chest, at: [0, 1.94, 0.22], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 2.08, 0.36], dir: [0, -0.08, 0.98], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.94, 0.42], dir: [0, -0.22, 0.9], role: "jaw" });

  // Limbs
  const armJoints: Record<string, { clavicle: any; shoulder: any; elbow: any; wrist: any; hand: any }> = {};
  const legJoints: Record<string, { hip: any; knee: any; ankle: any; foot: any; toe: any }> = {};

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Arm chain: Wide heavy shoulders, elbows bent forward/out, fists ready to crush
    const clavicle = b.joint(`clavicle${side}`, {
      parent: chest,
      at: [s * 0.28, 1.82, 0.06],
      role: "arm",
    });
    const shoulder = b.joint(`shoulder${side}`, {
      parent: clavicle,
      at: [s * 0.58, 1.76, 0.02],
      role: "arm",
    });
    const elbow = b.joint(`elbow${side}`, {
      parent: shoulder,
      at: [s * 0.82, 1.36, 0.08],
      role: "arm",
    });
    const wrist = b.joint(`wrist${side}`, {
      parent: elbow,
      at: [s * 0.92, 0.94, 0.26],
      role: "arm",
    });
    const hand = b.joint(`hand${side}`, {
      parent: wrist,
      at: [s * 0.98, 0.68, 0.38],
      role: "arm",
    });

    // Digits
    b.joint(`thumb${side}`, { parent: hand, at: [s * 1.06, 0.62, 0.48], role: "digit" });
    b.joint(`index${side}`, { parent: hand, at: [s * 1.0, 0.48, 0.46], role: "digit" });
    b.joint(`pinky${side}`, { parent: hand, at: [s * 0.88, 0.5, 0.38], role: "digit" });

    armJoints[side] = { clavicle, shoulder, elbow, wrist, hand };

    // Leg chain: Wide stable stance (x = ±0.4), knee bent forward, foot planted at y=0.08
    const hip = b.joint(`hip${side}`, {
      parent: hips,
      at: [s * 0.34, 1.08, -0.06],
      role: "leg",
    });
    const knee = b.joint(`knee${side}`, {
      parent: hip,
      at: [s * 0.38, 0.66, 0.1],
      role: "leg",
    });
    const ankle = b.joint(`ankle${side}`, {
      parent: knee,
      at: [s * 0.4, 0.24, -0.04],
      role: "leg",
    });
    const foot = b.joint(`foot${side}`, {
      parent: ankle,
      at: [s * 0.42, 0.08, 0.12],
      role: "leg",
    });
    const toe = b.joint(`toe${side}`, {
      parent: foot,
      at: [s * 0.42, 0.04, 0.34],
      role: "digit",
    });

    legJoints[side] = { hip, knee, ankle, foot, toe };
  }

  // ---------------------------------------------------------------------------
  // 1. TORSO: SOLID INTERLOCKING BASALT & RECESSED PYRO CRUCIBLE CORE
  // ---------------------------------------------------------------------------

  // Massive interlocking abdominal blocks bridging hips and chest (no skinny gaps)
  b.frustumBox([0, 1.2, -0.06], [0, 1.48, 0.0], [0.52, 0.32], [0.62, 0.38], {
    bone: spine1,
    color: basaltPaint,
  });
  // Abdominal glowing horizontal thermal vents
  for (let a = 0; a < 2; a++) {
    const yA = 1.26 + a * 0.12;
    glow(
      b.part(new THREE.BoxGeometry(0.32, 0.024, 0.04), LAVA_HOT, {
        bone: spine1,
        at: [0, yA, 0.18],
      }),
      2.2,
    );
  }

  // Deep furnace backing cavity
  b.part(new THREE.CylinderGeometry(0.32, 0.32, 0.44, 10, 1, false, -Math.PI / 2, Math.PI), basaltPaint, {
    bone: chest,
    at: [0, 1.66, 0.02],
    dir: [0, 0, -1],
  });

  // THE RECESSED PYRO CRUCIBLE CORE (Deep inside chest cavity)
  const corePos: [number, number, number] = [0, 1.66, 0.1];
  // 1. Incandescent white-hot nucleus
  glow(
    b.part(new THREE.IcosahedronGeometry(0.13, 1), LAVA_CORE, {
      bone: chest,
      at: corePos,
    }),
    2.8,
  );
  // 2. Faceted radiant corona
  glow(
    b.part(new THREE.DodecahedronGeometry(0.165, 0), LAVA_BRIGHT, {
      bone: chest,
      at: corePos,
    }),
    2.2,
  );
  // 3. Molten plasma torus ring
  glow(
    b.part(new THREE.TorusGeometry(0.2, 0.022, 8, 20), LAVA_HOT, {
      bone: chest,
      at: corePos,
      dir: [0, 0, 1],
    }),
    2.4,
  );

  // 4 Ancient Bronze Containment Claws framing the Core
  for (let c = 0; c < 4; c++) {
    const angle = (c * Math.PI) / 2 + Math.PI / 4;
    const clawBase: [number, number, number] = [
      Math.cos(angle) * 0.28,
      1.66 + Math.sin(angle) * 0.28,
      0.04,
    ];
    const clawTip: [number, number, number] = [
      Math.cos(angle) * 0.18,
      1.66 + Math.sin(angle) * 0.18,
      0.18,
    ];
    b.sweep(catmull([clawBase, [Math.cos(angle) * 0.24, 1.66 + Math.sin(angle) * 0.24, 0.14], clawTip]), [0.04, 0.015], {
      bone: chest,
      color: bronzePaint,
    });
    glow(
      b.part(new THREE.SphereGeometry(0.018, 8, 8), LAVA_CORE, {
        bone: chest,
        at: clawTip,
      }),
      2.6,
    );
  }

  // Heavy Chiseled Pectoral Basalt Slabs (Flanking the core with deep recessed gaps)
  for (const s of [1, -1]) {
    // Main pectoral armor block
    b.frustumBox(
      [s * 0.2, 1.54, 0.12],
      [s * 0.44, 1.82, 0.08],
      [0.32, 0.22],
      [0.26, 0.18],
      { bone: chest, color: basaltPaint },
    );
    // Sub-collar plate
    b.part(new THREE.BoxGeometry(0.26, 0.12, 0.2), basaltPaint, {
      bone: chest,
      at: [s * 0.32, 1.9, 0.08],
      rotation: [0, s * -15, s * 12],
    });

    // Sunken 3D Molten Fissure Channels embedded directly into pectoral armor (No floating plane decals!)
    const pecFissure = catmull([
      [s * 0.18, 1.58, 0.23],
      [s * 0.28, 1.68, 0.24],
      [s * 0.38, 1.76, 0.2],
    ]);
    glow(
      b.sweep(pecFissure, 0.018, {
        bone: chest,
        color: LAVA_HOT,
      }),
      2.2,
    );
    glow(
      b.sweep(pecFissure, 0.007, {
        bone: chest,
        color: LAVA_CORE,
      }),
      2.8,
    );

    // Bronze structural corner rivets
    b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.025, 8), bronzePaint, {
      bone: chest,
      at: [s * 0.42, 1.82, 0.18],
      dir: [0, 0, 1],
    });
    b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.025, 8), bronzePaint, {
      bone: chest,
      at: [s * 0.18, 1.48, 0.2],
      dir: [0, 0, 1],
    });
  }

  // Upper Gorget & Natlan Pyro Medallion (Center-locked above core)
  b.part(new THREE.BoxGeometry(0.22, 0.12, 0.14), bronzePaint, {
    bone: chest,
    at: [0, 1.88, 0.16],
  });
  glow(
    b.part(new THREE.PlaneGeometry(0.15, 0.15), "#ffffff", {
      bone: chest,
      at: [0, 1.88, 0.235],
      dir: [0, 0, 1],
      axis: "z",
      texture: PYRO_EMBLEM_TEX,
    }),
    1.8,
  );

  // ---------------------------------------------------------------------------
  // 2. BACK CARAPACE & TWIN VOLCANIC CHIMNEYS
  // ---------------------------------------------------------------------------

  // Staggered heavy dorsal armor plates
  for (let i = 0; i < 3; i++) {
    const yP = 1.78 - i * 0.18;
    b.frustumBox([0, yP, -0.16], [0, yP - 0.08, -0.22], [0.54 - i * 0.06, 0.14], [0.46 - i * 0.06, 0.12], {
      bone: chest,
      color: basaltPaint,
    });
    // Embedded molten seam between dorsal plates
    glow(
      b.part(new THREE.BoxGeometry(0.4 - i * 0.06, 0.026, 0.05), LAVA_HOT, {
        bone: chest,
        at: [0, yP - 0.05, -0.22],
      }),
      2.2,
    );
    // Sharp dorsal obsidian spine fin
    b.spike([0, yP, -0.24], [0, 0.35, -0.92], 0.18 - i * 0.02, 0.04, {
      bone: chest,
      color: OBSIDIAN_GLASS,
    });
  }

  // Twin Volcanic Vent Chimneys on Upper Back
  for (const s of [1, -1]) {
    const chimneyBase: [number, number, number] = [s * 0.28, 1.94, -0.16];
    const chimneyDir: [number, number, number] = [s * 0.18, 0.82, -0.38];
    // Main conical vent body
    b.sweep(
      catmull([
        chimneyBase,
        offset(chimneyBase, chimneyDir, 0.14),
        offset(chimneyBase, chimneyDir, 0.28),
      ]),
      [0.09, 0.07],
      { bone: chest, color: basaltPaint },
    );
    // Bronze support collar band
    b.sweep(
      catmull([
        offset(chimneyBase, chimneyDir, 0.1),
        offset(chimneyBase, chimneyDir, 0.18),
      ]),
      0.095,
      { bone: chest, color: bronzePaint },
    );
    // Incandescent molten pool inside chimney mouth
    const mouthPt = offset(chimneyBase, chimneyDir, 0.29);
    glow(
      b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.025, 10), LAVA_CORE, {
        bone: chest,
        at: mouthPt,
        dir: chimneyDir,
      }),
      2.6,
    );
    // Rising ember sparks from chimney
    glow(
      b.part(new THREE.PlaneGeometry(0.14, 0.22), "#ffffff", {
        bone: chest,
        at: offset(mouthPt, chimneyDir, 0.12),
        dir: chimneyDir,
        axis: "z",
        texture: EMBER_TEX,
      }),
      2.2,
    );
  }

  // ---------------------------------------------------------------------------
  // 3. HEAD, CYCLOPEAN VISOR, ROARING JAW & GREAT BASALT HORNS
  // ---------------------------------------------------------------------------

  // Thick armored neck with molten conduit channels
  b.sweep(catmull([[0, 1.84, 0.12], [0, 1.98, 0.24]]), [0.17, 0.15], {
    bone: neck,
    color: basaltPaint,
  });
  for (const s of [1, -1]) {
    glow(
      b.sweep(
        catmull([
          [s * 0.12, 1.82, 0.22],
          [s * 0.1, 1.94, 0.28],
          [s * 0.08, 2.04, 0.34],
        ]),
        0.025,
        { bone: neck, color: LAVA_HOT },
      ),
      2.2,
    );
  }

  // Main Cranium Armor Shell
  b.frustumBox([0, 2.0, 0.22], [0, 2.24, 0.38], [0.38, 0.28], [0.32, 0.24], {
    bone: head,
    color: basaltPaint,
  });
  // Beveled temple & cheek plates
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.14, 0.2, 0.24), basaltPaint, {
      bone: head,
      at: [s * 0.2, 2.08, 0.34],
      rotation: [0, s * -20, 0],
    });
  }

  // Forehead Obsidian Crown & Center Spike
  b.spike([0, 2.24, 0.38], [0, 0.45, 0.88], 0.18, 0.05, {
    bone: head,
    color: OBSIDIAN_GLASS,
  });
  // Bronze forehead brow visor
  b.part(new THREE.BoxGeometry(0.28, 0.07, 0.12), bronzePaint, {
    bone: head,
    at: [0, 2.18, 0.44],
  });

  // CYCLOPEAN GOLEM OPTICAL CORE (Deeply recessed socket)
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.035, 12), bronzePaint, {
    bone: head,
    at: [0, 2.1, 0.46],
    dir: [0, 0, 1],
  });
  glow(
    b.part(new THREE.CircleGeometry(0.082, 16), "#ffffff", {
      bone: head,
      at: [0, 2.1, 0.48],
      dir: [0, 0, 1],
      axis: "z",
      texture: GOLEM_EYE_TEX,
    }),
    2.5,
  );
  // Auxiliary molten eye slits
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.BoxGeometry(0.06, 0.014, 0.02), LAVA_BRIGHT, {
        bone: head,
        at: [s * 0.1, 2.16, 0.45],
        rotation: [0, 0, s * 25],
      }),
      2.4,
    );
  }

  // Movable Lower Jaw & Roaring Maw
  b.frustumBox([0, 1.94, 0.3], [0, 1.9, 0.48], [0.3, 0.14], [0.24, 0.1], {
    bone: jaw,
    color: basaltPaint,
  });
  // Burning throat furnace pool
  glow(
    b.part(new THREE.BoxGeometry(0.2, 0.024, 0.16), LAVA_HOT, {
      bone: jaw,
      at: [0, 1.98, 0.38],
    }),
    2.4,
  );
  // Lower Rocky Fangs
  for (const s of [1, -1]) {
    b.spike([s * 0.07, 1.98, 0.45], [0, 1, 0], 0.05, 0.016, {
      bone: jaw,
      color: BASALT_LIGHT,
    });
    b.spike([s * 0.03, 1.98, 0.46], [0, 1, 0], 0.055, 0.017, {
      bone: jaw,
      color: BASALT_LIGHT,
    });
    // Upper Rocky Fangs
    b.spike([s * 0.08, 2.04, 0.43], [0, -1, 0], 0.05, 0.016, {
      bone: head,
      color: BASALT_LIGHT,
    });
  }

  // GREAT BASALT HORNS (Sweeping curved volcanic horns)
  for (const s of [1, -1]) {
    const hornStart: [number, number, number] = [s * 0.18, 2.16, 0.28];
    const hornMid1: [number, number, number] = [s * 0.42, 2.34, 0.14];
    const hornMid2: [number, number, number] = [s * 0.58, 2.52, -0.06];
    const hornTip: [number, number, number] = [s * 0.5, 2.72, -0.02];

    const hornPath = catmull([hornStart, hornMid1, hornMid2, hornTip]);
    // Main horn basalt sweep
    b.sweep(hornPath, (t: number) => 0.09 * (1 - 0.82 * t) + 0.01, {
      bone: head,
      color: basaltPaint,
    });

    // Bronze collar bands along horns
    b.sweep(catmull([hornPath.at(0.22), hornPath.at(0.3)]), 0.082, {
      bone: head,
      color: bronzePaint,
    });
    b.sweep(catmull([hornPath.at(0.54), hornPath.at(0.62)]), 0.054, {
      bone: head,
      color: bronzePaint,
    });

    // Glowing molten magma crest line on horn
    glow(
      b.sweep(catmull([hornPath.at(0.38), hornPath.at(0.48)]), 0.068, {
        bone: head,
        color: LAVA_HOT,
      }),
      2.2,
    );
    glow(
      b.sweep(catmull([hornPath.at(0.78), hornPath.at(1.0)]), [0.034, 0.008], {
        bone: head,
        color: LAVA_CORE,
      }),
      2.6,
    );

    // Brow horn spikes jutting forward
    b.spike([s * 0.14, 2.22, 0.44], [s * 0.38, 0.45, 0.8], 0.12, 0.03, {
      bone: head,
      color: OBSIDIAN_GLASS,
    });
  }

  // ---------------------------------------------------------------------------
  // 4. PAULDRONS & ARMS (TITANIC CRUSHING GAUNTLETS)
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const { clavicle, shoulder, elbow, wrist, hand } = armJoints[side];

    // Clavicle Strut connecting chest to shoulder
    b.sweep(
      catmull([
        [s * 0.28, 1.82, 0.06],
        [s * 0.54, 1.76, 0.02],
      ]),
      0.1,
      { bone: clavicle, color: bronzePaint },
    );

    // GIANT TIERED BASALT PAULDRON
    b.frustumBox(
      [s * 0.46, 1.86, 0.04],
      [s * 0.78, 1.78, 0.0],
      [0.36, 0.3],
      [0.44, 0.36],
      { bone: shoulder, color: basaltPaint },
    );
    // Beveled upper crest
    b.part(new THREE.BoxGeometry(0.34, 0.09, 0.32), basaltPaint, {
      bone: shoulder,
      at: [s * 0.64, 1.94, 0.02],
      rotation: [0, 0, s * -15],
    });
    // Embedded 3D molten fissure on pauldron front face (No floating plane decals!)
    const pauldronFissure = catmull([
      [s * 0.52, 1.74, 0.18],
      [s * 0.64, 1.84, 0.19],
      [s * 0.76, 1.92, 0.17],
    ]);
    glow(
      b.sweep(pauldronFissure, 0.018, {
        bone: shoulder,
        color: LAVA_HOT,
      }),
      2.2,
    );
    glow(
      b.sweep(pauldronFissure, 0.007, {
        bone: shoulder,
        color: LAVA_CORE,
      }),
      2.8,
    );

    // Runic Natlan trim plate on pauldron rim
    b.part(new THREE.PlaneGeometry(0.32, 0.08), "#ffffff", {
      bone: shoulder,
      at: [s * 0.64, 2.0, 0.16],
      dir: [0, 0.25, 0.96],
      axis: "z",
      texture: RUNIC_TRIM_TEX,
    });
    // Obsidian spires on pauldron crest
    b.spike([s * 0.68, 1.98, -0.04], [s * 0.22, 0.9, -0.1], 0.24, 0.045, {
      bone: shoulder,
      color: OBSIDIAN_GLASS,
    });
    b.spike([s * 0.76, 1.92, 0.06], [s * 0.32, 0.86, 0.1], 0.18, 0.036, {
      bone: shoulder,
      color: OBSIDIAN_GLASS,
    });

    // Upper Arm (Bicep/Tricep)
    b.sweep(
      catmull([
        [s * 0.58, 1.74, 0.02],
        [s * 0.8, 1.38, 0.06],
      ]),
      [0.16, 0.14],
      { bone: shoulder, color: basaltPaint },
    );
    // Molten hydraulic conduit running down bicep
    glow(
      b.sweep(
        catmull([
          [s * 0.62, 1.7, 0.15],
          [s * 0.76, 1.44, 0.18],
        ]),
        0.025,
        { bone: shoulder, color: LAVA_HOT },
      ),
      2.2,
    );
    // Bronze bicep reinforcement cuff
    b.part(new THREE.CylinderGeometry(0.165, 0.165, 0.09, 12), bronzePaint, {
      bone: shoulder,
      at: [s * 0.69, 1.56, 0.04],
      dir: [s * 0.22, -0.36, 0.04],
    });

    // Elbow Joint (Spherical stone hub + glowing thermal torus)
    b.part(new THREE.SphereGeometry(0.14, 12, 10), basaltPaint, {
      bone: elbow,
      at: [s * 0.82, 1.36, 0.08],
    });
    glow(
      b.part(new THREE.TorusGeometry(0.148, 0.022, 8, 16), LAVA_HOT, {
        bone: elbow,
        at: [s * 0.82, 1.36, 0.08],
        dir: [s * 0.22, -0.36, 0.04],
      }),
      2.4,
    );
    // Rear elbow defense spike
    b.spike([s * 0.86, 1.36, -0.04], [s * 0.2, -0.2, -0.92], 0.16, 0.04, {
      bone: elbow,
      color: OBSIDIAN_GLASS,
    });

    // Forearm / Crusher Gauntlet
    b.frustumBox(
      [s * 0.84, 1.32, 0.1],
      [s * 0.94, 0.96, 0.24],
      [0.28, 0.26],
      [0.36, 0.32],
      { bone: elbow, color: basaltPaint },
    );
    // Heavy outer shield plate on gauntlet
    b.part(new THREE.BoxGeometry(0.11, 0.34, 0.26), basaltPaint, {
      bone: elbow,
      at: [s * 0.98, 1.14, 0.18],
      rotation: [0, 0, s * -15],
    });
    // Runic bronze trim on gauntlet ridge
    b.part(new THREE.PlaneGeometry(0.09, 0.3), "#ffffff", {
      bone: elbow,
      at: [s * 1.04, 1.14, 0.19],
      dir: [s * 1, 0, 0],
      axis: "z",
      texture: RUNIC_TRIM_TEX,
    });
    // Embedded central molten heat channel down forearm
    glow(
      b.part(new THREE.BoxGeometry(0.045, 0.3, 0.045), LAVA_HOT, {
        bone: elbow,
        at: [s * 0.88, 1.14, 0.32],
      }),
      2.2,
    );

    // Wrist Octagonal Cuff
    b.part(new THREE.CylinderGeometry(0.185, 0.195, 0.1, 8), bronzePaint, {
      bone: wrist,
      at: [s * 0.94, 0.94, 0.26],
      dir: [s * 0.12, -0.4, 0.18],
    });
    glow(
      b.part(new THREE.TorusGeometry(0.19, 0.018, 8, 16), LAVA_BRIGHT, {
        bone: wrist,
        at: [s * 0.94, 0.94, 0.26],
        dir: [s * 0.12, -0.4, 0.18],
      }),
      2.4,
    );

    // FIST & PALM
    b.frustumBox(
      [s * 0.94, 0.88, 0.3],
      [s * 1.02, 0.66, 0.42],
      [0.28, 0.22],
      [0.26, 0.2],
      { bone: hand, color: basaltPaint },
    );
    // Recessed circular magma furnace port on inner palm
    glow(
      b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.025, 12), LAVA_CORE, {
        bone: hand,
        at: [s * 0.96, 0.74, 0.44],
        dir: [s * -0.2, -0.3, 0.9],
      }),
      2.6,
    );

    // 3 Massive Crusher Claws
    // Digit 1: Thumb
    b.frustumBox(
      [s * 1.06, 0.66, 0.44],
      [s * 1.1, 0.54, 0.52],
      [0.09, 0.09],
      [0.07, 0.07],
      { bone: hand, color: basaltPaint },
    );
    glow(
      b.spike([s * 1.1, 0.54, 0.52], [0, -0.4, 0.88], 0.08, 0.03, {
        bone: hand,
        color: LAVA_CORE,
      }),
      2.5,
    );

    // Digit 2: Middle finger
    b.frustumBox(
      [s * 1.02, 0.64, 0.38],
      [s * 1.04, 0.46, 0.46],
      [0.1, 0.09],
      [0.08, 0.07],
      { bone: hand, color: basaltPaint },
    );
    glow(
      b.spike([s * 1.04, 0.46, 0.46], [0, -0.92, 0.38], 0.09, 0.032, {
        bone: hand,
        color: LAVA_CORE,
      }),
      2.5,
    );

    // Digit 3: Outer finger
    b.frustumBox(
      [s * 0.92, 0.64, 0.32],
      [s * 0.9, 0.48, 0.38],
      [0.09, 0.09],
      [0.07, 0.07],
      { bone: hand, color: basaltPaint },
    );
    glow(
      b.spike([s * 0.9, 0.48, 0.38], [0, -0.95, 0.28], 0.08, 0.028, {
        bone: hand,
        color: LAVA_CORE,
      }),
      2.5,
    );
  }

  // ---------------------------------------------------------------------------
  // 5. WAIST, MOLTEN GIRDLE & ARMORED TASSETS
  // ---------------------------------------------------------------------------

  // Central Pelvis Armor Box
  b.frustumBox([0, 1.26, -0.06], [0, 1.08, -0.06], [0.52, 0.32], [0.44, 0.3], {
    bone: hips,
    color: basaltPaint,
  });

  // Molten Magma Waist Ring (The Girdle)
  glow(
    b.part(new THREE.TorusGeometry(0.28, 0.035, 8, 24), LAVA_HOT, {
      bone: hips,
      at: [0, 1.24, -0.06],
      dir: [0, 1, 0],
    }),
    2.4,
  );

  // Ancient Bronze Belt Plate
  b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.09, 12, 1, true), bronzePaint, {
    bone: hips,
    at: [0, 1.24, -0.06],
  });
  // Bronze Buckle Medallion
  b.part(new THREE.BoxGeometry(0.16, 0.12, 0.06), bronzePaint, {
    bone: hips,
    at: [0, 1.24, 0.24],
  });
  glow(
    b.part(new THREE.PlaneGeometry(0.11, 0.11), "#ffffff", {
      bone: hips,
      at: [0, 1.24, 0.272],
      dir: [0, 0, 1],
      axis: "z",
      texture: PYRO_EMBLEM_TEX,
    }),
    1.8,
  );

  // Hanging Armored Tassets / Faulds
  // Front Center Tasset
  b.frustumBox([0, 1.2, 0.22], [0, 0.94, 0.26], [0.24, 0.07], [0.16, 0.05], {
    bone: hips,
    color: basaltPaint,
  });
  glow(
    b.part(new THREE.BoxGeometry(0.04, 0.18, 0.04), LAVA_HOT, {
      bone: hips,
      at: [0, 1.06, 0.27],
    }),
    2.2,
  );

  // Side Hip Tassets (L & R)
  for (const s of [1, -1]) {
    b.frustumBox(
      [s * 0.3, 1.22, -0.06],
      [s * 0.42, 0.98, -0.06],
      [0.09, 0.32],
      [0.07, 0.24],
      { bone: hips, color: basaltPaint },
    );
    glow(
      b.part(new THREE.BoxGeometry(0.024, 0.2, 0.16), LAVA_HOT, {
        bone: hips,
        at: [s * 0.29, 1.1, -0.06],
      }),
      2.2,
    );
  }

  // Rear Rump Guard Plate
  b.frustumBox([0, 1.2, -0.22], [0, 0.98, -0.26], [0.42, 0.07], [0.32, 0.05], {
    bone: hips,
    color: basaltPaint,
  });

  // ---------------------------------------------------------------------------
  // 6. LEGS, HEAVY BASALT CALVES & GROUNDED TRIPOD FEET
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const { hip, knee, ankle, foot, toe } = legJoints[side];

    // Hip socket sphere
    b.part(new THREE.SphereGeometry(0.16, 12, 10), basaltPaint, {
      bone: hip,
      at: [s * 0.34, 1.08, -0.06],
    });

    // Thigh (Columnar basalt pillar)
    b.frustumBox(
      [s * 0.35, 1.04, -0.05],
      [s * 0.38, 0.7, 0.08],
      [0.28, 0.28],
      [0.24, 0.24],
      { bone: hip, color: basaltPaint },
    );
    // Front vertical molten seam down thigh
    glow(
      b.part(new THREE.BoxGeometry(0.04, 0.28, 0.035), LAVA_HOT, {
        bone: hip,
        at: [s * 0.37, 0.86, 0.18],
      }),
      2.2,
    );
    // Bronze thigh reinforcing clamp
    b.part(new THREE.CylinderGeometry(0.155, 0.155, 0.07, 10), bronzePaint, {
      bone: hip,
      at: [s * 0.36, 0.84, 0.05],
      dir: [s * 0.05, -0.36, 0.08],
    });

    // KNEE COP (Projecting diamond basalt shield)
    b.part(new THREE.BoxGeometry(0.2, 0.22, 0.16), basaltPaint, {
      bone: knee,
      at: [s * 0.38, 0.66, 0.18],
      rotation: [s * -15, 0, 0],
    });
    // Glowing lava border around knee cop
    glow(
      b.part(new THREE.BoxGeometry(0.22, 0.24, 0.025), LAVA_BRIGHT, {
        bone: knee,
        at: [s * 0.38, 0.66, 0.1],
      }),
      2.4,
    );
    // Center bronze knee stud
    b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.045, 8), bronzePaint, {
      bone: knee,
      at: [s * 0.38, 0.66, 0.27],
      dir: [0, 0, 1],
    });

    // Shin & Calf Column
    b.frustumBox(
      [s * 0.38, 0.62, 0.08],
      [s * 0.4, 0.26, -0.04],
      [0.26, 0.26],
      [0.32, 0.3],
      { bone: knee, color: basaltPaint },
    );
    // Front shin armor plate
    b.part(new THREE.BoxGeometry(0.16, 0.34, 0.09), basaltPaint, {
      bone: knee,
      at: [s * 0.39, 0.44, 0.16],
    });

    // Rear calf cooling vents (Embedded flush into the calf block—no loose/floating parts!)
    for (let v = 0; v < 3; v++) {
      glow(
        b.part(new THREE.BoxGeometry(0.14, 0.02, 0.03), LAVA_HOT, {
          bone: knee,
          at: [s * 0.39, 0.38 + v * 0.08, -0.1],
        }),
        2.2,
      );
    }

    // Ankle joint hub
    b.part(new THREE.SphereGeometry(0.15, 10, 8), basaltPaint, {
      bone: ankle,
      at: [s * 0.4, 0.24, -0.04],
    });
    glow(
      b.part(new THREE.TorusGeometry(0.158, 0.02, 8, 16), LAVA_HOT, {
        bone: ankle,
        at: [s * 0.4, 0.24, -0.04],
        dir: [0, 1, 0],
      }),
      2.2,
    );

    // TRIPOD BASALT FEET (Firm ground contact at y = 0.08 platform surface)
    // Foot main ankle block
    b.frustumBox(
      [s * 0.41, 0.22, -0.04],
      [s * 0.41, 0.08, 0.14],
      [0.3, 0.24],
      [0.36, 0.32],
      { bone: foot, color: basaltPaint },
    );
    // Rear heel spur extending backward for stability
    b.frustumBox(
      [s * 0.41, 0.12, -0.08],
      [s * 0.41, 0.04, -0.24],
      [0.22, 0.16],
      [0.18, 0.08],
      { bone: foot, color: basaltPaint },
    );

    // Front/Side 3 Claws/Toes touching ground
    // Center main toe
    b.frustumBox(
      [s * 0.42, 0.08, 0.24],
      [s * 0.42, 0.04, 0.4],
      [0.15, 0.09],
      [0.11, 0.06],
      { bone: toe, color: basaltPaint },
    );
    // Inner toe
    b.frustumBox(
      [s * 0.32, 0.08, 0.2],
      [s * 0.28, 0.04, 0.36],
      [0.12, 0.09],
      [0.09, 0.06],
      { bone: toe, color: basaltPaint },
    );
    // Outer toe
    b.frustumBox(
      [s * 0.52, 0.08, 0.2],
      [s * 0.56, 0.04, 0.36],
      [0.12, 0.09],
      [0.09, 0.06],
      { bone: toe, color: basaltPaint },
    );

    // Glowing molten seams between toes and foot base
    glow(
      b.part(new THREE.BoxGeometry(0.32, 0.02, 0.04), LAVA_BRIGHT, {
        bone: foot,
        at: [s * 0.42, 0.05, 0.22],
      }),
      2.4,
    );
  }

  // ---------------------------------------------------------------------------
  // 7. VOLCANIC CRAG STAGED BASE, SUNKEN LAVA RIVERS & FLOATING EMBERS
  // ---------------------------------------------------------------------------

  // Primary Stepped Hexagonal Basalt Arena Platform
  b.part(new THREE.CylinderGeometry(1.36, 1.44, 0.08, 12), basaltPaint, {
    bone: hips,
    at: [0, 0.04, 0.06],
  });
  // Upper stepped cracked crust platform
  b.part(new THREE.CylinderGeometry(1.18, 1.24, 0.04, 10), basaltPaint, {
    bone: hips,
    at: [0, 0.08, 0.06],
  });

  // SUNKEN MOLTEN LAVA CHANNELS CUT INTO THE ARENA FLOOR
  // Channel 1: Main diagonal molten crack beneath golem
  const lavaPath1 = catmull([
    [-0.98, 0.085, -0.72],
    [-0.48, 0.085, -0.22],
    [0.04, 0.085, 0.16],
    [0.58, 0.085, 0.5],
    [1.08, 0.085, 0.82],
  ]);
  glow(
    b.sweep(lavaPath1, (t: number) => 0.095 * (1 - 0.25 * Math.sin(t * Math.PI)), {
      bone: hips,
      color: LAVA_HOT,
    }),
    2.4,
  );
  // Channel 1 incandescent core river
  glow(
    b.sweep(lavaPath1, 0.026, {
      bone: hips,
      color: LAVA_CORE,
    }),
    2.9,
  );

  // Channel 2: Branching left fissure
  const lavaPath2 = catmull([
    [-0.48, 0.085, -0.22],
    [-0.78, 0.085, 0.28],
    [-1.12, 0.085, 0.56],
  ]);
  glow(
    b.sweep(lavaPath2, 0.068, {
      bone: hips,
      color: LAVA_DEEP,
    }),
    2.2,
  );
  glow(
    b.sweep(lavaPath2, 0.018, {
      bone: hips,
      color: LAVA_BRIGHT,
    }),
    2.6,
  );

  // Channel 3: Branching right fissure
  const lavaPath3 = catmull([
    [0.04, 0.085, 0.16],
    [0.52, 0.085, -0.28],
    [0.92, 0.085, -0.62],
  ]);
  glow(
    b.sweep(lavaPath3, 0.068, {
      bone: hips,
      color: LAVA_DEEP,
    }),
    2.2,
  );
  glow(
    b.sweep(lavaPath3, 0.018, {
      bone: hips,
      color: LAVA_BRIGHT,
    }),
    2.6,
  );

  // Basalt Arena Rim Slabs (Faceted stone boundary ring)
  for (let r = 0; r < 8; r++) {
    const angle = (r * Math.PI) / 4;
    const rX = Math.cos(angle) * 1.28;
    const rZ = 0.06 + Math.sin(angle) * 1.28;
    b.part(new THREE.BoxGeometry(0.36, 0.05, 0.18), basaltPaint, {
      bone: hips,
      at: [rX, 0.085, rZ],
      rotation: [0, -angle, 0],
    });
  }

  // Columnar Basalt & Obsidian Spires emerging around perimeter
  const crystalAngles = [15, 60, 105, 150, 195, 240, 285, 330];
  crystalAngles.forEach((deg, idx) => {
    const rad = (deg * Math.PI) / 180;
    const dist = 1.05 + (idx % 3) * 0.14;
    const cX = Math.cos(rad) * dist;
    const cZ = 0.06 + Math.sin(rad) * dist;
    const cHeight = 0.28 + (idx % 4) * 0.1;
    const leanDir: [number, number, number] = [
      Math.cos(rad) * 0.35,
      1.0,
      Math.sin(rad) * 0.35,
    ];
    // Obsidian base pillar
    b.spike([cX, 0.08, cZ], leanDir, cHeight, 0.05, {
      bone: hips,
      color: OBSIDIAN_GLASS,
    });
    // Glowing molten tip
    glow(
      b.spike(offset([cX, 0.08, cZ], leanDir, cHeight * 0.68), leanDir, cHeight * 0.38, 0.026, {
        bone: hips,
        color: LAVA_HOT,
      }),
      2.4,
    );
  });

  // Floating Pyro Sparks & Embers (Rising along thermal updrafts from fissures and core)
  const emberFrames = [];
  const numEmbers = 42;
  for (let i = 0; i < numEmbers; i++) {
    const tVal = random();
    const branch = random();
    const basePath = branch < 0.5 ? lavaPath1 : branch < 0.8 ? lavaPath2 : lavaPath3;
    const pt = basePath.at(tVal);
    const yFloat = 0.14 + random() * 1.8;
    const xDrift = (random() - 0.5) * 0.32;
    const zDrift = (random() - 0.5) * 0.32;
    emberFrames.push(
      frame([pt.x + xDrift, yFloat, pt.z + zDrift], [0, 1, 0]),
    );
  }

  // Cards with glowing ember sparks
  glow(
    b.cards(emberFrames, EMBER_TEX, {
      size: [0.065, 0.11],
      cross: true,
      lean: 18,
      bend: 25,
      vary: 0.35,
      rng: rng(777),
      bone: hips,
    }),
    2.4,
  );

  return b.root;
}
