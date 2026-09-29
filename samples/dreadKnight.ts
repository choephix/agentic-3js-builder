// Dread Knight: a legendary armoured antihero in the Warcraft hand-painted tradition, 2.2 m tall with his horns. A
// humanoid rig (hips, spine1..chest, neck, head, jaw, clavicles, arms with five-finger gauntlets, legs with toes)
// carries exaggerated plate: gigantic tiered pauldrons with horn spikes and glowing-eyed skulls, a horned great helm
// with a hinged jaw and fel-green eye slits, layered breastplate and abdomen lames, faulds, spiked poleyns, sabatons,
// a tattered crimson cape on skinned strips, chains and belt trophies. The runed greatsword, nearly as tall as he is,
// rides the right hand.
// Style: every surface is PAINTED, not lit. Plates carry a baked key light from the upper front-left, a hue-shifted
// blue shadow ramp, a specular streak, edge scuffs, engraved gold trim and glowing fel-green grooves (paints); the
// blade runes, chest sigil, fel flames and tabard emblem are svg() drawings with the glow painted in, and the cape
// sigil is a paint.
import {
  BoxGeometry,
  CircleGeometry,
  CylinderGeometry,
  IcosahedronGeometry,
  LatheGeometry,
  Matrix4,
  OctahedronGeometry,
  PlaneGeometry,
  Quaternion,
  SphereGeometry,
  Vector2,
  Vector3,
} from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import type { V3 } from "../src/math";
import { bezier, catmull, polyline } from "../src/path";
import { mix, noise, paint, rgb, smoothstep } from "../src/paint";
import type { Paint, Rgb, SurfaceCoords } from "../src/paint";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";

export const meta = {
  name: "Dread Knight",
  builtBy: "Claude Sonnet 5.5",
  description:
    "Towering armoured antihero in hand-painted Warcraft style: skull-and-horn pauldrons, horned great helm with fel-green eye slits, engraved gold-trimmed plate, tattered cape, chains and trophies, and a huge runed greatsword in his right fist.",
};

// ---------------------------------------------------------------------------------------------------------------
// Painted tone ramps (dark to light, hue-shifted: cool shadows, warm lights).
const T = (...hex: string[]): Rgb[] => hex.map((h) => rgb(h));
const STEEL = T("#05060b", "#0f121b", "#1c2230", "#323c54", "#56647f", "#8d99b2", "#dfe7f4");
const EDGE = T("#3a4a68", "#7e93b4", "#c3d3e8", "#ffffff");
const GOLD = T("#201002", "#5a3208", "#a4680f", "#dba22a", "#ffd257", "#fff1a3");
const BONE = T("#1f160d", "#4d3c29", "#927c56", "#cfbe93", "#eee3bd", "#fffaea");
const LEATHER = T("#0c0603", "#22120a", "#3d2216", "#65401f", "#8f5c2f", "#c08748");
const CLOTH = T("#10020a", "#2e0716", "#560f22", "#861a30", "#b7364a", "#e06e7c");
const MAIL = T("#030408", "#0a0c14", "#141925", "#232c40", "#3d4b6b", "#69799b");
const GROOVE = T("#020308", "#080c15", "#111827", "#1e2740");
const ENGRAVE_BONE = T("#0a0603", "#180f08", "#2a1d10", "#3e2c18");
const FEL = T("#062406", "#136a0d", "#33c418", "#84f43c", "#c9ff8a", "#f4ffd8");
const FEL_CORE = rgb("#e6ffb4");
const FEL_MID = rgb("#7bf03a");

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
function ramp(tones: readonly Rgb[], t: number): Rgb {
  const x = clamp01(t) * (tones.length - 1);
  const i = Math.min(tones.length - 2, Math.floor(x));
  return mix(tones[i], tones[i + 1], x - i);
}

type Tones = readonly Rgb[];
type Trim = (p: Vector3, n: Vector3, s: SurfaceCoords) => Tones | Rgb | null;

/**
 * Hand-painted metal: a key light from the upper front-left is baked into a tone ramp, with a bounce-dark near the
 * floor and under surfaces, big brush blotches, a specular streak, and scuffed edge wear. `trim` swaps the ramp for
 * engraved gold, grooves and glows.
 */
function metal(tones: Tones, seed: number, trim?: Trim, wear = 1) {
  return paint((p, n, s) => {
    let ramp0 = tones;
    if (trim) {
      const t = trim(p, n, s);
      if (t) {
        if (typeof t[0] === "number") return t as Rgb;
        ramp0 = t as Tones;
      }
    }
    const key = 0.6 * n.y + 0.5 * n.z + 0.32 * n.x;
    let L = (tones === STEEL ? 0.42 : 0.33) + 0.32 * key;
    if (n.y < -0.3) L -= 0.08;
    L -= 0.15 * smoothstep(0.8, 0, p.y);
    L += (noise(p, 0.07, seed) - 0.5) * 0.2;
    const g = key - 0.6;
    L += 0.26 * Math.exp(-(g * g) / 0.01);
    const w = Math.sin(p.x * 61 + p.y * 23 + p.z * 47) * Math.sin(p.x * 29 - p.y * 71 + p.z * 37);
    if (w > 0.94) L += wear * 0.2 * ((w - 0.94) / 0.06);
    return ramp(ramp0, L);
  });
}

type Pt = readonly [number, number] | readonly [number, number, "sharp"];
function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = clamp01(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
function edgeDist(pts: readonly Pt[], x: number, y: number) {
  let d = Infinity;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const c = pts[(i + 1) % pts.length];
    d = Math.min(d, segDist(x, y, a[0], a[1], c[0], c[1]));
  }
  return d;
}

/** A painted plate for an extruded outline: gold rim along every edge, an engraved groove inside it. */
function plate(
  pts: readonly Pt[],
  tones: Tones,
  seed: number,
  opts: { rim?: number; groove?: number; rimTones?: Tones; extra?: Trim } = {},
) {
  const rim = opts.rim ?? 0.012;
  const groove = opts.groove ?? 0.028;
  return metal(tones, seed, (p, n, s) => {
    const d = edgeDist(pts, s[0], s[1]);
    if (d < rim) return opts.rimTones ?? GOLD;
    if (Math.abs(d - groove) < 0.0022) return GROOVE;
    return opts.extra?.(p, n, s) ?? null;
  });
}

function orient(x: Vector3, y: Vector3, z: Vector3) {
  const m = new Matrix4().makeBasis(x, y, z);
  if (m.determinant() < 0) m.makeBasis(x.clone().negate(), y, z);
  return new Quaternion().setFromRotationMatrix(m);
}
const V = (x: number, y: number, z: number) => new Vector3(x, y, z);
/** A half outline (top centre, down the right side, to the bottom centre) as the whole symmetric shape. */
const mirror = (pts: readonly Pt[]): Pt[] => [
  ...pts,
  ...pts
    .slice(1, -1)
    .reverse()
    .map((q): Pt => (q.length === 3 ? [-q[0], q[1], "sharp"] : [-q[0], q[1]])),
];
const scaled = (pts: readonly Pt[], k: number, dy = 0): Pt[] =>
  pts.map((q): Pt => (q.length === 3 ? [q[0] * k, (q[1] + dy) * k, "sharp"] : [q[0] * k, (q[1] + dy) * k]));

// ---------------------------------------------------------------------------------------------------------------
// Skull relief: an extruded skull silhouette painted like a hand-drawn skull (eye sockets glow fel green).
const SKULL_HALF: Pt[] = [
  [0, 1.0],
  [0.3, 0.98],
  [0.48, 0.86],
  [0.54, 0.66],
  [0.5, 0.44],
  [0.44, 0.3],
  [0.36, 0.22],
  [0.34, 0.1],
  [0.28, -0.02],
  [0.22, -0.12],
  [0.12, -0.18],
  [0, -0.2],
];
const SKULL_UNIT: Pt[] = scaled(mirror(SKULL_HALF), 1, -0.4);

function skullPaint(size: number, glow: boolean, seed: number) {
  const outline = scaled(SKULL_UNIT, size);
  return metal(BONE, seed, (_p, _n, s) => {
    const ux = Math.abs(s[0]) / size;
    const uy = s[1] / size + 0.4;
    if (edgeDist(outline, s[0], s[1]) < 0.0035 * (size / 0.1)) return ENGRAVE_BONE;
    const ex = (ux - 0.25) / 0.15;
    const ey = (uy - 0.58) / 0.13;
    const e = ex * ex + ey * ey;
    if (e < 1) {
      if (!glow) return ENGRAVE_BONE;
      return e < 0.22 ? FEL_CORE : mix("#0a2a06", FEL_MID, smoothstep(1, 0.2, e));
    }
    if (e < 1.35) return ENGRAVE_BONE;
    const nose = uy > 0.2 && uy < 0.4 && ux < 0.075 * (1 - (uy - 0.2) / 0.22) + 0.006;
    if (nose) return ENGRAVE_BONE;
    if (uy > -0.14 && uy < 0.04 && ux < 0.3) {
      if (Math.abs(uy - 0.04) < 0.012) return ENGRAVE_BONE;
      const f = Math.abs(((ux / 0.085 + 0.5) % 1) - 0.5);
      if (f < 0.09) return ENGRAVE_BONE;
    }
    return null;
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Drawings.
const svgOpen = (w: number, h: number) => `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">`;

/** The rune-engraved fuller of the blade: dark steel with fel-green glowing glyphs and a wash of glow. */
function bladeTexture() {
  const r = rng(77);
  const W = 55;
  const H = 520;
  let glyphs = "";
  const lat = (i: number, j: number) => `${(27.5 + (i - 1) * 8.5).toFixed(1)} ${(j * 8.6 - 13).toFixed(1)}`;
  for (let g = 0; g < 12; g++) {
    const cy = 30 + g * 41.5;
    let d = `M ${lat(1, 0)} L ${lat(1, 3)}`;
    const branches = 2 + Math.floor(r() * 3);
    for (let k = 0; k < branches; k++) {
      const i0 = Math.floor(r() * 3);
      const j0 = Math.floor(r() * 4);
      const i1 = Math.min(2, Math.max(0, i0 + (r() < 0.5 ? 1 : -1) * (1 + Math.floor(r() * 2))));
      const j1 = Math.min(3, Math.max(0, j0 + Math.floor(r() * 3) - 1));
      if (i0 === i1 && j0 === j1) continue;
      d += ` M ${lat(i0, j0)} L ${lat(i1, j1)}`;
    }
    const layers = (
      [
        ["#1fb016", 0.3, 6.5],
        ["#58ee34", 0.65, 3.4],
        ["#eaffc4", 1, 1.3],
      ] as const
    )
      .map(
        ([c, o, w]) =>
          `<path d="${d}" stroke="${c}" stroke-opacity="${o}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
      )
      .join("");
    glyphs += `<g transform="translate(0 ${cy})">${layers}</g>`;
    if (g < 11) glyphs += `<path d="M27.5 ${cy + 28} l3.5 3 -3.5 3 -3.5 -3z" fill="#58ee34" fill-opacity="0.8"/>`;
  }
  return svg(
    `${svgOpen(W, H)}
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2e3c5c"/><stop offset="0.35" stop-color="#151c2e"/><stop offset="0.65" stop-color="#151c2e"/><stop offset="1" stop-color="#2e3c5c"/></linearGradient>
        <linearGradient id="wash" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#40e020" stop-opacity="0.05"/><stop offset="0.5" stop-color="#40e020" stop-opacity="0.2"/><stop offset="1" stop-color="#40e020" stop-opacity="0.02"/></linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <rect width="${W}" height="${H}" fill="url(#wash)"/>
      <rect x="1" y="1" width="${W - 2}" height="${H - 2}" fill="none" stroke="#8ea3c6" stroke-width="1.4"/>
      <rect x="4" y="4" width="${W - 8}" height="${H - 8}" fill="none" stroke="#0a0f1a" stroke-width="1"/>
      ${glyphs}
    </svg>`,
    { size: 1040 },
  );
}

/** A fel sigil on a dark disc with a gold ring. */
function sigilTexture() {
  const spokes = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    const [x1, y1, x2, y2] = [
      50 + Math.cos(a) * 10,
      50 + Math.sin(a) * 10,
      50 + Math.cos(a) * (i % 2 ? 27 : 36),
      50 + Math.sin(a) * (i % 2 ? 27 : 36),
    ];
    return `M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }).join(" ");
  const ring = (c: string, o: number, w: number) =>
    `<path d="${spokes}" stroke="${c}" stroke-opacity="${o}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
  return svg(
    `${svgOpen(100, 100)}
      <defs>
        <radialGradient id="d" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#1d3a14"/><stop offset="0.6" stop-color="#0b1410"/><stop offset="1" stop-color="#05070a"/></radialGradient>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0a0"/><stop offset="0.5" stop-color="#d9a028"/><stop offset="1" stop-color="#6b3f0a"/></linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#g)"/>
      <circle cx="50" cy="50" r="42" fill="url(#d)"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#f5c542" stroke-width="1.2"/>
      <circle cx="50" cy="50" r="30" fill="none" stroke="#33c418" stroke-opacity="0.7" stroke-width="1.6"/>
      ${ring("#1fb016", 0.35, 7)}${ring("#58ee34", 0.7, 3.4)}${ring("#eaffc4", 1, 1.2)}
      <circle cx="50" cy="50" r="8" fill="#58ee34"/><circle cx="50" cy="50" r="4.5" fill="#f4ffd8"/>
    </svg>`,
    { size: 192 },
  );
}

/** A fel-fire tongue, bright at its root and dark green at the tips (opaque, cut out by its outline). */
function flameTexture() {
  return svg(
    `${svgOpen(40, 100)}
      <defs><linearGradient id="f" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f4ffd8"/><stop offset="0.25" stop-color="#9df84a"/><stop offset="0.6" stop-color="#33c418"/><stop offset="1" stop-color="#0f6a0a"/></linearGradient></defs>
      <path d="M20 100 C2 88 2 68 12 54 C17 46 10 36 20 10 C22 28 34 36 31 52 C40 64 38 86 20 100Z" fill="url(#f)"/>
      <path d="M20 100 C10 90 12 76 18 60 C21 72 27 80 22 92Z" fill="#f4ffd8" fill-opacity="0.8"/>
      <path d="M31 68 C37 56 30 48 34 30 C40 44 40 58 34 70Z" fill="#25a010"/>
    </svg>`,
    { size: 128 },
  );
}

/** The gold horned skull on the crimson tabard. */
function emblemTexture() {
  return svg(
    `${svgOpen(100, 120)}
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1a3"/><stop offset="0.5" stop-color="#dba22a"/><stop offset="1" stop-color="#8a5510"/></linearGradient></defs>
      <path d="M32 46 C10 44 2 24 6 2 C18 14 34 20 40 34Z" fill="url(#g)" stroke="#3a2004" stroke-width="2"/>
      <path d="M68 46 C90 44 98 24 94 2 C82 14 66 20 60 34Z" fill="url(#g)" stroke="#3a2004" stroke-width="2"/>
      <path d="M50 20 C70 20 78 36 76 54 C75 62 70 66 68 72 L68 84 C68 90 62 92 58 90 L56 96 L44 96 L42 90 C38 92 32 90 32 84 L32 72 C30 66 25 62 24 54 C22 36 30 20 50 20Z" fill="url(#g)" stroke="#3a2004" stroke-width="2.5"/>
      <ellipse cx="39" cy="50" rx="8" ry="9" fill="#2a0508" transform="rotate(-14 39 50)"/>
      <ellipse cx="61" cy="50" rx="8" ry="9" fill="#2a0508" transform="rotate(14 61 50)"/>
      <ellipse cx="39" cy="51" rx="3.4" ry="4" fill="#84f43c"/><ellipse cx="61" cy="51" rx="3.4" ry="4" fill="#84f43c"/>
      <path d="M50 60 L45 70 L55 70Z" fill="#2a0508"/>
      <path d="M38 80 v10 M44 80 v14 M50 80 v14 M56 80 v14 M62 80 v10" stroke="#3a2004" stroke-width="2"/>
      <path d="M50 96 L30 116 M50 96 L70 116" stroke="url(#g)" stroke-width="5" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Paints that are not simply `metal`.
const GRIP_WRAP = paint((_p, n, s) => {
  const k = (s[1] * 26 - s[0] * 3) % 1;
  const f = k < 0 ? k + 1 : k;
  const L = 0.36 + 0.34 * (0.5 + 0.5 * n.y * 0.3) + (f < 0.14 ? -0.2 : (f - 0.4) * 0.3);
  return ramp(LEATHER, L);
});

const HORN = paint((_p, n, s) => {
  const ridge = (s[0] * 11) % 1;
  const L = 0.22 + 0.5 * s[0] + 0.15 * (0.6 * n.y + 0.4 * n.z) - (ridge < 0.12 ? 0.14 : 0);
  return ramp(BONE, L);
});

const capePaint = paint((p, n, s) => {
  const f = 0.5 + 0.5 * Math.sin(p.x * 34 + p.y * 2.6 + 1.7 * Math.sin(p.x * 9 + 1));
  let L = 0.2 + 0.36 * f + 0.14 * (p.y / 1.7);
  if (n.z > 0) L *= 0.7;
  const burn = smoothstep(0.86, 1, s[0]) * (0.5 + 0.7 * noise(p, 0.05, 5));
  L -= 0.25 * burn;
  if (noise(p, 0.03, 9) > 0.8) L -= 0.16;
  if (s[0] < 0.02) return ramp(GOLD, 0.45 + 0.2 * f);
  const cloth = ramp(CLOTH, L);
  if (n.z < 0) {
    // A fel sigil painted on the back: two rings and eight spokes, glowing.
    const dy = p.y - 1.15;
    const r = Math.hypot(p.x, dy);
    if (r < 0.26) {
      const step = Math.PI / 4;
      const a = Math.atan2(dy, p.x) / step + 0.5;
      const spoke = Math.abs(a - Math.floor(a) - 0.5) * step * r;
      const d = Math.min(Math.abs(r - 0.23), Math.abs(r - 0.155), r > 0.04 && r < 0.23 ? spoke : 1);
      if (d < 0.0035) return FEL_CORE;
      if (d < 0.009) return FEL_MID;
      return mix(cloth, "#33c418", 0.7 * smoothstep(0.035, 0.009, d));
    }
  }
  return cloth;
});

const CHAIN_LINKS = (len: number) =>
  paint((_p, n, s) => {
    const k = (s[0] * len) / 0.026;
    const f = k - Math.floor(k);
    const L = 0.3 + 0.32 * (0.5 + 0.5 * n.y) + (f < 0.5 ? 0.2 : -0.14);
    return ramp(STEEL, L);
  });

// ---------------------------------------------------------------------------------------------------------------
type Hand = { W: Vector3; u: Vector3; v: Vector3; w: Vector3 };
/** Gauntlets are enormous: every hand offset is scaled by this. */
const HSC = 1.45;
/** A point of a hand: `a` along the fingers, `bb` along the knuckle row (index positive), `c` out of the back of the hand. */
const hp = (h: Hand, a: number, bb: number, c: number) =>
  h.W.clone()
    .addScaledVector(h.u, a * HSC)
    .addScaledVector(h.v, bb * HSC)
    .addScaledVector(h.w, c * HSC);
function handBasis(W: Vector3, u: Vector3, up: Vector3, backX: number): Hand {
  const uu = u.clone().normalize();
  const v = up.clone().addScaledVector(uu, -up.dot(uu)).normalize();
  const w = V(backX, 0, 0)
    .addScaledVector(uu, -backX * uu.x)
    .addScaledVector(v, -backX * v.x)
    .normalize();
  return { W, u: uu, v, w };
}

/** A skull in relief, its face along `face`, sized by its width; the eye sockets glow when `glow`. */
function skullRelief(
  b: ReturnType<typeof createBuilder>,
  at: Vector3,
  face: Vector3,
  size: number,
  opts: { bone: Joint; group: string; glow?: boolean; seed?: number; name?: string },
) {
  const f = face.clone().normalize();
  const x = V(0, 1, 0).cross(f).normalize();
  const y = f.clone().cross(x).normalize();
  return b.extrude(scaled(SKULL_UNIT, size), {
    at,
    x,
    y,
    thickness: size * 0.55,
    bevel: size * 0.1,
    smoothing: 1,
    detail: 0.4,
    bone: opts.bone,
    color: skullPaint(size, opts.glow ?? false, opts.seed ?? 1),
    group: opts.group,
    name: opts.name,
  });
}

const HS = 1.2; // head scale about the neck
/** A point of the helm's design drawing (unscaled coordinates) placed on the scaled head. */
const hz = (x: number, y: number, z: number) => V(x * HS, 1.8 + (y - 1.8) * HS, 0.05 + (z - 0.05) * HS);

export default function build() {
  const b = createBuilder({ name: "dreadKnight", paintSize: 2048 });

  const BLADE_TEX = bladeTexture();
  const SIGIL_TEX = sigilTexture();
  const FLAME_TEX = flameTexture();
  const EMBLEM_TEX = emblemTexture();

  const steel = metal(STEEL, 3);
  const goldPaint = metal(GOLD, 4, undefined, 0.6);
  const boneMetal = metal(BONE, 5);
  const mail = metal(MAIL, 6, undefined, 0.3);
  const SIDES = [
    [1, "L"],
    [-1, "R"],
  ] as const;
  const spikeOn = (
    bone: Joint,
    base: V3,
    dir: V3,
    len: number,
    r: number,
    color: Paint | string,
    group: string,
    sides = 6,
  ) => b.spike(base, dir, len, r, { bone, color, group, sides });
  const chainTube = (bone: Joint, pts: V3[], r: number, group: string) => {
    const path = catmull(pts);
    return b.sweep(path, r, { bone, color: CHAIN_LINKS(path.length), sides: 5, group });
  };

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton.
  const hips = b.joint("hips", { at: [0, 1.06, 0], role: "spine", group: "torso" });
  const spine = b.chain(
    "spine",
    [
      [0, 1.1, 0.0],
      [0, 1.28, 0.02],
      [0, 1.46, 0.05],
      [0, 1.7, 0.06],
    ],
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine", group: "torso" },
  );
  const [spine1, spine2, chest] = spine.joints;
  const neck = b.joint("neck", { parent: chest, at: [0, 1.7, 0.06], aim: [0, 1.8, 0.09], role: "neck", group: "head" });
  const head = b.joint("head", { parent: neck, at: [0, 1.8, 0.09], dir: [0, 1, 0], role: "head", group: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: hz(0, 1.87, 0.03),
    aim: hz(0, 1.85, 0.24),
    role: "jaw",
    group: "head",
  });

  const legs = SIDES.map(([s, side]) =>
    b.chain(
      `leg${side}`,
      [
        [s * 0.16, 1.03, 0.0],
        [s * 0.19, 0.6, 0.07],
        [s * 0.2, 0.19, 0.0],
        [s * 0.2, 0.09, 0.15],
        [s * 0.2, 0.05, 0.31],
      ],
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`, `toe${side}`],
        role: "leg",
        contact: [s * 0.2, 0, 0.18],
        group: `leg${side}`,
      },
    ),
  );

  const HANDS: Record<string, Hand> = {};
  const arms = SIDES.map(([s, side]) => {
    const clav = b.joint(`clavicle${side}`, {
      parent: chest,
      at: [s * 0.12, 1.64, 0.03],
      aim: [s * 0.4, 1.62, 0.0],
      role: "arm",
      group: `arm${side}`,
    });
    const W = V(s * 0.92, 0.94, 0.2);
    const hand =
      s < 0
        ? handBasis(W, V(0, -0.1, 1), V(0, 1, 0), -1) // fist round the grip: fingers forward, palm inward
        : handBasis(W, V(0.06, -1, 0.12), V(0, 0, 1), 1); // relaxed: fingers hang, thumb forward
    HANDS[side] = hand;
    const chain = b.chain(
      `arm${side}`,
      [[s * 0.4, 1.62, 0.0], [s * 0.7, 1.27, -0.03], [W.x, W.y, W.z], hp(hand, 0.115, 0, 0)],
      { parent: clav, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm", group: `arm${side}` },
    );
    return { s, side, clav, chain, shoulder: chain.joints[0], elbow: chain.joints[1], wrist: chain.joints[2] };
  });

  // -------------------------------------------------------------------------------------------------------------
  // Torso: one loft (painted plate above the belt, leather below) with layered lames over it.
  const torsoTrim: Trim = (p, n) => {
    if (p.y < 1.22) return Math.abs(p.y - 1.22) < 0.012 ? GOLD : LEATHER;
    if (Math.abs(p.y - 1.435) < 0.009) return GOLD;
    if (Math.abs(p.y - 1.685) < 0.008) return GOLD;
    if (n.z > 0.3) {
      if (Math.abs(p.x) < 0.011 && p.y > 1.36) return GOLD;
      const d = Math.hypot(Math.abs(p.x) - 0.18, p.y - 1.57);
      if (Math.abs(d - 0.12) < 0.0045) return GOLD;
      if (Math.abs(d - 0.145) < 0.0025) return FEL_MID;
    }
    if (n.z < -0.3) {
      if (Math.abs(p.x) < 0.007) return GROOVE;
      const d = Math.hypot(p.x, p.y - 1.5);
      if (Math.abs(d - 0.17) < 0.005) return GOLD;
    }
    return null;
  };
  const torso = b.loft(
    [
      { at: [0, 1.02, 0.0], w: 0.36, h: 0.26 },
      { at: [0, 1.16, 0.01], w: 0.3, h: 0.22 },
      { at: [0, 1.34, 0.03], w: 0.46, h: 0.3 },
      { at: [0, 1.54, 0.05], w: 0.7, h: 0.4 },
      { at: [0, 1.68, 0.04], w: 0.62, h: 0.34 },
      { at: [0, 1.76, 0.05], w: 0.26, h: 0.24 },
    ],
    { bone: [hips, spine], color: metal(STEEL, 11, torsoTrim), sides: 8, group: "torso", name: "torso" },
  );
  const torsoSurface = b.surface(torso);

  // Abdomen lames: stepped plates, each a little wider than the last, gold along the lower edge.
  for (let i = 0; i < 4; i++) {
    const y = 1.2 + i * 0.058;
    const w = 0.3 + i * 0.045;
    const h = 0.245 + i * 0.03;
    b.frustumBox([0, y + 0.03, 0.015 + i * 0.008], [0, y - 0.03, 0.015 + i * 0.008], [w + 0.012, h + 0.008], [w, h], {
      bone: i < 2 ? spine1 : spine2,
      color: metal(STEEL, 20 + i, (p) => (p.y < y - 0.02 ? GOLD : null)),
      group: "torso",
    });
  }
  // Sternum keel and collar of spikes.
  spikeOn(chest, V(0, 1.62, 0.25), V(0, -0.55, 0.85), 0.32, 0.035, metal(GOLD, 24), "torso");
  b.lathe(
    [
      [0.1, -0.03],
      [0.2, -0.02],
      [0.255, 0.06],
      [0.135, 0.078],
      [0.1, 0.06],
    ],
    {
      at: [0, 1.7, 0.05],
      segments: 8,
      bone: chest,
      color: metal(STEEL, 25, (_p, _n, s) => (s[0] > 0.052 ? GOLD : null)),
      group: "torso",
    },
  );
  for (let i = 0; i < 9; i++) {
    const a = (-0.72 + (i / 8) * 1.44) * Math.PI;
    const dir = V(Math.sin(a), 0.75, Math.cos(a) * 0.9).normalize();
    spikeOn(
      chest,
      V(Math.sin(a) * 0.2, 1.75, 0.05 + Math.cos(a) * 0.18),
      dir,
      0.15 + 0.04 * Math.cos(a * 2),
      0.026,
      metal(GOLD, 26),
      "torso",
    );
  }
  // Fel sigil on the chest.
  const sigilHit = torsoSurface.ray([0, 1.56, 1], [0, 0, -1]);
  if (sigilHit)
    b.part(new CircleGeometry(0.08, 20), "#ffffff", {
      at: sigilHit.at.clone().add(V(0, 0, 0.004)),
      dir: sigilHit.n,
      axis: "z",
      up: [0, 1, 0],
      texture: SIGIL_TEX,
      bone: chest,
      group: "torso",
      name: "sigil",
    });
  b.sweep(
    [
      [0, 1.7, 0.06],
      [0, 1.8, 0.09],
    ],
    0.075,
    { bone: neck, color: mail, sides: 8, group: "head", caps: "flat" },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Belt, buckle, faulds, tabard, trophies.
  const beltRing = catmull(
    [
      [0, 1.15, 0.155],
      [0.145, 1.15, 0.11],
      [0.19, 1.15, 0.0],
      [0.145, 1.15, -0.11],
      [0, 1.15, -0.14],
      [-0.145, 1.15, -0.11],
      [-0.19, 1.15, 0.0],
      [-0.145, 1.15, 0.11],
    ],
    { closed: true },
  );
  b.sweep(beltRing, () => [0.026, 0.05], {
    section: "box",
    up: [0, 1, 0],
    bone: hips,
    color: metal(LEATHER, 30, (p) => (Math.abs(p.y - 1.15) < 0.006 ? GOLD : null), 0.5),
    group: "belt",
  });
  const BUCKLE: Pt[] = [
    [-0.075, 0.02],
    [-0.045, 0.06],
    [0.045, 0.06],
    [0.075, 0.02],
    [0.06, -0.05],
    [0, -0.08],
    [-0.06, -0.05],
  ];
  b.extrude(BUCKLE, {
    at: [0, 1.15, 0.185],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.03,
    bevel: 0.008,
    bone: hips,
    color: plate(BUCKLE, STEEL, 31, { rim: 0.014, groove: 0.03 }),
    group: "belt",
    name: "buckle",
  });
  skullRelief(b, V(0, 1.15, 0.2), V(0, 0, 1), 0.06, { bone: hips, group: "belt", seed: 32 });

  // Faulds: hanging plates round the hips, flaring at the bottom, over the thigh tops.
  const FAULD: Pt[] = [
    [-0.06, 0],
    [0.06, 0],
    [0.052, -0.15],
    [0, -0.23, "sharp"],
    [-0.052, -0.15],
  ];
  for (const [s] of SIDES) {
    for (let i = 0; i < 5; i++) {
      const ang = ((20 + i * 35) * Math.PI) / 180;
      const rx = Math.sin(ang);
      const rz = Math.cos(ang);
      b.extrude(FAULD, {
        at: [s * rx * 0.315, 1.13, rz * 0.215 + 0.01],
        x: [rz, 0, -s * rx],
        y: [-s * rx * 0.3, 1, -rz * 0.3],
        thickness: 0.022,
        bevel: 0.006,
        bone: hips,
        color: plate(FAULD, STEEL, 40 + i, { rim: 0.011, groove: 0.024 }),
        group: "faulds",
      });
    }
  }
  // Front tabard, torn along the hem, with a gold horned-skull emblem.
  const TABARD: Pt[] = [
    [-0.1, 0],
    [0.1, 0],
    [0.115, -0.26],
    [0.09, -0.32],
    [0.065, -0.29],
    [0.035, -0.4, "sharp"],
    [0.005, -0.3],
    [-0.03, -0.37, "sharp"],
    [-0.06, -0.28],
    [-0.09, -0.34],
    [-0.115, -0.24],
  ];
  const tabardPaint = paint((p, n, s) => {
    const d = edgeDist(TABARD, s[0], s[1]);
    const f = 0.5 + 0.5 * Math.sin(p.x * 46 + 1.3);
    let L = 0.3 + 0.28 * f + 0.1 * smoothstep(-0.4, 0, s[1]);
    if (n.z < 0) L *= 0.7;
    if (d < 0.008) return ramp(GOLD, 0.5 + 0.2 * f);
    if (noise(p, 0.03, 12) > 0.8 && s[1] < -0.2) L -= 0.16;
    return ramp(CLOTH, L);
  });
  b.extrude(TABARD, {
    at: [0, 1.11, 0.19],
    x: [1, 0, 0],
    y: [0, 1, 0.08],
    thickness: 0.012,
    bone: hips,
    color: tabardPaint,
    group: "tabard",
    name: "tabard",
  });
  b.part(new PlaneGeometry(0.115, 0.138), "#ffffff", {
    at: [0, 0.985, 0.2],
    dir: [0, 0.08, 1],
    axis: "z",
    up: [0, 1, 0],
    texture: EMBLEM_TEX,
    bone: hips,
    group: "tabard",
    name: "emblem",
  });
  // Trophies on the left hip: three skulls on chains and a horn; on the right a pouch and a tusk.
  for (const [i, [tx, ty, tz, sz]] of (
    [
      [0.335, 0.99, 0.1, 0.075],
      [0.36, 0.86, -0.02, 0.065],
      [0.32, 0.79, 0.11, 0.055],
    ] as const
  ).entries()) {
    chainTube(
      hips,
      [V(0.2, 1.13, 0.03 + i * 0.03), V(0.29, 1.08 - i * 0.05, 0.05 + i * 0.03), V(tx, ty + sz * 0.7, tz)],
      0.009,
      "belt",
    );
    skullRelief(b, V(tx, ty, tz), V(0.9, 0.05, 0.4), sz, { bone: hips, group: "belt", seed: 33 + i });
  }
  b.sweep(bezier(V(0.24, 1.12, -0.1), V(0.4, 1.02, -0.1), V(0.44, 0.84, -0.03), V(0.4, 0.7, 0.03)), [0.04, 0.005], {
    bone: hips,
    bands: [
      [0.14, goldPaint],
      [1, HORN],
    ],
    caps: { start: "flat", end: "point" },
    sides: 6,
    group: "belt",
  });
  b.part(new BoxGeometry(0.1, 0.12, 0.075), metal(LEATHER, 37, undefined, 0.4), {
    bone: hips,
    at: [-0.32, 1.03, 0.09],
    rotation: [0, -10, 0],
    group: "belt",
    name: "pouch",
  });
  b.part(
    new BoxGeometry(0.11, 0.05, 0.085),
    metal(LEATHER, 38, (p) => (p.y > 1.055 && p.y < 1.062 ? GOLD : null), 0.4),
    { bone: hips, at: [-0.32, 1.085, 0.09], rotation: [0, -10, 0], group: "belt" },
  );
  b.part(new OctahedronGeometry(0.02), metal(GOLD, 39), {
    bone: hips,
    at: [-0.335, 1.05, 0.14],
    scale: [1, 1.3, 0.6],
    group: "belt",
  });
  b.sweep(
    bezier(V(-0.24, 1.12, -0.09), V(-0.4, 1.05, -0.12), V(-0.45, 0.88, -0.08), V(-0.4, 0.75, -0.02)),
    [0.035, 0.004],
    {
      bone: hips,
      bands: [
        [0.14, goldPaint],
        [1, HORN],
      ],
      caps: { start: "flat", end: "point" },
      sides: 6,
      group: "belt",
    },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Legs: mail sleeve, cuisse, spiked poleyn, greave, sabaton.
  for (const [i, [s, side]] of SIDES.entries()) {
    const leg = legs[i];
    const [hipJ, kneeJ, ankleJ, toeJ] = leg.joints;
    const group = `leg${side}`;
    b.sweep(leg, (t) => 0.085 - 0.02 * t, { to: leg.ts[2], color: mail, sides: 8, group, caps: "round" });
    // Thigh: two overlapping plates, gold-trimmed, with a green fel gem set in the knee.
    const thighTrim: Trim = (p) =>
      Math.abs(p.y - 0.665) < 0.012 || Math.abs(p.y - 1.0) < 0.01
        ? GOLD
        : Math.abs(p.y - 0.645) < 0.004
          ? GROOVE
          : null;
    b.frustumBox([s * 0.16, 1.03, 0.005], [s * 0.19, 0.66, 0.07], [0.27, 0.28], [0.22, 0.23], {
      bone: hipJ,
      color: metal(STEEL, 50 + i, thighTrim),
      group,
    });
    b.rod([s * 0.16, 1.0, 0.155], [s * 0.19, 0.7, 0.19], [0.03, 0.022], {
      bone: hipJ,
      color: metal(GOLD, 51),
      group,
      sides: 6,
    });
    b.part(new SphereGeometry(0.115, 8, 6), metal(STEEL, 52 + i), {
      bone: kneeJ,
      at: [s * 0.19, 0.6, 0.12],
      scale: [1.0, 0.92, 0.8],
      group,
    });
    spikeOn(kneeJ, V(s * 0.19, 0.6, 0.17), V(0, 0.2, 1), 0.2, 0.058, metal(GOLD, 54), group);
    b.part(new IcosahedronGeometry(0.03, 0), metal(FEL, 53), {
      bone: kneeJ,
      at: [s * 0.19, 0.6, 0.19],
      scale: [1, 1, 0.5],
      group,
    });
    b.frustumBox([s * 0.19, 0.6, 0.07], [s * 0.19, 0.5, 0.07], [0.25, 0.25], [0.2, 0.2], {
      bone: kneeJ,
      color: metal(STEEL, 55),
      group,
    });
    // Greave: flared top, gold ridge.
    const greaveTrim: Trim = (p) => (Math.abs(p.y - 0.5) < 0.01 || Math.abs(p.y - 0.235) < 0.01 ? GOLD : null);
    b.frustumBox([s * 0.19, 0.5, 0.06], [s * 0.2, 0.2, 0.01], [0.22, 0.23], [0.16, 0.17], {
      bone: kneeJ,
      color: metal(STEEL, 56 + i, greaveTrim),
      group,
    });
    b.rod([s * 0.19, 0.46, 0.185], [s * 0.2, 0.24, 0.12], [0.024, 0.015], {
      bone: kneeJ,
      color: metal(GOLD, 58),
      group,
      sides: 6,
    });
    // Sabaton: heel/instep block, toe block with a claw, side and heel spikes.
    const footTrim: Trim = (p, n) => (n.y > 0.5 && Math.abs(p.z - 0.05) < 0.012 ? GOLD : null);
    b.frustumBox([s * 0.2, 0.095, -0.12], [s * 0.2, 0.095, 0.12], [0.23, 0.19], [0.25, 0.17], {
      bone: ankleJ,
      color: metal(STEEL, 60 + i, footTrim),
      group,
    });
    b.frustumBox([s * 0.2, 0.085, 0.12], [s * 0.2, 0.055, 0.3], [0.25, 0.17], [0.16, 0.11], {
      bone: toeJ,
      color: metal(STEEL, 62 + i),
      group,
    });
    spikeOn(toeJ, V(s * 0.2, 0.06, 0.3), V(0, 0.03, 1), 0.13, 0.05, metal(GOLD, 64), group);
    spikeOn(ankleJ, V(s * 0.3, 0.2, -0.02), V(s, 0.25, -0.5), 0.14, 0.036, metal(GOLD, 65), group);
    spikeOn(ankleJ, V(s * 0.2, 0.14, -0.12), V(0, 0.3, -1), 0.12, 0.036, metal(GOLD, 66), group);
    b.lathe(
      [
        [0.0, -0.02],
        [0.115, -0.02],
        [0.14, 0.03],
        [0.09, 0.05],
        [0.0, 0.05],
      ],
      { at: [s * 0.2, 0.2, 0.0], segments: 8, bone: ankleJ, color: metal(GOLD, 67), group },
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Arms, pauldrons, gauntlets, hands.
  const F = V(0, 0, 1);
  for (const { s, side, chain, shoulder, elbow, wrist } of arms) {
    const group = `arm${side}`;
    const hand = HANDS[side];
    b.sweep(chain, [0.075, 0.06, 0.05, 0.05], { color: mail, sides: 8, group, from: 0, to: 0.86 });
    const upperTrim: Trim = (p) => (Math.abs(p.y - 1.5) < 0.01 ? GOLD : null);
    b.frustumBox([s * 0.42, 1.58, 0.0], [s * 0.68, 1.3, -0.03], [0.17, 0.17], [0.15, 0.15], {
      bone: shoulder,
      color: metal(STEEL, 70, upperTrim),
      group,
    });
    b.part(new SphereGeometry(0.105, 8, 6), metal(STEEL, 71), {
      bone: elbow,
      at: [s * 0.7, 1.27, -0.03],
      scale: [1, 0.95, 0.95],
      group,
    });
    spikeOn(elbow, V(s * 0.72, 1.27, -0.06), V(s * 0.35, 0.05, -0.9), 0.24, 0.052, metal(GOLD, 72), group);
    // Vambrace, flared toward the wrist, with two blade fins along the outside.
    const vamTrim: Trim = (p) => (Math.abs(p.y - 1.1) < 0.008 ? GOLD : null);
    const elbowAt = elbow.at.clone();
    const fdir = hand.W.clone().sub(elbowAt);
    const flen = fdir.length();
    fdir.normalize();
    b.frustumBox(
      [s * 0.72, 1.25, -0.03],
      [hand.W.x - s * 0.01, hand.W.y + 0.02, hand.W.z - 0.01],
      [0.16, 0.16],
      [0.24, 0.24],
      {
        bone: elbow,
        color: metal(STEEL, 73, vamTrim),
        group,
      },
    );
    const FIN: Pt[] = [
      [0, 0],
      [0.3, 0],
      [0.38, 0.05],
      [0.27, 0.075],
      [0.2, 0.17, "sharp"],
      [0.12, 0.09],
      [0.02, 0.06],
    ];
    const out = V(s * 0.85, 0.3, -0.35).normalize();
    for (const [k, off] of [0.02, flen * 0.5].entries()) {
      const finPts = k === 0 ? FIN : scaled(FIN, 0.7);
      b.extrude(finPts, {
        at: elbowAt
          .clone()
          .addScaledVector(fdir, off + 0.05)
          .addScaledVector(out, 0.085 - k * 0.01),
        x: fdir,
        y: out,
        thickness: 0.016,
        bevel: 0.004,
        bone: elbow,
        color: plate(finPts, STEEL, 74 + k, { rim: 0.008, groove: 0.02 }),
        group,
      });
    }
    b.lathe(
      [
        [0.0, -0.03],
        [0.13, -0.03],
        [0.165, 0.04],
        [0.125, 0.08],
        [0.0, 0.08],
      ],
      {
        at: hand.W.clone().addScaledVector(hand.u, -0.03),
        axis: hand.u,
        segments: 8,
        bone: wrist,
        color: metal(GOLD, 74),
        group,
      },
    );
    // Palm, back-of-hand plate and knuckle spikes.
    const palmQ = orient(hand.v, hand.u, hand.w);
    b.part(new BoxGeometry(0.135 * HSC, 0.125 * HSC, 0.06 * HSC), metal(STEEL, 75), {
      bone: wrist,
      at: hp(hand, 0.06, 0, 0),
      quat: palmQ,
      group,
    });
    b.part(new BoxGeometry(0.15 * HSC, 0.09 * HSC, 0.03 * HSC), metal(GOLD, 76, undefined, 0.4), {
      bone: wrist,
      at: hp(hand, 0.07, 0, 0.038),
      quat: palmQ,
      group,
    });
    b.part(new IcosahedronGeometry(0.022 * HSC, 0), metal(FEL, 77), {
      bone: wrist,
      at: hp(hand, 0.07, 0, 0.056),
      quat: palmQ,
      scale: [1, 1, 0.6],
      group,
    });
    for (const off of [0.048, 0.016, -0.016, -0.046]) {
      spikeOn(
        wrist,
        hp(hand, 0.105, off, 0.03),
        hand.w.clone().addScaledVector(hand.u, 0.5).normalize(),
        0.055 * HSC,
        0.014 * HSC,
        metal(GOLD, 78),
        group,
        5,
      );
    }
    // Fingers: index to pinky, then the thumb.
    const fist = s < 0;
    const fingers = [
      ["index", 0.048, 1.0],
      ["middle", 0.016, 1.08],
      ["ring", -0.016, 1.0],
      ["pinky", -0.046, 0.82],
    ] as const;
    const curlFist: [number, number][] = [
      [0, 0],
      [0.055, 0.004],
      [0.085, 0.04],
      [0.04, 0.072],
    ];
    const curlOpen: [number, number][] = [
      [0, 0],
      [0.058, 0.004],
      [0.1, 0.022],
      [0.135, 0.05],
    ];
    for (const [name, off, len] of fingers) {
      const pts = (fist ? curlFist : curlOpen).map(([a, k]) => hp(hand, 0.115 + a * len, off, -k));
      const fj = b.chain(`${name}${side}`, polyline(pts), {
        parent: wrist,
        names: [`${name}${side}1`, `${name}${side}2`, `${name}${side}3`],
        role: "digit",
        group,
      });
      b.sweep(fj, [0.0175 * HSC, 0.014 * HSC, 0.011 * HSC], {
        color: metal(STEEL, 80),
        sides: 5,
        caps: { start: "round", end: "point" },
        group,
      });
    }
    const thumbPts = fist
      ? [
          hp(hand, 0.03, 0.075, -0.005),
          hp(hand, 0.085, 0.085, -0.02),
          hp(hand, 0.135, 0.062, -0.055),
          hp(hand, 0.15, 0.035, -0.082),
        ]
      : [
          hp(hand, 0.02, 0.07, -0.01),
          hp(hand, 0.06, 0.1, -0.025),
          hp(hand, 0.09, 0.125, -0.04),
          hp(hand, 0.115, 0.14, -0.055),
        ];
    const tj = b.chain(`thumb${side}`, polyline(thumbPts), {
      parent: wrist,
      names: [`thumb${side}1`, `thumb${side}2`, `thumb${side}3`],
      role: "digit",
      group,
    });
    b.sweep(tj, [0.021 * HSC, 0.017 * HSC, 0.012 * HSC], {
      color: metal(STEEL, 81),
      sides: 5,
      caps: { start: "round", end: "point" },
      group,
    });

    // Pauldron: a dome cap and three overlapping lames stepping down the arm, horn spikes and a skull. Each tier is a
    // solid bowl squashed front to back, so the whole is long across the shoulder and shallow from the front.
    const S = shoulder.at.clone();
    const ZS = 0.65;
    const PS = 1.15; // pauldrons are enormous
    const tiers = [
      { r: 0.3, h: 0.14, off: V(s * 0.1, 0.11, 0), axis: V(s * 0.5, 0.85, 0) },
      { r: 0.33, h: 0.09, off: V(s * 0.17, 0.035, 0), axis: V(s * 0.72, 0.69, 0) },
      { r: 0.31, h: 0.08, off: V(s * 0.235, -0.055, 0), axis: V(s * 0.88, 0.47, 0) },
      { r: 0.27, h: 0.07, off: V(s * 0.285, -0.14, 0), axis: V(s * 0.97, 0.25, 0) },
    ].map((t) => ({
      ...t,
      r: t.r * PS,
      h: t.h * PS,
      axis: t.axis.normalize(),
      c: S.clone().addScaledVector(t.off, PS),
    }));
    const across = (axis: Vector3) => F.clone().cross(axis).multiplyScalar(-s).normalize();
    tiers.forEach((t, k) => {
      const geo = new LatheGeometry(
        [
          new Vector2(0, 0),
          new Vector2(t.r, 0),
          new Vector2(t.r * 0.985, t.h * 0.3),
          new Vector2(t.r * 0.86, t.h * 0.68),
          new Vector2(t.r * 0.56, t.h * 0.94),
          new Vector2(0, t.h),
        ],
        12,
      );
      const trim: Trim = (p) => {
        const hgt = (p.x - t.c.x) * t.axis.x + (p.y - t.c.y) * t.axis.y + (p.z - t.c.z) * t.axis.z;
        return hgt < 0.022 ? GOLD : Math.abs(hgt - 0.042) < 0.003 ? FEL_MID : null;
      };
      b.part(geo, metal(STEEL, 90 + k + (s < 0 ? 5 : 0), trim), {
        bone: shoulder,
        at: t.c,
        quat: orient(across(t.axis), t.axis, F),
        scale: [1, 1, ZS],
        group,
        name: "pauldron",
      });
    });
    // Horn spikes rising from the cap.
    const A0 = tiers[0].axis;
    const hornDefs = [
      {
        base: tiers[0].c.clone().addScaledVector(A0, 0.1).addScaledVector(F, 0.09),
        tipOff: V(s * 0.12, 0.28, 0.2),
        bulge: V(s * 0.1, 0.12, 0.1),
      },
      {
        base: tiers[0].c.clone().addScaledVector(A0, 0.12),
        tipOff: V(s * 0.2, 0.38, -0.02),
        bulge: V(s * 0.16, 0.14, 0.0),
      },
      {
        base: tiers[0].c.clone().addScaledVector(A0, 0.1).addScaledVector(F, -0.1),
        tipOff: V(s * 0.12, 0.28, -0.24),
        bulge: V(s * 0.1, 0.12, -0.1),
      },
    ];
    for (const h of hornDefs) {
      b.sweep(bezier(h.base, h.base.clone().add(h.bulge), h.base.clone().add(h.tipOff)), [0.052, 0.0], {
        bone: shoulder,
        bands: [
          [0.16, goldPaint],
          [1, steel],
        ],
        caps: { start: "flat", end: "point" },
        sides: 7,
        group,
      });
    }
    // Rim spikes round the lower lames.
    for (const k of [1, 2, 3]) {
      const t = tiers[k];
      const e2 = across(t.axis);
      for (let i = 0; i < 5; i++) {
        const phi = 0.2 + i * 0.68;
        const base = t.c
          .clone()
          .addScaledVector(e2, Math.sin(phi) * t.r * 0.97)
          .addScaledVector(F, Math.cos(phi) * t.r * 0.97 * ZS);
        const dir = e2
          .clone()
          .multiplyScalar(Math.sin(phi) * ZS)
          .addScaledVector(F, Math.cos(phi))
          .addScaledVector(t.axis, -0.25)
          .normalize();
        spikeOn(shoulder, base, dir, 0.125, 0.032, metal(GOLD, 100), group);
      }
    }
    // Skull on the front of the second lame, with tusks.
    const skullSize = s < 0 ? 0.19 : 0.165;
    const skullAt = tiers[1].c.clone().add(V(0, 0.03, 0.22));
    const face = V(s * 0.3, 0.1, 0.95);
    skullRelief(b, skullAt, face, skullSize, {
      bone: shoulder,
      group,
      glow: true,
      seed: 110 + (s < 0 ? 1 : 0),
      name: `skull${side}`,
    });
    const sx = V(0, 1, 0).cross(face.clone().normalize()).normalize();
    const sy = face.clone().normalize().cross(sx).normalize();
    for (const t of [-1, 1])
      spikeOn(
        shoulder,
        skullAt
          .clone()
          .addScaledVector(sx, t * skullSize * 0.28)
          .addScaledVector(sy, -skullSize * 0.5),
        V(t * 0.2, -0.4, 0.7),
        0.09,
        0.02,
        boneMetal,
        group,
        5,
      );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Head: painted great helm, horns, crest, glowing mask, hinged jaw. Drawn in unscaled coordinates, placed with hz.
  const crownTrim: Trim = (p) =>
    Math.abs(p.y - hz(0, 2.04, 0).y) < 0.009 ? GOLD : Math.abs(p.y - hz(0, 1.86, 0).y) < 0.008 ? GOLD : null;
  const helm = b.loft(
    [
      { at: hz(0, 1.83, 0.05), w: 0.29 * HS, h: 0.3 * HS },
      { at: hz(0, 1.91, 0.05), w: 0.36 * HS, h: 0.32 * HS },
      { at: hz(0, 1.96, 0.05), w: 0.34 * HS, h: 0.3 * HS },
      { at: hz(0, 1.995, 0.05), w: 0.24 * HS, h: 0.24 * HS },
    ],
    { bone: head, color: metal(STEEL, 120, crownTrim), sides: 8, group: "head", name: "helm" },
  );
  // Face mask: eye slits, nasal ridge and mouth grille are painted into it.
  const MASK = scaled(
    mirror([
      [0, 0.085],
      [0.06, 0.1],
      [0.15, 0.12],
      [0.178, 0.085],
      [0.17, 0.03],
      [0.15, -0.03],
      [0.125, -0.075],
      [0.06, -0.12],
      [0, -0.14],
    ]),
    HS,
  );
  const maskTrim: Trim = (_p, _n, sc) => {
    const x = Math.abs(sc[0]) / HS;
    const y = sc[1] / HS;
    const de = segDist(x, y, 0.025, 0.004, 0.118, 0.042);
    const taper = 0.0085 * (1 - 0.55 * clamp01((x - 0.025) / 0.1));
    if (de < taper * 0.5) return FEL_CORE;
    if (de < taper) return FEL_MID;
    if (de < 0.026) return mix("#0c1620", "#5cf03a", 0.85 * smoothstep(0.026, taper, de));
    if (x < 0.013 && y < 0.03 && y > -0.1) return GOLD;
    if (y > 0.062 && y < 0.076) return GOLD;
    if (y < -0.055 && y > -0.1 && x < 0.1) {
      const f = Math.abs(((x / 0.02 + 0.5) % 1) - 0.5);
      if (f < 0.2) return mix("#0a1a08", "#3fd020", 0.5 * smoothstep(0.1, 0.2, f) + 0.2);
    }
    return null;
  };
  b.extrude(MASK, {
    at: hz(0, 1.95, 0.195),
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.07 * HS,
    bevel: 0.014 * HS,
    smoothing: 1,
    bone: head,
    color: plate(MASK, STEEL, 121, { rim: 0.008, groove: 0.018, extra: maskTrim }),
    group: "head",
    name: "mask",
  });
  // Eye wisps of fel fire, trailing up and back.
  for (const [s] of SIDES) {
    const eyeAt = hz(s * 0.11, 1.985, 0.23);
    b.cards([frame(eyeAt, [s * 0.5, 1, -0.15])], FLAME_TEX, {
      size: [0.09, 0.2],
      bone: head,
      cross: true,
      bend: 25,
      flow: [s * 0.3, 0.2, -1],
      group: "head",
    });
  }
  // Horns: gold collars, ridged bone sweeping out, up and forward; small brow horns; cheek spikes.
  for (const [s] of SIDES) {
    b.sweep(
      bezier(hz(s * 0.16, 1.98, 0.02), hz(s * 0.46, 1.96, -0.04), hz(s * 0.46, 2.1, 0.08), hz(s * 0.36, 2.15, 0.22)),
      [0.052 * HS, 0.004],
      {
        bone: head,
        bands: [
          [0.17, goldPaint],
          [1, HORN],
        ],
        caps: { start: "flat", end: "point" },
        sides: 7,
        group: "head",
        name: "horn",
      },
    );
    b.sweep(bezier(hz(s * 0.1, 2.04, 0.13), hz(s * 0.14, 2.12, 0.15), hz(s * 0.12, 2.17, 0.1)), [0.026 * HS, 0.0], {
      bone: head,
      color: HORN,
      caps: { end: "point" },
      sides: 5,
      group: "head",
    });
    spikeOn(head, hz(s * 0.15, 1.89, 0.16), V(s * 0.6, -0.3, 0.6), 0.11, 0.03, goldPaint, "head");
  }
  const helmSurface = b.surface(helm);
  for (let i = 0; i < 6; i++) {
    const z = 0.13 - i * 0.05;
    const hit = helmSurface.ray([0, 3, hz(0, 2, z).z], [0, -1, 0]);
    if (hit)
      spikeOn(
        head,
        hit.at,
        V(0, 1, -0.4),
        (0.035 + 0.04 * Math.sin(((i + 0.5) / 6) * Math.PI)) * HS,
        0.026,
        goldPaint,
        "head",
        5,
      );
  }
  // Hinged jaw: chin guard, teeth and a tusk each side.
  const jawTrim: Trim = (p, n) => (n.z > 0.5 && Math.abs(((p.x / 0.03 + 0.5) % 1) - 0.5) < 0.12 ? GROOVE : null);
  b.frustumBox(hz(0, 1.83, 0.0), hz(0, 1.815, 0.235), [0.22 * HS, 0.09 * HS], [0.14 * HS, 0.08 * HS], {
    bone: jaw,
    color: metal(STEEL, 130, jawTrim),
    group: "head",
    name: "chinGuard",
  });
  for (const [s] of SIDES) spikeOn(jaw, hz(s * 0.055, 1.83, 0.225), V(0, 1, 0.5), 0.1, 0.022, boneMetal, "head", 5);
  spikeOn(jaw, hz(0, 1.79, 0.235), V(0, -0.5, 1), 0.1, 0.038, goldPaint, "head", 5);

  // -------------------------------------------------------------------------------------------------------------
  // Greatsword in the right fist. Sword frame: ax along the blade, fz forward (the broad face), sx across.
  const G = hp(HANDS.R, 0.15, 0.0, -0.04);
  const ax = V(-0.16, 1, 0.06).normalize();
  const fz = V(0, 0, 1).addScaledVector(ax, -ax.z).normalize();
  const sx = ax.clone().cross(fz).normalize();
  const QS = orient(sx, ax, fz);
  const wristR = arms[1].wrist;
  const P = (a: number, v: number, w: number) =>
    G.clone().addScaledVector(sx, a).addScaledVector(ax, v).addScaledVector(fz, w);
  const sword = "sword";
  b.part(new CylinderGeometry(0.034, 0.034, 0.46, 8), GRIP_WRAP, {
    bone: wristR,
    at: P(0, -0.02, 0),
    quat: QS,
    group: sword,
    name: "grip",
  });
  for (const v of [-0.25, 0.215])
    b.part(new CylinderGeometry(0.047, 0.047, 0.03, 8), goldPaint, {
      bone: wristR,
      at: P(0, v, 0),
      quat: QS,
      group: sword,
    });
  b.part(new OctahedronGeometry(0.09), metal(GOLD, 140), {
    bone: wristR,
    at: P(0, -0.31, 0),
    quat: QS,
    scale: [1, 1.15, 1],
    group: sword,
    name: "pommel",
  });
  spikeOn(wristR, P(0, -0.37, 0), ax.clone().negate(), 0.16, 0.05, metal(GOLD, 141), sword);
  for (const t of [-1, 1]) {
    spikeOn(
      wristR,
      P(t * 0.06, -0.31, 0),
      sx.clone().multiplyScalar(t).addScaledVector(ax, -0.3).normalize(),
      0.1,
      0.024,
      metal(GOLD, 142),
      sword,
      5,
    );
    spikeOn(
      wristR,
      P(0, -0.31, t * 0.06),
      fz.clone().multiplyScalar(t).addScaledVector(ax, -0.3).normalize(),
      0.1,
      0.024,
      metal(GOLD, 143),
      sword,
      5,
    );
  }
  b.part(new IcosahedronGeometry(0.032, 0), metal(FEL, 144), {
    bone: wristR,
    at: P(0, -0.31, 0.075),
    quat: QS,
    scale: [1, 1.2, 0.8],
    group: sword,
  });
  // Crossguard: a winged guard, feathers stepping down, gems at the roots and a skull between.
  const WING = scaled(
    [
      [0.03, 0.06],
      [0.14, 0.1],
      [0.26, 0.17],
      [0.35, 0.29, "sharp"],
      [0.33, 0.13],
      [0.4, 0.09, "sharp"],
      [0.3, 0.03],
      [0.36, -0.03, "sharp"],
      [0.24, -0.02],
      [0.28, -0.1, "sharp"],
      [0.14, -0.04],
      [0.03, -0.05],
    ],
    1.15,
  );
  for (const t of [-1, 1]) {
    b.extrude(WING, {
      at: P(0, 0.235, 0),
      x: sx.clone().multiplyScalar(t),
      y: ax,
      thickness: 0.05,
      bevel: 0.011,
      bone: wristR,
      color: plate(WING, GOLD, 145 + (t > 0 ? 1 : 0), { rim: 0.007, groove: 0.018, rimTones: EDGE }),
      group: sword,
      name: "wing",
    });
    b.part(new IcosahedronGeometry(0.036, 0), metal(FEL, 147), {
      bone: wristR,
      at: P(t * 0.13, 0.265, 0.034),
      quat: QS,
      scale: [1, 1, 0.8],
      group: sword,
    });
  }
  b.part(new CylinderGeometry(0.062, 0.062, 0.11, 8), metal(GOLD, 148), {
    bone: wristR,
    at: P(0, 0.235, 0),
    quat: orient(fz, sx, ax),
    group: sword,
  });
  skullRelief(b, P(0, 0.25, 0.045), fz, 0.095, {
    bone: wristR,
    group: sword,
    glow: true,
    seed: 149,
    name: "guardSkull",
  });
  // Blade: a broad slab with notched spurs near the guard, runes down the fuller, a keen tip.
  const KW = 1.25;
  const BLADE = mirror(
    (
      [
        [0, 1.04],
        [0.05, 0.97],
        [0.095, 0.85],
        [0.108, 0.7],
        [0.108, 0.32],
        [0.092, 0.24],
        [0.112, 0.18],
        [0.09, 0.11],
        [0.105, 0.06],
        [0.055, 0.0],
        [0, 0.0],
      ] as const
    ).map(([x, y]): Pt => [x * KW, y]),
  );
  b.extrude(BLADE, {
    at: P(0, 0.28, 0),
    x: sx,
    y: ax,
    thickness: 0.046,
    bevel: 0.012,
    bone: wristR,
    color: plate(BLADE, STEEL, 150, { rim: 0.022, groove: 0.04, rimTones: EDGE }),
    group: sword,
    name: "blade",
  });
  for (const t of [1, -1])
    b.part(new PlaneGeometry(0.094, 0.88), "#ffffff", {
      at: P(0, 0.28 + 0.06 + 0.44, t * 0.0245),
      dir: fz.clone().multiplyScalar(t),
      axis: "z",
      up: ax,
      texture: BLADE_TEX,
      bone: wristR,
      group: sword,
      name: "runes",
    });
  // Fel fire licking up the blade's edges.
  const flames = [
    [0.4, 0.135],
    [0.55, 0.135],
    [0.7, 0.135],
    [0.84, 0.119],
    [0.94, 0.08],
  ].flatMap(([vb, hw]) =>
    [-1, 1].map((t) =>
      frame(
        P(t * hw, 0.28 + vb, 0),
        sx
          .clone()
          .multiplyScalar(t * 0.7)
          .add(ax)
          .normalize(),
      ),
    ),
  );
  b.cards(flames, FLAME_TEX, {
    size: [0.07, 0.17],
    bone: wristR,
    cross: true,
    bend: 25,
    vary: 0.25,
    rng: rng(8),
    flow: fz.clone().multiplyScalar(-1),
    group: sword,
    name: "felFire",
  });

  // -------------------------------------------------------------------------------------------------------------
  // Cape: nine skinned strips with a torn hem, hanging from a gold yoke behind the pauldrons, a sigil painted on it.
  const HEM = [0.44, 0.22, 0.48, 0.2, 0.5, 0.22, 0.46, 0.22, 0.42];
  const strips = HEM.map((hemY, k) => {
    const x = -0.36 + k * 0.09;
    return b.chain(
      `cape${k}`,
      [
        [x, 1.72, -0.17],
        [x * 1.22, 1.25, -0.24 - 0.04 * (1 - Math.abs(k - 4) / 4)],
        [x * 1.4, 0.75, -0.32 - 0.07 * (1 - Math.abs(k - 4) / 4)],
        [x * 1.55, hemY, -0.42 - 0.02 * (k % 2) - 0.09 * (1 - Math.abs(k - 4) / 4)],
      ],
      { parent: chest, names: [`cape${k}a`, `cape${k}b`, `cape${k}c`], group: "cape" },
    );
  });
  for (let k = 0; k < strips.length - 1; k++)
    b.membrane(strips[k], strips[k + 1], { color: capePaint, thickness: 0.012, rows: 2, group: "cape", name: "cape" });
  for (const k of [1, 3, 5, 7]) {
    const tip = strips[k].joints[2];
    const end = V(-0.36 + k * 0.09, 0, 0).multiplyScalar(1.55);
    end.set(end.x, HEM[k], -0.42 - 0.02 * (k % 2) - 0.09 * (1 - Math.abs(k - 4) / 4));
    b.sweep(
      bezier(end, end.clone().add(V(0.02, -0.06, -0.03)), end.clone().add(V(-0.01, -0.13, -0.05))),
      (t) => [0.035 * (1 - t) + 0.006, 0.005],
      {
        bone: tip,
        section: "box",
        up: [0, 0, 1],
        caps: "flat",
        color: capePaint,
        group: "cape",
      },
    );
  }
  b.sweep(
    catmull([
      [-0.4, 1.66, -0.06],
      [-0.3, 1.73, -0.16],
      [0, 1.76, -0.19],
      [0.3, 1.73, -0.16],
      [0.4, 1.66, -0.06],
    ]),
    0.035,
    { bone: chest, color: goldPaint, sides: 6, group: "cape" },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Chains: a swag across the chest and two harness chains from the pauldron skulls to the buckle.
  const swag = torsoSurface.drape(
    catmull([V(-0.46, 1.6, 0.26), V(-0.25, 1.52, 0.31), V(0, 1.47, 0.34), V(0.25, 1.52, 0.31), V(0.46, 1.6, 0.26)]),
    { lift: 0.03 },
  );
  b.sweep(swag, 0.011, { color: CHAIN_LINKS(swag.length), sides: 5, group: "torso" });
  for (const [s] of SIDES) {
    const harness = torsoSurface.drape(
      catmull([V(s * 0.36, 1.6, 0.3), V(s * 0.26, 1.42, 0.3), V(s * 0.12, 1.24, 0.24), V(0, 1.18, 0.2)]),
      { lift: 0.035 },
    );
    b.sweep(harness, 0.011, { color: CHAIN_LINKS(harness.length), sides: 5, group: "torso" });
  }

  return b.root;
}
