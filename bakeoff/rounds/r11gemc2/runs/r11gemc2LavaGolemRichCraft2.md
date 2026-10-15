Here is the complete rewrite of the Lava Golem.

### Key improvements made:
1. **Fixed Floating & Loose Parts**: Eliminated the floating chest sweeps and misaligned chimney sparks by anchoring all molten veins, vents, and conduits directly into the geometry of the basalt plates.
2. **Fixed Washed-Out Glow & Colors**: Replaced the desaturated pastel pinks with deep, vibrant Genshin Pyro elemental hues (`#800a00`, `#e63000`, `#ff6e00`, `#ffb800`, and `#fffadb`) and tuned `glow` strength to 1.0–1.2 to preserve rich, fiery saturation.
3. **Imposing Genshin Lawachurl / Ruin Grader Silhouette**: Redesigned the stance with a hunched, predatory center of gravity, heavy forward-thrust chest, massive stepped pauldrons, wide braced columnar legs, and titanic crusher gauntlets.
4. **Heroic Recessed Pyro Crucible Heart**: Carved a deep diamond furnace chamber in the center of the chest, protected by four bronze containment claws and enclosing an incandescent multi-layered Pyro core and gimbal ring.
5. **Menacing Mask & Sweeping Obsidian Horns**: Rebuilt the cranium with an angular Lawachurl-style basalt war-mask, deep-set Natlan optic eye, hinged roaring maw with obsidian fangs, and sweeping multi-banded volcanic horns with glowing crest edges.
6. **Volcanic Caldera Arena Base**: Replaced the flat striped disc with a stepped basalt platform cut with glowing branched magma fissures, perimeter obsidian crags, and orbiting Pyro elemental crystal motes.

```ts
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
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Genshin Lava Golem",
  description:
    "A colossal Genshin Impact Pyro elemental lava golem forged from interlocking chiseled basalt plates, radiant molten seams, ancient Natlan forge-bronze filigree, and an incandescent crucible heart.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "genshin_lava_golem", paintSize: 2048 });
  const random = rng(999);

  // ---------------------------------------------------------------------------
  // COLOR PALETTE (Vibrant Genshin Pyro / Natlan Volcanic)
  // ---------------------------------------------------------------------------
  const BASALT_DARK = "#120f18"; // Deepest obsidian shadow
  const BASALT_MID = "#251e2e"; // Chiseled volcanic armor body
  const BASALT_LIGHT = "#3d334a"; // Beveled plate edge highlight
  const STONE_CRUST = "#42322a"; // Scorched rock mineral tone
  const BRONZE_DARK = "#54350c"; // Antique bronze shadow
  const BRONZE_MID = "#ad731f"; // Natlan forge gold-bronze
  const BRONZE_LIGHT = "#f5c358"; // Polished filigree & studs
  const OBSIDIAN_GLASS = "#0c0a12"; // Razor-sharp volcanic glass

  // Pure Pyro Elemental Spectrum (Kept saturated without blowing out to pastel pink)
  const LAVA_CRUST = "#800a00"; // Deep burning magma underlayer
  const LAVA_HOT = "#e63000"; // Primary saturated Pyro fire
  const LAVA_BRIGHT = "#ff6e00"; // Brilliant thermal orange
  const LAVA_GOLD = "#ffb800"; // Radiant yellow molten river
  const LAVA_CORE = "#fffadb"; // Incandescent white-gold core

  // ---------------------------------------------------------------------------
  // TEXTURES (Genshin elemental runes & craft)
  // ---------------------------------------------------------------------------

  // 1. Natlan Pyro Medallion (Center Gorget & Belt Buckle)
  const PYRO_EMBLEM_TEX = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="flameGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fffadb"/>
          <stop offset="25%" stop-color="#ffb800"/>
          <stop offset="65%" stop-color="#e63000"/>
          <stop offset="100%" stop-color="#700900"/>
        </radialGradient>
      </defs>
      <polygon points="64,6 122,64 64,122 6,64" fill="#18131f" stroke="#f5c358" stroke-width="6"/>
      <polygon points="64,18 110,64 64,110 18,64" fill="none" stroke="#ad731f" stroke-width="3"/>
      <path d="M64 26 C76 46 98 56 98 80 C98 96 82 106 64 106 C46 106 30 96 30 80 C30 56 52 46 64 26 Z" fill="url(#flameGrad)"/>
      <path d="M64 46 C70 56 84 66 84 80 C84 90 74 96 64 96 C54 96 44 90 44 80 C44 66 58 56 64 46 Z" fill="#fff6a8"/>
      <polygon points="64,62 72,74 64,86 56,74" fill="#c41800"/>
      <polygon points="64,68 68,74 64,80 60,74" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  // 2. Ruin Machine Cyclopean Optic Eye
  const GOLEM_EYE_TEX = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="opticG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="20%" stop-color="#fff8b0"/>
          <stop offset="55%" stop-color="#ff6e00"/>
          <stop offset="100%" stop-color="#800a00"/>
        </radialGradient>
      </defs>
      <rect width="128" height="128" fill="#141019"/>
      <circle cx="64" cy="64" r="58" fill="none" stroke="#f5c358" stroke-width="5"/>
      <circle cx="64" cy="64" r="48" fill="none" stroke="#ff6e00" stroke-width="3" stroke-dasharray="10 6"/>
      <circle cx="64" cy="64" r="40" fill="url(#opticG)"/>
      <polygon points="64,22 72,56 106,64 72,72 64,106 56,72 22,64 56,56" fill="#ffffff"/>
      <circle cx="64" cy="64" r="7" fill="#e63000"/>
    </svg>`,
    { size: 256 },
  );

  // 3. Ancient Natlan Border Trim (Armor Plate Runic Filigree)
  const RUNIC_TRIM_TEX = svg(
    `<svg viewBox="0 0 256 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="64" fill="#1b1522"/>
      <line x1="0" y1="4" x2="256" y2="4" stroke="#f5c358" stroke-width="5"/>
      <line x1="0" y1="60" x2="256" y2="60" stroke="#f5c358" stroke-width="5"/>
      <g fill="none" stroke="#f5c358" stroke-width="3.5" stroke-linecap="square">
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

  // 4. Stylized Chimney Spark Plume
  const SPARK_PLUME_TEX = svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="plumeG" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#e63000" stop-opacity="0.95"/>
          <stop offset="45%" stop-color="#ffb800" stop-opacity="0.9"/>
          <stop offset="85%" stop-color="#fffadb" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="M32 124 C18 100 8 72 16 44 C22 24 32 4 32 4 C32 4 42 24 48 44 C56 72 46 100 32 124 Z" fill="url(#plumeG)"/>
      <polygon points="32,20 38,44 42,66 32,84 22,66 26,44" fill="#ffffff" opacity="0.85"/>
      <polygon points="32,38 35,50 38,62 32,70 26,62 29,50" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------------------
  // PROCEDURAL PAINTS
  // ---------------------------------------------------------------------------
  const basaltPaint = paint((p, n) => {
    const v = noise(p, 0.2, 42);
    const fine = noise(p, 0.05, 111);
    const up = smoothstep(0.15, 0.85, n.y);
    const stone = mix(BASALT_MID, BASALT_DARK, smoothstep(0.35, 0.7, v));
    const dusty = mix(stone, STONE_CRUST, fine * 0.25);
    return mix(dusty, BASALT_LIGHT, up * 0.38);
  });

  const bronzePaint = paint((p, n) => {
    const v = noise(p, 0.1, 77);
    const highlight = smoothstep(0.3, 0.9, n.y);
    const baseMetal = mix(BRONZE_DARK, BRONZE_MID, smoothstep(0.25, 0.65, v));
    return mix(baseMetal, BRONZE_LIGHT, highlight * 0.45);
  });

  // ---------------------------------------------------------------------------
  // SKELETON (Menacing, hunched Lawachurl / Ruin Grader power pose)
  // ---------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 1.10, -0.06] });
  const spine1 = b.joint("spine1", { parent: hips, at: [0, 1.32, 0.0], role: "spine" });
  const chest = b.joint("chest", { parent: spine1, at: [0, 1.58, 0.10], role: "spine" });

  const neck = b.joint("neck", { parent: chest, at: [0, 1.84, 0.22], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.96, 0.36], dir: [0, -0.1, 0.98], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.86, 0.42], dir: [0, -0.22, 0.92], role: "jaw" });

  const armJoints: Record<string, { clavicle: any; shoulder: any; elbow: any; wrist: any; hand: any }> = {};
  const legJoints: Record<string, { hip: any; knee: any; ankle: any; foot: any; toe: any }> = {};

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    const clavicle = b.joint(`clavicle${side}`, {
      parent: chest,
      at: [s * 0.28, 1.74, 0.12],
      role: "arm",
    });
    const shoulder = b.joint(`shoulder${side}`, {
      parent: clavicle,
      at: [s * 0.64, 1.66, 0.08],
      role: "arm",
    });
    const elbow = b.joint(`elbow${side}`, {
      parent: shoulder,
      at: [s * 0.88, 1.28, 0.18],
      role: "arm",
    });
    const wrist = b.joint(`wrist${side}`, {
      parent: elbow,
      at: [s * 0.94, 0.86, 0.38],
      role: "arm",
    });
    const hand = b.joint(`hand${side}`, {
      parent: wrist,
      at: [s * 0.98, 0.58, 0.46],
      role: "arm",
    });

    b.joint(`thumb${side}`, { parent: hand, at: [s * 1.06, 0.52, 0.54], role: "digit" });
    b.joint(`index${side}`, { parent: hand, at: [s * 1.0, 0.38, 0.52], role: "digit" });
    b.joint(`pinky${side}`, { parent: hand, at: [s * 0.88, 0.40, 0.44], role: "digit" });

    armJoints[side] = { clavicle, shoulder, elbow, wrist, hand };

    const hip = b.joint(`hip${side}`, {
      parent: hips,
      at: [s * 0.34, 1.02, -0.06],
      role: "leg",
    });
    const knee = b.joint(`knee${side}`, {
      parent: hip,
      at: [s * 0.40, 0.60, 0.12],
      role: "leg",
    });
    const ankle = b.joint(`ankle${side}`, {
      parent: knee,
      at: [s * 0.44, 0.22, -0.04],
      role: "leg",
    });
    const foot = b.joint(`foot${side}`, {
      parent: ankle,
      at: [s * 0.46, 0.06, 0.12],
      role: "leg",
    });
    const toe = b.joint(`toe${side}`, {
      parent: foot,
      at: [s * 0.46, 0.03, 0.32],
      role: "digit",
    });

    legJoints[side] = { hip, knee, ankle, foot, toe };
  }

  // ---------------------------------------------------------------------------
  // 1. TORSO: SOLID INTERLOCKING BASALT & RECESSED PYRO CRUCIBLE CORE
  // ---------------------------------------------------------------------------

  // Inner Molten Magma Core Body (Everything glows from inside the gaps!)
  glow(
    b.part(new THREE.BoxGeometry(0.56, 0.54, 0.36), LAVA_HOT, {
      bone: chest,
      at: [0, 1.54, 0.08],
    }),
    1.1,
  );

  // Abdominal Columnar Basalt Slabs
  b.frustumBox([0, 1.16, -0.04], [0, 1.42, 0.02], [0.52, 0.34], [0.60, 0.38], {
    bone: spine1,
    color: basaltPaint,
  });

  // Front Abdominal Armor Plates (Interlocking with recessed horizontal magma vents)
  for (let a = 0; a < 2; a++) {
    const yA = 1.22 + a * 0.14;
    // Left & Right abdominal armor tiles
    for (const s of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.22, 0.10, 0.08), basaltPaint, {
        bone: spine1,
        at: [s * 0.14, yA, 0.20],
        rotation: [0, s * -12, 0],
      });
    }
    // Deep glowing thermal vent between plates
    glow(
      b.part(new THREE.BoxGeometry(0.42, 0.025, 0.06), LAVA_GOLD, {
        bone: spine1,
        at: [0, yA + 0.06, 0.18],
      }),
      1.2,
    );
  }

  // Back Carapace: Heavy dorsal armor plates
  for (let i = 0; i < 3; i++) {
    const yP = 1.70 - i * 0.18;
    b.frustumBox([0, yP, -0.12], [0, yP - 0.08, -0.18], [0.58 - i * 0.06, 0.14], [0.48 - i * 0.06, 0.12], {
      bone: chest,
      color: basaltPaint,
    });
    // Embedded molten seam between dorsal plates
    glow(
      b.part(new THREE.BoxGeometry(0.44 - i * 0.06, 0.03, 0.06), LAVA_HOT, {
        bone: chest,
        at: [0, yP - 0.05, -0.16],
      }),
      1.1,
    );
    // Sharp dorsal obsidian spine fin
    b.spike([0, yP, -0.18], [0, 0.3, -0.95], 0.20 - i * 0.02, 0.045, {
      bone: chest,
      color: OBSIDIAN_GLASS,
    });
  }

  // THE RECESSED PYRO CRUCIBLE CORE (Sunken deep inside the chest diamond chamber)
  const corePos: [number, number, number] = [0, 1.58, 0.12];

  // Deep furnace cavity backing
  b.part(new THREE.CylinderGeometry(0.24, 0.24, 0.12, 12), basaltPaint, {
    bone: chest,
    at: [0, 1.58, 0.08],
    dir: [0, 0, 1],
  });

  // Radiant Pyro Crucible Nucleus
  glow(
    b.part(new THREE.IcosahedronGeometry(0.12, 1), LAVA_CORE, {
      bone: chest,
      at: corePos,
    }),
    1.2,
  );
  glow(
    b.part(new THREE.DodecahedronGeometry(0.15, 0), LAVA_GOLD, {
      bone: chest,
      at: corePos,
    }),
    1.1,
  );
  glow(
    b.part(new THREE.TorusGeometry(0.18, 0.022, 8, 20), LAVA_HOT, {
      bone: chest,
      at: corePos,
      dir: [0, 0, 1],
    }),
    1.2,
  );

  // 4 Ancient Bronze Containment Claws framing the Core
  for (let c = 0; c < 4; c++) {
    const angle = (c * Math.PI) / 2 + Math.PI / 4;
    const clawBase: [number, number, number] = [
      Math.cos(angle) * 0.25,
      1.58 + Math.sin(angle) * 0.25,
      0.08,
    ];
    const clawTip: [number, number, number] = [
      Math.cos(angle) * 0.17,
      1.58 + Math.sin(angle) * 0.17,
      0.22,
    ];
    b.sweep(catmull([clawBase, [Math.cos(angle) * 0.22, 1.58 + Math.sin(angle) * 0.22, 0.18], clawTip]), [0.038, 0.016], {
      bone: chest,
      color: bronzePaint,
    });
    glow(
      b.part(new THREE.SphereGeometry(0.018, 8, 8), LAVA_CORE, {
        bone: chest,
        at: clawTip,
      }),
      1.2,
    );
  }

  // Giant Chiseled Pectoral Basalt Slabs framing the Core Aperture
  for (const s of [1, -1]) {
    // Main pectoral armor block (angled inward)
    b.frustumBox(
      [s * 0.18, 1.48, 0.14],
      [s * 0.44, 1.76, 0.10],
      [0.30, 0.22],
      [0.26, 0.18],
      { bone: chest, color: basaltPaint },
    );

    // Collar guard plate
    b.part(new THREE.BoxGeometry(0.24, 0.12, 0.18), basaltPaint, {
      bone: chest,
      at: [s * 0.30, 1.82, 0.12],
      rotation: [0, s * -15, s * 10],
    });

    // Sunken 3D Molten Fissure Channel set into the pectoral seam (recessed, no floating!)
    const pecFissure = catmull([
      [s * 0.16, 1.52, 0.21],
      [s * 0.26, 1.62, 0.21],
      [s * 0.36, 1.70, 0.18],
    ]);
    glow(
      b.sweep(pecFissure, 0.022, {
        bone: chest,
        color: LAVA_HOT,
      }),
      1.1,
    );
    glow(
      b.sweep(pecFissure, 0.008, {
        bone: chest,
        color: LAVA_CORE,
      }),
      1.2,
    );

    // Bronze structural corner rivets
    b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.025, 8), bronzePaint, {
      bone: chest,
      at: [s * 0.40, 1.76, 0.18],
      dir: [0, 0, 1],
    });
    b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.025, 8), bronzePaint, {
      bone: chest,
      at: [s * 0.16, 1.44, 0.20],
      dir: [0, 0, 1],
    });
  }

  // Upper Gorget & Natlan Pyro Medallion (Mounted securely on collar)
  b.part(new THREE.BoxGeometry(0.24, 0.12, 0.12), bronzePaint, {
    bone: chest,
    at: [0, 1.80, 0.22],
  });
  glow(
    b.part(new THREE.PlaneGeometry(0.14, 0.14), "#ffffff", {
      bone: chest,
      at: [0, 1.80, 0.282],
      dir: [0, 0, 1],
      axis: "z",
      texture: PYRO_EMBLEM_TEX,
    }),
    1.1,
  );

  // ---------------------------------------------------------------------------
  // 2. TWIN VOLCANIC CHIMNEYS & ATTACHED SPARK PLUMES
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const chimneyBase: [number, number, number] = [s * 0.26, 1.84, -0.14];
    const chimneyDir: [number, number, number] = [s * 0.16, 0.86, -0.32];

    // Main conical vent body
    b.sweep(
      catmull([
        chimneyBase,
        offset(chimneyBase, chimneyDir, 0.14),
        offset(chimneyBase, chimneyDir, 0.28),
      ]),
      [0.095, 0.075],
      { bone: chest, color: basaltPaint },
    );

    // Bronze support collar band
    b.sweep(
      catmull([
        offset(chimneyBase, chimneyDir, 0.12),
        offset(chimneyBase, chimneyDir, 0.20),
      ]),
      0.10,
      { bone: chest, color: bronzePaint },
    );

    // Incandescent molten pool inside chimney mouth
    const mouthPt = offset(chimneyBase, chimneyDir, 0.29);
    glow(
      b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.025, 10), LAVA_CORE, {
        bone: chest,
        at: mouthPt,
        dir: chimneyDir,
      }),
      1.2,
    );

    // Securely attached stylized spark plume (directly rooted at mouth, no gap!)
    glow(
      b.part(new THREE.PlaneGeometry(0.14, 0.26), "#ffffff", {
        bone: chest,
        at: offset(mouthPt, chimneyDir, 0.13),
        dir: chimneyDir,
        axis: "z",
        texture: SPARK_PLUME_TEX,
      }),
      1.2,
    );
  }

  // ---------------------------------------------------------------------------
  // 3. HEAD, CYCLOPEAN VISOR, ROARING JAW & GREAT BASALT HORNS
  // ---------------------------------------------------------------------------

  // Thick armored neck with molten conduit channels
  b.sweep(catmull([[0, 1.76, 0.14], [0, 1.90, 0.24]]), [0.18, 0.16], {
    bone: neck,
    color: basaltPaint,
  });
  for (const s of [1, -1]) {
    glow(
      b.sweep(
        catmull([
          [s * 0.12, 1.76, 0.24],
          [s * 0.10, 1.86, 0.30],
          [s * 0.08, 1.96, 0.36],
        ]),
        0.024,
        { bone: neck, color: LAVA_HOT },
      ),
      1.1,
    );
  }

  // Main Cranium Armor Shell
  b.frustumBox([0, 1.90, 0.22], [0, 2.14, 0.38], [0.38, 0.28], [0.32, 0.24], {
    bone: head,
    color: basaltPaint,
  });

  // Beveled temple & cheek plates
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.14, 0.20, 0.24), basaltPaint, {
      bone: head,
      at: [s * 0.20, 1.98, 0.34],
      rotation: [0, s * -20, 0],
    });
  }

  // Forehead Obsidian Crown Spike
  b.spike([0, 2.14, 0.38], [0, 0.45, 0.88], 0.18, 0.05, {
    bone: head,
    color: OBSIDIAN_GLASS,
  });

  // Bronze forehead brow visor
  b.part(new THREE.BoxGeometry(0.30, 0.08, 0.12), bronzePaint, {
    bone: head,
    at: [0, 2.08, 0.44],
  });

  // CYCLOPEAN GOLEM OPTICAL CORE (Deeply recessed socket)
  b.part(new THREE.CylinderGeometry(0.095, 0.095, 0.035, 12), bronzePaint, {
    bone: head,
    at: [0, 2.00, 0.45],
    dir: [0, 0, 1],
  });
  glow(
    b.part(new THREE.CircleGeometry(0.086, 16), "#ffffff", {
      bone: head,
      at: [0, 2.00, 0.47],
      dir: [0, 0, 1],
      axis: "z",
      texture: GOLEM_EYE_TEX,
    }),
    1.2,
  );

  // Auxiliary molten eye slits
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.BoxGeometry(0.065, 0.016, 0.02), LAVA_BRIGHT, {
        bone: head,
        at: [s * 0.10, 2.06, 0.44],
        rotation: [0, 0, s * 22],
      }),
      1.1,
    );
  }

  // Movable Lower Jaw & Roaring Maw
  b.frustumBox([0, 1.86, 0.30], [0, 1.82, 0.48], [0.30, 0.14], [0.24, 0.10], {
    bone: jaw,
    color: basaltPaint,
  });

  // Burning throat furnace pool inside the mouth
  glow(
    b.part(new THREE.BoxGeometry(0.20, 0.025, 0.16), LAVA_HOT, {
      bone: jaw,
      at: [0, 1.90, 0.38],
    }),
    1.2,
  );

  // Rocky Fangs
  for (const s of [1, -1]) {
    b.spike([s * 0.07, 1.90, 0.45], [0, 1, 0], 0.05, 0.016, {
      bone: jaw,
      color: BASALT_LIGHT,
    });
    b.spike([s * 0.03, 1.90, 0.46], [0, 1, 0], 0.055, 0.017, {
      bone: jaw,
      color: BASALT_LIGHT,
    });
    b.spike([s * 0.08, 1.96, 0.43], [0, -1, 0], 0.05, 0.016, {
      bone: head,
      color: BASALT_LIGHT,
    });
  }

  // GREAT BASALT HORNS (Sweeping curved volcanic horns)
  for (const s of [1, -1]) {
    const hornStart: [number, number, number] = [s * 0.16, 2.06, 0.28];
    const hornMid1: [number, number, number] = [s * 0.42, 2.24, 0.14];
    const hornMid2: [number, number, number] = [s * 0.58, 2.42, -0.06];
    const hornTip: [number, number, number] = [s * 0.50, 2.62, -0.02];

    const hornPath = catmull([hornStart, hornMid1, hornMid2, hornTip]);

    // Main horn basalt sweep
    b.sweep(hornPath, (t: number) => 0.09 * (1 - 0.82 * t) + 0.01, {
      bone: head,
      color: basaltPaint,
    });

    // Bronze collar bands along horns
    b.sweep(catmull([hornPath.at(0.20), hornPath.at(0.28)]), 0.082, {
      bone: head,
      color: bronzePaint,
    });
    b.sweep(catmull([hornPath.at(0.52), hornPath.at(0.60)]), 0.052, {
      bone: head,
      color: bronzePaint,
    });

    // Fiery glowing molten crest line embedded along the horn
    glow(
      b.sweep(catmull([hornPath.at(0.36), hornPath.at(0.46)]), 0.068, {
        bone: head,
        color: LAVA_HOT,
      }),
      1.1,
    );
    glow(
      b.sweep(catmull([hornPath.at(0.76), hornPath.at(1.0)]), [0.032, 0.008], {
        bone: head,
        color: LAVA_CORE,
      }),
      1.2,
    );

    // Brow horn spikes jutting forward
    b.spike([s * 0.14, 2.12, 0.44], [s * 0.38, 0.45, 0.80], 0.12, 0.03, {
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
        [s * 0.28, 1.74, 0.12],
        [s * 0.56, 1.68, 0.08],
      ]),
      0.10,
      { bone: clavicle, color: bronzePaint },
    );

    // GIANT TIERED BASALT PAULDRON
    b.frustumBox(
      [s * 0.48, 1.78, 0.06],
      [s * 0.80, 1.70, 0.02],
      [0.36, 0.30],
      [0.44, 0.36],
      { bone: shoulder, color: basaltPaint },
    );

    // Beveled upper crest plate
    b.part(new THREE.BoxGeometry(0.34, 0.10, 0.32), basaltPaint, {
      bone: shoulder,
      at: [s * 0.66, 1.86, 0.04],
      rotation: [0, 0, s * -15],
    });

    // Embedded 3D molten fissure on pauldron front face (Flush, no floating!)
    const pauldronFissure = catmull([
      [s * 0.54, 1.66, 0.19],
      [s * 0.66, 1.76, 0.20],
      [s * 0.78, 1.84, 0.18],
    ]);
    glow(
      b.sweep(pauldronFissure, 0.020, {
        bone: shoulder,
        color: LAVA_HOT,
      }),
      1.1,
    );
    glow(
      b.sweep(pauldronFissure, 0.007, {
        bone: shoulder,
        color: LAVA_CORE,
      }),
      1.2,
    );

    // Runic Natlan trim plate on pauldron rim
    b.part(new THREE.PlaneGeometry(0.32, 0.08), "#ffffff", {
      bone: shoulder,
      at: [s * 0.66, 1.92, 0.18],
      dir: [0, 0.25, 0.96],
      axis: "z",
      texture: RUNIC_TRIM_TEX,
    });

    // Obsidian spires crowning pauldron crest
    b.spike([s * 0.70, 1.90, -0.04], [s * 0.22, 0.90, -0.10], 0.24, 0.045, {
      bone: shoulder,
      color: OBSIDIAN_GLASS,
    });
    b.spike([s * 0.78, 1.84, 0.06], [s * 0.32, 0.86, 0.10], 0.18, 0.036, {
      bone: shoulder,
      color: OBSIDIAN_GLASS,
    });

    // Upper Arm (Bicep/Tricep)
    b.sweep(
      catmull([
        [s * 0.60, 1.64, 0.08],
        [s * 0.84, 1.30, 0.16],
      ]),
      [0.16, 0.14],
      { bone: shoulder, color: basaltPaint },
    );

    // Molten conduit running down bicep
    glow(
      b.sweep(
        catmull([
          [s * 0.64, 1.60, 0.18],
          [s * 0.80, 1.36, 0.23],
        ]),
        0.024,
        { bone: shoulder, color: LAVA_HOT },
      ),
      1.1,
    );

    // Bronze bicep reinforcement cuff
    b.part(new THREE.CylinderGeometry(0.165, 0.165, 0.09, 12), bronzePaint, {
      bone: shoulder,
      at: [s * 0.72, 1.47, 0.12],
      dir: [s * 0.24, -0.34, 0.08],
    });

    // Elbow Joint (Spherical stone hub + glowing thermal torus)
    b.part(new THREE.SphereGeometry(0.14, 12, 10), basaltPaint, {
      bone: elbow,
      at: [s * 0.88, 1.28, 0.18],
    });
    glow(
      b.part(new THREE.TorusGeometry(0.148, 0.022, 8, 16), LAVA_HOT, {
        bone: elbow,
        at: [s * 0.88, 1.28, 0.18],
        dir: [s * 0.24, -0.34, 0.08],
      }),
      1.1,
    );
    // Rear elbow defense spike
    b.spike([s * 0.92, 1.28, 0.06], [s * 0.20, -0.20, -0.92], 0.16, 0.04, {
      bone: elbow,
      color: OBSIDIAN_GLASS,
    });

    // Forearm / Crusher Gauntlet
    b.frustumBox(
      [s * 0.88, 1.24, 0.20],
      [s * 0.94, 0.88, 0.36],
      [0.28, 0.26],
      [0.36, 0.32],
      { bone: elbow, color: basaltPaint },
    );

    // Heavy outer shield plate on gauntlet
    b.part(new THREE.BoxGeometry(0.11, 0.34, 0.26), basaltPaint, {
      bone: elbow,
      at: [s * 1.02, 1.06, 0.30],
      rotation: [0, 0, s * -15],
    });
    // Runic bronze trim on gauntlet ridge
    b.part(new THREE.PlaneGeometry(0.09, 0.30), "#ffffff", {
      bone: elbow,
      at: [s * 1.08, 1.06, 0.31],
      dir: [s * 1, 0, 0],
      axis: "z",
      texture: RUNIC_TRIM_TEX,
    });
    // Embedded central molten heat channel down forearm
    glow(
      b.part(new THREE.BoxGeometry(0.045, 0.30, 0.045), LAVA_HOT, {
        bone: elbow,
        at: [s * 0.90, 1.06, 0.44],
      }),
      1.1,
    );

    // Wrist Octagonal Cuff
    b.part(new THREE.CylinderGeometry(0.185, 0.195, 0.10, 8), bronzePaint, {
      bone: wrist,
      at: [s * 0.94, 0.86, 0.38],
      dir: [s * 0.12, -0.40, 0.18],
    });
    glow(
      b.part(new THREE.TorusGeometry(0.19, 0.018, 8, 16), LAVA_BRIGHT, {
        bone: wrist,
        at: [s * 0.94, 0.86, 0.38],
        dir: [s * 0.12, -0.40, 0.18],
      }),
      1.2,
    );

    // FIST & PALM
    b.frustumBox(
      [s * 0.94, 0.80, 0.40],
      [s * 1.00, 0.58, 0.50],
      [0.28, 0.22],
      [0.26, 0.20],
      { bone: hand, color: basaltPaint },
    );
    // Recessed circular magma furnace port on inner palm
    glow(
      b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.025, 12), LAVA_CORE, {
        bone: hand,
        at: [s * 0.96, 0.66, 0.52],
        dir: [s * -0.20, -0.30, 0.90],
      }),
      1.2,
    );

    // 3 Massive Crusher Claws
    // Digit 1: Thumb
    b.frustumBox(
      [s * 1.06, 0.58, 0.52],
      [s * 1.10, 0.46, 0.60],
      [0.09, 0.09],
      [0.07, 0.07],
      { bone: hand, color: basaltPaint },
    );
    glow(
      b.spike([s * 1.10, 0.46, 0.60], [0, -0.40, 0.88], 0.08, 0.03, {
        bone: hand,
        color: LAVA_CORE,
      }),
      1.2,
    );

    // Digit 2: Middle finger
    b.frustumBox(
      [s * 1.02, 0.56, 0.46],
      [s * 1.04, 0.38, 0.54],
      [0.10, 0.09],
      [0.08, 0.07],
      { bone: hand, color: basaltPaint },
    );
    glow(
      b.spike([s * 1.04, 0.38, 0.54], [0, -0.92, 0.38], 0.09, 0.032, {
        bone: hand,
        color: LAVA_CORE,
      }),
      1.2,
    );

    // Digit 3: Outer finger
    b.frustumBox(
      [s * 0.92, 0.56, 0.40],
      [s * 0.90, 0.40, 0.46],
      [0.09, 0.09],
      [0.07, 0.07],
      { bone: hand, color: basaltPaint },
    );
    glow(
      b.spike([s * 0.90, 0.40, 0.46], [0, -0.95, 0.28], 0.08, 0.028, {
        bone: hand,
        color: LAVA_CORE,
      }),
      1.2,
    );
  }

  // ---------------------------------------------------------------------------
  // 5. WAIST, MOLTEN GIRDLE & ARMORED TASSETS
  // ---------------------------------------------------------------------------

  // Central Pelvis Armor Box
  b.frustumBox([0, 1.20, -0.06], [0, 1.02, -0.06], [0.52, 0.32], [0.44, 0.30], {
    bone: hips,
    color: basaltPaint,
  });

  // Molten Magma Waist Ring (The Girdle)
  glow(
    b.part(new THREE.TorusGeometry(0.28, 0.035, 8, 24), LAVA_HOT, {
      bone: hips,
      at: [0, 1.18, -0.06],
      dir: [0, 1, 0],
    }),
    1.1,
  );

  // Ancient Bronze Belt Plate
  b.part(new THREE.CylinderGeometry(0.30, 0.30, 0.09, 12, 1, true), bronzePaint, {
    bone: hips,
    at: [0, 1.18, -0.06],
  });
  // Bronze Buckle Medallion
  b.part(new THREE.BoxGeometry(0.16, 0.12, 0.06), bronzePaint, {
    bone: hips,
    at: [0, 1.18, 0.24],
  });
  glow(
    b.part(new THREE.PlaneGeometry(0.11, 0.11), "#ffffff", {
      bone: hips,
      at: [0, 1.18, 0.272],
      dir: [0, 0, 1],
      axis: "z",
      texture: PYRO_EMBLEM_TEX,
    }),
    1.1,
  );

  // Hanging Armored Tassets / Faulds
  // Front Center Tasset
  b.frustumBox([0, 1.14, 0.22], [0, 0.88, 0.26], [0.24, 0.07], [0.16, 0.05], {
    bone: hips,
    color: basaltPaint,
  });
  glow(
    b.part(new THREE.BoxGeometry(0.04, 0.18, 0.04), LAVA_HOT, {
      bone: hips,
      at: [0, 1.00, 0.27],
    }),
    1.1,
  );

  // Side Hip Tassets (L & R)
  for (const s of [1, -1]) {
    b.frustumBox(
      [s * 0.30, 1.16, -0.06],
      [s * 0.42, 0.92, -0.06],
      [0.09, 0.32],
      [0.07, 0.24],
      { bone: hips, color: basaltPaint },
    );
    glow(
      b.part(new THREE.BoxGeometry(0.024, 0.20, 0.16), LAVA_HOT, {
        bone: hips,
        at: [s * 0.29, 1.04, -0.06],
      }),
      1.1,
    );
  }

  // Rear Rump Guard Plate
  b.frustumBox([0, 1.14, -0.22], [0, 0.92, -0.26], [0.42, 0.07], [0.32, 0.05], {
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
      at: [s * 0.34, 1.02, -0.06],
    });

    // Thigh (Columnar basalt pillar)
    b.frustumBox(
      [s * 0.35, 0.98, -0.05],
      [s * 0.39, 0.64, 0.08],
      [0.28, 0.28],
      [0.24, 0.24],
      { bone: hip, color: basaltPaint },
    );
    // Front vertical molten seam down thigh
    glow(
      b.part(new THREE.BoxGeometry(0.04, 0.28, 0.035), LAVA_HOT, {
        bone: hip,
        at: [s * 0.38, 0.80, 0.18],
      }),
      1.1,
    );
    // Bronze thigh reinforcing clamp
    b.part(new THREE.CylinderGeometry(0.155, 0.155, 0.07, 10), bronzePaint, {
      bone: hip,
      at: [s * 0.37, 0.78, 0.05],
      dir: [s * 0.05, -0.36, 0.08],
    });

    // KNEE COP (Projecting diamond basalt shield)
    b.part(new THREE.BoxGeometry(0.20, 0.22, 0.16), basaltPaint, {
      bone: knee,
      at: [s * 0.40, 0.60, 0.18],
      rotation: [s * -15, 0, 0],
    });
    // Glowing lava border around knee cop
    glow(
      b.part(new THREE.BoxGeometry(0.22, 0.24, 0.025), LAVA_BRIGHT, {
        bone: knee,
        at: [s * 0.40, 0.60, 0.10],
      }),
      1.1,
    );
    // Center bronze knee stud
    b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.045, 8), bronzePaint, {
      bone: knee,
      at: [s * 0.40, 0.60, 0.27],
      dir: [0, 0, 1],
    });

    // Shin & Calf Column
    b.frustumBox(
      [s * 0.40, 0.56, 0.08],
      [s * 0.44, 0.24, -0.04],
      [0.26, 0.26],
      [0.32, 0.30],
      { bone: knee, color: basaltPaint },
    );
    // Front shin armor plate
    b.part(new THREE.BoxGeometry(0.16, 0.34, 0.09), basaltPaint, {
      bone: knee,
      at: [s * 0.42, 0.40, 0.16],
    });

    // Rear calf cooling vents (Flush embedded into calf block)
    for (let v = 0; v < 3; v++) {
      glow(
        b.part(new THREE.BoxGeometry(0.14, 0.02, 0.03), LAVA_HOT, {
          bone: knee,
          at: [s * 0.42, 0.34 + v * 0.08, -0.10],
        }),
        1.1,
      );
    }

    // Ankle joint hub
    b.part(new THREE.SphereGeometry(0.15, 10, 8), basaltPaint, {
      bone: ankle,
      at: [s * 0.44, 0.22, -0.04],
    });
    glow(
      b.part(new THREE.TorusGeometry(0.158, 0.02, 8, 16), LAVA_HOT, {
        bone: ankle,
        at: [s * 0.44, 0.22, -0.04],
        dir: [0, 1, 0],
      }),
      1.1,
    );

    // TRIPOD BASALT FEET (Firm ground contact at platform surface y = 0.06)
    b.frustumBox(
      [s * 0.45, 0.20, -0.04],
      [s * 0.45, 0.06, 0.14],
      [0.30, 0.24],
      [0.36, 0.32],
      { bone: foot, color: basaltPaint },
    );
    // Rear heel spur extending backward for stability
    b.frustumBox(
      [s * 0.45, 0.10, -0.08],
      [s * 0.45, 0.04, -0.24],
      [0.22, 0.16],
      [0.18, 0.08],
      { bone: foot, color: basaltPaint },
    );

    // Front/Side 3 Claws/Toes touching ground
    // Center main toe
    b.frustumBox(
      [s * 0.46, 0.06, 0.24],
      [s * 0.46, 0.03, 0.38],
      [0.15, 0.08],
      [0.11, 0.05],
      { bone: toe, color: basaltPaint },
    );
    // Inner toe
    b.frustumBox(
      [s * 0.36, 0.06, 0.20],
      [s * 0.32, 0.03, 0.34],
      [0.12, 0.08],
      [0.09, 0.05],
      { bone: toe, color: basaltPaint },
    );
    // Outer toe
    b.frustumBox(
      [s * 0.56, 0.06, 0.20],
      [s * 0.60, 0.03, 0.34],
      [0.12, 0.08],
      [0.09, 0.05],
      { bone: toe, color: basaltPaint },
    );

    // Glowing molten seams between toes and foot base
    glow(
      b.part(new THREE.BoxGeometry(0.32, 0.02, 0.04), LAVA_BRIGHT, {
        bone: foot,
        at: [s * 0.46, 0.04, 0.22],
      }),
      1.1,
    );
  }

  // ---------------------------------------------------------------------------
  // 7. VOLCANIC CRAG STAGED BASE, SUNKEN LAVA RIVERS & PYRO CRYSTAL MOTES
  // ---------------------------------------------------------------------------

  // Primary Stepped Hexagonal Basalt Arena Platform
  b.part(new THREE.CylinderGeometry(1.36, 1.44, 0.06, 12), basaltPaint, {
    bone: hips,
    at: [0, 0.03, 0.06],
  });
  // Upper stepped cracked crust platform
  b.part(new THREE.CylinderGeometry(1.18, 1.24, 0.03, 10), basaltPaint, {
    bone: hips,
    at: [0, 0.06, 0.06],
  });

  // SUNKEN MOLTEN LAVA CHANNELS CUT INTO THE ARENA FLOOR
  // Channel 1: Main diagonal molten crack beneath golem
  const lavaPath1 = catmull([
    [-0.98, 0.065, -0.72],
    [-0.48, 0.065, -0.22],
    [0.04, 0.065, 0.16],
    [0.58, 0.065, 0.50],
    [1.08, 0.065, 0.82],
  ]);
  glow(
    b.sweep(lavaPath1, (t: number) => 0.095 * (1 - 0.25 * Math.sin(t * Math.PI)), {
      bone: hips,
      color: LAVA_HOT,
    }),
    1.1,
  );
  glow(
    b.sweep(lavaPath1, 0.026, {
      bone: hips,
      color: LAVA_CORE,
    }),
    1.2,
  );

  // Channel 2: Branching left fissure
  const lavaPath2 = catmull([
    [-0.48, 0.065, -0.22],
    [-0.78, 0.065, 0.28],
    [-1.12, 0.065, 0.56],
  ]);
  glow(
    b.sweep(lavaPath2, 0.068, {
      bone: hips,
      color: LAVA_CRUST,
    }),
    1.0,
  );
  glow(
    b.sweep(lavaPath2, 0.018, {
      bone: hips,
      color: LAVA_BRIGHT,
    }),
    1.1,
  );

  // Channel 3: Branching right fissure
  const lavaPath3 = catmull([
    [0.04, 0.065, 0.16],
    [0.52, 0.065, -0.28],
    [0.92, 0.065, -0.62],
  ]);
  glow(
    b.sweep(lavaPath3, 0.068, {
      bone: hips,
      color: LAVA_CRUST,
    }),
    1.0,
  );
  glow(
    b.sweep(lavaPath3, 0.018, {
      bone: hips,
      color: LAVA_BRIGHT,
    }),
    1.1,
  );

  // Basalt Arena Rim Slabs (Faceted stone boundary ring)
  for (let r = 0; r < 8; r++) {
    const angle = (r * Math.PI) / 4;
    const rX = Math.cos(angle) * 1.28;
    const rZ = 0.06 + Math.sin(angle) * 1.28;
    b.part(new THREE.BoxGeometry(0.36, 0.05, 0.18), basaltPaint, {
      bone: hips,
      at: [rX, 0.065, rZ],
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
    const cHeight = 0.28 + (idx % 4) * 0.10;
    const leanDir: [number, number, number] = [
      Math.cos(rad) * 0.35,
      1.0,
      Math.sin(rad) * 0.35,
    ];
    // Obsidian base pillar
    b.spike([cX, 0.06, cZ], leanDir, cHeight, 0.05, {
      bone: hips,
      color: OBSIDIAN_GLASS,
    });
    // Glowing molten tip
    glow(
      b.spike(offset([cX, 0.06, cZ], leanDir, cHeight * 0.68), leanDir, cHeight * 0.38, 0.026, {
        bone: hips,
        color: LAVA_HOT,
      }),
      1.1,
    );
  });

  // Floating Pyro Elemental Crystal Motes (Curated floating geometric octahedra)
  const motePositions: [number, number, number][] = [
    [-0.58, 2.10, 0.22],
    [0.58, 2.10, 0.22],
    [-0.42, 2.38, -0.28],
    [0.42, 2.38, -0.28],
    [-0.92, 1.58, 0.28],
    [0.92, 1.58, 0.28],
    [-0.72, 1.10, -0.32],
    [0.72, 1.10, -0.32],
  ];

  motePositions.forEach((pos, i) => {
    const scale = 0.038 + (i % 3) * 0.012;
    // Core floating diamond crystal
    glow(
      b.part(new THREE.OctahedronGeometry(scale, 0), LAVA_CORE, {
        bone: chest,
        at: pos,
        rotation: [i * 25, i * 45, i * 15],
      }),
      1.2,
    );
    // Outer Pyro flame shroud
    glow(
      b.part(new THREE.OctahedronGeometry(scale * 1.45, 0), LAVA_HOT, {
        bone: chest,
        at: pos,
        rotation: [-i * 20, -i * 30, i * 40],
      }),
      1.0,
    );
  });

  return b.root;
}
```