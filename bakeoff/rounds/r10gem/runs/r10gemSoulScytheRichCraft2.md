```ts
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
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A monumental League of Legends-styled hero weapon forged from ancient wyrm vertebrae, bound in shadow-iron and ablaze with spectral soulfire.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "dragonbone_soul_scythe", paintSize: 1024, detail: 1.0 });
  const rand = rng(42);

  // ===========================================================================
  // PALETTE & COLOR CONSTANTS
  // ===========================================================================
  const SOUL_WHITE = "#e8ffff";
  const SOUL_CYAN = "#00ffa3";
  const SOUL_TEAL = "#0bd1bf";
  const SOUL_DEEP = "#053f47";
  const SOUL_EMERALD = "#1aff99";

  const DARK_IRON_SOLID = "#1a1f26";
  const TARNISHED_BRASS = "#8a6d3b";
  const OBSIDIAN_DARK = "#121017";

  // Paints (organic, stone, and bone variations)
  const DRAGON_BONE_PAINT = paint((p, n) => {
    const gn = noise(p, 0.05, 17);
    const ivory = mix("#f0e3cc", "#cbbfa5", gn);
    const dirt = smoothstep(0.42, 0.78, noise(p, 0.018, 88));
    const base = mix(ivory, "#594833", dirt * 0.4);
    const ao = 0.7 + 0.3 * smoothstep(-0.6, 0.6, n.y);
    const crestLit = smoothstep(0.65, 0.98, n.y) * 0.25;
    return mix(mix(base, "#221c16", (1 - ao) * 0.45), "#ffffff", crestLit);
  });

  const BLACK_BONE_PAINT = paint((p, n) => {
    const gn = noise(p, 0.06, 53);
    const dark = mix("#242028", "#38313e", gn);
    const highlight = smoothstep(0.5, 0.95, n.y);
    return mix(dark, "#685a73", highlight * 0.35);
  });

  const SHADOW_IRON_PAINT = paint((p, n) => {
    const base = mix("#191e24", "#2c3640", noise(p, 0.04, 101));
    const edgeSheen = smoothstep(0.6, 1.0, n.y) * smoothstep(0.3, 0.7, noise(p, 0.02, 14));
    return mix(base, "#00ffa3", edgeSheen * 0.28);
  });

  const OBSIDIAN_PAINT = paint((p, n) => {
    const g1 = noise(p, 0.12, 9);
    const g2 = noise(p, 0.025, 62);
    const base = mix("#100e14", "#1e1a26", g1);
    const edge = smoothstep(0.38, 0.68, g2);
    return mix(base, "#2b2238", edge * 0.32);
  });

  // ===========================================================================
  // SVG TEXTURES (Heroic League of Legends Shadow Isles / Dragon Style)
  // ===========================================================================

  // 1. Blade Fuller Glowing Soul Rune Inlay
  const RUNE_STRIP_TEX = svg(
    `<svg viewBox="0 0 80 512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="runeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#053f47" stop-opacity="0.2"/>
          <stop offset="35%" stop-color="#0bd1bf" stop-opacity="0.9"/>
          <stop offset="50%" stop-color="#00ffa3" stop-opacity="1"/>
          <stop offset="65%" stop-color="#0bd1bf" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#053f47" stop-opacity="0.2"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="80" height="512" fill="#081014"/>
      <path d="M 40 10 L 40 502" stroke="#00ffa3" stroke-width="2.5" stroke-dasharray="10 5"/>
      <g fill="none" stroke="#d7fffb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 24 35 L 40 20 L 56 35 L 40 50 Z M 40 20 L 40 65 M 30 55 L 50 55"/>
        <circle cx="40" cy="90" r="13" stroke="#00ffa3" stroke-width="2.5"/>
        <path d="M 28 90 L 52 90 M 40 77 L 40 103"/>
        <path d="M 25 140 L 40 125 L 55 140 L 40 155 M 25 155 L 55 125"/>
        <path d="M 32 185 L 40 175 L 48 185 L 40 210 L 48 220 L 32 220 Z"/>
        <path d="M 22 250 L 40 235 L 58 250 M 40 235 L 40 275 M 26 265 L 54 265"/>
        <circle cx="40" cy="310" r="9" fill="#15f2d2"/>
        <path d="M 22 310 L 58 310 M 30 295 L 50 325 M 30 325 L 50 295"/>
        <path d="M 25 365 L 40 350 L 55 365 L 40 380 L 25 365 M 40 380 L 40 400"/>
        <path d="M 28 430 L 40 415 L 52 430 L 40 455 M 24 440 L 56 440"/>
        <path d="M 40 475 L 26 490 L 40 505 L 54 490 Z"/>
      </g>
      <circle cx="40" cy="20" r="3.5" fill="#ffffff"/>
      <circle cx="40" cy="125" r="3.5" fill="#ffffff"/>
      <circle cx="40" cy="235" r="3.5" fill="#ffffff"/>
      <circle cx="40" cy="350" r="3.5" fill="#ffffff"/>
      <circle cx="40" cy="455" r="3.5" fill="#ffffff"/>
    </svg>`,
    { size: 512 }
  );

  // 2. Trapped Howling Wraith Face
  const SOUL_FACE_TEX = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="soulGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#00ffa3" stop-opacity="0.95"/>
          <stop offset="55%" stop-color="#053f47" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#053f47" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="64" cy="64" r="60" fill="url(#soulGlow)"/>
      <path d="M 64 16 C 40 16 28 34 28 58 C 28 78 38 98 48 108 C 54 114 74 114 80 108 C 90 98 100 78 100 58 C 100 34 88 16 64 16 Z" fill="#061c22" stroke="#15f2d2" stroke-width="3"/>
      <ellipse cx="46" cy="50" rx="9" ry="15" fill="#00ffa3" transform="rotate(-12 46 50)"/>
      <ellipse cx="82" cy="50" rx="9" ry="15" fill="#00ffa3" transform="rotate(12 82 50)"/>
      <ellipse cx="46" cy="50" rx="4" ry="7" fill="#ffffff" transform="rotate(-12 46 50)"/>
      <ellipse cx="82" cy="50" rx="4" ry="7" fill="#ffffff" transform="rotate(12 82 50)"/>
      <path d="M 48 76 C 48 68 80 68 80 76 C 80 96 74 106 64 106 C 54 106 48 96 48 76 Z" fill="#00ffa3"/>
      <ellipse cx="64" cy="88" rx="7" ry="11" fill="#031217"/>
      <path d="M 34 34 C 22 22 28 8 34 2 C 38 12 46 16 44 26" fill="none" stroke="#15f2d2" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 94 34 C 106 22 100 8 94 2 C 90 12 82 16 84 26" fill="none" stroke="#15f2d2" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,
    { size: 256 }
  );

  // 3. Ethereal Soulfire Flame Tongue Card
  const SOUL_FLAME_TEX = svg(
    `<svg viewBox="0 0 80 160" xmlns="http://www.w3.org/2000/svg">
      <path d="M 40 156 C 18 135 6 98 12 68 C 16 48 30 32 36 8 C 44 30 58 42 64 66 C 72 96 62 135 40 156 Z" fill="#042229" stroke="#00ffa3" stroke-width="2.5"/>
      <path d="M 40 146 C 24 128 16 100 20 76 C 24 60 34 48 38 26 C 44 46 54 56 58 74 C 64 98 56 128 40 146 Z" fill="#00ffa3"/>
      <path d="M 40 134 C 30 118 26 100 28 82 C 30 70 36 60 40 44 C 44 60 48 70 50 82 C 52 100 48 118 40 134 Z" fill="#e0ffff"/>
    </svg>`,
    { size: 256 }
  );

  // 4. Slit Dragon Eye
  const DRAGON_EYE_TEX = svg(
    `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M 6 32 C 34 8 94 8 122 32 C 94 56 34 56 6 32 Z" fill="#051a20" stroke="#00ffa3" stroke-width="3"/>
      <ellipse cx="64" cy="32" rx="38" ry="24" fill="#00ffa3"/>
      <ellipse cx="64" cy="32" rx="26" ry="16" fill="#7dffda"/>
      <path d="M 64 12 C 58 22 58 42 64 52 C 70 42 70 22 64 12 Z" fill="#020d10"/>
      <ellipse cx="54" cy="24" rx="6" ry="3.5" fill="#ffffff" transform="rotate(-15 54 24)"/>
      <circle cx="72" cy="38" r="3" fill="#ffffff"/>
    </svg>`,
    { size: 256 }
  );

  // 5. Ornate Bone Skull Crest Knotwork
  const DRAGON_SIGIL_TEX = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" fill="#141117"/>
      <path d="M 12 12 L 116 12 L 116 116 L 12 116 Z" fill="none" stroke="#483d4f" stroke-width="4"/>
      <path d="M 18 18 L 110 18 L 110 110 L 18 110 Z" fill="none" stroke="#00ffa3" stroke-width="1.5"/>
      <g fill="none" stroke="#d7fffb" stroke-width="3" stroke-linecap="round">
        <path d="M 64 24 L 90 50 L 64 76 L 38 50 Z"/>
        <path d="M 64 54 L 90 80 L 64 106 L 38 80 Z"/>
        <path d="M 38 50 L 22 66 L 38 82"/>
        <path d="M 90 50 L 106 66 L 90 82"/>
      </g>
      <circle cx="64" cy="50" r="4.5" fill="#00ffa3"/>
      <circle cx="64" cy="80" r="4.5" fill="#00ffa3"/>
    </svg>`,
    { size: 256 }
  );

  // 6. Altar Soul Pool Vortex
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

  // 7. Grip Leather Wrap Pattern
  const LEATHER_WRAP_TEX = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" fill="#261b17"/>
      <line x1="0" y1="0" x2="128" y2="128" stroke="#120c09" stroke-width="8"/>
      <line x1="0" y1="128" x2="128" y2="0" stroke="#120c09" stroke-width="8"/>
      <line x1="0" y1="0" x2="128" y2="128" stroke="#5a3d31" stroke-width="3"/>
      <line x1="0" y1="128" x2="128" y2="0" stroke="#462f26" stroke-width="3"/>
      <circle cx="64" cy="64" r="5" fill="#3a444e" stroke="#101418" stroke-width="1.5"/>
      <circle cx="64" cy="64" r="2" fill="#00ffa3"/>
    </svg>`,
    { size: 128 }
  );

  // ===========================================================================
  // SKELETON & RIG HIERARCHY
  // ===========================================================================

  // Root joint placed at base level
  const root = b.joint("root", { at: [0, 0, 0], dir: [0, 1, 0] });

  // Main Scythe Shaft Spine: S-curved dragon spine with offset to center the blade
  const shaftPoints = [
    [-0.04, 0.08, -0.04],
    [-0.05, 0.45, -0.03],
    [-0.08, 0.85, -0.01],
    [-0.09, 1.25, 0.01],
    [-0.06, 1.62, 0.02],
    [-0.02, 1.90, 0.0],
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
    at: [-0.02, 1.92, 0.0],
    dir: [0.15, 0.45, 0.87],
    role: "head",
  });

  // Articulated Dragon Jaw Joint
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ down: 0.06, forward: 0.05 }),
    aim: head.local({ down: 0.16, forward: 0.22 }),
    role: "jaw",
  });

  // Dragon Horn Joints
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

  // Primary Scythe Blade Joint Chain
  const bladePath = catmull([
    [-0.01, 1.98, 0.08],
    [0.16, 2.24, 0.12],
    [0.42, 2.45, 0.14],
    [0.68, 2.28, 0.17],
    [0.82, 1.88, 0.22],
    [0.78, 1.45, 0.32],
  ]);
  const bladeChain = b.chain("blade", bladePath, {
    parent: head,
    count: 4,
    names: ["bladeRoot", "bladeApex", "bladeCurve", "bladeTip"],
    role: "wing",
  });

  // Hanging Soul Cage Lantern Chain
  const lanternPath = catmull([
    [-0.02, 1.82, 0.02],
    [-0.05, 1.68, 0.04],
    [-0.07, 1.50, 0.06],
  ]);
  const lanternChain = b.chain("lantern", lanternPath, {
    parent: head,
    count: 2,
    names: ["lanternChain", "lanternCage"],
    role: "tail",
  });

  // ===========================================================================
  // HELPER BUILDERS
  // ===========================================================================

  // Soul Crystal Builder (Hexagonal Bipyramid)
  function createSoulCrystal(
    pos: [number, number, number],
    r: number,
    len: number,
    angle: [number, number, number],
    parentBone: any
  ) {
    const group = new THREE.Group();
    const geo = new THREE.ConeGeometry(r, len * 0.5, 6);
    const mTop = new THREE.Mesh(geo);
    mTop.position.y = len * 0.25;
    const mBot = new THREE.Mesh(geo);
    mBot.rotation.x = Math.PI;
    mBot.position.y = -len * 0.25;
    group.add(mTop);
    group.add(mBot);

    const part = b.part(geo, SOUL_CYAN, {
      bone: parentBone,
      at: [pos[0], pos[1] + len * 0.25, pos[2]],
      rotation: angle,
    });
    glow(part, 1.8);

    const part2 = b.part(geo, SOUL_WHITE, {
      bone: parentBone,
      at: [pos[0], pos[1] - len * 0.25, pos[2]],
      rotation: [angle[0] + 180, angle[1], angle[2]],
    });
    glow(part2, 2.0);
  }

  // ===========================================================================
  // 1. STAGED BASE (Altar of the Fallen Wyrm)
  // ===========================================================================

  // Octagonal Stepped Obsidian Pedestal
  // Bottom tier rests flush on y = 0
  const daisBottom = b.part(
    new THREE.CylinderGeometry(0.72, 0.76, 0.04, 8),
    OBSIDIAN_PAINT,
    { bone: root, at: [0, 0.02, 0] }
  );

  // Upper tier rotated for stepped silhouette
  const daisTop = b.part(
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
      at: [-0.04, 0.092, -0.04],
      dir: [0, 1, 0],
      axis: "z",
      texture: SOUL_WHIRL_TEX,
    }
  );
  glow(soulPoolMesh, 2.2);

  // Shattered Crater Slabs (stone fractured by scythe butt)
  for (let i = 0; i < 4; i++) {
    const ang = (i * Math.PI) / 2 + 0.35;
    const slabDist = 0.16;
    const sx = -0.04 + Math.cos(ang) * slabDist;
    const sz = -0.04 + Math.sin(ang) * slabDist;
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

  // 4 Fossilized Dragon Ribs Arcing up from the Altar Base
  for (let i = 0; i < 4; i++) {
    const ang = (i * Math.PI) / 2 + 0.78;
    const rBase = 0.44;
    const rTip = 0.22;
    const bx = Math.cos(ang) * rBase;
    const bz = Math.sin(ang) * rBase;
    const tx = Math.cos(ang) * rTip - 0.04;
    const tz = Math.sin(ang) * rTip - 0.04;

    const ribCurve = catmull([
      [bx, 0.04, bz],
      [bx * 0.9, 0.28, bz * 0.9],
      [tx * 1.1, 0.52, tz * 1.1],
      [tx, 0.68, tz],
    ]);

    const ribSweep = b.sweep(ribCurve, (t) => 0.04 * (1 - t * 0.75) + 0.01, {
      bone: root,
      color: BLACK_BONE_PAINT,
      caps: "point",
    });

    // Sharp dorsal thorns along outer rib curve
    b.along(ribCurve, 4, (fr) => {
      b.spike(fr.at, fr.tangent, 0.045, 0.012, {
        bone: root,
        color: DRAGON_BONE_PAINT,
      });
    });
  }

  // Clustered Soul Crystals on the Base
  const crystalCoords: [number, number, number][] = [
    [0.28, 0.11, 0.22],
    [-0.32, 0.11, 0.18],
    [0.22, 0.11, -0.30],
    [-0.26, 0.11, -0.28],
    [0.38, 0.07, 0.05],
    [-0.36, 0.07, -0.05],
  ];
  crystalCoords.forEach(([cx, cy, cz], idx) => {
    createSoulCrystal(
      [cx, cy, cz],
      0.024 + (idx % 3) * 0.008,
      0.12 + (idx % 2) * 0.06,
      [10 * (idx % 3), 45 * idx, 15 * (idx % 2)],
      root
    );
  });

  // Altar Perimeter Runestones
  for (let i = 0; i < 4; i++) {
    const ang = (i * Math.PI) / 2;
    const rx = Math.cos(ang) * 0.54;
    const rz = Math.sin(ang) * 0.54;
    b.part(
      new THREE.BoxGeometry(0.09, 0.11, 0.06),
      OBSIDIAN_PAINT,
      {
        bone: root,
        at: [rx, 0.08, rz],
        rotation: [0, (ang * 180) / Math.PI + 15, 0],
      }
    );
    const runeDecal = b.part(
      new THREE.PlaneGeometry(0.06, 0.06),
      "#ffffff",
      {
        bone: root,
        at: [rx * 1.02, 0.09, rz * 1.02],
        dir: [rx, 0, rz],
        axis: "z",
        texture: DRAGON_SIGIL_TEX,
      }
    );
    glow(runeDecal, 1.8);
  }

  // ===========================================================================
  // 2. SCYTHE BUTT & POMMEL (Talon Grip & Soul Seed)
  // ===========================================================================

  const buttPos: [number, number, number] = [-0.04, 0.08, -0.04];
  const buttBone = shaftChain.joints[0];

  // Iron Stiletto Ground Spike (pierces into stone crater)
  b.spike([-0.04, 0.12, -0.04], [-0.04, 0.02, -0.04], null, 0.028, {
    bone: buttBone,
    color: SHADOW_IRON_PAINT,
  });

  // Pommel Ring
  b.part(
    new THREE.TorusGeometry(0.052, 0.014, 8, 16),
    SHADOW_IRON_PAINT,
    { bone: buttBone, at: [-0.04, 0.18, -0.04], rotation: [90, 0, 0] }
  );

  // Soul Seed Orb (glowing captive sphere)
  const soulSeed = b.part(
    new THREE.SphereGeometry(0.038, 16, 12),
    SOUL_WHITE,
    { bone: buttBone, at: [-0.04, 0.18, -0.04] }
  );
  glow(soulSeed, 2.5);

  // 3 Curved Dragon Bone Talons Grasping the Soul Seed
  for (let i = 0; i < 3; i++) {
    const ang = (i * Math.PI * 2) / 3;
    const talonBase: [number, number, number] = [
      -0.04 + Math.cos(ang) * 0.05,
      0.24,
      -0.04 + Math.sin(ang) * 0.05,
    ];
    const talonMid: [number, number, number] = [
      -0.04 + Math.cos(ang) * 0.065,
      0.18,
      -0.04 + Math.sin(ang) * 0.065,
    ];
    const talonTip: [number, number, number] = [
      -0.04 + Math.cos(ang) * 0.03,
      0.13,
      -0.04 + Math.sin(ang) * 0.03,
    ];
    b.sweep(catmull([talonBase, talonMid, talonTip]), [0.018, 0.005], {
      bone: buttBone,
      color: DRAGON_BONE_PAINT,
      caps: "point",
    });
  }

  // ===========================================================================
  // 3. SCYTHE HAFT / SPINE (Segmented Vertebrae & Grip)
  // ===========================================================================

  // Segmented Dragon Vertebrae along the staff
  const numVertebrae = 12;
  for (let v = 0; v < numVertebrae; v++) {
    const t = (v + 0.5) / numVertebrae;
    const cp = shaftChain.at(t);
    const vBone = cp.bone;

    // Vertebra spool body
    b.part(
      new THREE.CylinderGeometry(0.042, 0.036, 0.08, 8),
      DRAGON_BONE_PAINT,
      {
        bone: vBone,
        at: cp.at,
        aim: offset(cp.at, cp.tangent, 0.1),
      }
    );

    // Shadow Iron Intervertebral Ring Collar
    b.part(
      new THREE.CylinderGeometry(0.048, 0.048, 0.022, 8),
      SHADOW_IRON_PAINT,
      {
        bone: vBone,
        at: offset(cp.at, cp.tangent, 0.04),
        aim: offset(cp.at, cp.tangent, 0.14),
      }
    );

    // Backward-pointing Dragon Spinous Process (Dorsal Spine)
    const spineDir = new THREE.Vector3().copy(cp.normal).negate().addScaledVector(cp.tangent, -0.4).normalize();
    b.spike(
      offset(cp.at, spineDir, 0.035),
      offset(cp.at, spineDir, 0.12 + (v % 3) * 0.02),
      null,
      0.016,
      { bone: vBone, color: BLACK_BONE_PAINT }
    );
  }

  // Twin Glowing Soul Sinew Filaments Running along Left and Right of the Spine
  for (const side of [1, -1]) {
    const sinewPts = Array.from({ length: 8 }, (_, i) => {
      const t = i / 7;
      const cp = shaftChain.at(t);
      return new THREE.Vector3()
        .copy(cp.at)
        .addScaledVector(cp.binormal, side * 0.042)
        .addScaledVector(cp.normal, 0.01);
    });

    const sinewTube = b.sweep(catmull(sinewPts), 0.009, {
      bone: shaftChain.joints,
      color: SOUL_CYAN,
    });
    glow(sinewTube, 1.9);
  }

  // Hero Grip Section (Center of Haft: y = 0.88 to 1.35)
  const gripMidPoint = shaftChain.at(0.48).at;
  const gripBone = shaftChain.jointAt(0.48);

  // Leather Wrapped Grip Tube
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

  // Grip Upper and Lower Bone Guard Collars
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
    // Ornamental corner studs
    for (let j = 0; j < 4; j++) {
      const studAng = (j * Math.PI) / 2;
      b.part(
        new THREE.SphereGeometry(0.012, 6, 6),
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
  // 4. DRAGON SKULL SCYTHE HEAD
  // ===========================================================================

  // Cranium Braincase (Main bone mass)
  const skullCranium = b.frustumBox(
    head.local({ back: 0.08, down: 0.02 }),
    head.local({ forward: 0.12, up: 0.04 }),
    [0.18, 0.14],
    [0.13, 0.09],
    { bone: head, color: DRAGON_BONE_PAINT }
  );

  // Supraorbital Brow Ridge (V-shaped demonic ridge)
  b.part(
    new THREE.BoxGeometry(0.20, 0.045, 0.12),
    BLACK_BONE_PAINT,
    {
      bone: head,
      at: head.local({ forward: 0.08, up: 0.06 }),
      rotation: [15, 0, 0],
    }
  );

  // Skull Forehead Sigil Plate
  const sigilMedallion = b.part(
    new THREE.CircleGeometry(0.038, 8),
    "#ffffff",
    {
      bone: head,
      at: head.local({ forward: 0.08, up: 0.09, back: 0.01 }),
      dir: head.dir([0, 1, 0.4]),
      axis: "z",
      texture: DRAGON_SIGIL_TEX,
    }
  );
  glow(sigilMedallion, 2.0);

  // Deep Eye Sockets & Glowing Dragon Eyes
  for (const s of [1, -1]) {
    const eyeSocketPos = head.local({ left: s * 0.076, forward: 0.06, up: 0.02 });

    // Dark orbital hollow
    b.part(
      new THREE.SphereGeometry(0.032, 8, 6),
      "#08080c",
      { bone: head, at: eyeSocketPos }
    );

    // Glowing Dragon Eye Disc
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

    // Optic Soul Fire Tendril (drifting from eye corner)
    const flameHit = frame(
      offset(eyeSocketPos, head.dir([s * 0.7, 0.3, -0.2]), 0.02),
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

  // Upper Snout / Jaw Extension (clamps down on the blade tang)
  b.frustumBox(
    head.local({ forward: 0.12, up: 0.02 }),
    head.local({ forward: 0.28, down: 0.01 }),
    [0.12, 0.08],
    [0.06, 0.05],
    { bone: head, color: DRAGON_BONE_PAINT }
  );

  // Snout Dorsal Spines
  for (let sp = 0; sp < 3; sp++) {
    b.spike(
      head.local({ forward: 0.14 + sp * 0.05, up: 0.04 - sp * 0.01 }),
      head.dir([0, 0.8, 0.3]),
      0.055 - sp * 0.012,
      0.012,
      { bone: head, color: BLACK_BONE_PAINT }
    );
  }

  // Upper Jaw Teeth / Fangs Biting Blade Tang
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

  // Articulated Lower Jaw (mandible clamped from beneath)
  b.frustumBox(
    jaw.local({ back: 0.04, down: 0.0 }),
    jaw.local({ forward: 0.22, up: 0.03 }),
    [0.11, 0.06],
    [0.05, 0.04],
    { bone: jaw, color: DRAGON_BONE_PAINT }
  );

  // Lower Mandible Tusks (interlocking with upper jaw)
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

  // Jaw Reinforcing Shadow-Iron Braces & Bolts
  b.part(
    new THREE.BoxGeometry(0.13, 0.03, 0.06),
    SHADOW_IRON_PAINT,
    { bone: jaw, at: jaw.local({ forward: 0.10, down: 0.01 }) }
  );

  // Swept Dragon Cranial Horns
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

    // Ribbed Horn Rings
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

    // Secondary Brow Horns (shorter, jutting forward)
    b.spike(
      head.local({ left: s * 0.06, forward: 0.06, up: 0.06 }),
      head.dir([s * 0.4, 0.7, 0.6]),
      0.11,
      0.018,
      { bone: head, color: BLACK_BONE_PAINT }
    );
  }

  // ===========================================================================
  // 5. COUNTER-BLADE (Occipital War-Pick Crow's Beak)
  // ===========================================================================

  const pickBase = head.local({ back: 0.06, down: 0.01 });
  const pickMid = head.local({ back: 0.22, down: 0.08, left: -0.05 });
  const pickTip = head.local({ back: 0.38, down: 0.20, left: -0.08 });

  const pickCurve = catmull([pickBase, pickMid, pickTip]);
  b.sweep(pickCurve, (t) => 0.042 * (1 - t * 0.82) + 0.006, {
    bone: head,
    color: SHADOW_IRON_PAINT,
    caps: "point",
  });

  // Pick Dorsal Teeth
  b.along(pickCurve, 4, (fr) => {
    b.spike(fr.at, fr.normal, 0.042, 0.012, {
      bone: head,
      color: DRAGON_BONE_PAINT,
    });
  });

  // ===========================================================================
  // 6. SOUL PHYLACTERY (Ribcage Lantern & Screaming Wraith)
  // ===========================================================================

  // Bone Chain Links from Dragon Throat
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

  // Lantern Top Dragonscale Cap
  b.part(
    new THREE.ConeGeometry(0.085, 0.045, 6),
    SHADOW_IRON_PAINT,
    { bone: cageBone, at: [cageCenter.x, cageCenter.y + 0.08, cageCenter.z] }
  );

  // Lantern Bottom Bone Funnel & Needle Drop
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

  // 6 Ribcage Struts forming the Cage
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

  // Floating Captive Soul Core Orb
  const soulCoreOrb = b.part(
    new THREE.SphereGeometry(0.042, 16, 12),
    SOUL_WHITE,
    { bone: cageBone, at: cageCenter }
  );
  glow(soulCoreOrb, 2.6);

  // 2 Trapped Screaming Soul Face Cards inside the Lantern
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
  // 7. PRIMARY SCYTHE BLADE (The Crescent Wyrmblade)
  // ===========================================================================

  // 7A. Heavy Dragonbone Spine along Outer Crescent Curve
  const bladeSpineSweep = b.sweep(
    bladeChain,
    (t) => 0.058 * (1 - t * 0.75) + 0.012,
    {
      bone: bladeChain.joints,
      color: BLACK_BONE_PAINT,
      caps: "point",
    }
  );

  // 8 Stepped Dragon Dorsal Fins along outer blade spine
  const numFins = 8;
  for (let f = 1; f <= numFins; f++) {
    const t = f / (numFins + 1);
    const cp = bladeChain.at(t);
    const finDir = new THREE.Vector3().copy(cp.binormal).multiplyScalar(0.4).add(cp.normal).normalize();
    const finHeight = (0.08 + Math.sin(t * Math.PI) * 0.14);

    b.spike(
      cp.at,
      offset(cp.at, finDir, finHeight),
      null,
      0.018 * (1 - t * 0.5),
      { bone: cp.bone, color: DRAGON_BONE_PAINT }
    );
  }

  // 7B. Inner Blade Body & Inlaid Soul Runes
  // Constructing blade plates between the spine and cutting edge
  const numBladeSegs = 10;
  for (let i = 0; i < numBladeSegs; i++) {
    const t0 = i / numBladeSegs;
    const t1 = (i + 1) / numBladeSegs;
    const cp0 = bladeChain.at(t0);
    const cp1 = bladeChain.at(t1);

    // Points along spine and inner cutting edge
    const innerOffset0 = 0.16 + Math.sin(t0 * Math.PI) * 0.22;
    const innerOffset1 = 0.16 + Math.sin(t1 * Math.PI) * 0.22;

    const in0 = new THREE.Vector3().copy(cp0.at).addScaledVector(cp0.normal, -innerOffset0);
    const in1 = new THREE.Vector3().copy(cp1.at).addScaledVector(cp1.normal, -innerOffset1);

    // Blade core slab
    b.slab([cp0.at, in0, in1, cp1.at], {
      bone: cp0.bone,
      thickness: 0.024 * (1 - t0 * 0.65),
      color: SHADOW_IRON_PAINT,
    });

    // Serrated Cutting Edge Segment (Condensed Glowing Soul Crystal)
    const edgeMid = mid(in0, in1);
    const edgeDir = new THREE.Vector3().copy(in1).sub(in0).normalize();
    const barbPoint = new THREE.Vector3()
      .copy(edgeMid)
      .addScaledVector(cp0.normal, -0.06 * Math.sin(t0 * Math.PI) - 0.02);

    const cuttingEdge = b.slab([in0, barbPoint, in1], {
      bone: cp0.bone,
      thickness: 0.014 * (1 - t0 * 0.7),
      color: SOUL_CYAN,
    });
    glow(cuttingEdge, 2.0);

    // Secondary Hook Teeth on the edge
    if (i === 2 || i === 5 || i === 7) {
      const hookTip = new THREE.Vector3()
        .copy(in0)
        .addScaledVector(cp0.normal, -0.09)
        .addScaledVector(edgeDir, -0.05);
      const hook = b.spike(in0, hookTip, null, 0.016, {
        bone: cp0.bone,
        color: SOUL_WHITE,
      });
      glow(hook, 2.2);
    }
  }

  // 7C. Glowing Soul Rune Inlay Strip along the Blade Fuller
  for (const s of [1, -1]) {
    const runeMesh = b.part(
      new THREE.PlaneGeometry(0.08, 0.85),
      "#ffffff",
      {
        bone: bladeChain.joints[1],
        at: [0.36, 2.30, 0.13 + s * 0.014],
        rotation: [-15, s > 0 ? 0 : 180, -28],
        texture: RUNE_STRIP_TEX,
      }
    );
    glow(runeMesh, 2.3);
  }

  // 7D. Soulfire Flame Crest along Blade Apex and Tip
  const flameCardFrames = [
    bladeChain.at(0.25),
    bladeChain.at(0.40),
    bladeChain.at(0.55),
    bladeChain.at(0.70),
    bladeChain.at(0.85),
    bladeChain.at(0.98),
  ].map((cp, idx) => {
    return frame(
      offset(cp.at, cp.normal, 0.02),
      offset(new THREE.Vector3(), cp.normal, 1.0).addScaledVector(cp.tangent, 0.3)
    );
  });

  const bladeFlames = b.cards(flameCardFrames, SOUL_FLAME_TEX, {
    size: [0.12, 0.28],
    lean: 30,
    bend: 35,
    bone: bladeChain.joints[2],
    color: SOUL_CYAN,
  });
  glow(bladeFlames, 2.1);

  // Screaming Soul Face at the Blade Apex
  const apexFaceHit = frame(
    bladeChain.at(0.5).at,
    bladeChain.at(0.5).normal
  );
  const apexSoulCard = b.cards([apexFaceHit], SOUL_FACE_TEX, {
    size: [0.16, 0.16],
    lean: 10,
    bone: bladeChain.joints[2],
    color: SOUL_WHITE,
  });
  glow(apexSoulCard, 2.4);

  // Razor Tip Finial (Extra long soul spike at tip)
  const tipCp = bladeChain.at(1.0);
  const razorTip = b.spike(
    tipCp.at,
    offset(tipCp.at, tipCp.tangent, 0.18),
    null,
    0.014,
    { bone: bladeChain.tip ?? bladeChain.joints[bladeChain.joints.length - 1], color: SOUL_WHITE }
  );
  glow(razorTip, 2.5);

  // ===========================================================================
  // 8. ETHEREAL VISUAL FX (Swirling Soul Ribbons & Drifting Embers)
  // ===========================================================================

  // 2 Condensed Soulfire Energy Swirls spiraling around the upper shaft
  const swirlA = spiral(
    [-0.04, 1.70, 0.01],
    [-0.04 + 0.10, 1.55, 0.01],
    [0.1, 1, 0.05],
    { turns: 1.8, pitch: 0.14, r1: 0.04 }
  );
  const ribbonA = b.sweep(swirlA, 0.007, {
    bone: shaftChain.joints[4],
    color: SOUL_CYAN,
  });
  glow(ribbonA, 2.2);

  const swirlB = spiral(
    [-0.03, 1.95, 0.02],
    [-0.03 - 0.12, 1.80, 0.02],
    [-0.1, 1, -0.05],
    { turns: -1.6, pitch: 0.16, r1: 0.05 }
  );
  const ribbonB = b.sweep(swirlB, 0.008, {
    bone: head,
    color: SOUL_WHITE,
  });
  glow(ribbonB, 2.4);

  // Floating Soul Embers drifting around the weapon
  const emberPositions: [number, number, number][] = [
    [0.15, 1.75, 0.18],
    [-0.18, 1.60, -0.12],
    [0.55, 2.15, 0.25],
    [0.72, 1.65, 0.38],
    [-0.12, 2.05, 0.14],
    [0.28, 2.40, 0.05],
    [-0.22, 1.35, 0.08],
    [0.08, 0.95, 0.12],
  ];

  emberPositions.forEach(([ex, ey, ez], idx) => {
    const emberHit = frame([ex, ey, ez], [0, 1, 0]);
    const emberCard = b.cards([emberHit], SOUL_FLAME_TEX, {
      size: [0.04 + (idx % 3) * 0.015, 0.09 + (idx % 2) * 0.04],
      lean: 15 * (idx % 3),
      bend: 20,
      bone: root,
      color: idx % 2 === 0 ? SOUL_CYAN : SOUL_WHITE,
    });
    glow(emberCard, 2.5);
  });

  return b.root;
}
```