```ts
import * as THREE from "three";
import { catmull, createBuilder, mix, noise, paint, resolve, smoothstep, svg } from "agentic-3js-builder";
import type { Paint, Rgb } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import type { Glowing } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Supermarine Spitfire Mk I (cyanotype blueprint)",
  description:
    "Elliptical-wing Spitfire in Prussian-blue cyanotype: drafting grid, white panel lines and rivets, glowing roundels and dimension arrows, open cockpit with pilot, rigged prop, ailerons, elevators, rudder and wheels, standing in a three-point attitude.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette and small helpers

const C = {
  ink: "#04163a",
  deep: "#0a2c66",
  blue: "#14509c",
  mid: "#2a78c6",
  sky: "#79c0ee",
  pale: "#c9e8ff",
  white: "#f2faff",
  glass: "#8fcdf2",
};

const clamp = (x: number, a = 0, b = 1) => Math.min(Math.max(x, a), b);
const frac = (x: number) => x - Math.floor(x);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const TAU = Math.PI * 2;

const lit = <T extends Glowing>(t: T, k = 1): T => {
  try {
    return glow(t, k);
  } catch {
    return t;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Attitude: the airframe is built level, then pitched nose-up about the main axle so it sits on three points.

const TILT = (9 * Math.PI) / 180;
const ST = Math.sin(TILT);
const CT = Math.cos(TILT);
const PIV = V(0, 0.34, 0.5);
const air = (x: number, y: number, z: number) => {
  const dy = y - PIV.y;
  const dz = z - PIV.z;
  return V(x, PIV.y + dy * CT + dz * ST, PIV.z - dy * ST + dz * CT);
};
const inv = (x: number, y: number, z: number) => {
  const dy = y - PIV.y;
  const dz = z - PIV.z;
  return V(x, PIV.y + dy * CT - dz * ST, PIV.z + dy * ST + dz * CT);
};

// ---------------------------------------------------------------------------------------------------------------
// Planform functions

const SPAN = 5.62;
const wingChord = (x: number) => 2.55 * Math.sqrt(Math.max(1 - (x / 5.66) ** 2, 0.0004));
const wingLE = (x: number) => 0.15 + 0.25 * wingChord(x);
const wingY = (x: number) => 1.2 + 0.085 * x;
const wingTR = (x: number) => 0.135 - 0.062 * (x / SPAN);
const AIL0 = 3.2;
const AIL1 = 5.1;
const AIL_F = 0.77;
const wingCut = (x: number) => (x >= AIL0 && x < AIL1 ? AIL_F : 1);

const stabChord = (x: number) => 1.12 * Math.sqrt(Math.max(1 - (x / 1.7) ** 2, 0.003));
const stabLE = (x: number) => -3.95 + 0.25 * stabChord(x);
const STAB_Y = 1.56;
const ELV_F = 0.6;
const stabCut = (x: number) => (x >= 0.2 && x < 1.58 ? ELV_F : 1);

const FIN_Y0 = 1.5;
const finLE = (x: number) => -3.3 - 0.42 * x;
const finChord = (x: number) => (finLE(x) + 4.78) * Math.sqrt(Math.max(1 - (x / 1.45) ** 6, 0.01));
const RUD_F = 0.55;
const finCut = (x: number) => (x >= 0.12 && x < 1.4 ? RUD_F : 1);

// ---------------------------------------------------------------------------------------------------------------
// Aerofoil surfaces built as faceted lofts

const airfoilHalf = (f: number, tr: number) =>
  5 * tr * (0.2969 * Math.sqrt(f) - 0.126 * f - 0.3516 * f * f + 0.2843 * f ** 3 - 0.1036 * f ** 4);

type Foil = {
  xs: number[];
  chord: (x: number) => number;
  le: (x: number) => number;
  y: (x: number) => number;
  tr: (x: number) => number;
  c0?: number;
  c1?: (x: number) => number;
  side?: 1 | -1;
  camber?: number;
  capStart?: boolean;
  capEnd?: boolean;
};

function foilGeometry(o: Foil): THREE.BufferGeometry {
  const M = 7;
  const c0 = o.c0 ?? 0;
  const side = o.side ?? 1;
  const camber = o.camber ?? 0.025;
  const rings: THREE.Vector3[][] = [];
  for (const x of o.xs) {
    const ch = o.chord(x);
    const c1 = o.c1 ? o.c1(x) : 1;
    const tr = o.tr(x);
    const up: THREE.Vector3[] = [];
    const lo: THREE.Vector3[] = [];
    for (let k = 0; k <= M; k++) {
      const f = c0 + ((c1 - c0) * (1 - Math.cos((Math.PI * k) / M))) / 2;
      const half = airfoilHalf(f, tr) * ch;
      const mean = o.y(x) + camber * ch * 4 * f * (1 - f);
      const z = o.le(x) - f * ch;
      up.push(V(side * x, mean + half, z));
      lo.push(V(side * x, mean - half * 0.92, z));
    }
    const back = lo.slice().reverse();
    rings.push([...up, ...(c0 === 0 ? back.slice(0, M) : back)]);
  }
  const n = rings[0].length;
  const pos: number[] = [];
  const uv: number[] = [];
  for (const r of rings)
    for (const v of r) {
      pos.push(v.x, v.y, v.z);
      uv.push((v.x + 6) / 12, (v.z + 5) / 10);
    }
  const idx: number[] = [];
  const tri = (a: number, b: number, c: number) => (side > 0 ? idx.push(a, b, c) : idx.push(a, c, b));
  for (let i = 0; i < rings.length - 1; i++)
    for (let j = 0; j < n; j++) {
      const j2 = (j + 1) % n;
      const a = i * n + j;
      const b2 = i * n + j2;
      const c = (i + 1) * n + j2;
      const d = (i + 1) * n + j;
      tri(a, c, b2);
      tri(a, d, c);
    }
  const cap = (ri: number, end: boolean) => {
    const r = rings[ri];
    const cen = V(0, 0, 0);
    for (const v of r) cen.add(v);
    cen.multiplyScalar(1 / n);
    const ci = pos.length / 3;
    pos.push(cen.x, cen.y, cen.z);
    uv.push((cen.x + 6) / 12, (cen.z + 5) / 10);
    for (let j = 0; j < n; j++) {
      const a = ri * n + j;
      const b2 = ri * n + ((j + 1) % n);
      if (end) tri(ci, b2, a);
      else tri(ci, a, b2);
    }
  };
  if (o.capEnd ?? true) cap(rings.length - 1, true);
  if (o.capStart) cap(0, false);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  const flat = geo.toNonIndexed();
  flat.computeVertexNormals();
  return flat;
}

// ---------------------------------------------------------------------------------------------------------------
// Fuselage stations: [z, y, width, height]

type Sta = [number, number, number, number];
const FUS: Sta[] = [
  [3.55, 1.76, 0.74, 0.82],
  [3.0, 1.76, 0.82, 0.92],
  [2.2, 1.73, 0.88, 1.04],
  [1.4, 1.7, 0.9, 1.14],
  [0.6, 1.64, 0.86, 1.2],
  [-0.4, 1.6, 0.8, 1.2],
  [-1.4, 1.57, 0.68, 1.06],
  [-2.5, 1.55, 0.54, 0.84],
  [-3.5, 1.56, 0.4, 0.62],
  [-4.3, 1.58, 0.24, 0.42],
  [-4.8, 1.6, 0.1, 0.22],
];
const HOOD: Sta[] = [
  [-2.05, 2.14, 0.3, 0.2],
  [-1.75, 2.27, 0.44, 0.4],
  [-1.2, 2.32, 0.52, 0.5],
  [-0.62, 2.26, 0.48, 0.3],
];
const SCREEN: Sta[] = [
  [0.47, 2.3, 0.54, 0.4],
  [0.72, 2.27, 0.5, 0.3],
  [1.0, 2.17, 0.36, 0.08],
];

function sta(st: Sta[], z: number) {
  const s = [...st].sort((a, b) => a[0] - b[0]);
  const pick = (q: Sta) => ({ y: q[1], w: q[2], h: q[3] });
  if (z <= s[0][0]) return pick(s[0]);
  if (z >= s[s.length - 1][0]) return pick(s[s.length - 1]);
  for (let i = 0; i < s.length - 1; i++) {
    if (z <= s[i + 1][0]) {
      const t = (z - s[i][0]) / (s[i + 1][0] - s[i][0]);
      const k = 0.5 * t + 0.5 * t * t * (3 - 2 * t);
      const L = (a: number, b: number) => a + (b - a) * k;
      return { y: L(s[i][1], s[i + 1][1]), w: L(s[i][2], s[i + 1][2]), h: L(s[i][3], s[i + 1][3]) };
    }
  }
  return pick(s[0]);
}

// ---------------------------------------------------------------------------------------------------------------
// Paints: cyanotype exposure, drafting grid, hatching, panel lines and rivets

function gridLines(col: Rgb, p: THREE.Vector3, n: THREE.Vector3): Rgb {
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
  if (Math.abs(u - Math.round(u)) < 0.006 || Math.abs(v - Math.round(v)) < 0.006) return mix(col, C.sky, 0.32);
  const g = 0.25;
  if (Math.abs(u / g - Math.round(u / g)) * g < 0.0035 || Math.abs(v / g - Math.round(v / g)) * g < 0.0035)
    return mix(col, C.sky, 0.14);
  return col;
}

function sheet(lo: string, hi: string, seed: number): Paint {
  return paint((p, n) => {
    const up = smoothstep(-0.7, 0.9, n.y);
    const expo = noise(p, 0.8, seed) - 0.5;
    let col: Rgb = mix(lo, hi, clamp(0.12 + 0.62 * up + 0.5 * expo));
    if (n.y < -0.3 && frac((p.x * 0.8 + p.z + p.y * 0.5) / 0.05) < 0.12) col = mix(col, C.mid, 0.45);
    return gridLines(col, p, n);
  });
}

const onRect = (x: number, f: number, c: number, r: number[]) => {
  const [x0, x1, f0, f1] = r;
  const inX = x >= x0 - 0.006 && x <= x1 + 0.006;
  const inF = f >= f0 - 0.006 / c && f <= f1 + 0.006 / c;
  const dx = Math.min(Math.abs(x - x0), Math.abs(x - x1));
  const df = Math.min(Math.abs(f - f0), Math.abs(f - f1)) * c;
  return (inX && inF && df < 0.0055) || (inX && inF && dx < 0.0055);
};

function foilPaint(
  base: Paint,
  o: {
    span: (p: THREE.Vector3) => number;
    le: (x: number) => number;
    chord: (x: number) => number;
    rib: number;
    lines: number[];
    rects?: number[][];
  },
): Paint {
  return paint((p, n) => {
    let col = resolve(base, p, n);
    const x = o.span(p);
    const c = o.chord(x);
    const f = (o.le(x) - p.z) / c;
    let ln = false;
    let dot = false;
    const k = Math.round(x / o.rib);
    if (k > 0 && f > 0.05 && f < 0.97) {
      const d = Math.abs(x - k * o.rib);
      if (d < 0.0055) ln = true;
      else if (Math.abs(d - 0.024) < 0.0035 && Math.abs(frac(p.z / 0.07) - 0.5) < 0.05) dot = true;
    }
    for (const ff of o.lines) {
      const d = Math.abs(f - ff) * c;
      if (d < 0.0055) ln = true;
      else if (Math.abs(d - 0.024) < 0.0035 && Math.abs(frac(x / 0.07) - 0.5) < 0.05) dot = true;
    }
    for (const r of o.rects ?? []) if (onRect(x, f, c, r)) ln = true;
    if (ln) col = mix(col, C.white, 0.88);
    else if (dot) col = mix(col, C.pale, 0.9);
    return col;
  });
}

const SEAMS = [3.3, 2.55, 1.45, 0.35, -0.95, -1.95, -3.0, -3.9];
const FUS_BASE = sheet(C.deep, C.mid, 3);
const FUS_PAINT = paint((p, n, s) => {
  let col = resolve(FUS_BASE, p, n);
  const deg = ((s[1] % 360) + 360) % 360;
  let ln = false;
  let dot = false;
  for (const z0 of SEAMS) {
    const d = p.z - z0;
    if (Math.abs(d) < 0.0055) ln = true;
    else if (Math.abs(d - 0.022) < 0.0035 && frac(deg / 4.2) < 0.3) dot = true;
  }
  for (const a of [58, 122, 238, 302]) if (Math.abs(deg - a) < 0.9) ln = true;
  for (const a of [90, 270]) {
    if (Math.abs(deg - a) < 0.8) ln = true;
    else if (Math.abs(deg - a - 1.6) < 0.5 && frac(p.z / 0.06) < 0.2) dot = true;
  }
  const side = Math.min(Math.abs(deg - 90), Math.abs(deg - 270));
  if (p.z > 1.7 && p.z < 3.2 && side < 26) col = mix(col, C.ink, 0.35 * (1 - side / 26));
  if (ln) col = mix(col, C.white, 0.9);
  else if (dot) col = mix(col, C.pale, 0.9);
  return col;
});

const WING_PAINT = foilPaint(sheet(C.deep, C.blue, 7), {
  span: (p) => Math.abs(p.x),
  le: wingLE,
  chord: wingChord,
  rib: 0.62,
  lines: [0.07, 0.3, 0.55, AIL_F],
  rects: [
    [1.4, 3.05, 0.045, 0.2],
    [0.7, 1.5, 0.32, 0.5],
    [3.4, 4.4, 0.3, 0.42],
  ],
});
const STAB_PAINT = foilPaint(sheet(C.deep, C.blue, 5), {
  span: (p) => Math.abs(p.x),
  le: stabLE,
  chord: stabChord,
  rib: 0.3,
  lines: [0.2, ELV_F],
});
const FIN_PAINT = foilPaint(sheet(C.deep, C.blue, 9), {
  span: (p) => p.y - FIN_Y0,
  le: finLE,
  chord: finChord,
  rib: 0.3,
  lines: [0.25, RUD_F],
});

const GLASS = paint((p, n) => {
  let col: Rgb = mix(C.glass, C.pale, smoothstep(0.1, 0.9, n.y) * 0.6);
  const d = frac((p.z * 1.1 + p.y * 1.7) / 0.28);
  if (d < 0.09) col = mix(col, C.white, 0.7);
  else if (d > 0.14 && d < 0.19) col = mix(col, C.white, 0.35);
  return col;
});

const BLADE_PAINT = paint((_p, _n, s) => (s[0] > 1.28 ? C.white : s[0] < 0.4 ? C.sky : C.deep));
const SPINNER_PAINT = sheet(C.blue, C.sky, 11);

// ---------------------------------------------------------------------------------------------------------------
// Textures: white-line drawings on blue

const ROUNDEL = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="${C.pale}" stroke="${C.white}" stroke-width="2.2"/>
  <circle cx="50" cy="50" r="38" fill="${C.deep}" stroke="${C.white}" stroke-width="1.6"/>
  <circle cx="50" cy="50" r="26" fill="${C.sky}" stroke="${C.white}" stroke-width="1.6"/>
  <circle cx="50" cy="50" r="13" fill="${C.deep}" stroke="${C.white}" stroke-width="1.6"/>
  <path d="M50 3V97M3 50H97" stroke="${C.white}" stroke-width="1" stroke-dasharray="5 3"/>
  <path d="M50 3l0 6M97 50l-6 0M50 97l0 -6M3 50l6 0" stroke="${C.ink}" stroke-width="2"/>
</svg>`,
  { size: 256 },
);

const FIN_FLASH = svg(
  `<svg viewBox="0 0 36 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="1.5" y="1.5" width="11" height="97" fill="${C.deep}"/>
  <rect x="12.5" y="1.5" width="11" height="97" fill="${C.white}"/>
  <rect x="23.5" y="1.5" width="11" height="97" fill="${C.sky}"/>
  <rect x="1.5" y="1.5" width="33" height="97" fill="none" stroke="${C.white}" stroke-width="2"/>
</svg>`,
  { size: 192 },
);

const CODE = svg(
  `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
  <text x="60" y="32" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="36"
    fill="${C.white}" stroke="${C.deep}" stroke-width="1.4" letter-spacing="3">QV·K</text>
</svg>`,
  { size: 384 },
);

const TITLE = svg(
  `<svg viewBox="0 0 140 56" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="136" height="52" fill="${C.deep}" stroke="${C.white}" stroke-width="2"/>
  <path d="M2 20H138M2 38H138M84 38V54" stroke="${C.white}" stroke-width="1.2"/>
  <text x="70" y="15.5" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="11" fill="${C.white}">SUPERMARINE</text>
  <text x="70" y="32.5" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="13" fill="${C.pale}">SPITFIRE Mk.I</text>
  <text x="6" y="49" font-family="Arial, sans-serif" font-size="7.5" fill="${C.white}">SCALE 1:50  SHEET 1/1</text>
  <text x="88" y="49" font-family="Arial, sans-serif" font-size="7.5" fill="${C.white}">DRG K9787-BP</text>
</svg>`,
  { size: 512 },
);

const DIM = svg(
  `<svg viewBox="0 0 400 36" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 18H158M242 18H388" stroke="${C.white}" stroke-width="3"/>
  <path d="M10 18l16 -7v14zM390 18l-16 -7v14z" fill="${C.white}"/>
  <path d="M10 4v28M390 4v28" stroke="${C.white}" stroke-width="3"/>
  <text x="200" y="26" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="22" fill="${C.white}">5.62 m</text>
</svg>`,
  { size: 1024 },
);

const NOSTEP = svg(
  `<svg viewBox="0 0 120 36" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="116" height="32" rx="3" fill="${C.deep}" stroke="${C.white}" stroke-width="2.4"/>
  <text x="60" y="25" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="20" fill="${C.white}" letter-spacing="2">NO STEP</text>
</svg>`,
  { size: 384 },
);

const GRILLE = svg(
  `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
  <rect x="1.5" y="1.5" width="57" height="37" fill="${C.ink}" stroke="${C.white}" stroke-width="2"/>
  <path d="M5 9H55M5 15H55M5 21H55M5 27H55M5 33H55" stroke="${C.sky}" stroke-width="2.4"/>
  <path d="M30 3V37" stroke="${C.white}" stroke-width="1.6"/>
</svg>`,
  { size: 192 },
);

const HUB = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="${C.sky}" stroke="${C.white}" stroke-width="3"/>
  <circle cx="50" cy="50" r="38" fill="none" stroke="${C.deep}" stroke-width="2"/>
  <g fill="${C.deep}" stroke="${C.white}" stroke-width="1.4">
    <ellipse cx="50" cy="26" rx="7" ry="13"/>
    <ellipse cx="50" cy="26" rx="7" ry="13" transform="rotate(72 50 50)"/>
    <ellipse cx="50" cy="26" rx="7" ry="13" transform="rotate(144 50 50)"/>
    <ellipse cx="50" cy="26" rx="7" ry="13" transform="rotate(216 50 50)"/>
    <ellipse cx="50" cy="26" rx="7" ry="13" transform="rotate(288 50 50)"/>
  </g>
  <circle cx="50" cy="50" r="9" fill="${C.pale}" stroke="${C.deep}" stroke-width="2"/>
</svg>`,
  { size: 192 },
);

const GOGGLES = svg(
  `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 18Q50 8 98 18" stroke="${C.ink}" stroke-width="6" fill="none"/>
  <circle cx="30" cy="22" r="15" fill="${C.ink}" stroke="${C.white}" stroke-width="3"/>
  <circle cx="70" cy="22" r="15" fill="${C.ink}" stroke="${C.white}" stroke-width="3"/>
  <ellipse cx="25" cy="17" rx="5" ry="4" fill="${C.white}"/>
  <ellipse cx="65" cy="17" rx="5" ry="4" fill="${C.white}"/>
</svg>`,
  { size: 192 },
);

const COCKPIT = svg(
  `<svg viewBox="0 0 60 120" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="3" width="54" height="114" rx="22" fill="${C.ink}" stroke="${C.white}" stroke-width="2.4"/>
  <rect x="14" y="40" width="32" height="42" rx="5" fill="none" stroke="${C.sky}" stroke-width="2"/>
  <path d="M14 56H46M14 68H46" stroke="${C.sky}" stroke-width="1.4"/>
  <circle cx="30" cy="20" r="6" fill="none" stroke="${C.white}" stroke-width="1.6"/>
  <path d="M30 14V26M24 20H36" stroke="${C.white}" stroke-width="1.2"/>
  <path d="M10 96H50M10 104H50" stroke="${C.sky}" stroke-width="1.6"/>
</svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "spitfire", paintSize: 2048 });

  const body = b.joint("body", { at: [PIV.x, PIV.y, PIV.z], role: "spine" });
  const PY = 1.76;
  const PZ = 3.75;
  const prop = b.joint("prop", { parent: body, at: [0, PY, PZ], dir: [0, 0, 1], role: "hinge" });

  // Control-surface hinges (aircraft frame, before the pitch pose).
  const hingeZ = (le: (x: number) => number, ch: (x: number) => number, x: number, f: number) => le(x) - f * ch(x);
  const joints: Record<string, ReturnType<typeof b.joint>> = {};
  for (const [s, tag] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    joints[`ail${tag}`] = b.joint(`aileron${tag}`, {
      parent: body,
      at: [s * (AIL0 + 0.01), wingY(AIL0) + 0.02, hingeZ(wingLE, wingChord, AIL0 + 0.01, AIL_F)],
      aim: [s * (AIL1 - 0.01), wingY(AIL1) + 0.02, hingeZ(wingLE, wingChord, AIL1 - 0.01, AIL_F)],
      role: "hinge",
    });
    joints[`elv${tag}`] = b.joint(`elevator${tag}`, {
      parent: body,
      at: [s * 0.22, STAB_Y, hingeZ(stabLE, stabChord, 0.22, ELV_F)],
      aim: [s * 1.56, STAB_Y, hingeZ(stabLE, stabChord, 1.56, ELV_F)],
      role: "hinge",
    });
  }
  const rudder = b.joint("rudder", {
    parent: body,
    at: [0, FIN_Y0 + 0.14, hingeZ(finLE, finChord, 0.14, RUD_F)],
    aim: [0, FIN_Y0 + 1.38, hingeZ(finLE, finChord, 1.38, RUD_F)],
    role: "hinge",
  });
  const wheelJ: Record<number, ReturnType<typeof b.joint>> = {};
  for (const s of [1, -1])
    wheelJ[s] = b.joint(s > 0 ? "wheelL" : "wheelR", {
      parent: body,
      at: [s * 1.02, 0.34, 0.5],
      dir: [1, 0, 0],
      role: "hinge",
    });
  const TW = V(0, 0.1, -4.36);
  const tailWheel = b.joint("tailWheel", { parent: body, at: inv(TW.x, TW.y, TW.z), dir: [1, 0, 0], role: "hinge" });

  // ---------------------------------------------------------------- fuselage
  const fusPath = catmull(
    [...FUS].sort((a, c) => a[0] - c[0]).map((q) => [0, q[1], q[0]]),
  );
  const fus = b.sweep(
    fusPath,
    (t: number): [number, number] => {
      const q = sta(FUS, fusPath.at(t).z);
      return [q.w / 2, q.h / 2];
    },
    { color: FUS_PAINT, bone: body, sides: 12, smooth: false, caps: { start: "point", end: "flat" } },
  );
  const fusSurf = b.surface(fus);

  // cowl trim bands and firewall seam
  for (const z of [3.3, 1.45, -2.0]) {
    const y = sta(FUS, z).y;
    lit(b.sweep(fusSurf.loop([0, y, z], { dir: [0, 0, 1], lift: 0.004 }), 0.014, { color: C.white, bone: body }), 0.8);
  }

  // exhaust stacks (six a side) and cowl blisters
  for (const s of [1, -1]) {
    for (let i = 0; i < 6; i++) {
      const z = 3.05 - i * 0.2;
      const hit = fusSurf.ray([s * 1.5, sta(FUS, z).y - 0.02, z], [-s, 0, 0]);
      if (hit) {
        b.stick(new THREE.CylinderGeometry(0.028, 0.042, 0.13, 6), C.pale, hit, { embed: 0.3 });
        b.stick(new THREE.CylinderGeometry(0.014, 0.02, 0.05, 6), C.ink, hit, { embed: -0.55 });
      }
    }
    const top = fusSurf.ray([s * 0.2, 3, 2.35], [0, -1, 0]);
    if (top) b.stick(new THREE.SphereGeometry(1, 8, 6), C.mid, top, { embed: 0.35, scale: [0.1, 0.06, 0.45] });
    const top2 = fusSurf.ray([s * 0.2, 3, 1.75], [0, -1, 0]);
    if (top2) b.stick(new THREE.SphereGeometry(1, 8, 6), C.mid, top2, { embed: 0.35, scale: [0.09, 0.05, 0.3] });
  }
  // cowl fasteners along the spine
  for (let i = 0; i < 9; i++) {
    const z = 3.2 - i * 0.2;
    const hit = fusSurf.ray([0, 3, z], [0, -1, 0]);
    if (hit) b.stick(new THREE.BoxGeometry(0.1, 0.012, 0.026), C.white, hit, { embed: 0.3 });
  }

  // cockpit: coaming, floor decal, pilot
  const coaming = fusSurf.drape(
    catmull(
      Array.from({ length: 10 }, (_, k) => {
        const a = (k / 10) * TAU;
        return [0.3 * Math.cos(a), 2.3, -0.1 + 0.62 * Math.sin(a)];
      }),
      { closed: true },
    ),
    { lift: 0.02 },
  );
  b.sweep(coaming, 0.03, { color: C.pale, bone: body });
  const floorHit = fusSurf.ray([0, 3, -0.1], [0, -1, 0]);
  if (floorHit)
    lit(b.decal(fus, COCKPIT, { at: floorHit, dir: [0, 1, 0], up: [0, 0, 1], size: [0.56, 1.1], segments: 12 }), 0.6);

  const hardware = { bone: body };
  b.capsule([0, 2.0, -0.32], [0, 2.5, -0.3], 0.2, { color: C.mid, ...hardware });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.09, 8, 6), C.mid, { at: [s * 0.2, 2.47, -0.3], ...hardware });
    b.capsule([s * 0.2, 2.45, -0.3], [s * 0.3, 2.28, -0.2], 0.058, { color: C.mid, ...hardware });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), C.mid, { at: [s * 0.3, 2.28, -0.2], ...hardware });
    b.part(new THREE.SphereGeometry(0.1, 6, 5), C.deep, { at: [s * 0.14, 2.78, -0.22], scale: [0.4, 0.55, 0.55], ...hardware });
  }
  b.capsule([0.3, 2.28, -0.2], [0.3, 2.28, -0.02], 0.048, { color: C.mid, ...hardware });
  b.part(new THREE.SphereGeometry(0.055, 6, 5), C.pale, { at: [0.3, 2.28, -0.02], ...hardware });
  b.capsule([-0.3, 2.28, -0.2], [-0.04, 2.5, 0.1], 0.048, { color: C.mid, ...hardware });
  b.part(new THREE.SphereGeometry(0.055, 6, 5), C.pale, { at: [-0.04, 2.5, 0.1], ...hardware });
  b.rod([0, 2.1, 0.1], [-0.04, 2.5, 0.1], 0.016, { color: C.sky, ...hardware });
  b.part(new THREE.SphereGeometry(0.03, 6, 5), C.white, { at: [-0.04, 2.53, 0.1], ...hardware });
  b.rod([0.3, 2.2, 0.0], [0.3, 2.3, -0.02], 0.012, { color: C.sky, ...hardware });
  b.capsule([0, 2.5, -0.3], [0, 2.6, -0.27], 0.07, { color: C.pale, ...hardware });
  const helmet = b.part(new THREE.SphereGeometry(1, 10, 8), C.pale, {
    at: [0, 2.8, -0.22],
    scale: [0.145, 0.158, 0.165],
    ...hardware,
  });
  b.decal(helmet, GOGGLES, { at: [0, 2.84, -0.06], dir: [0, 0, 1], size: [0.25, 0.1], segments: 8 });
  b.part(new THREE.SphereGeometry(1, 8, 6), C.deep, { at: [0, 2.7, -0.08], scale: [0.065, 0.06, 0.06], ...hardware });
  b.rod([0, 2.67, -0.08], [0.1, 2.36, -0.13], 0.012, { color: C.deep, ...hardware });
  b.rod([-0.18, 2.56, -0.14], [0.12, 2.2, -0.15], 0.02, { color: C.white, ...hardware });
  b.rod([0.18, 2.56, -0.14], [-0.12, 2.2, -0.15], 0.02, { color: C.white, ...hardware });
  b.extrude(
    [
      [-0.25, 0],
      [0.25, 0],
      [0.21, 0.6],
      [-0.21, 0.6],
    ],
    { at: [0, 2.2, -0.56], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.04, bevel: 0.01, color: C.sky, bone: body },
  );
  b.part(new THREE.BoxGeometry(0.09, 0.05, 0.1), C.deep, { at: [0, 2.28, 0.36], ...hardware });
  b.part(new THREE.BoxGeometry(0.11, 0.09, 0.006), C.glass, { at: [0, 2.37, 0.38], rotation: [-15, 0, 0], ...hardware });

  // windscreen and sliding hood (slid back)
  const screenProf = (() => {
    const pts = [...SCREEN].sort((a, c) => a[0] - c[0]);
    const path = catmull(pts.map((q) => [0, q[1], q[0]]));
    return { path };
  })();
  const screen = b.sweep(
    screenProf.path,
    (t: number): [number, number] => {
      const q = sta(SCREEN, screenProf.path.at(t).z);
      return [q.w / 2, q.h / 2];
    },
    { color: GLASS, bone: body, sides: 10, smooth: false, caps: { start: "flat", end: "round" } },
  );
  const hoodPath = catmull([...HOOD].sort((a, c) => a[0] - c[0]).map((q) => [0, q[1], q[0]]));
  const hood = b.sweep(
    hoodPath,
    (t: number): [number, number] => {
      const q = sta(HOOD, hoodPath.at(t).z);
      return [q.w / 2, q.h / 2];
    },
    { color: GLASS, bone: body, sides: 10, smooth: false, caps: { start: "round", end: "flat" } },
  );
  const screenSurf = b.surface(screen);
  const hoodSurf = b.surface(hood);
  for (const z of [0.58, 0.82]) {
    const y = sta(SCREEN, z).y;
    lit(b.sweep(screenSurf.loop([0, y, z], { dir: [0, 0, 1], lift: 0.004 }), 0.015, { color: C.white, bone: body }), 0.8);
  }
  lit(b.sweep(screen.line(0, 0.004), 0.014, { color: C.white, bone: body }), 0.8);
  for (const z of [-0.78, -1.15, -1.55]) {
    const y = sta(HOOD, z).y;
    lit(b.sweep(hoodSurf.loop([0, y, z], { dir: [0, 0, 1], lift: 0.004 }), 0.015, { color: C.white, bone: body }), 0.8);
  }
  for (const a of [62, 298]) lit(b.sweep(hood.line(a, 0.004), 0.012, { color: C.white, bone: body }), 0.8);

  // aerial mast and wire
  b.extrude(
    [
      [0, 0],
      [0.1, 0],
      [0.05, 0.55],
      [0, 0.55],
    ],
    { at: [0, 1.95, -2.55], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.018, color: C.pale, bone: body },
  );
  b.rod([0, 2.5, -2.5], [0, FIN_Y0 + 1.32, -4.2], 0.005, { color: C.white, ...hardware });

  // ---------------------------------------------------------------- wings
  const wingXs = [0, 0.9, 1.8, 2.6, 3.19, 3.2, 3.9, 4.5, 5.0, 5.09, 5.1, 5.3, 5.46, 5.56, 5.62];
  const wingDef = {
    chord: wingChord,
    le: wingLE,
    y: wingY,
    tr: wingTR,
  };
  const wings: ReturnType<typeof b.part>[] = [];
  const ailerons: ReturnType<typeof b.part>[] = [];
  for (const [s, tag] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    wings.push(
      b.part(foilGeometry({ ...wingDef, xs: wingXs, c1: wingCut, side: s }), WING_PAINT, {
        bone: body,
        at: [0, 0, 0],
        flat: true,
        name: `wing${tag}`,
      }),
    );
    ailerons.push(
      b.part(
        foilGeometry({ ...wingDef, xs: [3.2, 3.9, 4.5, 5.0, 5.09], c0: AIL_F, side: s, capStart: true }),
        WING_PAINT,
        { bone: joints[`ail${tag}`], at: [0, 0, 0], flat: true, name: `aileron${tag}` },
      ),
    );
  }
  const wingTargets = [...wings, ...ailerons];
  const wingSurf = b.surface(wingTargets);

  for (const s of [1, -1]) {
    // guns
    for (const x of [1.5, 1.9, 2.3, 2.7])
      b.rod([s * x, wingY(x) + 0.02, wingLE(x) - 0.08], [s * x, wingY(x) + 0.02, wingLE(x) + 0.34], 0.013, {
        color: C.pale,
        ...hardware,
      });
    // ejector slots underneath
    for (const x of [1.5, 1.9, 2.3, 2.7]) {
      const hit = wingSurf.ray([s * x, 0.4, wingLE(x) - 0.65], [0, 1, 0]);
      if (hit) b.stick(new THREE.BoxGeometry(0.11, 0.01, 0.035), C.ink, hit, { embed: 0.4 });
    }
    // fuel filler cap and inspection plates on top
    const cap = wingSurf.ray([s * 1.1, 3, -0.15], [0, -1, 0]);
    if (cap) b.stick(new THREE.CylinderGeometry(0.07, 0.07, 0.025, 10), C.pale, cap, { embed: 0.35 });
    const plate = wingSurf.ray([s * 3.9, 3, -0.85], [0, -1, 0]);
    if (plate) b.stick(new THREE.BoxGeometry(0.4, 0.012, 0.25), C.mid, plate, { embed: 0.4 });
    // wing tip light
    lit(
      b.part(new THREE.SphereGeometry(0.05, 8, 6), C.white, {
        at: [s * 5.64, wingY(5.62), wingLE(5.62) - 0.1],
        ...hardware,
      }),
      1.1,
    );
    // radiators
    const rx = s * 2.4;
    const big = s < 0;
    const w = big ? 0.56 : 0.36;
    const h = big ? 0.3 : 0.24;
    b.frustumBox([rx, 1.16, 0.3], [rx, 1.16, -0.62], [w, h], [w * 0.9, h * 0.55], {
      color: C.blue,
      ...hardware,
    });
    lit(
      b.part(new THREE.PlaneGeometry(w * 0.88, h * 0.82), "#ffffff", {
        at: [rx, 1.16, 0.304],
        dir: [0, 0, 1],
        axis: "z",
        texture: GRILLE,
        ...hardware,
      }),
      0.8,
    );
    b.extrude(
      [
        [-0.5 * w * 0.9, 0],
        [0.5 * w * 0.9, 0],
        [0.4 * w, -0.1],
        [-0.4 * w, -0.1],
      ],
      { at: [rx, 1.1, -0.62], x: [1, 0, 0], y: [0, 0, -1], thickness: 0.015, color: C.sky, bone: body },
    );
  }
  // pitot tube under the port wing
  const pLE = wingLE(3.3);
  b.rod([3.3, wingY(3.3) - 0.12, pLE + 0.5], [3.3, wingY(3.3) - 0.12, pLE - 0.15], 0.009, { color: C.white, ...hardware });
  b.rod([3.3, wingY(3.3) - 0.12, pLE - 0.12], [3.3, wingY(3.3) - 0.02, pLE - 0.2], 0.009, { color: C.white, ...hardware });

  // wing decals
  for (const s of [1, -1]) {
    const x = s * 3.6;
    const z = wingLE(3.6) - 0.4 * wingChord(3.6);
    const top = wingSurf.ray([x, 4, z], [0, -1, 0]);
    if (top) lit(b.decal(wingTargets, ROUNDEL, { at: top, dir: [0, 1, 0], up: [0, 0, 1], size: [0.95, 0.95], segments: 14 }), 0.7);
    const under = wingSurf.ray([x, 0.3, z], [0, 1, 0]);
    if (under) lit(b.decal(wingTargets, ROUNDEL, { at: under, dir: [0, -1, 0], up: [0, 0, 1], size: [0.95, 0.95], segments: 14 }), 0.7);
    const dim = wingSurf.ray([s * 2.95, 0.3, 0.1], [0, 1, 0]);
    if (dim)
      lit(b.decal(wingTargets, DIM, { at: dim, dir: [0, -1, 0], up: [0, 0, 1], size: [4.9, 0.44], segments: 28, mirror: s < 0 }), 0.9);
    const step = wingSurf.ray([s * 0.95, 4, -1.05], [0, -1, 0]);
    if (step) lit(b.decal(wingTargets, NOSTEP, { at: step, dir: [0, 1, 0], up: [0, 0, 1], size: [0.7, 0.21], segments: 8 }), 0.8);
  }
  const title = wingSurf.ray([2.3, 4, -1.0], [0, -1, 0]);
  if (title) lit(b.decal(wingTargets, TITLE, { at: title, dir: [0, 1, 0], up: [0, 0, 1], size: [1.4, 0.56], segments: 12 }), 0.8);

  // ---------------------------------------------------------------- tail
  const stabDef = { chord: stabChord, le: stabLE, y: () => STAB_Y, tr: () => 0.09, camber: 0 };
  const stabs: ReturnType<typeof b.part>[] = [];
  for (const [s, tag] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    stabs.push(
      b.part(
        foilGeometry({ ...stabDef, xs: [0, 0.195, 0.2, 0.55, 0.95, 1.3, 1.57, 1.58, 1.62, 1.64], c1: stabCut, side: s }),
        STAB_PAINT,
        { bone: body, at: [0, 0, 0], flat: true, name: `tailplane${tag}` },
      ),
    );
    b.part(
      foilGeometry({ ...stabDef, xs: [0.2, 0.55, 0.95, 1.3, 1.57], c0: ELV_F, side: s, capStart: true }),
      STAB_PAINT,
      { bone: joints[`elv${tag}`], at: [0, 0, 0], flat: true, name: `elevator${tag}` },
    );
    lit(
      b.part(new THREE.SphereGeometry(0.04, 6, 4), C.white, {
        at: [s * 1.68, STAB_Y, stabLE(1.64) - 0.12],
        ...hardware,
      }),
      1,
    );
  }
  const finGeo = (xs: number[], c0: number | undefined, capStart: boolean, withCut: boolean) => {
    const g = foilGeometry({
      xs,
      chord: finChord,
      le: finLE,
      y: () => 0,
      tr: () => 0.09,
      camber: 0,
      c0,
      c1: withCut ? finCut : undefined,
      capStart,
    });
    g.rotateZ(Math.PI / 2);
    g.translate(0, FIN_Y0, 0);
    return g;
  };
  const fin = b.part(finGeo([0, 0.115, 0.12, 0.45, 0.8, 1.1, 1.3, 1.4, 1.405, 1.43], undefined, false, true), FIN_PAINT, {
    bone: body,
    at: [0, 0, 0],
    flat: true,
    name: "fin",
  });
  const rud = b.part(finGeo([0.12, 0.45, 0.8, 1.1, 1.3, 1.4], RUD_F, true, false), FIN_PAINT, {
    bone: rudder,
    at: [0, 0, 0],
    flat: true,
    name: "rudder",
  });
  b.part(new THREE.BoxGeometry(0.02, 0.2, 0.1), C.sky, {
    at: [0, FIN_Y0 + 0.28, hingeZ(finLE, finChord, 0.28, RUD_F) - 0.12],
    bone: rudder,
  });
  lit(b.part(new THREE.SphereGeometry(0.035, 6, 4), C.white, { at: [0, FIN_Y0 + 1.3, -4.5], bone: rudder }), 1);
  const finSurf = b.surface([fin, rud]);
  for (const s of [1, -1]) {
    const hit = finSurf.ray([s * 1, 2.3, -4.1], [-s, 0, 0]);
    if (hit) lit(b.decal([fin, rud], FIN_FLASH, { at: hit, dir: [s, 0, 0], size: [0.3, 0.8], segments: 10 }), 0.7);
    const rh = fusSurf.ray([s * 1.5, 1.55, -2.55], [-s, 0, 0]);
    if (rh) lit(b.decal(fus, ROUNDEL, { at: rh, dir: [s, 0, 0], size: [0.62, 0.62], segments: 14 }), 0.7);
    const ch = fusSurf.ray([s * 1.5, 1.5, -1.2], [-s, 0, 0]);
    if (ch) lit(b.decal(fus, CODE, { at: ch, dir: [s, 0, 0], size: [0.85, 0.283], segments: 12 }), 0.9);
  }

  // ---------------------------------------------------------------- propeller
  b.part(new THREE.CylinderGeometry(0.33, 0.33, 0.07, 16), C.mid, { at: [0, PY, PZ - 0.1], dir: [0, 0, 1], bone: prop });
  b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.3, 0.05],
      [0.27, 0.2],
      [0.2, 0.38],
      [0.1, 0.52],
      [0, 0.62],
    ],
    { at: [0, PY, PZ - 0.08], axis: [0, 0, 1], segments: 12, smoothing: 1, color: SPINNER_PAINT, bone: prop },
  );
  const BLADE: [number, number][] = [
    [0.1, -0.04],
    [0.4, -0.08],
    [0.9, -0.14],
    [1.25, -0.13],
    [1.44, -0.07],
    [1.47, 0],
    [1.44, 0.05],
    [1.2, 0.1],
    [0.8, 0.11],
    [0.4, 0.07],
    [0.1, 0.04],
  ];
  const pitch = (28 * Math.PI) / 180;
  for (let i = 0; i < 3; i++) {
    const phi = 0.6 + (i * TAU) / 3;
    const rad = [Math.cos(phi), Math.sin(phi), 0];
    const tang = [-Math.sin(phi), Math.cos(phi), 0];
    const chordDir = [tang[0] * Math.cos(pitch), tang[1] * Math.cos(pitch), Math.sin(pitch)];
    b.extrude(BLADE, {
      at: [0, PY, PZ],
      x: rad,
      y: chordDir,
      thickness: 0.035,
      bevel: 0.008,
      smoothing: 1,
      color: BLADE_PAINT,
      bone: prop,
    });
    b.part(new THREE.CylinderGeometry(0.055, 0.07, 0.3, 8), C.sky, {
      at: [rad[0] * 0.22, PY + rad[1] * 0.22, PZ],
      dir: rad,
      bone: prop,
    });
  }

  // ---------------------------------------------------------------- pose the airframe nose-up, then the landing gear
  b.pose(body, { axis: [1, 0, 0], deg: -9 });

  for (const s of [1, -1]) {
    const T = air(s * 0.72, wingY(0.72) - 0.04, 0.4);
    const E = V(s * 0.9, 0.36, 0.5);
    const M = T.clone().lerp(E, 0.5);
    const along = E.clone().sub(T);
    const len = along.length();
    const xdir = along.clone().normalize();
    b.rod(T, M, 0.055, { color: C.pale, bone: body });
    b.rod(M, E, 0.036, { color: C.sky, bone: body });
    b.part(new THREE.CylinderGeometry(0.068, 0.068, 0.05, 8), C.white, { at: M, dir: along, bone: body });
    // scissor links
    const fwd = V(0, 0, 0.075);
    const l1 = T.clone().lerp(E, 0.12).add(fwd);
    const l2 = T.clone().lerp(E, 0.46).add(fwd);
    const l3 = T.clone().lerp(E, 0.56).add(fwd);
    b.rod(l1, l2, 0.012, { color: C.white, bone: body });
    b.rod(l2, l3, 0.012, { color: C.white, bone: body });
    // leg door
    const ydir = V(0, 0, 1).sub(xdir.clone().multiplyScalar(xdir.z)).normalize();
    const L = len * 0.62;
    b.extrude(
      [
        [0, -0.04],
        [0.1 * L, -0.1],
        [0.8 * L, -0.085],
        [L, -0.03],
        [L, 0.03],
        [0.8 * L, 0.085],
        [0.1 * L, 0.1],
        [0, 0.04],
      ],
      {
        at: T.clone().add(xdir.clone().multiplyScalar(0.14)).add(V(s * 0.075, 0, 0)),
        x: xdir,
        y: ydir,
        thickness: 0.014,
        bevel: 0.004,
        smoothing: 1,
        color: C.blue,
        bone: body,
      },
    );
    // axle and wheel
    const Wc = V(s * 1.02, 0.34, 0.5);
    const wj = wheelJ[s];
    b.rod(E, V(s * 1.04, 0.34, 0.5), 0.03, { color: C.white, bone: body });
    b.lathe(
      [
        [0.17, -0.065],
        [0.3, -0.072],
        [0.343, -0.036],
        [0.343, 0.036],
        [0.3, 0.072],
        [0.17, 0.065],
      ],
      { at: Wc, axis: [1, 0, 0], segments: 18, smoothing: 1, color: C.ink, bone: wj },
    );
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.15, 12), C.deep, { at: Wc, dir: [1, 0, 0], bone: wj });
    for (const o of [1, -1])
      lit(
        b.part(new THREE.CircleGeometry(0.2, 16), "#ffffff", {
          at: V(s * 1.02 + o * 0.078, 0.34, 0.5),
          dir: [o, 0, 0],
          axis: "z",
          texture: HUB,
          bone: wj,
        }),
        0.7,
      );
  }

  // tail wheel
  const TT = air(0, 1.38, -4.0);
  const fork = V(0, 0.2, -4.3);
  b.rod(TT, fork, 0.038, { color: C.pale, bone: body });
  for (const o of [1, -1]) b.rod(fork, V(o * 0.05, 0.1, TW.z), 0.015, { color: C.white, bone: body });
  b.lathe(
    [
      [0.04, -0.035],
      [0.085, -0.04],
      [0.1, -0.02],
      [0.1, 0.02],
      [0.085, 0.04],
      [0.04, 0.035],
    ],
    { at: TW, axis: [1, 0, 0], segments: 12, smoothing: 1, color: C.ink, bone: tailWheel },
  );
  b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.08, 8), C.sky, { at: TW, dir: [1, 0, 0], bone: tailWheel });

  return b.root;
}
```