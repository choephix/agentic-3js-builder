import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, rng, paint, mix, smoothstep, noise, grain, svg } from "../../../../src/index";
import type { Paint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal } from "../../../../kits/clockwork";

export const meta = {
  name: "Wizard's Bookshelf",
  description:
    "A tall walnut wizard's bookshelf with a starry moon pediment, runed pillars, rows of gilded tomes, scroll piles and jars, glowing orbs on brass stands, candles, potions, an hourglass and a little owl in a wizard hat.",
};

// ---------------------------------------------------------------- palette
const BOOKC = [
  "#b3202e", "#2447b8", "#157a55", "#6a2fb0", "#16919a",
  "#d9831f", "#d94f86", "#2b2a85", "#6e1a35", "#2f6b2e",
];
const GOLD = "#f0b840";
const GOLDD = "#b6812a";
const PAGE = "#f3e6c4";
const PARCH = "#e7d3a1";
const WOODD = "#3a2018";
const WOODM = "#5a2f1c";
const FLAME = "#ff9a2a";
const CORE = "#fff2a0";
const CYAN = "#6fe8ff";
const MAG = "#ff6ad5";
const AMBER = "#ffb347";
const GREEN = "#52f0a0";
const VIOLET = "#a67bff";
const OWLB = "#6a4fb5";
const HATB = "#2b3a9c";
const JARB = "#2a3f9a";
const GLASS = "#9ee6ee";
const SAND = "#f2c36b";
const CORK = "#b98a5a";
const PLATE = "#1b1530";
const GEMS = [CYAN, MAG, AMBER, GREEN, VIOLET];

// ---------------------------------------------------------------- paints
const hash = (i: number, j: number, k: number) => {
  let h = Math.imul(i, 374761393) ^ Math.imul(j, 668265263) ^ Math.imul(k, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
const SKY = paint((p) => {
  const g = 0.075;
  const i = Math.floor(p.x / g);
  const j = Math.floor(p.y / g);
  const h3 = hash(i, j, 3);
  const cx = (i + 0.2 + 0.6 * hash(i, j, 1)) * g;
  const cy = (j + 0.2 + 0.6 * hash(i, j, 2)) * g;
  const d = Math.hypot(p.x - cx, p.y - cy);
  if (h3 > 0.45 && d < 0.004 + 0.004 * h3) return "#fff1b0";
  const base = mix("#17163f", "#3a1f78", smoothstep(0.1, 2.2, p.y));
  return mix(base, "#6a2a9c", 0.55 * smoothstep(0.5, 0.9, noise(p, 0.25, 4)));
});
const WOOD_V = grain("#46261e", "#6b3d2c", { size: 0.025, axis: "y" });
const WOOD_H = grain("#46261e", "#6b3d2c", { size: 0.025, axis: "x" });
const BRASS = metal("brass");

// ---------------------------------------------------------------- outlines
type OL = [number, number][];
function archOutline(hw: number, base: number, rise: number): OL {
  const pts: OL = [[-hw, 0], [hw, 0]];
  for (let i = 0; i <= 16; i++) {
    const a = (Math.PI * i) / 16;
    pts.push([hw * Math.cos(a), base + rise * Math.sin(a)]);
  }
  return pts;
}
function starOutline(R: number, r: number): OL {
  const pts: OL = [];
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 ? r : R;
    pts.push([rad * Math.cos(a), rad * Math.sin(a)]);
  }
  return pts;
}
function crescent(R: number): OL {
  const r = R * 0.8;
  const d = R * 0.45;
  const x = (d * d + R * R - r * r) / (2 * d);
  const y = Math.sqrt(R * R - x * x);
  const a0 = Math.atan2(y, x);
  const b0 = Math.atan2(y, x - d);
  const n = 12;
  const pts: OL = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((2 * Math.PI - 2 * a0) * i) / n;
    pts.push([R * Math.cos(a), R * Math.sin(a)]);
  }
  for (let i = 1; i < n; i++) {
    const a = 2 * Math.PI - b0 - ((2 * Math.PI - 2 * b0) * i) / n;
    pts.push([d + r * Math.cos(a), r * Math.sin(a)]);
  }
  return pts;
}

// ---------------------------------------------------------------- textures
const orbTex = (a: string, bb: string, c: string) =>
  svg(
    `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="${c}"/><stop offset="0.5" stop-color="${a}"/><stop offset="1" stop-color="${bb}"/>
    </linearGradient></defs>
    <rect width="200" height="100" fill="url(#g)"/>
    <path d="M0 62 Q25 42 50 62 T100 62 T150 62 T200 62" stroke="#ffffff" stroke-opacity="0.35" stroke-width="3.5" fill="none"/>
    <path d="M0 42 Q25 58 50 42 T100 42 T150 42 T200 42" stroke="#ffffff" stroke-opacity="0.25" stroke-width="3" fill="none"/>
    <path d="M0 78 Q25 66 50 78 T100 78 T150 78 T200 78" stroke="#ffffff" stroke-opacity="0.3" stroke-width="3" fill="none"/>
    <circle cx="70" cy="50" r="2.2" fill="#fff"/><circle cx="120" cy="35" r="1.8" fill="#fff"/>
    <circle cx="150" cy="60" r="2.4" fill="#fff"/><circle cx="95" cy="70" r="1.6" fill="#fff"/>
    <circle cx="180" cy="45" r="2" fill="#fff"/><circle cx="20" cy="55" r="2" fill="#fff"/>
    <ellipse cx="40" cy="30" rx="9" ry="6" fill="#ffffff" fill-opacity="0.92"/>
    <ellipse cx="54" cy="40" rx="3" ry="2" fill="#ffffff" fill-opacity="0.8"/>
  </svg>`,
    { size: 256 },
  );
const TEX_CYAN = orbTex("#37d6ff", "#2a5bd9", "#b8fff5");
const TEX_MAG = orbTex("#ff5fd2", "#7a2cc9", "#ffc2f0");
const TEX_AMB = orbTex("#ffb13d", "#e2552a", "#fff0a0");
const TEX_GRN = orbTex("#52f0a0", "#1c8a7e", "#d6ffd0");

const EMBLEM = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" fill="none" stroke="${GOLD}" stroke-width="7"/>
  <path d="M50 18 L58 42 L83 42 L63 57 L70 82 L50 67 L30 82 L37 57 L17 42 L42 42 Z" fill="${GOLD}"/></svg>`,
  { size: 128 },
);
const SPIRAL = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="31" fill="#efe0b4"/>
  <path d="M32 32 m0 -4 a4 4 0 1 1 -4 4 a8 8 0 1 1 8 8 a12 12 0 1 1 -12 -12 a16 16 0 1 1 16 16 a20 20 0 1 1 -20 -20 a24 24 0 1 1 24 24"
   fill="none" stroke="#a98a52" stroke-width="3"/></svg>`,
  { size: 128 },
);
const GLYPHS = [
  "M8 2 V26 M8 8 L2 14 M8 14 L14 8",
  "M3 3 L13 3 L3 25 L13 25",
  "M8 2 L14 14 L8 26 L2 14 Z M8 8 V20",
  "M2 4 Q14 4 8 14 Q2 24 14 24",
  "M3 2 V26 M13 2 V26 M3 14 H13",
];
const RUNES = svg(
  `<svg viewBox="0 0 16 340" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#7ff3ff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  ${Array.from({ length: 10 }, (_, i) => `<path transform="translate(0 ${i * 34 + 3})" d="${GLYPHS[(i * 3 + 1) % 5]}"/>`).join("")}
  </svg>`,
  { size: 680 },
);

export default function build() {
  const b = createBuilder({ name: "wizardBookshelf" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const rr = rng(5);

  type V = [number, number, number];
  type Col = string | Paint;
  type PO = {
    quat?: THREE.Quaternion;
    dir?: V;
    axis?: "x" | "y" | "z";
    rotation?: V;
    scale?: number | V;
    texture?: THREE.Texture;
  };
  const P = (geo: THREE.BufferGeometry, color: Col, at: number[], o: PO = {}) =>
    b.part(geo, color, { bone: root, at: at as V, ...o });
  const box = (w: number, h: number, d: number, c: Col, at: number[], o: PO = {}) =>
    P(new THREE.BoxGeometry(w, h, d), c, at, o);
  const L = (outline: OL, color: Col, at: number[], segments = 10, axis?: V) =>
    b.lathe(outline, { at: at as V, bone: root, color, segments, ...(axis ? { axis } : {}) });
  const star = (R: number, at: number[], color: string, str = 1.5) =>
    glow(
      b.extrude(starOutline(R, R * 0.45), {
        at: at as V, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.006, color, bone: root,
      }),
      str,
    );

  // ================================================================ cabinet
  const tops = [0.14, 0.68, 1.16, 1.6, 2.0];

  box(1.58, 0.1, 0.45, WOOD_H, [0, 0.05, 0.005]);
  box(1.62, 0.022, 0.47, GOLD, [0, 0.111, 0.005]);
  for (const s of [1, -1]) {
    box(0.07, 1.9, 0.42, WOOD_V, [s * 0.715, 1.05, 0]);
    // column on the front corner
    P(new THREE.CylinderGeometry(0.028, 0.028, 1.88, 8), WOOD_V, [s * 0.76, 1.06, 0.205]);
    for (const y of [0.16, 1.05, 1.96])
      P(new THREE.CylinderGeometry(0.034, 0.034, 0.022, 8), GOLD, [s * 0.76, y, 0.205]);
    // outer flank inlay
    box(0.006, 1.62, 0.34, GOLD, [s * 0.752, 1.05, 0]);
    box(0.008, 1.54, 0.3, SKY, [s * 0.7535, 1.05, 0]);
    star(0.1, [s * 0.7595, 1.05, 0], CYAN, 1.3);
    // glowing runes on the front of the side panel
    for (const y of [0.58, 1.43])
      glow(
        P(new THREE.PlaneGeometry(0.0376, 0.8), "#ffffff", [s * 0.705, y, 0.2118], {
          dir: [0, 0, 1], axis: "z", texture: RUNES,
        }),
        1,
      );
  }
  box(1.36, 1.82, 0.03, SKY, [0, 1.05, -0.195]);

  const studs: THREE.BufferGeometry[] = [];
  for (const t of tops) {
    box(1.36, 0.04, 0.4, WOOD_H, [0, t - 0.02, 0.01]);
    box(1.36, 0.012, 0.012, GOLD, [0, t - 0.02, 0.2125]);
    for (let x = -0.64; x <= 0.641; x += 0.08)
      studs.push(new THREE.SphereGeometry(0.008, 6, 4).translate(x, t - 0.02, 0.2185));
  }
  b.part(mergeGeometries(studs)!, GOLD, { bone: root, at: [0, 0, 0] });

  // cornice
  box(1.6, 0.04, 0.46, WOOD_H, [0, 2.02, 0.01]);
  box(1.66, 0.03, 0.5, WOOD_H, [0, 2.055, 0.02]);
  box(1.68, 0.012, 0.51, GOLD, [0, 2.076, 0.02]);
  const dent: THREE.BufferGeometry[] = [];
  for (let x = -0.75; x <= 0.751; x += 0.06) dent.push(new THREE.BoxGeometry(0.026, 0.022, 0.022).translate(x, 2.03, 0.25));
  b.part(mergeGeometries(dent)!, GOLD, { bone: root, at: [0, 0, 0] });

  // pediment with moon and stars
  const PY = 2.082;
  b.extrude(archOutline(0.36, 0.05, 0.22), { at: [0, PY, 0.2], x: [1, 0, 0], thickness: 0.05, bevel: 0.006, color: WOOD_H, bone: root });
  b.extrude(archOutline(0.31, 0.04, 0.19), { at: [0, PY, 0.228], x: [1, 0, 0], thickness: 0.01, color: GOLD, bone: root });
  b.extrude(archOutline(0.28, 0.04, 0.17), { at: [0, PY, 0.2335], x: [1, 0, 0], thickness: 0.01, color: SKY, bone: root });
  glow(
    b.extrude(crescent(0.07), { at: [-0.01, PY + 0.125, 0.2455], x: [1, 0, 0], thickness: 0.012, bevel: 0.003, color: GOLD, bone: root }),
    1.2,
  );
  for (const [x, y, R] of [[-0.17, 0.09, 0.016], [0.16, 0.11, 0.014], [0.08, 0.17, 0.013]] as [number, number, number][])
    star(R, [x, PY + y, 0.2415], "#fff1b0", 1.6);

  // corner pinnacles
  for (const s of [1, -1]) {
    L(
      [[0, 0], [0.035, 0], [0.035, 0.02], [0.02, 0.04], [0.026, 0.07], [0.012, 0.1], [0.016, 0.12], [0, 0.16]],
      BRASS, [s * 0.77, PY, 0.22], 8,
    );
    glow(P(new THREE.SphereGeometry(0.022, 8, 6), CYAN, [s * 0.77, PY + 0.178, 0.22]), 1.6);
  }

  // ================================================================ helpers
  const ZF = 0.15;
  type Bk = {
    x: number; y: number; t: number; h: number; c: string; d?: number; zf?: number;
    flat?: boolean; tilt?: number; yaw?: number; deco?: number; gem?: string;
  };
  function book(s: Bk) {
    const d = s.d ?? 0.26;
    const zf = s.zf ?? ZF;
    const { t, h } = s;
    const flat = !!s.flat;
    const tilt = ((s.tilt ?? 0) * Math.PI) / 180;
    const yaw = ((s.yaw ?? 0) * Math.PI) / 180;
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, tilt, "YXZ"));
    const zc = zf - d / 2;
    const lift = flat ? 0 : (t / 2) * Math.abs(Math.sin(tilt));
    const o = new THREE.Vector3();
    const at = (u: number, v: number, z: number): V => {
      if (flat) o.set(v - h / 2, u + t / 2, z - zc);
      else o.set(u, v, z - zc);
      o.applyQuaternion(q);
      return [s.x + o.x, s.y + lift + o.y, zc + o.z];
    };
    const piece = (su: number, sv: number, sz: number, u: number, v: number, z: number, color: string) =>
      P(flat ? new THREE.BoxGeometry(sv, su, sz) : new THREE.BoxGeometry(su, sv, sz), color, at(u, v, z), { quat: q });
    piece(t, h, 0.014, 0, h / 2, zf - 0.007, s.c);
    const cd = d - 0.014;
    for (const k of [-1, 1]) piece(0.012, h, cd, k * (t / 2 - 0.006), h / 2, zf - 0.014 - cd / 2, s.c);
    piece(t - 0.024, h - 0.012, d - 0.03, 0, h / 2, zf - 0.014 - (d - 0.03) / 2, PAGE);
    const band = (v: number, hh = 0.012) => piece(t + 0.004, hh, 0.02, 0, v, zf - 0.004, GOLD);
    const deco = s.deco ?? 0;
    if (deco === 0) {
      band(h * 0.14); band(h * 0.86);
      piece(t * 0.72, h * 0.2, 0.02, 0, h * 0.5, zf - 0.003, PARCH);
    } else if (deco === 1) {
      band(h * 0.2); band(h * 0.5); band(h * 0.8);
    } else if (deco === 2) {
      band(h * 0.1, 0.016); band(h * 0.9, 0.016);
      const w = Math.min(t * 0.75, 0.05);
      piece(w, w, 0.02, 0, h * 0.5, zf - 0.003, GOLD);
      glow(
        P(new THREE.OctahedronGeometry(w * 0.34), s.gem ?? CYAN, at(0, h * 0.5, zf + 0.012), { quat: q }),
        1.5,
      );
    } else if (deco === 3) {
      piece(t * 0.64, h * 0.46, 0.018, 0, h * 0.55, zf - 0.003, PLATE);
      piece(t * 0.64, 0.01, 0.022, 0, h * 0.55 + h * 0.1, zf - 0.003, GOLD);
      piece(t * 0.64, 0.01, 0.022, 0, h * 0.55 - h * 0.1, zf - 0.003, GOLD);
    } else if (deco === 4) {
      band(h * 0.12); band(h * 0.88);
      P(new THREE.PlaneGeometry(t * 0.8, t * 0.8), "#ffffff", at(0, h * 0.5, zf + 0.0015), { quat: q, texture: EMBLEM });
    } else {
      band(h * 0.15); band(h * 0.85);
    }
  }
  function fill(x0: number, x1: number, y0: number, hMin: number, hMax: number, tMin: number, tMax: number, d = 0.26) {
    let x = x0;
    let prev = -1;
    for (;;) {
      const t = tMin + (tMax - tMin) * rr();
      if (x + t > x1) break;
      const h = hMin + (hMax - hMin) * rr();
      let ci = Math.floor(rr() * BOOKC.length);
      if (ci === prev) ci = (ci + 3) % BOOKC.length;
      prev = ci;
      let deco = Math.floor(rr() * 5);
      if (t < 0.045) deco = 5;
      if (deco === 4 && t < 0.055) deco = 0;
      book({ x: x + t / 2, y: y0, t, h, c: BOOKC[ci], deco, d, gem: GEMS[Math.floor(rr() * GEMS.length)] });
      x += t + 0.002;
    }
    return x;
  }
  function lean(xe: number, y0: number, h: number, t: number, c: string, tilt = -10, d = 0.26) {
    book({ x: xe + t / 2 + 0.004, y: y0, t, h, c, tilt, d, deco: 2, gem: MAG });
  }
  function stack(x: number, y0: number, items: [number, number, string][], zf = 0.1) {
    let y = y0;
    items.forEach(([len, t, c], i) => {
      book({ x: x + (i % 2 ? 0.012 : -0.01), y, t, h: len, c, flat: true, zf, d: 0.24, yaw: i % 2 ? 7 : -5, deco: i % 2 ? 0 : 4 });
      y += t;
    });
    return y;
  }

  function candle(
    x: number, y: number, z: number, h: number, r: number,
    holder: "dish" | "tall" | null = "dish", wax = PAGE,
  ) {
    let by = y;
    if (holder === "dish") {
      L([[0, 0], [0.055, 0], [0.06, 0.008], [0.045, 0.016], [r + 0.006, 0.022], [r + 0.006, 0.026], [0, 0.026]], BRASS, [x, y, z]);
      by = y + 0.022;
    } else if (holder === "tall") {
      L(
        [[0, 0], [0.05, 0], [0.052, 0.01], [0.032, 0.024], [0.014, 0.04], [0.014, 0.09], [0.026, 0.108], [0.014, 0.126], [0.012, 0.15], [0.03, 0.178], [0.036, 0.19], [0, 0.19]],
        BRASS, [x, y, z],
      );
      by = y + 0.19;
    }
    L([[0, 0], [r, 0], [r, h - 0.006], [r * 0.8, h], [0, h - 0.012]], wax, [x, by, z], 8);
    for (const [a, hh] of [[0.6, 0.03], [3.6, 0.045]] as [number, number][])
      P(new THREE.SphereGeometry(0.0075, 5, 4), wax, [x + r * 0.95 * Math.cos(a), by + h - hh, z + r * 0.95 * Math.sin(a)], { scale: [1, 2.6, 1] });
    P(new THREE.CylinderGeometry(0.0018, 0.0018, 0.014, 4), WOODD, [x, by + h + 0.005, z]);
    glow(L([[0, 0], [0.007, 0.006], [0.011, 0.016], [0.008, 0.03], [0.003, 0.045], [0, 0.052]], FLAME, [x, by + h, z], 6), 1.4);
    glow(L([[0, 0.002], [0.0045, 0.008], [0.006, 0.014], [0.003, 0.026], [0, 0.03]], CORE, [x, by + h, z], 6), 2);
    return by + h;
  }

  function orb(x: number, y: number, z: number, r: number, tex: THREE.Texture, strength = 1.2) {
    const br = Math.max(0.055, r * 0.8);
    const cr = r * 0.65;
    L(
      [[0, 0], [br, 0], [br, 0.008], [br * 0.6, 0.02], [0.018, 0.035], [0.018, 0.06], [cr * 0.6, 0.075], [cr, 0.095], [cr * 0.9, 0.098], [0, 0.098]],
      BRASS, [x, y, z], 10,
    );
    const cy = y + 0.098 + r * 0.75;
    glow(P(new THREE.SphereGeometry(r, 16, 12), "#ffffff", [x, cy, z], { texture: tex }), strength);
    P(new THREE.TorusGeometry(r * 1.18, 0.005, 5, 28), GOLD, [x, cy, z], { rotation: [75, 0, 15] });
    P(new THREE.TorusGeometry(r * 1.18, 0.005, 5, 28), GOLD, [x, cy, z], { rotation: [20, 0, -50] });
    return cy;
  }

  function scroll(
    c0: V, dir: V, len: number, r: number, paper: string, ribbon: string, spiral = false, seal = true,
  ) {
    const dv = new THREE.Vector3(...dir).normalize();
    const c = new THREE.Vector3(...c0);
    const along = (o: number) => c.clone().addScaledVector(dv, o).toArray();
    const dd = dv.toArray() as V;
    P(new THREE.CylinderGeometry(r, r, len, 10), paper, along(0), { dir: dd });
    P(new THREE.CylinderGeometry(r * 0.3, r * 0.3, len + 0.07, 6), WOODD, along(0), { dir: dd });
    for (const k of [-1, 1]) P(new THREE.SphereGeometry(r * 0.6, 6, 4), GOLD, along(k * (len / 2 + 0.035)));
    P(new THREE.CylinderGeometry(r * 1.1, r * 1.1, 0.018, 10), ribbon, along(len * 0.12), { dir: dd });
    if (seal) P(new THREE.SphereGeometry(r * 0.42, 6, 4), BOOKC[0], c.clone().addScaledVector(dv, len * 0.12).add(new THREE.Vector3(0, r * 1.12, 0)).toArray());
    if (spiral)
      P(new THREE.CircleGeometry(r * 0.98, 10), "#ffffff", along(len / 2 + 0.0008), { dir: dd, axis: "z", texture: SPIRAL });
  }

  function jar(x: number, y: number, z: number, h: number) {
    const k = h / 0.22;
    L(
      [[0, 0], [0.06, 0], [0.075, 0.04 * k], [0.085, 0.12 * k], [0.07, 0.19 * k], [0.075, 0.21 * k], [0.082, 0.215 * k], [0.082, 0.225 * k], [0.065, 0.225 * k], [0.065, 0.215 * k], [0, 0.215 * k]],
      JARB, [x, y, z], 10,
    );
    P(new THREE.CylinderGeometry(0.088, 0.088, 0.014, 10), GOLD, [x, y + 0.1 * k, z]);
    P(new THREE.CylinderGeometry(0.084, 0.084, 0.01, 10), GOLD, [x, y + 0.04 * k, z]);
    const top = y + 0.215 * k;
    const list: [V, string, string][] = [
      [[0.18, 1, 0.06], PARCH, BOOKC[1]], [[-0.2, 1, -0.05], PAGE, BOOKC[0]],
      [[0.04, 1, -0.2], PARCH, BOOKC[3]], [[-0.05, 1, 0.22], PAGE, BOOKC[2]],
    ];
    for (const [dir, paper, rib] of list) {
      const dv = new THREE.Vector3(...dir).normalize();
      const c = new THREE.Vector3(x, top - 0.02, z).addScaledVector(dv, 0.05);
      scroll(c.toArray() as V, dir, 0.16, 0.017, paper, rib, false, false);
    }
  }

  function hourglass(x: number, y: number, z: number) {
    P(new THREE.CylinderGeometry(0.048, 0.05, 0.012, 8), GOLD, [x, y + 0.006, z]);
    P(new THREE.CylinderGeometry(0.05, 0.048, 0.012, 8), GOLD, [x, y + 0.194, z]);
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3 + 0.5;
      P(new THREE.CylinderGeometry(0.004, 0.004, 0.19, 5), GOLDD, [x + 0.038 * Math.cos(a), y + 0.1, z + 0.038 * Math.sin(a)]);
    }
    const bulb: OL = [[0, 0], [0.028, 0], [0.036, 0.012], [0.036, 0.03], [0.02, 0.06], [0.006, 0.084], [0, 0.084]];
    L(bulb, SAND, [x, y + 0.012, z], 10);
    L(bulb, GLASS, [x, y + 0.188, z], 10, [0, -1, 0]);
  }

  function potion(x: number, y: number, z: number, s: number, color: string) {
    const prof: OL = [[0, 0], [0.03 * s, 0], [0.045 * s, 0.02 * s], [0.05 * s, 0.05 * s], [0.04 * s, 0.085 * s], [0.016 * s, 0.105 * s], [0.016 * s, 0.13 * s], [0.02 * s, 0.135 * s], [0.02 * s, 0.14 * s], [0, 0.14 * s]];
    glow(L(prof, color, [x, y, z], 10), 0.8);
    P(new THREE.CylinderGeometry(0.015 * s, 0.012 * s, 0.03 * s, 6), CORK, [x, y + 0.155 * s, z]);
    P(new THREE.CylinderGeometry(0.023 * s, 0.023 * s, 0.01 * s, 8), GOLD, [x, y + 0.122 * s, z]);
    P(new THREE.PlaneGeometry(0.05 * s, 0.04 * s), PARCH, [x, y + 0.055 * s, z + 0.0495 * s + 0.0005], { dir: [0, 0, 1], axis: "z" });
  }

  // ================================================================ compartment 1
  {
    const y0 = tops[0];
    const xe = fill(-0.67, -0.25, y0, 0.34, 0.44, 0.05, 0.09, 0.28);
    lean(xe, y0, 0.4, 0.06, BOOKC[5], -10, 0.28);
    const top = stack(0.06, y0, [[0.34, 0.07, BOOKC[8]], [0.32, 0.055, BOOKC[3]], [0.3, 0.08, BOOKC[1]]], 0.1);
    candle(0.06, top, 0.0, 0.12, 0.022, "dish", BOOKC[0]);
    // treasure chest
    const cx = 0.43;
    box(0.26, 0.12, 0.18, WOODM, [cx, y0 + 0.06, 0.05]);
    box(0.27, 0.04, 0.19, WOODM, [cx, y0 + 0.14, 0.05]);
    box(0.25, 0.03, 0.17, WOODM, [cx, y0 + 0.175, 0.05]);
    for (const k of [-1, 1]) {
      box(0.022, 0.122, 0.186, GOLD, [cx + k * 0.085, y0 + 0.06, 0.05]);
      box(0.022, 0.042, 0.196, GOLD, [cx + k * 0.085, y0 + 0.14, 0.05]);
      box(0.022, 0.032, 0.176, GOLD, [cx + k * 0.085, y0 + 0.175, 0.05]);
    }
    box(0.04, 0.05, 0.012, GOLD, [cx, y0 + 0.125, 0.1405]);
    glow(P(new THREE.OctahedronGeometry(0.012), GREEN, [cx, y0 + 0.125, 0.15]), 1.5);
    fill(0.585, 0.67, y0, 0.34, 0.42, 0.05, 0.06, 0.28);
  }

  // ================================================================ compartment 2
  {
    const y0 = tops[1];
    orb(-0.54, y0, 0.02, 0.1, TEX_CYAN, 1.3);
    star(0.02, [-0.5, y0 + 0.37, 0.1], "#fff1b0");
    const xe = fill(-0.4, 0.1, y0, 0.28, 0.38, 0.04, 0.07, 0.25);
    lean(xe, y0, 0.36, 0.05, BOOKC[4], -11, 0.25);
    const top = stack(0.33, y0, [[0.26, 0.05, BOOKC[2]], [0.24, 0.06, BOOKC[6]]], 0.1);
    candle(0.33, top, 0.0, 0.1, 0.02, "dish", PAGE);
    const r = 0.028;
    const base = y0 + r;
    const pyr: [number, number, string, string][] = [
      [0.51, base, PAGE, BOOKC[0]], [0.568, base, PARCH, BOOKC[1]], [0.626, base, PAGE, BOOKC[5]],
      [0.539, base + 0.05, PARCH, BOOKC[3]], [0.597, base + 0.05, PAGE, BOOKC[2]],
      [0.568, base + 0.1, PARCH, BOOKC[6]],
    ];
    for (const [x, y, paper, rib] of pyr) scroll([x, y, 0.02], [0, 0, 1], 0.25, r, paper, rib, true, false);
  }

  // ================================================================ compartment 3
  {
    const y0 = tops[2];
    const xe = fill(-0.67, -0.3, y0, 0.28, 0.36, 0.04, 0.065, 0.26);
    lean(xe, y0, 0.33, 0.05, BOOKC[7], -10, 0.26);
    L([[0, 0], [0.08, 0], [0.085, 0.008], [0.07, 0.014], [0, 0.014]], BRASS, [-0.11, y0, 0.05], 12);
    candle(-0.14, y0 + 0.014, 0.05, 0.2, 0.022, null, PAGE);
    candle(-0.08, y0 + 0.014, 0.07, 0.14, 0.02, null, BOOKC[0]);
    candle(-0.11, y0 + 0.014, 0.015, 0.09, 0.018, null, PAGE);
    const top = stack(0.14, y0, [[0.26, 0.045, BOOKC[9]], [0.24, 0.06, BOOKC[5]], [0.25, 0.05, BOOKC[3]]], 0.1);
    scroll([0.14, top + 0.028, 0.0], [1, 0, 0], 0.22, 0.026, PARCH, BOOKC[1]);
    orb(0.45, y0, 0.02, 0.09, TEX_MAG, 1.3);
    star(0.02, [0.52, y0 + 0.34, 0.1], "#fff1b0");
    fill(0.57, 0.67, y0, 0.28, 0.34, 0.04, 0.05, 0.26);
  }

  // ================================================================ compartment 4
  {
    const y0 = tops[3];
    const xe = fill(-0.67, -0.32, y0, 0.24, 0.32, 0.035, 0.06, 0.24);
    lean(xe, y0, 0.3, 0.045, BOOKC[2], -12, 0.24);
    hourglass(-0.12, y0, 0.05);
    jar(0.1, y0, 0.03, 0.16);
    potion(0.3, y0, 0.06, 1, MAG);
    potion(0.385, y0, 0.0, 0.8, CYAN);
    orb(0.55, y0, 0.02, 0.07, TEX_AMB, 1.3);
    star(0.018, [0.5, y0 + 0.26, 0.1], "#fff1b0");
  }

  // ================================================================ roof
  {
    const y0 = tops[4];
    const top = stack(-0.64, y0, [[0.26, 0.05, BOOKC[8]], [0.24, 0.045, BOOKC[4]]], 0.1);
    orb(-0.64, top, 0.0, 0.07, TEX_GRN, 1.3);
    star(0.02, [-0.6, top + 0.3, 0.08], "#fff1b0");
    candle(-0.44, y0, 0.12, 0.14, 0.02, "tall", PAGE);
    candle(0.44, y0, 0.12, 0.16, 0.02, "tall", BOOKC[0]);

    // little wizard owl
    const ox = 0.65;
    const oz = 0.08;
    const hd = y0 + 0.19;
    P(new THREE.CylinderGeometry(0.075, 0.085, 0.014, 10), GOLD, [ox, y0 + 0.007, oz]);
    P(new THREE.SphereGeometry(1, 10, 8), OWLB, [ox, y0 + 0.1, oz], { scale: [0.075, 0.095, 0.07] });
    P(new THREE.SphereGeometry(1, 8, 6), PAGE, [ox, y0 + 0.088, oz + 0.034], { scale: [0.054, 0.07, 0.04] });
    for (let i = 0; i < 3; i++)
      P(new THREE.ConeGeometry(0.01, 0.014, 4), OWLB, [ox + (i - 1) * 0.02, y0 + 0.07 - (i % 2) * 0.015, oz + 0.072], { dir: [0, -1, 0.15] });
    P(new THREE.SphereGeometry(1, 10, 8), OWLB, [ox, hd, oz], { scale: [0.075, 0.062, 0.065] });
    for (const s of [1, -1]) {
      P(new THREE.SphereGeometry(1, 8, 6), PAGE, [ox + s * 0.035, hd + 0.004, oz + 0.05], { scale: [0.03, 0.03, 0.015] });
      glow(P(new THREE.SphereGeometry(0.019, 8, 6), AMBER, [ox + s * 0.035, hd + 0.004, oz + 0.062], { scale: [1, 1, 0.5] }), 1.5);
      P(new THREE.SphereGeometry(0.009, 6, 4), WOODD, [ox + s * 0.035, hd + 0.004, oz + 0.068], { scale: [0.8, 1.3, 0.5] });
      P(new THREE.SphereGeometry(1, 8, 6), OWLB, [ox + s * 0.078, y0 + 0.1, oz - 0.005], { scale: [0.018, 0.075, 0.045], rotation: [0, 0, -s * 8] });
      P(new THREE.BoxGeometry(0.025, 0.008, 0.03), GOLD, [ox + s * 0.025, y0 + 0.018, oz + 0.04]);
    }
    P(new THREE.ConeGeometry(0.012, 0.03, 6), GOLD, [ox, hd - 0.012, oz + 0.07], { dir: [0, -0.35, 1] });
    // hat
    const hy = hd + 0.052;
    L([[0, 0], [0.085, 0], [0.085, 0.006], [0.046, 0.012], [0.04, 0.03], [0.026, 0.07], [0.012, 0.095], [0, 0.11]], HATB, [ox, hy, oz], 10);
    P(new THREE.CylinderGeometry(0.046, 0.046, 0.012, 10), GOLD, [ox, hy + 0.02, oz]);
    star(0.013, [ox, hy + 0.055, oz + 0.032], "#fff1b0", 1.4);
  }

  // ================================================================ floor-level detail: bun feet brackets
  for (const s of [1, -1])
    for (const z of [0.2, -0.19])
      L([[0, 0], [0.04, 0], [0.04, 0.012], [0.026, 0.024], [0.03, 0.04], [0, 0.04]], GOLDD, [s * 0.77, 0.1, z], 8);

  return b.root;
}
