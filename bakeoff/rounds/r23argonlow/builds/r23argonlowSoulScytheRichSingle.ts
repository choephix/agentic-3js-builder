import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame, line } from "../../../../src/frame";
import { aim, lerp, offset, rng } from "../../../../src/math";
import { bezier, catmull, polyline, spiral } from "../../../../src/path";
import { cells, countershade, grain, mix, mottle, noise, paint, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, furEdge, inkLines } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A towering League of Legends shadow-fantasy reaper scythe forged from an ancient dragon skull, articulated rib-spine shaft, spectral soul-crystal core, and wraith-iron crescent blade displayed on an obsidian soul-brazier plinth.",
  style: "League of Legends",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "soulScythe", detail: 1, paintSize: 2048 });

  // ============================================================================
  // PALETTE & PAINTS (League of Legends Shadow Isles / Dragonbone Necromancy)
  // ============================================================================

  // Flat glowing & accent colours (kept well under 64 flat colours)
  const SOUL_WHITE = "#e8fffb";
  const SOUL_BRIGHT = "#3dffdf";
  const SOUL_TEAL = "#10d4b8";
  const SOUL_DEEP = "#08756e";
  const SOUL_DARK_CORE = "#052d30";

  const GOLD_BRIGHT = "#f5c84c";
  const GOLD_MID = "#c48d24";
  const GOLD_DARK = "#6b4710";

  const IRON_DARK = "#1a202c";
  const IRON_MID = "#2d3748";
  const IRON_RIM = "#4a5970";

  const BONE_IVORY = "#e6dcc8";
  const BONE_AGED = "#b8a686";
  const BONE_SHADOW = "#695a47";
  const BONE_CHAR = "#2c2523";

  const WRAP_CRIMSON = "#63172b";
  const WRAP_DARK = "#2d0b16";

  // Rich procedural League hand-painted style paints
  // 1. Dragonbone: fossilized ivory with directional bone grain, char-darkened tips, and cel-shaded contrast
  const rawBoneGrain = grain(BONE_IVORY, BONE_AGED, { size: 0.035, axis: [0, 1, 0], seed: 11 });
  const mottledBone = mottle(rawBoneGrain, BONE_SHADOW, { size: 0.14, contrast: 1.4, seed: 23 });
  const DRAGON_BONE = cel(
    countershade(mottledBone, BONE_SHADOW, { level: -0.15, soft: 0.4 }),
    BONE_CHAR,
    { threshold: 0.05 },
  );

  // 2. Charred Ancient Horn / Fang: transitions from aged bone root to obsidian-charred tip with soul-teal veins
  const HORN_PAINT = paint((p, n, s) => {
    const t = Math.min(Math.max(s[0], 0), 1);
    const base = mix(BONE_AGED, BONE_CHAR, smoothstep(0.15, 0.78, t));
    const ridge = Math.sin(t * 52 + noise(p, 0.04, 31) * 3) * 0.5 + 0.5;
    const ringed = mix(base, "#141115", smoothstep(0.65, 0.92, ridge) * (1 - t * 0.5));
    const lit = n.dot(new THREE.Vector3(0.35, 0.8, 0.5).normalize()) > 0.05 ? ringed : mix(ringed, "#0c0a0e", 0.45);
    // Faint glowing soul fissures near the tip
    const cell = cells(p, 0.045, 77);
    const crack = smoothstep(0.05, 0.0, cell.d2 - cell.d1) * smoothstep(0.4, 0.85, t);
    return mix(lit, SOUL_BRIGHT, crack * 0.65);
  });

  // 3. Wraith-Iron & Soul-Forged Blade Paint: dark runic steel with glowing spectral bevel edge & energy veins
  const BLADE_PAINT = paint((p, n, s) => {
    // Extrude coordinates s = [x, y] in outline space; normal tells face vs bevel/wall
    const c = cells(p, 0.09, 105);
    const vein = smoothstep(0.06, 0.008, c.d2 - c.d1);
    const cloud = noise(p, 0.12, 109);
    const darkMetal = mix("#121722", "#263347", cloud);
    // Outer cutting edge runs at positive x/y in blade local space
    const radial = Math.hypot(s[0] - 0.1, s[1] - 0.05);
    const edgeFactor = smoothstep(0.32, 0.62, radial);
    const faceMetal = mix(darkMetal, "#115e59", edgeFactor * 0.65);
    const withVeins = mix(faceMetal, SOUL_BRIGHT, vein * (0.35 + 0.55 * edgeFactor));
    // Cel-like directional sheen + bright bevel rim
    const bevelCatch = Math.abs(n.x) < 0.72 ? 1 : 0;
    const rim = mix(withVeins, SOUL_TEAL, bevelCatch * 0.55 + edgeFactor * 0.35);
    return n.y > 0.15 ? mix(rim, SOUL_WHITE, edgeFactor * 0.28) : rim;
  });

  // 4. Secondary Inner Bone-Blade / Serrated Spine Paint
  const BONE_BLADE_PAINT = furEdge(DRAGON_BONE, HORN_PAINT, {
    by: "normal",
    axis: [0, 1, 0],
    level: -0.05,
    teeth: 0.24,
    period: 0.045,
    ink: BONE_CHAR,
  });

  // 5. Ancient Gold / Sanctum Bronze Trim Paint
  const GOLD_TRIM = cel(
    inkLines(mottle(GOLD_BRIGHT, GOLD_MID, { size: 0.06, contrast: 1.3, seed: 41 }), {
      levels: [-0.45, 0.55],
      axis: [0, 1, 0],
      width: 0.07,
      ink: GOLD_DARK,
    }),
    GOLD_DARK,
    { threshold: 0.0 },
  );

  // 6. Dark Wraith-Iron Armor Paint
  const DARK_IRON = cel(
    mottle(IRON_MID, IRON_DARK, { size: 0.08, contrast: 1.5, seed: 53 }),
    "#0d1118",
    { threshold: 0.08 },
  );

  // 7. Wrapped Wyrm-Hide Grip Paint (spiral leather bands with crimson & shadow contrast)
  const GRIP_WRAP = paint((p, n, s) => {
    const band = Math.sin(s[0] * 68 + s[1] * 0.035);
    const seam = smoothstep(-0.85, -0.55, band);
    const hide = mottle(WRAP_CRIMSON, "#451020", { size: 0.03, seed: 61 }).at(p, n);
    const base = mix(WRAP_DARK, hide, seam);
    const shade = n.dot(new THREE.Vector3(0.35, 0.8, 0.5).normalize()) > 0 ? 1 : 0.68;
    return [base[0] * shade, base[1] * shade, base[2] * shade];
  });

  // 8. Obsidian Altar Plinth Paint (carved dark basalt with glowing turquoise soul-leyline cracks)
  const OBSIDIAN_PLINTH = paint((p, n) => {
    const c = cells(p, 0.14, 88);
    const crack = smoothstep(0.045, 0.006, c.d2 - c.d1);
    const heightGlow = smoothstep(0.22, 0.02, p.y);
    const stone = mix("#141821", "#252d3d", noise(p, 0.11, 91));
    const topHighlight = n.y > 0.65 ? mix(stone, "#333f54", 0.45) : stone;
    return mix(topHighlight, SOUL_TEAL, crack * (0.35 + 0.55 * heightGlow));
  });

  // ============================================================================
  // SVG TEXTURES (Soul Flames, Spectral Runes, Wraith Ribbons, Arcane Sigil)
  // ============================================================================

  // Spectral Wisp / Soul Flame Card Texture
  const SOUL_FLAME_TEX = svg(
    `<svg viewBox="0 0 128 256">
      <defs>
        <linearGradient id="sf" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="#08756e"/>
          <stop offset="35%" stop-color="#14e8c8"/>
          <stop offset="75%" stop-color="#7affea"/>
          <stop offset="100%" stop-color="#e8fffb"/>
        </linearGradient>
      </defs>
      <path d="M64 252 C22 220 12 155 34 98 C46 68 30 38 64 4 C92 38 82 72 96 104 C116 152 104 220 64 252 Z" fill="url(#sf)"/>
      <path d="M64 240 C40 205 34 152 50 106 C58 82 50 52 64 24 C78 54 70 84 80 110 C92 152 86 205 64 240 Z" fill="#befef4"/>
      <path d="M64 222 C52 192 50 150 58 116 C64 92 60 72 64 52 C68 74 66 94 70 118 C76 150 74 192 64 222 Z" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  // Tattered Shadow-Isles Wraith Banner / Soul Ribbon Card Texture
  const SOUL_RIBBON_TEX = svg(
    `<svg viewBox="0 0 128 320">
      <defs>
        <linearGradient id="sr" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1c2536"/>
          <stop offset="45%" stop-color="#0d3b3e"/>
          <stop offset="80%" stop-color="#12a896"/>
          <stop offset="100%" stop-color="#6effea"/>
        </linearGradient>
      </defs>
      <path d="M24 0 L104 0 L114 96 L94 188 L112 264 L82 316 L64 268 L44 318 L18 258 L34 180 L14 92 Z" fill="url(#sr)"/>
      <path d="M36 12 L92 12 L98 94 L82 182 L94 250 L76 292 L64 246 L50 294 L32 248 L46 176 L30 90 Z" fill="none" stroke="#3dffdf" stroke-width="5"/>
      <circle cx="64" cy="54" r="14" fill="none" stroke="#f5c84c" stroke-width="5"/>
      <path d="M64 32 L78 54 L64 76 L50 54 Z" fill="#3dffdf"/>
      <path d="M48 118 L80 118 L64 156 Z" fill="#3dffdf"/>
      <path d="M52 184 L76 184 L64 220 Z" fill="#a8fff2"/>
    </svg>`,
    { size: 256 },
  );

  // Glowing Runic Sigil Texture for Plinth & Blade Decals
  const RUNE_SIGIL_TEX = svg(
    `<svg viewBox="0 0 256 256">
      <circle cx="128" cy="128" r="114" fill="none" stroke="#10d4b8" stroke-width="8"/>
      <circle cx="128" cy="128" r="92" fill="none" stroke="#6effea" stroke-width="5" stroke-dasharray="18 10"/>
      <polygon points="128,22 220,180 36,180" fill="none" stroke="#3dffdf" stroke-width="7"/>
      <polygon points="128,234 220,76 36,76" fill="none" stroke="#10d4b8" stroke-width="6"/>
      <polygon points="128,56 164,128 128,200 92,128" fill="#10d4b8"/>
      <polygon points="128,76 150,128 128,180 106,128" fill="#e8fffb"/>
      <circle cx="128" cy="36" r="9" fill="#e8fffb"/>
      <circle cx="128" cy="220" r="9" fill="#e8fffb"/>
      <circle cx="48" cy="128" r="9" fill="#e8fffb"/>
      <circle cx="208" cy="128" r="9" fill="#e8fffb"/>
    </svg>`,
    { size: 512 },
  );

  // Blade Etched Dragon-Rune Decal Texture
  const BLADE_RUNE_TEX = svg(
    `<svg viewBox="0 0 256 128">
      <path d="M12 64 L52 28 L92 64 L52 100 Z" fill="none" stroke="#3dffdf" stroke-width="7"/>
      <path d="M32 64 L52 44 L72 64 L52 84 Z" fill="#e8fffb"/>
      <path d="M96 64 L236 64" stroke="#3dffdf" stroke-width="6" stroke-linecap="round"/>
      <path d="M118 36 L142 64 L118 92 M162 40 L184 64 L162 88 M200 46 L218 64 L200 82" fill="none" stroke="#99fff0" stroke-width="6" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  // ============================================================================
  // SKELETON & RIG HIERARCHY (Real-world hero polearm size: ~2.35 m tall)
  // ============================================================================
  // Root sits on the floor at y = 0 inside the display plinth; weapon shaft rises
  // dynamically through a slight S-curve, crowned by the dragon skull & giant crescent blade.

  const plinthRoot = b.joint("plinthRoot", { at: [0, 0.0, 0], dir: [0, 1, 0], role: "spine" });

  // Articulated shaft spine chain (allows flex tests to bend the scythe shaft & swing the weapon)
  const shaftCurve = catmull([
    [0, 0.14, -0.04],
    [0, 0.56, -0.08],
    [0, 1.04, -0.02],
    [0, 1.48, 0.05],
    [0, 1.82, 0.0],
  ]);
  const shaftChain = b.chain("shaft", shaftCurve, {
    parent: plinthRoot,
    names: ["shaftBase", "shaftLower", "shaftMid", "shaftUpper", "shaftHead"],
    role: "spine",
  });
  const [shaftBase, shaftLower, shaftMid, shaftUpper, shaftHead] = shaftChain.joints;

  // Dragon Skull & Jaw joints at top of the shaft
  const dragonSkull = b.joint("dragonSkull", {
    parent: shaftHead,
    at: [0, 1.86, 0.02],
    dir: [0, 0.18, 1],
    role: "head",
    group: "skull",
  });
  const dragonJaw = b.joint("dragonJaw", {
    parent: dragonSkull,
    at: [0, 1.77, 0.08],
    dir: [0, -0.28, 0.96],
    role: "jaw",
    group: "skull",
  });

  // Primary Scythe Blade Hinge & Articulated Blade Chain (sweeps forward +Z and arches down)
  const bladeMount = b.joint("bladeMount", {
    parent: dragonSkull,
    at: [0, 1.88, 0.18],
    dir: [0, 0.25, 1],
    role: "hinge",
    group: "blade",
  });
  const bladeRoot = b.joint("bladeRoot", {
    parent: bladeMount,
    at: [0, 1.92, 0.36],
    dir: [0, -0.15, 1],
    role: "wing",
    group: "blade",
  });
  const bladeMid = b.joint("bladeMid", {
    parent: bladeRoot,
    at: [0, 1.76, 0.72],
    dir: [0, -0.75, 0.65],
    role: "wing",
    group: "blade",
  });
  const bladeTip = b.joint("bladeTip", {
    parent: bladeMid,
    at: [0, 1.28, 0.88],
    dir: [0, -0.95, -0.25],
    role: "wing",
    group: "blade",
  });

  // Rear Counter-Spike / Dorsal Crest Hinge
  const dorsalCrest = b.joint("dorsalCrest", {
    parent: dragonSkull,
    at: [0, 1.92, -0.08],
    dir: [0, 0.35, -0.94],
    role: "hinge",
    group: "skull",
  });

  // Floating Soul-Lantern Core Joint (suspended inside the dragon's open jaws / throat)
  const soulCore = b.joint("soulCore", {
    parent: dragonSkull,
    at: [0, 1.62, 0.24],
    dir: [0, 1, 0],
    role: "hinge",
    group: "soul",
  });

  // Hanging Bone-Chain Censer Joint beneath the rear skull
  const censerChainTop = b.joint("censerChainTop", {
    parent: dorsalCrest,
    at: [0, 1.82, -0.34],
    dir: [0, -1, 0],
    role: "tail",
    group: "censer",
  });
  const censerBody = b.joint("censerBody", {
    parent: censerChainTop,
    at: [0, 1.46, -0.34],
    dir: [0, -1, 0],
    role: "hinge",
    group: "censer",
  });

  // Pommel Tail Spike Joint at bottom of the scythe
  const pommelJoint = b.joint("pommelJoint", {
    parent: shaftBase,
    at: [0, 0.16, -0.04],
    dir: [0, -1, -0.15],
    role: "tail",
    group: "pommel",
  });

  // ============================================================================
  // 1. OBSIDIAN & DRAGONBONE SOUL-BRAZIER PLINTH (Touching y = 0.0)
  // ============================================================================

  // Stepped octagonal dark-stone runic altar base (y = 0 to y = 0.18)
  b.lathe(
    [
      [0, 0],
      [0.54, 0],
      [0.56, 0.035],
      [0.49, 0.055],
      [0.46, 0.095],
      [0.37, 0.115],
      [0.34, 0.155],
      [0.24, 0.175],
      [0, 0.175],
    ],
    {
      at: [0, 0, 0],
      segments: 8,
      color: OBSIDIAN_PLINTH,
      bone: plinthRoot,
      group: "plinth",
      name: "altarBase",
    },
  );

  // Heavy gold-trimmed sanctum ring around the mid-step of the plinth
  b.lathe(
    [
      [0.35, 0.105],
      [0.475, 0.105],
      [0.485, 0.125],
      [0.36, 0.135],
    ],
    {
      at: [0, 0, 0],
      segments: 8,
      color: GOLD_TRIM,
      bone: plinthRoot,
      group: "plinth",
      name: "altarGoldTrim",
    },
  );

  // Glowing Soul-Well Pool recessed into the top of the plinth
  glow(
    b.part(new THREE.CylinderGeometry(0.23, 0.25, 0.02, 8), SOUL_TEAL, {
      bone: plinthRoot,
      at: [0, 0.172, 0],
      flat: true,
      group: "plinth",
      name: "soulWellPool",
    }),
    1.4,
  );

  // Glowing Runic Sigil Plane hovering 4 mm above the soul pool
  glow(
    b.part(new THREE.PlaneGeometry(0.42, 0.42), "#ffffff", {
      bone: plinthRoot,
      at: [0, 0.186, 0],
      dir: [0, 1, 0],
      up: [0, 0, 1],
      axis: "z",
      texture: RUNE_SIGIL_TEX,
      group: "plinth",
      name: "plinthSigil",
    }),
    1.8,
  );

  // 6 Dragon-Claw Bone Buttresses & Soul-Crystal Shards ringing the plinth and gripping the floor (y = 0)
  b.ring(
    frame([0, 0.0, 0], [0, 1, 0]),
    { count: 6, radius: 0.44, parent: plinthRoot, group: "plinth" },
    (clawBase) => {
      const p0 = clawBase.local([0, 0.02, -0.06]);
      const p1 = clawBase.local([0, 0.16, 0.04]);
      const p2 = clawBase.local([0, 0.27, -0.14]);
      // Curved bone talon buttress arching up from the ground to clamp the plinth
      b.sweep(bezier(p0, p1, p2), [0.055, 0.038, 0.008], {
        bone: plinthRoot,
        section: { ngon: 5 },
        color: DRAGON_BONE,
        caps: { start: "flat", end: "point" },
        group: "plinth",
      });
      // Gold shackle band at the base of each talon
      b.rod(clawBase.local([0, 0.0, -0.03]), clawBase.local([0, 0.06, -0.01]), [0.062, 0.052], {
        bone: plinthRoot,
        section: { ngon: 6 },
        color: GOLD_TRIM,
        group: "plinth",
      });
      // Glowing soul-crystal shard erupting beside each buttress
      const cBase = clawBase.local([0.07, 0.08, -0.08]);
      const cTip = clawBase.local([0.11, 0.31, -0.04]);
      glow(
        b.sweep([cBase, cTip], [0.032, 0.004], {
          bone: plinthRoot,
          section: { ngon: 5 },
          color: clawBase.i % 2 === 0 ? SOUL_BRIGHT : SOUL_TEAL,
          caps: { start: "flat", end: "point" },
          group: "plinth",
        }),
        1.6,
      );
    },
  );

  // Two Massive Dragon-Rib Stand Brackets rising from the plinth to cradle the lower scythe shaft
  for (const s of [1, -1]) {
    const standCurve = bezier(
      [s * 0.28, 0.14, 0.12],
      [s * 0.34, 0.34, 0.06],
      [s * 0.16, 0.48, -0.02],
      [s * 0.045, 0.54, -0.07],
    );
    b.sweep(standCurve, [0.048, 0.036, 0.022], {
      bone: plinthRoot,
      section: { ngon: 6 },
      color: DRAGON_BONE,
      caps: { start: "flat", end: "round" },
      group: "plinth",
      name: `standRib_${s > 0 ? "L" : "R"}`,
    });
    // Ornate dark-iron & gold clamp collar where the stand meets the shaft
    b.sweep(
      [
        [s * 0.07, 0.51, -0.07],
        [0, 0.54, -0.075],
      ],
      0.034,
      {
        bone: plinthRoot,
        section: { ngon: 6 },
        color: GOLD_TRIM,
        group: "plinth",
      },
    );
  }

  // ============================================================================
  // 2. ARTICULATED DRAGON-SPINE SHAFT & POMMEL (y = 0.08 to 1.86)
  // ============================================================================

  // Core spectral energy conduit running the full length of the shaft (visible between vertebrae)
  glow(
    b.sweep(
      shaftChain,
      (t) => 0.019 + 0.006 * Math.sin(t * Math.PI * 3),
      {
        sides: 6,
        smooth: false,
        color: SOUL_BRIGHT,
        group: "shaft",
        name: "shaftSoulCore",
      },
    ),
    1.8,
  );

  // Outer sculpted dragonbone & wrapped-hide shaft segments
  b.sweep(
    shaftChain,
    (t) => {
      // Thicker at the lower grip, mid-ferrule, and upper neck collar; slimmer at hand-grips
      const swell = 0.034 + 0.014 * Math.pow(t, 1.4) + 0.007 * Math.cos(t * Math.PI * 6);
      return [swell * 0.92, swell * 1.12];
    },
    {
      section: { ngon: 6 },
      color: (t) => {
        if (t > 0.16 && t < 0.38) return GRIP_WRAP;
        if (t > 0.54 && t < 0.72) return GRIP_WRAP;
        return DRAGON_BONE;
      },
      group: "shaft",
      name: "shaftMainTube",
    },
  );

  // Heavy Gold & Dark-Iron Ferrules dividing the grip sections along the shaft
  const ferruleTs = [0.15, 0.39, 0.53, 0.73, 0.88];
  ferruleTs.forEach((ft, idx) => {
    const cp = shaftChain.at(ft);
    const r = 0.044 + idx * 0.004;
    b.rod(cp.local([0, -0.028, 0]), cp.local([0, 0.028, 0]), [r * 0.9, r * 1.08], {
      bone: cp.bone,
      section: { ngon: 6 },
      color: idx % 2 === 0 ? GOLD_TRIM : DARK_IRON,
      group: "shaft",
      name: `shaftFerrule_${idx}`,
    });
    // Glowing soul-gem rivets on the left and right of each ferrule
    for (const s of [1, -1]) {
      glow(
        b.part(new THREE.OctahedronGeometry(0.014, 0), SOUL_WHITE, {
          bone: cp.bone,
          at: cp.local([s * (r * 0.98), 0, 0]),
          flat: true,
          group: "shaft",
        }),
        2.0,
      );
    }
  });

  // Interlocking Dragon Vertebrae & Dorsal Spines climbing the upper half of the shaft
  b.along(
    shaftChain,
    9,
    (at) => {
      const scale = 0.75 + 0.65 * at.t;
      // Vertebra neural arch collar wrapping the shaft
      b.frustumBox(
        at.local([0, -0.025 * scale, -0.015 * scale]),
        at.local([0, 0.032 * scale, -0.025 * scale]),
        [0.088 * scale, 0.075 * scale],
        [0.068 * scale, 0.095 * scale],
        {
          bone: at.bone,
          color: DRAGON_BONE,
          group: "shaft",
        },
      );
      // Swept-back dorsal vertebra spine (-Z direction)
      const spineStart = at.local([0, 0.0, -0.03 * scale]);
      const spineMid = at.local([0, 0.045 * scale, -0.11 * scale]);
      const spineTip = at.local([0, 0.095 * scale, -0.17 * scale]);
      b.sweep(bezier(spineStart, spineMid, spineTip), [0.024 * scale, 0.004], {
        bone: at.bone,
        section: { ngon: 5 },
        color: HORN_PAINT,
        caps: { start: "flat", end: "point" },
        group: "shaft",
      });
      // Lateral transverse rib-spurs jutting left and right
      for (const s of [1, -1]) {
        const ribBase = at.local([s * 0.032 * scale, 0, -0.01 * scale]);
        const ribTip = at.local([s * 0.095 * scale, 0.035 * scale, -0.055 * scale]);
        b.spike(ribBase, ribTip, null, 0.016 * scale, {
          bone: at.bone,
          section: { ngon: 5 },
          color: DRAGON_BONE,
          group: "shaft",
        });
      }
    },
    { from: 0.35, to: 0.96 },
  );

  // Spiralling Soul-Vein Tendril coiling around the shaft from bottom to skull
  const spiralPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 28; i++) {
    const u = i / 28;
    const cp = shaftChain.at(0.12 + u * 0.82);
    const ang = u * Math.PI * 5.0;
    const rad = 0.044 + u * 0.012;
    spiralPts.push(cp.local([Math.cos(ang) * rad, 0, Math.sin(ang) * rad]));
  }
  glow(
    b.sweep(catmull(spiralPts), [0.009, 0.013, 0.008], {
      bone: shaftChain,
      sides: 5,
      smooth: false,
      color: SOUL_TEAL,
      group: "shaft",
      name: "shaftSoulSpiral",
    }),
    1.5,
  );

  // Clawed Dragon-Tail Pommel Assembly at the base of the shaft (hovers just above plinth pool, y ≈ 0.08..0.28)
  b.lathe(
    [
      [0, 0],
      [0.058, 0.03],
      [0.072, 0.075],
      [0.048, 0.12],
      [0.055, 0.15],
      [0, 0.165],
    ],
    {
      at: [0, 0.11, -0.04],
      segments: 6,
      color: GOLD_TRIM,
      bone: pommelJoint,
      group: "pommel",
      name: "pommelHousing",
    },
  );

  // Downward-pointing obsidian & bone tail-spike piercing into the soul-well
  b.spike([0, 0.13, -0.04], [0, 0.02, -0.045], null, 0.042, {
    bone: pommelJoint,
    section: { ngon: 6 },
    color: HORN_PAINT,
    group: "pommel",
    name: "pommelSpike",
  });

  // Glowing Soul-Crystal Pommel Core caged by 4 bone talons
  glow(
    b.part(new THREE.OctahedronGeometry(0.048, 0), SOUL_BRIGHT, {
      bone: pommelJoint,
      at: [0, 0.18, -0.04],
      scale: [0.85, 1.45, 0.85],
      flat: true,
      group: "pommel",
      name: "pommelCrystal",
    }),
    2.0,
  );
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2 + Math.PI / 4;
    const cx = Math.cos(a);
    const cz = Math.sin(a);
    b.sweep(
      bezier(
        [cx * 0.052, 0.25, -0.04 + cz * 0.052],
        [cx * 0.078, 0.18, -0.04 + cz * 0.078],
        [cx * 0.032, 0.11, -0.04 + cz * 0.032],
      ),
      [0.018, 0.005],
      {
        bone: pommelJoint,
        section: { ngon: 5 },
        color: DRAGON_BONE,
        caps: { start: "flat", end: "point" },
        group: "pommel",
      },
    );
  }

  // ============================================================================
  // 3. ANCIENT DRAGON SKULL CROWN & JAW (Weapon Head, y ≈ 1.65 to 2.28)
  // ============================================================================

  // Cranium & Snout Loft: wide horned back-skull tapering into a fierce armored dragon snout (+Z)
  const craniumLoft = b.loft(
    [
      { at: [0, 1.84, -0.14], w: 0.22, h: 0.18 },
      { at: [0, 1.91, 0.02], w: 0.34, h: 0.24 },
      { at: [0, 1.94, 0.18], w: 0.28, h: 0.21 },
      { at: [0, 1.91, 0.36], w: 0.19, h: 0.15 },
      { at: [0, 1.86, 0.50], w: 0.12, h: 0.10 },
    ],
    {
      bone: dragonSkull,
      section: { ngon: 6 },
      color: DRAGON_BONE,
      group: "skull",
      name: "dragonCranium",
    },
  );

  // Sculpted Nasal Bridge Crest & Brow Armor Plates
  b.extrude(
    [
      [0, 0.0],
      [0.44, -0.03],
      [0.48, 0.03, "sharp"],
      [0.34, 0.09, "sharp"],
      [0.22, 0.06],
      [0.12, 0.12, "sharp"],
      [-0.06, 0.08, "sharp"],
    ],
    {
      at: [0, 1.96, 0.02],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: [0.07, 0.015],
      bevel: 0.008,
      bone: dragonSkull,
      color: GOLD_TRIM,
      group: "skull",
      name: "skullNasalCrown",
    },
  );

  // Bilateral Skull Details: Zygomatic Cheekbones, Brow Horns, Great Swept Dragon Horns, Glowing Eyes, Upper Fangs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Fierce Supraorbital Brow Ridge
    b.sweep(
      bezier(
        [s * 0.07, 1.98, 0.26],
        [s * 0.16, 2.02, 0.16],
        [s * 0.22, 1.97, 0.02],
      ),
      [0.026, 0.034, 0.016],
      {
        bone: dragonSkull,
        section: { ngon: 5 },
        color: DRAGON_BONE,
        caps: { start: "round", end: "point" },
        group: "skull",
        name: `skullBrow_${side}`,
      },
    );

    // Jagged Cheek / Jugal Bone Spur
    b.sweep(
      bezier(
        [s * 0.13, 1.85, 0.24],
        [s * 0.21, 1.82, 0.08],
        [s * 0.26, 1.78, -0.08],
      ),
      [0.032, 0.024, 0.006],
      {
        bone: dragonSkull,
        section: { ngon: 5 },
        color: DRAGON_BONE,
        caps: { start: "flat", end: "point" },
        group: "skull",
        name: `cheekSpur_${side}`,
      },
    );

    // Glowing Spectral Eye Socket & Soul-Fire Eye Orb
    b.part(new THREE.CylinderGeometry(0.042, 0.028, 0.04, 6), IRON_DARK, {
      bone: dragonSkull,
      at: [s * 0.135, 1.91, 0.18],
      dir: [s * 0.82, 0.15, 0.55],
      flat: true,
      group: "skull",
      name: `eyeSocket_${side}`,
    });
    glow(
      b.part(new THREE.OctahedronGeometry(0.032, 1), SOUL_BRIGHT, {
        bone: dragonSkull,
        at: [s * 0.148, 1.915, 0.19],
        scale: [0.8, 0.9, 1.35],
        flat: true,
        group: "skull",
        name: `eyeOrb_${side}`,
      }),
      2.4,
    );
    // Trailing spectral eye-flame wisp sweeping back from each eye socket
    const eyeWispPath = bezier(
      [s * 0.16, 1.92, 0.18],
      [s * 0.24, 1.98, 0.04],
      [s * 0.29, 2.08, -0.14],
    );
    glow(
      b.sweep(eyeWispPath, [0.018, 0.002], {
        bone: dragonSkull,
        sides: 5,
        smooth: false,
        color: SOUL_WHITE,
        caps: { start: "round", end: "point" },
        group: "skull",
        name: `eyeWisp_${side}`,
      }),
      2.2,
    );

    // Primary Great Swept Dragon Horns (massive high-contrast S-curved horns sweeping back & up)
    const greatHornPath = catmull([
      [s * 0.13, 1.98, 0.02],
      [s * 0.24, 2.08, -0.14],
      [s * 0.30, 2.18, -0.36],
      [s * 0.22, 2.28, -0.58],
      [s * 0.12, 2.34, -0.72],
    ]);
    b.sweep(greatHornPath, [0.068, 0.052, 0.036, 0.018, 0.004], {
      bone: dragonSkull,
      section: { ngon: 6 },
      color: HORN_PAINT,
      caps: { start: "flat", end: "point" },
      group: "skull",
      name: `greatHorn_${side}`,
    });

    // Ornate Gold Horn-Collar Band around the base of each great horn
    b.rod(
      [s * 0.12, 1.97, 0.03],
      [s * 0.18, 2.02, -0.05],
      [0.074, 0.064],
      {
        bone: dragonSkull,
        section: { ngon: 6 },
        color: GOLD_TRIM,
        group: "skull",
      },
    );

    // Secondary Lower Temple Horns (curving outward and down to frame the skull silhouette)
    const lowerHornPath = bezier(
      [s * 0.15, 1.88, -0.04],
      [s * 0.28, 1.84, -0.22],
      [s * 0.34, 1.74, -0.40],
      [s * 0.26, 1.62, -0.48],
    );
    b.sweep(lowerHornPath, [0.044, 0.03, 0.014, 0.003], {
      bone: dragonSkull,
      section: { ngon: 5 },
      color: HORN_PAINT,
      caps: { start: "flat", end: "point" },
      group: "skull",
      name: `templeHorn_${side}`,
    });

    // Upper Maxillary Dragon Fangs (5 serrated fangs per side gripping the blade mount)
    for (let f = 0; f < 5; f++) {
      const ft = f / 4;
      const fz = 0.18 + ft * 0.28;
      const fx = s * (0.115 - ft * 0.048);
      const fy = 1.85 - ft * 0.02;
      const fangLen = (f === 1 || f === 4 ? 0.11 : 0.075) * (1 - ft * 0.15);
      const fangR = f === 1 || f === 4 ? 0.018 : 0.013;
      b.sweep(
        bezier(
          [fx, fy, fz],
          [fx * 0.95, fy - fangLen * 0.55, fz + 0.015],
          [fx * 0.85, fy - fangLen, fz - 0.01],
        ),
        [fangR, 0.002],
        {
          bone: dragonSkull,
          section: { ngon: 5 },
          color: HORN_PAINT,
          caps: { start: "flat", end: "point" },
          group: "skull",
        },
      );
    }
  }

  // Articulated Lower Dragon Mandible (hinged open to disgorge the scythe blade & soul core)
  for (const s of [1, -1]) {
    const jawBranch = catmull([
      [s * 0.13, 1.78, 0.04],
      [s * 0.11, 1.71, 0.18],
      [s * 0.075, 1.66, 0.32],
      [s * 0.025, 1.64, 0.43],
    ]);
    b.sweep(jawBranch, [0.038, 0.034, 0.026, 0.02], {
      bone: dragonJaw,
      section: { ngon: 5 },
      color: DRAGON_BONE,
      caps: { start: "round", end: "round" },
      group: "skull",
      name: `jawMandible_${s > 0 ? "L" : "R"}`,
    });

    // Lower Jaw Fangs pointing up & forward
    for (let f = 0; f < 4; f++) {
      const ft = f / 3;
      const fz = 0.16 + ft * 0.25;
      const fx = s * (0.095 - ft * 0.055);
      const fy = 1.70 - ft * 0.05;
      const fangH = f === 3 ? 0.095 : 0.065;
      b.spike([fx, fy, fz], [fx * 0.9, fy + fangH, fz + 0.02], null, f === 3 ? 0.016 : 0.012, {
        bone: dragonJaw,
        section: { ngon: 5 },
        color: HORN_PAINT,
        group: "skull",
      });
    }
  }
  // Chin Symphysis Beard-Spike under the front of the lower jaw
  b.sweep(
    bezier([0, 1.64, 0.42], [0, 1.56, 0.46], [0, 1.48, 0.41]),
    [0.032, 0.018, 0.004],
    {
      bone: dragonJaw,
      section: { ngon: 5 },
      color: HORN_PAINT,
      caps: { start: "flat", end: "point" },
      group: "skull",
      name: "jawChinSpike",
    },
  );

  // Glowing Spectral Maw / Throat Core inside the open skull
  glow(
    b.part(new THREE.SphereGeometry(0.075, 8, 6), SOUL_TEAL, {
      bone: dragonSkull,
      at: [0, 1.82, 0.16],
      scale: [0.95, 0.85, 1.4],
      flat: true,
      group: "skull",
      name: "skullMawGlow",
    }),
    1.9,
  );

  // ============================================================================
  // 4. COLOSSAL CRESCENT SOUL-BLADE & DRAGONBONE SPINE (League Hero Silhouette)
  // ============================================================================
  // In League of Legends weapon design, the blade is oversized, chunky, bevelled,
  // with a heavy bone/gold dorsal spine and a razor-sharp spectral-glowing inner/outer crescent.

  // Layer 1: Inner Glowing Soul-Crystal Core Plane of the Scythe Blade (protruding at the razor edge & notches)
  const soulBladeOutline: OutlinePoint[] = [
    [0.14, 1.92, "sharp"],
    [0.42, 2.02],
    [0.74, 1.98],
    [1.02, 1.80, "sharp"],
    [0.95, 1.68, "sharp"], // upper battle-notch
    [1.10, 1.58, "sharp"],
    [1.14, 1.24],
    [1.04, 0.88],
    [0.82, 0.56, "sharp"], // primary reaper point!
    [0.74, 0.78, "sharp"], // inner barb
    [0.84, 0.96],
    [0.86, 1.25],
    [0.74, 1.52],
    [0.54, 1.68, "sharp"], // inner throat hook
    [0.58, 1.56, "sharp"],
    [0.38, 1.72],
    [0.16, 1.76, "sharp"],
  ];
  glow(
    b.extrude(soulBladeOutline, {
      at: [0, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: [0.016, 0.003],
      bevel: 0.004,
      smoothing: 1,
      bone: bladeMid,
      color: SOUL_BRIGHT,
      group: "blade",
      name: "scytheBladeSoulEdge",
    }),
    1.7,
  );

  // Layer 2: Heavy Runic Wraith-Iron Main Blade Plate (slightly inset from the glowing soul razor edge)
  const ironBladeOutline: OutlinePoint[] = [
    [0.12, 1.93, "sharp"],
    [0.40, 2.01],
    [0.70, 1.96],
    [0.96, 1.79, "sharp"],
    [0.90, 1.69, "sharp"],
    [1.03, 1.59, "sharp"],
    [1.06, 1.26],
    [0.96, 0.94],
    [0.80, 0.66, "sharp"],
    [0.82, 0.96],
    [0.85, 1.26],
    [0.75, 1.55],
    [0.54, 1.72],
    [0.34, 1.78],
    [0.14, 1.79, "sharp"],
  ];
  const mainBladePart = b.extrude(ironBladeOutline, {
    at: [0, 0, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: [0.044, 0.012],
    bevel: 0.01,
    smoothing: 1,
    bone: bladeMid,
    color: BLADE_PAINT,
    group: "blade",
    name: "scytheBladeIronPlate",
  });

  // Layer 3: Sculpted Dragonbone Dorsal Blade-Back (sweeps along the outer crest of the blade like a fused wing-arm)
  const boneSpineCurve = catmull([
    [0, 1.90, 0.16],
    [0, 1.99, 0.44],
    [0, 1.95, 0.72],
    [0, 1.76, 0.96],
    [0, 1.42, 1.05],
    [0, 1.04, 0.97],
  ]);
  b.sweep(boneSpineCurve, [0.062, 0.054, 0.046, 0.036, 0.024, 0.008], {
    bone: [bladeMount, bladeRoot, bladeMid, bladeTip],
    section: { ngon: 6 },
    color: BONE_BLADE_PAINT,
    caps: { start: "round", end: "point" },
    group: "blade",
    name: "bladeDragonSpine",
  });

  // 6 Serrated Dragonbone Dorsal Fin-Spurs along the outer back of the scythe blade
  const finData: Array<{ z: number; y: number; dz: number; dy: number; r: number }> = [
    { z: 0.34, y: 1.98, dz: 0.08, dy: 0.16, r: 0.032 },
    { z: 0.54, y: 1.99, dz: 0.14, dy: 0.17, r: 0.030 },
    { z: 0.74, y: 1.93, dz: 0.18, dy: 0.14, r: 0.028 },
    { z: 0.91, y: 1.79, dz: 0.20, dy: 0.06, r: 0.025 },
    { z: 1.02, y: 1.56, dz: 0.19, dy: -0.05, r: 0.022 },
    { z: 1.03, y: 1.30, dz: 0.16, dy: -0.14, r: 0.018 },
  ];
  finData.forEach((f, i) => {
    b.sweep(
      bezier(
        [0, f.y - 0.02, f.z - 0.02],
        [0, f.y + f.dy * 0.55, f.z + f.dz * 0.4],
        [0, f.y + f.dy, f.z + f.dz],
      ),
      [f.r, 0.003],
      {
        bone: i < 2 ? bladeRoot : i < 4 ? bladeMid : bladeTip,
        section: { ngon: 5 },
        color: HORN_PAINT,
        caps: { start: "flat", end: "point" },
        group: "blade",
        name: `bladeDorsalSpur_${i}`,
      },
    );
  });

  // Ornate Gold Filigree Cheek-Guards & Winged Collars clamping the blade root on both faces (+X and -X)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.extrude(
      [
        [0.16, 1.80, "sharp"],
        [0.44, 1.96],
        [0.68, 1.90, "sharp"],
        [0.54, 1.78, "sharp"],
        [0.62, 1.68, "sharp"],
        [0.36, 1.72],
      ],
      {
        at: [s * 0.024, 0, 0],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.018,
        bevel: 0.005,
        bone: bladeRoot,
        color: GOLD_TRIM,
        group: "blade",
        name: `bladeGoldGuard_${side}`,
      },
    );

    // 3 Curved Bone Rib-Struts clamping across each face of the blade from the dorsal spine
    for (let r = 0; r < 3; r++) {
      const z0 = 0.42 + r * 0.20;
      const y0 = 1.95 - r * 0.08;
      const z1 = 0.52 + r * 0.16;
      const y1 = 1.72 - r * 0.16;
      b.sweep(
        bezier(
          [s * 0.036, y0, z0],
          [s * 0.042, (y0 + y1) * 0.5, (z0 + z1) * 0.5 + 0.04],
          [s * 0.02, y1, z1],
        ),
        [0.022, 0.015, 0.006],
        {
          bone: bladeMid,
          section: { ngon: 5 },
          color: DRAGON_BONE,
          caps: { start: "round", end: "point" },
          group: "blade",
        },
      );
    }

    // Glowing Etched Dragon-Rune Decals on both faces of the main blade
    glow(
      b.decal(mainBladePart, BLADE_RUNE_TEX, {
        at: [s * 0.025, 1.62, 0.78],
        dir: [s, 0, 0],
        up: [0, 0.65, 0.76],
        size: [0.42, 0.21],
        roll: s > 0 ? -38 : 38,
        mirror: s < 0,
        bone: bladeMid,
        group: "blade",
        name: `bladeRuneDecal_${side}`,
      }),
      2.0,
    );
  }

  // Glowing Soul-Eye Gem embedded right through the heart of the blade mount
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.OctahedronGeometry(0.038, 0), SOUL_WHITE, {
        bone: bladeRoot,
        at: [s * 0.032, 1.85, 0.44],
        scale: [0.5, 1.0, 1.6],
        flat: true,
        group: "blade",
      }),
      2.2,
    );
  }

  // ============================================================================
  // 5. REAR COUNTER-BLADE, DORSAL RIB CAGE & HANGING SOUL CENSER (-Z Side)
  // ============================================================================

  // Rear Scythe Counter-Hook / Executioner Beak jutting out the back of the skull (-Z)
  const rearBeakOutline: OutlinePoint[] = [
    [-0.08, 1.94, "sharp"],
    [-0.32, 2.04],
    [-0.56, 1.96, "sharp"],
    [-0.44, 1.84, "sharp"],
    [-0.52, 1.72, "sharp"],
    [-0.28, 1.76],
    [-0.08, 1.80, "sharp"],
  ];
  b.extrude(rearBeakOutline, {
    at: [0, 0, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: [0.036, 0.008],
    bevel: 0.008,
    smoothing: 1,
    bone: dorsalCrest,
    color: BLADE_PAINT,
    group: "skull",
    name: "rearCounterBlade",
  });

  // Glowing Soul Edge on the Rear Counter-Blade
  glow(
    b.extrude(
      [
        [-0.28, 2.03, "sharp"],
        [-0.60, 1.95, "sharp"],
        [-0.46, 1.83, "sharp"],
        [-0.56, 1.68, "sharp"],
        [-0.30, 1.74, "sharp"],
      ],
      {
        at: [0, 0, 0],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: [0.012, 0.002],
        bevel: 0.003,
        bone: dorsalCrest,
        color: SOUL_BRIGHT,
        group: "skull",
        name: "rearCounterGlow",
      },
    ),
    1.7,
  );

  // Heavy Dragonbone Spine Arch over the Rear Counter-Blade
  b.sweep(
    bezier([0, 1.92, -0.06], [0, 2.04, -0.32], [0, 1.94, -0.58]),
    [0.048, 0.034, 0.006],
    {
      bone: dorsalCrest,
      section: { ngon: 6 },
      color: DRAGON_BONE,
      caps: { start: "round", end: "point" },
      group: "skull",
      name: "rearBoneSpine",
    },
  );

  // Hanging Bone-Link Chain & Soul-Lantern Censer suspended under the rear beak (-Z)
  for (let lk = 0; lk < 5; lk++) {
    const ly = 1.78 - lk * 0.062;
    b.part(new THREE.TorusGeometry(0.024, 0.007, 5, 8), GOLD_MID, {
      bone: censerChainTop,
      at: [0, ly, -0.34],
      rotation: [0, lk % 2 === 0 ? 0 : 90, 0],
      flat: true,
      group: "censer",
    });
  }

  // Ornate Censer Cage (dark iron & gold caps with glowing soul-crystal lantern inside)
  b.lathe(
    [
      [0, 0],
      [0.055, 0.02],
      [0.068, 0.045],
      [0.025, 0.07],
      [0, 0.08],
    ],
    {
      at: [0, 1.44, -0.34],
      segments: 6,
      color: GOLD_TRIM,
      bone: censerBody,
      group: "censer",
      name: "censerTopCap",
    },
  );
  b.lathe(
    [
      [0, -0.14],
      [0.018, -0.10],
      [0.062, -0.04],
      [0.048, 0.0],
      [0, 0.0],
    ],
    {
      at: [0, 1.32, -0.34],
      segments: 6,
      color: GOLD_TRIM,
      bone: censerBody,
      group: "censer",
      name: "censerBottomSpike",
    },
  );
  // Glowing Soul Crystal inside the Censer
  glow(
    b.part(new THREE.OctahedronGeometry(0.052, 1), SOUL_BRIGHT, {
      bone: censerBody,
      at: [0, 1.38, -0.34],
      scale: [0.9, 1.45, 0.9],
      flat: true,
      group: "censer",
      name: "censerSoulCore",
    }),
    2.2,
  );
  // 4 Bone Rib Bars caging the censer crystal
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2;
    const rx = Math.cos(a) * 0.056;
    const rz = Math.sin(a) * 0.056;
    b.sweep(
      bezier(
        [rx * 0.85, 1.46, -0.34 + rz * 0.85],
        [rx * 1.25, 1.38, -0.34 + rz * 1.25],
        [rx * 0.75, 1.30, -0.34 + rz * 0.75],
      ),
      0.01,
      {
        bone: censerBody,
        sides: 5,
        smooth: false,
        color: DRAGON_BONE,
        group: "censer",
      },
    );
  }

  // ============================================================================
  // 6. CAPTURED SOUL-CRYSTAL HEART & DRAGON RIB-CAGE LANTERN (Under the Throat)
  // ============================================================================
  // Nestled in the curve between the upper shaft, open dragon jaw, and inner scythe blade
  // sits a levitating, multi-faceted Soul Nexus caged by curved thoracic dragon ribs.

  // Thoracic Rib Cage (4 pairs of curved dragon ribs wrapping from the upper shaft around the soul core)
  for (const s of [1, -1]) {
    for (let r = 0; r < 4; r++) {
      const rt = r / 3;
      const yStart = 1.46 + rt * 0.24;
      const zStart = 0.03 + rt * 0.02;
      const ribSpread = 0.14 + Math.sin(rt * Math.PI) * 0.05;
      const zReach = 0.24 + Math.sin(rt * Math.PI) * 0.07;
      const ribPath = bezier(
        [s * 0.035, yStart, zStart],
        [s * ribSpread, yStart + 0.03, zStart + zReach * 0.55],
        [s * (ribSpread * 0.45), yStart - 0.04, zStart + zReach],
      );
      b.sweep(ribPath, [0.024, 0.017, 0.005], {
        bone: shaftUpper,
        section: { ngon: 5 },
        color: DRAGON_BONE,
        caps: { start: "round", end: "point" },
        group: "soul",
        name: `thoracicRib_${s > 0 ? "L" : "R"}_${r}`,
      });
    }
  }

  // Levitating Multi-Shard Soul-Crystal Heart at `soulCore` ([0, 1.62, 0.24])
  glow(
    b.part(new THREE.OctahedronGeometry(0.072, 0), SOUL_WHITE, {
      bone: soulCore,
      at: [0, 1.62, 0.24],
      scale: [0.75, 1.55, 0.75],
      flat: true,
      group: "soul",
      name: "soulHeartCenter",
    }),
    2.5,
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.095, 1), SOUL_TEAL, {
      bone: soulCore,
      at: [0, 1.62, 0.24],
      scale: [0.95, 1.35, 0.95],
      flat: true,
      group: "soul",
      name: "soulHeartShell",
    }),
    1.4,
  );

  // Orbiting Gold Runic Halo Rings around the Soul Heart
  for (const tilt of [28, -32]) {
    b.part(new THREE.TorusGeometry(0.115, 0.008, 6, 12), GOLD_BRIGHT, {
      bone: soulCore,
      at: [0, 1.62, 0.24],
      rotation: [tilt, 25, tilt * 0.6],
      flat: true,
      group: "soul",
    });
  }

  // 6 Satellite Soul-Shards orbiting the heart & feeding energy into the blade
  b.ring(
    frame([0, 1.62, 0.24], [0, 1, 0.25]),
    { count: 6, radius: 0.135, parent: soulCore, group: "soul" },
    (shard) => {
      glow(
        b.spike(
          shard.local([0, -0.035, 0]),
          shard.local([0, 0.045, 0]),
          null,
          0.018,
          {
            bone: soulCore,
            section: { ngon: 4 },
            color: shard.i % 2 === 0 ? SOUL_BRIGHT : SOUL_WHITE,
            group: "soul",
          },
        ),
        2.0,
      );
    },
  );

  // Spectral Energy Arcs leaping from the Soul Heart into the Dragon Jaw and Scythe Blade
  const arcTargets: Array<[number, number, number]> = [
    [0, 1.82, 0.38],
    [0, 1.68, 0.56],
    [0, 1.48, 0.74],
    [0, 1.18, 0.84],
  ];
  arcTargets.forEach((tgt, idx) => {
    const midPt = lerp([0, 1.62, 0.24], tgt, 0.5);
    midPt.x += (idx % 2 === 0 ? 1 : -1) * 0.035;
    midPt.y += 0.04;
    glow(
      b.sweep(bezier([0, 1.62, 0.24], midPt, tgt), [0.011, 0.005, 0.009], {
        bone: bladeMid,
        sides: 4,
        smooth: false,
        color: idx % 2 === 0 ? SOUL_BRIGHT : SOUL_WHITE,
        group: "soul",
        name: `soulEnergyArc_${idx}`,
      }),
      2.0,
    );
  });

  // ============================================================================
  // 7. SPECTRAL WISP CARDS & SHADOW-ISLES RUNES / BANNERS
  // ============================================================================

  // Tattered Spectral Banners hanging from the shaft head collar on left and right
  const bannerFrames = [
    frame([0.065, 1.72, -0.02], [0, 1, 0]),
    frame([-0.065, 1.72, -0.02], [0, 1, 0]),
  ];
  b.cards(bannerFrames, SOUL_RIBBON_TEX, {
    size: [0.14, 0.48],
    lean: 172,
    bend: 22,
    flow: [0, -0.2, -1],
    bone: shaftHead,
    group: "banners",
    name: "wraithBanners",
  });

  // Spectral Soul-Flame Cards curling off the blade spine, dragon horns, censer, and plinth
  const flameFrames = [
    // Along the outer blade spine
    frame([0, 2.01, 0.48], [0, 0.85, 0.5]),
    frame([0, 1.94, 0.76], [0, 0.65, 0.75]),
    frame([0, 1.72, 0.98], [0, 0.25, 0.96]),
    frame([0, 1.38, 1.06], [0, -0.2, 0.98]),
    frame([0, 0.98, 0.96], [0, -0.5, 0.86]),
    // Rising from the censer & skull crown
    frame([0, 1.44, -0.34], [0, 1, 0]),
    frame([0.18, 2.14, -0.26], [0.3, 0.9, -0.3]),
    frame([-0.18, 2.14, -0.26], [-0.3, 0.9, -0.3]),
    // Rising from the plinth soul-well
    frame([0.14, 0.18, 0.12], [0.2, 1, 0.2]),
    frame([-0.14, 0.18, 0.12], [-0.2, 1, 0.2]),
    frame([0, 0.18, -0.16], [0, 1, -0.2]),
  ];
  glow(
    b.cards(flameFrames, SOUL_FLAME_TEX, {
      size: [0.13, 0.28],
      lean: 18,
      bend: 28,
      cross: true,
      vary: 0.22,
      spin: 25,
      rng: rng(404),
      group: "soulFlames",
      name: "spectralFlameCards",
    }),
    1.8,
  );

  // ============================================================================
  // 8. HERO REST POSE ADJUSTMENTS (Dynamic League Weapon Silhouette)
  // ============================================================================
  // Subtle dramatic pose on jaw and censer so the silhouette reads immediately from
  // front, three-quarter, side, and top-down League camera angles.
  b.pose(dragonJaw, { axis: [1, 0, 0], deg: 12 });
  b.pose(censerChainTop, { axis: [1, 0, 0], deg: 6 });

  return b.root;
}
