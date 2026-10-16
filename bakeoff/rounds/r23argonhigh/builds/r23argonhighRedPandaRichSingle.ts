import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { offset, rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { mottle, noise, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, INK, inkLines, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Red Panda",
  description:
    "Cel-shaded Genshin Impact red panda with an ornate gold-filigree Adepti collar, crimson silk tassel, and glowing Dendro-emerald elemental motifs, balancing atop an ancient mossy stone pedestal with glowing runes, crystals, bamboo, and spirit flora.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------
// Palette (Genshin Impact cel-shaded toon paints + flat emissive hex colors)
// ---------------------------------------------------------------------------
const RUFOUS_HEX = "#e24c22";
const RUFOUS_SHADOW = "#9c2419";
const AMBER_HEX = "#f6822c";
const AMBER_SHADOW = "#b8461c";
const CINNAMON_HEX = "#c7391a";
const CREAM_HEX = "#fff5de";
const CREAM_SHADOW = "#dfb58b";
const BUFF_HEX = "#ffdfab";
const BUFF_SHADOW = "#cc925c";
const ESPRESSO_HEX = "#2c151e";
const ESPRESSO_SHADOW = "#160810";
const CHOC_HEX = "#45212b";
const CHOC_SHADOW = "#240e16";
const TEAR_HEX = "#8a1f18";
const TEAR_SHADOW = "#540f0f";

const RUFOUS = cel(RUFOUS_HEX, RUFOUS_SHADOW);
const AMBER = cel(AMBER_HEX, AMBER_SHADOW);
const CREAM = cel(CREAM_HEX, CREAM_SHADOW);
const BUFF = cel(BUFF_HEX, BUFF_SHADOW);
const ESPRESSO = cel(ESPRESSO_HEX, ESPRESSO_SHADOW);
const CHOC = cel(CHOC_HEX, CHOC_SHADOW);
const PINK_BLUSH = cel("#ff96ad", "#c95572");
const NOSE_DARK = cel("#361d38", INK);

const GOLD = cel("#ffd866", "#c47e1a");
const GOLD_LIGHT = cel("#ffec9e", "#d69424");
const CRIMSON_SILK = cel("#bf223d", "#7a1027");
const LAPIS_SILK = cel("#264782", "#14264f");
const JADE_SETTING = cel("#1b6e5a", "#0e3d35");

const STONE_BASE = cel("#6e7e94", "#444f66");
const STONE_DARK = cel("#566478", "#333c4f");
const MOSS_GREEN = cel("#66d654", "#318a36");
const MOSS_CHARTREUSE = cel("#a4ed5a", "#5aa636");
const BAMBOO_STALK = cel("#70cf5e", "#3b8c38");
const BAMBOO_NODE = cel("#b8f07b", "#6eb043");
const FERN_LEAF = cel("#48bd58", "#237335");
const FUNGUS_CAP = cel("#2b82a6", "#184b6e");
const FUNGUS_STEM = cel("#d8f5ed", "#8bbdb8");
const PETAL_WHITE = cel("#fffaf0", "#d4dfed");

// Flat hex colors for glowing parts (glow() requires non-Paint materials)
const GLOW_EMERALD = "#4effb8";
const GLOW_MINT = "#baffdf";
const GLOW_GOLD = "#ffe680";
const GLOW_CYAN = "#54f4ff";

// ---------------------------------------------------------------------------
// Custom Procedural Paints
// ---------------------------------------------------------------------------

// Body & Neck coat: fiery rufous-amber dorsal coat, zig-zag transition to dark espresso belly
const BODY_COAT = cel(
  paint((p, n) => {
    const bellyTooth = -0.14 + 0.2 * zigzag(p.z / 0.032);
    if (n.y < bellyTooth && p.y < 0.44) {
      return noise(p, 0.045, 7) > 0.55 ? CHOC_HEX : ESPRESSO_HEX;
    }
    if (Math.abs(n.y - bellyTooth) < 0.08 && p.y < 0.45) {
      return AMBER_HEX;
    }
    const d = noise(p, 0.065, 13);
    if (n.y > 0.45 && d > 0.56) return AMBER_HEX;
    if (d < 0.36) return CINNAMON_HEX;
    return RUFOUS_HEX;
  }),
);

// Tail coat: 6 alternating rufous-cinnamon and snowy-cream rings with zig-zag fur teeth + dark espresso tip
const TAIL_COAT = cel(
  paint((_p, _n, s) => {
    const t = s[0];
    const deg = s[1];
    const tooth = 0.024 * (zigzag(deg / 30) - 0.5);
    const u = t + tooth;
    if (u > 0.85) return ESPRESSO_HEX;
    if (u > 0.82) return CINNAMON_HEX;
    const bandPos = (u / 0.82) * 5.5;
    const frac = bandPos - Math.floor(bandPos);
    if (frac < 0.46) {
      return frac < 0.1 || frac > 0.38 ? AMBER_HEX : RUFOUS_HEX;
    }
    if (frac < 0.53 || frac > 0.93) {
      return BUFF_HEX;
    }
    return CREAM_HEX;
  }),
);

// Head coat: rufous crown, snowy-cream cheek ruffs & brow patches, dark mahogany tear tracks
const HEAD_COAT = cel(
  paint((p, n) => {
    const ax = Math.abs(p.x);
    const zWave = 0.006 * (zigzag(p.y / 0.02) - 0.5);
    // White-cream brow patches above eyes
    if (p.z > 0.33 + zWave && p.y > 0.532 && p.y < 0.568 && ax > 0.018 && ax < 0.056) {
      return CREAM_HEX;
    }
    // Dark mahogany tear-tracks from inner eye down to cheek/muzzle
    if (p.z > 0.345 && p.y > 0.482 && p.y < 0.526 && ax > 0.022 && ax < 0.044) {
      return TEAR_HEX;
    }
    // Broad snowy-cream lower cheeks
    if (ax > 0.052 + zWave && p.y < 0.522 && p.z > 0.275 && p.z < 0.365) {
      return ax > 0.064 ? CREAM_HEX : BUFF_HEX;
    }
    // Warm amber forehead bridge
    if (n.y > 0.5 && p.z > 0.31) return AMBER_HEX;
    return RUFOUS_HEX;
  }),
);

// Leg coat: glossy dark espresso with rufous shoulder/hip cap at top
const LEG_COAT = furEdge(RUFOUS, ESPRESSO, {
  by: "position",
  axis: [0, 1, 0],
  level: 0.365,
  teeth: 0.022,
  period: 0.024,
  along: [0, 0, 1],
  ink: INK,
  inkWidth: 0.004,
});

// Mossy boulder paint: weathered blue-grey Liyue stone with lush cel-shaded moss blanket on top faces
const STONE_MOSS_PAINT = cel(
  paint((p, n) => {
    const mossLine = 0.44 + 0.18 * zigzag((p.x * 1.3 + p.z) / 0.048);
    if (n.y > mossLine && p.y > 0.06) {
      return noise(p, 0.055, 31) > 0.52 ? "#9be858" : "#5fd150";
    }
    if (Math.abs(n.y - mossLine) < 0.055 && p.y > 0.06) {
      return "#285e2e";
    }
    // Stone strata and lichen blotches
    const strata = Math.sin(p.y * 52 + noise(p, 0.08, 19) * 3.5);
    if (strata > 0.72) return "#536175";
    return noise(p, 0.09, 41) > 0.55 ? "#8290a3" : "#6b7b91";
  }),
);

const MOSS_CUSHION_PAINT = cel(
  mottle("#5ed14f", "#a3eb5b", { size: 0.05, contrast: 1.4, seed: 17 }),
);

// ---------------------------------------------------------------------------
// SVG Textures (Anime Eyes, Cel-Shaded Fur Cards, Glowing Elemental Rune, Flora)
// ---------------------------------------------------------------------------
const EYE_TEX = animeEye({
  iris: "#20d69b",
  irisLight: "#aaffdf",
  irisDark: "#0c5249",
  blush: "#ff859e",
  brow: true,
  size: 512,
});

const RUFOUS_FUR_CARD = svg(
  `<svg viewBox="0 0 64 96">
    <path d="M8 94 C10 62 15 32 22 6 C26 28 28 56 27 94 Z" fill="${RUFOUS_HEX}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M40 94 C41 60 46 30 53 10 C56 34 57 62 55 94 Z" fill="${AMBER_HEX}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M21 94 C24 54 30 22 35 2 C40 24 44 56 44 94 Z" fill="${AMBER_HEX}" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="M28 94 C30 62 33 34 35 12 C37 34 39 62 39 94 Z" fill="${BUFF_HEX}"/>
  </svg>`,
  { size: 256 },
);

const CREAM_FUR_CARD = svg(
  `<svg viewBox="0 0 64 96">
    <path d="M6 94 C9 60 15 28 22 8 C26 30 28 58 27 94 Z" fill="${BUFF_HEX}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M38 94 C40 58 46 28 54 8 C57 32 58 60 56 94 Z" fill="${BUFF_HEX}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M18 94 C22 50 28 18 33 3 C39 20 44 52 46 94 Z" fill="${CREAM_HEX}" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
  </svg>`,
  { size: 256 },
);

const RUNE_SEAL_TEX = svg(
  `<svg viewBox="0 0 128 128">
    <circle cx="64" cy="64" r="56" fill="none" stroke="#4effb8" stroke-width="5"/>
    <circle cx="64" cy="64" r="44" fill="none" stroke="#ffe680" stroke-width="3.5" stroke-dasharray="12 8"/>
    <path d="M64 16 C82 36 86 58 64 64 C42 70 46 92 64 112" fill="none" stroke="#baffdf" stroke-width="6" stroke-linecap="round"/>
    <path d="M16 64 C36 46 58 42 64 64 C70 86 92 82 112 64" fill="none" stroke="#4effb8" stroke-width="6" stroke-linecap="round"/>
    <path d="M64 28 L74 54 L100 64 L74 74 L64 100 L54 74 L28 64 L54 54 Z" fill="#4effb8" stroke="#baffdf" stroke-width="3"/>
    <circle cx="64" cy="64" r="11" fill="#ffffff"/>
  </svg>`,
  { size: 256 },
);

const FERN_CARD_TEX = svg(
  `<svg viewBox="0 0 64 96">
    <path d="M10 94 C12 62 16 32 22 8 C26 32 27 62 25 94 Z" fill="#3da84a" stroke="${INK}" stroke-width="3"/>
    <path d="M38 94 C41 64 46 34 54 12 C56 38 55 64 52 94 Z" fill="#68d957" stroke="${INK}" stroke-width="3"/>
    <path d="M22 94 C26 52 31 20 35 4 C39 24 42 54 41 94 Z" fill="#88eb59" stroke="${INK}" stroke-width="3.2"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "redPanda", detail: 0.75, paintSize: 1024 });
  const rand = rng(42);

  // =========================================================================
  // 1. SKELETON (Full anatomical rig + leaf pedestal joint for the stone)
  // =========================================================================
  const pelvis = b.joint("pelvis", {
    at: [0, 0.41, -0.1],
    dir: [0, 0.05, 1],
    role: "spine",
    group: "body",
  });

  // Leaf joint for the mossy stone base so no creature joint sits below it
  const pedestal = b.joint("pedestal", {
    parent: pelvis,
    at: [0, 0.08, 0],
    dir: [0, 1, 0],
    group: "stone",
  });

  const spinePath = catmull([
    [0, 0.41, -0.1],
    [0, 0.438, 0.0],
    [0, 0.435, 0.1],
    [0, 0.425, 0.19],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: pelvis,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
    group: "body",
  });

  const neckPath = catmull([
    [0, 0.425, 0.19],
    [0, 0.465, 0.238],
    [0, 0.505, 0.278],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: spine,
    names: ["neck1", "neck2"],
    role: "neck",
    group: "neck",
  });

  const head = b.joint("head", {
    parent: neck,
    at: [0, 0.505, 0.278],
    dir: [0, 0.06, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.474, 0.318],
    dir: [0, -0.18, 1],
    role: "jaw",
    group: "head",
  });

  const earL = b.joint("earL", {
    parent: head,
    at: [0.072, 0.562, 0.268],
    dir: [0.65, 0.72, -0.1],
    role: "hinge",
    group: "head",
  });
  const earR = b.joint("earR", {
    parent: head,
    at: [-0.072, 0.562, 0.268],
    dir: [-0.65, 0.72, -0.1],
    role: "hinge",
    group: "head",
  });

  const tassel = b.joint("tassel", {
    parent: spine.joints[2],
    at: [0, 0.352, 0.242],
    dir: [0, -1, 0.16],
    role: "hinge",
    group: "collar",
  });

  const tailPath = catmull([
    [0, 0.41, -0.1],
    [0, 0.402, -0.22],
    [0, 0.425, -0.35],
    [0, 0.475, -0.48],
    [0, 0.535, -0.6],
    [0, 0.575, -0.69],
    [0, 0.585, -0.76],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: pelvis,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6"],
    role: "tail",
    group: "tail",
  });

  // Forelegs & Hindlegs (off mid-plane so side is "L" and "R")
  const foreLegs = ([1, -1] as const).map((s) => {
    const tag = s > 0 ? "L" : "R";
    const rootPt = [s * 0.082, 0.395, 0.165];
    const footPt = [s * 0.092, 0.232, 0.175];
    const pts = limb(rootPt, footPt, [0.095, 0.09], [s * 0.16, 0, -1]);
    const chain = b.chain(`legF${tag}`, pts, {
      parent: spine.joints[2],
      names: [`shoulder${tag}`, `elbow${tag}`, `wrist${tag}`],
      role: "leg",
      contact: [s * 0.092, 0.212, 0.185],
      group: `legF${tag}`,
    });
    const toes = ([-1, 0, 1] as const).map((ti, idx) =>
      b.joint(`toeF${tag}${idx + 1}`, {
        parent: chain.tip!,
        at: [s * 0.092 + ti * 0.019, 0.222, 0.196 + (ti === 0 ? 0.006 : 0)],
        dir: [ti * 0.2, -0.16, 1],
        role: "digit",
        group: `legF${tag}`,
      }),
    );
    return { s, tag, chain, toes };
  });

  const hindLegs = ([1, -1] as const).map((s) => {
    const tag = s > 0 ? "L" : "R";
    const rootPt = [s * 0.088, 0.395, -0.105];
    const footPt = [s * 0.102, 0.224, -0.115];
    const pts = limb(rootPt, footPt, [0.102, 0.095], [s * 0.18, 0, 1]);
    const chain = b.chain(`legH${tag}`, pts, {
      parent: pelvis,
      names: [`hip${tag}`, `knee${tag}`, `ankle${tag}`],
      role: "leg",
      contact: [s * 0.102, 0.204, -0.105],
      group: `legH${tag}`,
    });
    const toes = ([-1, 0, 1] as const).map((ti, idx) =>
      b.joint(`toeH${tag}${idx + 1}`, {
        parent: chain.tip!,
        at: [s * 0.102 + ti * 0.019, 0.215, -0.092 + (ti === 0 ? 0.006 : 0)],
        dir: [ti * 0.2, -0.15, 1],
        role: "digit",
        group: `legH${tag}`,
      }),
    );
    return { s, tag, chain, toes };
  });

  // =========================================================================
  // 2. MOSSY STONE PEDESTAL & GENSHIN ENVIRONMENT DETAILS (Grounded at y = 0)
  // =========================================================================
  // Central terraced boulder (flat bottom at y = 0.000)
  b.lathe(
    [
      [0, 0],
      [0.245, 0],
      [0.268, 0.038],
      [0.258, 0.1],
      [0.232, 0.162],
      [0.195, 0.202],
      [0.13, 0.218],
      [0, 0.222],
    ],
    {
      at: [0, 0, 0.02],
      axis: [0, 1, 0],
      segments: 10,
      smoothing: 0,
      color: STONE_MOSS_PAINT,
      bone: pedestal,
      group: "stone",
      name: "stoneMain",
    },
  );

  // Front stone lobe supporting the forepaws (flat bottom at y = 0.000)
  b.lathe(
    [
      [0, 0],
      [0.21, 0],
      [0.232, 0.035],
      [0.224, 0.105],
      [0.204, 0.168],
      [0.175, 0.208],
      [0.115, 0.222],
      [0, 0.226],
    ],
    {
      at: [0, 0, 0.115],
      axis: [0, 1, 0],
      segments: 9,
      spin: 18,
      smoothing: 0,
      color: STONE_MOSS_PAINT,
      bone: pedestal,
      group: "stone",
      name: "stoneFront",
    },
  );

  // Back stone lobe supporting the hindpaws (flat bottom at y = 0.000)
  b.lathe(
    [
      [0, 0],
      [0.22, 0],
      [0.24, 0.035],
      [0.23, 0.1],
      [0.208, 0.16],
      [0.178, 0.198],
      [0.115, 0.212],
      [0, 0.216],
    ],
    {
      at: [0, 0, -0.095],
      axis: [0, 1, 0],
      segments: 9,
      spin: -15,
      smoothing: 0,
      color: STONE_MOSS_PAINT,
      bone: pedestal,
      group: "stone",
      name: "stoneBack",
    },
  );

  // Flanking asymmetrical base boulders (all grounded at y = 0.000)
  const subRocks: ReadonlyArray<{
    name: string;
    at: [number, number, number];
    r: number;
    h: number;
    segs: number;
    spin: number;
  }> = [
    { name: "rockFlankL", at: [0.185, 0, 0.03], r: 0.125, h: 0.155, segs: 7, spin: 12 },
    { name: "rockFlankR", at: [-0.19, 0, -0.01], r: 0.12, h: 0.145, segs: 7, spin: 27 },
    { name: "rockStepF", at: [0.04, 0, 0.245], r: 0.105, h: 0.115, segs: 6, spin: 8 },
    { name: "rockStepBL", at: [0.14, 0, -0.2], r: 0.11, h: 0.13, segs: 7, spin: 33 },
    { name: "rockStepBR", at: [-0.135, 0, -0.21], r: 0.1, h: 0.11, segs: 6, spin: 19 },
  ];
  for (const rk of subRocks) {
    b.lathe(
      [
        [0, 0],
        [rk.r, 0],
        [rk.r * 1.06, rk.h * 0.28],
        [rk.r * 0.92, rk.h * 0.72],
        [rk.r * 0.62, rk.h * 0.94],
        [0, rk.h],
      ],
      {
        at: rk.at,
        axis: [0, 1, 0],
        segments: rk.segs,
        spin: rk.spin,
        smoothing: 0,
        color: STONE_MOSS_PAINT,
        bone: pedestal,
        group: "stone",
        name: rk.name,
      },
    );
  }

  // Plump cel-shaded moss cushions under each paw and across the boulder crown
  const mossPads: ReadonlyArray<{
    name: string;
    at: [number, number, number];
    scale: [number, number, number];
    rot: [number, number, number];
  }> = [
    { name: "mossPadFL", at: [0.092, 0.21, 0.182], scale: [0.068, 0.022, 0.072], rot: [4, 0, -5] },
    { name: "mossPadFR", at: [-0.092, 0.21, 0.182], scale: [0.068, 0.022, 0.072], rot: [4, 0, 5] },
    { name: "mossPadHL", at: [0.102, 0.202, -0.105], scale: [0.072, 0.022, 0.076], rot: [-4, 0, -5] },
    { name: "mossPadHR", at: [-0.102, 0.202, -0.105], scale: [0.072, 0.022, 0.076], rot: [-4, 0, 5] },
    { name: "mossCrownC", at: [0, 0.216, 0.03], scale: [0.11, 0.024, 0.13], rot: [0, 15, 0] },
    { name: "mossLedgeL", at: [0.18, 0.148, 0.03], scale: [0.075, 0.02, 0.08], rot: [0, 0, -10] },
    { name: "mossLedgeR", at: [-0.185, 0.138, -0.01], scale: [0.072, 0.02, 0.075], rot: [0, 0, 10] },
    { name: "mossStepF", at: [0.04, 0.11, 0.245], scale: [0.065, 0.018, 0.062], rot: [8, 0, 0] },
  ];
  const mossSphereGeo = new THREE.SphereGeometry(1, 8, 6);
  for (const mp of mossPads) {
    b.part(mossSphereGeo, MOSS_CUSHION_PAINT, {
      bone: pedestal,
      at: mp.at,
      scale: mp.scale,
      rotation: mp.rot,
      group: "stone",
      name: mp.name,
    });
  }

  // Carved Adepti Gold-Rimmed Seal & Glowing Elemental Rune on front of stone
  b.part(new THREE.CylinderGeometry(0.056, 0.062, 0.018, 8), STONE_DARK, {
    bone: pedestal,
    at: [-0.045, 0.125, 0.285],
    dir: [-0.18, 0.22, 1],
    flat: true,
    group: "stone",
    name: "sealStoneBacking",
  });
  b.part(new THREE.TorusGeometry(0.052, 0.008, 6, 10), GOLD, {
    bone: pedestal,
    at: [-0.047, 0.127, 0.292],
    dir: [-0.18, 0.22, 1],
    axis: "z",
    group: "stone",
    name: "sealGoldRing",
  });
  glow(
    b.part(new THREE.CircleGeometry(0.048, 10), "#ffffff", {
      bone: pedestal,
      at: [-0.049, 0.129, 0.297],
      dir: [-0.18, 0.22, 1],
      axis: "z",
      texture: RUNE_SEAL_TEX,
      group: "stone",
      name: "sealGlowingRune",
    }),
    1.5,
  );

  // Glowing Dendro/Jade Crystal Cluster sprouting from the right rock crevice
  const crystals: ReadonlyArray<{
    name: string;
    base: [number, number, number];
    dir: [number, number, number];
    len: number;
    r: number;
    color: string;
  }> = [
    {
      name: "crystalMain",
      base: [-0.215, 0.11, 0.08],
      dir: [-0.65, 0.72, 0.25],
      len: 0.095,
      r: 0.022,
      color: GLOW_EMERALD,
    },
    {
      name: "crystalSub1",
      base: [-0.205, 0.1, 0.105],
      dir: [-0.48, 0.55, 0.68],
      len: 0.068,
      r: 0.016,
      color: GLOW_MINT,
    },
    {
      name: "crystalSub2",
      base: [-0.225, 0.095, 0.055],
      dir: [-0.78, 0.48, -0.22],
      len: 0.062,
      r: 0.015,
      color: GLOW_EMERALD,
    },
  ];
  for (const cr of crystals) {
    glow(
      b.spike(cr.base, cr.dir, cr.len, cr.r, {
        bone: pedestal,
        section: { ngon: 5 },
        color: cr.color,
        group: "stone",
        name: cr.name,
      }),
      1.35,
    );
  }

  // Cluster of Young Jade Bamboo Stalks & Leaves at back-left of stone
  const bambooStalks: ReadonlyArray<{
    name: string;
    x: number;
    z: number;
    topX: number;
    topY: number;
    topZ: number;
    r: number;
  }> = [
    { name: "bamboo1", x: 0.175, z: -0.18, topX: 0.22, topY: 0.44, topZ: -0.22, r: 0.014 },
    { name: "bamboo2", x: 0.205, z: -0.145, topX: 0.255, topY: 0.36, topZ: -0.16, r: 0.012 },
  ];
  for (const bm of bambooStalks) {
    const stalkCurve = bezier(
      [bm.x, 0.08, bm.z],
      [bm.x + 0.015, (0.08 + bm.topY) * 0.5, bm.z - 0.01],
      [bm.topX, bm.topY, bm.topZ],
    );
    b.sweep(stalkCurve, [bm.r, bm.r * 0.78], {
      bone: pedestal,
      sides: 6,
      color: BAMBOO_STALK,
      group: "flora",
      name: bm.name,
    });
    for (const nt of [0.35, 0.7]) {
      const np = stalkCurve.at(nt);
      const tan = stalkCurve.tangentAt(nt);
      b.part(new THREE.TorusGeometry(bm.r * 1.05, 0.0035, 5, 7), BAMBOO_NODE, {
        bone: pedestal,
        at: np,
        dir: tan,
        axis: "z",
        group: "flora",
        name: `${bm.name}Node${Math.round(nt * 10)}`,
      });
    }
    const tip = stalkCurve.at(1);
    for (const [li, lDir] of (
      [
        [0, [0.75, 0.35, -0.45]],
        [1, [0.35, 0.55, 0.65]],
        [2, [-0.55, 0.4, -0.6]],
      ] as const
    )) {
      b.extrude(
        [
          [0, 0],
          [0.032, 0.011],
          [0.075, 0.004],
          [0.032, -0.011],
        ],
        {
          at: tip,
          x: lDir,
          y: [0, 1, 0],
          thickness: [0.005, 0.001],
          smoothing: 0,
          color: li === 1 ? MOSS_CHARTREUSE : BAMBOO_STALK,
          bone: pedestal,
          group: "flora",
          name: `${bm.name}Leaf${li}`,
        },
      );
    }
  }

  // Two Glowing Spirit Mushrooms nestled on the stone ledges
  const mushrooms: ReadonlyArray<{
    name: string;
    base: [number, number, number];
    top: [number, number, number];
    capR: number;
  }> = [
    { name: "shroom1", base: [0.21, 0.13, 0.09], top: [0.235, 0.195, 0.11], capR: 0.036 },
    { name: "shroom2", base: [0.235, 0.11, 0.04], top: [0.265, 0.158, 0.05], capR: 0.026 },
  ];
  for (const sh of mushrooms) {
    b.capsule(sh.base, sh.top, [sh.capR * 0.34, sh.capR * 0.26], {
      bone: pedestal,
      sides: 6,
      color: FUNGUS_STEM,
      group: "flora",
      name: `${sh.name}Stem`,
    });
    b.lathe(
      [
        [0, -0.004],
        [sh.capR * 0.9, -0.002],
        [sh.capR, 0.008],
        [sh.capR * 0.68, sh.capR * 0.52],
        [0, sh.capR * 0.68],
      ],
      {
        at: sh.top,
        axis: [0.28, 0.94, 0.15],
        segments: 8,
        smoothing: 0,
        color: FUNGUS_CAP,
        bone: pedestal,
        group: "flora",
        name: `${sh.name}Cap`,
      },
    );
    glow(
      b.part(new THREE.OctahedronGeometry(sh.capR * 0.24, 0), GLOW_CYAN, {
        bone: pedestal,
        at: [sh.top[0] + 0.004, sh.top[1] + sh.capR * 0.56, sh.top[2] + 0.003],
        scale: [1, 0.55, 1],
        group: "flora",
        name: `${sh.name}GlowGem`,
      }),
      1.5,
    );
  }

  // Sculpted Fern Fronds & Spirit Blossoms on the mossy stone
  const fernRoots: ReadonlyArray<{
    name: string;
    at: [number, number, number];
    dir: [number, number, number];
  }> = [
    { name: "fernFL", at: [0.165, 0.16, 0.16], dir: [0.75, 0.45, 0.48] },
    { name: "fernFR", at: [-0.155, 0.15, 0.17], dir: [-0.72, 0.48, 0.5] },
    { name: "fernBR", at: [-0.165, 0.135, -0.16], dir: [-0.68, 0.45, -0.58] },
  ];
  for (const fn of fernRoots) {
    b.extrude(
      [
        [0, 0],
        [0.035, 0.018],
        [0.082, 0.012],
        [0.105, -0.005],
        [0.068, -0.016],
        [0.025, -0.012],
      ],
      {
        at: fn.at,
        x: fn.dir,
        y: [0, 1, 0],
        thickness: [0.006, 0.002],
        smoothing: 0,
        color: FERN_LEAF,
        bone: pedestal,
        group: "flora",
        name: fn.name,
      },
    );
  }

  // Two Genshin Cecilia-style Spirit Flowers with glowing golden-emerald centers
  for (const [fi, fPos] of (
    [
      [0, [0.11, 0.122, 0.245]],
      [1, [-0.165, 0.152, 0.04]],
    ] as const
  )) {
    const fCenter = frame(fPos, [0.15 * (fi === 0 ? 1 : -1), 0.96, 0.2]);
    b.ring(fCenter, { count: 5, radius: 0.01, tilt: 58, group: "flora" }, (petal) => {
      b.stick(new THREE.ConeGeometry(0.014, 0.032, 4), PETAL_WHITE, petal, {
        bone: pedestal,
        scale: [1, 1, 0.4],
        embed: 0.15,
        group: "flora",
      });
    });
    glow(
      b.part(new THREE.OctahedronGeometry(0.011, 0), GLOW_GOLD, {
        bone: pedestal,
        at: [fPos[0], fPos[1] + 0.008, fPos[2]],
        group: "flora",
        name: `spiritFlowerCore${fi}`,
      }),
      1.6,
    );
  }

  // Grass & fern tuft cards around the stone ledges
  const grassFrames = [
    frame([0.145, 0.175, 0.14], [0.25, 0.95, 0.15]),
    frame([-0.145, 0.165, 0.15], [-0.25, 0.95, 0.15]),
    frame([0.15, 0.165, -0.15], [0.25, 0.95, -0.15]),
    frame([-0.15, 0.155, -0.15], [-0.25, 0.95, -0.15]),
    frame([0.05, 0.112, 0.265], [0.1, 0.95, 0.3]),
    frame([-0.19, 0.142, -0.05], [-0.35, 0.92, -0.1]),
  ];
  b.cards(grassFrames, FERN_CARD_TEX, {
    size: [0.048, 0.068],
    lean: 24,
    bend: 18,
    cross: true,
    vary: 0.2,
    spin: 35,
    rng: rand,
    bone: pedestal,
    group: "flora",
    name: "stoneGrassCards",
  });

  // =========================================================================
  // 3. RED PANDA TORSO, NECK & FLUFFY RINGED TAIL
  // =========================================================================
  const torsoNeckCurve = catmull([
    [0, 0.408, -0.135],
    [0, 0.415, -0.08],
    [0, 0.435, 0.01],
    [0, 0.432, 0.11],
    [0, 0.428, 0.195],
    [0, 0.468, 0.242],
    [0, 0.505, 0.28],
  ]);

  const torsoWidths = [0.068, 0.098, 0.108, 0.102, 0.092, 0.078, 0.066];
  const torsoHeights = [0.065, 0.092, 0.104, 0.098, 0.088, 0.076, 0.065];
  const torsoSweep = b.sweep(
    torsoNeckCurve,
    (t) => {
      const idx = t * (torsoWidths.length - 1);
      const i0 = Math.min(Math.floor(idx), torsoWidths.length - 2);
      const f = idx - i0;
      const rx = torsoWidths[i0] + (torsoWidths[i0 + 1] - torsoWidths[i0]) * f;
      const ry = torsoHeights[i0] + (torsoHeights[i0 + 1] - torsoHeights[i0]) * f;
      return [rx, ry];
    },
    {
      bone: [pelvis, spine, neck],
      sides: 10,
      shift: (t) => [0, -0.016 * Math.sin(Math.PI * Math.min(t / 0.78, 1))],
      color: BODY_COAT,
      group: "body",
      name: "torsoTube",
    },
  );

  // Fluffy chest ruff tufts in front of the neck/chest
  for (const s of [1, -1] as const) {
    const tag = s > 0 ? "L" : "R";
    b.spike(
      [s * 0.048, 0.415, 0.225],
      [s * 0.52, -0.38, 0.76],
      0.055,
      0.026,
      {
        bone: spine.joints[2],
        sides: 5,
        color: RUFOUS,
        group: "body",
        name: `chestTuft${tag}`,
      },
    );
  }

  // Huge plush ringed tail (continuous blend-skinned over tail1..6, buried 4.5 cm into rump)
  const tailRadii = [0.068, 0.088, 0.104, 0.11, 0.102, 0.082, 0.046];
  const tailSweep = b.sweep(
    tail,
    (t) => {
      const idx = t * (tailRadii.length - 1);
      const i0 = Math.min(Math.floor(idx), tailRadii.length - 2);
      const f = idx - i0;
      const r = tailRadii[i0] + (tailRadii[i0 + 1] - tailRadii[i0]) * f;
      return [r * 1.06, r * 0.96];
    },
    {
      sides: 10,
      extend: [0.045, 0],
      caps: { start: "round", end: "round" },
      color: TAIL_COAT,
      group: "tail",
      name: "tailPlume",
    },
  );

  // Sculpted tail fur flares along the sides of the tail for an extra-fluffy anime silhouette
  for (const [ti, tVal] of [
    [0, 0.25],
    [1, 0.48],
    [2, 0.7],
  ] as const) {
    for (const s of [1, -1] as const) {
      const pt = tailSweep.at(tVal, s * 88, -0.008);
      b.spike(
        pt,
        [s * 0.55, 0.12, -0.82],
        0.062,
        0.026,
        {
          sides: 5,
          color: ti === 1 ? CREAM : RUFOUS,
          group: "tail",
          name: `tailFlare${s > 0 ? "L" : "R"}${ti}`,
        },
      );
    }
  }

  // =========================================================================
  // 4. FOUR LEGS, PAWS, EXTENDED TOES & CLAWS
  // =========================================================================
  for (const leg of foreLegs) {
    const { s, tag, chain, toes } = leg;
    // Upper & lower foreleg sweep
    b.sweep(chain, [0.056, 0.046, 0.04], {
      sides: 7,
      extend: [0.032, 0],
      color: LEG_COAT,
      group: `legF${tag}`,
      name: `forelegTube${tag}`,
    });

    // Fluffy elbow tuft pointing backward
    const elbowJoint = chain.joints[1];
    b.spike(
      elbowJoint.local([0, 0.01, -0.028]),
      [s * 0.22, -0.15, -0.95],
      0.045,
      0.022,
      {
        bone: elbowJoint,
        sides: 5,
        color: ESPRESSO,
        group: `legF${tag}`,
        name: `elbowTuft${tag}`,
      },
    );

    // Plump forepaw pad base
    const wristJoint = chain.tip!;
    b.part(new THREE.SphereGeometry(1, 7, 5), ESPRESSO, {
      bone: wristJoint,
      at: [s * 0.092, 0.226, 0.184],
      scale: [0.044, 0.024, 0.048],
      group: `legF${tag}`,
      name: `forepawBase${tag}`,
    });

    // 3 separated extended toes with cream knuckle trim and curved dark claws
    toes.forEach((toeJoint, idx) => {
      const toeTip = offset(toeJoint.at, toeJoint.axis, 0.03);
      b.capsule(toeJoint.at, toeTip, [0.014, 0.012], {
        bone: toeJoint,
        sides: 5,
        color: CHOC,
        group: `legF${tag}`,
        name: `foreToe${tag}${idx + 1}`,
      });
      b.spike(
        offset(toeJoint.at, toeJoint.axis, 0.026),
        [0, -0.38, 0.92],
        0.018,
        0.007,
        {
          bone: toeJoint,
          sides: 4,
          color: NOSE_DARK,
          group: `legF${tag}`,
          name: `foreClaw${tag}${idx + 1}`,
        },
      );
    });
  }

  for (const leg of hindLegs) {
    const { s, tag, chain, toes } = leg;
    // Fluffy thigh & lower hindleg sweep
    b.sweep(chain, [0.066, 0.05, 0.042], {
      sides: 7,
      extend: [0.036, 0],
      color: LEG_COAT,
      group: `legH${tag}`,
      name: `hindlegTube${tag}`,
    });

    // Haunch fur flare on upper thigh
    const hipJoint = chain.joints[0];
    b.spike(
      hipJoint.local([s * 0.032, 0.02, -0.02]),
      [s * 0.65, -0.2, -0.72],
      0.052,
      0.025,
      {
        bone: hipJoint,
        sides: 5,
        color: RUFOUS,
        group: `legH${tag}`,
        name: `thighTuft${tag}`,
      },
    );

    // Plump hindpaw base
    const ankleJoint = chain.tip!;
    b.part(new THREE.SphereGeometry(1, 7, 5), ESPRESSO, {
      bone: ankleJoint,
      at: [s * 0.102, 0.218, -0.104],
      scale: [0.046, 0.024, 0.052],
      group: `legH${tag}`,
      name: `hindpawBase${tag}`,
    });

    // 3 separated extended hind toes + claws
    toes.forEach((toeJoint, idx) => {
      const toeTip = offset(toeJoint.at, toeJoint.axis, 0.032);
      b.capsule(toeJoint.at, toeTip, [0.014, 0.012], {
        bone: toeJoint,
        sides: 5,
        color: CHOC,
        group: `legH${tag}`,
        name: `hindToe${tag}${idx + 1}`,
      });
      b.spike(
        offset(toeJoint.at, toeJoint.axis, 0.028),
        [0, -0.36, 0.93],
        0.018,
        0.007,
        {
          bone: toeJoint,
          sides: 4,
          color: NOSE_DARK,
          group: `legH${tag}`,
          name: `hindClaw${tag}${idx + 1}`,
        },
      );
    });
  }

  // =========================================================================
  // 5. RED PANDA HEAD, JAW, ANIME EYES, CHEEK RUFFS & EARS
  // =========================================================================
  const HEAD_CENTER: [number, number, number] = [0, 0.515, 0.305];
  const skull = b.part(new THREE.SphereGeometry(1, 14, 12), HEAD_COAT, {
    bone: head,
    at: HEAD_CENTER,
    scale: [0.092, 0.08, 0.084],
    group: "head",
    name: "skull",
  });

  // Broad snowy-cream cheek ruffs & layered sculpted fur flares on both sides of the face
  for (const s of [1, -1] as const) {
    const tag = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, {
      bone: head,
      at: [s * 0.068, 0.498, 0.308],
      scale: [0.046, 0.038, 0.042],
      rotation: [0, s * 16, -s * 12],
      group: "head",
      name: `cheekMass${tag}`,
    });

    // 3 layered cheek fur spikes per side
    const tufts: ReadonlyArray<{
      base: [number, number, number];
      dir: [number, number, number];
      len: number;
      r: number;
    }> = [
      { base: [s * 0.088, 0.51, 0.302], dir: [s * 0.9, 0.15, -0.35], len: 0.058, r: 0.024 },
      { base: [s * 0.085, 0.49, 0.305], dir: [s * 0.88, -0.16, -0.38], len: 0.064, r: 0.026 },
      { base: [s * 0.072, 0.474, 0.312], dir: [s * 0.72, -0.45, -0.32], len: 0.048, r: 0.02 },
    ];
    tufts.forEach((tf, idx) => {
      b.spike(tf.base, tf.dir, tf.len, tf.r, {
        bone: head,
        sides: 5,
        color: idx === 2 ? BUFF : CREAM,
        group: "head",
        name: `cheekTuft${tag}${idx + 1}`,
      });
    });

    // Raised snowy-cream teardrop eyebrow cushions above each eye
    b.capsule(
      [s * 0.024, 0.548, 0.368],
      [s * 0.052, 0.556, 0.355],
      [0.015, 0.012],
      {
        bone: head,
        sides: 6,
        color: CREAM,
        group: "head",
        name: `browCushion${tag}`,
      },
    );
  }

  // Plump snowy-cream upper snout / muzzle with toon ink rim
  const MUZZLE_PAINT = inkLines(CREAM, { levels: [0.18], axis: [0, 0, 1], width: 0.055 });
  b.part(new THREE.SphereGeometry(1, 8, 6), MUZZLE_PAINT, {
    bone: head,
    at: [0, 0.492, 0.372],
    scale: [0.042, 0.028, 0.036],
    group: "head",
    name: "upperMuzzle",
  });

  // Cute button nose + tiny upper fangs
  b.part(new THREE.SphereGeometry(1, 6, 5), NOSE_DARK, {
    bone: head,
    at: [0, 0.503, 0.405],
    scale: [0.016, 0.012, 0.012],
    group: "head",
    name: "nose",
  });
  for (const s of [1, -1] as const) {
    b.spike(
      [s * 0.016, 0.479, 0.388],
      [0, -1, 0.15],
      0.012,
      0.0045,
      {
        bone: head,
        sides: 4,
        color: CREAM,
        group: "head",
        name: `fang${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // Hinged Lower Jaw, Pink Tongue & Chin Tuft (rides the `jaw` bone so the mouth can open)
  b.capsule([0, 0.472, 0.322], [0, 0.468, 0.376], [0.03, 0.022], {
    bone: jaw,
    sides: 6,
    color: CREAM,
    group: "head",
    name: "lowerJaw",
  });
  b.capsule([0, 0.476, 0.338], [0, 0.474, 0.374], [0.018, 0.014], {
    bone: jaw,
    sides: 6,
    color: PINK_BLUSH,
    group: "head",
    name: "tongue",
  });

  // Crown fur crest & Genshin Glowing Forehead Elemental Trefoil Mark
  b.spike([0, 0.585, 0.295], [0, 0.72, -0.68], 0.048, 0.02, {
    bone: head,
    sides: 5,
    color: AMBER,
    group: "head",
    name: "crownCrest1",
  });
  b.spike([0, 0.578, 0.275], [0, 0.48, -0.88], 0.045, 0.018, {
    bone: head,
    sides: 5,
    color: RUFOUS,
    group: "head",
    name: "crownCrest2",
  });
  b.part(new THREE.OctahedronGeometry(0.012, 0), GOLD, {
    bone: head,
    at: [0, 0.556, 0.376],
    scale: [0.95, 1.35, 0.45],
    rotation: [18, 0, 0],
    group: "head",
    name: "foreheadGoldSetting",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.0085, 0), GLOW_EMERALD, {
      bone: head,
      at: [0, 0.556, 0.38],
      scale: [0.85, 1.25, 0.45],
      rotation: [18, 0, 0],
      group: "head",
      name: "foreheadElementalGem",
    }),
    1.6,
  );

  // Big Shiny Anime Eyes (conformed onto the skull with b.decal)
  const skullSkin = b.surface(skull);
  for (const s of [1, -1] as const) {
    const hit = skullSkin.around(HEAD_CENTER).at(s * 31, 3);
    if (hit) {
      b.decal(skullSkin, EYE_TEX, {
        at: hit,
        size: [0.048, 0.062],
        mirror: s > 0,
        bone: head,
        group: "head",
        name: `animeEye${s > 0 ? "L" : "R"}`,
      });
    }
  }

  // Expressive Triangular-Rounded Red Panda Ears (`earL`, `earR`) + Gold Ear Ornament
  for (const [s, earJoint] of [
    [1, earL],
    [-1, earR],
  ] as const) {
    const tag = s > 0 ? "L" : "R";
    // Outer espresso ear shell + cream rim
    b.extrude(
      [
        [-0.036, -0.008],
        [0.036, -0.008],
        [0.044, 0.032],
        [0.022, 0.072],
        [0, 0.086],
        [-0.022, 0.072],
        [-0.044, 0.032],
      ],
      {
        at: earJoint.at,
        x: [s * 0.72, -0.64, 0.22],
        y: earJoint.axis,
        thickness: [0.024, 0.008],
        smoothing: 0,
        color: ESPRESSO,
        bone: earJoint,
        group: "head",
        name: `earOuter${tag}`,
      },
    );

    // Plush snowy-cream front ear fluff rim
    b.extrude(
      [
        [-0.028, 0.0],
        [0.028, 0.0],
        [0.034, 0.028],
        [0.016, 0.06],
        [0, 0.072],
        [-0.016, 0.06],
        [-0.034, 0.028],
      ],
      {
        at: offset(earJoint.at, [s * 0.15, -0.1, 1], 0.007),
        x: [s * 0.72, -0.64, 0.22],
        y: earJoint.axis,
        thickness: [0.016, 0.006],
        smoothing: 0,
        color: CREAM,
        bone: earJoint,
        group: "head",
        name: `earInnerFluff${tag}`,
      },
    );

    // Long fluffy white ear-tip tuft
    b.spike(
      offset(earJoint.at, earJoint.axis, 0.065),
      [s * 0.78, 0.6, 0.15],
      0.036,
      0.015,
      {
        bone: earJoint,
        sides: 5,
        color: CREAM,
        group: "head",
        name: `earTipTuft${tag}`,
      },
    );
  }

  // Genshin Gold Filigree Cuff & Glowing Jade Drop on Left Ear
  b.part(new THREE.TorusGeometry(0.016, 0.0045, 5, 8), GOLD, {
    bone: earL,
    at: [0.108, 0.592, 0.268],
    rotation: [25, 35, -40],
    group: "head",
    name: "earGoldCuffL",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.009, 0), GLOW_EMERALD, {
      bone: earL,
      at: [0.118, 0.574, 0.272],
      scale: [0.75, 1.3, 0.75],
      group: "head",
      name: "earJadeDropL",
    }),
    1.5,
  );

  // =========================================================================
  // 6. GENSHIN IMPACT ORNATE GOLD FILIGREE COLLAR, CLOUD AMULET & SILK TASSEL
  // =========================================================================
  const chestBone = spine.joints[2];
  const collarLoop = catmull(
    [
      [0, 0.495, 0.225],
      [0.078, 0.455, 0.22],
      [0.062, 0.382, 0.242],
      [0, 0.362, 0.252],
      [-0.062, 0.382, 0.242],
      [-0.078, 0.455, 0.22],
    ],
    { closed: true },
  );

  // Royal Crimson Silk Collar Band + Gold Filigree Rim
  b.sweep(collarLoop, 0.016, {
    bone: chestBone,
    sides: 7,
    color: CRIMSON_SILK,
    group: "collar",
    name: "collarSilkBand",
  });
  const goldRimLoop = catmull(
    [
      [0, 0.498, 0.232],
      [0.082, 0.456, 0.226],
      [0.066, 0.38, 0.248],
      [0, 0.358, 0.258],
      [-0.066, 0.38, 0.248],
      [-0.082, 0.456, 0.226],
    ],
    { closed: true },
  );
  b.sweep(goldRimLoop, 0.0075, {
    bone: chestBone,
    sides: 6,
    color: GOLD,
    group: "collar",
    name: "collarGoldTrim",
  });

  // Lapis & Gold Cloud Scallop Petals around the collar
  for (const s of [1, -1] as const) {
    const tag = s > 0 ? "L" : "R";
    b.extrude(
      [
        [-0.025, 0],
        [0.025, 0],
        [0.032, -0.022],
        [0, -0.042],
        [-0.032, -0.022],
      ],
      {
        at: [s * 0.062, 0.398, 0.238],
        x: [s * 0.45, 0.1, 0.88],
        y: [s * 0.35, 0.92, -0.15],
        thickness: 0.01,
        smoothing: 0,
        color: LAPIS_SILK,
        bone: chestBone,
        group: "collar",
        name: `collarCloudLobe${tag}`,
      },
    );
    // Flanking Golden Spirit Bells
    b.part(new THREE.SphereGeometry(0.015, 6, 5), GOLD_LIGHT, {
      bone: chestBone,
      at: [s * 0.046, 0.366, 0.252],
      group: "collar",
      name: `collarBell${tag}`,
    });
  }

  // Front Adepti Gold Medallion + Glowing Dendro-Emerald Vision Gem
  b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.014, 8), GOLD, {
    bone: chestBone,
    at: [0, 0.362, 0.26],
    dir: [0, -0.25, 1],
    flat: true,
    group: "collar",
    name: "amuletGoldFrame",
  });
  b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.016, 8), JADE_SETTING, {
    bone: chestBone,
    at: [0, 0.361, 0.263],
    dir: [0, -0.25, 1],
    flat: true,
    group: "collar",
    name: "amuletJadeBezel",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.018, 0), GLOW_EMERALD, {
      bone: chestBone,
      at: [0, 0.36, 0.268],
      scale: [1, 1.15, 0.55],
      rotation: [-14, 0, 0],
      group: "collar",
      name: "amuletVisionGem",
    }),
    1.7,
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.01, 0), GLOW_MINT, {
      bone: chestBone,
      at: [0, 0.36, 0.273],
      scale: [0.85, 1, 0.55],
      rotation: [-14, 0, 0],
      group: "collar",
      name: "amuletVisionCore",
    }),
    2.0,
  );

  // Hanging Braided Crimson & Gold Silk Tassel (rides `tassel` hinge bone)
  b.part(new THREE.SphereGeometry(0.013, 6, 5), CRIMSON_SILK, {
    bone: tassel,
    at: [0, 0.338, 0.256],
    scale: [1.1, 0.85, 0.85],
    group: "collar",
    name: "tasselKnot",
  });
  b.lathe(
    [
      [0, 0],
      [0.014, 0],
      [0.016, 0.012],
      [0.011, 0.022],
      [0, 0.024],
    ],
    {
      at: [0, 0.312, 0.258],
      axis: [0, 1, -0.12],
      segments: 7,
      smoothing: 0,
      color: GOLD,
      bone: tassel,
      group: "collar",
      name: "tasselGoldCap",
    },
  );
  b.lathe(
    [
      [0, 0],
      [0.02, 0.004],
      [0.017, 0.036],
      [0.013, 0.06],
      [0, 0.064],
    ],
    {
      at: [0, 0.252, 0.266],
      axis: [0, 1, -0.12],
      segments: 7,
      smoothing: 0,
      color: CRIMSON_SILK,
      bone: tassel,
      group: "collar",
      name: "tasselSilkFringe",
    },
  );

  // Twin Flowing Lapis & Crimson Silk Ribbons Draped Over the Nape/Shoulders
  for (const s of [1, -1] as const) {
    const tag = s > 0 ? "L" : "R";
    const ribbonPath = bezier(
      [0, 0.495, 0.22],
      [s * 0.055, 0.505, 0.16],
      [s * 0.095, 0.465, 0.09],
      [s * 0.115, 0.415, 0.03],
    );
    b.sweep(ribbonPath, (t) => [0.016 * (1 - 0.35 * t), 0.005], {
      bone: chestBone,
      sides: 6,
      color: s > 0 ? CRIMSON_SILK : LAPIS_SILK,
      group: "collar",
      name: `napeRibbon${tag}`,
    });
  }

  // Ornate Gold Filigree Ring & Glowing Jade Spirit Beads around the Tail (`tail2`)
  const tailOrnamentJoint = tail.joints[1];
  const tailRingCenter = tailSweep.at(0.22, 0, 0).at;
  const tailRingTan = tailPath.tangentAt(0.22);
  b.part(new THREE.TorusGeometry(0.092, 0.009, 6, 10), GOLD, {
    bone: tailOrnamentJoint,
    at: tailRingCenter,
    dir: tailRingTan,
    axis: "z",
    group: "tail",
    name: "tailGoldFiligreeRing",
  });
  for (const [bi, ang] of [
    [0, 0],
    [1, 110],
    [2, 250],
  ] as const) {
    const beadPt = tailSweep.at(0.22, ang, 0.008);
    glow(
      b.part(new THREE.OctahedronGeometry(0.014, 0), GLOW_EMERALD, {
        bone: tailOrnamentJoint,
        at: beadPt.at,
        group: "tail",
        name: `tailSpiritBead${bi}`,
      }),
      1.5,
    );
  }

  // =========================================================================
  // 7. CEL-SHADED FUR CARDS (Cheeks, Scruff, Back Ridge & Tail Plume)
  // =========================================================================
  const bodySurface = b.surface([torsoSweep, tailSweep]);
  const bodyFurHits = bodySurface.scatter(42, {
    rng: rand,
    minDist: 0.045,
    filter: (h) => h.n.y > -0.1,
  });
  b.cards(bodyFurHits, RUFOUS_FUR_CARD, {
    size: [0.042, 0.062],
    lean: 58,
    bend: 24,
    vary: 0.25,
    spin: 20,
    rng: rand,
    group: "body",
    name: "coatFurCards",
  });

  // Snowy-cream fur cards on cheek ruffs and ear backs
  const creamFurFrames = [
    frame([0.088, 0.502, 0.312], [0.92, 0.1, -0.35], [0, 1, 0]),
    frame([-0.088, 0.502, 0.312], [-0.92, 0.1, -0.35], [0, 1, 0]),
    frame([0.082, 0.482, 0.316], [0.85, -0.25, -0.4], [0, 1, 0]),
    frame([-0.082, 0.482, 0.316], [-0.85, -0.25, -0.4], [0, 1, 0]),
    frame([0.095, 0.605, 0.265], [0.65, 0.72, -0.15], [0, 1, 0]),
    frame([-0.095, 0.605, 0.265], [-0.65, 0.72, -0.15], [0, 1, 0]),
  ];
  b.cards(creamFurFrames, CREAM_FUR_CARD, {
    size: [0.038, 0.055],
    lean: 28,
    bend: 18,
    vary: 0.15,
    rng: rand,
    bone: head,
    group: "head",
    name: "cheekEarFurCards",
  });

  return b.root;
}
