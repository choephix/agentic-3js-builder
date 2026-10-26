```ts
import * as THREE from "three";
import { createBuilder, rng, paint, mix, smoothstep, svg, catmull } from "agentic-3js-builder";
import type { ColorInput } from "agentic-3js-builder";
import { cel, zigzag } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Arctic Research Outpost",
  description:
    "A Firewatch-style diorama of a red-timber polar research cabin on a snowy ice shelf: glowing windows and lantern, smoke, radio mast with guy wires, satellite dish, weather station, fuel drums, sled, snowmobile, pines and layered sunset ridges, all in flat warm colour.",
};

type V = [number, number, number];
const D2R = Math.PI / 180;
const frac = (x: number) => x - Math.floor(x);

// ------------------------------------------------------------------ palette (flat, hue-shifted shadows)
const PLUM = "#2b2142";
const SNOW_SHADE = "#bba8d8";
const SNOW = cel(paint((p) => mix("#fff4e6", "#ffcdb8", smoothstep(0, -6, p.z) * 0.85)), SNOW_SHADE);
const boards = (base: string, seam: string, step: number) =>
  paint((p) => (frac(p.y / step) < 0.09 ? seam : base));
const WALL = cel(boards("#d9552c", "#a63a22", 0.22));
const CREAM = cel("#f6e2bc", "#cdb3b8");
const ROOF = cel("#2e5d62", "#223f55");
const MUSTARD = cel("#f2b440");
const WOOD = cel("#94603d");
const DWOOD = cel("#5b3a3d");
const LOGS = cel("#bd7a4c", "#8a4f4d");
const STEEL = cel("#9aa7c4", "#5d6590");
const DSTEEL = cel("#4a5072");
const ORANGE = cel("#ee7a2c");
const WHITE = cel("#fbf0e4", "#c9bcdc");
const TEAL = cel("#2f8189");
const ICE = cel("#bfdcf0", "#86a6d6");
const ROCK = cel("#7a6a9a", "#4f4478");
const PINE_A = cel("#2b6a62", "#1b4558");
const PINE_B = cel("#235a5c", "#173b50");
const BRICK = cel(
  paint((p) => {
    const r = Math.floor(p.y / 0.12);
    const u = (p.x + p.z) / 0.26 + (r % 2) * 0.5;
    return frac(p.y / 0.12) < 0.14 || frac(u) < 0.07 ? "#d9b9a6" : "#a24c46";
  }),
);
const SLATS = paint((p) => (frac(p.y / 0.07) < 0.55 ? "#f9eee2" : "#bba8d0"));
const STRIPE_POLE = paint((p) => (frac(p.y / 0.22) < 0.5 ? "#d8402f" : "#f6e2bc"));
const FLAGP = paint((_p, _n, s) => {
  const dx = s[0] - 0.34;
  const dy = s[1] - 0.38;
  const d = Math.hypot(dx, dy);
  if (d < 0.1) return "#2b2142";
  if (d < 0.15) return "#f6e2bc";
  if (s[1] > 0.5) return "#ee7a2c";
  if (s[1] > 0.25) return "#f6e2bc";
  return "#2f8189";
});
const ridgePaint = (rock: string, rock2: string, snow: string, snow2: string, snowLine: number, mist: string, mistH: number) =>
  paint((_p, _n, s) => {
    const y = s[1];
    const edge = snowLine + 0.5 * zigzag(s[0] / 0.6);
    const facet = frac((s[0] + y * 0.7) / 1.7) < 0.5;
    const c = y > edge ? (facet ? snow : snow2) : facet ? rock : rock2;
    return y < mistH ? mix(c, mist, 0.7 * (1 - y / mistH)) : c;
  });

export default function build() {
  const b = createBuilder({ name: "arctic_outpost", paintSize: 2048 });
  const R = rng(5);

  interface PO {
    rotation?: V;
    quat?: THREE.Quaternion;
    scale?: V;
    dir?: V;
    axis?: "x" | "y" | "z";
    texture?: THREE.Texture;
    flat?: boolean;
    up?: V;
  }
  const part = (geo: THREE.BufferGeometry, color: ColorInput, at: V, o: PO = {}) => b.part(geo, color, { at, ...o });
  const box = (w: number, h: number, d: number, color: ColorInput, at: V, o: PO = {}) =>
    part(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, color: ColorInput, at: V, o: PO = {}) =>
    part(new THREE.CylinderGeometry(rt, rb, h, seg), color, at, { flat: true, ...o });
  const ball = (r: number, color: ColorInput, at: V, o: PO = {}) =>
    part(new THREE.SphereGeometry(r, 7, 5), color, at, { flat: true, ...o });
  const cone = (r: number, h: number, seg: number, color: ColorInput, at: V, o: PO = {}) =>
    part(new THREE.ConeGeometry(r, h, seg), color, at, { flat: true, ...o });
  const rod = (a: V, c: V, r: number, color: ColorInput) => b.rod(a, c, r, { color, sides: 6 });
  const Q = (pitch = 0, yaw = 0, roll = 0) =>
    new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch * D2R, yaw * D2R, roll * D2R, "YXZ"));
  const plane = (w: number, h: number, at: V, dir: V, tex: THREE.Texture) =>
    part(new THREE.PlaneGeometry(w, h), "#ffffff", at, { dir, axis: "z", texture: tex });

  // ------------------------------------------------------------------ textures
  const WINDOW = svg(
    `<svg viewBox="0 0 40 36" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffeaa0"/><stop offset="1" stop-color="#ff9d3c"/></linearGradient></defs>
      <rect width="40" height="36" fill="url(#g)"/>
      <path d="M0 0 L12 0 Q8 14 10 36 L0 36Z" fill="#e8663a"/>
      <path d="M40 0 L30 0 Q33 14 31 36 L40 36Z" fill="#e8663a"/>
      <rect x="22" y="28" width="6" height="8" fill="#a8452f"/>
      <path d="M25 28 Q20 20 23 16 Q25 22 25 28 M25 28 Q31 21 29 15 Q26 21 25 28 M25 28 Q25 18 26 12" stroke="#3b5c45" stroke-width="2" fill="none"/>
      <rect x="19" y="0" width="2.4" height="36" fill="#6e3526"/>
      <rect x="0" y="16.4" width="40" height="2.4" fill="#6e3526"/>
    </svg>`,
    { size: 192 },
  );
  const WINDOW2 = svg(
    `<svg viewBox="0 0 40 36" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="g" cx="0.5" cy="0.55" r="0.7"><stop offset="0" stop-color="#fff3b8"/><stop offset="1" stop-color="#ff9a3a"/></radialGradient></defs>
      <rect width="40" height="36" fill="url(#g)"/>
      <path d="M14 10 L26 10 L29 22 L11 22Z" fill="#fff9d8"/>
      <rect x="19" y="22" width="2" height="9" fill="#7a3d2b"/>
      <rect x="14" y="31" width="12" height="3" fill="#7a3d2b"/>
      <rect x="0" y="4" width="40" height="2" fill="#7a3d2b"/>
      <rect x="19" y="0" width="2.4" height="36" fill="#6e3526"/>
      <rect x="0" y="16.4" width="40" height="2.4" fill="#6e3526"/>
    </svg>`,
    { size: 192 },
  );
  const SIGN = svg(
    `<svg viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="98" height="28" rx="4" fill="#f6e2bc" stroke="#4a2d3a" stroke-width="2.4"/>
      <rect x="5" y="5" width="90" height="3" fill="#d8402f"/>
      <text x="50" y="21" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="13" fill="#2b2142">STATION 7</text>
      <text x="50" y="27" text-anchor="middle" font-family="Georgia, serif" font-size="4.6" fill="#7a3d2b">ARCTIC RESEARCH 82°N</text>
    </svg>`,
    { size: 384 },
  );
  const CRATE = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="#a06a42"/>
      <path d="M0 16H64M0 32H64M0 48H64" stroke="#6f4631" stroke-width="1.6"/>
      <rect x="3" y="3" width="58" height="58" fill="none" stroke="#5a3b38" stroke-width="5"/>
      <path d="M6 6L58 58M58 6L6 58" stroke="#5a3b38" stroke-width="4"/>
      <rect x="18" y="24" width="28" height="16" fill="#f6e2bc"/>
      <text x="32" y="36" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="11" fill="#2b2142">ARC-7</text>
    </svg>`,
    { size: 128 },
  );
  const DRUM = svg(
    `<svg viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="38" height="48" rx="5" fill="#fbf0e4" stroke="#2b2142" stroke-width="2"/>
      <path d="M20 8 Q30 18 26 27 Q24 22 21 24 Q23 17 20 8Z M20 8 Q10 19 14 28 Q18 33 24 29 Q26 24 20 8Z" fill="#d8402f"/>
      <path d="M20 17 Q25 24 22 29 Q17 30 17 25 Q18 21 20 17Z" fill="#f2b440"/>
      <text x="20" y="44" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="9" fill="#2b2142">FUEL</text>
    </svg>`,
    { size: 128 },
  );
  let ticks = "";
  for (let i = 0; i <= 10; i++) {
    const an = (-135 + i * 27) * D2R;
    const x1 = 50 + 30 * Math.sin(an);
    const y1 = 42 - 30 * Math.cos(an);
    const x2 = 50 + 24 * Math.sin(an);
    const y2 = 42 - 24 * Math.cos(an);
    ticks += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="#2b2142" stroke-width="2"/>`;
  }
  const GAUGE = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="96" height="96" rx="8" fill="#2f8189" stroke="#2b2142" stroke-width="4"/>
      <circle cx="50" cy="42" r="35" fill="#f6e2bc" stroke="#2b2142" stroke-width="3"/>
      <path d="M50 42 A28 28 0 0 1 72 28" stroke="#d8402f" stroke-width="5" fill="none" transform="rotate(30 50 42)"/>
      ${ticks}
      <path d="M50 42 L66 24" stroke="#d8402f" stroke-width="3" stroke-linecap="round"/>
      <circle cx="50" cy="42" r="4" fill="#2b2142"/>
      <rect x="18" y="82" width="64" height="10" rx="2" fill="#f6e2bc"/>
      <text x="50" y="90" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="8" fill="#2b2142">-31°C  WIND 9</text>
    </svg>`,
    { size: 192 },
  );
  const TARP = svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="#d8a24a"/>
      <path d="M-4 8L8 -4M-4 20L20 -4M-4 32L32 -4M8 36L36 8M20 36L36 20" stroke="#bb7f3a" stroke-width="3"/>
      <rect x="18" y="16" width="9" height="9" fill="#2f8189" stroke="#1b4558" stroke-width="1.2" stroke-dasharray="2 1.4"/>
      <rect x="3" y="3" width="26" height="26" fill="none" stroke="#8a5a2f" stroke-width="1.5" stroke-dasharray="3 2"/>
    </svg>`,
    { size: 128 },
  );
  const CLOUDS = svg(
    `<svg viewBox="0 0 100 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="3" width="62" height="5" rx="2.5" fill="#ffd8c4"/>
      <rect x="24" y="10" width="72" height="4.5" rx="2.2" fill="#ffc4b4"/>
      <rect x="10" y="17" width="40" height="3.5" rx="1.7" fill="#ffd8c4"/>
    </svg>`,
    { size: 512 },
  );

  // ------------------------------------------------------------------ backdrop: sky bands, sun, layered ridges
  const bandCols = ["#ffbd72", "#f78e5e", "#e5657c", "#a9528f", "#60498f"];
  bandCols.forEach((c, i) => box(24, 2.7, 0.2, c, [0, 1.35 + i * 2.7, -10.6]));
  box(24, 0.4, 0.2, bandCols[0], [0, -0.0, -10.6]);
  glow(part(new THREE.CircleGeometry(2.6, 24), "#ffc98a", [3.4, 4.6, -10.3], { dir: [0, 0, 1], axis: "z" }), 0.9);
  glow(part(new THREE.CircleGeometry(1.6, 24), "#ffe9b0", [3.4, 4.6, -10.2], { dir: [0, 0, 1], axis: "z" }), 1.2);
  for (const [x, y, w] of [[-5, 8.6, 7], [4.5, 10.2, 6], [-1, 6.9, 5]] as [number, number, number][])
    plane(w, w * 0.24, [x, y, -10.1], [0, 0, 1], CLOUDS);

  const ridges: [number, number, number, number, number, string, string, string, string, string][] = [
    // z, seed, hMin, hMax, peakX, rock, rock2, snow, snow2, mist
    [-9.4, 21, 2.5, 4.8, 4, "#ee9468", "#e5835f", "#ffe0b8", "#ffd0a6", "#ffc08a"],
    [-8.6, 22, 3, 5.8, -4, "#cf6a80", "#c35c78", "#ffc9c6", "#f6b5b8", "#ffa88a"],
    [-7.8, 23, 3.2, 6.6, 2, "#94548f", "#864a88", "#f4b9cc", "#e5a2bd", "#e07a88"],
    [-7.0, 24, 2.8, 6.2, -3, "#50407e", "#443773", "#cfaedd", "#b996cf", "#8b5f9e"],
  ];
  for (const [z, seed, hMin, hMax, peakX, rock, rock2, snow, snow2, mist] of ridges) {
    const r = rng(seed);
    const pts: [number, number][] = [[-10, 0]];
    const step = 1.25;
    const n = Math.round(20 / step);
    for (let i = 0; i <= n; i++) {
      const x = -10 + i * step;
      const env = 0.55 + 0.45 * Math.exp(-Math.pow((x - peakX) / 4.5, 2));
      const hi = i % 2 === 0;
      const y = (hMin + (hMax - hMin) * (hi ? 0.6 + 0.4 * r() : 0.05 + 0.3 * r())) * env;
      pts.push([x, Math.max(y, 0.9)]);
    }
    pts.push([10, 0]);
    b.extrude(pts, {
      at: [0, 0, z],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.35,
      color: ridgePaint(rock, rock2, snow, snow2, hMax * 0.6, mist, 1.6),
    });
  }

  // ------------------------------------------------------------------ the ice shelf
  const GY = 0.8;
  const R0 = rng(11);
  const jitter = Array.from({ length: 16 }, () => 0.88 + 0.12 * R0());
  const blob = (r: number): [number, number][] =>
    jitter.map((k, i) => {
      const a = (i / 16) * Math.PI * 2;
      return [Math.cos(a) * r * k, Math.sin(a) * r * k];
    });
  const slab = (r: number, y0: number, y1: number, color: ColorInput) =>
    b.extrude(blob(r), { at: [0, (y0 + y1) / 2, 0], x: [1, 0, 0], y: [0, 0, -1], thickness: y1 - y0, color });
  slab(5.0, 0, 0.3, "#4c3f72");
  slab(5.55, 0.3, 0.56, ICE);
  slab(5.9, 0.56, GY, SNOW);

  const drifts: [number, number, number, number, number][] = [
    [-4.4, 0.4, 0.28, 1.2, 0.8],
    [4.3, 0.9, 0.3, 1.0, 1.4],
    [0.2, -3.2, 0.3, 2.0, 0.9],
    [2.8, -3.0, 0.26, 1.3, 0.8],
    [-3.5, -3.1, 0.3, 1.4, 1.0],
    [-1.4, 4.3, 0.25, 1.4, 0.7],
    [1.9, 4.1, 0.22, 1.1, 0.7],
  ];
  for (const [x, z, h, sx, sz] of drifts) ball(1, SNOW, [x, GY - h * 0.4, z], { scale: [sx, h * 1.4, sz] });

  const rocks: [number, number, number][] = [[4.0, 2.4, 0.5], [4.15, -2.5, 0.4], [-1.0, 4.2, 0.33], [-2.9, -2.6, 0.38]];
  for (const [x, z, r] of rocks) {
    part(new THREE.IcosahedronGeometry(r, 0), ROCK, [x, GY + r * 0.2, z], { flat: true, scale: [1, 0.75, 0.9] });
    part(new THREE.IcosahedronGeometry(r, 0), SNOW, [x, GY + r * 0.55, z], { flat: true, scale: [0.72, 0.4, 0.66] });
  }

  // ------------------------------------------------------------------ pines
  const tree = (x: number, z: number, s: number, alt: boolean) => {
    const trunkH = 0.5 * s;
    cyl(0.1 * s, 0.15 * s, trunkH, 6, DWOOD, [x, GY + trunkH / 2 - 0.02, z]);
    const g = alt ? PINE_B : PINE_A;
    for (let k = 0; k < 3; k++) {
      const r = (1.0 - 0.24 * k) * 0.95 * s;
      const hh = 1.6 * s * (1 - 0.06 * k);
      const baseY = GY + trunkH * 0.7 + k * 0.95 * s;
      cone(r, hh, 7, g, [x, baseY + hh / 2, z], { rotation: [0, k * 25, 0] });
      cone(r * 0.7, hh * 0.7, 7, SNOW, [x, baseY + hh - hh * 0.35, z], { rotation: [0, k * 25, 0], scale: [1.07, 1.03, 1.07] });
    }
  };
  const trees: [number, number, number][] = [
    [-4.4, -2.4, 1.2],
    [-3.2, -3.6, 1.0],
    [-1.2, -4.2, 1.3],
    [0.9, -3.9, 0.9],
    [3.0, -3.9, 1.2],
    [4.0, 0.7, 0.8],
    [-4.5, 1.7, 0.7],
  ];
  trees.forEach(([x, z, s], i) => tree(x, z, s, i % 2 === 1));

  // ------------------------------------------------------------------ the cabin
  const CX = -0.9;
  const CZ = -0.4;
  const FL = GY + 0.35;
  const WH = 2.3;
  const W = 4.4;
  const D = 3.2;
  const EY = FL + WH;
  const RISE = 1.05;
  const cab = (x: number, y: number, z: number): V => [CX + x, FL + y, CZ + z];

  for (const x of [-1.9, 0, 1.9])
    for (const z of [-1.4, 1.4]) cyl(0.13, 0.15, 0.5, 6, DWOOD, cab(x, -0.2, z));
  box(W + 0.1, 0.16, D + 0.1, DWOOD, cab(0, -0.08, 0));
  box(W, WH, D, WALL, cab(0, WH / 2, 0));
  box(W + 0.05, 0.14, D + 0.05, DWOOD, cab(0, 0.07, 0));
  box(W + 0.05, 0.1, D + 0.05, CREAM, cab(0, WH - 0.05, 0));
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(0.16, WH, 0.16, CREAM, cab(sx * (W / 2), WH / 2, sz * (D / 2)));
  for (const s of [1, -1])
    b.extrude(
      [[-D / 2, 0], [D / 2, 0], [0, RISE]],
      { at: cab(s * (W / 2 - 0.05), WH, 0), x: [0, 0, 1], y: [0, 1, 0], thickness: 0.1, color: WALL },
    );

  // roof
  const a = Math.atan2(RISE, D / 2);
  const ad = a / D2R;
  const ov = 0.32;
  const Ls = (D / 2 + ov) / Math.cos(a) + 0.06;
  const zc = (D / 2 + ov) / 2;
  for (const s of [1, -1]) {
    const base = cab(0, WH + RISE - zc * Math.tan(a), s * zc);
    const n: V = [0, Math.cos(a), s * Math.sin(a)];
    const up: V = [0, Math.sin(a), -s * Math.cos(a)];
    const at = (k1: number, k2: number, ax = 0): V => [
      base[0] + ax,
      base[1] + n[1] * k1 + up[1] * k2,
      base[2] + n[2] * k1 + up[2] * k2,
    ];
    box(W + 0.7, 0.14, Ls, ROOF, at(0.07, 0), { quat: Q(s * ad) });
    box(W + 0.55, 0.18, Ls - 0.5, SNOW, at(0.2, 0.14), { quat: Q(s * ad) });
    for (const e of [1, -1]) box(0.07, 0.2, Ls, CREAM, at(0.02, 0, e * (W / 2 + 0.33)), { quat: Q(s * ad) });
  }
  box(W + 0.78, 0.16, 0.3, DWOOD, cab(0, WH + RISE + 0.1, 0));
  // icicles along the front eave
  for (let i = 0; i < 12; i++) {
    const x = -2.2 + i * 0.4 + (R() - 0.5) * 0.12;
    const h = 0.18 + R() * 0.3;
    cone(0.035, h, 5, ICE, cab(x, 2.03 - h / 2, D / 2 + ov - 0.08), { rotation: [180, 0, 0] });
  }
  for (let i = 0; i < 5; i++) {
    const z = -1.1 + i * 0.55;
    const h = 0.16 + R() * 0.25;
    cone(0.03, h, 5, ICE, cab(W / 2 + 0.3, 2.35 - h / 2 + 0.02, z), { rotation: [180, 0, 0] });
  }

  // windows
  const win = (c: V, ax: "z" | "x", sg: 1 | -1, w: number, h: number, tex: THREE.Texture) => {
    const P = (u: number, v: number, d: number): V =>
      ax === "z" ? [c[0] + u, c[1] + v, c[2] + d * sg] : [c[0] + d * sg, c[1] + v, c[2] + u];
    const fb = (du: number, dv: number, dd: number, u: number, v: number, d: number, col: ColorInput) =>
      box(ax === "z" ? du : dd, dv, ax === "z" ? dd : du, col, P(u, v, d));
    glow(plane(w, h, P(0, 0, 0.02), ax === "z" ? [0, 0, sg] : [sg, 0, 0], tex), 1.1);
    const t = 0.09;
    fb(w + 2 * t, t, 0.07, 0, h / 2 + t / 2, 0.03, CREAM);
    fb(w + 2 * t, t, 0.07, 0, -h / 2 - t / 2, 0.03, CREAM);
    fb(t, h, 0.07, -w / 2 - t / 2, 0, 0.03, CREAM);
    fb(t, h, 0.07, w / 2 + t / 2, 0, 0.03, CREAM);
    fb(w + 0.3, 0.07, 0.2, 0, -h / 2 - t - 0.035, 0.08, CREAM);
    fb(w + 0.22, 0.06, 0.17, 0, -h / 2 - t + 0.03, 0.08, SNOW);
  };
  win(cab(-1.45, 1.3, D / 2), "z", 1, 0.8, 0.75, WINDOW);
  win(cab(-0.15, 1.3, D / 2), "z", 1, 0.8, 0.75, WINDOW2);
  win(cab(W / 2, 1.3, -0.1), "x", 1, 0.8, 0.75, WINDOW);
  win(cab(-W / 2, 1.35, 0.2), "x", -1, 0.8, 0.75, WINDOW2);

  // warm light spilling onto the snow
  b.extrude([[-0.55, 0], [0.55, 0], [0.8, 1.2], [-0.8, 1.2]], {
    at: [CX - 1.45, GY + 0.004, CZ + D / 2 + 0.05], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.01, color: "#ffdca0",
  });
  b.extrude([[-0.55, 0], [0.55, 0], [0.8, 1.0], [-0.8, 1.0]], {
    at: [CX - 0.15, GY + 0.009, CZ + D / 2 + 0.05], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.01, color: "#ffe6b4",
  });

  // door, porch, lantern, sign
  const DX = 1.2;
  box(0.9, 1.85, 0.08, MUSTARD, cab(DX, 0.925, D / 2 + 0.04));
  box(0.6, 0.6, 0.02, "#c98a2b", cab(DX, 0.5, D / 2 + 0.09));
  glow(plane(0.4, 0.45, cab(DX, 1.4, D / 2 + 0.095), [0, 0, 1], WINDOW), 1.0);
  box(0.46, 0.05, 0.03, CREAM, cab(DX, 1.4 - 0.25, D / 2 + 0.1));
  ball(0.04, "#5b3a3d", cab(DX + 0.32, 0.95, D / 2 + 0.11));
  for (const s of [1, -1]) box(0.1, 1.95, 0.1, CREAM, cab(DX + s * 0.5, 0.975, D / 2 + 0.05));
  box(1.1, 0.1, 0.1, CREAM, cab(DX, 1.95, D / 2 + 0.05));
  plane(0.8, 0.24, cab(DX, 2.1, D / 2 + 0.03), [0, 0, 1], SIGN);

  box(1.9, 0.12, 1.1, WOOD, cab(DX, -0.06, D / 2 + 0.55));
  for (let i = 0; i < 4; i++) box(1.9, 0.02, 0.025, DWOOD, cab(DX, 0.002, D / 2 + 0.2 + i * 0.27));
  box(1.3, 0.14, 0.32, WOOD, cab(DX, -0.24, D / 2 + 1.26));
  box(1.3, 0.14, 0.32, WOOD, cab(DX, -0.41, D / 2 + 1.56));
  box(1.34, 0.05, 0.34, SNOW, cab(DX, -0.14, D / 2 + 1.26));
  for (const sx of [-1, 1]) {
    const x = DX + sx * 0.88;
    for (const z of [D / 2 + 0.12, D / 2 + 1.0]) box(0.07, 0.9, 0.07, CREAM, cab(x, 0.45, z));
    rod(cab(x, 0.9, D / 2 + 0.12), cab(x, 0.9, D / 2 + 1.0), 0.03, CREAM);
    rod(cab(x, 0.5, D / 2 + 0.12), cab(x, 0.5, D / 2 + 1.0), 0.022, CREAM);
  }
  // lantern
  const LX = DX + 0.82;
  rod(cab(LX, 1.75, D / 2), cab(LX, 1.75, D / 2 + 0.28), 0.02, DSTEEL);
  rod(cab(LX, 1.75, D / 2 + 0.28), cab(LX, 1.68, D / 2 + 0.28), 0.012, DSTEEL);
  cone(0.1, 0.09, 6, DSTEEL, cab(LX, 1.6, D / 2 + 0.28));
  glow(cyl(0.065, 0.065, 0.17, 6, "#ffc45a", cab(LX, 1.5, D / 2 + 0.28)), 1.6);
  cyl(0.08, 0.08, 0.025, 6, DSTEEL, cab(LX, 1.4, D / 2 + 0.28));
  b.extrude([[-0.5, 0], [0.5, 0], [0.8, 0.9], [-0.8, 0.9]], {
    at: [CX + LX, FL + 0.19, CZ + D / 2 + 0.35], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.01, color: "#ffd890",
  });

  // east-wall instruments
  plane(0.34, 0.5, cab(W / 2, 1.2, 1.0), [1, 0, 0], GAUGE);
  box(0.05, 0.56, 0.4, DSTEEL, cab(W / 2 + 0.005, 1.2, 1.0));

  // chimney + smoke
  const chim = cab(-1.3, 0, -0.55);
  box(0.55, 1.7, 0.55, BRICK, [chim[0], EY + 1.05, chim[2]]);
  box(0.72, 0.12, 0.72, DWOOD, [chim[0], EY + 1.95, chim[2]]);
  box(0.32, 0.1, 0.32, "#1d1630", [chim[0], EY + 2.04, chim[2]]);
  box(0.7, 0.07, 0.7, SNOW, [chim[0], EY + 2.04, chim[2]]);
  const smoke: [number, number, number][] = [
    [0, 0.0, 0.2], [-0.25, 0.55, 0.28], [-0.65, 1.1, 0.36], [-1.2, 1.6, 0.44], [-1.9, 2.05, 0.52], [-2.7, 2.45, 0.6],
  ];
  smoke.forEach(([dx, dy, r], i) =>
    part(new THREE.IcosahedronGeometry(r, 0), i % 2 ? "#dcbfd0" : "#f6e0d8", [chim[0] + dx, EY + 2.35 + dy, chim[2] + 0.05 * i], {
      flat: true,
      rotation: [i * 20, i * 35, 0],
    }),
  );

  // weather vane on the ridge
  const VX = CX + 1.7;
  const VY = FL + WH + RISE + 0.18;
  rod([VX, VY, CZ], [VX, VY + 0.65, CZ], 0.02, DSTEEL);
  rod([VX - 0.25, VY + 0.3, CZ], [VX + 0.25, VY + 0.3, CZ], 0.012, DSTEEL);
  rod([VX, VY + 0.3, CZ - 0.25], [VX, VY + 0.3, CZ + 0.25], 0.012, DSTEEL);
  rod([VX - 0.42, VY + 0.65, CZ], [VX + 0.42, VY + 0.65, CZ], 0.017, ORANGE);
  cone(0.06, 0.2, 5, ORANGE, [VX + 0.5, VY + 0.65, CZ], { dir: [1, 0, 0] });
  b.extrude([[0, 0.2], [0.36, 0.2], [0.22, 0], [0.36, -0.2], [0, -0.2]], {
    at: [VX - 0.4, VY + 0.65, CZ], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.015, color: ORANGE,
  });

  // firewood against the west wall
  const logBase = CX - W / 2 - 0.18;
  box(0.5, 0.08, 1.3, DWOOD, [logBase, GY + 0.04, CZ + 0.2]);
  const rowsN = [4, 3, 2];
  rowsN.forEach((cnt, row) => {
    for (let i = 0; i < cnt; i++) {
      const x = logBase - ((cnt - 1) * 0.095) + i * 0.19;
      cyl(0.095, 0.095, 1.2, 7, LOGS, [x, GY + 0.17 + row * 0.17, CZ + 0.2], { rotation: [90, 0, 0] });
    }
  });
  box(0.55, 0.06, 1.2, SNOW, [logBase, GY + 0.17 + 2 * 0.17 + 0.1, CZ + 0.2]);

  // ------------------------------------------------------------------ radio mast
  const MX = 2.9;
  const MZ = -0.8;
  const MH = 6.4;
  const hw = (h: number) => 0.36 - 0.2 * (h / MH);
  const levels = [0, 1.3, 2.6, 3.9, 5.2, MH];
  const corner = (h: number, sx: number, sz: number): V => [MX + sx * hw(h), GY + 0.2 + h, MZ + sz * hw(h)];
  const cs: [number, number][] = [[1, 1], [1, -1], [-1, -1], [-1, 1]];
  box(1.0, 0.2, 1.0, "#8a8196", [MX, GY + 0.1, MZ]);
  for (let i = 0; i < 5; i++) {
    const col = i % 2 ? WHITE : ORANGE;
    for (let k = 0; k < 4; k++) {
      const A = cs[k];
      const B = cs[(k + 1) % 4];
      rod(corner(levels[i], A[0], A[1]), corner(levels[i + 1], A[0], A[1]), 0.037, col);
      const p1 = corner(levels[i], A[0], A[1]);
      const p2 = corner(levels[i + 1], B[0], B[1]);
      const q1 = corner(levels[i], B[0], B[1]);
      const q2 = corner(levels[i + 1], A[0], A[1]);
      if ((i + k) % 2) rod(p1, p2, 0.018, DSTEEL);
      else rod(q1, q2, 0.018, DSTEEL);
    }
  }
  for (let i = 0; i < 6; i++)
    for (let k = 0; k < 4; k++) {
      const A = cs[k];
      const B = cs[(k + 1) % 4];
      rod(corner(levels[i], A[0], A[1]), corner(levels[i], B[0], B[1]), 0.02, DSTEEL);
    }
  box(0.95, 0.06, 0.95, DSTEEL, [MX, GY + 0.2 + 3.9, MZ]);
  const topY = GY + 0.2 + MH;
  rod([MX, topY, MZ], [MX, topY + 1.3, MZ], 0.022, STEEL);
  rod([MX - 0.35, topY + 0.7, MZ], [MX + 0.35, topY + 0.7, MZ], 0.014, STEEL);
  rod([MX - 0.25, topY + 1.0, MZ], [MX + 0.25, topY + 1.0, MZ], 0.014, STEEL);
  glow(ball(0.08, "#ff4a3a", [MX, topY + 1.38, MZ]), 2);
  // yagi
  const YY = GY + 0.2 + 4.9;
  rod([MX + hw(4.9), YY, MZ], [MX + 0.5, YY, MZ], 0.02, DSTEEL);
  rod([MX + 0.5, YY, MZ - 0.6], [MX + 0.5, YY, MZ + 0.6], 0.025, STEEL);
  [-0.5, -0.25, 0, 0.25, 0.5].forEach((z, i) =>
    rod([MX + 0.5 - 0.3 + i * 0.02, YY, MZ + z], [MX + 0.5 + 0.3 - i * 0.02, YY, MZ + z], 0.014, WHITE),
  );
  // guy wires
  const guys: [number, number, number, number][] = [[4.5, -2.5, 1, -1], [4.4, 1.3, 1, 1], [1.7, -2.9, -1, -1]];
  for (const [ax, az, sx, sz] of guys) {
    rod(corner(5.2, sx, sz), [ax, GY + 0.1, az], 0.012, PLUM);
    box(0.2, 0.14, 0.2, DSTEEL, [ax, GY + 0.04, az]);
  }
  // cabinet + cables
  const CAB: V = [MX + 0.95, GY + 0.4, MZ + 0.35];
  box(0.62, 0.8, 0.4, TEAL, CAB);
  box(0.7, 0.07, 0.48, WHITE, [CAB[0], CAB[1] + 0.44, CAB[2]]);
  plane(0.46, 0.5, [CAB[0], CAB[1] + 0.05, CAB[2] + 0.205], [0, 0, 1], GAUGE);
  b.sweep(catmull([[CAB[0] - 0.31, GY + 0.12, CAB[2] - 0.05], [MX + 0.7, GY + 0.06, MZ + 0.1], [MX + 0.3, GY + 0.22, MZ + 0.2]]), 0.022, { color: PLUM, sides: 5 });
  const cableTop = corner(3.9, -1, 1);
  const wallPt: V = [CX + W / 2 + 0.05, FL + 1.95, CZ - 0.8];
  b.sweep(catmull([cableTop, [2.1, 4.1, -0.85], [1.5, 3.35, -1.05], wallPt]), 0.016, { color: PLUM, sides: 5 });
  cyl(0.04, 0.04, 0.12, 6, CREAM, [wallPt[0] + 0.04, wallPt[1], wallPt[2]], { rotation: [0, 0, 90] });

  // ------------------------------------------------------------------ satellite dish
  const dishAt: V = [-4.0, GY + 1.35, -1.2];
  const ax = new THREE.Vector3(0.5, 0.62, 0.72).normalize();
  const uu = new THREE.Vector3().crossVectors(ax, new THREE.Vector3(0, 1, 0)).normalize();
  const vv = new THREE.Vector3().crossVectors(ax, uu).normalize();
  box(0.8, 0.12, 0.8, STEEL, [dishAt[0], GY + 0.06, dishAt[2]]);
  cyl(0.07, 0.09, 1.3, 7, STEEL, [dishAt[0], GY + 0.65, dishAt[2]]);
  b.lathe(
    [[0, 0], [0.4, 0.05], [0.8, 0.26], [0.8, 0.3], [0.4, 0.1], [0, 0.05]],
    { at: dishAt, axis: ax, segments: 14, color: WHITE },
  );
  cyl(0.12, 0.12, 0.2, 8, DSTEEL, [dishAt[0] - ax.x * 0.08, dishAt[1] - ax.y * 0.08, dishAt[2] - ax.z * 0.08], {
    dir: ax.toArray() as V,
  });
  const focus = new THREE.Vector3(...dishAt).addScaledVector(ax, 0.66);
  for (let k = 0; k < 3; k++) {
    const ph = k * 2.094 + 0.5;
    const rim = new THREE.Vector3(...dishAt)
      .addScaledVector(uu, Math.cos(ph) * 0.78)
      .addScaledVector(vv, Math.sin(ph) * 0.78)
      .addScaledVector(ax, 0.28);
    rod(rim.toArray() as V, focus.toArray() as V, 0.014, DSTEEL);
  }
  cyl(0.035, 0.06, 0.16, 6, ORANGE, focus.toArray() as V, { dir: ax.toArray() as V });

  // ------------------------------------------------------------------ weather station
  const SX = 3.4;
  const SZ = 2.0;
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) cyl(0.03, 0.035, 0.85, 5, STEEL, [SX + sx * 0.3, GY + 0.425, SZ + sz * 0.2]);
  box(0.7, 0.52, 0.5, SLATS, [SX, GY + 1.11, SZ]);
  box(0.86, 0.06, 0.66, WHITE, [SX, GY + 1.4, SZ], { rotation: [0, 0, -6] });
  box(0.8, 0.07, 0.6, SNOW, [SX, GY + 1.45, SZ], { rotation: [0, 0, -6] });
  box(0.14, 0.2, 0.02, DSTEEL, [SX, GY + 1.1, SZ + 0.26]);

  const AX = 2.4;
  const AZ = 3.05;
  cyl(0.035, 0.045, 3.2, 6, STEEL, [AX, GY + 1.6, AZ]);
  cyl(0.06, 0.06, 0.1, 6, DSTEEL, [AX, GY + 3.25, AZ]);
  for (let k = 0; k < 3; k++) {
    const an = k * 2.094 + 0.35;
    const ex = AX + Math.cos(an) * 0.3;
    const ez = AZ + Math.sin(an) * 0.3;
    rod([AX, GY + 3.25, AZ], [ex, GY + 3.25, ez], 0.015, STEEL);
    ball(0.075, ORANGE, [ex, GY + 3.25, ez]);
  }
  // snow stake
  cyl(0.03, 0.03, 1.4, 6, STRIPE_POLE, [3.1, GY + 0.7, 3.2]);

  // ------------------------------------------------------------------ fuel drums
  const drums: [number, number, ColorInput][] = [[-3.7, 1.0, TEAL], [-3.25, 1.55, ORANGE], [-4.0, 1.65, TEAL]];
  drums.forEach(([x, z, c], i) => {
    cyl(0.29, 0.29, 0.88, 10, c, [x, GY + 0.44, z]);
    for (const y of [0.2, 0.68]) cyl(0.305, 0.305, 0.045, 10, DSTEEL, [x, GY + y, z]);
    cyl(0.23, 0.23, 0.02, 10, DSTEEL, [x, GY + 0.89, z]);
    cyl(0.04, 0.04, 0.05, 6, "#d8402f", [x + 0.1, GY + 0.92, z]);
    plane(0.22, 0.28, [x, GY + 0.44, z + 0.285], [0, 0, 1], DRUM);
    if (i !== 1) cyl(0.26, 0.26, 0.06, 10, SNOW, [x, GY + 0.93, z], { scale: [1, 1, 1] });
  });

  // ------------------------------------------------------------------ crates
  const crate = (x: number, y: number, z: number, s: number, yaw: number) => {
    part(new THREE.BoxGeometry(s, s, s), "#ffffff", [x, y, z], { texture: CRATE, quat: Q(0, yaw) });
    box(s * 0.9, 0.05, s * 0.9, SNOW, [x, y + s / 2 + 0.02, z], { quat: Q(0, yaw) });
  };
  crate(2.15, GY + 0.35, 0.6, 0.7, 8);
  crate(2.2, GY + 0.7 + 0.3, 0.55, 0.6, -14);
  crate(2.95, GY + 0.275, 0.75, 0.55, -6);

  // ------------------------------------------------------------------ sled
  const SLX = -2.9;
  const SLZ = 2.6;
  const SLY = 80;
  const sl = (lx: number, ly: number, lz: number): V => [
    SLX + lx * Math.cos(SLY * D2R) + lz * Math.sin(SLY * D2R),
    GY + ly,
    SLZ - lx * Math.sin(SLY * D2R) + lz * Math.cos(SLY * D2R),
  ];
  for (const s of [-1, 1]) {
    b.sweep(catmull([sl(s * 0.3, 0.08, -1.0), sl(s * 0.3, 0.06, 0.6), sl(s * 0.3, 0.14, 1.0), sl(s * 0.3, 0.38, 1.2)]), 0.035, {
      color: DWOOD,
      sides: 5,
    });
    rod(sl(s * 0.3, 0.3, -0.8), sl(s * 0.3, 0.3, 1.0), 0.025, WOOD);
    for (const z of [-0.8, -0.1, 0.6]) rod(sl(s * 0.3, 0.08, z), sl(s * 0.3, 0.28, z), 0.025, WOOD);
  }
  for (let i = 0; i < 6; i++) box(0.72, 0.035, 0.17, WOOD, sl(0, 0.3, -0.85 + i * 0.37), { quat: Q(0, SLY) });
  box(0.52, 0.32, 1.1, "#ffffff", sl(0, 0.5, -0.1), { texture: TARP, quat: Q(0, SLY) });
  for (const z of [-0.4, 0.2]) box(0.56, 0.36, 0.05, DWOOD, sl(0, 0.5, z), { quat: Q(0, SLY) });
  rod(sl(-0.3, 0.12, 1.15), sl(-0.5, 0.0, 1.7), 0.012, PLUM);
  box(0.58, 0.05, 1.0, SNOW, sl(0, 0.69, -0.1), { quat: Q(0, SLY) });

  // ------------------------------------------------------------------ snowmobile
  const SMX = -0.9;
  const SMZ = 3.3;
  const SMY = 15;
  const sm = (lx: number, ly: number, lz: number): V => [
    SMX + lx * Math.cos(SMY * D2R) + lz * Math.sin(SMY * D2R),
    GY + ly,
    SMZ - lx * Math.sin(SMY * D2R) + lz * Math.cos(SMY * D2R),
  ];
  const TRACK = "#2c2a38";
  box(0.5, 0.22, 1.1, TRACK, sm(0, 0.16, -0.25), { quat: Q(0, SMY) });
  for (const z of [-0.8, 0.3])
    cyl(0.16, 0.16, 0.5, 8, TRACK, sm(0, 0.17, z), { quat: Q(0, SMY, 90) });
  box(0.78, 0.36, 1.05, ORANGE, sm(0, 0.5, -0.3), { quat: Q(0, SMY) });
  b.frustumBox(sm(0, 0.55, 0.25), sm(0, 0.5, 1.05), [0.72, 0.42], [0.5, 0.28], { color: ORANGE });
  box(0.42, 0.12, 0.8, "#2c3a52", sm(0, 0.76, -0.4), { quat: Q(0, SMY) });
  box(0.46, 0.34, 0.04, "#35607a", sm(0, 0.95, 0.3), { quat: Q(-30, SMY) });
  rod(sm(-0.3, 0.9, 0.12), sm(0.3, 0.9, 0.12), 0.022, DSTEEL);
  for (const s of [-1, 1]) {
    ball(0.035, PLUM, sm(s * 0.31, 0.9, 0.12));
    box(0.12, 0.05, 0.95, STEEL, sm(s * 0.34, 0.07, 0.85), { quat: Q(0, SMY) });
    box(0.12, 0.05, 0.3, STEEL, sm(s * 0.34, 0.15, 1.42), { quat: Q(-25, SMY) });
    rod(sm(s * 0.3, 0.4, 0.7), sm(s * 0.34, 0.09, 0.85), 0.02, DSTEEL);
  }
  glow(ball(0.08, "#fff0b0", sm(0, 0.52, 1.06)), 1.8);
  box(0.6, 0.05, 0.6, DSTEEL, sm(0, 0.7, -0.95), { quat: Q(0, SMY) });
  box(0.45, 0.25, 0.45, "#ffffff", sm(0, 0.85, -0.95), { texture: TARP, quat: Q(0, SMY) });
  box(0.7, 0.05, 0.55, SNOW, sm(0, 0.69, -0.2), { quat: Q(0, SMY) });

  // ------------------------------------------------------------------ flag
  const FX = 1.9;
  const FZ = 1.9;
  cyl(0.03, 0.045, 4.2, 6, STEEL, [FX, GY + 2.1, FZ]);
  ball(0.07, "#f2b440", [FX, GY + 4.25, FZ]);
  const flagTop: [number, number][] = [];
  const flagBot: [number, number][] = [];
  for (let i = 0; i <= 6; i++) {
    const x = i * 0.2;
    flagTop.push([x, 0.75 + 0.06 * Math.sin(x * 6)]);
    flagBot.push([x, 0.06 * Math.sin(x * 6)]);
  }
  const flagOutline: [number, number][] = [
    ...flagTop,
    [1.0, 0.375],
    ...flagBot.slice().reverse(),
  ];
  b.extrude(flagOutline, { at: [FX - 0.02, GY + 3.35, FZ], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.015, color: FLAGP });

  // ------------------------------------------------------------------ footprints from the porch
  const trail = catmull([[0.3, 3.2, 0], [0.9, 3.45, 0], [1.7, 3.4, 0], [2.3, 3.3, 0]].map((p) => [p[0], 0, p[1]] as V));
  for (let i = 0; i < 9; i++) {
    const t = 0.04 + i * 0.11;
    const p = trail.at(t);
    const tg = trail.tangentAt(t);
    const yaw = Math.atan2(tg.x, tg.z) / D2R;
    const side = i % 2 ? 1 : -1;
    const px = p.x + -tg.z * 0.11 * side;
    const pz = p.z + tg.x * 0.11 * side;
    cyl(0.07, 0.07, 0.02, 6, SNOW_SHADE, [px, GY + 0.006, pz], { scale: [1, 1, 2.1], rotation: [0, yaw, 0] });
  }

  return b.root;
}
```