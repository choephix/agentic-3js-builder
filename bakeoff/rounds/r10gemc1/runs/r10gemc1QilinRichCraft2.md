Here is the assessment of what was holding the model back, followed by the complete rebuilt module:

### Key Changes
1. **Antlers Swept Up and Back**: The previous antler coordinates used local axis indices that projected horizontally forward like javelins. They now use unambiguous directional word handles (`up`, `back`, `left/right`) to rise majestically 85 cm into the air, arch backward over the neck and crown, and branch into multi-tiered brow, trez, and crown forks with glowing celestial cyan crystal tips.
2. **Fixed Snout & Jaw Orientation**: The snout and jaw had their Y/Z axes swapped, creating a vertical "chimney" on top of the skull. They now project forward with a sculpted dragon muzzle, gold-trimmed bridge, flared nostrils, white anime fangs, and a flowing cloud beard.
3. **Corrected Medallion & Hagoromo Placement**: The breast-collar and sacred sunburst medallion were previously placed on top of the back; they now sit proudly across the front of the chest between the shoulders, with hanging bells and jade pendants. The celestial silk ribbon (*hagoromo*) forms a flowing arch over the shoulders and flanks before trailing behind.
4. **Voluminous Anime Cloud Mane & Plume**: Replaced sparse wisps with lush, billowing, multi-lobed cloud clusters along the neck crest, withers, elbows, hocks, and fetlocks ("cloud treads"), culminating in an expansive seven-lock cloud blossom on the dragon tail.
5. **Legs, Cloven Hooves & Grounding**: Aligned the digitigrade limbs with the tiered dais surface ($y = 0.072\text{ m}$), equipped with golden runic fetlock cuffs and distinct cloven hooves.
6. **Pedestal & Spirit Lanterns**: Replaced floating motes (which previously bound to leg bones) with four ornate golden lotus lanterns with glowing spirit flames mounted directly on the sacred jade-and-lapis dais, surrounded by swirling perimeter cloud banks.

```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  polyline,
  limb,
  paint,
  svg,
  noise,
} from "agentic-3js-builder";
import { cel, INK } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "qilin",
  description:
    "A celestial qilin chimera with iridescent dragon scales, cloven hooves, branching crystal antlers, swirling cloud mane, floating hagoromo sash, and sacred lotus pedestal in high-fantasy anime style.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "qilin" });

  // ---------------------------------------------------------------------------
  // PALETTE & PAINTS (High-Fantasy Anime Cel Shading)
  // ---------------------------------------------------------------------------
  const CEL_TEAL = cel("#0d9488", "#042f2e");
  const CEL_JADE = cel("#10b981", "#064e3b");
  const CEL_EMERALD_DARK = cel("#047857", "#022c22");
  const CEL_GOLD = cel("#f59e0b", "#92400e");
  const CEL_GOLD_BRIGHT = cel("#fef08a", "#b45309");
  const CEL_RED_SILK = cel("#dc2626", "#7f1d1d");
  const CEL_CLOUD_WHITE = cel("#f8fafc", "#cbd5e1");
  const CEL_CLOUD_CYAN = cel("#5eead4", "#0f766e");
  const CEL_DARK_HORN = cel("#1e1b4b", "#0f172a");
  const CEL_CREAM = cel("#fffdf5", "#f1f5f9");
  const CEL_MOUTH = cel("#f43f5e", "#9f1239");

  const GLOW_CYAN = "#2dd4bf";
  const GLOW_GOLD = "#fbbf24";
  const GLOW_BLUE = "#38bdf8";

  // Iridescent dragon scale paint across body
  const SCALES_PAINT = paint((p, n) => {
    if (Math.abs(p.x) < 0.042 && n.y > 0.40) return "#f59e0b";
    if (n.y < -0.16) return "#fffdf5";
    const v1 = noise(p, 0.048, 17);
    const v2 = noise(p, 0.022, 31);
    const val = 0.65 * v1 + 0.35 * v2;
    if (val > 0.65) return "#34d399";
    if (val < 0.35) return "#047857";
    return "#10b981";
  });

  // ---------------------------------------------------------------------------
  // BESPOKE SVG TEXTURES
  // ---------------------------------------------------------------------------
  const EYE_TEXTURE = svg(
    `<svg viewBox="0 0 120 160">
      <defs>
        <linearGradient id="irisG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#042f2e" />
          <stop offset="30%" stop-color="#0d9488" />
          <stop offset="70%" stop-color="#2dd4bf" />
          <stop offset="100%" stop-color="#99f6e4" />
        </linearGradient>
        <radialGradient id="starG" cx="50%" cy="55%" r="45%">
          <stop offset="0%" stop-color="#fef08a" stop-opacity="0.95" />
          <stop offset="50%" stop-color="#f59e0b" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#0d9488" stop-opacity="0" />
        </radialGradient>
        <clipPath id="eyeC">
          <path d="M 15 80 C 15 35, 60 15, 105 50 C 115 85, 95 135, 55 145 C 25 140, 15 110, 15 80 Z" />
        </clipPath>
      </defs>
      <path d="M 15 80 C 15 35, 60 15, 105 50 C 115 85, 95 135, 55 145 C 25 140, 15 110, 15 80 Z" fill="#f0fdf4" stroke="${INK}" stroke-width="4.5" />
      <g clip-path="url(#eyeC)">
        <ellipse cx="65" cy="85" rx="36" ry="48" fill="url(#irisG)" />
        <ellipse cx="65" cy="90" rx="26" ry="34" fill="url(#starG)" />
        <path d="M 65 52 C 60 72, 60 102, 65 122 C 70 102, 70 72, 65 52 Z" fill="${INK}" />
        <polygon points="65,72 68,85 81,88 68,91 65,104 62,91 49,88 62,85" fill="#fef08a" opacity="0.95" />
        <path d="M 40 102 C 52 124, 78 124, 90 102" fill="none" stroke="#5eead4" stroke-width="3.5" stroke-linecap="round" />
        <path d="M 15 20 Q 65 65 115 45 L 115 10 L 15 10 Z" fill="#042f2e" opacity="0.6" />
        <circle cx="48" cy="62" r="11" fill="#ffffff" />
        <circle cx="82" cy="100" r="5" fill="#ffffff" />
        <circle cx="50" cy="98" r="3" fill="#ffffff" />
      </g>
      <path d="M 10 75 C 20 30, 65 12, 112 45" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round" />
      <path d="M 12 76 C 18 33, 63 15, 108 47" fill="none" stroke="#0d9488" stroke-width="2.5" />
      <path d="M 105 48 Q 118 42 122 30" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" />
      <path d="M 28 120 C 50 148, 85 142, 102 125" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" />
      <path d="M 35 15 C 65 -2, 95 10, 110 25" fill="none" stroke="#d97706" stroke-width="4.5" stroke-linecap="round" />
    </svg>`,
    { size: 512 }
  );

  const MEDALLION_TEX = svg(
    `<svg viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="60" fill="#f59e0b" stroke="#78350f" stroke-width="4" />
      <circle cx="64" cy="64" r="48" fill="#fef3c7" stroke="#b45309" stroke-width="2" />
      ${[0, 45, 90, 135, 180, 225, 270, 315]
        .map((a) => `<polygon points="64,16 70,30 58,30" transform="rotate(${a} 64 64)" fill="#dc2626" />`)
        .join("")}
      <circle cx="64" cy="64" r="32" fill="#0d9488" stroke="#042f2e" stroke-width="3" />
      <path d="M 64 32 A 16 16 0 0 1 64 64 A 16 16 0 0 0 64 96 A 32 32 0 0 1 64 32 Z" fill="#5eead4" />
      <circle cx="64" cy="48" r="6" fill="#042f2e" />
      <circle cx="64" cy="80" r="6" fill="#fef3c7" />
      <circle cx="64" cy="64" r="7" fill="#f59e0b" />
    </svg>`,
    { size: 256 }
  );

  const HOOF_RUNE_TEX = svg(
    `<svg viewBox="0 0 128 64">
      <rect width="128" height="64" fill="#f59e0b" />
      <line x1="0" y1="8" x2="128" y2="8" stroke="#fef08a" stroke-width="3" />
      <line x1="0" y1="56" x2="128" y2="56" stroke="#fef08a" stroke-width="3" />
      <path d="M 10 32 Q 25 12 40 32 T 70 32 T 100 32 T 120 32" fill="none" stroke="#fef08a" stroke-width="4" />
      <circle cx="25" cy="32" r="5" fill="#92400e" />
      <circle cx="55" cy="32" r="5" fill="#92400e" />
      <circle cx="85" cy="32" r="5" fill="#92400e" />
      <circle cx="115" cy="32" r="5" fill="#92400e" />
    </svg>`,
    { size: 128 }
  );

  // ---------------------------------------------------------------------------
  // SKELETON
  // ---------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 1.10, -0.28], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.10, -0.28],
      [0, 1.15, 0.05],
      [0, 1.20, 0.38],
    ]),
    { parent: hips, names: ["spine1", "chest"], role: "spine" }
  );
  const chest = spine.joints[1];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.20, 0.38],
      [0, 1.44, 0.54],
      [0, 1.70, 0.68],
      [0, 1.94, 0.76],
    ]),
    { parent: chest, names: ["neck1", "neck2", "neck3"], role: "neck" }
  );
  const neckTip = neck.joints[2];

  const head = b.joint("head", {
    parent: neckTip,
    at: [0, 1.94, 0.76],
    dir: [0, 0.12, 0.99],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.08, down: 0.06 }),
    aim: head.local({ forward: 0.36, down: 0.12 }),
    role: "jaw",
    group: "head",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.08, -0.36],
      [0, 0.96, -0.68],
      [0, 0.85, -1.00],
      [0, 0.90, -1.30],
      [0, 1.12, -1.50],
      [0, 1.34, -1.42],
    ]),
    { parent: hips, count: 5, role: "tail" }
  );

  // ---------------------------------------------------------------------------
  // TORSO & FLANKS
  // ---------------------------------------------------------------------------
  b.loft(
    [
      { at: [0, 1.08, -0.28], w: 0.44, h: 0.46 },
      { at: [0, 1.13, 0.02], w: 0.40, h: 0.44 },
      { at: [0, 1.17, 0.25], w: 0.48, h: 0.52 },
      { at: [0, 1.19, 0.40], w: 0.44, h: 0.50 },
    ],
    { bone: [hips, spine.joints[0], chest], color: SCALES_PAINT, group: "torso" }
  );

  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const pt = spine.at(t);
    b.spike(pt.at, [0, 1, 0.15], 0.07, 0.022, { bone: pt.bone, color: CEL_GOLD, group: "torso" });
  }

  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.04, 0.16, 0.26), CEL_EMERALD_DARK, {
      bone: chest,
      at: [s * 0.22, 1.14, 0.24],
      rotation: [s * 8, s * 5, s * -14],
      group: "torso",
    });
    b.part(new THREE.BoxGeometry(0.035, 0.14, 0.22), CEL_GOLD, {
      bone: hips,
      at: [s * 0.21, 1.08, -0.14],
      rotation: [s * -6, s * -4, s * -10],
      group: "torso",
    });
  }

  // ---------------------------------------------------------------------------
  // CLOUD SHAPE HELPER
  // ---------------------------------------------------------------------------
  function addCloudPuff(
    start: THREE.Vector3,
    outDir: THREE.Vector3,
    curlDir: THREE.Vector3,
    len: number,
    r: number,
    color: string | any,
    boneRef?: THREE.Object3D | THREE.Bone | null,
    grp = "mane"
  ) {
    const p0 = start.clone();
    const p1 = p0.clone().addScaledVector(outDir, len * 0.42);
    const p2 = p1.clone().addScaledVector(curlDir, len * 0.35);
    const p3 = p2.clone().addScaledVector(outDir, -len * 0.20);
    const p4 = p3.clone().addScaledVector(curlDir, -len * 0.16);
    const path = catmull([p0, p1, p2, p3, p4]);
    b.sweep(
      path,
      (t) => {
        if (t < 0.35) return r * (0.35 + 0.65 * (t / 0.35));
        return Math.max(0.003, r * (1.0 - (t - 0.35) / 0.65));
      },
      { bone: boneRef ?? undefined, color, group: grp }
    );
  }

  // ---------------------------------------------------------------------------
  // NECK & MANE
  // ---------------------------------------------------------------------------
  b.sweep(neck, (t) => [0.15 * (1 - 0.22 * t), 0.20 * (1 - 0.18 * t)], {
    color: SCALES_PAINT,
    group: "neck",
  });

  const maneSteps = 9;
  for (let i = 0; i < maneSteps; i++) {
    const t = 0.05 + (i / (maneSteps - 1)) * 0.92;
    const pt = neck.at(t);
    const ridgeBase = pt.at.clone().add(new THREE.Vector3(0, 0.10, -0.05));

    addCloudPuff(
      ridgeBase,
      new THREE.Vector3(0, 0.75, -0.6).normalize(),
      new THREE.Vector3(0, 0.35, 0.75).normalize(),
      0.24 + i * 0.015,
      0.045 + (i % 2) * 0.008,
      CEL_CLOUD_WHITE,
      pt.bone.object,
      "mane"
    );

    for (const s of [1, -1]) {
      addCloudPuff(
        ridgeBase.clone().add(new THREE.Vector3(s * 0.055, -0.02, 0.01)),
        new THREE.Vector3(s * 0.65, 0.55, -0.45).normalize(),
        new THREE.Vector3(s * -0.45, 0.6, 0.35).normalize(),
        0.20,
        0.034,
        CEL_CLOUD_CYAN,
        pt.bone.object,
        "mane"
      );
    }
  }

  for (const s of [1, -1]) {
    const shoulderPt = chest.local([s * 0.16, 0.14, -0.06]);
    addCloudPuff(
      shoulderPt,
      new THREE.Vector3(s * 0.55, 0.45, -0.65).normalize(),
      new THREE.Vector3(s * -0.45, 0.55, 0.45).normalize(),
      0.25,
      0.050,
      CEL_CLOUD_WHITE,
      chest.object,
      "mane"
    );
  }

  // ---------------------------------------------------------------------------
  // HEAD, FACE, JAWS & WHISKERS
  // ---------------------------------------------------------------------------
  const craniumPos = head.local({ forward: 0.05, up: 0.02 });
  const skull = b.part(
    new THREE.SphereGeometry(0.125, 14, 10),
    SCALES_PAINT,
    { bone: head, at: craniumPos, scale: [0.94, 1.05, 1.25], group: "head" }
  );

  const snoutStart = head.local({ forward: 0.10, down: 0.01 });
  const snoutEnd = head.local({ forward: 0.36, down: 0.05 });
  b.frustumBox(
    snoutStart,
    snoutEnd,
    [0.16, 0.13],
    [0.11, 0.08],
    { bone: head, color: CEL_TEAL, group: "head" }
  );

  b.part(
    new THREE.BoxGeometry(0.055, 0.015, 0.22),
    CEL_GOLD,
    {
      bone: head,
      at: head.local({ forward: 0.23, up: 0.065 }),
      rotation: [6, 0, 0],
      group: "head",
    }
  );

  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.016, 0.013, 0.03, 8), CEL_GOLD, {
      bone: head,
      at: head.local({ left: s * 0.045, down: 0.045, forward: 0.35 }),
      rotation: [15, s * 22, 0],
      group: "head",
    });
  }

  for (const s of [1, -1]) {
    b.spike(
      head.local({ left: s * 0.046, down: 0.07, forward: 0.27 }),
      head.dir([0, -0.85, 0.4]),
      0.045,
      0.011,
      { bone: head, color: "#ffffff", group: "head" }
    );
  }

  for (const s of [1, -1]) {
    b.decal(skull, EYE_TEXTURE, {
      at: head.local({ left: s * 0.096, up: 0.045, forward: 0.15 }),
      dir: head.dir([s * 0.85, 0.15, 0.50]),
      size: [0.092, 0.12],
      mirror: s > 0,
      bone: head,
      group: "head",
    });
  }

  for (const s of [1, -1]) {
    const whiskerBase = head.local({ left: s * 0.055, down: 0.035, forward: 0.32 });
    b.part(new THREE.SphereGeometry(0.014, 8, 6), CEL_GOLD, {
      bone: head,
      at: whiskerBase,
      group: "head",
    });

    const whiskerPath = catmull([
      whiskerBase,
      head.local({ left: s * 0.18, down: 0.06, forward: 0.36 }),
      head.local({ left: s * 0.28, down: 0.15, forward: 0.22 }),
      head.local({ left: s * 0.32, down: 0.24, forward: 0.06 }),
      head.local({ left: s * 0.24, down: 0.22, back: 0.10 }),
      head.local({ left: s * 0.18, down: 0.16, back: 0.22 }),
    ]);

    glow(
      b.sweep(whiskerPath, (t) => Math.max(0.0018, 0.009 * (1 - 0.82 * t)), {
        bone: head,
        color: GLOW_CYAN,
        group: "head",
      }),
      1.6
    );
  }

  for (const s of [1, -1]) {
    addCloudPuff(
      head.local({ left: s * 0.095, down: 0.02, back: 0.02 }),
      head.dir([s * 0.75, -0.25, -0.55]),
      head.dir([s * -0.4, 0.55, 0.35]),
      0.18,
      0.035,
      CEL_CLOUD_CYAN,
      head.object,
      "head"
    );
  }

  const jawStart = jaw.local({ forward: 0.02, up: 0 });
  const jawEnd = jaw.local({ forward: 0.27, up: 0 });
  b.frustumBox(jawStart, jawEnd, [0.13, 0.07], [0.08, 0.05], {
    bone: jaw,
    color: CEL_CREAM,
    group: "head",
  });

  b.part(new THREE.BoxGeometry(0.045, 0.012, 0.08), CEL_MOUTH, {
    bone: jaw,
    at: jaw.local({ forward: 0.15, up: 0.01 }),
    group: "head",
  });

  for (const s of [1, -1]) {
    b.spike(
      jaw.local({ left: s * 0.032, up: 0.025, forward: 0.23 }),
      jaw.dir([0, 0.85, 0.3]),
      0.028,
      0.007,
      { bone: jaw, color: "#ffffff", group: "head" }
    );
  }

  b.part(new THREE.TorusGeometry(0.025, 0.007, 8, 16), CEL_GOLD, {
    bone: jaw,
    at: jaw.local({ forward: 0.25, down: 0.03 }),
    rotation: [90, 0, 0],
    group: "head",
  });

  addCloudPuff(
    jaw.local({ forward: 0.25, down: 0.04 }),
    jaw.dir([0, -0.85, -0.35]),
    jaw.dir([0, 0.45, 0.65]),
    0.28,
    0.042,
    CEL_CLOUD_WHITE,
    jaw.object,
    "head"
  );
  for (const s of [1, -1]) {
    addCloudPuff(
      jaw.local({ left: s * 0.025, forward: 0.23, down: 0.035 }),
      jaw.dir([s * 0.5, -0.75, -0.25]),
      jaw.dir([s * -0.4, 0.45, 0.55]),
      0.20,
      0.028,
      CEL_CLOUD_CYAN,
      jaw.object,
      "head"
    );
  }

  for (const s of [1, -1]) {
    const earBase = head.local({ left: s * 0.10, up: 0.07, back: 0.06 });
    const earTip = head.local({ left: s * 0.28, up: 0.16, back: 0.22 });
    const earPath = bezier(
      earBase,
      head.local({ left: s * 0.20, up: 0.18, back: 0.10 }),
      head.local({ left: s * 0.26, up: 0.19, back: 0.16 }),
      earTip
    );
    b.sweep(earPath, (t) => [0.036 * (1 - 0.7 * t), 0.012 * (1 - 0.6 * t)], {
      bone: head,
      color: CEL_TEAL,
      group: "head",
    });
    b.sweep(earPath.slice(0.12, 0.8), (t) => [0.020 * (1 - t), 0.007], {
      bone: head,
      color: CEL_CREAM,
      group: "head",
    });

    b.part(new THREE.TorusGeometry(0.015, 0.004, 6, 12), CEL_GOLD, {
      bone: head,
      at: head.local({ left: s * 0.18, up: 0.12, back: 0.08 }),
      group: "head",
    });
    b.part(new THREE.SphereGeometry(0.009, 8, 8), CEL_JADE, {
      bone: head,
      at: head.local({ left: s * 0.18, up: 0.09, back: 0.08 }),
      group: "head",
    });
  }

  // ---------------------------------------------------------------------------
  // FOREHEAD KIRIN PEARL & CENTRAL HORN
  // ---------------------------------------------------------------------------
  b.part(new THREE.CylinderGeometry(0.036, 0.024, 0.018, 10), CEL_GOLD, {
    bone: head,
    at: head.local({ forward: 0.17, up: 0.11 }),
    dir: head.dir([0, 0.7, 0.7]),
    group: "head",
  });

  glow(
    b.part(new THREE.SphereGeometry(0.028, 14, 10), GLOW_BLUE, {
      bone: head,
      at: head.local({ forward: 0.18, up: 0.125 }),
      group: "head",
    }),
    2.4
  );

  b.spike(
    head.local({ forward: 0.16, up: 0.13 }),
    head.dir([0, 0.65, 0.76]),
    0.18,
    0.022,
    { bone: head, color: CEL_GOLD_BRIGHT, group: "head" }
  );

  // ---------------------------------------------------------------------------
  // BRANCHING ANTLERS (Swept Up & Back)
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const socket = head.local({ left: s * 0.08, up: 0.11, back: 0.04 });

    b.part(new THREE.TorusGeometry(0.034, 0.009, 8, 16), CEL_GOLD, {
      bone: head,
      at: socket,
      dir: head.dir([s * 0.3, 0.8, -0.5]),
      group: "antlers",
    });

    const p0 = socket;
    const p1 = head.local({ left: s * 0.15, up: 0.32, back: 0.10 });
    const p2 = head.local({ left: s * 0.24, up: 0.54, back: 0.24 });
    const p3 = head.local({ left: s * 0.28, up: 0.72, back: 0.40 });
    const p4 = head.local({ left: s * 0.25, up: 0.88, back: 0.54 });

    const mainBeam = catmull([p0, p1, p2, p3, p4]);
    b.sweep(mainBeam, (t) => Math.max(0.005, 0.034 * (1 - 0.78 * t)), {
      bone: head,
      color: CEL_CREAM,
      bands: [
        [0.22, CEL_DARK_HORN],
        [0.44, CEL_GOLD],
        [0.86, CEL_CREAM],
        [1.0, GLOW_CYAN],
      ],
      group: "antlers",
    });

    const browTip = head.local({ left: s * 0.18, up: 0.46, forward: 0.04 });
    const browTine = catmull([p1, browTip]);
    b.sweep(browTine, [0.020, 0.004], { bone: head, color: CEL_CREAM, group: "antlers" });
    glow(
      b.part(new THREE.ConeGeometry(0.013, 0.05, 6), GLOW_CYAN, {
        bone: head,
        at: browTip.clone().add(head.dir([s * 0.05, 0.6, 0.5]).multiplyScalar(0.025)),
        dir: head.dir([s * 0.05, 0.6, 0.5]),
        group: "antlers",
      }),
      1.8
    );

    const trezTip = head.local({ left: s * 0.38, up: 0.66, back: 0.18 });
    const trezTine = catmull([p2, trezTip]);
    b.sweep(trezTine, [0.018, 0.004], { bone: head, color: CEL_CREAM, group: "antlers" });
    glow(
      b.part(new THREE.ConeGeometry(0.012, 0.048, 6), GLOW_CYAN, {
        bone: head,
        at: trezTip.clone().add(head.dir([s * 0.8, 0.55, 0.05]).multiplyScalar(0.024)),
        dir: head.dir([s * 0.8, 0.55, 0.05]),
        group: "antlers",
      }),
      1.8
    );

    const crownTip = head.local({ left: s * 0.35, up: 0.82, back: 0.50 });
    const crownFork = catmull([p3, crownTip]);
    b.sweep(crownFork, [0.015, 0.003], { bone: head, color: CEL_CREAM, group: "antlers" });
    glow(
      b.part(new THREE.ConeGeometry(0.011, 0.044, 6), GLOW_CYAN, {
        bone: head,
        at: crownTip.clone().add(head.dir([s * 0.35, 0.6, -0.6]).multiplyScalar(0.022)),
        dir: head.dir([s * 0.35, 0.6, -0.6]),
        group: "antlers",
      }),
      1.8
    );

    glow(
      b.part(new THREE.ConeGeometry(0.013, 0.055, 6), GLOW_CYAN, {
        bone: head,
        at: p4.clone().add(head.dir([s * 0.1, 0.6, -0.7]).multiplyScalar(0.028)),
        dir: head.dir([s * 0.1, 0.6, -0.7]),
        group: "antlers",
      }),
      2.0
    );
  }

  // ---------------------------------------------------------------------------
  // BREAST-COLLAR & SACRED CHEST MEDALLION
  // ---------------------------------------------------------------------------
  const breastCenter = new THREE.Vector3(0, 1.08, 0.56);

  for (const s of [1, -1]) {
    const collarPath = catmull([
      chest.local([s * 0.16, 0.18, 0.15]),
      chest.local([s * 0.18, 0.04, 0.28]),
      breastCenter,
    ]);
    b.sweep(collarPath, 0.014, { bone: chest, color: CEL_RED_SILK, group: "harness" });
  }

  b.part(new THREE.CylinderGeometry(0.068, 0.068, 0.016, 20), CEL_GOLD, {
    bone: chest,
    at: breastCenter,
    dir: [0, 0.18, 0.98],
    group: "harness",
  });

  b.part(new THREE.PlaneGeometry(0.12, 0.12), "#ffffff", {
    bone: chest,
    at: breastCenter.clone().add(new THREE.Vector3(0, 0.002, 0.010)),
    dir: [0, 0.18, 0.98],
    axis: "z",
    texture: MEDALLION_TEX,
    group: "harness",
  });

  b.part(new THREE.ConeGeometry(0.020, 0.035, 10), CEL_GOLD, {
    bone: chest,
    at: breastCenter.clone().add(new THREE.Vector3(0, -0.09, 0.01)),
    rotation: [180, 0, 0],
    group: "harness",
  });
  b.part(new THREE.SphereGeometry(0.012, 8, 8), CEL_JADE, {
    bone: chest,
    at: breastCenter.clone().add(new THREE.Vector3(0, -0.125, 0.01)),
    group: "harness",
  });

  // ---------------------------------------------------------------------------
  // CELESTIAL HAGOROMO (Silk Ribbon Arch)
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const sashPath = catmull([
      breastCenter.clone().add(new THREE.Vector3(s * 0.08, 0, -0.04)),
      new THREE.Vector3(s * 0.30, 1.32, 0.42),
      new THREE.Vector3(s * 0.38, 1.48, 0.16),
      new THREE.Vector3(s * 0.36, 1.28, -0.16),
      new THREE.Vector3(s * 0.40, 1.05, -0.46),
      new THREE.Vector3(s * 0.46, 0.88, -0.74),
      new THREE.Vector3(s * 0.38, 0.92, -0.96),
    ]);

    b.sweep(sashPath, (t) => [0.045 * (1 - 0.25 * t), 0.006], {
      bone: chest,
      color: CEL_RED_SILK,
      group: "sash",
    });

    const sashEnd = new THREE.Vector3(s * 0.38, 0.92, -0.96);
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.022, 8), CEL_GOLD, {
      bone: chest,
      at: sashEnd,
      group: "sash",
    });
    b.part(new THREE.SphereGeometry(0.012, 8, 8), CEL_JADE, {
      bone: chest,
      at: sashEnd.clone().add(new THREE.Vector3(0, -0.035, 0)),
      group: "sash",
    });
  }

  // ---------------------------------------------------------------------------
  // LEGS, HOOVES & ANKLE CLOUDS
  // ---------------------------------------------------------------------------
  const DAIS_SURFACE_Y = 0.072;

  // FRONT LEGS
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulderSocket = [s * 0.20, 1.15, 0.38];
    const frontHoofTarget = [s * 0.22, DAIS_SURFACE_Y, 0.44];

    const frontPts = limb(
      shoulderSocket,
      frontHoofTarget,
      [0.45, 0.44, 0.22],
      [
        [0, 0, -1],
        [0, 0, 1],
      ]
    );

    const legF = b.chain(`legF${side}`, frontPts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `kneeF${side}`, `hoofF${side}`],
      role: "leg",
      contact: [s * 0.22, 0.0, 0.44],
    });

    b.sweep(legF, (t) => 0.062 * (1 - 0.48 * t) + 0.020, {
      color: SCALES_PAINT,
      group: `legF${side}`,
    });

    b.part(new THREE.BoxGeometry(0.046, 0.068, 0.032), CEL_GOLD, {
      bone: legF.joints[2],
      at: legF.joints[2].at.clone().add(new THREE.Vector3(0, 0, 0.022)),
      group: `legF${side}`,
    });

    addCloudPuff(
      legF.joints[1].at,
      new THREE.Vector3(s * 0.25, -0.3, -0.85).normalize(),
      new THREE.Vector3(0, 0.7, 0.4).normalize(),
      0.20,
      0.035,
      CEL_CLOUD_CYAN,
      legF.joints[1].object,
      `legF${side}`
    );

    const hoofPt = legF.tip ? legF.tip.at : frontHoofTarget;

    b.part(new THREE.CylinderGeometry(0.036, 0.038, 0.038, 12), "#f59e0b", {
      bone: legF.tip ?? legF.joints[2],
      at: hoofPt.clone().add(new THREE.Vector3(0, 0.032, 0)),
      texture: HOOF_RUNE_TEX,
      group: `legF${side}`,
    });

    addCloudPuff(
      hoofPt.clone().add(new THREE.Vector3(0, 0.02, 0)),
      new THREE.Vector3(s * 0.45, 0.15, -0.8).normalize(),
      new THREE.Vector3(s * -0.5, 0.55, 0.4).normalize(),
      0.18,
      0.032,
      CEL_CLOUD_WHITE,
      legF.tip ? legF.tip.object : legF.joints[2].object,
      `legF${side}`
    );

    for (const toeS of [1, -1]) {
      const toePos = hoofPt.clone().add(new THREE.Vector3(toeS * 0.020, -0.015, 0.018));
      b.part(new THREE.ConeGeometry(0.022, 0.052, 6), CEL_GOLD, {
        bone: legF.tip ?? legF.joints[2],
        at: toePos,
        rotation: [-18, toeS * 10, 0],
        group: `legF${side}`,
      });
    }
  }

  // HIND LEGS
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipSocket = [s * 0.18, 1.08, -0.24];
    const hindHoofTarget = [s * 0.24, DAIS_SURFACE_Y, -0.42];

    const hindPts = limb(
      hipSocket,
      hindHoofTarget,
      [0.46, 0.45, 0.22],
      [
        [0, 0, 1],
        [0, 0, -1],
      ]
    );

    const legH = b.chain(`legH${side}`, hindPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `hoofH${side}`],
      role: "leg",
      contact: [s * 0.24, 0.0, -0.42],
    });

    b.sweep(legH, (t) => 0.074 * (1 - 0.54 * t) + 0.022, {
      color: SCALES_PAINT,
      group: `legH${side}`,
    });

    b.part(new THREE.BoxGeometry(0.048, 0.072, 0.034), CEL_GOLD, {
      bone: legH.joints[2],
      at: legH.joints[2].at.clone().add(new THREE.Vector3(0, 0, -0.026)),
      group: `legH${side}`,
    });

    addCloudPuff(
      legH.joints[2].at,
      new THREE.Vector3(s * 0.35, -0.22, -0.88).normalize(),
      new THREE.Vector3(0, 0.65, 0.45).normalize(),
      0.24,
      0.040,
      CEL_CLOUD_CYAN,
      legH.joints[2].object,
      `legH${side}`
    );

    const hoofPt = legH.tip ? legH.tip.at : hindHoofTarget;

    b.part(new THREE.CylinderGeometry(0.037, 0.039, 0.038, 12), "#f59e0b", {
      bone: legH.tip ?? legH.joints[2],
      at: hoofPt.clone().add(new THREE.Vector3(0, 0.032, 0)),
      texture: HOOF_RUNE_TEX,
      group: `legH${side}`,
    });

    addCloudPuff(
      hoofPt.clone().add(new THREE.Vector3(0, 0.02, 0)),
      new THREE.Vector3(s * 0.5, 0.18, -0.75).normalize(),
      new THREE.Vector3(s * -0.5, 0.6, 0.35).normalize(),
      0.19,
      0.034,
      CEL_CLOUD_WHITE,
      legH.tip ? legH.tip.object : legH.joints[2].object,
      `legH${side}`
    );

    for (const toeS of [1, -1]) {
      const toePos = hoofPt.clone().add(new THREE.Vector3(toeS * 0.021, -0.015, 0.018));
      b.part(new THREE.ConeGeometry(0.023, 0.052, 6), CEL_GOLD, {
        bone: legH.tip ?? legH.joints[2],
        at: toePos,
        rotation: [-18, toeS * 10, 0],
        group: `legH${side}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // TAIL & CLOUD PLUME BLOSSOM
  // ---------------------------------------------------------------------------
  b.sweep(tail, (t) => Math.max(0.014, 0.052 * (1 - 0.65 * t)), {
    color: SCALES_PAINT,
    group: "tail",
  });

  for (let i = 0; i < 6; i++) {
    const t = 0.15 + (i / 5) * 0.55;
    const pt = tail.at(t);
    b.spike(pt.at, [0, 1, -0.2], 0.046, 0.016, { bone: pt.bone, color: CEL_GOLD, group: "tail" });
  }

  const plumeBasePt = tail.at(0.72);
  b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.035, 12), CEL_GOLD, {
    bone: plumeBasePt.bone,
    at: plumeBasePt.at,
    rotation: [30, 0, 0],
    group: "tail",
  });

  b.sweep(
    polyline([
      plumeBasePt.at.clone().add(new THREE.Vector3(0, -0.02, 0)),
      plumeBasePt.at.clone().add(new THREE.Vector3(0, -0.12, -0.02)),
    ]),
    0.005,
    { bone: plumeBasePt.bone, color: CEL_RED_SILK, group: "tail" }
  );
  b.part(new THREE.SphereGeometry(0.016, 8, 8), CEL_GOLD, {
    bone: plumeBasePt.bone,
    at: plumeBasePt.at.clone().add(new THREE.Vector3(0, -0.13, -0.02)),
    group: "tail",
  });

  const tipJoint = tail.joints[tail.joints.length - 1];

  addCloudPuff(
    tail.at(0.85).at,
    new THREE.Vector3(0, 0.85, -0.4).normalize(),
    new THREE.Vector3(0, 0.35, 0.75).normalize(),
    0.36,
    0.058,
    CEL_CLOUD_WHITE,
    tipJoint.object,
    "tail"
  );

  addCloudPuff(
    tail.at(0.78).at,
    new THREE.Vector3(0, 0.75, 0.55).normalize(),
    new THREE.Vector3(0, -0.45, -0.65).normalize(),
    0.30,
    0.048,
    CEL_CLOUD_WHITE,
    tipJoint.object,
    "tail"
  );

  for (const s of [1, -1]) {
    addCloudPuff(
      tail.at(0.82).at,
      new THREE.Vector3(s * 0.75, 0.55, -0.3).normalize(),
      new THREE.Vector3(s * -0.5, 0.6, 0.4).normalize(),
      0.32,
      0.050,
      CEL_CLOUD_CYAN,
      tipJoint.object,
      "tail"
    );
  }

  for (const s of [1, -1]) {
    addCloudPuff(
      tail.at(0.92).at,
      new THREE.Vector3(s * 0.45, -0.35, -0.85).normalize(),
      new THREE.Vector3(s * -0.5, 0.65, 0.25).normalize(),
      0.28,
      0.040,
      CEL_CLOUD_WHITE,
      tipJoint.object,
      "tail"
    );
  }

  addCloudPuff(
    tail.at(0.98).at,
    new THREE.Vector3(0, 0.65, -0.7).normalize(),
    new THREE.Vector3(0, -0.6, 0.5).normalize(),
    0.34,
    0.052,
    CEL_CLOUD_CYAN,
    tipJoint.object,
    "tail"
  );

  // ---------------------------------------------------------------------------
  // PEDESTAL & SACRED LOTUS LANTERNS
  // ---------------------------------------------------------------------------
  b.part(new THREE.CylinderGeometry(1.18, 1.22, 0.036, 36), cel("#1e293b", "#0f172a"), {
    at: [0, 0.018, 0],
    group: "pedestal",
  });

  b.part(new THREE.CylinderGeometry(0.98, 1.02, 0.036, 36), cel("#065f46", "#022c22"), {
    at: [0, 0.054, 0],
    group: "pedestal",
  });

  b.part(new THREE.TorusGeometry(1.00, 0.012, 8, 40), CEL_GOLD, {
    at: [0, 0.072, 0],
    rotation: [90, 0, 0],
    group: "pedestal",
  });

  for (let k = 0; k < 16; k++) {
    const angle = (k * Math.PI) / 8;
    const px = Math.cos(angle) * 1.04;
    const pz = Math.sin(angle) * 1.04;
    b.part(new THREE.ConeGeometry(0.045, 0.11, 4), CEL_GOLD, {
      at: [px, 0.058, pz],
      dir: [Math.cos(angle), 0.12, Math.sin(angle)],
      group: "pedestal",
    });
  }

  for (let k = 0; k < 8; k++) {
    const angle = (k * Math.PI) / 4 + 0.25;
    const px = Math.cos(angle) * 1.12;
    const pz = Math.sin(angle) * 1.12;
    addCloudPuff(
      new THREE.Vector3(px, 0.02, pz),
      new THREE.Vector3(Math.cos(angle), 0.15, Math.sin(angle)).normalize(),
      new THREE.Vector3(-Math.sin(angle), 0.45, Math.cos(angle)).normalize(),
      0.30,
      0.055,
      CEL_CLOUD_WHITE,
      null,
      "pedestal"
    );
  }

  // Four Auspicious Spirit Lanterns on the Lotus Dais
  const lanternAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
  const lanternColors = [GLOW_CYAN, GLOW_GOLD, GLOW_BLUE, GLOW_CYAN];

  for (let i = 0; i < 4; i++) {
    const ang = lanternAngles[i];
    const lx = Math.cos(ang) * 0.84;
    const lz = Math.sin(ang) * 0.84;
    const lBase = new THREE.Vector3(lx, 0.072, lz);

    b.part(new THREE.CylinderGeometry(0.045, 0.055, 0.025, 8), CEL_GOLD, {
      at: lBase.clone().add(new THREE.Vector3(0, 0.012, 0)),
      group: "pedestal",
    });

    for (let p = 0; p < 6; p++) {
      const pAng = (p * Math.PI) / 3;
      b.part(new THREE.ConeGeometry(0.018, 0.04, 4), CEL_GOLD, {
        at: lBase.clone().add(new THREE.Vector3(Math.cos(pAng) * 0.038, 0.028, Math.sin(pAng) * 0.038)),
        dir: [Math.cos(pAng) * 0.5, 0.85, Math.sin(pAng) * 0.5],
        group: "pedestal",
      });
    }

    glow(
      b.part(new THREE.SphereGeometry(0.028, 12, 10), lanternColors[i], {
        at: lBase.clone().add(new THREE.Vector3(0, 0.055, 0)),
        group: "pedestal",
      }),
      2.5
    );
  }

  // ---------------------------------------------------------------------------
  // NOBLE REST POSE
  // ---------------------------------------------------------------------------
  b.pose(jaw, { deg: 7, axis: [1, 0, 0] });

  return b.root;
}
```