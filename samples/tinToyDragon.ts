// A 1950s wind-up tin toy dragon, 30 cm from nose to tail, lithographed in four inks on cream paper and pressed into
// shape. Its skin is one printed sheet of fish scales (blue over yellow overprints to green, a few red accent scales,
// black keylines, a red-and-yellow chevron stripe down the back, halftone shading dots) that runs unbroken from tail
// over body to neck. Every plate is slightly off register: cream slivers and overprints where the inks meet, and a
// bare-tin margin where the print stops short of the edge. Stamped pieces (wing panels, head, jaws, feet, dorsal fins,
// tail spade) are flat plates with rolled edges; the neck and tail are crimped concertinas; seams are rolled beads
// with folded tabs; hinges, axles and rivets are bare tin. Hidden wheels roll under the feet, the sparking flint sits
// in the open mouth, and the big butterfly key is its own joint.
import { BoxGeometry, CylinderGeometry, PlaneGeometry, SphereGeometry, TorusGeometry, Vector3 } from "three";
import type { BufferGeometry } from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { Paint, mottle, noise, paint, smoothstep } from "../src/paint";
import type { Rgb } from "../src/paint";
import type { OutlinePoint } from "../src/outline";
import { bezier, catmull, polyline } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Tin Toy Dragon",
  builtBy: "Claude Sonnet 5.5",
  description:
    "A vintage lithographed wind-up tin dragon, 30 cm long: a crimped-tin body printed with off-register fish scales in four inks, pressed-tin wings on hinged panels, a stamped head with an openable jaw and a sparking flint in its mouth, a concertina neck and tail with a tin spade, a big butterfly wind-up key that is its own joint, and rolling wheels hidden under its feet.",
};

// ---------------------------------------------------------------------------------------------------------------
// Inks. Each is a transparent filter multiplied onto the cream paper, so where two plates overlap (off register)
// they overprint: yellow under red goes deep red, blue over yellow goes green.
type Ink = readonly [number, number, number];
const PAPER: Ink = [0.95, 0.9, 0.78];
const YEL: Ink = [1.0, 0.8, 0.1];
const RED: Ink = [0.9, 0.16, 0.11];
const BLU: Ink = [0.1, 0.32, 0.7];
const BLK: Ink = [0.1, 0.09, 0.11];
const TIN_RGB: Rgb = [0.78, 0.8, 0.82];

const TIN_DK = "#8b9297";
const SOOT = "#2b2b30";

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
const fract = (x: number) => x - Math.floor(x);
const V = (x: number, y: number, z: number) => new Vector3(x, y, z);
/** 1 inside, 0 outside, with a fine antialiased edge; `d` is the signed distance inside, in meters. */
const cov = (d: number) => smoothstep(-0.00028, 0.00028, d);
const wrapDeg = (d: number) => ((((d + 180) % 360) + 360) % 360) - 180;

type Layer = readonly [Ink, number];

/** Lay the ink plates over the paper, then let the print chip away here and there (and at `tin`) to show the tin. */
function press(p: Vector3, layers: readonly Layer[], tin = 0): Rgb {
  let r = PAPER[0];
  let g = PAPER[1];
  let b = PAPER[2];
  for (const [ink, k] of layers) {
    if (k <= 0.001) continue;
    r *= 1 - k + k * ink[0];
    g *= 1 - k + k * ink[1];
    b *= 1 - k + k * ink[2];
  }
  const chip = Math.max(smoothstep(0.84, 0.88, noise(p, 0.003, 5)) * 0.8, tin);
  if (chip <= 0) return [r, g, b];
  return [r + (TIN_RGB[0] - r) * chip, g + (TIN_RGB[1] - g) * chip, b + (TIN_RGB[2] - b) * chip];
}

/** A halftone screen at 45°, dots growing with `amount` (0..1); the screen follows the face that faces most. */
function dots(p: Vector3, n: Vector3, amount: number) {
  if (amount <= 0.02) return 0;
  const ax = Math.abs(n.x);
  const ay = Math.abs(n.y);
  const az = Math.abs(n.z);
  let u: number;
  let v: number;
  if (ay >= ax && ay >= az) {
    u = p.x;
    v = p.z;
  } else if (ax >= az) {
    u = p.z;
    v = p.y;
  } else {
    u = p.x;
    v = p.y;
  }
  const cell = 0.0026;
  const ru = ((u + v) * 0.7071) / cell;
  const rv = ((u - v) * 0.7071) / cell;
  const d = Math.hypot(ru - Math.round(ru), rv - Math.round(rv));
  const rad = 0.62 * Math.sqrt(Math.min(amount, 1));
  return smoothstep(rad + 0.09, rad - 0.09, d);
}

/** Shade dots printed where the surface turns away from the light. */
const shade = (p: Vector3, n: Vector3, from = 0.85, to = 0.4, gain = 0.9) =>
  dots(p, n, smoothstep(from, to, n.y) * gain);

const TINP = mottle("#b6bcc1", "#969da3", { size: 0.012, contrast: 0.45, seed: 3 });

// ---------------------------------------------------------------------------------------------------------------
// Signed inside distance (m) to an outline, positive inside.
function polyInside(pts: readonly OutlinePoint[], x: number, y: number) {
  let inside = false;
  let best = Infinity;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const ax = pts[j][0];
    const ay = pts[j][1];
    const bx = pts[i][0];
    const by = pts[i][1];
    if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) inside = !inside;
    const dx = bx - ax;
    const dy = by - ay;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
    best = Math.min(best, Math.hypot(x - ax - t * dx, y - ay - t * dy));
  }
  return inside ? best : -best;
}

/** Signed inside distance (m) of the first half of a 50% duty wedge cycle `q` in 0..1. */
function halfWedge(q: number, width: number) {
  return q < 0.5 ? Math.min(q, 0.5 - q) * width : -Math.min(q - 0.5, 1 - q) * width;
}

/**
 * A stamped plate's print: base inks flooded inside, a border band knocked out of them, black keylines, and a tin
 * flange where the print stops. The faces get the print; the rolled edge (normal across the thickness) is bare tin,
 * or, on thick plates, printed in two-ink bands (`rim`).
 */
function platePaint(
  pts: readonly OutlinePoint[],
  w: Vector3,
  inks: readonly Ink[],
  band: Ink | null,
  deco?: (x: number, y: number) => { knock: number; layers: readonly Layer[] },
  bw = 0.0032,
  rim?: readonly [Ink, Ink],
) {
  return paint((p, n, s) => {
    if (Math.abs(n.dot(w)) < 0.85) {
      if (!rim) return TINP;
      const q = fract((s[0] * 0.8 + s[1] * 0.6 + 0.0006) / 0.0055);
      const dq = halfWedge(q, 0.0055);
      const rule = Math.min(q, Math.abs(q - 0.5), 1 - q) * 0.0055;
      return press(p, [
        [rim[0], cov(dq)],
        [rim[1], cov(-dq + 0.0004)],
        [BLK, 0.85 * cov(0.0004 - rule)],
        [BLK, 0.4 * shade(p, n, 0.3, -0.6, 0.7)],
      ]);
    }
    const [x, y] = s;
    const d = polyInside(pts, x, y);
    const dA = polyInside(pts, x + 0.0005, y - 0.0004);
    const dB = polyInside(pts, x - 0.0004, y + 0.0005);
    const bandM = band ? cov(dB - 0.0012) * (1 - cov(dB - bw)) : 0;
    const extra = deco ? deco(x, y) : { knock: 0, layers: [] as readonly Layer[] };
    const fill = (1 - bandM) * (1 - extra.knock);
    const layers: Layer[] = [];
    inks.forEach((ink, i) => layers.push([ink, cov((i ? dA : d) - 0.0009) * fill]));
    if (band) layers.push([band, bandM]);
    layers.push([BLK, 0.9 * cov(0.0004 - Math.abs(d - bw - 0.0004))]);
    layers.push([BLK, 0.9 * cov(0.0003 - Math.abs(d - 0.0009))]);
    layers.push(...extra.layers);
    layers.push([BLK, 0.4 * shade(p, n, 0.3, -0.6, 0.7)]);
    return press(p, layers, 1 - cov(d - 0.0005));
  });
}

// ---------------------------------------------------------------------------------------------------------------
// The skin: printed fish scales on a sheet of (length along the piece, arc around it), shared by tail, body and neck.
const SX = 0.0084;
const SY = 0.0062;
const SR = 0.0051;

type ScaleCell = { d: number; cx: number; cy: number; h: number };
/** The scale that shows at (X, Y): among the overlapping circles the one in the latest row is on top. */
function scaleAt(X: number, Y: number): ScaleCell {
  const j0 = Math.round(Y / SY);
  let best: ScaleCell = { d: 1, cx: 0, cy: 0, h: 0 };
  let bestKey = -Infinity;
  for (let dj = -1; dj <= 1; dj++) {
    const j = j0 + dj;
    const off = j & 1 ? SX / 2 : 0;
    const i0 = Math.round((X - off) / SX);
    for (let di = -1; di <= 1; di++) {
      const i = i0 + di;
      const cx = i * SX + off;
      const cy = j * SY;
      const d = Math.hypot(X - cx, Y - cy);
      if (d >= SR) continue;
      const key = j * 4096 + i;
      if (key > bestKey) {
        bestKey = key;
        best = { d, cx, cy, h: fract(Math.sin(i * 12.9898 + j * 78.233) * 43758.5453) };
      }
    }
  }
  return best;
}

function skinPaint(len: number, rad: number) {
  return paint((p, n, s) => {
    const X = s[0] * len;
    const ang = wrapDeg(s[1]);
    const Y = ang * DEG * rad;
    const shadeK = 0.5 * shade(p, n, 0.5, -0.3, 0.75);
    if (Math.abs(ang) > 128) {
      // Belly plates: cream with red bars, a thin yellow stripe in each gap, black rules.
      const period = 0.0072;
      const f = fract((X + 0.0004) / period);
      const dRed = f < 0.45 ? Math.min(f, 0.45 - f) * period : -Math.min(f - 0.45, 1 - f) * period;
      const yel = cov(0.0009 - Math.abs(fract((X - 0.0004) / period) - 0.73) * period);
      const f0 = fract(X / period);
      const rule = Math.min(f0, Math.abs(f0 - 0.45), 1 - f0) * period;
      return press(p, [
        [RED, cov(dRed)],
        [YEL, yel],
        [BLK, 0.9 * cov(0.0004 - rule)],
        [BLK, 0.5 * shadeK],
      ]);
    }
    // The chevron stripe down the back.
    const half = 0.0056;
    const stripe = cov(half - Math.abs(Y));
    const g = fract((X + Math.abs(Y) * 1.15) / 0.0078);
    const chev = g < 0.42 ? 1 : 0;
    const stripeRule = cov(0.0004 - Math.abs(Math.abs(Y) - half));
    // Scales: yellow flood, blue plate a hair off, red accent scales, black keylines.
    const c0 = scaleAt(X, Y);
    const c1 = scaleAt(X - 0.0004, Y + 0.0003);
    const inner = cov(SR - 0.0012 - c1.d);
    const hl = cov(0.0017 - Math.hypot(X - 0.0004 - c1.cx, Y + 0.0003 - (c1.cy + 0.0012)));
    const blueM = inner * (1 - hl);
    const accent = c1.h < 0.15 ? 1 : 0;
    const rim = cov(0.00042 - Math.abs(c0.d - (SR - 0.0003)));
    const sc = 1 - stripe;
    return press(p, [
      [YEL, 1 - stripe * (1 - chev)],
      [BLU, blueM * (1 - accent) * sc],
      [RED, Math.max(blueM * accent * sc, stripe * (1 - chev))],
      [BLK, 0.9 * Math.max(rim * sc, stripeRule)],
      [BLK, shadeK],
    ]);
  });
}

// ---------------------------------------------------------------------------------------------------------------
// The wing: one drawing of the whole wing in (span u, chord v) meters, cut into three panels at the folds. v runs
// toward the trailing edge; the scalloped tips fan back like a bat's.
const WING: readonly OutlinePoint[] = [
  [0, -0.002],
  [0.03, -0.01],
  [0.062, -0.01],
  [0.095, 0.0],
  [0.126, 0.024, "sharp"],
  [0.101, 0.033],
  [0.092, 0.062, "sharp"],
  [0.07, 0.06],
  [0.056, 0.08, "sharp"],
  [0.034, 0.064],
  [0.012, 0.078, "sharp"],
  [0.0, 0.068],
];
const FOLDS = [0.04, 0.082];

/** The wing outline between two span stations. */
function clipU(poly: readonly OutlinePoint[], u0: number, u1: number): OutlinePoint[] {
  const cut = (
    pts: readonly (readonly [number, number])[],
    keep: (q: readonly [number, number]) => boolean,
    at: number,
  ) => {
    const out: (readonly [number, number])[] = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const c = pts[(i + 1) % pts.length];
      const ka = keep(a);
      if (ka) out.push(a);
      if (ka !== keep(c)) out.push([at, a[1] + ((c[1] - a[1]) * (at - a[0])) / (c[0] - a[0])]);
    }
    return out;
  };
  const start = poly.map((q) => [q[0], q[1]] as const);
  const lo = cut(start, (q) => q[0] >= u0, u0);
  return cut(lo, (q) => q[0] <= u1, u1).map((q) => [q[0], q[1]] as const);
}

/** Leading and trailing edge v at span station u. */
function edgesAt(u: number) {
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0, j = WING.length - 1; i < WING.length; j = i++) {
    const [ax, ay] = WING[j];
    const [bx, by] = WING[i];
    if (ax === bx || u < Math.min(ax, bx) || u > Math.max(ax, bx)) continue;
    const v = ay + ((by - ay) * (u - ax)) / (bx - ax);
    lo = Math.min(lo, v);
    hi = Math.max(hi, v);
  }
  return [lo, hi] as const;
}

function wingPaint(w: Vector3) {
  const cx = -0.014;
  const cy = 0.01;
  const pitch = (TAU / 360) * 10;
  return paint((p, n, s) => {
    if (Math.abs(n.dot(w)) < 0.85) return TINP;
    const [u, v] = s;
    const d = polyInside(WING, u, v);
    const dA = polyInside(WING, u + 0.0006, v - 0.0004);
    const dB = polyInside(WING, u - 0.0005, v + 0.0005);
    const bandM = cov(dB - 0.0014) * (1 - cov(dB - 0.0042));
    const r = Math.hypot(u - cx, v - cy);
    const q = fract(Math.atan2(v - cy, u - cx) / pitch);
    const qr = fract(Math.atan2(v - cy - 0.0004, u - cx + 0.0005) / pitch);
    const redM = cov(halfWedge(qr, pitch * r));
    const rayRule = Math.min(q, Math.abs(q - 0.5), 1 - q) * pitch * r;
    const fill = 1 - bandM;
    // Little stars printed in the blue band, one to a wedge pair.
    const band = 0.0028 - Math.abs(dB - 0.0028);
    const sq = fract(Math.atan2(v - cy, u - cx) / (pitch * 2)) - 0.5;
    const dot = cov(0.0009 - Math.hypot(band, sq * pitch * 2 * r));
    return press(
      p,
      [
        [YEL, cov(dA - 0.0009) * fill * (1 - redM) + dot * bandM],
        [RED, cov(d - 0.0009) * fill * redM],
        [BLU, bandM * (1 - dot)],
        [BLK, 0.85 * cov(0.0002 - rayRule) * cov(d - 0.0045)],
        [BLK, 0.9 * cov(0.0004 - Math.abs(d - 0.0046))],
        [BLK, 0.9 * cov(0.0003 - Math.abs(d - 0.0009))],
        [BLK, 0.4 * shade(p, n, 0.3, -0.6, 0.7)],
      ],
      1 - cov(d - 0.0005),
    );
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Outlines of the stamped plates, in meters.
const FIN: readonly OutlinePoint[] = [
  [-0.008, 0.0],
  [-0.003, 0.011],
  [0.004, 0.021, "sharp"],
  [0.006, 0.008],
  [0.009, 0.0],
];
const SPADE: readonly OutlinePoint[] = [
  [0, 0.0035],
  [0.01, 0.011],
  [0.026, 0.0, "sharp"],
  [0.01, -0.011],
  [0, -0.0035],
];
const SKULL: readonly OutlinePoint[] = [
  [-0.014, -0.006],
  [-0.016, 0.014],
  [-0.008, 0.028],
  [0.008, 0.034],
  [0.026, 0.03],
  [0.034, 0.02],
  [0.034, -0.002],
  [0.0, -0.002],
];
const SNOUT: readonly OutlinePoint[] = [
  [0.022, 0.028],
  [0.04, 0.024],
  [0.054, 0.018],
  [0.062, 0.01],
  [0.063, 0.002, "sharp"],
  [0.06, -0.004, "sharp"],
  [0.056, 0.0],
  [0.052, -0.005, "sharp"],
  [0.047, 0.0],
  [0.043, -0.005, "sharp"],
  [0.038, 0.0],
  [0.022, 0.0],
];
const JAW: readonly OutlinePoint[] = [
  [-0.004, 0.003],
  [-0.006, -0.008],
  [0.004, -0.013],
  [0.022, -0.014],
  [0.04, -0.011],
  [0.052, -0.004],
  [0.054, 0.003, "sharp"],
  [0.049, 0.0005],
  [0.046, 0.006, "sharp"],
  [0.041, 0.001],
  [0.037, 0.006, "sharp"],
  [0.032, 0.001],
  [0.0, 0.001],
];
const TONGUE: readonly OutlinePoint[] = [
  [0.006, 0.0],
  [0.03, -0.0005],
  [0.046, 0.0005],
  [0.055, -0.001, "sharp"],
  [0.05, 0.0035],
  [0.056, 0.008, "sharp"],
  [0.044, 0.006],
  [0.03, 0.0045],
  [0.006, 0.0045],
];
const FRILL: readonly OutlinePoint[] = [
  [0.006, 0.0],
  [-0.012, 0.002],
  [-0.028, 0.004, "sharp"],
  [-0.014, 0.01],
  [-0.03, 0.016, "sharp"],
  [-0.014, 0.021],
  [-0.026, 0.031, "sharp"],
  [-0.008, 0.027],
  [-0.014, 0.04, "sharp"],
  [0.004, 0.032],
];
const HEEL: readonly OutlinePoint[] = [
  [-0.011, -0.006],
  [-0.007, -0.0095],
  [0.008, -0.0095],
  [0.012, -0.006],
  [0.012, 0.006],
  [0.008, 0.0095],
  [-0.007, 0.0095],
  [-0.011, 0.006],
];
const TOES: readonly OutlinePoint[] = [
  [0.0, -0.0085],
  [0.007, -0.0085],
  [0.0135, -0.0065, "sharp"],
  [0.0085, -0.0035],
  [0.0145, 0.0, "sharp"],
  [0.0085, 0.0035],
  [0.0135, 0.0065, "sharp"],
  [0.007, 0.0085],
  [0.0, 0.0085],
];

// ---------------------------------------------------------------------------------------------------------------
// Printed drawings. Text renders in the browser with whatever bold sans it has; the drawings are cutouts.
const FONT = `font-family="Impact, 'Arial Black', 'DejaVu Sans', sans-serif" font-weight="900"`;
const BANNER_SHAPE = "M6 14 L194 14 L184 40 L194 66 L6 66 L16 40 Z";

const BANNER = svg(
  `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
    <path d="${BANNER_SHAPE}" fill="#22509b" transform="translate(4 3.5)"/>
    <path d="${BANNER_SHAPE}" fill="#f4ebd0" stroke="#17171b" stroke-width="3" stroke-linejoin="round"/>
    <path d="M12 19 L188 19 L179 40 L188 61 L12 61 L21 40 Z" fill="none" stroke="#d6301f" stroke-width="1.2"/>
    <text x="100" y="29" text-anchor="middle" ${FONT} font-size="8.5" letter-spacing="2" fill="#17171b" textLength="118">TATSU TIN TOY CO. TOKYO</text>
    <text x="102.2" y="51" text-anchor="middle" ${FONT} font-size="24" fill="#17171b" textLength="150" lengthAdjust="spacingAndGlyphs">FIRE DRAGON</text>
    <text x="100" y="49.2" text-anchor="middle" ${FONT} font-size="24" fill="#d6301f" textLength="150" lengthAdjust="spacingAndGlyphs">FIRE DRAGON</text>
    <text x="100" y="59" text-anchor="middle" ${FONT} font-size="6.5" letter-spacing="1.5" fill="#17171b" textLength="110">WIND-UP * NO.5 * SPARKING</text>
  </svg>`,
  { size: 512 },
);

const ROUNDEL = svg(
  `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <defs><path id="ring" d="M128 128 m-104 0 a104 104 0 1 1 208 0 a104 104 0 1 1 -208 0"/></defs>
    <circle cx="131" cy="131" r="112" fill="none" stroke="#22509b" stroke-width="30"/>
    <circle cx="128" cy="128" r="106" fill="none" stroke="#f4ebd0" stroke-width="34"/>
    <circle cx="128" cy="128" r="123" fill="none" stroke="#17171b" stroke-width="4"/>
    <circle cx="128" cy="128" r="89" fill="none" stroke="#17171b" stroke-width="4"/>
    <circle cx="128" cy="128" r="74" fill="#f6c21a" stroke="#17171b" stroke-width="3"/>
    <polygon points="128,70 139,110 182,104 148,132 166,172 128,148 90,172 108,132 74,104 117,110" fill="#d6301f" stroke="#17171b" stroke-width="2.5" stroke-linejoin="round"/>
    <text ${FONT} font-size="19" fill="#17171b"><textPath xlink:href="#ring" textLength="640" lengthAdjust="spacing">TATSU * WIND-UP * MADE IN JAPAN * FIRE * </textPath></text>
  </svg>`.replace("<svg ", `<svg xmlns:xlink="http://www.w3.org/1999/xlink" `),
  { size: 512 },
);

const BADGE = svg(
  `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
    <rect x="9" y="8" width="108" height="46" rx="22" fill="#d6301f" transform="translate(-3 -1.5)"/>
    <rect x="6" y="6" width="108" height="46" rx="22" fill="#f4ebd0" stroke="#17171b" stroke-width="3"/>
    <text x="60" y="26" text-anchor="middle" ${FONT} font-size="14" fill="#17171b" textLength="70" lengthAdjust="spacingAndGlyphs">MADE IN</text>
    <text x="60" y="45" text-anchor="middle" ${FONT} font-size="19" fill="#22509b" textLength="76" lengthAdjust="spacingAndGlyphs">JAPAN</text>
  </svg>`,
  { size: 256 },
);

// The eye as a map for a sphere whose top pole looks out: black pupil with a glint, amber iris, black limbus, cream
// white, and a red print on the back of the ball.
const EYE = svg(
  `<svg viewBox="0 0 96 64" xmlns="http://www.w3.org/2000/svg">
    <rect width="96" height="64" fill="#f3e9c9"/>
    <rect y="0" width="96" height="7.5" fill="#17171b"/>
    <rect y="7.5" width="96" height="6.5" fill="#f2861c" transform="translate(1.5 0.6)"/>
    <rect y="14" width="96" height="1.7" fill="#17171b"/>
    <rect y="0" width="96" height="7.2" fill="#17171b"/>
    <rect y="52" width="96" height="12" fill="#d6301f"/>
    <ellipse cx="22" cy="4.6" rx="7" ry="1.8" fill="#ffffff"/>
    <ellipse cx="70" cy="3.4" rx="4" ry="1.2" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

// A spark: a stamped yellow burst with an orange heart and a white-hot core, on a narrow tail toward the flint.
const SPARK = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <polygon points="32,50 30,60 34,60" fill="#f2861c"/>
    <polygon points="32,6 38,24 57,16 44,32 60,42 41,43 46,58 32,47 18,58 23,43 4,42 20,32 7,16 26,24" fill="#f7c31c" stroke="#d6301f" stroke-width="1.6" stroke-linejoin="round"/>
    <polygon points="32,16 35,29 46,26 38,34 47,42 35,40 32,50 29,40 17,42 26,34 18,26 29,29" fill="#f2861c"/>
    <circle cx="32" cy="34" r="5" fill="#fff3c8"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
// Strip paint: cross-bands along a chain (legs) in two inks on a strip of tin.
function stripPaint(len: number, period: number, phase: number, base: Ink, band: Ink, bandFrac: number) {
  return paint((p, n, s) => {
    const t = s[0] * len;
    const f = fract((t + phase + 0.0006) / period);
    const d = f < bandFrac ? Math.min(f, bandFrac - f) * period : -Math.min(f - bandFrac, 1 - f) * period;
    const f0 = fract((t + phase - 0.0004) / period);
    const line = Math.min(f0, Math.abs(f0 - bandFrac), 1 - f0) * period;
    return press(p, [
      [band, cov(d)],
      [base, cov(-d + 0.0004)],
      [BLK, 0.9 * cov(0.0004 - line)],
      [BLK, 0.4 * shade(p, n, 0.1, -0.8, 0.8)],
    ]);
  });
}

/** Horn: red and cream rings up to a black tip. */
const hornPaint = paint((p, _n, s) => {
  const f = fract(s[0] * 4);
  const dRed = f < 0.5 ? Math.min(f, 0.5 - f) * 0.008 : -Math.min(f - 0.5, 1 - f) * 0.008;
  const line = Math.min(f, Math.abs(f - 0.5), 1 - f) * 0.008;
  return press(p, [
    [RED, cov(dRed)],
    [YEL, cov(-dRed + 0.0004)],
    [BLK, 0.9 * cov(0.0003 - line)],
    [BLK, cov((s[0] - 0.86) * 0.008)],
  ]);
});

const flat = (g: BufferGeometry) => {
  const out = g.toNonIndexed();
  out.computeVertexNormals();
  return out;
};

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "tinToyDragon", paintSize: 2048 });
  const BODY_Y = 0.06;
  const hips = b.joint("hips", { at: [0, BODY_Y, -0.045] });
  type Bone = typeof hips;

  const axle = (at: Vector3, axis: Vector3, r: number, len: number, bone: Bone, group: string) =>
    b.part(new CylinderGeometry(r, r, len, 6), TINP, { bone, at, dir: axis, group });
  const rivet = (at: Vector3, dir: Vector3, r: number, bone: Bone, group: string) =>
    b.part(new SphereGeometry(r, 6, 4), TINP, { bone, at, dir, scale: [1, 0.55, 1], group });

  /** A stamped plate: the outline drawn in (x, y) at `at`, its print built once the thickness axis is known. */
  const plate = (
    pts: readonly OutlinePoint[],
    o: {
      at: Vector3;
      x: Vector3;
      y: Vector3;
      thickness: number;
      bevel?: number;
      bone: Bone;
      group: string;
      print: (w: Vector3) => Paint;
    },
  ) => {
    const w = o.x.clone().cross(o.y).normalize();
    return b.extrude(pts, {
      at: o.at,
      x: o.x,
      y: o.y,
      thickness: o.thickness,
      bevel: o.bevel ?? 0.0007,
      detail: o.thickness > 0.005 ? 1 : 0.5,
      color: o.print(w),
      bone: o.bone,
      group: o.group,
    });
  };

  // ------------------------------------------------------------------------------------------------ Body
  const spine = b.chain(
    "spine",
    polyline([
      [0, BODY_Y, -0.03],
      [0, BODY_Y, 0.05],
    ]),
    { parent: hips, count: 3, names: ["spine1", "spine2", "chest"], role: "spine", group: "body" },
  );
  const [spine1, , chest] = spine.joints;

  const BODY_LEN = 0.114;
  const BODY_Z0 = -0.058;
  const BODY_Z1 = 0.056;
  const RX = 0.033;
  const RY = 0.03;
  const endK = (t: number) => {
    const e = Math.min(t, 1 - t);
    return e > 0.14 ? 1 : 0.72 + 0.28 * (e / 0.14);
  };
  const body = b.sweep(
    polyline([
      [0, BODY_Y, BODY_Z0],
      [0, BODY_Y, BODY_Z1],
    ]),
    (t): [number, number] => [RX * endK(t), RY * endK(t)],
    {
      section: { ngon: 8 },
      caps: "flat",
      bone: [hips, spine],
      color: skinPaint(BODY_LEN, 0.031),
      group: "body",
    },
  );

  // Rolled rims at both ends, on the same octagon as the body.
  for (const z of [BODY_Z0, BODY_Z1]) {
    const R = 1.082 * RX * 0.72;
    const rim = new TorusGeometry(R, 0.0017, 5, 8);
    rim.rotateZ(22.5 * DEG);
    rim.scale(1, RY / RX, 1);
    b.part(rim, TINP, { bone: z < 0 ? hips : chest, at: [0, BODY_Y, z], group: "body" });
  }

  // Crimped seams: a rolled bead on each side where the two stamped halves meet, with folded tabs across it.
  for (const a of [112.5, -112.5]) {
    b.sweep(body.line(a, 0.0006), 0.0017, { sides: 5, color: TINP, group: "seams" });
    for (let k = 0; k < 12; k++) {
      const at = body.at(0.14 + k * 0.065, a);
      b.stick(new BoxGeometry(0.0085, 0.0016, 0.0022), TIN_DK, at, { embed: 0.35, group: "seams" });
    }
  }

  // Dorsal fins along the back.
  const fins = (sw: typeof body, ts: readonly number[], ks: readonly number[], group: string) =>
    ts.forEach((t, i) => {
      const at = sw.at(t);
      const x = at.dir([0, 0, 1]);
      const y = at.axis.clone();
      const k = ks[i];
      plate(
        FIN.map((q): OutlinePoint => (q.length === 3 ? [q[0] * k, q[1] * k, "sharp"] : [q[0] * k, q[1] * k])),
        {
          at: at.local([0, -0.002, 0]),
          x,
          y,
          thickness: 0.003,
          bone: (at.bone ?? spine1) as Bone,
          group,
          print: (w) =>
            platePaint(
              FIN.map((q) => [q[0] * k, q[1] * k] as OutlinePoint),
              w,
              [RED],
              YEL,
              undefined,
              0.0026,
            ),
        },
      );
    });
  fins(body, [0.4, 0.55, 0.7, 0.85], [1, 1.05, 1, 0.85], "fins");

  // ------------------------------------------------------------------------------------------------ Neck
  const neckPath = catmull([
    [0, 0.066, 0.046],
    [0, 0.082, 0.068],
    [0, 0.106, 0.082],
    [0, 0.128, 0.088],
  ]);
  const neck = b.chain("neck", neckPath, { parent: chest, count: 3, role: "neck", group: "neck" });
  const crimp = (t: number, period: number, amp: number) => 1 + amp * (Math.abs(fract(t * period) - 0.5) * 4 - 1);
  const neckTube = b.sweep(
    neck,
    (t): [number, number] => {
      const r = (0.0175 - 0.005 * t) * crimp(t, 9, 0.06);
      return [r, r];
    },
    { section: { ngon: 8 }, caps: "flat", color: skinPaint(neckPath.length, 0.015), group: "neck" },
  );
  fins(neckTube, [0.3, 0.55, 0.8], [0.8, 0.7, 0.6], "fins");
  const collarAt = neck.at(0.1);
  b.part(new TorusGeometry(0.0188, 0.0021, 5, 8), TINP, {
    bone: neck.joints[0],
    at: collarAt.at,
    dir: collarAt.axis,
    axis: "z",
    group: "neck",
  });

  // ------------------------------------------------------------------------------------------------ Tail
  const tailPath = catmull([
    [0, 0.06, -0.05],
    [0, 0.057, -0.082],
    [0, 0.053, -0.11],
    [0, 0.062, -0.13],
    [0, 0.08, -0.141],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, count: 5, role: "tail", group: "tail" });
  const tailTube = b.sweep(
    tail,
    (t): [number, number] => {
      const r = (0.0185 * (1 - t) + 0.005 * t) * crimp(t, 13, 0.05);
      return [r, r];
    },
    { section: { ngon: 8 }, caps: "flat", color: skinPaint(tailPath.length, 0.012), group: "tail" },
  );
  fins(tailTube, [0.14, 0.33, 0.5, 0.67, 0.83], [0.85, 0.8, 0.7, 0.6, 0.5], "fins");

  // The tail ends in a crossed pair of stamped spades.
  {
    const T = tailPath.tangentAt(1).normalize();
    const tip = tailPath.at(1).addScaledVector(T, -0.002);
    const lateral = V(1, 0, 0);
    const other = T.clone().cross(lateral).normalize();
    for (const y of [lateral, other])
      plate(SPADE, {
        at: tip,
        x: T,
        y,
        thickness: 0.0022,
        bevel: 0.0006,
        bone: tail.joints[4],
        group: "tail",
        print: (w) => platePaint(SPADE, w, [RED], YEL, undefined, 0.0022),
      });
  }

  // ------------------------------------------------------------------------------------------------ Head
  const hp = neckPath.at(1);
  const F = V(0, -0.16, 1).normalize();
  const U = V(0, F.z, -F.y).normalize();
  const X = V(1, 0, 0);
  const hpt = (f: number, u: number, x = 0) =>
    hp.clone().addScaledVector(F, f).addScaledVector(U, u).addScaledVector(X, x);

  const head = b.joint("head", { parent: neck.joints[2], at: hp, dir: F, role: "head", group: "head" });
  b.part(new TorusGeometry(0.0128, 0.002, 5, 8), TINP, {
    bone: head,
    at: hpt(-0.004, 0),
    dir: F,
    axis: "z",
    group: "head",
  });

  const cheek = (x: number, y: number) => {
    const r = Math.hypot(x - 0.011, y - 0.012);
    return {
      knock: cov(0.0088 - r),
      layers: [
        [YEL, cov(0.0088 - r) * (1 - cov(0.0072 - r))],
        [RED, cov(0.0072 - r) * (1 - cov(0.0038 - r))],
        [BLU, cov(0.0026 - r)],
        [BLK, 0.9 * cov(0.0003 - Math.abs(r - 0.0088))],
        [BLK, 0.9 * cov(0.0003 - Math.abs(r - 0.0072))],
      ] as readonly Layer[],
    };
  };
  plate(SKULL, {
    at: hp,
    x: F,
    y: U,
    thickness: 0.03,
    bevel: 0.0022,
    bone: head,
    group: "head",
    print: (w) => platePaint(SKULL, w, [YEL, BLU], RED, cheek, 0.0034, [BLU, YEL]),
  });
  plate(SNOUT, {
    at: hp,
    x: F,
    y: U,
    thickness: 0.019,
    bevel: 0.0016,
    bone: head,
    group: "head",
    print: (w) => platePaint(SNOUT, w, [RED], YEL, undefined, 0.0028, [YEL, RED]),
  });
  for (const s of [1, -1]) {
    b.part(new SphereGeometry(0.0022, 5, 4), SOOT, { bone: head, at: hpt(0.056, 0.0155, s * 0.0048), group: "head" });
    // Eyes: printed balls in tin rings.
    const gaze = X.clone()
      .multiplyScalar(s * 0.8)
      .addScaledVector(F, 0.55)
      .normalize();
    const eyeAt = hpt(0.024, 0.017, s * 0.0135);
    b.part(new SphereGeometry(0.0088, 10, 7), "#ffffff", {
      bone: head,
      at: eyeAt,
      dir: gaze,
      texture: EYE,
      group: "head",
    });
    b.part(new TorusGeometry(0.0082, 0.0016, 4, 10), TINP, {
      bone: head,
      at: eyeAt.clone().addScaledVector(gaze, 0.0032),
      dir: gaze,
      axis: "z",
      group: "head",
    });
    // Horns.
    const base = hpt(-0.004, 0.03, s * 0.009);
    const horn = bezier(base, hpt(-0.016, 0.042, s * 0.014), hpt(-0.034, 0.05, s * 0.024));
    b.sweep(horn, [0.0058, 0.0], {
      bone: head,
      sides: 5,
      caps: { start: "flat", end: "point" },
      color: hornPaint,
      group: "head",
    });
    // Jaw pivot rivet heads.
    rivet(hpt(0.001, -0.003, s * 0.0158), X.clone().multiplyScalar(s), 0.0032, head, "head");
  }
  plate(FRILL, {
    at: hpt(0.0, 0.0),
    x: F,
    y: U,
    thickness: 0.003,
    bevel: 0.0008,
    bone: head,
    group: "head",
    print: (w) => platePaint(FRILL, w, [RED], YEL, undefined, 0.0026),
  });

  // The jaw hangs open 22°, showing the tongue and the flint wheel.
  const OPEN = 22 * DEG;
  const Fj = F.clone().multiplyScalar(Math.cos(OPEN)).addScaledVector(U, -Math.sin(OPEN));
  const Uj = U.clone().multiplyScalar(Math.cos(OPEN)).addScaledVector(F, Math.sin(OPEN));
  const jp = hpt(0.001, -0.003);
  const jaw = b.joint("jaw", { parent: head, at: jp, dir: Fj, role: "jaw", group: "head" });
  plate(JAW, {
    at: jp,
    x: Fj,
    y: Uj,
    thickness: 0.02,
    bevel: 0.0016,
    bone: jaw,
    group: "head",
    print: (w) => platePaint(JAW, w, [YEL], RED, undefined, 0.0026, [RED, YEL]),
  });
  plate(TONGUE, {
    at: jp.clone().addScaledVector(Uj, 0.0012),
    x: Fj,
    y: Uj,
    thickness: 0.007,
    bevel: 0.0012,
    bone: jaw,
    group: "head",
    print: (w) => platePaint(TONGUE, w, [RED], null, undefined, 0.001),
  });
  axle(jp, X, 0.0028, 0.033, jaw, "head");

  // The flint wheel: a knurled steel wheel on an axle across the lower jaw, sparking as the jaw works.
  const flintAt = jp.clone().addScaledVector(Fj, 0.024).addScaledVector(Uj, 0.0032);
  b.part(flat(new CylinderGeometry(0.0043, 0.0043, 0.011, 10)), TIN_DK, {
    bone: jaw,
    at: flintAt,
    dir: X,
    group: "flint",
  });
  axle(flintAt, X, 0.0012, 0.015, jaw, "flint");

  // Sparks leaving the mouth, a fan of stamped bursts.
  const mouth = hpt(0.046, -0.012);
  const sparks = [-16, 4, 24, 42].map((deg, i) => {
    const th = deg * DEG;
    const dir = F.clone()
      .multiplyScalar(Math.cos(th))
      .addScaledVector(U, Math.sin(th))
      .addScaledVector(X, (i % 2 ? 0.35 : -0.35) * 0.5)
      .normalize();
    return frame(mouth.clone().addScaledVector(dir, 0.001 * i), dir);
  });
  b.cards(sparks, SPARK, { size: [0.022, 0.027], cross: true, bone: head, vary: 0.12, group: "flint" });

  // ------------------------------------------------------------------------------------------------ Key
  {
    const KEY_BASE = V(0, 0.089, -0.032);
    const K = V(0, 0.85, -0.5).normalize();
    b.lathe(
      [
        [0, 0],
        [0.0105, 0],
        [0.0105, 0.002],
        [0.0068, 0.0058],
        [0.0042, 0.0064],
        [0, 0.0064],
      ],
      {
        at: KEY_BASE.clone().addScaledVector(K, -0.002),
        axis: K,
        bone: spine1,
        segments: 8,
        color: TINP,
        group: "key",
      },
    );
    const keyTop = KEY_BASE.clone().addScaledVector(K, 0.0044);
    const key = b.joint("key", { parent: spine1, at: keyTop, dir: K, group: "key" });
    b.rod(keyTop, keyTop.clone().addScaledVector(K, 0.028), 0.0031, { bone: key, sides: 6, color: TINP, group: "key" });
    const lat = X.clone().applyAxisAngle(K, 45 * DEG);
    const N = lat.clone().cross(K).normalize();
    b.part(new BoxGeometry(0.012, 0.0085, 0.0058), TINP, {
      bone: key,
      at: keyTop.clone().addScaledVector(K, 0.0225),
      dir: K,
      up: N,
      group: "key",
    });
    for (const s of [1, -1]) {
      const c = keyTop
        .clone()
        .addScaledVector(K, 0.0335)
        .addScaledVector(lat, s * 0.0185);
      const loop = Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * TAU;
        return c
          .clone()
          .addScaledVector(lat, Math.cos(a) * 0.0135)
          .addScaledVector(K, Math.sin(a) * 0.019);
      });
      b.sweep(catmull(loop, { closed: true }), () => [0.0032, 0.0027] as [number, number], {
        section: "box",
        up: N,
        bone: key,
        color: TINP,
        group: "key",
      });
    }
  }

  // ------------------------------------------------------------------------------------------------ Wings
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const a = V(s * 0.91, 0.42, -0.06).normalize();
    const c = V(0, 0, -1).addScaledVector(a, a.z).normalize();
    const root = V(s * 0.017, 0.0885, 0.026);
    const P = (u: number, v = 0) => root.clone().addScaledVector(a, u).addScaledVector(c, v);
    const SPAR_U = [0, FOLDS[0], FOLDS[1], 0.122];
    const Q = (u: number) => P(u, edgesAt(u)[0] + 0.0035);
    const spar = b.chain(`wing${L}`, polyline(SPAR_U.map((u) => Q(u))), {
      parent: chest,
      names: [`wingRoot${L}`, `wingMid${L}`, `wingTip${L}`],
      role: "wing",
      group: "wings",
    });
    const cuts: readonly (readonly [number, number])[] = [
      [0, FOLDS[0] - 0.0004],
      [FOLDS[0] + 0.0004, FOLDS[1] - 0.0004],
      [FOLDS[1] + 0.0004, 0.13],
    ];
    cuts.forEach(([u0, u1], i) => {
      const pts = clipU(WING, u0, u1);
      plate(pts, {
        at: root,
        x: a,
        y: c,
        thickness: 0.0018,
        bevel: 0.0007,
        bone: spar.joints[i] as Bone,
        group: "wings",
        print: (w) => wingPaint(w),
      });
    });
    // Leading-edge spars, fold hinges and rivets.
    spar.joints.forEach((joint, i) => {
      const u0 = SPAR_U[i];
      const u1 = SPAR_U[i + 1];
      b.rod(Q(u0), Q(u1), i === 2 ? [0.0024, 0.0014] : 0.0024, {
        bone: joint,
        sides: 5,
        color: TINP,
        group: "wings",
      });
      const up = a.clone().cross(c);
      rivet(Q((u0 + u1) / 2).addScaledVector(up, 0.0012), up, 0.0026, joint as Bone, "wings");
    });
    FOLDS.forEach((u, i) => {
      const [lo, hi] = edgesAt(u);
      b.rod(P(u, lo - 0.001), P(u, hi + 0.001), 0.0019, {
        bone: spar.joints[i],
        sides: 5,
        color: TINP,
        group: "wings",
      });
    });
    // Hinge barrel: two knuckles on the body bracket, one on the wing.
    for (const [v, bone] of [
      [0.006, chest],
      [0.023, spar.joints[0]],
      [0.04, chest],
    ] as const) {
      b.part(new CylinderGeometry(0.0034, 0.0034, 0.0155, 8), TINP, {
        bone: bone as Bone,
        at: root.clone().addScaledVector(c, v),
        dir: c,
        group: "wings",
      });
    }
    for (const v of [0.006, 0.04])
      b.part(new BoxGeometry(0.009, 0.0034, 0.0155), TIN_DK, {
        bone: chest,
        at: root
          .clone()
          .addScaledVector(c, v)
          .add(V(0, -0.0032, 0)),
        dir: c,
        axis: "z",
        group: "wings",
      });
  }

  // ------------------------------------------------------------------------------------------------ Legs
  const UPZ = V(0, 0, 1);
  const legs = [
    { id: "F", z: 0.036, names: ["shoulder", "elbow", "wrist"], parent: chest },
    { id: "H", z: -0.036, names: ["hip", "knee", "hock"], parent: hips },
  ] as const;
  for (const leg of legs) {
    for (const s of [1, -1]) {
      const side = `${leg.id}${s > 0 ? "L" : "R"}`;
      const Hp = V(s * 0.026, 0.046, leg.z);
      const T = V(s * 0.04, 0.0135, leg.z + 0.003);
      const pts = limb(
        Hp,
        T,
        [0.015, 0.015, 0.008],
        [
          [s * 0.5, 0, 0.9],
          [s * 0.3, 0, -0.9],
        ],
      );
      const chain = b.chain(`leg${side}`, polyline(pts), {
        parent: leg.parent,
        names: leg.names.map((n) => `${n}${side}`),
        role: "leg",
        up: UPZ,
        contact: [T.x, 0, T.z],
        group: "legs",
      });
      b.sweep(chain, (t): [number, number] => [0.0056 - 0.0007 * t, 0.0037], {
        section: "box",
        caps: "flat",
        color: stripPaint(0.04, 0.0105, s * 0.0021 + (leg.id === "H" ? 0.004 : 0), YEL, BLU, 0.5),
        group: "legs",
      });
      const [j0, j1, j2] = chain.joints;
      // Hip disc riveted to the body, and axle pins at every bend.
      const skin = b.surface(body);
      const hit = skin.nearest(V(s * 0.03, 0.044, leg.z));
      b.stick(new CylinderGeometry(0.0085, 0.0085, 0.0028, 8), TIN_DK, hit, {
        embed: 0.3,
        bone: j0 as Bone,
        group: "legs",
      });
      axle(pts[0], V(1, 0, 0), 0.0028, 0.0185, j0 as Bone, "legs");
      axle(pts[1], V(1, 0, 0), 0.0028, 0.0185, j1 as Bone, "legs");
      axle(pts[2], V(1, 0, 0), 0.0028, 0.0185, j2 as Bone, "legs");

      // The foot: a heel plate carrying a hinge boss, a toe plate with three claws on its own joint, and a wheel.
      const fwd = V(0, 0, 1);
      const lat = V(s, 0, 0);
      const fz = T.z + 0.002;
      plate(HEEL, {
        at: V(T.x, 0.011, fz),
        x: fwd,
        y: lat,
        thickness: 0.0028,
        bevel: 0.0007,
        bone: j2 as Bone,
        group: "feet",
        print: (w) => platePaint(HEEL, w, [RED], YEL, undefined, 0.0025),
      });
      axle(V(T.x, 0.0135, fz), V(1, 0, 0), 0.0032, 0.0135, j2 as Bone, "feet");
      const toeDir = V(0, -0.16, 1).normalize();
      const toe = b.joint(`toe${side}`, {
        parent: j2,
        at: V(T.x, 0.011, fz + 0.012),
        dir: toeDir,
        role: "digit",
        group: "feet",
      });
      plate(TOES, {
        at: V(T.x, 0.011, fz + 0.012),
        x: toeDir,
        y: lat,
        thickness: 0.0026,
        bevel: 0.0007,
        bone: toe,
        group: "feet",
        print: (w) => platePaint(TOES, w, [YEL], RED, undefined, 0.0022),
      });
      const wheelAt = V(T.x, 0.0075, fz);
      const wheel = b.joint(`wheel${side}`, {
        parent: j2,
        at: wheelAt,
        dir: [0, 0, 1],
        role: "hinge",
        group: "feet",
      });
      b.part(flat(new CylinderGeometry(0.0075, 0.0075, 0.0068, 12)), TINP, {
        bone: wheel,
        at: wheelAt,
        dir: [1, 0, 0],
        group: "feet",
      });
      axle(wheelAt, V(1, 0, 0), 0.0015, 0.0105, wheel, "feet");
    }
  }

  // ------------------------------------------------------------------------------------------------ Printed decals
  const skinHit = b.surface(body);
  const decal = (tex: typeof BANNER, w: number, h: number, z: number, side: number) => {
    const from = V(side * 0.1, BODY_Y, z);
    const hit = skinHit.ray(from, V(-side, 0, 0));
    if (!hit) return;
    b.part(new PlaneGeometry(w, h), "#ffffff", {
      frame: hit.moved([0, 0.0016, 0]),
      dir: hit.axis,
      axis: "z",
      up: [0, 1, 0],
      texture: tex,
      group: "print",
    });
  };
  for (const side of [1, -1]) {
    decal(BANNER, 0.06, 0.024, 0.008, side);
    decal(ROUNDEL, 0.02, 0.02, -0.04, side);
  }
  {
    const under = skinHit.ray(V(0, -0.05, 0.0), V(0, 1, 0));
    if (under)
      b.part(new PlaneGeometry(0.04, 0.02), "#ffffff", {
        frame: under.moved([0, 0.0016, 0]),
        dir: under.axis,
        axis: "z",
        up: [0, 0, 1],
        texture: BADGE,
        group: "print",
      });
  }

  return b.root;
}
