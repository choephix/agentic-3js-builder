import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { aim, DEG, rng, vec } from "../../../../src/math";
import type { V3 } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { cells, mix, mottle, noise, paint, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Kraken",
  description:
    "Overwatch-style colossal deep-sea kraken rising with spread tentacles, beveled chitin-armour plating, vibrant orange accents, and bioluminescent cyan abyssal organs.",
  style: "Overwatch",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------
// Overwatch Stylized Palette (Clean colour blocking + vibrant orange & cyan accents)
// ---------------------------------------------------------------------------
const ABYSS_INK = "#0f1726";
const ABYSS_NAVY = "#1b2b4a";
const ABYSS_BLUE = "#294370";
const ABYSS_SLATE = "#3d5a8a";
const TITAN_WHITE = "#dce6f2";
const TITAN_SILVER = "#9fb2c9";
const TITAN_GUNMETAL = "#253147";
const BELLY_CREAM = "#e2cfc2";
const BELLY_CORAL = "#c4877b";
const MAW_PLUM = "#522338";
const ACCENT_ORANGE = "#ff6b1a";
const ACCENT_AMBER = "#ffaa2b";
const BIO_CYAN = "#00f2ff";
const BIO_TEAL = "#12d6b5";
const BEAK_OBSIDIAN = "#191824";
const BEAK_HORN = "#38324a";
const SUCKER_RING = "#ebd8d0";

const KEY_DIR = new THREE.Vector3(0.35, 0.78, 0.52).normalize();

// ---------------------------------------------------------------------------
// Stylized Overwatch Paints (2048 paint sheet)
// ---------------------------------------------------------------------------

/** Mantle dorsal hide: stylized gradient shading, hex-chitin cellular facets, panel seams & orange chevron trim. */
const mantlePaint = paint((p, n, s) => {
  const [t, deg] = s;
  const absDeg = Math.min(deg, 360 - deg);
  const lit = smoothstep(-0.35, 0.65, n.dot(KEY_DIR));

  // Panel seam grooves along the mantle hood
  const ringSeam =
    Math.abs(t - 0.22) < 0.011 ||
    Math.abs(t - 0.46) < 0.011 ||
    Math.abs(t - 0.7) < 0.011 ||
    Math.abs(absDeg - 52) < 1.8 ||
    Math.abs(absDeg - 118) < 1.8;
  if (ringSeam) return ABYSS_INK;

  // Overwatch orange graphic chevron stripes across dorsal and lateral mantle
  const chevron = t - 0.0028 * absDeg;
  const inChevronA = Math.abs(chevron - 0.28) < 0.028 && absDeg < 95;
  const inChevronB = Math.abs(chevron - 0.54) < 0.024 && absDeg < 82;
  if (inChevronA || inChevronB) {
    return mix(ACCENT_ORANGE, ACCENT_AMBER, lit * 0.45);
  }

  // Ventral plastron (front-underside of mantle hood, around deg 140..220)
  if (absDeg > 125) {
    const ribWave = Math.sin(t * 38) * 0.5 + 0.5;
    if (ribWave < 0.14) return TITAN_GUNMETAL;
    const plastronBase = mix(BELLY_CORAL, BELLY_CREAM, smoothstep(125, 165, absDeg));
    return mix(plastronBase, TITAN_WHITE, lit * 0.35);
  }

  // Subtle hex/cellular chitin texture + bioluminescent lateral speckles
  const c = cells(p, 0.16, 17);
  const cellEdge = smoothstep(0.04, 0.14, c.d2 - c.d1);
  if (absDeg > 78 && absDeg < 114 && c.d1 < 0.22 && c.id > 0.62) {
    return mix(BIO_TEAL, BIO_CYAN, smoothstep(0.22, 0.05, c.d1));
  }

  const heightFade = smoothstep(1.5, 3.6, p.y);
  const dorsalBase = mix(ABYSS_NAVY, ABYSS_BLUE, lit * 0.7 + heightFade * 0.3);
  constfaceted = mix(ABYSS_INK, dorsalBase, 0.35 + 0.65 * cellEdge);
  return mix(constfaceted, ABYSS_SLATE, smoothstep(0.6, 0.95, lit) * 0.35);
});

/** Ceramic-chitin white/silver Overwatch armor plates with gunmetal bevel borders & orange hazard tips. */
const armorPlatePaint = paint((p, n, s) => {
  const [x, y] = s;
  const lit = smoothstep(-0.2, 0.75, n.dot(KEY_DIR));
  const radial = Math.hypot(x, y);
  // Recessed tech-organic panel line
  if (Math.abs(y - 0.06) < 0.008 || Math.abs(Math.abs(x) - 0.14) < 0.007) {
    return TITAN_GUNMETAL;
  }
  // Vibrant orange tip/trim band
  if (y > 0.19 && y < 0.25) {
    return mix(ACCENT_ORANGE, ACCENT_AMBER, lit * 0.5);
  }
  const base = mix(TITAN_SILVER, TITAN_WHITE, lit * 0.8 + smoothstep(0.4, 0.0, radial) * 0.2);
  const mott = noise(p, 0.25, 31);
  return mix(base, "#ffffff", smoothstep(0.55, 0.9, mott) * 0.2);
});

/** Tentacle sweep paint: dorsal navy with orange/teal rings, lateral coral serrated edge, cream ventral sucker bed. */
const tentaclePaint = paint((p, n, s) => {
  const [t, deg] = s;
  const absDeg = Math.min(deg, 360 - deg);
  const lit = smoothstep(-0.3, 0.7, n.dot(KEY_DIR));

  // Ventral muscular sucker-bed side (around 180 deg)
  const wave = 12 * Math.sin(t * 42);
  if (absDeg > 118 + wave) {
    const groove = Math.abs(absDeg - 180) < 8 ? 0.82 : 1.0;
    const belly = mix(BELLY_CORAL, BELLY_CREAM, smoothstep(118, 152, absDeg) * groove);
    return mix(belly, BEAK_OBSIDIAN, smoothstep(0.86, 0.99, t) * 0.55);
  }

  // Crisp dark border line between dorsal armor and ventral flesh
  if (Math.abs(absDeg - (115 + wave)) < 4.5) {
    return ABYSS_INK;
  }

  // Segmented armor rings and glowing/orange bands along the tentacle length
  const bandPhase = (t * 11.5) % 1;
  if (Math.abs(bandPhase - 0.5) < 0.045) {
    return ABYSS_INK;
  }
  if (bandPhase > 0.545 && bandPhase < 0.69 && t > 0.12 && t < 0.88) {
    const isOrange = Math.floor(t * 11.5) % 2 === 0;
    return isOrange ? mix(ACCENT_ORANGE, ACCENT_AMBER, lit * 0.5) : mix(BIO_TEAL, BIO_CYAN, 0.45);
  }

  // Cellular scales on dorsal tentacle surface
  const c = cells(p, 0.12, 43);
  const shade = mix(ABYSS_NAVY, ABYSS_BLUE, lit * 0.75 + (c.id - 0.5) * 0.2);
  const tipDark = mix(shade, ABYSS_INK, smoothstep(0.75, 0.98, t) * 0.65);
  return c.d2 - c.d1 < 0.08 ? ABYSS_INK : tipDark;
});

/** Inter-brachial webbing membrane paint: stretched coral-navy skin with glowing radial veins and orange rim. */
const membranePaint = paint((p, n, s) => {
  const [along, across] = s;
  const lit = smoothstep(-0.3, 0.6, n.dot(KEY_DIR));
  const arch = Math.sin(across * Math.PI);
  const effAlong = along + 0.12 * arch;

  // Trailing edge trim
  if (effAlong > 0.88) return ABYSS_INK;
  if (effAlong > 0.77 && effAlong <= 0.88) {
    return mix(ACCENT_ORANGE, ACCENT_AMBER, lit * 0.4);
  }

  // Radial vein striations
  const vein = Math.abs(Math.sin(across * Math.PI * 6 + noise(p, 0.18, 9) * 1.4));
  if (vein < 0.11 && effAlong > 0.2) {
    return mix(BIO_TEAL, BIO_CYAN, smoothstep(0.2, 0.8, effAlong) * 0.6);
  }

  const base = mix(ABYSS_NAVY, BELLY_CORAL, smoothstep(0.15, 0.75, effAlong) * 0.65);
  return mix(base, ABYSS_BLUE, lit * 0.35);
});

/** Lateral hydro-foil fin paint: armoured leading edge, glowing energy ribs, orange wingtip stripe. */
const finPaint = paint((_p, n, s) => {
  const [u, v] = s;
  const lit = smoothstep(-0.2, 0.75, n.dot(KEY_DIR));
  // Leading edge ceramic armor
  if (v > 0.14) {
    return mix(TITAN_SILVER, TITAN_WHITE, lit * 0.75);
  }
  if (Math.abs(v - 0.13) < 0.014) return ABYSS_INK;
  // Orange chevron near wingtip
  if (u > 0.58 && u < 0.74) {
    return mix(ACCENT_ORANGE, ACCENT_AMBER, lit * 0.5);
  }
  // Glowing fin rays
  const ray = Math.abs(Math.sin((u * 9.5 - v * 2.5) * Math.PI));
  if (ray < 0.14 && u > 0.12) {
    return mix(BIO_TEAL, BIO_CYAN, 0.5);
  }
  return mix(ABYSS_NAVY, ABYSS_SLATE, lit * 0.65);
});

/** Chitinous beak paint: striated obsidian-to-horn gradient with orange/amber stress ridges. */
const beakPaint = mottle(BEAK_OBSIDIAN, BEAK_HORN, { size: 0.12, contrast: 1.6, seed: 71 });

// ---------------------------------------------------------------------------
// SVG Textures (Decals & Double-Sided Fin Cards)
// ---------------------------------------------------------------------------

/** Fierce Overwatch cephalopod eye decal: angular dark socket, glowing cyan W-pupil, gold iris ring, crisp highlights. */
const EYE_DECAL_TEX = svg(
  `<svg viewBox="0 0 128 96">
    <path d="M8 52 Q32 14 72 16 Q108 18 122 46 Q98 82 58 82 Q24 82 8 52 Z" fill="${ABYSS_INK}" stroke="${TITAN_SILVER}" stroke-width="3"/>
    <ellipse cx="66" cy="49" rx="40" ry="27" fill="#062c3d"/>
    <ellipse cx="66" cy="49" rx="35" ry="23" fill="${BIO_CYAN}"/>
    <ellipse cx="66" cy="49" rx="28" ry="18" fill="${ACCENT_AMBER}"/>
    <ellipse cx="66" cy="49" rx="22" ry="14" fill="${BIO_TEAL}"/>
    <!-- Stylized cephalopod W-shaped horizontal slit pupil -->
    <path d="M36 46 Q48 58 58 48 Q66 40 74 48 Q84 58 96 46 Q86 64 74 56 Q66 50 58 56 Q46 64 36 46 Z" fill="${ABYSS_INK}"/>
    <!-- Overwatch angular brow & tech-organic iris ticks -->
    <path d="M12 36 L52 14 L116 24 L106 33 L52 24 L18 44 Z" fill="${ACCENT_ORANGE}"/>
    <circle cx="48" cy="36" r="6.5" fill="#ffffff"/>
    <circle cx="82" cy="58" r="3.5" fill="#ffffff"/>
  </svg>`,
  { size: 512 },
);

/** Dorsal mantle crest emblem decal: stylized abyssal titan chevron & glowing core rune. */
const MANTLE_EMBLEM_TEX = svg(
  `<svg viewBox="0 0 128 160">
    <polygon points="64,8 118,54 102,146 64,124 26,146 10,54" fill="${TITAN_GUNMETAL}" stroke="${TITAN_WHITE}" stroke-width="5"/>
    <polygon points="64,22 104,58 92,128 64,110 36,128 24,58" fill="${ABYSS_NAVY}" stroke="${ACCENT_ORANGE}" stroke-width="5"/>
    <polygon points="64,38 88,64 64,100 40,64" fill="${ACCENT_ORANGE}"/>
    <polygon points="64,48 78,64 64,88 50,64" fill="${BIO_CYAN}"/>
    <circle cx="64" cy="66" r="7" fill="#ffffff"/>
    <path d="M22 78 L44 92 M106 78 L84 92 M28 98 L48 110 M100 98 L80 110" stroke="${BIO_CYAN}" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  { size: 512 },
);

/** Double-sided serrated bio-fin card texture for tentacle dorsal crests and collar frills. */
const FIN_CREST_CARD_TEX = svg(
  `<svg viewBox="0 0 96 128">
    <path d="M8 126 C10 82 22 36 48 6 C62 34 74 24 86 16 C78 52 84 88 88 126 Z" fill="${ABYSS_NAVY}" stroke="${ABYSS_INK}" stroke-width="4"/>
    <path d="M16 122 C20 84 30 44 48 16 C58 38 68 32 78 26 C72 58 76 90 80 122 Z" fill="${ABYSS_SLATE}"/>
    <path d="M48 14 L34 122 M62 28 L52 122 M76 26 L68 122" stroke="${ACCENT_ORANGE}" stroke-width="5" stroke-linecap="round"/>
    <circle cx="44" cy="48" r="6" fill="${BIO_CYAN}"/>
    <circle cx="58" cy="68" r="5" fill="${BIO_CYAN}"/>
    <circle cx="40" cy="88" r="5.5" fill="${ACCENT_AMBER}"/>
  </svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------
// Main Builder
// ---------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "kraken", detail: 0.9, paintSize: 2048 });
  const rand = rng(42);

  // =========================================================================
  // 1. SKELETON: Root, Spine/Mantle, Head, Split Beak Jaws, Lateral Fins
  // =========================================================================
  const core = b.joint("core", { at: [0, 0.72, 0], dir: [0, 1, 0], role: "spine", group: "body" });

  const spinePath = catmull([
    [0, 0.72, 0.0],
    [0, 1.24, 0.08],
    [0, 1.78, 0.06],
    [0, 2.38, -0.08],
    [0, 3.02, -0.26],
    [0, 3.62, -0.44],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: core,
    names: ["spine1", "spine2", "spine3", "spine4", "spine5"],
    role: "spine",
    group: "mantle",
  });

  // Neck & Head protruding forward (+Z) below the mantle collar
  const neck = b.joint("neck", {
    parent: spine.joints[1],
    at: [0, 1.32, 0.16],
    dir: [0, 0.08, 1],
    role: "neck",
    group: "head",
  });
  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.36, 0.42],
    dir: [0, 0.04, 1],
    role: "head",
    group: "head",
  });

  // Separate Upper and Lower Jaw (Beak) joints so the mouth can open and close
  const jawUpper = b.joint("jawUpper", {
    parent: head,
    at: [0, 1.12, 0.56],
    dir: [0, -0.18, 1],
    role: "jaw",
    group: "mouth",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.92, 0.5],
    dir: [0, -0.48, 1],
    role: "jaw",
    group: "mouth",
  });

  // Articulated Brow Shields & Mantle Gill-Collar Flaps
  const browL = b.joint("browL", {
    parent: head,
    at: [0.38, 1.54, 0.48],
    dir: [0.45, 0.35, 0.82],
    role: "hinge",
    group: "head",
  });
  const browR = b.joint("browR", {
    parent: head,
    at: [-0.38, 1.54, 0.48],
    dir: [-0.45, 0.35, 0.82],
    role: "hinge",
    group: "head",
  });
  const collarFlapL = b.joint("collarFlapL", {
    parent: spine.joints[2],
    at: [0.58, 1.78, 0.12],
    dir: [0.85, -0.25, 0.45],
    role: "hinge",
    group: "mantle",
  });
  const collarFlapR = b.joint("collarFlapR", {
    parent: spine.joints[2],
    at: [-0.58, 1.78, 0.12],
    dir: [-0.85, -0.25, 0.45],
    role: "hinge",
    group: "mantle",
  });

  // Lateral Mantle Stabilizer Fins (Left & Right)
  const finChains: Record<"L" | "R", ReturnType<typeof b.chain>> = {} as Record<"L" | "R", ReturnType<typeof b.chain>>;
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const fPath = catmull([
      [s * 0.44, 2.74, -0.18],
      [s * 0.84, 2.96, -0.28],
      [s * 1.22, 3.24, -0.42],
      [s * 1.48, 3.52, -0.58],
    ]);
    finChains[side] = b.chain(`fin${side}`, fPath, {
      parent: spine.joints[3],
      names: [`fin${side}1`, `fin${side}2`, `fin${side}3`],
      role: "wing",
      group: `fin${side}`,
    });
  }

  // =========================================================================
  // 2. 8 SPREAD MAIN TENTACLES + 2 RAPTORIAL FEEDING CLUB TENTACLES
  // =========================================================================
  type TentacleSpec = {
    name: string;
    azDeg: number;
    reachScale: number;
    tipHeight: number;
    curlDeg: number;
    twistDeg: number;
  };

  // Ordered counter-clockwise / paired cleanly on L (+X) and R (-X) so every joint stays strictly on its side
  const tentacleSpecs: TentacleSpec[] = [
    { name: "tentacleFL", azDeg: 22, reachScale: 1.04, tipHeight: 1.18, curlDeg: 18, twistDeg: 28 },
    { name: "tentacleML", azDeg: 66, reachScale: 1.08, tipHeight: 1.06, curlDeg: 14, twistDeg: 22 },
    { name: "tentacleBL", azDeg: 112, reachScale: 1.05, tipHeight: 0.98, curlDeg: -12, twistDeg: -20 },
    { name: "tentacleRL", azDeg: 156, reachScale: 0.98, tipHeight: 0.92, curlDeg: -18, twistDeg: -26 },
    { name: "tentacleRR", azDeg: -156, reachScale: 0.98, tipHeight: 0.92, curlDeg: 18, twistDeg: 26 },
    { name: "tentacleBR", azDeg: -112, reachScale: 1.05, tipHeight: 0.98, curlDeg: 12, twistDeg: 20 },
    { name: "tentacleMR", azDeg: -66, reachScale: 1.08, tipHeight: 1.06, curlDeg: -14, twistDeg: -22 },
    { name: "tentacleFR", azDeg: -22, reachScale: 1.04, tipHeight: 1.18, curlDeg: -18, twistDeg: -28 },
  ];

  const builtTentacles: Array<{
    spec: TentacleSpec;
    path: ReturnType<typeof catmull>;
    chain: ReturnType<typeof b.chain>;
    sweep: ReturnType<typeof b.sweep>;
  }> = [];

  for (const spec of tentacleSpecs) {
    const az = spec.azDeg * DEG;
    const curl = spec.curlDeg * DEG;
    const pt = (r: number, y: number, dAz = 0): V3 => [
      r * spec.reachScale * Math.sin(az + dAz),
      y,
      r * spec.reachScale * Math.cos(az + dAz),
    ];

    // Knots 2 and 3 plant the muscular arch directly onto y = 0 (y = ry at those stations)
    const tPath = catmull([
      pt(0.38, 0.68, 0),
      pt(0.82, 0.25, curl * 0.15),
      pt(1.16, 0.145, curl * 0.3),
      pt(1.46, 0.125, curl * 0.45),
      pt(1.74, 0.36, curl * 0.65),
      pt(1.94, 0.78, curl * 0.85),
      pt(1.84, spec.tipHeight, curl * 1.05),
    ]);

    const tChain = b.chain(spec.name, tPath, {
      parent: core,
      count: 6,
      role: "tentacle",
      twist: spec.twistDeg,
      group: spec.name,
    });

    const tRadius = (t: number): [number, number] => {
      const rx = 0.21 * (1 - t) ** 1.15 + 0.022;
      const ry = 0.19 * (1 - t) ** 1.18 + 0.022;
      return [rx, ry];
    };

    const tSweep = b.sweep(tChain, tRadius, {
      color: tentaclePaint,
      sides: 8,
      caps: { start: "flat", end: "point" },
      group: spec.name,
      name: `sweep.${spec.name}`,
    });

    builtTentacles.push({ spec, path: tPath, chain: tChain, sweep: tSweep });
  }

  // 2 Long Raptorial Feeding Tentacles (Whip Clubs) rearing high in front-left & front-right
  const builtWhips: Array<{
    side: "L" | "R";
    sign: 1 | -1;
    chain: ReturnType<typeof b.chain>;
    sweep: ReturnType<typeof b.sweep>;
  }> = [];

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const name = `whip${side}`;
    const wPath = catmull([
      [s * 0.32, 0.86, 0.34],
      [s * 0.72, 0.56, 0.72],
      [s * 1.12, 0.58, 1.04],
      [s * 1.48, 0.88, 1.24],
      [s * 1.68, 1.32, 1.32],
      [s * 1.56, 1.74, 1.22],
      [s * 1.32, 2.02, 1.06],
      [s * 1.14, 2.14, 0.94],
    ]);

    const wChain = b.chain(name, wPath, {
      parent: core,
      count: 7,
      role: "tentacle",
      twist: s * 35,
      group: name,
    });

    // Slender muscular stalk that flares at t = 0.72..0.92 into a wide raptorial strike club
    const wRadius = (t: number): [number, number] => {
      const club = Math.exp(-(((t - 0.83) / 0.09) ** 2));
      const baseR = 0.11 * (1 - 0.65 * t) + 0.018;
      return [baseR + 0.095 * club, baseR * 0.88 + 0.032 * club];
    };

    const wSweep = b.sweep(wChain, wRadius, {
      color: tentaclePaint,
      sides: 8,
      caps: { start: "flat", end: "point" },
      group: name,
      name: `sweep.${name}`,
    });

    builtWhips.push({ side, sign: s, chain: wChain, sweep: wSweep });
  }

  // =========================================================================
  // 3. CENTRAL BASAL PEDICLE SKIRT & GROUNDED ROOT BUTTRESSES (y = 0 contact)
  // =========================================================================
  // Sculpted muscular pedicle column sitting squarely on y = 0.000
  b.lathe(
    [
      [0, 0.0],
      [0.58, 0.0],
      [0.64, 0.09],
      [0.54, 0.28],
      [0.48, 0.56],
      [0.56, 0.84],
      [0, 0.9],
    ],
    {
      at: [0, 0, 0],
      bone: core,
      segments: 12,
      smoothing: 1,
      color: mantlePaint,
      group: "body",
      name: "pedicleBase",
    },
  );

  // Armored Overwatch base ring around the pedicle collar
  b.lathe(
    [
      [0.46, 0.52],
      [0.59, 0.56],
      [0.61, 0.72],
      [0.49, 0.78],
    ],
    {
      at: [0, 0, 0],
      bone: core,
      segments: 12,
      color: armorPlatePaint,
      group: "body",
      name: "pedicleArmorRing",
    },
  );

  // =========================================================================
  // 4. INTER-BRACHIAL WEBBING MEMBRANES BETWEEN ALL 8 MAIN TENTACLES
  // =========================================================================
  for (let i = 0; i < builtTentacles.length; i++) {
    const curr = builtTentacles[i];
    const next = builtTentacles[(i + 1) % builtTentacles.length];
    const edgeA = curr.path.slice(0.02, 0.31);
    const edgeB = next.path.slice(0.02, 0.31);
    b.membrane(edgeA, edgeB, {
      color: membranePaint,
      thickness: 0.022,
      rows: 4,
      cols: 5,
      scallop: 0.22,
      bone: core,
      group: "webbing",
      name: `web.${curr.spec.name}`,
    });
  }

  // =========================================================================
  // 5. TOWERING MANTLE HOOD, CHITIN ARMOR PLATES, KEEL & LATERAL FINS
  // =========================================================================
  const mantleStations = [
    { at: [0, 1.22, 0.08], w: 0.92, h: 0.86 },
    { at: [0, 1.68, 0.08], w: 1.18, h: 1.08 },
    { at: [0, 2.18, -0.02], w: 1.44, h: 1.32 },
    { at: [0, 2.66, -0.15], w: 1.34, h: 1.22 },
    { at: [0, 3.12, -0.3], w: 0.96, h: 0.9 },
    { at: [0, 3.48, -0.41], w: 0.48, h: 0.46 },
    { at: [0, 3.72, -0.49], w: 0.12, h: 0.12 },
  ];
  const mantleLoft = b.loft(mantleStations, {
    bone: spine,
    color: mantlePaint,
    sides: 12,
    caps: { start: "round", end: "point" },
    group: "mantle",
    name: "mantleHood",
  });

  // Project the Overwatch Abyssal Crest Emblem decal onto the front-upper mantle
  b.decal(mantleLoft, MANTLE_EMBLEM_TEX, {
    at: [0, 2.48, 0.56],
    dir: [0, 0.18, 1],
    up: [0, 1, 0],
    size: [0.68, 0.85],
    group: "mantle",
    name: "mantleEmblemDecal",
  });

  // Flared Chitinous Mantle Collar Rim & Glowing Gill Vents
  const collarPts: V3[] = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    const rx = 0.66 + 0.06 * Math.cos(a * 2);
    const rz = 0.6 + 0.05 * Math.sin(a);
    const dy = 0.08 * Math.cos(a);
    return [rx * Math.sin(a), 1.72 + dy, 0.06 + rz * Math.cos(a)];
  });
  b.sweep(catmull(collarPts, { closed: true }), [0.065, 0.048], {
    bone: spine.joints[2],
    color: armorPlatePaint,
    sides: 8,
    group: "mantle",
    name: "mantleCollarRim",
  });

  // Orange accent trim ring right under the mantle collar
  const collarTrimPts: V3[] = collarPts.map(([x, y, z]) => [x * 0.97, y - 0.055, z * 0.97]);
  b.sweep(catmull(collarTrimPts, { closed: true }), 0.024, {
    bone: spine.joints[2],
    color: ACCENT_ORANGE,
    sides: 6,
    group: "mantle",
    name: "mantleCollarOrangeTrim",
  });

  // Articulated Gill-Vent Cowls on collarFlapL and collarFlapR with glowing cyan gill bars
  const cowlOutline: OutlinePoint[] = [
    [-0.16, -0.22],
    [0.18, -0.18],
    [0.24, 0.06],
    [0.12, 0.26, "sharp"],
    [-0.14, 0.2],
  ];
  for (const s of [1, -1] as const) {
    const flapJoint = s > 0 ? collarFlapL : collarFlapR;
    const side = s > 0 ? "L" : "R";
    b.extrude(cowlOutline, {
      at: flapJoint.at,
      x: [0, 0, 1],
      y: [s * 0.25, 1, 0],
      thickness: [0.045, 0.018],
      bevel: 0.012,
      smoothing: 1,
      bone: flapJoint,
      color: armorPlatePaint,
      group: "mantle",
      name: `collarCowl${side}`,
    });

    // 3 self-lit bioluminescent gill bars tucked under each collar cowl
    for (let g = 0; g < 3; g++) {
      const gy = 1.64 + g * 0.09;
      const gz = 0.04 + g * 0.05;
      glow(
        b.capsule([s * 0.53, gy, gz], [s * 0.58, gy + 0.04, gz + 0.14], 0.018, BIO_CYAN, {
          bone: flapJoint,
          sides: 6,
          group: "mantle",
          name: `gillGlow${side}.${g}`,
        }),
        1.6,
      );
    }
  }

  // 5 Overlapping Tiered Dorsal Chitin Carapace Shields along the back of the mantle
  const shieldOutline: OutlinePoint[] = [
    [-0.36, -0.12],
    [-0.22, -0.22],
    [0, -0.26, "sharp"],
    [0.22, -0.22],
    [0.36, -0.12],
    [0.28, 0.16],
    [0, 0.28, "sharp"],
    [-0.28, 0.16],
  ];
  const shieldTs = [0.22, 0.37, 0.52, 0.67, 0.81];
  shieldTs.forEach((t, idx) => {
    const dorsalPt = mantleLoft.at(t, 0, 0.025);
    const scale = 1.08 - idx * 0.13;
    const scaledOutline: OutlinePoint[] = shieldOutline.map((pt) =>
      pt.length === 3 ? [pt[0] * scale, pt[1] * scale, "sharp"] : [pt[0] * scale, pt[1] * scale],
    );
    b.extrude(scaledOutline, {
      at: dorsalPt,
      x: [1, 0, 0],
      y: dorsalPt.tangent,
      thickness: [0.048 * scale, 0.016 * scale],
      bevel: 0.014,
      smoothing: 1,
      color: armorPlatePaint,
      group: "mantle",
      name: `dorsalShield.${idx}`,
    });

    // Glowing cyan energy core node + dorsal spine at each carapace shield
    const spineBase = dorsalPt.moved([0, 0.03 * scale, 0]);
    b.spike(spineBase, dorsalPt.n, 0.22 * scale, 0.055 * scale, ACCENT_ORANGE, {
      sides: 6,
      group: "mantle",
      name: `dorsalSpine.${idx}`,
    });
    glow(
      b.part(new THREE.OctahedronGeometry(0.042 * scale, 0), BIO_CYAN, {
        at: dorsalPt.moved([0, 0.045 * scale, -0.06 * scale]),
        group: "mantle",
        name: `dorsalCoreGlow.${idx}`,
      }),
      1.5,
    );
  });

  // Lateral Photophore Rows & Chitin Shoulder Ribs along both sides of the mantle hood
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    for (let k = 0; k < 5; k++) {
      const t = 0.2 + k * 0.14;
      const flankHit = mantleLoft.at(t, s * 72, 0.01);
      // Dark gunmetal socket ring
      b.stick(new THREE.CylinderGeometry(0.058, 0.068, 0.028, 6), TITAN_GUNMETAL, flankHit, {
        embed: 0.4,
        group: "mantle",
        name: `photophoreBezel${side}.${k}`,
      });
      // Glowing cyan photophore lens
      glow(
        b.stick(new THREE.SphereGeometry(0.042, 6, 4), BIO_CYAN, flankHit.moved([0, 0.012, 0]), {
          embed: 0.2,
          group: "mantle",
          name: `photophoreLens${side}.${k}`,
        }),
        1.6,
      );
    }
  }

  // Ventral Chest Abyssal Core Reactor (Front of the Mantle above the Head)
  const chestHit = mantleLoft.at(0.36, 180, 0.015);
  b.lathe(
    [
      [0, 0],
      [0.24, 0],
      [0.26, 0.04],
      [0.19, 0.075],
      [0.14, 0.035],
      [0, 0.035],
    ],
    {
      at: chestHit,
      axis: chestHit.n,
      segments: 8,
      color: armorPlatePaint,
      group: "mantle",
      name: "chestReactorBezel",
    },
  );
  glow(
    b.stick(new THREE.OctahedronGeometry(0.12, 1), BIO_CYAN, chestHit.moved([0, 0.03, 0]), {
      embed: 0.35,
      group: "mantle",
      name: "chestReactorCore",
    }),
    1.8,
  );

  // Pair of Hydro-Dynamic Lateral Mantle Fins (finL, finR)
  const finBladeOutline: OutlinePoint[] = [
    [0, -0.22],
    [0.38, -0.34],
    [0.82, -0.24],
    [1.12, 0.06, "sharp"],
    [0.76, 0.24],
    [0.26, 0.22],
  ];
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const fChain = finChains[side];

    // Thick armoured leading-edge strut swept along the fin chain
    b.sweep(fChain, [0.11, 0.028], {
      color: armorPlatePaint,
      sides: 6,
      caps: { start: "round", end: "point" },
      group: `fin${side}`,
      name: `finStrut${side}`,
    });

    // Main sculpted hydro-foil blade
    const finPart = b.extrude(finBladeOutline, {
      at: fChain.joints[0].at,
      x: [s * 0.82, 0.44, -0.36],
      y: [0, 0.42, 0.91],
      thickness: [0.055, 0.012],
      bevel: 0.012,
      smoothing: 1,
      bone: fChain.joints[1],
      color: finPaint,
      group: `fin${side}`,
      name: `finBlade${side}`,
    });

    // 3 Glowing propulsion nodes along the fin trailing edge
    for (let j = 0; j < 3; j++) {
      const u = 0.28 + j * 0.28;
      const nodePos = finPart.local([u, -0.18 + j * 0.06, 0]);
      glow(
        b.part(new THREE.SphereGeometry(0.038, 6, 4), BIO_CYAN, {
          at: nodePos,
          bone: fChain.joints[Math.min(j, 2)],
          group: `fin${side}`,
          name: `finThrusterGlow${side}.${j}`,
        }),
        1.5,
      );
    }
  }

  // =========================================================================
  // 6. CEPHALOPOD HEAD, FIERCE OVERWATCH EYES, BROW SHIELDS & CIRRI
  // =========================================================================
  const headStations = [
    { at: [0, 1.32, 0.14], w: 0.88, h: 0.68 },
    { at: [0, 1.38, 0.38], w: 1.02, h: 0.74 },
    { at: [0, 1.34, 0.62], w: 0.82, h: 0.62 },
    { at: [0, 1.24, 0.78], w: 0.46, h: 0.42 },
  ];
  const headLoft = b.loft(headStations, {
    bone: head,
    color: mantlePaint,
    sides: 10,
    caps: "round",
    group: "head",
    name: "headCranium",
  });

  // Central Nasal / Forehead Chitin Crest Shield
  const foreheadOutline: OutlinePoint[] = [
    [-0.22, -0.16],
    [0, -0.26, "sharp"],
    [0.22, -0.16],
    [0.28, 0.14],
    [0, 0.28, "sharp"],
    [-0.28, 0.14],
  ];
  b.extrude(foreheadOutline, {
    at: [0, 1.56, 0.62],
    x: [1, 0, 0],
    y: [0, 0.78, -0.62],
    thickness: [0.045, 0.018],
    bevel: 0.012,
    smoothing: 1,
    bone: head,
    color: armorPlatePaint,
    group: "head",
    name: "foreheadCrestPlate",
  });

  // Sculpted Ocular Lobes, Glowing Eyes, Decal Irises & Hinged Brow Crests
  const browShieldOutline: OutlinePoint[] = [
    [-0.18, -0.06],
    [0.22, -0.08],
    [0.36, 0.08, "sharp"],
    [0.08, 0.16],
    [-0.22, 0.08],
  ];

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const browJoint = s > 0 ? browL : browR;

    // Muscular lateral ocular bulge
    const eyeCenter: V3 = [s * 0.46, 1.38, 0.5];
    const eyeGaze: V3 = [s * 0.58, 0.04, 0.81];
    const lobe = b.part(new THREE.SphereGeometry(0.22, 10, 8), mantlePaint, {
      bone: head,
      at: [s * 0.38, 1.38, 0.44],
      scale: [1.1, 0.88, 1.05],
      group: "head",
      name: `ocularLobe${side}`,
    });

    // Dark gunmetal orbital socket rim
    b.lathe(
      [
        [0.09, 0],
        [0.165, 0.01],
        [0.155, 0.055],
        [0.11, 0.06],
      ],
      {
        at: eyeCenter,
        axis: eyeGaze,
        segments: 10,
        bone: head,
        color: TITAN_GUNMETAL,
        group: "head",
        name: `eyeSocketRim${side}`,
      },
    );

    // Self-lit glowing cyan eyeball
    glow(
      b.part(new THREE.SphereGeometry(0.132, 10, 8), BIO_CYAN, {
        bone: head,
        at: eyeCenter,
        dir: eyeGaze,
        scale: [1, 0.85, 0.95],
        group: "head",
        name: `eyeGlobeGlow${side}`,
      }),
      1.4,
    );

    // Conformed Overwatch cephalopod eye decal over the ocular lobe
    b.decal([lobe, headLoft], EYE_DECAL_TEX, {
      at: [s * 0.48, 1.39, 0.56],
      dir: eyeGaze,
      up: [0, 1, 0],
      size: [0.3, 0.22],
      mirror: s < 0,
      bone: head,
      group: "head",
      name: `eyeDecal${side}`,
    });

    // Articulated Heavy Brow Shield on browL / browR
    b.extrude(browShieldOutline, {
      at: browJoint.at,
      x: [s * 0.65, 0.15, -0.74],
      y: [s * 0.3, 0.92, 0.24],
      thickness: [0.045, 0.016],
      bevel: 0.012,
      smoothing: 1,
      bone: browJoint,
      color: armorPlatePaint,
      group: "head",
      name: `browShield${side}`,
    });

    // Swept orange/silver horn crest extending back from the brow
    b.sweep(
      bezier(
        browJoint.at,
        [s * 0.58, 1.66, 0.32],
        [s * 0.68, 1.82, 0.08],
        [s * 0.62, 1.98, -0.14],
      ),
      [0.055, 0.01],
      {
        bone: browJoint,
        bands: [
          [0.65, TITAN_WHITE],
          [1.0, ACCENT_ORANGE],
        ],
        sides: 6,
        caps: { start: "round", end: "point" },
        group: "head",
        name: `browHorn${side}`,
      },
    );

    // Sensory cheek cirri (curled feeler tendrils beside the jaws)
    const cirrusPath = bezier(
      [s * 0.38, 1.18, 0.62],
      [s * 0.56, 1.06, 0.78],
      [s * 0.64, 0.92, 0.72],
      [s * 0.54, 0.84, 0.62],
    );
    b.sweep(cirrusPath, [0.036, 0.008], {
      bone: head,
      color: ACCENT_ORANGE,
      sides: 6,
      caps: { start: "round", end: "point" },
      group: "head",
      name: `cheekCirrus${side}`,
    });
    glow(
      b.part(new THREE.SphereGeometry(0.022, 6, 4), BIO_CYAN, {
        bone: head,
        at: [s * 0.54, 0.84, 0.62],
        group: "head",
        name: `cirrusTipGlow${side}`,
      }),
      1.6,
    );
  }

  // =========================================================================
  // 7. GAPING SPLIT CHITINOUS BEAK (UPPER & LOWER JAWS) & GLOWING MAW
  // =========================================================================
  // Muscular buccal lip ring around the mouth opening
  b.lathe(
    [
      [0.18, 0],
      [0.36, 0.02],
      [0.38, 0.14],
      [0.24, 0.22],
    ],
    {
      at: [0, 1.04, 0.48],
      axis: [0, -0.15, 1],
      segments: 10,
      bone: head,
      color: MAW_PLUM,
      group: "mouth",
      name: "buccalLipRing",
    },
  );

  // Self-lit bioluminescent abyssal gullet / throat core inside the open beak
  glow(
    b.part(new THREE.SphereGeometry(0.18, 8, 6), BIO_CYAN, {
      bone: head,
      at: [0, 1.04, 0.52],
      scale: [0.95, 0.9, 0.85],
      group: "mouth",
      name: "mawThroatGlow",
    }),
    1.8,
  );

  // Upper Hooked Rostrum Beak (on jawUpper joint)
  const upperBeakProfile: OutlinePoint[] = [
    [0, -0.06, "sharp"],
    [0.28, 0.02],
    [0.42, -0.14, "sharp"],
    [0.24, 0.16],
    [0, 0.22],
  ];
  b.extrude(upperBeakProfile, {
    at: [0, 1.14, 0.54],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: [0.28, 0.04],
    bevel: 0.015,
    smoothing: 1,
    bone: jawUpper,
    color: beakPaint,
    group: "mouth",
    name: "upperBeakRostrum",
  });

  // Lateral cheek shear plates + 6 upper radula teeth on jawUpper
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.sweep(
      bezier([s * 0.16, 1.18, 0.52], [s * 0.14, 1.15, 0.74], [0, 1.01, 0.94]),
      [0.065, 0.012],
      {
        bone: jawUpper,
        color: BEAK_OBSIDIAN,
        sides: 6,
        caps: { start: "round", end: "point" },
        group: "mouth",
        name: `upperBeakFang${side}`,
      },
    );
    for (let t = 0; t < 3; t++) {
      b.spike(
        [s * (0.06 + t * 0.04), 1.11 - t * 0.01, 0.64 + t * 0.07],
        [0, -1, 0.2],
        0.075,
        0.02,
        SUCKER_RING,
        {
          bone: jawUpper,
          sides: 5,
          group: "mouth",
          name: `upperTooth${side}.${t}`,
        },
      );
    }
  }

  // Lower Mandible Scoop Beak (on jaw joint, posed open for fierce silhouette)
  const lowerBeakProfile: OutlinePoint[] = [
    [0, -0.16],
    [0.26, -0.18],
    [0.44, 0.04, "sharp"],
    [0.28, 0.06],
    [0, -0.02],
  ];
  b.extrude(lowerBeakProfile, {
    at: [0, 0.9, 0.5],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: [0.32, 0.06],
    bevel: 0.016,
    smoothing: 1,
    bone: jaw,
    color: beakPaint,
    group: "mouth",
    name: "lowerBeakMandible",
  });

  // Armored chin plate under the lower jaw + 6 jagged lower teeth + glowing radula tongue
  b.extrude(
    [
      [-0.18, -0.12],
      [0, -0.2, "sharp"],
      [0.18, -0.12],
      [0.14, 0.12],
      [-0.14, 0.12],
    ],
    {
      at: [0, 0.78, 0.64],
      x: [1, 0, 0],
      y: [0, 0.45, 0.89],
      thickness: 0.032,
      bevel: 0.01,
      smoothing: 1,
      bone: jaw,
      color: armorPlatePaint,
      group: "mouth",
      name: "chinArmorPlate",
    },
  );

  // Glowing curled radula tongue inside the lower jaw
  glow(
    b.sweep(bezier([0, 0.92, 0.52], [0, 0.96, 0.68], [0, 0.94, 0.82]), [0.05, 0.015], {
      bone: jaw,
      color: ACCENT_ORANGE,
      sides: 6,
      caps: { start: "round", end: "point" },
      group: "mouth",
      name: "radulaTongue",
    }),
    1.2,
  );

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    for (let t = 0; t < 3; t++) {
      b.spike(
        [s * (0.07 + t * 0.045), 0.91 + t * 0.02, 0.62 + t * 0.08],
        [0, 1, 0.15],
        0.08,
        0.022,
        SUCKER_RING,
        {
          bone: jaw,
          sides: 5,
          group: "mouth",
          name: `lowerTooth${side}.${t}`,
        },
      );
    }
  }

  // Pose the upper and lower beak jaws slightly wider open for an aggressive roar
  b.pose(jawUpper, { axis: [1, 0, 0], deg: -10 });
  b.pose(jaw, { axis: [1, 0, 0], deg: 16 });

  // =========================================================================
  // 8. TENTACLE DRESSING: SHOULDER GUARDS, ARMOR PLATES, SUCKERS & FIN CARDS
  // =========================================================================
  const shoulderGuardOutline: OutlinePoint[] = [
    [-0.18, -0.14],
    [0, -0.22, "sharp"],
    [0.18, -0.14],
    [0.22, 0.12],
    [0, 0.22, "sharp"],
    [-0.22, 0.12],
  ];

  const cardFrames: ReturnType<typeof frame>[] = [];

  for (const item of builtTentacles) {
    const { spec, sweep: tSweep } = item;

    // 1) Brachial Shoulder Armor Guard at the root of each tentacle (t = 0.08)
    const rootPt = tSweep.at(0.08, 0, 0.02);
    b.extrude(shoulderGuardOutline, {
      at: rootPt,
      x: rootPt.dir([1, 0, 0]),
      y: rootPt.tangent,
      thickness: [0.042, 0.016],
      bevel: 0.012,
      smoothing: 1,
      color: armorPlatePaint,
      group: spec.name,
      name: `shoulderGuard.${spec.name}`,
    });

    // 2) 4 Dorsal Chitin Segments + Bioluminescent Photophore Nodes along the tentacle spine
    const dorsalTs = [0.22, 0.42, 0.62, 0.8];
    dorsalTs.forEach((t, idx) => {
      const hit = tSweep.at(t, 0, 0.008);
      const rScale = 1 - t * 0.62;
      b.stick(
        new THREE.BoxGeometry(0.18 * rScale, 0.036 * rScale, 0.22 * rScale),
        armorPlatePaint,
        hit,
        {
          embed: 0.35,
          flow: hit.tangent,
          group: spec.name,
          name: `tentaclePlate.${spec.name}.${idx}`,
        },
      );
      glow(
        b.stick(
          new THREE.SphereGeometry(0.034 * rScale, 6, 4),
          idx % 2 === 0 ? BIO_CYAN : ACCENT_ORANGE,
          hit.moved([0, 0.018 * rScale, 0]),
          {
            embed: 0.25,
            group: spec.name,
            name: `tentacleGlow.${spec.name}.${idx}`,
          },
        ),
        1.5,
      );
    });

    // 3) Double Alternating Rows of Toothed Cephalopod Suckers
    // Placed along the rearing distal half (t = 0.50..0.90) on the ventral/inner side,
    // and along the lateral-upper flanks on the grounded arch (t = 0.16..0.44) so nothing touches below y = 0.
    const suckerTs = [0.16, 0.24, 0.34, 0.44, 0.53, 0.6, 0.67, 0.74, 0.81, 0.88];
    suckerTs.forEach((t, idx) => {
      const sideSign = idx % 2 === 0 ? 1 : -1;
      // On grounded stretch (t < 0.48), place suckers at ±112 deg (visible flank); on rearing stretch, at 180 ± 26 deg
      const deg = t < 0.48 ? sideSign * 112 : 180 + sideSign * 26;
      const hit = tSweep.at(t, deg, 0);
      // Safety floor guard: never place a sucker where its rim could dip below y = 0.03
      if (hit.at.y < 0.06) return;

      const sRad = Math.max(0.024, 0.068 * (1 - t * 0.68));
      const sHeight = sRad * 0.58;

      // Pale chitinous sucker cup
      b.stick(new THREE.CylinderGeometry(sRad, sRad * 0.78, sHeight, 6), SUCKER_RING, hit, {
        embed: 0.32,
        group: spec.name,
        name: `suckerCup.${spec.name}.${idx}`,
      });
      // Deep plum interior suction cavity
      b.stick(
        new THREE.CylinderGeometry(sRad * 0.62, sRad * 0.5, sHeight * 0.45, 6),
        MAW_PLUM,
        hit.moved([0, sHeight * 0.45, 0]),
        {
          embed: 0.2,
          group: spec.name,
          name: `suckerCavity.${spec.name}.${idx}`,
        },
      );
    });

    // 4) Collect frames for double-sided serrated bio-fin cards along the outer curve (t = 0.55..0.85)
    for (const ct of [0.56, 0.7, 0.83]) {
      cardFrames.push(tSweep.at(ct, 0, 0));
    }
  }

  // Add collar crest frill cards behind the head
  for (const deg of [-55, -28, 0, 28, 55]) {
    cardFrames.push(mantleLoft.at(0.18, deg, 0));
  }

  b.cards(cardFrames, FIN_CREST_CARD_TEX, {
    size: [0.18, 0.26],
    lean: 28,
    bend: 22,
    vary: 0.18,
    rng: rand,
    group: "crests",
    name: "bioFinCards",
  });

  // =========================================================================
  // 9. RAPTORIAL FEEDING CLUB DETAILS (HOOKS, GIANT SUCKERS & LURE TIPS)
  // =========================================================================
  const clubPlateOutline: OutlinePoint[] = [
    [-0.14, -0.22],
    [0, -0.3, "sharp"],
    [0.14, -0.22],
    [0.18, 0.12],
    [0, 0.28, "sharp"],
    [-0.18, 0.12],
  ];

  for (const whip of builtWhips) {
    const { side, sign: s, chain: wChain, sweep: wSweep } = whip;

    // Dorsal armoured club shield at t = 0.82
    const clubDorsal = wSweep.at(0.82, 0, 0.01);
    b.extrude(clubPlateOutline, {
      at: clubDorsal,
      x: clubDorsal.dir([1, 0, 0]),
      y: clubDorsal.tangent,
      thickness: [0.036, 0.014],
      bevel: 0.01,
      smoothing: 1,
      color: armorPlatePaint,
      group: `whip${side}`,
      name: `clubShield${side}`,
    });

    // 5 Curved Raptorial Strike Hooks & Giant Suckers on the inner club face (deg = 180)
    const hookTs = [0.74, 0.79, 0.84, 0.89, 0.93];
    hookTs.forEach((t, idx) => {
      const innerHit = wSweep.at(t, 180 + (idx % 2 === 0 ? 18 : -18), 0);
      // Sucker pad base
      b.stick(new THREE.CylinderGeometry(0.048, 0.04, 0.026, 6), SUCKER_RING, innerHit, {
        embed: 0.35,
        group: `whip${side}`,
        name: `clubSucker${side}.${idx}`,
      });
      // Curved obsidian strike claw
      const hookDir = innerHit.n.clone().addScaledVector( vec([-s * 0.4, -0.3, 0.5]), 0.65 );
      b.spike(innerHit.moved([0, 0.012, 0]), hookDir, 0.11, 0.024, BEAK_OBSIDIAN, {
        sides: 5,
        group: `whip${side}`,
        name: `clubHook${side}.${idx}`,
      });
    });

    // Glowing Bioluminescent Abyssal Lure Bulb at the tip of each feeding tentacle
    const tipJoint = wChain.joints[wChain.joints.length - 1];
    const tipPos = wSweep.at(0.99, 0, 0).at;
    glow(
      b.part(new THREE.OctahedronGeometry(0.055, 1), BIO_CYAN, {
        bone: tipJoint,
        at: tipPos,
        scale: [0.85, 1.35, 0.85],
        group: `whip${side}`,
        name: `whipLureGlow${side}`,
      }),
      1.8,
    );
  }

  return b.root;
}
