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
} from "../../../../src/index";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

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
  const CEL_CLOUD_WHITE = cel("#ffffff", "#cbd5e1");
  const CEL_CLOUD_CYAN = cel("#5eead4", "#0f766e");
  const CEL_DARK_HORN = cel("#1e1b4b", "#0f172a");
  const CEL_CREAM = cel("#fffdf5", "#e2e8f0");
  const CEL_MOUTH = cel("#f43f5e", "#9f1239");

  const GLOW_CYAN = "#2dd4bf";
  const GLOW_GOLD = "#fbbf24";
  const GLOW_BLUE = "#38bdf8";

  // Iridescent dragon scale paint across body with cream belly & gold dorsal ridge
  const SCALES_PAINT = paint((p, n) => {
    if (Math.abs(p.x) < 0.038 && n.y > 0.35) return "#f59e0b";
    if (n.y < -0.22) return "#fffdf5";
    const v1 = noise(p, 0.045, 17);
    const v2 = noise(p, 0.020, 31);
    const val = 0.65 * v1 + 0.35 * v2;
    if (val > 0.64) return "#34d399";
    if (val < 0.34) return "#047857";
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
  // SKELETON (Dynamic Cervine-Draconic Proportions)
  // ---------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 1.05, -0.32], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.05, -0.32],
      [0, 1.08, 0.02],
      [0, 1.15, 0.36],
    ]),
    { parent: hips, names: ["spine1", "chest"], role: "spine" }
  );
  const chest = spine.joints[1];

  // Gracefully arched neck
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.15, 0.36],
      [0, 1.34, 0.48],
      [0, 1.54, 0.52],
      [0, 1.72, 0.46],
    ]),
    { parent: chest, names: ["neck1", "neck2", "neck3"], role: "neck" }
  );
  const neckTip = neck.joints[2];

  const head = b.joint("head", {
    parent: neckTip,
    at: [0, 1.72, 0.46],
    dir: [0, -0.06, 0.998],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.08, down: 0.07 }),
    aim: head.local({ forward: 0.34, down: 0.12 }),
    role: "jaw",
    group: "head",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.02, -0.42],
      [0, 0.92, -0.72],
      [0, 0.78, -1.02],
      [0, 0.82, -1.30],
      [0, 1.02, -1.48],
      [0, 1.24, -1.42],
    ]),
    { parent: hips, count: 5, role: "tail" }
  );

  // ---------------------------------------------------------------------------
  // VOLUMETRIC CLOUD BUILDERS
  // ---------------------------------------------------------------------------
  // Creates a lush, stylized anime billowing cloud puff cluster
  function buildCloudCluster(
    center: THREE.Vector3,
    mainR: number,
    color: any,
    boneRef?: THREE.Object3D | THREE.Bone | null,
    grp = "mane"
  ) {
    b.part(new THREE.SphereGeometry(mainR, 12, 10), color, {
      bone: boneRef ?? undefined,
      at: center,
      group: grp,
    });
    // Secondary flanking lobes that create the scalloped anime silhouette
    const offsets = [
      [0.65, 0.35, 0.25],
      [-0.65, 0.35, -0.2],
      [0.2, 0.7, -0.4],
      [-0.3, -0.5, 0.4],
      [0.0, 0.6, 0.55],
    ];
    for (let j = 0; j < offsets.length; j++) {
      const off = offsets[j];
      const lobeR = mainR * (0.50 + 0.12 * (j % 3));
      const pos = center.clone().add(new THREE.Vector3(off[0] * mainR, off[1] * mainR, off[2] * mainR));
      b.part(new THREE.SphereGeometry(lobeR, 8, 6), color, {
        bone: boneRef ?? undefined,
        at: pos,
        group: grp,
      });
    }
  }

  function addCloudCurl(
    start: THREE.Vector3,
    outDir: THREE.Vector3,
    curlDir: THREE.Vector3,
    len: number,
    r: number,
    color: any,
    boneRef?: THREE.Object3D | THREE.Bone | null,
    grp = "mane"
  ) {
    const p0 = start.clone();
    const p1 = p0.clone().addScaledVector(outDir, len * 0.40);
    const p2 = p1.clone().addScaledVector(curlDir, len * 0.35);
    const p3 = p2.clone().addScaledVector(outDir, -len * 0.22);
    const p4 = p3.clone().addScaledVector(curlDir, -len * 0.18);
    const path = catmull([p0, p1, p2, p3, p4]);
    b.sweep(
      path,
      (t) => {
        if (t < 0.3) return r * (0.35 + 0.65 * (t / 0.3));
        return Math.max(0.003, r * (1.0 - (t - 0.3) / 0.7));
      },
      { bone: boneRef ?? undefined, color, group: grp }
    );
  }

  // ---------------------------------------------------------------------------
  // TORSO & WITHERS
  // ---------------------------------------------------------------------------
  b.loft(
    [
      { at: [0, 1.04, -0.32], w: 0.42, h: 0.44 },
      { at: [0, 1.07, -0.05], w: 0.38, h: 0.42 },
      { at: [0, 1.12, 0.18], w: 0.44, h: 0.48 },
      { at: [0, 1.14, 0.36], w: 0.46, h: 0.52 },
    ],
    { bone: [hips, spine.joints[0], chest], color: SCALES_PAINT, group: "torso" }
  );

  // Dorsal dragon spine ridge
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const pt = spine.at(t);
    b.spike(pt.at, [0, 1, 0.1], 0.065, 0.020, { bone: pt.bone, color: CEL_GOLD, group: "torso" });
  }

  // Gilded flame flank crests (curved organic crests instead of flat boxes)
  for (const s of [1, -1]) {
    const crestP0 = [s * 0.20, 1.10, 0.10];
    const crestP1 = [s * 0.23, 1.16, 0.22];
    const crestP2 = [s * 0.19, 1.08, 0.32];
    b.sweep(bezier(crestP0, crestP1, crestP2), [0.022, 0.005], {
      bone: chest,
      color: CEL_GOLD,
      group: "torso",
    });
  }

  // ---------------------------------------------------------------------------
  // VOLUMINOUS BILLOWING CLOUD MANE
  // ---------------------------------------------------------------------------
  b.sweep(neck, (t) => [0.18 * (1 - 0.25 * t), 0.22 * (1 - 0.20 * t)], {
    color: SCALES_PAINT,
    group: "neck",
  });

  // Layered cloud clusters & swirling puffs cascading down the neck crest
  const maneClusters = 8;
  for (let i = 0; i < maneClusters; i++) {
    const t = 0.08 + (i / (maneClusters - 1)) * 0.88;
    const pt = neck.at(t);
    const maneCenter = pt.at.clone().add(new THREE.Vector3(0, 0.11 + i * 0.006, -0.04 - i * 0.012));
    const isCyan = i % 2 === 1;
    const maneCol = isCyan ? CEL_CLOUD_CYAN : CEL_CLOUD_WHITE;

    buildCloudCluster(maneCenter, 0.075 + i * 0.005, maneCol, pt.bone.object, "mane");

    // Dynamic curling tendrils branching from each mane node
    for (const s of [1, -1]) {
      const curlBase = maneCenter.clone().add(new THREE.Vector3(s * 0.06, -0.01, -0.02));
      addCloudCurl(
        curlBase,
        new THREE.Vector3(s * 0.7, 0.45, -0.55).normalize(),
        new THREE.Vector3(s * -0.4, 0.65, 0.35).normalize(),
        0.22 + (i % 3) * 0.03,
        0.038,
        isCyan ? CEL_CLOUD_WHITE : CEL_CLOUD_CYAN,
        pt.bone.object,
        "mane"
      );
    }
  }

  // Lush cloud mantle over shoulders and withers
  for (const s of [1, -1]) {
    const shoulderMantle = chest.local([s * 0.18, 0.16, 0.12]);
    buildCloudCluster(shoulderMantle, 0.088, CEL_CLOUD_WHITE, chest.object, "mane");
    addCloudCurl(
      shoulderMantle,
      new THREE.Vector3(s * 0.65, 0.35, -0.65).normalize(),
      new THREE.Vector3(s * -0.35, 0.65, 0.45).normalize(),
      0.26,
      0.044,
      CEL_CLOUD_CYAN,
      chest.object,
      "mane"
    );
  }

  // ---------------------------------------------------------------------------
  // HEAD, FACE & ANIME DRAGON JAW
  // ---------------------------------------------------------------------------
  const craniumPos = head.local({ forward: 0.06, up: 0.04 });
  const skull = b.part(
    new THREE.SphereGeometry(0.145, 14, 12),
    SCALES_PAINT,
    { bone: head, at: craniumPos, scale: [0.95, 1.05, 1.25], group: "head" }
  );

  // Sculpted noble dragon snout
  const snoutStart = head.local({ forward: 0.12, down: 0.01 });
  const snoutEnd = head.local({ forward: 0.38, down: 0.05 });
  b.frustumBox(
    snoutStart,
    snoutEnd,
    [0.17, 0.14],
    [0.12, 0.09],
    { bone: head, color: CEL_TEAL, group: "head" }
  );

  // Dragon brow ridges
  for (const s of [1, -1]) {
    const browPath = bezier(
      head.local({ left: s * 0.04, up: 0.11, forward: 0.18 }),
      head.local({ left: s * 0.11, up: 0.12, forward: 0.14 }),
      head.local({ left: s * 0.13, up: 0.08, forward: 0.06 })
    );
    b.sweep(browPath, [0.018, 0.008], { bone: head, color: CEL_GOLD, group: "head" });
  }

  // Golden nose bridge crest
  b.part(
    new THREE.BoxGeometry(0.048, 0.018, 0.22),
    CEL_GOLD,
    {
      bone: head,
      at: head.local({ forward: 0.25, up: 0.075 }),
      rotation: [7, 0, 0],
      group: "head",
    }
  );

  // Flared nostrils with filigree rings
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.018, 0.006, 6, 12), CEL_GOLD, {
      bone: head,
      at: head.local({ left: s * 0.048, down: 0.035, forward: 0.37 }),
      rotation: [15, s * 25, 0],
      group: "head",
    });
  }

  // Draconic upper fangs
  for (const s of [1, -1]) {
    b.spike(
      head.local({ left: s * 0.052, down: 0.075, forward: 0.28 }),
      head.dir([0, -0.85, 0.4]),
      0.052,
      0.012,
      { bone: head, color: "#ffffff", group: "head" }
    );
  }

  // Big expressive anime eyes placed on both sides of the skull
  for (const s of [1, -1]) {
    b.decal(skull, EYE_TEXTURE, {
      at: head.local({ left: s * 0.105, up: 0.055, forward: 0.16 }),
      dir: head.dir([s * 0.82, 0.12, 0.45]),
      size: [0.11, 0.145],
      mirror: s > 0,
      bone: head,
      group: "head",
    });
  }

  // Cheek cloud billows framing the head
  for (const s of [1, -1]) {
    const cheekPos = head.local({ left: s * 0.11, down: 0.01, back: 0.02 });
    buildCloudCluster(cheekPos, 0.058, CEL_CLOUD_WHITE, head.object, "head");
    addCloudCurl(
      cheekPos,
      head.dir([s * 0.75, -0.2, -0.55]),
      head.dir([s * -0.35, 0.6, 0.35]),
      0.22,
      0.036,
      CEL_CLOUD_CYAN,
      head.object,
      "head"
    );
  }

  // Dragon whiskers flowing in graceful ribbon arcs
  for (const s of [1, -1]) {
    const whiskerStud = head.local({ left: s * 0.058, down: 0.03, forward: 0.34 });
    b.part(new THREE.SphereGeometry(0.016, 8, 8), CEL_GOLD, {
      bone: head,
      at: whiskerStud,
      group: "head",
    });

    const whiskerPath = catmull([
      whiskerStud,
      head.local({ left: s * 0.18, down: 0.04, forward: 0.42 }),
      head.local({ left: s * 0.32, down: 0.12, forward: 0.32 }),
      head.local({ left: s * 0.38, down: 0.22, forward: 0.14 }),
      head.local({ left: s * 0.32, down: 0.24, back: 0.08 }),
      head.local({ left: s * 0.24, down: 0.18, back: 0.24 }),
      head.local({ left: s * 0.16, down: 0.10, back: 0.38 }),
    ]);

    glow(
      b.sweep(whiskerPath, (t) => Math.max(0.002, 0.010 * (1 - 0.8 * t)), {
        bone: head,
        color: GLOW_CYAN,
        group: "head",
      }),
      1.8
    );
  }

  // Lower jaw & beard
  const jawStart = jaw.local({ forward: 0.02, up: 0 });
  const jawEnd = jaw.local({ forward: 0.28, up: 0 });
  b.frustumBox(jawStart, jawEnd, [0.14, 0.08], [0.09, 0.05], {
    bone: jaw,
    color: CEL_CREAM,
    group: "head",
  });

  b.part(new THREE.BoxGeometry(0.05, 0.014, 0.09), CEL_MOUTH, {
    bone: jaw,
    at: jaw.local({ forward: 0.16, up: 0.01 }),
    group: "head",
  });

  for (const s of [1, -1]) {
    b.spike(
      jaw.local({ left: s * 0.036, up: 0.026, forward: 0.24 }),
      jaw.dir([0, 0.85, 0.3]),
      0.032,
      0.008,
      { bone: jaw, color: "#ffffff", group: "head" }
    );
  }

  // Chin golden ring & flowing beard cloud
  b.part(new THREE.TorusGeometry(0.026, 0.007, 8, 16), CEL_GOLD, {
    bone: jaw,
    at: jaw.local({ forward: 0.26, down: 0.035 }),
    rotation: [90, 0, 0],
    group: "head",
  });

  const chinCloudCenter = jaw.local({ forward: 0.26, down: 0.055 });
  buildCloudCluster(chinCloudCenter, 0.055, CEL_CLOUD_WHITE, jaw.object, "head");
  addCloudCurl(
    chinCloudCenter,
    jaw.dir([0, -0.85, -0.35]),
    jaw.dir([0, 0.45, 0.65]),
    0.30,
    0.045,
    CEL_CLOUD_CYAN,
    jaw.object,
    "head"
  );

  // Fin-like celestial ears
  for (const s of [1, -1]) {
    const earBase = head.local({ left: s * 0.11, up: 0.08, back: 0.08 });
    const earTip = head.local({ left: s * 0.32, up: 0.18, back: 0.26 });
    const earPath = bezier(
      earBase,
      head.local({ left: s * 0.22, up: 0.20, back: 0.12 }),
      head.local({ left: s * 0.29, up: 0.22, back: 0.18 }),
      earTip
    );
    b.sweep(earPath, (t) => [0.042 * (1 - 0.7 * t), 0.012 * (1 - 0.6 * t)], {
      bone: head,
      color: CEL_TEAL,
      group: "head",
    });
    b.sweep(earPath.slice(0.12, 0.8), (t) => [0.024 * (1 - t), 0.007], {
      bone: head,
      color: CEL_CREAM,
      group: "head",
    });

    b.part(new THREE.TorusGeometry(0.018, 0.005, 6, 12), CEL_GOLD, {
      bone: head,
      at: head.local({ left: s * 0.20, up: 0.13, back: 0.10 }),
      group: "head",
    });
    b.part(new THREE.SphereGeometry(0.011, 8, 8), CEL_JADE, {
      bone: head,
      at: head.local({ left: s * 0.20, up: 0.09, back: 0.10 }),
      group: "head",
    });
  }

  // ---------------------------------------------------------------------------
  // FOREHEAD KIRIN PEARL & CENTRAL UNICORN HORN
  // ---------------------------------------------------------------------------
  b.part(new THREE.CylinderGeometry(0.040, 0.028, 0.020, 10), CEL_GOLD, {
    bone: head,
    at: head.local({ forward: 0.19, up: 0.13 }),
    dir: head.dir([0, 0.65, 0.76]),
    group: "head",
  });

  glow(
    b.part(new THREE.SphereGeometry(0.032, 14, 10), GLOW_BLUE, {
      bone: head,
      at: head.local({ forward: 0.20, up: 0.145 }),
      group: "head",
    }),
    2.5
  );

  b.spike(
    head.local({ forward: 0.18, up: 0.15 }),
    head.dir([0, 0.65, 0.76]),
    0.20,
    0.024,
    { bone: head, color: CEL_GOLD_BRIGHT, group: "head" }
  );

  // ---------------------------------------------------------------------------
  // BRANCHING CRYSTAL ANTLERS (Swept Outward & Backward Gracefully)
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const socket = head.local({ left: s * 0.09, up: 0.12, back: 0.04 });

    b.part(new THREE.TorusGeometry(0.036, 0.010, 8, 16), CEL_GOLD, {
      bone: head,
      at: socket,
      dir: head.dir([s * 0.4, 0.7, -0.5]),
      group: "antlers",
    });

    // Gracefully curved main antler beam: arches outward, sweeps back, curves up
    const p0 = socket;
    const p1 = head.local({ left: s * 0.20, up: 0.32, back: -0.02 });
    const p2 = head.local({ left: s * 0.34, up: 0.52, back: -0.12 });
    const p3 = head.local({ left: s * 0.38, up: 0.72, back: -0.28 });
    const p4 = head.local({ left: s * 0.32, up: 0.88, back: -0.42 });

    const mainBeam = catmull([p0, p1, p2, p3, p4]);
    b.sweep(mainBeam, (t) => Math.max(0.006, 0.038 * (1 - 0.75 * t)), {
      bone: head,
      color: CEL_CREAM,
      bands: [
        [0.20, CEL_DARK_HORN],
        [0.40, CEL_GOLD],
        [0.82, CEL_CREAM],
        [1.0, GLOW_CYAN],
      ],
      group: "antlers",
    });

    // Brow tine (reaching forward-up-out)
    const browTip = head.local({ left: s * 0.24, up: 0.46, forward: 0.12 });
    const browTine = catmull([p1, browTip]);
    b.sweep(browTine, [0.022, 0.005], { bone: head, color: CEL_CREAM, group: "antlers" });
    glow(
      b.part(new THREE.ConeGeometry(0.014, 0.052, 6), GLOW_CYAN, {
        bone: head,
        at: browTip.clone().add(head.dir([s * 0.1, 0.6, 0.5]).multiplyScalar(0.026)),
        dir: head.dir([s * 0.1, 0.6, 0.5]),
        group: "antlers",
      }),
      1.8
    );

    // Mid royal tine (branching wide outward and up)
    const midTip = head.local({ left: s * 0.48, up: 0.64, back: -0.06 });
    const midTine = catmull([p2, midTip]);
    b.sweep(midTine, [0.020, 0.004], { bone: head, color: CEL_CREAM, group: "antlers" });
    glow(
      b.part(new THREE.ConeGeometry(0.013, 0.048, 6), GLOW_CYAN, {
        bone: head,
        at: midTip.clone().add(head.dir([s * 0.8, 0.5, 0.1]).multiplyScalar(0.024)),
        dir: head.dir([s * 0.8, 0.5, 0.1]),
        group: "antlers",
      }),
      1.8
    );

    // Crown fork (curving inward and up)
    const crownTip = head.local({ left: s * 0.44, up: 0.82, back: -0.34 });
    const crownFork = catmull([p3, crownTip]);
    b.sweep(crownFork, [0.016, 0.004], { bone: head, color: CEL_CREAM, group: "antlers" });
    glow(
      b.part(new THREE.ConeGeometry(0.012, 0.044, 6), GLOW_CYAN, {
        bone: head,
        at: crownTip.clone().add(head.dir([s * 0.35, 0.6, -0.6]).multiplyScalar(0.022)),
        dir: head.dir([s * 0.35, 0.6, -0.6]),
        group: "antlers",
      }),
      1.8
    );

    // Main beam glowing crystal tip
    glow(
      b.part(new THREE.ConeGeometry(0.015, 0.058, 6), GLOW_CYAN, {
        bone: head,
        at: p4.clone().add(head.dir([s * 0.1, 0.55, -0.7]).multiplyScalar(0.029)),
        dir: head.dir([s * 0.1, 0.55, -0.7]),
        group: "antlers",
      }),
      2.0
    );
  }

  // ---------------------------------------------------------------------------
  // BREAST-COLLAR & SACRED CHEST MEDALLION
  // ---------------------------------------------------------------------------
  const breastCenter = new THREE.Vector3(0, 1.06, 0.54);

  for (const s of [1, -1]) {
    const collarPath = catmull([
      chest.local([s * 0.18, 0.18, 0.15]),
      chest.local([s * 0.19, 0.04, 0.28]),
      breastCenter,
    ]);
    b.sweep(collarPath, 0.015, { bone: chest, color: CEL_RED_SILK, group: "harness" });
  }

  b.part(new THREE.CylinderGeometry(0.072, 0.072, 0.018, 20), CEL_GOLD, {
    bone: chest,
    at: breastCenter,
    dir: [0, 0.18, 0.98],
    group: "harness",
  });

  b.part(new THREE.PlaneGeometry(0.125, 0.125), "#ffffff", {
    bone: chest,
    at: breastCenter.clone().add(new THREE.Vector3(0, 0.002, 0.011)),
    dir: [0, 0.18, 0.98],
    axis: "z",
    texture: MEDALLION_TEX,
    group: "harness",
  });

  b.part(new THREE.ConeGeometry(0.022, 0.038, 10), CEL_GOLD, {
    bone: chest,
    at: breastCenter.clone().add(new THREE.Vector3(0, -0.095, 0.01)),
    rotation: [180, 0, 0],
    group: "harness",
  });
  b.part(new THREE.SphereGeometry(0.013, 8, 8), CEL_JADE, {
    bone: chest,
    at: breastCenter.clone().add(new THREE.Vector3(0, -0.132, 0.01)),
    group: "harness",
  });

  // ---------------------------------------------------------------------------
  // CELESTIAL HAGOROMO (Grand Floating Aureole Halo Ribbon)
  // ---------------------------------------------------------------------------
  // Beautiful silk ribbon that arches HIGH over the back like a sacred halo,
  // swoops down past the flanks completely clear of the body, and trails behind
  for (const s of [1, -1]) {
    const sashPath = catmull([
      breastCenter.clone().add(new THREE.Vector3(s * 0.08, -0.02, -0.04)),
      new THREE.Vector3(s * 0.32, 1.28, 0.38),
      new THREE.Vector3(s * 0.44, 1.55, 0.18),
      new THREE.Vector3(s * 0.42, 1.72, -0.06), // Arch peak high over back
      new THREE.Vector3(s * 0.45, 1.48, -0.32),
      new THREE.Vector3(s * 0.42, 1.15, -0.58),
      new THREE.Vector3(s * 0.36, 0.94, -0.82),
      new THREE.Vector3(s * 0.28, 0.88, -1.02),
    ]);

    b.sweep(sashPath, (t) => [0.048 * (1 - 0.25 * t), 0.008], {
      bone: chest,
      color: CEL_RED_SILK,
      group: "sash",
    });

    // Golden tassel bells at ribbon ends
    const sashEnd = new THREE.Vector3(s * 0.28, 0.88, -1.02);
    b.part(new THREE.CylinderGeometry(0.020, 0.020, 0.024, 8), CEL_GOLD, {
      bone: chest,
      at: sashEnd,
      group: "sash",
    });
    b.part(new THREE.SphereGeometry(0.014, 8, 8), CEL_JADE, {
      bone: chest,
      at: sashEnd.clone().add(new THREE.Vector3(0, -0.038, 0)),
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
    const shoulderSocket = [s * 0.20, 1.12, 0.36];
    const frontHoofTarget = [s * 0.22, DAIS_SURFACE_Y + 0.025, 0.38];

    const frontPts = limb(
      shoulderSocket,
      frontHoofTarget,
      [0.44, 0.42, 0.22],
      [
        [0, 0, -1],
        [0, 0, 1],
      ]
    );

    const legF = b.chain(`legF${side}`, frontPts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `kneeF${side}`, `hoofF${side}`],
      role: "leg",
      contact: [s * 0.22, 0.0, 0.38],
    });

    b.sweep(legF, (t) => 0.068 * (1 - 0.50 * t) + 0.022, {
      color: SCALES_PAINT,
      group: `legF${side}`,
    });

    // Knee cap guard
    b.part(new THREE.BoxGeometry(0.048, 0.070, 0.034), CEL_GOLD, {
      bone: legF.joints[2],
      at: legF.joints[2].at.clone().add(new THREE.Vector3(0, 0, 0.024)),
      group: `legF${side}`,
    });

    // Elbow cloud puff
    addCloudCurl(
      legF.joints[1].at,
      new THREE.Vector3(s * 0.3, -0.25, -0.85).normalize(),
      new THREE.Vector3(0, 0.7, 0.4).normalize(),
      0.22,
      0.038,
      CEL_CLOUD_CYAN,
      legF.joints[1].object,
      `legF${side}`
    );

    const hoofPt = legF.tip ? legF.tip.at : frontHoofTarget;

    // Gilded runic cloven hoof
    b.part(new THREE.CylinderGeometry(0.038, 0.040, 0.040, 12), "#f59e0b", {
      bone: legF.tip ?? legF.joints[2],
      at: hoofPt.clone().add(new THREE.Vector3(0, 0.030, 0)),
      texture: HOOF_RUNE_TEX,
      group: `legF${side}`,
    });

    // Swirling ankle cloud billow
    buildCloudCluster(
      hoofPt.clone().add(new THREE.Vector3(0, 0.035, -0.02)),
      0.048,
      CEL_CLOUD_WHITE,
      legF.tip ? legF.tip.object : legF.joints[2].object,
      `legF${side}`
    );
    addCloudCurl(
      hoofPt.clone().add(new THREE.Vector3(0, 0.025, 0)),
      new THREE.Vector3(s * 0.45, 0.2, -0.8).normalize(),
      new THREE.Vector3(s * -0.5, 0.6, 0.35).normalize(),
      0.20,
      0.035,
      CEL_CLOUD_CYAN,
      legF.tip ? legF.tip.object : legF.joints[2].object,
      `legF${side}`
    );

    // Cloven toe points
    for (const toeS of [1, -1]) {
      const toePos = hoofPt.clone().add(new THREE.Vector3(toeS * 0.022, -0.015, 0.020));
      b.part(new THREE.ConeGeometry(0.024, 0.054, 6), CEL_GOLD, {
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
    const hipSocket = [s * 0.18, 1.05, -0.28];
    const hindHoofTarget = [s * 0.23, DAIS_SURFACE_Y + 0.025, -0.38];

    const hindPts = limb(
      hipSocket,
      hindHoofTarget,
      [0.45, 0.44, 0.22],
      [
        [0, 0, 1],
        [0, 0, -1],
      ]
    );

    const legH = b.chain(`legH${side}`, hindPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `hoofH${side}`],
      role: "leg",
      contact: [s * 0.23, 0.0, -0.38],
    });

    b.sweep(legH, (t) => 0.078 * (1 - 0.52 * t) + 0.024, {
      color: SCALES_PAINT,
      group: `legH${side}`,
    });

    // Hock guard
    b.part(new THREE.BoxGeometry(0.050, 0.075, 0.036), CEL_GOLD, {
      bone: legH.joints[2],
      at: legH.joints[2].at.clone().add(new THREE.Vector3(0, 0, -0.028)),
      group: `legH${side}`,
    });

    // Hock cloud puff
    addCloudCurl(
      legH.joints[2].at,
      new THREE.Vector3(s * 0.35, -0.25, -0.88).normalize(),
      new THREE.Vector3(0, 0.65, 0.45).normalize(),
      0.24,
      0.042,
      CEL_CLOUD_CYAN,
      legH.joints[2].object,
      `legH${side}`
    );

    const hoofPt = legH.tip ? legH.tip.at : hindHoofTarget;

    // Cloven hoof
    b.part(new THREE.CylinderGeometry(0.039, 0.041, 0.040, 12), "#f59e0b", {
      bone: legH.tip ?? legH.joints[2],
      at: hoofPt.clone().add(new THREE.Vector3(0, 0.030, 0)),
      texture: HOOF_RUNE_TEX,
      group: `legH${side}`,
    });

    // Ankle cloud
    buildCloudCluster(
      hoofPt.clone().add(new THREE.Vector3(0, 0.035, -0.02)),
      0.050,
      CEL_CLOUD_WHITE,
      legH.tip ? legH.tip.object : legH.joints[2].object,
      `legH${side}`
    );
    addCloudCurl(
      hoofPt.clone().add(new THREE.Vector3(0, 0.025, 0)),
      new THREE.Vector3(s * 0.5, 0.2, -0.75).normalize(),
      new THREE.Vector3(s * -0.5, 0.6, 0.35).normalize(),
      0.21,
      0.036,
      CEL_CLOUD_CYAN,
      legH.tip ? legH.tip.object : legH.joints[2].object,
      `legH${side}`
    );

    for (const toeS of [1, -1]) {
      const toePos = hoofPt.clone().add(new THREE.Vector3(toeS * 0.022, -0.015, 0.020));
      b.part(new THREE.ConeGeometry(0.025, 0.054, 6), CEL_GOLD, {
        bone: legH.tip ?? legH.joints[2],
        at: toePos,
        rotation: [-18, toeS * 10, 0],
        group: `legH${side}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // TAIL & MAGNIFICENT CLOUD PLUME BLOSSOM
  // ---------------------------------------------------------------------------
  b.sweep(tail, (t) => Math.max(0.016, 0.056 * (1 - 0.65 * t)), {
    color: SCALES_PAINT,
    group: "tail",
  });

  // Golden dorsal spines along tail
  for (let i = 0; i < 6; i++) {
    const t = 0.12 + (i / 5) * 0.55;
    const pt = tail.at(t);
    b.spike(pt.at, [0, 1, -0.2], 0.048, 0.016, { bone: pt.bone, color: CEL_GOLD, group: "tail" });
  }

  // Golden tail knot ring & tassel
  const plumeBasePt = tail.at(0.70);
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.038, 12), CEL_GOLD, {
    bone: plumeBasePt.bone,
    at: plumeBasePt.at,
    rotation: [30, 0, 0],
    group: "tail",
  });

  b.sweep(
    polyline([
      plumeBasePt.at.clone().add(new THREE.Vector3(0, -0.02, 0)),
      plumeBasePt.at.clone().add(new THREE.Vector3(0, -0.14, -0.02)),
    ]),
    0.006,
    { bone: plumeBasePt.bone, color: CEL_RED_SILK, group: "tail" }
  );
  b.part(new THREE.SphereGeometry(0.018, 8, 8), CEL_GOLD, {
    bone: plumeBasePt.bone,
    at: plumeBasePt.at.clone().add(new THREE.Vector3(0, -0.15, -0.02)),
    group: "tail",
  });

  const tipJoint = tail.joints[tail.joints.length - 1];

  // Huge, blooming cloud fire flame at the tail tip
  const tailCloudPos1 = tail.at(0.82).at;
  const tailCloudPos2 = tail.at(0.95).at;
  buildCloudCluster(tailCloudPos1, 0.095, CEL_CLOUD_WHITE, tipJoint.object, "tail");
  buildCloudCluster(tailCloudPos2, 0.110, CEL_CLOUD_CYAN, tipJoint.object, "tail");

  addCloudCurl(
    tailCloudPos1,
    new THREE.Vector3(0, 0.85, -0.4).normalize(),
    new THREE.Vector3(0, 0.35, 0.75).normalize(),
    0.38,
    0.060,
    CEL_CLOUD_WHITE,
    tipJoint.object,
    "tail"
  );
  addCloudCurl(
    tailCloudPos1,
    new THREE.Vector3(0, 0.70, 0.6).normalize(),
    new THREE.Vector3(0, -0.5, -0.6).normalize(),
    0.32,
    0.050,
    CEL_CLOUD_WHITE,
    tipJoint.object,
    "tail"
  );

  for (const s of [1, -1]) {
    addCloudCurl(
      tailCloudPos2,
      new THREE.Vector3(s * 0.75, 0.55, -0.3).normalize(),
      new THREE.Vector3(s * -0.5, 0.6, 0.4).normalize(),
      0.34,
      0.052,
      CEL_CLOUD_CYAN,
      tipJoint.object,
      "tail"
    );
    addCloudCurl(
      tailCloudPos2,
      new THREE.Vector3(s * 0.45, -0.35, -0.85).normalize(),
      new THREE.Vector3(s * -0.5, 0.65, 0.25).normalize(),
      0.30,
      0.044,
      CEL_CLOUD_WHITE,
      tipJoint.object,
      "tail"
    );
  }

  addCloudCurl(
    tailCloudPos2,
    new THREE.Vector3(0, 0.65, -0.7).normalize(),
    new THREE.Vector3(0, -0.6, 0.5).normalize(),
    0.36,
    0.054,
    CEL_CLOUD_CYAN,
    tipJoint.object,
    "tail"
  );

  // ---------------------------------------------------------------------------
  // PEDESTAL & SACRED LOTUS LANTERNS
  // ---------------------------------------------------------------------------
  // Dark obsidian bottom dais tier
  b.part(new THREE.CylinderGeometry(1.18, 1.22, 0.036, 36), cel("#1e293b", "#0f172a"), {
    at: [0, 0.018, 0],
    group: "pedestal",
  });

  // Sacred emerald middle tier
  b.part(new THREE.CylinderGeometry(0.98, 1.02, 0.036, 36), cel("#065f46", "#022c22"), {
    at: [0, 0.054, 0],
    group: "pedestal",
  });

  // Concentric gold filigree rim
  b.part(new THREE.TorusGeometry(1.00, 0.014, 8, 40), CEL_GOLD, {
    at: [0, 0.072, 0],
    rotation: [90, 0, 0],
    group: "pedestal",
  });

  // Sculpted golden lotus petal points encircling the dais
  for (let k = 0; k < 16; k++) {
    const angle = (k * Math.PI) / 8;
    const px = Math.cos(angle) * 1.04;
    const pz = Math.sin(angle) * 1.04;
    b.part(new THREE.ConeGeometry(0.048, 0.12, 4), CEL_GOLD, {
      at: [px, 0.058, pz],
      dir: [Math.cos(angle), 0.14, Math.sin(angle)],
      group: "pedestal",
    });
  }

  // Auspicious cloud puffs circling the outer dais edge
  for (let k = 0; k < 8; k++) {
    const angle = (k * Math.PI) / 4 + 0.25;
    const px = Math.cos(angle) * 1.12;
    const pz = Math.sin(angle) * 1.12;
    buildCloudCluster(new THREE.Vector3(px, 0.032, pz), 0.065, CEL_CLOUD_WHITE, null, "pedestal");
  }

  // Four Auspicious Spirit Lanterns on the Lotus Dais
  const lanternAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
  const lanternColors = [GLOW_CYAN, GLOW_GOLD, GLOW_BLUE, GLOW_CYAN];

  for (let i = 0; i < 4; i++) {
    const ang = lanternAngles[i];
    const lx = Math.cos(ang) * 0.84;
    const lz = Math.sin(ang) * 0.84;
    const lBase = new THREE.Vector3(lx, 0.072, lz);

    b.part(new THREE.CylinderGeometry(0.048, 0.058, 0.026, 8), CEL_GOLD, {
      at: lBase.clone().add(new THREE.Vector3(0, 0.013, 0)),
      group: "pedestal",
    });

    for (let p = 0; p < 6; p++) {
      const pAng = (p * Math.PI) / 3;
      b.part(new THREE.ConeGeometry(0.018, 0.042, 4), CEL_GOLD, {
        at: lBase.clone().add(new THREE.Vector3(Math.cos(pAng) * 0.040, 0.030, Math.sin(pAng) * 0.040)),
        dir: [Math.cos(pAng) * 0.5, 0.85, Math.sin(pAng) * 0.5],
        group: "pedestal",
      });
    }

    glow(
      b.part(new THREE.SphereGeometry(0.030, 12, 10), lanternColors[i], {
        at: lBase.clone().add(new THREE.Vector3(0, 0.058, 0)),
        group: "pedestal",
      }),
      2.5
    );
  }

  // ---------------------------------------------------------------------------
  // NOBLE REST POSE
  // ---------------------------------------------------------------------------
  b.pose(jaw, { deg: 6, axis: [1, 0, 0] });

  return b.root;
}
