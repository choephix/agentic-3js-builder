import * as THREE from "three";
import {
  createBuilder,
  frame,
  line,
  aim,
  lerp,
  mid,
  offset,
  rng,
  arc,
  bezier,
  catmull,
  polyline,
  spiral,
  limb,
  countershade,
  paint,
  spots,
  stripes,
  scales,
  mottle,
  gradient,
  grain,
  patches,
  svg,
  mix,
  noise,
  smoothstep,
  rgb,
  vec,
  DEG,
} from "../../../../src/index";
import { cel, shadowOf, animeEye, furEdge, inkLines, zigzag, KEY_LIGHT, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "qilin",
  description:
    "A celestial qilin chimera with iridescent dragon scales, cloven hooves, branching crystal antlers, swirling cloud mane, floating hagoromo sash, and sacred mist pedestal in high-fantasy anime style.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "qilin" });
  const R = rng(108);

  // ---------------------------------------------------------------------------
  // PALETTE & PAINTS (High-Fantasy Anime Cel Shading)
  // ---------------------------------------------------------------------------
  const CEL_TEAL = cel("#1bbfae", "#0e756c");
  const CEL_JADE_DARK = cel("#0f766e", "#074843");
  const CEL_CREAM = cel("#fffdf7", "#f0dfc2");
  const CEL_GOLD = cel("#fcd34d", "#b47c10");
  const CEL_GOLD_BRIGHT = cel("#fef08a", "#d97706");
  const CEL_RED_SILK = cel("#ef4444", "#991b1b");
  const CEL_CLOUD_WHITE = cel("#f8fafc", "#cbd5e1");
  const CEL_CLOUD_CYAN = cel("#5eead4", "#0d9488");
  const CEL_LILAC = cel("#e0e7ff", "#a5b4fc");
  const CEL_DARK_HORN = cel("#261c31", "#150e1d");
  const CEL_JADE = cel("#34d399", "#059669");
  const CEL_MOUTH = cel("#f43f5e", "#9f1239");

  const GLOW_CYAN = "#2dd4bf";
  const GLOW_GOLD = "#fbbf24";
  const GLOW_BLUE = "#38bdf8";

  // Iridescent dragon scale paint across the body
  const SCALES_PAINT = paint((p, n) => {
    // Golden scute dorsal ridge
    if (Math.abs(p.x) < 0.038 && n.y > 0.42) return "#fcd34d";
    // Soft pearlescent belly countershade
    if (n.y < -0.20) return "#fffdf7";
    // Multi-octave dragon scale cellular sheen
    const v1 = noise(p, 0.055, 17);
    const v2 = noise(p, 0.024, 31);
    const val = 0.68 * v1 + 0.32 * v2;
    if (val > 0.68) return "#5eead4";
    if (val < 0.32) return "#0f766e";
    return "#1bbfae";
  });

  // Auspicious cloud paint for manes and tufts
  const CLOUD_PAINT = paint((p, n) => {
    const w = noise(p, 0.12, 73);
    const up = n.y * 0.5 + 0.5;
    if (up > 0.72 && w > 0.52) return "#5eead4";
    if (up > 0.30) return "#f8fafc";
    return "#cbd5e1";
  });

  // ---------------------------------------------------------------------------
  // BESPOKE SVG TEXTURES
  // ---------------------------------------------------------------------------
  // High-fantasy celestial anime eye
  const EYE_TEXTURE = svg(
    `<svg viewBox="0 0 120 160">
      <defs>
        <linearGradient id="irisG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#042f2e" />
          <stop offset="35%" stop-color="#0d9488" />
          <stop offset="70%" stop-color="#2dd4bf" />
          <stop offset="100%" stop-color="#99f6e4" />
        </linearGradient>
        <radialGradient id="starG" cx="50%" cy="55%" r="45%">
          <stop offset="0%" stop-color="#fef08a" stop-opacity="0.95" />
          <stop offset="45%" stop-color="#f59e0b" stop-opacity="0.65" />
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
        <polygon points="65,72 68,85 81,88 68,91 65,104 62,91 49,88 62,85" fill="#fef08a" opacity="0.9" />
        <path d="M 40 102 C 52 124, 78 124, 90 102" fill="none" stroke="#5eead4" stroke-width="3.5" stroke-linecap="round" />
        <path d="M 15 20 Q 65 65 115 45 L 115 10 L 15 10 Z" fill="#042f2e" opacity="0.55" />
        <circle cx="48" cy="62" r="11" fill="#ffffff" />
        <circle cx="82" cy="100" r="5" fill="#ffffff" />
        <circle cx="50" cy="98" r="3" fill="#ffffff" />
      </g>
      <path d="M 10 75 C 20 30, 65 12, 112 45" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round" />
      <path d="M 12 76 C 18 33, 63 15, 108 47" fill="none" stroke="#0d9488" stroke-width="2.5" />
      <path d="M 105 48 Q 118 42 122 30" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" />
      <path d="M 98 42 Q 106 32 110 24" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" />
      <path d="M 28 120 C 50 148, 85 142, 102 125" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" />
      <path d="M 35 15 C 65 -2, 95 10, 110 25" fill="none" stroke="#d97706" stroke-width="4.5" stroke-linecap="round" />
      <path d="M 38 15 C 65 1, 93 11, 106 24" fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" />
    </svg>`,
    { size: 512 }
  );

  // Chest medallion emblem
  const MEDALLION_TEX = svg(
    `<svg viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="60" fill="#f59e0b" stroke="#78350f" stroke-width="4" />
      <circle cx="64" cy="64" r="50" fill="#fef3c7" stroke="#b45309" stroke-width="2" />
      ${[0, 45, 90, 135, 180, 225, 270, 315]
        .map((a) => `<polygon points="64,18 70,30 58,30" transform="rotate(${a} 64 64)" fill="#dc2626" />`)
        .join("")}
      <circle cx="64" cy="64" r="32" fill="#0d9488" stroke="#042f2e" stroke-width="3" />
      <path d="M 64 32 A 16 16 0 0 1 64 64 A 16 16 0 0 0 64 96 A 32 32 0 0 1 64 32 Z" fill="#5eead4" />
      <circle cx="64" cy="48" r="6" fill="#042f2e" />
      <circle cx="64" cy="80" r="6" fill="#fef3c7" />
      <circle cx="64" cy="64" r="8" fill="#f59e0b" />
    </svg>`,
    { size: 256 }
  );

  // Celestial silk sash brocade
  const SASH_TEX = svg(
    `<svg viewBox="0 0 64 256">
      <rect width="64" height="256" fill="#dc2626" />
      <line x1="6" y1="0" x2="6" y2="256" stroke="#fef08a" stroke-width="4" />
      <line x1="58" y1="0" x2="58" y2="256" stroke="#fef08a" stroke-width="4" />
      ${[32, 96, 160, 224]
        .map(
          (y) =>
            `<polygon points="32,${y - 20} 50,${y} 32,${y + 20} 14,${y}" fill="#f59e0b" stroke="#fef08a" stroke-width="2" />
             <circle cx="32" cy="${y}" r="6" fill="#0d9488" />`
        )
        .join("")}
    </svg>`,
    { size: 256 }
  );

  // Cloven hoof golden runes
  const HOOF_RUNE_TEX = svg(
    `<svg viewBox="0 0 128 64">
      <path d="M 10 32 Q 25 10 40 32 T 70 32 T 100 32 T 120 32" fill="none" stroke="#fef08a" stroke-width="4" />
      <circle cx="25" cy="32" r="5" fill="#f59e0b" />
      <circle cx="55" cy="32" r="5" fill="#f59e0b" />
      <circle cx="85" cy="32" r="5" fill="#f59e0b" />
      <circle cx="115" cy="32" r="5" fill="#f59e0b" />
      <path d="M 40 18 L 40 46 M 70 18 L 70 46 M 100 18 L 100 46" stroke="#fbbf24" stroke-width="2" />
    </svg>`,
    { size: 128 }
  );

  // ---------------------------------------------------------------------------
  // SKELETON HIERARCHY
  // ---------------------------------------------------------------------------
  // Root Joint: Hips / Pelvis
  const hips = b.joint("hips", { at: [0, 1.12, -0.15], role: "spine" });

  // Spine Chain (Chest / Torso)
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.12, -0.15],
      [0, 1.16, 0.15],
      [0, 1.22, 0.46],
    ]),
    { parent: hips, names: ["spine1", "chest"], role: "spine" }
  );
  const chest = spine.joints[1];

  // Neck Chain (Graceful, muscular arched neck)
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.22, 0.46],
      [0, 1.45, 0.68],
      [0, 1.74, 0.84],
      [0, 1.98, 0.90],
    ]),
    { parent: chest, names: ["neck1", "neck2", "neck3"], role: "neck" }
  );
  const neckTip = neck.joints[2];

  // Head Joint (Faces forward-up)
  const head = b.joint("head", {
    parent: neckTip,
    at: [0, 1.98, 0.90],
    dir: [0, 0.15, 0.98],
    role: "head",
    group: "head",
  });

  // Jaw Joint (Lower jaw, can open for roar / expression)
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.06, down: 0.08 }),
    aim: head.local({ forward: 0.32, down: 0.14 }),
    role: "jaw",
    group: "head",
  });

  // Tail Chain (Long, supple dragon tail that blossoms into a plume)
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.10, -0.32],
      [0, 0.96, -0.65],
      [0, 0.84, -1.02],
      [0, 0.92, -1.36],
      [0, 1.16, -1.60],
      [0, 1.42, -1.52],
    ]),
    { parent: hips, count: 5, role: "tail" }
  );

  // ---------------------------------------------------------------------------
  // TORSO, RIBCAGE & DORSAL SCUTES
  // ---------------------------------------------------------------------------
  // Main sculpted dragon-horse barrel
  b.loft(
    [
      { at: [0, 1.08, -0.22], w: 0.42, h: 0.46 },
      { at: [0, 1.12, 0.08], w: 0.38, h: 0.42 },
      { at: [0, 1.17, 0.30], w: 0.46, h: 0.50 },
      { at: [0, 1.20, 0.48], w: 0.42, h: 0.48 },
    ],
    { bone: [hips, spine.joints[0], chest], color: SCALES_PAINT, group: "torso" }
  );

  // Flank protective dragon scale plates
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.04, 0.18, 0.28), CEL_JADE_DARK, {
      bone: chest,
      at: [s * 0.22, 1.16, 0.28],
      rotation: [s * 10, s * 5, s * -15],
      group: "torso",
    });
    b.part(new THREE.BoxGeometry(0.03, 0.16, 0.24), CEL_GOLD, {
      bone: hips,
      at: [s * 0.21, 1.10, -0.12],
      rotation: [s * -8, s * -5, s * -12],
      group: "torso",
    });
  }

  // Dorsal gold spine scutes along the spine
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const pt = spine.at(t);
    b.spike(pt.at, [0, 1, 0.2], 0.065, 0.022, { bone: pt.bone, color: CEL_GOLD, group: "torso" });
  }

  // ---------------------------------------------------------------------------
  // NECK & DORSAL CLOUD MANE
  // ---------------------------------------------------------------------------
  // Arched neck sweep with elliptical cross section (deeper than wide)
  b.sweep(neck, (t) => [0.16 * (1 - 0.25 * t), 0.22 * (1 - 0.2 * t)], {
    color: SCALES_PAINT,
    group: "neck",
  });

  // Helper for stylized anime cloud curls
  function addCloudCurl(
    start: THREE.Vector3,
    dirOut: THREE.Vector3,
    dirCurl: THREE.Vector3,
    length: number,
    rMax: number,
    color: string | typeof CLOUD_PAINT,
    boneRef?: THREE.Object3D | THREE.Bone | null,
    grp = "mane"
  ) {
    const p0 = start.clone();
    const p1 = p0.clone().addScaledVector(dirOut, length * 0.45);
    const p2 = p1.clone().addScaledVector(dirCurl, length * 0.35);
    const p3 = p2.clone().addScaledVector(dirOut, -length * 0.22);
    const p4 = p3.clone().addScaledVector(dirCurl, -length * 0.18);
    const curlPath = catmull([p0, p1, p2, p3, p4]);
    b.sweep(
      curlPath,
      (t) => {
        if (t < 0.35) return rMax * (0.3 + 0.7 * (t / 0.35));
        return Math.max(0.002, rMax * (1.0 - (t - 0.35) / 0.65));
      },
      { bone: boneRef ?? undefined, color, group: grp }
    );
  }

  // Voluminous cloud mane along the neck crest
  const maneSteps = 8;
  for (let i = 0; i < maneSteps; i++) {
    const t = 0.08 + (i / (maneSteps - 1)) * 0.88;
    const pt = neck.at(t);
    const basePt = pt.at.clone().add(new THREE.Vector3(0, 0.09, -0.04));

    // Main center ivory puff
    addCloudCurl(
      basePt,
      new THREE.Vector3(0, 0.7, -0.65).normalize(),
      new THREE.Vector3(0, 0.4, 0.8).normalize(),
      0.22 + i * 0.015,
      0.042 + (i % 2) * 0.008,
      CEL_CLOUD_WHITE,
      pt.bone.object,
      "mane"
    );

    // Lateral billowing cyan curl accents
    for (const s of [1, -1]) {
      addCloudCurl(
        basePt.clone().add(new THREE.Vector3(s * 0.05, -0.02, 0)),
        new THREE.Vector3(s * 0.6, 0.5, -0.5).normalize(),
        new THREE.Vector3(s * -0.4, 0.6, 0.3).normalize(),
        0.18,
        0.032,
        CEL_CLOUD_CYAN,
        pt.bone.object,
        "mane"
      );
    }
  }

  // Cloud mantle pads on withers / shoulders
  for (const s of [1, -1]) {
    const withersPt = chest.local([s * 0.16, 0.12, -0.08]);
    addCloudCurl(
      withersPt,
      new THREE.Vector3(s * 0.5, 0.4, -0.7).normalize(),
      new THREE.Vector3(s * -0.5, 0.5, 0.4).normalize(),
      0.24,
      0.048,
      CEL_CLOUD_WHITE,
      chest.object,
      "mane"
    );
  }

  // ---------------------------------------------------------------------------
  // HEAD, FACE & JAW
  // ---------------------------------------------------------------------------
  // Skull base
  const skull = b.part(
    new THREE.SphereGeometry(0.125, 14, 10),
    SCALES_PAINT,
    { bone: head, at: head.local([0, 0.04, 0.06]), scale: [0.95, 1.1, 1.3], group: "head" }
  );

  // Upper Snout & Muzzle
  b.frustumBox(
    head.local([0, 0.02, 0.16]),
    head.local([0, -0.01, 0.38]),
    [0.16, 0.14],
    [0.10, 0.09],
    { bone: head, color: CEL_TEAL, group: "head" }
  );

  // Gilded flared nostrils
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.018, 0.014, 0.035, 8), CEL_GOLD, {
      bone: head,
      at: head.local([s * 0.042, -0.01, 0.36]),
      rotation: [20, s * 25, 0],
      group: "head",
    });
  }

  // Upper fangs / anime canines
  for (const s of [1, -1]) {
    b.spike(head.local([s * 0.045, -0.045, 0.28]), [0, -1, 0.1], 0.042, 0.010, {
      bone: head,
      color: "#ffffff",
      group: "head",
    });
  }

  // Expressive anime decals on left and right skull
  for (const s of [1, -1]) {
    b.decal(skull, EYE_TEXTURE, {
      at: head.local([s * 0.096, 0.05, 0.14]),
      dir: head.dir([s * 0.85, 0.12, 0.5]),
      size: [0.082, 0.11],
      mirror: s > 0,
      bone: head,
      group: "head",
    });
  }

  // Sinuous dragon whiskers (Celestial barbel tendrils)
  for (const s of [1, -1]) {
    // Golden whisker base stud
    b.part(new THREE.SphereGeometry(0.014, 8, 6), CEL_GOLD, {
      bone: head,
      at: head.local([s * 0.05, -0.01, 0.34]),
      group: "head",
    });

    const whiskerPath = catmull([
      head.local([s * 0.05, -0.01, 0.34]),
      head.local([s * 0.18, 0.04, 0.40]),
      head.local([s * 0.28, -0.03, 0.26]),
      head.local([s * 0.36, -0.12, 0.06]),
      head.local([s * 0.30, -0.18, -0.14]),
      head.local([s * 0.22, -0.16, -0.28]),
    ]);

    glow(
      b.sweep(whiskerPath, (t) => Math.max(0.0015, 0.009 * (1 - 0.85 * t)), {
        bone: head,
        color: GLOW_CYAN,
        group: "head",
      }),
      1.5
    );
  }

  // Cheek cloud ruffs
  for (const s of [1, -1]) {
    addCloudCurl(
      head.local([s * 0.09, 0.01, 0.04]),
      head.dir([s * 0.7, -0.2, -0.6]),
      head.dir([s * -0.4, 0.5, 0.3]),
      0.16,
      0.032,
      CEL_CLOUD_CYAN,
      head.object,
      "head"
    );
  }

  // Lower Jaw
  b.frustumBox(
    jaw.local([0, -0.01, 0.02]),
    jaw.local([0, 0.0, 0.26]),
    [0.13, 0.08],
    [0.08, 0.05],
    { bone: jaw, color: CEL_CREAM, group: "head" }
  );

  // Tongue and lower incisors
  b.part(new THREE.BoxGeometry(0.045, 0.012, 0.08), CEL_MOUTH, {
    bone: jaw,
    at: jaw.local([0, 0.01, 0.14]),
    group: "head",
  });
  for (const s of [1, -1]) {
    b.spike(jaw.local([s * 0.03, 0.015, 0.22]), [0, 1, 0.1], 0.025, 0.006, {
      bone: jaw,
      color: "#ffffff",
      group: "head",
    });
  }

  // Chin Beard (Flowing triple cloud lock with golden ring tie)
  b.part(new THREE.TorusGeometry(0.024, 0.007, 8, 16), CEL_GOLD, {
    bone: jaw,
    at: jaw.local([0, -0.025, 0.24]),
    rotation: [90, 0, 0],
    group: "head",
  });
  addCloudCurl(
    jaw.local([0, -0.03, 0.24]),
    jaw.dir([0, -0.8, -0.4]),
    jaw.dir([0, 0.5, 0.6]),
    0.26,
    0.038,
    CEL_CLOUD_WHITE,
    jaw.object,
    "head"
  );
  for (const s of [1, -1]) {
    addCloudCurl(
      jaw.local([s * 0.02, -0.03, 0.22]),
      jaw.dir([s * 0.5, -0.7, -0.3]),
      jaw.dir([s * -0.4, 0.4, 0.5]),
      0.18,
      0.026,
      CEL_CLOUD_CYAN,
      jaw.object,
      "head"
    );
  }

  // Deer / Dragon Ears
  for (const s of [1, -1]) {
    const earBase = head.local([s * 0.11, 0.11, -0.02]);
    const earPath = bezier(
      earBase,
      head.local([s * 0.24, 0.22, -0.08]),
      head.local([s * 0.32, 0.25, -0.16]),
      head.local([s * 0.38, 0.26, -0.25])
    );
    b.sweep(earPath, (t) => [0.038 * (1 - 0.7 * t), 0.012 * (1 - 0.6 * t)], {
      bone: head,
      color: CEL_TEAL,
      group: "head",
    });
    // Inner ear cream fluff
    b.sweep(earPath.slice(0.1, 0.8), (t) => [0.022 * (1 - t), 0.008], {
      bone: head,
      color: CEL_CREAM,
      group: "head",
    });
    // Golden earring hoop and jade drop
    b.part(new THREE.TorusGeometry(0.015, 0.004, 6, 12), CEL_GOLD, {
      bone: head,
      at: head.local([s * 0.20, 0.16, -0.06]),
      group: "head",
    });
    b.part(new THREE.SphereGeometry(0.008, 6, 6), CEL_JADE, {
      bone: head,
      at: head.local([s * 0.20, 0.13, -0.06]),
      group: "head",
    });
  }

  // ---------------------------------------------------------------------------
  // FOREHEAD JEWEL & THIRD HORN
  // ---------------------------------------------------------------------------
  // Lotus cup setting on forehead
  b.part(new THREE.CylinderGeometry(0.035, 0.022, 0.018, 10), CEL_GOLD, {
    bone: head,
    at: head.local([0, 0.10, 0.16]),
    rotation: [30, 0, 0],
    group: "head",
  });

  // Luminous Kirin Divine Pearl
  glow(
    b.part(new THREE.SphereGeometry(0.026, 14, 10), GLOW_BLUE, {
      bone: head,
      at: head.local([0, 0.115, 0.16]),
      group: "head",
    }),
    2.2
  );

  // Central spiral third horn
  b.spike(head.local([0, 0.13, 0.14]), head.dir([0, 0.7, 0.7]), 0.16, 0.020, {
    bone: head,
    color: CEL_GOLD_BRIGHT,
    group: "head",
  });

  // ---------------------------------------------------------------------------
  // BRANCHING ANTLERS
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const socket = head.local([s * 0.08, 0.14, 0.02]);

    // Golden base burr
    b.part(new THREE.TorusGeometry(0.034, 0.009, 8, 16), CEL_GOLD, {
      bone: head,
      at: socket,
      rotation: [40, s * -20, 0],
      group: "antlers",
    });

    // Main antler beam (sweeps up, out, and arching back)
    const p0 = socket;
    const p1 = head.local([s * 0.15, 0.35, 0.02]);
    const p2 = head.local([s * 0.24, 0.55, -0.08]);
    const p3 = head.local([s * 0.28, 0.72, -0.22]);
    const p4 = head.local([s * 0.26, 0.86, -0.34]);

    const mainBeam = catmull([p0, p1, p2, p3, p4]);
    b.sweep(mainBeam, (t) => Math.max(0.004, 0.032 * (1 - 0.78 * t)), {
      bone: head,
      color: CEL_CREAM,
      bands: [
        [0.25, CEL_DARK_HORN],
        [0.45, CEL_GOLD],
        [0.85, CEL_CREAM],
        [1.0, GLOW_CYAN],
      ],
      group: "antlers",
    });

    // Brow Tine (curves forward-up)
    const browTine = catmull([p1, head.local([s * 0.16, 0.44, 0.18])]);
    b.sweep(browTine, [0.020, 0.004], { bone: head, color: CEL_CREAM, group: "antlers" });
    glow(
      b.part(new THREE.ConeGeometry(0.012, 0.045, 6), GLOW_CYAN, {
        bone: head,
        at: head.local([s * 0.16, 0.46, 0.20]),
        dir: head.dir([s * 0.1, 0.6, 0.8]),
        group: "antlers",
      }),
      1.8
    );

    // Trez / Middle Tine (curves outward-up)
    const trezTine = catmull([p2, head.local([s * 0.38, 0.62, -0.04])]);
    b.sweep(trezTine, [0.018, 0.004], { bone: head, color: CEL_CREAM, group: "antlers" });
    glow(
      b.part(new THREE.ConeGeometry(0.011, 0.042, 6), GLOW_CYAN, {
        bone: head,
        at: head.local([s * 0.39, 0.63, -0.03]),
        dir: head.dir([s * 0.8, 0.6, 0.1]),
        group: "antlers",
      }),
      1.8
    );

    // Crown Fork (curves backward-up)
    const crownFork = catmull([p3, head.local([s * 0.35, 0.78, -0.38])]);
    b.sweep(crownFork, [0.015, 0.003], { bone: head, color: CEL_CREAM, group: "antlers" });
    glow(
      b.part(new THREE.ConeGeometry(0.010, 0.040, 6), GLOW_CYAN, {
        bone: head,
        at: head.local([s * 0.36, 0.80, -0.40]),
        dir: head.dir([s * 0.4, 0.5, -0.7]),
        group: "antlers",
      }),
      1.8
    );

    // Main beam tip crystal
    glow(
      b.part(new THREE.ConeGeometry(0.013, 0.052, 6), GLOW_CYAN, {
        bone: head,
        at: p4.clone().add(new THREE.Vector3(s * 0.01, 0.03, -0.02)),
        dir: head.dir([s * 0.2, 0.6, -0.7]),
        group: "antlers",
      }),
      2.0
    );
  }

  // ---------------------------------------------------------------------------
  // LEGS, HOOVES & ANKLE CLOUD TREADS
  // ---------------------------------------------------------------------------
  // Target hoof level: resting firmly on the dais top (y = 0.055)
  const HOOF_Y = 0.055;

  // FRONT LEGS
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulderSocket = [s * 0.20, 1.15, 0.42];
    const frontHoofTarget = [s * 0.22, HOOF_Y, 0.46];

    const frontPts = limb(
      shoulderSocket,
      frontHoofTarget,
      [0.45, 0.45, 0.22],
      [
        [0, 0, -1],
        [0, 0, 1],
      ]
    );

    const legF = b.chain(`legF${side}`, frontPts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `kneeF${side}`, `hoofF${side}`],
      role: "leg",
      contact: [s * 0.22, 0.0, 0.46],
    });

    b.sweep(legF, (t) => 0.062 * (1 - 0.48 * t) + 0.018, {
      color: SCALES_PAINT,
      group: `legF${side}`,
    });

    // Golden knee guard
    b.part(new THREE.BoxGeometry(0.045, 0.065, 0.03), CEL_GOLD, {
      bone: legF.joints[2],
      at: legF.joints[2].at.clone().add(new THREE.Vector3(0, 0, 0.02)),
      group: `legF${side}`,
    });

    // Elbow cloud tuft (billowing backward like celestial gait wind)
    const elbowPt = legF.joints[1].at;
    addCloudCurl(
      elbowPt,
      new THREE.Vector3(s * 0.2, -0.3, -0.8).normalize(),
      new THREE.Vector3(0, 0.7, 0.4).normalize(),
      0.18,
      0.032,
      CEL_CLOUD_CYAN,
      legF.joints[1].object,
      `legF${side}`
    );

    // Ankle golden fetlock cuff
    const pasternPt = legF.tip ? legF.tip.at : frontHoofTarget;
    b.part(new THREE.CylinderGeometry(0.034, 0.036, 0.04, 12), CEL_GOLD, {
      bone: legF.tip ?? legF.joints[2],
      at: pasternPt.clone().add(new THREE.Vector3(0, 0.035, 0)),
      group: `legF${side}`,
    });

    // Ankle swirling cloud tread
    addCloudCurl(
      pasternPt.clone().add(new THREE.Vector3(0, 0.02, 0)),
      new THREE.Vector3(s * 0.4, 0.1, -0.8).normalize(),
      new THREE.Vector3(s * -0.5, 0.5, 0.4).normalize(),
      0.16,
      0.030,
      CEL_CLOUD_WHITE,
      legF.tip ? legF.tip.object : legF.joints[2].object,
      `legF${side}`
    );

    // Split Cloven Hoof (Medial & Lateral Claws)
    for (const toeS of [1, -1]) {
      const toePos = pasternPt.clone().add(new THREE.Vector3(toeS * 0.020, -0.015, 0.018));
      b.part(new THREE.ConeGeometry(0.022, 0.055, 6), CEL_GOLD, {
        bone: legF.tip ?? legF.joints[2],
        at: toePos,
        rotation: [-20, toeS * 10, 0],
        texture: HOOF_RUNE_TEX,
        group: `legF${side}`,
      });
    }
  }

  // HIND LEGS
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipSocket = [s * 0.18, 1.08, -0.22];
    const hindHoofTarget = [s * 0.24, HOOF_Y, -0.44];

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
      contact: [s * 0.24, 0.0, -0.44],
    });

    b.sweep(legH, (t) => 0.075 * (1 - 0.54 * t) + 0.020, {
      color: SCALES_PAINT,
      group: `legH${side}`,
    });

    // Golden hock guard
    b.part(new THREE.BoxGeometry(0.048, 0.07, 0.032), CEL_GOLD, {
      bone: legH.joints[2],
      at: legH.joints[2].at.clone().add(new THREE.Vector3(0, 0, -0.025)),
      group: `legH${side}`,
    });

    // Hock cloud plume
    const hockPt = legH.joints[2].at;
    addCloudCurl(
      hockPt,
      new THREE.Vector3(s * 0.3, -0.2, -0.9).normalize(),
      new THREE.Vector3(0, 0.6, 0.5).normalize(),
      0.22,
      0.038,
      CEL_CLOUD_CYAN,
      legH.joints[2].object,
      `legH${side}`
    );

    // Ankle golden cuff
    const pasternPt = legH.tip ? legH.tip.at : hindHoofTarget;
    b.part(new THREE.CylinderGeometry(0.035, 0.038, 0.04, 12), CEL_GOLD, {
      bone: legH.tip ?? legH.joints[2],
      at: pasternPt.clone().add(new THREE.Vector3(0, 0.035, 0)),
      group: `legH${side}`,
    });

    // Ankle cloud tread
    addCloudCurl(
      pasternPt.clone().add(new THREE.Vector3(0, 0.02, 0)),
      new THREE.Vector3(s * 0.5, 0.15, -0.7).normalize(),
      new THREE.Vector3(s * -0.5, 0.6, 0.4).normalize(),
      0.18,
      0.032,
      CEL_CLOUD_WHITE,
      legH.tip ? legH.tip.object : legH.joints[2].object,
      `legH${side}`
    );

    // Split Cloven Hoof
    for (const toeS of [1, -1]) {
      const toePos = pasternPt.clone().add(new THREE.Vector3(toeS * 0.021, -0.015, 0.018));
      b.part(new THREE.ConeGeometry(0.023, 0.055, 6), CEL_GOLD, {
        bone: legH.tip ?? legH.joints[2],
        at: toePos,
        rotation: [-20, toeS * 10, 0],
        texture: HOOF_RUNE_TEX,
        group: `legH${side}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // TAIL & CLOUD PLUME
  // ---------------------------------------------------------------------------
  // Sinuous dragon tail base
  b.sweep(tail, (t) => Math.max(0.014, 0.050 * (1 - 0.65 * t)), {
    color: SCALES_PAINT,
    group: "tail",
  });

  // Dorsal gold tail spines
  for (let i = 0; i < 6; i++) {
    const t = 0.15 + (i / 5) * 0.55;
    const pt = tail.at(t);
    b.spike(pt.at, [0, 1, -0.2], 0.045, 0.015, { bone: pt.bone, color: CEL_GOLD, group: "tail" });
  }

  // Golden cuff ring binding the base of the tail plume
  const plumeBasePt = tail.at(0.72);
  b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.035, 12), CEL_GOLD, {
    bone: plumeBasePt.bone,
    at: plumeBasePt.at,
    rotation: [30, 0, 0],
    group: "tail",
  });

  // Hanging vermilion tassel cord with golden bell
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

  // Expansive Cloud Plume (Blossom of 7 swirling cloud locks)
  const tipJoint = tail.joints[tail.joints.length - 1];

  // 1. Central upward flame plume
  addCloudCurl(
    tail.at(0.85).at,
    new THREE.Vector3(0, 0.8, -0.4).normalize(),
    new THREE.Vector3(0, 0.3, 0.8).normalize(),
    0.34,
    0.055,
    CEL_CLOUD_WHITE,
    tipJoint.object,
    "tail"
  );

  // 2. Crest curl arching forward over the rump
  addCloudCurl(
    tail.at(0.78).at,
    new THREE.Vector3(0, 0.7, 0.6).normalize(),
    new THREE.Vector3(0, -0.5, -0.6).normalize(),
    0.28,
    0.046,
    CEL_CLOUD_WHITE,
    tipJoint.object,
    "tail"
  );

  // 3 & 4. Lateral billowing cloud wings
  for (const s of [1, -1]) {
    addCloudCurl(
      tail.at(0.82).at,
      new THREE.Vector3(s * 0.7, 0.5, -0.3).normalize(),
      new THREE.Vector3(s * -0.5, 0.6, 0.4).normalize(),
      0.30,
      0.048,
      CEL_CLOUD_CYAN,
      tipJoint.object,
      "tail"
    );
  }

  // 5 & 6. Lower trailing wisps
  for (const s of [1, -1]) {
    addCloudCurl(
      tail.at(0.92).at,
      new THREE.Vector3(s * 0.4, -0.4, -0.8).normalize(),
      new THREE.Vector3(s * -0.5, 0.7, 0.2).normalize(),
      0.26,
      0.038,
      CEL_CLOUD_WHITE,
      tipJoint.object,
      "tail"
    );
  }

  // 7. Tip flame hook
  addCloudCurl(
    tail.at(0.98).at,
    new THREE.Vector3(0, 0.6, -0.7).normalize(),
    new THREE.Vector3(0, -0.6, 0.5).normalize(),
    0.32,
    0.050,
    CEL_CLOUD_CYAN,
    tipJoint.object,
    "tail"
  );

  // ---------------------------------------------------------------------------
  // CELESTIAL HAGOROMO (Floating Sacred Silk Ribbon)
  // ---------------------------------------------------------------------------
  // Weightless divine sash looping around shoulders, flanks, and trailing behind
  for (const s of [1, -1]) {
    const sashPath = catmull([
      [0, 1.08, 0.62],
      [s * 0.28, 1.36, 0.52],
      [s * 0.38, 1.54, 0.28],
      [s * 0.42, 1.30, -0.02],
      [s * 0.38, 1.18, -0.32],
      [s * 0.46, 0.90, -0.62],
      [s * 0.54, 0.68, -0.88],
      [s * 0.46, 0.74, -1.04],
    ]);

    b.sweep(sashPath, (t) => [0.038 * (1 - 0.25 * t), 0.005], {
      bone: chest,
      color: CEL_RED_SILK,
      texture: SASH_TEX,
      group: "sash",
    });

    // Golden end clasp and jade tassel charm
    const sashEnd = new THREE.Vector3(s * 0.46, 0.74, -1.04);
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 8), CEL_GOLD, {
      bone: chest,
      at: sashEnd,
      group: "sash",
    });
    b.part(new THREE.SphereGeometry(0.012, 8, 8), CEL_JADE, {
      bone: chest,
      at: sashEnd.clone().add(new THREE.Vector3(0, -0.03, 0)),
      group: "sash",
    });
  }

  // ---------------------------------------------------------------------------
  // CHEST HARNESS & SACRED MEDALLION
  // ---------------------------------------------------------------------------
  // Braided red silk breast-collar across the withers
  for (const s of [1, -1]) {
    const strapPath = catmull([
      chest.local([0, 0.16, 0.25]),
      chest.local([s * 0.18, 0.05, 0.32]),
      chest.local([0, -0.08, 0.48]),
    ]);
    b.sweep(strapPath, 0.012, { bone: chest, color: CEL_RED_SILK, group: "harness" });
  }

  // Golden circular medallion roundel
  const medallionPos = chest.local([0, -0.08, 0.49]);
  b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.014, 20), CEL_GOLD, {
    bone: chest,
    at: medallionPos,
    dir: chest.dir([0, 0.25, 0.96]),
    group: "harness",
  });

  // Medallion decorative face plane
  b.part(new THREE.PlaneGeometry(0.118, 0.118), "#ffffff", {
    bone: chest,
    at: medallionPos.clone().add(chest.dir([0, 0.008, 0.008])),
    dir: chest.dir([0, 0.25, 0.96]),
    axis: "z",
    texture: MEDALLION_TEX,
    group: "harness",
  });

  // Hanging bell & jade drops
  b.part(new THREE.ConeGeometry(0.018, 0.032, 10), CEL_GOLD, {
    bone: chest,
    at: medallionPos.clone().add(new THREE.Vector3(0, -0.08, 0.01)),
    rotation: [180, 0, 0],
    group: "harness",
  });
  b.part(new THREE.SphereGeometry(0.010, 8, 8), CEL_JADE, {
    bone: chest,
    at: medallionPos.clone().add(new THREE.Vector3(0, -0.11, 0.01)),
    group: "harness",
  });

  // ---------------------------------------------------------------------------
  // STAGED PEDESTAL (Sacred Mountain Cloud Dais)
  // ---------------------------------------------------------------------------
  // Lower step: Dark celestial lapis stone disc (touching y = 0.0)
  b.part(new THREE.CylinderGeometry(1.15, 1.20, 0.03, 32), cel("#1e293b", "#0f172a"), {
    at: [0, 0.015, 0],
    group: "pedestal",
  });

  // Upper step: Polished deep jade stone dais
  b.part(new THREE.CylinderGeometry(0.98, 1.02, 0.025, 32), cel("#065f46", "#022c22"), {
    at: [0, 0.042, 0],
    group: "pedestal",
  });

  // Polished gold rim border
  b.part(new THREE.TorusGeometry(1.00, 0.012, 8, 36), CEL_GOLD, {
    at: [0, 0.055, 0],
    rotation: [90, 0, 0],
    group: "pedestal",
  });

  // Twelve radiating sacred lotus petals around the perimeter
  for (let k = 0; k < 12; k++) {
    const angle = (k * Math.PI) / 6;
    const px = Math.cos(angle) * 1.02;
    const pz = Math.sin(angle) * 1.02;
    b.part(new THREE.ConeGeometry(0.045, 0.12, 4), CEL_GOLD, {
      at: [px, 0.048, pz],
      dir: [Math.cos(angle), 0.15, Math.sin(angle)],
      group: "pedestal",
    });
  }

  // Auspicious cloud banks hugging the base of the dais
  for (let k = 0; k < 8; k++) {
    const angle = (k * Math.PI) / 4 + 0.2;
    const px = Math.cos(angle) * 1.08;
    const pz = Math.sin(angle) * 1.08;
    addCloudCurl(
      new THREE.Vector3(px, 0.02, pz),
      new THREE.Vector3(Math.cos(angle), 0.2, Math.sin(angle)).normalize(),
      new THREE.Vector3(-Math.sin(angle), 0.4, Math.cos(angle)).normalize(),
      0.28,
      0.055,
      CEL_CLOUD_WHITE,
      null,
      "pedestal"
    );
  }

  // Floating Celestial Spirit Motes (Will-o'-the-wisps)
  const wisps: [THREE.Vector3, string, number][] = [
    [new THREE.Vector3(0.92, 0.22, 0.42), GLOW_CYAN, 2.2],
    [new THREE.Vector3(-0.86, 0.32, 0.48), GLOW_GOLD, 2.0],
    [new THREE.Vector3(0.72, 0.36, -0.72), GLOW_BLUE, 2.4],
    [new THREE.Vector3(-0.68, 0.26, -0.82), GLOW_CYAN, 2.0],
    [new THREE.Vector3(0.0, 0.42, 1.06), GLOW_GOLD, 2.2],
  ];

  for (const [wispPos, col, intensity] of wisps) {
    glow(
      b.part(new THREE.SphereGeometry(0.030, 10, 8), col, {
        at: wispPos,
        group: "pedestal",
      }),
      intensity
    );
  }

  // ---------------------------------------------------------------------------
  // NOBLE REST POSE REFINEMENT
  // ---------------------------------------------------------------------------
  // Part the jaw slightly (6 degrees) to display the noble dragon fangs
  b.pose(jaw, { deg: 6, axis: [1, 0, 0] });

  return b.root;
}
