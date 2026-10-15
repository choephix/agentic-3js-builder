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
    "A colossal Genshin Impact-styled Pyro elemental lava golem constructed from chiselled obsidian-basalt plates, glowing molten seams, and an ancient crucible core.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "lava_golem", paintSize: 2048 });
  const random = rng(777);

  // ---------------------------------------------------------------------------
  // COLOR PALETTE (Genshin Impact Pyro / Natlan Volcanic Aesthetic)
  // ---------------------------------------------------------------------------
  const BASALT_DARK = "#17141b"; // Deepest obsidian shadows & core plates
  const BASALT_MID = "#27222d"; // Primary chiselled basalt plate
  const BASALT_LIGHT = "#3d3646"; // Highlighted chiseled bevels
  const STONE_WARM = "#483d38"; // Weathered volcanic crust
  const BRONZE_DARK = "#784b18"; // Deep ancient metal shadow
  const BRONZE_MID = "#b87c2b"; // Natlan-style forge alloy
  const BRONZE_LIGHT = "#e8b056"; // Bright elemental filigree & clips
  const LAVA_DEEP = "#d62800"; // Deep red molten magma
  const LAVA_HOT = "#ff6a00"; // Radiant orange lava flow
  const LAVA_BRIGHT = "#ffb000"; // Intense yellow-orange thermal seam
  const LAVA_CORE = "#fffad1"; // Incandescent white-hot core
  const OBSIDIAN_CRYSTAL = "#141117"; // Translucent-feeling dark obsidian glass

  // ---------------------------------------------------------------------------
  // TEXTURES (Genshin anime elemental motifs)
  // ---------------------------------------------------------------------------

  // 1. Natlan / Ancient Pyro Sigil Medallion
  const PYRO_EMBLEM_TEX = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="flameG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fff8d6"/>
          <stop offset="35%" stop-color="#ff9900"/>
          <stop offset="85%" stop-color="#d62200"/>
          <stop offset="100%" stop-color="#730e00"/>
        </radialGradient>
      </defs>
      <!-- Outer bronze diamond frame -->
      <polygon points="64,4 124,64 64,124 4,64" fill="#18151c" stroke="#e8b056" stroke-width="5"/>
      <polygon points="64,14 114,64 64,114 14,64" fill="none" stroke="#94581a" stroke-width="2.5"/>
      <!-- Inner flame crest -->
      <path d="M64 22 C76 44 100 54 100 78 C100 98 84 108 64 108 C44 108 28 98 28 78 C28 54 52 44 64 22 Z" fill="url(#flameG)"/>
      <path d="M64 42 C70 56 84 64 84 80 C84 92 74 98 64 98 C54 98 44 92 44 80 C44 64 58 56 64 42 Z" fill="#fff5b8"/>
      <!-- Cardinal diamond gem -->
      <polygon points="64,58 74,74 64,90 54,74" fill="#ff2200"/>
      <polygon points="64,64 70,74 64,84 58,74" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  // 2. Ruin / Golem Cyclopean Optical Eye
  const GOLEM_EYE_TEX = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="eyeG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="25%" stop-color="#fff3a3"/>
          <stop offset="65%" stop-color="#ff7b00"/>
          <stop offset="100%" stop-color="#ad1800"/>
        </radialGradient>
      </defs>
      <rect width="128" height="128" fill="#161219"/>
      <circle cx="64" cy="64" r="58" fill="none" stroke="#e8b056" stroke-width="4"/>
      <circle cx="64" cy="64" r="50" fill="none" stroke="#ff9400" stroke-width="2.5" stroke-dasharray="8 6"/>
      <circle cx="64" cy="64" r="42" fill="url(#eyeG)"/>
      <!-- Crosshairs & Cardinal glyphs -->
      <line x1="64" y1="8" x2="64" y2="24" stroke="#ffe266" stroke-width="3"/>
      <line x1="64" y1="104" x2="64" y2="120" stroke="#ffe266" stroke-width="3"/>
      <line x1="8" y1="64" x2="24" y2="64" stroke="#ffe266" stroke-width="3"/>
      <line x1="104" y1="64" x2="120" y2="64" stroke="#ffe266" stroke-width="3"/>
      <!-- 4-point star iris -->
      <polygon points="64,30 72,58 100,64 72,70 64,98 56,70 28,64 56,58" fill="#ffffff"/>
      <circle cx="64" cy="64" r="6" fill="#ff1f00"/>
    </svg>`,
    { size: 256 },
  );

  // 3. Molten Fissure / Branching Lava Crack Decal
  const MAGMA_CRACK_TEX = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 12 Q36 40 50 48 T70 86 Q82 98 116 120 M50 48 Q76 34 112 28 M70 86 Q54 104 38 122 M80 64 Q96 76 124 78"
        fill="none" stroke="#ff2600" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16 12 Q36 40 50 48 T70 86 Q82 98 116 120 M50 48 Q76 34 112 28 M70 86 Q54 104 38 122 M80 64 Q96 76 124 78"
        fill="none" stroke="#ffaa00" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16 12 Q36 40 50 48 T70 86 Q82 98 116 120 M50 48 Q76 34 112 28 M70 86 Q54 104 38 122 M80 64 Q96 76 124 78"
        fill="none" stroke="#fffce0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    { size: 256 },
  );

  // 4. Ancient Runic Natlan Border Trim
  const RUNIC_TRIM_TEX = svg(
    `<svg viewBox="0 0 256 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="64" fill="#18151c"/>
      <line x1="0" y1="4" x2="256" y2="4" stroke="#e8b056" stroke-width="3"/>
      <line x1="0" y1="60" x2="256" y2="60" stroke="#e8b056" stroke-width="3"/>
      <g fill="none" stroke="#f5c258" stroke-width="3" stroke-linecap="square">
        <path d="M16 20 L28 12 L40 20 L40 44 L28 52 L16 44 Z M28 22 L28 42"/>
        <polygon points="56,32 68,16 80,32 68,48"/>
        <path d="M96 16 L112 16 L120 28 L112 40 L96 40 M104 28 L128 28"/>
        <path d="M144 20 L156 12 L168 20 L168 44 L156 52 L144 44 Z M156 22 L156 42"/>
        <polygon points="184,32 196,16 208,32 196,48"/>
        <path d="M224 16 L240 16 L248 28 L240 40 L224 40 M232 28 L256 28"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  // 5. Stylized Anime Floating Ember Spark
  const EMBER_TEX = svg(
    `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="embG" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#ff1a00"/>
          <stop offset="40%" stop-color="#ff8800"/>
          <stop offset="80%" stop-color="#ffea66"/>
          <stop offset="100%" stop-color="#ffffff"/>
        </linearGradient>
      </defs>
      <polygon points="16,2 25,18 29,32 16,46 3,32 7,18" fill="url(#embG)"/>
      <polygon points="16,10 21,20 23,28 16,36 9,28 11,20" fill="#ffffff" opacity="0.85"/>
    </svg>`,
    { size: 64 },
  );

  // ---------------------------------------------------------------------------
  // PROCEDURAL PAINTS
  // ---------------------------------------------------------------------------
  // Basalt stone: chiseled volcanic texture with cool-to-warm soot gradient
  const basaltPaint = paint((p, n) => {
    const v = noise(p, 0.18, 42);
    const fine = noise(p, 0.05, 88);
    const up = smoothstep(0.1, 0.85, n.y);
    const stone = mix(BASALT_MID, BASALT_DARK, smoothstep(0.35, 0.75, v));
    const dusty = mix(stone, STONE_WARM, fine * 0.3);
    return mix(dusty, BASALT_LIGHT, up * 0.4);
  });

  // Ancient Natlan bronze: metallic warmth with subtle edge polish
  const bronzePaint = paint((p, n) => {
    const v = noise(p, 0.1, 107);
    const highlight = smoothstep(0.3, 0.9, n.y);
    const baseMetal = mix(BRONZE_DARK, BRONZE_MID, smoothstep(0.25, 0.7, v));
    return mix(baseMetal, BRONZE_LIGHT, highlight * 0.45);
  });

  // ---------------------------------------------------------------------------
  // SKELETON (Hierarchy & Rig Answer Key compliance)
  // ---------------------------------------------------------------------------
  // Root Pelvis
  const hips = b.joint("hips", { at: [0, 1.26, -0.04] });

  // Spine & Chest
  const spine1 = b.joint("spine1", { parent: hips, at: [0, 1.5, -0.03], role: "spine" });
  const chest = b.joint("chest", { parent: spine1, at: [0, 1.78, 0.02], role: "spine" });

  // Neck, Head & Jaw
  const neck = b.joint("neck", { parent: chest, at: [0, 2.06, 0.1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 2.2, 0.22], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.08, 0.28], dir: [0, -0.12, 0.3], role: "jaw" });

  // Limb Joints storage
  const armJoints: Record<string, { clavicle: any; shoulder: any; elbow: any; wrist: any; hand: any }> = {};
  const legJoints: Record<string, { hip: any; knee: any; ankle: any; foot: any; toe: any }> = {};

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Arm chain
    const clavicle = b.joint(`clavicle${side}`, {
      parent: chest,
      at: [s * 0.24, 1.94, -0.01],
      role: "arm",
    });
    const shoulder = b.joint(`shoulder${side}`, {
      parent: clavicle,
      at: [s * 0.5, 1.9, -0.03],
      role: "arm",
    });
    const elbow = b.joint(`elbow${side}`, {
      parent: shoulder,
      at: [s * 0.78, 1.48, -0.04],
      role: "arm",
    });
    const wrist = b.joint(`wrist${side}`, {
      parent: elbow,
      at: [s * 0.94, 1.05, 0.08],
      role: "arm",
    });
    const hand = b.joint(`hand${side}`, {
      parent: wrist,
      at: [s * 1.02, 0.78, 0.16],
      role: "arm",
    });

    // Digits
    b.joint(`thumb${side}`, {
      parent: hand,
      at: [s * 1.08, 0.72, 0.26],
      role: "digit",
    });
    b.joint(`index${side}`, {
      parent: hand,
      at: [s * 1.04, 0.6, 0.22],
      role: "digit",
    });
    b.joint(`pinky${side}`, {
      parent: hand,
      at: [s * 0.94, 0.61, 0.14],
      role: "digit",
    });

    armJoints[side] = { clavicle, shoulder, elbow, wrist, hand };

    // Leg chain
    const hip = b.joint(`hip${side}`, {
      parent: hips,
      at: [s * 0.25, 1.18, -0.02],
      role: "leg",
    });
    const knee = b.joint(`knee${side}`, {
      parent: hip,
      at: [s * 0.3, 0.74, 0.08],
      role: "leg",
    });
    const ankle = b.joint(`ankle${side}`, {
      parent: knee,
      at: [s * 0.32, 0.26, -0.05],
      role: "leg",
    });
    const foot = b.joint(`foot${side}`, {
      parent: ankle,
      at: [s * 0.34, 0.08, 0.12],
      role: "leg",
    });
    const toe = b.joint(`toe${side}`, {
      parent: foot,
      at: [s * 0.34, 0.04, 0.3],
      role: "digit",
    });

    legJoints[side] = { hip, knee, ankle, foot, toe };
  }

  // ---------------------------------------------------------------------------
  // 1. TORSO: MOLTEN CORE & CRUCIBLE CHEST
  // ---------------------------------------------------------------------------

  // Segmented Spine vertebrae & glowing discs
  for (let i = 0; i < 3; i++) {
    const yV = 1.34 + i * 0.15;
    // Basalt block
    b.part(new THREE.BoxGeometry(0.24, 0.09, 0.22), basaltPaint, {
      bone: spine1,
      at: [0, yV, -0.06],
    });
    // Glowing lava inter-vertebral disc
    glow(
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 10), LAVA_HOT, {
        bone: spine1,
        at: [0, yV + 0.06, -0.06],
      }),
      2.0,
    );
  }

  // Inner Furnace Backing Plate
  b.part(new THREE.CylinderGeometry(0.26, 0.26, 0.38, 10, 1, false, -Math.PI / 2, Math.PI), basaltPaint, {
    bone: chest,
    at: [0, 1.72, 0.0],
    dir: [0, 0, -1],
  });

  // THE MOLTEN PYRO CORE (Multi-layered incandescent sphere)
  const corePos: [number, number, number] = [0, 1.72, 0.07];
  // 1. Incandescent white-hot nucleus
  glow(
    b.part(new THREE.IcosahedronGeometry(0.12, 1), LAVA_CORE, {
      bone: chest,
      at: corePos,
    }),
    2.8,
  );
  // 2. Faceted radiant corona
  glow(
    b.part(new THREE.DodecahedronGeometry(0.15, 0), LAVA_BRIGHT, {
      bone: chest,
      at: corePos,
    }),
    2.0,
  );
  // 3. Molten plasma equator ring
  glow(
    b.part(new THREE.TorusGeometry(0.19, 0.02, 8, 20), LAVA_HOT, {
      bone: chest,
      at: corePos,
      dir: [0, 0, 1],
    }),
    2.2,
  );

  // Ancient Bronze Containment Claws holding the Core
  for (let a = 0; a < 4; a++) {
    const angle = (a * Math.PI) / 2 + Math.PI / 4;
    const clawBase: [number, number, number] = [
      Math.cos(angle) * 0.26,
      1.72 + Math.sin(angle) * 0.26,
      0.02,
    ];
    const clawTip: [number, number, number] = [
      Math.cos(angle) * 0.17,
      1.72 + Math.sin(angle) * 0.17,
      0.16,
    ];
    b.sweep(catmull([clawBase, [Math.cos(angle) * 0.22, 1.72 + Math.sin(angle) * 0.22, 0.12], clawTip]), [0.035, 0.012], {
      bone: chest,
      color: bronzePaint,
    });
    // Glowing containment tip emitter
    glow(
      b.part(new THREE.SphereGeometry(0.016, 8, 8), LAVA_CORE, {
        bone: chest,
        at: clawTip,
      }),
      2.5,
    );
  }

  // Heavy Chiseled Pectoral Basalt Slabs (V-opening framing the core)
  for (const s of [1, -1]) {
    // Main pectoral armor block
    b.frustumBox(
      [s * 0.16, 1.62, 0.1],
      [s * 0.38, 1.86, 0.06],
      [0.26, 0.18],
      [0.2, 0.14],
      { bone: chest, color: basaltPaint },
    );
    // Beveled upper shoulder collar plate
    b.part(new THREE.BoxGeometry(0.24, 0.12, 0.18), basaltPaint, {
      bone: chest,
      at: [s * 0.26, 1.96, 0.06],
      rotation: [0, s * -15, s * 12],
    });
    // Glowing lava fissure embedded in pectoral face
    glow(
      b.part(new THREE.PlaneGeometry(0.18, 0.18), "#ffffff", {
        bone: chest,
        at: [s * 0.26, 1.74, 0.19],
        dir: [s * 0.2, 0.1, 1],
        axis: "z",
        texture: MAGMA_CRACK_TEX,
      }),
      2.0,
    );
    // Bronze rivet reinforcement brackets
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 8), bronzePaint, {
      bone: chest,
      at: [s * 0.36, 1.88, 0.16],
      dir: [0, 0, 1],
    });
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 8), bronzePaint, {
      bone: chest,
      at: [s * 0.16, 1.56, 0.17],
      dir: [0, 0, 1],
    });
  }

  // Center Gorget & Natlan Pyro Medallion (above molten core)
  b.part(new THREE.BoxGeometry(0.18, 0.1, 0.12), bronzePaint, {
    bone: chest,
    at: [0, 1.94, 0.14],
  });
  glow(
    b.part(new THREE.PlaneGeometry(0.15, 0.15), "#ffffff", {
      bone: chest,
      at: [0, 1.94, 0.21],
      dir: [0, 0, 1],
      axis: "z",
      texture: PYRO_EMBLEM_TEX,
    }),
    1.6,
  );

  // ---------------------------------------------------------------------------
  // 2. BACK CARAPACE & VOLCANIC EXHAUST CHIMNEYS
  // ---------------------------------------------------------------------------

  // Staggered dorsal armor plates
  for (let i = 0; i < 3; i++) {
    const yP = 1.82 - i * 0.18;
    b.frustumBox([0, yP, -0.14], [0, yP - 0.08, -0.18], [0.46 - i * 0.06, 0.12], [0.4 - i * 0.06, 0.1], {
      bone: chest,
      color: basaltPaint,
    });
    // Glowing lava seam between dorsal plates
    glow(
      b.part(new THREE.BoxGeometry(0.34 - i * 0.06, 0.02, 0.04), LAVA_HOT, {
        bone: chest,
        at: [0, yP - 0.05, -0.19],
      }),
      2.0,
    );
    // Jagged dorsal obsidian spine fin
    b.spike([0, yP, -0.2], [0, 0.4, -0.9], 0.16 - i * 0.02, 0.035, {
      bone: chest,
      color: OBSIDIAN_CRYSTAL,
    });
  }

  // Twin Volcanic Vent Chimneys on Upper Back
  for (const s of [1, -1]) {
    const chimneyBase: [number, number, number] = [s * 0.26, 2.02, -0.14];
    const chimneyDir: [number, number, number] = [s * 0.15, 0.85, -0.35];
    // Main conical vent chimney
    b.sweep(
      catmull([
        chimneyBase,
        offset(chimneyBase, chimneyDir, 0.12),
        offset(chimneyBase, chimneyDir, 0.24),
      ]),
      [0.08, 0.065],
      { bone: chest, color: basaltPaint },
    );
    // Bronze support collar band
    b.sweep(
      catmull([
        offset(chimneyBase, chimneyDir, 0.08),
        offset(chimneyBase, chimneyDir, 0.14),
      ]),
      0.086,
      { bone: chest, color: bronzePaint },
    );
    // Glowing molten lava pool inside chimney mouth
    const mouthPt = offset(chimneyBase, chimneyDir, 0.25);
    glow(
      b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.02, 10), LAVA_CORE, {
        bone: chest,
        at: mouthPt,
        dir: chimneyDir,
      }),
      2.5,
    );
    // Small stylized rising smoke/plasma ember card from chimney
    glow(
      b.part(new THREE.PlaneGeometry(0.12, 0.2), "#ffffff", {
        bone: chest,
        at: offset(mouthPt, chimneyDir, 0.1),
        dir: chimneyDir,
        axis: "z",
        texture: EMBER_TEX,
      }),
      2.0,
    );
  }

  // ---------------------------------------------------------------------------
  // 3. HEAD, VISOR OPTIC, ROARING JAW & GREAT BASALT HORNS
  // ---------------------------------------------------------------------------

  // Neck armored cylinder with molten conduit channels
  b.sweep(catmull([[0, 1.96, 0.04], [0, 2.08, 0.12]]), [0.14, 0.12], {
    bone: neck,
    color: basaltPaint,
  });
  // Twin glowing conduit pipes from chest to head
  for (const s of [1, -1]) {
    glow(
      b.sweep(
        catmull([
          [s * 0.1, 1.94, 0.14],
          [s * 0.09, 2.04, 0.16],
          [s * 0.07, 2.14, 0.2],
        ]),
        0.022,
        { bone: neck, color: LAVA_HOT },
      ),
      2.0,
    );
  }

  // Main Golem Cranium / Helmet
  b.frustumBox([0, 2.12, 0.12], [0, 2.34, 0.26], [0.34, 0.26], [0.28, 0.22], {
    bone: head,
    color: basaltPaint,
  });
  // Beveled temple & cheek plates
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.12, 0.18, 0.22), basaltPaint, {
      bone: head,
      at: [s * 0.18, 2.2, 0.24],
      rotation: [0, s * -20, 0],
    });
  }

  // Forehead Obsidian Crown & Center Chevron
  b.spike([0, 2.34, 0.26], [0, 0.5, 0.85], 0.16, 0.045, {
    bone: head,
    color: OBSIDIAN_CRYSTAL,
  });
  // Bronze forehead brow plate
  b.part(new THREE.BoxGeometry(0.24, 0.06, 0.1), bronzePaint, {
    bone: head,
    at: [0, 2.3, 0.32],
  });

  // CYCLOPEAN GOLEM OPTICAL CORE (The iconic Genshin eye)
  // Bronze eye socket bezel
  b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.03, 12), bronzePaint, {
    bone: head,
    at: [0, 2.22, 0.34],
    dir: [0, 0, 1],
  });
  // Glowing eye pupil disc
  glow(
    b.part(new THREE.CircleGeometry(0.078, 16), "#ffffff", {
      bone: head,
      at: [0, 2.22, 0.358],
      dir: [0, 0, 1],
      axis: "z",
      texture: GOLEM_EYE_TEX,
    }),
    2.4,
  );
  // Auxiliary molten eye slits (angled above main eye)
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.BoxGeometry(0.05, 0.012, 0.02), LAVA_BRIGHT, {
        bone: head,
        at: [s * 0.08, 2.28, 0.33],
        rotation: [0, 0, s * 25],
      }),
      2.2,
    );
  }

  // Movable Lower Jaw & Roaring Mouth
  // Jaw bone structure
  b.frustumBox([0, 2.06, 0.2], [0, 2.04, 0.36], [0.26, 0.14], [0.2, 0.1], {
    bone: jaw,
    color: basaltPaint,
  });
  // Glowing molten mouth floor
  glow(
    b.part(new THREE.BoxGeometry(0.18, 0.02, 0.14), LAVA_HOT, {
      bone: jaw,
      at: [0, 2.1, 0.28],
    }),
    2.2,
  );
  // Lower Rocky Fangs
  for (const s of [1, -1]) {
    b.spike([s * 0.06, 2.1, 0.34], [0, 1, 0], 0.045, 0.015, {
      bone: jaw,
      color: BASALT_LIGHT,
    });
    b.spike([s * 0.03, 2.1, 0.35], [0, 1, 0], 0.05, 0.016, {
      bone: jaw,
      color: BASALT_LIGHT,
    });
    // Upper Rocky Fangs
    b.spike([s * 0.07, 2.16, 0.32], [0, -1, 0], 0.045, 0.015, {
      bone: head,
      color: BASALT_LIGHT,
    });
  }

  // GREAT BASALT HORNS (Iconic sweeping volcanic horns)
  for (const s of [1, -1]) {
    const hornStart: [number, number, number] = [s * 0.16, 2.28, 0.16];
    const hornMid1: [number, number, number] = [s * 0.38, 2.44, 0.04];
    const hornMid2: [number, number, number] = [s * 0.54, 2.6, -0.14];
    const hornTip: [number, number, number] = [s * 0.46, 2.78, -0.08];

    const hornPath = catmull([hornStart, hornMid1, hornMid2, hornTip]);
    // Main horned basalt curve
    b.sweep(hornPath, (t: number) => 0.085 * (1 - 0.82 * t) + 0.008, {
      bone: head,
      color: basaltPaint,
    });

    // Bronze reinforcing bands along horns
    b.sweep(catmull([hornPath.at(0.24), hornPath.at(0.32)]), 0.078, {
      bone: head,
      color: bronzePaint,
    });
    b.sweep(catmull([hornPath.at(0.55), hornPath.at(0.63)]), 0.052, {
      bone: head,
      color: bronzePaint,
    });

    // Glowing molten magma segments near the tip
    glow(
      b.sweep(catmull([hornPath.at(0.4), hornPath.at(0.48)]), 0.068, {
        bone: head,
        color: LAVA_HOT,
      }),
      2.0,
    );
    glow(
      b.sweep(catmull([hornPath.at(0.78), hornPath.at(1.0)]), [0.032, 0.006], {
        bone: head,
        color: LAVA_CORE,
      }),
      2.5,
    );

    // Secondary brow horn spikes jutting forward
    b.spike([s * 0.12, 2.34, 0.32], [s * 0.4, 0.5, 0.8], 0.11, 0.026, {
      bone: head,
      color: OBSIDIAN_CRYSTAL,
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
        [s * 0.24, 1.94, -0.01],
        [s * 0.48, 1.9, -0.03],
      ]),
      0.09,
      { bone: clavicle, color: bronzePaint },
    );

    // GIANT TIERED SHOULDER PAULDRON
    // Tier 1: Main angled basalt pauldron slab
    b.frustumBox(
      [s * 0.42, 1.98, -0.02],
      [s * 0.72, 1.92, -0.04],
      [0.34, 0.28],
      [0.4, 0.32],
      { bone: shoulder, color: basaltPaint },
    );
    // Beveled crest on top of pauldron
    b.part(new THREE.BoxGeometry(0.32, 0.08, 0.3), basaltPaint, {
      bone: shoulder,
      at: [s * 0.58, 2.06, -0.03],
      rotation: [0, 0, s * -15],
    });
    // Glowing lava fissure decal on pauldron front face
    glow(
      b.part(new THREE.PlaneGeometry(0.24, 0.24), "#ffffff", {
        bone: shoulder,
        at: [s * 0.6, 1.95, 0.16],
        dir: [s * 0.1, 0.0, 1],
        axis: "z",
        texture: MAGMA_CRACK_TEX,
      }),
      2.0,
    );
    // Ancient bronze border trim around pauldron rim
    b.part(new THREE.PlaneGeometry(0.3, 0.08), "#ffffff", {
      bone: shoulder,
      at: [s * 0.58, 2.12, 0.12],
      dir: [0, 0.3, 1],
      axis: "z",
      texture: RUNIC_TRIM_TEX,
    });
    // Two jagged obsidian crystal spires rising from pauldron crest
    b.spike([s * 0.62, 2.1, -0.06], [s * 0.25, 0.9, -0.1], 0.22, 0.04, {
      bone: shoulder,
      color: OBSIDIAN_CRYSTAL,
    });
    b.spike([s * 0.7, 2.06, 0.04], [s * 0.35, 0.85, 0.1], 0.16, 0.032, {
      bone: shoulder,
      color: OBSIDIAN_CRYSTAL,
    });

    // Upper Arm (Bicep/Tricep)
    b.sweep(
      catmull([
        [s * 0.52, 1.88, -0.03],
        [s * 0.76, 1.5, -0.04],
      ]),
      [0.15, 0.13],
      { bone: shoulder, color: basaltPaint },
    );
    // Molten hydraulic conduit running down bicep
    glow(
      b.sweep(
        catmull([
          [s * 0.56, 1.84, 0.1],
          [s * 0.72, 1.58, 0.08],
        ]),
        0.024,
        { bone: shoulder, color: LAVA_HOT },
      ),
      2.0,
    );
    // Bronze middle sleeve ring
    b.part(new THREE.CylinderGeometry(0.155, 0.155, 0.08, 12), bronzePaint, {
      bone: shoulder,
      at: [s * 0.64, 1.68, -0.03],
      dir: [s * 0.24, -0.38, 0],
    });

    // Elbow Joint (Spherical stone hub + glowing ring + elbow blade)
    b.part(new THREE.SphereGeometry(0.13, 12, 10), basaltPaint, {
      bone: elbow,
      at: [s * 0.78, 1.48, -0.04],
    });
    glow(
      b.part(new THREE.TorusGeometry(0.138, 0.02, 8, 16), LAVA_HOT, {
        bone: elbow,
        at: [s * 0.78, 1.48, -0.04],
        dir: [s * 0.24, -0.38, 0],
      }),
      2.2,
    );
    // Rear elbow defense spike
    b.spike([s * 0.82, 1.48, -0.15], [s * 0.2, -0.3, -0.9], 0.15, 0.035, {
      bone: elbow,
      color: OBSIDIAN_CRYSTAL,
    });

    // Forearm / Crusher Gauntlet
    b.frustumBox(
      [s * 0.8, 1.44, -0.03],
      [s * 0.94, 1.06, 0.08],
      [0.26, 0.24],
      [0.34, 0.3],
      { bone: elbow, color: basaltPaint },
    );
    // Outer forearm heavy shield plate
    b.part(new THREE.BoxGeometry(0.1, 0.32, 0.24), basaltPaint, {
      bone: elbow,
      at: [s * 0.96, 1.25, 0.04],
      rotation: [0, 0, s * -15],
    });
    // Runic bronze trim on gauntlet ridge
    b.part(new THREE.PlaneGeometry(0.09, 0.28), "#ffffff", {
      bone: elbow,
      at: [s * 1.02, 1.25, 0.05],
      dir: [s * 1, 0, 0],
      axis: "z",
      texture: RUNIC_TRIM_TEX,
    });
    // Embedded central molten heat channel down forearm
    glow(
      b.part(new THREE.BoxGeometry(0.04, 0.28, 0.04), LAVA_HOT, {
        bone: elbow,
        at: [s * 0.88, 1.25, 0.18],
      }),
      2.0,
    );

    // Wrist Octagonal Cuff
    b.part(new THREE.CylinderGeometry(0.175, 0.185, 0.09, 8), bronzePaint, {
      bone: wrist,
      at: [s * 0.94, 1.04, 0.08],
      dir: [s * 0.16, -0.42, 0.12],
    });
    glow(
      b.part(new THREE.TorusGeometry(0.18, 0.016, 8, 16), LAVA_BRIGHT, {
        bone: wrist,
        at: [s * 0.94, 1.04, 0.08],
        dir: [s * 0.16, -0.42, 0.12],
      }),
      2.2,
    );

    // FIST & PALM
    // Main heavy stone palm block
    b.frustumBox(
      [s * 0.96, 0.98, 0.1],
      [s * 1.04, 0.76, 0.18],
      [0.26, 0.2],
      [0.24, 0.18],
      { bone: hand, color: basaltPaint },
    );
    // Recessed circular magma furnace port on inner palm
    glow(
      b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.02, 12), LAVA_CORE, {
        bone: hand,
        at: [s * 0.98, 0.84, 0.21],
        dir: [s * -0.2, -0.3, 0.9],
      }),
      2.5,
    );

    // 3 Massive Crusher Fingers
    // Digit 1: Thumb
    b.frustumBox(
      [s * 1.06, 0.76, 0.22],
      [s * 1.1, 0.64, 0.28],
      [0.08, 0.08],
      [0.06, 0.06],
      { bone: hand, color: basaltPaint },
    );
    glow(
      b.spike([s * 1.1, 0.64, 0.28], [0, -0.5, 0.8], 0.07, 0.028, {
        bone: hand,
        color: LAVA_CORE,
      }),
      2.4,
    );

    // Digit 2: Index / Middle finger
    b.frustumBox(
      [s * 1.04, 0.74, 0.16],
      [s * 1.06, 0.56, 0.22],
      [0.09, 0.08],
      [0.07, 0.07],
      { bone: hand, color: basaltPaint },
    );
    glow(
      b.spike([s * 1.06, 0.56, 0.22], [0, -1, 0.3], 0.08, 0.03, {
        bone: hand,
        color: LAVA_CORE,
      }),
      2.4,
    );

    // Digit 3: Pinky finger
    b.frustumBox(
      [s * 0.95, 0.74, 0.1],
      [s * 0.93, 0.58, 0.14],
      [0.08, 0.08],
      [0.06, 0.06],
      { bone: hand, color: basaltPaint },
    );
    glow(
      b.spike([s * 0.93, 0.58, 0.14], [0, -1, 0.2], 0.07, 0.026, {
        bone: hand,
        color: LAVA_CORE,
      }),
      2.4,
    );
  }

  // ---------------------------------------------------------------------------
  // 5. WAIST, MOLTEN GIRDLE & ARMORED TASSETS
  // ---------------------------------------------------------------------------

  // Central Pelvis Core Box
  b.frustumBox([0, 1.34, -0.04], [0, 1.18, -0.04], [0.46, 0.28], [0.38, 0.26], {
    bone: hips,
    color: basaltPaint,
  });

  // Molten Magma Waist Ring (The Girdle)
  glow(
    b.part(new THREE.TorusGeometry(0.26, 0.032, 8, 24), LAVA_HOT, {
      bone: hips,
      at: [0, 1.32, -0.04],
      dir: [0, 1, 0],
    }),
    2.2,
  );

  // Ancient Bronze Belt Plate Overlay
  b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 12, 1, true), bronzePaint, {
    bone: hips,
    at: [0, 1.32, -0.04],
  });
  // Bronze Belt Buckle / Center Ingot
  b.part(new THREE.BoxGeometry(0.14, 0.11, 0.06), bronzePaint, {
    bone: hips,
    at: [0, 1.32, 0.22],
  });
  glow(
    b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", {
      bone: hips,
      at: [0, 1.32, 0.252],
      dir: [0, 0, 1],
      axis: "z",
      texture: PYRO_EMBLEM_TEX,
    }),
    1.6,
  );

  // Hanging Tassets / Faulds (Armored Skirt Plates)
  // Front Center Tasset
  b.frustumBox([0, 1.28, 0.2], [0, 1.04, 0.24], [0.22, 0.06], [0.14, 0.04], {
    bone: hips,
    color: basaltPaint,
  });
  glow(
    b.part(new THREE.PlaneGeometry(0.14, 0.16), "#ffffff", {
      bone: hips,
      at: [0, 1.15, 0.24],
      dir: [0, 0, 1],
      axis: "z",
      texture: MAGMA_CRACK_TEX,
    }),
    1.8,
  );

  // Side Hip Tassets (L & R)
  for (const s of [1, -1]) {
    b.frustumBox(
      [s * 0.28, 1.3, -0.04],
      [s * 0.38, 1.08, -0.04],
      [0.08, 0.28],
      [0.06, 0.2],
      { bone: hips, color: basaltPaint },
    );
    // Molten seam between hip tasset and pelvis
    glow(
      b.part(new THREE.BoxGeometry(0.02, 0.18, 0.14), LAVA_HOT, {
        bone: hips,
        at: [s * 0.27, 1.18, -0.04],
      }),
      2.0,
    );
  }

  // Rear Rump Guard Plate
  b.frustumBox([0, 1.28, -0.18], [0, 1.08, -0.22], [0.36, 0.06], [0.26, 0.04], {
    bone: hips,
    color: basaltPaint,
  });

  // ---------------------------------------------------------------------------
  // 6. LEGS, KNEE COPS & TRIPOD BASALT FEET
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const { hip, knee, ankle, foot, toe } = legJoints[side];

    // Hip socket sphere
    b.part(new THREE.SphereGeometry(0.14, 12, 10), basaltPaint, {
      bone: hip,
      at: [s * 0.25, 1.18, -0.02],
    });

    // Thigh (Hexagonal columnar basalt)
    b.frustumBox(
      [s * 0.26, 1.14, -0.02],
      [s * 0.3, 0.78, 0.06],
      [0.26, 0.26],
      [0.22, 0.22],
      { bone: hip, color: basaltPaint },
    );
    // Front vertical molten seam down thigh
    glow(
      b.part(new THREE.BoxGeometry(0.035, 0.26, 0.03), LAVA_HOT, {
        bone: hip,
        at: [s * 0.29, 0.94, 0.14],
      }),
      2.0,
    );
    // Bronze thigh reinforcing clamp
    b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.06, 10), bronzePaint, {
      bone: hip,
      at: [s * 0.28, 0.92, 0.03],
      dir: [s * 0.04, -0.36, 0.08],
    });

    // KNEE COP (Projecting diamond basalt shield)
    b.part(new THREE.BoxGeometry(0.18, 0.2, 0.14), basaltPaint, {
      bone: knee,
      at: [s * 0.3, 0.74, 0.16],
      rotation: [s * -15, 0, 0],
    });
    // Glowing lava rim framing the knee cop
    glow(
      b.part(new THREE.BoxGeometry(0.2, 0.22, 0.02), LAVA_BRIGHT, {
        bone: knee,
        at: [s * 0.3, 0.74, 0.09],
      }),
      2.2,
    );
    // Knee bronze stud
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 8), bronzePaint, {
      bone: knee,
      at: [s * 0.3, 0.74, 0.24],
      dir: [0, 0, 1],
    });

    // Shin & Calf Column
    b.frustumBox(
      [s * 0.3, 0.7, 0.06],
      [s * 0.32, 0.28, -0.04],
      [0.24, 0.24],
      [0.28, 0.26],
      { bone: knee, color: basaltPaint },
    );
    // Front shin armor plate
    b.part(new THREE.BoxGeometry(0.14, 0.32, 0.08), basaltPaint, {
      bone: knee,
      at: [s * 0.31, 0.48, 0.12],
    });
    // Rear calf cooling vents (3 horizontal glowing louvers)
    for (let v = 0; v < 3; v++) {
      glow(
        b.part(new THREE.BoxGeometry(0.12, 0.016, 0.02), LAVA_HOT, {
          bone: knee,
          at: [s * 0.31, 0.44 + v * 0.07, -0.16],
        }),
        2.0,
      );
    }

    // Ankle joint hub
    b.part(new THREE.SphereGeometry(0.14, 10, 8), basaltPaint, {
      bone: ankle,
      at: [s * 0.32, 0.26, -0.05],
    });
    glow(
      b.part(new THREE.TorusGeometry(0.146, 0.018, 8, 16), LAVA_HOT, {
        bone: ankle,
        at: [s * 0.32, 0.26, -0.05],
        dir: [0, 1, 0],
      }),
      2.0,
    );

    // TRIPOD BASALT FEET (Firm ground contact at y = 0)
    // Foot main ankle block
    b.frustumBox(
      [s * 0.33, 0.24, -0.04],
      [s * 0.33, 0.08, 0.12],
      [0.28, 0.22],
      [0.34, 0.3],
      { bone: foot, color: basaltPaint },
    );
    // Rear heel spur (rock-solid stability block extending back)
    b.frustumBox(
      [s * 0.33, 0.12, -0.08],
      [s * 0.33, 0.03, -0.22],
      [0.2, 0.14],
      [0.18, 0.06],
      { bone: foot, color: basaltPaint },
    );

    // Front/Side 3 Claws/Toes
    // Center main toe
    b.frustumBox(
      [s * 0.34, 0.08, 0.22],
      [s * 0.34, 0.03, 0.38],
      [0.14, 0.08],
      [0.1, 0.05],
      { bone: toe, color: basaltPaint },
    );
    // Inner toe
    b.frustumBox(
      [s * 0.24, 0.08, 0.18],
      [s * 0.21, 0.03, 0.34],
      [0.11, 0.08],
      [0.08, 0.05],
      { bone: toe, color: basaltPaint },
    );
    // Outer toe
    b.frustumBox(
      [s * 0.44, 0.08, 0.18],
      [s * 0.47, 0.03, 0.34],
      [0.11, 0.08],
      [0.08, 0.05],
      { bone: toe, color: basaltPaint },
    );

    // Glowing molten seams between toes and foot base
    glow(
      b.part(new THREE.BoxGeometry(0.3, 0.016, 0.03), LAVA_BRIGHT, {
        bone: foot,
        at: [s * 0.34, 0.04, 0.2],
      }),
      2.2,
    );
  }

  // ---------------------------------------------------------------------------
  // 7. VOLCANIC CRAG STAGED BASE, LAVA FISSURES & FLOATING PYRO EMBERS
  // ---------------------------------------------------------------------------

  // Primary Stepped Hexagonal Basalt Arena Platform
  b.part(new THREE.CylinderGeometry(1.28, 1.34, 0.08, 12), basaltPaint, {
    bone: hips,
    at: [0, 0.04, 0.05],
  });
  // Upper stepped cracked crust platform
  b.part(new THREE.CylinderGeometry(1.08, 1.14, 0.04, 10), basaltPaint, {
    bone: hips,
    at: [0, 0.08, 0.05],
  });

  // Active Glowing Molten Lava Fissure Channels on the ground
  // Channel 1: Main diagonal molten crack beneath golem
  const lavaPath1 = catmull([
    [-0.92, 0.082, -0.68],
    [-0.45, 0.084, -0.22],
    [0.05, 0.085, 0.15],
    [0.55, 0.084, 0.48],
    [1.02, 0.082, 0.78],
  ]);
  glow(
    b.sweep(lavaPath1, (t: number) => 0.09 * (1 - 0.3 * Math.sin(t * Math.PI)), {
      bone: hips,
      color: LAVA_HOT,
    }),
    2.2,
  );
  // Channel 1 hot white core line
  glow(
    b.sweep(lavaPath1, 0.024, {
      bone: hips,
      color: LAVA_CORE,
    }),
    2.8,
  );

  // Channel 2: Branching left fissure
  const lavaPath2 = catmull([
    [-0.45, 0.084, -0.22],
    [-0.72, 0.083, 0.25],
    [-1.05, 0.082, 0.52],
  ]);
  glow(
    b.sweep(lavaPath2, 0.065, {
      bone: hips,
      color: LAVA_DEEP,
    }),
    2.0,
  );
  glow(
    b.sweep(lavaPath2, 0.016, {
      bone: hips,
      color: LAVA_BRIGHT,
    }),
    2.5,
  );

  // Channel 3: Branching right fissure
  const lavaPath3 = catmull([
    [0.05, 0.085, 0.15],
    [0.48, 0.083, -0.26],
    [0.86, 0.082, -0.58],
  ]);
  glow(
    b.sweep(lavaPath3, 0.065, {
      bone: hips,
      color: LAVA_DEEP,
    }),
    2.0,
  );
  glow(
    b.sweep(lavaPath3, 0.016, {
      bone: hips,
      color: LAVA_BRIGHT,
    }),
    2.5,
  );

  // Jagged Obsidian Spires & Volcanic Crystals emerging around the perimeter
  const crystalAngles = [0, 42, 88, 136, 178, 222, 268, 314];
  crystalAngles.forEach((deg, idx) => {
    const rad = (deg * Math.PI) / 180;
    const dist = 0.95 + (idx % 3) * 0.12;
    const cX = Math.cos(rad) * dist;
    const cZ = 0.05 + Math.sin(rad) * dist;
    const cHeight = 0.24 + (idx % 4) * 0.08;
    const leanDir: [number, number, number] = [
      Math.cos(rad) * 0.4,
      1.0,
      Math.sin(rad) * 0.4,
    ];
    // Obsidian base pillar
    b.spike([cX, 0.08, cZ], leanDir, cHeight, 0.045, {
      bone: hips,
      color: OBSIDIAN_CRYSTAL,
    });
    // Glowing molten tip
    glow(
      b.spike(offset([cX, 0.08, cZ], leanDir, cHeight * 0.7), leanDir, cHeight * 0.35, 0.024, {
        bone: hips,
        color: LAVA_HOT,
      }),
      2.2,
    );
  });

  // Floating Pyro Sparks & Embers (Drifting upwards from volcanic heat)
  const emberFrames = [];
  const numEmbers = 38;
  for (let i = 0; i < numEmbers; i++) {
    // Generate scattered points around the lava fissures
    const tVal = random();
    const branchChoice = random();
    const basePath = branchChoice < 0.55 ? lavaPath1 : branchChoice < 0.8 ? lavaPath2 : lavaPath3;
    const basePt = basePath.at(tVal);
    const yFloat = 0.16 + random() * 1.6;
    const xDrift = (random() - 0.5) * 0.3;
    const zDrift = (random() - 0.5) * 0.3;
    emberFrames.push(
      frame([basePt.x + xDrift, yFloat, basePt.z + zDrift], [0, 1, 0]),
    );
  }

  // Cards with glowing ember sparks
  glow(
    b.cards(emberFrames, EMBER_TEX, {
      size: [0.06, 0.1],
      cross: true,
      lean: 15,
      bend: 20,
      vary: 0.35,
      rng: rng(42),
      bone: hips,
    }),
    2.2,
  );

  return b.root;
}
