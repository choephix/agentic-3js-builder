import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  paint,
  grain,
  scales,
  mix,
  noise,
  resolve,
  smoothstep,
  svg,
} from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Wizard's Bookshelf",
  description:
    "A tall arcane bookcase with a curved gothic crest and moon cradle, packed with runed tomes, scrolls, glowing orbs, an armillary sphere, an hourglass and dripping candles, on a quiet stone dais with a runed rug.",
};

type V = [number, number, number];
type Fill = Parameters<typeof resolve>[0];
type Pt = [number, number] | [number, number, "sharp"];
type Opt = {
  rotation?: V;
  dir?: V;
  axis?: "x" | "y" | "z";
  up?: V;
  texture?: THREE.Texture;
  scale?: V;
};
const DEG = Math.PI / 180;

// ---------------------------------------------------------------------------------------------
// Palette
const GOLD = "#e8b73c";
const PAGES = "#f3e7c8";
const STRAP = "#5a3a22";
const WAX = "#f4e8cc";
const WAX_HI = "#fff8e2";
const COVERS = [
  "#5b2a86",
  "#233f8f",
  "#8c1f3c",
  "#1f6b5a",
  "#b4552a",
  "#2c2f6b",
  "#6b2f1c",
  "#7a1d6e",
  "#1d5b8c",
  "#3b3b52",
];

// ---------------------------------------------------------------------------------------------
// Textures
const starPts = (cx: number, cy: number, R: number, r: number, n: number) => {
  const out: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (i * Math.PI) / n - Math.PI / 2;
    const rad = i % 2 ? r : R;
    out.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return out.join(" ");
};

function makeSpines() {
  const GD = "#f2c14e";
  const GK = "#8a5a14";
  const SV = "#d8e6ff";
  const SK = "#5a6a8a";
  const band = (y: number, a: string, k: string) =>
    `<rect x="0" y="${y}" width="20" height="3.6" fill="${a}"/><rect x="0" y="${y + 3.6}" width="20" height="1.3" fill="${k}"/>`;
  const wrap = (inner: string) =>
    svg(`<svg viewBox="0 0 20 100" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`, { size: 256 });
  const A = wrap(
    band(6, GD, GK) +
      band(86, GD, GK) +
      `<polygon points="10,26 16,40 10,54 4,40" fill="${GD}" stroke="${GK}" stroke-width="1.2"/>` +
      `<polygon points="10,60 14,68 10,76 6,68" fill="${GD}" stroke="${GK}" stroke-width="1.2"/>`,
  );
  const B = wrap(
    band(6, SV, SK) +
      band(86, SV, SK) +
      `<path d="M10 28 L10 72 M10 40 L16 33 M10 54 L4 47 M4 64 L16 64" stroke="${SV}" stroke-width="2.6" stroke-linecap="round" fill="none"/>`,
  );
  const C = wrap(
    band(6, GD, GK) +
      band(86, GD, GK) +
      `<polygon points="${starPts(10, 30, 8.5, 3.6, 8)}" fill="${GD}" stroke="${GK}" stroke-width="1.2"/>` +
      `<path d="M14 58 A10 10 0 1 0 14 80 A7.5 7.5 0 1 1 14 58Z" fill="${GD}" stroke="${GK}" stroke-width="1"/>`,
  );
  const D = wrap(
    band(6, GD, GK) +
      band(86, GD, GK) +
      `<rect x="3" y="26" width="14" height="46" rx="2" fill="#f3e6c4" stroke="${GK}" stroke-width="1.4"/>` +
      `<path d="M6 36 H14 M6 44 H14 M6 52 H14 M6 60 H12" stroke="#4a2a14" stroke-width="2.2" stroke-linecap="round"/>`,
  );
  const E = wrap(
    band(6, GD, GK) +
      band(86, GD, GK) +
      `<circle cx="10" cy="28" r="7.5" fill="none" stroke="${GD}" stroke-width="2.6"/>` +
      `<circle cx="10" cy="28" r="4" fill="#e8325a"/>` +
      `<path d="M10 38 V76" stroke="${GD}" stroke-width="2.2"/>` +
      `<circle cx="10" cy="50" r="2.4" fill="${GD}"/><circle cx="10" cy="62" r="2.4" fill="${GD}"/><circle cx="10" cy="72" r="2.4" fill="${GD}"/>`,
  );
  // relatively plain spine: two muted bands and one thin label strip
  const PLAIN = wrap(
    `<rect x="0" y="10" width="20" height="2.6" fill="#b89a58"/><rect x="0" y="86" width="20" height="2.6" fill="#b89a58"/>` +
      `<rect x="5" y="34" width="10" height="26" rx="1" fill="#d9c79c" opacity="0.85"/>`,
  );
  return { fancy: [A, B, C, D, E], plain: PLAIN };
}

function makeMural() {
  const rs = rng(5);
  const star = (x: number, y: number, s: number, c: string, op: number) =>
    `<path d="M${x} ${y - s * 2} L${x + s * 0.5} ${y - s * 0.5} L${x + s * 2} ${y} L${x + s * 0.5} ${y + s * 0.5} L${x} ${y + s * 2} L${x - s * 0.5} ${y + s * 0.5} L${x - s * 2} ${y} L${x - s * 0.5} ${y - s * 0.5}Z" fill="${c}" opacity="${op}"/>`;
  let st = "";
  for (let i = 0; i < 21; i++) {
    const x = rs() * 60;
    const y = rs() * 90;
    const s = 0.25 + rs() * 0.45;
    st += star(x, y, s, "#8d9cdc", 0.7);
  }
  const cons: [number, number][][] = [
    [[10, 15], [16, 19], [22, 16], [28, 22], [33, 18]],
    [[14, 60], [22, 66], [30, 62], [38, 70]],
    [[42, 40], [48, 44], [53, 38]],
  ];
  let lines = "";
  for (const c of cons) {
    lines += `<polyline points="${c.map((p) => p.join(",")).join(" ")}" stroke="#6b78c4" stroke-width="0.3" fill="none" opacity="0.4"/>`;
    for (const [x, y] of c) st += `<circle cx="${x}" cy="${y}" r="0.5" fill="#a4b0ee" opacity="0.8"/>`;
  }
  for (const [x, y] of [[36, 8], [13, 20], [23, 36]]) st += star(x, y, 0.7, "#d9b86a", 0.85);
  return svg(
    `<svg viewBox="0 0 60 90" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#151040"/><stop offset="1" stop-color="#31205a"/></linearGradient>
      <radialGradient id="r" cx="0.5" cy="0.45" r="0.6"><stop offset="0" stop-color="#5a3f98" stop-opacity="0.35"/><stop offset="1" stop-color="#5a3f98" stop-opacity="0"/></radialGradient></defs>
      <rect width="60" height="90" fill="url(#g)"/><rect width="60" height="90" fill="url(#r)"/>
      ${lines}
      <path d="M52 8 A5 5 0 1 0 52 18 A4 4 0 1 1 52 8Z" fill="#fff0c0" opacity="0.5"/>
      ${st}
    </svg>`,
    { size: 512 },
  );
}

// dark coloured rim at the sphere's sides/poles, luminous cloudy core, soft internal swirl
const orbTex = (rim: string, mid: string, core: string, sw: string) => {
  const inner = `<path d="M8 42 C18 20 34 54 56 26" stroke="${sw}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <ellipse cx="30" cy="34" rx="14" ry="8" fill="${sw}" opacity="0.7"/>
    <ellipse cx="42" cy="22" rx="9" ry="5" fill="${core}" opacity="0.8"/>`;
  return svg(
    `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${rim}"/><stop offset="0.28" stop-color="${mid}"/><stop offset="0.5" stop-color="${core}"/><stop offset="0.72" stop-color="${mid}"/><stop offset="1" stop-color="${rim}"/></linearGradient>
        <linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${rim}" stop-opacity="0.9"/><stop offset="0.28" stop-color="${rim}" stop-opacity="0"/><stop offset="0.72" stop-color="${rim}" stop-opacity="0"/><stop offset="1" stop-color="${rim}" stop-opacity="0.9"/></linearGradient>
        <filter id="b" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="3.2"/></filter>
      </defs>
      <rect x="0" y="0" width="64" height="64" fill="url(#h)"/>
      <rect x="64" y="0" width="64" height="64" fill="url(#h)"/>
      <g filter="url(#b)" opacity="0.45">${inner}<g transform="translate(64 0)">${inner}</g></g>
      <rect x="0" y="0" width="128" height="64" fill="url(#v)"/>
    </svg>`,
    { size: 256 },
  );
};

const FLAME = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2 C20 18 30 30 28 46 C27 58 20 62 16 62 C12 62 5 58 4 46 C2 32 12 20 16 2Z" fill="#ff8a1c"/>
    <path d="M16 22 C19 32 24 38 23 48 C22 56 19 58 16 58 C13 58 10 56 9 48 C8 40 13 32 16 22Z" fill="#ffd54a"/>
    <ellipse cx="16" cy="50" rx="4.5" ry="8" fill="#fff6d0"/>
  </svg>`,
  { size: 128 },
);

const EMBLEM = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="29" fill="none" stroke="#ffd46a" stroke-width="2.4"/>
    <circle cx="32" cy="32" r="23" fill="none" stroke="#9ef0ff" stroke-width="1.4"/>
    <polygon points="${starPts(32, 32, 20, 8, 8)}" fill="#bff6ff" stroke="#ffffff" stroke-width="1"/>
    <circle cx="32" cy="32" r="5" fill="#ffd46a"/>
  </svg>`,
  { size: 256 },
);

const RUNE_CIRCLE = (() => {
  let ticks = "";
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    const c = Math.cos(a);
    const s = Math.sin(a);
    ticks += `<path d="M${50 + 36 * c} ${50 + 36 * s} L${50 + 44 * c} ${50 + 44 * s} M${50 + 40 * c - 2.5 * s} ${50 + 40 * s + 2.5 * c} L${50 + 40 * c + 2.5 * s} ${50 + 40 * s - 2.5 * c}" stroke="#ffd46a" stroke-width="1.5" stroke-linecap="round" fill="none"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="47" fill="none" stroke="#ffd46a" stroke-width="1.8"/>
      <circle cx="50" cy="50" r="34" fill="none" stroke="#ffd46a" stroke-width="1.5"/>
      <polygon points="${starPts(50, 50, 33, 33, 3)}" fill="none" stroke="#9ef0ff" stroke-width="1.4"/>
      <polygon points="${starPts(50, 50, 33, 33, 3).split(" ").reverse().join(" ")}" fill="none" stroke="#9ef0ff" stroke-width="1.4"/>
      ${ticks}
    </svg>`,
    { size: 512 },
  );
})();

const PLAQUE = svg(
  `<svg viewBox="0 0 100 18" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="18" rx="2" fill="#241240"/>
    <rect x="1.5" y="1.5" width="97" height="15" rx="1.5" fill="none" stroke="#f2c14e" stroke-width="1.2"/>
    <text x="50" y="13.4" text-anchor="middle" font-family="serif" font-weight="bold" font-size="13" fill="#ffd46a" letter-spacing="1.2">ARCANUM</text>
  </svg>`,
  { size: 512 },
);

// ---------------------------------------------------------------------------------------------
// Outlines
// Gently curved gothic profile: low shoulders, the rise concentrated in the central fifth.
const arch = (W: number, H: number): Pt[] => {
  const right: [number, number][] = [
    [1, 0.24],
    [0.87, 0.3],
    [0.65, 0.35],
    [0.46, 0.41],
    [0.32, 0.51],
    [0.2, 0.73],
    [0.1, 0.92],
  ];
  const pts: Pt[] = [[-W, 0, "sharp"], [W, 0, "sharp"]];
  for (const [fx, fy] of right) pts.push([W * fx, H * fy]);
  pts.push([0, H, "sharp"]);
  for (const [fx, fy] of right.slice().reverse()) pts.push([-W * fx, H * fy]);
  return pts;
};

const crescent = (): Pt[] => {
  const Ro = 0.13;
  const d = 0.06;
  const r2 = 0.105;
  const x = (d * d + Ro * Ro - r2 * r2) / (2 * d);
  const y = Math.sqrt(Ro * Ro - x * x);
  const phi = Math.atan2(y, x);
  const psi = Math.atan2(y, x - d);
  const out: Pt[] = [];
  for (let i = 0; i <= 10; i++) {
    const a = phi + ((2 * Math.PI - 2 * phi) * i) / 10;
    const p: [number, number] = [Ro * Math.cos(a), Ro * Math.sin(a)];
    out.push(i === 0 || i === 10 ? [p[0], p[1], "sharp"] : p);
  }
  for (let i = 1; i <= 9; i++) {
    const a = 2 * Math.PI - psi - ((2 * Math.PI - 2 * psi) * i) / 10;
    out.push([d + r2 * Math.cos(a), r2 * Math.sin(a)]);
  }
  return out;
};

const star4 = (R: number): Pt[] => {
  const out: Pt[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const rad = i % 2 ? R * 0.32 : R;
    out.push([rad * Math.cos(a), rad * Math.sin(a)]);
  }
  return out;
};

// ---------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "wizard_bookshelf" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(11);

  const P = (geo: THREE.BufferGeometry, color: Fill, at: V, o: Opt = {}) =>
    b.part(geo, color, { bone: root, at, ...o });
  const box = (w: number, h: number, d: number, color: Fill, at: V, o: Opt = {}) =>
    P(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cyl = (r: number, h: number, seg: number, color: Fill, at: V, o: Opt = {}) =>
    P(new THREE.CylinderGeometry(r, r, h, seg), color, at, o);
  const ball = (r: number, color: Fill, at: V, o: Opt = {}) =>
    P(new THREE.SphereGeometry(r, 10, 7), color, at, o);
  const lathe = (profile: [number, number][], at: V, color: Fill, seg = 10, o: Opt = {}) =>
    b.lathe(profile, { at, color, segments: seg, bone: root, ...o });

  // ---- paints
  // broad face-to-face value changes: lighter tops, mid fronts, darker sides/undersides
  const lit = (base: Fill) =>
    paint((p, n) => {
      const c = resolve(base, p, n);
      const up = smoothstep(0.3, 0.95, n.y);
      const front = smoothstep(0.4, 1, n.z);
      const dark = mix(c, "#1a1030", 0.2 * (1 - up) * (1 - front));
      return mix(dark, "#6a5088", 0.2 * up + 0.08 * front);
    });
  const tintNear = (base: Fill, c: V, r: number, col: string, amt: number) =>
    paint((p, n) => {
      const b0 = resolve(base, p, n);
      const d = Math.hypot(p.x - c[0], (p.y - c[1]) * 0.7, p.z - c[2]);
      const k = (1 - smoothstep(0, r, d)) * amt * smoothstep(-0.1, 0.8, n.y);
      return mix(b0, col, k);
    });
  const WOOD_V = lit(grain("#30203f", "#3b294f", { size: 0.09, axis: "y" }));
  const WOOD_H = lit(grain("#30203f", "#3b294f", { size: 0.09, axis: "x" }));
  const WOOD_D = lit(grain("#241638", "#2f1f45", { size: 0.09, axis: "y" }));
  const WOOD_FILL = lit(grain("#34234a", "#3e2c55", { size: 0.1, axis: "y" }));
  const RAIL = lit(grain("#3a2a50", "#45335c", { size: 0.09, axis: "y" }));
  const BEVEL = "#5b4379";
  const GILT = metal("gilt", { tarnish: 0.05 });
  const BRASS = metal("brass");
  const STONE = scales(["#4a496f", "#524f78", "#444366"], "#23223a", { size: 0.14, width: 0.1 });
  const PLAT = paint((p, n) => {
    const e = Math.max(Math.abs(p.x) / 0.9, Math.abs(p.z - 0.2) / 0.45);
    if (n.y > 0.5 && e > 0.92 && noise(p, 0.08, 3) > 0.6) return "#4a7a48";
    return STONE;
  });
  const RUG = paint((p, n) => {
    if (n.y < 0.5) return "#4a0f24";
    const e = Math.max(Math.abs(p.x) / 0.5, Math.abs(p.z - 0.43) / 0.19);
    if (e > 0.94) return "#e0b040";
    if (e > 0.86) return "#3a1060";
    if (e > 0.82) return "#e0b040";
    return (Math.floor(p.x / 0.05) + Math.floor(p.z / 0.05)) & 1 ? "#8a1f45" : "#7a1a3c";
  });

  // ---- textures
  const SP = makeSpines();
  const MURAL = makeMural();
  const ORB_BLUE = orbTex("#12307a", "#3fa6ff", "#c4f6ff", "#eafcff");
  const ORB_VIOLET = orbTex("#34127a", "#9a4cf0", "#e6c4ff", "#f6e8ff");
  const ORB_GOLD = orbTex("#8a4a10", "#f0b030", "#fff0b0", "#fff8d8");

  // ---------------------------------------------------------------------------------------------
  // Platform
  box(1.8, 0.035, 0.94, PLAT, [0, 0.0175, 0.2]);
  box(1.7, 0.035, 0.86, PLAT, [0, 0.0525, 0.2]);
  box(1.0, 0.012, 0.38, RUG, [0, 0.076, 0.43]);
  glow(
    P(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", [0, 0.0835, 0.43], {
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      texture: RUNE_CIRCLE,
    }),
    1.1,
  );

  // ---------------------------------------------------------------------------------------------
  // Bookcase carcass
  const BT = [0.21, 0.59, 0.96, 1.32, 1.67];
  box(1.38, 0.11, 0.44, WOOD_D, [0, 0.125, 0]);
  box(1.4, 0.014, 0.46, GILT, [0, 0.187, 0]);
  for (const s of [1, -1]) {
    box(0.05, 1.84, 0.4, WOOD_V, [s * 0.625, 1.1, 0]);
    box(0.012, 1.8, 0.012, GILT, [s * 0.6, 1.1, 0.204]);
    box(0.012, 1.8, 0.012, GILT, [s * 0.65, 1.1, 0.204]);
    ball(0.032, GILT, [s * 0.69, 0.13, 0.22]);
    for (let i = 0; i < 6; i++) glow(ball(0.011, "#8ff0ff", [s * 0.625, 0.32 + i * 0.3, 0.208]), 1.3);

    // recessed side panel framed by rails
    box(0.004, 1.45, 0.26, WOOD_D, [s * 0.652, 1.1, 0]);
    for (const zz of [1, -1]) box(0.012, 1.5, 0.025, RAIL, [s * 0.656, 1.1, zz * 0.1425]);
    for (const yy of [1, -1]) box(0.012, 0.025, 0.26, RAIL, [s * 0.656, 1.1 + yy * 0.7375, 0]);
  }
  // back: shaded backing, perimeter frame and three broad vertical boards
  box(1.2, 1.77, 0.02, WOOD_D, [0, 1.095, -0.18]);
  for (const s of [1, -1]) box(0.04, 1.77, 0.018, RAIL, [s * 0.58, 1.095, -0.191]);
  for (const yy of [1, -1]) box(1.2, 0.04, 0.018, RAIL, [0, 1.095 + yy * 0.865, -0.191]);
  for (const bx of [-0.3733, 0, 0.3733]) box(0.366, 1.69, 0.012, WOOD_V, [bx, 1.095, -0.19]);
  P(new THREE.PlaneGeometry(1.2, 1.77), "#ffffff", [0, 1.095, -0.168], { texture: MURAL });

  // shelves; the one under the blue orb catches its cyan light
  const SHELF_BLUE = tintNear(WOOD_H, [0, BT[1], 0.04], 0.24, "#5fd0ff", 0.45);
  for (let i = 0; i < BT.length; i++) {
    const t = BT[i];
    box(1.2, 0.03, 0.4, i === 1 ? SHELF_BLUE : WOOD_H, [0, t - 0.015, 0]);
    box(1.2, 0.008, 0.012, BEVEL, [0, t - 0.026, 0.202]);
    box(1.2, 0.012, 0.01, GILT, [0, t - 0.004, 0.205]);
  }
  box(1.42, 0.04, 0.46, WOOD_H, [0, 2.0, 0]);
  box(1.46, 0.014, 0.48, GILT, [0, 2.027, 0]);
  for (let i = -4; i <= 4; i++) ball(0.011, GOLD, [i * 0.15, 2.0, 0.235]);
  // nameplate: backing box front is z = 0.228, lettering plane just in front
  box(0.4, 0.07, 0.01, "#1f1236", [0, 0.125, 0.223]);
  P(new THREE.PlaneGeometry(0.4, 0.072), "#ffffff", [0, 0.125, 0.2295], { texture: PLAQUE });

  // ---- crest
  const CY = 2.034;
  b.extrude(arch(0.69, 0.37), {
    at: [0, CY, 0.105],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.02,
    color: WOOD_D,
    bone: root,
  });
  b.extrude(arch(0.69, 0.37), {
    at: [0, CY, 0.135],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.06,
    bevel: 0.006,
    color: GILT,
    bone: root,
  });
  b.extrude(arch(0.665, 0.35), {
    at: [0, CY, 0.15],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.05,
    bevel: 0.008,
    color: WOOD_FILL,
    bone: root,
  });
  glow(
    P(new THREE.PlaneGeometry(0.19, 0.19), "#ffffff", [0, CY + 0.17, 0.178], { texture: EMBLEM }),
    1.2,
  );
  const mc: V = [0, CY + 0.47, 0.12];
  b.extrude(crescent(), {
    at: mc,
    x: [0, 1, 0],
    y: [-1, 0, 0],
    thickness: 0.035,
    bevel: 0.005,
    color: GILT,
    bone: root,
  });
  glow(P(new THREE.SphereGeometry(0.052, 12, 9), "#ffffff", mc, { texture: ORB_GOLD }), 1.4);
  for (const s of [1, -1]) {
    lathe(
      [[0, 0], [0.04, 0], [0.04, 0.03], [0.024, 0.055], [0.024, 0.14], [0.038, 0.17], [0, 0.27]],
      [s * 0.66, CY, 0.16],
      GILT,
      8,
    );
    glow(ball(0.022, "#ffe9a0", [s * 0.66, CY + 0.285, 0.16]), 1.5);
  }

  // ---------------------------------------------------------------------------------------------
  // Helpers: candles
  const FL: V[] = [];
  function candle(x: number, y: number, z: number, h: number, r: number, drips = 3, lit_ = true) {
    cyl(r, h, 8, WAX, [x, y + h / 2, z]);
    cyl(r * 1.1, 0.008, 8, WAX_HI, [x, y + h - 0.002, z]);
    for (let k = 0; k < drips; k++) {
      const a = R() * Math.PI * 2;
      b.spike([x + Math.cos(a) * r, y + h, z + Math.sin(a) * r], [0, -1, 0], h * (0.18 + R() * 0.3), 0.008, {
        color: WAX_HI,
        bone: root,
      });
    }
    cyl(0.0025, 0.022, 5, "#2a1a14", [x, y + h + 0.008, z]);
    if (lit_) FL.push([x, y + h + 0.014, z]);
  }
  function dish(x: number, y: number, z: number, r: number) {
    lathe(
      [[0, 0], [r, 0], [r * 1.1, 0.012], [r * 1.05, 0.016], [r * 0.8, 0.01], [0, 0.01]],
      [x, y, z],
      BRASS,
      10,
    );
    P(new THREE.TorusGeometry(0.02, 0.004, 5, 10), GILT, [x + r + 0.012, y + 0.014, z]);
  }
  function dishCandle(x: number, y: number, z: number, h: number, r: number, drips: number, dr: number) {
    dish(x, y, z, dr);
    candle(x, y + 0.0085, z, h, r, drips);
  }
  function candelabra(x: number, y: number, z: number) {
    lathe(
      [[0, 0], [0.05, 0], [0.055, 0.01], [0.03, 0.025], [0.014, 0.045], [0.016, 0.1], [0.026, 0.115], [0.012, 0.125], [0.012, 0.15], [0, 0.15]],
      [x, y, z],
      GILT,
      10,
    );
    dish(x, y + 0.15, z, 0.02);
    candle(x, y + 0.162, z, 0.085, 0.014, 3);
    for (const s of [1, -1]) {
      b.sweep(
        catmull([
          [x, y + 0.1, z],
          [x + s * 0.045, y + 0.095, z],
          [x + s * 0.085, y + 0.12, z],
          [x + s * 0.09, y + 0.15, z],
        ]),
        0.008,
        { color: GILT, bone: root },
      );
      lathe([[0, 0], [0.02, 0], [0.024, 0.014], [0.016, 0.016], [0, 0.016]], [x + s * 0.09, y + 0.148, z], GILT, 8);
      candle(x + s * 0.09, y + 0.164, z, 0.065 + R() * 0.02, 0.013, 2);
    }
  }

  // ---------------------------------------------------------------------------------------------
  // Helpers: books
  function placeBook(
    cx: number,
    cy: number,
    w: number,
    h: number,
    d: number,
    zc: number,
    rotZ: number,
    kind: "tome" | "thin" = "thin",
  ) {
    const ci = Math.floor(R() * COVERS.length);
    const cov = COVERS[ci];
    const a = rotZ * DEG;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const at = (dx: number, dy: number, dz: number): V => [cx + dx * ca - dy * sa, cy + dx * sa + dy * ca, zc + dz];
    const ro: V = [0, 0, rotZ];
    const ct = kind === "tome" ? 0.012 : 0.008;
    // cover boards (they project past the recessed page block)
    for (const sx of [1, -1]) box(ct, h, d, cov, at(sx * (w / 2 - ct / 2), 0, 0), { rotation: ro });
    // spine
    box(w - 0.001, h, 0.012, cov, at(0, 0, d / 2 - 0.004), { rotation: ro });
    // pale page block, recessed top, bottom and back
    box(w - 2 * ct - 0.002, h - 0.014, d - 0.014, PAGES, at(0, 0, -0.006), { rotation: ro });
    const tex = kind === "tome" ? SP.fancy[Math.floor(R() * SP.fancy.length)] : R() < 0.4 ? SP.plain : SP.fancy[Math.floor(R() * SP.fancy.length)];
    P(new THREE.PlaneGeometry(w - 0.004, h - 0.016), "#ffffff", at(0, 0, d / 2 + 0.0035), {
      rotation: ro,
      texture: tex,
    });
    if (kind === "tome") {
      if (R() < 0.6) glow(ball(0.009, "#ff4a70", at(0, h * 0.12, d / 2 + 0.008)), 1.2);
      box(0.006, 0.07, 0.003, "#d23a5a", at(w * 0.2, -h / 2 + 0.02, d / 2 + 0.006), { rotation: ro });
    }
  }
  function row(x0: number, x1: number, base: number, hmin: number, hmax: number, leanEnd = false) {
    const lim = x1 - (leanEnd ? 0.13 : 0);
    const len = lim - x0;
    let x = x0 + 0.012;
    let edge = x;
    let lastH = hmax;
    const marks = len > 0.45 ? [0.12 + 0.2 * R(), 0.62 + 0.2 * R()] : [0.1 + 0.4 * R()];
    let mi = 0;
    while (x < lim - 0.03) {
      if (mi < marks.length && (x - x0) / len >= marks[mi]) {
        const w = 0.07 + R() * 0.02;
        if (x + w > lim) break;
        const h = Math.min(0.33, hmax + 0.015 + R() * 0.02);
        const d = 0.26 + R() * 0.02;
        placeBook(x + w / 2, base + h / 2, w, h, d, 0.154 - d / 2, 0, "tome");
        lastH = h;
        x += w;
        edge = x;
        x += 0.014 + R() * 0.01;
        mi++;
        continue;
      }
      const n = 3 + Math.floor(R() * 3);
      for (let i = 0; i < n; i++) {
        const w = 0.026 + R() * 0.014;
        if (x + w > lim) {
          x = lim;
          break;
        }
        const h = hmin + R() * (hmax - hmin);
        const d = 0.19 + R() * 0.07;
        const zc = 0.15 - d / 2 + (R() < 0.2 ? 0.015 : -R() * 0.01);
        placeBook(x + w / 2, base + h / 2, w, h, d, zc, 0, "thin");
        lastH = h;
        x += w;
        edge = x;
        x += 0.002;
      }
      x += 0.014 + R() * 0.012;
    }
    if (leanEnd) {
      const w = 0.04;
      const h = hmin + (hmax - hmin) * 0.8;
      const d = 0.22;
      const th = 15 * DEG;
      const px = edge + lastH * Math.sin(th) * 0.9 + 0.004;
      const cx = px + (w / 2) * Math.cos(th) - (h / 2) * Math.sin(th);
      const cy = base + (w / 2) * Math.sin(th) + (h / 2) * Math.cos(th);
      placeBook(cx, cy, w, h, d, 0.15 - d / 2, 15, "thin");
    }
  }
  function lying(cx: number, base: number, cz: number, w: number, t: number, d: number, yaw: number, ci: number, gem = false) {
    const a = yaw * DEG;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const at = (dx: number, dy: number, dz: number): V => [cx + dx * c + dz * s, base + dy, cz - dx * s + dz * c];
    const ro: V = [0, yaw, 0];
    const cov = COVERS[ci % COVERS.length];
    box(w, t * 0.16, d, cov, at(0, t * 0.08, 0), { rotation: ro });
    box(w, t * 0.16, d, cov, at(0, t * 0.92, 0), { rotation: ro });
    box(w * 0.94, t * 0.7, d * 0.92, PAGES, at(0, t * 0.5, -d * 0.03), { rotation: ro });
    box(w, t, 0.014, cov, at(0, t / 2, d / 2 - 0.007), { rotation: ro });
    P(new THREE.PlaneGeometry(t * 0.94, w * 0.96), "#ffffff", at(0, t / 2, d / 2 + 0.002), {
      rotation: [0, yaw, -90],
      texture: SP.fancy[ci % SP.fancy.length],
    });
    for (const sx of [1, -1])
      for (const sz of [1, -1])
        box(0.026, t + 0.004, 0.026, GOLD, at(sx * (w / 2 - 0.011), t / 2, sz * (d / 2 - 0.011)), { rotation: ro });
    box(0.022, t + 0.006, d + 0.004, STRAP, at(w * 0.28, t / 2, 0), { rotation: ro });
    box(0.03, 0.006, 0.03, GOLD, at(w * 0.28, t + 0.004, 0), { rotation: ro });
    if (gem) glow(ball(0.014, "#ff4a70", at(-w * 0.15, t + 0.008, 0)), 1.3);
    return base + t;
  }

  // ---------------------------------------------------------------------------------------------
  // Helpers: scrolls, orbs, misc
  function scrollLying(cx: number, cy: number, cz: number, len: number, r: number, paperC: string, rib: string) {
    cyl(r, len, 10, paperC, [cx, cy, cz], { rotation: [0, 0, 90] });
    for (const sg of [-1, 1]) {
      cyl(r * 0.5, 0.022, 8, GOLD, [cx + sg * (len / 2 + 0.008), cy, cz], { rotation: [0, 0, 90] });
      cyl(r * 1.04, 0.006, 10, "#d3b98a", [cx + sg * (len / 2 - 0.004), cy, cz], { rotation: [0, 0, 90] });
    }
    P(new THREE.TorusGeometry(r * 1.05, 0.005, 5, 10), rib, [cx + len * 0.18, cy, cz], { rotation: [0, 90, 0] });
    cyl(0.011, 0.006, 8, "#b3202e", [cx + len * 0.18, cy, cz + r * 1.08], { rotation: [90, 0, 0] });
  }
  function scrollUp(base: V, dir: V, len: number, r: number, paperC: string, rib: string) {
    const l = Math.hypot(dir[0], dir[1], dir[2]);
    const u: V = [dir[0] / l, dir[1] / l, dir[2] / l];
    const mid: V = [base[0] + u[0] * len * 0.5, base[1] + u[1] * len * 0.5, base[2] + u[2] * len * 0.5];
    cyl(r, len, 8, paperC, mid, { dir: u });
    const top: V = [base[0] + u[0] * len, base[1] + u[1] * len, base[2] + u[2] * len];
    cyl(r * 0.96, 0.006, 8, "#d3b98a", top, { dir: u });
    const rb: V = [base[0] + u[0] * len * 0.7, base[1] + u[1] * len * 0.7, base[2] + u[2] * len * 0.7];
    P(new THREE.TorusGeometry(r * 1.06, 0.004, 5, 8), rib, rb, { dir: u, axis: "z" });
  }
  function orb(x: number, y: number, z: number, r: number, tex: THREE.Texture, stand = true, cup: Fill = GILT, str = 1.2) {
    let cy = y + r;
    if (stand) {
      lathe(
        [[0, 0], [0.07, 0], [0.075, 0.012], [0.05, 0.03], [0.02, 0.05], [0.02, 0.09], [0.055, 0.13], [0.062, 0.16], [0.046, 0.158], [0.04, 0.145], [0, 0.145]],
        [x, y, z],
        cup,
        10,
      );
      cy = y + 0.145 + r * 0.72;
    }
    glow(P(new THREE.SphereGeometry(r, 12, 9), "#ffffff", [x, cy, z], { texture: tex }), str);
    glow(
      P(new THREE.SphereGeometry(r * 0.16, 6, 4), "#ffffff", [x + r * 0.34, cy + r * 0.5, z + r * 0.76], {
        scale: [1.3, 0.7, 0.5],
      }),
      1.6,
    );
  }
  function armillary(x: number, y: number, z: number) {
    lathe([[0, 0], [0.06, 0], [0.065, 0.01], [0.03, 0.03], [0.012, 0.06], [0, 0.07]], [x, y, z], GILT, 8);
    const cy = y + 0.08 + 0.105;
    const RR = 0.1;
    const ring = (rot: V) => P(new THREE.TorusGeometry(RR, 0.005, 5, 24), GILT, [x, cy, z], { rotation: rot });
    ring([0, 0, 0]);
    ring([0, 90, 0]);
    ring([60, 0, 40]);
    ring([90, 0, 0]);
    cyl(0.004, 0.22, 5, GILT, [x, cy, z]);
    glow(P(new THREE.SphereGeometry(0.036, 10, 8), "#ffffff", [x, cy, z], { texture: ORB_GOLD }), 1.0);
    glow(ball(0.012, "#ffe9a0", [x, cy + RR, z]), 1.2);
    glow(ball(0.012, "#9ef0ff", [x + RR, cy, z]), 1.2);
    glow(ball(0.012, "#ffe9a0", [x, cy, z + RR]), 1.2);
  }
  function hourglass(x: number, y: number, z: number) {
    cyl(0.052, 0.014, 10, GILT, [x, y + 0.007, z]);
    cyl(0.052, 0.014, 10, GILT, [x, y + 0.221, z]);
    glow(
      lathe(
        [[0, 0], [0.038, 0.005], [0.04, 0.03], [0.032, 0.06], [0.006, 0.095], [0.006, 0.105], [0.032, 0.14], [0.04, 0.17], [0.038, 0.195], [0, 0.2]],
        [x, y + 0.014, z],
        "#f6dc8a",
        10,
      ),
      0.8,
    );
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3 + 0.5;
      cyl(0.004, 0.21, 5, GILT, [x + 0.047 * Math.cos(a), y + 0.119, z + 0.047 * Math.sin(a)]);
    }
  }
  function flask(x: number, y: number, z: number) {
    glow(
      lathe(
        [[0, 0], [0.036, 0], [0.046, 0.02], [0.044, 0.045], [0.022, 0.075], [0.02, 0.105], [0.026, 0.112], [0, 0.112]],
        [x, y, z],
        "#58f0a0",
        8,
      ),
      0.9,
    );
    cyl(0.017, 0.022, 6, "#8a5a30", [x, y + 0.122, z]);
  }

  // ---------------------------------------------------------------------------------------------
  // Shelf contents
  // Compartment 1: stacked tomes, flask, books, ink pot and quill
  let top = lying(-0.36, BT[0], 0.0, 0.4, 0.07, 0.27, 3, 0);
  top = lying(-0.35, top, -0.01, 0.34, 0.06, 0.24, -5, 3, true);
  top = lying(-0.37, top, 0.0, 0.28, 0.05, 0.2, 7, 7);
  flask(-0.37, top, 0.02);
  row(-0.1, 0.42, BT[0], 0.24, 0.33, true);
  lathe([[0, 0], [0.04, 0], [0.05, 0.02], [0.05, 0.045], [0.03, 0.058], [0.03, 0.065], [0, 0.065]], [0.52, BT[0], 0.06], "#1e2a6a", 8);
  const qd: V = [0.18, 1, 0];
  const qb: V = [0.52, BT[0] + 0.06, 0.06];
  b.rod(qb, [qb[0] + qd[0] * 0.2, qb[1] + qd[1] * 0.2, qb[2]], 0.003, { color: "#f5f0e0", bone: root });
  b.extrude(
    [[0, 0, "sharp"], [0.022, 0.04], [0.026, 0.1], [0.012, 0.16], [0, 0.19, "sharp"], [-0.012, 0.15], [-0.024, 0.09], [-0.02, 0.04]],
    {
      at: [qb[0] + qd[0] * 0.05, qb[1] + 0.05, qb[2]],
      x: [1, 0, 0],
      y: qd,
      thickness: 0.004,
      color: "#3fd0c8",
      bone: root,
    },
  );

  // Compartment 2: books, blue orb (the focal point), scroll jar
  row(-0.59, -0.16, BT[1], 0.24, 0.33, true);
  const CUP_BLUE = tintNear(GILT, [0, BT[1] + 0.2, 0.04], 0.16, "#7fe8ff", 0.5);
  orb(0.0, BT[1], 0.04, 0.075, ORB_BLUE, true, CUP_BLUE, 1.5);
  lathe(
    [[0, 0], [0.045, 0], [0.06, 0.03], [0.062, 0.08], [0.05, 0.115], [0.055, 0.125], [0.05, 0.13], [0, 0.13]],
    [0.3, BT[1], 0.04],
    "#243a7a",
    10,
  );
  P(new THREE.TorusGeometry(0.052, 0.005, 5, 12), GILT, [0.3, BT[1] + 0.13, 0.04], { rotation: [90, 0, 0] });
  const jarScrolls: [V, V, string, string][] = [
    [[0.285, BT[1] + 0.05, 0.03], [-0.12, 1, 0.05], "#efe0b8", "#c8344f"],
    [[0.315, BT[1] + 0.05, 0.05], [0.12, 1, -0.04], "#e6d3a0", "#2c6fc8"],
    [[0.3, BT[1] + 0.05, 0.06], [0.02, 1, 0.12], "#f3e7c8", "#c8344f"],
    [[0.295, BT[1] + 0.05, 0.02], [0.04, 1, -0.12], "#d9c08a", "#2fa88a"],
  ];
  for (const [bs, dr, pc, rc] of jarScrolls) scrollUp(bs, dr, 0.25, 0.016, pc, rc);
  row(0.43, 0.59, BT[1], 0.22, 0.3);

  // Compartment 3: candelabra, hourglass, books
  candelabra(-0.44, BT[2], 0.03);
  hourglass(-0.14, BT[2], 0.04);
  row(0.04, 0.59, BT[2], 0.24, 0.32, true);

  // Compartment 4: scroll pyramid (3 touching below, 2 nested above), armillary, books
  const sr = 0.026;
  const bottomZ = [0.0, 0.052, 0.104];
  const scrollCols: [string, string][] = [
    ["#efe0b8", "#c8344f"],
    ["#e6d3a0", "#2c6fc8"],
    ["#f3e7c8", "#2fa88a"],
    ["#d9c08a", "#c8344f"],
    ["#efe0b8", "#7a2cc8"],
  ];
  bottomZ.forEach((zz, i) => scrollLying(-0.4, BT[3] + sr, zz, 0.34, sr, scrollCols[i][0], scrollCols[i][1]));
  [0.026, 0.078].forEach((zz, i) =>
    scrollLying(-0.4, BT[3] + sr + 0.045, zz, 0.34, sr, scrollCols[3 + i][0], scrollCols[3 + i][1]),
  );
  armillary(0.0, BT[3], 0.05);
  row(0.18, 0.59, BT[3], 0.22, 0.3, true);

  // Compartment 5: books, violet orb, lying tome with candles
  row(-0.59, -0.24, BT[4], 0.2, 0.27, true);
  orb(-0.02, BT[4], 0.04, 0.055, ORB_VIOLET, true, GILT, 1.0);
  const t5 = lying(0.3, BT[4], 0.0, 0.3, 0.05, 0.22, 4, 2);
  dish(0.3, t5, 0.04, 0.045);
  candle(0.3, t5 + 0.012, 0.04, 0.1, 0.017, 4);
  dish(0.52, BT[4], 0.05, 0.035);
  candle(0.52, BT[4] + 0.012, 0.05, 0.08, 0.014, 3);

  // ---------------------------------------------------------------------------------------------
  // Candle clusters on the cornice, raised on gilt pedestals so dishes show above the crest shoulders
  for (const s of [1, -1]) {
    const x = s * 0.59;
    const py = CY + 0.15;
    lathe(
      [[0, 0], [0.065, 0], [0.07, 0.014], [0.04, 0.03], [0.022, 0.06], [0.022, 0.11], [0.04, 0.125], [0.062, 0.145], [0, 0.15]],
      [x, CY, 0],
      GILT,
      10,
    );
    dish(x, py, 0, 0.09);
    candle(x + s * 0.05, py + 0.0085, 0.0, 0.28, 0.022, 4);
    candle(x - s * 0.005, py + 0.0085, 0.04, 0.19, 0.026, 5);
    candle(x - s * 0.055, py + 0.0085, -0.03, 0.12, 0.02, 3);
  }

  // ---------------------------------------------------------------------------------------------
  // Side sconces on solid backplates
  for (const s of [1, -1]) {
    box(0.02, 0.17, 0.1, BRASS, [s * 0.666, 1.45, 0.05]);
    for (const dy of [1, -1])
      for (const dz of [1, -1]) ball(0.007, GOLD, [s * 0.678, 1.45 + dy * 0.07, 0.05 + dz * 0.035]);
    b.sweep(
      catmull([
        [s * 0.67, 1.45, 0.05],
        [s * 0.71, 1.43, 0.05],
        [s * 0.76, 1.44, 0.05],
        [s * 0.79, 1.47, 0.05],
      ]),
      0.01,
      { color: GILT, bone: root },
    );
    dish(s * 0.8, 1.47, 0.05, 0.045);
    candle(s * 0.8, 1.482, 0.05, 0.15, 0.02, 4);
  }

  // ---------------------------------------------------------------------------------------------
  // Floor props
  const f1 = lying(0.65, 0.07, 0.4, 0.34, 0.07, 0.25, 8, 1);
  const f2 = lying(0.66, f1, 0.41, 0.28, 0.06, 0.2, -10, 4, true);
  const f3 = lying(0.65, f2, 0.4, 0.22, 0.05, 0.16, 14, 5);
  orb(0.65, f3, 0.4, 0.058, ORB_VIOLET, false, GILT, 1.0);

  dishCandle(-0.76, 0.07, 0.3, 0.32, 0.055, 6, 0.1);
  dishCandle(-0.62, 0.07, 0.38, 0.13, 0.03, 4, 0.045);
  dishCandle(-0.78, 0.07, 0.46, 0.09, 0.026, 3, 0.036);
  scrollLying(-0.66, 0.096, 0.56, 0.3, 0.026, "#efe0b8", "#c8344f");

  const crystals: [number, number, number, V][] = [
    [0.66, 0.595, 1.0, [0, 0, 0]],
    [0.74, 0.585, 0.7, [10, 0, -16]],
    [0.58, 0.59, 0.6, [-12, 0, 14]],
  ];
  for (const [cx, cz, sc2, rot] of crystals) {
    glow(
      lathe([[0, 0], [0.03, 0], [0.03, 0.08], [0, 0.14]], [cx, 0.07, cz], "#7fe0ff", 6, {
        rotation: rot,
        scale: [sc2, sc2, sc2],
      }),
      1.0,
    );
  }

  // ---------------------------------------------------------------------------------------------
  // Magic sparkles
  const sparks: [number, number, number, number][] = [
    [0.32, 2.5, 0.2, 0.05],
    [-0.34, 2.42, 0.2, 0.04],
    [0.88, 1.2, 0.4, 0.045],
    [-0.9, 0.95, 0.45, 0.04],
    [0.5, 0.65, 0.62, 0.035],
    [-0.3, 1.0, 0.7, 0.03],
    [0.86, 1.9, 0.25, 0.035],
  ];
  for (const [x, y, z, sz] of sparks)
    glow(
      b.extrude(star4(sz), {
        at: [x, y, z],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.006,
        color: "#ffe9a0",
        bone: root,
      }),
      1.5,
    );
  for (let i = 0; i < 10; i++)
    glow(ball(0.006 + R() * 0.004, "#bff6ff", [(R() - 0.5) * 1.6, 0.4 + R() * 2.0, 0.28 + R() * 0.3]), 1.5);

  // ---------------------------------------------------------------------------------------------
  // Flames
  glow(
    b.cards(
      FL.map((p) => frame(p, [0, 1, 0])),
      FLAME,
      { size: [0.045, 0.085], cross: true, vary: 0.15, rng: rng(9), bone: root },
    ),
    1.4,
  );

  return b.root;
}
