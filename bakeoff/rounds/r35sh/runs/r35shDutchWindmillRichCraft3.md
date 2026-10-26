```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  polyline,
  catmull,
  paint,
  patches,
  noise,
  mix,
  smoothstep,
  svg,
  DEG,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dutch Windmill",
  description:
    "A cosy Dutch smock windmill in a soft Animal Crossing look: brick base, cream octagonal body, mossy thatched cap, " +
    "lattice sails with patched cloth, a gallery with stairs, teal heart shutters, glowing windows and lanterns, " +
    "a fantail, a hoist with a flour sack and tulip planters.",
};

// ------------------------------------------------------------------------------------------------
// Palette
// ------------------------------------------------------------------------------------------------
type RGB = [number, number, number];
type Col = string | ReturnType<typeof paint>;

const BRICK_A = "#d2735a";
const BRICK_B = "#bb5d46";
const MORTAR = "#f3dfc2";
const CREAM = "#fff6e0";
const TRIM = "#fdf3dc";
const WOOD = "#a87648";
const WOOD_L = "#cf9a62";
const WOOD_D = "#6f4a2c";
const THATCH_L = "#f4d88c";
const THATCH_D = "#c48f3e";
const TEAL = "#4fb8a7";
const RED = "#dd5a43";
const GOLD = "#f2c24f";
const IRON = "#3a3440";
const STONE_L = "#efe6d3";
const SOIL = "#6b4a36";

const C8 = Math.cos(Math.PI / 8);
const TAU = Math.PI * 2;
const fract = (x: number) => x - Math.floor(x);
const hash = (a: number, b = 0) => fract(Math.sin(a * 127.1 + b * 311.7) * 43758.5453);
const mx = (a: string | RGB, c: string | RGB, t: number): RGB => {
  const r = mix(a, c, t);
  return [r[0], r[1], r[2]];
};

// Warm light from above, cool bounce from below: baked into every paint.
const COOL: RGB = [0.74, 0.78, 0.92];
const WARM: RGB = [1.05, 1.0, 0.9];
function lit(c: readonly [number, number, number], n: THREE.Vector3): RGB {
  const k = mix(COOL, WARM, smoothstep(-0.7, 0.8, n.y));
  return [Math.min(c[0] * k[0], 1), Math.min(c[1] * k[1], 1), Math.min(c[2] * k[2], 1)];
}

// ------------------------------------------------------------------------------------------------
// Paints
// ------------------------------------------------------------------------------------------------
const BRICK = paint((p, n, s) => {
  const rowH = 0.17;
  const row = Math.floor(s[0] / rowH);
  const colf = (s[1] / 360) * 64 + (row % 2) * 0.5;
  const col = Math.floor(colf);
  const fy = fract(s[0] / rowH);
  const fx = fract(colf);
  let c: RGB;
  if (fy < 0.13 || fx < 0.06) c = mx(MORTAR, "#d9c3a2", noise(p, 0.3, 2));
  else {
    c = mx(BRICK_A, BRICK_B, hash(col, row));
    c = mx(c, "#e58f6c", 0.25 * noise(p, 0.5, 4));
  }
  const moss = smoothstep(0.55, 0.75, noise(p, 0.5, 8)) * smoothstep(1.3, 0.5, p.y);
  c = mx(c, "#7fae5a", moss * 0.7);
  c = mx(c, "#8a4a3a", 0.3 * smoothstep(1.0, 0.5, p.y));
  return lit(c, n);
});

const PLASTER = paint((p, n, s) => {
  let c = mx("#fdf5e0", "#f0dfbc", smoothstep(8.0, 2.8, p.y));
  c = mx(c, "#ead6b0", 0.25 * noise(p, 0.7, 3));
  const seam = fract((s[1] / 360) * 64);
  if (seam < 0.05) c = mx(c, "#c9b08a", 0.45);
  return lit(c, n);
});

const THATCH = paint((p, n, s) => {
  const course = fract(s[0] / 0.32);
  const crow = Math.floor(s[0] / 0.32);
  let c = mx("#e8bc62", "#d29c46", noise(p, 0.5, 5));
  const st = fract((s[1] / 360) * 90 + hash(crow) * 0.7);
  if (st < 0.12) c = mx(c, "#a9742f", 0.5);
  if (course < 0.1) c = mx(c, "#9a6428", 0.65);
  else if (course > 0.8) c = mx(c, "#f9e09a", 0.45);
  const moss = smoothstep(0.55, 0.75, noise(p, 0.45, 9)) * smoothstep(0.35, 0.9, n.y);
  c = mx(c, "#86b956", moss * 0.85);
  return lit(c, n);
});

const DECK = paint((p, n) => {
  let c: RGB;
  if (n.y > 0.5) {
    const i = Math.floor(p.x / 0.3);
    c = mx(WOOD_L, "#b98250", hash(i));
    if (fract(p.x / 0.3) < 0.07) c = mx(c, "#6f4a2c", 0.6);
  } else c = mx(WOOD, WOOD_D, 0.4);
  return lit(c, n);
});

const STONE = (() => {
  const base = patches("#8f8a80", ["#cbc4b6", "#bab3a4", "#d6cfc1"], { size: 0.5, gap: 0.12 });
  return paint((p, n) => lit(base.at(p, n), n));
})();

// ------------------------------------------------------------------------------------------------
// Textures
// ------------------------------------------------------------------------------------------------
const ARCH_WIN = `<path d="M4 80 V30 A26 26 0 0 1 56 30 V80 Z"`;
const WINDOW = svg(
  `<svg viewBox="0 0 60 84" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffeaa6"/><stop offset="1" stop-color="#ffc25e"/></linearGradient></defs>
    ${ARCH_WIN} fill="url(#g)" stroke="#6b4426" stroke-width="3.4" stroke-linejoin="round"/>
    <path d="M30 4 V80 M4 52 H56 M14 14 L30 30 L46 14" stroke="#7a4a28" stroke-width="3.4" fill="none"/>
    <path d="M10 70 L22 58" stroke="#ffffff" stroke-width="3.6" stroke-linecap="round" opacity="0.7"/>
    <path d="M36 70 L46 60" stroke="#ffffff" stroke-width="3.6" stroke-linecap="round" opacity="0.5"/>
  </svg>`,
  { size: 256 },
);

const ROUND = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="r" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stop-color="#fff2b8"/><stop offset="1" stop-color="#ffbf57"/></radialGradient></defs>
    <circle cx="32" cy="32" r="28" fill="url(#r)" stroke="#6b4426" stroke-width="3.6"/>
    <path d="M32 4 V60 M4 32 H60" stroke="#7a4a28" stroke-width="3.6"/>
    <path d="M18 18 L25 25" stroke="#ffffff" stroke-width="3.6" stroke-linecap="round" opacity="0.7"/>
  </svg>`,
  { size: 192 },
);

const DOOR = svg(
  `<svg viewBox="0 0 60 92" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="c"><path d="M4 88 V30 A26 26 0 0 1 56 30 V88 Z"/></clipPath></defs>
    <path d="M4 88 V30 A26 26 0 0 1 56 30 V88 Z" fill="#dd5a43"/>
    <g clip-path="url(#c)">
      <path d="M17 0 V92 M30 0 V92 M43 0 V92" stroke="#a83d2c" stroke-width="2.2"/>
      <rect x="4" y="30" width="52" height="7" fill="#2f2a33"/>
      <rect x="4" y="66" width="52" height="7" fill="#2f2a33"/>
      <path d="M4 52 H56" stroke="#f08a6c" stroke-width="2" opacity="0.5"/>
    </g>
    <path d="M4 88 V30 A26 26 0 0 1 56 30 V88 Z" fill="none" stroke="#7a2a1e" stroke-width="3.4" stroke-linejoin="round"/>
    <circle cx="44" cy="56" r="4.6" fill="none" stroke="#f2c24f" stroke-width="2.6"/>
    <circle cx="44" cy="52" r="2" fill="#f2c24f"/>
    <circle cx="10" cy="33.5" r="1.6" fill="#f2c24f"/><circle cx="10" cy="69.5" r="1.6" fill="#f2c24f"/>
  </svg>`,
  { size: 256 },
);

const PLAQUE = svg(
  `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="116" height="36" rx="8" fill="#2f7f80" stroke="#f2c24f" stroke-width="3"/>
    <rect x="7" y="7" width="106" height="26" rx="5" fill="none" stroke="#fff0c8" stroke-width="1" stroke-dasharray="3 2.5"/>
    <text x="60" y="26" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="16" fill="#fff0c8">ANNO 1742</text>
    <circle cx="14" cy="20" r="3.4" fill="#dd5a43"/><circle cx="106" cy="20" r="3.4" fill="#dd5a43"/>
  </svg>`,
  { size: 384 },
);

const CLOTH = svg(
  `<svg viewBox="0 0 52 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="52" height="100" rx="2" fill="#fff4de"/>
    <rect x="0" y="0" width="52" height="100" fill="none" stroke="#e5cfa0" stroke-width="3"/>
    <path d="M13 3 V97 M26 3 V97 M39 3 V97" stroke="#dcc597" stroke-width="1.8"/>
    <path d="M13 3 V97 M26 3 V97 M39 3 V97" stroke="#b79b66" stroke-width="0.8" stroke-dasharray="2.5 2.5"/>
    <rect x="29" y="52" width="16" height="16" fill="#e8694f" stroke="#fff4de" stroke-width="1" stroke-dasharray="2 1.5"/>
    <rect x="6" y="20" width="14" height="12" fill="#4fb8a7" stroke="#fff4de" stroke-width="1" stroke-dasharray="2 1.5"/>
    <path d="M30 76 L44 76 L44 88 L30 88Z" fill="#f2c24f" opacity="0.8"/>
  </svg>`,
  { size: 256 },
);

const SHUTTER = svg(
  `<svg viewBox="0 0 22 66" xmlns="http://www.w3.org/2000/svg">
    <rect width="22" height="66" fill="#4fb8a7"/>
    <path d="M7.3 0 V66 M14.6 0 V66" stroke="#39968a" stroke-width="1.2"/>
    <rect x="1" y="1" width="20" height="64" fill="none" stroke="#2d7a6e" stroke-width="2"/>
    <path d="M11 24 C11 18 3.5 18 3.5 23 C3.5 28 11 31 11 35 C11 31 18.5 28 18.5 23 C18.5 18 11 18 11 24Z" fill="#fff4de" stroke="#2d7a6e" stroke-width="1"/>
  </svg>`,
  { size: 192 },
);

const tulipSvg = (petal: string, shade: string) =>
  svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 64 C16 50 16 40 16 28" stroke="#3f8f3c" stroke-width="3.6" fill="none" stroke-linecap="round"/>
      <path d="M16 62 C6 56 4 44 5 34 C12 42 15 50 16 62Z" fill="#58b04c" stroke="#2f6f2f" stroke-width="1.4"/>
      <path d="M16 62 C26 56 28 46 27 38 C20 44 17 52 16 62Z" fill="#4ea344" stroke="#2f6f2f" stroke-width="1.4"/>
      <path d="M16 4 C8 6 4 16 7 25 C9 30 13 32 16 32 C19 32 23 30 25 25 C28 16 24 6 16 4Z" fill="${petal}" stroke="${shade}" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M16 4 C13 12 13 22 16 32 C19 22 19 12 16 4Z" fill="${shade}" opacity="0.45"/>
    </svg>`,
    { size: 160 },
  );

const LEAVES = svg(
  `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 40 C14 30 8 20 6 4 C16 14 20 28 20 40Z" fill="#58b04c" stroke="#2f6f2f" stroke-width="1.4"/>
    <path d="M20 40 C26 30 32 20 34 4 C24 14 20 28 20 40Z" fill="#4ea344" stroke="#2f6f2f" stroke-width="1.4"/>
    <path d="M20 40 C18 28 19 14 20 2 C21 14 22 28 20 40Z" fill="#6cc15a" stroke="#2f6f2f" stroke-width="1.4"/>
  </svg>`,
  { size: 128 },
);

const SACK_LABEL = svg(
  `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="20" cy="20" rx="17" ry="15" fill="#fff6e0" stroke="#b89a64" stroke-width="2.4"/>
    <path d="M20 31 V12" stroke="#c48f3e" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M20 16 L14 12 M20 16 L26 12 M20 21 L14 17 M20 21 L26 17 M20 26 L14 22 M20 26 L26 22" stroke="#c48f3e" stroke-width="2.4" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);

// ------------------------------------------------------------------------------------------------
// Geometry helpers
// ------------------------------------------------------------------------------------------------
type Wall = { y0: number; y1: number; r0: number; r1: number };
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** A point on the face of a tapered octagonal wall, with its outward normal, up and sideways tangents. */
function face(w: Wall, aDeg: number, y: number, out = 0, lat = 0) {
  const a = aDeg * DEG;
  const slope = (w.r1 - w.r0) / (w.y1 - w.y0);
  const k = -slope * C8;
  const r = (w.r0 + slope * (y - w.y0)) * C8;
  const sa = Math.sin(a);
  const ca = Math.cos(a);
  const n = V(sa, k, ca).normalize();
  const u = V(-sa * k, 1, -ca * k).normalize();
  const h = V(ca, 0, -sa);
  const at = V(sa * r, y, ca * r).addScaledVector(h, lat).addScaledVector(n, out);
  return { at, n, u, h };
}

function arch(w: number, h: number, seg = 6): [number, number][] {
  const r = w / 2;
  const cy = h - r;
  const pts: [number, number][] = [
    [-r, 0],
    [r, 0],
    [r, cy],
  ];
  for (let i = 1; i < seg; i++) {
    const t = (i / seg) * Math.PI;
    pts.push([r * Math.cos(t), cy + r * Math.sin(t)]);
  }
  pts.push([-r, cy]);
  return pts;
}

function circle(cx: number, cy: number, cz: number, r: number, n = 12) {
  return Array.from({ length: n }, (_, i) => {
    const t = (i / n) * TAU;
    return [cx + r * Math.sin(t), cy, cz + r * Math.cos(t)] as [number, number, number];
  });
}

function basisQuat(xv: THREE.Vector3, yv: THREE.Vector3) {
  const x = xv.clone().normalize();
  const y = yv.clone().normalize();
  const z = new THREE.Vector3().crossVectors(x, y).normalize();
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
}

// ------------------------------------------------------------------------------------------------
// The model
// ------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "dutch_windmill", paintSize: 2048 });

  // Dimensions (metres)
  const HUB: [number, number, number] = [0, 9.3, 4.6];
  const FAN: [number, number, number] = [0, 8.75, -5.4];
  const SAIL_R = 5.8;
  const SPIN0 = 18; // resting angle of the sail cross, degrees

  const BASEW: Wall = { y0: 0.5, y1: 2.5, r0: 3.55, r1: 3.35 };
  const BODY: Wall = { y0: 2.6, y1: 8.0, r0: 3.12, r1: 2.2 };
  const Rv = (y: number) => BODY.r0 + ((BODY.r1 - BODY.r0) * (y - BODY.y0)) / (BODY.y1 - BODY.y0);

  // Skeleton
  const mill = b.joint("mill", { at: [0, 0, 0] });
  const cap = b.joint("cap", { parent: mill, at: [0, 8, 0], dir: [0, 1, 0] });
  const sails = b.joint("sails", { parent: cap, at: HUB, dir: [0, 0, 1] });
  const fan = b.joint("fantail", { parent: cap, at: FAN, dir: [1, 0, 0] });

  type J = typeof mill;
  let bone: J = mill;
  const R = rng(11);

  // Wrappers that put everything on the current bone
  const part = (geo: THREE.BufferGeometry, color: Col, o: any = {}) => b.part(geo, color, { bone, ...o });
  const box = (s: [number, number, number], color: Col, o: any = {}) =>
    part(new THREE.BoxGeometry(s[0], s[1], s[2]), color, o);
  const rod = (a: any, c: any, r: number, color: Col, o: any = {}) =>
    b.rod(a, c, r, color, { bone, sides: 6, ...o });
  const tube = (path: any, r: any, color: Col, o: any = {}) => b.sweep(path, r, { color, bone, sides: 6, ...o });
  const ext = (outline: any, o: any) => b.extrude(outline, { bone, ...o });
  const lathe = (outline: any, o: any) => b.lathe(outline, { at: [0, 0, 0], bone, ...o });

  const tulipFrames: ReturnType<typeof frame>[] = [];
  const addTulip = (p: THREE.Vector3) => tulipFrames.push(frame([p.x, p.y, p.z], [0, 1, 0]));

  // ==============================================================================================
  // TOWER
  // ==============================================================================================
  bone = mill;
  const oct = { segments: 8, spin: 22.5 };

  lathe(
    [
      [0, 0],
      [3.95, 0],
      [3.95, 0.42],
      [3.62, 0.56],
      [0, 0.56],
    ],
    { ...oct, color: STONE, name: "plinth" },
  );
  lathe(
    [
      [0, 0.5],
      [3.55, 0.5],
      [3.35, 2.5],
      [0, 2.5],
    ],
    { ...oct, color: BRICK, name: "brickBase" },
  );
  lathe(
    [
      [0, 2.6],
      [3.12, 2.6],
      [2.2, 8.0],
      [0, 8.0],
    ],
    { ...oct, color: PLASTER, name: "body" },
  );
  lathe(
    [
      [0, 2.42],
      [4.55, 2.42],
      [4.55, 2.62],
      [4.4, 2.7],
      [0, 2.7],
    ],
    { ...oct, color: DECK, name: "gallery" },
  );

  // corner posts and belts on the smock body
  for (let k = 0; k < 8; k++) {
    const phi = (22.5 + 45 * k) * DEG;
    const p = (y: number, extra: number) => V(Math.sin(phi) * (Rv(y) + extra), y, Math.cos(phi) * (Rv(y) + extra));
    rod(p(2.7, 0.04), p(7.95, 0.04), 0.075, WOOD, { sides: 5 });
  }
  for (const y of [4.3, 6.3, 7.85]) {
    const pts = Array.from({ length: 8 }, (_, k) => {
      const phi = (22.5 + 45 * k) * DEG;
      return [Math.sin(phi) * (Rv(y) + 0.07), y, Math.cos(phi) * (Rv(y) + 0.07)] as [number, number, number];
    });
    tube(polyline(pts, { closed: true }), 0.07, WOOD_D, { sides: 5 });
  }
  // brick base corner quoins
  for (let k = 0; k < 8; k++) {
    const phi = (22.5 + 45 * k) * DEG;
    const r = (y: number) => BASEW.r0 + ((BASEW.r1 - BASEW.r0) * (y - BASEW.y0)) / (BASEW.y1 - BASEW.y0) + 0.03;
    rod(
      V(Math.sin(phi) * r(0.6), 0.6, Math.cos(phi) * r(0.6)),
      V(Math.sin(phi) * r(2.45), 2.45, Math.cos(phi) * r(2.45)),
      0.09,
      STONE_L,
      { sides: 5 },
    );
  }

  // gallery braces
  for (let k = 0; k < 8; k++) {
    const phi = (22.5 + 45 * k) * DEG;
    rod(
      V(Math.sin(phi) * 3.4, 1.85, Math.cos(phi) * 3.4),
      V(Math.sin(phi) * 4.35, 2.45, Math.cos(phi) * 4.35),
      0.1,
      WOOD_D,
      { sides: 5 },
    );
  }

  // gallery rails
  const gv = (k: number, r: number, y: number) => {
    const phi = (22.5 + 45 * k) * DEG;
    return V(Math.sin(phi) * r, y, Math.cos(phi) * r);
  };
  for (let k = 0; k < 8; k++) {
    rod(gv(k, 4.42, 2.7), gv(k, 4.42, 3.55), 0.05, WOOD_L, { sides: 5 });
    if (k === 5) continue; // opening at the stairs
    const k2 = (k + 1) % 8;
    rod(gv(k, 4.42, 3.55), gv(k2, 4.42, 3.55), 0.055, WOOD_L, { sides: 5 });
    rod(gv(k, 4.42, 3.1), gv(k2, 4.42, 3.1), 0.035, WOOD_L, { sides: 5 });
    const m = gv(k, 4.42, 0).add(gv(k2, 4.42, 0)).multiplyScalar(0.5);
    rod(V(m.x, 2.7, m.z), V(m.x, 3.55, m.z), 0.045, WOOD_L, { sides: 5 });
  }

  // stairs up to the gallery (right side)
  for (let i = 0; i < 10; i++) {
    const top = 0.27 * (i + 1);
    box([1.1, top, 0.4], i % 2 ? WOOD_L : "#d8a56c", { at: [-4.8, top / 2, -4.1 + 0.38 * i] });
  }
  box([1.3, 0.18, 1.3], WOOD_L, { at: [-4.75, 2.61, 0.17] });
  rod([-5.3, 0, 0.7], [-5.3, 2.55, 0.7], 0.08, WOOD_D, { sides: 5 });
  for (const i of [0, 3, 6, 9]) {
    const top = 0.27 * (i + 1);
    const z = -4.1 + 0.38 * i;
    rod([-5.3, top, z], [-5.3, top + 0.95 + (i === 0 ? 0.0 : 0), z], 0.04, WOOD_L, { sides: 5 });
  }
  rod([-5.3, 1.22, -4.1], [-5.3, 3.65, -0.68], 0.05, WOOD_L, { sides: 5 });
  rod([-5.3, 3.65, -0.68], [-5.3, 3.62, 0.8], 0.05, WOOD_L, { sides: 5 });
  rod([-5.3, 2.7, 0.8], [-5.3, 3.65, 0.8], 0.045, WOOD_L, { sides: 5 });
  rod([-5.3, 3.62, 0.8], gv(6, 4.42, 3.55), 0.05, WOOD_L, { sides: 5 });

  // ---------------- openings ----------------
  function windowAt(
    w: Wall,
    a: number,
    yb: number,
    ww: number,
    hh: number,
    o: { open?: boolean; boxes?: boolean; shut?: boolean; tex?: ReturnType<typeof svg> } = {},
  ) {
    const f0 = face(w, a, yb - 0.07, 0.02);
    ext(arch(ww + 0.24, hh + 0.14), {
      at: f0.at,
      x: f0.h,
      y: f0.u,
      thickness: 0.2,
      bevel: 0.025,
      color: TRIM,
      name: "windowFrame",
    });
    if (o.open) {
      const fo = face(w, a, yb, 0.115);
      ext(arch(ww, hh), { at: fo.at, x: fo.h, y: fo.u, thickness: 0.02, color: "#3b2a24", name: "hatchDark" });
    } else {
      const fc = face(w, a, yb + hh / 2, 0.125);
      glow(
        part(new THREE.PlaneGeometry((ww * 60) / 52, (hh * 84) / 76), "#ffffff", {
          at: fc.at,
          dir: fc.n,
          axis: "z",
          up: fc.u,
          texture: o.tex ?? WINDOW,
          name: "glass",
        }),
        1.1,
      );
    }
    const fs = face(w, a, yb - 0.1, 0.15);
    box([ww + 0.42, 0.09, 0.32], STONE_L, { at: fs.at, dir: fs.n, axis: "z", up: fs.u });
    if (o.shut !== false) {
      for (const sg of [1, -1]) {
        const fh = hh - 0.1;
        const fsh = face(w, a, yb + fh / 2, 0.1, sg * (ww / 2 + 0.34));
        part(new THREE.BoxGeometry(0.4, fh, 0.07), "#ffffff", {
          at: fsh.at,
          dir: fsh.n,
          axis: "z",
          up: fsh.u,
          texture: SHUTTER,
          name: "shutter",
        });
      }
    }
    if (o.boxes) {
      const fb = face(w, a, yb - 0.28, 0.27);
      box([ww + 0.32, 0.2, 0.3], "#c0693f", { at: fb.at, dir: fb.n, axis: "z", up: fb.u });
      const fsoil = face(w, a, yb - 0.17, 0.27);
      box([ww + 0.22, 0.05, 0.22], SOIL, { at: fsoil.at, dir: fsoil.n, axis: "z", up: fsoil.u });
      const cnt = 4;
      for (let i = 0; i < cnt; i++) {
        const lat = (i / (cnt - 1) - 0.5) * (ww + 0.05);
        addTulip(face(w, a, yb - 0.15, 0.27, lat).at);
      }
    }
  }

  function roundWindow(at: THREE.Vector3, n: THREE.Vector3, r: number, up?: THREE.Vector3) {
    glow(
      part(new THREE.CircleGeometry(r * 1.143, 12), "#ffffff", {
        at: at.clone().addScaledVector(n, 0.02),
        dir: n,
        axis: "z",
        up,
        texture: ROUND,
        name: "roundGlass",
      }),
      1.1,
    );
    part(new THREE.TorusGeometry(r * 1.02, 0.06, 5, 10), TRIM, { at: at.clone().addScaledVector(n, 0.02), dir: n, axis: "z", up });
  }

  // brick base: the front door
  {
    const ww = 1.1;
    const hh = 1.78;
    const yb = 0.58;
    const f0 = face(BASEW, 0, yb - 0.06, 0.03);
    ext(arch(ww + 0.4, hh + 0.2), {
      at: f0.at,
      x: f0.h,
      y: f0.u,
      thickness: 0.24,
      bevel: 0.03,
      color: STONE_L,
      name: "doorFrame",
    });
    const fd = face(BASEW, 0, yb + hh / 2, 0.15);
    part(new THREE.PlaneGeometry((ww * 60) / 52, (hh * 92) / 84), "#ffffff", {
      at: fd.at,
      dir: fd.n,
      axis: "z",
      up: fd.u,
      texture: DOOR,
      name: "door",
    });
    // keystone + lintel pegs
    const fk = face(BASEW, 0, yb + hh + 0.12, 0.12);
    box([0.22, 0.2, 0.12], "#d9cdb4", { at: fk.at, dir: fk.n, axis: "z", up: fk.u });
    // stoop
    box([1.9, 0.3, 1.0], "#cfc7b8", { at: [0, 0.15, 4.0] });
    box([1.5, 0.58, 0.5], "#d9d2c3", { at: [0, 0.29, 3.72] });
    // lanterns
    for (const sg of [1, -1]) {
      const fl = face(BASEW, 0, 1.95, 0.0, sg * 0.95);
      rod(fl.at, fl.at.clone().addScaledVector(fl.n, 0.3), 0.025, IRON, { sides: 5 });
      const lp = fl.at.clone().addScaledVector(fl.n, 0.32).add(V(0, -0.14, 0));
      glow(box([0.2, 0.28, 0.2], "#ffb347", { at: lp, name: "lantern" }), 1.6);
      box([0.26, 0.04, 0.26], IRON, { at: lp.clone().add(V(0, 0.16, 0)) });
      box([0.26, 0.04, 0.26], IRON, { at: lp.clone().add(V(0, -0.16, 0)) });
      b.spike(lp.clone().add(V(0, 0.18, 0)), [0, 1, 0], 0.14, 0.15, { color: IRON, bone, sides: 4 });
    }
  }

  // smock body windows and details
  windowAt(BODY, 0, 4.55, 0.9, 1.32, { boxes: true });
  {
    const fp = face(BODY, 0, 6.55, 0.0);
    box([1.78, 0.62, 0.1], GOLD, { at: face(BODY, 0, 6.55, 0.06).at, dir: fp.n, axis: "z", up: fp.u });
    part(new THREE.PlaneGeometry(1.64, 0.55), "#ffffff", {
      at: face(BODY, 0, 6.55, 0.125).at,
      dir: fp.n,
      axis: "z",
      up: fp.u,
      texture: PLAQUE,
      name: "plaque",
    });
  }
  windowAt(BODY, -45, 4.3, 0.8, 1.17, { boxes: true });
  windowAt(BODY, 90, 4.6, 0.7, 1.02, { boxes: false });
  windowAt(BODY, 180, 4.6, 0.8, 1.17, { boxes: true });
  windowAt(BODY, 45, 3.0, 0.95, 1.5, { open: true, shut: true });
  // gallery door (right side) at the head of the stairs
  {
    const ww = 0.9;
    const hh = 1.45;
    const yb = 2.78;
    const f0 = face(BODY, -90, yb - 0.04, 0.03);
    ext(arch(ww + 0.3, hh + 0.14), {
      at: f0.at,
      x: f0.h,
      y: f0.u,
      thickness: 0.2,
      bevel: 0.025,
      color: TRIM,
      name: "galleryDoorFrame",
    });
    const fd = face(BODY, -90, yb + hh / 2, 0.12);
    part(new THREE.PlaneGeometry((ww * 60) / 52, (hh * 92) / 84), "#ffffff", {
      at: fd.at,
      dir: fd.n,
      axis: "z",
      up: fd.u,
      texture: DOOR,
      name: "galleryDoor",
    });
  }
  windowAt(BODY, -90, 5.2, 0.6, 0.88, { boxes: false });
  for (const a of [135, -135]) {
    const f = face(BODY, a, 5.6, 0.1);
    roundWindow(f.at, f.n, 0.3, f.u);
  }

  // hoist beam with a hanging flour sack
  const sack = (x: number, yb: number, z: number, s = 1, label = true) => {
    const cy = yb + 0.34 * s;
    part(new THREE.SphereGeometry(0.5, 8, 6), "#ecdfbc", { at: [x, cy, z], scale: [0.62 * s, 0.72 * s, 0.56 * s], name: "sack" });
    b.spike([x, cy + 0.3 * s, z], [0, 1, 0], 0.2 * s, 0.13 * s, { color: "#ecdfbc", bone, sides: 6 });
    part(new THREE.TorusGeometry(0.1 * s, 0.025 * s, 4, 8), RED, {
      at: [x, cy + 0.32 * s, z],
      dir: [0, 1, 0],
      axis: "z",
      rotation: [90, 0, 0],
    });
    if (label)
      part(new THREE.PlaneGeometry(0.28 * s, 0.28 * s), "#ffffff", {
        at: [x, cy + 0.02 * s, z + 0.275 * s],
        dir: [0, 0, 1],
        axis: "z",
        texture: SACK_LABEL,
      });
  };
  {
    const hf = face(BODY, 45, 6.5, 0);
    const nh = V(hf.n.x, 0, hf.n.z).normalize();
    const s0 = hf.at.clone().addScaledVector(nh, -0.15);
    const s1 = hf.at.clone().addScaledVector(nh, 1.4);
    rod(s0, s1, 0.09, WOOD_D, { sides: 5 });
    rod(face(BODY, 45, 5.6, 0.05).at, hf.at.clone().addScaledVector(nh, 1.05), 0.06, WOOD_D, { sides: 5 });
    part(new THREE.CylinderGeometry(0.14, 0.14, 0.12, 8), IRON, {
      at: s1.clone().add(V(0, -0.14, 0)),
      dir: hf.h,
    });
    rod(V(s1.x, 6.36, s1.z), V(s1.x, 4.95, s1.z), 0.018, "#c9a96a", { sides: 4 });
    sack(s1.x, 4.25, s1.z, 0.9, false);
  }

  // sacks and tulip planters by the door
  sack(-1.35, 0, 4.1, 1.0);
  sack(1.3, 0, 4.2, 0.85);
  sack(1.7, 0, 3.9, 0.7, false);
  for (const sg of [1, -1]) {
    box([1.75, 0.42, 0.72], "#c0693f", { at: [sg * 2.65, 0.21, 4.0], name: "planter" });
    box([1.6, 0.05, 0.58], SOIL, { at: [sg * 2.65, 0.4, 4.0] });
    box([1.82, 0.07, 0.8], WOOD_D, { at: [sg * 2.65, 0.43, 4.0] });
    for (let row = 0; row < 2; row++)
      for (let i = 0; i < 6; i++)
        addTulip(V(sg * 2.65 + (i - 2.5) * 0.28 + (row ? 0.12 : 0), 0.4, 4.0 + (row ? 0.15 : -0.14)));
  }

  // ==============================================================================================
  // CAP
  // ==============================================================================================
  bone = cap;
  const CAPP: [number, number][] = [
    [0, 8.0],
    [2.62, 8.0],
    [2.72, 8.32],
    [2.6, 8.95],
    [2.2, 9.6],
    [1.55, 10.18],
    [0.7, 10.55],
    [0, 10.68],
  ];
  const capR = (y: number) => {
    for (let i = 1; i < CAPP.length; i++) {
      const [x0, y0] = CAPP[i - 1];
      const [x1, y1] = CAPP[i];
      if (y >= y0 && y <= y1) return x0 + ((x1 - x0) * (y - y0)) / (y1 - y0);
    }
    return 1;
  };
  lathe(CAPP, { segments: 10, spin: 18, color: THATCH, name: "capThatch" });
  tube(catmull(circle(0, 8.06, 0, 2.7, 12), { closed: true }), 0.1, WOOD_D, { sides: 5 });
  for (const y of [8.6, 9.05, 9.5, 9.95]) {
    tube(catmull(circle(0, y, 0, capR(y) + 0.03, 12), { closed: true }), 0.045, THATCH_D, { sides: 5 });
  }
  // scalloped reed hem
  b.along(catmull(circle(0, 8.14, 0, 2.74, 12), { closed: true }), 22, (at: any) =>
    part(new THREE.SphereGeometry(1, 6, 4), THATCH_L, { at, scale: [0.21, 0.13, 0.21], bone: cap }),
  );

  // nose where the windshaft leaves the cap
  b.lathe(
    [
      [0.3, 0],
      [1.0, 0],
      [0.95, 0.4],
      [0.65, 0.8],
      [0.38, 1.0],
      [0.3, 1.0],
    ],
    { at: [0, 9.3, 1.9], axis: [0, 0, 1], segments: 10, color: THATCH, bone: cap, name: "capNose" },
  );
  // windshaft with iron bands
  rod([0, 9.3, 1.2], [0, 9.3, 4.75], 0.27, WOOD_D, { sides: 8 });
  for (const z of [3.3, 3.75]) rod([0, 9.3, z], [0, 9.3, z + 0.16], 0.33, IRON, { sides: 8 });

  // round windows in the cap
  for (const sg of [1, -1]) {
    const n = V(sg, 0.615, 0).normalize();
    const at = V(sg * (capR(9.15) + 0.0), 9.15, 0);
    roundWindow(at, n, 0.3);
    // little hood over each
    b.spike(at.clone().add(V(sg * 0.06, 0.38, 0)), [0, 1, 0], 0.0001, 0.0001, { color: THATCH_D, bone: cap });
  }

  // vane and finial
  part(new THREE.SphereGeometry(0.2, 8, 6), GOLD, { at: [0, 10.74, 0], name: "finial" });
  rod([0, 10.8, 0], [0, 11.5, 0], 0.045, IRON, { sides: 5 });
  ext(
    [
      [-0.45, -0.12],
      [0.35, -0.12],
      [0.35, -0.25],
      [0.7, 0],
      [0.35, 0.25],
      [0.35, 0.12],
      [-0.45, 0.12],
      [-0.6, 0.3],
      [-0.7, 0.3],
      [-0.58, 0],
      [-0.7, -0.3],
      [-0.6, -0.3],
    ],
    { at: [0, 11.2, 0], x: [0, 0, 1], thickness: 0.035, color: RED, name: "vane" },
  );
  part(new THREE.SphereGeometry(0.07, 6, 4), GOLD, { at: [0, 11.55, 0] });

  // tail frame for the fantail
  for (const sg of [1, -1]) {
    rod([sg * 0.55, 9.05, -2.3], [sg * 0.55, FAN[1], FAN[2]], 0.13, WOOD, { sides: 5 });
    rod([sg * 0.9, 8.45, -2.4], [sg * 0.55, FAN[1] - 0.05, FAN[2] + 0.5], 0.07, WOOD_D, { sides: 5 });
  }
  rod([-0.55, 8.95, -3.9], [0.55, 8.95, -3.9], 0.07, WOOD_D, { sides: 5 });
  rod([-0.55, FAN[1], FAN[2]], [0.55, FAN[1], FAN[2]], 0.06, IRON, { sides: 6 });

  // ==============================================================================================
  // FANTAIL
  // ==============================================================================================
  bone = fan;
  part(new THREE.CylinderGeometry(0.2, 0.2, 0.34, 8), RED, { at: FAN, dir: [1, 0, 0], name: "fanHub" });
  const pitch = 25 * DEG;
  for (let i = 0; i < 8; i++) {
    const th = (i * 45 + 10) * DEG;
    const rh = V(0, Math.cos(th), Math.sin(th));
    const th2 = V(0, -Math.sin(th), Math.cos(th));
    const xAxis = th2.clone().multiplyScalar(Math.cos(pitch)).addScaledVector(V(1, 0, 0), Math.sin(pitch));
    const center = V(FAN[0], FAN[1], FAN[2]).addScaledVector(rh, 0.82);
    box([0.5, 1.1, 0.04], i % 2 ? CREAM : RED, { at: center, quat: basisQuat(xAxis, rh), name: "fanBlade" });
  }
  tube(
    catmull(
      Array.from({ length: 12 }, (_, j) => {
        const t = (j / 12) * TAU;
        return [0, FAN[1] + 1.43 * Math.cos(t), FAN[2] + 1.43 * Math.sin(t)] as [number, number, number];
      }),
      { closed: true },
    ),
    0.035,
    WOOD_D,
    { sides: 5 },
  );

  // ==============================================================================================
  // SAILS
  // ==============================================================================================
  bone = sails;
  const sailPos = (th: number, lat: number, rad: number, dep = 0) => {
    const t = th * DEG;
    const c = Math.cos(t);
    const s = Math.sin(t);
    return V(HUB[0] + lat * c - rad * s, HUB[1] + lat * s + rad * c, HUB[2] + dep);
  };
  const sbox = (th: number, lat: number, rad: number, w: number, len: number, dep: number, thick: number, color: Col, o: any = {}) =>
    part(new THREE.BoxGeometry(w, len, thick), color, { at: sailPos(th, lat, rad, dep), rotation: [0, 0, th], ...o });

  // hub
  part(new THREE.CylinderGeometry(0.46, 0.46, 0.62, 10), RED, { at: [HUB[0], HUB[1], HUB[2]], dir: [0, 0, 1], name: "hubDrum" });
  part(new THREE.CylinderGeometry(0.52, 0.52, 0.1, 10), CREAM, { at: [HUB[0], HUB[1], HUB[2] + 0.2], dir: [0, 0, 1] });
  b.spike([HUB[0], HUB[1], HUB[2] + 0.31], [0, 0, 1], 0.78, 0.42, { color: "#e45f45", bone: sails, sides: 8 });
  part(new THREE.SphereGeometry(0.1, 6, 4), GOLD, { at: [HUB[0], HUB[1], HUB[2] + 1.12] });

  // the two long stocks
  for (const k of [0, 1]) {
    const th = SPIN0 + 90 * k;
    sbox(th, 0, 0, 0.24, 2 * (SAIL_R + 0.15), 0, 0.2, WOOD_D, { name: "stock" });
    for (const sg of [1, -1]) sbox(th, 0, sg * (SAIL_R + 0.2), 0.34, 0.24, 0, 0.26, TEAL, { name: "stockTip" });
  }
  sbox(SPIN0, 0, 0, 1.0, 1.0, -0.14, 0.14, WOOD, { name: "hubPlate" });
  sbox(SPIN0 + 45, 0, 0, 1.0, 1.0, -0.14, 0.14, WOOD, { name: "hubPlate" });

  // four lattice arms
  const l0 = 0.14;
  const l1 = 1.5;
  const r0 = 1.2;
  const r1 = SAIL_R;
  for (let k = 0; k < 4; k++) {
    const th = SPIN0 + 90 * k;
    const rm = (r0 + r1) / 2;
    sbox(th, l1, rm, 0.09, r1 - r0 + 0.09, 0, 0.08, WOOD, { name: "sailRail" });
    sbox(th, (l0 + l1) / 2, r0, l1 - l0, 0.09, 0, 0.08, WOOD, { name: "sailRail" });
    sbox(th, (l0 + l1) / 2, r1, l1 - l0 + 0.09, 0.09, 0, 0.08, WOOD, { name: "sailRail" });
    for (let i = 1; i <= 11; i++) {
      const rad = r0 + (i * (r1 - r0)) / 12;
      sbox(th, (l0 + l1) / 2, rad, l1 - l0, 0.045, 0, 0.05, WOOD_L, { name: "sailSlat" });
    }
    for (const lat of [0.5, 0.95]) sbox(th, lat, rm, 0.04, r1 - r0, 0, 0.05, WOOD_L, { name: "sailBar" });
    // leading board
    sbox(th, -0.24, rm + 0.1, 0.22, r1 - r0 - 0.2, 0, 0.07, "#f6e8cb", { name: "leadingBoard" });
    // patched cloth
    sbox(th, 0.82, 4.28, 1.22, 2.5, 0.03, 0.02, "#ffffff", { texture: CLOTH, name: "sailCloth" });
  }

  // ==============================================================================================
  // FLOWERS (tulip cards)
  // ==============================================================================================
  bone = mill;
  const TUL = [
    tulipSvg("#e3453b", "#a82a2a"),
    tulipSvg("#f7c948", "#d9992a"),
    tulipSvg("#f48fb1", "#cc5f88"),
  ];
  b.cards(tulipFrames, TUL, { size: [0.14, 0.3], cross: true, vary: 0.3, spin: 25, rng: R, bone: mill });
  const leafFrames = tulipFrames.map((f) => frame([f.at.x, f.at.y - 0.02, f.at.z], [0, 1, 0]));
  b.cards(leafFrames, LEAVES, { size: [0.22, 0.2], cross: true, vary: 0.25, spin: 90, rng: rng(5), bone: mill });

  return b.root;
}
```