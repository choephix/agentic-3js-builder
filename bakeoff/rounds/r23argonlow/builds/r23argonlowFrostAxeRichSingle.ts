import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { offset, rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { cells, countershade, gradient, grain, mix, mottle, noise, paint, smoothstep, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Frost-Forged Battle Axe",
  description:
    "A towering League of Legends Freljordian True Ice greataxe impaled into a rune-carved glacier plinth, featuring jagged crystalline crescent blades, ram-horned dark-iron housing, floating True Ice heart, braided leather grip, and hanging wolf-pelt totems.",
  style: "League of Legends",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "frostAxe", detail: 1, paintSize: 2048 });
  const rand = rng(4077);

  // ---------------------------------------------------------------------------
  // PALETTE & HAND-PAINTED LEAGUE OF LEGENDS SHADERS
  // ---------------------------------------------------------------------------
  // Flat colours for glowing emissives & crisp accents
  const GLOW_WHITE = "#e8fdff";
  const GLOW_CYAN = "#52f2ff";
  const GLOW_AQUA = "#19c8ff";
  const GLOW_DEEP = "#0a72c4";
  const IRON_DARK = "#121a28";
  const IRON_MID = "#223047";
  const IRON_RIM = "#4c668a";
  const BRONZE_DARK = "#594124";
  const BRONZE_MID = "#9e7742";
  const BRONZE_BRIGHT = "#deb571";
  const BONE_DARK = "#857a6b";
  const BONE_LIGHT = "#dcd3c2";
  const STONE_DARK = "#162130";

  // True Ice Blade Paint: deep sapphire core -> electric cyan mid -> crystalline white bevels & frost veins
  const trueIceBladePaint = paint((p, n, s) => {
    // s = [x, y] in outline coordinates: x is radial distance out from shaft (0.04..0.56), y is vertical (-0.42..0.46)
    const reach = smoothstep(0.06, 0.46, Math.abs(s[0]));
    const tipBoost = smoothstep(0.18, 0.42, Math.abs(s[1]));
    const edgeFactor = Math.min(1, reach * 0.78 + tipBoost * 0.35);

    const c1 = cells(p, 0.085, 11);
    const c2 = cells(p, 0.042, 29);
    const vein1 = smoothstep(0.09, 0.0, c1.d2 - c1.d1);
    const vein2 = smoothstep(0.07, 0.0, c2.d2 - c2.d1);
    const cloud = noise(p, 0.14, 7);

    // Side wall bevel vs flat face normal check (faces point along Z, bevel/edge walls point more along X/Y)
    const bevelHighlight = smoothstep(0.88, 0.35, Math.abs(n.z));
    const topLight = smoothstep(-0.4, 0.75, n.y * 0.7 + n.z * 0.3);

    let col = mix("#071d3b", "#0e477a", smoothstep(0.0, 0.55, edgeFactor));
    col = mix(col, "#1fa4d9", smoothstep(0.32, 0.82, edgeFactor + cloud * 0.22));
    col = mix(col, "#7ef4ff", smoothstep(0.68, 0.96, edgeFactor + bevelHighlight * 0.35));

    // Faceted crystal cell tint variation
    const facetTone = (c1.id - 0.5) * 0.18;
    col =
      facetTone > 0
        ? mix(col, "#9df8ff", facetTone)
        : mix(col, "#06152d", -facetTone);

    // Sharp glowing frost veins and rime edges
    col = mix(col, "#bdfbff", vein1 * 0.65 + vein2 * 0.35 * reach);
    col = mix(col, "#ffffff", smoothstep(0.82, 1.0, edgeFactor + bevelHighlight * 0.45) * 0.85);
    col = mix("#061326", col, 0.68 + 0.32 * topLight);
    return col;
  });

  // Glacier ice spire paint (for ground crystals and upper crown)
  const glacierIcePaint = paint((p, n) => {
    const h = smoothstep(0.0, 0.55, p.y);
    const c = cells(p, 0.09, 53);
    const crack = smoothstep(0.08, 0.0, c.d2 - c.d1);
    const rim = smoothstep(0.2, 0.85, n.y * 0.6 + Math.abs(n.x) * 0.4);
    let col = mix("#092242", "#176ca8", h * 0.7 + rim * 0.3);
    col = mix(col, "#5ce6ff", smoothstep(0.55, 0.95, h + rim * 0.35));
    col = mix(col, "#dffcff", crack * 0.65 + smoothstep(0.82, 1.0, h) * 0.5);
    return col;
  });

  // Dark Freljordian Forged Iron Paint (hand-painted bevels, frost-pitted dark steel)
  const forgedIronPaint = paint((p, n) => {
    const upLit = smoothstep(-0.6, 0.85, n.y * 0.75 + n.z * 0.35);
    const mott = noise(p, 0.07, 101);
    const c = cells(p, 0.055, 109);
    const pit = smoothstep(0.05, 0.0, c.d1);
    const frostRime = smoothstep(0.45, 0.92, n.y + (noise(p, 0.05, 113) - 0.5) * 0.5);

    let col = mix(IRON_DARK, IRON_MID, upLit * 0.75 + mott * 0.25);
    col = mix(col, IRON_RIM, smoothstep(0.65, 0.98, upLit + (1 - Math.abs(n.z)) * 0.25));
    col = mix(col, "#090d14", pit * 0.6);
    col = mix(col, "#8dd9f5", frostRime * 0.32);
    return col;
  });

  // Ancient Frosted Bronze / Nordic Gold Trim Paint
  const ancientBronzePaint = paint((p, n) => {
    const spec = smoothstep(-0.3, 0.85, n.y * 0.65 + Math.abs(n.x) * 0.35 + n.z * 0.25);
    const gr = noise(p, 0.045, 211);
    let col = mix(BRONZE_DARK, BRONZE_MID, smoothstep(0.1, 0.65, spec + gr * 0.2));
    col = mix(col, BRONZE_BRIGHT, smoothstep(0.62, 0.95, spec));
    col = mix(col, "#fff0c4", smoothstep(0.86, 1.0, spec) * 0.55);
    return col;
  });

  // Ironwood & Frost-bound Ash Haft Paint
  const ironwoodPaint = countershade(
    grain("#2b1d18", "#4a332a", { size: 0.018, axis: "y", seed: 301 }),
    grain("#1a110e", "#2e1f19", { size: 0.018, axis: "y", seed: 307 }),
    { level: 0, soft: 0.45 },
  );

  // Braided Ox-hide Leather Grip Paint (crisscross wrap bands)
  const leatherGripPaint = paint((p, n, s) => {
    const spiralA = Math.sin(p.y * 145 + s[1] * 0.07);
    const spiralB = Math.sin(p.y * 145 - s[1] * 0.07);
    const seam = smoothstep(-0.7, -0.95, Math.min(spiralA, spiralB));
    const wear = noise(p, 0.035, 401);
    const lit = smoothstep(-0.5, 0.7, n.z * 0.5 + n.y * 0.5);
    let col = mix("#2d1812", "#542e22", lit * 0.7 + wear * 0.3);
    col = mix(col, "#784736", smoothstep(0.65, 0.95, lit) * 0.5);
    col = mix(col, "#120906", seam * 0.8);
    return col;
  });

  // Carved Ram / Dragon Bone Horn Paint (ringed ridges along sweep t)
  const hornBonePaint = paint((p, n, s) => {
    const t = s[0];
    const ridge = 0.5 + 0.5 * Math.sin(t * 68);
    const baseDark = smoothstep(0.0, 0.35, t);
    const tipFrost = smoothstep(0.65, 1.0, t);
    const lit = smoothstep(-0.4, 0.8, n.y * 0.7 + n.z * 0.3);
    let col = mix("#3b342c", BONE_DARK, baseDark);
    col = mix(col, BONE_LIGHT, lit * 0.65 + ridge * 0.35);
    col = mix(col, "#241e19", (1 - ridge) * 0.45);
    col = mix(col, "#9beeff", tipFrost * 0.55);
    return col;
  });

  // Basalt & Snow Plinth Paint
  const plinthStonePaint = paint((p, n) => {
    const snowMask = smoothstep(0.28, 0.72, n.y + (noise(p, 0.08, 501) - 0.5) * 0.55);
    const stoneCell = cells(p, 0.11, 509);
    const crevice = smoothstep(0.08, 0.0, stoneCell.d2 - stoneCell.d1);
    const rockLit = smoothstep(-0.5, 0.8, n.y * 0.6 + n.z * 0.4);

    let rock = mix(STONE_DARK, "#28394f", rockLit * 0.7 + stoneCell.id * 0.3);
    rock = mix(rock, "#0b111a", crevice * 0.75);
    rock = mix(rock, "#3388b8", crevice * smoothstep(0.25, 0.02, p.y) * 0.65);

    const snow = mix("#b8dcf2", "#f2fbff", smoothstep(0.2, 0.9, n.y));
    return mix(rock, snow, snowMask);
  });

  // Wolf-pelt Fur Paint
  const wolfFurPaint = gradient(
    stripes("#cddfeb", "#546b82", { size: 0.032, axis: "y", wobble: 0.6, seed: 601 }),
    "#e9f6ff",
    [0, 1.05, 0],
    [0, 0.55, 0],
  );

  // ---------------------------------------------------------------------------
  // SVG TEXTURES (RUNES, FROST SIGILS, PELT & AURA CARDS)
  // ---------------------------------------------------------------------------
  const freljordRuneSvg = svg(
    `<svg viewBox="0 0 128 256">
      <g fill="none" stroke="#8ff8ff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M64 14 L64 242"/>
        <path d="M64 26 L30 62 L64 96 L98 62 Z"/>
        <path d="M24 108 L64 78 L104 108"/>
        <path d="M36 142 L64 118 L92 142 L64 168 Z"/>
        <path d="M26 184 L64 156 L102 184"/>
        <path d="M44 214 L64 196 L84 214"/>
      </g>
      <g fill="#ffffff">
        <polygon points="64,6 55,24 64,20 73,24"/>
        <polygon points="64,46 52,62 64,78 76,62"/>
        <polygon points="64,130 54,142 64,154 74,142"/>
        <circle cx="64" cy="196" r="5"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  const bladeFrostFiligreeSvg = svg(
    `<svg viewBox="0 0 256 256">
      <g fill="none" stroke="#bafbff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M28 128 Q90 120 154 64 L196 28"/>
        <path d="M28 128 Q90 136 154 192 L196 228"/>
        <path d="M52 128 L178 128"/>
        <path d="M108 102 L144 68 M108 154 L144 188"/>
        <path d="M84 128 L116 96 L152 128 L116 160 Z"/>
        <path d="M148 92 L192 78 M148 164 L192 178"/>
      </g>
      <g fill="#ffffff">
        <polygon points="40,128 68,116 62,128 68,140"/>
        <polygon points="116,112 134,128 116,144 98,128"/>
        <polygon points="184,128 158,118 164,128 158,138"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  const frostTuftSvg = svg(
    `<svg viewBox="0 0 64 128">
      <polygon points="32,4 12,48 18,124 32,112 46,124 52,48" fill="#88eeff"/>
      <polygon points="32,12 22,52 26,114 32,104 38,114 42,52" fill="#e6fcff"/>
    </svg>`,
    { size: 256 },
  );

  const furCardSvg = svg(
    `<svg viewBox="0 0 64 128">
      <path d="M12 124 Q8 64 20 14 L32 42 L40 6 L48 48 L56 18 Q56 72 50 124 Z" fill="#9ab4c9"/>
      <path d="M20 120 Q18 70 24 28 L32 52 L39 18 L44 56 L50 32 Q48 76 44 120 Z" fill="#e2f2fc"/>
    </svg>`,
    { size: 256 },
  );

  const groundSigilSvg = svg(
    `<svg viewBox="0 0 256 256">
      <g fill="none" stroke="#3be8ff" stroke-width="5">
        <circle cx="128" cy="128" r="112"/>
        <circle cx="128" cy="128" r="88"/>
        <polygon points="128,12 158,98 244,128 158,158 128,244 98,158 12,128 98,98"/>
        <polygon points="46,46 128,82 210,46 174,128 210,210 128,174 46,210 82,128"/>
      </g>
      <circle cx="128" cy="128" r="24" fill="#bffbff"/>
    </svg>`,
    { size: 512 },
  );

  // ---------------------------------------------------------------------------
  // SKELETON & RIG HIERARCHY (Full articulated hero weapon + floating/hinge parts)
  // ---------------------------------------------------------------------------
  // The battle axe stands 1.92m tall, driven deep into a fractured Freljordian glacier plinth at y = 0.
  const plinthRoot = b.joint("plinthRoot", {
    at: [0, 0.08, 0],
    dir: [0, 1, 0],
    group: "plinth",
    role: "spine",
  });

  // Weapon shaft chain from buried pommel up through the grip, collar, and axe head core to the crown spire
  const haftChain = b.chain(
    "haft",
    [
      [0, 0.24, 0.02],
      [0, 0.62, 0.01],
      [0, 1.02, 0.0],
      [0, 1.36, 0.0],
      [0, 1.66, 0.0],
    ],
    {
      parent: plinthRoot,
      names: ["pommelJoint", "lowerGripJoint", "upperGripJoint", "axeHeadJoint"],
      group: "haft",
      role: "spine",
    },
  );
  const pommelJoint = haftChain.joints[0];
  const lowerGripJoint = haftChain.joints[1];
  const upperGripJoint = haftChain.joints[2];
  const axeHeadJoint = haftChain.joints[3];

  const crownJoint = b.joint("crownJoint", {
    parent: axeHeadJoint,
    at: [0, 1.66, 0],
    dir: [0, 1, 0],
    group: "crown",
    role: "head",
  });

  // Floating magical True Ice furnace core suspended inside the open head cage
  const coreOrbJoint = b.joint("coreOrbJoint", {
    parent: axeHeadJoint,
    at: [0, 1.37, 0],
    dir: [0, 0, 1],
    group: "core",
    role: "hinge",
  });

  // Left and Right Massive Crescent Blades (+X and -X)
  const bladeWingL = b.joint("bladeWingL", {
    parent: axeHeadJoint,
    at: [0.09, 1.37, 0],
    dir: [1, 0, 0],
    up: [0, 1, 0],
    group: "bladeL",
    role: "wing",
  });
  const bladeWingR = b.joint("bladeWingR", {
    parent: axeHeadJoint,
    at: [-0.09, 1.37, 0],
    dir: [-1, 0, 0],
    up: [0, 1, 0],
    group: "bladeR",
    role: "wing",
  });

  // Articulated hanging Freljord wolf-tail & rune-stone totems from the lower cheek mounts
  const talismanChainL = b.chain(
    "talismanL",
    catmull([
      [0.14, 1.12, 0.04],
      [0.18, 0.96, 0.05],
      [0.2, 0.79, 0.04],
      [0.19, 0.63, 0.02],
    ]),
    {
      parent: upperGripJoint,
      names: ["talismanL1", "talismanL2", "talismanL3"],
      group: "talismanL",
      role: "tail",
    },
  );

  const talismanChainR = b.chain(
    "talismanR",
    catmull([
      [-0.14, 1.12, -0.04],
      [-0.18, 0.96, -0.05],
      [-0.2, 0.79, -0.04],
      [-0.19, 0.63, -0.02],
    ]),
    {
      parent: upperGripJoint,
      names: ["talismanR1", "talismanR2", "talismanR3"],
      group: "talismanR",
      role: "tail",
    },
  );

  // Pommel hanging frost-chain pendulum
  const pommelChain = b.chain(
    "pommelTassel",
    [
      [0, 0.23, 0.06],
      [0, 0.14, 0.11],
      [0, 0.05, 0.15],
    ],
    {
      parent: pommelJoint,
      names: ["pommelLink1", "pommelLink2"],
      group: "pommel",
      role: "hinge",
    },
  );

  // ---------------------------------------------------------------------------
  // 1. FRACTURED GLACIER & RUNE-STONE DISPLAY PLINTH (y = 0.00 to 0.42)
  // ---------------------------------------------------------------------------
  // Main tiered octagonal basalt-and-ice pedestal resting flat at y = 0
  const baseSlabOutline: OutlinePoint[] = [
    [0.0, 0.0, "sharp"],
    [0.54, 0.0, "sharp"],
    [0.51, 0.07, "sharp"],
    [0.44, 0.11, "sharp"],
    [0.39, 0.19, "sharp"],
    [0.28, 0.25, "sharp"],
    [0.0, 0.27, "sharp"],
  ];
  const mainPlinth = b.lathe(baseSlabOutline, {
    at: [0, 0, 0],
    axis: [0, 1, 0],
    segments: 8,
    spin: 22.5,
    color: plinthStonePaint,
    bone: plinthRoot,
    group: "plinth",
    name: "plinthMain",
  });

  // Glowing arcane frost sigil inlaid into the top of the plinth
  glow(
    b.part(new THREE.CircleGeometry(0.36, 16), "#ffffff", {
      bone: plinthRoot,
      at: [0, 0.265, 0],
      dir: [0, 1, 0],
      up: [0, 0, 1],
      axis: "z",
      texture: groundSigilSvg,
      group: "plinth",
      name: "plinthRuneSigil",
    }),
    1.4,
  );

  // Outer stepped stone slabs & cracked basalt blocks around the plinth perimeter
  const outerBlockAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  outerBlockAngles.forEach((deg, idx) => {
    const rad = (deg * Math.PI) / 180;
    const dist = 0.43 + (idx % 2) * 0.05;
    const bx = Math.sin(rad) * dist;
    const bz = Math.cos(rad) * dist;
    const bh = 0.09 + (idx % 3) * 0.035;
    const bw = 0.16 + (idx % 2) * 0.04;
    b.frustumBox(
      [bx, 0, bz],
      [bx * 0.94, bh, bz * 0.94],
      [bw, bw * 0.85],
      [bw * 0.82, bw * 0.7],
      {
        color: plinthStonePaint,
        bone: plinthRoot,
        group: "plinth",
        name: `plinthBlock_${idx}`,
      },
    );

    // Glowing ice fissure vein between blocks
    const seamR = dist - 0.08;
    glow(
      b.rod(
        [Math.sin(rad) * 0.16, 0.255, Math.cos(rad) * 0.16],
        [Math.sin(rad) * seamR, 0.11, Math.cos(rad) * seamR],
        [0.014, 0.006],
        {
          section: { ngon: 4 },
          color: idx % 2 === 0 ? GLOW_CYAN : GLOW_AQUA,
          bone: plinthRoot,
          group: "plinth",
          name: `fissureVein_${idx}`,
        },
      ),
      1.3,
    );
  });

  // Ring of erupting True Ice crystal shards bursting out of the plinth around the impaled axe
  const crystalRingSpecs = [
    { x: 0.27, z: 0.22, tx: 0.42, ty: 0.56, tz: 0.34, r: 0.068, glow: false },
    { x: -0.28, z: 0.21, tx: -0.44, ty: 0.52, tz: 0.32, r: 0.064, glow: false },
    { x: 0.31, z: -0.19, tx: 0.49, ty: 0.62, tz: -0.29, r: 0.074, glow: false },
    { x: -0.3, z: -0.2, tx: -0.47, ty: 0.59, tz: -0.31, r: 0.072, glow: false },
    { x: 0.16, z: 0.31, tx: 0.22, ty: 0.44, tz: 0.45, r: 0.048, glow: true },
    { x: -0.17, z: 0.3, tx: -0.24, ty: 0.42, tz: 0.44, r: 0.046, glow: true },
    { x: 0.18, z: -0.31, tx: 0.26, ty: 0.48, tz: -0.46, r: 0.052, glow: true },
    { x: -0.18, z: -0.3, tx: -0.25, ty: 0.46, tz: -0.45, r: 0.05, glow: true },
    { x: 0.38, z: 0.02, tx: 0.56, ty: 0.41, tz: 0.04, r: 0.056, glow: false },
    { x: -0.38, z: -0.02, tx: -0.55, ty: 0.39, tz: -0.03, r: 0.055, glow: false },
    { x: 0.0, z: -0.36, tx: 0.0, ty: 0.54, tz: -0.52, r: 0.065, glow: false },
    { x: 0.09, z: 0.21, tx: 0.14, ty: 0.37, tz: 0.31, r: 0.038, glow: true },
  ];

  crystalRingSpecs.forEach((c, idx) => {
    const shard = b.spike([c.x, 0.06, c.z], [c.tx, c.ty, c.tz], null, c.r, {
      section: { ngon: 6 },
      color: c.glow ? GLOW_CYAN : glacierIcePaint,
      bone: plinthRoot,
      group: "plinthCrystals",
      name: `glacierShard_${idx}`,
    });
    if (c.glow) glow(shard, 1.35);

    // Secondary mini crystal cluster at shard base
    const sideShard = b.spike(
      [c.x * 1.08, 0.04, c.z * 1.08],
      [c.tx * 1.12, c.ty * 0.58, c.tz * 1.12],
      null,
      c.r * 0.58,
      {
        section: { ngon: 5 },
        color: idx % 2 === 0 ? GLOW_AQUA : glacierIcePaint,
        bone: plinthRoot,
        group: "plinthCrystals",
        name: `glacierSubShard_${idx}`,
      },
    );
    if (idx % 2 === 0) glow(sideShard, 1.15);
  });

  // ---------------------------------------------------------------------------
  // 2. POMMEL & LOWER HAFT (y = 0.18 to 1.12)
  // ---------------------------------------------------------------------------
  // Heavy Freljordian claw-caged True Ice pommel at bottom of shaft (y = 0.16..0.34)
  b.lathe(
    [
      [0.0, 0.0, "sharp"],
      [0.068, 0.02, "sharp"],
      [0.052, 0.06],
      [0.074, 0.1, "sharp"],
      [0.048, 0.15, "sharp"],
      [0.0, 0.17, "sharp"],
    ],
    {
      at: [0, 0.22, 0.02],
      axis: [0, 1, 0],
      segments: 8,
      color: forgedIronPaint,
      bone: pommelJoint,
      group: "pommel",
      name: "pommelHousing",
    },
  );

  // Glowing True Ice pommel heart crystal
  glow(
    b.spike([0, 0.25, 0.02], [0, 0.11, 0.03], null, 0.048, {
      section: { ngon: 6 },
      color: GLOW_CYAN,
      bone: pommelJoint,
      group: "pommel",
      name: "pommelIceSpike",
    }),
    1.5,
  );

  // 4 Forged iron claw talons gripping the pommel crystal
  for (const [idx, [dx, dz]] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ].entries()) {
    b.sweep(
      bezier(
        [dx * 0.055, 0.31, 0.02 + dz * 0.055],
        [dx * 0.085, 0.22, 0.02 + dz * 0.085],
        [dx * 0.028, 0.14, 0.025 + dz * 0.028],
      ),
      [0.02, 0.004],
      {
        section: { ngon: 5 },
        caps: { start: "flat", end: "point" },
        color: idx % 2 === 0 ? ancientBronzePaint : forgedIronPaint,
        bone: pommelJoint,
        group: "pommel",
        name: `pommelClaw_${idx}`,
      },
    );
  }

  // Hanging frost-chain links & ice prism on pommelChain
  b.sweep(pommelChain, [0.016, 0.012], {
    section: { ngon: 6 },
    color: ancientBronzePaint,
    group: "pommel",
    name: "pommelChainTube",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.038, 0), GLOW_WHITE, {
      bone: pommelChain.joints[1],
      at: [0, 0.05, 0.15],
      scale: [0.8, 1.35, 0.8],
      flat: true,
      group: "pommel",
      name: "pommelPendantGem",
    }),
    1.6,
  );

  // Main Structural Haft Sweep: octagonal reinforced ironwood & dark steel core
  b.sweep(
    haftChain,
    (t) => {
      if (t < 0.15) return [0.044, 0.054];
      if (t < 0.55) return [0.034, 0.046]; // elliptical grip (wider front-to-back for blade alignment)
      if (t < 0.78) return [0.048, 0.064]; // flared neck collar
      return [0.056, 0.076]; // heavy axe-head socket
    },
    {
      section: { ngon: 8 },
      color: ironwoodPaint,
      group: "haft",
      name: "haftCoreShaft",
    },
  );

  // Braided Leather Grip Sleeve over lower and middle haft
  const gripSweep = b.rod([0, 0.38, 0.016], [0, 0.96, 0.002], [0.039, 0.043], {
    sides: 10,
    color: leatherGripPaint,
    bone: lowerGripJoint,
    group: "haft",
    name: "leatherGripWrap",
  });

  // 5 Ornate Bronze & Forged Iron Grip Rings dividing the leather sections
  const gripRingHeights = [0.38, 0.52, 0.67, 0.82, 0.96];
  gripRingHeights.forEach((ry, idx) => {
    const rz = 0.016 * (1 - (ry - 0.38) / 0.58);
    b.lathe(
      [
        [0.034, -0.018, "sharp"],
        [0.054, -0.012, "sharp"],
        [0.058, 0.0, "sharp"],
        [0.054, 0.012, "sharp"],
        [0.034, 0.018, "sharp"],
      ],
      {
        at: [0, ry, rz],
        axis: [0, 1, 0],
        segments: 8,
        color: idx % 2 === 0 ? ancientBronzePaint : forgedIronPaint,
        bone: idx < 2 ? pommelJoint : lowerGripJoint,
        group: "haft",
        name: `gripBandRing_${idx}`,
      },
    );

    // Glowing cyan rune notches set into the front/back of each grip ring
    for (const sz of [1, -1]) {
      glow(
        b.part(new THREE.OctahedronGeometry(0.011, 0), GLOW_CYAN, {
          bone: idx < 2 ? pommelJoint : lowerGripJoint,
          at: [0, ry, rz + sz * 0.054],
          scale: [0.8, 1.4, 0.5],
          flat: true,
          group: "haft",
          name: `gripRingGem_${idx}_${sz > 0 ? "F" : "B"}`,
        }),
        1.4,
      );
    }
  });

  // Side Forged-Iron Langets (reinforcing straps running up the haft from grip to head)
  for (const sx of [1, -1]) {
    const sideTag = sx > 0 ? "L" : "R";
    b.frustumBox(
      [sx * 0.041, 0.84, 0.0],
      [sx * 0.062, 1.24, 0.0],
      [0.018, 0.048],
      [0.026, 0.078],
      {
        color: forgedIronPaint,
        bone: upperGripJoint,
        group: "haft",
        name: `haftLanget_${sideTag}`,
      },
    );

    // Heavy pyramidal rivets along each langet
    for (let k = 0; k < 4; k++) {
      const ry = 0.89 + k * 0.095;
      const rx = sx * (0.048 + k * 0.005);
      b.spike([rx, ry, 0], [sx, 0, 0], 0.022, 0.012, {
        section: { ngon: 4 },
        color: ancientBronzePaint,
        bone: upperGripJoint,
        group: "haft",
        name: `langetRivet_${sideTag}_${k}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 3. FRELJORD RAM-HORN GUARD & NECK COLLAR (y = 1.02 to 1.24)
  // ---------------------------------------------------------------------------
  // Chunky Nordic Guard Block where the shaft transitions into the massive head
  b.lathe(
    [
      [0.0, -0.06, "sharp"],
      [0.088, -0.05, "sharp"],
      [0.115, -0.01, "sharp"],
      [0.095, 0.04, "sharp"],
      [0.128, 0.09, "sharp"],
      [0.0, 0.11, "sharp"],
    ],
    {
      at: [0, 1.12, 0],
      axis: [0, 1, 0],
      segments: 8,
      spin: 22.5,
      color: forgedIronPaint,
      bone: upperGripJoint,
      group: "neckCollar",
      name: "neckGuardCollar",
    },
  );

  // Bronze chevron trim plates on front and back of the neck collar
  for (const sz of [1, -1]) {
    const chevOutline: OutlinePoint[] = [
      [-0.085, 0.04, "sharp"],
      [0.0, -0.055, "sharp"],
      [0.085, 0.04, "sharp"],
      [0.065, 0.085, "sharp"],
      [0.0, 0.01, "sharp"],
      [-0.065, 0.085, "sharp"],
    ];
    b.extrude(chevOutline, {
      at: [0, 1.12, sz * 0.088],
      x: [sz, 0, 0],
      y: [0, 1, 0],
      thickness: 0.024,
      bevel: 0.005,
      color: ancientBronzePaint,
      bone: upperGripJoint,
      group: "neckCollar",
      name: `collarChevron_${sz > 0 ? "F" : "B"}`,
    });
  }

  // Curved Carved Bone Ram/Drake Horns sweeping out and curling under the lower blade beards
  for (const sx of [1, -1]) {
    const sideTag = sx > 0 ? "L" : "R";
    const hornCurve = catmull([
      [sx * 0.07, 1.14, 0.0],
      [sx * 0.16, 1.07, 0.03],
      [sx * 0.24, 0.97, 0.05],
      [sx * 0.22, 0.86, 0.02],
      [sx * 0.15, 0.83, -0.03],
    ]);
    b.sweep(hornCurve, [0.044, 0.034, 0.022, 0.006], {
      section: { ngon: 7 },
      caps: { start: "flat", end: "point" },
      color: hornBonePaint,
      bone: upperGripJoint,
      group: "neckCollar",
      name: `collarRamHorn_${sideTag}`,
    });

    // Bronze cuff ring at horn root
    b.rod([sx * 0.065, 1.14, 0], [sx * 0.11, 1.11, 0.012], [0.049, 0.046], {
      section: { ngon: 8 },
      color: ancientBronzePaint,
      bone: upperGripJoint,
      group: "neckCollar",
      name: `hornRootCuff_${sideTag}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 4. HANGING WOLF-PELT TALISMANS & RUNE TOTEMS
  // ---------------------------------------------------------------------------
  for (const [sIdx, chain] of [
    [1, talismanChainL],
    [-1, talismanChainR],
  ] as const) {
    const sideTag = sIdx > 0 ? "L" : "R";
    // Braided leather cord & frost-fur tail volume
    const tailSweep = b.sweep(chain, [0.022, 0.038, 0.045, 0.014], {
      sides: 8,
      color: wolfFurPaint,
      group: `talisman${sideTag}`,
      name: `wolfTailPelt_${sideTag}`,
    });

    // Bronze cap & glowing rune bead at top of talisman
    b.rod(chain.at(0).at, chain.at(0.16).at, [0.028, 0.032], {
      section: { ngon: 6 },
      color: ancientBronzePaint,
      bone: chain.joints[0],
      group: `talisman${sideTag}`,
      name: `talismanCap_${sideTag}`,
    });
    glow(
      b.part(new THREE.OctahedronGeometry(0.024, 0), GLOW_CYAN, {
        bone: chain.joints[1],
        at: chain.at(0.38).at,
        flat: true,
        group: `talisman${sideTag}`,
        name: `talismanRuneBead_${sideTag}`,
      }),
      1.4,
    );

    // Layered fur cards on the wolf-tail pelt for silhouette breakup
    const peltFrames = b.along(tailSweep, 6);
    b.cards(peltFrames, furCardSvg, {
      size: [0.055, 0.095],
      lean: 72,
      bend: 25,
      cross: true,
      vary: 0.2,
      rng: rand,
      group: `talisman${sideTag}`,
      name: `talismanFurCards_${sideTag}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 5. AXE HEAD CENTRAL HOUSING & FLOATING TRUE ICE HEART (y = 1.18 to 1.64)
  // ---------------------------------------------------------------------------
  // Heavy armoured cheek frames on Front (+Z) and Back (-Z) that leave an open central furnace window
  const cheekFrameOutline: OutlinePoint[] = [
    [-0.13, -0.19, "sharp"],
    [0.0, -0.24, "sharp"],
    [0.13, -0.19, "sharp"],
    [0.18, -0.06, "sharp"],
    [0.15, 0.0, "sharp"],
    [0.19, 0.08, "sharp"],
    [0.13, 0.21, "sharp"],
    [0.0, 0.26, "sharp"],
    [-0.13, 0.21, "sharp"],
    [-0.19, 0.08, "sharp"],
    [-0.15, 0.0, "sharp"],
    [-0.18, -0.06, "sharp"],
  ];

  for (const sz of [1, -1]) {
    const faceTag = sz > 0 ? "Front" : "Back";
    // Upper and lower armored bridge arches framing the central core window
    const upperArchOutline: OutlinePoint[] = [
      [-0.15, 0.05, "sharp"],
      [-0.08, 0.1, "sharp"],
      [0.0, 0.12, "sharp"],
      [0.08, 0.1, "sharp"],
      [0.15, 0.05, "sharp"],
      [0.12, 0.21, "sharp"],
      [0.0, 0.26, "sharp"],
      [-0.12, 0.21, "sharp"],
    ];
    b.extrude(upperArchOutline, {
      at: [0, 1.37, sz * 0.058],
      x: [sz, 0, 0],
      y: [0, 1, 0],
      thickness: 0.036,
      bevel: 0.008,
      color: forgedIronPaint,
      bone: axeHeadJoint,
      group: "headHousing",
      name: `housingUpperArch_${faceTag}`,
    });

    const lowerArchOutline: OutlinePoint[] = [
      [-0.15, -0.05, "sharp"],
      [-0.08, -0.1, "sharp"],
      [0.0, -0.12, "sharp"],
      [0.08, -0.1, "sharp"],
      [0.15, -0.05, "sharp"],
      [0.12, -0.19, "sharp"],
      [0.0, -0.24, "sharp"],
      [-0.12, -0.19, "sharp"],
    ];
    b.extrude(lowerArchOutline, {
      at: [0, 1.37, sz * 0.058],
      x: [sz, 0, 0],
      y: [0, 1, 0],
      thickness: 0.036,
      bevel: 0.008,
      color: forgedIronPaint,
      bone: axeHeadJoint,
      group: "headHousing",
      name: `housingLowerArch_${faceTag}`,
    });

    // Raised Ancient Bronze Nordic Rune Trim on upper and lower arches
    const trimArchOutline: OutlinePoint[] = [
      [-0.11, 0.11, "sharp"],
      [0.0, 0.16, "sharp"],
      [0.11, 0.11, "sharp"],
      [0.08, 0.19, "sharp"],
      [0.0, 0.23, "sharp"],
      [-0.08, 0.19, "sharp"],
    ];
    b.extrude(trimArchOutline, {
      at: [0, 1.37, sz * 0.078],
      x: [sz, 0, 0],
      y: [0, 1, 0],
      thickness: 0.014,
      bevel: 0.004,
      color: ancientBronzePaint,
      bone: axeHeadJoint,
      group: "headHousing",
      name: `housingUpperBronze_${faceTag}`,
    });

    b.extrude(
      trimArchOutline.map(([x, y]) => [x, -y, "sharp"] as OutlinePoint).reverse(),
      {
        at: [0, 1.37, sz * 0.078],
        x: [sz, 0, 0],
        y: [0, 1, 0],
        thickness: 0.014,
        bevel: 0.004,
        color: ancientBronzePaint,
        bone: axeHeadJoint,
        group: "headHousing",
        name: `housingLowerBronze_${faceTag}`,
      },
    );

    // 4 Inward-pointing Forged Iron Fang Claws gripping toward the floating True Ice Heart
    for (const sx of [1, -1]) {
      for (const sy of [1, -1]) {
        b.spike(
          [sx * 0.105, 1.37 + sy * 0.095, sz * 0.062],
          [sx * 0.042, 1.37 + sy * 0.038, sz * 0.035],
          null,
          0.022,
          {
            section: { ngon: 4 },
            color: ancientBronzePaint,
            bone: axeHeadJoint,
            group: "headHousing",
            name: `coreClaw_${faceTag}_${sx > 0 ? "L" : "R"}${sy > 0 ? "U" : "D"}`,
          },
        );
      }
    }

    // Glowing Freljordian Rune Decal Plate on each side of the upper housing
    glow(
      b.part(new THREE.PlaneGeometry(0.09, 0.17), "#ffffff", {
        bone: axeHeadJoint,
        at: [0, 1.37, sz * 0.088],
        dir: [0, 0, sz],
        up: [0, 1, 0],
        axis: "z",
        texture: freljordRuneSvg,
        group: "headHousing",
        name: `centralRuneSigil_${faceTag}`,
      }),
      1.6,
    );
  }

  // Floating True Ice Heart Crystal & Orbiting Runic Shards (on coreOrbJoint)
  glow(
    b.part(new THREE.OctahedronGeometry(0.072, 1), GLOW_WHITE, {
      bone: coreOrbJoint,
      at: [0, 1.37, 0],
      scale: [0.85, 1.28, 0.72],
      flat: true,
      group: "core",
      name: "trueIceHeartCore",
    }),
    2.0,
  );

  // Outer translucent-look cage of glowing cyan energy bars around the heart
  b.ring(
    frame([0, 1.37, 0], [0, 0, 1]),
    { count: 8, radius: 0.088, group: "core", role: "fan" },
    (item) => {
      glow(
        b.spike(item, offset(item.at, item.outward, 0.038), null, 0.014, {
          section: { ngon: 4 },
          color: item.i % 2 === 0 ? GLOW_CYAN : GLOW_AQUA,
          bone: coreOrbJoint,
          group: "core",
          name: `heartHaloSpike_${item.i}`,
        }),
        1.5,
      );
    },
  );

  // ---------------------------------------------------------------------------
  // 6. MASSIVE DOUBLE CRESCENT TRUE-ICE BLADES (Left +X and Right -X)
  // ---------------------------------------------------------------------------
  // Primary outer razor blade outline (local X = distance out from shaft, local Y = vertical span)
  // Spans X = 0.06 to 0.56 m out from centerline (total wingspan = 1.12 m!), Y = -0.44 to +0.46 m (0.90 m blade height!)
  const mainIceBladeOutline: OutlinePoint[] = [
    [0.06, -0.14, "sharp"],
    [0.15, -0.2, "sharp"],
    [0.24, -0.34, "sharp"],
    [0.19, -0.44, "sharp"], // lower hooked beard inner barb
    [0.33, -0.39, "sharp"],
    [0.45, -0.26, "sharp"], // lower crescent point
    [0.41, -0.17, "sharp"], // lower-mid jagged notch
    [0.52, -0.09, "sharp"],
    [0.56, 0.02, "sharp"], // widest forward cleaving belly
    [0.49, 0.11, "sharp"], // upper-mid jagged notch
    [0.55, 0.22, "sharp"],
    [0.46, 0.37, "sharp"],
    [0.32, 0.46, "sharp"], // sweeping upper horn tip
    [0.24, 0.36, "sharp"], // upper inner barb
    [0.29, 0.24, "sharp"],
    [0.17, 0.16, "sharp"],
    [0.06, 0.14, "sharp"],
    [0.11, 0.0, "sharp"],
  ];

  // Secondary stepped crystalline bevel tier (adds thick 3D faceted step inside the blade)
  const midCrystalFacetOutline: OutlinePoint[] = [
    [0.07, -0.12, "sharp"],
    [0.18, -0.17, "sharp"],
    [0.27, -0.29, "sharp"],
    [0.37, -0.22, "sharp"],
    [0.34, -0.12, "sharp"],
    [0.43, -0.05, "sharp"],
    [0.45, 0.02, "sharp"],
    [0.39, 0.1, "sharp"],
    [0.43, 0.19, "sharp"],
    [0.35, 0.32, "sharp"],
    [0.24, 0.24, "sharp"],
    [0.16, 0.14, "sharp"],
    [0.07, 0.12, "sharp"],
  ];

  // Heavy Dark-Iron Armored Spine Bolster locking the ice blade into the central socket
  const ironBolsterOutline: OutlinePoint[] = [
    [0.04, -0.15, "sharp"],
    [0.16, -0.18, "sharp"],
    [0.23, -0.25, "sharp"],
    [0.19, -0.11, "sharp"],
    [0.28, -0.04, "sharp"],
    [0.24, 0.02, "sharp"],
    [0.29, 0.09, "sharp"],
    [0.2, 0.15, "sharp"],
    [0.24, 0.25, "sharp"],
    [0.15, 0.19, "sharp"],
    [0.04, 0.15, "sharp"],
  ];

  for (const [sx, wingBone] of [
    [1, bladeWingL],
    [-1, bladeWingR],
  ] as const) {
    const sideTag = sx > 0 ? "L" : "R";

    // 1. Main True Ice Crescent Blade Slab (tapered thickness from 6.4cm at root to 1.4cm at tip)
    b.extrude(mainIceBladeOutline, {
      at: [0, 1.37, 0],
      x: [sx, 0, 0],
      y: [0, 1, 0],
      thickness: [0.062, 0.016],
      bevel: 0.007,
      color: trueIceBladePaint,
      bone: wingBone,
      group: `blade${sideTag}`,
      name: `trueIceBladeMain_${sideTag}`,
    });

    // 2. Stepped Crystalline Mid-Bevel Layer (gives distinct League of Legends chunky multi-tiered facet depth)
    b.extrude(midCrystalFacetOutline, {
      at: [0, 1.37, 0],
      x: [sx, 0, 0],
      y: [0, 1, 0],
      thickness: [0.082, 0.036],
      bevel: 0.009,
      color: trueIceBladePaint,
      bone: wingBone,
      group: `blade${sideTag}`,
      name: `trueIceBladeStep_${sideTag}`,
    });

    // 3. Dark-Iron Jagged Spine Bolster Plate
    b.extrude(ironBolsterOutline, {
      at: [0, 1.37, 0],
      x: [sx, 0, 0],
      y: [0, 1, 0],
      thickness: 0.104,
      bevel: 0.01,
      color: forgedIronPaint,
      bone: wingBone,
      group: `blade${sideTag}`,
      name: `bladeIronBolster_${sideTag}`,
    });

    // 4. Bronze Filigree Rib Clamps over the Iron Bolster
    for (const sy of [1, -1]) {
      b.rod(
        [sx * 0.07, 1.37 + sy * 0.08, 0],
        [sx * 0.25, 1.37 + sy * 0.22, 0],
        [0.026, 0.012],
        {
          section: { ngon: 4 },
          color: ancientBronzePaint,
          bone: wingBone,
          group: `blade${sideTag}`,
          name: `bolsterBronzeRib_${sideTag}_${sy > 0 ? "U" : "D"}`,
        },
      );
    }

    // 5. Glowing Frost-Vein Channels recessed into both faces of the blade
    for (const sz of [1, -1]) {
      const fTag = sz > 0 ? "F" : "B";
      // Upper glowing frost vein
      const upperVein = bezier(
        [sx * 0.14, 1.41, sz * 0.038],
        [sx * 0.31, 1.48, sz * 0.028],
        [sx * 0.44, 1.66, sz * 0.016],
      );
      glow(
        b.sweep(upperVein, [0.013, 0.004], {
          section: { ngon: 4 },
          caps: { start: "round", end: "point" },
          color: GLOW_CYAN,
          bone: wingBone,
          group: `blade${sideTag}`,
          name: `bladeUpperVein_${sideTag}_${fTag}`,
        }),
        1.5,
      );

      // Middle cleaving frost vein
      const midVein = bezier(
        [sx * 0.16, 1.37, sz * 0.04],
        [sx * 0.36, 1.37, sz * 0.028],
        [sx * 0.51, 1.39, sz * 0.014],
      );
      glow(
        b.sweep(midVein, [0.014, 0.004], {
          section: { ngon: 4 },
          caps: { start: "round", end: "point" },
          color: GLOW_WHITE,
          bone: wingBone,
          group: `blade${sideTag}`,
          name: `bladeMidVein_${sideTag}_${fTag}`,
        }),
        1.7,
      );

      // Lower beard frost vein
      const lowerVein = bezier(
        [sx * 0.14, 1.32, sz * 0.038],
        [sx * 0.29, 1.24, sz * 0.028],
        [sx * 0.41, 1.13, sz * 0.015],
      );
      glow(
        b.sweep(lowerVein, [0.013, 0.004], {
          section: { ngon: 4 },
          caps: { start: "round", end: "point" },
          color: GLOW_CYAN,
          bone: wingBone,
          group: `blade${sideTag}`,
          name: `bladeLowerVein_${sideTag}_${fTag}`,
        }),
        1.5,
      );

      // Glowing Frost Filigree SVG Rune Etching on the broad crystal face
      glow(
        b.part(new THREE.PlaneGeometry(0.28, 0.34), "#ffffff", {
          bone: wingBone,
          at: [sx * 0.31, 1.37, sz * 0.036],
          dir: [sx * 0.12, 0, sz],
          up: [0, 1, 0],
          axis: "z",
          texture: bladeFrostFiligreeSvg,
          group: `blade${sideTag}`,
          name: `bladeFiligreeEtch_${sideTag}_${fTag}`,
        }),
        1.35,
      );

      // Heavy Bronze Rivet Studs along the iron bolster cheek
      for (const [rIdx, [rx, ry]] of [
        [0.11, 1.48],
        [0.18, 1.37],
        [0.11, 1.26],
      ].entries()) {
        b.part(new THREE.CylinderGeometry(0.014, 0.016, 0.016, 6), ancientBronzePaint, {
          bone: wingBone,
          at: [sx * rx, ry, sz * 0.054],
          dir: [0, 0, sz],
          flat: true,
          group: `blade${sideTag}`,
          name: `bolsterStud_${sideTag}_${fTag}_${rIdx}`,
        });
      }
    }

    // 6. Protruding Rime-Ice Serration Teeth & Hanging Icicle Barbs under the blade beard
    const barbSpecs = [
      { bx: 0.28, by: 1.04, tx: 0.29, ty: 0.91, r: 0.022 },
      { bx: 0.36, by: 1.08, tx: 0.38, ty: 0.96, r: 0.019 },
      { bx: 0.44, by: 1.21, tx: 0.48, ty: 1.12, r: 0.017 },
    ];
    barbSpecs.forEach((barb, bIdx) => {
      glow(
        b.spike([sx * barb.bx, barb.by, 0], [sx * barb.tx, barb.ty, 0], null, barb.r, {
          section: { ngon: 5 },
          color: bIdx === 0 ? GLOW_CYAN : GLOW_WHITE,
          bone: wingBone,
          group: `blade${sideTag}`,
          name: `bladeIcicleBarb_${sideTag}_${bIdx}`,
        }),
        1.4,
      );
    });

    // 7. Crystalline Frost Aura Cards flaring from the rear notch of each blade
    const auraFrames = [
      frame([sx * 0.36, 1.62, 0], [sx * 0.5, 0.85, 0]),
      frame([sx * 0.47, 1.37, 0], [sx, 0.1, 0]),
      frame([sx * 0.34, 1.08, 0], [sx * 0.5, -0.85, 0]),
    ];
    glow(
      b.cards(auraFrames, frostTuftSvg, {
        size: [0.065, 0.13],
        lean: 25,
        flow: [sx, 0.2, 0],
        cross: true,
        bone: wingBone,
        group: `blade${sideTag}`,
        name: `bladeFrostAuraCards_${sideTag}`,
      }),
      1.5,
    );
  }

  // ---------------------------------------------------------------------------
  // 7. CROWN SPIRE & TOP CREST FINIAL (y = 1.60 to 1.92)
  // ---------------------------------------------------------------------------
  // Heavy Forged-Iron Crown Socket atop the axe head
  b.lathe(
    [
      [0.0, 0.0, "sharp"],
      [0.105, 0.01, "sharp"],
      [0.082, 0.055, "sharp"],
      [0.112, 0.095, "sharp"],
      [0.068, 0.135, "sharp"],
      [0.0, 0.145, "sharp"],
    ],
    {
      at: [0, 1.56, 0],
      axis: [0, 1, 0],
      segments: 8,
      spin: 22.5,
      color: forgedIronPaint,
      bone: crownJoint,
      group: "crown",
      name: "crownCollarBase",
    },
  );

  // Towering Central True Ice Halberd Spire (reaches y = 1.92 m!)
  const crownSpireOutline: OutlinePoint[] = [
    [-0.068, 0.0, "sharp"],
    [-0.095, 0.08, "sharp"],
    [-0.058, 0.14, "sharp"],
    [-0.082, 0.19, "sharp"],
    [0.0, 0.34, "sharp"],
    [0.082, 0.19, "sharp"],
    [0.058, 0.14, "sharp"],
    [0.095, 0.08, "sharp"],
    [0.068, 0.0, "sharp"],
  ];
  b.extrude(crownSpireOutline, {
    at: [0, 1.58, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: [0.068, 0.012],
    bevel: 0.008,
    color: trueIceBladePaint,
    bone: crownJoint,
    group: "crown",
    name: "crownCentralSpire",
  });

  // Glowing core ridge along the central spire
  glow(
    b.spike([0, 1.61, 0], [0, 1.91, 0], null, 0.028, {
      section: { ngon: 4 },
      color: GLOW_WHITE,
      bone: crownJoint,
      group: "crown",
      name: "crownSpireGlowCore",
    }),
    1.8,
  );

  // Flanking Twin Ice-Horn Guard Blades on left and right of the central spire
  for (const sx of [1, -1]) {
    const sideTag = sx > 0 ? "L" : "R";
    b.sweep(
      bezier(
        [sx * 0.065, 1.62, 0],
        [sx * 0.15, 1.71, 0],
        [sx * 0.12, 1.84, 0],
      ),
      [0.034, 0.005],
      {
        section: { ngon: 4 },
        caps: { start: "flat", end: "point" },
        color: forgedIronPaint,
        bone: crownJoint,
        group: "crown",
        name: `crownSideHorn_${sideTag}`,
      },
    );

    // Glowing cyan ice crystal nestled between the side horn and central spire
    glow(
      b.spike([sx * 0.052, 1.64, 0], [sx * 0.095, 1.79, 0], null, 0.024, {
        section: { ngon: 5 },
        color: GLOW_CYAN,
        bone: crownJoint,
        group: "crown",
        name: `crownSideCrystal_${sideTag}`,
      }),
      1.5,
    );
  }

  // Slight heroic rest pose adjustments so the talismans and floating core have dynamic asymmetry
  b.pose(coreOrbJoint, { axis: [0, 0, 1], deg: 12 });
  b.pose(talismanChainL.joints[1], { axis: [0, 0, 1], deg: 8 });
  b.pose(talismanChainR.joints[1], { axis: [0, 0, 1], deg: -8 });

  return b.root;
}
