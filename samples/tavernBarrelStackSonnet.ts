import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { aim, DEG, rng } from "../src/math";
import { catmull, spiral } from "../src/path";
import { cells, mix, noise, paint, rgb, smoothstep } from "../src/paint";
import type { Paint } from "../src/paint";
import type { Rgb } from "../src/paint";
import type { Fill } from "../src/context";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Tavern Corner: Barrel Stack",
  description:
    "A tavern corner in a hand-painted heroic-fantasy style: a pyramid of iron-hooped casks, a keg rack with brass taps, a candlelit barrel-top table with mugs, crates of bottles, a hanging sign, lantern and banner, and a mouse sneaking to a spilled ale.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

type V = [number, number, number];
type Tex = ReturnType<typeof svg>;

const FT = 0.12; // floor top

// ---------------------------------------------------------------------------------------------------------------
// Hand-painted shading: a baked key light from above-front-left, violet shadows, warm highlights, floor occlusion.
// ---------------------------------------------------------------------------------------------------------------
const KEY = new THREE.Vector3(0.38, 0.82, 0.44).normalize();
const hash = (x: number) => {
  const s = Math.sin(x * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const _v = new THREE.Vector3();
const _w = new THREE.Vector3();

function lighten(c: Rgb, p: THREE.Vector3, n: THREE.Vector3, ao = 1): Rgb {
  const t = smoothstep(-0.55, 0.85, n.dot(KEY));
  let out = mix(c, "#2b1c44", (1 - t) * 0.5);
  out = mix(out, "#ffe9a8", Math.max(0, t - 0.6) * 0.55);
  const a = smoothstep(FT - 0.02, FT + 0.6, p.y);
  return mix(out, "#150d22", (1 - a) * 0.4 * ao);
}

/** Painted wood: streaky grain stretched by (sx, sy, sz), two tones, hand-painted lighting. */
function wood(base: string, darkHex: string, o: { sx?: number; sy?: number; sz?: number; size?: number; seed?: number; ao?: number } = {}) {
  const { sx = 1, sy = 1, sz = 1, size = 0.09, seed = 1, ao = 1 } = o;
  return paint((p, n) => {
    _v.set(p.x * sx, p.y * sy, p.z * sz);
    const g = noise(_v, size, seed);
    _w.set(p.x * sx * 3.3, p.y * sy * 3.3, p.z * sz * 3.3);
    const g2 = noise(_w, size, seed + 7);
    let c = mix(base, darkHex, smoothstep(0.45, 0.8, g) * 0.6 + smoothstep(0.62, 0.85, g2) * 0.3);
    c = mix(c, "#f0c47a", smoothstep(0.72, 0.95, g2) * 0.18);
    return lighten(c, p, n, ao);
  });
}

/** Flat-ish painted colour with soft brush mottling and hand-painted lighting. */
function hand(base: string, darkHex: string, o: { size?: number; seed?: number; amt?: number } = {}) {
  const { size = 0.07, seed = 3, amt = 0.5 } = o;
  return paint((p, n) => {
    const g = noise(p, size, seed);
    const c = mix(base, darkHex, smoothstep(0.45, 0.85, g) * amt);
    return lighten(c, p, n);
  });
}

const SEAM = rgb("#2a170d");

const W_CRATE: Paint3[] = [
  wood("#b97d3e", "#6a3c18", { sx: 0.25, sy: 4, sz: 4, seed: 11 }),
  wood("#a66a30", "#5a3014", { sx: 0.25, sy: 4, sz: 4, seed: 12 }),
  wood("#c58b4a", "#7a4a20", { sx: 0.25, sy: 4, sz: 4, seed: 13 }),
];
type Paint3 = Paint;
const W_DARK = wood("#5b3418", "#2c170a", { sx: 1, sy: 1, sz: 1, seed: 21 });
const TIMBER_V = wood("#6a4122", "#33200f", { sx: 4, sy: 0.25, sz: 4, seed: 31 });
const TIMBER_X = wood("#6a4122", "#33200f", { sx: 0.25, sy: 4, sz: 4, seed: 32 });
const TIMBER_Z = wood("#6a4122", "#33200f", { sx: 4, sy: 4, sz: 0.25, seed: 33 });
const TIMBER_D = wood("#6a4122", "#33200f", { sx: 1, sy: 1, sz: 1, seed: 34 });
const WOOD_MUG = wood("#b27637", "#6a3a18", { sx: 3, sy: 0.3, sz: 3, size: 0.05, seed: 41, ao: 0.3 });
const WOOD_LIGHT = wood("#c9954f", "#8a5a28", { sx: 1, sy: 1, sz: 1, seed: 42, size: 0.07 });
const IRON = paint((p, n) => {
  const g = noise(p, 0.05, 51);
  let c = mix("#434b5e", "#262b38", smoothstep(0.4, 0.8, g));
  c = mix(c, "#7a5a3a", smoothstep(0.7, 0.9, noise(p, 0.03, 52)) * 0.5); // rust flecks
  const t = smoothstep(0.3, 0.95, n.dot(KEY));
  c = mix(c, "#9db6d8", t * 0.35);
  return lighten(c, p, n);
});
const STEEL = "#aebfd8";
const BRASS = "#e2a929";
const BRASS_P = hand("#e8b030", "#a0620f", { size: 0.03, seed: 54, amt: 0.6 });
const PEWTER = hand("#9aa6b6", "#5d6a80", { size: 0.04, seed: 55, amt: 0.6 });
const CLAY = hand("#c0623c", "#7a2e22", { size: 0.04, seed: 56, amt: 0.6 });
const BURLAP = paint((p, n) => {
  const w = Math.sin(p.x * 260) * Math.sin(p.y * 240) * Math.sin(p.z * 260);
  let c = mix("#d4b374", "#9c7a44", smoothstep(0.4, 0.85, noise(p, 0.08, 61)));
  c = mix(c, "#7a5c30", w > 0.6 ? 0.2 : 0);
  return lighten(c, p, n);
});
const ROPE = paint((p, n, s) => {
  const tw = (((s[1] - 900 * s[0]) % 90) + 90) % 90;
  let c = mix("#c9a468", "#8a6a3a", tw < 38 ? 0.0 : 0.75);
  c = mix(c, "#6a4a28", smoothstep(0.5, 0.85, noise(p, 0.03, 62)) * 0.4);
  return lighten(c, p, n);
});
const HAY = hand("#e3bf5a", "#a8802a", { size: 0.03, seed: 63 });
const GRAIN = hand("#e1b657", "#a27a2a", { size: 0.02, seed: 64 });
const CHEESE = hand("#f6cc48", "#c8901e", { size: 0.03, seed: 65 });
const WAX = hand("#fbefd2", "#d8c294", { size: 0.03, seed: 66 });
const FOAM = "#fff6dc";
const AMBER = "#e8921c";
const FLESH = hand("#7d6b66", "#4d4046", { size: 0.02, seed: 69 });
const PINK = "#e9a3a3";
const GREEN_H1 = "#8bb23f";
const GREEN_H2 = "#5f9028";

const PLASTER = paint((p, n) => {
  let c = mix("#d9c28e", "#ecdca8", noise(p, 0.4, 3));
  c = mix(c, "#a98458", (1 - smoothstep(0.62, 1.25, p.y)) * 0.5);
  c = mix(c, "#7a6350", smoothstep(1.8, 2.1, p.y) * 0.35);
  c = mix(c, "#b79a6c", smoothstep(0.6, 0.78, noise(p, 0.12, 4)) * 0.35);
  const cl = cells(p, 0.5, 5);
  if (cl.d2 - cl.d1 < 0.012 && noise(p, 0.35, 9) > 0.62) c = rgb("#8a6e4c");
  // fallen plaster revealing the brick beneath
  const dm = noise(p, 0.5, 14);
  if (dm > 0.6 && p.y < 1.55) {
    const course = Math.floor(p.y / 0.075);
    const bx = (p.x + p.z + (course % 2) * 0.07) / 0.14;
    const bf = bx - Math.floor(bx);
    const yf = p.y / 0.075 - course;
    let bc = mix("#a9572f", "#7a3a22", hash(Math.floor(bx) * 1.7 + course * 9.1));
    if (bf < 0.07 || yf < 0.12) bc = mix("#5a4a3a", "#7a6a58", yf);
    c = dm > 0.66 ? bc : mix(c, "#4a3a2a", 0.7);
  }
  return lighten(c, p, n);
});
const COBBLE = paint((p, n) => {
  const cl = cells(p, 0.2, 2);
  const e = cl.d2 - cl.d1;
  const hv = hash(cl.id * 3.1);
  let c = mix(mix("#8f8aa0", "#6b6783", hv), "#a39c8e", hash(cl.id * 7.7) * 0.5);
  c = mix(c, "#d9d4e6", (1 - smoothstep(0, 0.6, cl.d1)) * 0.25);
  if (e < 0.09) c = mix("#3a3448", "#59506a", e / 0.09);
  const moss = smoothstep(0.58, 0.78, noise(p, 0.14, 8)) * (1 - smoothstep(0.1, 0.4, p.y));
  c = mix(c, "#5f8a34", moss * 0.55);
  return lighten(c, p, n, 0.8);
});
const STEELP = hand("#c4d0e6", "#6f7f9c", { size: 0.03, seed: 57, amt: 0.5 });
const CLAD = paint((p, n) => {
  const kk = p.y / 0.15;
  const k = Math.floor(kk);
  const f = kk - k;
  _v.set(p.x * 0.4 + p.z * 0.4, p.y * 6, 0);
  let c = mix(mix("#8a5530", "#aa7040", hash(k * 3.3)), "#4a2c14", smoothstep(0.5, 0.85, noise(_v, 0.1, 81)) * 0.55);
  c = mix(c, "#5f8a34", smoothstep(0.62, 0.8, noise(p, 0.2, 82)) * (1 - smoothstep(0.7, 1.1, p.y)) * 0.5);
  if (f < 0.06) c = rgb("#2a170c");
  return lighten(c, p, n);
});
const FLOOR = paint((p, n) => {
  const rowF = (p.z + 1.5) / 0.23;
  const row = Math.floor(rowF);
  const rz = rowF - row;
  const off = hash(row) * 1.3;
  const colF = (p.x + 1.5 + off) / 1.25;
  const col = Math.floor(colF);
  const lx = (colF - col) * 1.25;
  const tone = hash(row * 7.3 + col * 1.7);
  _v.set(p.x * 0.3, 0, p.z * 4.5);
  const g = noise(_v, 0.1, 71 + row);
  let c = mix(mix("#8c5a2e", "#b3753c", tone), "#4f2c14", smoothstep(0.5, 0.85, g) * 0.55);
  c = mix(c, "#e0a45c", smoothstep(0.5, 0.18, Math.abs(rz - 0.5)) * 0.2);
  const d = Math.hypot(p.x - 0.33, (p.z - 0.6) * 1.15);
  c = mix(c, "#3a1f0e", (1 - smoothstep(0.1, 0.34, d)) * 0.7);
  c = mix(c, "#5b3718", smoothstep(0.55, 0.8, noise(p, 0.45, 72)) * 0.3);
  if (rz < 0.05 || rz > 0.95 || lx < 0.012 || lx > 1.238) c = rgb("#24140a");
  return lighten(c, p, n, 0);
});

// ---------------------------------------------------------------------------------------------------------------
// Barrel paint: staves with painted highlights and seams, planked heads, end-grain rims.
// ---------------------------------------------------------------------------------------------------------------
function barrelPaint(o: {
  base: string;
  dark: string;
  ax: THREE.Vector3;
  c0: THREE.Vector3;
  H: number;
  rE: number;
  seed: number;
  open?: boolean;
}) {
  const ax = o.ax.clone();
  const e1 = Math.abs(ax.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  e1.addScaledVector(ax, -e1.dot(ax)).normalize();
  const e2 = new THREE.Vector3().crossVectors(ax, e1);
  const step = 360 / 14;
  const d = new THREE.Vector3();
  return paint((p, n, s) => {
    d.copy(p).sub(o.c0);
    const a = d.dot(ax);
    const ru = d.dot(e1);
    const rv = d.dot(e2);
    const rad = Math.hypot(ru, rv);
    const axial = n.dot(ax);
    let c: Rgb;
    if (Math.abs(axial) > 0.55) {
      if (rad > o.rE - 0.042) {
        c = mix(o.base, "#ecc47a", 0.4);
        c = mix(c, "#3a2412", smoothstep(0.35, 0.8, noise(p, 0.02, o.seed)) * 0.5);
      } else if (o.open && a > o.H - 0.2 && axial > 0) {
        c = mix("#2a170a", "#150a04", noise(p, 0.05, o.seed));
      } else {
        const w = 0.1;
        const k = Math.floor(ru / w + 0.5);
        const lx = ru - k * w;
        c = mix(mix(o.base, o.dark, hash(k * 3.7 + o.seed) * 0.55), "#efc27c", 0.18);
        _v.set(ru * 2, rv * 14, o.seed);
        c = mix(c, o.dark, smoothstep(0.5, 0.82, noise(_v, 0.05, o.seed)) * 0.6);
        c = mix(c, "#2a170a", smoothstep(o.rE - 0.13, o.rE - 0.045, rad) * 0.5);
        if (Math.abs(lx) > w / 2 - 0.004) c = SEAM;
        if (Math.abs(rad - 0.06) < 0.006) c = mix(c, "#2a170a", 0.6); // growth ring
      }
    } else {
      const rn = (ru * n.dot(e1) + rv * n.dot(e2)) / Math.max(rad, 1e-4);
      if (o.open && a > o.H - 0.14 && rn < -0.3) {
        c = mix("#3a2212", "#1a0e06", smoothstep(o.H - 0.14, o.H - 0.02, a));
      } else {
        const u = s[1] / step;
        const k = Math.floor(u);
        const lf = u - k;
        c = mix(o.base, o.dark, hash(k * 5.1 + o.seed * 1.7) * 0.55);
        c = mix(c, "#f4c883", (1 - smoothstep(0, 0.75, Math.abs(lf - 0.5) * 2)) * 0.24);
        _v.set(s[1] * 0.012, a * 0.35, o.seed);
        c = mix(c, o.dark, smoothstep(0.5, 0.82, noise(_v, 0.07, o.seed)) * 0.55);
        c = mix(c, "#1d130c", (1 - smoothstep(0, 0.22, Math.min(a, o.H - a))) * 0.4);
        if (lf < 0.05 || lf > 0.95) c = mix(c, SEAM, 0.85);
      }
    }
    return lighten(c, p, n);
  });
}

// ---------------------------------------------------------------------------------------------------------------
// SVG drawings
// ---------------------------------------------------------------------------------------------------------------
const BR = "#3a1c0c";
const BRAND_MUG = `<svg viewBox="0 0 128 128"><circle cx="64" cy="64" r="58" fill="none" stroke="${BR}" stroke-width="7"/><circle cx="64" cy="64" r="48" fill="none" stroke="${BR}" stroke-width="3"/><path d="M36 52h46l-4 46q-1 7-8 7H48q-7 0-8-7z" fill="${BR}"/><path d="M82 60h6q12 0 12 11t-12 11h-8" fill="none" stroke="${BR}" stroke-width="7"/><path d="M34 52q2-14 14-10q7-13 18-5q12-5 17 8z" fill="${BR}"/><path d="M46 66l4 24M58 66l2 28" stroke="#d9a35a" stroke-width="3" fill="none"/></svg>`;
const BRAND_WHEAT = `<svg viewBox="0 0 128 128"><circle cx="64" cy="64" r="58" fill="none" stroke="${BR}" stroke-width="7"/><path d="M64 108V30" stroke="${BR}" stroke-width="5"/><path d="M64 34q-12 6-12 18q10-2 12-12zM64 34q12 6 12 18q-10-2-12-12zM64 54q-14 6-14 20q12-3 14-14zM64 54q14 6 14 20q-12-3-14-14zM64 74q-14 6-14 20q12-3 14-14zM64 74q14 6 14 20q-12-3-14-14z" fill="${BR}"/><path d="M64 14l-5 14h10z" fill="${BR}"/></svg>`;
const BRAND_X = `<svg viewBox="0 0 128 128"><circle cx="64" cy="64" r="58" fill="none" stroke="${BR}" stroke-width="7"/><path d="M30 40l24 48M54 40L30 88M74 40l24 48M98 40L74 88" stroke="${BR}" stroke-width="9" fill="none"/><path d="M26 102h76" stroke="${BR}" stroke-width="5"/><path d="M36 22h56" stroke="${BR}" stroke-width="5"/></svg>`;
const BRAND_HOP = `<svg viewBox="0 0 128 128"><circle cx="64" cy="64" r="58" fill="none" stroke="${BR}" stroke-width="7"/><path d="M64 28q-26 10-22 38q6 26 22 36q16-10 22-36q4-28-22-38z" fill="${BR}"/><path d="M64 34v62M50 48q14 8 28 0M46 64q18 10 36 0M50 80q14 8 28 0" stroke="#d9a35a" stroke-width="3" fill="none"/><path d="M64 28q8-14 22-12" stroke="${BR}" stroke-width="5" fill="none"/></svg>`;

const SIGN_ART = `<svg viewBox="0 0 160 120"><rect x="2" y="2" width="156" height="116" rx="12" fill="#8e1f27"/><rect x="2" y="2" width="156" height="116" rx="12" fill="none" stroke="#f2b632" stroke-width="5"/><rect x="11" y="11" width="138" height="98" rx="8" fill="none" stroke="#f7d27a" stroke-width="2.5"/><path d="M52 28h46l-4 44q-1 8-9 8H65q-8 0-9-8z" fill="#f2b632" stroke="#7a4a10" stroke-width="3"/><path d="M98 36h8q14 0 14 13t-14 13h-10" fill="none" stroke="#f2b632" stroke-width="7"/><path d="M48 28q2-16 16-12q8-13 20-5q14-5 18 10z" fill="#fff4d6" stroke="#b8a070" stroke-width="2.5"/><path d="M62 38l3 28M76 38l1 30" stroke="#c98a14" stroke-width="3"/><text x="80" y="104" font-family="Georgia, serif" font-weight="bold" font-size="17" text-anchor="middle" fill="#fbe7b0">THE GILDED KEG</text></svg>`;
const BANNER_ART = `<svg viewBox="0 0 80 150"><path d="M2 2h76v112L40 146 2 114z" fill="#a8242a"/><path d="M2 2h76v112L40 146 2 114z" fill="none" stroke="#f2b632" stroke-width="3.5"/><path d="M9 9h62v102L40 137 9 111z" fill="none" stroke="#f7d27a" stroke-width="1.8"/><circle cx="40" cy="58" r="25" fill="#7a1420" stroke="#f2b632" stroke-width="3"/><path d="M27 44h24l-2 26q0 5-5 5H34q-5 0-5-5z" fill="#f2b632"/><path d="M51 49h4q8 0 8 8t-8 8h-5" fill="none" stroke="#f2b632" stroke-width="4"/><path d="M26 44q1-9 9-6q5-8 11-3q8-3 10 6z" fill="#fff4d6"/><path d="M16 96q24 12 48 0" stroke="#f2b632" stroke-width="3" fill="none"/><path d="M22 104q18 8 36 0" stroke="#f2b632" stroke-width="2" fill="none"/></svg>`;
const SIGN_WIDE = `<svg viewBox="0 0 300 82"><rect x="2" y="2" width="296" height="78" rx="9" fill="#2a3a52"/><rect x="2" y="2" width="296" height="78" rx="9" fill="none" stroke="#f2b632" stroke-width="4"/><rect x="9" y="9" width="282" height="64" rx="6" fill="none" stroke="#f7d27a" stroke-width="1.8"/><text x="150" y="40" font-family="Georgia, serif" font-weight="bold" font-size="25" text-anchor="middle" fill="#f7d27a">THE GILDED KEG</text><path d="M30 50h240" stroke="#f2b632" stroke-width="2"/><text x="150" y="66" font-family="Georgia, serif" font-size="13" text-anchor="middle" fill="#e9dcc0" letter-spacing="2">ALE  ·  MEAD  ·  A WARM BED</text><circle cx="24" cy="41" r="9" fill="#f2b632"/><circle cx="276" cy="41" r="9" fill="#f2b632"/><path d="M20 36h8l-1 10h-6z" fill="#2a3a52"/><path d="M272 36h8l-1 10h-6z" fill="#2a3a52"/></svg>`;
const CHALK_ART = `<svg viewBox="0 0 200 104"><rect width="200" height="104" fill="#2b3840"/><text x="100" y="20" font-family="Georgia, serif" font-weight="bold" font-size="15" text-anchor="middle" fill="#f1efe4">TODAY'S BREW</text><path d="M30 26h140" stroke="#f1efe4" stroke-width="2"/><text x="16" y="48" font-family="Georgia, serif" font-size="13" fill="#f1efe4">AMBER ALE</text><text x="184" y="48" font-family="Georgia, serif" font-size="13" text-anchor="end" fill="#f1efe4">2c</text><text x="16" y="68" font-family="Georgia, serif" font-size="13" fill="#f1efe4">DWARF STOUT</text><text x="184" y="68" font-family="Georgia, serif" font-size="13" text-anchor="end" fill="#f1efe4">4c</text><text x="16" y="88" font-family="Georgia, serif" font-size="13" fill="#f1efe4">HONEY MEAD</text><text x="184" y="88" font-family="Georgia, serif" font-size="13" text-anchor="end" fill="#f1efe4">3c</text><path d="M110 46h58M120 66h48M114 86h54" stroke="#f1efe4" stroke-width="1.2" stroke-dasharray="2 4" opacity="0.0"/></svg>`;
const POSTER_ART = `<svg viewBox="0 0 60 80"><path d="M3 2l12 2 14-2 14 3 14-2 2 74-14 2-14-3-14 3-14-2z" fill="#e8d3a0" stroke="#8a6a38" stroke-width="2"/><text x="30" y="17" font-family="Georgia, serif" font-weight="bold" font-size="10" text-anchor="middle" fill="#8e1f27">WANTED</text><circle cx="30" cy="36" r="11" fill="none" stroke="#3a2a1a" stroke-width="2"/><path d="M24 33h4M32 33h4M25 41q5 4 10 0" stroke="#3a2a1a" stroke-width="2" fill="none"/><path d="M19 26l5 4M41 26l-5 4" stroke="#3a2a1a" stroke-width="2"/><path d="M12 56h36M14 63h32M18 70h24" stroke="#6a4a28" stroke-width="2.2"/><circle cx="46" cy="70" r="5" fill="#8e1f27"/></svg>`;
const CRATE_ART = `<svg viewBox="0 0 120 70"><text x="60" y="38" font-family="Impact, Arial Black, sans-serif" font-weight="bold" font-size="36" text-anchor="middle" fill="#3b2412">HOPS</text><path d="M16 50h88" stroke="#3b2412" stroke-width="4"/><path d="M60 54v12M54 60l6-8 6 8" stroke="#3b2412" stroke-width="4" fill="none"/><path d="M18 8h84" stroke="#3b2412" stroke-width="3"/></svg>`;
const CRATE_ART2 = `<svg viewBox="0 0 120 70"><text x="60" y="34" font-family="Georgia, serif" font-weight="bold" font-size="22" text-anchor="middle" fill="#7a1420">FRAGILE</text><path d="M20 44h80" stroke="#7a1420" stroke-width="3.5"/><path d="M50 52h20l-2 12H52z" fill="none" stroke="#7a1420" stroke-width="3.5"/><path d="M60 10v6" stroke="#7a1420" stroke-width="3.5"/></svg>`;
const SACK_ART = `<svg viewBox="0 0 80 56"><text x="40" y="36" font-family="Georgia, serif" font-weight="bold" font-size="26" text-anchor="middle" fill="#5b2a14">OATS</text><path d="M10 12h60M10 46h60" stroke="#5b2a14" stroke-width="3.5"/></svg>`;
const WEB_ART = `<svg viewBox="0 0 100 100"><path d="M2 2L98 2M2 2L2 98M2 2L92 62M2 2L62 92M2 2L98 28M2 2L28 98" stroke="#dfe7ee" stroke-width="1.8" fill="none"/><path d="M26 2Q26 26 2 26M50 2Q50 50 2 50M74 2Q74 74 2 74M30 6Q36 18 24 30" stroke="#dfe7ee" stroke-width="1.6" fill="none"/></svg>`;
const TAG_ART = `<svg viewBox="0 0 40 60"><path d="M6 14l8-12h20v56H6z" fill="#efe2bd" stroke="#8a6a38" stroke-width="2"/><circle cx="14" cy="12" r="2.5" fill="#8a6a38"/><path d="M12 26h20M12 34h20M12 42h14" stroke="#5b3a1c" stroke-width="2.4"/></svg>`;

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "tavernBarrelStack", paintSize: 2048 });
  const R = rng(17);
  const root = b.joint("root", { at: [0, 0, 0], dir: [0, 1, 0] });
  const bones: Record<string, Joint> = { root };

  const tBrandMug = svg(BRAND_MUG, { size: 256 });
  const tBrandWheat = svg(BRAND_WHEAT, { size: 256 });
  const tBrandX = svg(BRAND_X, { size: 256 });
  const tBrandHop = svg(BRAND_HOP, { size: 256 });
  const tSign = svg(SIGN_ART, { size: 512 });
  const tSignWide = svg(SIGN_WIDE, { size: 1024 });
  const tBanner = svg(BANNER_ART, { size: 512 });
  const tChalk = svg(CHALK_ART, { size: 512 });
  const tPoster = svg(POSTER_ART, { size: 256 });
  const tCrate = svg(CRATE_ART, { size: 256 });
  const tCrate2 = svg(CRATE_ART2, { size: 256 });
  const tSack = svg(SACK_ART, { size: 256 });
  const tWeb = svg(WEB_ART, { size: 256 });
  const tTag = svg(TAG_ART, { size: 128 });

  // ---- merge buckets: static pieces of one object, one bone, one colour become one part ----
  type Bucket = { key: string; color: Fill; bone: string; geos: THREE.BufferGeometry[] };
  const buckets = new Map<string, Bucket>();
  const put = (obj: string, kind: string, color: Fill, geo: THREE.BufferGeometry, m: THREE.Matrix4, bone = "root") => {
    const key = `${obj}_${kind}`;
    let bk = buckets.get(key);
    if (!bk) {
      bk = { key, color, bone, geos: [] };
      buckets.set(key, bk);
    }
    geo.applyMatrix4(m);
    bk.geos.push(geo);
  };
  const flush = () => {
    for (const bk of buckets.values()) {
      const merged = mergeGeometries(bk.geos);
      if (!merged) throw new Error(`merge failed: ${bk.key}`);
      b.part(merged, bk.color, { bone: bones[bk.bone], at: [0, 0, 0], name: bk.key });
    }
  };

  const v3 = (a: V) => new THREE.Vector3(a[0], a[1], a[2]);
  const mat = (pos: V, rot: V = [0, 0, 0], sc: V | number = 1) => {
    const s = typeof sc === "number" ? new THREE.Vector3(sc, sc, sc) : v3(sc);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG, "YXZ"));
    return new THREE.Matrix4().compose(v3(pos), q, s);
  };
  const matQ = (pos: THREE.Vector3, q: THREE.Quaternion, sc: V = [1, 1, 1]) => new THREE.Matrix4().compose(pos, q, v3(sc));
  const mul = (...ms: THREE.Matrix4[]) => ms.reduce((a, m) => a.clone().multiply(m));

  const box = (obj: string, kind: string, color: Fill, size: V, m: THREE.Matrix4, bone?: string) =>
    put(obj, kind, color, new THREE.BoxGeometry(size[0], size[1], size[2]), m, bone);
  const cyl = (obj: string, kind: string, color: Fill, rt: number, rb: number, h: number, seg: number, m: THREE.Matrix4, bone?: string) =>
    put(obj, kind, color, new THREE.CylinderGeometry(rt, rb, h, seg), m, bone);
  const sph = (obj: string, kind: string, color: Fill, r: number, ws: number, hs: number, m: THREE.Matrix4, bone?: string) =>
    put(obj, kind, color, new THREE.SphereGeometry(r, ws, hs), m, bone);
  /** A cylinder between two points. */
  const rod = (obj: string, kind: string, color: Fill, a: V, c: V, r: number, seg = 6, bone?: string) => {
    const pa = v3(a);
    const pc = v3(c);
    const dir = pc.clone().sub(pa);
    put(obj, kind, color, new THREE.CylinderGeometry(r, r, dir.length(), seg), matQ(pa.clone().add(pc).multiplyScalar(0.5), aim(dir)), bone);
  };
  /** A box between two points (square-ish beam), width w, depth d (local x and z). */
  const beam = (obj: string, kind: string, color: Fill, a: V, c: V, w: number, d: number, bone?: string, up: V = [0, 0, 1]) => {
    const pa = v3(a);
    const pc = v3(c);
    const dir = pc.clone().sub(pa);
    put(obj, kind, color, new THREE.BoxGeometry(w, dir.length(), d), matQ(pa.clone().add(pc).multiplyScalar(0.5), aim(dir, up)), bone);
  };

  // =============================================================================================================
  // BASE: stone plinth, plank deck
  // =============================================================================================================
  const boxFaces = (w: number, h: number, d: number, omit: string) => {
    const g = new THREE.BoxGeometry(w, h, d);
    const idx = g.getIndex();
    if (!idx) throw new Error("box has no index");
    const names = ["px", "nx", "py", "ny", "pz", "nz"];
    const keep: number[] = [];
    names.forEach((nm, f) => {
      if (omit.split(" ").includes(nm)) return;
      for (let i = 0; i < 6; i++) keep.push(idx.getX(f * 6 + i));
    });
    g.setIndex(keep);
    g.clearGroups();
    return g;
  };
  b.part(boxFaces(2.9, 0.08, 2.9, "ny"), COBBLE, { bone: root, at: [0, 0.04, 0], name: "plinth" });
  b.part(boxFaces(2.76, 0.04, 2.76, "ny"), FLOOR, { bone: root, at: [0, 0.1, 0], name: "deck" });

  // =============================================================================================================
  // WALLS: stone footing, plaster panels, timber frame
  // =============================================================================================================
  const slab = (name: string, color: Fill, size: V, pos: V, omit = "") =>
    b.part(boxFaces(size[0], size[1], size[2], omit), color, { bone: root, at: pos, name });
  slab("footBack", COBBLE, [2.9, 0.52, 0.2], [0, 0.34, -1.35], "py ny");
  slab("footSide", COBBLE, [0.2, 0.52, 2.9], [-1.35, 0.34, 0], "py ny");
  slab("plasterBack", PLASTER, [2.9, 1.6, 0.16], [0, 1.4, -1.37], "px nx py ny nz");
  slab("plasterSide", PLASTER, [0.16, 1.6, 2.9], [-1.37, 1.4, 0], "pz nz py ny nx");
  // timber frame
  slab("sillBack", TIMBER_X, [2.9, 0.1, 0.2], [0, 0.65, -1.35]);
  slab("plateBack", TIMBER_X, [2.9, 0.16, 0.2], [0, 2.12, -1.35]);
  slab("sillSide", TIMBER_Z, [0.2, 0.1, 2.9], [-1.35, 0.65, 0]);
  slab("plateSide", TIMBER_Z, [0.2, 0.16, 2.9], [-1.35, 2.12, 0]);
  slab("cornerPost", TIMBER_V, [0.22, 2.12, 0.22], [-1.34, 1.14, -1.34]);
  slab("postBackA", TIMBER_V, [0.16, 1.34, 0.2], [0.47, 1.37, -1.35]);
  slab("postBackB", TIMBER_V, [0.16, 1.34, 0.2], [1.37, 1.37, -1.35]);
  slab("postSideA", TIMBER_V, [0.2, 1.34, 0.16], [-1.35, 1.37, 0.57]);
  slab("postSideB", TIMBER_V, [0.2, 1.34, 0.16], [-1.35, 1.37, 1.37]);
  // knee braces
  beam("brace", "back1", TIMBER_D, [-1.2, 1.52, -1.27], [-0.78, 2.05, -1.27], 0.1, 0.12);
  beam("brace", "back2", TIMBER_D, [0.4, 1.55, -1.27], [0.0, 2.05, -1.27], 0.1, 0.12);
  beam("brace", "back3", TIMBER_D, [0.55, 1.55, -1.27], [0.9, 2.05, -1.27], 0.1, 0.12);
  beam("brace", "side1", TIMBER_D, [-1.27, 1.52, -1.2], [-1.27, 2.05, -0.75], 0.12, 0.1);
  beam("brace", "side2", TIMBER_D, [-1.27, 1.55, 0.46], [-1.27, 2.05, 0.06], 0.12, 0.1);
  // wall pegs and plate-end dowels
  for (const [x, y] of [[0.47, 1.2], [0.47, 1.7], [1.37, 1.0], [1.37, 1.6], [-1.34, 0.9], [-1.34, 1.5]] as const)
    cyl("pegs", "wood", WOOD_LIGHT, 0.016, 0.016, 0.03, 6, mul(mat([x, y, -1.235]), mat([0, 0, 0], [90, 0, 0])));
  for (const [z, y] of [[0.57, 1.2], [0.57, 1.7], [1.37, 1.0], [-0.75, 2.12]] as const)
    cyl("pegs", "side", WOOD_LIGHT, 0.016, 0.016, 0.03, 6, mul(mat([-1.235, y, z]), mat([0, 0, 0], [0, 0, 90])));
  // exterior board cladding hides the plaster's outer face
  slab("cladBack1", CLAD, [1.62, 1.34, 0.012], [-0.42, 1.37, -1.439], "px nx py ny pz");
  slab("cladBack2", CLAD, [0.74, 1.34, 0.012], [0.92, 1.37, -1.439], "px nx py ny pz");
  slab("cladSide1", CLAD, [0.012, 1.34, 1.72], [-1.439, 1.37, -0.37], "px py ny pz nz");
  slab("cladSide2", CLAD, [0.012, 1.34, 0.64], [-1.439, 1.37, 0.97], "px py ny pz nz");
  beam("braceOut", "back1", TIMBER_D, [-1.2, 0.74, -1.452], [0.36, 2.02, -1.452], 0.1, 0.02);
  beam("braceOut", "back2", TIMBER_D, [0.58, 2.02, -1.452], [1.26, 0.74, -1.452], 0.09, 0.02);
  beam("braceOut", "side1", TIMBER_D, [-1.452, 0.74, -1.2], [-1.452, 2.02, 0.46], 0.1, 0.02, undefined, [1, 0, 0]);
  beam("braceOut", "side2", TIMBER_D, [-1.452, 2.02, 0.68], [-1.452, 0.74, 1.26], 0.09, 0.02, undefined, [1, 0, 0]);
  // wrought-iron straps with studs around the corner post and the frame posts
  for (const y of [0.95, 1.65]) {
    box("cornerStrap", "iron", IRON, [0.25, 0.1, 0.25], mat([-1.34, y, -1.34]));
    for (const [sx, sz] of [[0.126, 0.0], [0.0, 0.126]] as const)
      for (const k of [-0.07, 0, 0.07]) sph("cornerStrap", "stud", STEEL, 0.014, 5, 3, mat([-1.34 + sx + (sz ? k : 0), y, -1.34 + sz + (sx ? k : 0)]));
  }
  for (const y of [1.0, 1.7]) {
    box("postStraps", "back", IRON, [0.18, 0.08, 0.215], mat([0.47, y, -1.35]));
    box("postStraps", "side", IRON, [0.215, 0.08, 0.18], mat([-1.35, y, 0.57]));
    for (const k of [-0.06, 0.06]) {
      sph("postStraps", "stud", STEEL, 0.012, 5, 3, mat([0.47 + k, y, -1.241]));
      sph("postStraps", "stud", STEEL, 0.012, 5, 3, mat([-1.241, y, 0.57 + k]));
    }
  }

  // =============================================================================================================
  // BARRELS
  // =============================================================================================================
  const hoopGeo = (ri: number, ro: number, y0: number, y1: number) => {
    const c = 0.007;
    const pts = [
      [ri, y0],
      [ro - c, y0],
      [ro, y0 + c],
      [ro, y1 - c],
      [ro - c, y1],
      [ri, y1],
      [ri, y0],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 14);
  };

  type BarrelOpts = {
    id: string;
    c: V;
    axis: V;
    H: number;
    rE: number;
    rM: number;
    base: string;
    dark: string;
    seed: number;
    hoops: number[];
    open?: boolean;
    brand?: { tex: Tex; end: 1 | -1; size: number; up: V };
    bung?: { f: number; dir: V };
  };
  const barrel = (o: BarrelOpts) => {
    const ax = v3(o.axis).normalize();
    const mid = v3(o.c);
    const base0 = mid.clone().addScaledVector(ax, -o.H / 2);
    const rAt = (f: number) => o.rE + (o.rM - o.rE) * (1 - (2 * f - 1) ** 2);
    const lip = 0.045;
    const rim = 0.04;
    const fs = [0, 0.14, 0.3, 0.5, 0.7, 0.86, 1];
    const outline: OutlinePoint[] = [
      [0, lip],
      [o.rE - rim, lip],
      [o.rE - rim, 0],
      ...fs.map((f) => [rAt(f), f * o.H] as OutlinePoint),
      [o.rE - rim, o.H],
    ];
    if (o.open) outline.push([o.rE - rim, o.H - 0.13], [0, o.H - 0.13]);
    else outline.push([o.rE - rim, o.H - lip], [0, o.H - lip]);
    const body = b.lathe(outline, {
      at: base0,
      axis: ax,
      segments: 14,
      bone: root,
      name: o.id,
      color: barrelPaint({ base: o.base, dark: o.dark, ax, c0: base0, H: o.H, rE: o.rE, seed: o.seed, open: o.open }),
    });
    const M = matQ(base0.clone(), aim(ax));
    o.hoops.forEach((f, i) => {
      const y = f * o.H;
      const hh = f < 0.2 || f > 0.8 ? 0.038 : 0.028;
      const r0 = rAt(f);
      const ro = r0 + 0.026;
      put(o.id, "iron", IRON, hoopGeo(r0 - 0.014, ro, y - hh, y + hh), M);
      const n = 11;
      for (let k = 0; k < n; k++) {
        const th = ((k + (i % 2) * 0.5) / n) * Math.PI * 2;
        put(o.id, "rivets", STEEL, new THREE.SphereGeometry(0.0135, 5, 2), mul(M, mat([Math.sin(th) * (ro + 0.003), y, Math.cos(th) * (ro + 0.003)], [0, 0, 0], [1, 1, 1])));
      }
    });
    if (o.bung) {
      const dir = v3(o.bung.dir).normalize();
      const pos = base0.clone().addScaledVector(ax, o.bung.f * o.H).addScaledVector(dir, rAt(o.bung.f) * 0.99);
      put(o.id, "bung", W_DARK, new THREE.CylinderGeometry(0.034, 0.04, 0.05, 8), matQ(pos, aim(dir)));
      put(o.id, "bungHole", "#150c06", new THREE.CylinderGeometry(0.014, 0.014, 0.056, 6), matQ(pos, aim(dir)));
      put(o.id, "bungRing", STEEL, new THREE.TorusGeometry(0.033, 0.005, 4, 8), matQ(pos.clone().addScaledVector(dir, 0.026), aim(dir, [0, 0, 1], "z")));
    }
    if (o.brand) {
      const end = o.brand.end;
      const pos = base0.clone().addScaledVector(ax, end === 1 ? o.H - lip + 0.004 : lip - 0.004);
      b.part(new THREE.PlaneGeometry(o.brand.size, o.brand.size), "#ffffff", {
        bone: root,
        at: pos,
        dir: ax.clone().multiplyScalar(end),
        axis: "z",
        up: o.brand.up,
        texture: o.brand.tex,
        name: `${o.id}_brand`,
      });
    }
    return body;
  };

  // ---- the stack against the back wall: two lying casks and one on top ----
  const RM = 0.41;
  const stackZ = -0.755;
  const y1 = FT + RM;
  const yTop = y1 + RM * Math.sqrt(3);
  barrel({
    id: "caskL",
    c: [-0.8, y1, stackZ],
    axis: [0, 0, 1],
    H: 0.95,
    rE: 0.31,
    rM: RM,
    base: "#a8652c",
    dark: "#5a2f14",
    seed: 3,
    hoops: [0.075, 0.27, 0.73, 0.925],
    brand: { tex: tBrandMug, end: 1, size: 0.4, up: [0, 1, 0] },
    bung: { f: 0.5, dir: [0, 1, 0] },
  });
  barrel({
    id: "caskR",
    c: [0.02, y1, stackZ],
    axis: [0, 0, 1],
    H: 0.95,
    rE: 0.31,
    rM: RM,
    base: "#b27235",
    dark: "#64351a",
    seed: 5,
    hoops: [0.075, 0.27, 0.73, 0.925],
    brand: { tex: tBrandWheat, end: 1, size: 0.4, up: [0, 1, 0] },
    bung: { f: 0.5, dir: [0, 1, 0.1] },
  });
  barrel({
    id: "caskTop",
    c: [-0.39, yTop, stackZ],
    axis: [0, 0, 1],
    H: 0.95,
    rE: 0.31,
    rM: RM,
    base: "#9a5a28",
    dark: "#4e2812",
    seed: 7,
    hoops: [0.075, 0.27, 0.73, 0.925],
    brand: { tex: tBrandX, end: 1, size: 0.4, up: [0, 1, 0] },
    bung: { f: 0.5, dir: [0, 1, 0] },
  });
  // chocks wedging the stack
  for (const z of [-1.04, -0.48]) {
    b.extrude(
      [
        [0, 0],
        [0.2, 0],
        [0, 0.17],
      ],
      { at: [0.38, FT, z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.12, bevel: 0.006, color: W_DARK, bone: root, name: `chock${z}` },
    );
  }

  // ---- standing casks along the side wall ----
  const s1Body = barrel({
    id: "caskS1",
    c: [-0.84, FT + 0.46, 0.12],
    axis: [0, 1, 0],
    H: 0.92,
    rE: 0.29,
    rM: 0.38,
    base: "#b0692e",
    dark: "#5e3216",
    seed: 9,
    hoops: [0.08, 0.28, 0.72, 0.92],
    bung: { f: 0.4, dir: [0.5, 0, 1] },
  });
  const s2Body = barrel({
    id: "caskS2",
    c: [-0.84, FT + 0.4, 0.9],
    axis: [0, 1, 0],
    H: 0.8,
    rE: 0.26,
    rM: 0.34,
    base: "#98582a",
    dark: "#4b2812",
    seed: 13,
    hoops: [0.08, 0.3, 0.72, 0.92],
    open: true,
  });
  const S1TOP = FT + 0.92 - 0.045;
  b.decal(s1Body, tBrandHop, { at: [-0.84 + 0.14, FT + 0.5, 0.12 + 0.36], dir: [0.38, 0, 0.92], size: [0.3, 0.3], up: [0, 1, 0] });
  b.decal(s2Body, tBrandMug, { at: [-0.84 + 0.13, FT + 0.42, 0.9 + 0.31], dir: [0.4, 0, 0.9], size: [0.28, 0.28], up: [0, 1, 0] });
  // ale inside the open cask, plus a ladle
  cyl("caskS2", "ale", AMBER, 0.215, 0.215, 0.012, 14, mat([-0.84, FT + 0.8 - 0.085, 0.9]));
  for (const [dx, dz, r] of [[0.05, 0.04, 0.03], [-0.09, -0.05, 0.022], [0.1, -0.08, 0.018], [-0.05, 0.1, 0.02]] as const)
    sph("caskS2", "foam", FOAM, r, 6, 4, mul(mat([-0.84 + dx, FT + 0.8 - 0.08, 0.9 + dz]), mat([0, 0, 0], [0, 0, 0], [1, 0.5, 1])));
  sph("ladle", "bowl", PEWTER, 0.05, 8, 5, mul(mat([-0.97, FT + 0.74, 0.93]), mat([0, 0, 0], [0, 0, 0], [1, 0.6, 1])));
  rod("ladle", "wood", WOOD_LIGHT, [-0.96, FT + 0.76, 0.94], [-0.6, FT + 1.0, 0.7], 0.012, 6);
  sph("ladle", "hook", WOOD_LIGHT, 0.018, 5, 3, mat([-0.6, FT + 1.0, 0.7]));
  // lid leaning on the open cask
  put("lid", "wood", WOOD_LIGHT, new THREE.CylinderGeometry(0.245, 0.245, 0.04, 14), mul(mat([-0.46, FT + 0.245, 0.97]), mat([0, 0, 0], [0, 0, 90 - 7])));
  put("lid", "band", IRON, new THREE.BoxGeometry(0.02, 0.025, 0.49), mul(mat([-0.436, FT + 0.245, 0.97]), mat([0, 0, 0], [0, 0, -7])));
  put("lid", "ring", STEEL, new THREE.TorusGeometry(0.05, 0.008, 4, 10), mul(mat([-0.43, FT + 0.245, 0.97]), mat([0, 0, 0], [0, 90, -7])));

  // ---- keg rack at the back wall: three kegs on cradles with brass taps ----
  const KM = 0.19;
  const kegY0 = FT + 0.08 + KM;
  const kegX = [0.8, 1.18];
  const kegZ = -0.85;
  for (const z of [-1.0, -0.7]) box("rack", "rail", W_DARK, [0.88, 0.08, 0.075], mat([1.0, FT + 0.04, z]));
  for (const x of [0.575, 1.4]) {
    box("rack", "post", W_DARK, [0.05, 0.5, 0.3], mat([x, FT + 0.25, kegZ]));
    box("rack", "cap", IRON, [0.07, 0.03, 0.32], mat([x, FT + 0.505, kegZ]));
  }
  const kegSpecs = [
    { id: "kegA", x: kegX[0], y: kegY0, base: "#b87a3a", dark: "#663a1a", seed: 21, tex: tBrandHop },
    { id: "kegB", x: kegX[1], y: kegY0, base: "#a46a30", dark: "#5a3216", seed: 23, tex: tBrandMug },
    { id: "kegC", x: (kegX[0] + kegX[1]) / 2, y: kegY0 + Math.sqrt((2 * KM) ** 2 - ((kegX[1] - kegX[0]) / 2) ** 2), base: "#c28645", dark: "#6e4020", seed: 25, tex: tBrandWheat },
  ];
  const kegHeadZ = kegZ + 0.25;
  kegSpecs.forEach((k, i) => {
    barrel({
      id: k.id,
      c: [k.x, k.y, kegZ],
      axis: [0, 0, 1],
      H: 0.5,
      rE: 0.15,
      rM: KM,
      base: k.base,
      dark: k.dark,
      seed: k.seed,
      hoops: [0.09, 0.3, 0.7, 0.91],
      brand: i === 2 ? { tex: k.tex, end: 1, size: 0.2, up: [0, 1, 0] } : undefined,
    });
    // brass tap on the head
    const tx = k.x;
    const ty = k.y - (i === 2 ? 0.02 : 0.045);
    const tz = kegHeadZ - 0.03;
    cyl(k.id, "tapPipe", BRASS, 0.017, 0.017, 0.11, 8, mul(mat([tx, ty, tz + 0.05]), mat([0, 0, 0], [90, 0, 0])));
    cyl(k.id, "tapFlange", BRASS, 0.038, 0.038, 0.015, 8, mul(mat([tx, ty, tz - 0.004]), mat([0, 0, 0], [90, 0, 0])));
    cyl(k.id, "tapSpout", BRASS, 0.014, 0.01, 0.05, 8, mat([tx, ty - 0.022, tz + 0.09]));
    cyl(k.id, "tapStem", BRASS, 0.012, 0.012, 0.05, 8, mat([tx, ty + 0.03, tz + 0.05]));
    sph(k.id, "tapNut", BRASS, 0.02, 6, 4, mat([tx, ty, tz + 0.105]));
    const jn = bones[`tap${i}`] ?? (bones[`tap${i}`] = b.joint(`tap${i}`, { parent: root, at: [tx, ty + 0.055, tz + 0.05], dir: [0, 1, 0], role: "hinge" }));
    box(k.id, "lever", BRASS, [0.012, 0.07, 0.022], mat([tx, ty + 0.09, tz + 0.05]), `tap${i}`);
    sph(k.id, "knob", W_DARK, 0.022, 6, 4, mat([tx, ty + 0.13, tz + 0.05]), `tap${i}`);
    b.pose(jn, { axis: [1, 0, 0], deg: i === 1 ? 52 : i === 0 ? 8 : 0 });
  });
  // drip under the poured tap + small catch cup
  cyl("catch", "wood", WOOD_MUG, 0.075, 0.062, 0.09, 10, mat([kegX[1], FT + 0.045, kegHeadZ + 0.08]));
  cyl("catch", "ale", AMBER, 0.06, 0.06, 0.01, 10, mat([kegX[1], FT + 0.083, kegHeadZ + 0.08]));
  cyl("catch", "foam", FOAM, 0.05, 0.05, 0.012, 10, mat([kegX[1], FT + 0.092, kegHeadZ + 0.08]));
  // keg chalk tally on the front of the rack post
  box("tally", "chalk", "#efe9d8", [0.004, 0.12, 0.02], mat([0.575 - 0.0, FT + 0.34, kegZ + 0.17]));

  // =============================================================================================================
  // CRATES
  // =============================================================================================================
  const crate = (o: { id: string; x: number; z: number; y0: number; s: number; hs: number; rot: number; lid?: "closed" | "open"; art?: Tex; artSize?: V }) => {
    const M = mat([o.x, o.y0, o.z], [0, o.rot, 0]);
    const L = (pos: V, rot: V = [0, 0, 0]) => mul(M, mat(pos, rot));
    const { s, hs } = o;
    const bh = (hs - 0.02) / 3;
    const len = s - 0.1;
    const sides: Array<{ pos: (y: number) => V; rot: V }> = [
      { pos: (y) => [0, y, s / 2 - 0.025], rot: [0, 0, 0] },
      { pos: (y) => [0, y, -s / 2 + 0.025], rot: [0, 0, 0] },
      { pos: (y) => [s / 2 - 0.025, y, 0], rot: [0, 90, 0] },
      { pos: (y) => [-s / 2 + 0.025, y, 0], rot: [0, 90, 0] },
    ];
    sides.forEach((sd, si) => {
      for (let r = 0; r < 3; r++) {
        const y = 0.015 + bh * (r + 0.5) + 0.01;
        const v = Math.floor(R() * 3);
        box(o.id, `w${v}`, W_CRATE[v], [len, bh - 0.012, 0.03], L(sd.pos(y), sd.rot));
        for (const e of [-1, 1]) {
          const lp = sd.pos(y);
          const off: V = si < 2 ? [e * (len / 2 - 0.03), 0, 0.017] : [0, 0, e * (len / 2 - 0.03)];
          const sgn = si === 0 || si === 2 ? 1 : -1;
          const np: V = si < 2 ? [lp[0] + off[0], lp[1], lp[2] + sgn * 0.017] : [lp[0] + sgn * 0.017, lp[1], lp[2] + off[2]];
          sph(o.id, "nail", STEEL, 0.008, 4, 3, L(np));
        }
      }
      // diagonal brace on the back and both sides
      if (si !== 0) {
        const dd = Math.hypot(len - 0.04, hs - 0.1);
        const ang = Math.atan2(hs - 0.1, len - 0.04) / DEG;
        const out = sd.pos(hs / 2);
        const sgn = si === 1 || si === 3 ? -1 : 1;
        const bp: V = si < 2 ? [out[0], out[1], out[2] + sgn * 0.02] : [out[0] + sgn * 0.02, out[1], out[2]];
        box(o.id, "brace", W_DARK, [dd, 0.06, 0.016], L(bp, [0, sd.rot[1], ang]));
      }
    });
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        box(o.id, "post", W_DARK, [0.06, hs, 0.06], L([sx * (s / 2 - 0.03), hs / 2, sz * (s / 2 - 0.03)]));
        // iron corner straps (top and bottom)
        for (const yy of [0.075, hs - 0.075]) {
          box(o.id, "strapA", IRON, [0.066, 0.12, 0.012], L([sx * (s / 2 - 0.03), yy, sz * (s / 2 + 0.002)]));
          box(o.id, "strapB", IRON, [0.012, 0.12, 0.066], L([sx * (s / 2 + 0.002), yy, sz * (s / 2 - 0.03)]));
          sph(o.id, "rivet", STEEL, 0.01, 5, 3, L([sx * (s / 2 - 0.03), yy, sz * (s / 2 + 0.009)]));
          sph(o.id, "rivet", STEEL, 0.01, 5, 3, L([sx * (s / 2 + 0.009), yy, sz * (s / 2 - 0.03)]));
        }
      }
    box(o.id, "floor", W_CRATE[1], [s - 0.06, 0.03, s - 0.06], L([0, 0.015, 0]));
    // hand-hold slots on the sides
    for (const sx of [-1, 1]) box(o.id, "slot", "#1d1007", [0.014, 0.05, 0.17], L([sx * (s / 2 - 0.006), hs * 0.6, 0]));
    if (o.lid === "closed") {
      const pw = (s - 0.02) / 5;
      for (let i = 0; i < 5; i++) {
        const v = Math.floor(R() * 3);
        box(o.id, `lid${v}`, W_CRATE[v], [pw - 0.006, 0.03, s], L([-s / 2 + 0.01 + pw / 2 + i * pw, hs + 0.015, 0]));
      }
      for (const z of [-1, 1]) box(o.id, "batten", W_DARK, [s, 0.026, 0.07], L([0, hs + 0.043, z * (s / 2 - 0.1)]));
      for (const z of [-1, 1]) for (const x of [-1, 1]) sph(o.id, "lidNail", STEEL, 0.009, 4, 3, L([x * (s / 2 - 0.05), hs + 0.058, z * (s / 2 - 0.1)]));
    }
    if (o.art) {
      const sz = o.artSize ?? [s * 0.68, s * 0.4, 0];
      const pos = new THREE.Vector3(0, hs * 0.5 + 0.0, s / 2 - 0.006).applyMatrix4(M);
      const dir = new THREE.Vector3(0, 0, 1).applyQuaternion(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, o.rot * DEG, 0)));
      b.part(new THREE.PlaneGeometry(sz[0], sz[1]), "#ffffff", { bone: root, at: pos, dir, axis: "z", up: [0, 1, 0], texture: o.art, name: `${o.id}_stencil` });
    }
    return M;
  };
  crate({ id: "crateA", x: 1.0, z: 1.0, y0: FT, s: 0.64, hs: 0.62, rot: 0.1, lid: "closed", art: tCrate });
  crate({ id: "crateB", x: 1.02, z: 1.02, y0: FT + 0.62 + 0.06, s: 0.42, hs: 0.36, rot: -0.3, lid: "closed", art: tCrate2, artSize: [0.3, 0.18, 0] });
  // shipping tag on crate A
  b.part(new THREE.PlaneGeometry(0.07, 0.105), "#ffffff", { bone: root, at: [0.8, FT + 0.27, 1.33], dir: [0.1, 0, 1], axis: "z", up: [0, 1, 0], texture: tTag, name: "tag" });
  rod("tagString", "twine", ROPE, [0.8, FT + 0.33, 1.32], [0.79, FT + 0.318, 1.33], 0.004, 4);

  // ---- open crate of bottles with the lid thrown back on a hinge ----
  const C3 = { x: 0.3, z: 1.1, s: 0.56, hs: 0.3 };
  const c3M = crate({ id: "crateC", x: C3.x, z: C3.z, y0: FT, s: C3.s, hs: C3.hs, rot: 0.0 });
  const lidJ = b.joint("crateLid", { parent: root, at: [C3.x, FT + C3.hs + 0.02, C3.z - C3.s / 2 + 0.02], dir: [0, 0, 1], role: "hinge" });
  bones.crateLid = lidJ;
  {
    const pw = (C3.s - 0.02) / 5;
    for (let i = 0; i < 5; i++)
      box("crateLid", "plank", W_CRATE[i % 3], [pw - 0.006, 0.03, C3.s], mat([C3.x - C3.s / 2 + 0.01 + pw / 2 + i * pw, FT + C3.hs + 0.025, C3.z + 0.02]), "crateLid");
    for (const x of [-1, 1]) box("crateLid", "batten", W_DARK, [0.07, 0.026, C3.s], mat([C3.x + x * (C3.s / 2 - 0.1), FT + C3.hs + 0.053, C3.z + 0.02]), "crateLid");
    for (const x of [-1, 1]) box("crateLid", "hinge", IRON, [0.09, 0.012, 0.2], mat([C3.x + x * 0.17, FT + C3.hs + 0.07, C3.z - C3.s / 2 + 0.12]), "crateLid");
    b.pose(lidJ, { axis: [1, 0, 0], deg: -112 });
  }
  // bottles in the open crate
  const bottleGeo = () => {
    const pts = [
      [0, 0],
      [0.045, 0],
      [0.048, 0.012],
      [0.048, 0.2],
      [0.035, 0.26],
      [0.017, 0.3],
      [0.017, 0.37],
      [0.021, 0.375],
      [0.021, 0.39],
      [0, 0.39],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 8);
  };
  const glass = ["#2f8a4a", "#3a6fb0", "#c77a1e"];
  let bi = 0;
  for (const bz of [-0.1, 0.1])
    for (const bx of [-0.15, 0, 0.15]) {
      const col = glass[bi % 3];
      const tilt: V = [(R() - 0.5) * 8, 0, (R() - 0.5) * 8];
      put("bottles", `glass${bi % 3}`, col, bottleGeo(), L2(c3M, [bx, 0.05, bz], tilt));
      cyl("bottles", "cork", "#d2a265", 0.014, 0.017, 0.035, 6, L2(c3M, [bx, 0.05 + 0.41, bz], tilt));
      bi++;
    }
  function L2(M: THREE.Matrix4, pos: V, rot: V) {
    return mul(M, mat(pos, rot));
  }
  // straw in the crate
  for (let i = 0; i < 46; i++) {
    const a = R() * Math.PI * 2;
    const rr = Math.sqrt(R()) * 0.22;
    box("straw", "hay", HAY, [0.008, 0.2 + R() * 0.1, 0.008], mat([C3.x + Math.cos(a) * rr, FT + 0.22 + R() * 0.06, C3.z + Math.sin(a) * rr], [(R() - 0.5) * 80, R() * 360, (R() - 0.5) * 80]));
  }
  // loose straw on the floor around the crates
  for (let i = 0; i < 34; i++) {
    const a = R() * Math.PI * 2;
    const rr = 0.3 + R() * 0.25;
    box("floorStraw", "hay", HAY, [0.008, 0.007, 0.12 + R() * 0.06], mat([C3.x + Math.max(-0.9, Math.min(0.9, Math.cos(a) * rr)), FT + 0.006, Math.min(1.34, C3.z + Math.sin(a) * rr)], [0, R() * 360, 0]));
  }

  // =============================================================================================================
  // MUGS
  // =============================================================================================================
  const mug = (id: string, M: THREE.Matrix4, o: { paintC: Fill; ale?: number; foam?: boolean; band?: boolean; lid?: boolean }) => {
    const h = 0.15;
    const rb = 0.052;
    const rt = 0.062;
    const pts = [
      [0, 0],
      [rb, 0],
      [rt, h],
      [rt - 0.009, h],
      [rb - 0.008, 0.016],
      [0, 0.016],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    put(id, "body", o.paintC, new THREE.LatheGeometry(pts, 10), M);
    put(id, "handle", o.paintC, new THREE.TorusGeometry(0.04, 0.0085, 5, 8, Math.PI), mul(M, mat([0.055, h * 0.5, 0], [0, 0, -90], [1, 1.1, 1])));
    if (o.band !== false) {
      for (const f of [0.18, 0.82]) {
        const r = rb + (rt - rb) * f + 0.0045;
        put(id, "band", IRON, hoopGeo10(r - 0.006, r, f * h - 0.008, f * h + 0.008), M);
      }
    }
    if (o.ale) {
      const top = h * o.ale;
      const rr = rb + (rt - rb) * o.ale - 0.011;
      put(id, "ale", AMBER, new THREE.CylinderGeometry(rr, rr, 0.006, 10), mul(M, mat([0, top, 0])));
      if (o.foam) {
        put(id, "foam", FOAM, new THREE.SphereGeometry(rr + 0.004, 9, 5), mul(M, mat([0, top + 0.012, 0], [0, 0, 0], [1, 0.62, 1])));
        for (const [dx, dz, r] of [[0.03, 0.02, 0.016], [-0.025, 0.03, 0.014], [0.0, -0.035, 0.015]] as const)
          put(id, "foam", FOAM, new THREE.SphereGeometry(r, 6, 4), mul(M, mat([dx, top + 0.022, dz])));
      }
    }
    if (o.lid) {
      put(id, "lid", PEWTER, new THREE.CylinderGeometry(rt - 0.006, rt, 0.012, 10), mul(M, mat([0, h + 0.004, 0], [0, 0, 22])));
    }
  };
  const hoopGeo10 = (ri: number, ro: number, y0: number, y1: number) => {
    const pts = [
      [ri, y0],
      [ro, y0],
      [ro, y1],
      [ri, y1],
      [ri, y0],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 10);
  };

  // ---- S1 tabletop dressing ----
  const s1 = { x: -0.84, z: 0.12 };
  mug("mugS1a", mat([s1.x + 0.1, S1TOP, s1.z - 0.07], [0, 40, 0]), { paintC: WOOD_MUG, ale: 0.88, foam: true });
  mug("mugS1b", mat([s1.x + 0.07, S1TOP, s1.z + 0.14], [0, -20, 0]), { paintC: PEWTER, ale: 0.9, foam: true, lid: false, band: false });
  // plate with cheese
  cyl("plate", "pewter", PEWTER, 0.11, 0.09, 0.016, 12, mat([s1.x - 0.1, S1TOP + 0.008, s1.z + 0.1]));
  cyl("plate", "rim", PEWTER, 0.115, 0.115, 0.006, 12, mat([s1.x - 0.1, S1TOP + 0.017, s1.z + 0.1]));
  put("cheese", "yellow", CHEESE, new THREE.CylinderGeometry(0.085, 0.085, 0.07, 10, 1, false, 0, Math.PI / 2.2), mul(mat([s1.x - 0.1, S1TOP + 0.055, s1.z + 0.1], [0, 30, 0])));
  for (const [dx, dy, dz] of [[0.03, 0.01, 0.03], [0.05, -0.015, 0.0], [0.02, 0.02, 0.05]] as const)
    sph("cheese", "holes", "#d49a22", 0.011, 5, 3, mat([s1.x - 0.1 + dx - 0.0, S1TOP + 0.055 + dy, s1.z + 0.1 + dz * 1.0 - 0.0]));
  // knife
  box("knife", "blade", STEEL, [0.02, 0.008, 0.13], mat([s1.x - 0.02, S1TOP + 0.02, s1.z + 0.0], [0, 20, 0]));
  box("knife", "handle", W_DARK, [0.024, 0.016, 0.06], mat([s1.x - 0.04, S1TOP + 0.022, s1.z - 0.1], [0, 20, 0]));
  // candle in an iron stick, flame glows
  const cx = s1.x - 0.1;
  const cz = s1.z - 0.09;
  put("candle", "dish", IRON, new THREE.LatheGeometry([[0, 0], [0.07, 0], [0.075, 0.012], [0.04, 0.026], [0.03, 0.03], [0, 0.03]].map(([x, y]) => new THREE.Vector2(x, y)), 10), mat([cx, S1TOP, cz]));
  put("candle", "ring", IRON, new THREE.TorusGeometry(0.045, 0.006, 4, 10), mul(mat([cx, S1TOP + 0.02, cz]), mat([0, 0, 0], [90, 0, 0])));
  put("candle", "stem", IRON, new THREE.CylinderGeometry(0.01, 0.016, 0.04, 6), mat([cx, S1TOP + 0.045, cz]));
  put("candle", "wax", WAX, new THREE.CylinderGeometry(0.025, 0.028, 0.13, 8), mat([cx, S1TOP + 0.12, cz]));
  for (const [a, l] of [[0.5, 0.05], [2.8, 0.07], [4.4, 0.04]] as const)
    put("candle", "drip", WAX, new THREE.CapsuleGeometry(0.0055, l, 3, 5), mat([cx + Math.cos(a) * 0.026, S1TOP + 0.17 - l * 0.5, cz + Math.sin(a) * 0.026]));
  put("candle", "wick", "#2a1c14", new THREE.CylinderGeometry(0.0025, 0.0025, 0.02, 4), mat([cx, S1TOP + 0.195, cz]));
  glow(b.part(new THREE.SphereGeometry(0.02, 7, 5), "#ff9a2c", { bone: root, at: [cx, S1TOP + 0.222, cz], scale: [0.7, 1.7, 0.7], name: "flame" }), 1.4);
  glow(b.part(new THREE.SphereGeometry(0.012, 6, 4), "#fff2b0", { bone: root, at: [cx, S1TOP + 0.212, cz], scale: [0.7, 1.5, 0.7], name: "flameCore" }), 1.6);
  // dice and coins
  box("dice", "d1", "#f4eddc", [0.03, 0.03, 0.03], mat([s1.x + 0.19, S1TOP + 0.015, s1.z + 0.02], [0, 25, 0]));
  box("dice", "d2", "#f4eddc", [0.03, 0.03, 0.03], mat([s1.x + 0.215, S1TOP + 0.015, s1.z - 0.02], [0, -12, 0]));
  for (const [dx, dz] of [[0.0, -0.01], [0.0, 0.0], [0.01, 0.02]] as const) {
    sph("dice", "pip", "#7a1420", 0.0042, 4, 3, mat([s1.x + 0.19 + dx * 0.4, S1TOP + 0.031, s1.z + 0.02 + dz * 0.4]));
  }
  for (let i = 0; i < 4; i++)
    cyl("coins", "gold", BRASS, 0.017, 0.017, 0.004, 8, mat([s1.x + 0.19 + (i % 2) * 0.03 - 0.0, S1TOP + 0.002 + (i > 1 ? 0.004 : 0), s1.z - 0.1 + (i % 2) * 0.01 - 0.0], [(i - 1.5) * 4, i * 40, 0]));

  // ---- mug pegs on the back wall ----
  const pegY = 1.22;
  box("pegRail", "board", TIMBER_X, [0.82, 0.09, 0.04], mat([1.0, pegY, -1.27]));
  const pegXs = [0.66, 0.84, 1.02, 1.2, 1.37];
  pegXs.forEach((x, i) => {
    cyl("pegRail", "peg", W_DARK, 0.012, 0.014, 0.1, 6, mul(mat([x, pegY - 0.005, -1.22]), mat([0, 0, 0], [90, 0, 0])));
    sph("pegRail", "pegHead", W_DARK, 0.018, 6, 4, mat([x, pegY - 0.005, -1.17]));
    if (i < 4) {
      const paints = [WOOD_MUG, PEWTER, CLAY, WOOD_MUG];
      mug(`mugPeg${i}`, mat([x - 0.075, pegY - 0.005 - 0.0985, -1.22], [0, 0, 0]), { paintC: paints[i], band: i !== 2 });
      // twine so the mug hangs from its handle
    }
  });

  // ---- stool and its mug ----
  const st = { x: -0.12, z: 0.3 };
  const seatY = FT + 0.46;
  put("stool", "seat", WOOD_LIGHT, new THREE.LatheGeometry([[0, 0], [0.17, 0], [0.185, 0.015], [0.185, 0.035], [0.16, 0.05], [0, 0.05]].map(([x, y]) => new THREE.Vector2(x, y)), 12), mat([st.x, seatY - 0.05, st.z]));
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    rod("stool", "leg", W_DARK, [st.x + Math.cos(a) * 0.1, seatY - 0.04, st.z + Math.sin(a) * 0.1], [st.x + Math.cos(a) * 0.2, FT, st.z + Math.sin(a) * 0.2], 0.026, 6);
    const a2 = a + (Math.PI * 2) / 3;
    rod("stool", "rung", W_DARK, [st.x + Math.cos(a) * 0.155, FT + 0.17, st.z + Math.sin(a) * 0.155], [st.x + Math.cos(a2) * 0.155, FT + 0.17, st.z + Math.sin(a2) * 0.155], 0.014, 5);
  }
  mug("mugStool", mat([st.x + 0.02, seatY, st.z], [0, -35, 0]), { paintC: WOOD_MUG, ale: 0.55, foam: false });
  // gilded trophy stein on top of the stack, a loaf and a mug on the crates
  const TOPY = yTop + 0.38 - 0.012;
  const steinZ = -0.5;
  mug("steinTop", mat([-0.39, TOPY, steinZ], [0, -35, 0], 1.4), { paintC: BRASS_P, ale: 0.85, foam: true, band: true });
  put("steinTop", "lid", BRASS_P, new THREE.CylinderGeometry(0.058, 0.066, 0.014, 10), mat([-0.39, TOPY + 0.216, steinZ], [0, -35, 38]));
  sph("steinTop", "gem", "#c0392b", 0.02, 6, 4, mat([-0.39, TOPY + 0.238, steinZ]));
  {
    const bx = 0.98;
    const bz = 1.0;
    const by = FT + 0.68 + 0.36 + 0.056;
    put("loaf", "crust", "#c9893a", new THREE.SphereGeometry(0.1, 9, 6), mat([bx - 0.06, by + 0.03, bz + 0.05], [0, 30, 0], [1.7, 0.7, 0.9]));
    for (const k of [-1, 0, 1]) put("loaf", "slash", "#f0cf8c", new THREE.BoxGeometry(0.012, 0.004, 0.08), mat([bx - 0.06 + k * 0.055, by + 0.083, bz + 0.05], [0, 30, 60]));
    mug("mugCrate", mat([bx + 0.1, by, bz - 0.06], [0, 80, 0]), { paintC: CLAY, ale: 0.8, foam: true, band: false });
  }

  // ---- spilled mug, puddle and mouse ----
  const spill = mul(mat([0.44, FT + 0.062, 0.56], [0, -60, 0]), new THREE.Matrix4().makeRotationX(90 * DEG), new THREE.Matrix4().makeRotationY(90 * DEG));
  mug("mugSpill", spill, { paintC: WOOD_MUG });
  b.extrude(
    [
      [0, 0.0],
      [0.1, -0.03],
      [0.16, 0.02],
      [0.19, 0.1],
      [0.12, 0.17],
      [0.03, 0.15],
      [-0.05, 0.08],
      [-0.03, 0.01],
    ],
    { at: [0.2, FT + 0.003, 0.42], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.004, smoothing: 2, color: "#b8721a", bone: root, name: "puddle" },
  );
  b.extrude(
    [
      [0, 0.0],
      [0.06, -0.01],
      [0.09, 0.03],
      [0.04, 0.07],
      [-0.01, 0.04],
    ],
    { at: [0.26, FT + 0.0065, 0.47], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.003, smoothing: 2, color: "#e8a53a", bone: root, name: "puddleSheen" },
  );
  // mouse sipping the spill
  {
    const mp = new THREE.Matrix4().compose(new THREE.Vector3(0.33, FT, 0.73), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, (-155 * DEG), 0)), new THREE.Vector3(1, 1, 1));
    const ML = (pos: V, rot: V = [0, 0, 0], sc: V | number = 1) => mul(mp, mat(pos, rot, sc));
    sph("mouse", "body", FLESH, 0.05, 8, 6, ML([0, 0.04, 0], [0, 0, 0], [0.8, 0.78, 1.35]));
    sph("mouse", "head", FLESH, 0.03, 7, 5, ML([0, 0.04, 0.075], [14, 0, 0], [0.85, 0.85, 1.15]));
    sph("mouse", "nose", PINK, 0.009, 5, 4, ML([0, 0.036, 0.108]));
    for (const s of [-1, 1]) {
      cyl("mouse", "ear", PINK, 0.018, 0.018, 0.004, 7, ML([s * 0.026, 0.07, 0.062], [0, 0, s * 70]));
      sph("mouse", "eye", "#120c10", 0.0055, 4, 3, ML([s * 0.018, 0.05, 0.092]));
      sph("mouse", "paw", PINK, 0.009, 4, 3, ML([s * 0.03, 0.009, 0.09]));
      sph("mouse", "foot", PINK, 0.011, 4, 3, ML([s * 0.04, 0.009, -0.03], [0, 0, 0], [0.8, 0.6, 1.5]));
      for (const k of [-1, 1]) rod("mouse", "whisker", "#d8d0c8", [s * 0.012, 0.04 + k * 0.004, 0.1], [s * 0.05, 0.04 + k * 0.016, 0.12], 0.0012, 3);
    }
    const tail = catmull(
      [new THREE.Vector3(0, 0.035, -0.06), new THREE.Vector3(0.02, 0.02, -0.12), new THREE.Vector3(-0.02, 0.01, -0.18), new THREE.Vector3(0, 0.006, -0.24)].map((p) => p.applyMatrix4(mp)),
    );
    b.sweep(tail, [0.007, 0.002], { color: PINK, bone: root, sides: 5, name: "mouseTail" });
  }

  // =============================================================================================================
  // SACKS, ROPE, BUCKET, HOPS
  // =============================================================================================================
  const sack = (id: string, x: number, z: number, r: number, yaw: number, art?: Tex) => {
    const body = b.part(new THREE.SphereGeometry(r, 10, 7), BURLAP, { bone: root, at: [x, FT + r * 0.8, z], scale: [1.12, 0.9, 0.92], rotation: [0, yaw, 0], name: id });
    if (art) b.decal(body, art, { at: [x, FT + r * 0.8, z + r * 0.85], dir: [Math.sin(yaw * DEG), 0, Math.cos(yaw * DEG)], size: [r, r * 0.7], up: [0, 1, 0] });
    const nk = mat([x, FT + r * 0.8 + r * 0.72, z], [0, yaw, 0]);
    put(id, "neck", BURLAP, new THREE.CylinderGeometry(r * 0.5, r * 0.62, r * 0.4, 8), nk);
    put(id, "frill", BURLAP, new THREE.CylinderGeometry(r * 0.78, r * 0.45, r * 0.45, 8), mul(nk, mat([0, r * 0.32, 0], [4, 0, -6])));
    put(id, "tie", ROPE, new THREE.TorusGeometry(r * 0.52, r * 0.07, 5, 10), mul(nk, mat([0, r * 0.06, 0], [90, 0, 0])));
    for (const s of [-1, 1]) put(id, "seam", "#6a4c26", new THREE.BoxGeometry(0.006, r * 0.9, 0.006), mul(mat([x, FT + r * 0.8, z], [0, yaw, 0]), mat([s * r * 0.5, 0, r * 0.82], [0, 0, 0])));
  };
  sack("sackA", 1.2, 0.3, 0.2, -25, tSack);
  sack("sackB", 1.22, -0.14, 0.15, 30);
  cyl("grain", "heap", GRAIN, 0.02, 0.13, 0.05, 9, mat([1.05, FT + 0.025, 0.58]));
  for (let i = 0; i < 14; i++) sph("grain", "kern", GRAIN, 0.008, 4, 3, mat([1.05 + (R() - 0.5) * 0.4, FT + 0.006, 0.58 + (R() - 0.2) * 0.25], [0, 0, 0], [1.4, 0.8, 1]));

  // rope coil
  const coil = spiral([-0.22, FT + 0.02, 1.12], [-0.02, FT + 0.02, 1.12], [0, 1, 0], { turns: 3.6, r1: 0.13, pitch: 0.036 });
  b.sweep(coil, 0.02, { color: ROPE, bone: root, sides: 6, name: "ropeCoil" });
  b.sweep(catmull([[-0.02, FT + 0.02, 1.12], [0.0, FT + 0.02, 1.2], [-0.05, FT + 0.018, 1.32], [-0.2, FT + 0.018, 1.38]]), 0.018, { color: ROPE, bone: root, sides: 6, name: "ropeTail" });

  // bucket with a ladle of water
  {
    const bx = -0.22;
    const bz = 0.7;
    put("bucket", "body", WOOD_MUG, new THREE.LatheGeometry([[0, 0], [0.1, 0], [0.135, 0.22], [0.125, 0.22], [0.092, 0.012], [0, 0.012]].map(([x, y]) => new THREE.Vector2(x, y)), 10), mat([bx, FT, bz]));
    for (const f of [0.2, 0.78]) {
      const r = 0.1 + 0.035 * f + 0.003;
      put("bucket", "band", IRON, hoopGeo10(r - 0.004, r + 0.012, f * 0.22 - 0.016, f * 0.22 + 0.016), mat([bx, FT, bz]));
    }
    cyl("bucket", "water", "#4e93b8", 0.115, 0.115, 0.006, 10, mat([bx, FT + 0.178, bz]));
    put("bucket", "handle", IRON, new THREE.TorusGeometry(0.133, 0.0065, 4, 12, Math.PI), mul(mat([bx, FT + 0.215, bz], [0, 15, 12])));
    for (const s of [-1, 1]) sph("bucket", "ear", STEEL, 0.014, 5, 3, mat([bx + s * 0.131, FT + 0.215, bz]));
  }
  // hop bundles hanging from the side plate
  for (const z of [0.95, 1.18]) {
    rod("hops", "string", ROPE, [-1.245, 2.04, z], [-1.22, 1.94, z], 0.004, 3);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const rr = 0.028 * (i % 2 ? 0.5 : 1);
      const y = 1.94 - 0.04 - (i % 3) * 0.035;
      put("hops", i % 2 ? "g1" : "g2", i % 2 ? GREEN_H1 : GREEN_H2, new THREE.ConeGeometry(0.03, 0.1, 6), mul(mat([-1.22 + Math.cos(a) * rr, y, z + Math.sin(a) * rr], [180, 0, 0])));
    }
  }

  // =============================================================================================================
  // LANTERN, SIGN, BANNER, SHELF, CHALKBOARD, POSTER, WEB
  // =============================================================================================================
  // lantern arm on the back wall, bolted to post A
  {
    const ax = 0.47;
    const ay = 1.98;
    box("lanternArm", "plate", IRON, [0.1, 0.22, 0.02], mat([ax, ay - 0.06, -1.24]));
    for (const dy of [-0.1, 0.04]) sph("lanternArm", "bolt", STEEL, 0.012, 5, 3, mat([ax, ay + dy - 0.06, -1.228]));
    rod("lanternArm", "iron", IRON, [ax, ay, -1.24], [ax, ay, -0.86], 0.014, 6);
    rod("lanternArm", "strut", IRON, [ax, ay - 0.2, -1.24], [ax, ay - 0.005, -0.98], 0.011, 6);
    put("lanternArm", "scroll", IRON, new THREE.TorusGeometry(0.06, 0.007, 4, 12, Math.PI * 1.4), mul(mat([ax, ay - 0.075, -1.1], [0, 90, 0]), mat([0, 0, 0], [0, 0, 20])));
    sph("lanternArm", "tip", IRON, 0.02, 6, 4, mat([ax, ay, -0.855]));
    const lz = -0.855;
    const ly = 1.42;
    const LM = mat([ax, ly, lz], [0, 0, 0], 1.4);
    const LL = (pos: V, rot: V = [0, 0, 0]) => mul(LM, mat(pos, rot));
    // chain from the arm tip down to the lantern ring
    const ringTop = ly + 0.325 * 1.4;
    const links = Math.ceil((ay - 0.012 - ringTop) / 0.03) + 1;
    for (let i = 0; i < links; i++)
      put("lanternChain", "link", IRON, new THREE.TorusGeometry(0.014, 0.0035, 4, 8), matQ(new THREE.Vector3(ax, ay - 0.012 - i * 0.03, lz), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, (i % 2) * Math.PI * 0.5, 0)), [1, 1.6, 1]));
    put("lantern", "base", IRON, new THREE.LatheGeometry([[0, 0], [0.075, 0], [0.088, 0.02], [0.07, 0.034], [0, 0.034]].map(([x, y]) => new THREE.Vector2(x, y)), 6), LL([0, 0, 0]));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      box("lantern", "bar", IRON, [0.012, 0.185, 0.012], LL([Math.cos(a) * 0.07, 0.125, Math.sin(a) * 0.07]));
    }
    put("lantern", "roof", IRON, new THREE.ConeGeometry(0.115, 0.075, 6), LL([0, 0.25, 0]));
    put("lantern", "capRing", IRON, new THREE.CylinderGeometry(0.09, 0.09, 0.016, 6), LL([0, 0.215, 0]));
    put("lantern", "ring", IRON, new THREE.TorusGeometry(0.028, 0.006, 4, 8), LL([0, 0.305, 0], [90, 0, 0]));
    put("lantern", "finial", BRASS, new THREE.SphereGeometry(0.013, 5, 4), LL([0, 0.29, 0]));
    glow(b.part(new THREE.CylinderGeometry(0.062, 0.068, 0.18, 6), "#ffb347", { bone: root, at: [ax, ly + 0.125 * 1.4, lz], scale: 1.4, name: "lanternGlass" }), 1.3);
  }

  // hanging sign on a bracket arm from the side wall
  {
    const sy = 1.96;
    const sz = 0.57;
    box("signArm", "plate", IRON, [0.02, 0.2, 0.1], mat([-1.225, sy - 0.07, sz]));
    for (const dy of [-0.14, 0.0]) sph("signArm", "bolt", STEEL, 0.012, 5, 3, mat([-1.213, sy + dy - 0.07, sz]));
    rod("signArm", "iron", IRON, [-1.225, sy, sz], [-0.62, sy, sz], 0.016, 6);
    rod("signArm", "strut", IRON, [-1.225, sy - 0.26, sz], [-0.95, sy - 0.01, sz], 0.012, 6);
    put("signArm", "scroll", IRON, new THREE.TorusGeometry(0.075, 0.008, 4, 12, Math.PI * 1.5), mul(mat([-1.07, sy - 0.1, sz], [0, 0, 0]), mat([0, 0, 0], [0, 0, 10])));
    sph("signArm", "tip", BRASS, 0.025, 6, 4, mat([-0.605, sy, sz]));
    const sj = b.joint("sign", { parent: root, at: [-0.98, sy, sz], dir: [0, -1, 0], role: "hinge" });
    bones.sign = sj;
    const bw = 0.56;
    const bh = 0.4;
    const by = sy - 0.12 - bh / 2;
    const bx = -0.98;
    for (const e of [-1, 1]) {
      for (let i = 0; i < 3; i++)
        put("signChain", "link", IRON, new THREE.TorusGeometry(0.012, 0.003, 4, 8), matQ(new THREE.Vector3(bx + e * 0.2, sy - 0.02 - i * 0.04, sz), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, (i % 2) * Math.PI * 0.5, 0)), [1, 1.6, 1]), "sign");
    }
    put("signBoard", "frame", W_DARK, new THREE.BoxGeometry(bw, bh, 0.05), mat([bx, by, sz]), "sign");
    for (const e of [-1, 1]) sph("signBoard", "eyelet", BRASS, 0.014, 5, 3, mat([bx + e * 0.2, by + bh / 2 + 0.005, sz]), "sign");
    for (const zz of [1, -1])
      b.part(new THREE.PlaneGeometry(bw - 0.03, bh - 0.03), "#ffffff", {
        bone: sj,
        at: [bx, by, sz + zz * 0.032],
        dir: [0, 0, zz],
        axis: "z",
        up: [0, 1, 0],
        texture: tSign,
        name: zz > 0 ? "signFront" : "signBack",
      });
  }

  // banner on the side wall
  {
    const bz = -0.55;
    const bw = 0.42;
    const bh = 0.78;
    const top = 2.0;
    rod("banner", "pole", W_DARK, [-1.24, top, bz - 0.28], [-1.24, top, bz + 0.28], 0.016, 6);
    for (const e of [-1, 1]) {
      sph("banner", "finial", BRASS, 0.026, 6, 4, mat([-1.24, top, bz + e * 0.29]));
      rod("banner", "cord", ROPE, [-1.27, top + 0.1, bz + e * 0.2], [-1.24, top, bz + e * 0.2], 0.004, 3);
    }
    rod("banner", "cordTop", ROPE, [-1.27, top + 0.1, bz - 0.2], [-1.27, top + 0.1, bz + 0.2], 0.004, 3);
    b.part(new THREE.PlaneGeometry(bw, bh), "#ffffff", { bone: root, at: [-1.285 + 0.0, top - bh / 2 - 0.02, bz], dir: [1, 0, 0], axis: "z", up: [0, 1, 0], texture: tBanner, name: "banner" });
    for (let i = 0; i < 4; i++) {
      const tz = bz - 0.15 + i * 0.1;
      rod("banner", "tassel", BRASS, [-1.28, top - bh - 0.0 + 0.1 - (i % 2) * 0.02, tz], [-1.28, top - bh - 0.06 - (i % 2) * 0.02, tz], 0.007, 4);
    }
  }

  // wall shelf with bottles above the keg rack
  {
    const sy = 1.6;
    box("shelf", "board", WOOD_LIGHT, [0.78, 0.04, 0.22], mat([1.0, sy, -1.17]));
    for (const x of [0.68, 1.32]) {
      b.extrude(
        [
          [0, 0],
          [0.18, 0],
          [0, 0.18],
        ],
        { at: [x, sy - 0.02 - 0.18, -1.28], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.03, color: IRON, bone: root, name: `shelfBracket${x}` },
      );
    }
    const cols = ["#2f8a4a", "#3a6fb0", "#c77a1e", "#8a2a4a"];
    const bxs = [0.78, 0.9, 1.12, 1.26];
    bxs.forEach((x, i) => {
      put("shelfBottles", `g${i}`, cols[i], bottleGeo(), mat([x, sy + 0.02, -1.15], [0, 0, 0], 0.78));
      cyl("shelfBottles", "cork", "#d2a265", 0.011, 0.013, 0.028, 6, mat([x, sy + 0.02 + 0.31, -1.15]));
    });
    mug("mugShelf", mat([1.01, sy + 0.02, -1.17], [0, 70, 0]), { paintC: PEWTER, band: false });
    cyl("shelfPlate", "clay", CLAY, 0.1, 0.07, 0.02, 12, mul(mat([1.0, sy + 0.12, -1.27]), mat([0, 0, 0], [90, 0, 0])));
    put("shelfPlate", "rim", CLAY, new THREE.TorusGeometry(0.095, 0.01, 4, 12), mat([1.0, sy + 0.12, -1.265]));
  }

  // chalkboard on the back wall
  {
    const cw = 0.78;
    const ch = 0.4;
    const cxx = -0.26;
    const cyy = 1.82;
    box("chalk", "frame", W_DARK, [cw + 0.08, ch + 0.08, 0.04], mat([cxx, cyy, -1.265]));
    b.part(new THREE.PlaneGeometry(cw, ch), "#ffffff", { bone: root, at: [cxx, cyy, -1.243], dir: [0, 0, 1], axis: "z", up: [0, 1, 0], texture: tChalk, name: "chalkboard" });
    box("chalk", "ledge", W_DARK, [0.5, 0.02, 0.05], mat([cxx, cyy - ch / 2 - 0.05, -1.24]));
    box("chalk", "stick", "#f1efe4", [0.05, 0.012, 0.012], mat([cxx + 0.1, cyy - ch / 2 - 0.034, -1.235], [0, 15, 0]));
  }

  // wanted poster beside the banner on the side wall
  b.part(new THREE.PlaneGeometry(0.2, 0.27), "#ffffff", { bone: root, at: [-1.285, 1.28, -0.1], dir: [1, 0, 0], axis: "z", up: [0, 1, 0], texture: tPoster, name: "poster" });
  for (const dy of [0.115]) sph("poster", "pin", "#c0392b", 0.012, 5, 3, mat([-1.27, 1.28 + dy, -0.1]));

  // crossed axes on a plaque above the open cask
  {
    const pc: V = [-1.275, 1.38, 0.98];
    put("plaque", "wood", W_DARK, new THREE.CylinderGeometry(0.2, 0.2, 0.03, 12), mul(mat(pc), mat([0, 0, 0], [0, 0, 90])));
    put("plaque", "rim", BRASS, new THREE.TorusGeometry(0.2, 0.011, 4, 16), mul(mat([pc[0] + 0.012, pc[1], pc[2]]), mat([0, 0, 0], [0, 90, 0])));
    const th = 38 * DEG;
    for (const s of [-1, 1]) {
      const d: V = [0, Math.cos(th), s * Math.sin(th)];
      const pp: V = [0, -s * Math.sin(th), Math.cos(th)];
      const start: V = [pc[0] + 0.025, pc[1] - d[1] * 0.3, pc[2] - d[2] * 0.3];
      const end: V = [start[0], start[1] + d[1] * 0.64, start[2] + d[2] * 0.64];
      rod("axes", "handle", WOOD_LIGHT, start, end, 0.014, 6);
      put("axes", "pommel", W_DARK, new THREE.SphereGeometry(0.02, 6, 4), mat(start));
      b.extrude(
        [
          [0.4, 0.0],
          [0.5, 0.0],
          [0.5, 0.045],
          [0.58, 0.16],
          [0.43, 0.1],
          [0.4, 0.05],
        ],
        { at: start, x: d, y: pp, thickness: 0.022, bevel: 0.005, smoothing: 0, color: STEELP, bone: root, name: `axeHead${s}` },
      );
      rod("axes", "binding", ROPE, [start[0], start[1] + d[1] * 0.2, start[2] + d[2] * 0.2], [start[0], start[1] + d[1] * 0.3, start[2] + d[2] * 0.3], 0.018, 6);
    }
  }
  // the outside of the tavern wears its name too
  box("outerSign", "frameBack", W_DARK, [1.16, 0.36, 0.02], mat([-0.42, 1.45, -1.458]));
  b.part(new THREE.PlaneGeometry(1.1, 0.3), "#ffffff", { bone: root, at: [-0.42, 1.45, -1.475], dir: [0, 0, -1], axis: "z", up: [0, 1, 0], texture: tSignWide, name: "outerSignBack" });
  box("outerSign", "frameSide", W_DARK, [0.02, 0.56, 0.74], mat([-1.458, 1.45, -0.37]));
  b.part(new THREE.PlaneGeometry(0.68, 0.51), "#ffffff", { bone: root, at: [-1.475, 1.45, -0.37], dir: [-1, 0, 0], axis: "z", up: [0, 1, 0], texture: tSign, name: "outerSignSide" });

  // cobwebs in the upper corner
  b.part(new THREE.PlaneGeometry(0.46, 0.46), "#ffffff", { bone: root, at: [-1.0, 1.96, -1.285], dir: [0, 0, 1], axis: "z", up: [0, 1, 0], texture: tWeb, name: "webBack" });
  b.part(new THREE.PlaneGeometry(0.46, 0.46), "#ffffff", { bone: root, at: [-1.285, 1.96, -1.0], dir: [1, 0, 0], axis: "z", up: [0, 1, 0], texture: tWeb, name: "webSide" });

  flush();
  return b.root;
}
