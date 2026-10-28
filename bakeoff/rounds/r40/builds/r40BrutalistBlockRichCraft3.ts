import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, rng, paint, noise, mix, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Brutalist Housing Block",
  description:
    "A raw board-marked concrete housing slab on tapered pilotis: deep loggias with polychrome back walls, a glazed shopping street, a roof terrace with vault, stacks, pool and ramp, and a detached stair tower linked by bridges.",
};

// ---------------------------------------------------------------------------------------------------------------
// Dimensions (meters)
const FLOORS = 12;
const FH = 3;
const BASE = 6; // pilotis height
const TOP = BASE + FLOORS * FH; // 42
const NB = 20; // bays
const BW = 3;
const L = NB * BW; // 60
const SHOP = 6; // the glazed shopping street floor
const RY = TOP + 0.2; // roof surface

// Flat colours
const SLAB = ["#a7a399", "#9e9a90", "#b0aca1"];
const DARK = "#6f6c65";
const STEEL = "#4b4e53";
const GLASS_D = "#2c3942";
const WARM = "#ffc46b";
const PALE = "#ffe3a8";
const WATER = "#3fa9c9";
const OCHRE = "#d9a52f";
const BEACON = "#ff3b2a";
const CREAM = "#e8e2cf";

const FRONT_PAL = [CREAM, CREAM, CREAM, CREAM, "#c9402c", "#e6b52a", "#2f69a2", "#3d8a58", "#d96f2b"];
const BACK_PAL = ["#d9d3c2", "#d9d3c2", "#d9d3c2", "#d9d3c2", "#d9d3c2", "#c9402c", "#e6b52a", "#7d8f9c"];

function bays(seed: number, pal: string[]): string[][] {
  const r = rng(seed);
  return Array.from({ length: FLOORS }, () => Array.from({ length: NB }, () => pal[Math.floor(r() * pal.length)]));
}
const FRONT = bays(11, FRONT_PAL);
const BACK = bays(29, BACK_PAL);

// ---------------------------------------------------------------------------------------------------------------
// SVG drawings
const f1 = (v: number) => v.toFixed(2);
const wrap = (w: number, h: number, defs: string, body: string) =>
  `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><defs>
  <linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#93aab6"/><stop offset="1" stop-color="#34454f"/></linearGradient>
  <linearGradient id="sh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1816" stop-opacity="0.55"/><stop offset="1" stop-color="#1a1816" stop-opacity="0"/></linearGradient>
  <linearGradient id="drip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26241f" stop-opacity="0.32"/><stop offset="1" stop-color="#26241f" stop-opacity="0"/></linearGradient>
  ${defs}</defs>${body}</svg>`;

/** Board-marked, stained concrete background, w × h units. */
function concreteBase(w: number, h: number, seed: number, drips = true) {
  const r = rng(seed);
  let s = `<rect width="${w}" height="${h}" fill="#a4a096"/>`;
  for (let y = 0; y < h; y += 2) {
    s += `<rect y="${y}" width="${w}" height="2" fill="${r() < 0.5 ? "#fff" : "#000"}" opacity="${f1(0.02 + 0.05 * r())}"/>`;
    s += `<rect y="${y}" width="${w}" height="0.35" fill="#4f4c46" opacity="0.3"/>`;
  }
  const n = Math.floor((w * h) / 300);
  for (let k = 0; k < n; k++)
    s += `<rect x="${f1(r() * w)}" y="${f1(r() * h * 0.9)}" width="${f1(0.6 + r() * 1.8)}" height="${f1(20 + r() * 90)}" fill="#2b2925" opacity="${f1(0.05 + 0.1 * r())}"/>`;
  if (drips) for (let k = 0; k <= h / 30; k++) s += `<rect y="${k * 30}" width="${w}" height="26" fill="url(#drip)"/>`;
  return s;
}

function facadeSvg(kind: "front" | "back") {
  const cols = kind === "front" ? FRONT : BACK;
  const r = rng(kind === "front" ? 101 : 202);
  let s = `<rect width="600" height="360" fill="#8f8b82"/>`;
  for (let f = 0; f < FLOORS; f++) {
    const y0 = (FLOORS - 1 - f) * 30;
    if (f === SHOP) {
      s += `<rect x="0" y="${y0 + 2}" width="600" height="28" fill="#9d998f"/>`;
      s += `<rect x="0" y="${y0 + 4}" width="600" height="22" fill="#2c3942"/><rect x="0" y="${y0 + 4}" width="600" height="22" fill="url(#gl)" opacity="0.75"/>`;
      for (let m = 0; m <= 600; m += 15)
        s += `<rect x="${m - 0.5}" y="${y0 + 4}" width="${m % 30 === 0 ? 1.8 : 0.9}" height="22" fill="#d7d2c3"/>`;
      s += `<rect x="0" y="${y0 + 2}" width="600" height="3" fill="#6d6a63"/><rect x="0" y="${y0 + 4}" width="600" height="8" fill="url(#sh)"/>`;
      continue;
    }
    for (let j = 0; j < NB; j++) {
      const x = j * 30;
      s += `<rect x="${x}" y="${y0 + 2}" width="30" height="28" fill="${cols[f][j]}"/>`;
      s += `<rect x="${x}" y="${y0 + 2}" width="30" height="28" fill="#000" opacity="${f1(0.03 + 0.07 * r())}"/>`;
      if (kind === "front") {
        s += `<rect x="${x + 3}" y="${y0 + 4}" width="9" height="26" fill="#e9e4d6"/>`;
        s += `<rect x="${x + 3.8}" y="${y0 + 4.8}" width="7.4" height="25" fill="url(#gl)"/>`;
        s += `<rect x="${x + 7.2}" y="${y0 + 4.8}" width="0.7" height="25" fill="#e9e4d6"/>`;
        s += `<rect x="${x + 14}" y="${y0 + 6}" width="13" height="15" fill="#e9e4d6"/>`;
        s += `<rect x="${x + 14.8}" y="${y0 + 6.8}" width="11.4" height="13.4" fill="url(#gl)"/>`;
        s += `<rect x="${x + 18.3}" y="${y0 + 6.8}" width="0.7" height="13.4" fill="#e9e4d6"/><rect x="${x + 22}" y="${y0 + 6.8}" width="0.7" height="13.4" fill="#e9e4d6"/>`;
        s += `<rect x="${x + 13}" y="${y0 + 21}" width="15" height="1.2" fill="#6d6a63"/>`;
      } else if (j % 7 === 3) {
        s += `<rect x="${x + 11}" y="${y0 + 2}" width="8" height="28" fill="#2c3942"/><rect x="${x + 12}" y="${y0 + 2}" width="6" height="28" fill="url(#gl)" opacity="0.8"/>`;
      } else {
        s += `<rect x="${x + 3}" y="${y0 + 8}" width="24" height="11" fill="#e9e4d6"/>`;
        s += `<rect x="${x + 3.8}" y="${y0 + 8.8}" width="22.4" height="9.4" fill="url(#gl)"/>`;
        for (let m = 1; m < 4; m++) s += `<rect x="${x + 3 + m * 6}" y="${y0 + 8.8}" width="0.7" height="9.4" fill="#e9e4d6"/>`;
      }
      s += `<rect x="${x}" y="${y0 + 2}" width="2" height="28" fill="#000" opacity="0.14"/>`;
      s += `<rect x="${x}" y="${y0 + 2}" width="30" height="10" fill="url(#sh)"/>`;
    }
  }
  for (let k = 0; k < 70; k++)
    s += `<rect x="${f1(r() * 600)}" y="${f1(r() * 330)}" width="${f1(0.5 + r())}" height="${f1(20 + r() * 60)}" fill="#2a2824" opacity="${f1(0.05 + 0.07 * r())}"/>`;
  return wrap(600, 360, "", s);
}

const finSvg = () => wrap(30, 360, "", concreteBase(30, 360, 5));

function muralSvg() {
  const shadow = `<g transform="translate(2.2 2.2)" stroke="#5b5852" fill="#5b5852" opacity="0.85" stroke-linecap="round" stroke-linejoin="round">`;
  const figure = (open: string) => `${open}
    <circle cx="60" cy="100" r="9"/>
    <polygon points="44,118 76,118 72,185 48,185" stroke-width="2"/>
    <path d="M72 122 L86 62" stroke-width="8" fill="none"/>
    <path d="M48 122 L40 182" stroke-width="8" fill="none"/>
    <path d="M52 185 L50 298 M68 185 L70 298" stroke-width="10" fill="none"/>
    <path d="M44 300 L56 300 M64 300 L78 300" stroke-width="6" fill="none"/></g>`;
  const ticks = (x: number, ks: number[], col: string) =>
    ks.map((k) => `<rect x="${x - 3}" y="${f1(300 - 226 * k)}" width="12" height="1.6" fill="${col}"/>`).join("");
  let s = concreteBase(120, 360, 9);
  s += `<rect x="8" y="58" width="104" height="250" fill="none" stroke="#6a675f" stroke-width="1.4" opacity="0.7"/>`;
  s += figure(shadow);
  s += figure(`<g stroke="#d3cebf" fill="#d3cebf" stroke-linecap="round" stroke-linejoin="round">`);
  s += `<rect x="14" y="74" width="6" height="226" fill="#c4452f"/>${ticks(14, [0, 0.118, 0.19, 0.31, 0.5, 0.81, 1], "#e8e0cc")}`;
  s += `<rect x="98" y="74" width="6" height="226" fill="#2f5f94"/>${ticks(98, [0, 0.19, 0.31, 0.5, 0.81, 1], "#e8e0cc")}`;
  s += `<text x="17" y="322" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="9" fill="#3a3834">113</text>`;
  s += `<text x="101" y="322" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="9" fill="#3a3834">226</text>`;
  return wrap(120, 360, "", s);
}

function towerSvg() {
  const r = rng(77);
  let s = concreteBase(60, 466, 31, false);
  for (let n = 0; n < 15; n++) {
    const yt = 466 - 30 * (n + 1);
    s += `<rect x="0" y="${yt}" width="60" height="0.7" fill="#4a4741" opacity="0.8"/>`;
    s += `<rect x="22" y="${yt + 2}" width="16" height="26" fill="#8d877b" opacity="0.4"/>`;
    s += `<rect x="10.5" y="${yt + 3}" width="5.5" height="13" fill="#d6d1c2"/><rect x="11.2" y="${yt + 4}" width="4.1" height="11" fill="#2b353c"/>`;
    s += `<rect x="43.5" y="${yt + 15}" width="5.5" height="13" fill="#d6d1c2"/><rect x="44.2" y="${yt + 16}" width="4.1" height="11" fill="#2b353c"/>`;
    if ([3, 6, 9, 12].includes(n)) s += `<rect x="20" y="${466 - 30 * n - 23}" width="20" height="22" fill="#3a3631"/><rect x="22" y="${466 - 30 * n - 21}" width="16" height="18" fill="url(#gl)" opacity="0.6"/>`;
    if (r() < 0.5) s += `<rect x="${f1(r() * 40)}" y="${yt + 4}" width="${f1(8 + r() * 12)}" height="22" fill="#000" opacity="0.05"/>`;
  }
  for (let k = 0; k < 20; k++) s += `<rect x="${f1(r() * 58)}" y="${f1(r() * 400)}" width="${f1(0.6 + r())}" height="${f1(30 + r() * 80)}" fill="#26241f" opacity="0.09"/>`;
  return wrap(60, 466, "", s);
}

function crownSvg() {
  let s = concreteBase(86, 46, 41, false);
  s += `<rect x="4" y="3" width="78" height="40" fill="#3a3732"/>`;
  for (let i = 0; i < 12; i++) s += `<rect x="5" y="${4 + i * 3.2}" width="76" height="1.8" fill="#9a968b"/>`;
  return wrap(86, 46, "", s);
}

function bridgeSvg() {
  let s = concreteBase(40, 28, 51, false);
  s += `<rect x="0" y="6" width="40" height="15" fill="#e0dbcb"/><rect x="0" y="7" width="40" height="13" fill="url(#gl)"/>`;
  for (let m = 0; m <= 40; m += 5) s += `<rect x="${m - 0.4}" y="6" width="0.9" height="15" fill="#e0dbcb"/>`;
  s += `<rect x="0" y="6" width="40" height="5" fill="url(#sh)"/>`;
  return wrap(40, 28, "", s);
}

function lobbySvg() {
  let s = concreteBase(140, 46, 61, false);
  s += `<rect x="0" y="0" width="140" height="9" fill="#bdb8aa"/><rect x="0" y="9" width="140" height="1" fill="#4f4c46"/>`;
  s += `<text x="70" y="6.6" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="bold" font-size="6" letter-spacing="1.2" fill="#2b2a27">HOUSING BLOCK 9</text>`;
  s += `<rect x="4" y="12" width="132" height="34" fill="#2c3942"/><rect x="4" y="12" width="132" height="34" fill="url(#gl)" opacity="0.55"/>`;
  for (let m = 4; m <= 136; m += 11) s += `<rect x="${m - 0.6}" y="12" width="1.2" height="34" fill="#c9c4b5"/>`;
  s += `<rect x="62" y="12" width="16" height="34" fill="#c9c4b5"/><rect x="63" y="13" width="14" height="33" fill="#2c3942"/><rect x="69.5" y="13" width="1" height="33" fill="#c9c4b5"/>`;
  for (const x of [4, 136]) s += `<rect x="${x - 3}" y="10" width="6" height="36" fill="#8f8b82"/>`;
  return wrap(140, 46, "", s);
}

// ---------------------------------------------------------------------------------------------------------------
// Concrete paint: board marks, stains, dirt at the base, moss on tops
const Q = new THREE.Vector3();
function concrete(seed: number, tone = 0) {
  return paint((p, n) => {
    let c = mix("#9d998f", "#bcb7a9", noise(p, 4.5, seed));
    c = mix(c, "#85827a", 0.45 * smoothstep(0.55, 0.85, noise(p, 1.1, seed + 7)));
    if (Math.abs(n.y) < 0.6) {
      const row = p.y / 0.2;
      const rid = Math.floor(row);
      const fr = row - rid;
      const hash = ((rid * 7919) % 17) / 17;
      c = mix(c, hash > 0.5 ? "#d6d1c4" : "#6e6b64", 0.07 + 0.05 * hash);
      if (fr < 0.14) c = mix(c, "#5a5750", 0.28);
      Q.set((p.x + p.z) * 4, p.y * 0.5, seed);
      c = mix(c, "#625f58", 0.32 * smoothstep(0.58, 0.8, noise(Q, 1, seed + 3)));
    }
    c = mix(c, "#74716a", 0.35 * (1 - smoothstep(0, 6, p.y)));
    if (n.y > 0.7) c = mix(c, "#868f72", 0.4 * smoothstep(0.45, 0.8, noise(p, 0.7, seed + 11)));
    if (n.y < -0.6) c = mix(c, "#55524c", 0.3);
    return tone ? mix(c, "#000000", tone) : c;
  });
}

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "brutalist_housing_block", paintSize: 2048 });

  const CONC = concrete(3);
  const CONC2 = concrete(8, 0.06);

  const T_FIN = svg(finSvg(), { size: 1024 });
  const T_FRONT = svg(facadeSvg("front"), { size: 1800 });
  const T_BACK = svg(facadeSvg("back"), { size: 1800 });
  const T_MURAL = svg(muralSvg(), { size: 1024 });
  const T_TOWER = svg(towerSvg(), { size: 1600 });
  const T_CROWN = svg(crownSvg(), { size: 512 });
  const T_BRIDGE = svg(bridgeSvg(), { size: 512 });
  const T_LOBBY = svg(lobbySvg(), { size: 1024 });

  type V = [number, number, number];
  const box = (w: number, h: number, d: number, color: any, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });
  const texBox = (w: number, h: number, d: number, tex: THREE.Texture, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), "#ffffff", { at: [x, y, z], texture: tex });
  const decal = (w: number, h: number, tex: THREE.Texture, at: V, dir: V) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex });
  const flatPlane = (w: number, h: number, color: string, at: V, dir: V) =>
    b.part(new THREE.PlaneGeometry(w, h), color, { at, dir, axis: "z" });

  // ------------------------------------------------------------------ core, gable, facades
  b.part(new THREE.BoxGeometry(L, FLOORS * FH, 12), CONC, { at: [0, BASE + (FLOORS * FH) / 2, 0] });
  decal(L, FLOORS * FH, T_FRONT, [0, BASE + (FLOORS * FH) / 2, 6.02], [0, 0, 1]);
  decal(L, FLOORS * FH, T_BACK, [0, BASE + (FLOORS * FH) / 2, -6.02], [0, 0, -1]);
  decal(12, FLOORS * FH, T_MURAL, [-L / 2 - 0.03, BASE + (FLOORS * FH) / 2, 0], [-1, 0, 0]);

  // ------------------------------------------------------------------ floor slabs and parapets
  for (let i = 0; i <= FLOORS; i++) {
    const y = BASE + i * FH;
    box(L + 0.6, 0.4, 16.4, SLAB[i % 3], 0, y, 0);
    if (i < FLOORS && i !== SHOP)
      for (const s of [1, -1]) box(L + 0.6, 0.7, 0.2, SLAB[(i + 1) % 3], 0, y + 0.55, s * 8.1);
  }

  // ------------------------------------------------------------------ fins between bays
  for (let j = 0; j <= NB; j++) {
    const x = -L / 2 + j * BW;
    for (const s of [1, -1]) texBox(0.3, FLOORS * FH, 2.2, T_FIN, x, BASE + (FLOORS * FH) / 2, s * 7.1);
  }

  // coloured loggia side panels (merged per colour)
  const panels = new Map<string, THREE.BufferGeometry[]>();
  const addPanel = (col: string, g: THREE.BufferGeometry) => {
    if (!panels.has(col)) panels.set(col, []);
    panels.get(col)!.push(g);
  };
  for (let f = 0; f < FLOORS; f++) {
    if (f === SHOP) continue;
    for (let j = 0; j < NB; j++) {
      const x = -L / 2 + j * BW + 0.17;
      const y = BASE + f * FH + 1.5;
      if (FRONT[f][j] !== CREAM) addPanel(FRONT[f][j], new THREE.BoxGeometry(0.04, 2.5, 2.1).translate(x, y, 7.1));
      if (BACK[f][j] !== "#d9d3c2" && BACK[f][j] !== BACK_PAL[0])
        addPanel(BACK[f][j], new THREE.BoxGeometry(0.04, 2.5, 2.1).translate(x, y, -7.1));
    }
  }
  for (const [col, gs] of panels) b.part(mergeGeometries(gs)!, col, { at: [0, 0, 0] });

  // shopping street mullions / brise-soleil
  for (let j = 0; j < NB; j++)
    box(0.18, 2.6, 0.6, SLAB[j % 3], -L / 2 + j * BW + BW / 2, BASE + SHOP * FH + 1.5, 7.4);

  // ------------------------------------------------------------------ lit windows (glow, merged)
  const warm: THREE.BufferGeometry[] = [];
  const pale: THREE.BufferGeometry[] = [];
  const Xf = (u: number) => -L / 2 + u / 10;
  const Xb = (u: number) => L / 2 - u / 10;
  const Y = (v: number) => TOP - v / 10;
  const rl = rng(301);
  for (let f = 0; f < FLOORS; f++) {
    const y0 = (FLOORS - 1 - f) * 30;
    for (let j = 0; j < NB; j++) {
      const x = j * 30;
      const pick = () => (rl() < 0.6 ? warm : pale);
      if (f === SHOP) {
        if (rl() < 0.7) pick().push(new THREE.PlaneGeometry(2.4, 1.6).translate(Xf(x + 15), Y(y0 + 13), 6.05));
        continue;
      }
      if (rl() < 0.2) pick().push(new THREE.PlaneGeometry(1.1, 1.3).translate(Xf(x + 20.5), Y(y0 + 13.5), 6.05));
      if (rl() < 0.16 && j % 7 !== 3)
        pick().push(new THREE.PlaneGeometry(2.2, 1.0).rotateY(Math.PI).translate(Xb(x + 15), Y(y0 + 13.5), -6.05));
    }
  }
  glow(b.part(mergeGeometries(warm)!, WARM, { at: [0, 0, 0] }), 0.9);
  glow(b.part(mergeGeometries(pale)!, PALE, { at: [0, 0, 0] }), 0.8);

  // ------------------------------------------------------------------ pilotis
  for (let i = 0; i <= 10; i++) {
    const x = -L / 2 + i * 6;
    for (const s of [1, -1]) {
      if (s === 1 && i === 5) continue; // lobby entrance
      const z = s * 4.5;
      b.frustumBox([x, 0, z], [x, 3.2, z], [1.5, 2.4], [0.9, 1.9], { color: CONC });
      b.frustumBox([x, 3.2, z], [x, BASE - 0.05, z], [0.9, 1.9], [1.7, 2.6], { color: CONC });
    }
  }

  // ------------------------------------------------------------------ lobby
  b.part(new THREE.BoxGeometry(14, 4.6, 6.2), CONC, { at: [0, 2.3, 0] });
  decal(14, 4.6, T_LOBBY, [0, 2.3, 3.12], [0, 0, 1]);
  decal(14, 4.6, T_LOBBY, [0, 2.3, -3.12], [0, 0, -1]);
  glow(flatPlane(1.4, 3.2, WARM, [0, 1.7, 3.15], [0, 0, 1]), 1.2);
  for (const s of [1, -1])
    for (const w of [2.9, 4.6, 6.2]) {
      void w;
    }
  for (const s of [1, -1]) {
    glow(flatPlane(3.4, 3.0, PALE, [s * 4.6, 1.75, 3.15], [0, 0, 1]), 0.9);
    for (let k = 0; k < 4; k++) box(0.1, 3.0, 0.08, STEEL, s * (3.0 + k * 1.15), 1.75, 3.2);
  }
  box(10, 0.4, 3.6, SLAB[1], 0, 4.9, 4.9); // canopy
  box(10, 0.35, 0.25, SLAB[2], 0, 5.2, 6.6);
  for (let k = 0; k < 3; k++) box(6.4 - k * 0.3, 0.17, 0.6, SLAB[k % 3], 0, 0.085 + k * 0.17, 3.4 + (2 - k) * 0.55);
  for (const s of [1, -1]) box(0.5, 0.9, 2.4, CONC, s * 3.4, 0.45, 4.6);

  // ------------------------------------------------------------------ roof
  for (const s of [1, -1]) box(L + 0.6, 1.0, 0.3, SLAB[1], 0, RY + 0.5, s * 8.05);
  for (const s of [1, -1]) box(0.3, 1.0, 16.4, SLAB[1], s * 30.45, RY + 0.5, 0);

  // nursery vault
  box(12, 2.6, 8, CONC2, -22, RY + 1.3, 0);
  const vault = new THREE.CylinderGeometry(4, 4, 12, 10, 1, false, 0, Math.PI);
  vault.rotateZ(Math.PI / 2);
  b.part(vault, CONC2, { at: [-22, RY + 2.6, 0], scale: [1, 0.55, 1], flat: true });
  box(6.4, 1.8, 0.12, OCHRE, -22, RY + 1.4, 4.06);
  box(4.6, 0.95, 0.14, "#e8e2cf", -22, RY + 1.55, 4.1);
  box(4.4, 0.8, 0.16, GLASS_D, -22, RY + 1.55, 4.12);
  for (let k = 1; k < 4; k++) box(0.08, 0.8, 0.18, "#e8e2cf", -24.2 + k * 1.1, RY + 1.55, 4.13);
  for (let k = 0; k < 5; k++) box(0.5, 0.12, 2.6, DARK, -26 + k * 2, RY + 4.0, 0).rotation.set(0, 0, 0);

  // ventilation stacks
  const stack = [
    [0, 0],
    [1.2, 0],
    [1.0, 0.4],
    [0.85, 2.4],
    [1.45, 3.1],
    [1.45, 4.0],
    [1.2, 4.0],
    [0.2, 3.6],
    [0, 3.6],
  ] as [number, number][];
  for (const x of [-11, -6.5, -2]) {
    box(3, 0.6, 3, SLAB[0], x, RY + 0.3, -4.5);
    b.lathe(stack, { at: [x, RY + 0.6, -4.5], segments: 10, color: CONC });
  }

  // pool
  const px = -9;
  const pz = 3.2;
  for (const s of [1, -1]) {
    box(8, 0.6, 0.5, SLAB[2], px, RY + 0.3, pz + s * 2.05);
    box(0.5, 0.6, 3.6, SLAB[2], px + s * 3.75, RY + 0.3, pz);
  }
  box(7, 0.1, 3.6, WATER, px, RY + 0.4, pz);

  // ramp + platform
  const ramp = [
    [0, 0],
    [9, 0],
    [9, 2.8],
    [0, 0.3],
  ] as [number, number][];
  const wall = [
    [0, 0],
    [9, 0],
    [9, 3.7],
    [0, 1.2],
  ] as [number, number][];
  b.extrude(ramp, { at: [-1, RY, 4], x: [1, 0, 0], thickness: 2.2, color: CONC });
  for (const s of [1, -1]) b.extrude(wall, { at: [-1, RY, 4 + s * 1.2], x: [1, 0, 0], thickness: 0.2, color: SLAB[1] });
  box(6, 2.8, 6, CONC, 11, RY + 1.4, 3);
  box(6.2, 0.3, 0.3, SLAB[2], 11, RY + 2.95, 5.95);
  box(6.2, 0.3, 0.3, SLAB[2], 11, RY + 2.95, 0.05);

  // lift head
  box(7, 3.4, 5, CONC, 17.5, RY + 1.7, -3.5);
  box(7.6, 0.3, 5.6, SLAB[0], 17.5, RY + 3.55, -3.5);
  box(5.6, 0.5, 0.1, GLASS_D, 17.5, RY + 2.4, -0.97);
  box(0.8, 2.2, 0.1, STEEL, 20.2, RY + 1.1, -0.97);

  // pergola
  for (const x of [20.5, 24, 27.5])
    for (const z of [1.5, 6.5]) box(0.35, 2.8, 0.35, CONC, x, RY + 1.4, z);
  for (const z of [1.5, 6.5]) box(8.0, 0.35, 0.35, CONC, 24, RY + 2.95, z);
  for (let i = 0; i < 10; i++) box(0.16, 0.2, 6.4, SLAB[i % 3], 20.2 + i * 0.85, RY + 3.2, 4);

  // water tanks
  for (const x of [25.5, 28.3]) {
    box(2.8, 0.4, 2.8, SLAB[1], x, RY + 0.2, -4.8);
    b.part(new THREE.CylinderGeometry(1.2, 1.2, 2.6, 10), CONC, { at: [x, RY + 1.7, -4.8], flat: true });
    b.part(new THREE.ConeGeometry(1.35, 0.8, 10), SLAB[2], { at: [x, RY + 3.4, -4.8], flat: true });
  }

  // ------------------------------------------------------------------ service tower
  const TX = 37;
  const SH = 46.6;
  texBox(6, SH, 6, T_TOWER, TX, SH / 2, 0);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(0.9, SH, 0.9, CONC, TX + sx * 3, SH / 2, sz * 3);
  texBox(8.4, 4.6, 8.4, T_CROWN, TX, SH + 2.3 - 0.2, 0);
  box(9.2, 0.5, 9.2, SLAB[1], TX, SH + 4.65, 0);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      box(0.5, 0.5, 0.5, DARK, TX + sx * 4.35, SH + 5.15, sz * 4.35);
      glow(b.part(new THREE.SphereGeometry(0.2, 6, 4), BEACON, { at: [TX + sx * 4.35, SH + 5.55, sz * 4.35] }), 1.5);
    }
  b.rod([TX, SH + 4.9, 0], [TX, SH + 9.2, 0], 0.07, STEEL);
  b.rod([TX - 1.2, SH + 8, 0], [TX + 1.2, SH + 8, 0], 0.04, STEEL);
  glow(b.part(new THREE.SphereGeometry(0.25, 6, 4), BEACON, { at: [TX, SH + 9.35, 0] }), 1.8);

  // bridges
  for (const k of [1, 4, 7, 10]) {
    const y = BASE + k * FH;
    texBox(4.0, 2.8, 3.0, T_BRIDGE, 32, y + 0.2 + 1.4, 0);
    box(4.1, 0.3, 3.3, SLAB[k % 3], 32, y, 0);
    box(4.1, 0.25, 3.3, SLAB[(k + 1) % 3], 32, y + 3.0, 0);
  }

  return b.root;
}
