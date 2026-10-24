```ts
// STYLE: "DELFTWARE": the whole galleon is a piece of Dutch blue-and-white glazed
// porcelain. Everything is milk-white glaze painted in cobalt: fish-scale
// waterline, chain-and-diamond wale bands, striped spars, and sails that are
// hand-painted tile panels (skull wreath, anchor, little ships, tulips, compass
// star). Only the lantern glass and the stern windows glow, in cold porcelain light.
import * as THREE from "three";
import { createBuilder, frame, paint, mix, noise, smoothstep, stripes, scales, svg, catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Delftware Galleon",
  description:
    "A pirate galleon under full sail, fired as blue-and-white Delft porcelain: tile-painted sails, cobalt wales, glazed spars and glowing lanterns.",
};

// ---------------------------------------------------------------- palette
const WHITE = "#f5f7fa";
const GLAZE = "#e4ebf4";
const PALE = "#b9ccec";
const MID = "#5a7fd0";
const BLUE = "#2147a8";
const DEEP = "#122a78";
const INDIGO = "#0a1850";
const LIGHT = "#dff0ff";

// ---------------------------------------------------------------- helpers
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const clamp = (x: number, a: number, c: number) => Math.min(Math.max(x, a), c);
const fract = (x: number) => x - Math.floor(x);

/** Parametric surface, optionally double-sided (back copy has reversed winding). Front normal = du x (du+dv). */
function gridGeo(fn: (u: number, v: number) => THREE.Vector3, nu: number, nv: number, double = true) {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const row = nu + 1;
  for (let j = 0; j <= nv; j++)
    for (let i = 0; i <= nu; i++) {
      const p = fn(i / nu, j / nv);
      pos.push(p.x, p.y, p.z);
      uv.push(i / nu, j / nv);
    }
  const n = (nu + 1) * (nv + 1);
  for (let j = 0; j < nv; j++)
    for (let i = 0; i < nu; i++) {
      const a = j * row + i;
      const bb = a + 1;
      const c = a + row;
      const d = c + 1;
      idx.push(a, bb, d, a, d, c);
      if (double) idx.push(a + n, d + n, bb + n, a + n, c + n, d + n);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(double ? [...pos, ...pos] : pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(double ? [...uv, ...uv] : uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Quad from bottom-left, bottom-right, top-right, top-left. */
function quad(p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3, nv = 8) {
  return gridGeo((u, v) => p0.clone().lerp(p1, u).lerp(p3.clone().lerp(p2, u), v), 1, nv, true);
}

// ---------------------------------------------------------------- hull maths
const Z0 = -15;
const LEN = 30;
const N = 18;
const zOf = (t: number) => Z0 + LEN * t;
const FR = [0, 0.05, 0.2, 0.42, 0.62, 0.8, 1];
const WX = [0, 0.42, 0.78, 0.96, 1, 0.97, 0.86];

function beam(t: number) {
  const s = t < 0.4 ? 0.64 + 0.36 * Math.sin(((t / 0.4) * Math.PI) / 2) : 1 - 0.93 * Math.pow((t - 0.4) / 0.6, 1.7);
  return 4.5 * s;
}
function keel(t: number) {
  return 2.6 * Math.pow(clamp((t - 0.5) / 0.5, 0, 1), 2.2) + 1.3 * Math.pow(clamp((0.28 - t) / 0.28, 0, 1), 2);
}
function gun(t: number) {
  return 7.0 + 2.9 * smoothstep(0.34, 0.12, t) + 2.7 * smoothstep(0.68, 0.93, t);
}
function sideAt(t: number, f: number): [number, number] {
  const B = beam(t);
  const k = keel(t);
  const H = gun(t) - k;
  const ff = clamp(f, 0, 1);
  for (let i = 0; i < FR.length - 1; i++) {
    if (ff <= FR[i + 1]) {
      const q = (ff - FR[i]) / (FR[i + 1] - FR[i]);
      return [B * (WX[i] + (WX[i + 1] - WX[i]) * q), k + H * ff];
    }
  }
  return [B * WX[6], k + H];
}
const sideX = (t: number, y: number) => sideAt(t, (y - keel(t)) / (gun(t) - keel(t)))[0];

function ringAt(t: number): number[][] {
  const half = FR.map((f) => sideAt(t, f));
  return [...half.slice(1).reverse().map(([x, y]) => [-x, y]), ...half.map(([x, y]) => [x, y])];
}
function hullGeo(inner: boolean) {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const K = 13;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    ringAt(t).forEach(([x, y], k) => {
      pos.push(x, y, zOf(t));
      uv.push(k / (K - 1), t);
    });
  }
  for (let i = 0; i < N; i++)
    for (let k = 0; k < K - 1; k++) {
      const a = i * K + k;
      const bb = a + 1;
      const c = a + K;
      const d = c + 1;
      if (inner) idx.push(a, d, bb, a, c, d);
      else idx.push(a, bb, d, a, d, c);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
function capGeo(t: number, front: boolean) {
  const r = ringAt(t);
  const K = r.length;
  const z = zOf(t);
  const cy = r.reduce((s, p) => s + p[1], 0) / K;
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  r.forEach(([x, y]) => {
    pos.push(x, y, z);
    uv.push(x / 12 + 0.5, y / 14);
  });
  pos.push(0, cy, z);
  uv.push(0.5, cy / 14);
  for (let k = 0; k < K; k++) {
    const k2 = (k + 1) % K;
    if (front) idx.push(K, k, k2);
    else idx.push(K, k2, k);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
function deckGeo(tA: number, tB: number, y: number) {
  return gridGeo(
    (u, v) => {
      const t = tA + (tB - tA) * u;
      const w = sideX(t, y) - 0.06;
      return V(-w + 2 * w * v, y, zOf(t));
    },
    8,
    1,
    false,
  );
}

// ---------------------------------------------------------------- SVG drawings (cobalt on white)
const leafRing = (cx: number, cy: number, rx: number, ry: number, n: number, col: string, len: number) => {
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x = cx + rx * Math.cos(a);
    const y = cy + ry * Math.sin(a);
    const rot = (a * 180) / Math.PI + 90 + (i % 2 ? 28 : -28);
    s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(len * 0.28).toFixed(1)}" ry="${(len / 2).toFixed(1)}" fill="${col}" transform="rotate(${rot.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  return s;
};
const skullArt = (cx: number, cy: number, s: number, bone: string, face: string, ink: string) => `
<g transform="translate(${cx} ${cy}) scale(${s})">
 <path d="M-27 -20 L27 28 M27 -20 L-27 28" stroke="${ink}" stroke-width="12" stroke-linecap="round"/>
 <path d="M-27 -20 L27 28 M27 -20 L-27 28" stroke="${bone}" stroke-width="7" stroke-linecap="round"/>
 <g fill="${bone}" stroke="${ink}" stroke-width="2.4"><circle cx="-29" cy="-23" r="6.5"/><circle cx="29" cy="-23" r="6.5"/><circle cx="-29" cy="31" r="6.5"/><circle cx="29" cy="31" r="6.5"/></g>
 <path d="M-21 -4 C-25 -28 -10 -36 0 -36 C10 -36 25 -28 21 -4 C20 3 14 5 12 9 L12 19 L-12 19 L-12 9 C-14 5 -20 3 -21 -4Z" fill="${face}" stroke="${ink}" stroke-width="3.5" stroke-linejoin="round"/>
 <ellipse cx="-9" cy="-9" rx="6.5" ry="7.5" fill="${ink}"/><ellipse cx="9" cy="-9" rx="6.5" ry="7.5" fill="${ink}"/>
 <path d="M0 0 L-3.5 8 L3.5 8Z" fill="${ink}"/>
 <path d="M-6 12 V19 M0 12 V19 M6 12 V19" stroke="${ink}" stroke-width="2.2"/>
</g>`;
const anchorArt = (cx: number, cy: number, s: number, col: string) => `
<g transform="translate(${cx} ${cy}) scale(${s})" fill="none" stroke="${col}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round">
 <path d="M0 -28 V30"/><path d="M-15 -18 H15"/><circle cx="0" cy="-34" r="5.5"/>
 <path d="M-27 8 Q-25 32 0 32 Q25 32 27 8"/><path d="M-27 8 L-35 15 M27 8 L35 15"/>
</g>`;
const shipArt = (cx: number, cy: number, s: number, ink: string, sail: string) => `
<g transform="translate(${cx} ${cy}) scale(${s})">
 <path d="M-34 14 L34 14 L27 28 L-26 28Z" fill="${ink}"/>
 <path d="M-34 14 L-40 8 L-30 14Z" fill="${ink}"/>
 <path d="M0 -40 V14" stroke="${ink}" stroke-width="3.4"/>
 <path d="M-20 -28 Q-25 -10 -18 8 H18 Q25 -10 20 -28Z" fill="${sail}" stroke="${ink}" stroke-width="2.6"/>
 <path d="M-12 -40 H12 L9 -30 H-9Z" fill="${sail}" stroke="${ink}" stroke-width="2.4"/>
 <path d="M0 -40 L10 -46 L0 -50Z" fill="${ink}"/>
 <path d="M-52 36 q7 -7 14 0 t14 0 t14 0 t14 0 t14 0 t14 0 t14 0 t14 0" stroke="${ink}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
</g>`;
const tulipArt = (cx: number, cy: number, s: number, col: string) => `
<g transform="translate(${cx} ${cy}) scale(${s})" fill="${col}" stroke="${DEEP}" stroke-width="2.4" stroke-linejoin="round">
 <path d="M0 8 C-14 6 -16 -14 -8 -26 C-4 -18 0 -14 0 -10 C0 -14 4 -18 8 -26 C16 -14 14 6 0 8Z"/>
 <path d="M0 8 V36" fill="none" stroke-width="4"/>
 <path d="M0 30 C-16 28 -20 14 -24 8 C-10 12 -2 18 0 26Z"/><path d="M0 30 C16 28 20 14 24 8 C10 12 2 18 0 26Z"/>
</g>`;
const sunArt = (cx: number, cy: number, s: number, col: string) => {
  let rays = "";
  for (let i = 0; i < 12; i++)
    rays += `<path d="M-4 -20 L0 -34 L4 -20Z" fill="${col}" transform="rotate(${i * 30})"/>`;
  return `<g transform="translate(${cx} ${cy}) scale(${s})">${rays}<circle r="17" fill="${WHITE}" stroke="${col}" stroke-width="4"/>
  <path d="M-8 -3 q3 -4 6 0 M2 -3 q3 -4 6 0" stroke="${col}" stroke-width="2.6" fill="none"/><path d="M-7 6 q7 7 14 0" stroke="${col}" stroke-width="2.6" fill="none"/></g>`;
};
const compassArt = (cx: number, cy: number, s: number, col: string) => {
  let pts = "";
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const r = i % 2 ? 11 : i % 4 === 0 ? 36 : 24;
    pts += `${(Math.sin(a) * r).toFixed(1)},${(-Math.cos(a) * r).toFixed(1)} `;
  }
  return `<g transform="translate(${cx} ${cy}) scale(${s})"><circle r="30" fill="none" stroke="${col}" stroke-width="2.4"/>
  <polygon points="${pts}" fill="${col}" stroke="${DEEP}" stroke-width="1.6" stroke-linejoin="round"/><circle r="5" fill="${WHITE}"/></g>`;
};
const fan = (x: number, y: number, sx: number, sy: number, R: number) =>
  `<g transform="translate(${x} ${y}) scale(${sx} ${sy})"><path d="M0 0 H${R} A${R} ${R} 0 0 1 0 ${R}Z" fill="#e3ebf9" stroke="${BLUE}" stroke-width="1.6"/>
  <path d="M0 0 H${R * 0.66} A${R * 0.66} ${R * 0.66} 0 0 1 0 ${R * 0.66}Z" fill="none" stroke="${MID}" stroke-width="1.1"/>
  <circle cx="${R * 0.2}" cy="${R * 0.2}" r="${R * 0.1}" fill="${BLUE}"/></g>`;

function sailTex(w: number, h: number, art: (cx: number, cy: number, r: number) => string, cy = h / 2, rScale = 0.34) {
  const cx = w / 2;
  const r = Math.min(w, h) * rScale;
  let o = `<rect width="${w}" height="${h}" fill="${WHITE}"/>`;
  for (let k = 1; k < 6; k++) o += `<path d="M${((w * k) / 6).toFixed(1)} 0 V${h}" stroke="${PALE}" stroke-width="1.1"/>`;
  for (const yy of [0.2, 0.8]) o += `<path d="M0 ${h * yy} H${w}" stroke="${PALE}" stroke-width="1.1" stroke-dasharray="3 2.4"/>`;
  o += `<rect x="2.5" y="2.5" width="${w - 5}" height="${h - 5}" fill="none" stroke="${BLUE}" stroke-width="2.4"/>`;
  o += `<rect x="6" y="6" width="${w - 12}" height="${h - 12}" fill="none" stroke="${MID}" stroke-width="1"/>`;
  for (let x = 16; x < w - 12; x += 8)
    o += `<path d="M${x} 8.6 l2.4 2.4 -2.4 2.4 -2.4 -2.4z M${x} ${h - 13.4} l2.4 2.4 -2.4 2.4 -2.4 -2.4z" fill="${BLUE}"/>`;
  const R = Math.min(h * 0.3, 18);
  o += fan(6, 6, 1, 1, R) + fan(w - 6, 6, -1, 1, R) + fan(6, h - 6, 1, -1, R) + fan(w - 6, h - 6, -1, -1, R);
  o += `<circle cx="${cx}" cy="${cy}" r="${r + 1}" fill="#e3ebf9" stroke="${BLUE}" stroke-width="2.2"/>`;
  o += `<circle cx="${cx}" cy="${cy}" r="${r - 2.6}" fill="none" stroke="${MID}" stroke-width="1.1" stroke-dasharray="2.6 2"/>`;
  o += leafRing(cx, cy, r + 4.6, r + 4.6, 20, MID, 6.5);
  o += art(cx, cy, r);
  return svg(`<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${o}</svg>`, { size: 512 });
}

// ---------------------------------------------------------------- the module
export default function build() {
  const b = createBuilder({ name: "delft_galleon", paintSize: 2048 });

  // ---- textures
  const T_MAIN = sailTex(126, 60, (cx, cy, r) => skullArt(cx, cy + 1, r / 38, WHITE, WHITE, DEEP));
  const T_FORE = sailTex(124, 50, (cx, cy, r) => anchorArt(cx, cy, r / 38, BLUE));
  const T_TOP = sailTex(120, 52, (cx, cy, r) => shipArt(cx, cy + 3, r / 52, BLUE, WHITE));
  const T_TG = sailTex(100, 52, (cx, cy, r) => tulipArt(cx, cy - 1, r / 34, MID));
  const T_SPRIT = sailTex(100, 54, (cx, cy, r) => sunArt(cx, cy, r / 36, BLUE));
  const T_LATEEN = sailTex(100, 100, (cx, cy, r) => compassArt(cx, cy, r / 36, BLUE), 62, 0.26);
  let jibStripes = "";
  for (let y = 4; y < 96; y += 11)
    jibStripes += `<path d="M2 ${y} L30 ${y + 11} L58 ${y}" fill="none" stroke="${(y / 11) % 2 < 1 ? BLUE : MID}" stroke-width="3.2" stroke-linejoin="round"/>`;
  const T_JIB = svg(
    `<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="100" fill="${WHITE}"/>${jibStripes}
     <rect x="1.5" y="1.5" width="57" height="97" fill="none" stroke="${DEEP}" stroke-width="3"/>
     <circle cx="30" cy="42" r="13" fill="${WHITE}" stroke="${BLUE}" stroke-width="2.4"/>${compassArt(30, 42, 0.3, BLUE)}</svg>`,
    { size: 384 },
  );
  const T_FLAG = svg(
    `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="40" fill="${DEEP}"/>
     <rect x="2" y="2" width="56" height="36" fill="none" stroke="${MID}" stroke-width="1.4" stroke-dasharray="3.5 2.5"/>
     ${skullArt(30, 21, 0.5, WHITE, WHITE, DEEP)}</svg>`,
    { size: 384 },
  );
  const T_PENNANT = svg(
    `<svg viewBox="0 0 100 16" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 L100 5 L80 8 L100 11 L0 16Z" fill="${BLUE}" stroke="${DEEP}" stroke-width="1.5" stroke-linejoin="round"/>
     <circle cx="12" cy="8" r="3" fill="${WHITE}"/><circle cx="26" cy="8" r="2.6" fill="${WHITE}"/><circle cx="40" cy="8" r="2.2" fill="${WHITE}"/><circle cx="53" cy="8" r="1.8" fill="${WHITE}"/></svg>`,
    { size: 384 },
  );
  let rungs = "";
  for (let y = 6; y < 126; y += 7) rungs += `<path d="M3 ${y} H61" stroke="${DEEP}" stroke-width="2.3"/>`;
  const T_LADDER = svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg"><path d="M3 0 V128 M61 0 V128" stroke="${DEEP}" stroke-width="3.4"/>${rungs}</svg>`,
    { size: 256 },
  );
  const T_WINDOW = svg(
    `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
     <path d="M2 59 V22 A18 18 0 0 1 38 22 V59Z" fill="${BLUE}"/>
     <path d="M7 55 V22 A13 13 0 0 1 33 22 V55Z" fill="${LIGHT}"/>
     <path d="M20 9 V55 M7 30 H33 M7 43 H33" stroke="${DEEP}" stroke-width="2.4"/>
     <path d="M10 24 L15 16" stroke="${WHITE}" stroke-width="2.4" stroke-linecap="round"/>
     <rect x="0" y="55" width="40" height="5" fill="${DEEP}"/></svg>`,
    { size: 256 },
  );
  const T_PLAQUE = svg(
    `<svg viewBox="0 0 100 64" xmlns="http://www.w3.org/2000/svg">
     <ellipse cx="50" cy="32" rx="48" ry="30" fill="${WHITE}" stroke="${BLUE}" stroke-width="3"/>
     <ellipse cx="50" cy="32" rx="40" ry="23" fill="#e3ebf9" stroke="${MID}" stroke-width="1.4"/>
     ${leafRing(50, 32, 44, 26.5, 26, MID, 6)}
     ${sunArt(78, 17, 0.2, BLUE)}${shipArt(48, 28, 0.42, BLUE, WHITE)}
     <path d="M2 32 q-3 -9 5 -12 M98 32 q3 -9 -5 -12" stroke="${BLUE}" stroke-width="2.6" fill="none"/></svg>`,
    { size: 512 },
  );

  // ---- paints
  const SCALE_SKIN = scales([PALE, "#a8c0ea", "#c9d8f2"], MID, { size: 0.85, width: 0.2, seed: 5 });
  const hullPaint = paint((p) => {
    const t = clamp((p.z - Z0) / LEN, 0, 1);
    const k = keel(t);
    const H = gun(t) - k;
    const y = p.y - k;
    const f = y / H + (noise(p, 1.3, 3) - 0.5) * 0.012;
    if (f < 0.34) return SCALE_SKIN;
    if (f >= 0.42 && f < 0.48) return Math.abs(fract(p.z / 1.1) - 0.5) < 0.2 ? WHITE : BLUE;
    if (f >= 0.8 && f < 0.86) return DEEP;
    if (f >= 0.96) return BLUE;
    if (f >= 0.86) {
      const a = Math.abs(fract(p.z / 1.3) - 0.5) * 2.2;
      const c = Math.abs((f - 0.91) / 0.05);
      return a + c < 1 ? BLUE : a + c < 1.2 ? MID : WHITE;
    }
    if (fract(y / 0.55) < 0.07) return PALE;
    const base = Math.floor(y / 0.55) % 2 ? GLAZE : WHITE;
    return mix(base, "#d3def2", 0.3 * noise(p, 0.9, 5));
  });
  const innerPaint = paint((p) =>
    fract(p.y / 0.45) < 0.08 ? MID : mix(PALE, WHITE, 0.55 + 0.25 * noise(p, 0.8, 7)),
  );
  const deckPaint = paint((p) => {
    if (fract(p.x / 0.5) < 0.06) return MID;
    if (fract(p.z / 3.1) < 0.012) return PALE;
    return (Math.floor(p.x / 0.5) % 2 + 2) % 2 ? GLAZE : mix(WHITE, PALE, 0.15 * noise(p, 0.7, 2));
  });
  const wallPaint = paint((p, n) => {
    const [u, v] = Math.abs(n.x) > 0.5 ? [p.z, p.y] : Math.abs(n.y) > 0.5 ? [p.x, p.z] : [p.x, p.y];
    if (fract(u / 0.9) < 0.05 || fract(v / 0.9) < 0.05) return PALE;
    if (fract(u / 0.9) < 0.1 && fract(v / 0.9) < 0.1) return BLUE;
    return mix(WHITE, GLAZE, noise(p, 0.9, 9));
  });
  const MAST = stripes(WHITE, BLUE, { size: 1.5, axis: "y", width: 0.16, wobble: 0.04, seed: 2 });
  const YARD = stripes(WHITE, BLUE, { size: 1.3, axis: "x", width: 0.16, wobble: 0.04, seed: 4 });
  const RAIL = stripes(BLUE, WHITE, { size: 0.9, axis: "z", width: 0.45, wobble: 0, seed: 6 });
  const KEG = stripes(WHITE, BLUE, { size: 0.32, axis: "y", width: 0.3, wobble: 0, seed: 8 });

  // ---------------------------------------------------------------- hull
  b.part(hullGeo(false), hullPaint, { at: [0, 0, 0], flat: true, name: "hull" });
  b.part(hullGeo(true), innerPaint, { at: [0, 0, 0], flat: true, name: "hullInner" });
  b.part(capGeo(0, false), hullPaint, { at: [0, 0, 0], flat: true, name: "sternCap" });
  b.part(capGeo(1, true), hullPaint, { at: [0, 0, 0], flat: true, name: "bowCap" });

  // keel following the underside
  const keelPts: number[][] = [];
  for (let i = 0; i <= N; i++) keelPts.push([0, keel(i / N) + 0.03, zOf(i / N)]);
  b.sweep(catmull(keelPts), (): [number, number] => [0.2, 0.26], { section: "box", color: BLUE, caps: "flat", name: "keel" });

  // gunwale rails and wales
  for (const s of [1, -1]) {
    const gun_: number[][] = [];
    const wale1: number[][] = [];
    const wale2: number[][] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const g = sideAt(t, 1);
      gun_.push([s * g[0], g[1] + 0.05, zOf(t)]);
      const w1 = sideAt(t, 0.45);
      wale1.push([s * (w1[0] + 0.03), w1[1], zOf(t)]);
      const w2 = sideAt(t, 0.83);
      wale2.push([s * (w2[0] + 0.03), w2[1], zOf(t)]);
    }
    b.sweep(catmull(gun_), (): [number, number] => [0.3, 0.15], { section: "box", color: RAIL, caps: "flat", name: "gunwale" });
    b.sweep(catmull(wale1), (): [number, number] => [0.11, 0.17], { section: "box", color: RAIL, caps: "flat", name: "wale" });
    b.sweep(catmull(wale2), (): [number, number] => [0.11, 0.15], { section: "box", color: DEEP, caps: "flat", name: "wale" });
  }
  {
    const g0 = sideAt(0, 1);
    b.rod([-g0[0], g0[1] + 0.05, Z0], [g0[0], g0[1] + 0.05, Z0], 0.17, BLUE);
  }

  // gun ports + cannon
  for (let k = 0; k < 8; k++) {
    const t = 0.24 + k * 0.07;
    const [xs, ys] = sideAt(t, 0.62);
    const z = zOf(t);
    for (const s of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.5, 1.2, 1.3), BLUE, { at: [s * (xs + 0.05), ys, z], name: "portFrame" });
      b.part(new THREE.BoxGeometry(0.5, 0.88, 0.98), INDIGO, { at: [s * (xs + 0.1), ys, z], name: "port" });
      b.rod([s * (xs - 0.1), ys - 0.05, z], [s * (xs + 0.85), ys + 0.04, z], [0.2, 0.17], DEEP, { sides: 8 });
      b.rod([s * (xs + 0.78), ys + 0.04, z], [s * (xs + 0.95), ys + 0.05, z], 0.24, WHITE, { sides: 8 });
    }
  }

  // ---------------------------------------------------------------- decks
  b.part(deckGeo(0.3, 0.72, 5.6), deckPaint, { at: [0, 0, 0], name: "deckWaist" });
  b.part(deckGeo(0, 0.3, 8.4), deckPaint, { at: [0, 0, 0], name: "deckQuarter" });
  b.part(deckGeo(0.72, 1, 8.1), deckPaint, { at: [0, 0, 0], name: "deckFore" });
  const wQ = sideX(0.3, 7) - 0.08;
  const wF = sideX(0.72, 7) - 0.08;
  b.part(new THREE.BoxGeometry(wQ * 2, 2.8, 0.3), wallPaint, { at: [0, 7.0, -6.15], name: "riserQuarter" });
  b.part(new THREE.BoxGeometry(wF * 2, 2.5, 0.3), wallPaint, { at: [0, 6.85, 6.75], name: "riserFore" });
  const win = (x: number, y: number, z: number, w: number, h: number, dz: number, g = 0.7) =>
    glow(
      b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at: [x, y, z], dir: [0, 0, dz], axis: "z", texture: T_WINDOW, name: "window" }),
      g,
    );
  for (const x of [-2.2, -0.9, 0.9, 2.2]) {
    win(x, 7.0, -5.97, 0.9, 1.35, 1);
    win(x * 0.9, 6.85, 6.57, 0.9, 1.35, -1);
  }
  const balustrade = (a: number[], c: number[], n: number, h: number) => {
    b.rod([a[0], a[1] + h, a[2]], [c[0], c[1] + h, c[2]], 0.1, BLUE, { sides: 6 });
    b.rod([a[0], a[1] + h * 0.5, a[2]], [c[0], c[1] + h * 0.5, c[2]], 0.06, MID, { sides: 4 });
    for (let i = 0; i <= n; i++) {
      const q = i / n;
      const x = a[0] + (c[0] - a[0]) * q;
      const z = a[2] + (c[2] - a[2]) * q;
      b.rod([x, a[1], z], [x, a[1] + h, z], 0.09, WHITE, { sides: 6 });
    }
  };
  balustrade([-wQ + 0.3, 8.4, -6.0], [wQ - 0.3, 8.4, -6.0], 14, 1.0);
  balustrade([-wF + 0.3, 8.1, 6.6], [wF - 0.3, 8.1, 6.6], 12, 1.0);

  // ---------------------------------------------------------------- stern castle
  b.part(new THREE.BoxGeometry(4.9, 2.6, 1.1), wallPaint, { at: [0, 7.3, -15.55], name: "gallery" });
  b.part(new THREE.BoxGeometry(5.3, 0.25, 1.5), DEEP, { at: [0, 8.7, -15.6], name: "galleryRoof" });
  b.part(new THREE.BoxGeometry(5.3, 0.25, 1.5), DEEP, { at: [0, 5.95, -15.6], name: "galleryFloor" });
  for (const x of [-1.55, 0, 1.55]) win(x, 7.3, -16.12, 1.1, 1.7, -1, 0.9);
  b.part(new THREE.BoxGeometry(4.4, 2.9, 4.2), wallPaint, { at: [0, 9.85, -12.9], name: "cabin1" });
  b.part(new THREE.BoxGeometry(5.0, 0.3, 4.6), DEEP, { at: [0, 11.45, -12.9], name: "cabin1Roof" });
  for (const x of [-1.4, 1.4]) win(x, 9.75, -10.77, 0.95, 1.5, 1, 0.9);
  win(0, 9.65, -10.77, 1.0, 1.7, 1, 0.5);
  for (const x of [-1.2, 1.2]) win(x, 10.75, -15.02, 0.8, 1.0, -1, 0.9);
  b.part(new THREE.BoxGeometry(3.6, 2.2, 3.0), wallPaint, { at: [0, 12.7, -13.2], name: "cabin2" });
  b.part(new THREE.BoxGeometry(4.0, 0.25, 3.4), DEEP, { at: [0, 13.9, -13.2], name: "cabin2Roof" });
  b.part(new THREE.PlaneGeometry(3.0, 1.9), "#ffffff", { at: [0, 12.7, -14.72], dir: [0, 0, -1], axis: "z", texture: T_PLAQUE, name: "plaque" });
  win(-1.0, 12.7, -11.68, 0.7, 1.1, 1, 0.9);
  win(1.0, 12.7, -11.68, 0.7, 1.1, 1, 0.9);
  balustrade([-2.4, 11.6, -10.9], [2.4, 11.6, -10.9], 8, 0.9);
  balustrade([-2.4, 11.6, -14.9], [2.4, 11.6, -14.9], 8, 0.9);
  for (const s of [1, -1]) balustrade([s * 2.4, 11.6, -10.9], [s * 2.4, 11.6, -14.9], 6, 0.9);

  const lantern = (x: number, y: number, z: number, sc: number) => {
    b.part(new THREE.CylinderGeometry(0.34 * sc, 0.42 * sc, 0.3 * sc, 6), BLUE, { at: [x, y + 0.15 * sc, z], name: "lanternBase" });
    glow(b.part(new THREE.CylinderGeometry(0.36 * sc, 0.3 * sc, 1.0 * sc, 6), LIGHT, { at: [x, y + 0.8 * sc, z], name: "lanternGlass" }), 1.3);
    b.part(new THREE.ConeGeometry(0.55 * sc, 0.5 * sc, 6), DEEP, { at: [x, y + 1.55 * sc, z], name: "lanternCap" });
    b.part(new THREE.SphereGeometry(0.12 * sc, 6, 4), BLUE, { at: [x, y + 1.9 * sc, z] });
  };
  for (const s of [1, -1]) {
    b.rod([s * 2.3, 11.6, -14.6], [s * 2.3, 13.0, -14.6], 0.12, MAST, { sides: 6 });
    lantern(s * 2.3, 13.0, -14.6, 0.9);
  }
  b.rod([0, 14.0, -14.0], [0, 15.4, -14.0], 0.14, MAST, { sides: 6 });
  lantern(0, 15.4, -14.0, 1.5);
  // ensign staff
  b.rod([0, 14.0, -12.6], [0, 17.2, -14.8], [0.12, 0.08], MAST, { sides: 6 });

  // helm
  b.part(new THREE.BoxGeometry(0.6, 1.3, 0.6), BLUE, { at: [0, 9.05, -8.8], name: "helmStand" });
  b.part(new THREE.TorusGeometry(0.85, 0.08, 5, 14), WHITE, { at: [0, 9.9, -8.8], name: "wheelRim" });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.rod([0, 9.9, -8.8], [Math.sin(a) * 1.15, 9.9 + Math.cos(a) * 1.15, -8.8], 0.055, BLUE, { sides: 4 });
  }
  b.part(new THREE.SphereGeometry(0.2, 6, 4), DEEP, { at: [0, 9.9, -8.8] });

  // rudder
  b.frustumBox([0, 6.0, -15.55], [0, 0.9, -15.55], [0.35, 1.2], [0.35, 1.8], { color: BLUE, name: "rudder" });

  // ---------------------------------------------------------------- bow: beakhead, figurehead, anchors
  b.sweep(catmull([[0, 2.8, 14.9], [0, 4.6, 16.0], [0, 6.4, 17.1], [0, 7.5, 18.0]]), (t: number): [number, number] => [0.24 - 0.06 * t, 0.5 - 0.2 * t], {
    section: "box",
    color: BLUE,
    caps: "flat",
    name: "beakhead",
  });
  b.rod([0, 8.3, 9.5], [0, 12.7, 25.6], [0.44, 0.2], MAST, { name: "bowsprit" });
  b.part(new THREE.SphereGeometry(0.28, 6, 4), BLUE, { at: [0, 12.8, 25.8] });

  const lion = (x: number, y: number, z: number, sc: number) => {
    b.part(new THREE.SphereGeometry(0.9 * sc, 8, 6), WHITE, { at: [x, y, z], flat: true, name: "lionHead" });
    b.part(new THREE.BoxGeometry(0.7 * sc, 0.5 * sc, 0.8 * sc), WHITE, { at: [x, y - 0.3 * sc, z + 0.85 * sc], name: "lionSnout" });
    b.part(new THREE.BoxGeometry(0.3 * sc, 0.22 * sc, 0.22 * sc), DEEP, { at: [x, y - 0.1 * sc, z + 1.28 * sc] });
    b.part(new THREE.BoxGeometry(0.62 * sc, 0.2 * sc, 0.7 * sc), BLUE, { at: [x, y - 0.72 * sc, z + 0.8 * sc], rotation: [10, 0, 0], name: "lionJaw" });
    for (const s of [1, -1]) {
      b.part(new THREE.SphereGeometry(0.15 * sc, 6, 4), DEEP, { at: [s * 0.36 * sc, y + 0.2 * sc, z + 0.78 * sc], name: "lionEye" });
      b.part(new THREE.BoxGeometry(0.36 * sc, 0.08 * sc, 0.2 * sc), BLUE, { at: [s * 0.36 * sc, y + 0.42 * sc, z + 0.8 * sc], rotation: [0, 0, s * -14] });
      b.part(new THREE.SphereGeometry(0.22 * sc, 6, 4), BLUE, { at: [s * 0.72 * sc, y + 0.7 * sc, z - 0.1 * sc], name: "lionEar" });
      b.part(new THREE.ConeGeometry(0.06 * sc, 0.2 * sc, 4), WHITE, { at: [s * 0.18 * sc, y - 0.55 * sc, z + 1.1 * sc], rotation: [180, 0, 0] });
    }
    b.ring(frame([x, y, z - 0.1 * sc], [0, 0, 1]), { count: 12, radius: 0.85 * sc, tilt: -30 }, (it) =>
      b.spike(it, it, 1.0 * sc, 0.28 * sc, { color: BLUE, sides: 4 }),
    );
    b.ring(frame([x, y, z - 0.25 * sc], [0, 0, 1]), { count: 10, radius: 0.6 * sc, fromDeg: 18, toDeg: 18 + 324, tilt: -45 }, (it) =>
      b.spike(it, it, 0.95 * sc, 0.24 * sc, { color: MID, sides: 4 }),
    );
  };
  lion(0, 7.9, 18.6, 1.0);

  for (const s of [1, -1]) {
    const t = 0.8;
    const [x, y] = sideAt(t, 0.72);
    const z = zOf(t);
    const ax = s * (x + 0.4);
    b.rod([ax, y + 1.4, z], [ax, y - 1.3, z], 0.12, DEEP, { sides: 6 });
    b.rod([ax, y + 1.0, z - 0.75], [ax, y + 1.0, z + 0.75], 0.1, DEEP, { sides: 6 });
    b.rod([ax, y - 1.3, z], [ax, y - 0.8, z - 0.95], 0.1, DEEP, { sides: 6 });
    b.rod([ax, y - 1.3, z], [ax, y - 0.8, z + 0.95], 0.1, DEEP, { sides: 6 });
    for (const q of [-1, 1])
      b.part(new THREE.ConeGeometry(0.2, 0.45, 4), BLUE, { at: [ax, y - 0.7, z + q * 1.0], rotation: [0, 0, 0], name: "fluke" });
    b.part(new THREE.TorusGeometry(0.22, 0.05, 5, 8), DEEP, { at: [ax, y + 1.65, z], dir: [1, 0, 0], axis: "z" });
  }

  // ---------------------------------------------------------------- spars
  const yard = (z: number, y: number, len: number, r = 0.2) => {
    for (const s of [1, -1]) {
      b.rod([0, y, z], [(s * len) / 2, y, z], [r, r * 0.45], YARD, { sides: 6 });
      b.part(new THREE.ConeGeometry(r * 0.5, r * 2.2, 6), DEEP, { at: [(s * (len + 0.4)) / 2, y, z], rotation: [0, 0, -s * 90] });
    }
    b.part(new THREE.SphereGeometry(r * 1.4, 6, 4), BLUE, { at: [0, y, z - 0.3] });
  };
  const platform = (z: number, y: number, rad: number) => {
    b.lathe([[0, 0], [rad, 0], [rad * 1.08, 0.25], [rad * 1.08, 0.5], [rad * 0.9, 0.5], [0, 0.4]], { at: [0, y, z], segments: 10, color: BLUE, name: "top" });
    b.lathe([[0.2, 0], [rad * 1.08, 0], [rad * 1.08, 0.12], [0.2, 0.12]], { at: [0, y + 0.5, z], segments: 10, color: WHITE });
  };
  const squareSail = (z: number, yHead: number, h: number, wTop: number, wBot: number, belly: number, tex: THREE.Texture, name: string) =>
    b.part(
      gridGeo((u, v) => {
        const w = wBot + (wTop - wBot) * v;
        const f = Math.pow(Math.sin(Math.PI * v), 0.55) * Math.pow(Math.sin(Math.PI * u), 0.85);
        return V((u - 0.5) * w * (1 - 0.05 * f), yHead - h + h * v + 0.6 * Math.sin(Math.PI * u) * (1 - v) * (1 - v), z + belly * f);
      }, 8, 6, true),
      "#ffffff",
      { at: [0, 0, 0], texture: tex, flat: true, name },
    );
  const triSail = (A: THREE.Vector3, B: THREE.Vector3, C: THREE.Vector3, belly: number, tex: THREE.Texture, name: string) =>
    b.part(
      gridGeo((u, v) => {
        const vp = 1 - v;
        const P = A.clone().lerp(B, u).lerp(C, vp);
        P.x += belly * Math.pow(Math.sin(Math.PI * u), 0.8) * Math.pow(Math.sin(Math.PI * vp), 0.6);
        return P;
      }, 10, 6, true),
      "#ffffff",
      { at: [0, 0, 0], texture: tex, flat: true, name },
    );
  const flag = (x: number, y: number, z: number, L: number, H: number, tex: THREE.Texture, amp = 0.4) =>
    b.part(
      gridGeo((u, v) => V(x + amp * u * Math.sin(u * 6.5), y + v * H + 0.15 * u * Math.sin(u * 5), z - u * L), 10, 2, true),
      "#ffffff",
      { at: [0, 0, 0], texture: tex, flat: true, name: "flag" },
    );
  const shrouds = (zc: number, yTop: number, spread: number, hz: number, topHz: number) => {
    const t = (zc - Z0) / LEN;
    const [gx, gy] = sideAt(t, 1);
    for (const s of [1, -1])
      b.part(quad(V(s * gx, gy + 0.1, zc - hz), V(s * gx, gy + 0.1, zc + hz), V(s * spread, yTop, zc + topHz), V(s * spread, yTop, zc - topHz), 10), "#ffffff", {
        at: [0, 0, 0],
        texture: T_LADDER,
        name: "shrouds",
      });
  };
  const upperShrouds = (zc: number, yA: number, yB: number, spreadA: number, spreadB: number) => {
    for (const s of [1, -1])
      b.part(quad(V(s * spreadA, yA, zc - 0.7), V(s * spreadA, yA, zc + 0.7), V(s * spreadB, yB, zc + 0.15), V(s * spreadB, yB, zc - 0.15), 8), "#ffffff", {
        at: [0, 0, 0],
        texture: T_LADDER,
        name: "upperShrouds",
      });
  };

  // main mast
  const ZM = 0.5;
  b.rod([0, 5.4, ZM], [0, 20.4, ZM], [0.62, 0.44], MAST, { name: "mainMast" });
  b.rod([0, 19.0, ZM], [0, 28.8, ZM], [0.34, 0.22], MAST, { name: "mainTopmast" });
  b.rod([0, 27.8, ZM], [0, 36.0, ZM], [0.22, 0.1], MAST, { name: "mainTopgallant" });
  b.part(new THREE.SphereGeometry(0.3, 6, 4), BLUE, { at: [0, 36.2, ZM] });
  platform(ZM, 19.6, 2.3);
  yard(ZM + 0.9, 17.8, 21.0, 0.24);
  yard(ZM + 0.9, 26.5, 15.6, 0.2);
  yard(ZM + 0.9, 32.2, 10.0, 0.15);
  squareSail(ZM + 0.9, 17.7, 9.1, 20, 22, 1.7, T_MAIN, "mainCourse");
  squareSail(ZM + 0.9, 26.4, 6.0, 14.8, 17.4, 1.5, T_TOP, "mainTopsail");
  squareSail(ZM + 0.9, 32.1, 5.1, 9.5, 11.4, 1.2, T_TG, "mainTopgallantSail");
  shrouds(ZM, 19.6, 1.9, 1.6, 0.6);
  upperShrouds(ZM, 20.0, 28.5, 1.7, 0.35);
  flag(0, 33.2, ZM, 5.4, 3.0, T_FLAG, 0.45);

  // fore mast
  const ZF = 3.4;
  b.rod([0, 5.4, ZF], [0, 17.8, ZF], [0.58, 0.4], MAST, { name: "foreMast" });
  b.rod([0, 16.5, ZF], [0, 25.8, ZF], [0.32, 0.2], MAST, { name: "foreTopmast" });
  b.rod([0, 25.0, ZF], [0, 31.0, ZF], [0.2, 0.09], MAST, { name: "foreTopgallant" });
  b.part(new THREE.SphereGeometry(0.26, 6, 4), BLUE, { at: [0, 31.2, ZF] });
  platform(ZF, 17.0, 2.1);
  yard(ZF + 0.9, 16.0, 17.5, 0.22);
  yard(ZF + 0.9, 23.6, 13.2, 0.18);
  yard(ZF + 0.9, 28.4, 8.6, 0.14);
  squareSail(ZF + 0.9, 15.9, 6.0, 16.6, 18.5, 1.5, T_FORE, "foreCourse");
  squareSail(ZF + 0.9, 23.5, 5.4, 12.6, 14.8, 1.3, T_SPRIT, "foreTopsail");
  squareSail(ZF + 0.9, 28.3, 4.2, 8.2, 9.8, 1.0, T_TG, "foreTopgallantSail");
  shrouds(ZF, 17.0, 1.7, 1.4, 0.55);
  upperShrouds(ZF, 17.4, 25.6, 1.5, 0.32);
  flag(0, 30.2, ZF, 5.0, 1.0, T_PENNANT, 0.5);

  // mizzen mast + lateen
  const ZZ = -7.6;
  b.rod([0, 8.2, ZZ], [0, 19.6, ZZ], [0.5, 0.34], MAST, { name: "mizzenMast" });
  b.rod([0, 18.6, ZZ], [0, 24.6, ZZ], [0.3, 0.12], MAST, { name: "mizzenTop" });
  b.part(new THREE.SphereGeometry(0.24, 6, 4), BLUE, { at: [0, 24.8, ZZ] });
  platform(ZZ, 18.2, 1.7);
  shrouds(ZZ, 18.2, 1.4, 1.3, 0.5);
  b.rod([0, 11.6, -2.6], [0, 22.2, -13.4], [0.26, 0.12], YARD, { name: "lateenYard" });
  triSail(V(0, 11.5, -2.7), V(0, 22.0, -13.3), V(0, 15.2, -14.6), 1.6, T_LATEEN, "lateen");
  flag(0, 24.9, ZZ, 4.6, 0.9, T_PENNANT, 0.5);
  flag(0, 16.6, -14.8, 3.8, 2.3, T_FLAG, 0.4);

  // bowsprit rig
  b.rod([0, 10.5, 19.8], [0, 14.6, 19.8], 0.17, MAST, { sides: 6 });
  yard(19.9, 10.9, 8.2, 0.14);
  squareSail(19.9, 10.8, 4.2, 7.6, 8.4, 0.9, T_SPRIT, "spritsail");
  triSail(V(0, 12.4, 25.2), V(0, 25.0, 4.3), V(0, 14.2, 11.5), 0.9, T_JIB, "jib");
  triSail(V(0, 10.3, 17.0), V(0, 22.4, 6.2), V(0, 10.6, 9.3), -0.9, T_JIB, "staysail");
  b.rod([0, 12.4, 25.2], [0, 25.2, ZF + 0.9], 0.07, DEEP, { sides: 4 });
  b.rod([0, 10.3, 17.0], [0, 22.6, 6.0], 0.07, DEEP, { sides: 4 });
  b.rod([0, 22.6, 6.0], [0, 25.6, ZF + 0.2], 0.07, DEEP, { sides: 4 });

  // stays between the masts
  b.rod([0, 28.6, ZM], [0, 25.6, ZF], 0.07, DEEP, { sides: 4 });
  b.rod([0, 24.4, ZZ], [0, 28.4, ZM], 0.07, DEEP, { sides: 4 });
  b.rod([0, 36.0, ZM], [0, 14.0, -14.0], 0.06, DEEP, { sides: 4 });
  b.rod([0, 31.0, ZF], [0, 12.7, 25.6], 0.06, DEEP, { sides: 4 });

  // ---------------------------------------------------------------- deck furniture
  const keg = (x: number, y: number, z: number) => {
    b.part(new THREE.CylinderGeometry(0.42, 0.42, 0.95, 8), KEG, { at: [x, y + 0.47, z], name: "keg" });
    b.part(new THREE.CylinderGeometry(0.44, 0.44, 0.08, 8), BLUE, { at: [x, y + 0.2, z] });
    b.part(new THREE.CylinderGeometry(0.44, 0.44, 0.08, 8), BLUE, { at: [x, y + 0.75, z] });
  };
  keg(-2.4, 5.6, 1.9);
  keg(-1.7, 5.6, 2.5);
  keg(2.2, 5.6, -1.4);
  keg(2.4, 5.6, 6.0 - 1.0);
  keg(-3.0, 8.1, 8.2);
  keg(-2.3, 8.1, 8.6);
  b.part(new THREE.BoxGeometry(2.2, 0.3, 2.4), stripes(WHITE, BLUE, { size: 0.3, axis: "x", width: 0.5, wobble: 0, seed: 12 }), { at: [0, 5.75, -2.8], name: "hatch" });
  b.lathe([[0, 0], [0.7, 0], [0.55, 0.3], [0.5, 0.8], [0.75, 1.0], [0, 1.0]], { at: [0, 5.6, 1.8], segments: 8, color: BLUE, name: "capstan" });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI;
    b.rod([-Math.cos(a) * 1.5, 6.4, 1.8 - Math.sin(a) * 1.5], [Math.cos(a) * 1.5, 6.4, 1.8 + Math.sin(a) * 1.5], 0.07, WHITE, { sides: 4 });
  }

  return b.root;
}
```