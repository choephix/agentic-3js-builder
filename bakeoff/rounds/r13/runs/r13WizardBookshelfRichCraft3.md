```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, rng, svg, mottle, grain, scales, stripes, mix, spiral, frame } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { cel } from "agentic-3js-builder/kits/toon";
import { metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Wizard's Bookshelf",
  description:
    "A tall gothic high-fantasy bookshelf: twisted gilded columns, a starry back panel, leather tomes with rune spines, scroll piles and an urn of scrolls, glowing orbs and potions, melted candles, an open spellbook with a floating sigil, and a little wizard-hat owl.",
};

const D = Math.PI / 180;
type V = [number, number, number];
type PO = { rot?: V; texture?: THREE.Texture; flat?: boolean; scale?: V; glow?: number; opt?: any };

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const skyMarkup = () => {
  const r = rng(5);
  let s = "";
  for (let i = 0; i < 130; i++) {
    const c = ["#ffffff", "#ffe9a8", "#bfe6ff", "#e7c8ff"][Math.floor(r() * 4)];
    s += `<circle cx="${(r() * 138).toFixed(1)}" cy="${(r() * 196).toFixed(1)}" r="${(0.5 + r() * 1.0).toFixed(2)}" fill="${c}"/>`;
  }
  for (let i = 0; i < 16; i++) {
    const x = 8 + r() * 122;
    const y = 8 + r() * 180;
    const k = 2.5 + r() * 2.5;
    const q = k * 0.25;
    s += `<path d="M${x.toFixed(1)} ${(y - k).toFixed(1)} L${(x + q).toFixed(1)} ${(y - q).toFixed(1)} L${(x + k).toFixed(1)} ${y.toFixed(1)} L${(x + q).toFixed(1)} ${(y + q).toFixed(1)} L${x.toFixed(1)} ${(y + k).toFixed(1)} L${(x - q).toFixed(1)} ${(y + q).toFixed(1)} L${(x - k).toFixed(1)} ${y.toFixed(1)} L${(x - q).toFixed(1)} ${(y - q).toFixed(1)}Z" fill="#fff4c0"/>`;
  }
  const con = [[15, 8], [32, 22], [50, 12], [70, 26], [92, 10], [115, 24]];
  const con2 = [[18, 122], [36, 140], [58, 126], [80, 148], [104, 130], [122, 150]];
  const line = (pts: number[][]) =>
    `<polyline points="${pts.map((p) => p.join(",")).join(" ")}" fill="none" stroke="#ffd96a" stroke-width="0.7" opacity="0.85"/>` +
    pts.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="1.7" fill="#ffd96a"/>`).join("");
  return `<svg viewBox="0 0 138 196" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1450"/><stop offset="0.55" stop-color="#34207a"/><stop offset="1" stop-color="#5a2f86"/></linearGradient>
    <radialGradient id="n1"><stop offset="0" stop-color="#8f5cff" stop-opacity="0.55"/><stop offset="1" stop-color="#8f5cff" stop-opacity="0"/></radialGradient>
    <radialGradient id="n2"><stop offset="0" stop-color="#33c9d9" stop-opacity="0.45"/><stop offset="1" stop-color="#33c9d9" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="138" height="196" fill="url(#g)"/>
  <ellipse cx="40" cy="60" rx="50" ry="26" fill="url(#n1)"/>
  <ellipse cx="100" cy="110" rx="46" ry="28" fill="url(#n2)"/>
  <ellipse cx="60" cy="170" rx="60" ry="24" fill="url(#n1)"/>
  ${s}
  ${line(con)}${line(con2)}
  <g transform="translate(45 96) scale(0.42) translate(-90 -40)"><path d="M100 18 A22.5 22.5 0 1 0 100 62 A40 40 0 0 1 100 18Z" fill="#ffe9a3"/></g>
  </svg>`;
};

const SIGIL_SVG = (() => {
  let ticks = "";
  for (let i = 0; i < 24; i++) {
    const a = (i * 15 * Math.PI) / 180;
    ticks += `<path d="M${(50 + Math.sin(a) * 39).toFixed(1)} ${(50 - Math.cos(a) * 39).toFixed(1)} L${(50 + Math.sin(a) * 44).toFixed(1)} ${(50 - Math.cos(a) * 44).toFixed(1)}" stroke="#ffd96a" stroke-width="2"/>`;
  }
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="#2a1250" stroke="#ffd96a" stroke-width="3"/>
  <circle cx="50" cy="50" r="37" fill="none" stroke="#ffd96a" stroke-width="1.6"/>
  ${ticks}
  <path d="M50 14 L58 42 L86 50 L58 58 L50 86 L42 58 L14 50 L42 42Z" fill="none" stroke="#ffd96a" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M50 24 L74 50 L50 76 L26 50Z" fill="none" stroke="#ffd96a" stroke-width="1.4"/>
  <circle cx="50" cy="50" r="13" fill="#ffd96a"/>
  <circle cx="55" cy="47" r="11" fill="#2a1250"/>
  <circle cx="50" cy="50" r="2.4" fill="#fff6c8"/>
  </svg>`;
})();

const SPINE_SVG = `<svg viewBox="0 0 40 56" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M8 6 L20 15 L32 6 M20 15 V25 M10 25 H30"/>
  <path d="M10 33 L20 43 L30 33 M20 29 V50"/>
  <circle cx="20" cy="51" r="2.4"/></svg>`;

const pageMarkup = () => {
  const r = rng(9);
  let s = "";
  for (let i = 0; i < 11; i++) {
    const y = 8 + i * 5.2;
    const dash = `${(3 + r() * 5).toFixed(1)} ${(1 + r() * 2).toFixed(1)}`;
    s += `<path d="M6 ${y.toFixed(1)} H${(40 + r() * 8).toFixed(1)}" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="${dash}"/>`;
  }
  return `<svg viewBox="0 0 52 72" xmlns="http://www.w3.org/2000/svg" fill="none">
  <g>${s}</g><circle cx="26" cy="36" r="9" stroke="#ffffff" stroke-width="1.8"/>
  <path d="M26 27 L30 40 L18 32 H34 L22 40Z" stroke="#ffffff" stroke-width="1.2"/></svg>`;
};

const coverA = `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="100" fill="#8f1d2c"/>
  <rect x="3.5" y="3.5" width="73" height="93" fill="none" stroke="#f0c050" stroke-width="2.2"/>
  <rect x="8" y="8" width="64" height="84" fill="none" stroke="#f0c050" stroke-width="0.9"/>
  <g fill="#f0c050"><circle cx="8" cy="8" r="3"/><circle cx="72" cy="8" r="3"/><circle cx="8" cy="92" r="3"/><circle cx="72" cy="92" r="3"/></g>
  <g stroke="#f0c050" stroke-width="1.2" fill="none"><circle cx="40" cy="44" r="23"/><path d="M40 20 L61 56 L19 56Z"/>
  <path d="M40 8 V16 M40 72 V78 M10 44 H16 M64 44 H70 M18 22 L23 27 M62 22 L57 27"/></g>
  <path d="M25 44 Q40 31 55 44 Q40 57 25 44Z" fill="#1b0a12" stroke="#f0c050" stroke-width="1.4"/>
  <circle cx="40" cy="44" r="6.5" fill="#ffd96a"/><circle cx="40" cy="44" r="3" fill="#1b0a12"/>
  <rect x="20" y="82" width="40" height="4.5" fill="#f0c050"/></svg>`;

const coverB = `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="100" fill="#1f3f8a"/>
  <rect x="3.5" y="3.5" width="73" height="93" fill="none" stroke="#f4d070" stroke-width="2.2"/>
  <rect x="8" y="8" width="64" height="84" fill="none" stroke="#f4d070" stroke-width="0.9"/>
  <circle cx="40" cy="44" r="27" fill="#16306b" stroke="#f4d070" stroke-width="1.4"/>
  <g transform="translate(14 22) scale(0.62)"><path d="M44 20 A22.5 22.5 0 1 0 44 64 A40 40 0 0 1 44 20Z" fill="#fff0b0" transform="translate(12 0)"/></g>
  <g fill="#fff0b0"><path d="M54 30 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6z"/><path d="M58 52 l1 2.4 2.4 1 -2.4 1 -1 2.4 -1 -2.4 -2.4 -1 2.4 -1z"/><circle cx="47" cy="62" r="1.5"/><circle cx="30" cy="30" r="1.2"/></g>
  <rect x="20" y="82" width="40" height="4.5" fill="#f4d070"/></svg>`;

const coverC = `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="100" fill="#2a6b4a"/>
  <rect x="3.5" y="3.5" width="73" height="93" fill="none" stroke="#f0c860" stroke-width="2.2"/>
  <rect x="8" y="8" width="64" height="84" fill="none" stroke="#f0c860" stroke-width="0.9"/>
  <path d="M40 74 V46 M40 62 L30 52 M40 58 L50 48" stroke="#f0c860" stroke-width="3.2" fill="none" stroke-linecap="round"/>
  <path d="M40 74 L28 82 M40 74 L52 82 M40 74 V84" stroke="#f0c860" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <circle cx="40" cy="32" r="19" fill="#3fae78" stroke="#f0c860" stroke-width="1.6"/>
  <g fill="#bff0d0"><circle cx="32" cy="28" r="4"/><circle cx="46" cy="26" r="4.5"/><circle cx="40" cy="38" r="4"/><circle cx="50" cy="38" r="3"/><circle cx="30" cy="38" r="3"/></g>
  <circle cx="40" cy="20" r="2.4" fill="#ffe27a"/>
  <rect x="20" y="88" width="40" height="3.5" fill="#f0c860"/></svg>`;

const sideMarkup = (() => {
  let s = "";
  const dxs = [0, 6, 11, 18, -11, -6, 0];
  for (let i = 0; i < 7; i++) {
    const cy = 20 + i * 23;
    s += `<circle cx="15" cy="${cy}" r="8" fill="#f4d070"/><circle cx="${15 + dxs[i]}" cy="${cy}" r="8" fill="#251445"/><circle cx="15" cy="${cy}" r="8" fill="none" stroke="#f4d070" stroke-width="0.9"/>`;
    if (i < 6) s += `<path d="M15 ${cy + 14} l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2z" fill="#9be9ff"/>`;
  }
  return `<svg viewBox="0 0 30 180" xmlns="http://www.w3.org/2000/svg">
  <rect width="30" height="180" rx="6" fill="#251445"/>
  <rect x="2" y="2" width="26" height="176" rx="5" fill="none" stroke="#f4d070" stroke-width="1.4"/>${s}</svg>`;
})();

const owlEyeSvg = `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <circle cx="30" cy="30" r="28" fill="#ffcf3a" stroke="#3a2410" stroke-width="3"/>
  <circle cx="30" cy="30" r="20" fill="#ffa81f"/>
  <circle cx="30" cy="31" r="12" fill="#1a0f08"/>
  <circle cx="24" cy="23" r="5.5" fill="#ffffff"/><circle cx="37" cy="38" r="2.6" fill="#ffffff"/></svg>`;

const tasselSvg = `<svg viewBox="0 0 24 70" xmlns="http://www.w3.org/2000/svg">
  <rect x="9.5" y="58" width="5" height="12" fill="#e8b848"/>
  <circle cx="12" cy="55" r="6" fill="#e8b848" stroke="#8a5a10" stroke-width="1"/>
  <path d="M7 50 L17 50 L22 6 L2 6Z" fill="#c8283c"/>
  <g stroke="#f2cc66" stroke-width="1.1"><path d="M8 50 L5 6 M12 50 V6 M16 50 L19 6"/></g>
  <rect x="2" y="2" width="20" height="5" fill="#e8b848"/><rect x="6" y="38" width="12" height="3" fill="#e8b848"/></svg>`;

const orbMarkup = (c1: string, c2: string, c3: string) => `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="o" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="0.5" stop-color="${c3}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
  <rect width="128" height="64" fill="url(#o)"/>
  <path d="M0 40 Q16 20 32 38 T64 36 T96 34 T128 40" stroke="${c3}" stroke-width="5" fill="none" opacity="0.8" stroke-linecap="round"/>
  <path d="M0 26 Q20 44 40 24 T80 28 T128 24" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.6"/>
  <path d="M30 52 Q50 36 70 50 T110 48" stroke="${c1}" stroke-width="6" fill="none" opacity="0.6" stroke-linecap="round"/>
  <g fill="#ffffff"><circle cx="40" cy="30" r="1.6"/><circle cx="62" cy="22" r="1.2"/><circle cx="76" cy="40" r="1.8"/><circle cx="88" cy="26" r="1.2"/><circle cx="52" cy="46" r="1.2"/></g></svg>`;

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "wizardsBookshelf" });
  const base = b.joint("shelf", { at: [0, 0, 0] });
  const R = rng(21);

  // Textures
  const SKY = svg(skyMarkup(), { size: 512 });
  const SIGIL = svg(SIGIL_SVG, { size: 256 });
  const SPINE = svg(SPINE_SVG, { size: 128 });
  const PAGETEX = svg(pageMarkup(), { size: 256 });
  const COVER_A = svg(coverA, { size: 256 });
  const COVER_B = svg(coverB, { size: 256 });
  const COVER_C = svg(coverC, { size: 256 });
  const SIDE = svg(sideMarkup, { size: 512 });
  const OWL_EYE = svg(owlEyeSvg, { size: 128 });
  const TASSEL = svg(tasselSvg, { size: 192 });
  const ORB_BLUE = svg(orbMarkup("#12307a", "#1b4fd0", "#7fd4ff"), { size: 256 });
  const ORB_VIO = svg(orbMarkup("#3b1280", "#6a2fd8", "#d2a8ff"), { size: 256 });
  const ORB_GRN = svg(orbMarkup("#0c5a3a", "#16a860", "#b8ffd0"), { size: 256 });

  // Paints
  const WOOD_H = cel(grain("#6a3d27", "#85502f", { size: 0.03, axis: "x", seed: 2 }));
  const WOOD_V = cel(grain("#5f3522", "#7c4a2d", { size: 0.03, axis: "y", seed: 3 }));
  const WOOD_D = cel(grain("#40251a", "#573223", { size: 0.025, axis: "y", seed: 4 }));
  const GILT = metal("gilt");
  const BRASS = metal("brass", { tarnish: 0.35 });
  const leather = (c: string) => cel(mottle(c, mix(c, "#000000", 0.35), { size: 0.04, contrast: 0.8, seed: 7 }));
  const BK = ["#9b2335", "#244d9c", "#2f7a55", "#6a35a0", "#c06a1e", "#1f8590", "#4a3226", "#b0407a", "#7a1d1d", "#35508a"].map(leather);
  const URN = cel(stripes("#2c8a8a", "#e8b848", { size: 0.045, axis: "y", width: 0.2, wobble: 0.08, seed: 3 }));
  const OWL_P = cel(mottle("#9b78bd", "#7c5aa0", { size: 0.03, seed: 4 }));
  const OWL_BELLY = cel(scales("#f4e6f6", "#cfb0d8", { size: 0.014, width: 0.2, seed: 2 }));
  const HAT = cel(mottle("#4a2b86", "#33196a", { size: 0.03, seed: 8 }));

  // Flat colours
  const PAGE = "#efe1b8";
  const LABEL = "#2a1830";
  const WAX = "#f6edd6";
  const WAX2 = "#e8d8b0";
  const WICK = "#2b2018";
  const FLAME = "#ffb347";
  const FLAMEC = "#fff1b8";
  const PAPER = ["#f1e3b8", "#e5d3a0"];
  const RIB = ["#c8283c", "#2f6fd0", "#2fa070", "#d8a838"];
  const ROD = "#6b4226";
  const GLASS = "#bfeee8";
  const CORK = "#a8733a";
  const PURPLE = "#241048";

  // -------------------------------------------------------------------------------------------------------------
  // Placement helpers

  function local(origin: V, rotDeg: V = [0, 0, 0]) {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rotDeg[0] * D, rotDeg[1] * D, rotDeg[2] * D, "XYZ"));
    const o = new THREE.Vector3(origin[0], origin[1], origin[2]);
    const pt = (l: V) => new THREE.Vector3(l[0], l[1], l[2]).applyQuaternion(q).add(o);
    const put = (geo: THREE.BufferGeometry, color: any, l: V = [0, 0, 0], po: PO = {}) => {
      const lq = po.rot
        ? q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(po.rot[0] * D, po.rot[1] * D, po.rot[2] * D, "XYZ")))
        : q;
      const opts: any = { bone: base, at: pt(l), quat: lq };
      if (po.texture) opts.texture = po.texture;
      if (po.scale) opts.scale = po.scale;
      if (po.flat) opts.flat = true;
      if (po.opt) {
        Object.assign(opts, po.opt);
        if (po.opt.dir) delete opts.quat;
      }
      const p = b.part(geo, color, opts);
      if (po.glow) glow(p, po.glow);
      return p;
    };
    return { pt, put, q, o };
  }
  type Loc = ReturnType<typeof local>;

  const W = local([0, 0, 0]);
  const put = W.put;
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, seg = 8) => new THREE.CylinderGeometry(rt, rb, h, seg);
  const sph = (r: number, ws = 10, hs = 7) => new THREE.SphereGeometry(r, ws, hs);
  const lath = (outline: any, at: any, color: any, seg = 8, gl = 0) => {
    const p = b.lathe(outline, { at, bone: base, color, segments: seg });
    if (gl) glow(p, gl);
    return p;
  };

  // -------------------------------------------------------------------------------------------------------------
  // Carcass

  const TOPS = [0.14, 0.54, 0.94, 1.34, 1.74, 2.14];

  put(box(1.58, 0.1, 0.46), WOOD_D, [0, 0.05, 0]);
  put(box(1.64, 0.03, 0.5), GILT, [0, 0.115, 0]);
  for (const s of [1, -1]) {
    put(box(0.06, 2.04, 0.42), WOOD_V, [s * 0.72, 1.12, 0]);
    // carved moon-phase strip on each flank
    put(new THREE.PlaneGeometry(0.28, 1.68), "#ffffff", [s * 0.7515, 1.12, 0], {
      texture: SIDE,
      glow: 0.45,
      opt: { dir: [s, 0, 0], axis: "z" },
    });
  }
  put(box(1.38, 2.04, 0.02), WOOD_D, [0, 1.12, -0.2]);
  put(new THREE.PlaneGeometry(1.38, 1.96), "#ffffff", [0, 1.12, -0.189], { texture: SKY, glow: 0.55 });

  TOPS.forEach((ty, i) => {
    put(box(1.38, 0.04, 0.39), WOOD_H, [0, ty - 0.02, 0.005]);
    put(box(1.38, 0.016, 0.008), GILT, [0, ty - 0.026, 0.2]);
    if (i < 5) {
      put(new THREE.OctahedronGeometry(0.018), "#40e8d8", [0, ty - 0.024, 0.208], { scale: [1, 1.4, 0.55], glow: 1.3 });
      for (const sx of [1, -1]) {
        put(new THREE.OctahedronGeometry(0.011), "#ff7ab8", [sx * 0.42, ty - 0.024, 0.206], { scale: [1, 1.4, 0.55], glow: 1.1 });
      }
    }
  });

  // twisted columns on the front corners
  for (const s of [1, -1]) {
    const cx = s * 0.77;
    const cz = 0.2;
    put(cyl(0.04, 0.04, 2.04, 8), WOOD_D, [cx, 1.12, cz]);
    const ribbon = spiral([cx, 0.18, cz], [cx + 0.0435, 0.18, cz], [0, 1, 0], { turns: 6, pitch: 0.31 });
    b.sweep(ribbon, 0.007, { color: GILT, bone: base, sides: 4 });
    lath([[0, 0], [0.065, 0], [0.065, 0.02], [0.05, 0.035], [0.043, 0.05], [0, 0.05]], [cx, 0.1, cz], GILT, 8);
    lath([[0, 0], [0.045, 0], [0.06, 0.015], [0.068, 0.04], [0.068, 0.06], [0, 0.06]], [cx, 2.12, cz], GILT, 8);
    lath([[0, 0], [0.05, 0], [0.045, 0.06], [0.03, 0.16], [0.012, 0.28], [0, 0.36]], [cx, 2.18, cz], HAT, 8);
    put(sph(0.022, 8, 6), "#ffe27a", [cx, 2.55, cz], { glow: 1.8 });
    put(cyl(0.05, 0.05, 0.012, 8), GILT, [cx, 2.2, cz]);
  }

  // cornice
  put(box(1.7, 0.06, 0.5), WOOD_D, [0, 2.17, 0]);
  put(box(1.74, 0.025, 0.52), GILT, [0, 2.2125, 0]);
  put(box(1.6, 0.05, 0.46), WOOD_D, [0, 2.25, 0]);
  const dents: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 17; i++) dents.push(box(0.045, 0.03, 0.02).translate(-0.8 + i * 0.1, 2.168, 0.26));
  put(mergeGeometries(dents)!, GILT, [0, 0, 0]);

  // gothic ogee crown
  const SY = 0.85;
  const half: [number, number][] = [[0.64, 0.05], [0.57, 0.14], [0.46, 0.24], [0.34, 0.32], [0.23, 0.39], [0.12, 0.45]];
  const archOutline = (sx: number, sy: number, dy = 0): any[] => [
    [-0.64 * sx, dy, "sharp"],
    [0.64 * sx, dy, "sharp"],
    ...half.map(([x, y]) => [x * sx, y * sy + dy]),
    [0, 0.52 * sy + dy, "sharp"],
    ...half.slice().reverse().map(([x, y]) => [-x * sx, y * sy + dy]),
  ];
  const CY = 2.27;
  const AX = { x: [1, 0, 0], y: [0, 1, 0], bone: base } as any;
  b.extrude(archOutline(1, SY), { ...AX, at: [0, CY, -0.03], thickness: 0.07, bevel: 0.008, smoothing: 1, color: WOOD_D });
  b.extrude(archOutline(0.9, SY * 0.88, 0.035), { ...AX, at: [0, CY, -0.03], thickness: 0.082, smoothing: 1, color: GILT });
  b.extrude(archOutline(0.8, SY * 0.76, 0.06), { ...AX, at: [0, CY, -0.03], thickness: 0.09, smoothing: 1, color: PURPLE });
  put(new THREE.CircleGeometry(0.125, 24), "#ffffff", [0, CY + 0.17, 0.0165], { texture: SIGIL, glow: 1.1 });
  for (const s of [1, -1]) {
    for (let i = 1; i < 5; i++) {
      const [hx, hy] = half[i];
      put(sph(0.011, 6, 4), "#ff5fa8", [s * hx * 0.85, CY + hy * SY * 0.82 + 0.045, 0.012], { glow: 1.2 });
    }
  }
  // cradle moon with a glowing pearl on the very tip
  const cres: any[] = [];
  for (let i = 0; i <= 10; i++) {
    const a = (195 + (150 * i) / 10) * D;
    cres.push([Math.cos(a) * 0.085, Math.sin(a) * 0.085]);
  }
  for (let i = 10; i >= 0; i--) {
    const a = (195 + (150 * i) / 10) * D;
    cres.push([Math.cos(a) * 0.07, Math.sin(a) * 0.07 + 0.04]);
  }
  const y0 = CY + 0.52 * SY + 0.085 - 0.01;
  b.extrude(cres, { ...AX, at: [0, y0, -0.03], thickness: 0.03, bevel: 0.005, color: GILT });
  put(sph(0.04, 10, 7), "#8ff0ff", [0, y0 + 0.01, -0.03], { glow: 2 });

  // hanging tassels
  for (const s of [1, -1]) {
    put(sph(0.016, 6, 5), GILT, [s * 0.62, 2.14, 0.25]);
    const m = b.cards([frame([s * 0.62, 2.133, 0.258], [0, 1, 0])], TASSEL, {
      size: [0.06, 0.15],
      lean: 180,
      flow: [0, 0, 1],
      sink: 0,
      bone: base,
    });
    void m;
  }

  // -------------------------------------------------------------------------------------------------------------
  // Props: candles, orbs, potions, scrolls, books

  const FLAME_OUT = [[0, 0], [0.006, 0.004], [0.01, 0.014], [0.0085, 0.028], [0.004, 0.042], [0, 0.056]];
  const FLAME_IN = [[0, 0], [0.0035, 0.004], [0.005, 0.012], [0.003, 0.022], [0, 0.03]];

  const candle = (x: number, y: number, z: number, h: number, r = 0.017, holder = true) => {
    let yy = y;
    if (holder) {
      lath([[0, 0], [r * 2.6, 0], [r * 2.8, 0.006], [r * 1.9, 0.014], [r * 1.2, 0.018], [0, 0.018]], [x, y, z], BRASS, 8);
      yy += 0.016;
    }
    put(cyl(r, r * 1.06, h, 8), WAX, [x, yy + h / 2, z]);
    put(cyl(r * 1.12, r * 1.12, 0.008, 8), WAX2, [x, yy + h - 0.002, z]);
    const nd = 2 + (R() > 0.5 ? 1 : 0);
    for (let i = 0; i < nd; i++) {
      const a = R() * Math.PI * 2;
      const dl = 0.02 + R() * 0.04;
      const px = x + Math.cos(a) * r * 1.06;
      const pz = z + Math.sin(a) * r * 1.06;
      put(box(0.007, dl, 0.007), WAX2, [px, yy + h - dl / 2 - 0.004, pz]);
      put(sph(0.0045, 5, 4), WAX2, [px, yy + h - dl - 0.004, pz]);
    }
    put(cyl(0.0014, 0.0014, 0.014, 4), WICK, [x, yy + h + 0.006, z]);
    lath(FLAME_OUT, [x, yy + h + 0.01, z], FLAME, 6, 1.6);
    lath(FLAME_IN, [x, yy + h + 0.012, z], FLAMEC, 6, 2.2);
  };

  const STAND = [[0, 0], [0.06, 0], [0.063, 0.012], [0.046, 0.022], [0.04, 0.04], [0.056, 0.056], [0.058, 0.066], [0, 0.066]];
  const orb = (x: number, ty: number, z: number, r: number, tex: THREE.Texture, str = 1) => {
    const k = Math.max(0.6, r / 0.085);
    lath(STAND.map(([a, c]) => [a * k, c]), [x, ty, z], GILT, 8);
    put(new THREE.TorusGeometry(0.052 * k, 0.006, 5, 12), GILT, [x, ty + 0.064, z], { rot: [90, 0, 0] });
    const cy = ty + 0.066 + r * 0.82;
    put(sph(r, 14, 10), "#ffffff", [x, cy, z], { texture: tex, rot: [0, -90, 0], glow: str });
    put(sph(1, 6, 4), "#ffffff", [x - r * 0.37, cy + r * 0.44, z + r * 0.78], {
      scale: [r * 0.22, r * 0.12, r * 0.04],
      glow: 1,
      opt: { dir: [-0.38, 0.45, 0.8], axis: "z" },
    });
  };

  const potion = (x: number, ty: number, z: number, kind: number) => {
    const liquid = ["#ff5fa8", "#4de0b4", "#9a7bff"][kind];
    if (kind === 0) {
      put(sph(0.04, 9, 7), liquid, [x, ty + 0.04, z], { glow: 0.8 });
      put(cyl(0.013, 0.016, 0.05, 6), GLASS, [x, ty + 0.1, z]);
      put(cyl(0.011, 0.009, 0.02, 6), CORK, [x, ty + 0.133, z]);
    } else if (kind === 1) {
      lath([[0, 0], [0.04, 0], [0.046, 0.008], [0.014, 0.1], [0, 0.1]], [x, ty, z], liquid, 8, 0.8);
      put(cyl(0.014, 0.014, 0.06, 6), GLASS, [x, ty + 0.13, z]);
      put(cyl(0.012, 0.01, 0.02, 6), CORK, [x, ty + 0.173, z]);
    } else {
      put(cyl(0.022, 0.022, 0.09, 8), liquid, [x, ty + 0.045, z], { glow: 0.8 });
      put(cyl(0.012, 0.012, 0.03, 6), GLASS, [x, ty + 0.105, z]);
      put(sph(0.011, 6, 4), CORK, [x, ty + 0.128, z]);
      put(cyl(0.0125, 0.0125, 0.006, 6), "#e8b848", [x, ty + 0.105, z]);
    }
  };

  const scroll = (L: Loc, len: number, r: number, paper: string, rib: string, seal = false) => {
    L.put(cyl(r, r, len, 8), paper, [0, 0, 0]);
    L.put(cyl(r * 0.45, r * 0.45, len + 0.05, 5), ROD, [0, 0, 0]);
    for (const e of [1, -1]) L.put(sph(r * 0.62, 6, 4), GILT, [0, e * (len / 2 + 0.028), 0]);
    L.put(cyl(r * 1.1, r * 1.1, 0.012, 8), rib, [0, len * 0.16, 0]);
    if (seal) L.put(cyl(0.009, 0.009, 0.005, 6), "#a01828", [0, len * 0.16, r * 1.12], { rot: [90, 0, 0] });
  };

  // books ------------------------------------------------------------------------------------------------------
  type Spec = { w: number; h: number; d: number; c: number };
  const sp = (w: number, h: number, d: number, c: number): Spec => ({ w, h, d, c });

  const book = (L: Loc, s: Spec, yo: number, emblem?: THREE.Texture) => {
    const { w, h, d } = s;
    const col = BK[s.c % BK.length];
    L.put(box(w - 0.016, h - 0.012, d - 0.014), PAGE, [0, yo, -0.004]);
    for (const sx of [1, -1]) L.put(box(0.008, h, d), col, [sx * (w / 2 - 0.004), yo, 0]);
    L.put(box(w, h, 0.009), col, [0, yo, d / 2 - 0.0045]);
    for (const f of [0.4, -0.4]) L.put(box(w + 0.008, 0.014, 0.014), GILT, [0, yo + h * f, d / 2 - 0.002]);
    for (const f of [0.19, -0.19]) L.put(box(w + 0.004, 0.006, 0.01), GILT, [0, yo + h * f, d / 2 - 0.003]);
    if (w > 0.055) {
      L.put(box(w * 0.78, h * 0.26, 0.004), LABEL, [0, yo, d / 2 + 0.001]);
      L.put(new THREE.PlaneGeometry(w * 0.6, h * 0.2), "#f4cf6a", [0, yo, d / 2 + 0.0035], { texture: SPINE, glow: 0.6 });
    }
    if (emblem) L.put(new THREE.PlaneGeometry(d * 0.8, h * 0.8), "#ffffff", [w / 2 + 0.002, yo, 0], { rot: [0, 90, 0], texture: emblem });
  };

  const stand = (x: number, ty: number, s: Spec, lean = 0) => {
    const lift = Math.abs(Math.sin(lean * D)) * (s.w / 2);
    const L = local([x, ty + lift, -0.16 + s.d / 2], [0, 0, lean]);
    book(L, s, s.h / 2);
  };

  const row = (x0: number, ty: number, specs: Spec[], leanSpec?: Spec, lean = 0) => {
    let x = x0;
    for (const s of specs) {
      stand(x + s.w / 2, ty, s);
      x += s.w + 0.001;
    }
    if (leanSpec) {
      const cx = x + (leanSpec.w / 2) * Math.cos(lean * D) + leanSpec.h * Math.sin(lean * D) + 0.004;
      stand(cx, ty, leanSpec, lean);
      x = cx + leanSpec.w / 2;
    }
    return x;
  };

  const flat = (cx: number, yBottom: number, cz: number, s: Spec, yaw = 0, emblem?: THREE.Texture) => {
    const L = local([cx, yBottom + s.w / 2, cz], [0, -90 + yaw, 90]);
    book(L, s, 0, emblem);
  };

  // -------------------------------------------------------------------------------------------------------------
  // Shelf 0 : heavy tomes, flat stack, big blue orb
  {
    const ty = TOPS[0];
    row(
      -0.675,
      ty,
      [sp(0.075, 0.32, 0.27, 0), sp(0.06, 0.3, 0.25, 1), sp(0.09, 0.33, 0.28, 2), sp(0.07, 0.31, 0.26, 3), sp(0.085, 0.33, 0.27, 4), sp(0.06, 0.29, 0.24, 5), sp(0.08, 0.32, 0.27, 6)],
      sp(0.07, 0.3, 0.25, 7),
      11,
    );
    flat(0.12, ty, 0, sp(0.05, 0.32, 0.24, 8), 3);
    flat(0.12, ty + 0.05, 0, sp(0.045, 0.3, 0.22, 1), -5);
    flat(0.12, ty + 0.095, 0, sp(0.04, 0.27, 0.2, 0), 4, COVER_A);
    candle(0.24, ty + 0.135, -0.04, 0.04, 0.014, false); // stub on top
    orb(0.47, ty, 0.0, 0.1, ORB_BLUE, 1);
    candle(0.63, ty, 0.1, 0.12);
  }

  // Shelf 1 : scroll pyramid, books, display book on easel, urn of scrolls
  {
    const ty = TOPS[1];
    let y = ty + 0.03;
    let n = 0;
    for (let rw = 0; rw < 4; rw++) {
      const cnt = 4 - rw;
      for (let i = 0; i < cnt; i++) {
        const z = -0.01 + (i - (cnt - 1) / 2) * 0.064;
        const L = local([-0.5, y, z], [0, 0, 90]);
        scroll(L, 0.3, 0.03, PAPER[n % 2], RIB[n % 4], n % 3 === 0);
        n++;
      }
      y += 0.054;
    }
    row(-0.3, ty, [sp(0.06, 0.27, 0.22, 9), sp(0.07, 0.29, 0.24, 2), sp(0.055, 0.25, 0.2, 7), sp(0.065, 0.28, 0.23, 3)], sp(0.06, 0.26, 0.21, 6), 14);

    // display easel
    put(box(0.26, 0.012, 0.07), WOOD_D, [0.22, ty + 0.006, 0.045]);
    put(box(0.26, 0.018, 0.012), GILT, [0.22, ty + 0.021, 0.078]);
    const DL = local([0.22, ty + 0.012 + 0.006, -0.005], [-15, -90, 0]);
    book(DL, sp(0.04, 0.26, 0.2, 1), 0.13, COVER_B);
    b.rod([0.22, ty + 0.18, -0.07], [0.22, ty + 0.004, -0.13], 0.007, WOOD_D, { bone: base });

    // urn with scrolls
    const ux = 0.54;
    lath([[0, 0], [0.04, 0], [0.055, 0.03], [0.058, 0.06], [0.045, 0.095], [0.035, 0.105], [0.042, 0.12], [0, 0.12]], [ux, ty, 0], URN, 10);
    put(cyl(0.059, 0.059, 0.008, 10), GILT, [ux, ty + 0.045, 0]);
    put(cyl(0.044, 0.044, 0.008, 10), GILT, [ux, ty + 0.119, 0]);
    const tilt: [number, number][] = [[0, 0], [10, 8], [-12, 5], [8, -11], [-9, -9]];
    tilt.forEach(([rx, rz], i) => {
      const L = local([ux + (i - 2) * 0.008, ty + 0.095, (i % 2) * 0.01 - 0.005], [rx, 0, rz]);
      scroll(L, 0.24, 0.016, PAPER[i % 2], RIB[(i + 1) % 4], i % 2 === 0);
      L.put(cyl(0.0001, 0.0001, 0.0001, 3), PAGE, [0, 0, 0]);
    });
  }

  // Shelf 2 : books, tome stand with floating sigil, candle trio
  {
    const ty = TOPS[2];
    row(-0.675, ty, [sp(0.065, 0.3, 0.25, 4), sp(0.08, 0.32, 0.27, 0), sp(0.06, 0.28, 0.24, 8), sp(0.07, 0.31, 0.26, 5)], sp(0.075, 0.29, 0.25, 1), 13);

    put(box(0.34, 0.025, 0.24), WOOD_D, [0.0, ty + 0.0125, 0.0]);
    put(box(0.35, 0.008, 0.25), GILT, [0.0, ty + 0.027, 0.0]);
    const OL = local([0.0, ty + 0.062, 0.0], [-18, 0, 0]);
    OL.put(box(0.31, 0.012, 0.215), BK[0], [0, -0.016, 0]);
    for (const s of [1, -1]) {
      const rz = -s * 7;
      OL.put(box(0.148, 0.02, 0.2), PAGE, [s * 0.077, 0.004, 0], { rot: [0, 0, rz] });
      OL.put(new THREE.PlaneGeometry(0.12, 0.17).rotateX(-Math.PI / 2), "#4a3426", [s * 0.077, 0.0145, 0], {
        texture: PAGETEX,
        rot: [0, 0, rz],
      });
    }
    OL.put(cyl(0.013, 0.013, 0.215, 6), BK[0], [0, -0.004, 0], { rot: [90, 0, 0] });
    OL.put(box(0.012, 0.002, 0.12), "#c8283c", [0.012, 0.0165, 0.02]);
    OL.put(box(0.012, 0.07, 0.002), "#c8283c", [0.012, -0.018, 0.112]);
    const sigil = b.cards([frame([0.0, ty + 0.19, 0.0], [0, 1, 0])], SIGIL, { size: 0.13, flow: [0, 0, 1], lean: 0, sink: 0, bone: base });
    glow(sigil as any, 1.5);

    candle(0.4, ty, 0.02, 0.17);
    flat(0.52, ty, 0.0, sp(0.035, 0.18, 0.14, 2), 8);
    flat(0.52, ty + 0.035, 0.0, sp(0.03, 0.16, 0.13, 7), -6);
    candle(0.52, ty + 0.065, 0.0, 0.1, 0.015, false);
    candle(0.62, ty, 0.06, 0.07, 0.014);
  }

  // Shelf 3 : orbs and potions
  {
    const ty = TOPS[3];
    row(-0.675, ty, [sp(0.07, 0.3, 0.25, 6), sp(0.06, 0.27, 0.22, 3), sp(0.08, 0.31, 0.26, 9)], sp(0.07, 0.28, 0.23, 4), 12);
    orb(-0.2, ty, 0.0, 0.085, ORB_VIO, 1);
    orb(0.0, ty, 0.04, 0.055, ORB_GRN, 1);
    orb(0.18, ty, -0.01, 0.07, ORB_BLUE, 1);
    potion(0.4, ty, 0.04, 0);
    potion(0.5, ty, 0.0, 1);
    potion(0.6, ty, 0.07, 2);
    flat(0.5, ty, -0.08, sp(0.02, 0.1, 0.07, 5), 0); // small spellbook behind the flasks
  }

  // Shelf 4 : tall books, candle trio on a stack, wizard owl
  {
    const ty = TOPS[4];
    row(-0.675, ty, [sp(0.06, 0.33, 0.25, 7), sp(0.075, 0.3, 0.27, 2), sp(0.065, 0.32, 0.24, 0), sp(0.08, 0.31, 0.26, 3), sp(0.07, 0.33, 0.25, 8), sp(0.06, 0.29, 0.23, 1)], sp(0.07, 0.3, 0.25, 6), 10);
    flat(-0.02, ty, 0.0, sp(0.05, 0.3, 0.22, 9), 5);
    flat(-0.02, ty + 0.05, 0.0, sp(0.045, 0.27, 0.2, 5), -4, COVER_C);
    put(cyl(0.085, 0.09, 0.012, 12), BRASS, [-0.02, ty + 0.101, 0.0]);
    candle(-0.06, ty + 0.107, 0.0, 0.14, 0.017, false);
    candle(0.0, ty + 0.107, 0.04, 0.1, 0.015, false);
    candle(0.0, ty + 0.107, -0.04, 0.08, 0.014, false);

    // the owl
    const S = 0.9;
    const ox = 0.45;
    const oy = ty + 0.012;
    put(cyl(0.058, 0.065, 0.012, 10), GILT, [ox, ty + 0.006, 0]);
    const O = local([ox, oy, 0], [0, -12, 0]);
    O.put(sph(1, 8, 6), OWL_P, [0, 0.085 * S, 0], { scale: [0.07 * S, 0.092 * S, 0.062 * S] });
    O.put(sph(1, 8, 6), OWL_BELLY, [0, 0.075 * S, 0.026 * S], { scale: [0.048 * S, 0.07 * S, 0.04 * S] });
    O.put(sph(1, 10, 7), OWL_P, [0, 0.185 * S, 0.004], { scale: [0.064 * S, 0.056 * S, 0.056 * S] });
    for (const sx of [1, -1]) {
      O.put(sph(1, 8, 5), "#f6ead8", [sx * 0.026 * S, 0.19 * S, 0.04 * S], { scale: [0.032 * S, 0.034 * S, 0.016 * S] });
      O.put(new THREE.PlaneGeometry(0.042 * S, 0.042 * S), "#ffffff", [sx * 0.026 * S, 0.19 * S, 0.0575 * S], { texture: OWL_EYE, glow: 0.7 });
      O.put(sph(1, 7, 5), "#5c3f7a", [sx * 0.064 * S, 0.085 * S, -0.008 * S], { scale: [0.02 * S, 0.075 * S, 0.045 * S], rot: [0, 0, -sx * 9] });
      O.put(cyl(0.006 * S, 0.006 * S, 0.03 * S, 5), "#e08a2a", [sx * 0.025 * S, 0.0, 0.02 * S]);
      for (const tx of [-1, 0, 1]) O.put(box(0.006 * S, 0.006 * S, 0.026 * S), "#e08a2a", [sx * 0.025 * S + tx * 0.01 * S, -0.012 * S, 0.034 * S]);
    }
    O.put(new THREE.ConeGeometry(0.01 * S, 0.026 * S, 4), "#f0a030", [0, 0.178 * S, 0.074 * S], { rot: [110, 0, 0] });
    O.put(box(0.05 * S, 0.06 * S, 0.012 * S), "#5c3f7a", [0, 0.03 * S, -0.05 * S], { rot: [-25, 0, 0] });
    const hy = oy + 0.232 * S;
    lath([[0, 0], [0.058 * S, 0], [0.063 * S, 0.006 * S], [0.04 * S, 0.012 * S], [0, 0.012 * S]], [ox, hy, 0], HAT, 10);
    lath([[0, 0], [0.04 * S, 0], [0.03 * S, 0.035 * S], [0.015 * S, 0.065 * S], [0.004 * S, 0.08 * S], [0, 0.08 * S]], [ox, hy + 0.012 * S, 0], HAT, 8);
    put(cyl(0.041 * S, 0.043 * S, 0.01 * S, 10), "#ffd96a", [ox, hy + 0.017 * S, 0]);
    put(new THREE.OctahedronGeometry(0.01 * S), "#ffe27a", [ox, hy + 0.045 * S, 0.034 * S], { glow: 1.6 });
  }

  // Floating motes of magic light
  const motes: V[] = [
    [-0.32, 0.46, 0.06], [-0.05, 0.43, 0.1], [0.3, 0.45, -0.02], [0.62, 0.38, 0.12],
    [-0.45, 1.22, 0.1], [0.1, 1.2, 0.12], [-0.12, 1.1, -0.05],
    [-0.1, 1.62, 0.1], [0.2, 1.68, 0.05], [0.08, 1.58, 0.12],
    [-0.12, 2.02, 0.1], [0.3, 2.04, 0.06], [-0.4, 1.95, 0.05], [0.28, 1.2, 0.08],
  ];
  motes.forEach(([x, y, z], i) => {
    put(new THREE.OctahedronGeometry(0.007 + (i % 3) * 0.003), i % 2 ? "#fff0a0" : "#9be9ff", [x, y, z], {
      glow: 2,
      rot: [R() * 90, R() * 90, 0],
    });
  });

  return b.root;
}
```