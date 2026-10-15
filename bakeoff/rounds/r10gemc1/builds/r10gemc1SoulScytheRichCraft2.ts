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
  countershade,
  paint,
  spots,
  stripes,
  grain,
  mottle,
  mix,
  noise,
  smoothstep,
  svg,
} from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A monumental League of Legends-styled hero weapon forged from ancient wyrm vertebrae, bound in shadow-iron and ablaze with spectral soulfire.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "dragonbone_soul_scythe", paintSize: 1024, detail: 1.0 });

  // ===========================================================================
  // PALETTE & PAINTS
  // ===========================================================================
  const SOUL_WHITE = "#eafffa";
  const SOUL_CYAN = "#00ffa3";
  const SOUL_TEAL = "#0bd1bf";
  const SOUL_DEEP = "#053f47";
  const TARNISHED_BRASS = "#947642";

  // Warm aged dragon bone with subtle grain and natural occlusion
  const DRAGON_BONE_PAINT = paint((p, n) => {
    const gn = noise(p, 0.06, 17);
    const ivory = mix("#f6ecd9", "#d4c5a9", gn);
    const dirt = smoothstep(0.38, 0.75, noise(p, 0.02, 88));
    const base = mix(ivory, "#604e38", dirt * 0.42);
    const ao = 0.72 + 0.28 * smoothstep(-0.6, 0.6, n.y);
    const edgeLight = smoothstep(0.68, 0.98, n.y) * 0.25;
    return mix(mix(base, "#2a2218", (1 - ao) * 0.45), "#ffffff", edgeLight);
  });

  // Scorched shadow bone for horns, spines, and dorsal fins
  const BLACK_BONE_PAINT = paint((p, n) => {
    const gn = noise(p, 0.07, 53);
    const dark = mix("#231e28", "#3a3242", gn);
    const edge = smoothstep(0.48, 0.95, n.y);
    return mix(dark, "#6f5f7a", edge * 0.35);
  });

  // Stylized shadow-iron metal with ethereal teal bounce sheen
  const SHADOW_IRON_PAINT = paint((p, n) => {
    const base = mix("#191e24", "#2e3944", noise(p, 0.05, 101));
    const sheen = smoothstep(0.55, 1.0, n.y) * smoothstep(0.3, 0.7, noise(p, 0.02, 14));
    return mix(base, "#00ffa3", sheen * 0.32);
  });

  // Dark obsidian pedestal stone with subtle crystalline veins
  const OBSIDIAN_PAINT = paint((p, n) => {
    const g1 = noise(p, 0.12, 9);
    const g2 = noise(p, 0.03, 62);
    const base = mix("#100d14", "#1d1726", g1);
    const vein = smoothstep(0.42, 0.68, g2);
    return mix(base, "#053f47", vein * 0.28);
  });

  // ===========================================================================
  // SVG TEXTURES (League of Legends Shadow Isles / Dragon Style)
  // ===========================================================================

  // 1. Blade Fuller Glowing Soul Rune Strip
  const RUNE_STRIP_TEX = svg(
    `<svg viewBox="0 0 96 512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gRune" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#053f47" stop-opacity="0.2"/>
          <stop offset="40%" stop-color="#00ffa3" stop-opacity="0.9"/>
          <stop offset="50%" stop-color="#ffffff" stop-opacity="1"/>
          <stop offset="60%" stop-color="#00ffa3" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#053f47" stop-opacity="0.2"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="96" height="512" fill="#0c1619"/>
      <path d="M 48 12 L 48 500" stroke="url(#gRune)" stroke-width="4"/>
      <g fill="none" stroke="#d5fff5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 28 35 L 48 18 L 68 35 L 48 52 Z M 48 18 L 48 70 M 34 60 L 62 60"/>
        <circle cx="48" cy="98" r="14" stroke="#00ffa3" stroke-width="2.8"/>
        <path d="M 34 98 L 62 98 M 48 84 L 48 112"/>
        <path d="M 30 152 L 48 134 L 66 152 L 48 170 M 30 170 L 66 134"/>
        <path d="M 38 200 L 48 190 L 58 200 L 48 228 L 58 238 L 38 238 Z"/>
        <path d="M 26 270 L 48 252 L 70 270 M 48 252 L 48 296 M 32 286 L 64 286"/>
        <circle cx="48" cy="336" r="11" fill="#00ffa3"/>
        <path d="M 26 336 L 70 336 M 36 320 L 60 352 M 36 352 L 60 320"/>
        <path d="M 30 395 L 48 378 L 66 395 L 48 412 L 30 395 M 48 412 L 48 432"/>
        <path d="M 34 460 L 48 444 L 62 460 L 48 488 M 30 472 L 66 472"/>
      </g>
      <circle cx="48" cy="18" r="4" fill="#ffffff"/>
      <circle cx="48" cy="134" r="4" fill="#ffffff"/>
      <circle cx="48" cy="252" r="4" fill="#ffffff"/>
      <circle cx="48" cy="378" r="4" fill="#ffffff"/>
      <circle cx="48" cy="444" r="4" fill="#ffffff"/>
    </svg>`,
    { size: 512 }
  );

  // 2. Trapped Howling Soul Face
  const SOUL_FACE_TEX = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="soulGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#00ffa3" stop-opacity="0.95"/>
          <stop offset="50%" stop-color="#053f47" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#053f47" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="64" cy="64" r="62" fill="url(#soulGlow)"/>
      <path d="M 64 16 C 40 16 28 34 28 58 C 28 78 38 98 48 108 C 54 114 74 114 80 108 C 90 98 100 78 100 58 C 100 34 88 16 64 16 Z" fill="#041a1f" stroke="#15f2d2" stroke-width="3"/>
      <ellipse cx="46" cy="50" rx="9" ry="15" fill="#00ffa3" transform="rotate(-12 46 50)"/>
      <ellipse cx="82" cy="50" rx="9" ry="15" fill="#00ffa3" transform="rotate(12 82 50)"/>
      <ellipse cx="46" cy="50" rx="4" ry="7" fill="#ffffff" transform="rotate(-12 46 50)"/>
      <ellipse cx="82" cy="50" rx="4" ry="7" fill="#ffffff" transform="rotate(12 82 50)"/>
      <path d="M 48 76 C 48 68 80 68 80 76 C 80 96 74 106 64 106 C 54 106 48 96 48 76 Z" fill="#00ffa3"/>
      <ellipse cx="64" cy="88" rx="7" ry="11" fill="#020f12"/>
      <path d="M 34 34 C 22 22 28 8 34 2 C 38 12 46 16 44 26" fill="none" stroke="#15f2d2" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 94 34 C 106 22 100 8 94 2 C 90 12 82 16 84 26" fill="none" stroke="#15f2d2" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,
    { size: 256 }
  );

  // 3. Ethereal Soulfire Flame Card
  const SOUL_FLAME_TEX = svg(
    `<svg viewBox="0 0 80 160" xmlns="http://www.w3.org/2000/svg">
      <path d="M 40 156 C 18 135 6 98 12 68 C 16 48 30 32 36 8 C 44 30 58 42 64 66 C 72 96 62 135 40 156 Z" fill="#042229" stroke="#00ffa3" stroke-width="2.5"/>
      <path d="M 40 146 C 24 128 16 100 20 76 C 24 60 34 48 38 26 C 44 46 54 56 58 74 C 64 98 56 128 40 146 Z" fill="#00ffa3"/>
      <path d="M 40 134 C 30 118 26 100 28 82 C 30 70 36 60 40 44 C 44 60 48 70 50 82 C 52 100 48 118 40 134 Z" fill="#eafffa"/>
    </svg>`,
    { size: 256 }
  );

  // 4. Glowing Slit Dragon Eye
  const DRAGON_EYE_TEX = svg(
    `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M 6 32 C 34 8 94 8 122 32 C 94 56 34 56 6 32 Z" fill="#04181c" stroke="#00ffa3" stroke-width="3"/>
      <ellipse cx="64" cy="32" rx="38" ry="24" fill="#00ffa3"/>
      <ellipse cx="64" cy="32" rx="26" ry="16" fill="#8affdb"/>
      <path d="M 64 12 C 58 22 58 42 64 52 C 70 42 70 22 64 12 Z" fill="#020a0d"/>
      <ellipse cx="54" cy="24" rx="6" ry="3.5" fill="#ffffff" transform="rotate(-15 54 24)"/>
      <circle cx="72" cy="38" r="3" fill="#ffffff"/>
    </svg>`,
    { size: 256 }
  );

  // 5. Altar Soul Vortex Decal
  const SOUL_WHIRL_TEX = svg(
    `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="whirlG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
          <stop offset="25%" stop-color="#00ffa3" stop-opacity="0.9"/>
          <stop offset="60%" stop-color="#053f47" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#021417" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="128" cy="128" r="124" fill="url(#whirlG)"/>
      <g fill="none" stroke="#15f2d2" stroke-width="3.5" stroke-linecap="round">
        <path d="M 128 128 C 142 98 174 88 198 104 C 222 120 226 156 206 182 C 186 208 150 218 114 196 C 78 174 68 128 90 92 C 112 56 162 46 204 68"/>
        <path d="M 128 128 C 114 158 82 168 58 152 C 34 136 30 100 50 74 C 70 48 106 38 142 60 C 178 82 188 128 166 164 C 144 200 94 210 52 188"/>
      </g>
      <circle cx="128" cy="128" r="14" fill="#ffffff"/>
      <circle cx="128" cy="128" r="24" fill="none" stroke="#00ffa3" stroke-width="3"/>
    </svg>`,
    { size: 256 }
  );

  // 6. Leather Wrap Grip Pattern
  const LEATHER_WRAP_TEX = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" fill="#241915"/>
      <line x1="0" y1="0" x2="128" y2="128" stroke="#0e0a08" stroke-width="8"/>
      <line x1="0" y1="128" x2="128" y2="0" stroke="#0e0a08" stroke-width="8"/>
      <line x1="0" y1="0" x2="128" y2="128" stroke="#5a3d31" stroke-width="3"/>
      <line x1="0" y1="128" x2="128" y2="0" stroke="#462f26" stroke-width="3"/>
      <circle cx="64" cy="64" r="5" fill="#3a444e" stroke="#101418" stroke-width="1.5"/>
      <circle cx="64" cy="64" r="2" fill="#00ffa3"/>
    </svg>`,
    { size: 128 }
  );

  // ===========================================================================
  // SKELETON HIERARCHY
  // ===========================================================================
  const root = b.joint("root", { at: [0, 0, 0], dir: [0, 1, 0] });

  // S-curved Dragon Spine Staff
  const shaftPoints = [
    [-0.03, 0.08, 0.0],
    [-0.05, 0.45, 0.01],
    [-0.08, 0.85, 0.02],
    [-0.07, 1.25, 0.01],
    [-0.04, 1.62, 0.0],
    [-0.01, 1.90, 0.0],
  ];
  const shaftChain = b.chain("spine", catmull(shaftPoints), {
    parent: root,
    count: 5,
    names: ["spine1", "spine2", "spine3", "spine4", "spine5"],
    role: "spine",
  });

  // Dragon Skull Head Joint
  const head = b.joint("head", {
    parent: shaftChain.tip ?? shaftChain.joints[shaftChain.joints.length - 1],
    at: [-0.01, 1.92, 0.0],
    dir: [0.15, 0.35, 0.92],
    role: "head",
  });

  // Articulated Jaw Joint
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ down: 0.06, forward: 0.05 }),
    aim: head.local({ down: 0.16, forward: 0.22 }),
    role: "jaw",
  });

  // Cranial Horns
  const hornL = b.joint("hornL", {
    parent: head,
    at: head.local({ left: 0.09, up: 0.08, back: 0.06 }),
    dir: [0.65, 0.35, -0.67],
    role: "fan",
  });
  const hornR = b.joint("hornR", {
    parent: head,
    at: head.local({ right: 0.09, up: 0.08, back: 0.06 }),
    dir: [-0.65, 0.35, -0.67],
    role: "fan",
  });

  // Scythe Blade Crescent Joint Chain
  const bladePath = catmull([
    [0.05, 1.95, 0.0],
    [0.22, 2.22, 0.01],
    [0.48, 2.46, 0.01],
    [0.76, 2.32, 0.0],
    [0.92, 1.92, -0.01],
    [0.86, 1.48, -0.01],
  ]);
  const bladeChain = b.chain("blade", bladePath, {
    parent: head,
    count: 4,
    names: ["bladeRoot", "bladeApex", "bladeCurve", "bladeTip"],
    role: "wing",
  });

  // Hanging Phylactery Lantern Chain
  const lanternPath = catmull([
    [-0.02, 1.80, 0.04],
    [-0.04, 1.66, 0.05],
    [-0.06, 1.48, 0.06],
  ]);
  const lanternChain = b.chain("lantern", lanternPath, {
    parent: head,
    count: 2,
    names: ["lanternChain", "lanternCage"],
    role: "tail",
  });

  // ===========================================================================
  // 1. STAGED BASE (Altar of the Fallen Wyrm)
  // ===========================================================================

  // Stepped Octagonal Obsidian Pedestal touching y = 0
  b.part(
    new THREE.CylinderGeometry(0.72, 0.76, 0.04, 8),
    OBSIDIAN_PAINT,
    { bone: root, at: [0, 0.02, 0] }
  );
  b.part(
    new THREE.CylinderGeometry(0.60, 0.64, 0.05, 8),
    OBSIDIAN_PAINT,
    { bone: root, at: [0, 0.065, 0], rotation: [0, 22.5, 0] }
  );

  // Carved runic rim trim around upper dais
  b.sweep(
    catmull(
      Array.from({ length: 9 }, (_, i) => {
        const ang = (i * Math.PI) / 4;
        return [0.60 * Math.cos(ang), 0.09, 0.60 * Math.sin(ang)];
      }),
      { closed: true }
    ),
    0.016,
    { bone: root, color: SHADOW_IRON_PAINT }
  );

  // Central Soul Pool (glowing vortex under scythe strike)
  const soulPoolMesh = b.part(
    new THREE.CircleGeometry(0.24, 16),
    "#ffffff",
    {
      bone: root,
      at: [-0.03, 0.092, 0.0],
      dir: [0, 1, 0],
      axis: "z",
      texture: SOUL_WHIRL_TEX,
    }
  );
  glow(soulPoolMesh, 2.2);

  // Shattered Crater Slabs radiating from point of impact
  for (let i = 0; i < 4; i++) {
    const ang = (i * Math.PI) / 2 + 0.35;
    const sx = -0.03 + Math.cos(ang) * 0.16;
    const sz = Math.sin(ang) * 0.16;
    b.part(
      new THREE.BoxGeometry(0.12, 0.024, 0.10),
      OBSIDIAN_PAINT,
      {
        bone: root,
        at: [sx, 0.105, sz],
        rotation: [Math.sin(ang) * 16, (ang * 180) / Math.PI, Math.cos(ang) * 16],
      }
    );
  }

  // 4 Fossil Dragon Ribs Framing the Shaft
  for (let i = 0; i < 4; i++) {
    const ang = (i * Math.PI) / 2 + 0.78;
    const bx = Math.cos(ang) * 0.44;
    const bz = Math.sin(ang) * 0.44;
    const tx = Math.cos(ang) * 0.20 - 0.03;
    const tz = Math.sin(ang) * 0.20;

    const ribCurve = catmull([
      [bx, 0.04, bz],
      [bx * 0.88, 0.28, bz * 0.88],
      [tx * 1.15, 0.52, tz * 1.15],
      [tx, 0.68, tz],
    ]);

    const ribSweep = b.sweep(ribCurve, (t) => 0.038 * (1 - t * 0.75) + 0.009, {
      bone: root,
      color: BLACK_BONE_PAINT,
      caps: "point",
    });

    b.along(ribSweep, 4, (at) => {
      b.spike(at, at, 0.042, 0.011, { color: DRAGON_BONE_PAINT });
    });
  }

  // Clustered Soul Crystals on the Base
  const crystalPositions: [number, number, number][] = [
    [0.28, 0.11, 0.22],
    [-0.32, 0.11, 0.18],
    [0.22, 0.11, -0.30],
    [-0.26, 0.11, -0.28],
    [0.38, 0.07, 0.05],
    [-0.36, 0.07, -0.05],
  ];
  crystalPositions.forEach(([cx, cy, cz], idx) => {
    const r = 0.022 + (idx % 3) * 0.006;
    const len = 0.11 + (idx % 2) * 0.05;
    const geo = new THREE.ConeGeometry(r, len * 0.5, 6);
    const pTop = b.part(geo, SOUL_CYAN, {
      bone: root,
      at: [cx, cy + len * 0.25, cz],
      rotation: [8 * (idx % 3), 45 * idx, 12 * (idx % 2)],
    });
    glow(pTop, 1.8);
    const pBot = b.part(geo, SOUL_WHITE, {
      bone: root,
      at: [cx, cy - len * 0.25, cz],
      rotation: [180 + 8 * (idx % 3), 45 * idx, 12 * (idx % 2)],
    });
    glow(pBot, 2.0);
  });

  // ===========================================================================
  // 2. SCYTHE BUTT & POMMEL (Talon Grip & Soul Seed)
  // ===========================================================================
  const buttBone = shaftChain.joints[0];

  // Iron Stiletto Ground Spike
  b.spike([-0.03, 0.12, 0.0], [-0.03, 0.02, 0.0], null, 0.026, {
    bone: buttBone,
    color: SHADOW_IRON_PAINT,
  });

  // Pommel Ring
  b.part(
    new THREE.TorusGeometry(0.05, 0.014, 8, 16),
    SHADOW_IRON_PAINT,
    { bone: buttBone, at: [-0.03, 0.18, 0.0], rotation: [90, 0, 0] }
  );

  // Captive Glowing Soul Seed
  const soulSeed = b.part(
    new THREE.SphereGeometry(0.036, 16, 12),
    SOUL_WHITE,
    { bone: buttBone, at: [-0.03, 0.18, 0.0] }
  );
  glow(soulSeed, 2.5);

  // 3 Curved Talons Grasping the Seed
  for (let i = 0; i < 3; i++) {
    const ang = (i * Math.PI * 2) / 3;
    const tBase: [number, number, number] = [-0.03 + Math.cos(ang) * 0.05, 0.24, Math.sin(ang) * 0.05];
    const tMid: [number, number, number] = [-0.03 + Math.cos(ang) * 0.065, 0.18, Math.sin(ang) * 0.065];
    const tTip: [number, number, number] = [-0.03 + Math.cos(ang) * 0.03, 0.13, Math.sin(ang) * 0.03];
    b.sweep(catmull([tBase, tMid, tTip]), [0.016, 0.005], {
      bone: buttBone,
      color: DRAGON_BONE_PAINT,
      caps: "point",
    });
  }

  // ===========================================================================
  // 3. SCYTHE HAFT / SPINE (Segmented Vertebrae & Hero Grip)
  // ===========================================================================
  const numVertebrae = 12;
  for (let v = 0; v < numVertebrae; v++) {
    const t = (v + 0.5) / numVertebrae;
    const cp = shaftChain.at(t);
    const vBone = cp.bone;

    // Vertebra Central Spool Body
    b.part(
      new THREE.CylinderGeometry(0.042, 0.036, 0.08, 8),
      DRAGON_BONE_PAINT,
      {
        bone: vBone,
        at: cp.at,
        aim: offset(cp.at, cp.tangent, 0.1),
      }
    );

    // Lateral Transverse Winglets (Side Processes)
    for (const s of [1, -1]) {
      const wingDir = new THREE.Vector3().copy(cp.binormal).multiplyScalar(s).addScaledVector(cp.normal, -0.3).normalize();
      b.spike(
        cp.at,
        offset(cp.at, wingDir, 0.075),
        null,
        0.014,
        { bone: vBone, color: DRAGON_BONE_PAINT }
      );
    }

    // Shadow Iron Intervertebral Collar
    b.part(
      new THREE.CylinderGeometry(0.048, 0.048, 0.022, 8),
      SHADOW_IRON_PAINT,
      {
        bone: vBone,
        at: offset(cp.at, cp.tangent, 0.04),
        aim: offset(cp.at, cp.tangent, 0.14),
      }
    );

    // Backward-pointing Dorsal Spine
    const spineDir = new THREE.Vector3().copy(cp.normal).negate().addScaledVector(cp.tangent, -0.35).normalize();
    b.spike(
      offset(cp.at, spineDir, 0.032),
      offset(cp.at, spineDir, 0.12 + (v % 3) * 0.02),
      null,
      0.016,
      { bone: vBone, color: BLACK_BONE_PAINT }
    );
  }

  // Twin Glowing Soul Sinew Filaments Weaving Tightly Along Haft
  for (const side of [1, -1]) {
    const sinewPts = Array.from({ length: 12 }, (_, i) => {
      const t = i / 11;
      const cp = shaftChain.at(t);
      const angle = t * Math.PI * 4 + (side > 0 ? 0 : Math.PI);
      return new THREE.Vector3()
        .copy(cp.at)
        .addScaledVector(cp.binormal, Math.sin(angle) * 0.046)
        .addScaledVector(cp.normal, Math.cos(angle) * 0.038);
    });

    const sinewTube = b.sweep(catmull(sinewPts), 0.007, {
      bone: shaftChain.joints,
      color: SOUL_CYAN,
    });
    glow(sinewTube, 2.0);
  }

  // Hero Grip Section (Center of Haft: y = 0.88 to 1.35)
  const gripMidPoint = shaftChain.at(0.48).at;
  const gripBone = shaftChain.jointAt(0.48);

  b.part(
    new THREE.CylinderGeometry(0.044, 0.044, 0.44, 12),
    "#ffffff",
    {
      bone: gripBone,
      at: gripMidPoint,
      dir: shaftChain.at(0.48).tangent,
      texture: LEATHER_WRAP_TEX,
    }
  );

  // Grip Upper & Lower Bone Collars
  for (const dy of [-0.22, 0.22]) {
    const collarPos = offset(gripMidPoint, shaftChain.at(0.48).tangent, dy);
    b.part(
      new THREE.CylinderGeometry(0.062, 0.054, 0.04, 8),
      DRAGON_BONE_PAINT,
      {
        bone: gripBone,
        at: collarPos,
        dir: shaftChain.at(0.48).tangent,
      }
    );
    for (let j = 0; j < 4; j++) {
      const studAng = (j * Math.PI) / 2;
      b.part(
        new THREE.SphereGeometry(0.011, 6, 6),
        TARNISHED_BRASS,
        {
          bone: gripBone,
          at: [
            collarPos.x + Math.cos(studAng) * 0.062,
            collarPos.y,
            collarPos.z + Math.sin(studAng) * 0.062,
          ],
        }
      );
    }
  }

  // ===========================================================================
  // 4. DRAGON SKULL JUNCTION (The Reaping Maw)
  // ===========================================================================

  // Cranium Braincase
  b.frustumBox(
    head.local({ back: 0.08, down: 0.02 }),
    head.local({ forward: 0.12, up: 0.04 }),
    [0.18, 0.14],
    [0.13, 0.09],
    { bone: head, color: DRAGON_BONE_PAINT }
  );

  // Supraorbital Brow Ridge
  b.part(
    new THREE.BoxGeometry(0.20, 0.045, 0.12),
    BLACK_BONE_PAINT,
    {
      bone: head,
      at: head.local({ forward: 0.08, up: 0.06 }),
      rotation: [15, 0, 0],
    }
  );

  // Skull Forehead Sigil Medallion
  const sigilMedallion = b.part(
    new THREE.CircleGeometry(0.038, 8),
    "#ffffff",
    {
      bone: head,
      at: head.local({ forward: 0.08, up: 0.09, back: 0.01 }),
      dir: head.dir([0, 1, 0.4]),
      axis: "z",
      texture: RUNE_STRIP_TEX,
    }
  );
  glow(sigilMedallion, 2.0);

  // Deep Eye Sockets & Glowing Slit Eyes
  for (const s of [1, -1]) {
    const eyeSocketPos = head.local({ left: s * 0.076, forward: 0.06, up: 0.02 });
    b.part(
      new THREE.SphereGeometry(0.032, 8, 6),
      "#08080c",
      { bone: head, at: eyeSocketPos }
    );

    const eyeDisc = b.part(
      new THREE.CircleGeometry(0.026, 12),
      "#ffffff",
      {
        bone: head,
        at: offset(eyeSocketPos, head.dir([s * 0.8, 0.2, 0.6]), 0.015),
        dir: head.dir([s * 0.8, 0.1, 0.5]),
        axis: "z",
        texture: DRAGON_EYE_TEX,
      }
    );
    glow(eyeDisc, 2.4);

    // Optic Soul Fire Wisps firmly rooted at eye corner
    const flameHit = frame(
      offset(eyeSocketPos, head.dir([s * 0.7, 0.3, -0.2]), 0.015),
      head.dir([s * 0.4, 0.8, -0.4])
    );
    const eyeFlameCards = b.cards([flameHit], SOUL_FLAME_TEX, {
      size: [0.05, 0.12],
      lean: 25,
      bend: 20,
      bone: head,
      color: SOUL_CYAN,
    });
    glow(eyeFlameCards, 2.0);
  }

  // Snout Upper Jaw Extension (clamps down on blade tang)
  b.frustumBox(
    head.local({ forward: 0.12, up: 0.02 }),
    head.local({ forward: 0.28, down: 0.01 }),
    [0.12, 0.08],
    [0.06, 0.05],
    { bone: head, color: DRAGON_BONE_PAINT }
  );

  // Upper Snout Spines
  for (let sp = 0; sp < 3; sp++) {
    b.spike(
      head.local({ forward: 0.14 + sp * 0.05, up: 0.04 - sp * 0.01 }),
      head.dir([0, 0.8, 0.3]),
      0.055 - sp * 0.012,
      0.012,
      { bone: head, color: BLACK_BONE_PAINT }
    );
  }

  // Upper Jaw Teeth Clamping the Blade
  for (let t = 0; t < 4; t++) {
    for (const s of [1, -1]) {
      b.spike(
        head.local({ left: s * (0.045 - t * 0.008), forward: 0.13 + t * 0.04, down: 0.015 }),
        head.dir([s * 0.2, -0.9, 0.2]),
        0.042 - t * 0.006,
        0.009,
        { bone: head, color: DRAGON_BONE_PAINT }
      );
    }
  }

  // Lower Mandible Jaw
  b.frustumBox(
    jaw.local({ back: 0.04, down: 0.0 }),
    jaw.local({ forward: 0.22, up: 0.03 }),
    [0.11, 0.06],
    [0.05, 0.04],
    { bone: jaw, color: DRAGON_BONE_PAINT }
  );

  // Lower Mandible Interlocking Tusks
  for (let lt = 0; lt < 3; lt++) {
    for (const s of [1, -1]) {
      b.spike(
        jaw.local({ left: s * (0.04 - lt * 0.007), forward: 0.06 + lt * 0.05, up: 0.02 }),
        jaw.dir([s * 0.2, 0.9, 0.1]),
        0.045 - lt * 0.005,
        0.008,
        { bone: jaw, color: DRAGON_BONE_PAINT }
      );
    }
  }

  // Swept Cranial Horns
  for (const s of [1, -1]) {
    const hornBone = s > 0 ? hornL : hornR;
    const hornBase = hornBone.at;
    const hornMid = offset(hornBase, hornBone.dir([s * 0.8, 0.3, -0.5]), 0.18);
    const hornTip = offset(hornMid, hornBone.dir([s * 0.4, 0.7, -0.6]), 0.24);

    const hornPath = catmull([hornBase, hornMid, hornTip]);
    b.sweep(hornPath, (t) => 0.038 * (1 - t * 0.85) + 0.006, {
      bone: hornBone,
      color: BLACK_BONE_PAINT,
      caps: "point",
    });

    for (let hr = 1; hr <= 4; hr++) {
      const frac = hr / 5;
      const hp = hornPath.at(frac);
      b.part(
        new THREE.TorusGeometry(0.034 * (1 - frac * 0.7), 0.006, 6, 12),
        DRAGON_BONE_PAINT,
        {
          bone: hornBone,
          at: hp,
          aim: offset(hp, hornPath.tangentAt(frac), 0.05),
        }
      );
    }

    // Secondary Brow Spikes
    b.spike(
      head.local({ left: s * 0.06, forward: 0.06, up: 0.06 }),
      head.dir([s * 0.4, 0.7, 0.6]),
      0.11,
      0.018,
      { bone: head, color: BLACK_BONE_PAINT }
    );
  }

  // Occipital War-Pick Counter-Spur (Balances the scythe blade)
  const pickBase = head.local({ back: 0.06, down: 0.01 });
  const pickMid = head.local({ back: 0.22, down: 0.08, left: -0.05 });
  const pickTip = head.local({ back: 0.38, down: 0.20, left: -0.08 });
  const pickCurve = catmull([pickBase, pickMid, pickTip]);
  const pickSweep = b.sweep(pickCurve, (t) => 0.042 * (1 - t * 0.82) + 0.006, {
    bone: head,
    color: SHADOW_IRON_PAINT,
    caps: "point",
  });
  b.along(pickSweep, 4, (at) => {
    b.spike(at, at, 0.042, 0.012, { color: DRAGON_BONE_PAINT });
  });

  // ===========================================================================
  // 5. SOUL PHYLACTERY (Ribcage Lantern & Screaming Wraith)
  // ===========================================================================
  for (let cl = 0; cl < 3; cl++) {
    const linkPos = lanternChain.at(cl / 3).at;
    const lBone = lanternChain.jointAt(cl / 3);
    b.part(
      new THREE.TorusGeometry(0.024, 0.007, 6, 10),
      BLACK_BONE_PAINT,
      {
        bone: lBone,
        at: linkPos,
        rotation: [cl % 2 ? 0 : 90, 0, cl % 2 ? 90 : 0],
      }
    );
  }

  const cageCenter = lanternChain.tip?.at ?? lanternChain.joints[lanternChain.joints.length - 1].at;
  const cageBone = lanternChain.tip ?? lanternChain.joints[lanternChain.joints.length - 1];

  // Lantern Cap & Funnel
  b.part(
    new THREE.ConeGeometry(0.085, 0.045, 6),
    SHADOW_IRON_PAINT,
    { bone: cageBone, at: [cageCenter.x, cageCenter.y + 0.08, cageCenter.z] }
  );
  b.part(
    new THREE.ConeGeometry(0.075, 0.05, 6),
    SHADOW_IRON_PAINT,
    {
      bone: cageBone,
      at: [cageCenter.x, cageCenter.y - 0.08, cageCenter.z],
      rotation: [180, 0, 0],
    }
  );
  b.spike(
    [cageCenter.x, cageCenter.y - 0.10, cageCenter.z],
    [0, -1, 0],
    0.08,
    0.012,
    { bone: cageBone, color: DRAGON_BONE_PAINT }
  );

  // 6 Ribcage Struts
  for (let r = 0; r < 6; r++) {
    const rAng = (r * Math.PI * 2) / 6;
    const rRad = 0.072;
    const cTop: [number, number, number] = [
      cageCenter.x + Math.cos(rAng) * 0.05,
      cageCenter.y + 0.065,
      cageCenter.z + Math.sin(rAng) * 0.05,
    ];
    const cMid: [number, number, number] = [
      cageCenter.x + Math.cos(rAng) * rRad,
      cageCenter.y,
      cageCenter.z + Math.sin(rAng) * rRad,
    ];
    const cBot: [number, number, number] = [
      cageCenter.x + Math.cos(rAng) * 0.05,
      cageCenter.y - 0.065,
      cageCenter.z + Math.sin(rAng) * 0.05,
    ];
    b.sweep(catmull([cTop, cMid, cBot]), 0.009, {
      bone: cageBone,
      color: DRAGON_BONE_PAINT,
    });
  }

  // Floating Captive Soul Core
  const soulCoreOrb = b.part(
    new THREE.SphereGeometry(0.042, 16, 12),
    SOUL_WHITE,
    { bone: cageBone, at: cageCenter }
  );
  glow(soulCoreOrb, 2.6);

  // Screaming Soul Face inside the Lantern
  for (const s of [1, -1]) {
    const soulHit = frame(
      [cageCenter.x + s * 0.02, cageCenter.y, cageCenter.z],
      [s, 0, 0.4]
    );
    const soulFaceCard = b.cards([soulHit], SOUL_FACE_TEX, {
      size: [0.08, 0.08],
      lean: 0,
      bone: cageBone,
      color: SOUL_CYAN,
    });
    glow(soulFaceCard, 2.2);
  }

  // ===========================================================================
  // 6. HERO SCYTHE BLADE (Front-Facing Crescent of the Wyrm)
  // ===========================================================================
  // Oriented cleanly in the weapon's frontal plane:
  // x: [1, 0, 0], y: [0, 1, 0]. The broad flat silhouette faces +Z / -Z!

  // 6A. Outer Dragonbone Arch Spine along blade curve
  const bladeSpine = b.sweep(
    bladeChain,
    (t) => 0.052 * (1 - t * 0.72) + 0.012,
    {
      bone: bladeChain.joints,
      color: BLACK_BONE_PAINT,
      caps: "point",
    }
  );

  // 8 Graduated Dragon Dorsal Fin Spines along the outer blade curve
  for (let f = 1; f <= 8; f++) {
    const t = f / 9;
    const cp = bladeChain.at(t);
    const finDir = new THREE.Vector3().copy(cp.normal).addScaledVector(cp.tangent, -0.2).normalize();
    const finLen = 0.09 + Math.sin(t * Math.PI) * 0.13;
    b.spike(
      cp.at,
      offset(cp.at, finDir, finLen),
      null,
      0.018 * (1 - t * 0.5),
      { bone: cp.bone, color: DRAGON_BONE_PAINT }
    );
  }

  // 6B. Main Scythe Blade Plate (Hero Extrude with crisp silhouette & bevels)
  // Drawn in meters relative to blade root [0.05, 1.95, 0.0]
  const bladeOutline: OutlinePoint[] = [
    [0.0, 0.0, "sharp"],       // 0: Root tang at dragon jaw
    [0.16, 0.25],              // 1: Upper arch ascent
    [0.42, 0.48],              // 2: Arch crest
    [0.68, 0.35],              // 3: Outer arch descent
    [0.84, -0.05],             // 4: Lower arch
    [0.80, -0.48, "sharp"],    // 5: Recurved Scythe Tip Point!
    [0.72, -0.38],             // 6: Inner tip bevel
    [0.68, -0.22, "sharp"],    // 7: Wicked primary inner talon barb
    [0.62, -0.16],             // 8: Inner throat recess
    [0.55, 0.05, "sharp"],     // 9: Secondary inner talon barb
    [0.48, 0.12],              // 10: Mid inner sickle contour
    [0.34, 0.22, "sharp"],     // 11: Tertiary inner talon barb
    [0.22, 0.18],              // 12: Throat arch
    [0.08, 0.06, "sharp"],     // 13: Mandible clamp notch
  ];

  const bladeRootBone = bladeChain.joints[0];

  // Primary Shadow-Iron Blade Body
  b.extrude(bladeOutline, {
    at: [0.05, 1.95, 0.0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.038,
    bevel: 0.008,
    smoothing: 0,
    bone: bladeRootBone,
    color: SHADOW_IRON_PAINT,
  });

  // 6C. Inner Razor Soul Crystal Cutting Edge (Luminous Inlay Flange)
  const cuttingEdgeOutline: OutlinePoint[] = [
    [0.08, 0.06, "sharp"],
    [0.22, 0.18],
    [0.34, 0.22, "sharp"],
    [0.48, 0.12],
    [0.55, 0.05, "sharp"],
    [0.62, -0.16],
    [0.68, -0.22, "sharp"],
    [0.72, -0.38],
    [0.80, -0.48, "sharp"],   // Tip
    [0.70, -0.34],
    [0.58, -0.08],
    [0.42, 0.10],
    [0.18, 0.08, "sharp"],
  ];

  const glowingCuttingEdge = b.extrude(cuttingEdgeOutline, {
    at: [0.05, 1.95, 0.0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.044,
    bevel: 0.006,
    smoothing: 0,
    bone: bladeRootBone,
    color: SOUL_CYAN,
  });
  glow(glowingCuttingEdge, 2.2);

  // 6D. Glowing Soul Rune Strips Inlaid in Blade Fuller (Both sides)
  for (const s of [1, -1]) {
    const runeDecal = b.part(
      new THREE.PlaneGeometry(0.10, 0.72),
      "#ffffff",
      {
        bone: bladeChain.joints[1],
        at: [0.46, 2.24, s * 0.021],
        rotation: [0, s > 0 ? 0 : 180, -32],
        texture: RUNE_STRIP_TEX,
      }
    );
    glow(runeDecal, 2.4);
  }

  // 6E. Screaming Soul Face Medallion in Blade Throat
  for (const s of [1, -1]) {
    const soulMedallion = b.part(
      new THREE.CircleGeometry(0.065, 16),
      "#ffffff",
      {
        bone: bladeChain.joints[1],
        at: [0.42, 2.12, s * 0.022],
        dir: [0, 0, s],
        axis: "z",
        texture: SOUL_FACE_TEX,
      }
    );
    glow(soulMedallion, 2.3);
  }

  // 6F. Soulfire Crest Cards Licking from the Blade Arch
  const bladeFlameFrames = [0.25, 0.45, 0.65, 0.85].map((t) => {
    const cp = bladeChain.at(t);
    return frame(
      offset(cp.at, cp.normal, 0.02),
      offset(new THREE.Vector3(), cp.normal, 1.0).addScaledVector(cp.tangent, 0.25)
    );
  });
  const bladeFlames = b.cards(bladeFlameFrames, SOUL_FLAME_TEX, {
    size: [0.11, 0.24],
    lean: 25,
    bend: 30,
    bone: bladeChain.joints[1],
    color: SOUL_CYAN,
  });
  glow(bladeFlames, 2.1);

  // Extreme Razor Tip Finial (Armor-piercing soul crystal spearhead)
  const tipCp = bladeChain.at(1.0);
  const razorTip = b.spike(
    [0.85, 1.48, -0.01],
    [0.82, 1.30, -0.01],
    null,
    0.016,
    { bone: bladeChain.tip ?? bladeChain.joints[bladeChain.joints.length - 1], color: SOUL_WHITE }
  );
  glow(razorTip, 2.6);

  // ===========================================================================
  // 7. ETHEREAL VISUAL FX (Swirling Energy Ribbons & Grounded Soul Flames)
  // ===========================================================================

  // 2 Swirling Soul Energy Ribbons Spiraling Around Upper Shaft
  const swirlA = spiral(
    [-0.04, 1.68, 0.0],
    [-0.04 + 0.09, 1.54, 0.0],
    [0.08, 1, 0.02],
    { turns: 1.8, pitch: 0.14, r1: 0.04 }
  );
  const ribbonA = b.sweep(swirlA, 0.007, {
    bone: shaftChain.joints[4],
    color: SOUL_CYAN,
  });
  glow(ribbonA, 2.2);

  const swirlB = spiral(
    [-0.02, 1.94, 0.0],
    [-0.02 - 0.10, 1.80, 0.0],
    [-0.08, 1, -0.02],
    { turns: -1.6, pitch: 0.15, r1: 0.045 }
  );
  const ribbonB = b.sweep(swirlB, 0.008, {
    bone: head,
    color: SOUL_WHITE,
  });
  glow(ribbonB, 2.4);

  // Grounded Soulfire Cards Firmly Attached to Pedestal Runestones
  for (let i = 0; i < 4; i++) {
    const ang = (i * Math.PI) / 2 + 0.38;
    const fx = Math.cos(ang) * 0.38;
    const fz = Math.sin(ang) * 0.38;
    const flameHit = frame([fx, 0.095, fz], [0, 1, 0]);
    const altarFlame = b.cards([flameHit], SOUL_FLAME_TEX, {
      size: [0.08, 0.16],
      lean: 15,
      bend: 20,
      bone: root,
      color: i % 2 === 0 ? SOUL_CYAN : SOUL_WHITE,
    });
    glow(altarFlame, 2.2);
  }

  return b.root;
}
