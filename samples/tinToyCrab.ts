// A 1950s wind-up tin toy crab, 25 cm across, lithographed in four inks on cream paper and pressed into shape.
// Every printed surface is a paint or an SVG drawing laid out as separate ink plates that are slightly off register
// (cream slivers and green overprints where yellow and blue meet), with halftone shading dots, a fake maker's logo
// and tiny text. Bare-tin parts (rolled rim, crimped tabs, rivets, axles, eyestalks, the wind-up key) are unprinted
// metal. The shell is a low-poly dome pressed over a flanged base pan; legs and arms are folded strips joined with
// axle rivets; the claws are stamped in flat pieces with toothed jaws. The key is its own joint, so it can turn.
import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  LatheGeometry,
  PlaneGeometry,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  Vector3,
} from "three";
import type { BufferGeometry, Texture } from "three";
import { createBuilder } from "../src/builder";
import { mottle, noise, paint, smoothstep } from "../src/paint";
import type { Rgb } from "../src/paint";
import type { OutlinePoint } from "../src/outline";
import { polyline, catmull } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Tin Toy Crab",
  builtBy: "Claude Sonnet 5.5",
  description:
    "A vintage lithographed wind-up tin crab, 25 cm across: a faceted pressed-tin carapace printed in off-register red, yellow, blue and black with a sunburst, halftone shading and a fake maker's logo, a rolled rim with crimped tabs, a turning wind-up key, googly printed eyes on tin stalks, two toothed claws with openable pincers and eight rivet-jointed strip legs.",
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
const TIN_LT = "#c9cdd0";

const fract = (x: number) => x - Math.floor(x);
/** 1 inside, 0 outside, with a fine antialiased edge; `d` is the signed distance inside, in meters. */
const cov = (d: number) => smoothstep(-0.00028, 0.00028, d);

type Layer = readonly [Ink, number];

/** Lay the ink plates over the paper, then let the print chip away here and there to show the tin. */
function press(p: Vector3, layers: readonly Layer[]): Rgb {
  let r = PAPER[0];
  let g = PAPER[1];
  let b = PAPER[2];
  for (const [ink, k] of layers) {
    if (k <= 0.001) continue;
    r *= 1 - k + k * ink[0];
    g *= 1 - k + k * ink[1];
    b *= 1 - k + k * ink[2];
  }
  const chip = smoothstep(0.84, 0.88, noise(p, 0.003, 5)) * 0.8;
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

/** Shade dots printed where the surface turns away from the light (down and toward the rim). */
const shade = (p: Vector3, n: Vector3, from = 0.85, to = 0.4, gain = 0.9) =>
  dots(p, n, smoothstep(from, to, n.y) * gain);

const TINP = mottle(TIN_LT, "#adb3b8", {
  size: 0.012,
  contrast: 0.45,
  seed: 3,
});

// ---------------------------------------------------------------------------------------------------------------
// The shell, in meters. The dome and base pan are lathes of unit radius scaled to the ellipse RX x RZ.
const RX = 0.072;
const RZ = 0.056;
const M = 0.062; // meters per unit of elliptical radius, for print distances
const TAU = Math.PI * 2;
const RIM_Y = 0.05;
const PLATEAU_Y = 0.0965;
const FLANGE = 1.06;

// rim (rho = 1) up to the flat plateau in the middle, as [rho, y]
const DOME: readonly (readonly [number, number])[] = [
  [1.0, 0.05],
  [0.96, 0.06],
  [0.88, 0.068],
  [0.7, 0.079],
  [0.52, 0.0875],
  [0.46, 0.0945],
  [0.42, 0.096],
  [0.0, PLATEAU_Y],
];
const DOME_ASC = [...DOME].reverse();

/** Height of the dome's smooth outline at model x, z. */
function domeY(x: number, z: number) {
  const rho = Math.hypot(x / RX, z / RZ);
  for (let i = 1; i < DOME_ASC.length; i++) {
    const [r1, y1] = DOME_ASC[i];
    if (rho <= r1) {
      const [r0, y0] = DOME_ASC[i - 1];
      return y0 + ((y1 - y0) * (rho - r0)) / (r1 - r0);
    }
  }
  return RIM_Y;
}

const polar = (x: number, z: number) => [Math.hypot(x / RX, z / RZ), Math.atan2(x / RX, z / RZ)] as const;
const starR = (phi: number) => 0.14 + 0.22 * (1 - Math.abs(fract((phi / TAU) * 8) - 0.5) * 2);

/** Signed inside distance (m) of the first half of a 50% duty wedge cycle `q` in 0..1. */
function halfWedge(q: number, width: number) {
  return q < 0.5 ? Math.min(q, 0.5 - q) * width : -Math.min(q - 0.5, 1 - q) * width;
}

const SUNBURST = 24;
const DOTS = 36;

const shellPaint = paint((p, n) => {
  // Yellow plate, shifted one way.
  const [ry, py] = polar(p.x + 0.0007, p.z - 0.0005);
  const wy = (TAU / SUNBURST) * ry * M;
  const ringY = Math.min(ry - 0.52, 0.86 - ry) * M;
  let yellow = Math.min(cov(halfWedge(fract((py / TAU) * SUNBURST), wy)), cov(ringY));
  yellow = Math.max(yellow, cov((starR(py) - ry) * 0.05));
  const dotPos = (fract((py / TAU) * DOTS) - 0.5) * (TAU / DOTS) * ry * M;
  yellow = Math.max(yellow, cov(0.0011 - Math.hypot((ry - 0.955) * M, dotPos)));

  // Red plate, shifted the other way.
  const [rr, pr] = polar(p.x - 0.0006, p.z + 0.0004);
  const wr = (TAU / SUNBURST) * rr * M;
  const ringR = Math.min(rr - 0.52, 0.86 - rr) * M;
  let red = Math.min(cov(halfWedge(fract((pr / TAU) * SUNBURST + 0.5), wr)), cov(ringR));
  red = Math.max(red, cov(Math.min(rr - 0.46, 0.52 - rr) * M));

  // Blue plate: plateau with a star knocked out, and the dotted skirt.
  const [rb, pb] = polar(p.x + 0.0003, p.z + 0.0006);
  const plateau = cov((0.46 - rb) * M) * (1 - cov((starR(pb) - rb) * 0.05 + 0.0008));
  const dotB = (fract((pb / TAU) * DOTS) - 0.5) * (TAU / DOTS) * rb * M;
  const skirt = cov(Math.min(rb - 0.9, 1.03 - rb) * M) * (1 - cov(0.0014 - Math.hypot((rb - 0.955) * M, dotB)));
  const blue = Math.max(plateau, skirt);

  // Black key plate: rules, star outline, and fine radial lines down the red wedges.
  const [rk, pk] = polar(p.x, p.z);
  const rule = (r: number, w: number) => cov(w - Math.abs(rk - r) * M);
  let black = Math.max(rule(0.46, 0.0004), rule(0.52, 0.0004), rule(0.86, 0.0004), rule(0.9, 0.0004));
  black = Math.max(black, cov(0.0004 - Math.abs((starR(pk) - rk) * 0.05)) * cov((0.46 - rk) * M));
  const qk = fract((pk / TAU) * SUNBURST);
  const hair = cov(0.00022 - Math.abs(qk - 0.75) * (TAU / SUNBURST) * rk * M) * cov(Math.min(rk - 0.56, 0.84 - rk) * M);
  black = Math.max(black, hair * 0.8);

  return press(p, [
    [YEL, yellow],
    [RED, red],
    [BLU, blue],
    [BLK, black],
    [BLK, 0.5 * shade(p, n, 0.8, 0.35, 0.75)],
  ]);
});

const panPaint = paint((p, n) => {
  const [rho, phi] = polar(p.x, p.z);
  if (n.y < -0.6) {
    // Belly: a blue field with yellow and red rings and a ring of black dots.
    if (rho > 0.93) return TIN_RGB;
    const ringAt = (r: number, w: number, off: number) => cov(w - Math.abs(rho - r + off) * M);
    const yellow = Math.max(ringAt(0.34, 0.003, 0.01), ringAt(0.78, 0.003, 0.01));
    const red = ringAt(0.56, 0.004, -0.01);
    const dot = cov(0.0016 - Math.hypot((rho - 0.66) * M, (fract((phi / TAU) * 24) - 0.5) * (TAU / 24) * rho * M));
    return press(p, [
      [BLU, (1 - yellow) * (1 - dot)],
      [YEL, Math.max(yellow, dot)],
      [RED, red],
      [BLK, 0.9 * cov(0.0004 - Math.abs(rho - 0.9) * M)],
    ]);
  }
  if (n.y > 0.6)
    return press(p, [
      [RED, 1],
      [BLK, 0.9 * cov(0.0003 - Math.abs(rho - 1.03) * M)],
    ]);
  return press(p, [
    [YEL, 1],
    [BLK, 0.6 * shade(p, n, 0.3, -0.4)],
  ]);
});

// ---------------------------------------------------------------------------------------------------------------
// Printed drawings. Text renders in the browser with whatever bold sans it has; the drawings are cutouts.
const FONT = `font-family="Impact, 'Arial Black', 'DejaVu Sans', sans-serif" font-weight="900"`;
const BANNER_SHAPE = "M8 16 L192 16 L180 41 L192 66 L8 66 L20 41 Z";

const BANNER = svg(
  `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
    <path d="${BANNER_SHAPE}" fill="#f4c11a" transform="translate(4 3.5)"/>
    <path d="${BANNER_SHAPE}" fill="#f4ebd0" stroke="#17171b" stroke-width="3" stroke-linejoin="round"/>
    <path d="M13 21 L187 21 L177 41 L187 61 L13 61 L23 41 Z" fill="none" stroke="#c8281c" stroke-width="1.2"/>
    <text x="100" y="31" text-anchor="middle" ${FONT} font-size="9" letter-spacing="2" fill="#17171b" textLength="104">TOKYO TIN TOY CO.</text>
    <text x="102.2" y="57" text-anchor="middle" ${FONT} font-size="27" fill="#17171b" textLength="112" lengthAdjust="spacingAndGlyphs">CRABBY</text>
    <text x="100" y="55.2" text-anchor="middle" ${FONT} font-size="27" fill="#d6301f" textLength="112" lengthAdjust="spacingAndGlyphs">CRABBY</text>
    <polygon points="28,41 30,36.5 32,41 36.5,42.2 32,43.4 30,48 28,43.4 23.5,42.2" fill="#22509b"/>
    <polygon points="172,41 174,36.5 176,41 180.5,42.2 176,43.4 174,48 172,43.4 167.5,42.2" fill="#22509b"/>
  </svg>`,
  { size: 512 },
);

const MEDALLION = svg(
  `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <defs><path id="ring" d="M128 128 m-106 0 a106 106 0 1 1 212 0 a106 106 0 1 1 -212 0"/></defs>
    <circle cx="131" cy="131" r="112" fill="none" stroke="#d6301f" stroke-width="30"/>
    <circle cx="128" cy="128" r="106" fill="none" stroke="#f4ebd0" stroke-width="34"/>
    <circle cx="128" cy="128" r="123" fill="none" stroke="#17171b" stroke-width="4"/>
    <circle cx="128" cy="128" r="89" fill="none" stroke="#17171b" stroke-width="4"/>
    <text ${FONT} font-size="20" fill="#17171b"><textPath xlink:href="#ring" textLength="640" lengthAdjust="spacing">WIND-UP * MADE IN JAPAN * TIN TOY * NO. 51 * </textPath></text>
  </svg>`.replace("<svg ", `<svg xmlns:xlink="http://www.w3.org/1999/xlink" `),
  { size: 512 },
);

const BADGE = svg(
  `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
    <rect x="9" y="8" width="108" height="46" rx="22" fill="#22509b" transform="translate(-3 -1.5)"/>
    <rect x="6" y="6" width="108" height="46" rx="22" fill="#f4ebd0" stroke="#17171b" stroke-width="3"/>
    <text x="60" y="26" text-anchor="middle" ${FONT} font-size="14" fill="#17171b" textLength="70" lengthAdjust="spacingAndGlyphs">MADE IN</text>
    <text x="60" y="45" text-anchor="middle" ${FONT} font-size="19" fill="#d6301f" textLength="76" lengthAdjust="spacingAndGlyphs">JAPAN</text>
  </svg>`,
  { size: 256 },
);

// The eye as a map for a sphere whose top pole looks out: black pupil with a glint, blue iris, black limbus, cream
// white, and a red print on the back of the ball. Bands sit near the sphere's ring lines so the facets keep them crisp.
const EYE = svg(
  `<svg viewBox="0 0 96 64" xmlns="http://www.w3.org/2000/svg">
    <rect width="96" height="64" fill="#f3e9c9"/>
    <rect y="0" width="96" height="7.5" fill="#17171b"/>
    <rect y="7.5" width="96" height="6.5" fill="#22509b" transform="translate(1.5 0.6)"/>
    <rect y="14" width="96" height="1.7" fill="#17171b"/>
    <rect y="0" width="96" height="7.2" fill="#17171b"/>
    <rect y="52" width="96" height="12" fill="#d6301f"/>
    <ellipse cx="22" cy="4.6" rx="7" ry="1.8" fill="#ffffff"/>
    <ellipse cx="70" cy="3.4" rx="4" ry="1.2" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
// Strip paints: cross-bands along a chain (legs, arms) in two inks on a strip of tin.
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

/** Leg strips: red bands on bare cream paper, a thin yellow stripe in each cream gap, black rules. */
function legPaint(phase: number) {
  return paint((p, n, s) => {
    const t = s[0] * 0.127 + phase;
    const f = fract((t + 0.0006) / 0.012);
    const dRed = f < 0.42 ? Math.min(f, 0.42 - f) * 0.012 : -Math.min(f - 0.42, 1 - f) * 0.012;
    const dYel = 0.12 * 0.012 - Math.abs(fract((t - 0.0005) / 0.012) - 0.71) * 0.012;
    const f0 = fract(t / 0.012);
    const line = Math.min(f0, Math.abs(f0 - 0.42), 1 - f0) * 0.012;
    return press(p, [
      [RED, cov(dRed)],
      [YEL, cov(dYel)],
      [BLK, 0.9 * cov(0.0004 - line)],
      [BLK, 0.4 * shade(p, n, 0.1, -0.8, 0.8)],
    ]);
  });
}

// ---------------------------------------------------------------------------------------------------------------
const flat = (g: BufferGeometry) => {
  const out = g.toNonIndexed();
  out.computeVertexNormals();
  return out;
};

const V = (x: number, y: number, z: number) => new Vector3(x, y, z);

export default function build() {
  const b = createBuilder({ name: "tinToyCrab", paintSize: 2048 });
  const body = b.joint("body", { at: [0, RIM_Y, 0] });

  type Bone = typeof body;
  const axle = (at: Vector3, axis: Vector3, r: number, len: number, bone: Bone, group: string) =>
    b.part(new CylinderGeometry(r, r, len, 6), TINP, {
      bone,
      at,
      dir: axis,
      group,
    });

  // ------------------------------------------------------------------------------------------------ Shell
  b.part(
    flat(
      new LatheGeometry(
        DOME.map(([r, y]) => new Vector2(r, y)),
        18,
      ),
    ),
    shellPaint,
    {
      bone: body,
      at: [0, 0, 0],
      scale: [RX, 1, RZ],
      group: "shell",
    },
  );
  const PAN: readonly (readonly [number, number])[] = [
    [0, 0.038],
    [0.9, 0.038],
    [0.98, 0.0405],
    [FLANGE, 0.043],
    [FLANGE, 0.0495],
    [1.0, 0.0505],
    [0, 0.0505],
  ];
  b.part(
    flat(
      new LatheGeometry(
        PAN.map(([r, y]) => new Vector2(r, y)),
        18,
      ),
    ),
    panPaint,
    {
      bone: body,
      at: [0, 0, 0],
      scale: [RX, 1, RZ],
      group: "shell",
    },
  );

  // Rolled rim around the flange, on the same 18-gon as the lathes.
  const rim = Array.from({ length: 18 }, (_, k) => {
    const phi = (k * TAU) / 18;
    return V(RX * FLANGE * Math.sin(phi), 0.0466, RZ * FLANGE * Math.cos(phi));
  });
  b.sweep(polyline(rim, { closed: true }), 0.0027, {
    bone: body,
    color: TINP,
    sides: 6,
    group: "shell",
  });

  // Crimped tabs: little folded strips of tin that lie over the rim and up the skirt.
  for (const deg of [74, 93, 112, 145, -74, -93, -112, -145]) {
    const phi = (deg * Math.PI) / 180;
    const out = V(Math.sin(phi) / RX, 0, Math.cos(phi) / RZ).normalize();
    const at = V(RX * 1.0125 * Math.sin(phi), 0.0532, RZ * 1.0125 * Math.cos(phi));
    const normal = out
      .clone()
      .multiplyScalar(0.9)
      .add(V(0, 0.43, 0))
      .normalize();
    const tilt = out
      .clone()
      .multiplyScalar(-0.43)
      .add(V(0, 0.9, 0))
      .normalize();
    b.part(new BoxGeometry(0.01, 0.0172, 0.0018), TIN_DK, {
      bone: body,
      at,
      dir: normal,
      axis: "z",
      up: tilt,
      group: "shell",
    });
  }

  // Stamped spines along the front and rear margins, red tips over yellow.
  const spikePaint = paint((p, _n, s) =>
    press(p, [
      [YEL, 1],
      [RED, cov((s[1] - 0.45) * 0.014)],
      [BLK, 0.9 * cov(0.0004 - Math.abs(s[1] - 0.45) * 0.014)],
    ]),
  );
  for (const deg of [0, 22, -22, 180, 202, 158]) {
    const phi = (deg * Math.PI) / 180;
    const out = V(Math.sin(phi) / RX, 0, Math.cos(phi) / RZ).normalize();
    const dir = out
      .clone()
      .multiplyScalar(0.92)
      .add(V(0, 0.3, 0))
      .normalize();
    const big = Math.abs(Math.cos(phi)) > 0.99 || deg < 100 ? 1 : 0.8;
    const at = V(RX * 0.99 * Math.sin(phi), 0.0575, RZ * 0.99 * Math.cos(phi)).addScaledVector(dir, 0.0055 * big);
    b.part(new ConeGeometry(0.0046 * big, 0.0135 * big, 5, 1), spikePaint, {
      bone: body,
      at,
      dir,
      group: "shell",
    });
  }

  // Pressed-in rivets round the plateau.
  for (let k = 0; k < 8; k++) {
    const phi = ((k * 45 + 22.5) * Math.PI) / 180;
    b.part(new SphereGeometry(0.0019, 6, 4), TINP, {
      bone: body,
      at: V(RX * 0.415 * Math.sin(phi), PLATEAU_Y - 0.0003, RZ * 0.415 * Math.cos(phi)),
      scale: [1, 0.55, 1],
      group: "shell",
    });
  }

  // Logo decals: patches that follow the dome (or lie flat on the belly), lifted a hair off the tin.
  const patch = (
    tex: Texture,
    cx: number,
    cz: number,
    w: number,
    h: number,
    rot: number,
    cols: number,
    rows: number,
  ) => {
    const g = new PlaneGeometry(w, h, cols, rows);
    g.rotateX(-Math.PI / 2);
    g.rotateY(rot);
    g.translate(cx, 0, cz);
    const pos = g.getAttribute("position");
    for (let i = 0; i < pos.count; i++) pos.setY(i, domeY(pos.getX(i), pos.getZ(i)) + 0.0016);
    g.computeVertexNormals();
    b.part(g, "#ffffff", {
      bone: body,
      at: [0, 0, 0],
      texture: tex,
      group: "print",
    });
  };
  patch(BANNER, 0, 0.0365, 0.052, 0.02, 0, 8, 3);
  patch(MEDALLION, 0, 0, 0.04, 0.04, 0, 6, 6);
  patch(BADGE, 0, -0.03, 0.03, 0.015, Math.PI, 6, 2);
  const belly = new PlaneGeometry(0.05, 0.025);
  belly.rotateX(Math.PI / 2);
  belly.translate(0, 0.0372, 0.0);
  b.part(belly, "#ffffff", {
    bone: body,
    at: [0, 0, 0],
    texture: BADGE,
    group: "print",
  });

  // ------------------------------------------------------------------------------------------------ Key
  const KEY_BASE = PLATEAU_Y - 0.0005;
  b.lathe(
    [
      [0, 0],
      [0.0098, 0],
      [0.0098, 0.0022],
      [0.006, 0.0058],
      [0.0038, 0.0064],
      [0, 0.0064],
    ],
    {
      at: [0, KEY_BASE, 0],
      bone: body,
      segments: 10,
      color: TINP,
      group: "key",
    },
  );
  const keyTop = KEY_BASE + 0.0064;
  const key = b.joint("key", {
    parent: body,
    at: [0, keyTop, 0],
    dir: [0, 1, 0],
  });
  axle(V(0, keyTop + 0.007, 0), V(0, 1, 0), 0.0029, 0.016, key, "key");
  b.part(new BoxGeometry(0.0105, 0.0085, 0.0046), TINP, {
    bone: key,
    at: [0, keyTop + 0.0165, 0],
    group: "key",
  });
  for (const s of [1, -1]) {
    const cx = s * 0.0125;
    const cy = keyTop + 0.0195;
    const loop = Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * TAU;
      return V(cx + Math.cos(a) * 0.0105, cy + Math.sin(a) * 0.0122, 0);
    });
    b.sweep(catmull(loop, { closed: true }), () => [0.0022, 0.0019] as [number, number], {
      section: "box",
      up: [0, 0, 1],
      bone: key,
      color: TINP,
      group: "key",
    });
  }

  // ------------------------------------------------------------------------------------------------ Legs
  const LEG_Z = [0.024, 0.006, -0.012, -0.03];
  const LEG_DEG = [32, 11, -11, -32];
  const LEG_R = [0.042, 0.046, 0.046, 0.042];
  const edgeX = (z: number) => RX * FLANGE * Math.sqrt(Math.max(1 - (z / (RZ * FLANGE)) ** 2, 0.01));
  const UP = V(0, 1, 0);
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    for (let i = 0; i < 4; i++) {
      const a = (LEG_DEG[i] * Math.PI) / 180;
      const d = V(s * Math.cos(a), 0, Math.sin(a));
      const perp = V(-d.z, 0, d.x);
      const R = LEG_R[i];
      const H = V(s * (edgeX(LEG_Z[i]) - 0.003), 0.0455, LEG_Z[i]);
      const K = H.clone()
        .addScaledVector(d, 0.55 * R)
        .add(V(0, 0.036, 0));
      const T = H.clone().addScaledVector(d, R);
      T.y = 0.0025;
      const A = K.clone().lerp(T, 0.52).addScaledVector(d, 0.005);
      const leg = b.chain(`leg${L}${i + 1}`, polyline([H, K, A, T]), {
        parent: body,
        names: [`hip${L}${i + 1}`, `knee${L}${i + 1}`, `ankle${L}${i + 1}`],
        role: "leg",
        up: UP,
        contact: [T.x, 0, T.z],
        group: "legs",
      });
      const paintLeg = legPaint(i * 0.0027);
      b.sweep(leg, (t): [number, number] => [0.0066 - 0.0013 * t, 0.0017], {
        section: "box",
        caps: "flat",
        color: paintLeg,
        group: "legs",
      });
      const [hip, knee, ankle] = leg.joints;
      b.part(new BoxGeometry(0.0145, 0.0055, 0.008), TIN_DK, {
        bone: hip,
        at: H,
        dir: d,
        axis: "z",
        group: "legs",
      });
      axle(H, perp, 0.0026, 0.0168, hip, "legs");
      axle(K, perp, 0.0026, 0.0168, knee, "legs");
      axle(A, perp, 0.0026, 0.0168, ankle, "legs");
      b.part(new BoxGeometry(0.0135, 0.0025, 0.011), TINP, {
        bone: ankle,
        at: T.clone().addScaledVector(d, 0.0025).setY(0.00125),
        dir: d,
        axis: "z",
        group: "legs",
      });
    }
  }

  // ------------------------------------------------------------------------------------------------ Arms and claws
  const PALM: OutlinePoint[] = [
    [-0.004, 0.0],
    [0.002, 0.013],
    [0.016, 0.0195],
    [0.034, 0.016],
    [0.046, 0.006],
    [0.048, -0.006],
    [0.04, -0.015],
    [0.022, -0.0195],
    [0.006, -0.014],
  ];
  const UPPER: OutlinePoint[] = [
    [-0.006, 0.014],
    [0.006, 0.018],
    [0.024, 0.017],
    [0.042, 0.01],
    [0.054, 0.002],
    [0.06, -0.001, "sharp"],
    [0.052, -0.002, "sharp"],
    [0.047, 0.001, "sharp"],
    [0.043, -0.003, "sharp"],
    [0.037, 0.0, "sharp"],
    [0.033, -0.004, "sharp"],
    [0.025, 0.0, "sharp"],
    [0.01, 0.003],
    [-0.006, 0.003],
  ];
  const LOWER: OutlinePoint[] = [
    [-0.006, -0.012],
    [0.01, -0.017],
    [0.03, -0.016],
    [0.046, -0.012],
    [0.056, -0.005, "sharp"],
    [0.049, -0.008, "sharp"],
    [0.044, -0.006, "sharp"],
    [0.04, -0.01, "sharp"],
    [0.034, -0.007, "sharp"],
    [0.03, -0.011, "sharp"],
    [0.022, -0.007, "sharp"],
    [0.01, -0.006],
    [-0.006, -0.005],
  ];
  const stretch = (pts: OutlinePoint[], k: number): OutlinePoint[] =>
    pts.map((q) => (q.length === 3 ? [q[0] * k, q[1], "sharp"] : [q[0] * k, q[1]]));
  const FINGER_LEN = 0.85;

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const S = V(s * 0.058, 0.056, 0.046);
    const E = V(s * 0.09, 0.084, 0.07);
    const W = V(s * 0.099, 0.066, 0.098);
    const arm = b.chain(`arm${L}`, polyline([S, E, W]), {
      parent: body,
      names: [`shoulder${L}`, `elbow${L}`],
      role: "arm",
      up: UP,
      group: "claws",
    });
    b.sweep(arm, (): [number, number] => [0.0085, 0.0034], {
      section: "box",
      caps: "flat",
      color: stripPaint(0.075, 0.0125, s * 0.003, YEL, BLU, 0.5),
      group: "claws",
    });
    const [shoulder, elbow] = arm.joints;
    const d1 = E.clone().sub(S).normalize();
    const d2 = W.clone().sub(E).normalize();
    axle(S, V(-d1.z, 0, d1.x), 0.0072, 0.021, shoulder, "claws");
    axle(E, d1.clone().cross(d2).normalize(), 0.0056, 0.021, elbow, "claws");

    // The claw's own frame: a forward along the claw, v up, w across (the stamped pieces' thickness axis).
    const a = V(-s * 0.3, 0.03, 1).normalize();
    const v = UP.clone().addScaledVector(a, -a.y).normalize();
    const w = a.clone().cross(v).normalize();
    const wrist = b.joint(`wrist${L}`, {
      parent: elbow,
      at: W,
      aim: W.clone().add(a),
      up: v,
    });
    axle(W, w, 0.0046, 0.0215, wrist, "claws");

    // The stamped rim (the walls and bevels seen from above and the front) carries a printed band pattern.
    const rimPrint = (p: Vector3, x: number) => {
      const f = fract((x + 0.0006) / 0.0075);
      const d = f < 0.5 ? Math.min(f, 0.5 - f) * 0.0075 : -Math.min(f - 0.5, 1 - f) * 0.0075;
      const line = Math.min(Math.abs(f - 0.5), f, 1 - f) * 0.0075;
      return press(p, [
        [YEL, cov(d)],
        [RED, cov(-d + 0.0004)],
        [BLK, 0.85 * cov(0.0004 - line)],
      ]);
    };
    const isRim = (n: Vector3) => Math.abs(n.dot(w)) < 0.8;
    const palmPaint = paint((p, n, s2) => {
      if (isRim(n)) return rimPrint(p, s2[0]);
      const [x, y] = s2;
      const inside = (dx: number, dy: number, r: number) => r - Math.hypot(x + dx - 0.021, y + dy);
      const yellow = cov(inside(0.0006, -0.0004, 0.0125)) * (1 - cov(inside(0, 0, 0.0072)));
      const red = 1 - cov(inside(-0.0005, 0.0004, 0.0138));
      const blue = cov(inside(0, 0.0004, 0.0064));
      const black = Math.max(
        cov(0.0004 - Math.abs(inside(0, 0, 0.0132))),
        cov(0.0004 - Math.abs(inside(0, 0, 0.0068))),
      );
      return press(p, [
        [RED, red],
        [YEL, yellow],
        [BLU, blue],
        [BLK, black],
        [BLK, 0.45 * shade(p, n, 0.3, -0.7)],
      ]);
    });
    const fingerPaint = paint((p, n, s2) => {
      if (isRim(n)) return rimPrint(p, s2[0] * 0.8 + 0.003);
      const f = fract((s2[0] + 0.6 * s2[1]) / 0.0085);
      const d = f < 0.36 ? Math.min(f, 0.36 - f) * 0.0068 : -Math.min(f - 0.36, 1 - f) * 0.0068;
      const line = Math.min(Math.abs(f - 0.36), f, 1 - f) * 0.0068;
      return press(p, [
        [YEL, cov(d)],
        [RED, cov(-d + 0.0004)],
        [BLK, 0.85 * cov(0.0004 - line)],
        [BLK, 0.45 * shade(p, n, 0.3, -0.7)],
      ]);
    });

    b.extrude(PALM, {
      at: W,
      x: a,
      y: v,
      thickness: 0.026,
      bevel: 0.006,
      smoothing: 1,
      color: palmPaint,
      bone: wrist,
      group: "claws",
    });
    const Hf = W.clone().addScaledVector(a, 0.036);
    const upper = b.joint(`pincerUpper${L}`, {
      parent: wrist,
      at: Hf,
      aim: Hf.clone().add(a),
      up: v,
      role: "jaw",
    });
    const lower = b.joint(`pincerLower${L}`, {
      parent: wrist,
      at: Hf,
      aim: Hf.clone().add(a),
      up: v,
      role: "jaw",
    });
    b.extrude(stretch(UPPER, FINGER_LEN), {
      at: Hf,
      x: a,
      y: v,
      thickness: 0.013,
      bevel: 0.0025,
      color: fingerPaint,
      bone: upper,
      group: "claws",
    });
    b.extrude(stretch(LOWER, FINGER_LEN), {
      at: Hf,
      x: a,
      y: v,
      thickness: 0.013,
      bevel: 0.0025,
      color: fingerPaint,
      bone: lower,
      group: "claws",
    });
    axle(Hf, w, 0.0034, 0.0285, upper, "claws");
  }

  // ------------------------------------------------------------------------------------------------ Eyes on stalks
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const B = V(s * 0.033, domeY(0.033, 0.03) - 0.003, 0.03);
    const Mid = V(s * 0.037, 0.096, 0.04);
    const T = V(s * 0.041, 0.113, 0.05);
    b.lathe(
      [
        [0, 0],
        [0.0078, 0],
        [0.0078, 0.0022],
        [0.005, 0.006],
        [0.0034, 0.0088],
        [0, 0.0088],
      ],
      {
        at: B.clone().add(V(0, -0.001, 0)),
        bone: body,
        segments: 8,
        color: TINP,
        group: "eyes",
      },
    );
    const stalk = b.chain(`eyeStalk${L}`, polyline([B, Mid, T]), {
      parent: body,
      names: [`eyeStalk${L}1`, `eyeStalk${L}2`],
      role: "neck",
      group: "eyes",
    });
    b.sweep(stalk, [0.0032, 0.0026], {
      caps: { start: "flat", end: "round" },
      sides: 6,
      color: TINP,
      group: "eyes",
    });
    const gaze = V(s * 0.16, 0.06, 1).normalize();
    const C = T.clone().add(V(0, 0.006, 0.001));
    const eye = b.joint(`eye${L}`, {
      parent: stalk.joints[1],
      at: C,
      dir: gaze,
      role: "head",
    });
    b.part(new SphereGeometry(0.0115, 12, 8), "#ffffff", {
      bone: eye,
      at: C,
      dir: gaze,
      texture: EYE,
      group: "eyes",
    });
    b.part(new TorusGeometry(0.0106, 0.0017, 5, 12), TINP, {
      bone: eye,
      at: C.clone().addScaledVector(gaze, 0.0045),
      dir: gaze,
      axis: "z",
      group: "eyes",
    });
  }

  return b.root;
}
